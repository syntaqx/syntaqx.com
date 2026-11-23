+++
title = "Third-Party Cookies & Browser Privacy"
nav_title = "Third-Party Cookies"
description = "Safari ITP, Firefox partitioning, Chrome keeping third-party cookies, the Privacy Sandbox retirement, CHIPS, storage access, bounce tracking and syncing."
category = "Advertising Industry"
order = 2926
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "privacy", "cookies", "browsers", "identity"]
+++

A third-party cookie is a cookie set by a domain other than the one in the address bar: the exchange's pixel on a news site, the DSP's sync redirect, the retargeting tag on a store. For twenty years it was how the open web recognized a browser across sites. An ad server, an exchange and a DSP each kept a cookie ID per browser, synced the IDs with each other, and built frequency caps, retargeting lists, audience segments and view-through attribution on top. Browsers decide whether that cookie exists, how long it lives and whether it can be read on another site, and since 2017 they have been deciding differently.

It is hard because the rules are not one rule. Safari blocks cross-site cookies outright and also shortens first-party storage written by scripts. Firefox keeps third-party cookies but gives each top-level site its own jar, so a cookie set on one site is a different cookie on the next. Chrome, after five years of announcing that it would remove third-party cookies, kept them on by default, retired most of the replacement APIs it had built, and kept a few that other browsers also support. The same tag on the same page therefore produces a stable cross-site ID in one browser, a per-site ID in another and nothing in a third, and the failure is silent: a sync pixel that cannot set its cookie still returns 200.

This chapter covers the timeline and current behavior of each browser engine, what Chrome's Privacy Sandbox was and what is left of it as of November 2026, the mechanisms that remain for legitimate cross-site state (partitioned cookies, the Storage Access API, FedCM), the countermeasures browsers aim at trackers (bounce tracking mitigation, link decoration caps, CNAME cloaking detection, fingerprinting protection), what all of it does to cookie syncing and match rates, and the records a platform keeps so it knows which browser rules each request ran under. It extends `ad_requests` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the `user_id_syncs` table that How Programmatic Works adds. The sync flows themselves are How Programmatic Works; the identifiers that do not depend on third-party cookies are Identifiers After Cookies; the consent a cookie needs before it is set is Consent Management & the TCF and, generically, [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection); what the browser changes did to a store's own conversion tracking is the Commerce volume's [Signals After ATT](/books/commerce/acquisition-and-attribution#signals-after-att); mobile app identifiers are Mobile Ad IDs, ATT & SKAdNetwork.

## How the Platforms Do It

As of November 2026, from each browser vendor's documentation and MDN.

| Browser | Third-party cookies by default | Other storage and tracking rules | Cross-site state that still works |
| --- | --- | --- | --- |
| **Brave** | "Blocks tracking cookies by default" | Its own tracker blocking (not detailed here) | Per-site settings |
| **Chrome** | Allowed in regular browsing; blocked in Incognito or when the user blocks them in settings | User-Agent reduction; bounce tracking mitigation only for users who block third-party cookies (since Chrome 116) | Third-party cookies, partitioned cookies (CHIPS, since Chrome 114), Storage Access API (since Chrome 119), FedCM, Private State Tokens |
| **Edge** | Allowed, with tracking prevention that "blocks trackers from unvisited sites, and blocks known harmful trackers by default" | Blocks third-party cookies in InPrivate | Third-party cookies outside blocked trackers; Chromium's CHIPS and Storage Access API |
| **Firefox** | Allowed but partitioned: Total Cookie Protection gives "a separate 'cookie jar' for each website you visit", on by default for all users since June 14, 2022 | Enhanced Tracking Protection blocks known trackers; bounce tracking protection in strict mode, stateless from version 145 | Storage Access API grants (30 calendar days), CHIPS |
| **Safari** | Blocked: "Cookies for cross-site resources are now blocked by default across the board" since March 24, 2020 | Intelligent Tracking Prevention: 7-day cap on script-written storage, 24-hour cap after link decoration, CNAME and IP cloaking caps, partitioned third-party storage, list-based bounce tracking protection; known fingerprinting scripts restricted from Safari 26 | Storage Access API with a prompt; per-frame grants are the only way to reach third-party cookies |

Three patterns run through the table:

