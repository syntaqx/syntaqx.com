+++
title = "Business Models & Unit Economics"
nav_title = "Business Models"
description = "DTC, retail 1P, marketplace 3P, wholesale, subscription, drop-ship, print on demand, B2B and omnichannel, with margins, CAC, LTV and returns from filings."
category = "Commerce Industry"
order = 2303
part = "The Business"
tags = ["commerce", "business-models", "unit-economics", "dtc", "wholesale"]
+++

A product can reach a buyer in a handful of ways, and each is a different business: a brand selling on its own site keeps the whole price and pays for every customer it gets; a retailer buys at a discount and earns the spread; a marketplace seller rents someone else's customers for a commission; a wholesaler ships by the pallet and waits to be paid; a subscription brand pays once to acquire a customer it bills for years; a drop-shipper never touches the goods. Most growing brands run several of these at once, and the mix decides what software they need far more than their size does.

This chapter describes each model, the unit economics that decide whether it works (contribution margin, customer acquisition cost, lifetime value, payback and returns), what public companies have disclosed about them, and what each model requires from the system. It adds `item_costs` and `acquisition_spend` to [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), and the per-order splits it builds on are in [How the Money Splits](/books/commerce/commerce-business#how-the-money-splits).

## How the Companies Do It

Public companies disclose their models in their filings, each with its own metrics. As of October 2026, from the latest filings:

| Company | Model | Latest year | What it discloses |
| --- | --- | --- | --- |
| **Warby Parker** | DTC brand, online and 323 stores, calling itself "channel agnostic" | $871.9 million net revenue, 54.0% gross margin in 2025 | 2.69 million Active Customers; $324 Average Revenue per Customer |
| **Allbirds** | DTC brand moving to distributors abroad | $152.5 million net revenue, 41.0% gross margin in 2025 | Majority of sales through direct channels; closed its full-price US stores in January 2026 |
| **Chewy** | Online retailer with a subscription program (Autoship) | $12.60 billion net sales, 29.8% gross margin in fiscal 2025 | 21.3 million active customers; $591 net sales per active customer; Autoship 83.3% of net sales |
| **Amazon** | Retailer (1P) and marketplace (3P) | $716.9 billion net sales in 2025 | Online stores $269.3 billion, third-party seller services $172.2 billion, advertising $68.6 billion |
| **Costco** | Membership warehouse retailer | $297.2 billion net sales, 11.09% gross margin in fiscal 2026 | $5.9 billion membership fees; 92.3% US and Canada renewal rate |
| **ZAGG** (public until 2021) | Omnichannel brand: wholesale, carriers, own site, franchised kiosks | $521.9 million net sales, 35.1% gross margin in 2019 | Net sales by channel; Verizon Wireless 17% and Best Buy 10% of net sales |

Three patterns run through the table:

- **Gross margin falls as the model moves away from the brand.** A brand selling its own goods direct (Warby Parker, Allbirds) reports 40% to 55%; a retailer reselling other brands' goods (Chewy, Best Buy, Walmart) reports roughly 20% to 30%; a membership warehouse reports 11% and earns its profit from fees.
- **Recurring revenue is disclosed when it is large.** Chewy reports Autoship as a share of sales and Costco reports renewal rates because both are the business; brands with smaller subscription programs don't break them out.
- **Acquisition cost is rarely disclosed after the IPO.** Warby Parker's 2021 S-1 described its customer acquisition cost; its 10-K doesn't. The figures below come mostly from offering documents, written when companies most wanted to show their economics.

## The Models

### Direct to Consumer (DTC)

The brand sells its own products on its own site or app, sets the price, owns the customer data, ships from its warehouse or a 3PL, and handles returns and support. It keeps the full retail price and the full gross margin, and pays for traffic, payments, fraud, fulfillment and service out of it. DTC is where a brand learns who its customers are, which is why brands that sell mostly through retailers still run a site. The systems: a commerce platform, payments, tax, a 3PL or warehouse system, email and SMS, reviews, returns and analytics ([Choosing & Hosting a Store](/books/commerce/choosing-a-platform)).

### Retailer (1P)

The retailer buys goods from brands or distributors at a wholesale cost, owns the inventory and its risk, sets the shelf and online price, and sells to consumers in its stores and on its site. Amazon describes its first-party business this way in its 10-K: "We generally recognize gross revenue from items we sell from our inventory as product sales." The retailer's margin is the spread, and the filings show it: 22.5% gross profit at Best Buy for fiscal 2026, 24.2% at Walmart and 27.9% at Target for the years ended January 2026, blended across everything each sells. Retailers add revenue the spread doesn't show: fees from brands (allowances, co-op, retail media), memberships, and marketplaces beside their own inventory. The systems: merchandising and buying, purchase orders and EDI with hundreds of suppliers, store and warehouse inventory, POS, and a large OMS.

From the brand's side, selling to a retailer as a vendor (Amazon calls this 1P) is wholesale: the brand's customer is the retailer, and the brand loses control of the retail price.

### Marketplace Seller (3P)

The seller lists its products on someone else's marketplace, keeps ownership of the goods and the price, and pays the marketplace a referral fee on each sale plus, often, fulfillment and advertising fees ([How the Money Splits](/books/commerce/commerce-business#a-marketplace-3p-sale)). The marketplace owns the customer, the checkout and the rules, and can suppress a listing or suspend an account. Third-party sellers were 61% of Amazon's paid units in the fourth quarter of 2025. The economics are a DTC brand's with a toll in place of most acquisition cost; the risk is dependence on one marketplace's algorithm, fees and policy. The systems: listing and feed management, marketplace order and settlement integration, inventory sync across channels, and inbound shipments to the marketplace's fulfillment network.

### Wholesale

The brand sells cases or pallets to retailers, distributors and, for some categories, wireless carriers, at a wholesale price on payment terms. Volume is high and acquisition cost per unit low, but the margin per unit is lower than DTC, payment comes weeks after shipment, and the retailer deducts for late or mislabeled shipments, promotions and markdowns. A brand's largest customers can be a large share of its sales and receivables, which is a concentration risk the filings must disclose. The systems: EDI or a retailer's vendor portal, routing-guide compliance, ASN and carton labels, an ERP for receivables and deductions, and sell-through data from retailers.

### Subscription DTC

The brand sells a product on a schedule, charged to a stored card, so one acquisition becomes a stream of orders. Two public examples show the range:

- **Pestie** describes itself as a "do-it-yourself pest control subscription" that "builds a plan around your home, your pests, and your local climate" and ships automatically "when it's the ideal time to reapply," every three months in most areas; each shipment carries concentrate, mixing bags and gloves, the first adds a sprayer, and the brand prices itself against professional service at $300 to $500 or more a year. A subscription of pesticides is also regulated product shipping: the pesticide registration and hazmat rules are [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat#diy-pesticide-subscriptions), and the professional-service version of the same business is a Field Operations [service agreement](/books/field-operations/service-agreements) applying [regulated materials](/books/field-operations/regulated-materials).
- **Dollar Shave Club** built a grooming subscription that Unilever agreed to buy in July 2016; Unilever reported selling it to Nexus Capital Management, completed on November 1, 2023, after recording an impairment on it in 2022. The price Unilever paid in 2016 was reported only in the press, not in Unilever's filings. <!-- source-gap: dsc-acquisition-price | secondary | Unilever's 2016 purchase price for Dollar Shave Club (about $1 billion) | closes with: the acquisitions note in Unilever's Annual Report and Accounts 2016, or a Unilever release stating the price; the 2016 20-F's narrative names the deal and a €2.4 billion goodwill and intangibles increase without a price, and the release page returned 403 | checked: 2026-10-29 -->

The economics turn on retention: each renewal costs nothing to acquire, so lifetime value rises with every month a subscriber stays, and churn (cancellations, failed payments, skips that turn into cancellations) is the number the business watches. Subscriptions also concentrate legal risk in renewal and cancellation ([The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)). The systems: a subscription engine or app (Recharge, Skio, the platform's own), stored credentials and dunning, skip, swap and pause, and renewal notices; [Subscription Commerce](/books/commerce/subscription-commerce) covers them.

### Drop-Ship

The seller lists and sells products that a supplier ships directly to the customer; Shopify's definition is that dropshipping "lets you sell products without handling inventory or shipping." The seller carries no inventory and earns the difference between its price and the supplier's, and the seller is still the merchant of record, responsible for the delivery promise, returns and the product's safety and claims. Retailers use the same model at scale to list far more products online than they stock (Rithum's Dsco network is one such platform). The systems: supplier catalogs and stock feeds, order routing to the supplier, tracking back from it, and supplier scorecards; [Drop Ship & Print on Demand](/books/commerce/drop-ship-and-print-on-demand) covers them.

### Print on Demand

A variant of drop-ship where the supplier prints the seller's design on a blank product after each order. Printful states "no upfront costs": the seller pays a base product cost per order covering the blank, one print placement and fulfillment, with shipping and tax extra, and an optional $24.99 monthly plan lowers product prices. Printify's Premium plan, $24.99 a month billed yearly, takes up to 20% off its products. Margins are thin and set by the base cost; the business is design and marketing.

### B2B

The seller sells to businesses buying for their own use: a distributor to contractors, a manufacturer to dental offices, a supplier to schools. Orders come from company accounts with several buyers, at contract prices, often against a purchase order and an approval, paid on terms by invoice ([B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables)). Order values are larger, reorders are frequent, and the sales team and the customer's procurement system are channels in their own right. The systems: company accounts and price lists, quotes, net terms and credit limits, punchout to procurement systems and EDI; [B2B Commerce](/books/commerce/b2b-commerce) covers them.

### Omnichannel Brands

Most brands of size run several of the models above at once. ZAGG, a mobile accessories brand that was public until it was taken private in February 2021, shows the shape in its last annual report:

| Channel, 2019 | Net sales | Share |
| --- | --- | --- |
| Indirect: big-box retailers, wireless retailers, distributors and other resellers | $453.7 million | 87% |
| Website, direct to consumer | $42.4 million | 8% |
| Franchised kiosks and a company-owned store | $25.9 million | 5% |

Verizon Wireless was 17% of 2019 net sales and Best Buy 10%; in 2018 a distributor, Superior Communications, had been 23%. Gross margin was 35.1%. The same product sold to a carrier, to Best Buy, on Amazon and on zagg.com earns four different margins, carries four different return rules and ships in four different ways, which is why channel belongs on the order and margin is computed per channel, not per product. Warby Parker, which calls itself "channel agnostic" and doesn't split revenue by channel, and Allbirds, which moved its international business to distributors and closed its full-price US stores, show brands rebalancing the mix as acquisition costs and store economics change.

## The Unit Economics

Five measures decide whether a model works. The definitions differ by company, so mine are below and every company's figure is quoted on its own definition.

**Contribution margin.** What an order leaves after every cost that scales with it: net revenue (after discounts and returns), minus the cost of goods, inbound freight and duty, minus fulfillment, packaging and postage, minus payment processing, marketplace fees and retailer deductions. Some operators count variable marketing in it too, which makes it the margin after acquiring the order; I keep two numbers, before and after acquisition spend, so a channel with no acquisition cost (wholesale) can be compared with one that is all acquisition cost (paid social to DTC). Warby Parker's S-1 reported Contribution Margin, on its own definition, of 25% in 2018, 26% in 2019 and 21% in 2020.

**Customer acquisition cost (CAC).** Marketing spend in a period divided by new customers acquired in it. Blended CAC (all spend over all new customers) flatters paid channels with organic customers; paid CAC is spend over customers attributed to it, and attribution is its own problem ([Attribution Models](/books/commerce/acquisition-and-attribution#attribution-models)). Warby Parker's S-1 said its CAC "has averaged 15% of Average Revenue Per Customer" from 2018 through 2020 and that it was "profitable on a customer's first order." Casper's S-1 described "nearly $3 of revenue, net of promotions for every $1 of marketing spend."

**Lifetime value (LTV).** The contribution a customer generates over the time they keep buying, measured by cohort (customers acquired in the same month) rather than projected from an average. Warby Parker's S-1 reported a Sales Retention Rate, on its own definition, of about 50% within 24 months and nearly 100% over 48 months for its 2015 to 2019 cohorts. For a subscription, LTV is contribution per renewal times expected renewals; for a retailer it is net sales per active customer, which Chewy reports at $591 for fiscal 2025.

**Payback.** The months until a cohort's cumulative contribution repays its acquisition cost. First-order payback, as Warby Parker described, is the safest position a DTC brand can be in; a subscription brand typically accepts a loss on the first order and pays back over renewals, which only works if retention holds. Casper's S-1 targeted 18 to 24 months to pay back a store's investment, the same idea applied to a location.

**Returns.** The National Retail Federation and Happy Returns estimated 2025 US returns at $849.9 billion, 15.8% of sales, with an online return rate of 19.3% and 9% of returns fraudulent. A return reverses revenue and adds two shipments, inspection and often a write-down, so a category with high returns (apparel, shoes) can have a strong gross margin and a weak contribution margin. Allbirds' 10-K notes that "customers have abused our return policy." [Returns & Exchanges](/books/commerce/returns-and-exchanges) covers the mechanics.

The arithmetic is simple and the inputs are hard: costs change with every purchase order, marketplace fees arrive weeks later in settlements, retailer deductions months later, returns up to the end of the return window. My rule: compute contribution per order from recorded rows (lines, charges, payments, costs in force on the day), recompute it as late costs arrive, and never store a margin that can't be traced to them.

## How Each Model Shapes the System

| Model | Who the customer is | What the system must do well |
| --- | --- | --- |
| DTC | A consumer | Storefront, checkout, payments and fraud, tax, shipping promises, returns, email and SMS, attribution |
| Retailer (1P) | A consumer; brands are suppliers | Buying and purchase orders, EDI, store and warehouse inventory, POS, pricing and markdowns |
| Marketplace seller (3P) | A consumer, through the marketplace | Listings and feeds, order and settlement integration, inventory sync, marketplace fulfillment, account health |
| Wholesale | A retailer, carrier or distributor | EDI, routing guides, ASNs and labels, receivables and deductions, sell-through |
| Subscription | A subscriber | Schedules, skip and swap, stored credentials, dunning, renewal notices and cancellation |
| Drop-ship and print on demand | A consumer | Supplier catalogs and stock, order routing, tracking from suppliers, supplier performance |
| B2B | A company and its buyers | Company accounts, price lists, quotes, approvals, terms and credit, punchout |
| Omnichannel | All of the above | One catalog and one inventory across channels, channel on every order, margin per channel |

The rule I take from the table: build the model you have, with the data model that admits the others. A DTC brand that adds Amazon needs listings and settlements; one that adds Best Buy needs companies, EDI documents and deductions; one that adds subscriptions needs schedules and dunning. If channel, merchant of record, cost and charges are already on every order, each addition is new tables, not a rewrite.

## How to Build It

Costs are dated, because margin has to use the cost in force when the item was sold; acquisition spend is recorded by channel and day, because CAC is spend over customers acquired in the same window:

```sql
CREATE TABLE item_costs (                -- what an item cost, by component, over time
  item_id      UUID NOT NULL REFERENCES inventory_items (item_id),
  component    TEXT NOT NULL CHECK (component IN ('product', 'inbound_freight', 'duty',
                 'packaging')),
  amount       BIGINT NOT NULL CHECK (amount >= 0),   -- per unit, minor units
  currency     CHAR(3) NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('purchase_order', 'standard', 'manual')),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (item_id WITH =, component WITH =, valid_during WITH &&)
);

CREATE TABLE acquisition_spend (         -- marketing spend by channel and day
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  channel      TEXT NOT NULL,            -- 'paid_social', 'search', 'affiliate', 'retail_media'
  campaign_ref TEXT,                     -- the ad platform's campaign ID
  spend_date   DATE NOT NULL,
  amount       BIGINT NOT NULL CHECK (amount >= 0),
  currency     CHAR(3) NOT NULL,
  source       TEXT NOT NULL,            -- the connected system it was imported from
  UNIQUE (merchant_id, channel, campaign_ref, spend_date)
);

-- Contribution per order before acquisition spend, from recorded rows only.
CREATE VIEW order_margin AS
WITH goods AS (
  SELECT l.order_id,
         SUM(l.amount) AS goods,
         SUM(l.quantity * COALESCE(
           (SELECT SUM(c.amount) FROM item_costs c
             WHERE c.item_id = l.item_id AND c.valid_during @> o.placed_at), 0)) AS cogs
  FROM order_lines l
  JOIN orders o ON o.id = l.order_id
  WHERE l.parent_line_id IS NULL
  GROUP BY l.order_id
), charges AS (
  SELECT order_id,
         SUM(amount) FILTER (WHERE payer = 'customer' AND payee = 'merchant') AS charged,
         SUM(amount) FILTER (WHERE payer = 'merchant') AS merchant_costs
  FROM order_charges
  GROUP BY order_id
), refunds AS (
  SELECT order_id, SUM(amount) AS refunded
  FROM order_payments WHERE kind = 'refund'
  GROUP BY order_id
)
SELECT o.id AS order_id, o.channel, o.channel_partner, o.placed_at,
       g.goods + COALESCE(c.charged, 0) - COALESCE(r.refunded, 0)      AS net_revenue,
       g.cogs,
       COALESCE(c.merchant_costs, 0)                                    AS fees_and_discounts,
       g.goods + COALESCE(c.charged, 0) - COALESCE(r.refunded, 0)
         - g.cogs - COALESCE(c.merchant_costs, 0)                       AS contribution
FROM orders o
JOIN goods g        ON g.order_id = o.id
LEFT JOIN charges c ON c.order_id = o.id
LEFT JOIN refunds r ON r.order_id = o.id;
```

Design notes:

- **Costs not on the order are joined, not copied.** Postage and 3PL fees arrive on carrier and 3PL invoices; [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it) and [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#how-to-build-it) attach them to fulfillments, and the view gains a column per source. Until then, contribution is labeled as before fulfillment cost.
- **Cost in minor units per unit, by component.** Landed cost (freight and duty allocated across a purchase order) replaces the standard cost when receipts post, in [Landed Cost](/books/commerce/purchasing-and-replenishment#landed-cost); the date range keeps old orders on old costs.
- **Wholesale deductions arrive late.** A retailer's chargeback months after shipment is an `order_charges` row with `kind = 'chargeback_deduction'` on the original order, so the order's contribution changes and the channel's history is restated.
- **CAC is a cohort query.** New customers are those whose first order falls in the window; CAC is `acquisition_spend` in the window over that count, by channel where attribution allows; LTV and payback are cumulative `order_margin` per cohort by month since acquisition. The definitions are code, rerun on restatement, the pattern in [Operating Metrics](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows).
- **Margin and costs are confidential.** Item costs and contribution are finance data; keep them out of anything a storefront, an app or a marketplace integration reads ([Authorization](/docs/security/authorization)).

## Auditing

- **The cost in force on each sale.** Which cost row priced each order line's cost of goods, so a margin report can be reproduced after costs change.
- **Late adjustments as rows.** Every settlement fee, deduction and refund that changed an order's contribution after the fact, with when it arrived and from which document.
- **Metric definitions and their versions.** The written definition of contribution, CAC, LTV and payback each report used, since figures shared with investors or lenders must be reproducible.

## What This Means for the System You Build

- **Know which models you run,** and expect to add more; put channel and merchant of record on every order from the start.
- **Record costs by component and date,** and compute cost of goods from the cost in force when sold.
- **Compute contribution from rows,** before and after acquisition spend, and recompute as settlements, deductions and returns arrive.
- **Measure CAC, LTV and payback by cohort,** with written definitions, never from averages.
- **Treat returns as a margin line,** not an afterthought; online return rates near one in five decide category economics.
- **Keep cost and margin data confidential** and out of customer-facing systems.

## References

**Filings**

- [Warby Parker: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1504776/000150477626000006/wrby-20251231.htm), net revenue, gross margin, Active Customers, Average Revenue per Customer, stores and "channel agnostic"
- [Warby Parker: Form S-1 (August 24, 2021)](https://www.sec.gov/Archives/edgar/data/1504776/000162828021017546/warbyparkerincs-1.htm), CAC as 15% of Average Revenue per Customer, profit on the first order, Contribution Margin and cohort sales retention
- [Allbirds: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1653909/000162828026022192/bird-20251231.htm), net revenue, gross margin, direct channels, distributors abroad, store closures and return policy abuse
- [Chewy: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1766502/000176650226000034/chwy-20260201.htm), net sales, gross margin, active customers, net sales per active customer and Autoship share
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), first-party revenue recognition and net sales by group
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), third-party seller unit mix
- [Costco: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/909832/000090983226000093/cost-20260830.htm), net sales, gross margin, membership fees and renewal rate
- [Best Buy: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/764478/000076447826000009/bby-20260131.htm), gross profit rate
- [Walmart: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm), gross profit rate
- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), gross margin rate
- [ZAGG Inc: Form 10-K for 2019](https://www.sec.gov/Archives/edgar/data/1296205/000129620520000040/zagg-20191231.htm), net sales by channel, gross margin and customers over 10% of net sales
- [ZAGG Inc: Completion of the merger (February 22, 2021)](https://www.sec.gov/Archives/edgar/data/1296205/000162828021002618/a20210222exhibit991.htm), the take-private
- [Casper Sleep: Form S-1 (January 10, 2020)](https://www.sec.gov/Archives/edgar/data/1598674/000104746920000166/a2240404zs-1.htm), revenue per dollar of marketing and the store payback target
- [Unilever: Form 6-K (July 2016)](https://www.sec.gov/Archives/edgar/data/0000217410/000119163816002271/ulvr201607216k.htm), the agreement to purchase Dollar Shave Club
- [Unilever: Form 6-K (February 8, 2024)](https://www.sec.gov/Archives/edgar/data/217410/000165495424001469/a4104c.htm), the sale of Dollar Shave Club to Nexus Capital Management, completed November 1
- [Unilever: Form 20-F for 2023](https://www.sec.gov/Archives/edgar/data/217410/000021741024000017/ul-20231231.htm), the 2022 impairment and the disposal

**Company pages**

- [Pestie](https://www.pestie.com/), the do-it-yourself pest control subscription, plans by home, pests and climate, shipments when it's time to reapply
- [Shopify Help Center: Dropshipping](https://help.shopify.com/en/manual/products/dropshipping), the definition of dropshipping
- [Printful: Pricing](https://www.printful.com/pricing), no upfront costs, base product cost per order and the Growth plan
- [Printify: Pricing](https://printify.com/pricing/), the Premium plan and product discount

- [destinationCRM: CommerceHub rebrands as Rithum](https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/CommerceHub-Rebrands-as-Rithum-161800.aspx), Dsco inside Rithum

**Research**

- [NRF: Consumers expected to return nearly $850 billion in merchandise in 2025](https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025), total returns, the share of sales, the online return rate and the fraudulent share
