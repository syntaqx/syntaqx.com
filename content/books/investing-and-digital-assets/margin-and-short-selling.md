+++
title = "Margin & Short Selling"
description = "Reg T and FINRA 4210 margin, calls and liquidations, the intraday margin standard that replaced the PDT rule, Reg SHO locates, borrow fees and crypto margin."
category = "Investing & Digital Assets Industry"
order = 2520
part = "Trading and Markets"
tags = ["investing", "margin", "reg-t", "finra-4210", "intraday-margin", "short-selling", "reg-sho", "securities-lending", "crypto-margin"]
+++

A margin account is a loan secured by the securities in it, and a short sale is a sale of shares the customer has borrowed. Both make the broker a creditor whose collateral moves every second the market is open, and both are governed by numbers: 50% to buy under the Federal Reserve's Regulation T, 25% to keep under FINRA Rule 4210, 150% to short, a locate before every short order under Regulation SHO, and a close-out deadline when a short sale fails to deliver. Around those floors each firm sets its own house requirements, its own call deadlines and its own liquidation policy, and those choices, not the federal minimums, are what customers experience as "margin."

The rules changed in 2026. The SEC approved FINRA's amendments to Rule 4210 on April 14, 2026 (Release No. 34-105226), effective June 4, 2026 with an optional phase-in to October 20, 2027: the pattern day trader designation, its $25,000 minimum equity and day-trading buying power are gone, replaced by an **intraday margin standard** that measures how far an account went below maintenance during the day and requires the customer to make it up afterward. Short selling reached commission-free retail apps at scale in the same period; Robinhood began rolling it out in November 2025. Crypto venues run margin on a different model entirely, with no calls and automatic liquidation.

