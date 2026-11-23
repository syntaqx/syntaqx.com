+++
title = "Audience & Cross-Media Measurement"
nav_title = "Audience Measurement"
description = "Panels, big data and hybrids, ratings, GRPs, reach and frequency, universe estimates, MRC accreditation of TV services, JIC currencies and cross-media rules."
category = "Advertising Industry"
order = 2938
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "tv", "audience", "data-model"]
+++

Audience measurement answers "how many people, and which people, saw this," as opposed to "how many times did the ad render." Television invented it: a sample of households wired with meters stood in for the country, each panelist was weighted to represent thousands of people like them, and the result (ratings, the share of a population watching) became the unit that national TV was bought and guaranteed in. Digital advertising is mostly bought in impressions, but every buy that wants to reach a demographic, compare TV with streaming, or plan reach and frequency across both needs the same apparatus: people, not devices; a population to project to; and deduplication across screens.

It is hard because no single source sees everyone. A panel measures people and demographics directly but is small, expensive and increasingly hard to keep representative; big data (set-top box tuning, smart TV content recognition, streaming services' own logs) sees tens of millions of devices but not who was in the room, and covers only the providers that share it; and digital logs count impressions per device or cookie, not per person. Modern services combine them, and the combination (which source is truth for what, how big data is calibrated to the panel, how demographics are modeled onto devices, which population totals everything is projected to) is where the methodology disputes are. The market has also split: a decade ago national TV transacted on one measurement company; as of November 2026, buyers and sellers can transact on several, certified by an industry committee rather than accredited by the MRC.

This chapter covers panels, big data and hybrids, the metrics (impressions, ratings, GRPs and TRPs, reach and frequency, average commercial minute and exact spot), universe estimates, the MRC's TV accreditation record for Nielsen and the 2025-2026 Big Data + Panel review, alternative currencies and the Joint Industry Committee, the MRC's cross-media standard and digital audience standards, and how a platform records which audience currency a buy uses and what it delivered against it, with a weighted reach and GRP calculation in Go and Rust. It extends `delivery_daily` and `properties` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Accreditation in general is [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc); the 100% pixel threshold and duration weighting are [Viewability & Attention](/books/advertising/viewability-and-attention#cross-media-100-and-duration); TV buying (upfronts, scatter, audience guarantees and make-goods) is Linear TV, Upfronts & Addressable TV; connected TV supply and ACR's privacy cases are Connected TV & Streaming.

## How the Platforms Do It

As of November 2026, from the MRC's television accreditation page, the JIC's announcements and the companies' own releases:

| Service | Method | MRC status (TV) | JIC currency certification |
| --- | --- | --- | --- |
| **Comscore** | "Passively collected local and national viewing data" at household level, with person-level demos in 90 age and gender segments, national and all 210 local markets | National and local (210 markets) time-based grid reports: household ratings and average audience, households with age and gender breaks | Certified (first in April 2024), recertified for 2026-2028 |
| **iSpot** | Ad occurrence detection and audience measurement for personified demos and households | TV ad occurrence data | Certified August 13, 2024 for personified demos, total households and audiences, average commercial minute and exact spot; recertified for 2026-2028 |
| **Nielsen** | National People Meter panel; Big Data + Panel combining set-top box return path data, smart TV ACR and first-party streaming data for some live events with the panel | National Panel Only and National Panel + Big Data accredited, with listed exclusions; Big Data + Panel accredited January 22, 2025 and, as of May 2026, "remains unchanged" after an MRC review | Not part of the JIC process |
| **VideoAmp** | "Census-level TV, streaming and digital viewership" tied to households | Not on the MRC television list | Certified (first in April 2024), recertified for 2026-2028 |

Streaming services also publish their own audience figures, which aren't currencies: Netflix moved in November 2025 from monthly active users to "monthly active viewers," counting accounts that watched at least a minute of ads multiplied by household size, and reported 190 million, then more than 250 million at its May 2026 upfront. The two figures aren't comparable with each other or with a rating.

## Panels, Big Data and Hybrids

**Panels.** A probability sample of households, recruited to represent the population, with meters on every set and a way for each person to register that they are watching. The panel gives the one thing no other source does: persons and demographics directly observed. Its weaknesses are size (small demographic cells are noisy), representation (some groups are harder to recruit and keep; viewing technology changes faster than the panel) and coverage of out-of-home and secondary devices. Nielsen's boilerplate describes person-level data "from panels of over 1.2 million individuals."

**Big data.** Tuning data from devices that report what they are showing:

- **Return path data (RPD)** from cable and satellite set-top boxes;
- **Automatic content recognition (ACR)** from smart TVs that fingerprint the screen's content;
- **First-party streaming data** from services that share their own logs, used for some live events.

Nielsen's January 2025 release names partners (Comcast, DirecTV, Dish Network, Roku and Vizio) and a scale of about 45 million US households and 75 million devices. Big data sees far more homes, but a tuning record is a device on a channel, not a person in a demographic, and the providers who share it aren't a random sample of the country.

**Hybrids.** Combining them is the current method of record for national TV. Nielsen describes its approach: the panel is "the source of truth"; Nielsen identifies big data devices in panel homes, compares their tuning with the meters' person-level viewing, calibrates the big data, assigns viewing to individuals, and projects to the whole TV population rather than to the big data footprint. The MRC's March 2026 statement describes the same service as relying on RPD, ACR, streaming data (panel and third-party integrations for certain live sports) and the national panel, plus "machine learning algorithms and techniques (i.e., 'modeling')," including procedures "to predict demographic information associated with non-panel sourced tuning information."

The general lesson, which applies to every hybrid (TV, digital audience panels, retail measurement): the panel defines who; the big data adds how many and where; and the model that maps one onto the other is itself a measured product, audited, versioned and disclosed.

## The Metrics

The MRC's cross-media standard gives the definitions in a form that applies to TV and digital alike, and they are the ones to implement:

```text
reach     = Σ unique audience with a viewable impression / universe × 100
frequency = Σ viewable impressions / Σ unique audience with a viewable impression
GRP       = Σ viewable impressions / universe × 100  =  reach × frequency
```

- **Rating.** The audience of a program, a minute or an ad as a percentage of a universe; one rating point is 1% of it. A household rating uses the household universe; a demographic rating ("persons 25-54") uses that demographic's population.
- **Gross rating points (GRPs).** The sum of rating points across a schedule, counting duplication: two spots each reaching 5% of adults 25-54 deliver 10 GRPs whether they reached the same people or different ones. **TRPs** (target rating points) are GRPs against the buy's target demographic.
- **Reach and frequency.** Reach is the unduplicated share who saw at least once; average frequency is GRPs divided by reach. Reach needs person-level deduplication across the schedule; GRPs don't.
- **Impressions.** In TV, gross audience in thousands (a rating times the universe), the bridge between ratings and digital impressions.
- **Average commercial minute and exact spot.** TV ratings were long sold on the average audience of the commercial minutes in a program; second-by-second big data makes ratings for the specific ad (exact spot) possible. The JIC certified iSpot "under both Average Commercial Minute and Exact Spot measurement"; Nielsen's accredited deliverables include "Average Commercial Minute" tapes.

The cross-media standard adds the rules that keep the arithmetic honest: audience assignment "shall only be done at the unique device or, preferably, the unique user level"; the universe for US measurement is the total US population; the qualifying unit is a viewable impression (100% of pixels for two continuous seconds in combined cross-media video); and duration-weighted variants are reported in addition, as [Cross-Media: 100% and Duration](/books/advertising/viewability-and-attention#cross-media-100-and-duration) shows.

## Universe Estimates

Every rating divides by a universe: how many people or households of a given kind exist in the measured market. A wrong universe moves every rating and every GRP guarantee in the same direction, which is why universe estimates are themselves audited. The MRC's March 2026 statement listed "an independent media-related universe estimate source" first among its required fixes to Nielsen's Big Data + Panel service, and recorded that Nielsen implemented the ARF DASH study as that source in February 2026, the study itself having been "granted MRC accreditation in early 2026 after successfully completing a separate MRC audit process."

For a system, the universe is reference data with a market, a demographic, a unit (persons or households), a value, a source and a validity period. Ratings and GRPs are computed against the universe in force for the period, and a universe update is a new row; changing last season's universe after the fact silently changes every delivered GRP and every make-good computed from it.

## Nielsen, the MRC and the Big Data + Panel Review

The MRC's record on Nielsen's national service is the best public example of how accreditation works in practice:

- **September 2021: suspension.** The MRC suspended Nielsen's National TV accreditation.
- **April 17, 2023: reinstatement,** after 19 months, with components still excluded (among them dTVR, local measurement, DAR, the RPD/ACR integration and Nielsen One).
- **January 22, 2025: Big Data + Panel accredited,** which Nielsen called the "first accredited national TV audience measurement provider for Big Data + Panel," following accreditation of its first-party live streaming integration and re-accreditation of the panel service; Nielsen said the product was "widely adopted for the 2024 Upfront season."
- **March 3, 2026: under evaluation.** The MRC said the service "remains accredited" but described "seemingly unusual changes in measurement results" during the first half of 2025, giving the example that "total day impressions for persons 25-54 years old declined by more than 10% on average during the first half of 2025, as compared to the first half of 2024," along with panel representation issues and changes in variability between panel-only and Big Data + Panel estimates. In September 2025 it had told Nielsen that improvements in four areas were "necessary to maintain accreditation": an independent universe estimate source; modeling changes "to increase demographic assignment accuracy"; weighting changes to simplify the process and "reduce standard error levels"; and improving "underrepresented demographic segments" in the panel (Hispanic, Spanish dominant).
- **May 27, 2026: status unchanged.** Nielsen had implemented the ARF DASH universe estimates and improved Hispanic Spanish-dominant representation; the remaining modeling and weighting changes were delayed "until August 31, 2026, due to requests from customers for additional time and impact data." The MRC said it would review the changes and their impact data before implementation, kept the 2025 audit open for that purpose, and said the accreditation "remains unchanged" with no further public updates planned "unless future audit activities dictate." Whether the August 31, 2026 changes were implemented as planned isn't stated on the MRC pages opened. <!-- source-gap: adv-nielsen-aug-2026-changes | status | whether Nielsen's modeling and weighting changes took effect on August 31, 2026 and the MRC's conclusion | closes with: an MRC or Nielsen statement after August 2026 | checked: 2026-11-22 -->

The MRC's television page as of November 2026 lists Nielsen's National Panel + Big Data service with exclusions (cross-platform TV and internet reporting, individual local people meter market reporting, segmentation data and market-breaks trend analysis) and notes that dTVR, NHES and the National Out-of-Home expansion are not yet included.

What this means for engineering: a methodology change in the measurement service a buy is guaranteed on can move delivered audiences by more than any campaign variable. Delivery records must carry the measurement service's release or methodology version, and comparisons across a change (this upfront against last) need both versions on the record.

## Currencies and the JIC

A **currency** is the measurement a buy transacts on: the numbers the guarantee is written in, the invoice is reconciled to and the make-goods are computed from. Accreditation says a service follows the MRC's standards; currency is a commercial choice by buyer and seller. US national TV added a body for that choice. The U.S. Joint Industry Committee, created in January 2023 as a forum where "media buyers and video suppliers" define a model for long-form video measurement, certifies providers as national currencies:

- **What is tested.** Data evaluation questions (collection, coverage, reporting, deal types, integrations), campaign evaluations across advertiser categories and deal types, and total ad supply including sports, all assessed for "transparency, completeness, methodology checks, and data stability," with buyers and sellers having an equal voice. The 2024 cycle ran more than 270 tests; the 2026 recertification ran "39 Data Evaluation Questions and 672 tests" over "more than 150 million telecast observations across 680+ networks."
- **Terms.** Certification lasts two years with a mid-term audit each November. On September 22, 2026, the JIC recertified Comscore, iSpot and VideoAmp as national currencies for 2026-2028, each meeting its threshold "across Total Households, Advanced Audiences, and Personified Demographics."
- **Not the MRC.** The JIC process is separate from MRC accreditation: VideoAmp is JIC-certified and not on the MRC's TV list; iSpot is MRC-accredited for ad occurrence data and JIC-certified as a currency; Nielsen is MRC-accredited and outside the JIC process.

For a sell-side or buy-side system, the practical consequence is multi-currency: the same campaign can be guaranteed on one currency and reported on two or three, and the system has to hold each provider's delivery separately, per demographic, with its own universe and methodology version.

## Digital Audiences

Digital buys reach demographics through two kinds of measurement:

- **Demographic assignment of digital impressions.** The MRC's Digital Audience-Based Measurement Standard (December 2017) governs assigning impressions to people and demographics, and the cross-media standard requires persons-level measurement consistent across TV and digital and forbids reporting persons "purely through algorithms or modeling not at least partially" based on directly measured persons. Vendors assign demographics from panels, from logged-in platform data, or from data partners; Ogury's pre- and post-campaign demographic and audience reporting is listed as an MRC audit in process (since December 2024), and Snap's mobile in-app "reach metrics" are accredited.
- **Reach without identity.** As identifiers thin out, reach is increasingly modeled: from panels, from logged-in platforms' own deduplication, or inside clean rooms where two parties' exposure logs meet (Data Clean Rooms). Every modeled reach figure is a projection with a method, and the guidelines' rule applies: projected counts are disclosed and segregated from observed ones.

The cross-media standard ties it together: digital viewable impressions and TV viewable impressions, both filtered for invalid activity, assigned to persons, deduplicated across media and projected to the total population, are what a cross-media reach and GRP figure is made of. Phase I covers video; display and audio phases were left to later work in the 2019 document.

## How to Build It

Audience measurement adds the universes ratings divide by, the currencies a buy can transact on (with the methodology version each delivered day used), and the delivered audience per line item, day, currency and demographic. `insertion_orders` gains the currency and target demographic a guarantee is written in.

```sql
CREATE TABLE universe_estimates (        -- the population a rating divides by
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  measurer_org_id  UUID NOT NULL REFERENCES organizations (id),
  market           TEXT NOT NULL,         -- 'US', or a local market code
  demo             TEXT NOT NULL,         -- 'HH', 'P2+', 'P25-54', 'W18-49'
  unit             TEXT NOT NULL CHECK (unit IN ('persons', 'households')),
  population       BIGINT NOT NULL CHECK (population > 0),
  source           TEXT NOT NULL,         -- the universe study the measurer used
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING gist (measurer_org_id WITH =, market WITH =, demo WITH =, valid_during WITH &&)
);

CREATE TABLE measurement_currencies (    -- a measurement a buy can transact on
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  measurer_org_id   UUID NOT NULL REFERENCES organizations (id),
  name              TEXT NOT NULL,        -- the service as sold
  basis             TEXT NOT NULL CHECK (basis IN ('panel', 'big_data_panel', 'big_data',
                      'census_impressions', 'platform_first_party')),
  ad_measure        TEXT NOT NULL CHECK (ad_measure IN ('average_commercial_minute',
                      'exact_spot', 'viewable_impression')),
  demographics      TEXT NOT NULL CHECK (demographics IN ('personified', 'household',
                      'modeled')),
  accreditation_id  UUID REFERENCES accreditations (id),  -- MRC status, if any
  jic_certification_id UUID REFERENCES accreditations (id),  -- body = 'jic', if any
  UNIQUE (measurer_org_id, name, ad_measure)
);

CREATE TABLE methodology_versions (      -- a measurer's methodology release, with its effective date
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  currency_id       UUID NOT NULL REFERENCES measurement_currencies (id),
  version           TEXT NOT NULL,
  effective_from    DATE NOT NULL,
  change_summary    TEXT NOT NULL,
  impact_data_ref   TEXT,                 -- where the measurer's impact study lives
  UNIQUE (currency_id, version)
);

ALTER TABLE insertion_orders ADD COLUMN audience_currency_id UUID,
                             ADD COLUMN guarantee_demo TEXT,    -- 'P25-54'
                             ADD COLUMN guarantee_market TEXT;  -- 'US'
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_audience_currency_fk
  FOREIGN KEY (audience_currency_id) REFERENCES measurement_currencies (id) NOT VALID;

CREATE TABLE audience_delivery_daily (   -- delivered audience, per currency and demographic
  line_item_id            UUID REFERENCES line_items (id),
  deal_id                 UUID REFERENCES deals (id),
  day                     DATE NOT NULL,
  currency_id             UUID NOT NULL REFERENCES measurement_currencies (id),
  methodology_version_id  UUID NOT NULL REFERENCES methodology_versions (id),
  universe_estimate_id    UUID NOT NULL REFERENCES universe_estimates (id),
  demo                    TEXT NOT NULL,
  market                  TEXT NOT NULL,
  impressions             BIGINT NOT NULL,   -- projected persons or households, gross
  reach                   BIGINT,            -- unduplicated within the day; schedule reach is computed, not summed
  dw_impressions_milli    BIGINT,            -- duration weighted, in thousandths
  grp_hundredths          BIGINT NOT NULL,   -- impressions / universe × 100, in hundredths of a point
  stream                  TEXT NOT NULL DEFAULT 'live_plus_same_day',  -- the measurer's viewing window
  version                 INT NOT NULL DEFAULT 1,  -- restated when the measurer reissues
  computed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((line_item_id IS NULL) <> (deal_id IS NULL)),
  UNIQUE NULLS NOT DISTINCT (line_item_id, deal_id, day, currency_id, demo, market, stream)
);
```

Reach, frequency and GRPs over a schedule come from person-level exposures with each person's projection weight (the number of people in the universe they represent), never from summing daily reach. The sketch takes one weighted record per measured person with their count of qualifying (viewable) impressions and viewable seconds over the schedule, and returns the cross-media standard's metrics:

```go tab="Go"
type Exposure struct {
	PersonWeight     float64 // people in the universe this panelist or modeled person represents
	ViewableImps     int     // qualifying viewable impressions in the schedule
	ViewableMsCapped int64   // viewable duration, each exposure capped at creative length
}

type Audience struct {
	ReachPct       float64 // share of the universe with at least one viewable impression
	AvgFrequency   float64
	GRP            float64
	DurationGRP    float64 // duration weighted, relative to creative length
	ProjectedReach float64 // people
}

// Measure computes reach, frequency and GRPs for one demographic against its universe.
func Measure(people []Exposure, universe float64, creativeMs int64) Audience {
	var reached, imps, dwImps float64
	for _, p := range people {
		if p.ViewableImps == 0 {
			continue
		}
		reached += p.PersonWeight
		imps += p.PersonWeight * float64(p.ViewableImps)
		dwImps += p.PersonWeight * float64(p.ViewableMsCapped) / float64(creativeMs)
	}
	a := Audience{ProjectedReach: reached}
	if universe > 0 {
		a.ReachPct = reached / universe * 100
		a.GRP = imps / universe * 100
		a.DurationGRP = dwImps / universe * 100
	}
	if reached > 0 {
		a.AvgFrequency = imps / reached // so GRP = reach × frequency
	}
	return a
}
```

```rust tab="Rust"
pub struct Exposure {
    pub person_weight: f64,       // people in the universe this person represents
    pub viewable_imps: u32,       // qualifying viewable impressions in the schedule
    pub viewable_ms_capped: i64,  // viewable duration, each exposure capped at creative length
}

#[derive(Debug, Default)]
pub struct Audience {
    pub reach_pct: f64,
    pub avg_frequency: f64,
    pub grp: f64,
    pub duration_grp: f64,
    pub projected_reach: f64,
}

/// Computes reach, frequency and GRPs for one demographic against its universe.
pub fn measure(people: &[Exposure], universe: f64, creative_ms: i64) -> Audience {
    let (mut reached, mut imps, mut dw_imps) = (0.0, 0.0, 0.0);
    for p in people.iter().filter(|p| p.viewable_imps > 0) {
        reached += p.person_weight;
        imps += p.person_weight * f64::from(p.viewable_imps);
        dw_imps += p.person_weight * p.viewable_ms_capped as f64 / creative_ms as f64;
    }
    let mut a = Audience { projected_reach: reached, ..Default::default() };
    if universe > 0.0 {
        a.reach_pct = reached / universe * 100.0;
        a.grp = imps / universe * 100.0;
        a.duration_grp = dw_imps / universe * 100.0;
    }
    if reached > 0.0 {
        a.avg_frequency = imps / reached; // so GRP = reach × frequency
    }
    a
}
```

Floating point is fine here: these are estimates with sampling error far larger than rounding, and the stored figures are rounded once into `grp_hundredths`. Money computed from them (a cost per point, a make-good owed) goes back to integer micros and minor units.

The delivery check against a guarantee reads the currency the IO names, with the methodology version visible so a shortfall caused by a methodology release can be seen as such:

```sql
-- Delivered GRPs against the IO's guarantee currency and demo, by methodology version.
SELECT io.number, mv.version AS methodology, SUM(a.grp_hundredths) / 100.0 AS grps,
       SUM(a.impressions) AS impressions
FROM insertion_orders io
JOIN campaigns c ON c.insertion_order_id = io.id
JOIN line_items li ON li.campaign_id = c.id
JOIN audience_delivery_daily a ON a.line_item_id = li.id
 AND a.currency_id = io.audience_currency_id
 AND a.demo = io.guarantee_demo
 AND a.market = io.guarantee_market
JOIN methodology_versions mv ON mv.id = a.methodology_version_id
WHERE io.id = $1
GROUP BY io.number, mv.version, mv.effective_from
ORDER BY mv.effective_from;
```

Design notes:

- **One row per currency, demographic and market.** A campaign guaranteed on one currency and reported on two others has three sets of rows; none overwrites another, and the IO says which one governs, the same principle as `delivery_daily`'s sources.
- **Universes and methodologies are versioned references.** Every delivered row points at the universe estimate and methodology release it was computed with; a new universe or release produces new rows going forward and, when the measurer reissues history, a restated `version`.
- **GRPs add, reach doesn't.** `grp_hundredths` sums across days; schedule reach and frequency are recomputed from person-level data (the sketch above, or the measurer's own reach curve), never summed from daily reach.
- **Viewing windows are a column.** Measurers report audiences with different time-shifted viewing windows; `stream` names the one each row uses so a live figure is never compared with a time-shifted one.
- **Projection weights belong to the measurer.** A platform receiving a measurer's data stores its results; one running its own panel or model stores weights with the model version, and the cross-media standard's rule that persons can't be reported "purely through algorithms or modeling" without directly measured persons underneath constrains what it may label as persons.
- **Accreditation and certification are references,** to the rows [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc#how-to-build-it) maintains, with the JIC's certification as a row with `body = 'jic'`.

## Auditing

- **Every guarantee's currency, demographic and market,** and every delivered row it was judged against, with methodology and universe versions.
- **Measurer reissues and restatements,** with before-and-after values, because audience guarantees and make-goods are settled on them.
- **Methodology releases and their impact data,** for each currency a buy used.
- **Which accreditation and certification applied** to each currency during each flight.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Measure people, not devices,** projected to a stated universe, with demographics from a source that observes persons.
- **Compute reach and frequency from person-level data** and GRPs as viewable impressions over the universe, per the cross-media standard.
- **Store delivery per currency, demographic, market and viewing window,** and let the contract name the governing currency.
- **Version universes and methodologies,** and carry the versions on every delivered row.
- **Track MRC accreditation and JIC certification separately,** since they are different decisions by different bodies.
- **Expect methodology changes to move audiences** and keep both sides of a change visible in reporting.

## References

**Specifications**

- [MRC: Cross-Media Audience Measurement Standards, Phase I Video (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Cross-Media%20Audience%20Measurement%20Standards%20%28Phase%20I%20Video%29%20Final.pdf), reach, frequency and GRP formulas, persons and device level assignment, the total population universe, modeling limits and duration weighting
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), the Digital Audience-Based Measurement Standard, Audience Reach Measurement Guidelines and Cross-Media Phase I dates

**Accreditation and certification**

- [MRC: Television accreditation](https://mediaratingcouncil.org/accreditation/television), Comscore, iSpot and Nielsen services, their scope and exclusions
- [MRC: Digital accreditation](https://mediaratingcouncil.org/accreditation/digital), Snap reach metrics and Ogury audience reporting in process
- [MRC: Statement on Nielsen National TV reinstatement (April 17, 2023, PDF)](https://mediaratingcouncil.org/sites/default/files/News/Accreditation-Matters/041723_Nielsen_Natl_Statement_Final.pdf), the 2021 suspension, the 2023 reinstatement and the excluded components
- [MRC: Update on the Nielsen National Big Data + Panel service (March 3, 2026, PDF)](https://www.mediaratingcouncil.org/sites/default/files/News/MRC%20Releases%20Update%20on%20the%20MRC-Accredited%20Nielsen%20National%20Big%20Data%20%2B%20Panel%20Television%20Service.pdf), data sources and modeling, the persons 25-54 decline, the four priority areas, ARF DASH and the April 2026 plan
- [MRC: Nielsen National Big Data + Panel May 2026 status update (PDF)](https://www.mediaratingcouncil.org/sites/default/files/News/GI052726%20-%20MRC%20Releases%20Nielsen%20National%20Big%20Data%20%2B%20Panel%20Status%20Update%20.pdf), the delay to August 31, 2026, the open 2025 audit and the unchanged accreditation
- [Nielsen: MRC accredits Big Data + Panel National TV measurement (January 22, 2025)](https://www.nielsen.com/news-center/2025/2025-the-media-rating-council-accredits-nielsens-innovative-big-data-panel-national-tv-measurement/), data sources and partners, households and devices, panel as source of truth, the 2024 upfront adoption
- [PR Newswire: U.S. Joint Industry Committee awards iSpot certification as national currency (August 13, 2024)](https://prnewswire.com/news-releases/us-joint-industry-committee-awards-ispot-certification-as-national-currency-302220531.html), the JIC's formation, certification scope, terms, mid-term audits, criteria and the earlier Comscore and VideoAmp certifications
- [Advanced Television: US Joint Industry Committee recertifies Comscore, iSpot, VideoAmp (September 22, 2026)](https://www.advanced-television.com/?p=292461), the 2026-2028 term, the thresholds met and the scale of testing

**In practice**

- [Comscore: Television](https://www.comscore.com/Products/Television), household-level national and local measurement, 90 age and gender segments and passively collected viewing data
- [VideoAmp](https://www.videoamp.com/), census-level TV, streaming and digital viewership tied to households
- [Netflix: Third season of ads (November 5, 2025)](https://about.netflix.com/en/news/netflix-third-season-of-ads-and-a-look-ahead-at-whats-next), monthly active viewers defined and 190 million
- [Netflix: Upfront 2026 (May 13, 2026)](http://about.netflix.com/en/news/netflix-upfront-2026-get-closer), more than 250 million monthly active viewers
