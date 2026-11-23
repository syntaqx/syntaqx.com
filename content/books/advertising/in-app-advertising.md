+++
title = "In-App Advertising & Mediation"
description = "Ads in mobile apps: SDKs and adapters, waterfalls and in-app bidding, AdMob, MAX and LevelPlay, impression-level revenue, app counting rules and store policy."
category = "Advertising Industry"
order = 2952
part = "Channels"
tags = ["advertising", "in-app", "mediation", "bidding", "sdk", "data-model"]
nav_title = "In-App & Mediation"
+++

An in-app ad is served by code the app developer compiled into the app. Instead of a tag on a page, the app embeds a mediation SDK and, behind it, adapters for each ad network it works with; when the app reaches an ad moment (a banner slot, a level end, a "watch to earn" button), the SDK asks the networks for ads, picks one, renders it in the app's own view, and reports what happened. The developer chooses which networks compete and how, and the mediation platform runs the competition. It is how most free mobile apps and games earn, and it is the supply that app-install advertisers, the largest buyers in mobile, buy.

It is hard because the auction runs partly on a phone. The SDK has to collect bid signals from several network SDKs, send them to a server auction, compare the winners with networks that can't bid and are ranked by historical averages, load the winning ad before the moment arrives, and do all of it without slowing the app, crashing it, or draining the battery, across versions of a dozen third-party SDKs the developer upgrades on its own schedule. The money is reported per impression by the mediation SDK as an estimate, per day by each network as its own figure, and paid by each network weeks later as a third figure. And the app stores, the platforms' privacy frameworks and children's privacy law each add rules about what an ad in an app may collect and show.

