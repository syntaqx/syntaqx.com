+++
title = "Running Your Own Marketplace"
nav_title = "Running a Marketplace"
description = "Adding third-party sellers to a store: onboarding and KYC, shared catalogs and offers, split orders, commissions and payouts, tax and EU marketplace duties."
category = "Commerce Industry"
order = 2332
part = "Marketplaces"
tags = ["commerce", "marketplaces", "mirakl", "commissions", "dsa", "marketplace-facilitator"]
+++

A retailer that adds third-party sellers to its own site stops being only a seller and becomes an operator. A home improvement chain lists patio furniture it has never stocked; a department store sells beauty brands that ship from their own warehouses; a brand opens its site to accessories from partners. The shopper sees one store, one cart and one checkout. Behind them are many sellers, each with its own stock, shipping and returns, paid out after the operator takes a commission, and the operator has taken on duties the law gives marketplaces: verifying who the sellers are, collecting the sales tax, reporting what they earn, and answering for product safety and consumer rights in ways a plain retailer never did.

This chapter is about product marketplaces run by retailers and brands: the operator platforms (Mirakl, Marketplacer, Shopify and commercetools patterns, Medusa), seller onboarding and verification, catalogs where one product carries many sellers' offers, orders split by seller, commissions and payouts, marketplace facilitator tax and information reporting, and the EU's marketplace duties under the Digital Services Act and the General Product Safety Regulation. Peer-to-peer marketplaces of people and services (rentals, resale, care) are the User-Generated Platforms volume's Peer-to-Peer Marketplaces part, which owns the general law of seller verification ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)), payouts to sellers ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers)), marketplace fraud ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud)) and disputes ([Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes)); this chapter states each rule and links there. Money movement is the Payments volume's [Software Platforms](/books/payments/software-platforms). Selling as a seller on someone else's marketplace is the companion chapters [Selling on Amazon](/books/commerce/selling-on-amazon) and [Walmart, eBay, Etsy, TikTok Shop & Others](/books/commerce/other-marketplaces). The chapter extends `merchants`, `orders` and `order_charges` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `seller_agreements`, `seller_verifications`, `seller_offers` and `commission_rules`.

## How the Platforms Do It

As of October 2026, from the vendors' documentation:

| Platform | Model | Catalog and offers | Orders | Commissions and money |
| --- | --- | --- | --- | --- |
| **Mirakl** | A marketplace platform for operators, with a separate dropship platform, Mirakl Connect for sellers, Mirakl Payout and a catalog platform; customers it names include Lowe's and Macy's | Sellers import products (P41, CSV, XML or XLSX, with error and "non-integrated products" reports) and offers (OF01, "create, update or delete offers"), with offer files recommended every 5 minutes and product files hourly | Order states from `WAITING_ACCEPTANCE` through `SHIPPING`, `SHIPPED`, `RECEIVED` and `CLOSED`, or `REFUSED`; the seller accepts or refuses each line (OR21) | Billing cycles and seller invoices by API; Mirakl Payout is "pay-in agnostic," with KYC status kept in the back office |
| **Marketplacer** | The operator is merchant of record; a seller is a "business entity that places products for sale on the marketplace" | An advert (product) belongs to one seller and has variants carrying SKU, barcodes and stock | The order is the "marketplace-level" container; an invoice is "the part of the overall customer order that an individual Seller has to fulfil" | Commission packages per seller (the docs' example, a "simpler 15% global rate for your newer sellers") with category rates, a price threshold and whether postage is commissionable; remittances pay sellers |
| **Shopify** | No native multi-seller marketplace; Shopify Collective "lets you connect with other Shopify stores and sell each other's products," free on all plans subject to eligibility | Supplier products appear in the retailer's catalog | The retailer's order; the supplier fulfills its items | Between the two Shopify stores |
| **commercetools** | Composable building blocks: channels that "can be used to model warehouses or stores," stores with distribution and supply channels and product selections, business units | Seller assortments as product selections or channels; prices and stock scoped by channel | Split in the operator's own order logic | Built by the operator |
| **Medusa** | Open source; multi-vendor is not built in, and the marketplace recipe adds vendor and vendor admin models in a custom module | Products linked to a vendor | A custom checkout workflow "splits the order into multiple orders, one for each vendor" | Built by the operator, typically on a platform payments provider |

Nautical Commerce, a multi-vendor platform, now redirects to Traide, which describes "the Traide platform, formerly Nautical Commerce" as one part of a software and AI services business. Seller payouts on custom builds run on a platform payments product: Stripe Connect, for platforms that need "to model multiple accounts and move money between parties," or Adyen for Platforms, to "onboard users of your platform or marketplace, process payments for them, and pay out their funds."

Three patterns run through the table:

- **Product and offer are separate records.** Mirakl's two imports, Marketplacer's adverts and variants, and every operator's catalog distinguish what the thing is (one product page) from who sells it at what price and stock (an offer). Two sellers of the same drill are one product and two offers.
- **The shopper's order and the seller's order are different objects.** Marketplacer's order and invoice, Medusa's split into vendor orders and Mirakl's per-seller orders all give each seller its own order to accept, ship and refund, under one checkout.
- **Commission is data per seller and category.** Every operator platform keys commission to the seller's package or contract and the product's category, with exceptions, rather than a single rate.

## Retailer, Marketplace or Both

An operator decides, product by product, whether it's the seller or the venue:

| | Retailer (1P) | Marketplace (3P) | Dropship (the retailer sells, the supplier ships) |
| --- | --- | --- | --- |
| Who owns the stock | Operator | Seller | Supplier, until sold |
| Seller of record to the shopper | Operator | Seller, on most operators | Operator |
| Who sets the price | Operator | Seller (within operator rules) | Operator |
| Who ships and handles returns | Operator | Seller, under the operator's policy | Supplier, under the operator's policy |
| Operator's revenue | Margin | Commission and fees | Margin |
| Duties the law adds | A retailer's | A marketplace's (verification, facilitator tax, reporting, DSA and GPSR) | A retailer's |

The middle column is this chapter. Dropship, where the operator buys from the supplier at the moment of sale and is the seller, is [Drop Ship & Print on Demand](/books/commerce/drop-ship-and-print-on-demand); Mirakl sells it as a separate product for that reason. The choice matters legally as well as commercially: the EU's Digital Services Act withdraws a marketplace's hosting liability shelter for consumer protection claims where it presents an item so that "an average consumer" would believe the platform itself, or someone under its authority or control, is providing it (Article 6(3)). An operator that hides who the seller is, sets the price and fulfills the order can be treated as the seller.

## Seller Onboarding and Verification

Onboarding a seller is a sequence of gates, each a record with a status: the application, the agreement, identity and business verification, the payout account, the tax profile, catalog approval, and a first order under review. The general mechanics, and the US and EU statutes behind them, are the User-Generated Platforms volume's ([The Onboarding Gates](/books/user-generated-platforms/supply-onboarding#the-onboarding-gates)). What a product marketplace must collect, as of October 2026:

- **INFORM (US).** For high-volume sellers of new or unused consumer products (200 or more sales and $5,000 or more in any 12 months of the last 24): bank account information, contact information and a tax ID, collected within 10 days of qualifying, verified within 10 days, recertified at least annually, with name, address and contact disclosed for sellers with $20,000 or more in annual revenue, a reporting channel on each listing, and suspension for non-compliance ([The INFORM Consumers Act](/books/user-generated-platforms/supply-onboarding#the-inform-consumers-act)). Because a retailer's marketplace sells mostly new goods from businesses, nearly every active seller crosses the threshold.
- **DSA trader traceability (EU).** Before a trader may offer to EU consumers: name, address, telephone and email; an identity document or electronic identification; payment account details; trade register and number; and a self-certification to offer only compliant products (Article 30(1)), verified with "best efforts," kept six months after the relationship ends ([DSA Trader Traceability](/books/user-generated-platforms/supply-onboarding#dsa-trader-traceability)).
- **Payments KYC.** The payout provider verifies the seller as a business and its owners before releasing funds ([Onboarding Inside the Product](/books/payments/software-platforms#onboarding-inside-the-product)); Mirakl Payout writes that status back to the operator's back office.
- **Tax identity.** A W-9 or W-8 for US information reporting and the DAC7 data for EU sellers ([DAC7 Data at Onboarding](/books/user-generated-platforms/supply-onboarding#dac7-data-at-onboarding)).
- **Category approval.** Regulated categories (age-restricted goods, pesticides, supplements, children's products) need documents before a seller may list in them, which the Regulated Goods part covers, from [Alcohol, Tobacco & Age-Restricted Goods](/books/commerce/age-restricted-goods) to [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls).

The record the operator keeps is one verification row per regime per seller with its own clock, because a seller can be complete for INFORM and incomplete for the DSA. The User-Generated Platforms volume models the same thing as `trader_profiles` keyed to an account; a product marketplace on this volume's model keys it to the seller's `merchants` row.

## Catalog: Products and Offers

The catalog of a product marketplace has two layers. The **product** is the operator's: one page per thing sold, with its title, attributes, images and category, matched by GTIN where there is one ([GTINs](/books/commerce/products-and-variants#the-marketplaces-check)). The **offer** is the seller's: this seller's price, stock, condition, shipping times and handling for that product. A shopper sees one page with a featured offer and, often, "other sellers."

What has to work:

- **Matching before creating.** A seller's product import is matched to existing products (GTIN, then brand and manufacturer part number, then attributes) and creates a new product only when nothing matches. Mirakl's product import reports "non-integrated products," the ones that didn't match or failed validation, back to the seller. Duplicates fragment reviews, ranking and the buy box.
- **Who owns the content.** When several sellers offer one product, the operator decides whose title and images win, and keeps the rest as proposals. A seller can't overwrite a page another seller's offers sit on.
- **Offers update fast, products slowly.** Mirakl's recommended cadence (offers every 5 minutes, files with products hourly) reflects the difference: price and stock change constantly; product content rarely. The offer feed is the inventory sync of a channel the operator doesn't stock ([Inventory](/books/commerce/inventory)).
- **Required information per offer.** Consumer law makes some fields mandatory on the offer itself: the seller's identity under INFORM and the DSA, and in the EU the product safety information below. The listing interface has to collect them ([Required Disclosures](/books/commerce/product-information#required-disclosures)).
- **Choosing the featured offer.** Price including shipping, delivery promise, seller performance (cancellations, late shipments, returns), and stock; the rule is the operator's to set and should be recorded per decision, like any ranking ([Relevance and Ranking](/books/commerce/site-search-and-merchandising#relevance-and-ranking)).

## Orders Split by Seller

One checkout with items from three sellers becomes three seller orders. The shopper paid once; each seller accepts, ships and refunds only its own lines.

- **Accept or refuse.** Mirakl's orders wait in `WAITING_ACCEPTANCE`; the seller accepts or refuses each line, and refused lines are cancelled and refunded before shipment. An operator without an acceptance step should still give sellers a deadline to confirm, because seller stock is reported, not counted by the operator.
- **Ship by deadline, with tracking.** The seller ships and uploads tracking (Mirakl's OR23 and OR24); the shopper's order status is assembled from all its seller orders ([Order Management](/books/commerce/order-management)).
- **One customer, several sellers' rules.** Returns go to the seller under the operator's policy; shipping charges are per seller; a promotion the operator funds has to be allocated across sellers so each seller's commission and payout is computed on the right base ([Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards)).
- **Payment captured once, settled to many.** The operator, as merchant of record on most operator platforms, authorizes the full amount at checkout and captures per seller as each ships, which is the split-shipment pattern of [Split Shipments and Partial Capture](/books/commerce/taking-payment#split-shipments-and-partial-capture) with a different seller behind each capture.

In the data model, each seller order is an ordinary `orders` row at the seller's location, carrying the operator's checkout so the shopper's view can gather them.

## Commissions, Fees and Payouts

The operator's revenue is a commission on each sale, sometimes with subscription and listing fees. A commission rule needs:

- **A rate by seller and category,** with exceptions: Marketplacer's packages give each seller a base rate and category ("taxon") rates; a launch rate for new sellers is a package.
- **A base.** Item price only, or including shipping (Marketplacer's `appliesToPostage`), before or after operator-funded discounts, excluding tax. The base is the most common source of disputes.
- **Thresholds and minimums.** A different rate above a price (Marketplacer's `thresholdPrice` and `overThresholdRate`), or a minimum fee per item.
- **Reversal on refund.** A refunded line returns its commission, in full or less a retained fee, by rule.
- **Effective dates.** A rate change applies to orders placed after it, never to orders in flight ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

Each order's commission is an `order_charges` row (`kind = 'commission'`, payer the seller, payee the platform) with the rule that computed it, the same pattern the delivery part uses for restaurant commissions ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it)), whose `commission_plans` are flat rates per plan; marketplace rules add the category and seller dimensions.

Payouts follow from the charges: the seller is owed its lines' amounts, less commission and fees, less refunds, released on a schedule after delivery or a holding period. Holds on new sellers, negative balances and clawbacks are [Risk Holds, Negative Balances and Clawbacks](/books/user-generated-platforms/paying-creators-and-sellers#risk-holds-negative-balances-and-clawbacks); the money movement and the provider choice are [Software Platforms](/books/payments/software-platforms#where-the-money-goes) and [Payouts & Settlement](/books/payments/payouts-and-settlement). Mirakl and Marketplacer both produce seller-facing billing documents (Mirakl's billing cycles and invoices, Marketplacer's remittance advice); the operator's equivalent is a statement per period that reconciles to the payout.

## Tax and Information Reporting

**Marketplace facilitator sales tax.** Every US state with a sales tax, plus the District of Columbia and Puerto Rico, has a marketplace facilitator law that shifts "the obligation to collect and remit sales tax from the seller to the marketplace platform" (Avalara's state guide, which lists Washington's as the earliest, January 1, 2018, and Missouri's as the latest, January 1, 2023). Thresholds vary: $100,000 in sales is the most common, $500,000 in California and New York, $250,000 in Alabama and Connecticut. An operator over a state's threshold calculates, collects and remits tax on its sellers' sales there as well as its own. The seller's side, and why the order's `merchant_of_record` and the tax line's remitter decide who files, is [Marketplace Facilitator Laws](/books/commerce/sales-tax-vat-and-duties#marketplace-facilitator-laws); the general law is the User-Generated Platforms volume's [Marketplace Facilitator Tax](/books/user-generated-platforms/pricing-and-fees#marketplace-facilitator-tax). EU VAT has its own deemed-supplier rules for some marketplace sales ([EU VAT: OSS and IOSS](/books/commerce/sales-tax-vat-and-duties#eu-vat-oss-and-ioss)).

**Information returns.** In the US, the payment settlement entity files Form 1099-K for sellers paid more than $20,000 in more than 200 transactions in a year; the One Big Beautiful Bill Act "retroactively restored" that threshold, as the IRS announced on October 23, 2025. In the EU, DAC7 requires platform operators to report sellers' identity and income each year by January 31, with goods sellers below 30 sales and €2,000 excluded ([DAC7 and UK Platform Reporting](/books/user-generated-platforms/paying-creators-and-sellers#dac7-and-uk-platform-reporting)).

## EU Marketplace Duties: DSA and GPSR

An operator selling to EU consumers through third-party traders is an online marketplace under both the Digital Services Act and the General Product Safety Regulation.

**The DSA** adds, beyond trader traceability: an interface "designed and organised in a way that enables traders to comply with their obligations" to show pre-contractual and product safety information, best efforts to check that they have, and reasonable efforts "to randomly check in any official, freely accessible and machine-readable online database" whether offered products have been identified as illegal (Article 31); and, on becoming aware of an illegal product, informing consumers who bought it "within the six months preceding," or publishing the notice when it lacks their contact details (Article 32). Article 29 exempts micro and small enterprises from Articles 30 to 32 unless designated very large ([DSA Trader Traceability](/books/user-generated-platforms/supply-onboarding#dsa-trader-traceability)).

**The GPSR**, applying from December 13, 2024, gives marketplaces their own product safety duties in Article 22 of Regulation (EU) 2023/988: a single point of contact for market surveillance authorities (22(1)) and one for consumers (22(2)); registration on the Safety Gate Portal with that contact point's details; acting on authorities' orders "without undue delay, and in any event within two working days from receipt of the order" (22(4)); processing notices about product safety issues "within three working days from the receipt of the notice" (22(8)); and, under 22(9), designing and organising the online interface so traders can give, for each offer, the Article 19 information: the manufacturer's name and contact address, the EU responsible person where the manufacturer is outside the EU, product identification with a picture, and warnings. Recalls and the seller's GPSR duties are [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls#the-eu-general-product-safety-regulation).

For the build, these are clocks and fields: a removal order is a deadline row two working days out; an illegal-product finding is a query over six months of orders for the product and a notification to each buyer; each offer carries the GPSR fields and can't publish without them.

## How to Build It

Sellers as merchants with agreements and verifications, offers on shared products, seller orders under one checkout, and commission rules, extending `merchants`, `orders` and `order_charges` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model):

```sql
ALTER TABLE merchants
  ADD COLUMN operator_id UUID REFERENCES merchants (id);  -- set for a seller on the operator's marketplace

-- One checkout, one order per seller: orders.checkout_id is Cart & Checkout's column;
-- the seller's confirmation and ship deadlines are orders.accept_by (Orders, Dispatch
-- & Batching) and orders.ship_by (Order Management).

CREATE TABLE seller_agreements (           -- the contract a seller accepted, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_id      UUID NOT NULL REFERENCES merchants (id),
  seller_id        UUID NOT NULL REFERENCES merchants (id),
  terms_version    TEXT NOT NULL,          -- the terms document as published
  commission_package TEXT NOT NULL,        -- 'launch', 'standard', a negotiated package
  payout_schedule  TEXT NOT NULL,          -- 'weekly', 'biweekly', after-delivery days
  categories       TEXT[] NOT NULL,        -- approved categories
  accepted_at      TIMESTAMPTZ NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'terminated')),
  EXCLUDE USING GIST (seller_id WITH =, valid_during WITH &&)
);

CREATE TABLE seller_verifications (        -- one regime's collection and verification, with its clock
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_id        UUID NOT NULL REFERENCES merchants (id),
  regime           TEXT NOT NULL CHECK (regime IN ('inform', 'dsa', 'payments_kyc', 'tax_us',
                     'dac7', 'category')),
  scope            TEXT,                   -- the category for 'category'
  status           TEXT NOT NULL CHECK (status IN ('not_required', 'collecting', 'verifying',
                     'verified', 'failed', 'suspended')),
  became_required_at TIMESTAMPTZ,          -- starts the statutory clock
  due_at           TIMESTAMPTZ,            -- computed from the regime's rule
  verified_at      TIMESTAMPTZ,
  recertify_by     TIMESTAMPTZ,            -- INFORM's at-least-annual certification
  data_ref         TEXT,                   -- vaulted record; identity data never sits here
  provider_ref     TEXT,                   -- the KYC or tax provider's check ID
  disclosure       TEXT NOT NULL DEFAULT 'none' CHECK (disclosure IN ('none', 'full', 'partial')),
  UNIQUE (seller_id, regime, scope)
);

CREATE TABLE seller_offers (               -- one seller's price and stock for one item
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),     -- the operator's catalog item
  seller_id        UUID NOT NULL REFERENCES merchants (id),
  location_id      UUID NOT NULL REFERENCES locations (id), -- where the seller ships from
  seller_sku       TEXT NOT NULL,
  condition        TEXT NOT NULL CHECK (condition IN ('new', 'refurbished', 'used')),
  price            BIGINT NOT NULL CHECK (price >= 0),
  currency         CHAR(3) NOT NULL,
  quantity         INT NOT NULL CHECK (quantity >= 0),      -- as reported by the seller
  handling_days    SMALLINT NOT NULL,
  safety_info      JSONB,                  -- GPSR: manufacturer, EU responsible person, warnings
  status           TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive',
                     'suppressed')),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (seller_id, seller_sku),
  UNIQUE (item_id, seller_id, condition)
);

CREATE TABLE commission_rules (            -- rate by package and category, effective-dated
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_id      UUID NOT NULL REFERENCES merchants (id),
  commission_package TEXT NOT NULL,
  category_id      UUID REFERENCES categories (id),  -- null: the package's base rate
  rate_bps         INT NOT NULL CHECK (rate_bps BETWEEN 0 AND 10000),
  threshold_price  BIGINT,                 -- above this unit price, over_threshold_bps applies
  over_threshold_bps INT,
  minimum_fee      BIGINT,                 -- per unit, minor units
  base             TEXT NOT NULL CHECK (base IN ('item', 'item_and_shipping',
                     'item_after_operator_discounts')),
  refund_retained_bps INT NOT NULL DEFAULT 0,  -- kept on a refunded line
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (operator_id WITH =, commission_package WITH =,
    category_id WITH =, valid_during WITH &&)
);

-- Each seller's gross and fees for a period: their kept lines, and what they pay the operator.
WITH seller_orders AS (
  SELECT o.id, l.merchant_id AS seller_id
  FROM orders o
  JOIN locations l ON l.id = o.location_id
  JOIN merchants m ON m.id = l.merchant_id
  WHERE m.operator_id = $1 AND o.placed_at <@ $2
)
SELECT so.seller_id,
       (SELECT COALESCE(SUM(ol.amount), 0) FROM order_lines ol
         WHERE ol.order_id IN (SELECT id FROM seller_orders s WHERE s.seller_id = so.seller_id)
           AND ol.status NOT IN ('cancelled', 'refunded')) AS gross,
       (SELECT COALESCE(SUM(c.amount), 0) FROM order_charges c
         WHERE c.order_id IN (SELECT id FROM seller_orders s WHERE s.seller_id = so.seller_id)
           AND c.payer = 'merchant' AND c.payee = 'platform') AS fees
FROM (SELECT DISTINCT seller_id FROM seller_orders) so;
```

Design notes:

- **A seller is a merchant with an operator.** Sellers get the whole core model (locations, items, orders, fulfillments, returns) by being `merchants` rows with `operator_id` set; the operator's own retail business is a merchant without one. Multi-tenancy for seller admins follows [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies).
- **Offers point at the operator's items.** The catalog item is the operator's (one product page); the offer is the seller's row against it. When an order is placed, the order line's `item_id` is the catalog item and the seller order's location says whose offer it was, with price and SKU snapshotted on the line ([Snapshots on the line](/books/commerce/commerce-business#the-core-data-model)).
- **Seller stock is reported, not counted.** `seller_offers.quantity` is the seller's claim; reservations against it at checkout follow [Reservations & Holds](/docs/architecture/reservations-and-holds), and the acceptance step is where a wrong claim surfaces.
- **Commission is computed once, at the order, from a versioned rule,** and recorded on the charge with the rule's ID ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)); a statement recomputed later from current rules will disagree with what was paid.
- **Verification gates are enforced in code.** An offer can't go active, and a payout can't release, while a required `seller_verifications` row isn't `verified`; suspension under INFORM or the DSA flips the seller's offers to `suppressed` and records why.
- **Removal orders and recalls are queries plus clocks.** A GPSR removal order or a DSA illegal-product finding suppresses every offer for the item and, for Article 32, finds buyers of the last six months from `order_lines`.

## Auditing

- **Every seller's verification history,** per regime, with the data as collected (in its vault), the checks run, and each suspension and reinstatement; INFORM, the DSA and payments KYC all ask for it.
- **Seller agreements as accepted,** with the terms version and commission package, so a fee dispute is answered from the contract.
- **Commission on every order** with the rule version that computed it, and every reversal.
- **Statements and payouts** reconciled to orders, charges and refunds per period ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation)).
- **Removal orders, illegal-product findings and buyer notices,** with their receipt time, deadline and completion time.
- **Featured offer decisions** with the inputs and rule version, so a seller's complaint about ranking has an answer.

## What This Means for the System You Build

- **Decide where you're the seller and where you're the venue,** product by product, and make the shopper-facing presentation match, because the DSA treats a marketplace that looks like the seller as one.
- **Separate products from offers;** match seller imports to existing products before creating new ones.
- **Split one checkout into one order per seller,** each accepted, shipped and refunded by its seller, captured as it ships.
- **Keep commission as effective-dated rules by package and category,** with an explicit base, recorded on each order.
- **Gate offers and payouts on verification,** with a clock per regime: INFORM, DSA, payments KYC, tax and category approvals.
- **Collect facilitator tax and file information returns** for sellers' sales in every state and country where you cross the thresholds.
- **Treat EU marketplace duties as clocks and fields:** GPSR removal deadlines, per-offer safety information, and six-month buyer notices for illegal products.

## References

**Platform documentation**

- [Mirakl](https://www.mirakl.com/), product lineup and named customers
- [Mirakl: Payout](https://www.mirakl.com/products/mirakl-payout), pay-in agnostic payouts and KYC status in the back office
- [Mirakl: OR11 List orders](https://developer.mirakl.com/content/product/mmp/rest/operator/openapi3/orders/or11), order state codes
- [Mirakl: Orders API](https://developer.mirakl.com/content/product/mmp/rest/operator/openapi3/orders), accepting or refusing lines, tracking and shipment
- [Mirakl: OF01 Import offers](https://developer.mirakl.com/content/product/mmp/rest/seller/openapi3/offers/of01), offer imports and recommended cadence
- [Mirakl: P41 Import products](https://developer.mirakl.com/content/product/mmp/rest/seller/openapi3/products/p41), product imports and their reports
- [Mirakl: Invoicing API](https://developer.mirakl.com/content/product/mmp/rest/operator/openapi3/invoicing), invoices and seller billing cycles
- [Marketplacer: Glossary](https://api.marketplacer.com/docs/glossary/), seller, operator, advert, variant, invoice, order and remittance
- [Marketplacer: Commission packages](https://api.marketplacer.com/docs/operator-api/examples/sellers/howto_commission_packages/), per-seller packages, category rates, thresholds and postage
- [Traide](https://www.thetraide.com/), formerly Nautical Commerce
- [Shopify Help Center: Shopify Collective](https://help.shopify.com/en/manual/online-sales-channels/shopify-collective), selling other Shopify stores' products
- [commercetools: Channels](https://docs.commercetools.com/api/projects/channels), channels as warehouses or stores
- [commercetools: Stores](https://docs.commercetools.com/api/projects/stores), distribution and supply channels and product selections
- [Medusa: Marketplace recipe](https://docs.medusajs.com/resources/recipes/marketplace), vendor modules and splitting orders per vendor
- [Stripe: Connect](https://docs.stripe.com/connect), platforms and marketplaces moving money between parties
- [Adyen for Platforms](https://docs.adyen.com/adyen-for-platforms-model/), onboarding, processing and payouts for marketplace users

**Regulations**

- [DSA Article 6](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_6.html), the consumer protection exception to hosting liability (full-text mirror of Regulation (EU) 2022/2065)
- [DSA Article 30](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_30.html), trader traceability
- [DSA Article 31](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_31.html), compliance by design and random checks
- [DSA Article 32](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_32.html), the right to information about illegal products
- [15 U.S.C. 45f](https://www.law.cornell.edu/uscode/text/15/45f), the INFORM Consumers Act
- [EUR-Lex: Regulation (EU) 2023/988 (GPSR)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988), Article 19's offer information and Article 22's marketplace contact points, Safety Gate registration, deadlines and interface design
- [Mason Hayes Curran: Product safety for providers of online marketplaces](https://www.mhc.ie/latest/insights/product-safety-for-providers-of-online-marketplaces), GPSR contact points, Safety Gate and response deadlines
- [DLA Piper: New rules for consumer products sold online and offline in the EU](https://www.dlapiper.com/insights/publications/2023/05/new-rules-for-consumer-products-sold-online-and-offline-in-eu), the GPSR's application date

**Tax**

- [Avalara: State-by-state guide to marketplace facilitator laws](https://www.avalara.com/us/en/learn/guides/state-by-state-guide-to-marketplace-facilitator-laws.html), coverage, dates and thresholds
- [IRS: Understanding your Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), the $20,000 and 200 transaction threshold
- [IRS: FAQs on Form 1099-K threshold under the One Big Beautiful Bill (IR-2025-107)](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000), the restored threshold
- [European Commission: DAC7](https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/dac7_en), activities in scope and the January 31 deadline
