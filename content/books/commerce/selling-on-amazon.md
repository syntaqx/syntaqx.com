+++
title = "Selling on Amazon"
description = "Amazon 1P and 3P: Vendor Central POs, Seller Central fees, FBA, the Featured Offer, account health, returns, SP-API roles and PII rules, and FTC v. Amazon."
category = "Commerce Industry"
order = 2327
part = "Marketplaces"
tags = ["commerce", "marketplaces", "amazon", "sp-api", "fba", "data-model"]
+++

Amazon is two businesses on one detail page. It is a retailer that buys goods from brands and resells them, and it is a marketplace on which millions of other sellers offer the same goods beside it, often on the same product page under the same identifier. A brand can sell to Amazon as a **vendor** (first party, 1P), receiving purchase orders and losing control of the retail price, or sell on Amazon as a **seller** (third party, 3P), keeping the price and the inventory and paying Amazon a referral fee, often a fulfillment fee and usually an advertising bill. Many brands do both, for different products or at different times, and the software differs completely between them: 1P is wholesale with Amazon's own purchasing APIs, 3P is a storefront inside someone else's store with rules, metrics and a settlement report.

The size explains why every commerce system ends up with an Amazon integration. Amazon's 10-K for 2025 reports $172.2 billion of third-party seller services revenue (the commissions and fulfillment and shipping fees, not the sales themselves) and $68.6 billion of advertising, and third-party sellers were 61% of its paid units in the fourth quarter of 2025 ([How the Money Splits](/books/commerce/commerce-business#a-marketplace-3p-sale)). This chapter covers the two models, the 3P fees as published for 2026, Fulfillment by Amazon as a selling program, the Featured Offer, account health and its metrics, category and brand gating, Seller Fulfilled Prime, returns, the Selling Partner API and its rules for customer data, and the antitrust case that challenges several of these rules. It extends `listings`, `orders` and `documents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). FBA and Multi-Channel Fulfillment as a warehouse network are [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#amazon-multi-channel-fulfillment-and-fba); Amazon's advertising is [Retail Media & Marketplace Ads](/books/commerce/retail-media); listing data and feeds across every channel are [Multichannel Listing & Feeds](/books/commerce/multichannel-listing); Brand Registry, counterfeits and unauthorized resellers are the later Brand Protection chapter.

## How the Platforms Do It

As of October 2026, from Amazon's public seller pages, developer documentation, filings and official Seller Central forum posts:

| Program | Who it's for | How the brand is paid | Who sets the price | Integration |
| --- | --- | --- | --- | --- |
| **Vendor Central (1P)** | Brands and manufacturers, "by invitation only from Amazon" | Amazon pays the brand's invoice for goods it bought "in bulk (wholesale)" | Amazon | SP-API Retail Procurement Orders, Shipments and Payments APIs |
| **Vendor direct fulfillment** | Vendors who ship Amazon's customer orders from their own warehouse | Invoice per shipment, as a vendor | Amazon | SP-API Direct Fulfillment Orders, Shipping and Payments APIs |
| **Seller Central (3P), seller-fulfilled** | Anyone who registers; Professional plan $39.99 a month or Individual at $0.99 per item sold | Amazon collects from the buyer and settles to the seller "every two weeks," net of fees | The seller | SP-API Listings Items, Orders, Feeds, Reports, Finances |
| **Fulfillment by Amazon (FBA)** | 3P sellers who send inventory to Amazon | The same settlement, less FBA fees | The seller | SP-API Fulfillment Inbound, FBA Inventory, Reports |
| **Seller Fulfilled Prime** | 3P sellers who ship Prime orders themselves after a 30-day trial | The same settlement | The seller | Seller Central shipping settings; tracking through the Orders and Feeds APIs |
| **Pattern and similar resellers** | Brands that hand the marketplace to a partner | The partner buys the goods from the brand and sells them on Amazon | The partner, within the brand agreement | The partner's own integration |

Three things in that table shape everything below:

- **1P is a purchase order; 3P is a storefront.** A vendor's customer is Amazon, so the vendor's records are orders received, acknowledgments, ship notices and invoices, and its risks are cost negotiations and deductions. A seller's customer is the consumer, so its records are listings, offers, orders, metrics and settlements, and its risk is the account itself.
- **Amazon owns the product page.** Every offer on an Amazon Standard Identification Number (ASIN) shares one detail page, whose content is assembled from contributions by the brand, other sellers and Amazon. A seller controls its offer (price, condition, quantity, fulfillment) and contributes to the page; it doesn't own the page. That split is why the core model separates the item from the listing ([Item Versus Listing](/books/commerce/commerce-business#the-core-data-model)).
- **Rules change by forum post.** Fees, deadlines, eligibility and return policies change through announcements in Seller Central with an effective date, often weeks ahead, and the help pages that describe them render only for signed-in sellers. A system that hard-codes Amazon's rules is wrong within a quarter; one that stores them as dated rules can be updated without a release ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## 1P: Vendor Central

Amazon describes the vendor model in one sentence: "Instead of selling directly to customers, vendors sell in bulk (wholesale) to Amazon," which "then provides distribution of a brand or manufacturer's product." The brand doesn't apply; Amazon invites it. Everything after the invitation is the general shape of wholesale to a big retailer, which the later Wholesale & Retail Distribution and EDI chapters cover in depth: a purchase order, an acknowledgment, a shipment to the retailer's warehouses with a ship notice, an invoice, a payment net of deductions.

Amazon's purchasing loop is public in one place, its API models. The Selling Partner API for "Retail Procurement Orders" gives "programmatic access to vendor orders data":

- **Purchase orders** come in four types: `RegularOrder`, `ConsignedOrder`, `NewProductIntroduction` ("A purchase order where a new product is introduced.") and `RushOrder`, each with a payment method (`Invoice`, `Consignment`, `CreditCard` or `Prepaid`).
- **States** are `New`, `Acknowledged` and `Closed`; a separate status is `OPEN` while the "Buyer has not yet received all of the items" and `CLOSED` when it has.
- **Acknowledgments** answer each line with `Accepted`, `Backordered` (with a scheduled ship and delivery date) or `Rejected`, and a rejection carries a reason: `TemporarilyUnavailable`, `InvalidProductIdentifier` or `ObsoleteProduct` ("Item is no longer sold.").
- **Shipments** go through the "Retail Procurement Shipments" API (shipment confirmations, labels), and **invoices** through "Retail Procurement Payments," whose invoice type is `Invoice` or `CreditNote`.

