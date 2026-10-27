+++
title = "Disputes & Chargebacks"
description = "How a dispute moves from inquiry to arbitration, what it does to the ledger, the monitoring thresholds that end merchant accounts, and who pays on a platform."
category = "Payments Industry"
order = 1423
part = "Taking Payments"
aliases = ["payments/disputes-and-chargebacks"]
tags = ["payments", "disputes", "chargebacks", "risk"]
+++

The fraud that [risk checks](/books/payments/fraud-and-risk) miss comes back as a dispute, and so do unrecognized charges, missing deliveries and unhappy customers. A dispute is the cardholder asking their bank to take money back, and the bank doing it before anyone has proven anything. The funds leave the merchant's balance the day the dispute opens, a fee is charged on top, and the merchant then has a short, fixed window to argue for the money back. Everything about how you handle disputes follows from that asymmetry: the money moves first, the argument comes later, and missing a deadline loses by default. This is the card process; a bank debit comes back as an [unauthorized return](/books/payments/ach#returns-when-money-is-really-yours), a check as a [warranty claim](/books/payments/checks#returns-fast-and-slow), and a SEPA or Bacs debit under its [scheme's refund rights](/books/payments/wallets-and-local-methods).

## The Lifecycle

Networks name the stages differently, but the shape is the same:

![Dispute lifecycle: an inquiry, used by only some networks, escalates to a dispute if unanswered, and answering it makes many go away. The dispute debits the amount and a fee at once. The merchant's response with evidence within 7 to 21 days is accepted (won) or rejected (lost); no response by the deadline loses by default. If the response is rejected, either side can escalate to pre-arbitration and then arbitration, where the network rules and the loser pays its fee.](/diagrams/dispute-lifecycle.svg "The money moves first; the argument comes later. A dispute debits the merchant at once, a response with evidence is the only way back, and missing the deadline loses by default.")

| Stage | What happens | Who decides |
| ----- | ------------ | ----------- |
| **Inquiry** (retrieval, request for information) | The issuer asks for transaction details before filing. American Express and Discover use them most; Visa retired its retrieval requests in the US in October 2020 in favor of issuer-to-merchant collaboration, and Mastercard's published dispute cycle now goes from collaboration straight to the first chargeback. Providers still model the stage, as Braintree's retrieval kind of dispute does. | Nobody yet. Answer it and many go away. |
| **Dispute** (chargeback) | The issuer files. The disputed amount and a fee are debited from the merchant immediately. | The issuer, provisionally |
| **Response** (representment, second presentment) | The merchant submits evidence. Visa's rules give the acquirer 30 days, and Mastercard's windows are similar; providers give merchants less, usually **7 to 21 days**, to leave room for their own review. | The issuer reviews it, typically over **60 to 75 days** |
| **Pre-arbitration and arbitration** | If the issuer rejects the evidence, either side can escalate, and the network itself rules. | The card network |

Cardholders generally have **120 days** from the payment to file, and longer for things paid for in advance: for a ticket or a booking, the clock starts at the event, not the purchase. A dispute can therefore arrive months after the money looked settled, which is why disputes are never a state on the payment (see below). The issuer's side of the same dispute, with its Regulation E and Z clocks, is in [Cardholder Disputes](/books/payments/issuer-processing#cardholder-disputes).

![A timeline of the longest Visa consumer dispute: a 120-day filing window from the purchase, then 30 days for the acquirer's response, 30 for the issuer's pre-arbitration attempt, 30 for the acquirer's pre-arbitration response and 10 to file for arbitration, 220 days in all; a provider's evidence deadline of 7 to 21 days sits inside the first 30.](/diagrams/pm-disputes-deadlines.svg "From purchase to the last arbitration filing can take 220 days. Each step's clock starts when the one before it is processed, and the merchant's own deadline sits well inside the acquirer's.")

Each later step after the response has its own clock too. On Visa's processing-error and consumer disputes, the issuer has 30 days from the response to make a pre-arbitration attempt, the acquirer 30 days to answer it, and then there are 10 days to file for arbitration.

An unanswered inquiry is the most expensive mistake in this table: it's free to resolve with evidence or a refund, and ignoring it can escalate to a chargeback the issuer treats as accepted. Route inquiries to the same queue, with the same urgency, as disputes. Arbitration is rarely worth it: the loser pays the network's arbitration fee on top of the dispute, so it only makes sense for large amounts with unambiguous evidence. Not every provider offers it at all: Stripe's docs state that it doesn't support the arbitration phase.

### The Dispute Object

A provider exposes each dispute as an object with its own states, and the states follow the network process: an early warning or inquiry that needs a response, then a dispute that **needs a response**, **under review** once evidence is submitted, and finally **won**, **lost**, or **prevented** if a pre-dispute service resolved it. Stripe's API is a good model, with separate states for inquiries ("warnings") and an evidence block that says when it's due, whether any has been submitted, and whether the deadline passed. Braintree models the stage as a field instead: a dispute's `kind` is retrieval, chargeback or pre-arbitration, its status runs from open through disputed to won or lost (or accepted, auto-accepted or expired), and `reply_by_date` carries the merchant's deadline. Either shape works; what matters is that the stage, the status and the deadline are all explicit.

Two deadlines matter, and they're different: the network's deadline for the acquirer, and the provider's earlier deadline for the merchant. The merchant sees only the second, in the event that announces the dispute ([Designing the Payments API](/books/payments/payments-api#events)). Evidence is uploaded through the API as files and fields, so platforms can collect it inside their own products.

## Reason Codes Decide the Evidence

Every dispute carries a reason code, and the code decides what evidence can win. Networks group them into a few families:

| Family | Example claim | Evidence that answers it |
| ------ | ------------- | ------------------------ |
| Fraud | "I didn't make this purchase" | 3-D Secure authentication, matching device and IP history, prior undisputed purchases by the same customer |
| Authorization | "This was charged without a valid authorization" | The authorization record and its approval |
| Processing error | "Charged twice" or "wrong amount" | Records showing distinct transactions, or the correct amount |
| Consumer dispute | "Never arrived" or "not as described" | Delivery confirmation with signature, the product description, the refund policy the customer accepted |

The consequence for system design: evidence is captured at payment time, not reconstructed when a dispute lands. Delivery tracking, IP and device, the 3-D Secure result, the terms accepted at checkout: if they weren't stored with the payment, they don't exist two months later. And three documents that answer the specific claim beat a pile of everything you have.

## Disputes in the Ledger

A dispute is its own object with its own state machine, referencing the payment (see [Payment States & Ledgers](/docs/payments/payment-states)). The payment stays `settled`; what changes is money, and every movement is a ledger transaction:

| Event | Ledger transaction |
| ----- | ------------------ |
| Dispute opened | Disputed amount moves from the merchant's balance to a `disputes_held` account. The dispute fee is debited from the merchant's balance to `platform_revenue`, and the network's fee to you posts to `processing_costs` ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts)). |
| Won | The held amount returns to the merchant's balance. The fee usually stays charged. |
| Lost | The held amount leaves for good, through the acquirer's settlement (`acquirer_settlement_clearing`), because the issuer kept it. |
| Accepted without contest | Same as lost, without the countering fee. |

Modeling the hold as a transfer to a holding account, instead of marking the payment, keeps the merchant's balance explainable at every point in a two-month process. It also handles what breaks simpler models: the disputed amount can differ from the charge (currency conversion, a partial dispute, three subscription charges bundled into one), and a payment can occasionally receive a second dispute under a different reason code. Each dispute posts its own amounts. On a cross-currency payment, the amount debited for a dispute can differ from what the merchant received for the sale, because it's converted at a different time; post the difference as an FX gain or loss, as [Multi-Currency](/docs/payments/multi-currency#refunds-and-fx-gains-and-losses) does for refunds; who carries it under the network rules is in [FX Risk on Refunds and Disputes](/books/payments/cross-border-and-fx#fx-risk-on-refunds-and-disputes).

Post each fee as its own entry too, with its own timing. Stripe, for example, debits a fee when a dispute is received that isn't returned on a win, and charges a separate countering fee that is. Payabli debits the disputed amount immediately but collects the chargeback fee in the merchant's end-of-month billing, and charges retrieval requests a fee of their own though they move no funds. Explicit entries are what answer "why is this merchant down a fee on a dispute they won", and a fee that posts weeks after the debit is one more reason the dispute, not the statement, should be the source of both.

Once a dispute is open, the payment can't be refunded through the normal path. A refund issued anyway would pay the customer twice: once from the dispute, once from the refund. Enforce this in the refund state machine, not in the UI.

## Monitoring Programs: The Threshold That Ends Accounts

Networks watch every merchant's fraud and dispute rates, and exceeding the thresholds brings fines, mandatory remediation and eventually the loss of card acceptance. For a platform it's existential: one merchant over the line affects the acquirer relationship every other merchant depends on.

Visa's program, VAMP, combines fraud reports and disputes into one count-based ratio on card-not-present transactions. The figures below are current as of October 2026; the April 2026 reduction was the last announced change:

```text
VAMP ratio = (fraud reports (TC40, in Visa's transaction codes) + disputes (TC15)) / settled transactions (TC05)
```

| | Threshold |
| --- | --------- |
| Excessive merchant (Asia Pacific, Canada, Europe, US) | 150 basis points (1.5%) from April 1, 2026, down from 220 |
| Excessive merchant (Latin America) | 150 basis points |
| Excessive merchant (CEMEA) | 220 basis points |
| Minimum volume | 1,500 fraud reports and disputes in the month |

VAMP is harder to stay under than it looks. Fraud reports (the early fraud warnings of [Fraud & Risk](/books/payments/fraud-and-risk#the-two-costs)) count even when no dispute follows, so a [card-testing attack](/books/payments/fraud-and-risk#card-testing) can push a merchant over without a single chargeback. And the ratio counts disputes, not losses: winning doesn't remove one from the numerator.

Mastercard runs its own programs by merchant, and as of June 2026 acquirers summarized them this way (Mastercard's rule text isn't public):

| Program | A merchant qualifies when, in a month |
| ------- | ------------------------------------- |
| Excessive Chargeback Merchant | 100 to 299 chargebacks and a ratio of 150 to 299 basis points |
| High Excessive Chargeback Merchant | 300 or more chargebacks and 300 or more basis points |
| Excessive Fraud Merchant | E-commerce fraud chargebacks of at least $50,000 and 50 basis points, at least 1,000 e-commerce transactions, and 3-D Secure on under 10% of them (50% in countries that mandate SCA) |

Two details differ from Visa: Mastercard's chargeback ratio divides this month's chargebacks by the **previous** month's transactions, so a month of falling sales raises it, and assessments start in the second month and grow the longer a merchant stays in, until three consecutive months below the thresholds release it.

Track each merchant's rate daily, alerting at half the threshold; by the time a monthly report shows an excessive ratio, it's too late to change the month. Reproducing each network's arithmetic (its clock, its exclusions, count rather than value) is in [Payments Metrics](/books/payments/payments-metrics#fraud), with the chargeback and refund rates in [Disputes and Refunds](/books/payments/payments-metrics#disputes-and-refunds).

## Prevention Beats Winning

Every dispute costs a fee, staff time and ratio, win or lose; the cheapest one is never filed.

- **Clear statement descriptors.** "Friendly fraud" is often a customer who doesn't recognize the charge: `SQ *JOES BKRY 4421` gets disputed; the name the customer knows doesn't.
- **Refund before they dispute.** A refund costs the amount; a dispute costs the amount, a fee and ratio. Refunding a complaint, or a small payment with an early fraud warning, is usually cheaper than winning.
- **Authenticate high-risk payments.** The [3-D Secure liability shift](/books/payments/strong-customer-authentication) takes the most common dispute reason off the merchant.
- **Answer the issuer before the dispute exists.** The networks now run services that put the merchant in front of the issuer while the cardholder is still asking questions:
  - **Visa Order Insight** (through Verifi, Visa's dispute-services subsidiary) sends purchase details to the issuer's app or call center, so a cardholder who doesn't recognize a charge sees what it was.
  - **Compelling Evidence 3.0** answers a card-not-present fraud claim with history: if the same card paid at least twice before, undisputed, between 120 and 365 days earlier, and the device or IP address matches plus one more element (login ID, delivery address), the liability moves to the issuer. Supplied through Order Insight before a dispute is filed, it blocks the dispute and keeps it out of the merchant's ratio. Since October 24, 2026, the earlier purchases can come from more than one merchant, not only the one disputed.
  - **Rapid Dispute Resolution** lets the merchant pre-approve rules (say, refund anything under $25) so the issuer resolves those disputes as refunds before they become chargebacks, and they don't count toward the ratio.
  - **Mastercard's Ethoca** sends alerts when an issuer confirms fraud or receives a dispute, so the merchant can stop fulfillment and refund first; **Consumer Clarity** and **First-Party Trust** play the roles of Order Insight and Compelling Evidence on Mastercard.

  Each is an integration a platform can offer all its merchants at once, and each needs order data (descriptions, delivery addresses, device and IP data, login IDs) captured at payment time.
- **Make cancellation easy.** Subscriptions with a hidden cancel button turn into disputes. A visible cancel flow is cheaper than the disputes it prevents.

## On a Platform: Who Pays

On a platform, a lost dispute has to land on someone's balance, and the platform decides whose before the first one arrives:

- **The merchant bears the loss,** debited from their balance: the default and the fair one, since the merchant made the sale and holds the evidence. When the balance can't cover it, the recovery order in [Payouts & Settlement](/books/payments/payouts-and-settlement#negative-balances) applies, and with Stripe Connect a per-account setting decides whether the platform or Stripe is the backstop. Payabli debits a chargeback from the merchant's funding immediately, nets it into the merchant's next transfer, and debits the merchant's bank account when the net is negative.
- **Reserves bridge the gap,** so a dispute can be paid from the merchant's own held money after they stop processing ([Payouts & Settlement](/books/payments/payouts-and-settlement)).

The failure to design for: a merchant takes a large volume of payments, is paid out and disappears, and the disputes arrive over the following 120 days, or longer for services paid in advance. Reserves sized to risk, payout delays for new merchants and [onboarding that knows who they are](/books/payments/merchant-onboarding) are what stop that from being the platform's loss.

Every dispute event reaches merchants through [webhooks](/docs/api-design/webhooks) (`dispute.created`, `dispute.closed`), with the evidence deadline in the payload, because the deadline is the one thing they can't miss.

## How to Build It

Disputes add evidence, the deadlines that run the process, their fees, and the daily ratios that warn of a monitoring program, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
ALTER TABLE disputes
  ADD COLUMN stage                TEXT NOT NULL,  -- inquiry, chargeback, pre_arbitration, arbitration
  ADD COLUMN network_due_by       TIMESTAMPTZ,    -- the acquirer's deadline
  ADD COLUMN fraud_report_id      TEXT,           -- the TC40 or SAFE record, when known
  ADD COLUMN outcome              TEXT,           -- won, lost, accepted, prevented
  ADD COLUMN closed_at            TIMESTAMPTZ;

CREATE TABLE dispute_evidence (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  dispute_id    UUID NOT NULL REFERENCES disputes (id),
  kind          TEXT NOT NULL,     -- delivery_proof, three_ds_result, terms_accepted, prior_transactions
  file_ref      TEXT,              -- the stored document, never re-generated
  submitted_at  TIMESTAMPTZ,
  submitted_by  TEXT NOT NULL
);

CREATE TABLE dispute_stage_changes (
  dispute_id  UUID NOT NULL REFERENCES disputes (id),
  stage       TEXT NOT NULL,
  status      TEXT NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (dispute_id, changed_at)
);

CREATE TABLE merchant_monitoring_ratios (
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  network          TEXT NOT NULL,   -- visa, mastercard
  program          TEXT NOT NULL,   -- vamp, ecm, efm
  day              DATE NOT NULL,
  numerator        INT NOT NULL,    -- fraud reports plus disputes, or chargebacks
  denominator      INT NOT NULL,    -- settled CNP transactions, or last month's
  PRIMARY KEY (merchant_id, network, program, day)
);
```

The fee and the held amount are ledger transactions with the dispute as their source, never columns on `disputes`. Compute `merchant_monitoring_ratios` nightly from the same disputes and fraud labels the risk system uses, and alert from it.

## Auditing

Dispute records are evidence in the dispute itself, in pre-arbitration and arbitration, in the merchant's argument with the platform over who pays, and in a network's review of a merchant in a monitoring program. The general design is in [Audit Trails](/docs/architecture/audit-trails); for disputes, make sure the record shows:

- **Exactly what was submitted and when,** each file and field as sent, since the network judges the evidence it received, not what you hold now ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Both deadlines and who met or missed them,** the merchant's and the network's, with the stage change that started each clock.
- **Who decided to accept, contest or escalate,** a person, the merchant or an automated rule such as a Rapid Dispute Resolution threshold.
- **Every ledger movement the dispute caused,** linked to the dispute as its source, so the merchant's balance can be explained line by line.
- **Who viewed or exported the customer's data** while assembling evidence ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Evidence captured at payment time,** organized by what each reason code asks for.
- **A dispute as its own object,** with holding-account ledger entries and its fee as a separate entry.
- **Refunds blocked while a dispute is open,** enforced by the state machine.
- **Every merchant's dispute and fraud ratios tracked daily,** per network and program, alerting at half the threshold.
- **Submitted evidence and stage history kept as sent,** for arbitration and for the merchant.
- **Clear statement descriptors,** and refunds offered before customers reach for a dispute.
- **The loss policy decided before the first dispute,** and the response deadline in the webhook.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), the dispute time limits including the 120-day window, Compelling Evidence 3.0 conditions (11.7.5.6), including prior transactions "at one or more Merchants" for disputes processed on or after 24 October 2026 (11.7.5.3, 11.7.5.6), Rapid Dispute Resolution, and dispute response and pre-arbitration time limits (Tables 11-1 and 11-2); 18 April 2026 edition

**Reference**

- [Visa: Visa Acquirer Monitoring Program fact sheet](https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf), the VAMP ratio, regional thresholds and the April 2026 reduction
- [Mastercard Developers: Dispute resolution cycle](https://developer.mastercard.com/mastercom/documentation/dispute-resolution-cycle/), collaboration, chargeback, second presentment and case filing
- [Visa: Evolution of Compelling Evidence FAQ](https://usa.visa.com/content/dam/VCOM/regional/na/us/support-legal/documents/evolution-of-compelling-evidence-external-faqs.pdf), Compelling Evidence 3.0 qualification and Order Insight
- [Visa: Sunset of retrieval requests](https://usa.visa.com/content/dam/VCOM/regional/na/us/support-legal/documents/sunset-of-retrieval-requests-and-impact-on-healthcare-auto-substantiation-transaction-receipt-requests.pdf), the end of US retrieval requests in October 2020- [TabaPay: The next phase of Visa's VAMP initiative](https://developers.tabapay.com/docs/the-next-phase-of-visas-vamp-initiative), the October 2025 start of enforcement and the April 1, 2026 drop to 150 basis points

**In practice**

- [Stripe: How disputes work](https://docs.stripe.com/disputes/how-disputes-work), inquiries and the networks that use them, the 120-day filing window, response and decision windows, received and countered fees, disputed amounts, and no arbitration phase
- [Stripe: Understanding Connect account balances](https://docs.stripe.com/connect/account-balances), who covers negative balances on a platform, and reserves
- [Verifi: Rapid Dispute Resolution](https://www.verifi.com/rdr-is-here.html), merchant-defined rules that resolve disputes before they're chargebacks
- [Mastercard Developers: Ethoca Consumer Clarity](https://developer.mastercard.com/ethoca-consumer-clarity-for-merchants/documentation), purchase details and First-Party Trust over the merchant transaction API
- [Stripe: The Dispute object](https://docs.stripe.com/api/disputes/object), dispute statuses and evidence deadlines
- [Braintree: Dispute response object](https://developer.paypal.com/braintree/docs/reference/response/dispute), dispute kinds (retrieval, chargeback, pre-arbitration), statuses and `reply_by_date`
- [Payabli: Disputes, chargebacks and returns](https://docs.payabli.com/guides/pay-ops-disputes-chargebacks-returns-overview), retrieval requests that move no funds, the immediate chargeback debit and the fee at end-of-month billing
- [Payabli: How money moves](https://docs.payabli.com/guides/platform-how-money-moves-overview), transfers netting chargebacks and fees, and a negative net debited from the merchant
- [BlueSnap: Dispute and fraud monitoring programs](https://support.bluesnap.com/docs/chargeback-monitoring-programs), Mastercard's ECM, HECM and EFM criteria, the previous-month denominator and release after three months, as a provider summarized them in June 2026
