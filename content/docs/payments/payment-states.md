+++
title = "Payment States & Ledgers"
description = "Explicit state machines for financial objects, append-only records, and a double-entry ledger, so every balance can be explained and nothing is ever edited."
category = "Payments"
order = 803
tags = ["payments", "state-machines", "ledger", "database"]
aliases = ["payment-states"]
+++

With amounts represented exactly and every write [idempotent](/docs/payments/idempotency), the next question is what a payment *is* over its life. This chapter uses card vocabulary (issuer, authorization, capture, clearing, settlement); if it's new, [How Card Payments Work](/docs/industries/payments/card-payments) introduces it and the [Payments Glossary](/docs/industries/payments/glossary) defines it. Financial data has two rules: every change of state is explicit, and nothing that happened is ever rewritten. Mistakes are corrected with new entries, as accountants have done for centuries, and for the same reason: the most important question about money is never "what is the balance?", it's "why is that the balance?", and only an intact history can answer it.

## Explicit State Machines

Every financial object has a `status` with a closed set of values and a documented set of allowed transitions. Anything not on the list is rejected.

### Example: Payment

![Payment state machine: pending moves to authorized when approved, to requires_action for a 3-D Secure challenge and back to pending when completed, or to failed when declined; requires_action fails when abandoned or expired; authorized moves to captured or to voided when cancelled or expired; captured moves to settled in the settlement batch. failed, voided and settled are terminal.](/diagrams/payment-states.svg "Every payment is in exactly one state, and only these moves exist. Teal is the path a payment should take; the dashed exits end it, and failed, voided and settled never change again. The in-flight states below sit on each arrow that calls a processor.")

| From | To | Trigger |
| ---- | -- | ------- |
| `pending` | `authorized` | Issuer approves the authorization |
| `pending` | `failed` | Issuer declines, or the processor confirms it never processed the request |
| `pending` | `requires_action` | Issuer asks the customer to authenticate ([3-D Secure](/docs/industries/payments/strong-customer-authentication)) |
| `requires_action` | `pending` | Customer completes the challenge; the payment resumes |
| `requires_action` | `failed` | Customer fails or abandons the challenge, or it expires |
| `authorized` | `captured` | Merchant captures (full or partial) |
| `authorized` | `voided` | Merchant cancels, or the authorization expires uncaptured |
| `captured` | `settled` | The processor's settlement report includes it and its funding is matched |

The alternative, a status column any code path can set to anything, fails quietly. A late webhook marks a voided payment as captured. A retry captures twice. A support tool "fixes" a failed payment by setting it to settled. Each is a single `UPDATE` that looked reasonable to whoever wrote it; a transition table makes them impossible instead of merely unlikely.

- **Terminal states are terminal.** `failed`, `voided` and `settled` never transition again. A refund after settlement isn't a state change on the payment; it's a new object (below). Bank debits and checks are the exception that proves the rule: their settlement can be undone by the network, so their state machines continue past `settled` ([below](#settled-is-not-final)).
- **Transitions are guarded in the database,** not only in code: `UPDATE payments SET status = 'captured' WHERE id = $1 AND status = 'authorized'`. Zero rows updated means someone else got there first, a concurrent void or a duplicate webhook, and the second actor stops instead of overwriting. Read-then-write in application code has a race window; the guarded update doesn't (see [Transactions & Concurrency](/docs/database/transactions-and-concurrency)).
- **Every transition is recorded** with when it happened, what triggered it and the processor's reference. When a customer disputes a charge six months later, "it's captured" isn't enough; you need the path it took.

### In-Flight States

A call to a processor can time out with the outcome unknown: the authorization may have happened, or not. If the only states are before and after, a retry can't tell which it is. So record the attempt before making it: `authorizing`, `capturing`, `voiding`, each with the idempotency key the request will carry ([Idempotency](/docs/payments/idempotency)). A worker that finds a payment stuck in `capturing` knows exactly what to do: ask the processor about that key, or retry with the same one, and move the payment to `captured` or back to `authorized` on the answer. Nothing is ever "probably captured", and a crash between the request and the response leaves a record that says so instead of a gap. The diagram above shows only where a payment rests; each arrow that calls a processor passes through one of these states on the way. (A void, in this vocabulary, is the merchant-facing name for an authorization reversal: it releases the issuer's hold.)

### Settled Is Not Final

For a card, settlement ends the payment's own state machine; a dispute months later is a separate object, below. For other methods, money that settled can still be taken back by the network itself, and the state machine has to say so:

| Method | Can come back | For how long |
| --- | --- | --- |
| Card | As a dispute, a separate object | Typically up to 120 days, longer for some reasons ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks)) |
| ACH debit | As a return, ending the payment | 2 banking days for most reasons, 60 calendar days for a consumer's unauthorized claim ([ACH & Bank Transfers](/docs/industries/payments/ach)) |
| Canadian pre-authorized debit | As a reimbursement claim | 90 calendar days for a personal debit ([Payments in Canada](/docs/industries/payments/canada)) |
| Check | As a return, then as warranty or forgery claims | Days for the return; claims long after ([Accepting Checks](/docs/industries/payments/checks)) |
| SEPA Direct Debit, Bacs Direct Debit | As a scheme refund through the payer's bank | Eight weeks for SEPA, 13 months without a valid mandate; Bacs under its guarantee ([Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods)) |
| Instant push, wire, retail cash | No, except fraud reimbursement schemes like the UK's for scams and Pix's MED, which run outside the payment | Final when confirmed |

