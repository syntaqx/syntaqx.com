+++
title = "Ad Tags, Rendering & Page Performance"
nav_title = "Ad Tags & Rendering"
description = "Publisher ad tags, size mapping, lazy loading and refresh, SafeFrame, Heavy Ad Intervention, Core Web Vitals and ads, ad blocking and Chrome ad filtering."
category = "Advertising Industry"
order = 2911
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "ad-serving", "web-performance", "core-web-vitals", "data-model"]
+++

An ad tag is the code on a publisher's page that turns an empty `<div>` into an ad: it tells the ad server which ad unit and sizes the slot has, sends the request with the page's targeting and consent state, receives markup, puts that markup into an iframe, and reports what happened. Google Publisher Tag (GPT) for Google Ad Manager, Microsoft's seller tag (AST), Prebid.js in front of either, and an app's SDK in place of all of them do the same job. The tag is where the ad business meets the page's own engineering, and every decision it makes (when to request, how much space to hold, whether to refresh, how to isolate the creative) is paid for in revenue on one side and in the page's speed and stability on the other.

It is hard because the tag runs other people's code on the publisher's page. The creative comes from an advertiser's ad server, wraps a verification vendor's script, and loads assets the publisher never saw; it can be heavy, it can shift the layout when it arrives, it can block the main thread while the reader is trying to scroll, and it can try to break out of its frame. The browser has its own opinions: Chrome unloads ads that use too much CPU or network, filters every ad on a site that fails the Better Ads Standards, and Core Web Vitals score the page, ads included. Ad blockers remove what they don't accept. And the ad server has rules too: Ad Manager requires refreshing inventory to be declared, at intervals no shorter than it allows.

