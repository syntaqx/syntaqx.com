+++
title = "Consent Management & the TCF"
nav_title = "Consent & the TCF"
description = "CMPs and the TCF: purposes, the TC string, v2.2 to v2.4, CJEU C-604/22, Google certified CMPs and consent mode, and one consent model for ad systems."
category = "Advertising Industry"
order = 2955
part = "Privacy and Law"
tags = ["advertising", "privacy", "consent", "tcf", "gdpr", "data-model"]
+++

A consent management platform (CMP) is the banner, the settings screen and the small library behind them that ask a visitor in Europe whether a site and its advertising partners may store things on their device and use their data, record the answer, and hand it to every ad tag on the page. In the open web, the answer travels as a **TC string**: a compact, base64url-encoded record defined by IAB Europe's Transparency and Consent Framework (TCF), which says which of eleven standard purposes the user agreed to, which of some hundreds of registered vendors they agreed to, and which vendors were even shown to them. The publisher's ad server reads it, an SSP copies it into every bid request, each DSP reads it again, and a verification vendor's pixel reads it once more. One string, decoded by dozens of companies, decides whether an impression is personalized, generic, or served with no identifiers at all.

It is hard because the string is only an input. Every party that receives it has to decode it correctly, compare it with what that party itself declared to the framework, apply the publisher's own restrictions, and decide what it may do, in milliseconds, for every request. The framework has changed three times since 2023 (v2.2 removed legitimate interest for advertising profiles, v2.3 made the `disclosedVendors` segment mandatory, v2.4 changed the vendor list format), and the courts have decided that the string itself is personal data and that IAB Europe is a joint controller for it. Google built its own requirements on top: a Google-certified CMP for personalized ads in the EEA, UK and Switzerland, and consent mode for its tags. Getting any of this wrong shows up as either a privacy violation (data sent to a vendor without a basis) or lost revenue (valid consent misread as none).

This chapter covers what a CMP does, the TCF's purposes, features and legal bases, the TC string field by field, the 2.2 to 2.4 changes and their deadlines, how a vendor turns a string into a decision, how the string travels in OpenRTB and ad tags, Google's certified CMP rule and consent mode, and the litigation that made the string personal data. It extends `ad_requests` and `organizations` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and `bid_requests` from [How Programmatic Works](/books/advertising/how-programmatic-works), and it defines **the one consent-signal model** the rest of this part and the volume use: raw signals kept on the request, parsed once at the edge into an `ads_mode` that every downstream system reads. The generic rules (consent before any non-exempt storage, gating SDKs, a consent ledger) are the playbook's [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection) and [Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks). The law behind the framework (lawful bases, Article 5(3) of the ePrivacy Directive, pay or consent) is [GDPR & ePrivacy for Ads](/books/advertising/gdpr-and-eprivacy-for-ads); the US equivalents (GPP strings, GPC, opt-outs) are [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs); what a cookie is allowed to be in each browser is [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy).

## How the Platforms Do It

As of November 2026, from each party's documentation:

| Party | What it requires | What it does without enough consent |
| --- | --- | --- |
| **Google Ad Manager and AdSense** | A TC string from a Google-certified CMP for personalized ads in the EEA and UK (from January 16, 2024) and Switzerland (from July 31, 2024). Personalized ads need consent for Purposes 1, 3 and 4 and legitimate interest (or consent) for 2, 7, 9 and 10 | Non-personalized ads with Purpose 1 consent only; **limited ads** (no cookies or local storage except for invalid traffic detection, no frequency capping or audience targeting) without Purpose 1 consent, with an invalid string, or with no certified CMP's string. v2.3 is "mandatory for all TC strings generated on or after March 1, 2026", and failing it "may cause the associated ad request to be defaulted to Limited Ads" |
| **IAB Europe TCF** | Registered CMPs and vendors, the Global Vendor List (GVL), the policies and the string format. As of November 19, 2026 the GVL is at version 186 under policy version 5 | Vendors without a legal basis for a purpose must not process for it; vendors not disclosed to the user must not process at all |
| **Microsoft Advertising** | From May 5, 2025, explicit consent signals for site visits from the EEA, UK and Switzerland, by one of: UET consent mode (`ad_storage`), a TCF string, or a tag manager integrating its consent mode | "Impact" on advertising performance for visits without signals |
| **Prebid.js** | The `consentManagement` module reads the CMP; `tcfControl` enforces purposes and vendor consent per module by GVL ID | Blocks user syncs and storage without Purpose 1, auction participation without Purpose 2, first-party data without Purpose 4, analytics without Purpose 7, and truncates precise geolocation without Special Feature 1 |

Three patterns:

- **The framework describes; each vendor decides.** The TCF defines what the user agreed to. Google, Microsoft and Prebid each turn that into their own rules (which purposes each kind of ad needs, which fallback applies), and those rules are not identical. A system that receives TC strings has to encode its own declared bases, not copy another vendor's table.
- **There is always a fallback, and it is three-tiered.** Personalized, non-personalized (contextual, with device storage allowed) and limited (no device storage, no identifiers) are the shape Google documents and Prebid's purpose gates produce. This volume uses the same three values for `ads_mode`.
- **Strings expire by version, not by date.** A string written under an older policy version stays valid only as far as the policy says: v2.3 kept strings created before February 28, 2026 valid without `disclosedVendors`, and Google may default requests with non-compliant strings generated from March 1, 2026 to limited ads. The two dates leave one day in dispute, and a string's `Created` field records only the day, so a string dated February 28 is valid to Google and invalid to IAB Europe. My rule is the stricter date: require the segment on strings created from February 28, which satisfies both. The policy version is a column, not a guess.

