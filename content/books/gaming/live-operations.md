+++
title = "Live Operations"
description = "Running a game that changes every week: patches, hotfixes and server-side overrides, seasons as dated content, flags, experiments, version skew and incidents."
category = "Gaming Industry"
order = 1617
part = "Backend and Live Services"
tags = ["gaming", "live-ops", "patching", "feature-flags", "remote-config", "incidents"]
+++

A boxed game shipped once. A live game ships constantly: a balance patch every couple of weeks, a fix the day after, an event that starts at a set instant around the world, a store that rotates daily, a season that ends and resets the ladder, and every so often a change that breaks something for millions of players at once. **Live operations** is the discipline of changing a running game safely and on schedule, and the system underneath it decides how fast a change can reach players, how many players it can hurt, and how quickly it can be taken back.

This chapter covers the paths a change can take (client patch, hotfix, server-side data, configuration), the cadence that organizes them, seasons and events as effective-dated content, flags and remote config, experiments, the version skew that every path creates, maintenance and player communication, incidents in a game that can't stop running, and the tables that hold it together. It links out for the rest: how builds get to players' disks, channels and the minimum client version are in [Patching & Content Delivery](/books/gaming/patching); the backend services, launch-day failures and login queues are in [Game Backend Architecture](/books/gaming/game-backend); experiment metrics and assignment are in [Game Metrics](/books/gaming/game-metrics#experiments); and compensation grants are in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#auditing).

## Four Ways to Change a Running Game

Every change to a live game travels one of four paths, and they differ by an order of magnitude or more in speed and in what they can touch:

| Path | What it changes | Players must | Typical speed |
| --- | --- | --- | --- |
| Full patch | Client code and assets, server builds, data | Download, then restart | The patch cadence |
| Hotfix | A smaller client or server build between patches | Download (client) or nothing (server) | Hours to days |
| Server-side data change | Numbers and scripts the game server loads | Nothing | Minutes to an hour |
| Config or flag change | Values and switches the services and client read at runtime | Nothing | Seconds |

Riot's 2021 bug blog on Teamfight Tactics draws the line between the first and third paths precisely. TFT's server data is Lua for logic and the Game Data Server for numbers, while client data includes the art. Client changes need a **full patch**, and Riot releases "at least one of these every 2 weeks." Server changes go out as a **micropatch**: the binary Lua or data is base64-encoded into a server file, and when the game server loads, an override with a matching key replaces the original. "Server changes are significantly easier for players because they don't affect their machines directly," and they apply to PC and mobile alike. The post's example is a burn effect that shipped dealing damage every 100 seconds instead of every second; the micropatch fixed it in about an hour. Its limit is just as instructive: because scripts are encoded as whole files, two micropatches touching the same file conflict, and the fix has to carry both changes in one file.

Riot's 2017 post on its microservice ecosystem describes the same idea one level down. Configuration can be "updated in real time," with a rate limit (`ratelimit.txsec=1000`) as the example, and game servers pick up pushed game data at game start, so a champion data fix that once "required a full redeploy of the game" became a balance tweak without downtime.

The hotfix path got faster as delivery did. Riot's 2019 post on League's new patcher reports deploying a new version of the game "in less than a minute instead of the five hours it used to take," which it calls "a massive win for our ability to get hotfixes out quickly." The Legends of Runeterra team describes the same rhythm: releases "every few weeks, with hotfixes along the way as needed."

The design lesson is to make the cheap paths able to carry as much as possible. Numbers that designers tune (damage, cooldowns, prices, drop rates, reward amounts, queue settings) belong in server-side data or config, read at match start or at runtime, so that most fixes never need a build. Logic that might need an emergency off switch sits behind a flag. Only what truly lives on the player's machine (code, art, audio, local UI) should need a download. My rule: every change goes out by the cheapest path that can carry it, and when a fix can only go out by a slow path, that's a design bug worth logging even after the fix ships.

## Cadence

A schedule is a product decision as much as an engineering one. Riot publishes League of Legends' patch schedule: in 2026, 24 patches numbered `YEAR.PATCH` (26.01 to 26.24), released on Wednesdays Pacific Time unless marked otherwise, with a promise to post an alert if a patch is delayed within 48 hours of its date. A fixed cadence lets every group plan against the same dates: designers know when balance changes land, the content pipeline knows when a skin must be locked, esports knows which patch a tournament will use, players know when to expect change.

![A dimensional drawing of a live game's patch cadence. A plan view lays League of Legends patches 26.19 to 26.24 on a 2026 timeline as five intervals, four of 14 days and one of 21, chained to a total cycle of 77 days. A detail view zooms into one 14-day interval with three lanes, client, server and config, and marks an illustrative server-side override one day after the patch, a client hotfix six days in, a config flip and an event window running to the next patch. A variable table defines every code, including the 24 patches scheduled in 2026 and their mean interval of 14.57 days.](/diagrams/gm-live-operations-cadence.svg "The patch train sets the rhythm, but most changes ride faster paths between trains: a server-side override in minutes, a config flip in seconds, a client hotfix only when the client must change.")

The schedule isn't perfectly even, and the drawing shows why that matters. Most intervals are two weeks, but the gap before the year's last patch is three, and four of the year's patches move to a Thursday. A train schedule has to be data your tools read, not an assumption that "patches are every two weeks," because content locks, event dates and test plans are computed from it.

Inside a cadence, the train holds what needs a build and everything that can wait. What can't wait goes out of band by the fastest path that can carry it, with its own lighter review, and the next train absorbs it so the out-of-band change isn't lost or reverted. That merge back is easy to forget: a micropatch that overrides server data has to be folded into the source data before the next patch, or the next patch quietly undoes the fix.

## Seasons and Events Are Dated Content

Seasons, battle passes, limited-time modes, holiday events, store rotations and double-XP weekends are all content with a start and an end. Treat them as effective-dated data, not as code that someone remembers to switch on ([Effective Dating & History](/docs/database/temporal-data#scheduling-future-changes)).

The pattern is to ship dark and activate by date. The event's assets go out in an earlier patch, invisible; its definition (start, end, regions, rewards, the modes or store entries it enables) is data with a `valid_during` range; when the range opens, services and clients start honoring it, and when it closes, they stop. Unity's Remote Config documentation lists exactly this use: to "Turn on or off seasonal, holiday, or other time-sensitive events." Vendor backends model the time-boxed parts directly; Nakama, for one, offers seasonal leaderboards and tournaments.

```sql
CREATE TABLE live_events (                  -- one version of one event; a change is a new version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  game_id             UUID NOT NULL REFERENCES games (id),
  code                TEXT NOT NULL,          -- 'winter_2026'
  version             INTEGER NOT NULL,
  start_rule          TEXT NOT NULL CHECK (start_rule IN ('global_instant', 'local_time')),
  min_client_build_id UUID REFERENCES builds (id),
  config_overrides    JSONB NOT NULL DEFAULT '{}',  -- keys validated against the config schema
  rewards             JSONB NOT NULL DEFAULT '[]',  -- granted as a campaign: Economies
  approved_by         TEXT,                   -- null while draft
  approved_at         TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  UNIQUE (tenant_id, game_id, code, version)
);

CREATE TABLE live_event_windows (           -- where and when one event version runs
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  live_event_id UUID NOT NULL REFERENCES live_events (id),
  region        TEXT NOT NULL,
  starts_local  TIMESTAMP,                  -- start_rule = 'local_time': wall clock ...
  ends_local    TIMESTAMP,
  time_zone     TEXT,                       -- ... in this IANA zone
  valid_during  TSTZRANGE NOT NULL,         -- the instants, UTC; computed for local_time
  UNIQUE (live_event_id, region)
);
```

An event has no status column to flip. It is a draft until approved, scheduled until its window opens, live inside it and over after it, and every service computes that from the window and the clock, so nothing depends on a job running at midnight. Cancelling sets `cancelled_at`; changing a live event's rewards or end publishes a new version, so a player's claim can always name the version it was made under.

Three details decide whether events work:

- **Which instant.** A global event starts at one instant everywhere, which is midnight somewhere and lunchtime somewhere else. A local-time event starts at a different instant in each region, so each window stores the wall-clock time and the zone, and `valid_during` is recomputed whenever the time zone database changes ([Time & Date Formats](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)). Decide per event and store the decision.
- **Which build.** An event whose client assets aren't on a player's disk can't show; `min_client_build_id` keeps the event invisible to older clients rather than crashing them.
- **Testing in time.** An event that only works on its start date can't be tested until it's too late. Every service that reads dated content takes its "now" from an injectable clock, so a test environment can run at next Tuesday 00:00 UTC and play through the whole event, including its end.

Event starts are also load events. Everybody who wants the new mode, the new skin or the first-day reward arrives at the same instant; that shape belongs in capacity planning, as the Clash incident below shows.

## Flags, Kill Switches and Remote Config

The general practice of feature flags (types, lifetimes, progressive rollout, cleanup) is in [Feature Flags & Progressive Rollout](/docs/delivery/feature-flags). Games lean on two flag types more than most software.

**Kill switches** in a game disable a piece of content or a system without a build: a character pulled from the pick screen because of a game-breaking bug, a game mode taken out of the queue list, a store item hidden, a crafting recipe disabled because it's being exploited, a trade feature shut off during a duplication incident. Each one has to fail safe for players already using it (a disabled character in a match in progress plays out the match; a disabled store item already owned stays owned) and has to be listed in the runbook with exactly what flipping it does ([Kill Switches](/docs/delivery/feature-flags#kill-switches)).

**Remote config** is tuning without a deploy. Unity describes Remote Config as a service "to tune your game design without deploying new versions," built from namespaced key-value parameters with overrides that "control which players receive what settings updates, and when"; PlayFab's title data does the same for "game configuration remotely." Riot's own configuration service, above, does it for services and game servers. Whatever the product, remote config is a deploy wearing different clothes, and the discipline (schema and bounds checks, versions and audit, shipped defaults with a cached last good value) is in [Remote Config](/docs/delivery/feature-flags#remote-config). Two parts are particular to games:

- **Bounds are game rules.** A drop rate between 0 and 1, a price above zero, a cooldown no shorter than the animation: the schema for gameplay keys is written by designers and checked like code, because a typo in a tuning value can take a game down as surely as a bad build.
- **Applied at a defined moment.** Game servers read gameplay config at match start, not mid-match, so both teams play by one set of rules; Riot's post describes exactly that. A config version that services and game servers report in their telemetry makes "what was live in this match" a join.

## Experiments

An experiment is remote config with a control group: assign players to variants, give each variant different values, and compare outcomes. The statistics are general ([Experimentation & A/B Testing](/docs/telemetry/experimentation)), and the game-specific measurement (the account as the unit, crash-driven sample ratio mismatches, game guardrails, `experiment_assignments`) is in [Game Metrics](/books/gaming/game-metrics#experiments). What live ops owns is how a variant reaches the game:

- **A variant is a config overlay.** It names config keys and values, layered over the published config version for the players assigned to it, so an experiment ships, pauses and ends through the same path as any config change, with the same schema checks.
- **One owner per key.** Two experiments that override the same key at once interact; the config service refuses to start the second, which is the mechanical version of the mutually exclusive audiences managed platforms recommend.
- **Fairness is the product.** I don't run balance experiments in ranked queues: two players competing for the same rank under different rules is a fairness problem before it's a statistics problem. Test balance in unranked modes, on test servers, or with the whole population at once and a rollback plan.
- **Prices are regulated.** A test that shows different players different prices for the same item needs review against [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes) and the platform's terms before it runs.
- **The variant is part of the record.** Every telemetry event carries the experiment and variant ids the player was in, so analysis never has to reconstruct assignment after the fact ([Telemetry & Analytics](/books/gaming/telemetry#gameplay-events)).

## Version Skew

Every path above changes one layer of a system made of many: client builds, game server builds, dozens of backend services, configuration, content data, and on some platforms several client builds at once. At any moment those layers are at different versions, and live ops is mostly the management of that skew.

The TFT bug blog gives a small example with the whole problem in it. A mobile-only art bug needed a full patch to the Apple and Android builds, which changed the mobile version number but not PC's, and because TFT has cross-play, the team ran one-versus-one cross-play tests: "we have to make sure that server and game clients can still communicate." Unreal Engine builds the check into the network layer: `FNetworkVersion` generates a network version that by default is based on a checksum of the engine version, a game can override it, and `IsNetworkCompatible` decides whether a connection is accepted. Platform rules push the same direction; Xbox's public certification requirements say that "Game saves and player progress must continue to function following content updates," and titles must handle errors with Xbox and partner services gracefully.

A working design has a rule for every pair of layers:

- **Client and game server** must match exactly for a match, in most games: the matchmaker only puts players with compatible network versions in a match, and the match's server build is pinned when it's allocated ([Game Servers & Hosting](/books/gaming/game-servers); [Matchmaking & Ranked](/books/gaming/matchmaking)).
- **Client and backend services** overlap: services accept the current and previous client versions (N and N-1) during a rollout, versioned APIs make that explicit, and a minimum supported client version, enforced at login, retires older ones and triggers a forced update ([Version Compatibility and Forced Updates](/books/gaming/patching#version-compatibility-and-forced-updates) owns `client_version_policies`).
- **Services and data** change by expand and contract: add the new field or table, deploy readers, then writers, then remove the old ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations)).
- **Config and builds** are keyed together: a config value that only the new client understands targets builds that understand it, as `min_client_build_id` does for events.

Riot's 2020 post on its operations platform states the failure this prevents: "Allowing unaligned streams of changes into a distributed system will eventually lead to preventable incidents." Its answer, a versioned environment that deploys and rolls back every service of a shard as one set, is described in [Game Backend Architecture](/books/gaming/game-backend#running-it-containers-and-deployment). Live ops needs the release-side record of the same idea: one row per patch, hotfix or override naming the client builds, the server build, every service version, the config version and the content version that were tested and released together ([Deployment Strategies](/docs/delivery/deployment-strategies)). I call it a release set, to keep it apart from Patching's `release_manifests`, which describe one build's files; its table is in [How to Build It](/books/gaming/live-operations#how-to-build-it).

## Maintenance and Player Communication

Not every change can roll. A database migration that can't be done online, a region move, or a patch that changes the network protocol for everyone at once can need a maintenance window, and how it's run is visible to every player.

A planned window has a sequence:

1. **Announce it** in advance, in the client (a banner or message of the day), on the status page and on social channels, in each region's language and local time. PlayFab lists title communication (push, email, message of the day) as a live-ops feature for exactly this.
2. **Close the doors gently.** Stop ranked queues first (nobody should lose rank to a server shutting down mid-match), then all queues, then logins, and let matches in progress finish or drain before servers stop.
3. **Do the work, then verify** with internal accounts before reopening.
4. **Open in stages,** by region or by percentage, so a login stampede doesn't recreate the outage the window was meant to avoid.
5. **Close the loop:** a note on what changed, and compensation if the window ran long ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#auditing) covers campaign grants).

Unplanned problems follow the same rules faster. Riot's patch schedule page shows one form of the promise: if a patch slips within 48 hours of its date, an alert goes at the top of the page. The habit worth copying is a committed channel and a committed clock, so players know where to look and how long until the next update ([Communicate on a Clock](/docs/operations/incident-response#communicate-on-a-clock)).

## Incidents in a Live Game

The general practice (declaring, roles, mitigation, postmortems) is in [Incidents & Postmortems](/docs/operations/incident-response). Games add a property that shapes their worst incidents: load is synchronized by design. A patch day, an event start, a season reset, a tournament start time and a big streamer's broadcast each make large numbers of players do the same thing at the same instant.

Riot's 2020 postmortem of the Clash tournament launch is the public example, and its lesson is a live-ops one: the format itself caused the outage, because "all the game starts happening at the same time would overload systems like Champ Select." The fix was partly capacity (a start limit derived from live CPU, covered with the rest of the launch record in [Launch Day](/books/gaming/game-backend#launch-day)) and partly scheduling: players were split into tiers that lock in at 30-minute intervals, so game starts were staggered rather than simultaneous, with manual overrides kept as a fallback. The schedule is a capacity control, and live ops owns the schedule.

My rule: every dated thing live ops publishes (an event start, a season reset, a tournament round, a store rotation) has a declared expected peak, reviewed against measured capacity before approval, and a stagger by region or tier when the peak doesn't fit. The other public outages in Launch Day (Roblox's shared Consul dependency, Final Fantasy XIV's login cap, Pokémon GO's traffic at 50 times the target) point to the same rules for running a live game:

- **Plan for the synchronized peak,** not the average: event starts, patch days and tournament starts are scheduled, so their load is predictable ([Load & Performance Testing](/docs/quality/load-testing#capacity-planning)).
- **Admit players at a controlled rate.** A login queue with an honest position and estimate is a feature; a stampede that knocks over authentication is an outage ([Login Queues](/books/gaming/game-backend#login-queues)).
- **Keep monitoring off the critical path** of what it monitors.
- **Mitigate with the fast paths first.** The kill switch, the config change and the queue limit exist so the first response to an incident takes seconds ([Mitigate First, Diagnose Later](/docs/operations/incident-response#mitigate-first-diagnose-later)).
- **Make players whole deliberately.** Undoing ranked losses from a broken server is a `match.voided` fact that ranked reverses ([Game Results, Exactly Once per Match](/books/gaming/game-backend#game-results-exactly-once-per-match)); restoring lost items and granting compensation run as audited campaigns, not ad hoc grants ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#auditing)).

## How to Build It

Live ops runs on four kinds of record beside `live_events`: what config was published, which switches exist and what they do, which versions shipped together, and what each change did. The general shape of versioned, effective-dated rules is in [Rules as Data](/docs/architecture/rules-as-data); `tenant_id` is on every table because the model is written for a platform serving many games.

```sql
CREATE TABLE config_versions (              -- one immutable published snapshot per game
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  game_id       UUID NOT NULL REFERENCES games (id),
  version       INTEGER NOT NULL,           -- reported by every service and client in telemetry
  schema_hash   TEXT NOT NULL,              -- the schema the values were validated against
  values        JSONB NOT NULL,
  reason        TEXT NOT NULL,
  published_by  TEXT NOT NULL,
  approved_by   TEXT,                       -- required when a risky key changed
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, game_id, version)
);

CREATE TABLE kill_switches (                -- the runbook's list, as data
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  game_id       UUID NOT NULL REFERENCES games (id),
  config_key    TEXT NOT NULL,              -- 'character.disabled.<id>', 'trade.enabled'
  what_it_does  TEXT NOT NULL,              -- read by whoever flips it at 3 AM
  in_flight     TEXT NOT NULL CHECK (in_flight IN ('finish', 'end_now')),  -- matches already using it
  owner         TEXT NOT NULL,
  last_tested_at TIMESTAMPTZ,
  UNIQUE (tenant_id, game_id, config_key)
);

CREATE TABLE release_sets (                 -- what shipped together, by layer
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  game_id           UUID NOT NULL REFERENCES games (id),
  name              TEXT NOT NULL,          -- '26.21', '26.21 hotfix 1'
  server_build_id   UUID NOT NULL REFERENCES builds (id),
  client_build_ids  UUID[] NOT NULL,        -- one per platform
  config_version_id UUID NOT NULL REFERENCES config_versions (id),
  content_version   TEXT NOT NULL,
  service_versions  JSONB NOT NULL,         -- {"store": "4.12.0", "matchmaker": "7.3.1"}
  path              TEXT NOT NULL CHECK (path IN ('full_patch', 'hotfix', 'server_data', 'config')),
  merged_into_id    UUID REFERENCES release_sets (id),  -- an out-of-band fix, folded into a train
  released_at       TIMESTAMPTZ,
  UNIQUE (tenant_id, game_id, name)
);
```

The decisions behind it:

- **Config is published, never edited.** A change creates a new `config_versions` row; rollback publishes the previous values as a newer version, so "what was live at 14:02" is one query and every client's reported version means one thing.
- **Experiments and events overlay, not fork.** The config a player gets is the published version, then the live events whose windows are open for their region and build, then their experiment variants, in that order, and the resolver records which layers applied. Two layers setting the same key is a validation error at publish time, not a surprise at runtime.
- **Every out-of-band fix names its train.** A hotfix or server-data release set without `merged_into_id` once the next full patch is cut is a fix about to be undone; the release checklist queries for them.
- **Kill switches are tested.** A switch whose `last_tested_at` is older than the last full patch is flipped in a test environment as part of the release, because a switch that doesn't work is discovered during the incident it was built for.

## Auditing

- **Config and flags.** Who published which version, the reason and approver, and which services and clients picked it up; a kill switch flip records the incident it served.
- **Events and seasons.** Each version of an event, who approved it, and which version a player's reward claim was made under.
- **Releases.** The release set behind every match, crash and ticket, through the builds they already name ([The Games Business](/books/gaming/games-business#the-core-data-model)).
- **Compensation.** Every make-good is a campaign with a definition, a dry run and grants keyed by campaign and account ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#auditing)).

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Four change paths, built on purpose:** full patches, hotfixes, server-side data overrides loaded at match start, and runtime config and flags, with tunable numbers designed into the fast paths.
- **A patch schedule as data** that tools read, and a rule that out-of-band fixes are merged back into the next train.
- **Seasons, events and store rotations as effective-dated content,** versioned, with per-region windows, an explicit start rule, a minimum client build, state derived from the clock and an injectable clock for testing.
- **Kill switches as data** with a runbook line and a test date, failing safe for players mid-use, and remote config published as immutable, schema-checked, audited versions with client defaults.
- **Experiments as config overlays** with one owner per key, variant ids on every event, no balance tests in ranked and review before any price test.
- **A release set** naming the client, server, service, config and content versions shipped together, plus explicit compatibility rules between every pair of layers and a minimum client version.
- **Maintenance as a sequence** (announce, drain ranked first, verify, reopen in stages, compensate), and a committed channel and clock for player updates.
- **Capacity for synchronized peaks,** with a declared peak on every dated thing live ops publishes, staggered starts when it doesn't fit, admission control at login and match start, monitoring that doesn't share fate with what it watches, and compensation run as audited campaigns.

## References

**Reference**

- [Unity: What is Remote Config](https://docs.unity.com/ugs/en-us/manual/remote-config/manual/WhatsRemoteConfig), tuning without new versions, namespaced key-value parameters, Game Overrides, and seasonal events and kill switches as use cases
- [Microsoft Learn: PlayFab Experimentation](https://learn.microsoft.com/en-us/gaming/playfab/features/analytics/experiments/), concurrent experiments, segment percentages, scorecards, Sample Ratio Mismatch and mutually exclusive audiences
- [Microsoft Learn: What is PlayFab](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), title data for remote configuration and title communication as live-ops features
- [Unreal Engine: FNetworkVersion](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FNetworkVersion), network versions from an engine checksum, overrides and the compatibility check
- [Xbox: Xbox requirements](https://devdocs.xbox.com/publishing/certification/xbox-requirements.md), saves and progress surviving content updates, and graceful handling of service errors
- [Heroic Labs: Nakama](https://github.com/heroiclabs/nakama), seasonal leaderboards and tournaments in an open-source backend

**In practice**

- [Riot Games: Patch schedule, League of Legends](https://support.riotgames.com/league-of-legends/gameplay/patch-schedule-league-of-legends), the 2026 schedule of 24 patches, the numbering format, Wednesday releases and the 48-hour delay alert
- [Riot Games: Bug Blog, TFT Bugs and Patches](https://www.riotgames.com/en/news/bug-blog-tft-bugs-and-patches), full patches at least every two weeks, micropatches as server-side overrides, the one-hour fix and cross-play version testing
- [Riot Games: Supercharging Data Delivery, the New League Patcher](https://www.riotgames.com/en/news/supercharging-data-delivery-new-league-patcher), deploying a new version in under a minute instead of five hours, and what that means for hotfixes
- [Riot Games: Legends of Runeterra CI/CD Pipeline](https://www.riotgames.com/en/news/legends-runeterra-cicd-pipeline), releases every few weeks with hotfixes as needed
- [Riot Games: Running Online Services at Riot, Part IV](https://www.riotgames.com/en/news/running-online-services-riot-part-iv), runtime configuration and game data pushed to servers without a redeploy
- [Riot Games: Running Online Services at Riot, Part VI](https://www.riotgames.com/en/news/running-online-services-riot-part-vi), deploying a product rather than a service through a versioned environment specification
- [Riot Games: Deep Dive into the Clash Crash](https://www.riotgames.com/en/news/deep-dive-clash-crash), synchronized game starts, the CPU targets, start limits, the ARAM and TFT mis-estimate and the staggered fix
- [Roblox: Return to Service](https://about.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021), the October 2021 outage, its causes and the staged return of players
- [Square Enix: Ongoing congestion situation and compensation](https://na.finalfantasyxiv.com/lodestone/news/detail/1c59de837cc84285ad1cdb4c9a9cad782363f25b), the login cap, the 17,000-player queue limit and compensation
- [Google Cloud: Bringing Pokémon GO to life on Google Cloud](https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud), launch traffic at 50 times the target
