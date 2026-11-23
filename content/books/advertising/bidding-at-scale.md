+++
title = "Real-Time Bidding at Scale"
nav_title = "Bidding at Scale"
description = "Running a bidder or an exchange at volume: QPS and callout quotas, latency budgets, traffic shaping, caching, wire costs and cost per query."
category = "Advertising Industry"
order = 2970
part = "Running the Platform"
tags = ["advertising", "programmatic", "openrtb", "performance", "data-model"]
+++

A real-time bidder answers far more requests than it wins. Every bid request is an offer to look at one impression for a few tens of milliseconds; most end in a no-bid, most bids lose, and the few wins have to pay for the compute, the network and the data spent on all the rest. An exchange has the mirror problem: it fans each opportunity out to many bidders, each with a deadline, a capacity limit and an appetite for some traffic and not other traffic, and it pays for every callout whether or not anyone bids. At volume, the economics of real-time bidding are mostly the economics of saying no cheaply.

That is what makes it hard. The latency budget is fixed by the protocol and the exchange, and every stage inside it (parsing, filtering, looking up the user, scoring with a model, pricing, serializing) spends part of it; the traffic volume is set by partners and grows faster than revenue; and the cheapest request to process is the one never sent, which means the exchange and the bidder both need models of what the other will do. This chapter covers how traffic is metered between exchanges and bidders (QPS and callout quotas), how the latency budget is spent, the stages inside a bidder and where to cut, traffic shaping on both sides, caching, the cost of the wire, and cost per query as the number that decides whether traffic is worth taking. It extends `ad_requests` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the callout and connection records the Programmatic part adds.

