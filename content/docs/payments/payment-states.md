+++
title = "Payment States & Ledgers"
description = "Explicit state machines for financial objects, append-only records, and a double-entry ledger, so every balance can be explained and nothing is ever edited."
category = "Payments"
order = 7.2
tags = ["payments", "state-machines", "ledger", "database"]
aliases = ["payment-states"]
+++

Financial data has two rules: every change of state is explicit, and nothing that happened is ever rewritten. Mistakes are corrected with new entries, the same way accountants have done it for centuries.

## Explicit State Machines

Every financial object has a `status` field with a closed set of values and a documented set of allowed transitions. Anything not on the list is rejected.

### Example: Payment

```text
pending ──► authorized ──► captured ──► settled
   │            │
   ▼            ▼
 failed       voided
```

| From | To | Trigger |
| ---- | -- | ------- |
| `pending` | `authorized` | Issuer approves the authorization |
| `pending` | `failed` | Issuer declines, or the request errors |
| `authorized` | `captured` | Merchant captures (full or partial) |
| `authorized` | `voided` | Merchant cancels, or the authorization expires uncaptured |
| `captured` | `settled` | Funds arrive in the settlement batch |

- **Terminal states are terminal.** `failed`, `voided` and `settled` never transition again.
- **Transitions are guarded in the database,** not just in code: `UPDATE ... WHERE id = $1 AND status = 'authorized'`, and zero rows updated means someone else got there first.
- **Every transition is recorded** with when it happened, what triggered it, and the processor's reference.

### Authorizations Expire

An uncaptured authorization only holds funds for a limited time, set by the card network. Like [Stripe](https://docs.stripe.com/payments/capture-later), plan on **7 days** for online card payments and **2 days** for in-person payments (Visa merchant-initiated transactions get 5). Store the expiry as `capture_before`, and a scheduled job moves anything past it to `voided`.

### Refunds and Disputes Are Their Own Objects

A refund doesn't move a payment to `refunded`. It's a new `refund` object, with its own state machine, that references the payment. The same goes for disputes. The payment keeps derived totals:

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "settled",
  "amount": 5000,
  "amount_refunded": 1500,
  "currency": "USD"
}
```

This supports partial and multiple refunds without inventing states like `partially_refunded_then_disputed`.

## Append-Only Records

Financial rows are inserted, never updated in place and never deleted.

- **Corrections are reversals.** A wrong fee is fixed by a new entry that reverses it and a new entry with the right amount. The original stays.
- **Status history is a table,** not an overwritten column. The current `status` is a cached projection of the latest transition.
- **No hard deletes.** Retention rules are applied by archiving, with an audit trail.

The test: given any balance, you can list every row that produced it.

## Double-Entry Ledger

Money movement is recorded as a **transaction** made of two or more **entries** that sum to zero, per currency.

| Entry | Account | Amount |
| ----- | ------- | ------ |
| 1 | `customer_receivable` | `-5000` |
| 2 | `merchant_payable` | `+4855` |
| 3 | `platform_fees` | `+145` |

- Entries in a transaction are written atomically, and a constraint rejects any transaction that doesn't balance.
- Account balances are the sum of their entries. A cached balance is fine for reads, but the entries are the source of truth.
- Amounts follow [Money & Amounts](/docs/payments/money): integer minor units, explicit currency. Signs live here and only here.

## Reconciliation

Every external system is wrong sometimes, including yours.

- **Daily reconciliation** matches internal ledger entries against processor settlement files and bank statements.
- **Breaks are tracked, not patched.** A mismatch becomes a record with an owner, and it's resolved by a correcting entry.
- **Reconciliation runs on its own data path,** so a bug in the payment flow can't hide itself in the check.

## Timestamps

Each transition records the time it happened at the source (`authorized_at` from the processor) and the time it was recorded (`created_at`), both in UTC per [Time & Date Formats](/docs/fundamentals/time). They are often different, and reconciliation depends on both.

## References

**Reference**

- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), guarding transitions and balanced entries
- [Wikipedia: Double-entry bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping), the accounting model

**In practice**

- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/capture-later), authorization validity windows
- [Stripe: How Payment Intents and Setup Intents work](https://docs.stripe.com/payments/paymentintents/lifecycle), an explicit payment state machine
- [Modern Treasury: Accounting for Developers](https://www.moderntreasury.com/journal/accounting-for-developers-part-i), ledgers, accounts and entries for engineers
- [Martin Fowler: Accounting Narrative](https://martinfowler.com/eaaDev/AccountingNarrative.html), corrections as reversing entries
