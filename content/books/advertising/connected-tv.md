+++
title = "Connected TV & Streaming"
description = "CTV supply: streaming apps, FAST channels and TV platforms, inventory shares, identifiers, ACR viewing data, measurement limits and CTV fraud."
category = "Advertising Industry"
order = 2947
part = "Channels"
tags = ["advertising", "ctv", "streaming", "fast", "acr", "data-model"]
nav_title = "Connected TV"
+++

Connected TV (CTV) is video delivered over the internet and watched on a television. The ad opportunity is a commercial break, a pause screen or a tile on a home screen in a streaming app, a free ad-supported channel (FAST) or the TV's own interface, and the buyer is often the same brand that buys broadcast and cable television, with the same expectation that its 30-second spot plays full screen, with sound, to a household. What changed is the plumbing: the break is filled by an ad server and often a programmatic auction, the ad is stitched into the stream by a server, and the counts come from beacons rather than a ratings panel.

It is hard because almost every assumption that makes web advertising measurable breaks on a television. There is no cookie and usually no JavaScript; many devices can't run a measurement SDK; the device that requests the ad is often a server acting for the TV, so every request comes from a data center address; a streaming stick can play ads to a TV that is switched off; one screen is watched by several people; the identifiers are platform IDs that the app or the server fills in; and the inventory is sold by several parties at once, because the TV platform, the app and the channel each hold a share of the same breaks. Each of those facts shows up in the data model as a column someone has to fill and a party someone has to trust.

