+++
title = "Digital Out-of-Home"
description = "Ads on screens in public places: venue taxonomies, OpenRTB impression multipliers, programmatic DOOH, proof of play and the MRC's 2025 OOH standards."
category = "Advertising Industry"
order = 2954
part = "Channels"
tags = ["advertising", "dooh", "out-of-home", "programmatic", "measurement", "data-model"]
+++

Digital out-of-home (DOOH) is advertising on screens in public places: digital billboards beside highways, screens in train stations and airports, displays in malls, gyms, elevators, gas pumps, doctors' waiting rooms and store aisles. The media owner runs a network of screens, each playing a loop of content and ads, and sells either fixed time in the loop (a share of voice for a week) or individual plays, increasingly through programmatic exchanges. US out-of-home advertising was $2.34 billion in the third quarter of 2026, up 9.8%, with digital at 38.1% of it and growing 18.9%, according to the OAAA (as of November 2026).

It is hard because one ad play is seen by an unknown number of people, none of whom the screen can identify. A web impression is one browser; a DOOH play on a station concourse is a crowd, estimated from traffic counts, mobile location panels, ticket gate data or cameras, and that estimate (the impression multiplier) is what the buyer pays for. The screen decides what to play minutes ahead, not milliseconds, so an auction sells a play that will happen later, and the buyer needs proof that it did. Screens are also physical: they break, lose power, get blocked by a parked truck or face away from the traffic that was counted. Every one of those becomes a column or a rule.

This chapter covers DOOH supply (media owners, screens, venues and the OpenOOH venue taxonomy), how a DOOH programmatic request differs (the OpenRTB `dooh` object, the `qty` multiplier, the display time), how buying platforms count and price multiplied impressions, proof of play, the MRC's Out-of-Home Measurement Standards (December 2025) and their hierarchy from location traffic to audience, and DOOH's place-based and retail overlaps. It extends `properties`, `ad_units` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds screens, impression multipliers and play logs. In-store screens run by retailers are measured under the retail media guidelines (Retail Media Networks covers them); audience currencies and universes are Audience & Cross-Media Measurement; deal mechanics are Deals, PMPs & Curation.

## How the Platforms Do It

As of November 2026, from the specifications, the MRC, the OAAA and Display & Video 360's documentation. Rows are the standards and the buying path a DSP documents.

| Source | What it defines | Key rules |
| --- | --- | --- |
| **Display & Video 360** (Google) | Buying DOOH through deals with exchanges | Deals "must be negotiated with the seller"; Perion (Hivestack), Magnite, Place Exchange, VIOOH and Vistar support display and video, Ströer video only; only DV360-hosted static images and standard videos, no HTML5 or third-party-served creatives; programmatic guaranteed charged after the deal ends with under-delivery refunded |
| **IAB Tech Lab OpenRTB 2.6** | The DOOH request | `dooh` object (venue type, venue taxonomy, publisher, domain, keywords, content); `qty` object with a required `multiplier`, `sourcetype` and `vendor`; display time `dt` |
| **MRC Out-of-Home Measurement Standards** (Phase 1 and 2, December 2025) | How OOH impressions and audiences are measured | Location circulation and traffic, then gross, viewable (OTS) and likelihood-to-see (LTS) impressions, then audience; proof of play required |
| **OAAA** | US industry revenue | Q3 2026 $2.34 billion, digital 38.1%; $7.63 billion for the first nine months of 2026, up 9.4% |
| **OpenOOH venue taxonomy** (1.2.1, February 2, 2026) | Venue types for screens | Parent, child and grandchild IDs (1 Transit, 101 Airport, 10101 Arrival Hall); 11 parent categories |

Two things are different from every other channel in this volume. The DSP's own creative rules are restrictive (static and standard video only, reviewed by the media owner before running), because a screen in public can't show whatever an auction returns. And the unit of billing is a multiplied impression whose multiplier came from the seller, which makes the multiplier's source the thing a buyer most needs to see.

## Screens, Venues and Loops

