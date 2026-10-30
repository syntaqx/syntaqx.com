+++
title = "Health Tech Metrics"
description = "Practice, revenue cycle, engagement and vendor metrics defined: locations, NRR and GRR, revenue per client, days in A/R, no-shows, and how each gets miscounted."
category = "Health Tech Industry"
order = 1963
part = "Running the Platform"
tags = ["health-tech", "metrics", "kpis", "revenue-cycle", "saas-metrics", "analytics"]
+++

Health tech runs on three sets of numbers that are usually computed by different people from different systems. The practice measures itself: production and collections, hygiene reappointment, no-shows, case acceptance. The revenue cycle measures the money's path: days in accounts receivable, clean claims, denials, how much of what was owed was collected. And the vendor measures its business: how many practices or locations it serves, how much revenue each brings, how much of last year's revenue it kept. A platform that sells to practices ends up computing all three, because its customers judge it by the first two and its board by the third.

Each set has the same failure: a word that sounds defined isn't. A "no-show" may or may not include a same-day cancellation; "days in A/R" may be gross or net of expected adjustments; "net revenue retention" in one company's filing counts payments revenue on a trailing average and in another's counts invoices. This chapter defines the metrics a health platform reports, shows how public companies define their own (benchmarked from filings, as of October 2026), and builds the definitions into the system so two dashboards can't disagree. The method is the playbook's [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); the practice's own dashboards are [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai), and the revenue cycle's KPIs in depth are [The Revenue Cycle](/books/health-tech/revenue-cycle#the-kpis). It adds `metric_definitions` and `metric_values` to the core data model in [The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model).

## How the Companies Report

Public health software and virtual care companies each define their own key metrics in their annual reports. As of October 2026, from the most recent 10-K filings:

| Company | Unit counted | Retention metric | Size metric | Notes |
| --- | --- | --- | --- | --- |
| **Weave** (FY2025) | Locations: "customer locations under active subscription," with a multi-location organization "counted as multiple locations"; 39,625 at December 31, 2025 (34,997 a year earlier) | Dollar-based NRR 93% (98% in 2024) and GRR 89% (91%), from adjusted monthly revenue per location | Revenue $239.0 million, up 17% | Adjusted monthly revenue is subscription revenue plus the trailing three-month average of recurring payments revenue; NRR "does not include any new customer locations" |
| **Phreesia** (FY ended January 31, 2026) | Average healthcare services clients (AHSCs): "the average number of clients that generate subscription and related services" or payment revenue each month; 4,514 (4,203 a year earlier) | Not reported as NRR | Total revenue per AHSC $106,467 ($99,884); patient payment volume $4,873 million; about 180 million patient visits facilitated, which it puts at about one in six US ambulatory visits | Payment solutions (the line formerly labeled payment processing fees) was 25% of revenue (24% a year earlier) |
| **Waystar** (FY2025) | Clients contributing over $100,000, "based on an accumulation of the amounts invoiced to clients over the preceding 12 months"; 1,391 (1,203) | NRR 112.0% (110.1%), current period invoices over prior period invoices for the same clients | "Over 7.5 billion healthcare payments transactions" | The filing notes the NRR includes elevated win rates after a competitor's February 2024 cybersecurity incident |
| **Teladoc Health** (FY2025) | U.S. Integrated Care members, "the number of unique individuals who have paid access and visit fee only access": 101.8 million at December 31, 2025, up 8.0 million; BetterHelp paying users, "the average number of global monthly paying users": 0.39 million (0.41 million) | Not reported as NRR | Revenue $2,530.0 million, down 2%; 17.1 million telehealth visits in 2025 | Average monthly revenue per U.S. Integrated Care member $1.29 ($1.37); 83% of revenue from access fees |
| **Hims & Hers** (FY2025) | Subscribers: "customers who have one or more 'Subscriptions'," excluding one-time purchasers; about 2.51 million at December 31, 2025 (2.23 million) | Not reported as NRR | Revenue $2,347.6 million ($1,476.5 million) | Monthly Online Revenue per Average Subscriber $81 ($64): "Online Revenue divided by Average Subscribers," further divided by the months in the period |

Three things the table shows:

- **The unit decides the story.** A per-location company (Weave), a per-client company with a revenue-per-client metric (Phreesia) and an enterprise company counting large clients (Waystar) are each measuring the unit that matches how they sell, and the virtual care companies count people instead: members with access (Teladoc) or paying subscribers (Hims & Hers), each with a monthly revenue per person. A platform that sells to both single offices and DSOs needs both: locations for footprint, organizations for revenue concentration.
- **Payments make retention metrics messy.** Weave folds a trailing average of payments revenue into its retention base, Phreesia reports payment volume separately, and Waystar counts invoices. Usage-based revenue moves with patient volume, seasonality and price changes; a retention number that mixes it with subscriptions needs its rule written down.
- **Exogenous events show up in the numbers.** Waystar names the Change Healthcare attack's effect on its NRR. A metric definition can't exclude events like that, but the commentary beside the number should name them.

## Practice Metrics

The practice's own measures, defined once so the platform's dashboard matches the practice's PMS report (or explains why not):

| Metric | Definition to settle | Common miscount |
| --- | --- | --- |
| **Production** | Value of procedures completed in a period, at the practice's fee schedule (gross) or at the amounts expected after contractual adjustments (net) | Mixing gross production with net collections, or counting treatment-planned procedures |
| **Collections** | Payments received in the period from patients and payers, by deposit or by posting date | Comparing a period's collections to the same period's production, when collections lag by weeks |
| **Collection rate** | Collections over net production for a matched period (or over a rolling window) | Using gross production as the denominator |
| **No-show rate** | Appointments with a no-show status over appointments scheduled for that period, with the cutoff for a late cancellation stated | Counting same-day cancellations as no-shows in one report and not another; excluding rescheduled appointments inconsistently |
| **Confirmation rate** | Appointments confirmed by any channel before the appointment over appointments due a reminder | Counting only confirmations through the platform, not those taken by phone at the front desk |
| **Hygiene reappointment rate** | Hygiene patients seen in the period who left with a future hygiene appointment | Counting patients with any future appointment |
| **Recall due, unscheduled** | Patients past their recall due date with no future appointment, as of a date | Including inactive or deceased patients, or those who moved |
| **New patients** | Patients whose first completed visit falls in the period | Counting records created (a booked new patient who never came) |