- **Two of the three major engines block or partition cross-site cookies by default; the most used one does not.** Every identity product in this volume has to work in both worlds at once, and every match-rate number has to be read per browser.
- **The surviving cross-site mechanisms are opt-in and scoped.** Partitioned cookies, storage access grants and FedCM each give a cross-site embed state it can use for a named purpose on a named pair of sites, and none of them re-creates a cross-site ID that an ad system can join on.
- **Browsers police circumvention, not only cookies.** Each workaround that rebuilt cross-site identity from first-party storage (redirect bounces, decorated links, CNAME subdomains, fingerprinting) has a countermeasure in at least one engine, so a workaround is a dated assumption, not a design.

## How the Browsers Got Here

**Safari.** WebKit announced Intelligent Tracking Prevention on June 5, 2017. The first version classified domains with cross-site tracking ability and limited their cookies: usable as third party for 24 hours after the user interacted with the site, partitioned after that, and purged after 30 days without interaction. ITP 2.1 (February 21, 2019) capped persistent cookies created through `document.cookie` at seven days, first party included, which ended long-lived first-party IDs written by tags. ITP 2.3 (September 2019) went after the workarounds: after a navigation from a classified domain with link decoration, cookies written by script on the landing page are capped at 24 hours, script-writable storage is deleted after seven days of Safari use without interaction, and `document.referrer` is downgraded to the site. On March 24, 2020, with Safari 13.1, WebKit blocked third-party cookies by default "across the board". WebKit's current tracking prevention page adds that cookies set in responses from third-party CNAME-cloaked or IP-cloaked hosts are capped at seven days, that JavaScript-created cookies are capped at 24 hours when the landing URL carries a click ID that script reads, and that third-party LocalStorage, IndexedDB, service workers and HTTP cache are partitioned per first party. For Safari 26, WebKit said it "prevents known fingerprinting scripts from reliably accessing web APIs that may reveal device characteristics", and from reading query parameters, `document.referrer` and setting long-lived storage.

**Firefox.** Mozilla's Enhanced Tracking Protection blocks known trackers by list. Total Cookie Protection, on by default for all users worldwide since June 14, 2022, does something different: it lets third-party cookies exist but keys them to the top-level site, so the exchange's cookie on site A and on site B are two cookies with two IDs. A sync that runs on every site still "works" in Firefox, producing a new pair per site, which is worse than failing because it inflates the sync table with IDs that never recur.

**Chrome.** Chrome began restricting third-party cookies for 1% of browsers on January 4, 2024, as a test before a ramp to 100% that Google planned from the third quarter of 2024, subject to the UK Competition and Markets Authority (CMA). On July 22, 2024, Google changed course: "Instead of deprecating third-party cookies, we would introduce a new experience in Chrome" that would let users make an informed choice. On April 22, 2025, it dropped the prompt too: Google "will not be rolling out a new standalone prompt for third-party cookies", kept the existing choice in Chrome's privacy settings, and noted that Incognito "already blocks third-party cookies by default". MDN's summary as of 2026 is the operative one: "Google Chrome doesn't block third-party cookies by default, only in Incognito mode, or when users explicitly set it to block third-party cookies via `chrome://settings`."

**The regulator.** The CMA had opened a Competition Act investigation into the Privacy Sandbox on January 7, 2021 and accepted Google's commitments on February 11, 2022, which put the CMA in the loop on any removal of third-party cookies. It gave notice of its intention to release the commitments on June 13, 2025 and released them on October 17, 2025, the same day Google published its retirement post.

The common shorthand that "Chrome killed third-party cookies" is wrong as of November 2026, and any planning document written in 2022 to 2024 that assumes a cookieless Chrome needs rereading.

## The Privacy Sandbox and What Is Left of It

The Privacy Sandbox was Google's set of browser and Android APIs meant to replace cross-site tracking with on-device or aggregated alternatives: Topics (interest categories computed in the browser), Protected Audience (formerly FLEDGE, on-device remarketing auctions), Attribution Reporting (aggregated and event-level conversion reports), Shared Storage and Private Aggregation, Fenced Frames, Related Website Sets, IP Protection, and on Android the SDK Runtime and Protected App Signals.

On October 17, 2025, Google retired most of it "in light of their low levels of adoption": the Attribution Reporting API (Chrome and Android), IP Protection, On-Device Personalization, Private Aggregation including Shared Storage, Protected Audience (Chrome and Android), Protected App Signals, Related Website Sets including `requestStorageAccessFor` and Related Website Partition, SelectURL, the SDK Runtime and Topics (Chrome and Android). It kept CHIPS and FedCM, citing "broad adoption, including support from other browsers", and Private State Tokens, and said it would pursue an interoperable attribution standard at the W3C instead of the Attribution Reporting API.