Other chapters own the protocol and the parties. [How Programmatic Works](/books/advertising/how-programmatic-works) (in Programmatic) owns the bid request lifecycle and `bid_requests`; [OpenRTB](/books/advertising/openrtb) owns the objects; [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) owns `bidder_connections` and `connection_filters`; [Demand-Side Platforms](/books/advertising/demand-side-platforms) owns the bidder's pipeline from the buyer's side, bid shading and `supply_sources`; [Machine Learning for Ads](/books/advertising/machine-learning-for-ads) owns the models the bidder calls. The previous chapter, [Ad Platform Architecture](/books/advertising/ad-platform-architecture), owns the request path and data path split this chapter assumes. Generic capacity and cost engineering belong to Hosting & Cloud: [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost), [Transit, Peering and Interconnection](/books/hosting-and-cloud/networks-peering-and-ip-addresses#transit-peering-and-interconnection) and [FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills); the playbook owns [Admission Control](/docs/architecture/admission-control) and [Retries & Timeouts](/docs/architecture/retries-and-timeouts).

## How the Platforms Do It

Exchanges publish the rules a bidder has to live inside; bidders publish almost nothing about their own scale. As of November 2026:

| Platform | Capacity rule | Latency rule | Shaping |
| --- | --- | --- | --- |
| **Google Authorized Buyers** | A QPS limit "configured and enforced per bidder server URL, technically per trading location-URL pair"; the effective limit is "the minimum of the configured quota and spend-based quota"; "Programmatic Guarantee requests are always prioritized" | Deadline of 80 to 1,000 ms set in `tmax`; "85 percent of responses be received within the deadline" | Error throttling that "Gradually lowers the outgoing QPS" when errors are too high and "Adjusts within minutes"; Smart Throttling, applied "When your endpoint reaches its configured Queries Per Second (QPS) limit", "filters out bid requests with a lower predicted bid likelihood" |
| **Microsoft Monetize** | QPS caps per bidder | Not stated on the shaping page | Supply Stream Efficiency "automatically discards low-scoring traffic" by "the bidder's bidding and buying history"; "New and low-scoring traffic is sent in controlled amounts" |
| **OpenRTB 2.6** (the protocol) | Not specified | `tmax` is the "Maximum time in milliseconds the exchange allows for bids to be received including Internet latency" | Not specified; "enable HTTP Persistent Connections"; request compression "must first be agreed upon between the exchange and the bidder" |
| **Prebid Server** | Host configuration | `bidder_tmax = tmax - request_processing_time - bidder_network_latency_buffer_ms - bidder_response_duration_min_ms`; no callout if the result is below the response preparation time; PBS-Java's minimum bidder `tmax` defaults to 50 ms with at least 150 ms recommended | Not built in; hosts configure bidders per account |

Two things are common to every exchange that publishes rules. Capacity is allocated per region and per endpoint, and a bidder that answers late or badly loses traffic automatically. The published numbers are rules, not scale: no exchange or DSP opened for this chapter publishes its total bid requests per second, and the Callout Quota System's own accuracy notes ("More than 15K QPS, the system generally adheres to within 10% of the QPS limit", and within 5% above 45,000) are the closest public hint of the operating range of a single endpoint.
<!-- source-gap: adv-rtb-total-qps | missing | total bid requests per second handled by large exchanges or DSPs | closes with: a filing or engineering publication stating QPS or daily bid requests | checked: 2026-11-22 -->

## QPS, Quotas and Who Pays for a Callout

The unit of traffic is the **callout**: one bid request to one bidder for one auction, recorded as a `bid_requests` row in [How Programmatic Works](/books/advertising/how-programmatic-works). QPS is callouts per second per connection, and it is metered from the exchange's side because the exchange chooses what to send.

How a quota is set, on Authorized Buyers as the documented example:

- **A configured limit per endpoint and location.** The bidder (or its account manager) sets a maximum per server URL; the limit is enforced per trading location and URL pair, and the account's total can't exceed what the exchange has configured for it.
- **A spend-based ceiling.** "The maximum quota limit for your bidder also depends on your recent spend." A bidder that buys little gets less traffic regardless of what it asks for, which is the exchange protecting its own callout cost.
- **Priority within the quota.** "Programmatic Guarantee requests are always prioritized", with requests the bidder is likely to bid on favored next; above the quota, other pretargeting matches "are dropped".
- **Inaccuracy at small volume.** The system "is less accurate at small volumes": a limit of "about 1,000 QPS or less" can be exceeded, sometimes doubled, so a small bidder sizes for more than its quota.

The economics are asymmetric. The exchange pays to build and send each callout and to wait for it; the bidder pays to receive, parse and decide. Neither is paid until an impression bills, so both want the other to filter: the exchange wants bidders to declare what they will buy (pretargeting, `connection_filters` in [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges)), and the bidder wants the exchange to send only what it is likely to buy (shaping, below). A quota is the negotiated ceiling between them, and spend-based quotas make the ceiling follow value.

My rule for a bidder: size capacity per region for the quota plus a margin, never for the average, because a quota is a ceiling the exchange can fill at any second, and a bidder that falls behind starts timing out, which lowers its quota through error throttling. For an exchange: record the quota and its source on every connection, so a drop in a bidder's volume can be traced to its own limit, its spend, its errors or shaping.

## The Latency Budget

`tmax` is the whole budget, measured at the exchange and "including Internet latency". It is spent in pieces, and the bidder controls only some of them:

| Stage | Who controls it | Illustrative share of a 120 ms `tmax` |
| --- | --- | --- |
| Exchange builds and sends the request | Exchange | 5 ms |
| Network, exchange to bidder | Peering, region choice | 5 to 40 ms |
| Bidder: parse, pre-filter, retrieve, score, price, serialize | Bidder | 20 to 40 ms |
| Network, bidder to exchange | Peering, region choice | 5 to 40 ms |
| Exchange margin for its own auction and response | Exchange | 10 to 20 ms |

The shares are illustrative, not any exchange's published split; what is published is the total deadline (80 to 1,000 ms on Authorized Buyers, by format and auction type) and the requirement that most responses arrive in time. The point of the table is the network rows: a bidder in the wrong region can spend most of the budget on round trips, which is why Authorized Buyers tells bidders to "locate your servers close to the trading locations" and to peer when volume is large.

An exchange that calls other exchanges, or a header bidding server calling SSPs, has to subtract its own share before passing the deadline on. Prebid Server's formula is the published version: the bidder's deadline is the request's `tmax` less the server's own processing time, a configured network latency buffer and a minimum response duration, and a bidder whose computed deadline is below what the server needs to prepare its own response isn't called at all. Each hop shrinks the budget, which is one of the costs of long supply chains that Take Rates & Supply Quality measures in money ([Supply Path Optimization](/books/advertising/take-rates-and-supply-quality#supply-path-optimization)).

The bidder's side of the same arithmetic, with the margin it keeps for its own network:

```go tab="Go"
package bidder

import "time"

// Budget splits an incoming deadline into what this bidder may spend on each stage.
type Budget struct {
	Deadline   time.Time     // receipt time + tmax - estimated return-trip network time
	ScoreAfter time.Duration // skip expensive scoring if less than this remains
}

// NewBudget derives the bidder's working deadline from tmax and a measured network estimate.
// returnTrip is the p95 response network time to this exchange from this region.
func NewBudget(received time.Time, tmaxMs int, returnTrip, safety time.Duration) (Budget, bool) {
	d := received.Add(time.Duration(tmaxMs)*time.Millisecond - returnTrip - safety)
	if time.Until(d) <= 0 {
		return Budget{}, false // no time left: answer 204 now
	}
	return Budget{Deadline: d, ScoreAfter: 8 * time.Millisecond}, true
}

// Remaining is checked between stages; stages degrade rather than overrun.
func (b Budget) Remaining() time.Duration { return time.Until(b.Deadline) }

// CanScore says whether the full model can run, or the bidder should price from a cheaper prior.
func (b Budget) CanScore() bool { return b.Remaining() > b.ScoreAfter }
```

```rust tab="Rust"
use std::time::{Duration, Instant};

/// Splits an incoming deadline into what this bidder may spend on each stage.
pub struct Budget {
    pub deadline: Instant,     // receipt + tmax - estimated return-trip network time
    pub score_after: Duration, // skip expensive scoring if less than this remains
}

impl Budget {
    /// `return_trip` is the p95 response network time to this exchange from this region.
    pub fn new(received: Instant, tmax_ms: u64, return_trip: Duration, safety: Duration) -> Option<Self> {
        let deadline = received + Duration::from_millis(tmax_ms);
        let deadline = deadline.checked_sub(return_trip + safety)?;
        if deadline <= Instant::now() {
            return None; // no time left: answer 204 now
        }
        Some(Budget { deadline, score_after: Duration::from_millis(8) })
    }

    pub fn remaining(&self) -> Duration {
        self.deadline.saturating_duration_since(Instant::now())
    }

    pub fn can_score(&self) -> bool {
        self.remaining() > self.score_after
    }
}
```

Two practices follow. **Measure the network, don't assume it**: the return-trip estimate is a per-exchange, per-region percentile from the bidder's own logs, refreshed continuously. **Degrade, don't overrun**: a request that arrives with little budget left gets a cheaper model or a no-bid, because a late bid is worth nothing and counts against the error rate. Timeouts in general are the playbook's [Every Call Has a Timeout](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout); in RTB the deadline is set by the caller and never retried.

## Inside a Bidder

A bidder is a funnel of stages ordered by cost, so that most requests exit before the expensive ones. The order that every public description converges on:

1. **Parse and validate.** Decode JSON or protobuf, reject malformed requests with HTTP 400, answer obvious non-matches with 204. OpenRTB says calls with no content return 204 and "an empty bid response" is another way to say no-bid.
2. **Pre-filter on the request alone.** Supply rules (`supply_sources` in [Demand-Side Platforms](/books/advertising/demand-side-platforms): blocked sellers, unauthorized paths, MFA lists), ads.txt authorization, the consent signals, the channel and format. These need no user lookup and remove a large share of traffic.
3. **Retrieve candidates.** Find the line items whose targeting matches, from an inverted index over targeting expressions in the line item snapshot ([Ad Servers](/books/advertising/ad-servers#building-one) describes the index). A few thousand line items can be scanned; a few million can't.
4. **Check budget, pacing and frequency.** Each candidate's regional budget allocation and pacing participation rate, and the user's frequency counts where the consent mode allows a user key.
5. **Look up the user.** The user store (segments, recency, syncs), keyed by the identifier the request carries and the mode allows. This is the stage most likely to blow the budget, so it is bounded by a timeout and allowed to miss.
6. **Score.** Predict click, conversion or view probabilities per candidate with the models from [Machine Learning for Ads](/books/advertising/machine-learning-for-ads); at scale this is the largest compute cost per bid.
7. **Price.** Value per impression from the line item's goal and the predictions, then bid shading against the win-rate model; the result is written to `bids` with `value_cpm_micros`, `unshaded_cpm_micros`, `win_probability_ppm` and `bid_model_version`.
8. **Respond.** Serialize the bid with creative, deal and notice URLs.

The funnel's shape is a measurement, not a guess. Every exit is counted by stage and reason per hour (the table below), because the cheapest optimization is moving a filter earlier: a block that runs after the user lookup costs a user lookup per blocked request. Retrieval-then-ranking is the same structure walled gardens publish for their own delivery: Meta's retrieval stage processes "three orders of magnitude more ads than subsequent stages", selecting from "tens of millions of ad candidates into a few thousand" before larger models rank them.

## Traffic Shaping

Traffic shaping is the exchange deciding, per callout, whether a bidder is likely enough to bid to be worth sending. It exists because the alternative (send everything, let the bidder filter) wastes both sides' compute, and because quotas force a choice anyway. Both vendors that document it describe the same design:

- **Learn from the bidder's own history.** Smart Throttling's inputs are the bidder's "historical bidding behavior" plus inventory, user and deal characteristics; Supply Stream Efficiency scores traffic "as determined by the bidder's bidding and buying history".
- **Shape harder near the cap.** Smart Throttling applies "When your endpoint reaches its configured Queries Per Second (QPS) limit"; Monetize filters "As a bidder approaches their QPS cap" so that "only the most valuable traffic is retained".
- **Keep exploring.** Monetize sends "New and low-scoring traffic ... in controlled amounts, enabling bidders to explore new opportunities". Without an exploration share, a shaping model only ever sees traffic it already predicted well and can't learn that a bidder's appetite changed.
- **Deals weigh heavily.** Smart Throttling counts "Deal presence" among its inputs, and Authorized Buyers prioritizes programmatic guaranteed requests within the quota; neither page says deal requests bypass shaping entirely.

[SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) records the mechanism: `bidder_connections.exploration_bp` is the exploration share and `bid_requests.shaping` says whether each callout went because it scored, because it was exploration, or because it carried a deal. Two consequences for a bidder. Its volume can fall without any change on its side, because the exchange's model of it changed; and a new campaign that wants inventory the bidder never bought before will see little of it until exploration traffic shows the bidder now bids there. A bidder that changes strategy should tell its exchanges, or widen its declared filters, rather than wait for the models to notice.

Shaping on the bidder's side is the declared filter (pretargeting): telling the exchange in advance what not to send. It is cheaper than any model because the request is never built. My rule: keep declared filters in step with what the bidder actually buys (formats, countries, publishers it blocks), review them when supply rules change, and leave value-based selection to the exchange's shaping, which sees traffic the bidder never does.

## Caching

What can and can't be cached on the request path:

| Data | Cacheable | How | Why |
| --- | --- | --- | --- |
| Line items, targeting, creatives, supply rules | Yes, as the snapshot | Versioned snapshot in memory | Changes propagate in minutes by design ([Ad Platform Architecture](/books/advertising/ad-platform-architecture#serving-snapshots-and-configuration-propagation)) |
| Model weights and embeddings for ads | Yes | Loaded with the model version | Fixed for the model's life |
| User profile lookups | Briefly, with negative caching | Per-node LRU with a short TTL; cache misses too | A user seen once is often seen again within seconds; most IDs are unknown ([Negative Caching](/docs/architecture/application-caching#negative-caching)) |
| Seller, domain and app metadata | Yes | Snapshot or long TTL | Slow-changing reference data |
| ads.txt and sellers.json results | Yes | Crawl results, versioned | ads.txt's default cache expiry is 7 days ([ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain)) |
| Budget remaining | No | Regional allocation counters | A cached budget is an overspend |
| Frequency counts | No (read-through only) | Home-region key-value store | A cached count is a cap violation |
| Bids and VAST for later rendering | Yes, by the seller | Prebid Cache: bids cached by UUID with a `ttlseconds`, and PBS-Go adds "A 60-second buffer" | The ad server or player fetches the winning markup after the auction |

Two hazards are specific to bidding. **Stampedes on hot keys**: a popular page's URL or a common segment can be requested by thousands of concurrent requests at once; collapsing concurrent misses into one fetch is [Request Collapsing](/books/hosting-and-cloud/caching-and-invalidation#request-collapsing) and [Stampedes](/docs/architecture/application-caching#stampedes). **Caching across consent states**: a cache keyed only by user ID can serve a profile to a request whose mode doesn't allow it; the key includes the mode, or the lookup is skipped for `limited` requests entirely.

## The Wire

At billions of callouts a day, bytes are money twice: egress for the sender and CPU for both sides to compress, parse and serialize. OpenRTB's own guidance is short: JSON is "the suggested format", an exchange "may also offer binary representations (e.g., compressed JSON, ProtoBuf, Avro, etc.)", response compression uses "standard HTTP 1.1 mechanisms", while compressing the request "must first be agreed upon between the exchange and the bidder", and connections should be persistent ("enable HTTP Persistent Connections, also known as Keep-Alive"). Authorized Buyers supports both "OpenRTB (Protobuf) and OpenRTB (JSON)".

What that means in practice:

- **Persistent connections are not optional.** A TLS handshake per callout costs more than the bid decision. Pools sized per exchange and region, with connection reuse measured, are part of the bidder's capacity plan.
- **Binary formats save CPU, compression saves bandwidth, and both cost something.** Protobuf parses faster and is smaller than JSON; gzip shrinks JSON substantially but costs CPU on both sides. The choice is per connection, recorded on `bidder_connections.protocol` and `gzip`.
- **Payload size is a field to watch.** `bid_requests.request_bytes` per connection shows which exchanges send bloated requests (long `ext` objects, repeated `eids`, full user agents and client hints); a bidder can ask an exchange to drop fields it never reads, which is cheaper than any optimization on its side.

## Cost per Query

The number that decides whether traffic is worth taking is the cost of processing it against the money it produces. For a bidder, per thousand callouts:

```text
cost per 1,000 callouts     = request-path cost for the period / callouts × 1,000
margin per 1,000 callouts   = (DSP revenue on impressions won from those callouts) / callouts × 1,000
break-even                  = margin per 1,000 callouts ≥ cost per 1,000 callouts
```

Request-path cost is compute, memory, network egress, the user store and the share of model serving the request path uses, allocated by region and exchange from the cloud bill ([Cost Allocation](/books/hosting-and-cloud/autoscaling-and-cost#cost-allocation)). Revenue is the bidder's own take, not the media cost: a DSP keeps its fee on media it buys ([Gross Spend versus Net Revenue](/books/advertising/advertising-business#the-core-data-model) in the core model's splits), so a callout is worth the fee on the expected spend it produces.

A worked example with illustrative numbers (not any company's): a bidder processes 2 billion callouts a day from one exchange in one region at a request-path cost of $1,200 a day. That is $0.0006 per thousand callouts. It wins 3 million impressions from them at an average $2.00 CPM, $6,000 of media, and keeps a 15% fee, $900 of revenue: $0.00045 per thousand callouts. The traffic loses money ($900 against $1,200). The levers, in order of cheapness: declare filters so the worst-performing slices are never sent; ask for shaping or a lower quota so fewer callouts arrive; pre-filter earlier in the funnel so the callouts that do arrive cost less; and only then buy more of the traffic by bidding higher. The same arithmetic per exchange, per region and per publisher is what supply path decisions are made on, alongside quality.

For an exchange, the same formula runs per bidder: the cost of building and sending a bidder's callouts against the exchange's fee on that bidder's wins. Spend-based quotas are this calculation turned into policy.

## Testing at Scale

A bidder's correctness and its performance are both tested on real traffic shapes, not synthetic ones:

- **Replay.** Sampled bid requests (stored with their consent state, minus anything the retention rules forbid) are replayed against a new build at production rates; its bids are compared with production's for the same requests. Price differences outside a bound block the release. The playbook's [Replay and Shadow Testing](/docs/building-blocks/weighing-objectives#replay-and-shadow-testing) is the general method.
- **Shadow traffic.** A share of live callouts is mirrored to the new build, which decides but doesn't respond; latency percentiles and decisions are compared under real load.
- **Canaries by region.** A new build takes a small share of one region's traffic, with the error rate and the latency percentiles at the exchange's measurement point (not the bidder's) as the guard. An exchange's error throttling reacts in minutes, so a bad canary is caught by the exchange before the bidder's dashboards if the guard is slow.

## How to Build It

[How Programmatic Works](/books/advertising/how-programmatic-works) defines `bid_requests` (one callout, with `latency_ms`, `status`, `request_bytes`), [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) defines `bidder_connections` (endpoint, region, protocol, `tmax_ms`, `max_qps`, `gzip`, `exploration_bp`) and `connection_filters`, and [Demand-Side Platforms](/books/advertising/demand-side-platforms) adds the pricing columns to `bids`. This chapter adds the quota history per connection, the bidder's funnel by stage and reason, and the request-path cost that cost per query is computed from.

```sql
CREATE TABLE callout_quotas (            -- the QPS ceiling in force on a connection, and why
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  bidder_connection_id  UUID NOT NULL REFERENCES bidder_connections (id),
  source                TEXT NOT NULL CHECK (source IN ('configured', 'spend_based',
                          'error_throttle', 'contract', 'exchange_default')),
  max_qps               INT NOT NULL CHECK (max_qps >= 0),
  effective             TSTZRANGE NOT NULL,
  set_by                TEXT NOT NULL,   -- typed actor: the bidder's API user, an exchange job and version
  note                  TEXT,
  EXCLUDE USING gist (bidder_connection_id WITH =, source WITH =, effective WITH &&)  -- needs btree_gist
);

CREATE TABLE bid_funnel_hourly (         -- the bidder's exits by stage and reason
  hour                  TIMESTAMPTZ NOT NULL,
  region                TEXT NOT NULL,
  exchange_org_id       UUID NOT NULL REFERENCES organizations (id),
  stage                 TEXT NOT NULL CHECK (stage IN ('parse', 'pre_filter', 'retrieve',
                          'budget', 'user_lookup', 'score', 'price', 'respond')),
  reason                TEXT NOT NULL,   -- 'malformed', 'supply_block', 'unauthorized_seller',
                                         -- 'no_consent', 'no_candidates', 'budget_exhausted',
                                         -- 'frequency_cap', 'below_floor', 'deadline', 'bid'
  requests              BIGINT NOT NULL CHECK (requests >= 0),
  cpu_ms                BIGINT,          -- sampled CPU spent on requests that exited here
  PRIMARY KEY (hour, region, exchange_org_id, stage, reason)
);

CREATE TABLE request_path_costs_daily (  -- allocated infrastructure cost of the request path
  day                   DATE NOT NULL,
  service               TEXT NOT NULL CHECK (service IN ('ad_server', 'exchange', 'bidder',
                          'counter', 'model_serving', 'user_store')),
  region                TEXT NOT NULL,
  counterparty_org_id   UUID REFERENCES organizations (id),  -- the exchange or bidder the cost is allocated to
  requests              BIGINT NOT NULL CHECK (requests >= 0),
  cost_micros           BIGINT NOT NULL CHECK (cost_micros >= 0),  -- in currency micros
  currency              CHAR(3) NOT NULL,
  allocation_method     TEXT NOT NULL,   -- e.g. 'cpu_share_v3'; the cost allocation rule version
  UNIQUE NULLS NOT DISTINCT (day, service, region, counterparty_org_id)
);

ALTER TABLE bid_requests ADD COLUMN response_bytes INT,
                         ADD COLUMN sending_region TEXT;  -- the exchange's region that sent it
```

Cost per thousand callouts against revenue per thousand callouts, per exchange and region for a bidder, with the DSP's fee from `fee_terms` applied to the media it bought on that path (the fee is the rate on the media cost the billing notices rolled up):

```sql
WITH traffic AS (
  SELECT day, region, counterparty_org_id AS exchange_org_id,
         sum(requests) AS callouts, sum(cost_micros) AS cost_micros
  FROM request_path_costs_daily
  WHERE service IN ('bidder', 'model_serving', 'user_store')
    AND day >= $1 AND day < $2
  GROUP BY 1, 2, 3
), media AS (
  SELECT d.day, d.source_org_id AS exchange_org_id, sum(d.cost_micros) AS media_micros
  FROM delivery_daily d
  WHERE d.source = 'exchange' AND d.day >= $1 AND d.day < $2
  GROUP BY 1, 2
)
SELECT t.day, t.region, t.exchange_org_id, t.callouts,
       round(t.cost_micros::numeric / NULLIF(t.callouts, 0) * 1000)              AS cost_per_k_micros,
       round(m.media_micros * $3::numeric / 10000 / NULLIF(t.callouts, 0) * 1000) AS revenue_per_k_micros
FROM traffic t
LEFT JOIN media m ON m.day = t.day AND m.exchange_org_id = t.exchange_org_id;
-- $3: the platform fee in basis points from the fee_terms row in force (e.g. 1500)
```

The sketch takes one fee rate for the period and attributes media to the exchange, not the region (billing notices don't carry the bidding region); a production version joins each day's `fee_terms` row and splits media by region from the winning bids.

The exchange's view, why a bidder's volume moved, from the quota history and the callouts:

```sql
WITH hourly AS (
  SELECT date_trunc('hour', br.sent_at)                                   AS hour,
         count(*)                                                          AS callouts,
         count(*) FILTER (WHERE br.shaping = 'exploration')                AS exploration,
         count(*) FILTER (WHERE br.status IN ('timeout', 'error'))         AS errors
  FROM bid_requests br
  WHERE br.bidder_connection_id = $1
    AND br.sent_at >= now() - interval '48 hours'
  GROUP BY 1
)
SELECT h.*,
       (SELECT min(q.max_qps) FROM callout_quotas q
         WHERE q.bidder_connection_id = $1
           AND q.effective @> h.hour)                                      AS effective_qps_limit
FROM hourly h
ORDER BY h.hour;
```

Design notes:

- **The effective quota is the minimum of its sources.** Configured, spend-based, contractual and error-throttle limits are separate rows with their own effective ranges, so the effective ceiling at any hour is `min(max_qps)` over the rows in force, and the source that bound it explains the volume.
- **The funnel is counted, not logged.** Most requests exit early and aren't worth a row each; `bid_funnel_hourly` counts exits per stage and reason, with sampled CPU, which is what moving a filter earlier needs.
- **Cost is allocated by rule, with the rule's version.** `allocation_method` names how the cloud bill was split across services, regions and counterparties, so cost per query is reproducible and a change in allocation isn't mistaken for a change in efficiency ([The Metering Pipeline](/books/hosting-and-cloud/provider-architecture#the-metering-pipeline) is the provider side of the same idea).
- **Region on the callout.** `bid_requests.sending_region` is the exchange's sending region, the number that matters for network latency and quota; the bidder's region is on its own records.
- **Sample callouts, keep the aggregates.** Callouts are kept whole for a short window and sampled after, as How Programmatic Works describes; the hourly funnel, quotas and costs are small and kept long.

## Auditing

- **Why volume changed.** For every connection, the quota in force by source, the shaping share and the error rate by hour, so a partner's question about lost traffic has a dated answer.
- **What was sent to whom.** The callouts with their shaping reason, region and the consent-based fields removed, from [How Programmatic Works](/books/advertising/how-programmatic-works)' `bid_requests`.
- **What the bidder did with it.** The funnel by stage and reason, and the bids with their model versions and shading.
- **What it cost.** Request-path cost by service, region and counterparty, with the allocation rule, next to the revenue it produced.

## What This Means for the System You Build

- **Treat the callout as the unit of cost** and meter it per connection and region.
- **Size for the quota, not the average,** and answer late requests with a fast no-bid, because errors cost traffic.
- **Measure the network per exchange and region** and subtract it from `tmax` before spending the budget.
- **Order the bidder's stages by cost,** count exits by stage and reason, and move filters earlier.
- **Keep declared filters in step with what the bidder buys,** and expect exchange shaping to keep an exploration share.
- **Cache configuration and reference data, never budgets or frequency counts,** and key caches by consent mode.
- **Negotiate the wire:** persistent connections, protocol and compression per connection, and payload size watched.
- **Compute cost per thousand callouts against revenue per thousand callouts,** and cut traffic that loses money before bidding higher on it.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md), `tmax`, HTTP 204 for no-bid, keep-alive, data formats and negotiated compression
- [IAB Tech Lab: ads.txt 1.1](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf), the default cache expiry of 7 days absent cache-control headers

**Reference**

- [Google Authorized Buyers: Real-time Bidding overview](https://developers.google.com/authorized-buyers/rtb/start), the 80 to 1000 ms deadline and the Protobuf and JSON protocols
- [Google Authorized Buyers: Trading locations and peering](https://developers.google.com/authorized-buyers/rtb/peer-guide), the 85% within-deadline requirement, server placement and peering
- [Google Authorized Buyers: Callout Quota System](https://developers.google.com/authorized-buyers/rtb/callout-quota-system), per-location quotas, spend-based quotas, guaranteed-deal priority, error throttling and accuracy at 15,000 and 45,000 QPS and below 1,000
- [Google Authorized Buyers Help: Smart Throttling for Bidders](https://support.google.com/authorizedbuyers/answer/13965526?hl=en), when it applies and the inputs it uses
- [Microsoft Learn: Supply Stream Efficiency](https://learn.microsoft.com/en-us/xandr/bidders/supply-stream-efficiency), shaping by buying history, filtering near QPS caps and controlled exploration
- [Prebid Server: Auction endpoint](https://docs.prebid.org/prebid-server/endpoints/openrtb2/pbs-endpoint-auction.html), the bidder `tmax` formula, the minimum bidder `tmax` default and recommendation, and Prebid Cache TTLs
- [Meta Engineering: Meta Andromeda (December 2, 2024)](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), retrieval processing three orders of magnitude more ads than later stages
