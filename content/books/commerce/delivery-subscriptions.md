+++
title = "Subscriptions & Loyalty"
description = "DashPass, Uber One, Instacart+ and Grubhub+ compared: benefit rules, who funds them, savings claims, trials, and cancellation law including FTC v. Uber."
category = "Commerce Industry"
order = 2346
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "subscriptions", "memberships", "cancellation", "consumer-protection"]
+++

Every large delivery platform sells a membership: a monthly or yearly fee in exchange for $0 delivery fees, lower service fees and discounts on eligible orders. The membership is the platform's answer to its own fees. A customer who pays $9.99 a month stops seeing a delivery fee on every order, orders more often, and orders from the platform rather than a competitor, while the platform gets recurring revenue and a customer it can count on. DoorDash reports over 35 million members across DashPass, Wolt+ and Deliveroo Plus, and Uber 46 million Uber One members across rides and delivery.

The software has three jobs. It has to decide, per order, whether the benefit applies (the store participates, the subtotal meets a minimum) and record what it saved; it has to bill the membership like any subscription; and it has to let the customer leave as easily as they joined, which is where the law has spent the last two years. Paid memberships outside delivery (Costco, Prime, Walmart+) and points programs are [Memberships & Loyalty](/books/commerce/memberships-and-loyalty), and the Prime settlement that sets the current enforcement baseline is [FTC v. Amazon (Prime)](/books/commerce/auto-renewal-law#ftc-v-amazon-prime). The FTC sued Uber over Uber One's billing and cancellation, settled with Grubhub and Instacart over memberships among other things, and lost its federal click-to-cancel rule in court. This chapter compares the programs, the benefit rules, who pays for the benefit, savings claims, and cancellation law. It extends `customers` and `order_charges` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model); billing mechanics (periods, renewal jobs, dunning, proration) are the playbook's [Subscriptions](/docs/payments/subscriptions).

## How the Platforms Do It

As of October 2026, from each platform's own pages and terms:

| Program | Price | Core benefit | Trial | Cancellation, as documented |
| --- | --- | --- | --- | --- |
| **DashPass (DoorDash)** | $9.99 a month or $96 a year | "$0 delivery fees, reduced service fees, and special discounts" on eligible orders that meet a participating store's minimum (a $10 minimum in some listed areas) | For customers who haven't tried it; auto-renews "until you cancel" | In the app's account settings; at least 24 hours before the next payment; benefits run to the end of the period, but end immediately if cancelled during a trial |
| **Uber One** | $9.99 a month | $0 delivery fee and up to 10% off eligible orders over a minimum subtotal; 5% back on rides as credits | 4 weeks free for eligible first-time members | "Manage Membership", then "End Membership"; a charge within 24 hours of renewal is automatically refunded; otherwise non-refundable once the cycle begins |
| **Instacart+** | $99 a year or $9.99 a month | $0 delivery on grocery and retail orders of $10 or more ($35 at Costco) and restaurant orders of $25 or more; "service fees apply"; family sharing and media bundles | 14 days, auto-renewing to $99 a year | "At anytime from the Your Instacart+ Membership page" |
| **Grubhub+** | $9.99 a month on Grubhub's Grubhub+ page; the terms themselves state no amount | $0 delivery fee on eligible orders over a minimum subtotal, and lower service fees | Converts to paid after a promotion or trial; Prime-linked memberships don't convert | Account, Grubhub+, "Manage Membership", "Cancel membership", at least 24 hours before the next payment; no refunds |

Grubhub+ is also given to Amazon Prime members, which Amazon described in 2024 as "a free ongoing Grubhub+ membership worth $120 a year" with "$0 delivery fees on eligible orders over $12, lower service fees." Bought on its own, Grubhub+ "auto-renews at $9.99/month" after any free trial. Its terms no longer state a single order minimum: $0 delivery and lower service fees apply to standard delivery orders from eligible merchants that meet "the subtotal minimum (before tax, tip, and fees) on the applicable menu page," so the threshold is per merchant, while grocery orders through its Instacart-powered tab need a $35 subtotal; service, long-distance and weather fees may still apply.

Three patterns:

- **The benefit is conditional.** Every program applies only to eligible stores and above a minimum subtotal, and service fees are reduced, not removed. "Free delivery" is a claim about one fee line, and the enforcement cases below are about exactly that gap.
- **Trials convert by default.** Every program offers a free period that becomes paid unless cancelled, which is the moment cancellation law cares most about.
- **The 24-hour rule is everywhere.** DoorDash and Grubhub require cancelling at least 24 hours before renewal; Uber refunds a charge that lands within that window instead. A cancellation received inside the window is still a cancellation, and the system has to decide what it costs the customer by a written rule.

## The Benefit, Order by Order

A membership benefit is a set of rules evaluated at checkout against the cart: is the customer's membership active now, does the store participate, does the subtotal (before or after discounts, before tax) meet the store's or the program's minimum, is the order's fulfillment type covered (delivery, pickup, restaurant versus grocery), and which fees does it zero or reduce. DoorDash's terms say the benefits "only apply once your order meets a participating store's order minimum"; Instacart's minimum differs by retailer type.

The result should never be a silently missing fee. It is a set of lines: the delivery fee as it would have been, and a benefit line that offsets it, both recorded. That gives the customer a statement of what the membership saved, gives the platform the true cost of the program, and gives a regulator a way to check a savings claim against orders.

## Who Pays for the Benefit

A $0 delivery fee costs somebody the delivery fee. The merchant plans show where part of it lands:

- **DoorDash** makes access to DashPass members a feature of its Plus (25%) and Premier (30%) plans, so merchants on the 15% Basic plan forgo member demand.
- **Uber Eats** charges merchants on its Plus plan an extra 5% on Uber One orders; the Premium plan includes Uber One orders "at no additional cost."

So a member's order can carry a higher merchant commission than a non-member's at the same store. The commission line records the plan's membership surcharge separately ([Merchant Commission Tiers](/books/commerce/delivery-fees-and-the-law#merchant-commission-tiers)), and the program's economics (fees waived, commission surcharges earned, extra order frequency) are queries over benefit and charge lines.

## Savings Claims

Each enforcement action against a delivery membership has included a claim about money saved or fees avoided:

- **Uber One.** The FTC's April 21, 2025 complaint alleged that Uber advertised "savings of $25 a month" without accounting for the membership's cost of up to $9.99 a month, enrolled and billed people without consent, and made cancellation take "as many as 23 screens and take as many as 32 actions."
- **Grubhub+.** The FTC's December 2024 complaint alleged Grubhub+ was sold as "free" delivery while fees still applied and that cancellation was obstructed; the order requires simple cancellation and annual reminders.
- **Instacart+.** The FTC's December 2025 complaint alleged that Instacart "charged many consumers for paid memberships without their express informed consent"; the order requires clear subscription disclosure and express informed consent.

A savings figure shown to a member is therefore a computed value, from that member's benefit lines minus the fee paid, with the calculation versioned. A marketing claim ("save $25 a month") is a separate assertion that needs a substantiation record: the population, period and method behind it.

## Cancellation Law

Three layers apply as of October 2026, and the Hosting & Cloud volume's [Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law) treats them in depth:

- **Federal.** ROSCA (15 U.S.C. 8403) requires clear disclosure of material terms, express informed consent before charging, and simple mechanisms to stop recurring charges. The FTC's 2024 amendments to the Negative Option Rule, which would have set a federal click-to-cancel standard, were vacated in full by the Eighth Circuit in July 2025 for procedural defects, so there is no federal click-to-cancel rule in force; the FTC's later rulemaking steps and their status are tracked in the Hosting & Cloud chapter ([The vacated rule and the 2026 advance notice](/books/hosting-and-cloud/renewals-and-cancellation-law#the-vacated-rule-and-the-2026-advance-notice)).
- **State.** Automatic renewal laws such as California's Business and Professions Code section 17602 and New York's General Business Law section 527-a require disclosure before billing, affirmative consent, an acknowledgment, online cancellation for online sign-ups, and notices before a trial converts or a price changes ([State automatic renewal laws](/books/hosting-and-cloud/renewals-and-cancellation-law#state-automatic-renewal-laws)).
- **Enforcement.** FTC v. Uber (N.D. Cal., No. 4:25-cv-03477-JST) is the live case. In December 2025 the FTC filed an amended complaint joined by 21 states and the District of Columbia, seeking civil penalties under ROSCA and state laws. The FTC's case page lists the matter as pending, with a second amended complaint dated May 4, 2026. The court's order of April 10, 2026 dismissed only two things: the subclaim that the "$0 delivery fee" representation was false or misleading, with prejudice, because a $0 fee promised on "eligible" orders is "plainly not misleading"; and the state law allegations, with leave to replead each state's claim as a separate count. "In all other respects, the motion is denied," so the ROSCA claims over disclosure, consent and cancellation go forward, and the states were held to have standing. The lesson for a subscription system is that a qualifier like "eligible" carries the claim only if the eligibility rule is real, recorded and shown.

What the law asks of the system:

- **Cancel where you joined, in as few steps as it took to join.** An in-app sign-up gets an in-app cancel, reachable from the membership screen, with any save offer skippable in one action ([Cancellation](/docs/payments/subscriptions#cancellation)).
- **Record consent and every reminder.** The terms shown, the consent captured, the trial end and renewal notices sent, each as a record ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).
- **Decide late cancellations by rule.** A cancellation received inside the 24-hour window either stops the renewal or refunds it (Uber's approach), never charges silently.
- **Bundled memberships end differently.** A membership that came with Prime, a phone plan or a card program ends when the partner says so and may not convert to paid (Grubhub's terms exclude Prime-linked memberships from conversion); the source of each membership is a field, and its end rules follow from it.

## How to Build It

```sql
CREATE TABLE membership_plans (          -- a program's terms, versioned
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  program        TEXT NOT NULL,          -- 'dashpass', 'uber_one', ...
  version        INT NOT NULL,
  interval       TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  price          BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  trial_days     SMALLINT NOT NULL DEFAULT 0,
  benefit_rules  JSONB NOT NULL,         -- minimums, fee reductions, eligible fulfillment types
  cancel_cutoff  INTERVAL NOT NULL DEFAULT '24 hours',
  late_cancel    TEXT NOT NULL CHECK (late_cancel IN ('stop_renewal', 'refund_renewal')),
  terms_ref      TEXT NOT NULL,          -- the disclosure shown at sign-up
  valid_during   TSTZRANGE NOT NULL,
  UNIQUE (program, version)
);

CREATE TABLE memberships (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id   UUID NOT NULL REFERENCES customers (id),
  plan_id       UUID NOT NULL REFERENCES membership_plans (id),
  source        TEXT NOT NULL CHECK (source IN ('direct', 'partner_bundle', 'promotion')),
  partner       TEXT,                    -- e.g. the bundle provider
  status        TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due',
                  'cancelled', 'ended')),
  consent_ref   TEXT NOT NULL,           -- the consent record and terms version
  started_at    TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ
);

CREATE TABLE membership_periods (        -- each billed or trial period
  membership_id UUID NOT NULL REFERENCES memberships (id),
  period        TSTZRANGE NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('trial', 'paid', 'partner')),
  charge_ref    TEXT,                    -- the Payments record, for paid periods
  PRIMARY KEY (membership_id, period)
);

CREATE TABLE membership_cancellations (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  membership_id  UUID NOT NULL REFERENCES memberships (id),
  channel        TEXT NOT NULL CHECK (channel IN ('app', 'web', 'support', 'partner')),
  received_at    TIMESTAMPTZ NOT NULL,
  effective_at   TIMESTAMPTZ NOT NULL,
  steps          SMALLINT NOT NULL,      -- screens shown between start and confirmation
  save_offer     TEXT,                   -- offer shown, if any, and declined
  refund_amount  BIGINT NOT NULL DEFAULT 0,
  confirmation_sent_at TIMESTAMPTZ
);

CREATE TABLE benefit_applications (      -- what the membership did on each order
  order_id       UUID NOT NULL REFERENCES orders (id),
  membership_id  UUID NOT NULL REFERENCES memberships (id),
  charge_id      UUID NOT NULL REFERENCES order_charges (id),  -- the fee it offset
  offset_amount  BIGINT NOT NULL CHECK (offset_amount > 0),
  rule_version   INT NOT NULL,
  PRIMARY KEY (order_id, charge_id)
);
```

Design notes:

- **The fee is recorded, then offset.** A delivery fee waived for a member is an `order_charges` row and a `benefit_applications` row, so savings statements and program cost are sums, and a non-member price is always reconstructible.
- **Steps are counted.** `membership_cancellations.steps` is what an enforcement complaint counts (Uber's "23 screens"); measuring it in production is cheaper than discovering it in a complaint.
- **Late cancellation is a plan term,** not a support agent's judgment.
- **Bundles carry their partner.** A membership's source and partner decide its end and conversion rules.

## Auditing

- **Consent and terms.** For every membership, the plan version and disclosure shown, the consent captured and when, the trial end notice and renewal reminders sent.
- **Every cancellation.** Channel, time received, effective time, steps, save offers and refunds, kept at least as long as the state laws require for consent records.
- **Every benefit.** The fee offset on each order and the rule version, from which savings shown to members and claimed in marketing are computed.
- **Merchant surcharges.** The extra commission charged on member orders, by plan.

## What This Means for the System You Build

- **Evaluate benefits per order from versioned rules,** and record the waived fee and its offset as lines.
- **Show members their real savings,** net of the fee, from those lines, and substantiate any savings claim.
- **Record who funds the benefit,** including merchant commission surcharges on member orders.
- **Bill memberships with the playbook's subscription model,** with trials, periods and renewal reminders as records.
- **Make cancellation as easy as sign-up, in the same channel,** with steps measured and save offers skippable.
- **Decide late cancellations by plan rule,** and refund rather than surprise.
- **Track each membership's source and partner,** since bundles end and convert differently.

## References

**Filings**

- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), over 35 million DashPass, Wolt+ and Deliveroo Plus members
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), 46 million Uber One members
- [Maplebear (Instacart): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000018/cart-20251231.htm), Instacart+ benefits and membership fees within GTV

**Program terms**

- [DoorDash: What is DashPass](https://help.doordash.com/en-us/consumers/article/what-is-dashpass?ctry=US), benefits, store minimums, the $10 minimum areas, the trial, auto-renewal
- [DoorDash: DashPass annual plan upgrade](https://help.doordash.com/en-us/consumers/article/10-off-3-orders-with-dashpass-annual-plan-upgrade), $96 a year recurring until cancelled
- [DoorDash: T-Mobile partnership FAQs](https://help.doordash.com/es-us/consumers/article/t-mobile-partnership-faqs), the $9.99 monthly and $96 annual prices
- [DoorDash: How do I cancel my DashPass subscription](https://help.doordash.com/en-us/consumers/article/how-do-i-cancel-my-dashpass-subscription), the steps and the 24-hour cutoff
- [Uber: Uber One](https://www.uber.com/us/en/u/uber-one/), price, benefits, the 4-week trial, ending a membership and the refund within 24 hours of renewal
- [Instacart: Instacart+](https://www.instacart.com/instacart-plus), prices, order minimums, service fees, the 14-day trial, cancellation
- [Grubhub: Grubhub+ terms](https://lp.grubhub.com/legal/plus/), the recurring fee, benefits, conversion after trials, Prime-linked memberships, cancellation and no refunds
- [Grubhub: Grubhub+](https://www.grubhub.com/plus), the $9.99 monthly renewal, the per-merchant subtotal minimum, the $35 grocery minimum, fees that still apply
- [Amazon: Grubhub as an ongoing Prime member offer (May 29, 2024)](https://press.aboutamazon.com/2024/5/amazon-announces-grubhub-as-ongoing-prime-member-offer-customers-can-now-order-grubhub-directly-from-amazon-com-and-the-amazon-shopping-app), the $120-a-year membership and the $12 minimum
- [DoorDash: Merchant pricing](https://merchants.doordash.com/en-us/pricing), DashPass access on the Plus and Premier plans
- [Uber Eats: Merchant pricing (US)](https://merchants.ubereats.com/us/en/pricing/), the extra 5% on Uber One orders for Plus and their inclusion in Premium

**Law and enforcement**

- [15 U.S.C. 8403](https://www.law.cornell.edu/uscode/text/15/8403), ROSCA's disclosure, consent and simple cancellation requirements
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), disclosure before billing, affirmative consent, acknowledgment, online cancellation, notices before a long trial converts and before a price change
- [New York General Business Law 527-a](https://www.nysenate.gov/legislation/laws/GBS/527-A), consent before charging, acknowledgment, cancellation in the same medium, notice windows
- [Custom Communications, Inc. v. FTC, No. 24-3137 (8th Cir. July 2025)](https://ecf.ca8.uscourts.gov/opndir/25/07/243137P.pdf), vacatur of the amended Negative Option Rule for procedural deficiencies
- [FTC: Action against Uber over billing and cancellation (April 21, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-takes-action-against-uber-deceptive-billing-cancellation-practices), the savings claim, unauthorized billing, 23 screens and 32 actions
- [FTC: States join amended complaint against Uber (December 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-states-file-amended-complaint-against-uber-deceptive-billing-cancellation-practices), 21 states and the District of Columbia, civil penalties under ROSCA and state law
- [FTC: Uber, FTC v. case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/2423092-uber-ftc-v), pending status and the May 4, 2026 second amended complaint
- [Leagle: FTC v. Uber Technologies, order of April 10, 2026](https://www.leagle.com/decision/infdco20260413b06), the motion to dismiss granted in part and denied in part
- [FTC v. Uber Technologies, No. 4:25-cv-03477-JST, Order on Motion to Dismiss (ECF No. 178, April 10, 2026; PDF, Venable copy)](https://www.venable.com/-/media/files/publications/2026/04/order-dismiss-tigar.pdf), the "$0 delivery fee" subclaim dismissed with prejudice, state law allegations dismissed with leave to amend, the motion otherwise denied, state standing
- [FTC: Action against Grubhub (December 17, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-illinois-attorney-general-take-action-against-grubhub-harming-diners-workers-small-businesses), Grubhub+ as "free" delivery, obstructed cancellation, simple cancellation and annual reminders
- [FTC: Instacart to pay $60 million (December 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/instacart-pay-60-million-consumer-refunds-settle-ftc-lawsuit-over-allegations-it-engaged-deceptive), memberships charged without express informed consent and the order's disclosure and consent terms
