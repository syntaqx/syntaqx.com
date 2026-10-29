+++
title = "Consumer Protection Online"
description = "The FTC Mail Order Rule, fee disclosure and drip pricing, dark patterns, price comparisons, Made in USA, warranties and the EU's 14-day right of withdrawal."
category = "Commerce Industry"
order = 2315
part = "Storefront and Checkout"
tags = ["commerce", "consumer-protection", "ftc", "warranties", "eu-consumer-law"]
+++

Consumer protection law for an online store is mostly about promises made on a screen: when the order will ship, what the total is, what "was $80" means, what "Made in USA" means, what the warranty covers, and, in Europe, the right to send it back for no reason. Each promise is made by the system (a shipping estimate computed from cutoffs, a price display computed from charges, a badge rendered from a product attribute), so each one is a rule the system has to know and a record it has to keep. The FTC and state attorneys general bring the cases; the evidence is what the shopper saw and what the merchant did next.

This chapter covers the FTC's Mail, Internet, or Telephone Order Merchandise Rule and the shipping promise it governs, fee disclosure and drip pricing, dark patterns and their enforcement, price comparisons, Made in USA claims, warranties under the Magnuson-Moss Act, and the EU's right of withdrawal. Automatic renewal and cancellation law is [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law); door-to-door sales and the Cooling-Off Rule are the Field Operations volume's ([The Sale at the Door](/books/field-operations/consumer-protection#the-sale-at-the-door)); reviews and the FTC's fake reviews rule are the User-Generated Platforms volume's ([The FTC Consumer Reviews and Testimonials Rule](/books/user-generated-platforms/messaging-and-reviews#the-ftc-consumer-reviews-and-testimonials-rule)); accessibility is [Accessibility and ADA Litigation](/books/commerce/storefronts#accessibility-and-ada-litigation). The chapter extends `orders` and `fulfillments` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `shipping_promises`, `delay_notices` and `warranty_terms`.

## The Rules at a Glance

As of October 2026:

| Rule | Who enforces | What it requires of a store | The record it needs |
| --- | --- | --- | --- |
| **Mail, Internet, or Telephone Order Merchandise Rule** (16 CFR Part 435) | FTC; civil penalties up to $53,088 per violation | Ship within the stated time, or 30 days if none (50 when the buyer applies for credit); a reasonable basis for the promise; delay notices with a right to cancel; prompt refunds | The promise as stated, its basis, every delay notice and response, refunds and their dates |
| **Fee disclosure** (FTC Act section 5; the FTC's fees rule for tickets and lodging; state all-in pricing laws) | FTC, state attorneys general | Mandatory fees shown in the price or before checkout, as the law of the place requires | What was shown at each step |
| **Dark patterns** (FTC Act section 5, ROSCA, state law) | FTC, state attorneys general | No interfaces that trick shoppers into purchases, subscriptions or data sharing, or make cancelling hard | The interface version shown and the choices made |
| **Former price and comparison claims** (16 CFR Part 233; state law) | FTC, state attorneys general, private suits | A "was" price that was really charged for a reasonably substantial period | Price history per item |
| **Made in USA** (16 CFR Part 323 and FTC Act) | FTC; civil penalties for labels and online seals | Unqualified claims only for products "all or virtually all" made in the US | The basis for each origin claim |
| **Magnuson-Moss Warranty Act** (16 CFR Parts 700 to 703) | FTC, private suits | Warranty terms available before purchase; no tie-ins; no disclaiming implied warranties alongside a written one | The warranty text and version per product |
| **EU Consumer Rights Directive** and national law | Member state authorities | A 14-day right of withdrawal for distance sales, refunds within 14 days, and from June 19, 2026 a withdrawal function online | Withdrawal notices, returns and refunds with their dates |

## Shipping Promises: the Mail Order Rule

The FTC's Mail, Internet, or Telephone Order Merchandise Rule applies to goods ordered by mail, phone or online, and its rules are simple and strict:

- **Have a reasonable basis.** A seller must have a reasonable basis for any shipping time it states, meaning "such information as would under the circumstances satisfy a reasonable and prudent businessperson." If it states no time, it must have a reasonable basis to ship "within 30 days." When the buyer applies for credit to pay, and no time was stated, the seller has 50 days.
- **"Shipped" means in the carrier's hands.** Shipment is "the act by which the merchandise is physically placed in the possession of the carrier," not a label printed. A drop-ship order is the seller's promise kept on the supplier's clock ([Liability](/books/commerce/drop-ship-and-print-on-demand#liability)).
- **Ask before you're late.** A seller that can't ship on time must, before the deadline, seek the buyer's consent to the delay, giving a revised date (or saying it doesn't know one) and the option to cancel for "a full and prompt refund." If the revised date is definite and within 30 days of the original, silence counts as consent.
- **A second delay needs a yes.** If the seller then misses the revised date, it must send a renewed notice before that date, and "the customer's silence may not be treated as a consent to delay." For an indefinite delay the seller explains why, and the buyer may cancel any time until the goods ship.
- **Refund promptly.** A canceled order is refunded "within seven working days" for payments other than seller-provided credit; for credit the seller issues, the account is credited "within one billing cycle."

