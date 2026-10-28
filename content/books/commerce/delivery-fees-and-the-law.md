+++
title = "Fees, Commissions & the Law"
description = "Consumer delivery fees and all-in pricing, merchant commission tiers, city commission caps, listing consent, the NYC data-sharing case, and tips."
category = "Commerce Industry"
order = 2345
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "fees", "all-in-pricing", "regulation", "commissions"]
+++

A delivery order carries two sets of fees: what the customer pays the platform (delivery, service, small-order and regulatory fees on top of the menu price), and what the merchant pays the platform (a commission on the order, sometimes a processing fee, sometimes marketing). Both are regulated, by different governments, in different ways. The FTC and state attorneys general police what the customer is told; California, Minnesota and Colorado have written that into statute; New York City, San Francisco and Portland cap what a restaurant can be charged; New York City and California forbid listing a restaurant that never agreed; and attorneys general have recovered tips that platforms used to cover their own pay guarantees.

For the system, every one of these rules applies to a specific class of charge line, at a specific location, on a specific date. This chapter covers the platforms' fee structures, consumer fees and all-in prices, merchant commission tiers, city commission caps, listing consent, the data-sharing law New York City lost in court, and tips. It extends `order_charges`, `locations` and `merchants` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Courier pay standards belong to the User-Generated Platforms volume's [Minimum Pay Standards](/books/user-generated-platforms/gig-work-and-worker-law#minimum-pay-standards), and its [Tips](/books/user-generated-platforms/gig-work-and-worker-law#tips) section covers tip pass-through from the worker's side; card processing fees and surcharges to the Payments volume's [Surcharging & Fees](/books/payments/surcharging-and-fees).

## How the Platforms Do It

Merchant plans in the US, as of October 2026, from each platform's merchant pricing page:

| Platform | Plans (delivery commission) | Pickup | What the higher tiers buy | Processing |
| --- | --- | --- | --- | --- |
| **DoorDash** | Basic 15%, Plus 25%, Premier 30% | 6% | A wider delivery radius, lower customer delivery fees, access to DashPass members; Premier adds a commission rebate guarantee and a sponsored listing | "No payment processing fee" on DoorDash orders; a processing fee on its commission-free online ordering |
| **Uber Eats** | Lite 20%, Plus 25%, Premium 30%; self-delivery 15% | 7% with validated in-store pricing, 10% without | More discoverability, lower delivery fees, ads visibility; Uber One orders cost Plus merchants an extra 5% and are included in Premium | A 3% card processing fee in New York City, processing fees in Portland |
| **Grubhub** | Marketing commission: Basic 5%, Plus 15%, All-access 20%; delivery fees "start at 10%" | Not stated | Lower customer delivery fees | Payment processing fees not included in the commission |

Three patterns:

- **The commission buys demand, not delivery alone.** The tiers trade a higher percentage for reach (radius, ranking, cheaper delivery for customers, membership eligibility), so a merchant's plan changes what customers see and pay, not only what the merchant nets.
- **Fees are split into named components where laws cap the total.** Grubhub separates marketing and delivery; Uber lists a 3% processing fee in New York City, the same 3% the city's transaction fee cap allows ([City Commission Caps](#city-commission-caps)).
- **Memberships are funded partly by merchants.** Uber charges Plus merchants an extra 5% on Uber One orders; DoorDash makes DashPass access a Plus and Premier feature ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#who-pays-for-the-benefit)).

## Consumer Fees and All-In Prices

The federal rule most people assume covers delivery doesn't. The FTC's Rule on Unfair or Deceptive Fees (16 CFR Part 464), effective May 12, 2025, targets "live-event ticketing and short-term lodging"; the User-Generated Platforms volume's [All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices) covers it. Delivery fees are governed instead by the FTC Act case by case, by state statutes, and possibly by a rule to come:

- **FTC enforcement.** In December 2024 the FTC and the Illinois attorney general alleged that Grubhub's "service fees" and "small order fees" were "simply delivery fees in disguise," often more than doubling the advertised price; the order requires disclosing the full delivery cost, under a $140 million judgment of which Grubhub pays $25 million. In December 2025 Instacart agreed to pay $60 million in consumer refunds over allegations that its "free delivery" claims were false because a mandatory service fee added up to 15% to the order; the stipulated order, entered in January 2026, bars misrepresenting delivery costs.
- **A delivery rule in the making.** On April 14, 2026 the FTC announced an advance notice of proposed rulemaking on fee practices of online food and grocery delivery platforms, asking whether they clearly disclose the total price, the existence, purpose and recipient of each fee, the factors behind variable fees, whether fees are mandatory, and whether item prices differ from in-store or from other users' prices. The notice ran in the Federal Register on April 16, 2026 (RIN 3084-AB88) with comments due May 18; as of October 28, 2026 the Federal Register has no later FTC document on food delivery fees, so no proposed rule yet. <!-- source-gap: ftc-delivery-fees-rule | status | whether the FTC has proposed a delivery fee rule after the April 2026 advance notice | closes with: a Federal Register NPRM under RIN 3084-AB88 or an FTC release | checked: 2026-10-28 -->
- **California.** The Honest Pricing Law (SB 478, Civil Code section 1770(a)(29)), effective July 1, 2024, bans advertising a price that leaves out mandatory fees. The Attorney General's guidance says food delivery platforms remain subject to the special rules for listing restaurant prices, "But when the food delivery platform advertises the price of the delivery service that it provides, it must advertise the full, all-in price of the delivery service." SB 1524 (2024) exempts mandatory fees charged by restaurants "so long as the fee is clearly and conspicuously displayed wherever prices are shown," and the law's rules mostly don't apply to items sold by a grocery store or a grocery delivery service it owns or contracts with.
- **Minnesota.** Statutes section 325D.44, subdivision 1a, bans advertising a price that "does not include all mandatory fees or surcharges," and gives delivery platforms a compliance path: disclose the added flat or percentage fee when the customer views or selects vendors or items, and show a pre-checkout page that "itemizes the price of the menu items and the additional fee." Restaurants must disclose the percentage of any automatic, mandatory gratuity.
- **Colorado.** HB25-1090, signed April 21, 2025 and effective January 1, 2026, bans deceptive pricing with safe harbors: a restaurant complies if its total includes any mandatory service charge and how it's distributed, and a "delivery network company" complies if it clearly and conspicuously discloses that an additional flat fee and mandatory fees are charged and that the total may vary.

The statutes differ in detail and agree on the shape: a fee the customer can't avoid must be visible before checkout, either inside the price or announced at the point the customer chooses a store or item, with an itemized subtotal before payment. What that means for the quote:

- **Classify every charge.** Mandatory (delivery, service, small-order, regulatory fees), optional (tip, priority delivery), government (tax) and contingent. The displayed price at each step is computed from classes, never typed.
- **Resolve the rule from the customer's and the location's jurisdiction,** on the order's date ([Rules as Data](/docs/architecture/rules-as-data)), defaulting to the strictest applicable.
- **Snapshot what was shown** at the store list, the item, the cart and checkout, because every one of these cases asks what the customer saw before paying.

## Merchant Commission Tiers

A merchant's commission is a plan, versioned, applied per order to a defined base. What the base includes (subtotal before or after discounts, tax, the merchant-funded part of a promotion) differs by contract, and the cap laws below define their own base ("the purchase price of each online order"). Plans also change: introductory rates (DoorDash's 0% for the first 7 or 30 days, Uber's 0% for 30 days), rebates conditioned on volume and cancellations (DoorDash Premier's rebate requires at least 20 orders in the month), and plan switches mid-month. My rule: the plan in force at `placed_at` decides, each commission line records the plan version and base, and a rebate is a separate credit line computed at month end, never a rewrite of the order's commission.