So a bank debit runs `submitted`, `settled`, `available` once the administrative return window closes, and `final` when the last window does, with `returned` as a terminal branch from any state before `final`. A card payment collected while a terminal was offline is `collected_offline` until it's forwarded and authorized, because it may yet be declined ([Card-Present Payments](/docs/industries/payments/card-present)). What these states drive is when value is released: a payout, a shipped order, a cleared balance waits for the state that makes the risk acceptable, never for `settled` alone.

### Authorizations Expire

An authorization only holds funds for a limited time, set by the card networks and varying by brand and channel ([How Card Payments Work](/docs/industries/payments/card-payments) lists the windows).

Ignore this and an order that ships after the window, on day 11 for a Visa online authorization, tries to capture an authorization that no longer exists: the goods are gone and the customer was never charged. Store the deadline as `capture_before` when the authorization succeeds, alert before it passes, and have a scheduled job move anything past it to `voided`, so the state reflects reality instead of a hold that silently lapsed.

### Holds That Change Size

Not every authorization is for the final amount, and the network rules make each variation explicit:

- **Estimated and incremental authorizations.** When the final amount isn't known yet (a hotel stay, a rental, a tab), Visa lets any merchant send an **estimated** authorization, flagged as one and disclosed to the cardholder, and add **incremental** authorizations under the same transaction identifier when the estimate runs short. Increments don't extend the hold's validity window. Mastercard calls the estimate a **pre-authorization**, cleared within 30 days, against a **final** authorization, which must clear for exactly its amount within 7.
- **Partial capture.** Capture less than was authorized, and reverse the rest. Visa requires the unused difference to be reversed within 24 hours of completing the transaction, and an uncompleted one reversed in full within 24 hours of cancellation or the window closing; processors pass on fees for authorizations left hanging.
- **Multiple captures.** A split shipment captures one authorization in pieces. Visa allows it for card-absent merchants that disclose the possibility and notify the cardholder of each shipment, with a sequence number on each clearing, and for airlines and cruise lines; the last capture is marked final and releases whatever remains.
- **Capturing more than authorized.** Visa tolerates clearing above the authorized amount only within set limits: up to 20% for taxis, bars and beauty services (and, outside the US, restaurants), 15% for lodging, cruises and any other card-absent purchase the cardholder started, the greater of 15% or $75 for car rental, and, from February 21, 2026, up to 30% for US restaurants, where tips arrive after the authorization. After a partial approval, and for transactions inside the EEA, the amounts must match exactly. Everything else captures at or below the authorized amount, or authorizes again.

In the state machine, each of these is a recorded event on the payment (`authorization_incremented`, `partially_captured`, `remainder_released`) with the amounts it moved, and the payment's capturable amount is derived from them, never stored as a number someone updates.

### Refunds and Disputes Are Their Own Objects

