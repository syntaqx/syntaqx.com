+++
title = "Ad Servers"
description = "Publisher and advertiser ad servers, the ad request flow, decisioning, priority classes, dynamic allocation, mediating demand, and building one."
category = "Advertising Industry"
order = 2906
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "ad-serving", "decisioning", "data-model"]
+++

An ad server is the system that answers one question many thousands of times a second: for this request, from this ad unit, for this visitor, right now, which ad shows? It holds the publisher's booked campaigns and the rules that govern them, finds every line item the request is eligible for, removes the ones capped, paced out or excluded, ranks the rest against each other and against programmatic demand, picks a creative, returns it and records what happened. There are two kinds. A **publisher ad server** (Google Ad Manager, FreeWheel, Microsoft Monetize, Kevel, the open-source Revive Adserver, and many in-house systems at retailers, streamers and social platforms) decides what fills the publisher's own inventory. An **advertiser ad server** (Campaign Manager 360, Flashtalking and Innovid under Mediaocean) hosts an advertiser's creatives, serves or redirects them wherever they were bought and counts them independently, which is why the IAB/4A's terms define a "Third Party Ad Server" as one "that will serve and/or track Ads".

It is hard for three reasons. The decision has a latency budget measured in tens of milliseconds and runs against a working set (every active line item, its targeting, its pacing state and every visitor's frequency counts) that changes constantly. The decision is a contract enforcer: a guaranteed line item that under-delivers costs the publisher a make-good or a credit, so the ad server has to protect promises while also selling every impression it doesn't need for them at the best price. And the ad server is the record: whatever it counted is the publisher's first-party number in every discrepancy, so its decisions and counts must be explainable after the fact.

This chapter covers the two kinds of ad server and how they meet, the request flow, the decision (eligibility, priority classes, competition between guaranteed and auction demand, creative selection), how a publisher ad server mediates demand from other exchanges, and how to build one. It extends `ad_units`, `line_items` and `auctions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Other chapters in this part own the pieces the decision consumes: [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) owns the line item's goal, budget and targeting expression; [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) owns the pacing controller and the frequency counters; [Forecasting & Avails](/books/advertising/forecasting-and-avails) owns what can be sold before it is booked; [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) owns the tag that calls the ad server; [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) owns what the ad server records after it decides. Header bidding and the exchange auctions that compete inside the ad server are in the Programmatic part, and floors in [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization).

## How the Platforms Do It

As of November 2026, from each product's public documentation:

| Ad server | Kind | Hierarchy | Priority model | How guaranteed and auction demand compete | Disclosed limits |
| --- | --- | --- | --- | --- | --- |
| **Campaign Manager 360** (Google) | Advertiser | Advertisers, campaigns, placements, ads and creatives are named in the overview; their nesting is not | Not a publisher priority system; serves or tracks the ad already bought elsewhere | Not applicable: it serves the creative after the publisher's or DSP's decision | Described as "a web-based ad management system for advertisers and agencies" |
| **Flashtalking and Innovid** (Mediaocean) | Advertiser | Not published in public docs | Not applicable | Not applicable | Combined after Mediaocean closed its acquisition of Innovid on February 13, 2025, spanning "ad serving, creative, measurement, and optimization" |
| **FreeWheel** | Publisher, video and TV | Not published in public docs | Not published | "Streaming Hub combines FreeWheel SSP with our industry-leading ad server" | Not published |
| **Google Ad Manager** | Publisher | Order, line item, creative | Numeric, lower wins: sponsorship 4, standard 6, 8 or 10, remnant and exchange 12, house 16 | Dynamic allocation: guaranteed line items compete with a temporary CPM, "the opportunity cost of not serving the guaranteed line item" | 300 contending line items per request, 450 line items per order, 260 creatives per line item, 200 active keys |
| **Kevel** | Publisher, API-first | Advertiser, campaign, flight, ad | Named priorities in order, for example Sponsorship ads first, then Auction ads, then House ads | Within a priority, a weighted lottery or an auction on eCPM times a relevancy score; requests with no winner "fall through to the next priority" | "25K+ requests per second" stated for the platform |
| **Microsoft Monetize** (formerly Xandr) | Publisher | Insertion order, line item, creative | Numeric 1 to 20, higher wins; standard default 5, guaranteed default 14 ("Impressions") and 19 ("Exclusive") | Open Dynamic Allocation: one guaranteed bid with a priority CPM (pCPM) representing "the risk that the line item will not deliver in full", competing with up to 14 non-guaranteed bids | Reselling priority set per network gates RTB access |
| **Revive Adserver** | Publisher, open source | Advertisers and campaigns, on the page opened | Not described on the pages opened | Not described on the pages opened | "free, open source ad serving system" under the GPL-2.0 license |

Four patterns hold across them:

- **Priority is a class, then a competition.** Every publisher ad server sorts demand into tiers (sponsorship or exclusive, standard guaranteed, price-competing remnant and programmatic, house) and only competes on price within or across specific tiers. The direction of the number is not standard: on Ad Manager lower wins, on Microsoft Monetize higher wins. Store the tier and the rank separately from any one vendor's numbering.
- **Guaranteed demand competes with a synthetic price.** Ad Manager's temporary CPM and Monetize's pCPM are the same idea from two vendors: a guaranteed line item is assigned, per request, a price that represents how much it needs this impression, and auction demand wins only by beating it. A line item behind schedule bids its way back on.
- **The ad server is also an auction.** Ad Manager runs Ad Exchange and Open Bidding partners in the same decision; Monetize sends managed and RTB bids into one auction; Kevel runs auctions inside a priority. The decision record is an `auctions` row whoever runs it.
- **Advertiser ad servers don't decide; they count.** Campaign Manager 360 and its peers serve the creative after someone else chose it, and their count is the one an agency's contract usually controls on.

## Publisher and Advertiser Ad Servers

The two kinds sit at opposite ends of the same impression and exist for different reasons.

**The publisher ad server** owns the inventory decision. The publisher traffics its direct-sold orders into it, connects its programmatic demand to it, and points every ad tag, SDK and video player at it. It decides which line item wins, and its log is the publisher's record of what it sold. Ad Manager traces back to DoubleClick, which Google bought in 2008 for $3.1 billion when its publisher ad server (DFP) had a 60% share of the publisher ad serving market and counted nine of the top ten US websites among its customers, according to the court in the US ad tech case; the court found Google had monopolized an "open-web display publisher ad server market", which is why the ad server's decision rules are now part of a remedies record ([The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases), in the Programmatic part, covers it).

**The advertiser ad server** owns the creative and the count. An agency uploads its creatives to it, creates placements matching each publisher's or DSP's buy, and gets back tags. When the publisher's ad server (or a DSP's winning bid) returns one of those tags, the browser calls the advertiser ad server, which serves the real creative (or redirects to it), counts the impression, wraps the click and logs both against the agency's placement. The advertiser gets one count across every publisher, in one place, under its own rules.

That is the source of the industry's oldest discrepancy. Each impression is counted twice: once by the publisher's ad server when it returns the tag, once by the advertiser's ad server when the tag calls it. Anything that happens between the two (a slow page, a user who scrolls away, a blocked request, a redirect chain) makes the numbers differ. The IAB/4A's Standard Terms and Conditions 3.0 settle whose count wins: the third-party ad server is the controlling measurement when it is IAB/AAAA-compliant and gives the publisher automated daily reporting, and a gap over 10% for the invoice period, with the controlling count lower, triggers reconciliation ([A Direct-Sold Insertion Order](/books/advertising/advertising-business#a-direct-sold-insertion-order)). [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) covers why the two counts drift and how to narrow them; [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies), in Contracts and Money, covers settling them.

Walled gardens and retailers run both roles inside one system: the platform decides and counts, and the advertiser's own ad server, where allowed, sees only a tracking pixel. A platform building its own ads business (a retailer, a marketplace, a streaming service, a social app) is building a publisher ad server whether it calls it that or not.

## The Request Flow

One request through a publisher ad server, in the order the work happens:

1. **The request arrives.** A page tag, an app SDK or a server (an SSAI stitcher, a server-side header bidding wrapper) sends the ad unit code, the requested sizes or formats, the page or app, the device and user agent, the IP (from which coarse geography is derived), any first-party identifier, custom key-values the page set (`section=sports`, `article=1234`), and the consent signals. A page that sends every slot in one call lets roadblocks and competitive exclusions hold across slots; one call per slot can't see what the others got.
2. **Context is resolved.** The server maps the ad unit code to the ad unit and its ancestors (so a line item targeting `/sports` matches `/sports/nfl/article`), looks up geography from the IP, parses the user agent into device and browser, reads the visitor's frequency counts if there is an identifier, and evaluates the consent state into what it may do: whether it may read or write the identifier, whether personalized demand may run, whether the request is child-directed.
3. **Candidates are matched.** Every active line item whose targeting matches the request becomes a candidate. Ad Manager describes this as creating "a list of all line items matching the targeting criteria" and enforces "a limit on the maximum number of contending line items to ensure system performance", 300 per request on its published limits page; when more match, it selects "based on their priority", and "at least one House line item is included" if one matches.
4. **Ineligible candidates are removed.** Frequency caps reached, day-parting outside its hours, competitive and advertiser exclusions with something already on the page, pacing that says the line item is ahead of schedule, creatives that don't fit any requested size.
5. **The winner is chosen.** Guaranteed line items in priority order, competing (under dynamic allocation) against remnant line items and programmatic demand: the ad server's own exchange, other exchanges through header bidding or server-side bidding, and price-priority line items standing in for them.
6. **A creative is chosen.** Among the winning line item's creatives, those fitting the slot, by the rotation rule.
7. **The response is returned and recorded.** Markup (or a VAST document, or native assets), impression and click tracking URLs, and a decision record with enough detail to explain the choice later.

The response is the beginning of the impression, not the impression: the creative still has to load and begin to render before the minimum standard counts it ([The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression)). An ad server that books a "served" count at step 7 and calls it delivery overstates every number it reports. Ad Manager itself moves display banners from count-on-download to begin-to-render on February 17, 2027, and warns publishers they "may notice a decrease in total display impressions" ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks)).

## Decisioning

The decision is a pipeline of filters followed by a ranking. Ad Manager's ad selection white paper lays it out in five stages (ad request, matching, best line item, best creative, serve), and Kevel's decision engine docs follow the same shape: filter the ads that match the request, rank them by Priority level, choose "a winner based on your Ad Selection Methods within each Priority", and let requests with no winner "fall through to the next priority". The vocabulary differs, the pipeline doesn't.

### Eligibility filters

The filters are cheap checks run before any pricing:

- **Targeting.** The line item's targeting expression against the request's attributes: inventory (ad units and placements), geography, device and browser, key-values, audience segments, content categories, day and time. Ad Manager requires every line item to "target at least one ad unit or placement", so inventory is always part of the expression. [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) covers the expression as data; at serving time it is compiled into an index so matching is a lookup, not a loop over every line item.
- **Flight and status.** Inside its start and end time, status delivering, budget or goal not exhausted.
- **Frequency caps.** The visitor's count for this line item (or its order, or a creative label) under every cap's window. Ad Manager allows "up to 10 frequency caps per line item", and a time-based cap with no identifier makes the line item "not eligible to serve". [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) owns the counters.
- **Exclusions.** Ad Manager removes "Exclusions (competitive restrictions and similar line items)" and applies "Advertiser exclusions (preventing two advertisers with competing businesses from showing up on the same page)". Both work through labels on line items and advertisers, checked against what else is on the page in the same request.
- **Pacing.** A line item ahead of schedule is skipped some fraction of the time; one behind is boosted. On Ad Manager this is the satisfaction index that line items must "exceed" a threshold on to be selected.
- **Creative fit.** At least one approved creative matching a requested size or format, and not already serving on the page if the rule forbids repeats.

The order matters for cost, not for correctness: run the cheap rejections first, and the expensive ones (an external bid, a model score) only on the survivors.

### Priority classes

After filtering, the survivors are tiered. Ad Manager's published values, lower winning:

| Line item type | Priority | Guaranteed | Goal |
| --- | --- | --- | --- |
| Sponsorship | 4 | Yes | A percentage of impressions, with start and end times |
| Standard | 6, 8 or 10 | Yes | An impression goal, with start and end times |
| Network | 12 | No | A percentage of impressions |
| Bulk | 12 | No | An impression goal that "functions more like an impression cap" |
| Price priority | 12 | No | None; optional daily or lifetime caps; fills "unsold inventory with the highest-paying line item available" |
| AdSense, Ad Exchange | 12 | No | None; the programmatic demand |
| House | 16 | Not applicable | None; serves only when nothing else is available, "treated as if they have a $0 rate" |

Preferred deals have "a fixed priority value", typically above private and open auctions, and guaranteed line items "can only be set to priorities 1-10 and non-guaranteed only between 12-16". Microsoft Monetize uses 1 to 20 with higher winning, defaults 5 for standard and 14 or 19 for guaranteed by delivery type, and adds a network-level **reselling priority**: when a managed line item "has a priority value at or above reselling priority and is eligible for an impression, then the impression is not available to RTB buyers". Kevel lets the publisher name and order its own priorities.

Three modeling consequences follow. Store a tier (`sponsorship`, `guaranteed`, `price_competing`, `house`) and a rank within it, and map vendor numbers at the edge. Keep the guaranteed/non-guaranteed flag separate from the number, because both vendors let some non-guaranteed demand sit above some guaranteed demand. And treat house as the floor of the pipeline: a request that ends with no paid winner and no house line item is unfilled, which is its own outcome in the record.

### Guaranteed demand against the auction

The naive rule ("guaranteed first, sell the rest") leaves money on the table: a guaranteed line item booked at a $10 CPM that is ahead of schedule takes an impression an exchange buyer would have paid $25 for. The modern rule, from both large vendors, is to let them compete:

- **Ad Manager (dynamic allocation).** "The guaranteed line item competes using a temporary CPM or 'opportunity cost' that Ad Manager calculates automatically", set to maximize revenue from the auction and remnant line items "without causing under-delivery of guaranteed line items". A line item behind schedule "wins often enough to stay on pace". If the temporary CPM is too high, Ad Manager "doesn't call Ad Exchange" at all. House line items don't compete on price, and remnant line items set to a CPA rate are "treated like House line items".
- **Microsoft Monetize (Open Dynamic Allocation).** The bidder prepares "at most one guaranteed bid and up to 14 non-guaranteed bids". Among guaranteed line items of the same priority, the one "furthest from goal is much more likely to serve" through a weighted rotation. The chosen guaranteed bid carries a pCPM that "represents the risk that the line item will not deliver in full": the more at risk, the higher. pCPM ranks the bid, but a winning guaranteed line item "still pays the booked line item price, not the pCPM value", and a winning RTB bid ranked above a guaranteed bid "should price reduce to the pCPM value" of it.

The two descriptions agree on the mechanism: the opportunity cost is a pacing output, recomputed as delivery runs, and it is a ranking price, never a billing price. The guaranteed line item bills at its booked rate on the insertion order; the auction winner bills at its clearing price. My rule: record both on the decision (`opportunity_cost_cpm_micros` and the winner's price) so a publisher can see, per impression, what a guarantee cost it in foregone auction revenue, and a buyer disputing a clearing price can see what it was priced against.

The opportunity cost is also why guaranteed delivery and auction yield are one optimization, not two. [Forecasting & Avails](/books/advertising/forecasting-and-avails) covers how the booked guarantees were sized against expected supply; [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) covers the controller that turns "behind or ahead of plan" into a price.

### Creative selection

Once a line item wins, the ad server picks one of its creatives. Ad Manager's rotation options are representative: evenly; optimized ("the creative with the highest historical click-through rate"); weighted ("at random, but according to the relative weights specified for each (such as 70/30)"); and sequential, numbered 1 to 80, where "serving sequence wraps around from the last creative to the first". A **roadblock** serves two or more creatives from one line item together on the page (Ad Manager 360 only), which needs every slot in the same request. The rotation rule lives on the line item and the weights on `line_item_creatives`; sequential rotation needs per-visitor state, so it degrades to even rotation without an identifier.

## Mediating Demand

A publisher's inventory is wanted by more buyers than its own direct sales team and its ad server's own exchange. Over the last decade every publisher ad server has had to admit other exchanges into its decision, and how it does that is the most argued-about engineering in the business.

**The waterfall.** Remnant line items, each standing in for an ad network or exchange at an expected price, are tried in order; if the first doesn't fill, the request falls to the next. It is simple and leaves money behind: the order is set by historical averages, so a network that would have paid more for this impression is never asked. In-app mediation still uses waterfalls for networks that can't bid, calling ad sources "one-by-one based on the average eCPM you set" in AdMob's description ([In-App Advertising & Mediation](/books/advertising/in-app-advertising), in Channels, covers it).

**Header bidding into the ad server.** A wrapper on the page (Prebid.js) or a server (Prebid Server, Amazon's TAM) asks several exchanges at once before the ad server call and passes the winning bids in as key-values. The ad server then needs a price-priority line item for every price bucket so the header bid can compete at its value: Prebid's predefined "medium" granularity is $0.10 steps up to $20.00, 201 line items per bidder, and "dense" totals 425. That is why header bidding setups create thousands of line items and why the ad server's limits (450 line items per order, 600,000 total on Ad Manager) matter. Prebid also notes that with a complete bidding library "no price-bucket line items are needed". [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid), in Programmatic, covers the wrapper; the ad server side is the price-bucket line items and the key-value targeting that matches them.

**Server-side bidding inside the ad server.** Ad Manager's Open Bidding "allows you to invite third-party SSPs (supply-side platforms) to compete for your inventory" and "calls all yield partners at once so they can compete in real time during the dynamic allocation process", while mediation "uses a list of yield partners called individually, in sequence, from your mobile app after dynamic allocation". Partners are grouped in **yield groups** per inventory and format. The court in the US ad tech case found Open Bidding was not a substitute for header bidding because of its 5% fee, its ban on rivals' own DSP bids and its bid-data sharing; [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases) covers the ruling.

**Floors across all of it.** Pricing rules set floors for "non-guaranteed demand" (Ad Manager allows up to 200 per network), and apply to the bid net of the exchange's share: a $1.00 bid on an 80/20 revenue share is worth $0.80 against the floor ([An Open-Auction Programmatic Impression](/books/advertising/advertising-business#an-open-auction-programmatic-impression)). [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization) covers setting them.

The data-model point is that every source competing in the decision, whatever its integration (a direct line item, a price-bucket line item standing in for a header bid, a server-side yield partner, the house exchange), is a **bid** in the decision's `auctions` row, with its source and its net price. Without that, the publisher can't answer the question every yield review asks: which source won, at what price, and what did the second-best source offer?

## Building One

A publisher ad server has two paths. The **request path** answers ads in milliseconds from memory. The **control path** (trafficking, approvals, pacing computation, forecasting, reporting) runs on databases and batch jobs and publishes snapshots the request path loads. Nothing on the request path should touch the transactional database.

**The serving snapshot.** Every active line item, its compiled targeting, its creatives with weights, its caps, its labels and its current pacing state, built by the control path and pushed to every serving node as an immutable versioned snapshot. Changes (a line item paused, a creative approved) publish a delta and a new version; nodes swap atomically. A pause that takes minutes to reach the edge is normal; Ad Manager notes pacing changes can take "up to 48 hours" to show in traffic. A pause that must be immediate (a creative found to be malicious) needs a separate kill list checked on every request ([Application Caching](/docs/architecture/application-caching#invalidation)).

**The targeting index.** Evaluating every line item's expression for every request doesn't scale past a few thousand line items. The standard answer is an inverted index over expressions in disjunctive or conjunctive normal form: the Yahoo Research and Stanford paper "Indexing Boolean Expressions" (VLDB 2009) states the problem directly, a Boolean expression representing "an advertiser's user targeting requirements" and an assignment of values representing "the characteristics of a user visiting an online page", and indexes them with inverted lists so that only expressions that can match are evaluated, with top-N retrieval when only the best few are wanted. Ad Manager's own custom targeting tree is DNF by construction: the top level "can only contain" an OR of its children, the second level an AND, the leaves single criteria.

**Per-request state.** The visitor's frequency counts (read before deciding, incremented after the impression counts, not after the response) and the page's request-scoped state (what's already on the page, for exclusions and roadblocks) are the only per-request data. Frequency counts live in a low-latency key-value store keyed by the identifier the consent state allows.

**The decision function.** A sketch of the core loop, after targeting has produced the candidates and the exchange or header bids are in hand:

```go tab="Go"
type Candidate struct {
	LineItemID       string
	Tier             Tier  // Sponsorship < Guaranteed < PriceCompeting < House
	Rank             int16 // within the tier, lower wins
	Guaranteed       bool
	BookedCPMMicros  int64 // what it bills
	OpportunityMicros int64 // from pacing; 0 for non-guaranteed
	NetBidMicros     int64 // price-competing: net bid after the exchange's share
	Labels           []string
}

type Decision struct {
	Winner         *Candidate
	RankingMicros  int64 // the price it ranked on
	SecondMicros   int64 // the best price it beat
	Outcome        string // "guaranteed", "auction", "house", "unfilled"
}

// Decide assumes candidates are already filtered for targeting, caps,
// exclusions, pacing eligibility and creative fit.
func Decide(cands []Candidate, floorMicros int64) Decision {
	var bestG, bestA, bestH *Candidate
	for i := range cands {
		c := &cands[i]
		switch {
		case c.Tier == Sponsorship:
			return Decision{Winner: c, RankingMicros: c.BookedCPMMicros, Outcome: "guaranteed"}
		case c.Guaranteed:
			if bestG == nil || c.Rank < bestG.Rank ||
				(c.Rank == bestG.Rank && c.OpportunityMicros > bestG.OpportunityMicros) {
				bestG = c
			}
		case c.Tier == House:
			if bestH == nil || c.Rank < bestH.Rank {
				bestH = c
			}
		case c.NetBidMicros >= floorMicros:
			if bestA == nil || c.NetBidMicros > bestA.NetBidMicros {
				bestA = c
			}
		}
	}
	switch {
	case bestG != nil && (bestA == nil || bestG.OpportunityMicros >= bestA.NetBidMicros):
		second := int64(0)
		if bestA != nil {
			second = bestA.NetBidMicros
		}
		return Decision{Winner: bestG, RankingMicros: bestG.OpportunityMicros,
			SecondMicros: second, Outcome: "guaranteed"}
	case bestA != nil:
		second := int64(0)
		if bestG != nil {
			second = bestG.OpportunityMicros
		}
		return Decision{Winner: bestA, RankingMicros: bestA.NetBidMicros,
			SecondMicros: second, Outcome: "auction"}
	case bestH != nil:
		return Decision{Winner: bestH, Outcome: "house"}
	}
	return Decision{Outcome: "unfilled"}
}
```

```rust tab="Rust"
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Tier { Sponsorship, Guaranteed, PriceCompeting, House }

pub struct Candidate {
    pub line_item_id: String,
    pub tier: Tier,
    pub rank: i16,                 // within the tier, lower wins
    pub guaranteed: bool,
    pub booked_cpm_micros: i64,    // what it bills
    pub opportunity_micros: i64,   // from pacing; 0 for non-guaranteed
    pub net_bid_micros: i64,       // net bid after the exchange's share
}

pub enum Outcome { Guaranteed, Auction, House, Unfilled }

pub struct Decision<'a> {
    pub winner: Option<&'a Candidate>,
    pub ranking_micros: i64,
    pub second_micros: i64,
    pub outcome: Outcome,
}

