+++
title = "Strong Customer Authentication & 3-D Secure"
nav_title = "SCA & 3-D Secure"
description = "When a card payment needs the cardholder to authenticate, the exemptions that skip it, why the liability shift matters, and how an API models the extra step."
category = "Payments"
order = 807
tags = ["payments", "sca", "3ds", "psd2", "authentication"]
+++

[Onboarding](/docs/payments/merchant-onboarding) establishes who the merchant is; the other side of a card payment is whether the person paying is really the cardholder. A card number, an expiry and a CVC prove only that someone has seen a card. Strong Customer Authentication (SCA) closes that gap for online payments in Europe, and 3-D Secure (3DS) is how card payments do it. Treat it as a regulation to bolt on later and you get the worst of it: legitimate European customers declined for "authentication required" with no way to complete the step, and fraud disputes you could have shifted to the bank.

## What SCA Requires

Under PSD2, an electronic payment the payer initiates must be authenticated with at least two independent factors from different categories:

| Category | Example |
| -------- | ------- |
| Knowledge | A password or PIN |
| Possession | A phone that receives a one-time code, or a banking app |
| Inherence | A fingerprint or face scan |

It applies to customer-initiated online payments in the European Economic Area, and the UK kept equivalent rules (the [FCA's SCA rules](https://www.fca.org.uk/firms/strong-customer-authentication) have applied since 14 September 2019). If you take payments from European cards, expect issuers to ask for it, whatever your integration assumes.

Two factors from different categories means one stolen thing isn't enough: a phished password without the phone fails, and so does a stolen phone without the PIN. That's why SCA moves fraud economics: stolen card data alone stops being sufficient.

The EU agreed a successor package in November 2025, the Payment Services Regulation (PSR) and PSD3, which keeps strong customer authentication as a core duty ([summary from William Fry](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/)); its application dates were still being finalized at the time of writing. Build for SCA as it works today; nothing in the new package makes authentication optional.

## Exemptions: When You Can Skip the Step

Authenticating every payment would add friction to low-risk ones that never needed it, so the rules carve out exemptions, and using them well is most of the work of a good integration. The important ones, with thresholds as [Stripe's SCA guide](https://stripe.com/guides/strong-customer-authentication) summarizes them:

| Exemption | Applies when | Why it exists |
| --------- | ------------ | ------------- |
| **Low value** | Under €30 (£25), until five exempted payments or €100 (£85) in total since the cardholder last authenticated | Small payments carry small losses; the counters stop a fraudster splitting a big purchase into small ones |
| **Transaction risk analysis** | The payment provider's fraud rate is under 0.13% for payments up to €100, under 0.06% up to €250, under 0.01% up to €500 | Providers that prove low fraud earn the right to skip authentication on more of their traffic |
| **Fixed-amount recurring** | The same amount to the same merchant, after the first payment was authenticated | The customer authenticated the agreement once; asking again every month adds nothing |
| **Merchant-initiated** | The customer isn't present, under a mandate they authenticated when the card was saved | Out of scope rather than exempt: there's nobody to authenticate |

Three things make exemptions less straightforward than the table suggests:

- **Exemptions are requests, not rights.** You (or your provider) ask; the issuer can refuse and demand authentication anyway, and an integration that can't handle that will decline real customers.
- **Exemptions trade away the liability shift.** An exempted payment wasn't authenticated, so if it turns out to be fraud, the dispute is yours (below). Skipping friction on a €480 order to save one tap is a bet on your fraud rate.
- **The counters belong to the issuer.** You can't know whether this €20 payment is the cardholder's sixth exempted one this week. Design for the issuer to ask, always.

## How 3-D Secure Works

[EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/) (3DS2) lets the merchant send the issuer far more about the payment than the card details: the device, the browser, the shipping address, the customer's history with the merchant. The issuer runs its own risk assessment on that data and chooses one of two paths:

- **Frictionless:** the issuer is satisfied and approves without involving the customer. The payment still counts as authenticated.
- **Challenge:** the issuer wants proof and shows the customer a step: a code by SMS, approval in the banking app, a biometric.

The data is the lever: the more context you send, the more often the issuer decides frictionlessly, which gets the authenticated outcome without the conversion cost of a challenge. Sending the minimum and getting challenged on everything is how 3DS earns its reputation for hurting checkout.

## The Liability Shift

By default the merchant bears the loss on a fraud dispute. When a payment was successfully authenticated with 3DS, the liability typically shifts to the issuer: the bank approved the cardholder's identity, so the bank owns that mistake. That's the business case for 3DS beyond compliance: a merchant selling high-value goods can request authentication on risky orders even where SCA doesn't require it, to move fraud losses off its books.

It's not a guarantee. [Stripe's documentation](https://docs.stripe.com/payments/3d-secure/authentication-flow) is explicit that networks exempt some business types, merchants in fraud monitoring programs can lose it, and it never covers non-fraud disputes such as "item not received". Record the authentication result and the Electronic Commerce Indicator (ECI) on the payment so the evidence exists when a [dispute](/docs/payments/disputes-and-chargebacks) arrives.

## Modeling the Extra Step in an API

A payment can't always finish in one request: the customer may need to complete a challenge in their banking app first. The API represents "waiting on the customer" as a real state, not a timeout: `requires_action` in the [payment state machine](/docs/payments/payment-states), carrying what the client has to do next:

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

- **The server resumes; the client never decides.** After the challenge, the client tells the server to continue (or the server hears from the authentication provider), and the server authorizes.
- **It expires.** A customer who walks away leaves the payment in `requires_action` forever unless it times out to `failed` with a reason.
- **The response is `200` with a status, not an error.** Needing authentication is a normal outcome of a valid request; a `402` makes every client treat a recoverable step as a failure. Reserve `402` for real declines.
- **Webhooks report the transition,** so a client that loses its connection mid-challenge learns the outcome from `payment.authorized` or `payment.failed` ([Webhooks](/docs/payments/webhooks)).

### Soft Declines

An issuer can also decline an unauthenticated attempt with a code meaning "try again with authentication" (a soft decline, such as Stripe's [`authentication_required`](https://docs.stripe.com/declines/codes)). If the customer is present, run 3DS and retry once, which turns a decline into a sale. If not (below), the payment fails and the customer has to come back on-session. Retrying without authentication is a hard decline in waiting, and repeated unauthenticated retries are exactly what card networks penalize.

## On-Session and Off-Session Payments

The hardest SCA problems aren't at checkout; they're in subscriptions, saved cards and anything charged after the customer has left.

A customer-initiated (on-session) payment has the customer in your checkout, able to complete a challenge, and the flow above handles it. A merchant-initiated (off-session) payment charges a saved card later, with the customer absent: a renewal, a usage bill, a no-show fee. Nobody can complete a challenge, so these are out of scope, but only if the card was set up properly, which comes down to the first transaction:

1. **Authenticate when you save the card.** Run SCA on the first payment, or on a zero-amount setup if there's no payment yet. That authenticated setup is what later off-session charges reference.
2. **Get and keep the mandate:** that you may charge them later, how often, and how the amount is set. It's your evidence the charge was authorized ([Stripe's SCA guide](https://docs.stripe.com/strong-customer-authentication) lists what it should cover).
3. **Flag every later charge as off-session,** telling the issuer there's no customer to challenge and the payment relies on the mandate.
4. **Plan for the issuer asking anyway.** Even a correct off-session payment can soft-decline: email the customer a link to complete it on-session, and leave the subscription in a grace state rather than cancelling it.

A saved card that skipped step 1 is a liability: every off-session charge on it risks a soft decline you can't resolve without the customer, which shows up as involuntary churn months after the integration shipped.

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