A refund doesn't move a payment to `refunded`. It's a new `refund` object, with its own state machine (refunds can fail too), that references the payment. Disputes work the same way. The payment keeps derived totals:

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "settled",
  "amount": 5000,
  "amount_refunded": 1500,
  "currency": "USD"
}
```

Status-on-the-payment works for exactly one full refund. Real payments get two partial refunds, then a dispute, then a dispute reversal. Modeled as payment states, that becomes `partially_refunded_then_disputed`; modeled as objects, it's three rows that each have their own lifecycle, and the payment's totals are a sum.

### Words That Sound Alike

Half the confusion in payments is five words for money going back, each a different mechanism with a different owner:

| Term | What happens | Who starts it | Card or bank |
| --- | --- | --- | --- |
| **Void** (authorization reversal) | The hold is released before capture; no money moved | Merchant | Card |
| **Refund** | A new credit back to the payer after the money moved | Merchant | Both |
| **Reversal** (ACH) | The originator corrects its own erroneous entry, for a short list of reasons, within days | Merchant or originator | Bank ([ACH](/docs/industries/payments/ach#reversals)) |
| **Return** | The receiving bank sends an entry back, a debit it won't honor or a credit it can't post, with a reason code | Receiving bank (RDFI) | Bank |
| **Chargeback** (dispute) | The cardholder's bank takes the money back and the merchant may contest it | Cardholder, through the issuer | Card ([Disputes](/docs/industries/payments/disputes-and-chargebacks)) |

Each is its own object or entry in the ledger, and none is ever an edit to the original payment.

## Append-Only Records

Financial rows are inserted, never updated in place, and never deleted.

- **Corrections are reversals.** A wrong fee is fixed with an entry that reverses it and another with the right amount. The original stays, so the books show both the mistake and the fix, and anyone reconciling last month's report can still reproduce it.
- **Status history is a table,** not an overwritten column. The current `status` is a cached projection of the latest transition, convenient for queries, never the source of truth.
- **Moving a misapplied payment is a transfer.** A tenant's rent posted to the wrong unit, or a customer's payment to the wrong invoice, is corrected by moving the money between accounts in the ledger, with a reason, never by editing the payment's account. The payment keeps its original payer of record, because a return, dispute or refund still belongs to the instrument it came from.
- **Refunds go back where the money came from.** A card refund is a credit to the same card, which Visa's rules require "to the extent possible", falling back to another method only when that card is closed or declines the credit, and an ACH payment is refunded by a credit to the account it was debited from. Paying a refund to a different instrument is a payout, with a payout's checks and its fraud risk.
- **No hard deletes.** Retention is applied by archiving, with an audit trail. (Destroying a card number's encryption key in a [vault](/docs/industries/payments/card-vault#storing-the-number) isn't deleting a financial row: the payment and its ledger entries stay.) See [Data Retention & Deletion](/docs/architecture/data-retention) for how that coexists with privacy erasure.

The test: given any balance, you can list every row that produced it. If an `UPDATE` ever changed an amount, you can't.

## Double-Entry Ledger

Money movement is recorded as a **transaction** made of two or more **entries** that sum to zero, per currency. Money is never created or destroyed; it moves from one account to another.

| Entry | Account | Amount |
| ----- | ------- | ------ |
| 1 | `customer_receivable` | `-5000` |
| 2 | `merchant_balance` | `+4825` |
| 3 | `processing_costs` | `+110` |
| 4 | `platform_revenue` | `+65` |

Why not a single `balance` column per merchant? Because a single balance can be wrong silently. If a bug credits the merchant $48.25 but forgets the fee, a balance column just holds the wrong number; in a double-entry ledger the transaction doesn't sum to zero, and the database refuses it. Errors become imbalances you can detect instead of balances you have to trust.

- **Entries are written atomically,** and a constraint rejects any transaction that doesn't balance.
- **Account balances are the sum of their entries.** A cached balance is fine for reads, but it's derived, and it can always be rebuilt from the entries.
- **Postings are idempotent.** Each ledger transaction carries the ID of the event that caused it (a capture, a refund), with a unique constraint, so a retried event can't post twice. See [Idempotency](/docs/payments/idempotency).
- **Entries have a lifecycle too.** As Modern Treasury's ledgers model it, a transaction is **pending** when it's expected but not yet certain (a capture awaiting settlement, a payout sent but not confirmed) and **posted** when it's final enough to count, and a pending transaction that never happens is archived, not deleted. That split is where a merchant's pending and available balances come from: the posted balance is the starting point for the available balance, what can safely be paid out, which [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) defines.
- **Amounts follow [Money & Amounts](/docs/payments/money):** integer minor units, explicit currency. Signs live here and only here.

### A Chart of Accounts

Every chapter of the payments volume posts to the same accounts, and naming them once keeps reports from disagreeing:

| Account | Holds |
| --- | --- |
| `customer_receivable` | What payers owe, until a payment settles |
| `merchant_balance` | What the platform owes each merchant, split into pending and available |
| `reserves` | Merchant funds held back against future disputes and refunds |
| `disputes_held` | Amounts withdrawn by an open dispute |
| `dispute_fees`, `refund_fees` | Fees charged to merchants for those events |
| `processing_costs` | What processors and networks charge: interchange, network fees, processor markup |
| `platform_revenue` | What the platform keeps |
| `acquirer_settlement_clearing` | Money in flight between the processor's settlement and the bank account |
| `payouts_in_transit` | Payouts sent and not yet confirmed |
| `unapplied_cash` | Money received from a customer and not yet applied to a charge |

A real platform has more, one per bank account and per currency among them ([Treasury & Bank Operations](/docs/industries/payments/treasury)), but every entry lands in an account with a name like these, and every report sums the same ones.

### Payments Are Applied, Not Assigned

A payment records money that moved; an **application** records what that money paid for. Bill-paying businesses need the two apart, because they rarely match one to one: a tenant pays $1,600 against $1,500 rent and a $75 late fee, a customer pays two invoices with one check, a utility customer pays twice by mistake.

- **Applications allocate a payment across charges,** by a rule the business sets (oldest charge first, or fees before rent, or whatever the lease or law requires), and every application is a ledger entry against a receivable.
- **What's left over is unapplied cash,** money received but not yet matched, distinct from a credit balance the business granted; both are liabilities to the customer, shown as a credit on their account and applied to the next charge, or refunded on request. It never quietly disappears into revenue.
- **Underpayments leave charges partially paid,** each with its own remaining balance, so late fees and dunning act on what's actually outstanding.
- **Moving a payment changes its application, not the payment,** as above, so the payer of record stays intact for returns and refunds.

## Reconciliation

Every external system is wrong sometimes, including yours: processors drop transactions from settlement files, banks post late, and your own code has bugs. Reconciliation is how you find out before a merchant does. The settlement side of this, matching processor files and bank deposits to payouts, is in [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement), and the bank side in [Treasury & Bank Operations](/docs/industries/payments/treasury#bank-reconciliation-is-its-own-discipline).

- **Reconcile daily,** matching ledger entries against processor settlement files and bank statements. A break found the next day has one day of context. One found at month end has thirty.
- **Breaks are tracked, not patched.** A mismatch becomes a record with an owner, and it's resolved with a correcting entry, so the fix is as auditable as the mistake.
- **Reconciliation runs on its own data path.** If it reads the same tables through the same code as the payment flow, a bug in that code hides itself in the check.

## Timestamps

Each transition records when it happened at the source (`authorized_at`, from the processor) and when it was recorded (`created_at`), both in UTC per [Time & Date Formats](/docs/fundamentals/time). They're often different: a webhook arrives minutes late, or a settlement file covers yesterday. Reconciliation matches on the source time; debugging needs both.

## References

**Reference**

- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), guarding transitions and balanced entries
- [Wikipedia: Double-entry bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping), the accounting model
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/content/dam/VCOM/download/about-visa/visa-rules-public.pdf), credit refunds to the same payment credential as the original transaction (1.5.4.14)
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), estimated and incremental authorizations (5.7.2), reversals (5.7.3.6), multiple clearing (5.7.3.2) and clearing tolerances (7.5.6)

**In practice**

- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), authorization validity windows
- [Stripe: How Payment Intents and Setup Intents work](https://docs.stripe.com/payments/paymentintents/lifecycle), an explicit payment state machine
- [Modern Treasury: Accounting for Developers](https://www.moderntreasury.com/journal/accounting-for-developers-part-i), ledgers, accounts and entries for engineers
- [Martin Fowler: Accounting Narrative](https://martinfowler.com/eaaDev/AccountingNarrative.html), corrections as reversing entries
- [Modern Treasury: Transaction status and balances](https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances), pending, posted and archived transactions, and posted, pending and available balances
- [Stripe: Incremental authorization](https://docs.stripe.com/payments/incremental-authorization), [Multicapture](https://docs.stripe.com/payments/multicapture) and [Overcapture](https://docs.stripe.com/payments/overcapture), the network variations as a provider exposes them
- [Stripe: Customer cash balance reconciliation](https://docs.stripe.com/payments/customer-balance/reconciliation), matching received funds to invoices and holding what doesn't match
