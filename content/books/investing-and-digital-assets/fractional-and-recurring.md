+++
title = "Fractional Shares & Recurring Investing"
nav_title = "Fractional & Recurring"
description = "How brokers create fractional positions, dollar-based orders and their rounding residuals, recurring buys and DRIP as batched orders, crypto plans, the limits."
category = "Investing & Digital Assets Industry"
order = 2511
part = "Accounts and Positions"
tags = ["investing", "fractional-shares", "recurring-investing", "drip", "rounding", "order-batching", "crypto"]
+++

A share of stock is indivisible everywhere except on a broker's books. DTC holds whole shares, exchanges trade whole shares (odd lots included, fractions not), and issuers pay dividends per whole share. A customer who buys $10 of a $400 stock owns 0.025 of a share only because the broker says so: the broker bought a whole share, or holds one, and its ledger divides it among customers and itself. That division is the product. It makes $1 investments possible, turns a paycheck into a weekly purchase of five ETFs, and reinvests a $3.17 dividend the day after it's paid. It also turns every downstream process (dividends, splits, votes, transfers, tax lots) into an allocation problem with remainders.

Fractional and recurring investing belong together because recurring plans are almost always dollar-based, dollar-based orders almost always end in fractions, and brokers execute all three the same way: as **not held** orders, aggregated and filled by the broker with discretion over time and price, then allocated back to accounts. This chapter covers how brokers create fractional positions, dollar-based orders and their precision, rounding and the residual the firm holds, recurring plans and their batching, dividend reinvestment, crypto recurring buys, and what fractions can't do, on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model). How an order moves through the OMS in general is in [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types) later in this book.

## How the Platforms Do It

What brokers publish about fractional and recurring orders, as of November 2026:

| Platform | Minimum and precision | How fractional orders execute | Recurring and reinvestment |
| --- | --- | --- | --- |
| **Alpaca** (Trading and Broker API) | "As little as $1"; quantity to 9 decimal places, with "extra decimal places are truncated"; notional to 2 decimals, and a request with more "is rejected" | "Executed either on a principal or riskless principal basis"; `day` time in force; no fractional short sales | Partner-built on the API |
| **Fidelity** | $1.00; "Fractional share quantities can be entered out to 3 decimal places (.001)," and dollar orders are converted to shares rounded down to .001 | Marked "Not Held"; NMS exchange-listed stocks and ETFs; halted when the security is halted | Recurring investments can buy fractions; fractional dividends reinvest like full shares |
| **Robinhood** | $1, rounded "to the nearest penny"; NMS securities over $1 with market cap above $25,000,000 | "Not Held," with "time and price discretion"; Robinhood Securities "may execute" fractional portions "in a principal capacity" | Stock and ETF plans batched and "typically start to be processed between 11 AM ET and market close"; dividends reinvested "on the trading day after the dividend pay date"; crypto plans run "around 5:30-7:00 PM ET each day" |

Three things stand out. **Precision is a choice and it differs by an order of a million.** Fidelity carries three decimal places of a share, Alpaca nine; the same $100 order produces 0.533 shares at one and 0.533248013 at the other, and the difference is cash left behind or a residual held by the firm. **Fractional orders give the broker discretion.** Every one of these platforms marks or treats them as not held, which is what lets the broker batch, fill from inventory, and choose when to go to market; Robinhood's routing report excludes fractional, dollar-based, recurring and reinvestment orders from its execution statistics for exactly that reason. **Recurring runs are batches, not orders placed at a time the customer chose.** A plan says "Monday"; the broker says when on Monday, and in what aggregate.

## How Brokers Create Fractions

A broker can source fractional shares three ways, and most use more than one:

- **Riskless principal.** The broker aggregates customer fractional orders, buys whole shares in the market (rounded up to the next whole share), and sells the fractions to its customers at the same price as principal, with the leftover fraction going into its own account. The customer's confirmation says riskless principal, which [Rule 10b-10](/books/investing-and-digital-assets/statements-and-tax-forms#rule-10b-10-confirmations) requires it to disclose.
- **Inventory (principal).** The broker holds a stock of whole shares in its own account and sells fractions from it, or buys fractions back into it, replenishing the inventory in the market as it drifts. The customer's price is set by a rule (Alpaca's expected fill price is "the NBBO quote at submission time"), and the firm bears the price risk on its inventory.
- **Agency for the whole-share part.** An order for 10.25 shares can route 10 shares to a market center as an ordinary agency order and fill 0.25 from the firm. Robinhood's routing disclosure describes that split: RHS "may execute a share-based or dollar-based customer order for a quantity that includes a fraction of a share, or a portion of such an order, in a principal capacity," and its affiliate "does not receive payments" for any portion executed as principal.

In every case the firm is a holder. Its fractional inventory is a `firm` position in the instrument, at the same DTC location as its customers' shares, and the stock record shows it on the long side next to the customers it was sold to ([The Stock Record](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record)). The firm's fractional inventory is also why the firm receives part of every dividend, why it can tender for customers' fractions only at its own risk, and why its own entitlement is in every corporate action reconciliation.

## Dollar-Based Orders

A dollar-based (notional) order states what to spend, not what to buy. The core model's `orders` table already has the shape: `notional` in smallest units of the quote instrument with `quantity` null. The conversion to shares happens at the fill price and at the instrument's precision, and the precision rule decides what the customer is charged.

**Worked numbers: one $100 order, two precisions.** A customer places a $100.00 dollar-based order for XYZ, filled at $187.53.

