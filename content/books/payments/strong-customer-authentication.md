+++
title = "Strong Customer Authentication & 3-D Secure"
nav_title = "SCA & 3-D Secure"
description = "When a card payment needs the cardholder to authenticate, the exemptions that skip it, 3RI and delegation, the liability shift, and mandates beyond the EU."
category = "Payments Industry"
order = 1419
part = "Taking Payments"
aliases = ["payments/strong-customer-authentication"]
tags = ["payments", "sca", "3ds", "psd2", "authentication"]
+++

[Designing the Payments API](/books/payments/payments-api) gave a payment a `requires_action` state and said Strong Customer Authentication is the reason. This chapter is that step. [Onboarding](/books/payments/merchant-onboarding) established who the merchant is; authentication asks whether the person paying is really the cardholder. A card number, an expiry and a CVC prove only that someone has seen a card. Strong Customer Authentication (SCA) closes that gap for online payments in Europe, and 3-D Secure (3DS) is how card payments do it. Treat it as a regulation to bolt on later and you get the worst of it: legitimate European customers declined for "authentication required" with no way to complete the step, and fraud disputes you could have shifted to the bank.

## What SCA Requires

Under PSD2 (the EU's second Payment Services Directive), an electronic payment the payer initiates must be authenticated with at least two independent factors from different categories:

| Category | Example |
| -------- | ------- |
| Knowledge | A password or PIN |
| Possession | A phone that receives a one-time code, or a banking app |
| Inherence | A fingerprint or face scan |

It applies to customer-initiated online payments in the European Economic Area, and the UK kept equivalent rules (the FCA's SCA rules applied from 14 September 2019, with full compliance for online card payments expected by 14 March 2022; across the EEA, supervisors' flexibility for card e-commerce ended on 31 December 2020). If you take payments from European cards, expect issuers to ask for it, whatever your integration assumes. The rest of what changes in Europe (capped interchange, the surcharge ban, instant transfers, direct debit refunds, licensing) is in [Payments in the EU & UK](/books/payments/eu-and-uk).

Two factors from different categories means one stolen thing isn't enough: a phished password without the phone fails, and so does a stolen phone without the PIN. That's why SCA moves fraud economics: stolen card data alone stops being sufficient.

PSD2's successor, PSD3 and the Payment Services Regulation (PSR), keeps SCA as a core duty. As of October 2026 it isn't adopted, let alone in force: politically agreed in November 2025, it is awaiting the Council's position and Parliament's final vote; where its adoption stands is in [Outside the US](/books/payments/payments-rulebook#outside-the-us), and what it changes for SCA is [below](#beyond-psd2).

## How 3-D Secure Works

EMV 3-D Secure (3DS2) lets the merchant send the issuer far more about the payment than the card details: the device, the browser, the shipping address, the customer's history with the merchant. The issuer runs its own risk assessment on that data and chooses one of two paths:

- **Frictionless:** the issuer is satisfied and approves without involving the customer. The payment still counts as authenticated.
- **Challenge:** the issuer wants proof and shows the customer a step: a code by SMS, approval in the banking app, a biometric.

The data is the lever: the more context you send, the more often the issuer decides frictionlessly, which gets the authenticated outcome without the conversion cost of a challenge. Sending the minimum and getting challenged on everything is how 3DS earns its reputation for hurting checkout.

### The Three Domains

3-D Secure is named for the three domains it spans, and a provider needs to know which parts are its own:

- **The merchant and acquirer domain:** the merchant's **3DS Requestor**, the **3DS SDK** in a mobile app, and the **3DS Server** that builds the authentication messages. This is the provider's side.
- **The interoperability domain:** each network's **Directory Server**, which routes a request to the right issuer and knows which card ranges take part.
- **The issuer domain:** the issuer's **Access Control Server** (ACS), which decides frictionless or challenge and runs the challenge ([what the issuer must do with it](/books/payments/issuer-processing#issuer-side-fraud)).

The messages come in pairs. The 3DS Server asks the Directory Server which card ranges participate (PReq/PRes) and caches the answer; it sends the authentication request (AReq), the ACS answers (ARes) frictionlessly or with a challenge; the challenge runs in the customer's browser or app (CReq/CRes); and the ACS reports the outcome to the 3DS Server (RReq/RRes). A data-only variant shares the context with the issuer without authenticating, to improve approval rates where a challenge isn't wanted.

**The result has to reach the authorization.** A successful authentication returns an authentication value (Visa calls it the CAVV) and an **electronic commerce indicator** (ECI), and the authorization carries both. On Visa, ECI 05 means fully authenticated, 06 an attempt, 07 not authenticated, and Visa's rules make a fraud dispute invalid only when the authenticated or attempted result and its CAVV were in the authorization request. A 3DS integration that authenticates but drops the CAVV on the way to the processor gets the friction and none of the protection. Mastercard uses its own ECI values (02 authenticated, 01 attempted or by a stand-in service).

**Buy the 3DS Server, usually.** EMVCo approves 3DS Servers, SDKs and ACSs against specific versions of the specification and its test suites, and a provider that operates a 3DS Server, Directory Server or ACS falls under PCI's 3DS Core Security Standard ([Network Certification](/books/payments/network-certification#3-d-secure-and-tokens)). Most providers integrate an approved server instead. Version 2.3.1 replaced 2.3.0 in 2022, and EMVCo recommends 2.2 or higher.

Outside Europe, 3-D Secure is mostly optional; [Beyond PSD2](#beyond-psd2) covers the exceptions.

## The Liability Shift

By default the merchant bears the loss on a fraud dispute. When a payment was successfully authenticated with 3DS, the liability typically shifts to the issuer: the bank approved the cardholder's identity, so the bank owns that mistake. That's the business case for 3DS beyond compliance: a merchant selling high-value goods can request authentication on risky orders even where SCA doesn't require it, to move fraud losses off its books.

It's not a guarantee. Stripe's documentation is explicit that networks exempt some business types, merchants in fraud monitoring programs can lose it, and it never covers non-fraud disputes such as "item not received". Checkout.com's ECI reference shows where it stops at the protocol level: a Visa ECI 07, which covers a payment processed under an SCA exemption as well as a failed or unattempted authentication, carries no liability shift, nor does a Mastercard 00. Record the authentication result and the ECI on the payment so the evidence exists when a [dispute](/books/payments/disputes-and-chargebacks) arrives.

## Exemptions: When You Can Skip the Step

Authenticating every payment would add friction to low-risk ones that never needed it, so the rules carve out exemptions, and using them well is most of the work of a good integration. The important ones, with the EU thresholds from the regulatory technical standards on SCA (Commission Delegated Regulation (EU) 2018/389) and the UK's as Stripe's SCA guide summarizes them:

| Exemption | Applies when | Why it exists |
| --------- | ------------ | ------------- |
| **Low value** (Art. 16) | Under €30 (£25), until five exempted payments or €100 (£85) in total since the cardholder last authenticated | Small payments carry small losses; the counters stop a fraudster splitting a big purchase into small ones |
| **Transaction risk analysis** (Art. 18) | The payment provider's fraud rate is under 0.13% for payments up to €100, under 0.06% up to €250, under 0.01% up to €500 | Providers that prove low fraud earn the right to skip authentication on more of their traffic |
| **Fixed-amount recurring** (Art. 14) | The same amount to the same merchant, after the first payment was authenticated | The customer authenticated the agreement once; asking again every month adds nothing |
| **Merchant-initiated** | The customer isn't present, under a mandate they authenticated when the card was saved | Out of scope rather than exempt: there's nobody to authenticate |

Three things make exemptions less straightforward than the table suggests:

- **Exemptions are requests, not rights.** You (or your provider) ask; the issuer can refuse and demand authentication anyway, and an integration that can't handle that will decline real customers.
- **Exemptions you request trade away the liability shift.** A payment exempted at your or your acquirer's request wasn't authenticated, so if it turns out to be fraud, the dispute is yours ([above](#the-liability-shift)). Exemptions the issuer applies on its own, such as a [trusted beneficiary](#who-performs-the-authentication), are the exception and keep it. Skipping friction on a €480 order to save one tap is a bet on your fraud rate.
- **The counters belong to the issuer.** You can't know whether this €20 payment is the cardholder's sixth exempted one this week. Design for the issuer to ask, always.

## On-Session and Off-Session Payments

The hardest SCA problems aren't at checkout; they're in subscriptions, saved cards and anything charged after the customer has left.

A customer-initiated (on-session) payment has the customer in your checkout, able to complete a challenge, and the flow above handles it. A merchant-initiated (off-session) payment charges a saved card later, with the customer absent: a renewal, a usage bill, a no-show fee. Nobody can complete a challenge, so these are out of scope, but only if the card was saved properly: authenticated when it was saved (on the first payment, or a zero-amount setup if there's none), under a mandate the customer agreed to, and with every later charge flagged as off-session. Even then the issuer can ask, and only the customer, back on-session, can answer. How to save a card that keeps working, from the first transaction to network tokens, account updaters and retrying a declined renewal, is [Stored Cards & Recurring Billing](/books/payments/stored-credentials).

### 3RI: Authenticating Without the Customer

**3DS Requestor Initiated (3RI)** authentication is the EMV 3-D Secure flow the merchant starts with the cardholder absent. The merchant keeps the reference to an earlier, cardholder-completed authentication and asks the issuer for a fresh authentication value for a later charge on the same agreement: the next installment, the second half of a split shipment, a delayed charge whose final amount wasn't known at checkout, or a travel booking spread across several providers. No challenge is possible, so the issuer decides from the original authentication and its own risk view. Use it where the network or issuer wants a current authentication value on a merchant-initiated charge; it doesn't replace flagging the charge as merchant-initiated, and it needs a 3DS Server and issuer that support version 2.2 or later. Decoupled authentication, where the issuer reaches the cardholder out of band and answers later, is the related flow for when the customer can still be asked but isn't at the screen.

## Who Performs the Authentication

The issuer is responsible for SCA, but it doesn't have to run every challenge itself.

- **Delegated authentication.** EMV 3DS 2.2 lets an issuer delegate SCA to the merchant or a third party (a wallet, a large merchant with its own biometric login) that authenticates the cardholder itself and passes proof, typically a FIDO attestation, in the 3DS request. Visa's program for it is Visa Delegated Authentication. The draw is no redirect at all; the cost is that, per provider documentation, the payment doesn't carry the usual liability shift, and it needs the issuer, the merchant and the 3DS Server provider to have agreed to it, which is why adoption has been narrow.
- **Trusted beneficiaries.** A cardholder can add a merchant to a list held by their issuer, completing a challenge once; later payments to that merchant can be exempted by the issuer and keep the liability shift.

Both move friction out of checkout without moving the issuer's decision. An integration still has to handle a challenge whenever the issuer asks for one.

## Modeling the Extra Step in an API

The general shape of a payment that waits on the customer (a `requires_action` state with a typed next action, resumed by the server, expiring, reported by webhook) is in [Designing the Payments API](/books/payments/payments-api#waiting-on-the-customer). What 3-D Secure adds:

- **Two kinds of next action.** A browser challenge is a redirect or an iframe to the ACS; an in-app challenge runs inside the 3DS SDK, so the next action carries what the SDK needs instead of a URL.
- **A frictionless result never stops.** If the ACS answers frictionlessly, the payment goes straight from authentication to authorization and the client never sees `requires_action`.
- **The authentication result is part of the attempt.** Store the 3DS version, the transaction status, the ECI, whether an authentication value came back, the Directory Server transaction ID (which 3RI reuses later) and any exemption requested and granted, on the payment attempt that used them, since the [liability shift](#the-liability-shift) and every later [dispute](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence) turn on them:

```sql
ALTER TABLE payment_attempts
  ADD COLUMN three_ds_version         TEXT,     -- 2.2.0, 2.3.1
  ADD COLUMN three_ds_status          TEXT,     -- Y, A, N, U, R, or C for a challenge
  ADD COLUMN eci                      TEXT,     -- 05/06/07 on Visa, 02/01 on Mastercard
  ADD COLUMN has_authentication_value BOOLEAN,  -- the CAVV goes to the processor, not your logs
  ADD COLUMN ds_transaction_id        TEXT,
  ADD COLUMN exemption_requested      TEXT,     -- low_value, tra, trusted_beneficiary
  ADD COLUMN exemption_granted        BOOLEAN;
```

### Authentication-Required Declines

One kind of soft decline ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#declines-and-the-rules-on-retrying) covers the rest) means "try again with authentication", such as Adyen's refusal reason 38, "Authentication required" (the issuer declined the exemption request), or Stripe's `authentication_required`. If the customer is present, run 3DS and retry once, which turns a decline into a sale. If not ([off-session](#on-session-and-off-session-payments)), the payment fails and the customer has to come back on-session. Retrying without authentication is a hard decline in waiting, and repeated unauthenticated retries are exactly what card networks penalize.

## Beyond PSD2

SCA started in Europe, and it's spreading in two directions: the EU's next rules, and other countries' own mandates.

- **The EU's PSR.** The Commission's proposal for the Payment Services Regulation adds accessibility to SCA: every customer, including people with disabilities, older people and those without digital channels, must have a way to authenticate, and SCA can't depend on owning a smartphone. It keeps mail and telephone orders out of SCA's scope, as PSD2 already does ([Phone Payments](/books/payments/phone-payments#the-rules-for-taking-a-payment-by-phone)); the EBA's advice for the review had found merchants labeling online payments as MOTO to skip SCA. As of October 2026 the text agreed in 2025 is still awaiting final adoption; check it before building against it. For a provider, the practical change is a non-smartphone path that issuers must offer and checkout must not break.
- **India.** The Reserve Bank of India's 2025 authentication directions, in force from April 1, 2026, require at least two factors for domestic digital payments and let issuers add risk-based checks on top. They also require card issuers to validate an additional factor of authentication on non-recurring cross-border card-not-present payments when the overseas merchant or acquirer asks for it, which is a reason for a provider outside India to support requesting 3DS for Indian cards.
- **The UK** supervises its own SCA rules through the FCA ([above](#what-sca-requires)).

Elsewhere, 3-D Secure is optional ([above](#how-3-d-secure-works)), and an issuer may still ask for it on any payment. Keep the decision to request authentication a per-payment, per-country rule with effective dates, not a constant ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## What This Means for the System You Build

- **Send rich 3-D Secure data** so most authentications stay frictionless.
- **Request exemptions, but always handle a challenge,** because the issuer decides, even under delegation or a trusted-beneficiary listing.
- **Record the authentication result, ECI and exemption on the payment attempt,** since they decide who holds a fraud dispute.
- **`requires_action` as a real, expiring state,** with the webhook, not the redirect, as the source of truth.
- **Authenticate when a card is saved,** flag every later charge as off-session, and keep the original authentication's reference for 3RI.
- **Handle authentication-required declines** by bringing the customer back, never by retrying blind.
- **Authentication rules per country,** with dates, so India's cross-border request or the PSR's non-smartphone path is a rule change, not a release.

## References

**Specifications**

- [Commission Delegated Regulation (EU) 2018/389](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0389), the regulatory technical standards on SCA: trusted beneficiaries (Art. 13), recurring transactions (Art. 14), low-value remote payments up to €30 with the €100 or five-payment cumulative limit (Art. 16), transaction risk analysis (Art. 18) and the Annex's reference fraud rates of 0.13%, 0.06% and 0.01% for €100, €250 and €500
- [EMVCo: EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/), the protocol and the data issuers use for risk-based decisions
- [FCA: Strong customer authentication](https://www.fca.org.uk/firms/strong-customer-authentication), the UK rules and their effective date
- [RBI: Directions on authentication mechanisms for digital payment transactions](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=61282), the September 2025 directions, compliance from April 1, 2026, and the additional factor on cross-border card-not-present payments

**Reference**

- [EBA: Opinion on the deadline for the migration to SCA (EBA-Op-2019-11)](https://www.eba.europa.eu/sites/default/files/documents/10180/2622242/e8b3ec84-c1c6-4e9a-96ea-3575361dc230/Opinion%20on%20the%20deadline%20for%20the%20migration%20to%20SCA.pdf), the end of supervisory flexibility for e-commerce card payments on 31 December 2020
- [European Parliament: Legislative Observatory, 2023/0210(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2023/0210(COD)), the PSR procedure: committee approval of the agreed text on 5 May 2026, awaiting the Council's position
- [Stripe: Strong Customer Authentication guide](https://stripe.com/guides/strong-customer-authentication), the UK exemption thresholds and how recurring and merchant-initiated payments are treated
- [Stripe: SCA readiness](https://docs.stripe.com/strong-customer-authentication), saving cards for off-session use and the mandate agreement
- [Stripe: Authenticate with 3D Secure](https://docs.stripe.com/payments/3d-secure/authentication-flow), the `requires_action` flow, frictionless vs challenge, and the limits of the liability shift
- [Stripe: Decline codes](https://docs.stripe.com/declines/codes), `authentication_required` and other soft declines
- [Adyen: Refusal reasons](https://docs.adyen.com/development-resources/refusal-reasons), refusal reason 38, "Authentication required", when the issuer declines an exemption request
- [PCI SSC: 3DS Core Security Standard FAQ (PDF)](https://listings.pcisecuritystandards.org/documents/FAQs_for_PCI_3DS_Core_Security_Standard.pdf), the three domains and the 3DS Server, Directory Server and ACS
- [Visa: Visa Secure processing requirements (PDF)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/visa-secure-vbn-visa-public.pdf), PReq/PRes, the CAVV in authorization and ECI 05
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), fraud disputes invalid when the CAVV was in an authenticated authorization
- [EMVCo: EMV 3-D Secure 2.3.1 (PDF)](https://emvco.com/wp-content/uploads/2022/11/EMV-3DS-2.3.1-press-release.pdf), version 2.3.1 replacing 2.3.0
- [Visa: European EMV 3DS 2.2.0 implementation guide (PDF)](https://fi.review.visa.com/dam/VCOM/regional/ve/unitedkingdom/PDF/sca/visa-european-emv-3ds-220-implementation-guide.pdf), Visa Delegated Authentication and Trusted Listing as products 3DS 2.2 enables
- [techUK: EU introduces key changes to payment regulations](https://www.techuk.org/insights/news/eu-introduces-key-changes-to-payment-regulations), the PSR proposal's accessibility requirements for SCA, no smartphone dependence, and MOTO out of scope

**In practice**

- [Checkout.com: ECI values](https://checkout.com/docs/developer-resources/codes/eci-values), Mastercard 02, 01 and 00 and Visa 05, 06 and 07, and which shift liability
- [Visa Acceptance: Merchant-initiated transactions (3RI)](https://developer.visaacceptance.com/docs/vas/en-us/payer-authentication/developer/all/rest/payer-auth/pa-3ri-intro.html), merchant-started 3DS for installments, split and delayed shipments, and unknown final amounts
- [ProcessOut: SCA explainer](https://docs.processout.com/page/sca-explainer), delegated authentication with FIDO attestation and no liability shift, trusted beneficiaries, 3RI and decoupled authentication
- [William Fry: PSR and PSD3 agreed](https://www.williamfry.com/knowledge/psr-psd3-eu-payment-services-legislation-is-agreed/), the November 2025 political agreement keeping SCA as a core duty