pub fn decide(cands: &[Candidate], floor_micros: i64) -> Decision<'_> {
    if let Some(s) = cands.iter().find(|c| c.tier == Tier::Sponsorship) {
        return Decision { winner: Some(s), ranking_micros: s.booked_cpm_micros,
                          second_micros: 0, outcome: Outcome::Guaranteed };
    }
    let best_g = cands.iter().filter(|c| c.guaranteed)
        .min_by(|a, b| a.rank.cmp(&b.rank)
            .then(b.opportunity_micros.cmp(&a.opportunity_micros)));
    let best_a = cands.iter()
        .filter(|c| c.tier == Tier::PriceCompeting && c.net_bid_micros >= floor_micros)
        .max_by_key(|c| c.net_bid_micros);
    let best_h = cands.iter().filter(|c| c.tier == Tier::House).min_by_key(|c| c.rank);

    match (best_g, best_a) {
        (Some(g), a) if a.map_or(true, |a| g.opportunity_micros >= a.net_bid_micros) =>
            Decision { winner: Some(g), ranking_micros: g.opportunity_micros,
                       second_micros: a.map_or(0, |a| a.net_bid_micros),
                       outcome: Outcome::Guaranteed },
        (g, Some(a)) =>
            Decision { winner: Some(a), ranking_micros: a.net_bid_micros,
                       second_micros: g.map_or(0, |g| g.opportunity_micros),
                       outcome: Outcome::Auction },
        _ => match best_h {
            Some(h) => Decision { winner: Some(h), ranking_micros: 0, second_micros: 0,
                                  outcome: Outcome::House },
            None => Decision { winner: None, ranking_micros: 0, second_micros: 0,
                               outcome: Outcome::Unfilled },
        },
    }
}
```

The sketch leaves out what a real one has: several guaranteed tiers above the auction (Monetize's reselling priority, Ad Manager's priorities 1 to 10), roadblocks that must win every slot or none, the auction's clearing rule (first price, or a reduction to the second price as Monetize describes), and creative selection. It keeps the two properties that matter: a guaranteed line item ranks on its opportunity cost and bills at its booked rate, and the decision returns the price it beat.

**Latency.** The ad server's own decision is the cheap part; waiting for bids is the expensive part. Set an explicit budget per stage (context resolution, matching, filters, bids, ranking, response) and degrade by dropping the slowest optional stage, never by timing out the whole request: a publisher prefers a house ad or a guaranteed line item to an empty slot ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)). [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale), in Running the Platform, covers the bidder side.

**Explainability.** Every decision should be reconstructable: which line items matched, which were filtered and why, what each competitor's price was, which won. Keeping that for every request is expensive, so the usual compromise is to keep the winner and runner-up for every decision, and the full candidate list for a sample and for any request a debugging flag marks ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

## How to Build It

These are deltas against [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The core `line_items.priority` is a single number "lower serves first, as ad servers rank"; this chapter adds the tier, the rotation rule and the labels that exclusions read, the yield groups that bring outside demand into the decision, and the decision record. Targeting expressions, budgets and goals are [Campaigns & Line Items](/books/advertising/campaigns-and-line-items)'; pacing state and frequency counters are [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency)'s.

```sql
-- How a line item competes, beyond the single priority number.
ALTER TABLE line_items
  ADD COLUMN priority_tier TEXT,           -- the class, independent of vendor numbering
  ADD COLUMN creative_rotation TEXT NOT NULL DEFAULT 'even',
  ADD COLUMN value_cpm_micros BIGINT,      -- the value a non-CPM line item competes at
  ADD COLUMN external_priority SMALLINT;   -- the source ad server's number, as imported

