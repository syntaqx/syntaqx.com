+++
title = "Multi-Currency & FX"
description = "Charging in one currency and settling in another: who takes the FX risk, locking a quoted rate, storing both amounts, refunds, and checkout conversion."
category = "Payments"
order = 805
tags = ["payments", "currency", "fx", "money"]
+++

The chapters before this one hold for a single currency. Selling in the customer's own currency raises conversion and approval rates, and it's what customers expect, but it means a payment now has two amounts, a rate between them, and a question single-currency systems never face: when the rate moves between the charge and the refund, whose money is that? Every rule here builds on [Money & Amounts](/docs/payments/money).

## Two Currencies, Two Names

| Currency | Whose | Example |
| -------- | ----- | ------- |
| **Presentment** | The customer's: what they see and are charged | €49.00 |
| **Settlement** | Yours: what lands in your bank account | $53.12 |

There's often a third: the cardholder's own billing currency. If you charge in euros and the card is billed in Swiss francs, the issuer converts again on its side, and that conversion (with its fee) is between the cardholder and their bank ([Stripe's currency guide](https://docs.stripe.com/currencies) describes the three). Presenting in the card's billing currency avoids that second conversion and the surprise on the customer's statement.

## Who Takes the Exchange Risk

Between showing a price and the money settling, rates move, and someone absorbs the difference. Decide who deliberately:

| When the rate is fixed | Who takes the risk | Tradeoff |
| ---------------------- | ------------------ | -------- |
| **At checkout, with a locked quote** | You, until settlement | The customer pays exactly what they saw; you need a margin or hedging to cover movement |
| **At settlement, at that day's rate** | You, with no control | Simple, but your revenue per sale drifts with the market |
| **By the cardholder's bank** (you charge in your own currency) | The customer | Zero FX work for you; the customer sees a foreign charge, a conversion fee, and an amount that isn't what they expected |

Most businesses that present local prices want the first: the customer must pay exactly the amount displayed, so the rate has to be fixed when the price is shown.

## Locking a Quoted Rate

A displayed local price is a promise. Back it with a quote that has an identity and an expiry:

```json
{
  "id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70",
  "from_currency": "EUR",
  "to_currency": "USD",
  "rate": "1.08400000",
  "source": "provider_quote",
  "created_at": "2026-10-22T14:23:45Z",
  "expires_at": "2026-10-22T14:53:45Z"
}
```

- **The checkout references the quote,** and the payment records which quote it used. Anyone can then explain the conversion later.
- **Quotes expire.** A rate held open indefinitely is a free option for anyone who waits for the market to move in their favor. When it expires, fetch a new one and show the new price.
- **The rate source is a real, tradeable rate.** Reference rates aren't: the ECB publishes its euro reference rates for information only and explicitly discourages using them for transactions ([ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)). Use the rate your payment provider or FX provider will actually settle at, plus your margin.

## Storing Both Amounts

The payment stores both sides of the conversion, each as an integer in its own currency's minor units, plus the rate that connected them:

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "amount": 4900,
  "currency": "EUR",
  "settlement_amount": 5312,
  "settlement_currency": "USD",
  "exchange_rate": "1.08400000",
  "fx_quote_id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70"
}
```

- **Both amounts are facts.** Recomputing one from the other drifts from what actually settled, and reconciliation against bank statements breaks.
- **The rate is a decimal string,** because most clients parse JSON numbers as floats; parse it into a decimal type before using it.
- **Convert in minor units with the exponents.** Converting €49.00 to yen is `4900 × rate ÷ 100` (EUR's exponent), not `4900 × rate`: a factor-of-100 error that tests with only two-decimal currencies never catch.
- **Round once,** at the end, with half-even. Rounding the rate and then the amount compounds two errors into one visible cent.

In the ledger, a conversion is a balanced transaction in each currency: entries in EUR that sum to zero, entries in USD that sum to zero, linked by the same transaction ID ([Payment States & Ledgers](/docs/payments/payment-states)). Never add EUR and USD in one account.

## Refunds and FX Gains and Losses

Refund in the **presentment** currency, for the original amount: the customer paid €49.00, so they get €49.00 back whatever happened to the dollar. "The equivalent of $53.12 at today's rate" is a different number than they paid, which reads as an error and invites a dispute. That makes the settlement side move: if the euro strengthened, returning €49.00 costs more than the $53.12 you received, and the difference has to land somewhere:

- **Record it explicitly** as an FX gain or loss entry, in its own ledger account, not hidden inside the refund amount.
- **Store the refund's own rate and settlement amount,** exactly like the payment, so the refund is as explainable as the charge.
- **Check what your provider does.** Providers convert refunds at different points and some pass the difference to you; find out before your first refund at scale, not after.

Disputes behave the same way, with one difference: you don't choose when they happen, so the rate gap can be months wide.

## Dynamic Currency Conversion

Dynamic currency conversion (DCC) is the offer at a foreign terminal or checkout to "pay in your home currency". The merchant's provider converts at a rate it chooses plus a markup, often sharing it with the merchant, and the customer has seconds to choose with no easy way to compare against their own bank. That's why it's regulated:

- **Card networks require an active choice.** DCC can't be applied by default; the customer must be shown both prices, the rate and the markup, and choose ([Visa Acceptance's DCC guide](https://developer.visaacceptance.com/docs/vas/en-us/dcc/developer/all/rest/dcc-merchant.html) describes the choice, disclosure and receipt requirements).
- **The EU requires the markup in plain numbers.** Conversion charges must be expressed as a percentage markup over the latest ECB reference rate and disclosed before the payment starts, along with the option to pay in the merchant's currency ([Regulation (EU) 2019/518, Article 3a](https://www.legislation.gov.uk/eur/2019/518/article/1)).

If you offer it, make the cheaper option easy to pick and the markup impossible to miss. Revenue that depends on customers not understanding a choice turns into complaints, disputes and regulatory attention.

## Reporting in One Currency

Finance needs one number for "revenue this month". Produce it in a **functional currency** (usually where the company reports), but derive it, don't store it:

- **Keep every amount in its original currency** in the ledger. That's the source of truth.
- **Convert for reporting** at a documented rate per period (the transaction-date rate for revenue, the period-end rate for balances, or whatever your accounting policy states).
- **Never sum across currencies** without converting first. A dashboard that adds JPY and USD minor units is off by orders of magnitude, and it will look plausible.

## References

**Specifications**

- [SIX: ISO 4217 currency code lists](https://www.six-group.com/en/products-services/financial-information/data-standards.html), currency codes and their minor-unit exponents
- [Regulation (EU) 2019/518, Article 1 (inserting Article 3a)](https://www.legislation.gov.uk/eur/2019/518/article/1), disclosure of currency conversion markups over ECB reference rates

**Reference**

- [ECB: Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), published for information only, not for transactions
- [Stripe: Supported currencies](https://docs.stripe.com/currencies), presentment vs settlement currency and minor-unit handling
- [Visa Acceptance: Dynamic Currency Conversion guide](https://developer.visaacceptance.com/docs/vas/en-us/dcc/developer/all/rest/dcc-merchant.html), cardholder choice, rate and markup disclosure, receipts
