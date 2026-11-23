+++
title = "Deals, PMPs & Curation"
description = "Open auction to programmatic guaranteed, deal IDs in OpenRTB, the Deals API, curation and Curated Audiences, curator fees, and why a deal doesn't spend."
category = "Advertising Industry"
order = 2919
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "deals", "curation", "data-model"]
+++

A deal is an agreement between a seller and a buyer that rides on the programmatic pipes: an identifier the seller attaches to bid requests for some of its inventory, with terms (a floor or a fixed price, the buyers allowed, sometimes a guarantee) that the buyer's DSP recognizes and bids against. It sits between two older ways of buying: the open auction, where anyone with a seat bids on anything at the exchange's floor, and the insertion order, where a person books a fixed quantity at a fixed price and the publisher's ad server delivers it. Deals now carry most of the programmatic money: in the ANA and TAG TrustNet benchmark for the third quarter of 2025, private marketplaces were 81.6% of participating advertisers' programmatic spend. Curation is the newest layer on top: a third party (a data company, a retailer, an agency trading desk) packages inventory from many sellers with its own audience data into a deal, sells it to buyers, and takes a fee.

Deals are hard because a deal ID is a promise that every system in the chain has to keep the same way, and none of them can see the others' configuration. The seller sets the deal up in its SSP or ad server, the buyer types the same ID into a DSP line item, and the impression only transacts if the SSP's targeting, the deal's floor, the buyer's targeting, budget, frequency caps and creative approval, and the publisher ad server's priorities all line up on the same request. When they don't, the deal "doesn't spend", and the seller sees "buyer did not bid" while the buyer sees "no matching requests". Curation adds a party between them whose fee comes out of the same price, which the standards on auction transparency only partly cover.

This chapter covers the transaction types and how each is signaled in OpenRTB, deal IDs and how deals are set up on SSPs, ad servers and DSPs (including the IAB Tech Lab Deals API), curation and curators, Curated Audiences (the specification that was Seller Defined Audiences until December 2024), curator fees and what the MRC's auction transparency standards say about fees, and how to troubleshoot a deal that doesn't spend. It extends `deals` and `buyer_seats` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model): the core `deals` row already holds the deal ID, kind, floor or fixed price and terms; this chapter adds the OpenRTB terms as columns, the allowed seats as rows, the deal's inventory and audience targeting, curation packages, deal syncs and a daily deal health record, and records curator and curation platform fees as `fee_terms` rows ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)). [OpenRTB](/books/advertising/openrtb) owns the `pmp` and `deal` objects in the full protocol; [Demand-Side Platforms](/books/advertising/demand-side-platforms) owns how a DSP's line items buy deals and its supply paths (its `supply_sources`); [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) owns the exchange's auction and the fee applied to it; [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization) owns how deal floors are priced; [Auction Mechanics](/books/advertising/auction-mechanics) owns first- and second-price behavior inside a private auction; [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies) owns the audience and content taxonomies; and [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms) owns the contract around a programmatic guaranteed deal. [How the Money Splits](/books/advertising/advertising-business#how-the-money-splits) shows where deal fees land in the programmatic dollar.

## How the Platforms Do It

As of November 2026, from each company's public pages:

| Platform | Deal types offered | Curation | How curators are paid | Notes |
| --- | --- | --- | --- | --- |
| **Google Ad Manager** | Programmatic Guaranteed (reserved inventory, through Programmatic Direct); Preferred Deals (fixed CPM, not reserved, start with a proposal); Private Auctions (floor price, start with an invitation) | Marketplace Packages, ranked with other non-guaranteed deals | Not covered on the help pages opened | Publishers rank non-guaranteed deals with a priority number; deal bid rate and win rate are reported per deal but "Not tracked for Programmatic Guaranteed deals" |
| **Index Exchange** | Deals through its exchange | Index Marketplaces, described as sell-side decisioning with "custom supply-side algorithms" | Not published; Index says curators should bring "net new demand, unique data, or real differentiated value", not "just markups" | Calls for "no opaque fees, no hidden margins" |
| **Magnite** | PMPs, programmatic guaranteed, curated marketplaces and custom auction packages "with deal IDs" | ClearLine, "a unified, transparent platform where buyers and curators can discover, package, and activate"; Deal Discovery (2022) for PMP and auction package creation | A "Curator Share" paid by Magnite to the curator, with monthly reconciliation adjustments and no payout under $100 a month unless requested | Curator terms last updated August 24, 2026 |
| **Microsoft Curate** | Curated deals: packages a curator builds on sellers' inventory and sells to buyers | Curators: "retailers, data companies, independent trading desks, and other media companies"; buyers can curate for themselves | A curator margin and a Microsoft tech fee charged to the curator, only when the curated bid wins; bids reach the seller's final auction net of them | The page (October 21, 2025) still lists Microsoft Invest as a buying path; Microsoft stopped buying through Invest from February 28, 2026 |
| **PubMatic** | Deals through Activate, which PubMatic says connects buyers, data partners, commerce media networks and publishers | Connect, a curation platform that "seamlessly integrates with Activate" | Not published | Its March 2025 release claims a 25%+ eCPM lift for curated over non-curated deals (a vendor claim over 24 hours of data) |

Three patterns:

- **The deal ID is the integration.** Every platform's deal, private auction, package or curated marketplace reaches the buyer the same way: a deal ID in the bid request's `pmp.deals[]` that a DSP line item targets. Curation products differ in who builds the package and who takes the fee, not in how it is transacted.
- **Curation has moved to the sell side.** Microsoft, Magnite, Index Exchange and PubMatic all sell curation tools that run inside the SSP, where the bid request is built, so the curator's data and inventory selection apply before the request leaves the exchange and the buyer sees one deal ID from one SSP.
- **The curator's fee comes out of the bid.** Microsoft states that curated bids compete in the seller's auction "net of such fees or charges" and that fees apply only on a win; Magnite pays the curator a share of curated transactions. In both, the publisher sees a lower net bid than the buyer paid, and the difference is the curator's and the platform's.

