+++
title = "Order Books & Matching Engines"
nav_title = "Order Books & Matching"
description = "Price-time and pro-rata priority, book data structures, sequencers and determinism, replay and recovery, self-trade prevention and latency budgets."
category = "Investing & Digital Assets Industry"
order = 2517
part = "Trading and Markets"
tags = ["investing", "matching-engine", "order-book", "exchanges", "crypto", "determinism"]
+++

A matching engine is the smallest program in a trading venue and the one with the least room for error. It holds every resting order in a market, takes each incoming order in turn, decides which resting orders it trades against and at what price, and publishes the result. It has to be fair in a way anyone can check (the rule that decides who trades first is published and applied without exception), fast enough that the venue is worth connecting to, and deterministic enough that the same inputs produce the same trades on every replica and on every replay years later. Whether the venue is a stock exchange, an ATS, a crypto exchange or an on-chain order book, the engine at the center is the same design, and the differences are in the rules around it.

This chapter covers priority rules (price-time and pro-rata) with a small book worked through, the data structures, sequencers and determinism, replay and recovery with Coinbase's May 2026 outage as the case, self-trade prevention, latency budgets, and one design that serves a securities venue and a crypto venue. [The Matching Engine, Briefly](/books/investing-and-digital-assets/crypto-exchange-architecture#the-matching-engine-briefly) introduced the engine inside a crypto exchange; the orders arriving at it are [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types); the feeds it produces are [Market Data](/books/investing-and-digital-assets/market-data). This chapter extends `orders` and `executions` from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and reuses `trading_pairs` from [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it), adding `matching_inputs`, `book_snapshots` and `self_trade_events`.

## How the Platforms Do It

What venues have published about their engines, as of November 2026:

| Venue | Priority | Engine design, as published | Recovery and safety |
| --- | --- | --- | --- |
| **Coinbase Exchange** | Price-time "as received by the matching engine"; trades at the resting order's price | Single-threaded core pinned to one CPU core; Raft replicates the input log across five nodes; state in memory; about 250 bytes per active order; P99 under 1 ms | Snapshots on a follower; recovery and disaster recovery by replaying inputs; product modes cancel-only, post-only, limit-only, auction |
| **LMAX** | Price-time | Business logic processor entirely in memory, fed by the Disruptor ring buffer, 6 million orders a second on one thread (2011) | Input journal replayed from nightly snapshots; full restart in under a minute |
| **Nasdaq** | Price-time, visible in its feed | TotalView-ITCH publishes each displayed order with a day-unique reference number and every execution, cancel and replace against it | Sequenced messages over MoldUDP64 or SoupBinTCP; GLIMPSE for current book state |
| **CME Globex** | Several matching algorithms by product, from FIFO to pro-rata allocation | Not published at this depth | Not covered here |
| **Hyperliquid** | Price-time | A fully on-chain order book; prices are multiples of the tick and sizes of the lot | The chain's own state and consensus |
| **Binance** (spot) | Price-time | Not published at this depth | Self-trade prevention modes and a queryable record of prevented matches |

