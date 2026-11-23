+++
title = "Mobile Ad IDs, ATT & SKAdNetwork"
nav_title = "Mobile IDs & ATT"
description = "IDFA and App Tracking Transparency, SKAdNetwork 4 and AdAttributionKit postbacks, the Android Advertising ID, CTV IFAs, and the ATT competition cases in Europe."
category = "Advertising Industry"
order = 2932
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "mobile", "identity", "attribution", "privacy"]
+++

Apps and TVs don't have third-party cookies; they have advertising identifiers that the operating system issues and the user controls. On iOS it is the IDFA, released to an app only after the user grants permission through App Tracking Transparency (ATT). On Android it is the Advertising ID, available by default and deletable by the user. On connected TVs each platform issues its own identifier for advertising (IFA), sent with a type so buyers know which namespace it is in. For users who don't grant permission on iOS, Apple provides aggregated, delayed, privacy-thresholded attribution instead of an identifier: SKAdNetwork, and its successor AdAttributionKit.

It is hard because the identifier and the measurement now come from different systems. An ad network on iOS can target with the IDFA only for users who allowed tracking in both the publishing app and the advertised app, and has to measure everyone else through postbacks that arrive one to six days late, carry six bits of conversion data at best, and say nothing about which user they describe. The rules that decide this are Apple's and Google's platform policies, which change with operating system releases, and in Europe competition authorities have fined Apple over how the ATT prompt works and, in Germany, obtained commitments to change it.

