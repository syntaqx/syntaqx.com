+++
title = "Viewability & Attention"
description = "MRC viewable impressions for display and video, measured and undetermined rates, cross-media 100% pixels, duration weighting, and the 2025 attention guidelines."
category = "Advertising Industry"
order = 2934
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "viewability", "attention", "data-model"]
+++

An impression counts when an ad begins to render, which doesn't require any of it to be on screen. A banner at the bottom of a long article, a video player in a background tab and an ad in a feed scrolled past in a quarter second all count. Viewability is the second count that answers whether the ad had a chance to be seen: under the MRC's guideline, a display ad is viewable when at least 50% of its pixels are on an in-focus browser tab, in the viewable space of the page, for at least one continuous second; a video ad, 50% of its pixels for two continuous seconds of play. Attention is a third, newer layer that asks whether a person actually looked, listened or engaged, and what it predicts.

Viewability is hard because the measurer often can't see what it is measuring. An ad in a cross-domain iframe can't read its own position on the page; an ad in an app is a native view a script can't inspect; a CTV ad plays on a screen with no viewport to speak of; and the measurer's tag may not be allowed to run at all. So the guideline is as much about honest reporting of what could not be measured as about the thresholds: every served impression is viewable, not viewable or undetermined, and a rate computed by quietly treating the undetermined as not viewable, or as viewable, misstates the buy. Attention is harder: it is a model of human behavior, built from signals, eye tracking, panels or neuroscience, with very different validity, and the 2025 guidelines spend most of their length on validation and disclosure.

This chapter covers the MRC viewable impression for display, large display and video, how measurers observe it (polling, geometry, browser APIs, SafeFrame, OM SDK), the three reporting buckets and the measured and viewable rates, the session rule, video without player integration, the cross-media standard's 100% threshold and duration weighting, viewability as a pricing basis (vCPM), and the IAB/MRC Attention Measurement Guidelines of November 2025, with an impression classifier in Go and Rust. It extends `ad_events` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), which already has a `viewable_impression` event kind and a `viewable_impressions` column. Accreditation of the vendors who measure it is [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc); the served impression underneath is [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks); vCPM billing is [Pricing Models](/books/advertising/pricing-models); and audiences built from viewable impressions are [Audience & Cross-Media Measurement](/books/advertising/audience-measurement).

## How the Platforms Do It

As of November 2026, from each standard and platform's documentation and the MRC's accreditation list:

| Platform or standard | Viewable definition | Reporting | Accreditation (MRC digital list) |
| --- | --- | --- | --- |
| **DoubleVerify** | MRC thresholds | Viewable display and video; attention metrics | Viewable display (D, MW, MA) and video (D, MW, MA, CTV certified apps only); attention metrics (D, MW, MA) |
| **Google Ad Manager (Active View)** | Display: "50% of a creative's pixels have been in the browser viewport area for 1 continuous second"; video: "the requirement is 2 seconds" | Eligible impressions "assumed to be measurable and not viewable" until a pingback says otherwise | Viewable display and video (D, MW, MA) |
| **Integral Ad Science** | MRC thresholds | Viewable display and video, pre-bid viewability | Viewable display (D, MW, MA) and video (D, MW, MA, CTV, certified traffic) |
| **Meta** | Not stated on the pages opened | First-party measurement | Viewable video in-app only; viewable display not listed |
| **MRC Viewable Ad Impression Guidelines v2.0** (June 2014, updated August 2015) | Display 50% / 1 s; large display (242,500 pixels or more) 30% / 1 s; video 50% of the ad's pixels / 2 s of play | Viewable, non-viewable and undetermined buckets; measured rate and viewable rate | The baseline every accreditation above is audited against |
| **MRC Cross-Media Phase I (Video)** (September 2019) | "100% of pixels on screen for at least two continuous seconds" for combined, deduplicated cross-media video | Duration weighted viewable impressions as an additional metric | Applies to cross-media audience services |
| **IAB and MRC Attention Measurement Guidelines v1.0** (November 2025) | Attention accrues on a base of MRC-viewable, SIVT-filtered impressions with a user's presence indicated or confirmed | Non-viewable attention only as a separate, diagnostic presentation | DoubleVerify attention metrics are the one accredited entry on the digital list |

The thresholds are the same everywhere; the differences are in who may measure, on which surfaces, and through which integration.

