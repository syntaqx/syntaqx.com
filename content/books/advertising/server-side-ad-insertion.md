+++
title = "Server-Side Ad Insertion & Ad Pods"
description = "How SSAI and server-guided insertion put ads in streams, server-side beaconing, ad pods in OpenRTB 2.6, filling pods, competitive separation and live events."
category = "Advertising Industry"
order = 2949
part = "Channels"
tags = ["advertising", "ssai", "ad-pods", "ctv", "openrtb", "live", "data-model"]
nav_title = "SSAI & Ad Pods"
+++

Server-side ad insertion (SSAI) puts the ads into the video stream itself. Instead of the player pausing the program, calling an ad server, loading a separate ad player and coming back, a server between the content origin and the viewer rewrites the stream's manifest so that, at each break, the viewer's player simply plays the next segments, which happen to be ads chosen for that viewer. The MRC defines it as "the use of an intermediary server to insert ads dynamically into video streams on the server side," and the IAB Tech Lab's CTV guide puts the consequence in one line: the client player "no longer has to make ad server calls to deliver an ad." It is how most long-form streaming, FAST channels and live sports are monetized.

It is hard because the server now does the work of every player at once, at the worst possible moment. A live game's break starts for every viewer within seconds of each other, so the stitcher must request ads for hundreds of thousands of sessions, resolve their wrapper chains, fill multi-ad pods under duration and separation rules, and have every ad transcoded to match the stream, all before the break begins. Then it must report what each viewer played, from a data center, to ad servers and verification vendors whose counting rules were written for players, and whose fraud defenses flag exactly that kind of traffic. And because the ad is now just more segments, the player may not know an ad is playing at all, which matters for skip buttons, clicks and measurement.

This chapter covers how SSAI works (manifest manipulation, ad decisioning, transcoding), server-guided ad insertion and HLS interstitials as the newer alternative, server-side and client-side beaconing and the MRC's rules for them, ad pods in OpenRTB 2.6 (structured, dynamic and hybrid), filling a pod by value under duration limits, competitive separation and deduplication, and live events (break timing, prefetch, traffic spikes). It extends `auctions`, `bids` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and adds ad breaks and SSAI sessions. The money split on one pod is [A CTV ad pod](/books/advertising/advertising-business#a-ctv-ad-pod). The VAST document, wrappers and tracking events are VAST & Video Ads; CTV supply and identifiers are Connected TV & Streaming; counting rules for server-side beacons are Counting Impressions & Clicks; per-position pricing in multi-slot auctions is Auction Mechanics. Generic live video delivery (ingest, transcode, latency tiers and SCTE-35 markers in HLS) is the User-Generated Platforms volume's [Live Latency & VODs](/books/user-generated-platforms/live-latency-and-vods#timed-metadata-and-ad-breaks) and [Live Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding).

## How the Platforms Do It

As of November 2026, from each vendor's documentation. Rows are SSAI services and the ad servers that fill their pods.

| System | What it does | Beaconing | Pods and live |
| --- | --- | --- | --- |
| **AWS Elemental MediaTailor** | Stitches personalized ads into HLS and DASH for VOD and live; channel assembly builds linear channels from VOD | Server-side by default ("as each ad is played back, MediaTailor sends beacons"), or client-side, chosen at session start; sessionless server-side beaconing for server-guided insertion | Prefetch schedules for live breaks, single or recurring, up to 24 hours ahead; TPS-based traffic shaping |
| **Google Ad Manager (Dynamic Ad Insertion and optimized pods)** | Server-side insertion for live linear and VOD for Ad Manager 360 publishers; optimized pods return several ads from one request | Impression pixels loaded by the IMA SDK in the DAI workflow | Max and exact pod durations; ad buffet of 3 ads by default, up to 9; "the same line item cannot serve multiple times in an optimized ad pod"; competitive exclusion labels |
| **IAB Tech Lab (CTV guide, OpenRTB 2.6)** | The protocol: pods in the bid request, device headers on server-side calls | Stitchers must send `X-Device-IP` and `X-Device-User-Agent` | `podid`, `podseq`, `slotinpod`, `maxseq`, `poddur`, `rqddurs`, `mincpmpersec`, `durfloors`, `poddedupe` (provisional) |
| **MRC (SSAI and OTT Guidance, August 2021)** | The counting rules | Server-side tracking held to the client-initiated counting requirements; otherwise segregated and disclaimed | SSAI providers verified by measurement vendors |

Most large streaming publishers run a stitcher from one vendor, an ad server from another and several SSPs behind it, so the pod a viewer sees was decided by three systems that each log part of it. The records in this chapter are what let them agree on what played.

## How SSAI Works

The flow in MediaTailor's documentation is the general shape:

1. **Session start.** The player (or a CDN on its behalf) requests the stream from the stitcher with parameters about the viewer: device, app, consent signals, identifiers, targeting keys.
2. **Ad decision.** At each break, the stitcher calls the ad decision server (ADS) with the viewer's information; the ADS "returns the URLs to the ad creatives in a VAST or VMAP response." Wrappers are resolved by the stitcher, which "should extract the inner InLine response" and keep every party's tracking.
3. **Transcode and stitch.** The stitcher rewrites the manifest so the break's segments point at ad renditions "transcoded to match the encoding characteristics of the origin content." If an ad "hasn't yet been transcoded to match the content, MediaTailor will skip inserting it" and prepares it for the next request.
4. **Personalized manifest.** The player receives a manifest unique to its session and plays content and ads as one stream.
5. **Tracking.** As playback progresses, either the player or the stitcher sends the ad's tracking beacons; the session declared which at the start.

Two consequences follow for the ad system. Each viewer's manifest is different, so in stitched mode MediaTailor describes it as "Per-session, not cacheable" at the CDN: every manifest request reaches the stitcher, which is the cost and the scaling problem of SSAI. And the player doesn't need to know where ads are, which is good for playback smoothness and bad for interactivity, skip buttons and client-side measurement unless the stitcher also tells the player (through manifest tags or a tracking API) where the ads are.

**Unfilled time.** A break whose ads don't fill its duration is padded with slate or with the original content (the program's own break content, which some services fall back to). VAST's error 206 ("ad break shortened") exists for the reverse case, a break that turned out shorter than the ads chosen for it.