This chapter covers the IDFA and ATT (what counts as tracking, the prompt and its rules), SKAdNetwork 4 and AdAttributionKit in depth (impressions, windows, postback data tiers, source identifiers, conversion values, delays, verification and re-engagement), the Android Advertising ID, App Set ID and Install Referrer, the Android Privacy Sandbox phaseout, CTV identifiers, the European ATT cases, and the records an ad network or exchange keeps. It extends `ad_requests` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The studio's side (user acquisition economics, its conversion value schema as a product decision, the MMP in the game, rewarded ad grants) is the Gaming volume's [User Acquisition and Attribution](/books/gaming/mobile-games#user-acquisition-and-attribution) and [Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads); what ATT did to a store's ad measurement is Commerce's [Signals After ATT](/books/commerce/acquisition-and-attribution#signals-after-att). Mobile measurement partners are Mobile Measurement Partners; mediation and in-app bidding are In-App Advertising & Mediation; CTV supply is Connected TV & Streaming; browser identifiers are Identifiers After Cookies.

## How the Platforms Do It

As of November 2026, from Apple's and Google's developer documentation and the platforms' tag specifications.

| Platform | Advertising identifier | Permission | Aggregated attribution | Status notes |
| --- | --- | --- | --- | --- |
| **Amazon Fire TV, LG, Microsoft, Roku, Samsung Tizen, Vizio** (CTV) | Platform IFAs, typed in requests as `afai`, `lgudid`, `msai`, `rida`, `tifa`, `vida` | Each platform's own reset and limit settings | None from the platforms covered here | `sessionid` or a publisher ID when no IFA is available |
| **Android (Google Play)** | Advertising ID; all zeros after the user deletes it | On by default; `AD_ID` permission declared for apps targeting Android 13+ | Play Install Referrer for install-to-click matching | Privacy Sandbox on Android "scheduled for phaseout", no dates |
| **iOS, iPadOS (Apple)** | IDFA; all zeros unless the user authorized tracking | ATT prompt per app since iOS 14.5 | SKAdNetwork 4 (iOS 16.1) and AdAttributionKit (iOS 17.4), which need no ATT permission | AdAttributionKit adds alternative marketplaces and, from iOS 18, re-engagement |

Three patterns run through the table:

- **The identifier is a permission, not a property of the device.** On iOS it exists for an app only after consent; on Android and CTV it exists by default and can be zeroed or reset. A request without an identifier is normal, not malformed.
- **Aggregated attribution replaces user-level matching on iOS.** For most iOS installs the only attribution is a signed postback per campaign, days late, with a conversion value; a network's optimization runs on that.
- **Google retreated from its Android replacement.** The Android Privacy Sandbox's Attribution Reporting, Topics, Protected Audience and SDK Runtime were retired in October 2025 with the Chrome versions; Android attribution stays on the Advertising ID with consent and the Install Referrer.

## IDFA and App Tracking Transparency

**The rule.** Apple's iOS 14.5 release, announced April 26, 2021, required apps to get the user's permission before tracking them across other companies' apps and websites. The framework's purpose, in Apple's words, is to "request authorization to access app-related data that your app can use to track the person or the device." For the identifier itself: "On devices running iOS 14.5 and later ... your app must request tracking authorization before it can get the advertising identifier", and the IDFA is all zeros if the app hasn't asked, the user denied or tracking is restricted, and in the Simulator, on macOS and in visionOS compatibility apps.

**What counts as tracking.** Apple defines it: "Tracking refers to the act of linking user or device data collected from your app with user or device data collected from other companies' apps, websites, or offline properties for targeted advertising or advertising measurement purposes. Tracking also refers to sharing user or device data with data brokers." Its examples include targeted ads based on data from other companies' apps and sites, sharing location or email lists with a data broker, "sharing emails, advertising IDs, or other IDs with an ad network that uses them to retarget users in other developers' apps or find similar users", and placing a third-party SDK that combines the app's data with other developers' data for targeting or measurement "even if you don't use the SDK for those purposes." Not tracking: linking done solely on the device and not sent off it in an identifying way, sharing with a data broker solely for fraud detection or security, and sharing with a consumer reporting agency for credit purposes.

The definition reaches far past the IDFA. A hashed email sent to an ad network for retargeting or lookalikes is tracking; so is an SDK that does it on the app's behalf. First-Party Data & Audiences' customer list uploads from an iOS app's users fall under it when the app is the source.

**The prompt and its limits.** The app calls `requestTrackingAuthorization`, which "presents a modal UI that asks someone for permission", with the purpose string from `NSUserTrackingUsageDescription`, and reads the result from `trackingAuthorizationStatus`. Apple's App Review rules forbid gating: an app may not "gate functionality on agreeing to allow tracking, or incentivize users to agree" (guideline 5.1.2(i)), and must "not attempt to manipulate, trick, or force people to consent to unnecessary data access" (5.1.1(iv)), though explaining the request is allowed.

**No fingerprinting instead.** "Per the Apple Developer Program License Agreement, you may not derive data from a device for the purpose of uniquely identifying it", including from properties of the browser, device, location or network connection, and apps that do so, or reference SDKs that do, "may be rejected from the App Store." An ad SDK that builds a device ID from signals when the IDFA is zeros is the thing Apple prohibits.

**In the bid request.** OpenRTB 2.6 carries the identifier in `device.ifa`, an "ID sanctioned for advertiser use in the clear (i.e., not hashed)" and expected to come from the operating system's advertising API, and `device.lmt`, the "Limit Ad Tracking" signal, where 1 means tracking "must be limited per commercial guidelines". On iOS 14.5 and later, a missing or zeroed IDFA is the normal case for users who did not authorize. The ATT status itself is not among the core 2.6 Device fields; where an SDK or exchange passes it in an extension, buyers should read it rather than infer it from `lmt`.

## SKAdNetwork and AdAttributionKit

SKAdNetwork was Apple's privacy-preserving install attribution, introduced before ATT; SKAdNetwork 4, from iOS 16.1, lets devices "send up to three postbacks for the winning ad attribution, in three conversion windows". AdAttributionKit, introduced in iOS and iPadOS 17.4, is its successor: it delivers "postbacks for in-app ads in the App Store and alternative app marketplaces", and uses postback data tiers for crowd anonymity. "Apps don't need to use App Tracking Transparency before calling ad attribution APIs." The mechanics below are AdAttributionKit's; SKAdNetwork 4's are the same in shape.

**Three participants.** The ad network signs the ad impression; the publisher app displays it (a StoreKit-rendered or custom-rendered ad); the advertised app, once installed, updates conversion values. The device, not any server, decides attribution and sends the postbacks.

**Impressions and windows.** A view-through impression gives the person 24 hours to install (and expires from the pending pool after 24 hours); a click-through impression gives 30 days. AdAttributionKit keeps at most 15 view-through impressions per publisher app. After an install, the device has 60 days to send the first conversion value update; after a re-engagement, 2 days.

**Winners and runners-up.** When several impressions qualify, the device picks one winner; installs "always produce a winning postback if a qualifying impression exists," subject to the crowd anonymity tier. Up to five other ad networks each receive one non-winning postback, ranked by recency and click over view, and a network that wins gets no non-winning one. Re-engagement produces no non-winning postbacks. The advertised app's developer can opt in to receive an exact copy of the winning postback by declaring a server endpoint in its property list.

**Conversion windows and values.** There are three windows after first launch: days 0 to 2, 3 to 7 and 8 to 35. The advertised app updates a conversion value in each window it wants a postback for. The fine-grained `conversion-value` is an unsigned 6-bit value, 0 to 63, available only in the first postback and only in higher tiers; the `coarse-conversion-value` is `low`, `medium` or `high`, sent instead in lower tiers and in the second and third postbacks. By default the system waits until a window ends to finalize the value; calling the update with `lockPostback` prepares the postback immediately and ignores further updates in that window.

**Postback data tiers.** Apple assigns each download a tier from the crowd size of the publishing app or domain, the advertised app, the install country and the source identifier. The tier decides what each postback contains:

| Postback | Tier 3 | Tier 2 | Tier 1 | Tier 0 |
| --- | --- | --- | --- | --- |
| First | Source identifier (2 to 4 digits), fine conversion value, publisher item ID, optional country code | Source identifier (2 to 4 digits), fine conversion value | Source identifier (2 digits), coarse value | Source identifier (2 digits) only |
| Second and third | Source identifier (2 digits), coarse value | Same as Tier 3 | Source identifier (2 digits), coarse value | None sent |

The system evaluates the 2-, 3- and 4-digit source identifiers, picks the highest tier and breaks ties toward more digits; at Tier 1 or 0 it always uses 2 digits.

**Source identifiers.** The ad network encodes its campaign in a hierarchical source identifier of up to four digits. Because the postback may carry only the last two, three or four digits depending on the tier, the network designs the digits so the rightmost two identify the most important dimension (the campaign), the third adds the next (a placement or creative group, say), and the fourth the finest (a bid strategy or geography). A network that puts the campaign in the leading digit loses it whenever privacy trims the identifier.

**Delays.** The first postback is sent 24 to 48 hours after its window ends or is locked, the second and third 24 to 144 hours after. Developer Mode shortens this to 5 to 10 minutes for testing.

**What a postback carries.** Delivered to the network's (and optionally the developer's) server as a `jws-string` with top-level `conversion-value`, `coarse-conversion-value`, `ad-interaction-type` (`view` or `click`) and `country-code`, and a signed payload with `postback-identifier`, `advertised-item-identifier`, optional `publisher-item-identifier` and `marketplace-identifier`, `impression-type`, `ad-network-identifier`, `source-identifier`, `postback-sequence-index` (0, 1 or 2), `did-win` and `conversion-type` (`download`, `redownload` or `re-engagement`).