## The Viewable Impression

The MRC guideline sets the definitions, and its words are the ones contracts reference:

- **Display.** "50% of the pixels in the advertisement were on an in-focus browser tab on the viewable space of the browser page" for "one continuous second," post ad render. The clock starts only once the pixel threshold is met.
- **Large display.** "for display ads sized at 242,500 pixels (which is equivalent to the size of a 970 x 250 pixel display ad) or greater," the ad counts if 30% of its pixels are in view for one continuous second, because half of a billboard-sized unit can exceed a small screen's visible area.
- **Video.** 50% of the ad's pixels in view while "2 continuous seconds of the video advertisement is played." The guideline's footnote distinguishes the ad's pixels from the player's: measuring 50% of the video player's pixels is a different criterion that "should be prominently disclosed," supported by evidence that the difference is immaterial.
- **Audio.** "detection of audio is not currently a requirement," because measurers can't reliably detect unmuted audio, though audio presence is encouraged where it can be measured. (The cross-media standard tightens this, below.)
- **In focus.** An ad in a background tab is not viewable no matter where it sits on the page. Prefetched and prerendered pages aren't viewable until they are actually rendered and seen.

Three rules turn the definition into counts:

- **Every viewable impression is a served impression.** It must meet the served-impression criteria (client-side counting, invalid traffic filtration), and "In no case should viewable impressions exceed rendered served impressions counted on a campaign."
- **Once per session.** "Once an ad qualifies as a valid viewable impression, it should only be counted as one viewable impression within that user session", even if the user scrolls away and back; the extra exposure adds to time in view, not to the count.
- **Each ad on its own.** In a multi-ad buy such as a page takeover, "each ad should be measured independently for viewability, and reported independently," whatever the contract says about paying only when all units are viewable.

Mobile has its own MRC guideline (Mobile Viewable Ad Impression Measurement Guidelines, June 2016), and the IAB and MRC retail media guidelines restate the general rule that a strong user interaction (a click or tap) can make an impression viewable before the time and pixel thresholds are met, as long as accidental clicks are accounted for.

## How a Measurer Observes It

A viewability measurement is a series of observations of the ad's geometry and the page's state, with rules about how often to look.

**Polling.** The guideline's minimums: "for viewable display impression processes, 100 milliseconds; for viewable video impression processes, 200 milliseconds," which "equate to 10 consecutive positive observations." A measurer may poll display at up to 200 ms only if it "can empirically validate" that this makes no material difference, revalidated at least annually and "prominently disclosed." Event-driven measurers that watch state changes (scroll position, window size and tab focus) instead of polling continuously may do so, polling at the minimums once a change is seen.

**Techniques.** The guideline's appendix lists the first three families, apps and players add a fourth, and each has a cost:

- **Geometric measurement** of the ad's rectangle against the viewport, which works only when the script can see both, so it fails in cross-domain iframes unless something tells it the geometry.
- **Direct communication** from the environment: browser APIs (the guideline mentions the Page Visibility API as supporting evidence of tab focus, but "neither ... should be considered as standalone solutions"), SafeFrame, which gives a contained creative its position from the host, and publisher communication.
- **Browser optimization** techniques, which the appendix lists with full or partial browser coverage, without describing the mechanism.
- **Apps and players** through the Open Measurement SDK, where the app exposes the native view's geometry and the player's state through the OMID API, and the vendor's script decides. OM SDK's page lists what it provides: when ads appear on screen, "percentage in view, and for how long," on-screen placement, overlay transparency and quartiles.

**Undetermined, not guessed.** If the only evidence is weak (a visibility API alone), "the ad should be classified as one with viewability undetermined." Extrapolations "should be fully disclosed along with pre-determined estimates of accuracy," and extrapolated counts are segregated from observed ones.

**Video without player integration.** For click-to-play video, the click can stand for the first 200 ms observation, since the ad is presumably in view when clicked; for auto-play video, the measurer "cannot assume this video is viewable upon execution" and must know by other means, with auto-play counts segregated from click-to-play when material.

## Measured Rate and Viewable Rate

The guideline requires three mutually exclusive counts, disclosed at least at the campaign level: viewable impressions, non-viewable served impressions, and impressions with viewable status undetermined, and it recommends also reporting the total rendered served impressions that is their sum. The metrics computed from them, with the guideline's own example of 1,000 rendered served impressions of which 300 are viewable, 200 non-viewable and 500 undetermined:

```text
measured rate          = (viewable + non_viewable) / rendered_served      = (300 + 200) / 1000 = 50%
viewable rate          = viewable / (viewable + non_viewable)            = 300 / 500          = 60%
impression distribution = each bucket / rendered_served                   = 30% / 20% / 50%
```

The guideline is explicit that the 30% share is not the viewable rate: calling it that "assumes that all undetermined were non-viewable, thought to be an overly conservative presentation." The reverse error, reporting viewable over measured as if it held for all impressions, overstates. Contracts that buy on viewability need to say which number they mean, and the reporting needs to carry all three counts so either can be computed. A campaign under third-party verification also gets early review: before 20% of expected volume, or within five business days of launch.

Viewability also becomes a price. On a vCPM line item the advertiser pays per thousand viewable impressions, so the viewable count is the billable count and its source, measured rate and method are the contract's business ([Pricing Models](/books/advertising/pricing-models)). Buys with a viewability guarantee or a minimum viewable rate need the measured rate too, since a vendor that can measure only a fraction of the traffic can't certify the rest.

## Cross-Media: 100% and Duration

When digital video is combined with TV into one deduplicated audience, the MRC's Cross-Media Audience Measurement Standards (Phase I, Video, September 2019) set a stricter bar so that a digital impression is comparable to a TV commercial on a screen in a room:

- **"100% of pixels on screen for at least two continuous seconds"** for both digital and linear video in combined, deduplicated cross-media reports, with audio presence measured where feasible and viewable-and-audible duration reported separately.
- **Viewable impressions are the minimum qualifying unit** for cross-media reach, frequency and GRPs.
- **Duration weighting** is required "as an additional metric" for cross-media video frequency and GRPs from January 2021, "in addition to, not in replacement of" the unweighted metrics, and it "shall not be applied to content."

The standard's duration weighting is relative to creative length, and caps credit at completion:

```text
duration_weighted_viewable_impressions (DWVI) = Σ viewable_duration / ad_unit_length
  where any one exposure's viewable duration is capped at the creative length
duration_weighted_frequency = Σ DWVI / Σ unique audience with a viewable impression
duration_weighted_GRP       = Σ DWVI / universe × 100
```

The standard's illustration: three creatives of 6, 15 and 30 seconds with average viewable durations of 2, 10 and 25 seconds each deliver one viewable impression per exposure, but 0.33, 0.67 and 0.83 duration-weighted viewable impressions, which is the comparison viewable impressions alone can't make. It also warns that "duration weighing is NOT a measure of ad effectiveness." The engineering consequence is that viewable time must be recorded per impression in milliseconds (at least second granularity, sub-second recommended), not just a boolean.

## Attention

The IAB and MRC Attention Measurement Guidelines (version 1.0, November 2025) cover "all known approaches to attention measurement, including data signal-based tracking, visual tracking, physiological and neurological observations, as well as panel and survey-based methodologies." They draw the line between viewability and attention plainly: viewability is "the measurement of an ad condition," the opportunity to see, "whereas attention is the measure of whether the ad was seen or heard by a person and to what depth."

The minimums, which every method must meet:

- **Attention is an audience metric.** The MRC "considers attention to be a measure of audience (a measure of persons, not devices, as persons generate attention)," so the digital audience-based requirements apply: viewability or audibility, "full sophisticated invalid traffic (SIVT) filtration," and "indication or confirmation of presence of a user." Identifying the person or their demographics is not required.
- **Viewable first, diagnostic otherwise.** Standard attention measurement accrues "after the viewable/audible condition is met." Attention measured without or before viewability is allowed only "separately presented and distinguished in reporting as non-standard and diagnostic," only on ads that were visible at all (any portion on screen for any non-zero time) and only on compliant begin-to-render impressions. Viewability's thresholds must be continuous; once met, viewable and attentive time may accumulate non-continuously within the session, and attentive time relative to viewable time is "strongly" encouraged as a reported measure.
- **Not an outcome.** "Attention in and of itself should not be considered or used as a measure of outcomes for purposes of evaluating campaign performance"; it may qualify impressions for connection to outcomes, and its correlation with outcomes needs "rigorous empirical support, validation, and independent audit."
- **Validated models only.** Unvalidated predictive models "without empirical support" are excluded from the guidelines' scope, and base inputs into attention approaches "must be audited in addition to the underlying attention measurement methodology" for accreditation.

