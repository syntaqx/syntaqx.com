+++
title = "Linear TV, Upfronts & Addressable TV"
description = "How television is sold: upfront and scatter markets, ratings guarantees and make-goods, spots, traffic and as-run logs, political rates and addressable TV."
category = "Advertising Industry"
order = 2950
part = "Channels"
tags = ["advertising", "linear-tv", "upfronts", "addressable-tv", "guarantees", "data-model"]
nav_title = "Linear TV & Upfronts"
+++

Linear television is advertising sold against a schedule. A network or station knows its programs months ahead, sells the commercial time inside them in units of seconds, and promises the buyer not a number of impressions but an audience: so many rating points among adults 25-54, measured by a named currency, delivered across a schedule of spots. Most of that time is sold a season ahead in the upfront market, the rest closer to air in scatter, and when the audience falls short the seller owes more airtime rather than a refund. The same companies now sell streaming in the same negotiations, so the rules of linear TV (guarantees, demos, make-goods, the broadcast calendar) have become the rules of premium CTV as well.

It is hard because the thing sold is not the thing delivered. The buyer contracts for an audience in a demographic; the seller delivers spots in programs; the audience is estimated weeks later by a measurement company whose methodology changes; and the gap between the guarantee and the delivery is settled in more spots, which themselves have to be scheduled, aired and measured. Meanwhile the spots must actually air, in the right break, with the right copy, not next to a competitor, with an as-run record proving it, and political ads must be sold at the lowest rate the station charges anyone. Addressable TV layers household-level targeting onto the same schedule, so one spot position can carry different ads to different homes.

This chapter covers the markets (upfront, scatter, direct response, local and national), the unit of sale (spots, dayparts, demos, GRPs and CPP), ratings guarantees and how shortfalls become additional units, traffic and the as-run log, creative identity with Ad-ID, political advertising's lowest unit charge, and addressable TV through set-top boxes, smart TVs and streaming. It extends `insertion_orders`, `line_items` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds upfront commitments, audience guarantees and spot airings. Audience measurement itself (panels, big data, ratings, universes, the JIC and Nielsen's accreditation) is [Audience & Cross-Media Measurement](/books/advertising/audience-measurement), which owns `measurement_currencies` and `audience_delivery_daily`; cost per point as a pricing model is [Pricing Models](/books/advertising/pricing-models); the standard terms and broadcast calendar billing are [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms) and [Billing & Invoicing](/books/advertising/billing-and-invoicing); make-goods as a delivery mechanism are [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency); political ad law is [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads).

## How the Platforms Do It

As of November 2026, from annual reports and company announcements. Rows are sellers of linear and converged TV time.

| Seller | What it sells | Markets and guarantees, by its own filings or announcements | Addressable or streaming |
| --- | --- | --- | --- |
| **Charter** (Spectrum Reach) | Local, regional and national time on cable networks; it inserts "local advertising on up to 100 channels in over 90 markets and on multiple streaming services" | Time "generally sold by our advertising sales force"; ad revenue higher in the second and fourth quarters and in even-numbered years | Lets cable networks "deploy household addressability"; a platform using "set-top box viewership data (all anonymized and aggregated)" |
| **Disney** | Broadcast, cable and streaming (Disney+, Hulu, ESPN) in one upfront | Presented at its May 2025 upfront with cross-service ad-supported audience | 164 million global ad-supported monthly active users across services (May 2025) |
| **E.W. Scripps** | National networks and local stations | Networks sell "in the upfront, scatter (together called general market), direct response" and connected TV markets; upfront and scatter "subject to ratings guarantees"; "Direct response advertising is not subject to ratings guarantees" | Connected TV named as a market for its networks |
| **Netflix** | Streaming only, sold in the upfront like TV | Presented at its May 13, 2026 upfront | More than 250 million monthly active viewers; programmatic pause and live ads |
| **Warner Bros. Discovery** | Cable and broadcast networks and streaming | Revenue varies with "the mix in sales of commercial time between the upfront and scatter markets"; "ratings guarantees" that "require us to provide additional advertising time if the guaranteed audience levels are not achieved" | Streaming sold alongside |

What the filings agree on is the shape: a forward market with guarantees, a spot market without (or with different) guarantees, and a duty to deliver extra time, not money, when the audience falls short.

## The Markets