A DOOH **property** is a screen network owned by a media owner (`properties.kind = 'screen_network'` in the core model); its **ad units** are screens, or groups of screens that play in sync (a station's concourse wall, both sides of a billboard). What a buyer needs to know about a screen:

- **Venue.** Where it is and what kind of place. The OpenOOH venue taxonomy, an industry project to "standardize the list of venue types that represent Digital-Out-of-Home (DOOH) advertising screens" in OpenRTB, has three tiers: a parent that acts as "an umbrella grouping" for its children, a child adding the environment, and an optional grandchild for areas of a venue that are functionally different. IDs nest: `1` Transit, `101` Airport, `10101` Arrival Hall. The 11 parents are Transit, Retail, Outdoor, Health & Beauty, Point of Care, Education, Office Building, Entertainment, Government, Financial and Residential. Version 1.2.1 is dated February 2, 2026. The taxonomy suggests signaling in `device.ext.dooh.venuetypeid` (one ID) or `venuetypelist` (the ID and its parents), with the rule that a DSP receiving an unknown ID treats the category as absent.
- **Location.** Coordinates, address, market and facing. A screen's location is the screen's, not a person's, so it can be precise; the audience estimate is where privacy enters.
- **Format.** Resolution, orientation, aspect ratio, whether it plays video and sound, and spot length.
- **Loop.** Many screens play a fixed cycle. The MRC defines a loop as "Segments of content and advertising programmed to a specific length that repeats on standard intervals," with the example of a six-minute loop that "repeats 10 times an hour, providing 10 plays for each message per hour." A loop is "not relevant in a pure ad serving environment where ads are served dynamically." Direct buys are often a share of the loop (one spot in every cycle for a week); programmatic buys are individual plays in the loop's ad positions.
- **Operating hours and dwell.** When the screen is on, and how long people typically stay in its view, which decides whether a 15-second spot can be seen in full.

## The Programmatic Request

A DOOH bid request looks like OpenRTB with three additions.

**The `dooh` object** replaces `site` or `app`: "This object should be included if the ad supported content is a Digital Out-Of-Home screen." It carries `venuetype` ("The type of out-of-home venue"), `venuetypetax` ("The venue taxonomy in use," default 1), `publisher`, `domain` ("Domain of the inventory owner"), `keywords` and `content`.

**The `qty` object** on the impression carries the multiplier: `multiplier`, required, "The quantity of billable events which will be deemed to have occurred if this item is purchased"; `sourcetype`, "The source type of the quantity measurement, ie. publisher"; and `vendor`, "The top level business domain name of the measurement vendor providing the quantity measurement," required when the source is a measurement vendor. The OpenRTB implementation guide adds that "fractional values (e.g. .32 impressions per ad display) are common" (a quiet screen at 3 a.m.), that the `${AUCTION_MULTIPLIER}` macro used for confirmation should never exceed the request's multiplier, and that pricing stays CPM-based: cost equals `AUCTION_PRICE / 1000 × AUCTION_MULTIPLIER`. Its example: a $2.50 CPM at a 30.3 multiplier costs $0.07575 for the play.

**The display time `dt`** is the "Timestamp when the item is estimated to be fulfilled," in milliseconds since the epoch, because the screen requests ads ahead of playing them; the guide notes the lead time from bid confirmation to display "can be up to 1 to 2 hours." A won bid is a promise to play later, and the creative must be fetched, cached and approved before then.

Counting with integer micros, and refusing a confirmation that claims more than was offered:

```go tab="Go"
// Play is one DOOH ad play as confirmed by the media owner's player or SSP.
type Play struct {
	ClearingCPMMicros    int64 // AUCTION_PRICE in micros
	RequestMultiplierMil int64 // qty.multiplier x 1000 from the bid request, e.g. 30300 for 30.3
	ConfirmedMultiplierMil int64 // ${AUCTION_MULTIPLIER} x 1000 at confirmation
	DisplayAt            time.Time // dt from the request
	PlayedAt             time.Time
}

var (
	ErrMultiplierAboveOffer = errors.New("confirmed multiplier exceeds the request's")
	ErrPlayedTooLate        = errors.New("played outside the display window")
)

// Cost returns the play's cost in micros of the currency: CPM / 1000 x multiplier.
// 2.50 CPM (2,500,000 micros) x 30.3 = 75,750 micros = $0.07575.
func Cost(p Play, window time.Duration) (impressionsMil, costMicros int64, err error) {
	if p.ConfirmedMultiplierMil > p.RequestMultiplierMil {
		return 0, 0, ErrMultiplierAboveOffer
	}
	if d := p.PlayedAt.Sub(p.DisplayAt); d < -window || d > window {
		return 0, 0, ErrPlayedTooLate
	}
	// cpm_micros / 1000 per impression, times multiplier/1000 impressions
	costMicros = p.ClearingCPMMicros * p.ConfirmedMultiplierMil / 1_000_000
	return p.ConfirmedMultiplierMil, costMicros, nil
}
```

```rust tab="Rust"
use std::time::{Duration, SystemTime};

pub struct Play {
    pub clearing_cpm_micros: i64,
    pub request_multiplier_mil: i64,   // qty.multiplier x 1000
    pub confirmed_multiplier_mil: i64, // ${AUCTION_MULTIPLIER} x 1000
    pub display_at: SystemTime,        // dt
    pub played_at: SystemTime,
}

#[derive(Debug)]
pub enum PlayError { MultiplierAboveOffer, PlayedOutsideWindow }

/// Returns (impressions x 1000, cost in micros): CPM / 1000 x multiplier.
pub fn cost(p: &Play, window: Duration) -> Result<(i64, i64), PlayError> {
    if p.confirmed_multiplier_mil > p.request_multiplier_mil {
        return Err(PlayError::MultiplierAboveOffer);
    }
    let skew = match p.played_at.duration_since(p.display_at) {
        Ok(d) => d,
        Err(e) => e.duration(),
    };
    if skew > window {
        return Err(PlayError::PlayedOutsideWindow);
    }
    let cost = p.clearing_cpm_micros * p.confirmed_multiplier_mil / 1_000_000;
    Ok((p.confirmed_multiplier_mil, cost))
}
```

Rounding is the usual question: a fractional multiplier at a low CPM produces a cost below one micro, so per-play costs are summed in a higher precision (micros times the multiplier's thousandths) and rounded once on the daily roll-up, the rule [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) states for every channel.

## How Buyers Count It

A buying platform reports two counts for DOOH. Display & Video 360's documentation is explicit: "The impression multiplier determines the publisher impressions and publisher cost per mile (CPM)." **Served impressions** "show the number of times an ad was shown on a screen"; **publisher impressions** are served impressions times the publisher's estimated viewers per ad. Its example: 5 served impressions at a multiplier of 500 are 2,500 publisher impressions, and $25 spent on them is a $10 publisher CPM. The buyer's reach and frequency reports run on the multiplied number; the delivery check runs on plays.

Several buying rules follow from that, in DV360's case: DOOH is bought through deals negotiated with the seller and pushed to the DSP through the seller's API; "You can't use a CPM revenue model when you set up a DOOH deal" (the total media cost markup model is used instead); and for programmatic guaranteed deals, the buyer is "charged the full cost" after the deal ends, with an automatic refund "for undelivered impressions within 7 days of the deal end date." Creatives can't be edited once assigned, since "editing the creative would result in the publisher review becoming invalid," because each media owner approves every creative for its screens.

## Where Multipliers Come From

The multiplier is an audience estimate per play, and buyers ask who made it and how. Sources, in roughly increasing rigor:

- **The media owner's own estimate,** from footfall counts, ridership or sales data.
- **A third-party audience measurement company,** using traffic counts, mobile location panels, transit data and visibility modeling.
- **Sensors at the screen,** such as cameras counting faces or gaze without identifying anyone, which raise their own privacy questions in some jurisdictions.

OpenRTB's `sourcetype` and `vendor` exist so the request says which, and a buyer can require vendor-sourced multipliers. The MRC's standards set the bar for a measured multiplier: "Gross Impressions" are "potential ad exposures (Ad Play/Post), over a period of time, where Presence in the defined Display Exposure Zone exists while the Display is functional"; **viewable** or **OTS** (opportunity to see) impressions additionally require "a viewability condition," applying the cross-media requirement of "100% of pixels [or posting] on-screen [on asset] for one second for Display/Static and 2 continuous seconds for Video"; **LTS** (likelihood to see) impressions apply "an adjustment ... to account for the likelihood of exposures to the Content or Ad on the Display with some evidence of notice or seen"; and **audience** applies further criteria on top of LTS.

The definitions that turn into data:

- **Display exposure zone:** "The physical area in which a person has an opportunity to see and/or hear" the display, considering distance, display size and angle.
- **Dwell time:** "The length of time spent by an individual or the audience in the Display Exposure Zone," which, with the loop length and spot frequency, decides how many plays a person present could have seen; the standards require fractionalizing impression estimates where dwell time is shorter than the loop.
- **Functional:** "Confirmation that a digital asset or display is working as intended," without which nothing counts.
- **Obstructions:** a logical obstruction (on-screen occlusion such as another application layered over the ad) negates a viewable impression; an environmental one (trees, buildings) does not negate viewability but is "a required LTS and Audience consideration."
- **Location circulation and traffic:** counts of people or vehicles at a location, which are inputs, not impressions.

So a well-documented multiplier is per screen and per time period (hour of week, at least), states which level of the hierarchy it estimates (gross, OTS, LTS or audience), names its vendor and methodology version, and changes when the methodology does. Many DOOH deals transact on a static multiplier per screen; the standards point toward time-varying ones.

## Proof of Play

Because the play happens after the sale and away from any browser, the seller must prove it. The MRC is direct: "There must be strong evidence of proof-of-play (PoP) to support the reporting of Gross Impressions or Audience estimates," and in digital OOH, PoP "can be supported by existing technologies that log player activity," whose "completeness and accuracy ... should be tested and validated prior to implementation and periodically monitored" and independently audited. The standards note that several OOH associations have defined a common set of PoP standards for digital OOH. For analog and direct buys, the proof is an affidavit, "Legitimate proof of posting by the vendor that the advertiser's message ran as scheduled," whose acceptable elements (play log, proof of play, images) are agreed before the campaign.

In practice the screen's player calls back when an ad plays (a proof-of-play URL or a log upload), the SSP or ad server matches it to the won bid or the booked spot, and only matched plays bill. A play that never confirms, or confirms long after its display time, is not billed, and the media owner's diagnostics show how closely plays track their requested times.

## Selling DOOH

Media owners sell three ways, often on the same screens:

- **Direct, by share of voice.** A fixed number of spots per loop across a set of screens for a period, priced per week or four-week period, delivered by the media owner's content management system, proven by play logs or affidavits.
- **Programmatic guaranteed and deals.** A fixed price and volume, delivered through an SSP, with plays confirmed per bid.
- **Open auction and private marketplaces.** Individual plays auctioned ahead of display time, with venue, location, daypart and audience targeting; in practice most programmatic DOOH runs on deals, as DV360's deal-only model shows.

Creative approval is part of every path: media owners review each creative against local rules (no moving images near some roads, content restrictions by venue, a children's venue's category limits), which is why DSPs pin creatives after approval. Out-of-home advertising is also regulated by place: zoning, and federal and state control of outdoor advertising along highways (23 U.S.C. 131), for roadside billboards, and transit authorities' advertising policies for stations. Those rules sit with the media owner's permits and contracts, and the ad system's part is to enforce the category and creative restrictions each screen carries.

## How to Build It

The core model holds a screen network as `properties` (`kind = 'screen_network'`), each screen or screen group as an `ad_units` row, a DOOH creative as `format = 'dooh'` (with `ad_formats` family `dooh` from Ad Formats & Standards), and the request's channel as `dooh` (How Programmatic Works). Audience & Cross-Media Measurement adds `measurement_currencies` and `accreditations` (with environment `ooh`); Measurement Standards & the MRC adds `measurement_integrations`. This chapter adds the screen's physical attributes, multipliers by screen and time, and play logs, and puts the multiplier on the request and the event.

```sql
CREATE TABLE dooh_screens (                -- the physical facts of one screen or synchronized group
  ad_unit_id          UUID PRIMARY KEY REFERENCES ad_units (id),
  venue_taxonomy      TEXT NOT NULL DEFAULT 'openooh-1.2.1',
  venue_type_id       INT NOT NULL,        -- e.g. 10101; parents derivable from the ID
  latitude_e6         INT NOT NULL,        -- degrees x 1,000,000; a screen's location, not a person's
  longitude_e6        INT NOT NULL,
  market              TEXT,                -- DMA or local market code
  facing              TEXT,                -- compass direction, for roadside screens
  width_px            INT NOT NULL,
  height_px           INT NOT NULL,
  physical_width_mm   INT,
  supports_video      BOOLEAN NOT NULL,
  supports_audio      BOOLEAN NOT NULL DEFAULT FALSE,
  spot_length_s       SMALLINT NOT NULL,
  loop_length_s       INT,                 -- null: dynamic serving, no loop
  operating_hours     JSONB NOT NULL,      -- by day of week, in the screen's time zone
  time_zone           TEXT NOT NULL,
  restrictions        JSONB NOT NULL DEFAULT '{}',  -- creative and category rules for this venue
  status              TEXT NOT NULL CHECK (status IN ('active', 'offline', 'retired')),
  CHECK (loop_length_s IS NULL OR loop_length_s % spot_length_s = 0)
);

CREATE TABLE impression_multipliers (      -- estimated impressions per play, by screen and time of week
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_unit_id          UUID NOT NULL REFERENCES dooh_screens (ad_unit_id),
  hour_of_week        SMALLINT NOT NULL CHECK (hour_of_week BETWEEN 0 AND 167),  -- screen-local
  level               TEXT NOT NULL CHECK (level IN ('gross', 'ots', 'lts', 'audience')),
  demo                TEXT NOT NULL DEFAULT 'P18+',
  multiplier_mil      BIGINT NOT NULL CHECK (multiplier_mil >= 0),  -- x 1000; 320 = 0.32
  source_type         TEXT NOT NULL CHECK (source_type IN ('publisher', 'measurement_vendor')),
  vendor_org_id       UUID REFERENCES organizations (id),
  methodology_ref     TEXT NOT NULL,       -- the vendor's method and version
  accreditation_id    UUID REFERENCES accreditations (id),
  valid               DATERANGE NOT NULL,
  CHECK (source_type = 'publisher' OR vendor_org_id IS NOT NULL),
  EXCLUDE USING gist (ad_unit_id WITH =, hour_of_week WITH =, level WITH =, demo WITH =,
    valid WITH &&)                         -- needs btree_gist
);

CREATE TABLE play_logs (                   -- proof of play: one ad play as the screen reported it
  id                  UUID NOT NULL DEFAULT uuidv7(),
  played_at           TIMESTAMPTZ NOT NULL,
  ad_unit_id          UUID NOT NULL,
  creative_id         UUID NOT NULL,
  line_item_id        UUID NOT NULL,
  auction_id          UUID,                -- programmatic plays
  display_at          TIMESTAMPTZ,         -- dt from the request, or the scheduled loop slot
  duration_ms         INT NOT NULL,
  multiplier_id       UUID,                -- the impression_multipliers row applied
  multiplier_mil      BIGINT NOT NULL,     -- as confirmed (${AUCTION_MULTIPLIER} x 1000)
  source              TEXT NOT NULL CHECK (source IN ('player_callback', 'log_upload',
                        'affidavit')),
  screen_functional   BOOLEAN NOT NULL,    -- the player's health check at play time
  matched             BOOLEAN NOT NULL DEFAULT FALSE,  -- matched to a won bid or booked spot
  ad_event_id         UUID,                -- the billable impression event it became
  PRIMARY KEY (played_at, id)
) PARTITION BY RANGE (played_at);

ALTER TABLE ad_requests
  ADD COLUMN venue_type_id INT,            -- as signaled
  ADD COLUMN qty_multiplier_mil BIGINT,    -- qty.multiplier x 1000
  ADD COLUMN qty_source_type SMALLINT,
  ADD COLUMN display_at TIMESTAMPTZ;       -- dt

ALTER TABLE ad_events
  ADD COLUMN multiplier_mil BIGINT;        -- DOOH: impressions per play x 1000; null elsewhere

ALTER TABLE delivery_daily
  ADD COLUMN plays BIGINT NOT NULL DEFAULT 0;  -- served plays; impressions holds the multiplied count
```

Design notes:

- **Screens are ad units with physical facts.** `dooh_screens` keeps what a buyer needs (venue type, location, format, loop, hours, restrictions) on the ad unit it describes, so targeting, forecasting and creative checks all read one row.
- **Multipliers are versioned estimates.** Per screen, hour of week, level and demo, with a source, a vendor, a methodology and an accreditation where one exists, so a play's multiplied impressions can be traced to the estimate that produced them and a methodology change shows up as a new row, not a silent edit.
- **Plays are the count; impressions are derived.** `delivery_daily.plays` and `impressions` are both kept: plays reconcile with the media owner's proof of play, impressions reconcile with the buyer's billed volume, and `impressions` is the sum of `multiplier_mil / 1000` over matched plays.
- **Unmatched plays don't bill.** A play becomes a billable `ad_events` row only when it matches a won bid or booked spot within the display window and the screen reported itself functional, which is the MRC's proof-of-play requirement as a join.
- **Integer thousandths for multipliers.** Fractional multipliers are common, so `multiplier_mil` keeps three decimals in an integer, and costs are summed at that precision and rounded once.
- **Screen location is precise, audiences are not.** A screen's coordinates are business data; the inputs to multipliers (mobile location panels, cameras) are personal data handled by the measurement vendor under its own obligations, and only aggregates arrive here.

## Auditing

- **What was offered.** Each request's venue type, multiplier, its source type and vendor, and display time, as sent.
- **What played.** Every play with its screen, creative, time, duration, functional state and the proof source, matched or not, kept through billing and the dispute window.
- **How impressions were computed.** The multiplier row applied to each play, its methodology and accreditation, and the confirmed multiplier never exceeding the offered one.
- **What each screen allowed.** The creative and category restrictions in force and each creative's approval by the media owner, for complaints about what appeared in a public place.

## What This Means for the System You Build

- **Model screens as ad units with venue, location, format, loop and hours,** using the OpenOOH taxonomy IDs as sent.
- **Carry the multiplier, its source and vendor on every request and play,** and reject confirmations above the offered multiplier.
- **Price with CPM times multiplier in integer micros and thousandths,** rounded once on the roll-up.
- **Bill only plays matched to a won bid or booked spot** within the display window, from a functional screen, with proof of play.
- **Keep plays and multiplied impressions side by side,** and version every multiplier with its methodology.
- **Treat creative approval and screen restrictions as part of delivery,** not an afterthought.

## References

**Regulation**

- [23 U.S.C. 131: Control of outdoor advertising (Cornell LII)](https://www.law.cornell.edu/uscode/text/23/131), federal control of outdoor advertising along highways

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the DOOH and Qty objects
- [IAB Tech Lab: OpenRTB 2.6 implementation guide](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/implementation.md), DOOH guidance on fractional multipliers, AUCTION_MULTIPLIER, cost from price and multiplier with the $2.50 and 30.3 example, display time and lead time
- [OpenOOH: Venue taxonomy 1.2](https://raw.githubusercontent.com/openooh/venue-taxonomy/main/specification-1.2.md), version 1.2.1 of February 2, 2026, the three tiers, ID nesting, parent categories and OpenRTB signaling
- [OpenOOH: Venue taxonomy repository](https://github.com/openooh/venue-taxonomy), the project's purpose
- [MRC: Out-of-Home Measurement Standards, Phase 1 and 2 (December 2025, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20OOH%20Standards%20Combined_FINAL.pdf), gross, OTS, LTS and audience definitions, exposure zones, dwell time, loops, functional displays, obstructions, affidavits and proof of play
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), the OOH standards' December 2025 date and the Digital Place-based Advertising Measurement Standards of March 2017

**In practice**

- [Display & Video 360: Digital out-of-home](https://support.google.com/displayvideo/answer/12488167?hl=en), deals with sellers, supported exchanges, publisher impressions and publisher CPM from the multiplier, creative restrictions, the revenue model rule, programmatic guaranteed charges and refunds
- [OAAA: U.S. out of home advertising reaches record Q3 revenue (November 18, 2026)](https://oaaa.org/news/us-out-of-home-advertising-reaches-record-q3-revenue-of-2-34-billion-growing-9-8-as-major-brands-accelerate-investment/), Q3 2026 revenue, digital share and growth, year-to-date revenue
