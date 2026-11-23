+++
title = "OpenRTB"
description = "The OpenRTB 2.6 objects and releases through 2.6-202611, AdCOM and 3.0, win, billing and loss notices, macros, auction types, extensions, video and native."
category = "Advertising Industry"
order = 2915
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "openrtb", "standards", "data-model"]
+++

OpenRTB is the protocol exchanges and bidders use to buy one impression: a JSON (or Protobuf) bid request POSTed by the exchange, a bid response from the bidder, and a set of URLs the exchange calls afterward to say the bid won, lost or became billable. It is maintained by IAB Tech Lab, and it is the one interface every company in [How Programmatic Works](/books/advertising/how-programmatic-works) shares: a DSP that bids on twenty exchanges reads twenty dialects of the same objects, and an exchange that calls two hundred bidders writes one.

The protocol is easy to read and hard to implement well. Most fields are optional, many are "recommended", enumerations live in a separate document, every exchange adds its own extensions, the version on the wire has been 2.6 for four years while the specification gets near-monthly releases, and the meaning of the most important event, when an impression becomes billable, is left to "exchange-specific business policy". A bidder that treats the specification as a contract will be wrong in production; a bidder that treats each exchange's integration guide as the contract and the specification as its vocabulary will be right.

This chapter covers the versions and their status (2.6 and its releases through 2.6-202611, AdCOM, and 3.0), the request and response objects field by field where it matters, the auction types, deals, consent and supply-chain fields, video, audio and native, the win, billing and loss notices and their macros, no-bid and loss reason codes, extensions and transport, and what a system stores. It extends `ad_requests` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the `bid_requests` callout table from [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it). Deals in depth are [Deals, PMPs & Curation](/books/advertising/deals-and-curation); `source.schain` is [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain); identifiers in `user.eids` are Identifiers After Cookies; the consent strings are Consent Management & the TCF and GPP, GPC & US Opt-Outs; ad pods are Server-Side Ad Insertion & Ad Pods; VAST is VAST & Video Ads.

## How the Platforms Do It

As of November 2026, from each platform's public bidder documentation and the specification's repository:

| Implementer | Role | What its public pages say about OpenRTB |
| --- | --- | --- |
| **Google Authorized Buyers** | Exchange (AdX) calling outside bidders | "Authorized Buyers supports two RTB protocols": OpenRTB in Protobuf and OpenRTB in JSON; response deadline "80 to 1000 ms" |
| **IAB Tech Lab** | Standards body | "OpenRTB version history is now fully maintained in Github"; 2.6 releases from 2.6-202210 to 2.6-202611 |
| **Microsoft (Xandr) Monetize** | SSP | Documents CTV request parameters, including `ifa_type` values (`aaid`, `idfa`, `rida`, `tifa`, `vida` and others) for streaming inventory |
| **Prebid Server** | Open-source header bidding server | "an open-source solution for server-to-server header bidding", in Go and Java versions |

Two patterns:

- **2.6 is the protocol.** Tech Lab's own supply-chain page lists OpenRTB v2.6.x as current, the repository publishes 2.6 releases through November 18, 2026, and I found no exchange that documents a 3.0 bidder integration. OpenRTB 3.0 exists (dated March 2022) and is not what is shipped.
- **Exchanges publish the contract.** OpenRTB tells exchanges to publish their extensions to bidders and leaves billing policy, loss-notice support and macro encryption to them, so every integration starts from the exchange's guide.

## Versions and Status

**2.x.** OpenRTB 2.0 combined display, mobile and video into one specification; 2.5 added header bidding signals, billing and loss notices, Flex Ads, impression metrics and out-stream video; 2.6 "Introduces Ad Pods for CTV transactions, a structured User-Agent object and other minor enhancements." The specification states the versioning rule that makes the rest possible: "OpenRTB's version number is only incremented on breaking changes", and recipients must tolerate fields and enumeration values they don't know.

**The 2.6 releases.** Since November 2022 Tech Lab ships dated, non-breaking releases of 2.6 on GitHub:

| Release | What it added |
| --- | --- |
| 2.6-202210 | The baseline, matching the April 2022 2.6 text |
| 2.6-202211 | Digital out-of-home (`dooh`) and GPP signals (`regs.gpp`, `gpp_sid`) |
| 2.6-202303 | Ad refresh signaling and `plcmt`, deprecating the old video `placement` |
| 2.6-202309 | Allowed advertiser categories (`acat`), duration floors (`durfloors`) and deal attributes |
| 2.6-202402 | Pod deduplication (`poddedupe`) |
| 2.6-202409 | EID `inserter`, `matcher` and `mm` (match method) |
| 2.6-202501 | `gtax` and `genres` for content taxonomies |
| 2.6-202505 | `cids` |
| 2.6-202606 | `realtime`, `firstbroadcast` and discount macros |
| 2.6-202611 | SupplyChain 1.1 with new `complete` values, JSONPath locations, CTV ad portfolio signaling guidance (November 18, 2026) |

