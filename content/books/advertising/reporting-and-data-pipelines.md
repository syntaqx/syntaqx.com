+++
title = "Reporting & Data Pipelines"
nav_title = "Reporting & Pipelines"
description = "From beacon to report: event pipelines, aggregation, late data and restatement, unique metrics, reporting APIs, and log-level data feeds sold to partners."
category = "Advertising Industry"
order = 2971
part = "Running the Platform"
tags = ["advertising", "reporting", "data-pipelines", "streaming", "data-model"]
+++

Every number an advertiser, agency, publisher or auditor reads comes out of a pipeline that turns request-path logs into counts. The impressions on an invoice, the spend in a dashboard, the ROAS an automated bidder optimizes against and the take rate an audit computes are all aggregations over the same events, made at different times, with different filters, by different parties. The pipeline is where those numbers are made consistent with each other or quietly made inconsistent, and most "the numbers don't match" tickets end up being a question about when a figure was computed and which events it had seen.

The engineering is hard for three reasons specific to advertising. Events arrive late, sometimes days late, and invalid traffic is found later still, so every figure is provisional for a period and then restated. The same events feed several outputs with different rules (real-time pacing, hourly dashboards, the billable daily count, attribution, model training, log-level feeds to partners), and each has its own clock and its own idea of final. And the outputs leave the building: reports through APIs that partners pull and store, and event-level files sold to buyers and publishers who will reconcile them against their own logs. This chapter covers the kinds of data a platform produces, the pipeline from beacon to `delivery_daily`, late data and restatement, dimensions and time zones, unique metrics, reporting APIs, log-level data feeds and deals, privacy in the pipeline, and storage. It extends `ad_events` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the report and export records other parts add.

Other chapters own the inputs. [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) (in Ad Serving and Creative) owns how a beacon becomes an event (`beacon_receipts`, `counting_policies`); Invalid Traffic & Ad Fraud owns classification; Attribution owns conversions and credit; Billing & Invoicing and Reconciliation & Discrepancies own what happens to `delivery_daily` once a period closes; Self-Serve Ad Platforms owns `report_jobs` and the API's access tiers; The Google Ad Tech Cases owns `data_exports` as a remedy. [Ad Platform Architecture](/books/advertising/ad-platform-architecture) owns the request path that emits the logs. The generic engineering is the playbook's: [Streaming](/docs/data/streaming), [Data Pipelines](/docs/data/data-pipelines), [Analytical Databases](/docs/data/analytical-databases) and [Separating Production and Analytics](/docs/data/separating-production-and-analytics). The metric definitions themselves are [Advertising Metrics](/books/advertising/advertising-metrics), at the end of this part.

## How the Platforms Do It

What platforms publish about their reporting is mostly about freshness and finality, which is what a partner pulling the data needs. As of November 2026:

| Platform | Freshness | Finality and restatement | Event-level data |
| --- | --- | --- | --- |
| **Google Ad Manager** | Impression, request, code serve and click Data Transfer files "Twice per hour", bid files "Once per hour"; "The majority of the data is delivered and available between 5 and 15 hours after the recorded hour" | "some delayed events can take up to 8 days after the event occurred"; files "older than 60 days are purged" | Data Transfer: event-level files (NetworkImpressions, NetworkBackfillImpressions, NetworkClicks, NetworkRequests, NetworkCodeServes and others), which "come at an additional cost" |
| **Google Ads** | Clicks, impressions and cost under "a 1-hour data freshness Service Level Objective"; conversions 3 hours on last click, 15 hours on other models; competitive metrics "typically updated once per day"; reach and frequency "created daily" | Invalid traffic removed "retroactively"; metrics "may occasionally be updated one or more days after an event occurs" | Not offered to advertisers as event logs |
| **Meta** (Insights API) | "Insights refresh every 15 minutes" | Insights "do not change after 28 days of being reported", and "may continue to update for a couple of days after an ad has completed" | Not offered; asynchronous report jobs whose `report_run_id` "expires after 30 days" |

Three patterns run across them: figures are provisional for a stated period and then final, unique metrics (reach) are computed separately and later than additive ones, and event-level data, where it's offered at all, is a paid product with a short retention window.

## Three Kinds of Data

