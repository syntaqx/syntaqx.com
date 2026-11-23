+++
title = "Targeting & Taxonomies"
description = "Contextual targeting, IAB Content and Audience Taxonomies, cattax and segtax, Curated Audiences, geo from IP and GPS, device, daypart, and page classification."
category = "Advertising Industry"
order = 2929
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "targeting", "taxonomies", "contextual", "data-model"]
+++

Targeting is the set of conditions under which a line item may serve: what the page or show is about, where the device is, what kind of device it is, what time it is for the viewer, and which audiences the viewer belongs to. Each condition needs a shared vocabulary to be useful across companies. A DSP buying "sports" on twenty exchanges needs every exchange to mean the same thing by sports; a curated deal selling "auto intenders" needs the buyer to know which taxonomy the segment ID comes from; a geo target needs the buyer and the seller to agree on what a metro is and whether the location came from GPS or an IP lookup. The IAB Tech Lab's taxonomies and AdCOM's lists are that vocabulary for the open web; walled gardens keep their own.

It is hard for three reasons. The vocabularies change: the Content Taxonomy has had versions 1.0, 2.0, 2.1, 2.2, 3.0 and 3.1, and 3.0 is not backwards compatible, so a category ID means nothing without its version. Classification is inference: a page is "about" sports because a classifier said so, at some confidence, at some time, and different vendors disagree. And location and time are measurements with error: an IP lookup gives a city that may be the carrier's gateway, a GPS fix gives a point that may be hours old, and "6 to 10 a.m." has to be evaluated in someone's time zone.

