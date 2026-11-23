+++
title = "Auction Mechanics"
description = "Second-price, first-price, GSP and VCG auctions, quality-weighted ranking, hard and soft reserves, waterfalls and the MRC auction transparency standards."
category = "Advertising Industry"
order = 2922
part = "Auctions and Pricing"
tags = ["advertising", "ad-tech", "auctions", "pricing", "data-model"]
+++

An ad auction decides two things for one impression opportunity: who gets it (allocation) and what they pay (pricing). The MRC's Digital Advertising Auction Transparency Standards, final in January 2026, put it that way, and note that the whole process "typically occurs in less than 0.1 seconds." Every model in this volume runs one: an exchange auctions an impression among DSPs, a publisher ad server ranks line items against header bids, a search engine ranks keyword ads, a social feed ranks ads by predicted value, a retailer ranks sponsored products among organic results. The rules differ, and the rules decide how a buyer should bid.

Auction rules are hard to get right for a reason that has nothing to do with code: the buyer's best bid depends on the rules, and the buyer usually can't see them. A bid that is optimal in a second-price auction gives away all the surplus in a first-price one; a price "set by the auction" may be set by a reserve the buyer never saw; a lower bid can win because the platform multiplies bids by a quality score the buyer only half observes. The MRC's standards say so directly: "if advertisers believe they are bidding into one sort of auction, but are in fact bidding into another sort altogether, the auction stops working well." And most of the money now runs in the auctions with the least outside visibility: in the MRC's words, "the vast majority of auction-based media spend is now bought and sold through 'closed-loop' auctions" in search, social and retail.

This chapter covers second-price and first-price auctions and the industry's move from one to the other, the generalized second-price auction (GSP) that search was built on, VCG, quality-weighted ranking, reserve prices (hard, soft and dynamic), waterfalls and unified auctions, and the MRC standards, then the records that make any auction explainable. It extends `auctions` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and `auction_rule_versions` and the bid adjustments that The Google Ad Tech Cases (in Programmatic) adds. How a DSP shades its bid in a first-price auction is Demand-Side Platforms; what a bid strategy optimizes is [Automated Bidding](/books/advertising/automated-bidding); setting floors is [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization); what each pricing unit bills is [Pricing Models](/books/advertising/pricing-models); Google's Ad Rank and Meta's delivery system in their own context are [Search Advertising](/books/advertising/search-advertising) and [Social Advertising](/books/advertising/social-advertising). The OpenRTB fields are covered in OpenRTB, and the three auction stages of a header-bidding impression in Header Bidding & Prebid.

## How the Platforms Do It

As of November 2026, from each operator's public documentation and filings:

| Auction | Allocation | Pricing | Reserve | What's public |
| --- | --- | --- | --- | --- |
| **Amazon Ads, Sponsored Products** | Ranks on relevance and bid; Amazon says ranking "has increasingly given greater weight to relevancy over bid amount" | "A form of generalized 'second-price' auction" since 2006, by Amazon's account | A "hard reserve" to enter and a "soft reserve" the winner may pay; the FTC and 22 states allege the soft reserve was hidden (August 2026 complaint) | Amazon's response to the complaint; the complaint |
| **Apple Ads** | App Store placements; the ranking method isn't described on the page opened | Cost per tap, "up to a maximum price you choose"; cost per install on Basic | Not described on the pages opened | Pricing model only |
| **Google Ad Manager** | Unified auction among Ad Exchange, Open Bidding, header bidding line items and remnant line items, with guaranteed line items competing under dynamic allocation | First price, announced September 5, 2019 | Pricing rules, compared to the bid net of Google's revenue share | Help center; the court record in the ad tech case |
| **Google Ads, Search** | Ad Rank: bid, auction-time quality, thresholds, competitiveness, context, asset impact | Winner pays "what's minimally required to clear the Ad Rank thresholds" and beat the ad below, rounded up to $0.01 in the US | Ad Rank thresholds, and a reserve price when no ad is below | Help center |
| **LinkedIn** | Ads with "similar ad formats and target audiences" compete | "Determined by an online auction system"; the pricing rule isn't stated | Not stated | Bid strategies and chargeable events |
| **Meta** | Highest "total value": bid times estimated action rate, plus an ad quality score | Not stated on the pages opened | Not stated | A 2020 explainer and the auction overview page |
| **OpenRTB exchanges** | Highest qualifying bid, with deals ranked by their terms | `at = 1` first price, `at = 2` "Second Price Plus", 500 and above exchange-specific; a deal with `at = 3` clears at its agreed price | `bidfloor`, a CPM, USD by default | The protocol; each exchange's own disclosures |

Three patterns run through the table:

- **First price won the open web; modified second price kept the gardens.** Exchanges and publisher ad servers moved to first price, and Google's unified move in September 2019 brought the largest publisher ad server with them. Search, social and retail auctions still describe themselves as second-price variants, and the MRC's glossary names the category: a "modified second-price auction", where the winner "pays an amount determined by a formula, which may include multiple factors; custom to each auctioneer, commonly found in search and social auctions."
- **Ranking is rarely by price alone in the gardens.** Google multiplies in auction-time quality, Meta adds estimated action rates and ad quality, Amazon weighs relevance. A bid buys a chance, not a position.
- **Reserves are where the disputes are.** The rules for allocation are usually published in outline; the reserve that sets the price is the part buyers can't see, and the court cases and complaints of the last two years are mostly about reserves and who saw what first.