The four method families, and what each produces:

| Method | Signals | Typical output | What the guidelines stress |
| --- | --- | --- | --- |
| **Data signals** | Impression-level time in view, scroll, media plays, interactions, audio state | Attentive seconds or a modeled score per impression | Timestamps fit for the unit of analysis; viewability and SIVT as the base |
| **Visual tracking** | Eye tracking and facial coding from consenting panels | Fixations, dwell, ground truth for models | Calibration for screen and device; gaze precision sufficient to map fixations to the ad |
| **Physiological and neurological** | Heart rate, skin response, brain activity | Arousal, engagement | Calibrated devices; controlled or semi-controlled environments |
| **Panel and survey** | Brand studies, measurement panels | Recall, recognition, sentiment | Representative samples, bias mitigation, timely recall |

Most commercial attention metrics are hybrids: a model trained on eye-tracking or outcome panels, applied at scale to impression-level signals. Adelaide, for example, describes its AU as a "0–100 score" from "a machine learning model trained to outcomes" across "19 channels." On the MRC's digital list, DoubleVerify's attention metrics (desktop, mobile web and in-app) are accredited, and on its services-under-review list XPLN, whose scope includes attention metrics (mobile web and in-app), is "Audit reviewed 8/2026", while Adelaide's AU is "Pre-audit reviewed 5/2026" with the audit not begun. For a platform, attention is a vendor's per-impression or per-placement score with a model version, stored beside viewability and never in place of it.

## How to Build It

Viewability adds the standards themselves as rows (so a custom 100% threshold is a configuration, not a fork), one measurement per impression per measurer with the observed geometry and durations, the per-day buckets on `delivery_daily`, and vendors' attention scores:

```sql
CREATE TABLE viewability_standards (     -- a threshold set; the MRC's and anyone's custom ones
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  code                 TEXT NOT NULL UNIQUE,  -- 'mrc_display', 'mrc_display_large', 'mrc_video',
                                              -- 'mrc_cross_media_video', 'custom_full_pixel_video'
  owner_org_id         UUID REFERENCES organizations (id),  -- null: an industry standard
  media                TEXT NOT NULL CHECK (media IN ('display', 'video', 'audio')),
  min_pixel_pct        SMALLINT CHECK (min_pixel_pct BETWEEN 1 AND 100),  -- null for audio
  min_continuous_ms    INT NOT NULL CHECK (min_continuous_ms > 0),
  applies_min_area_px  INT,                  -- 242500 for the large-ad rule; null: any size
  requires_audible     BOOLEAN NOT NULL DEFAULT FALSE,
  is_mrc_minimum       BOOLEAN NOT NULL,     -- false: custom, reported beside the standard
  source_url           TEXT
);

CREATE TABLE viewability_measurements (  -- one measurer's verdict on one served impression
  impression_id          TEXT NOT NULL,     -- the serve's ID, the impression part of ad_events.dedupe_key
  occurred_at            TIMESTAMPTZ NOT NULL,  -- the impression's event time
  measurer_org_id        UUID NOT NULL,     -- this system, a verification vendor or a platform
  line_item_id           UUID NOT NULL,
  environment            TEXT NOT NULL CHECK (environment IN ('desktop', 'mobile_web',
                           'mobile_app', 'ctv')),
  method                 TEXT NOT NULL CHECK (method IN ('geometric', 'safeframe', 'browser_api',
                           'browser_optimization', 'om_sdk', 'player', 'click_to_play_assumed',
                           'first_party')),
  status                 TEXT NOT NULL CHECK (status IN ('viewable', 'non_viewable',
                           'undetermined')),
  ad_area_px             INT,
  max_inview_pct         SMALLINT CHECK (max_inview_pct BETWEEN 0 AND 100),
  longest_continuous_ms  INT,               -- at the standard's pixel threshold
  total_inview_ms        INT,               -- accumulated after the threshold was first met
  audible_inview_ms      INT,               -- null: audio not measurable
  standards_met          TEXT[] NOT NULL DEFAULT '{}',  -- viewability_standards.code values
  extrapolated           BOOLEAN NOT NULL DEFAULT FALSE, -- projected, reported segregated
  ivt                    TEXT NOT NULL DEFAULT 'none' CHECK (ivt IN ('none', 'givt', 'sivt')),
  PRIMARY KEY (occurred_at, measurer_org_id, impression_id)
) PARTITION BY RANGE (occurred_at);       -- hourly, like ad_events

ALTER TABLE delivery_daily ADD COLUMN non_viewable_impressions BIGINT NOT NULL DEFAULT 0,
                           ADD COLUMN undetermined_impressions BIGINT NOT NULL DEFAULT 0,
                           ADD COLUMN viewable_duration_ms BIGINT NOT NULL DEFAULT 0,
                                     -- capped at creative length per exposure, for DWVI
                           ADD COLUMN viewability_standard_id UUID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_viewability_standard_fk
  FOREIGN KEY (viewability_standard_id) REFERENCES viewability_standards (id) NOT VALID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_viewable_le_impressions_check
  CHECK (viewable_impressions <= impressions) NOT VALID;

CREATE TABLE attention_daily (           -- a vendor's attention metric for a line item and day
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  day                 DATE NOT NULL,
  vendor_org_id       UUID NOT NULL REFERENCES organizations (id),
  method              TEXT NOT NULL CHECK (method IN ('data_signals', 'visual_tracking',
                        'physiological', 'panel_survey', 'hybrid')),
  metric              TEXT NOT NULL,       -- the vendor's name: 'attentive_seconds', 'score'
  model_version       TEXT NOT NULL,
  basis               TEXT NOT NULL CHECK (basis IN ('viewable', 'diagnostic_non_viewable',
                        'aggregate')),     -- the guidelines' standard versus diagnostic split
  measured_impressions BIGINT NOT NULL,
  metric_value_micro  BIGINT NOT NULL,     -- the value in millionths (seconds, points, a share)
  viewable_ms_total   BIGINT,              -- for attentive time relative to viewable time
  PRIMARY KEY (line_item_id, day, vendor_org_id, metric, basis)
);
```

