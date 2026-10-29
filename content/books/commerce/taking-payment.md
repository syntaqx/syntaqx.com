+++
title = "Taking Payment in Commerce"
description = "Authorize at order and capture at shipment, split shipments and partial capture, expiring authorizations, order edits, wallets, BNPL and fraud guarantees."
category = "Commerce Industry"
order = 2312
part = "Storefront and Checkout"
tags = ["commerce", "payments", "authorization", "capture", "bnpl"]
+++

A store's payment problem is timing. The shopper pays when they order, but the goods leave days later, sometimes in pieces, sometimes not at all, and sometimes in a different quantity or at a different total than was ordered. A card payment is several events (authorization, capture, refund), and commerce spreads them across the life of the order: authorize at checkout, capture as the goods ship, release what never ships, refund what comes back. Every one of those events has a clock set by the card networks and the processor, and the order management system has to run inside them.

This chapter is the commerce twist on payments: capture policies and when each fits, split shipments and partial capture, what happens when an authorization expires before the goods ship, order edits that change the total, wallets and buy now, pay later at checkout, and fraud screening with chargeback guarantees. The rails themselves are the [Payments](/books/payments/card-payments) volume's: the five events of a card payment ([Five Events, Not One Payment](/books/payments/card-payments#five-events-not-one-payment)), the hold windows by brand and channel, saved cards ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)), disputes ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)) and fraud ([Fraud & Risk](/books/payments/fraud-and-risk)). The state machine is the playbook's [Payment States & Ledgers](/docs/payments/payment-states). The chapter extends `order_payments` and `fulfillments` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `capture_plans`.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Platform or provider | Capture options | Authorization window it applies | Partial and multiple capture |
| --- | --- | --- | --- |
| **Shopify Payments** | Automatically at checkout (the default), automatically when the order is fulfilled, or manually | "7 days for credit card payments"; after that the merchant "may be unable to collect payment" | Partial capture on any plan; multiple captures on Plus, per fulfillment, for Visa, Mastercard, Amex and Discover, with a transaction fee on each capture |
| **Stripe** | Automatic, or `capture_method=manual` with a later capture | Visa 7 days online customer-initiated and 5 days merchant-initiated; Mastercard, Amex and Discover 7 days online; extended authorization up to 30 days on interchange-plus pricing | `amount_to_capture` for one partial capture, releasing the rest; multicapture of "up to 50 non-final captures" plus a final one on interchange-plus pricing |
| **Adyen** | Automatic (default), delayed automatic, or manual | By scheme: Visa 10 days card-not-present cardholder-initiated, Mastercard 7 days final and 30 pre-authorization, Amex 7, Discover 10; Adyen expires authorizations after 28 days by default | One partial capture cancels the remainder; "multiple partial capture is disabled by default" and enabled through support |
| **Adobe Commerce** | Gateway set to authorize only (orders stay Pending until invoiced and captured) or authorize and capture (an invoice is generated at once) | The gateway's | The gateway's, through partial invoices |
| **commercetools Checkout** | Through the payment connector (Adyen, PayPal, Stripe) | The connector's provider | The provider's |

What the table shows: the platform default is usually to capture at checkout, because it is simplest and the money settles soonest. Capturing later is a setting, and only some combinations of plan, pricing and processor support capturing one authorization in pieces.

## Capture Policies

Four policies cover nearly every store, and the right one depends on how long goods take to leave and how often orders change:

| Policy | When the card is charged | Fits | Costs |
| --- | --- | --- | --- |
| **At checkout** | Immediately | Digital goods, in-stock goods that ship the same or next day, services sold online | Every cancellation or out-of-stock is a refund, not a void: processing fees usually aren't returned, and the customer waits for money back |
| **At fulfillment** | When the order (or each fulfillment) ships | Physical goods that ship within the authorization window | Captures must happen before the window closes; a split shipment needs multiple captures or a policy for the remainder |
| **Per shipment, with reauthorization** | Each shipment captures; a new authorization covers what ships after the window | Backorders, made-to-order goods, large orders shipping over weeks | A reauthorization can be declined, and is a merchant-initiated transaction on a stored credential |
| **Manual** | When staff capture it | High-value orders after a manual fraud review, custom quotes | Someone has to remember; uncaptured authorizations lapse |