## What a CMP Does

The parties in the framework:

- **The publisher** runs the site or app, chooses a CMP, chooses which vendors and purposes to ask about, and can restrict vendors further (publisher restrictions). The publisher is the first party the user sees.
- **The CMP** is registered with IAB Europe and has a CMP ID. It shows the first layer (the banner, which under v2.2 must show the total number of vendors) and the second layer (purposes and vendors), stores the choices, writes the TC string, and exposes it to scripts through a standard JavaScript API.
- **Vendors** are the ad tech companies registered in the GVL with a vendor ID: SSPs, DSPs, ad servers, measurement and verification companies, data providers. Each declares, per purpose, whether it relies on consent or legitimate interest, which special purposes and features it uses, how long it retains data, which data categories it processes, and where its device storage disclosure lives.
- **IAB Europe** runs the registry, publishes the policies and the GVL, and (as the courts held) is a joint controller for the preferences recorded in the string.

Every CMP exposes the same function, `__tcfapi(command, version, callback, parameter)`. `ping`, `addEventListener` and `removeEventListener` are required; `getTCData` was deprecated in v2.2 in favor of `addEventListener`, whose callback receives the decoded `tcData` with an `eventStatus` of `tcloaded` (a valid string exists and no UI is showing), `cmpuishown` (the UI is up) or `useractioncomplete` (the user just confirmed choices). Scripts in nested iframes find the CMP through a frame named `__tcfapiLocator` and talk to it by `postMessage`. In apps the CMP writes the values to shared preferences under `IABTCF_*` keys, and vendors' SDKs "should listen to IABTCF_* key updates".

The consequence for an ad tag is a wait. Nothing that needs consent may run before the CMP has answered, which is either immediately (`tcloaded`, a returning visitor) or after the user acts (`useractioncomplete`). An ad tag that fires on page load with no string is an ad request with consent unknown, and for most vendors that means limited ads at best. My default is that the ad library subscribes with `addEventListener` and releases its queue on the first `tcloaded` or `useractioncomplete`, with a short timeout after which requests go out flagged as consent-unknown rather than waiting forever.

## Purposes, Features and Legal Bases

The GVL (specification version 3, as of November 2026) defines what can be asked. The names below are the GVL's own:

| ID | Purpose | Typical legal basis for ad tech |
| --- | --- | --- |
| 1 | Store and/or access information on a device | Consent only (it is the ePrivacy Article 5(3) question) |
| 2 | Use limited data to select advertising | Consent or legitimate interest |
| 3 | Create profiles for personalised advertising | Consent only since v2.2 |
| 4 | Use profiles to select personalised advertising | Consent only since v2.2 |
| 5 | Create profiles to personalise content | Consent only since v2.2 |
| 6 | Use profiles to select personalised content | Consent only since v2.2 |
| 7 | Measure advertising performance | Consent or legitimate interest |
| 8 | Measure content performance | Consent or legitimate interest |
| 9 | Understand audiences through statistics or combinations of data from different sources | Consent or legitimate interest |
| 10 | Develop and improve services | Consent or legitimate interest |
| 11 | Use limited data to select content | Consent or legitimate interest |

Beside the purposes:

- **Special purposes** are processed on legitimate interest with no right to object in the framework: 1 "Ensure security, prevent and detect fraud, and fix errors", 2 "Deliver and present advertising and content", and 3 "Save and communicate privacy choices".
- **Features** are methods used in service of purposes, disclosed but not separately consented: 1 "Match and combine data from other data sources", 2 "Link different devices", 3 "Identify devices based on information transmitted automatically".
- **Special features** need an explicit opt-in: 1 "Use precise geolocation data" and 2 "Identify devices based on information actively requested" (the v2.4 name; it covers device scanning such as fingerprinting from actively requested characteristics).

**v2.2 took legitimate interest away from personalization.** IAB Europe's launch notes for v2.2 (May 16, 2023, with CMPs required to migrate by November 20, 2023) list the removal of legitimate interest as a basis for the advertising and content personalization purposes, the requirement to show the total number of vendors on the first layer, and the deprecation of `getTCData`. In the GVL, a vendor declares each purpose under `purposes` (consent), `legIntPurposes` (legitimate interest) or, where it accepts either, `flexiblePurposes`, with the default from whichever of the other two lists the purpose. Purposes 3 to 6 can only be in `purposes` now. A publisher restriction can force a flexible vendor onto consent for a purpose, or forbid the purpose for that vendor entirely.

The GDPR side of the question (whether legitimate interest holds up at all for measurement and audience statistics, and why profiling for ads needs consent) is [GDPR & ePrivacy for Ads](/books/advertising/gdpr-and-eprivacy-for-ads); the framework's job is to record the answer in a form every vendor can read.

## The TC String

A TC string is up to three segments joined by dots: the core segment first, then the others in any order, each carrying its own segment type. Fields are big-endian bit fields, and the whole string is URL-safe base64. The core segment, in order, with bit lengths from IAB Tech Lab's format specification:

