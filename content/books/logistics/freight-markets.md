+++
title = "Freight Markets & Cycles"
description = "Spot and contract freight, the 2021 to 2026 cycle in the indexes, capacity, and what a cycle does to rate tables, tender rejections and routing guides."
category = "Logistics & Supply Chain Industry"
order = 2803
part = "The Business"
tags = ["logistics", "freight-markets", "spot-rates", "contract-rates", "indexes", "data-model"]
+++

Truckload freight is sold in two markets at once. Most of it moves on **contract** rates that a shipper agrees with carriers and brokers in an annual bid, lane by lane, for volume over months; the rest moves on the **spot** market, priced load by load the day it needs a truck. The two are the same trucks, so they pull on each other: when spot rates rise above contract, carriers reject contract tenders to haul spot freight, and shippers' routing guides fall through to more expensive options; when spot falls below contract, shippers rebid to capture the lower prices and carriers take what they can get. The cycle between those states has run for decades, and the 2020s gave it the largest swing in the record: a boom from late 2020 into early 2022, a freight recession from 2022 into 2025 that shrank carrier fleets and broke Yellow and Convoy, and a sharp tightening in 2026. DAT's dry van spot rate averaged $3.05 a mile in October 2026, "highest since early 2022," and the producer price index for long-distance truckload reached a record that month.