The commerce default I use is **capture at fulfillment**. Charging when goods ship means a canceled or unshippable order is a void that releases the hold rather than a refund, the customer is charged for what they actually receive, and the order's financial status matches what happened. It needs the order system to know the authorization's deadline, which is the next section.

## Authorization Windows

An authorization is a hold that expires. The networks set the maximum and processors may set less: Visa allows 10 days for a card-not-present, customer-initiated authorization (in force since April 13, 2024, from Visa's published framework), Mastercard's rules are expressed as integrity fees after 7 days for a final authorization and 30 for a pre-authorization, and Stripe applies 7 days to the same Visa authorization that Visa allows 10. The full table is the Payments volume's ([Card Payments](/books/payments/card-payments#five-events-not-one-payment)), and the rule for the system is the playbook's: store the deadline as `capture_before` when the authorization succeeds, using the **shorter** of the network's and the processor's window ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)).

For a store, the window is a fulfillment constraint:

- **The warehouse needs to see it.** An order whose authorization expires in two days should be picked before one that has a week; the order management system's release and sourcing rules ([Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)) read `capture_before`.
- **Alert before the deadline, not after.** A job lists fulfillments not yet shipped whose authorization expires within a day, so someone ships, captures early, reauthorizes or cancels.
- **Extended authorizations are narrow.** Stripe's extended authorization holds up to 30 days, but only on interchange-plus pricing and, for Visa, in lodging, rental and cruise categories or others at "an additional 0.08% fee"; it is a tool for those categories, not a general fix for slow fulfillment.
- **Non-card methods have their own windows.** Stripe lists Affirm at 30 days to capture, Afterpay at 13, Klarna "by midnight of the 28th calendar day," PayPal at 10 days extended automatically to 20, and Cash App Pay at 7. The window belongs to the payment method on the order, not to the store.

## Split Shipments and Partial Capture

A split shipment is the normal case for a multi-warehouse store: two lines in stock at one warehouse, one backordered at another, three fulfillments in the core model and possibly four shipments. The payment should follow the goods, and how depends on what the processor supports:

- **Multiple captures on one authorization.** Where supported (Shopify Payments on Plus, Stripe multicapture, Adyen with multiple partial capture enabled), each fulfillment captures its share and the last capture is marked final, releasing whatever remains. Visa permits it for card-absent merchants that disclose the possibility and notify the cardholder of each shipment ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)); Stripe notes that most networks restrict multicapture to card-not-present sales of goods that ship separately.
- **One partial capture, then a new authorization.** Where only one capture is allowed, the first shipment captures its amount (which releases the rest: on Stripe, "a partial capture automatically releases the remaining amount"; on Adyen, a single partial capture cancels the remainder), and later shipments need a new authorization against the saved payment method.
- **Capture everything at the first shipment.** Simple and common, and it charges the customer for goods not yet sent; it suits orders whose remaining lines ship within days, and it turns any later cancellation of those lines into a refund.

What the amounts must be:

- **Each capture is the shipped lines plus their share of charges.** The line amounts, the tax on those lines, and shipping by whatever rule the merchant states (all on the first shipment, or prorated); the allocation is the same one a partial refund uses, so it is computed from `order_lines` and `order_charges`, never typed ([One Rule for All of Them](/books/commerce/commerce-business#one-rule-for-all-of-them)).
- **The sum of captures never exceeds the authorization** except within the network's tolerance (Visa tolerates up to 15% over for card-absent purchases the cardholder started; Stripe's overcapture exposes this on interchange-plus pricing).
- **Lines that never ship release, not refund.** When the last fulfillment ships or a line is canceled, the final capture or a reversal releases the unused hold. Visa requires the unused difference reversed within 24 hours of completing the transaction ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)).

