+++
title = "Oracles & MEV"
description = "Price oracles (Chainlink, TWAPs), oracle manipulation and the Mango Markets case, MEV with a worked sandwich, Flashbots, PBS, private order flow and user cost."
category = "Investing & Digital Assets Industry"
order = 2564
part = "Decentralized Finance"
tags = ["defi", "oracles", "mev", "chainlink", "flashbots", "market-manipulation"]
+++

A smart contract can't look anything up. It knows its own storage, the block it runs in and whatever a transaction hands it, and nothing else, so every price a lending pool liquidates on and every mark a derivatives protocol settles against has to be written onto the chain by someone. That someone is an oracle, and the price it writes is the most valuable input in decentralized finance: move it, even for one block, and a pool will lend against collateral that isn't there or liquidate positions that were solvent.

The chain's ordering is the second input nobody sees on a quote screen. A transaction waits in a public mempool where anyone can read it before it lands, and whoever builds the block decides the order of everything in it. A trade that moves a pool's price is information; a bot that sees it can buy first and sell right after, and the trader pays the difference. The value extractable by choosing what goes into a block, and in what order, is MEV, and an industry of searchers, builders and relays now exists to capture and auction it.

This chapter covers price oracles (Chainlink's push feeds, Uniswap's time-weighted prices, pull oracles), how oracles are manipulated and what happened in the Mango Markets case, MEV with a sandwich attack worked through, arbitrage and liquidations, Flashbots, MEV-Boost and proposer-builder separation, private order flow, and what it all costs a user. It adds oracle feeds, oracle readings and private submissions to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. A platform's own marks for its ledger are [Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks); the pools being traded are [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms); manipulation surveillance on a regulated venue is Market Surveillance & Manipulation.

## How the Providers Do It

From their documentation, as of November 2026:

| Provider | What it does | How it updates or works | What a consumer must check |
| --- | --- | --- | --- |
| **Chainlink Data Feeds** | Prices "aggregated from many sources by decentralized oracle networks and published onchain" | A new round when off-chain values deviate from the on-chain value by more than a threshold, or when a heartbeat interval has passed | `updatedAt` freshness; on rollups, the L2 sequencer uptime feed and a grace period |
| **Uniswap v3 TWAP** | Each pool's own price history | An accumulator of the tick (log base 1.0001 of price) per second, up to 65,535 stored observations | The window length against what manipulation of it would cost |
| **Pyth** | Pull-model signed prices | "Each transaction carries a signed price, verified on the spot," or a stored update any contract can read until replaced | Publish time and confidence of each update |
| **Flashbots Protect** | A private RPC for users' transactions | Transactions go to "a private Flashbots mempool where they will be hidden from frontrunning and sandwich bots" | Inclusion can be slower; refund settings |
| **MEV-Boost** | Validator middleware for an external block-building market | Builders bid through relays; the validator proposes the most profitable block | Relay trust; censorship policy of the relays used |
| **MEV-Share** | An order flow auction | Users are "paid back specified percentage (by default 90%) of the MEV their transactions create" | What information the user's hints reveal |

Chainlink's documentation puts the burden where it belongs: responsibility for "data quality checks, circuit breakers, and appropriate contingency logic for their use case" sits with the developer who reads the feed.

## Price Oracles

### Push feeds

Chainlink's decentralized data model starts a new aggregation round under two triggers: "when a node identifies that the off-chain values deviate ... by more than the defined deviation threshold from the onchain value," and a heartbeat, "after a specified amount of time from the last update." Between rounds the on-chain value doesn't move, so a feed with a 0.5% deviation threshold can be 0.49% wrong indefinitely until the heartbeat fires. The consumer reads `latestRoundData`, which returns `roundId`, `answer` ("The data that this specific feed provides"), `startedAt`, `updatedAt` ("Timestamp of when the round was updated") and `answeredInRound`, now deprecated.

Two checks every consumer needs. Freshness: Chainlink's risk guidance describes circuit breakers that "monitor data feeds for unexpected scenarios such as stale prices" and controls "that detect stale, delayed, missing, or unexpected values." On a rollup, the sequencer: the L2 sequencer uptime feed reports 0 when "The sequencer is up" and 1 when "The sequencer is down," and a consumer should "wait for the GRACE_PERIOD_TIME to pass before accepting answers from the data feed" after it comes back, because users who couldn't transact during the outage deserve time to repair positions before liquidations resume. A consumer contract in Solidity, the platform-dictated language here:

```solidity
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

function safePrice(
    AggregatorV3Interface feed, AggregatorV3Interface sequencerUptime,
    uint256 maxAge, uint256 gracePeriod
) view returns (uint256) {
    (, int256 down, uint256 since, , ) = sequencerUptime.latestRoundData();
    require(down == 0, "sequencer down");
    require(block.timestamp - since > gracePeriod, "grace period");
    (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
    require(answer > 0, "bad answer");
    require(block.timestamp - updatedAt <= maxAge, "stale");   // maxAge from the feed's heartbeat
    return uint256(answer);                                    // scaled by feed.decimals()
}
```

<!-- source-gap: chainlink-feed-parameters | missing | Chainlink's deviation and heartbeat values for specific widely used feeds (e.g. ETH/USD on Ethereum) | closes with: a docs.chain.link feed page or the data.chain.link listing opened (docs.chain.link returned 404 to the fetcher; architecture and API pages read from the documentation repository) | checked: 2026-11-05 --> The deviation and heartbeat values of specific feeds aren't given here because the pages that list them didn't load; the consumer's `maxAge` should come from the published heartbeat of the exact feed it reads.

### Time-weighted prices from pools

A DEX pool is an oracle of its own price. Uniswap v2 added an accumulator that sums the price each second, so a caller can "checkpoint the accumulator's value at t1 and then again at t2, subtract the first value from the second, and divide by the number of seconds elapsed" to get a time-weighted average price (TWAP). The whitepaper's trade-off: "Choosing a longer period makes it more expensive for an attacker to manipulate the TWAP, although it results in a less up-to-date price." It also stores the last recorded balances rather than reading live ones, because otherwise "an attacker could manipulate the oracle by sending an asset to the contract immediately before calling it."

Uniswap v3 accumulates the tick instead: "The tick accumulator stores the cumulative sum of the active tick at the time of the observation," growing "by the value of the current tick - per second," so "using an arithmetic mean tick to derive a price corresponds to a geometric mean price." The pool stores up to 65,535 observations (each one a timestamp, a tick cumulative and a liquidity cumulative), overwritten as a ring buffer, and starts with one; anyone willing to pay the gas can extend it.

The geometric mean is what makes manipulation arithmetic easy. To move a v3 TWAP, an attacker has to hold the pool's price away from the market for part of the window, paying arbitrageurs every block to do it:

| Attack | TWAP effect over a 30-minute (1,800 s) window |
| --- | --- |
| Double the price for one 12-second block | 2^(12/1,800) − 1 = **+0.46%** |
| Move the TWAP 10% by holding the price at 2x | 1,800 × ln(1.1) / ln(2) = **about 248 seconds**, roughly 21 consecutive blocks |

A one-block manipulation barely moves a 30-minute TWAP, which is why lending protocols that use pool prices use long windows on deep pools, and why a TWAP on a thin pool is not a price at all. The cost of the sustained attack is the arbitrage loss on every block, which on a deep pool is very large and on a thin one is not. The cost of a long window is lag: in a real crash, a 30-minute TWAP is still showing the old price while liquidations should be happening.

### Pull oracles

Pyth's documentation describes the alternative: "Each transaction carries a signed price, verified on the spot," or "A signed update is verified and stored on-chain" and "Any contract can read the stored price until a newer update replaces it." The user or keeper brings a fresh signed price into the transaction that needs it, so there's no heartbeat lag, and the consumer checks the update's publish time and confidence instead.

## Oracle Manipulation

### The pattern

Every oracle attack has the same shape. The attacker finds a protocol that values something using a price the attacker can move more cheaply than the protocol will pay out against it: a spot price from one pool, a TWAP on a thin pool, an off-chain index built from a few thin exchanges. They move the price, use the moved price (borrow against inflated collateral, liquidate others, settle a derivative), and let the price fall back. The defense is in the economics, not the code: the cost of moving the oracle has to exceed what any position valued by it can extract, which means caps on how much can be borrowed against thinly traded collateral, oracles built from many deep venues, and refusal to use a protocol's own market as its oracle.

### Mango Markets, October 2022

