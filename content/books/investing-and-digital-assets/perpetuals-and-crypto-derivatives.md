+++
title = "Perpetuals & Crypto Derivatives"
nav_title = "Perpetuals & Derivatives"
description = "Perpetual futures end to end: index and mark prices, funding, margin modes, liquidation, insurance funds, ADL, the October 10, 2025 cascade and US access."
category = "Investing & Digital Assets Industry"
order = 2547
part = "Crypto Exchanges"
tags = ["crypto", "derivatives", "perpetuals", "funding-rates", "liquidation", "margin", "risk"]
+++

Most crypto trading is not spot trading. Coinbase reported $963.0 billion of crypto derivatives volume in the third quarter of 2026 against $134.5 billion of crypto spot, about seven to one (my arithmetic), after buying the options exchange Deribit, and the offshore venues that dominate the market were built around one product: the perpetual future. A perpetual is a futures contract that never expires. Instead of converging to spot at an expiry date, it is pulled toward spot every few hours by a funding payment between longs and shorts, and the venue protects itself from traders who lose more than their margin with a liquidation engine, an insurance fund and, as a last resort, auto-deleveraging that closes winning positions on the other side. Every one of those is a computation the venue runs continuously, for every account, at a price it chooses, and each was tested at once on October 10, 2025, when more than $19 billion of leverage was liquidated in about a day.

This chapter covers the contract and the three prices behind it, the funding computation with a worked payment, margin modes and a worked liquidation price under isolated margin, liquidation engines, insurance funds and auto-deleveraging with a worked ranking, the October 10, 2025 cascade, options venues, how US customers reach these products, and on-chain perpetuals. It extends `instruments`, `positions` and `accounts` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Listed futures, FCMs and customer segregation are [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms); securities margin and crypto lending at a broker are [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling); venue circuit breakers are [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts); the price feeds a mark is built from are [Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks).

## How the Platforms Do It

How venues that publish their mechanics run perpetuals, as of November 2026:

| Venue | Funding | Margin and liquidation | Last resort |
| --- | --- | --- | --- |
| **Binance** (USDⓈ-M futures) | Every 8 hours by default (00:00, 08:00, 16:00 UTC); interest component 0.03% a day; ±0.05% clamp; cap and floor of ±0.75 × the maintenance margin ratio on listed majors, ±2% on others | Cross and isolated; maintenance margin by notional tier with a maintenance amount (cumB) per tier | Insurance fund, then auto-deleveraging ranked by profit and leverage, closed at the bankrupt trader's price with no fee |
| **Hyperliquid** (on-chain order book) | Hourly at one-eighth of an 8-hour rate; interest 0.01% per 8 hours; premium sampled every 5 seconds; capped at 0.5% an hour; paid on oracle notional | Maintenance margin is half the initial margin at maximum leverage (1.25% to 16.7%); a mark blending external prices and the book; positions over 100,000 USDC liquidate in 20% slices | A liquidator vault inside its HLP market-making vault takes positions whose equity falls below two-thirds of maintenance |
| **Coinbase** (Deribit, International Exchange) | Venue-specific; Deribit acquired August 14, 2025 for $4.3 billion; INTX and Deribit integration completed in October 2026 | Not detailed in its filings | Not detailed in its filings |

