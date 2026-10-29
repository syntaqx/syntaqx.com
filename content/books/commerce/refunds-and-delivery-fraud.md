+++
title = "Refunds, Missing Items & Fraud"
nav_title = "Refunds, Missing Items & Fraud"
description = "Missing and wrong items, who pays for an error, merchant error charges and disputes, refund abuse, courier fraud, account takeover and promotion abuse."
category = "Commerce Industry"
order = 2347
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "refunds", "fraud", "risk", "disputes"]
+++

Something goes wrong with a meaningful share of delivery orders: a drink left off, the wrong burger, a bag delivered to the neighbor, an order marked delivered that never arrived. The customer reports it in the app, usually with no evidence beyond their word and maybe a photo, and expects money back in minutes. The platform has to decide whether to believe them, how much to give back and in what form, and who pays for it: the merchant who packed the bag, the courier who carried it, or the platform itself. Every one of those decisions is also an attack surface. Customers learn which reports are refunded without question, couriers learn which orders can be marked delivered and kept, attackers take over accounts with stored cards and credits, and promotion budgets are drained by people with many accounts.

This chapter covers how the platforms handle missing and wrong items, who pays for an error, merchant error charges and their disputes, and the fraud each side commits: refund abuse by customers, fraud by couriers and insiders, account takeover, and promotion abuse. It extends `orders`, `order_lines` and `customers` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Card fraud and chargebacks are the Payments volume's [Fraud & Risk](/books/payments/fraud-and-risk) and [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks); the scoring machinery is the playbook's [Automated Risk Decisions](/docs/architecture/risk-scoring).

## How the Platforms Do It

As of October 2026, from each platform's customer and merchant help pages:

| Platform | Customer reports | Customer remedy | Merchant charged | Merchant dispute |
| --- | --- | --- | --- | --- |
| **DoorDash** | In the order's help screen, "Missing or incorrect items"; photos with all items visible and unwrapped | "Credit, Refund, or Redelivery" when available | 25% to 100% of the item price plus tax; nothing for reports made 72 or more hours after delivery, or where fraud is identified | Within 14 days of delivery, from the transactions screen; usually decided within hours |
| **Uber Eats** | "Please contact us within 48 hours" | A refund of the item's price including tax; the whole order plus the delivery fee if it's entirely wrong; no replacement | Refunds less delivery fees deducted from payouts, from a portion to the full cost; no support, delivery or bag fees | Within 30 days of the order (UK and Canada pages); aims to resolve in about an hour |
| **Grubhub** | Credits or refunds "on a case-by-case basis" | Credit or refund | Missing items, incorrect preparation, food quality, damaged handoff, late self-delivery | Within 30 days, from the transactions screen or merchant support |
| **Instacart** | "Report an issue" on the order | Refunds processed immediately, appearing in 5 to 10 business days | Retailer-side terms not public | Not public |

Three patterns:

- **The customer is paid first, the cause is found later.** Every platform refunds or credits quickly and decides fault afterward, which is good service and an open door for abuse.
- **The merchant pays for kitchen errors, with a window to object.** DoorDash charges a percentage of the item; Uber deducts the refund; Grubhub lists the reasons it charges. Each gives the merchant 14 to 30 days to dispute.
- **Platforms absorb what they can't attribute.** DoorDash doesn't charge merchants for reports made 72 hours or more after delivery or for orders it identifies as fraud; Uber escalates high-value, alcohol and first-time-customer cases and makes no adjustment on suspicious refunds.

## Who Pays for an Error

A missing or wrong item has four possible causes, and each has a payer:

| Cause | Typical evidence | Who pays |
| --- | --- | --- |
| Kitchen or store error: item not packed, wrong item, wrong preparation | Customer report and photo; the merchant's own ticket; repeated reports at the location | The merchant, through an error charge it can dispute |
| Courier error: wrong bag picked up, bag delivered to the wrong door, spill | Handoff record, location trail, delivery photo | The platform, and the courier through quality standards (pay rules for couriers are the [gig work chapter](/books/user-generated-platforms/gig-work-and-worker-law)'s subject) |
| Platform error: item unavailable but listed, menu out of sync, no courier | Availability and menu history, the order's state changes | The platform |
| Fraud: the report is false, or the courier or an insider took the order | Customer and courier history, linked accounts, device and location signals | The platform, which recovers what it can and acts on the accounts |

The allocation is a decision recorded per issue, with its evidence and rule, not an accounting convention. A customer refund, a merchant error charge and a courier quality event are three separate records tied to the same issue; the merchant's dispute reopens the merchant's part only. California's AB 578 (Chapter 341, Statutes of 2025) adds a floor for the customer: Business and Professions Code section 22599.2 requires a full refund, including taxes, commissions, fees and tips, when an order isn't delivered or the wrong order is delivered, unless the platform finds the customer responsible or evidence the request may be fraudulent, and the tip is refunded without being taken back from the driver ([Tips](/books/commerce/delivery-fees-and-the-law#tips)).

## Refunds and Credits

A remedy has a form and a scope:

- **Form.** A refund to the original payment method, platform credit, or a redelivery. Credit is cheaper for the platform and keeps the customer ordering; a refund is what the law increasingly requires on request (AB 578 requires, alongside any other refund options, a way for the customer to ask for the refund on the original payment method). The FTC's complaint against Instacart alleged it advertised a "100% satisfaction guarantee" but "hid the refund option from the 'self-service' menu," usually offering a small credit instead.
- **Scope.** The item's price and its tax for a missing item; the whole order and its fees for a wrong or undelivered order (Uber's pages draw exactly that line); a prorated share of fees for a partial order where the law requires it.
- **Timing.** A refund on a card that was only authorized is a smaller capture or a partial reversal; after capture it's a refund object with its own lifecycle ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)). A grocery order, whose total changes after shopping, is often settled after the substitution decisions and the issue report, which affects which of the two applies.

A refund and a chargeback on the same order must net: a customer refunded in the app who also disputes with the bank should not be paid twice, which is why the issue record links to the payment records and the dispute flow checks it ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

## Merchant Error Charges and Disputes

An error charge is the platform passing a refund's cost to the merchant. The published rules converge on a structure worth copying:

- **A charge per line, not per order.** DoorDash charges "between 25% to 100% of the applicable item price + tax"; Uber charges "from a portion up to the full cost" and excludes support costs, delivery fees and bag fees.
- **A window after which the merchant isn't charged.** DoorDash absorbs reports made 72 hours or more after delivery.
- **Evidence and fraud screening before charging.** DoorDash evaluates "photo evidence, error type, potential customer or Dasher fraud"; customers it flags must submit photos and those with high refund rates get manual review, and "if identified as fraudulent, you will not be charged." Uber escalates high-value, alcohol and first-time-customer cases to a trained team.
- **A dispute with a deadline and a decision.** 14 days on DoorDash, 30 on Uber Eats (UK and Canada) and Grubhub, through the merchant's portal, decided in hours, with the outcome on the next statement.

Merchants have their own evidence: the order's ticket, a photo of the packed bag, a sealed-bag policy. A dispute record stores what the merchant submitted and what decided it, and a merchant whose disputes win at a high rate is a signal about the customers or couriers on those orders, not only about the merchant.

## Customer Refund Abuse

Most false reports are individuals claiming a missing item that wasn't missing; some are organized. Incognia's 2025 report on gig-economy fraud, a vendor's analysis of risk assessments at just over half of the largest food delivery and ride-hailing companies, found refund abuse and promotion abuse tied as the top consumer-side fraud types at 48% each. Press coverage in 2024 described refund services advertised on Telegram and TikTok, some offering food-delivery orders so buyers could "eat for free," charging 15% to 30% of the refund. The same abuse against returned goods (wardrobing, empty boxes, refund services) is [Return Fraud and Abuse](/books/commerce/returns-and-exchanges#return-fraud-and-abuse).

The defenses are the same machinery as payments fraud, applied to issue reports:

- **History over the single report.** Refund rate per customer, per address, per device and per payment instrument, compared with the location's error rate. A customer reporting missing items from many unrelated restaurants is a different signal from a restaurant with many reports from unrelated customers.
- **Friction by band.** Instant refund for low-risk reports, a photo requirement or credit-only for medium risk, manual review for high risk, as DoorDash describes for flagged customers ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)).
- **Linked identities.** Refund services and multi-accounting reuse devices, addresses and cards; linking them is what turns one refund at a time into a ring (see [Promotion Abuse](#promotion-abuse)).
- **Outcomes as labels.** A refund later reversed by a chargeback, a merchant dispute won with a photo of the packed bag, or a courier's delivery photo showing the item are the labels a model learns from, and they arrive late ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).

## Courier and Insider Fraud

Couriers and employees can steal orders, money or accounts:

- **Order manipulation with insider access.** On May 13, 2025 a former DoorDash driver pleaded guilty in federal court in San Jose to a conspiracy that took more than $2.5 million from DoorDash in 2020 and 2021, the third defendant convicted in it: high-value orders were placed on customer accounts, reassigned to driver accounts the group controlled using an employee's credentials, marked delivered so DoorDash paid for deliveries that never happened, reset to in-process and reassigned again, a cycle that "usually took less than five minutes, and was repeated hundreds of times."
- **Fake and rented courier accounts.** Incognia's 2025 report found fake accounts in 57% of driver-side fraud it assessed. Federal prosecutors have charged rings that did this at scale. In May 2021 prosecutors in Massachusetts charged 19 people with opening driver accounts at at least five rideshare and delivery companies using more than 2,000 stolen identities, then renting or selling them to drivers who couldn't qualify or pass a background check, farming referral bonuses with fake accounts, and using bots and GPS spoofing to raise earnings. The same week prosecutors in San Diego charged five people with a ring that moved from rideshare to food and grocery delivery in spring 2020 and stole more identities while verifying customers' IDs on deliveries. The User-Generated Platforms volume's [Worker Identity and Account Renting](/books/user-generated-platforms/gig-work-and-worker-law#worker-identity-and-account-renting) treats the controls.
- **Marked delivered, never delivered.** The delivery photo, the location trail at completion and the handoff type are the evidence ([Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)); a courier with a high rate of "never arrived" reports across unrelated customers is the pattern.

The insider case is the instructive one for the design. The fraud didn't break the order state machine; it used an internal tool that could move an order backward from delivered and reassign it, with no second approval and no alert on the repeat. Backward transitions out of terminal states, reassignment after pickup and any change made through a support tool are exactly the transitions to restrict, require a reason for, log with the employee's identity and alert on ([Support Access](/docs/security/support-access)).

## Account Takeover

A delivery account holds a stored card, credits, a membership and an address, which makes it worth stealing; a merchant portal holds a bank account for payouts, which is worth more. Uber's 2017 description of Mastermind, its rules engine, lists the threats together: "payment fraud, account takeover, driver-partner/rider collusion, and promotion abuse." For merchants, DoorDash said in June 2024 that it added an extra verification step for bank account changes and real-time risk detection against merchant impersonation, and in December 2025 that "sensitive actions will require enhanced two-factor authentication," with ownership transfers needing the owner's approval plus a government ID and selfie.

The pattern for both sides: a sign-in from a new device is scored; a change to where money goes (a new card on a customer account, a new bank account on a merchant's) is a sensitive action that requires step-up authentication and, for payouts, a hold on the first payout to the new account. The User-Generated Platforms volume's [Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense) and the playbook's [Authentication](/docs/security/authentication) cover the mechanics.

## Promotion Abuse

New-customer discounts and referral credits are paid per account, so creating accounts is the attack. DoorDash's promotional terms limit "one Offer per person as determined by DoorDash in its sole discretion," cap credits at "$500 per person per year," and void new-customer offers if the name, email, phone or card links to "an existing active or inactive DoorDash account." The terms define the rule; enforcing it is identity linking: devices, payment fingerprints, addresses and phone numbers shared across accounts, resolved into one person or household before an offer is granted ([Record Linkage](/docs/architecture/record-linkage)).

Two design rules follow. **Decide eligibility at redemption against the linked identity,** not at sign-up against the account, because the abuse shows up as the second account's first order. **Record every redemption with the identity links that were checked,** because a customer denied an offer, or a promotion budget audited, needs the evidence.

Detection systems for all of this combine rules and models. Uber's Mastermind was a rules engine that "can detect highly evolved forms of fraud in a fraction of a second"; its later RADAR system "detects the start of a fraud attack, and generates a rule to stop it," with analysts approving rules, treating an attack as a time series anomaly. [Rules and Models Together](/docs/architecture/risk-scoring#rules-and-models-together) is the general pattern.

## How to Build It

```sql
CREATE TABLE order_issues (              -- a customer's report about an order
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id     UUID NOT NULL REFERENCES orders (id),
  kind         TEXT NOT NULL CHECK (kind IN ('missing_item', 'wrong_item', 'wrong_order',
                 'not_delivered', 'damaged', 'quality', 'late')),
  reported_via TEXT NOT NULL CHECK (reported_via IN ('app', 'web', 'support', 'chargeback')),
  reported_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence     JSONB NOT NULL DEFAULT '[]',  -- photo references and notes
  risk_decision_id UUID,                 -- the scoring decision, per the playbook
  cause        TEXT CHECK (cause IN ('merchant', 'courier', 'platform', 'fraud', 'unknown')),
  decided_at   TIMESTAMPTZ
);

CREATE TABLE issue_lines (               -- which lines the issue is about
  issue_id      UUID NOT NULL REFERENCES order_issues (id),
  order_line_id UUID NOT NULL REFERENCES order_lines (id),
  quantity      NUMERIC(12, 3) NOT NULL,
  PRIMARY KEY (issue_id, order_line_id)
);

CREATE TABLE issue_resolutions (         -- what the customer got
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  issue_id    UUID NOT NULL REFERENCES order_issues (id),
  form        TEXT NOT NULL CHECK (form IN ('refund', 'credit', 'redelivery', 'none')),
  amount      BIGINT NOT NULL DEFAULT 0,
  payment_ref TEXT,                      -- the refund or credit record
  rule_ref    TEXT NOT NULL,             -- the policy version that decided it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE error_charges (             -- the merchant's share, per line
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  issue_id     UUID NOT NULL REFERENCES order_issues (id),
  location_id  UUID NOT NULL REFERENCES locations (id),
  order_line_id UUID REFERENCES order_lines (id),
  share        NUMERIC(5, 4) NOT NULL CHECK (share > 0 AND share <= 1),  -- of price plus tax
  amount       BIGINT NOT NULL,
  dispute_by   TIMESTAMPTZ NOT NULL,     -- e.g. 14 or 30 days after the order
  status       TEXT NOT NULL CHECK (status IN ('charged', 'disputed', 'upheld', 'reversed')),
  statement_id UUID                      -- merchant_statements, when it lands
);

CREATE TABLE error_charge_disputes (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  error_charge_id UUID NOT NULL REFERENCES error_charges (id),
  submitted_at    TIMESTAMPTZ NOT NULL,
  merchant_evidence JSONB NOT NULL,
  outcome         TEXT CHECK (outcome IN ('upheld', 'reversed')),
  decided_by      TEXT,                  -- reviewer or rule
  decided_at      TIMESTAMPTZ
);

CREATE TABLE identity_links (            -- devices, cards, addresses, phones shared across accounts
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id  UUID NOT NULL REFERENCES customers (id),
  kind         TEXT NOT NULL CHECK (kind IN ('device', 'payment_fingerprint', 'address',
                 'phone', 'email')),
  value_hash   BYTEA NOT NULL,           -- hashed, never the raw card or phone
  first_seen   TIMESTAMPTZ NOT NULL,
  last_seen    TIMESTAMPTZ NOT NULL,
  UNIQUE (customer_id, kind, value_hash)
);

CREATE TABLE promotion_redemptions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  promotion_ref TEXT NOT NULL,
  customer_id   UUID NOT NULL REFERENCES customers (id),
  order_id      UUID REFERENCES orders (id),
  decision      TEXT NOT NULL CHECK (decision IN ('granted', 'denied')),
  linked_customers UUID[] NOT NULL DEFAULT '{}',  -- accounts the identity check found
  amount        BIGINT NOT NULL DEFAULT 0,
  decided_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers whose missing-item reports span many unrelated locations.
SELECT o.customer_id, COUNT(*) AS reports, COUNT(DISTINCT o.location_id) AS locations
FROM order_issues i
JOIN orders o ON o.id = i.order_id
WHERE i.kind IN ('missing_item', 'not_delivered')
  AND i.reported_at > NOW() - INTERVAL '90 days'
GROUP BY o.customer_id
HAVING COUNT(DISTINCT o.location_id) >= 5;
```

Design notes:

- **Issue, resolution, charge and dispute are separate rows.** The customer's refund doesn't wait for the merchant's dispute, and reversing a merchant charge doesn't claw back the customer's refund.
- **Charges carry their dispute deadline,** computed when charged ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Identity links are hashed.** Matching needs equality, not the raw card number or phone, which keeps the linking table out of card data scope ([Sensitive Payment Data](/docs/payments/sensitive-data)).
- **Restrict backward transitions.** Moving an order out of `fulfilled`, or a fulfillment out of `delivered`, goes through a privileged path that records the employee and reason and alerts on repetition, closing the gap the insider scheme used.

## Auditing

- **Every issue, its evidence and its decision.** Report, photos, risk decision, cause and the policy version, so a customer complaint, a merchant dispute or a regulator's question about refunds has an answer.
- **Every error charge and dispute,** with the share charged, the deadline, the merchant's evidence and the outcome, tied to the statement it landed on.
- **Every privileged change to an order,** with the employee, the tool and the reason.
- **Every promotion decision** with the linked identities checked.

## What This Means for the System You Build

- **Pay the customer quickly and decide fault separately,** with issue, resolution, merchant charge and dispute as distinct records.
- **Allocate each issue to a cause and a payer by recorded rule.**
- **Offer a refund to the original payment method,** not only credit, and net app refunds against chargebacks.
- **Charge merchants per line with a dispute window,** screen for fraud before charging, and absorb what can't be attributed.
- **Score issue reports with history and linked identities,** and add friction by band.
- **Lock down backward transitions and support-tool changes,** with reasons, identities and alerts.
- **Treat payout and card changes as sensitive actions** requiring step-up authentication.
- **Check promotions against linked identities at redemption,** and record what was checked.

## References

**Platform policies**

- [DoorDash: My order was missing an item or incorrect](https://help.doordash.com/en-us/consumers/article/my-order-was-missing-an-item-incorrect-order), reporting, photos, credit, refund or redelivery
- [DoorDash Merchants: What are order error adjustments](https://help.doordash.com/en-us/merchants/article/what-are-order-error-adjustments), the 25% to 100% charge, the 72-hour rule, the 14-day dispute, evidence and fraud screening
- [Uber Eats: Wrong or missing items](https://help.uber.com/en/ubereats/restaurants/article/wrong-or-missing-items%E3%80%80?nodeId=beb06041-6d9c-44de-9ecf-2a9fa80c3bc9), the 48-hour window and refunds instead of replacements
- [Uber Eats Merchants: Managing refunds for missing or incorrect orders](https://help.uber.com/merchants-and-restaurants/article/managing-refunds-for-missing-or-incorrect-orders-?nodeId=9aa57e9b-8bbf-4aa7-91d6-96ca77682dd2), what customers are refunded and deductions from payouts
- [Uber Eats Merchants: Order errors (UK)](https://merchants.ubereats.com/gb/en/resources/learning-center/order-errors), adjustment scope, escalated cases, the 30-day dispute
- [Uber Eats Merchants: Order errors (Canada)](https://merchants.ubereats.com/ca/en/order-errors), the same rules for Canada
- [Grubhub for Restaurants: Restaurant policies](https://get.grubhub.com/help-center/grubhub-restaurant-policies/), merchant-funded adjustment reasons and the 30-day dispute
- [Grubhub: Terms of use](https://www.grubhub.com/legal/terms-of-use), credits or refunds case by case
- [Instacart Help: Pricing](https://instacart.com/help/section/pricing), reporting issues and refund timing
- [DoorDash: Promotional offers and credits terms](https://help.doordash.com/en-us/legal/article/cx-promo-and-credits-terms), one offer per person, the $500 annual credit cap, linked-account voiding

**Company statements and engineering**

- [DoorDash: Merchant fraud protections (December 17, 2025)](https://about.doordash.com/en-us/news/merchant-fraud-protections), enhanced two-factor authentication for sensitive actions and verified ownership transfers
- [DoorDash: Protecting merchants and combating fraud (June 21, 2024)](https://about.doordash.com/en-us/news/protecting-merchants-and-combating-fraud), merchant impersonation, real-time risk detection, verification for bank changes
- [Uber Engineering: Mastermind (March 8, 2017)](https://www.uber.com/blog/mastermind/), the rules engine and the fraud types it covers
- [Uber Engineering: Project RADAR (February 1, 2022)](https://www.uber.com/en-GB/blog/project-radar-intelligent-early-fraud-detection/), attack detection as time series anomalies and generated rules with analysts in the loop

**Law, cases and research**

- [California Legislative Information: AB 578 (2025), chaptered](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB578), Chapter 341, Statutes of 2025, approved October 6, 2025: section 22599.2 on full refunds for undelivered or wrong orders, the driver's tip and refunds to the original payment method
- [FTC: Instacart to pay $60 million (December 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/instacart-pay-60-million-consumer-refunds-settle-ftc-lawsuit-over-allegations-it-engaged-deceptive), the satisfaction guarantee and the hidden refund option
- [U.S. Attorney's Office, N.D. Cal.: Former delivery driver pleads guilty to defrauding San Francisco food delivery company of more than $2.5 million (May 13, 2025)](https://www.justice.gov/usao-ndca/pr/former-delivery-driver-pleads-guilty-defrauding-san-francisco-food-delivery-company), the plea, the reassign-deliver-reset cycle and the co-defendants
- [U.S. Attorney's Office, D. Mass.: Nineteen Brazilian nationals charged in nationwide conspiracy to open fraudulent driver accounts (May 7, 2021)](https://www.justice.gov/usao-ma/pr/nineteen-brazilian-nationals-charged-nationwide-conspiracy-open-fraudulent-driver), more than 2,000 stolen identities, renting and selling accounts, referral bonuses, bots and GPS spoofing
- [U.S. Attorney's Office, S.D. Cal.: Five Brazilian nationals charged in nationwide identity theft ring (May 13, 2021)](https://www.justice.gov/usao-sdca/pr/five-brazilian-nationals-charged-nationwide-identity-theft-ring-exploited-app-based), the shift from rideshare to delivery in 2020 and identities stolen during deliveries
- [Incognia: Gig economy fraud report (February 26, 2025)](https://www.incognia.com/newsroom/gig-economy-fraud-report-shows-refund-abuse-representing-48-percent-of-consumer-fraud-in-2024), vendor research: refund and promotion abuse at 48% each, fake accounts in 57% of driver-side fraud
- [NBC Bay Area (CNBC): Refund fraud schemes promoted on TikTok and Telegram (March 14, 2024)](https://www.nbcbayarea.com/news/business/money-report/refund-fraud-schemes-promoted-on-tiktok-telegram-are-costing-amazon-and-other-retailers-billions-of-dollars/3481375/), secondary coverage of refund services and their fees
