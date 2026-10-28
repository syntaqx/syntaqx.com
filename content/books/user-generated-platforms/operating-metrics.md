+++
title = "Operating Metrics"
description = "The numbers user-generated platforms run on: daily uniques and MAU, supply and creator health, GMV and take rate, prevalence and action rates, and unit costs."
category = "User-Generated Platforms Industry"
order = 1852
part = "Running the Platform"
tags = ["user-generated-content", "metrics", "analytics", "trust-and-safety", "marketplaces"]
+++

A user-generated platform has more audiences for its numbers than most businesses. Investors read daily uniques and revenue per user in a 10-K; the European Commission designates a very large platform from its published average monthly users; regulators compare a platform's claims about its moderation with its data; creators and hosts are paid by metrics; and the operators need to know whether the supply side (posters, streamers, hosts, sellers) is growing, whether the demand side finds what it wants, whether the platform is getting safer, and what each view, upload or stream costs. The same events feed all of it, and the same words ("active," "removed," "booked") mean different things in each.

This chapter covers the metrics as the platforms publish and define them: audience (daily and monthly actives, logged-in versus logged-out, revenue per user by region), engagement and creation, supply and creator health, marketplace volume and liquidity, trust and safety (prevalence, action and proactive rates, appeal overturns, time to action), and unit costs (per viewer-hour, per stored file, per moderated item). The general method (DAU, MAU and stickiness, cohorts, funnels, definitions as code, versions and frozen periods) is the playbook's: [Product Analytics](/docs/telemetry/product-analytics), [Data Pipelines & Analytics](/docs/architecture/data-pipelines#one-definition-per-metric), and the Gaming volume's [Game Metrics](/books/gaming/game-metrics). This chapter adds the industry's definitions and the tables that make them reproducible: metric definitions, a per-account activity fact, rolled-up values and prevalence samples, read by [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#how-to-build-it) and the regulator responses in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#regulator-requests-and-their-clocks).

## How the Platforms Do It

| Platform | Headline audience metric | How it's defined | Supply or volume metric | Money metric |
| --- | --- | --- | --- | --- |
| **Airbnb** | 533 million nights and seats booked (2025) | Counted at booking, adjusted for cancellations and alterations | Not covered here | $91.3 billion gross booking value; revenue recognized at check-in |
| **Bluesky** | Users: 25.94 million to 41.41 million during 2025 | Registered users | 1.41 billion posts in 2025 | Not covered here |
| **eBay** | 135 million active buyers (2025) | Not covered here | 2.5 billion live listings | $79.6 billion GMV; 13.94% take rate |
| **Etsy** | 86.5 million active buyers (2025) | At least one purchase in the trailing twelve months | 5.6 million active sellers | $10.46 billion GMS on the Etsy marketplace; 24.2% take rate |
| **Pinterest** | MAU: 619 million (December 31, 2025) | Authenticated users active in a 30-day window | Not covered here | ARPU by region: $30.84 US and Canada, $0.83 rest of world (2025) |
| **Reddit** | DAUq and WAUq: 121.4 million and 471.6 million (fourth quarter 2025) | A user identifiable by a unique identifier who visited a page or opened an app at least once in 24 hours (seven days for WAUq), including logged-in and logged-out traffic | Over 100,000 active communities | ARPU: quarterly revenue in a geography divided by average DAUq there |
| **Turo** | About 350,000 active listings (September 2024) | Not covered here | About 150,000 active hosts | $2.41 billion gross booking value (2023) |
| **Twitch** | Over 2.5 million average concurrent viewers (2023) | Average concurrency | 7 million monthly streamers | Not published |