The designs converge on the same shape: an index from spot venues, a mark derived from it that drives margin and liquidation, a funding payment that pays whoever is on the side the market is short of, and a waterfall (the trader's margin, then the insurance fund or a backstop vault, then other traders) that decides who absorbs a loss bigger than the margin.

## What a Perpetual Is

A dated future has a final settlement: at expiry its price becomes the spot price by rule, so arbitrage keeps it close before then. A perpetual has no expiry and no delivery. A long position of 2 BTC in a BTC-USDT perpetual is a promise to settle the difference in price between entry and exit, in the margin asset, whenever the trader closes; meanwhile the trader pays or receives funding. The position never touches a chain and never holds a bitcoin: it is a row in the venue's ledger, collateralized by stablecoins or crypto in the trader's margin account, and its profit or loss is a journal entry in that collateral.

Three kinds of perpetual differ in what the margin and the profit are paid in:

- **Linear (USDⓈ-margined).** Margin and profit are in a stablecoin; a 1 BTC contract gains $1 per $1 the price rises. Most volume.
- **Inverse (coin-margined).** Margin and profit are in the base asset (BTC for a BTC-USD contract), so a long's collateral falls in value as the position loses: losses compound. Binance's ADL page notes that coin-margined contracts sharing a collateral asset draw on a smaller insurance fund, so auto-deleveraging is more likely there.
- **Quanto.** Profit in a third asset; rare, and I'd leave it out of a first build.

## Index, Mark and Last Price

A perpetual venue keeps three prices per contract, and confusing them is how a venue liquidates the wrong people:

- **Index price.** An average of spot prices on other venues. Binance defines it as "the weighted average value of the underlying asset listed on major spot exchanges." It is the anchor funding pulls toward.
- **Mark price.** The price margin, unrealized profit and liquidation are computed from. It starts from the index and adds a damped measure of the perpetual's own premium, so one aggressive order on a thin book can't liquidate everyone. Hyperliquid's "combines external CEX prices with Hyperliquid's book state," and its docs warn that mark "can differ significantly from book price" in volatile markets.
- **Last price.** The latest trade on the venue's own book. Displayed, never used for margin.

My rule: liquidation runs on mark, mark is built from many venues weighted by liquidity, every input has an outlier filter, and every mark the engine used is stored with its inputs so a disputed liquidation can be replayed. The index methodology is the same problem as a portfolio mark ([A Mark Methodology](/books/investing-and-digital-assets/chain-data-and-indexing#a-mark-methodology)), with a tighter clock.

## Funding Rates

Funding is a periodic transfer between longs and shorts, not a fee to the venue (Binance: funding passes directly between opposing positions). When the perpetual trades above the index, longs pay shorts, which makes holding long more expensive and pulls the price down; below the index, shorts pay longs.

### The formula

Both Binance and Hyperliquid use the same structure. First a premium index from the order book, sampled every 5 seconds:

```text
premium = [ max(0, impact_bid − index) − max(0, index − impact_ask) ] / index
```

The impact bid and ask are the average prices to fill a set notional on each side (Binance's impact margin notional is 200 USDT divided by the initial margin rate at maximum leverage), so the premium reflects depth, not just the top of the book. Then, per interval:

```text
funding_rate = avg_premium + clamp(interest − avg_premium, −0.05%, +0.05%)
```

The interest component is the cost of borrowing the quote asset against the base: 0.03% a day on Binance, which is 0.01% per 8-hour interval, and the same 0.01% per 8 hours on Hyperliquid. The clamp means that when the average premium sits between −0.04% and +0.06%, the rate is exactly 0.01%. Binance's own worked example: an 8-hour time-weighted premium of 0.0429% gives a clamp term of 0.01% − 0.0429% = −0.0329%, inside the band, so the rate is 0.0429% − 0.0329% = 0.0100%. On top sit caps: Binance's ±0.75 times the maintenance margin ratio for listed majors and ±2% for others; Hyperliquid's 0.5% an hour.

### A worked payment

The payment is the position's notional times the rate, where the notional is size times a price: mark price on Binance, oracle price on Hyperliquid. My example, at Binance's 8-hour interval:

```text
position         long 2 BTC, BTCUSDT perpetual
mark at 08:00    $100,000.00           notional = 2 × 100,000 = $200,000.00

rate 0.0100%     long pays   200,000 × 0.000100 = $20.00 to shorts
rate 0.0274%     long pays   200,000 × 0.000274 = $54.80     (about 30% a year: 0.0274% × 3 × 365)
rate −0.0150%    long receives 200,000 × 0.000150 = $30.00 from shorts

Hyperliquid, same notional, interest component only:
hourly rate      0.01% / 8 = 0.00125%   200,000 × 0.0000125 = $2.50 an hour, $20.00 per 8 hours
hourly cap       0.5%                   200,000 × 0.005     = $1,000.00 an hour at most
```

The 30% line is not hypothetical: FTI Consulting's review of October 2025 found funding had "climbed from around 10% annualized to nearly 30% by October 6," four days before the cascade. Funding at that level is the market telling the venue that longs are crowded, and it is the input a risk team should watch.

Engineering notes for the funding run:

- **Snapshot, then pay.** The positions and the price are fixed at the funding timestamp, and every payment for that interval comes from the same snapshot, in one batch of balanced journal entries: each long's collateral line debited, each short's credited, summing to zero per contract (a zero-sum the venue can check before commit). A position opened one second after the timestamp pays nothing for that interval.
- **Units and rounding.** Rates are stored as exact decimals; amounts are integer smallest units of the collateral asset ([Integer Minor Units](/docs/money/amounts#integer-minor-units)). Rounding each payment toward the venue leaves a residual per interval, which goes to a named firm account rather than disappearing.
- **Idempotent by interval.** The key is (contract, funding timestamp), so a rerun after a crash posts nothing twice.
- **A changed interval is a rule change.** Binance can shorten the interval in extreme conditions; the interval, cap and interest component are versioned rules with effective times ([Rules as Data](/docs/building-blocks/rules-as-data)).

## Margin Modes

A margin mode decides which collateral stands behind which position, and so what one bad position can take with it:

- **Isolated.** Each position has its own margin, set when it is opened. Liquidating it takes only that margin; the rest of the account is untouched. Hyperliquid: "that isolated position and isolated margin are transferred to the liquidator," and the user's cross positions are unaffected.
- **Cross.** All cross positions share the account's cross collateral; a profit on one supports another. Liquidation can take the lot: Hyperliquid transfers "the trader's cross positions and cross margin" to the liquidator.
- **Unified or portfolio margin.** Cross margin extended across collateral assets (stablecoins, BTC, ETH, other tokens, each with a haircut) and sometimes across spot, perpetuals and options. Efficient in calm markets; FTI's review of October 10: "the same design ties portfolios to their weakest assets."

### A worked liquidation price under isolated margin

Hyperliquid publishes the formula:

```text
liq_price = price − side × margin_available / position_size / (1 − l × side)

side              1 for long, −1 for short
l                 1 / maintenance leverage
margin_available  isolated margin − maintenance margin required
```

My example, on an asset whose maximum leverage is 40x, so maintenance margin is half the initial margin at 40x: 1/40 ÷ 2 = 1.25%, maintenance leverage 80, l = 0.0125:

```text
open             long 1 BTC at $100,000.00, 10x isolated → isolated margin $10,000.00
maintenance      1.25% × 100,000 = $1,250.00
margin_available 10,000 − 1,250 = $8,750.00

liq_price = 100,000 − 1 × 8,750 / 1 / (1 − 0.0125)
          = 100,000 − 8,860.76
          = $91,139.24

check at $91,139.24:
  equity          10,000 − (100,000 − 91,139.24) = $1,139.24
  maintenance     1.25% × 91,139.24              = $1,139.24   equity = maintenance: liquidate

bankruptcy price (equity zero)   100,000 − 10,000 = $90,000.00
```

The gap between $91,139.24 and $90,000.00 is the venue's buffer: if the engine can close the position on the book anywhere above the bankruptcy price, nobody else pays. Below it, the loss is bigger than the margin and the waterfall starts. Venues differ on what happens to the buffer: Hyperliquid's docs say collateral left after a book liquidation stays with the trader, while in a backstop liquidation "the maintenance margin is not returned." The same position under cross margin has no fixed liquidation price: it moves with every other position and every collateral price in the account, which is why a cross account's liquidation price on screen is an estimate the venue recomputes continuously (Binance's formula for cross mode carries the other contracts' maintenance and unrealized profit, TMM and UPNL, which are zero in isolated mode).

## Liquidation

The engine checks every account against maintenance margin at every mark update, and when equity falls to maintenance it acts in a fixed order:

1. **Cancel the account's open orders** to release the margin they reserve.
2. **Close on the book.** Hyperliquid first sends market orders to the book; above 100,000 USDC, only 20% of the position is sent, followed by a 30-second cooldown, so a large liquidation doesn't sweep the book in one print.
3. **Backstop.** If book liquidation fails and equity falls further (below two-thirds of maintenance on Hyperliquid), a backstop takes the position at the mark: Hyperliquid's liquidator vault, or the venue's insurance fund on centralized venues.
4. **Socialize.** If the backstop can't absorb the loss, auto-deleveraging closes opposing positions.

Engineering consequences: the engine is part of the matching path (a liquidation order is an order, sequenced like any other; [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) has the engine's design), its inputs are marks rather than trades, and it has to keep working when the book is empty, which is exactly when it is needed.

## Insurance Funds and Auto-Deleveraging

### The insurance fund

An insurance fund is the venue's own pool, funded by liquidation surpluses (the buffer above the bankruptcy price on centralized venues that keep it) and sometimes topped up by the venue, which pays the loss when a liquidation fills below the bankruptcy price. It is a ledger account per collateral asset, and its balance is the venue's real capacity to absorb a crash: a fund in USDT does not cover a coin-margined contract's BTC losses.

### Auto-deleveraging

When the fund can't cover a bankrupt position, the venue closes profitable positions on the other side at the bankrupt trader's bankruptcy price. Binance's ranking:

```text
PnL%                = unrealized profit / abs(position notional)
effective leverage  = abs(position notional) / (account balance + unrealized profit)

ranking = PnL% × effective leverage     if PnL% ≥ 0
ranking = PnL% / effective leverage     if PnL% < 0
```

"Positions that are more profitable and more highly leveraged will be queued for ADL liquidation first," at the bankruptcy price, with no trading fee. A worked queue of my own: a short of $300,000 notional has gone bankrupt, the fund can't absorb it, and three longs are open:

| Long | Notional | Unrealized profit | Balance | PnL% | Effective leverage | Ranking |
| --- | --- | --- | --- | --- | --- | --- |
| A | $500,000 | $50,000 | $50,000 | 10% | 500,000 / 100,000 = 5.0 | 0.50 |
| B | $200,000 | $40,000 | $10,000 | 20% | 200,000 / 50,000 = 4.0 | 0.80 |
| C | $1,000,000 | $20,000 | $480,000 | 2% | 1,000,000 / 500,000 = 2.0 | 0.04 |

The engine closes B in full ($200,000), then $100,000 of A, and stops; C is untouched. B and A are made whole on their profit to the bankruptcy price but lose the position: if either was hedged elsewhere, the hedge is now naked. That is what happened to well-hedged traders on October 10.

The venue should show each position's queue rank (Binance's interface shows an indicator per position) and must store each ADL event with the bankrupt position, the ranking snapshot and every position it closed, because these are the closures customers dispute.

## October 10, 2025

FTI Consulting's review gives the sequence. A threatened 100% tariff on China hit risk assets on Friday, October 10, 2025, and crypto took the worst of it: "more than $19 billion of crypto leverage was liquidated in roughly a day." The setup was in the data beforehand (funding near 30% annualized, elevated open interest in BTC and ETH perpetuals). Then the mechanisms in this chapter interacted:

- **Liquidity vanished.** BTC top-of-book depth fell "by more than 90% on key venues," and spreads went "from single-digit basis points to double-digit percentages." Liquidation orders sent to the book filled far below the mark, past bankruptcy prices, draining insurance funds.
- **A local mark priced collateral.** USDe, Ethena's synthetic dollar, "traded in the mid-$0.60s on Binance," a discount of about 35%, while it stayed near $1 elsewhere; Binance's own price fed its margin systems, so unified-margin accounts holding USDe as collateral were liquidated though they were solvent at cross-venue prices. An account with $1,000,000 of USDe collateral lost $350,000 of margin value at $0.65 without any of its positions moving (my arithmetic).
- **ADL broke hedges.** "ADL can involuntarily close profitable shorts," and on the day some well-hedged shorts were reduced or closed, leaving portfolios exposed.
- **Aftermath.** Two months later, open interest was down more than 40% from October highs, and several venues had tightened leverage caps, raised haircuts on fragile collateral and moved toward multi-venue oracle pricing.

FTI's lessons are design rules: multi-venue, liquidity-weighted oracles with outlier controls; stress tests in which depth falls 90%; liquidation engines tested against "short, violent dislocations"; and margin logic, haircuts and ADL triggers documented publicly. My additions: a collateral asset's mark should never come from the venue's own book alone, a haircut schedule should assume a stablecoin can trade at a discount for an hour, and the ADL rules a customer agreed to are a disclosure the venue stores by version. [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars#synthetic-dollars-ethena-s-usde) covers USDe's design.

## Options and Deribit

Crypto options are mostly European-style, cash-settled options on BTC and ETH, traded on a handful of venues, of which Deribit has long been the largest. Coinbase acquired Deribit (Sentillia B.V.) on August 14, 2025 for $4.3 billion, $721.5 million in cash and $3.57 billion in Class A stock, and its third quarter 2026 deck cites "leading open interest in global options" and says the INTX and Deribit integration completed in October. An options book adds what this chapter's perpetuals don't need: a volatility surface to mark options without trades, portfolio margin across strikes and expiries, and expiry processing. The contract mechanics and the assignment and expiration machinery are the same as listed options in [Options](/books/investing-and-digital-assets/options-trading); the risk engine is the portfolio margin of [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling) with 24/7 marks.

## US Access

Offshore perpetual venues generally exclude US persons, and the reason is enforcement. The CFTC's November 21, 2023 order against Binance found it "offered and executed commodity derivatives transactions to and for U.S. persons beginning in July 2019" while "failing to register with the CFTC in numerous required capacities," naming the futures commission merchant, foreign board of trade, designated contract market and swap execution facility roles, with $1.35 billion of disgorgement, a $1.35 billion penalty and a $150 million penalty against its founder. A futures product for US retail customers goes through a CFTC-registered DCM and clears through a DCO, and customers reach it through an FCM that segregates their funds ([Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#the-parties) covers the structure). Coinbase's deck says its Q4 2026 relaunch of Coinbase Pro will offer "spot, futures, perpetuals, options, and equities in a unified portfolio," without US-specific terms. On shore, Coinbase's 2025 10-K describes Coinbase Derivatives Exchange as a DCM listing dated and perpetual-style futures, and the CFTC's policy statement of May 29, 2026 (91 FR 33160) accompanied an order letting a DCM list a perpetual contract on the spot price of bitcoin as a futures contract (the statement's footnote names it as KalshiEX's BTCPERP), with case-by-case review under Regulation 40.3 for other asset classes ([Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#crypto-futures-in-the-us) has both). On October 13, 2026 the CFTC followed with an advance notice of proposed rulemaking on crypto asset transactions and markets under the retail commodity provision, section 2(c)(2)(D) (91 FR 64811, comments due December 14, 2026); as of November 2026 it is a request for comment, not a rule ([The CFTC and the Spot Market](/books/investing-and-digital-assets/securities-or-commodities#the-cftc-and-the-spot-market)). I haven't opened a DCM's contract specification for their funding mechanics, so the mechanics above are the offshore ones.

## On-Chain Perpetuals

Hyperliquid runs a full order book on its own chain, so the mechanics above (funding, mark, liquidation, backstop) are public rules executed by validators rather than an exchange's private code. Two differences matter to a platform that integrates one. The backstop is a vault anyone can deposit into (HLP), so the insurance fund's risk is borne by depositors who chose it, and the oracle is part of the chain's consensus rather than a vendor feed. And a customer's position is visible on chain, which helps disputes and hurts liquidation hunting: a public liquidation price is a target. A regulated platform offering access to an on-chain perpetual venue to its customers takes on the same screening and disclosure questions as any other DeFi access ([DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform)), and the venue's liquidation engine is a smart contract or chain rule with its own failure modes ([Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk)).

## How to Build It

A perpetual is an `instruments` row of type `future` with a contract row saying it never expires; positions gain the derivative fields that the ledger alone doesn't carry (entry price, margin mode, isolated margin), all derived from journal entries like the rest of `positions`. Marks, funding, liquidations, the insurance fund and ADL each get a table, because each is a computation a customer can dispute and a regulator can ask to replay.

```sql
CREATE TABLE perp_contracts (              -- one row per perpetual instrument
  instrument_id        UUID PRIMARY KEY REFERENCES instruments (id),  -- instrument_type 'future'
  venue_id             UUID NOT NULL REFERENCES venues (id),
  underlying_id        UUID NOT NULL REFERENCES instruments (id),     -- BTC
  margin_instrument_id UUID NOT NULL REFERENCES instruments (id),     -- USDT, or BTC if inverse
  kind                 TEXT NOT NULL CHECK (kind IN ('linear', 'inverse', 'quanto')),
  contract_size        NUMERIC(38, 18) NOT NULL,      -- underlying units per contract
  max_leverage         NUMERIC(8, 2) NOT NULL,
  funding_interval     INTERVAL NOT NULL,             -- '8 hours', '1 hour'
  funding_rules        JSONB NOT NULL,                -- interest, clamp, cap, floor, impact notional
  margin_tiers         JSONB NOT NULL,                -- notional bands: MMR and maintenance amount
  rules_version        INT NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('active', 'reduce_only', 'settled', 'delisted'))
);

ALTER TABLE positions                      -- still derived from journal_lines and executions
  ADD COLUMN margin_mode       TEXT CHECK (margin_mode IN ('cross', 'isolated', 'portfolio')),
  ADD COLUMN avg_entry_price   NUMERIC(38, 18),
  ADD COLUMN isolated_margin   NUMERIC(78, 0);        -- smallest units of the margin instrument

CREATE TABLE mark_prices (                 -- every price margin was computed from
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  at                   TIMESTAMPTZ NOT NULL,
  index_price          NUMERIC(38, 18) NOT NULL,
  mark_price           NUMERIC(38, 18) NOT NULL,
  inputs               JSONB NOT NULL,                -- venue prices, weights, outliers dropped
  methodology_version  INT NOT NULL,
  PRIMARY KEY (instrument_id, at)
);

CREATE TABLE funding_rates (               -- one per contract per interval
  instrument_id        UUID NOT NULL REFERENCES perp_contracts (instrument_id),
  funding_at           TIMESTAMPTZ NOT NULL,
  avg_premium          NUMERIC(18, 10) NOT NULL,
  interest             NUMERIC(18, 10) NOT NULL,
  rate                 NUMERIC(18, 10) NOT NULL,      -- after clamp and cap; signed
  price_used           NUMERIC(38, 18) NOT NULL,      -- mark or oracle, per the rules
  rules_version        INT NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('computed', 'paid')),
  PRIMARY KEY (instrument_id, funding_at)
);

CREATE TABLE funding_payments (
  instrument_id        UUID NOT NULL,
  funding_at           TIMESTAMPTZ NOT NULL,
  account_id           UUID NOT NULL REFERENCES accounts (id),
  position_size        NUMERIC(78, 0) NOT NULL,       -- signed, at the snapshot
  amount               NUMERIC(78, 0) NOT NULL,       -- signed: positive received
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  PRIMARY KEY (instrument_id, funding_at, account_id),
  FOREIGN KEY (instrument_id, funding_at) REFERENCES funding_rates (instrument_id, funding_at)
);

CREATE TABLE liquidations (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  instrument_id        UUID REFERENCES instruments (id),  -- null: whole cross account
  margin_mode          TEXT NOT NULL,
  trigger_mark_at      TIMESTAMPTZ NOT NULL,          -- the mark_prices row that triggered it
  equity_at_trigger    NUMERIC(78, 0) NOT NULL,
  maintenance_required NUMERIC(78, 0) NOT NULL,
  bankruptcy_price     NUMERIC(38, 18) NOT NULL,
  stage                TEXT NOT NULL CHECK (stage IN ('orders_canceled', 'book', 'partial',
                         'backstop', 'adl', 'completed')),
  shortfall            NUMERIC(78, 0) NOT NULL DEFAULT 0,  -- loss beyond the margin
  started_at           TIMESTAMPTZ NOT NULL,
  completed_at         TIMESTAMPTZ
);

CREATE TABLE insurance_fund_entries (      -- the fund is a ledger account; this is its reasons
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  margin_instrument_id UUID NOT NULL REFERENCES instruments (id),
  liquidation_id       UUID REFERENCES liquidations (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('surplus', 'shortfall_paid', 'topup',
                         'withdrawal')),
  amount               NUMERIC(78, 0) NOT NULL,       -- signed
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id)
);

CREATE TABLE adl_events (                  -- each position closed to cover a shortfall
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  liquidation_id       UUID NOT NULL REFERENCES liquidations (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  ranking              NUMERIC(18, 8) NOT NULL,       -- as computed at the snapshot
  queue_position       INT NOT NULL,
  quantity_closed      NUMERIC(78, 0) NOT NULL CHECK (quantity_closed > 0),
  price                NUMERIC(38, 18) NOT NULL,      -- the bankrupt position's bankruptcy price
  execution_id         UUID NOT NULL REFERENCES executions (id),
  UNIQUE (liquidation_id, queue_position)
);
```

The liquidation states, per account or isolated position:

| From | Event | To |
| --- | --- | --- |
| (healthy) | Equity at mark reaches maintenance | `orders_canceled` |
| `orders_canceled` | Still below maintenance | `book` (or `partial` above the slice threshold) |
| `partial` | Cooldown ends, still below maintenance | `partial` again, or `book` |
| `book` / `partial` | Filled above bankruptcy price | `completed`, surplus to fund or trader per the rules |
| `book` / `partial` | Equity below the backstop threshold, or the book can't fill | `backstop` |
| `backstop` | Fund or vault absorbs the shortfall | `completed` |
| `backstop` | Fund insufficient | `adl` |
| `adl` | Opposing positions closed to cover the shortfall | `completed` |

Notes on the sketch:

- **Funding sums to zero.** Per contract and interval, `SUM(funding_payments.amount)` plus the rounding residual posted to the firm is zero; the batch fails otherwise.
- **Marks are evidence.** A liquidation names the mark row that triggered it, and the mark row carries its inputs and methodology version, so a customer's "why was I liquidated at that price" has a stored answer.
- **The fund is per collateral asset.** Insurance capacity is a balance per margin instrument; a stress test reads it per instrument, not in dollars.
- **ADL is an execution.** Each closure is an `executions` row at the bankruptcy price with no fee, so the customer's statement, tax lots and the trade record treat it like any fill.
- **Rules are versioned.** Funding parameters, margin tiers, liquidation thresholds and ADL ranking live in versioned rows with effective times; a liquidation names the rules version it ran under.
- **Events:** `funding.paid`, `liquidation.started`, `liquidation.completed`, `insurance_fund.drawn`, `adl.executed` through the [outbox](/docs/architecture/events#the-transactional-outbox); `insurance_fund.drawn` above a threshold pages the risk desk.

## Auditing

- **Every mark and funding rate** with its inputs and rules version, so any margin decision can be recomputed.
- **Every liquidation** with the trigger, stages, fills, shortfall and who absorbed it.
- **Every ADL event** with the ranking snapshot and the bankrupt position it covered.
- **The insurance fund's movements** per asset, reconciled to its ledger account.
- **Rule changes** (leverage caps, haircuts, tiers, intervals) with approval and effective time, and the disclosures customers were shown about them.

## What This Means for the System You Build

- **Liquidate on a mark built from many venues,** weighted by liquidity, with outlier controls, and store every mark with its inputs.
- **Price collateral the same way;** never margin an account on the venue's own thin book for a collateral asset.
- **Make funding a zero-sum batch** keyed by contract and interval, in integer units, with the residual booked.
- **Default retail to isolated margin** and show the liquidation and bankruptcy prices on the order ticket.
- **Keep the insurance fund per collateral asset** and stress it against a 90% loss of depth.
- **Treat ADL as a fill** and show each customer their queue position.
- **Version every risk parameter** and record which version each liquidation ran under.

## References

**Regulators and guidance**

- [CFTC: Release 8825-23, Binance and its CEO, Changpeng Zhao, agree to pay $2.85 billion (November 21, 2023)](https://www.cftc.gov/PressRoom/PressReleases/8825-23), derivatives offered to US persons from July 2019 without registering as FCM, foreign board of trade, DCM or SEF, and the disgorgement and penalties
- [CFTC: Policy Statement Concerning the Listing of Perpetual Contracts (91 FR 33160, June 3, 2026)](https://www.federalregister.gov/api/v1/documents/2026-11020.json), adopted May 29, 2026 with an order for a DCM to list a perpetual contract on the spot price of bitcoin as a futures contract, and case-by-case review under 40.3 for other asset classes
- [CFTC: Policy statement, full text](https://www.federalregister.gov/documents/full_text/html/2026/06/03/2026-11020.html), the footnote naming the KalshiEX BTCPERP order
- [CFTC: Regulation Crypto Asset Transactions and Regulation Crypto Asset Markets, ANPRM (91 FR 64811, October 13, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20888.json), section 2(c)(2)(D), the advance notice and the December 14, 2026 comment date

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Coinbase Derivatives Exchange as a DCM with dated and perpetual-style futures
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), the Deribit acquisition date and consideration
- [Coinbase Global: Third quarter 2026 earnings deck (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), crypto derivatives and spot volume, the INTX and Deribit integration, options open interest and the Coinbase Pro relaunch

**Vendor documentation**

- [Binance: Introduction to Binance Futures funding rates](https://www.binance.com/en/support/faq/introduction-to-binance-futures-funding-rates-360033525031), the premium index, impact notional, interest component, clamp, caps and floors, interval and the worked example
- [Binance: How to calculate liquidation price of USDⓈ-M futures contracts](https://www.binance.com/en/support/faq/how-to-calculate-liquidation-price-of-usd%E2%93%A2-m-futures-contracts-b3c689c1f50a44cabb3a84e663b81d93), cross and isolated variables (wallet balance, TMM, UPNL, maintenance amount)
- [Binance: What is auto-deleveraging (ADL)](https://www.binance.com/en/support/faq/what-is-auto-deleveraging-adl-360033525471), the ranking formula, bankruptcy price, no fee, and smaller funds for coin-margined contracts
- [Hyperliquid: Funding](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding), the funding formula, hourly payment, 5-second sampling, interest rate, cap and oracle notional
- [Hyperliquid: Liquidations](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations), maintenance margin, mark price, book and partial liquidation, the backstop vault, cross and isolated handling and the liquidation price formula

**In practice**

- [FTI Consulting: The crypto crash of October 2025, when leverage met liquidity (December 24, 2025)](https://fticonsulting.com/insights/articles/crypto-crash-october-2025-leverage-met-liquidity), the $19 billion of liquidations, funding before the crash, depth and spreads, USDe on Binance, unified margin, ADL and the aftermath
