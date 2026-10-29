+++
title = "Cross-Border Commerce"
description = "Selling across borders: markets, local prices and payments, merchant-of-record services, HS codes and customs data, de minimis, duties and export controls."
category = "Commerce Industry"
order = 2323
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "cross-border", "customs", "duties", "export-controls", "merchant-of-record"]
+++

A parcel that crosses a border carries a second set of paperwork the shopper never sees. The screen protector a Canadian orders from a US brand's site needs a customs description precise enough for an officer to identify it, a tariff classification, a country of origin, a value and an answer to who pays the duty and tax: the shopper at the door, or the brand at checkout. The same order raises questions that never come up at home. What currency is the price in, and does it end in .99? Which local payment methods does the shopper expect? Is the product even allowed in, and is the buyer someone the US government forbids selling to? And who is the seller of record in a country where the brand has no company, no tax registration and no returns address?

The rules changed more between 2025 and 2026 than in the previous decade. The US ended duty-free de minimis treatment for every country in August 2025, a year before the 2027 statutory repeal Congress had passed; the EU abolished its €150 customs duty exemption on 1 July 2026 and put a flat €3 per item in its place; the UK is ending its £135 duty relief by October 2028. A system built when an $800 parcel crossed into the US with no duty and almost no data now needs ten-digit tariff codes on every postal entry.