Software meets the cycle as data going stale. A rate table built in a soft market is wrong in a tight one; a routing guide that worked at 95% acceptance fails at 70%; a broker's contract sell rates fall behind its spot buy rates and its margins compress; a TMS that only stores the price it paid can't say whether that price was the market or a mistake. This chapter covers spot and contract and how they relate, the indexes and what each measures, the 2021 to 2026 cycle in their numbers, capacity and what moved it, and what a cycle does to rate tables, tenders and procurement. It extends `lane_rates` and `tenders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

Who sells in these markets is [The Logistics Landscape](/books/logistics/logistics-landscape); how brokers price a single load is [Pricing and Margin](/books/logistics/freight-brokerage#pricing-and-margin); the venues of the spot market are [Load Boards & Digital Freight Matching](/books/logistics/load-boards-and-matching). Bids and routing guides are Freight Procurement & Routing Guides; the tender state machine is Tendering & Acceptance; fuel surcharge tables are Rating, Tariffs & Accessorials.

## How the Indexes Do It

As of November 2026, from the publishers' own pages and the series as published:

| Index | Publisher | What it measures | Source data | Latest reading |
| --- | --- | --- | --- | --- |
| **Cass Freight Index: Shipments** | Cass Information Systems | "the number of for-hire intra-continental freight shipments across North America," all domestic modes (truckload about 33% of shipments, LTL about 40%) | Freight invoices Cass processes for its customers, by processing date, adjusted to a 21-day month; January 1990 = 1.00 | 1.056 for October 2026, up 5.9% from 0.997 a year earlier |
| **Cass Freight Index: Expenditures** | Cass | "the total dollars spent on freight transportation," contract and spot, fuel included | The same invoices | 4.010 for October 2026, up 26.5% from 3.169 |
| **DAT spot and contract rates** | DAT Freight & Analytics | National average rates per mile for van, reefer and flatbed; spot "paid by freight brokers to truckload carriers," contract paid by shippers | "invoice data submitted by shippers, brokers, and carriers," through DAT RateView in DAT iQ | October 2026 van spot $3.05 all-in, $2.22 linehaul; van contract $3.28 with fuel, $2.45 linehaul |
| **DAT Truckload Volume Index** | DAT | "monthly changes in loads with a pickup date during that month," hauls of 250 miles or more; January 2015 = 100 | The same data | October 2026 van 254, down 2% year over year |
| **PPI, long-distance truckload** | Bureau of Labor Statistics (via FRED) | Producer prices for general freight trucking, long-distance truckload | BLS producer price survey; December 2003 = 100 | 230.994 for October 2026, up from 184.899 a year earlier |
| **Tender rejection indexes** | FreightWaves SONAR (Outbound Tender Rejection Index) and others | The share of contract tenders carriers reject | Electronic tenders from shippers' and carriers' systems | Subscription data; not published openly |

The patterns:

- **Every index is someone's invoices.** Cass sees what its freight payment customers pay; DAT sees what its brokers, shippers and carriers submit; neither is the whole market, and each moves with its own customers' mix. A shipper that benchmarks against one should know whose freight it is.
- **Rates with and without fuel are different series.** DAT publishes spot rates all-in and linehaul rates net of "an amount equal to an average fuel surcharge"; Cass's expenditures include fuel. Comparing a linehaul contract rate to an all-in spot rate overstates the gap by the fuel surcharge, which DAT put at 83 cents a mile for van in October 2026.
- **Volume and price can disagree.** In October 2026 DAT's van volume index was down 2% year over year while van spot rates were up 98 cents: the market tightened because trucks left faster than freight did.
- **Indexes are revised.** Cass adjusts for "new and lost business," DAT rates move as late invoices arrive, and BLS revises producer prices; a stored reading needs the date it was read.

## Spot and Contract

The **contract** market runs on annual bids (often with quarterly or ad hoc mini-bids): a shipper publishes its lanes and volumes, carriers and brokers price them, the shipper awards each lane to a primary carrier and backups, and the award becomes the routing guide that the TMS tenders down. The rate is fixed for the term; the volume usually isn't. Award letters commit the carrier to accept a share of the shipper's loads and the shipper to tender roughly the forecast, and neither commitment is enforced load by load.

The **spot** market prices each load when it's needed: a load that fell through the routing guide, a surge the bid didn't foresee, a lane the shipper has no contract on, or freight that a broker buys from carriers load by load even when it sold on contract. Spot rates respond within days; contract rates respond at the next bid.

The **spread** between them is the cycle's gauge. DAT's October 2026 figures put van contract linehaul at $2.45 a mile and spot linehaul at $2.22, a spread of $0.23, down from $0.34 a year earlier. When the spread narrows and inverts (spot above contract), carriers' incentive to honor contract tenders weakens and rejection rates climb; when contract sits far above spot, shippers' incentive to rebid grows. A broker is long one market and short the other: it sells on contract and buys on spot, so a narrowing spread is a margin squeeze, which is what RXO described in its 2025 10-K ("buy rates to increase faster than our contractual sell rates").

## The 2021 to 2026 Cycle

The cycle in the published series (monthly values from FRED's copies of the Cass and BLS series):

| Period | PPI, long-distance truckload (Dec 2003 = 100) | Cass shipments (Jan 1990 = 1.00) | Cass expenditures | What happened |
| --- | --- | --- | --- | --- |
| **2019, before** | 136.1 to 141.0 | 1.05 to 1.23 | 2.72 to 2.92 | A soft market after the 2018 peak |
| **2020, the shock** | Low of 128.2 (May) | Low of 0.923 (April) | Low of 2.243 (May) | Pandemic closures, then a goods-demand surge from the second half |
| **2021 to early 2022, the boom** | 146.1 (January 2021) to a peak of 211.1 (March 2022) | 1.08 to 1.27 | 3.07 (January 2021) to a peak of 4.665 (June 2022) | Goods demand surges; prices and spending climb far faster than shipments |
| **2022 to 2025, the recession** | 211.1 down to a trough of 160.3 (November 2024) | From 1.278 (August 2022) to 0.932 (December 2025) | From 4.6 to about 3.0 to 3.3 | Imports and goods spending normalize; capacity added in the boom stays; spot below contract; carriers and brokers fail |
| **2026, the tightening** | 181.4 (January) to 231.0 (October), a series record | Low of 0.886 (January), 1.056 (October) | 2.990 (January) to 4.010 (October) | Capacity leaves faster than demand recovers; DAT spot van at $3.05 in October, "highest since early 2022" |

Three readings matter for a system designer. **The recession was long.** By the Cass shipments series, volumes fell for years; FreightWaves, reporting the October 2026 Cass release, called that month's "third straight y/y increase after 42 months of declines." <!-- source-gap: logistics-freight-markets-cass-42-months | secondary | Cass shipments fell year over year for 42 consecutive months before the 2026 recovery | closes with: the Cass Transportation Index Report PDF for October 2026 | checked: 2026-11-22 --> Contract rates built in 2022 bids were stale for three bid cycles. **Prices led volume out.** In 2026 the PPI and DAT rates turned up while Cass shipments were still near their lows; a market can tighten on supply alone. **Shocks are fast and recoveries slow.** The 2026 PPI rose 27% from January to October (my division of 230.994 by 181.359), faster than any annual bid can follow.

## Capacity

Supply in trucking is the number of trucks with drivers and authority, and it adjusts with a lag. In the boom, new authorities were cheap to get and owner-operators left fleets to run spot freight; in the recession they ran at a loss until savings or credit ran out; in 2026 regulation removed drivers faster than economics would have:

- **Fleet structure.** The ATA counts 91.5% of carriers at 10 trucks or fewer, so capacity is millions of small decisions to enter, park or leave, each visible only as an authority granted or revoked, an insurance filing lapsed, or a truck that stops posting on a board.
- **Equipment on the boards.** DAT reported equipment posts "running about 22% to 26% below last year depending on the equipment type" in October 2026, and that carriers were "in a position to be selective."
- **Regulatory removals.** English language proficiency became an out-of-service violation under CVSA's criteria from June 25, 2025, and FMCSA's August 10, 2026 proposal to codify it counts 19,045 out-of-service orders on 60,399 violations from then to March 19, 2026, against 33 on 7,812 in the months before (Drivers: CDLs, Qualification & the Clearinghouse covers the rule); FMCSA's final rule limiting non-domiciled CDLs to H-2A, H-2B and E-2 status took effect March 16, 2026, and its preamble describes more than 30 states issuing "tens of thousands" of non-domiciled CDLs contrary to the regulations. How many drivers these rules have removed from the market in total, as opposed to placed out of service at a roadside, is not in a source I opened. <!-- source-gap: logistics-freight-markets-capacity-removed | missing | number of drivers or carriers removed from service by ELP enforcement and the non-domiciled CDL rule in 2025-2026 | closes with: FMCSA or DOT data on out-of-service orders and CDL downgrades under both rules | checked: 2026-11-22 -->
- **Brokers say the same thing.** RXO's 2025 10-K says "the market tightened during 2025, with capacity rapidly exiting in certain regions."

Capacity indicators a system can compute from its own data: tender acceptance on its lanes, the number of distinct carriers responding to its spot postings, the share of loads that fall to spot, days from tender to cover, and the carriers whose authority or insurance lapsed. They are leading indicators for a shipper's next bid and a broker's pricing, and they come from records the system already keeps if it keeps them as history.

## What a Cycle Does to Software

**Rate tables go stale.** A lane rate is a price with a validity; the validity is a contract term, not a statement that the price is still the market. Systems should store, beside each contracted rate, the benchmark at award and the benchmark now, and report the lanes where they have drifted apart, which are the lanes about to fail.

**Tender rejections climb, and the routing guide falls through.** In a tight market the primary carrier rejects or lets tenders expire, the TMS tenders to the backups, and the load reaches spot. Each rejection is a record with a reason and the market at that moment; a TMS that stores only the final carrier can't tell a shipper why its freight cost 20% more than the bid. Tendering & Acceptance owns the state machine; this chapter adds the market context.

**Spot fallback needs a price.** When the guide is exhausted, the load needs a spot price, which in a TMS means a benchmark lookup, a quote request to brokers, or a posting. The benchmark at that moment belongs on the tender.

**Bids move from annual to frequent.** Shippers respond to volatile markets with mini-bids, shorter terms, and index-linked rates that move with a published benchmark inside a collar. An index-linked rate is data: the base, the index, its reading at award, the share of each change passed through, the floor and ceiling, and the reset dates.

**Margins compress and widen for brokers.** A broker selling contract and buying spot needs per-lane alerts when buy rates approach sell rates, and the history to show a shipper why a contract rate needs to change.

**Failures change counterparties.** Each recession ends with carriers and brokers gone (Yellow in August 2023, Convoy the same year); [The Logistics Landscape](/books/logistics/logistics-landscape#consolidation-2023-to-2026) covers the records that follow.

## How to Build It

The deltas store index series with their vintages, lane benchmarks over time, index-linked rate terms, and the market context on each tender:

```sql
CREATE TABLE market_index_series (         -- one published series
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher       TEXT NOT NULL,         -- 'cass', 'dat', 'bls', or a licensed vendor
  code            TEXT NOT NULL,         -- the publisher's series ID, e.g. 'PCU484121484121'
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL CHECK (unit IN ('index', 'minor_per_mile', 'ratio', 'percent')),
  includes_fuel   BOOLEAN,               -- null where it doesn't apply
  base_period     TEXT,                  -- 'Jan 1990 = 1.00', 'Dec 2003 = 100'
  frequency       TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  license         TEXT NOT NULL,         -- what the data's terms allow (display, internal, none)
  UNIQUE (publisher, code)
);

