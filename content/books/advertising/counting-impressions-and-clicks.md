+++
title = "Counting Impressions & Clicks"
nav_title = "Counting Impressions"
description = "MRC and IAB counting rules, begin-to-render and count-on-download, beacons, SSAI counting, deduplication, click validation and the event pipeline."
category = "Advertising Industry"
order = 2913
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "measurement", "impressions", "clicks", "data-model"]
+++

An impression is the unit almost all advertising is bought and sold in, and it is not an observation; it is a definition. An ad server decides to serve, the markup travels to a browser, the creative starts to download, it paints into the page, a pixel fires, a server logs the pixel, a classifier decides the request was human, and a daily job adds it to a billable total. Each of those steps is a candidate for "the impression," and different parties have counted at different ones. A click has the same problem: the tap, the publisher's ad server receiving it, the redirect to the advertiser's ad server, and the landing page loading are four events, and the counts at each step differ.

Counting is hard because every party counts its own way and then they compare. The publisher's ad server, the exchange, the DSP, the advertiser's ad server and the verification vendor each count the same impression from their own beacon, at their own moment, with their own filters, and the invoice is priced on one of their counts while the others are used to dispute it. Beacons are lost, delayed, retried and forged; server-side ad insertion makes every beacon come from a data center; caching hides requests; prefetching makes requests nobody saw. And Google Ad Manager is in the middle of moving its display counting from count-on-download to begin-to-render, which changes the most-used impression count on the open web on February 17, 2027.

This chapter covers the MRC and IAB counting rules (begin-to-render, client-initiated counting, caching, prefetch, tracked ads), how ad servers count by inventory type, beacons and pixels, server-side and SSAI counting, deduplication, click measurement and validation, invalid traffic as a step before the billable count, late data, and the event pipeline from beacon to `ad_events` to `delivery_daily`, with a beacon and click endpoint in Go and Rust. It extends `ad_events` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Viewability, Open Measurement in depth and attention are Viewability & Attention; invalid traffic detection and refunds are Invalid Traffic & Ad Fraud; win and billing notices in depth are OpenRTB; VAST tracking events are VAST & Video Ads; the click and cache-buster macros a creative carries are [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco); reconciling one party's count against another's is Reconciliation & Discrepancies; and pacing reads these counts in [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency).

## How the Platforms Do It

As of November 2026, from each platform's help center and the industry guidelines:

| Platform or standard | Impression counted when | Clicks | Invalid traffic | Notes |
| --- | --- | --- | --- | --- |
| **Google Ad Manager** | Display banners: count-on-download today, "counted immediately on ad load," moving to begin-to-render on February 17, 2027; native and interstitial already begin-to-render; apps on the "1-pixel" method; video at the "1st frame"; audio when playback begins | "Counted when it's received, not when the user is redirected"; at most two clicks per impression; clicks without an identifiable ad request are invalid | "Discards impressions and clicks that are considered invalid" | Waits up to one hour for a delayed impression request |
| **Google Ads** | Not covered here (Search Advertising) | Invalid clicks filtered from metrics and billing | Found "before the end of your billing cycle" is removed; found after becomes an "Invalid activity" credit | "Invalid clicks" column and Invalid Activity Credit Report |
| **IAB Tech Lab CTV guidance** | Client-side where possible; a stitcher may report when the ad is sent on the stitched stream, concurrently with playback | n/a | Stitcher requests carry `X-Device-IP` and `X-Device-User-Agent` "to avoid being mistaken as fraudulent traffic" | Server-side counting acceptable "as long as it is initiated based on client-side events" |
| **MRC and IAB guidelines (2017)** | Loaded and "at minimum begin to render"; client-initiated counting only | IAB Click Measurement Guidelines (2009): one click per impression, or multiple with a refractory period, within an impression staleness window | Filtered before counts are reported, under the IVT guidelines | Cache-busting required; prefetch doesn't count |
| **Microsoft (AST)** | Seller tag "uses the 'count on begin to render' methodology" | Not covered here | Not covered here | Web banner tag |

The standards say when an impression may count; the platforms say when theirs does; and the gap between them, for a few more months on Ad Manager's display banners, is one of the reasons two parties' counts differ.

## The Counting Rules

### Begin to render

On October 31, 2017, the MRC, with IAB Tech Lab and the MMA, released final Mobile In-App and Mobile Web measurement guidelines and updated Desktop Display guidelines, moving the minimum to "count-on-begin-to-render" and removing references to "served" impressions. The Desktop Display guideline defines the impression as "the measurement of responses from an ad delivery system to an ad request from the user's browser, which is filtered for invalid traffic and is recorded at a point as late as possible in the process of delivery of the creative material to the user's browser. The ad must be loaded and at minimum begin to render in order to count it as a valid ad impression." "Loaded" means "the logical creative file has been transmitted and received at the client-side," and "render" means "painting the creative file or adding it to any portion of the Document Object Model." Begin to render does not require the ad to be on screen ("It does not require any portion of the ad to be visible"); visibility is the viewable impression, a separate metric with its own guideline (Viewability & Attention).

