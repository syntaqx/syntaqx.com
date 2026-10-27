+++
title = "Game Clients & Launchers"
description = "What a game's front-end client and launcher do, how League's client moved from Adobe AIR to web tech and plugins, what that cost, and how to build one."
category = "Gaming Industry"
order = 1605
part = "Clients and Delivery"
tags = ["gaming", "game-clients", "launchers", "cef", "desktop", "game-ui", "performance"]
+++

A player who opens a PC game rarely starts with the game. They start with a client: a desktop program that signs them in, shows the store, the friends list and their collection, patches the game, and finally starts the game executable and steps aside. That program runs for hours, often longer than any match, and it's where most of a live game's features show up first. It's also software that many teams change at once, on a release cadence set by the game, and that players judge by how long it takes to open.

This chapter covers that front end: what clients and launchers do, the best-documented public example of building one (the League of Legends client update, which Riot described in engineering posts in 2016 and 2017 and measured in public from 2020 to 2021), the other launchers players use, the UI technology inside games, and how to build a client of your own. The engine itself, its frame loop and in-game rendering belong to [Building Your Own Engine](/books/gaming/building-an-engine); moving bytes to players belongs to [Patching & Content Delivery](/books/gaming/patching); sign-in and platform accounts belong to [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity).

## What a Client Does

A front-end client (also called the out-of-game client, as opposed to the game client that renders a match) is the part of the game a player uses between matches. Its jobs, roughly in the order a session touches them:

- **Sign-in and session.** Authenticate the account, restore a session, and keep it alive. Platform sign-in (Steam, Xbox, PlayStation, Epic) happens here when the game runs on someone else's store ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)).
- **Patching.** Check for a new version of the client and the game, download it, verify it and repair damaged installs ([Patching & Content Delivery](/books/gaming/patching)).
- **Store and collection.** Show what's for sale and what the player owns: characters, skins, emotes, passes. The store screen is a view onto the entitlements and wallet services ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)).
- **Social.** Friends, presence, invites, parties and chat, which must keep working while the player is in a match ([Parties, Presence, Chat & Voice](/books/gaming/social-systems)).
- **Pre-game flow.** Queues, lobbies and champion or loadout selection, which talk to matchmaking ([Matchmaking & Ranked](/books/gaming/matchmaking)).
- **Launching the game.** Start the game executable with what it needs to join a server, then reduce itself to a background process until the match ends.
- **Post-game.** Results, progression, rewards, and the way back to the queue.

A **launcher** is the narrower version: install, patch and launch, plus news and a store page. Steam, the Epic Games Launcher, the EA app and the Riot Client are launchers that host many games; a game's own client sits behind the launcher and owns the game-specific screens. Some games skip the separate client and draw all of this inside the engine, with the in-game UI technology covered later in this chapter. The choice is mostly about who builds the screens and how often they change: a client that changes every two weeks, built by many teams, pulls toward web technology; a console game whose menus ship with the game pulls toward the engine's own UI.

## The League Client Update

Riot's 2016 post "The Architecture of the League Client Update", by software architect Andrew McVeigh, is the most detailed public account of building a game client on web technology, and it's worth reading in full. The facts below are Riot's, from that post.

The original League client was built in 2008 on Adobe AIR and used an RTMP session-based protocol to talk to Riot's servers. AIR gave a small team rich multimedia, animation and cross-platform support. By 2015, Riot named three problems:

1. **HTML5 had become a standardized, widely adopted platform,** with standard tooling and a large pool of developers who knew it.
2. **Players wanted to stay connected in and out of game,** and the AIR client used too many resources to keep running in the background.
3. **Teams kept colliding.** The codebase suited a small team, not many teams adding features at once.

Riot considered reorganizing the AIR code and chose a platform change instead, with the Chromium Embedded Framework (CEF) as the front end. CEF is a BSD-licensed project, founded by Marshall Greenblatt in 2008, for embedding Chromium-based browsers in other applications; its own description lists "a light-weight native 'shell' application that hosts a user interface developed primarily using Web technologies" as a use case, which is exactly this one.

The architecture took four steps to settle, and the steps are the useful part:

- **All JavaScript, rejected.** The first version had a small C++ library that let JavaScript make RTMP calls, with ember.js for the UI and ember-orbit as the data layer. Asynchronous handling and player state in JavaScript made the code complex and memory-heavy, and an internal survey found developers less productive than on the AIR client.
- **C++ services on the desktop.** Riot moved communication into a C++ "foundation": microservices running on the player's machine that presented the server protocol as REST resources and pushed events to the UI over WebSockets. The foundation held the canonical state, so the UI could rebuild itself with GET requests. When the client was minimized, the UI and its JavaScript VMs could shut down while the foundation, at about 20 MB, kept running and could still show invite notifications. That answered the second problem directly.
- **Plugins.** Each feature became a plugin: an independent unit of ownership, development, testing and deployment, versioned with semver and declaring the plugins and versions it depends on. Front-end plugins hold UI; back-end plugins hold C++ communication logic. Which plugins load depends on the player's entitlements, such as regional features or game access. Each front-end plugin got its own resource cache, and ember-orbit was retired. That answered the third problem.
- **Framework per plugin.** The JavaScript framework became each front-end plugin's own choice, though most features stayed on Ember.

One developer called the result a "datacenter in a desktop," and the post compares it with GitHub's Atom editor, also built on Chromium. After the plugin architecture landed, Riot's developer survey had "improved by around 15%" and was rising.

### A Build Is a List of Plugins

Riot's 2017 follow-up, "Under the Hood of the League Client's Hextech UI" by Jules Glegg, describes how the plugin model works day to day. A build of the client "is expressed as a list of units called plugins": a JSON file of plugin names and versions, such as `rcp-be-login`, `rcp-be-lol-patcher`, `rcp-fe-audio` and `rcp-fe-lol-navigation`. "Back-end plugins that deal purely with data are written as C++ REST microservices"; front-end plugins are JavaScript apps that run in CEF, which ships with the client. The build system assembles a client only "as long as the list of plugins satisfies each plugin's dependencies and doesn't contradict itself," and each plugin "uses Semver to communicate changes in its API."

At runtime a front-end plugin waits for an init event, registers its public API and asks for its dependencies by name. Dependencies "flow upwards": a feature registers itself with shared systems such as navigation, rather than navigation knowing every feature. The post covers several problems any multi-team web client meets:

- **Framework versions.** Riot supports "a small list of Ember versions," retiring an old one before adding a new one, and loads them side by side with a custom Webpack loader that captures each library's globals so versions don't collide.
- **Shared code and memory.** Shared NPM libraries are compiled into a shared plugin so they're loaded once, and shared UI components are "native Custom Elements with heavy usage of Shadow DOM."
- **Data.** REST handles one-shot calls, and "a WebSocket that allows the front-end plugins to observe back-end plugins for changes" handles live state, wrapped in a small data-binding library with `get` and `observe`.
- **Media.** Audio runs on Web Audio channels with ducking; video is affordable because assets are patched to local disk.

The goal is stated plainly: League "puts new things in the hands of players every 2 weeks," and the build system is meant to let the client scale "to many dozens of teams all working on the same client at once."

