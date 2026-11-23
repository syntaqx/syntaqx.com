+++
title = "Identifiers After Cookies"
description = "UID2, EUID, RampID, ID5, ConnectID, SharedID and PPID: how each is made, carried in OpenRTB eids, refreshed and opted out of, and how to measure match rates."
category = "Advertising Industry"
order = 2927
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "identity", "openrtb", "privacy", "data-model"]
+++

An advertising identifier is a value a buyer can use to recognize the same person or device across requests: to cap frequency, to find a retargeting audience, to match an impression to a conversion. The third-party cookie was the default identifier on the web and still is in Chrome, but in Safari and Firefox it is gone or scoped to one site ([Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy)). What replaced it is not one identifier but a family: IDs derived from a hashed email or phone a user gave a publisher (UID2, EUID, RampID, ConnectID), IDs a vendor maintains from first-party cookies and other signals (ID5), first-party IDs a publisher sets for itself (SharedID, a publisher-provided ID such as Google's PPID), and the advertising IDs of apps and TVs ([Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att)).

It is hard because each identifier has its own rules for how it is made, who may hold the raw form and who sees only an encrypted token, how often it rotates, how an opt-out reaches everyone holding it, and which regions and consent states it may be used in. A bid request can carry five of them at once in `user.eids`, each from a different provider, inserted by a different party and matched a different way, and a bidder that treats them as interchangeable strings breaks frequency caps, leaks opted-out users back into targeting, or counts one person five times.

This chapter covers the identifier types and how they are built, the deterministic email-based IDs (UID2 and EUID in depth, RampID, ConnectID), the vendor and publisher IDs (ID5, SharedID, PPID), how all of them travel in OpenRTB's extended identifiers, normalization and hashing, token refresh and salt rotation, opt-outs, and what a "match rate" means and how to measure it honestly. It extends `ad_requests` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the `bid_requests` callout table that [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) adds. The sync table for cookie IDs is [How Programmatic Works](/books/advertising/how-programmatic-works#cookie-syncing-and-matching-identifiers); the browsers are Third-Party Cookies & Browser Privacy; the advertiser's own customer lists are [First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences); device advertising IDs in apps and CTV are Mobile Ad IDs, ATT & SKAdNetwork; the consent signals that decide whether any ID may be sent are [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) and [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs). The generic rule that a hashed identifier is still personal data is [Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous).

## How the Platforms Do It

As of November 2026, from each provider's documentation and Prebid.org's module pages.

| Identifier | Provider | Built from | Form in the bid request | Opt-out |
| --- | --- | --- | --- | --- |
| **ConnectID** | Yahoo | A hashed email (`he`, SHA-256 of the lowercased address) or a publisher user ID, with a `pixelId` unless an endpoint is set | EID source `yahoo.com` | ConnectID Control Portal, Yahoo Privacy Dashboard, NAI |
| **EUID** | European Unified ID, built on UID2 with a separate namespace | Email or phone, with consent under GDPR and the TCF | Encrypted token, as UID2 | EUID's own, separate from UID2's |
| **ID5 ID** | ID5 | ID5's own resolution, called with a partner number (free registration) | EID source `id5-sync.com`, `atype` 1; encrypted with a rotating key; value "0" without consent or after opt-out | Honored at the source: the value becomes "0" |
| **PPID** | The publisher, sent to Google Ad Manager | The publisher's own user ID, hashed or encrypted, 22 to 150 characters | Sent to Google demand as per-publisher partitioned IDs; to third-party buyers as sent, outside the EEA, Switzerland, the UK and certain US states | Stop sending "immediately" on opt-out or account deletion |
| **RampID** | LiveRamp | Identifiers matched to LiveRamp's people-based graph, in maintained, derived, placeholder and household forms | EID source `liveramp.com` (Prebid `idl_env`) | LiveRamp's own, by device or by email; mapping files then return RampID "0" |
| **SharedID** | Prebid.org | A UUID in the publisher's first-party cookie | EID source `sharedid.org` | Prebid's opt-out keys |
| **UID2** | Unified ID 2.0, administered with The Trade Desk running its core services | A normalized, SHA-256 hashed email or phone | Encrypted UID2 token, decrypted by DSPs at bid time | Transparency and Control Portal; DSPs receive opt-outs by webhook and status API |

Three patterns run through the table:

- **Deterministic IDs start with something the user typed.** UID2, EUID, RampID and ConnectID exist only for users who gave a publisher an email or phone, usually by logging in; coverage follows authentication, not browsing, and is highest on publishers with accounts.
- **What travels is not what is stored.** UID2 sends an encrypted token that only authorized decrypters can read; ID5 encrypts with a rotating key; Google partitions PPIDs per publisher for its own demand. A bidder that logs the token string as an ID learns nothing durable, by design.
- **The opt-out is part of the identifier.** Every provider runs its own opt-out channel, and every holder downstream has to honor it; a site's own opt-out is not, by itself, an opt-out of the provider's ID (UID2 says so explicitly).

## Identifier Types

AdCOM, the shared vocabulary OpenRTB 2.6 uses, sorts identifiers by agent type and by how they were matched, and both are worth keeping as data from the start.

**Agent types** (`atype`): 1 is a browser or device ID (a cookie or a probabilistic ID), 2 an in-app device ID, 3 a person-based ID that is "same across devices". OpenRTB 2.6 calls setting `atype` "highly recommended", because "many DSPs separate app-native IDs from browser-based IDs". UID2 and RampID are person-based by construction; ID5 is declared as type 1 in Prebid's module; an IDFA or Android Advertising ID is type 2.

**Match methods** (`mm`): 0 unknown, 1 no match, 2 browser cookie sync, 3 authenticated, 4 observed, 5 inference, and 500 and above for vendor-specific methods. An ID derived from a logged-in user's email is authenticated; an ID from a cookie sync is a cookie sync; an ID a graph vendor attached because the IP and user agent resembled a known device is an inference. Two IDs from the same provider can carry very different confidence depending on `mm`.

**Deterministic and probabilistic.** A deterministic ID is the same output for the same input, every time: the same normalized email always hashes to the same value, and the same raw UID2 follows from it until the salt rotates. A probabilistic ID is a vendor's estimate that two signals belong to one browser or household, from IP addresses, user agents, timestamps and observed co-occurrence. Probabilistic matching is what identity graphs sell for reach; it is also the inference regulators look at hardest, and the reason `mm` exists.

**Raw, hashed, encrypted.** An email is personal data; its SHA-256 hash is still personal data, because anyone holding the same email can compute the same hash and join on it; a raw UID2 is a salted hash that only the UID2 service can compute; a UID2 token is an encrypted raw UID2 that only authorized parties can decrypt. Each step narrows who can join, none of them makes the data anonymous, and the system has to know which form it holds.

## UID2 and EUID

Unified ID 2.0 describes itself as "a framework that enables deterministic identity for advertising opportunities on the open internet" and says the framework "does not have centralized storage for personal data". It is the most fully documented of the email-based identifiers, and its mechanics are the reference for the others.

**The inputs.** A publisher, advertiser or data provider normalizes an email or phone and hashes it. Emails are trimmed and lowercased; for `gmail.com` only, dots before the `@` are removed and anything from a `+` to the `@` is stripped, while other domains keep both. Phones are E.164: a `+`, the country code, the number, at most 15 digits, punctuation removed and a leading trunk zero dropped. The hash is SHA-256 of the normalized string, and the value sent is the Base64 of the 32 raw hash bytes, 44 characters: "Base64 encoding is applied to the bytes of the hash value, not the hex-encoded string." A hex hash Base64-encoded is the most common integration bug, and it produces a well-formed value that matches nobody.

**Raw UID2 and UID2 token.** The raw UID2 is the input hashed and then hashed again with a secret salt: "an unencrypted alphanumeric identifier" that "can be stored by advertisers, third-party data providers, and demand-side platforms (DSPs)" and is not shared in the bidstream. The UID2 token is "an encrypted form of a raw UID2", "designed to be used by publishers or publisher service providers"; SSPs pass tokens in the bidstream and "DSPs decrypt them at bid request time." Both are case sensitive. So the publisher never holds the raw UID2, the advertiser never holds a token, and a DSP joins the two by decrypting the token to the raw UID2 its advertisers' audiences are keyed on.

**Generating and refreshing tokens.** A publisher calls `POST /token/generate` from its server (the API key must stay secret) with exactly one of `email`, `email_hash`, `phone` or `phone_hash`. A success returns an `advertising_token`, a `refresh_token`, and three millisecond timestamps: `identity_expires`, `refresh_from` and `refresh_expires`. If the user has opted out, the status is `optout` and no tokens come back. UID2's documentation gives no fixed lifetimes and says they can change, so a client reads them from each response rather than assuming them. Client-side generation exists for web and mobile, using a public key and subscription ID instead of the secret. In Prebid, the UID2 module "automatically refreshes the token periodically, as long as the refresh token hasn't expired" when given the full token object, and makes no refresh attempt when given only a server-set value.

**Salt rotation.** The salt behind each raw UID2 rotates in buckets. An advertiser or data provider maps its hashed emails to raw UID2s with `POST /v3/identity/map`, which returns the current raw UID2 (`u`), the previous one if it rotated in the last 90 days (`p`), and a refresh timestamp (`r`); UID2 says "only about 1/365th of UID2s need to be updated daily", which implies roughly annual rotation per bucket. Requests are limited to 1 MB and 5,000 items, with about 20 in parallel; opted-out inputs come back as `optout`. An audience keyed on raw UID2s therefore decays unless it is remapped on schedule, and the previous value lets a holder bridge history across a rotation.

**Operators.** UID2's components are a Core Service (salts and keys), Operator Service, Opt-Out Service and the Transparency and Control Portal, "all of which are currently managed by The Trade Desk". A public operator is available to all participants and run by UID2 administration; a private operator is run by a participant for its own use; UID2 recommends public for most.

**Opt-out.** A consumer opts out at the Transparency and Control Portal. From then, token generation and refresh return the opt-out response, so publishers stop sending tokens, and DSPs learn of opt-outs by webhook and through `POST /optout/status`. A site-level opt-out is not a UID2 opt-out. UID2 states no propagation SLA; opt-outs reach publishers through the next refresh, so a token in flight can outlive an opt-out by up to its remaining lifetime, and a DSP must check before using raw UID2s from advertisers' audiences.

**EUID.** European Unified ID is built on UID2 but in a separate namespace: UID2's legal basis is framed by US law (CCPA/CPRA), EUID's by GDPR, the TCF and local guidance, and EUID is designed for "many European countries and some other regions such as the UK". An EUID is not a UID2 and the two do not join; a platform operating in both regions treats them as two sources.

## Other Email-Based and Graph IDs

**RampID (LiveRamp).** LiveRamp's people-based identifier comes in typed forms recognizable by prefix: a maintained RampID (`XY`, 49 characters) for a known individual in LiveRamp's graph, a derived RampID (`Xi`, 70 characters) built from an identifier LiveRamp could not match, placeholder forms for a cookie (`Xc`) or mobile device (`Xm`), and a household ID (`hY`). In the browser, Prebid's module for it reads the value as `idl_env` and sends it with EID source `liveramp.com`. A maintained and a derived RampID for the same person are different strings, which matters for any table that counts unique people.

**ConnectID (Yahoo).** In Prebid, Yahoo's module takes an optional `he` (the SHA-256 of the lowercased email), an optional `puid` (a publisher user ID) and a `pixelId` (required unless a custom endpoint is set), and sends EID source `yahoo.com`. Opt-out runs through the ConnectID Control Portal, the Yahoo Privacy Dashboard and the NAI. Note the normalization differs from UID2's: lowercased, without UID2's Gmail rules, so the same address hashed for UID2 and for ConnectID can differ, and each integration must follow its provider's rule.

**ID5.** ID5's Prebid module requires a `partner` number, obtained by free registration, and sends EID source `id5-sync.com` with `atype` 1. The ID is encrypted with a rotating key, its stored value should be refreshed at 7,200 seconds or less, and it is "0" when there is no consent or the user opted out. ID5 is the provider's own identifier, resolved by ID5 rather than derived from one login, which is why its value to a buyer depends on ID5's resolution and why the `0` sentinel has to be read as "no ID", not as an ID.

## Publisher-Provided IDs

A publisher can also send its own identifier: the user's account ID, hashed or encrypted, or a first-party cookie ID.

**PPID in Google Ad Manager.** A publisher provided identifier must be hashed or encrypted, "must not be raw personally identifiable information", and be 22 to 150 characters. It becomes invalid after 180 days with no ad request, and the publisher must stop sending it "immediately" on opt-out or account deletion. PPID is an Ad Manager 360 feature. When the publisher enables it for programmatic demand, Google demand receives per-publisher partitioned IDs and third-party buyers receive the PPID as sent; non-Google sharing is not available in the EEA, Switzerland, the UK and certain US states with comprehensive privacy laws. A PPID gives frequency capping and audience segments within one publisher's inventory; it is not a cross-publisher ID unless the publisher's buyers have their own way to resolve it.

**SharedID.** Prebid's SharedID module "stores an unique user id in the first party domain and makes it accessible to all adapters", a UUID like an IDFA in form, which survives ITP's third-party rules because it is first-party (and is subject to ITP's limits on script-written storage when set from JavaScript; the module's server options, such as `pixelUrl`, let the publisher's server set it instead). It is a per-publisher ID with EID source `sharedid.org`.

**Prebid's user ID module** ties these together on the page: each submodule is configured under `userSync.userIds` with a name, parameters, storage (`cookie`, `html5` or both, an `expires` in days that Prebid strongly recommends, and `refreshInSeconds`), and an optional `bidders` list that limits which bidders receive that ID, since by default every ID goes to every bidder. Consent gates it: with no consent string, or without TCF Purpose 1 consent for storage, calls to ID vendors are not made and "Nothing is stored to cookies or HTML5 local storage"; since Prebid.js 11.14, a failed TCF or GPP CMP lookup stops submodules from running (a CMP timeout does not); and any change to TCF, GPP, USP or COPPA data refreshes all submodules. Users can opt out through the `_pbjs_id_optout` or `_pubcid_optout` keys.

## Extended Identifiers in OpenRTB

All of these reach a bidder in the same structure, `user.eids`: an array of EID objects, each with a `source` ("Canonical domain of the ID"), a `uids` array of `{id, atype}` objects, and since 2.6-202409 an `inserter` (the canonical domain of the party that added the EID to the request), a `matcher` (who performed the match) and `mm` (the match method). A request from a logged-in Safari user might carry:

```json
{
  "user": {
    "eids": [
      {"source": "uidapi.com", "inserter": "ssp.example", "matcher": "uidapi.com", "mm": 3,
       "uids": [{"id": "A4AAAABlh75XmviGJi-hkLGII5L6...", "atype": 3}]},
      {"source": "liveramp.com", "inserter": "ssp.example", "mm": 3,
       "uids": [{"id": "AjfowMv4ZHZQJFM8TpiUnYEyA81Vdg...", "atype": 3}]},
      {"source": "id5-sync.com", "inserter": "ssp.example", "mm": 5,
       "uids": [{"id": "ID5*xz4Q9yt...", "atype": 1}]},
      {"source": "sharedid.org", "inserter": "pub.example", "mm": 4,
       "uids": [{"id": "3e1c5a3a-0f2b-4b1e-9b47-8f1f2f1e6a21", "atype": 1}]}
    ]
  }
}
```

The rules a seller and a buyer follow:

- **Shape per bidder.** Which EIDs a bidder receives depends on that bidder's consent status under the TCF, on US opt-outs of sale or sharing, on the provider's own rules (Google's PPID restrictions by region, UID2's participant agreements) and on the publisher's `bidders` restrictions. The callout record from [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) already keeps `fields_removed` per bidder; this chapter adds which EID sources were sent.
- **Validate the source.** A bidder keeps a registry of sources it recognizes, with the expected `atype` and form, and treats an unknown source or a malformed ID as absent; it never creates a profile on a token it cannot decrypt.
- **Keep `atype` apart.** A person-based ID and a browser ID with the same string are different identifiers; an app device ID never joins a browser profile through `user.eids`.
- **Record `inserter` and `mm`.** Two copies of the same UID2 inserted by two SSPs are the same user; an ID5 attached by inference and a UID2 from authentication are not the same confidence, and frequency and attribution logic may treat them differently.

## Normalization and Hashing

Every email-based ID depends on two parties computing the same bytes from the same address. The UID2 rules, which other providers' rules overlap with but do not equal, as reference code:

```go tab="Go"
// NormalizeEmailUID2 applies UID2's documented email normalization.
func NormalizeEmailUID2(raw string) (string, error) {
	e := strings.ToLower(strings.TrimSpace(raw))
	at := strings.LastIndexByte(e, '@')
	if at <= 0 || at == len(e)-1 {
		return "", errors.New("not an email address")
	}
	local, domain := e[:at], e[at+1:]
	if domain == "gmail.com" { // only gmail.com: drop dots and +suffix
		if i := strings.IndexByte(local, '+'); i >= 0 {
			local = local[:i]
		}
		local = strings.ReplaceAll(local, ".", "")
	}
	return local + "@" + domain, nil
}

// HashForUID2 returns Base64 of the raw SHA-256 bytes: 44 characters.
// Not Base64 of the hex string, which is the common bug.
func HashForUID2(normalized string) string {
	sum := sha256.Sum256([]byte(normalized))
	return base64.StdEncoding.EncodeToString(sum[:])
}
```

```rust tab="Rust"
use base64::{engine::general_purpose::STANDARD, Engine};
use sha2::{Digest, Sha256};

/// UID2's documented email normalization.
pub fn normalize_email_uid2(raw: &str) -> Result<String, &'static str> {
    let e = raw.trim().to_lowercase();
    let at = e.rfind('@').ok_or("not an email address")?;
    if at == 0 || at == e.len() - 1 {
        return Err("not an email address");
    }
    let (local, domain) = (&e[..at], &e[at + 1..]);
    let local = if domain == "gmail.com" {
        // only gmail.com: drop +suffix and dots
        let base = local.split('+').next().unwrap_or(local);
        base.replace('.', "")
    } else {
        local.to_string()
    };
    Ok(format!("{local}@{domain}"))
}

/// Base64 of the raw SHA-256 bytes: 44 characters, never Base64 of the hex string.
pub fn hash_for_uid2(normalized: &str) -> String {
    STANDARD.encode(Sha256::digest(normalized.as_bytes()))
}
```

My rules for hashing in an identity integration:

- **Normalize per destination.** UID2 removes Gmail dots, Yahoo's module only lowercases, and ad platforms' customer-match rules differ again ([First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences) compares them). Keep one normalizer per destination, versioned, and test it against the provider's published examples.
- **Hash at the edge, once.** The email exists in the account system; everything downstream receives the hash for its destination, and the plaintext never enters ad logs. A hash is still personal data and inherits the email's consent and deletion obligations.
- **Hashes are not secrets.** An unsalted SHA-256 of an email is reversible by anyone with a list of emails; never present one to a regulator or a user as anonymization.

## Match Rates

"Match rate" is the most quoted and least defined number in identity. At least four different ratios go by the name:

| Ratio | Numerator | Denominator | Who reports it |
| --- | --- | --- | --- |
| **Request coverage** | Requests carrying an ID from a source | All requests (per property, browser, channel) | SSPs and publishers |
| **Bidder recognition** | Requests where the bidder resolved the ID to a known user | Requests sent to it with that ID | DSPs |
| **Sync match** | Users with a stored sync pair | Users the sync was attempted on | Exchanges and DSPs ([How Programmatic Works](/books/advertising/how-programmatic-works#cookie-syncing-and-matching-identifiers)) |
| **List match** | Uploaded records matched to platform users | Records uploaded | Ad platforms, onboarders ([First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences)) |

Vendors' published match rates are marketing figures with undisclosed denominators; I have not found a public, methodologically comparable benchmark across identifiers, and the volume cites none. <!-- source-gap: adv-id-match-rate-benchmark | missing | comparable public match rates by identifier and browser | closes with: an IAB Tech Lab, MRC or academic study publishing coverage and recognition rates with a stated denominator | checked: 2026-11-22 --> What a platform can do is compute its own, honestly:

- **Name the ratio and the denominator.** Report coverage and recognition separately, per source, per browser family and channel, per day; never a single blended rate.
- **Count by `mm` and `atype`.** An inference-matched ID inflates coverage without the confidence of an authenticated one.
- **Exclude sentinels and opt-outs.** ID5's "0", UID2's opt-out responses and all-zero device IDs are not IDs; counting them as coverage is a common error.
- **Expect authentication to drive coverage.** Deterministic IDs track the share of logged-in traffic, which is why publishers with registration walls report high coverage and the rest report low coverage regardless of vendor.

## How to Build It

The core model has `ad_requests` with consent signals but no identifiers, which is right: identifiers are many per request, typed, and the most sensitive field in the log. This chapter adds a registry of ID sources, the EIDs on each logged request as their own partitioned rows, the sources each bidder was sent, the opt-outs received from providers, and the daily coverage numbers.

```sql
CREATE TABLE id_sources (                -- an identifier a request can carry, by EID source
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  source_domain     TEXT NOT NULL UNIQUE, -- the OpenRTB eids[].source: 'uidapi.com', 'liveramp.com'
  provider_org_id   UUID NOT NULL REFERENCES organizations (id),
  name              TEXT NOT NULL,        -- 'UID2', 'EUID', 'RampID', 'ID5', 'ConnectID', 'SharedID'
  default_atype     SMALLINT NOT NULL CHECK (default_atype IN (1, 2, 3)),  -- AdCOM agent type
  basis             TEXT NOT NULL CHECK (basis IN ('authenticated_email_phone', 'vendor_graph',
                      'publisher_first_party', 'device_ad_id', 'cookie_sync')),
  bidstream_form    TEXT NOT NULL CHECK (bidstream_form IN ('encrypted_token', 'envelope',
                      'opaque', 'hashed')),
  this_system_role  TEXT NOT NULL CHECK (this_system_role IN ('passes', 'decrypts', 'issues',
                      'ignores')),
  sentinel_values   TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'0'} for ID5: means no ID
  allowed_regions   TEXT[],               -- null: no restriction; e.g. EUID only where GDPR applies
  opt_out_channel   TEXT,                 -- 'webhook', 'status_api', 'refresh_response', 'none'
  terms_ref         TEXT NOT NULL,        -- the participant agreement or terms version
  status            TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired'))
);

CREATE TABLE ad_request_eids (           -- each EID on a logged request; sampled with it
  received_at       TIMESTAMPTZ NOT NULL,
  ad_request_id     UUID NOT NULL,        -- joined by (time, id) like the other logs
  id_source_id      UUID REFERENCES id_sources (id),  -- null: unrecognized source
  source_domain     TEXT NOT NULL,        -- as received, kept even when unrecognized
  atype             SMALLINT,
  match_method      SMALLINT,             -- AdCOM mm: 0-5, 500+
  inserter          TEXT,
  matcher           TEXT,
  uid_key           BYTEA,                -- keyed HMAC of the value; never the value itself
  usable            BOOLEAN NOT NULL,     -- false for sentinels, opt-outs, malformed values
  PRIMARY KEY (received_at, ad_request_id, source_domain, uid_key)
) PARTITION BY RANGE (received_at);      -- hourly; same retention as ad_requests

ALTER TABLE bid_requests
  ADD COLUMN eid_sources_sent TEXT[] NOT NULL DEFAULT '{}';  -- which sources this bidder received

CREATE TABLE id_opt_outs (               -- opt-outs received from identifier providers
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  id_source_id      UUID NOT NULL REFERENCES id_sources (id),
  subject_key       BYTEA NOT NULL,       -- keyed HMAC of the raw ID or hash the provider sent
  provider_opted_out_at TIMESTAMPTZ,      -- the provider's timestamp, if given
  received_via      TEXT NOT NULL CHECK (received_via IN ('webhook', 'status_api',
                      'refresh_response', 'bulk_file')),
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at        TIMESTAMPTZ,          -- when audiences, syncs and profiles were purged
  UNIQUE (id_source_id, subject_key)
);

CREATE TABLE identity_coverage_daily (   -- the honest match rate: named numerator, named denominator
  day               DATE NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  channel           TEXT NOT NULL,        -- 'web', 'app', 'ctv', 'audio', 'dooh'
  browser_family    TEXT NOT NULL DEFAULT 'n/a',  -- from Third-Party Cookies & Browser Privacy
  id_source_id      UUID REFERENCES id_sources (id),  -- null: any usable ID
  match_method      SMALLINT,             -- null: all methods
  requests          BIGINT NOT NULL,
  requests_with_id  BIGINT NOT NULL CHECK (requests_with_id <= requests),
  requests_recognized BIGINT,             -- a bidder's view: resolved to a known profile
  impressions       BIGINT NOT NULL DEFAULT 0,
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (day, property_id, channel, browser_family, id_source_id,
    match_method)
);

-- Index the partitioned log per partition CONCURRENTLY, then attach, as for bid_requests.
CREATE INDEX ad_request_eids_source_idx ON ONLY ad_request_eids (id_source_id, received_at);
```

Coverage per source and browser, the first table anyone asks for after a provider integration:

```sql
SELECT c.day, s.name AS id_source, c.browser_family,
       sum(c.requests_with_id)                                   AS with_id,
       sum(c.requests)                                           AS requests,
       round(100.0 * sum(c.requests_with_id) / nullif(sum(c.requests), 0), 1) AS coverage_pct
FROM identity_coverage_daily c
JOIN id_sources s ON s.id = c.id_source_id
WHERE c.day >= current_date - 14
  AND c.channel = 'web'
  AND c.match_method IS NULL
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;
```

Design notes:

- **Never log the identifier value.** `uid_key` is a keyed HMAC (the key held in a secrets manager and rotated on a schedule), enough to count distinct IDs and to join a provider's opt-out to log rows, useless to anyone who takes the table. A DSP that must keep raw UID2s for audiences keeps them in the audience store under its participant terms, not in request logs.
- **Unknown sources are kept, not trusted.** `source_domain` is stored as received so a new provider shows up in the data; `id_source_id` is null until someone registers it, and nothing targets on an unregistered source.
- **Sentinels are not coverage.** `usable = false` for ID5's "0", opt-out tokens and malformed values; `identity_coverage_daily` counts only usable IDs.
- **An opt-out is a fan-out job.** Applying a row in `id_opt_outs` means removing the subject from audiences ([First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences)), revoking matching `user_id_syncs`, and excluding it from targeting until its log rows age out; `applied_at` records when that finished, and the gap from `received_at` is a metric with an alert ([Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools)).
- **What each bidder received is evidence.** `eid_sources_sent` beside the existing `fields_removed` answers "which vendors received a user's UID2 on this day" without storing the token.
- **The registry is a [crosswalk of external IDs](/docs/building-blocks/record-linkage#crosswalks-of-external-ids), not a merge.** One person may hold a UID2, a RampID and an ID5 ID; a buyer may link them in its own graph under its own terms, but the request log keeps each as its own row, and a link between them is an observation with a source and a confidence, never an overwrite.
- **Rotation is scheduled work.** Audiences keyed on raw UID2s are remapped with `identity/map` before their refresh timestamps; the previous raw UID2 is kept for at most the provider's 90-day bridge and only to connect history.

## Auditing

- **Every EID on every logged request, by source, type and method, without the value.** So coverage, a user's exposure under a given ID and a regulator's question about what was sent can be answered from HMAC keys.
- **What each bidder was sent.** The sources and removed fields per callout, kept as long as consent records are.
- **Every provider opt-out, received and applied.** With both timestamps, so the time to honor an opt-out can be shown per provider.
- **The source registry's history.** When each identifier was enabled, under which participant terms, for which regions, and who approved it.
- **Normalizer versions.** Which normalization and hashing rule produced each outbound hash, so a match-rate drop after a deploy can be traced to a changed rule.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat identifiers as a typed, plural field.** A request carries several IDs, each with a source, agent type, match method and inserter; model them as rows, not as a `user_id` column.
- **Know which form you hold.** Email, hash, raw UID2 and token have different holders and rules; the system should refuse to put a raw UID2 in a bid request or a token in an audience table.
- **Follow each provider's normalization exactly.** UID2's Base64-of-bytes and Gmail rules, Yahoo's lowercase-only hash, each platform's own list rules; version the normalizers and test against published examples.
- **Make opt-outs a measured pipeline.** Receive by webhook or status API, fan out to audiences, syncs and targeting, and alert on the time it takes.
- **Report match rates with their denominators.** Coverage and recognition, per source, browser and channel, excluding sentinels; ignore any single blended number, including your own.
- **Shape the request per bidder and keep the evidence.** Send each bidder only the EIDs its consent, the provider's rules and the publisher's restrictions allow, and record which ones went.
- **Never store identifier values in request logs.** HMAC keys count and join; values leak.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the EID and UID objects, source, inserter, matcher, mm and the recommendation to send atype
- [IAB Tech Lab: AdCOM 1.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/AdCOM/main/AdCOM%20v1.0%20FINAL.md), agent types and ID match methods
- [IAB Tech Lab: OpenRTB 2.x releases](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/releases), 2.6-202409 adding `inserter`, `matcher` and `mm` to the EID object

**Reference**

- [UID2: Introduction](https://unifiedid.com/docs/intro), the framework's description and no centralized storage for personal data
- [UID2: Normalization and encoding](https://unifiedid.com/docs/getting-started/gs-normalization-encoding), email and phone normalization, SHA-256 and Base64 of the raw bytes
- [UID2: Identifier types](https://unifiedid.com/docs/ref-info/uid-identifier-types), raw UID2 versus UID2 token, holders and bidstream use
- [UID2: Components](https://unifiedid.com/docs/ref-info/uid-components), the core, operator, opt-out and portal services and who runs them
- [UID2: Public and private operators](https://unifiedid.com/docs/ref-info/ref-operators-public-private), the two operator types
- [UID2: POST /token/generate](https://unifiedid.com/docs/endpoints/post-token-generate), inputs, the token and refresh fields, opt-out status and server-side calls
- [UID2: POST /v3/identity/map](https://unifiedid.com/docs/endpoints/post-identity-map), current and previous raw UID2s, refresh timestamps, the 1/365 daily rotation and batch limits
- [UID2: Opt-out](https://unifiedid.com/docs/getting-started/gs-opt-out), the portal, webhook and status API, and site opt-outs not being UID2 opt-outs
- [EUID: Introduction](https://euid.eu/docs/intro), the separate namespace, the CCPA/CPRA versus GDPR and TCF basis, and the regions covered
- [LiveRamp: Interpreting RampID](https://docs.liveramp.com/connect/en/interpreting-rampid,-liveramp-s-people-based-identifier.html), maintained, derived, placeholder and household RampID formats, and device and email opt-outs
- [Prebid.org: User ID module](https://docs.prebid.org/dev-docs/modules/userId.html), submodule configuration, storage, bidder restrictions, consent behavior, opt-out keys and EID sources
- [Prebid.org: UID2 user ID submodule](https://docs.prebid.org/dev-docs/modules/userid-submodules/unified2.html), server and client token generation, automatic refresh and opt-out handling
- [Prebid.org: Yahoo ConnectID submodule](https://docs.prebid.org/dev-docs/modules/userid-submodules/yahoo.html), the hashed email, pixelId, EID source and opt-out channels
- [Prebid.org: ID5 submodule](https://docs.prebid.org/dev-docs/modules/userid-submodules/id5.html), partner number, EID source, atype, encryption and the "0" value
- [Prebid.org: SharedID submodule](https://docs.prebid.org/dev-docs/modules/userid-submodules/sharedid.html), the first-party UUID, ITP compatibility and server-set cookie options
- [Google Ad Manager Help: Publisher provided identifiers](https://support.google.com/admanager/answer/2880055), format, 180-day expiry, stopping on opt-out, programmatic sharing and regional limits