### Client-initiated counting

The guideline "requires ad counting to use a client-initiated approach." Server-initiated counting, "count on decision or count on insertion," where impressions are counted when the page is served, is "not acceptable ... because they are the furthest away from the user actually seeing the ad." Pass-through is allowed: "signaling interactions detected on the client side from server infrastructure are acceptable." Concretely:

- A valid impression is counted only "when an ad counter receives and responds to an HTTP request for a tracking asset from a client," after the page's content retrieval began and only once the ad content "has been loaded and at minimum begins to render."
- The tracking asset can be requested by `<IMG>`, `<IFRAME>` or `<SCRIPT SRC>`, and the counter's response can be a beacon ("commonly ... a 1x1 pixel image"), a 302 redirect, HTML or JavaScript, or the ad content itself, when the ad server counts its own delivery after render.
- Implementations "in which counting precedes ad content delivery are not acceptable."
- Expandable rich media counts the base impression; expansions are counted separately, "segregated from the original base ad impression count." Backup creatives served when rich media can't render count too, reported separately.

### Caching and prefetch

Cache-busting "is required for all sites and ad-serving organizations": the counter sets `Expires` and `Cache-Control` headers on its responses, and every serve carries a unique string ("random number or date/timestamp append") so a cached response can't swallow a count. This is what `ord=` and `%%CACHEBUSTER%%` are for. Prefetch and prerender requests "do not qualify for measurement as a valid impression unless ad content has been loaded and at minimum begins to render in response to a request by a user."

### Tracked ads

A measurement vendor may report "Tracked Ads," counted when its "measurement assets have fully downloaded and initiated, but prior to ad content loading and rendering." The metric "should not be labeled as an Ad Impression, without qualification." Its use is diagnostic: tracked ads minus rendered impressions is the number of ads that never rendered.

### Apps

The Mobile In-App guideline applies the same begin-to-render rule inside apps, counted through the app's own code or a measurement SDK, and adds a rule that matters for pipelines: "the time at which the ad was rendered must be included within the reporting period and must be prior to billing for that period based on the pre-determined billing cycle. Thereafter, this activity may be reported on a segregated basis." An impression rendered offline on June 30 and reported on July 3 belongs to June only if June hasn't been billed; otherwise it is reported separately, not silently added to a closed month.

## How Ad Servers Count

Google Ad Manager documents its methods per inventory type, and they show how far "the impression" varies even inside one ad server ([Ad Servers](/books/advertising/ad-servers) covers the decision that precedes the count):

- **Display banners** on mobile web, desktop and CTV are count-on-download today: "Display ad impressions are counted immediately on ad load," with a delayed impression request the creative generates, for which Ad Manager waits up to one hour. Count-on-download "involves counting an impression when an ad starts to download to a user's device."
- **On February 17, 2027,** display moves to begin-to-render, which "counts an impression when the ad creative has successfully loaded," for Ad Manager and AdSense. Google expects "a decrease in total display impressions, as BTR counts an impression later in the ad serving process," and has added "Ad server begin to render impressions," "Ad Exchange begin to render impressions," "Yield group begin to render impressions" and "Total begin to render impressions" metrics so publishers can compare the two before the switch. After "a brief ramp-up of traffic," the counts align.
- **Display non-banner** (native, interstitial) is already begin-to-render. An interstitial is counted "when the interstitial is shown to the user, not when a creative is served."
- **Apps** count on the "1-pixel" method: "A mobile app impression is counted when one or more pixels of the ad creative is visible on a device's screen."
- **Video** counts at the "1st frame": "Video ad tags are counted after the player begins playing the ad," with quartiles and completion as separate events.
- **Audio** counts "once the IMA SDK integrated audio player has begun playback of the ad."

Viewability is a later, separate event: Ad Manager's Active View assumes an eligible impression "is assumed to be measurable and not viewable" until the browser sends a pingback (Viewability & Attention). Microsoft's seller tag counts on begin to render. The engineering consequence is that an impression record must carry which method counted it. A line item that serves display banners and native on Ad Manager in January 2027 is counted two ways; a report comparing December 2026 to March 2027 crosses a methodology change; and a discrepancy with an advertiser's ad server counting on render shrinks on February 17 for reasons unrelated to anything either party did. Ad Manager's own note is that "Minor discrepancies are often due to different counting methodologies, latency," while "Significant discrepancies may indicate issues with tag implementation or trafficking."

