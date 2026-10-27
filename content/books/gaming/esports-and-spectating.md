+++
title = "Esports & Spectating"
description = "Spectator and observer modes, delayed feeds and fog of war, replays and rewinds, remote production, official data feeds, tournament rules and integrity."
category = "Gaming Industry"
order = 1630
part = "Running the Platform"
tags = ["gaming", "esports", "spectating", "replays", "broadcast", "integrity"]
+++

Esports is the same game played under conditions where every flaw is public. A lag spike that a ranked player shrugs off decides a world championship in front of millions of viewers; a bug that ends a match is a scandal; a spectator feed that leaks enemy positions is a cheating tool; a data feed that arrives seconds before the broadcast is worth money to a bettor. Building for competition means a server setup that removes the network from the outcome, a spectating system that shows everything without helping anyone, recordings that can restore a match exactly, production and data pipelines that carry the game to an audience, and rules and records that let an organizer prove the result was fair. This chapter covers each, with publishers' and engine makers' public documentation (Riot, Valve, Epic) and the Esports Integrity Commission's code as the evidence and the mechanisms as the subject. It builds on the rest of the volume rather than repeating it: the replication a spectator stream reuses is in [Netcode Fundamentals](/books/gaming/netcode), the determinism a rewind depends on in [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback), fleets and regions in [Game Servers & Hosting](/books/gaming/game-servers), and cheating in [Anti-Cheat](/books/gaming/anti-cheat).

## What Competition Changes

A tournament match uses the game's ordinary client and server, with different priorities:

| Concern | Online play | Tournament play |
| --- | --- | --- |
| Network | Players' own connections, best effort | Controlled: the network must not decide the match |
| Watching | Friends spectate, delayed | Observers, casters and production watch live; the public watches delayed |
| Failure | Remake or a lost match | Pause, restore to a precise moment, continue |
| Data | Telemetry for the studio | An official feed for broadcasters, teams, media and licensed partners |
| Rules | Terms of service | A rulebook, licenses, rulings and an integrity program |

The rest of the chapter takes those rows in order.

## Tournament Servers

Publishers that run or license top-level events remove the network the same way: they bring the match onto a local network and lock the machines down. Riot's account of its world championship technology ("Engineering Esports," October 2019) names latency and packet loss as "the biggest concerns" for a fair competition, and its game servers travel with the event: portable servers that "can function completely independently of the internet," on bare metal, with chip-level power saving and hyper-threading disabled, on a protected network tier reachable by a small group of users. Valve writes the same choice into its requirements for operators of the Counter-Strike Major: the event is played "in a LAN setting"; competition PCs get no internet access beyond what is minimally required to log in to Steam and run the game, and are locked down (supervised SSDs, application allow-lists, disk and Windows auditing "so if a player is called into question there are records"); servers run the matchmaking (Premier) defaults with a published list of exceptions, run no mods without Valve's written approval, log in detail and record demos that go to Valve after the event.

The general rules, for any competitive game:

- **Put the server where the players are.** A server on the venue's local network gives every player the same, near-zero latency. For online qualifiers, pick the region by measured latency to every participant ([Game Servers & Hosting](/books/gaming/game-servers)) and publish how it was chosen.
- **Make the server boring.** Fixed CPU frequency, no power saving, pinned processes, nothing else on the host. Tournament servers trade density for predictability, which is the opposite of the online fleet's economics.
- **Tournament mode is a server feature.** Pauses that freeze the simulation for everyone, a lobby where officials assign sides, settings locked by the operator, and every administrative command logged with who ran it and when. The Major's server configuration shows the shape: votes to pause the match or load a backup can be called only from the server's spectator seats, which on a tournament server belong to admins and observers, never to players.

## Spectating: Who Sees What, When

A spectator is a client that receives the match and sends nothing that changes it. Three audiences watch a competitive match, and they need different feeds:

