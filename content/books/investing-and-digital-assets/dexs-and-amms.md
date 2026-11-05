+++
title = "DEXs & AMMs"
description = "Constant product math with worked swaps, price impact, slippage, concentrated liquidity, v4 hooks, impermanent loss, aggregators, intents and order books."
category = "Investing & Digital Assets Industry"
order = 2562
part = "Decentralized Finance"
tags = ["defi", "dex", "amm", "uniswap", "liquidity", "hyperliquid"]
+++

A decentralized exchange is a contract that holds two tokens and trades them against anyone who calls it. Nobody approves the trader, quotes a price or matches an order: the contract computes how much it will pay out from how much it already holds, checks that a formula still holds after the trade, and transfers. The price is whatever the formula says at that moment, and it moves with every trade. Liquidity providers (LPs) deposit the two tokens and earn the fee, and arbitrageurs keep the pool's price close to the rest of the market by trading against it whenever it drifts. That is the whole design of an automated market maker (AMM), and it moves billions of dollars a day with no operator in the middle.

For a platform the mechanics matter for three reasons. A customer swapping through a self-custody wallet the platform ships is trading against one of these pools, at a price the platform should be able to explain before the customer signs. A platform that marks tokens which trade mostly on chain is reading prices from pools, and pools can be moved. And a platform whose customers provide liquidity has to show them positions whose value depends on a formula, not a market price.