The figures come from [The User-Generated Platform Business](/books/user-generated-platforms/platform-business#how-big-it-is) and the filings it cites. The pattern: **each business picks the audience unit that matches how it earns** (daily uniques for ad-driven conversation, monthly authenticated users for a discovery product, buyers in twelve months for a marketplace, concurrency for live video), and **each defines "active" in a footnote that decides the number.** When two platforms' actives are compared, the comparison is usually between definitions.

## Audience

The playbook covers the arithmetic of DAU, MAU and stickiness and why "active" needs a definition ([Active Users and Stickiness](/docs/telemetry/product-analytics#active-users-and-stickiness)); the Gaming volume covers the unit question ([The Unit: Account, Device or Profile](/books/gaming/game-metrics#the-unit-account-device-or-profile)). What user-generated platforms add:

- **Logged-out users are users.** Reddit's DAUq is intended to include "both traffic from those who have logged in to a registered account as well as from those who have not logged in," and the 10-K warns that "it is more challenging to accurately count logged-out traffic" because deduplication without an account identifier is imperfect. A platform with a large logged-out audience from search needs a stable anonymous identifier, a deduplication method that's written down, and the logged-in share tracked separately, because the two audiences monetize and retain differently ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#logged-out-economics) covers the economics).
- **Automated traffic has to be removed and the method disclosed.** Reddit lists "our ability to identify automated agents on our platform" among the things that could change its count. Bot filtering is part of the definition, versioned with it.
- **The same number can be regulated.** Under the DSA every online platform publishes average monthly active recipients in the EU at least every six months, and the Commission designates very large platforms from it ([Very Large Online Platforms](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms)). An investor metric and a regulatory metric computed by different teams with different definitions is a finding waiting to happen; compute both from the same activity fact with documented differences.
- **Geography is the money dimension.** Pinterest's 2025 ARPU was $30.84 in the US and Canada and $0.83 in the rest of the world, and Reddit's ARPU is revenue in a geography divided by DAUq there, with ad revenue placed where impressions were delivered. Users counted by country, with a consistent rule for which country, is a requirement from the first day.

## Engagement and Creation

User-generated platforms track two funnels: people who consume, and people who create. The creation ratio is the health of the supply. Reddit's users created 4.4 billion posts and comments in 2025 and sent 7.7 billion private messages and chats; Bluesky's users wrote 1.41 billion posts. The metrics worth keeping per period and per community:

- **Creators as a share of actives:** accounts that posted, commented, uploaded, streamed or listed, divided by actives. Most users only read, so a small change in this share is a large change in supply.
- **Content per creator and its concentration:** how much of the content comes from the top 1% of creators, and how much of the consumption goes to it. Concentration is a dependency risk (a creator leaving takes an audience) and a moderation risk (a few accounts produce most of the violations).
- **Response and reach:** the share of new posts that get a reply, a vote or a view within a day. A community where new posts get no response loses its posters; this is the cold-start metric for creators, the analogue of a listing's first booking.
- **Community health:** active communities (Reddit counts over 100,000), communities with an active moderator, and moderator actions per moderator. Reddit's 10-K discloses moderator recruitment as a risk, and banned 605,570 communities in the second half of 2025 mostly for being unmoderated or spam, so "communities without an active moderator" is an operating metric, not a curiosity ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#what-to-measure)).

## Supply and Creator Health

For creator and marketplace businesses the supply metrics are the leading indicators:

| Metric | Creator platforms | Marketplaces |
| --- | --- | --- |
| **Active supply** | Monthly streamers (Twitch reported 7 million in 2023), creators posting in a period | Active sellers (Etsy 5.6 million), active hosts (Turo about 150,000), live listings (eBay 2.5 billion) |
| **New supply and its survival** | New creators who post again after 30 and 90 days | New listings that get a first booking or sale within 30 days |
| **Earnings distribution** | Share of creator payouts to the top 1% and the median earner's monthly earnings | Share of GMV from the top 1% of sellers or hosts |
| **Supply quality** | Creators in good standing; share with strikes | Listing quality scores; host cancellation rate; response rate |
| **Eligibility** | Creators eligible for monetization; time to eligibility | Hosts and sellers verified; time from sign-up to first publish |

Payout-linked metrics (watch hours toward partner thresholds, subscriber counts, a host's response rate for a status program) decide money, so they get the contract treatment in [Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods): versioned definitions, stamped outputs, frozen periods and adjustments rather than recomputation ([Creator Monetization](/books/user-generated-platforms/creator-monetization#tiers-points-and-program-levels); [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#status-programs)).

## Marketplace Volume and Liquidity

Marketplaces report volume and take rate: Airbnb's gross booking value and nights and seats booked, eBay's GMV, Etsy's GMS, and revenue as a percentage of each. Airbnb's 10-K notes that nights and GBV "are adjusted for cancellations and alterations" in the reporting period, that cancellations and alterations can occur after it and affect future metrics, and that revenue is recognized at check-in. So a marketplace keeps two clocks on every booking: **booked** (when demand happened, what GBV counts) and **served** (when the stay or trip happened, what revenue counts), and every report says which.

Liquidity, the chance that a search turns into a transaction, isn't published by these platforms, but it's what operators run on:

- **Search to booking or purchase:** searches with at least one result, searches that led to a booking request, and requests that confirmed.
- **Acceptance and response:** share of requests accepted by hosts, median time to respond, share expired. A request-to-book marketplace with a low acceptance rate is failing its guests even if search conversion looks fine ([Availability & Booking](/books/user-generated-platforms/availability-and-booking#request-to-book-and-instant-book)).
- **Fill rate by place and date:** booked nights over available nights, by market; the supply gap where demand exceeds it.
- **Time to first booking** for new listings, and the share that never book ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking#cold-start-and-demand-rerouting)).
- **Take rate decomposition:** revenue over GBV split by fee line (guest fee, host fee, protection, ads), because a change in fee model (Airbnb's move to a single host-only fee) shifts the mix without changing the total ([How the Money Is Made](/books/user-generated-platforms/platform-business#how-the-money-is-made)).

## Trust and Safety Metrics

Moderation produces three kinds of number, and only one of them says whether users are safer.

**Volume** (content removed, accounts actioned) measures work, and rises when detection improves or abuse grows. **Process** (proactive rate, time to action, appeal overturn rate, report actionability) measures how well the system works: Reddit found 6.9% of user reports actionable in the second half of 2025, Snap reported a median turnaround from detection to final action of about one minute for in-app reports, and the playbook's [Appeals](/docs/security/trust-and-safety#appeals) treats overturn rates by category and model version as a quality signal. **Exposure** measures harm: Meta's prevalence is "the estimated number of views that showed violating content, divided by the estimated number of total content views," estimated by sampling views and having reviewers label them, with a second reviewer and a tie-breaker for some samples, stratified sampling where violations are likelier, and an upper limit reported when violations are too rare to estimate precisely. Snap's Violative View Rate was about 0.01% of Snap and Story views in the second half of 2025 (0.0003% for severe harms). Pinterest reports reach instead: the share of deactivated Pins seen by no one before removal.

Rules for building them:

- **Sample views, not items.** Prevalence weights each piece of content by how often it was seen, which is the harm users experienced. A sample of items over-represents the long tail nobody saw.
- **Label with the policy version.** A prevalence estimate is only comparable across periods if the labels used the same policy; store the policy version with each label.
- **Report intervals and upper limits.** A rare category's estimate is a range; Meta reports a ceiling rather than a point.
- **Keep reviewers blind to the action taken.** Labels on sampled views should be independent of whether the system already removed the content, or the estimate measures agreement with the system rather than harm.
- **Measure the classifiers too.** Precision and recall per category and model version, from the same labeled samples, are what the DSA calls "indicators of the accuracy and the possible rate of error" ([AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-moderation-and-error-budgets)). The Commission's AliExpress decision found the platform overestimated its detection system's effectiveness and underestimated reviewer workload ([Fines, Commitments and Findings](/books/user-generated-platforms/regulators-and-enforcement#fines-commitments-and-findings)); those are both metrics.
- **Track reviewer load and exposure.** Items per reviewer per hour, queue age by priority, and exposure to the worst categories per person are capacity metrics and wellbeing metrics at once ([Moderator Wellbeing](/docs/security/trust-and-safety#moderator-wellbeing)).

## Unit Costs

The playbook says to measure cost per unit, not just in total ([Measure Cost per Unit, Not Just in Total](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)). The units here:

| Unit cost | Driver | Public reference point |
| --- | --- | --- |
| **Per viewer-hour** of live or on-demand video | Delivered bitrate, viewer location, CDN or vendor tier | Amazon IVS lists $0.144 per Full HD viewer-hour in its first North American tier, as of October 2026 |
| **Per stored file or GB-month** | Variants per upload, storage tier, replication | Cloudflare R2 lists $0.015 per GB-month with no egress fee; Meta's f4 warm tier cut its effective replication factor from 3.6 to 2.8 or 2.1 |
| **Per delivered image** | Variants, format, cache hit rate, egress | Cloudflare Images lists $1 per 100,000 images delivered |
| **Per moderated item** | Share auto-actioned versus human-reviewed, review time, vendor rates | No public figure; computed from reviewer hours and vendor invoices over decisions |
| **Per active user** | All of the above, divided by the audience metric | Twitch said network fees in Korea were about ten times most countries' and exited the country in February 2024 |

Two disciplines make unit costs useful. **Allocate by community and by country,** because costs and revenue both vary by geography more than tenfold: Pinterest's ARPU differs by more than thirty times between regions, and Twitch's Korea exit was a unit cost that revenue couldn't cover. **Tie cost to the product decision that drives it:** a 720p source cap, a storage limit for free accounts, a GIF converted to video, an auto-action threshold that sends fewer items to people. [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#why-platforms-cap-storage) and [Video on Demand](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour) cover the levers.

## Definitions as Code, Restatements as Rows

The playbook's rules ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); [Metric Definitions as Code](/docs/telemetry/product-analytics#metric-definitions-as-code)) apply with three additions for this industry:

- **Published metrics are regulated or audited.** DAUq is in a 10-K; EU average monthly recipients are a DSA filing; transparency figures are regulatory reports. Each published figure records the definition version and the snapshot it came from, and a later correction is a restatement, published as such, never a quiet change ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query)).
- **Merges and deletions move history.** An account erased under a privacy request, a bot cluster removed after the fact, or two accounts linked as one person change the counts for past periods. Decide per metric whether history is frozen (the published number stands, with a note) or recomputed, and record the decision in the definition.
- **Moderators' and creators' metrics decide pay or status.** Partner thresholds, host status programs and moderator caps read metrics; they freeze, stamp and adjust like any other money-deciding number.

## How to Build It

The chapter adds the definitions every report reads, a per-account daily activity fact and rolled-up values, and extends the prevalence samples that [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#how-to-build-it) owns.

```sql
CREATE TABLE metric_definitions (        -- one definition per metric, versioned
  key            TEXT NOT NULL,          -- 'dau', 'eu_avg_monthly_recipients', 'prevalence'
  version        INT NOT NULL,
  unit           TEXT NOT NULL CHECK (unit IN ('accounts', 'identifiers', 'items', 'views',
                   'bookings', 'amount', 'seconds', 'ratio')),
  population     TEXT NOT NULL,          -- 'logged_in_and_out', 'authenticated', 'eu_recipients'
  exclusions     TEXT NOT NULL,          -- bots, staff, test, merged: as written
  clock          TEXT NOT NULL,          -- 'utc_day', 'booked_at', 'served_at', 'decided_at'
  formula_ref    TEXT NOT NULL,          -- the SQL or model in version control
  history_policy TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  published_as   TEXT[],                 -- '10-K', 'dsa_art24', 'transparency', 'internal'
  owner          TEXT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE activity_days (             -- one row per identity per day it was active
  activity_on    DATE NOT NULL,          -- the day boundary the definition names
  identity_kind  TEXT NOT NULL CHECK (identity_kind IN ('account', 'anonymous')),
  identity_id    TEXT NOT NULL,          -- account id, or a deduplicated anonymous id
  account_id     UUID REFERENCES accounts (id),  -- null for anonymous
  country        CHAR(2),                -- the rule for which country is in the definition
  surfaces       TEXT[] NOT NULL,        -- 'feed', 'search', 'chat', 'live', 'marketplace'
  created_count  INT NOT NULL DEFAULT 0, -- posts, comments, uploads, listings
  is_automated   BOOLEAN NOT NULL DEFAULT FALSE,  -- excluded by the bot rule in force
  definition_version INT NOT NULL,
  PRIMARY KEY (activity_on, identity_kind, identity_id)
);

CREATE TABLE metric_values (             -- computed, frozen when published
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key     TEXT NOT NULL,
  metric_version INT NOT NULL,
  period         DATERANGE NOT NULL,
  scope          JSONB NOT NULL,         -- {"country": "DE"}, {"community_id": "..."}
  value          NUMERIC NOT NULL,
  numerator      NUMERIC,
  denominator    NUMERIC,
  computed_at    TIMESTAMPTZ NOT NULL,
  frozen_at      TIMESTAMPTZ,            -- published, filed or paid on
  supersedes_id  UUID REFERENCES metric_values (id),  -- a restatement is a new row
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);

-- prevalence_samples (sampled views with stratum weights, the revision as seen, the
-- policy version and blind labels via review assignments) belongs to Moderation at
-- Scale; reporting adds the viewer's country and an audit of blindness.
ALTER TABLE prevalence_samples
  ADD COLUMN viewer_country      CHAR(2),  -- for per-country and EU-only estimates
  ADD COLUMN system_action_known BOOLEAN NOT NULL DEFAULT FALSE;  -- labelers should be blind
```

Notes on the sketch:

- **One activity fact feeds every audience number.** DAU, DAUq-style logged-in-and-out counts, MAU of authenticated users and the DSA's EU recipients are different queries over `activity_days` (by `identity_kind`, by `country`, by window), so their differences are documented in `metric_definitions` rather than in separate pipelines. The anonymous identifier and its deduplication method are part of the definition.
- **Bots are flagged, not deleted.** `is_automated` excludes rows under the rule in force; changing the rule is a new definition version, and the old numbers stay reproducible.
- **Values freeze and restate.** A published DAUq, a filed EU recipients figure or a creator threshold computed for payout sets `frozen_at`; a correction is a new row that supersedes it, the property-management and gaming volumes' pattern applied here ([Operating Metrics](/books/property-tech/operating-metrics) in Property Tech).
- **Prevalence is weighted sampling.** Each sample carries its stratum weight, so the estimate and its interval are computed from the table; samples carry the policy version, `viewer_country` splits the estimate by country, and `system_action_known` audits blindness. The published estimate is a `metric_values` row under the `prevalence` definition.
- **Classifier accuracy comes from the same labels.** Joining samples to `moderation_decisions` by item gives precision and recall per category and model version, which [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#how-to-build-it) uses for thresholds and error budgets.
- **Erasure and activity.** `activity_days` holds account ids; an erased account's rows are de-identified (the id replaced) rather than deleted where the metric's history is frozen, so published numbers still reconcile ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **Events:** `metric.frozen` and `metric.restated` go through the outbox to the reporting and investor relations tools.

## Auditing

- **Every published number** with its definition version, snapshot time, scope and the query that produced it, whether it went to investors, a regulator or the public.
- **Every definition change,** with the reason, the owner who approved it and the effect on the prior period, disclosed when the number is published.
- **Every restatement,** linked to what it supersedes.
- **Prevalence samples and labels,** with reviewer, policy version and tie-breaks, kept as long as the estimates they support.
- **Payout-deciding metrics,** frozen per period with adjustments recorded against later periods.

## What This Means for the System You Build

- **Define "active" in writing,** including logged-out users, anonymous deduplication and bot exclusion, and version the definition.
- **Compute investor, regulatory and product audiences from one activity fact** with documented differences.
- **Count by country from day one,** with a stated rule for which country.
- **Track creation as well as consumption:** creators as a share of actives, concentration, and whether new posts get a response.
- **Keep booked and served clocks** on marketplace transactions and say which a report uses.
- **Measure liquidity:** search to booking, acceptance, response time, time to first booking.
- **Measure exposure with weighted, blind, policy-versioned samples,** and report intervals and upper limits.
- **Measure classifier precision and reviewer load,** because regulators will.
- **Allocate unit costs by community and country** and tie them to the product decisions that drive them.
- **Freeze published and payout numbers, and restate with new rows.**

## References

**Filings**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), DAUq and WAUq definitions, logged-in and logged-out traffic, counting difficulty, automated agents, ARPU by geography, international DAUq
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), MAU and its definition, ARPU by region
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), active buyers in the trailing twelve months, active sellers, GMS
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), nights and GBV adjusted for cancellations and alterations, revenue at check-in
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), GMV, active buyers, live listings, take rate
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), gross booking value, active hosts and listings

**Transparency reports and definitions**

- [Meta: Prevalence](https://transparency.meta.com/policies/improving/prevalence-metric/), the definition, sampling, review and upper limits
- [Snap: Transparency report, H2 2025](https://values.snap.com/privacy/transparency-h2-2025), Violative View Rate and turnaround
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), content and message volumes, actionable reports, community bans (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Pinterest: Transparency report, July to December 2025](https://policy.pinterest.com/en/transparency-report), reach before deactivation
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), user growth and posts

**Costs**

- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), per viewer-hour output prices
- [Cloudflare R2: Pricing](https://developers.cloudflare.com/r2/pricing/), storage price and free egress
- [Cloudflare Images: Pricing](https://developers.cloudflare.com/images/pricing/), delivery price
- [USENIX: f4, Facebook's warm BLOB storage system](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar), replication factor reduction
- [Twitch: An update on Twitch in Korea](https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/), network fees about ten times most countries' and the exit

**Reference**

- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), concurrent viewers and monthly streamers