A bidder declares and reads the version in the `x-openrtb-version` header ("x-openrtb-version: 2.6"), and the release a given exchange implements is a line in its integration guide, not on the wire. My rule: record, per bidder connection, which 2.6 release the exchange claims and which optional objects it actually sends, and parse every field as optional.

**AdCOM.** In 2.6, "all enumerated lists" moved to AdCOM (Advertising Common Object Model), the shared vocabulary also used by 3.0: device types, creative attributes, API frameworks, placement types, agent types and ID match methods. A 2.6 bidder needs the AdCOM list document as much as the 2.6 text.

**3.0.** OpenRTB 3.0 (the document is dated March 2022) is a redesign: layered into transport, format, transaction and domain (AdCOM) layers, a new root `openrtb` wrapper, `Item` instead of `Imp`, HTTPS with TLS 1.2 or later required, and beta fields for signed requests under ads.cert (`ds`, `dsmap`, `cert`, `digest`). It is not drop-in compatible with 2.x, and it is not adopted: Tech Lab's pages list 3.0 as April 2022 and 2.6 as November 2022, so the final 2.6 postdates 3.0, and the 2.x line is what receives releases. Treat 3.0 as the source of the shared code lists (2.6 points to them) and of the ideas Tech Lab is moving into 2.6 piece by piece.

**Adjacent specifications.** The Dynamic Native Ads API 1.2 (July 2017) defines the native request and response carried inside OpenRTB. The Agentic Real Time Framework (ARTF) 1.0, final August 12, 2026, defines containerized agent services that run inside a host platform and modify the bidstream; it rides alongside OpenRTB rather than replacing it.

## The Bid Request

A request is one `BidRequest` object with one or more `Imp` objects and the context around them.

