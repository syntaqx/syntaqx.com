+++
title = "Game Backend Architecture"
description = "What a live game's backend runs, how studios have built and deployed it, the platforms you can buy, and why launches break and how to load test them."
category = "Gaming Industry"
order = 1613
part = "Backend and Live Services"
tags = ["gaming", "backend", "microservices", "scalability", "load-testing"]
+++

The game server runs the match. Everything else a player touches is the backend: signing in, seeing what they own, joining a party, queueing, getting a server, chatting, buying a skin, collecting a reward when the match ends, and appearing in the right row of a dashboard tomorrow morning. A single-player game needs almost none of it. A competitive online game can't run for an hour without all of it, and the backend, not the game server, is usually what falls over on launch day.

This chapter is about the shape of that backend: what services it contains, how the split between game server and platform works, what studios have published about the languages, containers and deployment model they use, which parts you can buy and when I'd build instead, how launches have broken in public and how to load test for them, and how to ingest a match result exactly once, the one write every other service reacts to. Each domain's internals are in its own chapter (the table below says which). The game servers themselves (allocation, fleets, draining) are [Game Servers & Hosting](/books/gaming/game-servers); accounts and linked platforms are [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity). General service design lives in the playbook, starting with [Service Boundaries](/docs/architecture/service-boundaries).

## What the Backend Does

Every live game ends up with the same set of domains, whatever they're called internally. Each owns a slice of the core model from [The Games Business](/books/gaming/games-business#the-core-data-model):

