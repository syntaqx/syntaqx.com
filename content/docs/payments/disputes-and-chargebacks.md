+++
title = "Disputes & Chargebacks"
description = "How a dispute moves from inquiry to arbitration, what it does to the ledger, the monitoring thresholds that end merchant accounts, and who pays on a platform."
category = "Payments"
order = 809
tags = ["payments", "disputes", "chargebacks", "risk"]
+++

The fraud that [risk checks](/docs/payments/fraud-and-risk) miss comes back as a dispute, and so do unrecognized charges, missing deliveries and unhappy customers. A dispute is the cardholder asking their bank to take money back, and the bank doing it before anyone has proven anything. The funds leave the merchant's balance the day the dispute opens, a fee is charged on top, and the merchant then has a short, fixed window to argue for the money back. Everything about how you handle disputes follows from that asymmetry: the money moves first, the argument comes later, and missing a deadline loses by default.

## The Lifecycle

Networks name the stages differently, but the shape is the same:

![Dispute lifecycle: an inquiry, used by only some networks, escalates to a dispute if unanswered, and answering it makes many go away. The dispute debits the amount and a fee at once. The merchant's response with evidence within 7 to 21 days is accepted (won) or rejected (lost); no response by the deadline loses by default. If the response is rejected, either side can escalate to pre-arbitration and then arbitration, where the network rules and the loser pays its fee.](/diagrams/dispute-lifecycle.svg "The money moves first; the argument comes later. A dispute debits the merchant at once, a response with evidence is the only way back, and missing the deadline loses by default.")

| Stage | What happens | Who decides |
| ----- | ------------ | ----------- |
| **Inquiry** (retrieval, request for information) | The issuer asks for transaction details before filing. Mostly American Express and Discover; Visa and Mastercard no longer use it. | Nobody yet. Answer it and many go away. |
| **Dispute** (chargeback) | The issuer files. The disputed amount and a fee are debited from the merchant immediately. | The issuer, provisionally |
| **Response** (representment, second presentment) | The merchant submits evidence, usually within **7 to 21 days** depending on the network. | The issuer reviews it, typically over **60 to 75 days** |
| **Pre-arbitration and arbitration** | If the issuer rejects the evidence, either side can escalate, and the network itself rules. | The card network |

Cardholders generally have **120 days** from the payment to file, and longer for things paid for in advance: for a ticket or a booking, the clock starts at the event, not the purchase. A dispute can therefore arrive months after the money looked settled, which is why disputes are never a state on the payment (see below).

An unanswered inquiry is the most expensive mistake in this table: it's free to resolve with evidence or a refund, and ignoring it can escalate to a chargeback the issuer treats as accepted. Route inquiries to the same queue, with the same urgency, as disputes. Arbitration is rarely worth it: the loser pays the network's fee, which runs to hundreds of dollars, so it only makes sense for large amounts with unambiguous evidence.

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
| Dispute opened | Disputed amount moves from the merchant's balance to a `disputes_held` account. The fee moves to `dispute_fees`. |
| Won | The held amount returns to the merchant's balance. The fee usually stays charged. |
| Lost | The held amount moves to the issuer, permanently. |
| Accepted without contest | Same as lost, without the response fee. |

Modeling the hold as a transfer to a holding account, instead of marking the payment, keeps the merchant's balance explainable at every point in a two-month process. It also handles what breaks simpler models: the disputed amount can differ from the charge (currency conversion, a partial dispute, three subscription charges bundled into one), and a payment can occasionally receive a second dispute under a different reason code. Each dispute posts its own amounts.

Post each fee as its own entry too. Stripe, for example, charges one fee when a dispute is received that isn't returned on a win, and a separate countering fee that is; explicit entries are what answer "why is this merchant down a fee on a dispute they won".

Once a dispute is open, the payment can't be refunded through the normal path. A refund issued anyway would pay the customer twice: once from the dispute, once from the refund. Enforce this in the refund state machine, not in the UI.

## Monitoring Programs: The Threshold That Ends Accounts

Networks watch every merchant's fraud and dispute rates, and exceeding the thresholds brings fines, mandatory remediation and eventually the loss of card acceptance. For a platform it's existential: one merchant over the line affects the acquirer relationship every other merchant depends on.

Visa's program, VAMP, combines fraud reports and disputes into one count-based ratio on card-not-present transactions:

```text
VAMP ratio = (fraud reports (TC40) + disputes (TC15)) / settled transactions (TC05)
```

| | Threshold |
| --- | --------- |
| Excessive merchant (Asia Pacific, Canada, Europe, US) | 150 basis points (1.5%) from 1 April 2026, down from 220 |
| Excessive merchant (Latin America) | 150 basis points |
| Excessive merchant (CEMEA) | 220 basis points |
| Minimum volume | 1,500 fraud reports and disputes in the month |

Two details make it harder than it looks. Fraud reports count even when no dispute follows, so a [card-testing attack](/docs/payments/fraud-and-risk) can push a merchant over without a single chargeback. And the ratio counts disputes, not losses: winning doesn't remove one from the numerator. Track each merchant's rate daily, alerting at half the threshold; by the time a monthly report shows an excessive ratio, it's too late to change the month.

## Prevention Beats Winning

Every dispute costs a fee, staff time and ratio, win or lose; the cheapest one is never filed.

- **Clear statement descriptors.** "Friendly fraud" is often a customer who doesn't recognize the charge: `SQ *JOES BKRY 4421` gets disputed; the name the customer knows doesn't.
- **Refund before they dispute.** A refund costs the amount; a dispute costs the amount, a fee and ratio. Refunding a complaint, or a small payment with an early fraud warning, is usually cheaper than winning.
- **Authenticate high-risk payments.** The [3-D Secure liability shift](/docs/payments/strong-customer-authentication) takes the most common dispute reason off the merchant.
- **Make cancellation easy.** Subscriptions with a hidden cancel button turn into disputes. A visible cancel flow is cheaper than the disputes it prevents.

## On a Platform: Who Pays

On a platform, a lost dispute has to land on someone's balance, and the platform decides whose before the first one arrives:

- **The merchant bears the loss,** debited from their balance: the default and the fair one, since the merchant made the sale and holds the evidence.
- **The platform is the backstop** when the merchant's balance can't cover it. With Stripe Connect, an explicit setting per connected account decides whether the platform or Stripe covers negative balances.
- **Reserves bridge the gap,** so a dispute can be paid from the merchant's own held money after they stop processing ([Payouts & Settlement](/docs/payments/payouts-and-settlement)).

The failure to design for: a merchant takes a large volume of payments, is paid out and disappears, and the disputes arrive over the following 120 days. Reserves sized to risk, payout delays for new merchants and [onboarding that knows who they are](/docs/payments/merchant-onboarding) are what stop that from being the platform's loss.

Every dispute event reaches merchants through [webhooks](/docs/payments/webhooks) (`dispute.created`, `dispute.closed`), with the evidence deadline in the payload, because the deadline is the one thing they can't miss.

## References

**Reference**

- [Visa: Visa Acquirer Monitoring Program fact sheet](https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf), the VAMP ratio, regional thresholds and the April 2026 reduction
- [Mastercard Developers: Dispute resolution cycle](https://developer.mastercard.com/mastercom/documentation/dispute-resolution-cycle/), chargeback, second presentment and case filing

**In practice**

- [Stripe: How disputes work](https://docs.stripe.com/disputes/how-disputes-work), inquiries, response and decision windows, fees and disputed amounts
- [Stripe: Understanding Connect account balances](https://docs.stripe.com/connect/account-balances), who covers negative balances on a platform, and reserves