## Second Price and First Price

In a **sealed-bid second-price auction** (the Vickrey auction) the highest bidder wins and pays the second-highest bid. The property that made it the default for a decade: bidding your true value is a dominant strategy. Raising a bid above value risks paying more than the impression is worth; lowering it below value only loses auctions you'd have been glad to win at the second price. The bidder doesn't need to model its rivals at all. The MRC's glossary has the industry's version: "the auction winner pays the second-highest bid (or a penny more)." OpenRTB's `at = 2` is that auction with an increment, named "Second Price Plus".

In a **sealed-bid first-price auction** the winner pays its own bid. Truthful bidding is now the worst strategy that still wins: it gives the seller all the surplus. The rational bidder shades its bid below its value, to the point that maximizes value minus price times the chance of winning, and the chance of winning depends on what rivals bid. Demand-Side Platforms works the arithmetic and the shading code; the mechanism point is that first price moves the modeling burden from the seller to every buyer.

A worked comparison, with example values for one impression at three DSPs (CPM):

| Bidder | Value | Second-price bid (truthful) | First-price bid (shaded) |
| --- | --- | --- | --- |
| A | $10.00 | $10.00 | $6.00 |
| B | $7.00 | $7.00 | $5.20 |
| C | $4.00 | $4.00 | $3.30 |

In the second-price auction A wins and pays B's $7.00 (plus the increment). In the first-price auction A wins and pays its own $6.00, below the second-price outcome. Had A shaded less well (bid $7.50), the seller would have done better than under second price. In theory the two formats yield the same expected revenue under symmetric, independent values (revenue equivalence); in practice the outcome depends on how well each buyer models the others, which is why the move changed so much plumbing.

**Why the open web moved.** The second-price exchange had two problems that header bidding made worse. First, a "second price" is only meaningful inside one auction: when a publisher runs several exchanges in parallel and an ad server compares their winners, each exchange's winner arrives at its own second price, so the impression goes to whichever exchange's second-highest bid was highest, not to the highest bidder. Second, the seller can inflate a second price by inserting a reserve just below the winning bid (a per-buyer or post-hoc reserve), which the buyer can't distinguish from competition. First price makes the number the bidder sent the number it pays, so the comparison across exchanges and the ad server is like with like. Google announced "unified first price auctions for Google Ad Manager" on September 5, 2019, citing testing with a "neutral to positive impact" on publisher revenue, and added two transparency tools with it: a Bid Data Transfer file for publishers with data on all bids, and, for Authorized Buyers and Open Bidders, the minimum bid needed to win, reported after each auction (OpenRTB's `${AUCTION_MIN_TO_WIN}` macro carries the same number).

**What first price costs the buyer.** Every DSP must now estimate a win curve per supply context and shade against it, which needs its losses and the minimum-to-win data. A buyer that bids the same everywhere overpays in thin auctions. And the MRC notes the reverse risk: "a bid strategy that is ideal for a first-price auction is suboptimal for a second-price auction", so a buyer shading into an auction that is actually second price (or second price with a soft reserve that behaves like first) loses impressions it should win. The auction type is a field on every OpenRTB request for that reason, and the deal can override it.

## The Generalized Second-Price Auction

Search sells several slots per query, in order, and slot one gets more clicks than slot two. The auction that sold them from the early 2000s is the **generalized second-price auction**: rank the ads by bid (or by bid times a quality factor), give the top slot to the top ad, and charge each ad, per click, the smallest bid that would have kept it in its position, which is the bid of the ad below it. Edelman, Ostrovsky and Schwarz named and analyzed it in 2007 ("Internet Advertising and the Generalized Second-Price Auction: Selling Billions of Dollars Worth of Keywords") and showed the property that matters for builders: GSP looks like a generalization of the Vickrey auction but **truthful bidding is not an equilibrium**. With several slots, a bidder can often gain by bidding less and dropping a slot, paying a lower price for fewer but cheaper clicks. They also showed that a natural equilibrium of the generalized English auction gives the same payoffs as VCG, below.

With quality, the ranking is by **effective bid**, the per-click bid times the quality factor, and the price per click for the ad in slot k is the effective bid of the ad in slot k+1 divided by the slot-k ad's own quality, so a high-quality ad pays less per click for the same position. A worked example (bids per click, example figures; quality is relative predicted click-through, 1.0 neutral), two slots:

| Advertiser | Max CPC bid | Quality | Effective bid | Rank | GSP price per click |
| --- | --- | --- | --- | --- | --- |
| B | $3.00 | 1.0 | 3.00 | Slot 1 | A's 2.00 / B's 1.0 = $2.00 |
| A | $4.00 | 0.5 | 2.00 | Slot 2 | C's 1.00 / A's 0.5 = $2.00 |
| C | $1.00 | 1.0 | 1.00 | No slot | |