This chapter covers Reg T initial margin, maintenance and house requirements, calls and liquidations, the intraday margin standard, portfolio margin, short sales under Regulation SHO, borrow fees and lending, and crypto margin, each with worked numbers. Buying power as the ledger computes it, with a first margin example, is in [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#buying-power); the interest a broker earns on margin loans is in [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#net-interest-on-cash-and-margin); option requirements are in [Options](/books/investing-and-digital-assets/options-trading#payoffs-and-requirements); perpetual futures margin is in [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives) later in this book.

## How the Platforms Do It

What platforms publish about margin, short selling and liquidation, as of November 2026:

| Platform | Requirements | Calls and liquidation | Short selling and borrowing |
| --- | --- | --- | --- |
| **Alpaca** | 50% initial (Reg T); house maintenance on longs 100% under $2.50, 50% from $2.50 to $6, 30% over $6, 50% for 2x and 75% for 3x leveraged ETFs; shorts the greater of $2.50 a share or 100% under $5, and of $5.00 a share or 30% at $5 or more; margin interest 5.00% (elite) or 6.50% on the end-of-day debit | Calls issued the next morning when end-of-day requirements aren't met; may require immediate liquidation, and, when equity is in danger of turning negative, reserves "the right to liquidate your holdings in the event we cannot get ahold of you" | "5,000+" easy-to-borrow securities "approved for locates with zero fees"; hard-to-borrow needs an approved locate before the order, in round lots of 100 that can't be reused; daily fee = Σ(HTB short market value × HTB rate) / 360, three days over a Friday settlement |
| **Robinhood** | Margin maintenance per position and account | A maintenance call when "portfolio value decreases to less than your total maintenance requirement," from market moves, "ACH reversals, or options assignments"; "Crypto holdings are not factored in when issuing margin calls"; may close positions "with or without your prior approval" | Short sales only in a margin account with at least $2,000 of portfolio value; fee = largest short position of the day × end-of-day price × borrow rate / 360; may buy in when shares "are no longer available to borrow" |
| **Kraken** (spot margin) | Margin level = equity ÷ used margin × 100; up to 20:1 leverage where eligible | No new margin positions below 100%; positions "may be forcibly closed" at 80% or lower; liquidation at Kraken's discretion between about 40% and 80% and "certain" at about 40%, with a 2% liquidation fee, first in first out across pairs, closing all positions or only enough to get back above 100% | Borrowing is the margin position itself |
| **Binance** (Cross Margin Classic) | Margin level = collateral value ÷ (liabilities + outstanding interest); collateral haircuts in the calculation since June 15, 2026 | At 3x, a margin call between 1.1 and 1.3 and liquidation at 1.1 or below; at 5x, a call between 1.1 and 1.16 | Borrowing of either asset in the pair |

The pattern is the same everywhere and the parameters differ. **Every venue computes a ratio of equity to requirement and acts at thresholds.** Brokers express it as a maintenance percentage of market value, crypto venues as a margin level, but each is equity over a requirement. **Brokers call, crypto venues liquidate.** A US broker sends a call and, by its agreement, may sell without waiting; a crypto venue's call is a warning and its liquidation is automatic. **The house requirement is the product.** Alpaca's maintenance table, its 1x buying power under $2,000 of equity and its short floors are firm choices above FINRA's, and they are what the order path enforces.

## Reg T Initial Margin

Regulation T (12 CFR 220) governs how much a broker may lend to buy or carry securities. Its supplement sets the **initial requirement** for a margin equity security at 50% of current market value, and for a short sale of a nonexempted equity security at 150% of current market value (100% of the proceeds plus 50%) (220.12). On any day the day's transactions create or increase a margin deficiency, a call arises; it "shall be satisfied within one payment period," the settlement cycle plus two business days, three business days at T+1. If it isn't, the broker must liquidate enough to cover the call or the deficiency, whichever is less, but "if the margin deficiency created or increased is $1000 or less, no action need be taken" (220.4).

**Worked numbers, my own.** A customer deposits $25,000 in a new margin account.

| Purchase | Reg T initial (50%) | Equity | Loan (debit) | Result |
| --- | ---: | ---: | ---: | --- |
| 1,000 ABC at $40.00 = $40,000 | $20,000 | $25,000 | $15,000 | Meets initial; $5,000 excess, $10,000 of further buying power |
| 1,250 ABC at $40.00 = $50,000 | $25,000 | $25,000 | $25,000 | Exactly at initial; no further buying power |
| 1,500 ABC at $40.00 = $60,000 | $30,000 | $25,000 | $35,000 | **Reg T call of $5,000**, due within three business days |

In practice a broker's buying-power check rejects the third order before it reaches the market, so Reg T calls arise mostly from things the pre-trade check can't stop: a deposit that returns after it was spent, a short sale that gains value before settlement, an assignment. Initial margin is measured on the day of the transaction only. After that, the account is held to maintenance.

## Maintenance and House Requirements

FINRA Rule 4210(c) sets the **maintenance** floor: 25% of the current market value of long margin securities; for short stock under $5.00, the greater of $2.50 a share or 100% of market value; for short stock at $5.00 or more, the greater of $5.00 a share or 30%. Firms set house requirements above these by security (low-priced stocks, leveraged ETFs, concentrated or volatile positions) and can raise them without notice. Rule 4210(f)(6) gives the outer limit for collecting: required margin "shall be obtained as promptly as possible and in any event within 15 business days from the date such deficiency occurred," unless FINRA grants more time. Firm deadlines are much shorter, and the agreement lets the firm sell without waiting at all.

**Worked numbers: the price that triggers a call.** Take the first purchase above: 1,000 ABC at $40.00, $15,000 debit, equity $25,000, and a 30% house requirement (Alpaca's for a stock over $6.00).

- A call comes when equity falls below 30% of market value: 1,000P − $15,000 < 0.30 × 1,000P, so P < $15,000 ÷ 700 = **$21.43**, a 46.4% fall. At FINRA's 25% floor it would be P < $15,000 ÷ 750 = **$20.00**, a 50% fall.
- At $20.00, equity is $5,000 against a house requirement of $6,000: a **$1,000 maintenance call**.
- Met with cash, the call needs **$1,000**: the deposit reduces the debit and raises equity dollar for dollar.
- Met by selling stock, it needs far more. A sale of X reduces market value and debit equally and leaves equity at $5,000, so $5,000 ≥ 0.30 × ($20,000 − X), X ≥ **$3,333.33**: 167 shares at $20.00, three and a third times the call. That ratio (1 ÷ 0.30) is why a liquidation always sells more than the call amount, and why a firm that liquidates at the bid in a falling market may need to sell more still.

## Margin Calls and Liquidations

A call is a state with a deadline, and the deadline is the firm's:

![A margin call: detected moves to issued when the notice is sent, then to the terminal state met on a deposit or price recovery, with that path accented. A dashed path from issued down to liquidating when the due date passes, and a dashed path from detected directly to liquidating when the account is below the house floor, then liquidating moves to the terminal state liquidated when the requirement is covered.](/diagrams/ida-margin-call.svg "Most calls are met by a deposit or a recovering price; when the due date passes, or equity falls below the firm's own floor, the firm sells. FINRA's outer limit is 15 business days; firm agreements allow selling without notice.")

The SEC staff's report on January 2021 summarized the practice: a broker-dealer "may sell out of any position in the customer's account in order to meet the margin call without requiring the customer's consent, as it is typically included in the customer agreement at account opening." Robinhood's and Alpaca's published terms say the same. What a system needs to decide, per call:

- **Which requirement was broken.** A Reg T call (initial, on a transaction day, due in one payment period), a maintenance call (FINRA or house, due by the firm's deadline), or an intraday margin deficit (below), each with its own clock and its own ways to satisfy.
- **What satisfies it.** A deposit of cash or marginable securities, a price recovery that restores equity, or a liquidation. Robinhood lists ACH reversals and options assignments among the causes; crypto held at its separate entity doesn't count either way.
- **What to sell, and in what order.** A deterministic policy (the most liquid first, the position contributing most to the requirement first, or the customer's stated preference if the agreement allows), recorded per liquidation, because "why did you sell that" is the complaint that follows.
- **When to skip the call.** An account below an absolute house floor, or whose equity is approaching zero, is liquidated immediately; a deficit is a loss to the firm.

## Intraday Margin, After the Pattern Day Trader Rule

Until June 2026, FINRA Rule 4210 designated a customer who made four or more day trades in five business days a **pattern day trader**, required $25,000 of minimum equity, and gave day-trading buying power (Alpaca's published formula was `(last_equity − last_maintenance_margin) × 4`). The amendments approved in Release No. 34-105226 replaced all of it, in FINRA's words "in their entirety," with an intraday margin standard in new paragraph (d)(2). The definitions:

- **IML (intraday margin level):** "the amount of cash that the customer could withdraw while still having the maintenance margin" required by the rule, or, when negative, the cash the customer would need to deposit to meet it.
- **IML-reducing transaction:** any purchase or sale in the account, including by exercise or assignment, an expiring long option that reduces IML, and "any withdrawal of cash or securities from such account."
- **Intraday margin deficit:** for a day with an IML-reducing transaction, an amount "not less than the absolute value of the largest negative IML" after any of them.

The firm "shall require such intraday margin deficit to be satisfied as promptly as possible." It is **satisfied** if, "from the end of such day to the end of a subsequent day, the customer has made net deposits, or otherwise caused an increase in the account's IML, sufficient to equal such intraday margin deficit." It stays outstanding until satisfied or "immediately after the close of business on the fifteenth business day." A customer who "makes a practice of" failing to satisfy deficits promptly, and misses one by the close of the fifth business day, is restricted for 90 calendar days from creating or increasing a short position or debit balance, or until that deficit is satisfied, even if it has expired. Deficits no larger than the lesser of 5% of the account's equity or $1,000, and those from extraordinary circumstances, don't count toward a practice. Good faith and portfolio margin accounts are excluded from the calculation.

FINRA allows a firm to make a single calculation a day rather than monitor it in real time, and, under written policies: deposits in a member-operated FDIC-insured sweep program may count as a credit balance ([Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps#bank-sweep-programs)); deposits, withdrawals and closings of positions open at the start of the day may be treated as happening "immediately after the beginning of the day"; substantially contemporaneous legs of a spread or other strategy with a reduced requirement may be treated as simultaneous; and when the firm can't demonstrate which activity came first, the IML must be computed in the order "that results in the highest intraday margin deficit."

**Worked numbers, my own.** I use FINRA's 25% maintenance floor throughout to keep the arithmetic visible; a firm computing with its house rates gets a larger deficit. The account opens the day holding $40,000 of AAA with a $10,000 debit.

| Time | Transaction | Market value | Debit | Equity | Maintenance (25%) | IML |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Open | None | $40,000 | $10,000 | $30,000 | $10,000 | $20,000 |
| 9:40 | Buy $60,000 of BBB | $100,000 | $70,000 | $30,000 | $25,000 | $5,000 |
| 10:15 | Buy $40,000 of CCC | $140,000 | $110,000 | $30,000 | $35,000 | **−$5,000** |
| 11:30 | Sell BBB for $61,000 | $80,000 | $49,000 | $31,000 | $20,000 | $11,000 |
| 15:50 | Sell CCC for $39,500 | $40,000 | $9,500 | $30,500 | $10,000 | $20,500 |

The account closes the day with no maintenance deficiency at all, but its largest negative IML was −$5,000, so the **intraday margin deficit is $5,000**. It counts toward a practice: the lesser of 5% of equity ($1,525) and $1,000 is $1,000, below $5,000. To satisfy it, the account's end-of-day IML must rise by $5,000 from $20,500 by the end of a later day:

- a **$5,000** net deposit;
- a rise in AAA's value of **$6,666.67**, since each dollar of market value adds a dollar of equity and 25 cents of requirement, raising IML by 75 cents;
- or a sale of **$20,000** of AAA, which leaves equity unchanged and lowers the requirement by a quarter of the sale.

Under the old rule this was two day trades with $100,000 of purchases against $80,000 of day-trading buying power (4 × the $20,000 maintenance excess), a day-trading call; with the account's $30,000 of equity, the customer was also already above the $25,000 minimum. The new standard asks a different question, how far below maintenance did the account go, and it applies to a $2,000 account and a $2 million account alike.

The computation is a fold over the day's transactions in order, valuing the account after each IML-reducing one:

```go tab="Go"
// Snapshot is the account after one transaction, in USD cents.
type Snapshot struct {
	MarketValue int64 // long market value
	Debit       int64 // loan balance; negative for a credit
	Maintenance int64 // requirement under the rule, from the positions
	Reducing    bool  // an IML-reducing transaction
}

// IML is what could be withdrawn while still meeting maintenance.
func IML(s Snapshot) int64 {
	return s.MarketValue - s.Debit - s.Maintenance
}

// IntradayDeficit returns the largest negative IML after any IML-reducing
// transaction that day, as a positive amount; zero if there was none.
func IntradayDeficit(day []Snapshot) int64 {
	var deficit int64
	for _, s := range day {
		if v := IML(s); s.Reducing && -v > deficit {
			deficit = -v
		}
	}
	return deficit
}

// CountsTowardPractice applies the small-deficit exclusion: the lesser of
// 5% of equity or $1,000 (100,000 cents).
func CountsTowardPractice(deficit, equity int64) bool {
	floor := min(equity*5/100, 100_000)
	return deficit > floor
}
```

```rust tab="Rust"
/// The account after one transaction, in USD cents.
pub struct Snapshot {
    pub market_value: i64, // long market value
    pub debit: i64,        // loan balance; negative for a credit
    pub maintenance: i64,  // requirement under the rule, from the positions
    pub reducing: bool,    // an IML-reducing transaction
}

/// What could be withdrawn while still meeting maintenance.
pub fn iml(s: &Snapshot) -> i64 {
    s.market_value - s.debit - s.maintenance
}

/// The largest negative IML after any IML-reducing transaction that day,
/// as a positive amount; zero if there was none.
pub fn intraday_deficit(day: &[Snapshot]) -> i64 {
    day.iter()
        .filter(|s| s.reducing)
        .map(|s| -iml(s))
        .fold(0, i64::max)
}

/// The small-deficit exclusion: the lesser of 5% of equity or $1,000.
pub fn counts_toward_practice(deficit: i64, equity: i64) -> bool {
    deficit > (equity * 5 / 100).min(100_000)
}
```

Fed the table above, the 10:15 snapshot gives an IML of −500,000 cents and `IntradayDeficit` returns 500,000; `CountsTowardPractice(500_000, 3_050_000)` is true. The snapshots must be in the order the rule requires (deposits and opening-position closings first, unordered activity in the worst order), which is where the work is: the arithmetic is one line, the sequencing is a policy the firm writes down.

## Portfolio Margin

Portfolio margin replaces the strategy-by-strategy requirements with a risk-based one: the account's positions are valued under a range of price moves in the underlying, and the requirement is the worst loss, which for hedged books is far below the sum of the parts. FINRA Rule 4210(g) governs it, requires the firm's written risk analysis and procedures, and limits unlisted derivatives to accounts with at least $5 million of equity. The 2026 amendments added that the risk analysis must cover "determining and monitoring intraday risk," and that portfolio margin accounts with less than $5 million in equity must maintain margin for intraday risk; they are outside the intraday margin deficit calculation above. A system offering it needs a scenario engine with versioned parameters, the same price source as the rest of the ledger, and the ability to compute the requirement at the moments the rule now asks about, not only at the close.

## Short Selling and Regulation SHO

A short sale is a sale of shares the seller doesn't own, delivered with borrowed shares. Regulation SHO (17 CFR 242.200-204) puts three gates on it:

- **The locate (Rule 203(b)(1)).** A broker "may not accept a short sale order in an equity security from another person" unless it has borrowed the security, arranged to borrow it, or has "reasonable grounds to believe" it can be borrowed for delivery on the due date, and has documented that. Bona fide market making is excepted. The locate comes before the order is accepted, so it is a pre-trade check.
- **The close-out (Rule 204).** If a short sale fails to deliver at the clearing agency, the participant must close the fail "by no later than the beginning of regular trading hours on the settlement day following the settlement date," by borrowing or buying the shares (long sales and market making get until the third settlement day). If it doesn't, it and every broker clearing through it may not accept short sales in that security without pre-borrowing until the close-out purchase settles.
- **Threshold securities (Rule 203(b)(3)).** A security with fails of 10,000 shares or more for five consecutive settlement days, at least 0.5% of shares outstanding, and on an SRO's list, is a threshold security; a fail in one persisting for 13 consecutive settlement days must be closed out by buying.

Orders must also be marked long, short or short exempt (Rule 200(g)); the SEC's 2013 order against Knight Capital included violations of 200(g) and 203(b) alongside the market access rule. The short sale price test, Rule 201, which applies after a 10% decline, is a volatility control and is covered in [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts#trading-halts).

**Worked numbers: a short sale, my own.** A customer shorts 100 XYZ at $50.00 in a margin account. The stock is hard to borrow at a 25% annualized rate, about the level the SEC staff report gives for GME in January 2021.

- **Locate:** before the order is accepted, the firm's locate service confirms 100 shares available and records the source, quantity and time. At Alpaca a hard-to-borrow locate comes in round lots of 100 and can't be reused for a second order.
- **Reg T initial (150%):** proceeds of $5,000 stay in the account as a credit, and the customer must add 50%, $2,500, for a $7,500 credit balance.
- **Maintenance (4210(c)(3)):** the greater of $5.00 a share ($500) or 30% of market value ($1,500): **$1,500**. Equity is the credit minus the stock's value, $7,500 − $5,000 = $2,500.
- **The price that triggers a call:** $7,500 − 100P < 0.30 × 100P, so P > $7,500 ÷ 130 = **$57.69**, a 15.4% rise. A short's loss has no ceiling, and its cushion is measured in a rise far smaller than the fall that calls a long.
- **Borrow fee:** $5,000 × 25% ÷ 360 = **$3.47 a day**, the formula Alpaca and Robinhood both publish, on the day's largest short value at the end-of-day price. Over a weekend settlement it is three days, $10.42; over 30 days about $104, 2.1% of the position, which the stock must fall just to break even. Easy-to-borrow stocks cost nothing at Alpaca.
- **Dividends:** if XYZ pays a dividend while the customer is short, the customer pays it to the lender.
- **Recall:** if the lender recalls the shares and no others can be borrowed, the broker buys in; Robinhood's terms say it may close shorts "at any time and without notice."

## Hard to Borrow and Securities Lending

The shares a short seller borrows come from the broker's own margin customers (whose margin agreements let the broker lend them), from customers who opt into fully paid lending, and from other lenders through the stock loan market. The fee is set by supply and demand per security and changes daily; the SEC staff report put average lending fees at 1.5% between January 2007 and July 2018, and found securities with fees over 100% in only 0.01% of observations, while GME's cost to borrow exceeded 100% in the second quarter of 2020 and was around 25% in January 2021, with short interest reaching 109.26% of shares outstanding on December 31, 2020. Short interest above 100% is possible because lent shares are sold to buyers who can lend them again.

A broker running short selling therefore runs a **locate inventory** (what it can promise today, per security, consumed by each short order), a **borrow book** (each loan, its lender, rate, collateral and recall status, marked to market daily), and the **customer fee** derived from it. The revenue side, including fully paid lending's split with customers, is in [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#securities-lending).

## Crypto Margin and Borrowing

Crypto spot margin is a loan in the trading venue's own ledger, collateralized by the account's assets, with a margin level instead of a maintenance percentage and automatic liquidation instead of a call. There is no Reg T and no FINRA 4210 for it; the rules are the venue's terms. Robinhood keeps crypto out of its securities margin entirely ("Crypto holdings are not factored in when issuing margin calls"), because crypto isn't a security, and it sits at a different legal entity than the margin loan.

**Worked numbers, my own, ignoring fees and interest.** At Kraken, a customer with $10,000 opens a 5x long of $30,000 of bitcoin. Used margin is $30,000 ÷ 5 = $6,000; equity is $10,000; margin level 166.7%.

| BTC move | Equity | Margin level | What Kraken's terms say happens |
| ---: | ---: | ---: | --- |
| 0% | $10,000 | 166.7% | Normal |
| −13.3% | $6,000 | 100% | No new margin positions |
| −17.3% | $4,800 | 80% | Positions may be forcibly closed |
| −25.3% | $2,400 | 40% | Liquidation certain, with a 2% liquidation fee |

At Binance under Cross Margin Classic at 3x, a customer with 10,000 USDT who borrows 20,000 USDT to buy BTC has 30,000 of collateral against 20,000 of liabilities, a margin level of 1.5. A 13.3% fall brings collateral to 26,000 and the level to 1.3, the margin call band; a 26.7% fall brings it to 22,000 and 1.1, liquidation. Compare the securities account above, which reached a call only after a 46% fall: the crypto thresholds are tighter because the assets move faster and the venue, open around the clock, will not wait three business days for a deposit.

Leveraged derivatives (perpetual futures, funding rates, insurance funds, auto-deleveraging) are in [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives), listed futures margin, a performance bond settled daily, in [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#margin-and-daily-settlement), and institutional crypto credit and its 2022 failures in [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending), all later in this book.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`accounts` with the `margin` capability, `positions`, `instruments`, `journal_lines`, `orders`, `cases`) and against `buying_power_snapshots` and `balance_holds` from [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it). This chapter adds the requirement rules, margin calls, intraday margin deficits, locates and stock loans.

```sql
CREATE TABLE margin_requirements (          -- the rule and house rates, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  source             TEXT NOT NULL CHECK (source IN ('reg_t', 'finra_4210', 'house', 'venue')),
  side               TEXT NOT NULL CHECK (side IN ('long', 'short')),
  kind               TEXT NOT NULL CHECK (kind IN ('initial', 'maintenance')),
  instrument_id      UUID REFERENCES instruments (id),     -- a per-security override, or NULL
  price_from         NUMERIC(18, 6),                       -- the price band it applies to
  price_to           NUMERIC(18, 6),
  rate               NUMERIC(7, 4) NOT NULL,                -- 0.3000 = 30% of market value
  per_share_floor    NUMERIC(18, 6),                       -- $5.00 for short stock at $5 or more
  valid_during       TSTZRANGE NOT NULL,
  reason             TEXT                                  -- a house change: volatility, concentration
);

CREATE TABLE margin_calls (                 -- one call, its clock and how it ended
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  call_type          TEXT NOT NULL CHECK (call_type IN ('reg_t', 'maintenance', 'house',
                       'intraday_deficit')),
  amount             BIGINT NOT NULL CHECK (amount > 0),   -- USD cents
  snapshot_ref       UUID NOT NULL,                        -- the buying power snapshot that found it
  state              TEXT NOT NULL CHECK (state IN ('detected', 'issued', 'met', 'liquidating',
                       'liquidated', 'expired')),
  issued_at          TIMESTAMPTZ,
  due_at             TIMESTAMPTZ NOT NULL,                 -- the firm's deadline, within the rule's
  met_by             TEXT CHECK (met_by IN ('deposit', 'price', 'liquidation', 'extension')),
  closed_at          TIMESTAMPTZ,
  case_id            UUID REFERENCES cases (id)
);

CREATE TABLE liquidation_orders (           -- what was sold to meet a call, and why
  margin_call_id     UUID NOT NULL REFERENCES margin_calls (id),
  order_id           UUID NOT NULL REFERENCES orders (id),
  policy_version     TEXT NOT NULL,                        -- the selection policy applied
  rank               INT NOT NULL,                         -- order in the selection
  PRIMARY KEY (margin_call_id, order_id)
);

CREATE TABLE intraday_margin_deficits (     -- Rule 4210(d)(2), one per account per day
  account_id         UUID NOT NULL REFERENCES accounts (id),
  business_date      DATE NOT NULL,
  deficit            BIGINT NOT NULL CHECK (deficit > 0),  -- USD cents
  worst_at_seq       BIGINT NOT NULL,                      -- the transaction after which IML was lowest
  end_of_day_iml     BIGINT NOT NULL,                      -- the base later increases are measured from
  equity_at_eod      BIGINT NOT NULL,
  counts_toward_practice BOOLEAN NOT NULL,                 -- above the lesser of 5% of equity or $1,000
  satisfied_on       DATE,
  expires_after      DATE NOT NULL,                        -- close of the 15th business day
  fifth_day          DATE NOT NULL,                        -- the practice test's deadline
  restriction_until  DATE,                                 -- 90 calendar days, if imposed
  policy_version     TEXT NOT NULL,                        -- the sequencing and sweep policies used
  PRIMARY KEY (account_id, business_date)
);

CREATE TABLE locates (                      -- Reg SHO 203(b)(1), before the order
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  quantity           NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  basis              TEXT NOT NULL CHECK (basis IN ('borrowed', 'arranged', 'reasonable_grounds')),
  source             TEXT NOT NULL,                        -- easy-to-borrow list, lender, inventory
  borrow_rate        NUMERIC(9, 6),                        -- annualized, quoted at the locate
  obtained_at        TIMESTAMPTZ NOT NULL,
  valid_until        TIMESTAMPTZ NOT NULL,
  consumed_by        UUID REFERENCES orders (id),          -- one order; not reusable
  CHECK (consumed_by IS NULL OR obtained_at IS NOT NULL)
);

CREATE TABLE stock_loans (                  -- the borrow book
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  direction          TEXT NOT NULL CHECK (direction IN ('borrow', 'lend')),
  counterparty       TEXT NOT NULL,                        -- a lender, borrower or the firm's own customers
  quantity           NUMERIC(78, 0) NOT NULL,
  rate               NUMERIC(9, 6) NOT NULL,                -- annualized fee or rebate
  collateral         BIGINT NOT NULL,                      -- USD cents, marked daily
  opened_on          DATE NOT NULL,
  recalled_on        DATE,
  returned_on        DATE
);
```

Design notes:

- **Requirements are data with validity ranges.** A house rate raised for a volatile stock at 10:02 is a new row, and every computation records which rows it used, so a liquidation can be explained against the rule in force at the time.
- **One function computes equity, requirement and IML** from a ledger snapshot and the requirement rows, and buying power, calls and intraday deficits all call it. Two implementations will disagree on the day it matters.
- **Calls are state machines with the firm's clock,** advanced by deposits, price updates and liquidations ([Explicit State Machines](/docs/money/payment-states#explicit-state-machines)); an `expired` intraday deficit can still hold a restriction open, so the restriction is its own date, not a derived state.
- **The intraday calculation stores its sequencing.** The policy version, the order the transactions were applied in and the point of the worst IML are what an examiner asks about, and the rule makes the worst-case order the default when the order is unknown.
- **A locate is consumed once,** linked to the order it permitted and rejected if expired; the short sale's settlement watches for a fail and starts the Rule 204 clock on the settlement date.
- **Borrow fees accrue daily from positions,** at the day's largest short value and the end-of-day price, posted as fee lines ([How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#how-to-build-it)), with the 360-day convention stored, not assumed.

## Auditing

Margin and short-sale records are among the most examined at a broker-dealer. Keep:

- **Every requirement version** with its validity and reason, and every account computation (equity, requirement, IML, buying power) that gated an order, a withdrawal or a call.
- **Every call:** type, amount, how it was found, when the customer was told and how, the due time, how it ended, and every liquidation order with the selection policy that chose it.
- **Every intraday margin deficit,** its sequencing policy, its satisfaction or expiry, the practice determination, and any 90-day restriction with its start and end.
- **Every locate** with its basis, source and the order it permitted; every short-sale order's marking; every fail, its Rule 204 deadline and its close-out.
- **The borrow book and fees** charged to customers, reconcilable to the loans that produced them.
- **Margin disclosures and agreements** delivered before the first extension of credit ([Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals)).

## What This Means for the System You Build

- **Compute equity and requirement in one place,** from the ledger and versioned rule and house rows, and use it for buying power, calls and the intraday deficit.
- **Treat a call as a state machine with a deadline the firm sets** inside the rule's 15 business days, and record what satisfied it.
- **Liquidate by a written, deterministic policy** and remember that selling to meet a call takes several times the call.
- **Replace pattern day trader logic** with the intraday margin deficit: a once-a-day computation in a documented order, a 15-business-day life, and the fifth-day practice test.
- **Gate every short sale on a locate** consumed by one order, and watch every short's settlement for a fail.
- **Accrue borrow fees daily** from the borrow book and show customers the rate before they sell.
- **Keep crypto margin separate,** on the venue's margin level and liquidation thresholds, and never let it net against a securities margin account at another entity.

## References

**Law and regulation**

- [12 CFR 220.12: Supplement: margin requirements](https://www.law.cornell.edu/cfr/text/12/220.12), 50% initial for margin equity securities and 150% for short sales of nonexempted equity securities
- [12 CFR 220.4: Margin account](https://www.law.cornell.edu/cfr/text/12/220.4), calls on transaction days, satisfaction within one payment period, liquidation, and no action needed at $1,000 or less
- [17 CFR 242.203: Borrowing and delivery requirements](https://www.law.cornell.edu/cfr/text/17/242.203), the locate, its exceptions, threshold securities and the 13-day close-out
- [17 CFR 242.204: Close-out requirement](https://www.law.cornell.edu/cfr/text/17/242.204), closing out fails by the open of the settlement day after settlement, and the pre-borrow penalty

**Regulators and guidance**

- [FINRA Rule 4210: Margin Requirements](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4210), maintenance at 25% long and the short stock floors, the IML definitions and paragraph (d)(2), the 15 business days of (f)(6), and portfolio margin's $5 million thresholds
- [FINRA Regulatory Notice 26-10: Intraday Margin Standards](https://www.finra.org/rules-guidance/notices/26-10), approval in Release No. 34-105226, effective June 4, 2026 with phase-in to October 20, 2027, the removal of the pattern day trader rules, the single daily calculation and its permitted policies, the fifth-day practice test and 90-day restriction, and intraday risk for portfolio margin
- [SEC: Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), Reg T and maintenance in footnote 94 and selling without consent, lending fees for GME and on average, and short interest of 109.26%

**Courts and enforcement**

- [SEC: Knight Capital charged with violating the market access rule (Press Release 2013-222, October 16, 2013)](https://www.sec.gov/news/press-release/2013-222), violations of Regulation SHO Rules 200(g) and 203(b) alongside Rule 15c3-5

**Vendor documentation**

- [Alpaca: Margin and short selling](https://docs.alpaca.markets/docs/margin-and-short-selling), house maintenance tables, margin interest rates, next-morning calls and liquidation, easy- and hard-to-borrow locates and the daily borrow fee formula (last updated September 17, 2026)
- [Alpaca: Account API](https://docs.alpaca.markets/reference/getaccount-1), the former day-trading buying power formula
- [Robinhood: Margin calls](https://robinhood.com/us/en/support/articles/margin-calls/), maintenance calls and their causes, crypto excluded, and closing positions with or without approval
- [Robinhood: Short selling](https://robinhood.com/us/en/support/articles/short-selling/), margin account and $2,000 minimum, the borrow fee formula, buy-ins and closing without notice
- [Kraken: Margin trading overview](https://support.kraken.com/hc/en-us/articles/203325763-Margin-trading-overview), the margin call level near 80%, liquidation at 40% margin health with a 2% fee, first in first out (last updated October 1, 2026)
- [Kraken: Margin level](https://support.kraken.com/articles/203325753), the margin level formula, 100%, 80% and 40% thresholds and 20:1 maximum leverage (last updated August 11, 2026)
- [Binance: Margin level](https://www.binance.com/en/support/faq/what-is-margin-level-and-how-is-it-calculated-360030493931), the Cross Margin Classic and isolated formulas and the 3x and 5x call and liquidation levels (last updated September 28, 2026)

**In practice**

- [Robinhood Markets: Q4 2025 results (February 10, 2026)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000013/q42025robinhoodexhibit991.htm), the short selling rollout from November 2025