**Verification and deduplication.** The receiver verifies the JWS signature with Apple's published P-256 public key selected by the header's `kid` (a production key and two development keys; "For production flows, always use the production key"), and "If the signature fails your verification, consider the postback message invalid." It deduplicates on `postback-identifier` ("If you receive more than one postback with the same `postback-identifier`, discard the duplicate report"), checks `did-win`, and returns 200; on a 500, the device retries "up to nine times over a maximum of 9 days."

**Re-engagement (iOS 18).** When someone who already has the app taps a custom-rendered ad or the Open button on a StoreKit-rendered ad, AdAttributionKit can attribute a re-engagement, labeled `re-engagement`; view-through impressions don't create re-engagement postbacks, and postbacks are limited per app per month and per device per year, so not every re-engagement produces one.

Decoding a source identifier against the network's allocation, digit by digit from the right:

```go tab="Go"
// Allocation maps the digits a network assigned to the dimensions they encode.
type Allocation struct {
	Campaigns map[string]string // last two digits -> campaign ID
	Third     map[string]string // third digit from the right -> e.g. placement group
	Fourth    map[string]string // fourth digit from the right -> e.g. geography
}

type Decoded struct {
	CampaignID, Third, Fourth string // empty when the tier trimmed that digit
	Digits                    int
}

// DecodeSourceID reads a 2-, 3- or 4-digit source identifier.
func DecodeSourceID(src string, a Allocation) (Decoded, error) {
	n := len(src)
	if n < 2 || n > 4 || strings.Trim(src, "0123456789") != "" {
		return Decoded{}, fmt.Errorf("invalid source identifier %q", src)
	}
	d := Decoded{Digits: n, CampaignID: a.Campaigns[src[n-2:]]}
	if d.CampaignID == "" {
		return Decoded{}, fmt.Errorf("unallocated campaign digits %q", src[n-2:])
	}
	if n >= 3 {
		d.Third = a.Third[src[n-3:n-2]]
	}
	if n == 4 {
		d.Fourth = a.Fourth[src[:1]]
	}
	return d, nil
}
```

