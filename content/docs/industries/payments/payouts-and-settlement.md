+++
title = "Payouts & Settlement"
description = "How a card payment becomes money in a merchant's bank: settlement timing, fees as ledger entries, payout schedules and reserves, failures, and reconciliation."
category = "Payments Industry"
order = 1410
aliases = ["payments/payouts-and-settlement"]
tags = ["payments", "payouts", "settlement", "ledger"]
+++

[Disputes](/docs/industries/payments/disputes-and-chargebacks) are why money can't leave the platform the moment it arrives. A customer pays on Monday and the merchant sees "succeeded" on Monday, but the money reaches their bank on Wednesday, or the following week, or for a new merchant two weeks later. Everything in between is settlement and payouts, the source of most "where's my money?" tickets on a payments platform, and the answer has to be computable from records for every cent.

## The Stages

"Paid" means different things at different stages, and conflating them is the root of most confusion:

| Stage | What it means | Money moved? |
| ----- | ------------- | ------------ |
| **Authorization** | The issuer approved the amount and placed a hold on the customer's card. | No |
| **Capture** | The merchant claims the authorized amount. | Not yet |
| **Clearing** | Captured transactions are submitted to the network in a batch and matched with the issuer. | Being arranged |
| **Settlement** | The issuer pays the acquirer or processor, net of interchange and network fees. | Yes, to the processor |
| **Payout** | The processor or platform pays the merchant's bank account from their balance. | Yes, to the merchant |

Each stage is a separate fact with its own timestamp, and the API says which one a balance reflects. A merchant's balance has at least two buckets, **pending** (captured, not yet settled) and **available** (settled, can be paid out); one number labeled "balance" invites the ticket about why it can't be paid out.

## Settlement Timing

Funds become available on a **rolling** schedule, written T+N: money captured on day T is available N business days later. Two business days is common for established US card accounts, but it varies by country and payment method. Stripe's published timings, for example, run from 2 business days in the United States to 7 calendar days for a first payout in several countries, and bank debits settle more slowly than cards.

Rolling beats "everything on Friday": each day's volume becomes available on its own day, so cash flow tracks sales, and a problem with one batch affects one day.

## Fees Are Separate Entries

A $50.00 charge with a 2.9% plus 30 cent fee shouldn't be recorded as a $48.25 payment. It's a $50.00 payment and a $1.75 fee, posted together in one [ledger transaction](/docs/payments/payment-states):

| Account | Amount |
| ------- | ------ |
| `customer_receivable` | `-5000` |
| `merchant_balance` | `+4825` |
| `platform_fees` | `+175` |

Recording only the net loses what you'll need later: a partial refund needs the gross, tax reporting needs gross volume, a fee dispute needs the rate applied to the gross, and the processor's fees and the platform's markup are two entries to two different accounts.

Platforms that split a payment between several parties (a marketplace paying a seller and a delivery driver, say) post every share as its own entry in the same transaction. The rule from [Money & Amounts](/docs/payments/money) still applies: the shares must sum exactly to the gross, with any rounding remainder assigned deliberately.

## Payout Schedules, Holds and Reserves

How soon a merchant can be paid is a risk decision, not a convenience setting: once money leaves the platform, getting it back depends on the merchant's goodwill and bank balance, and disputes arrive up to 120 days later.

- **New merchants wait longer.** A first payout delayed a week or two gives fraud and disputes time to surface; it stops the merchant who signs up with stolen cards and pays themselves out the same day. Stripe typically schedules a new account's first payout 7 to 14 days after its first live payment.
- **Rolling reserves** hold back a percentage of each day's volume for a fixed period, then release it. They're the standard tool for merchants whose risk is real but acceptable: high ticket sizes, delivery months after payment, elevated dispute rates. The reserve exists to pay the disputes and refunds that arrive after the sales that caused them.
- **Holds are explicit and explained.** Every held amount is a ledger entry into a `reserves` or `holds` account with a release date, never just a smaller "available" number. A merchant who can see "$1,200 held until 12 March, rolling 10% reserve" is a merchant who doesn't open a support ticket.

### Negative Balances

Refunds and lost disputes can take a merchant's balance below zero, and on a platform someone has to cover it. Options, in order: offset against the merchant's future payments, debit their bank account (which requires authorization to debit, collected during [onboarding](/docs/industries/payments/merchant-onboarding)), and finally, absorb it from the platform's own funds. Decide the order up front and tell merchants, because the alternative is discovering the policy in the middle of a loss. While a balance is negative, payouts stop.

## Payout Failures

Payouts fail, and they fail days later than you'd expect, because bank transfers report problems asynchronously.

In the US, ACH payouts can be **returned** after they appear to succeed, typically within two banking days, with a standardized Nacha reason code ([ACH & Bank Transfers](/docs/industries/payments/ach) covers the rail, the longer windows on debits, and instant alternatives):

| Code | Meaning | What to do |
| ---- | ------- | ---------- |
| R01 | Insufficient funds (on a debit) | Retry once funds are likely, or collect another way |
| R02 | Account closed | Stop paying out, ask the merchant for a new account |
| R03 | No account, or unable to locate | Bank details are wrong; ask for new ones |
| R04 | Invalid account number | Same as R03 |

So a payout's state machine doesn't end at `paid`. It goes `pending` → `in_transit` → `paid`, and from `paid` it can still become `failed` when the return arrives. The returned amount goes back to the merchant's balance through a reversing ledger entry, and payouts to that account stop until the bank details change. Retrying a payout to a closed account just produces another return.

Bank details are where fraud concentrates too: a changed payout account shortly before a large payout is the classic account-takeover cash-out, so a change re-verifies the account and can reasonably delay the next payout ([Merchant Onboarding](/docs/industries/payments/merchant-onboarding)).

## Idempotent Payouts

A payout sent twice is money that's very hard to get back. Payouts carry an [idempotency key](/docs/payments/idempotency) derived from what they represent (the merchant and the balance period), so a retry after a timeout can't create a second transfer, and a scheduled payout job uses the same deterministic key so a crash and restart can't pay twice.

## Reconciliation

Every payout has to be explained three ways: by your ledger (which balance entries it pays), by the processor's settlement report (which transactions it settles), and by the merchant's bank deposit (what actually arrived). Reconcile all three daily, as [Payment States & Ledgers](/docs/payments/payment-states) describes. The question a merchant asks, "which payments make up this $3,812.40 deposit?", should have an answer you can produce from records in one query: each payout lists the balance transactions it includes.

## References

**Reference**

- [Nacha: Risk and Quality Rules fact sheet](https://www.nacha.org/system/files/2019-05/Risk-and-Quality-Rules-Fact-Sheet.pdf), return rate thresholds and the administrative return codes
- [Modern Treasury: ACH return code R01](https://www.moderntreasury.com/ach-return-codes/r01), return reasons and the two-banking-day return window

**In practice**

- [Stripe: Payouts](https://docs.stripe.com/payouts), settlement timing by country, first-payout delay and negative balances
- [Stripe: Understanding Connect account balances](https://docs.stripe.com/connect/account-balances), pending and available balances, platform reserves and negative balances