This chapter covers the tag's lifecycle (slots, size mapping, single request architecture, lazy loading, refresh, collapsing), iframes and SafeFrame, the browser's interventions (Heavy Ad Intervention, Chrome's ad filtering, the fate of fenced frames), Core Web Vitals and how ads move them, ad blocking and Acceptable Ads, and the records that let a publisher see what its tags did. It extends `ad_units` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) with a render configuration per ad unit and a log of render reports, with a report receiver in Go and Rust. Formats, sizes and load limits are the previous chapter, [Ad Formats & Standards](/books/advertising/ad-formats); how the ad server decides is [Ad Servers](/books/advertising/ad-servers); how the rendered ad is counted as an impression is [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks); Prebid's auction and key-values are Header Bidding & Prebid; and app SDK rendering is In-App Advertising & Mediation. The generic rules for third-party scripts and Core Web Vitals are the playbook's [Web Performance](/docs/frontend/web-performance#targets-core-web-vitals), which this chapter applies to ads.

## How the Platforms Do It

As of November 2026, from each project's developer documentation:

| Platform | Tag and request | Isolation | Loading and refresh | Performance rules |
| --- | --- | --- | --- | --- |
| **Chrome** | n/a (the browser) | Same-origin policy; fenced frames "Scheduled for phaseout" | n/a | Heavy Ad Intervention since Chrome 85: unloads an ad without user interaction past 60 seconds of main thread in total, 15 seconds in any 30, or 4 MB of network; removes all ads on sites failing the Ad Experience Report for more than 30 days |
| **Google Ad Manager (GPT)** | `googletag.defineSlot` per slot; Single Request Architecture through `setConfig({ singleRequest })` | SafeFrame configurable per page and slot; `forceSafeFrame`, push and overlay expansion, `sandbox` | `lazyLoad` with `fetchMarginPercent`, `renderMarginPercent`, `mobileScaling`; `refresh()`, refreshing inventory declared, 30-second minimum for time and event refresh | Guides to reserve slot space in CSS, avoid `fluid` above the fold, collapse with care; `threadYield` to yield the main thread |
| **Microsoft (AST)** | Seller tag that "consolidates all ad slots on a page" in "a single ad request whenever possible," loaded asynchronously | SafeFrame API reference | Documented in the AST API reference | Counts impressions on begin to render |
| **Prebid.js** | Header bidding wrapper in front of the ad server (Header Bidding & Prebid) | Renders the winning bid's markup through the ad server's creative | Bids can expire before render with "GPT lazy load or other delayed render"; `suppressStaleRender` once auto-refresh "is implemented correctly" | Bidder timeout set by the publisher |

Two things the table shows. The tag owns the timing (when to fetch, when to render, when to refresh) and the browser owns the limits; nobody owns both, so a publisher has to measure the result. And every tag converges on the same three controls: one request for many slots, lazy fetch and render with margins, and refresh under rules.

## The Tag Lifecycle

A GPT page goes through the same steps whatever the sizes. Most of GPT's page-level switches have moved to `googletag.setConfig` and `slot.setConfig`; `enableSingleRequest()`, `enableLazyLoad()`, `collapseEmptyDivs()`, `setTargeting()` and `setSafeFrameConfig()` are deprecated in GPT's reference in favor of `PageSettingsConfig.singleRequest`, `.lazyLoad`, `.collapseDiv`, `.targeting` and `.safeFrame`, so new code uses the config form:

```html
<style>
  /* Reserve the space before the ad arrives: the CLS fix (see Core Web Vitals and Ads) */
  #ad-top { min-height: 90px; }
  @media (max-width: 727px) { #ad-top { min-height: 50px; } }
</style>
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(() => {
    const mapping = googletag.sizeMapping()
      .addSize([1024, 768], [[970, 90], [728, 90]])
      .addSize([0, 0], [[320, 50], [300, 50]])
      .build();

    googletag.defineSlot("/1234/news/top", [[970, 90], [728, 90], [320, 50], [300, 50]], "ad-top")
      .defineSizeMapping(mapping)
      .addService(googletag.pubads());

    googletag.setConfig({
      singleRequest: true,                       // one request for every slot defined before display()
      collapseDiv: "ON_NO_FILL",                 // start expanded, collapse only if nothing fills
      lazyLoad: { fetchMarginPercent: 200, renderMarginPercent: 100, mobileScaling: 2.0 },
      safeFrame: { allowOverlayExpansion: false, allowPushExpansion: false, sandbox: true },
      threadYield: "ENABLED_ALL_SLOTS",
    });
    googletag.enableServices();
    googletag.display("ad-top");
  });
</script>
```

The steps:

**Define slots early.** GPT's best practices define above-the-fold slots "in the `<head>` of your document," and every slot that should share a request is defined before the first `display()`. Each slot names its ad unit path and its sizes (one fixed size, a list that may include `"fluid"`, or a list plus a size mapping).

**Map sizes to viewports.** A size mapping is a list of viewport sizes to ad sizes; GPT "uses the largest viewport mapping that fits," comparing width then height, and falls back to the sizes passed to `defineSlot()` when the mapping is invalid or the viewport can't be read. An empty size list for a viewport means no ad there; in GPT's own example, viewports under 640x480 get no ad.

**Request once.** Single Request Architecture (SRA) bundles every slot into one request, so "page-level competitive exclusions and roadblocks are honored": a roadblock (one advertiser in every slot) and a competitive exclusion (no two airlines on the page) can only be enforced by a server that sees all the slots at once. Microsoft's AST does the same, sending all slots "in a single ad request whenever possible." The cost is that the request waits for every slot's configuration, which is why slots are defined first.

**Lazy fetch and lazy render.** `lazyLoad` takes `fetchMarginPercent` ("the minimum distance from the current viewport a slot must be before we request an ad"), `renderMarginPercent` (the same, before rendering) and `mobileScaling` (a multiplier on mobile). Setting a margin to `-1` disables it. GPT's defaults are not published as numbers: omitted values use Google's defaults, which "will be tuned over time," so a publisher that needs stable behavior sets them explicitly. With SRA, lazy fetching only works when all slots start outside the fetch margin, because one request carries them all. Fetching earlier than rendering lets the auction finish before the slot is close, so the ad is ready when it scrolls in; rendering late saves the creative's CPU and bandwidth for slots nobody may reach.

**Render into a frame.** The markup goes into an iframe, friendly (same-origin, scriptable by the page) or cross-origin, which is SafeFrame's subject below. GPT emits `slotRenderEnded`, `slotOnload` and `impressionViewable` events per slot, which the page listens to for rendering, empty slots and viewability.

**Collapse what doesn't fill.** `collapseDiv` takes `DISABLED` (never collapse), `BEFORE_FETCH` (start collapsed, "expand when an ad is returned") or `ON_NO_FILL` (start expanded, "collapse if no ad is returned"). GPT warns that collapsing "should be used with caution because it can introduce unintended layout shifts," and its advice is to start likely-filled slots expanded and unlikely-filled ones collapsed.

**Yield the thread.** `threadYield` controls whether GPT yields the main thread between slots: `DISABLED`, or `ENABLED_ALL_SLOTS` to yield for every slot "regardless of whether the slot is within the viewport." Yielding lets the browser handle input between ad work, which is what INP measures.

## Refresh

Refreshing a slot replaces its ad without reloading the page, and it is where revenue and policy pull hardest. GPT's `refresh()` "populates registered slots, including slots that haven't loaded yet or slots with existing content," works only for slots registered with `display()`, and generates a new correlator by default. GPT's guidance:

- **No faster than 30 seconds.** "Avoid refreshing slots more frequently than once every 30 seconds" to avoid throttling.
- **Only viewable slots.** Refreshing slots nobody saw lowers the ActiveView rate; GPT's sample waits for `impressionViewable` and then 60 seconds before refreshing.
- **No `clear()` before `refresh()`,** which only lengthens the time a blank slot is visible.
- **Use refresh, not page reloads.** "Refreshing ads inappropriately can lead to performance issues and negatively impact viewability rates."

Ad Manager's policy adds declaration. Publishers declare refreshing inventory under Inventory rules, targeting only the ad units, placements or key-values that actually refresh and selecting the trigger types; not declaring, or declaring incorrectly, "is a violation of Google policy." The declared minimum is 30 seconds for event-triggered and time-based refresh on desktop and mobile web and for time-based refresh in apps (where 60 is recommended), with no minimum for refreshes caused by user action. A refresh at an interval the interface doesn't offer is declared at the next shorter one (180 seconds for a 220-second refresh), because declaring longer than the real rate is a violation. User-action refreshes must come from "user-guided navigation" that surfaces substantially new content: hovering, scrolling, gameplay clicks or new comments don't qualify. Declarations apply to open and private auctions, First Look and Open Bidding, and Google applies buyer demand restrictions to every request matching the declaration's targeting, including non-refreshing units if the targeting is too broad. Declaring in the interface "doesn't implement refreshes"; the page does that.

The engineering rule is that refresh is configuration, not code scattered through the page: one place says which units refresh, on what trigger, at what interval, whether viewability is required first, and what was declared to the ad server, and the page script reads it. When the declared and implemented intervals disagree, the declaration is wrong and the publisher is in violation.

## Iframes and SafeFrame

An ad renders in an iframe so its HTML, CSS and script don't collide with the page's. The kind of iframe decides what the ad can do:

- **A friendly iframe** is same-origin with the page. The creative's script can reach the parent document, read its URL, measure its own position and resize itself, which is convenient for rich media and verification and is also exactly what a malicious creative wants.
- **A cross-origin iframe** is served from a different host, so the browser's same-origin policy stops the creative from touching the page. The creative can no longer see where it is, whether it is visible, or ask for more room, unless the host offers an API.

SafeFrame is that API. IAB's SafeFrame 1.0 dates from March 2013 and version 1.1 (March 2014, released August 2014) added whether the top window is in focus. The host creates "an iframe that has a different-origin, hostname, and domain than the host Webpage," a "cross-domain-barrier," and the host "MUST have a secondary host name" from which the SafeFrame resources are served. Inside, the creative calls `$sf.ext`: `register` to declare its size and a status callback, `supports` to learn what the host allows, `geom` for its geometry and how far it may expand, `expand` and `collapse` (with `push` to move content instead of overlaying it), `status`, `meta` for host-passed metadata, `cookie` where the host permits, `inViewPercentage` and `winHasFocus`. Every feature is optional to the host. SafeFrame 2.0, which IAB Tech Lab put out for public comment after "a major overhaul," drops the prescriptive host implementation, aligns with MRAID, and notes that browser features like the Intersection Observer now do some of what SafeFrame did; "Above all, security was and still is the first priority for SafeFrame."

GPT's SafeFrame settings are the host side: `forceSafeFrame` renders every ad in SafeFrame, `allowOverlayExpansion` and `allowPushExpansion` say whether an expanding ad may cover or push content, and `sandbox` uses "the HTML5 sandbox attribute to prevent top level navigation without user interaction." `useUniqueDomain` is deprecated because "It is no longer possible to disable this feature." Slot-level settings override page-level ones.

My default is cross-origin for every third-party creative, sandboxed against top-level navigation, with expansion off except on units sold as expanding. A friendly iframe is for house ads and creatives the publisher built; anything served by an advertiser's ad server or carrying a third-party tag is cross-origin. The isolation is also a security boundary: a creative in a friendly frame that has been compromised can rewrite the page, and the mechanisms for blocking that (content security policy on the page, sandbox flags on the frame) are the playbook's [Content Security Policy](/docs/security/security-headers#content-security-policy). Malvertising itself, redirects and the review that catches them, is Ad Review, Policies & Malvertising.

**Fenced frames.** Chrome built fenced frames as a stronger isolation for ads chosen by Privacy Sandbox's Protected Audience auction, a frame that could not talk to its embedder at all. On October 17, 2025, Google said it would retire Protected Audience, Topics, Attribution Reporting and Shared Storage, keeping CHIPS, FedCM and Private State Tokens. The fenced frame page now lists the feature as "Scheduled for phaseout," with a Blink intent titled "Remove FencedFrame element and window.fence APIs." No new ad rendering path should depend on them; the history and what replaced the Sandbox are Third-Party Cookies & Browser Privacy.

## Heavy Ad Intervention

Chrome unloads ads that use too many resources. Since Chrome 85, an ad frame that the user has not interacted with (no tap or click) is heavy if it uses the main thread "for more than 60 seconds in total," "more than 15 seconds in any 30 second window," or "more than 4 megabytes of network bandwidth." The CPU limits count execution time, not elapsed time. Chrome adds noise and variability to the thresholds by default to protect privacy, so an ad near a limit may be unloaded on one load and not the next; developers can disable the noise with the `#heavy-ad-privacy-mitigations` flag to test deterministically.

When an ad is unloaded, Chrome sends an `intervention` report through the Reporting API, with `body.id` of `HeavyAdIntervention` and a message such as "Ad was removed because its CPU usage exceeded the limit." The report goes to "the root ad-tagged iframe and its descendants," which means a cross-site ad's own provider receives it, not the publisher. `sourceFile`, `lineNumber` and `columnNumber` are often `null` because the limit is reached somewhere other than the cause. Reports arrive two ways:

- **By header:** the ad frame's response sets `Reporting-Endpoints`, and intervention reports go to the endpoint named `default` without any policy header. Chrome sends them as a JSON array of objects with `age`, `body`, `type`, `url` and `user_agent`, as `application/reports+json`, delayed "up to a minute" to batch them.
- **In JavaScript:** a `ReportingObserver` in the ad frame sees the report before the frame is removed. Because the frame may go before the report is sent, Chrome's guidance is a `pagehide` handler that calls `takeRecords()` and sends with `navigator.sendBeacon()` (best-effort), never `unload` or `beforeunload`.

The IAB's load limits are lower than Chrome's (a medium rectangle's initial load plus subload is 450 kB, well under 4 MB, and the guidance caps CPU at 30% per ad), so a creative that follows the New Ad Portfolio should never trip the intervention. One that does is a creative problem, and the ad server that served it is the party able to see the report.

## Core Web Vitals and Ads

Core Web Vitals judge the page at the 75th percentile of real loads: LCP of 2.5 seconds or less, INP of 200 ms or less, CLS of 0.1 or less ([Targets: Core Web Vitals](/docs/frontend/web-performance#targets-core-web-vitals)). Ads count against all three, and web.dev puts it plainly: "Ads are one of the largest contributors to layout shifts on the web."

### Layout shift

A layout shift's score is "impact fraction * distance fraction," and CLS is the largest session window of shifts, a burst with "less than 1-second in between each shift and a maximum of 5 seconds" in total. An ad that arrives after the content below it has painted pushes that content down by the ad's height: a 250-pixel ad inserted at the top of a phone screen moves everything below it. Shifts within 500 ms of a tap, click or keypress get `hadRecentInput` and don't count; scrolling doesn't qualify, so an ad that lands as the reader scrolls does count. Shifts inside iframes count toward the metric even though the Layout Instability API in the parent page doesn't see them, and cross-origin frames may be impossible to measure from JavaScript.

The fix is space reserved in CSS before the ad loads. GPT's guide: "reserve a sufficient amount of space for a given ad slot using CSS," with `min-height` and `min-width` per breakpoint; "Reserving space with JavaScript should be avoided." For a multi-size slot it offers four strategies: reserve for the largest size (no shift, blank space around smaller ads), reserve for the smallest (larger creatives shift), reserve an average, or reserve from fill data: if most creatives are 300x250, "reserving `250px` vertically can greatly reduce CLS." Centering softens the blank space. GPT's other rules:

- Without CSS dimensions, a multi-size slot is sized to the shortest declared height and widest declared width when `display()` is called, which then shifts when a taller ad arrives.
- "fluid sized ads always cause layout shifts": only below the fold, fetched early.
- Collapsing an empty slot shifts the page as much as inserting an ad; web.dev agrees that "Removing the space set aside for elements can cause just as much CLS as inserting content." Start likely-filled slots expanded.
- "Take special care with slots near the top of the initial viewport": shifts there are disproportionately large.
- Keep adjusting until "75th percentile CLS is less than 0.1."

Reserving space costs blank space when the slot doesn't fill, and the trade is a number: the slot's fill rate by size, from the publisher's own data. My rule is to reserve for the size that fills most often on each breakpoint, and to refuse sizes taller than the reservation in slots above the fold.

### Loading and responsiveness

Ads affect LCP when ad script competes with the page's main content for the network and the main thread during load; the [Third-Party Scripts](/docs/frontend/web-performance#third-party-scripts) rule (an owner, a reason, loading after the content) applies, and GPT and AST both load asynchronously so their requests don't block rendering. Ads affect INP when ad script runs long tasks while the reader interacts: rendering many slots in a row, a creative animating in script, a verification script measuring. Lazy rendering below the fold, GPT's `threadYield`, the LEAN CPU cap and the Heavy Ad Intervention all push the same way. The page's own real-user monitoring is what shows the effect ([Real-User Monitoring](/docs/observability/frontend-and-synthetic#real-user-monitoring)); a lab run on a fast machine with an ad blocker installed shows none of it.

## Ad Blocking and Acceptable Ads

Ad blockers remove ad requests and elements by filter lists. The Acceptable Ads program, which eyeo administers "on behalf of the Acceptable Ads Committee," defines ads that participating blockers let through by default, and publishers or ad companies apply to be allowed. Its criteria are concrete:

- **Distinction:** ads are labeled "advertisement" or an equivalent and clearly distinguishable from content.
- **Desktop size and placement:** up to 200px high above the primary content, 350px wide beside it, 400px high below it, 250px high within it; ads above the fold "must not occupy in total more than 15 percent of the visible portion of the web page," and 25% below the fold.
- **Mobile:** total ad space no more than 50% of the visible page; sticky ads at most 75px (or 15%) high; ads over 300px high only below the primary content.
- **Excluded:** animated ads (except a 6x1 mobile sticky ad following LEAN animation with a close button), autoplay sound or video, pop-ups and pop-unders, expanding, overlay and interstitial page ads, rich media and pre-roll video.

Participation is free for about 90% of participants; large entities pay eyeo a fee, and "participants cannot pay to avoid the criteria." For engineering, the point is that an acceptable-ads inventory is a different set of ad units with different formats, configured separately and reported separately, so a blocked user's impressions are not mistaken for unfilled ones.

## Chrome's Ad Filtering

Chrome enforces the Better Ads Standards itself. Sites are reviewed against the standards, and violations are reported to the site's owner in Google's Ad Experience Report, separately for desktop and mobile, with each experience found, the page and sometimes a screenshot or video. After fixing them, the owner submits the site for re-review, which covers the whole domain. Starting February 15, 2018, Chrome removes "all ads from sites" that have a "failing" status in the report for more than 30 days. Chrome later extended the filtering beyond its first markets; I could not open a primary source for the date of the global expansion. <!-- source-gap: adv-chrome-ad-filter-global-date | missing | date Chrome extended Better Ads filtering worldwide | closes with: the Chromium blog post of January 9, 2019 or a Google help page with the date | checked: 2026-11-22 -->

The filter removes every ad on the site, not just the offending experience, so for a publisher the Ad Experience Report status is a revenue metric, and a new format or placement (a sticky video, a prestitial) is reviewed against the standards before it ships, not after the report fails.

## How to Build It

A publisher's ad tags are configuration that the page reads, and their results are reports that come back. The configuration extends `ad_units`; the reports join `ad_events` by impression:

```sql
CREATE TABLE ad_unit_render_configs (    -- how the tag requests and renders one ad unit; versioned
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_unit_id             UUID NOT NULL REFERENCES ad_units (id),
  effective              TSTZRANGE NOT NULL,     -- one config per unit at a time
  size_mapping           JSONB NOT NULL DEFAULT '[]',  -- [{"viewport": [1024, 768], "sizes": [[728, 90]]}, ...]
  reserved_heights_px    JSONB NOT NULL DEFAULT '{}',  -- min-height per breakpoint, e.g. {"0": 50, "728": 90}
  collapse               TEXT NOT NULL DEFAULT 'disabled' CHECK (collapse IN ('disabled',
                           'before_fetch', 'on_no_fill')),
  lazy_fetch_margin_pct  INT,                   -- null: tag default; -1: disabled
  lazy_render_margin_pct INT,
  lazy_mobile_scaling_milli INT,                -- 2000 = 2.0x
  single_request         BOOLEAN NOT NULL DEFAULT TRUE,
  isolation              TEXT NOT NULL DEFAULT 'safeframe' CHECK (isolation IN ('safeframe',
                           'cross_origin', 'friendly')),
  allow_overlay_expansion BOOLEAN NOT NULL DEFAULT FALSE,
  allow_push_expansion   BOOLEAN NOT NULL DEFAULT FALSE,
  sandbox                BOOLEAN NOT NULL DEFAULT TRUE,  -- no top-level navigation without a gesture
  refresh_trigger        TEXT NOT NULL DEFAULT 'none' CHECK (refresh_trigger IN ('none', 'time',
                           'event', 'user_action')),
  refresh_interval_s     INT,                   -- time and event refresh
  refresh_requires_viewable BOOLEAN NOT NULL DEFAULT TRUE,
  refresh_max_per_view   SMALLINT,              -- cap on refreshes per page view
  declared_interval_s    INT,                   -- what was declared to the ad server; <= the real interval
  declared_at            TIMESTAMPTZ,
  created_by             TEXT NOT NULL,         -- typed actor
  CHECK (refresh_trigger = 'none' OR declared_at IS NOT NULL),
  CHECK (refresh_trigger NOT IN ('time', 'event') OR refresh_interval_s >= 30),
  CHECK (declared_interval_s IS NULL OR declared_interval_s <= refresh_interval_s),
  EXCLUDE USING gist (ad_unit_id WITH =, effective WITH &&)   -- needs btree_gist
);

CREATE TABLE ad_render_reports (         -- what the browser, the tag or RUM said happened
  id               UUID NOT NULL DEFAULT uuidv7(),
  occurred_at      TIMESTAMPTZ NOT NULL,  -- now() minus the report's age
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source           TEXT NOT NULL CHECK (source IN ('reporting_api', 'reporting_observer',
                     'tag_event', 'rum')),
  kind             TEXT NOT NULL CHECK (kind IN ('heavy_ad_cpu', 'heavy_ad_network',
                     'heavy_ad_other', 'render_error', 'empty_slot', 'layout_shift', 'long_task',
                     'safeframe_violation', 'other')),
  ad_unit_id       UUID,                  -- when the report can be tied to a slot
  creative_id      UUID,
  line_item_id     UUID,
  impression_key   TEXT,                  -- the ad_events dedupe key's impression ID, when known
  value_micro      BIGINT,                -- layout shift score x 1,000,000, or ms for a long task
  page_origin      TEXT,                  -- origin only; no path, query or fragment
  message          TEXT,                  -- the browser's message, as sent
  browser          TEXT,                  -- family and major version from the user agent, not the string
  PRIMARY KEY (occurred_at, id)
) PARTITION BY RANGE (occurred_at);     -- hourly, like the core logs; short retention

ALTER TABLE ad_units ADD COLUMN acceptable_ads BOOLEAN NOT NULL DEFAULT FALSE;  -- an Acceptable Ads unit
ALTER TABLE ad_units ADD COLUMN above_fold BOOLEAN;  -- drives reservation and the fluid rule

CREATE INDEX CONCURRENTLY ad_unit_render_configs_unit_idx ON ad_unit_render_configs (ad_unit_id);
CREATE INDEX ad_render_reports_creative_idx ON ONLY ad_render_reports (creative_id, occurred_at);
-- then CREATE INDEX CONCURRENTLY on each hourly partition and ATTACH PARTITION to this index
```

The report receiver accepts the Reporting API's batches at the endpoint named `default` in the ad frame's `Reporting-Endpoints` header and keeps only intervention reports, classified by kind. The creative ID travels in the report's `url` (the ad frame's URL, which the ad server controls), so the receiver parses it from there; the rest of the URL is dropped:

```go tab="Go"
// Report is one entry in a Reporting API batch (application/reports+json).
type Report struct {
	Age       int64           `json:"age"` // ms between the report's creation and its delivery
	Type      string          `json:"type"`
	URL       string          `json:"url"`
	UserAgent string          `json:"user_agent"`
	Body      json.RawMessage `json:"body"`
}

type InterventionBody struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type RenderReport struct {
	OccurredAt time.Time
	Kind       string
	CreativeID string // from the ad frame URL's crid parameter; "" if absent
	Origin     string
	Message    string
}

// ParseReports keeps heavy ad interventions from a batch, received at now.
func ParseReports(r io.Reader, now time.Time) ([]RenderReport, error) {
	var batch []Report
	dec := json.NewDecoder(io.LimitReader(r, 64<<10)) // a batch is small; refuse large bodies
	if err := dec.Decode(&batch); err != nil {
		return nil, err
	}
	var out []RenderReport
	for _, rep := range batch {
		if rep.Type != "intervention" {
			continue
		}
		var b InterventionBody
		if json.Unmarshal(rep.Body, &b) != nil || b.ID != "HeavyAdIntervention" {
			continue
		}
		u, err := url.Parse(rep.URL)
		if err != nil {
			continue
		}
		out = append(out, RenderReport{
			OccurredAt: now.Add(-time.Duration(rep.Age) * time.Millisecond),
			Kind:       heavyKind(b.Message),
			CreativeID: u.Query().Get("crid"),
			Origin:     u.Scheme + "://" + u.Host, // never the path or query
			Message:    b.Message,
		})
	}
	return out, nil
}

// heavyKind classifies by Chrome's message text, which is not a stable API.
func heavyKind(msg string) string {
	switch m := strings.ToLower(msg); {
	case strings.Contains(m, "cpu"):
		return "heavy_ad_cpu"
	case strings.Contains(m, "network"):
		return "heavy_ad_network"
	default:
		return "heavy_ad_other"
	}
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};
use serde::Deserialize;
use url::Url;

/// One entry in a Reporting API batch (application/reports+json).
#[derive(Deserialize)]
struct Report {
    age: i64, // ms between the report's creation and its delivery
    #[serde(rename = "type")]
    kind: String,
    url: String,
    body: serde_json::Value,
}

pub struct RenderReport {
    pub occurred_at: DateTime<Utc>,
    pub kind: &'static str,
    pub creative_id: Option<String>, // from the ad frame URL's crid parameter
    pub origin: String,
    pub message: String,
}

/// Keeps heavy ad interventions from a batch received at `now`.
pub fn parse_reports(bytes: &[u8], now: DateTime<Utc>) -> Result<Vec<RenderReport>, serde_json::Error> {
    if bytes.len() > 64 * 1024 {
        return Ok(Vec::new()); // a batch is small; refuse large bodies
    }
    let batch: Vec<Report> = serde_json::from_slice(bytes)?;
    Ok(batch
        .into_iter()
        .filter(|r| r.kind == "intervention" && r.body["id"] == "HeavyAdIntervention")
        .filter_map(|r| {
            let u = Url::parse(&r.url).ok()?;
            let message = r.body["message"].as_str().unwrap_or_default().to_string();
            Some(RenderReport {
                occurred_at: now - Duration::milliseconds(r.age),
                kind: heavy_kind(&message),
                creative_id: u.query_pairs().find(|(k, _)| k == "crid").map(|(_, v)| v.into_owned()),
                origin: u.origin().ascii_serialization(), // never the path or query
                message,
            })
        })
        .collect())
}

/// Classifies by Chrome's message text, which is not a stable API.
fn heavy_kind(msg: &str) -> &'static str {
    let m = msg.to_lowercase();
    if m.contains("cpu") {
        "heavy_ad_cpu"
    } else if m.contains("network") {
        "heavy_ad_network"
    } else {
        "heavy_ad_other"
    }
}
```

On the publisher's side, layout shifts are attributed to slots in the page, since the parent cannot see inside cross-origin ad frames but can see its own slot containers move. A `PerformanceObserver` on `layout-shift` entries checks whether any source node is, or contains, an ad slot `<div>`, and sends the slot's ad unit path and the shift's value with the page's real-user beacon:

```js
const slots = new Map([...document.querySelectorAll("[data-ad-unit]")].map((el) => [el, el.dataset.adUnit]));
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.hadRecentInput) continue;               // excluded from CLS
    for (const source of entry.sources ?? []) {
      for (const [el, adUnit] of slots) {
        if (source.node && (el === source.node || el.contains(source.node) || source.node.contains(el))) {
          navigator.sendBeacon("/rum/ad-shift", JSON.stringify({ adUnit, value: entry.value }));
        }
      }
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

The `sources` list names the elements that moved, which "may only be indirectly related to the root cause": content below a slot that grew is a source, and so is the slot. Attribution by containment is a heuristic, which is why `ad_render_reports.source` is `rum` and the dashboards say so.

Design notes:

- **Render config is versioned per ad unit.** `effective` and the exclusion constraint keep one configuration live at a time, so a CLS regression or a refresh policy notice can be matched to the configuration that was live, and the page script reads the current row (through the ad server's key-values or the publisher's own config service) rather than hard-coding values.
- **Refresh is declared before it runs.** The checks require a declaration timestamp for any refreshing unit, a 30-second floor on time and event refresh, and a declared interval no longer than the real one, which mirrors Ad Manager's rule that declaring longer than the implemented rate is a violation. Viewability before refresh defaults on.
- **Reports are privacy data.** A Reporting API report carries the frame's URL and user agent. The receiver keeps the origin, the creative ID and the browser family, and drops the path, query string, full user agent and client IP; retention is short and the table is partitioned to drop by hour ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **The receiver is a public, unauthenticated endpoint.** Anyone can post to it, so it limits body size, rate-limits by source ([Rate Limiting](/docs/requests/rate-limiting#what-to-key-on)), validates the report shape, and treats counts as indicative, never billable.
- **Event time from `age`.** A report's `age` is how long it waited before delivery (Chrome batches for up to a minute), so `occurred_at` is receipt time minus age, the same event-time rule the core uses for beacons.
- **Join to delivery by impression.** `impression_key` and `creative_id` connect a report to `ad_events`, so the heavy-ad rate per creative (interventions over impressions) is a query, and a creative over a threshold goes back to creative QA in [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco).
- **Empty and blocked are different.** A slot the tag reports empty (`slotRenderEnded` with no ad) is unfilled; a slot whose request never left because a blocker removed it produces no tag event at all, so blocked traffic shows up only as page views without ad requests. Acceptable Ads units carry their own flag so their delivery isn't mixed in.

## Auditing

- **Every render configuration as it was live.** Size mapping, reservation, lazy margins, isolation, expansion and refresh, with who changed it and when, so a performance regression or a policy notice is traced to a change.
- **Every refresh declaration.** What was declared to the ad server, for which units and triggers, at what interval, against what the page implemented, because the policy question is whether they matched.
- **Every intervention and render failure by creative.** Heavy ad interventions, render errors and SafeFrame violations per creative and line item, kept for the creative's life, so a buyer can be shown why a creative was paused.
- **The Ad Experience Report status over time** per site and environment, with each review and re-review, since a failing status removes every ad.
- **Ad-attributed layout shift by unit,** with the method labeled as an attribution heuristic.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails#typed-actors).

## What This Means for the System You Build

- **Define slots early and request them together** with single request architecture, so roadblocks and competitive exclusions hold.
- **Reserve every slot's space in CSS** per breakpoint from fill data, keep `fluid` below the fold, and collapse only slots unlikely to fill.
- **Set lazy fetch and render margins explicitly** instead of relying on tag defaults that change.
- **Treat refresh as declared configuration:** viewable first, no faster than 30 seconds, declared to the ad server at or below the real interval.
- **Render third-party creatives cross-origin,** in SafeFrame with sandboxing and expansion off by default; don't build on fenced frames.
- **Hold creatives to the LEAN limits** so Chrome's Heavy Ad Intervention never fires, and receive its reports at the ad frame's `default` reporting endpoint.
- **Measure ads' effect on CLS, INP and LCP with real-user data,** attributed to slots, and keep the Ad Experience Report passing, because failing removes every ad.
- **Keep Acceptable Ads inventory and blocked traffic separate** from unfilled inventory in reporting.

## References

**Specifications**

- [IAB: SafeFrame 1.1](https://iabtechlab.com/wp-content/uploads/2016/03/SafeFrames_v1.1_final.pdf), version history, the secondary host name and cross-domain barrier, and the $sf.ext functions
- [IAB Tech Lab: SafeFrame](https://iabtechlab.com/standards/safeframe/), SafeFrame 2.0 in public comment, MRAID alignment, Intersection Observer and security as the first priority
- [IAB: New Ad Portfolio Fixed Size Ad Specifications](https://www.iab.com/wp-content/uploads/2019/04/IABNewAdPortfolio_LW_FixedSizeSpec.pdf), initial load and subload weights and the 30% CPU cap per ad
- [Coalition for Better Ads: Better Ads Standards](https://www.betterads.org/standards/), the experiences Chrome's filtering enforces
- [Acceptable Ads: The Acceptable Ads Standard](https://acceptableads.com/standard/), the committee and eyeo, labeling, desktop and mobile size limits, excluded formats and fees

**Reference**

- [Chrome Developers: Heavy ad interventions](https://developer.chrome.com/blog/heavy-ad-interventions), the CPU and network thresholds, user interaction, Chrome 85, noise, the intervention report, its recipients and the pagehide guidance
- [Chrome Developers: Monitor your web application with the Reporting API](https://developer.chrome.com/docs/capabilities/web-apis/reporting-api), Reporting-Endpoints, intervention reports to the default endpoint, the payload fields, content type and batching delay
- [Chrome Developers: Improving advertising on the web](https://developer.chrome.com/blog/better-ads), February 15 start and removal of all ads after 30 days failing
- [Google Search Console Help: Ad Experience Report](https://support.google.com/webtools/answer/7159932), violations listed per environment and whole-domain re-review
- [Privacy Sandbox: Fenced frames](https://privacysandbox.google.com/3pcd/fenced-frame), scheduled for phaseout and the intent to remove the element and window.fence APIs
- [Privacy Sandbox: Update on plans for Privacy Sandbox technologies (October 17, 2025)](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), the retired APIs and those kept
- [web.dev: Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls), ads among the largest contributors, reserving space, top-of-viewport shifts and collapsing
- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls), the score formula, session windows, recent input and iframes
- [web.dev: Debug layout shifts](https://web.dev/articles/debug-layout-shifts), layout-shift entries, sources and PerformanceObserver

**In practice**

- [Google Publisher Tag: Reference](https://developers.google.com/publisher-tag/reference), PageSettingsConfig (collapseDiv, lazyLoad, singleRequest, safeFrame, threadYield), LazyLoadConfig, SafeFrameConfig, refresh and the deprecations
- [Google Publisher Tag: Ad sizes](https://developers.google.com/publisher-tag/guides/ad-sizes), multi-size sizing without CSS, fluid rendering and size mapping rules
- [Google Publisher Tag: Minimize layout shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift), reserving space, the multi-size strategies, fluid, collapsing and above-the-fold slots
- [Google Publisher Tag: Control ad loading and refresh](https://developers.google.com/publisher-tag/guides/control-ad-loading), the 30-second guidance, viewable-only refresh and disableInitialLoad
- [Google Publisher Tag: Best practices](https://developers.google.com/publisher-tag/guides/ad-best-practices), defining slots in the head, SRA and roadblocks, lazy loading and refresh
- [Google Publisher Tag: Lazy loading sample](https://developers.google.com/publisher-tag/samples/lazy-loading), lazy fetching with SRA
- [Google Ad Manager Help: Declare inventory that refreshes](https://support.google.com/admanager/answer/6286179), declarations, minimum intervals, user-action refresh and buyer restrictions
- [Microsoft Learn: Seller Tag (AST)](https://learn.microsoft.com/en-us/xandr/seller-tag/seller-tag), single request, asynchronous loading, SafeFrame and begin-to-render counting
- [Prebid.js: setConfig](https://docs.prebid.org/dev-docs/publisher-api-reference/setConfig.html), expired bids with lazy load and suppressStaleRender with auto-refresh
