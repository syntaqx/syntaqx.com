+++
title = "Crypto Trading Products"
description = "What exchanges sell: simple buys priced by spread, order books with maker/taker tiers, RFQ and OTC desks, recurring buys and market maker programs."
category = "Investing & Digital Assets Industry"
order = 2546
part = "Crypto Exchanges"
tags = ["crypto", "exchanges", "fees", "trading", "otc", "market-makers"]
+++

The same bitcoin can cost a customer 1.5% or 0.05% to buy on the same exchange, depending on which button they press. A simple buy in the app shows one price, takes a spread and a fee, and is built for someone buying $50 on a phone; the advanced order book charges a published maker or taker fee that falls with volume, and is built for traders and APIs; the OTC desk quotes a block of $5 million all-in and settles it off the book. Each is a separate product with its own pricing, its own execution path, its own revenue line and its own disclosures, and most of an exchange's consumer revenue comes from the first one.

This chapter covers the simple buy and convert and how a spread price is built, the order book's maker/taker schedules with the tier math worked through for Kraken, Gemini and Binance, RFQ and OTC desks, recurring buys, limit orders on brokers, how a platform sources liquidity and hedges what it quotes, and the market makers that make the books worth trading on. The venue underneath is [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#the-two-front-doors); how brokers and exchanges make money overall, with PFOF compared, is [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models); best execution across venues is [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution); derivatives are [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives).

## How the Platforms Do It

Pricing as each platform publishes it, as of November 2026:

| Platform | Simple buy and convert | Order book (lowest tier, maker/taker) | Block trades |
| --- | --- | --- | --- |
| **Binance** | Not covered here | Regular users 0.100% / 0.100%, or 0.075% / 0.075% paying fees in BNB; VIP tiers by 30-day volume and BNB balance down to 0.011% / 0.023% at VIP 9 | Spot Liquidity Provider Program with maker rebates by weekly maker volume share |
| **Coinbase** | Fees "through volume-based transaction fees and a spread"; transaction fees are "either a flat fee or a percentage"; acts as agent, revenue reported net | Tiered maker/taker schedule for Coinbase Advanced; rates not quoted here (see below) | Coinbase Prime RFQ: quotes valid 3 seconds by default, up to 30 seconds |
| **Gemini** | "Gemini includes a spread in the quoted price" for instant and recurring buys; fees vary by payment method and size | ActiveTrader and API 0.60% / 1.20% at $0 of 30-day volume, down to 0% / 0.02% at $250 million; 0% / 0% on RLUSD/USD, USDC/GUSD and GUSD/USD (schedule effective September 1, 2026) | OTC desk listed as a product |
| **Kraken** | App and Instant Buy: 1% on instant and recurring trades, 1.5% on custom orders, up to $2 on small trades, plus a spread "included in the price" | Kraken Pro 0.40% / 0.80% at Tier 1, down to 0% / 0.05% at $500 million, tiered by the better of 30-day volume or assets on platform | OTC desk from $50,000, all-in quotes with no fees, settlement within 24 hours for eligible clients |
| **Robinhood** | Market maker routing commission-free: as of June 15, 2026, $0.95 per $100 of notional to Robinhood from its market maker, included in the spread; exchange routing at 0.00% to 0.95% | Limit orders generally route to Bitstamp, an affiliate | Not offered to retail |

Coinbase's Advanced and Exchange tiers aren't quoted in this chapter: its help center refused automated access, and secondary summaries disagree about a 2026 change.<!-- source-gap: coinbase-advanced-fee-tiers | missing | Coinbase Advanced Trade maker/taker tiers as of November 2026 | closes with: the Coinbase help center fee page or the Exchange API fee endpoint documentation with tier values | checked: 2026-11-05 -->

Two patterns stand out. **The app and the book are priced an order of magnitude apart.** A first-tier Kraken Pro taker pays 0.80%; an app customer pays 1% plus a spread; a $500 million-a-month trader pays 0.05%. **Volume tiers are universal, but the inputs differ:** Kraken counts the better of volume or assets held, Binance requires a BNB balance alongside volume, and Gemini lets a $1 million balance substitute for the second tier's volume. In Coinbase's 2025 10-K, consumer transaction revenue was $3,322.8 million against $479.7 million institutional, out of $4,055.4 million of transaction revenue; by the third quarter of 2026 consumer transaction revenue had fallen to $450.1 million from $843.5 million a year earlier, the cyclical line in the business.

