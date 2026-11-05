+++
title = "Market Data"
description = "L1, L2 and L3 data, SIPs and direct feeds and their fees, crypto WebSocket books, candles, fan-out to millions of clients, entitlements and display rules."
category = "Investing & Digital Assets Industry"
order = 2518
part = "Trading and Markets"
tags = ["investing", "market-data", "sip", "websocket", "licensing", "crypto"]
+++

Every price a customer sees, every NBBO a router acts on, every candle on a chart and every mark on a statement starts as a message from a venue. Market data is the product venues sell most reliably, the input every other system in a trading platform depends on, and a licensed good with rules about who may see it, in what form, and at what delay. It also has to be correct in a narrow technical sense that customers never think about: a book rebuilt from incremental messages is only right if no message was lost, and the only way to know is sequence numbers checked on every message.

This chapter covers the levels of data (L1, L2, L3), the consolidated feeds and the venues' direct feeds and what each costs, crypto venues' WebSocket books and how to rebuild one without gaps, candles and aggregation, fan-out to millions of app clients, and entitlements, delayed data and display rules. The latency between consolidated and direct feeds is worked in [SIPs and Direct Feeds](/books/investing-and-digital-assets/equity-market-structure#sips-and-direct-feeds); the marks used to value positions are in [Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks). This chapter extends `instruments` and `venues` from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) with `market_data_entitlements`, `quotes`, `candles` and `data_usage_reports`.

## How the Platforms Do It

Feeds and their documented behavior, as of November 2026:

| Feed | Level | Transport and sequencing | Gap handling | Access |
| --- | --- | --- | --- | --- |
| **US consolidated feeds** (CTA/CQ and UTP SIPs) | L1: NBBO, each exchange's best quote, last sale; odd-lot information from the 2024 amendments | Processor output to vendors and brokers; median processing under 20 μs (CTA) | Plan-defined retransmission | Licensed per user or device under the plans' fee schedules; moving to the CT Plan |
| **Nasdaq TotalView-ITCH 5.0** | L3: every displayed order with a day-unique reference number, its executions, cancels and replaces, plus imbalance and cross messages | MoldUDP64, SoupBinTCP or compressed SoupBinTCP; nanosecond timestamps | GLIMPSE snapshot for current book state | Licensed by Nasdaq |
| **Coinbase Exchange WebSocket** | `level2` (aggregated sizes), `full` (order by order, L3), `matches`, `ticker`, `heartbeat` | Sequence number per product, incremented by 1 | A jump means a dropped message; rebuild from a REST snapshot; `matches` can drop and is backfilled by trade ID | Public endpoint and an authenticated direct endpoint |
| **Kraken WebSocket v2** | Book at depth 10, 25, 100, 500 or 1,000 | Snapshot then updates | CRC32 checksum of the top 10 levels | Not covered here |
| **Binance spot** | Diff depth at 1,000 or 100 ms; partial depth at 5, 10 or 20 levels; klines from 1 second to 1 month | Update IDs `U` (first) and `u` (final) per event | Snapshot with `lastUpdateId`, buffered events replayed in order | Public, with connection limits |

Two models sit in that table. **Equities separate the consolidated view from the venues' own views,** by law: the SIP is the regulated baseline and direct feeds are a paid upgrade. **Crypto venues publish only their own book,** on public endpoints in the cases above (Coinbase also runs an authenticated direct endpoint), and there is no consolidated view at all, so a platform that wants an NBBO-like benchmark across venues has to build it.

## L1, L2 and L3

| Level | Content | Used for | Example |
| --- | --- | --- | --- |
| **L1** (top of book) | Best bid and offer with sizes, last trade | Quotes in apps, marketability, NBBO, alerts | The SIP's NBBO and last sale; Coinbase `ticker` |
| **L2** (depth by price) | Aggregate size at each price level | Depth charts, slippage estimates, routing | Coinbase `level2`; Kraken's book; the depth of book that Regulation NMS core data defines as five price levels from the NBBO |
| **L3** (order by order) | Every resting order and every event on it | Queue position, matching-engine-grade replicas, surveillance | Nasdaq TotalView-ITCH; Coinbase `full` |

The levels are views of the same book at decreasing resolution. An L3 feed lets the subscriber rebuild L2 and L1 exactly; L2 can't be turned back into L3 because the queue order is gone. Coinbase's `level2` sends absolute sizes, not deltas ("the updated size at the price level"), with "0" removing a level; ITCH sends deltas against an order reference ("To determine the current display shares for an order, ITCH subscribers must deduct the number of shares stated in the Modify message"). A consumer has to know which it is reading: applying an absolute size as a delta doubles the book.

An ITCH Add Order is 36 bytes, fixed layout, big-endian: a one-byte message type ("A"), a two-byte stock locate code assigned each morning, a tracking number, a six-byte timestamp in nanoseconds since midnight, an eight-byte order reference, the side, four bytes of shares, the eight-character symbol and a four-byte price with four implied decimals. That layout is why direct feeds are fast to parse and why the parser is written once, tested against the specification's offsets, and never touched casually.

## Consolidated Feeds and Direct Feeds

The SIPs exist so that every investor can see the same best prices at a regulated price. The CTA plan reports median processing under 20 microseconds and an availability requirement of 99.98%; in September 2026 its quote processor's median was 18.0 microseconds. A direct feed reaches a co-located subscriber without the hop to the processor and back, and carries depth and order detail the SIP doesn't; [SIPs and Direct Feeds](/books/investing-and-digital-assets/equity-market-structure#sips-and-direct-feeds) puts a number on the difference for a router.

What a broker buys depends on what it does:

- **Displaying quotes to retail customers:** the consolidated feed, licensed per user, is the baseline and usually enough.
- **Routing and measuring execution quality:** direct feeds from every venue it routes to, so the router's book is current; the NBBO it reports against in Rule 605 is still the consolidated one.
- **Running a venue or making markets:** direct feeds everywhere, often the fastest transport a venue offers (Nasdaq's FPGA version of TotalView-ITCH is broadcast from Carteret, New Jersey only, over MoldUDP64, and requires a 10 Gb or 40 Gb connection there).

The consolidated feeds are being reorganized. The SEC's 2020 Market Data Infrastructure rules redefined core data to include depth of book, auction information and odd lots, and replaced the exclusive SIPs with competing consolidators and self-aggregators (a self-aggregator "may only generate consolidated market data for its internal use"); the 2024 amendments then accelerated the round lot and odd-lot pieces. Separately, the CT Plan, effective November 20, 2024, replaces the CTA, CQ and UTP plans with one plan, and the UTP plan's site gives April 1, 2027 for the transition to a new administrator.

## What the Data Costs

The current CTA schedule and the approved CT Plan schedule, per month:

| Fee | CTA today | CT Plan (approved June 26, 2026; charged once the plan is fully operational) |
| --- | --- | --- |
| Professional, per device | Network A: $45 for 1 to 2 devices, $27 for 3 to 999, $23 for 1,000 to 9,999, $19 for 10,000 or more; Network B: $23 | Tape A $26, Tape B $23, Tape C $24 |
| Non-professional, per user | $1.00 for Network A, $1.00 for Network B | Tiered from $0.90 down to $0.25 by number of users |
| Non-display use | A: $2,000 for last sale and $2,000 for quotes; B: $1,000 and $1,000, per category (own use, on behalf of clients, internal matching such as an ATS, per platform) | A $2,315, B $1,155, C $2,025 (last sale; bid-ask the same); creating derived data counts as non-display use |
| Delayed data | | Delayed subscribers are not billable |

The CT Plan's fees include a 15.95% inflation adjustment and begin only when the plan is fully operational, the later of 30 months after its November 20, 2024 effective date or 90 days after fee approval, followed by a two-year initial implementation period. Exchange direct feed fees are set by each exchange's own fee filings; I could not open Nasdaq's current TotalView price list for this chapter. <!-- source-gap: nasdaq-totalview-fees | missing | Nasdaq TotalView professional, non-professional, distributor and non-display fees as of November 2026 | closes with: Nasdaq's current US data price list or its SEC fee filing, opened | checked: 2026-11-05 -->

Worked numbers, my own, assuming every professional device prices at the CTA's 3-to-999 tier: a broker shows real-time quotes to 40,000 non-professional customers and 150 professional workstations, and uses the data to route (non-display, own use).

| Line | CTA today (Networks A and B) | CT Plan (Tapes A, B and C) |
| --- | --- | --- |
| Non-professional users | 40,000 × ($1.00 + $1.00) = $80,000 | 40,000 × a tiered fee between $0.25 and $0.90, depending on the tier the count falls in |
| Professional devices | 150 × ($27 + $23) = $7,500 | 150 × ($26 + $23 + $24) = $10,950 |
| Non-display, one category | $2,000 + $2,000 + $1,000 + $1,000 = $6,000 | ($2,315 + $1,155 + $2,025) × 2 = $10,990 |

The table shows the shape rather than a bill: the per-user line dominates for a retail broker, professional classification is worth getting right user by user, and the CT Plan adds Tape C under the same plan while today's CTA lines leave the UTP plan's charges out. Every one of these lines is reported to the plan from the broker's own counts, which is what `data_usage_reports` is for.

## Crypto WebSocket Books

Crypto venues publish their books over WebSocket as a snapshot followed by incremental updates, and each venue's documentation says how to splice the two. The splice is where books go wrong.

**Binance's procedure,** from its WebSocket documentation: open the diff depth stream and buffer events, noting the first event's `U`; fetch a REST snapshot (up to 5,000 levels); if the snapshot's `lastUpdateId` is strictly less than that first `U`, fetch it again; discard buffered events whose `u` is at or below `lastUpdateId`; set the local book to the snapshot; then apply buffered and live events in order. Worked numbers, my own:

| Event | `U` | `u` | Local update ID before | Action |
| --- | --- | --- | --- | --- |
| Snapshot | | | | `lastUpdateId` = 1000; book set; local ID 1000 |
| Buffered 1 | 998 | 1000 | 1000 | `u` ≤ 1000: discard |
| Buffered 2 | 1001 | 1004 | 1000 | Applies (`U` = local + 1); local ID 1004 |
| Live 3 | 1005 | 1005 | 1004 | Applies; local ID 1005 |
| Live 4 | 1007 | 1009 | 1005 | `U` > local + 1: update 1006 is missing; discard the book and start over |

Event 4 is the one that matters: applying it would produce a book that looks plausible and is wrong at whatever prices update 1006 touched, forever, because diff streams only send changes.

**Coinbase's procedure** for an order-by-order book: subscribe to `full`, queue messages, fetch the REST snapshot, discard queued messages with sequence numbers at or below the snapshot's, and apply the rest. Sequence numbers increase by 1 per product, and a jump means a dropped message, which Coinbase warns can happen because its WebSocket servers "receive market data in a manner that can result in dropped messages." A heartbeat each second per product carries the latest sequence and trade ID, so a quiet market still proves the client is current. The `matches` channel can drop messages too, and the documented recovery is to compare trade IDs and backfill from REST.

**Kraken's checksum** catches what sequence numbers can't: a book that received every message but applied one wrong. Its v2 book carries a CRC32 of the top 10 levels; the client builds a string from the asks (lowest first) and then the bids (highest first), each level as price then quantity with the decimal point and leading zeros removed, and compares the CRC32 as an unsigned 32-bit value. A two-level illustration of the string, my own: asks 0.05005 for 0.00000500 and 0.05010 for 0.00100000, bid 0.05000 for 0.00200000, gives `5005` `500` `5010` `100000` `5000` `200000`, concatenated to `500550050101000005000200000`, whose CRC32 is 1022840231 (the real check uses ten levels a side). Kraken's guide also says to parse values as decimals or strings, not floats: a float would reformat `0.00000500`, and the checksum would fail on a book that is right.

Rules for every venue's book:

- **Never apply an update without checking its sequence;** a gap is a rebuild, not a warning.
- **Parse prices and sizes as decimal strings into integer units,** with the pair's tick and lot from `trading_pairs`.
- **Prove liveness:** heartbeats and checksums distinguish a quiet market from a dead connection.
- **Respect the venue's connection rules.** Binance connections last 24 hours, accept 5 incoming messages a second, carry up to 1,024 streams, and are limited to 300 new connections per 5 minutes per IP; Coinbase disconnects a client that hasn't subscribed within 5 seconds. A reconnect storm across many symbols hits those limits first ([Reconnecting Without a Stampede](/docs/architecture/realtime-connections#reconnecting-without-a-stampede)).

A cross-venue benchmark for crypto (the composite best bid and offer that [Crypto Best Execution](/books/investing-and-digital-assets/routing-and-best-execution#crypto-best-execution) needs) is these books merged, each with its own staleness: a venue whose book is mid-rebuild is excluded from the composite until it is current, and the composite records which venues it included.

## Candles and Aggregation

A candle (open, high, low, close, volume over an interval) is a summary of trades, and it is only as good as the trade stream and the rules used to cut it. Binance's klines run from 1 second to 1 month, are "uniquely identified by their open time," and are cut in UTC unless a time zone is requested, with start and end times always in UTC.

Worked numbers, my own, for a one-minute candle opening at 14:30:00 UTC:

| Trade time | Price | Size | Effect |
| --- | --- | --- | --- |
| 14:30:00.120 | 100.10 | 2 | Open 100.10 |
| 14:30:14.480 | 100.40 | 1 | High 100.40 |
| 14:30:37.900 | 99.95 | 3 | Low 99.95 |
| 14:30:59.990 | 100.20 | 1 | Close 100.20 |
| 14:31:00.000 | 100.25 | 4 | Belongs to the 14:31 candle, which opens on it |

The 14:30 candle is 100.10, 100.40, 99.95, 100.20 with volume 7. Three things change it after the fact. A trade reported late with a 14:30 timestamp changes the candle's volume and possibly its high, low or close, so a candle is open for corrections until the venue's late-reporting window closes. A busted or corrected trade (ITCH has a Broken Trade message; FIX has trade cancel and correct execution types) removes or changes a trade, so candles must be recomputable from trades. And in equities, some prints don't count: ITCH marks executions as non-printable when their shares will appear in a later bulk print, and Nasdaq recommends ignoring them for volume "to prevent double counting." Candle rules are therefore data: which trades count, which interval boundaries in which time zone, and when a candle is final.

Equity candles also have sessions: a daily candle for a stock may or may not include pre-market and after-hours trades, and once overnight sessions start the "day" needs a definition the chart and the statement share. Crypto candles have no sessions, which is simpler and means a daily candle depends entirely on the chosen time zone.

## Fan-Out to Millions of Clients

A broker app is a market data distribution system with a trading screen attached. The design problem is not the feed, which is one stream per venue, but the multiplication on the way out.

Worked numbers, my own: 2 million connected clients each watching 20 symbols, sent 4 updates a second per symbol at 100 bytes each, is 2,000,000 × 20 × 4 × 100 = 16 GB a second, about 128 Gbps, and on a busy morning a single popular symbol can update thousands of times a second at the source. Three techniques bring that within reach, and the playbook's [Fan-Out](/docs/architecture/realtime-connections#fan-out) covers the transport:

- **Conflate per client.** Keep the latest state per symbol and send it at the client's rate; a client that gets 4 updates a second sees the current price, not 2,000 stale ones. Conflation is correct for L1 and charts and wrong for anything that needs every event (an L3 replica, a trade tape), which needs a different, unconflated product.
- **Subscribe to what's on screen.** The app subscribes to the symbols visible and drops the rest; 20 is generous for a phone.
- **Shard by symbol, not by client.** One process per symbol shard receives the feed once and pushes to the edge tier, which holds the connections; the edge only forwards ([Scaling Connection Counts](/docs/architecture/realtime-connections#scaling-connection-counts)).

On reconnect, a client asks for the current state and resumes from there, and the server sends a snapshot before any update, the same snapshot-then-increment rule the venues follow ([Ordering and Catch-Up](/docs/architecture/realtime-connections#ordering-and-catch-up)). Load shedding drops update rate before it drops connections: a customer with a slow quote is annoyed, one with no quote can't trade.

## Entitlements, Delayed Data and Display Rules

Equity market data is licensed, and the license is enforced through the broker's own records:

- **Professional or non-professional.** The CT Plan defines non-professional use as "any usage that is not Professional," and professional use as use by or for an entity (other than certain non-compensated trusts) or by an individual serving a third party for compensation. The classification is per user, made at onboarding from questions the plans prescribe, and an entity account showing real-time quotes to its employees is professional.
- **Real-time or delayed.** Delayed data is not fee-liable under the CT Plan (delayed and end-of-day subscribers are non-billable). The length of the delay is set by each plan's and exchange's policies rather than by the fee schedules I opened, so a broker reads it from its data agreements. <!-- source-gap: delayed-data-definition | missing | the minimum delay for "delayed" US equity data under the CTA, UTP and CT plans | closes with: the plans' or an exchange's current data policy defining delayed data | checked: 2026-11-05 --> A delayed quote is labeled as delayed, with its time, everywhere it appears.
- **Display or non-display.** Data a person sees is display use; data a machine consumes (routing, risk, an ATS's matching, derived calculations) is non-display, licensed by category, and under the CT Plan derived data counts too.
- **Reporting.** Monthly counts of users and devices by class, reported to each plan and exchange, and auditable against login records.

The entitlement check runs on every subscription: the user's classification, the products they're entitled to, and real-time or delayed for each. Getting it wrong is billed retroactively, which is why the counts come from the same entitlement rows that gate the stream.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`instruments`, `venues`, `parties`, `accounts`). Raw feeds are stored in their native format in object storage, partitioned by venue and day; the tables hold what other systems read and what the licenses require:

```sql
CREATE TABLE market_data_entitlements (    -- who may see what, and how they are classified
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  product             TEXT NOT NULL,         -- 'us_consolidated_l1', 'nasdaq_totalview', 'crypto_l2', ...
  classification      TEXT NOT NULL CHECK (classification IN ('non_professional', 'professional')),
  delivery            TEXT NOT NULL CHECK (delivery IN ('real_time', 'delayed', 'end_of_day')),
  use                 TEXT NOT NULL CHECK (use IN ('display', 'non_display')),
  attestation_ref     TEXT,                  -- the classification questionnaire as answered
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (party_id WITH =, product WITH =, use WITH =, valid_during WITH &&)
);

CREATE TABLE quotes (                      -- L1 snapshots kept for decisions and measurement
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  source              TEXT NOT NULL CHECK (source IN ('sip', 'direct', 'venue', 'composite')),
  venue_id            UUID REFERENCES venues (id),     -- null for SIP and composite
  bid                 NUMERIC(38, 18),
  bid_size            NUMERIC(78, 0),
  ask                 NUMERIC(38, 18),
  ask_size            NUMERIC(78, 0),
  venue_seq           BIGINT,                -- the feed's sequence number
  venue_ts            TIMESTAMPTZ NOT NULL,  -- the venue's timestamp
  received_at         TIMESTAMPTZ NOT NULL,  -- ours
  composite_of        UUID[],                -- venues included in a composite
  PRIMARY KEY (instrument_id, source, received_at, venue_seq)
);

CREATE TABLE candles (                     -- recomputable from trades
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  venue_id            UUID REFERENCES venues (id),     -- null: consolidated
  interval            TEXT NOT NULL,         -- '1m', '1h', '1d', ...
  opens_at            TIMESTAMPTZ NOT NULL,  -- candles are identified by open time
  open                NUMERIC(38, 18) NOT NULL,
  high                NUMERIC(38, 18) NOT NULL,
  low                 NUMERIC(38, 18) NOT NULL,
  close               NUMERIC(38, 18) NOT NULL,
  volume              NUMERIC(78, 0) NOT NULL,
  trade_count         INT NOT NULL,
  session_rule        TEXT NOT NULL,         -- which sessions and prints count
  final               BOOLEAN NOT NULL DEFAULT FALSE,  -- after the correction window
  revision            INT NOT NULL DEFAULT 0,
  PRIMARY KEY (instrument_id, venue_id, interval, opens_at)
);

CREATE TABLE data_usage_reports (          -- monthly counts owed to each plan or exchange
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  licensor            TEXT NOT NULL,         -- 'cta', 'utp', 'ct_plan', 'nasdaq', ...
  month               DATE NOT NULL,
  product             TEXT NOT NULL,
  classification      TEXT NOT NULL,
  use                 TEXT NOT NULL,
  units               INT NOT NULL,          -- users, devices or platforms
  computed_from       TEXT NOT NULL,         -- the entitlement query version
  submitted_at        TIMESTAMPTZ,
  UNIQUE (legal_entity_id, licensor, month, product, classification, use)
);
```

A book that refuses to apply an update out of sequence, for a diff feed like Binance's:

```go tab="Go"
var ErrGap = errors.New("sequence gap: rebuild from snapshot")

type DiffEvent struct {
	First, Final int64 // Binance U and u
	Bids, Asks   map[int64]int64 // price ticks -> absolute size in lots; 0 removes
}

type LocalBook struct {
	LastID     int64
	Bids, Asks map[int64]int64
}

// Apply skips events the snapshot already covers and refuses any gap.
func (b *LocalBook) Apply(e DiffEvent) error {
	if e.Final <= b.LastID {
		return nil // already in the snapshot
	}
	if e.First > b.LastID+1 {
		return ErrGap
	}
	for p, q := range e.Bids {
		set(b.Bids, p, q)
	}
	for p, q := range e.Asks {
		set(b.Asks, p, q)
	}
	b.LastID = e.Final
	return nil
}

func set(side map[int64]int64, price, size int64) {
	if size == 0 {
		delete(side, price)
		return
	}
	side[price] = size
}
```

```rust tab="Rust"
use std::collections::BTreeMap;

pub struct DiffEvent { pub first: i64, pub last: i64, // Binance U and u
    pub bids: Vec<(i64, i64)>, pub asks: Vec<(i64, i64)> } // ticks, absolute lots; 0 removes

pub struct LocalBook { pub last_id: i64,
    pub bids: BTreeMap<i64, i64>, pub asks: BTreeMap<i64, i64> }

#[derive(Debug)]
pub struct Gap;

impl LocalBook {
    /// Skips events the snapshot already covers and refuses any gap.
    pub fn apply(&mut self, e: &DiffEvent) -> Result<(), Gap> {
        if e.last <= self.last_id {
            return Ok(()); // already in the snapshot
        }
        if e.first > self.last_id + 1 {
            return Err(Gap); // rebuild from a new snapshot
        }
        for &(p, q) in &e.bids { set(&mut self.bids, p, q) }
        for &(p, q) in &e.asks { set(&mut self.asks, p, q) }
        self.last_id = e.last;
        Ok(())
    }
}

fn set(side: &mut BTreeMap<i64, i64>, price: i64, size: i64) {
    if size == 0 { side.remove(&price); } else { side.insert(price, size); }
}
```

Fed the worked sequence (snapshot at 1000, then events 998-1000, 1001-1004, 1005, 1007-1009), both skip the first, apply the next two and return the gap on the last.

Design notes:

- **Keep raw feeds, derive everything else.** Quotes, books and candles are rebuilt from the stored raw messages when a parser bug or a venue correction is found, the same principle as the ledger and the matching log.
- **Two timestamps on every quote:** the venue's and the receipt time, because latency, staleness and the "which NBBO did you use" question all need both.
- **Store decision quotes, not every quote.** `quotes` holds the snapshots that routing, execution quality and marks used; the full tick history stays in the raw store or an analytical database ([Analytical Databases](/docs/data/analytical-databases)).
- **Candles carry their rule and revision.** A chart, a statement and a tax report that disagree on a closing price have to be traceable to the candle rule each used.
- **Entitlements gate the stream and produce the bill.** The same rows decide who receives real-time data and what `data_usage_reports` counts.

## Auditing

- **What each customer was entitled to and received,** by product, classification and delivery, with the classification attestation, since plans and exchanges audit the counts.
- **The quote behind every decision,** with its source, sequence and both timestamps.
- **Every gap and rebuild** per feed, with duration, since a decision made on a stale book needs to be found.
- **Every candle revision** and the trades that changed it.
- **Every usage report as submitted,** with the query that produced it.

## What This Means for the System You Build

- **Check every incremental message's sequence and rebuild on any gap;** use checksums where the venue offers them.
- **Parse prices and sizes as decimals into integer units,** never floats.
- **Know which level and which semantics each feed sends:** absolute or delta, aggregated or order by order.
- **Fan out by conflating per client and sharding by symbol,** and give unconflated consumers a separate product.
- **Make candle rules explicit and candles recomputable** from stored trades.
- **Drive entitlements, display labels and usage reports from one set of rows,** and classify professional users one by one.

## References

**Law and regulation**

- [17 CFR 242.600](https://www.law.cornell.edu/cfr/text/17/242.600), core data including depth of book and auction information, odd-lot information and the round lot

**Regulators and guidance**

- [SEC: Market Data Infrastructure, final rule (Release 34-90610, 86 FR 18596, April 9, 2021)](https://www.federalregister.gov/api/v1/documents/2020-28370.json), decentralized consolidation, competing consolidators and self-aggregators
- [SEC: Approval of the CT Plan fee schedule (Release 34-105778, 91 FR 40047, July 1, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/07/01/2026-13215.txt), professional, non-professional and non-display fees, derived data as non-display, delayed subscribers, the inflation adjustment, the effective date, operative timing, the implementation period and the definitions of professional and non-professional use

**Standards and protocols**

- [CTA Plan](https://www.ctaplan.com/), median processing latency and the availability requirement
- [CTA: Schedule of market data charges](https://www.ctaplan.com/publicdocs/ctaplan/Schedule_of_Market_Data_Charges.pdf), professional device tiers, non-professional fees and non-display categories for Networks A and B
- [CTA: SIP metrics, third quarter 2026](https://www.nyse.com/publicdocs/ctaplan/CTA_SIP_Metrics_3Q_2026.pdf), September 2026 quote processing latency
- [UTP Plan](https://www.utpplan.com/), the transition to the CT Plan effective April 1, 2027
- [Nasdaq: TotalView-ITCH 5.0 specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf), message layouts, the Add Order fields, modify semantics, non-printable executions, protocol options, the FPGA feed and GLIMPSE

**Vendor documentation**

- [Coinbase Developer Platform: WebSocket channels](https://docs.cdp.coinbase.com/exchange/websocket-feed/channels), `level2` absolute sizes, `level2_batch`, the `full` channel, building an order-by-order book from a snapshot, heartbeats and `matches` recovery
- [Coinbase Developer Platform: WebSocket overview](https://docs.cdp.coinbase.com/exchange/websocket-feed/overview), endpoints, the 5-second subscription rule, sequence numbers and dropped messages
- [Kraken: WebSocket v2 book](https://docs.kraken.com/api/docs/websocket-v2/book), depths and the top-10 checksum
- [Kraken: Spot WebSocket book v2 guide](https://docs.kraken.com/api/docs/guides/spot-ws-book-v2), how the checksum string is built and why to parse decimals as strings
- [Binance: WebSocket streams](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md), managing a local order book, diff depth speeds, kline intervals and connection limits
- [Binance: REST API](https://raw.githubusercontent.com/binance/binance-spot-api-docs/refs/heads/master/rest-api.md), klines identified by open time and time zone handling
