+++
title = "Shipping & Carriers"
description = "Parcel carriers and their APIs, multi-carrier platforms, rate shopping, dimensional weight and zones, labels, tracking events and delivery promises."
category = "Commerce Industry"
order = 2319
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "shipping", "carriers", "dimensional-weight", "tracking", "data-model"]
+++

Shipping is the one cost in an online order that the merchant controls package by package and the customer sees line by line. A parcel's price is a function of who carries it, how fast, how far, how heavy, how big, where it's going and which surcharges its shape and destination trigger, and that function changes every January, again mid-year for the Postal Service, and weekly for fuel. Pick the box one inch too big and a two-pound case bills as seven. Promise Thursday on a service that delivers Thursday 85% of the time and one customer in seven gets a broken promise. Buy the label through the wrong account and the merchant pays retail.

This chapter covers parcel shipping for orders a business sends by carrier: the carriers and their APIs, multi-carrier platforms, rate shopping, dimensional weight, zones and surcharges, labels, tracking events, delivery promises and carrier liability. It extends `shipments` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Delivery by the merchant's own vans and drivers (routes, proof of delivery, failed attempts) belongs to the Field Operations volume: [Last-Mile Delivery](/books/field-operations/last-mile-delivery), [Route Optimization](/books/field-operations/route-optimization) and [Dispatch](/books/field-operations/dispatch). On-demand courier delivery is [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching). Freight to retailers, returns labels and cross-border shipping are covered in [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#routing-guides), [Returns & Exchanges](/books/commerce/returns-and-exchanges#the-return-lifecycle) and [Cross-Border Commerce](/books/commerce/cross-border-commerce#incoterms-dap-and-ddp).

## How the Platforms Do It

As of October 2026, from carrier service guides, the Domestic Mail Manual and developer documentation:

| Carrier | Ground and economy services | Dimensional weight | Size and weight limits | API |
| --- | --- | --- | --- | --- |
| **USPS** | Ground Advantage ("expected delivery in 2–5 days," $100 insurance included); Priority Mail ("delivery in 2-3 days," an estimate, up to $100 insurance); Priority Mail Express; Parcel Select | Over 1 cubic foot (1,728 cubic inches): length × width × height, each rounded up to the inch, divided by 139 since July 12, 2026 (166 before); nonrectangular parcels use a 0.785 factor and 166 | 70 lb; 130 inches length plus girth for Ground Advantage (108 for Priority Mail), with an oversized price over 108 | USPS APIs with OAuth 2.0 client credentials; the legacy Web Tools API was retired on January 25, 2026 |
| **UPS** | Ground; Ground Saver, a "contract-only, non-guaranteed economy residential service" | Daily rates: cubic inches divided by 139 | 150 lb, 108 inches long, 165 inches length plus girth; Large Package Surcharge over 130 inches length plus girth or 96 inches long | REST APIs (Rating, Shipping, Tracking and others) with OAuth 2.0 client credentials |
| **FedEx** | Ground, Home Delivery, Ground Economy | Divided by 139; "any fraction of an inch is rounded up" (since August 18, 2025), and weight rounded up to the next pound | Ground: 150 lb, 108 inches long, 165 inches length plus girth (an unauthorized package charge of $1,875 above them); Oversize over 96 inches long or 130 length plus girth | REST APIs with OAuth tokens that last an hour; legacy FedEx Web Services retired for customers June 1, 2026 |
| **Regional and alternative** | OnTrac ("the largest alternative carrier network in the country"), GLS US (Western US), LSO (Texas, Oklahoma and nearby metros), Veho (crowdsourced drivers, next-day and two-day), UniUni ("65% U.S. coverage"), Amazon Shipping (2 to 5 day ground, seven-day pickup and delivery) | Each carrier's own tariff | Each carrier's own | Each carrier's own, or through a multi-carrier platform |

And the platforms most merchants actually call:

| Platform | What it does | Tracking statuses | Pricing (published) |
| --- | --- | --- | --- |
| **EasyPost** | One API for rates, labels and tracking across carriers; a shipment returns rates and `buy` returns the label and tracking code; SmartRate adds time-in-transit percentiles | `pre_transit`, `in_transit`, `out_for_delivery`, `delivered`, `available_for_pickup`, `return_to_sender`, `failure`, `cancelled`, `error`, `unknown`, with finer `status_detail` values | Free up to 3,000 labels a month with EasyPost-provided carrier accounts; $20 a month plus a per-label fee with your own carrier accounts |
| **Shippo** | Rates, labels and tracking across carriers, by API or app | `PRE_TRANSIT`, `TRANSIT`, `DELIVERED`, `RETURNED`, `FAILURE`, `UNKNOWN`, with substatuses such as `out_for_delivery`, `delivery_attempted`, `package_held`, `package_lost` | Starter free up to 30 labels a month, 5¢ a label on your own carrier account; Pro from $17 a month |
| **ShipStation** | Order import from channels, rate shopping, batch labels, manifests and tracking webhooks, with an API | Mapped per carrier | Starter from $14.99 a month for 50 shipments, Standard from $29.99, Premium from $349.99; no per-label fee |
| **Shopify Shipping** | Discounted labels inside the Shopify admin; carrier-calculated rates at checkout through a carrier service callback | Shopify's fulfillment events | Label discounts "vary based on your Shopify plan" |