**Upfront.** "In the upfront market, advertisers buy advertising time for upcoming seasons," Scripps's annual report says, locking in rates for the coming year. Sellers present their schedules in the spring (Netflix's 2026 upfront was May 13, Disney's 2025 upfront May 14) and negotiate commitments through the summer with agencies, which negotiate for many advertisers at once. An upfront deal is a dollar commitment for the season, a price (a CPM or a cost per point in a demographic), a measurement currency, a mix of networks and dayparts, and, usually, rights for the buyer to cancel part of the commitment for later quarters. The cancellation terms and typical shares are negotiated privately; no filing I found states them. <!-- source-gap: adv-upfront-cancellation-options | missing | typical upfront cancellation options (share of commitment and notice periods by quarter) | closes with: a filing, court record or published network or agency terms stating them | checked: 2026-11-22 -->

**Scatter.** "In the scatter market, advertisers buy their spots closer to the time when the spots will run," and "Scatter market pricing can vary from upfront pricing and can be volatile." Strong scatter demand raises the price of what's left: "The demand in the scatter market then impacts the pricing achieved for our remaining general market advertising inventory." For the software, scatter is shorter orders against the same inventory and the same guarantee mechanics.

**Direct response.** Time sold for a direct action (call, visit, buy), usually cheaper, preemptible and without ratings guarantees, since the buyer measures responses rather than audience.

**National and local.** Networks sell national time; stations and cable operators sell local time in the breaks the network leaves for them. Scripps's local stations sell "to local and national businesses," national time "generally sold by calling upon advertising agencies," often through representation firms (iHeartMedia's Katz Media describes itself as "a leading media representation firm in the U.S."). Charter inserts local ads into cable networks' local breaks. One program therefore carries national spots sold by the network and local spots sold by hundreds of stations and operators, each with its own system.

**Seasonality and cycles.** Charter's ad revenue is "generally higher in the second and fourth calendar quarters" and benefits in even-numbered years from political advertising; Scripps's political revenue was 1.5% of its local media revenue in 2025, "a non-election year." [Forecasting & Avails](/books/advertising/forecasting-and-avails) covers why a seller's inventory model needs both cycles.

## Spots, Demos and Points

The unit of linear TV is the **spot**: a commercial of a stated length (15, 30 or 60 seconds, with 30 the reference) in a break in a program, network or station, and **daypart** (prime, daytime, late night, sports). Prices are set per unit, per daypart, per network, and spots are scheduled against a **rotation** (a network and daypart, with the exact program chosen later) or fixed to a program.

The buyer's measure is the audience in a **demographic** (a demo, such as adults 25-54 or women 18-49). A **rating point** is 1% of that demo's universe; **gross rating points** (GRPs) are the sum of ratings across a schedule's spots, so a schedule's reach times its average frequency. A **cost per point** (CPP) is the price of one point; a schedule's cost is its CPP times the GRPs it delivers, which makes CPP and CPM two ways of quoting the same guarantee. The rating comes from the currency named in the deal and its viewing window (live, live plus same day, plus three or seven days of time-shifted viewing), measured on the average commercial minute or, increasingly, the exact spot. [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) covers ratings, universes and currencies; [Pricing Models](/books/advertising/pricing-models) covers CPP as a billing model.

An example with round numbers: an upfront schedule guarantees 1,000 GRPs in adults 25-54 at a $5,000 CPP, a $5,000,000 schedule. If the universe is 130 million adults 25-54, each point is 1.3 million impressions, and the guarantee is 1.3 billion demo impressions, equivalent to a CPM of $3.85 in that demo. If the schedule posts 900 GRPs on the agreed currency, the seller owes the 100 missing points, worth $500,000 at the deal's CPP, as additional spots.

## Guarantees and Make-Goods

A ratings guarantee is a promise of an audience on a currency, not of spots. The filings describe the remedy the same way: guarantees "require us to provide additional advertising time if the guaranteed audience levels are not achieved" (Warner Bros. Discovery, Scripps). The extra spots, often called audience deficiency units, are not sold to anyone else: they are inventory withheld from sale to settle the shortfall, which is why a seller's inventory forecast has to reserve for them.

The lifecycle is a loop:

1. **Book** the schedule with its guarantee: demo, currency and stream, guaranteed impressions or GRPs, and the CPM or CPP.
2. **Air** the spots, recording each airing.
3. **Post** when ratings arrive: match airings to the currency's ratings for each spot or commercial minute, sum impressions or GRPs in the demo, compare with the guarantee pro rata to what has aired.
4. **Settle** the shortfall with additional units, scheduled into later inventory, posted the same way; or, when the season ends with an unsettled deficiency, by whatever the contract says (more time in the next season, or a credit).
5. **Restate** when the currency reissues data, which moves posted delivery without any spot changing.

