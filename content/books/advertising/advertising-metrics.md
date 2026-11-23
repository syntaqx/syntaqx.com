+++
title = "Advertising Metrics"
description = "One definition per advertising metric over the volume's tables: CPM, eCPM, RPM, fill, win rate, CTR, CVR, ROAS, ACoS, CPI, viewability, IVT, reach and GRP."
category = "Advertising Industry"
order = 2974
part = "Running the Platform"
tags = ["advertising", "metrics", "analytics", "measurement", "data-model"]
+++

Advertising runs on a few dozen ratios, and almost every one of them is computed differently by the parties reading it. A CPM is the price a buyer bid, the price it cleared at, the price after the DSP's fee or the price the publisher received, depending on whose report it is. A win rate divides by bids in one tool and by bid requests in another. A conversion rate can exceed 100% in one platform and never can in another. ROAS on a dashboard counts the platform's attributed conversions under its own window; ROAS in a finance deck counts orders in the order book. Viewability is a share of measured impressions, not of all impressions. Reach can't be added up, and a GRP is a sum of percentages. When two parties argue about a number, the argument is usually about the definition, and the definition was never written down.

This chapter owns the volume's metric definitions: one definition per metric, the formula over the volume's tables, the chapter that owns the underlying concept, and where the common variants disagree. Earlier chapters store the inputs (requests, auctions, bids, events, billable days, conversions, attribution credits, viewability measurements, invalid traffic findings, audience exposures) and point here for the arithmetic. The general method (a versioned definition with its unit, grain, population and business date; frozen periods; reconciliation to the source) is the playbook's [One Definition per Metric](/docs/data/data-pipelines#one-definition-per-metric). The advertiser's business metrics after the ad (customer acquisition cost, lifetime value, contribution after ads) belong to Commerce's [Commerce Metrics](/books/commerce/commerce-metrics) and Gaming's [Game Metrics](/books/gaming/game-metrics); payment metrics to Payments' [Payments Metrics](/books/payments/payments-metrics). The chapter adds `metric_definitions` and `metric_values` in the same shape as the other volumes' metrics chapters.

## Why the Same Metric Disagrees

Six choices change most numbers in this chapter, and each definition below states them:

- **Whose count.** The publisher's ad server, the exchange, the DSP, the advertiser's ad server or a measurement vendor; `delivery_daily.source` keeps one row per source, and the insertion order names the controlling one ([Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms)). An impression count without a source is not a number anyone can bill or reconcile.
- **Whose money.** Gross (what the advertiser paid, fees included), media cost (what the DSP paid the exchange), or seller net (what the publisher received). The core model's gross-versus-net split ([The Core Data Model](/books/advertising/advertising-business#the-core-data-model)) applies to every price metric.
- **The denominator.** Impressions served, measured, viewable or valid; bids or bid requests; clicks or interactions; page views, sessions or ad requests. A ratio with an unstated denominator is two different metrics sharing a name.
- **Invalid traffic.** Before or after filtering, general only or sophisticated as well, as of which classification run. Billable metrics are after filtering; diagnostic ones are often before.
- **The attribution setting.** Every conversion-based metric (CVR, CPA, ROAS, ACoS) depends on the model and windows ([Attribution](/books/advertising/attribution)); Google's conversion rate "might be over 100%" when counting "Every" conversion per interaction.
- **The clock.** Event time or arrival time; the ad account's, the contract's or the publisher's time zone; the day of the impression or the day of the conversion. A ROAS computed by impression day and one computed by conversion day are both right and different.

