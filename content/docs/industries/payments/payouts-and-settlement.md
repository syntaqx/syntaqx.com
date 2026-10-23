+++
title = "Payouts & Settlement"
description = "How a card payment becomes money in a merchant's bank: settlement timing, fees as ledger entries, payout schedules and reserves, failures, and reconciliation."
category = "Payments Industry"
order = 1419
part = "Paying Out"
aliases = ["payments/payouts-and-settlement"]
tags = ["payments", "payouts", "settlement", "ledger"]
+++

Everything so far brings money in; this part sends it out, starting with the merchant's own. [Disputes](/docs/industries/payments/disputes-and-chargebacks) and refunds are why it can't leave the moment it arrives: both take money back after the sale, and the merchant's balance has to be there to pay them. A customer pays on Monday and the merchant sees "succeeded" on Monday, but the money reaches their bank on Wednesday, or the following week, or for a new merchant two weeks later. Everything in between is settlement and payouts, the source of most "where's my money?" tickets on a payments platform, and the answer has to be computable from records for every cent.

## The Stages

[How Card Payments Work](/docs/industries/payments/card-payments#five-events-not-one-payment) split a payment into five events: authorization, capture, clearing, settlement and funding. This chapter is the last of them, funding, which a platform calls a **payout**, and the source of most confusion is conflating it with the others. Each is a separate fact with its own timestamp, and the API says which one a balance reflects. A merchant's balance has at least two buckets, **pending** (captured, not yet settled) and **available** (posted, past the availability date its payment method allows, less holds, reserves and pending outflows: what can be paid out); one number labeled "balance" invites the ticket about why it can't be paid out.

## Settlement Timing

Funds become available on a **rolling** schedule, written T+N: money captured on day T is available N business days later. Two business days is common for established US card accounts, but it varies by country and payment method. Stripe's published standard timing, for example, is 2 business days in the US and longer elsewhere, bank debits settle more slowly than cards, and a first payout waits longer still (below).

Rolling beats "everything on Friday": each day's volume becomes available on its own day, so cash flow tracks sales, and a problem with one batch affects one day.

## Fees Are Separate Entries

A $50.00 charge with a 2.9% plus 30 cent fee shouldn't be recorded as a $48.25 payment. It's a $50.00 payment and a $1.75 fee, posted together in one [ledger transaction](/docs/payments/payment-states#double-entry-ledger):

| Account | Amount |
| ------- | ------ |
| `customer_receivable` | `-5000` |
| `merchant_balance` | `+4825` |
| `processing_costs` | `+110` |
| `platform_revenue` | `+65` |

The $1.75 the merchant pays is $1.10 the processor charged the platform and $0.65 the platform keeps. At capture the $1.10 is an estimate, because the real interchange and network fees are only known when the processor's settlement and fee files arrive; post it as pending and true it up from the file, so the platform's margin is measured on actual cost ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)).

Recording only the net loses what you'll need later: a partial refund needs the gross, tax reporting needs gross volume, a fee dispute needs the rate applied to the gross, and the processor's fees and the platform's markup are two entries to two different accounts.

### Collecting Your Own Fees

