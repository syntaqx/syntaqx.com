+++
title = "Money & Amounts"
description = "How monetary amounts are represented: integer minor units, an explicit ISO 4217 currency on every amount, and rounding rules that never lose a cent."
category = "Payments"
order = 801
tags = ["payments", "money", "currency", "standards"]
aliases = ["money"]
+++

Money is never a float. Every amount is an integer count of the currency's smallest unit, and every amount travels with its currency. This is the one decision in a payments system you can't cheaply change later: by the time it's wrong, it's wrong in every row, every API response, every report and every client that ever parsed one.

## Integer Minor Units

Amounts are integers in the currency's **minor unit**: cents for USD, pence for GBP, whole yen for JPY.

```json
{
  "amount": 1999,
  "currency": "USD"
}
```

That's $19.99. Not `19.99`, not `"19.99"`, not `1999.0`.

### Why Not Floats

Binary floating point can't represent most decimal fractions. `0.1 + 0.2` is `0.30000000000000004` in every language that uses IEEE 754 doubles, which is nearly all of them. One line item off by a billionth of a cent is invisible. A million of them summed into a settlement report is a reconciliation break nobody can explain, because every individual number "looks right".

The failure is quiet, and that's what makes it expensive. Nothing crashes. Totals are just occasionally a cent off, and the cause is spread across the whole codebase.

### Why Not Decimal Strings

`"19.99"` as a string is exact, and some well-known APIs use it. It's a reasonable choice, and I still don't make it:

- **It invites the bug it avoids.** The first client that writes `parseFloat(amount)` is back to floats, and JSON makes that the path of least resistance. [RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259#section-6) leaves number precision to each parser, so the same problem appears if the amount is a bare JSON number with a decimal point.
- **It hides the exponent.** `"1000"` in a string field could mean ¥1,000 or $1,000.00 depending on who wrote it. An integer in minor units forces everyone to look up the currency's exponent, once, in one place.
- **Integers compare exactly.** Reconciliation becomes equality, sums are exact in any language with 64-bit integers, and there's no question about trailing zeros.

## Currency Is Always Explicit

Every amount has a `currency` next to it, as an uppercase [ISO 4217](https://www.six-group.com/en/products-services/financial-information/data-standards.html) alphabetic code. There's no default currency, and no amount is ever sent alone.

```json
{
  "amount": 5000,
  "currency": "JPY",
  "fee": { "amount": 150, "currency": "JPY" }
}
```

A default currency works right up until the first non-default customer, and then every amount stored without one is ambiguous. Pairing the two also stops the other classic bug: adding amounts in different currencies. If a function receives two amounts with different currencies, it fails, instead of returning a number that means nothing. [Fowler's Money pattern](https://martinfowler.com/eaaCatalog/money.html) is the same idea in code: amount and currency are one value, never two loose fields.

## Exponents Come From a Table

Not every currency has two decimal places, and `1000` means very different things:

| Currency | ISO 4217 exponent | `1000` means |
| -------- | ----------------- | ------------ |
| `USD` | 2 | $10.00 |
| `EUR` | 2 | €10.00 |
| `JPY` | 0 | ¥1,000 |
| `KRW` | 0 | ₩1,000 |
| `KWD` | 3 | 1.000 KWD |
| `BHD` | 3 | 1.000 BHD |

Keep the exponent table in one place in code, and convert to a display value only at the edges: UI, receipts, exports.

The table has to be per integration, not just ISO. Processors sometimes disagree with the standard: [Stripe](https://docs.stripe.com/currencies), for example, represents Icelandic króna and Ugandan shilling as two-decimal amounts for backward compatibility, even though ISO 4217 gives both an exponent of 0. Code that assumes "ISO says 0, so send whole units" charges a hundredth of the intended amount. Map internal amounts to each provider's representation at the boundary, and test the conversion for every currency you enable.

## Rounding

Rounding happens once, at a defined point, with a defined rule. Rounding at every step is how 3 × 33.33 becomes 99.99 in one place and 100.00 in another.

- **Calculate in higher precision, round once.** Fees, tax and FX are computed with an exact decimal type (never a float) and rounded to minor units only at the end.
- **Use banker's rounding (half-even)** unless a regulation or network rule says otherwise. Plain half-up rounds every `.5` the same way, so over millions of transactions the error accumulates in one direction. Half-even sends half of them each way, and the bias cancels out.
- **Allocate remainders explicitly.** Splitting $10.00 three ways is `334 + 333 + 333`, never three times `333` with a cent quietly lost. The remainder goes to a deterministic recipient, so the same split always produces the same result.

```text
split(1000, 3) = [334, 333, 333]   # sums to 1000
```

The test for any money calculation: do the parts sum exactly to the whole? If not, a cent went somewhere, and an auditor will eventually ask where.

## Storage

| Data | Column type |
| ---- | ----------- |
| Amount | `BIGINT` (minor units) |
| Currency | `CHAR(3)` |
| Intermediate rates (FX, percentages) | `NUMERIC` with explicit precision |

`BIGINT` because `INTEGER` tops out around 21 million dollars in cents, which a single large invoice or a platform's daily volume will exceed. Name columns for what they hold, in pairs: `amount` and `currency`, or `fee_amount` and `fee_currency`. See [Database Naming Conventions](/docs/database/naming-conventions).

## Negative Amounts

Amounts in requests are always positive. Direction comes from the operation: a refund, a payout, a fee. A `POST /refunds` with `"amount": -500` is ambiguous (refund 500, or reverse a refund?), and a sign is easy to drop or double. Signed amounts appear in exactly one place, ledger entries, where every debit and credit has to balance to zero. See [Payment States & Ledgers](/docs/payments/payment-states).

## References

**Specifications**

- [SIX: ISO 4217 currency codes](https://www.six-group.com/en/products-services/financial-information/data-standards.html), the maintenance agency's current code and exponent lists
- [RFC 8259: The JSON Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259), section 6 on number precision

**Reference**

- [PostgreSQL: Numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html), `BIGINT` range and exact `NUMERIC`
- [The Floating-Point Guide](https://floating-point-gui.de/), why `0.1 + 0.2` isn't `0.3`

**In practice**

- [Stripe: Supported currencies](https://docs.stripe.com/currencies), minor units, zero-decimal currencies, and provider exceptions like ISK and UGX
- [Martin Fowler: Money](https://martinfowler.com/eaaCatalog/money.html), amount and currency as one value, and allocation