This chapter covers markets and localized pricing and payment, the merchant-of-record services that sell on a brand's behalf, Incoterms, HS codes and customs data, customs entry and duties in the US, EU, UK and Canada, restricted goods, and export controls. It extends `price_lists` (the market kind) and `items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Computing the VAT, GST and sales tax on each order is Sales Tax, VAT & Duties, and for digital goods [VAT and GST on Electronic Services](/books/hosting-and-cloud/tax#vat-and-gst-on-electronic-services); currency conversion and settlement are the Payments volume's [Cross-Border & FX](/books/payments/cross-border-and-fx); the parcel carriers that carry international shipments are Shipping & Carriers; and goods a merchant imports for its own stock land in [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#landed-cost).

## How the Platforms Do It

As of October 2026, from each company's own pages and filings:

| Provider | Model | Reach | Pricing (published) | Notes |
| --- | --- | --- | --- | --- |
| **Global-e** | Merchant of record: it sells to the shopper, collects duties and taxes and pays the brand | Shoppers "in over 200 destinations markets and territories"; settles "in more than 100 currencies" | Not published | $6.57 billion GMV and $962.2 million revenue in 2025; "exclusive provider of MoR services" for Shopify's first-party Managed Markets; merged with Flow Commerce in 2021 and runs Borderfree |
| **Shopify Managed Markets** | Shopify's built-in cross-border selling, with Global-e as merchant of record | US merchants in the continental US and certain Canadian and UK stores | 3.25% transaction fee on Plus, 3.5% on other plans, plus a currency conversion fee and Shopify Payments processing | Most destinations ship duties paid; "the duty and tax amounts displayed to your customer at checkout are guaranteed"; requires Shopify Payments |
| **Shopify Markets** | The merchant remains the seller; Shopify localizes prices and checkout | Per the merchant's markets | Per Shopify plan; a fee applies to duties collected at checkout | Per-market price adjustments, rounding rules and fixed prices; duties and import taxes at checkout need HS codes on products |
| **Zonos** | Landed cost calculation and checkout; the merchant stays the seller | Per destination | Landed cost guarantee at $2 per order plus 10% of duties, taxes and non-Zonos fees | Optional cross-dock export processing at $5 |
| **ESW** | Cross-border ecommerce services for brands | "200+" markets | Not published | "150+ global brands" |
| **Reach** | Merchant of record ("your legal reseller for cross-border transactions") | "200+ markets," "130+ local currencies" | Not published | Sells in local currencies |
| **Passport** | Seller of record, duties paid delivery | 200+ countries | Not published | Says on its site that Global-e acquired it in 2026 and that it operates independently |

For digital goods, Paddle sells as merchant of record for "5% + 50¢" per transaction and Stripe's Managed Payments makes Stripe the merchant of record for software and digital content; both are built for digital products, not parcels.

Three patterns:

- **The merchant of record is the product.** The large services don't just calculate duty; they become the seller in the shopper's country, so the brand's tax registrations, local payment contracts and consumer-law duties there become the provider's. That is what the fee buys.
- **Guaranteed landed cost is the shopper-facing promise.** Shopify Managed Markets guarantees the duty and tax shown at checkout; Zonos sells a guarantee per order. Either way someone has to classify the product correctly, because the guarantee is priced on the classification.
- **The field consolidated around Shopify.** Global-e merged with Flow and, by Passport's own account, acquired Passport, and is Shopify's exclusive first-party merchant of record. A brand on another platform still has several independent providers, but the default for a Shopify brand is one company.

## Markets

A market is a set of countries sold to the same way: a currency, a price list, a language, the payment methods offered, the duties and taxes policy, a shipping profile and, for some, a separate seller of record. "EU" can be one market or twenty-seven; Canada is usually its own. The market is resolved from the shopper's shipping country (not the IP address or the browser language, which only suggest it), and it is a property of the order, recorded at checkout with the price list and the rules it used, because a refund or an audit a month later must use the same ones.

What varies by market, and where each lives in the model:

- **Currency and prices.** A `price_lists` row of kind `market` per currency, either converted from the base price at a rate with rounding rules or set by hand. Shopify supports both: percentage adjustments by market, rounding rules, and fixed per-product prices. Setting prices in local currency rather than converting the shopper's card at the end is the pattern [Multi-Currency Pricing Versus Conversion at Checkout](/books/payments/cross-border-and-fx#multi-currency-pricing-versus-conversion-at-checkout) recommends, and the exchange risk it creates is [Who Takes the Exchange Risk](/docs/payments/multi-currency#who-takes-the-exchange-risk).
- **Prices with or without duty and tax.** EU and UK consumers expect prices including VAT; a duties-paid market can include duty in the price or show it as a line at checkout.
- **Payment methods.** Cards and wallets everywhere, plus the methods each country expects: iDEAL (now "iDEAL | Wero") in the Netherlands, Pix in Brazil, where Stripe's documentation notes a 3.5% Brazilian IOF tax on cross-border payments and per-customer limits of $3,000 a day and $10,000 a month. The Payments volume's [Wallets & Local Methods](/books/payments/wallets-and-local-methods) covers the methods themselves.
- **Shipping, duties policy and restrictions.** Which carriers and services serve the market, whether duties are prepaid (DDP) or collected at delivery (DAP), and which items can't be sold there.
- **Seller of record.** The merchant itself, a local entity, or a merchant-of-record service.

## The Merchant of Record

Selling abroad as yourself means being the seller in law in each country: registered for VAT or GST where the rules require it, charging and remitting it, taking local payment methods through a provider that will contract with you, meeting each country's consumer rules (the EU's 14-day withdrawal right among them, [Return Policies and the Law](/books/commerce/returns-and-exchanges#return-policies-and-the-law)), clearing customs and paying duty if you sell duties paid, and handling returns from abroad.

A merchant-of-record service takes that over by buying the goods from the brand and reselling them to the shopper. The shopper's receipt names the provider; the provider collects the price, duty and tax, files the returns, takes the fraud and chargeback risk on the transaction, and pays the brand its price net of fees, usually in the brand's currency. The brand keeps the storefront, the catalog and the fulfillment. The trade-offs:

- **Cost.** A percentage of each order (3.25% to 3.5% for Shopify Managed Markets, plus currency conversion) against the cost of registrations, filings and local payment contracts.
- **Control.** The provider sets which markets, payment methods and products it supports, and can decline a product it won't import.
- **Data.** The order and the customer exist in the provider's system first; the brand's order is a copy, and its customer record has the provider's terms attached.
- **Accounting.** The brand's sale is to the provider, not the shopper, which changes revenue presentation and where tax liability sits (Commerce Accounting covers the treatment).

The model needs to know which applies: an order's `merchant_of_record` in the core model gains a value for a merchant-of-record service, and the order's charges show the provider's fee.

## Incoterms: DAP and DDP

An Incoterm says where the seller's responsibility for cost and risk ends. Two matter for parcels to consumers, in the ICC's Incoterms 2020 terms:

- **DAP (Delivered at Place).** "The seller delivers the goods and transfers the risks to the buyer once the goods are at the agreed place of destination"; the buyer handles import clearance and pays the duty and tax, typically to the carrier at the door, plus the carrier's fee for collecting them.
- **DDP (Delivered Duty Paid).** The seller also handles import clearance and pays the "tariffs, taxes, permits and licenses required by the customs authorities," so the shopper pays nothing on delivery.

The old term DDU is gone: "Two new Incoterms rules – DAT and DAP – have replaced the Incoterms 2000 rules DAF, DES, DEQ and DDU" in 2010, though carriers and checkouts still say "DDU" for the DAP experience. Merchant-of-record services ship duties paid to most destinations (Shopify Managed Markets does), and the UPU launched a duties-paid option for postal operators shipping to the US in 2025, because a surprise bill at the door produces refused packages, return shipping both ways and a lost customer. DDP needs the duty and tax calculated at checkout, which needs the classification, origin and value of every item, and someone registered to pay it at import: the merchant, its carrier or broker, or the merchant-of-record service. For B2B shipments and a merchant's own imports, Incoterms (FOB, EXW, CIF and the rest) decide who pays freight and insurance and therefore what goes into landed cost.

## HS Codes and Customs Data

Customs runs on classification. The World Customs Organization's Harmonized System "comprises more than 5,000 commodity groups; each identified by a six digit code," is used by "more than 200 countries and economies," and "over 98 % of the merchandise in international trade is classified in terms of the HS." Countries extend the six digits for their own tariffs and statistics:

| Code | Digits | Used for |
| --- | --- | --- |
| **HS** | 6 | Shared by every country; the international base |
| **US HTSUS** | 10 | US imports; CBP's new postal informal entry requires "all applicable 10-digit HTSUS classification(s)" |
| **US Schedule B** | 10 | US exports, on the export filing; Census publishes a lookup tool and a yearly edition |
| **EU Combined Nomenclature** | 8 | EU imports and statistics: "an 8-digit code number followed by a description and a duty rate" |
| **EU TARIC** | Extends the CN | "All measures relating to the Common Customs Tariff": suspensions, quotas, anti-dumping duties |

The HS changes every five years or so. HS 2022 has been in force since 1 January 2022; the WCO adopted HS 2028 in January 2026, with 299 sets of amendments, giving "1,229 headings and 5,852 subheadings," in force on 1 January 2028. A code valid today may not exist then, so classifications are stored with the nomenclature edition they belong to.

The other data customs asks for, per item:

- **A description an officer can understand.** EU guidance for its ICS2 pre-arrival system requires "a plain language description that is precise enough for Customs services to be able to identify the goods," and rejects general terms such as "consolidated," "general cargo," "parts" or "freight of all kinds"; its examples replace "Gifts" with "Dolls, Remote Control cars." ICS2 has been fully operational for all transport modes since 1 September 2025. A product title ("The Everyday Tote") is not a customs description ("Women's handbag, polyester"); the item needs its own.
- **Country of origin,** where the item was made or substantially transformed, not where it shipped from. US law requires every article of foreign origin to be marked "as legibly, indelibly, and permanently as the nature of the article (or container) will permit" with "the English name of the country of origin" (19 U.S.C. 1304).
- **Value, quantity and weight,** in the declared currency.
- **The commercial invoice,** which for a US import must include the port of entry, the parties, a detailed description, quantities, the purchase price per item and its currency, itemized charges, and the country of origin, in English (19 CFR 141.86).

Classifying a catalog is work: a tool or a broker can suggest a code, but the merchant (or its merchant-of-record service) is responsible for it, and a wrong code is a wrong duty, a delayed parcel or a penalty. Classify per item, record who classified it and when, and reclassify when the product or the nomenclature changes.

## Customs Entry and Duties

### United States

For thirty years most consumer parcels entered the US duty free under Section 321's de minimis exemption, raised to $200 in 1993 and $800 in 2016. CBP processed "over 1.36 billion de minimis shipments" in fiscal 2024, "an almost ten-fold increase" over 2015. Then, in sequence:

| Date | What changed |
| --- | --- |
| May 2, 2025 | Executive Order 14256 ends de minimis for goods from China and Hong Kong |
| August 29, 2025 | Executive Order 14324, "Suspending Duty-Free De Minimis Treatment for All Countries," applies "regardless of value, country of origin, mode of transportation, or method of entry"; postal carriers may pay the country's tariff rate per package or, for six months, a flat $80, $160 or $200 per item; CBP later reports every qualified party chose the ad valorem method |
| February 20, 2026 | The Supreme Court holds in *Learning Resources, Inc. v. Trump* that the emergency powers statute (IEEPA) "does not authorize the President to impose additional tariffs"; the same day, Executive Order 14388 continues the de minimis suspension, and a Section 122 proclamation imposes a 10% surcharge for up to 150 days |
| June 24, 2026 | CBP interim final rules: shipments of $800 or less "arriving through all modes other than the international postal network must utilize formal or informal entry procedures," and a new postal informal entry process for mail of $2,500 or less, with ten-digit HTSUS codes, country of origin and value per item, and duty paid monthly |
| January 20, 2027 | The postal informal entry compliance date, moved from October 22, 2026 |
| July 1, 2027 | De minimis repealed by statute (the One Big Beautiful Bill Act, Public Law 119-21, section 70531) |

What replaced the Section 122 surcharge when it ran out in July 2026, and at what rates, I could confirm only from secondary sources, so the rate a given country's goods pay today has to be checked against CBP's current guidance before it goes into a rate table. <!-- source-gap: us-tariffs-after-section-122 | secondary | US tariffs applied after the Section 122 surcharge expired (July 2026), including reported Section 301 actions, and the courts' rulings on Section 122 | closes with: the USTR notice or Federal Register document and the court opinion, opened | checked: 2026-10-28 -->

The practical result for a merchant shipping into the US: every parcel is now a customs entry with a duty. A non-postal shipment uses formal or informal entry (informal up to $2,500), filed by a broker or the carrier, and the "Type 86" entry that let low-value parcels clear on a manifest is gone. The data the merchant must supply per item is what the June 2026 rules list: description, HTSUS code, country of origin, quantity and value. Bona fide gifts of up to $100 and traveler exemptions are unaffected. Foreign senders felt it first: on September 6, 2025 the Universal Postal Union reported that 88 postal operators had suspended some or all services to the US, and that postal traffic to the US fell 81% on August 29 against the week before.

### European Union

The EU's import VAT and customs duty changed on different dates:

- **VAT, since 1 July 2021.** The VAT exemption for small consignments ended and the Import One-Stop Shop (IOSS) lets a seller or marketplace collect VAT at checkout on consignments up to €150, so the parcel clears without VAT due at the border. The schemes collected more than €125 billion of VAT by 2026, and more than 193,000 businesses had registered by the end of 2025. Sales Tax, VAT & Duties covers registration and the rates.
- **Customs duty, from 1 July 2026.** The €150 duty exemption ended. Until 1 July 2028, a temporary flat €3 duty applies per item category in a parcel, "based on tariff classification and not quantity": five T-shirts pay €3, three T-shirts and a watch pay €6. The seller or importer declares and pays it.
- **Handling fee, from 1 November 2026.** A €2 Union handling fee per item.
- **The customs reform.** Formally adopted on 16 September 2026, it makes platforms and sellers the "importers for distance sales," creates an EU Customs Authority in 2027 and an EU Customs Data Hub, mandatory "for e-commerce on 1 July 2028." The €3 interim duty runs until 1 July 2028, the date the data hub becomes mandatory for e-commerce sellers.

### United Kingdom

Since 1 January 2021, VAT on consignments of £135 or less has been charged at the point of sale by the seller, and online marketplaces "will be deemed, for VAT purposes, to be making the supply to the UK consumer"; the £135 test applies to the consignment, not each item, and consignments over £135 follow normal import rules. The customs duty relief for those low-value consignments is ending: on 23 June 2026 the government accelerated the change "by six months to October 2028," and its policy paper describes new data, payment and compliance requirements for sellers and marketplaces.

### Canada

For courier shipments from the US or Mexico under CUSMA, goods valued up to CAD 40 enter "duty and tax free," from CAD 40.01 to CAD 150 duty free with taxes due, and above CAD 150 with both; by post, CAD 20 and under is duty and tax free from any country. Alcohol, cannabis and tobacco are excluded from the courier thresholds.

## Restricted Goods

Every destination has goods it bans or restricts, every carrier has its own list on top, and the strictest of the two applies. The categories that catch consumer brands:

- **Lithium batteries.** International air transport follows IATA's Dangerous Goods Regulations, with limits by watt-hours and configuration. USPS accepts internationally only lithium cells and batteries "properly installed in the equipment they are intended to operate," at most four cells or two batteries per shipment, 20 Wh per cell and 100 Wh per battery for lithium-ion; batteries packed with or separate from the equipment are prohibited. A power bank shipped alone is a battery, not equipment. Pesticides, Chemicals & Hazmat covers hazmat shipping in depth.
- **Alcohol and tobacco.** Excluded from simplified regimes nearly everywhere: US postal informal entry excludes them and requires formal entry, the UK's point-of-sale VAT scheme excludes excise goods, and Canada's thresholds exclude them. Alcohol, Tobacco & Age-Restricted Goods covers the domestic rules.
- **Regulated products.** Cosmetics, supplements, food, pesticides, medical devices and children's products face the destination's own registration and safety rules; a US postal shipment of goods regulated by a partner government agency needs formal entry. Product Safety, Compliance & Recalls covers them.
- **Wildlife, plants and their parts,** under CITES and national rules (leather, exotic woods, shells).

The model is a restriction per item per destination, checked when the cart's shipping country is known, so the shopper learns at the product page or the cart that an item can't ship there, not after the order is placed.

## Export Controls

Selling from the US is an export, and US export law applies to every one, consumer parcels included:

- **The Export Administration Regulations (EAR).** Items on the Commerce Control List carry an Export Control Classification Number (ECCN); "items subject to the EAR which are not listed on the CCL are designated as 'EAR99'" (15 CFR 734.3), and most consumer goods are EAR99 and need no license to most destinations. The common exception in consumer electronics is encryption: mass-market items are "classified as ECCN 5A992 or 5D992," released from the strictest controls under License Exception ENC (15 CFR 740.17), with a self-classification report for some items due "no later than February 1 the following year." The Country Chart doesn't apply to Cuba, Iran, North Korea and Syria, which are handled under 15 CFR parts 742 and 746, and Russia and Belarus face part 746 controls of their own.
- **Sanctions.** OFAC's comprehensive sanctions, as of its October 26, 2026 FAQ update, cover Cuba, Iran, North Korea, the Crimea region and the so-called Donetsk and Luhansk People's Republic regions of Ukraine; Syria came off that list after the 2025 revocations, though list-based sanctions on named people there remain, and BIS said in August 2025 that EAR99 items and consumer communications devices "can generally be exported to Syria without an export license." A storefront blocks shipping and billing addresses in sanctioned jurisdictions. The Payments volume's [Sanctions and Data on Cross-Border Flows](/books/payments/cross-border-and-fx#sanctions-and-data-on-cross-border-flows) covers the money side.
- **Restricted parties.** The Consolidated Screening List is "a consolidation of multiple export screening lists of the Departments of Commerce, State, and the Treasury," including the Entity List, the Denied Persons List and OFAC's SDN list. Screen the buyer's name and address before shipping an export, and rescreen when the lists change; [Sanctions Screening and Background Checks](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks) covers matching and false positives.
- **The export filing.** Electronic Export Information (EEI) is filed in the Automated Export System for a shipment over $2,500 per Schedule B code, and regardless of value for anything needing a license, ITAR items, and some other cases (15 CFR 30.2 and 30.37). A consumer parcel of a few hundred dollars usually needs none, but a B2B shipment or a reseller's bulk order can.

## Returns From Abroad

A cross-border return is expensive: international postage back, a second customs entry into the merchant's country, and duty paid on the way out that may or may not be recoverable. Most merchants respond with a local returns address or consolidator per region, a returnless refund below a value threshold, or a merchant-of-record service that handles returns as part of its contract. The policy shown to the shopper must still meet local law: the EU's 14-day withdrawal right applies to an EU consumer buying from a US store that targets them ([Return Policies and the Law](/books/commerce/returns-and-exchanges#return-policies-and-the-law)).

## How to Build It

```sql
CREATE TABLE markets (                   -- countries sold to the same way
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id        UUID NOT NULL REFERENCES merchants (id),
  name               TEXT NOT NULL,      -- e.g. 'Canada', 'European Union'
  countries          CHAR(2)[] NOT NULL, -- ISO 3166-1 alpha-2
  currency           CHAR(3) NOT NULL,
  price_list_id      UUID NOT NULL REFERENCES price_lists (id),  -- kind = 'market'
  prices_include_tax BOOLEAN NOT NULL,
  duties_policy      TEXT NOT NULL CHECK (duties_policy IN ('ddp', 'dap')),
  seller_of_record   TEXT NOT NULL CHECK (seller_of_record IN ('merchant', 'local_entity',
                       'mor_service')),
  mor_provider       TEXT,               -- e.g. 'global_e', when seller_of_record = 'mor_service'
  rounding_rule      JSONB,              -- e.g. {"to": 0.99} or {"to": 5, "mode": "nearest"}
  status             TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused')),
  UNIQUE (merchant_id, name)
);

CREATE TABLE item_customs (              -- what customs needs to know about an item
  item_id            UUID NOT NULL REFERENCES items (id),
  hs_code            CHAR(6) NOT NULL,   -- the shared six digits
  hs_edition         TEXT NOT NULL,      -- e.g. 'HS2022'
  national_codes     JSONB NOT NULL DEFAULT '{}',  -- {"US": "6205200010", "EU": "62052000"}
  customs_description TEXT NOT NULL,     -- plain language, not the product title
  country_of_origin  CHAR(2) NOT NULL,
  export_classification TEXT NOT NULL DEFAULT 'EAR99',  -- or an ECCN such as '5A992'
  restricted_in      CHAR(2)[] NOT NULL DEFAULT '{}',   -- destinations it can't ship to
  hazmat_class       TEXT,               -- e.g. lithium battery in equipment
  classified_by      TEXT NOT NULL,      -- person, broker or tool
  classified_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (item_id, hs_edition)
);

ALTER TABLE orders
  ADD COLUMN market_id   UUID REFERENCES markets (id),
  ADD COLUMN incoterm    TEXT CHECK (incoterm IN ('DAP', 'DDP')),
  ADD COLUMN landed_cost_ref TEXT;      -- the duty and tax quote shown at checkout, guaranteed or not

CREATE TABLE customs_declarations (      -- the data filed for one shipment crossing a border
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id       UUID NOT NULL REFERENCES shipments (id),
  direction         TEXT NOT NULL CHECK (direction IN ('export', 'import')),
  origin_country    CHAR(2) NOT NULL,
  destination_country CHAR(2) NOT NULL,
  regime            TEXT NOT NULL,       -- e.g. 'us_informal', 'us_postal_informal', 'eu_ioss',
                                         -- 'uk_point_of_sale_vat', 'ca_cusma_courier', 'eei'
  incoterm          TEXT NOT NULL,
  importer_of_record TEXT NOT NULL,      -- merchant, carrier, broker or MoR service
  tax_scheme_ref    TEXT,                -- IOSS number, UK VAT number, filer code
  currency          CHAR(3) NOT NULL,
  lines             JSONB NOT NULL,      -- per item: description, national code, origin,
                                         -- quantity, weight, value, duty rate, duty
  duty_total        BIGINT NOT NULL DEFAULT 0,
  tax_total         BIGINT NOT NULL DEFAULT 0,
  filed_by          TEXT NOT NULL,       -- the carrier, broker or provider that filed it
  filing_ref        TEXT,                -- entry number, AES ITN, ENS reference
  document_id       UUID REFERENCES documents (id),  -- commercial invoice as sent
  status            TEXT NOT NULL CHECK (status IN ('prepared', 'filed', 'released', 'held',
                      'rejected')),
  filed_at          TIMESTAMPTZ
);

CREATE TABLE party_screenings (          -- restricted-party and sanctions checks on exports
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID NOT NULL REFERENCES orders (id),
  lists_version TEXT NOT NULL,           -- the screening list download used
  screened_name TEXT NOT NULL,
  screened_country CHAR(2) NOT NULL,
  result        TEXT NOT NULL CHECK (result IN ('clear', 'potential_match', 'blocked')),
  reviewed_by   TEXT,                    -- for potential matches
  decided_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items in a cart that can't ship to the destination or lack customs data for it.
SELECT cl.item_id,
       ic.item_id IS NULL                         AS missing_customs_data,
       $2 = ANY (COALESCE(ic.restricted_in, '{}')) AS restricted
FROM cart_lines cl
LEFT JOIN item_customs ic ON ic.item_id = cl.item_id AND ic.hs_edition = $3
WHERE cl.cart_id = $1
  AND (ic.item_id IS NULL OR $2 = ANY (ic.restricted_in));
```

Design notes:

- **The market is resolved from the ship-to country** and stored on the order with its price list and duties policy, so a refund, a duty refund claim or an audit uses what the shopper saw.
- **Customs data is per item and per nomenclature edition.** The six-digit code is shared, national codes are a map, and the customs description is separate from the product title. Reclassifying for HS 2028 adds rows rather than overwriting.
- **Duty and tax are order charges.** The core `order_charges` kinds `duty` and `tax` hold what the shopper paid at checkout under DDP, with `rule_ref` pointing at the landed cost quote; under DAP there is no charge, and the order says so.
- **The declaration is a document.** The data filed for a shipment and the commercial invoice are kept as filed, linked to the shipment, because a held parcel, a duty refund or a CBP inquiry is answered from them ([Documents Are Kept as Exchanged](/books/commerce/commerce-business#the-core-data-model)).
- **Check restrictions at the cart,** against the destination, and screen parties before shipping; record the list version used so a later list change doesn't rewrite what was checked.
- **Keep the regime volatile.** De minimis thresholds, flat duties and filing requirements changed several times in 2025 and 2026; they are data with effective dates ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)), not constants in code.

## Auditing

- **Every order's market, price list, duties policy and seller of record,** and the landed cost quote shown at checkout.
- **Every item classification** with its edition, national codes, origin, who classified it and when.
- **Every customs declaration** as filed, with the regime, importer of record, values and duties, and its release or hold.
- **Every party screening** with the list version, the result and who cleared a potential match.
- **Every export filing** (or the exemption relied on) for shipments that need one.

## What This Means for the System You Build

- **Model markets explicitly:** currency, price list, tax-inclusive display, payment methods, duties policy and seller of record per set of countries.
- **Decide DDP or DAP per market,** and if DDP, calculate duty and tax at checkout and record the quote.
- **Classify every item** with an HS code, national codes, a plain customs description and country of origin, versioned by nomenclature edition.
- **Treat every US-bound parcel as a customs entry** with per-item data, and every EU-bound parcel as carrying €3 per item category until 2028.
- **Keep thresholds and duties as dated rules,** because they changed several times in 2025 and 2026 and will again.
- **Check destination restrictions in the cart,** including lithium batteries and excise goods.
- **Screen export buyers against the Consolidated Screening List** and block comprehensively sanctioned destinations.
- **Know when a merchant-of-record service is the seller,** and mark it on the order and its charges.

## References

**United States**

- [White House: Executive Order 14256, low-value imports from China (April 2, 2025)](https://www.whitehouse.gov/presidential-actions/2025/04/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china-as-applied-to-low-value-imports/), the end of de minimis for China and Hong Kong from May 2, 2025
- [White House: Executive Order 14324, Suspending Duty-Free De Minimis Treatment for All Countries (July 30, 2025)](https://www.whitehouse.gov/presidential-actions/2025/07/suspending-duty-free-de-minimis-treatment-for-all-countries/), the August 29, 2025 effective date and the postal duty methods
- [Federal Register: CBP Dec. 26-13, postal de minimis suspension and postal informal entry (June 24, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-06-24/pdf/2026-12669.pdf), the Supreme Court holding, EO 14388, the Section 122 surcharge, the ad valorem choice, the postal informal entry data, the statutory repeal on July 1, 2027, the 1.36 billion shipments and the thresholds' history
- [Federal Register: de minimis suspension for all modes other than postal (June 24, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-06-24/pdf/2026-12670.pdf), formal or informal entry for non-postal shipments and the end of Type 86
- [CBP: E-Commerce](https://www.cbp.gov/trade/basic-import-export/e-commerce), the postal entry compliance date moved to January 20, 2027 and shipment volumes by year
- [19 CFR 141.86 (Cornell LII)](https://www.law.cornell.edu/cfr/text/19/141.86), commercial invoice contents and the English-language rule
- [19 U.S.C. 1304 (Cornell LII)](https://www.law.cornell.edu/uscode/text/19/1304), country of origin marking
- [15 CFR 30.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.2), when EEI is required regardless of value
- [15 CFR 30.37 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.37), the $2,500 per Schedule B exemption
- [15 CFR 734.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/734.3), EAR99
- [15 CFR 740.17 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/740.17), License Exception ENC, mass-market 5A992 and 5D992 and the February 1 report
- [BIS: Country guidance](https://www.bis.gov/licensing/country-guidance), embargoed destinations and the part 746 controls on Russia, Belarus and covered regions of Ukraine
- [BIS: Commerce eases export controls on Syria (August 28, 2025)](https://www.bis.gov/press-release/commerce-eases-export-controls-syria), EAR99 items and consumer communications devices
- [OFAC: FAQ updates of October 26, 2026](https://ofac.treasury.gov/faqs/updated/2026-10-26), the jurisdictions under comprehensive sanctions
- [OFAC: Syria-related sanctions](https://ofac.treasury.gov/sanctions-programs-and-country-information/syria-related-sanctions), the 2025 revocation and the remaining list-based sanctions
- [International Trade Administration: Consolidated Screening List](https://www.trade.gov/consolidated-screening-list), the lists it combines
- [Census Bureau: Schedule B](https://www.census.gov/foreign-trade/schedules/b/index.html), export commodity codes and the current edition

**European Union, United Kingdom and Canada**

- [European Commission: €3 customs duty for low-value parcels (June 29, 2026)](https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en), the duty per item category from 1 July 2026 and the T-shirt example
- [European Commission: EU Customs Reform](https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en), adoption, the end of the duty exemption, the €2 handling fee from 1 November 2026, the Customs Data Hub in 2028, the Customs Authority and importers for distance sales
- [European Commission: Customs formalities for low value consignments](https://taxation-customs.ec.europa.eu/customs/customs-procedures-import-and-export/customs-operations/customs-formalities-low-value-consignments_en), the 1 July 2021 VAT rules for consignments up to €150
- [European Commission: Five years of EU VAT e-commerce rules (September 3, 2026)](https://taxation-customs.ec.europa.eu/news/eu-vat-rules-e-commerce-five-years-more-eur125-billion-vat-revenue-2026-09-03_en), more than €125 billion collected and 193,000 registered businesses
- [European Commission: Combined Nomenclature](https://taxation-customs.ec.europa.eu/customs-4/calculation-customs-duties/customs-tariff/combined-nomenclature_en), the 8-digit CN
- [European Commission: TARIC](https://taxation-customs.ec.europa.eu/customs-4/calculation-customs-duties/customs-tariff/eu-customs-tariff-taric_en), the measures it integrates
- [European Commission: ICS2 release 3 transition complete (August 29, 2025)](https://taxation-customs.ec.europa.eu/news/transition-ics2-release-3-complete-limited-temporary-derogations-some-member-states-2025-08-29_en), ICS2 operational for all modes from 1 September 2025
- [European Commission: Guidance on acceptable goods descriptions, v4.10 (hosted by Portuguese customs)](https://info-aduaneiro.portaldasfinancas.gov.pt/pt/informacao_aduaneira/ICS2/Documents/guidance_acceptable_goods_description_V4.10_MAR2021_EN.pdf), plain language descriptions and unacceptable general terms
- [GOV.UK: Changes to VAT treatment of overseas goods sold to customers from 1 January 2021](https://www.gov.uk/government/publications/changes-to-vat-treatment-of-overseas-goods-sold-to-customers-from-1-january-2021/changes-to-vat-treatment-of-overseas-goods-sold-to-customers-from-1-january-2021), VAT at the point of sale up to £135 and marketplaces as deemed suppliers
- [GOV.UK: VAT and overseas goods sold directly to customers in the UK](https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk), the consignment test
- [GOV.UK: Acceleration of cheap import reforms (June 23, 2026)](https://www.gov.uk/government/news/government-backs-high-street-with-acceleration-of-cheap-import-reforms-and-crackdown-on-dodgy-online-sellers), ending the £135 duty relief by October 2028
- [GOV.UK: Reforming customs rules for low value imports](https://www.gov.uk/government/publications/reforming-customs-rules-for-low-value-imports), the policy paper
- [CBSA: CUSMA, what importers need to know](https://www.cbsa-asfc.gc.ca/services/cusma-aceum/lvs-efv-eng.html), the CAD 40 and CAD 150 courier thresholds and the CAD 20 postal threshold

**Standards and international bodies**

- [WCO: What is the Harmonized System](https://www.wcoomd.org/en/topics/nomenclature/overview/what-is-the-harmonized-system.aspx), six-digit codes, more than 200 countries and 98% of trade
- [WCO: HS 2028 amendments (January 2026)](https://www.wcoomd.org/en/media/newsroom/2026/january/hs-2028-amendments-adapting-the-harmonized-system-to-global-priorities-and-trade-evolution.aspx), 299 sets of amendments, 1,229 headings and 5,852 subheadings, in force 1 January 2028
- [ICC Academy: DAP and DDP Incoterms 2020 explained](https://academy.iccwbo.org/incoterms/article/incoterms-2020-dap-or-ddp/), the two rules
- [ICC: Incoterms 2010](https://iccwbo.org/news-publications/icc-rules-guidelines/incoterms-rules-2010/), DAP replacing DDU
- [UPU: Postal flows to the US reach near standstill (September 6, 2025)](https://www.upu.int/en/press-release/2025/upu-launches-solution-to-move-mail-as-postal-flows-to-us-reach-near-standstill), 88 operators suspending service and the 81% fall
- [USPS: International Mail Manual 135, mailable dangerous goods](https://pe.usps.com/text/imm/immc1_014.htm), lithium batteries installed in equipment and their limits
- [IATA: Lithium batteries](https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/), air transport rules under the Dangerous Goods Regulations

**Providers and filings**

- [Global-e: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1835963/000117891326001772/zk2634880.htm), GMV and revenue, destinations and currencies, the Shopify agreement, the Flow merger and Borderfree
- [Shopify Help: Managed Markets overview](https://help.shopify.com/en/manual/international/managed-markets/overview), Global-e as merchant of record, fees, duties paid shipping, guaranteed duties and eligibility
- [Shopify Help: Pricing in local currencies](https://help.shopify.com/en/manual/international/pricing), price adjustments, rounding and fixed prices by market
- [Shopify Help: Duties and import taxes](https://help.shopify.com/en/manual/international/duties-and-import-taxes), HS codes and duties collected at checkout
- [Zonos: Landed cost pricing](https://zonos.com/docs/global-ecommerce/landed-cost/pricing), the guarantee fee and export processing
- [ESW](https://www.esw.com/), markets and brands served
- [Reach](https://www.withreach.com/), legal reseller, markets and currencies
- [Passport](https://www.passportglobal.com/), seller of record and its acquisition by Global-e
- [Paddle: Pricing](https://www.paddle.com/pricing), merchant of record pricing for digital products
- [Stripe Docs: Managed Payments](https://docs.stripe.com/payments/managed-payments), Stripe as merchant of record for digital products
- [Stripe Docs: iDEAL](https://docs.stripe.com/payments/ideal), iDEAL and Wero
- [Stripe Docs: Pix](https://docs.stripe.com/payments/pix), Pix, the IOF tax and cross-border limits
</content>
</invoke>
