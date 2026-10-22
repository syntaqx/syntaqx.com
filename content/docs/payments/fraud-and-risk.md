+++
title = "Fraud & Risk"
description = "Deciding which payments to allow, review, challenge or block: the cost of both mistakes, rules and models together, card testing, and auditable decisions."
category = "Payments"
order = 808
tags = ["payments", "fraud", "risk", "security"]
+++

[3-D Secure](/docs/payments/strong-customer-authentication) is one tool for deciding whether to trust a payment; fraud and risk is the whole decision. Every payment decision can be wrong in two directions. Approve a fraudulent payment and you lose the goods, the amount, a dispute fee and some standing with the card networks. Decline a legitimate one and you lose the sale, often the customer, and you never find out. A fraud system that only counts the first mistake drives fraud to zero by declining everyone slightly unusual, and the dashboard looks great while revenue quietly leaks. The goal isn't the lowest fraud rate; it's the lowest total cost of both errors.

## The Two Costs

| Mistake | What it costs | How you see it |
| ------- | ------------- | -------------- |
| **Fraud approved** | The amount, the goods or service, dispute fees, time spent responding, and a dispute rate that can put you in a card network monitoring program | Disputes and early fraud warnings, weeks later |
| **Legitimate customer declined** | The sale, the customer's lifetime value, support load, and trust | Almost never. A false decline looks like an abandoned checkout |

The asymmetry in visibility is the trap: fraud losses arrive as itemized disputes, and false declines arrive as nothing. So measure both on purpose: track approval rates by segment, sample declined payments for manual review, and watch for customers who retry with another card after a decline (a strong sign the first decline was wrong).

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

[Stripe's verification guide](https://docs.stripe.com/disputes/prevention/verification) draws the CVC and AVS distinction: a failed check is worth reviewing, but AVS failures happen to real customers. Signals are inputs to a score, not rules that decide alone.

## Rules and Models: You Need Both

**Rules** are explicit: "block if more than 5 cards were tried from this IP in an hour", "review orders over €2,000 shipping to a new address". They deploy instantly when an attack starts, they're explainable, and they encode business knowledge a model can't learn. **Models** learn from labeled history and produce a score; they find combinations nobody would write as a rule and adapt as patterns shift.

Each covers the other's weakness. Rules alone become a growing pile nobody dares delete, each tuned to the incident that prompted it. Models alone can't respond to a new attack until they've seen weeks of labeled losses, and can't explain a decline. The arrangement that works: a model produces a risk score, and rules act on the score plus specific facts ("review if score is over 70 and the order ships internationally"). That's also how commercial tools such as [Stripe Radar](https://docs.stripe.com/radar/how-radar-works) are built: machine-learned scoring underneath, rules and lists on top.

## Decisions

A risk check doesn't return yes or no. Four outcomes keep the system from choosing between "let fraud through" and "decline a real customer":

| Outcome | When | Cost |
| ------- | ---- | ---- |
| **Allow** | Low risk | Nothing |
| **Step up** | Uncertain, and the customer is present | A moment of friction; a fraudster usually can't pass [3-D Secure](/docs/payments/strong-customer-authentication), and success typically shifts liability to the issuer |
| **Review** | Uncertain, high value, and the goods haven't shipped | A human's time and a delay; only viable where fulfilment can wait |
| **Block** | High risk | A false decline when the model is wrong |

Step-up is the most underused: on an uncertain on-session payment it converts most legitimate customers and stops most fraud, where blocking loses the first group and allowing pays for the second.

## Card Testing

Card testing is the attack most API-driven payment systems meet first. An attacker with a list of stolen card numbers uses your checkout or your "save a card" endpoint to find out which ones still work: many small or zero-amount attempts, from scripts, often spread across IPs. OWASP catalogs it as [OAT-001 Carding](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-001_Carding).

It hurts even when no money is lost. Every attempt is an authorization that can carry fees, successful ones become disputes, and a flood of declines tells issuers your traffic is risky, so they start declining your legitimate customers too, long after the attack stops ([Stripe's card testing guide](https://docs.stripe.com/disputes/prevention/card-testing)).

Defenses, layered because each one alone is easy to route around:

- **Rate limits per card, per IP, per account and per device**, not just per IP. Attackers rotate IPs cheaply; they can't rotate the card they're testing. See [Rate Limiting](/docs/requests/rate-limiting).
- **Limit the cheap paths.** Card-setup endpoints and guest checkout are preferred targets because a zero-amount verification doesn't show on the cardholder's statement. Require a session or an account before a card can be saved, and cap how many cards one account can add.
- **CAPTCHA, applied by risk** and enforced on the server. A visible CAPTCHA on every payment costs conversions; a risk-triggered one costs almost nothing. Checking it only in the browser is no check at all.
- **Watch the decline rate as an attack signal.** A sudden spike in declines, especially generic ones, on small amounts is the signature. Alert on it, and switch on tighter limits automatically when it fires.
- **Refund what got through.** Successful test charges become disputes; refunding them first is cheaper.

## Feedback Loops

A model is only as good as its labels, and fraud labels arrive late: a payment is confirmed fraudulent when the cardholder [disputes](/docs/payments/disputes-and-chargebacks) it, weeks or months later. Disputes, early fraud warnings and manual review outcomes all feed back into training and rule review. Blocked payments are the gap: you never learn whether they were fraud. Hold out a small random share of borderline traffic for review instead of blocking, or the system grades its own homework, and everything it blocked "was fraud" because nothing proves otherwise.

## When the Risk Check Fails

The risk service will sometimes be slow or down. Decide in advance what a payment does then, because the decision made in an incident is always "turn it off". Failing open keeps revenue flowing and lets an attack through the gap (attackers watch for this); failing closed turns a risk-service outage into a payment outage. Neither is right everywhere. A reasonable default: fail open for low-value, low-risk segments with a fallback set of simple rules that run locally (velocity limits, blocklists, CVC must match), and fail closed or queue for review for high-value orders that can wait. Put a strict timeout on the risk call so a slow score degrades to the fallback instead of hanging checkout ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)). The same reasoning as the rate limiter applies: the protection must not become the outage.

## Auditable Decisions

Every decision is recorded with what produced it:

```json
{
  "payment_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "outcome": "review",
  "score": 74,
  "model_version": "2026-10-01",
  "rules_matched": ["intl_shipping_high_value"],
  "decided_at": "2026-10-22T14:23:45Z"
}
```

- **Why:** when a customer, a support agent or a regulator asks why a payment was declined, "the model said so" isn't an answer; the matched rules and score are.
- **Which version:** a decision is only explainable against the rules and model that made it.
- **Append-only,** like the rest of the [payment record](/docs/payments/payment-states): a reviewer approving a payment adds a decision rather than overwriting the original.

Backtest rule changes against stored history before shipping them. A rule that would have stopped last month's attack and 3% of last month's good customers is a bad rule that looks good in a postmortem.

## References

**Reference**

- [Stripe: Card verification checks](https://docs.stripe.com/disputes/prevention/verification), what CVC and AVS results mean and where they fail legitimate customers
- [Stripe: Protect yourself from card testing](https://docs.stripe.com/disputes/prevention/card-testing), how card testing works, its consequences, and layered defenses
- [Stripe: How Radar works](https://docs.stripe.com/radar/how-radar-works), machine-learned scoring combined with rules, lists and manual review
- [OWASP: OAT-001 Carding](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-001_Carding), card testing as a catalogued automated threat

**In practice**

- [OWASP Automated Threats to Web Applications](https://owasp.org/www-project-automated-threats-to-web-applications), the wider catalog of scripted attacks payment endpoints attract
