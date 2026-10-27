+++
title = "Game Metrics"
description = "The numbers a live game runs on: DAU, retention cohorts, ARPDAU, LTV, concurrency, queue time, match fairness, crash rate, frame time, tick health, experiments."
category = "Gaming Industry"
order = 1625
part = "Running the Platform"
tags = ["gaming", "metrics", "analytics", "retention", "experiments", "data-pipelines"]
+++

A live game is run from a short list of numbers: how many people played today, how many of last week's new players came back, how much revenue each active player brought in, how many were online at the peak, how long they waited for a match and whether the match was fair, how often the client crashed, and whether the server kept its tick. Every input is a side effect of running the game, collected by the [telemetry](/books/gaming/telemetry) pipeline. The hard part is that each number has several reasonable definitions, and two widely used game analytics vendors define some of the same names differently. When a number sets a budget, a marketing bid or a server reservation, its definition is a contract. This chapter gives the definitions, says which formulas are vendors' and which are this book's, and shows the pipeline that computes them once. How to define a metric once, version it and stamp its outputs is general practice, in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); what follows is the game-specific part. The events themselves are designed in [Telemetry & Analytics](/books/gaming/telemetry), the ratings behind match fairness in [Matchmaking & Ranked](/books/gaming/matchmaking), and how experiments are run on a live game in [Live Operations](/books/gaming/live-operations#experiments); this chapter is how each of them is measured.

## Why the Same Metric Disagrees

Three choices make two dashboards show different numbers for the same day.

- **What counts as active.** Unity's legacy Analytics glossary counts a daily active user as a player who "started a session on a given day." GameAnalytics counts "the unique user count reported per day," any user who sent an event. A player who left the game running across midnight is active on the second day for GameAnalytics and not for a session-start definition.
- **What counts as revenue.** GameAnalytics' ARPDAU (now a legacy metric, replaced by ARPU) is "the IAP revenue sum divided by all daily active user count," in-app purchases only. Unity's ARPDAU is "the average revenue per user who played on a given day," and its revenue includes Unity Ads plus verified in-app purchases. A game with a large ad business reports a much higher ARPDAU in Unity than in GameAnalytics from the same players.
- **Where the day ends.** "GameAnalytics calculate metrics within UTC dates/hours," and Unity's glossary also uses UTC days. A studio in Los Angeles that reports in local time disagrees with both every evening.

