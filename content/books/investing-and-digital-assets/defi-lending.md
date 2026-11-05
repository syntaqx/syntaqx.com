+++
title = "DeFi Lending & Liquidations"
nav_title = "DeFi Lending"
description = "Aave and Compound mechanics: collateral factors, health factors, rate curves, liquidations with bonuses worked through, bad debt, parameters and RWA collateral."
category = "Investing & Digital Assets Industry"
order = 2563
part = "Decentralized Finance"
tags = ["defi", "lending", "liquidations", "aave", "compound", "collateral"]
+++

A DeFi lending protocol is a margin desk with no desk. Lenders deposit tokens into a pool and earn interest; borrowers deposit collateral worth more than they borrow and pay interest on the loan; and when a borrower's collateral falls too far, anyone in the world may repay part of the loan and take the borrower's collateral at a discount. There is no credit check, no margin call by phone and no grace period. The contract knows the collateral's price from an oracle, recomputes a single number for each borrower (the health factor), and opens the position to liquidation the moment that number drops below one.

The design rests on one bet: overcollateralization plus instant, permissionless liquidation keeps losses inside the borrower's own collateral, as long as liquidators can act faster than the price falls. When they can't (a price gaps, an oracle lags, a collateral market is too thin to absorb the sale), the pool is left with debt no collateral covers, and its lenders own the hole. This chapter covers the mechanics as Aave and Compound publish them: collateral factors and liquidation thresholds, the health factor, interest rate curves with worked numbers, liquidations with the bonus and close factor worked through, liquidation bots, bad debt and how protocols cover it, the governance parameters that decide all of the above, and real-world-asset collateral. It adds lending markets, market parameters, borrow positions, health checks and liquidation events to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Centralized crypto lending (Celsius, Genesis, prime brokers) is Prime Brokerage, OTC & Crypto Lending; broker margin is Margin & Short Selling; the oracles that feed the health factor are [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev).

## How the Protocols Do It

From their documentation and source code, as of November 2026:

| Protocol | Market structure | Collateral rule | Liquidation | Bad debt |
| --- | --- | --- | --- | --- |
| **Aave V3** | One pool per market; every listed asset can be supplied and, if enabled, borrowed | Per-asset LTV (borrowing limit) and a higher liquidation threshold; a health factor across all collateral | Below health factor 1.0; up to 50% of a debt per call, 100% at or below 0.95 or on small positions; fixed per-asset bonus, part of it taken as a protocol fee | Umbrella: stakers of aTokens are slashed to cover a deficit in the asset they staked |
| **Aave V4** | A Liquidity Hub holding shared liquidity, Spokes for "specific supply and borrowing use cases, asset types, or risk profiles" | Per Spoke; a user risk premium on top of the shared borrow rate | Repay only enough to reach a Target Health Factor; a bonus that rises as health falls, "a Dutch-auction style incentive" | Per design, isolated by Spoke |
| **Aave Horizon** | A "licensed, separate instance of the Aave Protocol" for real-world assets | RWA collateral is permissioned to holders allowlisted by the issuers | Aave mechanics | Aave mechanics |
| **Compound III** | One borrowable base asset per market (USDC, for example); other assets are collateral only | A borrow collateral factor per asset and a separate, higher liquidation collateral factor | `absorb` by anyone moves an underwater account's collateral to the protocol; `buyCollateral` sells it at a discount | Absorptions are "paid for by the protocol's reserves of the base asset" |

The two families make the same promise and differ in shape. Aave lets any asset be both collateral and loan, so one account can be long and short many tokens at once, and a single health factor summarizes it. Compound III narrows each market to borrowing one asset against a set of collateral assets, which makes risk easier to reason about and leaves supplied collateral idle: "Collateral assets that are supplied do not earn interest."

## Collateral Factors and the Health Factor

### Two thresholds

Every collateral asset carries two percentages, set by governance:

- **The borrowing limit** (Aave's loan-to-value, LTV; Compound's borrow collateral factor). Compound's example: "if the borrow collateral factor for WBTC is 85%, an account can borrow up to 85% of the USD value of its supplied WBTC in the base asset."
- **The liquidation threshold** (Aave's liquidation threshold; Compound's liquidation collateral factor, "separate and higher than borrow collateral factors"). The gap between the two is the buffer a borrower has after borrowing the maximum before liquidation.