A bid the most and finished second, which is what Google means by "even if your competition has higher bids than yours, you can still win a higher position at a lower price." Google's own description of the price is the same rule with thresholds added: you "only pay what's minimally required to clear the Ad Rank thresholds" and the Ad Rank of the ad below, "the reserve price" if no ad is below, "rounded up to the nearest billable unit, which in the U.S. is $0.01." Its help center works an example with Ad Ranks of 80, 50, 30, 10 and 5, a threshold of 40 above the results and 8 below: the 80 pays just enough to beat 50, the 50 just enough to beat the threshold of 40, the 30 just enough to beat 10, the 10 just enough to beat 8, and the 5 doesn't show. The thresholds act as per-position reserves, which is why a top slot can cost more than the ad below it implies. Search Advertising covers Ad Rank's factors and why Quality Score, the number advertisers see, is not one of them.

The pricing step in code, with prices and bids in micros of the bid unit and quality in parts per million:

```go tab="Go"
package auction

import "sort"

// Candidate is one ad in a quality-weighted auction: a per-unit bid (per click, say)
// in micros and the platform's quality factor in parts per million (1,000,000 = neutral).
type Candidate struct {
	ID         string
	BidMicros  int64
	QualityPPM int64
}

// Award is one slot, the ad that won it and its per-unit price.
type Award struct {
	ID          string
	Slot        int   // 0 = top
	PriceMicros int64 // what the winner pays per unit if the unit (a click) happens
}

func effective(c Candidate) int64 { return c.BidMicros * c.QualityPPM / 1_000_000 }

// ceilDiv rounds a positive quotient up, as "minimally required" prices round up.
func ceilDiv(a, b int64) int64 { return (a + b - 1) / b }

// GSP ranks candidates by effective bid, drops those below the effective reserve,
// fills up to slots positions and prices each winner at the smallest bid that keeps
// its effective bid at or above the next one's (or the reserve), rounded up to
// tickMicros (10,000 = one cent) and never above its own bid.
func GSP(cands []Candidate, slots int, reserveEffMicros, tickMicros int64) []Award {
	eligible := make([]Candidate, 0, len(cands))
	for _, c := range cands {
		if c.QualityPPM > 0 && effective(c) >= reserveEffMicros {
			eligible = append(eligible, c)
		}
	}
	sort.SliceStable(eligible, func(i, j int) bool { return effective(eligible[i]) > effective(eligible[j]) })

	awards := []Award{}
	for i := 0; i < len(eligible) && i < slots; i++ {
		floor := reserveEffMicros
		if i+1 < len(eligible) && effective(eligible[i+1]) > floor {
			floor = effective(eligible[i+1])
		}
		price := ceilDiv(floor*1_000_000, eligible[i].QualityPPM) // the bid that matches floor
		price = ceilDiv(price, tickMicros) * tickMicros
		if price > eligible[i].BidMicros {
			price = eligible[i].BidMicros
		}
		awards = append(awards, Award{ID: eligible[i].ID, Slot: i, PriceMicros: price})
	}
	return awards
}
```

```rust tab="Rust"
/// One ad in a quality-weighted auction: a per-unit bid (per click, say) in micros and
/// the platform's quality factor in parts per million (1_000_000 = neutral).
pub struct Candidate {
    pub id: String,
    pub bid_micros: i64,
    pub quality_ppm: i64,
}

/// One slot, the ad that won it and its per-unit price.
pub struct Award {
    pub id: String,
    pub slot: usize, // 0 = top
    pub price_micros: i64,
}

fn effective(c: &Candidate) -> i64 {
    c.bid_micros * c.quality_ppm / 1_000_000
}

fn ceil_div(a: i64, b: i64) -> i64 {
    (a + b - 1) / b
}

/// Ranks by effective bid, drops candidates below the effective reserve, fills up to
/// `slots` positions and prices each winner at the smallest bid that keeps it at or
/// above the next effective bid (or the reserve), rounded up to `tick_micros` and
/// never above its own bid.
pub fn gsp(cands: &[Candidate], slots: usize, reserve_eff_micros: i64, tick_micros: i64)
    -> Vec<Award> {
    let mut eligible: Vec<&Candidate> = cands
        .iter()
        .filter(|c| c.quality_ppm > 0 && effective(c) >= reserve_eff_micros)
        .collect();
    eligible.sort_by(|a, b| effective(b).cmp(&effective(a))); // stable

    eligible
        .iter()
        .enumerate()
        .take(slots)
        .map(|(i, c)| {
            let next = eligible.get(i + 1).map_or(0, |n| effective(n));
            let floor = next.max(reserve_eff_micros);
            let price = ceil_div(ceil_div(floor * 1_000_000, c.quality_ppm), tick_micros)
                * tick_micros;
            Award { id: c.id.clone(), slot: i, price_micros: price.min(c.bid_micros) }
        })
        .collect()
}
```

With the table's three advertisers (B: 3,000,000 micros at 1,000,000 ppm; A: 4,000,000 at 500,000; C: 1,000,000 at 1,000,000), two slots, no reserve and a one-cent tick, both return B in slot 0 at 2,000,000 micros and A in slot 1 at 2,000,000. A production ranker adds thresholds per position (the top block has its own), ties broken by a recorded rule, and the click-through effect of each position, which GSP's price ignores and VCG's doesn't.

## VCG

The Vickrey-Clarke-Groves mechanism generalizes the Vickrey auction to many slots by charging each winner the harm its presence does to everyone else: the value the other bidders would have gained if it hadn't taken part. Under VCG truthful bidding is a dominant strategy again, for any number of slots. Varian and Harris described it for search advertising ("The VCG Auction in Theory and Practice", 2014), including the practical issues of running one.