- **Observers** are the production staff who drive the cameras the broadcast shows. They need the match live, and they are few and named. Riot's esports spectators "connect directly to the game server" for "near-zero delay," with up to 20 observers in a match; the CS Major configuration caps a server's spectators at 10 and names, by Steam ID, the one observer allowed to act as camera man for the broadcast stream.
- **The broadcast audience** sees the observers' output after production, encoding and the streaming platform add their latency.
- **In-client spectators** (friends, fans, other players) watch through the game itself, delayed. Riot's support page for Wild Rift says friend games stream to spectators "with a 3-minute delay," while in custom matches the delay doesn't apply and "the feed is live," with up to three spectators. Valve's Source engine broadcast (SourceTV, GOTV and now CSTV in Counter-Strike) is delayed by a server setting, `tv_delay`, which defaults to 30 seconds in the published Source SDK; the Major leaves its value to the operator.

![A timeline of one in-game event reaching four feeds: the match server at t = 0, the observer client at near zero, the broadcast after an illustrative 30 seconds and the public in-client spectate feed after 180 seconds, with a detail showing the player's fogged view next to the spectator feed that shows both teams, and a variable table stating the rule that the public delay must exceed the time a sighting stays useful.](/diagrams/gm-esports-feed-delay.svg "A spectator feed shows what no player can see, so the public feed is delayed past the time that information would help an opponent; officials watch live because they're trusted, not because the feed is safe.")

The reason for the delay is in detail A. A player sees the map through **fog of war**: only what their team can see. A spectator feed usually shows both teams, because that is what makes a match watchable. Live, that feed is a wallhack for anyone who can relay it to a player ("ghosting"). The defense is time: delay the public feed until what it shows is stale (G1 on the sheet, a game-specific number), then add a margin. Two corollaries:

- **The delay lives on the server side.** A client-side delay ("render the stream three minutes behind") can be removed by a modified client, because the client already has the data. Buffer the spectator stream on the server or relay, and release frames only after the delay, which is how the Source SDK's broadcast director works: the broadcast time is the current time minus the delay, computed on the server.
- **Live feeds go to accounts, not links.** Custom-match live spectating is safe when the lobby's owner chose who watches; an esports observer slot is safe when it's issued to production staff on the venue network. A live feed with a shareable URL is a leak.

## How to Build Spectating

A spectating system is a replication fan-out with a delay buffer. The design that scales:

1. **The game server emits a spectator stream:** the full replicated state (both teams, no relevance filtering) as periodic keyframes plus deltas between them, each stamped with the server's frame number. It is the same state the server already replicates to players ([Netcode Fundamentals](/books/gaming/netcode)), without per-player interest management. Unreal's replay system is built this way: its `DemoNetDriver` reads the engine's own replication data and writes "checkpoints that act as snapshots of the net changes to the world," with the space between them "filled with incremental changes to individual objects."
2. **A relay tier buffers and fans out.** The game server sends one stream to a relay; relays hold a rolling window of keyframes and deltas, apply the delay, and serve thousands of spectators. The game server's cost doesn't grow with the audience, and its address is never given to spectators (the same reason relays protect players, in [Game Servers & Hosting](/books/gaming/game-servers)). Unreal's HTTP streamer sends replay data to another server for games that "may need to be streamed live to a large number of viewers."
3. **Spectators join at a keyframe.** A spectator who arrives mid-match fetches the most recent released keyframe and the deltas after it. Keyframe frequency trades join and seek time against stream size; Unreal's default is a checkpoint every 30 seconds, and its documentation states the tradeoff: longer intervals make scrubbing backward slower but replays smaller.
4. **The spectator client is a different mode.** It has free cameras, both teams' information, and timeline controls, which means its clock moves backward. Riot found that "the spectator mode of the client is the only one in which the game rewinds," which forced changes to "low-level streaming/buffering code" when League's clocks were unified; in Unreal, seeking backward starts from a checkpoint, which is why the checkpoint interval sets how fast it is. Design the spectator client's clock to move backward from the start.
5. **Tools for observers are APIs.** League's Replay API, off by default and enabled in the client's configuration, lets tools "adjust the in-game camera during replays" and control playback, rendering, recording and keyframed camera sequences, and its Live Client Data API serves the running game's data locally on port 2999. Counter-Strike's equivalent is a caster mode: an observer client launched for it, and named on the server, drives a camera and caster voice that viewers of the in-game broadcast can switch to. Overlays, stat graphics and camera automation are built on interfaces like these, local to the observer machine, rather than by reading the screen.

The data model records each stream and who could see it live:

```sql
-- One row per spectator stream of a match. tenant_id: one platform serves many games or organizers.
CREATE TABLE spectator_streams (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  match_id             UUID NOT NULL REFERENCES matches (id),
  audience             TEXT NOT NULL,         -- observer, lobby, public
  delay_seconds        INTEGER NOT NULL,      -- D1 on the sheet; 0 only for trusted audiences
  is_fog_applied       BOOLEAN NOT NULL,      -- true: one team's view only
  started_at           TIMESTAMPTZ NOT NULL,
  ended_at             TIMESTAMPTZ,
  CHECK (audience <> 'public' OR delay_seconds > 0 OR is_fog_applied)
);

CREATE TABLE spectator_grants (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  spectator_stream_id  UUID NOT NULL REFERENCES spectator_streams (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  granted_by           UUID NOT NULL,         -- the official or lobby owner
  granted_at           TIMESTAMPTZ NOT NULL,
  revoked_at           TIMESTAMPTZ
);
```

The `CHECK` constraint is the rule from the drawing written where it can't be forgotten: a public stream is either delayed or fogged.

## Replays, Rewinds and Recovery

A replay can be stored three ways. **A video** is simple and works on any device, but it's large and the viewer can't move the camera. **A recording of inputs** replayed through the game's own simulation is small and fully explorable, and it depends on the simulation being deterministic and the same build being available ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)).

**A recording of replicated state** sits between them: the snapshot-and-delta stream from the spectating design above, which is what Unreal's replay system writes. It needs no determinism and can still be explored with free cameras, at the cost of size.

League of Legends is the public example of input recording at esports scale. Its esports games are recorded as Server Network Recordings, "a complete record of the inputs, match settings, and configurations used to play the game," and because the server was made deterministic ([Determinism on the Server](/books/gaming/determinism-and-rollback#determinism-on-the-server-league-of-legends)), a recording can restore an exact earlier state. That powers Project Chronobreak, which lets officials "rewind" a live game to a chosen moment instead of remaking it; committing a restore disconnects the players and broadcast spectators, who reconnect to the restored server. A game without a deterministic server gets a coarser version of the same tool from saved state: the CS Major's configuration lets officials load a saved backup, through a vote only spectator seats can call.

What that implies for a build:

- **Record every competitive match on the server,** inputs and configuration where the simulation is deterministic and replicated state where it isn't, with the build ID and content version, whether or not you plan rewinds. It is the evidence for every ruling, which is why Valve makes server demos a deliverable of every Major.
- **A rewind is a ruling.** The official chooses the moment, the server restores it, and both are logged with the reason, like any other match intervention.
- **Recordings are tied to a build.** Wild Rift's support page says players "can only watch replays of games played with the current version," and a hotfix makes earlier replays unwatchable. Either keep old builds runnable for the recordings you promise to keep (esports archives, disputed matches), or convert those matches to video before the build retires.

```sql
CREATE TABLE match_recordings (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  match_id             UUID NOT NULL REFERENCES matches (id),
  build_id             UUID NOT NULL REFERENCES builds (id),   -- must be runnable to replay
  kind                 TEXT NOT NULL CHECK (kind IN ('inputs', 'state', 'video')),
  storage_ref          TEXT NOT NULL,
  content_sha256       TEXT NOT NULL,
  is_retained_for_ruling BOOLEAN NOT NULL DEFAULT false,
  expires_on           DATE,                   -- null while a ruling or archive needs it
  created_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE match_interventions (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  match_id             UUID NOT NULL REFERENCES matches (id),
  kind                 TEXT NOT NULL,          -- pause, resume, restore, remake, side_swap
  game_time_ms         BIGINT,                 -- the restore point, for kind = restore
  reason               TEXT NOT NULL,
  decided_by           UUID NOT NULL,          -- the official
  executed_at          TIMESTAMPTZ NOT NULL
);
```

`inputs` needs a deterministic simulation and its build; `state` is the snapshot stream a non-deterministic server sends a spectator, larger but replayable after a patch; `video` survives everything and can't be explored. The replay columns an input recording needs (seed, keyframes, checksums, verification) are added in [Replays and Spectating](/books/gaming/determinism-and-rollback#replays-and-spectating). My rule: a match has one recordings table, whoever reads it (support, moderation, telemetry, esports), and its retention is set per kind and purpose ([Data Retention](/docs/architecture/data-retention)).

## Broadcast and Remote Production

An esports broadcast is a television production whose cameras include game observers. Riot's 2019 post describes the remote model: cameras, observer feeds, caster audio and crowd microphones are encoded on site and sent to a remote production center as "a mixture of H.264 and JPEG2000 streams" chosen by round-trip time and importance, with forward error correction on primary feeds, and a second-generation transmission kit "uses a tenth of the bandwidth" of the first. Processing adds delay of its own: Riot offsets the delay that augmented reality rendering adds so that cameras can still be cut live with audio in sync.

For a game team the boundary is the observer feed. The game provides clean observer clients, camera tools, an overlay-friendly data API and a stable frame rate on observer machines; production handles everything after the picture leaves the observer PC. Keep the observer build and its tools versioned with the tournament build, and test them on the tournament patch before the event, not on the live patch; Valve's Major rulebook includes a step-by-step pre-event test that the in-game broadcast and the caster's camera and voice work on a vanilla server. The publisher also owns what production may draw over the game: the same rulebook bars modified game art and sound on observer clients and allows augmented reality only for "useful information" (player statistics, say), never designed to pass as part of the game world.

## Official Data Feeds

Broadcast graphics, team analytics, media, fantasy and betting all want the match as data. The official route is a feed from the game server, not data scraped from video, and publishers differ on who may carry it. Riot's model, as of October 2026, is an exclusive licensed distributor:

- **One official distributor.** Riot and GRID announced on November 30, 2023 that "the GRID Data Platform will be the only distributor of real-time official esports data" for League of Legends Esports and the VALORANT Champions Tour, from the start of the 2024-25 season.
- **Three data products.** Riot's VALORANT esports data page lists live data (in-game information such as player health, position and status, "available and accessible in near-real time"), fixtures ("an up-to-date central registry of esports players, teams, match times") and audio/visual feeds, whose receivers "are able to access undelayed professional game footage from select regions."
- **Licensed access.** "Live stats data, fixture data, and audio visual data are only available for commercial purposes through GRID," with broader non-commercial access described as a goal.

Counter-Strike's server is the opposite end: it streams its own match log over HTTP to a URL the operator sets (`logaddress_add_http`), at a configurable level of detail. At a Major that URL is Valve's, which is how results reach every player's client; elsewhere it is whatever address the operator configures. An exclusive distributor controls latency, pricing and who can see undelayed data; open server logs make data cheap and leave integrity to each operator. Either way the stream starts at the same place.

The design rules, whoever distributes:

- **Emit from the authoritative server,** as events with the match ID, server frame number and a sequence number, through the same outbox discipline as any event stream ([Events](/docs/architecture/events)). Consumers detect gaps by sequence and request replays.
- **Corrections are new events.** A kill credited to the wrong player is fixed by a correction that references the original, never by editing history, because a bet may have settled on the first value.
- **Latency is a product tier and an integrity control.** Undelayed live data is valuable precisely because it beats the public broadcast. Issue it under contract to named recipients, watermark or tag each recipient's stream so a leak can be traced, and give everyone else a feed delayed at least as much as the public spectator feed.
- **Fixtures are master data.** Teams, rosters, players and schedules are a registry with history, so a data consumer can tell who was on a roster on a given date.

## Tournament Operations

A publisher decides who may run tournaments for its game and on what terms. Valve publishes its Counter-Strike 2 requirements on GitHub, and they show what a rules system must record. As of October 2026:

- **Licensing.** Many events run under a Limited Game Tournament License; an operator that wants to "operate at a scale that exceeds the limited license" must contact Valve.
- **Ranked and unranked events.** Ranked events feed the Valve Regional Standings (VRS) and must invite teams from the standings in order: a Tier 1 event needs at least 20 direct VRS invites starting from the top-ranked roster, with at least 8 rosters on the main stage. A roster may accept only if at least three of its players were on it on the invite date.
- **Money.** Unranked events are capped at $100,000 of compensation per event and $250,000 a year across an operator's unranked events. Prizes can't pay a lower placement more than a higher one, and teams in the same stage get equal treatment in accommodation, practice facilities and technical support.
- **Publication.** Prize pools, all other compensation and disqualification rules are published, on a platform that preserves edit history or is independently archived, with announcement deadlines (for Tier 1 events after 2026, at least 22 months before the main event).
- **Conflicts of interest.** Operators and their staff may not have business relationships with participants (shared ownership, management, licensing, loans) unless Valve approves and the relationship is publicly disclosed.

Every one of those rules is checkable from data, which is the design point: an operator platform that stores rosters with membership history ([Temporal Data](/docs/database/temporal-data)), invites with the standings version they were issued from, prize tables, published rule versions with their archive links, and disclosed relationships can produce a compliance report on demand. Rules change between seasons, so keep them as versioned data with effective dates ([Rules as Data](/docs/architecture/rules-as-data)), and record which version governed each event.

```sql
CREATE TABLE tournaments (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,          -- the publisher or operator platform
  game_id              UUID NOT NULL REFERENCES games (id),
  operator_ref         TEXT NOT NULL,
  license_kind         TEXT NOT NULL,          -- per the publisher's license types
  is_ranked            BOOLEAN NOT NULL,
  ruleset_version      TEXT NOT NULL,          -- the publisher rules that governed it
  rules_published_url  TEXT,                   -- archived, edit-history preserving
  build_id             UUID REFERENCES builds (id),   -- the tournament patch
  valid_during         TSTZRANGE NOT NULL
);

CREATE TABLE rosters (                         -- a team's lineup in one game
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  game_id              UUID NOT NULL REFERENCES games (id),
  team_name            TEXT NOT NULL,
  organization_ref     TEXT NOT NULL           -- the owning organization, for conflict checks
);

CREATE TABLE roster_memberships (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  roster_id            UUID NOT NULL REFERENCES rosters (id),
  player_profile_id    UUID REFERENCES player_profiles (id),  -- null for staff without one
  person_ref           TEXT NOT NULL,          -- the competitor or staff member, by contract
  role                 TEXT NOT NULL CHECK (role IN ('player', 'substitute', 'coach', 'staff')),
  valid_during         TSTZRANGE NOT NULL      -- answers "who was on it on the invite date"
);

ALTER TABLE matches
  ADD COLUMN tournament_id UUID REFERENCES tournaments (id);  -- null: ordinary online play
```

A tournament match is an ordinary `matches` row with a tournament, so recordings, interventions, telemetry and the data feed all hang off the same key as online play.

## Integrity

Competitive integrity has two halves: the game must be fair (no cheating, which [Anti-Cheat](/books/gaming/anti-cheat) covers, with tournament clients and machines under tighter control than online play), and the competitors must be trying to win.

Two published programs describe the second half, one run by a publisher and one by an independent body. The Esports Integrity Commission's Anti-Corruption Code binds players, support personnel (coaches, managers, owners, officials) and teams in matches of games and events its members run; its offences include betting on a match in the game a participant is involved in, fixing or "influencing improperly" any aspect of a match (deliberate underperformance included), using or disclosing inside information for betting, and failing to report a corrupt approach to ESIC "without unnecessary delay." ESIC may impose a provisional suspension once it charges a participant, and can demand phone records and stored data from devices. Riot's anti-match-fixing program has the same shape inside one publisher: its Esports Global Code of Conduct must be explicitly accepted by teams, referees and key operational staff, treats match-fixing, gambling and failure to report as among the most serious breaches, and relies on Sportradar's bet monitoring, which as of October 2026 "monitors over 8,000 matches per year" across Riot's sanctioned competitions; investigations can last several months, provisional suspensions may be imposed during them, and final rulings are typically published.

The parts a platform builds:

- **Undelayed information is controlled.** Live observer feeds, undelayed data and venue networks are restricted to named people, and access is logged ([Audit Trails](/docs/architecture/audit-trails)). Knowing something before the market does is the raw material of betting corruption, which is why ESIC's code makes misusing or passing on inside information an offence of its own.
- **Signals from the game.** Outcome-relevant actions that are statistically unusual for a player (economy decisions, deliberate deaths, a collapse in performance in one match) are flagged for investigators, the same way behavior systems flag intentional feeding in online play ([Player Behavior & Moderation](/books/gaming/player-behavior)). Flags start an investigation; they never decide one.
- **Rulings are records.** Each ruling names the rule broken, the evidence (recordings, logs, external reports), the sanction, provisional or final status and the publication link. A competitive ruling can fall on a coach, an organization or a team, which the core `penalties` table (sanctions on an account) can't hold, so rulings get their own table and link to a penalty only when a player's account is also restricted.
- **Disclosures are data.** Ownership, sponsorship and financial ties between operators, teams and staff are recorded with dates, because rules like Valve's make them conditions of running an event.

```sql
CREATE TABLE competitive_rulings (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  tournament_id        UUID REFERENCES tournaments (id),  -- null: a league- or code-wide ruling
  subject_kind         TEXT NOT NULL CHECK (subject_kind IN ('person', 'roster', 'organization')),
  subject_ref          TEXT NOT NULL,
  rule_ref             TEXT NOT NULL,          -- rule and ruleset version broken
  sanction             TEXT NOT NULL,          -- fine, forfeit, suspension, ban, ...
  status               TEXT NOT NULL CHECK (status IN ('provisional', 'final', 'overturned')),
  valid_during         TSTZRANGE,              -- provisional: open-ended until the final ruling
  penalty_id           UUID REFERENCES penalties (id),  -- when an account is also restricted
  evidence_refs        TEXT[] NOT NULL,        -- recordings, logs, external reports
  published_url        TEXT,
  decided_by           UUID NOT NULL,
  decided_at           TIMESTAMPTZ NOT NULL
);
```

A provisional suspension is a row with an open-ended range; the final ruling closes the range or marks the row overturned, and the history stays ([Audit Trails](/docs/architecture/audit-trails)).

## Auditing

Competitive integrity is decided on records, and the records are asked for by officials, teams, publishers, betting integrity units and sometimes courts:

- **Every intervention** (pause, restore, remake) is a `match_interventions` row with the official, the reason and the restore point, so a disputed restore can be replayed against the recording.
- **Every ruling** is a `competitive_rulings` row with the rule and ruleset version, the evidence references and the status history; a provisional ruling is closed or overturned, never edited ([Audit Trails](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Recordings that support a ruling** are flagged `is_retained_for_ruling`, hashed at capture (`content_sha256`), and exempt from expiry until the ruling is final, with the build kept runnable or the match converted to video.
- **Who saw what, when.** `spectator_grants` and the `delay_seconds` and fog setting of the stream each grant was for show whether an observer or a broadcast feed could have seen information a team couldn't, which is the first question in a ghosting dispute.
- **Data feeds** carry the match, server frame and sequence number of each event, with corrections as new events, so a betting partner's dispute about a result is answered from the same record the officials used ([Official Data Feeds](#official-data-feeds)).

## What This Means for the System You Build

- **Tournament servers trade density for predictability:** local to the players, fixed performance settings, a protected network, and every administrative command logged.
- **Spectating is a fan-out with a server-side delay buffer:** full-state keyframes and deltas, relays that hide the game server, join at a keyframe, and a spectator client whose clock can rewind.
- **Public feeds are delayed or fogged,** enforced in the data model; live feeds are granted to accounts, never shared by link.
- **One recordings table per match, by kind (inputs, state, video);** record every competitive match on the server with its settings and build; a rewind or pause is a logged ruling, and recordings either keep their build runnable or become video before it retires.
- **Observer tools are APIs** versioned with the tournament build, not screen scraping.
- **The official data feed comes from the authoritative server,** sequenced, corrected by new events, tiered by latency and issued to named recipients.
- **Tournament rules are versioned data:** rosters with membership history, invites with their standings version, prize tables and published, archived rules.
- **Integrity is access control plus evidence:** undelayed information restricted and logged, statistical flags for investigators, rulings (on people, rosters or organizations, provisional then final) and disclosures as records.

## References

**Reference**

- [Valve: CS2 Tournament Operation Requirements](https://github.com/ValveSoftware/counter-strike_rules_and_regs/blob/main/tournament-operation-requirements.md), license types, ranked and unranked events, VRS invites, compensation caps, equal treatment, publication with edit history, conflicts of interest
- [Valve: The CS Major Supplemental Rulebook](https://github.com/ValveSoftware/counter-strike_rules_and_regs/blob/main/major-supplemental-rulebook.md), LAN play, network and PC lockdown with auditing, Premier-default server settings and approved mods, server demos and conflict-of-interest disclosures as deliverables, spectator-only pause and backup votes, the spectator cap and named camera man, the pre-event broadcast test, limits on augmented reality, match logs sent over HTTP
- [Valve: Source SDK 2013, hltvdirector.cpp](https://github.com/ValveSoftware/source-sdk-2013/blob/master/src/game/server/hltvdirector.cpp), the server-side `tv_delay` broadcast delay, 30 seconds by default, with broadcast time computed as current time minus the delay
- [Unreal Engine: DemoNetDriver and Streamers](https://dev.epicgames.com/documentation/en-us/unreal-engine/demonetdriver-and-streamers-in-unreal-engine), replays recorded from replicated data as checkpoints plus incremental changes, the 30-second default checkpoint interval and its scrubbing and size tradeoff, the HTTP streamer for live audiences
- [Esports Integrity Commission: Anti-Corruption Code](https://esic.gg/codes/anti-corruption-code/), who it binds, betting, match-fixing, inside information and failure-to-report offences, provisional suspension and demands for records
- [Riot Developer Portal: League of Legends](https://developer.riotgames.com/docs/lol), the Replay API (camera, playback, render, recording, sequences, off by default) and the Live Client Data API on port 2999, with the game integrity policy
- [Riot Games Support: Wild Rift Spectate & Replay](https://support.riotgames.com/en-us/wild-rift/gameplay/spectate-replay), the 3-minute spectator delay for friend games, live custom matches with up to three spectators, replays limited to the current version

**In practice**

- [Riot Games: Engineering Esports, The Tech That Powers Worlds](https://www.riotgames.com/en/news/engineering-esports-tech-powers-worlds), offline portable servers on bare metal, spectators connected directly to the game server, venue networks, remote production with H.264 and JPEG2000 (October 2019)
- [Riot Games: Determinism in League of Legends, Introduction](https://www.riotgames.com/en/news/determinism-league-legends-introduction), Server Network Recordings, Chronobreak and disconnection on commit (June 2017)
- [Riot Games: Determinism in League of Legends, Unified Clock](https://www.riotgames.com/en/news/determinism-league-legends-unified-clock), spectator mode as the only client mode that rewinds and the streaming changes it required (October 2017)
- [Riot Games: Bug Blog, Esports Trade Issue](https://www.riotgames.com/en/news/bug-blog-esports-trade-issue), up to 20 observers in esports matches (August 2022)
- [Riot Games: Anti-Match-Fixing](https://competitiveops.riotgames.com/anti-match-fixing), the Global Code of Conduct, Sportradar monitoring of over 8,000 matches a year, provisional suspensions, published rulings
- [GRID: Riot Games and GRID announce exclusive global esports data partnership](https://grid.gg/riot-games-and-grid-announce-exclusive-global-esports-data-partnership/), GRID as the only distributor of real-time official data for LoL Esports and VCT (November 2023)
- [Riot Esports Data: VALORANT](https://riotesportsdata.com/valorant), live data, fixtures and undelayed audio/visual feeds, commercial access through GRID
