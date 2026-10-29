+++
title = "Sales Tax, VAT & Duties"
description = "Nexus after Wayfair, marketplace facilitators, taxability, exemption certificates, tax engines, EU OSS and IOSS, UK and Canada, duties, de minimis, DDP and DAP."
category = "Commerce Industry"
order = 2313
part = "Storefront and Checkout"
tags = ["commerce", "sales-tax", "vat", "customs", "duties"]
+++

Every order a store takes raises four tax questions: does the seller have to collect in the buyer's jurisdiction at all, is this item taxable there, at what rate, and who remits it: the seller, a marketplace, or nobody because the buyer is exempt. A cross-border order adds two more: what import VAT and customs duty apply at the border, and who pays them, the seller at checkout or the buyer at the door. The answers change by state, by country, by product, by date and by channel, and the order has to carry the answer it got, line by line, because the tax return and the audit are built from those lines months later.

The general method is the playbook's [Sales Tax](/docs/payments/sales-tax): a tax code per item ([A Tax Code Per Item](/docs/payments/sales-tax#a-tax-code-per-item)), tax as a quote until the invoice finalizes, sourcing as data, exemptions as documents. This chapter covers what commerce adds: economic nexus thresholds and what counts toward them, marketplace facilitator laws, product taxability including shipping, exemption certificates for B2B and resale, Streamlined Sales Tax, tax engines and filing, the EU's VAT e-commerce package and its 2026 customs reform, the UK and Canada, and duties on imports, with the end of the US de minimis exemption and the choice between DDP and DAP. Customs data, HS codes and merchant-of-record services are the later Cross-Border Commerce chapter; tax on hosting and SaaS is the Hosting & Cloud volume's [Tax](/books/hosting-and-cloud/tax). The chapter extends `order_charges` and `items.tax_category` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `tax_registrations`, `exemption_certificates` and `tax_calculations`.

## How the Platforms Do It

As of October 2026, from vendor pricing pages and documentation:

| Engine or service | What it does | Published price |
| --- | --- | --- |
| **Shopify Tax** | Calculation built into Shopify checkout, with product categorization | Free up to $100,000 in sales per store, then, in the US, 0.35% of orders on Basic, Grow and Advanced and 0.25% on Plus (0.25% and 0.15% in the EU, UK and Canada), capped at $0.99 per transaction; stores created from May 13, 2026 count lifetime sales toward the free tier |
| **Stripe Tax** | Calculation, registration and filing for Stripe payments or by API | Tax Basic at 0.5% per transaction where registered (no-code), or 50¢ per API transaction including 10 calculation calls; Tax Complete from $90 a month with registrations and filings included, filing done by Stripe in the US, Canada and EU and by partners elsewhere |
| **TaxJar** | Calculation, reporting and AutoFile; owned by Stripe since 2021 | Starter $39 and Professional $99 a month at 200 orders a month, with 2 or 4 AutoFile credits a year and $50 or $55 per extra filing |
| **Avalara AvaTax** | Calculation, exemption certificate management, registration and returns | Core Compliance at $79 per state a month or $799 a year for businesses under $50 million in revenue; $69 or $699 per state with SST services; registration at $403 per location |
| **Vertex** | Enterprise calculation and compliance, typically through ERP integrations | Not published; sold by quote |
| **SST certified service providers** | Calculation, filing and audit defense for Streamlined member states (AccurateTax, Avalara, Avior, Exactor, Sovos, TaxCloud) | Paid by the member states for qualifying sellers ([Streamlined Sales Tax](#streamlined-sales-tax)) |
| **Shopify duties and Managed Markets** | Duties and import taxes collected at checkout; or Global-e as merchant of record | Duties at 0.85% with Shopify Payments or 1.5% with other providers, temporarily 0.5% for all from February 2, 2025; Managed Markets at 3.25% on Plus or 3.5% otherwise |
| **Zonos Landed Cost** | Duty and tax quotes at checkout for DDP shipping with DHL, FedEx and UPS | Not published; "If customs charges more than we quoted, we pay the difference" |

What the table shows: calculation is cheap and commoditized; registration, filing, exemption management and the guarantee that a quoted duty is right are what cost money. A store's tax setup is a calculation engine plus a decision about who files, per jurisdiction.

## Nexus After Wayfair

Until *South Dakota v. Wayfair* (2018), a state could require a seller to collect sales tax only with a physical presence there; since then each state can require it once sales into the state cross an economic threshold ([US Economic Nexus](/docs/payments/sales-tax#us-economic-nexus)). Every one of the 45 states with a statewide sales tax now has an economic nexus rule; Missouri was the last, effective January 1, 2023. Delaware, Montana, New Hampshire and Oregon have no sales tax; Alaska has none statewide, but local jurisdictions that belong to its remote seller commission collect on remote sales.

Thresholds as of October 2026, from the Sales Tax Institute's state guide (dated August 1, 2026):

| Threshold | States |
| --- | --- |
| $500,000 of sales | California, Texas; New York at $500,000 **and** more than 100 sales |
| $250,000 | Alabama; Mississippi (more than $250,000) |
| $100,000 | Most other states, including Tennessee (lowered from $500,000 on October 1, 2020) and Pennsylvania (which also has a $10,000 notice-and-reporting alternative) |
| Transaction count dropped | North Dakota (December 31, 2018), Washington, California, Colorado and Iowa (2019), Massachusetts (its 100-transaction test, October 1, 2019), Wisconsin (2021), Maine (2022), South Dakota (July 1, 2023), Louisiana (August 1, 2023), Indiana (January 1, 2024), North Carolina and Wyoming (July 1, 2024), Alaska's remote seller code (January 1, 2025), Utah (July 1, 2025), Illinois (January 1, 2026), Kentucky (August 1, 2026) |

The trend is toward a dollar threshold alone: the 200-transaction test that Wayfair upheld is disappearing because it caught small sellers with many cheap orders. What counts toward the threshold (gross or taxable sales, whether marketplace sales count, the measurement period: prior calendar year, current year, or a rolling twelve months) differs by state and is the detail engines track for you.

For the system:

- **Measure sales by destination state from your own orders,** by channel, because a state may count marketplace sales toward your threshold even though the marketplace collects the tax on them; the view in [How to Build It](#how-to-build-it) does this.
- **Physical presence still counts.** Employees, offices and stock are presence regardless of sales, and a merchant using a 3PL or a marketplace's fulfillment network has stock in states it has never visited; every `locations` row with inventory is a state to review for nexus.
- **Registration precedes collection.** Crossing a threshold starts an obligation, typically from a date the state sets; the registration is a record with an effective date, and the engine collects only where a registration row says so.

## Marketplace Facilitator Laws

When the sale happens on a marketplace (Amazon, Walmart, eBay, Etsy, TikTok Shop), state marketplace facilitator laws make the marketplace calculate, collect and remit the sales tax on third-party sales; Missouri adopted its marketplace rules together with economic nexus, effective January 1, 2023. The User-Generated Platforms volume owns the general law and the platform's side ([Marketplace Facilitator Tax](/books/user-generated-platforms/pricing-and-fees#marketplace-facilitator-tax)); for a seller:

- **The order says who collected.** `orders.merchant_of_record = 'marketplace'` and the tax charge's `payee = 'authority'` with the marketplace as remitter mean the seller doesn't remit that tax, and the seller's own engine must not calculate or file it again.
- **The seller may still file.** Some states expect a seller registered for its own sales to report marketplace sales on its return as exempt or deductible; the tax lines carry the remitter so the return can separate them.
- **The marketplace's settlement shows the tax it held.** Reconciling the settlement (the later Selling on Amazon chapter) checks that the marketplace collected what the order says.

Running a marketplace that has these duties is [Running Your Own Marketplace](/books/commerce/running-a-marketplace#tax-and-information-reporting).

## What Is Taxable

Taxability depends on the item, the place and sometimes the price, which is why each item carries a tax category that the engine resolves per jurisdiction ([Taxability Varies by Place](/docs/payments/sales-tax#taxability-varies-by-place)). Retail examples:

- **Clothing.** Pennsylvania's 6% sales tax (plus 1% in Allegheny County and 2% in Philadelphia) exempts "most apparel and clothing"; New York exempts clothing and footwear under $110 an item from state tax but not always local tax. The same shirt is taxable next door.
- **Food.** Pennsylvania exempts food not prepared for immediate consumption; prepared food, candy and soft drinks are taxed differently state to state, which is why a grocery delivery order is many tax categories.
- **Digital products.** The Streamlined agreement defines digital audio-visual works, digital audio works and digital books as their own categories, separate from tangible goods, so each member state decides each one in its taxability matrix.
- **Shipping.** Texas taxes "delivery and shipping charges connected with taxable items"; California excludes separately stated transportation by a carrier up to "the cost of the transportation to the retailer," and a charge labeled only "handling" is not separately stated transportation. Whether the shipping line is taxed depends on the state, on what the goods are, and on how the invoice labels it, so shipping, handling and delivery fees are distinct `order_charges` kinds with their own tax categories.
- **Bundles and discounts.** A bundle mixing taxable and exempt items, and a discount spread across them, need an allocation per line before tax; the engine needs the lines, not the total.

## Exemption Certificates

B2B buyers, resellers, governments and nonprofits buy exempt, and the seller proves it with a certificate on file ([Exemptions Are Documents](/docs/payments/sales-tax#exemptions-are-documents)). Texas states the general rule: "All gross receipts of a seller are presumed subject to sales or use tax unless" a properly completed certificate is accepted, and a certificate is accepted in good faith if it is taken at or before the sale, properly completed and legible, and "the seller does not know, and does not have reason to know, that the sale is not exempt"; certificates are kept for at least four years from the sale.

Multistate forms reduce paperwork but don't settle it:

- **The Streamlined certificate** is "a multi-state form," with reason codes (resale, direct pay permit and others), but "not all states allow all exemptions listed," and the purchaser is liable for tax, interest and penalties on a misused claim.
- **The MTC Uniform Sales & Use Tax Certificate** comes with the warning that the Multistate Tax Commission "cannot guarantee that any state will accept this certificate," that the seller "must exercise care" to accept it in good faith, and that "states may change their policies without informing" the Commission.

For the system, a certificate is a document with a customer or company, the jurisdictions it covers, the exemption reason, its number, and validity dates; the checkout applies it only to that customer, in those jurisdictions, for items the reason covers (a resale certificate doesn't exempt office supplies the reseller uses). Expiring certificates need renewal before they lapse, and an order taken exempt without a valid certificate on file is tax the seller owes. The later B2B Commerce chapter covers company accounts that carry them.

## Streamlined Sales Tax

The Streamlined Sales and Use Tax Agreement is the states' attempt at uniformity: common definitions, uniform sourcing rules, a shared exemption certificate, taxability matrices per state, and one registration system. As of October 2026 it has 23 full member states and Tennessee as an associate member. Its practical value to a remote seller is the certified service provider program: for a seller registered through the Streamlined registration system that qualifies (including one that qualifies only because it crossed a member state's economic threshold, with no fixed place of business in the state for more than 30 days, among other conditions), "the state will compensate the CSP" for calculating, filing, remitting and handling notices and audits in member states. The provider may charge for non-member states and extra services, some providers aren't offering the free service, and qualifying "does not determine if a Seller has a legal obligation to collect."

## Tax Engines and Filing

The engine call is part of checkout and every later change to the order: quote while the shopper edits, commit when the order is placed, adjust on refunds and edits, void on cancellation ([Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes); [Tax Engines](/docs/payments/sales-tax#tax-engines)). The commerce specifics:

- **Send lines, addresses and the item's category.** Ship-from location and ship-to address (or the pickup store), each line's category and amount, each charge (shipping, handling, gift wrap) as its own line, the customer's exemption, and the channel; tax comes back per line and per jurisdiction.
- **Commit with the order's ID and the checkout's version,** so the committed calculation matches the total the shopper authorized, and a retried commit is idempotent.
- **Refunds reverse tax by line.** A return of one item reverses that item's tax at the rate charged, not today's rate; a full refund reverses shipping tax too.
- **Pickup and store sales source to the store.** In-store and pickup orders are taxed at the store's location; shipped orders generally at the destination, with origin-sourcing exceptions ([Sourcing Is Data](/docs/payments/sales-tax#sourcing-is-data)).
- **Filing follows registrations.** Returns per jurisdiction and period are built from committed calculations; an engine that files (Avalara Returns, TaxJar AutoFile, Stripe Tax Complete, an SST provider) needs the same data, and a merchant that files itself needs the reports. Either way the committed tax lines in the order system must match what was filed.

## EU VAT: OSS and IOSS

Since July 1, 2021 the EU's VAT e-commerce package taxes consumer sales where the goods arrive and gives sellers one registration to report them:

- **Distance sales inside the EU** are taxed in the consumer's country above an EU-wide threshold of €10,000 a year (current and preceding calendar year), which applies only to sellers established in a single member state; a seller from outside the EU has no threshold. The **Union OSS** scheme reports them in one quarterly return in the seller's member state of identification.
- **The non-Union scheme** covers business-to-consumer services by sellers not established in the EU, also quarterly.
- **Imports of low-value goods** in consignments of "intrinsic value not exceeding EUR 150" (excise goods excluded) can be taxed at checkout under the **Import OSS** (IOSS), with a monthly return; the parcel then clears customs without VAT collected at the door. Above €150, import VAT is collected at import.
- **Marketplaces are deemed suppliers** for imported low-value goods sold to consumers through them, and for intra-EU sales by sellers not established in the EU; the marketplace charges and remits the VAT, and the seller's sale is to the marketplace.

**The 2026 customs reform.** The €150 threshold was also the customs duty exemption, and the EU has removed it. From July 1, 2026, the EU applies "a temporary €3 customs duty per item" to low-value consignments up to €150, charged per item category in the parcel, running until July 1, 2028; from November 1, 2026 a €2 Union handling fee applies; online platforms become "importers for distance sales"; and an EU Customs Data Hub becomes mandatory for e-commerce on July 1, 2028. The reform was published in the Official Journal on September 19, 2026. For a non-EU store, duty is now owed on every parcel, whatever its value.

**ViDA.** The VAT in the Digital Age package (Directive (EU) 2025/516 and Regulation 2025/517), adopted March 11, 2025, phases in from 2027 to 2035: OSS and IOSS clarifications from January 1, 2027; deemed-supplier rules for short-term accommodation and passenger transport platforms and an extended OSS from July 1, 2028; digital reporting for cross-border business sales from July 1, 2030. Member states may already require domestic e-invoicing. The Payments volume covers e-invoicing ([EU and UK](/books/payments/eu-and-uk)).

## UK VAT

Since January 1, 2021, the UK taxes imported goods in consignments of £135 or less at the point of sale: "the seller must charge and account for VAT at the point of sale" (unless the buyer is VAT-registered and gives its number), and the £15 low-value consignment relief ended. The rule as written covers goods "sold directly to customers (not through an online marketplace)"; sales through a marketplace follow separate HMRC rules for online marketplaces. Above £135, import VAT is collected at the border. The registration threshold for UK businesses is £90,000 of taxable supplies (since April 1, 2024), but a non-established seller must register for supplies "of any value in the UK." The £135 relief from customs duty is ending too: the government brought its removal forward to October 2028.

## Canada GST/HST

Since July 1, 2021, Canada's digital economy measures require non-resident vendors and distribution platform operators to register for GST/HST under a simplified framework once their taxable supplies to Canadian consumers exceed $30,000 CAD over 12 months; this covers goods sold from inventory held in Canada, for example "in a fulfillment warehouse," and platforms that "facilitate the supply of qualifying goods." Shipments from abroad clear under the low-value thresholds: for courier shipments from the US or Mexico under CUSMA, up to C$40 enters with no duty or tax, C$40 to C$150 pays tax but no duty, and above C$150 both apply; from other countries, and by mail from anywhere, the threshold is C$20. The Payments volume covers Canadian rails ([Canada](/books/payments/canada)).

## Duties, De Minimis, DDP and DAP

Import duty is separate from VAT and sales tax: a tariff on the goods' customs value by their classification and origin, owed by the importer of record. Three things changed what that means for a store:

- **The US ended de minimis.** The rule that let shipments valued at $800 or less enter the US duty-free was suspended for all countries from August 29, 2025 by executive order, suspended indefinitely for all modes by CBP interim final rules effective June 24, 2026, and is repealed by statute from July 1, 2027. Every inbound parcel to a US consumer is now dutiable and needs entry data. The User-Generated Platforms volume has the full sequence ([The End of De Minimis](/books/user-generated-platforms/social-commerce-and-live-shopping#the-end-of-de-minimis)).
- **The EU ended its €150 duty exemption** from July 1, 2026, with the flat per-item duty above.
- **The UK will end its £135 duty relief** by October 2028.

The commercial question is who pays at the border, and the Incoterms rules name the two answers. Under **DAP** (Delivered at Place) the seller delivers to the destination and "the buyer must manage and pay for all import clearance formalities": the shopper meets a carrier's bill for duty, tax and a brokerage fee at the door, and often refuses the parcel. Under **DDP** (Delivered Duty Paid) "the seller is ultimately responsible for the import clearance process": the shopper pays a landed-cost total at checkout and the seller (or its provider) pays the border. The ICC warns that DDP is hard for a foreign seller to do itself, which is why stores reach it through providers: Shopify collects duties at checkout and needs carriers that support DDP labels; Shopify Managed Markets makes Global-e the merchant of record with most orders shipped DDP; Zonos quotes landed cost and guarantees its quote. My default for consumer orders is DDP wherever a provider supports the lane, because a surprise bill at the door is a refused parcel, a return and a lost customer.

For the order, duty and import VAT collected at checkout are `order_charges` of kind `duty` and `tax`, payee `authority`, with the provider as remitter; under DAP they don't appear on the order at all, and the checkout says so.

## How to Build It

Registrations decide where tax is collected, certificates decide who is exempt, calculations record what the engine said at each step, and tax charges on the order carry the jurisdiction, rate, base and remitter:

```sql
CREATE TABLE tax_registrations (         -- where this merchant must collect, from when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID NOT NULL REFERENCES merchants (id),
  country             CHAR(2) NOT NULL,
  subdivision         TEXT,                -- ISO 3166-2 for a US state or Canadian province
  scheme              TEXT NOT NULL CHECK (scheme IN ('sales_tax', 'vat', 'gst_hst', 'qst',
                        'eu_oss_union', 'eu_oss_non_union', 'eu_ioss', 'uk_vat',
                        'ca_simplified', 'sst')),
  registration_number TEXT NOT NULL,
  basis               TEXT NOT NULL CHECK (basis IN ('physical', 'economic', 'voluntary',
                        'scheme')),
  effective_during    DATERANGE NOT NULL,
  filing_frequency    TEXT CHECK (filing_frequency IN ('monthly', 'quarterly', 'semiannual',
                        'annual')),
  filed_by            TEXT NOT NULL CHECK (filed_by IN ('merchant', 'engine', 'sst_csp',
                        'merchant_of_record')),
  document_id         UUID REFERENCES documents (id),  -- the registration letter
  UNIQUE (merchant_id, country, subdivision, scheme, effective_during)
);

CREATE TABLE exemption_certificates (    -- why a buyer pays no tax, and where
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id    UUID REFERENCES customers (id),
  company_id     UUID REFERENCES companies (id),
  form           TEXT NOT NULL CHECK (form IN ('sst', 'mtc', 'state', 'other')),
  reason         TEXT NOT NULL CHECK (reason IN ('resale', 'government', 'nonprofit',
                   'manufacturing', 'agricultural', 'direct_pay', 'other')),
  jurisdictions  TEXT[] NOT NULL,         -- ISO 3166-2 codes it covers
  number         TEXT,                    -- the buyer's permit or registration number
  valid_during   DATERANGE NOT NULL,
  document_id    UUID NOT NULL REFERENCES documents (id),  -- the signed certificate
  accepted_by    TEXT NOT NULL,           -- staff or system that accepted it, and when
  accepted_at    TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked', 'rejected')),
  CHECK (customer_id IS NOT NULL OR company_id IS NOT NULL)
);

CREATE TABLE tax_calculations (          -- each engine call that mattered
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  checkout_id       UUID REFERENCES checkouts (id),
  checkout_version  INT,
  order_id          UUID REFERENCES orders (id),
  kind              TEXT NOT NULL CHECK (kind IN ('quote', 'commit', 'adjustment', 'void')),
  engine            TEXT NOT NULL,        -- 'avalara', 'stripe_tax', 'shopify_tax', 'internal'
  engine_ref        TEXT,                 -- the engine's transaction ID
  ship_from         JSONB NOT NULL,
  ship_to           JSONB NOT NULL,
  exemption_id      UUID REFERENCES exemption_certificates (id),
  total_tax         BIGINT NOT NULL,
  currency          CHAR(3) NOT NULL,
  request_ref       TEXT NOT NULL,        -- storage key of the request and response as exchanged
  calculated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (checkout_id IS NOT NULL OR order_id IS NOT NULL)
);

ALTER TABLE order_charges
  ADD COLUMN tax_calculation_id UUID REFERENCES tax_calculations (id),
  ADD COLUMN jurisdiction       TEXT,           -- e.g. 'US-TX', 'US-TX-AUSTIN', 'DE'
  ADD COLUMN tax_rate           NUMERIC(8, 6),  -- 0.0825, applied to base_amount
  ADD COLUMN remitter           TEXT CHECK (remitter IN ('merchant', 'marketplace',
                                  'merchant_of_record', 'carrier', 'none'));

-- Sales by destination state over the trailing 12 months, for threshold monitoring.
SELECT f.dropoff ->> 'subdivision' AS state,
       o.channel,
       SUM(l.amount) AS gross_sales,
       COUNT(DISTINCT o.id) AS orders
FROM orders o
JOIN order_lines l ON l.order_id = o.id
JOIN fulfillment_lines fl ON fl.order_line_id = l.id
JOIN fulfillments f ON f.id = fl.fulfillment_id
WHERE o.placed_at >= NOW() - INTERVAL '12 months'
  AND f.dropoff ->> 'country' = 'US'
GROUP BY 1, 2;
```

Design notes:

- **The tax line names its remitter.** `remitter` on each tax or duty charge is what keeps marketplace-collected tax off the merchant's return and what reconciles a merchant-of-record provider's statement; a tax line without one is unreconcilable.
- **Rate and base are snapshots.** Storing `tax_rate` with each line, applied to the `base_amount` column [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it) already added to `order_charges`, lets a refund reverse exactly what was charged and lets an auditor recompute it, even after the engine's rates have moved on.
- **Keep the engine's request and response.** `request_ref` points at the exchange as sent and received, the evidence in a dispute with the engine or an auditor about what was asked and answered.
- **Registrations are effective-dated.** Whether tax should have been collected depends on whether a registration was in force on the order's date; `effective_during` answers it, and the threshold query above is what tells someone to add the next row before it is late.
- **Thresholds are rules, not code.** The query measures; the comparison runs against each state's current threshold and measurement period held as data ([Rules as Data](/docs/architecture/rules-as-data)), because states keep changing them.
- **Certificates are documents first.** The signed certificate is a `documents` row, kept at least as long as the longest state retention period that applies; the certificate row is its parsed, enforceable form.

## Auditing

- **Every tax line with its jurisdiction, rate, base, remitter and calculation,** so a return can be rebuilt from orders and an auditor can recompute any sale.
- **Registrations and when they started,** with the threshold evidence that triggered each.
- **Exemption certificates as signed and as applied,** with each exempt order pointing at the certificate it relied on.
- **Engine exchanges as sent and received,** and filed returns matched to committed calculations by period.
- **Duties and import VAT collected at checkout** matched to the provider's or carrier's statements per shipment.

## What This Means for the System You Build

- **Give every item a tax category and every charge its own line,** so the engine taxes shipping, handling and fees by their own rules.
- **Measure sales by destination state continuously,** including marketplace sales, and treat every stocked location as possible physical presence.
- **Record registrations with effective dates,** and collect only where one is in force.
- **Mark the remitter on every tax line:** merchant, marketplace, merchant of record, or none.
- **Accept exemptions only with a valid certificate on file,** scoped to the buyer, the jurisdictions and the reason.
- **Quote while the shopper edits, commit with the order, and reverse by line** at the rate charged.
- **Use OSS and IOSS for EU consumer sales,** and plan for duty on every EU parcel from July 2026.
- **Collect duty and import tax at checkout (DDP)** where a provider supports the lane, and say so plainly where you don't.

## References

**Law and regulators**

- [Sales Tax Institute: Economic nexus state guide](https://www.salestaxinstitute.com/resources/economic-nexus-state-guide), thresholds, transaction tests and the dates states dropped them, as of August 1, 2026
- [BDO: Missouri final state to enact sales tax economic nexus and marketplace legislation](https://www.bdo.com/insights/tax/missouri-final-state-to-enact-sales-tax-economic-nexus-and-marketplace-legislation), the last of 45 sales-tax states, effective January 1, 2023
- [Pennsylvania Department of Revenue: Sales, use and hotel occupancy tax](https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/sales-use-and-hotel-occupancy-tax), rates and clothing and food exemptions
- [Texas Comptroller: Sales tax collection FAQ](https://comptroller.texas.gov/taxes/sales/faq/collection.php), taxable delivery and shipping charges
- [California CDTFA: Regulation 1628, Transportation charges](https://cdtfa.ca.gov/lawguides/vol1/sutr/1628.html), the exclusion for separately stated carrier charges and handling
- [Texas Administrative Code: 34 TAC § 3.287](https://www.law.cornell.edu/regulations/texas/34-Tex-Admin-Code-SS-3-287), presumption of taxability, good faith acceptance and four-year retention of certificates
- [Wisconsin DOR: Streamlined Sales and Use Tax Certificate of Exemption](https://www.revenue.wi.gov/DORForms/exemptcertf.pdf), the multistate form, reason codes and purchaser liability
- [Multistate Tax Commission: Uniform Sales & Use Tax Certificate FAQ](https://mtc.gov/resources/faq-uniform-sales-and-use-tax-certificate/), no guarantee of acceptance and good faith care
- [Streamlined Sales Tax Governing Board](https://www.streamlinedsalestax.org/), 23 full members and Tennessee as associate
- [Streamlined Sales Tax: Free sales tax services](https://streamlinedsalestax.org/for-businesses/free-sales-tax-services), state-compensated CSP services and eligibility
- [Streamlined Sales Tax: CSP-compensated seller definitions](https://www.streamlinedsalestax.org/certified-service-providers/freeservices/volunteer-definitions), the provider list and limits of the designation
- [Streamlined Sales Tax: Digital products definition amendment](https://www.streamlinedsalestax.org/docs/default-source/amendments/2006-amendments/digital-products-definition.pdf), digital audio-visual works, audio works and books as separate definitions
- [European Commission: VAT One Stop Shop](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en), the Union, non-Union and Import schemes, the €10,000 threshold, the €150 limit, return frequency and deemed suppliers
- [European Commission: EU customs reform](https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en), the €3 per-item duty from July 1, 2026, removal of the €150 exemption, the €2 handling fee and the Customs Data Hub
- [KPMG: EU customs reform enters into force with new e-commerce rules](https://kpmg.com/us/en/taxnewsflash/news/2026/09/tnf-eu-customs-reform-enters-into-force-with-new-e-commerce-rules.html), Official Journal publication on September 19, 2026 and the duty's end in July 2028
- [European Commission: VAT in the Digital Age](https://taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age-vida_en), adoption and the 2027 to 2035 phases
- [GOV.UK: VAT and overseas goods sold directly to customers in the UK](https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk), point-of-sale VAT on consignments of £135 or less sold directly, and separate rules for marketplace sales
- [GOV.UK: VAT Notice 700/1 supplement](https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-supplement--2), the £90,000 threshold from April 1, 2024
- [GOV.UK: VAT Notice 700/1](https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat), no threshold for non-established sellers
- [GOV.UK: Acceleration of cheap import reforms (June 23, 2026)](https://www.gov.uk/government/news/government-backs-high-street-with-acceleration-of-cheap-import-reforms-and-crackdown-on-dodgy-online-sellers), ending the £135 customs duty relief by October 2028
- [Canada Revenue Agency: GST/HST and the digital economy](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst.html), measures in effect from July 1, 2021
- [Canada Revenue Agency: Sales of qualifying goods threshold](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register/sales-goods-threshold-amounts.html), the $30,000 threshold for non-resident vendors and platforms
- [CBSA: CUSMA low value shipments](https://www.cbsa-asfc.gc.ca/services/cusma-aceum/lvs-efv-eng.html), C$40 and C$150 courier thresholds and C$20 otherwise
- [Greenberg Traurig: US trade developments (June 2026)](https://www.gtlaw.com/en/insights/2026/6/us-trade-developments-ieepa-refund-processing-de-minimis-suspension-and-section-301-investigation-against-germany), the de minimis suspension and its July 1, 2027 statutory repeal
- [KPMG: CBP indefinitely suspends de minimis exemption for all modes](https://kpmg.com/us/en/taxnewsflash/news/2026/06/cbp-suspends-de-minimis-exemption.html), the June 24, 2026 interim final rules
- [ICC Academy: Incoterms 2020, DAP or DDP](https://academy.iccwbo.org/incoterms/article/incoterms-2020-dap-or-ddp/), who clears and pays import formalities under each rule

**Vendors**

- [Shopify Help Center: Shopify Tax pricing](https://help.shopify.com/en/manual/taxes/shopify-tax/pricing), the free tier, rates by plan and region and the per-transaction cap
- [Shopify Help Center: Charging duties and import taxes](https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties), fees and DDP label requirements
- [Shopify Help Center: Managed Markets](https://help.shopify.com/en/manual/international/managed-markets/overview), Global-e as merchant of record, DDP and fees
- [Stripe: Tax pricing](https://stripe.com/tax/pricing), Tax Basic and Tax Complete pricing and filing coverage
- [TaxJar: Joining Stripe](https://www.taxjar.com/blog/taxjar-will-be-joining-stripe-to-help-build-the-worlds-tax-compliance-infrastructure), the 2021 acquisition
- [TaxJar: Pricing](https://www.taxjar.com/pricing), plans and AutoFile credits
- [Avalara: Pricing](https://www.avalara.com/us/en/products/pricing.html), Core Compliance per state, SST services and registration
- [Zonos: Landed Cost](https://zonos.com/landed-cost), duty and tax quotes at checkout and the quote guarantee
