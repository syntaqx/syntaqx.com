+++
title = "Game Servers & Hosting"
description = "Dedicated server processes, frame budgets per tick rate, fleets and allocation, Agones and GameLift, placement, the network path, DDoS and persistent worlds."
category = "Gaming Industry"
order = 1609
part = "Multiplayer"
tags = ["gaming", "game-servers", "hosting", "agones", "gamelift", "multiplayer"]
+++

A dedicated game server is an odd thing to operate. It is a stateful process holding an entire match in memory, it lives for minutes, players connect to it directly by IP and port, it must finish every frame on time or the game visibly degrades, and you need thousands of them at peak and far fewer at 5 a.m. Google's announcement of Agones in 2018 summed up the difference from ordinary services: "Dedicated game servers are stateful applications that retain the full game simulation in memory. But unlike other stateful applications, such as databases, they have a short lifetime," running "for a few minutes or hours," and they "need a direct connection to a running game server process' hosting IP and port, rather than relying on load balancers."

This chapter covers that process and the platform around it: what one server process is and how its life is managed, how much CPU a frame gets (with VALORANT's published numbers as the worked example), how fleets are allocated and scaled, which hosting products exist and which have gone away, how servers are placed near players, the network between player and server, DDoS, and load testing. It ends with persistent worlds, where a server holds a place instead of a match: shards and single-shard designs, zoning and server meshing, load handling such as EVE's Time Dilation, what is saved when, and maintenance windows. What the server computes each tick (prediction, lag compensation, relevancy) is in [Netcode Fundamentals](/books/gaming/netcode); how players are grouped before they get a server is in [Matchmaking & Ranked](/books/gaming/matchmaking); the services around matches (accounts, stores, parties) are in [Game Backend Architecture](/books/gaming/game-backend).

## One Process per Match

The standard shape for session-based games is one game server process per match. The orchestrators are built around it: an Agones GameServer is one process with its own lifecycle that ends when the game server calls `Shutdown()`, and Edgegap calls its deployments match-bound. Riot's VALORANT load-testing post states the same shape from the studio side: "we need to run thousands of these game server executables, one for each running match," while a separate platform of microservices handles parties, matchmaking, the store and the rest. The split is typical: an engine-built simulation process (VALORANT's is Unreal Engine, per Riot's posts) managed by ordinary backend services ([Game Backend Architecture](/books/gaming/game-backend) covers the platform side).

One process per match has real advantages. A crash takes down one match, not a shard (Edgegap's docs make this the selling point of match-bound deployments: "only affecting a single match"). Memory is freed when the process exits, so leaks have a natural bound. Each match can run a different build, which is how you roll out server updates without kicking anyone. The cost is startup time and per-process overhead, which is why Agones lists two patterns that soften it: "high density" (several sessions in one process) and reusing a server for the next match instead of starting a new one.

### The Server Lifecycle

Every orchestrator models the same lifecycle. Agones names it most explicitly, through its SDK, which the game server calls:

| State | Meaning | Who moves it there |
| --- | --- | --- |
| Scheduled, starting | Container or process launched, loading the map and assets | The orchestrator |
| Ready | "Can accept players"; in the pool, available for allocation | The game server, calling `Ready()` |
| Reserved | Held out of the pool for a time (for a match being formed); safe from scale-down | The game server, `Reserve(seconds)` |
| Allocated | Assigned to a match; must not be deleted | The allocator (or the server, `Allocate()`) |
| Shutdown | Match over; the process exits | The game server, `Shutdown()` |
| Unhealthy | Missed health pings | The orchestrator, from missed `Health()` calls |

The server also sends `Health()` heartbeats; Agones' defaults are a 5-second initial delay, a 5-second period and a failure threshold of 3. Two rules from Agones are worth copying whatever you run on. First, scale-down and updates never touch an Allocated server: "Allocated GameServers are not deleted until they are specifically shutdown through the game servers SDK." Second, a server that should drain is told, not killed: Agones can add labels to Allocated servers during an update so the game finishes its match and shuts itself down.

In the volume's core model, a `game_servers` row is one allocated server process, and a match names the server it ran on ([The Games Business](/books/gaming/games-business#the-core-data-model)). My default is a fresh process per match, so one row is one process is one match; a game that reuses processes keeps the row per process and moves the allocation key below into a table of allocations. Hosting adds fleets and the lifecycle:

```sql
CREATE TABLE fleets (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,              -- the studio, when one platform hosts many games
  game_id UUID NOT NULL REFERENCES games (id),
  build_id UUID NOT NULL REFERENCES builds (id),
  provider TEXT NOT NULL,               -- 'agones', 'gamelift', 'edgegap', 'bare_metal'
  location TEXT NOT NULL,               -- region, local zone or data center
  min_ready_count INTEGER NOT NULL,     -- the warm buffer
  max_server_count INTEGER NOT NULL,
  is_accepting_allocations BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE while draining an old build
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE game_servers
  ADD COLUMN fleet_id UUID REFERENCES fleets (id),
  ADD COLUMN host_name TEXT,
  ADD COLUMN address INET,
  ADD COLUMN port INTEGER,
  ADD COLUMN allocation_key TEXT UNIQUE,   -- the match id the allocation was for, so a retry gets the same server
  ADD COLUMN ready_at TIMESTAMPTZ,
  ADD COLUMN exit_reason TEXT;             -- 'match_complete', 'crash', 'unhealthy', 'drained'
```

The core table's `status` (ready, allocated, draining, shut_down) and its `allocated_at` and `shut_down_at` already cover the states that matter to the record; starting, reserved and unhealthy are the orchestrator's business. The orchestrator is the source of truth for live state; this table is the record of what happened, written from its events, which is what support needs when a player asks why their match ended ([Player Support](/books/gaming/player-support)) and what reliability reporting is built from.

## The Frame Budget at 128 Ticks

A game server's capacity isn't measured in requests per second. It's measured in games per core at a given tick rate, and the number falls straight out of the frame budget. Valve's Source networking documentation states the general cost: a higher tick rate "requires more CPU power," and a Source server at tick rate 100 "generates about 1.5x more CPU load than a default tickrate 66." Riot's August 2020 post on VALORANT's 128-tick servers is the most detailed public walkthrough of the arithmetic, so its numbers are the worked example here.

At 128 ticks a second, the server must "process an entire frame within 7.8125ms." Riot reserved about 10% of that for the operating system, scheduling and other host software, and decided that one game per core was too expensive: the target was to beat 3 games per core. Three frames and the reserve in 7.8125 ms leaves "a target budget of just 2.34ms per frame." With hosts that typically have 36 cores, three games per core means 108 games, or 1,080 players, per server.

![Dimensional drawing of one CPU core's 128-tick frame at 80 px per millisecond. F1 = 1000 / 128 = 7.8125 ms spans the drawing. It divides into three game slots of G1 = 2.34 ms each, the first highlighted, and a hatched host reserve O1 = 0.78 ms (10%); the table closes the sum, 3 x 2.34375 + 0.78125 = 7.8125. Detail A enlarges game 1's slot to 120 px per millisecond: the measured frame M1 is under 2.00 ms, leaving headroom H1 above 0.34. A third view at 11 px per millisecond compares the 7.8125 ms budget, Riot's 2023 estimate of 5.2 ms for a 22-client game, and the 50 ms frame the optimization work started from, 6.4 times the budget.](/diagrams/gm-game-servers-frame-budget.svg "VALORANT's 128-tick budget from Riot's published figures: three games and a host reserve share every 7.8125 ms frame on one core, so each game gets 2.34 ms. The work took a 50 ms frame to under 2.")

Riot reports starting from a 50 ms frame and ending under 2 ms. The techniques generalize to any engine-built server:

- **Push changes instead of polling for them.** Unreal replicates a property only "on the condition that it has changed," which means something checks every replicated property for changes; Riot calls polling systems "a performance anti-pattern" and reports that moving state changes to explicit RPCs (a `ShotHit` event carrying damage instead of a replicated health value checked every frame) gave "a 100x to 10000x performance improvement" in many cases.
- **Do less, less often.** VALORANT's server animates every fourth frame and interpolates poses for lag-compensation rewinds, which cut animation cost about 75%.
- **Choose hardware by measurement.** Riot measured about 30% from a newer CPU generation and 25% from turning hyperthreading back on. The figures belong to its hardware; the method (measure each change on the real server) is general.
- **Reserve and isolate cores.** Kubernetes' static CPU manager policy gives exclusive cores to containers with integer CPU requests, for workloads where "CPU cache affinity and scheduling latency significantly affect workload performance," and subtracts the kubelet and system reservations from the pool first, which is the host reserve in Kubernetes terms. On hosts it controls, Riot went further: pinning each game server to a NUMA node raised local memory access from about 50% to 97-99% (about 5% faster), and power-state, scheduler and clocksource settings were worth a few percent each.
- **Hunt noisy neighbors.** Host agents run beside the games. Riot found a networking agent starting a scheduler thread per core that stalled game servers until it was capped.

![Exploded axonometric of one game server host in four layers. 01 hardware: two NUMA nodes and 36 physical cores. 02 host OS: power states, clocksource and scheduler, the layer the 10% reserve pays for. 03 cores: 36 per host, 18 per NUMA node. 04 game servers: 108 processes, three slivers per core, with one highlighted process labeled as one match of 10 players. The formula reads N1 = C1 x G1 = 36 x 3 = 108 games and H1 = N1 x P1 = 108 x 10 = 1,080 players.](/diagrams/gm-game-servers-host.svg "One host per Riot's published sizing: 36 cores, three 128-tick games pinned per core, 108 matches and 1,080 players. Every layer below the game servers was tuned, because each percent is more matches per host.")

Performance is a property you keep, not one you reach. Riot's March 2023 post traces VALORANT's biggest server degradation since launch to "a single line of code from the UE 4.26 engine upgrade" that made replication run much more often under certain conditions; after the fix, "99.3+% of server frames have met our strict 128-tick requirements." That is why I watch engine upgrades most closely, and the post gives the business reason to care: "Server infrastructure is expensive."

What to build from this:

- **Measure frame time per match, every frame, in production.** Report the share of frames over budget per match and per host, not averages; an average hides the 2% of frames where a fight happens.
- **Gate builds on server performance.** A replay or bot match on a reference host in CI, with a frame-time budget that fails the build ([CI Pipelines](/docs/delivery/ci-pipelines)). Engine upgrades especially.
- **Size hosts from games per core at the target tick rate,** with a reserve for the host, and treat the reserve as real: the OS, the orchestrator's agent, log shippers and anti-DDoS agents all run there.
- **Pin and isolate.** Processes pinned to cores (exclusive CPUs on Kubernetes) and, where you control the host, NUMA nodes; host agents confined to the reserved cores; power states and clocksources set deliberately.

## Fleets, Allocation and Autoscaling

A **fleet** is a set of identical game servers (one build, one location) kept warm for allocation. The matchmaker doesn't start a server when a match forms; it asks for one that's already Ready, because starting and loading takes time (Edgegap notes that after a deployment is ready, the engine can take "up to 1 minute depending on your degree of optimization" before it accepts connections). Agones calls the preferred flow "allocation from a Fleet": the matchmaker requests a server, the allocator picks a Ready one, marks it Allocated and returns its address and port.

Allocation has three properties to get right:

- **Idempotent.** The matchmaker will retry. Key each allocation by the match id (the `allocation_key` above), so a retry returns the same server instead of a second one ([Idempotency](/docs/payments/idempotency) has the pattern).
- **Atomic.** Two concurrent requests must never get the same server. Orchestrators handle this; a homemade allocator needs a compare-and-set on the server's state.
- **Placed.** The request carries where the players are (latencies to regions, or a region list in preference order), so the allocator picks the right fleet ([Regions and Latency-Based Placement](#regions-and-latency-based-placement)).

An orchestrator gives you all three. If you build the allocator yourself, its state lives in a store it owns (the orchestrator's view, not the record table above), and the claim is one statement that does all three at once:

```sql
-- allocate a Ready server in the first acceptable fleet, keyed by the match
UPDATE live_servers s
SET    state = 'allocated', allocation_key = $match_id, allocated_at = NOW()
WHERE  s.id = (
         SELECT id FROM live_servers
         WHERE  fleet_id = ANY($fleet_ids_in_preference_order)
           AND  state = 'ready'
         ORDER  BY array_position($fleet_ids_in_preference_order, fleet_id), ready_at
         LIMIT  1
         FOR UPDATE SKIP LOCKED)              -- concurrent requests take different rows
RETURNING id, address, port;
-- before this: SELECT ... WHERE allocation_key = $match_id; a hit is a retry, return it
```

`SKIP LOCKED` makes concurrent requests take different servers instead of waiting on each other; a unique index on `allocation_key` turns a race between a retry and its original into one winner. An empty result is "no capacity in any acceptable fleet," which goes back to the matchmaker as a reason, never as a silent wait.

**Autoscaling** keeps enough Ready servers to absorb demand while starting more takes time. The common policy is a buffer: keep N (or a percentage) Ready at all times, within a minimum and maximum. Agones' FleetAutoscaler offers Buffer, Webhook (your own logic), Counter and List (Beta, for capacity tracked inside servers), Schedule and Chain policies, syncs every 30 seconds by default, and requires a maximum. GameLift Servers offers target-based autoscaling with a capacity buffer. Scale-down only removes Ready servers, never Allocated ones. Daily and weekly load curves are predictable in games, so schedule-based scaling ahead of the evening peak, with a buffer for surprise, beats purely reactive scaling; patch days and events need explicit pre-scaling coordinated with [Live Operations](/books/gaming/live-operations).

**Updates** use fleets per build. Deploy the new build as a new fleet (or a rolling update that only replaces non-Allocated servers), shift allocations to it, and let the old fleet drain as matches end. Agones supports RollingUpdate (with `maxSurge` and `maxUnavailable`) and Recreate strategies, and lists a canary fleet as a pattern; the release discipline is the same as any canary ([Deployment Strategies](/docs/delivery/deployment-strategies)), with the difference that the client must be compatible with the server build it lands on ([Patching & Content Delivery](/books/gaming/patching)).

## Regions and Latency-Based Placement

A server can only be fair to players who are near it. Placement decides which location hosts each match, and it starts with measurement: every client measures round-trip time to each candidate location (ping beacons, or lightweight UDP echo servers you run) and reports them with its matchmaking request.

- **Edgegap's ping beacons** let clients measure real round trips to locations; its docs recommend matching in regions under 200 ms as a starting point, and hubs under 150 ms, and caching the beacon list on a backend refreshed about every 60 seconds.
- **Valve's SDR** gives clients a `PingLocation_t` from which ping between players and data centers can be estimated for matchmaking.
- **GameLift Servers queues** take player latencies with each placement request and fall back to other locations when the preferred one has no capacity.
- **PlayFab** documents measuring player latency to Azure regions, then requesting a server.

The target is a product decision, and studios that publish theirs put latency first. Activision's 2024 matchmaking paper calls connection "the most critical and heavily weighted factor" in Call of Duty's matchmaking; Riot's stated VALORANT goal was "35ms ping to 70% of our player base," and it built regional server locations and its own network to get there. Placement policy for a group of players with different latencies is a fairness rule: minimize the worst player's latency, not the average, and cap the spread so one player isn't at 15 ms while another is at 90. When no location satisfies the cap, the matchmaker should widen the search over time rather than place a bad match immediately ([Matchmaking & Ranked](/books/gaming/matchmaking) owns that trade-off).

## The Network Between Player and Server

Servers near players are half the problem; the path to them is the other half. Internet routing optimizes for cost, not latency. Riot's 2015 networking series puts it as "Backbone providers and ISPs route traffic to the lowest cost path, not the lowest latency path," with San Francisco to Portland at 14 ms direct and 70 ms when routed through Los Angeles, Denver and Seattle. Google Cloud's network tiers document the same choice from a provider's side: Standard Tier reaches its resources "by routing it over the internet," while Premium Tier traffic "enters Google's high-performance network at the PoP closest to the sending system." Video can buffer for seconds; games can't buffer actions that haven't happened yet. Game packets are also small, which costs more than it looks on routers that count packets ([Reliability Over UDP](/books/gaming/netcode#reliability-over-udp)).

There are three ways to buy a better path, from most to least expensive:

- **Your own backbone.** Riot Direct is the public example: Riot's own routers in major US internet hubs on leased fiber, peering directly with ISPs so player traffic enters its network early, with BGP tuned so return traffic takes the fast path too. Riot reported the share of players under 80 ms rising from 31% to 50% between November 2014 and August 2015, and to 80% once servers moved to Chicago. Only a very large game can carry the cost.
- **A game relay network.** Valve's Steam Datagram Relay carries traffic "over the Valve backbone that is dedicated for game content," and Valve says that for a "surprisingly high number of players" it finds a faster route that "actually improves player ping times."
- **A cloud provider's premium network.** Premium tiers and edge locations (AWS Local Zones, Google's Premium Tier) bring traffic onto the provider's backbone near the player.

Whichever you use, measure from the player's side, by ISP and region: latency, packet loss and jitter, the three properties Riot's network team tracks. Treat a route regression at one ISP as an incident.

## DDoS Protection

Game servers are exposed by design (players connect straight to an IP and port), and running matches that someone may want to disrupt. Protection is layered:

- **Hide addresses.** A relay in front means players never learn the server's IP, and servers never learn players'. Valve: "Relaying the traffic protects your servers and players from DoS attack, because IP addresses are never revealed," and traffic arriving through SDR is "authenticated, encrypted, and rate-limited."
- **Absorb and scrub upstream.** Volumetric attacks are handled by the network provider or a scrubbing service before they reach the host. Edgegap documents detection of "TCP SYN floods, UDP floods, and HTTP floods" by port, source and connection rate, upstream scrubbing, null-routing suspicious traffic at the edge, and steering new deployments away from a machine under attack.
- **Rotate.** Short-lived servers help: Edgegap retires an attacked site's IP after the match so "subsequent matches will not be targeted by the same attacker." Fresh addresses and ports per match make a leaked address worth one match.
- **Drop the unauthenticated cheaply.** The server should reject packets that don't carry a valid connection token before doing any work; a match ticket signed by the backend and checked on connect is the usual design ([API Security](/docs/security/api-security) covers token handling).
- **Protect the platform too.** Login, matchmaking and the store are HTTP services; they get the ordinary edge protection and [rate limiting](/docs/requests/rate-limiting) of any web service.
- **Treat attacks on opponents as cheating.** A player who knocks an opponent offline mid-match wins by disconnect, so hidden addresses and relays are also a fair-play measure, and a pattern of opponents dropping from one player's matches is a signal for [Anti-Cheat](/books/gaming/anti-cheat#signals).

## Load Testing Servers and Fleets

Two different things get load tested. The **game server** is tested by playing it: bot matches and recorded matches replayed on a reference host, measuring frame time per match at the target tick rate and the number of matches a host sustains. The **platform** that provisions servers and records results is tested at launch scale with fake servers. Riot's VALORANT load test (December 2020) is one public model: its mock game servers were "lightweight Go programs" that imitated provisioning and end-of-game result recording without any gameplay, over 500 to a core, so two million simulated players didn't need two million players' worth of game servers ([Game Backend Architecture](/books/gaming/game-backend#load-testing) has the rest of that test). Agones ships the allocation half as tooling: its allocation load test, which "aims to validate performance of the gRPC allocation service," waits for a 4,000-server fleet to be Ready and then runs 4,000 allocations from parallel clients.

For the fleet specifically, a load test should cover:

- **Allocation under a burst:** thousands of matches forming at once after a queue opens or a server restart, with the Ready buffer draining and autoscaling catching up.
- **The lifecycle at scale:** fake servers that go Ready, get allocated, run for a match length, report results and shut down, so the orchestrator, the allocator and result processing all see real event rates.
- **Placement edge cases:** one location out of capacity or down, so fallback to the next location is exercised before players need it.
- **Long runs.** Some failures (connection pools, queue backlogs, log volume) appear only after hours.

General load-testing practice is in [Load Testing](/docs/quality/load-testing); capacity targets and alerts are in [SLOs](/docs/operations/slos).

## Operating the Fleet

Day to day, the fleet is watched on a few numbers:

- **Ready buffer by location,** and allocation latency (request to address). A buffer at zero means queues are about to grow.
- **Allocation failures by reason:** no capacity, no location within the latency cap, orchestrator errors.
- **Frame time per match:** share of frames over budget, by host type and build.
- **Crashes per thousand matches by build,** with crash dumps symbolicated against the server build ([Production Pipelines & Builds](/books/gaming/production-pipelines)).
- **Matches ended abnormally:** crash, unhealthy, host loss; each one is a match that players need compensated or remade.
- **Network quality from both ends:** round trip, loss and jitter by ISP and region.
- **Cost per match-hour** by location and provider.

Incidents follow the ordinary process ([Incident Response](/docs/operations/incident-response)), with one game-specific step: decide whether affected matches are remade, voided or compensated, because players care about the ranked points more than the uptime.

## Persistent Worlds

Everything above assumes the match ends. An MMO's world doesn't: a server holds a place rather than a match, players arrive and leave around it for years, and the state it holds (where a character stands, what's in a hold, who owns the station) has to outlive the process. Four of the per-match rules change: how the world is split across servers, what happens when players crowd one place, when state is written, and how servers are updated when they never empty.

### Shards, Realms and Worlds

Most persistent games run many copies of the world, each with its own population and its own database: realms in World of Warcraft, Worlds in Final Fantasy XIV, shards generically. Square Enix groups FFXIV's Worlds into logical data centers (Aether, Crystal, Dynamis and Primal in North America, for example) inside physical data centers in Japan, North America, Europe and Oceania. A character has a Home World; World Visit reaches other Worlds in the same data center and Data Center Travel reaches other logical data centers, but while visiting, "Retainers cannot be summoned, hired, or released from service" and "Items cannot be sold on the market, but purchasing is available," and a character that stays logged out elsewhere for 30 days is returned home. That split is the general shape: play travels, while anything tied to one world's economy (its market, its storage) stays on the home world.

Copies divide the population, and populations shrink unevenly, so a long-lived sharded game should expect to join worlds. Blizzard's connected realms keep the old realms in the list but make them "Virtual," hosted by a "Native" realm, so "they no longer run on their own hardware"; names carry a realm suffix, and Blizzard's September 2025 FAQ for Mists of Pandaria Classic says connecting existing realms "involves a ton of bespoke work by our Database Engineers," which is why it opened new, empty connected realms for transfers instead. Two design rules make a later merge a re-pointing rather than a renumbering: global identifiers for every character, guild and item (never per-world sequences), and display names unique per world with the world as a qualifier, so a collision is resolved by a suffix instead of a forced rename.

The alternative is one world for everyone. EVE Online runs a single shard; CCP's 2011 database post calls it "one world-wide single shard server." Tranquility, the cluster behind it, is "split into a series of nodes," each hosting one or more solar systems, and "those systems are distributed across the nodes every day during downtime": a busy system like Jita gets a node largely to itself, quiet systems share one, and CCP keeps "a few nodes in reserve" for large battles, which players announce in advance through a fleet fight notification so the system can be moved at the next downtime (CCP notes it may not be possible on the day of the fight). The unit of distribution is a place the design already has (a solar system, reached through a gate), so the server boundary falls where the game already has a transition. The cost of one shard is that its shared pieces are shared by everyone: before a 2011 database upgrade, when the SQL Server cluster failed over, "every node in the cluster died and all players were disconnected"; afterwards, a failover took down "only 3 nodes out of 208."

### Zones, Seams and Server Meshing

Within one world, the simulation is split across processes in one of two ways. **Zoning** gives each zone (a region, a dungeon, a solar system) its own server, and moving between zones is a transfer with a loading screen or a gate: simple, because an entity is only ever on one server. **Seamless** worlds let players cross server boundaries without noticing, which means authority over an entity has to move between servers while it's in motion.

Public descriptions of seamless designs:

- **New World (Amazon Games).** Per AWS's 2022 write-up, each world has four remote entry points, its only public IP addresses; behind them, a "hub" of seven EC2 C5.9xlarge instances simulates the world, which is overlaid with a grid whose cells are simulation volumes, each instance owning two nonconsecutive subdivisions of it. As a player moves, state passes from one instance to the next. One world simulates more than 7,000 AI entities and hundreds of thousands of objects for 2,500 players.
- **Star Citizen (Cloud Imperium).** CIG's Server Meshing Q&A describes several server nodes sharing the simulation of one shard, with one node holding authority over each entity and the others holding views of it. A **static** mesh fixes the number of nodes and which locations each simulates; a **dynamic** mesh reassigns authority and adds or removes servers as load changes. A central replication layer streams entity state to servers and clients, and a persistence service (EntityGraph) stores every replicated entity's state so a replacement server can restore it. CIG's December 2024 Letter from the Chairman, for Alpha 4.0, says "Each planet, landing zone, or major station is now covered by different game servers."
- **Improbable SpatialOS** sold a distributed simulation of this kind as a product for other studios. Several games built on it were cancelled or shut down (Worlds Adrift, Lazarus and Mavericks: Proving Grounds in 2019), and by 2022 Improbable had sold game studios as it shifted "its focus from game development to the metaverse." It belongs in the same lesson as the hosting table: the hardest part of a seamless world is a dependency, so keep it behind an interface you could replace.

My default is zoning along boundaries the design already has, and a seamless world only when the design can't work without one. The seam is where the bugs are. Authority over an entity must have exactly one owner at a time, handed off with a version number so a late message from the old owner is rejected; an entity that crosses mid-fight needs its in-flight effects (projectiles, damage over time) handed off with it; and two servers that both believe they own an item is a duplication exploit, not a glitch. Relevancy also has to cross the boundary: a player near a seam must see entities simulated on the other side ([Interest Management and Relevancy](/books/gaming/netcode#interest-management-and-relevancy)).

### Load: Time Dilation

A match caps its players before it starts; a world can't stop players walking into the same place. The usual answers are a cap with a queue per zone, or extra copies of a crowded zone (instances, layers). EVE's answer to the battle that can't be split is **Time Dilation**, introduced in CCP Veritas's April 2011 dev blog: when a node is overloaded, the server slows the game clock "enough to maintain a very small queue of waiting tasklets," so module cycles, travel and shield recharge all run slower and the clock returns toward normal as load clears. Reinforcement timers are deliberately not dilated, because dilating them would let players time an attack around their expiry. During the Battle of Asakai on January 27, 2013, with more than 2,750 players in one system, Time Dilation reached its "configured limit of 10%," per Data Center Knowledge's report quoting CCP Veritas.

The design lesson is to degrade fairly: everyone in the overloaded place slows by the same factor, instead of whoever's packets are dropped losing. Two details generalize. Anything tied to real time outside the fight (timers, auctions, events, other players' schedules) has to be named as exempt, as reinforcement timers are. And dilation follows the server, not the place: CCP notes that a quiet system sharing a node with a busy one can see "unusual time dilation," which is why the placement of places onto servers is itself an operational decision.

### What Is Saved When

A process per match writes its result once, at the end. A world server can't wait for an end that never comes, so it saves on three cadences, chosen per kind of state:

- **Write-behind for character state.** Position, health, cooldowns and buffs live in the server's memory and are flushed periodically, on logout and on zone transfer. A crash loses the time since the last flush, which players feel as a rollback of a few seconds or minutes. The playbook calls write-behind a bad trade for data you care about ([Patterns](/docs/architecture/application-caching#patterns)); on a world server it's the only one that fits frame rates, so the rule is to keep only state whose rollback a player would shrug at on that cadence.
- **Periodic snapshots of world state.** Entities, structures and dropped items are written in batches. AWS's New World post puts the game's writes to DynamoDB at about 800,000 every 30 seconds, which is the scale this reaches; Star Citizen's EntityGraph exists so a replacement server can restore the state of a crashed one, which CIG hopes takes under a minute while clients stay connected.
- **Transactions for value.** Trades, purchases, currency, mail and rare drops are committed to the database before the game tells the player they happened. Anything that moves value between two owners is one database transaction, never two write-behind flushes: if player A's state flushes with the item and the server crashes before player B's flush without it, the item now exists twice, which is the classic duplication exploit. Currency goes through the ledger, not a balance in the character blob ([Wallets Are Ledgers](/books/gaming/economies-and-entitlements#wallets-are-ledgers)).

Set the recovery point per kind of state, the same way a service sets one per system ([Set Targets From Impact](/docs/operations/disaster-recovery#set-targets-from-impact)), and say it to players: "a crash may lose up to a minute of movement, never a trade" is a promise support can stand behind. Which state is server-authoritative at all is decided in [Saves & Player Data](/books/gaming/saves-and-player-data#where-progress-lives).

### Maintenance Windows and Long-Lived Servers

Per-match servers update by draining: new matches go to the new build and old servers finish. A world server never drains, because it always has players, so persistent games keep scheduled downtime:

- **EVE Online** has a daily downtime. CCP's 2010 post says it was 60 minutes (11:00 to 12:00 UTC) from launch in May 2003, became 30 minutes that November while the actual work took "just under 12 minutes," and covered database cleanups, asteroid belt resets, hotfixes and patches; in May 2016 CCP shortened it to "11:00 - 11:15 UTC." The same 2010 post set the goal of eliminating it and said "no new code has been produced that relies on downtime." The 2016 change is the latest I found.
- **Final Fantasy XIV** announces All Worlds maintenance with start and end times on its official forum and the Lodestone; the April 30, 2020 notice ran five hours (10:00 p.m. to 3:00 a.m. PDT), said "Completion time is subject to change," and was later updated when it finished early.
- **World of Warcraft** realms have a weekly maintenance day; on April 8, 2025, per Blizzard Watch, retail realms in North America were down for an hour while Classic realms were scheduled for eight. Blizzard's hotfix notes describe the other path: "Some of the hotfixes below take effect the moment they were implemented," others "may require scheduled realm restarts," and "some issues cannot be addressed without a client-side patch update."

That gives three classes of change, and the architecture decides which class each change lands in:

1. **Data hotfixes,** applied live: tuning values, drop tables, prices, feature flags, loaded by running servers without a restart. My rule is that anything designers tune ships as data, so most fixes need no restart at all ([Feature Flags](/docs/delivery/feature-flags)).
2. **Server code,** applied by restarting servers one at a time where the world can tolerate it: a zone briefly closed and its players moved, or a mesh moving authority off a node before it restarts. This is a rolling deploy ([Rolling](/docs/delivery/deployment-strategies#rolling)) with the twist that the unit is a place, and players in it need a warning and a safe spot to land.
3. **Full downtime,** for what genuinely needs the world stopped: schema migrations that can't run online, world merges, protocol changes that every client and server must take at once. These go in the scheduled window, run with the player-facing sequence in [Live Operations](/books/gaming/live-operations#maintenance-and-player-communication), and the window stays short and at a fixed time so players can plan around it.

CCP's rule is the one to copy: new code must not depend on the window. Daily maintenance tasks (world resets, cleanups, rebalancing places across servers) should run while the world is up, so the window shrinks to the changes that truly need it.

### The Schema for Worlds

The core model's `game_servers` row is one process; in a persistent game, that process serves a slice of a world, and the record needs the world and the slice:

```sql
CREATE TABLE worlds (                          -- a realm, World or shard
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  game_id              UUID NOT NULL REFERENCES games (id),
  name                 TEXT NOT NULL,
  data_center          TEXT NOT NULL,         -- the travel and matchmaking group it belongs to
  status               TEXT NOT NULL CHECK (status IN ('open', 'locked', 'maintenance',
                         'retired')),          -- locked: no new characters
  hosted_by_world_id   UUID REFERENCES worlds (id),  -- set when connected to another world
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, game_id, name)
);

CREATE TABLE zone_assignments (                -- which server simulates which place, over time
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  world_id       UUID NOT NULL REFERENCES worlds (id),
  zone_key       TEXT NOT NULL,                -- a solar system, region or grid cell
  game_server_id UUID NOT NULL REFERENCES game_servers (id),
  valid_during   TSTZRANGE NOT NULL,
  EXCLUDE USING gist (world_id WITH =, zone_key WITH =, valid_during WITH &&)  -- one owner at a time
);

ALTER TABLE player_profiles
  ADD COLUMN home_world_id    UUID REFERENCES worlds (id),
  ADD COLUMN current_world_id UUID REFERENCES worlds (id),  -- differs while visiting
  ADD COLUMN state_version    BIGINT NOT NULL DEFAULT 0,    -- each flush must increment it
  ADD COLUMN state_saved_at   TIMESTAMPTZ;

ALTER TABLE game_servers
  ADD COLUMN world_id UUID REFERENCES worlds (id);
```

The exclusion constraint is the authority rule in the database: two servers can never be recorded as owning one place at the same time, and the history of assignments answers "which server was this player's zone on when it crashed." `state_version` makes a write-behind flush conditional (`UPDATE ... WHERE state_version = $expected`), so a stale flush from a server that lost authority is rejected instead of overwriting newer state.

## What You Can Adopt

Everything in this chapter (the lifecycle, the allocator, the autoscaler, placement) can be built on plain VMs or bare metal, and large studios have. Most games adopt an orchestrator instead, open source or managed, and spend their engineering on the game server itself.

### Hosting Options

As of October 2026:

| Option | Kind | What it gives you | License, status |
| --- | --- | --- | --- |
| Agones | Open source, self-hosted on Kubernetes | "A library for hosting, running and scaling dedicated game servers on Kubernetes": GameServer and Fleet resources, the SDK above, allocation, fleet autoscaling, rolling and canary updates | Apache-2.0; active (version 1.61.0, last push October 26, 2026); "Agones a Series of LF Projects, LLC"; announced by Google Cloud with Ubisoft in 2018 |
| Open Match | Open source matchmaking framework, often paired with Agones | Matchmaking only; covered in [Matchmaking & Ranked](/books/gaming/matchmaking#matchmakers-you-can-adopt) | Apache-2.0; not archived (last push July 2026) |
| Thundernetes | Open source, Kubernetes | Game servers on Kubernetes, from the PlayFab team | Apache-2.0; archived August 18, 2026, and its README already called it "more of an experiment and not supported for production environments." Don't start on it |
| Amazon GameLift Servers | Managed (AWS) | Managed EC2 (Linux and Windows, Spot and On-Demand) or managed containers; queues that place sessions across fleets and locations with the FleetIQ algorithm (cost, location, player latency) and fall back to other locations; Anywhere fleets that register your own hardware or other clouds; hybrid fleets mixing both | Proprietary service; active. AWS recommends fleets in at least two locations and aliases for every fleet |
| Edgegap | Managed, multi-provider | Match-bound deployments across many cloud and bare-metal providers, placed per match by a "Server Score" from players' network proximity; ping beacons; built-in DDoS handling | Proprietary service; active. Cloud deployments end after 24 hours of runtime; private fleets for longer-lived servers |
| PlayFab Multiplayer Servers | Managed (Azure) | Containerized Windows or Linux builds, standby servers scaled on a schedule, dynamically or programmatically, player latency measured to Azure regions | Proprietary service; active (docs updated September 2025). PlayFab's wider backend is in [Game Backend Architecture](/books/gaming/game-backend#what-you-can-adopt) |
| Unity Multiplay Game Server Hosting | Managed (Unity) | Unity's hosting service | Deprecated as of April 1, 2026, per Unity's status notice: "Customers can no longer scale new game servers or make new allocations"; customers migrating to Multiplay by Rocket Science could continue until migration completed |
| Hathora | Managed | Game server hosting | Winding down: a Nitrado press release of March 4, 2026 announced moving Hathora customers to Nitrado's GameFabric "following Hathora's decision to wind down gaming operations" |
| Google Cloud Game Servers | Managed (Google), built on Agones | Google's managed Agones service | Shut down: Google's status page lists it among inactive products, "Game Servers have been shut down" |
| Your own (bare metal or cloud VMs) | Self-built | Your scheduler and allocator on hardware you control | Riot's 2020 load-testing post describes Riot Container Engine scheduling Docker containers on Apache Mesos, on AWS EC2 for the test; a 2022 AWS post says Riot serves League of Legends and VALORANT players from AWS Local Zones "without the need for operating on-premises compute" |

Four of these ten have shut down, been deprecated, been archived or are winding down. That is the most important line in the table: keep the game server's integration with the orchestrator thin (one adapter for ready, health, allocate and shutdown, and one for allocation requests from the matchmaker) so moving between them is a project, not a rewrite.

### Self-Hosted Versus Managed

The trade has four parts:

- **Cost.** A managed service charges for the convenience on top of the compute. Self-hosting on cloud VMs or Kubernetes pays only for compute, and owned or leased bare metal is cheaper again at steady load, which is the load a game has every evening. Riot's tuning list (power states, hyperthreading, NUMA pinning, clocksource) is the other half of the cost case: each item is a few percent of capacity, and only someone who controls the host can take them. The economics are in [Cost & FinOps](/docs/operations/cost-and-finops).
- **Operations burden.** Agones means running Kubernetes clusters in every region, upgrading them and Agones together, and being on call for them ([Kubernetes](/docs/operations/kubernetes)). A managed service runs the control plane; you still own the game server, its builds, and the fleet configuration.
- **Regions.** You can only place matches where your hosting is. A single cloud covers its own regions (and edge locations such as AWS Local Zones); multi-provider services like Edgegap, and GameLift Anywhere with your own hardware, reach places one cloud doesn't. For a game with players in regions a provider doesn't serve, this decides the question.
- **Lock-in.** Each managed service has its own SDK and allocation API in the game server and the matchmaker, and three of them (Google Cloud Game Servers, Unity Multiplay, Hathora) have shut down, been deprecated or are winding down; with the archived Thundernetes, that's the four of ten in the table above. Agones is portable across any Kubernetes; the thin adapter limits the damage either way.

A common shape at scale is hybrid: a base load on hardware you own or lease, with cloud capacity for launches and peaks. GameLift's hybrid hosting describes exactly that ("burst" capacity beside your existing hosting).

### My Default

By game and team:

- **A small team, session-based game:** a managed service (GameLift Servers, Edgegap or PlayFab Multiplayer Servers), chosen by where your players are and what your engine integrates with. The team's time goes to the game; hosting cost at small scale is less than one engineer.
- **A mid-size team that already runs Kubernetes:** Agones on a managed Kubernetes service in each region, with Open Match or a backend matchmaker in front.
- **A large competitive game:** your own allocator and fleet management, on owned or leased hardware where the player base is steady, plus cloud for bursts, with the host tuned for games per core. Riot's published VALORANT path (its own container scheduler, tuned hosts, then AWS Local Zones) is one example, and it's only worth it when the fleet is big enough that a few percent per host pays for a team.
- **Co-op, casual and peer-hosted games:** no fleet at all; listen servers or peer-to-peer with a relay ([Netcode Fundamentals](/books/gaming/netcode#topologies-and-authority)).

## What This Means for the System You Build

- **One server process per match** (or a measured number of sessions per process), with a lifecycle of starting, ready, reserved, allocated, shutdown and unhealthy, health heartbeats, and draining by notice, never by kill.
- **A frame budget per tick rate,** a host reserve, games per core as the capacity unit, frame time per match measured in production, and a server performance gate in CI, especially for engine upgrades.
- **Hosts sized and tuned deliberately:** CPU generation, hyperthreading, power states, NUMA pinning, clocksource, and host agents kept off game cores.
- **Fleets per build and location,** idempotent and atomic allocation keyed by match, buffer and schedule-based autoscaling that never removes allocated servers, and canary fleets for new builds.
- **Adopt an orchestrator before building one** (managed for small teams, Agones where Kubernetes is already run, your own only at a scale where host tuning pays), behind a thin adapter, because hosting products come and go: Google Cloud Game Servers shut down, Unity Multiplay deprecated April 1, 2026, Thundernetes archived, Hathora winding down.
- **Placement from client-measured latency,** a latency target, and a fairness cap on spread within a match.
- **A network plan:** relay or protected network, per-ISP latency monitoring, and DDoS layers from hidden IPs to per-match rotation and connection tokens.
- **Fleet load tests with mock game servers** for allocation bursts, the lifecycle at scale and location failover, and per-match performance tests of the real server.
- **For a persistent world:** global identifiers so worlds can be merged, zones along boundaries the design already has (seamless only when the design needs it), one recorded owner per place and per entity, fair degradation under load, a save cadence per kind of state with value moved only in database transactions, data hotfixes that need no restart, and a short, fixed maintenance window that no new code depends on.

## References

**Reference**

- [Agones: Overview](https://agones.dev/site/docs/overview/), Agones as a library for hosting and scaling dedicated game servers on Kubernetes, the current release and its LF Projects copyright
- [Agones: GameServer specification](https://agones.dev/site/docs/reference/gameserver/), health check defaults, port policies and the allocation controller
- [Agones: Client SDKs](https://agones.dev/site/docs/guides/client-sdks/), Ready, Health, Reserve, Allocate, Shutdown, labels, watching, Counters and Lists, and the supported languages
- [Agones: Fleet updates](https://agones.dev/site/docs/guides/fleet-updates/), rolling and recreate updates, allocated servers protected until shutdown, and draining by label
- [Agones: FleetAutoscaler](https://agones.dev/site/docs/reference/fleetautoscaler/), buffer and other policies, required maximum and the 30-second sync
- [Agones: Integration patterns](https://agones.dev/site/docs/integration-patterns/), allocation from a fleet, canary fleets, reuse, high density and player capacity
- [Amazon GameLift Servers: Hosting options](https://docs.aws.amazon.com/gamelift/latest/developerguide/gamelift-intro-flavors.html), managed EC2, managed containers, Anywhere and hybrid hosting
- [Amazon GameLift Servers: Game session placement](https://docs.aws.amazon.com/gamelift/latest/developerguide/queues-intro.html), queues, the FleetIQ algorithm, Spot and On-Demand, fallback and best practices
- [Edgegap: Deployments](https://docs.edgegap.com/learn/orchestration/deployments.md), match-bound servers, Server Score placement, readiness time and the 24-hour limit
- [Edgegap: Ping beacons](https://docs.edgegap.com/learn/orchestration/ping-beacons.md), client latency measurement, recommended thresholds and beacon list caching
- [Edgegap: DDoS protection](https://docs.edgegap.com/docs/ddos-protection.md), flood detection, steering, scrubbing, null routes and IP retirement
- [Microsoft Learn: PlayFab Multiplayer Servers](https://learn.microsoft.com/en-us/gaming/playfab/multiplayer/servers/), Azure-hosted game servers, standby scaling and latency measurement
- [Valve: Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay), relayed traffic that hides IPs, rate limiting, the backbone dedicated to game content, improved routes and ping estimation
- [Valve Developer Community: Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking), higher tick rates needing more CPU and tick rate 100 at about 1.5 times the load of 66
- [Kubernetes: Control CPU Management Policies on the Node](https://kubernetes.io/docs/tasks/administer-cluster/cpu-management-policies/), the static policy's exclusive CPUs for integer requests, reservations subtracted from the pool, and cache-affinity-sensitive workloads
- [Epic Games: Replicate Actor Properties](https://dev.epicgames.com/documentation/en-us/unreal-engine/replicate-actor-properties-in-unreal-engine), properties replicating only when they have changed
- [Google Cloud: Network Service Tiers overview](https://docs.cloud.google.com/network-tiers/docs/overview), Standard Tier routing over the internet and Premium Tier entering Google's network at the PoP closest to the sender
- [Agones: Allocation load test](https://pkg.go.dev/agones.dev/agones/test/load/allocation), validating the gRPC allocation service with a 4,000-server fleet and 4,000 allocations from parallel clients
- [Agones repository](https://github.com/googleforgames/agones), the Apache-2.0 license and current activity
- [Open Match repository](https://github.com/googleforgames/open-match), the Apache-2.0 matchmaking framework and its last activity
- [Thundernetes repository](https://github.com/PlayFab/thundernetes), archived August 18, 2026, and described as an experiment not supported for production
- [Square Enix: FFXIV Data Center Travel guide](https://na.finalfantasyxiv.com/lodestone/playguide/contentsguide/datacentertravel/), physical and logical data centers, Home Worlds, World Visit, the retainer and market restrictions while visiting, and the 30-day return
- [World of Warcraft: Hotfixes (April 2025)](https://news.blizzard.com/en-us/article/24179333/hotfixes-april-4-2025), hotfixes that apply immediately, ones that need scheduled realm restarts, and issues that need a client patch

**In practice**

- [Google Cloud: Introducing Agones](https://cloud.google.com/blog/products/containers-kubernetes/introducing-agones-open-source-multiplayer-dedicated-game-server-hosting-built-on-kubernetes), why dedicated game servers differ from other stateful services, with Ubisoft (March 13, 2018)
- [Google Cloud: Service status summary](https://status.cloud.google.com/summary), Game Servers listed as shut down
- [Unity: Multiplay Game Server Hosting deprecation notice](https://status.unity.com/info_notices/362941), deprecated as of April 1, 2026 (posted March 31, 2026)
- [Gamespress: Nitrado and Hathora collaborate on customer transition to GameFabric](https://www.gamespress.com/tr/Nitrado-and-Hathora-collaborate-on-customer-transition-to-GameFabric), Hathora's decision to wind down gaming operations (March 4, 2026)
- [Activision: Matchmaking Series, The Role of Skill in Matchmaking](https://www.activision.com/cdn/research/CallofDuty_Matchmaking_Series_2.pdf), connection as the most heavily weighted matchmaking factor in Call of Duty (2024)
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), the 7.8125 ms frame, 2.34 ms target, 3 games per core, 36-core hosts, 50 ms to sub-2 ms, Unreal Engine 4 replication, polling versus RPCs, animation every fourth frame and the hardware and OS tuning (August 31, 2020)
- [Riot Games: How We Got to the Best-Performing VALORANT Servers Since Launch](https://playvalorant.com/en-us/news/dev/how-we-got-to-the-best-performing-valorant-servers-since-launch/), the UE 4.26 replication regression, the 5.2 ms estimate for a 22-client game, and 99.3+% of frames on budget (March 9, 2023)
- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), one server executable per match, mock game servers in Go and Riot Container Engine on Mesos (December 15, 2020)
- [Riot Games: Peeking into VALORANT's Netcode](https://www.riotgames.com/en/news/peeking-valorants-netcode), the 35 ms ping target for 70% of players (July 28, 2020)
- [Riot Games: Fixing the Internet for Real Time Applications, Part I](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-i), lowest-cost routing and the San Francisco to Portland example (November 6, 2015)
- [Riot Games: Fixing the Internet for Real Time Applications, Part II](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-ii), Riot Direct's hubs, fiber, peering and BGP tuning, and players under 80 ms from 31% to 50% to 80% (February 12, 2016)
- [Riot Games: Fixing the Internet for Real Time Applications, Part III](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-iii), latency, loss and jitter as the properties tracked (July 25, 2016)
- [AWS News Blog: AWS Local Zones expansion](https://aws.amazon.com/blogs/aws/aws-local-zones-expansion-taipei-and-delhi/), Riot serving League of Legends and VALORANT players from Local Zones (October 5, 2022)
- [CCP: Full Suite of Upgrades to the Tranquility DB](https://www.eveonline.com/news/view/full-suite-of-upgrades-to-the-tranquility-db-yippie), EVE's single shard and a database failover that once disconnected every node, later 3 of 208 (March 24, 2011)
- [CCP: Fleet Fight Notification Tool](https://www.eveonline.com/news/view/fleet-fight-notification-tool), Tranquility's nodes, solar systems redistributed daily at downtime, reserve nodes and time dilation from shared nodes (July 10, 2020)
- [CCP: Introducing Time Dilation (TiDi)](https://www.eveonline.com/news/view/introducing-time-dilation-tidi), slowing the game clock under load and exempting reinforcement timers (April 22, 2011)
- [Data Center Knowledge: Experiencing Heavy Server Load? Just Slow Down Time](https://www.datacenterknowledge.com/servers/experiencing-heavy-server-load-just-slow-down-time), the Battle of Asakai, more than 2,750 players and Time Dilation at its configured 10% limit (January 31, 2013)
- [CCP: Death to Downtimes](https://www.eveonline.com/news/view/death-to-downtimes), EVE's downtime history from 60 to 30 minutes, what it does, and no new code relying on it (October 29, 2010)
- [CCP: Daily Downtime Officially Shortened to 15 Minutes](https://www.eveonline.com/news/view/daily-downtime-officially-shortened-to-15-minutes), the 11:00 to 11:15 UTC window (May 11, 2016)
- [Square Enix forum: All Worlds Maintenance (Apr. 30-May 1)](https://forum.square-enix.com/ffxiv/threads/418670-All-Worlds-Maintenance-(Apr.-30-May-1)), a five-hour FFXIV window, completion time subject to change, finished early (2020)
- [Blizzard forums: Realm Consolidation FAQ](https://eu.forums.blizzard.com/en/wow/t/589384), Virtual realms hosted on a Native realm's hardware, realm suffixes and the database work of connecting realms (September 2025)
- [Blizzard Watch: Quick WoW maintenance for US, long maintenance for Classic](https://blizzardwatch.com/2025/04/08/quick-wow-maintenance-us-long-wow-maintenance-classic-players), the weekly maintenance day, one hour for retail and eight scheduled for Classic (April 8, 2025)
- [AWS for Games: The Unique Architecture behind Amazon Games' Seamless MMO New World](https://aws.amazon.com/blogs/gametech/the-unique-architecture-behind-amazon-games-seamless-mmo-new-world), remote entry points, hubs, the simulation grid, handoff between instances, 2,500 players per world and DynamoDB writes (April 6, 2022)
- [Cloud Imperium: Server Meshing and Persistent Streaming Q&A](https://robertsspaceindustries.com/comm-link/transmission/18397-Server-Meshing-And-Persistent-Streaming-Q-A), authority per entity, static and dynamic meshes, the replication layer, EntityGraph and crash recovery
- [Cloud Imperium: Letter From the Chairman (December 2024)](https://robertsspaceindustries.com/en/comm-link/transmission/20371-Letter-From-The-Chairman), Alpha 4.0 with each planet, landing zone or major station on different game servers
- [PC Games Insider: Ambitious, visionary products always contain some risk, says Improbable](https://www.pcgamesinsider.biz/news/69519/ambitious-visionary-products-always-contain-some-risk-says-improbable-after-third-spatialos-project-bites-the-dust/), Worlds Adrift, Mavericks and Lazarus cancelled (August 13, 2019)
- [PC Games Insider: Improbable continues games divestment with Midwinter sale](https://www.pcgamesinsider.biz/news/73029/improbable-continues-games-divestment-with-midwinter-sale/), Improbable shifting from game development to the metaverse (May 17, 2022)
