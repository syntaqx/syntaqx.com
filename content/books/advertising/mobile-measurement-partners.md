+++
title = "Mobile Measurement Partners"
nav_title = "Measurement Partners"
description = "What an MMP does: SDK and engagement capture, lookback windows, self-attributing networks, postbacks, AdAttributionKit verification and fraud rejection."
category = "Advertising Industry"
order = 2939
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "mobile", "attribution", "data-model"]
+++

A mobile measurement partner (MMP) is the neutral referee of app install advertising. An app advertiser buys installs from many networks at once (Apple Ads, Google, Meta, TikTok, AppLovin, Unity, dozens of smaller networks), and every network would happily claim every install. The MMP sits between them: its SDK in the app reports installs and in-app events; networks send it their clicks and impressions through tracking links; it decides, under one set of rules, which network (if any) gets credit; it tells each network what it won through postbacks, so their bidders can optimize; and it reports cost, installs, revenue and ROAS across all of them. AppsFlyer, Adjust, Branch, Kochava and Singular are the established MMPs.

It is hard because the MMP's two inputs, engagements and installs, rarely share an identifier any more. On iOS, the advertising identifier is available only when the user allowed tracking in both apps; Apple forbids fingerprinting; and the rest of iOS attribution arrives as Apple-signed, delayed, coarsened postbacks per campaign, not per user. On Android, the advertising ID can be deleted, and Google Play's Install Referrer carries the click's referrer instead. The largest networks don't accept tracking links at all: they are self-attributing, and the MMP has to ask them whether they claim an install. And the whole system pays out on attributed installs, which makes it a target: click injection, click flooding, SDK spoofing and device farms all exist to win attribution the network didn't earn.

This chapter covers the MMP's architecture (SDK, engagement capture, attribution engine, postbacks, cost and reporting), attribution methods and their windows, self-attributing networks, re-engagement and re-attribution, postbacks to networks, AdAttributionKit and SKAdNetwork postbacks from the measurement side (verification, deduplication, conversion value schemas, reporting what can't be per-user), fraud detection and rejected installs, and the records an MMP and an ad network keep, with an AdAttributionKit postback verifier in Go and Rust. It extends `conversions` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Apple's tracking rules and the postback protocol itself are Mobile Ad IDs, ATT & SKAdNetwork; the app studio's side (UA economics, CPI, ROAS and payback, conversion value schemas as a product decision) is Gaming's [User Acquisition and Attribution](/books/gaming/mobile-games#user-acquisition-and-attribution) and [CPI, ROAS and Payback](/books/gaming/mobile-games#cpi-roas-and-payback); how a platform attributes conversions it receives is [Attribution](/books/advertising/attribution); invalid traffic in general is Invalid Traffic & Ad Fraud; and in-app ad monetization and mediation is In-App Advertising & Mediation.

## How the Platforms Do It

As of November 2026, from each company's documentation (the table states only what the pages opened show):

| MMP | Attribution windows (defaults) | Fraud tooling | iOS aggregated measurement |
| --- | --- | --- | --- |
| **Adjust** | Device matching: clicks 1-30 days (default 7), impressions 1-24 hours (default 24); probabilistic modeling: 1-24 hours (default 6) for clicks and impressions; reattribution inactivity default 7 days | Fraud Prevention Suite "detects and rejects fraudulent engagements before attribution": anonymous IP filter, click injection filtering, distribution modeling; rejection reasons also include too many engagements and invalid signature | Not covered here |
| **AppsFlyer** | Click lookback 1-30 days or 1-23 hours (default 7 days); view-through lookback 1-24 hours (default 24) | Glossary defines click flooding (CTIT distribution), click injection and SDK spoofing | Not covered here |
| **Branch** | Windows from "0.001 of a day" up to 90 days; deep linking duration default about 120 minutes | Not covered here | Not covered here |
| **Kochava** | Not covered here | "Real-time detection and blocking of fraudulent installs and post-install events" with fraud dashboards by network and campaign | Lists "SKAN & AAK for iOS"; "aggregated measurement (SKAdNetwork/AdAttributionKit for iOS)" |
| **Singular** | Deterministic methods default 7 days, custom 1-30 days per app and partner network; probabilistic default 24 hours | A "Fraud Prevention Engine" evaluates "each touchpoint to determine if it is authentic or fraudulent" | Describes SKAdNetwork attribution; details not covered here |

Adjust's documentation calls the 7-day click window "considered the industry standard default window," and AppsFlyer's and Singular's defaults are the same, so seven days is common across vendors even though each network and advertiser may change it.

## The Architecture

An MMP has five parts, and the data model follows them:

- **The SDK** in the advertiser's app, which reports the first launch (the install), sessions and in-app events (registration, purchase with revenue), collects the identifiers the platform allows (on Android the advertising ID and the Install Referrer; on iOS the vendor identifier, and the advertising identifier only with tracking authorization), and updates AdAttributionKit or SKAdNetwork conversion values. Its traffic is signed, because an unsigned SDK protocol can be replayed or forged from anywhere.
- **Engagement capture.** Tracking links (click URLs) and impression URLs per network and campaign. When a user taps an ad on a link-based network, the click goes through the MMP (or is reported to it server to server) with the network, campaign and whatever identifiers are present, then redirects to the store.
- **The attribution engine,** which matches each install to the best eligible engagement under the advertiser's windows and the method hierarchy below, asks self-attributing networks for their claims, applies fraud rules, and writes one attribution per install (or reinstall, or re-engagement).
- **Postbacks,** server-to-server notifications to the winning network (and, by configuration, to others) of installs and in-app events, with the fields each network is allowed to receive.
- **Cost and reporting,** which joins attributions and in-app revenue with spend pulled from each network's API, for CPI, retention and ROAS by network and campaign.

## Attribution Methods and Windows

Install attribution uses the strongest evidence available, in order:

- **Referrer.** On Android, the Google Play Install Referrer API returns "The referrer URL of the installed package," the timestamps of the referrer click and of the install's start (client and server side), and the app version at first install. A tracking link that passes the MMP's click ID in the referrer ties the install to the click without any device identifier.
- **Device identifier matching.** The click carried the advertising ID (or the network has it), and the install reports the same one. On iOS, that works only where the user authorized tracking.
- **Self-attributing network claims.** The network matches the install to its own logged-in user's engagement and claims it (below).
- **Probabilistic modeling.** Matching on non-identifying signals within a short window. Adjust offers it with defaults of 6 hours; on iOS, Apple's developer agreement, quoted on its privacy page, says "you may not derive data from a device for the purpose of uniquely identifying it," listing "properties of a user's web browser and its configuration, the user's device and its configuration, the user's location, or the user's network connection," and apps whose SDKs do so, "including but not limited to Ad Networks, Attribution services, and Analytics," may be rejected. So probabilistic matching is an Android and web practice; on iOS, non-consented attribution is AdAttributionKit's.
- **Aggregated postbacks.** On iOS, AdAttributionKit or SKAdNetwork postbacks attribute installs to a network and campaign, not to a user.
- **Organic.** No eligible engagement.