The invoice schema is also the only public view of the money terms. Its allowance types are `Discount`, `DiscountIncentive`, `Defective`, `Promotional`, `UnsaleableMerchandise` and `Special`, and its charge types include `Freight`, `Packing`, `Duty` and `SmallOrder`. What those allowances amount to, how operational chargebacks for late or mislabeled shipments are computed and what the standard vendor terms say sit behind the Vendor Central login; the [1P sale in the core chapter](/books/commerce/commerce-business#a-1p-sale-to-amazon) states the same gap. <!-- source-gap: amazon-vendor-chargebacks | missing | Amazon vendor operational chargeback types, amounts and dispute windows | closes with: an Amazon-published vendor operational performance page, or a court record quoting the vendor terms | checked: 2026-10-28 -->

**Direct fulfillment** is the drop-ship variant: Amazon owns the sale and the customer, but the vendor ships each order from its own warehouse. Its Direct Fulfillment Orders API returns orders in `NEW`, `ACCEPTED`, `SHIPPED` or `CANCELLED` status, and because those orders carry the customer's name and address, the calls that return them require a Restricted Data Token (below).

**Retail analytics.** A vendor sees what happened to its goods after Amazon bought them through vendor reports in the Brand Analytics role: `GET_VENDOR_SALES_REPORT` (ordered and shipped revenue and units, by ASIN), `GET_VENDOR_INVENTORY_REPORT` (sellable on-hand units and the vendor's confirmation rate), `GET_VENDOR_TRAFFIC_REPORT` (glance views), `GET_VENDOR_NET_PURE_PRODUCT_MARGIN_REPORT` ("Amazon's net pure product margins for selling your items"), a weekly demand forecast by ASIN, and hourly real-time sales, traffic and inventory reports. These are the vendor's version of the sell-through data every retailer shares with its suppliers, and they belong in the same store: one row per item, retailer, day and measure, separate from the brand's own orders.

**In the data model,** an Amazon purchase order is an order with `channel = 'wholesale'`, `channel_partner = 'amazon_vendor'` and the PO number as `external_ref`, exactly as any retailer's PO ([Selling Order Versus Purchase Order](/books/commerce/commerce-business#the-core-data-model)). The acknowledgment, ship confirmation and invoice are `documents` rows kept as exchanged, and each allowance on a remittance is an `order_charges` row of kind `allowance` or `chargeback_deduction` on the original order.

## 3P: Seller Central

A third-party seller registers in Seller Central, chooses a plan, lists products (matching an existing ASIN or creating a new one), sets prices and stock, and either ships orders itself or sends inventory to FBA. Amazon is the marketplace: it takes the payment, collects sales tax as the marketplace facilitator, sets the return policy the buyer sees, and pays the seller later, net of fees. The 10-K is explicit about the role: for third-party sales "we are not the seller of record," and the seller fees are "fixed fees, a percentage of sales, per-unit activity fees, interest, or some combination thereof."

### Fees

As of October 2026, from Amazon's pricing page and its 2026 fee announcement:

| Fee | What it is | Published amount |
| --- | --- | --- |
| **Selling plan** | Monthly subscription, or per item on the Individual plan | Professional "$39.99 per month, plus selling fees"; Individual "$0.99 per item sold" |
| **Referral fee** | A percentage of the total sales price by category, with a per-item minimum (usually $0.30) | 15% in most categories, with tiers by price in many (table below) |
| **Closing fee** | Per item in media categories | $1.80 on top of the 15% referral fee |
| **FBA fulfillment fee** | Per unit shipped, by size tier, shipping weight and price band | Up "an average of $0.08 per unit sold" in 2026, effective January 15, 2026 |
| **Fuel and logistics surcharge** | A percentage of FBA, MCF and Buy with Prime fulfillment fees | 3.5%, from April 17, 2026 for FBA; averaging $0.17 per US FBA unit |
| **Holiday peak fulfillment fee** | A per-unit increase over non-peak rates | October 15, 2026 to January 14, 2027, averaging $0.32 per unit, with the 3.5% surcharge on top |
| **Storage, aged inventory, inbound placement, low inventory, returns processing** | FBA charges for space, age, distribution and returns | Per cubic foot, per unit or per return, by tier (FBA, below) |

The referral schedule is the fee a system computes most often, and it is not one rate. Some rows from the 2026 schedule:

| Category | Referral fee |
| --- | --- |
| Most categories ("Everything Else," Home and Kitchen, Toys, Sports, Tools, Office) | 15% |
| Consumer Electronics, Computers, Video Game Consoles | 8% |
| Electronics Accessories | 15% up to $100, 8% on the portion above |
| Clothing and Accessories | 5% up to $15, 10% from $15 to $20, 17% above $20 |
| Beauty, Health and Personal Care; Baby | 8% at or under $10, 15% above |
| Grocery | 8% at or under $15, 15% above |
| Jewelry | 20% up to $250, 5% on the portion above |
| Watches | 16% up to $1,500, 3% on the portion above |
| Furniture | 15% up to $200, 10% on the portion above |
| Automotive and Powersports; Business, Industrial and Scientific | 12% |
| Amazon Device Accessories | 45% |

Two shapes hide in that table. Some tiers apply one rate to the whole price according to which band it falls in (Clothing: an item at $25 pays 17% of $25), and others are marginal, a rate on "the portion" above a threshold (Jewelry: 20% of the first $250 and 5% of the rest). A fee engine that models only one of the two gets the other wrong on every sale near a boundary. The fee is charged on the total sales price, not the item price alone, so its base is a sum over named line kinds ([Fee Models](/books/user-generated-platforms/pricing-and-fees#fee-models) covers fee bases in general).

Amazon's 2026 announcement, dated October 15, 2025, said there would be "no new FBA fee types in 2026" and listed no referral changes, after "no increase in US Referral and FBA fees in 2025." The exact per-unit FBA table by size tier and price band lives in Seller Central help, which I couldn't read for this edition; a fee engine should import Amazon's fee preview report rather than transcribe the table anyway. <!-- source-gap: amazon-fba-rate-table-2026 | missing | 2026 US FBA fulfillment fee table by size tier and price band, monthly storage, inbound placement and aged-inventory rates | closes with: the Seller Central help pages for 2026 FBA fees, readable without signing in | checked: 2026-10-28 -->

### Fulfillment by Amazon as a selling program

FBA changes three things for a seller beyond who ships. **The offer becomes Prime-eligible,** with Amazon's delivery promise shown to the buyer. **Amazon owns customer service and returns** for those orders. And **the seller's metrics change:** Amazon's late shipment and valid tracking measures apply to seller-fulfilled orders, so an FBA seller is measured on inventory instead (stock-outs, excess, aged units).

The fees follow inventory through its life. Amazon's FBA page lists the categories without amounts: a monthly storage fee "based on the space your inventory occupies," an aged inventory surcharge "for all items stored in a fulfillment center for more than 181 days," an inbound placement fee for distributing inventory to centers near customers, and a returns processing fee "when Amazon provides a customer with free return shipping." Since June 1, 2024 the returns processing fee also applies to products with high return rates outside apparel and shoes, measured per unit above a category threshold over the ship month and the next two months, with products shipping fewer than 25 units a month exempt. The capacity limits in cubic feet and the low-inventory-level fee, which push the seller to keep neither too much nor too little in the network, are in [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#amazon-multi-channel-fulfillment-and-fba); the reorder math is [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#reorder-points-and-safety-stock).

For the system, an FBA order is a marketplace order whose fulfillment Amazon already did: the order arrives with `fulfillment_type = 'shipping'` and a fulfillment row with `provider = 'marketplace_network'`, and it must never enter the OMS's sourcing ([Channel Orders](/books/commerce/order-management#channel-orders-marketplaces-and-purchase-orders)). Peak dates matter as data too: for the 2026 holidays, Amazon asked for FBA inbound shipments by October 21 for "minimal shipment splits" and by October 28 for "Amazon-optimized splits" to be in stock for Black Friday and Cyber Monday.

## The Featured Offer

When several sellers offer the same ASIN, one offer appears at the top of the detail page with the Add to Cart and Buy Now buttons. Amazon calls it the Featured Offer (sellers still say "Buy Box"), and most sales on a shared ASIN go through it. Amazon's own guidance on what wins it is short: "Featured Offer prices are commonly at or below the lowest priced alternatives," "Offers with fast, free shipping are more likely to be featured," and "Your offer can't become featured if your item is out of stock." Fulfilling orders yourself can win as well as FBA can.

Eligibility used to be a gate: a seller needed a Professional plan and had to meet performance requirements to compete at all. Amazon announced in mid-2026 that "Starting in July 2026, we'll begin removing seller eligibility requirements for the Featured Offer," finishing by the end of 2026, with selection still based on "competitive pricing, delivery speed, and performance," and "Being considered for the Featured Offer doesn't guarantee your offer will be featured." Whether the Professional plan requirement survives isn't stated in what I could read.

What this means for the software:

- **Featured Offer status is an observation, not a setting.** The seller learns it from the `ANY_OFFER_CHANGED` notification, sent on a "change to any of the top 20 offers," and from pricing API calls. Each observation is a timestamped row per listing, not a flag overwritten on the listing, because the questions asked of it are about time: how many hours a day did we hold it, and what changed when we lost it.
- **Repricers act on it.** Third-party repricing tools adjust price in response to offer changes within the seller's floor and ceiling. The floor is a business rule (never below landed cost plus fees, never below a minimum advertised price the brand enforces), and it is the part the merchant must own, and the later Pricing & Price Lists chapter covers MAP and price rules.
- **Advertising depends on it.** Sponsored Products ads require the product to "be eligible for the Featured Offer" ([Retail Media & Marketplace Ads](/books/commerce/retail-media#amazon-ads)), so losing it stops the ads too.

How Amazon treats sellers who offer lower prices elsewhere is also at the center of the antitrust case ([FTC v. Amazon](#ftc-v-amazon)).

## Account Health

A seller's account is the asset, and Amazon measures it continuously. The Account Health page rolls policy compliance and performance into an **Account Health Rating** (AHR), "a numeric score (0–1,000)": Healthy from 200 to 1,000, At Risk from 100 to 199, and below 100 "Your account is eligible for deactivation." A violation Amazon classifies as critical "can drop your score to zero instantly." Sellers who hold an AHR of 250 or more for six months may qualify for Account Health Assurance, which gives up to 13 days instead of 3 to resolve an issue before action.

The performance metrics and their published targets, for orders the seller fulfills unless noted:

| Metric | Definition | Target | Window |
| --- | --- | --- | --- |
| **Order Defect Rate (ODR)** | Orders with negative feedback, an A-to-z Guarantee claim that isn't denied, or a credit card chargeback, over all orders | Under 1%; "above 1% may result in account deactivation" | 60 days |
| **Pre-fulfillment cancel rate** | Seller-cancelled orders over all seller-fulfilled orders | Under 2.5% | 7 days |
| **Late shipment rate (LSR)** | Orders confirmed shipped after the expected ship date | Under 4% | 10 and 30 days |
| **Valid tracking rate (VTR)** | Shipments with a tracking number the carrier recognizes, by category | Above 95%; below it Amazon may restrict non-FBA selling in that category | 30 days |
| **On-time delivery rate** | Packages delivered by the promised date | Tracked without a deactivation threshold; Amazon has published targets of 97% and, later, 90% | As Amazon reports it |
| **Return dissatisfaction rate** | Returns with negative feedback, a late response (over 48 hours) or an incorrect rejection | Under 10%, no penalty | As Amazon reports it |

The windows are not interchangeable. The ODR counts negative feedback by order date over 60 days; a seller has 48 hours to respond to an A-to-z claim and 7 calendar days to respond to a chargeback, and 30 days to appeal a granted claim. A metric that matches Amazon's has to use the same window, the same date (order, ship or delivery) and the same exclusions, and it is still an estimate: Amazon's number is the one that counts, so the system stores both and alarms when they diverge. TikTok Shop and Walmart publish the same family of metrics with different thresholds ([Walmart, eBay, Etsy, TikTok Shop & Others](/books/commerce/other-marketplaces#performance-standards-compared)), and the UGP volume models them as a status program with versioned criteria ([Seller Performance Scores](/books/user-generated-platforms/social-commerce-and-live-shopping#seller-performance-scores)).

**Enforcement and appeal.** When a metric or policy fails, Amazon can remove listings, restrict a category, hold funds or deactivate the account. The way back is an appeal with a plan of action: "You can appeal by providing us with a plan of action for correcting the problems that contributed to the enforcement action," which in practice names the root cause, the fix already made and the change that prevents recurrence. Each step (the notice, the policy cited, the affected ASINs, the evidence submitted, the decision) is a record the seller needs later, so the system keeps them as events, not as an inbox.

## Category and Brand Gating

Not everything can be listed by everyone. Amazon sorts categories into three groups: "some require a Professional selling plan, some require approval from Amazon, and some can't be sold by third-party sellers." Collectible Coins, Entertainment Collectibles, Fine Art and Sports Collectibles are examples of categories that "require approval before you can list products." Approval typically asks for proof of a legitimate supply chain; Amazon's own guidance for wholesale sellers is to "Gather your supplier invoices from the last 180 days, showing at least 10 units purchased." Separately, some products "may not be listed as a matter of compliance with legal or regulatory restrictions" (hazmat, pesticides, recalled or regulated goods), which the Regulated Goods part of this volume covers by category.

Brands gate themselves too: "Amazon Brand Registry is a free program that helps eligible brands protect their intellectual property," and a brand enrolled in it controls its detail-page content and can restrict who lists it; the later Brand Protection chapter covers Registry, counterfeits and unauthorized resellers. For the system, gating is a per-account, per-category or per-brand approval with a date and evidence, checked before a listing is created, not discovered from the rejection afterwards.

## Seller Fulfilled Prime

Seller Fulfilled Prime (SFP) lets a seller ship Prime orders from its own warehouse or a 3PL and still show the Prime badge. To prequalify, "you must have a domestic US address as your default shipping address and a Professional selling account"; the trial requires that "you must participate for 30 days and meet performance requirements"; the delivery speed expected "does vary depending on the size tier"; and sellers can "set daily limits" on same-, one- and two-day orders. Amazon updated SFP and Premium Shipping policies effective June 29, 2025, protecting the on-time delivery measure when Shipping Settings Automation is on, and a staff reply in the same thread said sellers under 100 SFP packages a month stay in the program with a capped order limit. Amazon's public page lists no numeric thresholds and no SFP-specific fee. <!-- source-gap: amazon-sfp-thresholds | missing | Current Seller Fulfilled Prime on-time delivery, cancellation, valid tracking and weekend delivery thresholds | closes with: the Seller Central SFP program policies page, readable without signing in | checked: 2026-10-28 -->

SFP is the hardest version of a delivery promise a merchant can make: a two-day badge on Amazon's page is met or not by the merchant's own cutoff, pick speed and carrier. The machinery is the delivery promise in [Shipping & Carriers](/books/commerce/shipping-and-carriers#delivery-promises), run per order against a daily cap and measured by Amazon.

## Returns

Amazon sets the return policy the buyer sees on every order, including the ones the seller ships. Buyers can return most items "within 30 days of their order's estimated delivery date," whoever fulfilled the order. For seller-fulfilled orders:

- **Prepaid labels are mandatory.** "US sellers are automatically enrolled in Amazon's prepaid returns program," and from February 8, 2026 "all US sellers must use the Amazon Prepaid Return Label (APRL) program for customer returns" regardless of item value, with exemptions for Handmade, certified pre-owned watches, non-physical goods, dangerous goods and extra-large or heavy items. Amazon said the change "reduces the refund cycle time from 14 to 7 days."
- **Returnless refunds** happen when the seller sets a rule for them, or automatically for some low-value international returns.
- **Restocking fees** are allowed "for damaged or materially different items," not for change-of-mind returns.
- **A-to-z Guarantee claims.** If Amazon finds the seller at fault, it "may issue a refund to the buyer and deduct the amount from your Seller Central account," and a granted claim counts in the ODR. When the seller believes a refund wasn't its fault, the route back is a SAFE-T claim ("Seller Assurance for E-Commerce Transactions").
- **Holiday returns.** Amazon extends the window every year for purchases in November and December; trade press reported that for 2026, purchases from November 1 to December 31 can be returned until January 31, 2027, and that Amazon made the rule annual. <!-- source-gap: amazon-holiday-returns-2026 | secondary | Amazon 2026 holiday return window (Nov 1 to Dec 31 returnable until Jan 31, 2027) and its annual status | closes with: Amazon's Seller News post or customer help page for the 2026 holiday return policy | checked: 2026-10-28 -->

FBA returns go to Amazon's network, which inspects them and either returns the unit to sellable stock or marks it unfulfillable, from where the seller pays to remove or dispose of it. The seller's system learns the outcome from returns reports, and the unit's disposition maps to `return_lines.disposition` in the core model ([Disposition](/books/commerce/returns-and-exchanges#disposition)). A unit Amazon received but didn't credit, or lost in a warehouse, is a reimbursement claim, which is why every FBA return is reconciled from the refund to the inventory adjustment.

## The Selling Partner API

The Selling Partner API (SP-API) is how every seller tool, OMS, ERP connector, repricer and analytics product talks to Amazon, for sellers and vendors alike. It is a set of REST APIs per domain (Orders, Listings Items, Catalog Items, Product Pricing, Feeds, Reports, Finances, Fulfillment Inbound and Outbound, Notifications, Tokens and the vendor APIs above), authorized per selling partner.

### Authorization and roles

An application is authorized by the seller or vendor through "OAuth 2.0" via "Login with Amazon," starting "from your website or from the Selling Partner Appstore"; "Reauthorization is required annually," and a private application for the developer's own account uses self-authorization. The application exchanges its refresh token for an access token that expires after an hour (`expires_in` 3600) and sends it in the `x-amz-access-token` header.

What the application may call is decided by **roles**, granted at registration. There are 18, among them Product Listing, Pricing, Inventory and Order Tracking, Amazon Fulfillment, Finance and Accounting, Brand Analytics, Buyer Communication and Selling Partner Insights. Five are **restricted** because they expose customer data or act on tax: Direct-to-Consumer Shipping, Tax Invoicing, Tax Remittance, Professional Services and Selling Partner Support. A restricted role requires Amazon's review of the use case, and an application asks only for the roles it needs.

### Customer data

Amazon's terms for developers are the part an engineer most needs to read, because they decide how the database is built. The **Restricted Data Token** (RDT) is the mechanism: "Restricted operations return customers' Personally Identifiable Information (PII)," and "You need an RDT to call a restricted operation," including the v0 Orders API's buyer and address calls, Merchant Fulfillment, report documents with PII, and vendor direct fulfillment orders and labels. The new Orders API (v2026-01-01) changes this: "Restricted Data Tokens (RDTs) are not required to access Personally Identifiable Information (PII) in v2026-01-01," and access depends on the roles assigned instead; buyer and recipient data come back only when asked for with `includedData=BUYER` or `RECIPIENT`.

The security controls Amazon publishes for SP-API integrations, aligned with its Data Protection Policy and Acceptable Use Policy, include:

- "Delete personally identifiable information (PII) within 30 days after order delivery."
- "Use AES-128 or RSA-2048 bit keys (or higher) to encrypt all PII data," with "TLS 1.2 or higher" in transit.
- Notify Amazon "within 24 hours of detecting a security incident."
- Require multi-factor authentication, and "Remediate critical-risk vulnerabilities within 7 days and high-risk vulnerabilities within 30 days."

The 30-day deletion rule is the one that shapes the schema. A buyer's name, address and phone from an Amazon order may be kept only long enough to ship and support the order, so they can't sit on the `orders` row next to data kept for seven years for tax. My rule: put marketplace PII in its own table keyed by order, encrypted, with a `purge_after` computed from the delivery date, and let a job delete it; everything kept longer (the order, its lines and charges, the ship-to state and postal code that tax needs) stays in the core tables ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records), [Classify Every Field](/docs/payments/sensitive-data#classify-every-field)). The customer belongs to the marketplace, which is why a marketplace order's `customer_id` is often null in a brand's records.

### Limits, notifications and versions

- **Rate limits** use "the token bucket algorithm": each operation has a rate (tokens per second) and a burst, per selling partner and application, and "A 429 is a retry-able status code." Listings Items' `putListingsItem` allows 5 requests a second with a burst of 10; vendor `getPurchaseOrders` 10 and 10. Integrations queue calls per operation and back off on 429s ([Handling a 429](/docs/requests/rate-limiting#handling-a-429)).
- **Notifications** replace much of the polling: `ORDER_CHANGE` ("whenever there is an important change in the order") and `ANY_OFFER_CHANGED` through Amazon SQS; `LISTINGS_ITEM_STATUS_CHANGE` and `LISTINGS_ITEM_ISSUES_CHANGE` through EventBridge; `REPORT_PROCESSING_FINISHED` when a report is ready. Amazon removed the older `ORDER_STATUS_CHANGE` notification on July 29, 2026. Notifications can arrive late, twice or out of order, so they trigger a fetch of the current state rather than being applied as deltas ([Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)).
- **Versions retire on a schedule.** The Orders API v0 was deprecated January 28, 2026 and is removed March 27, 2027: "you must migrate to Orders API v2026-01-01," which returns "all order information in single API request" (`searchOrders` replaces `getOrders`; items, buyer, recipient, proceeds, fees and packages are `includedData` options). Finances v0 is removed August 27, 2027. Every connector needs a calendar of these dates.
- **Fees for developers, announced and withdrawn.** Amazon announced an annual fee and per-call charges for third-party developers from 2026, then posted that "we have decided that we will not move forward with the SP-API usage and annual fees at this time."

### Settlements and the money

A seller doesn't receive each order's price; it receives a settlement. "In general, Amazon settles seller accounts every two weeks," by ACH, and for delivered orders "we typically reserve funds for seven days": an order's proceeds are a deferred transaction until seven days after delivery (DD+7), and an account-level reserve holds funds against refunds, claims and chargebacks. Funds can take "up to five business days" to reach the bank after a settlement.

Two sources describe the money:

- **The settlement report,** generated automatically by Amazon for each settlement period ("Settlement reports cannot be requested or scheduled"): one row per transaction and amount type (the principal, shipping, tax collected and withheld as facilitator, each fee, each refund, each reimbursement, each advertising charge, the reserve movements). The flat-file and XML versions are removed November 11, 2026, replaced by `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2`.
- **The Finances API** (v2024-06-19), whose `listTransactions` returns transactions with a status of `DEFERRED`, `RELEASED` or `DEFERRED_RELEASED`, so the system can see money it has earned but not yet been paid.

Reconciliation is the job: every settlement line maps to an order (or to the account, for subscription and storage fees), every order's expected fees are compared to the fees charged, and the total equals the deposit. Payout reconciliation generally is [Reconciliation](/books/payments/payouts-and-settlement#reconciliation); the Amazon-specific part is the vocabulary of transaction and amount types, which changes as fees are added.

## FTC v. Amazon

On September 26, 2023 the FTC and 17 states (now 18 and Puerto Rico) sued Amazon in the Western District of Washington (case 2:23-cv-01495), alleging it illegally maintains monopoly power. The tactics alleged touch seller rules this chapter describes: "Anti-discounting measures that punish sellers and deter other online retailers from offering prices lower than Amazon," and conditioning sellers' "Prime" eligibility on using Amazon's fulfillment service. On September 30, 2024 Judge John H. Chun granted Amazon's motion to dismiss only in part: the Sherman Act and FTC Act counts survived ("DENIES the motion"), most state claims survived, a few state counts were dismissed, and the case was bifurcated so that a bench trial "will address only Amazon's liability," with remedies after any finding of liability. The FTC filed a second amended complaint on October 31, 2024.

As of October 2026 there has been no ruling on the merits and no settlement. Trade press reports the bench trial set for March 29, 2027, and that on October 9, 2026 the court denied Amazon's request to move it to June 2027; I couldn't open the docket to confirm either. <!-- source-gap: ftc-amazon-trial-date | secondary | FTC v. Amazon (W.D. Wash. 2:23-cv-01495) bench trial date of March 29, 2027 and the October 9, 2026 order denying a continuance | closes with: the docket entries or an FTC case-page update | checked: 2026-10-28 -->

A separate FTC case, about Prime enrollment and cancellation rather than sellers, ended on September 25, 2025 with a $2.5 billion settlement: a $1 billion civil penalty and $1.5 billion in refunds (the later Auto-Renewal & Cancellation Law chapter covers the rules it enforced; [Cancellation Law](/books/commerce/delivery-subscriptions#cancellation-law) covers the delivery memberships).

For a seller's system, the case is a reason to keep pricing and fulfillment decisions explainable. If the rules on Featured Offer eligibility or Prime fulfillment change after a judgment, the merchant who stored why each price was set, which offers won, and which program each order shipped through can adapt in configuration; the one who didn't will be reverse-engineering its own history.

## How to Build It

The core model already has the pieces an Amazon integration fills: `listings` for ASIN offers, `orders` with `channel_partner = 'amazon'` and the Amazon order ID as `external_ref`, `fulfillments` with `provider = 'marketplace_network'` for FBA, `documents` for vendor POs and invoices, and `connected_systems` (from [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it)) for the SP-API authorization. Selling on Amazon adds the settlement, its lines, the account's health, the marketplace PII kept apart, and offer observations:

```sql
ALTER TABLE listings
  ADD COLUMN connected_system_id UUID REFERENCES connected_systems (id),  -- which seller account
  ADD COLUMN marketplace_ref     TEXT,   -- e.g. 'ATVPDKIKX0DER' for amazon.com
  ADD COLUMN seller_sku          TEXT,   -- the SKU the channel knows; may differ from items.sku
  ADD COLUMN fulfillment_channel TEXT CHECK (fulfillment_channel IN ('merchant', 'marketplace',
                                   'merchant_prime')),  -- FBM, FBA, Seller Fulfilled Prime
  ADD COLUMN condition           TEXT NOT NULL DEFAULT 'new';
-- One item can be offered from several accounts or conditions; widen the uniqueness.
ALTER TABLE listings DROP CONSTRAINT listings_channel_id_item_id_key;
ALTER TABLE listings ADD CONSTRAINT listings_offer_key
  UNIQUE NULLS NOT DISTINCT (channel_id, connected_system_id, marketplace_ref, seller_sku);

CREATE TABLE offer_observations (        -- what the channel showed, when
  listing_id        UUID NOT NULL REFERENCES listings (id),
  observed_at       TIMESTAMPTZ NOT NULL,
  source            TEXT NOT NULL CHECK (source IN ('notification', 'pricing_api', 'report')),
  our_price         BIGINT,             -- minor units, landed (item plus shipping)
  featured          BOOLEAN NOT NULL,   -- we held the Featured Offer at this moment
  featured_price    BIGINT,             -- the winning offer's landed price
  offer_count       INT,
  currency          CHAR(3) NOT NULL,
  raw_ref           TEXT,               -- object storage key of the payload
  PRIMARY KEY (listing_id, observed_at)
);

CREATE TABLE marketplace_settlements (   -- one payout period from a marketplace
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  settlement_ref      TEXT NOT NULL,     -- the marketplace's settlement ID
  period              TSTZRANGE NOT NULL,
  currency            CHAR(3) NOT NULL,
  total_amount        BIGINT NOT NULL,   -- the deposit, signed; negative means the seller owes
  deposit_date        DATE,
  document_id         UUID REFERENCES documents (id),  -- the report as received
  status              TEXT NOT NULL CHECK (status IN ('open', 'imported', 'reconciled',
                        'exception')),
  UNIQUE (connected_system_id, settlement_ref)
);

CREATE TABLE settlement_lines (          -- one transaction and amount type, as reported
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  settlement_id     UUID NOT NULL REFERENCES marketplace_settlements (id),
  order_id          UUID REFERENCES orders (id),   -- null: account-level (plan, storage, reserve)
  order_line_id     UUID REFERENCES order_lines (id),
  transaction_type  TEXT NOT NULL,       -- 'Order', 'Refund', 'ServiceFee', 'Adjustment', ...
  amount_type       TEXT NOT NULL,       -- 'ItemPrice', 'ItemFees', 'Promotion', ...
  amount_description TEXT NOT NULL,      -- 'Principal', 'Commission', 'FBAPerUnitFulfillmentFee'
  amount            BIGINT NOT NULL,     -- signed, minor units, as reported
  posted_at         TIMESTAMPTZ NOT NULL,
  order_charge_id   UUID REFERENCES order_charges (id),  -- the charge this line confirms
  match_status      TEXT NOT NULL DEFAULT 'unmatched' CHECK (match_status IN ('unmatched',
                      'matched', 'variance', 'account_level'))
);

CREATE TABLE account_health_events (     -- metrics, notices, enforcement and appeals
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  kind                TEXT NOT NULL CHECK (kind IN ('metric', 'policy_notice', 'listing_removed',
                        'category_restricted', 'funds_held', 'deactivated', 'appeal_submitted',
                        'appeal_decided', 'reinstated')),
  metric              TEXT,              -- 'odr', 'lsr', 'cancel_rate', 'vtr', 'otdr', 'ahr'
  value_bp            INT,               -- basis points for a rate; the score for AHR
  window              TSTZRANGE,         -- the period the marketplace measured
  policy_ref          TEXT,              -- the policy or rule cited
  affected_refs       TEXT[] NOT NULL DEFAULT '{}',  -- ASINs, order IDs
  document_id         UUID REFERENCES documents (id),  -- the notice or plan of action
  occurred_at         TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marketplace_order_contacts (  -- buyer PII under the channel's retention rule
  order_id     UUID PRIMARY KEY REFERENCES orders (id),
  name_enc     BYTEA,                    -- encrypted with a key per connected system
  address_enc  BYTEA,
  phone_enc    BYTEA,
  purge_after  TIMESTAMPTZ NOT NULL      -- e.g. delivered_at + 30 days for Amazon
);
CREATE INDEX ON marketplace_order_contacts (purge_after);

ALTER TABLE documents DROP CONSTRAINT documents_kind_check;
ALTER TABLE documents ADD CONSTRAINT documents_kind_check CHECK (kind IN ('invoice',
  'credit_memo', 'packing_slip', 'purchase_order', 'po_acknowledgment', 'po_change',
  'ship_notice', 'inventory_advice', 'product_activity', 'receipt', 'bill_of_lading',
  'commercial_invoice', 'settlement_report', 'policy_notice', 'plan_of_action'));
```

Fees are computed before the sale and confirmed after it. A referral fee schedule with both tier shapes is data with a validity range, and the expected fee becomes an `order_charges` row when the order is imported; the settlement line confirms or contradicts it:

```sql
CREATE TABLE referral_fee_tiers (        -- a marketplace's fee schedule, versioned
  channel_id    TEXT NOT NULL REFERENCES sales_channels (id),
  category      TEXT NOT NULL,           -- the channel's fee category
  shape         TEXT NOT NULL CHECK (shape IN ('whole_price', 'marginal')),
  from_amount   BIGINT NOT NULL,         -- lower bound of the band, minor units
  rate_bp       INT NOT NULL,            -- basis points
  min_fee       BIGINT NOT NULL DEFAULT 0,  -- per item
  valid_during  TSTZRANGE NOT NULL,
  PRIMARY KEY (channel_id, category, from_amount, valid_during)
);

-- Variances: charges the marketplace took that differ from what we expected.
SELECT s.settlement_ref, l.order_id, l.amount_description,
       -l.amount AS charged, c.amount AS expected, -l.amount - c.amount AS variance
FROM settlement_lines l
JOIN marketplace_settlements s ON s.id = l.settlement_id
JOIN order_charges c ON c.id = l.order_charge_id
WHERE l.match_status = 'variance'
ORDER BY abs(-l.amount - c.amount) DESC;
```

Design notes:

- **Import settlements as bytes, then lines.** The report as received is a `documents` row; the parsed lines refer to it. When Amazon renames an amount description, the bytes let you reparse old settlements.
- **Account-level lines are real.** The selling plan, storage, advertising, reserves and reimbursements have no order; they are lines with `order_id` null and `match_status = 'account_level'`, and they belong in margin by channel and period ([Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it)).
- **Fees reconcile per order, not per payout.** A payout that is $3 short says nothing; an order whose FBA fee was charged at the wrong size tier says what to dispute. Tie each fee line to the expected charge and investigate variances above a threshold, the same pattern as a 3PL invoice ([Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#how-to-build-it)).
- **Health is a time series with documents.** Store each metric as Amazon reported it with its window, and each notice and appeal with its text; a dashboard reads the latest, an appeal reads the history.
- **PII has its own table and its own clock.** The purge job runs daily and is monitored; a failed purge is a compliance incident, not a warning.
- **One integration per account and region.** A brand selling in the US, Canada and Mexico, or with two seller accounts, has a `connected_systems` row per authorization, each with its own token, rate limits and reauthorization date.
- **Vendor and seller are different channels.** `amazon_vendor` and `amazon` are separate `sales_channels` rows; a brand that moves an item from 1P to 3P ends one listing and starts another, and its history stays readable.

## Auditing

- **Every settlement.** The report as received, its parsed lines, the match of each line to an order charge, and the variances investigated with their outcome.
- **Every listing change.** What was submitted (price, quantity, content) and when, the response, and the issues Amazon returned, so a suppressed listing or a pricing complaint can be traced ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#auditing)).
- **Every account health signal.** Metrics with their windows, policy notices with the text cited, enforcement actions, plans of action as submitted and Amazon's decisions.
- **Every PII purge.** Which orders' contact data was deleted and when, without the data itself.
- **Every vendor document.** Purchase orders, acknowledgments, ship confirmations, invoices and remittances as exchanged, with the deductions taken against each PO.

## What This Means for the System You Build

- **Model 1P and 3P as different channels:** a vendor PO is a wholesale order with documents; a seller order is a marketplace order with a settlement.
- **Treat Amazon's rules as dated data:** referral tiers (both whole-price and marginal), FBA fees, surcharges, peak periods and inbound deadlines, each with an effective range.
- **Compute expected fees at import and reconcile every settlement line** to them, per order, including account-level lines.
- **Record offer observations over time,** so Featured Offer share, repricer behavior and the floor price can be explained.
- **Mirror account health metrics with Amazon's windows and definitions,** and alert before Amazon does.
- **Keep marketplace PII apart, encrypted and on a purge clock** of 30 days after delivery, and build everything else so it doesn't need it.
- **Respect rate limits per operation,** use notifications as triggers to fetch, and keep a calendar of API retirements (Orders v0 on March 27, 2027).
- **Keep gating approvals, appeals and plans of action as records** with their evidence.

## References

**Amazon seller programs and fees**

- [Amazon: Selling plans and fees](https://sell.amazon.com/pricing), the Professional and Individual plans and the 2026 referral fee schedule by category
- [Amazon: Update to US referral and FBA fees for 2026 (October 15, 2025)](https://sellingpartners.aboutamazon.com/update-to-u-s-referral-and-fulfillment-by-amazon-fees-for-2026), the $0.08 average FBA increase, no new fee types and the January 15, 2026 effective date
- [Amazon: Fulfillment by Amazon](https://sell.amazon.com/fulfillment-by-amazon), storage, aged inventory, inbound placement and returns processing fee categories
- [Amazon: Seller Central](https://sell.amazon.com/tools/seller-central), Vendor Central by invitation, the wholesale vendor model and Seller Central for third-party sellers
- [Amazon: Selling on Amazon FAQ](https://sell.amazon.com/learn/faq), the Featured Offer definition, category tiers, restricted products, Brand Registry and ACH payouts
- [Amazon: Buy Box and the Featured Offer (April 10, 2026)](https://sell.amazon.com/blog/buy-box-featured-offer), price, delivery speed and stock as factors
- [Amazon: Selling policies (October 16, 2024)](https://sell.amazon.com/blog/selling-policies), the Account Health Rating and metric targets, and gated categories
- [Amazon: Reselling on Amazon (September 17, 2025)](https://sell.amazon.com/blog/reselling), collectible categories requiring approval
- [Amazon: How to sell wholesale on Amazon (March 25, 2026)](https://sell.amazon.com/blog/ask/how-to-sell-wholesale-on-amazon), supplier invoices for category approval
- [Amazon: Seller Fulfilled Prime](https://sell.amazon.com/programs/seller-fulfilled-prime), prequalification, the 30-day trial and daily order limits
- [Amazon: Manage customer returns (April 15, 2025)](https://sell.amazon.com/blog/manage-customer-returns), the 30-day window, prepaid labels, returnless refunds, A-to-z and restocking fees
- [Amazon: Amazon seller payments (July 30, 2025)](https://sell.amazon.com/blog/amazon-seller-payments), two-week settlements, the seven-day reserve after delivery and deferred transactions
- [Amazon: Seller account health help page (PDF)](https://m.media-amazon.com/images/G/09/jpmplegal/G200205250_EN.pdf), ODR, cancellation, late shipment, valid tracking, on-time delivery and return dissatisfaction definitions and windows, and appeals with a plan of action

**Amazon announcements in Seller Central forums (official accounts)**

- [Fuel and logistics-related surcharge: FBA, MCF and BWP in US and CA](https://sellercentral.amazon.com/seller-forums/discussions/t/7cbc0233-ee5b-4359-978a-dee7cad5c6f4), the 3.5% surcharge, its dates and the $0.17 average
- [Holiday 2026: Same fees, same eligibility, earlier deadlines](https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff), peak fees from October 15, 2026 and inbound deadlines
- [Updates to Featured Offer eligibility requirements](https://sellercentral.amazon.com/seller-forums/discussions/t/7336583f-09ac-41de-99d1-667017a88db2), removing eligibility requirements from July 2026
- [Featured Offer eligibility and the Professional plan](https://sellercentral.amazon.com/seller-forums/discussions/t/c3d1cf32-5dc9-499a-a5cb-931dc6e113f3), the earlier requirements
- [Stay in Control: A Seller's Guide to Account Health](https://sellercentral.amazon.com/seller-forums/discussions/t/f360047c-af63-4910-a37a-e26df9b14b45), the 0 to 1,000 AHR scale, its bands and Account Health Assurance
- [Account health metric windows](https://sellercentral.amazon.com/seller-forums/discussions/t/8a41416f-e1ad-4221-9675-7145d5cc5e28), the 90% on-time delivery target and measurement windows
- [Order Defect Rate and claim response windows](https://sellercentral.amazon.com/seller-forums/discussions/t/11e93fd8-e0df-4795-800c-497f54afbc97), ODR counting and the 48-hour, 7-day and 30-day windows
- [Seller Fulfilled Prime and Premium Shipping policy update](https://sellercentral.amazon.com/seller-forums/discussions/t/a392bf51-9628-4959-a38d-c04387948ed8), the June 29, 2025 changes and the order cap below 100 packages
- [Prepaid return labels required starting February 8](https://sellercentral.amazon.com/seller-forums/discussions/t/c1eae42b-ead4-4c63-a007-aefbca44a867), APRL for all US sellers, exemptions, refund cycle time and SAFE-T
- [Returns processing fee for high-return products](https://sellercentral.amazon.com/seller-forums/discussions/t/4ba71c53-681d-49e8-ab4d-5a533b0072af), the June 1, 2024 start, measurement and exemptions
- [Deferred transactions and DD+7](https://sellercentral.amazon.com/seller-forums/discussions/t/bb5a871c-6bfd-4b84-8473-84cee00ad999), funds held seven days after delivery and the account-level reserve

**Selling Partner API**

- [SP-API: Roles in the Selling Partner API](https://developer-docs.amazon/sp-api/docs/roles-in-the-selling-partner-api), the 18 roles and the restricted ones
- [SP-API: Tokens API use case guide](https://developer-docs.amazon/sp-api/docs/tokens-api-use-case-guide), Restricted Data Tokens and the restricted operations
- [SP-API: Guidance to address key security controls](https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration), PII deletion within 30 days, encryption, incident reporting and vulnerability remediation
- [SP-API: Authorizing Selling Partner API applications](https://developer-docs.amazon/sp-api/docs/authorizing-selling-partner-api-applications), OAuth through Login with Amazon and annual reauthorization
- [SP-API: Connecting to the Selling Partner API](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api), access tokens and their one-hour lifetime
- [SP-API: Usage plans and rate limits](https://developer-docs.amazon/sp-api/docs/usage-plans-and-rate-limits), the token bucket, bursts and 429s
- [SP-API: Notification type values](https://developer-docs.amazon/sp-api/docs/notification-type-values), ORDER_CHANGE, ANY_OFFER_CHANGED and listings notifications
- [SP-API: Deprecations](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations), Orders v0, Finances v0 and ORDER_STATUS_CHANGE dates
- [SP-API: Introducing the Orders API v2026-01-01](https://developer-docs.amazon/sp-api/changelog/new-introducing-the-orders-api-v2026-01-01), single-request order retrieval
- [SP-API: Orders API migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide), operation mapping, includedData and PII without RDTs
- [SP-API: Settlement report type values](https://developer-docs.amazon/sp-api/docs/report-type-values-settlement), automatic settlement reports and the V2 flat file replacing the old formats
- [SP-API: Analytics report type values](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics), vendor sales, inventory, traffic, margin, forecasting and real-time reports
- [SP-API models: Vendor Orders](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/vendor-orders-api-model/vendorOrders.json), purchase order types, states, acknowledgment codes and rejection reasons
- [SP-API models: Vendor Shipments](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/vendor-shipments-api-model/vendorShipments.json), shipment confirmations and labels
- [SP-API models: Vendor Invoices](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/vendor-invoices-api-model/vendorInvoices.json), invoice types, allowance types and charge types
- [SP-API models: Vendor Direct Fulfillment Orders](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/vendor-direct-fulfillment-orders-api-model/vendorDirectFulfillmentOrdersV1.json), direct fulfillment order statuses
- [SP-API models: Finances v2024-06-19](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/finances-api-model/finances_2024-06-19.json), transactions and their deferred and released statuses
- [SP-API models: Listings Items v2021-08-01](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/listings-items-api-model/listingsItems_2021-08-01.json), the putListingsItem rate limit
- [Amazon: Cancellation of third-party developer SP-API fees](https://developer.amazonservices.com/cancellation-of-sp-api-fees), the decision not to charge annual and usage fees

**Filings and court records**

- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), seller fees, not being the seller of record for third-party sales, and third-party seller services revenue
- [Pattern Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1811935/000181193526000013/ptrn-20251231.htm), buying products from brand partners and selling them on marketplaces
- [FTC: Amazon.com, Inc. (Amazon eCommerce) case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/1910129-1910130-amazoncom-inc-amazon-ecommerce), the case number, complaints and orders
- [FTC: FTC sues Amazon for illegally maintaining monopoly power (September 26, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/09/ftc-sues-amazon-illegally-maintaining-monopoly-power), the alleged anti-discounting and Prime eligibility tactics
- [FTC v. Amazon: Order on motion to dismiss and motion to bifurcate (September 30, 2024)](https://www.ftc.gov/system/files/ftc_gov/pdf/0289-20240930-ORDERonD'sMTDPls'MtntoBifurcate.pdf), the counts that survived and the liability-only bench trial
- [FTC: Historic $2.5 billion settlement against Amazon (September 25, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-secures-historic-25-billion-settlement-against-amazon), the Prime enrollment and cancellation case

**Press**

- [PYMNTS: Amazon loses bid to delay FTC antitrust trial (October 11, 2026)](https://pymnts.com/cpi-posts/amazon-loses-bid-to-delay-ftc-antitrust-trial-as-california-case-looms), the March 29, 2027 trial date and the October 9, 2026 order
- [PPC Land: Amazon makes its January 31 holiday return deadline an annual rule](https://ppc.land/amazon-makes-its-january-31-holiday-return-deadline-an-annual-rule/), the 2026 holiday return window