Mango Markets was a Solana lending and derivatives protocol whose MNGO token was both its governance token and accepted collateral. Per the CFTC's January 2023 complaint, Avraham Eisenberg took "large leveraged positions in a swap contract whose value was based upon the relative price of MNGO" against USDC, then pushed up the price by "rapidly purchasing substantial quantities of MNGO on three digital asset exchanges" whose prices fed the oracle; the oracle price "jumped over 13-fold during a 30-minute span." The SEC's complaint describes the same scheme starting October 11, 2022: one account sold MNGO perpetuals and a second bought them, he bought the thinly traded token, and he borrowed against the inflated position, withdrawing nearly all available assets. The CFTC put the withdrawal at "over $110 million"; he returned approximately $67 million and kept about $47 million. The SEC alleged $116 million and called MNGO a "so-called governance token that was offered and sold as a security."

The legal outcome turned on whether this was fraud at all. A jury in the Southern District of New York convicted Eisenberg in April 2024 of commodities fraud, commodities manipulation and wire fraud. On May 23, 2025, Judge Arun Subramanian vacated all three convictions: the government had not proven venue for the commodities counts, and on wire fraud the court found Eisenberg did not make "a materially false statement or deception sufficient to constitute fraud" (as reported by TRM Labs). <!-- source-gap: mango-eisenberg-appeal | secondary | Eisenberg's convictions vacated May 23, 2025 on venue and misrepresentation grounds; whether the government appealed and the status of the SEC and CFTC civil cases | closes with: the S.D.N.Y. opinion on CourtListener (US v. Eisenberg, 1:23-cr-00010) and the Second Circuit docket, or a DOJ release | checked: 2026-11-05 --> The ruling is cited here from a secondary report, and whether the government appealed couldn't be confirmed from a primary source.

The lessons for a platform don't depend on the verdict:

- **"Code is law" isn't a defense a platform can rely on,** and neither is it a reliable prosecution theory. Whether manipulating a protocol is a crime is unsettled; whether a platform that let it happen to its customers has a problem is not.
- **A token's own market is the worst oracle for it.** MNGO's price came from thin exchanges, and the protocol let it back borrowing of liquid assets.
- **Governance tokens as collateral are circular.** The attacker then used the governance he'd acquired to vote on terms for returning part of the funds.

## MEV

### What it is

"Maximal extractable value (MEV) refers to the maximum value that can be extracted from block production" beyond the standard reward and fees, by including, excluding or reordering transactions, per ethereum.org. The 2019 paper that introduced the term, Daian and others' "Flash Boys 2.0," documented bots in "priority gas auctions (PGAs), competitively bidding up transaction fees" to get ahead of each other, and warned that "miner extractable value (MEV)" posed "a realistic threat to Ethereum." Since Ethereum's move to proof of stake the M stands for maximal, and the extraction has become a market: searchers find opportunities, builders assemble blocks, relays pass them to validators.

### Sandwiches

A sandwich needs one thing: a pending swap whose slippage tolerance leaves room. The attacker buys just before it (front-run), the victim's swap executes at the worse price the attacker created, and the attacker sells right after (back-run). ethereum.org notes "Sandwiching, however, is riskier as it isn't atomic," since the attacker's two trades bracket someone else's.