## Beacons and Pixels

A beacon is any request a counter receives as evidence an event happened. The forms:

- **The ad request or markup fetch itself,** which an ad server counting its own render can use when the markup is the tracking asset.
- **An impression pixel:** a 1x1 image (or `fetch`, or `navigator.sendBeacon`) fired by the creative or the tag at render. VAST's `<Impression>` URLs and OpenRTB's `burl` are the video and programmatic equivalents (VAST & Video Ads, OpenRTB).
- **A JavaScript tag** from a verification vendor, which loads, measures and reports.
- **A redirect:** the click path, where the counter logs the request and answers 302.

Beacon design follows from the counting rules and from the fact that beacons are hostile input:

- **One beacon URL per event, signed at serve.** The ad server mints an impression ID per serve and signs the parameters that matter (impression ID, line item, creative, price, event kind, issue time); the counter verifies the signature, so a forged or replayed URL with a changed line item or price doesn't count. Unsigned beacons are how counts get inflated by anyone who reads the markup.
- **No caching, unique per serve.** `Cache-Control: no-store` and `Expires` in the past on the response, and the impression ID as the unique string, so the MRC's cache-busting requirement is met by construction.
- **Fast and empty.** The response is `204 No Content` or a 43-byte transparent GIF; the counter does no work in the request path beyond verification, a dedupe check and an append to the log.
- **Fired at render, not at decision.** The tag fires the impression beacon from the creative's frame after it has painted, or the ad server counts its markup fetch only when the markup is the render; a beacon fired when the ad server decides is server-initiated counting and not acceptable.

`occurred_at` comes from the client, `received_at` from the counter; both are stored because beacons arrive late (a phone offline, a batched SDK, a delayed SSAI call), and the event's billing day is decided by `occurred_at` under the period-close rule above.

## Server-Side Counting and SSAI

Some environments can't fire a beacon from the client. A server-side ad insertion service stitches ads into a video stream and plays to a device that may have no ad SDK at all; the stitcher fires the tracking calls. The IAB Tech Lab's CTV programmatic guidance favors client-side tracking, citing the MRC rule that server-initiated counting is "the furthest away from the user actually seeing the ad," and allows server-side counting "as long as it is initiated based on client-side events," with pass-through of client signals acceptable. Where the client can't count, an impression "could be reported when the ad is sent on the stitched stream," a session-oriented stitcher may report a session's impressions at session end, and server-originated calls "must be made concurrently with the matching playback events." Anything beyond the stitched stream "should be counted by the player whenever possible."

The fraud problem is that every SSAI beacon comes from the stitcher's data center: "all the tracking is coming from one IP address." So stitchers must send `X-Device-IP` "set to the IP address of the device on whose behalf this request is being made" and `X-Device-User-Agent` set to the client's, and should send `X-Device-Referer` and other `X-Device-` headers that match the original ad request. A counter receiving SSAI beacons records that the beacon was server-side, verifies the stitcher is an allowed sender (by authenticated connection or IP allowlist, since anyone can set an `X-Device-IP` header), and uses the device headers for invalid-traffic analysis rather than the connection's address. CTV spoofing that abuses exactly this path is Invalid Traffic & Ad Fraud; pods and stitching are Server-Side Ad Insertion & Ad Pods.

The same applies to server-to-server notices: OpenRTB's `burl` is called "when a winning bid becomes billable based on exchange-specific business policy," which may be at render or earlier by contract, and `nurl` is "not necessarily indicative of a delivered, viewed, or billable ad." A buyer counting impressions from `burl` is counting the exchange's billing event, not a render, and should know which it is.

## Deduplication

