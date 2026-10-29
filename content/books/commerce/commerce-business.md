+++
title = "The Commerce Business"
description = "How selling things works in software: the parties, the channels, how the money splits in each model, the life of an order, and the core data model."
category = "Commerce Industry"
order = 2301
part = "The Business"
tags = ["commerce", "business-models", "data-model", "orders", "catalog"]
+++

Commerce is a catalog, a customer and a promise. A phone accessory brand lists a screen protector in forty fits; a pest control subscription lists one plan that ships a different product every quarter; a distributor lists ten thousand SKUs at a price per company; a restaurant lists a burger with a choice of cheese. A buyer picks some of them, pays or promises to pay, and is owed something specific: a parcel on Thursday, a pallet at a distribution center inside a two-day window, a bag at the counter now, food at the door in thirty minutes. Between the two sit the channels the order came through (the brand's own site, Amazon, a retailer's purchase order, a store's register, a delivery app), the people and companies who make, store and move it (manufacturers, warehouses, carriers, couriers), and the money each takes on the way.

The software is hard because one order lives in several systems at once. A screen protector sold through a marketplace exists in the marketplace that took it, the seller's order management system, the warehouse that shipped it, the carrier that tracked it, the tax engine that calculated it, the payments provider that settled it and the accounting system that booked it, and each can be wrong about it in a different way. This chapter is the map the rest of the volume uses: how to read it, the parties, the channels, how the money splits in each business model, the life of an order in each, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/commerce/glossary).

## How to Read This Volume

The volume follows an order from the business that sells it to the platform that runs it, in twelve parts plus a reference:

- **The Business.** This chapter; [The Commerce Landscape](/books/commerce/commerce-landscape) (platforms, marketplaces, point of sale, order and warehouse systems, ERP, app ecosystems, market size and who owns whom); [Business Models & Unit Economics](/books/commerce/business-models) (direct to consumer, retailer and marketplace seller, wholesale, subscription, drop-ship, B2B and omnichannel, with margins from the filings); and [Choosing & Hosting a Store](/books/commerce/choosing-a-platform) (hosted, open source, headless or your own, and what running a store yourself involves).
- **Catalog and Pricing.** [Products, Variants & Bundles](/books/commerce/products-and-variants) (products versus SKUs, options, bundles, digital goods, GTINs and pack sizes); [Product Information & Content](/books/commerce/product-information) (PIMs, attributes, taxonomies, syndication, media, localization and required disclosures); [Pricing & Price Lists](/books/commerce/pricing) (price lists, currency, MAP, reference prices, unit pricing and personalized pricing law); [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards) (discount engines and stacking, gift cards and store credit); and [Site Search & Merchandising](/books/commerce/site-search-and-merchandising) (search engines, facets, ranking, collections and recommendations).
- **Storefront and Checkout.** [Storefronts](/books/commerce/storefronts) (themes and headless, caching, speed, commerce SEO, accessibility law); [Cart & Checkout](/books/commerce/cart-and-checkout) (the cart model, checkout steps, accelerated checkouts and abandonment); [Taking Payment in Commerce](/books/commerce/taking-payment) (capture at fulfillment, split shipments, BNPL, fraud guarantees); [Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties); [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts); and [Consumer Protection Online](/books/commerce/online-consumer-protection) (shipping promises, fees, dark patterns, warranties, EU withdrawal).
- **Orders, Inventory and Fulfillment.** [Order Management](/books/commerce/order-management) (order states, holds, edits, splits and sourcing); [Inventory](/books/commerce/inventory) (the quantities, available to promise, reservations, sync and counts); [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls) (inside a warehouse, 3PLs, FBA and WFS, SLAs); [Shipping & Carriers](/books/commerce/shipping-and-carriers) (rate shopping, dimensional weight, labels, tracking and delivery promises); [Returns & Exchanges](/books/commerce/returns-and-exchanges) (policies, the return lifecycle, return networks, disposition and return fraud); [Omnichannel Fulfillment](/books/commerce/omnichannel-fulfillment) (pickup, curbside, ship-from-store and store inventory accuracy); [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment) (purchase orders, lead times, forecasting, reorder points and landed cost); and [Cross-Border Commerce](/books/commerce/cross-border-commerce) (markets, merchants of record, customs data, duties and export controls).
- **Subscriptions and Memberships.** [Subscription Commerce](/books/commerce/subscription-commerce) (schedules, skip and swap, prepaid plans, dunning and churn); [Memberships & Loyalty](/books/commerce/memberships-and-loyalty) (paid memberships, points as a liability, tiers); and [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law) (ROSCA, the state laws, notices and cancellation flows).
- **Marketplaces.** [Selling on Amazon](/books/commerce/selling-on-amazon) (1P and 3P, fees, the Featured Offer, account health and the SP-API); [Retail Media & Marketplace Ads](/books/commerce/retail-media); [Walmart, eBay, Etsy, TikTok Shop & Others](/books/commerce/other-marketplaces) (each marketplace's rules, fees and payouts compared); [Multichannel Listing & Feeds](/books/commerce/multichannel-listing) (listing interfaces, category mapping, sync and feed tools); [Brand Protection](/books/commerce/brand-protection); [Running Your Own Marketplace](/books/commerce/running-a-marketplace); [Reviews & Ratings](/books/commerce/reviews-and-ratings); and [Agentic & AI Shopping](/books/commerce/agentic-commerce).
- **Wholesale and B2B.** [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution) (vendor onboarding, routing guides, chargebacks, deductions, co-op and sell-through); [EDI](/books/commerce/edi) (the transaction sets, envelopes, transport and partner testing); [B2B Commerce](/books/commerce/b2b-commerce) (company accounts, net terms, quotes, contract catalogs, approvals and punchout); and [Drop Ship & Print on Demand](/books/commerce/drop-ship-and-print-on-demand) (retailer programs, distributors, print providers, margins and liability).
- **Point of Sale and Stores.** [Point of Sale](/books/commerce/point-of-sale) (the register, tenders, hardware, offline mode and receipts); [Store Operations](/books/commerce/store-operations) (staff permissions, cash and end of day, shrink and organized retail crime); and [Restaurants & Food Service](/books/commerce/restaurants) (checks, modifiers, the kitchen, tips and service charges, online ordering).
- **On-Demand Delivery.** [The Delivery Landscape](/books/commerce/delivery-landscape) (marketplaces, logistics-only networks, first-party ordering, owned inventory and shop-and-deliver); [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs) (onboarding, menus and modifiers synced from the point of sale, availability, grocery catalogs, substitutions, in-app prices); [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching) (the delivery order's lifecycle, prep time and ETAs, assignment and batching, the handoff); [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law) (consumer fees, merchant commissions, city caps, tips); [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions) (DashPass, Uber One, Instacart+ and cancellation law); and [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud).
- **Regulated Goods.** [Alcohol, Tobacco & Age-Restricted Goods](/books/commerce/age-restricted-goods) (three-tier, direct-to-consumer shipping, vapes, firearms and age verification); [Cannabis & Hemp](/books/commerce/cannabis-and-hemp) (federal status, seed-to-sale tracking, the dispensary register); [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat) (FIFRA for sellers, state registration, hazmat and lithium shipping, Prop 65); [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls) (CPSC, certificates, recalls, FDA-regulated goods, the EU GPSR); and [Automotive Retail](/books/commerce/automotive-retail) (the dealer, F&I, titling and online car sales).
- **Marketing and Customers.** [Email, SMS & Lifecycle Marketing](/books/commerce/email-sms-and-lifecycle) (flows, segmentation, deliverability, email and texting law); [Acquisition & Attribution](/books/commerce/acquisition-and-attribution) (channels, Shopping ads, affiliates, signals after ATT, attribution, incrementality and MMM); and [Customer Service](/books/commerce/customer-service) (WISMO, helpdesks, order actions, chat and AI agents).
- **Running the Platform.** [Commerce Architecture](/books/commerce/commerce-architecture) (contexts, the order pipeline as events, idempotency, multi-tenancy, extensibility and a reference build); [ERP & Integrations](/books/commerce/erp-and-integrations) (what syncs where and who owns it); [Commerce Accounting](/books/commerce/commerce-accounting) (revenue, liabilities, COGS, landed cost and payout reconciliation); [Commerce Fraud & Abuse](/books/commerce/commerce-fraud) (card testing, bots, takeover, refund and friendly fraud); [Store Security & PCI](/books/commerce/store-security-and-pci) (e-skimming, payment page scripts, permissions and patching); [Peak Season & Drops](/books/commerce/peak-season) (capacity, load tests, waiting rooms and limited drops); [AI in Commerce](/books/commerce/ai-in-commerce) (content, search, support agents, forecasting, pricing and governance); [Commerce Metrics](/books/commerce/commerce-metrics) (definitions for conversion, margin, inventory, fulfillment and subscriptions); and [Replatforming & Migration](/books/commerce/replatforming) (what migrates, redirects, tokens, cutover and validation).
- **Reference.** A [Glossary](/books/commerce/glossary) of every term the volume defines, grouped by part.

The volume covers what commerce adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/payments/money), [Payment States & Ledgers](/docs/payments/payment-states), [Idempotency](/docs/payments/idempotency), [Subscriptions](/docs/payments/subscriptions), [Sales Tax](/docs/payments/sales-tax), [Accounting](/docs/payments/accounting), [PCI DSS](/docs/compliance/pci-dss), [Rules as Data](/docs/architecture/rules-as-data), [Events & Async Messaging](/docs/architecture/events), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Replacing Systems](/docs/architecture/replacing-systems), [Audit Trails](/docs/architecture/audit-trails) and [Addresses](/docs/fundamentals/addresses). Other volumes own topics this one leans on: [Payments](/books/payments/card-payments) for the card charge, the processor, payouts and disputes; [Field Operations](/books/field-operations/last-mile-delivery) for the last mile, proof of delivery and recurring service; [User-Generated Platforms](/books/user-generated-platforms/gig-work-and-worker-law) for marketplaces of people and services, reviews and the couriers who deliver; and [Hosting & Cloud](/books/hosting-and-cloud/managed-wordpress) for the servers a self-hosted store runs on.

The volume is US-centric, with the EU, UK and Canada where their rules bind a US seller or where a platform there does something differently. No single company is the model: the vocabulary and tables are the industry's, benchmarked across platforms (Shopify, BigCommerce, Salesforce, Adobe, commercetools, WooCommerce and the open-source stores), marketplaces, retailers and brands, and a company's own product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Brands** | Companies that design and own products and sell them under their name: a phone accessory brand, an eyewear brand, a subscription pest control brand. Many sell through several channels at once | One catalog that every channel draws from, inventory that is right everywhere, and margin they can see per channel |
| **Retailers** | Companies that buy goods and resell them in stores and online: Walmart, Target, Best Buy, Costco | Products that arrive as their routing guide says, with the documents their systems expect, at a cost that leaves a margin |
| **Marketplaces** | Operators that let other sellers list and sell to their customers: Amazon, Walmart Marketplace, eBay, Etsy, TikTok Shop, and delivery apps for restaurants | Listings that meet their rules, orders shipped on time, and the fees that pay for traffic, payments and often fulfillment |
| **Marketplace sellers** | Brands, resellers and small businesses selling on someone else's marketplace (third party, or 3P) | Listings, orders and settlements they can reconcile; account health they can protect |
| **Wholesalers and distributors** | Companies that buy from brands and sell to retailers, carriers or businesses, adding reach, credit and logistics | Purchase orders, price lists by customer, and shipments by pallet |
| **B2B buyers** | Businesses buying for their own use or resale: a contractor, a dental office, a school district | Company accounts, contract prices, purchase orders, approvals and payment on terms |
| **Consumers** | People buying for themselves, as guests, account holders or subscribers | An accurate listing, an all-in price, a delivery promise that holds, and a return or refund when something is wrong |
| **Stores and restaurants** | Physical locations that sell at a counter, a table or a curb, often also online and through delivery apps | A point of sale that keeps working, stock that is right on the shelf, and orders from every channel in one place |
| **Commerce platforms** | Software that runs stores: hosted (Shopify, BigCommerce, Wix, Squarespace), enterprise (Salesforce Commerce Cloud, Adobe Commerce, commercetools) and open source (WooCommerce, Medusa, Saleor, Sylius, Spree, PrestaShop) | Merchants who stay, apps that extend the platform, and payment volume |
| **Service providers** | Third-party logistics warehouses (3PLs), carriers (USPS, UPS, FedEx), tax engines (Avalara, Stripe Tax), payment providers, fraud vendors, subscription apps, EDI networks | Clean requests in their formats, and the order's identifiers so their records can be matched back |
| **Regulators** | The FTC, state attorneys general and tax departments, the CPSC, the EPA, city consumer agencies | Prices and fees disclosed, shipping promises kept, subscriptions cancellable, tax collected, unsafe products recalled, records on request |

Two splits shape the data model. **Merchant versus location.** A brand or restaurant group sets the catalog; each location has its own hours, stock, prices, tax rules and, often, its own legal owner. A warehouse holds stock but sells nothing at a counter; a store sells and holds stock; an online store sells and holds nothing. Inventory is counted per location, a city's fee cap applies per location, and a payout goes to whoever owns the location. **Seller versus merchant of record.** On a brand's own site the brand sells, charges the card, collects the tax and owns the refund. On a marketplace the seller is still the seller, but the marketplace charges the customer and, as a marketplace facilitator, usually collects the sales tax ([Marketplaces and Facilitator Rules](/books/hosting-and-cloud/tax#marketplaces-and-facilitator-rules)); in a 1P sale to Amazon or a wholesale sale to Best Buy, the retailer buys the goods and is the seller to the consumer, and the brand's customer is the retailer. The same product reaches the same shopper through all three, and each puts a different party on the receipt.

## Channels

An order reaches a seller through one of a handful of channels, and the channel decides who owns the customer, who sets the price, who ships and who pays whom:

| Channel | Who takes the order | Who sets the price | Who fulfills | Who pays whom |
| --- | --- | --- | --- | --- |
| **Own site or app (DTC)** | The brand's store, on a commerce platform | The brand | The brand's warehouse or a 3PL | Consumer pays the brand |
| **Marketplace, 3P** | Amazon, Walmart Marketplace, eBay, Etsy, TikTok Shop | The seller, within the marketplace's rules | The seller, or the marketplace's network (Fulfillment by Amazon, Walmart Fulfillment Services) | Consumer pays the marketplace; marketplace pays the seller net of fees |
| **Retailer, 1P (vendor)** | The retailer's purchase order to the brand | The retailer, to the consumer; a negotiated cost to the brand | The brand ships to the retailer's warehouses; the retailer ships or sells to the consumer | Retailer pays the brand on terms; consumer pays the retailer |
| **Wholesale to retailers and carriers** | A purchase order, usually by EDI | The retailer | The brand or its distributor, to distribution centers or stores | Retailer pays the brand on terms, net of deductions |
| **Distributor** | The distributor's purchase order | The distributor | The brand ships to the distributor | Distributor pays the brand |
| **B2B portal** | The brand's or distributor's B2B store, by company account | A price list per company | The seller | Company pays on terms or by card |
| **Store (POS)** | A register, a kiosk, a phone call | The merchant | Handed over at the counter, or picked up later | Customer pays the merchant |
| **Social commerce** | TikTok Shop, Instagram and similar ([Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping)) | The seller | The seller or the platform's logistics | Consumer pays the platform |
| **Delivery marketplace** | DoorDash, Uber Eats, Instacart | The merchant, sometimes with in-app markups | The platform's couriers or the merchant's drivers | Consumer pays the platform; platform pays the merchant net of commission |
| **Logistics only** | Any channel the merchant controls | The merchant | DoorDash Drive, Uber Direct, a carrier | Merchant pays per delivery |

A subscription is not a channel: it is a promise to place orders on a schedule, and its renewal orders arrive through the channel where it was sold. [The Delivery Landscape](/books/commerce/delivery-landscape#business-models) covers the delivery models' economics, [Business Models & Unit Economics](/books/commerce/business-models) the rest. For the data model the rule is that **channel is a property of the order, never of the merchant.** The same screen protector is sold the same day on the brand's site, through Amazon as a 3P listing, on a Best Buy purchase order and in a carrier's store, at four prices, and the same order can be taken by one channel and fulfilled by another.

## How the Money Splits

Every order is a bundle of separately priced lines, each with a payer and a payee. The lines differ by model, and the fees below are the published ones as of October 2026; a large seller often negotiates different terms.

### A DTC order

A consumer buys a $60 item on the brand's own Shopify store and pays shipping and tax:

| Line | Who pays | Who receives |
| --- | --- | --- |
| Item, shipping charge | Consumer | Brand |
| Sales tax | Consumer | The state, collected and remitted by the brand where it has nexus ([Sales Tax](/docs/payments/sales-tax)) |
| Card processing | Brand | The payment provider: 2.9% + 30¢ on Shopify's Basic plan with Shopify Payments, 2.25% + 30¢ on Plus; 2.9% + 30¢ on Stripe's standard pricing; 3.49% + 49¢ for PayPal Checkout |
| Third-party payment fee | Brand | Shopify, when the brand uses another provider: 2% on Basic down to 0.2% on Plus, on top of that provider's fee |
| Platform subscription | Brand | Shopify, $39 a month on Basic billed monthly, from $2,300 on Plus |
| Postage, warehouse, packaging | Brand | The carrier and the 3PL, outside the order |
| Discount | Brand | Consumer |
| Refund on return | Brand | Consumer; online purchases came back at 19.3% in NRF and Happy Returns' 2025 survey |

The brand keeps the most per order of any model and pays for everything a marketplace would otherwise bundle: traffic, payments, fraud, fulfillment and support. The cost of acquiring the customer sits outside the order entirely, which is why [Business Models & Unit Economics](/books/commerce/business-models#the-unit-economics) treats it per customer, not per order.

### A marketplace (3P) sale

The same $60 item sold by the brand on Amazon:

| Line | Who pays | Who receives |
| --- | --- | --- |
| Item, shipping charge | Consumer | Amazon, for the seller |
| Sales tax | Consumer | The state, collected by the marketplace as facilitator |
| Referral fee | Seller | Amazon: 15% of the total sales price in most categories, $0.30 minimum per item |
| Selling plan | Seller | Amazon: $39.99 a month for a Professional account, or $0.99 per item sold on Individual |
| Fulfillment fee | Seller, if it uses FBA | Amazon, per unit by size and weight, plus monthly storage |
| Advertising | Seller | Amazon, per click on Sponsored Products |
| Net proceeds | Amazon | Seller, on Amazon's settlement cycle |

Other marketplaces split the same lines at different rates: Walmart Marketplace charges no monthly fee and a 15% referral fee in most categories (8% for consumer electronics); eBay charges a 13.6% final value fee in most categories plus $0.40 an order over $10; Etsy charges $0.20 per listing, a 6.5% transaction fee and 3% + $0.25 to process a US payment. Amazon books these fees as service revenue, its "net share of revenue of items sold by third-party sellers": $172.2 billion of third-party seller services in 2025, and third-party sellers were 61% of Amazon's paid units in the fourth quarter. The seller owns the product, the price and the inventory risk; the marketplace owns the customer, the payment and the rules ([Selling on Amazon](/books/commerce/selling-on-amazon#3p-seller-central) covers the seller's side and [Running Your Own Marketplace](/books/commerce/running-a-marketplace#commissions-fees-and-payouts) the operator's).

### A 1P sale to Amazon

The brand sells the same item to Amazon as a vendor. Amazon issues a purchase order at a negotiated cost, the brand ships cases to Amazon's warehouses, and Amazon sets the retail price and sells to the consumer as the seller of record; Amazon recognizes "gross revenue from items we sell from our inventory as product sales." The brand's money is the cost on the purchase order, net of whatever allowances and deductions the vendor agreement provides. Amazon's public pages describe only the third-party program in detail; its vendor program sits behind a login, so the purchasing process above is the general shape of 1P wholesale and the size of the deductions isn't public. <!-- source-gap: amazon-vendor-terms | missing | Amazon Vendor Central purchasing process, standard terms, allowances and deductions | closes with: an Amazon-published vendor terms page, or a filing or court record quoting the standard vendor agreement | checked: 2026-10-28 -->

### A wholesale PO to a big-box retailer

A retailer such as Best Buy sends a purchase order for 1,200 units at the brand's wholesale price, payable on terms after delivery:

| Line | Who pays | Who receives |
| --- | --- | --- |
| Goods at wholesale cost | Retailer | Brand, on payment terms |
| Freight to the distribution center | Brand or retailer, by the PO's terms | The carrier |
| Compliance chargebacks (late, mislabeled, wrong advance ship notice) | Brand | Retailer, deducted from payment |
| Promotional allowances, co-op and markdown support | Brand | Retailer, deducted or invoiced |
| Retail price | Consumer | Retailer |

The retailer's gross margin is the spread between the brand's cost and the shelf price, and the filings show how thin it is across a whole store: a 22.5% gross profit rate at Best Buy for fiscal 2026, 24.2% at Walmart and 27.9% at Target for their years ended January 2026. Those are blended rates over everything each sells, not the margin on any one brand. For the brand, wholesale trades margin per unit for volume and reach: ZAGG's last annual report, for 2019, put $453.7 million of its $521.9 million net sales through the indirect channel (big-box retailers, wireless retailers, distributors and resellers), with Verizon Wireless at 17% and Best Buy at 10% of net sales ([Business Models & Unit Economics](/books/commerce/business-models#omnichannel-brands)).

### A store sale

A shopper buys the item at a register. The lines are the item, the sales tax at the store's address, any discount and the tender. Card-present processing costs less than online: Shopify charges 2.6% + 10¢ in person on Basic against 2.9% + 30¢ online, Square 2.6% + 15¢ in person against 3.3% + 30¢ for its online store, because the chip and the terminal shift fraud liability ([Why Card-Present Is Cheaper](/books/payments/card-present#why-card-present-is-cheaper)). Cash has no processing fee and its own costs ([Cash Payments](/books/payments/cash-payments)). A membership warehouse adds a line outside the order: Costco's fiscal 2026 gross margin was 11.09% of net sales, alongside $5.9 billion of membership fees.

### A subscription renewal

A subscriber's quarterly shipment renews. The renewal is a new order created on schedule, charged to the saved card without the customer present, priced at the subscription's terms; its lines are a DTC order's plus the subscription app's cut. Recharge's Starter plan charges $99 a month plus 1.49% + 19¢ per transaction and Skio charges 1% + 20¢ on orders involving a subscription, both on top of the payment provider's fee. Subscriptions carry whole businesses: Chewy's Autoship customers bought $10.5 billion, 83.3% of its net sales, in fiscal 2025 ([Subscriptions](/docs/payments/subscriptions) for renewal mechanics).

### A delivery order

A marketplace delivery order adds parties with their own lines:

| Line | Who pays | Who receives | Where it's covered |
| --- | --- | --- | --- |
| Items and modifiers | Customer | Merchant (at the in-app price) | [In-App Prices and Markups](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups) |
| Delivery fee, service fee, small-order fee | Customer | Marketplace | [Consumer Fees and All-In Prices](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices) |
| Tax | Customer | The taxing authority, collected by the marketplace or the merchant | [Sales Tax](/docs/payments/sales-tax) |
| Tip | Customer | Courier, in full | [Tips](/books/commerce/delivery-fees-and-the-law#tips) |
| Commission | Merchant | Marketplace | [Merchant Commission Tiers](/books/commerce/delivery-fees-and-the-law#merchant-commission-tiers) |
| Courier pay | Marketplace | Courier | [Minimum Pay Standards](/books/user-generated-platforms/gig-work-and-worker-law#minimum-pay-standards) |
| Membership fee | Customer | Marketplace, monthly or yearly | [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions) |
| Promotion | Marketplace or merchant | Customer, as a discount | [Promotion Abuse](/books/commerce/refunds-and-delivery-fraud#promotion-abuse) |
| Refund and error charge | Marketplace, then often merchant | Customer | [Who Pays for an Error](/books/commerce/refunds-and-delivery-fraud#who-pays-for-an-error) |

### One rule for all of them

Most of the law in this volume regulates one row of these tables: what the customer must see before checkout, what tax was collected and by whom, what a merchant may be charged, where a tip goes, what a retailer may deduct, how a subscription ends. My rule: store every order as lines, each with its kind, payer, payee and the rule, plan or agreement version that produced it, and compute every total (the customer's price, the seller's net, the platform's revenue, the retailer's deduction) as a sum over lines. A total stored without its lines can't be audited, refunded in part, reconciled against a settlement or shown to a regulator.

## The Life of an Order

The same few records move through every model; what differs is who creates them and when the money moves.

**A DTC parcel order.** A shopper builds a cart on the brand's site; the cart holds items at the prices shown and survives across sessions. Checkout validates the address, quotes shipping, calls the tax engine, and authorizes the card with an idempotency key so a retried click can't charge twice ([Idempotency](/docs/payments/idempotency)). The order is placed and passes a fraud check; inventory is committed at the warehouse chosen to ship it. A 3PL or the brand's warehouse picks, packs and buys a label; the carrier's tracking number goes on the shipment, the card is captured when the goods ship, inside the authorization's window ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)), and the shopper gets a shipping confirmation. Tracking events arrive until delivery. If the shopper returns it, a return authorization, a label, a received inspection and a refund follow, and the unit is restocked or written off.

**A marketplace (3P) sale.** The order is created in the marketplace, which has already charged the consumer and calculated the tax. The seller's system pulls it through the marketplace's API, ships it (or the marketplace's own network does, from inventory the seller sent in earlier), and confirms shipment with tracking within the marketplace's deadline. Weeks later a settlement report pays the seller the order's price less referral, fulfillment, advertising and refund lines, and the seller reconciles the payout back to orders.

**A wholesale purchase order.** A retailer sends an X12 850 Purchase Order; the brand answers with an 855 Purchase Order Acknowledgment, accepting, changing or rejecting lines. The brand ships to the retailer's distribution center on the date and carrier its routing guide sets, labels each carton, sends an 856 Ship Notice/Manifest before the truck arrives, and invoices with an 810. The retailer pays on terms, short by any deductions, and the brand disputes the ones it can. A 1P sale to Amazon runs the same loop through Amazon's vendor systems ([Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#the-order-to-cash-loop) and [EDI](/books/commerce/edi#the-transactions) cover it in depth).

**A store sale.** A cashier scans items at a register; the point of sale prices them, applies the store's tax, takes cash or a card on a terminal and prints or sends a receipt. Stock leaves the store's count at the moment of sale. The register keeps selling when the internet is down and uploads later ([Offline: Approved Isn't Paid](/books/payments/card-present#offline-approved-isn-t-paid)), and the drawer is counted at the end of the day. A buy-online, pick-up-in-store order is a DTC order whose fulfillment is a store's shelf and a pickup.

**A subscription renewal.** A scheduler creates the renewal order a few days before the shipment date, after any skip, swap or pause the subscriber made, and charges the saved card as a merchant-initiated transaction ([Stored Credentials](/books/payments/stored-credentials)). A decline starts dunning: retries on a schedule, a message to update the card, and a pause or cancellation if nothing works. A paid renewal flows into fulfillment like any DTC order.

**A delivery order.** A customer orders from a restaurant in a delivery app; the order reaches the location's point of sale and must be accepted, dispatch times a courier to arrive as the food is ready, possibly batched with a second order, and the handoff is recorded with a photo when nobody is there to receive it ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle), [Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)). The authorization is captured, the merchant is paid net of commission, the courier is paid with the tip in full, and a missing drink becomes a refund and possibly an error charge to the merchant ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud)).

Across all six, the order is one record and the movement is another: a DTC order can ship in two parcels from two warehouses, a wholesale PO in three truckloads, a store sale in a bag, a delivery order on a courier's trip that also carries someone else's. That is the order-versus-fulfillment split the data model is built on.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a Shopify variant, a BigCommerce SKU, an Amazon ASIN under a seller SKU and a DoorDash menu item are all items; a Shopify location, a DoorDash store and an Amazon fulfillment center are all locations; a Shopify fulfillment order, a commercetools delivery and an Amazon shipment are all fulfillments. The volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **merchant** | `merchants` | The business that sells: a brand, a retailer, a distributor, a restaurant group, a grocer, a franchisee under its brand |
| **brand** | `brands` | A name products are sold under; a merchant can own several |
| **location** | `locations` | A place that sells, stocks or makes goods: a store, a warehouse, a 3PL's or a marketplace's fulfillment center, an online store, a kitchen |
| **product** | `products` | What a shopper picks before choosing options: "the screen protector", with its title and options |
| **item** | `items` | Something sold and counted, once: a variant (SKU), a dish, a modifier option, a bundle, a digital good |
| **bundle component** | `bundle_components` | An item inside a bundle or kit, with its quantity |
| **location item** | `location_items` | An item as sold at one location: its in-store price and whether it's available |
| **modifier group** | `modifier_groups`, `modifier_group_options`, `item_modifier_groups` | A choice attached to an item ("choose a cheese"), with selection limits and options that are items themselves |
| **price list** | `price_lists`, `price_list_items` | Prices for a market, a currency, a customer group, a company or a channel, with quantity breaks |
| **customer** | `customers` | The person or business buying |
| **company** | `companies`, `company_contacts` | A business buyer and the people who buy for it |
| **cart** | `carts`, `cart_lines` | A purchase being built, before it is an order |
| **order** | `orders` | One purchase from one seller through one channel, with its timing, state and merchant of record |
| **order line** | `order_lines` | An item ordered, with modifiers as child lines, priced and named as sold |
| **order charge** | `order_charges` | Every non-goods line: shipping, fees, tax, tip, discounts, commissions, allowances, each with a payer and a payee |
| **payment reference** | `order_payments` | The order's authorizations, captures and refunds as rows pointing at the [Payments](/books/payments/card-payments#the-core-data-model) volume's records |
| **fulfillment** | `fulfillments`, `fulfillment_lines` | How some or all of the order's lines get to the buyer, from which location and by which provider |
| **shipment** | `shipments` | A parcel or load in a carrier's hands, with its tracking number |
| **inventory item and level** | `inventory_items`, `inventory_levels` | Whether and at what cost an item is stocked, and how many are on hand and committed at each location |
| **return** | `returns`, `return_lines` | Goods coming back, with their reason and what happens to them |
| **subscription** | `subscriptions`, `subscription_lines` | A promise to place orders on a schedule |
| **listing** | `listings` | An item offered on an external channel, under that channel's ID |
| **supplier and purchase order** | `suppliers`, `purchase_orders`, `purchase_order_lines` | Who the merchant buys from, and what it ordered |
| **document** | `documents` | An invoice, credit memo, packing slip, advance ship notice or EDI transaction, as sent or received |

The channel registry is `sales_channels`, with each location's listing on a channel in `merchant_channel_enrollments`, both from [The Delivery Landscape](/books/commerce/delivery-landscape#how-to-build-it); every channel in this volume, from a brand's own site to a retailer's EDI connection, is a row there.

Seven splits matter in every chapter:

- **Product versus item.** The product is what a shopper sees and picks options on; the item is the variant that has a SKU, a barcode, a weight, a stock count and a cost. A restaurant's dish is an item without a product; a T-shirt in five sizes and four colors is one product and twenty items. Everything that is counted, shipped or priced hangs off the item.
- **Item versus location item.** The item is defined once; the location item is that item at one place, with its in-store price and availability. A franchise brand updates a description once and every location shows it; one store runs out and only that store hides it.
- **Item versus listing.** A listing is the item on someone else's channel, under their ID (an ASIN, a Walmart item ID), with that channel's status. A listing can be suppressed while the item is fine, and two sellers can list the same ASIN.
- **Order line versus order charge.** Lines are goods, priced by the seller; charges are everything else, priced by the platform, a carrier, the law, a retailer's agreement or the customer (the tip). Keeping them apart is what lets a tax apply to the right base, a tip go to the courier untouched, a referral fee reconcile against a settlement, and a refund for one item reverse that item's price and tax without touching shipping.
- **Order versus fulfillment versus shipment.** The order is what was bought; a fulfillment is a decision to send some of its lines from one location by one provider; a shipment is a parcel or truckload with a tracking number. One order splits into fulfillments when stock sits in two warehouses; one fulfillment becomes several shipments when it doesn't fit in one box.
- **Selling order versus purchase order.** An order is something a buyer bought from this merchant, including a retailer's purchase order received over EDI (its PO number is the order's external reference). A `purchase_orders` row is the reverse: what this merchant bought from its supplier. The same 850 document is an order to the brand and a purchase order to the retailer.
- **Snapshots on the line.** An order line stores the item's name, SKU and unit price as sold, because the catalog will change tomorrow and a refund, a dispute, a deduction or a regulator asks what was sold today.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)); columns each chapter owns (menus and hours, fee plans, options and attributes, holds, carriers, memberships, issues) are added there:

```sql
CREATE TABLE merchants (                 -- the business that sells
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_id           UUID REFERENCES merchants (id),  -- a franchisee under its brand, a division
  legal_name          TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('brand', 'retailer', 'wholesaler',
                        'restaurant', 'grocery', 'convenience', 'retail', 'other')),
  payment_account_ref TEXT,              -- the payee in the Payments volume's model
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'paused',
                        'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (                    -- a name products are sold under
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  name         TEXT NOT NULL,
  UNIQUE (merchant_id, name)
);

CREATE TABLE locations (                 -- a place that sells, stocks or makes goods
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  kind         TEXT NOT NULL CHECK (kind IN ('store', 'kitchen', 'virtual_brand', 'dark_store',
                 'warehouse', 'online')),
  operator     TEXT NOT NULL DEFAULT 'merchant' CHECK (operator IN ('merchant', 'third_party',
                 'marketplace', 'supplier')),  -- a 3PL, FBA, a drop-ship supplier
  name         TEXT NOT NULL,
  address_id   UUID,                     -- the playbook's addresses table; null for 'online'
  time_zone    TEXT NOT NULL,            -- IANA, e.g. 'America/New_York'
  country      CHAR(2) NOT NULL,         -- ISO 3166-1 alpha-2
  subdivision  TEXT,                     -- ISO 3166-2; state rules resolve from here
  locality     TEXT,                     -- city; fee caps and disclosure rules resolve here
  currency     CHAR(3) NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'paused', 'closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind = 'online' OR address_id IS NOT NULL)
);

CREATE TABLE products (                  -- what a shopper picks before choosing options
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  brand_id     UUID REFERENCES brands (id),
  title        TEXT NOT NULL,
  handle       TEXT NOT NULL,            -- the URL slug
  status       TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, handle)
);

CREATE TABLE items (                     -- sold and counted, defined once
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  product_id    UUID REFERENCES products (id),  -- null for a dish or a modifier option
  kind          TEXT NOT NULL CHECK (kind IN ('prepared', 'packaged', 'modifier', 'bundle',
                  'digital', 'gift_card', 'service')),
  sku           TEXT,                    -- the merchant's stock-keeping unit
  name          TEXT NOT NULL,
  option_values JSONB NOT NULL DEFAULT '{}',  -- e.g. {"color": "black", "fit": "iPhone 17"}
  description   TEXT,
  gtin          TEXT,                    -- barcode for packaged goods; null for a dish
  sold_by       TEXT NOT NULL DEFAULT 'each' CHECK (sold_by IN ('each', 'weight')),
  tax_category  TEXT NOT NULL,           -- resolves to a rate per jurisdiction
  external_refs JSONB NOT NULL DEFAULT '{}',  -- POS, ERP and partner IDs, keyed by system
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, sku)
);

CREATE TABLE bundle_components (         -- a kit or bundle sells as one item, ships as several
  bundle_item_id    UUID NOT NULL REFERENCES items (id),
  component_item_id UUID NOT NULL REFERENCES items (id),
  quantity          INT NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (bundle_item_id, component_item_id),
  CHECK (bundle_item_id <> component_item_id)
);

CREATE TABLE location_items (            -- an item as sold at one location
  location_id  UUID NOT NULL REFERENCES locations (id),
  item_id      UUID NOT NULL REFERENCES items (id),
  price        BIGINT NOT NULL CHECK (price >= 0),  -- in-store price, minor units
  available    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (location_id, item_id)
);

CREATE TABLE modifier_groups (           -- "choose a cheese", "add extras"
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  name            TEXT NOT NULL,
  min_selections  SMALLINT NOT NULL DEFAULT 0,
  max_selections  SMALLINT,              -- null: no limit
  CHECK (max_selections IS NULL OR max_selections >= min_selections)
);

CREATE TABLE modifier_group_options (    -- each option is an item, so it has a price and stock
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  position          SMALLINT NOT NULL,
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (modifier_group_id, item_id)
);

CREATE TABLE item_modifier_groups (      -- which groups an item offers; options can nest
  item_id           UUID NOT NULL REFERENCES items (id),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups (id),
  position          SMALLINT NOT NULL,
  PRIMARY KEY (item_id, modifier_group_id)
);

CREATE TABLE price_lists (               -- prices for a market, group, company or channel
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  name         TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('base', 'sale', 'market', 'channel', 'wholesale',
                 'contract')),
  currency     CHAR(3) NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived'))
);

CREATE TABLE price_list_items (
  price_list_id    UUID NOT NULL REFERENCES price_lists (id),
  item_id          UUID NOT NULL REFERENCES items (id),
  min_quantity     INT NOT NULL DEFAULT 1 CHECK (min_quantity > 0),  -- quantity breaks
  price            BIGINT NOT NULL CHECK (price >= 0),
  compare_at_price BIGINT,               -- the "was" price, where the law allows showing it
  PRIMARY KEY (price_list_id, item_id, min_quantity)
);

CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID REFERENCES merchants (id),  -- null: a marketplace's own account holder
  kind         TEXT NOT NULL CHECK (kind IN ('person', 'business')),
  status       TEXT NOT NULL CHECK (status IN ('active', 'locked', 'closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (                 -- a business buyer: a retailer, a contractor, a school
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  name          TEXT NOT NULL,
  price_list_id UUID REFERENCES price_lists (id),  -- its contract prices, if any
  external_ref  TEXT,                    -- the ERP's customer number
  status        TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'closed'))
);

CREATE TABLE company_contacts (          -- the people who buy for a company
  company_id   UUID NOT NULL REFERENCES companies (id),
  customer_id  UUID NOT NULL REFERENCES customers (id),
  role         TEXT NOT NULL CHECK (role IN ('buyer', 'approver', 'admin')),
  PRIMARY KEY (company_id, customer_id)
);

CREATE TABLE carts (                     -- a purchase being built
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),  -- the selling location
  customer_id  UUID REFERENCES customers (id),           -- null: a guest
  company_id   UUID REFERENCES companies (id),
  currency     CHAR(3) NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('open', 'converted', 'abandoned', 'merged')),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_lines (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  cart_id     UUID NOT NULL REFERENCES carts (id),
  item_id     UUID NOT NULL REFERENCES items (id),
  quantity    NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price  BIGINT NOT NULL,           -- as shown; repriced at checkout
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (                    -- one purchase, one seller, one channel
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id        UUID NOT NULL REFERENCES locations (id),  -- the selling location
  customer_id        UUID REFERENCES customers (id),     -- null: a walk-in sale
  company_id         UUID REFERENCES companies (id),     -- a business buyer
  cart_id            UUID REFERENCES carts (id),
  subscription_id    UUID,               -- subscriptions, below: a renewal order
  channel            TEXT NOT NULL CHECK (channel IN ('marketplace', 'first_party', 'pos',
                       'phone', 'kiosk', 'wholesale')),
  channel_partner    TEXT,               -- e.g. 'amazon', 'bestbuy', 'doordash'; null for own
  external_ref       TEXT,               -- the partner's order ID or the buyer's PO number
  merchant_of_record TEXT NOT NULL DEFAULT 'merchant' CHECK (merchant_of_record IN
                       ('merchant', 'marketplace')),  -- who charged the buyer and owes the tax
  fulfillment_type   TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup',
                       'dine_in', 'shipping', 'digital')),
  timing             TEXT NOT NULL CHECK (timing IN ('asap', 'scheduled')),
  scheduled_for      TSTZRANGE,          -- the promised window for scheduled orders
  status             TEXT NOT NULL CHECK (status IN ('placed', 'accepted', 'preparing',
                       'ready', 'partially_fulfilled', 'fulfilled', 'cancelled')),
  currency           CHAR(3) NOT NULL,
  bill_to            JSONB,              -- billing address as given, snapshot
  idempotency_key    TEXT NOT NULL,
  placed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel_partner, external_ref),
  UNIQUE (idempotency_key),
  CHECK ((timing = 'scheduled') = (scheduled_for IS NOT NULL))
);

CREATE TABLE order_lines (               -- goods, priced as sold; modifiers are child lines
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  parent_line_id UUID REFERENCES order_lines (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  name           TEXT NOT NULL,          -- snapshot
  sku            TEXT,                   -- snapshot
  quantity       NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),  -- weight for sold_by = 'weight'
  unit_price     BIGINT NOT NULL,        -- snapshot, the channel's price
  amount         BIGINT NOT NULL,        -- quantity x unit_price, rounded once
  status         TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'substituted',
                   'unavailable', 'cancelled', 'returned', 'refunded'))
);

CREATE TABLE order_charges (             -- everything that isn't goods
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID NOT NULL REFERENCES orders (id),
  order_line_id UUID REFERENCES order_lines (id),  -- null: applies to the whole order
  kind          TEXT NOT NULL CHECK (kind IN ('shipping_fee', 'delivery_fee', 'service_fee',
                  'small_order_fee', 'regulatory_fee', 'tax', 'duty', 'tip', 'discount',
                  'commission', 'referral_fee', 'fulfillment_fee', 'processing_fee',
                  'allowance', 'chargeback_deduction')),
  payer         TEXT NOT NULL CHECK (payer IN ('customer', 'merchant', 'platform')),
  payee         TEXT NOT NULL CHECK (payee IN ('merchant', 'platform', 'courier', 'authority',
                  'customer')),
  amount        BIGINT NOT NULL,         -- positive; a discount is paid to the customer
  rule_ref      TEXT,                    -- the fee plan, tax rule, promotion or agreement
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_payments (            -- pointers into the Payments volume's records
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id     UUID NOT NULL REFERENCES orders (id),
  kind         TEXT NOT NULL CHECK (kind IN ('authorization', 'capture', 'refund', 'credit')),
  amount       BIGINT NOT NULL CHECK (amount > 0),
  payment_ref  TEXT NOT NULL,            -- the processor's, marketplace's or ledger's ID
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fulfillments (              -- some of the order's lines, from one place, by one provider
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID NOT NULL REFERENCES orders (id),
  location_id   UUID REFERENCES locations (id),  -- where it leaves from
  kind          TEXT NOT NULL CHECK (kind IN ('delivery', 'pickup', 'dine_in', 'shipping',
                  'digital')),
  provider      TEXT NOT NULL CHECK (provider IN ('merchant', 'marketplace_network',
                  'logistics_network', 'carrier', 'third_party_warehouse', 'supplier')),
  provider_name TEXT,                    -- e.g. 'doordash_drive', 'amazon_mcf', a 3PL
  provider_ref  TEXT,                    -- the provider's delivery or fulfillment ID
  dropoff       JSONB,                   -- address and instructions as given, snapshot
  status        TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'picked_up',
                  'shipped', 'delivered', 'failed', 'cancelled', 'returned')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fulfillment_lines (         -- which lines, and how many, this fulfillment carries
  fulfillment_id UUID NOT NULL REFERENCES fulfillments (id),
  order_line_id  UUID NOT NULL REFERENCES order_lines (id),
  quantity       NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (fulfillment_id, order_line_id)
);

CREATE TABLE shipments (                 -- a parcel or load in a carrier's hands
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  fulfillment_id  UUID NOT NULL REFERENCES fulfillments (id),
  carrier         TEXT NOT NULL,         -- 'usps', 'ups', 'fedex', an LTL carrier
  service         TEXT,                  -- the carrier's service level
  tracking_number TEXT,
  status          TEXT NOT NULL CHECK (status IN ('label_created', 'in_transit', 'delivered',
                    'exception', 'returned_to_sender')),
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  UNIQUE (carrier, tracking_number)
);

CREATE TABLE inventory_items (           -- whether and at what cost an item is stocked
  item_id      UUID PRIMARY KEY REFERENCES items (id),
  tracked      BOOLEAN NOT NULL DEFAULT TRUE,  -- false: a dish, a service, a made-to-order item
  unit_cost    BIGINT,                   -- current cost, minor units; history in purchasing
  cost_currency CHAR(3)
);

CREATE TABLE inventory_levels (          -- counts per item per location
  item_id      UUID NOT NULL REFERENCES inventory_items (item_id),
  location_id  UUID NOT NULL REFERENCES locations (id),
  on_hand      INT NOT NULL DEFAULT 0,   -- physically there
  committed    INT NOT NULL DEFAULT 0 CHECK (committed >= 0),  -- sold, not yet shipped
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (item_id, location_id)
);

CREATE TABLE returns (                   -- goods coming back
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  method      TEXT NOT NULL CHECK (method IN ('mail', 'drop_off', 'in_store', 'returnless')),
  status      TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'in_transit', 'received',
                'closed', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE return_lines (
  return_id     UUID NOT NULL REFERENCES returns (id),
  order_line_id UUID NOT NULL REFERENCES order_lines (id),
  quantity      NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  reason        TEXT NOT NULL,           -- a code, not free text
  disposition   TEXT CHECK (disposition IN ('restock', 'refurbish', 'liquidate', 'destroy',
                  'return_to_vendor')),  -- set when received
  PRIMARY KEY (return_id, order_line_id)
);

CREATE TABLE subscriptions (             -- a promise to place orders on a schedule
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id        UUID NOT NULL REFERENCES locations (id),  -- the selling location
  customer_id        UUID NOT NULL REFERENCES customers (id),
  channel            TEXT NOT NULL,      -- where it was sold; renewals inherit it
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'past_due',
                       'cancelled', 'expired')),
  interval_unit      TEXT NOT NULL CHECK (interval_unit IN ('day', 'week', 'month', 'year')),
  interval_count     SMALLINT NOT NULL CHECK (interval_count > 0),
  next_order_at      TIMESTAMPTZ,        -- null when paused or ended
  payment_method_ref TEXT,               -- a stored credential in the Payments volume
  ship_to            JSONB,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at           TIMESTAMPTZ
);

CREATE TABLE subscription_lines (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      BIGINT                 -- null: the current price, less the plan's discount
);

CREATE TABLE listings (                  -- an item on an external channel, under its ID
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id              UUID NOT NULL REFERENCES items (id),
  channel_id           TEXT NOT NULL REFERENCES sales_channels (id),
  external_listing_ref TEXT,             -- an ASIN, a Walmart item ID, an eBay item number
  status               TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'active',
                         'suppressed', 'ended')),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel_id, item_id)
);

CREATE TABLE suppliers (                 -- who the merchant buys from
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('manufacturer', 'distributor', 'drop_ship',
                  'print_on_demand')),
  currency      CHAR(3) NOT NULL,
  payment_terms TEXT,                    -- e.g. 'net_30'
  status        TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'closed'))
);

CREATE TABLE purchase_orders (           -- what this merchant ordered from a supplier
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  supplier_id    UUID NOT NULL REFERENCES suppliers (id),
  ship_to_id     UUID NOT NULL REFERENCES locations (id),
  number         TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'acknowledged',
                   'partially_received', 'received', 'closed', 'cancelled')),
  currency       CHAR(3) NOT NULL,
  expected_at    DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, number)
);

CREATE TABLE purchase_order_lines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  quantity_ordered  INT NOT NULL CHECK (quantity_ordered > 0),
  quantity_received INT NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost         BIGINT NOT NULL CHECK (unit_cost >= 0)
);

CREATE TABLE documents (                 -- business documents as sent or received
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  kind              TEXT NOT NULL CHECK (kind IN ('invoice', 'credit_memo', 'packing_slip',
                      'purchase_order', 'po_acknowledgment', 'po_change', 'ship_notice',
                      'inventory_advice', 'product_activity', 'receipt', 'bill_of_lading',
                      'commercial_invoice')),
  direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  counterparty      TEXT NOT NULL,       -- a trading partner, supplier or customer ID
  number            TEXT NOT NULL,       -- the document's own number
  order_id          UUID REFERENCES orders (id),
  purchase_order_id UUID REFERENCES purchase_orders (id),
  fulfillment_id    UUID REFERENCES fulfillments (id),
  format            TEXT NOT NULL CHECK (format IN ('pdf', 'x12', 'edifact', 'json', 'csv')),
  content_ref       TEXT NOT NULL,       -- object storage key; the bytes as exchanged
  issued_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (kind, direction, counterparty, number)
);
```

Design notes:

- **Location is where rules resolve.** Fee caps are per city, disclosure laws per state, store tax per jurisdiction, time per zone: `locations.country`, `subdivision`, `locality` and `time_zone` are what [Rules as Data](/docs/architecture/rules-as-data) looks up. An online store is a location with `kind = 'online'` and no address: it sells and holds nothing, and tax on its orders resolves from the ship-to address instead. A virtual brand (a delivery-only menu cooked in another restaurant's kitchen) is a location of its own merchant whose address is the kitchen's.
- **Stock lives where it is, whoever runs the building.** A 3PL's warehouse, an Amazon fulfillment center holding the seller's units and a drop-ship supplier are locations with `operator` set; inventory is counted there and fulfillments leave from there. The seller doesn't control their counts directly, which is why [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl) reconciles them.
- **Available is a computation.** `on_hand - committed` at a location, less safety stock and reservations, is what a channel may sell; storing "available" as a column invites drift ([Reservations & Holds](/docs/architecture/reservations-and-holds)). `location_items.available` stays as the switch for places nobody counts, such as a kitchen that 86es a dish.
- **Cost is not price.** `inventory_items.unit_cost` is what the merchant paid; prices live on location items, price lists and the delivery volume's `channel_prices`. Cost is confidential and changes with every receipt, so it never sits on the catalog row a storefront reads.
- **Modifier options and bundle components are items.** A modifier option has a price, a stock level and its own modifiers; a bundle component has a SKU and a count in the warehouse. Making both items gives them all of that, and lets a kit sell as one line and ship as its parts.
- **External IDs are a map, not columns.** Every item carries POS, ERP and marketplace IDs in `external_refs` keyed by system; listings carry the channel's own ID; the `(channel_partner, external_ref)` uniqueness on orders is how the same marketplace order or retailer PO injected twice is caught.
- **No tenant above merchants, unless you sell software.** A brand or a marketplace is one operator, and the merchant is the unit of scope. A commerce platform, point-of-sale vendor or ordering vendor selling to many merchants adds a tenant above merchants exactly as [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies) describes.
- **Money is the Payments model.** `order_payments` points at authorizations, captures and refunds in the [Payments](/books/payments/card-payments#the-core-data-model) volume; payouts are that volume's [Payouts & Settlement](/books/payments/payouts-and-settlement); a dispute is its own object ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)). Marketplace settlements and retailer remittances are documents and charges here, reconciled to orders.
- **A subscription is a recurring promise, wherever it lives.** A Commerce `subscriptions` row, a delivery app's membership ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it)) and a Field Operations [service agreement](/books/field-operations/service-agreements) are the same shape: a schedule, terms, a stored payment method and a renewal. The difference is what each renewal produces (an order, a fee waiver, a visit), and the same renewal and cancellation law applies to all three ([Subscriptions](/docs/payments/subscriptions#the-law-of-automatic-renewal)).
- **Documents are kept as exchanged.** An EDI 856 or a retailer's remittance is evidence in a deduction dispute; storing the bytes as received, with a parsed copy in the owning tables, is what makes a dispute winnable.
- **Emit life-cycle events.** `order.placed`, `order.cancelled`, `fulfillment.created`, `shipment.shipped`, `shipment.delivered`, `return.received`, `inventory_level.changed`, `subscription.renewed` and the delivery events are what fulfillment, notifications, channels, accounting and reporting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine. Every table and view a chapter creates is listed here, linked to that chapter's How to Build It:

| Chapter | Extends | Adds |
| --- | --- | --- |
| [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it) | `merchants`, `external_refs` | `connected_systems` |
| [Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it) | `order_charges`, `inventory_items` | `item_costs`, `acquisition_spend`, `order_margin` (view) |
| [Choosing & Hosting a Store](/books/commerce/choosing-a-platform#how-to-build-it) | `connected_systems` | `export_runs` |
| [Products, Variants & Bundles](/books/commerce/products-and-variants#how-to-build-it) | `products`, `items`, `bundle_components` | `product_options`, `product_option_values`, `item_option_values`, `item_identifiers`, `pack_sizes`, `digital_deliveries` |
| [Product Information & Content](/books/commerce/product-information#how-to-build-it) | `products`, `items` | `attributes`, `attribute_values`, `categories`, `item_categories`, `attribute_requirements`, `media_assets`, `product_media`, `localized_content` |
| [Pricing & Price Lists](/books/commerce/pricing#how-to-build-it) | `price_lists`, `price_list_items`, `companies` | `price_list_assignments`, `price_history`, `map_policies`, `map_policy_items` |
| [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#how-to-build-it) | `order_charges`, `promotion_redemptions` | `promotions`, `discount_codes`, `discount_allocations`, `gift_cards`, `store_credit_accounts`, `gift_card_transactions` |
| [Site Search & Merchandising](/books/commerce/site-search-and-merchandising#how-to-build-it) | `products`, `items` | `collections`, `collection_items`, `search_synonyms`, `merchandising_rules` |
| [Storefronts](/books/commerce/storefronts#how-to-build-it) | `locations` (online) | `storefronts`, `url_redirects` |
| [Cart & Checkout](/books/commerce/cart-and-checkout#how-to-build-it) | `carts`, `cart_lines`, `orders` | `checkouts`, `shipping_quotes` |
| [Taking Payment in Commerce](/books/commerce/taking-payment#how-to-build-it) | `order_payments`, `fulfillments` | `capture_plans`, `authorization_balances` (view) |
| [Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties#how-to-build-it) | `order_charges`, `items.tax_category` | `tax_registrations`, `exemption_certificates`, `tax_calculations` |
| [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#how-to-build-it) | `customers` | `customer_addresses`, `marketing_consents`, `customer_merges`, `privacy_requests`, `customer_segments` |
| [Consumer Protection Online](/books/commerce/online-consumer-protection#how-to-build-it) | `orders`, `fulfillments`, `order_lines` | `shipping_promises`, `delay_notices`, `warranty_terms` |
| [Order Management](/books/commerce/order-management#how-to-build-it) | `orders`, `fulfillments`, `order_status_changes`, `order_lines` | `order_holds`, `order_edits`, `sourcing_rules`, `sourcing_decisions` |
| [Inventory](/books/commerce/inventory#how-to-build-it) | `inventory_items`, `inventory_levels` | `inventory_movements`, `inventory_reservations`, `safety_stock_rules`, `cycle_counts`, `cycle_count_lines` |
| [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#how-to-build-it) | `locations`, `fulfillments` | `fulfillment_provider_accounts`, `fulfillment_provider_slas`, `inbound_transfers`, `inbound_transfer_lines`, `pick_tasks` |
| [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it) | `shipments` | `carrier_accounts`, `packages`, `rate_quotes`, `tracking_events` |
| [Returns & Exchanges](/books/commerce/returns-and-exchanges#how-to-build-it) | `returns`, `return_lines`, `orders` | `return_policies`, `return_inspections`, `return_amounts`, `exchanges` |
| [Omnichannel Fulfillment](/books/commerce/omnichannel-fulfillment#how-to-build-it) | `fulfillments`, `inventory_levels` | `store_fulfillment_capacity`, `store_capacity_overrides`, `pickup_slots`, `store_buffers`, `short_picks` |
| [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#how-to-build-it) | `suppliers`, `purchase_orders`, `purchase_order_lines` | `supplier_items`, `receipts`, `receipt_lines`, `landed_cost_allocations`, `reorder_rules`, `vendor_returns` |
| [Cross-Border Commerce](/books/commerce/cross-border-commerce#how-to-build-it) | `price_lists` (market), `items`, `orders` | `markets`, `item_customs`, `customs_declarations`, `party_screenings` |
| [Subscription Commerce](/books/commerce/subscription-commerce#how-to-build-it) | `subscriptions`, `subscription_lines` | `subscription_plans`, `subscription_changes`, `subscription_renewals`, `billing_attempts`, `prepaid_periods` |
| [Memberships & Loyalty](/books/commerce/memberships-and-loyalty#how-to-build-it) | `membership_plans`, `memberships` | `membership_cardholders`, `loyalty_programs`, `loyalty_tiers`, `loyalty_accounts`, `loyalty_ledger`, `loyalty_tier_status`, `deferred_fee_schedules` |
| [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law#how-to-build-it) | `subscriptions`, `membership_cancellations`, the playbook's `renewal_consents` | `renewal_law_rules`, `renewal_notices`, `subscription_cancellations` |
| [Selling on Amazon](/books/commerce/selling-on-amazon#how-to-build-it) | `listings`, `orders`, `documents` | `offer_observations`, `marketplace_settlements`, `settlement_lines`, `account_health_events`, `marketplace_order_contacts`, `referral_fee_tiers` |
| [Retail Media & Marketplace Ads](/books/commerce/retail-media#how-to-build-it) | `listings`, `acquisition_spend`, `order_charges` | `ad_campaigns`, `ad_campaign_listings`, `ad_spend_daily`, `attributed_sales` |
| [Walmart, eBay, Etsy, TikTok Shop & Others](/books/commerce/other-marketplaces#how-to-build-it) | `listings`, `sales_channels` | `marketplace_fee_schedules`, `listing_requirements`, `channel_approvals`, `performance_standards` |
| [Multichannel Listing & Feeds](/books/commerce/multichannel-listing#how-to-build-it) | `listings` | `channel_category_mappings`, `feeds`, `feed_runs`, `listing_errors` |
| [Brand Protection](/books/commerce/brand-protection#how-to-build-it) | `brands`, `listings`, `map_policies` | `trademarks`, `brand_registrations`, `authorized_resellers`, `infringement_reports`, `map_violations` |
| [Running Your Own Marketplace](/books/commerce/running-a-marketplace#how-to-build-it) | `merchants`, `orders`, `order_charges` | `seller_agreements`, `seller_verifications`, `seller_offers`, `commission_rules` |
| [Reviews & Ratings](/books/commerce/reviews-and-ratings#how-to-build-it) | `products`, `order_lines` | `review_requests`, `reviews`, `review_media`, `review_moderation_actions` |
| [Agentic & AI Shopping](/books/commerce/agentic-commerce#how-to-build-it) | `carts`, `orders`, `sales_channels` | `agent_clients`, `agent_checkout_sessions` |
| [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#how-to-build-it) | `companies`, `orders`, `documents` | `trading_partners`, `routing_guides`, `compliance_charge_rules`, `po_delivery_measures`, `remittances`, `deductions`, `deduction_disputes`, `coop_agreements`, `coop_claims`, `sell_through_reports` |
| [EDI](/books/commerce/edi#how-to-build-it) | `documents` | `edi_partner_maps`, `edi_interchanges`, `functional_acks`, `sscc_allocations` |
| [B2B Commerce](/books/commerce/b2b-commerce#how-to-build-it) | `companies`, `company_contacts`, `price_lists`, `price_list_assignments`, `orders` | `company_locations`, `payment_terms`, `credit_limits`, `quotes`, `quote_lines`, `approval_rules`, `approval_requests`, `punchout_sessions` |
| [Drop Ship & Print on Demand](/books/commerce/drop-ship-and-print-on-demand#how-to-build-it) | `suppliers`, `fulfillments`, `locations`, `order_lines` | `supplier_routes`, `supplier_stock_feeds`, `print_files`, `item_print_files` |
| [Point of Sale](/books/commerce/point-of-sale#how-to-build-it) | `orders`, `order_payments`, `locations` | `pos_devices`, `tenders`, `order_voids`, `sales_receipts` |
| [Store Operations](/books/commerce/store-operations#how-to-build-it) | `locations`, `inventory_levels`, `inventory_movements` | `staff`, `staff_roles`, `staff_role_assignments`, `cash_drawers`, `register_sessions`, `cash_movements`, `drawer_counts`, `manager_approvals`, `shrink_events` |
| [Restaurants & Food Service](/books/commerce/restaurants#how-to-build-it) | `orders`, `order_lines`, `order_charges`, `items`, modifiers | `dining_tables`, `table_sessions`, `checks`, `check_lines`, `kitchen_stations`, `item_stations`, `kitchen_tickets`, `kitchen_ticket_lines`, `tip_pools`, `tip_distributions` |
| [The On-Demand Delivery Landscape](/books/commerce/delivery-landscape#how-to-build-it) | `merchants`, `locations` | `sales_channels`, `merchant_channel_enrollments`, `delivery_providers`, `order_contribution` (view) |
| [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#how-to-build-it) | `merchants`, `locations`, `items`, `location_items`, modifiers, `order_lines` | `listing_agreements`, `location_hours`, `location_pauses`, `menus`, `menu_hours`, `menu_categories`, `menu_category_items`, `channel_prices`, `menu_publications`, `availability_changes`, `catalog_imports`, `substitution_preferences`, `line_substitutions` |
| [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it) | `orders`, `fulfillments` | `order_status_changes`, `prep_estimates`, `fulfillment_events`, `batches`, `batch_stops`, `delivery_offers` |
| [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it) | `order_charges`, `locations` | `commission_plans`, `fee_rules`, `price_displays`, `merchant_statements` |
| [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it) | `customers`, `order_charges` | `membership_plans`, `memberships`, `membership_periods`, `membership_cancellations`, `benefit_applications` |
| [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it) | `orders`, `order_lines`, `customers` | `order_issues`, `issue_lines`, `issue_resolutions`, `error_charges`, `error_charge_disputes`, `identity_links`, `promotion_redemptions` |
| [Alcohol, Tobacco & Age-Restricted Goods](/books/commerce/age-restricted-goods#how-to-build-it) | `items`, `orders`, `fulfillments` | `restricted_categories`, `item_restricted_categories`, `seller_licenses`, `shipping_eligibility_rules`, `age_verifications`, `pact_shipment_reports` |
| [Cannabis & Hemp](/books/commerce/cannabis-and-hemp#how-to-build-it) | `inventory_movements`, `order_lines` | `compliance_tags`, `state_reporting_events`, `purchase_limits`, `item_limit_equivalents`, `lab_certificates` |
| [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat#how-to-build-it) | `items`, `shipments`, `documents` | `product_registrations`, `hazmat_classifications`, `prop65_warnings`, `safety_data_sheets`, `sds_deliveries` |
| [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls#how-to-build-it) | `items`, `documents` | `safety_rules`, `item_safety_rules`, `certificates`, `regulatory_listings`, `safety_incidents`, `recalls`, `recall_items`, `recall_notifications` |
| [Automotive Retail](/books/commerce/automotive-retail#how-to-build-it) | `items`, `orders` | `vehicles`, `deals`, `trade_ins`, `fi_products`, `deal_fi_products`, `vehicle_documents`, `title_registrations` |
| [Email, SMS & Lifecycle Marketing](/books/commerce/email-sms-and-lifecycle#how-to-build-it) | `customers`, `marketing_consents` | `campaigns`, `flows`, `flow_steps`, `flow_enrollments`, `message_sends`, `suppressions` |
| [Acquisition & Attribution](/books/commerce/acquisition-and-attribution#how-to-build-it) | `acquisition_spend`, `orders` | `touchpoints`, `attributions`, `affiliates`, `affiliate_conversions`, `conversion_uploads`, `lift_tests` |
| [Customer Service](/books/commerce/customer-service#how-to-build-it) | `orders`, `order_issues` | `tickets`, `ticket_messages`, `ticket_orders`, `ticket_actions` |
| [Commerce Architecture: Building It Yourself](/books/commerce/commerce-architecture#how-to-build-it) | every table, the playbook's `outbox_events` | `app_installations`, `webhook_subscriptions`, `webhook_deliveries`, `inbound_events` |
| [ERP & Integrations](/books/commerce/erp-and-integrations#how-to-build-it) | `connected_systems`, `external_refs` | `field_ownership`, `record_mappings`, `sync_jobs`, `sync_items` |
| [Commerce Accounting](/books/commerce/commerce-accounting#how-to-build-it) | `order_charges`, `order_payments`, `inventory_items`, `inventory_movements` | `journal_entries`, `journal_lines`, `inventory_cost_layers`, `cost_layer_draws`, `deferred_revenue_schedules`, `payout_reconciliations` |
| [Commerce Fraud & Abuse](/books/commerce/commerce-fraud#how-to-build-it) | `orders`, `identity_links`, the playbook's `risk_decisions` | `bot_signals`, `risk_labels` |
| [Store Security & PCI](/books/commerce/store-security-and-pci#how-to-build-it) | `locations` (online), `staff` | `payment_page_scripts`, `script_change_events`, `admin_access_grants` |
| [Peak Season & Drops](/books/commerce/peak-season#how-to-build-it) | `items`, `inventory_levels`, `inventory_reservations` | `drops`, `drop_allocations`, `drop_entries`, `waiting_room_tokens` |
| [AI in Commerce](/books/commerce/ai-in-commerce#how-to-build-it) | `attribute_values`, `localized_content`, `media_assets` | `ai_generations`, `ai_evaluations` |
| [Commerce Metrics](/books/commerce/commerce-metrics#how-to-build-it) | `orders`, `order_lines`, `returns`, `inventory_movements`, `order_margin` | `storefront_sessions`, `metric_definitions`, `metric_values` |
| [Replatforming & Migration](/books/commerce/replatforming#how-to-build-it) | `export_runs`, `url_redirects`, `record_mappings` | `migration_batches`, `token_migrations`, `migration_checks` |

Three decisions keep the map one model rather than several:

- **Names that look alike are different records.** `receipts` and `receipt_lines` are goods received against a purchase order ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#how-to-build-it)); the receipt a register hands a shopper is `sales_receipts` ([Point of Sale](/books/commerce/point-of-sale#how-to-build-it)). `rate_quotes` are the carrier rates bought for a label ([Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it)); `shipping_quotes` are what the customer was quoted at checkout ([Cart & Checkout](/books/commerce/cart-and-checkout#how-to-build-it)), and the gap between them is the order's shipping margin.
- **One concept, one table, reused.** Fraud decisions extend the playbook's `risk_decisions` rather than adding a commerce copy ([Commerce Fraud & Abuse](/books/commerce/commerce-fraud#how-to-build-it)). A migration's crosswalk from old IDs to new is ERP & Integrations' `record_mappings`, with the old platform as the system ([Replatforming & Migration](/books/commerce/replatforming#how-to-build-it)). A cancellation request is a `subscription_cancellations` row, with the delivery memberships' `membership_cancellations` its counterpart ([Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law#how-to-build-it)). Deferred revenue is one `deferred_revenue_schedules` row per obligation, pointing at the membership's `deferred_fee_schedules` row or the subscription's `prepaid_periods` row instead of copying either ([Commerce Accounting](/books/commerce/commerce-accounting#how-to-build-it)).
- **Orders reach their merchant through the location.** `orders` carries no `merchant_id`: every order has a selling `location_id`, and `locations.merchant_id` names the merchant, so a per-merchant query joins through `locations`. Carts and subscriptions resolve the same way, through their own `location_id`.

## Auditing

The records in this chapter are the ones customers, retailers, marketplaces, tax authorities, regulators and courts ask about later:

- **What was sold, as sold.** Every order line with its name, SKU, price, modifiers and channel at the moment of sale, so a refund, a deduction or a pricing complaint is judged against what the buyer actually bought.
- **What was charged, line by line.** Every shipping charge, fee, tax, tip, discount, commission, referral fee and allowance with its payer, payee and the rule, plan or agreement that produced it; a city regulator checking a cap, a state auditor checking tax and a seller checking a settlement all read these rows.
- **Who moved the goods.** Every fulfillment with its location, provider, lines and shipments, and every shipment with its carrier and tracking number, so a missing parcel or a short-shipped PO can be placed.
- **What was exchanged with partners.** Every purchase order, acknowledgment, ship notice, invoice and remittance as received or sent, kept as bytes.
- **Every money movement.** Authorizations, captures, refunds, credits, settlements and payouts as append-only records tied to the order ([Payment States & Ledgers](/docs/payments/payment-states)).

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Separate merchant from location,** and resolve hours, stock, prices, tax and payees at the location; treat an online store, a 3PL and a marketplace warehouse as locations too.
- **Separate product from item,** and hang SKU, barcode, stock, cost and price off the item.
- **Make channel a property of the order,** with the partner's order ID or the buyer's PO number unique per partner, and keep the merchant of record on the order.
- **Store every non-goods amount as a charge line** with a payer, a payee and the rule that produced it, and compute totals from lines.
- **Keep fulfillments and shipments separate from the order,** so splits, providers and carriers can change without the order changing.
- **Compute available stock** from on hand and committed per location, never store it.
- **Keep the two directions of purchase orders apart:** a retailer's PO is your order; your PO is a purchase order to a supplier.
- **Snapshot names, SKUs and prices on order lines,** and keep partner documents as exchanged.
- **Point at the Payments model** for every authorization, capture, refund and payout instead of rebuilding it.
- **Emit life-cycle events** for orders, fulfillments, shipments, inventory and subscriptions, and let every other system consume them.

## References

**Filings**

- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), gross revenue for items sold from inventory and net revenue for third-party sales, net sales by group including third-party seller services
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), third-party sellers' 61% of paid units in the fourth quarter
- [Best Buy: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/764478/000076447826000009/bby-20260131.htm), the 22.5% gross profit rate
- [Walmart: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm), the 24.2% consolidated gross profit rate
- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), the 27.9% gross margin rate
- [Costco: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/909832/000090983226000093/cost-20260830.htm), gross margin of 11.09% of net sales and membership fees
- [ZAGG Inc: Form 10-K for 2019](https://www.sec.gov/Archives/edgar/data/1296205/000129620520000040/zagg-20191231.htm), net sales by channel and customers over 10% of net sales
- [Chewy: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1766502/000176650226000034/chwy-20260201.htm), Autoship customer sales and their share of net sales
- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), the Marketplace and Drive white-label delivery fulfillment
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), the Delivery segment and Uber Direct

**Published fees**

- [Shopify: Pricing](https://www.shopify.com/pricing), plan prices, online and in-person card rates and the fee for third-party payment providers
- [Stripe: Pricing](https://stripe.com/pricing), standard online card pricing
- [PayPal: Merchant fees](https://www.paypal.com/us/business/paypal-business-fees), the PayPal Checkout rate and fixed fee
- [Square: Our fees](https://squareup.com/us/en/payments/our-fees), in-person and online store rates
- [Amazon: Selling plans and fees](https://sell.amazon.com/pricing), the Professional and Individual plans and referral fees
- [Walmart Marketplace: Referral fees](https://marketplace.walmart.com/referral-fees/), no monthly fee and referral fees by category
- [eBay: Selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822), the final value fee and per-order fee
- [Etsy: Fees and Payments Policy](https://help.etsy.com/hc/en-us/articles/360035902374-Fees-and-Payments-Policy), listing and transaction fees
- [Etsy: Payment processing fees](https://help.etsy.com/hc/en-us/articles/115015628847), the US processing fee
- [Recharge: Pricing](https://getrecharge.com/pricing/), the Starter plan fee and transaction fee
- [Skio: Pricing](https://skio.com/pricing), the transaction fee on subscription orders

**Standards and research**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the 810, 850, 855 and 856 transaction sets and their names
- [NRF: Consumers expected to return nearly $850 billion in merchandise in 2025](https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025), the 19.3% online return rate

**Platforms**

- [Olo: Rails](https://www.olo.com/rails), syncing menus, pricing, location data and item availability with marketplaces
- [Olo: Dispatch](https://www.olo.com/dispatch), delivery from a restaurant's own site through a network of delivery service providers