The classifier that turns a measurer's observations into a verdict is small and has to be exactly right: observations at a fixed interval, a pixel threshold that depends on the ad's area, a continuous run that must reach the time threshold, focus required, and an undetermined result when the evidence is missing. The sketch takes a run of samples (in-view fraction in parts per thousand, tab focus, measurable flag) and classifies against one standard:

```go tab="Go"
// Sample is one observation of an ad, taken at a fixed interval.
type Sample struct {
	InViewPermille int  // share of the ad's pixels in the viewport, 0..1000
	Focused        bool // the tab (or app) is in the foreground
	Measurable     bool // the measurer could observe geometry for this sample
}

type Standard struct {
	MinPixelPct     int // 50, or 30 for large display, or 100 for cross-media video
	MinContinuousMs int // 1000 display, 2000 video
	LargeAdMinArea  int // 242500; 0 disables the large-ad rule
	LargePixelPct   int // 30
}

type Verdict struct {
	Status          string // "viewable", "non_viewable", "undetermined"
	LongestMs       int    // longest continuous run at the threshold
	TotalInViewMs   int    // accumulated in-view time once first viewable
	MaxInViewPct    int
}

// Classify applies one standard to one impression's samples.
// intervalMs must be at most 100 for display and 200 for video under the MRC minimums.
func Classify(samples []Sample, intervalMs, adAreaPx int, std Standard) Verdict {
	threshold := std.MinPixelPct * 10 // permille
	if std.LargeAdMinArea > 0 && adAreaPx >= std.LargeAdMinArea {
		threshold = std.LargePixelPct * 10
	}
	var v Verdict
	run, measured, qualified := 0, 0, false
	for _, s := range samples {
		if !s.Measurable {
			run = 0 // an unobserved gap breaks continuity; it never counts as in view
			continue
		}
		measured++
		if pct := s.InViewPermille / 10; pct > v.MaxInViewPct {
			v.MaxInViewPct = pct
		}
		if s.Focused && s.InViewPermille >= threshold {
			run += intervalMs
			if run > v.LongestMs {
				v.LongestMs = run
			}
			if run >= std.MinContinuousMs {
				qualified = true
			}
			if qualified {
				v.TotalInViewMs += intervalMs // non-continuous time accrues once viewable
			}
		} else {
			run = 0
		}
	}
	switch {
	case qualified:
		v.Status = "viewable"
	case measured == 0:
		v.Status = "undetermined" // no evidence: never guess either way
	default:
		v.Status = "non_viewable"
	}
	return v
}
```