Google's feature status page, as of November 2026, shows the result:

| Technology | Status in Chrome | Status on Android |
| --- | --- | --- |
| Topics, Protected Audience, Attribution Reporting | Deprecated and removed | Scheduled for phaseout |
| Shared Storage (incl. Select URL), Private Aggregation, Related Website Sets (incl. `requestStorageAccessFor`) | Deprecated and removed | n/a |
| Fenced Frames | Scheduled for phaseout | n/a |
| IP Protection | Discontinued | n/a |
| CHIPS | Supported by default since Chrome 114 | n/a |
| Storage Access API | Supported by default since Chrome 119 | n/a |
| Bounce tracking mitigations | Since Chrome 116, only for users who block third-party cookies | n/a |
| Private State Tokens | Since Chrome 115 | n/a |
| FedCM | Shipped in Chrome 108 | n/a |
| User-Agent reduction | Continues (origin trial ended March 7, 2023; deprecation trial ended September 23, 2023) | n/a |

What this means for a platform that built against the Sandbox: Protected Audience buyer and seller code, Topics classifiers and Attribution Reporting endpoints are dead code in Chrome, and their Android counterparts are on a phaseout with no published dates (Mobile Ad IDs, ATT & SKAdNetwork covers Android). The Sandbox's ideas survive elsewhere: on-device auctions and aggregated attribution are what Apple's AdAttributionKit does for apps, and noised aggregate measurement is what clean rooms do (Data Clean Rooms). The engineering lesson is in the auditing section below: a browser API is a dependency with a status, and the status belongs in data.

## What Still Works for Legitimate Cross-Site State