The difference from GSP shows once positions have different click-through rates. Continue the example with position effects: an ad of quality 1.0 gets a click with probability 0.10 in slot 1 and 0.05 in slot 2 (example figures), and an ad's click probability is its quality times the position effect. Treat each bid as the advertiser's true value per click.

| Ad | Slot | Expected clicks per impression | GSP payment per impression | VCG payment per impression |
| --- | --- | --- | --- | --- |
| B | 1 | 1.0 × 0.10 = 0.100 | 0.100 × $2.00 = $0.200 | A gains 2.00 × (0.10 − 0.05) = 0.10 and C gains 1.00 × 0.05 = 0.05 without B: $0.150, or $1.50 per click |
| A | 2 | 0.5 × 0.05 = 0.025 | 0.025 × $2.00 = $0.050 | C gains 1.00 × 0.05 = 0.05 without A: $0.050, or $2.00 per click |
| Total | | | $0.250 | $0.200 |

With the same bids, GSP collects $250 per thousand impressions and VCG $200, and the gap is in the top slot: GSP charges B the next bid for every click, VCG charges B only for the extra clicks it took from the ads below. That is why GSP bidders shade (the next bid is not what a top slot is worth to beat), and why the equilibrium Edelman, Ostrovsky and Schwarz identified gives VCG's payoffs: in equilibrium, bidders shade GSP down to roughly VCG prices. The general formula, for the ad in slot k with effective bids e and position effects s (s = 0 for no slot):

price per click(k) = (1 / (quality(k) × s(k))) × Σ over j below k of e(j) × (s(j−1) − s(j))

