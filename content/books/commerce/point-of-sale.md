+++
title = "Point of Sale"
description = "POS systems from Square, Shopify, Lightspeed, Clover, Toast and NCR Voyix: the sale at the register, tenders, hardware, offline mode, receipts, with the schema."
category = "Commerce Industry"
order = 2339
part = "Point of Sale and Stores"
tags = ["commerce", "point-of-sale", "stores", "receipts", "offline", "hardware"]
+++

A point of sale is the one channel that can't wait. A website that slows down loses a few carts; a register that stops at 5:40 on a Saturday leaves a line of people holding goods they can't pay for, and the store either stops selling or starts writing sales on paper. Everything in the system is shaped by that: the catalog, prices, taxes and discounts have to be on the device, the sale has to complete with or without the network, the card terminal has to take a tap in under a second, and the receipt has to come out of a printer or land in an inbox before the customer reaches the door. Then all of it has to reconcile, hours later, with the inventory, the payments and the cash in the drawer.

A POS is also no longer a cash register with software attached. The big ones are payments businesses: their revenue is mostly a share of the card volume that runs through their terminals, and the software (catalog, staff, inventory, reporting, online ordering) is what keeps a merchant from switching. This chapter covers the POS landscape, what a sale at the register is in the data model, tenders, hardware, offline mode and its limits, receipts and the privacy questions digital receipts raise, and the register's relationship to cash. It extends `orders`, `order_payments` and `locations` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Card-present payments themselves (the chip, contactless, terminals, P2PE, offline authorization risk and interchange) are the Payments volume's [Card-Present Payments](/books/payments/card-present); staff, drawers, end of day and shrink are [Store Operations](/books/commerce/store-operations); tables, kitchens and tips are [Restaurants & Food Service](/books/commerce/restaurants).

## How the Platforms Do It

As of October 2026, from each company's latest annual filing and its help center:

| System | Focus | Scale in the latest filing | Offline payments |
| --- | --- | --- | --- |
| **Square (Block)** | Small and mid-size retail, restaurants and services; in-house hardware | About $250 billion of Square gross payment volume in 2025, up 10%, from more than 4.5 million sellers; $3.9 billion Square gross profit | A 24-hour session; payments must upload within 72 hours or expire; the seller sets a per-payment cap between $1 and $50,000 |
| **Shopify POS** | Retailers selling online and in store on one catalog | Part of Shopify's GMV; POS Pro costs $89 per location per month on top of the Shopify plan | Chip and contactless on supported readers only, with a per-device daily limit and a per-order limit; reconnect "ideally within 24 hours" |
| **Lightspeed** | Retail in North America and hospitality in Europe | $98.1 billion GTV and $1,227.0 million revenue in fiscal 2026 (year to March 31, 2026); divested Upserve in April 2026 | Not in the sources here |
| **Clover (Fiserv)** | Small merchants through bank and processor channels | Reported inside Fiserv's Merchant segment ($10,140 million revenue in 2025); 2025 acquisitions of CCV, CardFree and part of TD Merchant Canada | Mini and Flex take offline payments "for up to 7 days" by default, with amount and total limits |
| **Toast** | Restaurants | About 164,000 locations at the end of 2025, up 22%; $195.1 billion GPV; $2,047 million ARR | Enters offline mode 40 seconds after losing the internet; cash and cards still work, gift cards and house accounts don't |
| **NCR Voyix** | Enterprise retail (grocery, convenience, fuel) and restaurants (Aloha) | $2,687 million revenue in 2025: Retail $1,842 million, Restaurants $818 million; 62% recurring | Not in the sources here |

Four patterns:

- **The POS is a payments company.** Square's and Toast's gross payment volume is the headline number in their filings, and Clover sits inside a processor. Lightspeed reports GPV ($41.0 billion in fiscal 2026, up 21%) alongside GTV because the share of transactions it processes itself is what grows revenue. A merchant on these systems usually can't bring its own processor without losing features or paying more; the payments side of that bundling is the Payments volume's [Software Platforms](/books/payments/software-platforms).
- **The verticals split.** Toast estimates its US restaurant locations are about 20% of the US restaurant market; Lightspeed concentrates on North American retail and European hospitality and sold its US hospitality product; NCR Voyix sold its digital banking business ($2.45 billion to a Veritas Capital affiliate, September 30, 2024) and spun off its ATMs as NCR Atleos in 2023 to be a retail and restaurant technology company. A POS built for a clothing store and one built for a restaurant share payments and little else.
- **Offline is a product with limits.** Every vendor that documents offline mode caps the amount, the duration or both, and puts the decline risk on the merchant. The limits differ by an order of magnitude (24 hours at Square, 7 days by default at Clover), which is why they belong in configuration, per merchant ([Offline Mode and Its Limits](#offline-mode-and-its-limits)).
- **Hardware is the moat.** Block says its "Square hardware is designed and developed in-house" with contract manufacturers; Toast sells handhelds with "optional cellular backup"; Shopify sells POS Go and its card readers. Hardware a merchant bought is hardware it doesn't want to throw away.

## What a POS Is

Every system in the table has the same parts, whatever they're called:

| Part | What it does | The record |
| --- | --- | --- |
| **Register app** | Runs on a terminal, tablet or phone; builds the sale, applies discounts, takes tenders | An `orders` row with `channel = 'pos'` |
| **Local catalog** | Items, prices, taxes, discounts and modifiers for this location, cached on the device | `location_items` and price lists, synced down |
| **Payments** | The card terminal and the processor behind it | `order_payments` pointing at the Payments volume's records |
| **Peripherals** | Scanner, receipt printer, cash drawer, customer display, scale, kitchen printer | `pos_devices` |
| **Back office** | Catalog editing, staff, inventory, reports, end-of-day | The rest of this volume's tables |
| **Integrations** | The online store, delivery apps, accounting, loyalty | `connected_systems` from [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it) |

Two of these drive the design. The local catalog means the device holds a copy of the truth, and that copy can be stale; the register has to price a sale correctly from what it has, and the back office has to accept that a sale was rung at yesterday's price if the update hadn't arrived. The payments link means the POS doesn't own the money: it records which payments paid for which sale, and the Payments model records what the money did next.

## The Sale at the Register

A register sale is an order like any other, created in seconds and fulfilled at the same moment:

1. **Build the sale.** Scan or tap items. The register prices each line from the location's price, applies automatic discounts and any code or manual discount the cashier is allowed to give ([Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards)), and calculates tax at the store's address ([Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties)). A weighed item records its weight as the quantity (`sold_by = 'weight'`).
2. **Attach a customer, maybe.** Most store sales are anonymous (`customer_id` is null). A phone number or email for loyalty or a digital receipt attaches one, and that is a collection of personal data with its own rules ([Receipts and Privacy](#receipts-and-privacy)).
3. **Take tenders.** One or more payments until the balance is zero: a card, cash with change, a gift card, store credit, or a split across several ([Tenders](#tenders)).
4. **Close it.** The order is placed and fulfilled in one step: a `fulfillments` row with `kind = 'pickup'` from this location, handed over now, and inventory decrements at the store. A sale that will ship (endless aisle) or be collected later (a layaway or a special order) leaves an open fulfillment instead ([Endless Aisle](/books/commerce/omnichannel-fulfillment#endless-aisle)).
5. **Issue the receipt.** Printed, emailed, texted or none, with a receipt number the store can find later for a return.

Three things differ from an online order. **Speed:** the whole sale happens in a minute, so the register can't wait on a tax engine or an inventory service over the internet; it calculates locally and the back office reconciles. **The cashier:** a person with permissions applies discounts, overrides prices, voids lines and opens the drawer, and every one of those is attributed to them ([Staff, Roles and Permissions](/books/commerce/store-operations#staff-roles-and-permissions)). **Returns:** a return at the register reverses a line from an earlier order found by receipt number or card, or without a receipt under the store's policy, and refunds to the original tender where it can ([Returns in Store](/books/commerce/omnichannel-fulfillment#returns-in-store), [Return Policies and the Law](/books/commerce/returns-and-exchanges#return-policies-and-the-law)).

Voids and returns are different things. A **void** cancels a line or a whole sale before it closes, or cancels a card authorization before the batch settles; nothing was sold. A **return** happens after the sale closed; something was sold and comes back. Shopify's POS activity log records a void as "A staff member voids a transaction or a line item," separately from refunds, and keeping them apart is what lets a manager see a cashier who voids too much.

## Tenders

A **tender** is one way a sale was paid for. A sale can have several, and each has its own behavior:

| Tender | What happens | Notes |
| --- | --- | --- |
| **Card (chip, contactless, swipe)** | Authorized at the terminal; captured in the day's batch; a tip may be added before capture | The Payments volume owns the flow ([Card-Present Payments](/books/payments/card-present)) |
| **Cash** | Counted into the drawer; change given | The drawer's expected balance moves ([Cash Management and End of Day](/books/commerce/store-operations#cash-management-and-end-of-day)) |
| **Gift card or store credit** | A balance is debited | Online balance check; often unavailable offline ([Gift Cards and Store Credit](/books/commerce/promotions-and-gift-cards#gift-cards-and-store-credit)) |
| **EBT / SNAP** | A benefits card paying for eligible items only | Splits the sale by item eligibility; excluded from offline mode at Square |
| **House account** | Charged to a customer's account and invoiced | A receivable, not a payment |
| **Check, voucher, other** | Recorded as a manual tender | The merchant's own process |

Split tenders are the normal case, not an edge case: a gift card that covers part of a sale and a card for the rest, two friends splitting a bill, cash for most and a card for the remainder. The order is paid when the sum of successful tenders equals the total; a tender that fails mid-sale (a decline after the gift card was already debited) leaves a partially paid sale that the cashier finishes another way or voids, and the void has to reverse the gift card debit too.

Change is part of the cash tender, not a separate refund: a $20 note for a $13.27 sale is a cash tender of $20.00 with $6.73 change, and the drawer's expected cash rises by $13.27. Recording both numbers is what lets an end-of-day count explain itself. Some places require stores to accept cash at all, which is a reason the cash tender can't be removed from a store's configuration everywhere ([Where Cash Is Required](/books/payments/cash-payments#where-cash-is-required)).

## Hardware

A store's hardware is a small fleet:

- **Payment terminals and readers.** Countertop terminals, handhelds and card readers that pair with a tablet. Each is certified with its processor, so the POS vendor's hardware list is also a list of what its payments business supports. Block lists Square Register, Square Terminal, Square Stand, Square Reader for contactless and chip, Square Reader for magstripe and Square Handheld; Shopify's offline-capable list is the Verifone Victa, POS Go, POS Terminal, Tap & Chip, Chipper 2X BT and WisePad 3 ([Terminals and Where the POS Sits](/books/payments/card-present#terminals-and-where-the-pos-sits)).
- **Tap to Pay on a phone.** Apple's Tap to Pay on iPhone accepts "contactless credit or debit cards, Apple Pay, Apple Watch, and smartphones with other digital wallets" with no extra hardware, in 60 countries and regions on Apple's list as of October 2026; Android has an equivalent. It's the cheapest way to add a register, and it doesn't work offline at Square or Shopify ([Contactless and Tap to Pay](/books/payments/card-present#contactless-and-tap-to-pay)).
- **Scanners.** Barcode scanners read the GTIN on the package ([Products, Variants & Bundles](/books/commerce/products-and-variants)). GS1 US's Sunrise 2027 is the industry's move from 1D UPC barcodes to 2D codes (GS1 DataMatrix and QR codes carrying a GS1 Digital Link): retailers' first step is to "install optical scanners that are Sunrise-capable to read 2D barcodes and extract the GTIN at POS," and GS1 says "it is not necessary to implement all the capabilities of 2D by that date." A 2D code can also carry a lot number and expiry, which is what lets a register refuse to sell a recalled lot ([Recalls](/books/commerce/product-safety-and-recalls#recalls)).
- **Printers, drawers and displays.** A receipt printer that often also kicks the cash drawer open, a customer-facing display that shows the total and the tip prompt, kitchen printers in a restaurant.
- **Scales and kiosks.** Certified scales for goods sold by weight, and self-service kiosks or self-checkout lanes; NCR Voyix says its self-checkout "enables retail consumers to transact independently."

For the software, each device is a row with a type, a serial number, a location and a status, because a terminal is lost, stolen, swapped or replaced, and a payment needs to say which device took it. A terminal that disappears with offline payments stored on it is a loss with a device ID on it ([Running a Fleet](/books/payments/card-present#running-a-fleet)).

## Offline Mode and Its Limits

When the network drops, the register keeps selling from its local catalog, and the question is what happens to the payments. The Payments volume covers the mechanics: a stored card payment isn't authorized until it's forwarded, and the issuer can still decline it ([Offline: Approved Isn't Paid](/books/payments/card-present#offline-approved-isn-t-paid)). The POS vendors' own documentation is blunt about who carries that:

| | Square | Shopify POS | Toast | Clover |
| --- | --- | --- | --- | --- |
| **When it starts** | The seller turns on offline payments | The merchant activates it and gives staff the "Accept offline credit and debit payments" permission | 40 seconds after losing the internet, or during a Toast outage | Configured per device |
| **How long** | The session ends after 24 hours; payments must upload within 72 hours of the session's start | No hard cutoff stated; reconnect "ideally within 24 hours" | Until the connection returns; if not by end of day, call support to disable auto-capture | Up to 7 days by default |
| **Limits** | Per-payment maximum set between $1 and $50,000 | A per-device daily total and a per-order limit | Not stated in the overview | Per-transaction amount and total amount offline |
| **What doesn't work** | Manual card entry, EBT, Afterpay, Cash App Pay, Square gift cards, Tap to Pay | Swipe, Tap to Pay, manual entry; Interac in Canada, eftpos in Australia; all offline payments in France | Gift cards, loyalty redemptions, Tender API payments, text to pay, customer credits, comp cards, house accounts | Not stated in the overview |
| **Who carries the risk** | "You're responsible for any expired, declined, or disputed payments" | The merchant, and the customer's phone or email must be collected to chase a decline | The merchant; keep signed merchant copies of receipts | The merchant accepts "the level of risk" if a payment is declined |

Square adds two warnings worth building into any POS: "You will not receive notifications for declined payments while processing offline payments," and pending offline payments are lost permanently if the seller signs out, deletes the app, switches location or resets the device. Expired offline payments "cannot be retrieved or reprocessed."

Offline is more than payments. Prices and promotions changed in the back office don't reach the device; a gift card balance or a loyalty balance can't be checked; inventory decrements locally and two registers can both sell the last unit; and the tax rate is whatever the device last synced. The offline register is a client with its own outbox, and the playbook's [Offline Sync](/docs/architecture/offline-sync) is the pattern: commands, not diffs ([Commands, Not Diffs](/docs/architecture/offline-sync#commands-not-diffs)), a device outbox that survives restarts ([The Device Outbox](/docs/architecture/offline-sync#the-device-outbox)), and two clocks, the device's and the server's ([Two Clocks](/docs/architecture/offline-sync#two-clocks)).

My rules for a POS offline mode:

- **Generate IDs on the device.** Every sale, line and tender gets its ID and idempotency key on the register, so the upload can be retried without creating a second sale ([Idempotency](/docs/payments/idempotency)).
- **Mark everything taken offline.** The order and each payment carry `taken_offline = true` and the device's timestamp; a card tender is `collected_offline` until forwarded and authorized, never `authorized`.
- **Cap the risk in configuration.** Per-payment and per-device totals, a maximum session length, and the tenders allowed offline, all per merchant, enforced on the device.
- **Collect a contact.** Shopify requires the customer's phone or email for an offline card sale; it's the only way to recover a decline.
- **Alert on unforwarded payments.** A device holding stored payments past a threshold, or one that has stopped reporting, is a page to someone, because the money dies with it.
- **Reconcile prices and stock after.** A sale rung at a stale price is valid at that price; the back office records the difference instead of rewriting the sale, and an oversold item becomes an inventory correction ([Overselling](/books/commerce/inventory#overselling)).

## Receipts and Privacy

A receipt is the customer's proof of purchase and the store's key to the sale later. It carries the store, the date and time, the register and cashier, every line as sold, discounts, tax, the total, each tender, the change and a receipt number; for cards, the brand, the last digits and the authorization code. Card receipts have a federal rule: under FACTA, no merchant accepting cards "shall print more than the last 5 digits of the card number or the expiration date upon any receipt provided to the cardholder at the point of the sale or transaction" (15 U.S.C. 1681c(g)). It applies to electronically printed receipts, not handwritten ones or imprints, and it's why the receipt template, not the cashier, decides what card data appears. Receipt-specific state laws (thermal paper chemicals, mandatory paper receipts) exist in some places; they aren't covered in the sources here.

**Digital receipts** trade paper for data. An emailed or texted receipt needs an address or a phone number, and asking for one at checkout is a collection of personal information:

- **The purpose has to be the receipt.** A customer who gives an email for a receipt hasn't consented to marketing. Marketing consent is its own record, with its own source and timestamp ([Customers, Accounts & Privacy](/books/commerce/customers-and-accounts)), and texting a receipt or an offer has its own consent rules ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)).
- **Some states limit what a card checkout may ask.** Massachusetts bars a business accepting credit cards from writing or requiring the cardholder to write "personal identification information" not required by the issuer on the transaction form, including an address or phone number, with exceptions for information volunteered for shipping, delivery, installation or warranty (Mass. Gen. Laws c. 93, §105). California's Song-Beverly Credit Card Act has a comparable rule, and its courts have read ZIP codes as personal information; the statute and the cases weren't retrievable when this was checked. <!-- source-gap: song-beverly-zip | missing | California Civ. Code 1747.08 and Pineda v. Williams-Sonoma (2011) treating a ZIP code request at card checkout as personal identification information; Tyler v. Michaels (Mass. 2013) on c.93 s.105 | closes with: leginfo text of 1747.08 and the two opinions | checked: 2026-10-28 -->
- **Matching a card to a customer is identity linkage.** POS systems that recognize a returning card and offer to send the receipt to the address used last time are linking a card fingerprint to a person; that link is personal data with a retention period and a deletion path ([Record Linkage](/docs/architecture/record-linkage), [Retention Windows](/docs/architecture/data-retention#retention-windows)).
- **Receipt links are bearer tokens.** A digital receipt is usually a link to a hosted page. Anyone with the link sees the purchase, so the URL is unguessable, carries no personal data in the path, and doesn't expose the full customer profile.

The design rule: **a receipt is a rendering of the order, not a separate record of what was sold.** The order lines and tenders are the truth; a receipt row records that a receipt was issued, how (printed, email, SMS), to which address if any, and when, and a reprint renders the same order again with "duplicate" on it.

## Registers and Cash

A **register** is a POS device that takes cash and has a drawer; a **till** is the drawer and the cash in it (the words are used loosely, and many systems say "cash drawer" for both). The register's job at the point of sale is narrow: record each cash tender and its change, each **paid in** and **paid out** (petty cash for a delivery tip, a refund in cash), each **no-sale** drawer open, and each **drop** of excess cash to the safe, against the drawer that is open on that device. Opening a drawer with a float, counting it at close, explaining an over or a short, and taking the deposit to the bank are store operations, covered in [Cash Management and End of Day](/books/commerce/store-operations#cash-management-and-end-of-day).

## How to Build It

The core model already has POS orders (`orders.channel = 'pos'`), locations and payment references. This chapter adds the devices, tenders and receipts, and the offline markers:

```sql
CREATE TABLE pos_devices (               -- terminals, readers, printers, drawers, kiosks
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id    UUID NOT NULL REFERENCES locations (id),
  kind           TEXT NOT NULL CHECK (kind IN ('register', 'handheld', 'payment_terminal',
                   'card_reader', 'phone_tap_to_pay', 'kiosk', 'self_checkout',
                   'receipt_printer', 'kitchen_printer', 'kitchen_display', 'cash_drawer',
                   'scale', 'scanner', 'customer_display')),
  name           TEXT NOT NULL,          -- "Register 2", "Bar handheld"
  serial_number  TEXT,
  processor_ref  TEXT,                   -- the terminal's ID at the payment processor
  paired_with_id UUID REFERENCES pos_devices (id),  -- a reader paired to a register
  offline_policy JSONB,                  -- per-payment cap, device total, max hours, tenders
  app_version    TEXT,
  last_seen_at   TIMESTAMPTZ,
  status         TEXT NOT NULL CHECK (status IN ('active', 'lost', 'retired')),
  UNIQUE (kind, serial_number)
);

ALTER TABLE orders
  ADD COLUMN pos_device_id    UUID REFERENCES pos_devices (id),  -- the register that rang it
  ADD COLUMN staff_id         UUID,     -- the cashier; staff in Store Operations
  ADD COLUMN register_session_id UUID,  -- the drawer session; Store Operations
  ADD COLUMN taken_offline    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN device_placed_at TIMESTAMPTZ;  -- the device clock; placed_at is the server's

CREATE TABLE tenders (                   -- one way a sale was paid
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id         UUID NOT NULL REFERENCES orders (id),
  kind             TEXT NOT NULL CHECK (kind IN ('card', 'cash', 'gift_card',
                     'store_credit', 'ebt', 'house_account', 'check', 'other')),
  amount           BIGINT NOT NULL CHECK (amount > 0),  -- applied to the sale, minor units
  tendered         BIGINT,               -- cash handed over; null for exact tenders
  change_given     BIGINT NOT NULL DEFAULT 0 CHECK (change_given >= 0),
  tip_amount       BIGINT NOT NULL DEFAULT 0 CHECK (tip_amount >= 0),
  status           TEXT NOT NULL CHECK (status IN ('pending', 'collected_offline',
                     'authorized', 'captured', 'declined', 'voided', 'refunded')),
  order_payment_id UUID REFERENCES order_payments (id),  -- the Payments pointer, once it exists
  gift_card_id     UUID,                 -- gift_cards, from Promotions
  pos_device_id    UUID REFERENCES pos_devices (id),
  staff_id         UUID,
  idempotency_key  TEXT NOT NULL,        -- generated on the device
  device_created_at TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key),
  CHECK (kind = 'cash' OR (tendered IS NULL AND change_given = 0)),
  CHECK (kind <> 'cash' OR tendered = amount + change_given)
);

CREATE TABLE order_voids (               -- a line or sale cancelled before it closed
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID NOT NULL REFERENCES orders (id),
  order_line_id UUID REFERENCES order_lines (id),  -- null: the whole sale
  reason        TEXT NOT NULL,           -- a code
  staff_id      UUID NOT NULL,
  approved_by   UUID,                    -- a manager override, if the role requires one
  voided_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_receipts (            -- a receipt issued for a sale; not goods receipts
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  location_id    UUID NOT NULL REFERENCES locations (id),
  number         TEXT NOT NULL,          -- printed on it; how a return finds the sale
  delivery       TEXT NOT NULL CHECK (delivery IN ('printed', 'email', 'sms', 'none')),
  sent_to        TEXT,                   -- the address or number, if digital
  marketing_consent_id UUID,             -- marketing_consents, only if given separately
  public_token   TEXT,                   -- the hosted receipt link; random, no PII
  is_duplicate   BOOLEAN NOT NULL DEFAULT FALSE,  -- a reprint of the same order
  issued_by      UUID,                   -- staff
  issued_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (location_id, number, is_duplicate),
  UNIQUE (public_token)
);

-- Offline exposure per device right now: what a decline could cost.
SELECT d.id, d.name, l.name AS location,
       COUNT(t.id) AS stored_payments,
       COALESCE(SUM(t.amount + t.tip_amount), 0) AS at_risk,
       MIN(t.device_created_at) AS oldest
FROM pos_devices d
JOIN locations l ON l.id = d.location_id
LEFT JOIN tenders t ON t.pos_device_id = d.id AND t.status = 'collected_offline'
GROUP BY d.id, d.name, l.name
HAVING COUNT(t.id) > 0
ORDER BY oldest;
```

Design notes:

- **`sales_receipts`, not `receipts`.** In this volume `receipts` and `receipt_lines` are goods received against a purchase order ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#how-to-build-it)); the customer's receipt is `sales_receipts`. The `documents` table's `receipt` kind is the goods receipt too.
- **Tenders are the POS view; `order_payments` is the money.** A tender exists the moment the cashier takes it, even offline and even for cash; `order_payments` rows are created when the processor or ledger has something to point at. Cash tenders never have one unless the merchant's ledger records cash; gift card tenders point at `gift_card_transactions`.
- **The device's clock and the server's.** `device_placed_at` and `device_created_at` say when the sale happened in the store; `placed_at` and `created_at` say when the server learned of it. Reports by business day use the device time in the location's time zone ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)); anything about upload delay uses the gap.
- **Cash arithmetic is a constraint.** `tendered = amount + change_given` for cash makes a miskeyed change amount impossible to store, and the drawer's expected balance in [Store Operations](/books/commerce/store-operations#how-to-build-it) sums `amount`, not `tendered`.
- **Card data never lands here.** Tenders carry the brand, last four and authorization code inside the Payments records they point at; the POS database never holds a card number ([Sensitive Data](/docs/payments/sensitive-data), [P2PE: Encrypt at the Glass](/books/payments/card-present#p2pe-encrypt-at-the-glass)).
- **Events.** `order.placed` with `channel = 'pos'`, `tender.collected_offline`, `tender.forwarded`, `tender.declined_after_offline` and `pos_device.stale` are what inventory, accounting and alerting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every void, discount, price override and no-sale,** with the staff member, the approving manager if any and the reason, because they're how cash and goods leave a store without a sale ([Shrink and Loss Prevention](/books/commerce/store-operations#shrink-and-loss-prevention)).
- **Every offline payment** from collection to forwarding to its final state, with the device and the elapsed time, so a merchant disputing a loss can see exactly which payments were stored, how long, and why they failed.
- **Every receipt issued,** with its delivery method and recipient, and every reprint, so "I never got a receipt" and duplicate-receipt return fraud both have an answer.
- **Device history:** which terminal was at which location, paired with which register, from when to when, and when it was reported lost.
- **Configuration changes to offline limits and permissions,** with who changed them, because raising an offline cap is a risk decision ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Treat the POS as an offline-first client** with its own catalog copy and an outbox, not as a thin web page over the order API.
- **Generate sale, line and tender IDs on the device** so uploads are idempotent.
- **Model tenders separately from payment records,** with cash tendered and change as columns and split tenders as the normal case.
- **Make offline limits configuration per merchant and device:** per-payment cap, device total, maximum duration and the tenders allowed.
- **Keep `collected_offline` distinct from `authorized`,** alert on stale stored payments, and never fund a merchant against them.
- **Separate voids from returns** and attribute both to a staff member.
- **Render receipts from the order,** truncate card numbers per FACTA, and keep a digital receipt's address apart from marketing consent.
- **Name the customer receipt `sales_receipts`** so it never collides with goods receipts.

## References

**Filings**

- [Block: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), about $250 billion Square GPV up 10%, more than 4.5 million sellers, $3.9 billion Square gross profit, the GPV definition and in-house Square hardware
- [Toast: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1650164/000165016426000057/tost-20251231.htm), about 164,000 locations, $195.1 billion GPV, $2,047 million ARR, the 20% market estimate, offline card encryption and Toast Go 3 cellular backup
- [Lightspeed: MD&A for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1823306/000182330626000025/mdafy26q4.htm), revenue of $1,227.0 million, GTV of $98.1 billion and GPV of $41.0 billion
- [Lightspeed: Annual Information Form 2026](https://www.sec.gov/Archives/edgar/data/1823306/000182330626000025/annualinformationform2026.htm), the focus on North American retail and European hospitality and the April 2026 Upserve divestiture
- [Fiserv: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/798354/000079835426000009/fi-20251231.htm), Clover as Fiserv's POS platform, the 2025 CCV, CardFree and TD Merchant acquisitions and Merchant segment revenue
- [NCR Voyix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/70866/000007086626000006/ncr-20251231.htm), segment revenue, recurring revenue share, the Digital Banking sale and NCR Atleos spin-off, Aloha and self-checkout

**Platform documentation**

- [Square Support: Process card payments with Offline Mode](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode), the 24-hour session, 72-hour upload, $1 to $50,000 cap, excluded tenders, decline notifications and loss of pending payments
- [Shopify Help: Accepting offline payments](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-payments), supported readers, the staff permission, excluded methods and countries, device and order limits and collecting a contact
- [Shopify POS pricing](https://www.shopify.com/pos/pricing), POS Pro at $89 per location per month
- [Shopify Help: Shopify POS activity log](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/staff-management/pos-activity-log), voids, refunds and discounts recorded per staff member
- [Toast: Offline payments overview](https://doc.toasttab.com/doc/platformguide/platformOfflinePaymentsOverview.html), the 40-second trigger, tenders unavailable offline and auto-capture
- [Clover Developer Docs: Handling offline payments](https://docs.clover.com/docs/handling-offline-payments), the 7-day default, limits and merchant risk
- [Apple Developer: Tap to Pay on iPhone](https://developer.apple.com/tap-to-pay/), what it accepts without extra hardware
- [Apple Developer: Tap to Pay on iPhone regions](https://developer.apple.com/tap-to-pay/regions/), the countries and regions supported
- [GS1 US: Sunrise 2027](https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027), the move to 2D barcodes at POS and the scanner guidance

**Law**

- [15 U.S.C. 1681c (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/1681c), FACTA receipt truncation in subsection (g)
- [Mass. Gen. Laws c. 93, §105](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93/Section105), personal identification information on credit card transaction forms
</content>
</invoke>
