+++
title = "Commerce Fraud & Abuse"
description = "Card testing, bots and inventory hoarding, resellers and the BOTS Act, promo abuse, account takeover, refund and return fraud, friendly fraud, and the vendors."
category = "Commerce Industry"
order = 2359
part = "Running the Platform"
tags = ["commerce", "fraud", "bots", "account-takeover", "chargebacks"]
+++

A store is a machine that hands out goods, discounts, credits and refunds by rule, and every rule is something an attacker can run at scale. Stolen cards are the old problem and the Payments volume's subject. The commerce problems sit around the card: scripts that test card numbers through a checkout, bots that buy every pair of a limited sneaker or sit on the stock in carts so nobody else can, accounts created by the thousand to farm a first-order discount, logins stuffed with leaked passwords to drain loyalty points and gift card balances, returns of empty boxes, and real customers who keep the goods and tell their bank they never ordered them.

This chapter covers those attacks and the store's defenses: card testing and how platforms throttle it, bots and inventory hoarding, sneaker and reseller bots and the BOTS Act's ticketing scope, promotion abuse, account takeover, refund and return fraud, friendly fraud, the fraud vendors as their own documentation describes them, and one decision service across the store's checkpoints. The models, signals and decision mechanics are the Payments volume's [Fraud & Risk](/books/payments/fraud-and-risk) and the playbook's [Risk Scoring](/docs/architecture/risk-scoring); chargebacks and their evidence are [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks); bot management at the edge is the Hosting & Cloud volume's [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits). The chargeback guarantee at checkout is [Taking Payment in Commerce](/books/commerce/taking-payment#fraud-screening-and-chargeback-guarantees). It extends `orders` and `identity_links` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it), extends the playbook's `risk_decisions`, and adds `bot_signals` and `risk_labels`.

## How the Vendors Do It

As of October 2026, from the vendors' and platforms' own pages:

| Vendor | Model | What it covers beyond card fraud |
| --- | --- | --- |
| **Signifyd** | Approve or decline with a financial guarantee on approved orders, against "fraud and non-fraud chargebacks" (item not received, not as described, credit not processed, duplicate, subscription cancellation) | Return abuse insights and instant refunds |
| **Riskified** | Approve or decline with a Chargeback Guarantee ("guaranteed performance and instant decisions"), as [Taking Payment in Commerce](/books/commerce/taking-payment#fraud-screening-and-chargeback-guarantees) describes the category | Account Secure (account takeover), Policy Protect ("refund, promo, and reseller abuse"), Dispute Resolve (chargeback management) and Adaptive Checkout |
| **Forter** | Identity-based decisions ("identifying the real person behind every interaction"); it announced "a 100% fraud chargeback guarantee for all transactions we've approved at checkout" in 2018 | Account protection (takeover, fake accounts), abuse prevention ("policy abuse"), dispute management, payment optimization |
| **Sift** | A risk score per event (the Sift Score API) the merchant acts on, with payment protection and account defense products; no guarantee | Account defense (takeover) on the same platform |
| **Kount** | Equifax's "AI-driven fraud prevention and digital identity" business since February 2021; markets itself against guarantee models as stopping chargebacks at lower cost | Digital identity, with Equifax's data behind it |
| **Shopify** | Fraud analysis and Fraud Control for merchants, "integrated card testing protection" on Shopify Payments, Shopify Protect on eligible Shop Pay orders, checkout bot protection on Plus | Bot and card testing checkouts excluded from abandoned checkout recovery |
| **Stripe** | Radar's models and rules, plus card testing controls (rate limiters, models, automatic CAPTCHA) on its newer payment surfaces | Card testing controls separate from Radar's dispute protection |

Riskified's guarantee terms (which chargeback reasons it covers) aren't on its public product pages, so its row names the products, not the coverage. <!-- source-gap: riskified-products | missing | which chargeback reason codes Riskified's Chargeback Guarantee covers (fraud only, or also non-fraud disputes) | closes with: Riskified's Chargeback Guarantee page or its documentation (riskified.com refuses automated fetches; the home page lists the products only) | checked: 2026-10-28 -->

Three things the table shows:

- **Two business models.** A guarantee vendor takes the chargeback risk on what it approves and is paid on approved volume; a score vendor sells the signal and the merchant keeps the risk and the decision. The guarantee buys certainty and gives up control of the decline rate; the score keeps the decision in-house and needs a team to act on it.
- **The vendors have moved past the card.** Most now sell account takeover, policy abuse or return abuse products, because the expensive commerce fraud increasingly uses a real customer's card or account.
- **The platform's tools cover its own checkout.** Shopify's protections run where Shopify takes the payment; a headless store, a custom checkout or a store on another processor brings its own.

## The Abuse Map

OWASP's catalog of automated threats names most of what bots do to a store, and each attack lands on a record this volume already keeps:

| Attack | OWASP name | What it targets | Where it's defended |
| --- | --- | --- | --- |
| Testing stolen cards through checkout or card setup | OAT-001 Carding | Authorizations, the decline rate | [Card Testing](#card-testing) |
| Guessing gift card numbers and PINs | OAT-010 Card Cracking | Gift card balance checks | [Gift card fraud](/books/commerce/promotions-and-gift-cards#gift-card-fraud) |
| Holding stock in carts without buying | OAT-021 Denial of Inventory | Reservations, available stock | [Bots and Inventory Hoarding](#bots-and-inventory-hoarding) |
| Buying limited goods to resell | OAT-005 Scalping | Drops, purchase limits | [Resellers, Sneaker Bots and the BOTS Act](#resellers-sneaker-bots-and-the-bots-act) |
| Creating accounts in bulk | OAT-019 Account Creation | New-customer offers, referrals | [Promotion Abuse](#promotion-abuse) |
| Trying leaked passwords | OAT-008 Credential Stuffing | Customer accounts | [Account Takeover](#account-takeover) |
| Spending stolen accounts' value | OAT-012 Cashing Out | Stored cards, points, credit, gift cards | [Account Takeover](#account-takeover) |
| Scraping prices and stock | OAT-011 Scraping | Catalog, availability | [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits#bots-from-captcha-to-scores) |

OWASP draws the line between two of them carefully: denial of inventory depletes stock "without completing the purchase," while scalping does acquire the goods. The difference decides the defense: hoarding is beaten by not reserving early, scalping by limiting who buys.

Not on the map, because no bot is needed: refund and return fraud, and friendly fraud by the real cardholder. They are people, often organized, and the defenses are decisions on history rather than traffic controls.

## Card Testing

Card testing ("carding, account testing, and card enumeration," in Shopify's words) is an attacker running many small payment attempts to learn which stolen cards are live; the general defenses are in the Payments volume ([Card Testing](/books/payments/fraud-and-risk#card-testing)). What a store adds is the targets and the costs:

- **The cheap paths are commerce paths.** Guest checkout, a cart API that authorizes, a "save a card" step in an account, a gift card purchase, a donation or tip line at checkout. Stripe notes testers prefer card setup because those validations "don't typically show up on cardholder statements."
- **The cost lands on real customers.** Every test is an authorization (and often a fee), and Shopify warns that "a surge of declined transactions can also increase your decline rate for legitimate customers," because issuers start declining the merchant's traffic. The damage outlasts the attack.
- **The tested orders pollute operations.** Successful tests become orders to cancel before fulfillment (cancelling doesn't stop a dispute, as Shopify notes) and abandoned checkouts to exclude: Shopify leaves checkouts it suspects of card testing or bot activity out of abandoned checkout recovery, so the store doesn't email a recovery offer to an attacker.

How the platforms throttle it: Shopify Payments has integrated card testing protection at checkout; Stripe applies "rate limiters, AI models, CAPTCHA triggers, ongoing reviews" on its newer checkout surfaces (with hCaptcha as the automatic CAPTCHA), shows blocked attempts as "Blocked by Stripe," and says plainly that simple IP-based rules "are usually not sufficient." For a store running its own checkout, Stripe's list is the baseline: validate CAPTCHA on the server for every card validation and payment request, put the payment form behind a session or login with CSRF protection, rate-limit by card fingerprint, account, device and IP together, and watch the decline rate as the alarm ([What to Key On](/docs/requests/rate-limiting#what-to-key-on)). One caution from the same page: a store's own dunning retries can look like card testing to an issuer, so the subscription retry schedule belongs in the same velocity picture ([Subscription Commerce](/books/commerce/subscription-commerce)).

## Bots and Inventory Hoarding

Inventory hoarding uses the store's own fairness against it. If stock is reserved when it enters a cart, a bot that adds the last thousand units to a thousand carts has made them unavailable to everyone else for as long as the reservation lasts, then lets them go (or doesn't, and renews them). The rule from [Reservations](/books/commerce/inventory#reservations) is the defense: no reservation in the cart, a short one at checkout with an expiry enforced on read, and commitment at order. Where a reservation is necessary, the playbook's caps apply: a limit per customer, device and payment fingerprint on concurrent holds, and holds that can't be renewed indefinitely ([Caps and Abuse](/docs/architecture/reservations-and-holds#caps-and-abuse)).

Bots that do buy are a traffic problem first. Nike says bot attacks "can make up about 10%-50% of all entries" on a popular SNKRS launch and that it stops as many as 12 billion bot calls a month. Shopify's checkout bot protection, a "fairness control" that blocks known bots, shows what a platform offers: the merchant picks reCAPTCHA or hCaptcha, the setting that stops bots auto-completing checkout is on by default, and a scheduled protection event (up to 60 minutes, all products or up to 500 selected) can run with a flash sale; it is available only on Shopify Plus, through Plus Support. Its flash sale guidance adds an operational point: shipping apps "typically perform poorly during extremely high volume events," so flat rates replace live rate calls for the sale.

The layers that work together for a launch:

- **At the edge,** bot scores, verified-bot allowlists and rate limits keep scripted traffic away from the storefront ([Bot Scores, Fingerprints and Verified Bots](/books/hosting-and-cloud/waf-bots-and-rate-limits#bot-scores-fingerprints-and-verified-bots)).
- **At admission,** a queue or a draw decides who may check out, with tokens bound to a session; a randomized draw removes the speed advantage bots buy, which a first-come queue rewards ([Fairness and Bots](/docs/architecture/admission-control#fairness-and-bots)). [Peak Season & Drops](/books/commerce/peak-season#limited-drops-and-inventory-fairness) covers queues and drops.
- **At checkout,** a challenge for uncertain sessions, a purchase limit per item checked against linked identities rather than accounts, and no reservation before payment.
- **After the order,** a review of orders that share addresses, cards or devices beyond the limit, cancelled under the published terms before they ship.

## Resellers, Sneaker Bots and the BOTS Act

The federal law against buying bots is narrow. The Better Online Tickets Sales Act of 2016 (15 U.S.C. 45c) makes it unlawful to "circumvent a security measure, access control system, or other technological control or measure" that a ticket issuer uses to enforce posted purchasing limits or online purchasing order rules, and to sell tickets obtained that way when the seller took part, controlled the violation or "knew or should have known." It applies to event tickets only: an "event" is a concert, theatrical performance, sporting event or similar scheduled activity at a venue with more than 200 seats. The FTC enforces it as a rule violation, and state attorneys general can sue after notice to the FTC.

Enforcement has grown from a first case to a priority:

- **January 22, 2021.** The FTC's first BOTS Act cases: three New York ticket brokers who bought more than 150,000 tickets, with judgments over $31 million, partly suspended, so they paid more than $3.7 million.
- **March 31, 2025.** Executive Order 14254 directed the FTC to "rigorously enforce the Better Online Tickets Sales Act" with state attorneys general.
- **August 18, 2025.** The FTC sued Key Investment Group and related resellers, alleging they bought at least 379,776 Ticketmaster tickets in just over a year, including 273 tickets for one Eras Tour show through 49 accounts against a 6-ticket limit.

For sneakers, consoles, graphics cards and collectibles there is no federal equivalent as of October 2026: the bill to extend the BOTS Act's approach to retail goods, the Stopping Grinch Bots Act of 2025 (H.R. 6822 and S. 3516, both introduced December 17, 2025), was referred to committee in each chamber with no further action as of October 2026. A retailer's purchase limit is therefore a term of sale it enforces itself, which shapes the system:

- **Publish the limit and the consequence.** "Two per customer; orders over the limit or placed by automated means may be cancelled" in the product's terms is what makes a cancellation a policy decision rather than an unexplained refusal ([Online Consumer Protection](/books/commerce/online-consumer-protection)).
- **Count against people, not accounts.** A limit per account is a limit per email address; the check reads `identity_links` (shared cards, addresses, devices, phones) so 49 accounts at one address are one buyer ([Record Linkage](/docs/architecture/record-linkage)).
- **Decide before shipping.** A limit violation found after the order is a cancellation and a refund inside the authorization window, not a recall of a shipped parcel.

## Promotion Abuse

The promotion abuse patterns (code leakage, stacking exploits, return arbitrage, referral loops, codes used beyond their audience) are in [Promotion Abuse](/books/commerce/promotions-and-gift-cards#promotion-abuse), and the multi-account farming of new-customer offers in the delivery part's [Promotion Abuse](/books/commerce/refunds-and-delivery-fraud#promotion-abuse). The fraud chapter's additions are automation and the decision point:

- **Code enumeration is a bot attack.** Trying thousands of codes at checkout (OWASP's account creation and credential cracking cousins) is rate-limited per session, device and IP like card testing, and a code that unlocks large value is long and random, not a dictionary word.
- **Fake accounts are the promotion's cost driver.** Account creation from one device or address cluster, disposable email domains and phone numbers, and first orders that all redeem the same offer are a model's features; the decision at redemption reads the linked identity, never the account alone.
- **Treat the redemption as a risk checkpoint.** Every redemption is already a `promotion_redemptions` row with the identity links checked and the decision; making it a risk decision too puts its outcome in the same label stream as payments and returns.

## Account Takeover

A store account holds a saved card, an address book, loyalty points, store credit, gift card balances and an order history, so it is worth stealing even when the card can't be read out of it. Credential stuffing is the usual route: in January 2022 the New York Attorney General alerted "17 well-known online retailers, restaurant chains, and food delivery services" that credential stuffing had compromised "more than 1.1 million customer accounts," and published a business guide whose defenses include "bot detection services," "multi-factor authentication" and "password-less authentication."

Takeover in commerce ends in cashing out, so the defenses sit on both sides of the login:

- **At login:** bot detection and rate limits on the login endpoint, breached-password checks, passkeys and multi-factor authentication offered to every customer, and a risk score on a new device ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration), [Account Takeover at the Edge](/books/hosting-and-cloud/waf-bots-and-rate-limits#account-takeover-at-the-edge)).
- **At the sensitive actions:** a new shipping address on an order paid with a saved card, a new payment method, a points redemption or transfer, a gift card balance spent in full, an email or password change. Each is a step-up challenge and a risk decision, because the attacker who got in still has to do one of them to profit ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions); [Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense) has the account side).
- **After the fact:** a notice to the account's email of every sensitive change, a window to reverse a points transfer or a credit spend, and labels from the customer's report that feed the model.

Merchants' own staff accounts are the higher-value target: an admin who can issue refunds, change payout accounts or install apps. They belong to [Store Security & PCI](/books/commerce/store-security-and-pci#staff-accounts-and-two-factor-authentication).

## Refund and Return Fraud

The behaviors (wardrobing, swap and empty-box returns, receipt fraud, refund-as-a-service, chargeback after refund) and the operational controls (weight checks, serial capture, refund timing, inspection) are [Return Fraud and Abuse](/books/commerce/returns-and-exchanges#return-fraud-and-abuse); the delivery version, false missing-item reports and the refund services sold for a cut, is [Customer Refund Abuse](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse). NRF and Happy Returns' 2025 report put fraudulent returns at 9% of all returns.

What a store-wide fraud system adds is one decision at each refund point, made on the same identity graph as checkout:

- **At the return request:** the customer's return rate and value, linked accounts' history, the item's category and the policy, banded into instant refund, refund on first scan, refund on receipt, or refund after inspection ([Returns & Exchanges](/books/commerce/returns-and-exchanges#how-to-build-it) stores the decision on `returns.risk_decision_id`).
- **At a "not received" or "missing item" claim:** the carrier's delivery scan and photo, the address's claim history and the customer's, before a replacement or refund ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it) stores it on `order_issues.risk_decision_id`).
- **At inspection:** a mismatch is the label, arriving days or weeks later, for both the return model and the customer's history ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).

Limiting serial abusers is a published policy with consumer-law exposure, not a silent decline; the decision record and the policy version are what make it defensible.

## Friendly Fraud

Friendly fraud, which Visa calls first-party misuse ("when cardholders report fraud on authorized transactions"), is the real customer disputing a real purchase: the parcel arrived and they say it didn't, the subscription renewed and they say they never signed up, the teenager bought with a parent's card. A chargeback guarantee for fraud doesn't cover the non-fraud reasons unless it says so (Signifyd's covers them; [Taking Payment in Commerce](/books/commerce/taking-payment#fraud-screening-and-chargeback-guarantees) has the rest of the category), and a model trained on chargebacks learns to decline good customers if friendly fraud is labeled as stolen-card fraud.

The networks now give merchants ways to answer it:

- **Visa Compelling Evidence 3.0,** effective April 2023, lets a merchant defeat a fraud dispute (condition 10.4) with two undisputed transactions on the same card 120 to 365 days before the dispute that match on at least two of login ID, delivery address, device ID or fingerprint and IP address, one of which must be the device or the IP; liability then shifts to the issuer. Merchants can also answer before a dispute through Verifi's Order Insight, which gives the issuer's call center the transaction details.
- **Verifi's Rapid Dispute Resolution** lets a merchant set rules (up to 10 scenarios with up to 7 attributes each) that refund a dispute at the inquiry stage, where it "do[es] not count toward the seller's sale:dispute ratio."
- **Mastercard's First-Party Trust program,** announced October 23, 2023, adds "new compelling-evidence rules and merchant chargeback protection" for disputes that meet its requirements, with merchant data submitted at the time of the transaction or during the dispute.

For the system, friendly fraud defense is evidence kept from the start: the login, device fingerprint, IP and delivery address on every order (hashed where they're only matched); delivery proof with the carrier's scan and photo; the subscription consent and renewal notices ([Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law#how-to-build-it)); and a refund issued before the dispute netted against it, never paid twice ([Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)).

## Decisions Across the Store

A store has more checkpoints than a payment does, and each is the same kind of decision with the same outcomes (allow, challenge, review, block) and the same record ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record)):

| Checkpoint | Typical signals | Typical outcomes | Fails |
| --- | --- | --- | --- |
| Account creation | Device, email and phone reputation, velocity from one cluster | Allow; challenge; block | Open, with offers withheld until a first good order |
| Login | Device, IP, breached credential, velocity | Allow; step-up; block | Open with step-up |
| Add payment method, card setup | Card testing velocity, account age | Allow; CAPTCHA; block | Closed (setup can wait) |
| Checkout, before authorization | The payment volume's signals, order shape, linked identities, purchase limits | Allow; 3-D Secure; review; block | Open with local rules for low value ([When the Scorer Is Down](/docs/architecture/risk-scoring#when-the-scorer-is-down)) |
| Before capture or release to the warehouse | Issuer results, address change since screening, guarantee vendor's decision | Release; hold; cancel | Hold |
| Promotion redemption | Linked identities, prior redemptions | Grant; deny | Deny the offer, keep the order |
| Return request, refund | Return and claim history, linked accounts, item value | Instant; on scan; on receipt; after inspection | Slowest band |
| Gift card balance check, redemption | Velocity per session and card range | Allow; challenge; block | Closed |

Two design rules come from running these together. **One identity graph:** `identity_links` is shared by every checkpoint, so a device that farmed a promotion is known at checkout and at the returns portal. **One label stream:** chargebacks, early fraud warnings, return inspection mismatches, issue disputes won by the merchant and customer takeover reports all land as labels on the decisions they judge, so each model learns from every outcome, late ([Holdouts](/docs/architecture/risk-scoring#holdouts) keeps a sample of borderline traffic unblocked so blocked decisions get labels too).

## How to Build It

The playbook's `risk_decisions` is the decision record, and the Payments volume uses it for payments. Commerce widens its subjects to every checkpoint above, records the vendor's guarantee where one applies, and adds bot signals and labels for non-payment outcomes:

```sql
ALTER TABLE risk_decisions
  ADD COLUMN merchant_id     UUID REFERENCES merchants (id),
  ADD COLUMN checkpoint_kind TEXT CHECK (checkpoint_kind IN ('account_creation', 'login',
                               'payment_method', 'checkout', 'pre_capture', 'promotion',
                               'return', 'issue', 'gift_card', 'sensitive_action')),
  ADD COLUMN customer_id     UUID REFERENCES customers (id),
  ADD COLUMN session_ref     TEXT,           -- the checkout or login session
  ADD COLUMN identity_link_ids UUID[] NOT NULL DEFAULT '{}',  -- the links the decision read
  ADD COLUMN vendor          TEXT,           -- 'signifyd', 'forter', 'internal', ...
  ADD COLUMN vendor_ref      TEXT,           -- the vendor's case or score ID
  ADD COLUMN guaranteed      BOOLEAN NOT NULL DEFAULT FALSE,  -- vendor carries the chargeback
  ADD COLUMN guarantee_terms JSONB,          -- e.g. ship_to, ship_by, fraud_only
  ADD COLUMN policy_ref      TEXT;           -- the published limit or policy it enforced

-- subject_type now also takes 'order', 'checkout', 'return', 'order_issue',
-- 'promotion_redemption', 'customer', 'gift_card'; returns.risk_decision_id,
-- order_issues.risk_decision_id and capture_plans point here.

CREATE TABLE bot_signals (               -- what the edge and the client said about a session
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  session_ref    TEXT NOT NULL,
  source         TEXT NOT NULL CHECK (source IN ('edge', 'captcha', 'client', 'queue',
                   'velocity')),
  provider       TEXT,                   -- the bot manager, CAPTCHA or queue vendor
  signal         TEXT NOT NULL,          -- 'bot_score', 'captcha_passed', 'verified_bot',
                                         -- 'headless', 'velocity_exceeded', 'queue_token'
  value          NUMERIC,                -- the score, where there is one
  ip_hash        BYTEA,
  device_hash    BYTEA,
  observed_at    TIMESTAMPTZ NOT NULL,
  received_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX bot_signals_session ON bot_signals (merchant_id, session_ref, observed_at);

CREATE TABLE risk_labels (               -- outcomes that judge a decision, whenever they arrive
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  risk_decision_id UUID NOT NULL REFERENCES risk_decisions (id),
  source           TEXT NOT NULL CHECK (source IN ('chargeback_fraud',
                     'chargeback_non_fraud', 'early_fraud_warning', 'return_mismatch',
                     'issue_dispute_won', 'takeover_report', 'limit_violation',
                     'manual_review', 'refund_after_dispute')),
  label            TEXT NOT NULL CHECK (label IN ('fraud', 'abuse', 'first_party_misuse',
                     'legitimate')),
  evidence_ref     TEXT,                   -- the dispute, inspection or report it came from
  occurred_at      TIMESTAMPTZ NOT NULL,   -- when the outcome happened
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (risk_decision_id, source, evidence_ref)
);
```

The purchase limit check reads people, not accounts:

```sql
-- Units of one item bought in the drop window by anyone sharing a card, address,
-- device or phone with this customer.
WITH linked AS (
  SELECT DISTINCT b.customer_id
  FROM identity_links a
  JOIN identity_links b ON b.kind = a.kind AND b.value_hash = a.value_hash
  WHERE a.customer_id = $customer
    AND a.kind IN ('payment_fingerprint', 'address', 'device', 'phone')
)
SELECT COALESCE(SUM(l.quantity - l.cancelled_quantity), 0) AS units
FROM orders o
JOIN order_lines l ON l.order_id = o.id
WHERE o.customer_id IN (SELECT customer_id FROM linked)
  AND l.item_id = $item
  AND o.placed_at >= $window_start
  AND o.status <> 'cancelled';
```

Design notes:

- **One decision table for the whole store.** Payments, checkout, returns, issues and promotions write the same decision record with a checkpoint, so a customer's history across them is one query and one model's features.
- **Guarantees are terms on the decision.** A guaranteed decision records what the vendor covered and under which conditions (ship to the screened address, ship within the window, fraud only), which the order manager checks before release ([Taking Payment in Commerce](/books/commerce/taking-payment#how-to-build-it) keeps the guaranteed address on the capture plan).
- **Bot signals are observations, not verdicts.** The edge's score, a CAPTCHA pass, a queue token and a velocity hit are inputs a decision reads; storing them per session lets a later chargeback be traced back to a session that looked like a script.
- **Labels are typed.** Fraud, abuse, first-party misuse and legitimate are different outcomes; collapsing them makes a card-fraud model decline friendly-fraud customers it should have challenged.
- **Hash what you only match.** Card fingerprints, addresses, devices and phones are compared for equality, so `identity_links` and `bot_signals` store hashes, which keeps them out of card data scope ([Sensitive Payment Data](/docs/payments/sensitive-data)).
- **Limits are rules with a policy reference.** The purchase limit and its window are versioned rules ([Rules as Data](/docs/architecture/rules-as-data)), and a cancellation for a limit violation records the policy text it enforced.

## Auditing

- **Every decision at every checkpoint,** with the signals and identity links it read, the rule and model versions, any vendor reference and guarantee, and who overrode it.
- **Every label,** with its source and the delay between the outcome and its arrival.
- **Every cancellation for a limit or for suspected abuse,** with the published policy it relied on and the refund it triggered.
- **Every guarantee claim,** filed with the vendor's reference against the decision it covered.

## What This Means for the System You Build

- **Protect the cheap paths** (guest checkout, card setup, gift card checks, code entry) with server-side challenges and velocity keyed on card, device, account and IP together.
- **Don't reserve stock in carts,** cap concurrent holds per identity, and put admission in front of drops.
- **Enforce purchase limits on linked identities** under published terms, before the goods ship; the BOTS Act covers tickets only.
- **Step up on the actions that cash out an account,** not only at login.
- **Decide every refund on history,** banded by risk, and label returns by inspection.
- **Keep the evidence friendly fraud needs** from the first order: device, IP, login, delivery proof and consent.
- **Run one decision record and one label stream** across payments, checkout, promotions, returns and claims.

## References

**Law and regulators**

- [15 U.S.C. 45c (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/45c), the BOTS Act's prohibitions, the definition of an event and enforcement
- [H.R. 6822, Stopping Grinch Bots Act of 2025 (congress.gov)](https://www.congress.gov/bill/119th-congress/house-bill/6822/all-actions), introduced and referred to Energy and Commerce
- [S. 3516, Stopping Grinch Bots Act of 2025 (congress.gov)](https://www.congress.gov/bill/119th-congress/senate-bill/3516/all-actions), introduced and referred to Commerce, Science, and Transportation
- [FTC: FTC Brings First-Ever Cases Under the BOTS Act (January 22, 2021)](https://www.ftc.gov/news-events/news/press-releases/2021/01/ftc-brings-first-ever-cases-under-bots-act), the three brokers, tickets bought and judgments
- [FTC: Action against ticket resellers using illegal tactics (August 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-takes-action-against-ticket-resellers-using-illegal-tactics-bypass-ticket-limit-protections), the Key Investment Group complaint
- [Executive Order 14254: Combating Unfair Practices in the Live Entertainment Market (Federal Register, April 3, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-03/html/2025-05906.htm), the direction to enforce the BOTS Act
- [New York Attorney General: Alert to 17 companies on credential stuffing (January 5, 2022)](https://ag.ny.gov/press-release/2022/attorney-general-james-alerts-17-companies-credential-stuffing-cyberattacks), the accounts affected and the guide's defenses

**Standards and networks**

- [OWASP: OAT-021 Denial of Inventory](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-021_Denial_of_Inventory), depleting stock without purchase, contrasted with scalping
- [OWASP: OAT-005 Scalping](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-005_Scalping), obtaining limited goods by unfair methods
- [OWASP: OAT-008 Credential Stuffing](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-008_Credential_Stuffing), mass login attempts with stolen pairs
- [OWASP: OAT-012 Cashing Out](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-012_Cashing_Out), buying goods with stolen account data, and the catalog's other threat names
- [Visa: Evolution of Compelling Evidence, merchant FAQs (March 2023)](https://usa.visa.com/content/dam/VCOM/regional/na/us/support-legal/documents/evolution-of-compelling-evidence-merchant-faqs-mar2023.pdf), first-party misuse, the CE 3.0 criteria and Order Insight
- [Verifi: Rapid Dispute Resolution](https://www.verifi.com/rdr-is-here.html), rules, scenarios and the dispute ratio
- [Mastercard: First-Party Trust program (October 23, 2023)](https://newsroom.mastercard.com/news/press/2023/october/mastercard-targets-friendly-fraud-to-protect-small-businesses-and-merchants/), compelling evidence and chargeback protection for friendly fraud

**Platforms and vendors**

- [Shopify Help Center: Preventing fraud](https://help.shopify.com/en/manual/payments/fraud-prevention/preventing-fraud), card testing, decline rates, excluded abandoned checkouts and integrated protection
- [Shopify Help Center: Protecting your store from selling to bots](https://help.shopify.com/en/manual/checkout-settings/bot-protection), bot protection settings, events and the Plus requirement
- [Shopify Help Center: Flash sales](https://help.shopify.com/en/manual/promoting-marketing/sales/flash-sales), preparation for high-volume sales and shipping apps
- [Stripe: Protect yourself from card testing](https://docs.stripe.com/disputes/prevention/card-testing), Stripe's controls and the mitigations it recommends
- [Nike: Inside SNKRS, bot protection](https://www.nike.com/launch/t/inside-snkrs-bot-protection), the share of bot entries and bot calls stopped
- [Signifyd: Chargeback protection](https://www.signifyd.com/solutions/chargeback-protection/), the guarantee against fraud and non-fraud chargebacks
- [Riskified](https://www.riskified.com/), its products: Chargeback Guarantee, Account Secure, Policy Protect, Dispute Resolve and Adaptive Checkout
- [Forter](https://www.forter.com/), its products and identity approach
- [Forter: New year, new fraud solution (January 9, 2018)](https://www.forter.com/blog/new-year-new-fraud-solution/), the fraud chargeback guarantee
- [Sift](https://sift.com/), payment protection, account defense and the score API
- [Equifax: Equifax closes acquisition of Kount (February 11, 2021)](https://investor.equifax.com/news-events/press-releases/detail/12/equifax-closes-acquisition-of-kount), Kount's ownership
- [Kount: Kount vs chargeback guarantees](https://go.kount.com/kount-vs-chargeback-guarantees-demo-request), its position against guarantee models
- [NRF: Consumers expected to return nearly $850 billion in merchandise in 2025](https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025), the share of returns that are fraudulent