```rust tab="Rust"
use std::collections::HashMap;

/// The digits a network assigned to the dimensions they encode.
pub struct Allocation {
    pub campaigns: HashMap<String, String>, // last two digits -> campaign ID
    pub third: HashMap<char, String>,       // third digit from the right
    pub fourth: HashMap<char, String>,      // fourth digit from the right
}

#[derive(Debug, Default)]
pub struct Decoded {
    pub campaign_id: String,
    pub third: Option<String>,  // None when the tier trimmed that digit
    pub fourth: Option<String>,
    pub digits: usize,
}

/// Reads a 2-, 3- or 4-digit source identifier.
pub fn decode_source_id(src: &str, a: &Allocation) -> Result<Decoded, String> {
    let n = src.len();
    if !(2..=4).contains(&n) || !src.chars().all(|c| c.is_ascii_digit()) {
        return Err(format!("invalid source identifier {src:?}"));
    }
    let campaign_id = a
        .campaigns
        .get(&src[n - 2..])
        .cloned()
        .ok_or_else(|| format!("unallocated campaign digits {:?}", &src[n - 2..]))?;
    let chars: Vec<char> = src.chars().collect();
    Ok(Decoded {
        campaign_id,
        third: if n >= 3 { a.third.get(&chars[n - 3]).cloned() } else { None },
        fourth: if n == 4 { a.fourth.get(&chars[0]).cloned() } else { None },
        digits: n,
    })
}
```

The consequences for an ad network's systems:

- **Optimization runs on campaigns, not users.** Postbacks have no device or user; bidding models for iOS learn from campaign-level conversion values and coarse values, days late, which is why networks and MMPs model iOS revenue rather than observe it (Mobile Measurement Partners covers modeled outcomes).
- **The conversion value schema is shared configuration.** What each of the 64 fine values and three coarse values means is the advertiser's decision (Gaming covers it as a product decision); the network and the MMP need the same versioned schema to decode a postback, and a schema change breaks comparability across the change.
- **Tiers reward scale.** Small campaigns and small publisher apps fall into low tiers and lose fine values and digits, so campaign structure on iOS is coarser than on Android by design.
- **Postbacks are signed evidence.** Verified, deduplicated postbacks are what an advertiser and a network can both trust; an unverified one is not counted.

## Android: Advertising ID, App Set ID and Install Referrer

On Google Play devices, apps must "use the advertising ID (when available on a device) in place of any other device identifiers" for advertising. Users can reset or delete it under Settings, Privacy, Ads; after deletion, "Any attempts to access the identifier will receive a string of zeros instead of the identifier." Apps targeting Android 13 or later must declare the `com.google.android.gms.permission.AD_ID` permission to read it. For essential non-advertising uses such as analytics and fraud prevention, Google recommends the App Set ID, which is scoped to one developer's apps.

The Play Install Referrer API gives the installed app the referrer URL of its install and the client and server timestamps of the referrer click and install start, plus the first-install app version and whether an instant experience was launched in the past 7 days, available from Play Store version 8.3.73. It ties an install to the click that led to it without a device identifier, and it is what Android attribution falls back to for users who deleted the Advertising ID.