| Field | Bits | What it holds |
| --- | --- | --- |
| `Version` | 6 | The string format version (2) |
| `Created`, `LastUpdated` | 36 each | Deciseconds since the epoch; both now carry the same day-level value, the day the string was last updated |
| `CmpId`, `CmpVersion` | 12 each | Which registered CMP, which build |
| `ConsentScreen` | 6 | The screen the choice was made on |
| `ConsentLanguage` | 12 | Two letters |
| `VendorListVersion` | 12 | The GVL version the choices refer to |
| `TcfPolicyVersion` | 6 | The policy version the string was made under |
| `IsServiceSpecific` | 1 | Choices apply to this service only, not shared across sites |
| `UseNonStandardTexts` | 1 | The CMP customized the standard purpose texts |
| `SpecialFeatureOptIns` | 12 | One bit per special feature |
| `PurposesConsent` | 24 | One bit per purpose, consent |
| `PurposesLITransparency` | 24 | One bit per purpose, legitimate interest disclosed and not objected to |
| `PurposeOneTreatment` | 1 | Purpose 1 was not disclosed (a jurisdiction where it doesn't apply) |
| `PublisherCC` | 12 | The publisher's country |
| Vendor consent section | `MaxVendorId` (16), `IsRangeEncoding` (1), then a bit field or ranges | Which vendors have consent |
| Vendor legitimate interest section | Same structure | Which vendors' legitimate interest was disclosed and not objected to |
| Publisher restrictions | `NumPubRestrictions` (12), then entries of `PurposeId` (6), `RestrictionType` (2) and vendor ranges | Per purpose: not allowed, require consent, or require legitimate interest, for listed vendors |

The other segments:

- **`disclosedVendors`** (segment type 1) is a bit per vendor that was shown to the user. Since v2.3 it "is a mandatory segment": a string must contain the core and `disclosedVendors`. It exists to settle an ambiguity: a vendor that declares only special purposes has nothing to set in the consent or legitimate interest sections, and without this segment no one downstream can tell whether the user was even told about it. A vendor that is not in `disclosedVendors` was not disclosed and must not process.
- **`publisherTC`** (segment type 3) is optional and records the publisher's own purposes as a first party, including custom purposes.

Three consequences for a system that stores strings:

- **Keep the raw string, and parse once.** The raw string is the evidence; the parsed fields are what every decision reads. Re-parsing in every service is how two services come to different answers about the same request.
- **Keep the versions.** `TcfPolicyVersion` and `VendorListVersion` decide how to interpret the bits. A purpose bit means what that version of the GVL said it meant, and a vendor's declarations are read from that GVL version, not today's.
- **Treat the string as personal data.** Since the CJEU's 2024 ruling it is personal data where it can be linked to an identifier such as an IP address, which every ad request can. It is retained like any other request field, briefly, and sampled ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

## Versions and Deadlines

The framework's history since 2023, from IAB Europe's announcements:

| Version | Published | Deadline | What changed for engineers |
| --- | --- | --- | --- |
| **v2.2** | May 16, 2023 | CMPs by November 20, 2023 (moved from September 30) | Legitimate interest removed for advertising and content personalization; vendor count on the first layer; `getTCData` deprecated; GVL v3 |
| **v2.3** | June 19, 2025 | February 28, 2026 | `disclosedVendors` mandatory. "TC Strings created before 28 February 2026 without a disclosedVendors segment remain valid"; newer strings without it are invalid |
| **v2.4** (Policies v5.0.b) | July 23, 2026 | CMPs on the web by October 23, 2026; mobile apps and CTV by February 23, 2027 | GVL `standardTexts` for features, per-feature illustrations, the new name for Special Feature 2; the format specification also removed the requirement that special-purpose-only vendors be disclosed under the legitimate interest declaration |

Two deadlines per version matter more than the publication dates. A vendor has to accept new strings from the day the first CMPs ship them, and has to keep accepting old strings for as long as the policy says they're valid. A decoder that rejects unknown policy versions fails closed on every new CMP release; one that accepts anything fails open. My rule is a table of supported policy versions with their validity rules (`privacy_rule_versions` below), updated when IAB Europe announces a version and tested against sample strings from the major CMPs before their release dates.

## Turning a String Into a Decision

A vendor receiving a string runs the same check for each purpose it wants to use:

1. **Does the framework apply?** `gdprApplies` (or `regs.gdpr` in a bid request) is 1, or unknown and the request comes from the EEA, UK or Switzerland. Where it is 0 the TCF check is skipped, and the US rules in [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs) apply instead.
2. **Is the string valid?** It decodes; its policy version is supported; if created on or after February 28, 2026 it carries `disclosedVendors`; the CMP ID is registered.
3. **Was this vendor disclosed?** Its bit is set in `disclosedVendors`.
4. **What basis does this vendor declare for this purpose,** in the GVL version the string names, after publisher restrictions? Consent, legitimate interest, or not allowed.
5. **Is that basis present?** For consent: the purpose bit in `PurposesConsent` and the vendor bit in the vendor consent section. For legitimate interest: the purpose bit in `PurposesLITransparency` and the vendor bit in the legitimate interest section.
6. **Special features** need their opt-in bit and the vendor's consent.

From the per-purpose answers, the request's mode follows. This volume uses Google's three tiers because they match what the purposes allow:

- **`personalized`**: Purpose 1 consent, consent for Purposes 3 and 4, and a basis for 2 and 7. Profiles may be built and used.
- **`non_personalized`**: Purpose 1 consent and a basis for Purpose 2, without 3 or 4. Device storage is allowed (frequency capping, counting), targeting is contextual and coarse-geographic.
- **`limited`**: no Purpose 1 consent, an invalid string, or no string where one was required. No device storage or access except what security requires, no identifiers sent downstream, contextual targeting only.

The decision, as code a request-path service can run. It takes an already-decoded string and this vendor's declarations from the GVL version the string names:

```go tab="Go"
package consent

type Basis int

const (
	NotAllowed Basis = iota
	Consent
	LegitInterest
)

// TCData is a decoded TC string; bit sets are indexed by purpose or vendor ID.
type TCData struct {
	PolicyVersion    int
	CreatedUnix      int64
	PurposeConsent   map[int]bool
	PurposeLI        map[int]bool
	VendorConsent    map[int]bool
	VendorLI         map[int]bool
	Disclosed        map[int]bool // nil when the segment is absent
	SpecialFeatureIn map[int]bool
}

// Declared is this vendor's basis per purpose after publisher restrictions.
type Declared map[int]Basis

const v23Cutoff = 1772236800 // 2026-02-28T00:00:00Z: strings created from Feb 28 need the segment (IAB Europe's date, stricter than Google's Mar 1)

func hasBasis(tc TCData, vendor, purpose int, d Declared) bool {
	switch d[purpose] {
	case Consent:
		return tc.PurposeConsent[purpose] && tc.VendorConsent[vendor]
	case LegitInterest:
		return tc.PurposeLI[purpose] && tc.VendorLI[vendor]
	}
	return false
}

// AdsMode returns "personalized", "non_personalized" or "limited", with reasons.
func AdsMode(tc *TCData, vendor int, d Declared) (string, []string) {
	if tc == nil {
		return "limited", []string{"tcf_missing"}
	}
	if tc.Disclosed == nil && tc.CreatedUnix >= v23Cutoff {
		return "limited", []string{"tcf_invalid_no_disclosed_vendors"}
	}
	if tc.Disclosed != nil && !tc.Disclosed[vendor] {
		return "limited", []string{"tcf_vendor_not_disclosed"}
	}
	if !hasBasis(*tc, vendor, 1, d) {
		return "limited", []string{"tcf_no_storage_consent"}
	}
	if !hasBasis(*tc, vendor, 2, d) {
		return "limited", []string{"tcf_no_basic_ads_basis"}
	}
	if hasBasis(*tc, vendor, 3, d) && hasBasis(*tc, vendor, 4, d) {
		return "personalized", nil
	}
	return "non_personalized", []string{"tcf_no_personalization"}
}
```

```rust tab="Rust"
use std::collections::{HashMap, HashSet};

#[derive(Clone, Copy, PartialEq)]
pub enum Basis { NotAllowed, Consent, LegitInterest }

/// A decoded TC string; sets hold purpose or vendor IDs whose bit is set.
pub struct TcData {
    pub created_unix: i64,
    pub purpose_consent: HashSet<u16>,
    pub purpose_li: HashSet<u16>,
    pub vendor_consent: HashSet<u16>,
    pub vendor_li: HashSet<u16>,
    pub disclosed: Option<HashSet<u16>>, // None when the segment is absent
}

/// This vendor's basis per purpose after publisher restrictions.
pub type Declared = HashMap<u16, Basis>;

const V23_CUTOFF: i64 = 1_772_236_800; // 2026-02-28T00:00:00Z: strings created from Feb 28 need the segment (IAB Europe's date, stricter than Google's Mar 1)

fn has_basis(tc: &TcData, vendor: u16, purpose: u16, d: &Declared) -> bool {
    match d.get(&purpose).copied().unwrap_or(Basis::NotAllowed) {
        Basis::Consent => tc.purpose_consent.contains(&purpose) && tc.vendor_consent.contains(&vendor),
        Basis::LegitInterest => tc.purpose_li.contains(&purpose) && tc.vendor_li.contains(&vendor),
        Basis::NotAllowed => false,
    }
}

/// Returns ("personalized" | "non_personalized" | "limited", reasons).
pub fn ads_mode(tc: Option<&TcData>, vendor: u16, d: &Declared) -> (&'static str, Vec<&'static str>) {
    let Some(tc) = tc else { return ("limited", vec!["tcf_missing"]) };
    match &tc.disclosed {
        None if tc.created_unix >= V23_CUTOFF => return ("limited", vec!["tcf_invalid_no_disclosed_vendors"]),
        Some(set) if !set.contains(&vendor) => return ("limited", vec!["tcf_vendor_not_disclosed"]),
        _ => {}
    }
    if !has_basis(tc, vendor, 1, d) { return ("limited", vec!["tcf_no_storage_consent"]); }
    if !has_basis(tc, vendor, 2, d) { return ("limited", vec!["tcf_no_basic_ads_basis"]); }
    if has_basis(tc, vendor, 3, d) && has_basis(tc, vendor, 4, d) {
        return ("personalized", vec![]);
    }
    ("non_personalized", vec!["tcf_no_personalization"])
}
```

A real decoder also checks the policy version against the supported list, applies publisher restrictions to produce `Declared`, handles `PurposeOneTreatment`, and checks any further purposes the vendor's own rules require (Google's include 7, 9 and 10). Two cases the sketch simplifies on purpose: the "limited" tier for a vendor with no basis for Purpose 2 means that vendor shouldn't take part in the auction at all (Prebid blocks it), and a missing string where `gdprApplies` is unknown is decided by the request's country, not by the string.