This chapter covers the in-app stack (mediation SDKs, adapters and network SDKs), the formats, waterfalls and in-app bidding and how mediation platforms combine them, the major platforms, impression-level revenue and reconciling it with network payments, counting rules for apps (begin to render, pre-loaded interstitials, auto-refresh), app-ads.txt and OM SDK, and the store policies that bind ads. It extends `properties`, `auctions` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds SDK integrations, mediation instances, impression-level revenue and network revenue reports. The money split on one rewarded impression is [An in-app rewarded ad through mediation](/books/advertising/advertising-business#an-in-app-rewarded-ad-through-mediation). Formats specific to games (rewarded, playables, intrinsic in-game) and children's games are Ads in Games; the reward grant on the game's server and mobile user acquisition economics are the Gaming volume's [Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads) and [CPI, ROAS and Payback](/books/gaming/mobile-games#cpi-roas-and-payback); device identifiers and ATT are Mobile Ad IDs, ATT & SKAdNetwork; install attribution is Mobile Measurement Partners; the app-ads.txt file and crawl are ads.txt, sellers.json & SupplyChain; the publisher ad server's yield groups are Ad Servers.

## How the Platforms Do It

As of November 2026, from each platform's documentation and filings. Rows are mediation platforms; each also runs its own ad network that competes in its auction.

| Platform | How it mediates | Bidding and waterfall | Revenue reporting |
| --- | --- | --- | --- |
| **AdMob** (Google) | Mediation groups: "combinations of targeting settings" by format, platform, app, ad unit and country | Bidding ("ad sources compete in a real-time auction") and waterfall ("calls ad sources one-by-one based on the average eCPM you set"), combined as a hybrid; bidding on Android needs Google Mobile Ads SDK 18.3.0 or later | Impression-level `AdValue` in micros with a precision type, from SDK 21.1.0 |
| **AppLovin MAX** | One SDK with adapters; "advanced in-app bidding technology" per AppLovin's 10-K | "Both bidding and traditional networks compete by the highest CPM"; "Prioritize bidding networks whenever possible"; Auto-CPM keeps traditional networks' prices at the network-reported CPM; custom networks can't bid | `MaxAd.getRevenue()` in USD with a precision (`exact`, `estimated`, `publisher_defined`, `undefined`) |
| **Unity LevelPlay** | Unity's "ad mediation solution," with instances grouped by country | Bidding sources bid on each impression in real time; non-bidding sources compete on eCPM from historical performance, with manual instance rates; bidding needs LevelPlay SDK 6.10.0+ | Impression Level Revenue (ILR) on device and impression level, sent to AppsFlyer, Adjust, Singular, Tenjin and Kochava; a server-side API with files "up to 14 days back" |

AppLovin's own report shows how central mediation has become to its business: it sold its apps business to Tripledot on June 30, 2025 for $400 million in cash plus about 20% of Tripledot's equity, and says "Revenue from Axon Ads Manager comprises substantially all of our revenue" (Axon Ads Manager is its self-serve advertising platform), on $5.48 billion of 2025 revenue from continuing operations. The mediation platform and the largest network competing inside it are the same company, which is the structural fact every publisher configuring a mediation stack has to keep in mind.

## The In-App Stack

Three layers of code run in the app:

- **The mediation SDK** owns the ad lifecycle: it initializes the networks, requests ads for an ad unit, runs or calls the auction, loads the winner, shows it when the app asks, and reports events and revenue. The app integrates its API once.
- **Adapters** translate between the mediation SDK and each network's SDK. Each has its own version, compatible with particular versions of both sides; a mismatch is the most common cause of a network silently not filling.
- **Network SDKs** fetch and render their own ads, often with their own creative formats, their own measurement (OM SDK where integrated) and their own data collection, which is why every network SDK in the app appears in the app's privacy disclosures.

An app's **ad unit** in the mediation platform (a rewarded unit on the level-end screen) maps to an **instance** or **placement** at each network (a zone, a placement ID), and the mapping is per platform (iOS and Android are separate apps to every network). A publisher with five ad units, two platforms and eight networks configures 80 network placements, each with its own ID, floor, status and reporting line, and each must stay in step with the app versions in the field. That combinatorics, not the auction, is where most mediation operations work goes.

**SDK cost.** Every network SDK adds binary size, startup time, memory and crash surface, and the app can't fix a network SDK's bug. The MRC's mobile in-app guidelines put it as a measurement concern: "robust quality control for onboarding SDK users, updating and version control must be present." In practice publishers keep the set of networks small, add networks only when they bid, and gate new SDK versions behind staged rollouts.

## Formats

In-app formats are defined by where the ad sits relative to the app's own UI:

- **Banner and MREC.** A fixed slot inside the app's layout (320x50, 300x250), usually auto-refreshed on a timer.
- **Interstitial.** A full-screen ad shown at a natural break, closed by the user. Apple's App Store guideline 2.5.18 requires that "Interstitial ads or ads that interrupt or block the user experience must clearly indicate that they are an ad, must not manipulate or trick users into tapping into them, and must provide easily accessible and visible close/skip buttons large enough for people to easily dismiss the ad."
- **Rewarded.** The user opts in to watch in exchange for an in-app reward, granted on a server-side callback (Ads in Games covers the callback; the Gaming volume covers the grant).
- **Rewarded interstitial.** Shown automatically at a transition with a reward, without an opt-in prompt; AdMob requires an intro screen that states the reward and "A clear, unobstructed option to skip the ad before it starts", and serves "only skippable ads" in these units.
- **App open.** Shown when the app is launched or brought back to the foreground, on a loading screen.
- **Native.** Assets (headline, image, icon, call to action) rendered in the app's own style, through the OpenRTB Native request; Ad Formats & Standards covers native.

Rich media in apps runs through MRAID, IAB Tech Lab's "common API ... for mobile rich media ads," at version 3.0, so an HTML5 ad can expand, close, detect exposure and talk to the app in one standard way (Ad Formats & Standards covers rich media).

## Waterfalls and In-App Bidding

**The waterfall.** Each network instance gets a price, set by the publisher or computed from history, and the SDK asks them in descending order until one fills. AdMob's description is exact: waterfall mediation "calls ad sources one-by-one based on the average eCPM you set, not what the ad source is willing to pay." Its flaw is the same as on the web: a network willing to pay more for this impression is never asked if a cheaper instance above it fills, and each unfilled call adds latency. Platforms automate the price: MAX's Auto-CPM updates a traditional network's price "so that it aligns with the network-reported CPM"; LevelPlay lets publishers set "manual rates to ad network instances to prioritize their order in your waterfall, overriding eCPM," with overrides by instance, group and country.

**In-app bidding.** The SDK collects a bid token or signals from each bidding network's SDK, sends them with the request to the mediation platform's server, which asks the networks' servers for bids in real time; the highest bid wins and the winner's SDK renders its ad. It is header bidding moved into the app, and it fixes the waterfall's ordering problem for every network that bids.

**Hybrid.** Most apps run both: bidders compete in real time, and networks that can't bid compete at their waterfall prices. AdMob supports "a hybrid setup by using both bidding and waterfall ad sources in your mediation groups"; in MAX, "Both bidding and traditional networks compete by the highest CPM"; LevelPlay describes a hybrid setup in which both kinds of source compete for every impression. The comparison is between a real bid and an estimate, so the auction's honesty depends on how good the estimate is.

A sketch of the decision a mediation SDK and its server make for one ad request:

```go tab="Go"
type Candidate struct {
	InstanceID string
	Network    string
	Bidding    bool
	CPMMicros  int64 // a bid, or the waterfall instance's eCPM
	Precision  string // "exact" for a bid, "estimated" or "publisher_defined" for waterfall
}

type BidSource interface {
	// Bid returns a price for this request, or ok=false for no bid.
	Bid(ctx context.Context, instanceID string, token []byte) (cpmMicros int64, ok bool, err error)
}

type Instance struct {
	ID, Network string
	Bidding     bool
	ECPMMicros  int64 // waterfall price, for non-bidding instances
	Source      BidSource
	Token       []byte
}

// Rank runs the bidders under one deadline, adds waterfall instances at their prices,
// and returns candidates in the order the SDK should try to load them.
func Rank(ctx context.Context, instances []Instance, floorMicros int64, timeout time.Duration) []Candidate {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	var mu sync.Mutex
	var out []Candidate
	var wg sync.WaitGroup
	for _, in := range instances {
		if !in.Bidding {
			if in.ECPMMicros >= floorMicros {
				mu.Lock() // bidder goroutines may already be appending
				out = append(out, Candidate{in.ID, in.Network, false, in.ECPMMicros, "estimated"})
				mu.Unlock()
			}
			continue
		}
		wg.Add(1)
		go func(in Instance) {
			defer wg.Done()
			price, ok, err := in.Source.Bid(ctx, in.ID, in.Token)
			if err != nil || !ok || price < floorMicros {
				return // timeouts and no-bids are logged as bid_requests outcomes
			}
			mu.Lock()
			out = append(out, Candidate{in.ID, in.Network, true, price, "exact"})
			mu.Unlock()
		}(in)
	}
	wg.Wait()
	sort.SliceStable(out, func(i, j int) bool { return out[i].CPMMicros > out[j].CPMMicros })
	return out // the SDK loads out[0]; on load failure it falls to out[1], and so on
}
```

```rust tab="Rust"
use std::time::Duration;
use futures::future::join_all;
use tokio::time::timeout;

#[derive(Clone)]
pub struct Candidate {
    pub instance_id: String,
    pub network: String,
    pub bidding: bool,
    pub cpm_micros: i64,
    pub precision: &'static str,
}

#[async_trait::async_trait]
pub trait BidSource: Send + Sync {
    async fn bid(&self, instance_id: &str, token: &[u8]) -> anyhow::Result<Option<i64>>;
}

pub struct Instance {
    pub id: String,
    pub network: String,
    pub bidding: bool,
    pub ecpm_micros: i64,
    pub source: Option<std::sync::Arc<dyn BidSource>>,
    pub token: Vec<u8>,
}

pub async fn rank(instances: &[Instance], floor_micros: i64, deadline: Duration) -> Vec<Candidate> {
    let mut out: Vec<Candidate> = instances
        .iter()
        .filter(|i| !i.bidding && i.ecpm_micros >= floor_micros)
        .map(|i| Candidate { instance_id: i.id.clone(), network: i.network.clone(),
                             bidding: false, cpm_micros: i.ecpm_micros, precision: "estimated" })
        .collect();

    let bids = instances.iter().filter(|i| i.bidding).filter_map(|i| {
        let src = i.source.clone()?;
        Some(async move {
            match timeout(deadline, src.bid(&i.id, &i.token)).await {
                Ok(Ok(Some(p))) if p >= floor_micros => Some(Candidate {
                    instance_id: i.id.clone(), network: i.network.clone(),
                    bidding: true, cpm_micros: p, precision: "exact" }),
                _ => None, // timeout, error or no bid: logged as a bid_requests outcome
            }
        })
    });
    out.extend(join_all(bids).await.into_iter().flatten());
    out.sort_by(|a, b| b.cpm_micros.cmp(&a.cpm_micros));
    out // load the first; on failure fall to the next
}
```

Two things in the sketch are policy, not mechanics. The floor applies to both kinds of candidate, so a bid below it loses to nothing; and the precision travels with the candidate, because the revenue the SDK reports for a waterfall winner is the estimate it ranked on, not a price anyone paid.

## Impression-Level Revenue

Mediation SDKs report revenue for each impression to the app, which forwards it to analytics and to its measurement partner to compute user lifetime value. The platforms report the same three things: a value, a currency and how much to trust it.

- **AdMob:** `AdValue.getValueMicros()` "returns the value of the ad in micro units" (5,000 micros is $0.005), with the currency code and a precision type: `ESTIMATED` ("estimated from aggregated data"), `PUBLISHER_PROVIDED` ("such as manual CPMs in a mediation group"), `PRECISE` ("The precise value paid for this ad") or `UNKNOWN`.
- **AppLovin MAX:** `getRevenue()` in USD (`-1` on error) with `getRevenuePrecision()`: `exact` ("the result of a real-time auction"), `estimated` ("based on Auto-CPM or FB Bidding estimates"), `publisher_defined` ("the price assigned by the publisher"), `undefined`, or empty in test mode.
- **LevelPlay:** ILR "determines ad revenue on both the device and impression level, from any ad unit, across every ad network," delivered to attribution partners' dashboards and through a server-side API.

The value is a revenue figure per impression, not a CPM: a $10 CPM impression reports $0.01. And it is the network's price, not the publisher's share unless the network's price is already net. Two rules follow. Store the value as integer micros with its currency and precision exactly as reported. And never let an impression-level estimate stand as booked revenue: what the publisher is owed is the network's statement and, finally, its payment. The Gaming volume makes the same point from the game's side: mediation revenue "is an estimate until the network pays" ([Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads)).

**Reconciliation.** A publisher has three numbers per network per day: the sum of impression-level values, the network's reported revenue in its dashboard or reporting API, and the amount paid on the network's statement for the month. They differ for known reasons (estimates for waterfall instances, invalid traffic removed by the network, currency conversion, time zones, late data), and the reconciliation's job is to explain the differences by network and instance and to correct user-level revenue where it was badly estimated. Reconciliation & Discrepancies covers the general method; Publisher Payouts & Revenue Share covers statements and payment terms.

## Counting in Apps

The MRC's mobile application guidelines (IAB, MMA and MRC, version 3.0, October 2017) apply the same counting principles as the web with app-specific rules:

- **Begin to render.** A valid ad impression is counted only "when ad content has been loaded and at minimum begins to render."
- **Pre-fetch and pre-load.** Apps load ads ahead of time so they show instantly. Pre-fetch and pre-render requests "do not qualify for measurement as a valid ad impression unless ad content has been loaded and begins to render in response to a request by a user." For pre-loaded interstitials, a vendor should count only after "the last part of the application code that checks for a pre-loaded ad and then if present, chooses to display it," or "only ... when displayed/visible."
- **Auto-refresh.** Banners refreshed on a timer are disclosed as site-initiated auto-refresh, because a slot refreshing every 30 seconds while the user reads produces impressions without new attention.
- **Offline and background.** Activity recorded offline and sent later is included where applicable, and apps running in the background are subject to inactivity rules.

The common failure is counting a pre-loaded interstitial at load. A game that loads an interstitial at session start and shows it, maybe, at the third level end must count at the show, which is also when a mediation SDK fires its impression callback. Counting Impressions & Clicks owns `counting_policies`, where an app's inventory type carries these rules.

**Open Measurement.** OM SDK is the one integration through which verification vendors measure viewability and invalid traffic in apps: the app (or its mediation and network SDKs) integrates the certified SDK, and vendors' scripts read its signals. A network SDK that isn't OM-integrated leaves its impressions unmeasured by third parties, which buyers increasingly price as risk. Measurement Standards & the MRC covers certification.

## Authorized Sellers and Identity

**app-ads.txt.** An app's authorized sellers file is hosted on the developer website listed in its store page, and SSPs must send the store URL in bid requests so buyers can find it (ads.txt, sellers.json & SupplyChain covers discovery and validation). For a mediated app, every network and exchange that sells the app's inventory programmatically needs its line in the file, and a missing line costs real demand because DSPs drop unauthorized supply.

**Device identifiers and consent.** On iOS, the IDFA is available only after the user authorizes tracking under App Tracking Transparency, and Apple's guideline 5.1.2(i) adds: "You must receive explicit permission from users via the App Tracking Transparency APIs to track their activity." On Android, the advertising ID and its opt-out apply. The mediation SDK passes consent signals (TCF, GPP, the platform's tracking status, child-directed flags) to every adapter, and each network must honor them; Mobile Ad IDs, ATT & SKAdNetwork covers the identifiers, and Consent Management & the TCF covers the CMP side. The playbook's rule is the one that matters for an SDK stack: gate every SDK on consent before it collects anything ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)).