This chapter covers the CTV supply chain (streaming services, FAST channels, TV platforms and the inventory shares between them), how the major sellers sell, what a CTV ad request carries and how its identifiers and app identity work, automatic content recognition (ACR) viewing data and the law around it, why CTV measurement differs (the MRC's CTV definition, TV-off and inactivity rules, OM SDK coverage) and how CTV fraud exploits the gaps. It extends `properties` and `ad_requests` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and adds distribution agreements between channels and platforms and ACR exposures. The money split on one pod is [A CTV ad pod](/books/advertising/advertising-business#a-ctv-ad-pod). VAST & Video Ads covers the creative markup; Server-Side Ad Insertion & Ad Pods covers stitching, pods and competitive separation; Linear TV, Upfronts & Addressable TV covers the upfront deal and the GRP guarantee; the CTV ad formats (pause, menu, overlay) are in Ad Formats & Standards. The video delivery itself (transcoding, packaging, DRM) is the User-Generated Platforms volume's [Video on Demand](/books/user-generated-platforms/video-on-demand).

## How the Platforms Do It

As of November 2026, from each company's filings, newsroom and documentation. Rows are sellers of CTV inventory; most buyers reach several through direct deals and DSPs.

| Seller | What it sells | How buyers buy | Published scale |
| --- | --- | --- | --- |
| **Amazon** (Prime Video) | Ads in Prime Video, on by default since early 2024 in the US, UK, Germany and Canada, with "meaningfully fewer ads than linear TV" | Through Amazon's own buying tools and sales team | Ad-free option renamed Prime Video Ultra, $4.99 a month or $45.99 a year (March 13, 2026) |
| **Disney** (Disney+, Hulu, ESPN) | Ads in its streaming services; Disney+ opened to advertisers December 8, 2022 | Upfront and direct deals, programmatic | 164 million global ad-supported monthly active users across services at its May 2025 upfront |
| **Netflix** | Ads plan launched November 2022; Netflix Ads Suite in all 12 ad countries; pause and live ads | Direct and programmatic through Amazon, AJA, DV360, The Trade Desk and Yahoo DSP; pause ads and live inventory added to programmatic in summer 2026 | More than 250 million monthly active viewers (May 2026); a projected rough doubling of ads revenue to about $3 billion in 2026 |
| **Roku** | Video inventory in its own Roku Channel and a share of partner apps' inventory, plus home screen units (Roku City screensaver, marquee and spotlight ads) | Direct insertion orders, preferred DSP partners (including Amazon DSP) and Roku Ads Manager, its self-service platform | Platform revenue $4.145 billion in 2025; more than 90 million streaming households; 145.6 billion streaming hours |
| **Vizio** (Walmart) | SmartCast home screen and its own FAST channels; Platform+ (mostly advertising) produces all of Vizio's gross profit | Direct and programmatic, paired with Walmart Connect | More than 19 million active accounts when Walmart closed the acquisition on December 3, 2024 |

Two patterns run through the table. First, the TV platform (Roku, Vizio, the TV makers) is also a seller, and it sells a share of the apps that run on it. Second, the big streaming services publish audience in their own units (Netflix's monthly active viewers count accounts that watched at least a minute of ads, multiplied by household size), which are not ratings, not impressions and not comparable with each other; Audience & Cross-Media Measurement covers the currencies buyers actually transact on.

## The Supply Chain

A CTV impression has more sellers than a web impression, because three businesses stand between the viewer and the buyer:

- **The content owner,** who makes or licenses the programs: a network, a studio, a FAST channel operator.
- **The app or channel,** where the viewer watches: a streaming service's own app, a FAST service that aggregates channels, a vMVPD (a pay-TV bundle delivered over the internet), or a channel inside someone else's service.
- **The TV platform,** the operating system and home screen: Roku, Fire TV, Google TV, tvOS, a TV maker's own system (Samsung's Tizen, LG's webOS, Vizio's SmartCast), or a game console.

**FAST** (free ad-supported streaming TV) is linear channels delivered over the internet: a schedule, like broadcast, with breaks at set points, often built from a library of on-demand episodes. Roku describes its Live TV as "500+ FAST (free, ad-supported linear streaming TV) channels" inside The Roku Channel. For the ad system, a FAST channel is a live stream (breaks arrive on the schedule, not when a viewer presses play) assembled from VOD content, which is why server-side tools such as AWS Elemental MediaTailor offer "channel assembly", a "manifest-only service" that builds linear streams from VOD files and inserts breaks "without having to condition it with SCTE-35 markers."

**Inventory shares.** The TV platform's leverage is distribution: an app that wants to be on the home screen negotiates with the platform, and the price is often ad inventory rather than cash. Roku's annual report says it "typically secure[s] direct access to a portion of the content partners' video advertising inventory for our monetization," and that its sales are "complementary" to the partners' own. The split, the categories each side may sell, and whose ad server fills which breaks are in private distribution agreements; no public filing I found states a typical percentage. <!-- source-gap: adv-ctv-inventory-share-percent | missing | the typical share of an app's ad inventory a TV platform receives under a distribution agreement | closes with: a filing, court record or published platform terms stating the share | checked: 2026-11-22 --> The engineering consequence is that a single app's breaks are sold by two sellers through two ad servers, and both need to appear correctly in the app's `app-ads.txt` and in the supply chain object, or buyers' supply path checks will treat one of them as unauthorized (ads.txt, sellers.json & SupplyChain covers the files and checks). The same applies to programmers whose content a streaming app carries: ads.txt 1.1's `INVENTORYPARTNERDOMAIN` is "a pointer to the domain of an entity that is explicitly authorized to monetize ads within the application's content," followed one hop to the partner's ads.txt and honored only when the bid request names the partner in `app.inventorypartnerdomain`.

**The TV platform's own surfaces.** Home screens, screensavers and menus are inventory the platform owns outright. Roku lists "high-visibility placements within our iconic Roku City screensaver," wallpaper themes, spotlight and marquee ads; IAB Tech Lab's CTV Ad Portfolio standardizes menu, screensaver and pause formats and their OpenRTB signaling, which Ad Formats & Standards covers.

**Who has the data.** The app knows what was watched inside it; the platform knows which apps were opened and, on TVs with ACR, what was on the screen; the vMVPD or cable operator knows the household's subscription and set-top box viewing. Roku's filing names the tension directly: it is "not able to fully utilize program level viewing data from many of our most popular apps." Whoever holds the viewing data sells the targeting and the measurement, which is why TV makers, platforms and retailers (Walmart with Vizio) compete for it.

## How the Money Moves

A CTV spot sold programmatically splits like any open-auction impression, with SSAI and ad serving costs paid by the publisher ([A CTV ad pod](/books/advertising/advertising-business#a-ctv-ad-pod)). What CTV adds is the second seller. When a platform sells its share of an app's breaks, the platform is the seller of record and pays the app a revenue share, or keeps the whole price in exchange for distribution; when the app sells its own share, the platform is not in the chain at all. A buyer sees two seller IDs for the same app, both legitimate, and a reconciler sees two statements for one app's breaks.

Prices in CTV are high relative to display because the unit is a full-screen, mostly non-skippable video with sound, and because much of it is sold directly: upfront commitments and programmatic guaranteed deals carry a large part of premium streaming inventory, with the open auction filling FAST, long-tail apps and unsold breaks. Deals, PMPs & Curation covers the deal types; Linear TV, Upfronts & Addressable TV covers the upfront.

## What a CTV Ad Request Carries

A CTV request has the same shape as any OpenRTB video request, and the differences are in what's missing and who filled it in.

**App identity.** CTV apps are identified by their store, and IAB Tech Lab's CTV programmatic guide says the store ID should identify the app and that "IDs that are not unique within the app store (like the 'bundle id' in iOS/tvOS) should not be used," with "the app store URL should also be passed in" so the store is unambiguous. A Roku channel ID, an Amazon Appstore ID and a Samsung app ID are different namespaces; the pair (store, ID) is the key. `properties.store_url` and `properties.bundle_id` in the core model hold it, and this chapter adds the platform.

**Device identifiers.** Each TV platform issues its own resettable advertising ID, and the request carries three values: the IFA, its type and the limit-ad-tracking flag. The guide is explicit about the flag: "If limit ad tracking is requested, the ad platform must ignore the IFA, even if it is included in the request," and a temporary ID must be typed "sessionid". The IFA type list (`rida` for Roku, `tifa` for Samsung, `vida` for Vizio, `lgudid` for LG, `afai` for Fire TV and others) and the columns that hold it are in Mobile Ad IDs, ATT & SKAdNetwork, which owns `ad_requests.ifa_type`; this chapter only adds the rule that an IFA without a type is not an identifier.

**Device headers.** When a server-side ad insertion service asks for ads on the TV's behalf, the request comes from the stitcher, and the guide requires `X-Device-IP` "set to the IP address of the device on whose behalf this request is being made" and `X-Device-User-Agent`, with `X-Device-Referer` "if available." The receiving ad server treats the connection address as the stitcher and the header as the device, after checking that the stitcher is allowed to make that claim (Server-Side Ad Insertion & Ad Pods covers it).

**Content.** OpenRTB 2.6 added `Network` and `Channel` objects to `Content`, the channel being "the entity that curates a content library, or stream within a brand name for viewers," each with an ID, name and domain, and `Content.livestream` distinguishes scheduled (linear) from on-demand viewing: "1 = the broadcast is scheduled (also referred to as linear viewing)." The implementation guide's live TV examples combine it with `realtime` and `firstbroadcast`, so a live game and a scheduled replay can be told apart. Buyers use these to target networks and genres and to apply brand suitability, and sellers often send less than they have, because content metadata is also competitive information.

A sketch of the checks a CTV ad server runs on an incoming request before it trusts any of it:

```go tab="Go"
type CTVRequest struct {
	StoreURL   string // app store URL
	StoreID    string // the app's ID in that store
	IFA        string
	IFAType    string // "rida", "tifa", "vida", "sessionid", ...
	LMT        bool
	ViaServer  bool   // arrived from a stitcher, not the device
	DeviceIP   string // X-Device-IP, when ViaServer
	DeviceUA   string // X-Device-User-Agent, when ViaServer
	StitcherID string // authenticated sender, when ViaServer
}

type Verdict struct {
	UseIFA   bool
	Problems []string
}

var zeroIFA = "00000000-0000-0000-0000-000000000000"

// Check applies the CTV guide's rules: store identity, IFA with its type, LMT, device headers.
func Check(r CTVRequest, allowedStitchers map[string]bool) Verdict {
	v := Verdict{UseIFA: true}
	if r.StoreURL == "" || r.StoreID == "" {
		v.Problems = append(v.Problems, "app identity: store URL and store ID required")
	}
	if r.IFA == "" || r.IFA == zeroIFA || r.IFAType == "" || r.IFAType == "sessionid" {
		v.UseIFA = false // no persistent ID: frequency and audiences fall back to contextual
	}
	if r.LMT {
		v.UseIFA = false // "must ignore the IFA, even if it is included"
	}
	if r.ViaServer {
		if !allowedStitchers[r.StitcherID] {
			v.Problems = append(v.Problems, "unauthenticated server-side sender")
		}
		if r.DeviceIP == "" || r.DeviceUA == "" {
			v.Problems = append(v.Problems, "missing X-Device-IP or X-Device-User-Agent")
		}
	}
	return v
}
```

```rust tab="Rust"
pub struct CtvRequest {
    pub store_url: String,
    pub store_id: String,
    pub ifa: Option<String>,
    pub ifa_type: Option<String>, // "rida", "tifa", "vida", "sessionid", ...
    pub lmt: bool,
    pub via_server: bool,          // arrived from a stitcher, not the device
    pub device_ip: Option<String>, // X-Device-IP
    pub device_ua: Option<String>, // X-Device-User-Agent
    pub stitcher_id: Option<String>,
}

pub struct Verdict {
    pub use_ifa: bool,
    pub problems: Vec<&'static str>,
}

const ZERO_IFA: &str = "00000000-0000-0000-0000-000000000000";

pub fn check(r: &CtvRequest, allowed_stitchers: &std::collections::HashSet<String>) -> Verdict {
    let mut v = Verdict { use_ifa: true, problems: Vec::new() };
    if r.store_url.is_empty() || r.store_id.is_empty() {
        v.problems.push("app identity: store URL and store ID required");
    }
    let typed = matches!(r.ifa_type.as_deref(), Some(t) if t != "sessionid");
    let real = matches!(r.ifa.as_deref(), Some(i) if !i.is_empty() && i != ZERO_IFA);
    if !typed || !real || r.lmt {
        v.use_ifa = false; // LMT: "must ignore the IFA, even if it is included"
    }
    if r.via_server {
        let known = r.stitcher_id.as_ref().is_some_and(|s| allowed_stitchers.contains(s));
        if !known {
            v.problems.push("unauthenticated server-side sender");
        }
        if r.device_ip.is_none() || r.device_ua.is_none() {
            v.problems.push("missing X-Device-IP or X-Device-User-Agent");
        }
    }
    v
}
```

The rule the code encodes: identity in CTV is asserted by whoever built the request, so the system checks the assertion's shape (typed, not limited, from a known sender) before it uses it for frequency capping, audiences or billing.

## Households, Not Devices

A television is shared. The MRC's guidance on CTV keeps the term for "the delivery of digital video to televisions via internet-connected devices (or functionality within the television itself)," covering IP set-top boxes, HDMI sticks, smart TVs and game consoles, and separates it from the broader OTT ("Over the Top"), which the MRC keeps as a content term spanning TV, desktop and mobile. It explains why the device matters: content on a TV screen "may present different behaviors such as co-viewing, which may not occur widely in other platforms."

So the natural unit in CTV is the household. A CTV IFA identifies a device; the household is the set of devices behind one residential IP address, joined by a platform login or by an identity graph; and the people in front of the screen are a modeled estimate. Frequency caps by device under-cap a household with three TVs and over-cap a household where one TV is watched by four people. Pacing & Frequency Capping covers capping across devices; for CTV, my default is to cap by household where a household key exists, by device otherwise, and to record which one each cap used, because a buyer comparing reach across sellers needs to know.

Netflix's switch from monthly active users to monthly active viewers in November 2025 is the same issue at the publisher's level: the new figure multiplies accounts that "watched at least 1 minute of ads" by household size, a person-level estimate built on a device-level count. The number is useful for planning and useless for reconciliation; invoices still run on impressions.

## Automatic Content Recognition

Most smart TVs can identify what is on the screen, whatever its source (cable box, antenna, game console, streaming app), by matching audio or video fingerprints against a reference library. That is **automatic content recognition**, and it is the raw material for TV makers' targeting, for linear-to-streaming attribution ("this household saw the spot on cable, then searched"), and for big-data TV measurement, where ACR and set-top box data are joined with a panel.

ACR is also the most regulated data in CTV, because it is a second-by-second record of what a household watched:

- **FTC and New Jersey v. Vizio (2017).** Vizio paid $2.2 million to settle charges that its TVs captured "second-by-second information" about what was on screen from 11 million TVs without consumers' knowledge, and sold the data for targeting; the order required affirmative consent and deletion of data collected before March 1, 2016.
- **US state privacy laws.** Several state laws treat viewing data as sensitive or require opt-out of its sale or use for targeted advertising (US State Privacy Law for Advertising covers them). California's enforcement record includes a $530,000 settlement with Sling TV (October 30, 2025), a streaming service rather than a TV maker.
- **State AG actions against TV makers.** Texas's attorney general sued several TV makers over ACR in December 2025, according to secondary reports; the state's own pages weren't reachable, so the claims and their status aren't stated here. <!-- source-gap: adv-texas-acr-suits | status | Texas AG lawsuits against TV makers over ACR (December 2025) and their outcomes | closes with: the Texas AG press releases or court filings for each case | checked: 2026-11-22 -->
- **The Video Privacy Protection Act.** A US federal statute (18 U.S.C. 2710) on disclosure of video viewing records; whether a given streaming or TV data flow falls under it is fact-specific and litigated, and nothing here is legal advice.

What follows for engineering is the consent rule from the playbook applied strictly ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)): ACR collection is off until the household opts in where the law or the order requires it, each exposure record carries the consent it was collected under, an opt-out stops collection and propagates to every downstream licensee, and a device key is a pseudonym, not anonymity ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

## Measuring CTV

CTV impressions follow the same counting rules as other digital video: the MRC's guidance says CTV video impression measurement is subject to "client initiation, filtration for invalid traffic, and requirements for the ad to be loaded and at minimum begin to render." Where that is impossible, the limitation is disclosed: "Any such measurement limitations should be clearly disclosed and quantified to the fullest extent possible." Three CTV-specific problems sit on top:

- **TV off.** A stick or box with its own power can keep playing ads to a TV that is off. The MRC says detection of TV off "is not currently a requirement," encourages vendors to detect it actively or from a received parameter, and says events confirmed to occur while the TV is off "should be removed and should not be counted as Ad Impressions."
- **Inactivity rules.** Streaming apps autoplay the next episode. Vendors "should institute specific 'inactivity rules'" that end a visit after a set period without interaction; excluded activity is data editing, not invalid traffic, and the criteria are disclosed. The guidance notes that long inactivity is legitimate in some places (airports, hotels, waiting rooms), which is digital out-of-home inventory, not a household.
- **Proxy traffic.** CTV traffic routinely arrives through proxies and data centers, so the MRC says such traffic "must be known to be invalid through direct signals in order to be filtered," that the routing alone "does not invalidate it," and that unvalidated traffic is treated as unknown rather than valid.

**Open Measurement on TVs.** OM SDK lets verification vendors measure through one integration; IAB Tech Lab's page lists Samsung and LG TV support added in OM SDK 1.5 (in the web video SDK), Android TV and tvOS in native builds, and, as of its November 2026 release, the CTV Ad Portfolio formats (menu or home screen, pause, screensaver and overlay). The page does not list Roku. Where OM SDK doesn't run, verification falls back to VAST-carried verification scripts that may not execute, server-side signals, or nothing, which is why many CTV buys carry "measured rate" lines far below web. Measurement Standards & the MRC and Viewability & Attention cover the metrics.

## CTV Fraud

Fraud follows money and gaps, and CTV has both: high CPMs and requests that are assertions by servers. The schemes that have been documented share a shape: software in a data center or on compromised devices generates ad requests that claim to be popular CTV apps on real-looking TV devices, typed IFAs included, and fires the tracking that a stitcher would fire. Invalid Traffic & Ad Fraud covers the named schemes and the detection methods. The MRC states the risk plainly: "SSAI artifacts may be spoofed by bad actors attempting to subvert measurement."

The defenses are structural, and most of them are records this chapter's tables keep:

- **Known senders.** Accept server-side requests and beacons only from authenticated stitchers, and verify that a publisher's claim to use SSAI is true; the MRC requires that providers indicating SSAI "be verified as such by measurement vendors."
- **Authorized sellers.** Match the app's store identity against its `app-ads.txt` and the seller IDs in the supply chain, including the platform's share.
- **Device attestation.** OM SDK's device attestation, adapted from the IETF's Privacy Pass, lets an app or player assert that the underlying device is authentic so measurement partners can verify ads render on real devices; its adoption is early.
- **Plausibility.** A household that "watches" 20 hours of a niche app's ads a day, an IFA seen on several IP addresses in an hour, a device type that doesn't ship the app: each is a rule in the invalid traffic pipeline, applied with the MRC's caution that proxies alone are not proof.

## How to Build It

The core model already holds a CTV app as a `properties` row with `kind = 'ctv_app'` and its store, a FAST channel as `kind = 'channel'`, and a request's device type as `ctv`. Mobile Ad IDs, ATT & SKAdNetwork adds `ad_requests.ifa_type`, `ifa_present` and `lmt`; How Programmatic Works adds `ad_requests.channel` and `entry_point` (with `'ssai'`); Counting Impressions & Clicks adds server-side counting to `counting_policies` and `beacon_receipts`. This chapter adds the platform a property runs on, the content and attestation signals of a CTV request, the distribution agreements that split an app's inventory, and ACR exposures.

```sql
ALTER TABLE properties
  ADD COLUMN tv_platform TEXT,           -- 'roku', 'fire_tv', 'google_tv', 'tvos', 'tizen',
                                         -- 'webos', 'smartcast', 'console', 'other'
  ADD COLUMN store_id TEXT,              -- the app's ID in its store; the key with store_url
  ADD COLUMN content_model TEXT,         -- how the audience watches
  ADD COLUMN parent_property_id UUID;    -- a FAST channel inside a FAST service's app

ALTER TABLE properties ADD CONSTRAINT properties_content_model_check
  CHECK (content_model IN ('avod', 'svod_with_ads', 'fast', 'vmvpd', 'platform_ui',
    'live_events')) NOT VALID;

ALTER TABLE properties ADD CONSTRAINT properties_parent_fk
  FOREIGN KEY (parent_property_id) REFERENCES properties (id) NOT VALID;

ALTER TABLE properties ADD CONSTRAINT properties_ctv_store_check
  CHECK (kind <> 'ctv_app' OR (store_url IS NOT NULL AND store_id IS NOT NULL)) NOT VALID;

CREATE UNIQUE INDEX CONCURRENTLY properties_store_key
  ON properties (store_url, store_id) WHERE store_id IS NOT NULL;

ALTER TABLE ad_requests
  ADD COLUMN content_network TEXT,       -- OpenRTB content.network.id, as sent
  ADD COLUMN content_channel TEXT,       -- content.channel.id
  ADD COLUMN livestream SMALLINT,        -- content.livestream: 1 scheduled (linear), 0 not
  ADD COLUMN household_key BYTEA,        -- keyed hash of the household ID, when one was used
  ADD COLUMN device_attested BOOLEAN,    -- OM SDK device attestation result; null: not offered
  ADD COLUMN stitcher_org_id UUID;       -- the SSAI service that made the request, if any

ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_livestream_check
  CHECK (livestream IN (0, 1)) NOT VALID;

ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_stitcher_fk
  FOREIGN KEY (stitcher_org_id) REFERENCES organizations (id) NOT VALID;

CREATE TABLE ctv_distributions (          -- an app or channel carried on a TV platform, and who sells what
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id            UUID NOT NULL REFERENCES properties (id),     -- the app or FAST channel
  platform_org_id        UUID NOT NULL REFERENCES organizations (id),  -- Roku, a TV maker, a FAST service
  platform_inventory_bp  INT NOT NULL CHECK (platform_inventory_bp BETWEEN 0 AND 10000),
                                          -- share of ad breaks the platform sells, basis points
  allocation_method      TEXT NOT NULL CHECK (allocation_method IN ('by_break', 'by_pod_slot',
                           'by_time', 'by_request_share')),  -- how the share is carved out
  platform_seller_account_id UUID REFERENCES seller_accounts (id),  -- the platform's seller ID for this app
  publisher_seller_account_id UUID REFERENCES seller_accounts (id), -- the app's own
  revenue_share_bp       INT CHECK (revenue_share_bp BETWEEN 0 AND 10000),
                                          -- what the platform pays the app on its share, if anything
  sales_restrictions     JSONB NOT NULL DEFAULT '{}',  -- categories or advertisers either side may not sell
  data_rights            JSONB NOT NULL DEFAULT '{}',  -- what viewing data each side receives
  fee_term_id            UUID REFERENCES fee_terms (id), -- any distribution fee, as a fee term
  effective              DATERANGE NOT NULL,
  contract_ref           TEXT NOT NULL,
  EXCLUDE USING gist (property_id WITH =, platform_org_id WITH =, effective WITH &&)  -- needs btree_gist
);

CREATE TABLE acr_exposures (              -- one recognized airing on one opted-in TV
  id                UUID NOT NULL DEFAULT uuidv7(),
  detected_at       TIMESTAMPTZ NOT NULL,  -- start of the match, from the TV
  device_key        BYTEA NOT NULL,        -- keyed hash of the TV's ACR ID; rotated with the key
  household_key     BYTEA,
  source_org_id     UUID NOT NULL,         -- the TV maker or ACR provider
  content_kind      TEXT NOT NULL CHECK (content_kind IN ('program', 'ad')),
  content_ref       TEXT NOT NULL,         -- a program ID, or the ad's Ad-ID / universal ad ID
  input_source      TEXT CHECK (input_source IN ('linear_tuner', 'hdmi', 'native_app',
                      'unknown')),
  duration_s        INT NOT NULL CHECK (duration_s > 0),
  consent_ref       TEXT NOT NULL,         -- the opt-in record this TV was under at detected_at
  region            TEXT,                  -- coarse: DMA or state; never precise location
  PRIMARY KEY (detected_at, id)
) PARTITION BY RANGE (detected_at);       -- daily; the shortest retention the contracts allow
```

Design notes:

- **The platform's share is a contract, not a guess.** `ctv_distributions` says, for each app on each platform, which share of breaks each side sells, through which seller account, and on what revenue share. The publisher's ad server reads it to decide whose breaks a request belongs to; the reconciler reads it to expect two statements; the `app-ads.txt` generator reads both seller accounts so neither looks unauthorized. Any fee the platform charges is a `fee_terms` row from Take Rates & Supply Quality, not a new money column.
- **Store identity is the key.** The CTV guide rejects non-unique bundle IDs, so a CTV property is unique on (store URL, store ID), and the check makes new CTV apps carry both. A FAST channel inside a FAST service is its own property with a parent, because buyers target and block channels, not only apps.
- **Content signals are what was sent.** `content_network`, `content_channel` and `livestream` record what the request said, so a buyer's complaint that its ads ran on the wrong network is answered from the request, not from today's catalog.
- **Households are hashed and labeled.** `household_key` is present only when a household ID was actually used, so reports can say which share of frequency capping ran on households and which on devices.
- **ACR rows carry their consent.** Each exposure points to the opt-in it was collected under; an opt-out stops new rows and triggers deletion of old ones per the order or law that applies; keys are hashed with a rotating key so a leaked table can't be joined to other data. The table is the input to attribution and to measurement, and it is partitioned by day so retention is a partition drop.
- **The stitcher is a party.** `stitcher_org_id` on the request ties every server-side request to the SSAI service that made it, which is the record the invalid traffic pipeline and the MRC's "verified as such" requirement need.

## Auditing

- **Who sold which break.** For any CTV impression, the property, the distribution agreement in force, whose share it was and through which seller account, so a disputed statement or a buyer's supply path question has one answer.
- **What the request claimed.** Store identity, IFA type and limit-ad-tracking state, device headers and the stitcher that sent them, and the content network and channel, as received.
- **How it was counted.** Whether the impression was client-initiated or server-side, the counting policy, and any TV-off or inactivity exclusions applied, with the rule version.
- **What viewing data was used, under which consent.** For every audience built from ACR or app viewing data, the exposures it used and the consent records behind them, and for every opt-out, when collection stopped and when downstream copies were deleted.

## What This Means for the System You Build

- **Key CTV apps by store and store ID,** never by bundle ID alone, and model FAST channels as properties with a parent.
- **Record the TV platform's inventory share as a contract** with both seller accounts, and generate `app-ads.txt` and supply chain entries from it.
- **Treat every CTV identifier as an assertion:** use an IFA only with its type, never when limit ad tracking is set, and only from an authenticated sender with device headers.
- **Plan in households, count in impressions,** and record whether each frequency cap used a household or a device.
- **Gate ACR on opt-in,** store each exposure with its consent, and propagate opt-outs to every licensee.
- **Apply the MRC's CTV rules in the counter:** begin to render, TV-off exclusion where a signal exists, disclosed inactivity rules, and proxy traffic as unknown rather than valid.
- **Name the stitcher on every server-side request and beacon,** so invalid traffic analysis and seller verification have a party to check.

## References

**Specifications**

- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), SSAI definition, X-Device headers, store ID over bundle ID, IFA type, LMT and sessionid rules, ad pod definition
- [IAB Tech Lab: ads.txt 1.1 (GitHub)](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/Supply-Chain-Validation/main/ads.txt%20v1.1.md), INVENTORYPARTNERDOMAIN, one-hop crawling and app.inventorypartnerdomain
- [IAB Tech Lab: OpenRTB 2.6](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), Network and Channel objects, Content.livestream
- [IAB Tech Lab: OpenRTB 2.6 implementation guide](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/implementation.md), live TV signaling with livestream, realtime and firstbroadcast
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), Samsung and LG support in 1.5, Android TV and tvOS, the November 2026 CTV format support, device attestation
- [MRC: Server-Side Ad Insertion and OTT Guidance (August 2021, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/083021%20SSAI%20and%20OTT%20Guidance%20%20FINAL.pdf), the CTV and OTT definitions, co-viewing, begin to render, TV off, inactivity rules, proxy traffic and SSAI verification

**Regulation**

- [FTC: Vizio to pay $2.2 million to FTC, State of New Jersey (February 6, 2017)](https://www.ftc.gov/news-events/news/press-releases/2017/02/vizio-pay-22-million-ftc-state-new-jersey-settle-charges-it-collected-viewing-histories-11-million), second-by-second viewing data from 11 million TVs, consent and deletion requirements
- [18 U.S.C. 2710: Wrongful disclosure of video tape rental or sale records](https://www.law.cornell.edu/uscode/text/18/2710), the Video Privacy Protection Act
- [California Attorney General: Privacy enforcement actions](https://oag.ca.gov/privacy/privacy-enforcement-actions), the Sling TV settlement of October 30, 2025

**Filings**

- [Roku, Inc.: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1428439/000162828026008114/roku-20251231.htm), access to a portion of partners' video ad inventory, 500+ FAST channels, Roku City and home screen units, Roku Ads Manager, program-level viewing data limits, streaming hours
- [Roku, Inc.: Fourth quarter 2025 shareholder letter (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1428439/000162828026007670/a04exhibit991-q425form8xker.htm), 2025 platform revenue, streaming households, DSP integrations including Amazon DSP
- [Netflix, Inc.: Second quarter 2026 shareholder letter (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1065280/000106528026000211/ex991_q226.htm), the projected rough doubling of ads revenue to about $3 billion, programmatic pause and live inventory

**In practice**

- [Amazon: Prime Video limited ads announcement](https://www.aboutamazon.com/news/entertainment/prime-video-update-announces-limited-ads), ads from early 2024 in the US, UK, Germany and Canada, fewer ads than linear TV
- [Amazon: Prime Video Ultra (March 13, 2026)](https://www.aboutamazon.com/news/entertainment/prime-video-ultra-ad-free-streaming-subscription), the ad-free tier and its price
- [AWS Elemental MediaTailor: What is MediaTailor?](https://docs.aws.amazon.com/mediatailor/latest/ug/what-is.html), channel assembly as a manifest-only service inserting breaks without SCTE-35 conditioning
- [Disney Advertising: AVOD year in review](https://www.disneyadvertising.com/insights/thought-leadership/avod-year-in-review/), Disney+ open to advertisers December 8, 2022
- [The Walt Disney Company: Upfront 2025 (May 14, 2025)](https://thewaltdisneycompany.com/news/upfront-2025/), 164 million global ad-supported monthly active users
- [Netflix: One year into Netflix ads (November 1, 2023)](http://about.netflix.com/en/news/one-year-into-netflix-ads), the November 2022 launch
- [Netflix: Third season of ads (November 5, 2025)](https://about.netflix.com/en/news/netflix-third-season-of-ads-and-a-look-ahead-at-whats-next), monthly active viewers defined, Ads Suite in 12 countries, programmatic partners
- [Netflix: Upfront 2026 (May 13, 2026)](http://about.netflix.com/en/news/netflix-upfront-2026-get-closer), more than 250 million monthly active viewers, programmatic pause and live ads
- [Walmart: Walmart completes acquisition of Vizio (December 3, 2024)](https://corporate.walmart.com/news/2024/12/03/walmart-completes-acquisition-of-vizio), Platform+ and its share of gross profit, active SmartCast accounts, pairing with Walmart Connect