Three things are common across every public description: **one writer per book** (a single thread owns each market's state), **an ordered input log** that is the source of truth (the book is derived from it), and **published priority rules** that participants can test against the venue's own feed.

## Priority Rules

### Price-time

The best price trades first; at the same price, the order that arrived first trades first. Trades happen at the resting order's price, so an aggressive buyer whose limit is above the best offer gets the offer's price. Worked numbers, my own, on a book with a tick of 0.01:

| Side | Price | Queue (arrival order) |
| --- | --- | --- |
| Ask | 100.03 | S3: 4 |
| Ask | 100.02 | S1: 3, then S2: 5 |
| Bid | 100.00 | B1: 6 |

A buy limit for 10 at 100.03 arrives (the taker):

1. It trades 3 with S1 at 100.02. S1 is filled and leaves the book.
2. It trades 5 with S2 at 100.02. The 100.02 level is now empty.
3. It trades 2 with S3 at 100.03. S3 is partially filled; 2 remain resting.

The taker is filled: 8 at 100.02 and 2 at 100.03, an average of 100.022 (my arithmetic), three executions, each reported to both parties. The book after: best ask 100.03 with S3's 2, best bid 100.00. Had the taker's limit been 100.02, it would have filled 8 and rested 2 at 100.02 as the new best bid, becoming a maker. One incoming order can be both a taker and a maker, and fees, market data and the ledger all have to treat the two parts separately ([Maker and taker](/books/investing-and-digital-assets/crypto-trading-products#maker-and-taker)).

### Modifications and queue position

A change to a resting order can cost its place. Coinbase's rule is common: increasing quantity or changing price loses queue priority; decreasing quantity keeps it. If S1 had increased from 3 to 6 before the taker arrived, it would have moved behind S2, and the taker would have filled S2's 5 first and then 5 of S1's 6. The engine implements this as cancel-and-reinsert for increases and price changes, and as an in-place reduction for decreases, and the market data feed shows which happened (Nasdaq's ITCH, for example, publishes a partial cancel as an Order Cancel message on the same reference number and a replace as an Order Replace with a new one).

### Pro-rata

Some futures and options markets allocate at a price level in proportion to size rather than by time, so a large resting order gets a large share even if it arrived last. CME Globex documents several allocation algorithms by product. A simple pro-rata rule, my own illustration rather than any venue's exact algorithm: at 100.02, S1 rests 3, S2 rests 5 and S4 rests 12 (20 in total), and a buy for 10 arrives.

| Order | Share of level | Proportional | Allocated (floor) | Plus remainder by time |
| --- | --- | --- | --- | --- |
| S1 | 15% | 1.5 | 1 | +1 = 2 |
| S2 | 25% | 2.5 | 2 | 2 |
| S4 | 60% | 6.0 | 6 | 6 |

Floors leave 1 unallocated, which goes to the earliest order. Real pro-rata algorithms add minimum allocations, priority for the order that set the price, and designated market maker shares, and each rule changes who wants to quote large. Pro-rata rewards size and discourages the race to be first; price-time rewards speed. Most equity and crypto venues use price-time.

## The Data Structures

A book is two sides of price levels, each level a FIFO queue of orders, plus an index from order ID to its position:

- **Levels.** Ordered by price, best first: a sorted map, a skip list, or, where prices are bounded and the tick is known, an array indexed by tick offset from a reference price, which makes finding a level a subtraction. `trading_pairs.tick_size` defines the grid.
- **Queues.** A doubly linked list per level, so a cancel in the middle is constant time once the order is found.
- **The order index.** A hash map from order ID to its node, so cancels and modifies don't scan.
- **Best prices cached.** The best bid and offer are read on every incoming order and must not be recomputed.

The sizes are small. Coinbase's talk puts an active order at about 250 bytes; a million resting orders is about 250 MB (my arithmetic), comfortably in memory on one machine. That is why engines keep the whole book in memory and treat storage as a log, not a database: Fowler's account of LMAX describes a business logic processor that "operates entirely in-memory, there is no database or other persistent store."

All arithmetic is integer. Prices are ticks and quantities are lot units of `trading_pairs.lot_size`, so the engine never compares floating-point values and two replicas never disagree on rounding ([Integer Minor Units](/docs/money/amounts#integer-minor-units)).

## Determinism and Sequencers

An engine is deterministic if its output depends only on the order of its inputs. Achieving that means one thread owns each book (the Disruptor paper's rule is that "any data should be owned by only one thread for write access"), no wall-clock reads inside the matching logic (time comes in on the input message), no iteration over unordered collections, no randomness, and no I/O on the hot path.

The sequencer is what fixes the order. Every input (new order, cancel, modify, mode change, timer tick) is assigned a sequence number before the engine sees it, and the sequenced log is the source of truth: replay it into an empty engine and you get the same book and the same trades.

![The matching path as a pipeline: order entry gateways (FIX, REST and WebSocket sessions, risk checks) feed the sequencer, which puts all inputs in one order and logs them to a quorum; an accented arrow leads to the accented matching core, one thread per book, in memory; the core fans out to execution reports, market data and ledger postings. Below, dashed: the input log runs from the sequencer to snapshots, a durable store taken on a follower, then to replay of the inputs after it, which rebuilds the core.](/diagrams/ida-matching-pipeline.svg "The input log, not the book, is the record: the core is a pure function of it, so replicas, replays and recoveries all reach the same state. Coinbase and LMAX describe this shape publicly.")

Coinbase's design, as Frank Yu described it at QCon San Francisco (published April 23, 2026), makes the log durable with Raft: an order is durable once a quorum of the five nodes has the input, so there's no database in the hot path, and inputs are persisted asynchronously. Five nodes rather than three survive two failures. Determinism buys operational properties beyond correctness: rolling deploys by restarting followers then failing over the leader, replaying production logs in a debugger, testing on recorded request streams, and disaster recovery by shipping inputs rather than outputs. LMAX's earlier design reached the same shape with an input Disruptor that unmarshals, journals and replicates each message before the business logic sees it, and ring buffers of 20 million slots for input and 4 million for each output.

## Replay and Recovery

Recovery is replay from the last snapshot. A snapshot is the full book and engine state at a sequence number; restoring it and replaying every input after that number rebuilds the engine exactly. Coinbase takes snapshots on a follower, off the leader's path; LMAX took nightly snapshots and restarted in under a minute.

Worked numbers, my own: Coinbase's talk puts a single core's replay red line at about 300,000 messages a second, about 3.3 microseconds a message. If the last snapshot is 30 minutes old and the market averaged 50,000 inputs a second, replay has 90 million messages to apply: 300 seconds, five minutes of an unavailable market, before any human decision. At a snapshot every 5 minutes, it is 50 seconds. Snapshot frequency is a recovery time objective, set and tested like one ([Set Targets From Impact](/docs/operations/disaster-recovery#set-targets-from-impact)).

The case for designing the failure path as carefully as the fast path is public. On May 7, 2026, cooling units failed in one AWS data hall in us-east-1. Coinbase's exchange matching engine ran as a Raft cluster inside a single cluster placement group, co-located because cross-zone round trips add 3 to 4 milliseconds; three of its five nodes went down, the cluster lost quorum, and there was no automated cross-zone failover. Recovery took emergency code changes and manual reconstruction, trading was unavailable for several hours, and markets came back through cancel-only and auction modes. Kafka partitions stranded in the zone were moved by hand. Coinbase's remediations included automated cross-zone recovery and better quorum restoration.

Three lessons I take from it:

- **Placement is part of the quorum design.** Five replicas in one failure domain are one replica for a data hall failure. Latency pulled them together; the recovery plan has to assume they fail together and say what happens next.
- **Recovery modes are product features.** `cancel_only` lets customers reduce risk before anything trades; an `auction` reopening finds a price after an outage instead of letting the first order trade through a stale book. `trading_pairs.mode` already carries `pre_open`, `auction`, `post_only`, `limit_only`, `cancel_only` and `halted`, and each mode needs tested engine behavior and customer messaging; the platform-wide version is in [Load Shedding and Degraded Modes](/books/investing-and-digital-assets/peak-days-and-outages#load-shedding-and-degraded-modes).
- **Everything downstream replays too.** Market data, execution reports and the ledger consume the engine's output sequence; after recovery they resume from the last sequence they processed, and any gap is detected by sequence, not by time.

## Self-Trade Prevention

A firm running several strategies, or a market maker quoting both sides, can send an order that would trade with its own resting order. A self-trade changes no ownership and prints volume that misleads everyone, and wash trading is a surveillance matter ([Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance)). Venues prevent it in the engine. Coinbase Exchange forbids self-trading outright and lets the taker choose the mode, defaulting to decrement and cancel, with cancel oldest, cancel newest and cancel both. Binance offers expire taker, expire maker, expire both, decrement (both orders reduced by the prevented quantity and the smaller expires), none, and a transfer mode across accounts in a trade group; a prevented order ends as `EXPIRED_IN_MATCH` with a `preventedMatchId` that can be queried later.

Worked numbers, my own, on the book above with S2 (5 at 100.02) owned by the same account as the incoming buy for 10 at 100.03, under a decrement mode like Binance's:

1. The taker trades 3 with S1 at 100.02.
2. It meets S2, its own order. Both are decremented by the smaller remaining quantity, 5: S2 goes to 0 and expires; the taker goes from 7 to 2. No trade prints.
3. The taker trades 2 with S3 at 100.03 and is done, having traded 5 and prevented 5.

Under cancel newest (the taker), the taker would have stopped at step 2 with 3 filled and 7 canceled; under cancel oldest, S2 would have been canceled and the taker would have continued to fill 4 from S3 and rest 3 at 100.03. Each mode gives the same customer a different position, so the mode is a field on every order, the engine records every prevention as an event, and the customer's account sees it in execution reports. Self-trade prevention decides by account or group identity, which means the engine must know who owns each resting order: the one piece of customer data that has to live in the hot path.

## Latency Budgets

The figures venues and specifications publish, and what they bound:

| Step | Published figure | Source |
| --- | --- | --- |
| Hand-off between pipeline stages (Disruptor, three stages, mean) | 52 ns, against 32,757 ns through array blocking queues | LMAX Disruptor paper |
| One input in a single-threaded engine at its red line | about 3.3 μs (300,000 messages a second, my arithmetic) | Coinbase talk |
| Consolidated quote processing (median, September 2026) | 18.0 μs | CTA SIP metrics |
| A deliberate delay on every order | 350 μs | IEX |
| End-to-end response at P99 | under 1 ms | Coinbase talk |
| A cross-zone round trip in the cloud | 3 to 4 ms | Coinbase talk |

Read together: the matching itself is microseconds; replication is the expensive step, and its cost is set by distance; the gateway, risk checks and serialization usually cost more than the match. A venue's budget is a decision about which of those to pay for. Coinbase chose co-location to keep replication within its sub-millisecond target and paid for it on May 7, 2026; a venue that replicates across zones pays 3 to 4 milliseconds per durable input. Both are defensible, and neither is free. The tools for keeping the hot path predictable are the ones both write-ups describe: fixed-layout binary messages, no allocation on the hot path, pinned threads with interrupts moved off them, and pre-allocated ring buffers instead of queues.

## One Design for Securities and Crypto

The engine doesn't change between a stock and a token; the rules around it do. `trading_pairs` from [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture) fits a securities venue with the mapping below:

| `trading_pairs` column | Crypto venue | Securities venue (exchange or ATS) |
| --- | --- | --- |
| `base_instrument_id` | The token | The NMS stock |
| `quote_instrument_id` | USD, USDC or another token | USD only |
| `tick_size` | Set by the venue per pair | Set by Rule 612 per stock and evaluation period, from `tick_regimes` ([Access Fees and Tick Sizes](/books/investing-and-digital-assets/equity-market-structure#access-fees-and-tick-sizes)) |
| `lot_size` | Smallest quantity step, often a fraction | One share for matching; the round lot matters for display and protection, not for matching |
| `mode` | Venue-set: listing, incident, delisting, chain halt | Also driven by regulatory halts and the opening and closing auctions in `venue_sessions` |

And the rules a securities venue adds outside the engine:

- **Order protection.** An exchange may not execute through a better protected quotation elsewhere while Rule 611 stands, so the engine either routes the marketable part out, rejects it, or accepts ISOs whose sender swept the better prices; a crypto venue has no such duty.
- **Sessions and auctions.** Single-price auctions at the open and close use a different matching algorithm (maximize volume at one price) on the same book.
- **Halts and volatility limits.** Trading halts and price bands are inputs to the engine as mode changes; [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts) covers them.
- **Reporting.** Every trade is reported to the consolidated tape and the audit trail with the venue's timestamps.

An on-chain order book is the same engine with the chain as the sequencer: Hyperliquid's book is fully on-chain with price-time priority, so the block's transaction order is the input order, and its tick and lot rules (prices with at most five significant figures) are enforced by the protocol rather than by a venue's gateway.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`orders`, `executions` with liquidity flag) and `trading_pairs` and `market_modes` from [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it). The engine's own log lives in its replicated store; these tables are the durable copy the rest of the platform reads and audits:

```sql
CREATE TABLE matching_inputs (             -- the sequenced input log, as persisted
  trading_pair_id     UUID NOT NULL REFERENCES trading_pairs (id),
  seq                 BIGINT NOT NULL,       -- assigned by the sequencer; gapless per pair
  kind                TEXT NOT NULL CHECK (kind IN ('new', 'cancel', 'modify', 'mode_change',
                        'auction_run', 'timer', 'mass_cancel')),
  order_id            UUID REFERENCES orders (id),
  account_id          UUID REFERENCES accounts (id),   -- needed for self-trade prevention
  payload             BYTEA NOT NULL,        -- the fixed-layout message the engine applied
  gateway_received_at TIMESTAMPTZ NOT NULL,  -- time travels in the input, never read in the engine
  replicated_term     BIGINT,                -- consensus term when committed
  PRIMARY KEY (trading_pair_id, seq)
);

CREATE TABLE book_snapshots (              -- engine state at a sequence number
  trading_pair_id     UUID NOT NULL REFERENCES trading_pairs (id),
  seq                 BIGINT NOT NULL,       -- replay resumes at seq + 1
  state_ref           TEXT NOT NULL,         -- object storage location
  state_hash          TEXT NOT NULL,         -- compared across replicas and on restore
  resting_orders      INT NOT NULL,
  taken_on            TEXT NOT NULL,         -- which replica (a follower)
  taken_at            TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (trading_pair_id, seq)
);

CREATE TABLE self_trade_events (           -- every prevented match
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_pair_id     UUID NOT NULL REFERENCES trading_pairs (id),
  seq                 BIGINT NOT NULL,       -- the input that caused it
  taker_order_id      UUID NOT NULL REFERENCES orders (id),
  maker_order_id      UUID NOT NULL REFERENCES orders (id),
  mode                TEXT NOT NULL CHECK (mode IN ('decrement', 'cancel_oldest', 'cancel_newest',
                        'cancel_both', 'expire_taker', 'expire_maker', 'expire_both')),
  prevented_quantity  NUMERIC(78, 0) NOT NULL CHECK (prevented_quantity > 0),
  price               NUMERIC(38, 18) NOT NULL,
  FOREIGN KEY (trading_pair_id, seq) REFERENCES matching_inputs (trading_pair_id, seq)
);

ALTER TABLE orders
  ADD COLUMN stp_mode         TEXT,          -- the taker's mode wins at match time
  ADD COLUMN post_only        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN engine_seq       BIGINT;        -- the input that accepted it

ALTER TABLE executions
  ADD COLUMN engine_seq       BIGINT,        -- the input that produced the fill
  ADD COLUMN maker_order_id   UUID REFERENCES orders (id),
  ADD COLUMN taker_order_id   UUID REFERENCES orders (id);
```

The core of a price-time match, integer ticks and lots, one thread, trades at the resting price. A production book replaces the slices with the indexed structures above; the rule doesn't change:

```go tab="Go"
type Order struct {
	ID    string
	Buy   bool
	Price int64 // ticks
	Qty   int64 // lots
}

type Level struct {
	Price int64
	Queue []*Order // arrival order
}

type Book struct {
	Asks []*Level // best (lowest) first
	Bids []*Level // best (highest) first
}

type Fill struct {
	Maker, Taker string
	Price, Qty   int64
}

// Match trades the taker against the opposite side; the caller rests any
// remainder of a limit order. Fills are at the maker's price.
func (b *Book) Match(t *Order) []Fill {
	side, crosses := &b.Asks, func(p int64) bool { return t.Price >= p }
	if !t.Buy {
		side, crosses = &b.Bids, func(p int64) bool { return t.Price <= p }
	}
	var fills []Fill
	for t.Qty > 0 && len(*side) > 0 && crosses((*side)[0].Price) {
		lvl := (*side)[0]
		for t.Qty > 0 && len(lvl.Queue) > 0 {
			m := lvl.Queue[0]
			q := min(t.Qty, m.Qty)
			fills = append(fills, Fill{Maker: m.ID, Taker: t.ID, Price: lvl.Price, Qty: q})
			t.Qty, m.Qty = t.Qty-q, m.Qty-q
			if m.Qty == 0 {
				lvl.Queue = lvl.Queue[1:]
			}
		}
		if len(lvl.Queue) == 0 {
			*side = (*side)[1:]
		}
	}
	return fills
}
```

```rust tab="Rust"
use std::collections::VecDeque;

pub struct Order { pub id: String, pub buy: bool, pub price: i64, pub qty: i64 } // ticks, lots
pub struct Level { pub price: i64, pub queue: VecDeque<Order> }                // arrival order
pub struct Book { pub asks: VecDeque<Level>, pub bids: VecDeque<Level> }       // best first
pub struct Fill { pub maker: String, pub taker: String, pub price: i64, pub qty: i64 }

impl Book {
    /// Trades the taker against the opposite side; the caller rests any remainder
    /// of a limit order. Fills are at the maker's price.
    pub fn match_order(&mut self, t: &mut Order) -> Vec<Fill> {
        let side = if t.buy { &mut self.asks } else { &mut self.bids };
        let (buy, limit) = (t.buy, t.price);
        let crosses = move |p: i64| if buy { limit >= p } else { limit <= p };
        let mut fills = Vec::new();
        while t.qty > 0 {
            let Some(lvl) = side.front_mut() else { break };
            if !crosses(lvl.price) {
                break;
            }
            while t.qty > 0 {
                let Some(m) = lvl.queue.front_mut() else { break };
                let q = t.qty.min(m.qty);
                fills.push(Fill { maker: m.id.clone(), taker: t.id.clone(), price: lvl.price, qty: q });
                t.qty -= q;
                m.qty -= q;
                if m.qty == 0 {
                    lvl.queue.pop_front();
                }
            }
            if lvl.queue.is_empty() {
                side.pop_front();
            }
        }
        fills
    }
}
```

Run on the worked book (asks 100.02 with S1: 3 and S2: 5, 100.03 with S3: 4; a buy for 10 at 100.03), both return fills of 3 and 5 at 100.02 and 2 at 100.03 and leave S3 with 2.

Design notes:

- **The log is the record; tables are copies.** `matching_inputs` is written from the replicated log, gapless per pair, and every downstream consumer checks it has every sequence number before it acts.
- **Hash the state.** Replicas compare `state_hash` at each snapshot; a mismatch means non-determinism crept in, and it is found in testing by replaying the same log on two builds.
- **Time is an input.** Expiries, auctions and mode changes arrive as sequenced `timer` or `mode_change` inputs, so a replay fires them at the same point in the sequence.
- **Fees stay out of the engine.** The engine marks maker and taker and the ledger prices them from `fee_tiers` ([How to Build It](/books/investing-and-digital-assets/crypto-trading-products#how-to-build-it)), so a fee schedule change never changes matching.
- **Every execution names its input.** `executions.engine_seq` ties each fill to the input that produced it, which is how a disputed fill is replayed and explained.

## Auditing

- **The complete input log per market,** retained, so any book state and any trade can be reproduced by replay.
- **Snapshots with hashes,** and a record of every replica's agreement, every restore and every replay.
- **Every mode change** with who set it, why and the runbook used, which `market_modes` already records.
- **Every prevented self-trade,** with both orders and the mode, since a pattern of them is a surveillance signal.
- **Priority rule changes,** published to participants before they take effect and versioned with the engine build that applies them.

## What This Means for the System You Build

- **Make the sequenced input log the source of truth** and the book a pure function of it, one thread per book.
- **Keep time, randomness and I/O out of the engine;** feed them in as sequenced inputs.
- **Publish priority and modification rules** and test them against your own market data feed.
- **Put replicas in separate failure domains or plan for losing them together,** and rehearse recovery through cancel-only and auction modes.
- **Snapshot often enough that replay meets your recovery time,** and measure replay speed per core.
- **Record self-trade prevention per order and per event.**
- **Map securities venues onto the same `trading_pairs` design,** with ticks, sessions, order protection and halts as the rules around it.

## References

**Standards and protocols**

- [Nasdaq: TotalView-ITCH 5.0 specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf), sequenced messages, day-unique order reference numbers, cancel and replace messages, protocol options and GLIMPSE
- [LMAX: Disruptor, high performance alternative to bounded queues (Thompson, Farley, Barker, Gee, Stewart)](https://lmax-exchange.github.io/disruptor/disruptor.html), single-writer ownership, the pre-allocated ring buffer, mechanical sympathy and pipeline latency against array blocking queues
- [CME Group: Supported matching algorithms](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457218479/Supported+Matching+Algorithms), CME Globex's documented allocation algorithms

**Regulators and guidance**

- [CTA: SIP metrics, third quarter 2026](https://www.nyse.com/publicdocs/ctaplan/CTA_SIP_Metrics_3Q_2026.pdf), September 2026 median quote processing latency

**Vendor documentation**

- [Coinbase Developer Platform: Matching engine](https://docs.cdp.coinbase.com/exchange/concepts/matching-engine), price-time priority as received, trades at the resting price, the prohibition on self-trading and its modes
- [Coinbase Developer Platform: Get single product](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-single-product), the cancel-only, post-only, limit-only, trading-disabled and auction mode flags
- [Coinbase Developer Platform: Exchange FIX order entry](https://docs.cdp.coinbase.com/exchange/fix-api/order-entry-messages/order-entry-messages5.md), queue priority on modification
- [Binance: Self-trade prevention FAQ](https://developers.binance.com/docs/binance-spot-api-docs/faqs/stp_faq), the modes, trade groups, `EXPIRED_IN_MATCH` and prevented match records
- [Hyperliquid: Order book](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-book), the fully on-chain book and price-time priority
- [Hyperliquid: Tick and lot size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size), significant figures and decimals for prices and sizes
- [IEX: Technology](https://www.iex.io/technology), the 350-microsecond delay

**In practice**

- [InfoQ: Frank Yu on Coinbase's exchange systems in the cloud (QCon San Francisco presentation, posted April 23, 2026)](https://www.infoq.com/presentations/exchange-systems-cloud/), Coinbase's single-threaded core, Raft over inputs with five nodes, snapshots on a follower, P99 latency, the replay red line, cross-zone latency and memory per order
- [InfoQ: Coinbase AWS failure postmortem (June 16, 2026)](https://www.infoq.com/news/2026/06/coinbase-aws-failure-postmortem/), the May 7, 2026 cooling failure, the single placement group, the loss of three of five nodes and quorum, cancel-only and auction recovery, Kafka partitions and the remediations
- [Martin Fowler: The LMAX Architecture (July 12, 2011)](https://martinfowler.com/articles/lmax.html), the in-memory business logic processor, 6 million orders a second on one thread, the input journal and replay, snapshots, restart time and ring buffer sizes
