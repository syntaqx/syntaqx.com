+++
title = "Fraud & Risk"
description = "Deciding which payments to allow, review, challenge or block: both costs, network and consortium signals, card testing, merchant and bank-rail fraud."
category = "Payments Industry"
order = 1422
part = "Taking Payments"
aliases = ["payments/fraud-and-risk"]
tags = ["payments", "fraud", "risk", "security"]
+++

The chapters so far decide who may take payments and whether the person paying is the cardholder; fraud and risk decide whether a particular payment should go through at all. Most of this chapter is the payer's side (stolen cards and scripted attacks), plus the merchant who is the fraud and the scams that ride on bank transfers. A fraudulent bank debit comes back as an [ACH return](/books/payments/ach#returns-when-money-is-really-yours), and a payment redirected to an impostor is in [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account).

Every payment decision can be wrong in two directions. Approve a fraudulent payment and you lose the goods, the amount, a dispute fee and some standing with the card networks. Decline a legitimate one and you lose the sale, often the customer, and you never find out. The goal isn't the lowest fraud rate; it's the lowest total cost of both errors. The general machinery of scoring, banding, decision records and safe rule changes is in [Risk Scoring](/docs/architecture/risk-scoring); this chapter is what payments add to it.

## The Two Costs

| Mistake | What it costs | How you see it |
| ------- | ------------- | -------------- |
| **Fraud approved** | The amount, the goods or service, dispute fees, time spent responding, and a dispute rate that can put you in a [card network monitoring program](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts) | Disputes and early fraud warnings (the issuer's fraud reports, which count toward network ratios even with no dispute), weeks later |
| **Legitimate customer declined** | The sale, the customer's lifetime value, support load, and trust | Almost never. A false decline looks like an abandoned checkout |

The asymmetry in visibility is the trap ([Two Kinds of Error](/docs/architecture/risk-scoring#two-kinds-of-error)). The payments-specific measure of a false decline is the customer who retries with another card right after one: a strong sign the first decline was wrong. Track approval rates by card brand, issuer country and segment, and sample declined payments for review ([Measuring It](/docs/architecture/risk-scoring#measuring-it)).

## Signals

No single signal identifies fraud. Each one shifts the odds, and the decision comes from the combination.

| Signal | What it suggests |
| ------ | ---------------- |
| **Velocity:** many payments, cards or accounts from one IP, device or email in a short window | Automation, or one person cycling through stolen cards |
| **Device and session:** a new device, an emulator, a session that went straight to checkout | Scripts behave differently from people |
| **Geography mismatch:** IP country, billing country and the card's issuing (BIN) country disagree | Common in fraud, but also common for travelers and expats, so it's a weight, not a verdict |
| **CVC check failed** | The person paying doesn't have the physical card; the CVC can't be stored by merchants, so it rarely leaks in breaches |
| **Address (AVS) check failed** | Weaker than CVC: legitimate customers mistype addresses or move, and many countries and issuers don't support it |
| **Account age and history** | A years-old account with clean payments is evidence; a minutes-old one isn't |
| **Order shape:** high-value resellable goods, unusual quantity, rush shipping to a new address | What fraudsters buy is predictable |

Providers draw the CVC and AVS distinction the same way. Stripe's verification guidance treats a failed check as worth reviewing but warns that AVS failures happen to real customers. Braintree lets a merchant reject a payment the issuer approved when its AVS or CVV response breaks the merchant's rules, voiding the authorization, and recommends against rejecting on street address mismatches, because the check compares only the numbers in an address, and against rejecting where the issuer doesn't support AVS. Signals are inputs to a score, not rules that decide alone.

## What the Networks Know

A merchant sees its own traffic. The networks and the large providers see everyone's, and three kinds of shared data shape the decision whether or not you use them directly.

- **Network fraud reports.** When a cardholder tells their issuer a transaction wasn't theirs, the issuer reports it to the network: a **TC40** record on Visa, a **SAFE** report on Mastercard (now the Fraud and Loss Database). These aren't chargebacks and move no money, and not every one becomes a dispute. They matter twice. They're the ground truth your model never otherwise sees for frauds the merchant refunded or that weren't disputed. And on Visa they're half of the [VAMP ratio](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts), counted alongside disputes, so a merchant's fraud reports can push it into a monitoring program with no chargebacks at all. Merchants don't receive them directly; acquirers may pass them on, and since VAMP many do. Ask for them and load them into the same label store as disputes.
- **Network risk scores.** The issuer's decision has its own model. Visa Advanced Authorization scores transactions in flight across VisaNet for issuers, and Mastercard's Decision Intelligence returns a single transaction risk score to issuers during authorization, built on patterns across cardholders and merchants. Merchants never see these scores, but they explain declines that look random from your side, and they reward the same things a merchant controls: complete authorization data, network tokens and 3-D Secure results ([SCA & 3-D Secure](/books/payments/strong-customer-authentication)).
- **Consortium data.** A provider that processes for many merchants sees a card or device across all of them: the card tested at one shop and used at another an hour later. Stripe Radar's models are trained on data across Stripe's network, Adyen's risk engine scores with machine learning on its global transaction data, and the networks' alert services ([Prevention Beats Winning](/books/payments/disputes-and-chargebacks#prevention-beats-winning)) carry issuer-confirmed fraud back to merchants. A platform gets the same effect on a smaller scale by scoring across all its merchants instead of per merchant, which is one of the few advantages a platform has over a single merchant.

## Rules, Models and Decisions

A model score with explicit rules on top is the arrangement that works ([Rules and Models Together](/docs/architecture/risk-scoring#rules-and-models-together)), and commercial tools are built that way: Adyen and Stripe Radar both put machine-learned scoring underneath and custom rules, lists and manual review on top, and Adyen's evaluation ends in the same three actions a merchant would choose, block, allow or review, with backtesting of custom rules against historic data on its premium tier. Keep the rules as versioned data, not code ([Rules as Data](/docs/architecture/rules-as-data)), so a rule written during an attack ships in minutes and the decision records which version decided. Which models score a payment before you see it (the provider's, the network's for the issuer) and what a model may and may not decide are in [Fraud Scoring](/books/payments/ai-in-payments#fraud-scoring).

A risk check doesn't return yes or no ([More Outcomes Than Yes and No](/docs/architecture/risk-scoring#more-outcomes-than-yes-and-no)). In payments the outcomes have specific costs:

| Outcome | When | Cost |
| ------- | ---- | ---- |
| **Allow** | Low risk | Nothing |
| **Challenge** | Uncertain, and the customer is present | A moment of friction; a fraudster usually can't pass [3-D Secure](/books/payments/strong-customer-authentication), and success typically shifts liability to the issuer |
| **Review** | Uncertain, high value, and the goods haven't shipped | A human's time and a delay; only viable where fulfillment can wait |
| **Block** | High risk | A false decline when the model is wrong |

A challenge is the most underused outcome: on an uncertain on-session payment it converts most legitimate customers and stops most fraud, where blocking loses the first group and allowing pays for the second.

**Where the check runs.** Before authorization, on everything checkout knows, so a challenge can be requested in the same flow. A second, cheaper check after authorization can use what the issuer returned (the address and security code match results) to hold fulfillment or refund before anything ships.

## Merchant Fraud

Everything above is about the payer. On a platform, the merchant can be the fraud, and it's the more expensive kind, because the platform pays for everything the merchant can't:

- **Bust-out.** A merchant builds a normal history, then runs a burst of large or fake transactions, takes the payout, and disappears before the refunds and disputes arrive. The defenses are payout delays for new merchants, reserves sized to exposure ([Exposure and Reserves](/books/payments/merchant-onboarding#exposure-and-reserves)), and alerts on sudden changes in volume, ticket size or refund rate ([Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **Transaction laundering.** A merchant processes payments for another business that couldn't get a merchant account, often a prohibited one. Visa's rules ban presenting transactions that didn't come from a sale between the cardholder and that merchant, and the networks fine acquirers who let it through. Monitoring compares what's actually sold with what was underwritten: descriptors and product names in the transaction data, ticket sizes and card origins that don't fit the business, websites that are recrawled and compared with the [underwriting review](/books/payments/merchant-onboarding#reviewing-the-website), and other sites whose checkout posts to this merchant's account. Test purchases settle the question when the data only suggests it. The operational side, from alert to offboarding, is in [Operating the Platform](/books/payments/operating-the-platform#compliance-operations).
- **Collusion and self-dealing.** A merchant charging its own or accomplices' stolen cards, or cycling money through refunds to cards that never paid. Refunds without a matching earlier payment on the same card are a signal on their own, which is also why the networks require refunds to go to the original card.
- **Account takeover.** Someone else controlling a legitimate merchant's account changes the payout bank account and cashes out, the case [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account) defends against.

Merchant fraud signals feed the same [onboarding](/books/payments/merchant-onboarding#ongoing-monitoring) tiers and payout controls as underwriting, and a merchant terminated for fraud goes on the networks' terminated-merchant lists. Acting against a merchant is an enforcement decision like any other on a platform: a written policy, a graduated response from payout hold to restriction to termination, a notice that says why, and a way to appeal ([Trust & Safety](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).

## Card Testing

Card testing is the attack most API-driven payment systems meet first. An attacker with a list of stolen card numbers uses your checkout or your "save a card" endpoint to find out which ones still work: many small or zero-amount attempts, from scripts, often spread across IPs. OWASP catalogs it as OAT-001 Carding.

It hurts even when no money is lost. Every attempt is an authorization that can carry fees, successful ones become disputes and fraud reports, and a flood of declines tells issuers your traffic is risky, so they start declining your legitimate customers too, long after the attack stops.

Defenses, layered because each one alone is easy to route around:

- **Rate limits per card, per IP, per account and per device**, not just per IP. Attackers rotate IPs cheaply; they can't rotate the card they're testing. See [What to Key On](/docs/requests/rate-limiting#what-to-key-on). Providers ship defaults keyed this way: Payabli's, per merchant, are 3 declines per card, 3 per IP address and 3 per payer an hour, 10 declines per merchant an hour, 10 transactions per card an hour and 250 transactions per merchant in 15 minutes, each adjustable on request. A velocity alert on a payout capture returns a `202` with the capture held for review rather than refused.
- **Limit the cheap paths.** Card-setup endpoints and guest checkout are preferred targets because a zero-amount verification doesn't show on the cardholder's statement. Require a session or an account before a card can be saved, and cap how many cards one account can add. Payment links and donation pages are cheap paths too ([Card Testing on Public Pages](/books/payments/checkout-and-invoicing#card-testing-on-public-pages)).
- **CAPTCHA, applied by risk** and enforced on the server. A visible CAPTCHA on every payment costs conversions; a risk-triggered one costs almost nothing. Checking it only in the browser is no check at all.
- **Watch the decline rate as an attack signal.** A sudden spike in declines, especially generic ones, on small amounts is the signature. Alert on it, and switch on tighter limits automatically when it fires.
- **Refund what got through.** Successful test charges become disputes; refunding them first is cheaper.

## Bank-Rail Fraud

Card fraud is mostly a stolen credential used without the owner. Fraud on bank transfers is increasingly the opposite: the owner, deceived, sends the money themselves. That's **authorized push payment (APP) fraud**: an impostor posing as a supplier, an employer, the bank's fraud team or a romantic interest talks the payer into a credit transfer. The payment is authorized, so nothing like a chargeback exists, and on instant rails it's final in seconds.

- **Instant payments are irrevocable.** RTP and FedNow in the US, Faster Payments in the UK and SEPA Instant settle immediately with no return path for "I was tricked". Controls have to act before sending: per-transaction and velocity limits, a hold on first payments to a new payee, and a payee name check before the payer confirms, which the EU has required of euro-area banks since October 2025 as Verification of Payee ([Bank Push and Bank Pull](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull)). FedNow gives participating banks value limits and negative lists of accounts to reject.
- **Liability is moving to the banks.** Since October 7, 2024, UK payment providers must reimburse APP fraud victims on Faster Payments up to £85,000 per claim, with the cost shared between the sending and receiving providers, and the Bank of England applies the same to CHAPS. The receiving side pays because it opened the account the money landed in: a provider that holds funds for merchants or users is a receiving bank in this sense, and its onboarding is the control.
- **ACH credits now have fraud rules too.** Nacha's fraud-monitoring rules require non-consumer originators, third-party senders and their banks to monitor for entries that are unauthorized or **authorized under false pretenses** (a payment induced by someone misrepresenting their identity, their authority to act for another, or who owns the account being credited), and require receiving banks to monitor incoming credits for fraud. The largest participants came under the rules on March 20, 2026, and everyone else on June 22, 2026. A platform that originates payouts or vendor payments is an originator or third-party sender under these rules.

For a provider, bank-rail fraud shows up on both ends: as a payer's platform, where a changed bank account on a vendor record is the classic attack ([Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account)), and as a receiver, where a merchant or user account is the mule that collects the stolen funds. Score outbound transfers with the same machinery as card payments, with a new payee and a recently changed bank account as the strongest signals.

## Labels and Outages

Fraud labels arrive late ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)). In payments the label sources are disputes, early fraud warnings, network fraud reports from the acquirer, and manual review outcomes, and the first three arrive weeks or months after the payment. Blocked payments never get a label at all, so hold out a small random share of borderline traffic for review instead of blocking ([Holdouts](/docs/architecture/risk-scoring#holdouts)). Retraining on those labels, and measuring a vendor model against a holdout, is in [Fraud Scoring](/books/payments/ai-in-payments#fraud-scoring).

The risk service will sometimes be slow or down, and the policy for that is decided in advance ([When the Scorer Is Down](/docs/architecture/risk-scoring#when-the-scorer-is-down)). The payments version: fail open for low-value card payments with local fallback rules (velocity limits, blocklists, CVC must match), because a card payment can still be refunded or disputed; fail closed or queue for review on payouts and instant bank transfers, because those can't be pulled back.

## Auditable Decisions

Every decision is recorded with what produced it:

```json
{
  "payment_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "outcome": "review",
  "score": 74,
  "model_version": "2026-10-01",
  "rules_matched": ["intl_shipping_high_value"],
  "rule_set_version": 412,
  "degraded": false,
  "decided_at": "2026-10-22T14:23:45Z"
}
```

The full shape and why each field is there are in [The Decision Record](/docs/architecture/risk-scoring#the-decision-record) and [Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided). Decisions are append-only like the rest of the [payment record](/docs/payments/payment-states): a reviewer approving a payment adds a decision rather than overwriting the original, so the record shows both what the system thought and what the person decided. Backtest rule changes against stored payments before shipping them ([Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely)): a rule that would have stopped last month's card-testing attack and 3% of last month's good customers is a bad rule that looks good in a postmortem.

## How to Build It

Risk adds decisions, versioned rule sets, lists, and the fraud labels that arrive from outside, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
CREATE TABLE risk_rule_sets (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  version      INT NOT NULL UNIQUE,
  rules        JSONB NOT NULL,
  approved_by  TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE risk_decisions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type     TEXT NOT NULL,      -- payment, payout, merchant, payment_method
  subject_id       UUID NOT NULL,
  checkpoint       TEXT NOT NULL,      -- pre_auth, post_auth, payout, setup
  outcome          TEXT NOT NULL,      -- allow, challenge, review, block
  score            INT,
  model_version    TEXT,
  rule_set_id      UUID REFERENCES risk_rule_sets (id),
  rules_matched    TEXT[] NOT NULL DEFAULT '{}',
  degraded         BOOLEAN NOT NULL DEFAULT false,
  decided_by       TEXT NOT NULL,      -- system, or the reviewer's ID
  supersedes_id    UUID REFERENCES risk_decisions (id),
  decided_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE risk_list_entries (
  list         TEXT NOT NULL,          -- block_card_fingerprint, block_ip, allow_customer
  value        TEXT NOT NULL,
  reason       TEXT NOT NULL,
  added_by     TEXT NOT NULL,
  expires_at   TIMESTAMPTZ,
  PRIMARY KEY (list, value)
);

CREATE TABLE fraud_labels (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id  UUID NOT NULL REFERENCES payments (id),
  source      TEXT NOT NULL,           -- dispute, early_fraud_warning, tc40, safe, review
  reported_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  UNIQUE (payment_id, source)
);
```

Training and measurement join `risk_decisions` to `fraud_labels` by payment; the gap between `reported_at` and `received_at` is how late each source's labels really are.

## Auditing

Risk records are evidence when a customer asks why a payment was declined, when a merchant contests a hold or termination, when a network or acquirer reviews a merchant in a monitoring program, and when a regulator asks how APP fraud controls work. The general design is in [Audit Trails](/docs/architecture/audit-trails); for fraud and risk, make sure the record shows:

- **Every automated decision with its versions,** model, rule set and whether it ran degraded ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Every reviewer action** as a new decision that supersedes the old one, with the reviewer and the reason.
- **Rule and list changes,** who proposed and who approved each, with the backtest result attached; nobody approves their own ([Approvals](/docs/security/support-access#approvals-and-nobody-approves-their-own)).
- **Actions against merchants:** holds, restrictions and terminations, the evidence behind them, the notice sent and any appeal.
- **Who looked up a card fingerprint, a customer or a merchant's risk history,** since the same tools that catch fraud can be used to commit it ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Measure false declines as deliberately as fraud,** by segment, with sampled reviews of what you declined.
- **A model score plus versioned rules,** producing four outcomes: allow, challenge, review, block.
- **Network fraud reports, disputes and early fraud warnings in one label store,** and scoring across all merchants, not one at a time.
- **Velocity limits per card, IP, account and device** on every endpoint that tests cards, including card setup.
- **Alerts on decline-rate spikes,** the signature of card testing.
- **Merchant monitoring against what was underwritten,** with a graduated, appealable response.
- **Pre-send controls on instant and push payments,** with new payees and changed bank accounts as the strongest signals.
- **A designed fail-open or fail-closed policy per checkpoint,** with a strict timeout and local fallback rules.
- **Append-only, versioned decisions,** and rules backtested before they ship.

## References

**Specifications**

- [Visa: Visa Acquirer Monitoring Program fact sheet (PDF)](https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf), TC40 fraud reports and TC15 disputes in the VAMP ratio
- [Nacha: Fraud monitoring, phase 2](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-2), the definition of false pretenses, originator and RDFI duties, and the June 22, 2026 date
- [Nacha: Fraud monitoring, phase 1](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-1), the March 20, 2026 date for the largest originators and receivers
- [OWASP: OAT-001 Carding](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-001_Carding), card testing as a catalogued automated threat

**Reference**

- [Chargeback Gurus: Fraud monitoring with TC40 and SAFE](https://www.chargebackgurus.com/blog/faq-fraud-monitoring-with-tc40-and-safe), who files TC40 and SAFE reports, why they aren't chargebacks, and merchant access through acquirers
- [Visa: Secure card payments](https://www.visa.com/en-us/solutions/secure-card-payments.html), Visa Advanced Authorization's in-flight risk scoring for issuers
- [Mastercard: Decision Intelligence Pro launch](https://www.mastercard.com/us/en/news-and-trends/press/2024/february/mastercard-supercharges-consumer-protection-with-gen-ai.html), a transaction risk score for issuers built on relationships across cardholders and merchants
- [DLA Piper: PSR confirms APP fraud reimbursement level](https://dlapiper.com/en-th/insights/publications/2024/09/psr-confirms-app-fraud-reimbursement-level-to-be-reduced), the October 7, 2024 start, the £85,000 cap, and CHAPS
- [PSR: First step in implementing APP scam reimbursement](https://www.psr.org.uk/news-and-updates/latest-news/news/psr-takes-first-step-in-implementing-new-app-scam-reimbursement-requirements/), costs split between sending and receiving firms
- [Banking Dive: FedNow plans to add new fraud tools](https://www.bankingdive.com/news/fednow-plans-add-new-fraud-tools-fed-official-says-stanescu-instant-payments/724497/), FedNow's value limits and negative lists for participants
- [OWASP Automated Threats to Web Applications](https://owasp.org/www-project-automated-threats-to-web-applications), the wider catalog of scripted attacks payment endpoints attract

**In practice**

- [Stripe: Card verification checks](https://docs.stripe.com/disputes/prevention/verification), what CVC and AVS results mean and where they fail legitimate customers
- [Stripe: Protect yourself from card testing](https://docs.stripe.com/disputes/prevention/card-testing), how card testing works, its consequences, and layered defenses
- [Adyen: Risk management](https://docs.adyen.com/risk-management/), machine learning on global transaction data, custom rules with backtesting, risk lists, case management, and block, allow or review decisions
- [Braintree: AVS and CVV rules](https://developer.paypal.com/braintree/articles/guides/fraud-tools/basic/avs-cvv-rules), rejecting approved payments on AVS or CVV responses, the void sent to the issuer, and the false rejections street address rules cause
- [Payabli: API overview](https://docs.payabli.com/developers/api-reference/api-overview), default fraud controls: declines per card, IP address, payer and merchant, and transactions per card and per merchant
- [Payabli: Manage payouts](https://docs.payabli.com/guides/pay-out-developer-payouts-manage), a velocity fraud alert returning `202` with code 9051 and the capture held for review
- [Stripe: How Radar works](https://docs.stripe.com/radar/how-radar-works), machine-learned scoring across Stripe's network combined with rules, lists and manual review