The posting is only as stable as the measurement: the MRC's 2026 review of Nielsen's Big Data + Panel service described "seemingly unusual changes in measurement results" in the first half of 2025, and a methodology change can move posted delivery for a whole schedule. That is why the guarantee records the currency and its methodology version, not just "Nielsen," and why [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) keeps `methodology_versions`.

In this volume's model, a shortfall is a `make_goods` row ([Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) owns the table) with the remedy `makegood_flight` and the additional units as a make-good line item, measured on the measurement vendor. What linear adds is the guarantee itself and the posting against it, which the tables below hold.

## Traffic and the As-Run Log

Between the sale and the screen sits **traffic**: turning orders into a log of which spot airs in which break. The seller's traffic system places spots under the rules of each order and the station's or network's own (separation between competitors, no two spots for the same product in a break, program restrictions, priorities among direct response, preemptible and fixed spots), and the advertiser's agency sends **traffic instructions** saying which copy rotates in which flight.

After air, the **as-run log** records what actually ran: each spot's air time, break, program, length and creative ID, and whether it ran as scheduled, was preempted or missed. It is the seller's proof of performance, the basis of the invoice, and the input to posting; a spot that didn't run isn't billed and isn't posted, and a spot that ran in the wrong program may be owed a make-good under the order's terms. Digital out-of-home has the same idea under the name affidavit or proof of play.

**Creative identity.** Each commercial carries a code that every system uses: Ad-ID, "The Industry's Ad Registry," run by a company held by the 4A's and the ANA, identifies advertising assets across "Every Creative. Every Platform. Every Format. Everywhere." In digital video the same ID travels as VAST's `UniversalAdId` with `idRegistry="ad-id.org"`, which is how a TV measurer, an ACR provider and a streaming ad server recognize the same spot. [VAST & Video Ads](/books/advertising/vast-and-video-ads) makes the universal ad ID required on every video creative for exactly this reason.

## Political Advertising on Broadcast

US broadcast stations sell candidate ads under federal rules that don't apply to other advertisers. The most consequential for the software is the **lowest unit charge**: during "the 45 days preceding the date of a primary or primary runoff election" and "the 60 days preceding the date of a general or special election," a legally qualified candidate pays no more than "the lowest unit charge of the station for the same class and amount of time for the same period" (47 CFR 73.1942). So a station's rate system must be able to compute, for any class of time and period, the lowest rate it actually charged any advertiser, including discounts, and apply it to candidate orders in the windows. Political ad law more broadly (disclosure, public files, platform rules) is [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads).

## Addressable TV

Addressable TV sends different ads to different households in the same spot position on linear TV. The ways it reaches the screen:

- **Set-top boxes.** Cable and satellite operators replace a spot in a network's break, per household, from ads cached on or streamed to the box. Charter describes letting cable networks "deploy household addressability" and a platform built on "set-top box viewership data (all anonymized and aggregated)," with "multi-screen deterministic attribution services for television and streaming services."
- **Smart TVs.** The TV itself detects a linear break (by ACR or by signals in the broadcast) and replaces the ad with one fetched over the internet. [Connected TV & Streaming](/books/advertising/connected-tv) covers ACR and its consent rules.
- **Streaming of linear.** vMVPDs and network streaming apps deliver linear channels over the internet, with breaks filled by server-side insertion, which makes every household addressable. [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion) covers the stitching.

Addressable impressions are counted like digital ones (served, played, measured), while the rest of the break is measured like TV, so one schedule carries both an impression count and a ratings post. The MRC keeps separate guidance for set-top box data (the Multi-Channel Digital Video Data Capture, Accumulation and Processing Guidelines for return path data, issued June 2012), which is the data behind most addressable reporting.

## How It Converges with Streaming

Streaming services now sell in the upfront, against guarantees, on the same agencies' plans, and the deals mix linear and streaming. Netflix presents at an upfront; Disney sells Disney+, Hulu and ESPN with its networks; Warner Bros. Discovery and Scripps list connected TV as a market beside upfront and scatter. Two engineering consequences follow:

- **One guarantee, several counts.** A cross-platform guarantee may combine linear ratings with digital impressions, deduplicated or not, on one currency or several. [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) covers the MRC's cross-media standard; the deal record must say which counts combine and how.
- **Make-goods in either medium.** A linear shortfall can be settled with streaming impressions and the reverse, so make-good inventory is a pool across platforms, priced at the guarantee's CPM or CPP.