A platform produces three different kinds of reporting data, and confusing them causes most disputes:

- **Event-level (log-level) data.** One row per request, auction, bid, impression, click or conversion, as each system logged it: the partitioned logs of the core model (`ad_requests`, `auctions`, `bids`, `ad_events`) and the logs other chapters add (`ad_decisions`, `bid_requests`, `beacon_receipts`). It is what a reconciliation, an audit, an attribution model or a model's training set needs. It is large, short-lived and full of identifiers.
- **Aggregated reporting.** Counts and sums by dimension and time: impressions, clicks, spend by line item, creative, placement and hour. It is what dashboards and reporting APIs serve. It is provisional until its inputs mature, and computed in a time zone.
- **Billable figures.** `delivery_daily`: one row per line item or deal, day and source, after invalid traffic filtering, with a version. It is what invoices are priced on and what reconciliation compares. It is final when the billing period closes, and changes after that become credits, not edits (Billing & Invoicing has `billing_periods` and the close).

The same impression appears in all three, at different times. A dashboard can show more impressions this morning than the invoice will next month, because the invoice is net of invalid traffic found in between, and both are correct for what they are. My rule: label every report with which kind of data it is, the version or run that produced it and whether its period is final, so a user comparing two numbers can see why they differ before they file a ticket.

## The Pipeline

The path from beacon to billable count has the same stages on every platform; what differs is how many of them run in a stream and how many in batch.

1. **Receive.** The counter verifies each beacon's signature, writes a `beacon_receipts` row with its outcome and, when the beacon counts, an `ad_events` row under its dedupe key ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks#deduplication)). This is the last step on the request path.
2. **Transport.** Request-path logs and events go to a partitioned, replicated log, keyed so that one impression's events land in order ([The Log](/docs/data/streaming#the-log)). The stream delivers at least once; deduplication is by key, not by delivery ([Exactly-Once, as Each Documents It](/docs/data/streaming#exactly-once-as-each-documents-it)).
3. **Enrich.** Each event is joined to the dimensions it needs (line item, campaign, ad account, advertiser, property, seller account) as of the serving snapshot that decided it, not as of today: a line item renamed or moved to another campaign tomorrow must not move yesterday's impressions.
4. **Classify.** Invalid traffic filters run in two passes: rules and lists in the stream (general invalid traffic, known data center ranges, duplicate and malformed events) and sophisticated detection in batch over hours or days, which flags events already counted (Invalid Traffic & Ad Fraud). The `ivt` flag changes; the event stays.
5. **Aggregate.** Hourly aggregates in event time per line item, creative, placement and the dimensions reports offer, for dashboards and pacing; then daily rollups in each ad account's or contract's time zone into `delivery_daily`, one row per source, with the counting policy and viewability standard that applied.
6. **Restate.** When late events or new invalid traffic findings arrive for a day already aggregated, the day is recomputed and `delivery_daily.version` increments; downstream consumers (billing, reports, partners) are told through `delivery_daily.restated` events ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
7. **Close.** At the billing period's close, the versions billing read are fixed; anything later lands in `late_impressions` or as an IVT credit, never as an edit to an invoiced count.

