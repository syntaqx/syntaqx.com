+++
title = "Ledgers, Positions & Buying Power"
nav_title = "Ledgers & Positions"
description = "Double entry across cash, shares and tokens: trade and settlement date, the stock record, omnibus books, buying power, withdrawable cash and on-chain units."
category = "Investing & Digital Assets Industry"
order = 2507
part = "Accounts and Positions"
tags = ["investing", "ledger", "positions", "buying-power", "settlement", "stock-record", "crypto", "omnibus"]
+++

A customer's brokerage screen shows three numbers that look like one: cash, buying power and withdrawable cash. On a quiet day they match. On any day with a trade, a deposit or a sale, they diverge, because each answers a different question: what the firm owes the customer, what the customer may buy right now, and what may leave the firm today. A buy executed this morning has moved cash and shares economically but not legally until settlement tomorrow; a deposit initiated an hour ago can be spent in part but not withdrawn for days; a sale's proceeds can buy something else but, in a cash account, that something can't be sold until the first sale settles. The ledger has to answer all three questions exactly, at any moment, for every instrument the account can hold, which now includes ether denominated in units of 10^-18 and stablecoins with six decimals next to shares and dollars.

The rule that makes this tractable is the one every money system follows: **balances are not stored, they are derived from an append-only double-entry ledger** ([Double-Entry Ledger](/docs/money/payment-states#double-entry-ledger)). This industry adds three twists. Every line carries an instrument, so an entry balances per instrument, not in dollars. Every line carries two dates, trade date and settlement date, and a position is a different number depending on which you count. And the ledger has a regulatory twin, the **stock record**, which must show for every security both who owns it and where it is, and must balance.

This chapter covers that ledger: double entry across cash and assets, trade-date and settlement-date positions, the stock record, omnibus and segregated holding, buying power and withdrawable cash with worked numbers, pending deposits, units for crypto, and how positions derive from lines intraday and at the close. Margin requirements in depth are in Margin & Short Selling, and possession or control and the reserve formula in Customer Protection, Net Capital & SIPC, both later in this book; the chain side of crypto balances is in How a Crypto Exchange Works.

## How the Platforms Do It

What platforms publish about balances, buying power and holds, as of November 2026:

| Platform | Balances it exposes | How buying power is computed | Holds and restrictions |
| --- | --- | --- | --- |
| **Alpaca** (Account API) | `cash`, `equity` (cash plus long and short market value), `last_equity` (previous trading day at 4:00 pm ET), `pending_transfer_in` and `pending_transfer_out`, `intraday_adjustments` for deposits and withdrawals, `initial_margin`, `maintenance_margin`, `sma` (reserved) | By `multiplier`: 1 is cash; 2 is `max(equity − initial_margin, 0) × 2`; 4 was `(last_equity − last_maintenance_margin) × 4` for day trading; separate `regt_buying_power`, `non_marginable_buying_power` and `options_buying_power` | Accounts under $2,000 equity are "restricted to 1x buying power"; `trading_blocked` and `transfers_blocked` flags |
| **Fidelity** (cash accounts) | Settled cash; "cash, or the sale proceeds of fully paid securities" that have settled | Settled funds plus unsettled proceeds, with violations if the rules below are broken | Three good faith violations or three cash liquidation violations in 12 months, or one free riding violation, restrict the account for 90 calendar days to buying with settled cash only |
| **Kraken** (ACH via Plaid) | Cash and crypto balances | Deposits are tradable at once: "The withdrawal hold does not apply to trading" | ACH deposits "will be available to withdraw after seven days", and the hold applies "to any assets in cash or cryptocurrency, equal to the deposited amount" |
| **Robinhood** (Instant Deposits) | Pending deposits, of which "a portion" is usable at once | The Instant Deposit limit, based on portfolio value and Gold status | The full transfer "may take up to 5 business days to be available"; if it's reversed after the funds were used, "your account may incur a deficit" that is "due immediately" |

Three things stand out. **Every platform has at least three balances**, and the public APIs name them: what is held (`cash`, `equity`), what may be bought (`buying_power` in its variants), and what may move (pending transfers, holds, blocked flags). **Buying power is a formula over the ledger, not a balance in it.** Alpaca's is spelled out per account class, Fidelity's is defined by the violations it prevents, Robinhood's and Kraken's include money that hasn't arrived. **Tradable and withdrawable are different on purpose.** Kraken lets a deposit trade immediately and holds an equal value from leaving for seven days, cash or crypto alike; Robinhood lets part of a deposit trade before it has settled at all. Both are credit decisions, and [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers#instant-deposits-are-credit) sizes them.

## Double Entry in Many Units

The core model's `journal_lines` carry an `instrument_id`, a `ledger_account` and an amount, and cash is an instrument like any other (USD). The invariant is per instrument: **within each journal entry, the lines for each instrument sum to zero.** A buy of shares touches two instruments, so it has at least four lines, two in dollars and two in shares, and each pair balances on its own. There is no dollar value on the share lines; the price is on the execution, and market value is computed when someone asks.

I use one sign convention for every instrument, borrowed from the stock record: **owner accounts carry what each owner is owed (positive is long), and location accounts carry where the asset sits (negative is held there).** Customers and the firm's proprietary accounts are owners. A bank account, the firm's DTC position, a clearing house receivable, a custodian, an omnibus wallet on a chain are locations. When every owner and every location is in the ledger, each instrument's lines sum to zero across the whole book, and "do we hold what we owe" becomes a query: owners' total equals locations' total, per instrument, at a point in time.

**Worked numbers: one buy, four lines, two dates.** A customer with $5,000.00 of settled cash buys 10 shares of XYZ at $187.50 on Monday, November 2, 2026. US equities settle T+1 (compliance since May 28, 2024), so the trade settles Tuesday, November 3. Amounts are in minor units for USD and in whole shares for XYZ.

| Entry | Ledger account | USD | XYZ | Trade date | Settles on |
| --- | --- | ---: | ---: | --- | --- |
| Before | customer:A | +500,000 | | | |
| Before | location:bank | −500,000 | | | |
| Trade | customer:A | −187,500 | | Nov 2 | Nov 3 |
| Trade | settlement:cns_payable | +187,500 | | Nov 2 | Nov 3 |
| Trade | customer:A | | +10 | Nov 2 | Nov 3 |
| Trade | settlement:cns_receivable | | −10 | Nov 2 | Nov 3 |
| Settle | settlement:cns_payable | −187,500 | | Nov 3 | Nov 3 |
| Settle | location:bank | +187,500 | | Nov 3 | Nov 3 |
| Settle | settlement:cns_receivable | | +10 | Nov 3 | Nov 3 |
| Settle | location:dtc | | −10 | Nov 3 | Nov 3 |

On Monday evening the customer's trade-date position is 10 shares and $3,125.00; the settled position is 0 shares and $5,000.00, with 10 shares and −$1,875.00 unsettled. The firm owes the clearing house $1,875.00 and is owed 10 shares; nothing has moved at the bank or DTC. On Tuesday the settlement entry clears both settlement accounts to zero, and the customer is long 10 shares held at DTC and $3,125.00 held at the bank. In this sketch the settlement is per trade; in reality NSCC's Continuous Net Settlement nets each member's trades into one position per security per day, so the settlement entry is per security and the per-trade lines reconcile to it (Clearing & Settlement later in this book).

## Trade Date and Settlement Date

A trade creates two facts at once: an economic one (the customer bears the price risk from the moment of execution) and a legal one (title and cash move at settlement). So each `journal_lines` row carries a trade date and a settlement date, and every position has two readings:

- **Trade-date position:** all lines with a trade date on or before the as-of date. This is what the customer sees as "shares owned", what market value and profit and loss use, what margin requirements are computed on, and what tax lots are opened from (Cost Basis, Tax Lots & Wash Sales later in this book).
- **Settlement-date position:** all lines with a settlement date on or before the as-of date. This is what is at DTC, what the stock record reflects "as of the clearance dates", what can be delivered on a transfer, and what cash is settled for the rules below.

The core model's `positions` row keeps both as `settled_quantity` and `unsettled_quantity` (trade-date position minus settled position), as of a timestamp. The gap between them is never more than the settlement cycle of the instruments involved: one business day for equities, ETFs and listed options, other cycles for mutual funds, bonds and some foreign markets, and **zero for most crypto on an internal ledger**, where a trade between two customers of the same exchange is a book entry that is final when posted, while the chain side settles on its own clock when someone withdraws. A ledger that hardcodes T+1 breaks the first time it carries a fund or a token; the settlement date belongs to the execution, computed from the instrument's settlement rule and the market calendar.

Corrections don't edit dates. A trade busted after it was booked is reversed by a new entry with the original trade and settlement dates and a reference to the bust; a trade booked late (an "as of" trade) is a new entry with its true trade date and the date it was recorded, so both "what did we know on Monday" and "what was true on Monday" are answerable ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).

## The Stock Record

SEC Rule 17a-3(a)(5) requires a broker-dealer to keep "a securities record or ledger reflecting separately for each security as of the clearance dates all 'long' or 'short' positions", alongside blotters (an "itemized daily record of all purchases and sales"), a general ledger, and "ledger accounts (or other records) itemizing separately as to each cash, margin, or security-based swap account" ((a)(1) to (a)(3)). The stock record is the double-entry view of securities: for each security, the **long side** lists who owns it (customer accounts, the firm's own accounts) and the **short side** lists where it is or who owes it (the depository, the clearing house, fails to receive, securities on loan, a transfer agent, a customer short). Long equals short, per security, every day.

**Worked numbers: one security, one break.** The stock record for XYZ at the close of a settlement date:

| Long (ownership) | Shares | Short (location) | Shares |
| --- | ---: | --- | ---: |
| Customer A | 10 | DTC, firm's account | 280 |
| Customer B | 250 | Fail to receive from CNS | 20 |
| Firm proprietary | 40 | | |
| **Total** | **300** | **Total** | **300** |

DTC's position statement that night shows 270 shares, not 280. The stock record still balances (it is the firm's own record), but the location line disagrees with the external source by 10 shares: a **recon break**, recorded in `recon_breaks` against the DTC reconciliation. Until it is explained (a delivery booked to the wrong account, a corporate action applied at DTC and not here, a fail recorded as a delivery) the firm has 10 shares fewer in its control than its customers own, which is the possession or control problem that Rule 15c3-3 exists for, in Customer Protection, Net Capital & SIPC later in this book. The break is worked by locating the 10 shares, never by adjusting the long side.

In the ledger above, the stock record is a query, not a separate system: for each instrument, sum owner accounts and location accounts by settlement date. Firms that keep a separate stock record system reconcile it to the ledger daily; firms that derive it keep one source of truth and one reconciliation, to DTC, the clearing house and custodians ([Reconcile to the Source](/docs/data/data-pipelines#reconcile-to-the-source)).

## Omnibus and Segregated

Customers' securities are almost never registered in customers' names. A broker holds them in its own account at DTC (and DTC in its nominee's name on the issuer's books), and the stock record says which customer owns how much; an introducing broker's customers may sit in one omnibus account at the clearing firm, with the introducing broker's books saying who owns what. Crypto is held the same way: an exchange's customers' coins sit in **omnibus wallets** whose addresses belong to the exchange, and only the internal ledger says whose they are.

That structure works only if the internal ledger is good enough to stand in for title. NYDFS's January 23, 2023 guidance on custodial structures (superseded by an updated version on September 30, 2025, which I could not open) is the clearest statement for crypto: custodians should "separately account for and segregate customer virtual currency from the corporate assets", may use "one or more omnibus on-chain wallets and internal ledger accounts that contain only virtual currency of customers", must keep records so that "each individual customer's beneficial interest is always evident and up-to-date", and should treat gas fees they fund for customers as customer funds. In the ledger's terms:

- **An omnibus wallet is a location account,** one per wallet and asset network, holding only customer assets; the firm's own coins sit in different wallets, or the ledger can't prove which coins are whose.
- **Every customer's beneficial interest is an owner account,** and the sum of owner accounts for an asset equals the sum of its customer location accounts at every point, checked continuously and reconciled to the chain ([Crypto In and Out](/books/investing-and-digital-assets/funding-and-transfers#crypto-in-and-out) has the account-level flow; the chain-side reconciliation belongs to Hot, Warm & Cold Wallets later in this book).
- **Fees the firm pays on customers' behalf are entries,** not leakage: gas paid from an omnibus wallet debits a firm fee account and credits the wallet's location, so the wallet still reconciles.

The cost of getting it wrong is decided in bankruptcy court. In Celsius, Judge Glenn held on January 4, 2023 that the "unambiguous Terms of Use" meant cryptocurrency deposited into Earn accounts "became Celsius's property", so the assets in about 600,000 Earn accounts, worth about $4.2 billion on July 10, 2022, were property of the estate and their holders unsecured creditors; the record also showed Celsius had not segregated Earn assets from its Custody and Withhold programs. The terms decided title, and commingling made even the reserved programs hard to untangle. The bank version of the same lesson, a program ledger that couldn't say who owned the money in an omnibus account, is [Synapse: A Post-Mortem](/books/banking-and-lending/program-ledgers#synapse-a-post-mortem).

## Buying Power

Buying power is the largest purchase the firm will accept now, computed from the ledger, the account's capabilities and the rules. Three regimes, from simplest:

**A cash account** pays in full, but not necessarily with settled money. Regulation T lets a broker buy for a cash account when there are sufficient funds or in reliance on the customer's agreement to "promptly make full cash payment for the security or asset before selling it" (12 CFR 220.8(a)), within the **payment period**: the standard settlement cycle "plus two business days" (220.2), so three business days at T+1. If a security bought in a cash account is sold before it was paid for in full, "the privilege of delaying payment beyond the trade date shall be withdrawn for 90 calendar days" (220.8(c)). Brokers enforce this with three violations, which Fidelity defines publicly:

- **Good faith violation:** buying with unsettled proceeds and selling before those proceeds settle.
- **Free riding:** buying and paying for the purchase with the proceeds of selling the same securities.
- **Cash liquidation violation:** buying and covering the cost by selling other securities after the purchase date, so the covering sale settles after the purchase does.

So cash-account buying power is settled cash plus unsettled sale proceeds (usable to buy, with the good-faith rule attached), plus any instant credit the firm extends on pending deposits, minus what open buy orders have reserved.

**A margin account** may borrow. Reg T's initial requirement is 50% for marginable equities, which is why excess equity buys twice its value; FINRA Rule 4210 sets a 25% maintenance minimum and firms set house requirements above it. Alpaca's published formula for a Reg T account is `max(equity − initial_margin, 0) × 2`, its house maintenance requirement is 30% of market value for long positions over $6.00 (more for cheaper stocks and leveraged ETFs), and it applies 1x buying power to accounts under $2,000 of equity. The day-trading regime is gone: FINRA's amendments to Rule 4210, approved by the SEC on April 14, 2026 (Release No. 34-105226), effective June 4, 2026 with optional phase-in to October 20, 2027, removed the pattern day trader designation and its $25,000 minimum and replaced them with an intraday margin standard that a firm may compute once a day rather than monitor in real time. Alpaca's `multiplier = 4` field describes the old regime; Margin & Short Selling later in this book covers the new one.

**Other capabilities have their own power.** Options buying power reserves collateral for short options and the full premium for long ones; crypto in most US apps is bought with cash only; event contracts at an FCM are fully collateralized. Each is a separate figure because each draws on a different requirement.

**Worked numbers: a cash account across three days.** A cash account starts Monday with $5,000 settled.

| Day | Activity | Settled cash | Unsettled proceeds | Buying power | Withdrawable |
| --- | --- | ---: | ---: | ---: | ---: |
| Mon | Starts the day | $5,000 | $0 | $5,000 | $5,000 |
| Mon | Buys $5,000 of XYZ, settling Tuesday | $5,000, committed | $0 | $0 | $0 |
| Tue | XYZ settles from settled cash; sells XYZ for $5,200, settling Wednesday | $0 | $5,200 | $5,200 | $0 |
| Tue | Buys $5,200 of ABC with the proceeds, settling Wednesday | $0 | $5,200, committed | $0 | $0 |
| Wed | Both settle: the XYZ proceeds pay for ABC | $0 | $0 | $0 | $0 |
| Wed | Sells ABC for $5,300, settling Thursday | $0 | $5,300 | $5,300 | $0 |
| Thu | ABC proceeds settle | $5,300 | $0 | $5,300 | $5,300 |

Buying ABC on Tuesday with unsettled XYZ proceeds is allowed. Selling it on Wednesday, after the proceeds that paid for it settled, is fine. Selling ABC on Tuesday instead, before those proceeds settle, is a good faith violation; a third in 12 months restricts the account for 90 days to settled-cash purchases. Note what stayed at $0 from Monday's purchase until Thursday: withdrawable cash. Unsettled proceeds can buy but can't leave.

**Worked numbers: a margin account.** A Reg T margin account has $20,000 of cash and buys $30,000 of a marginable stock priced over $6.00. Cash goes to −$10,000 (a debit balance, the loan), the long position is $30,000, equity is $20,000.

- Initial margin: 50% × $30,000 = $15,000. Excess equity: $20,000 − $15,000 = $5,000. Buying power: $5,000 × 2 = **$10,000**.
- House maintenance at 30%: $9,000. Equity is $20,000, so there's no call. A call comes when equity, market value minus the $10,000 debit, falls below 30% of market value: MV − 10,000 < 0.3 MV, so MV < $14,285.71, a **52.4% fall**. At FINRA's 25% minimum it would be MV < $13,333.33, a 55.6% fall; the house requirement buys the firm three points of cushion.
- If the stock falls to $24,000, equity is $14,000, initial margin on the position is $12,000, excess $2,000, and buying power **$4,000**. Nothing was sold; buying power fell because it's a function of price.

## Withdrawable Cash

Withdrawable cash is narrower than buying power in every account, because money leaving the firm can't be called back:

- **Only settled cash,** never unsettled sale proceeds.
- **Less every hold:** deposit holds on funds that arrived by ACH (Robinhood's up to five business days, Kraken's seven days applied to an equal value of cash or crypto, Fidelity's variable hold with day-of-deposit trading up to $25,000), legal and exploitation holds ([Trusted Contacts and Senior Holds](/books/investing-and-digital-assets/opening-accounts#trusted-contacts-and-senior-holds)), and amounts reserved for open buy orders.
- **Less any instant credit outstanding:** money the firm advanced on a pending deposit is the firm's until the deposit settles and its hold lifts.
- **In a margin account, limited by the margin requirement:** a withdrawal that increases the debit or reduces equity must leave the account above maintenance and house requirements, and firms typically cap it at excess equity.

The same computation, as a function over balances that the ledger produces. Both versions take amounts in minor units:

```go tab="Go"
// Balances for one cash account, derived from journal lines and holds.
type Balances struct {
	SettledCash       int64 // settled USD the customer owns
	UnsettledProceeds int64 // sale proceeds not yet settled
	InstantCredit     int64 // unused portion of the firm's credit on pending deposits
	OpenBuyReserved   int64 // reserved by working buy orders
	WithdrawalHolds   int64 // deposit, legal and exploitation holds on settled cash
}

// BuyingPower is the largest new purchase a cash account may make.
func BuyingPower(b Balances) int64 {
	return max(b.SettledCash+b.UnsettledProceeds+b.InstantCredit-b.OpenBuyReserved, 0)
}

// Withdrawable is what may leave the firm today: settled cash, less holds and reservations.
func Withdrawable(b Balances) int64 {
	return max(b.SettledCash-b.WithdrawalHolds-b.OpenBuyReserved, 0)
}
```

```rust tab="Rust"
/// Balances for one cash account, derived from journal lines and holds.
pub struct Balances {
    pub settled_cash: i64,       // settled USD the customer owns
    pub unsettled_proceeds: i64, // sale proceeds not yet settled
    pub instant_credit: i64,     // unused portion of the firm's credit on pending deposits
    pub open_buy_reserved: i64,  // reserved by working buy orders
    pub withdrawal_holds: i64,   // deposit, legal and exploitation holds on settled cash
}

/// The largest new purchase a cash account may make.
pub fn buying_power(b: &Balances) -> i64 {
    (b.settled_cash + b.unsettled_proceeds + b.instant_credit - b.open_buy_reserved).max(0)
}

/// What may leave the firm today: settled cash, less holds and reservations.
pub fn withdrawable(b: &Balances) -> i64 {
    (b.settled_cash - b.withdrawal_holds - b.open_buy_reserved).max(0)
}
```

The functions are trivial on purpose. The hard part is that every input is a sum over lines with the right dates, ledger accounts and hold states, computed consistently at one moment; a buying power read from one snapshot and a hold read from another is how an account withdraws money it doesn't have.

## Pending Deposits

A deposit initiated by ACH is a fact before it is money ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)). The ledger records it at initiation in a pending account, not as the customer's cash: `customer:A` stays as it was, `pending:ach_in` and a matching receivable carry the amount, and `pending_transfer_in` (Alpaca's name) is a query over them. When the ACH settles, the pending entry is reversed and the cash entry posts, with the bank as location. When the firm extends instant credit on the pending deposit, that is its own entry: customer cash up by the instant amount, a firm receivable from the customer down by the same, linked to the transfer, cleared when the deposit settles or turned into a deficit when it returns. The withdrawal hold is not a ledger entry at all; it is a `balance_holds` row against settled cash, with an expiry.

Separating the three (pending, credit, hold) is what lets the platform answer the customer's question ("where's my money?") and the firm's ("how much have we advanced against deposits that can still come back?") from the same rows. The second question is sized in [Instant Deposits Are Credit](/books/investing-and-digital-assets/funding-and-transfers#instant-deposits-are-credit).

## Units and Decimals for Crypto

Dollars have two decimal places and fit in a 64-bit integer of cents ([Integer Minor Units](/docs/money/amounts#integer-minor-units)). Crypto doesn't fit that habit:

| Asset | Base unit | Decimals | One unit in base units |
| --- | --- | ---: | --- |
| Bitcoin | satoshi | 8 | 100,000,000 |
| Ether | wei | 18 | 1,000,000,000,000,000,000 |
| USDC on Ethereum | token base unit | 6 | 1,000,000 |
| US dollar | cent | 2 | 100 |

Bitcoin outputs carry a value as a 64-bit integer "number of satoshis"; Ethereum calls wei "the smallest possible amount of ether", with gwei (10^9 wei) used for gas prices; an ERC-20 token's contract declares its own decimals, and USDC's Ethereum contract declares 6. Ethereum token amounts are 256-bit unsigned integers, whose maximum, 2^256 − 1, has 78 decimal digits, beyond any 64-bit or 128-bit integer type.

The rules that follow:

- **Store base units as integers,** in `NUMERIC(78,0)` in SQL and an arbitrary-precision or 256-bit integer type in code, never floating point and never a fixed 8-decimal column for every asset.
- **Decimals belong to the instrument and the network.** The core model's `instruments.decimals` is the ledger's precision for an asset, and `asset_networks` carries the decimals the token contract declares on each chain. They are usually equal; where they aren't, the conversion happens once, at the chain boundary, with the remainder booked.
- **Dust is a ledger entry.** An exchange that keeps ether at 8 decimals internally and receives a deposit of 0.123456789012345678 ETH credits 0.12345678 ETH and leaves 0.000000009012345678 ETH (9,012,345,678 wei) in the omnibus wallet. Unbooked, that remainder makes the wallet's chain balance exceed the ledger's owners forever, a break no one can clear. Booked to a firm dust account, it reconciles. My default is to keep the chain's full precision for every asset and round only for display, which removes the dust entry altogether.
- **Fractional shares are a decimals choice too.** A broker that sells fractions chooses a precision per instrument for quantities, and the remainders of splits, dividend reinvestment and dollar-based orders are booked the same way (Fractional Shares & Recurring Investing later in this book).

## How Positions Derive From the Ledger

`positions` is a materialized view of `journal_lines`: per account and instrument, the sum of owner-account lines by trade date and by settlement date, as of a moment. It is never written directly, and it can always be rebuilt. Three readings matter:

- **Real time,** for buying power, order checks and the app: the latest lines plus intraday state (open orders, holds), maintained incrementally as lines post. Alpaca's `intraday_adjustments` for deposits and withdrawals is a public glimpse of the same idea.
- **End of day,** the books: positions and balances at the firm's close, from which statements, margin calls, the stock record and the reserve computation are produced. Alpaca's `last_equity` is "as of the previous trading day at 4:00 pm ET", the US equity close.
- **As of any past date,** for statements, corrections and disputes: recomputed from lines with trade or settlement dates on or before that date and recorded on or before a given time.

Crypto has no close. A 24/7 book still needs a cut for statements, fees, interest accrual and the omnibus reconciliation, and my rule is to pick one (00:00 UTC is common in crypto, 4:00 pm ET where the crypto sits next to securities on one statement), record it per legal entity, and mark prices at it from a named source, never "the latest price when the job ran".

## How to Build It

These are deltas against the core data model in The Investing & Digital Assets Business, at the start of this book: `journal_entries`, `journal_lines` (with `instrument_id`, `ledger_account` and amount), `positions`, `instruments`, `asset_networks`, `settlements`, `transfers`, `reconciliations` and `recon_breaks`. This chapter adds the chart of ledger accounts with owner and location sides, the two dates on every line (and base-unit amounts), holds on balances, end-of-day snapshots and the per-instrument balance check.

```sql
CREATE TABLE ledger_accounts (                -- the chart: every owner and every location
  code               TEXT PRIMARY KEY,         -- 'customer:<account_id>', 'location:dtc', 'settlement:cns_payable', 'pending:ach_in'
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  side               TEXT NOT NULL CHECK (side IN ('owner', 'location', 'settlement', 'pending', 'firm')),
  account_id         UUID REFERENCES accounts (id),        -- for customer owner accounts
  location_kind      TEXT,                     -- 'bank', 'depository', 'clearing_house', 'custodian', 'omnibus_wallet', 'transfer_agent'
  wallet_id          UUID REFERENCES wallets (id),         -- for omnibus wallet locations
  customer_only      BOOLEAN NOT NULL DEFAULT false        -- locations that may hold only customer assets
);

ALTER TABLE journal_lines
  ADD COLUMN trade_date    DATE NOT NULL,      -- economic date
  ADD COLUMN settles_on    DATE NOT NULL,      -- legal date; equals trade_date for internal crypto trades
  ADD COLUMN recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now();
-- the core's amount is NUMERIC(78,0) in base units of the line's instrument:
-- cents, shares at the instrument's precision, satoshis, wei

CREATE TABLE balance_holds (                  -- restrictions on what may leave, not entries
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID REFERENCES instruments (id),     -- NULL: value-based across assets, as Kraken's equal-value hold
  amount_base        NUMERIC(78,0) NOT NULL CHECK (amount_base > 0),
  reason             TEXT NOT NULL CHECK (reason IN ('ach_deposit', 'instant_credit', 'legal', 'exploitation',
                       'open_order', 'fraud_review')),
  transfer_id        UUID REFERENCES transfers (id),
  placed_at          TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ,              -- enforced on read
  released_at        TIMESTAMPTZ
);

CREATE TABLE position_snapshots (             -- the books at each close, immutable once written
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  as_of_close        TIMESTAMPTZ NOT NULL,     -- the entity's cut: 16:00 America/New_York, 00:00 UTC
  trade_date_qty     NUMERIC(78,0) NOT NULL,
  settled_qty        NUMERIC(78,0) NOT NULL,
  mark_price         NUMERIC(38,12),
  mark_source        TEXT,                     -- the named price source at the cut
  ledger_watermark   UUID NOT NULL,            -- the last journal entry included
  PRIMARY KEY (account_id, instrument_id, as_of_close)
);

CREATE TABLE buying_power_snapshots (         -- what was computed and shown, for disputes
  account_id         UUID NOT NULL REFERENCES accounts (id),
  computed_at        TIMESTAMPTZ NOT NULL,
  regime             TEXT NOT NULL CHECK (regime IN ('cash', 'reg_t', 'portfolio_margin')),
  equity             BIGINT NOT NULL,
  initial_margin     BIGINT NOT NULL,
  maintenance_margin BIGINT NOT NULL,
  buying_power       BIGINT NOT NULL,
  withdrawable       BIGINT NOT NULL,
  inputs             JSONB NOT NULL,           -- the balances, holds and rule versions used
  ledger_watermark   UUID NOT NULL,
  PRIMARY KEY (account_id, computed_at)
);
```

The invariant, per entry and per instrument, enforced when an entry posts:

```sql
SELECT journal_entry_id, instrument_id, SUM(amount) AS imbalance
FROM journal_lines
WHERE journal_entry_id = :entry
GROUP BY journal_entry_id, instrument_id
HAVING SUM(amount) <> 0;            -- any row means the entry is rejected
```

Owners against locations for one instrument on a settlement date, which is the stock record's balance and, for an omnibus wallet, the customer side of the chain reconciliation:

```sql
SELECT la.side, la.location_kind, la.code, SUM(jl.amount) AS qty
FROM journal_lines jl
JOIN ledger_accounts la ON la.code = jl.ledger_account
WHERE jl.instrument_id = :instrument
  AND jl.settles_on <= :as_of
GROUP BY ROLLUP (la.side, la.location_kind, la.code);
-- the grand total is zero; owners' total equals minus locations' total;
-- each location's line is compared with DTC, the custodian or the chain, and a difference is a recon_break
```

Trade-date and settled quantities for an account, which `positions` materializes:

```sql
SELECT jl.instrument_id,
       SUM(jl.amount) FILTER (WHERE jl.trade_date <= :as_of) AS trade_date_qty,
       SUM(jl.amount) FILTER (WHERE jl.settles_on <= :as_of) AS settled_qty
FROM journal_lines jl
WHERE jl.ledger_account = 'customer:' || :account_id
  AND jl.recorded_at <= :known_at          -- what we knew then; now() for the current view
GROUP BY jl.instrument_id;
```

Design notes:

- **One entry per business event,** balanced per instrument: a trade, a settlement, a deposit's pending, its settlement, its instant credit, a fee, a corporate action. Each carries an idempotency key from its source event so a replay posts nothing new ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Holds are rows with expiries, enforced on read,** not ledger entries and not cron-released balances ([Expiry Is Enforced on Read](/docs/building-blocks/reservations-and-holds#expiry-is-enforced-on-read)).
- **Buying power reads one consistent snapshot:** the lines up to a watermark and the holds as of the same moment, and the result is stored with its inputs when it gated an order or a withdrawal.
- **Customer-only locations are enforced.** A ledger account with `customer_only = true` rejects any line posting the firm's own assets to it, which is the NYDFS segregation rule as a constraint.
- **Snapshots are written once per close** with the watermark of the last entry included; a late entry that changes a closed day produces a correction entry dated to that day and a restated snapshot, never an edit.

## Auditing

Broker-dealer books are examined by FINRA and the SEC and audited annually; crypto custodial books by state regulators and auditors. Keep:

- **Every journal entry and line,** append-only, with trade date, settlement date and recorded time, as the 17a-3 blotters, ledgers and customer account ledgers.
- **The stock record by settlement date** for every security, derivable from the lines, with each night's reconciliation to DTC, the clearing house and custodians and every break with its cause and cure.
- **Omnibus wallet reconciliations** of customer owner accounts against customer-only wallet balances on chain, per asset and network, with dust and fee entries.
- **End-of-day position snapshots** with mark prices and sources, as the basis for statements and margin calls.
- **Buying power and withdrawable computations** that gated orders and withdrawals, with their inputs, so "why was I allowed to" and "why wasn't I" have answers.
- **Every hold** with its reason, placement, expiry and release.

## What This Means for the System You Build

- **Derive every balance from lines,** balanced per instrument per entry, with owners and locations in the same ledger.
- **Put two dates on every line** and keep both trade-date and settled positions; let the instrument decide the settlement cycle.
- **Make the stock record a query** over the ledger and reconcile each location to its external source nightly.
- **Keep customer assets in customer-only locations,** in omnibus wallets and accounts the ledger can prove belong to customers.
- **Compute buying power and withdrawable cash separately,** from one consistent snapshot, and record what gated each decision.
- **Model pending deposits, instant credit and holds as three different things.**
- **Store crypto in base units** at the chain's precision, and book any remainder.
- **Pick and record a daily cut for 24/7 assets** with a named price source.

## References

**Law and regulation**

- [17 CFR 240.17a-3: Records to be made by certain exchange members, brokers and dealers](https://www.law.cornell.edu/cfr/text/17/240.17a-3), blotters, general ledger, customer ledger accounts and the securities record "as of the clearance dates"
- [17 CFR 240.15c3-3: Customer protection, reserves and custody of securities](https://www.law.cornell.edu/cfr/text/17/240.15c3-3), the rule the stock record's location side serves
- [12 CFR 220.8: Cash account](https://www.law.cornell.edu/cfr/text/12/220.8), purchases in reliance on prompt payment, liquidation on nonpayment and the 90-day freeze
- [12 CFR 220.2: Definitions](https://www.law.cornell.edu/cfr/text/12/220.2), the payment period as the settlement cycle plus two business days, margin excess

**Regulators and guidance**

- [SEC: Press release 2023-29 (February 15, 2023)](https://www.sec.gov/newsroom/press-releases/2023-29), T+1 adoption and the May 28, 2024 compliance date
- [FINRA Regulatory Notice 26-10](https://www.finra.org/rules-guidance/notices/26-10), Rule 4210 amendments approved in Release No. 34-105226 (April 14, 2026), effective June 4, 2026, phase-in to October 20, 2027, removal of the pattern day trader designation and $25,000 minimum, the intraday margin standard
- [NYDFS: Guidance on Custodial Structures for Customer Protection in the Event of Insolvency (January 23, 2023)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20230123_guidance_custodial_structures), segregation, omnibus wallets with internal ledgers, beneficial interest, sub-custody approval, disclosures, gas fees as customer funds, superseded September 30, 2025

**Courts and enforcement**

- [In re Celsius Network LLC, No. 22-10964 (Bankr. S.D.N.Y. January 4, 2023), Memorandum Opinion on ownership of Earn assets](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), Earn assets as estate property under the Terms of Use, about 600,000 accounts and $4.2 billion, no segregation from Custody and Withhold assets

**Standards and protocols**

- [Bitcoin developer reference: Transactions](https://developer.bitcoin.org/reference/transactions.html), output values as a 64-bit number of satoshis
- [ethereum.org: Intro to ether](https://ethereum.org/en/developers/docs/intro-to-ether/), wei as the smallest unit, 10^-18 ether, and gwei for gas
- [Etherscan: USDC token contract](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48), the contract's 6 decimals

**Vendor documentation**

- [Alpaca: Account API](https://docs.alpaca.markets/reference/getaccount-1), cash, equity, `last_equity` at 4:00 pm ET, pending transfers, intraday adjustments, the buying power formula by multiplier and the margin fields
- [Alpaca: Margin and short selling](https://docs.alpaca.markets/docs/margin-and-short-selling), 1x under $2,000, 50% initial margin, the house maintenance table and margin calls
- [Fidelity: Avoiding cash account trading violations](https://www.fidelity.com/learning-center/trading-investing/trading/avoiding-cash-trading-violations), good faith, free riding and cash liquidation violations, thresholds and the 90-day restriction, settled funds, T+1
- [Fidelity: Processing and hold times](https://www.fidelity.com/customer-service/processing-and-hold-times), variable holds and trading up to $25,000 on the day of deposit
- [Kraken: Fund your account with USD using ACH via Plaid](https://support.kraken.com/articles/8795459449492-how-do-i-fund-my-account-with-usd-using-ach-via-plaid-), the seven-day withdrawal hold on an equal value of cash or crypto, not on trading (last updated October 20, 2026)
- [Robinhood: Instant Deposits](https://robinhood.com/us/en/support/articles/instant-deposits/), trading a portion of a pending deposit and up to five business days for the full transfer
- [Robinhood: Why can't I use my Instant Deposit](https://robinhood.com/us/en/support/articles/why-cant-i-use-my-instant-deposit/), deficits after a reversal, due immediately
