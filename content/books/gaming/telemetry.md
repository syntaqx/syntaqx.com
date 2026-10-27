+++
title = "Telemetry & Analytics"
description = "What a game measures and how: match and gameplay events, heatmaps, server tick and crash data, replays, economy events, vendors, sampling and the bill."
category = "Gaming Industry"
order = 1618
part = "Backend and Live Services"
tags = ["gaming", "telemetry", "analytics", "events", "heatmaps", "performance"]
+++

A live game is run on what it reports about itself. Designers want to know which map lane nobody walks, live ops wants to know whether the weekend event moved retention, engineers want the crash that only happens on one GPU driver, the fair play team wants the match where one player's aim never missed, and finance wants every purchase to reconcile. All of it arrives as telemetry: events emitted by clients, game servers and backend services, collected, stored and turned into numbers.

The general practice is in the playbook's telemetry section: how to name and shape an event ([Event Design & Instrumentation](/docs/telemetry/event-design)), how clients and servers ship events reliably ([Collecting Events](/docs/telemetry/collection)), consent and personal data ([Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy)), funnels and cohorts ([Product Analytics](/docs/telemetry/product-analytics)) and A/B tests ([Experimentation & A/B Testing](/docs/telemetry/experimentation)). The warehouse behind it is in [Data Pipelines & Analytics](/docs/architecture/data-pipelines). This chapter is the part that is specific to games: what a match produces, where positions and heatmaps come from, how server tick health and crashes are measured, why replays are a data source, how economy events are kept honest, which vendors exist, and how to keep the bill proportional to the game. The metric definitions built on top (DAU, retention, ARPDAU, match quality) are in [Game Metrics](/books/gaming/game-metrics).

## What a Game Emits

A game produces more kinds of telemetry than a typical application, and they differ in who emits them, how far they can be trusted and how fast someone needs them:

| Family | Emitted by | Trust | Who needs it, and how fast | Typical retention |
| --- | --- | --- | --- | --- |
| Session and progression (start, level complete, tutorial step) | Client | A claim | Design and live ops, hours | Long, aggregated |
| Match results and per-player match stats | Game server | Authoritative | Ranked, matchmaking, balance, minutes | Long |
| Positions, kills, damage, ability use | Game server | Authoritative | Balance and level design, hours | Short raw, long aggregated |
| Economy (currency earned and spent, items granted) | Backend services | Authoritative, from the ledger | Economy design, finance, hours | As long as the ledger |
| Crashes, hangs, frame time, load time | Client | Diagnostic | Engineering, minutes | Weeks raw, long aggregated |
| Server frame time, tick overruns | Game server | Authoritative | Engineering, minutes | Weeks raw, long aggregated |
| Network quality (round trip, loss, jitter) | Client and server | Measured on both ends | Network and hosting, minutes | Weeks |
| Replays and server recordings | Game server | Complete record | Esports, support, fair play, on demand | Days to months |
| Anti-cheat signals | Client integrity layer, server | Security data | Fair play, minutes | Short, by policy |

Two rules fall out of the table. **Anything that counts is recorded by the server.** A client is a program running on hardware the player controls, so a client event is a claim; the server's record of a match result, a purchase or a currency grant is the fact, and every metric that feeds rank, revenue or a penalty is computed from it. The same rule is in the general guidance ([Collecting Events](/docs/telemetry/collection)); in a game it matters more, because the client is under constant attack ([Anti-Cheat](/books/gaming/anti-cheat)). **Anti-cheat signals travel separately.** They are collected for a security purpose, retained under a different policy and read by a different team, so they get their own pipeline and access controls instead of a column in the product analytics tables.

## Gameplay Events

The mechanics of naming, typing and versioning events are general ([Event Design & Instrumentation](/docs/telemetry/event-design)). Games add a handful of context fields that every gameplay event needs and a web product never has:

- **Build.** The client or server build that emitted it (the `builds` row from the [core data model](/books/gaming/games-business)). During a patch rollout several builds are live at once, and old clients keep sending the previous version's events for days ([Patching & Content Delivery](/books/gaming/patching)), so every query that compares before and after a patch splits by build, and schemas stay readable for every build still in the field.
- **Match, mode and map version.** A kill event without the match is noise; a position without the map version is meaningless once the map changes.
- **Simulation time.** The server tick or match clock, beside the wall-clock time. Ordering inside a match uses the tick, because wall clocks on different machines disagree and the tick doesn't.
- **The profile, not just the account.** Play happens on a per-game profile, ownership and penalties on the account ([The Games Business](/books/gaming/games-business)).
- **Config and experiment state.** The config version the emitter was running and the experiment variants the player was in, so a change in a metric can be traced to the config or variant that caused it without reconstructing assignment later ([Live Operations](/books/gaming/live-operations#experiments)).

The two most used game analytics vendors show the two common shapes. **GameAnalytics** fixes the event types: business events for real-money purchases ("In-App Purchases supporting receipt validation on GA servers," with the amount as an integer in cents and an ISO 4217 currency), resource events for "the flow of virtual currencies," progression events for "level attempts with Start, Fail & Complete," error events, ad events and custom design events. A design event ID is "a hierarchy string that can consist of 1-5 segments separated by ':'," each up to 32 characters, and the docs warn against generating too many unique nodes ("around 10k" at most). Their bad example is `[level_name]:[weapon_used]:[damage_done]`, about 1.5 million possible nodes, with the advice that damage belongs in the value, not the name. **Unity Analytics** has standard events, which "cannot be edited" and mostly fire automatically, and custom events that must be defined in the dashboard first: "Events must conform to a schema that exists on the dashboard or else they are rejected as invalid." Its example custom event, `dungeonCompleted`, carries the dungeon name, time, death count, remaining health and potions used: a snapshot of the player's state at the moment the action finished.

Both enforce the general rule of [no values in names](/docs/telemetry/event-design#names-object-then-action), the most common instrumentation mistake in games: weapon, map, character and level are fields, never parts of a name.

## Match Telemetry

The match is the unit most game analysis is built on, and the game server is the one place that sees all of it. At the end of every match, the server writes a summary per participant, through the same life-cycle event that ranked and progression consume (`match.completed`, [The Games Business](/books/gaming/games-business)): result, team, character or loadout, time played, the game's core stats (kills, deaths, assists, damage, objectives, gold or credits), and the match's own health (average and worst round trip, packet loss, server frames over budget). Ranked and matchmaking read the result; balance and design read the stats.

Below the summary sit the per-event streams: each kill with the killer's and victim's positions, weapon and the tick; each ability use; each purchase in an in-match economy; round boundaries. These are what answer balance questions (does this character win more on one map, does this weapon dominate at long range) and design questions (where do fights happen, how long does a round last). They are large, so they go to the warehouse as files, not into the operational database.

Two cautions for balance analysis. Win rates need sample sizes and confidence intervals before they are read; a character played in 400 matches can look 4 points stronger by chance. And win rate is confounded by who plays what: a character favored by highly rated players wins more because of the players, so compare within rating bands, using the rating the matchmaker recorded at match time ([Matchmaking & Ranked](/books/gaming/matchmaking); [Game Metrics](/books/gaming/game-metrics) adds the matchmaker's columns to `match_participants`).

## Positions and Heatmaps

A heatmap is a count of events per cell of a map. The pipeline is simple and the details decide whether it is right:

- **Sample positions on the server, on a fixed tick interval.** Every player's position once a second (illustrative) is enough for movement heatmaps; every tick is not, and costs a hundred times more. Event positions (deaths, kills, item pickups, ability casts) are recorded at the event, not sampled.
- **Key by map version.** A heatmap that mixes positions from before and after a wall moved shows paths through the wall. The map version is a field on every position event, and the aggregation groups by it.
- **Aggregate into a grid at write time in the warehouse,** one row per map version, mode, cell and event type per day, with counts. The raw positions are kept briefly for new questions and then expire; the grid is kept.
- **Normalize.** Raw counts follow population: the busiest lane is busy because most players walk it. Divide deaths by time spent in the cell to find where a player is most likely to die, which is the question level designers actually ask.
- **Sample by match, not by event.** If position streams are too expensive to keep for every match, keep them for a deterministic fraction of matches (hash the match ID) and keep those matches complete. Both give the same counts in expectation, but only whole matches keep a player's path, the route into a fight and the time spent in a cell, which are the questions that come after the first heatmap.

The volume makes the case for sampling. At one position sample per second, 100,000 players in matches emit 100,000 events a second, ten times every other event in the illustrative pipeline below combined. Keeping full position streams for 10% of matches brings that back to the size of the rest.

## Replays and Server Recordings

The richest record a game can keep is a recording of the match itself. League's Server Network Recordings, "a complete record of the inputs, match settings, and configurations used to play the game" (Riot, June 2017), are the public example; how they work and what esports does with them are in [Determinism on the Server](/books/gaming/determinism-and-rollback#determinism-on-the-server-league-of-legends) and [Replays, Rewinds and Recovery](/books/gaming/esports-and-spectating#replays-rewinds-and-recovery). For analytics, the point is narrower: when a game can replay a match from its inputs, any statistic not computed at the time can still be computed later, by replaying, without having been logged.

That changes what telemetry must capture. A deterministic game ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)) can log less (inputs and the summary) and recompute the rest on demand for the matches that matter: a disputed ranked game, a support ticket, an esports match ([Esports & Spectating](/books/gaming/esports-and-spectating)), a suspected cheater. A game whose server isn't deterministic has to decide up front what it logs, because nothing can be recovered afterward. Either way, recordings are large and are personal data (they contain everything a player did, and in-match chat if it is recorded), so they get a retention period per purpose, not "forever".

## Economy Events

Currency and items move through the backend, not the client, and the ledger is the record ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)). Economy telemetry is a view of that ledger, tagged with the gameplay context the ledger doesn't hold: which activity a reward came from (a match, a quest, a battle pass tier), which store offer a spend went to, which build and mode. GameAnalytics models the same split with resource events as sources and sinks, and two pieces of its guidance carry over to any implementation: resource amounts are positive, with direction given by the event type, and resource events should be batched ("Be careful to not call the resource event too often!"; send one source event when a level ends, not one per coin).