## City Commission Caps

Cities capped commissions during the 2020 dining shutdowns, and some made the caps permanent:

| City | Cap | Structure |
| --- | --- | --- |
| **New York City** (Admin. Code section 20-563.3) | Delivery fee 15%; transaction fee 3% (more only if it equals the processor's charge to the platform, provable on request); basic service fee 5%; enhanced service fee 20%, only if a basic plan at the basic caps is offered and includes delivery | Per online order, on the purchase price; made permanent by Local Law 103 of 2021, the enhanced tier added by Local Law 79 of 2025 |
| **San Francisco** (Police Code Article 53) | 15% per online order, until January 30, 2023; from January 31, 2023 the cap doesn't apply to a platform that offers every covered restaurant core delivery service for 15% or less without requiring other services | Core service excludes advertising, search placement, consulting and card processing; applies to platforms with at least 20 separately owned restaurants; platforms can't restrict restaurants' prices |
| **Portland, Oregon** (City Code 7.27.020) | Delivery fee 15%; takeout fee 4%; orders under $10 may carry a $1.50 fee instead | No fee the restaurant has not voluntarily agreed to pay |

The history matters for the data model. New York City's 2020 emergency caps (Local Law 52 of 2020) applied only during a declared emergency barring indoor dining and for 90 days after, with penalties of up to $1,000 per restaurant per day; Local Law 103 of 2021 made them permanent; DoorDash, Grubhub and Uber Eats sued in September 2021 (No. 1:21-cv-07564, S.D.N.Y.); and in 2025 the parties reached a settlement anticipating the Council's changes, which became Local Law 79 of 2025. San Francisco's case was stayed in July 2022 pending the ordinance that created the core-service option. Each change is a new rule version with its own effective date, and an order is judged by the version in force when it was placed. I could confirm the New York settlement only through press coverage, not the docket. <!-- source-gap: nyc-fee-cap-settlement | secondary | the 2025 settlement and dismissal of DoorDash v. City of New York over the fee caps | closes with: the S.D.N.Y. docket entry of dismissal in No. 1:21-cv-07564 (PACER needs a login; CourtListener showed a human-verification wall) | checked: 2026-10-28 --> Other cities adopted permanent caps too; I could confirm Minneapolis's only from secondary sources and left it out of the table. <!-- source-gap: minneapolis-fee-cap | secondary | a permanent 15% delivery commission cap in Minneapolis | closes with: the Minneapolis Code of Ordinances section or the December 2021 council file on lims.minneapolismn.gov (Municode's search never finished loading) | checked: 2026-10-28 -->

What a cap does to the system:

- **Fees get classes.** New York's caps apply to delivery, transaction, basic service and enhanced service fees separately, so every merchant-side charge needs a class that maps to the city's categories, and the basic plan must exist for the enhanced fee to be lawful.
- **The check is per order and runs before settlement.** The commission engine computes each class against the cap on the order's base, clips or flags anything over, and records which cap rule applied.
- **Location decides.** The cap follows the restaurant's location (`locations.locality`), so a brand with stores inside and outside the city has orders under different rules on the same plan.

## Listing Without Consent

California's Fair Food Delivery Act (AB 2149, 2020) prohibits a platform from arranging delivery from a food facility "without first obtaining an agreement with the food facility expressly authorizing the food delivery platform to take orders and deliver meals." New York City's Local Law 91 of 2021 bans listing an establishment without a written agreement, with penalties of up to $500 a day per establishment, and bars agreements that make the restaurant indemnify the platform for harm after pickup. The FTC's 2024 order against Grubhub, which it alleged had listed as many as 325,000 unaffiliated restaurants, requires it to stop listing them. [Onboarding Merchants](/books/commerce/merchants-menus-and-catalogs#onboarding-merchants) covers the agreement record that makes a listing publishable.

California's AB 286 (2021) added rules for listed restaurants too: a platform may not charge more than the price the restaurant set, may not keep any part of a tip, and must give the customer and the restaurant an itemized breakdown of the order's costs (Business and Professions Code section 22599.1).

## Data Sharing

New York City's Local Law 90 of 2021 required delivery platforms to share customer data with the restaurants customers ordered from, presuming each customer consented unless they opted out for that order. DoorDash, Grubhub and Uber sued, and the city agreed to stay enforcement during the case. The district court held that the law violated the First Amendment's protection against compelled speech and permanently enjoined the city from enforcing it against the platforms. On August 5, 2026 the Second Circuit affirmed (DoorDash, Inc. v. City of New York, No. 25-81), holding that the law must satisfy at least intermediate scrutiny under *Central Hudson* and does not. As of October 28, 2026 the Supreme Court's docket search shows no petition or extension application in the case; under the Court's Rule 13 the city has 90 days from the judgment, to November 3, 2026, unless a rehearing petition in the Second Circuit restarted the clock, which I couldn't check. <!-- source-gap: nyc-data-law-further-review | status | any en banc or certiorari petition after the Second Circuit's August 5, 2026 decision | closes with: the Second Circuit docket for No. 25-81 (PACER) or a Supreme Court docket entry after November 3, 2026 | checked: 2026-10-28 -->

The case doesn't stop a platform from sharing customer data with consent; it stops a city from forcing it on an opt-out basis. A customer who asks to join a restaurant's marketing list is a consent record (who, which restaurant, which channel, when, withdrawn when), exactly as the playbook's [Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data) and [Calls, Texts & Email](/docs/compliance/consumer-contact) describe.

## Tips

A tip is the customer's money for the courier, and two enforcement actions show what happens when the system treats it as anything else:

- **New York.** On February 24, 2025 the New York attorney general announced that DoorDash would pay $16.75 million in restitution to Dashers because, between May 2017 and September 2019, it "used customer tips to offset the base pay it had already guaranteed to workers," and must keep a pay model that pays tips to Dashers "in their entirety."
- **District of Columbia.** On November 24, 2020 the District's attorney general announced a $2.5 million settlement with DoorDash over the same practice: it "used these tips from consumers to cover its own payments to workers."

California's AB 286 forbids platforms from retaining any portion of a tip, and AB 578, approved October 6, 2025 as Chapter 341 of the Statutes of 2025 (a non-urgency statute, so in force from January 1, 2026), adds the rest. A platform may not keep "a payment model that uses any amount designated as tips or gratuity to offset the base pay," and must show the courier an itemized breakdown of base pay, tips and promotional bonuses. A customer whose order isn't delivered or is wrong gets a full refund unless the platform finds the customer responsible or evidence of fraud, and the tip is refunded to the customer without being taken back from the courier. A partly fulfilled order is charged only for what arrived, with taxes, fees and tips on the missing items adjusted. The platform must also offer a way to reach a natural person when its automated support can't resolve the problem.

The design rule is that **a tip is never an input to the platform's pay calculation.** Courier pay is computed first, from the offer the courier accepted; the tip is added on top, in full, as a separate line paid to the courier, and any reconciliation that compares pay with tips is a report, not a formula. The ledger keeps tips in their own liability account until paid, so "were all tips paid in full" is a balance check ([A Chart of Accounts](/docs/payments/payment-states#a-chart-of-accounts)).

## How to Build It

```sql
CREATE TABLE commission_plans (          -- a merchant plan, versioned
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id    TEXT NOT NULL REFERENCES sales_channels (id),
  name          TEXT NOT NULL,           -- 'basic', 'plus', 'premier'
  version       INT NOT NULL,
  delivery_rate NUMERIC(6, 4) NOT NULL,  -- 0.1500
  pickup_rate   NUMERIC(6, 4) NOT NULL,
  self_delivery_rate NUMERIC(6, 4),
  membership_surcharge_rate NUMERIC(6, 4),  -- e.g. extra on member orders
  base          TEXT NOT NULL CHECK (base IN ('subtotal', 'subtotal_after_merchant_discounts')),
  valid_during  TSTZRANGE NOT NULL,
  UNIQUE (channel_id, name, version)
);

CREATE TABLE fee_rules (                 -- caps and disclosure rules by jurisdiction
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  country       CHAR(2) NOT NULL,
  subdivision   TEXT,
  locality      TEXT,                    -- null: statewide or national
  kind          TEXT NOT NULL CHECK (kind IN ('merchant_fee_cap', 'consumer_display',
                  'tip_rule', 'listing_consent')),
  fee_class     TEXT,                    -- 'delivery', 'transaction', 'basic_service',
                                         -- 'enhanced_service', ...
  max_rate      NUMERIC(6, 4),           -- 0.1500 of the base
  min_order     BIGINT,                  -- e.g. Portland's flat fee below $10
  flat_max      BIGINT,
  conditions    JSONB NOT NULL DEFAULT '{}',  -- e.g. requires a basic plan to be offered
  source_ref    TEXT NOT NULL,           -- the code section or local law
  valid_during  DATERANGE NOT NULL
);

ALTER TABLE order_charges
  ADD COLUMN charge_class TEXT CHECK (charge_class IN ('mandatory', 'optional', 'government',
    'contingent')),
  ADD COLUMN fee_class    TEXT,          -- merchant-side class the cap rules use
  ADD COLUMN base_amount  BIGINT,        -- what a percentage was applied to
  ADD COLUMN fee_rule_id  UUID REFERENCES fee_rules (id);  -- the cap that clipped it, if any

CREATE TABLE price_displays (            -- what the customer saw, at each step
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id     UUID REFERENCES orders (id),  -- null before an order exists
  session_ref  TEXT NOT NULL,
  step         TEXT NOT NULL CHECK (step IN ('store_list', 'store', 'item', 'cart',
                 'checkout')),
  shown_total  BIGINT,
  shown_fees   JSONB NOT NULL,           -- each fee line and its label as displayed
  rule_ids     UUID[] NOT NULL,          -- display rules applied
  shown_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merchant_statements (       -- itemized, per location and period
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  channel_id   TEXT NOT NULL REFERENCES sales_channels (id),
  period       DATERANGE NOT NULL,
  gross_sales  BIGINT NOT NULL,
  fees_by_class JSONB NOT NULL,          -- totals per fee_class, from order_charges
  adjustments  BIGINT NOT NULL,          -- error charges and credits
  net_payout   BIGINT NOT NULL,
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (location_id, channel_id, period)
);

-- Orders whose merchant fees exceed the cap in force where and when they were placed.
SELECT o.id, c.fee_class, SUM(c.amount) AS charged, r.max_rate * MIN(c.base_amount) AS cap
FROM orders o
JOIN locations l      ON l.id = o.location_id
JOIN order_charges c  ON c.order_id = o.id AND c.payer = 'merchant'
JOIN fee_rules r      ON r.kind = 'merchant_fee_cap'
                     AND r.country = l.country
                     AND r.locality IS NOT DISTINCT FROM l.locality
                     AND r.fee_class = c.fee_class
                     AND r.valid_during @> o.placed_at::date
GROUP BY o.id, c.fee_class, r.max_rate
HAVING SUM(c.amount) > r.max_rate * MIN(c.base_amount);
```

Design notes:

- **Caps are rows with a source.** Each `fee_rules` row cites the code section or local law it encodes and its effective range, so the 2020 emergency cap, the 2021 permanent cap and the 2025 enhanced tier are three rows, and an old order is checked against the one in force.
- **The cap check is a query and a gate.** The same comparison runs before settlement (clip or hold) and afterwards as a report a regulator or merchant can request.
- **Displays are evidence.** `price_displays` stores fee labels as shown, because the Grubhub and Instacart cases turned on what a fee was called ("service fee", "free delivery") as much as its amount.
- **Statements are generated from charges.** A merchant statement is a sum over `order_charges` by class; it is never edited, and corrections arrive as adjustments on the next one.

## Auditing

- **Every fee with its rule.** Each charge's class, base, plan version and any cap rule applied, by order, so a cap complaint or an audit by a city agency is a query.
- **What customers were shown.** Fee labels and totals at each step, with the display rules applied.
- **Listing agreements and their terms,** including indemnity clauses the city laws restrict.
- **Tips, separately.** Every tip, its payout to the courier and the ledger balance proving it was paid in full.
- **Statements as issued.** Each merchant statement and the order charges it summed.

## What This Means for the System You Build

- **Classify every charge** as mandatory, optional, government or contingent, and compute displayed prices from classes.
- **Snapshot fee labels and totals** at each step the customer sees.
- **Version merchant plans** and record the plan and base on every commission line.
- **Encode caps as effective-dated rules with their source,** keyed to the location's city, with fee classes matching the law's.
- **Check caps per order before settlement,** and keep the same query as a report.
- **Publish no listing without an agreement.**
- **Collect customer data for merchants only with recorded consent.**
- **Pay tips in full as a separate line,** never as an input to courier pay.

## References

**Law and regulation**

- [FTC: Rule on Unfair or Deceptive Fees takes effect May 12, 2025](https://www.ftc.gov/news-events/news/press-releases/2025/05/ftc-rule-unfair-or-deceptive-fees-take-effect-may-12-2025), scope limited to live-event ticketing and short-term lodging
- [California Attorney General: SB 478, the Honest Pricing Law](https://oag.ca.gov/hiddenfees), food delivery platforms advertising the all-in price of delivery service, the SB 1524 restaurant exemption, the grocery exemption
- [Minnesota Statutes section 325D.44](https://www.revisor.mn.gov/statutes/cite/325D.44), subdivision 1a: mandatory fees in advertised prices, the delivery platform compliance path, automatic gratuity disclosure
- [Colorado General Assembly: HB25-1090](https://leg.colorado.gov/bills/hb25-1090), deceptive pricing safe harbors for restaurants and delivery network companies, signed April 21, 2025, effective January 1, 2026
- [New York City Council: Local Law 103 of 2021 (text)](https://intro.nyc/local-laws/2021-103), section 20-563.3's 15%, 5% and 3% caps without expiration, passed August 26, 2021
- [New York City Council: Local Law 52 of 2020](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4344564&GUID=BAB73224-E999-411A-8C42-1BDF14C0DACE), the emergency caps and the $1,000 daily penalty
- [New York City Council: Local Law 100 of 2021](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4344527&GUID=6ABD2852-C9A4-4F4B-A996-064475CAD03E), the licensing law the permanent caps took effect with
- [New York City Council: Local Law 79 of 2025](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=6632578&GUID=874ADD05-D520-4896-BA03-79A18349EADD), the 20% enhanced service fee conditioned on a basic service at the basic caps
- [NYC Department of Consumer and Worker Protection: Restaurants using delivery apps](https://www.nyc.gov/site/dca/businesses/Restaurants-Using-Delivery-Apps.page), the current delivery, transaction, basic and enhanced fee caps and written listing agreements
- [San Francisco: Third-party food delivery services FAQ (November 2022)](https://www.sf.gov/sites/default/files/2022-11/Delivery%20Services%20FAQ.11.2022.pdf), Police Code Article 53, the 15% cap, the core-service option from January 31, 2023, coverage and price restrictions
- [Portland City Code 7.27.020](https://www.portland.gov/code/7/27/020), the 15% delivery and 4% takeout caps and the under-$10 rule
- [New York City Council: Local Law 91 of 2021](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4988638&GUID=7AD12CDE-B09E-486D-A189-98AD23128D8B), no listing without a written agreement, penalties, indemnity limits
- [New York City Council: Local Law 90 of 2021](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4951001&GUID=4CB11989-5925-418B-9627-B2AED230D67F), the customer data-sharing law
- [California Senate Judiciary Committee: Analysis of AB 578 (2025)](https://sjud.senate.ca.gov/media/1843), the Fair Food Delivery Act's agreement requirement, section 22599.1, and AB 578's refund, tip and customer-service provisions
- [California Legislative Information: AB 578 (2025), chaptered](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB578), Chapter 341, Statutes of 2025, approved October 6, 2025: tips not offsetting base pay, courier pay breakdown, refunds and partial orders, a natural person for support
- [California Senate Judiciary Committee: Analysis of AB 286 (2021)](https://sjud.senate.ca.gov/sites/sjud.senate.ca.gov/files/ab_286_l_gonzalez_sjud_analysis.pdf), the price, tip and itemization rules

**Cases and enforcement**

- [DoorDash, Inc. v. City of New York, No. 25-81 (2d Cir. August 5, 2026)](https://ww3.ca2.uscourts.gov/decisions/OPN/25-81_complete_opn.pdf), the data-sharing law's opt-out presumption, the district court's injunction, intermediate scrutiny under Central Hudson, affirmance
- [Supreme Court Rule 13 (LII)](https://www.law.cornell.edu/rules/supct/rule_13), 90 days from the judgment to petition for certiorari, restarted by a timely rehearing petition, extensions up to 60 days
- [DoorDash v. City and County of San Francisco, No. 3:21-cv-05502, stipulation staying the case (Docket Alarm)](https://www.docketalarm.com/cases/California_Northern_District_Court/3--21-cv-05502/Doordash_Inc._et_al_v._City_and_County_of_San_Francisco/70/), the July 2022 stay pending the Article 53 amendments
- [Insurance Journal: Delivery apps settle with New York City over fee caps (June 2025)](https://amp.insurancejournal.com/news/east/2025/06/09/826752.htm), secondary coverage of the settlement and dismissal with prejudice
- [FTC: Action against Grubhub (December 17, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-illinois-attorney-general-take-action-against-grubhub-harming-diners-workers-small-businesses), fees as delivery fees in disguise, the judgment and payment, the order's terms
- [FTC: Instacart to pay $60 million (December 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/instacart-pay-60-million-consumer-refunds-settle-ftc-lawsuit-over-allegations-it-engaged-deceptive), "free delivery" and the up-to-15% service fee
- [FTC: Instacart case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/instacart), the stipulated order entered January 14, 2026
- [FTC: Public comment on fee practices of online food and grocery delivery services (April 14, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-seeks-public-comment-unfair-deceptive-fee-practices-online-food-grocery-delivery-services), the advance notice's questions
- [Federal Register: Rule on Unfair or Deceptive Fees in Online Food Delivery Services (2026-07473)](https://www.federalregister.gov/documents/2026/04/16/2026-07473/rule-on-unfair-or-deceptive-fees-in-online-food-delivery-services), the advance notice of proposed rulemaking, April 16, 2026, RIN 3084-AB88, comments due May 18, 2026
- [New York Attorney General: $16.75 million from DoorDash (February 24, 2025)](https://ag.ny.gov/press-release/2025/attorney-general-james-secures-1675-million-doordash-cheating-delivery-workers), tips used to offset guaranteed pay and the requirement to pay tips in full
- [District of Columbia Attorney General: $2.5 million agreement with DoorDash (November 24, 2020)](https://oag.dc.gov/release/ag-racine-reaches-25-million-agreement-doordash), tips used to cover DoorDash's own payments to workers

**Platform pricing**

- [DoorDash: Merchant pricing](https://merchants.doordash.com/en-us/pricing), Basic, Plus and Premier commissions, pickup, introductory rates, the rebate conditions, processing
- [Uber Eats: Merchant pricing (US)](https://merchants.ubereats.com/us/en/pricing/), Lite, Plus, Premium and self-delivery fees, pickup fees, the Uber One surcharge, the NYC processing fee
- [Grubhub: Marketplace for restaurants](https://get.grubhub.com/products/marketplace/), marketing commissions by plan, delivery fees from 10%, processing excluded
