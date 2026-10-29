+++
title = "Promotions, Discounts & Gift Cards"
nav_title = "Promotions & Gift Cards"
description = "Discount engines, stacking, codes, BOGO, tiers and free shipping, abuse, and gift cards and store credit under Reg E, state law, escheat and ASC 606."
category = "Commerce Industry"
order = 2308
part = "Catalog and Pricing"
tags = ["commerce", "promotions", "discounts", "gift-cards", "store-credit", "breakage"]
+++

A promotion is a rule that changes a price after the shopper has chosen what to buy: 20% off the order, a second case free, free shipping over $50, $10 off with a code from an email, a gift with purchase. The rule looks simple and its interactions aren't. Two promotions can both apply to the same line, and the order they apply in changes the total; a percentage off after a fixed amount off is a different number from the reverse; a discount on the order has to be spread across its lines so a returned item refunds the right amount and the tax is computed on the right base; and a code meant for one customer is on a coupon site by the afternoon. Gift cards and store credit sit beside promotions because they ride the same checkout and are the opposite in law: a discount is the merchant giving up revenue, while a gift card is the customer's money the merchant holds, under federal rules on expiry and fees, state rules on cash back, state unclaimed property law and the accounting standard's rules on breakage.

This chapter covers discount engines (types, codes and automatic discounts, BOGO, tiered and free shipping offers), stacking and exclusivity, the law on "free" and bargain claims, allocating discounts to lines, promotion abuse, and gift cards and store credit. Reference prices and sale prices are [Pricing & Price Lists](/books/commerce/pricing); service promotions are Field Operations' [Promotions](/books/field-operations/pricing-and-sales-rules#promotions); loyalty points, which are a different liability, are [Memberships & Loyalty](/books/commerce/memberships-and-loyalty#points-as-material-rights)'s. The chapter extends `order_charges` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and `promotion_redemptions` from [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it), and adds `promotions`, `discount_codes`, `discount_allocations`, `gift_cards`, `gift_card_transactions` and `store_credit_accounts`.

## How the Platforms Do It

As of October 2026, from platform documentation:

| Platform | Discount types | Stacking model | Order of application | Published limits |
| --- | --- | --- | --- | --- |
| **Shopify** | Amount off products or order, buy X get Y, free shipping; custom logic through the Discount Function API | Three classes (product, order, shipping), each discount choosing which classes it combines with; when they can't combine, the best one for the customer applies | Product discounts, then order discounts on the revised subtotal, then shipping | 25 active automatic discounts; 5 product or order codes and 1 shipping code per order; 25 discount functions per store |
| **commercetools** | Product discounts (on the price) and cart discounts (on lines, shipping or total), with or without discount codes | Each cart discount ranked by a globally unique sort order and set to `Stacking` or `StopAfterThisDiscount`; a `BestDeal` mode picks whichever yields the lower total | Product discounts first, then cart discounts by rank; a total price discount "applies last, regardless of its sort order" | 100 active code-less cart discounts (plus 100 per store); 10 discount codes per cart; 500 active product discounts |
| **Commerce.com (BigCommerce)** | Promotions with rules, redeemed `AUTOMATIC` or by `COUPON` | A rule-level `stop` flag ends evaluation when the rule applies; promotions have a priority | By priority | Fewer than 100 active promotions recommended, no more than 10 rules each |
| **Adobe Commerce** | Cart price rules (percent of product price, fixed amount, fixed amount for the whole cart, buy X get Y free) and catalog price rules | Priority, with "Discard Subsequent Rules" to stop further rules on the same product | Catalog rules before the cart; cart rules by priority, lowest number first | Uses per coupon and per customer; auto-generated coupon codes |
| **Salesforce B2C Commerce** | Product, order and shipping promotions | Exclusivity: none ("can combine with any promotion"), class ("can't combine with a promotion of the same class") or global ("can't combine with any promotion"), plus rank from 10 (highest) to 100 | Class, exclusivity, rank, then discount type and value | |
| **Medusa** | Standard and buy-get promotions with application methods (percentage or fixed, on items or shipping) | Per promotion | | Campaign budgets: "once a budget is exhausted, the promotion can no longer be applied" |
| **Saleor** | Automatic promotions (catalog or order) and vouchers with codes, "scoped to channels," plus manual staff discounts | Per type | | |

Three patterns run through the table:

- **Classes are the backbone of stacking.** Shopify's product, order and shipping classes, Salesforce's class exclusivity and commercetools' separation of product from cart discounts all start from the same split: a discount on an item, a discount on the order, a discount on delivery. Most stacking rules are rules between classes.
- **Order is fixed by the platform, and it matters.** Every platform applies item-level discounts before order-level ones, so an order discount works on the reduced subtotal. Stripe's billing documentation makes the same point about invoices: "20% off then 5 USD off" differs from the reverse ([Promotions](/books/field-operations/pricing-and-sales-rules#promotions)).
- **Limits are low on purpose.** Active automatic discounts are capped in the tens (25 on Shopify, a recommended 100 on Commerce.com, 100 on commercetools), because every active discount is evaluated on every cart change. A promotion calendar with hundreds of overlapping offers is a performance problem before it's a merchandising one.

## Discount Engines

A discount has four parts: **who** it's for (everyone, a segment, a customer, holders of a code), **what** it applies to (items, collections, the order, shipping), **when** it applies (a minimum quantity or subtotal, a date range, a channel) and **how much** (a percentage, a fixed amount, a fixed price, a free item). Every engine's rule model is a version of that, and the playbook's [The Shape of a Rule](/docs/architecture/rules-as-data#the-shape-of-a-rule) is the general form. The common types:

- **Amount or percentage off items.** 20% off a collection; $5 off each case. Applied per eligible line.
- **Amount or percentage off the order.** $10 off orders over $75. Applied to the subtotal after item discounts and then allocated back to lines ([Allocating Discounts to Lines](#allocating-discounts-to-lines)).
- **Buy X get Y (BOGO).** Buy one, get one free or at a percentage off; buy two cases, get a third at half price. The engine has to choose which units are the "get" units, and the conventional rule is the cheapest eligible units, so the merchant's cost is predictable and the shopper can't game it by adding an expensive item.
- **Tiered.** Spend $100, save $10; spend $200, save $25. Tiers are mutually exclusive within a promotion: the highest tier met applies, not every tier.
- **Volume pricing.** Quantity breaks on the price itself are price lists, not promotions ([Price Lists, Price Books and B2B Prices](/books/commerce/pricing#price-lists-price-books-and-b2b-prices)); they apply before any promotion and show on the product page.
- **Free shipping, and free shipping over a threshold.** A shipping-class discount that zeroes or reduces the shipping charge when the subtotal (after discounts, by the usual rule) meets a threshold. Whether the threshold is measured before or after other discounts has to be stated, because a shopper at $52 who applies a $5 code drops below a $50 threshold.
- **Gift with purchase.** A free item added when a condition is met. It's an order line at a zero price (or a full price with a 100% discount, which keeps the item's value visible for tax and returns), and it consumes inventory.

**Codes versus automatic.** An automatic discount applies to everyone who meets its conditions; a code applies only when entered. Commerce.com makes the choice permanent ("redemption_type" can't change once set). Automatic discounts are the safer default for broad offers, since they can't leak; codes are for targeting (an email list, an influencer, a single customer) and for measuring which channel brought the order.

**Custom logic.** When the built-in types don't fit, the platforms let merchants run their own: Shopify's Discount Function API can apply savings "across three discount classes: product, order, and shipping," with up to 25 functions per store that run concurrently and don't see each other's results. That last property matters: two functions can't coordinate, so the platform's combination rules still decide what stacks.

## Stacking and Exclusivity

When several discounts could apply, the engine needs a rule for which do. The patterns, from strictest to loosest:

- **Global exclusivity.** Salesforce's global exclusivity "can't combine with any promotion"; commercetools' `StopAfterThisDiscount` prevents "further Cart Discounts from applying"; Adobe's Discard Subsequent Rules "prevents multiple discounts from being applied to the same product." Use it for deep offers that would lose money combined with anything.
- **Class exclusivity.** One discount per class: one item discount, one order discount, one shipping discount. Salesforce's class exclusivity and Shopify's default combinations (an order discount can combine with shipping, two shipping discounts can't combine) work this way.
- **Explicit combinations.** Each discount lists the classes it combines with, as Shopify's `combinesWith` does; both discounts must allow the combination.
- **Best deal.** When discounts can't combine, give the shopper the best one: Shopify's rule, and commercetools' `BestDeal` mode, which "applies whichever type yields the lower total."
- **Full stacking.** Everything that matches applies, in rank order. commercetools' `Stacking` is the default.

Design rules that hold across engines:

- **Rank is data and unique.** commercetools requires a sort order "unique globally across all Cart Discounts"; Adobe's discard rule "needs unique priorities." Two discounts with the same rank make the result depend on evaluation order, which is a bug that appears only in production.
- **Compute in a fixed sequence:** prices, then item discounts by rank, then order discounts on the reduced subtotal, then shipping discounts, then tax. Each step's output is the next step's input, and the sequence is the same in the cart, the checkout, the order and any refund recalculation.
- **Explain every result.** The cart shows which discounts applied and, for a code that didn't, why ("Discount couldn't be used with your existing discounts," in Shopify's wording). The order stores the evaluation, not just the totals ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Floors.** No line goes below zero, no order total below zero, and a "fixed amount off the order" can't exceed the subtotal. Merchants often add a margin floor (no line below cost), which needs cost at evaluation time and must never expose cost to the storefront ([Cost is not price](/books/commerce/commerce-business#the-core-data-model)).

## Codes, Limits and Budgets

Codes need limits, because a code is a bearer instrument: whoever has the string gets the discount.

- **Per-code and per-customer caps.** Adobe Commerce has "Uses per Coupon" and "Uses per Customer" (which applies only to registered customers, since a guest has no identity to count); Commerce.com requires `max_uses` on a code; Stripe-style coupons carry a redemption cap and a redeem-by date.
- **Unique codes.** Adobe's "Use Auto Generation" and similar features create thousands of single-use codes, one per recipient. A unique code can be traced to the person it was sent to; a shared code ("SAVE20") can't, and leaks.
- **Per-order limits.** Shopify allows at most 5 product or order codes and 1 shipping code per order; commercetools 10 codes per cart.
- **Budgets.** Medusa's campaign budgets stop a promotion when it's spent. A budget is a counter that must be decremented atomically at redemption, the same problem as stock ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)).

Redemptions are counted when the order is placed, and released when it's cancelled before fulfillment; a code with one use left shouldn't be consumed by an abandoned checkout, so the count is reserved at checkout and confirmed at order ([Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently)).

## Free, BOGO and Bargain Claims

The word "free" is regulated. The FTC's Guide Concerning Use of the Word "Free" (16 CFR 251) and its pricing guides set the US rules:

- **The regular price must be real.** When "free" is conditioned on buying something else, the condition's price must be the regular price; for prices that fluctuate, "the 'regular' price shall be the lowest price at which any substantial sales were made" in the period before.
- **Conditions up front.** "All of the terms, conditions and obligations should appear in close conjunction with the offer," not in a footnote at checkout.
- **Not forever.** A "free" offer shouldn't run in one area "for more than 6 months in any 12-month period," "at least 30 days should elapse before another such offer is promoted," and "no more than three such offers should be made in the same area in any 12-month period." An offer that never ends has become the regular price.
- **Bargain offers** ("Buy One, Get One Free," "2-For-1 Sale," "Half Price Sale," "1¢ Sale") fall under 16 CFR 233.4, with "all the terms and conditions of the offer ... made clear at the outset."

The UK's Digital Markets, Competition and Consumers Act 2024 lists among its banned practices describing a product as "gratis", "free", "without charge" or similar when it isn't. The FTC's case against Instacart over "free delivery" that carried a mandatory service fee is in [Consumer Fees and All-In Prices](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices); "free shipping" with a hidden fee elsewhere in the order is the same problem.

For the engine this means a "free" or BOGO promotion stores its regular price basis (from [Price History](/books/commerce/pricing#price-history)), its terms text, its run dates and its predecessors in the same trade area, so the 6-month and 30-day rules can be checked before it's scheduled.

## Allocating Discounts to Lines

An order discount ("$10 off") has to be spread across the lines it applied to. Three things depend on it:

- **Tax.** A seller's own discount generally reduces the price tax is computed on, and a line-level base is needed when lines have different tax rates (a food item and a mug in one order). A coupon a third party reimburses, such as a manufacturer's, can be treated differently by state, so the discount's funder is recorded ([Taxability Varies by Place](/docs/payments/sales-tax#taxability-varies-by-place)).
- **Refunds.** A customer who returns one of three items gets back what they paid for it, which is its price less its share of the order discount. Without allocation, a return either refunds too much (the full price) or requires recomputing the whole promotion, which can now fail its own threshold. The refund rule ("if the remaining order no longer qualifies, do we claw back the discount?") is a policy to state in the promotion's terms.
- **Margin and reporting.** Discount cost per item, per promotion and per channel is how a promotion is judged.

The default allocation is proportional to each eligible line's amount after item discounts, with the rounding remainder put on the largest line so the allocations sum exactly to the discount ([Rounding](/docs/payments/money#rounding)). BOGO allocates the free unit's value to the "get" line; a free shipping discount allocates to the shipping charge. The core model stores a discount as an `order_charges` row (kind `discount`, payer `merchant`, payee `customer`); the allocation rows below split it by line, and a refund reverses allocations, never the original row.

## Promotion Abuse

Discounts are money handed out by rule, and the rule is the attack surface. The delivery part's [Promotion Abuse](/books/commerce/refunds-and-delivery-fraud#promotion-abuse) covers the main pattern (new-customer offers farmed with new accounts, defeated by identity linking at redemption); [Commerce Fraud & Abuse](/books/commerce/commerce-fraud) covers bots. The commerce-wide patterns:

- **Code leakage.** A code sent to one list ends up on coupon aggregators and browser extensions that try every known code at checkout. Unique single-use codes, codes bound to a customer or email, and short validity windows contain it; a public code should be treated as public.
- **Stacking exploits.** A combination nobody intended (a 30% sitewide offer stacking with a 50% clearance price and a free gift) found and shared. The defenses are class exclusivity by default, explicit combinations only, and a margin floor.
- **Return arbitrage.** Buying to meet a threshold (free shipping, a gift, a tier), then returning the items that met it. Allocation and a stated clawback rule close it.
- **Referral loops.** Referring oneself through a second account for both sides of a referral credit; identity linking again ([Record Linkage](/docs/architecture/record-linkage)).
- **Employee and influencer codes** used far beyond their audience; per-code caps and monitoring by redemption source.

Every redemption is recorded with the code, the customer, the identity links checked and the decision, which the existing `promotion_redemptions` table already does for delivery promotions; this chapter extends it to every promotion.

## Gift Cards and Store Credit

A gift card is not a discount. When a customer buys a $50 gift card, the merchant has received $50 and owes $50 of goods; it's a liability until redeemed, the sale happens at redemption, and the law treats the card as consumer money with protections. Store credit (issued for a return, a goodwill gesture or a price adjustment) looks the same at checkout and has slightly different law.

### Federal law: the CARD Act and Regulation E

The Credit CARD Act of 2009, implemented in Regulation E at 12 CFR 1005.20, covers three products: a **gift certificate** and a **store gift card** (redeemable at one merchant or affiliated group, "in a specified amount, whether or not that amount may be increased or reloaded") and a **general-use prepaid card** ("redeemable upon presentation at multiple, unaffiliated merchants"). Its rules:

- **Expiration.** Funds can't expire before "five years after the date the gift certificate was initially issued" or "the date on which funds were last loaded," whichever is later.
- **Fees.** A dormancy, inactivity or service fee is allowed only if there has been "no activity ... in the one-year period ending on the date" of the fee, "not more than one ... is imposed in any given calendar month," and the fees are disclosed.
- **Exclusions.** The rules don't cover cards that are "reloadable and not marketed or labeled as a gift card," "a loyalty, award, or promotional gift card," or cards "not marketed to the general public." The official interpretation's example of the last is store credit: "a merchant provides store credit to a consumer following a merchandise return by issuing a prepaid card."

A promotional card ("$10 reward card with a $50 purchase") is therefore outside the federal expiry rule, but only if it's disclosed as promotional and its terms say so; a purchased card is inside it. Network-branded general-use prepaid cards, which banks issue and program managers run, are the Payments volume's [Prepaid](/books/payments/card-issuing#prepaid); a merchant's own closed-loop card is this chapter's.

### State law

States go further, most often by banning expiration and fees outright and by requiring small balances to be paid out in cash:

- **California** (Civil Code 1749.5) bans expiration dates and service fees on gift certificates, with exceptions for awards, loyalty and promotional cards, perishable food and discounted volume sales to employers and nonprofits, and allows a dormancy fee only on reloadable cards with $5 or less after 24 months of inactivity, at $1 a month. Since April 1, 2026, "a gift certificate with a cash value of less than fifteen dollars ($15) is redeemable in cash," up from the $10 threshold in place since 2008, and the rule now explicitly covers electronic gift cards.
- **Washington** (RCW 19.240.020) makes it unlawful to issue a gift certificate with "an expiration date," "any fee, including a service fee," or "a dormancy or inactivity charge," and requires cash on demand when "the remaining value of the gift certificate is less than five dollars."
- **Other states** have their own expiry minimums, fee rules and cash-out thresholds, and they change; the rule is resolved from the jurisdiction, not hard-coded. <!-- source-gap: state-gift-card-cashout | missing | a verified table of state gift card cash-out thresholds and expiry rules beyond CA and WA | closes with: each state's statute (MA c.200A 5D, CO, ME, OR, RI, VT and others) opened and cited | checked: 2026-10-28 -->

Which state's law applies generally follows where the card was sold, which for an online sale is a question of the buyer's address; a merchant selling nationally typically applies the strictest rule to every card rather than tracking where each was bought. Cash-out on request is a redemption that pays out instead of buying goods, so the checkout and the support tools both need it.

### Unclaimed property

A gift card balance nobody uses can become unclaimed property, owed to a state rather than kept by the merchant. State laws differ sharply: some exempt gift cards entirely, others treat them as property presumed abandoned after a dormancy period. Delaware, where many issuers are incorporated, lists "gift card, stored-value card" as property and presumes it abandoned "5 years after the later of the date of purchase, the addition of funds ..., a verification of the balance by the owner, or the last indication of interest" (12 Del. C. 1130 and 1133).

Which state gets the money follows the Supreme Court's priority rules from *Texas v. New Jersey* (1965): first the state of the owner's last known address in the holder's records, and if there's none, the holder's state of incorporation. New Jersey's 2010 attempt to claim unredeemed cards by place of purchase was enjoined as preempted by those rules in *New Jersey Retail Merchants Ass'n v. Sidamon-Eristoff* (3d Cir. 2012), which also barred retroactive application and upheld requiring sellers to collect the purchaser's name and ZIP code. The priority rules make two fields carry legal weight: the issuing entity's state of incorporation, and the owner's address when it's known. An escheated balance still belongs to its owner, who can claim it from the state.

### Breakage

**Breakage** is the part of gift card balances that will never be redeemed. Under ASC 606-10-55-48, if a merchant "expects to be entitled to a breakage amount," it recognizes expected breakage as revenue "in proportion to the pattern of rights exercised by the customer"; if not, only "when the likelihood of the customer exercising its remaining rights becomes remote." Under 55-49, amounts the merchant must remit to a state under unclaimed property law are a liability "and not revenue." Deloitte's illustration: with $1,000 of cards issued and $200 of expected breakage, each $40 of redemptions releases $10 of breakage. The playbook's [Breakage](/docs/payments/accounting#breakage) covers the accounting; [Commerce Accounting](/books/commerce/commerce-accounting) the journal entries.

What the system owes finance is the history that makes the estimate: every card's issue date, amount, channel and jurisdiction, and every redemption, load, adjustment and escheatment with its date. With that, finance computes a redemption curve by issue cohort. My rule: breakage is a number in the books, never a state of the card. Recognizing breakage doesn't remove a customer's balance, and an escheated card is still a card the support team can see.

### Store credit

Store credit is a balance owed to a known customer, usually from a return or a goodwill adjustment. Shopify issues it manually or "when you refund an order," lets merchants set expiry dates ("unlike gift cards, store credit doesn't have a store-wide default expiry setting"), shows only credit in the checkout's currency, and warns merchants to "verify the laws for store credit expiration dates in your country." The federal gift card rules exclude return credit issued on a card not marketed to the public; whether a state's gift certificate law reaches store credit is a state question, and the safe design is to treat store credit with the same no-expiry, no-fee defaults unless counsel decides otherwise per jurisdiction. Store credit issued instead of a refund also has a payments consequence: a return refunded to store credit is not a refund to the card, which matters in a later dispute ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

### Gift card fraud

Gift cards are the payment method scammers prefer, because they're fast and hard to reverse. The FTC reported in December 2021 that gift cards were the most common payment method scammers asked for, with "$148 million stolen from consumers" in the first nine months of 2021 and a median loss that rose from $700 to $1,000, and urged retailers to use "point-of-purchase signs, check-out counter alerts" and staff training. For an issuer the controls are velocity limits on purchases and redemptions, holds on high-value digital cards bought with new payment methods, balance checks that are rate-limited (card number enumeration is the classic attack), and full card numbers and PINs treated as secrets. [Commerce Fraud & Abuse](/books/commerce/commerce-fraud) covers detection.

## How to Build It

Promotions, codes and allocations on the order side; a gift card and store credit ledger on the liability side. Extending `order_charges` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and `promotion_redemptions` from [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it):

```sql
CREATE TABLE promotions (                    -- a rule that changes a price after choosing
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  name             TEXT NOT NULL,
  version          INT NOT NULL DEFAULT 1,   -- edits create a new version
  class            TEXT NOT NULL CHECK (class IN ('item', 'order', 'shipping')),
  kind             TEXT NOT NULL CHECK (kind IN ('percent_off', 'amount_off', 'fixed_price',
                     'buy_x_get_y', 'tiered', 'free_shipping', 'gift_with_purchase')),
  redemption       TEXT NOT NULL CHECK (redemption IN ('automatic', 'code')),
  eligibility      JSONB NOT NULL,           -- who: segments, customer IDs, channels, markets
  targets          JSONB NOT NULL,           -- what: items, collections, shipping methods
  conditions       JSONB NOT NULL,           -- when: minimum subtotal or quantity, measured after
  benefit          JSONB NOT NULL,           -- how much: bps, amount, tiers, get-items
  rank             INT NOT NULL,             -- unique; lower applies first
  combines_with    TEXT[] NOT NULL DEFAULT '{}',  -- classes it may stack with
  exclusivity      TEXT NOT NULL DEFAULT 'class' CHECK (exclusivity IN ('none', 'class',
                     'global')),
  funded_by        TEXT NOT NULL DEFAULT 'merchant' CHECK (funded_by IN ('merchant',
                     'manufacturer', 'platform')),  -- tax and reimbursement differ
  budget           BIGINT,                   -- total discount allowed, minor units
  spent            BIGINT NOT NULL DEFAULT 0,
  regular_price_basis TEXT,                  -- for "free" and BOGO claims: the history used
  terms_text       TEXT NOT NULL,            -- shown in close conjunction with the offer
  clawback_rule    TEXT NOT NULL DEFAULT 'none' CHECK (clawback_rule IN ('none',
                     'recompute_on_return')),
  active_during    TSTZRANGE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'active', 'paused',
                     'ended')),
  UNIQUE (merchant_id, rank),
  CHECK (budget IS NULL OR spent <= budget)
);

CREATE TABLE discount_codes (                -- strings that unlock a code promotion
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  promotion_id    UUID NOT NULL REFERENCES promotions (id),
  code            TEXT NOT NULL,             -- compared case-insensitively
  bound_to        UUID REFERENCES customers (id),  -- a code for one customer
  source          TEXT,                      -- 'email:2026-10-winback', 'affiliate:123'
  max_uses        INT,                       -- null: limited only by the promotion
  max_uses_per_customer INT,
  uses            INT NOT NULL DEFAULT 0,
  reserved        INT NOT NULL DEFAULT 0,    -- held by open checkouts
  expires_at      TIMESTAMPTZ,
  CHECK (max_uses IS NULL OR uses + reserved <= max_uses)
);
CREATE UNIQUE INDEX discount_codes_code ON discount_codes (lower(code));

ALTER TABLE promotion_redemptions
  ADD COLUMN promotion_id     UUID REFERENCES promotions (id),
  ADD COLUMN promotion_version INT,
  ADD COLUMN discount_code_id UUID REFERENCES discount_codes (id),
  ADD COLUMN status           TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('reserved',
                                'confirmed', 'released'));

ALTER TABLE order_charges
  ADD COLUMN promotion_id UUID REFERENCES promotions (id),  -- for kind = 'discount'
  ADD COLUMN evaluation   JSONB;            -- what applied, in order, and what was rejected why

CREATE TABLE discount_allocations (          -- an order discount split across lines
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  order_charge_id UUID NOT NULL REFERENCES order_charges (id),
  order_line_id   UUID REFERENCES order_lines (id),    -- null with shipping set
  shipping        BOOLEAN NOT NULL DEFAULT FALSE,
  amount          BIGINT NOT NULL CHECK (amount >= 0),
  UNIQUE NULLS NOT DISTINCT (order_charge_id, order_line_id),
  CHECK ((order_line_id IS NULL) = shipping)
);

CREATE TABLE gift_cards (                    -- a closed-loop stored-value liability
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  issuer_entity    TEXT NOT NULL,            -- the legal entity that owes the balance
  number_hash      BYTEA NOT NULL UNIQUE,    -- lookup without storing the number
  last4            CHAR(4) NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('purchased', 'promotional', 'refund')),
  currency         CHAR(3) NOT NULL,
  initial_amount   BIGINT NOT NULL CHECK (initial_amount > 0),
  reloadable       BOOLEAN NOT NULL DEFAULT FALSE,
  purchaser_id     UUID REFERENCES customers (id),
  owner_address_state TEXT,                  -- last known; decides the escheat state
  sold_in          TEXT,                     -- the jurisdiction whose card law applies
  order_line_id    UUID REFERENCES order_lines (id),  -- the sale of the card
  expires_at       TIMESTAMPTZ,              -- null unless law and kind allow it
  status           TEXT NOT NULL CHECK (status IN ('inactive', 'active', 'frozen',
                     'escheated', 'closed')),
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'purchased' OR expires_at IS NULL
         OR expires_at >= issued_at + INTERVAL '5 years')
);

CREATE TABLE store_credit_accounts (         -- a balance owed to a known customer
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  customer_id  UUID NOT NULL REFERENCES customers (id),
  currency     CHAR(3) NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('active', 'frozen', 'closed')),
  UNIQUE (merchant_id, customer_id, currency)
);

CREATE TABLE gift_card_transactions (        -- the ledger; balances are sums, never columns
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  gift_card_id       UUID REFERENCES gift_cards (id),
  store_credit_id    UUID REFERENCES store_credit_accounts (id),
  kind               TEXT NOT NULL CHECK (kind IN ('issue', 'load', 'redeem',
                       'redeem_reversal', 'cash_out', 'fee', 'adjustment', 'escheat',
                       'expire')),
  amount             BIGINT NOT NULL,        -- signed: issue and load positive, redeem negative
  order_id           UUID REFERENCES orders (id),
  return_id          UUID REFERENCES returns (id),  -- store credit from a return
  rule_ref           TEXT,                   -- the law or policy that allowed a fee or expiry
  idempotency_key    TEXT NOT NULL UNIQUE,
  created_by         TEXT NOT NULL,          -- typed actor: checkout, agent, job
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((gift_card_id IS NULL) <> (store_credit_id IS NULL))
);

-- Balances, which must never go negative; checked in the redemption transaction.
SELECT gift_card_id, SUM(amount) AS balance
FROM gift_card_transactions
WHERE gift_card_id = $1
GROUP BY gift_card_id;

-- Dormant purchased cards approaching a state's abandonment period, for escheat review.
SELECT g.id, g.owner_address_state, MAX(t.created_at) AS last_activity
FROM gift_cards g
JOIN gift_card_transactions t ON t.gift_card_id = g.id
WHERE g.kind = 'purchased' AND g.status = 'active'
GROUP BY g.id, g.owner_address_state
HAVING MAX(t.created_at) < NOW() - INTERVAL '4 years 6 months';
```

Design notes:

- **A gift card is a ledger, not a balance column.** Every issue, load, redemption, reversal, fee, cash-out and escheatment is an append-only row with an idempotency key, and redemption locks the card and checks the sum in one transaction ([Payment States & Ledgers](/docs/payments/payment-states)). The core model's `order_payments` has a `credit` kind; a gift card or store credit redemption is recorded there as a payment against the order, pointing at the transaction row.
- **The sale of a gift card is not revenue** and generally not a taxable sale of goods; the card is an item with `kind = 'gift_card'` whose order line creates a liability, and tax is charged when the card is redeemed for taxable goods.
- **Never store a card number.** Hash it for lookup, show the last four, and rate-limit balance checks; treat the number and PIN like a password ([Sensitive Payment Data](/docs/payments/sensitive-data)).
- **Fees and expiry are rules by jurisdiction,** recorded with the rule that allowed them; the check constraint encodes only the federal floor for purchased cards.
- **Promotions are versioned,** and a redemption records the version, so changing a live promotion never changes what an old order got.
- **Allocations sum exactly** to their charge, and refunds reverse allocations.

## Auditing

- **Every promotion version** with its terms, dates, rank, combinations and approver, and every redemption with the version, code, customer, identity checks and decision.
- **The evaluation on every order:** which discounts applied in what order, which were rejected and why, and the allocation to lines; this is what a customer complaint, a tax audit and a margin review read.
- **Basis for "free" and bargain claims,** with the regular price history and run dates.
- **The full gift card and store credit ledger,** append only, with issuer entity, jurisdiction, owner address when known, fees with the rule that allowed them, cash-outs and escheat reports; unclaimed property audits look back many years ([Audit Trails](/docs/architecture/audit-trails)).
- **Breakage inputs:** issue and redemption history by cohort, reconciled to the liability on the balance sheet.

## What This Means for the System You Build

- **Model a promotion as who, what, when and how much,** with a class, a unique rank, explicit combinations and exclusivity.
- **Apply discounts in one fixed sequence** (items, order, shipping, then tax) everywhere, and explain each result.
- **Allocate order discounts to lines** proportionally, with exact sums, so refunds and tax work line by line.
- **Prefer automatic discounts for broad offers and unique codes for targeted ones;** reserve code uses at checkout and confirm at order.
- **Check "free" and BOGO offers against the FTC's rules** before scheduling them: a real regular price, terms up front, limited duration.
- **Record every redemption with identity checks,** and set budgets and margin floors.
- **Keep gift cards and store credit as an append-only ledger,** separate from discounts and revenue, with no expiry or fees unless the jurisdiction allows them.
- **Record jurisdiction and owner address on every card** for state law and escheat, and pay out small balances where the law requires.
- **Give finance the issue and redemption history** for breakage, and never let breakage change a customer's balance.

## References

**Platform documentation**

- [Shopify Help Center: Discount combinations](https://help.shopify.com/en/manual/discounts/discount-combinations), classes, order of application, best discount, active automatic discount and code limits
- [Shopify Help Center: Discount types](https://help.shopify.com/en/manual/discounts/discount-types), amount off, buy X get Y and free shipping
- [Shopify: Discount Function API](https://shopify.dev/docs/api/functions/latest/discount), three classes, targets and 25 functions per store
- [Shopify Help Center: Store credit](https://help.shopify.com/en/manual/customers/store-credit), issuing, expiry, currency and the legal warning
- [commercetools: Pricing and discounts overview](https://docs.commercetools.com/api/pricing-and-discounts-overview), product discounts before cart discounts, ranking and discount codes
- [commercetools: How cart discounts work](https://docs.commercetools.com/learning-price-and-discount-your-products/cart-discounts/how-cart-discounts-work), stacking modes, total price discounts last and best deal
- [commercetools: Limits](https://docs.commercetools.com/api/limits), active cart and product discounts and codes per cart
- [BigCommerce: Promotions](https://docs.bigcommerce.com/docs/store-operations/promotions), redemption types, stop flag, priority and recommended limits
- [Adobe: Create a cart price rule](https://experienceleague.adobe.com/en/docs/commerce-admin/marketing/promotions/cart-rules/price-rules-cart-create), priority, discard subsequent rules, coupons and actions
- [Salesforce Trailhead: Discount types and promotion controls](https://trailhead.salesforce.com/content/learn/modules/b2c-campaigns-and-promotions/b2c-explore-discount-types-promotion-controls), exclusivity, rank and processing order
- [Medusa: Promotion concepts](https://docs.medusajs.com/resources/commerce-modules/promotion/concepts), promotion types, application methods and campaign budgets
- [Saleor: Discounts overview](https://docs.saleor.io/developer/discounts/overview), promotions, vouchers and manual discounts

**Law and regulation**

- [16 CFR 251.1: Guide concerning use of the word "free"](https://www.law.cornell.edu/cfr/text/16/251.1), regular price, conditions and frequency limits
- [16 CFR 233.4: Bargain offers based upon the purchase of other merchandise](https://www.law.cornell.edu/cfr/text/16/233.4), BOGO, 2-for-1 and half price offers
- [UK Digital Markets, Competition and Consumers Act 2024, Schedule 20](https://www.legislation.gov.uk/ukpga/2024/13/schedule/20), describing a product as free
- [CFPB: Regulation E, 12 CFR 1005.20](https://www.consumerfinance.gov/rules-policy/regulations/1005/20/), definitions, exclusions, fees, expiration and the store credit interpretation
- [California Civil Code 1749.5](https://california.public.law/codes/civil_code_section_1749.5), no expiry or service fees, dormancy fee conditions and the $15 cash-out from April 1, 2026
- [Morgan Lewis: California raises gift card cash-out threshold to $15](https://www.morganlewis.com/pubs/2026/03/california-raises-gift-card-cash-out-threshold-to-15), SB 22, the prior $10 threshold and electronic cards
- [Washington RCW 19.240.020](https://app.leg.wa.gov/RCW/default.aspx?cite=19.240.020), no expiry, fees or dormancy charges, and cash under $5
- [Delaware Code Title 12, Chapter 11, Subchapter II](https://delcode.delaware.gov/title12/c011/sc02/index.html), gift cards as property and the five-year presumption
- [Loeb & Loeb: Third Circuit strikes down New Jersey gift card law](https://www.loeb.com/en/insights/publications/2012/01/third-circuit-strikes-down-new-jersey-gift-card-__), the place-of-purchase presumption, Texas v. New Jersey priority and the purchaser data requirement

**Accounting**

- [Deloitte DART: Customers' unexercised rights (breakage), ASC 606-10-55-46 to 55-49](https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-8-step-5-determine-when/8-8-customers-unexercised-rights-breakage), breakage recognition, unclaimed property as a liability and the gift card illustration

**Fraud**

- [FTC: Gift card scams out of the shadows (December 2021)](https://www.ftc.gov/business-guidance/blog/2021/12/gift-card-scams-out-shadows-ftc-data-spotlight), gift cards as the top scam payment method, losses and retailer measures
