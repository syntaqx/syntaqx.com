+++
title = "Returns & Exchanges"
description = "Return policies and the law, RMAs, exchanges, returnless refunds, return networks, disposition, return fraud and what returns cost, with the schema."
category = "Commerce Industry"
order = 2320
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "returns", "exchanges", "reverse-logistics", "refunds", "fraud"]
+++

A return is an order running backward, and it is rarely the same order. A shopper who bought a jacket in two sizes sends one back; a customer swaps a screen protector for the right fit; a wedding guest returns the dress after the wedding; a box arrives at the warehouse holding a brick. Each one has to be authorized against a policy the law has a say in, carried back by a network built for the purpose, inspected, refunded or exchanged in the right amount to the right tender, and then the unit itself has to go somewhere: back on the shelf, to a refurbisher, to a liquidator, back to the vendor, or into a dumpster that European law is starting to close. Shoppers in the US sent back an estimated $849.9 billion of merchandise in 2025, 15.8% of retail sales, and 19.3% of online sales, by NRF and Happy Returns' estimate.

This chapter covers return policies and the law that shapes them, the return lifecycle from authorization to refund, exchanges and store credit, the networks that carry returns, returnless refunds, return fees, disposition, return fraud and the economics of it all. It extends `returns` and `return_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The refund itself is a payments object ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)), a disputed one is the Payments volume's [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks), and the delivery-app version of a refund (a missing drink, reported in minutes, with no goods to send back) is [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud). Picking a carrier for the return label is Shipping & Carriers; putting a returned unit back into available stock is Inventory.

## How the Platforms Do It

As of October 2026, from each company's own help pages, newsroom and filings:

| Platform or network | What it is | How the shopper returns | Exchanges and credit | Notes |
| --- | --- | --- | --- | --- |
| **Shopify (native returns)** | Returns built into the platform's order admin | Self-serve request "directly from their order status page"; the merchant approves or declines | The merchant can add exchange items to the return | Return rules set the window (14, 30 or 90 days, unlimited or custom), return shipping (free, a flat fee or the customer's own label), an optional percentage restocking fee and final-sale exclusions; "Return fees aren't automatically deducted from refunds" |
| **Loop** | Returns app for Shopify brands, built around exchanges | A returns portal; mail, drop-off or keep the item | Even exchanges, Shop Now (a new order paid with the return's value) and bonus credit "to improve revenue retention" | Keep Item rules with a maximum return value, processed manually or automatically; a strategic partnership with Affirm |
| **Happy Returns** | Box-free drop-off network with its own returns software | Bring the item, unboxed and unlabeled, to a Return Bar | Per the merchant's settings | "10,000 Return Bar locations"; acquired by PayPal in 2021 with more than 2,600 drop-off locations; PayPal completed its sale in the fourth quarter of 2023 |
| **Narvar** | Post-purchase platform: tracking and returns | Return Concierge, with "boxless drop-off" | Per the merchant's settings | No public location count on the Concierge page |
| **Amazon** | Marketplace and retailer with its own drop-off network | Start the return, get a QR code, bring the unpackaged item to "more than 10,000 drop-off locations" (FedEx Office, Whole Foods, The UPS Store, Kohl's, Staples and others) | Replacement or refund | A UPS Store return is free unless a free option is nearer; "in a small number of cases" a $1 fee applies |
| **Returnly** | Returns app known for instant credit | Closed | Closed | "Returnly has officially shut down as of 10/1/2023," per Loop |

Three patterns:

- **Returns moved from the warehouse to the counter.** Drop-off networks (Happy Returns, Amazon's partner stores, Narvar's) take the item without a box or a label, consolidate many returns into one shipment and send them to a processing center. The shopper's effort and the merchant's per-return shipping both fall; the merchant gives up seeing each item before refunding.
- **Software steers toward exchanges.** Loop's bonus credit, Shop Now and Shopify's exchange items all try to turn a refund into a new sale, because an exchange keeps the revenue and a refund doesn't.
- **The networks consolidated and changed hands.** Happy Returns went from startup to PayPal to its later owner in two years; Returnly shut down in October 2023 and pointed its merchants elsewhere. A returns provider is a dependency that can disappear, which is an argument for owning the return records yourself (see [How to Build It](#how-to-build-it)).

## Return Policies and the Law

US law has no general right to return a product that isn't defective. A return policy is the merchant's promise, and what the law mostly regulates is whether the promise was disclosed. Several states require the policy to be posted, and set a default when it isn't:

| State | Statute | What it requires | If the policy isn't posted |
| --- | --- | --- | --- |
| **California** | Civil Code §1723 | A retail seller whose policy gives less than a full cash or credit refund, or an equal exchange, within 7 days must "conspicuously display that policy" at registers, counters, entrances, tags or order forms | The buyer may return the goods within 30 days for the purchase price; exclusions for food, perishables, "as is" and final sale goods, custom orders and others |
| **New York** | General Business Law §218-a | "Every retail mercantile establishment and online retailer shall conspicuously post" its refund policy; online, near the item or by a link shown before billing information is entered | For up to 30 days the buyer may choose a cash refund or credit, for unused, undamaged goods with proof of the purchase date |
| **Florida** | Statute §501.142 | A store giving no refund, credit or exchange must post a "no refund" sign at the point of sale | A refund on request within 7 days of purchase, for unused goods in the original carton; fines up to $100 per violation |
| **Minnesota** | Statute §325F.80 | A seller may not refuse a cash refund for goods returned within a reasonable time unless it posts another policy clearly, in boldface of at least 14 points | Cash refund; civil penalty up to $500 per violation |
| **Virginia** | Code §59.1-200(A)(16) | Failing to disclose the conditions, charges or fees for returns is a prohibited practice | Exempt if the merchant refunds for at least 20 days after purchase |

Hawaii and New Jersey have refund-disclosure statutes of their own; I could confirm them only from secondary summaries, so check the text before relying on the details. <!-- source-gap: hi-nj-refund-disclosure | secondary | Hawaii HRS 481B-5.5 and the New Jersey Refund Policy Disclosure Act (N.J.S.A. 56:8-2.14 to 2.21) sign and remedy rules | closes with: the official statute text opened on capitol.hawaii.gov and the NJ legislature site | checked: 2026-10-28 --> A merchant selling into all fifty states writes one policy that satisfies the strictest of them and shows it before checkout, on the product page and in the confirmation; the policy is a versioned record, because a return is judged against the policy in force when the order was placed, not the one in force when it came back.

The FTC's Mail, Internet, or Telephone Order Merchandise Rule governs refunds when the merchant can't ship (a refund "within seven working days after the order is cancelled"), not returns of goods that arrived. Federal warranty law and the FTC's rules on how a "satisfaction guarantee" may be advertised belong to Consumer Protection Online, which also owns the wider EU consumer rights picture.

**The EU right of withdrawal** is the exception that makes returns a legal duty. Under the Consumer Rights Directive (2011/83/EU), a consumer has 14 days to withdraw from a distance contract "without giving any reason" (Article 9). The rules a returns system has to encode:

- **The clock.** For goods, 14 days from physical possession; if the trader didn't give the withdrawal information, the period runs 12 months longer (Article 10).
- **The refund.** "Not later than 14 days" from being told of the withdrawal, "using the same means of payment" as the original transaction, including the standard delivery charge; a costlier delivery option the consumer chose isn't refunded beyond the cheapest standard one (Article 13).
- **The hold.** The trader may withhold the refund until the goods are back or the consumer shows evidence of sending them, whichever comes first (Article 13(3)).
- **The cost of sending it back.** The consumer bears "the direct cost of returning the goods" unless the trader agreed to pay it or didn't tell the consumer they'd have to (Article 14(1)).
- **Wear.** The consumer is liable only for "diminished value" from handling beyond what is needed to establish the goods' nature, characteristics and functioning (Article 14(2)); the deduction is a line on the refund, not a reason to refuse it.

The UK kept the same rules in the Consumer Contracts Regulations 2013 (regulations 30, 31 and 34). Directive (EU) 2023/2673 adds a withdrawal function: from 19 June 2026, a trader selling online has to offer a clearly labeled way to withdraw throughout the withdrawal period, which for a returns system means the withdrawal itself is a request the shopper submits online and the trader acknowledges, with its timestamp as the start of the 14-day refund clock. <!-- source-gap: eu-withdrawal-button | secondary | Directive (EU) 2023/2673 withdrawal function, applicable from 19 June 2026 | closes with: the directive's text on EUR-Lex, opened and quoted | checked: 2026-10-28 -->

For an EU or UK order, the return window and refund deadline are computed from the delivery date and the withdrawal notice and stored on the return ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). A merchant's own "30 days, free returns" policy can be more generous than the law, never less.

## The Return Lifecycle

A return goes through the same states whoever runs it:

1. **Request.** The shopper picks the order lines, quantities and a reason from a list (too small, too large, not as described, damaged, changed mind, arrived late). Reasons are codes, because they decide who pays for shipping, whether a photo is needed, whether the item goes back on the shelf and which product pages need fixing.
2. **Authorization.** The request is checked against the policy version on the order: inside the window, not a final-sale item, quantity not already returned, customer not blocked. An approved request becomes a return merchandise authorization (RMA) with a number the warehouse can scan. Shopify lets the merchant approve or decline; Loop and others auto-approve by rule.
3. **Method.** A prepaid label, a QR code for a box-free drop-off, an in-store return, or no return at all (a returnless refund). The method decides the refund trigger and the cost.
4. **Transit.** The label's tracking number and, for a drop-off, the scan at the counter are the first proof the item is on its way.
5. **Receipt and inspection.** The warehouse or a returns processor opens the package, matches it to the RMA, checks it's the right item in the claimed condition, grades it and sets a disposition.
6. **Resolution.** A refund to the original payment method, store credit, an exchange, or a partial refund less a restocking fee or a diminished-value deduction. A rejected return (wrong item, outside the window, used) goes back to the shopper or is held.
7. **Close.** The unit's disposition is executed and the return is closed.

**When to refund is a risk decision.** Merchants refund at one of four points: on request (instant, before anything ships), on the carrier's first scan or a drop-off counter's scan, on receipt at the warehouse, or after inspection. Each step earlier is better service and more exposure to fraud. A common split is instant or first-scan refunds for low-value items and trusted customers, receipt or inspection for high-value ones, which is the band structure from [Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle) applied to returns.

**What is refunded.** The line's price paid (after its share of any order-level discount), its tax, and, depending on the reason and the law, the original shipping charge, less any return fee, restocking fee or deduction. A line's discount allocation decides this: a "buy two, get 20% off" order returned in part refunds the returned line at its discounted price, not its list price, and may break the promotion's condition. The amounts come from the order's lines and charges, never from the catalog's current price ([Snapshots on the Line](/books/commerce/commerce-business#the-core-data-model)).

**Where it is refunded.** Back to the original tender, in the original currency; a split-tender order (a gift card and a card) refunds in a defined order, usually card first or gift card first by policy. A refund to a card the merchant only authorized and hasn't captured is a reduced capture instead (Taking Payment in Commerce covers the capture side). Store credit is a liability on the books, owned with gift cards by Promotions, Discounts & Gift Cards.

## Exchanges and Store Credit

An exchange is a return and a new order joined by an amount. The kinds:

- **Even exchange.** Same product, another variant at the same price (a size, a color, a fit). No money moves; the replacement ships, often before the original arrives back ("advance exchange"), which needs a hold or authorization in case the original never comes.
- **Uneven exchange.** A different item at a different price: the shopper pays the difference or gets it back.
- **Shop Now or credit-to-order.** The return's value becomes credit spent immediately on a new cart; Loop's bonus credit "will be deducted from the purchase subtotal, so it functions like a discount."
- **Store credit.** Value kept for later, sometimes with a bonus over the refund amount to make it more attractive than cash.

For the accounting, an exchange of one product for another "of the same type, quality, condition and price" is not a return under ASC 606 (PwC's guide to ASC 606-10-55-28): no revenue reverses. A refund or an exchange for something different is a return. The data model keeps the exchange's new order as an ordinary order with its own lines, linked to the return, so revenue, inventory and tax treat it like any other sale.

## Return Networks

The cost of a mailed return is a label, a box and a parcel carried back one at a time. Networks change the unit:

- **Box-free drop-off.** The shopper hands over the item and a code; the counter bags it with others and ships them in bulk to a processing center. Happy Returns built this from its founding in about 2015 through more than 2,600 drop-off locations when PayPal bought it in 2021 to 10,000 Return Bar locations today; PayPal sold it in the fourth quarter of 2023 at a pre-tax gain of $339 million, and its own site cites press coverage of it as a UPS company. Amazon built the same thing from its own partners: "more than 10,000 drop-off locations across the United States," with four in five customers within five miles of one.
- **Retailer counters.** A store accepts returns of online orders (Home Depot calls it BORIS, buy online, return in store) and sometimes of other merchants' orders through a network, which is a reason for a shopper to walk in ([Omnichannel Fulfillment](/books/commerce/omnichannel-fulfillment#returns-in-store)).
- **Returns software.** Loop, Narvar, Shopify's own returns and similar apps run the portal, the rules, the label and the refund; they plug into a network or a carrier for the physical part.

The design consequence of consolidation: the merchant sees the item later and in a batch. A drop-off scan proves the shopper handed something over, not what it was, so a network's first scan is a reasonable refund trigger only up to a value and a customer risk band. The network's batch shipment needs its own tracking, and the RMA numbers inside it are reconciled when it's opened.

## Returnless Refunds

Sometimes the item isn't worth bringing back: a $9 phone case costs more to ship, receive and inspect than it's worth, and a damaged or perishable item can't be resold anyway. A returnless refund ("keep it") refunds without asking for the item. Loop's Keep Item rules set a maximum value, which is "the collective value of the return, not per individual item, and excludes taxes paid," and can be triggered by reason (damaged, for instance) and processed automatically or held for review. Amazon and Walmart Marketplace let sellers set returnless rules by price, category and reason; their seller help pages sit behind logins, so the details here are from secondary seller guides. <!-- source-gap: marketplace-returnless-rules | secondary | Amazon Seller Central returnless refund settings and Walmart Marketplace "Keep It" rules (price limits, categories, reasons) | closes with: a public Amazon or Walmart seller help page describing the rule fields | checked: 2026-10-28 -->

A returnless refund is a decision with a cost threshold and a fraud exposure: the break-even is the item's recovery value against return shipping, processing and the chance of reselling it, and the exposure is a customer who learns that low-value items come free. Rules belong in data with a version and a per-customer cap, and every keep-it refund records the rule that granted it.

## Return Fees and Restocking

Free returns are a promise many merchants have started to price. In NRF and Happy Returns' 2025 survey, "82% of consumers" said free returns were important to them, and the top reasons retailers gave for charging were the cost of processing (40%), carrier costs (40%) and economic uncertainty and tariffs (33%). The forms:

- **A mail-return fee,** deducted from the refund, with in-store and drop-off returns kept free to steer shoppers to the cheaper channel. H&M charged US customers $5.99 for returns by mail, except loyalty members, by September 2023; Amazon charges $1 for a UPS Store return in the small number of cases where a free drop-off is nearer.
- **A restocking fee,** a percentage of the price, common for electronics and large items. Shopify's return rules support an optional percentage restocking fee.
- **Fees waived by reason or membership.** A wrong or damaged item is free to return; a loyalty member's return is free.

A fee is a line on the return with its rule, not a reduced refund amount, so the refund can be explained and a state disclosure rule ("all conditions, charges or fees" in Virginia's words) can be checked against what was shown before purchase.

## Disposition

What happens to the unit decides most of a return's cost. The usual outcomes, set at inspection and stored on the return line:

| Disposition | When | Where the value goes |
| --- | --- | --- |
| **Restock** | Unopened or as-new, in sellable packaging | Back into available stock at full price |
| **Refurbish or repackage** | Opened, working, needing new packaging, cleaning or testing | Resold as open-box or refurbished at a markdown |
| **Return to vendor** | The supplier's agreement takes back defective or unsold goods | A credit from the supplier ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#returns-to-vendor)) |
| **Liquidate** | Not worth processing one at a time | Sold by the pallet; Liquidity Services' marketplaces let US and Canadian companies "sell excess, returned, and overstocked consumer goods" |
| **Donate or recycle** | No resale channel, or a legal duty | A tax deduction, or nothing |
| **Destroy** | Unsafe, counterfeit, recalled, contaminated | A write-off, now restricted in the EU |

Europe is closing the last row for some goods. The Ecodesign for Sustainable Products Regulation ((EU) 2024/1781) bans large companies from destroying unsold apparel, clothing accessories and footwear from 19 July 2026, with derogations (safety, damage) set by delegated act; medium-sized companies are expected to follow in 2030. France's anti-waste law has banned destroying unsold new non-food goods since 2022 for products under producer responsibility schemes, extended to the rest by the end of 2023. <!-- source-gap: france-agec-destruction-ban | secondary | France AGEC law (Law 2020-105) destruction ban dates for unsold non-food goods | closes with: Code de l'environnement L.541-15-8 opened on Legifrance | checked: 2026-10-28 --> A returned item counts as unsold once it can't be sold as new, so a destruction disposition in those markets needs a recorded reason that fits a derogation.

## Return Fraud and Abuse

NRF and Happy Returns' 2025 report found that "9% of all returns are fraudulent," and that "close to two-thirds of consumers admit to participating in at least one costly returns behavior, from wardrobing and 'bracketing' to sending back different items or empty boxes." Appriss Retail's annual benchmark puts preventable return fraud and abuse at around $100 billion a year in the US, but I could open only secondary coverage of it. <!-- source-gap: appriss-return-fraud | secondary | Appriss Retail 2026 Total Retail Loss Benchmark: return fraud and abuse share and dollar figure | closes with: the Appriss report or press release opened on apprissretail.com | checked: 2026-10-28 --> The behaviors, from abuse to crime:

- **Bracketing.** Buying several sizes to keep one; 51% of Gen Z shoppers said they do it in the 2024 NRF report. Not fraud, but a predictable return the merchant can plan for or discourage.
- **Wardrobing.** Wearing or using an item and returning it as unused: the dress after the event, the camera after the trip.
- **Swap and empty-box fraud.** Returning a different, cheaper or broken item, or nothing, in the original packaging. A box-free drop-off makes the swap visible only at the processing center.
- **Receipt and price fraud.** Returning stolen goods, or goods bought at a lower price, for a refund at the full price; returning one store's goods to another.
- **Refund-as-a-service.** Organized services that claim refunds on a customer's behalf with false "item not received" or empty-box claims, sold for a cut of the refund ([Customer Refund Abuse](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse)).
- **Chargeback after refund.** A customer refunded by the merchant who also disputes with the bank; the refund and the dispute must be netted ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

The controls are the same machinery as payments fraud: return rate and value per customer, address, device and card, linked across accounts ([Record Linkage](/docs/architecture/record-linkage)); refund timing by risk band; photos for damage claims; weight checks at receipt against the item's expected weight; and serial-number capture for electronics so the returned unit is the one shipped. Appriss's return authorization product "scores every return transaction in real time and issues an Approve, Warn, or Decline decision at the POS," which puts the decision at the returns counter. Limiting or closing accounts of serial abusers is a policy decision with consumer-law exposure; it belongs in the published policy, not in an unexplained decline. Commerce Fraud & Abuse covers the wider fraud picture across the store.

## Return-Rate Economics

A return costs the merchant several things at once, and only one of them is the refund:

- **Revenue that reverses,** with its tax.
- **Two shipments,** outbound already paid and the return label, unless the shopper pays.
- **Processing:** receiving, inspection, grading, repackaging and the system that tracks it.
- **Lost value on the unit:** the markdown on open-box, the recovery rate on liquidation, nothing on destruction.
- **Payment fees on the original sale,** which a processor's terms may not return on a refund, and any currency loss on a cross-border one ([Refunds and FX Gains and Losses](/docs/payments/multi-currency#refunds-and-fx-gains-and-losses)).

Return rates vary by category (apparel and footwear high, consumables low) and by channel: online orders come back more often than store sales (19.3% against 15.8% of all retail in NRF's 2025 estimate), because the shopper couldn't touch the item first. That gap is why return rate belongs in unit economics per product and per channel ([The Unit Economics](/books/commerce/business-models#the-unit-economics)), and why reason codes feed back to catalog work: a size chart that sends a third of a style back as "too small" is a content defect with a measurable cost.

**The books.** Under ASC 606 a right of return is variable consideration: revenue is recognized for what the seller expects to keep, a refund liability for what it expects to give back, remeasured each period, and a separate asset for the right to recover the goods, measured at their carrying amount less recovery costs and expected loss in value (PwC's guide to ASC 606-10-55-23). Retailers state it in their filings: Target's merchandise sales "are net of expected returns"; Boot Barn reserves "for projected merchandise returns based upon historical experience." The data the estimate needs is the history this chapter's tables keep: returns by product, channel, age and reason. [ASC 606 and IFRS 15 in Five Steps](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps) has the general model; Commerce Accounting has the commerce journal entries.

## How to Build It

The core model already has `returns` (order, method, status) and `return_lines` (line, quantity, reason, disposition). This chapter adds the policy, the authorization details, inspection and exchanges:

```sql
CREATE TABLE return_policies (           -- the promise in force when the order was placed
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  name             TEXT NOT NULL,
  version          INT NOT NULL,
  market           TEXT,                 -- null: default; e.g. 'EU', 'UK', a country code
  window_days      INT,                  -- null: unlimited
  window_starts    TEXT NOT NULL CHECK (window_starts IN ('order', 'delivery')),
  return_shipping  TEXT NOT NULL CHECK (return_shipping IN ('free', 'flat_fee',
                     'customer_label')),
  return_fee       BIGINT NOT NULL DEFAULT 0,
  restocking_pct   NUMERIC(5, 4) NOT NULL DEFAULT 0,
  final_sale_rule  JSONB NOT NULL DEFAULT '{}',  -- product, collection or tag exclusions
  keep_item_max    BIGINT,               -- returnless refund ceiling per return; null: never
  refund_trigger   TEXT NOT NULL CHECK (refund_trigger IN ('request', 'first_scan',
                     'received', 'inspected')),
  disclosure_text  TEXT NOT NULL,        -- what the shopper was shown
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (merchant_id, name, version)
);

