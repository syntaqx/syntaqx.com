+++
title = "Creative Production, Review & DCO"
nav_title = "Creative & DCO"
description = "Creative specs and trafficking, hosted and third-party tags, creative QA, review queues, dynamic creative from feeds and rules, versions, click macros."
category = "Advertising Industry"
order = 2912
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "creative", "dco", "trafficking", "data-model"]
+++

A creative reaches an impression through a chain of hands. An agency or an in-house studio builds it to a publisher's or a platform's spec; a trafficker loads it into an advertiser ad server such as Campaign Manager 360, which wraps it in a tag and counts its impressions and clicks; the tag is sent to the publisher or to a DSP, which loads it into its own ad server or bidder; each of those reviews it; and at serve time a dozen macros in the markup are replaced with a click URL, a cache buster, a price and the consent string. Dynamic creative adds a feed and a set of rules on top, so one "creative" is a template that becomes thousands of different ads, chosen per impression. Responsive search and display ads and Meta's dynamic creative push it further: the advertiser hands over parts, and the platform assembles them.

It is hard because the creative is the part of the system everyone touches and nobody owns end to end. The advertiser ad server and the publisher ad server each count the same impression from the same markup; a click macro inserted in the wrong place records a click on every render; an escaped URL escaped once too often breaks the landing page; a third-party tag can change behind a fixed URL after it was approved; and a dynamic creative's feed can change the ad's content without anybody re-reviewing it. The records that matter are therefore versions, reviews and expansions: exactly what served, who approved it, and what the macros turned into.

This chapter covers specs and trafficking (hosted creatives versus third-party tags, Campaign Manager 360 placements, tags and tracking ads), creative QA, review queues at the level of the workflow, dynamic creative optimization (feeds, rules, templates, and the platforms that assemble ads from assets), versioning, and click trackers and macros, with a macro expander in Go and Rust. It extends `creatives` and `line_item_creatives` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds the review decision record that Ad Review, Policies & Malvertising extends with its policy taxonomy, advertiser verification and malvertising detection. Format specs and load limits are [Ad Formats & Standards](/books/advertising/ad-formats); how the markup is put on a page is [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering); VAST video creatives are VAST & Video Ads; how impressions and clicks are counted and deduplicated is [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks); and generative AI creative is AI in Advertising. Moderation of ads on user-content platforms is the User-Generated Platforms volume's [Moderating the Ads](/books/user-generated-platforms/ads-and-data-licensing#moderating-the-ads).

## How the Platforms Do It

As of November 2026, from each platform's help center and developer documentation:

| Platform | Role | Creative intake | Review | Dynamic and assembled creative | Macros and tracking |
| --- | --- | --- | --- | --- | --- |
| **Campaign Manager 360** | Advertiser ad server | HTML5 as a .zip or .adz of up to 100 files and 10 MB, with a click tag; image, rich media and VAST creatives; tracking ads for third-party-served ads | Trafficker QA; publishers and DSPs review the tags downstream | Studio dynamic creatives: a template, a profile, rules and an optional feed of up to 700,000 rows | Placement tags (ins, iframe/JavaScript, JavaScript, standard, internal redirect, click tracker, VAST pre-fetch); `ord=` cache buster; click redirects through `click=` |
| **Google Ad Manager** | Publisher ad server | Third-party creatives with its macros; native ads styled by the publisher | Ad Review Center; manual creative review (beta) holds matching creatives "Pending" until reviewed | Native styles assemble publisher-styled ads from parts | `%%CLICK_URL_UNESC%%`, `%%CLICK_URL_ESC%%`, `%%CLICK_URL_ESC_ESC%%`, `%%CACHEBUSTER%%`, `%%PATTERN:key%%`, consent macros |
| **Google Ads** | Self-serve platform | Assets for responsive search and responsive display ads | "Most ads are reviewed within one business day"; statuses Under review, Eligible, Eligible (Limited), Disapproved | Responsive search ads: up to 15 headlines of 30 characters and 4 descriptions of 90; responsive display ads: up to 5 headlines, a 90-character long headline, up to 15 images | Search Advertising |
| **Meta** | Self-serve platform | Images, videos and text in an `asset_feed_spec` | Ad review (Ad Review, Policies & Malvertising) | Dynamic creative: up to 10 images, 10 videos, 5 bodies, 5 titles, 5 descriptions, 5 links, 5 calls to action, 30 assets in all; Advantage+ creative features opted in one by one | Social Advertising |
| **Microsoft Advertising** | Self-serve platform | Responsive search ad assets | Search Advertising | Responsive search ads with 3-15 headlines and 2-4 descriptions | Search Advertising |

The shared shape: an advertiser ad server hosts and tracks creatives and hands out tags; a publisher ad server or platform reviews what it is given and expands macros at serve time; and every self-serve platform has moved from one fixed ad to a set of assets that it combines. The record of a creative is therefore not one row but a set of assets, a version, a review per reviewer, and per impression the combination and the expansions that served.