The platform collects its fees one of two ways. **Net settlement** deducts fees from each payout, so the merchant receives $48.25 and the fee never has to be collected; it's simple, and it's the default for most platforms. **Gross settlement** pays the merchant the full $50.00 and collects fees separately, usually as one monthly debit from the merchant's bank account, which some businesses require so deposits match their sales exactly (property managers holding rent in trust accounts often do). Gross settlement turns fees into receivables that can fail: the monthly debit can come back insufficient or unauthorized, and then it's a collection, handled like the negative balances below. The same ledger serves both; only the payout instruction differs. These are the same words [Treasury](/docs/industries/payments/treasury#funding-the-day) uses for how the acquirer pays you; here they're how you pay the merchant, and the two choices are independent. Fees the platform charges merchants beyond processing (monthly service fees, return and chargeback fees, failed-authorization fees) are entries of their own types, never folded into the processing fee.

Platforms that [split a payment](/docs/industries/payments/software-platforms#where-the-money-goes) between several parties (a marketplace paying a seller and a delivery driver, say) post every share as its own entry in the same transaction. The rule from [Money & Amounts](/docs/payments/money) still applies: the shares must sum exactly to the gross, with any rounding remainder assigned deliberately.

## Payout Schedules, Holds and Reserves

How soon a merchant can be paid is a risk decision, not a convenience setting: once money leaves the platform, getting it back depends on the merchant's goodwill and bank balance, and disputes arrive 120 days later, or more for anything paid in advance.

- **New merchants wait longer.** A first payout delayed a week or two gives fraud and disputes time to surface; it stops the merchant who signs up with stolen cards and pays themselves out the same day. Stripe typically schedules a new account's first payout 7 to 14 days after its first live payment.
- **Reserves come in a few shapes.** A **hold** is a fixed amount released on a date. A **rolling reserve** holds back a percentage of each payment for a set number of days, then releases it; Stripe's examples include 30% held for 60 days. A **fixed reserve** holds a percentage until one release date. Stripe caps any reserve at 180 days, and releases a hold early once refunds or disputes have used it.
- **Rolling reserves** hold back a percentage of each day's volume for a fixed period, then release it. They're the standard tool for merchants whose risk is real but acceptable: high ticket sizes, delivery months after payment, elevated dispute rates. The reserve exists to pay the disputes and refunds that arrive after the sales that caused them.
- **The payment method sets the clock.** Card money can come back as a dispute for months, a consumer ACH debit for 60 days and a business one for two banking days ([ACH & Bank Transfers](/docs/industries/payments/ach)), a Canadian pre-authorized debit for 90 ([Payments in Canada](/docs/industries/payments/canada)), and a check through warranty claims long after it cleared ([Accepting Checks](/docs/industries/payments/checks)). Cash confirmed by a retail network doesn't come back at all ([Cash Payments](/docs/industries/payments/cash-payments)). Availability is computed per payment from its method, not per merchant.
- **Instant payouts are a different product.** A payout to a debit card or over RTP or FedNow is final on arrival ([Vendor Payouts](/docs/industries/payments/vendor-payouts#push-to-card)), so it's priced and limited like credit, and paying before settlement lands is a [treasury decision](/docs/industries/payments/treasury#funding-the-day).
- **Holds are explicit and explained.** Every held amount is a ledger entry into a `reserves` or `holds` account with a release date, never just a smaller "available" number. A merchant who can see "$1,200 held until March 12, rolling 10% reserve" is a merchant who doesn't open a support ticket.

### Negative Balances

Refunds and lost disputes can take a merchant's balance below zero, and on a platform someone has to cover it. Options, in order: offset against the merchant's future payments, debit their bank account (which requires authorization to debit, collected during [onboarding](/docs/industries/payments/merchant-onboarding)), and finally, absorb it from the platform's own funds. Decide the order up front and tell merchants, because the alternative is discovering the policy in the middle of a loss. While a balance is negative, payouts stop.

### Clawbacks

The bank debit is the part that fails. Pulling funds back from a merchant who's already been paid, after a customer's payment returned or a dispute was lost, is an ACH debit to a business account: a CCD entry, which needs the merchant's agreement to debit (collected at onboarding), and which the merchant's bank can return as unauthorized (R29) within two banking days; a sole proprietor's personal account makes it a PPD debit instead, returnable as unauthorized for 60 days. A clawback that comes back is now a debt with no automatic way to collect it, so its states continue: offset against future payouts, retry within the [reinitiation rules](/docs/industries/payments/ach#returns-when-money-is-really-yours) if it returned for insufficient funds, then collections, and finally termination, with a report to Mastercard's MATCH list where the cause qualifies, and the loss written off by the platform as [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) describes. Track every clawback as its own payout-in-reverse, linked to the payment that caused it, so a merchant can see why money left their account.

## Payout Failures

Payouts fail, and they fail days later than you'd expect, because bank transfers report problems asynchronously.

In the US, ACH payouts can be **returned** after they appear to succeed, typically within two banking days, with a standardized Nacha reason code ([ACH & Bank Transfers](/docs/industries/payments/ach) covers the rail, the longer windows on debits, and instant alternatives):

| Code | Meaning | What to do |
| ---- | ------- | ---------- |
| R16 | Account frozen | Stop; it may be a sanctions hit |
| R02 | Account closed | Stop paying out, ask the merchant for a new account |
| R03 | No account, or unable to locate | Bank details are wrong; ask for new ones |
| R04 | Invalid account number | Same as R03 |

So a payout's state machine doesn't end at `paid`. It goes `pending`, then `in_transit`, then `paid`, and from `paid` it can still become `failed` when the return arrives. On ACH those map onto the rail's own states: `in_transit` while the credit is submitted, `paid` at settlement, `failed` on a return. The returned amount goes back to the merchant's balance through a reversing ledger entry, and payouts to that account stop until the bank details change. Retrying a payout to a closed account just produces another return.

A changed payout account is where takeovers cash out, so a change re-verifies the account and holds the next payout, with the controls in [Vendor Payouts](/docs/industries/payments/vendor-payouts#stopping-the-changed-bank-account).

**Unclaimed balances** have an owner too. A merchant who stops processing and never updates a closed bank account leaves money on the platform, and after the state's dormancy period it's unclaimed property, owed to the state with notice to the merchant first, the same rule [Vendor Payouts](/docs/industries/payments/vendor-payouts) describes for uncashed checks.

## Idempotent Payouts

A payout sent twice is money that's very hard to get back. Payouts carry an [idempotency key](/docs/payments/idempotency) derived from what they represent and the attempt (the merchant, the balance period, attempt 1), so a retry after a timeout can't create a second transfer, and a scheduled payout job uses the same deterministic key so a crash and restart can't pay twice. A payout re-sent after a return is a new attempt, with a new key, to the corrected account.

## Reconciliation

Every payout has to be explained three ways: by your ledger (which balance entries it pays), by the processor's settlement report (which transactions it settles), and by the merchant's bank deposit (what actually arrived). Reconcile all three daily, as [Payment States & Ledgers](/docs/payments/payment-states#reconciliation) describes. The question a merchant asks, "which payments make up this $3,812.40 deposit?", should have an answer you can produce from records in one query: each payout lists the balance transactions it includes.

## One Payment, Traced

Every chapter so far describes one layer. Here is a single $100 online card payment through all of them, with illustrative fees: the merchant pays 2.9% plus 30 cents, and the costs are the interchange chapter's example rate ($1.80) plus 14 cents of network fees.

| When | What happens | Where it's explained |
| --- | --- | --- |
| At checkout | The customer's card goes from hosted fields to the vault; the merchant's server creates a payment with an idempotency key and confirms it with a token | [Running a Card Vault](/docs/industries/payments/card-vault), [Designing the Payments API](/docs/industries/payments/payments-api) |
| Seconds later | Risk allows it; the vault's forwarder sends it to the processor, which sends an ISO 8583 `0100` through the network to the issuer; a `0110` comes back approved, and the payment is `authorized` | [Fraud & Risk](/docs/industries/payments/fraud-and-risk), [Inside a Processor](/docs/industries/payments/inside-a-processor) |
| Same day | The merchant captures; the payment is `captured`, a `payment.captured` event goes to the merchant, and the ledger posts the customer receivable, the merchant's $96.80, an estimated $1.94 of processing costs, and the platform's $1.26 | [Payment States & Ledgers](/docs/payments/payment-states), [Webhooks](/docs/payments/webhooks) |
| That night | The capture goes to the network in a clearing file, gets an acquirer reference number, and qualifies for its interchange category | [Inside a Processor](/docs/industries/payments/inside-a-processor#clearing), [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) |
| Next business day | The network settles; the processor's settlement file arrives, the payment is `settled`, and the actual interchange and network fees replace the estimate | [Inside a Processor](/docs/industries/payments/inside-a-processor#settlement) |
| Two business days later | The merchant's $96.80 becomes available and goes out in that day's ACH payout, which the bank statement later confirms | [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement), [Treasury & Bank Operations](/docs/industries/payments/treasury) |
| For 120 days | The payment can still be disputed; if it is, a dispute object holds the $100 and a fee from the merchant's balance | [Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks) |
| Month end | The statement shows the payment, its fees and its payout | [Operating the Platform](/docs/industries/payments/operating-the-platform#statements-and-reports) |
| Next January | The merchant's 1099-K includes the full $100, gross | [Payments for Software Platforms](/docs/industries/payments/software-platforms#1099-k-and-taxpayer-data) |

Every row is a record somebody can find later, and the ledger ties them together: the $100 in, the $3.20 of fees split between costs and revenue, the $96.80 out, and the bank deposit that proves it.

## What This Means for the System You Build

- **Pending and available balances,** each tied to the event it reflects.
- **Fees and every party's share as separate ledger entries,** with the platform's own fees collected net or gross by choice.
- **Availability computed per payment from its method,** and holds as dated ledger entries.
- **A recovery order for negative balances and clawbacks,** decided and published before the first loss.
- **Payout states that continue past `paid`,** because a payout can still be returned.
- **Deterministic payout keys,** and every payout listing the balance transactions it pays.

## References

**Reference**

- [Nacha: Risk and Quality Rules fact sheet](https://www.nacha.org/system/files/2019-05/Risk-and-Quality-Rules-Fact-Sheet.pdf), return rate thresholds and the administrative return codes
- [Modern Treasury: ACH return code R01](https://www.moderntreasury.com/ach-return-codes/r01), return reasons and the two-banking-day return window

**In practice**

- [Stripe: Payouts](https://docs.stripe.com/payouts), settlement timing by country, first-payout delay and negative balances
- [Stripe: Understanding Connect account balances](https://docs.stripe.com/connect/account-balances), pending and available balances, platform reserves and negative balances
- [Stripe: Connected account reserves](https://docs.stripe.com/connect/connected-account-reserves), holds, rolling and fixed reserves, and exposure