**The decision is per vendor, the mode is per request.** A publisher's ad server computes the mode from its own vendor ID, and that is what its ranking and frequency capping read. An exchange computes a decision for every bidder it calls: one bidder may get the full request with identifiers, another the same request with `user.eids`, `user.buyeruid`, `device.ifa` and precise geo removed, and a third nothing. That per-bidder outcome is a row in `bid_requests` ([How Programmatic Works](/books/advertising/how-programmatic-works) adds `personal_data_sent` and `fields_removed`; this chapter adds the basis it was decided under).

## Passing It Downstream

The string reaches partners three ways:

- **In OpenRTB.** `regs.gdpr` is "0 = No, 1 = Yes, omission indicates unknown", and the string itself goes in `user.consent`. Every exchange passes both to every bidder; GPP strings go in `regs.gpp` with the applicable sections in `regs.gpp_sid`, covered in [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs).
- **In ad tag and pixel URLs,** through macros the CMP specification defines: `${GDPR}` (1, 0 or unset for unknown) and `${GDPR_CONSENT_XXXX}`, the "Encoded TC String where XXXX is the numeric Vendor ID of the vendor receiving the TC string". A creative's impression pixel or a cookie sync URL carries them, so the receiving server can check consent without a script.
- **In app SDKs,** from the `IABTCF_*` preference keys, which every ad SDK in the app reads directly.