Varian and Harris also discuss the practical issues of running one. The practical case against VCG on a platform: it needs click-through estimates per position as an explicit input, and its prices are harder to explain to a buyer than "the bid below you." The practical case for it is the bidding: a truthful mechanism lets an automated bidder bid its value (with a multiplier for its constraints) without modeling rivals, which is the property [Automated Bidding](/books/advertising/automated-bidding#value-bidding) relies on.

## Quality-Weighted Ranking

No walled garden ranks by price alone. The rules each publishes:

- **Google Ads.** Ad Rank uses six factors (the bid, the quality of the ads and landing page, the Ad Rank thresholds, the competitiveness of an auction, the context of the person's search, and the expected impact of ad assets and other ad formats), with quality measured at auction time ("auction-time measurements like expected CTR, ad relevance, and landing page experience"). It is "calculated every time a user does a search", twice within each auction: once for eligibility, once for ranking.
- **Meta.** The auction picks the ad with the highest "total value": "We find advertiser value by multiplying an ad's bid by the estimated action rate. We then add the ad quality score", a determination of the ad's overall quality. Meta contrasts it with "traditional auctions that pick a winner based on the highest bid", and says "estimated action rates and ad quality measure ad relevance."
- **Amazon.** "The highest ranked ad is the one that best balances relevancy and bid value."

The shared shape is an **effective bid**: the advertiser's nominal bid converted into the unit the auction ranks in (expected value per impression), times or plus a quality term. The MRC glossary defines it: "the bid value that an auctioneer attributes to a given nominal bid. Typically, the product of the nominal bid and auctioneer bid factors." Three reasons platforms do this, each with a cost:

- **Comparable units.** A cost-per-click bid, a cost-per-conversion bid and an impression bid can't be compared until each is converted to expected value per impression: CPC bid × predicted click-through rate, CPA bid × predicted conversion rate. This conversion is unavoidable once bids are in different units; it is also where the platform's predictions enter the price.
- **User experience.** A quality term (Meta's ad quality, Google's landing page experience) lets the platform charge low-quality ads more for the same slot, which is a tax on ads users dislike.
- **Revenue.** Ranking by expected value per impression rather than bid per click maximizes the platform's revenue per impression. The same factor that helps a relevant small advertiser win cheaply also lets the platform's model decide who wins.

The MRC's standards treat the quality term as part of the price. Closed-loop auctioneers must disclose "the method for determining ad relevance scores" and report "the specific scores", disclose and report the likelihood-to-convert measurement and subject it to independent validation, and explain "the interaction between relevance scores and bid conversion" well enough that participants "are able to understand the degree to which relevance scores impact the valuation of their bids and winner determination." Any platform building such an auction should store the quality factor and the effective bid on every bid row, because a buyer asking why it lost will ask for exactly that.

## Reserve Prices

A reserve price (or floor) is "the price below which an auctioneer will not sell a given ad impression", in the MRC's definition, which adds that reserves "can be used to increase clearing prices beyond what an auctioneer might otherwise realize simply through the bidding process." Optimal auction theory says a seller facing few bidders should set a reserve above its own value of the item, and the evidence from search agrees: Ostrovsky and Schwarz ran a large field experiment setting reserve prices in sponsored search auctions from that theory and found that "revenues increased substantially after the new reserve prices were introduced" (Journal of Political Economy, 2023).

Reserves come in three kinds, and the distinction is the one most worth getting right:

- **A hard reserve** is a minimum to enter: bids below it are filtered. Amazon defines it as "the minimum a bid must surpass to enter an auction"; OpenRTB's `bidfloor` is one; Ad Manager's pricing rules set them on non-guaranteed demand.
- **A soft reserve** is a minimum price for a bid that cleared the hard reserve: in a second-price auction, if the winner's bid is above the soft reserve and the runner-up is below it, the winner pays the soft reserve rather than the runner-up's price; if the winner is between the hard and soft reserves, it pays its own bid. Amazon describes its soft reserve as "a real-time minimum value that seeks to better reflect what each placement is actually worth" and says the winner who clears both reserves pays "the soft reserve, which is less than they were willing to pay", and that "in no scenario does an advertiser pay more than their bid."
- **A dynamic reserve** is either kind set per request by a model predicting what the impression would clear at. Google Ad Manager's "Let Google optimize floor prices" sets floors per query with machine learning; Prebid's floors module takes floors from a provider's endpoint. Floors & Yield Optimization covers setting them.

The soft reserve is where a second-price auction can become a first-price one without saying so. On August 31, 2026 the FTC and 22 states sued Amazon in the Western District of Washington (No. 2:26-cv-03097), alleging that after running a GSP auction to compute "the GSP CPC", Amazon "secretly replaces the GSP auction price with a higher 'soft reserve' price", and that after a 2024 change Sponsored Products advertisers paid "their own winning bid close to 80% of the time", so that Amazon "effectively and secretly converted its nominally 'second price' Sponsored Products auctions into first price auctions." Amazon's response calls the allegation of a company-wide effort to deceive "patently false" and says advertisers "adjust bids based on real-world outcomes, not descriptions of auction mechanics." These are allegations and a denial in a pending case; the engineering point holds either way. A soft reserve set per auction from a prediction of the winner's bid converges on the winner's bid, and if buyers bid as if the auction were second price (truthfully), the platform collects first-price revenue from second-price bids. The buyer's correct response, in the complaint's quotation of an Amazon document, is that if an auction "is first-price rather than second-price, or even if it is a second price auction that uses soft reserve prices, then 'the right thing to do ... is to shade the bids'."

The MRC's rule for closed-loop reserves removes most of the room for this: the use of reserves must be "clearly disclosed", the reserve price "directly reported to auction participants before an auction is run and after it concludes", and "reserve prices should not be set on a per-buyer basis": "the same floor should apply simultaneously to all buyers." For OpenRTB auctions it says "auctions employing reserve prices should be managed through a Deal ID structure." My rules for any auction I'd build: one reserve per auction, the same for every bidder, recorded on the auction row with its kind and the model version that set it; the price rule that applies it written down in the auction rule version; and the clearing price stored with its basis (own bid, next bid, reserve), so the share of auctions clearing at the reserve is a query, not a discovery in litigation.

## Waterfalls and Unified Auctions

A single impression on the open web passes through several auctions, and the order they run in is itself an auction rule.

**The waterfall.** The publisher's ad server calls demand sources one at a time in a fixed order, each with an expected price (an average eCPM the publisher entered); the first to fill at or above its position's price wins. It is an auction only in a loose sense: allocation follows historical averages, not this impression's bids, so a source that would have paid more for this impression is never asked. In-app mediation still runs waterfalls for networks that can't bid in real time (In-App Advertising & Mediation, in Channels).

**Header bidding and the unified auction.** Header bidding asks several exchanges at once and passes their best bids into the ad server, where they compete with the ad server's own exchange and its line items; Google moved Ad Manager to a unified first-price auction in 2019 so that all of them compete on the same basis. The chain is now three auctions in sequence (the wrapper's, each exchange's, the ad server's), each a separate `auctions` row, and the winner of one is a bid in the next. Header Bidding & Prebid covers the plumbing; Ad Servers covers the ad server's decision, including dynamic allocation, which lets a guaranteed line item compete with a temporary CPM, an "opportunity cost" Ad Manager calculates.

**Who sees what, and when.** A unified auction is fair only if every source answers under the same information. The US court found that Google's "First Look" (AdX offered impressions before other exchanges) and "Last Look" (AdX could see the best header bid and outbid it) gave its exchange advantages no rival had, and the 2026 remedies, per reports of the unsealed opinion, ban both for indirect transactions (The Google Ad Tech Cases).<!-- source-gap: adv-adtech-remedies-look | secondary | 2026 remedies ban First Look and Last Look for indirect transactions | closes with: a text-searchable copy of the remedies memorandum, E.D. Va. Dkt. 1858 (the CourtListener PDF is image-only) | checked: 2026-11-22 --> The MRC's standards add a disclosure duty for the related case of direct deals: "direct deals or certain managed service buys that supersede an auction and may be the reason other bidders lose despite price are required to be generally disclosed."

**Multi-stage pricing.** A bid's price changes as it moves up the chain: an exchange returns its winner net of its fee, so the ad server compares net values, and Google's floors apply "after removing Google's revenue share." Whether fees come off before or after the comparison is part of the rules; the MRC encourages fees "applied pre-auction ('net bidding')" and discounts "post-auction", and requires disclosing which.

## The MRC Auction Transparency Standards

The MRC's Digital Advertising Auction Transparency Standards (final draft, January 2026), developed with the 4A's, ANA, WFA and IAB Tech Lab after a project Omnicom initiated, are the first industry standard for how any ad auctioneer explains its auction. They don't standardize auction design ("MRC does not intend to stipulate or standardize the design of any auction type"); they require that auctioneers "clearly explain to advertisers how their auctions determine pricing and allocation, and provide accountability via reporting." An "ad auctioneer" is any company that "evaluates bids, selects winner(s), and sets a price or prices (even if it is not the 'final' auction in a multi-stage auction process)", so an SSP, a wrapper's server and a garden all qualify. What they ask, by section:

| Area | Requirement (summarized; quotes are the standard's) |
| --- | --- |
| Oversight | "Formalized responsibility for auction integrity" and "a designated contact for auction participants"; documented participant, creative and supply qualification |
| Auction type (closed loop) | Disclose the type and "the method for calculating second-price and modified second-price"; report how winning bids become clearing prices; proprietary algorithm detail not required |
| Bid conversion | Disclose and report the variables converting nominal to effective bids (fees, discounts, relevance, likelihood to convert, pacing multipliers); fees encouraged pre-auction, discounts post-auction |
| Reserves | Disclose use; report the reserve before and after each auction; not per buyer |
| Winner determination | Disclose "the variables and the relative weighting" that affect who wins, and report them where applied |
| Complex (ML) systems | High-level disclosure of rules and variables; suggests feature importance per placement and model cards that document "the current version of the objective function" and weights |
| OpenRTB | Transaction ID (`tid`), global placement ID (`gpid`), complete SupplyChain objects, multi-bid, podded bidding for CTV, loss codes "passed from seller to buyer for all transactions", ads.txt 1.1 support |
| Reporting | Machine-readable results at line-item granularity where feasible, next day or within 24-48 hours; sampling allowed if disclosed and representative |
| Change disclosure | Material changes "proactively communicated to auction participants in advance", with "version histories" and impact assessments |
| Auditing | Voluntary MRC accreditation audit; annual certification recommended |

For an engineer the standard reads as a schema requirement. Every element it asks an auctioneer to disclose or report (the type, the price rule, the reserve before and after, each bid's conversion factors, the winner's determining variables, the rule version and its change history) has to exist as a stored value per auction, or it can't be reported per line item the next day.

## How to Build It

The core `auctions` and `bids` record one opportunity, its floor, its bids and its clearing price; The Google Ad Tech Cases adds `auction_rule_versions` (first look, who sees which bids, floor basis, fee timing) and, on `bids`, the source, the adjustments, the compared value and the floor each bid was held to. This chapter adds what the price rule needs: the rule's pricing and ranking method in the rule version, the bid's unit, quality factor and effective bid, the reserve's kind and source on the auction, and a row per awarded slot for auctions that sell more than one position.

```sql
-- The pricing and ranking method, versioned with the rest of the auction's rules.
ALTER TABLE auction_rule_versions
  ADD COLUMN ranking TEXT,               -- 'price', 'price_times_quality', 'total_value'
  ADD COLUMN price_rule TEXT,            -- how a winner's price is set
  ADD COLUMN bid_unit TEXT,              -- what bids are expressed in
  ADD COLUMN increment_micros BIGINT,    -- second price plus: the increment over the runner-up
  ADD COLUMN price_tick_micros BIGINT,   -- rounding step, e.g. 10000 = one cent, rounded up
  ADD COLUMN reserve_kind TEXT,          -- 'none', 'hard', 'hard_and_soft', 'dynamic'
  ADD COLUMN reserve_reported BOOLEAN NOT NULL DEFAULT FALSE,  -- shown to bidders before and after
  ADD COLUMN notified_at TIMESTAMPTZ;    -- when participants were told of this version
ALTER TABLE auction_rule_versions ADD CONSTRAINT auction_rule_versions_ranking_check
  CHECK (ranking IN ('price', 'price_times_quality', 'total_value', 'priority_then_price'))
  NOT VALID;
ALTER TABLE auction_rule_versions ADD CONSTRAINT auction_rule_versions_price_rule_check
  CHECK (price_rule IN ('pay_bid', 'second_price_plus', 'gsp_next_rank', 'vcg', 'fixed'))
  NOT VALID;
ALTER TABLE auction_rule_versions ADD CONSTRAINT auction_rule_versions_bid_unit_check
  CHECK (bid_unit IN ('cpm', 'vcpm', 'cpc', 'cpv', 'cpa', 'cpt')) NOT VALID;
ALTER TABLE auction_rule_versions ADD CONSTRAINT auction_rule_versions_reserve_kind_check
  CHECK (reserve_kind IN ('none', 'hard', 'hard_and_soft', 'dynamic')) NOT VALID;

-- The reserve that applied to this auction, for every bidder alike.
ALTER TABLE auctions
  ADD COLUMN soft_reserve_micros BIGINT,  -- in the rule version's bid unit; floor_cpm_micros is the hard one
  ADD COLUMN reserve_source TEXT,         -- 'static', a floor rule ID, or a model version
  ADD COLUMN slots_offered SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE auctions ADD CONSTRAINT auctions_slots_offered_check
  CHECK (slots_offered >= 1) NOT VALID;

-- Every bid in the auction's ranking unit, with the factor that converted it.
ALTER TABLE bids
  ADD COLUMN bid_unit TEXT,               -- the unit price_cpm_micros was converted from, if not CPM
  ADD COLUMN nominal_bid_micros BIGINT,   -- the bid as the buyer set it, in bid_unit
  ADD COLUMN quality_factor_ppm INT,      -- relevance or quality multiplier; 1000000 = neutral
  ADD COLUMN effective_bid_micros BIGINT, -- what the ranking compared, per impression
  ADD COLUMN rank SMALLINT;               -- 0 = top; null for filtered bids
ALTER TABLE bids ADD CONSTRAINT bids_quality_factor_check
  CHECK (quality_factor_ppm IS NULL OR quality_factor_ppm > 0) NOT VALID;

CREATE TABLE auction_slots (             -- each position a multi-slot auction awarded
  auction_started_at TIMESTAMPTZ NOT NULL,
  auction_id         UUID NOT NULL,
  slot               SMALLINT NOT NULL CHECK (slot >= 0),  -- 0 = top; a position in a block or pod
  bid_id             UUID NOT NULL,       -- joined by (auction_started_at, bid_id)
  price_unit         TEXT NOT NULL CHECK (price_unit IN ('cpm', 'vcpm', 'cpc', 'cpv',
                       'cpa', 'cpt')),
  price_micros       BIGINT NOT NULL CHECK (price_micros >= 0),  -- per unit, charged if the unit happens
  price_basis        TEXT NOT NULL CHECK (price_basis IN ('own_bid', 'next_rank',
                       'externality', 'hard_reserve', 'soft_reserve', 'position_threshold',
                       'fixed')),
  position_reserve_micros BIGINT,         -- the threshold for this position, if any
  PRIMARY KEY (auction_started_at, auction_id, slot),
  FOREIGN KEY (auction_started_at, auction_id) REFERENCES auctions (started_at, id)
) PARTITION BY RANGE (auction_started_at);
```

The question the MRC's reserve rule and the Amazon complaint both turn on, how often the reserve rather than competition set the price, is then one query:

```sql
-- Per auction runner and day: slots awarded, and the share priced by a reserve or the winner's own bid.
SELECT a.runner_org_id,
       a.started_at::date                                              AS day,
       count(*)                                                        AS slots_awarded,
       round(100.0 * count(*) FILTER (WHERE s.price_basis IN
             ('hard_reserve', 'soft_reserve', 'position_threshold')) / count(*), 1)
                                                                       AS reserve_priced_pct,
       round(100.0 * count(*) FILTER (WHERE s.price_micros = b.nominal_bid_micros)
             / count(*), 1)                                            AS paid_own_bid_pct
FROM auctions a
JOIN auction_slots s ON s.auction_id = a.id AND s.auction_started_at = a.started_at
JOIN bids b          ON b.id = s.bid_id AND b.auction_started_at = s.auction_started_at
WHERE a.started_at >= now() - interval '7 days'
GROUP BY 1, 2
ORDER BY 1, 2;
```

Grouping by `auctions.auction_rule_version_id` instead of the runner shows the same shares per rule version, which is how a reserve-model change shows up.

Design notes:

- **The price rule is data on the version, not code on the server.** `price_rule`, `ranking`, `increment_micros`, `price_tick_micros` and `reserve_kind` live on `auction_rule_versions` with an effective range, so "what rule priced this click on March 3" is a join, and a change gets a new version with `notified_at` set before it takes effect, which is what the MRC's change disclosure asks ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Nominal and effective bids are both kept.** `nominal_bid_micros` is what the buyer set, in its unit; `effective_bid_micros` is what was ranked, per impression; `quality_factor_ppm` is the bridge. A buyer's "why did I lose with the higher bid" is answered from the three. The core's `price_cpm_micros` stays the bid in CPM, for single-slot CPM auctions.
- **One row per awarded slot.** Search blocks, carousels of sponsored products and video pods sell several positions per auction; `auction_slots` holds each with its price, unit and basis. A single-slot exchange auction can skip it and use `auctions.clearing_cpm_micros`. Pods share the shape, and Server-Side Ad Insertion & Ad Pods adds what pods need beyond it (duration, competitive separation).
- **A slot's price is not revenue until the unit happens.** A CPC auction's slot price is charged only on a click, and a click is validated before it bills (Counting Impressions & Clicks); revenue comes from billable events rolled into `delivery_daily`, never from `auction_slots`.
- **The reserve is one value per auction.** `floor_cpm_micros` (hard) and `soft_reserve_micros` are on `auctions`, not on bids, so a per-buyer reserve has nowhere to live; `reserve_source` names the static rule or the model version that set a dynamic one.
- **Logs are partitioned and sampled the way the core's are.** `auction_slots` is partitioned by hour like `auctions`; the MRC allows sampled reporting if the sample is disclosed and representative, and the retention period follows the longest dispute or audit window that applies ([Retention](/docs/telemetry/consent-and-privacy#retention)).

## Auditing

- **The rules on any date.** Every rule version with its ranking, price rule, reserve kind, effective range, notice date and approver, because the first question in any auction dispute is what the rules were then.
- **Every bid's conversion.** Nominal bid, unit, quality factor and effective bid per bid, so a ranking can be recomputed and a relevance score's effect on price shown, as the MRC requires.
- **Every reserve.** The hard and soft reserve on each auction and the model or rule that set them, and the share of auctions priced by a reserve, tracked over time; a jump in that share after a model change is the signal to look at.
- **Every price's basis.** For each awarded slot, whether the price came from the next rank, an externality, a reserve or the winner's own bid.
- **Every change notice.** What participants were told, when, with the impact assessment, before each material change.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Decide the auction type deliberately and say it on every request.** First price for open-web auctions where bids from several sources are compared; a second-price variant only where you can guarantee no hidden reserve converts it.
- **Rank by effective bid with the factor stored.** Convert every bid unit to expected value per impression, keep the nominal bid, the quality factor and the effective bid on the row.
- **Price GSP and VCG from the ranked list,** with ties, position thresholds and rounding written into the rule version.
- **Use one reserve per auction for every bidder,** report it before and after, and record its kind and source.
- **Never let a soft reserve track the winner's bid.** If the reserve model predicts the winning bid, the auction is first price and should say so.
- **Treat a multi-stage chain as several auctions,** each with its own row, and state who sees which bids when.
- **Version the rules and notify before changes,** so every auction points at the rules that decided it.

## References

**Specifications**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), allocation and pricing, the 0.1-second process, closed-loop share of spend, auction type, bid conversion, relevance score disclosure, reserve reporting and the per-buyer rule, Deal ID reserves in OpenRTB, winner determination, direct-deal disclosure, complex systems, OpenRTB requirements, reporting, change disclosure, auditing and the glossary definitions
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), auction types 1, 2 and 500 and above, the deal auction type 3, bidfloor in CPM with USD as the default currency

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), First Look and Last Look
- [FTC et al. v. Amazon.com, Inc., No. 2:26-cv-03097 (W.D. Wash.), Complaint (August 31, 2026)](https://ag.ny.gov/sites/default/files/court-filings/federal-trade-commission-et-al-v-amazon.com-inc-complaint-2026_0.pdf), the plaintiffs, the alleged two-stage GSP and soft reserve pricing, the share of clicks charged the winning bid, and the quoted bid-shading statement

**Reference**

- [Edelman, Ostrovsky and Schwarz: Internet Advertising and the Generalized Second-Price Auction (American Economic Review, 2007)](https://www.aeaweb.org/articles?id=10.1257/aer.97.1.242), GSP, truthful bidding not an equilibrium, and the equilibrium with VCG payoffs
- [Varian and Harris: The VCG Auction in Theory and Practice (American Economic Review, 2014)](https://www.aeaweb.org/articles?id=10.1257/aer.104.5.442), VCG for search advertising and its practical issues
- [Ostrovsky and Schwarz: Reserve Prices in Internet Advertising Auctions: A Field Experiment (Journal of Political Economy, 2023)](https://econpapers.repec.org/RePEc:ucp:jpolec:doi:10.1086/725702), reserve prices from optimal auction theory and the revenue increase
- [National Law Review: Court Declines to Order AdX Divestiture in Google Ad Tech Case (September 18, 2026)](https://natlawreview.com/article/court-declines-order-adx-divestiture-google-ad-tech-case), a secondary report of the remedies opinion unsealed September 16, 2026: First Look and Last Look prohibited for indirect transactions

**In practice**

- [Google: Rolling out first price auctions to Google Ad Manager partners (September 5, 2019)](https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/), unified first price, the test results, Bid Data Transfer and the minimum bid to win
- [Google Ads Help: About Ad Rank](https://support.google.com/google-ads/answer/1722122?hl=en), Ad Rank's factors, auction-time quality, thresholds and calculation twice per auction
- [Google Ads Help: Ad Rank: Definition](https://support.google.com/google-ads/answer/1752122?hl=en), a higher position at a lower price despite higher competing bids
- [Google Ads Help: Actual cost-per-click](https://support.google.com/google-ads/answer/6297?hl=en), paying the minimum to clear thresholds and the ad below, the reserve price, rounding to $0.01 and the worked example
- [Google Ad Manager Help: Pricing rules](https://support.google.com/admanager/answer/9298008?hl=en), floors on non-guaranteed demand and Google-optimized floor prices
- [Google Ad Manager Help: Pricing rules and revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors applied after Google's revenue share
- [Google Ad Manager Help: Delivery basics](https://support.google.com/admanager/answer/3721872?hl=en), dynamic allocation and the temporary CPM
- [Meta: How does Facebook use machine learning to deliver ads? (June 11, 2020)](https://business.meta.com/news/good-questions-real-answers-how-does-facebook-use-machine-learning-to-deliver-ads/), total value from bid, estimated action rate and ad quality
- [Meta: About the ad auction](https://www.facebook.com/business/ads/ad-auction), not picking the highest bid, and estimated action rates and ad quality as relevance
- [Amazon: Amazon's response to the FTC's lawsuit regarding Sponsored Ads](https://www.aboutamazon.com/md/company-news/amazon-ftc-sponsored-ads-lawsuit-response), the generalized second-price auction since 2006, hard and soft reserves, relevance-weighted ranking and Amazon's denial
- [Apple Ads: How pricing works](https://ads.apple.com/app-store/help/advanced/0003-how-pricing-works), cost per tap up to a maximum and cost per install on Basic
- [LinkedIn Help: Bidding strategies](https://www.linkedin.com/help/lms/answer/a427513), the online auction and competing advertisers