This chapter covers the constant product formula with a worked swap, price impact and slippage, concentrated liquidity in Uniswap v3, hooks and the singleton in v4, impermanent loss worked at a 2x move, aggregators and routers, intent-based and batch-auction DEXs, and on-chain order books (Hyperliquid). It adds liquidity pools, pool states, swap quotes and LP positions to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business, under `venues` and `executions`. Tokens and approvals are [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards#approvals-worked); the ordering games played around a swap are [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev); offering swaps to a platform's customers is [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform); perpetuals on Hyperliquid are Perpetuals & Crypto Derivatives.

## How the Protocols Do It

The main designs, from their whitepapers, documentation and source code, as of November 2026:

| Protocol | Design | Pricing | Fees | What an integrator has to know |
| --- | --- | --- | --- | --- |
| **Uniswap v2** | One contract per pair; reserves of two ERC-20s | Constant product, x × y = k, across all prices | 0.30% to LPs; a protocol fee of 0.05% that "can be turned on and off" | Non-upgradeable pair contracts; the seller transfers in first and the pair measures what arrived; a time-weighted price accumulator for oracles |
| **Uniswap v3** | One contract per pair and fee tier; LP positions on price ranges | Constant product within each tick range, ticks at prices 1.0001^i | Initial tiers 0.05%, 0.30% and 1%, with tick spacings 10, 60 and 200 | Liquidity is active only in range; positions are NFTs, not fungible LP tokens; a geometric mean TWAP oracle |
| **Uniswap v4** | A singleton `PoolManager` holds every pool | v3-style concentrated liquidity | Static or, with a hook, dynamic | Actions only inside `unlock`; net balances settle at the end; hooks run custom code around swaps and liquidity changes |
| **UniswapX** | Signed orders filled by competing fillers | A Dutch auction from a maximum to a minimum price | Gas paid by the filler | No on-chain order until a filler settles it; Permit2 moves tokens only within the auction's terms |
| **CoW Protocol** | Signed intents settled in batches by solvers | Batch auctions; trades matched against each other where possible | Solver competition | Coincidences of wants clear between users before touching pools |
| **0x Swap API** | An aggregator over on-chain liquidity | Best route across "150+ sources" | Integrator fee set by the app, 0 to 1,000 bps | Returns a ready transaction and the allowance target to approve |
| **Hyperliquid** | An order book and matching engine in the chain's own state | Price-time priority on a central limit order book | Maker and taker | HyperBFT consensus; about 200,000 orders a second; a general-purpose HyperEVM alongside |

Three families sit in that table: pools that price by formula (Uniswap and its many forks), orders that are signed off chain and settled by someone competing to fill them (UniswapX, CoW), and order books run as a chain (Hyperliquid). Aggregators sit on top of all of them. A platform that offers swaps usually integrates an aggregator and needs to understand all three, because the route the aggregator picks determines what the customer pays.

## The Constant Product Formula

### The rule

A Uniswap v2 pair holds reserves x of one token and y of the other and enforces that their product can't fall: the v2 whitepaper describes "the invariant that the product of the reserves cannot decrease." The marginal price of the first token in units of the second is y / x. The fee is taken from the input before the invariant is checked; the v2 pair contract checks it in integers:

```solidity
uint balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
uint balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
require(balance0Adjusted.mul(balance1Adjusted) >= uint(_reserve0).mul(_reserve1).mul(1000**2), 'UniswapV2: K');
```

For a swap of Δx in, solving (x + 0.997 Δx)(y − Δy) = x × y gives the output:

Δy = 0.997 Δx × y / (x + 0.997 Δx)

which is the periphery library's `getAmountOut` (`amountInWithFee = amountIn.mul(997)`). Because the fee is charged on the input, the effective fee on the output is slightly higher: the whitepaper computes it as 3/997 ≈ 0.3009%. The fee stays in the pool, so k grows with every trade, and that growth is what LPs earn.

### Worked numbers: a 10 ETH sale

A pool holds 1,000 ETH and 3,000,000 USDC, so the spot price is 3,000 USDC per ETH and k = 3,000,000,000. A trader sells 10 ETH.

| Step | Value |
| --- | --- |
| Input after fee | 10 × 0.997 = 9.97 ETH |
| Output | 9.97 × 3,000,000 / (1,000 + 9.97) = **29,614.74 USDC** |
| Average price received | 2,961.47 USDC per ETH |
| Output with no fee | 10 × 3,000,000 / 1,010 = 29,702.97 USDC |
| Reserves after | 1,010 ETH and 2,970,385.26 USDC; k ≈ 3,000,089,112, up from 3,000,000,000 |
| Spot price after | 2,940.98 USDC per ETH |

The trader received 1.28% less than 10 × 3,000 = 30,000. Of the 385.26 USDC shortfall, 88.23 is the fee (the difference from the no-fee output) and 297.03 is price impact: the formula pays less for each successive unit sold. The spot price after the trade, 2,940.98, is 1.97% below where it started, and it stays there until an arbitrageur buys ETH from the pool to bring it back to the market price. That arbitrage trade is how the pool learns the market price at all: the pool has no other source.

### Price impact and slippage

The two words are used loosely, and a quote screen should keep them apart:

- **Price impact** is what the trade itself does to the price, computed from the pool's state at quote time: here 10 ETH against 1,000 ETH of reserves moves the price about 2%. For a trade of size Δx against reserve x, the average execution price is about the spot price divided by (1 + Δx / x), so impact grows with trade size relative to pool depth.
- **Slippage** is the difference between the quoted output and what the trade actually gets when it lands, because other transactions changed the pool in between. Robinhood's wallet documentation puts it as "the difference between the quoted price of a crypto swap and the price at which it executes."
- **The slippage tolerance** is a minimum output the transaction enforces on chain (`amountOutMin` on a v2 router, `minBuyAmount` in a 0x quote). If the pool moves against the trade by more than the tolerance before it is included, the transaction reverts and the trader pays only gas. A wide tolerance is an invitation: the tolerance is exactly how much a sandwich attacker can take ([Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#sandwiches)).

A quote in code: compute the output from the reserves at a known block, apply the fee, and derive the minimum out from the customer's tolerance. Integers throughout, in the tokens' base units, because that is what the contract does.

```go tab="Go"
// AmountOut mirrors UniswapV2Library.getAmountOut: fee in basis points on the input.
func AmountOut(amountIn, reserveIn, reserveOut *big.Int, feeBps int64) (*big.Int, error) {
	if amountIn.Sign() <= 0 || reserveIn.Sign() <= 0 || reserveOut.Sign() <= 0 {
		return nil, errors.New("amounts and reserves must be positive")
	}
	inWithFee := new(big.Int).Mul(amountIn, big.NewInt(10_000-feeBps))
	num := new(big.Int).Mul(inWithFee, reserveOut)
	den := new(big.Int).Add(new(big.Int).Mul(reserveIn, big.NewInt(10_000)), inWithFee)
	return num.Quo(num, den), nil // rounds down, as the contract does
}

// MinOut applies the customer's slippage tolerance to a quoted output.
func MinOut(quoted *big.Int, toleranceBps int64) *big.Int {
	m := new(big.Int).Mul(quoted, big.NewInt(10_000-toleranceBps))
	return m.Quo(m, big.NewInt(10_000))
}
```

```rust tab="Rust"
use num_bigint::BigUint;

/// Mirrors UniswapV2Library.getAmountOut: fee in basis points on the input.
fn amount_out(amount_in: &BigUint, reserve_in: &BigUint, reserve_out: &BigUint, fee_bps: u32) -> Option<BigUint> {
    let zero = BigUint::from(0u32);
    if *amount_in == zero || *reserve_in == zero || *reserve_out == zero {
        return None;
    }
    let in_with_fee = amount_in * BigUint::from(10_000 - fee_bps);
    let num = &in_with_fee * reserve_out;
    let den = reserve_in * BigUint::from(10_000u32) + in_with_fee;
    Some(num / den) // rounds down, as the contract does
}

/// Applies the customer's slippage tolerance to a quoted output.
fn min_out(quoted: &BigUint, tolerance_bps: u32) -> BigUint {
    quoted * BigUint::from(10_000 - tolerance_bps) / BigUint::from(10_000u32)
}
```

With 18-decimal ETH and 6-decimal USDC, the worked trade is `AmountOut(10e18, 1000e18, 3_000_000e6, 30)` = 29,614,741,031 base units, or 29,614.741031 USDC. A 0.5% tolerance makes the minimum 29,466.667325 USDC. The quote is only as good as the block it was read at; the platform records that block with the quote.

## Concentrated Liquidity

### Positions on a range

In v2 every LP's tokens are spread over all prices from zero to infinity, so most of them are never used. Uniswap v3 lets each LP choose a range: "A position only needs to maintain enough reserves to support trading within its range, and therefore can act like a constant product pool with larger reserves (we call these the virtual reserves) within that range." The pool tracks liquidity L and the square root of the price rather than reserves, with L = √(xy) and √P = √(y/x), so that within a tick range the virtual reserves are x = L / √P and y = L × √P. Ticks sit at prices p(i) = 1.0001^i, one basis point apart; only ticks divisible by the pool's tick spacing can be range boundaries.

Two consequences the v3 whitepaper states plainly:

- **Out of range, a position earns nothing and holds one token.** "When the price exits a position's range, the position's liquidity is no longer active, and no longer earns fees. At that point, its liquidity is composed entirely of a single asset." If the price comes back, it becomes active again.
- **A narrow range is a limit order that can undo itself.** A position crossed by the price flips entirely into the other token; if it isn't withdrawn and the price crosses back, "the position will be traded back, effectively reversing the trade."

The real reserves a position holds at price P inside its range [Pa, Pb] are x = L(1/√P − 1/√Pb) and y = L(√P − √Pa).

### Worked numbers: in range and out

An LP puts liquidity on an ETH/USDC pool between 2,500 and 3,600 USDC per ETH while the price is 3,000, depositing 10 ETH.

| Quantity | Calculation | Result |
| --- | --- | --- |
| Liquidity from 10 ETH | 10 / (1/√3,000 − 1/√3,600) | L ≈ 6,286.34 |
| USDC needed alongside | L × (√3,000 − √2,500) | 30,000 USDC |
| Capital deposited | 10 × 3,000 + 30,000 | $60,000 |
| Same L in a v2-style full-range position | L/√3,000 ETH and L × √3,000 USDC | 114.77 ETH and 344,317 USDC, $688,634 |

The range position provides the same depth near 3,000 as $688,634 spread across all prices, about 11.5 times the capital efficiency, and so earns about 11.5 times the fees per dollar while the price stays in range. What happens as the price moves:

| ETH price | Position holds | Position value | Holding 10 ETH + 30,000 USDC instead | Earning fees |
| --- | --- | --- | --- | --- |
| 3,000 | 10 ETH + 30,000 USDC | $60,000 | $60,000 | Yes |
| 3,300 (in range) | 4.66 ETH + 46,806 USDC | $62,180 | $63,000 | Yes |
| 3,600 and above | 62,863 USDC, no ETH | $62,863 | $66,000 at 3,600, more above | No |
| 2,500 and below | 20.95 ETH, no USDC | $50,291 at 2,400 | $54,000 at 2,400 | No |

Above the range the LP has sold all its ETH on the way up, at an average of about 3,286, and keeps a fixed amount of USDC however high ETH goes. Below it the LP has bought ETH all the way down and holds only ETH. Concentration multiplies fee income and multiplies the loss against holding, discussed next, by the same factor; a range LP is selling options, and an active one rebalances its range as the price moves, paying gas and realizing that loss each time.

### What a platform shows

A v3 position is an NFT (in Uniswap's periphery) carrying its range and liquidity, and its value isn't a balance anyone can read from a token contract. A platform that shows customers their LP positions computes the amounts from L, the range and the pool's current √P at a known block, adds uncollected fees from the pool's fee growth accumulators, and labels in-range or out-of-range. Marking it from a token price feed alone is wrong.

## Hooks and the v4 Singleton

Uniswap v4 changes the architecture more than the math. All pools live in one contract: "`v4-core` uses a singleton-style architecture, where all pool state is managed in the `PoolManager.sol` contract." Integrators call `unlock`, and the manager calls back into the integrator's `unlockCallback`, inside which it can swap, add or remove liquidity, and move tokens across many pools; "Only the net balances owed to the user (positive) or to the pool (negative) are tracked throughout the duration of an unlock," and they must net to zero before the call ends. A multi-hop route through three pools moves tokens only once at the end rather than at each hop.

Hooks are contracts a pool names at creation, called before and after initialization, liquidity changes, swaps and donations. They can implement dynamic fees, on-chain limit orders, oracles, KYC gates or anything else, which also means a v4 pool is only as safe as its hook. Two details matter to an integrator:

- **Permissions live in the hook's address.** The `Hooks` library says v4 "decides whether to invoke specific hooks by inspecting the least significant bits of the address that the hooks contract is deployed to": 14 flags in the low 14 bits, `BEFORE_INITIALIZE_FLAG` at bit 13 down to `AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG` at bit 0, with `BEFORE_SWAP_FLAG = 1 << 7`. `validateHookPermissions` reverts if a hook's address doesn't encode exactly the permissions it declares. Reading the address tells a platform which callbacks a pool's hook can run.
- **Which hooks run is fixed; what they do may not be.** "*which* callbacks are executed on a pool cannot change after pool initialization," but "The callback logic, may be updated by the hooks dependent on their implementation." A hook behind a proxy can change behavior after a platform has reviewed it, so a hook is a contract to review like any other ([Upgradeable Proxies and Admin Keys](/books/investing-and-digital-assets/tokens-and-standards#upgradeable-proxies-and-admin-keys)). The "returns delta" flags let a hook take or give tokens on a swap, which is how a malicious hook would skim a trade.

My rule for a platform routing customer swaps: allow v4 pools with no hook or with hooks the platform has reviewed and pinned by address and code hash, and treat any other hooked pool as an unreviewed contract.

## Impermanent Loss

### The derivation

An LP in a constant product pool always holds tokens worth equal amounts at the pool price. When the price moves, arbitrageurs trade against the pool until it matches the market, which means the pool sells the token that went up and buys the one that went down. Compared with simply holding the original tokens, the LP ends with less of the winner and more of the loser.

For a v2 position with liquidity L, at price P the LP holds L/√P of the base token and L√P of the quote token, worth 2L√P. Holding the starting amounts instead (bought at P₀) is worth L/√P₀ × P + L√P₀. With r = P / P₀, the ratio of the two is 2√r / (1 + r), so the loss against holding is

IL(r) = 2√r / (1 + r) − 1

which is zero only at r = 1 and is the same for a price that doubles (r = 2) or halves (r = 0.5). It is called impermanent because it disappears if the price returns to P₀; it becomes permanent when the LP withdraws at a different price. Fees earned are the offset.

### Worked numbers: ETH doubles

An LP deposits 10 ETH and 30,000 USDC into a v2-style pool at 3,000 USDC per ETH, $60,000 in all, so L = √(10 × 30,000) ≈ 547.72. ETH goes to 6,000 (r = 2):

| | ETH | USDC | Value at 6,000 |
| --- | --- | --- | --- |
| LP position | 547.72/√6,000 = 7.071 | 547.72 × √6,000 = 42,426.41 | $84,852.81 |
| Holding instead | 10 | 30,000 | $90,000.00 |
| Difference | | | −$5,147.19, or −5.72% |

The formula agrees: 2√2 / 3 − 1 = −0.0572. Values for other moves: −0.6% at 1.25x, −2.0% at 1.5x, −5.7% at 2x or 0.5x, −20.0% at 4x or 0.25x. The position needs to earn more than 5.72% of its value in fees over the period for providing liquidity to beat holding. In a concentrated position the same move produces a larger loss relative to capital, as the v3 table shows, because the LP's whole position is in the range where the selling happens.

The loss is a transfer: it is the value LPs give to the arbitrageurs who trade against the pool's stale price every time the market moves. Fees are what pay LPs for it, which is the case for a v4 hook that charges a dynamic fee, higher when prices are moving fast.

## Aggregators and Routers

No single pool has the best price for most trades. An aggregator reads many pools and order sources, splits a trade across routes, and returns one transaction. 0x describes its Swap API as "Aggregated liquidity from 150+ sources"; the `/swap/allowance-holder/price` endpoint returns an indicative price and `/swap/allowance-holder/quote` a firm one whose response "includes a full 0x order, ready for submission to the network," with the transaction's `to`, `data`, `gas` and `value`, the expected `buyAmount` and a `minBuyAmount` floor. The integrator approves the contract the response names ("The correct allowance target is returned in `issues.allowance.spender`") and is warned to "do not approve the Settler contract" that executes the route. Robinhood's wallet routes swaps "via 0x API and LI.FI, decentralized exchange (DEX) aggregators."

What an aggregator changes for a platform:

- **The route is the execution.** The quote names the pools, the split and the floor. The platform stores it with the block or timestamp it was computed at, so a customer's complaint about price can be answered from the record.
- **The approval goes to one contract.** A wrong or spoofed allowance target is a drain; the platform pins the aggregator's contract addresses per chain and refuses any other spender ([Approvals, worked](/books/investing-and-digital-assets/tokens-and-standards#approvals-worked)).
- **Fees stack.** An aggregator's own fee, the integrator fee the app adds (0x's `swapFeeBps`, 0 to 1,000 bps, paid in the buy or sell token), pool fees inside the route and the network fee are four separate costs, and a customer disclosure shows them separately.

## Intents and Batch Auctions

Intent-based designs invert the AMM: the user signs what they want, and someone else figures out how to deliver it.

- **UniswapX.** "Swappers generate signed orders which specify the outputs of their swap." The order is a Dutch auction: "the order starts at a maximum price and decays down to a minimum price over time," and "Fillers are specialized participants that monitor signed orders and compete to settle them," using their own inventory or any on-chain route. Permit2 moves the swapper's tokens only "as long as the sent and received amounts match the decay curve." The swapper pays no gas and nothing for a failed attempt, and because there's no public transaction until a filler settles, there's nothing to sandwich.
- **CoW Protocol.** Users sign "trade intents"; "the protocol groups it alongside other intents in a batch," and "solvers" compete "to find the best execution paths." A solver first looks for a "Coincidence of Wants (CoW) within the existing batch": two users trading opposite directions are matched with each other and pay no pool fee or price impact on the matched amount.

The engineering differences from an AMM swap: the order is an off-chain signature with a deadline, not a transaction; its status lives with the protocol's API until a settlement transaction appears; and the price is decided by competition after the user signs, within the bounds the user signed. A platform integrating intents tracks the order through signed, open, filled or expired, and treats the signature itself as the risky moment, as with any permit ([Permits](/books/investing-and-digital-assets/tokens-and-standards#permits)).

## On-Chain Order Books: Hyperliquid

An order book can also be the chain. Hyperliquid's HyperCore keeps margin and matching engine state in consensus: it "does not rely on the crutch of off-chain order books," is "secured by HyperBFT, a variant of HotStuff consensus," and "currently supports approximately 200k orders/sec," with "end-to-end latency" of "a median 0.2 seconds and 99th percentile 0.9 seconds" for a co-located client, by its own documentation. "The Hyperliquid state consists of HyperCore and the general purpose HyperEVM," so contracts on the EVM side can interact with the book.

For an integrator this behaves more like a centralized exchange's API than a pool: limit orders, cancels and price-time priority, with a validator set rather than a company running the matching engine. It removes AMM price impact and impermanent loss and brings back the order book's problems: thin books, market maker withdrawal under stress, and liquidations driven by the venue's own marks (Perpetuals & Crypto Derivatives). The matching engine itself is Order Books & Matching Engines.

## How to Build It

A DEX is a `venues` row with `kind = 'dex'` and a `chain_id` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)); a customer swap through the platform is an `orders` row and an `executions` row whose `venue_exec_ref` is the settling transaction hash and log index. This chapter adds the pools themselves, their state at a block, the quotes shown to customers, and LP positions in customers' self-custody wallets ([Wallets](/books/investing-and-digital-assets/wallets#how-to-build-it)). Routes through aggregators and contract screening are [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform#how-to-build-it).

```sql
CREATE TABLE liquidity_pools (               -- one pool contract (or v4 pool ID) on one chain
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),   -- kind 'dex': Uniswap v3 on Base, ...
  chain_id            UUID NOT NULL REFERENCES chains (id),
  pool_ref            TEXT NOT NULL,          -- pair address, or the v4 PoolId
  design              TEXT NOT NULL CHECK (design IN ('constant_product', 'concentrated',
                        'concentrated_hooked', 'stableswap', 'order_book', 'other')),
  token0_network_id   UUID NOT NULL REFERENCES asset_networks (id),
  token1_network_id   UUID NOT NULL REFERENCES asset_networks (id),
  fee_pips            INT,                    -- millionths: 3000 = 0.30%; null if dynamic
  tick_spacing        INT,
  hook_address        TEXT,                   -- v4 only
  hook_flags          INT,                    -- low 14 bits of hook_address, decoded
  hook_review_id      UUID,                   -- contract_risk_reviews (Smart Contract Risk & Exploits)
  status              TEXT NOT NULL CHECK (status IN ('candidate', 'routable', 'blocked')),
  UNIQUE (chain_id, pool_ref),
  CHECK (token0_network_id <> token1_network_id),
  CHECK (design <> 'concentrated_hooked' OR hook_address IS NOT NULL)
);

CREATE TABLE pool_states (                   -- the pool as read at one block
  pool_id             UUID NOT NULL REFERENCES liquidity_pools (id),
  block_number        BIGINT NOT NULL,
  block_hash          TEXT NOT NULL,
  reserve0            NUMERIC(78, 0),         -- v2-style pools
  reserve1            NUMERIC(78, 0),
  sqrt_price_x96      NUMERIC(78, 0),         -- concentrated pools
  current_tick        INT,
  active_liquidity    NUMERIC(78, 0),
  spot_price          NUMERIC(38, 18) NOT NULL,  -- token1 per token0, decimals applied
  PRIMARY KEY (pool_id, block_hash)
);

CREATE TABLE swap_quotes (                   -- what the customer was shown before signing
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id            UUID REFERENCES orders (id),   -- null if the customer never proceeded
  self_custody_wallet_id UUID NOT NULL REFERENCES self_custody_wallets (id),
  sell_network_id     UUID NOT NULL REFERENCES asset_networks (id),
  buy_network_id      UUID NOT NULL REFERENCES asset_networks (id),
  sell_amount_base    NUMERIC(78, 0) NOT NULL,
  expected_buy_base   NUMERIC(78, 0) NOT NULL,
  min_buy_base        NUMERIC(78, 0) NOT NULL,       -- enforced on chain
  slippage_bps        INT NOT NULL,
  price_impact_bps    INT NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('direct_pool', 'aggregator', 'intent')),
  quoted_at_block     BIGINT,
  quote_payload_sha256 BYTEA NOT NULL,         -- the provider's response, stored separately
  platform_fee_base   NUMERIC(78, 0) NOT NULL DEFAULT 0,
  provider_fee_base   NUMERIC(78, 0) NOT NULL DEFAULT 0,
  est_network_fee     NUMERIC(78, 0),          -- in the chain's native asset
  disclosure_id       UUID REFERENCES disclosures (id),
  expires_at          TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (min_buy_base <= expected_buy_base),
  CHECK (slippage_bps BETWEEN 0 AND 5000)
);

CREATE TABLE lp_positions (                  -- liquidity a customer's self-custody wallet provides
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  self_custody_wallet_id UUID NOT NULL REFERENCES self_custody_wallets (id),
  pool_id             UUID NOT NULL REFERENCES liquidity_pools (id),
  position_ref        TEXT NOT NULL,          -- LP token balance holder, or the v3/v4 position token ID
  tick_lower          INT,                    -- null for full-range v2 positions
  tick_upper          INT,
  liquidity           NUMERIC(78, 0) NOT NULL,
  as_of_block         BIGINT NOT NULL,
  amount0_base        NUMERIC(78, 0) NOT NULL, -- computed from L, the range and sqrt price
  amount1_base        NUMERIC(78, 0) NOT NULL,
  uncollected_fees0   NUMERIC(78, 0) NOT NULL DEFAULT 0,
  uncollected_fees1   NUMERIC(78, 0) NOT NULL DEFAULT 0,
  in_range            BOOLEAN NOT NULL,
  UNIQUE (pool_id, position_ref, as_of_block)
);
```

Notes on the sketch:

- **Pools are allowlisted, not discovered.** Anyone can create a pool for any pair of tokens, including a pool pairing real USDC with a spoofed token of the same symbol. The router uses only `routable` pools whose tokens resolve to listed `asset_networks` by contract address ([Token Metadata and Spoofed Tokens](/books/investing-and-digital-assets/tokens-and-standards#token-metadata-and-spoofed-tokens)).
- **State is keyed by block hash,** like every chain observation ([Reorg-Safe Ingestion](/books/investing-and-digital-assets/chain-data-and-indexing#reorg-safe-ingestion)). A quote names its block, and a reorged block's state is dropped, not edited.
- **The minimum out is the customer's protection,** and the database refuses a quote whose floor is above its expectation or whose tolerance is absurd. A default tolerance chosen by the platform is a disclosure item.
- **Self-custody swaps don't post to the ledger.** A swap from a customer's own wallet is recorded as an order, quote and execution for best-interest, fee and tax records, but the tokens never were customer liabilities in `journal_lines`; the platform's fee, if it takes one on chain, is the only ledger line, as firm revenue.
- **LP positions are computed, not read.** Amounts come from the formula at a block; a position's value for display is those amounts at the platform's marks ([Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks)), with in-range state shown.
- **Events:** `swap_quote.shown`, `swap_quote.expired`, `lp_position.out_of_range` and `liquidity_pool.blocked` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every quote shown,** with the block, the route payload hash, the expected and minimum outputs, every fee component and the disclosure version, joined to the execution that followed or to nothing.
- **Execution against quote:** the realized output against expected and minimum for every swap, reviewed in aggregate for routes or providers that consistently land near the floor.
- **The pool allowlist** with who approved each pool, the token addresses it resolved, and every hooked pool's review.
- **LP position snapshots** for customers who see them, with the formula inputs, so a displayed value can be rebuilt.

## What This Means for the System You Build

- **Compute quotes the way the contract does,** in integers and base units, at a named block, and store the block with the quote.
- **Separate price impact from slippage** on the screen, and make the slippage tolerance a deliberate, disclosed default with a hard upper bound.
- **Route only through allowlisted pools** whose tokens resolve by contract address, and only through v4 hooks the platform has reviewed and pinned.
- **Pin aggregator contracts and allowance targets** per chain, and refuse any other spender a quote names.
- **Show every fee separately:** the platform's, the aggregator's, the pools' and the network's.
- **Compute LP positions from L, the range and the price,** label out-of-range, and explain impermanent loss before a customer provides liquidity.
- **Keep self-custody swaps out of the custodial ledger,** while keeping their records for disclosures, complaints and tax.

## References

**Standards and protocols**

- [Uniswap v2 Core whitepaper](https://app.uniswap.org/whitepaper.pdf), the constant product invariant, the 0.30% fee and switchable 0.05% protocol fee, the TWAP accumulator, the fee adjustment and the effective 3/997 fee
- [Uniswap v3 Core whitepaper](https://app.uniswap.org/whitepaper-v3.pdf), positions and virtual reserves, out-of-range behavior, range orders, ticks at 1.0001^i, fee tiers and tick spacings, L and √P
- [Uniswap v2-core: UniswapV2Pair.sol](https://raw.githubusercontent.com/Uniswap/v2-core/master/contracts/UniswapV2Pair.sol), the K check with the 3/1000 fee adjustment
- [Uniswap v2-periphery: UniswapV2Library.sol](https://raw.githubusercontent.com/Uniswap/v2-periphery/master/contracts/libraries/UniswapV2Library.sol), `getAmountOut` with the 997/1000 input adjustment
- [Uniswap v4-core: README](https://raw.githubusercontent.com/Uniswap/v4-core/main/README.md), the singleton `PoolManager`, `unlock` and `unlockCallback`, net balance tracking and fixed hook callbacks
- [Uniswap v4-core: Hooks.sol](https://raw.githubusercontent.com/Uniswap/v4-core/main/src/libraries/Hooks.sol), permissions in the low bits of the hook address, the 14 flags and `validateHookPermissions`

**Vendor documentation**

- [Uniswap: UniswapX overview](http://developers.uniswap.org/llms.mdx/docs/liquidity/uniswapx/overview), signed orders, the decaying Dutch auction, fillers, Permit2 and MEV protection
- [CoW Protocol documentation](https://docs.cow.fi/cow-protocol), trade intents, solvers, batch auctions and coincidences of wants
- [0x: Docs home](https://docs.0x.org/), aggregated liquidity from 150+ sources
- [0x: Swap tokens with 0x Swap API](https://docs.0x.org/evm/0x-swap-api/guides/swap-tokens-with-0x-swap-api), price and quote endpoints, the returned transaction, `minBuyAmount` and the allowance target
- [0x: Monetize your app using Swap API](https://docs.0x.org/evm/0x-swap-api/guides/monetize-your-app-using-swap), `swapFeeBps` from 0 to 1,000 and the fee token
- [Hyperliquid: HyperCore overview](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/overview), on-chain order books, HyperBFT, throughput and latency claims, and HyperEVM
- [Robinhood: Send, receive and swap crypto](https://robinhood.com/us/en/support/articles/send-receive-and-swap-crypto/), routing via 0x and LI.FI and the definition of slippage
