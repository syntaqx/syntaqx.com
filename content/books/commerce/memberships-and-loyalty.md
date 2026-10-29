+++
title = "Memberships & Loyalty"
description = "Paid memberships (Costco, Prime, Walmart+) from the filings, points programs as ASC 606 material rights, breakage, tiers, escheat, and the loyalty platforms."
category = "Commerce Industry"
order = 2325
part = "Subscriptions and Memberships"
tags = ["commerce", "memberships", "loyalty", "points", "revenue-recognition", "data-model"]
+++

Retailers sell two kinds of belonging. A **paid membership** charges a fee for access or benefits: Costco won't sell to you without one, Amazon Prime turns shipping into a flat fee, Walmart+ and Target Circle 360 sell free delivery from stores. A **loyalty program** charges nothing and pays the customer back in points, rewards, tiers or perks for buying. They are often combined (Costco's Executive tier is a higher fee that earns a 2% reward), and they are the same promise from opposite ends: the membership is money in advance for value later, and the points program is value owed later for money already taken.

That is why both are accounting problems before they are software problems. A membership fee is deferred and recognized over the term. A point is a slice of each sale's revenue that hasn't been earned yet, because the customer has an option on a future discount, and under ASC 606 that option is a performance obligation with a price of its own. The system has to know, at any moment, how many points are outstanding, what they are worth, how many will never be redeemed, and which sale each one came from. This chapter covers paid memberships from the filings, points programs and their liability, tiers, unclaimed property, and the loyalty platforms. It extends `membership_plans` and `memberships` from [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it), which owns delivery memberships (DashPass, Uber One, Instacart+) and the benefit-per-order mechanics; recurring billing of the fee is [Subscription Commerce](/books/commerce/subscription-commerce) and the playbook's [Subscriptions & Recurring Billing](/docs/payments/subscriptions); renewal and cancellation law, including the FTC's Prime case, is [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law); and gift cards and store credit are the later Promotions, Discounts & Gift Cards chapter.

## How the Retailers Do It

As of October 2026, from the companies' filings and pages:

| Program | Fee | What the filing reports | How the fee is recognized |
| --- | --- | --- | --- |
| **Costco** | Gold Star $65 a year; Executive $130 (an upgrade of $65), earning about 2% of pre-tax purchases up to $1,250 a year | Fiscal 2026 membership fees $5.91 billion, up 11%; 84.1 million paid members, 150.4 million cardholders, 42.3 million Executive members; renewal rate 92.3% in the US and Canada, 89.8% worldwide | "Ratably over the one-year membership period"; $3.0 billion of deferred membership fees at year end |
| **Amazon Prime** | Not stated in the filings; Amazon's price pages weren't retrievable | Subscription services net sales of $13.1 billion in the fourth quarter of 2025, up 14%; Prime has no reported member count | Prime is "a single stand-ready obligation" recognized over the subscription period |
| **Walmart+ and Sam's Club** | Sam's Club $50 (Club), $110 (Plus); Walmart+ price pages weren't retrievable | "Membership and other income" of $6.75 billion in fiscal 2026, Walmart U.S. growth "primarily driven by double-digit growth in membership fee revenue from Walmart+" | Over the membership term; the line also holds rental income, recycling and gift card breakage |

<!-- source-gap: prime-and-walmart-plus-prices | missing | Amazon Prime ($14.99 a month, $139 a year) and Walmart+ ($12.95 a month, $98 a year) list prices | closes with: amazon.com Prime and walmart.com Walmart+ pages readable without bot checks, or a company release stating current prices | checked: 2026-10-28 -->

Three patterns:

- **The fee is the profit.** Costco's fiscal 2026 gross margin was 11.09% of net sales ([The Commerce Business](/books/commerce/commerce-business#a-store-sale)); the $5.9 billion of fees is most of what keeps it in business. A membership retailer prices goods near cost and earns on renewals, so the renewal rate is the number its filing leads with.
- **Benefits are bundles of other businesses.** Prime bundles shipping, video and more under one fee; Walmart+ bundles delivery and fuel discounts; Grubhub+ is itself bundled into Prime ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-the-platforms-do-it)). Each benefit has its own cost, and the membership's economics are a query across the benefits used.
- **Rewards reduce revenue.** Costco records the Executive 2% reward "as a reduction of sales," net of estimated breakage: $3.38 billion in fiscal 2026, against an accrued reward liability of $3.04 billion. A reward isn't a marketing expense; it's part of the price.