## How to Build It

The core model holds the upfront deal as an `insertion_orders` row and each network-daypart buy as `line_items` with `pricing_model = 'cpm'` (or the CPP model [Pricing Models](/books/advertising/pricing-models) adds); [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) adds `measurement_currencies`, `methodology_versions`, `universe_estimates`, `audience_delivery_daily`, and on `insertion_orders` the `audience_currency_id`, `guarantee_demo` and `guarantee_market`; [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) adds `make_goods`; [Ad Servers](/books/advertising/ad-servers) adds `exclusion_labels` for competitive separation; [VAST & Video Ads](/books/advertising/vast-and-video-ads) adds the universal ad ID to `creatives`. This chapter adds the upfront commitment above the orders, the guarantee each line item carries and its posting, and the as-run record of each spot.

```sql
CREATE TABLE upfront_commitments (        -- an advertiser's or agency's season commitment with one seller
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_org_id         UUID NOT NULL REFERENCES organizations (id),
  buyer_org_id          UUID NOT NULL REFERENCES organizations (id),  -- the agency, or the advertiser's org
  advertiser_id         UUID REFERENCES advertisers (id),             -- null: an agency-level commitment
  season                DATERANGE NOT NULL,   -- in the broadcast calendar's months
  market                TEXT NOT NULL CHECK (market IN ('upfront', 'scatter', 'direct_response')),
  currency              CHAR(3) NOT NULL,
  committed_minor       BIGINT NOT NULL CHECK (committed_minor >= 0),
  audience_currency_id  UUID REFERENCES measurement_currencies (id),
  demo                  TEXT,                 -- 'P25-54'; null for direct response
  price_basis           TEXT NOT NULL CHECK (price_basis IN ('cpm', 'cpp', 'unit_rate')),
  price_micros          BIGINT,               -- CPM or CPP in micros of the currency
  options               JSONB NOT NULL DEFAULT '[]',
                                              -- [{"quarter": "2027Q1", "cancellable_bp": ..., "notice_by": "..."}]
  platforms             TEXT[] NOT NULL,      -- {'linear','streaming'}: which media count toward it
  status                TEXT NOT NULL CHECK (status IN ('negotiating', 'agreed', 'active',
                          'completed', 'cancelled')),
  agreed_at             TIMESTAMPTZ,
  CHECK (market = 'direct_response' OR audience_currency_id IS NOT NULL)
);

ALTER TABLE insertion_orders ADD COLUMN upfront_commitment_id UUID;  -- the quarter's order under a commitment
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_upfront_fk
  FOREIGN KEY (upfront_commitment_id) REFERENCES upfront_commitments (id) NOT VALID;

CREATE TABLE audience_guarantees (        -- what a line item promises, on which currency, and how it posted
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id           UUID NOT NULL REFERENCES line_items (id),
  currency_id            UUID NOT NULL REFERENCES measurement_currencies (id),
  methodology_version_id UUID REFERENCES methodology_versions (id),  -- as of booking
  demo                   TEXT NOT NULL,
  market                 TEXT NOT NULL,
  stream                 TEXT NOT NULL,       -- the viewing window, as audience_delivery_daily names it
  measure                TEXT NOT NULL CHECK (measure IN ('average_commercial_minute',
                           'exact_spot', 'impressions')),
  guaranteed_impressions BIGINT,              -- projected demo impressions
  guaranteed_grp_hundredths BIGINT,           -- or points, in hundredths
  posted_impressions     BIGINT NOT NULL DEFAULT 0,
  posted_grp_hundredths  BIGINT NOT NULL DEFAULT 0,
  posted_through         DATE,                -- airings posted up to this day
  shortfall_impressions  BIGINT NOT NULL DEFAULT 0,  -- computed at each post; settled by make_goods
  posting_version        INT NOT NULL DEFAULT 0,     -- bumped when the currency restates
  CHECK (guaranteed_impressions IS NOT NULL OR guaranteed_grp_hundredths IS NOT NULL),
  UNIQUE (line_item_id, currency_id, demo, market, stream)
);

CREATE TABLE spot_airings (               -- the as-run record: one spot as it actually aired, or didn't
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id          UUID NOT NULL REFERENCES line_items (id),
  property_id           UUID NOT NULL REFERENCES properties (id),  -- the network or station (kind 'channel')
  creative_id           UUID REFERENCES creatives (id),           -- by Ad-ID; null if the copy was wrong
  ad_id_code            TEXT NOT NULL,      -- the Ad-ID as logged
  scheduled_at          TIMESTAMPTZ NOT NULL,
  aired_at              TIMESTAMPTZ,        -- null when not aired
  length_s              SMALLINT NOT NULL CHECK (length_s > 0),
  program_ref           TEXT,
  break_ref             TEXT,               -- the break or pod in the log
  daypart               TEXT,
  status                TEXT NOT NULL CHECK (status IN ('scheduled', 'aired', 'preempted',
                          'missed', 'aired_off_schedule', 'cancelled')),
  is_makegood           BOOLEAN NOT NULL DEFAULT FALSE,
  make_good_id          UUID REFERENCES make_goods (id),  -- the shortfall this unit settles
  rate_minor            BIGINT,             -- the unit rate billed, in minor units
  political             BOOLEAN NOT NULL DEFAULT FALSE,   -- a candidate spot, subject to LUC windows
  rate_class            TEXT,               -- the class of time, for lowest unit charge
  source_log_ref        TEXT NOT NULL,      -- the traffic system's as-run file and line
  CHECK (status <> 'aired' OR aired_at IS NOT NULL),
  CHECK (NOT is_makegood OR make_good_id IS NOT NULL)
);

CREATE INDEX spot_airings_line_item_idx ON spot_airings (line_item_id, aired_at);

ALTER TABLE make_goods DROP CONSTRAINT make_goods_reason_check;
ALTER TABLE make_goods ADD CONSTRAINT make_goods_reason_check
  CHECK (reason IN ('under_delivery', 'omission', 'discrepancy', 'reporting_failure',
    'audience_deficiency', 'preemption', 'other')) NOT VALID;  -- widened; old rows already satisfy it
ALTER TABLE make_goods ADD COLUMN audience_guarantee_id UUID;
ALTER TABLE make_goods ADD CONSTRAINT make_goods_audience_guarantee_fk
  FOREIGN KEY (audience_guarantee_id) REFERENCES audience_guarantees (id) NOT VALID;
```