## Server-Guided Ad Insertion

A newer model moves the last step back to the player without bringing back client-side ad calls. In **server-guided ad insertion** (SGAI), the stitcher returns a manifest shared by all viewers that marks each break with an HLS interstitial: an `EXT-X-DATERANGE` with `CLASS="com.apple.hls.interstitial"` and an `X-ASSET-LIST` attribute. When the player reaches the break, it fetches the asset list, which returns that viewer's ads as separate playlists. MediaTailor's comparison:

| Aspect | Stitched (SSAI) | Server-guided (SGAI) |
| --- | --- | --- |
| Manifest cacheability | Per-session, not cacheable | Cacheable, shared across viewers |
| Session state for beacons | Stored per session in MediaTailor | Sessionless: all state carried in the encrypted beacon data |
| Tracking URL at session start | Returned | Not provided; beacon data embedded in each ad URI |
| DASH support | Supported | Not yet supported |

Server-side beaconing still works: each ad URI carries encrypted beacon data, the player requests ad segments through the service, and the service "decrypts the beacon data, determines the segment's position within the ad (impression, first quartile, midpoint, third quartile, or complete), and fires the appropriate VAST tracking beacon." Players need HLS version 11 or later, interstitial support and `EXT-X-DEFINE:QUERYPARAM` variable substitution. Prefetching isn't needed because "players only fetch ads they are going to play."

SGAI trades the stitcher's per-session manifest load for a requirement on the player, so it suits platforms with modern HLS players (Apple devices first) and leaves stitched SSAI for devices that can't do interstitials. A seller running both needs its records to say which mode each session used, because counts, caching and failure modes differ.

## Beaconing and Counting

Where the stitcher fires the beacons, every ad server and verification vendor in the chain sees all of a stream's impressions arrive from a handful of data center addresses. Three rules make that countable:

- **Initiated by playback.** The MRC's guidance holds tracking a server sends on the player's behalf to the same client-initiated counting requirements; measurement that doesn't meet them "should be segregated in reporting and disclaimed as non-compliant." In MediaTailor's stitched mode, the trigger is the player requesting an ad segment URL ("when the player requests playback from an ad segment URL ... AWS Elemental MediaTailor sends the appropriate beacon"), which ties the beacon to the device actually fetching the ad, not to the stitcher's decision. The VAST 4.4 draft's publisher implementation note has calls from a publisher's server made "concurrently with the corresponding playback events."
- **Device headers.** Every server-side request and beacon carries the device's identity: `X-Device-IP` and `X-Device-User-Agent` (required), and `X-Device-Referer`, `X-Device-Accept-Language` and `X-Device-Requested-With` when available, matching the original ad request. The `[SERVERSIDE]` macro says whether a server fired the call on a client's signal (1) or on its own (2).
- **Verified stitchers.** The MRC requires that "providers indicating use of SSAI must be verified as such by measurement vendors," with their traffic measurable for invalid traffic "or otherwise treated as unknown." In practice that means an allowlist of stitcher identities (authenticated connections or published IP ranges), not trust in whoever sets an `X-Device-IP` header.

Client-side beaconing remains the better option where the device can do it: the player, told where the ads are, fires the tracking itself, and verification scripts can run through OM SDK. Many services offer both per session, and a publisher can choose client-side on devices that support it and server-side elsewhere. Counting Impressions & Clicks covers what a counter does with server-side beacons; Invalid Traffic & Ad Fraud covers SSAI spoofing.

## Ad Pods in OpenRTB

A **pod** is "an ad break of the type you'd see in a TV-like viewing experience": several ads played back to back. OpenRTB 2.6 "Introduces Ad Pods for CTV transactions," and its implementation guide defines three shapes:

- **Structured pod:** "the number of ad slots, their slot in the ad pod, and duration is pre-defined and static." Each slot is its own `Imp`, all sharing a `podid`.
- **Dynamic pod:** the number of ads and their durations are open, but "the total duration and maximum number of ads are constrained." One `Imp` with `poddur` (seconds available) and `maxseq` (maximum ads).
- **Hybrid pod:** "BOTH structured and dynamic components," such as a fixed 15-second first slot followed by a dynamic 60 seconds.

The fields, from the 2.6 spec:

| Field | Where | Meaning |
| --- | --- | --- |
| `podid` | `Imp.video`, `Imp.audio` | "Unique identifier indicating that an impression opportunity belongs to a video ad pod" |
| `podseq` | `Imp.video` | The pod's position in the content stream |
| `slotinpod` | `Imp.video`, `Bid` | On the request: the seller "can guarantee delivery against the indicated slot position"; on the bid: the bid is "only eligible for a specific position" |
| `maxseq`, `poddur` | `Imp.video` | Maximum ads and total seconds in a dynamic pod |
| `rqddurs` | `Imp.video` | "Precise acceptable durations for video creatives in seconds," sent instead of min and max duration, never with them |
| `mincpmpersec` | `Imp.video` | "Minimum CPM per second," the floor for the dynamic portion; "Buyers should look for `mincpmpersec` when available, otherwise fall back to `bidfloor`" |
| `durfloors` | `Imp.video` | Floors by duration range (`mindur`, `maxdur`, `bidfloor`); the `Imp` floor applies outside the ranges |
| `poddedupe` | `Imp.video` | Provisional: pod deduplication settings applied to bid responses |
| `dur` | `Bid` | "Duration of the video or audio creative in seconds" |

Sellers should set `slotinpod` to first or last only when they can "absolutely guarantee placement"; buyers use it only for dynamic segments, and only "if they only want to buy the first or last ad slot specifically," since a structured slot is already identified by its `impid`. The guide's dynamic example is a 60-second pod with up to four ads, filled by three bids from three advertisers (30, 15 and 15 seconds), the first restricted to the first position.

The first and last slots matter because viewers are most likely to see them: the first before they reach for their phone, the last just before the program returns. That is why buyers pay for position and why sellers must be sure they can deliver it before they sell it.

