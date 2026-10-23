+++
title = "Strong Customer Authentication & 3-D Secure"
nav_title = "SCA & 3-D Secure"
description = "When a card payment needs the cardholder to authenticate, the exemptions that skip it, why the liability shift matters, and how an API models the extra step."
category = "Payments Industry"
order = 1414
part = "Taking Payments"
aliases = ["payments/strong-customer-authentication"]
tags = ["payments", "sca", "3ds", "psd2", "authentication"]
+++

[Onboarding](/docs/industries/payments/merchant-onboarding) establishes who the merchant is; the other side of a card payment is whether the person paying is really the cardholder. A card number, an expiry and a CVC prove only that someone has seen a card. Strong Customer Authentication (SCA) closes that gap for online payments in Europe, and 3-D Secure (3DS) is how card payments do it. Treat it as a regulation to bolt on later and you get the worst of it: legitimate European customers declined for "authentication required" with no way to complete the step, and fraud disputes you could have shifted to the bank.

## What SCA Requires

Under PSD2 (the EU's second Payment Services Directive), an electronic payment the payer initiates must be authenticated with at least two independent factors from different categories:

| Category | Example |
| -------- | ------- |
| Knowledge | A password or PIN |
| Possession | A phone that receives a one-time code, or a banking app |
| Inherence | A fingerprint or face scan |

It applies to customer-initiated online payments in the European Economic Area, and the UK kept equivalent rules (the [FCA's SCA rules](https://www.fca.org.uk/firms/strong-customer-authentication) applied from 14 September 2019, with full compliance for online card payments expected by 14 March 2022; across the EEA, supervisors' flexibility for card e-commerce ended on 31 December 2020). If you take payments from European cards, expect issuers to ask for it, whatever your integration assumes.

Two factors from different categories means one stolen thing isn't enough: a phished password without the phone fails, and so does a stolen phone without the PIN. That's why SCA moves fraud economics: stolen card data alone stops being sufficient.

The EU agreed a successor package in November 2025, the Payment Services Regulation (PSR) and PSD3, which keeps strong customer authentication as a core duty ([summary from William Fry](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/)); its application dates were still pending as of October 2026. Build for SCA as it works today; nothing in the new package makes authentication optional.

## How 3-D Secure Works

[EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/) (3DS2) lets the merchant send the issuer far more about the payment than the card details: the device, the browser, the shipping address, the customer's history with the merchant. The issuer runs its own risk assessment on that data and chooses one of two paths:

- **Frictionless:** the issuer is satisfied and approves without involving the customer. The payment still counts as authenticated.
- **Challenge:** the issuer wants proof and shows the customer a step: a code by SMS, approval in the banking app, a biometric.

The data is the lever: the more context you send, the more often the issuer decides frictionlessly, which gets the authenticated outcome without the conversion cost of a challenge. Sending the minimum and getting challenged on everything is how 3DS earns its reputation for hurting checkout.

### The Three Domains

3-D Secure is named for the three domains it spans, and a provider needs to know which parts are its own:

- **The merchant and acquirer domain:** the merchant's **3DS Requestor**, the **3DS SDK** in a mobile app, and the **3DS Server** that builds the authentication messages. This is the provider's side.
- **The interoperability domain:** each network's **Directory Server**, which routes a request to the right issuer and knows which card ranges take part.
- **The issuer domain:** the issuer's **Access Control Server** (ACS), which decides frictionless or challenge and runs the challenge.

The messages come in pairs. The 3DS Server asks the Directory Server which card ranges participate (PReq/PRes) and caches the answer; it sends the authentication request (AReq), the ACS answers (ARes) frictionlessly or with a challenge; the challenge runs in the customer's browser or app (CReq/CRes); and the ACS reports the outcome to the 3DS Server (RReq/RRes). A data-only variant shares the context with the issuer without authenticating, to improve approval rates where a challenge isn't wanted.

**The result has to reach the authorization.** A successful authentication returns an authentication value (Visa calls it the CAVV) and an e-commerce indicator, and the authorization carries both. On Visa, ECI 05 means fully authenticated, 06 an attempt, 07 not authenticated, and Visa's rules make a fraud dispute invalid only when the authenticated or attempted result and its CAVV were in the authorization request. A 3DS integration that authenticates but drops the CAVV on the way to the processor gets the friction and none of the protection. Mastercard uses its own ECI values (02 authenticated, 01 attempted).

**Buy the 3DS Server, usually.** EMVCo approves 3DS Servers, SDKs and ACSs against specific versions of the specification and its test suites, and a provider that operates a 3DS Server, Directory Server or ACS falls under PCI's 3DS Core Security Standard ([Network Certification](/docs/industries/payments/network-certification#3-d-secure-and-tokens)). Most providers integrate an approved server instead. Version 2.3.1 replaced 2.3.0 in 2022, and EMVCo recommends 2.2 or higher.

Outside Europe, nothing requires 3-D Secure. Merchants in the US use it for the liability shift on risky payments, and an issuer may still ask for it on any payment.

## The Liability Shift

By default the merchant bears the loss on a fraud dispute. When a payment was successfully authenticated with 3DS, the liability typically shifts to the issuer: the bank approved the cardholder's identity, so the bank owns that mistake. That's the business case for 3DS beyond compliance: a merchant selling high-value goods can request authentication on risky orders even where SCA doesn't require it, to move fraud losses off its books.

It's not a guarantee. [Stripe's documentation](https://docs.stripe.com/payments/3d-secure/authentication-flow) is explicit that networks exempt some business types, merchants in fraud monitoring programs can lose it, and it never covers non-fraud disputes such as "item not received". Record the authentication result and the Electronic Commerce Indicator (ECI) on the payment so the evidence exists when a [dispute](/docs/industries/payments/disputes-and-chargebacks) arrives.

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
- **Exemptions trade away the liability shift.** An exempted payment wasn't authenticated, so if it turns out to be fraud, the dispute is yours ([above](#the-liability-shift)). Skipping friction on a €480 order to save one tap is a bet on your fraud rate.
- **The counters belong to the issuer.** You can't know whether this €20 payment is the cardholder's sixth exempted one this week. Design for the issuer to ask, always.

## On-Session and Off-Session Payments

The hardest SCA problems aren't at checkout; they're in subscriptions, saved cards and anything charged after the customer has left.

A customer-initiated (on-session) payment has the customer in your checkout, able to complete a challenge, and the flow above handles it. A merchant-initiated (off-session) payment charges a saved card later, with the customer absent: a renewal, a usage bill, a no-show fee. Nobody can complete a challenge, so these are out of scope, but only if the card was saved properly: authenticated when it was saved (on the first payment, or a zero-amount setup if there's none), under a mandate the customer agreed to, and with every later charge flagged as off-session. Even then the issuer can ask, and only the customer, back on-session, can answer. How to save a card that keeps working, from the first transaction to network tokens, account updaters and retrying a declined renewal, is [Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials).

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

### Authentication-Required Declines

One kind of soft decline ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials#declines-and-the-rules-on-retrying) covers the rest) means "try again with authentication" ( such as Stripe's [`authentication_required`](https://docs.stripe.com/declines/codes)). If the customer is present, run 3DS and retry once, which turns a decline into a sale. If not ([off-session](#on-session-and-off-session-payments)), the payment fails and the customer has to come back on-session. Retrying without authentication is a hard decline in waiting, and repeated unauthenticated retries are exactly what card networks penalize.

## What This Means for the System You Build

- **Send rich 3-D Secure data** so most authentications stay frictionless.
- **Request exemptions, but always handle a challenge,** because the issuer decides.
- **Record the authentication result and ECI on the payment,** since they decide who holds a fraud dispute.
- **`requires_action` as a real, expiring state,** with the webhook, not the redirect, as the source of truth.
- **Authenticate when a card is saved,** and flag every later charge as off-session.
- **Handle authentication-required declines** by bringing the customer back, never by retrying blind.

## References

**Specifications**

- [EMVCo: EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/), the protocol and the data issuers use for risk-based decisions
- [FCA: Strong customer authentication](https://www.fca.org.uk/firms/strong-customer-authentication), the UK rules and their effective date

**Reference**

- [Stripe: Strong Customer Authentication guide](https://stripe.com/guides/strong-customer-authentication), exemption thresholds and how recurring and merchant-initiated payments are treated
- [Stripe: SCA readiness](https://docs.stripe.com/strong-customer-authentication), saving cards for off-session use and the mandate agreement
- [Stripe: Authenticate with 3D Secure](https://docs.stripe.com/payments/3d-secure/authentication-flow), the `requires_action` flow, frictionless vs challenge, and the limits of the liability shift
- [Stripe: Decline codes](https://docs.stripe.com/declines/codes), `authentication_required` and other soft declines
- [PCI SSC: 3DS Core Security Standard FAQ (PDF)](https://listings.pcisecuritystandards.org/documents/FAQs_for_PCI_3DS_Core_Security_Standard.pdf), the three domains and the 3DS Server, Directory Server and ACS
- [Visa: Visa Secure processing requirements (PDF)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/visa-secure-vbn-visa-public.pdf), PReq/PRes, the CAVV in authorization and ECI 05
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), fraud disputes invalid when the CAVV was in an authenticated authorization
- [EMVCo: EMV 3-D Secure 2.3.1 (PDF)](https://emvco.com/wp-content/uploads/2022/11/EMV-3DS-2.3.1-press-release.pdf), version 2.3.1 replacing 2.3.0

**In practice**

- [William Fry: PSR and PSD3 agreed](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/), the November 2025 political agreement on the successor rules