### The health factor

Aave's `GenericLogic.calculateUserAccountData` sums each collateral's value times its liquidation threshold, divides by total debt, and returns the result in 18-decimal fixed point:

health factor = Σ (collateral value_i × liquidation threshold_i) / total debt value

With no debt it returns the maximum integer. Aave's liquidation documentation is direct about the test: a position is eligible "with a health factor below 1.0," checked in code as `healthFactor < 1e18`. The account's average LTV is computed the same way with each asset's LTV and sets how much more it may borrow.

### Worked numbers: a borrower's health

Take an illustrative market (the parameters are round numbers for the arithmetic, not any live market's settings): ETH collateral with an LTV of 80%, a liquidation threshold of 83% and a liquidation bonus of 5%, of which 10% goes to the protocol as a fee.

| | Value |
| --- | --- |
| Collateral | 10 ETH at 3,000 USDC = $30,000 |
| Maximum borrow | 30,000 × 80% = $24,000 |
| Actual borrow | 20,000 USDC |
| Health factor | 30,000 × 0.83 / 20,000 = **1.245** |
| Liquidation price for ETH | 20,000 / (10 × 0.83) = **2,409.64 USDC** |

The borrower can lose 19.7% on ETH before liquidation. A borrower who took the full $24,000 would start at a health factor of 1.0375 and be liquidatable after a 3.6% fall, which is why the gap between LTV and liquidation threshold is a governance decision about how much buffer borrowers get.

## Interest Rate Curves

### The kinked curve

Rates in these pools are set by formula from utilization, the share of supplied funds that is borrowed. Aave's `DefaultReserveInterestRateStrategyV2` takes four parameters per asset (an optimal usage ratio, a base variable borrow rate, slope 1 and slope 2). Below the optimal ratio the rate rises gently; above it, steeply:

- utilization U ≤ U_optimal: borrow rate = base + slope1 × U / U_optimal
- U > U_optimal: borrow rate = base + slope1 + slope2 × (U − U_optimal) / (1 − U_optimal)

The supply rate is what borrowers pay, spread over all suppliers, minus the protocol's cut: supply rate = borrow rate × U × (1 − reserve factor). The steep second slope is the pool's liquidity mechanism: when nearly everything is lent out, suppliers can't withdraw, so the rate rises until borrowers repay or new suppliers arrive.

### Worked numbers

An illustrative stablecoin pool with U_optimal = 90%, base 0%, slope 1 = 4%, slope 2 = 60% and a reserve factor of 10%:

| Utilization | Borrow rate | Supply rate |
| --- | --- | --- |
| 80% | 0 + 4% × 80/90 = 3.56% | 3.56% × 0.80 × 0.90 = 2.56% |
| 90% | 4.00% | 4.00% × 0.90 × 0.90 = 3.24% |
| 95% | 4% + 60% × (5/10) = 34.00% | 34.00% × 0.95 × 0.90 = 29.07% |

Five points of utilization above the kink multiply the borrow rate by 8.5. A platform showing a DeFi yield to customers is showing a number that can do that in a block, and the display has to say the rate is variable and set by the pool. Interest accrues through an index the pool updates on every interaction, and suppliers' balances (Aave's aTokens) grow with it; what is earned is a token balance, not a payment, which matters for tax (Crypto Tax).

## Liquidations

### The rules in Aave V3

From Aave's `LiquidationLogic` and liquidation documentation:

- **Eligibility:** health factor below 1.0.
- **Close factor:** a liquidator may repay up to 50% of a debt (`DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4`, in basis points) while the health factor is above 0.95 (`CLOSE_FACTOR_HF_THRESHOLD = 0.95e18`), "below (inclusive) which the full amount of debt becomes liquidatable." Positions whose collateral or debt is below $2,000 (`MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD = 2000e8`) can be liquidated in full.
- **No dust:** "If less than $1,000 USD of debt would remain in the target reserve, you must liquidate all of it" (`MIN_LEFTOVER_BASE`), so liquidations don't leave positions too small for anyone to bother clearing.
- **Collateral paid:** the repaid debt converted to the collateral asset at oracle prices, times the asset's liquidation bonus (`baseCollateral.percentMulFloor(liquidationBonus)`), capped at the borrower's balance.
- **Protocol fee:** taken "only from the bonus portion," as a percentage of the bonus, and sent to the treasury.