![Exploded axonometric of a desktop game client in four plates. At the bottom, separated by a gap, the game process: a separate executable with its own loopback API. Above it the plugin host, which loads plugins from a build manifest by semver and entitlements; then local services, the back-end plugins holding canonical state; then the web UI, a CEF renderer running front-end plugins. Side notes mark REST and WebSocket between UI and services and a token handed to the game at launch. A table lists Riot's published memory figures: about 20 MB for the 2016 desktop services, and front-end memory per session at the median falling from 597 MB on CEF 74 to 275 MB on CEF 91, a 322 MB saving.](/diagrams/gm-client-architecture.svg "The client as a small datacenter: a host process, local services that own state, a disposable web UI on top, and the game as a separate process. Memory figures are Riot's.")

## What the Architecture Cost, and the Cleanup

An architecture like this moves costs around rather than removing them. Every plugin and framework instance a client loads at startup costs time and memory on the player's machine, and an embedded browser is a large dependency that has to be kept current. Riot's League team measured those costs in public in a series of "Client Cleanup" dev posts from 2020 to 2021, which make an unusually concrete record of what a web-tech game client has to manage at scale.

The campaign opened on March 2, 2020, with Riot acknowledging too many bugs, too much lag (especially in champion select), memory leaks, crashes and freezes. It set targets: bootstrap (startup to a usable client) under 15 seconds even on relatively slow machines, about 15 seconds at the 90th percentile, against times of up to 40 seconds for many players; and champion-select lock-in at about 100 ms for the 90th percentile, against about 300 ms at the median, 450 ms at the 70th percentile and 800 ms at the 90th. Riot named the causes as it saw them: bootstrap loaded "41 separate plugins and 16 apps," each taking "anywhere from 100ms to 800ms" to start, and champion-select actions spawned apps that piled up over a session. It also said where the deepest problem was: "The real, root problem in champ select is the way that our backend systems manage data."

The May 2020 update found something worth remembering for any plugin system. A mechanism called Affinity decided which plugins had to load before bootstrap completed, and "at some point during 2018" it had been "inadvertently broken," so "the client is defaulting to loading every single plugin during bootstrap" (and after games). Riot added that even when Affinity worked, it hadn't prioritized plugin loading efficiently, and planned to replace it. The lesson isn't specific to League: a boot set that nobody tests will drift until it's everything.

The 2020 recap, published February 5, 2021, reported the results:

| Measure (Riot, League client) | Before | After |
| --- | --- | --- |
| Bootstrap | 29.5 s at the start of 2020 | 16 s for 90% of players |
| Ember apps loaded at bootstrap | Baseline | 63% fewer |
| Plugins in the client | Baseline | 57% fewer |
| Out-of-memory crashes | 193,000 per patch before the fixes in 10.23 | 55% fewer by patch 10.25 |

Riot also reported 175 bugs fixed and 30 memory leaks addressed in 2020. Patch 10.25 still saw 2.2 million client crashes across 16 regions, and Riot concluded that "the best option for us to address the majority of crashes is to upgrade our version of Chromium."

![Two timeline plan views. The first, at 1 second to 20 pixels, shows Riot's published League client bootstrap times: B0 of 29.5 seconds at the start of 2020 and B1 of 16.0 seconds for 90 percent of players as reported in February 2021, with a goal line G1 at 15 seconds, 1.0 second short of B1. The second, at 1 second to 40 pixels, splits an illustrative 15-second budget into seven parts: process start and self-update check 1.00, session restore 2.00, local services ready 1.50, boot-set plugins 4.50, first data 3.00, home screen 1.50 and headroom 1.50, summing to 15.00. A variable table defines each code.](/diagrams/gm-client-startup.svg "Startup as a budget. The published numbers are Riot's; the split of the 15-second goal is illustrative, and it only holds if everything outside the boot set waits until the home screen is usable.")

### Keeping the Embedded Browser Current

In April 2021 the client was on CEF 74, last updated in November 2019, and Riot called updating CEF "the single most impactful individual change we can make to improve the client." The update needed preparation: the team first had to update its web components so they wouldn't break on the newer engine, and the target moved from CEF 90 to CEF 91 along the way. The April post also expected WebSocket transfers up to 4.1 times faster on Windows and 7.8 times faster on Mac, and corrected an earlier figure: JavaScript errors stood at 140 million per patch, and the 265 million reported for 10.25 had been a measurement mistake, not a change in what players saw.

CEF 91 shipped in patch 11.17. Riot's September 20, 2021 post published the effect:

| Measure (Riot, League client) | CEF 74 | CEF 91 |
| --- | --- | --- |
| Client crashes per patch | 3,161,145 (11.16) | 1,214,155 (11.17), 61% fewer |
| Front-end memory per session, p20 | 359 MB | 74 MB |
| Front-end memory per session, p50 | 597 MB | 275 MB |
| Front-end memory per session, p90 | 1,016 MB | 598 MB |
| CPU, p20 / p50 / p90 | 13% / 34% / 83% | 10% / 22% / 72% |

The 11.17 crash count was also 38% below the 2021 average to that point. The top remaining crash cause was machines running out of memory, and almost half of those were old PCs on Windows 7. Riot's stated next step was "a more frequent update schedule" for CEF, plus WebAssembly and Web Workers.

Read together, the posts are a practical checklist. Startup cost grows with the number of things loaded at boot, so the boot set needs an owner and a test. An embedded browser is a dependency like any other, and an old one costs crashes and memory, so schedule its upgrades instead of waiting for them to become a project ([Dependencies](/docs/engineering/dependencies)). Count crashes and errors per release, check the counting, and publish targets in percentiles, because the slowest tenth of machines is where a client's reputation is made.

## One Client for Every Game: The Riot Client

On September 16, 2021, Riot announced that "all desktop Riot games will be accessible from one client": a game library, a landing page per game with news and event previews, and install and patch from each game's page. Rollout began September 20, 2021, with a worldwide launch planned for October 4, and upgrading needed no separate download or install.

On May 19, 2023, Riot added opt-in background patching: the Riot Client downloads and installs patches while it's open. In that first version only VALORANT updated fully in the background; League, Legends of Runeterra and TFT "update partially within their game clients," so the part the Riot Client handles patched in the background and the rest still happened in each game's client. The arrangement is a common one: a shared launcher owns sign-in, the library and the common patching path, while each game's own client keeps the game-specific screens and any game-specific update steps.

## Local APIs: What Riot Supports and What It Doesn't

A client built from local services has an API on the player's machine, and players' tools will find it. Riot's developer portal is explicit about where it stands. The League Client API (LCU) is "a set of protocols that the Chromium Embedded Framework (CEF) uses to communicate with a C++ Library," running locally on the desktop, and "this service is not officially supported for use with third party applications." For unsupported services Riot provides "no guarantees of full documentation, service uptime, or change communication." A January 24, 2019 policy update from Riot Developer Relations went further: "Only endpoints on our approved list are allowed for use by developers," developers had to contact Riot before releasing an app or update that uses the LCU, and players in Korea were barred from LCU-based apps for the time being.

The supported surface is in the game process, not the client. The Game Client API is served over HTTPS at `https://127.0.0.1:2999` with a self-signed certificate (Riot publishes the root certificate to validate it). Its Live Client Data API exposes a running game's state under `/liveclientdata/`, with endpoints such as `allgamedata`, `activeplayer`, `playerlist` and `eventdata`, and the Replay API, off by default and enabled with `EnableReplayApi=1` in `game.cfg`, controls the camera and playback of replays. The policy around both is the important part: "If your product serves players, you must register it with us," and "Products must not use or incorporate information not present in the game client that would give players a competitive edge."

That split is a good default for any studio. Internal local APIs change every release and stay unsupported; a small, documented, read-only surface for overlays, stats and broadcasting tools is supported, versioned and governed by policy ([Esports & Spectating](/books/gaming/esports-and-spectating) uses the same kind of surface; [Anti-Cheat](/books/gaming/anti-cheat) owns where information stops being fair).

## Other Clients and Launchers

Public engineering detail on other launchers is thin. What the companies themselves say:

- **Steam.** Valve's June 14, 2023 client update put "a good portion of the work" into "significant improvements under-the-hood," "including changes to how we share code across Steam Desktop, Steam Deck, and Big Picture Mode," and enabled hardware acceleration on Mac and Linux. Valve's post doesn't name the UI technology, so I don't either.
- **Epic Games Launcher.** On October 14, 2026 Epic released a preview of a rebuilt launcher for Windows, macOS and Linux. Press coverage (secondary; Epic's help page wasn't reachable) reports Epic's own claim of a 5.47-second cold start against 10.07 seconds for Steam, and that Epic recommends the legacy launcher for competitive games during the preview.
- **EA app.** EA calls it "our fastest and lightest PC client to date" and promises that "with automatic game downloads and background updates you can ensure that your games are ready to play when you are." EA publishes no benchmarks.
- **Xbox app on PC.** A June 2020 report (secondary, Thurrott) quotes Microsoft's Megan Spurr saying the team had "rebuilt the Xbox (Beta) app from Electron to React Native," using a third of the memory.
- **Battle.net and Ubisoft Connect.** I found no first-party technical sources for either.

The pattern across these is the one Riot documented: launchers compete on cold start, memory while a game runs, and keeping games patched without the player waiting.

## UI Technology Inside the Game

In-game UI (menus, HUDs, the store inside the game) has its own lineage, and a game that renders its front end in the engine picks from these:

| Technology | What it is (per its makers) | Notes |
| --- | --- | --- |
| Scaleform | Flash-based game UI middleware | Autodesk stopped selling it in July 2017, honoring maintenance contracts and giving customers the final source (PocketGamer.biz, secondary) |
| Coherent Gameface | "a game UI middleware" with HTML, CSS and JavaScript authoring | Its layout engine "is not a 'WebView' and is not based on WebKit/Chromium/Gecko/IE"; integrations for custom engines, Unreal and Unity |
| Ultralight | "a GPU-accelerated toolkit for embedding HTML in games and native apps," "a custom fork of WebKit" | Single-process; vendor figures of 9 MB of RAM on Windows against 72 MB for Chromium or Electron; same team as Awesomium |
| CEF in the game | Chromium rendering "off-screen" into a custom drawing framework, one of CEF's listed uses | Full browser compatibility at a browser's memory cost |
| Unreal Slate and UMG | Slate is Epic's "completely custom and platform agnostic user interface framework" for the editor and in-game UI; UMG widgets are "wrapped Slate controls that are exposed to UObjects" | Built in, designer-friendly through Widget Blueprints |
| Unity uGUI and UI Toolkit | Unity's manual recommends uGUI for a list of runtime cases; UI Toolkit (UXML and USS, a "web-like approach") is recommended for complex editor tools and "in active development" | Check the current manual's comparison before choosing |

The tradeoff is the one the League team weighed at desktop scale. Web-style authoring gets a large talent pool and fast iteration; a purpose-built engine (Gameface's custom subset, Ultralight's stripped WebKit, or the engine's own UI) gets predictable memory and frame cost, which matters more inside a game than in a launcher, because UI time comes out of the frame budget ([Building Your Own Engine](/books/gaming/building-an-engine)).

## How to Build One

### Process Model

Split the client by lifetime, the way the League architecture did:

- **A small bootstrapper** that starts first, checks for a client update, applies it and starts the client. It's the one piece that can't update itself while running, so keep it tiny and change it rarely.
- **A host process** that owns local services: session, social connection, patching, game launch, notifications. It holds the canonical state and lives as long as the client.
- **A UI process or renderer** (CEF, an Electron-style shell, or native UI) that can be torn down and rebuilt from the services. When the player minimizes the client or starts a match, close it or cut it to the minimum; Riot's 2016 design exists partly to make that possible.
- **The game process,** started by the host with what it needs to join a match, monitored, and reported on when it exits or crashes.

Riot's support pages show this shape in practice: a League session on Windows runs `League of Legends.exe` alongside `LeagueClient.exe`, `LeagueClientUx.exe` and `LeagueClientUxRender.exe`.

### Local APIs and Auth

Local services need a local API, and a local API is an attack surface: other programs on the machine and web pages in the player's browser can try to reach it.

- **Bind to loopback only** (`127.0.0.1`), on a port chosen at startup, and publish the port and a per-session secret where only the player's own processes can read it.
- **Require the secret on every call,** use TLS as Riot's Game Client API does, and reject requests carrying a browser `Origin` you don't own, so a web page can't drive the client ([API Security](/docs/security/api-security)).
- **Never hand the game or a plugin the account's long-lived credential.** The host exchanges its session for a short-lived, narrowly scoped token for the game server and passes that ([Authentication](/docs/security/authentication) covers sessions; [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) covers game tokens).
- **Decide the support boundary on day one.** Mark internal endpoints internal, and offer a documented, versioned, read-only API for the tools you want to exist ([Versioning](/docs/api-design/versioning#breaking-and-non-breaking-changes)).

### Plugins and Ownership

A plugin system pays off when many teams ship into one client, and it needs four rules to stay healthy:

- **A build is a manifest:** plugin names, exact versions and declared dependencies, resolved at build time so a broken combination never ships. Riot's JSON plugin list is the model.
- **Every plugin has an owning team** and a load phase: boot, deferred until the home screen is usable, or on demand when a screen opens ([Code Ownership](/docs/engineering/code-ownership)).
- **The boot set is tested in CI.** Fail the build when a plugin enters the boot set without approval, or when boot-time cost per plugin passes its share of the budget. The broken Affinity mechanism is what happens without this.
- **Shared code is shared once:** one copy of each framework version, one component library, a short list of supported versions, retired before new ones are added.

Store the manifest with the build so support, crash reports and telemetry can name exactly what a player was running. A sketch that extends the core model's `builds` table:

```sql
-- One row per plugin in a client build; builds and games come from the core model.
CREATE TABLE build_plugins (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  build_id UUID NOT NULL REFERENCES builds (id),
  plugin_name TEXT NOT NULL,              -- e.g. 'fe-store', 'be-social'
  plugin_version TEXT NOT NULL,           -- semver
  kind TEXT NOT NULL CHECK (kind IN ('service', 'ui', 'shared')),
  load_phase TEXT NOT NULL CHECK (load_phase IN ('boot', 'deferred', 'on_demand')),
  required_item_id UUID REFERENCES items (id),  -- NULL: every player loads it; else only
                                                -- accounts with a live entitlement to it
  owner_team TEXT NOT NULL,
  UNIQUE (build_id, plugin_name)
);

-- Budgets are effective-dated targets per game, checked against field telemetry.
CREATE TABLE client_budgets (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games (id),
  metric TEXT NOT NULL,                   -- 'bootstrap_ms', 'ui_memory_mb', 'crashes_per_1k_sessions'
  percentile SMALLINT NOT NULL,           -- 90
  limit_value NUMERIC NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  approved_by TEXT NOT NULL
);

-- The boot set of a build, for the CI gate.
SELECT plugin_name, plugin_version, owner_team
FROM build_plugins
WHERE build_id = $1 AND load_phase = 'boot'
ORDER BY plugin_name;
```

### Update Model

The client updates on two tracks. The client itself (bootstrapper, host, UI plugins) follows the release cadence of the game and can ship fixes between game patches; the game's content follows the patch pipeline. Keep them separately versioned but released together, so a game patch that needs a client change declares the minimum client version and the bootstrapper enforces it. Plugin-level releases are tempting and dangerous: Riot's posts describe plugins as independently deployable units, but the assembled build is what's tested, so ship whole builds and use flags for gradual exposure inside one ([Feature Flags](/docs/delivery/feature-flags)). How the bytes move, how rollouts are staged and how old versions are cut off is the subject of [Patching & Content Delivery](/books/gaming/patching).

### Performance Budgets

Write budgets down as numbers, in percentiles, measured on players' machines:

- **Startup,** from launch to an interactive home screen, at the 90th percentile. Riot's published goal of about 15 seconds is a reasonable public reference for a large client; the drawing above splits it into an illustrative budget.
- **Memory,** for the UI and for the host separately, at the 50th and 90th percentiles, and specifically while a match is running, when the client should be close to the host's footprint alone. Riot's 2016 desktop services ran at about 20 MB; its front end in 2021 ran at 275 MB at the median after the CEF upgrade.
- **CPU while in game,** since every percent the client uses is taken from the game.
- **Interaction latency** for the moments that matter, like Riot's champion-select lock-in target of about 100 ms at the 90th percentile.

Tie each budget to an owner and a gate: a plugin that adds boot time takes it from someone else's share. The web side of the client can borrow the same tools as any web app ([Web Performance](/docs/frontend/web-performance)).

### Crash Reporting and Error Telemetry

A client crashes in three places, and each needs its own capture: native crashes in the host (minidumps with symbols per build), renderer crashes and out-of-memory kills in the embedded browser, and JavaScript errors in plugins. Tag every report with the build, the plugin manifest and the OS version, and count per release and per thousand sessions, the way Riot counted per patch. Riot's posts show two traps worth designing against. Out-of-memory crashes cluster on old hardware and operating systems (almost half on Windows 7 in 2021), so break counts down by platform before deciding what to fix. And measurement can be wrong (the 265 million JavaScript errors that were really a counting mistake), so treat a sudden change in a health metric as a question about the pipeline as well as the client. Crash pipelines and symbol servers are covered in [Production Pipelines & Builds](/books/gaming/production-pipelines), and the event pipeline in [Telemetry & Analytics](/books/gaming/telemetry).

## What This Means for the System You Build

- **A client split by lifetime:** a tiny bootstrapper, a host that owns state and local services, a disposable UI that can close during matches, and the game as its own monitored process.
- **A loopback API with a per-session secret and origin checks,** short-lived tokens for the game, and a documented, versioned, read-only surface for third-party tools, with everything else unsupported.
- **Builds as plugin manifests** resolved at build time, each plugin with an owner and a load phase, and a CI gate on the boot set.
- **Budgets in percentiles** for startup, memory, in-game CPU and key interactions, measured on players' machines and owned by teams.
- **An embedded browser on a schedule:** upgrade it routinely, test components against the next version early, and measure the effect.
- **Crash and error counts per release,** tagged with build, manifest and OS, broken down by platform, with the counting itself checked.

## References

**Reference**

- [Chromium Embedded Framework (CEF)](https://github.com/chromiumembedded/cef), the project's description, license, founding and listed uses, including web-UI shells and off-screen rendering
- [Riot Developer Portal: League Client APIs](https://developer.riotgames.com/league-client-apis.html), the LCU's unsupported status, the Game Client API on 127.0.0.1:2999, the Live Client Data and Replay APIs, and the product policies
- [Riot Games: Changes to the LCU API policy](https://www.riotgames.com/en/DevRel/changes-to-the-lcu-api-policy), the approved-endpoint list, notice before release and the Korea restriction (January 2019)
- [Coherent Labs: Gameface overview](https://docs.coherent-labs.com/cpp-gameface/what_is_gfp/overview/), Gameface as game UI middleware, Cohtml and Renoir, and not a WebView
- [Ultralight](https://ultralig.ht/), the WebKit fork for embedding HTML in games, platforms and the vendor's memory figures
- [Epic Games: Slate overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/slate-overview-for-unreal-engine), Slate as Unreal's UI framework for the editor and in-game UI
- [Epic Games: UWidget API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/UMG/UWidget), UMG widgets as wrapped Slate controls
- [Unity Manual: Comparison of UI systems](https://docs.unity3d.com/Manual/UI-system-compare.html), uGUI for runtime, UI Toolkit for editor tools and its web-like approach

**In practice**

- [Riot Games: The Architecture of the League Client Update](https://www.riotgames.com/en/news/architecture-league-client-update), the move from Adobe AIR to CEF, the desktop C++ services, plugins and the survey result (May 2016)
- [Riot Games: Under the Hood of the League Client's Hextech UI](https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui), builds as plugin lists, semver resolution, Ember versions, Custom Elements and WebSocket data binding (February 2017)
- [League of Legends: Introducing the Client Cleanup Campaign](https://www.leagueoflegends.com/en-us/news/dev/introducing-the-client-cleanup-campaign/), bootstrap and champion-select targets, 41 plugins and 16 apps at boot (March 2020)
- [League of Legends: Client Cleanup: Progress, Setbacks & Discoveries](https://www.leagueoflegends.com/en-gb/news/dev/client-cleanup-progress-setbacks-discoveries/), the Affinity discovery (May 2020)
- [League of Legends: Client Cleanup: 2020 Recap & What's Ahead](https://www.leagueoflegends.com/en-us/news/dev/client-cleanup-2020-recap-what-s-ahead), bootstrap from 29.5 s to 16 s, fewer apps and plugins, crash and memory figures (February 2021)
- [League of Legends: Client Cleanup: 2021 So Far & What's On Deck](https://leagueoflegends.com/en-pl/news/dev/client-cleanup-2021-so-far-what-s-on-deck), CEF 74 and the upgrade plan, WebSocket speedups and the JavaScript error correction (April 2021)
- [League of Legends: We launched the updated CEF](https://www.leagueoflegends.com/en-us/news/dev/client-cleanup-we-launched-the-updated-chromium-embedded-framework-cef/), CEF 91 in patch 11.17 and its crash, memory and CPU results (September 2021)
- [Riot Games: New Riot Client Coming Soon](https://www.riotgames.com/en/news/new-riot-client-coming-soon), one client for all desktop Riot games and its rollout dates (September 2021)
- [Riot Games: Riot Client background patching](https://www.riotgames.com/en/news/riot-client-background-patching-valorant), opt-in background patching, full for VALORANT and partial for other games (May 2023)
- [Riot Games Support: New League patcher](https://support.riotgames.com/en-us/league-of-legends/client/new-league-patcher), the League client's process names
- [Steam: Steam Client Update Released](https://store.steampowered.com/oldnews/195171), shared code across Steam Desktop, Steam Deck and Big Picture Mode (June 2023)
- [EA: The EA app](https://www.ea.com/en-gb/inside-ea/news/ea-app), EA's description of its client and background updates
- [Gaming.net: Epic says it vibe coded its rebuilt launcher](https://www.gaming.net/epic-games-says-it-vibe-coded-its-rebuilt-launcher-now-in-preview/), secondary report of the October 2026 launcher preview and Epic's cold-start claim
- [Thurrott: Xbox app rebuilt in React Native](https://www.thurrott.com/?p=236311), secondary report quoting Microsoft on the move from Electron (June 2020)
- [PocketGamer.biz: Autodesk kills off game middleware products](https://www.pocketgamer.biz/news/66202/autodesk-kills-off-game-middleware-products/), secondary report of Scaleform's end of sale (July 2017)