## The Simple Buy and Convert

### How a quote is built

A simple buy is a request for quote the customer doesn't see. The customer asks for $1,000 of bitcoin; the platform:

1. Takes a **reference price**, usually the mid of its own book or an index across venues.
2. Adds a **spread** that covers the cost of filling the order (the half-spread on the venue it will fill or hedge on, expected slippage for the size, and the price risk while the quote is open) plus margin.
3. Adds or deducts a **fee**, flat or percentage, disclosed separately.
4. Fixes the **quantity** in the asset's base units, rounded down, and the quote's **expiry**.
5. On acceptance, **fills**: from its own book as agent, from a liquidity provider, or from inventory it then hedges.

A convert (ETH to SOL, say) is the same with two legs, either through a quote currency or as a direct cross, and the customer sees one rate.

### Worked numbers: what a $1,000 buy costs

Reference mid $100,000 per BTC. Three pricing models for the same order:

| Model | Price per BTC | Fee | BTC received | Value at mid | All-in cost |
| --- | --- | --- | --- | --- | --- |
| **Fee plus spread** (1% fee, 0.5% spread, like Kraken's app) | $100,500 | $10.00 | 990 / 100,500 = 0.00985074 | $985.07 | $14.93 (1.49%) |
| **Spread only** (0.96% spread, broker routing to a market maker) | $100,960 | $0 | 1,000 / 100,960 = 0.00990491 | $990.49 | $9.51 (0.95%) |
| **Order book taker** (0.80% taker, Kraken Pro Tier 1, assume the ask is $100,010) | $100,010 | $8.00 | 992 / 100,010 = 0.00991900 | $991.90 | $8.10 (0.81%) |

The spread-only row is the shape of Robinhood's disclosure: of each $100 executed through market maker routing, $0.95 goes to Robinhood inside the spread, so on $1,000 that's $9.50, and the market maker's own spread to the reference is on top (zero in this simplified row). The order book row shows why active traders move to the book: even at the first tier, it's about half the cost of the app.

The quantity column is integer arithmetic in satoshis, and the rounding rule is part of the product. Round the customer's quantity down, keep the residual in the platform's favor visibly (as part of the disclosed price) or credit it back, and never let it accumulate in a suspense account nobody reconciles ([Rounding](/docs/money/amounts#rounding)).

### Quote risk and hedging

Between quoting and filling, the price moves. A platform that fills simple buys from its own inventory carries that risk and hedges it: it buys on a venue (its own book, an outside exchange, a liquidity provider) when customers buy, and sells when they sell, ideally within the quote's life. The levers:

- **Quote life.** Short enough that the price can't move far: Coinbase Prime's RFQ quotes default to 3,000 ms and run at most 30,000 ms.
- **Spread by size and volatility.** Wider for large orders (more slippage when hedging) and in fast markets.
- **Netting.** Customers buying and selling in the same second offset each other; only the net needs hedging.
- **Inventory limits.** A cap on the unhedged position per asset, after which quotes widen or pause.

Platforms that act as agent instead don't carry this risk: Robinhood says it routes "all cryptocurrency transactions initiated by customers to third-party market makers" and "never" acts as counterparty, settling bilaterally with its liquidity providers "on a net basis once per business day"; Coinbase concludes it "acts as an agent in transactions between customers" and reports revenue net. Whether a platform is principal or agent decides how revenue is reported (BitGo's revenue is dominated by gross "digital asset sales" from principal-style flows, so its headline revenue isn't comparable to Coinbase's net revenue), what the customer is told, and who owns the hedge. It also decides the controls: an agent needs a best-execution policy for where it routes; a principal needs inventory limits and a disclosed markup.

## The Order Book: Maker, Taker and Tiers

### Maker and taker

An order that rests on the book adds liquidity and pays the **maker** fee; an order that executes against a resting one removes liquidity and pays the **taker** fee. Takers pay more because they're the ones who want immediacy. Post-only orders (Coinbase's FIX `ExecInst=A`) are rejected instead of taking, so a maker can guarantee the maker fee. At the top tiers, makers pay nothing or are paid: Kraken's futures schedule goes to a −0.006% maker rebate above $5 billion, and Gemini's derivatives schedule to −1 basis point at $50 million.

### Kraken Pro spot, as published

| Tier | 30-day volume (or assets on platform) | Maker | Taker |
| --- | --- | --- | --- |
| 1 | $0+ | 0.40% | 0.80% |
| 2 | $2,500+ | 0.30% | 0.60% |
| 3 | $10,000+ | 0.22% | 0.38% |
| 4 | $25,000+ | 0.20% | 0.35% |
| 5 | $50,000+ | 0.15% | 0.30% |
| 6 | $100,000+ | 0.12% | 0.25% |
| 7 | $250,000+ | 0.10% | 0.22% |
| 8 | $500,000+ | 0.08% | 0.20% |
| 9 | $1,000,000+ | 0.06% | 0.18% |
| 10 | $2,500,000+ | 0.04% | 0.15% |
| 11 | $5,000,000+ | 0.02% | 0.12% |
| 12 | $10,000,000+ | 0.00% | 0.10% |
| Pro 1 to Pro 5 | $50,000,000+ to $500,000,000+ | 0.00% | 0.09% to 0.05% |

Stablecoin and FX pairs run a separate schedule from 0.20% / 0.20% down to near zero. Kraken's page calls the cross-platform tiers recently introduced and carries no date, so check it before quoting a figure; tiers move.

### Gemini ActiveTrader, effective September 1, 2026 (basis points)

| 30-day volume | Maker | Taker |
| --- | --- | --- |
| $0 | 60 | 120 |
| $10,000 (or $1 million balance) | 40 | 80 |
| $25,000 | 25 | 50 |
| $75,000 | 12.5 | 25 |
| $250,000 | 7.5 | 15 |
| $500,000 | 6 | 12.5 |
| $1,000,000 | 5 | 10 |
| $5,000,000 | 4 | 8.5 |
| $10,000,000 | 2.5 | 6.5 |
| $20,000,000 | 1 | 5 |
| $50,000,000 | 0 | 3.5 |
| $100,000,000 | 0 | 2.5 |
| $250,000,000 | 0 | 2 |

### Binance spot

Regular users pay 0.100% maker and taker, cut 25% to 0.075% when fees are paid in BNB. VIP levels need both 30-day volume and a BNB balance: VIP 1 at $1 million and 5 BNB (0.090% / 0.100%), VIP 3 at $20 million and 100 BNB (0.040% / 0.060%), VIP 5 at $150 million and 1,000 BNB (0.025% / 0.031%), up to VIP 9 at $4 billion and 5,500 BNB (0.011% / 0.023%, or 0.00825% / 0.01725% with the BNB discount). The BNB requirement ties the fee schedule to the exchange's own token, which is one reason New York's listing guidance puts exchange coins in its enhanced-review category.

### Worked numbers: one trader, three schedules

A trader with $3 million of 30-day volume, 70% of it taker, places a $200,000 taker order and a $200,000 maker order:

| Venue | Tier reached | Taker fee on $200,000 | Maker fee on $200,000 | Blended rate at 70% taker |
| --- | --- | --- | --- | --- |
| Kraken Pro | Tier 10 ($2.5 million+): 0.04% / 0.15% | $300 | $80 | 0.7 × 0.15% + 0.3 × 0.04% = 0.117% |
| Gemini ActiveTrader | $1 million tier: 5 / 10 bps | $200 | $100 | 0.7 × 0.10% + 0.3 × 0.05% = 0.085% |
| Binance, no VIP (no BNB balance) | Regular: 0.100% / 0.100%; 0.075% paying in BNB | $200 ($150) | $200 ($150) | 0.100% (0.075%) |

Crossing a tier boundary changes the rate on every future trade, not on the volume above the boundary, so a trader near a threshold has an incentive to trade just enough to cross it, and the exchange has to decide when a new tier takes effect (on the next daily recalculation is the usual answer; mid-day changes make fee audits miserable). Two more rules belong in the fee engine: **the tier is computed from a rolling window of executions in the quote's dollar value at execution time**, recomputed on a schedule and stored with the date; and **the fee on each execution is computed from the tier in force when the order was matched**, stored on the execution, never recomputed later.

### A tier lookup in code

```go tab="Go"
type Tier struct {
	Name      string
	MinVolume int64 // 30-day volume in cents
	MinAssets int64 // assets on platform in cents; 0 if not an alternative
	MakerBps  int64 // hundredths of a basis point: 4000 = 0.40%
	TakerBps  int64
}

// TierFor returns the best tier the account qualifies for by volume or assets.
// tiers must be sorted ascending by MinVolume.
func TierFor(tiers []Tier, volume, assets int64) Tier {
	best := tiers[0]
	for _, t := range tiers {
		if volume >= t.MinVolume || (t.MinAssets > 0 && assets >= t.MinAssets) {
			best = t
		}
	}
	return best
}

// Fee in cents for an execution, rounded up to the next cent.
func Fee(notionalCents int64, rate int64) int64 {
	const denom = 1_000_000 // rate is in hundredths of a basis point
	return (notionalCents*rate + denom - 1) / denom
}
```

```rust tab="Rust"
pub struct Tier {
    pub name: &'static str,
    pub min_volume: i64, // 30-day volume in cents
    pub min_assets: i64, // assets on platform in cents; 0 if not an alternative
    pub maker: i64,      // hundredths of a basis point: 4000 = 0.40%
    pub taker: i64,
}

/// The best tier the account qualifies for by volume or assets; tiers sorted ascending.
pub fn tier_for(tiers: &[Tier], volume: i64, assets: i64) -> &Tier {
    tiers
        .iter()
        .filter(|t| volume >= t.min_volume || (t.min_assets > 0 && assets >= t.min_assets))
        .last()
        .unwrap_or(&tiers[0])
}

/// Fee in cents for an execution, rounded up to the next cent.
pub fn fee(notional_cents: i64, rate: i64) -> i64 {
    const DENOM: i64 = 1_000_000; // rate is in hundredths of a basis point
    (notional_cents * rate + DENOM - 1) / DENOM
}
```

A $200,000 taker execution at Kraken's Tier 10 is `Fee(20_000_000, 1_500)` = 30,000 cents, or $300. Rates are integers in hundredths of a basis point so that 0.00825% (825) is exact, and the multiplication stays well inside 64 bits for any single execution an exchange would accept. Rounding direction is a disclosed policy; rounding up on fees and down on quantities both favor the house, so state it.

## RFQ and OTC Desks

Large orders don't go through the book, because a $5 million market order moves the price against itself. An RFQ (request for quote) asks one or more liquidity providers for a firm price for the whole size; the customer accepts or lets it expire.

**Coinbase Prime's RFQ,** as documented: a quote request always carries a limit price and exactly one of a base quantity or a quote value; quotes last 3,000 ms by default and at most 30,000 ms, and the auction window includes a 250 ms window for liquidity providers to respond; a quote executes only through an explicit accept; over FIX, the request is a limit, fill-or-kill order and acceptance uses the "previously quoted" order type. It's spot only and requires the portfolio to be enabled.

**Kraken's OTC desk** starts at $50,000 equivalent (lowered from a higher minimum on March 11, 2025), quotes all-inclusive prices ("we do not charge you any fees"), offers RFQ inside Kraken Pro and Kraken Custody, and settles within 24 hours for eligible clients.

For the ledger, an OTC trade is an execution like any other with the venue set to the desk and the counterparty recorded: same journal entries, same tax lots, same surveillance. Deferred settlement is the twist. A trade agreed now and settled within 24 hours is an obligation on both sides until both legs arrive, recorded in the core model's `settlements` with its due time, and the credit the desk extends to a client between trade and settlement is exactly the exposure that [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending) deals with.

## Recurring Buys

A recurring buy is a schedule that places simple buys, priced like one: Kraken charges its 1% instant fee on recurring trades, and Gemini includes a spread in recurring orders as in instant buys. The engine is small and the edge cases are the product:

- **Funding.** A recurring buy funded by a bank debit is a buy against money that can still be returned. Either wait for the debit to clear or credit it as an instant deposit inside the credit limits in [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers), and never let the bought coins leave the platform before it settles.
- **Insufficient funds.** Skip, retry once, or pause the plan, decided in advance and shown to the customer; never buy a partial amount silently.
- **Price.** The run executes at the quote at run time; randomizing run times within a window keeps millions of plans from hitting the market in the same second.
- **Rounding and minimums.** $5 of an asset at a high price is a small number of base units; the asset's minimum order size and decimals set a floor below which the run is skipped.
- **Records.** Each run is its own execution, its own tax lot and its own confirmation, which makes a weekly $10 plan 52 lots a year ([Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots)).

The broker-side version for stocks is [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring); the mechanics carry over except that crypto runs on weekends.

## Limit Orders on Brokers

A broker that routes simple buys to market makers still needs somewhere to rest a limit order. Robinhood says its limit orders "generally" route to Bitstamp, "a partner exchange and affiliate," and that customers can choose exchange routing for a fee of 0.00% to 0.95% instead of commission-free market maker routing. The design question is the same as in equities: where an order rests, who sees it, what it pays, and whether the affiliate relationship is disclosed with the routing, which [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) covers in full.

## Liquidity Sourcing and Market Makers

### Where the price comes from

An exchange's own book is only worth trading on if someone is quoting it. Thin books mean wide spreads, which mean worse simple-buy prices (the reference mid is worse) and bigger hedging costs. So exchanges recruit market makers, and brokers without books contract with them:

- **Market maker programs** pay for liquidity with lower fees or rebates. Binance's Spot Liquidity Provider Program, as updated September 9, 2024, sets maker fees by weekly share of maker volume: 0% at 0.05% share (or $25 million), −0.004% at 0.15%, −0.006% at 0.50%, and −0.008% at 1.00%, with automatic enrollment and removal after three weeks without qualifying.
- **Designated liquidity agreements** with obligations (uptime, maximum spread, minimum depth) in exchange for economics, typical for new listings ([The Launch Sequence](/books/investing-and-digital-assets/listing-assets#the-launch-sequence)).
- **External liquidity providers** for brokers that route rather than match, paid through the spread as Robinhood's are.

### Worked numbers: a market maker's week

A market maker on Binance with $50 million of maker volume in a week, which is 1.0% of the venue's weekly maker volume in that pair class, earns the −0.008% rate: 0.00008 × $50,000,000 = $4,000 paid by the exchange that week. If it also takes $10 million at a VIP 5 taker rate of 0.031% (its monthly volume clears VIP 5's $150 million, and assume it holds the 1,000 BNB the level requires), it pays $3,100. Net, the exchange pays it $900 to provide the depth that every other customer trades against. In the exchange's ledger the rebate is an expense (a firm line debited, the market maker's customer line credited in the quote asset), recorded per execution with the program tier in force, never netted silently into fee revenue.

### Rules a market maker needs from the venue

Market makers run thousands of orders a second and need guarantees the retail product never exposes: **self-trade prevention** modes (Coinbase's FIX tag 7928 offers decrement-and-cancel by default, cancel oldest, cancel newest or cancel both), **cancel-on-disconnect** so a dropped session doesn't leave stale quotes, **queue priority rules** published (on Coinbase, decreasing quantity keeps priority, increasing it or changing price loses it), **batch messages** for mass quote updates, and a **published fee tier** they can model. Those are matching-engine features, covered in [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching); what belongs here is that they're part of what an exchange sells.

## How to Build It

These are deltas against the core data model in [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`fee_schedules` with its versioned `terms`, `fees` with the execution each was charged on, `orders` and `order_events`, `executions` with venue, price, quantity, liquidity flag and capacity, `settlements`, `disclosures`), and against [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it) (`product_offerings`, `trading_pairs`). This chapter normalizes a schedule's tiers into `fee_tiers` with each account's daily assignment, and adds convert quotes, RFQ quotes, hedges, recurring plans and runs, and liquidity providers with their program terms.

```sql
CREATE TABLE fee_tiers (                        -- the tiers in one fee_schedules version's terms, as rows
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  fee_schedule_id  UUID NOT NULL REFERENCES fee_schedules (id),
  product          TEXT NOT NULL CHECK (product IN ('spot_order_book', 'stablecoin_pairs', 'perpetuals', 'dated_futures')),
  tier_name        TEXT NOT NULL,
  min_volume_usd   BIGINT NOT NULL,             -- 30-day volume, cents
  min_assets_usd   BIGINT,                      -- alternative qualifier, cents
  min_token_balance NUMERIC(78,0),              -- e.g. a BNB requirement, base units
  maker_rate       INTEGER NOT NULL,            -- hundredths of a basis point; negative is a rebate
  taker_rate       INTEGER NOT NULL,
  UNIQUE (fee_schedule_id, product, tier_name)
);

CREATE TABLE account_fee_tiers (                -- the tier each account is on, per day
  account_id       UUID NOT NULL REFERENCES accounts (id),
  product          TEXT NOT NULL,
  effective_date   DATE NOT NULL,
  fee_tier_id      UUID NOT NULL REFERENCES fee_tiers (id),
  volume_usd_30d   BIGINT NOT NULL,
  assets_usd       BIGINT,
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, product, effective_date)
);

ALTER TABLE fees
  ADD COLUMN fee_tier_id UUID REFERENCES fee_tiers (id),  -- the tier used, frozen at match time
  ADD COLUMN fee_rate    INTEGER;                         -- hundredths of a basis point

CREATE TABLE convert_quotes (                   -- simple buy, simple sell and convert
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('simple_buy', 'simple_sell', 'convert', 'recurring')),
  sell_instrument_id  UUID NOT NULL REFERENCES instruments (id),
  buy_instrument_id   UUID NOT NULL REFERENCES instruments (id),
  sell_amount         NUMERIC(78,0) NOT NULL,   -- base units
  buy_amount          NUMERIC(78,0) NOT NULL,   -- base units, rounded down
  reference_price     NUMERIC(38,18) NOT NULL,  -- mid or index, buy per sell
  reference_source    TEXT NOT NULL,
  spread_rate         INTEGER NOT NULL,         -- hundredths of a basis point over reference
  fee_amount          NUMERIC(78,0) NOT NULL,
  fee_instrument_id   UUID NOT NULL REFERENCES instruments (id),
  liquidity_source    TEXT NOT NULL CHECK (liquidity_source IN ('own_book', 'liquidity_provider', 'inventory')),
  disclosure_id       UUID REFERENCES disclosures (id),  -- what the customer was shown
  expires_at          TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'expired', 'rejected', 'filled', 'failed')),
  order_id            UUID REFERENCES orders (id),       -- the fill, once accepted
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rfq_quotes (                       -- each provider's response to one RFQ
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  rfq_id                UUID NOT NULL,          -- the request: account, pair, side, size, limit price
  account_id            UUID NOT NULL REFERENCES accounts (id),
  liquidity_provider_id UUID NOT NULL,          -- liquidity_providers, below
  base_instrument_id    UUID NOT NULL REFERENCES instruments (id),
  quote_instrument_id   UUID NOT NULL REFERENCES instruments (id),
  side                  TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  base_quantity         NUMERIC(78,0) NOT NULL,
  price                 NUMERIC(38,18) NOT NULL,
  all_in                BOOLEAN NOT NULL,       -- fees included in the price, as OTC desks quote
  received_at           TIMESTAMPTZ NOT NULL,
  expires_at            TIMESTAMPTZ NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('live', 'accepted', 'expired', 'beaten', 'withdrawn')),
  order_id              UUID REFERENCES orders (id),
  settlement_id         UUID REFERENCES settlements (id)  -- deferred settlement, when agreed
);

CREATE TABLE hedges (                           -- principal flow offset on a venue
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id  UUID NOT NULL REFERENCES instruments (id),
  net_quantity   NUMERIC(78,0) NOT NULL,        -- signed: positive buys
  window_start   TIMESTAMPTZ NOT NULL,          -- the customer flow it nets
  window_end     TIMESTAMPTZ NOT NULL,
  venue_id       UUID NOT NULL REFERENCES venues (id),
  order_id       UUID REFERENCES orders (id),
  slippage       NUMERIC(78,0),                 -- hedge cost against the quoted reference, quote units
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recurring_plans (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  buy_instrument_id UUID NOT NULL REFERENCES instruments (id),
  amount_usd      BIGINT NOT NULL CHECK (amount_usd > 0),  -- cents
  frequency       TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  funding         TEXT NOT NULL CHECK (funding IN ('cash_balance', 'bank_debit', 'card')),
  on_insufficient TEXT NOT NULL CHECK (on_insufficient IN ('skip', 'retry_once', 'pause')),
  next_run_at     TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'canceled'))
);

CREATE TABLE recurring_runs (
  plan_id        UUID NOT NULL REFERENCES recurring_plans (id),
  scheduled_for  TIMESTAMPTZ NOT NULL,
  quote_id       UUID REFERENCES convert_quotes (id),
  transfer_id    UUID REFERENCES transfers (id),  -- the bank debit, if any
  outcome        TEXT NOT NULL CHECK (outcome IN ('filled', 'skipped_funds', 'skipped_minimum', 'failed')),
  PRIMARY KEY (plan_id, scheduled_for)
);

CREATE TABLE liquidity_providers (              -- market makers and quoting counterparties, with terms
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id         UUID NOT NULL REFERENCES venues (id),  -- the provider, or the venue it makes markets on
  role             TEXT NOT NULL CHECK (role IN ('book_market_maker', 'rfq_provider', 'routing_counterparty')),
  name             TEXT NOT NULL,
  tier_name        TEXT,                        -- program tier, for book market makers
  min_maker_share  NUMERIC(7,4),                -- percent of weekly maker volume
  min_maker_volume_usd BIGINT,
  maker_rate       INTEGER,                     -- negative is a rebate
  payment_per_100  BIGINT,                      -- for routing counterparties: cents paid per $100 routed
  obligations      JSONB,                       -- uptime, max spread, min depth
  effective_from   DATE NOT NULL,
  UNIQUE (venue_id, name, tier_name, effective_from)
);
```

A convert quote is immutable once created; acceptance creates the order with an idempotency key of the quote ID, so a double tap fills once. The fill posts the journal entries from [the worked example](/books/investing-and-digital-assets/crypto-exchange-architecture#worked-numbers-one-deposit-one-trade-one-withdrawal): the customer legs at the quoted amounts, the fee to fee revenue, and for principal fills the spread to trading revenue against the platform's inventory account, with the later hedge's slippage posted to the same inventory account so the spread's real earnings are measurable. `account_fee_tiers` is written by a daily job from the prior 30 days of `executions` in USD value at execution, and the fee engine reads the row for the current date and writes the tier and rate onto each `fees` row; changing a schedule means a new `fee_schedules` version with a published `valid_during`, never an edit to rows already referenced by fees. The core's `fees` are charges (amount above zero), so a maker rebate isn't a fee row: it's a journal entry crediting the market maker against a firm rebate expense line, referencing the execution and the `liquidity_providers` tier in force. An RFQ fill references the winning `rfq_quotes` row, and its deferred leg is a `settlements` row due within the agreed window.

## Auditing

What an examiner, auditor or customer complaint asks for:

- **What the customer was shown:** for every quote, the reference price and source, the spread, the fee, the quantity, the expiry, and the disclosure version, so "what did this cost me" has an exact answer.
- **Fee schedule history:** every version with its effective date and announcement, every account's daily tier with the inputs that produced it, and the tier and rate frozen on each execution.
- **Principal or agent, per product,** with the inventory and hedge records for principal fills and the routing records for agent fills.
- **Rebates and program terms:** every market maker's tier by week, the shares and volumes that qualified it, and the rebate paid.
- **RFQ and OTC:** quote requests, responses, acceptances, counterparties, and settlement of both legs against the due time.
- **Recurring plans:** every run with its outcome, so a customer's missed buy can be traced to a funding failure, a minimum or an outage.

## What This Means for the System You Build

- **The simple buy is a quote:** reference, spread, fee, quantity in base units rounded down, expiry, all stored and shown.
- **Know whether each product is principal or agent,** and build the matching control: inventory limits and hedges, or a routing policy.
- **Fee tiers are data with versions,** computed daily from a rolling window and frozen on each execution.
- **Integer rates in hundredths of a basis point,** with a disclosed rounding direction.
- **Large orders get an RFQ,** with firm quotes, short lives and explicit acceptance, and OTC settlement recorded as obligations until both legs arrive.
- **Recurring buys decide funding, shortfall, minimums and timing up front,** and each run is its own lot.
- **Market makers are customers with a contract:** rebates as expenses, obligations measured, and the engine features they depend on treated as product.

## References

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), volume-based fees and a spread, flat or percentage transaction fees, and 2025 transaction revenue by consumer, institutional and other
- [Coinbase Global: Form 10-K for 2025, revenue recognition note](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/R11.htm), agent in transactions between customers, revenue net and at execution
- [Coinbase Global: Form 10-Q for Q3 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), consumer transaction revenue in the third quarters of 2026 and 2025
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), routing as agent to market makers, never a counterparty, net daily settlement with liquidity providers, and transaction rebates
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), revenue dominated by gross digital asset sales
- [Gemini Space Station: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/2055592/000205559226000026/gemi-20251231.htm), transaction fees as the majority of revenue and the OTC desk