**Receiving a string is not permission.** The core chapter's rule holds at every hop: a downstream party that receives a signal must honor it, not just pass it on. A DSP that gets a request with a string that gives it no consent for Purpose 1 may not set or read its cookie in the impression pixel, and may not use the `buyeruid` the exchange sent, even though both arrived. [How Programmatic Works](/books/advertising/how-programmatic-works) covers who sees what in the bid request; the losing bidders problem (every bidder receives the request whether or not it wins) is why the exchange's per-bidder shaping matters more than any bidder's self-restraint.

**Macros need the vendor's ID, not the caller's.** `${GDPR_CONSENT_755}` and `${GDPR_CONSENT_21}` expand to the same string, but the ID tells the CMP-aware tag which vendor is asking and documents in the creative which vendor's consent the pixel relies on. A creative with a pixel from a vendor that isn't in the GVL has no ID to put there, which is itself the finding: an undeclared vendor on a page with a CMP has no way to have consent.

## Google's Certified CMPs and Consent Mode

Google layers two requirements over the TCF.

**Certified CMPs.** Publishers using Ad Manager, AdSense or AdMob "are required to use a consent management platform (CMP) that has been certified by Google" and integrates with the TCF to serve personalized ads in the EEA and UK from January 16, 2024 and in Switzerland from July 31, 2024. "Traffic from a non-certified CMP may be eligible for non-personalized ads or limited ads", and Google's limited ads page lists a request from those regions without a TC string from a certified CMP among the cases that serve limited ads. Google's EU User Consent Policy, which covers the EEA, UK and Switzerland, requires legally valid consent for cookies or local storage and for ads personalization, records of consent, revocation instructions and identification of each party that will use the data. For a publisher, the CMP choice is a revenue decision as much as a compliance one.