```rust tab="Rust"
/// One observation of an ad, taken at a fixed interval.
#[derive(Clone, Copy)]
pub struct Sample {
    pub in_view_permille: u32, // share of the ad's pixels in the viewport, 0..=1000
    pub focused: bool,         // the tab (or app) is in the foreground
    pub measurable: bool,      // the measurer could observe geometry for this sample
}

pub struct Standard {
    pub min_pixel_pct: u32,     // 50, or 100 for cross-media video
    pub min_continuous_ms: u32, // 1000 display, 2000 video
    pub large_ad_min_area: u32, // 242_500; 0 disables the large-ad rule
    pub large_pixel_pct: u32,   // 30
}

#[derive(Debug, PartialEq)]
pub enum Status { Viewable, NonViewable, Undetermined }

#[derive(Debug)]
pub struct Verdict {
    pub status: Status,
    pub longest_ms: u32,
    pub total_in_view_ms: u32,
    pub max_in_view_pct: u32,
}

/// Applies one standard to one impression's samples. `interval_ms` must be at most
/// 100 for display and 200 for video under the MRC minimums.
pub fn classify(samples: &[Sample], interval_ms: u32, ad_area_px: u32, std: &Standard) -> Verdict {
    let threshold = if std.large_ad_min_area > 0 && ad_area_px >= std.large_ad_min_area {
        std.large_pixel_pct * 10
    } else {
        std.min_pixel_pct * 10
    };
    let (mut run, mut measured, mut qualified) = (0u32, 0u32, false);
    let (mut longest, mut total, mut max_pct) = (0u32, 0u32, 0u32);
    for s in samples {
        if !s.measurable {
            run = 0; // an unobserved gap breaks continuity; it never counts as in view
            continue;
        }
        measured += 1;
        max_pct = max_pct.max(s.in_view_permille / 10);
        if s.focused && s.in_view_permille >= threshold {
            run += interval_ms;
            longest = longest.max(run);
            if run >= std.min_continuous_ms {
                qualified = true;
            }
            if qualified {
                total += interval_ms; // non-continuous time accrues once viewable
            }
        } else {
            run = 0;
        }
    }
    let status = if qualified {
        Status::Viewable
    } else if measured == 0 {
        Status::Undetermined // no evidence: never guess either way
    } else {
        Status::NonViewable
    };
    Verdict { status, longest_ms: longest, total_in_view_ms: total, max_in_view_pct: max_pct }
}
```

Ten consecutive qualifying samples at 100 ms make a viewable display impression and ten at 200 ms a viewable video impression, which is the guideline's "10 consecutive positive observations." The sketch counts accumulated time from the sample that completed the run; whether the qualifying second itself counts toward total time in view is a disclosure choice. A real measurer also tracks video playhead progress (two seconds of play, not two seconds of wall clock while buffering) and runs one classification per standard it reports, writing each code it meets to `standards_met`.

The day's buckets come straight from the measurements, which keeps the viewable count, the measured rate and the duration-weighted figure reproducible:

```sql
-- One measurer's viewability buckets and rates for a line item, by day.
SELECT line_item_id,
       (occurred_at AT TIME ZONE $3)::date AS day,
       COUNT(*) FILTER (WHERE status = 'viewable')     AS viewable,
       COUNT(*) FILTER (WHERE status = 'non_viewable') AS non_viewable,
       COUNT(*) FILTER (WHERE status = 'undetermined') AS undetermined,
       COUNT(*) FILTER (WHERE status <> 'undetermined')::numeric / NULLIF(COUNT(*), 0)
         AS measured_rate,
       COUNT(*) FILTER (WHERE status = 'viewable')::numeric
         / NULLIF(COUNT(*) FILTER (WHERE status <> 'undetermined'), 0) AS viewable_rate
FROM viewability_measurements
WHERE measurer_org_id = $1 AND line_item_id = $2
  AND ivt = 'none' AND NOT extrapolated
GROUP BY 1, 2
ORDER BY 2;
```

Design notes:

- **Three buckets, always.** `status` is never null and never collapsed to a boolean; `delivery_daily` carries viewable, non-viewable and undetermined counts so the measured rate and the viewable rate can both be computed, as the guideline's disclosure section requires.
- **Standards are data.** The MRC display, large display, video and cross-media thresholds are rows; an agency's 100% pixel video requirement is another row with `is_mrc_minimum = FALSE`, reported beside the MRC count, never replacing it.
- **Durations, not just verdicts.** `longest_continuous_ms`, `total_inview_ms` and `audible_inview_ms` are what duration weighting and attention-relative-to-viewable-time need; `delivery_daily.viewable_duration_ms` caps each exposure at the creative's length before summing, as the cross-media standard requires.
- **One row per measurer.** The publisher, the advertiser's ad server and each verification vendor write their own measurement of the same impression; the primary key includes the measurer, and comparisons are reconciliation.
- **Observed and projected stay apart.** `extrapolated` marks projected verdicts so reports can segregate them, and a measurer polling slower than 100 ms on display records that in its disclosure and counting policy.
- **Viewable implies served and valid.** `viewable_impressions <= impressions` is a constraint, and the roll-up excludes impressions flagged `givt` or `sivt`, so a viewable count can't exceed the served count or include invalid traffic.
- **Attention is a vendor metric with a basis and a model.** `attention_daily` keeps the method, model version and whether the value was computed on viewable impressions or as a diagnostic, the split the attention guidelines require.

## Auditing

- **Every viewability verdict** per impression and measurer for the dispute window, with method, durations and the standards met, so a viewable-rate dispute is settled from evidence.
- **The standards in force** for each buy, including custom thresholds, and which one an invoice priced on.
- **Polling and technique disclosures,** versioned, when this system measures, since slower polling and extrapolation are disclosure items.
- **Attention model versions** behind every attention figure shown to a buyer, and whether it was standard or diagnostic.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Classify every served impression as viewable, non-viewable or undetermined,** and report the measured rate beside the viewable rate.
- **Apply the MRC thresholds exactly:** 50% for one continuous second for display, 30% for ads of 242,500 pixels or more, 50% of the ad for two seconds of play for video, in focus, after render.
- **Count a viewable impression once per session,** never more than the served count, and only on valid traffic.
- **Store in-view and audible durations in milliseconds,** capped at creative length, so duration-weighted metrics and attention ratios can be computed.
- **Model thresholds as rows,** with custom ones reported in addition to the MRC's.
- **Measure apps and players through the OM SDK,** and record which method produced each verdict.
- **Treat attention as a validated vendor model on viewable impressions,** versioned and labeled standard or diagnostic, and never as an outcome.

## References

**Specifications**

- [MRC: Viewable Ad Impression Measurement Guidelines v2.0 (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), display, large display and video thresholds, audio, polling minimums, techniques, undetermined impressions, the session rule, multi-unit buys, video without player integration, the three buckets, measured and viewable rates and early review
- [MRC: Cross-Media Audience Measurement Standards, Phase I Video (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Cross-Media%20Audience%20Measurement%20Standards%20%28Phase%20I%20Video%29%20Final.pdf), the 100% pixel and two-second threshold, audio, viewable impressions as the minimum unit, duration weighting from January 2021, the DWVI formulas and illustration
- [IAB and MRC: Attention Measurement Guidelines v1.0 (November 2025, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_MRC_Attention_Measurement_Guidelines_November_2025.pdf), methods in scope, viewability versus attention, attention as a measure of persons, viewability, SIVT and presence minimums, diagnostic reporting, outcomes and validation
- [IAB and MRC: Retail Media Measurement Guidelines (January 2024, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), strong user interaction as viewable and custom viewability reported in addition to the standard
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), issue and update dates for the viewability, mobile viewability, cross-media and attention documents
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), the signals OM SDK provides: on-screen state, percentage in view, duration, placement and quartiles

**In practice**

- [Google Ad Manager Help: Monitor Active View measurement](https://support.google.com/admanager/answer/6123557), Active View's display and video criteria and impressions assumed to be measurable and not viewable until a pingback
- [MRC: Digital accreditation](https://mediaratingcouncil.org/accreditation/digital), accredited viewability and attention metrics by vendor and environment
- [MRC: Digital services under review](https://mediaratingcouncil.org/accreditation/services-under-review/digital), XPLN's audit-reviewed attention metrics and Adelaide's pre-audit review
- [Adelaide: Attention metrics](https://www.adelaidemetrics.com), AU as a 0–100 score from a model trained to outcomes across 19 channels