This chapter covers contextual targeting and how pages and content are classified, the Content, Audience and Ad Product Taxonomies and how requests name them (`cattax`, `segtax`), Curated Audiences, geography from GPS, IP and user-provided data, device and technology targeting, dayparting, and the records a platform keeps so that every targeting decision can be traced to a vocabulary, a version and a source. It extends `line_items.targeting` and `properties` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and the targeting catalog (`targeting_keys`, `targeting_values`) that [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#how-to-build-it) adds. How a targeting expression is stored and evaluated is [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#targeting-as-data); deal targeting and Curated Audiences as deal terms are [Deals, PMPs & Curation](/books/advertising/deals-and-curation#curation); audience lists are First-Party Data & Audiences; purchased segments are Data Brokers & Third-Party Data; brand safety categories built on the Content Taxonomy are Brand Safety & Suitability; what targeting the law forbids is Sensitive Data & Discriminatory Targeting. Contextual targeting on user-generated platforms under the same laws is the User-Generated Platforms volume's [Contextual Targeting and the Law](/books/user-generated-platforms/ads-and-data-licensing#contextual-targeting-and-the-law).

## How the Platforms Do It

As of November 2026, from each platform's and standard's documentation.

| Platform or standard | Contextual | Geography | Time and device | Audience vocabulary |
| --- | --- | --- | --- | --- |
| **Google Ads** | Content keywords, topics and placements on Display and YouTube; pages analyzed by text, language, link and page structure, videos by text, metadata, visuals, audio and channel | Criteria IDs from a published geo target file (Country, State, City, Postal Code and others); "Presence or interest" or "Presence"; radius from 1 km | Ad schedules with bid adjustments; device and OS criteria | Google's own audience segments plus Customer Match |
| **IAB Tech Lab** | Content Taxonomy 3.1 (December 2024), 3.0 (June 2022), 2.x; Ad Product Taxonomy | AdCOM location types and IP location services in OpenRTB's Geo object | AdCOM device types; `utcoffset` in Geo | Audience Taxonomy 1.1; Curated Audiences; the Data Transparency Standard |
| **Meta** | Placements and content controls rather than page categories | Countries, regions, cities and radius | Platforms, devices, OS | Detailed targeting, with options on "topics people may perceive as sensitive" removed from January 19, 2022 |
| **OpenRTB 2.6** | `site.cat`, `sectioncat`, `pagecat`, `content.cat` with `cattax`; `content.keywords`, `genre`, `language` | `device.geo` (current location) and `user.geo` (home base): `lat`/`lon`, `type`, `accuracy`, `lastfix`, `ipservice`, `country`, `region`, `metro`, `city`, `zip` | `device.devicetype`, `os`, `make`, `model`; `geo.utcoffset` | `user.data` segments qualified by `segtax` |

Three patterns run through the table:

- **Every vocabulary is versioned and every ID needs its version.** `cattax` says which taxonomy a category belongs to, `segtax` which taxonomy a segment belongs to, Google's geo file is dated; storing a bare code is storing a guess.
- **Context is computed, not declared.** A publisher's own categories in `site.cat` are a claim; Google analyzes pages itself, and buyers commonly pay a classifier. A platform keeps who classified what, when and at what confidence.
- **Location has a source and an error.** OpenRTB carries the location type (GPS, IP, user-provided), accuracy in meters and the age of the fix; a geo target evaluated without them treats an IP guess and a GPS fix as equal.

## Contextual Targeting

Contextual targeting chooses an ad by what the person is looking at, not by who they are. It needs no identifier and no cross-site history, which is why it is the default in browsers without third-party cookies, for users who declined consent, and for children's and sensitive content where personalized ads are restricted (Children, Teens & Advertising). It is also the oldest targeting there is: a car ad in the motoring section.

There are four levels of context, from coarse to fine:

- **Property and section.** The site or app and its section, from the publisher's ad unit hierarchy and `site.cat`/`sectioncat` in the request. Cheap, stable, declared by the seller.
- **Page or content item.** The article, video or episode: `pagecat` and `content.cat` with `cattax`, `content.keywords` (or `kwarray`, never both), `genre` and `genres` with `gtax`, `language`. Declared by the seller or a classifier it uses.
- **Classifier output.** A vendor's categories for the URL or content ID, often with brand safety and suitability labels alongside, available pre-bid through a segment or post-bid in reports. Brand Safety & Suitability covers the verification vendors.
- **Semantic and keyword matching.** The buyer's own keywords or concepts matched against page text. Google's content keywords work this way: "This method of targeting uses the keywords or topics you've chosen to match your ads to relevant sites/videos", with Google analyzing each page's text, language, link structure and page structure, and each YouTube video's text, metadata, visual content, audio content and channel information, to determine its central theme.

The engineering consequences:

- **Classify ahead of the request.** A request cannot wait for a page to be fetched and classified, so classification runs on crawl or on first sight of a URL, and the request path looks up a cached result by normalized URL or content ID; a page seen for the first time is served on its section's categories until it is classified.
- **Normalize the URL.** Query strings, tracking parameters, AMP and mobile variants and fragments make one page many keys; the classification key strips them by a versioned rule.
- **Keep confidence and expiry.** A live blog, a sports score page and a news homepage change through the day; a classification has a confidence and a time-to-live, and the request path treats an expired result as unknown.
- **Contextual is not automatically safe from privacy law.** Classifying a page as about a health condition and targeting on it is contextual; recording that a specific user read it and building a profile is not. The UGP volume's [Contextual Targeting and the Law](/books/user-generated-platforms/ads-and-data-licensing#contextual-targeting-and-the-law) and Sensitive Data & Discriminatory Targeting cover the line.

## The IAB Tech Lab Taxonomies

**Content Taxonomy.** The shared vocabulary of what content is about. IAB Tech Lab lists 3.1 (December 2024, which adds Thriller to the genre category), 3.0 (June 2022, with a companion Descriptive Vectors file), 2.2 (December 2020), 2.1 (October 2020), 2.0 (November 2017) and a deprecated 1.0 that "should not be used" for categorization without SCD (sensitive content) flags. Version 3.0 expanded coverage from about 400 categories to over 1,500, improved support for news, video and CTV, podcasts, radio, games and app stores, and "includes some deletions which make this version of the taxonomy non-backwards compatible with previous releases." Tech Lab publishes mapping files (Content 1.0 to 2.0 and 2.1, Content 1.0 to Ad Product 2.0 and back, CTV and podcast genre mappings) and an open-source Taxonomy Mapper for converting 2.x codes to 3.0.

**Audience Taxonomy.** The shared vocabulary of who a segment describes. The current version is 1.1, released October 2020 after a public comment period, with consumer privacy features added; its top tier labels each segment as demographic, interest-based or purchase-intent based, which is how a buyer tells how a segment was built. Tech Lab calls it "a key element in IAB Tech Lab's Data Transparency Standard", which "facilitates consistent labeling of audience data by first-party and third-party sources" (Data Brokers & Third-Party Data covers the data label).

**Ad Product Taxonomy.** The vocabulary of what an ad sells (version 1.0 and 2.0), used for competitive separation, blocking (`bcat`) and category policies; the core model's `advertisers.category` holds one of its codes.

**How requests name them.** Two parallel code lists:

| Code | `cattax` (AdCOM Category Taxonomies) | `segtax` (community extension) |
| --- | --- | --- |
| 1 | Content Category Taxonomy 1.0 (deprecated) | Content Category Taxonomy 1.0 (deprecated) |
| 2 | Content Category Taxonomy 2.0 (deprecated) | Content Category Taxonomy 2.0 (deprecated) |
| 3 | Ad Product Taxonomy 1.0 | Ad Product Taxonomy 1.0 |
| 4 | Audience Taxonomy 1.1 | Audience Taxonomy 1.1 |
| 5 | Content Taxonomy 2.1 | Content Taxonomy 2.1 |
| 6 | Content Taxonomy 2.2 | Content Taxonomy 2.2 |
| 7 | Content Taxonomy 3.0 | Content Taxonomy 3.0 |
| 8 | Ad Product Taxonomy 2.0 | Not in the segtax list |
| 9 | Content Taxonomy 3.1 | Not in the segtax list |
| 500+ | Vendor-specific | Vendor-specific, centrally registered (for example 501 IRIS.TV video context, 600 the Chromium Topics API taxonomy) |

`cattax` qualifies the `cat` arrays on site, app, publisher, content and producer objects and `bcat` on the request; in OpenRTB 2.6 it defaults to 1, and the Site object says "If no cattax field is supplied IAB Content Category Taxonomy 1.0 is assumed." So a seller sending Content Taxonomy 3.0 codes without `cattax = 7` is, by the specification, sending 1.0 codes. `segtax` sits in the `ext` of a `Data` object in `user.data` (audiences) or `site.content.data` and `app.content.data` (context), and "segment IDs should (still) be considered fully proprietary when no `segtax` is provided." The Topics taxonomy's registration outlives the Topics API, which Chrome removed (Third-Party Cookies & Browser Privacy): a registered code is not a live signal.

A context segment and an audience segment in one request, as field paths:

| Field path | Value | Meaning |
| --- | --- | --- |
| `site.cattax` | `7` | The site's `cat` codes are Content Taxonomy 3.0 |
| `site.cat` | `["483"]` | One Content Taxonomy 3.0 category for the site |
| `site.content.data[0].name` | `"classifier.example"` | Who supplied the context segments |
| `site.content.data[0].ext.segtax` | `7` | The segments are Content Taxonomy 3.0 codes |
| `site.content.data[0].segment[].id` | `"483"`, `"485"` | The page's categories, per that classifier |
| `user.data[0].name` | `"publisher.example"` | Who supplied the audience segment |
| `user.data[0].ext.segtax` | `4` | The segment is an Audience Taxonomy 1.1 code |
| `user.data[0].segment[].id` | `"1290"` | One audience segment |

My rules for taxonomies in a platform:

- **Store codes with their taxonomy, always.** A category or segment is the pair (taxonomy, code); a bare code column is a bug waiting for the next version.
- **Map at the edge, keep the original.** When a seller sends 2.2 and the buyer's line items target 3.1, map with Tech Lab's mapping files and keep both the received and the mapped code, with the mapping version, so a mismatch can be explained.
- **Prefer the latest version for new work, and expect old ones in traffic.** Requests carrying 1.0 and 2.x will continue for years; deprecated is not absent.

## Curated Audiences

IAB Tech Lab's Seller Defined Audiences specification was renamed Curated Audiences in December 2024. It is incubated in Project Rearc and built on Prebid, OpenRTB 2.6 community extensions, the Transparency Center and the Data Transparency Standard: a publisher, data management platform or data provider assigns users to segments in a standard taxonomy (Audience Taxonomy 1.1 or a registered vendor taxonomy) and sends only the segment IDs in `user.data` with `segtax`, so the buyer gets the audience without an identifier. Tech Lab's page was last updated August 25, 2025.

[Deals, PMPs & Curation](/books/advertising/deals-and-curation#curation) covers Curated Audiences as deal terms (a curated audience is a deal targeting clause naming a taxonomy and segment IDs). For targeting generally, the points are that a curated segment is only as good as the label describing how it was built (Data Brokers & Third-Party Data covers the Data Transparency Standard's label), that the seller decides membership so the buyer cannot verify it, and that segment IDs travel without a user identifier but are still about a person, so sending them is subject to the same consent and opt-out signals as any targeting data ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

## Geography

A request can carry two locations: `device.geo`, the "location of the device assumed to be the user's current location", and `user.geo`, the user's "home base", which is "not necessarily their current location." Each Geo object has:

| Field | Meaning |
| --- | --- |
| `lat`, `lon` | Latitude and longitude; with them, `type` and `accuracy` are recommended |
| `type` | AdCOM location type: 1 "GPS/Location Services", 2 "IP Address", 3 "User Provided (e.g., registration data)" |
| `accuracy` | Estimated accuracy in meters |
| `lastfix` | Seconds since the fix was established |
| `ipservice` | For IP geolocation: 1 ip2location, 2 Neustar (Quova), 3 MaxMind, 4 NetAcuity (Digital Element), 511 and 512 51Degrees high and medium confidence |
| `country` | ISO 3166-1 alpha-3 (note: alpha-3, while the core model stores alpha-2) |
| `region` | ISO 3166-2; the 2-letter state code in the US |
| `metro` | "Google metro code; similar to but not exactly Nielsen DMAs" |
| `city` | UN/LOCODE |
| `zip` | ZIP or postal code |
| `utcoffset` | Local time as minutes from UTC |

**Geographic vocabularies.** Countries and regions are ISO; cities in OpenRTB are UN/LOCODE; metros are Google's codes, which are "similar to but not exactly" Nielsen's Designated Market Areas, the US television and radio markets that Nielsen defines and licenses. Google Ads publishes its geo targets as a dated file of criteria IDs ("Unique and persistent assigned ID"), with target types such as Country, State, City, Postal Code and Municipality, a canonical name for disambiguation, and a status of Active or Removal Planned ("Location is obsolete and will be removed in the next version"); its documentation points to Nielsen for DMA data. A platform keeps one geo catalog keyed by source and code, with mappings between them, and treats a region that is removed as retired, not deleted, because old line items and reports refer to it.

**Where location comes from.** IP geolocation is approximate (the device's ISP or carrier gateway, a VPN, a corporate proxy), good at country, usually fine at region, unreliable below. GPS or location services in an app is precise but needs the operating system's permission and, under state laws and the GDPR, often consent; precise geolocation is sensitive data in several US states, and the FTC's location cases (Data Brokers & Third-Party Data) show the risk. User-provided location (a registration ZIP) is stable but stale. Google describes its own location targeting as "based on a variety of signals, including users' settings, devices, and behavior on our platform", a "best effort" where "100% accuracy is not guaranteed", and offers "Presence or interest" (people in or interested in a location) as broader than "Presence", which it suggests for a "sensitive vertical with strict targeting limitations". Radius targeting has a minimum of 1 km.

The engineering rules:

- **Keep the location's source, accuracy and age.** A geofence or ZIP target evaluated on an IP-derived location is a different product from one on a fresh GPS fix; the request record keeps `type`, `accuracy` and `lastfix`, and line items can require a minimum.
- **Coarsen before you store.** The core model's `ad_requests` keeps only country and coarse region "no precise location without consent"; precise coordinates are used in the request path, if at all, and not logged ([Location Tracking](/docs/building-blocks/location-tracking) covers measurement error and fences in general).
- **Mind the code systems.** OpenRTB's `country` is alpha-3 and most databases use alpha-2; `metro` is Google's code, not a licensed Nielsen DMA; a conversion table belongs in the geo catalog.
- **Sensitive places are a targeting rule.** Washington's My Health My Data Act makes it unlawful to geofence (a virtual boundary of 2,000 feet or less) an entity that provides in-person health care services to track consumers, collect health data or send them ads, and other states restrict selling precise location; Sensitive Data & Discriminatory Targeting covers them, and the targeting validator enforces them.

## Device and Technology

Device targeting uses AdCOM's device types (1 Mobile/Tablet general, 2 Personal Computer, 3 Connected TV, 4 Phone, 5 Tablet, 6 Connected Device, 7 Set Top Box, 8 OOH Device), operating system and version, make and model, browser, connection type and carrier. The core model's `ad_requests.device_type` is a coarser mapping of these. Two cautions: User-Agent reduction in Chrome means browser and OS versions come from client hints or OpenRTB's structured `sua` object rather than the user agent string (Third-Party Cookies & Browser Privacy), and CTV device signals are frequently set by the app or the SSAI server rather than observed, so a "Connected TV" request with a phone's user agent is a fraud signal (Invalid Traffic & Ad Fraud).

## Dayparting

A daypart is a schedule of days and hours when a line item may serve, sometimes with a bid adjustment. Google Ads campaigns serve "All day" by default, ad schedules allow bid adjustments by day and time, and with a schedule a campaign still paces toward "30.4 times your average daily budget" a month; Ad Manager and DSPs offer day and time targeting in the publisher's, advertiser's or viewer's time zone depending on the platform.

The question every daypart has to answer is **whose clock**. "Weekdays 6 to 10 a.m." for a breakfast brand means the viewer's morning; for a TV-style flighted buy it may mean the advertiser's account time zone, which is also the zone its budgets and reports use (the day rule in [The Core Data Model](/books/advertising/advertising-business#the-core-data-model); [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#flighting-and-time-zones) covers flight time zones). The request's `geo.utcoffset` gives the viewer's offset when the seller knows it; otherwise the viewer's time zone is inferred from the region, which is wrong at time zone borders and for travelers. Evaluating a viewer-local daypart:

```go tab="Go"
type Window struct {
	Days     []time.Weekday
	FromMin  int // minutes after local midnight, inclusive
	UntilMin int // exclusive; may be less than FromMin to cross midnight
}

// InDaypart reports whether the request falls in any window, in the viewer's
// local time. utcOffsetMin is OpenRTB geo.utcoffset; ok is false when unknown,
// in which case the caller falls back to the region's zone or the account zone.
func InDaypart(now time.Time, utcOffsetMin int, ok bool, windows []Window) (bool, bool) {
	if !ok {
		return false, false
	}
	local := now.UTC().Add(time.Duration(utcOffsetMin) * time.Minute)
	minute := local.Hour()*60 + local.Minute()
	for _, w := range windows {
		day := local.Weekday()
		if w.FromMin > w.UntilMin && minute < w.UntilMin {
			day = (day + 6) % 7 // after midnight: the window started the previous day
		}
		if !slices.Contains(w.Days, day) {
			continue
		}
		if w.FromMin <= w.UntilMin {
			if minute >= w.FromMin && minute < w.UntilMin {
				return true, true
			}
		} else if minute >= w.FromMin || minute < w.UntilMin {
			return true, true
		}
	}
	return false, true
}
```

```rust tab="Rust"
use chrono::{DateTime, Datelike, Duration, Timelike, Utc, Weekday};

pub struct Window {
    pub days: Vec<Weekday>,
    pub from_min: u32,  // minutes after local midnight, inclusive
    pub until_min: u32, // exclusive; may be less than from_min to cross midnight
}

/// Returns None when the offset is unknown (fall back to the region's or account's zone),
/// otherwise whether the request falls in any window in the viewer's local time.
pub fn in_daypart(now: DateTime<Utc>, utc_offset_min: Option<i32>, windows: &[Window]) -> Option<bool> {
    let offset = utc_offset_min?;
    let local = now + Duration::minutes(offset as i64);
    let minute = local.hour() * 60 + local.minute();
    for w in windows {
        let crosses = w.from_min > w.until_min;
        let day = if crosses && minute < w.until_min {
            local.weekday().pred() // after midnight: the window started the previous day
        } else {
            local.weekday()
        };
        if !w.days.contains(&day) {
            continue;
        }
        let inside = if crosses {
            minute >= w.from_min || minute < w.until_min
        } else {
            minute >= w.from_min && minute < w.until_min
        };
        if inside {
            return Some(true);
        }
    }
    Some(false)
}
```

The second return value (or `None`) matters: an unknown offset is not "outside the daypart", it is a different rule, and the line item's settings say which fallback applies.

## How to Build It

[Campaigns & Line Items](/books/advertising/campaigns-and-line-items#targeting-as-data) stores targeting as an expression tree over typed dimensions and a catalog of custom keys and values. This chapter adds the vocabularies those dimensions draw from: taxonomies and their nodes with versions and mappings, classifications of content with their source and confidence, a geo catalog, and the location and time facts on the request that geo and daypart rules are evaluated against.

```sql
CREATE TABLE taxonomies (                -- a versioned vocabulary: IAB, a platform's, a vendor's
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_org_id    UUID NOT NULL REFERENCES organizations (id),  -- IAB Tech Lab, a vendor
  name             TEXT NOT NULL,         -- 'Content Taxonomy', 'Audience Taxonomy'
  version          TEXT NOT NULL,         -- '3.1', '1.1'
  kind             TEXT NOT NULL CHECK (kind IN ('content', 'audience', 'ad_product', 'genre',
                     'vendor_context', 'vendor_audience')),
  cattax_code      SMALLINT UNIQUE,       -- AdCOM Category Taxonomies code, e.g. 9 for Content 3.1
  segtax_code      INT UNIQUE,            -- segtax registry code, e.g. 7, 4, 501
  released_on      DATE,
  status           TEXT NOT NULL CHECK (status IN ('current', 'supported', 'deprecated',
                     'retired')),
  source_url       TEXT NOT NULL,
  UNIQUE (issuer_org_id, name, version)
);

CREATE TABLE taxonomy_nodes (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  taxonomy_id      UUID NOT NULL REFERENCES taxonomies (id),
  code             TEXT NOT NULL,         -- the unique ID in the taxonomy file
  parent_id        UUID REFERENCES taxonomy_nodes (id),
  name             TEXT NOT NULL,
  tier             SMALLINT NOT NULL CHECK (tier BETWEEN 1 AND 6),
  build_method     TEXT CHECK (build_method IN ('demographic', 'interest', 'purchase_intent')),
                                          -- Audience Taxonomy tier 1
  sensitive        BOOLEAN NOT NULL DEFAULT FALSE,  -- health, religion, sexuality, politics, minors...
  status           TEXT NOT NULL CHECK (status IN ('active', 'removed')),
  UNIQUE (taxonomy_id, code)
);

CREATE TABLE taxonomy_node_maps (        -- crosswalk between versions or taxonomies
  from_node_id     UUID NOT NULL REFERENCES taxonomy_nodes (id),
  to_node_id       UUID NOT NULL REFERENCES taxonomy_nodes (id),
  relation         TEXT NOT NULL CHECK (relation IN ('exact', 'broader', 'narrower', 'related')),
  map_source       TEXT NOT NULL,         -- 'iab-mapping-2023-11', 'taxonomy-mapper', 'manual'
  PRIMARY KEY (from_node_id, to_node_id, map_source)
);

CREATE TABLE content_classifications (   -- what a page or content item is about, per classifier
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_kind     TEXT NOT NULL CHECK (subject_kind IN ('url', 'content_id', 'property',
                     'ad_unit', 'app_bundle', 'channel')),
  subject_key      TEXT NOT NULL,         -- normalized URL, content ID, bundle; per subject_kind
  property_id      UUID REFERENCES properties (id),
  node_id          UUID NOT NULL REFERENCES taxonomy_nodes (id),
  confidence_bp    INT CHECK (confidence_bp BETWEEN 0 AND 10000),
  classifier_org_id UUID NOT NULL REFERENCES organizations (id),  -- the seller, a vendor, this system
  classifier_version TEXT NOT NULL,
  url_rule_version TEXT,                  -- the normalization rule that produced subject_key
  classified_at    TIMESTAMPTZ NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  CHECK (expires_at > classified_at)
);
CREATE INDEX content_classifications_lookup_idx
  ON content_classifications (subject_kind, subject_key, expires_at DESC);

CREATE TABLE geo_regions (               -- one catalog for every geographic code system
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  code_system      TEXT NOT NULL CHECK (code_system IN ('iso_3166_1', 'iso_3166_2',
                     'google_criteria', 'google_metro', 'nielsen_dma', 'un_locode', 'postal')),
  code             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('country', 'region', 'metro', 'county',
                     'city', 'postal_code', 'other')),
  name             TEXT NOT NULL,
  country          CHAR(2) NOT NULL,      -- alpha-2, as in the core model
  parent_id        UUID REFERENCES geo_regions (id),
  equivalent_id    UUID REFERENCES geo_regions (id),  -- e.g. a Google metro to its Nielsen DMA
  status           TEXT NOT NULL CHECK (status IN ('active', 'removal_planned', 'retired')),
  source_version   TEXT NOT NULL,         -- e.g. the geo target file date '2026-10-06'
  UNIQUE (code_system, code)
);

-- Catalog values point at the vocabulary they come from.
ALTER TABLE targeting_values
  ADD COLUMN taxonomy_node_id UUID,
  ADD COLUMN geo_region_id UUID;
ALTER TABLE targeting_values ADD CONSTRAINT targeting_values_taxonomy_node_fk
  FOREIGN KEY (taxonomy_node_id) REFERENCES taxonomy_nodes (id) NOT VALID;
ALTER TABLE targeting_values ADD CONSTRAINT targeting_values_geo_region_fk
  FOREIGN KEY (geo_region_id) REFERENCES geo_regions (id) NOT VALID;

-- A property's declared categories, as the seller sends them in site.cat or app.cat.
ALTER TABLE properties
  ADD COLUMN declared_taxonomy_id UUID,
  ADD COLUMN declared_categories TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE properties ADD CONSTRAINT properties_declared_taxonomy_fk
  FOREIGN KEY (declared_taxonomy_id) REFERENCES taxonomies (id) NOT VALID;

-- The location and time facts geo and daypart rules ran against.
ALTER TABLE ad_requests
  ADD COLUMN geo_type SMALLINT,          -- AdCOM location type: 1 GPS, 2 IP, 3 user provided
  ADD COLUMN geo_accuracy_m INT,
  ADD COLUMN geo_fix_age_s INT,
  ADD COLUMN metro TEXT,                 -- as received; Google metro code
  ADD COLUMN utc_offset_min SMALLINT,
  ADD COLUMN content_taxonomy_id UUID,   -- the cattax the request's categories were in
  ADD COLUMN content_categories TEXT[];  -- as received
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_geo_type_check
  CHECK (geo_type IN (1, 2, 3)) NOT VALID;
```

Design notes:

- **The pair is the identity.** A category, segment or region is (vocabulary, code); `taxonomies` carries both the `cattax` and `segtax` codes so the request path can read either and write either, and a node's code is only unique within its taxonomy.
- **Keep received and resolved.** `ad_requests.content_categories` stores what the seller sent with its taxonomy; mapping to the buyer's taxonomy goes through `taxonomy_node_maps` at evaluation time, and the map source is part of the record, so "why did this line item serve on this page" has an answer even after the mapping file changes.
- **Classifications expire and compete.** Several classifiers can label the same URL; the request path picks by a configured precedence (a paid vendor over the seller's declaration, say) among unexpired rows, and an expired classification falls back to the property's declared categories rather than to a stale label.
- **Sensitive is a node flag.** `taxonomy_nodes.sensitive` lets the targeting validator refuse an expression that targets, or a classifier that infers, a sensitive category where policy or law forbids it, the same flag Brand Safety & Suitability reads for avoidance.
- **One geo catalog, many code systems.** Google criteria IDs, Google metros, Nielsen DMAs, ISO codes and UN/LOCODE live in one table with `equivalent_id` links; targeting values point at a catalog row, and retired regions stay for history.
- **Location facts on the request, coarse.** `geo_type`, accuracy and fix age, not coordinates, are logged, so a geo-targeted delivery can be audited for location quality without keeping precise location.
- **Daypart fallbacks are explicit.** `utc_offset_min` is stored as received, null when unknown; the line item's targeting says which zone applies when it is null, and the evaluation records which one was used.

## Auditing

- **The vocabulary behind every targeting value.** Taxonomy, version, node and mapping source for categories and segments; code system and source version for regions.
- **Every classification used.** Subject, node, confidence, classifier, version, time and expiry, so a brand's question about why its ad appeared on a page is answered with the label in force at the time.
- **Location quality on geo-targeted delivery.** The share of impressions on GPS, IP and user-provided location, with accuracy and fix age distributions, which is what a buyer of a geofence campaign is entitled to see.
- **Which time zone a daypart was evaluated in.** Viewer offset as received, or the fallback, per impression.
- **Sensitive-category checks.** Every targeting expression refused or limited because a node was sensitive, and who approved an exception.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Never store a category, segment or region without its vocabulary.** (taxonomy, code) and (code system, code) are the keys; `cattax` defaults to Content 1.0, so a missing one is a wrong one.
- **Map between versions explicitly and keep the original.** Content 3.x is not backwards compatible with 2.x; use Tech Lab's mappings, record the map source, and expect old versions in traffic for years.
- **Classify ahead of the request and let labels expire.** Normalize URLs by a versioned rule, cache classifications with confidence and a time-to-live, and fall back to declared categories, not to stale ones.
- **Treat location as a measurement.** Keep its type, accuracy and age; coarsen before logging; enforce sensitive-place rules in the validator.
- **Decide whose clock a daypart uses.** Viewer offset when known, a declared fallback when not, and a record of which applied.
- **Flag sensitive nodes once and enforce everywhere.** The same flag drives targeting refusals, classifier limits and brand safety avoidance.
- **Use contextual as the consent-free default, within the law.** It works in every browser and for users who declined, but recording what a person read and building a profile from it is not contextual.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), cattax and its default, site, page, section and content categories, content keywords, genre and language, device and user Geo objects and their fields
- [IAB Tech Lab: AdCOM 1.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/AdCOM/main/AdCOM%20v1.0%20FINAL.md), Location Types, IP Location Services, Category Taxonomies and Device Types lists
- [IAB Tech Lab: segtax community extension](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/extensions/community_extensions/segtax.md), segtax values, the vendor range, placement in Data.ext and proprietary IDs without segtax
- [IAB Tech Lab: Content Taxonomy](https://iabtechlab.com/standards/content-taxonomy/), versions and dates, 3.0's expansion and incompatibility, mapping files and the Taxonomy Mapper
- [IAB Tech Lab: Audience Taxonomy](https://iabtechlab.com/standards/audience-taxonomy/), version 1.1, demographic, interest and purchase-intent tiers and the Data Transparency Standard
- [IAB Tech Lab: Curated Audiences](https://iabtechlab.com/sda/), the December 2024 rename from Seller Defined Audiences, Project Rearc and its building blocks

**Reference**

- [Google Ads API: Geo targets](https://developers.google.com/google-ads/api/data/geotargets), criteria IDs, target types, canonical names, status values, the dated file and Nielsen for DMAs
- [Google Ads Help: Target ads to geographic locations](https://support.google.com/google-ads/answer/1722043), Presence or interest versus Presence, location signals and accuracy, the 1 km radius minimum
- [Google Ads Help: About contextual targeting](https://support.google.com/google-ads/answer/2404186), content keywords, topics and placements and how pages and videos are analyzed
- [Google Ads Help: About ad scheduling](https://support.google.com/google-ads/answer/2404244), all-day default, bid adjustments by day and time, and 30.4 times daily budget pacing
- [Meta: Removing certain ad targeting options (November 9, 2021)](https://business.meta.com/news/removing-certain-ad-targeting-options-and-expanding-our-ad-controls/), removal of sensitive detailed targeting options from January 19, 2022

**Regulation**

- [Washington RCW 19.373.010: Definitions](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010), the 2,000-foot geofence definition in the My Health My Data Act
- [Washington RCW 19.373.080: Geofence restrictions](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.080), the ban on geofencing in-person health care providers to track, collect data or send ads
