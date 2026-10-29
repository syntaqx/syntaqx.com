+++
title = "Cart & Checkout"
description = "The cart model and its persistence, checkout steps, guest checkout, address validation, shipping options, wallets, checkout extensions and abandoned carts."
category = "Commerce Industry"
order = 2311
part = "Storefront and Checkout"
tags = ["commerce", "cart", "checkout", "conversion", "wallets"]
+++

The cart is a list of intentions and the checkout is a negotiation that ends in a contract. A shopper adds lines at the prices the page showed; the checkout then establishes who they are, where it goes, how fast, what tax applies, which promotions hold and how they pay, and each step can change the total. When it ends, one order exists exactly once, the card is authorized for exactly that total, and the shopper has seen every amount they agreed to. Everything before that moment is provisional and everything after it is a record.

This chapter covers the cart model and how carts persist and merge, the checkout's steps and what research says about where shoppers leave, guest checkout, address validation, shipping options, accelerated checkouts (Shop Pay, Apple Pay, Google Pay, PayPal, Link, Amazon Pay), how platforms let merchants extend a checkout they host, placing the order exactly once, and abandoned checkout recovery. The card authorization itself and when to capture it are [Taking Payment in Commerce](/books/commerce/taking-payment); tax at checkout is [Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties); the customer record and marketing consent are [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts); fee disclosure and shipping promises are [Consumer Protection Online](/books/commerce/online-consumer-protection). The Payments volume's [Checkout & Invoicing](/books/payments/checkout-and-invoicing) covers payment pages and links generally. The chapter extends `carts`, `cart_lines` and `orders` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `checkouts` and `shipping_quotes`.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Platform | Cart object | Checkout | How merchants extend it |
| --- | --- | --- | --- |
| **Shopify** | Storefront API `Cart`: lines, buyer identity, up to 20 delivery addresses, a `checkoutUrl`; abandoned carts "expire within 30 days of creation," and the cart is deleted when checkout completes | Shopify-hosted; one-page checkout the default since October 2023 | Checkout UI extensions (on the information, shipping and payment steps for Plus stores only), Shopify Functions for discounts, delivery and payment customization, cart transforms and validation; web pixels for analytics |
| **Commerce.com (BigCommerce)** | Storefront cart, by API or the theme | Platform-hosted, optionally replaced by a custom build | The Checkout SDK, "a JavaScript library of methods for performing actions related to checkout," with the open-source React checkout as the starting point |
| **commercetools** | Carts API | commercetools Checkout, "an out-of-the-box checkout solution," in Complete Checkout or Payment Only mode; or the merchant's own on the Carts and Orders APIs | Payment connectors (Adyen, PayPal, Stripe) through Connect; at least one is required |
| **Adobe Commerce** | Quote (the cart) | Built into the storefront | Modules and plugins in the merchant's code |
| **Medusa** | Cart, completed into an order through the store API | The storefront's own pages | Workflows and modules in the merchant's code |
| **Saleor** | No separate cart: the `Checkout` object is the cart | The storefront's own pages calling checkout mutations; completion "may" process payments and reserve stock, then creates the order | Webhooks and apps |

Two patterns matter more than the differences:

- **Hosted platforms keep the checkout and open slots in it.** Shopify, Commerce.com and commercetools each sell a checkout they run and let merchants extend it at defined points, because a checkout the platform runs is one the platform can keep fast, secure and inside its PCI scope ([PCI DSS Scope](/books/commerce/choosing-a-platform#pci-dss-scope)).
- **Open-source platforms give you the primitives.** Medusa and Saleor provide cart, shipping, tax and payment operations and leave the pages to the storefront; the merchant owns the user experience and the state machine between steps.

## The Cart Model

The core model's `carts` and `cart_lines` already hold the essentials: a cart at a selling location, for a customer or a guest, in a currency, with lines at the price shown. The rules around them:

- **A cart is identified before the shopper is.** A guest's cart is keyed by an opaque token in a cookie or app storage, never by anything the shopper typed; it gains a `customer_id` when they sign in. Shopify's `Cart.buyerIdentity` carries who the buyer is and, since API version 2024-07, their authentication through to checkout.
- **Carts expire, and expiry is policy.** Shopify's Storefront API carts expire within 30 days of creation; a merchant running its own cart picks a lifetime, records `expires_at`, and enforces it on read ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)).
- **Carts merge on sign-in.** A shopper with an account cart from last week who builds a guest cart today and then signs in has two carts. The usual rule is to merge the guest cart's lines into the account's open cart, summing quantities for the same item, and mark the guest cart `merged`; commercetools assigns "all Orders and Carts belonging to the anonymousId" to the customer when an anonymous shopper signs up. Whatever the rule, record which cart absorbed which.
- **The cart doesn't hold stock.** On Shopify, units become committed "when an order is placed," and carts aren't an inventory state; Saleor reserves stock, if at all, at checkout completion. Holding inventory for every open cart would let abandoned carts empty the shelf; when and how long to reserve is [Reservations](/books/commerce/inventory#reservations) in the Inventory chapter. The exception is a limited release, where a short, explicit hold at checkout is the product ([Limited Drops and Inventory Fairness](/books/commerce/peak-season#limited-drops-and-inventory-fairness), and [Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)).
- **Prices are rechecked, not trusted.** `cart_lines.unit_price` is what the page showed. The cart reprices from the price list when a line is added and when checkout starts, and shows the shopper any change; a stale cached page can mislead, never undercharge ([Caching Catalog Pages](/books/commerce/storefronts#caching-catalog-pages)).
- **Promotions are evaluated on the cart, applied at checkout.** Automatic discounts and codes are computed against the whole cart and its customer, and recomputed whenever a line, the address or the customer changes; the later Promotions, Discounts & Gift Cards chapter owns the engine.

## Checkout Steps

Every checkout collects the same things, in roughly this order, whether on one page or several: contact (email or phone, the key to the receipt and to recovery), the shipping address or a pickup location, a shipping option, payment and billing address, and a final total to confirm. Shopify made one-page checkout its default in October 2023; others keep steps. The order matters less than two rules: **show the full total as early as you can**, and **ask only for what fulfillment, tax and payment need.**

Baymard Institute's public research quantifies both. Its average documented cart abandonment rate, across 50 studies from 2006 to 2025, is 70.22%. In its survey of US shoppers, 42% said they were "just browsing" or not ready to buy; of the rest, the reasons for abandoning during checkout were:

| Reason | Share |
| --- | --- |
| Extra costs too high (shipping, tax, fees) | 40% |
| Delivery was too slow | 20% |
| Didn't trust the site with card information | 19% |
| The site wanted me to create an account | 18% |
| Too long or complicated checkout process | 17% |
| Website had errors or crashed | 17% |
| Returns policy wasn't satisfactory | 13% |
| Couldn't see or calculate the total cost up front | 12% |
| Credit card was declined | 10% |
| Not enough payment methods | 9% |

Most of the table is system behavior, not design taste: costs that appear late (taxes, fees and shipping computed only at the last step), a forced account, errors, declines and missing payment methods. Baymard estimates that a large site could gain "a 35.26% increase in conversion rate" from checkout design improvements alone. On length, its benchmark puts the average US checkout at 23.48 form elements (14.88 fields) against an ideal of 12 to 14 elements (7 to 8 fields); a separate Baymard count found "the average in 2024 was 11.3 form fields" and that "most sites need only 8." The two counts measure different things and agree on the point: most checkouts ask for more than they use.

My rules for the steps:

- **Email first,** because it identifies the shopper for recognition by wallets, ties a guest's orders together and makes recovery possible; then the address, because shipping and tax depend on it.
- **Recompute on every change** of address, shipping option, line or code, and show the new total immediately: tax, shipping and fees come from the address, and a total that changes after "Place order" is a support ticket and, for fees, a legal problem ([Fees and Drip Pricing](/books/commerce/online-consumer-protection#fees-and-drip-pricing)).
- **One billing address question:** "same as shipping" checked by default.
- **Never lose what was typed.** A failed payment returns to the payment step with everything else intact ([Never Lose Work](/docs/frontend/forms#never-lose-work)).

## Guest Checkout

Requiring an account loses the 18% in Baymard's table, and Baymard's 2025 checkout benchmark found that "62% of sites fail to make 'Guest Checkout' the most prominent option." The default for consumer stores is guest checkout first, with an account offered after the order (a password or a passkey set on the confirmation page, or a passwordless account the platform creates from the email). Shopify's newer customer accounts take this route: a one-time code sent to the email, no password ([Accounts and Guests](/books/commerce/customers-and-accounts#accounts-and-guests)).

A guest is still a customer record. The order carries the email, and the next order from the same email should find the same customer, which is the identity problem [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#identity-and-merge) covers. B2B checkouts are the exception: a company buyer signs in because the price list, payment terms and approval rules hang off the company account (the later B2B Commerce chapter).

## Address Validation

A wrong address costs a reshipment, a carrier correction fee and a customer. Validation at checkout catches most of it, and the playbook's [Addresses](/docs/fundamentals/addresses) covers capture, standardization and what you may store; the commerce specifics:

- **Autocomplete first, validation second.** Shopify's checkout autocompletes addresses by default for all merchants, from "services such as Google Autocomplete," in 23 countries and regions, and suggests a correction only "when there is high confidence," in 20. Plus stores can swap in a third-party autocomplete app.
- **The US postal source moved.** USPS retired its Web Tools API platform on January 25, 2026; address validation against USPS data now goes through the APIs in its developer catalog. Google's Address Validation API standardizes and geocodes addresses and offers USPS CASS processing for US and Puerto Rico addresses when enabled.
- **Suggest, don't overwrite.** Show the standardized address and let the shopper keep theirs; rural routes, new construction and military addresses fail validators that are right about most of the country ([Addresses No Vendor Knows](/docs/fundamentals/addresses#addresses-no-vendor-knows)).
- **Validate before tax and shipping,** because both are computed from the address, and a corrected ZIP code can move the order into a different tax jurisdiction.
- **Snapshot what shipped.** The order's ship-to is a snapshot on the fulfillment (`fulfillments.dropoff`), with the validator's verdict, because "I typed it correctly" is a common claim on a lost parcel.

## Shipping Options

The shipping step turns the cart, the address and the merchant's rules into a short menu: a few options with a price and a promise each, plus pickup where the merchant has stores. Behind each option is a rate (a carrier's rate for the parcel's weight, size and zone, a flat rate, or free above a threshold), a promise (an arrival date or range computed from the shipping location's cutoff, handling time and the carrier's transit time), and a method (ship, local delivery, pickup in store). Carrier rates, rate shopping and how a promised date is computed are [Shipping & Carriers](/books/commerce/shipping-and-carriers#delivery-promises); pickup and ship-from-store are the later Omnichannel Fulfillment chapter; free-shipping thresholds are promotions.

What the checkout must do with them:

- **Quote, store, then honor.** Each option shown is a `shipping_quotes` row with its price, promise and expiry; the selected quote is what the order is charged and what the merchant has promised. A shipping charge recomputed at fulfillment, after the shopper agreed to the quoted one, is an error.
- **Treat the promise as a representation.** "Arrives by Friday" is a shipping statement under the FTC's Mail Order Rule, and the merchant needs "a reasonable basis" for it ([Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule)). Promise only what the fulfillment location's cutoffs and the carrier's transit times support.
- **Show delivery speed early.** "Delivery was too slow" is the second-largest reason in Baymard's table; a product page that shows an estimated arrival lets a shopper decide before checkout, not during it.

## Accelerated Checkouts

An accelerated checkout lets a returning shopper skip the forms: a wallet or a network supplies the email, the shipping address and a payment credential in one sheet. Each is a payment method underneath (most are cards in disguise, [Wallets Are Cards in Disguise](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise)), but each also changes the checkout flow:

| Method | What it supplies | Requirements for the merchant, as of October 2026 |
| --- | --- | --- |
| **Shop Pay** | Saved email, payment, shipping and billing details across Shopify stores | Included with Shopify Payments; Shop Pay Installments adds pay-over-time from $35 to $30,000 in the US ([BNPL at Checkout](/books/commerce/taking-payment#bnpl-at-checkout)) |
| **Apple Pay** | Card token, shipping contact and address from the wallet | A merchant session requested by the merchant's server ("Never send the request for a merchant session from the client"); each session is single-use and "expires five minutes after it is created"; the domain registered with the payment provider |
| **Google Pay** | A card credential, encrypted for a gateway or the merchant | `PAYMENT_GATEWAY` tokenization for a supported processor; `DIRECT` decryption on the merchant's servers requires PCI DSS validation by a Qualified Security Assessor |
| **PayPal (and Fastlane)** | PayPal balance, cards or pay-later; Fastlane recognizes a guest by email and fills their saved details | Fastlane links "a customer's email address to their payment methods and details" to speed up guest checkout |
| **Link (Stripe)** | Saved cards and addresses, recognized by email, phone or browser cookie, confirmed by a one-time code | Through Stripe's Express Checkout Element or Payment Element; domains registered in test and live mode |
| **Amazon Pay** | Amazon account's address and payment | A checkout session that is Open, Completed or Canceled, canceled automatically after 24 hours open |

Stripe's Express Checkout Element shows several of these as buttons (Link, Apple Pay, Google Pay, PayPal, Klarna, Amazon Pay) from one integration, which is how most custom checkouts offer them.

Three consequences for the system:

- **The wallet sheet changes the address after you priced it.** When the shopper picks a different address in the Apple Pay or Google Pay sheet, the checkout receives an address-changed event and must recompute shipping options and tax before the sheet confirms; a total computed for the old address and charged for the new one is wrong tax.
- **Buttons appear before the checkout.** Express buttons on the product page or cart start a checkout that skips the storefront's steps entirely, so every rule the checkout enforces (age-restricted items, shipping eligibility, quantity limits) must run on the server when the wallet returns, not in the page.
- **Recognition is not an account.** A wallet or network that recognizes the shopper by email gives the merchant an email and an address; it doesn't sign them into the merchant's account or give them the merchant's account features.

## Extending a Hosted Checkout

Hosted checkouts used to be extended by editing their templates; they are now extended through defined slots, and the migration has a public history. On Shopify, `checkout.liquid` became unsupported for the information, shipping and payment steps first, and it and "additional scripts" were "sunset for the Thank you and Order status pages on August 28, 2025"; script tags on those pages were sunset for Plus stores on August 28, 2025 and "for non-Plus stores on August 26, 2026." Shopify Scripts, the Ruby customizations for discounts, shipping and payments, stopped publishing on April 15, 2026 and "cease[d] to execute entirely" on June 30, 2026.

What replaced them is the general shape of checkout extensibility on any platform:

- **UI extensions** render in named targets (a block below the shipping options, a field after the contact step) inside the platform's checkout, in a sandbox, with only the data the platform passes them. Shopify limits extensions on the information, shipping and payment steps to Plus stores; thank-you page targets are open to all plans.
- **Functions** run the merchant's logic inside the platform's checkout at defined points: Shopify Functions cover discounts, cart transforms (bundles), delivery customization (rename, hide or reorder options), payment customization, fulfillment constraints, order routing and cart and checkout validation. Functions from public App Store apps run on any plan; custom apps with functions are Plus-only.
- **Pixels** observe checkout events for analytics without touching the page: Shopify's app pixels run in a `strict` sandbox (a web worker with no DOM) and merchants' custom pixels in a `lax` iframe sandbox.

The design principle is worth copying when you build your own checkout: third-party code reads events and returns decisions; it never gets the payment page's DOM. That is what keeps a checkout off the attack surface the PCI DSS script requirements were written for ([PCI DSS Scope](/books/commerce/choosing-a-platform#pci-dss-scope); [Store Security & PCI](/books/commerce/store-security-and-pci)).

## Placing the Order Exactly Once

"Place order" is the moment a provisional checkout becomes an order and a payment. Every failure here is costly: a double click that creates two orders, a timeout after the card was authorized but before the order was written, an order created for a card that was declined. The general tools are the playbook's ([Idempotency](/docs/payments/idempotency), [Double Submits](/docs/frontend/forms#double-submits)); the commerce sequence:

1. **Freeze the checkout.** Recompute every line, charge and the tax one last time, and lock the checkout's version; the total about to be authorized is the total of these rows.
2. **Reserve or check stock** for the lines (on platforms that commit at order, this is the moment), failing the checkout cleanly if something sold out.
3. **Authorize the payment** with the checkout's idempotency key, so a retried request returns the first result instead of a second authorization ([Taking Payment in Commerce](/books/commerce/taking-payment)).
4. **Create the order** with the same key (`orders.idempotency_key` is unique), copying line snapshots, charges, the selected shipping quote and the tax calculation, and point the checkout at it.
5. **Emit `order.placed`** through the outbox, and only then show the confirmation.

If step 4 fails after step 3 succeeded, the system must either finish creating the order on retry or void the authorization; Medusa documents both directions of this, canceling an uncaptured authorization or refunding a captured one when cart completion fails, and warns: "Don't assume the payment was charged based on calling the complete cart endpoint alone." A reconciliation job that finds authorizations with no order is not optional.

## Abandonment and Recovery

A checkout that stops is abandoned, and platforms define the moment precisely: Shopify considers a checkout abandoned when it "remains incomplete for more than ten minutes after the customer has provided their email information," and its recovery emails go to Online Store and Buy Button checkouts after a delay the merchant sets, not to shoppers who gave only a phone number or whose payment was blocked as high risk. The pattern elsewhere is the same: a recovery message needs a contact, a link back to the same checkout (prices rechecked when it reopens), and a stop as soon as the order is placed through any route.

Two rules keep recovery lawful and useful:

- **Consent decides the channel.** A cart reminder is commercial email or a marketing text in most readings, so it goes only where the customer's consent and the law allow ([Marketing Consent](/books/commerce/customers-and-accounts#marketing-consent); the later Email, SMS & Lifecycle Marketing chapter owns flows; [TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent) for texts).
- **Fix the cause before discounting it.** Baymard's top reasons are late costs, slow delivery, trust and forced accounts; a recovery coupon trains shoppers to abandon, while showing the total earlier removes the reason.

## How to Build It

A checkout is a versioned, expiring negotiation attached to a cart; shipping quotes are what it offered. Extending the core tables:

```sql
ALTER TABLE carts
  ADD COLUMN token_hash  BYTEA,          -- hash of the guest's opaque cart token
  ADD COLUMN expires_at  TIMESTAMPTZ,    -- enforced on read
  ADD COLUMN merged_into UUID REFERENCES carts (id);  -- set with status = 'merged'

ALTER TABLE cart_lines
  ADD COLUMN repriced_at TIMESTAMPTZ;    -- last time unit_price was checked against the price list

CREATE TABLE checkouts (                 -- one attempt to turn a cart into an order
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cart_id          UUID NOT NULL REFERENCES carts (id),
  version          INT NOT NULL DEFAULT 1,  -- bumped on every change; the authorized total names one
  status           TEXT NOT NULL CHECK (status IN ('open', 'processing', 'completed',
                     'failed', 'expired')),
  email            TEXT,                  -- contact as given; the customer record is resolved from it
  phone            TEXT,
  ship_to          JSONB,                 -- as given, with the validator's verdict
  ship_to_validation TEXT CHECK (ship_to_validation IN ('verified', 'corrected',
                     'unverified', 'overridden')),
  bill_to          JSONB,
  pickup_location_id UUID REFERENCES locations (id),
  shipping_quote_id  UUID,                -- the selected quote, below
  wallet           TEXT,                  -- 'apple_pay', 'google_pay', 'shop_pay', 'paypal', null
  idempotency_key  TEXT NOT NULL UNIQUE,  -- reused for the authorization and the order
  order_id         UUID REFERENCES orders (id),
  contact_captured_at TIMESTAMPTZ,        -- starts the abandonment clock
  recovery_sent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL,
  CHECK ((status = 'completed') = (order_id IS NOT NULL))
);

CREATE TABLE shipping_quotes (           -- every option shown, with its price and promise
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  checkout_id    UUID NOT NULL REFERENCES checkouts (id),
  checkout_version INT NOT NULL,          -- the cart and address it was computed for
  method         TEXT NOT NULL CHECK (method IN ('ship', 'local_delivery', 'pickup')),
  label          TEXT NOT NULL,           -- as shown: 'Standard (3-5 business days)'
  carrier        TEXT,
  service        TEXT,
  from_location_id UUID REFERENCES locations (id),  -- where the promise was computed from
  amount         BIGINT NOT NULL CHECK (amount >= 0),
  currency       CHAR(3) NOT NULL,
  promised_from  DATE,                    -- the earliest and latest arrival shown
  promised_to    DATE,
  rule_ref       TEXT,                    -- the rate table, carrier rate or free-shipping promotion
  quoted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL
);

ALTER TABLE checkouts
  ADD FOREIGN KEY (shipping_quote_id) REFERENCES shipping_quotes (id);

ALTER TABLE orders
  ADD COLUMN checkout_id UUID REFERENCES checkouts (id);

-- Checkouts stuck between authorization and order: step 3 succeeded, step 4 didn't.
SELECT c.id, c.idempotency_key, c.updated_at
FROM checkouts c
WHERE c.status IN ('processing', 'failed')
  AND c.order_id IS NULL
  AND c.updated_at < NOW() - INTERVAL '15 minutes';
```

Design notes:

- **The version is the contract.** Every edit to lines, address, shipping or codes bumps `checkouts.version`; quotes and the tax calculation record the version they were computed for, and placing the order checks that the selected quote and the tax match the current version. A quote from version 3 on a version 5 checkout is stale by construction.
- **The checkout's key is the order's key.** Reusing `idempotency_key` for the authorization and the order makes a retry after any failure safe, and the query above is the reconciliation that catches the remaining case, matched against the processor's authorizations by the same key ([Reconciliation](/docs/payments/payment-states#reconciliation)).
- **Keep every quote shown, not only the chosen one.** A shopper who says they were shown free shipping, or a promise of Friday, is answered from these rows; the selected quote's promise becomes the order's shipping promise in [Consumer Protection Online](/books/commerce/online-consumer-protection#how-to-build-it).
- **Contact starts the clock.** `contact_captured_at` is when recovery becomes possible, and a recovery job selects open checkouts past the merchant's delay with consent to contact, stamping `recovery_sent_at` so one checkout gets one sequence.
- **Expire checkouts and carts on read,** and purge expired ones on a schedule; a cart is personal data for as long as it holds an email ([Retention Windows](/docs/architecture/data-retention#retention-windows)).
- **Emit events:** `checkout.started`, `checkout.contact_captured`, `checkout.completed` and `checkout.abandoned` for analytics and recovery, and `order.placed` from the same transaction that creates the order.

## Auditing

- **What the shopper saw and agreed to.** Every checkout version's lines, charges, shipping quotes shown and the one selected, and the total authorized, so a dispute about a price, a fee or a promised date is answered from records.
- **Address changes and overrides.** The address as typed, the validator's suggestion and what the shopper chose, for failed deliveries and fraud review.
- **One order per checkout.** Checkouts with authorizations and no order, and orders with no checkout, listed and resolved daily.
- **Recovery messages sent,** with the consent each relied on.

## What This Means for the System You Build

- **Key guest carts by an opaque token,** merge them into the account's cart on sign-in, and record the merge.
- **Don't hold stock for carts;** commit at order placement, with short explicit holds only for limited releases.
- **Reprice on add and at checkout,** and recompute tax, shipping and fees on every change, showing the total as early as possible.
- **Put guest checkout first** and offer an account after the order.
- **Validate addresses before pricing,** suggest rather than overwrite, and snapshot the result.
- **Store every shipping quote shown** with its price and promise, and charge and promise exactly the one chosen.
- **Recompute when a wallet sheet changes the address,** and re-run every eligibility rule on the server when an express checkout returns.
- **Extend hosted checkouts through functions and extensions,** and in your own checkout keep third-party code away from the payment page.
- **Place the order once:** freeze, check stock, authorize and create the order under one idempotency key, and reconcile authorizations without orders.
- **Recover abandoned checkouts only with consent,** and fix late costs before discounting.

## References

**Platform documentation**

- [Shopify: Cart (Storefront API)](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart), cart expiry within 30 days and deletion on completed checkout
- [Shopify: Cart object](https://shopify.dev/docs/api/storefront/latest/objects/cart), `checkoutUrl`, `buyerIdentity`, `cartLinesAdd` and delivery addresses
- [Shopify Changelog: One-page checkout is now the default](https://changelog.shopify.com/posts/one-page-checkout-is-now-the-default-shopify-checkout), October 2023
- [Shopify: Checkout UI extensions](https://shopify.dev/docs/api/checkout-ui-extensions), Plus-only extensions on the information, shipping and payment steps
- [Shopify: Functions APIs](https://shopify.dev/docs/api/functions), the function APIs and plan availability for public and custom apps
- [Shopify: Web pixels](https://shopify.dev/docs/apps/build/marketing-analytics/pixels), strict and lax sandboxes for app and custom pixels
- [Shopify: checkout.liquid](https://shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid), unsupported checkout steps and the August 28, 2025 and August 26, 2026 sunsets
- [Shopify Help Center: Upgrading to checkout extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade), additional scripts view-only from August 28, 2025
- [Shopify Changelog: Shopify Scripts will be deprecated on June 30, 2026](https://shopify.dev/changelog/posts/shopify-scripts-will-be-deprecated-on-june-30-2026), the April 15 editing stop and June 30 end of execution
- [Shopify Help Center: Inventory states](https://help.shopify.com/en/manual/products/inventory/fundamentals/inventory-states), committed units when an order is placed
- [Shopify Help Center: Address collection preferences](https://help.shopify.com/en/manual/checkout-settings/address-collection-preferences), autocomplete in 23 countries and validation in 20
- [Shopify Help Center: Abandoned checkout emails](https://help.shopify.com/en/manual/orders/abandoned-checkouts/abandoned-checkout-emails), the ten-minute definition and recovery conditions
- [Shopify Help Center: Shop Pay](https://help.shopify.com/en/manual/payments/shop-pay), the accelerated checkout and its saved details
- [BigCommerce: Checkout SDK](https://docs.bigcommerce.com/docs/storefront/cart-checkout/checkout-sdk), the JavaScript checkout library and the open-source React checkout
- [commercetools: Checkout overview](https://docs.commercetools.com/checkout/overview), Complete Checkout and Payment Only modes and payment connectors
- [commercetools: My Customer profile](https://docs.commercetools.com/api/projects/me-profile), carts and orders of an anonymous ID assigned to the customer
- [Medusa: Complete cart](https://docs.medusajs.com/resources/storefront-development/checkout/complete-cart), order creation and payment cancellation or refund on failure
- [Saleor: Checkout overview](https://docs.saleor.io/developer/checkout/overview), the checkout as the cart and completion creating the order

**Wallets and accelerated checkout**

- [Apple: Providing merchant validation](https://developer.apple.com/documentation/applepayontheweb/providing-merchant-validation), server-side merchant sessions, single use and five-minute expiry
- [Google Pay API: Request objects](https://developers.google.com/pay/api/web/reference/request-objects), gateway and direct tokenization and the QSA requirement for direct
- [PayPal: Fastlane](https://developer.paypal.com/docs/multiparty/checkout/fastlane/), guest recognition by email
- [Stripe: Link](https://docs.stripe.com/payments/link), recognition by email, phone or cookie and one-time codes
- [Stripe: Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element), supported wallets and domain registration
- [Amazon Pay: Checkout Session](https://developer.amazon.com/docs/amazon-pay-api-v2/checkout-session.html), session states and cancellation after 24 hours open

**Addresses**

- [USPS: Web Tools APIs](https://www.usps.com/business/web-tools-apis/), the platform's retirement on January 25, 2026 and the replacement API catalog
- [Google: Address Validation API overview](https://developers.google.com/maps/documentation/address-validation/overview), validation, standardization and USPS CASS for US and Puerto Rico

**Research**

- [Baymard Institute: Cart abandonment rate statistics](https://baymard.com/lists/cart-abandonment-rate), the 70.22% average across 50 studies, abandonment reasons, form element counts and the conversion estimate
- [Baymard Institute: Checkout flow average form fields](https://baymard.com/blog/checkout-flow-average-form-fields), 11.3 fields on average in 2024 and 8 needed
- [Baymard Institute: Current state of checkout UX](https://baymard.com/research-articles/current-state-of-checkout-ux), 62% of sites not making guest checkout the most prominent option