| Rule | Shares | Exact cost | Charged | Left in cash |
| --- | ---: | ---: | ---: | ---: |
| 3 decimals, rounded down (Fidelity's rule) | 0.533 | $99.95349 | $99.95 | $0.05 |
| 9 decimals, truncated (Alpaca's rule) | 0.533248013 | $99.99999988 | $100.00 | $0.00 |

The first rule leaves money unspent and the customer sees $99.95 invested; the second charges $100.00 for shares worth 12 billionths of a dollar less, and the firm, which sold those shares, is ahead by a fraction of a cent. Neither is wrong; both need a stated rule (the cents rounding is half-even in my sketch, per [Rounding](/docs/money/amounts#rounding)) and a ledger that books the difference. The order's record keeps both the notional asked and the quantity and cash delivered.

Three edges every implementation meets:

- **Partial fills.** A notional order filled in pieces is converted per fill, and the last fill takes the remainder of the notional, so the sum of fills equals the order's cash exactly.
- **Sell orders by dollar amount** convert at the fill price into a quantity no greater than the position; "sell $50" on a position worth $49.80 is a sell-all, and Robinhood offers "Sell All" for positions under the $1 minimum.
- **Cancel and replace.** Alpaca's fractional orders can't be replaced, and Robinhood blocks cancels of market-hours fractional orders from 9:20 to 9:30 AM ET; once the batch is committed, the order belongs to it.

## Rounding and Residuals

Fractions create remainders in two places: in shares, when the firm buys whole shares for a batch of fractional orders, and in cash, when anything paid per share is divided across fractional positions. Both go to a firm account, and both must reconcile to zero against what the firm actually bought or received.

**Worked numbers: a batch and its residual.** Five dollar-based buys of XYZ are aggregated and filled at $187.53, at 9-decimal precision.

| Order | Notional | Shares allocated | Charged |
| --- | ---: | ---: | ---: |
| A | $100.00 | 0.533248013 | $100.00 |
| B | $250.00 | 1.333120034 | $250.00 |
| C | $40.00 | 0.213299205 | $40.00 |
| D | $1,000.00 | 5.332480136 | $1,000.00 |
| E | $15.00 | 0.079987202 | $15.00 |
| **Customers** | **$1,405.00** | **7.492134590** | **$1,405.00** |

The firm buys 8 whole shares in the market for $1,500.24 as riskless principal. Customers take 7.492134590 shares for $1,405.00; the firm keeps the **residual**, 0.507865410 shares worth $95.24, in its fractional inventory. The cash side reconciles to a fraction of a cent: customers paid $1,405.00 for shares worth $1,404.99999966, and the $0.00000034 difference is a firm rounding line. In the ledger:

- **XYZ:** customers +7.492134590 (five lines), firm +0.507865410, settlement −8 (receivable from CNS).
- **USD:** customers −$1,405.00, firm −$95.24, settlement +$1,500.24 (payable to CNS).

Each instrument sums to zero. The firm's 0.507865410 shares are inventory for the next batch, and if the next batch needs only 0.4 shares, it comes from inventory without a market order at all.

**Worked numbers: a dividend across fractions.** The firm holds 41 XYZ shares at DTC: three customers with 37.123, 0.533248013 and 2.835886577 shares, and the firm's own 0.507865410. XYZ pays $0.24 per share, so DTC credits $9.84.

| Holder | Shares | Exact entitlement | Credited |
| --- | ---: | ---: | ---: |
| Customer 1 | 37.123 | $8.90952 | $8.91 |
| Customer 2 | 0.533248013 | $0.12797952 | $0.13 |
| Customer 3 | 2.835886577 | $0.68061278 | $0.68 |
| Firm inventory | 0.507865410 | $0.12188770 | $0.12 (the remainder) |
| **Total** | **41** | **$9.84** | **$9.84** |

Customers are credited at the cent, rounded half-even; the firm takes whatever is left of what DTC paid, $9.84 − $9.72 = $0.12, against an exact entitlement of $0.1219, so the firm absorbs the $0.0019. Across millions of accounts the firm's rounding line is a real number; with a stated rule it is a predictable one, and with a remainder holder it always ties out. Rounding customers up and the firm down is a policy, not an accident, and it shows up in the firm's account, not as a break.

## Recurring Plans

A recurring plan is a schedule that creates orders: an account, an instrument (or a model of several), an amount, a frequency, a funding source and a start date. Robinhood's published behavior is a good map of the decisions every broker makes:

- **When it runs.** Stock and ETF plans are batched and "typically start to be processed between 11 AM ET and market close on the scheduled date"; a weekend or holiday moves the run to the next trading day.
- **How it's funded.** From buying power, or from a linked bank with a backup source. A plan funded by a bank debit waits for the transfer unless instant deposit credit covers it, and Robinhood says that wait "can take up to 5 business days" ([Instant Deposits Are Credit](/books/investing-and-digital-assets/funding-and-transfers#instant-deposits-are-credit)).
- **What happens when money isn't there.** Orders are "skipped" if buying power is short or the transfer fails, and the plan is "paused" if a bank transfer is reversed or the bank is unlinked.
- **What's eligible.** Securities priced over $1 with a market cap of $25 million or more, excluding inverse, leveraged and volatility products and anything without fractional trading.

Every run is a `plan_runs` row that either produces an order or records why it didn't, and every produced order joins a batch. Robinhood's routing report names the machinery: recurring investment and dividend reinvestment orders are "routed by RHF to an order batcher engine that is operated by RHS," and treated as not held. The batch is the unit of execution; the allocation back to accounts is the unit of record.

Confirmations can follow the plan's rhythm. Rule 10b-10(b) lets a broker send, for transactions in a periodic plan, a written statement "within five business days after the end of each quarterly period" instead of a confirmation per trade, if the customer was told in writing in advance; a weekly plan otherwise generates 52 confirmations a year ([Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#rule-10b-10-confirmations)). It generates 52 tax lots either way, each with its own acquisition date and basis. The IRS's Publication 550 addresses the holding period for shares bought through an automatic investment service: full shares are considered bought first and fractional shares last, and the holding period starts the day after the purchase date, so shares bought on several dates have split holding periods.

![The recurring run state machine. A row of states: scheduled, funded, batched, filled and allocated, with that path accented and allocated a terminal state. A dashed exit from scheduled to the terminal skipped state when funds are short, and a dashed exit from funded to paused when the bank transfer is reversed. From batched, a back edge labeled next window returns to scheduled when the batch misses its window.](/diagrams/ida-recurring-run-states.svg "Every scheduled run ends in an allocation or a recorded reason it didn't: a skipped run waits for the next date, a paused plan waits for the customer, and a batch that misses its window runs again.")

## DRIP Is an Order, Not an Event

Dividend reinvestment looks like a corporate action and isn't. The dividend is the event: it pays cash to every holder on the pay date ([Cash and Stock Dividends](/books/investing-and-digital-assets/corporate-actions#cash-and-stock-dividends)). Reinvestment is the customer's standing instruction to spend that cash on the same security, and the broker carries it out as a dollar-based buy after the cash arrives. Robinhood reinvests "during market hours (9:30 AM to 4 PM ET) on the trading day after the dividend pay date," requires the election before 12 AM ET on the pay date (otherwise "the dividend will be paid out as cash"), and applies the dividend to any deficit or margin call first.

Treating DRIP as an order gets three things right that treating it as an event gets wrong:

- **The price is a fill, not the issuer's.** A broker-run DRIP buys at the market on the reinvestment day; an issuer's own plan may buy at a plan price. The confirmation and the lot record what actually happened.
- **Each reinvestment is a tax lot.** A quarterly dividend reinvested for ten years is 40 lots, each with its own date and basis, and a sale has to relieve them by the account's method ([Lot Relief Methods](/books/investing-and-digital-assets/cost-basis-and-tax-lots#lot-relief-methods)).
- **A reinvestment can be a wash sale purchase.** A customer who sells a position at a loss and has dividends reinvesting in the same security within 30 days has bought substantially identical stock; the reinvested shares absorb part of the disallowed loss ([Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#wash-sales)). The lot engine has to see DRIP lots as purchases like any other.

Stocks held in a dividend reinvestment plan are also one of the two places the average basis method is allowed, alongside mutual fund shares (Treas. Reg. 1.1012-1(e)).

## Crypto Recurring Buys

Crypto recurring plans run on the same engine with three differences. **They run every day**, weekends included; Robinhood's crypto plans are processed "around 5:30-7:00 PM ET each day." **They are priced like simple buys,** with a spread or fee: Robinhood places them as limit orders "collared up to 1% above the last trade price," returns the difference if the fill is lower, and skips the run if the price has moved more than 1%; a $100 bitcoin order at a 0.25% fee tier buys about $99.75 of bitcoin. **Fractions are native.** A crypto balance is already an integer count of satoshis or wei, so there is no whole-unit purchase to round to; the residual is the venue's minimum order size and the platform's display precision, not a firm inventory. The exchange-side mechanics, minimums and funding risk are in [Recurring Buys](/books/investing-and-digital-assets/crypto-trading-products#recurring-buys).

## The Limits

A fraction is a claim on the broker's books, and the limits follow from that:

- **Transfers.** Fractions don't move to another broker. Robinhood sells fractions to cash on a full transfer out and leaves them in place on a partial; Fidelity says fractional shares "cannot be transferred" and must be sold first ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)). The sale is a taxable disposal the customer didn't choose, and the transfer screen should say so.
- **Voting.** DTC and the issuer count whole shares. Robinhood aggregates fractional votes and submits them; Fidelity excludes the fractional portion from proxy voting ([Proxy and Pass-Through Voting](/books/investing-and-digital-assets/corporate-actions#proxy-and-pass-through-voting)).
- **Voluntary corporate actions.** A fraction can't be tendered or elected at DTC; Fidelity makes most voluntary actions unavailable for the fractional portion.
- **Certificates and direct registration.** There is no certificate for 0.25 of a share; Fidelity says certificates "are not available" for fractions.
- **Order types and sessions.** Alpaca doesn't support fractional short sales; Fidelity halts fractional trading when the security halts.
- **Outside the broker.** Robinhood's disclosures put it plainly: fractional shares "are illiquid outside of Robinhood and not transferable."

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `orders` (with `notional` or `quantity`), `order_events`, `executions` (with `capacity` agent, principal or riskless principal), `journal_entries` and `journal_lines`, `tax_lots`, `instruments` and `transfers`. This chapter adds plans and their runs, the batches that aggregate orders, and the allocation of each batch's fills back to accounts, plus a per-instrument fractional precision.

```sql
ALTER TABLE instruments
  ADD COLUMN fractional_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN min_notional BIGINT;              -- minor units of the quote instrument, e.g. 100 for $1.00
-- decimals stays the book precision: 9 for a broker that carries nine places of a share

CREATE TABLE recurring_plans (                 -- a schedule that creates orders
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  kind               TEXT NOT NULL CHECK (kind IN ('recurring_buy', 'dividend_reinvestment')),
  notional           BIGINT,                   -- minor units; null for reinvestment (the dividend is the amount)
  frequency          TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  next_run_on        DATE,
  funding            TEXT NOT NULL CHECK (funding IN ('buying_power', 'bank', 'dividend')),
  backup_funding     TEXT,
  periodic_confirms  BOOLEAN NOT NULL DEFAULT FALSE,  -- Rule 10b-10(b) notice given and acknowledged
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'canceled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'dividend_reinvestment') = (notional IS NULL))
);

CREATE TABLE plan_runs (                       -- one per scheduled date, whatever happened
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  recurring_plan_id  UUID NOT NULL REFERENCES recurring_plans (id),
  scheduled_for      DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('scheduled', 'funded', 'batched',
                       'filled', 'allocated', 'skipped', 'paused')),
  skip_reason        TEXT,                     -- 'insufficient_buying_power', 'transfer_failed', 'ineligible', ...
  transfer_id        UUID REFERENCES transfers (id),        -- the bank debit that funded it
  order_id           UUID REFERENCES orders (id),
  UNIQUE (recurring_plan_id, scheduled_for)    -- a rerun can't create a second order
);

CREATE TABLE order_batches (                   -- not-held orders aggregated for one execution
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  window_start       TIMESTAMPTZ NOT NULL,
  window_end         TIMESTAMPTZ NOT NULL,
  side               TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  customer_quantity  NUMERIC(78, 0),           -- sum of allocations, smallest units
  market_quantity    NUMERIC(78, 0),           -- whole shares bought or sold in the market
  inventory_quantity NUMERIC(78, 0),           -- taken from or added to the firm's fractional inventory
  status             TEXT NOT NULL CHECK (status IN ('open', 'committed', 'executed', 'allocated'))
);

CREATE TABLE fractional_allocations (          -- each order's share of a batch
  order_batch_id     UUID NOT NULL REFERENCES order_batches (id),
  order_id           UUID NOT NULL REFERENCES orders (id),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  price              NUMERIC(38, 18) NOT NULL, -- the batch price per whole share
  quantity           NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  cash_amount        BIGINT NOT NULL,          -- charged or paid, minor units, after rounding
  capacity           TEXT NOT NULL CHECK (capacity IN ('riskless_principal', 'principal', 'agent')),
  rounding_rule      TEXT NOT NULL,            -- 'truncate_9dp/half_even_cents', 'floor_3dp/half_even_cents'
  execution_id       UUID REFERENCES executions (id),   -- the customer-side execution record
  PRIMARY KEY (order_batch_id, order_id)
);
```

The batch invariant, checked before allocations post: what customers took plus what went to or came from inventory equals what was bought or sold in the market, in shares, with cash differences on one firm rounding line.

```sql
SELECT b.id,
       b.market_quantity,
       SUM(a.quantity) + b.inventory_quantity AS allocated_plus_inventory
FROM order_batches b
JOIN fractional_allocations a ON a.order_batch_id = b.id
WHERE b.id = :batch
GROUP BY b.id, b.market_quantity, b.inventory_quantity
HAVING SUM(a.quantity) + b.inventory_quantity <> b.market_quantity;   -- any row blocks posting
```

The allocation itself, for a buy batch: convert each notional at the batch price, truncate to the instrument's precision, round cash half-even, and give the remainder to the firm. Both versions take the price in millionths of a dollar and quantities in billionths of a share:

```go tab="Go"
// Allocation is one order's share of a batch (uses math/big).
type Allocation struct {
	OrderID  string
	Notional int64 // requested, in cents
	Qty      int64 // billionths of a share (9 decimals), truncated
	Charged  int64 // cents, rounded half-even
}

// Allocate converts notionals at price (micro-dollars per share) and returns
// the allocations and the whole shares the firm must buy from the market.
func Allocate(orders []Allocation, priceMicros int64) ([]Allocation, int64) {
	const qtyScale = 1_000_000_000 // billionths of a share
	var total int64
	for i := range orders {
		o := &orders[i]
		// notional cents -> micro-dollars, times qtyScale, over price: truncates
		o.Qty = new(big.Int).Div(
			new(big.Int).Mul(big.NewInt(o.Notional*10_000), big.NewInt(qtyScale)),
			big.NewInt(priceMicros)).Int64()
		// exact cost in micro-dollars, then half-even to cents
		cost := new(big.Int).Mul(big.NewInt(o.Qty), big.NewInt(priceMicros))
		o.Charged = halfEvenDiv(cost, big.NewInt(qtyScale*10_000))
		total += o.Qty
	}
	whole := (total + qtyScale - 1) / qtyScale // round up to whole shares
	return orders, whole
}

func halfEvenDiv(n, d *big.Int) int64 {
	q, r := new(big.Int).QuoRem(n, d, new(big.Int))
	switch new(big.Int).Mul(r, big.NewInt(2)).Cmp(d) {
	case 1:
		q.Add(q, big.NewInt(1))
	case 0:
		if q.Bit(0) == 1 {
			q.Add(q, big.NewInt(1))
		}
	}
	return q.Int64()
}
```

```rust tab="Rust"
/// One order's share of a batch.
pub struct Allocation {
    pub order_id: String,
    pub notional: i64, // requested, in cents
    pub qty: i64,      // billionths of a share (9 decimals), truncated
    pub charged: i64,  // cents, rounded half-even
}

const QTY_SCALE: i128 = 1_000_000_000; // billionths of a share

/// Converts notionals at price (micro-dollars per share) and returns the whole
/// shares the firm must buy from the market.
pub fn allocate(orders: &mut [Allocation], price_micros: i128) -> i64 {
    let mut total: i128 = 0;
    for o in orders.iter_mut() {
        let qty = (o.notional as i128 * 10_000 * QTY_SCALE) / price_micros; // truncates
        o.qty = qty as i64;
        o.charged = half_even_div(qty * price_micros, QTY_SCALE * 10_000) as i64;
        total += qty;
    }
    ((total + QTY_SCALE - 1) / QTY_SCALE) as i64 // round up to whole shares
}

fn half_even_div(n: i128, d: i128) -> i128 {
    let (q, r) = (n / d, n % d);
    match (2 * r).cmp(&d) {
        std::cmp::Ordering::Greater => q + 1,
        std::cmp::Ordering::Equal if q % 2 == 1 => q + 1,
        _ => q,
    }
}
```

For the batch above ($187.53 is 187,530,000 micro-dollars), order A's quantity is 100.00 × 10^4 × 10^9 / 187,530,000 = 533,248,013 billionths, its exact cost is 99.99999988 dollars and its charge 10,000 cents; the five orders sum to 7,492,134,590 billionths and the firm buys 8 whole shares. The residual, 507,865,410 billionths, is the firm's inventory line.

Design notes:

- **The run is idempotent by plan and date.** `UNIQUE (recurring_plan_id, scheduled_for)` means a scheduler that fires twice produces one order; the order's `client_order_id` is derived from the run ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **A batch is committed before it executes.** Once committed, cancels go to the next batch; the commit time is what the customer's cancel cutoff is computed from.
- **Allocation creates the customer execution.** Each allocation writes an `executions` row with `capacity` riskless principal or principal and the batch price, which is what the confirmation, the lot and the 606 exclusion read.
- **The firm's fractional inventory is a position** with limits and a mark, rebalanced in the market when it drifts past them, and it is reconciled with customers to DTC every night.
- **Skips are records.** A skipped run writes its reason and notifies the customer; a pause stops future runs until the customer acts.

## Auditing

Fractional programs are examined for best execution on not-held orders, for disclosure of capacity and the firm's discretion, and for the arithmetic. Keep:

- **Every plan and every run,** with its status, the funding used or the reason it was skipped, and the order it produced.
- **Every batch,** its window, commit time, market executions, inventory movements and allocations, so any customer's fill can be traced to the market prints behind it.
- **The rounding rules in force** for quantities and cash, by version, and the firm rounding and inventory lines they produced.
- **The firm's fractional inventory** by instrument and day, reconciled with customers' positions to DTC.
- **The disclosures:** the not-held treatment, the capacity, the periodic-statement notice where Rule 10b-10(b) is used, and what customers were told about transfers and votes.

## What This Means for the System You Build

- **Pick a quantity precision per instrument and a cash rounding rule,** state both, and book every remainder to a firm account.
- **Treat fractional, dollar-based, recurring and reinvestment orders as not held,** batched and allocated, and record the batch behind every customer fill.
- **Make the firm's fractional inventory a position** in the ledger and the stock record, entitled to dividends and corporate actions like any holder.
- **Run plans idempotently by plan and date,** fund them within the credit limits, and record every skip and pause.
- **Model DRIP as an order after the dividend,** with its own lot, visible to the wash sale engine.
- **Say what fractions can't do** (transfer, vote, tender) before the customer finds out at a transfer.

## References

**Law and regulation**

- [17 CFR 240.10b-10: Confirmation of transactions](https://www.law.cornell.edu/cfr/text/17/240.10b-10), capacity disclosure, and (b) quarterly statements within five business days for periodic plans with prior written notice
- [26 CFR 1.1012-1: Basis of property](https://www.law.cornell.edu/cfr/text/26/1.1012-1), (e) the average basis method for regulated investment company and dividend reinvestment plan stock

**Regulators and guidance**

- [IRS: Publication 550, Investment Income and Expenses](https://www.irs.gov/publications/p550), holding periods for shares bought through an automatic investment service, and buying substantially identical stock within 30 days as a wash sale

**Filings and reports**

- [Robinhood Financial: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/165998_606_NMS_2026_Q2_V1.pdf), principal execution of fractional portions by Robinhood Securities, and fractional, dollar-based, recurring and dividend reinvestment orders as not held, routed to an order batcher engine and excluded from the statistics

**Vendor documentation**

- [Alpaca: Fractional trading](https://docs.alpaca.markets/docs/fractional-trading), the $1 minimum, 9-decimal quantity truncation, 2-decimal notional rejection, principal or riskless principal execution at the NBBO, no fractional short sales, dividends rounded to the penny
- [Fidelity: Fractional shares](https://www.fidelity.com/trading/fractional-shares), the $1.00 minimum, three decimal places rounded down, not held, halts, no transfers, certificates or proxy voting for fractions, reinvestment
- [Robinhood: Fractional shares](https://robinhood.com/us/en/support/articles/fractional-shares/), the $1 minimum, penny rounding, eligibility, not held, the 9:20 AM ET cancel cutoff, transfers and corporate actions on fractions
- [Robinhood: Recurring investments](https://robinhood.com/us/en/support/articles/recurring-investments/), batch processing times, funding and backups, skips and pauses, eligibility, crypto run times, the 1% collar and the fee example
- [Robinhood: Dividend reinvestment](https://robinhood.com/us/en/support/articles/dividend-reinvestment/), reinvestment on the trading day after the pay date, the midnight election cutoff, deficits and margin calls first, fractions not transferable
