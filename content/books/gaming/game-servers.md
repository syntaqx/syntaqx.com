+++
title = "Game Servers & Hosting"
description = "Dedicated server processes, VALORANT's 128-tick frame budget, fleets and allocation, Agones and GameLift, placement, the network path, DDoS and load tests."
category = "Gaming Industry"
order = 1609
part = "Multiplayer"
tags = ["gaming", "game-servers", "hosting", "agones", "gamelift", "multiplayer"]
+++

A dedicated game server is an odd thing to operate. It is a stateful process holding an entire match in memory, it lives for minutes, players connect to it directly by IP and port, it must finish every frame on time or the game visibly degrades, and you need thousands of them at peak and far fewer at 5 a.m. Google's announcement of Agones in 2018 summed up the difference from ordinary services: "Dedicated game servers are stateful applications that retain the full game simulation in memory. But unlike other stateful applications, such as databases, they have a short lifetime," running "for a few minutes or hours," and they "need a direct connection to a running game server process' hosting IP and port, rather than relying on load balancers."

This chapter covers that process and the platform around it: what one server process is and how its life is managed, how much CPU a frame gets (with Riot's published VALORANT numbers as the worked example), how fleets are allocated and scaled, which hosting products exist and which have gone away, how servers are placed near players, the network between player and server, DDoS, and load testing. What the server computes each tick (prediction, lag compensation, relevancy) is in [Netcode Fundamentals](/books/gaming/netcode); how players are grouped before they get a server is in [Matchmaking & Ranked](/books/gaming/matchmaking); the services around matches (accounts, stores, parties) are in [Game Backend Architecture](/books/gaming/game-backend).

## One Process per Match

The standard shape for session-based games is one game server process per match. Riot's description of VALORANT is the clearest public statement of it: the game server executable "controls the frame-to-frame gameplay," and "we need to run thousands of these game server executables, one for each running match," while a separate platform of microservices handles parties, matchmaking, the store and the rest. Riot's posts show VALORANT's game server is built on Unreal Engine (the 128-tick post discusses its Unreal Engine 4 property replication; the 2023 performance post traces a regression to an Unreal Engine 4.26 upgrade). The services that manage it are a different stack: "Our entire backend microservice architecture is built using Golang," per a November 2020 Riot post, and that covers "spinning up and managing a game server process." The split is typical: an engine-built simulation process, managed by ordinary backend services ([Game Backend Architecture](/books/gaming/game-backend) covers the platform side, and Riot's statement that its two primary service languages are Java and Go).

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

A game server's capacity isn't measured in requests per second. It's measured in games per core at a given tick rate, and the number falls straight out of the frame budget. Riot's August 2020 post on VALORANT's 128-tick servers, by Brent Randall, is the best public walkthrough of that arithmetic and the work it took.

At 128 ticks a second, the server must "process an entire frame within 7.8125ms." Riot reserved about 10% of that for the operating system, scheduling and other host software, and decided that one game per core was too expensive: the target was to beat 3 games per core. Three frames and the reserve in 7.8125 ms leaves "a target budget of just 2.34ms per frame." With hosts that typically have 36 cores, three games per core means 108 games, or 1,080 players, per server.

