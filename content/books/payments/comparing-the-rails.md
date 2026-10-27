+++
title = "Comparing the Rails"
description = "Every way money moves, side by side: who starts it, when you know it worked, when it settles, when it's final, how it comes back, and which accounts it crosses."
category = "Payments Industry"
order = 1410
part = "How Money Moves"
tags = ["payments", "rails", "settlement", "ledger", "treasury"]
+++

The chapters before this one take one way of paying at a time: [cards](/books/payments/card-payments) online and [in person](/books/payments/card-present), [ACH](/books/payments/ach), [checks](/books/payments/checks), [cash](/books/payments/cash-payments), and the [wallets and local methods](/books/payments/wallets-and-local-methods) the rest of the world uses, with [Cross-Border Payments & FX](/books/payments/cross-border-and-fx) for what changes when payer and merchant are in different countries. A provider runs all of them through one platform, and the platform's job is to treat each honestly: not as a card that happens to be slower, but as a rail with its own answers to the same few questions. This chapter puts those answers side by side. It also includes two rails that come later, Canadian pre-authorized debits and pushes to a debit card, so the comparison is complete.

## The Questions Every Rail Answers

| Rail | Who starts it | You know it worked | Settles | Final | Comes back as |
| --- | --- | --- | --- | --- | --- |
| **Card, online** | The merchant, with the cardholder's details | Seconds, at authorization | Next business day or two to the acquirer, then funded on a schedule | After the dispute window, typically 120 days, longer for goods paid in advance | A chargeback, contested with evidence |
| **Card, in person** | The merchant, at a terminal | Seconds, unless the terminal was offline | Same as online | Same as online; an offline payment can still be declined when it's forwarded | A chargeback |
| **Wallet** (Apple Pay, Google Pay) | The merchant, with a network token | Seconds | Same as a card | Same as a card | A chargeback |
| **ACH debit** | The originator, under the payer's authorization | Only when no return arrives, 2 banking days for most reasons | Same day or next banking day | 60 calendar days for a consumer's unauthorized claim, 2 banking days for a business | A return with a reason code, not contested inside the network |
| **ACH credit** | The payer, pushing | When it settles | Same day or next banking day | On settlement for the payee, though the originator can reverse an erroneous one within five banking days | A reversal by the originator; a credit you send can come back as a return (closed or invalid account) |
| **RTP, FedNow, wire** | The payer, pushing | Seconds (RTP, FedNow) or hours (wire) | Immediately | Immediately | Nothing; a mistake needs a new transfer back |
| **Check** | The payer writes it; the payee deposits it | Only when the paying bank's return window passes, about two business days after presentment | Through image clearing, days | Ordinary returns within days, warranty and forgery claims long after | A return, then possibly a claim |
| **Retail cash** | The payer, at a store counter | Seconds, at the network's confirmation | Days later, net of fees | At confirmation | Nothing; refunds go by another rail |
| **Canadian pre-authorized debit** ([Payments in Canada](/books/payments/canada#pre-authorized-debits-rule-h1)) | The payee, under a PAD agreement | When no dishonour arrives by the next business day | Next business day | 90 calendar days for a personal debit's claim | A dishonour or a reimbursement claim |
| **[SEPA](/books/payments/eu-and-uk#sepa-direct-debit) or [Bacs](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps) Direct Debit** | The payee, under a mandate | Days later | Days | Eight weeks for SEPA's no-questions refund, 13 months if there was no valid mandate; Bacs refunds under its guarantee | A scheme refund through the payer's bank |
| **Instant push abroad** ([SEPA Instant](/books/payments/eu-and-uk#sepa-credit-transfer-and-sepa-instant), [Faster Payments](/books/payments/eu-and-uk#uk-faster-payments-bacs-and-chaps), Pix, UPI) | The payer, from their bank | Seconds | Immediately | Immediately, except fraud reimbursement schemes like the UK's for scams and Pix's MED | A new transfer, or a fraud claim outside the payment |
| **Buy now, pay later** | The merchant, via the lender | When the lender approves | Paid out by the lender | The lender's terms | The lender's dispute process |
| **Push to card** (a payout, [Vendor Payouts](/books/payments/vendor-payouts#push-to-card)) | The platform, pushing to a debit card | Seconds to 30 minutes | Immediately, if the card's issuer is in Visa's Fast Funds program | Immediately; reversible only for processing errors | Nothing, in practice |

Two columns matter more than the rest. **"You know it worked"** is when to tell the customer the payment went through. **"Final"** is when it's safe to release value you can't take back: ship the goods, pay out the merchant, credit the wallet. Most losses on a payments platform happen in the gap between those two moments, caused by a system that treated the first as the second. [Payment States & Ledgers](/docs/payments/payment-states#settled-is-not-final) turns the gap into states, and [Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves) into holds.

## How Refunds Differ

| Rail | A refund is |
| --- | --- |
| Card and wallet | A credit sent back through the network to the same card, which can fail if the card is closed |
| ACH, PAD, SEPA, Bacs | A new credit to the account that was debited |
| RTP, FedNow, wire, instant push | A new push payment from you |
| Check, cash, voucher | A payout by another rail, to details you collect |
| Buy now, pay later | A request to the lender, which adjusts the customer's plan |

Every refund is its own object with its own failure states, never an edit to the payment ([Designing the Payments API](/books/payments/payments-api#modifications-are-requests)).

## Where the Money Actually Goes

The tables describe timing. The money also physically crosses bank accounts, and for a provider those accounts are where the legal and treasury questions live:

![Funds flow for a payment provider: a card payment moves from the cardholder's issuer through the card network's settlement to the acquirer or sponsor bank, then into the provider's settlement (FBO) account held for merchants; an ACH debit moves from the payer's bank through the ACH operator to the provider's ODFI, the same sponsor bank, into the same account; from the FBO account, payouts go by ACH or instant rails to each merchant's bank account, and the provider's fees are swept to its operating account.](/diagrams/funds-flow.svg "Card and bank payments arrive by different roads into the same account held for merchants. Payouts leave it to merchants; only the provider's earned fees leave it for the provider.")

- **Card money** settles from issuers to the network, then to the acquirer, which for most providers is a **sponsor bank**: the network member that lets a non-bank participate. From there it lands in an account the provider controls but doesn't own.
- **Bank money** arrives through the provider's ODFI, usually the same bank, into the same account.
- **That account is held for the merchants,** a for-benefit-of (FBO) account whose owners only the provider's ledger can name, with the commingling rule and pass-through insurance in [FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance).
- **Payouts leave it** by ACH, instant rails or push to card, to each merchant's bank ([Payouts & Settlement](/books/payments/payouts-and-settlement)).

Proving every day that the account holds exactly what the ledger says it owes is [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation#three-sources-of-truth). Whether the provider ever holds that money in its own name is the question [money transmission](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) law turns on, which is why this picture is drawn with counsel before the ledger is designed.

## What This Means for the System You Build

- **One payment model, per-rail state machines,** with "you know it worked" and "final" as separate states for every rail.
- **Holds keyed to the rail's finality,** not to the merchant alone.
- **Refunds per rail,** each its own object, with a fallback when the original rail can't take the money back.
- **A funds-flow diagram, reviewed with counsel,** that says which bank account every rail's money crosses and who owns it at each step.

## References

**Reference**

- [Nacha: ACH Network Risk and Enforcement Topics](https://www.nacha.org/rules/ach-network-risk-and-enforcement-topics), return windows that decide when an ACH debit is final
- [Payments Canada: Rule H1, Pre-Authorized Debits](https://www.payments.ca/sites/default/files/h1eng.pdf), the 90-day reimbursement window for personal debits
- [Deutsche Bundesbank: SEPA Direct Debit](https://www.bundesbank.de/en/tasks/payment-systems/services/sepa/content/sepa-direct-debit-626654), the eight-week and 13-month refund rights
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), the 120-day dispute window and Fast Funds
- [12 CFR 229.31](https://www.law.cornell.edu/cfr/text/12/229.31), when a returned check must reach the depositary bank
- [Lewis Silkin: PSR confirms maximum reimbursement level for APP fraud](https://www.lewissilkin.com/insights/2024/09/27/updated-psr-confirms-maximum-reimbursement-level-for-app-fraud-102jii9), the UK's mandatory reimbursement of authorised push payment scam victims, from October 7, 2024