For a store, a promise is anything the shopper reads as a time: "ships in 1 to 2 business days" on a product page, "arrives by Friday" on a shipping option, a preorder date, "in stock" on a page whose stock is a week away. Each one needs a basis in the system (inventory at the fulfilling location, the location's cutoffs and handling time, the carrier's transit time), and each one starts a clock that the order system has to watch:

- **The promise is the earliest stated.** The product page's handling time and the checkout's shipping quote can disagree; the binding promise is the one the shopper was shown, stored with the order ([Shipping Options](/books/commerce/cart-and-checkout#shipping-options)).
- **Backorders and preorders need a date or a notice.** A line that won't ship in time triggers the delay notice workflow before the deadline, not after a complaint, and the notice offers cancellation as a button, not a support email.
- **Cancellation means a refund or a void.** If the card was only authorized, the void is the refund ([Capture Policies](/books/commerce/taking-payment#capture-policies)); if it was captured, the refund clock is seven working days.
- **Split orders count line by line.** The rule applies to the merchandise ordered, so a partially shipped order with one backordered line needs a notice for that line.

## Fees and Drip Pricing

A total that grows at the last step is the most common reason shoppers abandon ([Checkout Steps](/books/commerce/cart-and-checkout#checkout-steps)) and the most common fee case regulators bring. The law is spread across several instruments, covered in depth elsewhere in the library:

- **The FTC's fees rule** (16 CFR Part 464, effective May 12, 2025) requires all-in prices for live-event tickets and short-term lodging only ([All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices)); for other retail, the FTC Act's ban on deception applies case by case.
- **State all-in pricing laws** (California's SB 478 from July 1, 2024, Minnesota's section 325D.44 and Colorado's HB25-1090 among them) ban advertising a price that leaves out mandatory fees, with industry-specific safe harbors ([Consumer Fees and All-In Prices](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices)).
- **Card surcharges** have their own network and state rules ([Surcharging & Fees](/books/payments/surcharging-and-fees)).

For a retail store the safe design is the strictest of these applied everywhere: every mandatory charge other than tax and carrier shipping (a "handling fee," a "service fee," a "regulatory fee," a "small order fee") is either in the item price or shown with the price before checkout, and shipping and tax are shown as soon as the address is known. The charge model already supports it: each `order_charges` row has a kind, and the display at each step is computed from charges by class, never typed ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it) stores what was shown in `price_displays`).

## Dark Patterns

The FTC's 2022 staff report, *Bringing Dark Patterns to Light*, grouped the practices it found into four kinds: "misleading consumers and disguising ads," "making it difficult to cancel subscriptions or charges," "burying key terms and junk fees," and "tricking consumers into sharing data." Each has a commerce form: a sponsored product styled as an editorial pick, a membership that cancels only by phone, a fee in the fine print, a pre-checked "share my data with partners" box.

The largest enforcement so far is against a retailer. On September 25, 2025 the FTC announced a settlement with Amazon over Prime: a $1 billion civil penalty and $1.5 billion in refunds to an estimated 35 million consumers, over allegations that Amazon "enrolled millions of consumers in Prime subscriptions without their consent" through "confusing and deceptive user interfaces" and "made it exceedingly hard for consumers to end their subscription." The order requires a clear button to decline Prime ("Amazon can no longer have a button that says, 'No, I don't want Free Shipping'"), clear disclosure of terms at enrollment, and a cancellation that "cannot be difficult, costly, or time-consuming and must be available using the same method that consumers used to sign up." The subscription side of the case belongs to [FTC v. Amazon (Prime)](/books/commerce/auto-renewal-law#ftc-v-amazon-prime) in Auto-Renewal & Cancellation Law; the checkout side is a rule for every store:

- **The decline is as easy as the accept.** An upsell at checkout (a membership, a protection plan, a subscription) offers a plainly labeled no, of the same size and weight, that doesn't insult the shopper or remove the benefit they came for.
- **Nothing is added that the shopper didn't add.** No pre-checked insurance, donation, membership trial or warranty in the cart; an add-on the shopper didn't choose is a charge they didn't authorize.
- **Urgency and scarcity are true.** A countdown timer resets nothing and a "3 left" badge reads the inventory, or neither appears; both are rendered from data and the data is the evidence.
- **Privacy choices are symmetric.** Accepting and rejecting tracking take the same effort; an asymmetric choice interface was one of the findings in California's case against Honda ([CCPA in Practice](/books/commerce/customers-and-accounts#ccpa-in-practice)).

The system test is that every interface element that changes money or consent is versioned and logged: which variant of the checkout, upsell or consent banner a shopper saw, so a regulator's question about a design is answered with what was shown, and an experiment that wins by confusing people is visible as such ([Experimentation](/docs/telemetry/experimentation)).

## Price Comparisons

"Was $80, now $49" is a factual claim about a former price. The FTC's guide says a former price is a legitimate basis for comparison if it is "the actual, bona fide price at which the article was offered to the public on a regular basis" for "a reasonably substantial period of time," and that it should be a price at which the product was "openly and actively offered for sale"; a "was" price set high for a week so the sale can be announced is not. Comparisons to other retailers' prices and to manufacturers' suggested prices have their own sections of the same guide (16 CFR 233.2 and 233.3). The data the claim rests on is price history per item and channel, which is the `price_history` in [Price History](/books/commerce/pricing#price-history); the storefront only renders `compare_at_price` when that history supports it.

## Made in USA

An unqualified "Made in USA" claim means the product is "all or virtually all" made in the United States: final assembly or processing in the US, and all significant parts and processing of US origin. Since August 2021 the FTC's Made in USA Labeling Rule (16 CFR Part 323) codifies the standard for labels and "any online or other mail order marketing materials that include a seal" or similar claim, and makes violations subject to civil penalties. A qualified claim ("Assembled in USA from imported parts," "60% U.S. content") is allowed when accurate, and the FTC cautions against qualified claims unless "the product has a significant amount of U.S. content or U.S. processing."

For a store the risk is the catalog: an origin attribute set once by a merchandiser and rendered as a flag badge on every variant, including the one now made elsewhere. Origin claims are product attributes with a basis (a supplier declaration, a bill of materials) and a review date, and they change with sourcing; [Product Information & Content](/books/commerce/product-information#attribute-models) owns attributes, and [Cross-Border Commerce](/books/commerce/cross-border-commerce#hs-codes-and-customs-data) owns country of origin for customs, which is a different legal test from the FTC's.

## Warranties

The Magnuson-Moss Warranty Act doesn't require a written warranty, but governs one once offered on a consumer product. The FTC's thresholds: a written warranty on a product costing more than $10 must be titled "full" or "limited"; on a product costing more than $15 its terms must be disclosed in a single, clear document and be available to read before purchase. What that means online:

- **Show the warranty before purchase.** The Pre-Sale Availability Rule's mail order provision requires catalogs and advertising to include the warranty or explain how to get it; for a store, the warranty text (or a clear link to it) belongs on the product page, near the price. Warrantors may post terms online if they also offer a non-internet way to get a free copy.
- **No tie-ins.** A warranty generally can't require the customer to use a particular brand of parts or service unless it is provided free or the FTC grants a waiver; "warranty void if not serviced by an authorized dealer" is the classic violation.
- **No disclaiming implied warranties.** A seller offering a written warranty can't disclaim implied warranties; a limited warranty may limit their duration to its own, a full warranty can't.
- **The seller's warranty versus the manufacturer's.** A retailer that adds its own protection plan or extended warranty is a warrantor (or a seller of a service contract, regulated differently by state), separate from the manufacturer; the product page says which is which.

In the EU the seller owes a **legal guarantee** whatever the warranty says: "a minimum 2-year guarantee from the moment you received the goods," and a defect appearing within the first year is presumed to have existed at delivery. A commercial warranty is extra and can't reduce it.

## The EU Right of Withdrawal

For distance sales to EU consumers, the Consumer Rights Directive (2011/83/EU) gives a right to withdraw for any reason within 14 days. Its working rules, which the UK kept in its Consumer Contracts Regulations:

- **The clock.** 14 days from delivery of the goods, from the last item when an order arrives in several deliveries; for services, from the contract. If the trader didn't inform the consumer of the right, the period extends by 12 months.
- **The refund.** Within 14 days of the withdrawal, including the standard delivery cost (not the extra for an express option the consumer chose), using the same payment method; the trader may wait until the goods come back or the consumer shows proof of sending them, and may deduct for diminished value from handling beyond what was needed to examine them.
- **The return.** The consumer sends the goods back within 14 days and pays the return cost if told so in advance; the trader pays when the goods are defective.
- **The exceptions.** Goods made to the consumer's specification or clearly personalized, perishable goods, sealed hygiene goods and sealed recordings or software once unsealed, and digital content once performance began with the consumer's consent, among others.
- **The withdrawal function.** Directive (EU) 2023/2673 adds a requirement, applying from June 19, 2026, that contracts concluded through an online interface offer a withdrawal function, labeled "withdraw from contract here" or equivalent, as easy to use as the purchase.

For a US store selling into the EU, the right is a returns policy it can't narrow: a "final sale" label doesn't remove it outside the exceptions, and a store that doesn't inform the shopper owes a year of it. [Returns & Exchanges](/books/commerce/returns-and-exchanges#return-policies-and-the-law) owns return policies; the record this chapter needs is the withdrawal itself, its date and the refund deadline it starts.

## How to Build It

Shipping promises turn checkout and catalog statements into clocks; delay notices record each consent asked for and given; warranty terms version what a product page showed:

```sql
CREATE TABLE shipping_promises (         -- what the shopper was told, per line
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id         UUID NOT NULL REFERENCES orders (id),
  order_line_id    UUID REFERENCES order_lines (id),   -- null: the whole order
  source           TEXT NOT NULL CHECK (source IN ('shipping_quote', 'product_page',
                     'preorder_date', 'rule_default_30', 'rule_credit_50')),
  shipping_quote_id UUID REFERENCES shipping_quotes (id),
  statement        TEXT NOT NULL,          -- as shown: 'Ships in 1-2 business days'
  ship_by          DATE NOT NULL,          -- the Mail Order Rule deadline it implies
  deliver_by       DATE,                   -- an arrival promise, if one was shown
  basis            JSONB NOT NULL,         -- stock, location, cutoff and transit used
  status           TEXT NOT NULL CHECK (status IN ('open', 'met', 'delayed', 'cancelled',
                     'missed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delay_notices (             -- each request to consent to a later date
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  shipping_promise_id UUID NOT NULL REFERENCES shipping_promises (id),
  kind               TEXT NOT NULL CHECK (kind IN ('first', 'renewed', 'indefinite')),
  revised_ship_by    DATE,                 -- null for an indefinite delay
  reason             TEXT,                 -- required for 'indefinite'
  sent_at            TIMESTAMPTZ NOT NULL,
  channel            TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'mail', 'phone')),
  message_ref        TEXT NOT NULL,        -- the message as sent
  response           TEXT CHECK (response IN ('consented', 'cancelled')),
  responded_at       TIMESTAMPTZ,
  silence_is_consent BOOLEAN NOT NULL,     -- true only for a first notice with a definite
                                           -- date within 30 days of the original
  CHECK (kind <> 'indefinite' OR revised_ship_by IS NULL),
  CHECK (kind = 'first' OR NOT silence_is_consent)
);

CREATE TABLE warranty_terms (            -- the warranty a product page showed, versioned
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  product_id     UUID REFERENCES products (id),  -- null: a store-wide warranty
  warrantor      TEXT NOT NULL CHECK (warrantor IN ('manufacturer', 'merchant',
                   'service_contract_provider')),
  designation    TEXT NOT NULL CHECK (designation IN ('full', 'limited', 'none')),
  duration       INTERVAL,
  version        INT NOT NULL,
  document_id    UUID NOT NULL REFERENCES documents (id),  -- the text as published
  public_url     TEXT NOT NULL,
  effective_during TSTZRANGE NOT NULL,
  UNIQUE (merchant_id, product_id, version)
);

ALTER TABLE order_lines
  ADD COLUMN warranty_terms_id UUID REFERENCES warranty_terms (id);  -- what applied at sale

-- Promises about to be broken with no notice sent: the job that sends first notices.
SELECT p.id, p.order_id, p.ship_by
FROM shipping_promises p
WHERE p.status = 'open'
  AND p.ship_by <= CURRENT_DATE + 2
  AND NOT EXISTS (SELECT 1 FROM delay_notices d WHERE d.shipping_promise_id = p.id);
```

Design notes:

- **Every promise gets a deadline.** A product page statement, a checkout quote, a preorder date or the rule's default each produce a `ship_by`; with no statement, the order gets the 30-day default (50 for credit), so no order is ever without a clock. The earliest open promise sets the operative `orders.ship_by` and `deliver_by` that [Order Management](/books/commerce/order-management#how-to-build-it) schedules against; `shipping_promises` keeps every statement behind them, and a consented delay moves `orders.ship_by` to the revised date. How the dates are computed is [Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises).
- **Shipped is the carrier scan, not the label.** The rule's "physically placed in the possession of the carrier" is `fulfillments.first_scan_at`, the carrier's first event ([Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#how-to-build-it)); a label created on day 29 and scanned on day 32 is a missed promise.
- **Silence is consent only once.** The check on `delay_notices` encodes the rule: a renewed or indefinite notice needs an explicit yes, and without one by the revised date the order is canceled and refunded.
- **Cancellation starts the refund clock.** A cancellation from a delay notice creates the refund or void with a due date seven working days out (one billing cycle for store credit), and the refund's timestamp is the evidence.
- **Warranties attach to the line.** `order_lines.warranty_terms_id` records which version applied at the sale, so a claim three years later is judged by the terms the customer bought under.
- **Emit events:** `shipping_promise.at_risk`, `delay_notice.sent`, `delay_notice.answered` and `shipping_promise.missed`, consumed by customer service, notifications and the order system.

## Auditing

- **Promises and their basis,** with the statement shown, the deadline it set and the stock and transit data behind it.
- **Delay notices as sent,** with responses, deemed consents and the cancellations and refunds that followed, with dates.
- **Every interface version** for checkout, upsells and consent, with which shoppers saw which.
- **Price history behind every comparison price,** origin claims with their basis, and warranty text by version.
- **Withdrawals and refunds** for EU and UK orders, with the dates that start and stop each clock.

## What This Means for the System You Build

- **Treat every shipping statement as a promise with a deadline,** computed from real stock, cutoffs and transit, and default to 30 days when none was stated.
- **Send delay notices before the deadline,** offer cancellation in the notice, and treat silence as consent only for a first notice with a definite date.
- **Refund canceled orders within seven working days,** or void the authorization.
- **Show every mandatory fee in the price or before checkout,** using the strictest state rule everywhere.
- **Make every decline as easy as every accept,** add nothing to a cart the shopper didn't add, and render urgency and scarcity only from true data.
- **Show a "was" price only when price history supports it.**
- **Store origin claims and warranties as versioned product data** with their basis, and show warranty terms before purchase.
- **Honor the EU's 14-day withdrawal and provide the withdrawal function** for EU and UK customers, and record the dates it starts.

## References

**US law and regulators**

- [FTC: Business Guide to the Mail, Internet, or Telephone Order Merchandise Rule](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule), reasonable basis, the 30 and 50 day defaults, delay notices, shipment, refunds and civil penalties
- [FTC: Businessperson's Guide to Federal Warranty Law](https://www.ftc.gov/business-guidance/resources/businesspersons-guide-federal-warranty-law), the $10 and $15 thresholds, pre-sale availability, tie-ins and implied warranties
- [FTC: Complying with the Made in USA Standard](https://www.ftc.gov/business-guidance/resources/complying-made-usa-standard), "all or virtually all," the 2021 Labeling Rule, online seals and qualified claims
- [Cornell LII: 16 CFR 233.1, Former price comparisons](https://www.law.cornell.edu/cfr/text/16/233.1), bona fide former prices offered openly and actively for a reasonably substantial period
- [Cornell LII: 16 CFR Part 233, Guides Against Deceptive Pricing](https://www.law.cornell.edu/cfr/text/16/part-233), the sections on retail and manufacturer-suggested price comparisons
- [FTC: Bringing Dark Patterns to Light (September 2022)](https://www.ftc.gov/reports/bringing-dark-patterns-light), the staff report
- [FTC: Report shows rise in sophisticated dark patterns](https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers), the four categories of practices
- [FTC: Historic $2.5 billion settlement against Amazon (September 25, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-secures-historic-25-billion-settlement-against-amazon), the penalty, refunds, allegations and required interface changes

**EU and UK law**

- [EUR-Lex: Directive 2011/83/EU on consumer rights, consolidated](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02011L0083-20220528), the withdrawal period, extension, refunds, returns and exceptions
- [EUR-Lex: Directive (EU) 2023/2673](https://eur-lex.europa.eu/eli/dir/2023/2673/oj/eng), the "withdraw from contract here" function, transposition by December 19, 2025 and application from June 19, 2026
- [Your Europe: Returns](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm), the 14 days from delivery, return costs and exceptions
- [Your Europe: Guarantees](https://europa.eu/youreurope/citizens/consumers/shopping/guarantees-returns/index_en.htm), the two-year legal guarantee and the one-year presumption
- [legislation.gov.uk: Consumer Contracts Regulations 2013, regulation 31](https://www.legislation.gov.uk/uksi/2013/3134/regulation/31), the 12-month extension when cancellation information isn't given
- [legislation.gov.uk: Consumer Contracts Regulations 2013, regulation 34](https://www.legislation.gov.uk/uksi/2013/3134/regulation/34), refunds within 14 days, delivery costs, payment method and diminished value