Three patterns:

- **Everyone divides by 139 now.** UPS and FedEx have used 139 for daily rates for years; the Postal Service moved its main parcel products from 166 to 139 on July 12, 2026, "to align with industry standards," and FedEx and USPS both now round each dimension up rather than to the nearest inch. A box that was cheapest at USPS because of the gentler divisor may not be any more.
- **The carriers' own APIs were rebuilt.** USPS retired Web Tools in January 2026 and FedEx its legacy Web Services in mid-2026, both for OAuth-authenticated REST APIs. Integrations written directly against the old ones broke; integrations through a multi-carrier platform mostly didn't notice.
- **Tracking vocabularies are small and similar.** EasyPost and Shippo each normalize every carrier's scans into about six to ten statuses with finer details beneath, which is the shape a merchant's own system should use too.

## Rate Shopping

Rate shopping picks, for each package, the carrier and service that meet the promise at the lowest cost. The price of a label is:

```text
label cost = base rate(carrier, service, zone, billable weight)
           + surcharges(residential, delivery area, additional handling, oversize, ...)
           + fuel surcharge(percentage, adjusted weekly)
           - account discounts

billable weight = max(actual weight rounded up, dimensional weight)
```

Each input has its own source:

- **The account.** The same label costs different amounts on the carrier's published daily rates, on a merchant's negotiated contract, and on the rates a platform or 3PL resells (Shopify Shipping's discounts by plan, EasyPost's and Shippo's provided accounts). A merchant may have several accounts per carrier, and rate shopping compares accounts, not only carriers.
- **The zone.** Carriers price by distance band from origin to destination: USPS zones 1 to 9, with UPS and FedEx using their own zone charts. The ship-from location therefore changes the price, which is why sourcing and rate shopping share inputs ([Sourcing and Distributed Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)).
- **The package.** Weight and dimensions, after cartonization in the warehouse ([Inside a Warehouse](/books/commerce/warehouses-and-3pls#inside-a-warehouse)).
- **The destination.** Residential or commercial, and whether it falls in a carrier's delivery area surcharge list (FedEx lists a per-package charge of $4.45 commercial and $5.55 extended).
- **The calendar.** Fuel surcharges move weekly (FedEx indexes Ground to the on-highway diesel price and other services to jet fuel), and peak-season surcharges apply between dates each carrier sets.

**Cheapest that meets the promise.** The choice is a filter and a minimum: services whose expected delivery date meets the date promised to the customer, then the lowest cost among them. EasyPost's SmartRate returns days in transit at the 50th through 99th percentiles per service and lane (including weekends and holidays), which turns "meets the promise" into a confidence level: a merchant promising a date can choose the cheapest service that delivers by it 90% or 95% of the time, and should record which level it used.

**Checkout rates are a different call.** What the customer pays for shipping is quoted at checkout, before the warehouse, the box or the label exist, from a rate table or a live carrier call. Shopify's carrier service callback shows how tight that call is: it times out after 10 seconds below 1,500 requests a minute, 5 seconds up to 3,000 and 3 seconds above, with "no retry mechanism," falls back to backup rates on a timeout or error, and caches a successful response for 15 minutes. The quote shown to the customer belongs to [Cart & Checkout](/books/commerce/cart-and-checkout#shipping-options) (`shipping_quotes`); the rate bought for the label is this chapter's (`rate_quotes`), and the gap between them is the merchant's shipping margin or loss on the order.

## Dimensional Weight

Carriers fill trucks by volume as much as by weight, so a light, bulky box is billed as if it weighed what its size implies. All three national carriers use the same arithmetic as of October 2026:

```text
dimensional weight (lb) = ceil(L) x ceil(W) x ceil(H) / 139, rounded up to the next pound
```

with three differences that matter:

| Carrier | When it applies | Rounding of dimensions | Divisor |
| --- | --- | --- | --- |
| **USPS** (Priority Mail, Ground Advantage, Priority Mail Express, Parcel Select) | Only above 1 cubic foot (1,728 cubic inches), zones 1 to 9 | Rounded up to the whole inch since July 12, 2026 (to the nearest inch before) | 139 for rectangular parcels; nonrectangular parcels multiply by 0.785 and divide by 166 (Parcel Select uses 139 for both) |
| **UPS** (daily rates) | Every package | To the nearest whole number in the 2025 guide | 139 |
| **FedEx** | Every package | Any fraction of an inch rounded up, since August 18, 2025 | 139 (166 for International Deferred Freight) |

Worked through for three boxes:

| Box (inches) | Cubic inches | Actual weight | USPS billable | UPS and FedEx billable |
| --- | --- | --- | --- | --- |
| 12 × 10 × 8 | 960 | 2 lb | 2 lb (under 1 cubic foot, no DIM) | 7 lb (960 / 139 = 6.9) |
| 14 × 12 × 10 | 1,680 | 3 lb | 3 lb (still under 1,728) | 13 lb (1,680 / 139 = 12.1) |
| 16 × 12 × 10 | 1,920 | 3 lb | 14 lb (1,920 / 139 = 13.8) | 14 lb |

The table is why packaging is a software problem. The USPS threshold makes boxes under one cubic foot dramatically cheaper there for light goods; a fraction of an inch rounds up a whole inch on every side; and a WMS that picks the smallest carton that fits (and a catalog with accurate item dimensions) saves more than most rate negotiations. Item weights and dimensions belong on the item, measured, and the packed package's weight and dimensions on the shipment, measured again ([Packaging and Cartonization](/books/commerce/warehouses-and-3pls#inside-a-warehouse)). USPS also caps the effect: if the dimensional weight exceeds 70 pounds, the customer pays the 70-pound price.

## Zones, Surcharges and Rate Changes

Beyond base rates, the surcharges are where parcels get expensive, and each carrier publishes its thresholds:

- **USPS nonstandard fees** apply to parcels longer than 22 inches, longer than 30 inches, or over 2 cubic feet (3,456 cubic inches); only the higher applies when two would. Ground Advantage has an oversized price between 108 and 130 inches length plus girth.
- **FedEx Additional Handling** (2026 Service Guide) applies when the longest side exceeds 48 inches, the second-longest exceeds 30, length plus girth exceeds 105, the volume exceeds 10,368 cubic inches, or the actual weight exceeds 50 pounds; dimension-based packages carry a 40-pound minimum billable weight. The **Oversize Charge** applies above 96 inches long or 130 inches length plus girth.
- **UPS Additional Handling** applies above 50 pounds or 105 inches length plus girth, among other criteria, and is not charged when a **Large Package Surcharge** applies (over 130 inches length plus girth or 96 inches long, with a 90-pound minimum billable weight) in its 2025 guide.
- **Residential and delivery area surcharges** apply by address, which is why address classification belongs in rate shopping ([Validate](/docs/fundamentals/addresses#validate)).

**Rates change on a calendar.** The Postal Service raised its shipping prices on January 18, 2026 (Priority Mail Express by 5.1% overall, Priority Mail 6.6%, Ground Advantage 7.8% and Parcel Select Destination Entry by an average 6.0%), then on July 12, 2026 changed the dimensional weight divisor and rounding, ended ounce-based price differences for published commercial Ground Advantage prices and added hazardous materials handling fees. FedEx's 2026 list rates took effect January 5, 2026. UPS's and FedEx's average increases for 2026 are reported only in secondary sources. <!-- source-gap: ups-fedex-2026-gri | secondary | UPS and FedEx 2026 general rate increase averages (5.9% each, reported by shipping consultancies) and the UPS effective date | closes with: the UPS 2026 rate change page or Rate and Service Guide, and a FedEx newsroom or rate change page stating the average; ups.com refused automated fetches | checked: 2026-10-28 --> Rate tables are therefore versioned data with effective dates, never constants in code, and a quote records which table it used.

## Carrier APIs

A merchant integrates with carriers directly, through a multi-carrier platform, or through its 3PL. Direct integration buys control and saves the platform's fee; it also buys every carrier's migrations:

- **USPS** retired its Web Tools API platform on January 25, 2026, replacing it with the USPS APIs, which use the OAuth 2.0 client credentials grant.
- **UPS** publishes its APIs as OpenAPI specifications using OAuth 2.0 client credentials, with a separate customer integration environment for testing.
- **FedEx** announced on January 30, 2026 that FedEx Web Services would retire, with integrations required to move to its REST APIs by March 31, 2026 for compatible providers and June 1, 2026 for customers; its OAuth tokens expire after one hour.

The integration rules are the playbook's: cache tokens until shortly before expiry, set a timeout on every call and treat a timeout on a label purchase as unknown rather than failed, because the label may have been created and billed ([Every Call Has a Timeout](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout)); make label purchases idempotent with the shipment's ID as the key, so a retry returns the same label ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)); and respect each API's rate limits with backoff ([Handling a 429](/docs/requests/rate-limiting#handling-a-429)).

A label through EasyPost is two calls: create a shipment (which returns rates) and buy one of them.

```shell
# 1. Create the shipment; the response lists rates by carrier and service
curl -s https://api.easypost.com/v2/shipments \
  -u "$EASYPOST_API_KEY:" \
  -H 'Content-Type: application/json' \
  -d '{
    "shipment": {
      "from_address": {"name": "Warehouse 2", "street1": "...", "city": "Reno",
                       "state": "NV", "zip": "89502", "country": "US"},
      "to_address":   {"name": "...", "street1": "...", "city": "Memphis",
                       "state": "TN", "zip": "38103", "country": "US"},
      "parcel": {"length": 12, "width": 10, "height": 8, "weight": 32},
      "options": {"label_format": "ZPL", "label_size": "4x6"},
      "reference": "fulfillment_0192f1c4"
    }
  }'

# 2. Buy the chosen rate; the response has tracking_code and postage_label
curl -s https://api.easypost.com/v2/shipments/shp_.../buy \
  -u "$EASYPOST_API_KEY:" \
  -H 'Content-Type: application/json' \
  -d '{"rate": {"id": "rate_..."}}'
```

EasyPost's parcel weights are in ounces and dimensions in inches, and a ZPL or PNG label comes in 4×6; the response's `postage_label` carries URLs for the PNG default and the PDF, ZPL or EPL2 renderings.

## Labels

A shipping label is a barcode the carrier scans, an address it reads, and data it already received electronically. The formats:

- **4×6 thermal** labels in ZPL (Zebra) or EPL2 (Eltron), printed on a direct thermal printer at the pack station; the warehouse default. FedEx's Ship API offers EPL2 and ZPLII for thermal, and stock sizes from 4×6 to 4×9.
- **PDF or PNG** for laser printers and small shippers; EasyPost's default label image is PNG.
- **The barcode.** USPS requires an Intelligent Mail package barcode (IMpb), which "generally follows the GS1-128 specification," on all commercial packages, and requires the mailer to transmit piece-level data in an approved electronic file, specified in Publication 199. USPS measures shippers against quality thresholds for address, manifest, barcode and hazmat data and charges a noncompliance fee below them.

**Manifests and pickup.** The label is not the end of the transaction: the carrier needs the day's packages tendered and, for most services, an electronic manifest. USPS's electronic file is part of IMpb compliance; UPS offers scheduled daily pickups and on-call pickups billed per request regardless of package count. A label bought and never tendered is a cost to void or refund, on whatever window the carrier or platform allows, so unshipped labels at end of day are an exception report.

**Hazmat.** Lithium batteries, aerosols, pesticides and other hazardous materials need the right service, marks and data on the label, and USPS added hazmat handling fees in July 2026; [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat#hazmat-shipping) covers what may ship and how.

## Tracking Events

A tracking number produces a stream of scans: label created, accepted, departed facility, arrived, out for delivery, delivered, or one of many exceptions. Each carrier has its own vocabulary (UPS describes an activity status type; FedEx's Track API reports delay detail as on time, early or delayed and offers notifications on tender, exception, estimated delivery and delivery), and every multi-carrier platform normalizes them. A merchant's own system should store both: the carrier's raw event and a normalized status.

A workable normalized set, matching EasyPost's and Shippo's:

| Status | Meaning | Customer message |
| --- | --- | --- |
| `pre_transit` | Label created, not yet scanned by the carrier | "Your order is packed" (not "shipped") |
| `in_transit` | Accepted and moving | Shipped, with the expected date |
| `out_for_delivery` | On the vehicle today | Arriving today |
| `available_for_pickup` | Held at a facility, locker or counter | Ready to collect |
| `delivered` | The carrier recorded delivery | Delivered, with the place if given |
| `exception` | Delayed, damaged, address problem, attempted, held | Specific to the substatus |
| `return_to_sender` | Coming back | Contact the customer before it arrives |
| `failure` | Lost, destroyed, undeliverable | Start a claim and a replacement |

Rules for consuming them:

- **Events arrive late, twice and out of order.** Order by the carrier's event time, deduplicate by carrier, tracking number, event code and time, and never let an older event overwrite a newer status ([Ordering](/docs/architecture/events#ordering)).
- **`pre_transit` isn't shipped.** A label bought and not scanned is the most common source of "it says shipped but never moved." Many merchants send the shipping confirmation at purchase; better ones say "packed" and send "shipped" at the first carrier scan, and measure label-to-first-scan time per location as an SLA ([SLAs and What They Measure](/books/commerce/warehouses-and-3pls#slas-and-what-they-measure)).
- **Delivered is a claim.** The carrier's delivered scan is its statement, not proof the customer has the parcel. Proof (photos, GPS, signatures) and what to do when nobody signs are the Field Operations volume's subject ([Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)), and missing-parcel claims are covered in [Customer Service](/books/commerce/customer-service#wismo-and-self-service) and [Commerce Fraud & Abuse](/books/commerce/commerce-fraud#refund-and-return-fraud).
- **Stalled is an event too.** A package with no scan for several days on a service that normally scans daily is an exception the carrier won't send; a job that looks for silence catches it.
- **Tracking feeds the channel.** Marketplaces measure valid tracking (Walmart's standard is 99% or higher) and on-time delivery from these events, so the tracking number and carrier name must reach the channel exactly as the carrier issued them.

## Delivery Promises

A delivery promise is a date (or a window) shown before purchase, and it is a sum:

```text
promised date = order time
              + handling (to the location's cutoff, then business days to ship)
              + transit (carrier, service, lane, at a chosen percentile)
              + buffer
```

Each term has a source in this part of the volume: handling from the location's cutoff and ship SLA ([SLAs and What They Measure](/books/commerce/warehouses-and-3pls#slas-and-what-they-measure)), the location from sourcing, availability from [Available to Promise](/books/commerce/inventory#available-to-promise), and transit from the carrier's published estimate or a percentile from history or SmartRate. Channels compute promises the same way from settings the merchant gives them: Google Merchant Center takes an order cutoff time, minimum and maximum handling time (0 for same day) and transit times, and "uses the maximum handling and delivery range" when it shows a date. Amazon's Buy with Prime lets a merchant's own site show "the promise of free delivery, at the speed of Prime," with Amazon fulfilling.

Three things make a promise trustworthy:

- **Carrier estimates aren't guarantees.** USPS describes Priority Mail's 2 to 3 days as an estimate; FedEx's money-back guarantee "can be suspended, modified, or revoked at our sole discretion without prior notice" and treats delivery 60 seconds after the commitment as a failure. A merchant's promise has to be built from its own measured transit, not the carrier's best case.
- **The promise is stored with the order.** The date shown, how it was computed (location, service, percentile) and when, so a late delivery can be credited, the promise model evaluated, and a complaint answered ([Order Management](/books/commerce/order-management#how-to-build-it) keeps `ship_by` and `deliver_by` on the order; [Consumer Protection Online](/books/commerce/online-consumer-protection#how-to-build-it) keeps the record of what was shown).
- **The law reads the promise.** Under the FTC's Mail, Internet, or Telephone Order Merchandise Rule a seller must have "a reasonable basis to expect" to ship in the time it states, and must offer the delay-or-cancel option when it can't ([Edits and Cancellations](/books/commerce/order-management#edits-and-cancellations)). The rule is about shipping, not delivery, but a delivery date shown at checkout implies a ship date, and a promise engine with a measured basis is the reasonable basis.

## Carrier Liability and Claims

Carriers limit what they pay for loss and damage. UPS's liability "is limited to $100.00 without a declaration of value," and FedEx limits its liability per package to US$100 unless a higher value is declared and paid for; USPS includes insurance up to $100 with Ground Advantage and Priority Mail. Above that, a merchant declares value (priced per $100), buys third-party shipping insurance, or self-insures and replaces lost orders from margin. The system needs the declared value and insurance on the package, the claim and its outcome on the shipment, and a rule for which items get coverage (by value, category or destination), because a claim is filed against the specific package with its tracking history as evidence.

## How to Build It

The core `shipments` row is a parcel in a carrier's hands with a tracking number. Shipping adds the accounts it's bought through, the rates it was chosen from, the physical package, and the tracking stream:

```sql
CREATE TABLE carrier_accounts (          -- each account a label can be bought on
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID NOT NULL REFERENCES merchants (id),
  connected_system_id UUID REFERENCES connected_systems (id),  -- direct, EasyPost, Shippo
  carrier             TEXT NOT NULL,     -- 'usps', 'ups', 'fedex', 'ontrac', ...
  account_ref         TEXT NOT NULL,     -- the carrier account number or platform ID
  ownership           TEXT NOT NULL CHECK (ownership IN ('merchant', 'platform_provided',
                        '3pl_provided')),
  rate_table          TEXT NOT NULL,     -- 'daily', 'retail', 'commercial', a contract ID
  origin_location_ids UUID[] NOT NULL DEFAULT '{}',  -- empty: every location
  status              TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
  UNIQUE (merchant_id, carrier, account_ref)
);

CREATE TABLE packages (                  -- the physical box, as packed and measured
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  fulfillment_id  UUID NOT NULL REFERENCES fulfillments (id),
  carton_type     TEXT,                  -- the box chosen at pack, e.g. 'B12x10x8'
  length_in       NUMERIC(6, 2) NOT NULL,  -- as measured, before carrier rounding
  width_in        NUMERIC(6, 2) NOT NULL,
  height_in       NUMERIC(6, 2) NOT NULL,
  weight_oz       NUMERIC(8, 2) NOT NULL,
  declared_value  BIGINT,                -- minor units; null: the carrier's default
  insured_by      TEXT CHECK (insured_by IN ('carrier', 'third_party', 'self')),
  hazmat_class    TEXT,                  -- e.g. lithium batteries; see the hazmat chapter
  contents        JSONB NOT NULL,        -- order line IDs and quantities in this box
  packed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_quotes (               -- every rate considered when buying a label
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  package_id         UUID NOT NULL REFERENCES packages (id),
  carrier_account_id UUID NOT NULL REFERENCES carrier_accounts (id),
  service            TEXT NOT NULL,      -- the carrier's service code
  zone               TEXT,
  billable_weight_lb INT NOT NULL,       -- max(actual, dimensional), as the carrier computed
  dim_divisor        SMALLINT,           -- 139, 166; null when DIM didn't apply
  base_amount        BIGINT NOT NULL,    -- minor units
  surcharges         JSONB NOT NULL DEFAULT '[]',  -- [{"kind": "residential", "amount": 610}]
  total_amount       BIGINT NOT NULL,
  currency           CHAR(3) NOT NULL,
  est_delivery_date  DATE,
  transit_percentile SMALLINT,           -- e.g. 90, when the estimate is a percentile
  meets_promise      BOOLEAN,
  rate_table_version TEXT NOT NULL,      -- which published or contract table priced it
  provider_rate_ref  TEXT,               -- the platform's rate ID, for buying
  quoted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ
);

ALTER TABLE shipments
  ADD COLUMN package_id         UUID REFERENCES packages (id),
  ADD COLUMN carrier_account_id UUID REFERENCES carrier_accounts (id),
  ADD COLUMN rate_quote_id      UUID REFERENCES rate_quotes (id),  -- the rate bought
  ADD COLUMN label_cost         BIGINT,       -- as billed at purchase
  ADD COLUMN adjusted_cost      BIGINT,       -- after the carrier's audit, if it re-billed
  ADD COLUMN label_format       TEXT CHECK (label_format IN ('zpl', 'epl2', 'pdf', 'png')),
  ADD COLUMN label_ref          TEXT,         -- object storage key for the label as issued
  ADD COLUMN normalized_status  TEXT CHECK (normalized_status IN ('pre_transit',
                                  'in_transit', 'out_for_delivery', 'available_for_pickup',
                                  'delivered', 'exception', 'return_to_sender', 'failure')),
  ADD COLUMN est_delivery_date  DATE,         -- the carrier's latest estimate
  ADD COLUMN first_scan_at      TIMESTAMPTZ,
  ADD COLUMN voided_at          TIMESTAMPTZ,  -- label voided before tender
  ADD COLUMN purchase_key       TEXT UNIQUE;  -- idempotency key for the label purchase

CREATE TABLE tracking_events (           -- the carrier's scans, raw and normalized
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id      UUID NOT NULL REFERENCES shipments (id),
  carrier_code     TEXT NOT NULL,        -- the carrier's own event or status code
  carrier_message  TEXT,
  normalized       TEXT NOT NULL,        -- the statuses above
  status_detail    TEXT,                 -- e.g. 'delivery_attempted', 'address_issue'
  location         JSONB,                -- city, state, postal code, country as given
  occurred_at      TIMESTAMPTZ NOT NULL, -- the carrier's event time
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source           TEXT NOT NULL,        -- 'carrier_webhook', 'easypost', 'poll'
  UNIQUE (shipment_id, carrier_code, occurred_at)
);

CREATE INDEX tracking_events_shipment ON tracking_events (shipment_id, occurred_at);
```

The shipment's status moves only forward in event time:

```sql
UPDATE shipments s
SET normalized_status = e.normalized,
    status = CASE e.normalized
               WHEN 'delivered' THEN 'delivered'
               WHEN 'return_to_sender' THEN 'returned_to_sender'
               WHEN 'exception' THEN 'exception'
               WHEN 'failure' THEN 'exception'
               WHEN 'pre_transit' THEN 'label_created'
               ELSE 'in_transit' END,
    delivered_at = CASE WHEN e.normalized = 'delivered' THEN e.occurred_at
                        ELSE s.delivered_at END
FROM tracking_events e
WHERE e.id = $event_id AND s.id = e.shipment_id
  AND e.occurred_at >= (SELECT MAX(occurred_at) FROM tracking_events
                        WHERE shipment_id = s.id);
```

Design notes:

- **Packages are measured, rates are computed.** `packages` keeps the measured dimensions and weight; `rate_quotes` keeps what each carrier made of them (billable weight, divisor, surcharges). When a carrier re-bills after its own measurement, the difference between `label_cost` and `adjusted_cost` points at either the box or the catalog's dimensions.
- **Every considered rate is kept.** Rate shopping's choice is auditable only with the rates it didn't pick; `meets_promise` and `transit_percentile` record why the cheapest wasn't always chosen.
- **Rate tables have versions.** `rate_table_version` ties a quote to the published or contract table in force, which changes every January, every USPS price change and weekly for fuel ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Label purchase is idempotent.** `purchase_key` is derived from the package, so a retry after a timeout finds the label already bought instead of buying another.
- **Labels are kept as issued.** The label image or ZPL in object storage is evidence for a claim or a carrier audit, like any document ([Documents Are Kept as Exchanged](/books/commerce/commerce-business#the-core-data-model)).
- **Raw and normalized side by side.** `tracking_events` keeps the carrier's code and message with the normalized status, so a mapping mistake can be fixed and replayed, and the core `shipments.status` stays the coarse state the rest of the volume reads.
- **One package, one shipment.** A fulfillment that needs two boxes has two packages and two shipments, each with its own tracking; a multi-piece shipment under one master tracking number is still one package row per box.

## Auditing

- **Every rate considered and bought.** Account, service, zone, billable weight, divisor, surcharges and the rate table version, with the reason the chosen one won.
- **Every label.** As issued, with its cost at purchase, any carrier adjustment, voids and refunds.
- **Every package as measured.** Dimensions, weight, declared value and contents, the evidence in a dimensional-weight dispute or a claim.
- **Every tracking event.** Raw and normalized, with event and receipt times and the source, so a late-delivery credit or a marketplace's tracking metric can be checked.
- **Every promise.** The date shown at checkout and how it was computed, against the delivered date.

## What This Means for the System You Build

- **Rate shop as a filter and a minimum:** services that meet the promise at a chosen confidence, then the cheapest, across accounts as well as carriers.
- **Compute billable weight per carrier** with each one's divisor, threshold and rounding, and keep measured dimensions on items and packages.
- **Version rate tables and surcharges** with effective dates; they change every January, at USPS price changes and weekly for fuel.
- **Integrate carriers through one layer,** your own or a multi-carrier platform, with idempotent label purchases and tokens and timeouts handled as the playbook says.
- **Keep checkout quotes and label rates apart,** and measure the gap.
- **Store tracking raw and normalized,** order by event time, and treat silence as an exception.
- **Don't call it shipped before the first scan.**
- **Build delivery promises from your own measured handling and transit,** store them on the order, and give the law a reasonable basis.
- **Record declared value and coverage per package** and file claims with the tracking history.
- **Link Field Operations for your own fleet:** routes, proof and failed attempts live there.

## References

**Carrier rules and prices**

- [USPS Domestic Mail Manual 223: Priority Mail](https://pe.usps.com/text/dmm300/223.htm), dimensional weight over 1 cubic foot, divisor 139 and rounding up from July 12, 2026, the 0.785 factor and 166 for nonrectangular parcels, the 70-pound cap and nonstandard fees
- [USPS Domestic Mail Manual 283: USPS Ground Advantage](https://pe.usps.com/text/dmm300/283.htm), dimensional weight and the oversized price above 108 inches
- [USPS Domestic Mail Manual 253: Parcel Select](https://pe.usps.com/text/dmm300/253.htm), the 139 divisor for both shapes
- [USPS Domestic Mail Manual archive, October 5, 2025: 223](https://pe.usps.com/Archive/PDF/DMMArchive20251005/223.pdf), the 166 divisor and rounding to the nearest inch before the change
- [Federal Register: Domestic Competitive Products Pricing and Mailing Standards Changes (May 15, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-05-15/html/2026-09785.htm), the DIM factor change to 139 and rounding up, effective July 12, 2026
- [Federal Register: Domestic Competitive Products Pricing changes (November 20, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-20/html/2025-20442.htm), the January 18, 2026 increases by product
- [USPS: Competitive price changes for July 2026 (May 11, 2026)](https://about.usps.com/newsroom/national-releases/2026/0511-usps-recommends-competitive-price-changes-for-july-2026.htm), ending ounce-based commercial Ground Advantage prices, the DIM alignment and hazmat fees
- [USPS: Ground Advantage](https://www.usps.com/ship/ground-advantage.htm), 70 lb, 130 inches, $100 insurance and 2 to 5 days
- [USPS: Priority Mail](https://www.usps.com/ship/priority-mail.htm), 2 to 3 day estimate, 108 inches and up to $100 insurance
- [USPS Domestic Mail Manual 204: Barcode standards](https://pe.usps.com/text/dmm300/204.htm), IMpb on commercial packages, GS1-128, electronic files and quality thresholds
- [USPS PostalPro: Intelligent Mail package barcode](https://postalpro.usps.com/shipping/impb), IMpb and Publication 199
- [FedEx: 2026 Service Guide](https://www.fedex.com/content/dam/fedex/us-united-states/services/Service_Guide_2026.pdf), effective January 5, 2026: the 139 divisor and rounding, Additional Handling, Oversize and unauthorized package thresholds, delivery area surcharges, $100 liability and the money-back guarantee terms
- [FedEx: Fuel surcharge](https://www.fedex.com/en-us/shipping/fuel-surcharge.html), weekly adjustment and the diesel and jet fuel indexes
- [UPS: Rate and Service Guide, daily rates (2025)](https://www.ups.com/assets/resources/webcontent/en_US/daily_rates.pdf), the 139 divisor, dimension rounding, Additional Handling, Large Package, maximum limits, $100 liability, Ground Saver and pickup options

**Carrier APIs**

- [USPS: Web Tools APIs](https://www.usps.com/business/web-tools-apis/welcome.htm), the retirement on January 25, 2026
- [USPS: API examples](https://github.com/USPS/api-examples), OAuth 2.0 client credentials for the USPS APIs
- [UPS: API documentation (Tracking OpenAPI)](https://raw.githubusercontent.com/UPS-API/api-documentation/main/Tracking.yaml), OAuth 2.0 client credentials and the activity status type
- [FedEx Developer: Migrate to FedEx APIs (January 30, 2026)](https://developer.fedex.com/api/en-bb/announcements/Migrate_to_FedEx_APIs_Act_Now.html), the Web Services retirement deadlines
- [FedEx Developer: Authorization](https://developer.fedex.com/api/en-us/catalog/authorization/docs.html), client credentials and one-hour tokens
- [FedEx Developer: Ship API](https://developer.fedex.com/api/en-us/catalog/ship/v1/docs.html), label formats and stock sizes
- [FedEx Developer: Track API](https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html), delay detail and notification events

**Multi-carrier platforms**

- [EasyPost: Shipments](https://docs.easypost.com/docs/shipments), creating shipments, rates, buying and label formats
- [EasyPost: Parcels](https://docs.easypost.com/docs/parcels), weights in ounces and dimensions in inches
- [EasyPost: Shipment options](https://docs.easypost.com/docs/shipments/options), label formats and sizes
- [EasyPost: Trackers](https://docs.easypost.com/docs/trackers), tracking statuses and status details
- [EasyPost: SmartRate](https://docs.easypost.com/docs/smartrate), time-in-transit percentiles
- [EasyPost: Pricing](https://www.easypost.com/pricing), free labels with provided accounts and the fee for your own accounts
- [Shippo: Tracking](https://docs.goshippo.com/docs/tracking/tracking/), statuses and substatuses
- [Shippo: Pricing](https://goshippo.com/pricing), Starter and Pro plans
- [ShipStation: Pricing](https://www.shipstation.com/pricing/), plan prices and no per-label fee
- [ShipStation: API documentation](https://docs.shipstation.com/), rates, labels, manifests and tracking webhooks
- [Shopify Help Center: Shopify Shipping](https://help.shopify.com/en/manual/fulfillment/shopify-shipping), label discounts by plan
- [Shopify: DeliveryCarrierService](https://shopify.dev/docs/api/admin-graphql/latest/objects/DeliveryCarrierService), callback timeouts, no retries, backup rates, caching and plan requirements

**Regional and alternative carriers**

- [OnTrac](https://www.ontrac.com/), its alternative carrier network
- [GLS US](https://gls-group.com/US/en/home/), Western US service
- [LSO](https://www.lso.com/), Texas, Oklahoma and nearby metros
- [Veho](https://shipveho.com/), crowdsourced next-day and two-day delivery
- [UniUni](https://www.uniuni.com/), its US coverage
- [Amazon Shipping](https://shipping.amazon.com/), 2 to 5 day ground and seven-day service

**Delivery promises and regulation**

- [Google Merchant Center Help: Set up handling and transit times](https://support.google.com/merchants/answer/7050921), cutoffs, handling and transit times and the maximum range
- [Buy with Prime](https://buywithprime.amazon.com/), Prime delivery on a merchant's own site
- [eCFR: 16 CFR Part 435, Mail, Internet, or Telephone Order Merchandise](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435), reasonable basis and the delay option
- [Walmart Marketplace: Seller performance standards (updated July 28, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Seller%20performance/Seller-performance-standards), the valid tracking standard