Posting a guarantee is a join from airings to the currency's delivered audience. In this model `audience_delivery_daily` holds the currency's projected demo impressions per line item per day, so the post sums it through the last day with ratings and compares with the guarantee, pro rata to what has aired:

```sql
-- post one impressions guarantee through the latest day the currency has delivered;
-- a points guarantee compares grp_hundredths the same way
WITH delivered AS (
  SELECT g.id AS guarantee_id,
         SUM(a.impressions)                     AS impressions,
         SUM(a.grp_hundredths)                  AS grp_hundredths,
         MAX(a.day)                             AS through_day
  FROM audience_guarantees g
  JOIN audience_delivery_daily a
    ON a.line_item_id = g.line_item_id AND a.currency_id = g.currency_id
   AND a.demo = g.demo AND a.market = g.market AND a.stream = g.stream
  WHERE g.id = $1
  GROUP BY g.id
),
aired AS (                                       -- share of booked units that have aired
  SELECT g.id AS guarantee_id,
         COUNT(*) FILTER (WHERE s.status IN ('aired', 'aired_off_schedule')
                          AND NOT s.is_makegood)::numeric
           / NULLIF(COUNT(*) FILTER (WHERE NOT s.is_makegood
                                     AND s.status <> 'cancelled'), 0) AS aired_share
  FROM audience_guarantees g
  JOIN spot_airings s ON s.line_item_id = g.line_item_id
  WHERE g.id = $1
  GROUP BY g.id
)
UPDATE audience_guarantees g
SET posted_impressions    = d.impressions,
    posted_grp_hundredths = d.grp_hundredths,
    posted_through        = d.through_day,
    shortfall_impressions = GREATEST(0,
      ROUND(g.guaranteed_impressions * a.aired_share) - d.impressions),
    posting_version       = g.posting_version + 1
FROM delivered d JOIN aired a USING (guarantee_id)
WHERE g.id = d.guarantee_id;
```

Design notes:

- **The commitment is above the orders.** An upfront is a season's dollars with options; each quarter's orders hang under it, so cancellations and the commitment's fulfillment are sums over orders, not edits to one big order.
- **A guarantee names its currency, demo, stream and measure,** and the methodology version in force at booking, so a restatement or a methodology change is visible as such rather than as a delivery change.
- **The as-run log is the record of truth for what aired.** Billing reads aired spots; posting reads airings joined to ratings; disputes read the log line. `source_log_ref` points to the traffic system's file so a disputed spot can be traced to the station's log.
- **Additional units point at their deficiency.** A make-good spot is an airing with `is_makegood` and a `make_good_id`, and the deficiency points at the guarantee, so the loop (shortfall, units scheduled, units aired, units posted, shortfall closed) is queryable.
- **Shortfall is pro rata to what has aired.** Posting mid-flight against the full guarantee overstates the deficiency; the sketch scales by aired share, and the final post at flight end compares the whole.
- **Political spots carry their rate class.** Lowest unit charge is computed per class and period from what the station actually charged, so the rate on every airing is kept with its class.
- **Widening a check is safe as `NOT VALID`.** The make-good reasons are a superset of the old list, so existing rows satisfy the new check; it is added `NOT VALID` and validated later like any other.

## Auditing

- **What was promised.** Each commitment's dollars, price basis, demo, currency and options; each guarantee's currency, methodology version, stream and measure.
- **What aired.** Every spot with its scheduled and aired times, program, break, length, Ad-ID and status, linked to the traffic system's log, kept through the guarantee's settlement and the dispute period.
- **How it posted.** Each posting run with the currency data version it used, the delivered demo impressions and GRPs, the aired share and the computed shortfall.
- **How shortfalls were settled.** Every make-good with its reason, the additional units scheduled, aired and posted, and any credit issued, so an advertiser's question "were we made whole?" has a numeric answer.
- **What candidates paid.** For political spots in the windows, the class of time, the rate charged and the lowest rate charged to any advertiser for that class and period.

## What This Means for the System You Build

- **Model the upfront as a commitment above the orders,** with options as data and a measurement currency on every guaranteed market.
- **Attach a guarantee to each line item** with its currency, methodology version, demo, stream and measure, and post it from the currency's delivered audience.
- **Keep an as-run record for every spot,** from the traffic system's log, and bill and post only from it.
- **Settle shortfalls with make-good units that point at their deficiency,** and reserve inventory for them in the forecast.
- **Identify every commercial by Ad-ID** and carry the same ID as the universal ad ID in digital, so linear and streaming records join.
- **Compute lowest unit charge from rates actually charged** by class and period, and apply it to candidate spots in the windows.
- **Record addressable impressions and ratings posts side by side** on schedules that carry both.

## References

**Regulation**

- [47 CFR 73.1942: Candidate rates (Cornell LII)](https://www.law.cornell.edu/cfr/text/47/73.1942), the 45-day and 60-day windows and the lowest unit charge for the same class and amount of time

**Specifications**

- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), the Multi-Channel Digital Video Data Capture, Accumulation and Processing (return path data) Guidelines, June 2012

**Filings**

- [Charter Communications: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1091667/000109166726000017/chtr-20251231.htm), Spectrum Reach, local insertion on up to 100 channels in over 90 markets, household addressability, set-top box viewership data, seasonality and political cycles
- [E.W. Scripps: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/832428/000083242826000010/ssp-20251231.htm), upfront, scatter, direct response and connected TV markets, ratings guarantees and additional time, local and national sales, political advertising's share in 2025
- [iHeartMedia: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1400891/000162828026013221/ihrt-20251231.htm), Katz Media as a media representation firm
- [Warner Bros. Discovery: Annual Report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1437107/000143710726000020/wbd-20251231.htm), the upfront and scatter mix, ratings guarantees requiring additional advertising time

**In practice**

- [AD-ID](https://www.ad-id.org/), the industry's ad registry, its ownership by a company of the 4A's and the ANA, cross-platform identification of creative
- [MRC: Update on the Nielsen National Big Data + Panel service (March 3, 2026, PDF)](https://www.mediaratingcouncil.org/sites/default/files/News/MRC%20Releases%20Update%20on%20the%20MRC-Accredited%20Nielsen%20National%20Big%20Data%20%2B%20Panel%20Television%20Service.pdf), "seemingly unusual changes in measurement results" in the first half of 2025
- [Netflix: Upfront 2026 (May 13, 2026)](http://about.netflix.com/en/news/netflix-upfront-2026-get-closer), the 2026 upfront and its audience figure
- [The Walt Disney Company: Upfront 2025 (May 14, 2025)](https://thewaltdisneycompany.com/news/upfront-2025/), the cross-service upfront and ad-supported audience