Three mechanisms remain for an embed that has a real reason to keep state across sites (a chat widget, an embedded video player's preferences, a payment iframe, a single sign-on), and an ad system should know them because each looks like an identity channel and none is one.

**Partitioned cookies (CHIPS).** A cookie set with the `Partitioned` attribute is "double-keyed: by the origin that sets them _and_ the origin of the top-level page", so it "can only be read within the context of the top-level site" it was set on. The partition key is the scheme and site of the top-level URL. It must be `Secure`; MDN recommends the `__Host-` prefix when the cookie need not be shared across subdomains:

```http
Set-Cookie: __Host-sid=34d8g; SameSite=None; Secure; Path=/; Partitioned
```

Chrome has supported CHIPS by default since version 114, and MDN lists it as Baseline 2025, available across current browsers since December 2025. Firefox's Total Cookie Protection partitions by default; MDN recommends the explicit opt-in "rather than state partitioning to provide the most compatible partitioned cookies." For advertising, a partitioned cookie is a per-publisher ID held by a third party: good for frequency within one site, a publisher's own analytics or a per-site fraud signal, and useless for cross-site joins by design.

**The Storage Access API.** An iframe calls `document.hasStorageAccess()` and, inside a click or tap ("transient activation"), `document.requestStorageAccess()`; if granted, it reloads and gets its unpartitioned cookies. The grant is keyed by the pair `<top-level site, embedded site>` and lapses: in Chrome and Safari after 30 days of browser use without interaction, in Firefox after 30 calendar days. Safari prompts for every embed that has no grant; Firefox prompts only after an origin has asked on more than a threshold number of sites; Chrome prompts for all embeds without a grant. Requests are denied when the user has not interacted with the embed as a first party recently (30 days in Firefox). An ad iframe cannot use this: it needs a user gesture inside the ad, a prompt the user accepts, and a prior first-party visit to the ad tech's own site. Chrome's variant for top-level pages, `requestStorageAccessFor`, was retired with Related Website Sets.

**FedCM.** The Federated Credential Management API lets identity providers sign users in on other sites without third-party cookies, through a browser-mediated dialog. It is for login, which matters to advertising only indirectly: an authenticated user on a publisher is the source of the deterministic identifiers in Identifiers After Cookies.

Chromium also changed the default cookie attribute: without a `SameSite` value, the default is "`Lax` in Chromium-based browsers and varies across other browsers", so a cookie meant to be read cross-site must say `SameSite=None`, and "if `SameSite=None` is set then the `Secure` attribute must also be set". A sync endpoint that forgets either attribute loses Chrome's cookies too.

## What Browsers Do to Trackers

**Bounce tracking.** When third-party cookies are blocked, a tracker can still get first-party storage by being navigated to: the click goes from site A to `tracker.example`, which sets a first-party cookie and redirects on to site B. Browsers now catch this. The mitigation MDN documents flags sites that a navigation "redirected through", including server and JavaScript redirects, checks whether the user interacted with the site "within the last 45 days", and if not, and third-party cookies are blocked, deletes the site's state: cookies, localStorage, IndexedDB, Cache API and network state. Chrome shipped it in version 116 for users who block third-party cookies ("on by default ... starting October 2023" for them); Firefox runs it in Enhanced Tracking Protection's strict mode, in "stateless mode" from version 145, alongside its separate list-free redirect tracking protection; Safari uses its own list-based protection, first shipped in ITP 2.0. A click redirector (an ad server's click tracker that 302s to the landing page) is exactly a bounce, so click trackers in Safari and in cookie-blocking Chrome cannot rely on storage they set during the redirect; counting the click server-side, as Counting Impressions & Clicks describes, is unaffected.

**Link decoration.** Click IDs appended to landing URLs (`gclid`, `fbclid`, `ttclid` and the like) carry the ad platform's ID onto the advertiser's site, where a tag writes them to a first-party cookie for later conversion matching. Safari caps such script-written cookies at 24 hours after a decorated navigation from a classified domain, and the Commerce volume's [Signals After ATT](/books/commerce/acquisition-and-attribution#signals-after-att) describes Apple stripping tracking parameters from links shared in Messages and Mail and in Private Browsing. The durable fix is the advertiser's server reading the click ID on the landing request and keeping it in its own records, then sending it back through a conversion API (Attribution covers the receiving side).

**CNAME and IP cloaking.** Pointing `metrics.publisher.example` at a vendor's servers with a CNAME made the vendor's cookie look first party. WebKit detects third-party CNAME cloaking and third-party IP cloaking and caps cookies set in those responses at seven days. A first-party proxy that serves a vendor through the publisher's own infrastructure is subject to the same rules when it looks like the same thing.

**Fingerprinting.** Building an ID from device characteristics (fonts, canvas rendering, screen, audio stack, user agent) needs no storage, so no cookie rule touches it. Browsers respond by reducing the signal (Chrome's User-Agent reduction, which freezes most of the user agent string and moves detail into client hints that must be requested) and by restricting known fingerprinting scripts (Safari 26, Firefox's list, Brave). Fingerprinting is also a legal problem independent of browsers: the ePrivacy rule on accessing information on the terminal is not limited to cookies (GDPR & ePrivacy for Ads covers it). My rule: a device or browser fingerprint may be used for invalid traffic detection, scoped and disclosed, and never as an advertising identifier.

## What It Does to Cookie Syncing and Match Rates

Cookie syncing (How Programmatic Works) depends on one domain reading its own cookie while embedded in another's page. Per engine, as of November 2026:

| Engine and mode | What a sync pixel produces | What the bidder sees in later requests |
| --- | --- | --- |
| Chrome, default | A stable pair, if the sync cookie has `SameSite=None; Secure` and consent allowed it | `buyeruid` for synced browsers |
| Chrome, Incognito or cookies blocked; Edge InPrivate | Nothing; the cookie is not sent or set | No `buyeruid`; first-party and authenticated IDs only |
| Safari | Nothing for third-party cookies; first-party IDs written by script capped at 7 days | No `buyeruid`; publisher-provided or authenticated IDs only |
| Firefox, default | A new pair per top-level site (partitioned jar) | A `buyeruid` that recurs only on the site where it was synced |
| Firefox strict, Brave | Usually nothing for listed trackers | No `buyeruid` |

The consequences an engineer has to build for:

- **Match rate is a per-browser number.** A DSP's or exchange's sync match rate averaged across browsers mixes a working channel with dead ones. Report it by browser family and major version, and expect the Safari and Firefox numbers to stay near the floor whatever the sync volume.
- **Don't sync where it cannot work.** Firing sync pixels in Safari spends the user's bandwidth and the page's performance budget for nothing; firing them in Firefox fills the sync table with per-site pairs. Prebid.js already lets the publisher limit which bidders may sync, how many, and with what delay; the exchange side should gate sync attempts on the browser policy and the consent state.
- **Frequency capping and reach degrade differently.** Without a cross-site ID, a frequency cap counts per site (Firefox partitioning) or per session (Safari), so the same person sees more impressions than the cap; reach is overcounted because one person is many IDs. Pacing & Frequency Capping covers capping across devices; for browser identity the rule is to report capped delivery with the identifier coverage it ran on.
- **Retargeting and view-through attribution are Chrome-weighted.** Audiences built from third-party cookie pixels contain mostly Chrome browsers, and view-through conversions credited through cookies exist mostly in Chrome. Advertiser-side measurement (Attribution, Incrementality & Lift) has to account for that skew.
- **The fallbacks are first-party.** In browsers without third-party cookies, what remains is what the publisher knows (a first-party cookie, a publisher-provided ID, a logged-in user's hashed email turned into a UID2 or RampID) and what the page is about (contextual signals, Targeting & Taxonomies). Identifiers After Cookies and First-Party Data & Audiences cover those.

Consent comes first in every browser. A sync is a disclosure of a pseudonymous identifier to a partner, which under the TCF needs the partner's vendor consent and purposes, and under US state laws can be a sale or a share for cross-context behavioral advertising that a Global Privacy Control signal opts out of. The browser deciding a cookie may exist says nothing about whether the law allows it ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

## Declaring What Is Stored

Publishers and CMPs need to know what each vendor stores on a device, for how long and why, both to describe it in a consent banner and to check that what is stored matches what was declared. The TCF has a standard for this: each vendor on the Global Vendor List publishes a device storage disclosure JSON at the URL in its `deviceStorageDisclosureURL`. Each entry has an `identifier` (wildcards allowed, but "a wildcard alone is invalid"), a `type` of `cookie`, `web` (local storage, IndexedDB and other web storage) or `app`, `maxAgeSeconds` (required for cookies, null otherwise), `cookieRefresh` (whether the vendor refreshes it), `domains`, the TCF `purposes` and `specialPurposes` it serves, an optional `description` (required for non-TCF storage) and an `optOut` flag for storage that records an opt-out. A vendor's own platform should generate this file from the same records its tags read, so the declaration and the behavior cannot drift; the How to Build It section models it.

## How to Build It

The core model's `ad_requests` carries the consent signals, device type and geo; it does not say which browser rules the request ran under, which is the first thing anyone asks when a match rate or a frequency number moves. This chapter adds the browser on the request, the browser policies as versioned data, the partition a sync was made in, and the device storage a platform declares.

```sql
ALTER TABLE ad_requests
  ADD COLUMN browser_family TEXT,          -- 'chrome', 'safari', 'firefox', 'edge', 'samsung', 'other'
  ADD COLUMN browser_major SMALLINT,       -- from client hints where requested, else the reduced UA
  ADD COLUMN browser_mode TEXT,            -- 'default', 'private', 'strict', 'unknown'
  ADD COLUMN third_party_storage TEXT;     -- what this system observed on the request
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_browser_mode_check
  CHECK (browser_mode IN ('default', 'private', 'strict', 'unknown')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_third_party_storage_check
  CHECK (third_party_storage IN ('unpartitioned', 'partitioned', 'none', 'unknown',
         'not_applicable')) NOT VALID;      -- not_applicable: apps, CTV, server-side requests

-- What each browser does, as data with a source and a date, not as code.
CREATE TABLE browser_storage_policies (
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  browser_family             TEXT NOT NULL,
  from_major                 SMALLINT NOT NULL,
  to_major                   SMALLINT,       -- null: current
  browser_mode               TEXT NOT NULL CHECK (browser_mode IN ('default', 'private',
                               'strict')),
  third_party_cookies        TEXT NOT NULL CHECK (third_party_cookies IN ('allowed',
                               'partitioned', 'blocked', 'trackers_blocked')),
  script_cookie_max_age_s    INT,            -- e.g. 604800 for Safari's 7-day cap; null: none
  decorated_landing_max_age_s INT,           -- e.g. 86400 after link decoration
  cloaked_cookie_max_age_s   INT,            -- CNAME or IP cloaked responses
  bounce_mitigation          TEXT NOT NULL CHECK (bounce_mitigation IN ('none', 'list',
                               'heuristic')),
  storage_access_grant_days  SMALLINT,       -- 30 in all three engines as of 2026-11
  attempt_cookie_sync        BOOLEAN NOT NULL,  -- whether this system fires sync pixels here
  source_url                 TEXT NOT NULL,  -- the vendor or MDN page the row came from
  verified_on                DATE NOT NULL,
  EXCLUDE USING gist (browser_family WITH =, browser_mode WITH =,
    int4range(from_major, coalesce(to_major, 32767), '[]') WITH &&)  -- needs btree_gist
);

-- A partitioned sync is only valid on the top-level site it was made on.
ALTER TABLE user_id_syncs
  ADD COLUMN browser_family TEXT,
  ADD COLUMN partition_site TEXT;          -- eTLD+1 of the top-level page; null: unpartitioned
CREATE UNIQUE INDEX CONCURRENTLY user_id_syncs_partner_key_partition_uq
  ON user_id_syncs (partner_org_id, local_user_key, coalesce(partition_site, ''));
ALTER TABLE user_id_syncs                -- then drop the narrower key the new index replaces
  DROP CONSTRAINT user_id_syncs_partner_org_id_local_user_key_key;

-- What this platform stores on devices, in the TCF device storage disclosure's shape.
CREATE TABLE storage_disclosures (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_org_id      UUID NOT NULL REFERENCES organizations (id),  -- the vendor declaring it
  identifier        TEXT NOT NULL CHECK (identifier <> '*'),       -- a wildcard alone is invalid
  kind              TEXT NOT NULL CHECK (kind IN ('cookie', 'web', 'app')),
  max_age_seconds   BIGINT,                 -- required for cookies, null otherwise
  cookie_refresh    BOOLEAN,
  partitioned       BOOLEAN NOT NULL DEFAULT FALSE,  -- set with the Partitioned attribute
  domains           TEXT[] NOT NULL DEFAULT '{}',
  tcf_purposes      SMALLINT[] NOT NULL DEFAULT '{}', -- empty: not a TCF purpose; description required
  tcf_special_purposes SMALLINT[] NOT NULL DEFAULT '{}',
  description       TEXT,
  records_opt_out   BOOLEAN NOT NULL DEFAULT FALSE,
  published_version INT NOT NULL,           -- the disclosure file version that first listed it
  retired_version   INT,
  CHECK ((kind = 'cookie') = (max_age_seconds IS NOT NULL)),
  CHECK (kind = 'app' OR cardinality(domains) > 0),
  CHECK (cardinality(tcf_purposes) > 0 OR description IS NOT NULL),
  UNIQUE (owner_org_id, identifier, kind, published_version)
);
```

The sync endpoint decides whether to attempt a sync from the browser policy, the consent state and the freshness of the existing pair, and sets the cookie with the attributes Chromium requires:

```go tab="Go"
type Policy struct {
	ThirdPartyCookies string // "allowed", "partitioned", "blocked", "trackers_blocked"
	AttemptCookieSync bool
}

type SyncInput struct {
	Policy         Policy
	PartnerAllowed bool      // TCF vendor consent and purposes, no US opt-out of sale/sharing
	LastSynced     time.Time // zero if never
	Now            time.Time
}

const resyncAfter = 14 * 24 * time.Hour // treat a pair as stale after 14 days

// ShouldSync reports whether to fire a partner's sync pixel on this page view.
func ShouldSync(in SyncInput) bool {
	if !in.PartnerAllowed || !in.Policy.AttemptCookieSync {
		return false
	}
	if in.Policy.ThirdPartyCookies != "allowed" {
		return false // blocked: nothing is stored; partitioned: a per-site pair that never recurs
	}
	return in.LastSynced.IsZero() || in.Now.Sub(in.LastSynced) > resyncAfter
}

// SyncCookie is the exchange's own ID cookie, readable cross-site in Chromium.
func SyncCookie(id string, maxAge time.Duration) *http.Cookie {
	return &http.Cookie{
		Name:     "uid",
		Value:    id,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		Secure:   true,                  // required with SameSite=None
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode, // Chromium defaults to Lax without it
	}
}
```

```rust tab="Rust"
use std::time::{Duration, SystemTime};

pub struct Policy {
    pub third_party_cookies: &'static str, // "allowed", "partitioned", "blocked", "trackers_blocked"
    pub attempt_cookie_sync: bool,
}

pub struct SyncInput {
    pub policy: Policy,
    pub partner_allowed: bool, // TCF vendor consent and purposes, no US opt-out of sale/sharing
    pub last_synced: Option<SystemTime>,
    pub now: SystemTime,
}

const RESYNC_AFTER: Duration = Duration::from_secs(14 * 24 * 3600);

/// Whether to fire a partner's sync pixel on this page view.
pub fn should_sync(input: &SyncInput) -> bool {
    if !input.partner_allowed || !input.policy.attempt_cookie_sync {
        return false;
    }
    if input.policy.third_party_cookies != "allowed" {
        return false; // blocked: nothing stored; partitioned: a per-site pair that never recurs
    }
    match input.last_synced {
        None => true,
        Some(t) => input.now.duration_since(t).map_or(false, |age| age > RESYNC_AFTER),
    }
}

/// The exchange's own ID cookie, readable cross-site in Chromium.
pub fn sync_cookie_header(id: &str, max_age: Duration) -> String {
    format!(
        "uid={id}; Path=/; Max-Age={}; Secure; HttpOnly; SameSite=None",
        max_age.as_secs()
    )
}
```

The number that explains most identity questions, by browser:

```sql
-- Share of requests per browser and day that carried a usable third-party cookie.
SELECT date_trunc('day', received_at)                             AS day,
       browser_family,
       browser_mode,
       count(*)                                                   AS requests,
       round(100.0 * count(*) FILTER (WHERE third_party_storage = 'unpartitioned')
             / count(*), 1)                                       AS unpartitioned_pct,
       round(100.0 * count(*) FILTER (WHERE third_party_storage = 'partitioned')
             / count(*), 1)                                       AS partitioned_pct
FROM ad_requests
WHERE received_at >= now() - interval '7 days'
  AND third_party_storage <> 'not_applicable'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;
```

Design notes:

- **Browser rules are data with a source.** Each `browser_storage_policies` row cites the page it came from and the date it was checked; when Chrome's or Safari's behavior changes, a new row with a `from_major` takes over and old requests are still judged against the row of their version. The exclusion constraint stops two rows from claiming the same version range.
- **Observed beats inferred.** `third_party_storage` records what the request showed (the sync cookie arrived, arrived partitioned, or did not), not what the policy table predicts; the difference between the two is how a platform learns a browser changed before the release notes say so.
- **Partitioned pairs are scoped pairs.** A sync made inside Firefox's per-site jar or with a CHIPS cookie is valid only on its `partition_site`; the unique index includes the partition so the same browser can hold one pair per site, and the request path looks up the pair for the current top-level site only. My default is not to create them at all (`attempt_cookie_sync = false` for partitioned modes) and to keep the column for the few that arrive anyway.
- **Reduced user agents need client hints.** With User-Agent reduction, `browser_major` comes from the `Sec-CH-UA` hints or the OpenRTB `device.sua` object when present; the frozen UA string is a fallback, and `browser_mode` is usually `unknown` because private modes are not announced.
- **Declare from the same records the tags read.** The disclosure file is generated from `storage_disclosures`, and the tag and SDK build reads cookie names and lifetimes from it, so a new cookie cannot ship undeclared. A cookie whose `max_age_seconds` exceeds what a browser allows is still declared at the value set; the browser's cap is a property of the browser row.
- **Dead APIs leave as data, not as surprises.** A Privacy Sandbox integration that was live is a row per API with its status and removal version (the same shape as `browser_storage_policies`), so a code path that calls a removed API is found by a query.

## Auditing

- **Which browser rules a request ran under.** Browser family, major version, mode and observed third-party storage on each logged request, so a match-rate, frequency or reach question can be split by the rules that applied that day.
- **The policy history.** Every `browser_storage_policies` row with its source and verification date, kept after it is superseded, so a report from 2024 can be explained with 2024's rules.
- **Every sync with its consent and partition.** The sync rows from How Programmatic Works, now with browser and partition site, so the reach of an opt-out and the reason a pair never matched can both be shown.
- **What was declared and when.** Each version of the device storage disclosure file and the rows behind it, because a data protection authority's cookie inspection compares what a site stores with what its banner said; the CNIL's 2025 fines against Google and Shein, covered in GDPR & ePrivacy for Ads, turned on cookie consent that was harder to refuse than to give, and on cookies set before and after the user's choice.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Plan for Chrome with third-party cookies and for Safari and Firefox without them, at once.** As of November 2026, Chrome keeps third-party cookies by default and most of the Privacy Sandbox is retired; Safari blocks and Firefox partitions. A design that assumes either a cookieless web or a cookie web is wrong for part of the traffic.
- **Record the browser and what it allowed on every logged request.** Without browser family, version, mode and observed storage, every identity metric is an average of incompatible channels.
- **Keep browser behavior as dated, sourced data.** The rules changed in 2017, 2019, 2020, 2022, 2024 and 2025; the next change should be a new row, not a code archaeology project.
- **Don't sync where it can't work, and never without consent.** Gate sync pixels on the browser policy, the consent state and the freshness of the pair; a sync is a disclosure of personal data whether or not the cookie survives.
- **Treat partitioned cookies and storage access as scoped tools, not identity.** They exist for embeds with a user-visible purpose; neither recreates a cross-site join, and Chrome's top-level variant is gone.
- **Expect click trackers and decorated links to lose storage.** Count clicks on the server, have advertisers keep click IDs server-side, and don't depend on cookies set during a redirect.
- **Don't fingerprint for advertising.** Browsers restrict it, ePrivacy covers it, and it fails the test of what a user would expect; keep device signals for invalid traffic detection only.
- **Generate the storage disclosure from code's own configuration.** One list of what is stored, read by the tags and published to the CMP, so the declaration is true by construction.

## References

**Specifications**

- [IAB Europe: TCF Vendor Device Storage & Operational Disclosures](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/Vendor%20Device%20Storage%20%26%20Operational%20Disclosures.md), the disclosure fields, types, maxAgeSeconds, cookieRefresh, domains, purposes and the GVL URL field
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), `user.buyeruid` and the structured user agent object

**Regulation**

- [UK CMA: Investigation into Google's Privacy Sandbox browser changes](https://www.gov.uk/cma-cases/investigation-into-googles-privacy-sandbox-browser-changes), opened January 7, 2021, commitments accepted February 11, 2022, notice June 13, 2025, released October 17, 2025

**Reference**

- [WebKit: Intelligent Tracking Prevention (June 5, 2017)](https://webkit.org/blog/7675/intelligent-tracking-prevention/), the original 24-hour, partitioning and 30-day purge rules
- [WebKit: Intelligent Tracking Prevention 2.1](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/), the 7-day cap on cookies created through document.cookie
- [WebKit: Intelligent Tracking Prevention 2.3](https://webkit.org/blog/9521/intelligent-tracking-prevention-2-3/), the 24-hour cap after link decoration, script-writable storage deletion and referrer downgrade
- [WebKit: Full third-party cookie blocking and more](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/), third-party cookies blocked by default from March 24, 2020
- [WebKit: Tracking Prevention in WebKit](https://webkit.org/tracking-prevention/), CNAME and IP cloaking caps, click-ID link decoration cap, partitioned third-party storage and bounce tracker handling
- [WebKit: News from WWDC25, Safari 26 beta](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/), restrictions on known fingerprinting scripts
- [Mozilla: Firefox rolls out Total Cookie Protection by default](https://blog.mozilla.org/en/products/firefox/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/), per-site cookie jars for all users from June 14, 2022
- [Google Privacy Sandbox: The cookie countdown (January 2024)](https://privacysandbox.google.com/blog/cookie-countdown-2024jan), the 1% test from January 4, 2024
- [Google Privacy Sandbox: A new path for Privacy Sandbox (July 22, 2024)](https://privacysandbox.google.com/blog/privacy-sandbox-update), the user-choice approach instead of deprecation
- [Google Privacy Sandbox: Next steps (April 22, 2025)](https://privacysandbox.google.com/blog/privacy-sandbox-next-steps), no standalone prompt; Incognito blocks third-party cookies
- [Google Privacy Sandbox: Update on plans for Privacy Sandbox technologies (October 17, 2025)](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), the retired and kept technologies
- [Google Privacy Sandbox: Feature status](https://privacysandbox.google.com/overview/status), status of each API in Chrome and Android, CHIPS since 114, Storage Access API since 119, bounce tracking since 116, User-Agent reduction trials
- [Google Privacy Sandbox: Bounce tracking mitigations](https://privacysandbox.google.com/protections/bounce-tracking-mitigations), the 45-day interaction window and scope
- [MDN: Third-party cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies), each browser's default, Chromium's Lax default and SameSite=None with Secure
- [MDN: Cookies Having Independent Partitioned State (CHIPS)](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies), double keying, the partition key, Secure and Baseline 2025
- [MDN: Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API), transient activation, the permission key, prompting and 30-day grant expiry per browser
- [MDN: Bounce tracking mitigations](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Bounce_tracking_mitigations), what is flagged and deleted, Chromium 116, Firefox strict mode and version 145, Safari's list-based protection

**In practice**

- [Google Authorized Buyers: Cookie matching](https://developers.google.com/authorized-buyers/rtb/cookie-guide), match tables and the 14-day freshness guidance used for resync timing
- [Prebid.org: setConfig reference](https://docs.prebid.org/dev-docs/publisher-api-reference/setConfig.html), user sync settings that limit which bidders sync and when