## Filling a Pod

Filling a dynamic pod is a small optimization problem: choose a set of ads whose durations fit in `poddur`, at most `maxseq` of them, each above its floor (`mincpmpersec` times its duration, or the matching `durfloors` range), no two that conflict, maximizing what the pod earns. Each ad is one impression, so a 30-second spot at a $30 CPM earns the same as a 15-second spot at $30; per second, the 15 is worth twice as much. A filler that ranks by CPM fills the pod with long ads; one that ranks by CPM per second fills it with short ones; the right answer depends on what else fits.

Google Ad Manager's optimized pods show the practical rules a seller layers on top: pod durations may be a maximum (ads must fit) or exact ("the sum of all ad durations must equal the value set"), using "the duration found in the VAST, not the media file duration"; "the same line item cannot serve multiple times in an optimized ad pod"; higher-priority line items have higher value, remnant ones compete on CPM; and an **ad buffet** of extra ads (3 by default, up to 9) stands by to replace pod ads that fail to play, though once a line item with a competitive exclusion label serves in the pod, other line items with the same label can't serve to the buffet, and programmatic guaranteed is not eligible either.

With `maxseq` small (most pods hold two to six ads), an exact search is affordable. A filler that maximizes total price under duration, count, floor and separation constraints:

```go tab="Go"
type PodBid struct {
	ID         string
	CPMMicros  int64  // per impression (one spot), CPM in micros
	DurS       int    // Bid.dur, seconds
	Category   string // separation category, e.g. an IAB content taxonomy ID for the product
	ADomain    string // advertiser domain, for deduplication
	LineItem   string // a line item serves once per pod
	SlotInPod  int    // 0 any, 1 first, -1 last
}

type Pod struct {
	DurS               int
	MaxSeq             int
	MinCPMPerSecMicros int64
	Exact              bool // durations must sum to DurS
}

// Fill returns the best set of bids for one dynamic pod, in play order.
func Fill(p Pod, bids []PodBid) []PodBid {
	ok := bids[:0:0]
	for _, b := range bids {
		if b.DurS > 0 && b.DurS <= p.DurS && b.CPMMicros >= p.MinCPMPerSecMicros*int64(b.DurS) {
			ok = append(ok, b)
		}
	}
	sort.Slice(ok, func(i, j int) bool { return ok[i].CPMMicros > ok[j].CPMMicros })

	var best []PodBid
	var bestValue int64 = -1
	var cur []PodBid
	used := map[string]bool{}

	var search func(i, secs int, value int64)
	search = func(i, secs int, value int64) {
		if (!p.Exact || secs == p.DurS) && value > bestValue {
			bestValue, best = value, append([]PodBid(nil), cur...)
		}
		if i == len(ok) || len(cur) == p.MaxSeq {
			return
		}
		// bound: even the next highest bids filling the remaining count can't beat best
		if value+ok[i].CPMMicros*int64(p.MaxSeq-len(cur)) <= bestValue {
			return
		}
		b := ok[i]
		keys := []string{"c:" + b.Category, "d:" + b.ADomain, "l:" + b.LineItem}
		free := secs+b.DurS <= p.DurS
		for _, k := range keys {
			if used[k] {
				free = false
			}
		}
		if free {
			for _, k := range keys {
				used[k] = true
			}
			cur = append(cur, b)
			search(i+1, secs+b.DurS, value+b.CPMMicros)
			cur = cur[:len(cur)-1]
			for _, k := range keys {
				delete(used, k)
			}
		}
		search(i+1, secs, value)
	}
	search(0, 0, 0)
	return order(best)
}

// order puts slotinpod=1 first and -1 last; a set with two of either is rejected upstream.
func order(bs []PodBid) []PodBid {
	sort.SliceStable(bs, func(i, j int) bool { return rank(bs[i]) < rank(bs[j]) })
	return bs
}

func rank(b PodBid) int {
	switch b.SlotInPod {
	case 1:
		return 0
	case -1:
		return 2
	}
	return 1
}
```