## When the Window Runs Out

Some goods can't ship inside any authorization window: preorders, backorders of weeks, made-to-order furniture. The options, in the order I'd use them:

1. **Say so at checkout and authorize later.** For a preorder, take the payment method at checkout as a saved credential with the shopper's consent, and authorize when the goods are ready; the first transaction establishes the credential and the later one is merchant-initiated ([The First Transaction Carries the Rest](/books/payments/stored-credentials#the-first-transaction-carries-the-rest)).
2. **Reauthorize before the window closes.** Place a new authorization for the remaining amount against the saved credential and void the old one; a reauthorization can be declined, so the order needs a path for that (notify, retry within the rules, cancel the line) ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying)).
3. **Capture at checkout and disclose it.** The shopper is charged now for goods later; it is simplest and means every cancellation is a refund, and the shipping promise rules still apply to the delay ([Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule)).

What not to do is let the authorization lapse and try to capture anyway: the processor declines, the goods may already be in the carrier's hands, and the customer was never charged.

## Order Edits and Changing Totals

Orders change after checkout: a line is canceled, an item is swapped for a pricier variant, an address change moves the tax, a customer service agent adds an item. The payment can follow down but not up:

- **Lower totals are easy.** Capture less, or release part of the hold; nothing is charged that wasn't shipped.
- **Higher totals need new money.** Shopify says it plainly: the merchant can't capture more than was authorized, and should edit the order and send the customer an invoice for the difference. The alternatives are a second authorization on the saved card (with consent for the new amount) or an incremental authorization, which Stripe offers on interchange-plus pricing for Visa, Mastercard and Amex in all categories, up to 10 attempts per payment, and which doesn't "extend the validity period."
- **Record why the total changed.** An order edit is a record with the old and new lines and the payment action it caused; [Edits and Cancellations](/books/commerce/order-management#edits-and-cancellations) owns `order_edits`.

## Wallets

Apple Pay, Google Pay and Shop Pay at checkout are, for capture purposes, cards: the wallet returns a network token that authorizes and captures like any card, under the same windows and split-capture rules ([Wallets Are Cards in Disguise](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise)). PayPal, Amazon Pay and Link have their own capture rules and windows. The checkout side (merchant validation, address changes in the sheet) is [Accelerated Checkouts](/books/commerce/cart-and-checkout#accelerated-checkouts). The commerce consequence is that `order_payments` records the method as well as the amount, because the capture deadline and the refund path depend on it.

## BNPL at Checkout

Buy now, pay later at checkout splits the purchase into installments financed by a lender (Affirm, Klarna, Afterpay, PayPal Pay Later), while the merchant is paid in full, less a fee, and the lender carries the credit risk. The Payments volume covers the model ([Buy Now, Pay Later](/books/payments/wallets-and-local-methods#buy-now-pay-later)); for the store:

- **It has an authorization and a capture.** Affirm's default authorization window is 30 days, with split captures allowed inside it and uncaptured amounts "refunded to the customer's loan" after it; Klarna's standard authorization is 28 days, configurable up to 180 at onboarding and extendable from the extension date within 180 days of the order. Capture at fulfillment works the same way as for cards, on the lender's clock.
- **Fees are higher than cards and not always returned.** Square publishes Afterpay at 6% + 30¢. Shop Pay Installments, financed by Affirm, is limited to orders of $35 to $30,000 in the US (and set ranges in Canada, the UK and Australia), requires Shopify Payments, pays the merchant one to three business days after capture, and doesn't return its fee on a refund.
- **The regulatory status moved.** In May 2024 the CFPB interpreted pay-in-four lenders as card issuers under Regulation Z, with dispute and refund rights; on May 12, 2025 it "withdrew several guidance documents, including the 2024 BNPL Interpretive Rule." Refund and dispute handling is therefore each lender's terms plus general law, and a merchant refunds through the lender, never in cash.
- **Refunds go back through the lender,** which adjusts the shopper's loan; a partial return reduces the installments, and the merchant's ledger records a refund against the BNPL payment like any other.

## Fraud Screening and Chargeback Guarantees

Card-not-present fraud is screened between authorization and capture, which is one more reason to capture at fulfillment: an order flagged after authorization can be voided before anything ships. The models, signals and decisions are the Payments volume's ([Rules, Models and Decisions](/books/payments/fraud-and-risk#rules-models-and-decisions)); the commerce product is the **chargeback guarantee**, where a vendor decides approve or decline and pays the fraud chargebacks on orders it approved:

- **Signifyd** says approved orders "are backed by a 100% financial guarantee," with reimbursement within 48 hours; it "charges a percentage of the order total when an order is approved," with no fee on orders it declines for fraud and custom rates.
- **Forter** "will contractually guarantee the performance of your approval and chargeback rates," with covered and uncovered agreements.
- **Riskified** sells the same category of guarantee (the later Commerce Fraud & Abuse chapter compares vendors).
- **Shopify Protect** is the platform's own version, free, covering "fraudulent and unrecognized chargebacks" on eligible orders: Shop Pay orders (including Shop Pay on Facebook, Instagram and Google, but not Shop Pay Installments), physical goods shipped by a US business with a US Shopify Payments account, fulfilled within 7 days and in transit with tracking within 10; digital goods, pickup, changed shipping addresses and subscription renewals are excluded.

What the guarantee changes in the system:

- **The vendor's decision is a record.** Approve, decline or review, with the vendor's reference, stored on the order before capture; a guaranteed order whose chargeback arrives later is a claim against the vendor, filed with that reference.
- **Its conditions become order rules.** Guarantees have conditions (ship to the screened address, within the time window, with tracking); an address change after screening voids the guarantee, so the order system must re-screen or flag it.
- **Guarantees cover fraud, not disputes.** "Item not received" and "not as described" chargebacks are the merchant's to win with tracking and descriptions ([Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)); Visa's Compelling Evidence 3.0 lets a merchant answer a fraud dispute (condition 10.4) with two prior undisputed transactions from the same payment method 120 to 365 days earlier that match on IP address, device or account details, which is why order records keep those signals.

## How to Build It

A capture plan is the order's payment schedule against its authorizations: the policy, the authorization it draws on, the deadline, and the captures that have run. Each capture points at the fulfillment that triggered it:

```sql
ALTER TABLE order_payments
  ADD COLUMN method          TEXT NOT NULL DEFAULT 'card' CHECK (method IN ('card', 'wallet',
                               'paypal', 'bnpl', 'bank', 'gift_card', 'store_credit')),
  ADD COLUMN parent_id       UUID REFERENCES order_payments (id),  -- a capture's or refund's authorization
  ADD COLUMN fulfillment_id  UUID REFERENCES fulfillments (id),    -- the shipment a capture paid for
  ADD COLUMN capture_before  TIMESTAMPTZ,   -- on authorizations: the shorter of network and processor
  ADD COLUMN is_final        BOOLEAN NOT NULL DEFAULT FALSE,       -- final capture releases the rest
  ADD COLUMN status          TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('pending',
                               'succeeded', 'failed', 'expired', 'voided'));

CREATE TABLE capture_plans (             -- how and when an order's money is taken
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id           UUID NOT NULL UNIQUE REFERENCES orders (id),
  policy             TEXT NOT NULL CHECK (policy IN ('at_checkout', 'at_fulfillment',
                       'per_shipment_reauthorize', 'manual', 'deferred_authorization')),
  multicapture       BOOLEAN NOT NULL,   -- whether the processor allows several captures
  shipping_allocation TEXT NOT NULL CHECK (shipping_allocation IN ('first_capture',
                       'prorated')),
  fraud_decision     TEXT CHECK (fraud_decision IN ('approved', 'declined', 'review')),
  fraud_vendor_ref   TEXT,               -- the guarantee's case ID
  guaranteed_ship_to JSONB,              -- the address the guarantee was granted for
  status             TEXT NOT NULL CHECK (status IN ('open', 'partially_captured',
                       'captured', 'released', 'expired', 'cancelled')),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capturable now, per authorization: authorized less captured less released, never stored.
CREATE VIEW authorization_balances AS
SELECT a.id AS authorization_id, a.order_id, a.capture_before, a.amount AS authorized,
       COALESCE(SUM(c.amount) FILTER (WHERE c.kind = 'capture' AND c.status = 'succeeded'), 0)
         AS captured,
       BOOL_OR(c.is_final) AS closed
FROM order_payments a
LEFT JOIN order_payments c ON c.parent_id = a.id
WHERE a.kind = 'authorization' AND a.status = 'succeeded'
GROUP BY a.id, a.order_id, a.capture_before, a.amount;

-- Unshipped fulfillments whose authorization runs out within a day.
SELECT f.id AS fulfillment_id, b.authorization_id, b.capture_before
FROM fulfillments f
JOIN authorization_balances b ON b.order_id = f.order_id
WHERE f.status IN ('pending', 'assigned')
  AND NOT COALESCE(b.closed, FALSE)
  AND b.capture_before < NOW() + INTERVAL '1 day';
```

Design notes:

- **Capturable is derived.** `authorization_balances` computes what can still be captured from the authorization and its children; storing a "remaining" number that someone updates is how double captures and lost releases happen ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **The capture belongs to a shipment.** `fulfillment_id` on each capture is what lets a support agent answer "what was I charged for?", what lets a partial refund reverse the right capture, and what reconciles the processor's settlement lines to shipments.
- **Capture on the shipment event, idempotently.** `shipment.shipped` triggers the capture with a key derived from the fulfillment, so a replayed event never captures twice ([Idempotency](/docs/payments/idempotency)).
- **The guarantee's address is stored.** Comparing the fulfillment's `dropoff` with `guaranteed_ship_to` before shipping catches the address change that voids a chargeback guarantee.
- **Expiry is a state, set by a job.** Authorizations past `capture_before` move to `expired`, so the plan's status reflects reality and the fulfillment queue stops assuming money that isn't there.
- **Emit events:** `payment.authorized`, `payment.captured`, `payment.released`, `payment.authorization_expiring` and `payment.reauthorization_failed`, consumed by the order system, notifications and accounting.

## Auditing

- **Every authorization, capture, release and refund,** with its parent, its fulfillment, its method and the processor's reference, append-only.
- **Capture plans and their changes,** including who switched an order to manual capture and why.
- **Fraud decisions before capture,** with the vendor's reference and the address it covered, for guarantee claims.
- **Expired and reauthorized holds,** so a customer charged twice for one order (an old hold not yet released and a new authorization) can be shown the release.

## What This Means for the System You Build

- **Capture at fulfillment by default,** and at checkout only for goods that leave at once.
- **Store `capture_before` as the shorter of the network's and processor's windows,** and make it visible to the fulfillment queue.
- **Let the payment follow the goods:** a capture per fulfillment where multicapture is supported, a reauthorization where it isn't, and a final capture or reversal that releases the rest.
- **Allocate each capture from lines and charges** with the same rule a partial refund uses.
- **Plan for goods that can't ship in the window:** save the credential and authorize later, or reauthorize before expiry, never capture an expired hold.
- **Handle higher totals with new authorizations or invoices,** never by capturing more than the hold allows.
- **Treat BNPL as a payment method with its own clock and fee,** refunded through the lender.
- **Screen before capture, store the guarantee's decision and address,** and re-screen when the address changes.

## References

**Platform and provider documentation**

- [Shopify Help Center: Capturing payments](https://help.shopify.com/en/manual/fulfillment/managing-orders/payments/capturing-payments), capture options, the 7-day period, partial capture, no capture above the authorization, and multiple captures on Plus
- [Shopify Help Center: Shop Pay Installments](https://help.shopify.com/en/manual/payments/shop-pay-installments), order limits by country and requirements
- [Shopify Help Center: Shop Pay Installments FAQ](https://help.shopify.com/en/manual/payments/shop-pay-installments/faq), Affirm collecting installments, payout timing and fees on refunds
- [Shopify Help Center: Shopify Protect](https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect), free coverage of fraudulent and unrecognized chargebacks
- [Shopify Help Center: Protecting orders with Shopify Protect](https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect), eligibility, fulfillment and tracking windows and exclusions
- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), manual capture, windows by brand and method, and partial capture releasing the remainder
- [Stripe: Extended authorizations](https://docs.stripe.com/payments/extended-authorization.md?platform=web&ui=elements), up to 30 days, categories and the Visa fee
- [Stripe: Multicapture](https://docs.stripe.com/payments/multicapture.md?platform=web&ui=elements), up to 50 non-final captures and supported brands
- [Stripe: Overcapture](https://docs.stripe.com/payments/overcapture.md?platform=web&ui=elements), capture above the authorization by category
- [Stripe: Incremental authorization](https://docs.stripe.com/payments/incremental-authorization.md?platform=web&ui=elements), brands, attempt limits and no extension of validity
- [Stripe: Visa Compelling Evidence 3.0](https://docs.stripe.com/disputes/api/visa-ce3), condition 10.4, prior transactions and matching elements
- [Stripe Support: Visa Compelling Evidence 3.0](https://support.stripe.com/questions/how-does-stripe-support-visa-compelling-evidence-3-0), the 120 to 365 day window
- [Adyen: Capture](https://docs.adyen.com/online-payments/capture), capture modes, partial capture and multiple partial capture disabled by default
- [Adyen: Adjust authorization](https://docs.adyen.com/online-payments/adjust-authorisation), validity by scheme and the 28-day default expiry
- [Adobe Commerce: Order processing](https://experienceleague.adobe.com/en/docs/commerce-admin/stores-sales/order-management/orders/order-processing), authorize-only and authorize-and-capture orders and invoices
- [commercetools: Checkout overview](https://docs.commercetools.com/checkout/overview), payment connectors
- [Affirm: Split capture](https://docs.affirm.com/developers/docs/split-capture-transactions), the 30-day authorization window and split captures
- [Klarna: Extended authorization expiration](https://docs.klarna.com/acquirer/klarna/web-payments/additional-resources/use-cases/extended-authorization-expiration/), 28 days standard and up to 180
- [Square: Our fees](https://squareup.com/us/en/payments/our-fees), the Afterpay rate
- [Signifyd: Guaranteed Fraud Protection](https://signifyd.com/guaranteed-fraud-protection), the guarantee and 48-hour reimbursement
- [Signifyd: Pricing](https://www.signifyd.com/pricing/), a percentage of approved order totals
- [Forter: Forter vs fraud vendors](https://www.forter.com/competitors/forter-vs-fraud-vendors/), contractual guarantees of approval and chargeback rates

**Network rules**

- [Visa: Authorization framework will be updated to simplify authorization processing time frames](https://usa.visa.com/content/dam/VCOM/regional/na/us/support-legal/documents/authorization-framework-will-be-updated-to-simplify-authorization-processing-time-frames.pdf), the April 13, 2024 framework and the 10-day card-not-present window

**Regulators**

- [CFPB: Action on buy now, pay later loans (May 22, 2024)](https://www.consumerfinance.gov/archive/newsroom/cfpb-takes-action-to-ensure-consumers-can-dispute-charges-and-obtain-refunds-on-buy-now-pay-later-loans/), the interpretive rule treating BNPL lenders as card providers
- [CFPB: Buy now, pay later products](https://www.consumerfinance.gov/compliance/compliance-resources/consumer-cards-resources/buy-now-pay-later-bnpl-products/), the May 12, 2025 withdrawal
