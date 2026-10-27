+++
title = "Wallets & Local Payment Methods"
nav_title = "Wallets & Local Methods"
description = "Apple Pay and Google Pay as network tokens, PayPal, BNPL, and the bank rails other countries pay with: SEPA, iDEAL and Wero, Pix, UPI and UK pay-by-bank."
category = "Payments Industry"
order = 1408
part = "How Money Moves"
tags = ["payments", "wallets", "apple-pay", "google-pay", "bnpl", "sepa", "pix", "upi", "open-banking"]
+++

[How Card Payments Work](/books/payments/card-payments) describes one shape of payment: a card number goes in, an authorization comes back in seconds, and money follows days later. The cash vouchers at the end of [Cash Payments](/books/payments/cash-payments#cash-around-the-world) were already a different shape. Most of the world doesn't pay that way, and a growing share of card payments don't look like that at the checkout either. A wallet puts a token where the card number was. A buy now, pay later provider puts a lender in the middle. And in much of Europe, Brazil and India the default isn't a card at all but a push from the customer's bank account, confirmed by a redirect or a QR code and finished whenever the bank says so.

Each method is a different contract about three things: when you know the payment happened, when it can no longer be taken back, and how a customer gets their money back. Get those three right per method, and adding the next one is configuration. Get them wrong, and every new method is a new class of incident.

## Wallets Are Cards in Disguise

Apple Pay and Google Pay aren't payment rails. They're ways of presenting a card that the networks already know how to process, with the card number replaced by a network token bound to the device.

The token is a **device account number** (DPAN), issued by the network's token service for that card on that phone, alongside the real card number (the FPAN) that never leaves the issuer and the token vault. Every payment carries a fresh **cryptogram** generated in the device's secure element, which proves this token was used on this device for this transaction. Apple's payment data says it plainly: the decrypted `applicationPrimaryAccountNumber` is the "device-specific account number", and for an online payment it comes with an `onlinePaymentCryptogram` and, when present, an ECI (electronic commerce indicator, the code saying whether the payment was authenticated) you must pass to the processor or the transaction fails. That's why wallet payments tend to approve better and dispute less than typed card numbers: the issuer sees a strongly authenticated token instead of digits anyone could have copied. [Stored Cards & Recurring Billing](/books/payments/stored-credentials) covers network tokens in general; a wallet is the same idea, provisioned by the phone.

Two things are different from a card form:

- **Merchant validation.** On the web, Apple Pay requires your server to request a payment session from Apple over mutual TLS, with your merchant identity certificate, for every transaction, and only from Apple's own validation URLs. The session lasts five minutes. Domains must be registered against the merchant ID first. A platform registering merchants does this per merchant, which makes Apple Pay a provisioning step in [Merchant Onboarding](/books/payments/merchant-onboarding), not a button.
- **Who decrypts.** The payment token arrives encrypted to a key you or your processor hold. Let the processor decrypt it. Decrypting yourself means verifying Apple's signature chain, checking the signing time against replays, restoring the symmetric key, and then holding a real card credential in your systems, which is everything [PCI DSS](/docs/compliance/pci-dss) scopes. Google states the line explicitly: its direct integration, where you decrypt on your own servers, requires PCI DSS compliance validated by a Qualified Security Assessor (QSA). Google Pay also returns two kinds of credentials: a device token with a 3-D Secure cryptogram, or a plain card number stored in the user's Google account. The second is just a card and gets treated like one, including for [Strong Customer Authentication (SCA)](/books/payments/strong-customer-authentication).

**Click to Pay** is the networks' answer for browsers without a wallet: EMVCo's Secure Remote Commerce specification, under a common consumer brand, letting a cardholder pick a card enrolled with their network instead of typing it. It's another way a network token arrives, and the same rules apply.

## Wallets That Are Rails

PayPal and Venmo are different in kind. A PayPal payment moves money between PayPal accounts on PayPal's ledger, funded by whatever the customer linked. You don't see a card, you get PayPal's confirmation, refunds go back through PayPal, and disputes follow PayPal's own resolution process and seller protection terms rather than a card network's. Model them as their own method with their own state machine, not as a card brand.

## Buy Now, Pay Later

Affirm, Afterpay, Klarna and their peers put a lender between the customer and the merchant. The customer is approved at checkout and repays the provider in installments; the provider pays the merchant upfront, minus a merchant fee that's usually well above card pricing, and takes the credit risk of the customer not paying. For the merchant it's a redirect or an embedded widget, an approval, and a settlement from the provider. Refunds go through the provider, which adjusts the customer's plan, and disputes go through the provider's process.

The regulation moved under it. In May 2024 the CFPB issued an interpretive rule treating BNPL lenders as card issuers under Regulation Z, which would have given BNPL customers credit card dispute rights. On May 12, 2025 it withdrew that rule. So BNPL dispute handling is whatever the provider's terms say, which is one more reason to keep it a separate method in your model rather than folding it into cards.

## Bank Push and Bank Pull

Most of the rest of the world's local methods move money between bank accounts directly. They come in two directions, and the direction decides almost everything about how you build for them.

**Push** methods have the customer send money: the customer's bank initiates a credit to you after they approve it in their banking app. There's no card number, no authorization hold and usually no chargeback, and once the money arrives it's yours. The cost is that you don't control when, or whether, it arrives.

- **SEPA Credit Transfer** across the euro area must reach the payee's bank by the end of the next business day. **SEPA Instant (SCT Inst)** completes in seconds, and the EU's Instant Payments Regulation (2024/886) made it mandatory across the euro area, with free **Verification of Payee** checking the payee's name against the IBAN (international bank account number) before the payer confirms; the deadlines and what name checks mean for payouts are in [SEPA Credit Transfer and SEPA Instant](/books/payments/eu-and-uk#sepa-credit-transfer-and-sepa-instant).
- **iDEAL**, the Netherlands' dominant online method, is a redirect to the customer's bank that confirms a push. It's being folded into **Wero**, the European Payments Initiative's wallet: the combined iDEAL | Wero logo started appearing in early 2026, the Dutch Payments Association's plan had every Dutch bank connected to Wero by October 2026 with payments then moving to Wero's infrastructure step by step, and the banks and payment providers aim to finish the migration by December 31, 2027. An integration built against iDEAL today needs a plan for Wero.
- **Pix**, run by Brazil's central bank since November 2020, settles instantly at any hour, addressed by a key (a tax ID, phone number, email or random identifier) or a QR code. **Pix Automático**, for recurring payments, took effect on June 16, 2025, and Pix has its own return mechanism (MED, Mecanismo Especial de Devolução) for fraud claims, not a chargeback.
- **UPI**, developed and run by India's National Payments Corporation, is a real-time push-and-pull system addressed by a UPI ID, with AutoPay mandates for recurring payments.
- **Faster Payments** in the UK has been instant since it launched on May 27, 2008, and it's what UK "pay by bank" runs on: an open banking provider initiates the push from the customer's bank with their approval. UK payment firms must reimburse victims of authorized push payment scams on Faster Payments, with the cost split equally between the payer's bank and the payee's ([APP Scam Reimbursement](/books/payments/eu-and-uk#app-scam-reimbursement)), which gives both banks a reason to question who receives a push, including a platform's merchants.

**Pull** methods have you collect from the customer's account under a mandate they signed. They feel like cards, but they're slow, and they stay reversible for a long time.

- **SEPA Direct Debit** lets the payer get any core direct debit refunded within eight weeks, no questions asked, and up to 13 months after the debit if it had no valid mandate. The business-to-business scheme has no such refund right. Treat a SEPA debit like an [ACH](/books/payments/ach) debit: settled isn't final, and the ledger has to know the difference. Mandates, notice and timing are in [SEPA Direct Debit](/books/payments/eu-and-uk#sepa-direct-debit).
- **Bacs Direct Debit** in the UK comes with the Direct Debit Guarantee: advance notice of any change in amount or date, and "a full and immediate refund" from the customer's bank if an error is made. The customer's bank refunds first and the merchant finds out after ([Bacs](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps) has the cycle and the service user number).
- **Variable recurring payments** (VRP) let a customer authorize a provider to pull from their account within limits through open banking. Sweeping between a customer's own accounts came first; commercial VRP is run by the UK Payments Initiative, whose scheme launched on June 2, 2026 with government, utilities, charities and financial services as its first uses.

## Comparing the Methods

| Method | You know it worked | Final when | Refund | Customer dispute |
| ------ | ------------------ | ---------- | ------ | ---------------- |
| Card or wallet | In seconds (authorization) | After the chargeback window | You refund through the processor | Card [chargeback](/books/payments/disputes-and-chargebacks) |
| PayPal, Venmo | In seconds | Per the provider's terms | Through the provider | The provider's process |
| BNPL | When the provider approves | Paid out by the provider | Through the provider | The provider's process |
| SEPA Instant, Faster Payments, Pix, UPI | When the push arrives, seconds | On arrival | You send a new transfer | No chargeback; fraud schemes (reimbursement for authorized push payment scams, MED) |
| SEPA Credit Transfer, iDEAL | When the push arrives | On arrival | You send a new transfer | No chargeback |
| SEPA Direct Debit, Bacs Direct Debit | Days later | 8 weeks (SEPA), longer if unauthorized | You refund, or their bank does | Scheme refund rights |
| Cash vouchers: Boleto, OXXO, Konbini | When the payer pays: immediately (Konbini) to the next business day (Boleto, OXXO) | On payment | Over another rail | No chargeback |

Cash vouchers, covered with the US retail networks in [Cash Payments](/books/payments/cash-payments#cash-around-the-world), have the same asynchronous shape; the last row of the table is there for comparison.

## What This Means for the System You Build

The engineering follows from that table:

- **The redirect isn't the result.** Most local methods send the customer to their bank or app and back. They might not come back, and coming back proves nothing. The source of truth is the provider's [webhook](/docs/api-design/webhooks), or your own status query when it's late. The order is "pending" until then.

![Async payment flow: the customer is redirected from checkout to their bank, approves the payment there, and is returned to the merchant with the order still pending; the provider's webhook, not the redirect, marks the payment received, and a status check covers a webhook that never arrives.](/diagrams/async-payment.svg "The redirect isn't the result. The customer may never come back, and coming back proves nothing; the provider's webhook or your own status check is what moves the order from pending to paid.")

- **Every method needs its own states.** A card is authorized and then captured; a push is awaiting funds and then received; a debit is submitted, settled and then final weeks later. Forcing them into one card-shaped state machine is how a returned direct debit becomes a shipped order that nobody paid for. [Payment States & Ledgers](/docs/payments/payment-states#settled-is-not-final) holds the rule: each method's states are explicit, and the ledger records the difference between settled and final.
- **Refunds are a new payment.** On a push rail there's nothing to reverse; a refund is a credit you send, with its own failure modes (a closed account, a wrong IBAN that Verification of Payee would have caught).
- **Currency is part of the method.** Pix is reais, UPI is rupees, SEPA is euros. [Multi-Currency & FX](/docs/payments/multi-currency) covers what presenting and settling in each costs.

## References

**Specifications**

- [Apple: Payment token format reference](https://developer.apple.com/documentation/passkit/payment-token-format-reference), the device-specific account number, online payment cryptogram and ECI indicator, and the steps to verify and decrypt a token
- [Apple: Requesting an Apple Pay payment session](https://developer.apple.com/documentation/applepayontheweb/requesting-an-apple-pay-payment-session), server-side merchant validation over mutual TLS, per transaction, with a five-minute session
- [Google Pay API: Request objects](https://developers.google.com/pay/api/web/reference/request-objects), PAN_ONLY and CRYPTOGRAM_3DS credentials, and the direct integration's PCI DSS requirement
- [EMVCo: Secure Remote Commerce specifications](https://www.emvco.com/news/emvco-updates-emv-secure-remote-commerce-specifications-for-more-flexible-online-checkout/), the specification behind Click to Pay

**Reference**

- [CFPB: Buy Now, Pay Later products](https://www.consumerfinance.gov/compliance/compliance-resources/consumer-cards-resources/buy-now-pay-later-bnpl-products/), the withdrawal of the 2024 BNPL interpretive rule on May 12, 2025
- [Deutsche Bundesbank: SEPA Direct Debit](https://www.bundesbank.de/en/tasks/payment-systems/services/sepa/content/sepa-direct-debit-626654), the eight-week and 13-month refund rights, and none for B2B
- [EUR-Lex: Directive (EU) 2015/2366 (PSD2)](https://eur-lex.europa.eu/eli/dir/2015/2366/oj), Article 83: a credit transfer credited to the payee's provider by the end of the following business day
- [KPMG: Instant Payment Regulation](https://kpmg.com/de/en/industries/financial-services/banking/instant-payment-regulation.html), the Instant Payments Regulation making SEPA Instant mandatory
- [Mason Hayes & Curran: Instant Payments Regulation update](https://mhc.ie/latest/insights/instant-payments-regulation-update), free Verification of Payee before the payer confirms
- [Wikipedia: Pix](https://en.wikipedia.org/wiki/Pix_%28payment_system%29), run by Brazil's central bank since November 2020, with keys and QR codes
- [Banco Central do Brasil: Fórum Pix, June 2025 (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Forum_Pix_Plenaria/20252606-Forum_Pix.pdf), Pix Automático rules in force from June 16, 2025, and the return mechanism (MED)
- [Wikipedia: Unified Payments Interface](https://en.wikipedia.org/wiki/Unified_Payments_Interface), developed and run by NPCI, UPI IDs and AutoPay mandates
- [Direct Debit: The Direct Debit Guarantee](https://www.directdebit.co.uk/direct-debit-explained/direct-debit-guarantee/), advance notice and an immediate refund on error
- [PSR: Commercial variable recurring payments, update on delivery (PDF)](https://www.psr.org.uk/media/xgjcblmb/cvrp-update-on-delivery-_-dec-2025.pdf), the UK Payments Initiative and the plan for first live payments
- [FCA: Launch of the UK Payments Initiative scheme](https://www.fca.org.uk/news/statements/open-banking-launch-uk-payments-initiative-scheme), the commercial VRP scheme's launch on June 2, 2026
- [iDEAL: iDEAL to phase into Wero starting in 2026](https://ideal.nl/en/ideal-vanaf-2026-stapsgewijs-over-naar-wero), the co-branded iDEAL | Wero logo from early 2026 and the phases of the migration
- [Dutch Payments Association: Next phase of iDEAL migration to Wero](https://www.betaalvereniging.nl/en/news/next-phase-of-ideal-migration-to-wero-begins-in-october/), all Dutch banks connected to Wero by October 2026 (July 16, 2026) and the migration finished by December 31, 2027
- [Pay.UK: Heritage](https://www.wearepay.uk/who-we-are/heritage/), the Faster Payment Service launched on May 27, 2008

**In practice**

- [Lewis Silkin: PSR confirms maximum reimbursement level for APP fraud](https://www.lewissilkin.com/insights/2024/09/27/updated-psr-confirms-maximum-reimbursement-level-for-app-fraud-102jii9), the PSR's mandatory reimbursement of APP scams on Faster Payments
- [Stripe: iDEAL to Wero migration](https://support.stripe.com/questions/ideal-to-wero-migration), what the migration phases mean for a merchant integration