| Domain | What it does | Owns | Chapter |
| --- | --- | --- | --- |
| Accounts and identity | Sign-in, linked platforms, sessions, account state | `accounts`, `platform_identities` | [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) |
| Entitlements and economy | What an account owns, grants, revocations, currency ledgers | `entitlements`, `item_instances`, `wallets`, `currency_ledger_entries` | [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements) |
| Store | Catalog, offers, purchases, receipt validation | `items`, orders, receipts | [Stores, Fees & Payments](/books/gaming/stores-and-payments), [Monetization Models](/books/gaming/monetization) |
| Parties | Who queues together, invites, leaders | `parties` | [Parties, Presence, Chat & Voice](/books/gaming/social-systems) |
| Matchmaking | Tickets, queues, ratings, match formation | ratings, tickets | [Matchmaking & Ranked](/books/gaming/matchmaking) |
| Provisioning | Picking a region and a server for a formed match | `game_servers` | [Game Servers & Hosting](/books/gaming/game-servers) |
| Presence, chat, push | Online status, friends, messages, server-to-client notifications | social graph | [Parties, Presence, Chat & Voice](/books/gaming/social-systems) |
| Game results | Recording what happened in a match, once | `matches`, `match_participants` | This chapter |
| Progression | Levels, passes, contracts, unlocks driven by results | per-game profile state | [Monetization Models](/books/gaming/monetization#battle-passes), [Live Operations](/books/gaming/live-operations) |
| Configuration | Runtime settings, feature switches, live-ops content | config versions | [Live Operations](/books/gaming/live-operations) |
| Telemetry | Events from client, server and services into the warehouse | event streams | [Telemetry & Analytics](/books/gaming/telemetry) |
| Conduct | Reports, penalties, appeals | `reports`, `penalties` | [Player Behavior & Moderation](/books/gaming/player-behavior) |

The table is also a boundary map. Each row owns its tables and nobody else writes them; the rule is the same one any service architecture uses ([Service Boundaries](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)). Games add two pressures that ordinary products don't have: traffic arrives in synchronized waves (a patch, a season start, every match in a tournament round starting at once), and the most important write in the system (a match result that grants rank, currency and progression) comes from a game server, not a person.

## Two Halves: Game Server and Platform

A studio and a hosting vendor describe the same split from opposite sides. In "Scalability and Load Testing for VALORANT" (December 15, 2020), Keith Gunning of Riot's VALORANT Core Services team separates the game server executable, which runs the frame-to-frame gameplay of matches in progress, from the platform: more than 30 microservices for parties, matchmaking, provisioning matches to datacenters by ping, storing game results, progression unlocks, store purchases and loadouts, which together with the game provisioners form what Riot calls a shard. Amazon GameLift's documentation draws the line from the hosting side: the game client authenticates with a backend service the studio builds, the backend asks GameLift to place a game session, and the client then connects directly to the game server, which reports its own readiness and health to the hosting service. GameLift calls the backend service a best practice because it keeps hosting credentials off the client.

The two halves touch at two moments. At match start the platform hands the game server a roster, a map, a mode and the loadouts it should trust; at match end the game server hands back a result. In between, the game server runs alone on its own tick, and the platform does nothing for that match. That narrow contract is what lets the two scale and deploy independently: the game server is a binary per build, sized in games per core ([Game Servers & Hosting](/books/gaming/game-servers)); the platform is a set of stateless services sized in requests per second, with state in their own databases.

My rule: keep the game server ignorant of the platform's internals. It receives a signed match description, it emits a signed result, and it calls nothing else in the hot path. A game server that queries the store mid-match ties the match's frame budget to a web service's tail latency.

## Languages, as Published

Few studios publish their service languages, and the posts that exist describe specific services at specific dates:

- **Riot.** "At Riot, our two primary languages for services are Java and Go" ("Leveraging Golang for Game Development and Operations", November 6, 2020). The same post and Gunning's load-testing post say VALORANT's backend services, and the harness that load tested them, are Go. Older League services include Java (the Loot service, a Java REST service with a small Go sidecar beside its Memcached cache, walked through in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#inventories)), and the chat and push servers are Erlang ([Parties, Presence, Chat & Voice](/books/gaming/social-systems#protocol-xmpp-or-your-own)).
- **Discord.** Built on Elixir from its first prototype, because "the Erlang VM was the perfect candidate for the highly concurrent, real-time system" it was building: each connected user is a session process, and each guild a process that fans events out to every connected session (Stanislav Vishnevskiy, July 6, 2017).
- **Adopted servers.** Nakama's server runtime takes Go, TypeScript or Lua modules, and Colyseus is a Node.js framework, so a team that adopts one inherits its languages for server code ([What You Can Adopt](#what-you-can-adopt)).

The pattern across them: the Erlang VM where a service holds huge numbers of long-lived connections (Riot's chat, Discord's sessions), a JVM or Go for request-response services, and the language following the team and the problem rather than a company standard.

The lesson I take is that the language matters less than the contract every service meets. The Twelve-Factor App states the portable form of that contract (one codebase with many deploys, config in the environment, stateless processes, fast startup and graceful shutdown, logs as event streams), and "Running Online Services at Riot: Part IV" (November 16, 2017, Maxfield Stewart) makes the same set a platform requirement, adding registration with discovery, health and metrics endpoints, and secrets fetched from a secret service. A team can pick Go or Java; it can't pick its own discovery.

## Running It: Containers and Deployment

Riot's "Running Online Services" series (2016 to 2020) is the most detailed public account of a game company's platform operations. Three of its points transfer to any backend:

1. **Desired state, not hand-built hosts.** Part I (2016) replaced hand-crafted environments with rCluster, a Docker-based internal cloud whose scheduler compares the containers actually running against JSON definitions and starts or stops containers to close the gap. It's the control loop Kubernetes is built on ("Each controller tries to move the current cluster state closer to the desired state"), and the one Agones extends to dedicated game server processes ([Game Servers & Hosting](/books/gaming/game-servers)). Riot ran in its own datacenters, in public clouds and in partner environments such as Tencent and Garena.
2. **A platform contract.** Part IV (November 2017) reports more than 10,000 containers in production and a discovery service with a preservation mode: when many clients stop heartbeating at once, it keeps their registrations and pages an operator, on the theory that a mass silence is a network failure rather than a mass death. Configuration is scoped key-value pairs a running service picks up without a redeploy, and secrets come from HashiCorp Vault.
3. **Ship the product, not the service.** Part VI (February 25, 2020) counts more than 14,500 containers in Riot-operated regions alone and deploys an environment: one declarative, immutably versioned specification of everything needed to deploy, configure and run a distributed product, deployed as a whole. Its stated reason is that independent, unaligned streams of change into a distributed system eventually cause preventable incidents; partner-run shards, with more developers and versions in flight, had more incidents traced to incompatible microservice versions.

The two container counts have different scopes, so I quote each with its date and don't compute a growth rate from them.

Versioning the set is one of two ways to keep many services compatible. The other is independent deploys against backward-compatible contracts: each service accepts the previous and next version of every API it serves, contract tests gate each deploy, and nothing ships as a set. Independent deploys are faster and suit services whose callers are other services. A game leans the other way, because a patch changes the client, the game server and several services at the same minute and the combinations that were tested are the only ones known to be safe, so my default for game services is to version the set, not the pieces ([Versioning a Set of Services Together](/docs/delivery/deployment-strategies#versioning-a-set-of-services-together)). In a game the set also pins the client and server build, so a shard runs exactly one environment version, a hotfix to one service is a new environment version, and the client a player can connect with is part of what rolls back. Shared platform services (accounts, entitlements) that every title calls still deploy independently, behind backward-compatible contracts.

## The Stack

Seen from a player's request, the backend is four layers. The edge terminates connections and absorbs abuse; platform services hold the shared, cross-game concerns; game services hold one title's rules; data sits underneath, owned per service.

![Exploded axonometric drawing of a game backend in four stacked layers, bottom to top. 01 data: per-service databases, caches, the event stream and the warehouse. 02 game services: parties, matchmaking, provisioning, game results, progression and store for one title. 03 platform services: accounts and sessions, entitlements, chat and presence, push, configuration and telemetry intake, shared across titles. 04 edge: CDN and DDoS protection, load balancers and the API gateway, where client requests arrive. A separate block beside the stack marks the game server fleet, which talks to the platform only at match start and match end. Notes give VALORANT's published edge (Cloudflare, then nginx) and its 30-plus platform services as one example.](/diagrams/gm-game-backend-stack.svg "The backend as four layers, with the game server beside it rather than inside it. Requests enter at the edge and go down; the game server meets the stack at two points, the match handoff and the result.")

A few placement decisions carry most of the weight:

- **Platform versus game services.** Accounts, entitlements, wallets, chat and telemetry intake are shared by every title a publisher runs, so they live once, above the game. Parties, matchmaking, provisioning, results and progression encode one game's rules and deploy with its patches. A publisher with one game still benefits from the split the day it ships a second ([The Games Business](/books/gaming/games-business#the-core-data-model)).
- **The edge is part of the backend.** Gunning's post says VALORANT's client requests pass through Cloudflare and then nginx for load balancing. Rate limits, bot filtering and the login queue all belong here, in front of anything that holds state.
- **Data split by owner, then by key.** VALORANT splits player data by owning service, so each service scales its own database, then into 64 tables by hashing the player ID, and divides background work into 256 shares listed in Redis so instances claim work without a coordinator. Discord partitions messages by channel plus a static time bucket, and puts data services in front of its database clusters that answer many simultaneous requests for the same row with one query (Bo Ingram, March 6, 2023). The key differs (player, channel, match); the rule is that no single database holds everyone, and that a hot key is absorbed before it reaches storage.
- **Scale services independently.** Gunning gives the contrast: the parties service runs many instances because players constantly join, leave and change party state, while the store runs few because purchases are rare. Size each service on its own traffic, not on concurrent players.

## Global and Regional Services

Games are latency-sensitive in play and indifferent to latency almost everywhere else, so the backend splits along that line. Two published designs show it from the outside:

- **Riot's developer API.** Account lookups are served from regional clusters (americas, asia, europe) that return identical account data, while League game data is routed by platform IDs such as `na1` and `euw1`, and Riot's developer FAQ (last updated October 30, 2023) says player data stays sharded to the League and TFT region.
- **Final Fantasy XIV's home Worlds.** Every character has a Home World inside a logical data center, inside a physical data center per region. Data Center Travel lets a character visit Worlds in other logical data centers of the same region, but a visitor can't sell on the market, create or join a free company, or create cross-world linkshells, and is returned home automatically after 30 days without logging in: the regional data stays with the home, and travel is a guest pass.

The opposite design exists too. CCP runs EVE Online as one worldwide shard, Tranquility, so every player shares one universe; the cost is that the whole game is one cluster, with no region to fail alone and every player's latency set by the distance to one location. A game whose design is a single shared world pays that price on purpose. For a session-based game, the split is the pattern I'd build:

| Global (one logical copy, replicated for reads) | Regional (one copy per shard, close to players) |
| --- | --- |
| Accounts, credentials, linked platforms | Parties, matchmaking queues, provisioning |
| Entitlements and wallets (one home, never split) | Match history and per-game profiles for that shard |
| Catalog and prices | Chat routing and presence for that shard |
| Penalties that apply everywhere | Game servers |
| Configuration source of truth | Telemetry intake (forwarded to a central warehouse) |

Two rules keep it honest. Money and ownership have exactly one home, even if reads are served from replicas everywhere; a wallet that lives in two regions will eventually double-spend. And regional services degrade alone: if one shard's matchmaking is down, sign-in, the store and every other shard keep working. Partner-operated regions add a third case, where the publisher ships a product and a partner runs it, which is where a versioned environment specification earns the most. Where a region's data must stay in the region by law, the account directory records the home region and the regional services hold the data ([GDPR](/docs/compliance/gdpr#international-transfers), [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)).

## What You Can Adopt

You don't have to build all of it. Platform services come first in any case: Steam, PlayStation, Xbox, Nintendo and the mobile stores already provide identity, friends, presence, entitlements for their own stores and certification rules you must meet, and your backend sits above them. Beyond those, the options fall into open-source servers, engine-vendor suites, commercial backends and generic app backends. Server hosting (Agones, GameLift, Multiplay, Hathora, Edgegap) is compared in [Game Servers & Hosting](/books/gaming/game-servers#hosting-options), matchmakers including Open Match in [Matchmaking & Ranked](/books/gaming/matchmaking#matchmakers-you-can-adopt), and networking libraries in [Netcode Fundamentals](/books/gaming/netcode).

As of October 2026, from each option's own documentation and pricing pages:

| Option | License and status | Self-host or managed | What it covers | Lock-in and export | Pricing shape |
| --- | --- | --- | --- | --- | --- |
| **AccelByte Gaming Services** | Proprietary | Fully managed SaaS, with a Public Cloud tier | A modular backend service catalog | Not documented on the overview pages; ask | AGS pricing isn't on the pages I opened; its server hosting is priced per VM hour or bare-metal month ([Game Servers & Hosting](/books/gaming/game-servers#hosting-options)) |
| **Beamable** | Proprietary | SaaS, or a dedicated single-tenant private cloud | Social, content, multiplayer, leaderboards, commerce and custom microservices, with Unity and Unreal SDKs | Not documented on the pages I opened; ask | 90-day free trial; Developer $125 a month (1,000 MAU), Studio $595 (30,000 MAU), Pro $1,895 (200,000 MAU), Enterprise from $3,500; extra API calls $100 per 10 million |
| **Colyseus** | MIT; active (release 0.18, August 25, 2026) | Self-host free, or Colyseus Cloud managed hosting | A Node.js framework for authoritative game servers: rooms, server-defined state synced to clients as binary delta patches, matchmaking into room instances | Low: your own code and infrastructure | Self-hosted: your own infrastructure; Colyseus Cloud's pricing isn't on its docs overview |
| **Epic Online Services** | Proprietary; maintained by Epic | Managed only | Engine-agnostic (any engine or none): lobbies, sessions, P2P, voice, stats, leaderboards, achievements, player and title storage, anti-cheat, reports, sanctions; Game Services need no Epic account, Epic Account Services (friends, presence, overlay) do | Product User IDs and the EOS SDK; keep your own account ID as the anchor | Free |
| **Firebase-style BaaS** (Firebase as the example) | Proprietary; maintained by Google | Managed only | General app services: authentication, a document database, functions, storage. No game concepts: parties, matchmaking, authoritative matches and ledgers are yours to build on top | Firestore's managed export writes documents to a Cloud Storage bucket, on the Blaze plan only | Spark is free with caps; Blaze is usage-billed. Authentication free to 50,000 MAU; Firestore free to 1 GiB stored, 50,000 reads and 20,000 writes a day |
| **Nakama** (Heroic Labs) | Apache License 2.0; actively released (v3.41.0, September 18, 2026) | Self-host the open-source server (needs CockroachDB or another Postgres wire-compatible database), or Heroic Cloud, managed hosting that bundles Nakama Enterprise licenses, or a private cloud in your own account | Accounts (social, email, device ID), storage, friends and groups, chat, parties, leaderboards and tournaments, purchase validation, matchmaker, and authoritative matches: runtime code in Go, TypeScript or Lua implements match handlers (init, join, loop, leave, terminate, signal) that the server calls at a fixed tick rate | Low when self-hosted: the data is in your own Postgres-compatible database. Server logic is written against Nakama's runtime APIs | Open source: your own infrastructure. Heroic Cloud: sized by CPU, with no DAU, MAU or CCU limits; support packages listed at $2,000 and $6,000 (the page doesn't give the period) |
| **PlayFab** (Microsoft) | Proprietary; maintained by Microsoft | Managed only, on Azure | Identity and account linking, title data, segmentation, experiments, CloudScript, catalog, stores, currencies, receipt validation, matchmaking, leaderboards, chat, events | PlayStream events export to Azure Blob Storage or Amazon S3; GDPR hooks to view and delete player data | Development Mode up to 1,000 lifetime players per title; pay-as-you-go ($0 a month), Standard ($99) or Premium ($1,999) for included meters, then metered; multiplayer servers billed separately |
| **Pragma** | Proprietary, with full source access from day one | Hosted environments | Accounts and social, commerce, player data, matchmaking, parties, live ops, telemetry, operator portals | Lower than most SaaS because you hold the source; the license is sized to the features you adopt | 30-day free trial; the Live Service plan starts at $6,000 a month including hosting, analytics, standard support and $1,000 of cloud credits; analytics free to 2 million events a month, then $25 per million |
| **Unity Gaming Services** | Proprietary; maintained by Unity | Managed only | Authentication (anonymous, platform, custom), Cloud Save, Cloud Code, Economy, Lobby, Relay, Leaderboards, plus Remote Config, Analytics, Matchmaker, Friends and Vivox voice and text | Unity's SDKs and service APIs; check each service's export path before integrating | Usage-based with free allowances: Authentication free; Cloud Save free to 5 GiB and 1 million writes and reads a month, then $0.50 per GiB and $0.025 per 10,000 writes; Cloud Code free to 1 million invocations, then $1.50 per million; Relay free to 50 average monthly CCU, then $0.16 per CCU; Leaderboards free for a limited time; Economy not priced on the page |

Vendors' own figures (Pragma's concurrency claims among them) are marketing, not audited numbers, and every price above changes; check the page on the day you decide.

### How I Decide

I decide by stage, and the triggers are events in the game's life rather than player counts:

- **Prototype and vertical slice.** Buy everything. A free tier (EOS, UGS, PlayFab Development Mode, Firebase) or Nakama in a local container gets a playable online build without a backend team. Nothing built here should be expensive to throw away.
- **Before the first real-money sale or the first linked platform.** Build the two pieces I'd build first anyway, even on a bought backend: the **identity mapping** (your own account ID, with every platform and vendor ID as a linked row) and the **entitlement ledger** (every grant, purchase, refund and spend as an append-only record you hold). They're small, and they're what make it possible to change vendors, merge accounts, answer a chargeback or move a player's purchases later ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#three-identity-models), [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#entitlements-are-the-source-of-truth)). A vendor's economy can still run the store; your ledger records every change by its idempotency key.
- **Soft launch and early access.** Keep buying the undifferentiated services: voice, relay, leaderboards, push, anti-cheat clients. Own what is the game's identity (matchmaking rules, progression, the game-result pipeline), even if it runs as server code inside the vendor's runtime (Nakama modules, Cloud Code, CloudScript), and keep that code portable.
- **Launch at scale, or a second title.** Move a service in-house when the vendor's rule language, cost curve or data model costs more than a team does. The usual order is results and progression, then matchmaking, then the store. Shared platform services (accounts, entitlements, wallets) move above the game so the second title reuses them ([The Games Business](/books/gaming/games-business#the-core-data-model)).
- **A multi-title platform.** The backend is now a product with its own team, and the questions are the ones in this chapter's earlier sections: a service contract, versioned environments and regional shards.

Two rules hold at every stage. Prefer options you can leave: open source you can self-host, or a vendor with a documented export, over one whose data you can't read. And read the free tier's cliff before you integrate, because a free service at launch is a priced service at scale.

## Launch Day

Launches fail in the same few ways, and the public record is unusually good:

- **Demand beyond any estimate.** Google Cloud's account of Pokémon GO (September 29, 2016, Luke Stone) says the teams planned for a target traffic level with a worst case of about five times that, and that traffic surged to 50 times the initial target, ten times the worst-case estimate. Before the Japan launch, Niantic and Google upgraded to a newer Google Kubernetes Engine version that allowed more than a thousand additional nodes in the cluster; sign-ups in Japan tripled the US launch two weeks earlier. The lesson isn't that forecasts are useless; it's that the worst case you design for has to be survivable at ten times itself, by admitting fewer players rather than falling over.
- **Hardware you can't buy in time.** Square Enix's notices on the *Final Fantasy XIV: Endwalker* launch (December 2021, Naoki Yoshida) say every World in every region hit its login cap for long periods and that simultaneous logins had reached the hardware limit. Error 2002 appeared when more than 17,000 players were already queued for a logical data center, so new players couldn't even join the queue. The December 15 response suspended sales and delivery of the Starter and Complete Editions and new Free Trial registrations, limited Free Trial players to off-peak hours with subscribers given login priority, cited a physical shortage of server equipment tied to semiconductor and material shortages, and granted 14 more days of game time on top of 7 already given.
- **Everyone at once.** Riot's postmortem of League's Clash tournaments (May 19, 2020, Tomasz Mozolewski) traces the December 2017 capacity problems in EU West to every tournament game starting at the same moment and overloading systems like champion select. The fixes are reusable: tournament tiers lock in at 30-minute intervals; game servers are sized to run at 70% CPU, because players start seeing latency and missed requests near 85%; the start rate is limited to 1.5 times the 99th percentile of typical peak starts per minute, with minimum and maximum clamps; and the capacity model counts each mode's real cost, since treating ARAM and TFT games like Summoner's Rift games misjudged capacity by roughly 10 to 20%.
- **A shared dependency that takes everything down.** Roblox's postmortem of its 73-hour outage from October 28 to 31, 2021 (January 20, 2022, Daniel Sturman with HashiCorp) found two causes in its Consul cluster: a newly enabled streaming feature that caused contention under heavy load, and a BoltDB performance pathology that made Raft log maintenance very slow. Telemetry depended on the same Consul cluster, so the team lost visibility exactly when it needed it. Roblox, then serving about 50 million players a day on more than 18,000 servers and 170,000 containers, brought players back through DNS steering in steps of roughly 10%, checking database load and cache health at each step. Its remediations included monitoring that doesn't depend on what it monitors, a second datacenter and dedicated Consul clusters for critical services.

![Dimensional sheet of published launch figures in three views. View A, a bar plan view on one scale: Pokémon GO's planned target T1 = 1x, the worst-case estimate W1 = 5 × T1, and actual traffic A1 = 10 × W1 = 50 × T1, highlighted. View B, a chain of load-test harness processes for VALORANT: H1 = 10,000 simulated players per process on four CPUs, N1 = 200 processes, C1 = H1 × N1 = 2,000,000 concurrent players per shard. View C, a CPU bar for League's Clash capacity model: U1 = 70% target, U2 = 85% where players see problems, and a hatched band above U2. A variable table defines each code and adds the start limit S1 = 1.5 × p99 of peak starts per minute and the FFXIV login queue cap, Q1 = 17,000 per logical data center.](/diagrams/gm-game-backend-launch-sheet.svg "Launch capacity in published numbers. Forecasts miss by an order of magnitude, so the design target is headroom plus admission control, and the load test has to reach the target before launch, not after.")

### Login Queues

A login queue is admission control with a user interface, at the edge of the account service in front of everything that holds state; the general design (capacity per scope, a ceiling on the queue, honest position, priority classes, reclaiming idle sessions, ramping after an outage) is in [Waiting Rooms & Admission Control](/docs/architecture/admission-control). What games add, from FFXIV's Endwalker launch:

- **The scope is a World or a logical data center,** each with its own concurrent-session and login-rate caps, so one popular World queues while its neighbors are empty, and moving players between Worlds is a lever the queue itself can't pull.
- **The ceiling shows up as an error code.** FFXIV's Error 2002 was the queue's ceiling: past 17,000 queued for a logical data center, new players were refused ([The Queue Has a Ceiling](/docs/architecture/admission-control#the-queue-has-a-ceiling)).
- **Priority follows the business model.** FFXIV gave paying subscribers priority over Free Trial players, and suspended Free Trial registration outright ([Priority Classes](/docs/architecture/admission-control#priority-classes)).
- **Idle in a game looks busy.** FFXIV logs out inactive players after 30 minutes and says emote loops and training-dummy attacks don't prevent it, so "idle" has to be defined by meaningful input, not by packets ([Reclaiming Idle Sessions](/docs/architecture/admission-control#reclaiming-idle-sessions)).

## Load Testing

Two public accounts describe load testing a game backend at two million concurrent players:

- **VALORANT's platform.** The goal was at least two million concurrent players per shard. A Go harness simulated 10,000 players per process on four physical CPUs, so two million needed about 200 processes, run as Docker containers; a mock game server stood in for real matches, and simulated players were created at a configurable rate approximating the real login rate. The team doubled the target each cycle, fixing what broke, and reached two million against a test shard with less than two weeks to go before launch.
- **Nakama on Heroic Cloud.** AWS's account of Code Wizards' test (Carl Prescott, October 1, 2024) used the open-source Artillery tool on up to 25,000 AWS Fargate nodes, ramped over about 50 minutes to more than two million virtual players. Each ran a scenario rather than a request: authenticate, create an account, open a WebSocket, then for four hours either chat every 10 to 20 seconds or spend wallet currency and add inventory items every 60 to 120 seconds. The post's advice is to choose the scenarios and the key metrics, with thresholds, before the test.

Riot's Clash postmortem shows the other side: a full replica of the largest shard was judged very expensive and about three more months of work, so testing was limited, and the limited test missed the synchronized start.

What I take from both:

- **Simulate behavior, not requests.** A simulated player signs in, joins a party, queues, plays a mock match, collects a result, browses the store and leaves, at realistic rates and with realistic think times. A load test that hammers one endpoint finds that endpoint's limit and nothing about the system.
- **Test the waves.** Model the synchronized events: patch day logins, a season reset, a tournament round, a server restart reconnecting everyone. Clash failed on a wave, not on steady load. Model each wave at its real rate, though: Edgegap's load-testing guide (January 13, 2026) calls loading an entire player base over a few minutes a common mistake that overestimates the server deployments per second a launch needs.
- **Mock the game server, not the platform.** The game server's cost is measured separately in games per core; the platform test needs fake servers that start, run for a match length and report results.
- **Grow the target in steps, and finish with margin.** Doubling, as VALORANT did, finds the next bottleneck at each step; the test is done when it reaches the target before launch, not after.

The general method is in [Load Testing](/docs/quality/load-testing).

## How to Build It

The services are bounded around the core model; most of the design is in which service owns which table and how the others learn about changes. Synchronous calls are for what a player is waiting on (sign-in, a purchase, joining a party); everything downstream of a fact (a result granting progression, a purchase updating telemetry) is an event ([Events & Async Messaging](/docs/architecture/events)).

### Game Results, Exactly Once per Match

The result is the most valuable write in the system and the easiest to double-count. A game server can crash after sending it, retry on a timeout, or be replaced mid-match; a ranked service, a progression service and a wallet all react to it. So the result is ingested once per match, keyed by the match, and everything downstream keys on that:

```sql
CREATE TABLE match_results (                -- one accepted result per match
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  match_id          UUID NOT NULL REFERENCES matches (id),
  game_server_id    UUID NOT NULL REFERENCES game_servers (id),  -- who reported it
  build_id          UUID NOT NULL REFERENCES builds (id),        -- the server build that ran it
  payload           JSONB NOT NULL,           -- per-participant outcome, stats, duration
  payload_hash      TEXT NOT NULL,            -- sha-256 of the canonical payload
  status            TEXT NOT NULL CHECK (status IN ('accepted', 'voided')),
  voided_reason     TEXT,                     -- e.g. cheating confirmed, match undone
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (match_id),
  CHECK ((status = 'voided') = (voided_reason IS NOT NULL))
);

CREATE TABLE match_result_submissions (     -- every attempt, kept for diagnosis
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  match_id       UUID NOT NULL REFERENCES matches (id),
  game_server_id UUID NOT NULL REFERENCES game_servers (id),
  payload_hash   TEXT NOT NULL,
  outcome        TEXT NOT NULL CHECK (outcome IN ('accepted', 'duplicate',
                   'conflict', 'rejected')),
  received_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The match's own life cycle, in the core `matches.status`, is short: `forming` while the matchmaker and provisioner assemble it, `in_progress` once the assigned server reports the match started, then `completed` when a result is accepted or `abandoned` when none arrives. Both end states are terminal; a voided result doesn't reopen the match. The ingestion rules:

- **First valid result wins.** Insert into `match_results` with the match's unique constraint. A second submission with the same hash is a `duplicate` and gets the original's response; with a different hash it's a `conflict`, recorded and alerted, never applied. The pattern is ordinary idempotency, applied with the match ID as the key ([Idempotency](/docs/payments/idempotency)).
- **Trust only the assigned server.** The result must come from the `game_server_id` the provisioner assigned to that match, authenticated with the server's own credential, for a match in `in_progress`. Anything else is `rejected`. A result a client can submit is a result a cheater can submit.
- **One transaction, then events.** Accepting the result, setting `matches.status` to `completed`, writing each `match_participants.result` and adding a `match.completed` event to the outbox happen in one transaction ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)). Ranked, progression, wallets, telemetry and anti-cheat consume the event, each idempotent on the match ID ([Events & Async Messaging](/docs/architecture/events#consumers-are-idempotent)). A reward ledger entry's idempotency key is derived from the match and the reward, so a replayed event can't grant twice.
- **Voiding is a new fact, not a delete.** When a match is undone (a confirmed cheater, a server fault), the result is marked `voided` with a reason and a `match.voided` event lets each consumer reverse its own effect: ranked writes a reversal ([Matchmaking & Ranked](/books/gaming/matchmaking#how-to-build-it)), the wallet writes a reversing transaction. For a cheating case, `voided_reason` names the case, so the case and the result point at each other ([Anti-Cheat](/books/gaming/anti-cheat#enforcement-bans-hardware-bans-and-appeals)). Nothing rewrites history ([Audit Trails](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Abandoned matches end too.** A match whose server dies without reporting is closed by a timeout job as `abandoned`, with its own event, so parties are freed and nobody waits for a result that will never come ([Background Jobs](/docs/architecture/background-jobs)).

### Service Rules

- **Degrade by feature.** If the store is down, players can still play; if chat is down, matches still start. Decide in advance which features each dependency failure turns off, and test it.
- **Retries only where safe,** with timeouts, budgets and jittered backoff ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)). In a game backend, the retry storm after a blip is the usual way a small incident becomes a large one.
- **Monitoring outside the blast radius.** Roblox's lesson: telemetry that depends on the failing system goes dark with it ([Observability](/docs/operations/observability)).

## What This Means for the System You Build

- **Two halves with a narrow contract:** a game server that receives a signed match description and returns a signed result, and a platform of services that does everything else and nothing in the match's hot path.
- **Services bounded around the core model,** each owning its tables, with platform services shared across titles and game services deployed with each game's patches.
- **Global identity and ownership, regional play,** with money and entitlements in exactly one home and every regional service able to fail alone.
- **Versioned environments:** client build, server build, service images and config overrides deployed and rolled back as one set per shard.
- **Admission control at the edge:** login capacity per scope, a bounded queue with honest positions, priority as configuration, idle reclamation and stepped ramps after outages.
- **Launch-scale load tests that simulate behavior and waves,** grown in steps and finished with margin before launch.
- **Game results ingested once per match,** from the assigned server only, in one transaction with an outbox event, voided by new facts rather than deletes.
- **Adopted services chosen by stage,** open source or exportable where possible, with the identity mapping and the entitlement ledger built in-house before the first sale, whatever else is bought.

## References

**Reference**

- [Epic Games: Epic Online Services overview](https://dev.epicgames.com/docs/epic-online-services/eos-overview), free cross-platform services, Game Services through the Connect Interface without an Epic account, Epic Account Services through the Auth Interface, the service list and KWS as a separate service set
- [Microsoft Learn: What is PlayFab?](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), the managed backend's services: account linking across networks, title data, CloudScript, catalog and receipt validation, matchmaking, dedicated servers, PlayStream and event export
- [Unity: Unity Gaming Services](https://docs.unity.com/ugs/en-us/manual/overview/manual/unity-gaming-services-home), the LiveOps and Multiplayer service lists and authentication options
- [Valve: Steamworks features](https://partner.steamgames.com/doc/features), matchmaking, networking, inventory, leaderboards, cloud and ownership verification
- [Heroic Labs: Nakama](https://github.com/heroiclabs/nakama), the open-source game server's Apache-2 license, Postgres wire-compatible database requirement, Lua, TypeScript and Go runtime and feature list
- [Heroic Labs: Nakama releases](https://github.com/heroiclabs/nakama/releases), v3.41.0 as the latest release (September 18, 2026)
- [Heroic Labs: Authoritative multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/), the seven match handler functions, the fixed-rate match loop and Go, TypeScript and Lua runtimes
- [Heroic Labs: Heroic Cloud](https://heroiclabs.com/heroic-cloud/) and [pricing](https://heroiclabs.com/pricing/), managed or private-cloud hosting with Nakama Enterprise licenses, CPU-sized plans without DAU, MAU or CCU limits, and support packages
- [Unity: Gaming Services pricing](https://unity.com/products/gaming-services/pricing), free allowances and usage rates for Authentication, Cloud Save, Cloud Code, Lobby, Relay and Leaderboards
- [Microsoft: PlayFab pricing](https://developer.microsoft.com/en-us/games/products/playfab/pricing/), Development Mode limits, the pay-as-you-go, Standard and Premium plans and metered usage
- [Pragma: Pricing](https://pragma.gg/pricing), the free trial, the Live Service plan, source access and license sizing
- [Beamable: Pricing](https://beamable.com/pricing), trial, MAU-based plans and API call pricing
- [AccelByte: AMS pricing](https://accelbyte.io/ams-pricing), server hosting per VM hour or bare-metal month and the AGS Public Cloud trial
- [Google: Firebase pricing](https://firebase.google.com/pricing), the Spark and Blaze plans, Authentication and Firestore free allowances
- [Google: Export and import data in Firestore](https://firebase.google.com/docs/firestore/manage-data/export-import), managed export to Cloud Storage on the Blaze plan
- [Colyseus: Documentation](https://docs.colyseus.io/), an open-source Node.js framework for authoritative game servers, rooms, delta state sync, matchmaking and Colyseus Cloud
- [Colyseus on GitHub](https://github.com/colyseus/colyseus), the MIT license and release 0.18 (August 25, 2026)
- [AccelByte: Getting started](https://docs.accelbyte.io/gaming-services/getting-started/), AccelByte Gaming Services as a fully managed SaaS backend
- [Pragma](https://pragma.gg/), its service list, hosted environments with full source, and its own concurrency claims
- [Beamable](https://beamable.com/), SaaS backend, single-tenant private cloud, serverless game APIs and engine SDKs
- [Amazon GameLift Servers: How hosting with Amazon GameLift Servers works](https://docs.aws.amazon.com/gamelift/latest/developerguide/gamelift-howitworks.html), the game client, a studio-built backend service and the game server as separate components, the backend as a best practice that keeps credentials off clients, and the join flow
- [The Twelve-Factor App](https://12factor.net/), the portable service contract: one codebase, config in the environment, stateless processes, disposability and logs as event streams
- [Kubernetes: Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), control loops that move current cluster state toward desired state
- [Agones: Overview](https://agones.dev/site/docs/overview/), an open-source library that extends Kubernetes to run and scale dedicated game servers
- [Square Enix: FINAL FANTASY XIV Travel Guide (Data Center Travel)](https://na.finalfantasyxiv.com/lodestone/playguide/contentsguide/datacentertravel/), Home Worlds, logical and physical data centers by region, features unavailable to visitors and the automatic return after 30 days
- [Edgegap: How to Run a Load Test for any Online Multiplayer Game](https://edgegap.com/blog/how-to-run-a-load-test-for-any-online-multiplayer-game), loading a whole player base in minutes as a common mistake that overestimates deployment rate (January 13, 2026)

**In practice**

- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), the game server versus platform split, shards, 30-plus services, Go, the edge, data splitting, the 2 million player target and harness (Keith Gunning, December 15, 2020)
- [Riot Games: Leveraging Golang for Game Development and Operations](https://www.riotgames.com/en/news/leveraging-golang-game-development-and-operations), Java and Go as Riot's primary service languages and VALORANT's Go backend (Aaron Torres, Chad Wyszynski and Justin O'Brien, November 6, 2020)
- [Riot Games: Running Online Services at Riot, Part I](https://www.riotgames.com/en/news/running-online-services-riot-part-i), rCluster's desired-state scheduling, partner environments and the Loot service in Java with a Go sidecar (Jonathan McCaffrey, September 23, 2016)
- [Riot Games: Running Online Services at Riot, Part IV](https://www.riotgames.com/en/news/running-online-services-riot-part-iv), the microservice contract, discovery with preservation mode, runtime configuration, Vault-backed secrets and the 2017 container count (Maxfield Stewart, November 16, 2017)
- [Riot Games: Running Online Services at Riot, Part VI](https://www.riotgames.com/en/news/running-online-services-riot-part-vi), container counts in Riot-operated regions and deploying a product as one versioned environment (Nicolas Tittley and Ala Shiban, February 25, 2020)
- [Riot Games: Chat Service Architecture: Servers](https://www.riotgames.com/en/news/chat-service-architecture-servers), Erlang chat servers, Mnesia and MySQL or Riak storage (September 23, 2015)
- [Riot Games: Riot Messaging Service](https://www.riotgames.com/en/news/riot-messaging-service), server-to-client push in Erlang and Riot's language mix (Michal Ptaszek, February 28, 2017)
- [Riot Games: Deep Dive into the Clash Crash](https://www.riotgames.com/en/news/deep-dive-clash-crash), synchronized game starts, the 70% CPU target, start limits at 1.5 times p99 and 30-minute tiers (Tomasz Mozolewski, May 19, 2020)
- [Riot Games: League of Legends developer docs](https://developer.riotgames.com/docs/lol), regional clusters returning identical account data and platform routing for game data
- [Riot Games: Summoner Name to Riot ID FAQ](https://developer.riotgames.com/docs/summoner-name-to-riot-id-faq), player data sharded to the League and TFT region (October 30, 2023)
- [Discord: How Discord Scaled Elixir to 5,000,000 Concurrent Users](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users), Elixir on the Erlang VM from the first prototype, session and guild processes and fan-out (Stanislav Vishnevskiy, July 6, 2017)
- [Discord: How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages), partitioning by channel and time bucket, and data services that coalesce identical concurrent reads (Bo Ingram, March 6, 2023)
- [CCP Games: Full Suite of Upgrades to the Tranquility DB](https://www.eveonline.com/news/view/full-suite-of-upgrades-to-the-tranquility-db-yippie), EVE Online's single worldwide shard (CCP Yokai, March 24, 2011)
- [AWS for Games: How Code Wizards load tested Heroic Labs' Nakama to two million concurrent players](https://aws.amazon.com/blogs/gametech/how-code-wizards-load-tested-heroic-labs-nakama-to-two-million-concurrent-players-with-aws/), Artillery on 25,000 Fargate nodes over about 50 minutes, the player scenarios and choosing metrics and thresholds first (Carl Prescott, October 1, 2024)
- [Google Cloud: Bringing Pokémon GO to life on Google Cloud](https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud), traffic at 50 times target and 10 times the worst case, and the GKE upgrade before the Japan launch (Luke Stone, September 29, 2016)
- [Square Enix: Ongoing Congestion Situation and Compensation](https://na.finalfantasyxiv.com/lodestone/news/detail/1c59de837cc84285ad1cdb4c9a9cad782363f25b), the login cap, Error 2002 at 17,000 queued players, the hardware limit and 30-minute idle logout (Naoki Yoshida, December 2021)
- [Square Enix: Response to Congestion (as of Dec. 15)](https://na.finalfantasyxiv.com/lodestone/news/detail/e7388986bc24d5a1337e0beed057f7b5b78b9bb3), suspended sales and Free Trial registrations, subscriber priority, the server equipment shortage and 14 more days of compensation (December 2021)
- [Roblox: Roblox Return to Service 10/28-10/31 2021](https://about.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021), the 73-hour outage, Consul streaming and BoltDB causes, the telemetry dependency, stepped DNS ramp and remediations (Daniel Sturman et al., January 20, 2022)