My rule: **the economy dashboard reconciles to the ledger every day.** If the sum of earned currency in telemetry differs from the sum of reward ledger entries for the same day by more than a tolerance, the telemetry is wrong, and the dashboard says so before anyone tunes a drop rate from it. The same reconciliation applies to real-money revenue ([Game Metrics](/books/gaming/game-metrics)).

## Crash, Performance and Network Telemetry

Crash reporting itself (symbol servers, minidumps, grouping by stack and build) belongs to the build pipeline and is covered in [Production Pipelines & Builds](/books/gaming/production-pipelines); the crash-rate and frame-time definitions are in [Game Metrics](/books/gaming/game-metrics#technical-health). What telemetry adds is the context that makes them useful:

- **Hardware and driver on every session,** bucketed: GPU model, driver version, CPU, memory, operating system, and on mobile the device model. Crashes and stutter cluster by hardware, and a regression that hits one driver is invisible in the average.
- **Histograms, not frames.** A client at 144 frames a second produces half a million frame times an hour. Bucket them on the client and upload the histogram with the session summary. Load times, hitch counts and memory peaks go the same way.
- **Server frame time per match,** keyed by server build, map and player count, because a regression can live only at full lobbies: Riot found VALORANT's worst server slowdown by splitting live telemetry by client count ([The Frame Budget at 128 Ticks](/books/gaming/game-servers#the-frame-budget-at-128-ticks) tells it). Averaged over all matches, such a regression is small; at full lobbies, it's the whole problem.
- **Network quality per match and region:** round trip, loss and jitter, measured by both client and server. Riot's network team named those three as "more impactful values" than router-centric counters, and streamed router telemetry every millisecond instead of polling it (Riot Direct, July 2016). For a game backend the actionable unit is coarser: per match, per region and per ISP, so a routing problem shows up as one ISP's players losing packets in one city ([Netcode Fundamentals](/books/gaming/netcode#bandwidth-loss-and-jitter)).

Server processes also emit the ordinary service telemetry (logs, metrics, traces) that every backend has; that is [Observability](/docs/operations/observability), on its own pipeline. The game-specific part is the match-level record above, joinable to players and builds.

## Sampling at Game Scale

Sampling rules are general ([Sampling](/docs/telemetry/collection#sampling)): sample by unit, deterministically, record the rate on every sampled event, and serve rates as remote configuration. Games make some of them sharper.

**Never sample:** match results, purchases and currency movements, penalties and the evidence behind them, crash first occurrences per build, and anything a player can dispute. **Sample freely:** position streams, per-frame and per-tick performance data, verbose client debug events, and server traces for healthy matches, with head or tail sampling chosen as in [Sampling Traces: Head or Tail](/docs/operations/observability#sampling-traces-head-or-tail).

The game-specific rules:

- **The unit is the match or session.** Hash the match ID, and every event in a kept match is kept, so per-match questions stay answerable.
- **Keep the matches that matter in full.** Ranked matches with a cheating report, esports matches, matches on a candidate build, and matches with a server frame-time alarm are always kept, whatever the base rate.
- **Rates vary by game, build and platform** as well as event family, so a noisy event can be turned down without a patch ([Live Operations](/books/gaming/live-operations)).

## Players, Consent and Children

Consent flows, lawful bases, pseudonymous IDs and erasure are general ([Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy); [GDPR & Privacy Law](/docs/compliance/gdpr)), and what erasure means for a game's append-only event history is in [Erasure Against Append-Only Records](/books/gaming/saves-and-player-data#erasure-against-append-only-records). Three points are particular to games.

**Telemetry IDs are personal information for children.** Under COPPA, the device and account identifiers every telemetry SDK collects are personal information, usable without parental consent only for "support for the internal operations" of the game and never to profile a child ([COPPA in Games](/books/gaming/ratings-and-age#coppa-in-games); [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#coppa)). For a game with child players, that is the line between crash and performance telemetry and behavioral profiling, and the pipeline enforces it by age band.

**SDKs don't decide for you.** Unity's documentation says plainly that "the Analytics SDK does not manage data privacy compliance in any way"; since version 5.0.0 it starts "in a dormant state, in which it ignores all events" until the game grants consent (through `StartDataCollection()` in older versions, the `EndUserConsent` API from Unity 6.2), and its `RequestDataDeletion()` covers Analytics and Push Notifications only, not the game's other services. Every vendor SDK in the game needs the same review: what it collects before consent, how it is stopped, and what deletion reaches.

**Purposes stay apart.** Gameplay analytics, anti-cheat signals and voice or chat moderation data are collected for different purposes, under different retention and access rules ([Data Governance & Access](/docs/data/data-governance#access-control)). A publisher that states a purpose in public, as Riot does for Vanguard's data ([Anti-Cheat](/books/gaming/anti-cheat#privacy)), can only keep the promise if the pipelines are separate: one purpose, one pipeline, one retention rule, one set of readers.

## The Pipeline

A game's pipeline has two paths. The **hot path** feeds live operations: concurrent players, error and crash spikes, server frame-time alarms, an economy anomaly after a store change, all within a couple of minutes. The **cold path** feeds everything else: balance, retention, revenue, heatmaps, built in the warehouse on a schedule and rebuildable from the raw store. The two paths read the same stream. When a stream earns its cost, and how its windows and late data work, is in [Streaming & Event Processing](/docs/data/streaming#when-streaming-beats-batch); where the cold path lands is in [Warehouses, Lakes & Lakehouses](/docs/data/warehouses-and-lakes#choosing), and live dashboards that need sub-second queries sit on a [real-time analytical database](/docs/data/analytical-databases#what-they-re-used-for).

![Plan view of an event pipeline. On the hot path, five boxes left to right: client (batched), collect (validate, enrich), bus (partitioned log), stream (one-minute windows) and live (alerts, live ops), with chain dimensions L1 = 60, L2 = 1, L3 = 5 and L4 = 60 seconds and the highlighted total LH = 126 seconds. From the bus a cold path drops to raw (hourly files) and marts (scheduled models), with L5 = 3,600 and L6 = 3,600 seconds and the total LC = L1 + L2 + L5 + L6 = 7,261 seconds. A leader marks E1 = 10,000 events per second entering the collector, and another marks D1 = 432 GB a day landing in raw. Two variable tables define V1 = 100,000 concurrent players, R1 = 0.1 events per player per second, E1 = V1 x R1, B1 = 500 bytes and D1 = E1 x B1 x 86,400, and the six latencies.](/diagrams/gm-telemetry-pipeline.svg "One stream, two paths (illustrative values; L1 is Unity Analytics' upload interval). The client's batch interval sets the floor for both paths, and the cold path is slow by design: it trades minutes for a raw store that can rebuild any metric.")

The sheet's arithmetic is the sizing exercise every game should do before launch. A hundred thousand concurrent players sending one event every ten seconds is 10,000 events a second; at 500 bytes each, 432 GB of raw events a day, before position streams. The client's batch interval is the floor for every latency: Unity Analytics batches recorded events and uploads them "automatically every 60 seconds," so nothing from that SDK reaches a dashboard in less than a minute, and anything that needs to be faster (a server frame-time alarm, concurrency) comes from servers, not clients.

PlayFab draws the same two paths in its product. PlayStream is "a unified real-time stream (and historical archive) of every event fired by your game," with a real-time rules engine and scheduled exports to Azure Blob Storage or Amazon S3, while its Telemetry path "skips all the real-time processing, making it cost-effective," with "softer limits" on volume and "up to 10-KB payloads" (Microsoft docs, as of October 2026). Events that need a reaction go through the stream; events that only need counting go around it.

Scale varies by orders of magnitude between games. The one public figure from Riot is the title of a December 2022 AWS re:Invent session: "How Riot Games processes 20 TB of analytics data daily on AWS." Design for your own number, measured from a soft launch, and plan for it to grow with every feature that adds events.

## Vendors

| Tool | What it is | Event model | Notable |
| --- | --- | --- | --- |
| GameAnalytics | Analytics service built for games, with SDKs for the major engines | Fixed types: business, resource, progression, design, error, ad, impression | Design event hierarchies of 1 to 5 segments; guidance against high cardinality; metrics computed in UTC |
| Unity Analytics | Part of Unity Gaming Services | Standard events plus custom events defined in the dashboard first | Rejects events off-schema, more than 30 days old or more than 24 hours in the future; uploads every 60 s; dormant until consent |
| PlayFab | Microsoft's game backend, with analytics in it | PlayStream events and a cheaper Telemetry path | Real-time rules engine, segments, experiments, export to Blob or S3 |
| Backend platforms (Pragma, AccelByte) | Game backends that include analytics modules | Vendor-specific | Pragma lists "Telemetry & Analytics" among its services; AccelByte places game analytics in its Foundations modules |
| Your own pipeline | Collector, bus, lake or warehouse | Your schemas | Full control and the operating cost that comes with it |

The vendor facts are as their documentation stated them in October 2026. The buy-or-build line is usually volume and ownership: a vendor is the fastest way to DAU, retention and funnels for a small or mobile game, and its fixed event model is a feature there. A game with its own backend, match telemetry, heatmaps and anti-cheat signals ends up with its own pipeline anyway, because the match data lives on its servers, and then the vendor becomes one more copy to reconcile. My default: own the pipeline for server-side and match data from the start, and use a vendor SDK only for client-side product analytics if it saves real time, with its export flowing into the same warehouse.

## Cost Control

Telemetry cost grows with players, events per player and bytes per event, and the second factor is the one teams lose control of. The general levers are in [Cost Control](/docs/telemetry/collection#cost-control); in a game, in the order I'd pull them:

- **A budget per event family,** in events per player per hour, set at design review and checked in a test: a client build that emits more than its budget in an automated play session fails, the same way a build that blows its frame budget does.
- **Aggregate on the device or server.** Histograms for frame time, counters per minute for repeated actions, one resource event per level. GameAnalytics' resource guidance is the same idea.
- **Sample by match** for position streams and verbose diagnostics, as above.
- **Keep cardinality in fields,** so storage compresses and queries group instead of scanning millions of event names.
- **Tier retention.** Raw positions and frame data for weeks, aggregates for years, money and penalties as long as the ledger and the policy require ([Data Retention](/docs/architecture/data-retention)).
- **Kill switches.** Every event family can be turned down or off from remote configuration, because the day a new event floods the pipeline is the day nobody can ship a patch ([Live Operations](/books/gaming/live-operations)).
- **Report cost per thousand DAU** next to the pipeline's own metrics, so a feature that doubles the bill is visible in the week it ships ([Cost & FinOps](/docs/operations/cost-and-finops)).

## How to Build It

### The Event Envelope

Every event from every emitter shares one envelope, and the event's own fields sit beside it. A sketch of a kill event from a game server:

```json
{
  "event_id": "01J9Z3K8V6W2Q4N7R5T1Y0XBCD",
  "name": "combat.kill",
  "schema_version": 3,
  "game": "arena",
  "emitter": "server",
  "build_id": "b7f1c0de-1111-4a2b-9c3d-000000000042",
  "config_version": 1187,
  "experiments": { "shop_layout_v2": "treatment" },
  "match_id": "0192f3a1-7c2e-7d4b-8a11-5e6f7a8b9c0d",
  "mode": "ranked",
  "map_version": "harbor@14",
  "tick": 48211,
  "occurred_at": "2026-10-26T18:42:07.512Z",
  "sample_rate": 1,
  "killer_profile_id": "0192f3a1-0000-7000-8000-000000000001",
  "victim_profile_id": "0192f3a1-0000-7000-8000-000000000002",
  "weapon": "rifle_ak",
  "killer_pos": [1204.5, 88.0, -310.2],
  "victim_pos": [1260.1, 88.0, -295.7]
}
```

The decisions in it:

- **The emitter generates `event_id`,** so the collector can drop retries ([Retries Without Double Counting](/docs/telemetry/collection#retries-without-double-counting)).
- **`schema_version` per event name,** validated at the collector; an event that fails validation goes to a quarantine table with the reason, not to the floor, because the build that sent it is still in the field.
- **`emitter` says whose claim it is.** Metrics that feed rank, revenue or penalties filter to `server` and `backend`.
- **`tick` orders, `occurred_at` dates.** Inside a match, order by tick; across matches, by the server's clock, never the client's ([Two Clocks](/docs/telemetry/collection#two-clocks)).
- **`sample_rate` travels with the event,** so a count from sampled data can be scaled back up without knowing which rule was live that day.

### Hot or Cold

My default for which path an event takes: it goes to the hot path only if someone or something acts on it within minutes (an alert, a kill switch, a live-ops dashboard during an event), and everything else is cold. Server frame-time alarms, concurrency, crash spikes per build and economy anomalies after a store change are hot; balance, heatmaps, retention and revenue are cold. The hot path keeps one-minute aggregates for days; the raw store keeps the events, so any hot metric can be rebuilt cold.

### The Data Model

The warehouse tables follow the general layering ([Data Pipelines & Analytics](/docs/architecture/data-pipelines)). The operational side needs two things the [core data model](/books/gaming/games-business) doesn't have: sampling and budget rules as data, and per-match health written by the server:

```sql
CREATE TABLE telemetry_sampling_rules (     -- served to clients and servers as remote config
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  game_id       UUID NOT NULL REFERENCES games (id),
  event_family  TEXT NOT NULL,              -- positions, perf_frames, debug, ...
  build_id      UUID REFERENCES builds (id),  -- null: every build
  platform      TEXT,                       -- null: every platform
  sample_basis  TEXT NOT NULL CHECK (sample_basis IN ('match', 'session', 'none')),
  sample_rate   NUMERIC(5, 4) NOT NULL CHECK (sample_rate BETWEEN 0 AND 1),
  budget_per_player_hour INTEGER,           -- events; enforced in automated play tests
  is_enabled    BOOLEAN NOT NULL DEFAULT TRUE,  -- the kill switch
  valid_during  TSTZRANGE NOT NULL,
  approved_by   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE matches
  ADD COLUMN map_version           TEXT,
  ADD COLUMN telemetry_sample_rate NUMERIC(5, 4),   -- 1 when kept in full
  ADD COLUMN is_kept_in_full       BOOLEAN NOT NULL DEFAULT FALSE;  -- ranked report, esports, alarm

ALTER TABLE match_participants
  ADD COLUMN stats                 JSONB NOT NULL DEFAULT '{}',  -- the game's core stats
  ADD COLUMN rtt_avg_ms            INTEGER,
  ADD COLUMN rtt_p95_ms            INTEGER,
  ADD COLUMN packet_loss_pct       NUMERIC(5, 2),
  ADD COLUMN client_build_id       UUID REFERENCES builds (id);
```

The server frame counts per match are already on `matches` from [Game Metrics](/books/gaming/game-metrics#how-to-build-it), and recordings are rows in `match_recordings`, with their build, hash and expiry, from [Esports & Spectating](/books/gaming/esports-and-spectating#replays-rewinds-and-recovery). Kill, position and ability events don't belong in these tables at all: they land as files in the raw store, partitioned by game, day and map version, and only aggregates come back. What the events become (funnels, cohorts, retention, experiment readouts) is [Game Metrics](/books/gaming/game-metrics).

## What This Means for the System You Build

- **Server-recorded facts** for results, rewards, purchases and penalties; client events for behavior and diagnostics only.
- **One envelope on every event:** an emitter-made event ID, a schema version, the emitter, build, config version, experiment variants, match, mode, map version, simulation tick and sample rate, with identifiers in fields, never in event names.
- **A per-participant match summary** written by the server at match end, with network and server-frame health beside the game's stats.
- **Heatmaps from server-sampled positions,** keyed by map version, normalized by time in cell, and sampled by match.
- **Recordings where the game can replay,** with a retention period per purpose.
- **Economy telemetry reconciled daily** to the ledger.
- **Crash and performance data with hardware and player-count dimensions,** collected as histograms.
- **Sampling, budgets and kill switches as remote configuration,** per event family, game, build and platform.
- **Anti-cheat and moderation data on their own pipelines,** with their own retention and access.
- **A sizing sheet** (players, events per player, bytes, latency per stage) before launch, measured again after.

## References

**Specifications**

- [eCFR via Cornell LII: 16 CFR 312.2, COPPA definitions](https://www.law.cornell.edu/cfr/text/16/312.2), persistent identifiers as personal information and "support for the internal operations"

**Reference**

- [GameAnalytics: Event tracking (C# SDK)](https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/open-source-sdks/c-sharp/event-tracking), event types, design event hierarchy limits, cardinality guidance and resource event batching
- [GameAnalytics: Metrics](https://docs.gameanalytics.com/events-metrics-and-filtering/metrics), metric definitions computed in UTC
- [Unity: Analytics events](https://docs.unity.com/ugs/en-us/manual/analytics/manual/events), standard and custom events and the `dungeonCompleted` example
- [Unity: Record events](https://docs.unity.com/ugs/en-us/manual/analytics/manual/record-event), schema validation, timestamp rejection rules, 60-second uploads and common fields
- [Unity: Manage data privacy with the SDK](https://docs.unity.com/en-us/analytics/privacy-and-consent/manage-data-privacy), dormant until consent, `EndUserConsent`, `RequestDataDeletion` and its scope
- [Microsoft: What is PlayFab?](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), PlayStream, the rules engine and event archiving to Blob or S3
- [Microsoft: PlayFab Telemetry overview](https://devdocs.xbox.com/services/playfab/data-analytics/ingest-data/telemetry-overview), the cheaper telemetry path, softer limits and 10 KB payloads
- [Pragma](https://pragma.gg/), telemetry and analytics among its backend services (vendor page)
- [AccelByte: Gaming Services modules](https://docs.accelbyte.io/gaming-services/modules/), game analytics in the Foundations modules

**In practice**

- [Riot Games: How We Got to the Best-Performing VALORANT Servers Since Launch](https://playvalorant.com/en-us/news/dev/how-we-got-to-the-best-performing-valorant-servers-since-launch/), the server regression found by splitting live telemetry by client count (March 2023)
- [Riot Games: Determinism in League of Legends: Introduction](https://www.riotgames.com/en/news/determinism-league-legends-introduction), Server Network Recordings as a complete record of a match (June 2017)
- [Riot Games: Fixing the Internet for Real-Time Applications: Part III](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-iii), latency, loss and jitter as the metrics that matter, streamed every millisecond (July 2016)
- [Riot Games: re:presenting at AWS re:Invent](https://www.riotgames.com/en/news/re-presenting-at-aws-re-invent), the session title on 20 TB of analytics data a day (December 2022)