My rule, as in the other volumes ([Why the Same Metric Disagrees](/books/commerce/commerce-metrics#why-the-same-metric-disagrees) in Commerce): every metric is a versioned definition with its source, money basis, denominator, IVT treatment, attribution setting and clock; every report names the definition and version it used; a reported period is frozen, and late events, IVT findings and attribution updates create restatements rather than silent changes.

## How the Platforms Report

The published definitions the chapter's own definitions are checked against, as of November 2026:

| Source | Metric | Definition as published |
| --- | --- | --- |
| **Amazon Ads** | ACoS | "(ad spend ÷ ad revenue) x 100"; ROAS is "the inverse of Amazon ACOS", ad revenue ÷ ad spend |
| **Display & Video 360** | Win rate | "The percentage of impressions won out of all impressions bid on by Display & Video 360" |
| **Google AdSense and Ad Manager** | RPM, fill rate, viewable rate, sell-through | Page RPM "(Estimated earnings / Number of page views) * 1000"; viewable rate "(viewable impressions ∕ measurable impressions) × 100" ([The Yield Metrics](/books/advertising/publishers-and-yield#the-yield-metrics)) |
| **Google Ads** | CTR | "clicks ÷ impressions = CTR" |
| **Google Ads** | Conversion rate | Conversions divided by "the number of total ad interactions that can be tracked to a conversion during the same time period"; over 100% possible when counting every conversion |
| **Google Ads** | Target ROAS | "$5 USD in sales ÷ $1 USD in ad spend x 100% = 500% target ROAS" |
| **MRC** (Cross-Media Audience Measurement Standards) | Reach, frequency, GRP | Reach: unique audience with a viewable impression ÷ universe × 100; frequency: viewable impressions ÷ unique audience with a viewable impression; GRP: "Reach multiplied by Frequency", equivalently viewable impressions ÷ universe × 100 |
| **AppsFlyer** (via Gaming) | CPI, eCPI | The "predetermined price that the advertiser agrees to pay the publisher every time a user installs their app as a direct result of an ad"; eCPI the effective price ([CPI, ROAS and Payback](/books/gaming/mobile-games#cpi-roas-and-payback)) |

Two things stand out. The platforms mostly agree on formulas and disagree on populations (which interactions, which conversions, which impressions are measurable). And the most-quoted ratios on the buy side are percentages in one place and multipliers in another: Google expresses target ROAS as 500%, Amazon expresses ROAS as 2 and ACoS as 50%. The definitions below store ratios as plain ratios and format them at display.

## Prices

All prices are in the core's units: CPMs and bids in integer micros of the currency, accumulated cost in micros, invoice amounts in minor units. A CPM in micros is `cost_micros × 1000 / impressions`.

| Metric | Definition | Over | Owning chapter |
| --- | --- | --- | --- |
| **CPM** (cost per mille) | Cost ÷ impressions × 1,000, on one source's billable count, after IVT filtering | `delivery_daily.cost_micros`, `impressions` | [Pricing Models](/books/advertising/pricing-models) |
| **Clearing CPM** | The price the winner paid in the auction, before downstream fees | `auctions.clearing_cpm_micros` | [Auction Mechanics](/books/advertising/auction-mechanics) |
| **Bid CPM** | The price bid, after shading | `bids.price_cpm_micros` | [Demand-Side Platforms](/books/advertising/demand-side-platforms) |
| **eCPM** (effective CPM) | Revenue (seller side) or cost (buyer side) ÷ impressions × 1,000, whatever the pricing model the buyer used | `delivery_daily`, or the publisher's earnings | [Publishers & Yield](/books/advertising/publishers-and-yield#the-yield-metrics) |
| **vCPM** | Cost ÷ viewable impressions × 1,000, under a named viewability standard | `delivery_daily.viewable_impressions` | Pricing Models; [Viewability & Attention](/books/advertising/viewability-and-attention) |
| **CPC** | Cost ÷ valid clicks | `delivery_daily.clicks` | Pricing Models |
| **CPA** | Cost ÷ attributed conversions of the named action, under a named attribution setting | `attribution_credits`, `conversions` | [Attribution](/books/advertising/attribution); [Automated Bidding](/books/advertising/automated-bidding) |
| **CPI** | Cost ÷ attributed installs; eCPI when bought on another basis | `conversions` with `kind = 'install'` | [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners); [Gaming](/books/gaming/mobile-games#cpi-roas-and-payback) |
| **CPV, CPCV** | Cost ÷ views under the line item's view definition; cost ÷ completed views | `delivery_daily.views`, `completed_views` | Pricing Models; [VAST & Video Ads](/books/advertising/vast-and-video-ads) |
| **Take rate** | One intermediary's fees ÷ the spend that passed through it, on matched logs | `log_match_runs`, `fee_terms` | [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) |

Notes on the variants:

- **A CPM names its money basis.** The gross CPM an advertiser sees, the media CPM the DSP paid, the clearing CPM at the exchange and the publisher's net eCPM are four numbers for the same impression; the definition records which. With [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#a-fee-chain-worked)'s illustrative chain (agency 5%, DSP 15%, data and verification 8% and SSP 20%), a $10.00 gross CPM reaches the publisher as $5.85.
- **eCPM is an effective price,** not a pricing model: a CPC line item that paid $1.50 for 0.5% CTR has an eCPM of $7.50. It is the comparison metric across pricing models and the publisher's yield number; a CPM line item's eCPM equals its CPM only when nothing was free or credited.
- **CPA and CPI inherit their attribution.** The same spend over the same purchases gives different CPAs under 7-day-click and 1-day-click; the definition records the setting, and a platform-reported CPA is stored next to the advertiser's own, not instead of it.

## Publisher Yield

[Publishers & Yield](/books/advertising/publishers-and-yield#the-yield-metrics) owns these and their formula chain; they are restated here so the whole volume has one list:

| Metric | Definition | Over |
| --- | --- | --- |
| **Ad requests** | Requests the ad server received for an ad unit | `ad_requests` (sampled at scale; counted in aggregates) |
| **Fill rate** | Filled ad requests ÷ ad requests | `ad_decisions.outcome` not `'unfilled'` |
| **Page RPM** | Estimated earnings ÷ page views × 1,000 | Earnings, `property_traffic_daily` |
| **Impression RPM** | Estimated earnings ÷ impressions × 1,000 (close to eCPM) | Earnings, impressions |
| **Sell-through rate** | Reserved impressions ÷ forecasted impressions × 100 | Forecasts and reservations ([Forecasting & Avails](/books/advertising/forecasting-and-avails#check-inventory-versus-sell-through)) |

Page RPM is the product of requests per page view, fill rate and eCPM ([The Formula Chain](/books/advertising/publishers-and-yield#the-formula-chain)); judging a yield change on eCPM alone misleads, because a higher floor raises eCPM and lowers fill. RPM is computed on estimated earnings, finalized later, so it is provisional for its period.

## Auction and Bidding

| Metric | Definition | Over | Owning chapter |
| --- | --- | --- | --- |
| **Bid rate** | Callouts answered with at least one bid ÷ callouts sent | `bid_requests.status` | [How Programmatic Works](/books/advertising/how-programmatic-works) |
| **Timeout rate** | Callouts that timed out ÷ callouts sent | `bid_requests.status = 'timeout'` | How Programmatic Works; [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale#the-latency-budget) |
| **Win rate** | Auctions won ÷ auctions bid in | `bids.outcome` | [Demand-Side Platforms](/books/advertising/demand-side-platforms) |
| **Render rate** | Impressions counted ÷ auctions won | `ad_events`, `bids` | [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) |
| **Shading** | 1 − bid ÷ unshaded bid, averaged over bids | `bids.price_cpm_micros`, `unshaded_cpm_micros` | Demand-Side Platforms |
| **Floor clearance** | Auctions with a bid at or above the floor ÷ auctions with a floor | `auctions.status` | [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization) |

The two denominators of win rate are the commonest disagreement on the buy side. Display & Video 360's help defines it over "all impressions bid on"; some reports divide by bid requests received, which mixes the bidder's selectivity into its competitiveness. The volume's definition is wins over bids; bids over bid requests is the bid rate, and the product of the two is wins over requests, a third metric with its own name (win rate on requests) when it is needed. A win is also not an impression: the render rate measures the gap, which is where lost creatives, page exits and invalid traffic show up.

## Engagement and Outcomes

| Metric | Definition | Over | Owning chapter |
| --- | --- | --- | --- |
| **CTR** | Valid clicks ÷ impressions, same source | `delivery_daily.clicks`, `impressions` | [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) |
| **CVR** (conversion rate) | Attributed conversions ÷ interactions that can be tracked to a conversion, same period, named action and setting | `attribution_credits`, `ad_events` | [Attribution](/books/advertising/attribution) |
| **Video completion rate (VCR)** | Completed views ÷ video starts | `ad_events` kinds `video_start`, `complete` | [VAST & Video Ads](/books/advertising/vast-and-video-ads) |
| **ROAS** | Attributed conversion value ÷ cost, as a ratio | `conversions.value_micros`, `attribution_credits.credit_ppm`, `delivery_daily.cost_micros` | Attribution; [Automated Bidding](/books/advertising/automated-bidding) |
| **ACoS** | Cost ÷ attributed sales, as a ratio; the inverse of ROAS | Same inputs | [Retail Media Networks](/books/advertising/retail-media-networks); [Commerce](/books/commerce/retail-media#measurement) |
| **Total ACoS (TACoS)** | Cost ÷ all sales of the advertised items, attributed or not | Cost, the advertiser's order book | [Commerce](/books/commerce/retail-media#measurement) |
| **Incremental ROAS (iROAS)** | Incremental conversion value from a lift test ÷ cost of the test cell | `lift_study_results` | [Incrementality & Lift](/books/advertising/incrementality-and-lift) |

Notes on the variants:

- **CTR counts valid clicks over the same source's impressions.** Click validation ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks#click-measurement-and-validation)) removes duplicates, stale clicks and invalid traffic; a CTR over raw clicks is a diagnostic, labeled as such.
- **CVR's denominator is interactions, and its numerator can exceed it.** Google's rule that counting every conversion can push the rate past 100% is correct for its definition; the volume's default counts one conversion per interaction per action, and "every" counting is a named variant.
- **ROAS and ACoS are the same measurement inverted,** with Amazon's example: $50 of spend that earns $100 is ACoS 50% and ROAS 2. Both are attributed figures and inherit the attribution's assumptions; TACoS and iROAS are the two numbers that don't depend on the platform's own attribution, which is why Commerce prefers TACoS for the business and Incrementality & Lift owns iROAS.
- **Credit is fractional under data-driven models.** `attribution_credits.credit_ppm` splits a conversion across touches, so attributed conversions and value are sums of credits, not counts of conversions.

## Quality

| Metric | Definition | Over | Owning chapter |
| --- | --- | --- | --- |
| **Measured rate** | Impressions measured as viewable or non-viewable ÷ rendered served impressions (the MRC's "Measured Rate") | `viewability_measurements.status` | [Viewability & Attention](/books/advertising/viewability-and-attention) |
| **Viewability rate** | Viewable impressions ÷ measured (viewable plus non-viewable) impressions, under a named standard | `viewability_measurements`, `delivery_daily.viewable_impressions` | Viewability & Attention |
| **Viewable impressions per impression** | Viewable ÷ all impressions | Same | Viewability & Attention |
| **IVT rate** | Invalid impressions ÷ gross impressions (valid plus invalid), by class (GIVT, SIVT) and measurer | `delivery_daily.invalid_impressions`, `sivt_impressions` | [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) |
| **Invalid click rate** | Invalid clicks ÷ gross clicks | `delivery_daily.invalid_clicks` | Invalid Traffic & Ad Fraud |
| **Brand-safe rate** | Impressions classified within the advertiser's suitability profile ÷ measured impressions | `brand_safety_daily` | [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability) |
| **Discrepancy** | (Controlling count − compared count) ÷ the named denominator count | `reconciliation_runs` | [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) |

Notes on the variants:

- **Viewability rate divides by measurable, not served.** Google divides by measurable impressions and the MRC by measured ones (viewable plus non-viewable); a vendor that can't measure 30% of impressions reports a rate over the 70% it saw. A buyer comparing two sellers needs the measured rate beside the viewability rate, or viewable over all impressions, which is the honest single number.
- **The standard is part of the definition.** The MRC's display standard (50% of pixels for one continuous second), its video standard (50% of pixels for two continuous seconds of play) and the cross-media standard (100% of pixels for two seconds) give three different viewability rates for the same video impression; `viewability_standards` names which.
- **IVT rate's denominator is gross impressions,** because the valid count is what's left after removal. A rate over the valid count overstates it slightly and confuses readers; the definition says which.
- **Discrepancy has a direction and a denominator.** Reconciliation & Discrepancies stores both, because a 10% tolerance computed over the controlling count and over the compared count are different thresholds.

## Audience

| Metric | Definition | Over | Owning chapter |
| --- | --- | --- | --- |
| **Reach** | Unique audience with a viewable impression ÷ universe × 100 (or as a count) | Person- or household-level exposures, universe estimates | [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) |
| **Average frequency** | Viewable impressions ÷ unique audience with a viewable impression | Same | Audience & Cross-Media Measurement |
| **Rating** | Viewable impressions in a period ÷ universe × 100 | Same | Audience & Cross-Media Measurement |
| **GRP** (gross rating points) | Sum of ratings across a schedule; reach × frequency; viewable impressions ÷ universe × 100 | Same | Audience & Cross-Media Measurement; [Linear TV, Upfronts & Addressable TV](/books/advertising/linear-tv-and-upfronts) |
| **TRP** (target rating points) | GRPs against the buy's target demographic's universe | Same | Audience & Cross-Media Measurement |
| **Unique reach** (platform) | Distinct users or devices reached, as the platform deduplicates | Platform reports | Reporting & Data Pipelines |

The MRC's cross-media standard ties these together: reach, frequency and GRP are computed on viewable impressions, "filtered for SIVT", and its formula makes GRP equal to reach times frequency. Two practical rules follow. **Reach is never summed**: a schedule's reach is computed over the schedule, from person-level data or mergeable sketches ([Unique Metrics](/books/advertising/reporting-and-data-pipelines#unique-metrics)). **Platform reach is a different metric from audience-measurement reach**: a platform's unique reach counts the identifiers it can deduplicate (users, devices, cookies), while a rating-based reach is persons projected to a universe; they share a name and not a definition, and the definitions record which.

## Definitions as Code, Restatements as Rows

The playbook's rules apply, with three advertising additions:

- **Every count names its source.** Ad metrics are computed per `delivery_daily.source`, and a report that blends sources (the publisher's impressions with the vendor's viewability) says so in its definition. Partner-reported figures (a platform's ROAS, a vendor's IVT rate) are stored beside the computed ones with the partner's own definition text ([Reconcile to the Source](/docs/data/data-pipelines#reconcile-to-the-source)).
- **Maturity is part of the definition.** Impressions mature in hours, exchange counts in days, conversions with their attribution windows, IVT over weeks; a metric's definition states when a period is final, and dashboards show immature periods as provisional ([Late Data and Restatement](/books/advertising/reporting-and-data-pipelines#late-data-and-restatement)).
- **Attribution settings are definition parameters.** A conversion metric's definition includes the model and windows; changing them is a new version, and the old version's values stay reproducible.

## How to Build It

The chapter adds the definition and value tables the other volumes use; every formula above is a query over tables earlier chapters own.

```sql
CREATE TABLE metric_definitions (        -- one definition per metric, versioned
  key               TEXT NOT NULL,       -- 'cpm_gross', 'win_rate', 'viewability_rate_mrc_display'
  version           INT NOT NULL,
  unit              TEXT NOT NULL CHECK (unit IN ('ratio', 'cpm_micros', 'amount_micros',
                      'count', 'rating_points')),
  numerator         TEXT NOT NULL,       -- as written: 'valid clicks, same source'
  denominator       TEXT,                -- null for counts and amounts
  source_rule       TEXT NOT NULL,       -- a delivery_daily.source, 'controlling', or 'partner:<org>'
  money_basis       TEXT CHECK (money_basis IN ('gross', 'media_cost', 'clearing',
                      'seller_net')),    -- price metrics only
  ivt_treatment     TEXT NOT NULL CHECK (ivt_treatment IN ('after_givt_sivt', 'after_givt',
                      'before_filtering', 'not_applicable')),
  attribution_setting_ref TEXT,          -- conversion metrics: the model and windows
  viewability_standard TEXT,             -- viewability metrics: the standard's code
  clock             TEXT NOT NULL,       -- 'impression_day_account_tz', 'conversion_day', ...
  maturity_days     INT,                 -- when a period's value is final
  formula_ref       TEXT NOT NULL,       -- the SQL or model in version control
  owner_chapter     TEXT NOT NULL,       -- the chapter that owns the concept
  source_definition TEXT,                -- a partner's own wording, for imported metrics
  history_policy    TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  valid_during      DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (             -- computed, frozen when reported
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key        TEXT NOT NULL,
  metric_version    INT NOT NULL,
  period            DATERANGE NOT NULL,
  scope             JSONB NOT NULL DEFAULT '{}',  -- {"line_item_id": "..."}, {"seller_account_id": "..."}
  value             NUMERIC NOT NULL,
  numerator         NUMERIC,
  denominator       NUMERIC,
  currency          CHAR(3),
  source            TEXT NOT NULL DEFAULT 'computed' CHECK (source IN ('computed',
                      'partner_reported')),
  aggregation_run_ids UUID[] NOT NULL DEFAULT '{}',  -- the runs it read (Reporting & Data Pipelines)
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  frozen_at         TIMESTAMPTZ,         -- reported to an advertiser, a publisher or an auditor
  supersedes_id     UUID REFERENCES metric_values (id),  -- a restatement is a new row
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

Prices, engagement and quality for a line item and period, from one source's billable rows, with the denominators kept so ratios can be recombined correctly:

```sql
SELECT d.line_item_id,
       sum(d.impressions)                                        AS impressions,
       sum(d.clicks)                                             AS clicks,
       sum(d.viewable_impressions)                               AS viewable,
       sum(d.invalid_impressions)                                AS invalid,
       sum(d.cost_micros)                                        AS cost_micros,
       sum(d.cost_micros) * 1000 / NULLIF(sum(d.impressions), 0) AS cpm_micros,
       sum(d.cost_micros) / NULLIF(sum(d.clicks), 0)             AS cpc_micros,
       sum(d.clicks)::numeric / NULLIF(sum(d.impressions), 0)    AS ctr,
       sum(d.viewable_impressions)::numeric
         / NULLIF(sum(d.impressions), 0)                         AS viewable_per_impression,
       sum(d.invalid_impressions)::numeric
         / NULLIF(sum(d.impressions + d.invalid_impressions), 0) AS ivt_rate
FROM delivery_daily d
WHERE d.line_item_id = $1
  AND d.source = $2                       -- the definition's source rule, e.g. the controlling source
  AND d.day >= $3 AND d.day < $4
GROUP BY d.line_item_id;
```

A worked check: 5,000,000 impressions and 12,500,000,000 cost micros ($12,500) give `cpm_micros` of 2,500,000, a $2.50 CPM. The viewability rate over measurable impressions needs `viewability_measurements` (the measurable count isn't on `delivery_daily`); `viewable_per_impression` here is the all-impressions variant.

ROAS and CPA under one attribution setting, from fractional credits, so data-driven models sum correctly:

```sql
WITH credited AS (
  SELECT ac.line_item_id,
         sum(ac.credit_ppm) / 1e6                                AS conversions,
         sum(c.value_micros::numeric * ac.credit_ppm / 1e6)      AS value_micros
  FROM attribution_credits ac
  JOIN conversions c ON c.id = ac.conversion_id
  WHERE ac.attribution_setting_id = $1
    AND ac.line_item_id = $2
    AND c.occurred_at >= $3 AND c.occurred_at < $4   -- by conversion time; the definition's clock
  GROUP BY ac.line_item_id
), spend AS (
  SELECT line_item_id, sum(cost_micros) AS cost_micros
  FROM delivery_daily
  WHERE line_item_id = $2 AND source = 'first_party'
    AND day >= $3::date AND day < $4::date
  GROUP BY line_item_id
)
SELECT s.cost_micros,
       c.conversions,
       c.value_micros,
       c.value_micros / NULLIF(s.cost_micros, 0)  AS roas,
       s.cost_micros / NULLIF(c.value_micros, 0)  AS acos,
       s.cost_micros / NULLIF(c.conversions, 0)   AS cpa_micros
FROM spend s LEFT JOIN credited c USING (line_item_id);
```

The sketch assumes conversions in one currency, the account's; a mixed-currency advertiser converts at the rate its definition names before summing. It mixes clocks deliberately (spend by impression day, conversions by conversion time) because that is the common platform convention; the definition records it, and a cohort version that credits conversions to the day of the interaction is a separate key.

Win rate and bid rate for a bidder per day, with both denominators:

```sql
WITH callouts AS (
  SELECT br.sent_at::date                                AS day,
         count(*)                                        AS callouts,
         count(*) FILTER (WHERE br.status = 'bid')       AS callouts_with_bids
  FROM bid_requests br
  WHERE br.bidder_org_id = $4 AND br.sent_at >= $2 AND br.sent_at < $3
  GROUP BY 1
), bid_counts AS (
  SELECT b.auction_started_at::date                      AS day,
         count(*)                                        AS bids,
         count(*) FILTER (WHERE b.outcome = 'won')       AS wins
  FROM bids b
  WHERE b.buyer_seat_id = $1
    AND b.auction_started_at >= $2 AND b.auction_started_at < $3
  GROUP BY 1
)
SELECT day, c.callouts, c.callouts_with_bids, b.bids, b.wins
FROM callouts c FULL JOIN bid_counts b USING (day)
ORDER BY day;
-- bid rate = callouts_with_bids / callouts; win rate = wins / bids
-- $1 the bidder's seat at this exchange, $4 the bidder's organization
```

Design notes:

- **Definitions name their source and money basis.** `source_rule` and `money_basis` make "CPM" four keys (`cpm_gross`, `cpm_media`, `cpm_clearing`, `ecpm_seller_net`) instead of one ambiguous one.
- **Ratios are stored with their parts.** `numerator` and `denominator` on `metric_values` let a dashboard combine periods and scopes correctly (sum the parts, then divide) instead of averaging ratios.
- **Partner figures sit beside ours.** A platform's ROAS or a vendor's IVT rate is a `metric_values` row with `source = 'partner_reported'` and the partner's wording in `source_definition`, next to the computed value under the same key.
- **Unique metrics are never summed.** Reach and frequency values carry their full scope and period in `scope` and `period`; a dashboard can't add two reach rows, because the definition's unit and the absence of a numerator say so.
- **Values remember their runs.** `aggregation_run_ids` ties each value to the aggregation runs it read, so a frozen figure can be reproduced after restatement.
- **Keep it off production.** These queries run on the warehouse or a replica from the same tables ([Separating Production and Analytics](/docs/data/separating-production-and-analytics)).

## Auditing

- **Every reported figure's definition and version,** with its source, money basis, denominator, IVT treatment, attribution setting, viewability standard and clock.
- **Frozen values and their restatements,** with the runs each read and the reason for each restatement.
- **Partner-reported figures** beside computed ones, with the partner's definition text and the date it was imported.
- **Definition changes,** with who approved them and from when they apply, so a trend line that crosses a change is marked.

## What This Means for the System You Build

- **Write one definition per metric** with its source, money basis, denominator, IVT treatment, attribution setting, clock and maturity, and version it.
- **Make every price metric say whose money it is:** gross, media cost, clearing or seller net.
- **Divide viewability by measured impressions** and show the measured rate beside it.
- **Define win rate as wins over bids,** and keep bid rate and render rate as their own metrics.
- **Store ROAS and ACoS as ratios from fractional credits** under a named attribution setting, and keep TACoS and iROAS as the checks that don't depend on it.
- **Compute reach and GRPs over the whole schedule,** on viewable impressions filtered for SIVT, and never sum reach.
- **Store ratios with their numerators and denominators,** freeze reported values, and restate as new rows.
- **Keep partner-reported metrics beside computed ones,** with the partner's own definition.

## References

**Specifications**

- [MRC: Cross-Media Audience Measurement Standards, Phase I Video](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Cross-Media%20Audience%20Measurement%20Standards%20%28Phase%20I%20Video%29%20Final.pdf), reach, frequency, rating and GRP formulas on viewable impressions filtered for SIVT, and the 100%-for-two-seconds cross-media threshold
- [MRC: Viewable Ad Impression Measurement Guidelines v2.0](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), the display (50% of pixels, one continuous second) and video (50% of pixels, two continuous seconds) viewable standards, and the Measured Rate and Viewable Rate formulas

**Reference**

- [Google Ads Help: Clickthrough rate (CTR)](https://support.google.com/google-ads/answer/2615875?hl=en), clicks ÷ impressions
- [Google Ads Help: Conversion rate](https://support.google.com/google-ads/answer/2684489?hl=en), the interaction denominator and rates over 100% when counting every conversion
- [Google Ads Help: About Target ROAS bidding](https://support.google.com/google-ads/answer/6268637?hl=en), the 500% target ROAS example
- [Amazon Ads: ACOS (advertising cost of sales)](https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales), the ACoS formula and ROAS as its inverse, with the $50 and $100 example
- [Google AdSense Help: Revenue per thousand impressions (RPM)](https://support.google.com/adsense/answer/190515?hl=en), the page RPM formula
- [Google Ad Manager Help: Interactive report metrics](https://support.google.com/admanager/table/16431202?hl=en), the viewable rate over measurable impressions and fill rate
- [Google Ad Manager Help: Future sell-through report](https://support.google.com/admanager/answer/16709101?hl=en), the sell-through rate formula
- [AppsFlyer: Cost per install](https://www.appsflyer.com/glossary/cost-per-install/), CPI and eCPI
- [Display & Video 360 Help: Use the Optimization view](https://support.google.com/displayvideo/answer/7563784?hl=en), win rate over impressions bid on, lost to bid and lost to budget
- [IAB Tech Lab: OpenRTB 2.6](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md), prices as CPMs in the bid request and response