## The Transaction Types

The industry uses four names, and the OpenRTB fields that carry each:

| Type | Price | Who may bid | Inventory reserved? | OpenRTB signal |
| --- | --- | --- | --- | --- |
| **Open auction** | Exchange floor (`imp.bidfloor`); first or second price | Any buyer seat with access to the exchange | No | No `pmp`, or `pmp.private_auction = 0` with deals as extra options |
| **Private auction (PMP)** | A deal floor (`deal.bidfloor`); the auction type the deal sets | Only the seats in `deal.wseat` (or advertiser domains in `wadomain`) | No | `pmp.deals[]` with `bidfloor`, `wseat`; `pmp.private_auction = 1` when only deal bids are accepted |
| **Preferred deal** | A fixed price agreed in advance | One buyer, first look at the price, not obliged to bid | No | A deal with `at = 3` ("the value passed in `bidfloor` is the agreed upon deal price") |
| **Programmatic guaranteed** | A fixed price | One buyer, obliged to buy the contracted quantity | Yes, booked like an IO | A deal with `at = 3` and `guar = 1` ("guaranteed deal", requiring the bidder to bid) |

OpenRTB's own implementation guide doesn't use these four names; it describes eight use cases, from an "Open Trading Agreement with Buyer" that needs no deal ID, through "Open Bidding with Deal ID as Value-added Markers" and a "First Look Trading Agreement" ("Prioritization of bids expected"), to a "Direct Option Deal with Advertiser via RTB" and a "Full-Fill Direct Deal" with a fill rate of "100% or nearly so", and mentions programmatic guaranteed separately. The four names are the ones ad servers and DSPs use. Google Ad Manager's definitions:

- **Programmatic Guaranteed**: inventory "reserved only for the buyer in the deal", sold in a contracted quantity (Standard CPM), an impression limit (Sponsorship CPM) or a daily billing threshold (Sponsorship CPD, where a day that doesn't exceed the minimum is not billed to the advertiser and not paid to the publisher).
- **Preferred Deal**: not reserved, so the publisher can later reserve the same inventory in a guaranteed campaign "for a better price"; the buyer gets an "initial, or 'preferred,' opportunity" to buy at the negotiated price and is not required to; an estimated quantity "does not affect ad serving". If two Preferred Deals at the same CPM are eligible for the same request, the winner is chosen randomly.
- **Private Auction**: non-guaranteed, with a floor price, begun by an invitation rather than a proposal.

The core model's `deals.kind` has three values (`private_auction`, `preferred`, `programmatic_guaranteed`); an open auction is not a deal. Auction packages and curated deals are private auctions or preferred deals by their terms, with a package or curator behind them, which this chapter models as columns rather than more kinds.

**Where deals sit in the ad server's priorities.** In a publisher ad server the deal is a line item or a deal object with a priority. Google Ad Manager gives Preferred Deals "a fixed priority value" and lets publishers rank Preferred Deals, Private Auctions and Marketplace Packages against each other with a priority number, 1 being the highest; Programmatic Guaranteed inventory is reserved for its buyer. Open Bidding partners' deals "compete with Ad Exchange Preferred Deals and Private Auctions based on price, with higher priority than other Open Auction bids". In Prebid, a deal bid reaches the ad server as `hb_deal_BIDDERCODE`, and Prebid's ad ops guide says deal line items should sit above open-market Prebid line items; [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid) covers the key-values.

## Deal IDs in OpenRTB

The `pmp` object is "the private marketplace container for direct deals between buyers and sellers that may pertain to this impression". A request for a 300x250 that is in two deals and also open to the open auction:

```json
{
  "id": "8b1f4c2e-req",
  "imp": [{
    "id": "1",
    "banner": { "w": 300, "h": 250 },
    "bidfloor": 1.50,
    "bidfloorcur": "USD",
    "pmp": {
      "private_auction": 0,
      "deals": [
        { "id": "PA-SPORTS-2026Q4", "bidfloor": 4.00, "bidfloorcur": "USD", "at": 1,
          "wseat": ["seat-1201", "seat-1377"] },
        { "id": "PG-AUTO-BRAND-11", "bidfloor": 12.00, "bidfloorcur": "USD", "at": 3, "guar": 1,
          "wseat": ["seat-1201"], "wadomain": ["exampleautos.com"] }
      ]
    }
  }],
  "at": 1,
  "tmax": 300
}
```

And a bid against the guaranteed deal, which names the deal it is for:

```json
{
  "id": "8b1f4c2e-req",
  "seatbid": [{
    "seat": "seat-1201",
    "bid": [{ "id": "b1", "impid": "1", "price": 12.00, "dealid": "PG-AUTO-BRAND-11",
              "adomain": ["exampleautos.com"], "crid": "cr-778", "w": 300, "h": 250 }]
  }]
}
```

The fields, from OpenRTB 2.6:

- **`pmp.private_auction`**: "0=all bids are accepted, 1=bids are restricted to the deals specified and the terms thereof". The implementation guide warns that open market bids sent to a private auction "may be rejected and should not have been exposed to all bidders".
- **`deal.id`**: "A unique identifier for the direct deal"; the bid's `dealid` is a "Reference to the `deal.id` from the bid request if this bid pertains to a private marketplace direct deal".
- **`deal.bidfloor` and `bidfloorcur`**: the deal's floor in CPM, USD by default; the deal's currency "does not inherit from `Imp.bidfloorcur`", it is "either explicitly specified or defaults to USD".
- **`deal.at`**: overrides the request's auction type for this deal; `3` means the floor is the agreed deal price.
- **`deal.wseat` and `wadomain`**: allowed buyer seats and advertiser domains; omitted means no restriction.
- **`deal.guar`**: `1` for a guaranteed deal, which the bidder is required to bid on.
- **`deal.mincpmpersec` and `durfloors`**: for video and audio, a floor per second, or floors by duration range (`mindur`, `maxdur`, `bidfloor`), added in the 2.6-202309 release with deal attributes.

The implementation guide's advice to bidders on how many bids to return: "M >= 1, preferably one per matching Deal ID", plus "N >= 2" open-market bids "to assist with blocking rate issues", with "1+1" as the minimum viable response, so that a deal bid blocked by the publisher's ad quality rules doesn't leave the impression unfilled.

**Deal IDs are only unique within a seller system.** The ID is a string the SSP or ad server generates; two SSPs can issue the same string, and a curator's deal ID is issued by the SSP it curates on. The core model makes `deal_code` unique per `seller_account_id`; a DSP receiving deal IDs from many exchanges keys them by exchange and code, never by code alone. My rule is the general one for external identifiers: store the issuing system with every external ID and never match across systems on the string alone ([Crosswalks of External IDs](/docs/building-blocks/record-linkage#crosswalks-of-external-ids)).

## Setting Up a Deal

A deal is configured three times, by three parties, and every copy has to agree.

**On the sell side (SSP or publisher ad server).** The seller creates the deal: its ID, type, price (floor or fixed), currency, flight dates, the inventory it applies to (properties, ad units, sizes and formats, geography, devices, content categories), any audience segments, the buyer seats allowed, and, for programmatic guaranteed, the quantity and pacing. Google Ad Manager runs Preferred Deals and Programmatic Guaranteed through proposals, which "can include PG line items or Preferred Deal line items, but not both", and Private Auctions through invitations. Magnite's Deal Discovery (announced April 27, 2022) is "a self-service user interface to streamline PMP and Auction Package deal creation", where buyers can request deals and publishers approve them. On the request path, the SSP adds the deal to `pmp.deals[]` only on requests matching the deal's targeting, which is the first place a deal can silently fail.

**On the buy side (DSP).** The buyer enters the deal ID in the DSP (often as an "inventory source" or "deal" object, with the exchange it lives on), and a line item or ad group targets it. The line item's own targeting, frequency caps, budget and pacing apply on top: a line item limited to one city buying a national deal will see only that city's requests. For a programmatic guaranteed deal, the DSP line item must bid on every eligible request at the fixed price, because the publisher has reserved the inventory and `guar = 1` obliges the bid.

**On the publisher ad server, when it isn't the seller.** When the deal runs through header bidding, the publisher also creates a deal line item targeting `hb_deal_BIDDERCODE` with the deal ID, date ranges "in accordance with the agreement" and a priority above open-market Prebid line items, and configures Prebid to send deal bids even when they aren't the top bid (`alwaysIncludeDeals` in Prebid.js; `alwaysincludedeals` and `preferdeals` in Prebid Server, both off by default).

**The Deals API.** Retyping a deal in each system is where mismatches start. IAB Tech Lab's Deals API v1.0, finalized February 6, 2026 after public comment until January 31, 2026, is "a one-party design for the origin system to PUSH information about the deal" to receiving systems (an SSP to a DSP): a description of what the deal includes, which "parties were involved in curating and selling the package", and status queries after the first send. It is deliberately narrow: v1 doesn't support differential overrides, proposals, revisions, negotiations or marketplace discovery, and it doesn't decide whether a deal applies to a given bid request, so implementers still validate deal conditions against each OpenRTB request. My default is to treat a deal sync as an integration with a status per destination ([Connection Health and Reconnect](/docs/building-blocks/integrations#connection-health-and-reconnect)), and to keep the seller's record as the source of truth that each destination's copy is checked against.

## Curation

Curation is packaging: choosing inventory across sellers (sites, apps, CTV channels, ad units), applying data to it (audiences, contexts, quality filters, attention or performance scores), pricing it, and selling the result to buyers as one deal. Microsoft describes curators' assets as "audience data, preferred inventory access, specially negotiated rates with sellers, optimization capabilities, investment strategy, and other features", and lets buyers "act as curators" to centralize their own rules "across DSPs". Magnite's ClearLine lets "buyers and curators... discover, package, and activate" supply; its buyer page describes custom auction packages built from first- and third-party data "with deal IDs". PubMatic's Connect packages "data and inventory" with ongoing optimization.

Mechanically, a curated deal is an SSP-side deal whose eligibility includes the curator's selection: the SSP evaluates each request against the package's inventory list and audience or contextual segments, attaches the curated deal ID when it matches, and passes the curator's fee through the price. Three properties follow:

- **The curator never sees the bid stream raw.** The selection runs inside the SSP; the curator's data is onboarded to the SSP (or evaluated by a partner the SSP integrates), which is what makes sell-side curation possible where cookies don't reach.
- **The seller's rules still apply.** Microsoft's FAQ is explicit: curated transactions "are not guaranteed deals and will not override any seller account configurations, including ad quality settings or floor price settings"; a curator "simply 'overlays' the inventory with their assets". Index Exchange says curators should build on top of the publisher's rules: "your floors, brand safety standards, and creative restrictions".
- **The publisher can refuse curators.** Microsoft's sellers can block curators in Partner Center (curators are identified with "[CURATOR]" at the end of their member name) and report on curated activity by curator.

**Curated Audiences.** IAB Tech Lab's Seller Defined Audiences specification was renamed Curated Audiences in December 2024. It is "an addressability specification incubated within Project Rearc" that lets publishers, data management platforms and data providers scale first-party audience data without deprecated identifiers, built on Prebid integrations, OpenRTB 2.6 community extensions, the Transparency Center and the Data Transparency Standard. The community extension that qualifies segment IDs is `segtax`: segments travel in the request's `user.data` objects (for audiences) or `site.content.data` and `app.content.data` (for context), and `segtax` in each data object's `ext` names the taxonomy the IDs come from: 4 for the Audience Taxonomy 1.1, 6 and 7 for Content Taxonomy 2.2 and 3.0, and 500 and above for vendor taxonomies. Without `segtax`, segment IDs are proprietary to whoever sent them. [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies) covers the taxonomies; for deals, the rule is that a curated audience is a deal targeting clause naming a taxonomy and segment IDs, recorded as such, not a free-text label.

**Where curation and supply path optimization meet.** A buyer that cuts intermediaries out of its supply paths ([Demand-Side Platforms](/books/advertising/demand-side-platforms) covers supply path optimization) and then buys a curated deal has added one back: the curator is paid from the price, and the inventory may still have come through resellers. The ads.txt and SupplyChain checks in [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain) apply to curated deals exactly as to open-auction bids.

## Curator Fees and Fee Transparency

A curated impression's price is split more ways than an open-auction one. An illustrative curated deal, with rates that are examples, not market figures: a DSP bids $10.00 CPM on the curated deal ID; the curator's margin is 15% and the platform's curation tech fee is 5% of that bid; the SSP takes its own fee from what remains.

| Step | CPM |
| --- | --- |
| Buyer's bid on the curated deal | $10.00 |
| Curator margin (15%, example) | $1.50 |
| Curation tech fee (5%, example) | $0.50 |
| Net bid entering the seller's final auction | $8.00 |
| SSP fee (20% of the net, example) | $1.60 |
| Publisher's revenue | $6.40 |

The bid that competes in the publisher's auction is the $8.00, not the $10.00: Microsoft says curated bids are submitted to the seller's final auction "net of such fees or charges unless you agree otherwise with the applicable curator", and that "no curation-related fees or charges will apply if a bid for inventory via curation does not win". This is net bidding, and it matters for the auction: a curated bid competes fairly with an open-market bid only if both are compared net of everything taken from them.

The MRC's Digital Advertising Auction Transparency Standards (final, January 2026) address fees directly only for closed-loop auctions: "how discounts and tech fees are applied are required to be consistent and transparent", fees are encouraged to be applied pre-auction ("net bidding") and discounts post-auction, and either way "this is required to be disclosed". For OpenRTB auctioneers the standard requires complete SupplyChain objects, transaction and placement IDs, multi-bid and loss codes, says "auctions employing reserve prices should be managed through a Deal ID structure", and notes that "certain private auctions may utilize OpenRTB, but have pre-negotiated rules outside of simple pricing; these distinct considerations are not explicitly covered". I found no public industry standard that requires a curator's fee to be disclosed to the publisher or the buyer per impression; the platforms' own terms (Microsoft's FAQ, Magnite's curator terms) describe how the fee is charged but publish no rate. <!-- source-gap: adv-curator-fee-disclosure | missing | no public standard requiring per-impression disclosure of curator fees to buyers or publishers | closes with: an IAB Tech Lab or MRC curation guideline that addresses curator fee disclosure | checked: 2026-11-22 -->

My rule, given that gap: record every fee on a curated transaction as its own amount with the party, the rate and the agreement that produced it, exactly as [One Rule for All of Them](/books/advertising/advertising-business#one-rule-for-all-of-them) says for every split, so the buyer's gross, the curator's margin, the platform's fee, the SSP's fee and the publisher's net are all rows that sum. A curator's payout is then a statement computed from those rows (Magnite's terms describe a monthly "Curator Share" with "Reconciliation Adjustments" for invalid transactions and reporting errors, and no payment under $100 in a month unless requested), and [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts) covers the payout mechanics.

## Why a Deal Doesn't Spend

Most deal support tickets have the same shape: the deal is "live" on both sides and nothing delivers. The diagnosis is a funnel, and both sides report their half of it. Google Ad Manager's private auction troubleshooting (for real-time bidding deals) breaks a deal's requests into "Buyer did not bid", "Buyer bid via other sources", "Bids for this deal", "Winning bids", and "Filtered/filled by competing demand", with filtered bids split into reasons such as "Blocked by Protections", "Creative was outbid" and "Buyer bidding or setup issues", and competing demand into "Bid lost in auction", "Bid too low", "Bid lost to Private Marketplace deal" and "Bid lost to guaranteed line item". Its reports define deal bid rate as bids divided by bid requests and deal win rate as winning bids divided by bids, both per deal. Display & Video 360's troubleshooter shows the buyer's half: total available requests, impressions filtered before bidding (invalid traffic, sellers unauthorized in ads.txt), targeting mismatches, creative rejections, frequency, budget and pacing limits, bids filtered in the auction, externally filtered responses ("Bid too low", "Creatives", "Others", and "Externally lost (not reported)"), and impressions won.

Putting the two halves together, the stages and what fails at each:

| Stage | Seller sees | Buyer sees | Usual causes | Who fixes it |
| --- | --- | --- | --- | --- |
| **No requests with the deal** | Few or no bid requests for the deal | No available requests | Deal targeting doesn't match live inventory; deal not active, wrong dates; buyer seat not in `wseat`; deal ID typed wrong in the DSP; deal on a different exchange than the DSP line item names | Seller (targeting, seats), buyer (ID, exchange) |
| **Requests, no bids** | "Buyer did not bid"; low bid rate | Requests filtered before bidding | DSP line item not targeting the deal or paused; geo, device, audience or brand safety targeting narrower than the deal; frequency caps, budget or pacing exhausted; no creative of the right size or format; ads.txt doesn't authorize the seller; consent signals block the line item's data | Buyer |
| **Bids, filtered** | "Blocked by Protections", "Creative was outbid", "Buyer bidding or setup issues" | Externally filtered: "Creatives", "Others" | Creative not approved by the exchange or blocked by the publisher's ad quality rules or advertiser category blocks; wrong `adomain`; bid in the wrong currency or format | Buyer (creative), seller (protections) |
| **Bids, lost** | "Bid too low", "Bid lost in auction", "Bid lost to Private Marketplace deal", "Bid lost to guaranteed line item" | "Bid too low"; lost to a higher bid | Bid under the deal floor (often a floor set in one currency and bid in another, or a floor compared net of fees); a higher-priority deal or guaranteed line item; dynamic allocation protecting a guarantee | Seller (floor, priorities), buyer (bid) |
| **Wins, no impressions** | Winning bids but low impressions | Wins but no billable impressions | Creative didn't render (SafeFrame, size mismatch, a VAST error), the impression was filtered as invalid traffic, or counting differs between the parties | Both; [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) |

Three causes deserve their own warning:

- **Programmatic guaranteed that doesn't bid.** A PG deal reserves the publisher's inventory, so a buyer that doesn't bid costs the publisher the impression. Google's reports don't track deal bid rate for PG, and its private auction troubleshooting advice for a buyer that did not bid is to contact the buyer. The DSP side must treat PG line items as "always bid at the fixed price" and alert when its bid rate on a PG deal falls.
- **Floors and fees on different bases.** A deal floor is compared against a bid net of some fees and not others; Google Ad Manager compares pricing rule floors to the bid after its revenue share, and curated bids arrive net of curation fees. A buyer bidding exactly the agreed floor on a gross basis loses every auction. My rule is to state on every deal whether its floor is gross or net and of which fees, and to compute the buyer's minimum bid from it.
- **Targeting that intersects to nothing.** The deal's inventory targeting and the line item's targeting are intersected at request time; two reasonable sets of rules (a deal for sports content on mobile, a line item for desktop) intersect to zero. The fix is to compare both sides' targeting before launch, not after a week of no spend.

A deal health check can classify a deal's day from its counters, so the right side gets the right message without a support ticket:

```go tab="Go"
package deals

// DayCounts are one deal's counters for one day, joined from the
// seller's report (requests, bids, wins) and the ad events (impressions).
type DayCounts struct {
	Requests     int64
	Bids         int64
	BidsBelow    int64 // bids under the deal floor
	BidsFiltered int64 // creative, protections, setup
	Wins         int64
	Impressions  int64
	Guaranteed   bool
}

type Finding struct {
	Stage string // where the funnel breaks
	Owner string // "seller", "buyer" or "both"
}

// Diagnose returns every stage at which the funnel breaks, using
// thresholds a platform tunes; minBidRate and minWinRate are fractions.
func Diagnose(c DayCounts, minBidRate, minWinRate float64) []Finding {
	var out []Finding
	if c.Requests == 0 {
		return append(out, Finding{"no_requests", "seller"})
	}
	bidRate := float64(c.Bids) / float64(c.Requests)
	if c.Guaranteed && bidRate < 0.99 {
		out = append(out, Finding{"guaranteed_not_bidding", "buyer"})
	} else if bidRate < minBidRate {
		out = append(out, Finding{"low_bid_rate", "buyer"})
	}
	if c.Bids > 0 {
		if float64(c.BidsBelow)/float64(c.Bids) > 0.5 {
			out = append(out, Finding{"bids_below_floor", "both"})
		}
		if float64(c.BidsFiltered)/float64(c.Bids) > 0.5 {
			out = append(out, Finding{"bids_filtered", "buyer"})
		}
		if float64(c.Wins)/float64(c.Bids) < minWinRate {
			out = append(out, Finding{"low_win_rate", "seller"})
		}
	}
	if c.Wins > 0 && float64(c.Impressions)/float64(c.Wins) < 0.8 {
		out = append(out, Finding{"wins_not_rendering", "both"})
	}
	return out
}
```

```rust tab="Rust"
/// One deal's counters for one day, joined from the seller's report
/// (requests, bids, wins) and the ad events (impressions).
pub struct DayCounts {
    pub requests: i64,
    pub bids: i64,
    pub bids_below: i64,    // bids under the deal floor
    pub bids_filtered: i64, // creative, protections, setup
    pub wins: i64,
    pub impressions: i64,
    pub guaranteed: bool,
}

#[derive(Debug, PartialEq)]
pub struct Finding {
    pub stage: &'static str, // where the funnel breaks
    pub owner: &'static str, // "seller", "buyer" or "both"
}

fn ratio(n: i64, d: i64) -> f64 {
    n as f64 / d as f64
}

/// Returns where the funnel breaks, using thresholds a platform tunes;
/// min_bid_rate and min_win_rate are fractions.
pub fn diagnose(c: &DayCounts, min_bid_rate: f64, min_win_rate: f64) -> Vec<Finding> {
    let mut out = Vec::new();
    if c.requests == 0 {
        out.push(Finding { stage: "no_requests", owner: "seller" });
        return out;
    }
    let bid_rate = ratio(c.bids, c.requests);
    if c.guaranteed && bid_rate < 0.99 {
        out.push(Finding { stage: "guaranteed_not_bidding", owner: "buyer" });
    } else if bid_rate < min_bid_rate {
        out.push(Finding { stage: "low_bid_rate", owner: "buyer" });
    }
    if c.bids > 0 {
        if ratio(c.bids_below, c.bids) > 0.5 {
            out.push(Finding { stage: "bids_below_floor", owner: "both" });
        }
        if ratio(c.bids_filtered, c.bids) > 0.5 {
            out.push(Finding { stage: "bids_filtered", owner: "buyer" });
        }
        if ratio(c.wins, c.bids) < min_win_rate {
            out.push(Finding { stage: "low_win_rate", owner: "seller" });
        }
    }
    if c.wins > 0 && ratio(c.impressions, c.wins) < 0.8 {
        out.push(Finding { stage: "wins_not_rendering", owner: "both" });
    }
    out
}
```

The thresholds (0.99 for a guaranteed deal's bid rate, half of bids below the floor or filtered, 80% of wins rendering) are my starting points, not industry figures; each platform tunes them on its own deals. The value of the function is that it reads one day's counters from both sides, which only works if both sides' numbers land in one record.

## How to Build It

The core `deals` table already has the deal ID (`deal_code`), the seller account, an optional single buyer seat, the kind, floor and fixed prices, currency, flight, a `terms` JSONB and status. This chapter promotes the OpenRTB terms that the request path and troubleshooting read into columns, moves the allowed seats into rows, and adds the deal's targeting, curation packages, syncs to buying platforms, and a daily health record. Like the core, it is the seller's side; a DSP keeps the mirror image, with deals it receives keyed by exchange and code.

```sql
ALTER TABLE deals
  ADD COLUMN auction_type_override SMALLINT,     -- deal.at: 1 first price, 2 second price plus, 3 deal price
  ADD COLUMN guaranteed BOOLEAN NOT NULL DEFAULT FALSE,       -- deal.guar
  ADD COLUMN private_auction BOOLEAN NOT NULL DEFAULT TRUE,   -- pmp.private_auction on matching requests
  ADD COLUMN allowed_adomains TEXT[] NOT NULL DEFAULT '{}',   -- deal.wadomain; empty: no restriction
  ADD COLUMN floor_basis TEXT NOT NULL DEFAULT 'net_of_exchange_fee',
  ADD COLUMN min_cpm_per_sec_micros BIGINT,      -- deal.mincpmpersec, video and audio
  ADD COLUMN origin TEXT NOT NULL DEFAULT 'seller',
  ADD COLUMN curator_org_id UUID,
  ADD COLUMN curation_package_id UUID,
  ADD COLUMN booked_impressions BIGINT,          -- programmatic guaranteed quantity
  ADD COLUMN terms_version INT NOT NULL DEFAULT 1;

ALTER TABLE deals ADD CONSTRAINT deals_at_override_check
  CHECK (auction_type_override IS NULL OR auction_type_override IN (1, 2, 3)) NOT VALID;
ALTER TABLE deals ADD CONSTRAINT deals_floor_basis_check
  CHECK (floor_basis IN ('gross', 'net_of_exchange_fee', 'net_of_all_fees')) NOT VALID;
ALTER TABLE deals ADD CONSTRAINT deals_origin_check
  CHECK (origin IN ('seller', 'curator', 'buyer')) NOT VALID;
ALTER TABLE deals ADD CONSTRAINT deals_guaranteed_shape_check
  CHECK (NOT guaranteed OR (kind = 'programmatic_guaranteed' AND booked_impressions IS NOT NULL
    AND auction_type_override = 3)) NOT VALID;
ALTER TABLE deals ADD CONSTRAINT deals_curator_fk
  FOREIGN KEY (curator_org_id) REFERENCES organizations (id) NOT VALID;
ALTER TABLE deals ADD CONSTRAINT deals_curator_required_check
  CHECK (origin <> 'curator' OR curator_org_id IS NOT NULL) NOT VALID;

CREATE TABLE deal_buyer_seats (          -- deal.wseat as rows; replaces the single buyer_seat_id
  deal_id        UUID NOT NULL REFERENCES deals (id),
  buyer_seat_id  UUID NOT NULL REFERENCES buyer_seats (id),
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at     TIMESTAMPTZ,
  PRIMARY KEY (deal_id, buyer_seat_id, added_at)
);

CREATE TABLE deal_targeting (            -- what requests the deal is attached to
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  deal_id        UUID NOT NULL REFERENCES deals (id),
  terms_version  INT NOT NULL,           -- the deals.terms_version this clause belongs to
  dimension      TEXT NOT NULL CHECK (dimension IN ('property', 'ad_unit', 'size', 'format',
                   'country', 'region', 'device_type', 'content_category', 'audience_segment',
                   'context_segment', 'daypart', 'viewability_min')),
  operator       TEXT NOT NULL CHECK (operator IN ('include', 'exclude')),
  property_id    UUID REFERENCES properties (id),
  ad_unit_id     UUID REFERENCES ad_units (id),
  taxonomy       SMALLINT,               -- segtax for segments and categories: 4, 6, 7, or 500+
  value          TEXT,                   -- size, country, segment ID, threshold
  CHECK (dimension <> 'property' OR property_id IS NOT NULL),
  CHECK (dimension <> 'ad_unit' OR ad_unit_id IS NOT NULL),
  CHECK (dimension NOT IN ('audience_segment', 'context_segment', 'content_category')
    OR taxonomy IS NOT NULL)
);

CREATE TABLE curation_packages (         -- a curator's product: inventory plus data, sold as deals
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  curator_org_id      UUID NOT NULL REFERENCES organizations (id),
  platform_org_id     UUID NOT NULL REFERENCES organizations (id),  -- the SSP it runs on
  name                TEXT NOT NULL,
  fees_applied        TEXT NOT NULL DEFAULT 'pre_auction' CHECK (fees_applied IN ('pre_auction',
                        'post_auction')),  -- net bidding, as the MRC standard encourages
  agreement_ref       TEXT NOT NULL,      -- the curator terms version
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended'))
);
-- The fees themselves are fee_terms rows of kind 'curation_fee' scoped to each curated deal
-- (fee_terms.deal_id): the curator's margin, charged by the curator, and the platform's tech fee,
-- charged by the platform to the curator, each a percent of 'clearing_price' or a CPM.

ALTER TABLE deals ADD CONSTRAINT deals_curation_package_fk
  FOREIGN KEY (curation_package_id) REFERENCES curation_packages (id) NOT VALID;

CREATE TABLE deal_syncs (                -- the deal as pushed to each buying platform
  deal_id          UUID NOT NULL REFERENCES deals (id),
  destination_org_id UUID NOT NULL REFERENCES organizations (id),     -- the DSP
  terms_version    INT NOT NULL,         -- what was pushed
  method           TEXT NOT NULL CHECK (method IN ('deals_api', 'vendor_api', 'manual')),
  external_ref     TEXT,                 -- the destination's ID for the deal
  status           TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'active',
                     'paused', 'out_of_date')),
  last_pushed_at   TIMESTAMPTZ,
  last_checked_at  TIMESTAMPTZ,
  error            TEXT,
  PRIMARY KEY (deal_id, destination_org_id)
);

CREATE TABLE deal_health_daily (         -- the funnel, per deal, day and source
  deal_id            UUID NOT NULL REFERENCES deals (id),
  day                DATE NOT NULL,      -- in the deal's contract time zone
  source             TEXT NOT NULL CHECK (source IN ('seller', 'buyer')),
  bid_requests       BIGINT NOT NULL DEFAULT 0,
  bids               BIGINT NOT NULL DEFAULT 0,
  bids_below_floor   BIGINT NOT NULL DEFAULT 0,
  bids_filtered      BIGINT NOT NULL DEFAULT 0,
  bids_lost          BIGINT NOT NULL DEFAULT 0,
  wins               BIGINT NOT NULL DEFAULT 0,
  impressions        BIGINT NOT NULL DEFAULT 0,
  gross_cost_micros  BIGINT NOT NULL DEFAULT 0,   -- what buyers paid
  curator_fee_micros BIGINT NOT NULL DEFAULT 0,
  platform_fee_micros BIGINT NOT NULL DEFAULT 0,
  net_revenue_micros BIGINT NOT NULL DEFAULT 0,   -- what reached the seller
  loss_reasons       JSONB NOT NULL DEFAULT '{}', -- OpenRTB loss code -> count
  findings           TEXT[] NOT NULL DEFAULT '{}',
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (deal_id, day, source)
);

ALTER TABLE invoice_lines DROP CONSTRAINT invoice_lines_kind_check;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_kind_check
  CHECK (kind IN ('media', 'platform_fee', 'data_fee', 'verification_fee', 'ad_serving_fee',
    'revenue_share', 'curation_fee', 'ivt_credit', 'make_good_credit', 'discrepancy_adjustment',
    'rebate', 'tax')) NOT VALID;

CREATE INDEX CONCURRENTLY deals_curator_idx ON deals (curator_org_id) WHERE curator_org_id IS NOT NULL;
```

Design notes:

- **Seats are rows, not a column.** The core `deals.buyer_seat_id` holds one seat; `wseat` is a list, and a seat added or removed mid-flight changes who could bid. `deal_buyer_seats` keeps the history; the core column stays for single-buyer deals during a backfill and is read from the rows afterward.
- **Terms are versioned.** A changed floor, seat list or targeting clause is a new `terms_version`, and `deal_syncs.terms_version` records what each destination has. A destination behind the current version is `out_of_date`, which is the most common reason a "fixed" deal still doesn't spend.
- **Targeting clauses name their taxonomy.** Curated audience and content segments carry the `segtax` value they came from, so a segment ID is never read in the wrong taxonomy and the request path can put the same value in `ext.segtax`.
- **Floors say what they're net of.** `floor_basis` makes the comparison explicit, and the bid path computes the net bid on the same basis before comparing it to the floor.
- **Every fee is its own amount.** The curator's margin and the platform's tech fee are `fee_terms` rows scoped to each curated deal, `deal_health_daily` carries gross, curator fee, platform fee and net per day, and `invoice_lines` gains a `curation_fee` kind (the same word as the fee term's), each line pointing at its term through `fee_term_id`, so a curator's statement, a publisher's payout and a buyer's invoice are all sums of recorded amounts.
- **Both sides' funnels land in one place.** `deal_health_daily` has a `source` so the seller's and the buyer's counts sit side by side; a DSP that shares deal reporting (or a Deals API status) fills the buyer row. The `findings` array holds the diagnosis, and `deal.health_changed` events notify the owning side.
- **Guaranteed deals are checked as guarantees.** A programmatic guaranteed deal carries `booked_impressions`, links to its insertion order through the line item that books it, and is paced and reported like a guaranteed line item; [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) covers delivery.

## Auditing

- **Terms at the time of each impression.** For any impression on a deal, the deal's terms version (price, floor basis, seats, targeting, curator fee) that applied, so a buyer's dispute about a price or a publisher's about a fee is judged against what was configured.
- **What each buying platform was told.** Every push to a DSP, its version and the destination's status, so "the DSP had the old floor" is a fact, not a guess.
- **Fees per curated transaction.** The buyer's gross, each fee with its rate and agreement, and the seller's net, reconcilable to the curator's statement and the publisher's payout; whether fees were applied before or after the auction, which the MRC standard requires to be disclosed where it applies.
- **Deal health over time.** Daily bid rate, win rate and render rate per deal from both sides, with the findings, so a programmatic guaranteed deal that stopped bidding is caught the next day.
- **Who can bid.** The seat history per deal, and every curator a seller blocked or allowed.
- **Changes.** Who changed a deal's floor, targeting or seats and when, in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Key every deal by the system that issued it and its ID,** never by the ID string alone.
- **Model the OpenRTB deal terms as columns** (auction type override, guarantee, seats, advertiser domains, duration floors) and send exactly what is stored.
- **Version deal terms** and track which version each buying platform has; push them with the Deals API where the destination supports it.
- **State what a floor is net of** and compare bids on the same basis.
- **Record every curator and platform fee as its own amount,** apply fees before the auction, and disclose how.
- **Put both sides' deal funnels in one daily record** and diagnose the stage where it breaks, so the right party gets the fix.
- **Treat programmatic guaranteed as a guarantee:** the buyer must bid, the seller must deliver, and both alert when they don't.
- **Apply the same supply checks to curated deals** as to the open auction.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the Pmp and Deal objects (private_auction, id, bidfloor, bidfloorcur, at, wseat, wadomain, guar, mincpmpersec, durfloors), DurFloors and the bid's dealid
- [IAB Tech Lab: OpenRTB 2.x implementation guide](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/implementation.md), the PMP and direct deal use cases, private_auction handling and the M+N bid recommendation
- [IAB Tech Lab: OpenRTB 2.x releases](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/releases), the 2.6-202309 release adding DurFloors and deal attributes
- [IAB Tech Lab: segtax community extension](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/extensions/community_extensions/segtax.md), the taxonomy IDs for segments in user, site and app content data
- [IAB Tech Lab: Deals API](https://iabtechlab.com/standards/dealsapi/), v1.0 finalized February 6, 2026, the push design, scope and limitations
- [IAB Tech Lab: Supply chain foundations](https://iabtechlab.com/standards/supply-chain-foundations/), the Deals API's public comment period to January 31, 2026
- [IAB Tech Lab: Curated Audiences](https://iabtechlab.com/sda/), the December 2024 rename from Seller Defined Audiences, Project Rearc and its building blocks
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), fee and discount disclosure and net bidding, reserve prices through deal IDs, and private auctions not explicitly covered

**Reference**

- [ANA: Programmatic transparency benchmark, third quarter 2025](https://www.ana.net/content/show/id/pr-2025-11-transparency), private marketplaces at 81.6% of programmatic spend

**In practice**

- [Google Ad Manager: About Private Marketplace deals](https://support.google.com/admanager/answer/16536966?hl=en), Preferred Deals and Private Auctions compared, and deal priority numbers
- [Google Ad Manager: Programmatic Guaranteed vs. Preferred Deals](https://support.google.com/admanager/answer/7637485), reserved inventory, buyer obligations, quantities, Sponsorship CPD billing, proposals and random selection between equal Preferred Deals
- [Google Ad Manager: Line item types and priorities](https://support.google.com/admanager/answer/177279?hl=en), the fixed priority value for Preferred Deals
- [Google Ad Manager: Open Bidding](https://support.google.com/admanager/answer/7128453?hl=en), Open Bidding deals competing with Preferred Deals and Private Auctions
- [Google Ad Manager: Pricing rules and the revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors compared to the bid after the revenue share
- [Google Ad Manager: Understand Private Auction troubleshooting](https://support.google.com/admanager/answer/6083218?hl=en), the deal funnel categories, filtered bid and competing demand reasons, and suggested actions
- [Google Ad Manager: Troubleshoot Private Auctions](https://support.google.com/admanager/answer/6309801?hl=en), where the troubleshooting view lives and its RTB-only scope
- [Google Ad Manager: Report metrics](https://support.google.com/admanager/table/7568664?hl=en), deal bid requests, bids, bid rate, win rate and winning bids, and that they aren't tracked for Programmatic Guaranteed
- [Display & Video 360: Troubleshoot your deals and line items](https://support.google.com/displayvideo/answer/6292894?hl=en), the buyer's funnel from available requests to impressions won, filtering reasons and win rate
- [Microsoft Curate: Curated deals](https://learn.microsoft.com/en-us/xandr/curate/curated-deals), curators, fees only on a win, bids net of fees in the seller's final auction, seller controls and curator reporting
- [Microsoft Curate: About Microsoft Curate](https://learn.microsoft.com/en-us/xandr/curate/about-curate), curators' assets and buyers as curators
- [Microsoft Advertising: Empowering businesses for a future that is conversational, personal and agentic (May 2025)](https://about.ads.microsoft.com/en/blog/post/may-2025/empowering-businesses-for-a-future-that-is-conversational-personal-and-agentic), the end of buying through Microsoft Invest from February 28, 2026
- [Magnite: Curator terms](https://www.magnite.com/legal/curatorterms/), the Curator Share, reconciliation adjustments, the $100 payout threshold and the August 24, 2026 update
- [Magnite: Buyers](https://www.magnite.com/buyers/), ClearLine, curated marketplaces and custom auction packages with deal IDs
- [Magnite: Deal Discovery (April 27, 2022)](https://www.magnite.com/press/magnite-launches-deal-discovery/), self-service PMP and auction package creation
- [Index Exchange: Key questions media owners should ask about programmatic curation](https://www.indexexchange.com/index-explains/key-questions-media-owners-should-ask-about-programmatic-curation/), curators building on publishers' rules and fee transparency
- [PubMatic: Connect platform for curation (March 20, 2025)](https://markets.financialcontent.com/minstercommunitypost/article/gnwcq-2025-3-20-pubmatics-connect-platform-for-curation-delivers-for-publishers-drives-25-higher-ecpms-incremental-revenue-and-diverse-demand), Connect's integration with Activate and PubMatic's claimed curated deal results
- [Prebid: Deals for ad ops](https://docs.prebid.org/adops/deals.html), hb_deal keys, deal line item priority and date ranges
- [Prebid.js: setConfig](https://docs.prebid.org/dev-docs/publisher-api-reference/setConfig.html), targetingControls.alwaysIncludeDeals, sending deals along with the winning bid
- [Prebid Server: OpenRTB auction endpoint](https://docs.prebid.org/prebid-server/endpoints/openrtb2/pbs-endpoint-auction.html), the preferdeals and alwaysincludedeals targeting options