ALTER TABLE line_items ADD CONSTRAINT line_items_priority_tier_check
  CHECK (priority_tier IN ('sponsorship', 'guaranteed', 'price_competing', 'house'))
  NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_creative_rotation_check
  CHECK (creative_rotation IN ('even', 'optimized', 'weighted', 'sequential')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_tier_matches_type_check
  CHECK (priority_tier IS NULL
         OR (delivery_type = 'guaranteed') = (priority_tier IN ('sponsorship', 'guaranteed'))
         OR priority_tier = 'house') NOT VALID;

ALTER TABLE line_item_creatives ADD COLUMN sequence SMALLINT;  -- sequential rotation
ALTER TABLE line_item_creatives ADD CONSTRAINT line_item_creatives_sequence_check
  CHECK (sequence BETWEEN 1 AND 80) NOT VALID;

-- Labels for competitive and advertiser exclusions, and creative-label caps.
CREATE TABLE exclusion_labels (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_id  UUID NOT NULL REFERENCES organizations (id),
  name          TEXT NOT NULL,              -- e.g. 'auto', 'airline', 'competitor-of-acme'
  kind          TEXT NOT NULL CHECK (kind IN ('competitive', 'advertiser', 'creative_cap')),
  UNIQUE (publisher_id, name)
);

CREATE TABLE line_item_labels (
  line_item_id  UUID NOT NULL REFERENCES line_items (id),
  label_id      UUID NOT NULL REFERENCES exclusion_labels (id),
  PRIMARY KEY (line_item_id, label_id)
);

-- Outside demand admitted into the decision: header bidding, server-side partners, mediation.
CREATE TABLE yield_groups (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_id    UUID NOT NULL REFERENCES organizations (id),
  name            TEXT NOT NULL,
  format          TEXT NOT NULL CHECK (format IN ('display', 'native', 'video', 'audio',
                    'rewarded', 'interstitial')),
  integration     TEXT NOT NULL CHECK (integration IN ('server_bidding', 'client_header',
                    'server_header', 'mediation_waterfall')),
  ad_unit_ids     UUID[] NOT NULL,          -- inventory it applies to, with descendants
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE (publisher_id, name)
);

CREATE TABLE yield_group_partners (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  yield_group_id     UUID NOT NULL REFERENCES yield_groups (id),
  partner_org_id     UUID NOT NULL REFERENCES organizations (id),  -- the SSP or network
  seller_account_id  UUID REFERENCES seller_accounts (id),         -- the publisher's ID there
  waterfall_position SMALLINT,              -- mediation only; null when partners bid
  manual_cpm_micros  BIGINT,                -- a waterfall partner's expected price
  revenue_share_bp   INT CHECK (revenue_share_bp BETWEEN 0 AND 10000),  -- partner's share, to net bids
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused')),
  UNIQUE (yield_group_id, partner_org_id),
  CHECK ((waterfall_position IS NULL) = (manual_cpm_micros IS NULL))
);

-- One decision per ad request and slot: what won, what it beat, and why.
CREATE TABLE ad_decisions (
  id                          UUID NOT NULL DEFAULT uuidv7(),
  decided_at                  TIMESTAMPTZ NOT NULL,
  ad_request_id               UUID NOT NULL,   -- joined by (time, id), as auctions are
  ad_unit_id                  UUID NOT NULL,
  auction_id                  UUID,            -- the auctions row when demand competed on price
  snapshot_version            BIGINT NOT NULL, -- the serving snapshot that decided
  candidates_matched          INT NOT NULL,
  candidates_eligible         INT NOT NULL,
  outcome                     TEXT NOT NULL CHECK (outcome IN ('guaranteed', 'auction',
                                'house', 'unfilled', 'blocked')),
  winning_line_item_id        UUID,
  winning_creative_id         UUID,
  winning_source              TEXT CHECK (winning_source IN ('line_item', 'own_exchange',
                                'header_bid', 'yield_partner', 'deal')),
  ranking_price_cpm_micros    BIGINT,          -- the price it ranked on
  opportunity_cost_cpm_micros BIGINT,          -- the best guaranteed line item's, if any
  best_auction_cpm_micros     BIGINT,          -- the best net auction price, if any
  filter_counts               JSONB NOT NULL DEFAULT '{}',  -- e.g. {"frequency_cap": 3, "pacing": 7}
  candidates                  JSONB,           -- full list, sampled or debug-flagged requests only
  PRIMARY KEY (decided_at, id)
) PARTITION BY RANGE (decided_at);

ALTER TABLE auctions ADD COLUMN ad_decision_id UUID;  -- the decision this auction fed
```

Design notes:

- **Tier and rank, not one vendor's number.** `priority_tier` is the class every ad server has; `priority` stays the rank within it, with the core's "lower serves first" direction; `external_priority` keeps the number as the source system had it (Ad Manager's 4 to 16, Monetize's 1 to 20 with higher winning) for imports and audits. Mapping between directions is done once, at import.
- **The tier check allows non-guaranteed demand in house but not in the guaranteed tiers.** Some ad servers let a publisher put a standard line item above a guaranteed one (Monetize's flexible priorities); that is a rank inside `price_competing` above a guaranteed rank, which this model expresses through ranking prices, not by letting a non-guaranteed line item claim a guarantee it doesn't have.
- **Value CPM for line items that don't bill per impression.** A CPC or flat-fee line item competing on price needs an impression-equivalent price; `value_cpm_micros` is what it ranks at. Ad Manager treats remnant line items "with a zero rate and no Value CPM" as house, which is the rule this column makes explicit.
- **Yield partners are seller accounts.** A server-side partner or a header bidder buys through the publisher's account at that SSP, so `yield_group_partners.seller_account_id` points at the same row ads.txt and sellers.json describe ([ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain), in Programmatic, owns those files). The partner's revenue share converts its gross bid into the net price the decision and the floors compare.
- **The decision is its own record, separate from the auction.** Not every decision runs an auction (a sponsorship takes the slot, a request is unfilled), and an auction can feed a decision that a guaranteed line item still wins. `ad_decisions` exists for every request and slot; `auctions` exists when demand competed on price, linked both ways.
- **Keep what it beat.** `ranking_price_cpm_micros`, `opportunity_cost_cpm_micros` and `best_auction_cpm_micros` are three numbers per decision that answer the yield question (what did guarantees cost in auction revenue) and the auction transparency question (what was the winner priced against). The MRC's auction transparency standards require disclosing how a bid converts to a clearing price; the decision record is where that conversion can be shown per impression.
- **Full candidate lists are sampled.** `filter_counts` is cheap and kept for every decision; `candidates` (each matched line item with the filter that removed it or the price it ranked at) is kept for a sample and for flagged requests. A trafficker asking "why didn't my line item serve on this page?" is answered from the sample and from forecasting's simulation, not from a full log of every request.
- **Partitioned like the other logs.** `ad_decisions` is range-partitioned by hour like `ad_requests` and `auctions`, lives in the log store at scale, and is kept for the dispute window ([Data Retention](/docs/building-blocks/data-retention)).
- **The snapshot version is evidence.** A decision records which serving snapshot made it, so a disputed delivery can be replayed against exactly the line items, targeting and pacing state that were live, and so a change that took minutes to propagate is visible as such.

## Auditing

The ad server's records are the publisher's side of every delivery argument:

- **What was live, when.** Every line item's tier, priority, rotation, labels, targeting and flight as of each serving snapshot, with the version each decision used. A make-good negotiation over an under-delivered guarantee starts with whether the line item was eligible for the inventory the publisher sold it.
- **Why each impression went where it did.** The decision's outcome, winner, source and the prices it ranked against, for every impression; the full candidate list for a sample. Buyers asking whether their deal or header bid was outranked by a guarantee, and regulators asking whether an exchange was favored, are answered from these.
- **Which outside partners competed, on which terms.** Yield groups and partners with their seller accounts, revenue shares and waterfall positions as dated configuration, since the net price a partner competed at depends on them.
- **Exclusions and caps applied.** Which labels removed which candidates, so an advertiser's competitive separation promise can be shown kept.

Changes to this configuration are audited like any business rule ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Split the request path from the control path,** and have the request path serve from versioned in-memory snapshots, never the transactional database.
- **Model priority as a tier plus a rank,** keep the vendor's own number for imports, and never assume lower or higher wins.
- **Let guaranteed demand compete with an opportunity cost from pacing,** rank on it, and bill the booked rate.
- **Treat every competing source as a bid in one auction record,** with its integration, seller account and net price, whatever path it came in on.
- **Compile targeting into an index** in normal form instead of evaluating every line item per request.
- **Record a decision for every request,** with the winner, what it beat and the snapshot version, and sample the full candidate list.
- **Count the impression later, not at the response,** and keep the decision and the impression as separate records.
- **Budget latency per stage** and degrade to guaranteed or house demand rather than an empty slot.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), the definition of a Third Party Ad Server and controlling measurement
- [MRC: Digital Advertising Auction Transparency Standards](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), disclosing how a bid converts to a clearing price

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), the DoubleClick acquisition and DFP's share, the publisher ad server market, Open Bidding's fee and terms

**Reference**

- [Whang et al.: Indexing Boolean Expressions (VLDB 2009)](https://www.vldb.org/pvldb/vol2/vldb09-83.pdf), targeting as DNF and CNF expressions indexed with inverted lists, top-N matching

**In practice**

- [Google Ad Manager: Line item types and priorities](https://support.google.com/admanager/answer/177279?hl=en), priority values, goals by type, house and preferred deals
- [Google Ad Manager: Dynamic allocation](https://support.google.com/admanager/answer/3721872?hl=en), temporary CPM, when Ad Exchange is not called, house and CPA remnant line items, priority ranges
- [Google Ad Manager: Ad selection white paper](https://support.google.com/admanager/answer/1143651?hl=en), the five stages, contending line item limit, exclusions, roadblocks and creative rotation
- [Google Ad Manager: System maximums and limits](https://support.google.com/admanager/answer/1628457?hl=en), contending line items per request, line items per order, creatives per line item, key-value limits
- [Google Ad Manager: Pacing](https://support.google.com/admanager/answer/2669484?hl=en), the satisfaction index threshold and changes taking up to 48 hours
- [Google Ad Manager: Frequency capping](https://support.google.com/admanager/answer/82242?hl=en), up to 10 caps and the identifier requirement
- [Google Ad Manager: Open Bidding](https://support.google.com/admanager/answer/7128453?hl=en), yield partners in one auction during dynamic allocation, and mediation in sequence
- [Google Ad Manager: Display moves to begin-to-render counting](https://support.google.com/admanager/answer/16896667), the February 17, 2027 change and the expected drop in display totals
- [Google Ad Manager: Pricing rules and the revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors against the net bid
- [Google Ad Manager API: Targeting](https://developers.google.com/ad-manager/api/reference/v202508/LineItemService.Targeting), the OR-of-ANDs custom targeting tree and required inventory targeting
- [Google Campaign Manager 360: Overview](https://support.google.com/campaignmanager/answer/2709362?hl=en), an ad management system for advertisers and agencies
- [Microsoft Monetize: Open Dynamic Allocation and flexible priorities](https://learn.microsoft.com/en-us/xandr/monetize/open-dynamic-allocation-and-flexible-priorities), priorities 1 to 20, defaults, reselling priority
- [Microsoft Monetize: Guaranteed delivery auction mechanics](https://learn.microsoft.com/en-us/xandr/monetize/guaranteed-delivery-auction-mechanics), one guaranteed bid and up to 14 others, pCPM, paying the booked price, roadblocks
- [Kevel: Ad Decision Engine overview](https://dev.kevel.com/docs/delivery-basics), filters, priorities, lottery and auction selection, fallthrough, request volume
- [Kevel API: Advertisers](https://dev.kevel.com/reference/advertisers), advertisers as the companies paying for ads, with campaigns under them
- [Revive Adserver on GitHub](https://github.com/revive-adserver/revive-adserver), open source under GPL-2.0
- [FreeWheel](https://www.freewheel.com/), Streaming Hub combining its SSP and ad server
- [Mediaocean: Completion of the Innovid acquisition (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1835378/000114036125004373/ef20043552_ex99-1.htm), the February 13, 2025 closing and Flashtalking as an ad server
- [Prebid: Before you start (ad ops)](https://docs.prebid.org/adops/before-you-start.html), 12 as the default priority, no price buckets with a complete bidding library
- [Prebid: Price granularity](https://docs.prebid.org/adops/price-granularity.html), bucket increments, caps and line items per bidder
- [Google AdMob: Mediation](https://support.google.com/admob/answer/3063564), the waterfall by average eCPM