## Specs and Trafficking

**Specs.** A creative is built to the receiving side's spec: a format's size or ratio, file weight and request limits (Ad Formats & Standards), plus the ad server's packaging rules. Campaign Manager 360's HTML5 rules are typical: the .zip "should consist of an HTML file plus any files referenced by the HTML file," holds up to 100 files and 10 MB, contains no nested .zip and no backup image (the trafficker uploads that separately, for when the HTML5 can't serve), uses only listed file types, and may not use `localStorage`, `sessionStorage`, `indexedDB` or `openDatabase` (uploads using them are rejected). Exits go through a click tag the ad server can read, "no minification or obfuscation," and hardcoded URLs are warned about, because a hardcoded exit bypasses the ad server's click tracking.

**Hosted versus third-party.** A creative is either hosted by the ad server that serves it (it holds the files and builds the markup) or a third-party tag: markup that calls another ad server, usually the advertiser's, which serves the real creative and counts it. The publisher sees only the tag. Hosted creatives can be scanned once and trusted to stay the same; a third-party tag can change what it serves at any time without the publisher's ad server knowing, which is why review of third-party creatives happens again at serve time (scanning what the tag actually rendered) and why malvertising rides on them (Ad Review, Policies & Malvertising).

**Campaign Manager 360 trafficking.** An advertiser ad server organizes creatives into placements (a buy on one site, at one size and price) and ads (which creatives rotate in which placements, with dates per assignment), and exports a tag per placement. Its tag types say what the receiving side can run:

- **Ins tag:** the newer format for iframe or JavaScript placements, which "provides richer domain information in Verification."
- **Iframe/JavaScript:** the common type for image and rich media, with JavaScript and standard fallbacks.
- **JavaScript:** for sites "that already use their own iframes for complex page layouts."
- **Standard:** an anchor and image tag, which "only serve for placements with dimensions of 1x1."
- **Internal redirect:** for serving Campaign Manager 360 ads "on sites that use Google Ad Manager," entered there as an image URL and a click-through URL.
- **Click tracker:** to "record the number of clicks on creatives that are not served by Campaign Manager 360," such as text links.
- **VAST pre-fetch:** in-stream video and audio, with `dc_vast=3` or `dc_vast=4` choosing the VAST version.
- **Tracking ads:** "Tracking ads don't display anything to users"; they log impressions and clicks on ads another server serves, and on a click the browser goes to the tracking tag's URL first, which logs it and redirects to the landing page.

Tags carry parameters the publisher fills: `ord=` with "a unique string (not necessarily a timestamp)" per visit as the cache buster, the same value in the `A HREF` and `IMG SRC` of a standard tag (for Ad Manager publishers, its `%n` macro); `dc_rdid=` with the device's advertising ID in apps; `tag_for_child_directed_treatment=1` for a request that may come from a child under COPPA; `dc_lat=` for limited ad tracking; `ltd=1` when the user hasn't consented to cookies; and `gdpr=${GDPR}` and `gdpr_consent=${GDPR_CONSENT_755}` for the TCF signals. Click cache busting "is handled automatically." The trafficking step is where most serve-time defects start: a tag pasted without the publisher's click macro counts clicks only on one side; a missing `ord=` lets a cached response hide impressions from the advertiser's count; a hardcoded consent value overrides the user's.

## Creative QA

Every receiving system checks a creative before it can serve, and the checks are mechanical enough to automate. My checklist, each item tied to the spec or the protocol it comes from:

- **Secure.** Every asset and every URL the markup loads is HTTPS, because an `imp.secure` request "requires secure HTTPS URL creative assets and markup" and LEAN's E is encryption. The check loads the creative and records every request, since a script can fetch an `http://` asset after load.
- **Weight and requests.** Gzipped initial load and subload and the number of initial requests, measured in a harness that fires the host page's `load` event, against the format's limits; ad server and verification files excluded, as the IAB specification counts them.
- **The click works.** The exit uses the click tag or click macro, the click macro is in an `href` or a click handler and never "as the source of an image or iframe" (which "records a click on every render," filtered as invalid), the expanded URL reaches the declared landing page, and the landing page's domain matches the `adomain` declared in bids.
- **Macros present and well formed.** Every macro the receiving server needs is present once, with the escaping its position requires (below); the TCF macro "should appear only once per URL."
- **Disclosure.** The AdChoices icon on behaviorally targeted display ads (the portfolio allows 5 kB for it) and the ad attribution on native; sponsor names and labels the format requires.
- **Behavior.** No audio before user action, animation within the format's rules, no expansion beyond what the slot allows, no `localStorage` where the ad server forbids it, no top-level navigation without a click.
- **Backup.** A static backup image for HTML5, served when the rich version can't be.

QA results are records: each check, its result and the evidence (the request log, the measured bytes, the expanded click chain) on the creative version that was tested. A re-upload is a new version and runs the checks again.

## Review Queues

Review decides whether a creative may serve, and it happens at every hop: the platform the advertiser bought from, the exchange, and the publisher. The mechanics are a queue, a decision and a status. Google Ads reviews every new or edited ad and asset ("Most ads are reviewed within one business day"), with statuses Under review, Eligible, Eligible (Limited) and Disapproved; an edit restarts review, a previously approved ad can be re-reviewed when "systems flag the ad, its destination, or its account" and doesn't serve meanwhile, and a disapproval can be appealed. On the publisher side, Ad Manager's Ad Review Center lets a publisher block programmatic creatives, and its manual creative review protection (in beta) marks matching creatives "Pending" and blocks them "from serving until you review them," with the warning that "Delay in reviewing creatives may impact auction performance and lead to buyer throttling."

Three rules hold across them. A review is a decision about a specific version of a creative, so any edit, any change to a third-party tag's output, and any new dynamic combination is either reviewed again or covered by a review of the template and the feed. Each reviewer's decision is its own record: the platform's approval does not bind the publisher, and the publisher's block does not change the platform's status. And statuses that hold a creative out of serving (pending, under re-review) are temporary states with a clock, because a creative stuck in review is lost delivery for the buyer and lost revenue for the seller. The policies reviewers apply, advertiser verification, malvertising and redirect detection, and transparency centers are Ad Review, Policies & Malvertising; the case-and-decision pattern is the playbook's [Automated Detection, Human Review](/docs/building-blocks/trust-and-safety#automated-detection-human-review).

## Dynamic Creative Optimization

Dynamic creative separates the ad into a fixed frame and variable content chosen per impression. Google's Studio describes dynamic creatives as "ad templates that show different content to different viewers," with four parts: the creative (an HTML file holding the frame), a profile (rules and the mapping between creative elements and content), optional profile fields, and an optional feed, "a spreadsheet or data set" of content variations. Supported formats include banners, expanding units, interstitials and VPAID linear video, and they are available to Campaign Manager 360 users, not Ad Manager.

**Feeds.** A feed is a table of rows, one per variation, with content columns (image URLs, headlines, prices, exit URLs) and control columns. In Studio, `Unique_ID` and `Reporting_Label` are required ("Each row of content must be populated with a unique value"), and `Active` and `Default` optional; Google Sheets is recommended up to 50,000 rows, with CSV, TSV and XML for larger feeds, up to 700,000 rows, 100 columns and 10 KB per row. Rows with `Default` true serve when no rule matches; with no default row, the ad server's own default ad serves. A date without a time is midnight that day, so an end date meant to cover a full day is the next day. A product feed from a retailer's catalog (Google Merchant Center feeds are supported) turns the same mechanism into dynamic retargeting.

**Rules.** Rules pick the row. Studio's prioritized rules "filter through a feed up to eight times to find the closest rule match": up to eight rules including the default, each filtering one or more columns against request values (targeting keys, remarketing keys, Campaign Manager 360 IDs, which must be numeric; text is not filterable), tried in priority order. When a rule leaves more than one row eligible, rotation decides: optimized ("the best-performing rows are selected more often"), random, or weighted ("according to their proportional weight").

**Assembled ads on the platforms.** Self-serve platforms do DCO without a template the advertiser builds:

- **Google Ads responsive search ads** take up to 15 headlines (3 minimum) of 30 characters and up to 4 descriptions (2 minimum) of 90 characters, and Google combines them, showing up to 3 headlines and 2 descriptions. Pinning an asset to a position forces it there (pins to Headline 1, Headline 2 and Description 1 always show), and Google advises that "pinning isn't recommended for most advertisers" because it reduces combinations. Microsoft Advertising accepts 3-15 headlines and 2-4 descriptions and likewise selects "the most relevant headline and description combination for each given query."
- **Google Ads responsive display ads** take images, logos, up to 5 headlines and descriptions and a long headline, and build each slot's ad (Ad Formats & Standards has the asset specs).
- **Meta's dynamic creative** takes an `asset_feed_spec` with at most 10 images, 10 videos, 5 bodies, 5 titles, 5 descriptions, 5 links and 5 calls to action, 30 assets in all, and delivers "different combinations of an ad's creative to different users." The ad set sets `is_dynamic_creative`, holds only one ad, and the ad can't be deleted or archived on its own. Advantage+ creative adds platform-made changes the advertiser opts into one at a time through `creative_features_spec` (`image_touchups`, `image_uncrop`, `image_background_gen`, `text_optimizations`, `adapt_to_placement` and others, each `OPT_IN` or `OPT_OUT`); since Marketing API v22.0 (January 2025) the old Standard Enhancements bundle can't be opted into as a whole, and features that don't fit an ad are removed from its spec, so the spec is read back after creation. Of the features, only `adapt_to_placement` is documented as opt-in by default.

What this means for the record: an assembled ad is a combination, and the combination that served is the creative for reporting, review and disputes. Meta offers an asset breakdown in dynamic creative reporting; a system that assembles ads should log which assets (or which feed row) made each impression, or it can't say which headline sold and can't reproduce an ad a regulator asks about. Generative features (Meta's generated backgrounds, platform-written text) make the served ad one the advertiser never saw, which is AI in Advertising's subject; for this chapter it means the generated asset is stored as an asset with its origin marked, like any other.

**Versioning.** A creative changes: a corrected price, a new exit URL, a swapped image, a re-exported tag. Each change is a new version, immutable once it has served, and line items and reviews point at versions. A dynamic creative versions in two places, the template and the feed; a feed refresh that changes a row's headline is content that has not been reviewed unless the review covered the feed's rules for what a headline may say.

## Click Trackers and Macros

A click on an ad usually passes through several servers before the landing page: the publisher's ad server records it, then the advertiser's ad server, sometimes a measurement vendor, each by redirect. The chain is built at serve time by macros, placeholders in the creative's markup that the serving system replaces with values.

**Publisher ad server macros (Google Ad Manager).** For third-party creatives, the click macro prepends Ad Manager's click-counting URL to the advertiser's:

- `%%CLICK_URL_UNESC%%`, unescaped, "at the beginning of a link": `href="%%CLICK_URL_UNESC%%https://adserver.example/click?..."`.
- `%%CLICK_URL_ESC%%`, escaped, when the click tracker is a parameter of another URL.
- `%%CLICK_URL_ESC_ESC%%`, double-escaped, when that URL is itself a parameter of another.
- `%%DEST_URL_ESC%%`, `%%DEST_URL_ESC_ESC%%` and `%%DEST_URL_UNESC%%` for the destination, used with `click=`, `click2=` and `click0=` style parameters.
- `%%CACHEBUSTER%%`, a random number "that forces a fresh ad server call."
- `%%PATTERN:key%%` for a targeting value, up to 100 replacements per creative; `%%SITE%%`, `%%ADUNIT%%`, `%%WIDTH%%` and `%%HEIGHT%%`; `%%VIEW_URL_UNESC%%` for out-of-page creatives only.
- `%%ADVERTISING_IDENTIFIER_PLAIN%%`, the resettable device ID for in-app interest-based ads, empty under limited ad tracking or child-directed treatment.
- Consent macros: `${GDPR}`, `${GDPR_CONSENT_XXXX}` (XXXX a vendor's TCF ID, as in Campaign Manager 360's `${GDPR_CONSENT_755}`) and `${ADDTL_CONSENT}`.

The hard rule is the placement: "Do not enter the click macro as the source of an image or iframe," because every render then counts as a click, and those clicks are filtered as invalid.

**Escaping.** A URL placed as the value of a query parameter inside another URL must be escaped so its `?`, `&` and `=` don't become the outer URL's; a URL nested two levels deep is escaped twice. That is all `_ESC` and `_ESC_ESC` mean, and the creative's author picks the variant by where the macro sits. The failure modes are symmetric: under-escaping truncates the inner URL at its first `&`, so the landing page loses its tracking parameters; over-escaping leaves `%2F` in a URL the browser then can't follow.

**Advertiser ad server parameters.** Campaign Manager 360's tags take the publisher's click URL in a `click=` parameter ("the publisher needs to insert a URL as the value of the parameter"), and dynamic click trackers omit the landing page so that "the Campaign Manager 360 ad server dynamically inserts the landing page URL."

**OpenRTB macros.** In programmatic buying, the exchange substitutes macros in the winning bid's `adm`, `nurl`, `burl` and `lurl`: `${AUCTION_ID}`, `${AUCTION_BID_ID}`, `${AUCTION_IMP_ID}`, `${AUCTION_SEAT_ID}`, `${AUCTION_AD_ID}`, `${AUCTION_PRICE}` (the "Clearing price using the same currency and units as the bid ... after discount"), `${AUCTION_CURRENCY}`, `${AUCTION_MBR}` (clearing price over bid price), `${AUCTION_LOSS}`, `${AUCTION_MIN_TO_WIN}`, `${AUCTION_MULTIPLIER}` and `${AUCTION_IMP_TS}`. The exchange replaces "wherever a legal macro is found ... without regard for syntax correctness," and a missing optional value becomes an empty string. Values can be encoded or encrypted by agreement, flagged with a `:X` suffix on the macro name, and "should be used sparingly"; `AUDIT` stands in for unknown values in test renders. The specification says nothing about URL-encoding the values, so a bidder that puts `${AUCTION_PRICE}` in a query string either gets a plain decimal or an encrypted token whose alphabet it must make URL-safe itself. The price macro's role in billing and win notices is OpenRTB's chapter; for creatives, the rule is that the bidder's markup is a template the exchange fills.

### A macro expander

Every serving system expands macros, and the expander's rules should be explicit: which macros are known, which escaping each name implies, what happens to unknown ones, and a record of what was substituted. A sketch for Ad Manager-style click and cache-buster macros plus OpenRTB-style auction macros, where `_ESC` means percent-encoding as a query value and `_ESC_ESC` means doing it twice, unknown `%%...%%` macros are left in place and reported, and missing OpenRTB values become empty, as the specification says:

```go tab="Go"
// Values are the serve-time inputs a creative's macros may reference.
type Values struct {
	ClickURL    string            // this server's click-counting URL, ending in a redirect parameter
	CacheBuster string            // a random value per serve
	Auction     map[string]string // "AUCTION_PRICE" -> "1.25", etc.
}

var (
	pctMacro = regexp.MustCompile(`%%([A-Z_]+)%%`)
	rtbMacro = regexp.MustCompile(`\$\{(AUCTION_[A-Z_]+)\}`)
)

// Expand substitutes macros in markup and returns the names it did not recognize.
func Expand(markup string, v Values) (string, []string) {
	var unknown []string
	out := pctMacro.ReplaceAllStringFunc(markup, func(m string) string {
		switch name := m[2 : len(m)-2]; name {
		case "CLICK_URL_UNESC":
			return v.ClickURL
		case "CLICK_URL_ESC":
			return url.QueryEscape(v.ClickURL)
		case "CLICK_URL_ESC_ESC":
			return url.QueryEscape(url.QueryEscape(v.ClickURL))
		case "CACHEBUSTER":
			return v.CacheBuster
		default:
			unknown = append(unknown, name)
			return m // leave it; QA flags it
		}
	})
	out = rtbMacro.ReplaceAllStringFunc(out, func(m string) string {
		return v.Auction[m[2:len(m)-1]] // missing -> "", per OpenRTB 2.6
	})
	return out, unknown
}
```

```rust tab="Rust"
use regex::{Captures, Regex};
use std::collections::HashMap;
use std::sync::LazyLock;
use url::form_urlencoded::byte_serialize;

/// The serve-time inputs a creative's macros may reference.
pub struct Values {
    pub click_url: String,    // this server's click-counting URL
    pub cache_buster: String, // a random value per serve
    pub auction: HashMap<String, String>, // "AUCTION_PRICE" -> "1.25", etc.
}

static PCT: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"%%([A-Z_]+)%%").unwrap());
static RTB: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\$\{(AUCTION_[A-Z_]+)\}").unwrap());

fn esc(s: &str) -> String {
    byte_serialize(s.as_bytes()).collect()
}

/// Substitutes macros in markup and returns the names it did not recognize.
pub fn expand(markup: &str, v: &Values) -> (String, Vec<String>) {
    let mut unknown = Vec::new();
    let out = PCT.replace_all(markup, |c: &Captures| match &c[1] {
        "CLICK_URL_UNESC" => v.click_url.clone(),
        "CLICK_URL_ESC" => esc(&v.click_url),
        "CLICK_URL_ESC_ESC" => esc(&esc(&v.click_url)),
        "CACHEBUSTER" => v.cache_buster.clone(),
        other => {
            unknown.push(other.to_string());
            c[0].to_string() // leave it; QA flags it
        }
    });
    let out = RTB.replace_all(&out, |c: &Captures| {
        v.auction.get(&c[1]).cloned().unwrap_or_default() // missing -> "", per OpenRTB 2.6
    });
    (out.into_owned(), unknown)
}
```

With `ClickURL = "https://ads.example/c?a=1&r="`, an `href="%%CLICK_URL_UNESC%%https://adv.example/l?x=2"` expands to `https://ads.example/c?a=1&r=https://adv.example/l?x=2`, and `?u=%%CLICK_URL_ESC%%` expands to `?u=https%3A%2F%2Fads.example%2Fc%3Fa%3D1%26r%3D`. Go's `QueryEscape` and the `url` crate's `byte_serialize` both encode a space as `+`, the form-encoding convention; a system whose partners expect `%20` uses path-style escaping instead, and that choice is written down per partner, because the two ends of a click chain must agree. The unknown-macro list goes into the QA result; a creative with an unknown macro at serve time is one that passed QA against a different server.

## How to Build It

The core's `creatives` row stays the identity that line items, bids and events point at. Assets, versions, reviews and dynamic content are new tables around it:

```sql
CREATE TABLE creative_assets (           -- a file or text an advertiser supplied, or a platform generated
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id  UUID NOT NULL REFERENCES advertisers (id),
  kind           TEXT NOT NULL CHECK (kind IN ('image', 'video', 'audio', 'html5_bundle', 'font',
                   'headline', 'long_headline', 'description', 'cta', 'logo', 'third_party_tag',
                   'vast_tag')),
  storage_key    TEXT,                   -- object storage key for files
  text_value     TEXT,                   -- text assets and tags
  sha256         BYTEA,                  -- of the file or text, for dedup and change detection
  bytes          BIGINT,
  mime           TEXT,
  width          INT,
  height         INT,
  duration_ms    INT,
  origin         TEXT NOT NULL DEFAULT 'uploaded' CHECK (origin IN ('uploaded', 'feed',
                   'platform_generated', 'platform_modified')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((storage_key IS NULL) <> (text_value IS NULL))
);

CREATE TABLE creative_versions (         -- what serves: immutable once it has served
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_id      UUID NOT NULL REFERENCES creatives (id),
  version          INT NOT NULL CHECK (version > 0),
  hosting          TEXT NOT NULL CHECK (hosting IN ('hosted', 'third_party_tag', 'assembled',
                     'dynamic_template')),
  asset_ids        UUID[] NOT NULL DEFAULT '{}',  -- creative_assets in this version
  markup           TEXT,                 -- the template with macros, or the third-party tag
  landing_url      TEXT,
  adomain          TEXT,
  macros           TEXT[] NOT NULL DEFAULT '{}',  -- macro names found in the markup at upload
  qa_status        TEXT NOT NULL DEFAULT 'pending' CHECK (qa_status IN ('pending', 'passed',
                     'failed', 'waived')),
  qa_results       JSONB NOT NULL DEFAULT '[]',   -- [{"check": "secure", "result": "pass", "evidence": "..."}]
  first_served_at  TIMESTAMPTZ,          -- set once; after it, the row never changes
  created_by       TEXT NOT NULL,        -- typed actor: a user, an API client, a feed import
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (creative_id, version)
);

CREATE TABLE creative_reviews (          -- one reviewer's decision on one version
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_version_id  UUID NOT NULL REFERENCES creative_versions (id),
  reviewer_org_id      UUID NOT NULL REFERENCES organizations (id),  -- this platform, an exchange, a publisher
  method               TEXT NOT NULL CHECK (method IN ('automated', 'human', 'appeal')),
  decision             TEXT NOT NULL CHECK (decision IN ('approved', 'limited', 'rejected',
                         'pending', 'under_rereview')),
  reasons              TEXT[] NOT NULL DEFAULT '{}',  -- codes; Ad Review, Policies & Malvertising adds the taxonomy
  scope                JSONB NOT NULL DEFAULT '{}',   -- where 'limited' applies: countries, placements
  decided_by           TEXT NOT NULL,    -- typed actor: a model version or a reviewer
  decided_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_by               TIMESTAMPTZ,      -- pending and re-review states carry a clock
  supersedes_id        UUID REFERENCES creative_reviews (id)
);

CREATE TABLE dynamic_creative_feeds (    -- content variations for dynamic templates
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id      UUID NOT NULL REFERENCES advertisers (id),
  name               TEXT NOT NULL,
  source_kind        TEXT NOT NULL CHECK (source_kind IN ('sheet', 'file', 'remote_url',
                       'product_catalog')),
  source_ref         TEXT NOT NULL,      -- the sheet, the file key, the URL or the catalog ID
  columns            JSONB NOT NULL,     -- name, type and whether filterable, per column
  refresh_interval_s INT,                -- null: manual
  last_imported_at   TIMESTAMPTZ,
  row_count          INT NOT NULL DEFAULT 0,
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE (advertiser_id, name)
);

CREATE TABLE dynamic_creative_feed_rows (  -- one variation, as of one import
  feed_id          UUID NOT NULL REFERENCES dynamic_creative_feeds (id),
  row_key          TEXT NOT NULL,        -- the feed's unique ID column
  import_version   INT NOT NULL,         -- rows are replaced by import, never edited in place
  reporting_label  TEXT NOT NULL,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_default       BOOLEAN NOT NULL DEFAULT FALSE,
  valid            TSTZRANGE,            -- start and end columns; end exclusive
  weight           INT NOT NULL DEFAULT 1 CHECK (weight > 0),
  filters          JSONB NOT NULL DEFAULT '{}',  -- filterable column values: geo, targeting keys, IDs
  content          JSONB NOT NULL,       -- content columns: image URLs, headline, price, exit URL
  PRIMARY KEY (feed_id, row_key, import_version)
);

CREATE TABLE dynamic_creative_rules (    -- how a template picks a row
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_id   UUID NOT NULL REFERENCES creatives (id),   -- the dynamic template
  feed_id       UUID NOT NULL REFERENCES dynamic_creative_feeds (id),
  priority      SMALLINT NOT NULL CHECK (priority BETWEEN 1 AND 8),  -- 1 first; the default rule last
  match         JSONB NOT NULL,          -- {"geo_region": "request.region", "segment": "key:seg"}
  rotation      TEXT NOT NULL DEFAULT 'weighted' CHECK (rotation IN ('optimized', 'random',
                  'weighted')),
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (creative_id, priority)
);

ALTER TABLE creatives ADD COLUMN current_version_id UUID;
ALTER TABLE creatives ADD CONSTRAINT creatives_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES creative_versions (id) NOT VALID;

ALTER TABLE line_item_creatives ADD COLUMN creative_version_id UUID;  -- null: follow the creative's current version
ALTER TABLE line_item_creatives ADD CONSTRAINT line_item_creatives_version_fk
  FOREIGN KEY (creative_version_id) REFERENCES creative_versions (id) NOT VALID;
ALTER TABLE line_item_creatives ADD COLUMN landing_url_override TEXT;  -- ad-level exit over creative-level

ALTER TABLE ad_events ADD COLUMN creative_version_id UUID,  -- what served; no FK across partitioned logs
                      ADD COLUMN dynamic_row_key TEXT,      -- the feed row, or the asset combination's hash
                      ADD COLUMN asset_ids UUID[];          -- assembled ads: the assets combined

CREATE INDEX CONCURRENTLY creative_versions_creative_idx ON creative_versions (creative_id, version DESC);
CREATE INDEX CONCURRENTLY creative_reviews_version_idx ON creative_reviews (creative_version_id, decided_at DESC);
CREATE INDEX CONCURRENTLY creative_reviews_due_idx ON creative_reviews (due_by)
  WHERE decision IN ('pending', 'under_rereview');
```

A version may serve to a line item when it passed QA and its latest review by each reviewer that applies is approved or limited; on this system's own side, `creatives.review_status` is kept as the summary of its own latest decision for the hot path:

```sql
SELECT v.id
FROM creative_versions v
WHERE v.creative_id = $1
  AND v.qa_status IN ('passed', 'waived')
  AND (SELECT r.decision FROM creative_reviews r
       WHERE r.creative_version_id = v.id AND r.reviewer_org_id = $2   -- $2: this platform's org
       ORDER BY r.decided_at DESC LIMIT 1) IN ('approved', 'limited')
ORDER BY v.version DESC
LIMIT 1;
```

Design notes:

- **The creative is an identity; the version is what served.** Bids, line items and events keep pointing at `creatives.id`, and `creative_versions` says what that ID meant at each moment. A version that has served (`first_served_at` set) is never updated; a change is a new version. `ad_events.creative_version_id` closes the loop for a dispute or a regulator's question.
- **Third-party tags are versions too, and they still change.** The tag text is versioned, but what it renders isn't under this system's control, so a serve-time scan of the rendered output is recorded as a QA result against the version, and a mismatch (new landing domain, new requests) sends it back to review.
- **Reviews are per reviewer, append-only.** A publisher's block, an exchange's approval and this platform's own decision are separate rows with the reviewer's organization, and a re-review supersedes rather than overwrites. `reasons` holds codes only; the policy taxonomy, advertiser verification and enforcement ladder belong to Ad Review, Policies & Malvertising, which extends this table. Automated decisions record the model and version that made them ([Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions)).
- **Pending has a clock.** `due_by` and the partial index make stuck reviews a queue someone works, because Ad Manager's own warning is that slow review leads to buyer throttling.
- **Feeds import as versions.** Rows are replaced by import (`import_version`), not edited, so the content that served on a day is the row of that day's import; a feed import is a typed actor in `created_by`. Rules reference columns declared filterable in `columns`, and a rule set has at most eight priorities with the default last, as Studio allows.
- **Log the combination.** For dynamic templates, `dynamic_row_key` is the feed row; for assembled ads, `asset_ids` lists the headline, image and description combined. Reporting by row and by asset is then a group-by on `ad_events`, and an ad can be reproduced exactly.
- **Macros are found at upload and checked at QA.** `creative_versions.macros` lists the macro names in the markup; QA fails a version missing the receiving server's click macro, or with one in an image `src`. Expansion happens per serve and isn't stored in full; the click chain of a sample of serves is kept as QA evidence.
- **Generated and modified assets are marked.** `origin` records whether a platform generated or changed an asset, so the creative an advertiser approved and the one that served can be told apart.
- **Upload handling is the playbook's.** Bundles go straight to object storage and are checked before use ([Checking What Arrived](/docs/building-blocks/file-uploads#checking-what-arrived)); a QA harness that loads third-party tags fetches arbitrary URLs and needs the SSRF defenses in [API7:2023 Server Side Request Forgery](/docs/security/api-security#api7-2023-server-side-request-forgery).

## Auditing

- **Every version that served, with its assets and markup.** For a dispute, a takedown request, a political-ad repository or a malvertising investigation, the exact creative an impression showed, reachable from the event.
- **Every review decision by every reviewer,** with method, actor, reasons and timestamps, including re-reviews and appeals.
- **Every QA run and its evidence,** including serve-time scans of third-party tags.
- **Every feed import and rule change,** so the row that served on a date, and the rule that chose it, can be shown.
- **Every combination served,** for assembled and dynamic ads, kept as long as the events are.
- **Every platform-generated or platform-modified asset,** with the feature that produced it and the advertiser's opt-in.

The mechanics (typed actors, append-only history, snapshots of what changes underneath) are in [Audit Trails](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you).

## What This Means for the System You Build

- **Version every creative and point events at the version,** never edit a version that has served, and treat a feed import as a new version of the content.
- **Keep each reviewer's decision as its own record** and serve only versions approved by every reviewer that applies; leave the policy taxonomy to the review system that owns it.
- **Automate creative QA:** HTTPS for every request, measured weight and requests, a working click chain to the declared domain, required macros present and correctly placed, disclosure icons, a backup image.
- **Model dynamic creative as template, feed and prioritized rules** with a default row, and log the row or asset combination per impression.
- **Expand macros with explicit rules:** a known list, escaping by name, unknown macros reported, missing OpenRTB values empty, and the encoding convention agreed per partner.
- **Never put a click macro where it renders,** and test click chains end to end.
- **Mark platform-generated and modified assets** so the approved ad and the served ad can be compared.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the substitution macros, where they apply, replacement without regard to syntax, empty values, encoding with a suffix and AUDIT values, adomain and imp.secure
- [IAB: New Ad Portfolio Fixed Size Ad Specifications](https://www.iab.com/wp-content/uploads/2019/04/IABNewAdPortfolio_LW_FixedSizeSpec.pdf), weight measurement, ad server and verification files excluded, and the 5 kB allowance for interest-based advertising controls

**In practice**

- [Campaign Manager 360 Help: Manage placement tags](https://support.google.com/campaignmanager/answer/2826636), tag types, ord, dc_rdid, child-directed, limited ad tracking and limited ads parameters, consent macros in tags, click= and dynamic click trackers
- [Campaign Manager 360 Help: Manage ads](https://support.google.com/campaignmanager/answer/3040965), tracking ads and how their click redirect works, and per-assignment dates
- [Campaign Manager 360 Help: Browser and proxy server caching](https://support.google.com/campaignmanager/answer/2837435), the ord cache buster and Ad Manager's %n macro
- [Campaign Manager 360 Help: HTML5 creative packaging](https://support.google.com/campaignmanager/answer/3145300), zip contents, 100 files and 10 MB, click tags without minification, backup images and storage APIs rejected
- [Google Studio Help: About dynamic creatives](https://support.google.com/richmedia/answer/2691686?hl=en), template, profile, profile fields and feed, supported formats and Campaign Manager 360 only
- [Google Studio Help: Prioritized rules](https://support.google.com/richmedia/answer/4354926), up to eight rules, default rows and filterable fields
- [Google Studio Help: Feed rules and rotation](https://support.google.com/richmedia/answer/2871761), optimized, random and weighted rotation and the default column
- [Google Studio Help: Dynamic creatives with feeds](https://support.google.com/richmedia/answer/6310576), the default row, feed formats, Merchant Center feeds and date handling
- [Google Studio Help: Set up a feed](https://support.google.com/richmedia/answer/3399836), required Unique_ID and Reporting_Label, Google Sheets up to 50,000 rows and limits of 700,000 rows, 100 columns and 10 KB per row
- [Google Ad Manager Help: Creative macros](https://support.google.com/admanager/answer/2376981), click, destination, cache-buster, pattern, device ID and consent macros, and the rule against click macros as image or iframe sources
- [Google Ad Manager Help: Ad Review Center](https://support.google.com/admanager/answer/2913553), manual creative review holding creatives pending and the warning on buyer throttling
- [Google Ads Help: About the ad review process](https://support.google.com/adspolicy/answer/1722120), review within one business day, statuses, re-review and appeals
- [Google Ads Help: About responsive search ads](https://support.google.com/google-ads/answer/7684791), headline and description counts and limits, combinations shown and pinning
- [Google Ads Help: Create responsive display ads](https://support.google.com/google-ads/answer/7005917), headline counts and the long headline
- [Google Ads Help: Best practices for responsive display ads](https://support.google.com/google-ads/answer/9823397), up to 15 images
- [Microsoft Advertising: Responsive search ads](https://learn.microsoft.com/en-us/advertising/guides/responsive-search-ads), 3-15 headlines, 2-4 descriptions and combination selection
- [Meta for Developers: Asset feed spec](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec), combinations of creative elements and dynamic creative versus customization rules
- [Meta for Developers: Dynamic creative](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/dynamic-creative), is_dynamic_creative, one ad per ad set and placements
- [Meta for Developers: Asset feed spec options](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/options), per-type maximums and 30 assets in all
- [Meta for Developers: Get started with Advantage+ creative](https://developers.facebook.com/docs/marketing-api/creative/advantage-creative/get-started), creative_features_spec, the feature list, removal of ineligible features and adapt_to_placement opt-in by default
- [Meta for Developers: Marketing API v22 impacts to Advantage+ creative enhancements](https://developers.facebook.com/blog/post/2025/01/17/marketing-api-v22-impacts-to-advantage-plus-creative-enhancements/), the Standard Enhancements bundle deprecated from v22.0 (January 2025)