The Android Privacy Sandbox (Attribution Reporting, Topics, Protected Audience, the SDK Runtime, Protected App Signals and On-Device Personalization) was retired with Google's October 17, 2025 announcement "in light of their low levels of adoption", and Google's status page lists the Android APIs as "scheduled for phaseout" without dates as of November 2026. Nothing should be built on them.

Consent applies on Android regardless of the operating system's default. In the EU and UK, reading the Advertising ID is access to information on the terminal that needs consent under the ePrivacy rules (GDPR & ePrivacy for Ads), and US state laws treat sharing it for targeted advertising as a sale or share subject to opt-out; Google's EEA Customer Match rules treat a mobile device ID list like any other personal data upload (First-Party Data & Audiences). The identifier being available is not permission to use it ([Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks)).

## CTV Identifiers

Connected TV platforms issue their own identifiers for advertising, and a CTV ad request carries the identifier with a type. Microsoft's Monetize tag documentation lists the common `ifa_type` values: `aaid` (Android), `idfa` (Apple TV), `afai` (Amazon Fire), `msai` (Microsoft), `rida` (Roku), `ppid`, `tifa` (Samsung Tizen), `vida` (Vizio) and `lgudid` (LG), with `openudid` for authenticated persistent IDs and `sessionid` when no persistent ID is available. Two facts follow: an IFA is meaningful only with its type, since the same string format (a UUID) is used by every platform; and SSAI servers and apps, not the TV, often fill these fields, which makes a CTV IFA easier to spoof than a phone's (Connected TV & Streaming and Invalid Traffic & Ad Fraud cover CTV fraud).

## The ATT Competition Cases

European competition authorities have not challenged ATT's goal; they have challenged how it was implemented alongside the consent prompts publishers already show.

- **France.** The Autorité de la concurrence fined Apple EUR 150,000,000 in Decision 25-D-02 on March 31, 2025, for abuse of a dominant position in iOS app distribution between April 26, 2021 and July 25, 2023. It did not challenge ATT's objective; the problems were the double consent ("the user must always confirm their consent a second time"), asymmetry between Apple's own apps and third parties, and harm to small publishers.
- **Italy.** The AGCM (case A561) fined Apple Inc., Apple Distribution International and Apple Italia EUR 98,635,416.67 on December 22, 2025, finding that the ATT prompt does not satisfy privacy law requirements, so developers must ask twice, where a single consent would have sufficed.
- **Germany.** The Bundeskartellamt opened its review in June 2022, sent a preliminary assessment in February 2025, and concluded in August 2026 by accepting commitments: neutral prompt wording and layout, aligning prompts for Apple's own apps and third parties, allowing publishers to combine the ATT request with their data protection consent, four months to implement, binding for seven years, with a monitoring trustee. Its president said "It is expressly not our aim to help achieve the highest possible levels of consent to personalised advertising."

For engineering, the German commitments are the ones that change a system: if a publisher can combine ATT with its own consent request in Germany, the consent record must hold both decisions and which combined prompt produced them. Reports of a Polish investigation were not confirmed from a primary source for this chapter. <!-- source-gap: adv-poland-att-investigation | secondary | UOKiK investigation of Apple's ATT, opened late 2025 | closes with: a UOKiK press release or decision page | checked: 2026-11-22 -->

## How to Build It

The core model's `ad_requests` has device type and the privacy signals; `conversions` has `source = 'mmp'` and a single attribution claim. This chapter adds the device identifier facts on the request, the ad network's source identifier allocations and conversion value schemas, and Apple's postbacks as their own records, with aggregate conversions derived from them.