## Paid Memberships

A paid membership is a subscription whose renewal produces entitlements instead of goods. The mechanics differ from a product subscription in a few places:

- **The benefit is evaluated per transaction.** Whether a member's order ships free, whether a warehouse entry is allowed, whether a price applies: each is a rule evaluated at checkout or the door against the membership's status at that moment, and recorded as a line ([The Benefit, Order by Order](/books/commerce/delivery-subscriptions#the-benefit-order-by-order)). Access is derived from status and period, never stored as a flag ([Subscription States](/docs/payments/subscriptions#subscription-states)).
- **Households and cardholders.** Costco reports 84.1 million paid members but 150.4 million cardholders, because a membership carries a free household card. A membership is held by one customer and used by several; the model needs `membership_cardholders` with their own identities, and benefit usage per cardholder.
- **Tiers are separate plans.** Gold Star and Executive are two plans with different fees and benefits; an upgrade mid-term charges the difference (Costco's "additional $65") and changes the benefit rules from that moment.
- **The fee is deferred.** Revenue is recognized over the term, as Costco's "ratably over the one-year membership period" does; a refund policy means the deferred balance can reverse, so the policy is a plan term and each refund reduces the schedule.
- **Free trials and bundles convert or end.** A trial that converts to paid, and a membership that came with something else (a credit card, a phone plan, another membership), each end by different rules, and the membership's `source` decides which ([Cancellation Law](/books/commerce/delivery-subscriptions#cancellation-law)).
- **Benefit costs land elsewhere.** Free shipping is a shipping charge recorded and then offset; a fuel discount is a discount line at the pump; streaming has no order at all. Measuring a program's cost means summing offsets across systems, which is why every benefit is a row with the membership it came from.

The law is the same as for any automatic renewal: disclosure, consent and simple cancellation, in the same medium as sign-up. The FTC's $2.5 billion Prime settlement is about exactly the membership enrollment and cancellation flows ([FTC v. Amazon](/books/commerce/auto-renewal-law#ftc-v-amazon-prime)).

## Points Programs

A points program issues a balance for activity (purchases, reviews, referrals, birthdays) and redeems it for value (a discount, a product, free shipping, an experience). The design decisions:

- **Earn rules.** Points per dollar, on which base (pre-tax, after discounts, excluding gift cards and shipping), with multipliers by tier, category or promotion, and bonus events. The earn rule is a versioned rule like a price ([Rules as Data](/docs/architecture/rules-as-data)).
- **When points vest.** Points earned on a purchase that is returned must come back. Most programs post points as pending and make them available after the return window, so a return reverses a pending entry instead of clawing back a spent balance.
- **Burn rules.** What a point buys, in fixed steps ("100 points = $5 off") or a rate, with minimums and exclusions. The redemption is a discount line on the order that funds it ([Order Line Versus Order Charge](/books/commerce/commerce-business#the-core-data-model)).
- **Expiry.** Points that expire after inactivity or a fixed time. Starbucks Stars expire after 6 to 12 months; Ulta's are valid for at least a year. Expiry drives breakage, and the rule has to be disclosed in the program terms.
- **Cash value.** Whether points can ever be redeemed for money decides how unclaimed property law treats them ([Unclaimed Property](#unclaimed-property), below).

**The balance is a ledger.** A loyalty account's balance is the sum of its entries: earned (pending, then available), redeemed, reversed on return, expired, adjusted by support, transferred. Never a column updated in place. This is the same discipline as money ([Payment States & Ledgers](/docs/payments/payment-states)): a support agent's goodwill points, a reversal after a return and an expiry run are each an entry with an actor and a reason, and the balance reconciles to the liability finance books.

## Points as Material Rights

Under ASC 606 (and IFRS 15) a point earned on a purchase is an option to buy future goods at a discount. If the option gives the customer "a material right to the customer that it would not receive without entering into that contract" (ASC 606-10-55-42), it is a separate performance obligation, and part of the sale's price is allocated to it and deferred until the point is redeemed or expires. PwC's guide is direct about loyalty programs: "A portion of the transaction price should be allocated to the material right (that is, the points)," on relative standalone selling prices, not on what the reward costs the retailer. An option offered at its standalone price (a coupon anyone could get) is a marketing offer, not a material right, and nothing is deferred.

The standalone selling price of a point reflects the discount it gives, adjusted for discounts available without it and for the likelihood that it will be redeemed (ASC 606-10-55-44). A worked example in round numbers: a customer spends $100 and earns 100 points, each worth $0.05 at redemption, so $5 of face value; the retailer expects 80% to be redeemed, so the points' standalone value is $4. Allocating the $100 by relative standalone selling price gives the goods $100 × 100 / 104 = $96.15 and the points $3.85. The retailer recognizes $96.15 now and defers $3.85, which it recognizes as the points are redeemed (in proportion to the 80% expected). If customers redeem more than expected, the estimate moves.

The filings show the size of the balance:

- **Starbucks** reports a combined deferred revenue for stored value cards and its loyalty program of $1.75 billion at the end of fiscal 2025. Stars are deferred at the "estimated value of the product for which the reward is expected to be redeemed," net of Stars expected never to be redeemed.
- **Ulta Beauty** states that "The loyalty program represents a material right to the customer," with more than 46 million Ulta Beauty Rewards members accounting for about 95% of sales; its contract liabilities (loyalty and gift cards together) were $574.0 million at January 31, 2026.
- **Costco** treats its Executive 2% reward as a reduction of sales with an accrued liability, net of breakage, rather than as a points program, because the reward is a percentage paid out once a year.

What the system has to give finance (the decisions stay finance's; [The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)):

- **Per earn entry,** the order and line it came from, the points, and the face value at the program's current burn rate.
- **Per redemption,** which earned entries it consumed (first in, first out by earn date, which also decides which expire first) and the discount granted.
- **Per expiry,** the entries expired and their face value.
- **Redemption history by cohort,** from which finance estimates the redemption rate that drives the standalone selling price and breakage.

## Breakage

Breakage is the points (or gift card balances, or membership benefits) that will never be used. ASC 606-10-55-48 says how to recognize it: if the retailer expects to be entitled to breakage, it recognizes the expected breakage "in proportion to the pattern of rights exercised by the customer"; if not, it recognizes breakage when the chance of exercise becomes "remote." In the example above, with 80% expected redemption, each redemption of 1% of the points releases 1/80 of the deferred amount, so by the time all expected redemptions have happened the full $3.85 has been recognized, including the share that will never be redeemed.

Breakage estimates are only as good as the redemption data behind them, which is why the ledger keeps earn date, cohort and channel on every entry, and why a change to the program (a new expiry rule, a devaluation of points) is a dated event that finance can see in the curve ([Breakage](/docs/payments/accounting#breakage)).

## Tiers

Tiers turn a points program into status: spend more in a year and qualify for a higher tier with better earn rates, free shipping or early access. The rules that need to be explicit:

- **Qualification.** On which measure (spend, points earned, orders), over which window (calendar year, rolling 12 months, membership year), and whether returns reduce it.
- **Duration and requalification.** A tier earned this year usually lasts through next year; the downgrade date and the grace period are rules, and the downgrade notice is a scheduled message.
- **Benefits by tier.** Earn multipliers, free shipping thresholds, birthday rewards, exclusive products; each is a rule keyed by tier, evaluated like a membership benefit.
- **Paid tiers.** Some programs sell a tier (a paid "plus" level on top of a free program); that tier is a paid membership with all the renewal law that comes with it, layered on a free loyalty account.

Tier status is derived from qualifying activity, not edited: `loyalty_tier_status` records the tier, the window it was earned in, and the activity that earned it, so a customer's "why did I lose Gold?" has an answer from rows.

## Unclaimed Property

Unclaimed property (escheat) laws require holders to turn over abandoned property to the state, and a points balance looks like property. States differ, and the safest design is a program whose points have no cash value. Delaware, where many retailers are incorporated, defines a "loyalty card" as a record given "without direct monetary consideration" under a reward or loyalty program and excludes it from property subject to escheat, but excludes from that definition records "redeemed for money or otherwise monetized." So a program that lets members cash out, or sells points, can bring its balances under unclaimed property law, while a program of free, non-cash rewards generally stays outside it in Delaware. Which states' rules apply to a given program is for counsel; the system's job is to record whether each balance was purchased or earned and whether it was ever redeemable for cash.

Gift cards and store credit are different: they are bought for money, and their escheat and breakage treatment is the later Promotions, Discounts & Gift Cards chapter.

## How the Loyalty Platforms Do It

As of October 2026, from the vendors' pricing pages:

| Platform | Model | Published price |
| --- | --- | --- |
| **Smile.io** | Points, referrals and VIP tiers for Shopify and other platforms | Free to 200 orders a month; Essential $15 (500 orders); Standard $79 (1,000); Growth $199 (2,500, VIP tiers); Plus $999 a month billed annually (7,500, API); Enterprise custom |
| **Yotpo Loyalty & Referrals** | Loyalty with Yotpo's reviews and SMS suite | Free to 500 orders; Pro from $199 a month for 500 orders, then $0.20, $0.10 and $0.05 per order by volume band; Premium and Enterprise custom |
| **LoyaltyLion** | Loyalty for ecommerce brands | Classic $199 a month with 500 orders; Advanced and Plus custom |
| **Antavo** | Enterprise loyalty platform | Not published; tiers priced on customer activity |
| **Open Loyalty** | API-first loyalty engine | Not published; a platform fee plus a fee per monthly active member |
| **Talon.One** | Promotions and loyalty rules engine | Not published; tiers priced on data volume |

The split mirrors subscription apps: Shopify-first apps priced per order for brands, and engines priced per member or by volume for retailers building their own experience. Pricing per order means the platform's fee scales with sales, not with the liability it tracks, so the points liability itself stays in the merchant's ledger, not the vendor's.

## How to Build It

`membership_plans`, `memberships`, `membership_periods`, `membership_cancellations` and `benefit_applications` from [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it) hold paid memberships. This chapter adds tiers to plans, cardholders, deferred fee schedules, and the loyalty program as a ledger:

```sql
ALTER TABLE membership_plans
  ADD COLUMN tier_rank        SMALLINT,          -- Gold Star 1, Executive 2
  ADD COLUMN reward_rule      JSONB,             -- {"percent": 2, "annual_max": 125000}
  ADD COLUMN household_cards  SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN refund_policy    TEXT NOT NULL DEFAULT 'none' CHECK (refund_policy IN ('none',
                                'pro_rata', 'full_any_time', 'full_within_days'));

ALTER TABLE memberships
  ADD COLUMN merchant_id      UUID REFERENCES merchants (id),
  ADD COLUMN membership_number TEXT;             -- printed on the card

CREATE TABLE membership_cardholders (    -- the people who use one membership
  membership_id  UUID NOT NULL REFERENCES memberships (id),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  role           TEXT NOT NULL CHECK (role IN ('primary', 'household', 'affiliate')),
  card_number    TEXT NOT NULL,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at     TIMESTAMPTZ,
  PRIMARY KEY (membership_id, customer_id)
);

CREATE TABLE loyalty_programs (          -- a program's rules, versioned
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  version        INT NOT NULL,
  earn_rules     JSONB NOT NULL,         -- points per unit, base, exclusions, multipliers
  burn_rules     JSONB NOT NULL,         -- rewards, steps, minimums
  vesting_days   SMALLINT NOT NULL DEFAULT 0,  -- pending until the return window closes
  expiry_rule    JSONB,                  -- {"inactive_months": 12} or {"months_after_earn": 6}
  cash_value     BOOLEAN NOT NULL DEFAULT FALSE,  -- decides unclaimed property treatment
  terms_ref      TEXT NOT NULL,
  valid_during   TSTZRANGE NOT NULL,
  UNIQUE (merchant_id, version)
);

CREATE TABLE loyalty_tiers (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id     UUID NOT NULL REFERENCES loyalty_programs (id),
  code           TEXT NOT NULL,          -- 'silver', 'gold'
  rank           SMALLINT NOT NULL,
  qualify_rule   JSONB NOT NULL,         -- {"measure": "spend", "threshold": 50000, "window": "calendar_year"}
  benefits       JSONB NOT NULL,         -- earn multiplier, free shipping, perks
  UNIQUE (program_id, code)
);

CREATE TABLE loyalty_accounts (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id     UUID NOT NULL REFERENCES loyalty_programs (id),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  membership_id  UUID REFERENCES memberships (id),  -- a paid tier or a reward on a paid plan
  status         TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
  enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_ref    TEXT NOT NULL,          -- the program terms accepted
  UNIQUE (program_id, customer_id)
);

CREATE TABLE loyalty_ledger (            -- every point movement; the balance is a sum
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES loyalty_accounts (id),
  kind           TEXT NOT NULL CHECK (kind IN ('earn', 'vest', 'redeem', 'reverse', 'expire',
                   'adjust', 'transfer_in', 'transfer_out')),
  points         BIGINT NOT NULL,        -- signed: earn positive, redeem negative
  state          TEXT NOT NULL CHECK (state IN ('pending', 'available')),
  face_value     BIGINT NOT NULL,        -- minor units at the burn rate in force
  currency       CHAR(3) NOT NULL,
  order_id       UUID REFERENCES orders (id),
  order_line_id  UUID REFERENCES order_lines (id),  -- the line that earned or the discount line
  consumes_id    UUID REFERENCES loyalty_ledger (id),  -- a redeem or expire draws from an earn
  rule_version   INT NOT NULL,
  actor          TEXT NOT NULL,          -- system, staff (with reason), customer
  reason         TEXT,
  vests_at       TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX loyalty_ledger_account_idx ON loyalty_ledger (account_id, created_at);

CREATE TABLE loyalty_tier_status (       -- derived, with the activity that earned it
  account_id     UUID NOT NULL REFERENCES loyalty_accounts (id),
  tier_id        UUID NOT NULL REFERENCES loyalty_tiers (id),
  earned_window  TSTZRANGE NOT NULL,     -- the qualifying window
  valid_during   TSTZRANGE NOT NULL,     -- the window it applies to
  qualifying_amount BIGINT NOT NULL,
  PRIMARY KEY (account_id, valid_during)
);

CREATE TABLE deferred_fee_schedules (    -- a membership fee recognized over its term
  membership_id  UUID NOT NULL REFERENCES memberships (id),
  period         TSTZRANGE NOT NULL,     -- the paid membership period
  amount         BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  recognized     BIGINT NOT NULL DEFAULT 0,
  refunded       BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (membership_id, period),
  CHECK (recognized + refunded <= amount)
);
```

The balance and the liability are queries, never columns:

```sql
-- Available balance and outstanding face value per account:
SELECT account_id,
       SUM(points) FILTER (WHERE state = 'available') AS available_points,
       SUM(points) FILTER (WHERE state = 'pending')   AS pending_points,
       SUM(face_value) AS outstanding_face_value
FROM loyalty_ledger
GROUP BY account_id;
```

Design notes:

- **Earn and burn point at order lines.** An earn entry references the line that earned it, so a return of that line writes a `reverse` entry against it; a redemption references the discount line it funded, so a refund of the order can restore the points.
- **Redemptions consume earns.** `consumes_id` ties each redeem and expire entry to the earn entries it drew from, first in, first out, which gives expiry dates and the cohort data breakage needs.
- **Face value is stamped at entry time.** A devaluation (fewer dollars per point) is a new program version; old entries keep the value they were issued at, so the liability before and after is reconstructible.
- **The ledger feeds finance, finance sets the rate.** Allocation of transaction price to points and the breakage estimate are finance's; the product provides earn, redemption and expiry facts by cohort, and the later Commerce Accounting chapter books them.
- **Events:** `loyalty.earned`, `loyalty.vested`, `loyalty.redeemed`, `loyalty.reversed`, `loyalty.expired`, `loyalty.tier_changed`, `membership.renewed` and `membership.upgraded` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to email flows, the storefront and accounting.

## Auditing

- **Every point, with its source.** Each ledger entry with its order line, rule version, face value and actor; support adjustments with a reason; nothing edited in place.
- **Program versions.** Earn, burn and expiry rules in force on each date, with the terms text members accepted, because a devaluation or an expiry change is the first thing a complaint or an attorney general asks about.
- **The liability.** Outstanding points and face value by cohort at each month end, reconciling to the deferred revenue finance reports.
- **Membership fees.** Each fee, its deferral schedule, recognition and refunds; upgrades and their charges.
- **Benefit use.** Every benefit applied, by membership and cardholder, from which the program's cost and any savings claim are computed.

## What This Means for the System You Build

- **Treat a paid membership as a subscription that renews entitlements,** with access derived from status and period, cardholders as their own records, and the fee deferred over the term.
- **Record benefits as lines** offsetting the charge they waive, so program cost and member savings are sums.
- **Keep points in an append-only ledger** tied to the order lines that earned and the discounts that burned them; compute balances.
- **Vest points after the return window,** so returns reverse pending points instead of clawing back spent ones.
- **Stamp face value and rule version on every entry,** and version the program so devaluations and expiry changes are dated.
- **Give finance redemption and expiry data by cohort;** points are a material right, and their allocation and breakage are estimated from it.
- **Derive tier status from qualifying activity** with its window, and schedule downgrade notices.
- **Decide cash value deliberately:** points redeemable for money can bring balances under unclaimed property law.
- **Apply renewal law to paid tiers and memberships** exactly as to any subscription.

## References

**Filings**

- [Costco: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0000909832/000090983226000093/cost-20260830.htm), membership fees, paid members, cardholders, Executive members, renewal rates, ratable recognition, deferred fees, the 2% reward as a reduction of sales and its liability
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), Prime as a single stand-ready obligation recognized over the subscription period
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), subscription services net sales for the quarter
- [Walmart: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm), membership and other income, Walmart+ fee growth, Sam's Club membership fees
- [Starbucks: Form 10-K for fiscal 2025, deferred revenue note](https://www.sec.gov/Archives/edgar/data/829224/000082922425000114/R19.htm), stored value card and loyalty deferred revenue
- [Starbucks: Form 10-K for fiscal 2025, revenue recognition policy](https://www.sec.gov/Archives/edgar/data/829224/000082922425000114/R10.htm), Stars deferred at the estimated value of the reward, net of unredeemed Stars, and their expiry
- [Ulta Beauty: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1403568/000110465926035243/ulta-20260131x10k.htm), the loyalty program as a material right, members and share of sales, contract liabilities

**Accounting guidance**

- [PwC Viewpoint: Customer options that provide a material right (RR 7.2)](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_7_options_to_US/72customer_options_t_US.html), ASC 606-10-55-42, allocation to points, marketing offers versus material rights, standalone selling price of an option
- [PwC Viewpoint: Unexercised rights (RR 7.4)](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_7_options_to_US/74unexercised_rights_US.html), ASC 606-10-55-48 breakage recognized in proportion to rights exercised or when exercise is remote

**Law**

- [Delaware Code title 12, chapter 11, subchapter II](https://delcode.delaware.gov/title12/c011/sc02/index.html), the loyalty card definition and its exclusion from property, and the exception for cards redeemed for money

**Programs and platforms**

- [Costco: Executive membership rewards](https://www.costco.com/executive-rewards.html), the $130 Executive fee, the $65 upgrade, the 2% reward and the $1,250 maximum
- [Smile.io: Pricing](https://smile.io/pricing), plans, order limits and VIP tiers
- [Yotpo: Loyalty pricing](https://www.yotpo.com/pricing/loyalty/), free and Pro tiers and per-order rates
- [LoyaltyLion: Pricing](https://loyaltylion.com/pricing), the Classic plan
- [Antavo: Pricing](https://antavo.com/pricing), tiers priced on customer activity
- [Open Loyalty: Pricing](https://openloyalty.io/pricing), platform and per-member fees
- [Talon.One: Pricing](https://talon.one/pricing), tiers priced on data volume
