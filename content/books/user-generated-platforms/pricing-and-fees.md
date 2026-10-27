+++
title = "Pricing, Fees & All-In Prices"
description = "Host pricing and dynamic recommendations, marketplace fee models, usage charges, split payments, the FTC fees rule and drip pricing, and facilitator tax."
category = "User-Generated Platforms Industry"
order = 1827
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "pricing", "fees", "all-in-pricing", "sales-tax"]
+++

On a marketplace, three parties set parts of the price. The host sets a nightly or daily rate, discounts, cleaning and delivery fees and add-on prices; the platform sets its own fees (to the guest, the host or both), the price of protection and any deposit waiver; and governments set taxes the platform increasingly collects itself. The guest sees one number, or is supposed to: US federal law now requires the all-in price for short-term lodging, California requires it for nearly everything, and the claim that a marketplace showed a low base price and added mandatory fees at checkout is the drip-pricing complaint behind recent arbitration campaigns. Meanwhile usage charges (extra miles, generator hours, late return) can't be known until the trip ends.

The engineering problem is to compute a quote from all of those sources once, freeze it as lines that say who pays each one, who earns it, whether it's mandatory and whether it's refundable, show the right total under the rules where the listing and the guest are, collect it on a schedule, and add post-trip charges later without rewriting what was agreed. This chapter covers host pricing and dynamic recommendations, fee models across the industry, usage charges, promotions, payment schedules and the merchant-of-record question, all-in price law, and marketplace facilitator tax. It extends `listings` and `bookings` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Nightly pricing tools from the host's side are in the Property Tech volume's [Nightly Pricing](/books/property-tech/short-term-rentals#nightly-pricing); how fees move in a payments platform is [Payments for Software Platforms](/books/payments/software-platforms#where-the-money-goes); the take rate as a business strategy is Monetization Strategies.

## How the Platforms Do It

| Platform | Guest pays the platform | Host or seller pays the platform | Other published charges |
| --- | --- | --- | --- |
| **Airbnb** | Nothing under the host-only fee; 14.1% to 16.5% under the legacy split | Host-only fee of 15.5% for most hosts (14% to 16%; 16% in Brazil and Mexico), mandatory for hosts connected through software and for hotels; about 3% under the legacy split | Services 15% (minimum $6), experiences 20% |
| **Outdoorsy** | 10% service fee on the booking total, excluding protection and taxes | 20% to 25% of the booking subtotal (rental, cleaning, delivery, add-ons), starting at 25% and falling with revenue; minimum $15 a night drivable, $10 towable | 6.5% host fee and no guest fee when the host refers a new guest; prep fee; young-driver fee in protection |
| **RVshare** | Service fee as a percentage of the reservation; a mandatory non-refundable screening fee | Not published | Mileage, generator and delivery set per listing |
| **Turo** | Trip fee and protection plan | Host keeps 70%, 80% or 90% of the trip price, depending on the plan chosen (US, from January 7, 2026) | Turo Risk Score adjusts guest fees |
| **Etsy** | Nothing to Etsy directly | $0.20 listing fee per four-month listing; 6.5% transaction fee on item, shipping and gift wrap; payment processing by country; offsite ads 15% (12% above $10,000 trailing sales), capped at $100 an order | 2.5% currency conversion |
| **eBay** | Nothing to eBay directly | Final value fee of 13.6% up to $7,500 per item plus 2.35% above, plus $0.30 per order ($0.40 over $10), on the total including shipping and sales tax; 250 free listings a month, then $0.35 | +6% for below-standard sellers; 1.65% international fee |
| **Vinted** | A mandatory buyer protection fee, typically 3% to 8% plus GBP 0.30 to 0.80 | Nothing for non-professional sellers | |
| **Depop** | A buyer marketplace fee | No US selling fee since July 2024; payment processing kept | |

Four patterns:

- **Fees migrate from guest to host.** Airbnb is moving home hosts to a single host-only fee; Depop moved its US fee from seller to buyer the other way. Who pays decides what the guest sees as the price, and the move changes every listing's displayed total at once.
- **Fees are tiered and floored.** Outdoorsy's host fee falls with revenue and has nightly minimums; eBay's rate falls above $7,500 and rises for poor performance. A fee is a schedule, not a percentage.
- **Fees reward channel behavior.** Outdoorsy cuts its fee to 6.5% for guests the host brings; Etsy's offsite ads fee becomes mandatory above a sales threshold. Program terms, versioned, decide the line.
- **Protection is priced in the fee structure.** Turo's host plans trade the host's share for damage responsibility; Vinted's buyer fee funds its protection. [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection) covers the products.

## Host Pricing

The host sets a base price and adjusts it: seasonal and date overrides, weekend rates, length-of-stay discounts, early-booking and last-minute adjustments, and custom quotes for one guest. The model is the Property Tech one ([Nightly Pricing](/books/property-tech/short-term-rentals#nightly-pricing)): current prices are overwritten as hosts and tools change them, and the price a guest pays is computed once and frozen.

Vehicle rentals add rules that stays don't have: price per day rather than per night (with hourly pricing on short car trips), different prices for delivered and driven trips, mileage allowances, and young-driver fees that belong to the protection product rather than the host.

### Dynamic Recommendations

Platforms offer pricing tools, usually opt-in, that set or suggest prices within host-set bounds. Outdoorsy's Smart Pricing is documented in detail: it uses geography, seasonality and vehicle attributes, compares like with like through a composite listing-quality score (review count and rating, image count, sleeping capacity and vehicle year), works within the host's minimum and maximum, never recommends a price decrease for today, and never changes confirmed bookings.

The design points that generalize:

- **Bounds belong to the host.** The tool sets prices only inside a minimum and maximum the host chose, and the host can override any date.
- **Recommendations are records.** Each suggestion is stored with the model version, its inputs and whether it was applied automatically, accepted or ignored, so a host who asks why a weekend sold cheap gets an answer, and the platform can measure the tool.
- **Confirmed bookings are untouchable.** A price change affects future quotes only, because the quote is frozen on the booking.
- **Pooled data has antitrust risk.** Pricing from competitors' prices and occupancy is the pattern that drew scrutiny in housing ([The Antitrust Record, as of October 2026](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026)); the same questions apply when a marketplace recommends prices to competing hosts from the data of all of them.

## Fee Models

A marketplace fee model answers four questions, and the answers are data, versioned as program terms, never constants:

1. **Who pays:** guest, host or both, and in what split.
2. **On what base:** rental only; rental plus cleaning, delivery and add-ons (Outdoorsy's host fee base); item plus shipping and gift wrap (Etsy); everything including sales tax (eBay); the booking total excluding protection and taxes (Outdoorsy's guest fee).
3. **At what rate:** flat, tiered by the host's revenue or the item's price, with floors per night or per order, caps per order, and surcharges for performance.
4. **Under which program:** standard, referral (the host brought the guest), promotional, or a negotiated rate for professional hosts and hotels.

The Payments volume's [Pricing Per Merchant](/books/payments/software-platforms#pricing-per-merchant) covers fee schedules and overrides for payment fees; marketplace fees use the same discipline: a fee program is versioned with an effective range, a host's applicable program is resolved at booking time, and the booking keeps the program version it was priced under, so a later fee change never reprices an existing booking ([Changing Prices Without Losing the Record](/books/payments/software-platforms#changing-prices-without-losing-the-record)).

### Merchant of Record and the Money Path

Whose name is on the card statement, who refunds and who absorbs a chargeback depend on the marketplace's payment model ([Who Pays the Fee](/books/payments/software-platforms#who-pays-the-fee); [Four Ways In](/books/payments/software-platforms#four-ways-in)). Outdoorsy's terms describe it as a limited payment collection agent for the host; Airbnb runs licensed payment entities (a US money transmitter, an EEA payment institution, a UK e-money institution and a Canadian payment service provider) and holds guest funds until check-in, which is when it recognizes its revenue. The model affects pricing in two places: the fee lines are earned by different parties (a collection agent's host fee is a deduction from the host's payout; a guest fee is the platform's revenue at once or on recognition), and taxes follow whoever the law treats as the seller or facilitator.

Multi-currency is the other money-path decision. Airbnb integrated payments in about 50 currencies and added more than 20 local payment methods (Pix, UPI, M-Pesa, Blik and others) in about 14 months, with a payment-method configuration shared by its backend and frontend. Prices are set in the listing's currency, quoted in the guest's, and the conversion rate used is frozen on the booking like every other line ([Multi-Currency](/docs/payments/multi-currency)).

## Usage Charges

Some prices can't be known until the trip ends: miles driven, generator hours, fuel not replaced, late return, tolls, extra cleaning. The listing sets the rates (an included allowance per day or night and a price per unit beyond it), the handoff records the readings, and the charge is computed after return.

Outdoorsy's published flow shows the shape: the host records start and end odometer and generator readings with photos in the app, the system computes the overage, the host chooses whether to charge, the host has seven days after the trip ends to collect, and overages are no longer taken from the security deposit. RVshare lists mileage and generator allowances and rates per listing. Turo hosts send post-trip incidental invoices within windows that depend on their plan.

My rules for usage charges:

- **Rates are frozen at booking, readings are evidence.** The booking keeps the allowance and the per-unit rate as quoted; the handoff keeps the readings and their photos ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims)). The charge is a computation over both, reproducible later.
- **They're post-trip lines, not edits.** A usage charge adds a line to the booking with its own payment, never a change to the original total, so the original quote and the final amount are both on the record.
- **They have a deadline.** The window to charge is a stored deadline; after it passes, the line can't be created.
- **They're not mandatory fees for display purposes.** The FTC rule and California's law both let charges that depend on later conduct (damage, late return) stay out of the advertised price; the allowance and rate still have to be disclosed before booking.

## Promotions

Discounts come from two funders, and the funder decides whose earnings they reduce. Outdoorsy's discount for military and first responders is funded by Outdoorsy, verified through a third party, applies only to the subtotal (not service fees, protection or taxes), and allows one code per booking. A host's own weekly discount reduces the host's earnings. The design: every promotion line records its funder, the base it applies to and the stacking rule, so the host's payout, the platform's revenue and the tax base each see the right amount.

## Payment Schedules

Rentals booked far ahead are often paid in two parts. Outdoorsy charges trips 30 days or less away in full; further out, the guest may pay a reservation deposit of 50% of the trip cost plus all of the service fee, trip protection and taxes, with the remaining 50% charged automatically 30 days before departure (PayPal users pay in full). RVshare allows split payment for trips more than 30 days out, unless the owner requires payment in full, with insurance and protection due at booking.

A split schedule is a set of installments with due dates, each a payment against the booking, and the second one can fail. The schedule says what happens then: retries, notice to the guest, a deadline after which the booking is cancelled under the policy that applies. The balance charge is merchant-initiated against a stored card, with the consent recorded at booking ([Stored Credentials](/books/payments/stored-credentials)).

## All-In Prices

Two regimes now govern how marketplaces show prices in the US, and they reach different marketplaces:

**The FTC Rule on Unfair or Deceptive Fees** (16 CFR Part 464), effective May 12, 2025, covers live-event tickets and short-term lodging, which includes vacation rentals and platform home shares. The FTC's guidance:

- The total price, including all mandatory fees the business knows and can calculate, is shown upfront and more prominently than other pricing information (except the final payment amount). Itemizing is allowed if it doesn't overshadow the total.
- Only government charges, shipping charges and optional goods or services may be left out, and they must be disclosed before payment, with the final amount shown as prominently as the total.
- A mandatory cleaning fee for a vacation rental is part of the total price.
- Online marketplaces must pass accurate pricing information, and a platform that displays prices must show the total price.
- Charges incurred after purchase can be left out only if they couldn't be known at purchase or aren't part of the same transaction; damage to a room is the FTC's example.

The rule doesn't reach RV, car or goods marketplaces, which face state law instead.

**California's Honest Pricing Law** (SB 478, Civil Code section 1770(a)(29)), effective July 1, 2024, makes it unlawful for most businesses to advertise or list a price that leaves out mandatory fees or charges, other than government taxes and fees and reasonable shipping costs. The Attorney General's guidance names short-term rentals among covered sectors, says that disclosing a fee at the start and adding it at checkout doesn't comply, and says optional fees and charges that depend on later conduct (a late return fee is its example) don't have to be included. It isn't limited to lodging.

Drip pricing claims follow. A law firm has advertised individual arbitration claims against Outdoorsy alleging that base prices were shown with mandatory fees added at checkout, in violation of state consumer protection laws (an advertisement for claims, not a filed case or finding). The Property Tech volume's [Fee Transparency and All-In Pricing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing) covers the federal and state record and the classification model in more depth.

What the rules do to the quote:

- **Every line is classified.** Mandatory (rental, cleaning or prep, platform service fee, required protection, mandatory screening fee), optional (add-ons, optional protection upgrades, deposit waiver where optional), government (taxes) or contingent (usage, late return, damage). The displayed price is a sum over classes, computed from the lines, never typed separately.
- **The rule applied depends on where.** Listing category, the listing's location and the guest's location select which display rule applies ([Rules as Data](/docs/architecture/rules-as-data)); the strictest applicable one is the safe default.
- **Search shows the total.** A search result, a map pin and a listing page show the price for the requested dates with mandatory fees included, which means pricing is computed for search, not only at checkout ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)).
- **A required protection product is a mandatory fee.** If the guest can't book without one of several protection plans, the cheapest is part of the total.
- **Snapshot what was shown.** The quote shown at each step is recorded, because a drip-pricing claim asks what the guest saw before checkout.

## Marketplace Facilitator Tax

Since states began taxing remote sales after *South Dakota v. Wayfair*, state marketplace facilitator laws have made marketplaces calculate, collect and remit sales tax on third-party sales ([US Economic Nexus](/docs/payments/sales-tax#us-economic-nexus)). For goods the platform becomes the collector: Etsy calculates, collects and remits US sales tax using the seller's listing category, and sellers indemnify Etsy for a miscategorized item.

Rentals are harder because the taxes are different taxes. Outdoorsy collects and remits sales and use, excise, motor vehicle rental and peer-to-peer vehicle sharing taxes in listed jurisdictions, leaves hosts responsible elsewhere (some must still file zero returns), and excludes bookings hosts take through its separate fleet software. Turo's S-1 disputed that it is a car rental company subject to rental-car taxes, said marketplace facilitator laws apply to it only in some cases, and carried an indirect tax reserve of $5.5 million at the end of 2020. Lodging taxes for stays (Airbnb collects and remits occupancy taxes where it has agreements or a legal duty) are the Property Tech volume's [Lodging Taxes](/books/property-tech/short-term-rentals#lodging-taxes).

The design follows the lodging tax model there:

- **Taxes are rules per jurisdiction and product,** effective-dated, with the taxable base by line kind (is the delivery fee taxable? the platform fee? the protection plan?).
- **Who remits is a second rule,** per tax, per jurisdiction, per date: the platform as facilitator, or the host.
- **Every booking gets tax lines,** each marked with its remitter. Platform-remitted tax is the platform's liability to the authority; host-remitted tax is a line the host is responsible for, shown to them for filing.
- **Tax is a quote until the booking finalizes,** and post-trip charges and refunds adjust it ([Tax Is a Quote Until the Invoice Finalizes](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes)). Outdoorsy refunds taxes in proportion to the charges refunded.

Seller tax reporting (1099-K, DAC7) belongs to Paying Creators & Sellers.

## How to Build It

```sql
CREATE TABLE rate_overrides (            -- host or tool prices for specific dates
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id  UUID NOT NULL REFERENCES listings (content_item_id),
  dates       DATERANGE NOT NULL,        -- listing-local dates
  amount      BIGINT NOT NULL CHECK (amount >= 0),  -- per unit, listing currency
  set_by      TEXT NOT NULL CHECK (set_by IN ('host', 'pricing_tool', 'platform')),
  recommendation_id UUID,                -- price_recommendations, when a tool set it
  set_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (listing_id WITH =, dates WITH &&)
);

CREATE TABLE pricing_rules (             -- length-of-stay, weekend, early and last minute
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id  UUID NOT NULL REFERENCES listings (content_item_id),
  kind        TEXT NOT NULL CHECK (kind IN ('length_of_stay', 'weekend', 'early_booking',
                'last_minute', 'delivered_trip')),
  min_length  SMALLINT,
  lead_time   INT4RANGE,                 -- days before start
  percent_bp  INT,                       -- basis points; negative is a discount
  amount      BIGINT,                    -- or a fixed adjustment
  valid_during DATERANGE NOT NULL,
  CHECK (num_nonnulls(percent_bp, amount) = 1)
);

CREATE TABLE price_recommendations (     -- what a pricing tool suggested, and what happened
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id    UUID NOT NULL REFERENCES listings (content_item_id),
  for_date      DATE NOT NULL,
  amount        BIGINT NOT NULL,
  host_min      BIGINT,
  host_max      BIGINT,
  model_version TEXT NOT NULL,
  inputs        JSONB NOT NULL,          -- season, demand, comparable listings' quality bands
  outcome       TEXT NOT NULL CHECK (outcome IN ('auto_applied', 'accepted', 'ignored',
                  'outside_bounds')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listing_add_ons (           -- optional extras and usage rates
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id    UUID NOT NULL REFERENCES listings (content_item_id),
  code          TEXT NOT NULL,           -- from the standardized add-on list
  kind          TEXT NOT NULL CHECK (kind IN ('optional_extra', 'usage_rate',
                  'mandatory_fee')),
  unit          TEXT NOT NULL CHECK (unit IN ('per_trip', 'per_night', 'per_day', 'per_mile',
                  'per_km', 'per_hour', 'per_item')),
  amount        BIGINT NOT NULL CHECK (amount >= 0),
  included_per_day NUMERIC(10,2),        -- free allowance for usage rates
  valid_during  TSTZRANGE NOT NULL,
  UNIQUE (listing_id, code, valid_during)
);

CREATE TABLE fee_programs (              -- marketplace fee terms, versioned
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL,           -- 'stays_host_only', 'rv_standard', 'rv_referral'
  version       INT NOT NULL,
  category      TEXT NOT NULL,           -- listings.category it applies to
  country       CHAR(2),                 -- null: everywhere not overridden
  payer         TEXT NOT NULL CHECK (payer IN ('guest', 'host', 'buyer', 'seller')),
  base          TEXT[] NOT NULL,         -- line kinds in the base
  tiers         JSONB NOT NULL,          -- [{"from": 0, "bp": 2500}, {"from": 1000000, "bp": 2000}]
  minimum       BIGINT,                  -- per unit or per order, with minimum_unit
  minimum_unit  TEXT,
  cap           BIGINT,
  valid_during  TSTZRANGE NOT NULL,
  UNIQUE (code, version),
  EXCLUDE USING GIST (code WITH =, payer WITH =, valid_during WITH &&)
);

CREATE TABLE promotions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT UNIQUE,             -- null for automatic promotions
  funded_by     TEXT NOT NULL CHECK (funded_by IN ('platform', 'host')),
  listing_id    UUID REFERENCES listings (content_item_id),  -- host promotions
  base          TEXT[] NOT NULL,         -- e.g. {'rental'}: subtotal only
  percent_bp    INT,
  amount        BIGINT,
  stacks        BOOLEAN NOT NULL DEFAULT FALSE,
  eligibility   JSONB NOT NULL DEFAULT '{}',  -- e.g. a third-party status verification
  valid_during  TSTZRANGE NOT NULL
);

CREATE TABLE booking_lines (             -- the frozen quote, then post-trip lines
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES bookings (id),
  kind            TEXT NOT NULL CHECK (kind IN ('rental', 'add_on', 'cleaning_or_prep',
                    'delivery', 'guest_service_fee', 'host_service_fee', 'protection',
                    'deposit_waiver', 'screening_fee', 'discount', 'promotion', 'usage',
                    'late_return', 'tax')),
  description     TEXT NOT NULL,
  quantity        NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_amount     BIGINT NOT NULL,
  amount          BIGINT NOT NULL,       -- signed; discounts negative
  currency        CHAR(3) NOT NULL,
  payer           TEXT NOT NULL CHECK (payer IN ('guest', 'host')),
  earner          TEXT NOT NULL CHECK (earner IN ('host', 'platform', 'insurer',
                    'tax_authority')),
  display_class   TEXT NOT NULL CHECK (display_class IN ('mandatory', 'optional',
                    'government', 'contingent')),
  refundable      BOOLEAN NOT NULL,
  phase           TEXT NOT NULL CHECK (phase IN ('quote', 'change', 'post_trip')),
  source_ref      TEXT,                  -- fee program version, add-on, promotion, plan, tax rule
  tax_rule_ref    TEXT,                  -- for tax lines
  remitted_by     TEXT CHECK (remitted_by IN ('platform', 'host')),
  booking_change_id UUID REFERENCES booking_changes (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'tax') = (remitted_by IS NOT NULL)),
  CHECK ((phase = 'change') = (booking_change_id IS NOT NULL))
);

CREATE TABLE payment_schedules (         -- split payments: installments against a booking
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id    UUID NOT NULL REFERENCES bookings (id),
  sequence      SMALLINT NOT NULL,
  due_at        TIMESTAMPTZ NOT NULL,
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  payment_id    UUID REFERENCES payments (id),  -- set when attempted
  status        TEXT NOT NULL CHECK (status IN ('scheduled', 'paid', 'failed', 'waived',
                  'cancelled')),
  UNIQUE (booking_id, sequence)
);

CREATE TABLE price_displays (            -- what the guest was shown, by step
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id    UUID REFERENCES bookings (id),  -- null until a booking exists
  session_ref   TEXT NOT NULL,
  step          TEXT NOT NULL CHECK (step IN ('search', 'listing', 'checkout', 'confirmation')),
  listing_id    UUID NOT NULL REFERENCES listings (content_item_id),
  rule_applied  TEXT NOT NULL,           -- 'ftc_464', 'ca_1770_a29', 'default_all_in'
  total_shown   BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  shown_at      TIMESTAMPTZ NOT NULL
);

ALTER TABLE bookings
  ADD COLUMN fee_program_ids UUID[] NOT NULL DEFAULT '{}',  -- versions priced under
  ADD COLUMN fx_rate         NUMERIC(18,8),  -- listing to guest currency, as quoted
  ADD COLUMN quoted_at       TIMESTAMPTZ;
```

Design decisions behind it:

- **Current prices and frozen quotes are different tables.** `rate_overrides`, `pricing_rules` and `listing_add_ons` are current state that hosts and tools change; `booking_lines` is what this guest agreed to, never recomputed. A refund, a payout, a tax return and a drip-pricing claim all read the lines.
- **Each line says who pays, who earns and how it displays.** `payer` and `earner` drive the ledger postings (the host fee reduces the host's payable; the guest fee is platform revenue; tax is a liability to the authority; protection is owed to the plan) ([Payment States & Ledgers](/docs/payments/payment-states)); `display_class` drives the all-in total; `refundable` drives cancellations.
- **The total is a sum, never a field to edit.** `bookings.total_amount` equals the sum of quote and change lines; a check on write keeps it honest. Post-trip lines are collected separately and don't change the agreed total.
- **Fee programs are versioned terms.** The booking keeps the program versions it was priced under, so a fee change, a migration to host-only fees or a new tier never reprices an existing booking.
- **Recommendations are logged with their outcome,** so the pricing tool can be explained to a host and measured by the platform.
- **What was shown is evidence.** `price_displays` keeps the total shown at each step with the display rule applied; sample it at search volume, keep it at checkout.
- **Tax lines carry the remitter.** Platform-remitted tax posts to the platform's liability; host-remitted tax is reported to the host; refunds adjust tax in proportion.
- **Events:** `booking.quoted`, `booking.repriced` (a change), `booking.post_trip_charge_added`, `payment_schedule.due` and `payment_schedule.failed` drive collection jobs ([Background Jobs](/docs/architecture/background-jobs)) and notifications.

## Auditing

- **The quote as agreed:** every line with its source (fee program version, add-on, promotion, protection plan, tax rule), so a host's statement, a refund and a tax filing reconcile to the cent.
- **What the guest was shown:** the total at search, listing and checkout with the display rule applied, because drip-pricing claims turn on it.
- **Fee program history:** every version with its effective range and which bookings used it.
- **Price changes and recommendations:** who or what set each date's price, and every tool suggestion with its outcome.
- **Usage charges:** the rates frozen at booking, the readings and photos from the handoffs, the computation and the deadline.
- **Tax:** each tax line with its base, rule, remitter and filing, and the reserve for disputed taxes.

## What This Means for the System You Build

- **Freeze the quote as lines** that say who pays, who earns, whether it's mandatory and whether it's refundable.
- **Version fee programs** with tiers, floors, caps and bases as data, and keep the version on each booking.
- **Keep host prices as current state** with a history of who set them, and log every pricing-tool recommendation with its outcome.
- **Price usage from rates frozen at booking and readings captured at handoff,** as post-trip lines with a deadline.
- **Record who funds each promotion** and the base it applies to.
- **Model split payments as scheduled installments** with retries and a stated consequence for failure.
- **Classify every line for display** and compute the all-in total for search and checkout under the strictest rule that applies; snapshot what was shown.
- **Treat a required protection product as a mandatory fee** in the displayed total.
- **Compute tax per line with a remitter,** as a marketplace facilitator where the law makes you one, and adjust it on refunds and post-trip charges.

## References

**Law and regulation**

- [FTC: Rule on Unfair or Deceptive Fees, frequently asked questions](https://www.ftc.gov/business-guidance/resources/rule-unfair-or-deceptive-fees-frequently-asked-questions), scope, total price, permitted exclusions, cleaning fees, platforms, post-purchase charges, May 12, 2025 effective date
- [California Attorney General: SB 478, hidden fees](https://www.oag.ca.gov/hiddenfees), Civil Code 1770(a)(29), July 1, 2024 effective date, exclusions, short-term rentals, optional and conduct-contingent fees

**Filings**

- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), payment entities and licenses, funds held until check-in, revenue recognized at check-in, currencies
- [Turo: Form S-1 (January 2022)](https://www.sec.gov/Archives/edgar/data/1514587/000119312522005696/d145731ds1.htm), car rental company status, marketplace facilitator laws, indirect tax reserve
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), Turo Risk Score adjusting guest fees

**Platform documentation**

- [Airbnb: Airbnb service fees](https://www.airbnb.com/help/article/1857), the host-only fee, its range, the legacy split, services and experiences fees
- [Airbnb Engineering: Pay as a local](https://airbnb.tech/payments/pay-as-a-local/), local payment methods, shared configuration, multi-step transactions
- [Outdoorsy: Fee structure and how hosts get paid](https://support.outdoorsy.com/hc/en-us/articles/37916164272283-What-is-your-fee-structure-And-how-do-I-get-paid), host fee tiers and minimums, the referral fee
- [Outdoorsy: What fees should I be aware of](https://support.outdoorsy.com/hc/en-us/articles/37981867822747-What-fees-should-I-be-aware-of), the 10% guest service fee
- [Outdoorsy: Smart Pricing FAQs](https://support.outdoorsy.com/hc/en-us/articles/48261397287067-What-is-Outdoorsy-Smart-Pricing-FAQs-for-Outdoorsy-Hosts), inputs, host bounds, no same-day decreases, confirmed bookings unchanged
- [Outdoorsy: Cancellation and reservation deposit policies for guests](https://support.outdoorsy.com/hc/en-us/articles/37453151389211-What-are-the-cancellation-and-reservation-deposit-policies-for-Guests), price breakdown terms, prep fee, the reservation deposit schedule, proportional tax refunds
- [Outdoorsy: Charging for extra miles and generator hours](https://support.outdoorsy.com/hc/en-us/articles/37984660373659-Now-it-s-easier-to-charge-for-extra-miles-and-generator-hours), readings with photos, computed overage, seven-day window, no longer from the deposit
- [Outdoorsy: Military and first responders discount](https://support.outdoorsy.com/hc/en-us/articles/56925227934107-Outdoorsy-Military-and-First-Responders-Discount-Program), platform-funded discount on the subtotal, one code per booking
- [Outdoorsy: Do I have to collect sales tax and similar taxes](https://support.outdoorsy.com/hc/en-us/articles/37983381010715-U-S-Rentals-Do-I-have-to-collect-sales-use-tax-motor-vehicle-rental-tax-or-similar-transactional-taxes), the taxes it collects as facilitator, host responsibilities elsewhere, fleet software excluded
- [RVshare: Renter FAQ](https://rvshare.com/blog/?p=168613), split payment, service fee, the screening fee
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), host shares of 70%, 80% and 90% and incidental invoice windows
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), listing, transaction, offsite ads and conversion fees, sales tax collection by category
- [eBay: Selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822), insertion and final value fees, per-order fee, the base including tax, performance and international surcharges
- [Vinted: Buyer Protection fee](https://www.vinted.co.uk/help/342-buyer-protection-fee-on-vinted), the buyer-paid fee and what it funds
- [Wikipedia: Depop](https://en.wikipedia.org/wiki/Depop), removal of the US selling fee in July 2024 and the buyer marketplace fee

**In practice**

- [Labaton Keller Sucharow: Outdoorsy drip pricing claims](https://lantern.labaton.com/case/outdoorsy), a law-firm advertisement for individual arbitration claims, not a filed case