**Purposes Google needs.** Personalized ads need consent for Purposes 1, 3 and 4 and legitimate interest (or consent, if the publisher's CMP asks for it) for Purposes 2, 7, 9 and 10; Google is "not flexibly registered for purposes 1, 3, and 4 and always requires consent for these purposes." Non-personalized ads need Purpose 1 consent and a basis for 2, 7, 9 and 10. Limited ads, its third tier, "disable the collection, sharing, and use of personal data for personalization of ads", and give up audience targeting, remarketing, frequency capping and unique reach measurement; they use no cookies or local storage except for invalid traffic detection.

**Consent mode** is how Google's advertiser-side tags (Google Ads, Floodlight, Google Analytics) receive the choice when they don't read the TC string directly. Version 2 (November 2023) has four fields: `ad_storage`, `analytics_storage`, and the two the November 2023 update added, `ad_user_data` (may user data be sent to Google for advertising) and `ad_personalization` (may it be used for personalization). In basic mode tags don't load until the user interacts with the banner; in advanced mode they load with defaults denied and send "cookieless pings", which Google uses for conversion modeling. From March 2024, EEA Customer Match uploads need both `ad_user_data` and `ad_personalization` granted, and a missing value counts as not consented. The playbook's [Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks) explains why I default to the basic pattern; the mapping from consent mode to this volume's model is direct (`ad_storage` denied is `limited`; `ad_personalization` denied is at most `non_personalized`).

Microsoft has the same structure with fewer fields: its UET consent mode carries `ad_storage` as granted or denied, and it accepts a TCF string as an alternative. A platform that runs an advertiser-side tag in Europe needs one of these signals from every page it is on.

## The TCF in Court

The framework itself has been the subject of a Belgian enforcement case for years, and its outcome changed how the string is treated:

- **The Belgian decision.** The Belgian data protection authority (APD/GBA) found in its 2022 decision 21/2022 that the TC string is personal data and that IAB Europe is a controller for it, and imposed corrective measures and a fine.
- **CJEU C-604/22 (March 7, 2024).** On a reference from the Brussels Court of Appeal (its Market Court section), the Court of Justice held that the TC string "constitutes personal data" where it can be associated with an identifier such as an IP address, and that IAB Europe can be a "joint controller" with its members for the recording of preferences in the string, but not for subsequent processing by vendors unless it influenced the purposes and means of that processing.
- **The Market Court (May 14, 2025).** Applying the ruling, the Market Court found the string personal data and IAB Europe a joint controller for the TCF preferences, but not a controller for processing "entirely within the OpenRTB protocol", and confirmed the €250,000 fine although it annulled decision 21/2022 on procedural grounds.
- **The action plan (January 2026).** IAB Europe announced that the Market Court had annulled the APD's validation of IAB Europe's action plan as "legally flawed", returning the matter to the APD. That account is from IAB Europe, a party to the case; the court's own text wasn't available to me. <!-- source-gap: adv-tcf-action-plan-ruling | secondary | Market Court annulled the APD validation of IAB Europe's TCF action plan (January 2026) | closes with: the Market Court judgment or an APD statement | checked: 2026-11-22 -->

For engineers the holdings mean three things. The string is personal data in every log it lands in. Each vendor is a controller for what it does with the data the string unlocks, so "the CMP said yes" is the start of a vendor's accountability, not the end of it. And the framework's records (which CMP, which version, which vendors disclosed) are evidence a regulator will read, which is why they're columns below.

## How to Build It

### The Consent Signal Model

Every chapter in this part extends one model, so it's stated here once:

- **Raw signals ride on the request.** The core's `ad_requests` already carries `gdpr_applies`, `tcf_string`, `gpp_string`, `gpp_sids`, `gpc` and `coppa`. They are kept verbatim as evidence and never re-derived.
- **They are parsed once, at the edge,** by the first service that receives the request (the ad server, the exchange's ingress, the SDK gateway), into typed columns: this chapter's TCF fields, [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs)' US opt-out fields, and [Children, Teens & Advertising](/books/advertising/children-and-teens)'s age band.
- **The parse produces one `ads_mode`** (`personalized`, `non_personalized`, `limited`) and the reason codes that produced it. Ranking, frequency capping, audience matching, identity resolution, logging and social delivery read `ads_mode`, not the strings. A reason code says which rule fired: `tcf_no_storage_consent`, `tcf_no_personalization`, `us_opt_out`, `gpc`, `coppa`, `known_minor`, `teen_ban`, `sensitive_context`, `political_no_consent`.
- **Each downstream recipient gets its own decision,** recorded on `bid_requests` with the basis it was sent under.
- **The rules are versioned data.** The supported TCF policy versions, the GVL version in force, the jurisdiction rules from [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law) and the mapping from signals to modes are a `privacy_rule_versions` row, and every request records which version decided it. When a rule changes, old decisions stay explainable.
- **Persistent choices live elsewhere.** Opt-outs attached to a profile rather than a request are GPP, GPC & US Opt-Outs' `opt_out_records`; contracts and roles per counterparty are US State Privacy Law for Advertising's `privacy_agreements`; what is stored on devices is [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy)'s `storage_disclosures`.

```sql
CREATE TABLE gvl_versions (               -- one published Global Vendor List
  version                 INT PRIMARY KEY,           -- vendorListVersion
  specification_version   SMALLINT NOT NULL,         -- gvlSpecificationVersion, 3 as of 2026
  tcf_policy_version      SMALLINT NOT NULL,         -- tcfPolicyVersion
  last_updated_at         TIMESTAMPTZ NOT NULL,      -- the file's lastUpdated
  fetched_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_sha256          BYTEA NOT NULL             -- the file as fetched, stored in object storage
);

CREATE TABLE gvl_vendors (                -- one vendor's declarations in one GVL version
  gvl_version             INT NOT NULL REFERENCES gvl_versions (version),
  vendor_id               INT NOT NULL,
  name                    TEXT NOT NULL,
  purposes                SMALLINT[] NOT NULL DEFAULT '{}',  -- consent
  leg_int_purposes        SMALLINT[] NOT NULL DEFAULT '{}',  -- legitimate interest
  flexible_purposes       SMALLINT[] NOT NULL DEFAULT '{}',
  special_purposes        SMALLINT[] NOT NULL DEFAULT '{}',
  features                SMALLINT[] NOT NULL DEFAULT '{}',
  special_features        SMALLINT[] NOT NULL DEFAULT '{}',
  data_declaration        SMALLINT[] NOT NULL DEFAULT '{}',  -- data category IDs
  retention_days          JSONB NOT NULL DEFAULT '{}',       -- dataRetention as published
  device_storage_disclosure_url TEXT NOT NULL,
  deleted_at              TIMESTAMPTZ,                       -- deletedDate: not usable after this
  PRIMARY KEY (gvl_version, vendor_id),
  CHECK (NOT (leg_int_purposes && ARRAY[3, 4, 5, 6]::SMALLINT[]))  -- v2.2: profiling is consent-only
);

ALTER TABLE organizations ADD COLUMN tcf_vendor_id INT;  -- this company's GVL ID, if registered
CREATE UNIQUE INDEX CONCURRENTLY organizations_tcf_vendor_id_key
  ON organizations (tcf_vendor_id) WHERE tcf_vendor_id IS NOT NULL;

CREATE TABLE cmp_deployments (            -- which CMP a property runs, and how it's configured
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id             UUID NOT NULL REFERENCES properties (id),
  cmp_id                  INT NOT NULL,              -- IAB Europe CMP ID
  cmp_name                TEXT NOT NULL,
  frameworks              TEXT[] NOT NULL CHECK (frameworks <@ ARRAY['tcfeuv2', 'gpp',
                            'google_consent_mode', 'microsoft_consent_mode']::TEXT[]),
  google_certified        BOOLEAN NOT NULL DEFAULT FALSE,
  regions                 TEXT[] NOT NULL,           -- where the UI is shown, e.g. {'EEA','GB','CH'}
  vendor_ids              INT[] NOT NULL DEFAULT '{}',  -- vendors the publisher asks for
  publisher_restrictions  JSONB NOT NULL DEFAULT '[]',  -- [{"purpose":2,"type":"require_consent","vendors":[...]}]
  valid_during            TSTZRANGE NOT NULL,
  config_ref              TEXT NOT NULL,             -- the CMP configuration version or export
  EXCLUDE USING gist (property_id WITH =, valid_during WITH &&)  -- needs btree_gist
);

CREATE TABLE privacy_rule_versions (      -- the decision rules every request is judged under
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  version                 INT NOT NULL UNIQUE,
  tcf_policy_versions     SMALLINT[] NOT NULL,       -- accepted TcfPolicyVersion values
  gvl_version             INT NOT NULL REFERENCES gvl_versions (version),
  tcf_disclosed_vendors_required_from TIMESTAMPTZ NOT NULL,  -- 2026-02-28 under v2.3 (IAB Europe's date)
  mode_rules              JSONB NOT NULL,            -- signal-to-mode mapping, per regime
  jurisdiction_rules_ref  TEXT,                      -- privacy_jurisdictions snapshot (US state law)
  effective_at            TIMESTAMPTZ NOT NULL,
  approved_by             TEXT NOT NULL,             -- typed actor; legal and engineering sign-off
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ad_requests
  ADD COLUMN tcf_policy_version      SMALLINT,
  ADD COLUMN tcf_cmp_id              INT,
  ADD COLUMN tcf_vendor_list_version INT,
  ADD COLUMN privacy_rule_version_id UUID,
  ADD COLUMN ads_mode                TEXT,
  ADD COLUMN ads_mode_reasons        TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_ads_mode_check
  CHECK (ads_mode IN ('personalized', 'non_personalized', 'limited')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_privacy_rule_version_fk
  FOREIGN KEY (privacy_rule_version_id) REFERENCES privacy_rule_versions (id) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_tcf_parsed_check
  CHECK (tcf_string IS NULL OR tcf_policy_version IS NOT NULL) NOT VALID;  -- parsed at the edge

ALTER TABLE bid_requests
  ADD COLUMN privacy_basis           TEXT,
  ADD COLUMN privacy_rule_version_id UUID;
ALTER TABLE bid_requests ADD CONSTRAINT bid_requests_privacy_basis_check
  CHECK (privacy_basis IN ('consent', 'legitimate_interest', 'not_personal',
    'us_not_opted_out', 'service_provider', 'restricted')) NOT VALID;
ALTER TABLE bid_requests ADD CONSTRAINT bid_requests_personal_basis_check
  CHECK (NOT personal_data_sent OR privacy_basis IN ('consent', 'legitimate_interest',
    'us_not_opted_out', 'service_provider')) NOT VALID;
```

The check on `gvl_vendors` rejects an import that declares legitimate interest for Purposes 3 to 6, which no vendor may do since v2.2; seeing it means the parser read an old-format file.

Design notes:

- **The GVL is imported, never edited.** A job fetches each published GVL, stores the file by hash, and loads `gvl_vendors`. Decisions read the version the string names (`tcf_vendor_list_version`), so a vendor that changes its declarations tomorrow doesn't retroactively change what today's strings allowed. IAB Europe publishes a new version most weeks.
- **`ads_mode` is what everything reads.** [Social Advertising](/books/advertising/social-advertising)'s per-person ads mode, [Ad Servers](/books/advertising/ad-servers)' decisioning, [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency)'s caps and [Identifiers After Cookies](/books/advertising/identifiers-after-cookies)' ID resolution all branch on this one column. A service that parses a TC string for itself is a defect; it will disagree with the edge sooner or later.
- **Reasons are codes, not prose,** so a dashboard can show what share of `limited` traffic is missing strings (a CMP integration bug) against refused consent (a user choice), and a change in either is an alert.
- **`personal_data_sent` needs a basis.** The check on `bid_requests` makes it impossible to log a callout that carried identifiers without recording why that was allowed; a callout with identifiers and a `restricted` basis is rejected at write time, and the alert fires.
- **Unknown is not no.** `gdpr_applies` null (the core keeps OpenRTB's omission semantics) is resolved by the request's country before the mode is computed; the resolution is recorded as a reason (`gdpr_inferred_from_geo`).
- **One CMP per property at a time.** `cmp_deployments` is effective-dated with an exclusion constraint, so a question about last March's consent rate has one CMP, one configuration and one vendor list to answer it with.
- **Rules change by release, not by deploy.** A new `privacy_rule_versions` row is approved, then made effective at a time; services cache the current version and every request records it. That is the same pattern the volume uses for auction rules (`auction_rule_versions`, in [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases)).

Consent rate and limited-ads share per property and day, from sampled requests in the EEA, UK and Switzerland. It is the number a publisher's revenue team and its privacy team read for different reasons:

```sql
SELECT r.ad_unit_id,
       date_trunc('day', r.received_at)                            AS day,
       count(*)                                                    AS requests,
       count(*) FILTER (WHERE r.ads_mode = 'personalized')         AS personalized,
       count(*) FILTER (WHERE r.ads_mode = 'non_personalized')     AS non_personalized,
       count(*) FILTER (WHERE r.ads_mode = 'limited')              AS limited,
       count(*) FILTER (WHERE 'tcf_missing' = ANY (r.ads_mode_reasons)) AS missing_string
FROM ad_requests r
WHERE r.gdpr_applies
  AND r.received_at >= now() - interval '7 days'
GROUP BY 1, 2;
```

Callouts that carried personal data to a bidder whose GVL entry didn't allow it, for the audit below:

```sql
SELECT b.bidder_org_id, o.tcf_vendor_id, count(*) AS callouts
FROM bid_requests b
JOIN auctions a      ON a.started_at = b.auction_started_at AND a.id = b.auction_id
JOIN ad_requests r   ON r.id = a.ad_request_id
                    AND r.received_at BETWEEN a.started_at - interval '1 minute' AND a.started_at
JOIN organizations o ON o.id = b.bidder_org_id
LEFT JOIN gvl_vendors v ON v.gvl_version = r.tcf_vendor_list_version
                       AND v.vendor_id = o.tcf_vendor_id
WHERE r.gdpr_applies
  AND b.personal_data_sent
  AND (v.vendor_id IS NULL OR v.deleted_at < r.received_at)
GROUP BY 1, 2;
```

The join from auctions to requests is by the request's ID within a narrow time window, so Postgres prunes to one or two hourly partitions (the core keeps no foreign key across partitioned logs). A non-empty result means identifiers went to a company that wasn't in the vendor list the user saw.

## Auditing

- **What the user agreed to, for each request.** The raw TC string, its policy version, CMP ID and vendor list version, and the rule version and `ads_mode` the request was decided under, kept for the request log's retention period (short, because the string is personal data) and summarized for longer.
- **What each recipient got.** Per callout: the bidder, its GVL ID, the basis it was sent under, whether personal data was sent and which fields were removed. A data protection authority's question ("did vendor X receive this user's data?") is a query, not an investigation.
- **Which vendor list and which rules.** Every imported GVL by version and hash, and every `privacy_rule_versions` row with who approved it and when it took effect.
- **What each property ran.** The CMP, its configuration, the vendors asked for and the publisher restrictions, effective-dated.
- **Version migrations.** For each TCF version change, the date this system started accepting new strings, the date it stopped accepting non-compliant ones, and the share of traffic on each policy version through the transition.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Wait for the CMP,** and send requests that couldn't wait flagged as consent-unknown rather than as consented.
- **Parse the string once, at the edge,** keep the raw string as evidence, and let every service read the parsed fields and `ads_mode`.
- **Decide per vendor from the GVL version the string names,** with publisher restrictions applied, and check `disclosedVendors` before anything else.
- **Use three modes,** personalized, non-personalized and limited, and record the reason for every downgrade.
- **Shape each bid request for its bidder** and record the basis each callout was sent under; never log identifiers sent without one.
- **Treat receiving a string as an obligation,** not permission: honor it in pixels, syncs and logs, not only in bidding.
- **Version the rules** (TCF policy versions, GVL, mode mapping) as data with approval and effective dates, and test new TCF versions against real CMPs before their deadlines.
- **Treat the TC string as personal data** in retention and access, because the courts do.

## References

**Specifications**

- [IAB Tech Lab: TCF v2 Consent string and vendor list formats](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20Consent%20string%20and%20vendor%20list%20formats%20v2.md), core segment fields and bit lengths, segment types, `disclosedVendors` as mandatory, GVL vendor fields, the 2.3 and 2.4 changes
- [IAB Tech Lab: TCF v2 CMP API](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md), `__tcfapi` commands, event statuses, `__tcfapiLocator`, `IABTCF_*` keys, the `${GDPR}` and `${GDPR_CONSENT_XXXX}` macros
- [IAB Europe: Global Vendor List v3](https://vendor-list.consensu.org/v3/vendor-list.json), version 186 under policy version 5 (November 19, 2026), purpose, special purpose, feature and special feature names
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), `regs.gdpr` and its omission semantics, `regs.gpp` and `gpp_sid`

**Regulation**

- [CJEU: Press release 44/24 on Case C-604/22, IAB Europe (March 7, 2024)](https://curia.europa.eu/jcms/upload/docs/application/pdf/2024-03/cp240044en.pdf), the TC string as personal data, IAB Europe as joint controller, the 2022 Belgian decision and the reference from the Brussels Court of Appeal
- [Belgian Data Protection Authority: The Market Court rules in the IAB Europe case](https://www.dataprotectionauthority.be/citizen/the-market-court-rules-in-the-iab-europe-case), decision 21/2022, the May 14, 2025 judgment, OpenRTB processing and the €250,000 fine

**Reference**

- [IAB Europe: TCF v2.2 launches, all you need to know](https://iabeurope.eu/tcf-2-2-launches-all-you-need-to-know/), the v2.2 changes and the November 20, 2023 deadline
- [IAB Europe: The transition to TCF v2.3](https://iabeurope.eu/all-you-need-to-know-about-the-transition-to-tcf-v2-3/), `disclosedVendors` mandatory, the February 28, 2026 cutoff and validity of older strings
- [IAB Europe: TCF Policies v5.0.b and Specifications v2.4, confirmation of the timeline (July 16, 2026)](https://iabeurope.eu/wp-content/uploads/TCF_V-CMP_comms_TCFpoliciesV5.0.bAndSpecificationsV2.4ConfirmationOf-theTimeline_160726_IABEurope.pdf), publication on July 23, 2026 and the CMP deadlines for web, app and CTV
- [IAB Europe: IAB Europe wins appeal against APD decision on TCF corrective measures](https://iabeurope.eu/iab-europe-wins-appeal-against-apd-decision-on-tcf-corrective-measures/), the January 2026 ruling as IAB Europe reports it

**In practice**

- [Google Ad Manager Help: Certified CMP requirement](https://support.google.com/admanager/answer/13554116), the EEA and UK date and the Swiss date
- [Google Ad Manager Help: TCF integration and purposes](https://support.google.com/admanager/answer/9805023), purposes required for personalized and non-personalized ads, Google's flexible registration, invalid and non-compliant v2.3 strings
- [Google Ad Manager Help: Limited ads](https://support.google.com/admanager/answer/9882911), when limited ads serve and what they disable
- [Google: EU User Consent Policy](https://www.google.com/about/company/user-consent-policy/), scope and the consent, records and revocation requirements
- [Google for Developers: Consent mode](https://developers.google.com/tag-platform/security/guides/consent), the four consent types
- [Google Ads Help: About consent mode](https://support.google.com/google-ads/answer/10000067), basic and advanced modes and cookieless pings
- [Google Ads Help: Customer Match consent requirements](https://support.google.com/google-ads/answer/14310715), both consent fields required for EEA uploads from March 2024
- [Microsoft Advertising: Providing user consent signals by May 5, 2025](https://about.ads.microsoft.com/en/blog/post/march-2025/providing-user-consent-signals-on-your-microsoft-campaigns-by-may-5-2025), the three accepted methods
- [Prebid: TCF Control module](https://docs.prebid.org/dev-docs/modules/tcfControl.html), the activities gated by each purpose, vendor exceptions and strict storage enforcement