ALTER TABLE orders ADD COLUMN return_policy_id UUID REFERENCES return_policies (id);

ALTER TABLE returns
  ADD COLUMN rma_number     TEXT,         -- what the warehouse scans
  ADD COLUMN policy_id      UUID REFERENCES return_policies (id),
  ADD COLUMN requested_via  TEXT CHECK (requested_via IN ('portal', 'support', 'store',
                              'marketplace', 'withdrawal_notice')),
  ADD COLUMN return_by      TIMESTAMPTZ,  -- computed from the policy or the law
  ADD COLUMN refund_due_by  TIMESTAMPTZ,  -- e.g. 14 days from an EU withdrawal notice
  ADD COLUMN drop_off_ref   TEXT,         -- the network's scan or QR code reference
  ADD COLUMN shipment_id    UUID REFERENCES shipments (id),  -- the return label
  ADD COLUMN risk_decision_id UUID,       -- the scoring decision, per the playbook
  ADD COLUMN resolution     TEXT CHECK (resolution IN ('refund', 'store_credit', 'exchange',
                              'keep_item', 'rejected')),
  ADD CONSTRAINT returns_rma_unique UNIQUE (rma_number);

CREATE TABLE return_inspections (        -- what actually came back
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  return_id      UUID NOT NULL REFERENCES returns (id),
  order_line_id  UUID NOT NULL REFERENCES order_lines (id),
  location_id    UUID NOT NULL REFERENCES locations (id),  -- warehouse or store that inspected
  quantity       NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  matches_rma    BOOLEAN NOT NULL,       -- false: wrong item, empty box, swap
  serial_number  TEXT,                   -- compared with the one shipped
  weight_grams   INT,                    -- compared with the item's expected weight
  grade          TEXT NOT NULL CHECK (grade IN ('new', 'open_box', 'used', 'damaged',
                   'not_received', 'wrong_item')),
  disposition    TEXT NOT NULL CHECK (disposition IN ('restock', 'refurbish', 'liquidate',
                   'donate', 'recycle', 'destroy', 'return_to_vendor')),
  disposition_reason TEXT,               -- required for 'destroy' where the law restricts it
  deduction      BIGINT NOT NULL DEFAULT 0,  -- diminished value, minor units
  evidence       JSONB NOT NULL DEFAULT '[]',  -- photo references
  inspected_by   TEXT NOT NULL,
  inspected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE return_amounts (            -- the refund, built from lines and charges
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  return_id     UUID NOT NULL REFERENCES returns (id),
  order_line_id UUID REFERENCES order_lines (id),  -- null: an order-level amount
  kind          TEXT NOT NULL CHECK (kind IN ('goods', 'tax', 'shipping_refund',
                  'return_fee', 'restocking_fee', 'deduction', 'bonus_credit')),
  amount        BIGINT NOT NULL,         -- signed: negative reduces the refund
  rule_ref      TEXT NOT NULL            -- policy version or law that set it
);

CREATE TABLE exchanges (                 -- a return joined to a new order
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  return_id       UUID NOT NULL REFERENCES returns (id),
  new_order_id    UUID NOT NULL REFERENCES orders (id),
  kind            TEXT NOT NULL CHECK (kind IN ('even', 'uneven', 'shop_now')),
  ship_before_receipt BOOLEAN NOT NULL DEFAULT FALSE,  -- advance exchange
  hold_payment_ref TEXT,                 -- authorization held until the original arrives
  balance         BIGINT NOT NULL DEFAULT 0,  -- positive: shopper pays; negative: refunded
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (return_id)
);

-- Lines that can still be returned: ordered less already returned, inside the window.
SELECT ol.id, ol.quantity - COALESCE(SUM(rl.quantity), 0) AS returnable
FROM order_lines ol
JOIN orders o ON o.id = ol.order_id
JOIN return_policies p ON p.id = o.return_policy_id
LEFT JOIN return_lines rl ON rl.order_line_id = ol.id
LEFT JOIN returns r ON r.id = rl.return_id AND r.status <> 'rejected'
WHERE ol.order_id = $1
GROUP BY ol.id, ol.quantity
HAVING ol.quantity - COALESCE(SUM(rl.quantity), 0) > 0;
```

Design notes:

- **The policy is pinned to the order.** `orders.return_policy_id` records the version shown at checkout; changing the policy tomorrow doesn't change what yesterday's buyer was promised, and the disclosure text is kept for the state laws that turn on it.
- **Deadlines are columns.** `return_by` and `refund_due_by` are computed when the return is created from the policy, the delivery date and, in the EU and UK, the withdrawal notice, so a job can find refunds about to breach the 14-day rule ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **The refund is a sum of rows.** `return_amounts` lists goods, tax, shipping, fees and deductions, each with its rule; the payment provider's refund in `order_payments` must equal their sum. That is what lets a support agent explain a refund and an auditor check a restocking fee.
- **Inspection is separate from the request.** The shopper's reason is a claim; the inspection is what came back. A mismatch (`matches_rma = false`) is the label for the fraud model ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).
- **Restock is an inventory movement.** A `restock` disposition at a location adds on-hand through the Inventory chapter's movements, never by editing `inventory_levels` directly, so the count can be traced to the return.
- **Return labels are shipments.** The label is a `shipments` row on a return fulfillment, with the carrier's tracking events, so return transit uses the same tracking code as outbound.
- **Emit `return.requested`, `return.approved`, `return.received`, `return.inspected` and `return.refunded`** for the warehouse, accounting, the fraud model and customer messages ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every policy version** with its disclosure text and validity, and the version pinned to each order.
- **Every return** with its request, reason, authorization decision and rule, deadlines and the risk decision that set its refund trigger.
- **Every inspection** with the grade, evidence, who inspected it and the disposition, and for destruction the reason that justified it.
- **Every refund amount** by kind and rule, tied to the payment provider's refund, so a regulator's question about the EU 14-day deadline or a state's disclosure rule has an answer.
- **Every exchange** with the new order and any held authorization.

## What This Means for the System You Build

- **Version the return policy and pin it to the order,** with the text the shopper saw.
- **Compute and store the return window and refund deadline,** including the EU and UK withdrawal rules for orders in those markets.
- **Use reason codes, not free text,** and feed them back to the catalog.
- **Choose the refund trigger by risk band:** instant or first scan for low risk, receipt or inspection for the rest.
- **Build the refund from rows** (goods, tax, shipping, fees, deductions), each with its rule, and refund to the original tender.
- **Model an exchange as a return plus an ordinary new order,** linked, with any advance-exchange hold recorded.
- **Record what came back separately from what was claimed,** and use mismatches as fraud labels.
- **Set disposition at inspection** and restock through inventory movements; record the reason for any destruction.
- **Own the return records even when an app or network runs the flow,** because providers come and go.

## References

**Law**

- [California Civil Code §1723 (public.law mirror)](https://california.public.law/codes/civil_code_section_1723), posting a refund policy that gives less than a full refund or exchange within 7 days, the exclusions and the 30-day remedy
- [California Attorney General: Refund policies](https://www.oag.ca.gov/consumers/general/refund_policies), the state's summary of §1723 and the 30-day return remedy
- [New York General Business Law §218-a](https://www.nysenate.gov/legislation/laws/GBS/218-A), refund policy posting for stores and online retailers and the 30-day remedy
- [Florida Statutes §501.142](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.142.html), the "no refund" sign, the 7-day presumed refund and fines
- [Minnesota Statutes §325F.80](https://www.revisor.mn.gov/statutes/cite/325F.80), the default cash refund, the 14-point posting rule and the $500 penalty
- [Code of Virginia §59.1-200](https://law.lis.virginia.gov/vacode/title59.1/chapter17/section59.1-200/), nondisclosure of return conditions as a prohibited practice and the 20-day exemption
- [Directive 2011/83/EU on consumer rights (legislation.gov.uk copy)](https://www.legislation.gov.uk/eudr/2011/83), Articles 9, 10, 13 and 14 on the 14-day withdrawal, the 12-month extension, the refund deadline and means, the hold and the return cost
- [UK Consumer Contracts Regulations 2013, regulation 30](https://www.legislation.gov.uk/uksi/2013/3134/regulation/30), the 14-day cancellation period for goods
- [UK Consumer Contracts Regulations 2013, regulation 31](https://www.legislation.gov.uk/uksi/2013/3134/regulation/31), the 12-month extension
- [UK Consumer Contracts Regulations 2013, regulation 34](https://www.legislation.gov.uk/uksi/2013/3134/regulation/34), the refund deadline, the evidence of sending, delivery charges and diminished value
- [FTC: Business guide to the Mail, Internet, or Telephone Order Merchandise Rule](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule), refunds within seven working days of cancellation
- [EU Circular Economy Platform: New EU rules to stop the destruction of unsold clothes and shoes (February 11, 2026)](https://circulareconomy.europa.eu/platform/en/news-and-events/all-news/new-eu-rules-stop-destruction-unsold-clothes-and-shoes), the ESPR ban for large companies from 19 July 2026 and medium-sized companies in 2030

**Platforms and networks**

- [Shopify Help: Self-serve returns](https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns), requests from the order status page, approval and exchange items
- [Shopify Help: Return rules](https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules), windows, return shipping fees, restocking fees and final-sale exclusions
- [Loop Help: Bonus credit](https://help.loopreturns.com/en/articles/1912193), bonus credit for exchanges and store credit, and how Shop Now applies it
- [Loop Help: Keep Item](https://help.loopreturns.com/en/articles/1913089), returnless refunds by maximum return value, reason and processing mode
- [Loop: Returnly](https://www.loopreturns.com/returnly), Returnly's shutdown on 10/1/2023 and Loop's partnership with Affirm
- [Happy Returns](https://www.happyreturns.com/), 10,000 Return Bar locations and box-free, label-free returns
- [PayPal Newsroom: Happy Returns joins forces with PayPal (May 13, 2021)](https://newsroom.paypal-corp.com/2021-05-13-Happy-Returns-joins-forces-with-PayPal), the acquisition, more than 2,600 drop-off locations and the founding about six years earlier
- [PayPal: Form 10-K for 2023](https://www.sec.gov/Archives/edgar/data/1633917/000163391724000024/pypl-20231231.htm), the completed sale of Happy Returns in the fourth quarter of 2023 and its $339 million pre-tax gain
- [Narvar: Return Concierge](https://corp.narvar.com/concierge), boxless drop-off returns
- [Amazon: Free returns with no box, tape or label needed](https://aboutamazon.com/news/operations/free-returns-with-no-box-tape-or-label-needed), more than 10,000 drop-off locations, partners, the QR code flow and the $1 UPS Store fee
- [Appriss Retail: Verify](https://apprissretail.com/solutions/verify/), real-time return authorization at the point of sale
- [Liquidity Services: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1235468/000119312525289159/lqdt-20250930.htm), marketplaces for excess, returned and overstocked consumer goods and returns services

**Research and press**

- [NRF: Consumers expected to return nearly $850 billion in merchandise in 2025](https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025), the $849.9 billion total, 15.8% and 19.3% return rates, 9% fraudulent returns, returns behaviors and reasons for fees
- [NRF: 2025 Retail Returns Landscape](https://nrf.com/research/2025-retail-returns-landscape), the 82% who say free returns matter
- [NRF and Happy Returns: 2024 retail returns to total $890 billion](https://nrf.com/media-center/press-releases/nrf-and-happy-returns-report-2024-retail-returns-total-890-billion), the 2024 total and the 51% of Gen Z who bracket
- [Retail Dive: H&M expanding online return fees to more markets (September 20, 2023)](https://www.retaildive.com/news/hm-expanding-online-return-fees-more-markets/694207), the $5.99 US fee for non-members
- [CNN via KRDO: Amazon will charge a fee for some UPS returns (April 12, 2023)](https://krdo.com/money/cnn-business-consumer/2023/04/12/amazon-will-charge-customers-a-fee-for-some-ups-returns/), the $1 fee when a Whole Foods, Amazon Fresh or Kohl's is nearer

**Accounting and filings**

- [PwC Viewpoint: Rights of return](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_8_practical__US/82rights_of_return_US.html), refund liability, the return asset and exchanges that aren't returns under ASC 606
- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), merchandise sales net of expected returns
- [Home Depot: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/354950/000162828026019436/hd-20260201.htm), BORIS, buy online, return in store
- [Boot Barn: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1610250/000110465926061346/boot-20260328x10k.htm), the sales returns reserve based on historical experience
</content>
</invoke>