## App Store Policies on Ads

Both stores make ad rules part of app review. From Apple's App Store Review Guidelines:

- **2.5.18:** display advertising "should be limited to your main app binary," not extensions, App Clips, widgets, notifications, keyboards or watchOS apps; ads "must be appropriate for the app's age rating," must "allow the user to see all information used to target them for that ad (without requiring the user to leave the app)," and "may not engage in targeted or behavioral advertising based on sensitive user data" such as health data, classroom data, or data from Kids Category apps; apps with ads "must also include the ability for users to report any inappropriate or age-inappropriate ads."
- **3.2.2(iii):** unacceptable: "Artificially increasing the number of impressions or click-throughs of ads, as well as apps that are designed predominantly for the display of ads."
- **3.1.3(g):** buying ads displayed in the same app (such as boosting a post) is a digital purchase and must use in-app purchase.
- **1.3 and 5.1.4:** Kids Category apps "should not include third-party analytics or third-party advertising," with narrow exceptions for contextual advertising with human review of creatives (Ads in Games covers children's apps).

Google Play's Families policy imposes the parallel rules on apps that target children or show ads to users of unknown age, including using only self-certified ads SDKs; Ads in Games covers it.

For an ad platform, these are product requirements: an in-app "why am I seeing this ad" surface, a report-this-ad action, an age-rating check on creative categories, and a policy check that the SDK isn't initialized in extensions.

## How to Build It

The core model holds an app as a `properties` row (`kind = 'app'`, with bundle and store URL); Ad Servers adds `yield_groups` (with formats `rewarded` and `interstitial` and integration `mediation_waterfall`) and `yield_group_partners` (with `waterfall_position`, `manual_cpm_micros` and `revenue_share_bp`); How Programmatic Works adds `bid_requests`; ads.txt, sellers.json & SupplyChain adds the app-ads.txt crawl; Counting Impressions & Clicks adds counting policies for apps. This chapter adds the SDKs in each app build, the network instances each mediation partner fills, impression-level revenue and network revenue reports.

```sql
ALTER TABLE yield_groups
  ADD COLUMN platform TEXT,                -- 'ios', 'android'; mediation groups are per platform
  ADD COLUMN segment JSONB NOT NULL DEFAULT '{}';  -- countries, app versions, user segments

ALTER TABLE yield_groups ADD CONSTRAINT yield_groups_platform_check
  CHECK (platform IN ('ios', 'android', 'ctv', 'web')) NOT VALID;

CREATE TABLE app_sdk_integrations (       -- which SDKs and adapters ship in which app build
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id        UUID NOT NULL REFERENCES properties (id),     -- the app, per platform
  app_version        TEXT NOT NULL,
  sdk_org_id         UUID NOT NULL REFERENCES organizations (id),  -- the mediation platform or network
  component          TEXT NOT NULL CHECK (component IN ('mediation_sdk', 'adapter',
                       'network_sdk', 'om_sdk', 'cmp')),
  component_version  TEXT NOT NULL,
  supports_bidding   BOOLEAN NOT NULL DEFAULT FALSE,
  om_partner         TEXT,                 -- the OM SDK partner name, if the component integrates it
  first_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active_install_share_bp INT,             -- share of active users on this build, from analytics
  UNIQUE (property_id, app_version, sdk_org_id, component)
);

CREATE TABLE mediation_instances (        -- one network placement filling one mediation partner slot
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  yield_group_partner_id UUID NOT NULL REFERENCES yield_group_partners (id),
  ad_unit_id            UUID NOT NULL REFERENCES ad_units (id),
  network_placement_ref TEXT NOT NULL,     -- the network's zone, placement or instance ID
  mode                  TEXT NOT NULL CHECK (mode IN ('bidding', 'waterfall')),
  manual_cpm_micros     BIGINT,            -- a publisher-set waterfall price
  auto_cpm              BOOLEAN NOT NULL DEFAULT FALSE,  -- price follows the network-reported CPM
  floor_cpm_micros      BIGINT,
  countries             CHAR(2)[],         -- null: every country in the group
  min_adapter_version   TEXT,
  status                TEXT NOT NULL CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE (yield_group_partner_id, ad_unit_id, network_placement_ref),
  CHECK (mode = 'bidding' OR manual_cpm_micros IS NOT NULL OR auto_cpm)
);

CREATE TABLE impression_revenue_events (  -- revenue the mediation SDK reported for one impression
  id                  UUID NOT NULL DEFAULT uuidv7(),
  occurred_at         TIMESTAMPTZ NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_id         UUID NOT NULL,
  ad_unit_id          UUID NOT NULL,
  mediation_instance_id UUID,              -- null when the SDK named an unmapped network
  network_name        TEXT NOT NULL,       -- as the SDK reported it
  value_micros        BIGINT NOT NULL,     -- the impression's value, not a CPM
  currency            CHAR(3) NOT NULL,
  precision           TEXT NOT NULL CHECK (precision IN ('exact', 'estimated',
                        'publisher_defined', 'unknown')),
  country             CHAR(2),
  app_version         TEXT,
  user_key            BYTEA,               -- keyed hash of the app's user ID, for LTV; null without consent
  ad_event_id         UUID,                -- the impression in ad_events
  PRIMARY KEY (occurred_at, id)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE network_revenue_reports (    -- what each network says it earned, by instance and day
  network_org_id        UUID NOT NULL REFERENCES organizations (id),
  mediation_instance_id UUID NOT NULL REFERENCES mediation_instances (id),
  day                   DATE NOT NULL,     -- in the network's reporting time zone
  report_time_zone      TEXT NOT NULL,
  impressions           BIGINT NOT NULL,
  revenue_micros        BIGINT NOT NULL,   -- the publisher's share as the network reports it
  currency              CHAR(3) NOT NULL,
  source                TEXT NOT NULL CHECK (source IN ('reporting_api', 'statement',
                          'mediation_dashboard')),
  version               INT NOT NULL DEFAULT 1,  -- networks restate
  fetched_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_line_id       UUID REFERENCES invoice_lines (id),  -- the statement line once paid
  PRIMARY KEY (network_org_id, mediation_instance_id, day, source)
);
```

The daily reconciliation compares the three numbers per instance:

```sql
SELECT r.mediation_instance_id,
       r.day,
       SUM(e.value_micros)                                  AS sdk_reported_micros,
       MAX(r.revenue_micros) FILTER (WHERE r.source = 'reporting_api') AS network_reported_micros,
       MAX(r.revenue_micros) FILTER (WHERE r.source = 'statement')     AS statement_micros,
       SUM(e.value_micros) FILTER (WHERE e.precision <> 'exact')        AS estimated_micros
FROM network_revenue_reports r
LEFT JOIN impression_revenue_events e
  ON e.mediation_instance_id = r.mediation_instance_id
 AND (e.occurred_at AT TIME ZONE r.report_time_zone)::date = r.day
 AND e.currency = r.currency
WHERE r.day BETWEEN $1 AND $2
GROUP BY r.mediation_instance_id, r.day
ORDER BY r.day, r.mediation_instance_id;
```

Design notes:

- **Mediation extends the ad server's yield groups.** A mediation group is a `yield_groups` row with a platform and a segment; each network in it is a `yield_group_partners` row; each network placement is a `mediation_instances` row. No second hierarchy for apps.
- **SDK versions are data.** `app_sdk_integrations` answers "which builds still ship the adapter that doesn't bid?" and "how many active users can a network's new format reach?", which drive every mediation change. The install share comes from analytics, not from the ad stack.
- **Revenue keeps its precision.** An `estimated` value in user-level LTV is a forecast; an `exact` value is a clearing price. Reports and models that mix them say so.
- **Values are per impression, in micros.** The SDKs report value per impression, so the column is `value_micros`, never a CPM; summing is exact in integers, and conversion to minor units happens on the statement.
- **Network reports restate.** Networks revise days as they remove invalid traffic; `version` and `source` keep each figure, and the statement line, once paid, is linked so the books close on money received.
- **User keys need consent.** Impression-level revenue tied to a user is the input to LTV and to user acquisition bidding; it carries a user key only where the app's consent state allows it, and it is a pseudonym.

## Auditing

- **What ran in each build.** SDK, adapter and OM SDK versions per app version, and when each reached users, so a revenue drop or a privacy question can be tied to a release.
- **How each request was decided.** The candidates (bids with their prices, waterfall instances with their prices and precision), the floor, the winner and load failures, kept in `auctions`, `bids` and `bid_requests` for the dispute window.
- **What each party said it earned.** Impression-level values with precision, network reports by version and the paid statement, and the reconciliation's explained and unexplained differences.
- **What each network was allowed to collect.** The consent state passed to adapters on each request, and the network SDKs present, for privacy disclosures and regulator questions.

## What This Means for the System You Build

- **Model mediation as yield groups with partners and instances,** per platform and segment, not as a parallel hierarchy.
- **Track SDK and adapter versions per app build** with their install share, and add networks only when they bid.
- **Run bidders and waterfall instances in one auction** under one floor, with each candidate's price precision kept.
- **Count interstitials at the show, not the load,** and disclose auto-refresh.
- **Store impression-level revenue as micros per impression with currency and precision,** and reconcile it daily against network reports and monthly against statements.
- **Keep app-ads.txt complete** for every network selling programmatically.
- **Build the store policies into the product:** ad reporting, targeting explanations, age-appropriate categories, no ads outside the main binary.

## References

**Specifications**

- [IAB, MMA and MRC: Mobile Application Advertising Measurement Guidelines (October 2017, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/Mobile%20In-App%20Measurement%20Guidelines%20%28MMTF%20Final%20v1.1%29.pdf), begin to render, pre-fetch and pre-render, pre-loaded interstitials, auto-refresh, SDK quality control
- [IAB Tech Lab: MRAID](https://iabtechlab.com/standards/mobile-rich-media-ad-interface-definitions-mraid/), MRAID 3.0 as the common API for mobile rich media ads
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), one integration for verification vendors in apps

**Filings**

- [AppLovin: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1751008/000175100826000010/app-20251231.htm), MAX's in-app bidding, Axon Ads Manager, the sale of the apps business to Tripledot and its terms, 2025 revenue from continuing operations

**In practice**

- [Apple: App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), guidelines 1.3, 2.5.18, 3.1.3(g), 3.2.2(iii), 5.1.2(i) and 5.1.4 on ads, tracking and kids
- [Google AdMob: About mediation](https://support.google.com/admob/answer/3063564?hl=en), mediation, bidding, waterfall, mediation groups and hybrid setups
- [Google AdMob: Mediation (Android)](https://developers.google.com/admob/android/mediation), bidding requiring Google Mobile Ads SDK 18.3.0 or later
- [Google AdMob: Impression-level ad revenue (Android)](https://developers.google.com/admob/android/impression-level-ad-revenue), OnPaidEventListener, AdValue in micros, precision types, SDK 21.1.0
- [Google AdMob: Rewarded interstitial ad units](https://support.google.com/admob/answer/9884467?hl=en), the intro screen, skip option and skippable-only rule
- [AppLovin MAX: Getting started](https://support.applovin.com/en/max/getting-started), the unified auction, prioritizing bidding networks, Auto-CPM, custom networks
- [AppLovin MAX: Advanced settings (Android)](https://support.applovin.com/en/max/android/overview/advanced-settings/), impression-level user revenue, revenue precision values
- [Unity Grow: LevelPlay](https://docs.unity.com/en-us/grow), LevelPlay as Unity's ad mediation solution
- [Unity LevelPlay: In-app bidding](https://docs.unity.com/en-us/grow/levelplay/platform/fundamentals/in-app-bidding), real-time bidding, hybrid setups, SDK 6.10.0 requirement
- [Unity LevelPlay: Fundamentals](https://docs.unity.com/en-us/grow/levelplay/platform/fundamentals/fundamentals), instance rates and waterfall management
- [Unity LevelPlay: Impression level revenue](https://docs.unity.com/en-us/grow/levelplay/platform/fundamentals/impression-level-revenue), ILR at device and impression level, attribution partners, the server-side API's 14 days