**Vendor documentation**

- [Binance: Fee schedule](https://www.binance.com/en/fee/schedule), regular and VIP spot rates, volume and BNB requirements, and the BNB discount
- [Binance: Spot Liquidity Provider Program update (September 9, 2024)](https://www.binance.com/en/support/announcement/binance-updates-spot-liquidity-provider-program-2024-09-09-6311b67d26804bf48c5d62f5beb91202), maker rebate tiers by weekly maker volume share
- [Coinbase Developer Platform: Prime create quote request](https://docs.cdp.coinbase.com/api-reference/prime-api/rest-api/orders/create-quote-request.md), limit price, one quantity field, 3,000 ms default and 30,000 ms maximum quote life, accept to execute
- [Coinbase Developer Platform: Prime FIX RFQ](https://docs.cdp.coinbase.com/prime/fix-5-0-api/rfq.md), limit fill-or-kill requests, previously quoted acceptance, the 250 ms provider window, spot only
- [Coinbase Developer Platform: Exchange FIX order entry](https://docs.cdp.coinbase.com/exchange/fix-api/order-entry-messages/order-entry-messages5.md), post-only, self-trade prevention modes, queue priority on modify, cancel-on-disconnect and batch messages
- [Gemini: ActiveTrader fee schedule](https://www.gemini.com/fees/activetrader-fee-schedule), tiers effective September 1, 2026, stablecoin pairs and derivatives rebates
- [Gemini: Fee schedule](https://www.gemini.com/fees/gemini-fee-schedule), a spread in the quoted price for instant and recurring buys
- [Kraken: Fee schedule](https://www.kraken.com/features/fee-schedule), Kraken Pro spot tiers by volume or assets, stablecoin pairs, futures rebates, and app and Instant Buy fees
- [Kraken: Introducing the Kraken OTC desk](https://support.kraken.com/articles/360021967711-introducing-the-kraken-otc-desk), the $50,000 minimum, all-in quotes and settlement within 24 hours
- [Kraken: OTC minimum lowered to $50,000 (March 11, 2025)](https://blog.kraken.com/news/otc-50k-minimum), the date of the change
- [Robinhood: Crypto order routing](https://robinhood.com/us/en/support/articles/crypto-order-routing/), $0.95 per $100 from market makers as of June 15, 2026, exchange routing fees, and limit orders to Bitstamp
