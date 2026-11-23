+++
title = "Attribution"
description = "How ad platforms attribute conversions: conversion actions, click and view windows, last-click and data-driven models, conversion APIs, modeled conversions."
category = "Advertising Industry"
order = 2935
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "attribution", "conversions", "data-model"]
+++

Attribution is the platform's answer to "which of my ads led to this outcome." A purchase, an install or a lead arrives at the ad platform (from a pixel, an SDK, a server-side conversion API, an upload or a measurement partner), and the platform looks back through the ad interactions it recorded for that person, picks the ones inside the advertiser's windows, and assigns the conversion, or fractions of it, to them. The result is the number in every campaign report, the input to every automated bid, and very often the number an advertiser's budget follows.

It is hard on the platform side for reasons the advertiser's side doesn't see. The platform must join an outcome it didn't observe to interactions it did, usually through a hashed email, a click ID or a device identifier that may be missing; it must decide what to do with the conversions it can't join (because consent was denied or a browser stripped the ID) and say when it modeled them; it must deduplicate the same purchase arriving from the browser and from the server; it must apply windows and models that are configuration, versioned and changeable mid-flight; and every other platform that showed the same person an ad is doing the same thing, so the sum of all platforms' claims can exceed the advertiser's sales. Attribution says who touched the sale under one platform's rules, not what caused it; causation is the next chapter's.