Two design choices decide whether this pipeline can be trusted. **It must be replayable**: every aggregate can be recomputed from the retained events and the versioned rules (counting policy, IVT rules, dimension snapshots), and a recomputation produces the same numbers ([Pipelines Must Be Replayable](/docs/data/data-pipelines#pipelines-must-be-replayable)). **There is one pipeline, not two**: a fast streaming path for dashboards and a separate batch path for billing, written by different teams with different rules, will disagree. The stream and the batch can be different engines, but they read the same events through the same definitions, and the batch result replaces the stream's provisional numbers rather than sitting beside them.

## Late Data and Restatement

Late data is not an edge case in advertising; it is a property of the inputs:

- **Beacons arrive late.** A phone loses signal mid-video and sends its quartile beacons when it reconnects; an SSAI service retries tracking calls; an app batches events.
- **Exchanges and partners report late.** Ad Manager's own event files are mostly available 5 to 15 hours after the hour, with stragglers "up to 8 days after the event occurred".
- **Invalid traffic is found late.** Sophisticated invalid traffic is often confirmed after an analysis over days or weeks; Google Ads removes invalid traffic "retroactively" and credits what it finds "after the billing cycle closes".
- **Conversions arrive late,** by their nature: Google reports conversions under other attribution models up to 15 hours later than last-click ones, and the purchase itself can follow the click by days.

The pipeline handles this with three mechanisms from the playbook ([Event Time and Processing Time](/docs/data/streaming#event-time-and-processing-time), [Watermarks and Late Data](/docs/data/streaming#watermarks-and-late-data), [Versions, Stamps and Frozen Periods](/docs/data/data-pipelines#versions-stamps-and-frozen-periods)), each with an advertising parameter:

- **Event time places the event.** `ad_events.occurred_at` from the beacon (within bounds) puts the event in its hour and day; `received_at` records when it arrived. A report by event time is the default; a report by arrival time is a pipeline-health view.
- **A watermark per source says when a period is complete enough.** Each source has a maturity: hours for the platform's own impressions, days for exchange reports and conversions, weeks for IVT. The watermark is per source because one slow partner must not hold every report back.
- **Finality is stated.** Every aggregate carries its version, and reports state the last day that won't change. Self-Serve Ad Platforms' `report_jobs.data_final_through` is the field; Meta's 28 days is a published version of the same promise. Before that date, a figure is provisional and labeled so.

My rule: restate by recomputing the whole day from events, never by adding deltas to the aggregate. A delta pipeline accumulates errors that no one can explain a month later; a recomputed day is the same number every time it is computed from the same inputs, and the difference between two versions is a query.

## Dimensions and Time Zones

Two dimension problems are specific to ad reporting:

- **Configuration changes underneath the counts.** Line items are renamed, moved between campaigns, retargeted and repriced mid-flight. Reports group by IDs and join names at display time, and anything that changes the meaning of a row (the pricing model, the goal, the targeting) is read from the version in force when the event happened, from `line_item_versions` ([Campaigns & Line Items](/books/advertising/campaigns-and-line-items#versioning-the-configuration)) or the serving snapshot. A report that shows today's targeting next to last month's delivery invites the wrong conclusion.
- **Days are in someone's time zone.** `delivery_daily.day` is in the ad account's time zone for a self-serve buyer and the contract's for a direct deal; a publisher's report is in the publisher network's zone; a broadcast month starts on a Monday (Billing & Invoicing). The pipeline keeps hourly aggregates in UTC and assigns each to a business day once per consumer's zone ([Assign the Business Date Once](/docs/data/data-pipelines#assign-the-business-date-once)). Comparing two parties' daily counts without converting zones produces a discrepancy that is pure arithmetic.

## Unique Metrics

Impressions, clicks and spend are additive: a week is the sum of its days, a campaign the sum of its line items. **Reach** and **frequency** are not: the people reached in a week are fewer than the sum of each day's reach, and a campaign's reach is less than the sum of its line items'. That makes them expensive and changes how they are served:

- **Computed from person-level or device-level data, per query shape.** A reach figure for an arbitrary date range and set of line items has to deduplicate across the whole set. Platforms restrict which shapes they offer: Google Ads creates unique reach "daily", and since June 10, 2025 Meta's API no longer returns `reach` for standard queries with breakdowns and start dates more than 13 months old, leaving asynchronous jobs at "up to 10 requests per Ad Account per day", and advises querying unique metrics "in a separate call" because they "are time consuming to compute".
- **Approximate by design.** At scale, distinct counts are computed with mergeable sketches (HyperLogLog and its relatives) kept per line item and day, so a range is a merge of sketches rather than a scan of identifiers; the estimate's error is a property of the sketch size and is stated with the figure.
- **Deduplicated only within what the identifiers allow.** Reach across devices needs a person identifier the consent state permits; reach across platforms needs a panel or a clean room. Cross-media reach under the MRC's standard is computed from viewable impressions assigned to persons and projected to a universe, which is Audience & Cross-Media Measurement's subject.

The rule for the pipeline: never sum a unique metric, never store one without the dimensions and period it was computed over, and never let a report total row add up reach.

## Reporting APIs

A reporting API is a public interface to the aggregated data, and the large platforms have converged on the same shape:

- **Asynchronous jobs for anything large.** The client submits a query, polls for status, and downloads a result file. Meta's guidance: poll until `async_status` is "Job Completed" and completion is 100, expect that "it can take up to an hour to complete a request including retry attempts", and don't store the job ID long-term because it "expires after 30 days". `report_jobs` in Self-Serve Ad Platforms is this record: the query (fields, breakdowns, date range and attribution setting), status, result location, row count, `data_final_through` and `expires_at`.
- **The attribution setting is part of the query.** A conversion count means nothing without its window and model. Meta changed this in 2025: from June 10, 2025, "the `use_unified_attribution_setting` and `action_report_time` parameters will be disregarded" and "standalone `inline` attribution window data will no longer be returned". A report job stores the setting it ran under so a stored row keeps its meaning.
- **Rate limits per application and account.** Access tiers and daily operation limits are per API client (`api_clients` in Self-Serve Ad Platforms); heavy queries cost more of the limit than light ones; and clients are told to back off, not retry harder ([Retry Budgets](/docs/architecture/retries-and-timeouts#retry-budgets)).
- **Finality in the response.** Every response says which days are final, so a client can stop re-pulling them. Without it, every client re-pulls a long trailing window every day, which becomes most of a reporting API's load.

Reporting APIs serve from the analytical store, never the transactional database, and usually from precomputed aggregates at the grains the API offers; arbitrary breakdowns are what asynchronous jobs are for. Exports follow the playbook's [Large Exports and Expiring Links](/docs/building-blocks/imports-and-exports#large-exports-and-expiring-links).

## Log-Level Data Feeds and Deals

Log-level data is the event-level record delivered to a partner: a publisher receiving every impression and bid its ad server saw, a buyer receiving every impression it bought with the fees taken on the way, an auditor receiving both sides for a match. It is what makes the transparency studies possible: ISBA's studies traced spend by matching log-level data from every party in the chain, and its 2023 study named data access, retention and transfer as the area still needing industry work ([ISBA and PwC](/books/advertising/take-rates-and-supply-quality#isba-and-pwc-uk-2020-and-2023)).

What a log-level feed is, as a product:

- **A scope.** Which events (impressions, clicks, bids, requests), for which inventory or buyer seat, with which fields. Ad Manager's Data Transfer is the documented example: separate files for impressions, backfill impressions, clicks, requests and code serves, among others, and bid files.
- **A cadence and a delay.** Hourly or twice-hourly files, available hours after the hour, with late events arriving for days; a consumer has to treat each hour as provisional until the publisher's stated maturity.
- **A retention window and a price.** Files are purged after a period (60 days for Data Transfer), and the feed is often a paid add-on ("come at an additional cost"), which is why log-level access belongs in the contract ([What This Means for the System You Build](/books/advertising/take-rates-and-supply-quality#what-this-means-for-the-system-you-build) in Take Rates & Supply Quality).
- **Privacy transforms.** Which identifiers are removed, hashed, truncated or replaced per recipient, under the consent each event was collected with and the recipient's role. A buyer's feed carries the buyer's own identifiers at most; a publisher's feed doesn't carry another buyer's bid details beyond what the auction rules disclose.
- **A schema with a version.** Files are a data contract with a published schema, a version, and a deprecation period for changes ([Data Contracts](/docs/data/data-pipelines#data-contracts)).
- **A match key.** The fields a recipient will join on: the impression ID, OpenRTB's `source.tid` and the auction ID. [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)'s `log_match_runs` record what a match achieved; without a shared key no match is possible.

A **log-level data deal** is the commercial agreement around the feed: who receives it, at what price, with what fields, for which period, and with what restrictions on use (audit and reconciliation only, no resale, no re-identification). Publisher data access became a remedy topic in the US ad tech case, and The Google Ad Tech Cases (in Programmatic) covers what was ordered; the engineering point is that a feed is a recurring, contracted delivery with its own records, distinct from a one-off export.

## Privacy in the Pipeline

The pipeline is where personal data accumulates, so it is where the consent and retention rules have to hold:

- **The request's mode governs every derived record.** Events from `limited` requests carry no user key; joins that need a user key skip them; aggregates include them as counts.
- **Identifiers are dropped as early as the purpose allows.** Raw IP and user agent are truncated or parsed at receipt (`beacon_receipts.ip_prefix`, `ua_family`); log-level feeds get the minimum a recipient's purpose needs.
- **Retention is per table and purpose.** Receipts shortest, request and callout logs short and sampled after, billable events through the billing and dispute window, aggregates long. Deletion requests reach the warehouse and the partners' feeds as the playbook requires ([Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools), [Data Retention](/docs/building-blocks/data-retention)).
- **Aggregates have thresholds.** A breakdown small enough to single out a person (one zip code, one hour, one creative) is suppressed or coarsened; clean rooms make the threshold a formal rule with privacy budgets (Data Clean Rooms, in Identity and Audiences).
- **Modeled figures are labeled.** Where consent prevents observation, platforms model: Google's conversion modeling uses consented journeys to estimate unconsented ones once a "daily ad click threshold of 700 ad clicks over a 7 day period, per country and domain grouping" is met, and modeled conversions appear in the ordinary conversion columns. A pipeline that mixes observed and modeled counts keeps a flag on each row (`conversions.modeled` in Attribution) so the two can be separated.

## Storage

Where each kind of data lives, at scale:

| Data | Store | Why |
| --- | --- | --- |
| Request-path logs, events, receipts | Partitioned log, then object storage in an open table format, partitioned by hour | Volume, append-only, replayable ([Open Table Formats](/docs/data/warehouses-and-lakes#open-table-formats)) |
| Hourly aggregates for dashboards and pacing | A real-time analytical database (Druid, Pinot, ClickHouse) | Sub-second slices over recent data ([Druid and Pinot](/docs/data/analytical-databases#druid-and-pinot), [ClickHouse](/docs/data/analytical-databases#clickhouse)) |
| Daily billable figures, invoices, reconciliation | The transactional database, replicated to the warehouse | Small, contractual, versioned |
| Ad hoc analysis, attribution, model training sets | Cloud warehouse or lakehouse | Joins across everything ([Cloud Warehouses](/docs/data/cloud-warehouses)) |
| Log-level feeds to partners | Object storage, per recipient prefix, expiring | Delivery and retention per contract |

The core model's SQL is the schema of each of these, whether it lives in Postgres or in a lakehouse table; the shapes don't change with the engine.

## Reports Are Definitions

Every metric a report shows is a definition: a numerator, a denominator, the population, the clock and the source. [Advertising Metrics](/books/advertising/advertising-metrics), the last chapter in this part, holds one definition per metric with the chapter that owns each concept; the pipeline's job is to compute them from the same events the same way every time and to record which definition and version each report used ([One Definition per Metric](/docs/data/data-pipelines#one-definition-per-metric)).

## How to Build It

The logs, `delivery_daily` and its version, `report_jobs` (Self-Serve Ad Platforms) and `data_exports` (The Google Ad Tech Cases) already exist. This chapter adds the records that make restatement and feeds auditable: each aggregation run with the watermark it ran to and the version it produced, the superseded versions of billable days, the log-level feed as a contracted subscription, and links from exports and report jobs to what they were computed from.

```sql
CREATE TABLE aggregation_runs (          -- one computation of billable or reporting aggregates
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  output              TEXT NOT NULL CHECK (output IN ('delivery_daily', 'hourly_reporting',
                        'attribution', 'reach_sketches', 'log_feed')),
  source              TEXT,               -- the delivery_daily source this run computed
  days                DATERANGE NOT NULL, -- business days recomputed
  time_zone           TEXT NOT NULL,
  trigger             TEXT NOT NULL CHECK (trigger IN ('scheduled', 'late_events',
                        'ivt_finding', 'rule_change', 'backfill', 'manual')),
  event_watermark     TIMESTAMPTZ NOT NULL,  -- events received up to here were included
  ivt_rule_version    TEXT,
  counting_policy_ids UUID[] NOT NULL DEFAULT '{}',
  rows_written        BIGINT,
  rows_restated       BIGINT,             -- delivery_daily rows whose version incremented
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed',
                        'superseded'))
);

ALTER TABLE delivery_daily ADD COLUMN aggregation_run_id UUID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_aggregation_run_fk
  FOREIGN KEY (aggregation_run_id) REFERENCES aggregation_runs (id) NOT VALID;

CREATE TABLE delivery_daily_versions (   -- prior versions, kept when a day is restated
  line_item_id        UUID,
  deal_id             UUID,
  day                 DATE NOT NULL,
  source              TEXT NOT NULL,
  source_org_id       UUID,
  version             INT NOT NULL,
  impressions         BIGINT NOT NULL,
  viewable_impressions BIGINT NOT NULL,
  clicks              BIGINT NOT NULL,
  invalid_impressions BIGINT NOT NULL,
  cost_micros         BIGINT NOT NULL,
  aggregation_run_id  UUID REFERENCES aggregation_runs (id),
  superseded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (line_item_id, deal_id, day, source, source_org_id, version)
);

CREATE TABLE log_data_feeds (            -- a contracted, recurring delivery of event-level data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  recipient_org_id    UUID NOT NULL REFERENCES organizations (id),
  recipient_role      TEXT NOT NULL CHECK (recipient_role IN ('publisher', 'buyer', 'agency',
                        'advertiser', 'auditor', 'measurement_vendor')),
  scope               JSONB NOT NULL,     -- {"events":["impression","click"],"seller_account_ids":[...]}
  fields              TEXT[] NOT NULL,    -- the columns delivered, from the published schema
  transforms          JSONB NOT NULL DEFAULT '{}',  -- {"ip":"truncate_24","user_key":"drop"}
  format_version      TEXT NOT NULL,      -- the published file schema
  cadence             TEXT NOT NULL CHECK (cadence IN ('half_hourly', 'hourly', 'daily')),
  maturity_hours      INT NOT NULL,       -- how long an hour's files may still be redelivered
  retention_days      INT NOT NULL,       -- how long files stay available to the recipient
  permitted_use       TEXT NOT NULL,      -- 'audit_and_reconciliation', as the agreement says
  fee_term_id         UUID REFERENCES fee_terms (id),  -- a paid feed is a fee like any other
  agreement_ref       TEXT NOT NULL,
  active              TSTZRANGE NOT NULL
);

-- Deliveries are exports: each file set a feed produces, and redeliveries as new versions.
ALTER TABLE data_exports ADD COLUMN log_data_feed_id UUID,
                         ADD COLUMN delivery_version INT NOT NULL DEFAULT 1,
                         ADD COLUMN aggregation_run_id UUID;
ALTER TABLE data_exports ADD CONSTRAINT data_exports_feed_fk
  FOREIGN KEY (log_data_feed_id) REFERENCES log_data_feeds (id) NOT VALID;

-- A report job records the runs it read, so a stored report can be reproduced.
ALTER TABLE report_jobs ADD COLUMN aggregation_run_ids UUID[] NOT NULL DEFAULT '{}';
```

`data_exports.publisher_org_id` names a publisher; a feed to a buyer or auditor reads its recipient from `log_data_feeds.recipient_org_id`, and the export row's publisher column stays the inventory owner whose data it is.

What changed in a restatement, per line item and day, from the version history:

```sql
SELECT cur.line_item_id, cur.day, cur.source,
       prev.version AS from_version, cur.version AS to_version,
       cur.impressions - prev.impressions                 AS impressions_delta,
       cur.invalid_impressions - prev.invalid_impressions AS ivt_delta,
       cur.cost_micros - prev.cost_micros                 AS cost_delta_micros,
       r.trigger, r.event_watermark
FROM delivery_daily cur
JOIN delivery_daily_versions prev
  ON prev.line_item_id IS NOT DISTINCT FROM cur.line_item_id
 AND prev.deal_id IS NOT DISTINCT FROM cur.deal_id
 AND prev.day = cur.day AND prev.source = cur.source
 AND prev.source_org_id IS NOT DISTINCT FROM cur.source_org_id
 AND prev.version = cur.version - 1
JOIN aggregation_runs r ON r.id = cur.aggregation_run_id
WHERE cur.day >= $1 AND cur.day < $2
  AND cur.version > 1
ORDER BY abs(cur.cost_micros - prev.cost_micros) DESC
LIMIT 100;
```

Feed health for one recipient: hours delivered, redelivered and missing:

```sql
WITH hours AS (
  SELECT generate_series(date_trunc('hour', $2::timestamptz),
                         date_trunc('hour', $3::timestamptz) - interval '1 hour',
                         interval '1 hour') AS hour
)
SELECT h.hour,
       count(e.id)                                         AS deliveries,  -- 0: missing
       max(e.delivery_version)                             AS latest_version,
       min(e.delivered_at) - (h.hour + interval '1 hour')  AS first_delivery_delay
FROM hours h
LEFT JOIN data_exports e ON e.log_data_feed_id = $1
                        AND lower(e.period) = h.hour
GROUP BY h.hour
ORDER BY h.hour;
```

Design notes:

- **A run is the unit of restatement.** Every `delivery_daily` row points at the run that wrote it, and the run records the event watermark, the IVT rule version and the counting policies it applied, so "why did Tuesday change" is one row.
- **Old versions are kept.** `delivery_daily_versions` holds each superseded version, written in the same transaction as the update, so a report or invoice computed from version 2 can be reproduced after version 4 exists, and a partner's complaint about a changed number has the before and after.
- **Recompute, don't patch.** Runs recompute whole days from events; nothing adds deltas to an aggregate.
- **Feeds are contracts with fees.** A log-level feed's scope, fields, transforms, retention and permitted use are a record with an agreement reference, and a paid feed is a `fee_terms` row like every other fee ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)).
- **Redelivery is a new version, not an overwrite.** Late events for an hour already delivered produce a new file set with `delivery_version` incremented; the recipient's loader replaces the hour.
- **Reports remember their inputs.** `report_jobs.aggregation_run_ids` ties a stored report to the runs it read; with the attribution setting already in the query, a report can be recomputed exactly.

## Auditing

- **Every version of every billable day,** with the run, trigger, watermark and rule versions that produced it, and the version each invoice line was priced on.
- **What each partner received.** For each feed: scope, fields, transforms, schema version, every delivery and redelivery with checksums, and the agreement and permitted use.
- **What each report said, and from what.** Report jobs with their query, attribution setting, finality date and the runs they read.
- **Where personal data went.** Which feeds and exports carried identifiers, under which transform, to which recipient role, and when deletions reached each store.
- **Pipeline health.** Watermark lag per source, late-event volume per day, and runs that failed or were superseded.

## What This Means for the System You Build

- **Separate event-level, aggregated and billable data,** and label every report with which it is, its version and whether its period is final.
- **Run one pipeline with one set of definitions,** fast and slow paths reading the same events through the same rules.
- **Place events by event time, mature each source on its own watermark,** and state the last final day in every response.
- **Restate by recomputing whole days,** keep every prior version, and notify consumers.
- **Enrich with dimensions as of the decision,** not as of today, and assign business days once per consumer's time zone.
- **Never sum unique metrics;** compute reach per query shape from sketches or person-level data, with its error stated.
- **Serve reports through asynchronous jobs** that store their query, attribution setting and the runs they read.
- **Treat log-level feeds as contracts:** scope, fields, privacy transforms, cadence, retention, price and permitted use, with versioned redeliveries.
- **Apply the request's consent mode to every derived record,** threshold small breakdowns, and flag modeled figures.

## References

**Reference**

- [Google Ad Manager Help: Data Transfer reports](https://support.google.com/admanager/answer/1733124?hl=en), event-level file types, delivery frequency, the 5 to 15 hour availability, delayed events up to 8 days, the 60-day purge and the additional cost
- [Google Ads Help: About data freshness](https://support.google.com/google-ads/answer/2544985?hl=en), the 1-hour SLO, conversion delays by attribution model, daily reach and competitive metrics, and retroactive invalid traffic removal
- [Google Ads Help: Invalid traffic](https://support.google.com/google-ads/answer/2549113), filtering before billing and credits for invalid activity found after the billing cycle closes
- [Google Ads Help: About consent mode modeling](https://support.google.com/google-ads/answer/10548233?hl=en), modeling unconsented journeys, the 700-click threshold and modeled conversions in standard columns
- [Meta for Developers: Insights API best practices](https://developers.facebook.com/docs/marketing-api/insights/best-practices/), 15-minute refresh, 28-day finality, asynchronous jobs, the reach limits and the June 10, 2025 attribution changes
