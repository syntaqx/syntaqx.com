+++
title = "Payment States & Ledgers"
description = "Explicit state machines for financial objects, append-only records, and a double-entry ledger, so every balance can be explained and nothing is ever edited."
category = "Payments"
order = 7.2
tags = ["payments", "state-machines", "ledger", "database"]
aliases = ["payment-states"]
+++

Financial data has two rules: every change of state is explicit, and nothing that happened is ever rewritten. Mistakes are corrected with new entries, the same way accountants have done it for centuries. The reason is the same for them as for us: the most important question about money is never "what is the balance?", it's "why is that the balance?", and you can only answer it if the history is intact.

## Explicit State Machines

Every financial object has a `status` with a closed set of values and a documented set of allowed transitions. Anything not on the list is rejected.

### Example: Payment

```text
           ┌──► requires_action ──┐
           │                      ▼
pending ───┴─────────────────► authorized ──► captured ──► settled
   │                              │
   ▼                              ▼
 failed                         voided
```

| From | To | Trigger |
| ---- | -- | ------- |
| `pending` | `authorized` | Issuer approves the authorization |
| `pending` | `failed` | Issuer declines, or the request errors |
| `pending` | `requires_action` | Issuer asks the customer to authenticate ([3-D Secure](/docs/payments/strong-customer-authentication)) |
| `requires_action` | `pending` | Customer completes the challenge; the payment resumes |
| `requires_action` | `failed` | Customer fails or abandons the challenge, or it expires |
| `authorized` | `captured` | Merchant captures (full or partial) |
| `authorized` | `voided` | Merchant cancels, or the authorization expires uncaptured |
| `captured` | `settled` | Funds arrive in the settlement batch |

The alternative, a status column any code path can set to anything, fails in ways that are hard to see. A late webhook marks a voided payment as captured. A retry captures a payment twice. A support tool "fixes" a failed payment by setting it to settled. Each one is a single `UPDATE` that looked reasonable to whoever wrote it. A transition table makes the invalid ones impossible instead of merely unlikely.

- **Terminal states are terminal.** `failed`, `voided` and `settled` never transition again. A refund after settlement isn't a state change on the payment; it's a new object (below).
- **Transitions are guarded in the database,** not only in code: `UPDATE payments SET status = 'captured' WHERE id = $1 AND status = 'authorized'`. Zero rows updated means someone else got there first, perhaps a concurrent void or a duplicate webhook, and the second actor stops instead of overwriting. Checking in application code and then writing has a race window between the read and the write; the guarded update doesn't.
- **Every transition is recorded** with when it happened, what triggered it and the processor's reference. When a customer disputes a charge six months later, "it's captured" isn't enough; you need the path it took.

### Authorizations Expire

An authorization only holds funds for a limited time, set by the card networks. Plan on **7 days** for online card payments and **2 days** for in-person payments; Visa shortened merchant-initiated transactions to **5 days**. [Stripe's capture-later guide](https://docs.stripe.com/payments/capture-later) documents the same windows.

Ignore this and an order that ships on day 8 tries to capture an authorization that no longer exists. The capture fails, the goods are gone, and the customer was never charged. Store the deadline as `capture_before` when the authorization succeeds, alert before it passes, and have a scheduled job move anything past it to `voided`, so the state reflects reality instead of a hold that silently lapsed.

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

## Append-Only Records

Financial rows are inserted, never updated in place, and never deleted.

- **Corrections are reversals.** A wrong fee is fixed with an entry that reverses it and another with the right amount. The original stays, so the books show both the mistake and the fix, and anyone reconciling last month's report can still reproduce it.
- **Status history is a table,** not an overwritten column. The current `status` is a cached projection of the latest transition, convenient for queries, never the source of truth.
- **No hard deletes.** Retention is applied by archiving, with an audit trail. See [Data Retention & Deletion](/docs/architecture/data-retention) for how that coexists with privacy erasure.

The test: given any balance, you can list every row that produced it. If an `UPDATE` ever changed an amount, you can't.

## Double-Entry Ledger

Money movement is recorded as a **transaction** made of two or more **entries** that sum to zero, per currency. Money is never created or destroyed; it moves from one account to another.

| Entry | Account | Amount |
| ----- | ------- | ------ |
| 1 | `customer_receivable` | `-5000` |
| 2 | `merchant_payable` | `+4855` |
| 3 | `platform_fees` | `+145` |

Why bother, instead of a single `balance` column per merchant? Because a single balance can be wrong silently. If a bug credits the merchant $48.55 but forgets the fee, a balance column just holds the wrong number. In a double-entry ledger, the transaction doesn't sum to zero, and the database refuses it. Errors show up as imbalances you can detect, instead of balances you have to trust.

- **Entries are written atomically,** and a constraint rejects any transaction that doesn't balance.
- **Account balances are the sum of their entries.** A cached balance is fine for reads, but it's derived, and it can always be rebuilt from the entries.
- **Postings are idempotent.** Each ledger transaction carries the ID of the event that caused it (a capture, a refund), with a unique constraint, so a retried event can't post twice. See [Idempotency](/docs/payments/idempotency).
- **Amounts follow [Money & Amounts](/docs/payments/money):** integer minor units, explicit currency. Signs live here and only here.

## Reconciliation

Every external system is wrong sometimes, including yours. Processors drop transactions from settlement files, banks post late, and your own code has bugs. Reconciliation is how you find out before a merchant does.

- **Reconcile daily,** matching ledger entries against processor settlement files and bank statements. A break found the next day has one day of context. One found at month end has thirty.
- **Breaks are tracked, not patched.** A mismatch becomes a record with an owner, and it's resolved with a correcting entry, so the fix is as auditable as the mistake.
- **Reconciliation runs on its own data path.** If it reads the same tables through the same code as the payment flow, a bug in that code hides itself in the check.

## Timestamps

Each transition records when it happened at the source (`authorized_at`, from the processor) and when it was recorded (`created_at`), both in UTC per [Time & Date Formats](/docs/fundamentals/time). They're often different: a webhook arrives minutes late, or a settlement file covers yesterday. Reconciliation matches on the source time; debugging needs both.

## References

**Reference**

- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), guarding transitions and balanced entries
- [Wikipedia: Double-entry bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping), the accounting model

**In practice**

- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/capture-later), authorization validity windows
- [Stripe: How Payment Intents and Setup Intents work](https://docs.stripe.com/payments/paymentintents/lifecycle), an explicit payment state machine
- [Modern Treasury: Accounting for Developers](https://www.moderntreasury.com/journal/accounting-for-developers-part-i), ledgers, accounts and entries for engineers
- [Martin Fowler: Accounting Narrative](https://martinfowler.com/eaaDev/AccountingNarrative.html), corrections as reversing entries