This chapter covers conversion actions and their settings, attribution windows (click, engaged view, view), counting rules, the models platforms still offer (last click, data-driven, last touch), how the platforms changed them in 2023-2026 (Google's removal of rule-based models, Meta's 2026 window and click changes), receiving conversions on the platform's side (pixels and conversion APIs, deduplication, match keys and match quality, late events), modeled conversions under consent rules, view-through, and the conflict between platform-reported and advertiser-side attribution, with a window-and-priority attribution sketch in Go and Rust. It extends `conversions` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The advertiser's seat (capturing touches at landing, sending conversions, running its own model, CAC) is Commerce's [Acquisition & Attribution](/books/commerce/acquisition-and-attribution); the generic models are the playbook's [Attribution Basics](/docs/telemetry/product-analytics#attribution-basics); lift is [Incrementality & Lift](/books/advertising/incrementality-and-lift); app installs through measurement partners and SKAdNetwork are [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners) and [Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att); retail closed-loop sales attribution is [Retail Media Networks](/books/advertising/retail-media-networks); and the bidder that consumes attributed conversions is [Automated Bidding](/books/advertising/automated-bidding).

## How the Platforms Do It

As of November 2026, from each platform's help center and developer documentation:

| Platform | Models offered | Windows | Counting | Notes |
| --- | --- | --- | --- | --- |
| **Google Ads** | Data-driven (default for most actions) and last click; first click, linear, time decay and position-based "are no longer supported" | Click-through default 30 days, 1-30, 60 or 90 days depending on source; engaged-view default 3 days (1-30); view-through default 1 day (1-30) | Per action: "Every" (default for website, in-app and import actions) or "One" (default for calls and Analytics goals; app installs fixed to one) | Modeled conversions appear in the standard Conversions column under consent mode |
| **LinkedIn** | "For most conversion types, we use the last-touch attribution model": last touch for each ad set, or last touch for the last ad set only | Set per conversion: 1, 7, 30 or 90 days, default 90-day click and 90-day view; 180 or 365 days for some categories sent through the Conversions API or CSV | For most conversion types, repeat conversions by the same member within the window count once | Some conversions "may be measured using predictive AI models or on-device conversion tracking" |
| **Meta** | Platform attribution under the advertiser's attribution setting | Ads Insights API returns 1-day, 7-day and 28-day click, 1-day engaged view and 1-day view; 7-day and 28-day view stopped January 12, 2026 | Not covered here | From late March 2026 (rolling out by advertiser), click-through for website and in-store conversions counts link clicks only; other clicks moved to "engage-through" attribution; engaged-view video threshold cut from 10 to 5 seconds |
| **Microsoft Advertising** | `DataDriven`, `LastTouch` or `LastClick` per conversion goal (not on app install, in-store or offline goals) | Click window up to 129,600 minutes (90 days), minimum 1 minute; view-through window up to 43,200 minutes (30 days) | `All` (default, "a common choice for sales") or `Unique` ("a common choice for leads") | `ExcludeFromBidding` keeps a goal out of the Conversions column and automated bidding |
| **TikTok** (as a self-attributing network for apps) | Platform attribution | Click-through 1 or 7 days, engaged view-through 1 or 7 days, view-through off or 1 day (help page last updated February 2025) | Not covered here | "The attribution window setting on TikTok Ads Manager doesn't impact your MMP reporting" |

Three patterns hold across them: windows are per conversion action, set by the advertiser within platform limits; the platforms have converged on last click plus a proprietary data-driven model; and a platform's window setting governs only its own reporting and bidding, not a measurement partner's or the advertiser's.

## Conversion Actions

Before anything is attributed, the advertiser defines what counts. Every platform has the object (Google's conversion action, Microsoft's conversion goal, Meta's events and custom conversions, LinkedIn's conversions), and the fields that matter are the same:

- **Source.** Where the conversion arrives from: a website tag or pixel, an app SDK or measurement partner, a server-side API, an offline import (a CRM's closed deals), a phone call. Microsoft's goal types (`UrlGoal`, `EventGoal`, `AppInstallGoal`, `OfflineConversionGoal`, `InStoreTransactionGoal`, `DurationGoal`, `PagesViewedPerVisitGoal`) are a fair map of the sources and definitions in use.
- **Category.** Purchase, lead, sign-up, install, add to cart. The MRC's Outcomes and Data Quality Standard draws the line that matters in reporting: leads, inquiries, traffic and interactions are "Not a Direct Measure of Sales," and conversions, ROAS and CRM and sales datasets are labeled a "Direct Measure of Sales."
- **Counting.** Every conversion after an interaction, or one per interaction. Microsoft's example is exact: with leads set to `Unique` and sales to `All`, "one ad click turns into two leads and two sales" counts as three.
- **Value.** A fixed value, the value the event carries, or none, in a currency; values drive value-based bidding.
- **Primary or not.** Whether the action feeds the Conversions column and automated bidding, or only an "all conversions" view. Microsoft's `ExcludeFromBidding` and Google's primary and secondary actions are the same switch.
- **Windows and model.** Click, engaged-view and view windows and the attribution model, per action.

Two properties make this configuration a record rather than a setting. Changes apply forward: Google says window changes apply only to conversions from the day of the change onward, and Microsoft's "Past conversions aren't affected." And scope is fixed: Microsoft's goal scope (account or customer) "can't" change; to change it "you need to create a new conversion goal and pause the old one." A platform that lets these fields be edited in place loses the ability to explain last month's numbers.

## Windows

A window is the maximum time from an ad interaction to the conversion for that interaction to receive credit. Platforms keep separate windows for different interaction types because their causal strength differs:

- **Click-through.** The person clicked the ad (or, on Meta from March 2026 for website and in-store conversions, clicked a link in it). Google's default is 30 days, with a recommendation of at least 7; Microsoft allows up to 90 days.
- **Engaged view.** A video watched for a qualifying duration without a click: Google's engaged-view window defaults to 3 days; Meta's engaged-view threshold dropped from 10 seconds to 5 in March 2026, and its non-link clicks (likes, shares, saves) moved into the renamed "engage-through" attribution.
- **View-through.** The ad was shown (Google: impression) and not interacted with: Google defaults to 1 day; Meta's API kept only 1-day view after January 12, 2026; TikTok allows off or 1 day.

Retail media follows the same structure with longer windows. The IAB and MRC Retail Media Measurement Guidelines note that typical windows are "often 3, 7, 14, 28, or 30 days," don't prescribe one, and require that windows be empirically supported and disclosed before the campaign, with day-level lag between exposure and conversion encouraged so buyers can reconcile across retailers' windows. That last point generalizes: reporting the lag distribution (how many conversions came 0, 1, 2 days after the interaction) lets anyone re-cut a platform's numbers to a shorter window, while a single total under the platform's window can't be re-cut at all.

A conversion whose interaction falls outside every window is unattributed by that platform. A conversion inside several windows on several of the advertiser's ad interactions needs a model to choose.

## Models

Within one platform, a model decides how a conversion's credit is split among that platform's interactions. What survived the consolidation of 2023-2026:

- **Last click.** All credit to the most recent click in the window. Google keeps it; Microsoft offers `LastClick`.
- **Last touch.** The most recent interaction of any type, click or view, gets the credit; LinkedIn's default, in two forms ("each ad set" credits every ad set with an interaction in the window; "last ad set" credits only the most recent).
- **Data-driven.** Google's DDA "uses your conversion data to calculate the actual contribution of each ad interaction across the conversion path," and "By comparing the paths of customers who convert to the paths of customers who don't, the model identifies patterns" to give more credit to interactions associated with conversion. Each model is built from the advertiser's own data. All conversion actions are eligible "regardless of conversion or interaction volume," with Google recommending at least 200 conversions and 2,000 ad interactions in 30 days on supported networks. Microsoft offers `DataDriven` on URL, event, duration and pages-per-visit goals, not on app install, in-store or offline goals.
- **Gone.** Google announced on April 6, 2023 that first click, linear, time decay and position-based models would be removed from Google Ads and GA4, removed their selection from June 2023, and switched the remaining actions to data-driven from September 2023.

Data-driven models are path comparisons over observational data, not experiments; the MRC's outcomes standard calls anything without randomized treatment "an observational approach," and the playbook's point that attribution "is a model, not a measurement" ([Attribution Basics](/docs/telemetry/product-analytics#attribution-basics)) applies most to a model the platform both runs and is measured by. What the platform owes the advertiser is disclosure: which model, which version, which windows and which interaction types fed each number.

## Receiving Conversions

The platform's side of a conversion API is an ingestion service with unusual obligations: it receives personal data, often duplicated, sometimes days late, from systems it doesn't control, and must turn it into attributable, deduplicated, consented outcomes.

**Channels.** The same purchase can arrive from the browser pixel, from the advertiser's server through a conversion API, from an offline upload and from a measurement partner. Meta's Conversions API runs alongside the Pixel and deduplicates when the browser event's `eventID` matches the server event's `event_id` with the same event name, within 48 hours; Google's enhanced conversions supplement the tag with hashed first-party data; Microsoft's goals have an `IsEnhancedConversionsEnabled` flag. Commerce's [Server-Side Conversions](/books/commerce/acquisition-and-attribution#server-side-conversions) covers what the advertiser sends; the receiving rules are:

- **Deduplicate before attributing.** Key on (conversion action, event ID) across channels within a dedup window, and record which channel won, so a purchase reported by the pixel and the server counts once.
- **Bound the event time.** Meta accepts an `event_time` "up to 7 days before you send an event"; a request carrying an older one fails whole, rather than being silently attributed to a window that has already been reported and bid on.
- **Match, then forget the keys.** Hashed emails and phones (Meta specifies SHA-256 after normalization; Google's enhanced conversions also hash with SHA-256), click IDs and device IDs are join keys. The platform needs them to find the interaction; it doesn't need to keep them on the conversion after the join. Meta reports match strength back as Event Match Quality, "a score (out of 10)."
- **Gate on consent.** A conversion carries the consent state it was collected under. Google's consent mode carries `ad_user_data` and `ad_personalization`; a conversion without consent for ad use is not joined to a person, though it may count in aggregate.
- **Restrict sensitive events.** Meta began rolling out, from September 2, 2025, restrictions that flag custom conversions "suggesting specific health conditions ... or financial status" and keep flagged ones out of new campaigns; a platform that accepts arbitrary event names needs the same review, because a conversion named for a condition is health data ([Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting)).

**Adjustments.** Returns, cancellations and changed order values arrive after the conversion. They are new records against the original (a restatement), never an edit, so the bid model's training data and last month's report can both be explained.

## Modeled Conversions

When the platform can't observe the link between an interaction and a conversion (consent denied, a browser that blocked the cookie, an iOS user who declined tracking), it can count the conversion as unattributed or estimate it. Google's consent mode modeling does the latter: when users deny ad or analytics cookies, "Conversion modeling uses Google AI to analyze observable data and historical trends," using consenting users' journeys and cookieless pings to estimate attribution for non-consenting users. Modeled conversions "will appear in the 'Conversions' column," flow into every report that uses conversion columns, and feed automated bidding. LinkedIn says "some conversions may be measured using predictive AI models or on-device conversion tracking."

The platform-side rule is to store observed and modeled conversions as distinct records with a model version, even if the advertiser-facing column sums them. The MRC's outcomes standard requires model methodology to be disclosed to report users and says "The level of reliance on models must be generally disclosed" ([Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc)), and a platform that can't separate them can't answer an auditor, a regulator asking how a non-consenting user's data was used, or an advertiser asking why reported conversions jumped when a consent banner changed.

On iOS apps the aggregated path is Apple's: installs and post-install values arrive as AdAttributionKit or SKAdNetwork postbacks, without a user, delayed and coarsened by crowd anonymity tiers, and the platform attributes them to campaigns, not people. [Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att) covers the postback format; [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners) covers what a measurement partner does with it; the app studio's view is Gaming's [iOS: ATT and AdAttributionKit](/books/gaming/mobile-games#ios-att-and-adattributionkit).

## View-Through

A view-through conversion credits an ad the person saw but didn't interact with. It is the contested part of attribution because it asks the most of the counterfactual: the person might have converted anyway, and on any surface where most people see many ads, almost every converter "saw" one. The platforms' 2025-2026 moves narrowed it: Meta's API dropped the 7-day and 28-day view windows, and its March 2026 change separated link clicks from other engagement. Google's view-through default is one day.

My rules for a platform reporting view-through: report it as its own column, never folded into conversions without a label; require the impression behind it to be viewable under the MRC standard ([Viewability & Attention](/books/advertising/viewability-and-attention)), since an ad that was never in view can't have caused anything; let a click in the window take precedence over a view; and point advertisers at a lift test ([Incrementality & Lift](/books/advertising/incrementality-and-lift)) for any channel where view-through is most of the reported total.

## Platform-Reported and Advertiser-Side Attribution

Every platform attributes with its own data, its own windows and its own model, and each one can see only its own interactions. So for the same advertiser:

- **Claims overlap.** A purchase after a search click, a social view and a DSP impression is claimed by all three platforms under their respective rules. The sum of platform-reported conversions can exceed actual orders. None of them is lying; each is answering a different question.
- **Windows differ.** A 30-day click platform and a 7-day click platform report different totals for the same conversions. A day-level lag breakdown is what makes them comparable.
- **Measurement partners disagree with platforms.** TikTok's own help page says its window setting "doesn't impact your MMP reporting" and recommends keeping the two consistent to reduce discrepancies; the measurement partner attributes across all networks with one rule ([Mobile Measurement Partners](/books/advertising/mobile-measurement-partners)).

The advertiser's answer is to keep platform claims as claims and run one store-side model on its own touch log ([Attribution Models](/books/commerce/acquisition-and-attribution#attribution-models)). The platform's obligations are to make its claim legible: name the model, version and windows on every number; expose the interaction type and lag; separate modeled from observed; and never present attributed revenue as incremental revenue (the MRC standard requires arithmetic ROAS to be "differentiated" from methods that isolate incremental return). Meta's March 2026 announcement named Northbeam and Triple Whale as third-party attribution tools incorporating its click and view data, an acknowledgment that advertisers will reconcile across platforms elsewhere.

How the records map between this book and Commerce's: an advertiser's `touchpoints` are its own capture of clicks this platform logged as `ad_events`; its `conversion_uploads` arrive here as `conversion_receipts` and become `conversions` with `source = 'server_api'` or `'offline_upload'`; its `attributions` are its model's answer, and this platform's `attribution_credits` are the platform's answer to the same question, which the advertiser imports as a platform claim and never sums with its own.

## How to Build It

Attribution adds the advertiser's conversion definitions, their versioned attribution settings, every conversion event as received before deduplication, and the credit the platform assigned. `conversions` from the core becomes the deduplicated outcome, pointing at its action:

```sql
CREATE TABLE conversion_actions (        -- what the advertiser told the platform to count
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id        UUID NOT NULL REFERENCES ad_accounts (id),
  name                 TEXT NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('purchase', 'lead', 'signup', 'install',
                         'add_to_cart', 'page_view', 'call', 'other')),
  direct_sales_measure BOOLEAN NOT NULL,   -- the MRC outcomes standard's direct versus indirect
  source               TEXT NOT NULL CHECK (source IN ('pixel', 'sdk', 'server_api', 'mmp',
                         'retailer_sales', 'offline_upload', 'call_tracking')),
  counting             TEXT NOT NULL CHECK (counting IN ('every', 'one')),
  value_rule           TEXT NOT NULL CHECK (value_rule IN ('none', 'fixed', 'from_event')),
  fixed_value_micros   BIGINT CHECK (fixed_value_micros >= 0),
  currency             CHAR(3),
  primary_for_bidding  BOOLEAN NOT NULL DEFAULT TRUE,
  sensitive_review     TEXT NOT NULL DEFAULT 'pending' CHECK (sensitive_review IN ('pending',
                         'cleared', 'restricted')),  -- health or financial-status names
  status               TEXT NOT NULL CHECK (status IN ('active', 'paused', 'removed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ad_account_id, name),
  CHECK (value_rule <> 'fixed' OR (fixed_value_micros IS NOT NULL AND currency IS NOT NULL))
);

CREATE TABLE attribution_settings (      -- windows and model for one action, versioned forward
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  conversion_action_id  UUID NOT NULL REFERENCES conversion_actions (id),
  model                 TEXT NOT NULL CHECK (model IN ('last_click', 'last_touch',
                          'last_touch_each_line_item', 'data_driven')),
  model_version         TEXT,             -- the data-driven model's version; null for rules
  click_window_s        INT NOT NULL CHECK (click_window_s > 0),
  engaged_view_window_s INT CHECK (engaged_view_window_s > 0),  -- null: not attributed
  view_window_s         INT CHECK (view_window_s > 0),          -- null: view-through off
  click_kinds           TEXT[] NOT NULL DEFAULT '{link_click}', -- which clicks count as clicks
  effective             TSTZRANGE NOT NULL,
  changed_by            TEXT NOT NULL,
  EXCLUDE USING gist (conversion_action_id WITH =, effective WITH &&)  -- needs btree_gist
);

CREATE TABLE conversion_receipts (       -- every event as received, before deduplication
  id                    UUID NOT NULL DEFAULT uuidv7(),
  received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversion_action_id  UUID NOT NULL,
  channel               TEXT NOT NULL CHECK (channel IN ('browser', 'server_api', 'upload',
                          'mmp_postback', 'store_postback')),
  event_id              TEXT,              -- the advertiser's ID, shared across channels
  event_time            TIMESTAMPTZ NOT NULL,
  value_micros          BIGINT,
  currency              CHAR(3),
  match_keys            TEXT[] NOT NULL DEFAULT '{}',  -- which keys were present: 'em', 'ph', 'click_id', 'ifa'
  match_quality         SMALLINT,          -- 0..10, as reported back to the advertiser
  consent_ad_use        TEXT NOT NULL CHECK (consent_ad_use IN ('granted', 'denied',
                          'not_required', 'unknown')),
  outcome               TEXT NOT NULL CHECK (outcome IN ('accepted', 'duplicate', 'too_old',
                          'invalid', 'restricted_category', 'no_consent_aggregate_only')),
  conversion_id         UUID,              -- the conversion it became or joined
  PRIMARY KEY (received_at, id)
) PARTITION BY RANGE (received_at);     -- hourly; match keys dropped after the join

ALTER TABLE conversions ADD COLUMN conversion_action_id UUID,
                        ADD COLUMN attribution_setting_id UUID,
                        ADD COLUMN modeled BOOLEAN NOT NULL DEFAULT FALSE,
                        ADD COLUMN modeling_version TEXT,
                        ADD COLUMN restates_id UUID;  -- an adjustment points at what it changes
ALTER TABLE conversions ADD CONSTRAINT conversions_action_fk
  FOREIGN KEY (conversion_action_id) REFERENCES conversion_actions (id) NOT VALID;
ALTER TABLE conversions ADD CONSTRAINT conversions_setting_fk
  FOREIGN KEY (attribution_setting_id) REFERENCES attribution_settings (id) NOT VALID;
ALTER TABLE conversions ADD CONSTRAINT conversions_restates_fk
  FOREIGN KEY (restates_id) REFERENCES conversions (id) NOT VALID;
ALTER TABLE conversions ADD CONSTRAINT conversions_modeled_version_check
  CHECK (NOT modeled OR modeling_version IS NOT NULL) NOT VALID;
-- widen the core enums to the action categories and sources above
ALTER TABLE conversions DROP CONSTRAINT conversions_kind_check,
  ADD CONSTRAINT conversions_kind_check CHECK (kind IN ('purchase', 'install', 'lead',
    'signup', 'add_to_cart', 'page_view', 'call', 'other')) NOT VALID;
ALTER TABLE conversions DROP CONSTRAINT conversions_source_check,
  ADD CONSTRAINT conversions_source_check CHECK (source IN ('pixel', 'sdk', 'server_api', 'mmp',
    'retailer_sales', 'offline_upload', 'call_tracking')) NOT VALID;

CREATE TABLE attribution_credits (       -- the platform's answer: which interactions got credit
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  conversion_id         UUID NOT NULL REFERENCES conversions (id),
  attribution_setting_id UUID NOT NULL REFERENCES attribution_settings (id),
  ad_event_id           UUID NOT NULL,     -- the click, engaged view or impression; no FK across partitions
  ad_event_occurred_at  TIMESTAMPTZ NOT NULL,
  line_item_id          UUID NOT NULL REFERENCES line_items (id),
  touch                 TEXT NOT NULL CHECK (touch IN ('click', 'engaged_view', 'view')),
  lag_s                 INT NOT NULL CHECK (lag_s >= 0),  -- conversion time minus interaction time
  credit_ppm            INT NOT NULL CHECK (credit_ppm > 0 AND credit_ppm <= 1000000),
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversion_id, attribution_setting_id, ad_event_id)
);
```

A rules-based attribution is a pure function of the setting, the conversion time and the candidate interactions. The sketch applies click, engaged-view and view windows, gives clicks precedence over engaged views and engaged views over views (my default, which keeps view-through from taking credit a click earned), and returns the last eligible interaction of the winning kind with its lag:

```go tab="Go"
type Touch struct {
	EventID    string
	LineItemID string
	Kind       string // "click", "engaged_view", "view"
	At         time.Time
	Viewable   bool // views count only if MRC-viewable
}

type Setting struct {
	ClickWindow, EngagedViewWindow, ViewWindow time.Duration // zero: that kind is off
}

type Credit struct {
	Touch Touch
	Lag   time.Duration
}

// LastTouchByPriority credits the most recent click in the click window; failing that,
// the most recent engaged view; failing that, the most recent viewable impression.
func LastTouchByPriority(s Setting, convertedAt time.Time, touches []Touch) (Credit, bool) {
	window := map[string]time.Duration{
		"click": s.ClickWindow, "engaged_view": s.EngagedViewWindow, "view": s.ViewWindow,
	}
	for _, kind := range []string{"click", "engaged_view", "view"} {
		w := window[kind]
		if w == 0 {
			continue
		}
		var best *Touch
		for i := range touches {
			t := &touches[i]
			lag := convertedAt.Sub(t.At)
			if t.Kind != kind || lag < 0 || lag > w || (kind == "view" && !t.Viewable) {
				continue
			}
			if best == nil || t.At.After(best.At) {
				best = t
			}
		}
		if best != nil {
			return Credit{Touch: *best, Lag: convertedAt.Sub(best.At)}, true
		}
	}
	return Credit{}, false // unattributed by this platform
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};

#[derive(Clone, Copy, PartialEq)]
pub enum Kind { Click, EngagedView, View }

#[derive(Clone)]
pub struct Touch {
    pub event_id: String,
    pub line_item_id: String,
    pub kind: Kind,
    pub at: DateTime<Utc>,
    pub viewable: bool, // views count only if MRC-viewable
}

pub struct Setting {
    pub click_window: Option<Duration>,
    pub engaged_view_window: Option<Duration>,
    pub view_window: Option<Duration>, // None: view-through off
}

pub struct Credit {
    pub touch: Touch,
    pub lag: Duration,
}

/// Credits the most recent click in the click window; failing that, the most
/// recent engaged view; failing that, the most recent viewable impression.
pub fn last_touch_by_priority(s: &Setting, converted_at: DateTime<Utc>, touches: &[Touch]) -> Option<Credit> {
    let order = [
        (Kind::Click, s.click_window),
        (Kind::EngagedView, s.engaged_view_window),
        (Kind::View, s.view_window),
    ];
    for (kind, window) in order {
        let Some(w) = window else { continue };
        let best = touches
            .iter()
            .filter(|t| t.kind == kind && (kind != Kind::View || t.viewable))
            .filter(|t| {
                let lag = converted_at - t.at;
                lag >= Duration::zero() && lag <= w
            })
            .max_by_key(|t| t.at);
        if let Some(t) = best {
            return Some(Credit { touch: t.clone(), lag: converted_at - t.at });
        }
    }
    None // unattributed by this platform
}
```

The sketch is the attribution step only. Before it, the receipt is deduplicated and joined to a person through its match keys; after it, the credit is written with the setting's ID and the lag, and the conversion's `attribution_setting_id` records which configuration was in force at `occurred_at`. A data-driven model replaces the function, not the records: it writes fractional `credit_ppm` rows that sum to one million per conversion, with its version on the setting.

Reports keep the lag so any shorter window can be recomputed from the stored credits:

```sql
-- Attributed conversions by line item, touch kind and lag day, for re-cutting to any window.
SELECT ac.line_item_id, ac.touch,
       LEAST(ac.lag_s / 86400, 30) AS lag_day,   -- 30 = 30 days or more
       SUM(ac.credit_ppm) / 1000000.0 AS conversions,
       SUM(ac.credit_ppm::numeric * c.value_micros / 1000000) AS value_micros
FROM attribution_credits ac
JOIN conversions c ON c.id = ac.conversion_id
WHERE c.ad_account_id = $1
  AND c.occurred_at >= $2 AND c.occurred_at < $3
  AND NOT c.modeled
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;
```

Design notes:

- **Settings are versioned forward.** A window or model change opens a new `attribution_settings` row with its effective range, as Google and Microsoft apply window changes only to conversions going forward; past conversions keep the setting they were attributed under.
- **Receipts before conversions.** Every pixel fire, API call and upload is a `conversion_receipts` row with its outcome (accepted, duplicate, too old, restricted), so the advertiser can be told why an event didn't count and the dedup rate is measurable. Match keys live only on the receipt, which has short retention ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **Deduplicate on the advertiser's event ID.** The core's `UNIQUE (ad_account_id, source, external_id)` on `conversions` handles one channel; cross-channel deduplication keys the receipt's `(conversion_action_id, event_id)` within the dedup window before a conversion is created ([Idempotency](/docs/requests/idempotency)).
- **Modeled is a flag with a version.** The check constraint requires a modeling version on every modeled conversion; reports can sum them for the advertiser and separate them for an auditor.
- **Credits carry lag and touch kind.** That is what lets a buyer compare a 30-day platform with a 7-day one, and what view-through reporting needs.
- **Adjustments restate.** A refund is a conversion with `restates_id` pointing at the original and a negative value, never an update, so bidding history and reports stay explainable.
- **Emit events:** `conversion.received`, `conversion.deduplicated`, `conversion.attributed`, `conversion.restated` and `attribution_setting.changed`, for bidding, reporting and partner postbacks ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every conversion action and attribution setting as it applied,** with who changed it and when, so a reported number can be tied to the windows and model in force.
- **Every receipt and its outcome,** for the retention window, so dedup, rejection for age or category, and consent gating can be shown.
- **Observed versus modeled conversions,** with the modeling version, for advertisers and regulators.
- **Every credit with its interaction, lag and setting,** so an advertiser's discrepancy claim can be answered at the event level.
- **Sensitive-category reviews** of conversion action names and event parameters.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model conversion actions as records** with source, category, counting, value, bidding role and a sensitive-category review.
- **Version attribution settings forward,** and attribute each conversion under the setting in force when it happened.
- **Keep separate click, engaged-view and view windows,** with clicks taking precedence and views requiring a viewable impression.
- **Record every receipt before deduplicating,** keyed on the advertiser's event ID across channels, with consent and age checks.
- **Flag modeled conversions with a model version,** and never let them be indistinguishable from observed ones.
- **Store credit with touch kind and lag,** so reports can be re-cut to any window.
- **Name the model, version and windows on every reported number,** and label attributed revenue as attributed, not incremental.

## References

**In practice**

- [Google Ads Help: About attribution models](https://support.google.com/google-ads/answer/6259715), last click and data-driven, data-driven as the default and the removed models
- [Google Ads Help: Upcoming changes to attribution models](https://support.google.com/google-ads/answer/13427716), the April 6, 2023 announcement and the June and September 2023 dates
- [Google Ads Help: About data-driven attribution](https://support.google.com/google-ads/answer/6394265), path comparison, per-advertiser models, eligible networks and the recommended 200 conversions and 2,000 interactions
- [Google Ads Help: About conversion windows](https://support.google.com/google-ads/answer/3123169), click-through, engaged-view and view-through defaults and ranges, and changes applying forward
- [Google Ads Help: About counting conversions](https://support.google.com/google-ads/answer/3438531), every versus one and the defaults by source
- [Google Ads Help: About consent mode modeling](https://support.google.com/google-ads/answer/10548233), modeled conversions for non-consenting users in the Conversions column and in bidding
- [Microsoft Learn: ConversionGoal data object](https://learn.microsoft.com/en-us/advertising/campaign-management-service/conversiongoal), goal types, attribution model types, window limits in minutes, count types, ExcludeFromBidding, enhanced conversions and fixed scope
- [LinkedIn Help: Conversion tracking attribution](https://www.linkedin.com/help/lms/answer/a426349), last-touch models, view-through and post-click conversions, counting and modeled conversions
- [LinkedIn Help: Conversion windows](https://www.linkedin.com/help/lms/answer/a426359), window options, the 90-day default and the 180- and 365-day windows for API and CSV conversions
- [Meta for Developers: Ads Insights API metric availability updates](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/), view windows removed January 12, 2026, the remaining windows and retention limits
- [Meta for Business: Click attribution update (March 3, 2026)](https://business.meta.com/news/click-attribution/), link clicks only for click-through, engage-through attribution, the five-second engaged view and the named third-party tools
- [Meta for Developers: Deduplicate Pixel and server events](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events), eventID and event name matching within 48 hours
- [Meta for Developers: Server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event), the seven-day event time limit and whole-request failure
- [Meta for Developers: Customer information parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters), SHA-256 hashing after normalization
- [Meta for Developers: Dataset Quality API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api), Event Match Quality out of 10
- [Meta for Developers: Custom Conversion](https://developers.facebook.com/docs/marketing-api/reference/custom-conversion/), the September 2, 2025 restrictions on health and financial-status conversions and flagged conversions kept out of new campaigns
- [Google Ads Help: About enhanced conversions](https://support.google.com/google-ads/answer/9888656), hashed first-party data supplementing the tag, SHA-256
- [Google Ads Help: Consent mode parameters](https://support.google.com/google-ads/answer/13802165), ad_user_data and ad_personalization
- [TikTok Ads Help: About the attribution window](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager), self-attributing network windows and their independence from MMP reporting

**Specifications**

- [MRC: Outcomes and Data Quality Standards (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Outcomes%20and%20Data%20Quality%20Standards%20%28Final%29.pdf), direct and indirect measures, observational versus experimental methods, model disclosure and arithmetic ROAS disclosure
- [IAB and MRC: Retail Media Measurement Guidelines (January 2024, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), typical retail windows, disclosure before the campaign and day-level lag