Every beacon path retries. A tag fires twice when a page re-renders, an SDK resends a batch whose acknowledgement was lost, an SSAI service retries a timed-out call, and a user's browser restores a tab. Counting must be idempotent: the same event seen twice counts once. The playbook's rule is at-least-once delivery plus an idempotent receiver, with the event ID created when the event happens and carried by every retry ([Retries Without Double Counting](/docs/telemetry/collection#retries-without-double-counting)), and the same key-based design as an idempotent API ([Idempotency](/docs/requests/idempotency)).

For ad events the key is natural: one impression ID per serve, minted by the ad server and carried in every beacon URL, and one event per (impression, kind), which is the core's `ad_events.dedupe_key` with its unique constraint. Three cases need care:

- **Retried beacons** carry the same impression ID and kind, and the unique constraint makes the second a no-op.
- **Refreshes and re-serves** are new serves with new impression IDs, and count, which is correct: a refreshed slot is a new impression (and, under the Desktop guideline, site-initiated auto-refresh should be disclosed, with its counts reported separately when material).
- **Multiple counters** for the same impression (publisher, exchange, advertiser) are not duplicates; each party counts once in its own system, and the comparison is reconciliation, not deduplication.

Deduplicating at the edge is a cache of recent keys; deduplicating in the store is the constraint; and deduplicating in the warehouse is a distinct on the key across the whole partition, because retries can land hours apart on different collectors. All three are cheap and each catches what the others miss.

## Click Measurement and Validation

The IAB's Click Measurement Guidelines (version 1.0, May 12, 2009) define the click as "the measurement of a user-initiated action on an ad element ... usually causing an HTTP 302 redirect," distinct from an in-unit click that doesn't leave the ad, and break a click into four stages: **initiated** (the user interacts), **measured** (the publisher or its agent counts it, for example on "a successfully sent HTTP 302 re-direct ... or a received HTTP GET"), **received** (the advertiser or its agent records it on arrival) and **resolved** (the landing page loads, "most frequently an HTTP 200"). "Pre-filtration Measured Clicks should always be equal to or higher than Received Clicks," because users abort, redirects time out and landing pages fail; differences between the publisher's count and the advertiser site's referrals are expected, not errors. Prefetch requests are not clicks.

A click is valid under one of two methods:

- **One click per impression:** the click "on a unique ad impression ... has not already been counted for the session."
- **Multiple clicks per impression:** the time since the previous click on the same impression exceeds a "repeat-click-refractory-period" the publisher specifies, to keep a double-tap from counting twice.

Either way, the time from the impression to the click must be less than an "impression-staleness-window" set by the publisher or ad server, and the click must have been redirected and passed general and invalid-click filtration. Google Ad Manager's implementation is a concrete instance: it "counts the click when it's received, not when the user is redirected," counts "a maximum of two clicks associated with the same ad impression," and treats clicks without an identifiable ad request as invalid. Google Ads removes invalid clicks (bots, accidental clicks, clickjacking and ad stacking, and intentional clicks with no interest) from metrics and billing when found "before the end of your billing cycle," and credits them as "Invalid activity" adjustments when found after.

**Redirects.** The pass-through click is a chain of 302s through each party's tracker (publisher ad server, advertiser ad server, sometimes a measurement vendor), built from the click macros in the creative. The IAB notes that an "out of band" method, using client script and absolute URLs instead of 302 chains, allows tracking "without giving redirection power to anyone but the entity responsible for redirecting the user's browser to the advertiser landing page." A click endpoint that redirects to whatever URL its query string names is an open redirect; the landing URL must come from the signed serve, never from an unsigned parameter.

## Invalid Traffic Before the Count

Every counting guideline says impressions are "filtered for invalid traffic" before they are reported; the MRC's IVT guidelines define general and sophisticated invalid traffic (GIVT, SIVT), and Invalid Traffic & Ad Fraud covers detection, the schemes and refunds. For the counting pipeline, the rules are structural: classification is a flag on the event, not a deletion (the core's `ad_events.ivt`); general filters (known data-center ranges, declared bots, malformed or unsigned beacons) run in the stream before the billable roll-up; sophisticated classification can arrive later and restate the roll-up; and the billable count is the event count minus what was flagged, with the flagged count kept (`delivery_daily.invalid_impressions`). Invalid activity found after an invoice becomes a credit line, which is Google Ads' model and the core's.

## Late Data and the Billing Close

Beacons arrive late and the billing period closes on a date. The in-app guideline's rule is the general one: an event counts in its period only if it arrives before that period is billed; after that it is reported separately. The pipeline therefore keys every event to its event time, places it in its event hour, and restates `delivery_daily` with a new `version` as late events arrive, until the period closes; after close, late events go to a segregated late count that the next invoice can carry as an adjustment or that reconciliation can cite. The streaming mechanics (event time versus processing time, watermarks, allowed lateness) are the playbook's [Watermarks and Late Data](/docs/data/streaming#watermarks-and-late-data). Ad Manager's one-hour wait for a delayed impression request is the same idea at serve time: a bounded window for the slow beacon, then a decision.

## The Event Pipeline

From the beacon to the invoice, the records are:

1. **Receipt.** The counter verifies the signature, records a raw receipt (when, what, outcome), and answers in milliseconds.
2. **Event.** A verified, first-seen (impression, kind) becomes an `ad_events` row with its event time, counting method and IVT flag `none`; a duplicate is recorded on the receipt and dropped.
3. **Stream.** Events go to the log stream (not the transactional outbox), where general invalid-traffic filters flag them and pacing reads near-real-time counts.
4. **Classification.** Sophisticated IVT classification and click validation update flags, sometimes hours later.
5. **Roll-up.** `delivery_daily` aggregates per line item or deal, day and source, net of invalid traffic, versioned on each restatement until the period closes.
6. **Invoice and reconciliation.** Invoice lines price on the controlling source's roll-up; other sources' roll-ups are compared under the contract's tolerance (Reconciliation & Discrepancies).

Each step is replayable from the one before: receipts rebuild events, events rebuild roll-ups. That is what lets a counting policy change (Ad Manager's February 2027 switch is one) be applied to new data without rewriting the old.

## How to Build It

Counting adds the raw receipts, the counting policy each source applies, and click validation, and records on each event and roll-up which policy counted it:

```sql
CREATE TABLE counting_policies (         -- how one source counts one kind of inventory; versioned
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  source_org_id          UUID NOT NULL REFERENCES organizations (id),  -- whose counter
  inventory_type         TEXT NOT NULL CHECK (inventory_type IN ('display_banner',
                           'display_non_banner', 'native', 'app', 'video', 'audio', 'ctv_ssai')),
  impression_trigger     TEXT NOT NULL CHECK (impression_trigger IN ('count_on_download',
                           'begin_to_render', 'one_pixel', 'first_frame', 'playback_start',
                           'stream_send')),
  click_method           TEXT NOT NULL CHECK (click_method IN ('one_per_impression',
                           'multiple_with_refractory')),
  max_clicks_per_impression SMALLINT,    -- e.g. 2
  refractory_ms          INT,             -- repeat-click refractory period
  staleness_window_s     INT NOT NULL,    -- impression to click
  beacon_wait_s          INT NOT NULL DEFAULT 3600,  -- how long to wait for a delayed impression beacon
  server_side_allowed    BOOLEAN NOT NULL DEFAULT FALSE,  -- SSAI, with device headers
  effective              TSTZRANGE NOT NULL,
  disclosure_ref         TEXT,            -- where the method is disclosed to buyers
  CHECK (click_method <> 'multiple_with_refractory' OR refractory_ms IS NOT NULL),
  EXCLUDE USING gist (source_org_id WITH =, inventory_type WITH =, effective WITH &&)  -- needs btree_gist
);

CREATE TABLE beacon_receipts (           -- every beacon as received, before it is an event
  id               UUID NOT NULL DEFAULT uuidv7(),
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind             TEXT NOT NULL,         -- 'impression', 'click', 'video_start', ...
  impression_id    TEXT,                  -- from the signed URL; null when the signature failed to parse
  client_occurred_at TIMESTAMPTZ,         -- the client's clock, when sent
  outcome          TEXT NOT NULL CHECK (outcome IN ('counted', 'duplicate', 'bad_signature',
                     'expired', 'stale_click', 'refractory', 'click_cap', 'unknown_serve',
                     'rejected_sender')),
  server_side      BOOLEAN NOT NULL DEFAULT FALSE,  -- sent by a stitcher or server, not the device
  sender           TEXT,                  -- the stitcher or server identity, when server-side
  ip_prefix        INET,                  -- truncated (/24, /48); X-Device-IP when server-side
  ua_family        TEXT,                  -- parsed family and version, not the string
  ad_event_id      UUID,                  -- the event it became, when counted
  PRIMARY KEY (received_at, id)
) PARTITION BY RANGE (received_at);     -- hourly; shortest retention of any log

CREATE TABLE click_validations (         -- the decision on one click
  click_event_id     UUID NOT NULL,       -- the ad_events row of kind 'click'
  click_occurred_at  TIMESTAMPTZ NOT NULL,
  impression_id      TEXT NOT NULL,
  impression_age_ms  BIGINT,              -- click time minus impression time
  prior_clicks       SMALLINT NOT NULL,   -- on the same impression, before this one
  valid              BOOLEAN NOT NULL,
  reasons            TEXT[] NOT NULL DEFAULT '{}',  -- 'stale', 'refractory', 'cap', 'ivt', 'no_impression'
  counting_policy_id UUID NOT NULL REFERENCES counting_policies (id),
  validated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (click_occurred_at, click_event_id)
) PARTITION BY RANGE (click_occurred_at);

ALTER TABLE ad_events ADD COLUMN counting_policy_id UUID,   -- no FK across partitioned logs
                      ADD COLUMN count_method TEXT,          -- the policy's impression_trigger, denormalized
                      ADD COLUMN server_side BOOLEAN NOT NULL DEFAULT FALSE,
                      ADD COLUMN impression_id TEXT;         -- the serve's ID; dedupe_key is (impression_id, kind)

ALTER TABLE delivery_daily ADD COLUMN counting_policy_id UUID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_counting_policy_fk
  FOREIGN KEY (counting_policy_id) REFERENCES counting_policies (id) NOT VALID;
ALTER TABLE delivery_daily ADD COLUMN late_impressions BIGINT NOT NULL DEFAULT 0,  -- arrived after close
                           ADD COLUMN server_side_impressions BIGINT NOT NULL DEFAULT 0,
                           ADD COLUMN tracked_ads BIGINT;    -- measurement initiated, rendered or not

CREATE INDEX CONCURRENTLY ad_events_p2026112218_impression_idx
  ON ad_events_p2026112218 (impression_id, occurred_at);  -- one per hourly partition
-- then ALTER INDEX ... ATTACH PARTITION each to a parent index created ON ONLY ad_events
```

The counter's request path verifies the beacon, deduplicates by inserting the event under its unique key, and answers with an uncacheable empty response; the click path also validates and redirects only to the signed landing URL. The signature covers the parameters the serve set; the `ad_events` insert relies on the core's `UNIQUE (occurred_at, dedupe_key)`, with `occurred_at` taken from the signed serve time so a retry lands on the same row:

```go tab="Go"
// Serve is what the ad server signed into the beacon URL at serve time.
type Serve struct {
	ImpressionID string
	LineItemID   string
	CreativeID   string
	LandingURL   string
	ServedAt     time.Time
}

type Store interface {
	// InsertEvent appends an ad_events row; it returns false when (served_at, impression_id:kind) exists.
	InsertEvent(ctx context.Context, s Serve, kind string) (bool, error)
	// PriorClicks counts clicks already recorded for this impression.
	PriorClicks(ctx context.Context, impressionID string) (int, error)
}

type Counter struct {
	Key          []byte        // HMAC key shared with the ad server, rotated by key ID in practice
	Store        Store
	Staleness    time.Duration // impression-staleness window
	MaxClicks    int           // e.g. 2 per impression
	BeaconMaxAge time.Duration // reject very old impression beacons
}

func (c *Counter) verify(q url.Values) (Serve, bool) {
	ts, err := strconv.ParseInt(q.Get("t"), 10, 64)
	if err != nil {
		return Serve{}, false
	}
	payload := strings.Join([]string{q.Get("imp"), q.Get("li"), q.Get("cr"), q.Get("u"), q.Get("t")}, "|")
	mac := hmac.New(sha256.New, c.Key)
	mac.Write([]byte(payload))
	want := mac.Sum(nil)
	got, err := base64.RawURLEncoding.DecodeString(q.Get("sig"))
	if err != nil || !hmac.Equal(got, want) {
		return Serve{}, false
	}
	return Serve{q.Get("imp"), q.Get("li"), q.Get("cr"), q.Get("u"), time.UnixMilli(ts)}, true
}

func noStore(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Expires", "Thu, 01 Jan 1970 00:00:00 GMT")
}

// Impression handles GET /i?imp=..&li=..&cr=..&u=..&t=..&sig=..
func (c *Counter) Impression(w http.ResponseWriter, r *http.Request) {
	noStore(w)
	s, ok := c.verify(r.URL.Query())
	if ok && time.Since(s.ServedAt) <= c.BeaconMaxAge {
		_, _ = c.Store.InsertEvent(r.Context(), s, "impression") // a duplicate is a no-op
	}
	w.WriteHeader(http.StatusNoContent) // same answer either way; outcomes go to beacon_receipts
}

// Click handles GET /c?...; it always redirects to the signed landing URL when the signature holds.
func (c *Counter) Click(w http.ResponseWriter, r *http.Request) {
	noStore(w)
	s, ok := c.verify(r.URL.Query())
	if !ok {
		http.Error(w, "bad request", http.StatusBadRequest) // never redirect to an unsigned URL
		return
	}
	valid := time.Since(s.ServedAt) <= c.Staleness
	if valid {
		if n, err := c.Store.PriorClicks(r.Context(), s.ImpressionID); err == nil && n >= c.MaxClicks {
			valid = false
		}
	}
	if valid {
		_, _ = c.Store.InsertEvent(r.Context(), s, "click")
	}
	http.Redirect(w, r, s.LandingURL, http.StatusFound) // the user lands whether or not the click counts
}
```

```rust tab="Rust"
use axum::{extract::{Query, State}, http::{header, HeaderMap, StatusCode}, response::{IntoResponse, Redirect, Response}};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use chrono::{DateTime, Duration, Utc};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::{collections::HashMap, sync::Arc};

/// What the ad server signed into the beacon URL at serve time.
pub struct Serve {
    pub impression_id: String,
    pub line_item_id: String,
    pub creative_id: String,
    pub landing_url: String,
    pub served_at: DateTime<Utc>,
}

#[async_trait::async_trait]
pub trait Store: Send + Sync {
    /// Appends an ad_events row; false when (served_at, impression_id:kind) exists.
    async fn insert_event(&self, s: &Serve, kind: &str) -> anyhow::Result<bool>;
    async fn prior_clicks(&self, impression_id: &str) -> anyhow::Result<u32>;
}

pub struct Counter {
    pub key: Vec<u8>, // HMAC key shared with the ad server
    pub store: Arc<dyn Store>,
    pub staleness: Duration,
    pub max_clicks: u32,
    pub beacon_max_age: Duration,
}

impl Counter {
    fn verify(&self, q: &HashMap<String, String>) -> Option<Serve> {
        let get = |k: &str| q.get(k).cloned().unwrap_or_default();
        let ts: i64 = get("t").parse().ok()?;
        let payload = [get("imp"), get("li"), get("cr"), get("u"), get("t")].join("|");
        let mut mac = Hmac::<Sha256>::new_from_slice(&self.key).ok()?;
        mac.update(payload.as_bytes());
        let sig = URL_SAFE_NO_PAD.decode(get("sig")).ok()?;
        mac.verify_slice(&sig).ok()?; // constant-time comparison
        Some(Serve {
            impression_id: get("imp"),
            line_item_id: get("li"),
            creative_id: get("cr"),
            landing_url: get("u"),
            served_at: DateTime::from_timestamp_millis(ts)?,
        })
    }
}

fn no_store() -> HeaderMap {
    let mut h = HeaderMap::new();
    h.insert(header::CACHE_CONTROL, "no-store".parse().unwrap());
    h.insert(header::EXPIRES, "Thu, 01 Jan 1970 00:00:00 GMT".parse().unwrap());
    h
}

/// GET /i?imp=..&li=..&cr=..&u=..&t=..&sig=..
pub async fn impression(State(c): State<Arc<Counter>>, Query(q): Query<HashMap<String, String>>) -> Response {
    if let Some(s) = c.verify(&q) {
        if Utc::now() - s.served_at <= c.beacon_max_age {
            let _ = c.store.insert_event(&s, "impression").await; // a duplicate is a no-op
        }
    }
    (StatusCode::NO_CONTENT, no_store()).into_response()
}

/// GET /c?...: redirects only to the signed landing URL.
pub async fn click(State(c): State<Arc<Counter>>, Query(q): Query<HashMap<String, String>>) -> Response {
    let Some(s) = c.verify(&q) else {
        return (StatusCode::BAD_REQUEST, no_store()).into_response(); // never redirect to an unsigned URL
    };
    let mut valid = Utc::now() - s.served_at <= c.staleness;
    if valid {
        if let Ok(n) = c.store.prior_clicks(&s.impression_id).await {
            valid = n < c.max_clicks;
        }
    }
    if valid {
        let _ = c.store.insert_event(&s, "click").await;
    }
    (no_store(), Redirect::to(&s.landing_url)).into_response() // 303 in axum; use a 302 response if partners expect it
}
```

Both sketches leave out what production needs and the design notes name: writing a `beacon_receipts` row for every outcome, a key ID for rotation, and the counting policy lookup. The prior-click check and the insert are two steps, so two simultaneous clicks can both pass the cap; the validation job recomputes `prior_clicks` from the stored events and marks the later one invalid in `click_validations`, which is why the request path's decision is provisional and the billable count reads the validation.

Design notes:

- **Every event carries the method that counted it.** `ad_events.count_method` and `counting_policy_id`, and the same on `delivery_daily`, let a report cross Ad Manager's February 2027 switch or compare two sources' counts knowing which was count-on-download, begin-to-render, first frame or stream send. Policies are versioned with `effective` and an exclusion constraint, so a method change is a new row, not an edit.
- **Receipts are raw, short-lived and private.** `beacon_receipts` records every beacon's outcome (counted, duplicate, bad signature, stale, capped, rejected sender) so a count can be explained and an attack seen, with the IP truncated to a prefix and the user agent reduced to a family; it has the shortest retention of any log ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **Dedupe on the serve's identity.** The impression ID is minted at serve, signed into every beacon, and the event's `occurred_at` for the dedupe key is the signed serve time, so a retry hours later hits the same `(occurred_at, dedupe_key)` row. The client's clock is kept on the receipt for analysis but doesn't move the event between partitions.
- **Signed beacons, signed landing URLs.** The HMAC covers the impression, line item, creative, landing URL and serve time; an unsigned or altered beacon doesn't count, and the click path never redirects to a URL it didn't sign, which closes the open redirect the IAB's out-of-band note warns about.
- **The user always lands.** A click that fails validation (stale, capped) still redirects; validation decides whether it counts and bills, not whether the user reaches the advertiser.
- **Server-side beacons are a separate class.** `server_side` and `sender` on receipts and events, and `server_side_impressions` on the roll-up, keep SSAI counts distinguishable, and the policy's `server_side_allowed` says which senders may count at all. The device headers feed invalid-traffic analysis, never authentication.
- **Late events after close are segregated.** `delivery_daily.late_impressions` holds events whose `occurred_at` falls in a billed period but which arrived after the close, reported separately as the in-app guideline requires, instead of silently restating an invoiced day.
- **Tracked ads are not impressions.** Where a measurement vendor reports measurement initiated, it goes in `tracked_ads`, labeled as such, and the difference from rendered impressions is a rendering diagnostic.
- **Exactly-once is a property of keys, not of the stream.** The stream can deliver twice; the unique key and the warehouse distinct make the count exact ([Exactly-Once, as Each Documents It](/docs/data/streaming#exactly-once-as-each-documents-it)).

## Auditing

- **Every counting policy as it applied,** per source and inventory type, with its effective dates and the disclosure buyers were given, because the MRC guidelines require the method to be disclosed and a dispute asks which method was in force.
- **Every beacon's outcome** for the retention window, so an inflated or missing count can be traced to signatures, duplicates or rejected senders.
- **Every click validation** with its reasons, and every invalid click credited after billing.
- **Every restatement of a delivery day,** with the version, the reason (late data, IVT reclassification) and whether it fell before or after the billing close.
- **Server-side counts and their senders,** separable from client-side counts, for CTV and audio disputes.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails#amend-don-t-overwrite).

## What This Means for the System You Build

- **Count on begin to render, client-initiated,** and record on every event and roll-up which method counted it; expect Ad Manager's display counts to move on February 17, 2027.
- **Sign every beacon at serve** with the impression ID, line item, creative, price and landing URL, and refuse what doesn't verify.
- **Make every beacon uncacheable and unique per serve,** and never count prefetches or decisions.
- **Deduplicate on (impression, kind)** at the edge, in the store and in the warehouse.
- **Validate clicks** with a staleness window and a per-impression cap or refractory period, always redirect the user, and redirect only to signed URLs.
- **Treat SSAI and server-to-server beacons as their own class,** from allowed senders, with device headers for analysis.
- **Flag invalid traffic, don't delete it,** and subtract it before the billable roll-up.
- **Place late events by event time, restate until close, and segregate after.**

## References

**Specifications**

- [IAB: MRC, IAB Tech Lab and MMA release revised ad measurement guidelines (October 31, 2017)](https://www.iab.com/news/mrc-joined-iab-tech-lab-mma-announces-releases-revised-ad-measurement-guidelines-mobile-app-mobile-web-desktop-display/), count-on-begin-to-render as the minimum and removal of served impressions
- [IAB and MRC: Desktop Display Impression Measurement Guidelines v1.1](https://www.iab.com/wp-content/uploads/2017/11/Desktop-Display-Impression-Measurement-Guidelines-US-MMTF-Final-v1.1.pdf), the impression definition, loaded and render, client-initiated counting, beacons, rich media, tracked ads, auto-refresh, prefetch and cache-busting
- [IAB and MRC: Mobile In-App Measurement Guidelines v1.1](https://www.iab.com/wp-content/uploads/2017/11/Mobile-In-App-Measurement-Guidelines-MMTF-Final-v1.1.pdf), SDK-based measurement and the rule that a rendered impression counts in its period only before billing
- [IAB: Click Measurement Guidelines v1.0 (May 12, 2009)](https://www.iab.com/wp-content/uploads/2015/06/click-measurement-guidelines2009.pdf), the click definition, the initiated, measured, received and resolved stages, valid click methods, the refractory period, the staleness window and out-of-band tracking
- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), X-Device-IP and X-Device-User-Agent from stitchers, server-side counting initiated by client events, and stream-send impressions
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), nurl not indicative of a delivered ad and burl called when a bid becomes billable
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), OMID, platforms, the signals verification vendors receive and the CTV format support

**In practice**

- [Google Ad Manager Help: Begin-to-render impression counting for display ads](https://support.google.com/admanager/answer/16896667), the February 17, 2027 switch, methods per inventory type, definitions, new metrics and the expected decrease
- [Google Ad Manager Help: Counting impressions and clicks](https://support.google.com/admanager/answer/2521337?hl=en), display, app, interstitial, video and audio counting, the one-hour wait, clicks counted on receipt, two clicks per impression and discrepancy causes
- [Google Ad Manager Help: Monitor Active View measurement](https://support.google.com/admanager/answer/6123557), eligible impressions assumed measurable and not viewable until a pingback
- [Google Ads Help: Invalid traffic](https://support.google.com/google-ads/answer/2549113), invalid click types, removal before the end of the billing cycle and invalid activity credits
- [Microsoft Learn: Seller Tag (AST)](https://learn.microsoft.com/en-us/xandr/seller-tag/seller-tag), count on begin to render