CREATE TABLE market_index_observations (   -- one reading, as published on one date
  series_id       UUID NOT NULL REFERENCES market_index_series (id),
  period_start    DATE NOT NULL,
  value           NUMERIC(14, 5) NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL,  -- the vintage: revisions are new rows
  retrieved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_ref      TEXT NOT NULL,         -- the URL or file it was read from
  PRIMARY KEY (series_id, period_start, published_at)
);

CREATE TABLE lane_benchmarks (             -- a lane's market price at a time, from a source
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  origin          TEXT NOT NULL,         -- the same keys lane_rates uses: 'zip3:606', 'state:US-IL'
  destination     TEXT NOT NULL,
  equipment_type  TEXT NOT NULL,
  market          TEXT NOT NULL CHECK (market IN ('spot', 'contract')),
  includes_fuel   BOOLEAN NOT NULL,
  rate            NUMERIC(14, 4) NOT NULL,  -- minor units per mile
  currency        CHAR(3) NOT NULL,
  window_days     SMALLINT NOT NULL,     -- the averaging window the source used
  sample_size     INT,                   -- where the source states it
  source          TEXT NOT NULL,         -- vendor or 'own_history'
  as_of           TIMESTAMPTZ NOT NULL,
  retrieved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON lane_benchmarks (origin, destination, equipment_type, market, as_of DESC);

ALTER TABLE lane_rates
  ADD COLUMN benchmark_at_award_id UUID REFERENCES lane_benchmarks (id),
  ADD COLUMN index_series_id       UUID REFERENCES market_index_series (id),  -- index-linked rates
  ADD COLUMN index_base_value      NUMERIC(14, 5),
  ADD COLUMN index_share_bp        INT,  -- the share of the index change passed through
  ADD COLUMN rate_floor            NUMERIC(14, 4),
  ADD COLUMN rate_ceiling          NUMERIC(14, 4),
  ADD COLUMN reset_every           INTERVAL;
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_index_link_check
  CHECK ((index_series_id IS NULL) = (index_base_value IS NULL)
     AND (index_series_id IS NULL) = (index_share_bp IS NULL)) NOT VALID;
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_index_share_bp_check
  CHECK (index_share_bp BETWEEN 0 AND 10000) NOT VALID;
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_collar_check
  CHECK (rate_floor IS NULL OR rate_ceiling IS NULL OR rate_floor <= rate_ceiling) NOT VALID;

ALTER TABLE tenders
  ADD COLUMN guide_position        SMALLINT,  -- 1 for the primary, 2 for the first backup
  ADD COLUMN benchmark_id          UUID REFERENCES lane_benchmarks (id),  -- the market when sent
  ADD COLUMN rejection_reason      TEXT;      -- normalized from the 990 or portal
ALTER TABLE tenders ADD CONSTRAINT tenders_rejection_reason_check
  CHECK (rejection_reason IS NULL OR rejection_reason IN ('no_capacity', 'rate', 'lane',
    'equipment', 'lead_time', 'expired_no_response', 'other')) NOT VALID;
```

Each `ALTER` with `NOT VALID` is validated after backfill, as [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) describes. The lanes drifting away from their awards, a report a shipper runs before its next mini-bid:

```sql
SELECT lr.id, lr.origin, lr.destination, lr.equipment_type,
       lr.rate AS contract_rate,
       award.rate AS benchmark_at_award,
       now_b.rate AS benchmark_now,
       round(100.0 * (now_b.rate - award.rate) / award.rate, 1) AS market_move_pct,
       acc.acceptance_pct
FROM lane_rates lr
JOIN lane_benchmarks award ON award.id = lr.benchmark_at_award_id
JOIN LATERAL (
  SELECT rate FROM lane_benchmarks b
  WHERE b.origin = lr.origin AND b.destination = lr.destination
    AND b.equipment_type = lr.equipment_type AND b.market = award.market
    AND b.includes_fuel = award.includes_fuel
  ORDER BY b.as_of DESC LIMIT 1) now_b ON TRUE
LEFT JOIN LATERAL (
  SELECT round(100.0 * count(*) FILTER (WHERE t.status = 'accepted') / NULLIF(count(*), 0), 1)
           AS acceptance_pct
  FROM tenders t
  WHERE t.lane_rate_id = lr.id AND t.sent_at > NOW() - INTERVAL '30 days') acc ON TRUE
WHERE lr.valid_during @> NOW()
ORDER BY market_move_pct DESC;
```

An index-linked rate is computed, at each reset, from the index reading in force and the contract's terms, in integer arithmetic with one rounding:

```go tab="Go"
// IndexedRate returns minor units per mile (scaled by 1e4, matching NUMERIC(14,4))
// for a lane whose rate moves with an index inside a collar.
func IndexedRate(baseRate, floor, ceiling int64, baseIndex, nowIndex *big.Rat, shareBP int64) int64 {
	// change = (now / base - 1) * share
	ratio := new(big.Rat).Quo(nowIndex, baseIndex)
	change := new(big.Rat).Sub(ratio, big.NewRat(1, 1))
	change.Mul(change, big.NewRat(shareBP, 10000))
	adj := new(big.Rat).Mul(new(big.Rat).SetInt64(baseRate), change)
	rate := baseRate + roundHalfEven(adj)
	if floor > 0 && rate < floor {
		rate = floor
	}
	if ceiling > 0 && rate > ceiling {
		rate = ceiling
	}
	return rate
}
```

```rust tab="Rust"
use rust_decimal::{Decimal, RoundingStrategy};

/// Minor units per mile, scaled by 1e4 to match NUMERIC(14,4), for a lane whose rate
/// moves with an index inside a collar.
pub fn indexed_rate(base_rate: i64, floor: Option<i64>, ceiling: Option<i64>,
                    base_index: Decimal, now_index: Decimal, share_bp: i64) -> i64 {
    let change = (now_index / base_index - Decimal::ONE) * Decimal::new(share_bp, 4);
    let adj = (Decimal::from(base_rate) * change)
        .round_dp_with_strategy(0, RoundingStrategy::MidpointNearestEven);
    let mut rate = base_rate + i64::try_from(adj).expect("rate fits in i64");
    if let Some(f) = floor { rate = rate.max(f); }
    if let Some(c) = ceiling { rate = rate.min(c); }
    rate
}
```

Design notes:

- **Observations carry their vintage.** A revised reading is a new row with a later `published_at`; a rate reset computed in March uses the reading published before the reset, and re-running it later reproduces the same answer ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Licenses are part of the data.** Vendor benchmarks come under terms that limit display and redistribution; `license` on the series decides whether a value may appear in a shipper-facing report, an internal screen or nowhere.
- **Benchmarks are snapshots, never joins to "latest."** A tender points at the benchmark row in force when it was sent, so the market context of a rejection can't change after the fact ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Rejection reasons are normalized at the edge.** Carriers answer in 990 codes, portal choices and free text; the TMS maps them to a small set and keeps the original in `response_code`.
- **Own history is a source.** A broker's or shipper's paid rates on a lane are a benchmark like any vendor's, labeled `own_history`, with its window and sample size.

## What This Means for the System You Build

- **Store the market beside every price:** the benchmark at award on a contract rate and at send on a tender.
- **Keep index readings with their publication dates** and their license terms, and compute index-linked rates from the vintage in force.
- **Track tender acceptance per lane over time,** with normalized reasons, as the leading indicator of a failing routing guide.
- **Report contract-to-market drift** before bids, and buy-to-sell drift for brokers.
- **Compare like with like:** all-in with all-in, linehaul with linehaul, the same equipment and window.
- **Expect counterparties to fail at the bottom of a cycle** and keep the records that make their exit manageable.

## References

**Indexes and data**

- [Cass Information Systems: Cass Freight Index](https://www.cassinfo.com/freight-audit-payment/cass-transportation-indexes/cass-freight-index), what the shipments and expenditures indexes measure, mode mix, base month and adjustments
- [FRED: Cass Freight Index, Shipments (FRGSHPUSM649NCIS)](https://fred.stlouisfed.org/series/FRGSHPUSM649NCIS), the monthly series, units and notes
- [FRED: Cass Freight Index, Shipments, data](https://fred.stlouisfed.org/graph/fredgraph.csv?id=FRGSHPUSM649NCIS&cosd=2019-01-01), monthly values 2019 to October 2026
- [FRED: Cass Freight Index, Expenditures, data](https://fred.stlouisfed.org/graph/fredgraph.csv?id=FRGEXPUSM649NCIS&cosd=2019-01-01), monthly values 2019 to October 2026
- [FRED: PPI, General Freight Trucking, Long-Distance Truckload (PCU484121484121)](https://fred.stlouisfed.org/series/PCU484121484121), the series, base and latest reading
- [FRED: PPI, long-distance truckload, data](https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCU484121484121&cosd=2019-01-01), monthly values 2019 to October 2026
- [DAT: Van spot rate rises to $3.05 a mile, highest since early 2022 (November 10, 2026)](https://www.dat.com/company/news-events/news-releases/dat-van-spot-rate-rises-to-3-05-a-mile-highest-since-early-2022), October 2026 spot, contract, linehaul and fuel rates, the Truckload Volume Index, equipment posts and definitions

**Government**

- [Federal Register: English Language Proficiency; Out of Service Criteria, proposed rule (August 10, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-08-10/html/2026-16288.htm), the CVSA criteria date and enforcement counts
- [Federal Register: Non-domiciled CDL final rule (February 13, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-02-13/html/2026-02965.htm), effective date, eligible statuses and states' issuance contrary to the regulations

**Filings and industry**

- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), capacity exiting in 2025 and buy rates rising faster than sell rates
- [American Trucking Associations: American Trucking Trends 2025](https://trucking.org/news-insights/ata-releases-latest-edition-american-trucking-trends-0), carrier fleet sizes

**Press**

- [FreightWaves: October TL rates surge as shipment counts extend positive streak (November 16, 2026)](https://www.freightwaves.com/?p=586189), the October 2026 Cass release, the 42 months of declines and SONAR's tender rejection index
