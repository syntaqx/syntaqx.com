+++
title = "GPP, GPC & US Opt-Outs"
description = "US opt-out signals in ad tech: GPP strings and sections, usnat and the MSPA, Global Privacy Control, platform modes, and carrying an opt-out down the chain."
category = "Advertising Industry"
order = 2956
part = "Privacy and Law"
tags = ["advertising", "privacy", "gpp", "gpc", "ccpa", "data-model"]
+++

In Europe the default for ad personalization is no until the user says yes. In the United States the default is yes until the user says no: state privacy laws give consumers the right to opt out of the "sale" of their personal information, of "sharing" it for cross-context behavioral advertising, and of "targeted advertising", and the ad system's job is to receive that no, from whichever direction it arrives, and make every party downstream act on it. The no arrives in three forms. A **GPP string** written by the publisher's consent tool says, per state, whether the person opted out and whether they were given notice. A **Global Privacy Control** signal, a browser header `Sec-GPC: 1`, says the person opts out of sale and sharing everywhere, and California requires businesses to honor it. And a **persistent opt-out**, made in a form, an app setting or through an authorized agent, sits in some company's database attached to a cookie, a device ID or an account.

It is hard because each form reaches a different set of parties, and the law treats a failure anywhere in the chain as the business's failure. The GPP string rides in the bid request and reaches every bidder; GPC reaches only the servers the browser talks to directly; a persistent opt-out reaches no one unless the company holding it sends it. The framework that standardizes the strings, IAB Tech Lab's Global Privacy Protocol, changed its US National section again in November 2026, and the contract behind it, the Multi-State Privacy Agreement (MSPA), is on its sixth version from January 2027. The enforcement record in California is a list of opt-outs that were collected and never applied: on the web but not in the app, on one device but not the account, in the CMP but not in the tags.