Each method has its own windows, and the differences are part of the evidence: Adjust's defaults are 7 days for clicks and 24 hours for impressions under device matching, and 6 hours for probabilistic matches. Within a method, last click wins: among eligible clicks, the most recent; an impression wins only when no eligible click exists. Apple's windows are set by the framework, not the MMP: by default a person has 24 hours to install after a view-through impression and 30 days after a click-through one, and the advertised app can configure 1 to 7 days for views and 1 to 30 days for clicks (the app side is Gaming's [iOS: ATT and AdAttributionKit](/books/gaming/mobile-games#ios-att-and-adattributionkit)).

**Re-engagement and re-attribution.** A lapsed user who returns through a retargeting ad can be credited to that network: a reattribution if they reinstall after the inactivity period, a re-engagement if they reopen an installed app from an ad. Adjust's reattribution settings show the shape: an inactivity period (default 7 days for device matching, range 0-365) before a user counts as lapsed, and a reattribution window (clicks default 7 days, impressions 24 hours) within which the engagement must fall. AdAttributionKit added re-engagement in iOS 18, for click-through only: "The system doesn't create reengagement postbacks from view-through ads" (Gaming's chapter covers its limits). An attribution history is therefore a sequence per user: the install, then reattributions and re-engagements, each with its own network and window.

## Self-Attributing Networks

Several of the largest networks don't route clicks through the MMP's tracking links. The user's engagement happened inside a logged-in property the network controls, and the network won't share the engagement log. Instead the MMP reports the install (with the identifiers it has) to each such network, and the network replies whether it claims it, under its own windows. TikTok's documentation describes the mode directly: "After you transition to TikTok's Self-Attributing Network," its windows are click-through 1 or 7 days, engaged view-through 1 or 7 days and view-through off or 1 day, and the setting "doesn't impact your MMP reporting," which uses the MMP's rules.

So two decisions are made about the same install: the network's claim (what it reports in its own ads manager and optimizes on) and the MMP's attribution (which network the advertiser's reports credit). The MMP compares claims from several self-attributing networks with its own link-based engagements and picks one winner by its rules; a network that claimed and lost still reports the install as its conversion in its own interface. TikTok's advice to keep the two sets of windows consistent to "minimize the conversion reporting discrepancy" is the general one, and it is why every self-attributing network's window should be stored next to the MMP's.

## Postbacks to Networks

A postback is how the network learns what happened after its ad: install postbacks for attributed installs and event postbacks for in-app events (a purchase with revenue, a registration, a level reached). They are the training data for the network's bidder, which is why networks want them for every install and why advertisers configure them:

- **To whom.** The winning network always; by configuration, others (all installs to every network that had an engagement, so each can learn which users it reached). Sending losing networks data is a privacy decision as much as a commercial one.
- **What fields.** Network, campaign and ad identifiers from the engagement; event name, value and currency; timestamps; and identifiers only where consent and platform rules allow. Every field sent is a disclosure of personal data to a third party, the same as a conversion upload in Commerce's [Server-Side Conversions](/books/commerce/acquisition-and-attribution#server-side-conversions).
- **Which revenue.** In-app purchase revenue reported by the SDK is a client-side copy; Gaming's rule is that revenue comes "from your ledger, never from the SDK," with verified purchases sent server to server so refunds and fraud don't inflate ROAS ([Measurement Partners](/books/gaming/mobile-games#measurement-partners)). Postbacks should carry that verified revenue, and refunds as their own events.

On the network's side, a postback arrives as a conversion: in this book's model, a `conversions` row with `source = 'mmp'`, the MMP's event ID as `external_id`, and the attributed engagement as `attributed_event_id` when the MMP passed the network's click or impression ID back.

## AdAttributionKit and SKAdNetwork Postbacks

For iOS installs without tracking authorization, Apple's frameworks do the attribution on the device and send postbacks, signed by Apple, to the ad network. Mobile Ad IDs, ATT & SKAdNetwork covers the protocol; what the measurement side must do with a postback is concrete, from Apple's AdAttributionKit documentation:

- **Verify the signature before counting.** Postbacks are JSON Web Signatures. "You need to verify the postback signature to make sure that Apple signed it before you count the conversion." The JWS header's `kid` selects one of Apple's NIST P-256 public keys: `apple-cas-identifier/0` for production, and two development keys; "Ignore postbacks that don't pass signature validation in production flows."
- **Read the payload.** The signed payload carries `impression-type`, `ad-network-identifier`, `source-identifier` (two, three or four digits, depending on the crowd anonymity tier), `advertised-item-identifier`, `conversion-type` (`download`, `redownload` or `re-engagement`), `postback-identifier`, `did-win`, `postback-sequence-index` (0, 1 or 2) and the optional `marketplace-identifier` and `publisher-item-identifier`. The top-level postback also has the `conversion-value` (an unsigned 6-bit value) or `coarse-conversion-value` (`low`, `medium` or `high`), `ad-interaction-type` (`view` or `click`) and `country-code`, outside the signed JWS string as Apple lists them.
- **Deduplicate by postback identifier.** "If you receive more than one postback with the same `postback-identifier`, discard the duplicate report."
- **Answer quickly and correctly.** "Respond with an HTTP 200 OK status code. If the device receives a 500 status code, it attempts to send the postback up to nine times over a maximum of 9 days."
- **Separate winners from runners-up.** `did-win` false is a qualifying impression that didn't win; it counts as reach and assist data, never as an install.

What an MMP adds on top: collecting the postbacks networks forward, mapping each network's source identifiers to campaigns, managing the advertiser's **conversion value schema** (which in-app behaviors map to the 64 fine values, sent only in the first postback, and the three coarse values, a product decision Gaming's chapter covers), and **modeled reporting**: since postbacks are per campaign and delayed (Apple's random delay is "24 to 48 hours for the first postback, and 24 to 144 hours for the second and third postbacks"), dashboards combine postback counts with consented device-level data and model the rest. A modeled iOS ROAS is an estimate with a model version, like every modeled figure in [Attribution](/books/advertising/attribution#modeled-conversions).

## Fraud

Install attribution pays per install, so fraud targets attribution itself. The common schemes, with how MMPs describe detecting them:

- **Click injection.** An "Android-specific form of mobile ad fraud" where a malicious app on the device detects an install starting and fires a click "just before an app is fully installed." The Install Referrer timestamps expose it: Adjust's click injection filter makes "All clicks submitted after a user initiates a download" ineligible for attribution, and its strict mode rejects every engagement from a tracker once any is filtered.
- **Click flooding (click spamming).** Sending large volumes of fake clicks so one of them is the last click before an organic install. AppsFlyer's glossary points to the click-to-install time (CTIT) distribution: "about 75% of installs occur during the first hour following a click" and 94% within 24 hours, so a source whose CTIT is spread across days, with a low click-to-install rate, is flooding. Adjust's distribution modeling ("Clicks contributing to an atypical distribution are not considered for attribution") and its too-many-engagements check are the same idea.
- **SDK spoofing.** Fake installs and in-app events "on real devices," sent to the MMP as if from its SDK, typically from code in another app. The defense is signed SDK traffic: Adjust's rejection reasons include `incorrect_signature` ("Invalid Signature").
- **Anonymous and data-center traffic.** Installs from VPNs, Tor exit nodes and data centers; Adjust's filter checks "against a database of known data centers, VPNs or Tor exit nodes" and attributes matches under "Untrusted Devices."
- **Device farms and emulators,** detected from device and behavioral signals, which vendors don't publish in detail.

The records that matter are the rejections. Adjust's rejected install and reattribution callbacks carry a reason (`anonymous_traffic`, `distribution_outlier`, `too_many_engagements`, `engagement_injection`, `incorrect_signature`), and one install can produce both a rejected callback (for the fraudulent click) and a normal install callback (for a valid click). The rejected engagement doesn't win; the install may still be attributed to a legitimate engagement or be organic. Networks need the rejections too: a network paid on CPI that never hears about rejected installs can't clean its supply, and an advertiser that pays a network's invoice on the network's own count instead of the MMP's pays for the fraud. Kochava's "fraud dashboards show which networks and campaigns have high fraud rates," and the general practice is to reconcile CPI invoices to MMP-attributed, non-rejected installs.

## Consent, Privacy and Children

The MMP receives device identifiers, IP addresses and in-app behavior from the advertiser's users and shares some of it with networks, so it is at the center of the app's privacy obligations:

- **ATT.** On iOS, Apple's definition of tracking includes "advertising measurement purposes," with examples including a third-party SDK that combines user data across developers' apps "to target advertising or measure advertising efficiency"; device-level attribution across apps needs the user's permission; AdAttributionKit works without it.
- **Consent before the SDK runs.** In the EU and UK, the MMP SDK runs only within the consent the user gave, the playbook's [Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks) and [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection).
- **Opt-outs reach postbacks.** A user who opted out of sale or sharing under a US state law isn't the subject of a postback carrying identifiers to a network.
- **Children.** Child-directed apps can't use these identifiers for advertising measurement without the parental consent the amended COPPA Rule requires ([The 2025 Amendments](/docs/compliance/childrens-privacy#the-2025-amendments)); Children, Teens & Advertising covers ad-specific rules.
- **Retention.** Engagement logs (clicks with IP addresses and user agents) are needed only for the attribution windows and fraud analysis; keep them for that and truncate or drop identifiers after ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

## How to Build It

An MMP adds the apps it measures, the tracking links per network, the engagements it captured, the attribution it decided, the postbacks it sent, and the fraud rejections, and it extends the one table of Apple postbacks, `attribution_postbacks` from [Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att#how-to-build-it), with what the MMP adds. How the records map across books: Gaming's install attributions are the app's own copy of an `mmp_attributions` row; this book's `conversions` with `source = 'mmp'` are what a network receives from `network_postbacks`; and a network's own claim as a self-attributing network is a `san_claims` row here and an attribution in the network's own system ([Attribution](/books/advertising/attribution#how-to-build-it)).

```sql
CREATE TABLE mmp_apps (                  -- an advertiser's app measured by this MMP
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  mmp_org_id           UUID NOT NULL REFERENCES organizations (id),
  advertiser_id        UUID NOT NULL REFERENCES advertisers (id),
  property_id          UUID NOT NULL REFERENCES properties (id),  -- kind 'app'
  platform             TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'other')),
  store_item_id        TEXT NOT NULL,     -- the advertised-item-identifier or package name
  sdk_signing_required BOOLEAN NOT NULL DEFAULT TRUE,
  child_directed       BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (mmp_org_id, platform, store_item_id)
);

CREATE TABLE attribution_links (         -- a tracking link or impression URL for one network and campaign
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  mmp_app_id            UUID NOT NULL REFERENCES mmp_apps (id),
  network_org_id        UUID NOT NULL REFERENCES organizations (id),
  network_campaign_ref  TEXT NOT NULL,
  link_code             TEXT NOT NULL UNIQUE,
  click_window_s        INT NOT NULL DEFAULT 604800,   -- 7 days
  view_window_s         INT DEFAULT 86400,             -- 24 hours; null: no impression attribution
  probabilistic_window_s INT,                          -- null: off (always off on iOS)
  reattribution_inactivity_s INT NOT NULL DEFAULT 604800,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mmp_engagements (           -- clicks and impressions captured from link-based networks
  id                 UUID NOT NULL DEFAULT uuidv7(),
  occurred_at        TIMESTAMPTZ NOT NULL,
  attribution_link_id UUID NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('click', 'impression')),
  device_key         TEXT,                -- keyed hash of the advertising ID, when present and allowed
  click_id           TEXT,                -- passed through the store referrer
  ip_prefix          INET,                -- truncated
  ua_family          TEXT,
  PRIMARY KEY (occurred_at, id)
) PARTITION BY RANGE (occurred_at);     -- retained for the longest window plus fraud review

CREATE TABLE mmp_attributions (          -- the MMP's decision for one install or return
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  mmp_app_id         UUID NOT NULL REFERENCES mmp_apps (id),
  install_key        TEXT NOT NULL,       -- the SDK's install ID
  conversion_type    TEXT NOT NULL CHECK (conversion_type IN ('install', 'reinstall',
                       'reattribution', 're_engagement')),
  method             TEXT NOT NULL CHECK (method IN ('referrer', 'device_id', 'san_claim',
                       'probabilistic', 'store_postback', 'organic')),
  network_org_id     UUID REFERENCES organizations (id),  -- null: organic
  attribution_link_id UUID REFERENCES attribution_links (id),
  engagement_id      UUID,                -- the winning engagement; no FK across partitions
  engagement_kind    TEXT CHECK (engagement_kind IN ('click', 'impression')),
  click_to_install_s INT,
  installed_at       TIMESTAMPTZ NOT NULL,
  attributed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes_id      UUID REFERENCES mmp_attributions (id),  -- a later reattribution or correction
  rule_version       TEXT NOT NULL,       -- the windows and hierarchy in force
  CHECK ((method = 'organic') = (network_org_id IS NULL))
);

CREATE TABLE san_claims (                -- what each self-attributing network said about an install
  mmp_attribution_id UUID NOT NULL REFERENCES mmp_attributions (id),
  network_org_id     UUID NOT NULL REFERENCES organizations (id),
  claimed            BOOLEAN NOT NULL,
  touch              TEXT CHECK (touch IN ('click', 'engaged_view', 'view')),
  network_window     TEXT,                -- the network's setting, e.g. '7d_click_1d_view'
  responded_at       TIMESTAMPTZ NOT NULL,
  won                BOOLEAN NOT NULL,    -- whether the MMP's rules gave it the install
  PRIMARY KEY (mmp_attribution_id, network_org_id)
);

CREATE TABLE fraud_rejections (          -- an engagement or install the MMP refused to attribute
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  mmp_app_id         UUID NOT NULL REFERENCES mmp_apps (id),
  network_org_id     UUID REFERENCES organizations (id),
  engagement_id      UUID,
  install_key        TEXT NOT NULL,
  reason             TEXT NOT NULL CHECK (reason IN ('anonymous_traffic', 'engagement_injection',
                       'distribution_outlier', 'too_many_engagements', 'incorrect_signature',
                       'device_farm', 'other')),
  rule_version       TEXT NOT NULL,
  rejected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reported_to_network_at TIMESTAMPTZ      -- the rejected-install callback or report
);

-- Apple postbacks live in attribution_postbacks (Mobile Ad IDs, ATT & SKAdNetwork), one row per
-- postback_identifier; the MMP adds how each arrived, why verification failed, the attribution it
-- fed and who was sent a copy.
ALTER TABLE attribution_postbacks
  ADD COLUMN mmp_app_id UUID,              -- the measured app, when an MMP received it
  ADD COLUMN received_via TEXT,            -- first arrival: Apple's developer copy or a network's forward
  ADD COLUMN verification_error TEXT,      -- null when signature_valid: 'unknown_key',
                                           -- 'bad_signature', 'development_key', 'malformed'
  ADD COLUMN mmp_attribution_id UUID,      -- the store_postback attribution it produced
  ADD COLUMN forwarded_to_org_ids UUID[] NOT NULL DEFAULT '{}';  -- networks and the advertiser sent a copy
ALTER TABLE attribution_postbacks ADD CONSTRAINT attribution_postbacks_mmp_app_fk
  FOREIGN KEY (mmp_app_id) REFERENCES mmp_apps (id) NOT VALID;
ALTER TABLE attribution_postbacks ADD CONSTRAINT attribution_postbacks_mmp_attribution_fk
  FOREIGN KEY (mmp_attribution_id) REFERENCES mmp_attributions (id) NOT VALID;
ALTER TABLE attribution_postbacks ADD CONSTRAINT attribution_postbacks_received_via_check
  CHECK (received_via IN ('apple_direct', 'network_forward')) NOT VALID;
ALTER TABLE attribution_postbacks ADD CONSTRAINT attribution_postbacks_verification_check
  CHECK (signature_valid = (verification_error IS NULL)) NOT VALID;

CREATE TABLE network_postbacks (         -- every postback this MMP sent to a network
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  mmp_attribution_id UUID NOT NULL REFERENCES mmp_attributions (id),
  network_org_id     UUID NOT NULL REFERENCES organizations (id),
  event_name         TEXT NOT NULL,       -- 'install', 'purchase', 'refund', a custom event
  event_id           TEXT NOT NULL,       -- the network's dedup key, its conversions.external_id
  value_micros       BIGINT,
  currency           CHAR(3),
  revenue_verified   BOOLEAN NOT NULL DEFAULT FALSE,  -- from the advertiser's ledger, not the SDK
  fields_sent        TEXT[] NOT NULL,
  consent_basis      TEXT NOT NULL CHECK (consent_basis IN ('consented', 'not_required',
                       'aggregate_only')),
  sent_at            TIMESTAMPTZ,
  response_status    SMALLINT,
  UNIQUE (network_org_id, event_id)
);
```

The postback receiver verifies Apple's signature with the key its `kid` names, discards duplicates by `postback-identifier`, and answers 200 only after the row is stored, so a failure gets Apple's retries. The sketch verifies the compact JWS (ES256 signs `header.payload` with a raw 64-byte `r||s` signature):

```go tab="Go"
// AppleKeys maps a JWS kid to Apple's DER-encoded P-256 public key, base64,
// copied from Apple's "Verifying a postback" documentation.
var AppleKeys = map[string]string{
	"apple-cas-identifier/0": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...", // production; full value from Apple
}

type Payload struct {
	AdNetworkID     string `json:"ad-network-identifier"`
	SourceID        string `json:"source-identifier"`
	AdvertisedItem  int64  `json:"advertised-item-identifier"`
	ConversionType  string `json:"conversion-type"`
	PostbackID      string `json:"postback-identifier"`
	DidWin          bool   `json:"did-win"`
	SequenceIndex   int    `json:"postback-sequence-index"`
}

// VerifyPostback checks the JWS signature and returns the signed payload.
func VerifyPostback(jws string, production bool) (Payload, error) {
	parts := strings.Split(jws, ".")
	if len(parts) != 3 {
		return Payload{}, errors.New("not a compact JWS")
	}
	hdrJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return Payload{}, err
	}
	var hdr struct{ Alg, Kid string }
	if err := json.Unmarshal(hdrJSON, &hdr); err != nil || hdr.Alg != "ES256" {
		return Payload{}, errors.New("unsupported header")
	}
	if production && hdr.Kid != "apple-cas-identifier/0" {
		return Payload{}, errors.New("development key in production")
	}
	der, err := base64.StdEncoding.DecodeString(AppleKeys[hdr.Kid])
	if err != nil || len(der) == 0 {
		return Payload{}, errors.New("unknown key id")
	}
	pub, err := x509.ParsePKIXPublicKey(der)
	if err != nil {
		return Payload{}, err
	}
	key, ok := pub.(*ecdsa.PublicKey)
	if !ok {
		return Payload{}, errors.New("not an ECDSA key")
	}
	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || len(sig) != 64 {
		return Payload{}, errors.New("bad signature encoding")
	}
	digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	r, s := new(big.Int).SetBytes(sig[:32]), new(big.Int).SetBytes(sig[32:])
	if !ecdsa.Verify(key, digest[:], r, s) {
		return Payload{}, errors.New("signature does not verify") // never count it
	}
	body, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return Payload{}, err
	}
	var p Payload
	return p, json.Unmarshal(body, &p)
}
```

```rust tab="Rust"
use base64::{engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD}, Engine};
use p256::ecdsa::{signature::Verifier, Signature, VerifyingKey};
use p256::pkcs8::DecodePublicKey;
use serde::Deserialize;

/// Apple's DER-encoded P-256 public keys by JWS kid, base64, from Apple's
/// "Verifying a postback" documentation.
fn apple_key(kid: &str) -> Option<&'static str> {
    match kid {
        "apple-cas-identifier/0" => Some("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."), // full value from Apple
        _ => None,
    }
}

#[derive(Deserialize)]
struct Header { alg: String, kid: String }

#[derive(Deserialize)]
pub struct Payload {
    #[serde(rename = "ad-network-identifier")] pub ad_network_id: String,
    #[serde(rename = "source-identifier")] pub source_id: Option<String>,
    #[serde(rename = "advertised-item-identifier")] pub advertised_item: i64,
    #[serde(rename = "conversion-type")] pub conversion_type: String,
    #[serde(rename = "postback-identifier")] pub postback_id: String,
    #[serde(rename = "did-win")] pub did_win: bool,
    #[serde(rename = "postback-sequence-index")] pub sequence_index: u8,
}

/// Checks the JWS signature and returns the signed payload.
pub fn verify_postback(jws: &str, production: bool) -> anyhow::Result<Payload> {
    let parts: Vec<&str> = jws.split('.').collect();
    anyhow::ensure!(parts.len() == 3, "not a compact JWS");
    let header: Header = serde_json::from_slice(&URL_SAFE_NO_PAD.decode(parts[0])?)?;
    anyhow::ensure!(header.alg == "ES256", "unsupported algorithm");
    anyhow::ensure!(!production || header.kid == "apple-cas-identifier/0", "development key in production");
    let der = STANDARD.decode(apple_key(&header.kid).ok_or_else(|| anyhow::anyhow!("unknown key id"))?)?;
    let key = VerifyingKey::from_public_key_der(&der)?;
    let sig = Signature::from_slice(&URL_SAFE_NO_PAD.decode(parts[2])?)?; // raw r||s, 64 bytes
    let signing_input = format!("{}.{}", parts[0], parts[1]);
    key.verify(signing_input.as_bytes(), &sig)?; // never count a postback that fails here
    Ok(serde_json::from_slice(&URL_SAFE_NO_PAD.decode(parts[1])?)?)
}
```

After verification, the receiver inserts into `attribution_postbacks` with `ON CONFLICT (postback_identifier) DO NOTHING`, recording `signature_valid`, `verification_error` and `received_via`, and returns 200 whether the row was new or a duplicate; a database failure returns 500 so the device retries. The conversion values from the unsigned top-level fields are stored with `cv_schema_id`, the advertiser's conversion value schema in force, since they are only meaningful through that mapping.

Install counts by network for CPI reconciliation read the MMP's attributions, not the network's claims, and exclude rejected engagements:

```sql
-- Attributed installs, SAN claims and rejections by network and day: what a CPI invoice should match.
WITH current_attr AS (
  SELECT a.*, (a.installed_at AT TIME ZONE $3)::date AS day
  FROM mmp_attributions a
  WHERE a.mmp_app_id = $1
    AND a.installed_at >= $2::timestamptz AND a.installed_at < $2::timestamptz + interval '1 month'
    AND NOT EXISTS (SELECT 1 FROM mmp_attributions s WHERE s.supersedes_id = a.id)
), attributed AS (
  SELECT network_org_id, day,
         COUNT(*) FILTER (WHERE conversion_type = 'install') AS installs,
         COUNT(*) FILTER (WHERE conversion_type IN ('reattribution', 're_engagement')) AS returns
  FROM current_attr WHERE method <> 'organic'
  GROUP BY 1, 2
), claims AS (
  SELECT s.network_org_id, a.day, COUNT(*) AS network_claims
  FROM san_claims s JOIN current_attr a ON a.id = s.mmp_attribution_id
  WHERE s.claimed
  GROUP BY 1, 2
), rejected AS (
  SELECT network_org_id, (rejected_at AT TIME ZONE $3)::date AS day, COUNT(*) AS rejected
  FROM fraud_rejections
  WHERE mmp_app_id = $1
    AND rejected_at >= $2::timestamptz AND rejected_at < $2::timestamptz + interval '1 month'
  GROUP BY 1, 2
)
SELECT network_org_id, day,
       COALESCE(t.installs, 0) AS installs, COALESCE(t.returns, 0) AS returns,
       COALESCE(c.network_claims, 0) AS network_claims, COALESCE(r.rejected, 0) AS rejected
FROM attributed t
FULL JOIN claims c USING (network_org_id, day)
FULL JOIN rejected r USING (network_org_id, day)
ORDER BY day, network_org_id;
```

Design notes:

- **One attribution per return, superseded not edited.** A reattribution or a correction (a late SAN claim, a fraud rejection after the fact) writes a new `mmp_attributions` row with `supersedes_id`; the current answer is the row nothing supersedes, and history explains every past report.
- **Claims and decisions are separate.** `san_claims` records what each self-attributing network said and whether it won, so the discrepancy between a network's ads manager and the MMP's report is a query, not an argument.
- **Rejections are first-class.** `fraud_rejections` keeps the reason and rule version and when the network was told, because CPI invoices are reconciled against non-rejected attributions and networks need the feedback.
- **Verify, then dedupe, then acknowledge.** The unique `attribution_postbacks.postback_identifier` implements Apple's duplicate rule, so a network's forward of a postback already received from Apple is a no-op; a postback that fails verification is kept with `signature_valid` false and its `verification_error` but never counted, and the response code follows the storage result so Apple's nine retries cover outages.
- **Values need their schema.** `cv_schema_id` ties each postback's fine and coarse values to the mapping that gave them meaning; a schema change is a new version, never a reinterpretation of old postbacks.
- **No fingerprinting on iOS.** `probabilistic_window_s` is null for iOS apps by rule, enforced in the attribution engine, because Apple's agreement prohibits deriving data to uniquely identify a device.
- **Identifiers are keyed hashes with short retention.** `device_key` is a keyed hash, engagements are partitioned and dropped after the longest window plus the fraud review period, and `child_directed` apps never store device keys for advertising measurement.
- **Postbacks are disclosures.** `network_postbacks.fields_sent` and `consent_basis` answer "what did you share with whom," like Commerce's `conversion_uploads`.

## Auditing

- **Every attribution and its supersessions,** with method, rule version, winning engagement and the SAN claims considered.
- **Every fraud rejection** with its reason and rule version, and when the network was told.
- **Every store postback,** with its verification result and key ID, the conversion value schema in force, and who was sent a copy.
- **Every postback sent,** with fields, consent basis and the network's response, per user for privacy requests.
- **Window and rule configuration history** per app and link, since a changed window changes every network's install count.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Attribute with one rule set across every network,** in a fixed method order (referrer, device ID, SAN claims, probabilistic where allowed, store postbacks, organic), with last click within each.
- **Store self-attributing networks' claims beside the MMP's decision,** with each network's windows.
- **Verify every AdAttributionKit postback's signature** with the key its kid names, dedupe on the postback identifier, and acknowledge only after storing.
- **Never fingerprint on iOS;** aggregated postbacks are the non-consented path.
- **Reject fraudulent engagements before attribution,** record the reason, tell the network, and reconcile CPI invoices to non-rejected installs.
- **Send networks verified revenue** from the advertiser's ledger, and refunds as events.
- **Treat every postback as a disclosure** under the user's consent and opt-outs, and keep identifiers hashed and short-lived.

## References

**Platform documentation**

- [Apple Developer: Verifying a postback](https://developer.apple.com/tutorials/data/documentation/adattributionkit/verifying-a-postback.json), JWS postbacks, the production and development key IDs, verification steps, deduplication by postback identifier, did-win and the 200 response with nine retries over nine days
- [Apple Developer: Identifying the parameters in a postback](https://developer.apple.com/tutorials/data/documentation/adattributionkit/identifying-the-parameters-in-a-postback.json), the top-level, header and payload fields, conversion types, sequence index, source identifier digits and crowd anonymity-controlled fields
- [Apple Developer: Receiving ad attributions and postbacks](https://developer.apple.com/tutorials/data/documentation/adattributionkit/receiving-ad-attributions-and-postbacks.json), the 24-hour view-through and 30-day click-through install windows and click-only re-engagement
- [Apple Developer: Configuring attribution rules for your app](https://developer.apple.com/tutorials/data/documentation/adattributionkit/configuring-attribution-rules-for-your-app.json), configurable windows of 1 to 7 days for views and 1 to 30 days for clicks
- [Apple Developer: Receiving postbacks in multiple conversion windows](https://developer.apple.com/tutorials/data/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows.json), the postback delays and the fine value in the first postback only
- [Apple Developer: Measuring ad performance with AdAttributionKit](https://developer.apple.com/app-store/ad-attribution/), re-engagement for click-through attribution in iOS 18 and later
- [Apple Developer: User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/), tracking for advertising measurement, the prohibition on deriving data to uniquely identify a device and AdAttributionKit as the alternative
- [Android Developers: Google Play Install Referrer](https://developer.android.com/google/play/installreferrer), the referrer URL, click and install-begin timestamps and first-install version
- [TikTok Ads Help: About the attribution window](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager), self-attributing network windows and their independence from MMP reporting

**Vendor documentation**

- [Adjust: Attribution windows](https://help.adjust.com/en/article/attribution-windows), device matching, probabilistic and temporary attribution windows, reattribution and the industry standard default
- [Adjust: Enable fraud prevention features](https://help.adjust.com/en/article/fraud-prevention-features), anonymous IP, click injection with strict and normal modes, and distribution modeling
- [Adjust: Rejected install or reattribution callbacks](https://help.adjust.com/en/article/rejected-install-or-reattribution-callbacks), the Fraud Prevention Suite description, rejection reasons and the callback mechanism
- [AppsFlyer: About link structure and parameters](https://support.appsflyer.com/hc/en-us/articles/207447163-About-link-structure-and-parameters), click lookback values and the 7-day default, view-through lookback values and the 24-hour default
- [AppsFlyer: Click flooding](https://www.appsflyer.com/glossary/click-flooding/), CTIT distributions and the 75% and 94% figures
- [AppsFlyer: Click injection](https://www.appsflyer.com/glossary/click-injection/), the Android-specific scheme
- [AppsFlyer: SDK spoofing](https://www.appsflyer.com/glossary/sdk-spoofing/), fake installs and events on real devices and secure SDK communication
- [Branch: Attribution windows](https://help.branch.io/docs/attribution-windows), window ranges and the deep linking default
- [Kochava](https://www.kochava.com/), attribution, real-time fraud blocking, fraud dashboards and SKAN and AdAttributionKit measurement
- [Singular: Understanding Singular Mobile App Attribution](https://support.singular.net/hc/en-us/articles/115000526963-Understanding-Singular-Mobile-App-Attribution), deterministic and probabilistic default windows, the custom range and the Fraud Prevention Engine