```sql
ALTER TABLE ad_requests
  ADD COLUMN ifa_type TEXT,              -- 'idfa', 'aaid', 'rida', 'tifa', 'vida', 'afai', 'msai',
                                         -- 'lgudid', 'ppid', 'openudid', 'sessionid'
  ADD COLUMN ifa_present BOOLEAN,        -- false when zeros or absent; the value is not logged here
  ADD COLUMN lmt BOOLEAN,                -- OpenRTB device.lmt
  ADD COLUMN att_status TEXT;            -- as the SDK or exchange extension reported it
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_att_status_check
  CHECK (att_status IN ('not_determined', 'restricted', 'denied', 'authorized'))
  NOT VALID;

CREATE TABLE source_id_allocations (     -- what each source identifier digit means, per network
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_network_org_id  UUID NOT NULL REFERENCES organizations (id),
  advertised_item_id BIGINT NOT NULL,    -- the App Store item ID of the advertised app
  digits             TEXT NOT NULL CHECK (digits ~ '^[0-9]{2,4}$'),
  campaign_id        UUID NOT NULL REFERENCES campaigns (id),   -- from the last two digits
  line_item_id       UUID REFERENCES line_items (id),           -- when 3 or 4 digits resolve one
  dimension_values   JSONB NOT NULL DEFAULT '{}',  -- e.g. {"third":"placement_group_a","fourth":"US"}
  valid              TSTZRANGE NOT NULL,           -- digits are reused only after windows close
  EXCLUDE USING gist (ad_network_org_id WITH =, advertised_item_id WITH =,
    digits WITH =, valid WITH &&)        -- needs btree_gist
);

CREATE TABLE conversion_value_schemas (  -- what the 64 fine and 3 coarse values mean
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id      UUID NOT NULL REFERENCES advertisers (id),
  advertised_item_id BIGINT NOT NULL,
  version            INT NOT NULL,
  fine_values        JSONB NOT NULL,     -- 0-63 -> meaning, e.g. revenue band and event bits
  coarse_values      JSONB NOT NULL,     -- low, medium, high -> meaning, per window
  lock_rules         JSONB NOT NULL DEFAULT '{}',  -- when the app locks each window
  effective          TSTZRANGE NOT NULL,
  UNIQUE (advertised_item_id, version)
);

CREATE TABLE attribution_postbacks (     -- Apple postbacks as received; one row per postback
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  framework                TEXT NOT NULL CHECK (framework IN ('adattributionkit', 'skadnetwork')),
  postback_identifier      TEXT NOT NULL UNIQUE,   -- dedup key per Apple's guidance
  ad_network_org_id        UUID NOT NULL REFERENCES organizations (id),
  advertised_item_id       BIGINT NOT NULL,
  publisher_item_id        BIGINT,                 -- higher tiers only
  marketplace_identifier   TEXT,                   -- alternative marketplace bundle ID
  source_identifier        TEXT NOT NULL CHECK (source_identifier ~ '^[0-9]{2,4}$'),
  allocation_id            UUID REFERENCES source_id_allocations (id),
  interaction_type         TEXT NOT NULL CHECK (interaction_type IN ('view', 'click')),
  conversion_type          TEXT NOT NULL CHECK (conversion_type IN ('download', 'redownload',
                             're-engagement')),
  sequence_index           SMALLINT NOT NULL CHECK (sequence_index IN (0, 1, 2)),
  did_win                  BOOLEAN NOT NULL,
  fine_value               SMALLINT CHECK (fine_value BETWEEN 0 AND 63),
  coarse_value             TEXT CHECK (coarse_value IN ('low', 'medium', 'high')),
  country_code             CHAR(2),
  cv_schema_id             UUID REFERENCES conversion_value_schemas (id),
  signature_key_id         TEXT NOT NULL,          -- the JWS kid
  signature_valid          BOOLEAN NOT NULL,
  jws                      TEXT NOT NULL,          -- the signed payload as received, for audit
  received_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fine_value IS NULL OR sequence_index = 0),  -- fine values only in the first postback
  CHECK (fine_value IS NULL OR coarse_value IS NULL)
);
CREATE INDEX CONCURRENTLY attribution_postbacks_campaign_idx
  ON attribution_postbacks (ad_network_org_id, advertised_item_id, received_at)
  WHERE signature_valid AND did_win;

-- Aggregate conversions derived from postbacks are labeled as such in the core table.
ALTER TABLE conversions
  ADD COLUMN aggregate_count INT,        -- null: one row-level conversion; n: n postbacks rolled up
  ADD COLUMN postback_window SMALLINT;   -- 1, 2 or 3, for postback-derived rows
ALTER TABLE conversions ADD CONSTRAINT conversions_aggregate_check
  CHECK (aggregate_count IS NULL OR aggregate_count > 0) NOT VALID;
```

Winning installs per campaign and day from verified first postbacks:

```sql
SELECT a.campaign_id,
       date_trunc('day', p.received_at)               AS day,
       count(*)                                       AS winning_first_postbacks,
       count(*) FILTER (WHERE p.fine_value IS NOT NULL) AS with_fine_value,
       count(*) FILTER (WHERE length(p.source_identifier) = 2) AS two_digit_only
FROM attribution_postbacks p
JOIN source_id_allocations a ON a.id = p.allocation_id
WHERE p.signature_valid AND p.did_win AND p.sequence_index = 0
  AND p.conversion_type IN ('download', 'redownload')
GROUP BY 1, 2
ORDER BY 1, 2;
```

Design notes:

- **Log whether an identifier was present, not the identifier.** `ifa_present`, `ifa_type`, `lmt` and `att_status` explain targeting and match rates; the IFA itself, where the system may hold it, follows Identifiers After Cookies' rule of keyed HMACs in logs.
- **Allocations are dated.** Source identifier digits are reused across campaigns over time; the exclusion constraint keeps one meaning per digit string per app at any moment, and a postback is matched to the allocation valid when its impression could have been signed. Keep an allocation alive until its last window's postbacks can still arrive (35 days plus delays).
- **Postbacks are evidence, kept whole.** The JWS as received, the key ID and the verification result are stored, invalid ones included with `signature_valid = false`, and `postback_identifier` is unique so Apple's retries and duplicates are no-ops ([Idempotency](/docs/requests/idempotency)).
- **The schema version travels with the value.** `cv_schema_id` records which meaning a fine or coarse value had; reports never mix versions without saying so.
- **Aggregate is a kind of conversion.** Rolled-up postbacks become `conversions` rows with `source = 'mmp'` or a network source, an `aggregate_count` and a window, never one row per imaginary user, and attribution reporting treats them as counts, the same rule Data Clean Rooms applies to clean room outputs.
- **Records map across volumes.** Gaming's `install_attributions` with `source` of `skadnetwork` or `adattributionkit` is the app's copy of these postbacks as forwarded by its MMP ([Mobile Games](/books/gaming/mobile-games#how-to-build-it)); the network's `attribution_postbacks` row and the studio's attribution row share the `postback_identifier` as their join.
- **Consent records hold both decisions.** Where a publisher may combine ATT with its own consent request (the German commitments), the consent record stores the ATT outcome and the data protection consent separately, with the prompt version that produced them.

## Auditing

- **Every postback with its signature.** The signed payload, key ID, verification result, duplicate handling and the allocation and schema it was decoded with, so an advertiser's dispute about installs can be settled from Apple-signed records.
- **Source identifier allocations over time.** Which digits meant which campaign and dimensions, and when, so old postbacks decode the same way next year.
- **Conversion value schema versions.** Each version's meanings and when it took effect.
- **Identifier and permission state on requests.** IFA type and presence, `lmt` and ATT status, so targeting on iOS can be shown to have used the IDFA only for authorized users.
- **Consent prompt versions.** For apps showing ATT and data protection consent, which prompts were shown and what each user decided.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat a missing identifier as the normal case.** On iOS most users are unauthorized; on Android and CTV the ID can be zeroed or reset. Design targeting and frequency for requests without one.
- **Read "tracking" the way Apple defines it.** Hashed emails to an ad network for retargeting and SDKs that combine data across developers are tracking; they need ATT authorization on iOS whatever the identifier.
- **Never fingerprint to replace the IDFA.** Apple's license agreement forbids it and App Review enforces it.
- **Build attribution on postbacks for iOS.** Verify the JWS, deduplicate on `postback_identifier`, decode source identifiers right to left against dated allocations, and keep the schema version with every value.
- **Design source identifiers for trimming.** The campaign in the last two digits, finer dimensions to the left, because tiers cut from the left.
- **Use the Install Referrer and the Advertising ID with consent on Android, and nothing from the Privacy Sandbox.** Its Android APIs are being phased out.
- **Type every CTV identifier.** An IFA without its `ifa_type` is not usable, and server-filled IFAs need fraud checks.
- **Keep both consent decisions where they are combined.** The German ATT commitments let publishers combine prompts; the record must still show each decision.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), device.ifa in the clear from the operating system's advertising API and device.lmt

**Regulation**

- [Autorité de la concurrence: EUR 150,000,000 fine on Apple (March 31, 2025)](https://www.autoritedelaconcurrence.fr/en/press-release/targeted-advertising-autorite-de-la-concurrence-imposes-fine-eu150000000-apple), Decision 25-D-02, the conduct period and the double consent and asymmetry findings
- [AGCM: Case A561, Apple ATT (December 22, 2025)](https://en.agcm.it/en/media/press-releases/2025/12/A561), the EUR 98,635,416.67 fine and the double consent finding
- [Bundeskartellamt: Apple proceeding](https://bundeskartellamt.de/EN/Digital_economy/proceedings_against_large_digital_companies/Apple/Apple.html), the 2022 opening, February 2025 preliminary assessment and August 2026 conclusion
- [Bundeskartellamt: Apple's ATT commitments (August 17, 2026)](https://www.bundeskartellamt.de/SharedDocs/Meldung/EN/Pressemitteilungen/2026/08_17_2026_Apple_ATTF.html), neutral prompts, combined consent, timing, seven-year term, trustee and the president's statement

**Reference**

- [Apple Newsroom: iOS 14.5 (April 26, 2021)](https://www.apple.com/newsroom/2021/04/ios-14-5-offers-unlock-iphone-with-apple-watch-diverse-siri-voices-and-more/), App Tracking Transparency's permission requirement
- [Apple Developer: App Tracking Transparency](https://developer.apple.com/tutorials/data/documentation/apptrackingtransparency.json), the framework's purpose
- [Apple Developer: ATTrackingManager](https://developer.apple.com/tutorials/data/documentation/apptrackingtransparency/attrackingmanager.json), requestTrackingAuthorization, trackingAuthorizationStatus and NSUserTrackingUsageDescription
- [Apple Developer: advertisingIdentifier](https://developer.apple.com/tutorials/data/documentation/adsupport/asidentifiermanager/advertisingidentifier.json), authorization before the IDFA and the all-zeros cases
- [Apple Developer: User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/), the definition and examples of tracking, exceptions, no gating or incentives, and the fingerprinting prohibition
- [Apple Developer: Receiving ad attributions and postbacks (SKAdNetwork)](https://developer.apple.com/tutorials/data/documentation/storekit/receiving-ad-attributions-and-postbacks.json), SKAdNetwork 4's three postbacks from iOS 16.1
- [Apple Developer: AdAttributionKit](https://developer.apple.com/tutorials/data/documentation/adattributionkit.json), iOS 17.4, alternative marketplaces, crowd anonymity tiers and no ATT requirement
- [Apple Developer: AdAttributionKit, receiving ad attributions and postbacks](https://developer.apple.com/tutorials/data/documentation/adattributionkit/receiving-ad-attributions-and-postbacks.json), view and click windows, conversion update windows, winning and non-winning postbacks, developer copies, re-engagement and the 15-impression limit
- [Apple Developer: Receiving postbacks in multiple conversion windows](https://developer.apple.com/tutorials/data/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows.json), the three windows, tier contents, tier selection, random delays and locking
- [Apple Developer: Identifying the parameters in a postback](https://developer.apple.com/tutorials/data/documentation/adattributionkit/identifying-the-parameters-in-a-postback.json), every postback field and the tier-dependent source identifier digits
- [Apple Developer: Verifying a postback](https://developer.apple.com/tutorials/data/documentation/adattributionkit/verifying-a-postback.json), Apple's public keys by kid, signature verification, deduplication and retries
- [Google Play Console Help: Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248), the policy, zeros after deletion, the AD_ID permission and App Set ID
- [Android Developers: Play Install Referrer](https://developer.android.com/google/play/installreferrer), the referrer URL, timestamps and Play Store version
- [Google Privacy Sandbox: Update on plans for Privacy Sandbox technologies (October 17, 2025)](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), the Android APIs retired
- [Google Privacy Sandbox: Feature status](https://privacysandbox.google.com/overview/status), Android APIs scheduled for phaseout
- [Microsoft Learn: Required tag parameters for CTV inventory](https://learn.microsoft.com/en-us/xandr/monetize/required-parameters-for-ctv-inventory), ifa and ifa_type values for CTV platforms, openudid and sessionid
