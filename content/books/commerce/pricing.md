+++
title = "Pricing & Price Lists"
description = "List, sale and compare-at prices, B2B price lists, currency and rounding, MAP and resale price law, unit pricing, personalized pricing law and price history."
category = "Commerce Industry"
order = 2307
part = "Catalog and Pricing"
tags = ["commerce", "pricing", "price-lists", "map", "unit-pricing", "surveillance-pricing"]
+++

A price looks like a number on an item and is really the answer to a question: what does this buyer pay for this item, in this currency, at this quantity, through this channel, today? A brand's screen protector is $39.99 on its own site, $34.99 during a sale with "was $39.99" beside it, €39.95 in Germany with a price per unit nobody reads, $21.50 a unit on a carrier's purchase order, a contract price for one distributor, and whatever Amazon's own retail team sets when it buys the product as a 1P vendor. Each of those has a rule behind it, and several of the rules are law: what "was" may mean, whether a brand may tell a retailer what to charge, when a price per ounce must be shown, and, since 2025, whether a price may be set from what is known about the person looking at it.

This chapter covers the price types (list, sale, compare-at), price lists and price books for markets, channels and B2B companies, multi-currency prices and rounding, minimum advertised price (MAP) and resale price maintenance law, reference price and price comparison law, unit pricing and price display rules, dynamic and personalized pricing and its regulation as of October 2026, and the price history all of that requires. Discounts applied in the cart are [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards); in-app prices on delivery platforms are [In-App Prices and Markups](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups); service pricebooks are Field Operations' [Pricebooks: Where Prices Come From](/books/field-operations/pricing-and-sales-rules#pricebooks-where-prices-come-from). The chapter extends `price_lists`, `price_list_items` and `companies` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `price_list_assignments`, `price_history` and `map_policies`.

## How the Platforms Do It

As of October 2026, from platform documentation:

| Platform | Price containers | How a buyer gets a list | When two lists apply | Limits and quirks |
| --- | --- | --- | --- | --- |
| **Shopify** | Variant price and compare-at price; price lists that "override default product prices with either fixed prices or percentage-based adjustments," each tied to a catalog | Catalogs attached to markets and, for B2B, to companies and company locations | For B2B catalogs on one company location, "the lowest price displays to the customer" | Up to 3 active B2B catalogs on Basic, Grow and Advanced, unlimited on Plus; 250 fixed prices per API request; changing a list's currency removes its fixed prices |
| **Commerce.com (BigCommerce)** | Price lists with records "specified exclusively at the variant level," carrying price, sale price, retail price and MAP price, in several currencies | Assigned to a sales channel and to customer groups | "If an active price list doesn't contain prices for a variant, then the catalog pricing will be used" | Up to 1,000 price records per API call; a price record overrides product-level bulk pricing |
| **Adobe Commerce** | Base price, special price for a period, tier prices by quantity and customer group, catalog price rules, B2B shared catalogs | Customer groups; a shared catalog per company account, with one public shared catalog | Catalog rules by priority, "the rule with the highest priority (lowest number ...) takes effect" | Catalog price rules apply "before the product is placed into the shopping cart" and are "processed ... each night" |
| **Salesforce B2C Commerce** | Price books, each in one currency; a sale book can be "based on" a list book | Price books assigned to sites | "The price book with the lowest price for a given product is used" | Volume price tables for quantity breaks; an empty validity period "represents a continuous price" |
| **commercetools** | Embedded prices on a variant or standalone price resources, each scoped by currency, country, customer group and channel, with validity dates and tiers | Selected at runtime from the cart's scope | A fixed fallback order from most to least specific scope; within a step, time-bound prices beat open-ended ones | 100 embedded prices per variant, 50,000 standalone; "only one Price can exist for a price scope" |

Three patterns run through the table:

- **A price is selected, not stored once.** Every platform keeps several candidate prices and picks one by context: market, currency, customer group, company, channel, quantity and date. The interesting part of each platform is its selection rule.
- **Two rules dominate: most specific wins, or lowest wins.** commercetools walks from the most specific scope (customer group, channel and country) to the least; Shopify's B2B catalogs and Salesforce's price books take the lowest of the applicable prices. They give different answers when a company's contract price is higher than a public sale.
- **Sale prices are a second price, not a discount.** Shopify's compare-at, Adobe's special price, Commerce.com's sale price and Salesforce's sale price book all show a reduced price on the product itself, before the cart; cart discounts are a separate engine with separate rules ([Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#discount-engines)).

## List, Sale and Compare-At Prices

Three price words do most of the work, and the law treats each differently:

- **List price.** The seller's regular price for the item in a market. In wholesale, a manufacturer's list price or MSRP (manufacturer's suggested retail price) is a suggestion to resellers; the FTC's guidance is that "the key word is 'suggested'" and "a dealer is free to set the retail price of the products it sells."
- **Sale price.** A lower price for a period. It's the price the buyer pays, so it belongs in the price list with dates, not in the theme.
- **Compare-at price.** The "was" or "compare at" number shown struck through beside the sale price. Shopify shows it only when it "is higher than the value in the Price field," and leaves its display to the theme; neither Shopify's nor any other platform's pricing page says anything about whether the number is lawful. That is the merchant's job, and it's a legal claim ([Reference Prices and Price Comparisons](#reference-prices-and-price-comparisons)).

My rule: a compare-at price is never typed. It's computed from price history (the price the item actually sold at, for long enough, recently enough, under the strictest rule of every market it's shown in), or it's not shown.

## Price Lists, Price Books and B2B Prices

A price list is a set of prices that applies to some buyers in some context. The core model's `price_lists` has a kind (base, sale, market, channel, wholesale, contract), a currency and a validity range; `price_list_items` carries the price per item and quantity break. What it doesn't yet say is who gets which list and which wins, and those are the decisions that matter:

- **Assignment.** A list applies to a market (country or region), a channel (the brand's site, a B2B portal, the point of sale), a customer group (wholesale, employees, members), a company or a company location. The B2B Commerce chapter owns companies, locations and contracts; the assignment table here is what they point at.
- **Precedence.** When several lists apply, either the most specific wins or the lowest wins. Most specific is the right default for contracts (a negotiated price is the price, even when a public sale is lower, if the contract says so); lowest is the right default for consumer sales (a member shouldn't pay more than a guest). Store the precedence as data on the assignment, and record which list priced each line ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Derived lists.** Shopify's percentage adjustments, Salesforce's "based on" price books and Adobe's percentage shared catalog prices derive one list from another: a wholesale list at 50% of base, a Canadian list at the US list converted. A derived list stores its parent and its rule, and fixed prices override the derivation per item; Shopify's documentation is explicit that removing fixed prices makes "all variant prices revert to the price list's adjustment rules."
- **Quantity breaks.** commercetools applies a tier "for the entire quantity" once the minimum is reached (all units at the tier price), not only to the units above it. Either is a legitimate rule; the list must say which, because the totals differ.
- **Fallback.** Commerce.com falls back to the catalog price when a list has no record for a variant; commercetools walks down its scope order. A buyer with no applicable price should get an explicit "not available to you," not a zero.

B2B adds two things a consumer price list never needs. **Prices can be confidential:** a custom shared catalog in Adobe Commerce "contains pricing that is visible only to logged-in associates of the assigned company accounts," so B2B prices are never in a public cache or a public feed. **Price discrimination between competing business buyers is regulated** ([Robinson-Patman](#business-buyers-robinson-patman)).

## Multi-Currency and Rounding

Selling in several currencies means either converting one price or setting one per currency, and every platform does both:

- **Converted prices** follow an exchange rate plus a margin and a rounding rule. Shopify Markets converts at "the rate at the time of the transaction," with converted prices that "include your currency conversion costs," and rounds them automatically "to the most common denominator for each currency," with the single option to "round up to the nearest" value; merchants "can't customize your rounding rules." Shopify's example is a converted price "rounded up to €8.85."
- **Fixed prices** per currency or market override conversion; in Shopify, "international fixed prices will always take precedence over a manual conversion rate."

The engineering rules come from the playbook. Amounts are integers in minor units with the currency beside them, and each currency's exponent comes from a table ([Money & Amounts](/docs/payments/money#exponents-come-from-a-table)); rounding is one explicit step with a stated mode ([Rounding](/docs/payments/money#rounding)); the rate a buyer saw is locked and stored with the order ([Locking a Quoted Rate](/docs/payments/multi-currency#locking-a-quoted-rate)). The commerce twist is that a converted price is also a displayed price, so the rule that produced €8.85 has to be the same rule in the product page, the cart, the feed sent to Google and the order line, or a buyer sees two prices for the same thing. My default: compute converted prices into a stored price list on a schedule (daily, or when the rate moves past a threshold), so every surface reads the same row, rather than converting on the fly in each. Duties and taxes on top of a cross-border price are the later Cross-Border Commerce chapter's.

## MAP and Resale Price Maintenance

Brands care what retailers charge, because a reseller discounting the brand's product on Amazon undercuts every other retailer and the brand's own site. The law distinguishes sharply between setting a reseller's price and influencing it:

- **Resale price maintenance (RPM)** is an agreement between a supplier and a reseller fixing the price (or a minimum price) at which the reseller sells. For a century it was illegal per se under federal law; in *Leegin Creative Leather Products v. PSKS* (2007), the Supreme Court held that "vertical price restraints are to be judged by the rule of reason," overruling *Dr. Miles*. The FTC's guidance follows: "all manufacturer-imposed vertical price programs should be evaluated using a rule of reason approach."
- **A unilateral policy (Colgate).** Under *United States v. Colgate* (1919), a manufacturer may announce its pricing expectations and "freely ... exercise his own independent discretion as to parties with whom he will deal." The FTC puts it plainly: "the law allows the manufacturer to deal only with retailers who agree to that policy." The line is between announcing a policy and refusing to deal (lawful) and negotiating agreements, threats and side deals with individual resellers (an agreement, and back under scrutiny).
- **MAP (minimum advertised price)** restricts the price a reseller advertises, not the price it sells at, which is why a store can say "see price in cart." MAP is also judged under the rule of reason, and the FTC's guidance recalls that it challenged five music distributors whose MAP policies "prohibited ads with discounted prices, even if the retailer paid for the ads with its own money."
- **State law can be stricter.** Maryland made it an unreasonable restraint of trade for a "contract, combination, or conspiracy that establishes a minimum price below which a retailer, wholesaler, or distributor may not sell a commodity or service" (Md. Code, Commercial Law 11-204(b)), restoring the per se rule for minimum resale prices in the state. New York's General Business Law 369-a makes "any contract provision that purports to restrain a vendee of a commodity from reselling such commodity at less than the price stipulated" unenforceable. The FTC's guidance notes that some state laws and other countries still treat minimum RPM as per se illegal.

The platforms build for MAP at the display layer. Adobe Commerce lets a merchant show the actual price "On Gesture," "In Cart" or "Before Order Confirmation," the last of which "displays the actual product price at the end of the checkout process, just before the order is submitted"; Commerce.com price records carry a `map_price` field beside the price. For a brand, MAP is a policy document plus monitoring: a policy with an effective date, the MAP price per item, the resellers it applies to, the violations found and the actions taken, consistently. Monitoring marketplaces and unauthorized sellers is [MAP Enforcement](/books/commerce/brand-protection#map-enforcement) in Brand Protection; this chapter's `map_policies` is the policy itself. My rule for a brand's own system: a MAP policy is unilateral and published, the same for every reseller, and the brand's records show violations handled by the policy's own terms, never by negotiation with one reseller.

## Reference Prices and Price Comparisons

A struck-through price is a claim about the past, and US federal and state law and EU law all regulate it.

**The FTC's Guides Against Deceptive Pricing (16 CFR Part 233)** set the federal standard:

- **Former price comparisons (233.1).** A former price is a legitimate basis for a comparison "if the former price is the actual, bona fide price at which the article was offered to the public on a regular basis for a reasonably substantial period of time." The guide's own example: pens offered at $10 for only a few days and then advertised as "Were $10, Now Only $7.50!" is a false comparison. A reduction "so insignificant as to be meaningless" ($10 "reduced to $9.99") misleads too.
- **Comparisons with other retailers' prices (233.2).** "Comparable value" and "sold elsewhere at" claims need a basis in fact: the advertiser "should be reasonably certain that the higher price he advertises does not appreciably exceed the price" at which substantial sales are made in the area.
- **List prices (233.3).** Comparing with a manufacturer's list price is legitimate only where the list price is what the principal retail outlets actually charge.
- **Bargain offers (233.4)** such as "Buy One, Get One Free," "2-For-1" and "Half Price," with "all the terms and conditions of the offer ... made clear at the outset"; "free" offers have their own guide, covered with promotions ([Free, BOGO and Bargain Claims](/books/commerce/promotions-and-gift-cards#free-bogo-and-bargain-claims)).

**California** sets a number. Business and Professions Code 17501 lets a seller advertise a former price only if it was "the prevailing market price ... within three months next immediately preceding" the advertisement, unless the date it prevailed is stated. In *Hinojos v. Kohl's* (9th Cir. 2013) the court held that a shopper who "would not have made the purchase but for the misrepresentation" of a former price has standing to sue under California's unfair competition and false advertising laws, reasoning that "misinformation about a product's 'normal' price is ... significant to many consumers in the same way as a false product label would be." That decision is why fictitious-former-price class actions against retailers became routine.

**The EU** made the rule mechanical. Article 6a of the Price Indication Directive (98/6/EC, inserted by Directive (EU) 2019/2161) requires "any announcement of a price reduction" to show the prior price, defined as "the lowest price applied by the trader during a period of time not shorter than 30 days prior to the application of the price reduction," with member state options for perishable goods, products on the market less than 30 days, and progressive reductions (where the prior price is the one before the first reduction).

**The UK's** Digital Markets, Competition and Consumers Act 2024 lists banned practices in Schedule 20, including describing a product as "free" or similar when it isn't, and the CMA's price transparency guidance (CMA209, published November 18, 2025) covers drip pricing and mandatory fees. Fee disclosure in general belongs to the later Consumer Protection Online chapter; for delivery, [Consumer Fees and All-In Prices](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices).

The common requirement is evidence. Every one of these rules is answered from price history: what the item sold at, in which market, from when to when, and how much sold at that price. A system that can't produce that history can't lawfully show a "was" price in the EU, can't defend one in California, and can't meet the FTC's "reasonably substantial period" test with anything but assertion.

## Unit Pricing and Price Display Law

A **unit price** is the price per unit of measure (per ounce, per 100 grams, per count), so shoppers can compare a 12-ounce package with a 16-ounce one. In the US it's state law, built on model rules from NIST:

- **NIST Handbook 130**, whose current edition is the 2026 edition "as adopted by the 109th National Conference on Weights and Measures," contains the Uniform Unit Pricing Regulation, the Uniform E-commerce Regulation and an "Examination Procedure for Price Verification" for inspectors checking that charged prices match displayed ones.
- **Online unit pricing is new.** At the 111th National Conference on Weights and Measures (July 26 to 30, 2026), the conference updated the E-commerce Regulation to "require unit pricing (e.g., price per ounce, liter, or count) on ecommerce sites" and revised the Unit Price Regulation to "align unit pricing practices across modern retail formats, digital marketplaces, and traditional brick-and-mortar stores," for the 2027 Handbook 130 edition.
- **The handbook binds only where a state adopts it,** and states adopt sections selectively, some making unit pricing mandatory and others voluntary. I haven't found a current public table of which states have adopted which sections. <!-- source-gap: nist-hb130-state-adoption | missing | which states adopt the Uniform Unit Pricing Regulation and E-commerce Regulation, and whether mandatory | closes with: NIST OWM's state adoption table for Handbook 130, or the state statutes | checked: 2026-10-28 -->

In the EU unit pricing is general: Article 3 of the Price Indication Directive requires that "the selling price and the unit price shall be indicated for all products" it covers, that "any advertisement which mentions the selling price" also show the unit price, and that "for products sold in bulk, only the unit price must be indicated." Shopify's unit price feature exists for this, because "displaying the price per unit is a legal requirement in some regions."

What this means for the data: the unit price is computed from the price and the item's declared net quantity and unit ([Units and Pack Sizes](/books/commerce/products-and-variants#units-and-pack-sizes)), never typed, and displayed in the unit the jurisdiction requires (per kilogram or per 100 grams in the EU, per ounce or per count in US states). A wrong net quantity on the item produces a wrong unit price on every page and in every feed. The price verification procedure is the other half: an inspector, or a shopper, compares the price displayed with the price charged, so the cart must price from the same row the page showed.

## Dynamic and Personalized Pricing

Prices that change with demand, time, inventory or competitors' prices are old and lawful: airline fares, a markdown at the end of a season, a price matched to a competitor overnight. Prices set from what is known about the individual buyer are what regulators began scrutinizing in 2024, under the name **surveillance pricing**. As of October 2026:

- **The FTC's study.** In July 2024 the FTC ordered eight companies (Mastercard, Revionics, Bloomreach, JPMorgan Chase, Task Software, PROS, Accenture and McKinsey) to report on pricing products that use data such as "location, demographics, credit history, and browsing or shopping history." Its January 17, 2025 initial findings, from six of the eight companies' documents, reported that inputs could include "a person's precise location or browser history" and products "left unpurchased in an online shopping cart." The commission voted 3-2 to release them, with commissioners Ferguson and Holyoak dissenting; I found no final report.
- **New York's Algorithmic Pricing Disclosure Act** (General Business Law 349-a) requires a seller that sets a price with an algorithm using personal data ("any data that identifies or could reasonably be linked, directly or indirectly, with a specific consumer or device") to show, "near and contemporaneous with" the price, the words "THIS PRICE WAS SET BY AN ALGORITHM USING YOUR PERSONAL DATA." Penalties are up to $1,000 per violation after an attorney general's cease-and-desist; there are exemptions for insurers, financial institutions under Gramm-Leach-Bliley and lower prices for existing subscribers. The National Retail Federation's First Amendment challenge was dismissed on October 8, 2025, and the law remains in effect.
- **Maryland** became the first state to restrict surveillance pricing: the Protection From Predatory Pricing Act (HB 895), signed April 28, 2026 and effective October 1, 2026, applies to food retailers of 15,000 square feet or more selling tax-exempt food and to third-party delivery, with exceptions for loyalty programs, cost-based differences and consent, and penalties up to $10,000 per violation ($25,000 for repeats), enforced by the attorney general.
- **Connecticut** followed with Public Act 2026-130 (HB 5563), signed June 4, 2026 and effective July 1, 2027; Consumer Reports, which supported it, said it "still has significant shortcomings," pointing to personalized discounts.
- **New Jersey's** Fair Price Protection Act, announced by the governor on July 23, 2026, "prohibits retailers from using personal data to set individualized prices on groceries and other necessities," "does not ban loyalty programs or discounts," and puts a one-year moratorium on new electronic shelf labels.
- **Pending.** California's AB 2564 passed both houses by August 31, 2026 and awaited concurrence in Senate amendments, with no governor's action shown. New York's One Fair Price Act passed the legislature, and I couldn't confirm from an official source whether it has been signed. <!-- source-gap: ny-one-fair-price-act | status | whether New York's One Fair Price Act (S.8623B/A.9349B) was signed, and its effective date | closes with: the governor's press release or the enacted chapter law | checked: 2026-10-28 -->
- **Delivery and grocery platforms.** Instacart's item price tests, its December 2025 decision to end them, and the FTC's October 28, 2026 orders to delivery platforms about person-to-person price variation are in [In-App Prices and Markups](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups).

The laws differ in coverage (groceries and necessities, all sellers, disclosure versus prohibition) and agree on what a system needs to be able to say: whether a price shown to a buyer depended on personal data, and if so which. My rules:

- **Price by segment, never by person, unless the law and the business have both decided otherwise.** A price list for a market, a channel, a customer group or a company is explainable; a price computed per visitor from their browsing history is the thing being regulated.
- **Make personalization visible in the data.** Any price that differs by buyer records the inputs that produced it (the list, the experiment, the model version, the features), and whether any input was personal data, so a disclosure can be shown by rule where required and a regulator's question can be answered ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Price tests are experiments with records.** An A/B price test assigns buyers to arms; the assignment, the arm's price and the period are kept, and the test is checked against the disclosure and prohibition rules of every jurisdiction it runs in.
- **Loyalty and member prices are price lists,** assigned by membership, which is why every one of these statutes carves them out and why they must stay a list rather than a per-person computation.

### Business buyers: Robinson-Patman

Between businesses, the old law is price discrimination. The Robinson-Patman Act prohibits a seller from charging competing business buyers different prices for commodities "of like grade and quality" where the effect may be to harm competition; it "applies to commodities, but not to services," with defenses for differences "justified by different costs incurred by the seller" and prices "given in good faith to meet a competitor's price." Enforcement revived and then split: the FTC dismissed its case against PepsiCo without prejudice on May 22, 2025, by a 3-0 vote, and on October 2, 2026 announced a proposed settlement with Southern Glazer's Wine and Spirits covering its sales to the five largest chains in 26 states, under which the distributor must pay an independent retailer 1.5 times any price differential found (2 times if the FTC wins enforcement), with an independent monitor for six years once a court enters it. For a distributor's B2B price lists the consequence is that every contract price to a reseller needs a reason on file (volume, cost to serve, a competitor's offer), recorded when the price is set.

## Price History

Every rule in this chapter is answered from history: the FTC's "reasonably substantial period," California's three months, the EU's 30-day lowest price, MAP violations, surveillance pricing disclosures, Robinson-Patman justifications, a buyer's claim that the price changed between the page and the cart, and every margin analysis. Price history is therefore a ledger, not a log:

- **Append only.** Each price that took effect (list, item, quantity break, currency) is a row with a validity range, who or what set it, and why. Editing a price closes the current row and opens a new one.
- **Effective, not edited.** A price scheduled for next Monday is a row with a future start, not a job that will edit a column on Monday ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Sales at the price, too.** The FTC tests whether the article was offered on a regular basis and the free guide asks at what price "substantial sales were made"; order lines carry the price list that priced them, so units sold at each price can be counted.
- **Lowest-price queries are cheap.** The EU's 30-day rule is a minimum over the item's rows in the window before the reduction, computed when the reduction starts and stored with it, so the reference shown can't drift.

## How to Build It

Assignments with precedence, an append-only price history and MAP policies, extending `price_lists`, `price_list_items` and `companies` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model):

```sql
ALTER TABLE price_lists
  ADD COLUMN parent_id       UUID REFERENCES price_lists (id),  -- a derived list's source
  ADD COLUMN adjustment_bps  INT,          -- e.g. -5000 for 50% of parent; null: fixed only
  ADD COLUMN rounding_rule   TEXT,         -- 'up_to_0.05', 'up_to_whole', per currency table
  ADD COLUMN tier_mode       TEXT NOT NULL DEFAULT 'all_units' CHECK (tier_mode IN
                               ('all_units', 'incremental')),
  ADD COLUMN confidential    BOOLEAN NOT NULL DEFAULT FALSE;  -- never cached publicly or fed

ALTER TABLE price_list_items
  ADD COLUMN reference_price      BIGINT,  -- the lawful "was" price, computed, never typed
  ADD COLUMN reference_basis      TEXT,    -- 'eu_30_day_lowest', 'ca_3_month', 'ftc_former'
  ADD COLUMN reference_computed_at TIMESTAMPTZ;

ALTER TABLE companies
  ADD COLUMN price_basis_note TEXT;        -- why this company's contract prices differ

CREATE TABLE price_list_assignments (      -- who gets which list, and what wins
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  price_list_id   UUID NOT NULL REFERENCES price_lists (id),
  scope           TEXT NOT NULL CHECK (scope IN ('market', 'channel', 'customer_group',
                    'company', 'company_location', 'membership')),
  scope_ref       TEXT NOT NULL,           -- the market code, channel ID, group or company ID
  precedence      TEXT NOT NULL CHECK (precedence IN ('most_specific', 'lowest')),
  priority        SMALLINT NOT NULL DEFAULT 100,  -- lower wins among equals
  valid_during    TSTZRANGE NOT NULL,
  UNIQUE (price_list_id, scope, scope_ref)
);

CREATE TABLE price_history (               -- every price that took effect, append only
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  price_list_id   UUID NOT NULL REFERENCES price_lists (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  min_quantity    INT NOT NULL DEFAULT 1,
  price           BIGINT NOT NULL CHECK (price >= 0),
  currency        CHAR(3) NOT NULL,
  effective       TSTZRANGE NOT NULL,      -- open-ended until superseded
  set_by          TEXT NOT NULL CHECK (set_by IN ('user', 'rule', 'conversion', 'repricer',
                    'experiment', 'import')),
  set_by_ref      TEXT,                    -- user, rule version, rate ID, experiment arm
  personal_data   BOOLEAN NOT NULL DEFAULT FALSE,  -- did buyer data influence it
  reason          TEXT,                    -- 'season_markdown', 'cost_increase', 'contract'
  EXCLUDE USING GIST (price_list_id WITH =, item_id WITH =, min_quantity WITH =,
    effective WITH &&)
);

CREATE TABLE map_policies (                -- a brand's published, unilateral MAP policy
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  brand_id        UUID NOT NULL REFERENCES brands (id),
  version         INT NOT NULL,
  document_ref    TEXT NOT NULL,           -- the published policy, as published
  effective       TSTZRANGE NOT NULL,
  applies_to      TEXT NOT NULL CHECK (applies_to IN ('all_resellers', 'authorized_resellers')),
  enforcement     JSONB NOT NULL,          -- the policy's own steps: notice, suspension
  UNIQUE (brand_id, version)
);

CREATE TABLE map_policy_items (
  map_policy_id   UUID NOT NULL REFERENCES map_policies (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  currency        CHAR(3) NOT NULL,
  map_price       BIGINT NOT NULL CHECK (map_price >= 0),
  PRIMARY KEY (map_policy_id, item_id, currency)
);

-- The EU reference price for a reduction starting at $3: the lowest price in the prior 30 days.
SELECT MIN(price) AS prior_price
FROM price_history
WHERE price_list_id = $1 AND item_id = $2 AND min_quantity = 1
  AND effective && tstzrange($3 - INTERVAL '30 days', $3);
```

Design notes:

- **Selection is one function.** Given a buyer's market, channel, groups, company, quantity and time, one resolver walks the assignments by precedence and priority and returns the price and the list that produced it; the product page, the cart, the feed and the order all call it, and the order line stores the list ([Snapshots on the line](/books/commerce/commerce-business#the-core-data-model)).
- **Reference prices are computed when the reduction starts,** stored with their basis, and shown only where the basis satisfies the market's rule; a market with no valid basis shows no "was" price.
- **Confidential lists stay out of caches and feeds,** and are served only to an authenticated company contact ([What Must Never Be Shared](/books/hosting-and-cloud/caching-and-invalidation#what-must-never-be-shared)).
- **Price changes are events.** Caches, search indexes, feeds and marketplace listings subscribe, so a price that changed in the database changes everywhere a buyer can see it ([Invalidation](/docs/architecture/application-caching#invalidation)).
- **A personalized price is flagged at the source.** `personal_data` is set by whatever produced the price (an experiment, a model), not inferred later; disclosure and prohibition rules read it ([Rules as Data](/docs/architecture/rules-as-data)).

## Auditing

- **The price history,** append only, with who or what set each price and why, for every list, item and currency; it answers reference price, MAP, surveillance pricing and Robinson-Patman questions.
- **What each buyer was shown and charged,** with the list or experiment that priced the line, so a "the price changed at checkout" complaint or a price verification inspection has an answer.
- **Each reference price with its basis and computation time.**
- **MAP policy versions as published,** the violations found and the action taken under the policy, applied the same way to every reseller.
- **Contract price justifications** for business buyers, recorded when the price was set.

## What This Means for the System You Build

- **Treat a price as a selection,** by market, channel, group, company, quantity and time, through one resolver every surface calls.
- **Store precedence as data** (most specific or lowest) and record which list priced each line.
- **Never type a compare-at price;** compute a reference price from history under the strictest rule of each market, or show none.
- **Keep price history append only,** with effective ranges and the source of each change.
- **Convert currencies into stored lists** with explicit rounding, so every surface shows the same number.
- **Compute unit prices** from net quantity and unit, in each jurisdiction's display unit.
- **Run MAP as a unilateral published policy,** enforced by its own terms, never negotiated reseller by reseller.
- **Price by segment, not by person,** and flag any price personal data influenced so disclosure and prohibition rules can apply.
- **Keep confidential B2B prices out of public caches and feeds,** with a reason on file for each contract price.

## References

**Platform documentation**

- [Shopify Help Center: Sale pricing](https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing), compare-at price shown when higher than price
- [Shopify: PriceList](https://shopify.dev/docs/api/admin-graphql/latest/objects/PriceList), fixed prices and percentage adjustments, catalogs, and reverting to adjustment rules
- [Shopify: Build a catalog](https://shopify.dev/docs/apps/build/markets/build-catalog), fixed price batch limit, currency matching and converted prices
- [Shopify Help Center: B2B catalogs](https://help.shopify.com/en/manual/b2b/catalogs/overview), lowest price wins and catalog limits by plan
- [Shopify Help Center: Price rounding](https://help.shopify.com/en/manual/international/pricing/rounding), fixed rounding rules per currency
- [Shopify Help Center: Exchange rates](https://help.shopify.com/en/manual/international/pricing/exchange-rates), rate at the time of the transaction, conversion costs and fixed prices taking precedence
- [Shopify Help Center: Price per unit](https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-germany/price-per-unit), unit prices as a legal requirement in some regions
- [BigCommerce: Price lists](https://docs.bigcommerce.com/docs/store-operations/pricing/price-lists), variant-level records, channel and group assignment, fallback and API limits
- [Adobe: Advanced pricing](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/pricing/pricing-advanced), special price, tier prices and MAP display options
- [Adobe: Create a catalog price rule](https://experienceleague.adobe.com/en/docs/commerce-admin/marketing/promotions/catalog-rules/price-rules-catalog-create), rules before the cart, nightly processing and priority
- [Adobe: Shared catalogs](https://experienceleague.adobe.com/en/docs/commerce-admin/b2b/shared-catalogs/catalog-shared), one public catalog and company-only custom catalogs
- [Salesforce Trailhead: Configure price books](https://trailhead.salesforce.com/content/learn/modules/b2c-pricebooks-images-content/b2c-configure-price-books), currency per book, lowest price wins, site assignment and volume tables
- [commercetools: Pricing and discounts overview](https://docs.commercetools.com/api/pricing-and-discounts-overview), price scopes, selection fallback, embedded and standalone prices, and tiers
- [commercetools: Limits](https://docs.commercetools.com/api/limits), embedded and standalone price limits

**Cases and statutes**

- [Leegin Creative Leather Products v. PSKS, 551 U.S. 877 (2007)](https://www.law.cornell.edu/supct/html/06-480.ZS.html), vertical price restraints under the rule of reason
- [United States v. Colgate & Co., 250 U.S. 300 (1919)](https://www.law.cornell.edu/supremecourt/text/250/300), a trader's right to choose whom to deal with
- [Maryland Commercial Law 11-204](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=11-204&enactments=false), minimum resale price agreements as unreasonable restraints
- [New York General Business Law 369-a](https://www.nysenate.gov/legislation/laws/GBS/369-A), resale price provisions unenforceable
- [Hinojos v. Kohl's Corp. (9th Cir. 2013)](https://caselaw.findlaw.com/us-9th-circuit/1631401.html), standing for false former prices and California's three-month rule in Business and Professions Code 17501
- [New York General Business Law 349-a](https://www.nysenate.gov/legislation/laws/GBS/349-A), the algorithmic pricing disclosure, definitions, exemptions and penalties
- [Directive (EU) 2019/2161, Article 2](https://www.legislation.gov.uk/eudr/2019/2161/article/2), Article 6a of the Price Indication Directive: the 30-day prior price
- [Directive 98/6/EC, Article 3](https://www.legislation.gov.uk/eudr/1998/6/article/3), selling and unit prices, advertisements and bulk products
- [UK Digital Markets, Competition and Consumers Act 2024, Schedule 20](https://www.legislation.gov.uk/ukpga/2024/13/schedule/20), banned practices including false "free" claims

**Regulators**

- [FTC: Manufacturer-imposed requirements](https://www.ftc.gov/advice-guidance/competition-guidance/guide-antitrust-laws/dealings-supply-chain/manufacturer-imposed-requirements), rule of reason, unilateral policies, MSRP and the music distributors' MAP case
- [16 CFR 233.1: Former price comparisons](https://www.law.cornell.edu/cfr/text/16/233.1), the bona fide former price and the pen example
- [16 CFR 233.2: Retail price comparisons](https://www.law.cornell.edu/cfr/text/16/233.2), comparable value claims
- [16 CFR 233.3: Advertising retail prices established by manufacturers](https://www.law.cornell.edu/cfr/text/16/233.3), list price comparisons
- [16 CFR 233.4: Bargain offers based upon the purchase of other merchandise](https://www.law.cornell.edu/cfr/text/16/233.4), BOGO and similar offers
- [FTC: Price discrimination and Robinson-Patman violations](https://www.ftc.gov/advice-guidance/competition-guidance/guide-antitrust-laws/price-discrimination-robinson-patman-violations), commodities, like grade and quality, and defenses
- [FTC: FTC dismisses lawsuit against PepsiCo (May 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/05/ftc-dismisses-lawsuit-against-pepsico), the dismissal and vote
- [FTC: Settlement with Southern Glazer's (October 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-secures-settlement-protects-small-businesses-illegal-price-discrimination), coverage, remedies and monitor
- [FTC: Surveillance pricing 6(b) orders (July 2024)](https://www.ftc.gov/node/85959), the eight companies and the data in scope
- [FTC: Surveillance pricing study initial findings (January 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-surveillance-pricing-study-indicates-wide-range-personal-data-used-set-individualized-consumer), inputs found and the vote
- [CMA: Price transparency guidance (CMA209)](https://www.gov.uk/government/publications/price-transparency-cma209), drip pricing and mandatory fees
- [NIST: Handbook 130, current edition](https://www.nist.gov/pml/owm/nist-handbook-130-current-edition), the 2026 edition and its unit pricing, e-commerce and price verification sections
- [NIST: Inside the 2026 NCWM annual meeting](https://www.nist.gov/news-events/news/2026/09/inside-2026-ncwm-annual-meeting-key-decisions-technical-updates-and), unit pricing on e-commerce sites for the 2027 editions

**State surveillance pricing laws**

- [Clark Hill: NY algorithmic pricing act withstands First Amendment challenge](https://www.clarkhill.com/news-events/news/ny-algorithmic-pricing-act-withstands-first-amendment-challenge/), the October 8, 2025 dismissal of NRF v. James
- [Skadden: Maryland becomes the first state to restrict surveillance pricing](https://www.skadden.com/insights/publications/2026/05/maryland-becomes-the-first-state-to-restrict-surveillance-pricing), HB 895's dates, scope, exceptions and penalties
- [Consumer Reports: Statement on Connecticut's surveillance pricing law](https://advocacy.consumerreports.org/press_release/consumer-reports-statement-on-the-signing-of-connecticuts-surveillance-pricing-bill-into-law/), signing, effective date and criticism
- [New Jersey Governor: Fair Price Protection Act (July 23, 2026)](https://www.nj.gov/governor/news/2026/20260723a.shtml), the prohibition, loyalty carve-out and shelf label moratorium
- [CalMatters Digital Democracy: AB 2564](https://calmatters.digitaldemocracy.org/bills/ca_202520260ab2564), votes and pending concurrence
