+++
title = "Strong Customer Authentication & 3-D Secure"
nav_title = "SCA & 3-D Secure"
description = "When a card payment needs the cardholder to authenticate, the exemptions that skip it, why the liability shift matters, and how an API models the extra step."
category = "Payments"
order = 7.8
tags = ["payments", "sca", "3ds", "psd2", "authentication"]
+++

A card number, an expiry and a CVC prove that someone has seen a card. They don't prove the cardholder is the one paying. Strong Customer Authentication (SCA) closes that gap for online payments in Europe, and 3-D Secure (3DS) is how card payments do it. Treat it as a regulation you can bolt on later and you get the worst of it: legitimate European customers declined for "authentication required" with no way to complete the step, and fraud disputes you could have shifted to the bank.

## What SCA Requires

Under PSD2, an electronic payment the payer initiates must be authenticated with at least two independent factors from different categories:

| Category | Example |
| -------- | ------- |
| Knowledge | A password or PIN |
| Possession | A phone that receives a one-time code, or a banking app |
| Inherence | A fingerprint or face scan |

It applies to customer-initiated online payments in the European Economic Area, and the UK kept equivalent rules (the [FCA's SCA rules](https://www.fca.org.uk/firms/strong-customer-authentication) have applied since 14 September 2019). If you take payments from European cards, expect issuers to ask for it, whatever your integration assumes.

The point of two factors from different categories is that one stolen thing isn't enough. A phished password without the phone fails; a stolen phone without the PIN fails. That's also why SCA moves fraud economics: stolen card data alone stops being sufficient for the payments it covers.

### What's Coming

The EU agreed a successor package in November 2025: the Payment Services Regulation (PSR) and a third Payment Services Directive (PSD3), which keep strong customer authentication as a core fraud duty for payment providers ([summary from William Fry](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/)). Formal adoption and the application dates were still being finalized at the time of writing, with most rules applying well over a year after publication. Build for SCA as it works today; nothing in the new package makes authentication optional.

## Exemptions: When You Can Skip the Step

Authenticating every payment would add friction to the low-risk ones that never needed it. The rules carve out exemptions, and using them well is most of the work of a good integration. The important ones, with the thresholds as [Stripe's SCA guide](https://stripe.com/guides/strong-customer-authentication) summarizes them:

| Exemption | Applies when | Why it exists |
| --------- | ------------ | ------------- |
| **Low value** | Under €30 (£25), until five exempted payments or €100 (£85) in total since the cardholder last authenticated | Small payments carry small losses; the counters stop a fraudster splitting a big purchase into small ones |
| **Transaction risk analysis** | The payment provider's fraud rate is under 0.13% for payments up to €100, under 0.06% up to €250, under 0.01% up to €500 | Providers that prove low fraud earn the right to skip authentication on more of their traffic |
| **Fixed-amount recurring** | The same amount to the same merchant, after the first payment was authenticated | The customer authenticated the agreement once; asking again every month adds nothing |
| **Merchant-initiated** | The customer isn't present, under a mandate they authenticated when the card was saved | Out of scope rather than exempt: there's nobody to authenticate |

Three things make exemptions less straightforward than the table suggests:

- **Exemptions are requests, not rights.** The issuer decides. You (or your provider) ask for an exemption; the issuer can refuse and demand authentication anyway. An integration that can't handle that refusal will decline real customers.
- **Exemptions trade away the liability shift.** An exempted payment wasn't authenticated, so if it turns out to be fraud, the dispute is yours (below). Skipping friction on a €480 order to save one tap is a bet on your fraud rate.
- **The counters belong to the issuer.** You can't know whether this €20 payment is the cardholder's sixth exempted one this week. Design for the issuer to ask, always.

## How 3-D Secure Works

[EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/) (3DS2) lets the merchant send the issuer far more about the payment than the card details: the device, the browser, the shipping address, the customer's history with the merchant. The issuer runs its own risk assessment on that data and chooses one of two paths:

- **Frictionless:** the issuer is satisfied and approves without involving the customer. The payment still counts as authenticated.
- **Challenge:** the issuer wants proof and shows the customer a step: a code by SMS, approval in the banking app, a biometric.

The data is the lever. The more context you send, the more often the issuer can decide frictionlessly, and frictionless authentication gives you the authenticated outcome without the conversion cost of a challenge. Sending the minimum and getting challenged on everything is the most common way 3DS earns its reputation for hurting checkout.

## The Liability Shift

For fraud disputes, the default is that the merchant bears the loss. When a payment is successfully authenticated with 3DS and later disputed as fraud, the liability typically shifts to the issuer: the bank approved the cardholder's identity, so the bank owns that mistake.

This is the business case for 3DS beyond compliance. A merchant selling high-value goods can request authentication on risky orders even where SCA doesn't require it, specifically to move fraud losses off its books. See [Disputes & Chargebacks](/docs/payments/disputes-and-chargebacks) for how this changes the dispute response.

It's not absolute, and the system should never treat it as a guarantee. [Stripe's documentation](https://docs.stripe.com/payments/3d-secure/authentication-flow) is explicit: liability shift is expected for eligible fraud disputes on authenticated payments, but networks exempt some business types, merchants in fraud monitoring programs can lose it, and it doesn't apply to non-fraud disputes such as "item not received". Record the authentication result and the Electronic Commerce Indicator (ECI) on the payment so that the evidence exists when a dispute arrives.

## Modeling the Extra Step in an API

Authentication means a payment can't always finish in one request: the customer may need to complete a challenge in their banking app before the authorization goes through. The API has to represent "waiting on the customer" as a real state, not a timeout.

### A `requires_action` State

Extend the [payment state machine](/docs/payments/payment-states) with one state:

```text
pending ──► requires_action ──► pending ──► authorized
   │              │
   ▼              ▼
 failed      failed (authentication failed or abandoned)
```

When the issuer asks for authentication, the payment moves to `requires_action` and carries what the client has to do next:

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "requires_action",
  "amount": 12000,
  "currency": "EUR",
  "next_action": {
    "type": "authenticate",
    "redirect_url": "https://acs.example-bank.eu/challenge/9f2c",
    "return_url": "https://shop.example/checkout/complete",
    "expires_at": "2026-10-22T14:38:45Z"
  }
}
```

- **The client completes the action and the server resumes.** After the challenge, the client tells the server to continue (or the server learns the result from the authentication provider). The server then authorizes. The client never decides on its own that a payment succeeded.
- **It expires.** A customer who walks away from a challenge leaves a payment in `requires_action` forever unless it times out. Expire it to `failed` with a reason, so it doesn't sit in a funnel report as "pending".
- **The response is `200` with a status, not an error.** Needing authentication is a normal outcome of a valid request. Returning a `402` here makes every client treat a recoverable step as a failure. Reserve `402` for real declines.
- **Webhooks report the transition.** A client that loses its connection mid-challenge learns the outcome from a `payment.authorized` or `payment.failed` event ([Webhooks](/docs/payments/webhooks)), not by polling forever.

### Soft Declines

An issuer can also decline an unauthenticated attempt with a code that means "try again with authentication" (a soft decline, such as Stripe's [`authentication_required`](https://docs.stripe.com/declines/codes)). That isn't a final answer. If the customer is present, the right response is to run 3DS and retry once, which turns a decline into a sale. If the customer isn't present (below), you can't authenticate them, so the payment fails and the customer has to come back on-session. Retrying a soft decline without authentication is a hard decline in waiting, and repeated unauthenticated retries are exactly what card networks penalize ([Retries & Timeouts](/docs/operations/retries-and-timeouts)).

## On-Session and Off-Session Payments

The hardest SCA problems aren't at checkout. They're in subscriptions, saved cards and anything charged after the customer has left.

- **Customer-initiated (on-session):** the customer is in your checkout and can complete a challenge. SCA applies, and the API flow above handles it.
- **Merchant-initiated (off-session):** you charge a saved card later, with the customer absent: a renewal, a usage bill, a no-show fee. Nobody can complete a challenge, so these payments are out of scope, but only if the card was set up properly.

Getting merchant-initiated payments right comes down to the first transaction:

1. **Authenticate when you save the card.** Run SCA on the first payment, or on a zero-amount setup if there's no payment yet. That authenticated setup is what later off-session charges reference.
2. **Get and keep the mandate.** The customer agrees that you may charge them later, how often, and how the amount is set. Store the agreement, because it's your evidence that the charge was authorized ([Stripe's SCA guide](https://docs.stripe.com/strong-customer-authentication) lists what the agreement should cover).
3. **Flag every later charge as off-session.** That tells the issuer there's no customer to challenge and that the payment relies on the original mandate.
4. **Plan for the issuer asking anyway.** Even a correct merchant-initiated payment can come back as a soft decline. Email the customer a link to complete the payment on-session, and leave the subscription in a grace state rather than cancelling it.

A saved card that skipped step 1 is a liability. Every off-session charge on it risks a soft decline you can't resolve without the customer, which shows up as involuntary churn months after the integration shipped.

## Checklist

- Payments can sit in `requires_action` with a `next_action` and an expiry, and the client resumes them.
- Authentication results and ECI are stored on the payment, for disputes.
- Soft declines on-session trigger 3DS and one retry; off-session they bring the customer back.
- Saved cards are authenticated at setup, with the mandate stored, and later charges are flagged off-session.
- Exemptions are requested deliberately, with the liability tradeoff understood, and never assumed.

## References

**Specifications**

- [EMVCo: EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/), the protocol and the data issuers use for risk-based decisions
- [FCA: Strong customer authentication](https://www.fca.org.uk/firms/strong-customer-authentication), the UK rules and their effective date

**Reference**

- [Stripe: Strong Customer Authentication guide](https://stripe.com/guides/strong-customer-authentication), exemption thresholds and how recurring and merchant-initiated payments are treated
- [Stripe: SCA readiness](https://docs.stripe.com/strong-customer-authentication), saving cards for off-session use and the mandate agreement
- [Stripe: Authenticate with 3D Secure](https://docs.stripe.com/payments/3d-secure/authentication-flow), the `requires_action` flow, frictionless vs challenge, and the limits of the liability shift
- [Stripe: Decline codes](https://docs.stripe.com/declines/codes), `authentication_required` and other soft declines

**In practice**

- [William Fry: PSR and PSD3 agreed](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/), the November 2025 political agreement on the successor rules
