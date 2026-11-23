+++
title = "How Programmatic Works"
nav_title = "Programmatic Basics"
description = "DSPs, SSPs and exchanges, the bid request lifecycle and its latency budget, cookie syncing, and who sees which data at each hop of a programmatic auction."
category = "Advertising Industry"
order = 2914
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "openrtb", "real-time-bidding", "data-model"]
+++

Programmatic advertising is buying and selling ad impressions through software, one impression at a time, in an auction that runs while the page, app or stream waits. A publisher's ad server or SDK asks a supply-side platform (SSP) or exchange to sell an impression; the exchange describes it in a bid request and sends that request to many demand-side platforms (DSPs) at once; each DSP decides for each of its advertisers' campaigns whether the impression is worth buying and at what price; the exchange picks a winner, returns the ad and tells the winner (and sometimes the losers) what happened. IAB and PwC put US programmatic advertising at $162.4 billion in 2025, more than half of the $294.6 billion internet total.

It is hard for three reasons. First, time: the whole round trip has to fit inside what a reader will tolerate before the slot is empty or the video break starts, so every hop gets a budget in milliseconds and anything late is discarded. Second, volume: an exchange sends each impression to many bidders, and most of those requests produce no bid, so the cost of the system is dominated by requests that earn nothing. Third, data: a bid request carries the page, the device, a location and identifiers about a person to every bidder that receives it, including all the ones that lose, and consent law decides which of those fields may leave at all.

This chapter covers the parties and what each one runs, the bid request lifecycle from the ad call to the billing notice, the latency budget and where it goes, cookie syncing and identifier matching, who sees what at each hop, the money and the counts that come out of an auction, and the records a platform keeps. It extends `ad_requests`, `auctions` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The protocol itself, field by field, is [OpenRTB](/books/advertising/openrtb); the buyer's and the seller's systems are [Demand-Side Platforms](/books/advertising/demand-side-platforms) and [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges); header bidding is [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid); deals are [Deals, PMPs & Curation](/books/advertising/deals-and-curation); supply-chain identity is [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain). Auction theory belongs to [Auction Mechanics](/books/advertising/auction-mechanics), identifiers after cookies to [Identifiers After Cookies](/books/advertising/identifiers-after-cookies), and query-per-second engineering to [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale).

## How the Platforms Do It

As of November 2026, from each company's pages and filings. The roles overlap: most large companies run more than one.

| Company | Programmatic roles | What its public pages and filings say |
| --- | --- | --- |
| **Amazon** | DSP, publisher (Prime Video, Twitch, Fire TV), server-side header bidding (TAM/UAM) | Amazon DSP "is now part of Amazon Ads Agent", with programmatic buying through DVA+; TAM charges bidders "a transparent 2.5% service fee" |
| **Google** | DSP (Display & Video 360), exchange (AdX), publisher ad server (Ad Manager), Authorized Buyers for outside bidders | Authorized Buyers takes OpenRTB in JSON or Protobuf and "waits 80 to 1000 ms" for a response "depending on the format and auction type"; Network revenue $29.8 billion in 2025 |
| **Index Exchange** | SSP and exchange | Calls itself a "global supply-side platform"; Index Cloud is a "neutral compute environment for decisioning closer to when impressions originate" |
| **Magnite** | SSP and exchange, CTV ad server (SpringServe) | "The Largest Independent Sell-Side Advertising Company"; 2025 contribution ex-TAC $669.6 million, 45% from CTV |
| **Microsoft** | SSP (Monetize), curation (Curate) | Stopped buying through its DSP, Microsoft Invest, from February 28, 2026, with Amazon DSP as the preferred transition partner |
| **OpenX** | SSP and exchange | "The Intelligent SSP", with curation and deal creation in OpenXSelect |
| **Prebid.org** | Open-source header bidding (Prebid.js, Prebid Server, Prebid Mobile) | Supports "more than 300 demand partners" |
| **PubMatic** | SSP and exchange, buy-side tools (Activate) | "nearly 336.8 trillion impressions processed in 2025" |
| **The Trade Desk** | DSP | 2025 revenue $2,896 million on $13.4 billion of gross spend; OpenPath is "a simplified, direct connection to publishers" |
| **Yahoo** | DSP (Yahoo DSP), premium supply access (Backstage) | Channels across CTV, native, audio, digital out-of-home and display; Backstage offers "a direct path to top-tier supply" |

Three patterns run through the table:

- **The buy side and the sell side are separate businesses with one protocol between them.** Every DSP and every exchange above speaks OpenRTB 2.x; Google's own exchange accepts it in two encodings. What differs is what each side adds around it: the DSP adds budgets, targeting and value prediction; the exchange adds floors, filtering and the supply relationships.
- **The paths are getting shorter.** Buyers connect more directly to publishers (OpenPath, Amazon's TAM, curated marketplaces) and exchanges move decisioning closer to the impression (Index Cloud). Each removes a hop, and with it a fee and some latency.
- **One company in several seats is the central conflict.** The US court found that Google tied its publisher ad server to its exchange; the remedies, covered in [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases), are about what one company holding both sides may do with the other side's data and auctions.

## The Parties and What Each Runs

**The publisher** owns the property and the ad units. It runs a publisher ad server (or an SDK with mediation, in apps, or an SSAI service, in streaming), which holds the direct-sold line items and decides, per request, whether a direct line item or programmatic demand fills the slot. The decision is sketched in [The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression) and covered in depth in [Ad Servers](/books/advertising/ad-servers).

**The SSP or exchange** sells the publisher's impressions to buyers. The terms are used loosely: strictly, the exchange is the marketplace that runs the auction among bidders, and the SSP is the publisher's tool for managing that sale (floors, blocks, deals, reporting). In practice every company in the table does both, and this volume uses "exchange" for the auction and "SSP" for the company. An exchange may also resell another exchange's supply, which is where the supply chain gets long.

**The DSP** buys for advertisers and agencies. It holds the campaigns, line items, budgets, targeting and creatives, receives bid requests from many exchanges, and answers each with a bid or a no-bid. A DSP has seats on exchanges (`buyer_seats`); an agency or advertiser may have its own seat inside the DSP's.

**The data and verification vendors** sit on both sides: identity providers whose identifiers ride in the request, audience data sellers whose segments the DSP buys, and verification vendors that score inventory before the bid and measure the impression after.

**Header bidding wrappers and servers** (Prebid.js, Prebid Server, Amazon TAM) sit between the publisher and several exchanges: they ask many exchanges at once and hand the best answers to the publisher's ad server, which then compares them with its own demand.

The Tech Lab's Programmatic Auction Definitions, finalized June 24, 2026, put the vocabulary on paper: an auction is "the process an entity receiving competing bids uses to qualify, evaluate, and decide which to pursue", and an impression can pass through several of them in a multi-hop chain. That definition is the one the data model uses: every hop that chooses among bids is an `auctions` row.

## The Bid Request Lifecycle

The fullest path is a web display impression sold through header bidding and an exchange. The steps below follow one impression; the times are the budget each step usually gets, and the latency section shows where they come from.

1. **Ad call.** The page's tag (or a wrapper like Prebid.js) builds a request for one or more ad units: sizes or formats, the page URL, the consent strings the consent management platform set, and any first-party identifiers. It sends it to the publisher's ad server and, in header bidding, to several SSPs in parallel, each call carrying the wrapper's timeout.
2. **Exchange receives and enriches.** The SSP looks up the publisher's seller account and ad unit, adds what it knows (its floor for the slot, its blocklists, the publisher's deals, the IP-derived geo, its own user ID for the browser), sets the SupplyChain object with itself as a node, and decides which consent-restricted fields may be sent at all.
3. **Bidder selection (traffic shaping).** The exchange does not send every request to every bidder. It filters by what each DSP said it wants (formats, geos, deals), by each DSP's queries-per-second cap, and by models that predict whether this DSP will bid. Google's Authorized Buyers calls the buyer-declared part pretargeting: buyers "receive requests for only the impressions that match your targeting criteria", and each endpoint "has its own callout limit (in callouts per second)."
4. **Fan-out.** The exchange POSTs an OpenRTB bid request to each selected DSP endpoint, with `tmax` (the "Maximum time in milliseconds the exchange allows for bids to be received", network included), `at` (1 for first price, 2 for "Second Price Plus"), `bidfloor` per impression in CPM, the `pmp` object with any deals, and `source.tid`, a transaction ID every participant sees.
5. **Bid decision.** Each DSP parses the request, checks the seller against ads.txt and the supply chain, checks consent, looks up the user's ID in its sync table, finds the line items whose targeting matches, checks their budgets, pacing and frequency caps, predicts the value of the impression to each, picks the best, shades the price in a first-price auction, and answers with a bid (price, creative, deal ID, advertiser domain) or an HTTP 204.
6. **Exchange auction.** The exchange drops late responses ("All responses received after the deadline will be excluded from the auction", in Google's words), validates the rest (creative approved, advertiser not blocked, price above floor), applies its fee, and picks a winner by price.
7. **Return to the ad server.** In header bidding, the SSP returns its winner to the wrapper, which passes the best bids to the publisher's ad server as key-values; the ad server compares them with its direct line items and its own exchange ([The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression)).
8. **Notices.** The exchange calls the winner's win notice URL (`nurl`), which OpenRTB says is "not necessarily indicative of a delivered, viewed, or billable ad", and losers' loss notice URLs (`lurl`) where its policy allows.
9. **Render and count.** The creative renders; the impression counts on begin-to-render; trackers fire. The exchange calls the billing notice URL (`burl`) when the win "becomes billable based on exchange-specific business policy", and for video the VAST impression event is the billable signal.
10. **Roll-up.** Every party writes its own count into its own daily roll-up, and reconciliation compares them later.

A CTV pod, an in-app request through mediation and a direct deal run the same steps with different entry points: the SSAI service or the SDK makes the ad call, and a programmatic guaranteed deal skips the competition at step 6 but still sends a bid request and expects a bid.

### What a bid request looks like

A trimmed OpenRTB 2.6 request for one display impression on a news site, as an exchange sends it to a DSP. Every field is defined in [OpenRTB](/books/advertising/openrtb):

```json
{
  "id": "0198c2a4-5f1e-7b3a-9d2e-4a1c8f0b6e21",
  "at": 1,
  "tmax": 250,
  "cur": ["USD"],
  "imp": [{
    "id": "1",
    "tagid": "homepage-top",
    "banner": { "format": [{ "w": 300, "h": 250 }, { "w": 300, "h": 600 }] },
    "bidfloor": 0.85,
    "bidfloorcur": "USD",
    "secure": 1,
    "pmp": { "private_auction": 0, "deals": [{ "id": "NEWS-SPORTS-Q4", "bidfloor": 6.0, "at": 1 }] }
  }],
  "site": {
    "domain": "news.example",
    "page": "https://news.example/sports/story-123",
    "publisher": { "id": "pub-4411" }
  },
  "device": { "ua": "Mozilla/5.0 ...", "ip": "203.0.113.0", "devicetype": 2, "geo": { "country": "USA", "region": "CA" } },
  "user": { "buyeruid": "dsp-user-8f3a", "eids": [{ "source": "uidapi.com", "uids": [{ "id": "A4AAAB...", "atype": 3 }] }] },
  "source": {
    "tid": "0198c2a4-5f1e-7b3a-9d2e-4a1c8f0b6e20",
    "schain": { "complete": 1, "ver": "1.0", "nodes": [{ "asi": "ssp.example", "sid": "pub-4411", "hp": 1 }] }
  },
  "regs": { "coppa": 0, "gpp": "DBABLA~BVQqAAAAAgA.QA", "gpp_sid": [7] }
}
```

The IP is truncated, the user ID is the DSP's own ID for this browser (`buyeruid`, which the exchange knows from a cookie sync), the UID2 token is in `eids`, and the US national GPP section is applicable. Every bidder that receives this request sees all of it, whether it bids or not.

## The Latency Budget

A programmatic impression has a deadline set by the person waiting for it, and every hop spends part of it. The numbers below are the public ones; the rest is an illustration.

**What the standards and platforms publish.** OpenRTB's `tmax` is the exchange's deadline to the bidder, in milliseconds, including "Internet latency", so a DSP that is 40 ms away by network has 40 ms less to think. Google's Authorized Buyers waits "80 to 1000 ms" depending on the format and auction type. Prebid's configuration documents a `bidderTimeout` for the whole header auction (its example sets 3000 ms) and warns that a timeout can trigger later than set, because the browser's event loop is busy. Each layer's timeout must be shorter than the one above it, or the layer above gives up before the layer below answers ([Every Call Has a Timeout](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout)).

**An illustrative display budget.** For a page that gives its header auction 1,000 ms, a plausible split, as an example rather than a market standard, looks like this:

| Step | Example share | What spends it |
| --- | --- | --- |
| Tag loads, wrapper builds requests | 50-150 ms | Script download and execution on the reader's device |
| Browser to SSP | 30-100 ms | Network from the device, TLS, the SSP's edge |
| SSP enrichment and shaping | 5-20 ms | Lookups, floors, consent checks, bidder selection |
| SSP to DSPs and back (`tmax`) | 100-300 ms | Network both ways plus the DSP's decision |
| SSP auction and response | 5-20 ms | Validation, fee, ranking, serialization |
| SSP to browser | 30-100 ms | Network back to the device |
| Ad server decision | 50-150 ms | The ad server call with header bids as key-values |
| Creative render | 100-500 ms | Creative and tracker downloads |

The shape matters more than the numbers: the bidder's own thinking time is a small slice in the middle, the network to and from the device is the largest controllable cost, and the creative's own weight decides whether the impression counts at all. Server-side header bidding moves the fan-out off the device (one call from the browser to Prebid Server, many from the server to SSPs), which is why Prebid Server's own documentation lists app, AMP, CTV, digital out-of-home and audio as its uses: environments where a browser fan-out is impossible or too slow. <!-- source-gap: adv-latency-split | missing | a public, dated measurement of how a programmatic display auction's latency splits across hops | closes with: an IAB Tech Lab, Prebid.org or exchange publication with measured per-hop latencies | checked: 2026-11-22 -->

**Where a DSP's budget goes.** Inside `tmax`, the DSP pays for its network distance first, then its own parsing and lookups, then candidate selection and value prediction. A DSP colocates bidders with exchanges for this reason: Google publishes four trading locations (North America East and West, Europe and Asia Pacific) and lets a buyer run up to 8 endpoints in each. A response that arrives 1 ms after the deadline is the same as no response, and costs the DSP the compute it spent; the bidder's own timer should stop short of `tmax` minus its measured network time and answer 204.

**What a timeout costs the seller.** A request that times out is lost demand for the publisher and wasted bandwidth for both. Exchanges therefore track each bidder's response time and timeout rate and throttle the slow ones: Google says "if an endpoint has high callout error rate, the system lightens its load." The record that makes this measurable is one row per bidder per auction with its latency and status, which this chapter adds below.

### The fan-out, in code

An exchange's fan-out is a scatter-gather with a hard deadline: send to every selected bidder at once, collect what arrives before the deadline, cancel the rest, and record every outcome. The sketch keeps a safety margin for the exchange's own auction and response.

```go tab="Go"
package fanout

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type Bidder struct {
	ID       string
	Endpoint string
}

type Outcome struct {
	BidderID  string
	Status    string // "bid", "no_bid", "timeout", "error"
	Latency   time.Duration
	HTTPCode  int
	Body      json.RawMessage
}

// Fanout sends one request body to every bidder and returns every outcome by the deadline.
// tmax is what the request advertises to bidders; margin is kept for the exchange's own work.
func Fanout(ctx context.Context, client *http.Client, bidders []Bidder, body []byte,
	tmax, margin time.Duration) []Outcome {
	ctx, cancel := context.WithTimeout(ctx, tmax-margin)
	defer cancel()

	results := make(chan Outcome, len(bidders))
	for _, b := range bidders {
		go func(b Bidder) {
			start := time.Now()
			req, err := http.NewRequestWithContext(ctx, http.MethodPost, b.Endpoint, bytes.NewReader(body))
			if err != nil {
				results <- Outcome{BidderID: b.ID, Status: "error"}
				return
			}
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("x-openrtb-version", "2.6")
			resp, err := client.Do(req)
			lat := time.Since(start)
			if err != nil {
				status := "error"
				if ctx.Err() != nil {
					status = "timeout"
				}
				results <- Outcome{BidderID: b.ID, Status: status, Latency: lat}
				return
			}
			defer resp.Body.Close()
			o := Outcome{BidderID: b.ID, Latency: lat, HTTPCode: resp.StatusCode}
			switch resp.StatusCode {
			case http.StatusNoContent:
				o.Status = "no_bid"
			case http.StatusOK:
				var raw json.RawMessage
				if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
					o.Status = "error"
					if ctx.Err() != nil {
						o.Status = "timeout"
					}
				} else {
					o.Status, o.Body = "bid", raw
				}
			default:
				o.Status = "error"
			}
			results <- o
		}(b)
	}

	out := make([]Outcome, 0, len(bidders))
	for range bidders {
		out = append(out, <-results) // every goroutine reports once; late ones report "timeout"
	}
	return out
}
```

```rust tab="Rust"
use std::time::{Duration, Instant};

use futures::future::join_all;
use reqwest::{Client, StatusCode};
use serde_json::Value;

pub struct Bidder {
    pub id: String,
    pub endpoint: String,
}

pub struct Outcome {
    pub bidder_id: String,
    pub status: &'static str, // "bid", "no_bid", "timeout", "error"
    pub latency: Duration,
    pub http_code: Option<u16>,
    pub body: Option<Value>,
}

/// Sends one request body to every bidder and returns every outcome by the deadline.
/// `tmax` is what the request advertises; `margin` is kept for the exchange's own work.
pub async fn fanout(client: &Client, bidders: &[Bidder], body: &[u8], tmax: Duration,
    margin: Duration) -> Vec<Outcome> {
    let deadline = tmax - margin;
    let calls = bidders.iter().map(|b| async move {
        let start = Instant::now();
        let send = async {
            let resp = client
                .post(&b.endpoint)
                .header("Content-Type", "application/json")
                .header("x-openrtb-version", "2.6")
                .body(body.to_vec())
                .send()
                .await?;
            let code = resp.status();
            let parsed = if code == StatusCode::OK { Some(resp.json::<Value>().await?) } else { None };
            Ok::<_, reqwest::Error>((code, parsed))
        };
        let (status, http_code, body) = match tokio::time::timeout(deadline, send).await {
            Err(_) => ("timeout", None, None),
            Ok(Err(_)) => ("error", None, None),
            Ok(Ok((StatusCode::NO_CONTENT, _))) => ("no_bid", Some(204), None),
            Ok(Ok((StatusCode::OK, v))) => ("bid", Some(200), v),
            Ok(Ok((code, _))) => ("error", Some(code.as_u16()), None),
        };
        Outcome { bidder_id: b.id.clone(), status, latency: start.elapsed(), http_code, body }
    });
    join_all(calls).await
}
```

Two rules the sketch encodes. The deadline is the exchange's, not each bidder's: one context or timer covers the whole fan-out, so a slow bidder can't stretch it. And every bidder produces an outcome, including the ones that timed out, because the timeout rate per bidder is what traffic shaping and the bidder's own dashboard both need.

## Cookie Syncing and Matching Identifiers

A DSP can only use what it knows about a browser if it can recognize the browser in a bid request, and the exchange's cookie is not the DSP's cookie: browsers don't let one domain read another's. Cookie syncing (cookie matching) is the workaround: on some page load, a pixel or redirect chain passes the exchange's ID for the browser to the DSP's domain, or the other way, so each side can store the pair and the exchange can put the DSP's ID in later requests as `user.buyeruid`.

Google documents the flows plainly. In the bidder-initiated, bidirectional flow, the bidder places a match tag pointing at `https://cm.g.doubleclick.net/pixel?google_nid=...&google_cm`, Google answers with a 302 to the bidder's URL carrying `google_gid` (the Google user ID, a web-safe base64 string) and `google_cver`, and the bidder stores the pair and answers with a 1x1 pixel or a 204. In the unidirectional, hosted flow the bidder redirects to Google with `google_hm`, at most 40 bytes of its own data, and Google stores it in a hosted match table and returns it in each bid request as `user.buyeruid`. Google asks bidders not to resync users whose hosted entry is fresh (an entry "may be considered expired in 14 days"), throttles pixel-matching bidders whose response rate falls below 90%, and omits the Google user ID for users in US states with privacy restrictions while still sending the hosted match data. Prebid.js runs the same idea from the publisher's side: its user sync settings decide which bidders may drop sync pixels or iframes, how many, and after how long.

OpenRTB records how an identifier was matched: the EID object's `mm` field uses AdCOM's match methods, where 2 is "Browser Cookie Sync", 3 "Authenticated", 4 "Observed" and 5 "Inference", and `atype` separates browser IDs (1), in-app device IDs (2) and person-based IDs "same across devices" (3).

Syncing only works where third-party cookies do. Safari has blocked "cookies for cross-site resources" by default since March 24, 2020, and Firefox gives each site "a separate 'cookie jar'" by default since June 14, 2022. Chrome did not follow: Google announced in April 2025 that it would not roll out a standalone third-party cookie prompt, and on October 17, 2025 retired most Privacy Sandbox advertising APIs, including Protected Audience, Topics and the Attribution Reporting API, so in regular Chrome third-party cookies remain on by default as of November 2026 (Incognito blocks them). The practical result is that cookie sync still feeds a large share of web bidding in Chrome and fails silently in Safari and Firefox, which is why match rates differ by browser and why identifiers that don't depend on third-party cookies (UID2, ID5, RampID, publisher-provided IDs) ride in `user.eids` alongside it. [Identifiers After Cookies](/books/advertising/identifiers-after-cookies) covers those; [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy) covers the browsers.

The engineering rules for a sync table follow from the privacy rules. A sync row is personal data: it links two pseudonymous identifiers, and [Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous). It may be created only under the consent state at the time of the sync (a TCF string with the partner's vendor consent, no GPC or opt-out of sharing in states that require one), it expires, and an opt-out or a deletion request must reach it ([Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools)). The table is a [crosswalk of external IDs](/docs/building-blocks/record-linkage#crosswalks-of-external-ids), one row per partner and local ID, never a merge of the two into one person.

## Who Sees What

A bid request is a broadcast. Every bidder that receives it learns that this browser or device, at this coarse location, is on this page or app now, with these identifiers and this consent state, whether it bids or not. That is the core privacy concern regulators have raised about real-time bidding, and it is why the request is shaped per bidder rather than sent identically to all.

| Party | Sees | Does not see (by default) |
| --- | --- | --- |
| Publisher's ad server | Everything about its own request; every header bid's price and bidder; the winner | What each DSP would have paid in an exchange's auction it didn't run |
| SSP or exchange | The request as the publisher or upstream exchange sent it; every bid it received, with price, creative and advertiser; its own fee | Other exchanges' bids in a header auction (unless told); the DSP's targeting and value |
| Each DSP | The request as that exchange shaped it for that DSP; whether it won; the clearing price on a win (through the `${AUCTION_PRICE}` macro); a loss reason and sometimes the minimum to win (`${AUCTION_MIN_TO_WIN}`) | Other DSPs' bids; the publisher's direct line items; whether the impression later rendered unless it counts itself |
| Advertiser and agency | The DSP's reports; their own ad server's and verification vendor's counts | The exchange's fee and the publisher's share, unless log-level data or a fee disclosure gives them |
| Verification vendor | What its tag or pre-bid integration observes | The auction |

Three consequences for the system:

- **Shape the request per bidder under consent.** The exchange decides, per bidder, which fields it may send: under the TCF, a vendor without consent or legitimate interest for the purposes it needs gets no personal data; under a US opt-out of sale or sharing, identifiers are stripped for bidders that would receive them as a sale. The consent rules are [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) and [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs); the generic rule is [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection).
- **Losers learn as much as winners.** A DSP that bids on nothing still receives the page and identifiers. An exchange can limit this with contract terms (no profiles built from bid requests a bidder didn't win), with truncated IPs and coarse geos, and with fewer bidders per request.
- **Price information is an asset.** The court record in the US case turned partly on bid data: it found that Google's Last Look let AdX see the winning header bid and outbid it, and the remedies require rival ad servers to receive AdX bids on the same terms and publishers to get AdX bid data including losing bids ([The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases)). Who may see which bid is a policy, so it belongs in versioned configuration, not code.

## The Money and the Counts

An auction produces one price and several shares of it. With a DSP winning at a $5.00 CPM in a first-price auction on an exchange whose fee is 15% (an example rate), the money moves like this for one impression:

| Line | Per impression | Recorded as |
| --- | --- | --- |
| DSP's bid and clearing price (first price) | $0.005000 | `bids.price_cpm_micros = 5000000`, `auctions.clearing_cpm_micros = 5000000` |
| Exchange fee, 15% | $0.000750 | An amount computed from the fee term in force (`fee_terms`) |
| Net to the publisher | $0.004250 | The value the publisher's ad server compares with its other demand |
| DSP platform fee on top, 20% of media | $0.001000 | Charged to the advertiser by the DSP, outside the auction |
| Advertiser's cost | $0.006000 | The DSP's gross spend for this impression |

The publisher sees $4.25 CPM, the advertiser pays $6.00 CPM, and $1.75 CPM goes to the two platforms; the ratio of what the publisher receives to what the advertiser pays is the "working media" share the ANA and ISBA studies measure. In Google Ad Manager the floor applies to the net value: on an 80/20 revenue share, a $1.00 bid is worth $0.80 against the floor. In a second-price auction (OpenRTB's `at = 2`, "Second Price Plus"), the winner pays the second-highest bid plus a small increment, so the clearing price differs from the bid and both are recorded; the industry moved to first price, and Google Ad Manager, having announced a unified first-price auction in March 2019, said on September 5, 2019 that the full rollout to all partners would begin the following week. The fee mechanics are in [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) and the take-rate studies in [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality).

Every party also keeps its own count. The exchange counts on the billing notice it fires; the DSP counts on its impression pixel or on the exchange's billing notice; the publisher counts in its ad server; the advertiser's ad server and verification vendor count again. These counts are `delivery_daily` rows with different `source` values, and they never agree exactly ([How the Money Splits](/books/advertising/advertising-business#how-the-money-splits)).

## How to Build It

The core model already has the request, the auction and the bid. Programmatic adds the hop between them that the core model leaves implicit: one callout per bidder per auction, with its timing and outcome, which is what latency budgets, traffic shaping and bidder dashboards are computed from. It also adds the sync table that turns an exchange's user ID into a bidder's, and records on the request and the auction of where the request came from and how many bidders it reached. The connection a callout goes to (`bidder_connections`) is defined in [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges#how-to-build-it), which adds the foreign key.

```sql
ALTER TABLE ad_requests
  ADD COLUMN entry_point TEXT,           -- how the request reached this system
  ADD COLUMN upstream_org_id UUID,       -- the publisher, wrapper host or exchange that sent it
  ADD COLUMN channel TEXT,               -- 'web', 'app', 'ctv', 'audio', 'dooh'
  ADD COLUMN source_tid TEXT;            -- OpenRTB source.tid, shared by every hop
-- NOT VALID: new rows checked now; validate after backfill without blocking writes
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_entry_point_check CHECK (entry_point IN (
  'tag', 'sdk', 'ssai', 'prebid_server', 'header_wrapper', 'exchange_s2s')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_channel_check CHECK (channel IN (
  'web', 'app', 'ctv', 'audio', 'dooh')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_upstream_org_fk
  FOREIGN KEY (upstream_org_id) REFERENCES organizations (id) NOT VALID;

ALTER TABLE auctions
  ADD COLUMN tmax_ms INT,                -- the deadline advertised to bidders
  ADD COLUMN bidders_called INT,         -- callouts sent
  ADD COLUMN bidders_responded INT;      -- callouts answered before the deadline, bid or no bid

CREATE TABLE bid_requests (              -- one callout to one bidder for one auction
  id                  UUID NOT NULL DEFAULT uuidv7(),
  sent_at             TIMESTAMPTZ NOT NULL,
  auction_started_at  TIMESTAMPTZ NOT NULL,
  auction_id          UUID NOT NULL,
  bidder_org_id       UUID NOT NULL REFERENCES organizations (id),  -- the DSP or downstream exchange
  bidder_connection_id UUID,             -- FK added in SSPs & Ad Exchanges
  tmax_ms             INT NOT NULL CHECK (tmax_ms > 0),
  status              TEXT NOT NULL CHECK (status IN ('bid', 'no_bid', 'timeout', 'error',
                        'invalid_response')),
  http_status         SMALLINT,          -- 200, 204, 400, 5xx; null on timeout
  no_bid_reason       SMALLINT,          -- the response's nbr, a list code
  latency_ms          INT,               -- send to last byte, as this system measured it
  bids_returned       SMALLINT NOT NULL DEFAULT 0,
  personal_data_sent  BOOLEAN NOT NULL,  -- identifiers or precise geo left in this bidder's copy
  fields_removed      TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'user.eids','device.ifa'} under consent rules
  request_bytes       INT,
  PRIMARY KEY (sent_at, id),
  FOREIGN KEY (auction_started_at, auction_id) REFERENCES auctions (started_at, id),
  CHECK (status <> 'bid' OR bids_returned > 0)
) PARTITION BY RANGE (sent_at);          -- hourly, like the other logs

CREATE TABLE user_id_syncs (             -- this system's ID for a browser or device, paired with a partner's
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_org_id     UUID NOT NULL REFERENCES organizations (id),
  local_user_key     TEXT NOT NULL,      -- this system's pseudonymous ID (cookie or device-scoped)
  partner_user_id    TEXT NOT NULL,      -- what the partner calls it; sent as buyeruid or received as one
  host               TEXT NOT NULL CHECK (host IN ('this_system', 'partner')),  -- who keeps the match table
  match_method       SMALLINT NOT NULL DEFAULT 2,  -- AdCOM ID match method; 2 = browser cookie sync
  consent_tcf        TEXT,               -- the TC string the sync was made under, where GDPR applied
  consent_gpp        TEXT,
  synced_at          TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  revoked_at         TIMESTAMPTZ,        -- opt-out, deletion request or partner offboarding
  UNIQUE (partner_org_id, local_user_key),
  CHECK (expires_at > synced_at)
);

-- On the partitioned logs: index each partition CONCURRENTLY, then attach to an ON ONLY parent index.
CREATE INDEX bid_requests_bidder_idx ON ONLY bid_requests (bidder_org_id, sent_at);
-- for each hourly partition p:
--   CREATE INDEX CONCURRENTLY bid_requests_p_bidder_idx ON bid_requests_p (bidder_org_id, sent_at);
--   ALTER INDEX bid_requests_bidder_idx ATTACH PARTITION bid_requests_p_bidder_idx;
```

The bidder health view an exchange watches, and every DSP asks for, is a roll-up of the callouts:

```sql
-- Per bidder and hour: volume, bid rate, timeout rate and latency percentiles.
SELECT bidder_org_id,
       date_trunc('hour', sent_at)                                       AS hour,
       count(*)                                                          AS callouts,
       round(100.0 * count(*) FILTER (WHERE status = 'bid') / count(*), 2)     AS bid_rate_pct,
       round(100.0 * count(*) FILTER (WHERE status = 'timeout') / count(*), 2) AS timeout_pct,
       percentile_cont(0.5)  WITHIN GROUP (ORDER BY latency_ms)          AS p50_ms,
       percentile_cont(0.99) WITHIN GROUP (ORDER BY latency_ms)          AS p99_ms
FROM bid_requests
WHERE sent_at >= now() - interval '24 hours'
GROUP BY 1, 2
ORDER BY 1, 2;
```

Design notes:

- **The callout is its own record.** An auction with twelve bidders called, nine answered and two bids is one `auctions` row, twelve `bid_requests` rows and two `bids` rows. Without the callouts, a timeout and a no-bid look the same, and traffic shaping has nothing to learn from.
- **Sample callouts, keep bids.** Most callouts end in a no-bid, so callouts far outnumber bids; keep every callout for a short window and a sample after it, and keep every bid and auction for the billing and dispute period, as the core model's design notes describe for requests.
- **Record what each bidder was sent, not just what was received.** `personal_data_sent` and `fields_removed` show, per bidder, which consent rule shaped its copy of the request; that is the answer to a regulator asking which vendors received a user's identifiers on a given day.
- **One transaction ID across hops.** `source_tid` is the same at every exchange the request passes through, so it is the join key for multi-hop paths and for deduplicating the same impression offered by several SSPs in a header auction.
- **Sync rows are consented, expiring and revocable.** A sync is created under the consent state at the time, carries that state, expires (Google's guidance treats a hosted entry as stale after 14 days), and is revoked by an opt-out or a deletion; a revoked row is never sent as `buyeruid` again.
- **The deadline is configuration.** `tmax_ms` per auction comes from the ad unit, channel and entry point, and the margin the exchange keeps for itself is a versioned setting; changes to either show up in the bidder health view immediately.

## Auditing

- **Every callout, by bidder.** Which bidders were sent each request, with what deadline, what came back and how long it took, so a DSP's claim that it was "throttled" or a publisher's question about lost demand can be answered from records.
- **What each bidder received.** The fields removed under consent and opt-out rules per bidder and request, kept for the period a data protection authority or state attorney general can ask about.
- **Every sync, with its consent.** Partner, local and partner IDs, the consent strings at sync time, expiry and revocation, so the reach of an opt-out can be shown.
- **Every auction and bid.** The type, floor, bids, winner, clearing price and fee, as the core model requires; the MRC's auction transparency standards require disclosing the auction type and how a bid becomes a clearing price (written for closed-loop auctions) and the transaction ID, placement ID and supply chain over OpenRTB.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Give every hop a deadline shorter than the one above it,** and stop the bidder's own timer short of `tmax` minus its network time.
- **Record one row per callout** with status, latency and no-bid reason, and roll it up per bidder per hour.
- **Shape each bidder's copy of the request under consent** and record what was removed.
- **Treat sync tables as personal data:** consented, expiring, revocable and never merged into a person.
- **Carry `source.tid` through every hop** and use it to join multi-hop paths and deduplicate offers.
- **Record the bid, the clearing price and every fee separately,** and compute each party's share as a sum.
- **Keep each party's count as its own row;** the auction's winner is not the billable impression.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), tmax, at, bidfloor, pmp, source.tid and schain, user.buyeruid and eids, nurl, lurl and burl, the auction price and minimum-to-win macros, HTTP POST and 204 for no bid
- [IAB Tech Lab: AdCOM 1.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/AdCOM/main/AdCOM%20v1.0%20FINAL.md), agent types and ID match methods including browser cookie sync
- [IAB Tech Lab: Programmatic Auction Definitions](https://iabtechlab.com/standards/programmatic-auction-definitions/), finalized June 24, 2026
- [IAB Tech Lab: Programmatic Auction Definitions on GitHub](https://github.com/InteractiveAdvertisingBureau/programmatic-auction-definitions), the auction definition and multi-hop supply chains
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), disclosure of auction type and bid-to-clearing conversion for closed-loop auctions, tid, gpid and schain for OpenRTB

**Reference**

- [Google Authorized Buyers: Get started with real-time bidding](https://developers.google.com/authorized-buyers/rtb/start), OpenRTB in JSON and Protobuf and the 80 to 1000 ms response deadline
- [Google Authorized Buyers: Pretargeting](https://developers.google.com/authorized-buyers/rtb/target-guide), pretargeting, four trading locations, up to 8 endpoints, callout limits and load reduction on high error rates
- [Google Authorized Buyers: Cookie matching](https://developers.google.com/authorized-buyers/rtb/cookie-guide), match tag flows, google_gid and google_hm, hosted match tables, buyeruid, the 14-day freshness guidance, the 90% response rule and US state omissions
- [Google Ad Manager Help: Floors and revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors applied to the bid's value after revenue share
- [Google Ad Manager: Rolling out first price auctions (September 5, 2019)](https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/), the move to a unified first-price auction announced in March and the full rollout starting the following week
- [Prebid.org: Introduction to Prebid](https://docs.prebid.org/overview/intro.html), Prebid.js, Prebid Server and Prebid Mobile and more than 300 demand partners
- [Prebid.org: Prebid Server overview](https://docs.prebid.org/prebid-server/overview/prebid-server-overview.html), server-to-server header bidding for app, AMP, CTV, DOOH and audio
- [Prebid.org: setConfig reference](https://docs.prebid.org/dev-docs/publisher-api-reference/setConfig.html), bidderTimeout and user sync settings
- [WebKit: Full third-party cookie blocking and more](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/), Safari blocking cross-site cookies by default from March 24, 2020
- [Mozilla: Total Cookie Protection by default](https://blog.mozilla.org/en/products/firefox/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/), per-site cookie jars by default from June 14, 2022
- [Google Privacy Sandbox: Next steps (April 22, 2025)](https://privacysandbox.google.com/blog/privacy-sandbox-next-steps), no standalone third-party cookie prompt; Incognito blocks third-party cookies
- [Google Privacy Sandbox: Update on plans for Privacy Sandbox technologies (October 17, 2025)](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), the retired APIs
- [Amazon Ads: Amazon DSP](https://advertising.amazon.com/solutions/products/amazon-dsp), Amazon DSP as part of Amazon Ads Agent and DVA+
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), server-to-server header bidding and the 2.5% bidder fee
- [Microsoft Advertising: May 2025 update](https://about.ads.microsoft.com/en/blog/post/may-2025/empowering-businesses-for-a-future-that-is-conversational-personal-and-agentic), Microsoft Invest buying ending February 28, 2026
- [Microsoft Advertising: Collaboration with Amazon (October 2025)](https://about.ads.microsoft.com/en/blog/post/october-2025/unlocking-more-opportunities-for-partners-and-customers-through-collaboration-with-amazon), Amazon DSP as preferred transition partner
- [Index Exchange](https://www.indexexchange.com/), self-description and Index Cloud
- [Magnite](https://www.magnite.com/), self-description and channels
- [OpenX](https://www.openx.com/), self-description and OpenXSelect
- [Yahoo DSP](https://www.yahooinc.com/yahoo-dsp), channels and Backstage premium supply access

**Filings**

- [IAB and PwC: Internet Advertising Revenue Report, full year 2025](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), $294.6 billion total and $162.4 billion programmatic
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Network revenue
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), gross spend, net revenue reporting and OpenPath
- [The Trade Desk: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend
- [Magnite: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), contribution ex-TAC and the CTV share
- [PubMatic: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000008/fy25pressrelease.htm), impressions processed in 2025

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), First Look and Last Look