This chapter covers the GPP string and its sections, the US National section and the MSPA, GPC and the states that require it, how Google, Meta and Prebid turn the signals into restricted processing, how an opt-out propagates through the programmatic chain and outside it, and the records that prove it did. It extends `ad_requests` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the consent signal model in [Consent Management & the TCF](/books/advertising/consent-and-the-tcf#the-consent-signal-model), whose `ads_mode` the US signals feed. What the state laws mean by sale, sharing and targeted advertising, which laws apply and how they're enforced is [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law); the playbook's [California: Opt-Out of Sale and Sharing](/docs/telemetry/consent-and-privacy#california-opt-out-of-sale-and-sharing) covers GPC in a telemetry pipeline, including the CPPA regulation that applies the signal to pseudonymous profiles. Data brokers' registration and California's DROP deletion platform are [Data Brokers & Third-Party Data](/books/advertising/data-brokers); identifier providers' own opt-outs (UID2 and others) are [Identifiers After Cookies](/books/advertising/identifiers-after-cookies).

## How the Platforms Do It

As of November 2026, from each party's documentation:

| Party | How a publisher or advertiser signals a US opt-out | What the platform does |
| --- | --- | --- |
| **Google Ad Manager and AdSense** | **Restricted data processing**: `setPrivacySettings({ 'restrictDataProcessing': true })` in GPT, `rdp=1` on tagless requests, `data-restrict-data-processing="1"` on AdSense tags | "Google will limit how it uses data and only serve non-personalized ads" |
| **IAB Tech Lab GPP** | A GPP string with the US National section (ID 7) or a state's section (IDs 8 onward), passed in OpenRTB `regs.gpp` and `regs.gpp_sid` | A standard every party can decode; what each does with an opt-out is its own rule and, among MSPA signatories, the contract's |
| **Meta (pixel and Conversions API)** | **Limited Data Use**: `dataProcessingOptions: ['LDU']` with a country and state, or 0 to geolocate | For data from 14 listed states, Meta processes "in accordance with our role as a service provider or processor" and limits its use; retargeting and measurement are reduced |
| **Prebid.js** | `consentManagementGpp` reads the CMP's GPP string; `gppControl_usnat` (and a separate US States module) applies "sensible and conservative activity controls" | Restricts activities such as user syncs and identifier transmission by default when the string says the person opted out |

Three patterns:

- **Each walled garden has its own switch.** Google's RDP and Meta's LDU are not GPP; they are flags in each platform's own tag or API that make the platform act as a service provider for that data. A site with both tags sets both, and sets them from the same decision, or they disagree.
- **The standard string reaches the open web.** GPP is what SSPs, DSPs and Prebid read, and like the TC string it only describes the person's choice; each recipient decides what it means for its processing.
- **Restricted means non-personalized.** Every mode in the table collapses to the same thing for the ad: no cross-context targeting, no retargeting, reduced measurement. In this volume's model that is `ads_mode = 'non_personalized'` with a `us_opt_out` or `gpc` reason, unless another rule drives it lower.

## The GPP String

The Global Privacy Protocol (IAB Tech Lab renamed it from Global Privacy Platform; OpenRTB 2.6 still uses the older name) is a container for privacy strings from any jurisdiction. Its final public version was published September 28, 2022, with encoding clarifications on November 3, 2023. "The string must contain a header and applicable discrete section(s): [Header]~[Discrete Section]", sections separated by tildes, which keeps the format compatible with the TC strings and US Privacy strings it can contain. The header's type is fixed at 3, its version is 1, and it lists the section IDs present, in the order they appear, as a Fibonacci-encoded range. An example containing only an EU TCF section: `DBABM~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA`.

The section IDs, from the GPP's section registry:

| ID | Key | What it is |
| --- | --- | --- |
| 1 | `tcfeuv1` | EU TCF v1 (deprecated) |
| 2 | `tcfeuv2` | EU TCF v2, the TC string from [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) |
| 3 | header | The GPP header |
| 4 | signal integrity | Reserved for signal integrity |
| 5 | `tcfcav1` | IAB Canada TCF |
| 6 | `uspv1` | The US Privacy String (deprecated) |
| 7 | `usnat` | The MSPA US National section |
| 8-27 | `usca`, `usva`, `usco`, `usut`, `usct`, `usfl`, `usmt`, `usor`, `ustx`, `usde`, `usia`, `usne`, `usnh`, `usnj`, `ustn`, `usmn`, `usmd`, `usin`, `usky`, `usri` | One section per state law |

**`gpp_sid` says which section governs.** OpenRTB 2.6 carries the string in `regs.gpp` and an "Array of the section(s) of the string which should be applied for this transaction" in `regs.gpp_sid`; ad tags get the same through the `${GPP_STRING_XXXXX}` macro (the URL-safe string, for vendor ID XXXXX) and `${GPP_SID}`, "the section ID(s) in force for the current transaction." A string can contain sections that don't apply (a CMP may write a California section for a visitor it later geolocates to Texas), so a receiver reads the sections `gpp_sid` names, not every section present. When `gpp_sid` is missing, the receiver falls back to its own geolocation, and records that it did.

**The legacy US Privacy String** (`us_privacy`, four characters such as `1YNN`) is section 6 inside GPP and deprecated there, but OpenRTB 2.6 still has a `regs.us_privacy` field and older integrations still send it. My rule is to accept it, map it, and prefer a GPP string when both are present.

### The State Sections

A state section records, for one state's law, whether each notice was given and whether each opt-out was exercised. California's (`usca`, ID 8), from its technical specification:

| Field | Bits | Values |
| --- | --- | --- |
| `Version` | 6 | Section version |
| `SaleOptOutNotice`, `SharingOptOutNotice`, `SensitiveDataLimitUseNotice` | 2 each | 0 not applicable, 1 notice provided, 2 not provided |
| `SaleOptOut`, `SharingOptOut` | 2 each | 0 not applicable, 1 opted out, 2 did not opt out |
| `SensitiveDataProcessing` | 2 per category | 0 not applicable, 1 opted out, 2 did not opt out (California's right is to limit use) |
| `KnownChildSensitiveDataConsents` | 2 per activity | Selling and sharing data of consumers under 16: 0 not applicable, 1 no consent, 2 consent |
| `PersonalDataConsents` | 2 | 0 not applicable, 1 no consent, 2 consent |
| `MspaCoveredTransaction`, `MspaOptOutOptionMode`, `MspaServiceProviderMode` | 2 each | Fixed (2, 0, 0) as of the Fifth Amended and Restated MSPA |
| GPC subsection | | `Gpc`: 0 false, 1 true |

Virginia's (`usva`, ID 9) has the same shape for a different law: a `SharingNotice`, a `TargetedAdvertisingOptOutNotice` and `TargetedAdvertisingOptOut` instead of California's sharing opt-out, and `SensitiveDataProcessing` encoded as consent (1 no consent, 2 consent) because Virginia requires opt-in for sensitive data, with no GPC subsection. The two encodings use the same bits with opposite meanings: in `usca` a 1 in `SensitiveDataProcessing` is an opt-out; in `usva` it is a refusal of consent. A decoder keyed by field name, not by position across sections, is the only safe one.

## The US National Section and the MSPA

The **Multi-State Privacy Agreement** is IAB Privacy's contract for US state law. Its own description: it "creates a common framework for advertisers, agencies, technology vendors, and publishers" and is a "springing contract" that forms a contractual relationship among signatories when personal information flows between them to select and deliver a digital ad. The point is the contracts the state laws require between a business and the parties it discloses data to: instead of each publisher signing a data processing agreement with every bidder, both sides sign the MSPA once. Its versions are short-lived: the Fourth Amended and Restated MSPA ran from July 7, 2025 to June 3, 2026, the Fifth from June 4, 2026 to December 31, 2026, and the Sixth is effective January 1, 2027.

The **US National section** (`usnat`, ID 7) is the MSPA's signal, and its November 2026 version 3.0 ("Updated to support the Fifth Amended and Restated MSPA") is much smaller than its predecessors. Its core subsection has four fields:

- **`MspaVersion`**: which MSPA the string was made under.
- **`MspaNotice`**: 1, the first party gave the notice the MSPA requires; 2, no notice because the first party "does not Sell or Share Personal Information."
- **`MspaOptOut`**: 0, not applicable (no sale, sharing or targeted advertising); 1, "Consumer Opted Out"; 2, "Consumer Did Not Opt Out".
- **`MspaId`**: the first party's MSPA signatory identifier. If it doesn't contain "the valid signatory identifier of the party providing the string," then "it is not covered by the MSPA contract."

A GPC subsection is always present, set from the `Sec-GPC` header or the `globalPrivacyControl` JavaScript property. Version 2.0 (October 2024) had carried per-state detail for fourteen more states under the Second Amended and Restated MSPA, and the state sections still carry the per-law fields; the MSPA-specific fields in the state sections are fixed as of the Fifth MSPA, so coverage is now signaled through `usnat` and its `MspaId`. IAB Tech Lab opened its August 2026 GPP update for the latest MSPA to public comment until September 11, 2026.

What that means for a receiver:

- **Check the signatory.** A `usnat` section with an `MspaId` that isn't on the MSPA Identification List is not covered by the contract, which means the receiver has no MSPA terms for the data and falls back to whatever agreement it has with the sender (`privacy_agreements`, in [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law)).
- **Store the MSPA version.** A string made under the Fifth MSPA in December 2026 and one made under the Sixth in January 2027 are judged under different contracts.
- **Expect churn.** Three amended MSPAs in eighteen months and a section format that changed its fields in November 2026 are the reason the decoding rules are data (`privacy_rule_versions`) and not code paths.

## Global Privacy Control

The W3C specification defines the signal in two places: a request header, `Sec-GPC: 1`, sent by a browser or extension with the user's preference on, and a JavaScript property, `navigator.globalPrivacyControl`, true when it is on. A site may publish `/.well-known/gpc.json` to say it supports the signal. GPC was introduced at the W3C Privacy Community Group in April 2020 and became a W3C Privacy Working Group work item in November 2024.

**California requires it.** The Attorney General's CCPA page says the signal "must be honored by covered businesses as a valid consumer request" to stop the sale or sharing of personal information, and the CPPA's regulations apply it to the browser or device and "any consumer profile associated with that browser or device, including pseudonymous profiles" ([California: Opt-Out of Sale and Sharing](/docs/telemetry/consent-and-privacy#california-opt-out-of-sale-and-sharing)). Not honoring GPC was among the violations in the Attorney General's Sephora (2022) and Healthline (2025) settlements and in the CPPA's Tractor Supply order (2025). On September 9, 2025 the CPPA and the Attorneys General of California, Colorado and Connecticut announced a joint investigative sweep of businesses that may not be processing GPC opt-out requests. Other states' laws recognize universal opt-out mechanisms on their own schedules; [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law) has the per-state table.

**Browsers will have to offer it.** California's AB 566, the Opt Me Out Act, signed October 8, 2025, "requires browsers operating in California to offer easy-to-use opt-out preference signals," from January 2027 by the CPPA's account. Until now GPC came mostly from privacy-focused browsers and extensions; from 2027 every browser operating in California must offer a setting for it, and the share of traffic carrying `Sec-GPC: 1` will rise accordingly.

**Where GPC doesn't reach.** The header goes only to servers the browser contacts. A publisher's ad server sees it; an SSP that receives the request server-to-server from Prebid Server doesn't, unless someone writes it into the GPP string (the `usnat` and `usca` sections' GPC subsection) or an extension. A DSP never sees the header at all. So GPC has to be **converted into the string** at the first hop and carried from there; an exchange that drops it from the string has broken the chain for everyone downstream.

## Turning Signals Into a Decision

At the edge, the request's US signals combine into one set of opt-outs for the request:

1. **Which state applies?** From `gpp_sid` when present, otherwise from the request's geolocation (coarse region is enough), recorded either way.
2. **What does that section say?** `SaleOptOut`, `SharingOptOut` and `TargetedAdvertisingOptOut` where the section has them; `usnat`'s `MspaOptOut`; the sensitive-data fields.
3. **Is GPC on?** From the header, the JavaScript property as relayed by the tag, or a section's GPC subsection. GPC adds `sale` and `sharing` wherever the jurisdiction honors it.
4. **Is there a persistent opt-out** for this browser, device or account? A lookup against `opt_out_records` by the request's identifiers, below.
5. **Is the person known to be a minor?** [Children, Teens & Advertising](/books/advertising/children-and-teens) covers the age rules, which can turn an opt-out regime into an opt-in one.

The result is the request's `us_opt_outs` (`sale`, `sharing`, `targeted_advertising`) and its effect on `ads_mode`: any of them makes the request at most `non_personalized` for parties that would receive the data as a sale or share, with a reason code. The per-recipient question follows: a party the business discloses to as a **service provider** or **contractor** under a contract with the required terms (Google with RDP, Meta with LDU, an MSPA signatory in service provider terms) may still receive data to deliver and measure the ad, restricted to those purposes; a **third party** may not receive it at all for an opted-out person.

```go tab="Go"
// StateSection is a decoded US state or usnat section; 0 = not applicable,
// 1 = opted out, 2 = did not opt out (the GPP encoding for opt-out fields).
type StateSection struct {
	SaleOptOut, SharingOptOut, TargetedAdvertisingOptOut, MspaOptOut int
	HasGPCSubsection, GPC                                            bool
}

type USSignals struct {
	Section        *StateSection // the section gpp_sid names, nil if none
	HeaderGPC      bool          // Sec-GPC: 1 or navigator.globalPrivacyControl
	HonorsGPC      bool          // from the jurisdiction rules in force
	PersistentOpts []string      // from opt_out_records for this browser, device or account
}

// OptOuts returns the request's opt-outs, sorted, without duplicates.
func OptOuts(s USSignals) []string {
	set := map[string]bool{}
	if sec := s.Section; sec != nil {
		if sec.SaleOptOut == 1 {
			set["sale"] = true
		}
		if sec.SharingOptOut == 1 {
			set["sharing"] = true
		}
		if sec.TargetedAdvertisingOptOut == 1 || sec.MspaOptOut == 1 {
			set["targeted_advertising"] = true
		}
	}
	gpc := s.HeaderGPC || (s.Section != nil && s.Section.HasGPCSubsection && s.Section.GPC)
	if gpc && s.HonorsGPC {
		set["sale"], set["sharing"] = true, true
	}
	for _, o := range s.PersistentOpts {
		set[o] = true
	}
	out := make([]string, 0, len(set))
	for _, k := range []string{"sale", "sharing", "targeted_advertising"} {
		if set[k] {
			out = append(out, k)
		}
	}
	return out
}

// MaySendPersonalData decides one recipient: third parties get nothing personal
// once any opt-out applies; service providers get it for delivery and measurement only.
func MaySendPersonalData(optOuts []string, recipientRole string) bool {
	return len(optOuts) == 0 || recipientRole == "service_provider" || recipientRole == "contractor"
}
```

```rust tab="Rust"
/// A decoded US state or usnat section; 0 = not applicable, 1 = opted out, 2 = did not opt out.
pub struct StateSection {
    pub sale_opt_out: u8,
    pub sharing_opt_out: u8,
    pub targeted_advertising_opt_out: u8,
    pub mspa_opt_out: u8,
    pub gpc: Option<bool>, // None when the section has no GPC subsection
}

pub struct UsSignals<'a> {
    pub section: Option<&'a StateSection>, // the section gpp_sid names
    pub header_gpc: bool,                  // Sec-GPC: 1 or navigator.globalPrivacyControl
    pub honors_gpc: bool,                  // from the jurisdiction rules in force
    pub persistent: &'a [&'a str],         // from opt_out_records
}

/// Returns the request's opt-outs in a fixed order, without duplicates.
pub fn opt_outs(s: &UsSignals) -> Vec<&'static str> {
    let (mut sale, mut sharing, mut targeted) = (false, false, false);
    if let Some(sec) = s.section {
        sale |= sec.sale_opt_out == 1;
        sharing |= sec.sharing_opt_out == 1;
        targeted |= sec.targeted_advertising_opt_out == 1 || sec.mspa_opt_out == 1;
    }
    let gpc = s.header_gpc || s.section.and_then(|sec| sec.gpc).unwrap_or(false);
    if gpc && s.honors_gpc {
        sale = true;
        sharing = true;
    }
    for o in s.persistent {
        match *o {
            "sale" => sale = true,
            "sharing" => sharing = true,
            "targeted_advertising" => targeted = true,
            _ => {}
        }
    }
    [("sale", sale), ("sharing", sharing), ("targeted_advertising", targeted)]
        .into_iter().filter(|(_, on)| *on).map(|(k, _)| k).collect()
}

/// Third parties get nothing personal once any opt-out applies;
/// service providers and contractors get it for delivery and measurement only.
pub fn may_send_personal_data(opt_outs: &[&str], recipient_role: &str) -> bool {
    opt_outs.is_empty() || matches!(recipient_role, "service_provider" | "contractor")
}
```

Two simplifications are deliberate. Whether a given state's law treats an opt-out of sharing and an opt-out of targeted advertising as the same thing is a legal mapping that belongs in the jurisdiction rules, not in this function; the function only unions what the signals say. And "service provider" is a fact about a contract, which is why the role comes from `privacy_agreements` rather than from the recipient's own claim.

## Propagating Opt-Outs Through the Chain

An opt-out has to reach every party that would otherwise sell, share or target with the data. Four channels do that, and a complete system uses all of them:

- **In the request.** The GPP string in `regs.gpp`, with `gpp_sid`, from the first hop to the last. The first party (the publisher, or its ad server) writes GPC and any persistent opt-out it holds into the string, because downstream parties can't see either. An intermediary passes the string unchanged; rewriting it to remove an opt-out is the failure regulators look for.
- **In the request's shape.** An exchange strips identifiers (`user.eids`, `user.buyeruid`, `device.ifa`) and precise geolocation for bidders that would receive them as a third party, and records what it removed (`bid_requests.fields_removed`, from [How Programmatic Works](/books/advertising/how-programmatic-works)). A bidder that never receives the identifier can't misuse it.
- **In the tags.** The same decision sets Google's `restrictDataProcessing`, Meta's `dataProcessingOptions` and any other platform's flag on the page, and gates any pixel that would send data to a party without a service provider contract ([Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks)).
- **Out of band.** A persistent opt-out (a form, an app toggle, an authorized agent's request) is attached to an account or device, and the parties the business already sold or shared that person's data with have to be told. The CCPA regulations (section 7026(f)) require a business to stop selling and sharing "as soon as feasibly possible, but no later than 15 business days", and to notify "all third parties to whom the business has sold or shared the consumer's personal information, after the consumer submits the request to opt-out of sale/sharing and before the business complies", directing them to comply and to forward the request onward. Their own illustration is ad tech: a business whose site "instantaneously sells and shares personal information of consumers viewing its website through real-time bidding" can stop instantly, and so "shall not take 15 business days". In ad tech that is an API call or a file to each partner (a DSP's audience platform, a data partner's suppression list), and the record that it was sent.

What the California enforcement record says about each channel:

| Order | Channel that failed |
| --- | --- |
| **Sephora** (Attorney General, 2022, $1.2 million) | Tags: third-party trackers treated as a sale, GPC not honored |
| **Honda** (CPPA, 2025, $632,500) | Out of band: excessive verification for opt-outs, barriers for authorized agents; ad tech sharing without the required contracts |
| **Todd Snyder** (CPPA, 2025, $345,178) | Out of band: a misconfigured privacy portal left opt-outs unprocessed for 40 days; "Using a consent management platform doesn't get you off the hook" |
| **Healthline** (Attorney General, 2025, $1.55 million) | Tags: a banner that didn't disable trackers, no working opt-out of targeted advertising |
| **Sling TV** (Attorney General, 2025, $530,000) | Apps: no opt-out "within its apps" on a streaming service |
| **Lyft** (Attorney General, $1.8 million; the enforcement page gives no date) | Apps: no "native in-app opt-out" |
| **Disney** (Attorney General, 2026, $2.75 million) | Profiles: opt-outs not applied across Disney+, Hulu and ESPN+ accounts and linked devices |

The pattern is that the opt-out existed somewhere and didn't reach the processing. The architecture lesson is the same as for consent: one decision, made once, read everywhere, with the persistent opt-outs looked up on every request by every identifier the request carries.

**Timing.** The 15 business days are a ceiling, not a target: for a real-time bidding system the regulation's own example says immediately. The playbook's page notes the 12-month wait before asking someone who opted out to opt back in. A signal in a request is effective for that request; a persistent opt-out is effective from when it's recorded, and the notification duty covers the partners who received the data in between.

## How to Build It

The request gets the US fields beside the TCF fields from [Consent Management & the TCF](/books/advertising/consent-and-the-tcf), and two tables hold the opt-outs that outlive a request: the opt-out itself, keyed by whatever identifies the person, and each delivery of it to a partner.

```sql
ALTER TABLE ad_requests
  ADD COLUMN us_privacy           TEXT,          -- legacy regs.us_privacy, as received
  ADD COLUMN gpp_section_applied  SMALLINT,      -- the section the decision used
  ADD COLUMN gpp_section_source   TEXT,          -- 'gpp_sid' or 'geo_fallback'
  ADD COLUMN us_opt_outs          TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN mspa_version         SMALLINT,      -- usnat MspaVersion
  ADD COLUMN mspa_signatory_id    INT;           -- usnat MspaId, if on the identification list
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_us_opt_outs_check
  CHECK (us_opt_outs <@ ARRAY['sale', 'sharing', 'targeted_advertising']::TEXT[]) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_gpp_section_source_check
  CHECK (gpp_section_source IN ('gpp_sid', 'geo_fallback')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_opt_out_mode_check
  CHECK (cardinality(us_opt_outs) = 0 OR ads_mode IS DISTINCT FROM 'personalized') NOT VALID;

CREATE TABLE opt_out_records (            -- an opt-out that outlives one request
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  holder_org_id      UUID NOT NULL REFERENCES organizations (id),  -- whose system received it
  subject_kind       TEXT NOT NULL CHECK (subject_kind IN ('browser_id', 'device_ad_id',
                       'account', 'hashed_email', 'hashed_phone', 'household')),
  subject_key        BYTEA NOT NULL,      -- keyed hash of the identifier; never the raw value
  scopes             TEXT[] NOT NULL CHECK (scopes <@ ARRAY['sale', 'sharing',
                       'targeted_advertising', 'sensitive_data_use', 'profiling']::TEXT[]
                       AND cardinality(scopes) > 0),
  source             TEXT NOT NULL CHECK (source IN ('gpc', 'gpp_string', 'web_form',
                       'in_app_setting', 'authorized_agent', 'partner_notice', 'platform_api')),
  jurisdiction       TEXT,                -- e.g. 'US-CA'; null when honored everywhere
  linked_to_id       UUID REFERENCES opt_out_records (id),  -- the record this one was copied from
  received_at        TIMESTAMPTZ NOT NULL,
  effective_at       TIMESTAMPTZ NOT NULL,  -- when processing stopped
  partners_due_at    TIMESTAMPTZ,          -- deadline to notify parties already given the data
  withdrawn_at       TIMESTAMPTZ,          -- the person opted back in, with its evidence
  evidence_ref       TEXT NOT NULL,        -- request log, form submission or agent authorization
  CHECK (effective_at >= received_at),
  CHECK (withdrawn_at IS NULL OR withdrawn_at > effective_at)
);
CREATE INDEX opt_out_records_subject_idx
  ON opt_out_records (subject_kind, subject_key) WHERE withdrawn_at IS NULL;

CREATE TABLE opt_out_deliveries (         -- one partner told about one opt-out
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  opt_out_record_id  UUID NOT NULL REFERENCES opt_out_records (id),
  recipient_org_id   UUID NOT NULL REFERENCES organizations (id),
  method             TEXT NOT NULL CHECK (method IN ('api', 'file', 'platform_flag',
                       'deletion_request', 'email')),
  sent_at            TIMESTAMPTZ NOT NULL,
  acknowledged_at    TIMESTAMPTZ,
  partner_ref        TEXT,                -- the partner's job or ticket ID
  status             TEXT NOT NULL CHECK (status IN ('sent', 'acknowledged', 'failed',
                       'not_required')),
  UNIQUE (opt_out_record_id, recipient_org_id)
);
```

Design notes:

- **The opt-out is keyed the way the request is.** A browser's opt-out is found by its cookie ID, an app's by its device ID, an account's by the account; `linked_to_id` copies an opt-out from a browser to the account it logs into and from the account to its other devices, which is the Disney order's lesson. Identity stitching that can merge profiles for targeting can merge them for opt-outs too, and has to.
- **Keys are keyed hashes.** `subject_key` is an HMAC of the identifier with a key held outside the analytics domain, so the opt-out table can be joined to requests without becoming a list of identifiers, and survives the identifier's deletion ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **GPC becomes a record when it can be attached.** A GPC header on a logged-out browser is honored on the request; when the browser logs in or a stable ID is set, the edge writes an `opt_out_records` row with `source = 'gpc'`, because the regulation applies it to the associated profile, not only the session.
- **The request check reads both.** The edge computes `us_opt_outs` from the string, the header and an `opt_out_records` lookup by every identifier on the request, and the check constraint refuses a `personalized` request that carries an opt-out.
- **Deliveries are idempotent per partner.** One row per opt-out and recipient, retried until acknowledged or marked failed and escalated; `partners_due_at` is when the last delivery must be done.
- **Withdrawal is a new fact, not a delete.** Opting back in sets `withdrawn_at` with its evidence; the history of the opt-out stays, because the question later is what the system did while it was in force.
- **Platform flags follow the decision.** `restrictDataProcessing`, `dataProcessingOptions` and their equivalents are set by the tag from the same `us_opt_outs`, so the walled gardens' modes and the open web's strings never disagree.

Opt-outs whose partner deliveries are late, the queue the Todd Snyder order is about:

```sql
SELECT o.id, o.source, o.jurisdiction, o.partners_due_at,
       count(d.id) FILTER (WHERE d.status = 'acknowledged')       AS acknowledged,
       count(d.id) FILTER (WHERE d.status IN ('sent', 'failed'))  AS outstanding
FROM opt_out_records o
LEFT JOIN opt_out_deliveries d ON d.opt_out_record_id = o.id
WHERE o.withdrawn_at IS NULL
  AND o.partners_due_at < now()
GROUP BY o.id
HAVING count(d.id) FILTER (WHERE d.status IN ('sent', 'failed')) > 0
    OR count(d.id) = 0;
```

The share of US requests carrying GPC and the share where it was converted into the outgoing string, per ad unit ([How Programmatic Works](/books/advertising/how-programmatic-works) adds `entry_point`, the better grouping once it exists); a gap means GPC is honored at the edge and lost downstream:

```sql
SELECT r.ad_unit_id,
       count(*) FILTER (WHERE r.gpc)                                             AS gpc_requests,
       count(*) FILTER (WHERE r.gpc AND 'sale' = ANY (r.us_opt_outs))            AS gpc_applied,
       count(*) FILTER (WHERE r.gpc AND r.gpp_string IS NULL)                    AS gpc_without_string
FROM ad_requests r
WHERE r.country = 'US' AND r.received_at >= now() - interval '1 day'
GROUP BY r.ad_unit_id;
```

## Auditing

- **What each request said and what was decided.** The GPP string, `gpp_sid`, the section applied and how it was chosen, GPC, the legacy `us_privacy` value, the MSPA version and signatory, the resulting opt-outs, and the rule version that decided.
- **What each partner received.** Per callout, whether personal data was sent and the basis (`us_not_opted_out` or `service_provider`), and the fields removed for everyone else.
- **Every persistent opt-out and where it went.** The opt-out, its source and evidence, when it took effect, every profile it was linked to, and every partner delivery with its acknowledgment.
- **What the tags were set to.** For each property and period, the platform flags the page set from the decision, so "did the Meta pixel run in LDU for opted-out California visitors?" is answerable.
- **Sweeps and tests.** Periodic synthetic visits with GPC on, with each state's section set, and with an opt-out on file, checking that the outgoing requests, tags and partner calls behave; the CPPA's 2025 sweep is the same test run from the outside.

## What This Means for the System You Build

- **Read the section `gpp_sid` names,** fall back to coarse geolocation only when it's missing, and record which you used.
- **Decode sections by field name,** because the same bits mean opt-out in one state's section and refused consent in another's.
- **Convert GPC into the string at the first hop,** and attach it to the profile once the browser is identifiable.
- **Look up persistent opt-outs on every request,** by every identifier the request carries, and link them across the person's devices and accounts.
- **Decide per recipient by contract role,** service provider or third party, from the agreement on file, and strip identifiers for third parties.
- **Set every platform's restricted mode from the same decision,** so Google's RDP, Meta's LDU and the GPP string agree.
- **Tell the partners who already have the data,** idempotently, with a deadline and an acknowledgment.
- **Expect the MSPA and GPP to change,** and keep their versions on the request and their rules as data.

## References

**Specifications**

- [IAB Tech Lab: GPP Consent String Specification](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/Consent%20String%20Specification.md), header and sections, tilde delimiter, the `${GPP_STRING_XXXXX}` and `${GPP_SID}` macros, the example string
- [IAB Tech Lab: GPP Section Information](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/Section%20Information.md), section IDs and the deprecated sections
- [IAB Tech Lab: MSPA US National Technical Specification](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/US-National/IAB%20Privacy%E2%80%99s%20Multi-State%20Privacy%20Agreement%20(MSPA)%20US%20National%20Technical%20Specification.md), version 3.0 fields, the GPC subsection, signatory coverage and the version history
- [IAB Tech Lab: GPP Extension, California Privacy Technical Specification](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/US-States/CA/GPP%20Extension:%20California%20Privacy%20Technical%20Specification.md), `usca` fields, encodings and the fixed MSPA fields
- [IAB Tech Lab: GPP Extension, Virginia Privacy Technical Specification](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/US-States/VA/GPP%20Extension:%20Virginia%20Privacy%20Technical%20Specification.md), `usva` fields and the consent encoding for sensitive data
- [IAB Tech Lab: Global Privacy Protocol](https://iabtechlab.com/gpp/), the rename, version history and the August 2026 update's comment period
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), `regs.gpp`, `regs.gpp_sid` and `regs.us_privacy`
- [W3C: Global Privacy Control](https://w3c.github.io/gpc/), the `Sec-GPC` header, `navigator.globalPrivacyControl` and `gpc.json`

**Regulation**

- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), GPC as a valid opt-out request, sharing for cross-context behavioral advertising
- [CPPA: CCPA Regulations (effective January 1, 2026)](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf), section 7026(f): the 15 business day ceiling, notifying third parties, and the real-time bidding example
- [California Attorney General: Privacy enforcement actions](https://oag.ca.gov/privacy/privacy-enforcement-actions), the Sling TV, Lyft and Disney settlements
- [California Attorney General: Sephora settlement (August 24, 2022)](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-settlement-sephora-part-ongoing-enforcement), trackers as a sale and GPC not honored
- [California Attorney General: Healthline settlement (July 1, 2025)](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-largest-ccpa-settlement-date-secures-155), the failed opt-out of targeted advertising, including through GPC, and the banner that didn't disable trackers
- [CPPA: Honda settlement (March 12, 2025)](https://cppa.ca.gov/announcements/2025/20250312.html), verification, authorized agents and missing contracts
- [CPPA: Todd Snyder order (May 6, 2025)](https://cppa.ca.gov/announcements/2025/20250506.html), the 40 days of unprocessed opt-outs
- [CPPA: Tractor Supply order (September 30, 2025)](https://cppa.ca.gov/announcements/2025/20250930.html), no effective opt-out including GPC
- [CPPA: Joint investigative privacy sweep (September 9, 2025)](https://cppa.ca.gov/announcements/2025/20250909.html), the GPC sweep with California, Colorado and Connecticut
- [CPPA: Governor signs the Opt Me Out Act (October 8, 2025)](https://cppa.ca.gov/announcements/2025/20251008_2.html), AB 566's browser requirement and its January 2027 start

**Reference**

- [IAB Privacy: Multi-State Privacy Agreement](https://www.iabprivacy.com/), the springing contract and the dates of the Fourth, Fifth and Sixth amended versions
- [Global Privacy Control](https://globalprivacycontrol.org/), the 2020 introduction and the 2024 W3C work item

**In practice**

- [Google Ad Manager Help: Restricted data processing in Google's publisher ad tags](https://support.google.com/admanager/answer/9598414?hl=en), how to set RDP and what Google does under it
- [Meta for Developers: Data Processing Options](https://developers.facebook.com/docs/marketing-apis/data-processing-options), Limited Data Use, its parameters and the states it covers
- [Prebid: GPP Control, US National](https://docs.prebid.org/dev-docs/modules/gppControl_usnat.html), the activity controls, configuration and the separate US State module
- [Prebid: US Compliance Support](https://docs.prebid.org/features/mspa-usnat.html), the default activities suppressed on an opt-out (user syncs, EIDs, first-party data, precise geolocation)