Aave V4 replaces the fixed bonus and close factor: liquidators "repay only enough debt to restore the position to a Target Health Factor set at the Spoke level," and the bonus rises as the health factor falls, prioritizing the riskiest positions.

### Worked numbers: a liquidation with bonus

ETH falls from 3,000 to 2,400. The borrower above now has collateral of 10 × 2,400 = $24,000 and a health factor of 24,000 × 0.83 / 20,000 = **0.996**. It is below 1.0 and above 0.95, so the close factor is 50%.

| Step | Calculation | Result |
| --- | --- | --- |
| Debt the liquidator repays | 50% × 20,000 | 10,000 USDC |
| Collateral at oracle value | 10,000 / 2,400 | 4.1667 ETH |
| With the 5% bonus | 4.1667 × 1.05 | 4.3750 ETH |
| Bonus portion | 4.3750 − 4.1667 | 0.2083 ETH ($500) |
| Protocol fee, 10% of the bonus | 0.2083 × 10% | 0.0208 ETH ($50) |
| Liquidator receives | 4.3750 − 0.0208 | 4.3542 ETH ($10,450) |
| Borrower left with | 10 − 4.375 ETH, and 10,000 USDC of debt | 5.625 ETH ($13,500) |
| Health factor after | 13,500 × 0.83 / 10,000 | **1.1205** |

The liquidator made $450 before gas and before the price risk of holding ETH, and the borrower paid $500 for being liquidated (the bonus), plus the $50 fee that went to the protocol. The position is healthy again with half its debt. Compound III's version differs in shape: `absorb` "can be called by any address to liquidate an underwater account," the protocol takes the collateral and credits the account the collateral's value minus a penalty, and liquidators then `buyCollateral` from the protocol "at a discount" derived from the store-front price factor and the asset's liquidation factor, while protocol reserves are below a governance-set target.

### Bots and the race

Nobody employs liquidators. They are bots run by trading firms and individuals that watch every borrower's health factor, compute the profit of a liquidation at current prices, and submit the transaction when it is positive; Aave's integration guide advises "Only liquidate when the liquidation bonus exceeds gas costs." Many borrow the repayment amount within the same transaction (a flash loan) and sell the seized collateral on a DEX before the transaction ends, so a liquidator needs no capital, only speed. The race for each liquidation is a block-ordering contest: whoever's transaction lands first wins the bonus, which makes liquidations one of the main sources of MEV ([Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#arbitrage-and-liquidations)). Bots are the reason the system works and the reason borrowers can't count on a gentle unwinding: on a fast move, positions are liquidated the moment they cross 1.0, to the 50% limit, and again if they fall further.

## Bad Debt

### How it happens

Liquidation works only while the collateral is worth more than the debt plus the bonus. If ETH gaps from 3,000 to 2,000 before any liquidation lands, the borrower's $20,000 of collateral equals its $20,000 of debt, and the health factor is 0.83, below 0.95, so the full debt is liquidatable. But a liquidator repaying X receives X / 2,000 × 1.05 ETH, so the whole 10 ETH covers only 10 × 2,000 / 1.05 = $19,047.62 of debt. The remaining **$952.38** has no collateral behind it. It is bad debt: the pool's books show the loan as an asset its suppliers own, and nobody will ever repay it.

The causes in practice:

- **Price gaps and congestion.** The price moves faster than liquidations can land, often because the chain is congested by everyone trying to liquidate at once.
- **Thin collateral markets.** A large position in a token with little on-chain liquidity can't be sold by liquidators at anything near the oracle price, so no liquidation is profitable even when the health factor says it should happen.
- **Oracle manipulation.** A collateral price pushed up lets an attacker borrow against value that isn't there and walk away (the Mango Markets case, in [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#oracle-manipulation)).
- **Bugs.** A missing health check can let an attacker create bad debt directly, as in Euler's 2023 exploit ([Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk#exploit-post-mortems-by-class)).

### Who covers it