**Worked numbers.** The pool from [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms#worked-numbers-a-10-eth-sale): 1,000 ETH and 3,000,000 USDC, a 0.30% fee. A user submits a swap of 300,000 USDC for ETH through the public mempool with a 1% slippage tolerance.

| Step | Trade | Pool after (ETH / USDC) | Price |
| --- | --- | --- | --- |
| Quote | Alone, 300,000 USDC buys 90.661 ETH; minimum out at 1% = 89.754 ETH | 1,000 / 3,000,000 | 3,000.00 |
| 1. Front-run | Attacker buys 5.2419 ETH for 15,856.07 USDC (avg 3,024.88) | 994.76 / 3,015,856 | 3,031.75 |
| 2. Victim | 300,000 USDC buys exactly 89.754 ETH, the minimum (avg 3,342.45) | 905.00 / 3,315,856 | 3,663.91 |
| 3. Back-run | Attacker sells 5.2419 ETH for 19,038.24 USDC (avg 3,631.95) | 910.25 / 3,296,818 | 3,621.90 |

The attacker's gross profit is 19,038.24 − 15,856.07 = **3,182.17 USDC**, out of which it pays gas for two transactions and, in practice, most of the rest to the builder as a bid to get the bundle included in that order. The victim received 89.754 ETH instead of 90.661, 0.907 ETH less, about $3,000 at the price it paid. The attacker sized the front-run to push the victim exactly to its floor; a tighter tolerance would have shrunk the opportunity, and at 0.1% this sandwich would barely cover its gas. That is the whole defense available to a user in a public mempool: a tight tolerance or a private route.

### Arbitrage and liquidations

Not all MEV harms the user whose transaction created it:

- **Arbitrage** keeps pools at market prices: "someone can buy the token on the lower-priced DEX and sell it on the higher-priced DEX in a single, atomic transaction." The cost falls on LPs, as the loss to arbitrageurs described in [Impermanent Loss](/books/investing-and-digital-assets/dexs-and-amms#impermanent-loss).
- **Liquidations** are a race for the bonus; on lending protocols "the protocol typically allows anyone to liquidate the collateral, instantly paying off the lenders" ([DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending#bots-and-the-race)). The borrower pays the bonus whoever wins, but the race decides whether the bonus goes to a searcher or, through bidding, to the block's builder and proposer.
- **Back-running** an oracle update, a large trade or a liquidation captures the price move after it, without hurting the trade that caused it.

## Flashbots, MEV-Boost and PBS

Flashbots states its mission as to "mitigate the negative externalities posed by Maximal Extractable Value (MEV)." Its MEV-Boost is "open source middleware run by validators to access a competitive block-building market": "Builders produce blocks containing transaction orderflow and a fee for the block proposing validator," relays "identify the most profitable block to submit to the block proposer," and the validator signs a header without seeing the transactions until it commits. Flashbots claims an increase of over 60% in staking rewards for validators that run it.

This is proposer-builder separation (PBS) done outside the protocol. ethereum.org calls the builder API "a temporary solution aimed at providing a working implementation of proposer-builder separation" and states PBS's purpose: "Separating out block builders and block proposers makes it much harder for block builders to censor transactions." The trust problem is the relay: a proposer trusts it to deliver a valid block for the header it signed, and builders trust it not to steal their bundles. EIP-7732, "Enshrined Proposer-Builder Separation," would move builders into the protocol as a new role with payload timeliness attestations by validators. As of November 2026 it is in Last Call (deadline November 1, 2026) and listed among the EIPs scheduled for the Glamsterdam upgrade in EIP-7773, which activated on the Sepolia and Hoodi testnets on October 6 and October 26, 2026; the mainnet activation time is not yet set.

## Private Order Flow

A user who doesn't want to be sandwiched has to keep the transaction out of the public mempool until it is in a block. The options:

- **Private RPCs.** Flashbots Protect sends transactions to its private mempool, includes them "only ... if they do not revert" (so "Users do not pay fees for failed transactions"), and pays back part of any MEV the transaction creates: "If your transaction creates MEV, you can earn an MEV refund." The trade-off is inclusion speed when the receiving builders don't win the block.
- **Order flow auctions.** MEV-Share shares hints about the transaction with searchers "according to their privacy preferences," lets them bid to back-run it, and requires that the user be paid "by default 90%" of the MEV created.
- **Intents.** UniswapX and CoW Protocol take a signed order instead of a transaction, so there is nothing to sandwich and fillers or solvers compete to give the user the surplus ([Intents and Batch Auctions](/books/investing-and-digital-assets/dexs-and-amms#intents-and-batch-auctions)).

Private order flow has its own concentration problem: a wallet that sends all its users' transactions to one builder makes that builder more likely to win blocks, and exclusive flow is a business asset. A platform choosing a route for its customers' transactions is choosing who sees them first, and that choice belongs in its order routing disclosure the way a broker discloses where it sends orders (Order Routing, PFOF & Best Execution).

## What It Costs a User

For a customer of a platform that offers swaps from a self-custody wallet, MEV shows up as:

- **Sandwich loss:** up to the full slippage tolerance on any swap sent through the public mempool, as in the worked example.
- **Worse effective price on DEX routes** that LPs widen because they lose to arbitrage.
- **Liquidation bonuses** paid at the first block a position crosses its threshold, not a block later.
- **Failed transaction fees** when a bot's trade makes the user's revert, unless the route only lands non-reverting transactions.

The platform's controls are the ones listed: a tight default slippage tolerance with a hard cap, private submission for every swap by default, routes through intent systems where they price better, and records of the route and submission path so a complaint about price can be answered.

## How to Build It

The platform reads oracles for two reasons: to know what a DeFi protocol its customers use thinks a price is (the health checks in [DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending#how-to-build-it)), and as one input among several to its own marks ([`price_sources`](/books/investing-and-digital-assets/chain-data-and-indexing#how-to-build-it), with `kind = 'oracle'`). It submits transactions for customers' self-custody swaps and for its own treasury, and records how each was submitted. The tables extend `instruments` and `onchain_transactions` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

```sql
CREATE TABLE oracle_feeds (                  -- an on-chain price source a protocol or the platform reads
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  provider            TEXT NOT NULL,          -- 'chainlink', 'pyth', 'uniswap_v3_twap', 'protocol_internal'
  feed_address        TEXT NOT NULL,          -- aggregator proxy, price ID or pool
  base_instrument_id  UUID NOT NULL REFERENCES instruments (id),
  quote_instrument_id UUID NOT NULL REFERENCES instruments (id),
  decimals            SMALLINT NOT NULL,
  heartbeat           INTERVAL,               -- as published for this exact feed
  deviation_bps       INT,
  twap_window         INTERVAL,               -- for pool TWAPs
  sequencer_feed_address TEXT,                -- rollups: the uptime feed to check first
  price_source_id     UUID REFERENCES price_sources (id),  -- when the platform's marks use it
  UNIQUE (chain_id, provider, feed_address)
);

CREATE TABLE oracle_readings (               -- what the feed said at a block
  feed_id             UUID NOT NULL REFERENCES oracle_feeds (id),
  block_number        BIGINT NOT NULL,
  block_hash          TEXT NOT NULL,
  round_id            NUMERIC(30, 0),
  answer              NUMERIC(78, 0) NOT NULL, -- raw, scaled by oracle_feeds.decimals
  updated_at          TIMESTAMPTZ NOT NULL,    -- the feed's own timestamp
  age_at_block        INTERVAL NOT NULL,
  platform_mark       NUMERIC(38, 18),         -- the platform's own mark at the same time
  deviation_bps       INT,                     -- answer against the mark
  flags               TEXT[] NOT NULL DEFAULT '{}',  -- 'stale', 'sequencer_down', 'grace_period', 'divergent'
  PRIMARY KEY (feed_id, block_hash)
);

CREATE TABLE private_submissions (           -- how a transaction reached a block
  onchain_transaction_id UUID PRIMARY KEY REFERENCES onchain_transactions (id),
  route               TEXT NOT NULL CHECK (route IN ('public_mempool', 'private_rpc',
                        'order_flow_auction', 'intent', 'builder_direct')),
  provider            TEXT,                   -- the RPC, auction or intent protocol
  swap_quote_id       UUID REFERENCES swap_quotes (id),  -- DEXs & AMMs
  submitted_at        TIMESTAMPTZ NOT NULL,
  included_at         TIMESTAMPTZ,
  refund_base         NUMERIC(78, 0) NOT NULL DEFAULT 0,  -- MEV or gas refund received
  sandwich_suspected  BOOLEAN,                -- from post-trade analysis of the block
  realized_vs_quote_bps INT
);
```

Notes on the sketch:

- **Readings carry their age and the platform's view.** A reading older than its feed's heartbeat, or one that diverges from the platform's multi-venue mark beyond a band, is flagged; a DeFi health check computed on a flagged reading is shown to the customer with the warning, because the protocol will act on the feed regardless.
- **Feeds are pinned per chain and pair.** A feed address comes from the provider's published list, never from a token's metadata or a protocol's UI, and a rollup feed is never read without its sequencer feed.
- **Private by default.** Customer swaps go out through a private route unless the customer opts otherwise; `public_mempool` on a customer swap is an exception the platform can count.
- **Post-trade analysis closes the loop.** For each swap, the block is checked for a buy of the same pool immediately before and a sell immediately after by the same address; a hit sets `sandwich_suspected` and goes into the routing review.
- **Events:** `oracle_reading.stale`, `oracle_reading.divergent`, `private_submission.not_included` and `private_submission.sandwich_suspected` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Oracle readings** behind every DeFi health factor or valuation shown to a customer, with age and divergence flags.
- **The feed register:** which feeds the platform reads on which chains, the published heartbeat and deviation used, and who approved each.
- **Submission routes** for every customer and treasury transaction, with refunds received and quote-to-execution differences.
- **Sandwich reviews:** suspected cases, their losses and the routing changes that followed.

## What This Means for the System You Build

- **Check freshness against the exact feed's heartbeat,** and on rollups check the sequencer feed and a grace period before trusting any price.
- **Never value collateral from a price the borrower can move,** including a single pool's spot price and a token's own thin markets.
- **Prefer long TWAPs on deep pools, or none,** and know what moving one would cost.
- **Compare every oracle with your own multi-venue mark** and show the divergence.
- **Send customer swaps privately by default,** with tight slippage tolerances, and disclose the route the way a broker discloses order routing.
- **Look for sandwiches after the fact** and change routes when they appear.
- **Don't build on "the code allowed it."** Treat a manipulated price that harmed customers as an incident, whatever a court later says about the attacker.

## References

**Standards and protocols**

- [Uniswap v2 Core whitepaper](https://app.uniswap.org/whitepaper.pdf), the price accumulator, computing a TWAP, the window trade-off and stored balances against manipulation
- [Uniswap: v3 price oracles](http://developers.uniswap.org/llms.mdx/docs/protocols/v3/concepts/price-oracles), observations, the tick accumulator, up to 65,535 observations and the geometric mean price
- [Uniswap v3-core: Oracle.sol](https://raw.githubusercontent.com/Uniswap/v3-core/main/contracts/libraries/Oracle.sol), the observation struct and the overwritten ring buffer
- [EIP-7732: Enshrined Proposer-Builder Separation](https://eips.ethereum.org/EIPS/eip-7732), Last Call status, the builder role and payload timeliness attestations
- [EIP-7773: Hardfork Meta, Glamsterdam](https://eips.ethereum.org/EIPS/eip-7773), EIP-7732 scheduled for inclusion and the Sepolia and Hoodi activation times
- [ethereum.org: Maximal extractable value](https://ethereum.org/en/developers/docs/mev/), the definition, arbitrage, liquidations, sandwiches and the builder API
- [ethereum.org: Proposer-builder separation](https://ethereum.org/en/roadmap/pbs/), separating builders and proposers against censorship

**Vendor documentation**

- [Chainlink: Decentralized data model](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/architecture-overview/architecture-decentralized-model.mdx), deviation and heartbeat triggers for new rounds
- [Chainlink: Data Feeds API reference](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/data-feeds/api-reference.mdx), `latestRoundData` and its return values
- [Chainlink: Selecting quality data feeds](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/data-feeds/selecting-data-feeds.mdx), circuit breakers and controls for stale or unexpected values
- [Chainlink: Developer responsibilities](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/data-feeds/developer-responsibilities.mdx), quality checks and contingency logic as the developer's job
- [Chainlink: L2 sequencer uptime feeds](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/data-feeds/l2-sequencer-feeds.mdx), the up and down answers and the grace period
- [Chainlink documentation: Data Feeds](https://raw.githubusercontent.com/smartcontractkit/documentation/main/src/content/data-feeds/index.mdx), prices aggregated from many sources and published on chain
- [Pyth: Pull updates](https://docs.pyth.network/price-feeds/core/pull-updates), per-transaction signed prices and stored on-chain updates
- [Flashbots: Protect overview](https://docs.flashbots.net/flashbots-protect/overview), the private mempool, MEV and gas refunds and non-reverting inclusion
- [Flashbots: MEV-Boost introduction](https://docs.flashbots.net/flashbots-mev-boost/introduction), validator middleware, builders, relays and the claimed reward increase
- [Flashbots: MEV-Share introduction](https://docs.flashbots.net/flashbots-mev-share/introduction), redistribution to users, the 90% default and selective sharing
- [Flashbots documentation](https://docs.flashbots.net/), the mission to mitigate MEV's negative externalities

**Courts and enforcement**

- [CFTC: Charges against Avraham Eisenberg (Release 8647-23)](https://www.cftc.gov/PressRoom/PressReleases/8647-23), the MNGO swap positions, the 13-fold oracle jump, over $110 million withdrawn, $67 million returned and the parallel criminal charges
- [SEC: Charges against Avraham Eisenberg (2023-13)](https://www.sec.gov/newsroom/press-releases/2023-13), the two-account scheme from October 11, 2022, $116 million and MNGO as a security

**In practice**

- [Daian et al.: Flash Boys 2.0 (arXiv 1904.05234)](https://arxiv.org/abs/1904.05234), priority gas auctions and miner extractable value
- [TRM Labs: Federal judge overturns convictions in Mango Markets case](https://www.trmlabs.com/resources/blog/breaking-federal-judge-overturns-all-criminal-convictions-in-mango-markets-case-against-avraham-eisenberg), the May 23, 2025 ruling and its grounds
- [rekt.news: Mango Markets](https://rekt.news/mango-markets-rekt), MNGO from $0.03 to $0.91 and the governance vote on returning funds