```rust tab="Rust"
#[derive(Clone)]
pub struct PodBid {
    pub id: String,
    pub cpm_micros: i64, // per impression (one spot)
    pub dur_s: u32,      // Bid.dur
    pub category: String,
    pub adomain: String,
    pub line_item: String,
    pub slot_in_pod: i8, // 0 any, 1 first, -1 last
}

pub struct Pod {
    pub dur_s: u32,
    pub max_seq: usize,
    pub min_cpm_per_sec_micros: i64,
    pub exact: bool,
}

pub fn fill(p: &Pod, bids: &[PodBid]) -> Vec<PodBid> {
    let mut ok: Vec<PodBid> = bids
        .iter()
        .filter(|b| b.dur_s > 0 && b.dur_s <= p.dur_s
            && b.cpm_micros >= p.min_cpm_per_sec_micros * b.dur_s as i64)
        .cloned()
        .collect();
    ok.sort_by(|a, b| b.cpm_micros.cmp(&a.cpm_micros));

    struct S<'a> { p: &'a Pod, ok: &'a [PodBid], best: Vec<PodBid>, best_value: i64,
                   cur: Vec<PodBid>, used: std::collections::HashSet<String> }

    fn search(s: &mut S, i: usize, secs: u32, value: i64) {
        if (!s.p.exact || secs == s.p.dur_s) && value > s.best_value {
            s.best_value = value;
            s.best = s.cur.clone();
        }
        if i == s.ok.len() || s.cur.len() == s.p.max_seq {
            return;
        }
        let remaining = (s.p.max_seq - s.cur.len()) as i64;
        if value + s.ok[i].cpm_micros * remaining <= s.best_value {
            return; // bound
        }
        let b = s.ok[i].clone();
        let keys = [format!("c:{}", b.category), format!("d:{}", b.adomain), format!("l:{}", b.line_item)];
        if secs + b.dur_s <= s.p.dur_s && keys.iter().all(|k| !s.used.contains(k)) {
            for k in &keys { s.used.insert(k.clone()); }
            s.cur.push(b.clone());
            search(s, i + 1, secs + b.dur_s, value + b.cpm_micros);
            s.cur.pop();
            for k in &keys { s.used.remove(k); }
        }
        search(s, i + 1, secs, value);
    }

    let mut s = S { p, ok: &ok, best: Vec::new(), best_value: -1, cur: Vec::new(),
                    used: Default::default() };
    search(&mut s, 0, 0, 0);
    let mut best = s.best;
    best.sort_by_key(|b| match b.slot_in_pod { 1 => 0, -1 => 2, _ => 1 });
    best
}
```

The search is exponential in the worst case and fast in practice because `maxseq` is small and the price bound prunes early; a pod of 300 seconds with dozens of bids is where a seller switches to a dynamic program over seconds. Guaranteed line items enter first (they are owed delivery), and the search fills the remaining seconds. Each chosen ad becomes a row in `auction_slots` with its position, which is where per-position pricing from Auction Mechanics applies.

## Competitive Separation and Deduplication

Television's rule is that two competing advertisers don't run in the same break: no two car brands, no two airlines, and never the same ad twice. In a pod filled from several demand sources, nothing enforces that unless the filler does:

- **Category separation.** Each ad carries a category (the bid's `cat`, from IAB Tech Lab's content taxonomy, or the seller's own label), and the filler allows one per category per pod. Ad Servers' `exclusion_labels` (kind `competitive`) holds the seller's labels and which line items carry them; programmatic bids are mapped to labels by category and advertiser domain.
- **Advertiser deduplication.** One ad per `adomain` per pod, and ideally per break across a stream.
- **Creative deduplication.** The same commercial bought through two DSPs must not play twice in one pod. `adomain` catches most cases; the universal ad ID catches the rest, which is one reason VAST & Video Ads makes it required. OpenRTB's provisional `poddedupe` signals which deduplication the seller applies, so buyers know why a bid was dropped.
- **Across pods.** Stream-level frequency (Google's ad buffet admits "ads with pod or stream frequency caps") keeps the same ad from opening every break in a two-hour film.

Separation costs money (the second-best car ad loses to a lower bid from a different category), and a seller should log every bid dropped for separation with its reason, both to explain lost bids to buyers and to price the rule.

## Live Events

Live is where SSAI is hardest, for reasons that have nothing to do with ads and everything to do with time:

- **Break timing comes from the stream.** The broadcaster's SCTE-35 markers signal "break starts now, for 120 seconds," and the stitcher learns of the break seconds before viewers reach it. The marker formats and how they ride in HLS are the User-Generated Platforms volume's [Timed Metadata and Ad Breaks](/books/user-generated-platforms/live-latency-and-vods#timed-metadata-and-ad-breaks).
- **Everyone breaks at once.** A live event's viewers all reach the break within the stream's latency spread, so the ad decision server receives a spike of requests proportional to the audience. MediaTailor's **prefetch schedules** exist for this: they "reduce peak load on ad decision servers (ADS) and decrease manifest delivery latency at the start of each ad break" by retrieving and preparing ads ahead of time, with single schedules for predictable avails (created up to 24 hours ahead) and recurring schedules for unpredictable ones, plus TPS-based traffic shaping that spreads requests over a window.
- **Ads must be transcoded before the event.** A creative that isn't ready is skipped, so a live sponsor's ads are registered and transcoded days ahead, not at first serve.
- **Guarantees pace by break, not by hour.** OpenRTB's deal sync lets a seller indicate that "the supply is a real-time broadcast live event" to support live event pacing for guaranteed deals; a sponsor bought "one spot in every break of the final" is a different delivery problem from impressions across a flight, and Pacing & Frequency Capping's controllers don't apply.
- **Joins mid-break.** A viewer who arrives during a break gets a shortened break; the stitcher fills what's left or plays slate, and the ads it skipped must not count.

## How to Build It

The core model logs one auction per opportunity in `auctions`, each bid in `bids` and each delivered event in `ad_events`; Auction Mechanics adds `auction_slots` for positions in multi-slot auctions; Ad Servers adds `exclusion_labels` and `line_item_labels`; Counting Impressions & Clicks adds `server_side`, `counting_policies` (with inventory type `ctv_ssai`) and `beacon_receipts` with the stitcher as `sender`; Connected TV & Streaming adds the stitcher to `ad_requests`; VAST & Video Ads adds served VAST documents and `[SERVERSIDE]` on events. This chapter adds the break and the viewer's session at the stitcher, and puts pod shape on the auction and duration on the bid.

```sql
CREATE TABLE ssai_sessions (              -- one viewer's playback session at a stitcher
  id                 UUID NOT NULL DEFAULT uuidv7(),
  started_at         TIMESTAMPTZ NOT NULL,
  stitcher_org_id    UUID NOT NULL,       -- the SSAI service
  property_id        UUID NOT NULL,       -- the app or channel
  stream_ref         TEXT NOT NULL,       -- the channel or asset ID at the origin
  mode               TEXT NOT NULL CHECK (mode IN ('stitched', 'server_guided')),
  reporting          TEXT NOT NULL CHECK (reporting IN ('server_side', 'client_side')),
  live               BOOLEAN NOT NULL,
  device_ip_prefix   INET,                -- from X-Device-IP, truncated
  device_ua_family   TEXT,                -- from X-Device-User-Agent, parsed
  ifa_type           TEXT,                -- as on the ad requests; the IFA itself is not stored here
  consent            JSONB NOT NULL DEFAULT '{}',  -- TCF, GPP, GPC, COPPA as received at start
  ended_at           TIMESTAMPTZ,
  PRIMARY KEY (started_at, id)
) PARTITION BY RANGE (started_at);

CREATE TABLE ad_breaks (                  -- one break in one session (stitched) or one stream (guided)
  id                  UUID NOT NULL DEFAULT uuidv7(),
  scheduled_at        TIMESTAMPTZ NOT NULL, -- when the break starts in the stream's timeline
  session_started_at  TIMESTAMPTZ,
  session_id          UUID,               -- null for a shared server-guided break
  property_id         UUID NOT NULL,
  pod_ref             TEXT NOT NULL,      -- the podid sent to bidders
  pod_seq             SMALLINT,           -- podseq: position of the pod in the stream
  position            SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 4),  -- [BREAKPOSITION]
  signal_source       TEXT NOT NULL CHECK (signal_source IN ('scte35', 'vmap', 'schedule',
                        'channel_assembly', 'manual')),
  requested_s         INT NOT NULL CHECK (requested_s > 0),   -- from the marker or schedule
  available_s         INT NOT NULL,       -- after a late join or a shortened break
  filled_s            INT NOT NULL DEFAULT 0,
  slate_s             INT NOT NULL DEFAULT 0,  -- padding played instead of ads
  ads_selected        SMALLINT NOT NULL DEFAULT 0,
  ads_skipped_not_ready SMALLINT NOT NULL DEFAULT 0,  -- not transcoded in time
  prefetched          BOOLEAN NOT NULL DEFAULT FALSE,
  auction_id          UUID,               -- the pod's auction, joined by time and ID
  PRIMARY KEY (scheduled_at, id),
  CHECK (filled_s + slate_s <= available_s)
) PARTITION BY RANGE (scheduled_at);

ALTER TABLE auctions
  ADD COLUMN pod_kind TEXT,               -- 'structured', 'dynamic', 'hybrid'; null: not a pod
  ADD COLUMN pod_duration_s INT,          -- poddur
  ADD COLUMN pod_max_seq SMALLINT,        -- maxseq
  ADD COLUMN min_cpm_per_sec_micros BIGINT,  -- mincpmpersec
  ADD COLUMN pod_exact BOOLEAN;           -- durations must sum to the pod duration

ALTER TABLE auctions ADD CONSTRAINT auctions_pod_kind_check
  CHECK (pod_kind IN ('structured', 'dynamic', 'hybrid')) NOT VALID;

ALTER TABLE bids                          -- duration_s (Bid.dur) comes from OpenRTB
  ADD COLUMN slot_in_pod SMALLINT,        -- Bid.slotinpod as bid
  ADD COLUMN separation_key TEXT,         -- the label or category the filler applied
  ADD COLUMN universal_ad_id TEXT;        -- for creative deduplication across bidders

-- loss_reason already holds the OpenRTB code; separation losses also record which bid won the key
ALTER TABLE bids
  ADD COLUMN displaced_by_bid_id UUID;    -- the bid that held the separation key or slot
```

The `auctions` and `bids` alters are on partitioned logs. A check added `NOT VALID` on a partitioned parent is added to every partition, unvalidated, and a later `VALIDATE CONSTRAINT` on the parent checks each partition; `ALTER TABLE ONLY` is rejected for a check on a partitioned table, so there is no per-partition step to script.

Design notes:

- **A break is a record, not an event.** `ad_breaks` says how long the break was meant to be, how much was available to this viewer, how much was filled, how much was slate and how many selected ads were skipped because they weren't transcoded. Fill rate in SSAI is filled seconds over available seconds, and the gap between them is the seller's most actionable number.
- **Sessions carry the device claims once.** The stitcher's view of the viewer (truncated IP, user agent family, IFA type, consent) is recorded at session start, so every break and beacon in the session can be checked against it, and the raw IFA stays in the request log with its own retention.
- **Pod shape lives on the auction.** `pod_kind`, `pod_duration_s`, `pod_max_seq` and `min_cpm_per_sec_micros` are what bidders were told; each filled position is an `auction_slots` row with its bid, so position pricing and slot guarantees are auditable.
- **Separation losses name the winner.** `separation_key` and `displaced_by_bid_id` answer "why did my higher bid lose?" with "an advertiser in the same category held the slot," which is the question buyers ask most about pods.
- **Server-guided breaks are shared.** In SGAI the break is a property of the stream, so `session_id` is null and per-viewer delivery is in the events; in stitched mode each session has its own breaks.
- **Live is a pacing mode.** Prefetch and live flags on the break, with the deal's live-event flag, let pacing and forecasting treat a live event's breaks as a schedule rather than a traffic curve.

## Auditing

- **What each viewer was shown.** For any session: its breaks, what was requested, available, filled and padded, the ads in each pod in order, and which were skipped for transcoding.
- **Who fired which beacon.** Each beacon's sender (stitcher or device), `[SERVERSIDE]` value and device headers, and the playback trigger it was tied to, so server-side counts can be defended under the MRC's client-initiated rule.
- **Why bids lost.** Every pod bid's outcome, its separation key, what displaced it, and the floor it faced (`mincpmpersec` or the duration floor).
- **What the seller promised.** Slot guarantees (`slotinpod`), exact or maximum pod durations, and the deduplication rules in force, so a buyer who paid for first position can see it ran first.

## What This Means for the System You Build

- **Record every break with its requested, available, filled and slate seconds;** fill rate in SSAI is seconds, not requests.
- **Record the mode and the reporting side of each session,** because stitched and server-guided, server-side and client-side beacons count and fail differently.
- **Fire server-side beacons only on playback signals** (segment requests or player events), with device headers and `[SERVERSIDE]`, and accept them only from verified stitchers.
- **Fill pods by total value under duration, count, floor and separation constraints,** guaranteed demand first, and log what each separation rule cost.
- **Separate by category, advertiser and creative,** using the universal ad ID for creative deduplication.
- **Sell first and last slots only when the stitcher can guarantee them.**
- **Prepare live events ahead:** transcode sponsors' ads before the event, prefetch where the service supports it, shape the request spike, and pace guaranteed live deals by break.

## References

**Specifications**

- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), SSAI definition, X-Device headers, ad pod definition, extracting InLine responses from wrappers
- [IAB Tech Lab: OpenRTB 2.6](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), pod fields on Video, Bid.slotinpod and Bid.dur, DurFloors
- [IAB Tech Lab: OpenRTB 2.6 implementation guide](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/implementation.md), structured, dynamic and hybrid pods, slotinpod guidance, mincpmpersec fallback, rqddurs, the pod examples, live event signaling for guaranteed deals
- [IAB Tech Lab: VAST 4.4 draft (GitHub)](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/VAST4.x/main/4.4.md), device headers on server-side calls, server calls concurrent with playback, error 206
- [IAB Tech Lab: VAST 4 macros data](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/VAST/master/vast4macros/data/macros-data.json), the SERVERSIDE and BREAKPOSITION values
- [MRC: Server-Side Ad Insertion and OTT Guidance (August 2021, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/083021%20SSAI%20and%20OTT%20Guidance%20%20FINAL.pdf), the SSAI definition, client-initiated counting, segregation of non-compliant measurement, verification of SSAI providers

**In practice**

- [AWS Elemental MediaTailor: How ad insertion works](https://docs.aws.amazon.com/mediatailor/latest/ug/what-is-flow.html), session start, ADS request, transcoding, skipped untranscoded ads, personalized manifests
- [AWS Elemental MediaTailor: Server-side ad tracking and reporting](https://docs.aws.amazon.com/mediatailor/latest/ug/ad-reporting-server-side.html), beacons on ad segment requests, quartile beacons
- [AWS Elemental MediaTailor: Reporting ad tracking data](https://docs.aws.amazon.com/mediatailor/latest/ug/ad-reporting.html), server-side and client-side reporting chosen per session
- [AWS Elemental MediaTailor: Server-side tracking with server-guided ad insertion](https://docs.aws.amazon.com/mediatailor/latest/ug/ad-reporting-server-side-sgai.html), HLS interstitials, asset lists, sessionless beaconing, player requirements, the stitched and guided comparison
- [AWS Elemental MediaTailor: Prefetching ads](https://docs.aws.amazon.com/mediatailor/latest/ug/prefetching-ads.html), single and recurring prefetch schedules, peak load on ad decision servers, SGAI not needing prefetch
- [Google Ad Manager: Dynamic Ad Insertion](https://support.google.com/admanager/answer/6147120?hl=en), DAI for live linear and VOD, Ad Manager 360 availability
- [Google Ad Manager: Optimized pods](https://support.google.com/admanager/answer/11475449?hl=en), max and exact pod durations, the ad buffet, one line item per pod, competitive exclusion labels, priority and duration in pod filling