A pool with bad debt has three choices: socialize it across suppliers (each supplier's claim is worth slightly less than their balance shows), cover it from protocol reserves or treasury, or cover it from a pool of stakers who agreed to take first loss. Aave's Umbrella is the third: "a modular, onchain risk management system that automates bad debt coverage for Aave V3 pools." Stakers stake aTokens of a specific asset on a specific network, keep earning its yield plus incentives, and accept "the possibility of slashing if a deficit arises on the specific pool and asset they have staked"; a deficit is covered in kind, since "burning aUSDT directly covers USDT bad debt without requiring market sales." Withdrawal requires a 20-day cooldown and a 2-day window, and "During cooldown, rewards continue to accrue and funds remain slashable." Compound III pays absorptions from base-asset reserves.

For a platform the design question is the same one a clearing house answers with a default waterfall (Clearing & Settlement): who loses, in what order, and how fast. A customer supplying to a DeFi pool through a platform holds a claim whose value depends on that waterfall, and the disclosure has to say so.

## Governance Parameters

Almost every number in this chapter is a parameter: which assets are listed, LTV and liquidation threshold, bonus and protocol fee, supply and borrow caps (Compound's "Collateral can only be added if the market is below its `supplyCap`"; its `baseBorrowMin` refuses tiny borrows), rate curve slopes and kinks, reserve factors, oracle sources and, in Compound III, the reserve target that turns collateral sales on and off. Each is set by the protocol's token-holder governance, usually on the advice of paid risk managers, and executed through a timelock.

What that means for an integrator:

- **Parameters change.** A collateral factor lowered by governance can push existing borrowers toward liquidation with no price move. A platform whose customers borrow on a protocol watches parameter-change proposals and their execution dates, and warns affected customers before the change lands.
- **Listings are risk decisions.** A thin token listed as collateral is a bad-debt option written by every supplier to the pool; caps limit how much of it can enter.
- **Governance itself is an attack surface:** a proposal can do anything the timelock can execute ([Governance attacks](/books/investing-and-digital-assets/smart-contract-risk#governance-and-timelocks)).

## Real-World-Asset Collateral

Tokenized securities are now collateral in permissioned corners of these protocols. Aave Horizon is "a licensed, separate instance of the Aave Protocol," where "RWA collateral is permissioned: only qualified users allowlisted by the RWA issuers can supply it," qualification follows "standard institutional onboarding," and "The primary borrowable assets are permissionless stablecoins such as USDC, RLUSD, and GHO." On September 25, 2026 Aave announced Coinbase's tokenized stocks (AAPLc, AMZNc, GOOGLc, METAc, MSFTc, NVDAc and TSLAc) as collateral on Aave V4 on Base, available "only to eligible non-U.S. persons in permitted jurisdictions," with USDC as the only borrowable asset; prices come from Chainlink feeds that publish from Sunday 20:00 to Friday 20:00 ET, and over weekends and holidays the last price is held.

Two mechanics differ from crypto collateral:

- **The token's transfer rules bind the liquidator.** A permissioned token can only move to allowlisted holders, so liquidation needs liquidators the issuer has approved, or the protocol has to hold and sell seized collateral itself. The allowlist is part of the risk model (Transfer Agents & Permissioned Tokens).
- **The underlying market closes.** A stock token's oracle stops when its market does; positions can't be liquidated on a price that doesn't update, so a Monday open that gaps down hits every position at once. Weekend caps and lower collateral factors are how a protocol prices that. Tokenized funds as collateral and stablecoin reserves are Tokenized Treasuries & Funds.

## How to Build It

A platform touches DeFi lending in two ways: it shows customers their positions in protocols reached from a self-custody wallet ([Wallets](/books/investing-and-digital-assets/wallets#how-to-build-it)), and it may hold its own treasury in lending pools. Either way it needs the market's parameters as they were at a block, each position's computed health, and every liquidation that touched a position. The tables extend `instruments` and `positions` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model); oracle readings behind each health check are `oracle_readings` in [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#how-to-build-it).

```sql
CREATE TABLE lending_markets (               -- one pool, Comet market or Spoke
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),  -- the protocol on one chain
  chain_id            UUID NOT NULL REFERENCES chains (id),
  protocol            TEXT NOT NULL,          -- 'aave_v3', 'aave_v4', 'compound_v3', ...
  market_ref          TEXT NOT NULL,          -- pool, Comet or Spoke address
  base_instrument_id  UUID REFERENCES instruments (id),  -- Compound III base asset; null for Aave
  permissioned        BOOLEAN NOT NULL DEFAULT false,    -- Horizon-style allowlisted collateral
  risk_review_id      UUID,                   -- contract_risk_reviews (Smart Contract Risk & Exploits)
  status              TEXT NOT NULL CHECK (status IN ('candidate', 'supported', 'withdraw_only',
                        'unsupported')),
  UNIQUE (chain_id, market_ref)
);

CREATE TABLE market_parameters (             -- versioned: one row per asset per change
  market_id           UUID NOT NULL REFERENCES lending_markets (id),
  asset_network_id    UUID NOT NULL REFERENCES asset_networks (id),
  effective_block     BIGINT NOT NULL,
  ltv_bps             INT NOT NULL,           -- borrowing limit
  liquidation_threshold_bps INT NOT NULL,
  liquidation_bonus_bps INT NOT NULL,         -- 10500 = 5% bonus, as Aave stores it
  protocol_fee_bps    INT NOT NULL DEFAULT 0, -- share of the bonus
  supply_cap_base     NUMERIC(78, 0),
  borrow_cap_base     NUMERIC(78, 0),
  rate_model          JSONB NOT NULL,         -- optimal usage, base, slope1, slope2, reserve factor
  oracle_feed_id      UUID,                   -- oracle_feeds (Oracles & MEV)
  governance_ref      TEXT,                   -- proposal ID that set it
  PRIMARY KEY (market_id, asset_network_id, effective_block),
  CHECK (liquidation_threshold_bps >= ltv_bps)
);

CREATE TABLE borrow_positions (              -- a customer wallet's position in one market
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  market_id           UUID NOT NULL REFERENCES lending_markets (id),
  self_custody_wallet_id UUID REFERENCES self_custody_wallets (id),
  firm_wallet_id      UUID REFERENCES wallets (id),       -- the platform's own treasury
  opened_at_block     BIGINT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('open', 'liquidated', 'closed')),
  CHECK ((self_custody_wallet_id IS NULL) <> (firm_wallet_id IS NULL))
);

CREATE TABLE health_checks (                 -- the platform's recomputation at a block
  position_id         UUID NOT NULL REFERENCES borrow_positions (id),
  block_number        BIGINT NOT NULL,
  block_hash          TEXT NOT NULL,
  collateral_value    NUMERIC(38, 18) NOT NULL,   -- in the market's base currency
  weighted_collateral NUMERIC(38, 18) NOT NULL,   -- sum of value x liquidation threshold
  debt_value          NUMERIC(38, 18) NOT NULL,
  health_factor       NUMERIC(38, 18),            -- null when there is no debt
  protocol_health_factor NUMERIC(78, 0),          -- the contract's own answer, 1e18 scale
  liquidation_prices  JSONB NOT NULL,             -- per collateral asset, all else equal
  band                TEXT NOT NULL CHECK (band IN ('safe', 'watch', 'warn', 'liquidatable')),
  PRIMARY KEY (position_id, block_hash)
);

CREATE TABLE liquidation_events (            -- read from the chain, never initiated for customers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  position_id         UUID NOT NULL REFERENCES borrow_positions (id),
  onchain_transaction_id UUID NOT NULL REFERENCES onchain_transactions (id),
  log_index           INT NOT NULL,
  liquidator          TEXT NOT NULL,
  debt_network_id     UUID NOT NULL REFERENCES asset_networks (id),
  debt_repaid_base    NUMERIC(78, 0) NOT NULL,
  collateral_network_id UUID NOT NULL REFERENCES asset_networks (id),
  collateral_seized_base NUMERIC(78, 0) NOT NULL,
  protocol_fee_base   NUMERIC(78, 0) NOT NULL DEFAULT 0,
  health_before       NUMERIC(38, 18),
  health_after        NUMERIC(38, 18),
  bad_debt_base       NUMERIC(78, 0) NOT NULL DEFAULT 0,
  UNIQUE (onchain_transaction_id, log_index)
);
```

Notes on the sketch:

- **Parameters are history.** A health factor is only reproducible with the thresholds in force at its block, so parameters are versioned by `effective_block` and never updated in place. A governance change scheduled in a timelock is inserted as a future row the moment it is queued, which is what lets the platform warn customers before it takes effect.
- **Two health factors, compared.** The platform computes its own and reads the contract's; a disagreement beyond rounding is a bug in the platform's model or a parameter it missed, and the contract's number is the one liquidators act on.
- **Bands drive notifications.** `watch`, `warn` and `liquidatable` thresholds (say 1.5, 1.2 and 1.0) trigger messages to the customer with the liquidation price for each collateral asset. The platform can't stop a liquidation on a self-custody position and must not imply it can.
- **Liquidations are observed, not booked.** For self-custody positions the platform records the on-chain event for the customer's history and tax records; for its own treasury the same event also posts journal lines moving collateral out and debt down, with the bonus as a realized loss.
- **Events:** `health_check.band_changed`, `market_parameters.change_queued`, `liquidation_event.observed` and `liquidation_event.bad_debt` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every health factor shown to a customer,** with the block, prices, parameters and the contract's own answer.
- **Every warning sent:** the band, the liquidation prices quoted and when the customer was told, against when a liquidation followed.
- **Parameter history** for every supported market, with the governance proposal that set each value.
- **Every liquidation** touching a customer position or the treasury, with debt repaid, collateral seized, fees and any bad debt left.
- **Treasury exposure:** the platform's own supply and borrow positions by protocol and market, reconciled against chain state daily ([Treasury Reconciliation](/books/investing-and-digital-assets/hot-and-cold-wallets#treasury-reconciliation)).

## What This Means for the System You Build

- **Compute health factors yourself and read the contract's,** at the same block, and alert on disagreement.
- **Version market parameters by block** and pick up queued governance changes before they execute.
- **Show liquidation prices per collateral asset** and warn in bands well above 1.0, without implying the platform can prevent a liquidation.
- **Describe DeFi yields as variable and formula-set,** with the utilization curve's steep side explained.
- **Disclose the bad-debt waterfall** of any pool customers supply to: who loses first, and how much stands in front of them.
- **Treat thin collateral and permissioned collateral as different risks:** one fails because nobody can sell it, the other because only approved holders can.
- **Book only the treasury's positions in the ledger;** customers' self-custody positions are records, not liabilities.

## References

**Standards and protocols**

- [Aave: Liquidations](https://aave.com/docs/concepts/liquidations), eligibility below health factor 1.0, the $1,000 leftover rule, bonus against gas, and V4's Dutch-auction bonus
- [Aave V3 origin: LiquidationLogic.sol](https://raw.githubusercontent.com/aave-dao/aave-v3-origin/main/src/contracts/protocol/libraries/logic/LiquidationLogic.sol), the 50% close factor, the 0.95 threshold, the $2,000 and $1,000 limits, the bonus calculation and the protocol fee on the bonus
- [Aave V3 origin: GenericLogic.sol](https://raw.githubusercontent.com/aave-dao/aave-v3-origin/main/src/contracts/protocol/libraries/logic/GenericLogic.sol), the weighted liquidation threshold, the health factor and average LTV
- [Aave V3 origin: DefaultReserveInterestRateStrategyV2.sol](https://raw.githubusercontent.com/aave-dao/aave-v3-origin/main/src/contracts/misc/DefaultReserveInterestRateStrategyV2.sol), the kinked variable rate and the supply rate with reserve factor
- [Aave: Aave V4](https://aave.com/docs/aave-v4), the Liquidity Hub and Spokes, Target Health Factor liquidations, the Dutch-auction bonus and the user risk premium
- [Aave: Umbrella](https://aave.com/docs/aave-v3/umbrella), staked aToken coverage of deficits, slashing, the 20-day cooldown and the 2-day window
- [Aave: Horizon](https://aave.com/docs/aave-v3/horizon), the licensed RWA instance, issuer allowlists and borrowable stablecoins
- [Compound III: Collateral and borrowing](https://docs.compound.xyz/collateral-and-borrowing/), the base asset, idle collateral, the 85% WBTC example, supply caps and the minimum borrow
- [Compound III: Liquidation](https://docs.compound.xyz/liquidation/), liquidation collateral factors, `absorb`, `buyCollateral`, the store-front discount, reserves and the target reserve

**In practice**

- [Aave: Aave V4 launches on Avalanche](https://aave.com/blog/aave-v4-live-avalanche), July 15, 2026, V4's first multi-chain deployment with a shared Core Liquidity Hub
- [Aave: Coinbase Tokenized Stocks now live on Aave V4](https://aave.com/blog/coinbase-tokenized-stocks), September 25, 2026, seven stock tokens as collateral on Base for eligible non-US persons, USDC borrowing and weekend price holds