The design consequence is the same as anywhere else: each metric is a named, versioned definition with a unit, a numerator, a denominator, inclusion rules and a clock ([What a Definition Contains](/docs/architecture/data-pipelines#what-a-definition-contains)). Games add one more decision that most products don't face: **the unit of a player.**

## The Unit: Account, Device or Profile

A player can have one account, several platform identities (Steam, PlayStation, Xbox, a phone), several devices, and a profile per game. Each choice gives a different DAU.

- **Device.** Google Play's Android vitals counts a daily active user as "a unique user who uses your app on a single day on a single device": one person on two devices is two active users, and two people sharing a tablet are one. Mobile attribution and store dashboards are device-based.
- **Account.** The platform's `accounts` row ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)). A player who links a console and a PC is one account; a player who never logs in may have none.
- **Per-game profile.** For a platform that runs several games, `player_profiles` is the unit for a game's metrics, and the account is the unit for the platform's.

My default: count accounts for every metric the business runs on, keep device counts for platform and store reconciliation, and never mix them in one ratio. A DAU built from devices divided into revenue built from accounts is wrong in a way no chart reveals. Merging two accounts into one ([Record Linkage](/docs/architecture/record-linkage)) rewrites history, so the metric reads the merged identity as of the computation and stamps the definition version on its output.

## Engagement: DAU, MAU and Stickiness

The vendor definitions, as of October 2026:

| Metric | GameAnalytics | Unity (legacy glossary) |
| --- | --- | --- |
| DAU | Unique users reported per day | Players who started a session on a given day |
| MAU | Unique users per calendar month, or rolling: "the unique user count last 30 days reported per day" | Players who started a session "within the last 30 days" |
| Stickiness | Not defined on the metrics page | DAU/MAU, the "Sticky Factor" |

Workable definitions, this book's own:

```text
active(account, day)  = account sent at least one gameplay event on that day,
                        where gameplay events are a named list in the definition
DAU(day)              = count(distinct accounts active on day)
MAU(day)              = count(distinct accounts active on any of the 30 days ending on day)
stickiness(day)       = DAU(day) / MAU(day)
```

The "named list" is the general rule from [Active Users and Stickiness](/docs/telemetry/product-analytics#active-users-and-stickiness), which also explains why stickiness hides churn while new users arrive (Unity's glossary gives the same warning). In a game, failed logins, background launcher pings and push notifications that open the app for a second don't count; activity is a match started, a level loaded, a session longer than a threshold. Read stickiness beside the share of DAU that installed in the last seven days. Rolling MAU (30 days ending on each day) is smoother and comparable day to day; calendar MAU is what finance reports. Pick one per audience and name it.

## Retention and Cohorts

Retention is the metric a game lives or dies on, and both vendors define it the same way. GameAnalytics: "the daily percent of users who installed on a specific day and then returned N days later," where "a user is considered returning if they revisit on the exact specified day N." Unity: "the number of people playing exactly N days after their first session," divided by the new users from exactly N days earlier, reported as Day 1, Day 7 and Day 30.

![A cohort retention sheet: one install day's 10,000 players drawn as a bar on a 30-day axis, with bars for players active on day 1, 7 and 30, dimensioned N1, N7 and N30, a detail of one player active on days 6 and 8 but not 7, and a variable table computing R1, R7 and R30.](/diagrams/gm-game-metrics-retention.svg "Retention is a ratio over one install cohort, and exact-day retention counts only activity on day N itself: the player in detail A is not retained on day 7.")

The sheet's numbers are illustrative. What it shows is the definition:

```text
cohort(d)           = accounts whose first gameplay day is d        -- C0 on the sheet
retained_N(account) = active(account, d + N)                        -- exact day, vendor definition
R_N(d)              = count(accounts in cohort(d) retained_N) / count(cohort(d))
```

Four decisions turn this into a definition you can defend.

- **Exact day or unbounded.** The two variants and their trade-off are in [Cohorts and Retention Curves](/docs/telemetry/product-analytics#cohorts-and-retention-curves); exact-day is why the player in detail A, active on days 6 and 8, is not retained on day 7. Report exact-day retention as the headline, because it matches the vendors and partners you'll be compared with, and name the variant when you show the other.
- **What is day zero.** The first gameplay day, not the install or account creation. A player who installs on Friday and first plays on Sunday is in Sunday's cohort, or every slow first launch looks like churn.
- **Which day boundary.** UTC (as the vendors use) or the player's local day. A player in Sydney who plays every evening appears on two UTC dates some weeks and none on others. Whatever you choose, assign the date once in staging ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)) and never recompute it in a dashboard.
- **Which accounts are in.** Bots, internal testers, banned cheaters and accounts merged into another are excluded by rule, with the rule in the definition. A ban wave on day 3 otherwise lowers D7 for reasons that have nothing to do with the game.

**Cohort tables** put install days in rows and N in columns, where a bad patch shows up as a diagonal ([Cohorts and Retention Curves](/docs/telemetry/product-analytics#cohorts-and-retention-curves)). Segment cohorts by acquisition source, platform and country before comparing them, because a change in the marketing mix moves retention more than most game changes do.

## Revenue: ARPDAU, ARPPU, Conversion and LTV

The vendors again, as of October 2026:

| Metric | GameAnalytics | Unity (legacy glossary) |
| --- | --- | --- |
| ARPDAU | IAP revenue ÷ DAU (legacy, replaced by ARPU) | Revenue per player who played on the day, including Unity Ads and verified IAP |
| ARPPU | IAP revenue ÷ "active users who paid at least once in the period" | "Average verified IAP revenue per user who completed a verified IAP transaction" |
| Conversion | "Percentage of daily active users who made a purchase reported per day" | "The percentage of users who complete an action or sequence of actions" (funnels) |

The words are the same and the numbers are not. Workable definitions, the ones every chapter of this book uses:

```text
gross_bookings(period) = sum of purchase prices in period, before tax, refunds and store fees
net_revenue(period)    = the revenue measure the definition names (see below)
ARPDAU(day)            = net_revenue(day) / DAU(day)
ARPU(month)            = net_revenue(month) / MAU(month)   -- calendar-month MAU
ARPPU(period)          = net_revenue(period) / count(distinct accounts with a purchase in period)
conversion(day)        = count(distinct DAU accounts with a purchase on day) / DAU(day)
conversion(month)      = count(distinct MAU accounts with a purchase in month) / MAU(month)
payer_share(cohort, N) = count(accounts in cohort with any purchase by day N) / count(cohort)
```

Conversion always carries its window. Daily conversion is what GameAnalytics reports; monthly conversion counts anyone who paid once in the month, so it is usually far higher than the average of the daily figures, and the two are never compared.

`net_revenue` is the decision. Gross purchase value, value after refunds and chargebacks, value after the store's fee, and value with ad revenue are all used, and each answers a different question. The same formulas over `gross_bookings` answer a sales question rather than a revenue one; when a sheet uses them, the name says so ("ARPU on gross bookings"), as in the funnel in [Monetization Models](/books/gaming/monetization#the-funnel-in-numbers). My rule: the definition names one, the column name says which (`iap_gross_amount`, `iap_net_amount`, `ad_revenue_amount`), and money is stored in minor units with its currency ([Money](/docs/payments/money)), converted to a reporting currency at a rate recorded with the row ([Multi-Currency](/docs/payments/multi-currency)). Store fees and refund behavior are in [Stores, Fees & Payments](/books/gaming/stores-and-payments). Revenue comes from the server-side ledger of purchases, never from a client event: a client that says "purchase succeeded" is a claim, the store receipt verified by your backend is a fact ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)). Both vendors make the same distinction by counting "verified" purchases.

**Lifetime value** has no vendor definition on the pages above, and it is the metric most often presented as a fact when it is a forecast. This book's definitions:

```text
realized_LTV(cohort, N) = net_revenue from accounts in cohort, days 0..N
                          / count(cohort)
predicted_LTV(cohort, H) = realized_LTV(cohort, N) + forecast of days N+1..H,
                           labeled with the model version and horizon H
```

Realized LTV is arithmetic and can be audited. Predicted LTV is a model (a retention curve times an ARPDAU curve, or a regression on early behavior), and its output must carry the model version and horizon so nobody compares a 180-day prediction with a 365-day one. Marketing bids against predicted LTV; finance reports realized.

## Sessions and Concurrency

A **session** is "a single play or usage period" in Unity's glossary, where "a new session is counted when a player launches your game or brings a suspended game to the foreground" after 30 minutes of inactivity. GameAnalytics counts sessions by session start events and session length as the "mean playtime (length) per unique session end event." A game that is backgrounded and killed by the OS sends no session end, so mean session length from end events is biased toward sessions that ended cleanly. Derive session length on the server from the first and last gameplay events with a timeout rule, and report the median and the 90th percentile; the mean of a distribution with a long tail of idle sessions describes nobody.

**Concurrent users (CCU)** is the count of players connected at one instant, and **peak CCU** is the highest such count in a period. It sizes servers, backend capacity and on-call, and it is the number the public reads off store charts. Platforms expose it as an instant count: Steam's Web API `GetNumberOfCurrentPlayers` "gets the total number of players currently active in the specified app on Steam," and "will not return players that are playing while not connected to Steam." Amazon GameLift Servers reports `CurrentPlayerSessions` (player sessions that are active or reserved) per fleet every minute.

Two decisions make a CCU number:

- **What counts as connected.** In a match, in a lobby, in the client's menus, or connected to the presence service at all. Each is a separate count, and capacity planning needs each: game servers size for players in matches, the chat and presence tier for everyone online ([Parties, Presence, Chat & Voice](/books/gaming/social-systems)).
- **The sampling interval.** Peak CCU from one-minute samples is higher than peak from fifteen-minute averages of the same traffic. Sample at a fixed interval, store the samples, and name the interval in the definition. Never compute peak from an average.

## Match Quality

For a multiplayer game, players judge the matchmaker by two things: how long they waited and whether the match was fair. Both are measurable, and the measurement is designed with [Matchmaking & Ranked](/books/gaming/matchmaking).

**Queue time** starts when a player asks for a match and ends when they are in one. GameLift's FlexMatch metrics show that "in one" has two meanings: `TimeToMatch` is "the amount of time between ticket creation and potential match creation," and `TimeToTicketSuccess` is the time "between ticket creation and successful match placement," that is, after a server is found. The gap between them is server placement time, a hosting problem rather than a matchmaking one ([Game Servers & Hosting](/books/gaming/game-servers)). FlexMatch also counts the failures: `TicketsTimedOut`, `TicketsFailed`, and, for configurations that require acceptance, `MatchesRejected` (rejected by at least one player) and `MatchAcceptancesTimedOut`, with `TimeToTicketCancel` for players who gave up.

What I report, per queue, region, skill band and party size:

- **Queue time percentiles (p50, p90, p99),** never the average. FlexMatch reports average, minimum and maximum; compute percentiles yourself from per-ticket events. The players at the edges of the skill distribution and in small regions wait longest, and they're invisible in an average.
- **Abandon rate:** tickets cancelled by the player ÷ tickets started. A rising abandon rate with flat queue times means the expectation changed (a new mode shows an estimated wait players don't like).
- **Failure rate:** timed out or failed ÷ started, and dodges or declines after a match was found ÷ matches found.

**Match fairness** compares what the matchmaker predicted with what happened. A rating system gives a prediction: TrueSkill, Microsoft Research's system, scores a proposed match's quality as "the draw probability," which is highest when the sides are even (as documented by the open-source `trueskill` Python package, a third-party implementation). The metrics, this book's own:

```text
predicted_fairness(match) = 1 - |P(team A wins) - 0.5| * 2     -- 1.0 is a coin flip
calibration(bucket)       = observed win rate of matches whose predicted
                            P(team A wins) fell in bucket
stomp_rate(queue)         = matches decided by a margin above a game-specific
                            threshold / matches completed
```

The stomp threshold is the game's to set; Riot's published one for VALORANT is in [New Accounts and Smurfs](/books/gaming/matchmaking#new-accounts-and-smurfs). Calibration is the test that matters: matches the model called 60/40 should be won by the favorite about 60% of the time. If favorites win 75%, the ratings are wrong, not just the matches. Store the prediction on the match when it is made, not recomputed later from updated ratings, or the comparison measures the new model against old outcomes. Queue time and fairness trade against each other ([Quality Versus Queue Time](/books/gaming/matchmaking#quality-versus-queue-time)), so I report them together, on one chart per queue.

## Technical Health

Technical metrics belong on the same page as engagement, because a crash on launch is a retention problem before anyone files a bug.

**Crash rate.** Google Play's Android vitals defines crash rate as "the percentage of your daily active users who experienced any type of crash," and user-perceived crash rate as the share who "experienced at least one crash while they were actively using your app." Its bad behavior thresholds, as of October 2026, are 1.09% of daily active users across all devices and 8% for a single device model. Console platforms set their own requirements through certification ([Production Pipelines & Builds](/books/gaming/production-pipelines)). For your own dashboards, compute two rates from the crash reporter and session data: crashes per 1,000 sessions (how often the game fails) and the share of DAU with a crash (how many people it hurts), each split by build, platform, GPU and driver, because crashes cluster by hardware.

**Frame time.** Average FPS hides stutter: a game at 60 FPS with one 200 ms hitch every few seconds feels broken. Android's documentation classes frames that miss 16 ms as slow, those over 700 ms as frozen, and calls a game session slow when a large share of frames (its example: more than 25%) miss a target such as 50 ms (20 FPS) or 34 ms (30 FPS). The same shape works on any platform:

```text
frame_time_p50, p95, p99 per session, from a client-side histogram
slow_frame_share(session) = frames over the target frame time / total frames
slow_session_rate         = sessions with slow_frame_share above a threshold / sessions
```

Collect a histogram per session on the client (bucket counts, not every frame) and upload it with the session summary; the budget a frame must meet is in [Building Your Own Engine](/books/gaming/building-an-engine).

**Server tick health.** A server that can't finish its frame within the tick interval falls behind, and every player in the match feels it. Riot's public account of VALORANT's servers gives the shape of the metric: "each server frame needs to be shorter than 7.8125 milliseconds" at 128 ticks per second, the performance target for server frame time is 2.34 ms (so that three games fit on a core), and "since patch 5.07, 99.3+% of server frames have met our strict 128-tick requirements" (Riot, March 2023). That is the metric to copy: **the share of server frames within the tick budget**, per build and per player count, with the frame-time distribution behind it. GameLift's server telemetry exposes the same family (server tick rate, tick time, world tick time). Network health (round-trip time, packet loss, jitter) per match and region sits next to it ([Netcode Fundamentals](/books/gaming/netcode)).

## Experiments

Running an experiment on a live game (variants delivered through remote config, mutually exclusive audiences, no balance tests in ranked queues, prices reviewed first) is in [Live Operations](/books/gaming/live-operations#experiments), and the method (sticky hashed assignment, sample size, no peeking) is general, in [Experimentation & A/B Testing](/docs/telemetry/experimentation). This section is the readout: what a game measures, and what makes the result wrong.

- **The unit is the account,** so a player sees the same variant on every device and platform, with the assignment recorded server-side in `experiment_assignments` below ([Randomization Units and Assignment](/docs/telemetry/experimentation#randomization-units-and-assignment)). My default is to analyze from first exposure (the first session that reached the screen or rule the change touches, logged the same way in control, where nothing changed), not from assignment, so players who never got there don't dilute the effect. Exposure logged only in the treatment arm compares two different populations.
- **Crashes cause mismatches.** PlayFab Experiments flags a split that is "way off," "often caused by a treatment causing crashes or affecting logging" ([Sample Ratio Mismatch](/docs/telemetry/experimentation#sample-ratio-mismatch)). A mismatch is a bug alarm, read before any result.
- **Game guardrails:** crash rate, frame time, queue time and refunds on every experiment ([Guardrail Metrics](/docs/telemetry/experimentation#guardrail-metrics)). A store layout that raises conversion and doubles the crash rate on low-end phones is a loss.
- **Retention tests wait.** A D7 test counts only players who entered at least seven days ago, so it can't be read on day 3.
- **Shared assignment changes the arithmetic.** When a change is assigned by party, region or server because players in one match share it ([Interference and Network Effects](/docs/telemetry/experimentation#interference-and-network-effects)), the cluster is the unit of analysis: compute variance over clusters, not players, or the readout claims significance it doesn't have.

## Building the Pipeline

The events arrive through the [telemetry](/books/gaming/telemetry) pipeline and the backend's own tables; the steps (raw, staging, marts, one definition per metric) are in [Data Pipelines & Analytics](/docs/architecture/data-pipelines). Grain, fact types and dimensions are in [Modeling Analytical Data](/docs/data/data-modeling#facts-and-dimensions). The game-specific part is the facts to model. A player-day fact (a periodic snapshot) is the base for engagement, retention and revenue:

```sql
-- One row per player profile per day. tenant_id: one platform serves many games or studios.
CREATE TABLE fct_player_days (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  game_id              UUID NOT NULL REFERENCES games (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),   -- after merges, as of the build
  player_profile_id    UUID NOT NULL REFERENCES player_profiles (id),
  activity_on          DATE NOT NULL,          -- day boundary named by the definition
  first_activity_on    DATE NOT NULL,          -- the cohort
  platform             TEXT NOT NULL,          -- steam, psn, xbox, ios, android, ...
  country              CHAR(2),
  session_count        INTEGER NOT NULL,
  playtime_seconds     INTEGER NOT NULL,
  match_count          INTEGER NOT NULL DEFAULT 0,
  iap_gross_amount     BIGINT NOT NULL DEFAULT 0,   -- minor units, reporting currency
  iap_net_amount       BIGINT NOT NULL DEFAULT 0,   -- after refunds, chargebacks, store fees
  ad_revenue_amount    BIGINT NOT NULL DEFAULT 0,
  currency             CHAR(3) NOT NULL,
  is_excluded          BOOLEAN NOT NULL DEFAULT false,  -- bot, tester, merged away
  excluded_reason      TEXT,
  definition_version   TEXT NOT NULL,
  UNIQUE (tenant_id, player_profile_id, activity_on)
);
```

Match quality reads the matchmaker's snapshot, which [Matchmaking & Ranked](/books/gaming/matchmaking#the-ticket-model) adds to the core tables (`rating_before`, `expected_score` and `queue_wait_ms` per participant; `match_quality` and `rating_model_id` per match). The metrics need three more kinds of fact, written when they happen: the queue timeline split at the moment a match formed, so matching and placement time can be told apart; the team-level prediction; and the server's frame counts:

```sql
ALTER TABLE match_participants
  ADD COLUMN ticket_created_at        TIMESTAMPTZ,   -- player asked for a match
  ADD COLUMN matched_at               TIMESTAMPTZ,   -- potential match formed
  ADD COLUMN placed_at                TIMESTAMPTZ;   -- server allocated, player sent to it

ALTER TABLE matches
  ADD COLUMN predicted_win_probability DOUBLE PRECISION,  -- for team A, at match creation
  ADD COLUMN server_frames_total       INTEGER,      -- from the game server at match end
  ADD COLUMN server_frames_over_budget INTEGER;

CREATE TABLE experiment_assignments (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  experiment_id    UUID NOT NULL,                  -- defined in remote config: Live Operations
  variant_key      TEXT NOT NULL,
  account_id       UUID NOT NULL REFERENCES accounts (id),
  assigned_at      TIMESTAMPTZ NOT NULL,
  first_exposed_at TIMESTAMPTZ,                    -- null: assigned, never reached the change
  UNIQUE (tenant_id, experiment_id, account_id)
);
```

Two holes to close.

- **Client events are late, duplicated and mistimed.** Mobile clients send on the next launch, sometimes days later, and a clock wound forward creates future activity. Deduplicate on the event ID ([Retries Without Double Counting](/docs/telemetry/collection#retries-without-double-counting)), bound the device time by the server's ([Two Clocks](/docs/telemetry/collection#two-clocks)), and rebuild a trailing window so late events land in the right cohort ([Late Data](/docs/telemetry/collection#late-data)).
- **Reconcile money to the ledger.** Daily revenue in the mart matches the purchase ledger and the stores' reports for the same day, within a tolerance, before anyone reads ARPDAU ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).

Metrics that feed money outside the company (a revenue share with a partner, a creator payout, a publisher royalty) get frozen periods and stamped versions ([Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods)).

## What This Means for the System You Build

- **Name the unit.** Account, device or profile per metric, never mixed in one ratio; device counts kept for store reconciliation.
- **Activity is a named list of gameplay events.** Background pings, launcher heartbeats and failed logins don't make a player active.
- **Retention is per install cohort,** with day zero as first gameplay day, exact-day as the headline, the day boundary assigned once, and exclusions by rule.
- **Revenue columns say what they hold.** Gross, net and ad revenue separate, in minor units with currency, from the server-side ledger; realized LTV separate from predicted LTV with its model version and horizon.
- **CCU from fixed-interval samples,** with "connected" defined per tier.
- **Queue time as percentiles,** with match, placement, abandon and failure counts per queue, region and skill band; the fairness prediction stored on the match and checked for calibration.
- **Crash rate, frame time histograms and the share of server frames within budget** on the same dashboard as retention, split by build and hardware.
- **Experiments read from first exposure,** with assignment recorded server-side, sample ratio checks before results, game guardrails, durations fixed in advance and variance computed per cluster when assignment is shared.
- **One player-day fact, one definition per metric,** late and duplicate events handled, and revenue reconciled to the ledger.

## References

**Specifications**

- [Steamworks: ISteamUserStats Web API](https://partner.steamgames.com/doc/webapi/ISteamUserStats), `GetNumberOfCurrentPlayers` and its exclusion of players not connected to Steam

**Reference**

- [GameAnalytics: Metrics](https://docs.gameanalytics.com/events-metrics-and-filtering/metrics), DAU, MAU (calendar and rolling), exact-day retention, ARPDAU (IAP only, legacy), ARPU, ARPPU, conversion, sessions and playtime, UTC days
- [Unity: Analytics terminology (2022.1 manual, legacy Unity Analytics)](https://docs.unity3d.com/2022.1/Documentation/Manual/UnityAnalyticsTerminology.html), session-start DAU, 30-day MAU, sticky factor and its churn caveat, N-day retention, ARPDAU with ads and IAP, ARPPU, 30-minute session rule
- [Google Play: Crashes in Android vitals](https://developer.android.com/google/play/vitals/crash), crash rate, user-perceived crash rate, the 1.09% and 8% bad behavior thresholds, the per-device DAU definition
- [Android Developers: Slow rendering](https://developer.android.com/topic/performance/vitals/render), the 16 ms and 700 ms frame thresholds and frozen frames
- [Android Developers: Slow sessions](https://developer.android.com/topic/performance/issues/slow-session), slow game sessions as a share of frames missing a target frame time
- [AWS: Monitor Amazon GameLift Servers with CloudWatch](https://docs.aws.amazon.com/gameliftservers/latest/developerguide/monitoring-cloudwatch.html), FlexMatch metrics (TimeToMatch, TimeToTicketSuccess, timeouts, rejections, cancels), player session counts, server tick telemetry
- [Microsoft Learn: PlayFab Experiments](https://learn.microsoft.com/en-us/gaming/playfab/features/analytics/experiments/), concurrent randomized experiments, variants and overrides, scorecards, sample ratio mismatch, mutually exclusive audiences for overrides
- [trueskill (Python package documentation)](https://trueskill.org/), a third-party implementation of Microsoft's TrueSkill; match quality as draw probability, default mu and sigma

**In practice**

- [VALORANT: How We Got to the Best-Performing VALORANT Servers Since Launch](https://playvalorant.com/en-us/news/dev/how-we-got-to-the-best-performing-valorant-servers-since-launch/), Riot's public account of the 7.8125 ms frame limit, the 2.34 ms target and the share of server frames meeting 128-tick since patch 5.07 (March 2023)