**Top level.** `id` (required, the exchange's request ID); `imp` (required, at least one); exactly one of `site`, `app` or `dooh`; `device`, `user`, `source` and `regs`; `test` (1 = test mode, not billable); `at` (auction type); `tmax` ("Maximum time in milliseconds the exchange allows for bids to be received"); `wseat` or `bseat` (allowed or blocked buyer seats, never both); `allimps` (whether the impressions offered are all the ones in this context, for roadblocks); `cur` (allowed bid currencies); `wlang` or `wlangb` (allowed creative languages); `bcat`, `acat` and `cattax` (blocked and allowed advertiser categories and their taxonomy); `badv` (blocked advertiser domains); `bapp` (blocked apps).

**Imp.** `id` (unique within the request; bids reference it as `impid`); one or more of `banner`, `video`, `audio` and `native` (a bid must match one offered type); `pmp` for deals; `tagid` (the placement's ID, for debugging); `bidfloor` ("Minimum bid for this impression expressed in CPM", default 0) and `bidfloorcur` (default USD); `secure`; `instl` (interstitial); `rwdd` (the user gets a reward for viewing); `ssai`; `exp` (advisory seconds between auction and impression); `qty` (a multiplier when one impression is seen by more than one person, as on a screen); `dt` (an estimated fulfillment time); `refresh` (auto-refreshed slots); `metric` (expected viewability or click-through rate); `displaymanager` (the SDK or player rendering the ad).

**Banner.** One or more `format` objects with `w` and `h` in device-independent pixels, or `wratio`, `hratio` and `wmin` for flex sizes.

**Site, App, Dooh, Content, Publisher.** `site.domain`, `site.page`, `site.ref`; `app.bundle` and `app.storeurl`; `publisher.id`, which is the seller account ID that ads.txt lists; `content` for what the user is viewing or hearing (genre, series, episode, live flag, language, rating, the content taxonomy through `cattax`).

**Device.** User agent (`ua`) and the structured `sua` object 2.6 added, `ip` or `ipv6` (often truncated), `geo`, `devicetype`, `make`, `model`, `os`, `ifa` (the advertising ID in apps and CTV), `lmt` (limit ad tracking) and connection type.

**User.** `id` (the exchange's ID for the user), `buyeruid` (the bidder's ID, from a sync), `consent` (the TCF string when GDPR applies) and `eids`, the extended identifiers: each `EID` has a `source` ("Canonical domain of the ID"), `uids` with an `id` and an `atype` (1 browser or device, 2 in-app device, 3 person-based "same across devices"), and since 2.6-202409 `inserter`, `matcher` and `mm`. The specification strongly recommends `atype` because bidders keep app and browser identifiers apart.

**Source.** `fd` (0 when the exchange makes the final sale decision, 1 when an upstream source such as a header bidding wrapper does), `tid` (a transaction ID common to all participants), `pchain` and `schain`, the SupplyChain object, which 2.6 moved from `source.ext.schain` into `source` itself.

**Regs.** `coppa` (1 when the COPPA Rule applies), `gdpr` (0 or 1; "omitted means unknown"), `us_privacy` (the older US Privacy String, deprecated within GPP), `gpp` (the GPP string; OpenRTB still calls it the Global Privacy Platform, while Tech Lab now calls GPP the "Global Privacy Protocol") and `gpp_sid` (the GPP sections that apply to this transaction). The consent fields are only as good as their handling downstream: a bidder that receives `regs.gdpr = 1` with no `user.consent` must treat the user as not having consented.

### Auction types

`at` is 1 for first price and 2 for "Second Price Plus" (the default), with exchange-specific types from 500. The specification doesn't define "plus" as a term; its example clears a second-price auction at "the second-best price plus $0.01". A deal can override the auction type for its own bids, and `Deal.at = 3` says the deal's `bidfloor` is "the agreed deal price": a fixed-price deal. The industry runs first price for display (Google Ad Manager moved to a unified first-price auction announced September 5, 2019), so a bidder must not assume `at = 2` because the field is absent from one exchange's requests; it must read the exchange's guide. Auction Mechanics covers the theory and bid shading's reason for existing.

### Deals

`imp.pmp` carries `private_auction` (1 means only bids on the listed deals are accepted) and `deals`, each with `id` (required, the deal ID agreed between buyer and seller), `bidfloor` and `bidfloorcur` (the currency does not inherit from the impression), `at` (override), `wseat` and `wadomain` (allowed seats and advertiser domains), `guar` (1 = guaranteed: "the bidder must bid on" it), `mincpmpersec` and `durfloors` (floors by duration for video and audio). A bid on a deal sets `bid.dealid` to the deal's `id`; a bid without `dealid` competes in the open auction even if the impression carries deals. [Deals, PMPs & Curation](/books/advertising/deals-and-curation) covers setup and troubleshooting.

### Video, audio and native

**Video** requires `mimes` and recommends `minduration` and `maxduration` (or `rqddurs`, the exact acceptable durations, for live TV), `protocols` (VAST versions), `startdelay` (pre-, mid- or post-roll), `plcmt` (the placement type: since 2.6-202303 it replaces `placement`, which is deprecated), `linearity`, `skip`, `skipmin` and `skipafter`, `api`, `playbackmethod` and the pod fields: `podid` shared by every impression in a pod, `podseq` (the pod's position in the stream), `slotinpod`, `maxseq` (maximum ads in a dynamic pod), `poddur` (seconds available in a dynamic pod), `mincpmpersec` ("Price floor per second" for the dynamic portion) and `poddedupe` (provisional). A pod request is either one `Imp` per slot sharing a `podid` (a structured pod) or one `Imp` with `poddur` and `maxseq` (a dynamic pod), or both.

**Audio** mirrors video (`mimes`, durations, `poddur`, `rqddurs`, `podid`, `slotinpod`, `mincpmpersec`, `durfloors`) and adds audio specifics: `feed` (the feed type), `stitched`, `nvol` (volume normalization), `maxextended`, bit rates and companion banners.

**Native** carries the native request as a JSON-encoded string in `native.request`, with `ver` naming the Dynamic Native Ads API version (1.2). The bidder parses that string as a second document, and the native response comes back in `bid.adm` the same way. Sending the native request as a JSON object rather than a string is an easy integration error to make and to miss in testing.

## The Bid Response

A response is a `BidResponse` with `id` (the request's ID), `seatbid` (one entry per seat the bidder bids for, each with `seat` and an array of `bid`), `bidid` (the bidder's own response ID), `cur` (default USD) and, when there is no bid, `nbr` (a no-bid reason). To not bid, the bidder returns "an empty response with HTTP 204"; a 200 with an empty `seatbid` is worse for the exchange to parse and should be avoided. `seatbid.group = 1` says the impressions in it must be won or lost together.

**Bid.** `id` (bidder's bid ID); `impid` (which impression); `price` ("Bid price expressed as CPM although the actual transaction is for a unit impression only"); `adm` (the markup) or `nurl` to fetch it; `burl` and `lurl`; `adid`, `crid` ("Creative ID for ad quality checking") and `cid` (campaign); `adomain` (the advertiser domain used for blocklist checks); `bundle` and `iurl` (a sample image for quality review); `cat` and `cattax`; `attr` (creative attributes); `api` and `protocol`; `dealid`; `w` and `h`; `exp` ("seconds the bidder will wait between auction and impression"); `dur` (creative duration, seconds, for video and audio); `slotinpod`; and `mtype`, the markup type (1 banner, 2 video, 3 audio, 4 native), which an exchange needs when an impression offers several formats.

A minimal bid on the deal in the request from [How Programmatic Works](/books/advertising/how-programmatic-works#what-a-bid-request-looks-like):

```json
{
  "id": "0198c2a4-5f1e-7b3a-9d2e-4a1c8f0b6e21",
  "cur": "USD",
  "seatbid": [{
    "seat": "agency-seat-17",
    "bid": [{
      "id": "b-71c0",
      "impid": "1",
      "price": 6.40,
      "dealid": "NEWS-SPORTS-Q4",
      "adomain": ["shoes.example"],
      "crid": "cr-300x250-fall",
      "cid": "cmp-88",
      "w": 300, "h": 250,
      "mtype": 1,
      "adm": "<div>...creative markup...</div>",
      "nurl": "https://win.dsp.example/w?a=${AUCTION_ID}&b=${AUCTION_BID_ID}&p=${AUCTION_PRICE}",
      "burl": "https://bill.dsp.example/b?a=${AUCTION_ID}&p=${AUCTION_PRICE}&ts=${AUCTION_IMP_TS}",
      "lurl": "https://loss.dsp.example/l?a=${AUCTION_ID}&r=${AUCTION_LOSS}&m=${AUCTION_MIN_TO_WIN}"
    }]
  }]
}
```

Validation an exchange runs on every bid, each failure a loss reason: the `impid` exists; the price is at or above the floor for the open auction or the deal; the `dealid` was offered and the seat is allowed on it; the `adomain` and `cat` aren't blocked; the creative (`crid`) is approved or pending approval under the exchange's policy; the size or `mtype` matches what was offered; the markup or a fetchable `nurl` is present; the currency is allowed.

## Notices and Macros

OpenRTB has three notification URLs a bidder may put on a bid, and the exchange calls them after substituting macros.

- **Win notice, `nurl`.** "Win notice URL called by the exchange if the bid wins", and "not necessarily indicative of a delivered, viewed, or billable ad." When the markup comes from the win notice, the response body "contains the ad markup and only the ad markup", and if `adm` is also present, `adm` wins.
- **Billing notice, `burl`.** Called "when a winning bid becomes billable based on exchange-specific business policy." The specification wants it fired "server-side and as 'close' as possible to where the exchange books revenue", and for VAST the VAST impression event is the official billable signal, with `burl` fired at the same time.
- **Loss notice, `lurl`.** Called "when a bid is known to have been lost." "Exchange-specific policy may preclude support for loss notices", and an exchange that doesn't disclose the clearing price to losers may omit `${AUCTION_PRICE}` from them.

The macros, all of the form `${NAME}`:

| Macro | Value |
| --- | --- |
| `${AUCTION_ID}` | The bid request ID |
| `${AUCTION_BID_ID}` | `BidResponse.bidid` |
| `${AUCTION_IMP_ID}` | The impression won |
| `${AUCTION_SEAT_ID}` | The bidder's seat |
| `${AUCTION_AD_ID}` | `bid.adid` |
| `${AUCTION_PRICE}` | The clearing price, after any discount, in the bid's currency and units |
| `${AUCTION_CURRENCY}` | The bid's currency |
| `${AUCTION_MBR}` | Market bid ratio: clearing price divided by bid price |
| `${AUCTION_LOSS}` | Loss reason code |
| `${AUCTION_MIN_TO_WIN}` | The minimum bid that would have won |
| `${AUCTION_MULTIPLIER}` | Impressions won, for `qty` multipliers |
| `${AUCTION_IMP_TS}` | Unix millisecond timestamp of impression delivery |
| `${AUCTION_DISCOUNT_PCT}`, `${AUCTION_DISCOUNT_CPM}` | The seller's discount, as a percentage or a CPM |

Macro values "can be encoded for security purposes using various obfuscation or encryption algorithms", agreed between the parties; in practice an exchange encrypts `${AUCTION_PRICE}` so that a page or intermediary can't read clearing prices from URLs, and the bidder decrypts with a key the exchange issued. The price macros are in CPM, so `${AUCTION_PRICE}` = 6.12 on a won impression means the impression cost $0.00612.

Three rules for a bidder's notice endpoints:

- **The billing notice is the money event, the win notice is not.** Spend counters, pacing and the bidder's own billable count move on `burl` (or the bidder's impression pixel where the exchange doesn't fire `burl`); a win notice moves "won" counters only.
- **Notices are retried; handle them idempotently.** Exchanges and players retry notice calls, so the endpoint keys on (auction ID, impression ID, notice kind) and treats a repeat as a no-op ([Idempotency](/docs/requests/idempotency)).
- **Respond fast and do the work later.** A notice endpoint returns 200 or 204 at once and enqueues the record; it is on the exchange's hot path, and the exchange may give up and count it as failed.

### No-bid and loss reasons

`nbr` and `${AUCTION_LOSS}` use code lists 2.6 shares with 3.0. No-bid reasons include 0 "Unknown Error", 1 "Technical Error", 2 "Invalid Request", 3 "Known Web Crawler", 4 "Suspected Non-Human Traffic", 5 "Cloud, Data Center, or Proxy IP", 6 "Unsupported Device", 7 "Blocked Publisher or Site", 8 "Unmatched User", 9 "Daily User Cap Met", 10 "Daily Domain Cap Met", 11 and 12 for ads.txt authorization unavailable or violated, 13 and 14 for ads.cert, 15 "Insufficient Auction Time", 16 "Incomplete SupplyChain" and 17 "Blocked SupplyChain Node". Loss reasons group into 0 "Bid Won"; 1-10 for errors and invalid responses (expired opportunity, invalid deal ID, invalid advertiser domain, missing markup, creative ID or price); 100-104 for auction outcomes (100 "Bid was Below Auction Floor", 101 "Bid was Below Deal Floor", 102 "Lost to Higher Bid", 103 "Lost to a Bid for a Deal", 104 "Buyer Seat Blocked"); and 200-215 for creative filtering (pending approval, disapproved, size, format, advertiser, category, attribute and language exclusions, "Not Allowed in Deal", "Invalid SKAdNetwork"). Both lists reserve 500 and up for exchange-specific values "communicated with buyers beforehand."

The loss reasons are the single most useful debugging signal in programmatic: a deal that doesn't spend shows 101 (below deal floor), 103 (lost to another deal), 213 (creative not allowed in deal) or 201 (creative pending), each with a different fix. Store them as integers with the list they came from, because 500+ means something different at each exchange.

## Extensions

"Any object may contain extensions", named `ext`, and "Exchanges are responsible for publishing their extensions to bidders." In practice extensions carry three kinds of things: fields an exchange needs before Tech Lab standardizes them (several 2.6 releases promoted community extensions, including SupplyChain from `source.ext.schain`), exchange-specific signals (its own IDs, its traffic quality scores, its deal attributes) and the fields of adjacent specifications (Prebid's `ext.prebid` in Prebid Server requests).

My rules for extensions: parse them into named, typed fields per exchange at the edge of the bidder and drop the rest; never let `ext` fields leak into core logic without a mapping, because the same idea (a viewability prediction, a reward flag) has a different path at each exchange; and when Tech Lab promotes an extension into the core object, read both locations during the transition and prefer the core one, the same tolerance the versioning rule requires.

## Transport

"HTTP POST is required for bid requests." A response with content is 200, a valid no-bid is 204, an invalid request is 400. Persistent connections are a best practice; gzip is encouraged, signaled with `accept-encoding: gzip`, and compressed request bodies must be agreed in advance. Requests "should" carry `x-openrtb-version`. Google's Authorized Buyers adds a Protobuf encoding of the same objects, which trades JSON's flexibility for a compiled schema both sides must keep in step. 3.0 requires HTTPS with TLS 1.2 or later; 2.6 leaves transport security to the integration, and Google's cookie-matching guide, for one, requires HTTPS on every endpoint.

A bidder's parser is its first line of defense, and the shape of the code matters more than the language: decode into structs that know which fields are required, treat everything else as optional, keep `ext` as raw JSON, and reject a request without `id` or `imp` with 400 rather than guessing.

```go tab="Go"
package openrtb

import (
	"encoding/json"
	"errors"
)

type BidRequest struct {
	ID     string          `json:"id"`
	Imp    []Imp           `json:"imp"`
	Site   *Site           `json:"site,omitempty"`
	App    *App            `json:"app,omitempty"`
	At     int             `json:"at,omitempty"`   // 0 means absent: default is 2
	Tmax   int             `json:"tmax,omitempty"` // milliseconds
	Cur    []string        `json:"cur,omitempty"`
	BAdv   []string        `json:"badv,omitempty"`
	Regs   *Regs           `json:"regs,omitempty"`
	Source *Source         `json:"source,omitempty"`
	Ext    json.RawMessage `json:"ext,omitempty"`
}

type Imp struct {
	ID          string          `json:"id"`
	TagID       string          `json:"tagid,omitempty"`
	BidFloor    float64         `json:"bidfloor,omitempty"`
	BidFloorCur string          `json:"bidfloorcur,omitempty"`
	PMP         *PMP            `json:"pmp,omitempty"`
	Native      *Native         `json:"native,omitempty"`
	Ext         json.RawMessage `json:"ext,omitempty"`
}

type PMP struct {
	PrivateAuction int    `json:"private_auction,omitempty"`
	Deals          []Deal `json:"deals,omitempty"`
}

type Deal struct {
	ID          string   `json:"id"`
	BidFloor    float64  `json:"bidfloor,omitempty"`
	BidFloorCur string   `json:"bidfloorcur,omitempty"` // does not inherit from Imp
	At          int      `json:"at,omitempty"`          // 3: bidfloor is the agreed price
	WSeat       []string `json:"wseat,omitempty"`
	Guar        int      `json:"guar,omitempty"`
}

type Native struct {
	Request string `json:"request"` // a JSON document encoded as a string
	Ver     string `json:"ver,omitempty"`
}

type Site struct {
	Domain    string     `json:"domain,omitempty"`
	Page      string     `json:"page,omitempty"`
	Publisher *Publisher `json:"publisher,omitempty"`
}

type App struct {
	Bundle    string     `json:"bundle,omitempty"`
	Publisher *Publisher `json:"publisher,omitempty"`
}

type Publisher struct {
	ID string `json:"id,omitempty"` // the seller account ID ads.txt lists
}

type Regs struct {
	COPPA  int    `json:"coppa,omitempty"`
	GDPR   *int   `json:"gdpr,omitempty"` // nil: unknown, not "does not apply"
	GPP    string `json:"gpp,omitempty"`
	GPPSID []int  `json:"gpp_sid,omitempty"`
}

type Source struct {
	TID    string          `json:"tid,omitempty"`
	SChain json.RawMessage `json:"schain,omitempty"`
}

var ErrInvalid = errors.New("invalid bid request")

// Parse decodes a request and applies the defaults the specification states.
func Parse(body []byte) (*BidRequest, error) {
	var r BidRequest
	if err := json.Unmarshal(body, &r); err != nil {
		return nil, ErrInvalid
	}
	if r.ID == "" || len(r.Imp) == 0 {
		return nil, ErrInvalid
	}
	if r.At == 0 {
		r.At = 2
	}
	for i := range r.Imp {
		if r.Imp[i].ID == "" {
			return nil, ErrInvalid
		}
		if r.Imp[i].BidFloorCur == "" {
			r.Imp[i].BidFloorCur = "USD"
		}
		if r.Imp[i].PMP != nil {
			for j := range r.Imp[i].PMP.Deals {
				if r.Imp[i].PMP.Deals[j].BidFloorCur == "" {
					r.Imp[i].PMP.Deals[j].BidFloorCur = "USD"
				}
			}
		}
	}
	return &r, nil
}
```

```rust tab="Rust"
use serde::Deserialize;
use serde_json::value::RawValue;

#[derive(Deserialize)]
pub struct BidRequest {
    pub id: String,
    pub imp: Vec<Imp>,
    pub site: Option<Site>,
    pub app: Option<App>,
    #[serde(default = "default_at")]
    pub at: u16, // 1 first price, 2 second price plus (default)
    pub tmax: Option<u32>, // milliseconds
    #[serde(default)]
    pub cur: Vec<String>,
    #[serde(default)]
    pub badv: Vec<String>,
    pub regs: Option<Regs>,
    pub source: Option<Source>,
    pub ext: Option<Box<RawValue>>,
}

fn default_at() -> u16 { 2 }
fn usd() -> String { "USD".to_string() }

#[derive(Deserialize)]
pub struct Imp {
    pub id: String,
    pub tagid: Option<String>,
    #[serde(default)]
    pub bidfloor: f64,
    #[serde(default = "usd")]
    pub bidfloorcur: String,
    pub pmp: Option<Pmp>,
    pub native: Option<Native>,
    pub ext: Option<Box<RawValue>>,
}

#[derive(Deserialize)]
pub struct Pmp {
    #[serde(default)]
    pub private_auction: u8,
    #[serde(default)]
    pub deals: Vec<Deal>,
}

#[derive(Deserialize)]
pub struct Deal {
    pub id: String,
    #[serde(default)]
    pub bidfloor: f64,
    #[serde(default = "usd")]
    pub bidfloorcur: String, // does not inherit from Imp
    pub at: Option<u16>,     // 3: bidfloor is the agreed price
    #[serde(default)]
    pub wseat: Vec<String>,
    #[serde(default)]
    pub guar: u8,
}

#[derive(Deserialize)]
pub struct Native {
    pub request: String, // a JSON document encoded as a string
    pub ver: Option<String>,
}

#[derive(Deserialize)]
pub struct Site {
    pub domain: Option<String>,
    pub page: Option<String>,
    pub publisher: Option<Publisher>,
}

#[derive(Deserialize)]
pub struct App {
    pub bundle: Option<String>,
    pub publisher: Option<Publisher>,
}

#[derive(Deserialize)]
pub struct Publisher {
    pub id: Option<String>, // the seller account ID ads.txt lists
}

#[derive(Deserialize)]
pub struct Regs {
    #[serde(default)]
    pub coppa: u8,
    pub gdpr: Option<u8>, // None: unknown, not "does not apply"
    pub gpp: Option<String>,
    #[serde(default)]
    pub gpp_sid: Vec<u16>,
}

#[derive(Deserialize)]
pub struct Source {
    pub tid: Option<String>,
    pub schain: Option<Box<RawValue>>,
}

#[derive(Debug)]
pub struct Invalid;

/// Decodes a request; missing required fields are a 400, not a guess.
pub fn parse(body: &[u8]) -> Result<BidRequest, Invalid> {
    let r: BidRequest = serde_json::from_slice(body).map_err(|_| Invalid)?;
    if r.id.is_empty() || r.imp.is_empty() || r.imp.iter().any(|i| i.id.is_empty()) {
        return Err(Invalid);
    }
    Ok(r)
}
```

Two details the sketch encodes because integrations get them wrong: `regs.gdpr` absent is "unknown", not 0, so it is a pointer or an `Option`; and a deal's floor currency defaults to USD on its own rather than inheriting the impression's.

## How to Build It

The core model stores the request's privacy signals, the auction and the bid; OpenRTB adds the protocol identifiers that tie a stored row back to the wire (request, impression and bid IDs, the transaction ID, the release an exchange speaks), the bid's declared attributes that validation and creative review use, and the notices, which are where clearing prices and billable events arrive. `bid_requests` from [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) already holds each callout's status and `nbr`.

```sql
ALTER TABLE ad_requests
  ADD COLUMN openrtb_release TEXT,       -- e.g. '2.6-202611', from the connection's guide
  ADD COLUMN imp_ids TEXT[],             -- Imp.id values, in request order
  ADD COLUMN test BOOLEAN NOT NULL DEFAULT FALSE;  -- BidRequest.test = 1: never billable

ALTER TABLE bids
  ADD COLUMN external_bid_id TEXT,       -- bid.id
  ADD COLUMN response_bid_id TEXT,       -- BidResponse.bidid
  ADD COLUMN imp_id TEXT,                -- bid.impid
  ADD COLUMN seat TEXT,                  -- seatbid.seat as sent
  ADD COLUMN adomains TEXT[],            -- bid.adomain
  ADD COLUMN external_crid TEXT,         -- bid.crid, as the bidder names the creative
  ADD COLUMN mtype SMALLINT,             -- 1 banner, 2 video, 3 audio, 4 native
  ADD COLUMN duration_s INT,             -- bid.dur, video and audio
  ADD COLUMN categories TEXT[],          -- bid.cat with ...
  ADD COLUMN cattax SMALLINT,            -- ... the taxonomy it is in
  ADD COLUMN loss_reason_list TEXT;      -- 'openrtb' for the shared list, or the exchange's key for 500+
ALTER TABLE bids ADD CONSTRAINT bids_mtype_check CHECK (mtype IN (1, 2, 3, 4)) NOT VALID;

CREATE TABLE bid_notices (               -- every win, billing and loss notice sent or received
  id                  UUID NOT NULL DEFAULT uuidv7(),
  occurred_at         TIMESTAMPTZ NOT NULL,  -- when the exchange fired it, from the macro or receipt
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind                TEXT NOT NULL CHECK (kind IN ('win', 'billing', 'loss')),
  direction           TEXT NOT NULL CHECK (direction IN ('sent', 'received')),  -- exchange or bidder side
  auction_external_id TEXT NOT NULL,     -- ${AUCTION_ID}
  imp_id              TEXT NOT NULL,     -- ${AUCTION_IMP_ID}
  bid_started_at      TIMESTAMPTZ,       -- the bids row, when joined
  bid_id              UUID,
  clearing_cpm_micros BIGINT CHECK (clearing_cpm_micros >= 0),  -- ${AUCTION_PRICE}, decrypted
  min_to_win_cpm_micros BIGINT,          -- ${AUCTION_MIN_TO_WIN}
  currency            CHAR(3),
  loss_reason         SMALLINT,          -- ${AUCTION_LOSS}
  multiplier          INT NOT NULL DEFAULT 1,  -- ${AUCTION_MULTIPLIER}
  imp_ts              TIMESTAMPTZ,       -- ${AUCTION_IMP_TS}
  fired_from          TEXT CHECK (fired_from IN ('server', 'client', 'vast_tracker')),
  http_status         SMALLINT,          -- on 'sent': the bidder's answer
  attempts            SMALLINT NOT NULL DEFAULT 1,
  dedupe_key          TEXT NOT NULL,     -- (auction, imp, kind): retries are no-ops
  PRIMARY KEY (occurred_at, id),
  UNIQUE (occurred_at, dedupe_key),
  CHECK (kind <> 'loss' OR loss_reason IS NOT NULL),
  CHECK (kind = 'loss' OR loss_reason IS NULL OR loss_reason = 0)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE rtb_extension_fields (      -- each exchange's published ext fields, mapped to names
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  exchange_org_id  UUID NOT NULL REFERENCES organizations (id),
  object_path      TEXT NOT NULL,        -- e.g. 'imp.ext.viewability' or 'source.ext.schain'
  maps_to          TEXT,                 -- this system's field, e.g. 'predicted_viewability'; null = dropped
  value_type       TEXT NOT NULL CHECK (value_type IN ('string', 'integer', 'number', 'boolean',
                     'object', 'array')),
  superseded_by    TEXT,                 -- the core field once Tech Lab promotes it
  effective        TSTZRANGE NOT NULL,
  doc_url          TEXT,
  UNIQUE (exchange_org_id, object_path, effective)
);
```

Reconciling what a bidder thinks it won against what the exchange billed comes straight out of the notices:

```sql
-- Per exchange and day: wins versus billing notices, and the billed amount in micros.
SELECT r.exchange,
       date_trunc('day', n.occurred_at)                         AS day,
       count(*) FILTER (WHERE n.kind = 'win')                   AS wins,
       count(*) FILTER (WHERE n.kind = 'billing')               AS billable,
       sum(n.clearing_cpm_micros * n.multiplier / 1000)
         FILTER (WHERE n.kind = 'billing')                      AS billed_micros
FROM bid_notices n
JOIN (SELECT DISTINCT ON (external_id) external_id, upstream_org_id AS exchange
      FROM ad_requests WHERE received_at >= now() - interval '8 days') r
  ON r.external_id = n.auction_external_id
WHERE n.direction = 'received' AND n.occurred_at >= now() - interval '7 days'
GROUP BY 1, 2
ORDER BY 1, 2;
```

Design notes:

- **Keep the wire IDs.** The exchange's request ID, impression ID and the bidder's bid ID are what every dispute, log-level file and support ticket quotes; store them next to this system's UUIDs, never instead of them.
- **Notices are events, deduplicated at arrival.** `dedupe_key` on (auction, impression, kind) makes a retried notice a no-op; the billing notice, not the win notice, moves spend, and its `clearing_cpm_micros` is the cost basis.
- **Convert CPM to micros once, at the edge.** `price` and the price macros are decimal CPMs; parse them into `*_cpm_micros` integers when the request or notice arrives, and compute per-impression cost as micros divided by 1,000, rounded once ([Money & Amounts](/docs/money/amounts)).
- **Loss reasons carry their list.** Codes below 500 are the shared OpenRTB list; 500 and above mean whatever the exchange says, so `loss_reason_list` records which list a code came from.
- **Extensions are configuration with dates.** `rtb_extension_fields` records each exchange's `ext` paths and what they map to, with an effective range, so a promoted field (like `schain` leaving `source.ext`) is read from both places during the transition ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Test traffic never bills.** `test = 1` requests are kept apart from the first hop, and nothing downstream (spend, `delivery_daily`, invoices) reads them.

## Auditing

- **Every notice, as received.** Win, billing and loss notices with their decrypted macros, timestamps and retries, because the billing notice is the cost basis a bidder's invoice reconciles to.
- **Every bid as declared.** Advertiser domains, categories, creative ID and markup type as the bidder sent them, so a blocklist breach or a category complaint can be traced to the bid that declared (or misdeclared) them.
- **Which protocol each connection spoke.** The 2.6 release, the extensions mapped and their dates, so a field that changed meaning is read under the rules in force.
- **Every rejection with its reason.** Loss and no-bid codes with the list they came from, for the dispute about why a deal didn't spend.

## What This Means for the System You Build

- **Implement 2.6 and treat 3.0 as a code list,** with every field optional except the few the specification requires.
- **Read each exchange's guide as the contract:** auction type, billing policy, loss-notice support, macro encryption and extensions.
- **Move money on the billing notice,** deduplicated by auction, impression and kind, never on the win notice.
- **Parse prices into integer micros once** and keep the clearing price, bid price and minimum to win apart.
- **Map extensions to named fields at the edge** with effective dates, and drop what isn't mapped.
- **Store loss and no-bid reasons with their list,** and use them first when a deal or campaign doesn't spend.
- **Answer no-bid with 204** and reject malformed requests with 400.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), every object and field cited, the versioning rule, transport, extensions, the auction types, deal at = 3, notices and macros, and the 2.5 and 2.6 version history
- [IAB Tech Lab: OpenRTB 2.x releases](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/releases), the dated 2.6 releases from 2.6-202210 to 2.6-202611
- [IAB Tech Lab: OpenRTB 3.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/OpenRTB%20v3.0%20FINAL.md), the layered design, Item, TLS 1.2, ads.cert beta fields, and the no-bid and loss reason code lists
- [IAB Tech Lab: AdCOM 1.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/AdCOM/main/AdCOM%20v1.0%20FINAL.md), the enumerated lists 2.6 moved out, agent types and ID match methods
- [IAB Tech Lab: OpenRTB](https://iabtechlab.com/standards/openrtb/), version listing and the move of version history to GitHub
- [IAB Tech Lab: Supply Chain Foundations](https://iabtechlab.com/standards/supply-chain-foundations/), OpenRTB v2.6.x listed as current
- [IAB Tech Lab: OpenRTB Native](https://iabtechlab.com/standards/openrtb-native/), Dynamic Native Ads API 1.2
- [IAB Tech Lab: Agentic Real Time Framework](https://iabtechlab.com/standards/artf/), ARTF 1.0 final August 12, 2026
- [IAB Tech Lab: Global Privacy Protocol](https://iabtechlab.com/gpp/), the current name of GPP

**Reference**

- [Google Authorized Buyers: Get started with real-time bidding](https://developers.google.com/authorized-buyers/rtb/start), OpenRTB in Protobuf and JSON and the response deadline
- [Google Ad Manager: Rolling out first price auctions (September 5, 2019)](https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/), the unified first-price auction
- [Microsoft Learn: Required parameters for CTV inventory](https://learn.microsoft.com/en-us/xandr/monetize/required-parameters-for-ctv-inventory), ifa_type values for streaming requests
- [Google Authorized Buyers: Cookie matching](https://developers.google.com/authorized-buyers/rtb/cookie-guide), HTTPS required on all endpoints
- [Prebid.org: Prebid Server overview](https://docs.prebid.org/prebid-server/overview/prebid-server-overview.html), server-to-server header bidding in Go and Java
