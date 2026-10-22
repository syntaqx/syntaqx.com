+++
title = "Money & Amounts"
description = "How monetary amounts are represented: integer minor units, an explicit ISO 4217 currency on every amount, and rounding rules that never lose a cent."
category = "Payments"
order = 7
tags = ["payments", "money", "currency", "standards"]
+++

Money is never a float. Every amount is an integer count of the currency's smallest unit, and every amount travels with its currency. Get this right on day one, because changing it later means migrating every row that holds money.

## Integer Minor Units

Amounts are integers in the currency's **minor unit**: cents for USD, pence for GBP, yen for JPY.

```json
{
  "amount": 1999,
  "currency": "USD"
}
```

That's $19.99. Not `19.99`, not `"19.99"`, not `1999.0`.

### Why Not Decimals?

- **Floats can't represent most decimal fractions.** `0.1 + 0.2` is `0.30000000000000004` in every IEEE 754 language. Sum enough line items and the total drifts.
- **JSON has no decimal type.** [RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259#section-6) leaves number precision to each parser. A `19.99` in JSON is parsed as a float by most clients, whatever the server meant.
- **Integers compare exactly.** Reconciliation is equality, not "close enough".

## Currency Is Always Explicit

Every amount has a `currency` field next to it, as an uppercase [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) alphabetic code. There's no default currency, and no amount is ever sent without one.

```json
{
  "amount": 5000,
  "currency": "JPY",
  "fee": { "amount": 150, "currency": "JPY" }
}
```

Amounts in different currencies are never added, compared, or stored in the same column without their currency next to them.

## Exponents Vary by Currency

Not every currency has two decimal places. The minor unit comes from the ISO 4217 exponent, never from an assumption.

| Currency | Exponent | `1000` means |
| -------- | -------- | ------------ |
| `USD` | 2 | $10.00 |
| `EUR` | 2 | €10.00 |
| `JPY` | 0 | ¥1,000 |
| `KRW` | 0 | ₩1,000 |
| `KWD` | 3 | 1.000 KWD |
| `BHD` | 3 | 1.000 BHD |

Keep the exponent table in one place in code, and convert to a display value only at the edge (UI, receipts, exports). As [Stripe](https://docs.stripe.com/currencies) does, three-decimal amounts must end in `0` (`5120`, not `5124`), since most card networks can't settle the last digit.

## Rounding

Rounding happens once, at a defined point, with a defined rule.

- **Calculate in higher precision, round once.** Fees, tax and FX are calculated with a decimal type (never a float) and rounded to minor units at the end.
- **Use banker's rounding (half-even)** unless a regulation or card network rule says otherwise. It doesn't bias totals upward over millions of transactions.
- **Allocate remainders explicitly.** Splitting $10.00 three ways is `334 + 333 + 333`, never three times `333` with a cent missing. The remainder goes to a deterministic recipient (the first, or the largest).

```text
split(1000, 3) = [334, 333, 333]   # sums to 1000
```

## Storage

| Data | Column type |
| ---- | ----------- |
| Amount | `BIGINT` (minor units) |
| Currency | `CHAR(3)` |
| Intermediate rates (FX, percentages) | `NUMERIC` with explicit precision |

Name columns for what they hold: `amount` and `currency`, or `fee_amount` and `fee_currency`. See [Database Naming Conventions](/docs/database-naming-conventions).

## Negative Amounts

Amounts in requests are always positive. Direction is expressed by the operation (a refund, a payout), not by a sign. Signed amounts only appear in ledger entries, where a debit and a credit have to balance to zero. See [Payment States & Ledgers](/docs/payment-states).

## References

**Specifications**

- [SIX: ISO 4217 currency codes](https://www.six-group.com/en/products-services/financial-information/data-standards.html), the maintenance agency's current code and exponent lists
- [RFC 8259: The JSON Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259), section 6 on number precision

**Reference**

- [PostgreSQL: Numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html), `BIGINT` and `NUMERIC`
- [The Floating-Point Guide](https://floating-point-gui.de/), why `0.1 + 0.2` isn't `0.3`

**In practice**

- [Stripe: Supported currencies](https://docs.stripe.com/currencies), minor units, zero-decimal and three-decimal rules
- [Martin Fowler: Money](https://martinfowler.com/eaaCatalog/money.html), amount plus currency as one value, and allocation