The PMS is usually the system of record for production and collections, and practices trust its reports. My rule: a platform dashboard that shows a PMS-owned number either reads it as the PMS computes it or shows both with the difference explained, and never quietly recomputes it with a different rule. [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#dashboards-and-the-morning-huddle) covers the dashboards themselves.

## Revenue Cycle Metrics

HFMA's MAP Keys are the industry's shared definitions: 29 KPIs in five groups (patient access, pre-billing, claims, account resolution and financial management). Three that a platform most often reports, as HFMA defines them:

- **Days in A/R, net (FM-1):** net patient accounts receivable divided by average daily net patient service revenue, the denominator taken from the most recent three months. Gross A/R days (before expected adjustments) look worse and aren't comparable.
- **Clean claim rate (CL-1):** claims that pass edits without manual intervention over claims accepted into the claims processing tool for billing. A vendor's "first-pass acceptance" at the clearinghouse is a different and higher number.
- **Remittance denial rate (AR-5):** claims denied over claims remitted, counting initial and appeal denials. HFMA's key is by claim count; a denial rate by dollars weights a few large claims heavily.

Cash collection as a percentage of net patient service revenue (FM-2) is HFMA's closest key to the "net collection rate" practices quote, and the two are computed differently, so a report names which it means. [The Revenue Cycle](/books/health-tech/revenue-cycle#the-kpis) owns the full set and the operational meaning.

## Engagement Metrics

Patient engagement platforms sell on outcomes they can measure in their own data, and each needs a rule:

- **Delivery and reach.** Messages delivered over messages attempted, by channel and carrier, with a delivered status from the carrier's receipt, not from the API accepting the request. Patients with no valid contact method are reported separately; they're a data quality problem, not a delivery one.
- **Response time.** Time from an inbound patient message to the first human reply, during office hours, excluding automated acknowledgments; a 9 p.m. message answered at 8 a.m. is measured from opening.
- **Online booking share.** Appointments created through online booking over all appointments created in the period, with the denominator from the PMS, since phone bookings never touch the platform.
- **Reminder effect on no-shows.** The claim every engagement vendor makes. Measure it as a comparison (no-show rates for appointments that received a confirmation request versus a holdout or a pre-launch baseline, matched by appointment type and provider) and say which; a before-and-after across a season mixes in everything else that changed.
- **Form completion before arrival.** Intake packets completed before check-in over packets sent, by appointment type.

## Vendor Metrics

What a health software company tracks about itself, defined the way the filings above define them:

- **Locations and organizations.** Count both. A location is a physical office under active subscription; an organization is the contracting customer. Report net additions as gross adds minus churned locations, and define when a location counts (contract signed, go-live, first invoice).
- **Net and gross revenue retention.** Cohort-based: the recurring revenue in a month from locations (or customers) active a year earlier, over their revenue then; GRR caps each at its starting value and excludes expansion. State whether payments and other usage revenue are included and how they're smoothed, as Weave does.
- **Revenue per unit.** Revenue per location or per client per period, with the unit's averaging rule (Phreesia averages monthly client counts).
- **Payment volume and attach.** Patient payment volume processed, the share of locations using payments, and, for a payment facilitator, the share of volume under the facilitator model, which Phreesia reports.
- **Integration health as a business metric.** The share of locations with a healthy PMS sync, because a location whose sync is broken is a location about to churn; [Health Tech Architecture](/books/health-tech/health-tech-architecture)'s [Sync and Integration Layer](/books/health-tech/health-tech-architecture#the-sync-and-integration-layer) produces the signal.

## Measurement Pitfalls

- **Two clocks.** Production by date of service and collections by deposit date can't be divided naively; define the matching rule. Every metric with a period uses the practice's business date in its own time zone ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).
- **The PMS changes history.** Practices back-date procedures, delete appointments and reverse payments. A metric computed from a synced copy must capture deletes and reversals, or it drifts from the PMS's own report ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).
- **Small denominators.** A one-dentist practice's no-show rate moves five points with three missed appointments; show counts beside rates and suppress rates below a minimum count.
- **Benchmarks and de-identification.** Comparing a practice to its peers uses other practices' data; a benchmark built from customer data needs the customer agreements to allow it and aggregation that keeps any one practice from being identified, and patient-level data in it has to be de-identified ([De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use)).
- **Metrics that pay people.** A front-desk bonus on collections or a vendor's sales commission on locations makes the definition a contract ([Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods)).

## How to Build It

Definitions are versioned rows and values are frozen when reported, as in the other volumes' metrics chapters; the health twist is the source of truth per metric and the minimum count:

```sql
CREATE TABLE metric_definitions (        -- one definition per metric, versioned
  key              TEXT NOT NULL,          -- 'no_show_rate', 'days_in_ar_net', 'location_nrr'
  version          INT NOT NULL,
  audience         TEXT NOT NULL CHECK (audience IN ('practice', 'revenue_cycle', 'engagement',
                     'vendor')),
  unit             TEXT NOT NULL,          -- 'appointment', 'claim', 'location', 'organization'
  numerator_sql    TEXT NOT NULL,
  denominator_sql  TEXT,
  source_of_truth  TEXT NOT NULL CHECK (source_of_truth IN ('platform', 'pms', 'clearinghouse',
                     'billing')),            -- whose number this must match
  external_ref     TEXT,                   -- 'HFMA MAP Key FM-1', 'Weave 10-K FY2025 NRR'
  min_denominator  INT NOT NULL DEFAULT 0, -- suppress the rate below this count
  business_date    TEXT NOT NULL,          -- which timestamp places a row in a period
  owner            TEXT NOT NULL,
  effective_from   DATE NOT NULL,
  change_reason    TEXT NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (             -- computed, frozen when reported
  metric_key       TEXT NOT NULL,
  metric_version   INT NOT NULL,
  tenant_id        UUID REFERENCES organizations (id),   -- null: a vendor-level metric
  location_id      UUID REFERENCES locations (id),
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  numerator        NUMERIC NOT NULL,
  denominator      NUMERIC,
  value            NUMERIC,                -- null when suppressed for a small denominator
  source_value     NUMERIC,                -- the source of truth's own figure, when read
  frozen_at        TIMESTAMPTZ,
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version),
  UNIQUE (metric_key, metric_version, tenant_id, location_id, period_start, period_end)
);
```

No-show rate for a location and month, with the late-cancellation cutoff the definition names:

```sql
-- Definition no_show_rate v2: no-shows plus cancellations within 24 hours of the start,
-- over appointments scheduled to start in the period, excluding those rescheduled
-- more than 24 hours ahead. Dates are the location's business date.
SELECT
  COUNT(*) FILTER (WHERE a.status = 'no_show'
                   OR (a.status = 'cancelled'
                       AND a.cancelled_at > a.starts_at - INTERVAL '24 hours')) AS numerator,
  COUNT(*) FILTER (WHERE a.status <> 'rescheduled'
                   OR a.rescheduled_at > a.starts_at - INTERVAL '24 hours')      AS denominator
FROM appointments a
JOIN locations l ON l.id = a.location_id
WHERE a.location_id = $1
  AND (a.starts_at AT TIME ZONE l.time_zone)::date BETWEEN $2 AND $3;
```

Locations' gross and net revenue retention for a base month, from monthly recurring revenue per location:

```sql
-- location_mrr(location_id, month, recurring_revenue) is built from billing,
-- with usage revenue smoothed by the rule the definition states.
WITH base AS (
  SELECT location_id, recurring_revenue AS base_rev
  FROM location_mrr WHERE month = $1 AND recurring_revenue > 0
), later AS (
  SELECT location_id, recurring_revenue AS later_rev
  FROM location_mrr WHERE month = $1 + INTERVAL '12 months'
)
SELECT
  SUM(COALESCE(l.later_rev, 0)) / SUM(b.base_rev)                       AS nrr,
  SUM(LEAST(COALESCE(l.later_rev, 0), b.base_rev)) / SUM(b.base_rev)    AS grr
FROM base b LEFT JOIN later l USING (location_id);
```

Design notes:

- **`source_of_truth` decides disputes in advance.** A practice metric whose source is the PMS is read from it, and `source_value` sits beside the platform's own computation so a difference is visible, not argued.
- **`external_ref` ties a definition to its public counterpart.** A revenue cycle metric labeled as HFMA's FM-1 has to follow HFMA's formula; one that doesn't gets its own key.
- **Small denominators are suppressed in the data, not the chart.** `value` is null below `min_denominator`, so every consumer, including exports, behaves the same.
- **Retention is computed from a monthly revenue table, not from invoices directly,** so the smoothing of payments and usage revenue is one documented step.
- **Emit `metric_value.frozen` and `metric_definition.versioned`;** a new version recomputes open periods and leaves frozen ones alone.

## Auditing

- **Every definition and its history,** with owner, reason and effective date.
- **Every frozen value,** with the definition version that produced it, and the source system's figure where one exists.
- **Every external report** (a board deck, an investor metric, a customer's quarterly review) linked to the frozen values it used.
- **Every benchmark,** with the customers and periods in it and the aggregation that protected them.

## What This Means for the System You Build

- **Write definitions down as rows,** with unit, numerator, denominator, business date, owner and version.
- **Name the source of truth for every practice metric** and show the PMS's own figure beside yours.
- **Use HFMA's MAP Key definitions** when you call a number by an HFMA name.
- **Count locations and organizations both,** and state how payments revenue enters retention.
- **Measure reminder effects against a holdout or matched baseline,** not a before-and-after.
- **Suppress small denominators,** capture deletes and reversals from the PMS, and freeze what was reported.

## References

**Filings**

- [Weave Communications: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609151/000160915126000016/weav-20251231.htm), locations, NRR and GRR definitions and values, adjusted monthly revenue, and revenue
- [Phreesia: Form 10-K for the fiscal year ended January 31, 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), AHSCs, revenue per AHSC, payment volume, patient visits and the payment processing share
- [Waystar: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1990354/000199035426000011/way-20251231.htm), clients over $100,000, NRR and transaction volume
- [Teladoc Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477449/000147744926000012/tdoc-20251231.htm), U.S. Integrated Care members, average monthly revenue per member, BetterHelp paying users, telehealth visits, access fee share and revenue
- [Hims & Hers Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1773751/000177375126000022/hims-20251231.htm), subscribers, Monthly Online Revenue per Average Subscriber and revenue

**Standards**

- [HFMA: MAP Keys](https://www.hfma.org/industry-initiatives/map-keys/), the 29 revenue cycle KPIs and the FM-1, FM-2, CL-1 and AR-5 definitions