![Dimensional drawing of one CPU core's 128-tick frame at 80 px per millisecond. F1 = 1000 / 128 = 7.8125 ms spans the drawing. It divides into three game slots of G1 = 2.34 ms each, the first highlighted, and a hatched host reserve O1 = 0.78 ms (10%); the closing formula is 3 x 2.34375 + 0.78125 = 7.8125. Inside game 1's slot, the measured frame M1 is under 2.00 ms, leaving headroom H1 above 0.34. A detail view at 11 px per millisecond compares the 7.8125 ms budget, Riot's 2023 estimate of 5.2 ms for a 22-client game, and the 50 ms frame the optimization work started from, 6.4 times the budget.](/diagrams/gm-game-servers-frame-budget.svg "VALORANT's 128-tick budget from Riot's published figures: three games and a host reserve share every 7.8125 ms frame on one core, so each game gets 2.34 ms. The work took a 50 ms frame to under 2.")

"When we started, a server frame took 50ms, and by the end we reached sub-2ms per frame." The post's techniques generalize to any engine-built server:

- **Push changes instead of polling for them.** Unreal's property replication compares replicated variables for changes; Riot calls polling systems "a performance anti-pattern." Moving state changes to explicit RPCs (a `ShotHit` event carrying damage instead of a replicated health value checked every frame) gave "a 100x to 10000x performance improvement" in many cases.
- **Do less, less often.** Server-side animation ran every fourth frame, interpolating poses for lag-compensation rewinds, cutting animation cost about 75%; turning server animation off in the buy phase saved another 33% over a round.
- **Choose hardware by measurement.** Moving from Xeon E5 processors to Xeon Scalable gave roughly 30%. Hyperthreading was tested both ways; turning it back on raised performance 25%.
- **Tune the host.** Limiting CPU power states let hosts run 1-3% more games stably. Pinning each game server to a NUMA node (`numactl --cpunodebind={gameid % 2} --membind={gameid % 2}`) raised NUMA-local memory access from about 50% to 97-99%, about 5% faster. Setting the Linux scheduler's migration cost to 0 gave another 4%. On AWS, switching the clocksource from Xen to `tsc` gave 1-3%.
- **Hunt noisy neighbors.** An Erlang-based networking agent (`dcos_net`) started a scheduler thread per core, 72 of them every 5 seconds, which stalled game servers until Riot capped it at 4.

![Exploded axonometric of one game server host in four layers. 01 hardware: two NUMA nodes and 36 physical cores. 02 host OS: power states, clocksource and scheduler, the layer the 10% reserve pays for. 03 cores: 36 per host, 18 per NUMA node. 04 game servers: 108 processes, three slivers per core, with one highlighted process labeled as one match of 10 players. The formula reads N1 = C1 x G1 = 36 x 3 = 108 games and H1 = N1 x P1 = 108 x 10 = 1,080 players.](/diagrams/gm-game-servers-host.svg "One host per Riot's published sizing: 36 cores, three 128-tick games pinned per core, 108 matches and 1,080 players. Every layer below the game servers was tuned, because each percent is more matches per host.")

Performance is a property you keep, not one you reach. Riot's March 2023 post, by Aaron Cheney, describes the biggest degradation since launch, found on August 25, 2022: "a single line of code from the UE 4.26 engine upgrade caused Replication to occur much more often" under certain conditions. It was noticeable with 10 clients and "unplayable with 22-clients" (Riot estimated that a 22-client game, at about 2.2 times the work, would take about 5.2 ms a frame even when healthy). The fix reached the esports environment on September 8, 2022 and live servers in patch 5.05; since patch 5.07, "99.3+% of server frames have met our strict 128-tick requirements," and overall server frame time was 15% below the pre-degradation level. The same post gives the business reason for all of it: "Server infrastructure is expensive," and one game per machine isn't sustainable.

What to build from this:

- **Measure frame time per match, every frame, in production.** Report the share of frames over budget per match and per host, not averages; an average hides the 2% of frames where a fight happens.
- **Gate builds on server performance.** A replay or bot match on a reference host in CI, with a frame-time budget that fails the build ([CI Pipelines](/docs/delivery/ci-pipelines)). Engine upgrades especially.
- **Size hosts from games per core at the target tick rate,** with a reserve for the host, and treat the reserve as real: the OS, the orchestrator's agent, log shippers and anti-DDoS agents all run there.
- **Pin and isolate.** Processes pinned to cores and NUMA nodes, host agents confined to their own cores, power states and clocksources set deliberately.

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

The target is a product decision. Riot's stated VALORANT goal was "35ms ping to 70% of our player base," and it built regional server locations and its own network to get there. Placement policy for a group of players with different latencies is a fairness rule: minimize the worst player's latency, not the average, and cap the spread so one player isn't at 15 ms while another is at 90. When no location satisfies the cap, the matchmaker should widen the search over time rather than place a bad match immediately ([Matchmaking & Ranked](/books/gaming/matchmaking) owns that trade-off).

## The Network Between Player and Server

Servers near players are half the problem; the path to them is the other half. Riot's three-part series "Fixing the Internet for Real Time Applications" (2015-2016) explains why. "Backbone providers and ISPs route traffic to the lowest cost path, not the lowest latency path": Riot's example is San Francisco to Portland, 14 ms direct and 70 ms when routed through Los Angeles, Denver and Seattle. Video can buffer about five seconds; games can't buffer actions that haven't happened yet. Game packets are also small, which costs more than it looks on routers that count packets ([Reliability Over UDP](/books/gaming/netcode#reliability-over-udp)).

**Riot Direct** is Riot's answer: its own routers in ten of the largest internet hubs in the US, connected by leased dark fiber or optical waves, peering directly with as many ISPs as possible so player traffic enters Riot's network early. BGP's defaults kept sending return traffic the slow way, which Riot fixed with ISPs using BGP communities and MED preferences. Riot's published results: the share of players under 80 ms rose from 31% to 50% between November 2014 and August 2015, and moving servers to Chicago took it "from 50% to 80% overnight." The third post adds that Riot tracks "latency, packet loss, and jitter," streams device telemetry with "updates every millisecond," built a DPDK-based router that "can process 400M packets per second," and that "Riot now spends less on internet access and internet facing networking than ever before." Riot's closing argument: "We believe that games deserve their own network."

Most studios can't build a backbone. The same idea is available as a service: Valve's Steam Datagram Relay routes over Valve's backbone and says that for many players it "actually improves player ping times," and cloud providers' premium network tiers and edge locations do some of the same. Either way, measure from the player's side, by ISP and region, and treat a route regression at one ISP as an incident.

## DDoS Protection

Game servers are exposed by design (players connect straight to an IP and port), and running matches that someone may want to disrupt. Protection is layered:

- **Hide addresses.** A relay in front means players never learn the server's IP, and servers never learn players'. Valve: "Relaying the traffic protects your servers and players from DoS attack, because IP addresses are never revealed," and traffic arriving through SDR is "authenticated, encrypted, and rate-limited."
- **Absorb and scrub upstream.** Volumetric attacks are handled by the network provider or a scrubbing service before they reach the host. Edgegap documents detection of "TCP SYN floods, UDP floods, and HTTP floods" by port, source and connection rate, upstream scrubbing, null-routing suspicious traffic at the edge, and steering new deployments away from a machine under attack.
- **Rotate.** Short-lived servers help: Edgegap retires an attacked site's IP after the match so "subsequent matches will not be targeted by the same attacker." Fresh addresses and ports per match make a leaked address worth one match.
- **Drop the unauthenticated cheaply.** The server should reject packets that don't carry a valid connection token before doing any work; a match ticket signed by the backend and checked on connect is the usual design ([API Security](/docs/security/api-security) covers token handling).
- **Protect the platform too.** Login, matchmaking and the store are HTTP services; they get the ordinary edge protection and [rate limiting](/docs/requests/rate-limiting) of any web service.
- **Treat attacks on opponents as cheating.** A player who knocks an opponent offline mid-match wins by disconnect, so hidden addresses and relays are also a fair-play measure, and a pattern of opponents dropping from one player's matches is a signal for [Anti-Cheat](/books/gaming/anti-cheat#signals).

## Load Testing Servers and Fleets

Two different things get load tested. The **game server** is tested by playing it: bot matches and recorded matches replayed on a reference host, measuring frame time per match at the target tick rate and the number of matches a host sustains. The **platform** that provisions servers and records results is tested at launch scale with fake servers, and Riot's VALORANT load test (December 2020) is the public model for that: its mock game servers were "lightweight Go programs" that imitated provisioning and end-of-game result recording without any gameplay, and over 500 of them ran on a single core, so two million simulated players didn't need two million players' worth of game servers. The full account of that test (the harness, the doubling, the shard) is in [Game Backend Architecture](/books/gaming/game-backend#load-testing).

For the fleet specifically, a load test should cover:

- **Allocation under a burst:** thousands of matches forming at once after a queue opens or a server restart, with the Ready buffer draining and autoscaling catching up.
- **The lifecycle at scale:** fake servers that go Ready, get allocated, run for a match length, report results and shut down, so the orchestrator, the allocator and result processing all see real event rates.
- **Placement edge cases:** one location out of capacity or down, so fallback to the next location is exercised before players need it.
- **Long runs.** Some failures (connection pools, queue backlogs, log volume) appear only after hours.

General load-testing practice is in [Load Testing](/docs/operations/load-testing); capacity targets and alerts are in [SLOs](/docs/operations/slos).

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
- **A large competitive game:** your own allocator and fleet management, on owned or leased hardware where the player base is steady, plus cloud for bursts, with the host tuned for games per core. This is where Riot's published path points, and it's only worth it when the fleet is big enough that a few percent per host pays for a team.
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
- [Valve: Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay), relayed traffic that hides IPs, rate limiting, improved routes and ping estimation
- [Agones repository](https://github.com/googleforgames/agones), the Apache-2.0 license and current activity
- [Open Match repository](https://github.com/googleforgames/open-match), the Apache-2.0 matchmaking framework and its last activity
- [Thundernetes repository](https://github.com/PlayFab/thundernetes), archived August 18, 2026, and described as an experiment not supported for production

**In practice**

- [Google Cloud: Introducing Agones](https://cloud.google.com/blog/products/containers-kubernetes/introducing-agones-open-source-multiplayer-dedicated-game-server-hosting-built-on-kubernetes), why dedicated game servers differ from other stateful services, with Ubisoft (March 13, 2018)
- [Google Cloud: Service status summary](https://status.cloud.google.com/summary), Game Servers listed as shut down
- [Unity: Multiplay Game Server Hosting deprecation notice](https://status.unity.com/info_notices/362941), deprecated as of April 1, 2026 (posted March 31, 2026)
- [Gamespress: Nitrado and Hathora collaborate on customer transition to GameFabric](https://www.gamespress.com/tr/Nitrado-and-Hathora-collaborate-on-customer-transition-to-GameFabric), Hathora's decision to wind down gaming operations (March 4, 2026)
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), the 7.8125 ms frame, 2.34 ms target, 3 games per core, 36-core hosts, 50 ms to sub-2 ms and the hardware and OS tuning (August 31, 2020)
- [Riot Games: How We Got to the Best-Performing VALORANT Servers Since Launch](https://playvalorant.com/en-us/news/dev/how-we-got-to-the-best-performing-valorant-servers-since-launch/), the UE 4.26 replication regression, its fix dates and patches, and 99.3+% of frames on budget (March 9, 2023)
- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), one server executable per match, over three 128-tick games per core, mock game servers in Go and Riot Container Engine on Mesos (December 15, 2020)
- [Riot Games: Leveraging Golang for Game Development and Operations](https://www.riotgames.com/en/news/leveraging-golang-game-development-and-operations), VALORANT's backend microservices in Go, including the ones that manage game server processes (November 6, 2020)
- [Riot Games: Peeking into VALORANT's Netcode](https://www.riotgames.com/en/news/peeking-valorants-netcode), the 35 ms ping target for 70% of players (July 28, 2020)
- [Riot Games: Fixing the Internet for Real Time Applications, Part I](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-i), lowest-cost routing and the San Francisco to Portland example (November 6, 2015)
- [Riot Games: Fixing the Internet for Real Time Applications, Part II](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-ii), Riot Direct's hubs, fiber and peering, and players under 80 ms from 31% to 50% to 80% (February 12, 2016)
- [Riot Games: Fixing the Internet for Real Time Applications, Part III](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-iii), latency, loss and jitter telemetry, the 400M packets per second router and lower networking spend (July 25, 2016)
- [AWS News Blog: AWS Local Zones expansion](https://aws.amazon.com/blogs/aws/aws-local-zones-expansion-taipei-and-delhi/), Riot serving League of Legends and VALORANT players from Local Zones (October 5, 2022)
