+++
title = "Game Clients & Launchers"
description = "What a game's front end and launcher do on PC and console, how Steam, Riot, EA, Epic and others built theirs, what web UI tech costs, and how to build one."
category = "Gaming Industry"
order = 1605
part = "Clients and Delivery"
tags = ["gaming", "game-clients", "launchers", "cef", "desktop", "game-ui", "performance"]
+++

A player who opens a PC game rarely starts with the game. They start with a client: a desktop program that signs them in, shows the store, the friends list and their collection, patches the game, and finally starts the game executable and steps aside. That program runs for hours, often longer than any match, and it's where most of a live game's features show up first. It's also software that many teams change at once, on a release cadence set by the game, and that players judge by how long it takes to open.

This chapter covers that front end: what clients and launchers do, what the public record shows about building one (the League of Legends client is the only one with a published architecture and public performance numbers, so it's the worked example, read against what Valve, Epic, EA, Microsoft, Ubisoft and ArenaNet have said about theirs), front ends on consoles and inside the engine, the UI technology inside games, and how to build a client of your own. The engine itself, its frame loop and in-game rendering belong to [Building Your Own Engine](/books/gaming/building-an-engine); moving bytes to players belongs to [Patching & Content Delivery](/books/gaming/patching); sign-in and platform accounts belong to [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity).

## What a Client Does

A front-end client (also called the out-of-game client, as opposed to the game client that renders a match) is the part of the game a player uses between matches. Its jobs, roughly in the order a session touches them:

- **Sign-in and session.** Authenticate the account, restore a session, and keep it alive. Platform sign-in (Steam, Xbox, PlayStation, Epic) happens here when the game runs on someone else's store ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)).
- **Patching.** Check for a new version of the client and the game, download it, verify it and repair damaged installs ([Patching & Content Delivery](/books/gaming/patching)).
- **Store and collection.** Show what's for sale and what the player owns: characters, skins, emotes, passes. The store screen is a view onto the entitlements and wallet services ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)).
- **Social.** Friends, presence, invites, parties and chat, which must keep working while the player is in a match ([Parties, Presence, Chat & Voice](/books/gaming/social-systems)).
- **Pre-game flow.** Queues, lobbies and champion or loadout selection, which talk to matchmaking ([Matchmaking & Ranked](/books/gaming/matchmaking)).
- **Launching the game.** Start the game executable with what it needs to join a server, then reduce itself to a background process until the match ends.
- **Post-game.** Results, progression, rewards, and the way back to the queue.

A **launcher** is the narrower version: install, patch and launch, plus news and a store page. Steam, the Epic Games Launcher, the EA app and the Riot Client are launchers that host many games; a game's own client sits behind the launcher and owns the game-specific screens. Some games skip the separate client and draw all of this inside the engine, with the in-game UI technology covered later in this chapter. The choice is mostly about who builds the screens and how often they change: a client that changes every two weeks, built by many teams, pulls toward web technology; a console game whose menus ship with the game pulls toward the engine's own UI. On phones the whole front end usually lives inside the game, under the OS lifecycle and store rules covered in [Mobile Games](/books/gaming/mobile-games).

## The League Client Update

Most large PC launchers render their interface with an embedded browser. Valve's Steam client release notes track an "embedded Chromium build" and its `steamwebhelper` process; ArenaNet's engine team names Steam, the Battle.net launcher and the Epic Games launcher among the programs whose UIs are built on the Chromium Embedded Framework (CEF), a BSD-licensed project whose own description lists "a light-weight native 'shell' application that hosts a user interface developed primarily using Web technologies" as a use case. Riot's 2016 post "The Architecture of the League Client Update" is the only detailed public account of why and how a studio made that move, from an Adobe AIR client built in 2008. Its reasons generalize: web technology had the larger talent pool, players wanted to stay connected in and out of game and the old client was too heavy to keep running in the background, and many teams were colliding in a codebase built for one.

What transfers is where the architecture settled:

- **State out of the UI.** Keeping player state and asynchronous protocol handling in JavaScript made the code complex and memory-heavy, so communication moved into C++ services on the player's machine that presented the server protocol as REST resources and pushed events to the UI over WebSockets. Because those services held the canonical state, the UI could shut down when the client was minimized while the services, at about 20 MB, kept showing invite notifications.
- **Features as plugins.** Each feature became an independently owned, tested and versioned plugin (semver, declared dependencies), a front end for UI and a back end for C++ logic, loaded according to the player's entitlements, with most features on one UI framework.

### A Build Is a List of Plugins

Riot's 2017 follow-up describes the model day to day: a build "is expressed as a list of units called plugins," a JSON file of names and versions, assembled only if every plugin's dependencies resolve; dependencies "flow upwards" (a feature registers itself with navigation rather than navigation knowing every feature); a short list of framework versions is supported side by side, retiring one before adding another; and front-end plugins observe back-end plugins over a WebSocket. The goal was a client that scales "to many dozens of teams all working on the same client at once," shipping every two weeks.

It's one approach, not the only one. Ubisoft's 2023 rebuild of Ubisoft Connect went the other way, to "only one tech stack used to build UI components," which Ubisoft tied to a quicker jump into games. Plugins buy team independence and pay for it in load-time and memory discipline (the next section); one stack buys consistency and pays for it in coordination between the teams that share it.

![Exploded axonometric of a desktop game client in four plates. At the bottom, separated by a gap, the game process: a separate executable with its own loopback API. Above it the plugin host, which loads plugins from a build manifest by semver and entitlements; then local services, the back-end plugins holding canonical state; then the web UI, a CEF renderer running front-end plugins. Side notes mark REST and WebSocket between UI and services and a token handed to the game at launch. A table lists Riot's published memory figures: about 20 MB for the 2016 desktop services, and front-end memory per session at the median falling from 597 MB on CEF 74 to 275 MB on CEF 91, a 322 MB saving.](/diagrams/gm-client-architecture.svg "The client as a small datacenter: a host process, local services that own state, a disposable web UI on top, and the game as a separate process. Memory figures are Riot's.")

## What the Architecture Cost, and the Cleanup

An architecture like this moves costs around rather than removing them: every plugin loaded at startup costs time and memory, and an embedded browser is a large dependency that has to be kept current. Riot measured those costs in public in its "Client Cleanup" posts from 2020 to 2021, with targets of bootstrap under about 15 seconds at the 90th percentile and champion-select lock-in at about 100 ms at the 90th percentile. The most transferable finding: Affinity, the mechanism deciding which plugins loaded at boot, had been "inadvertently broken" in 2018, so "the client is defaulting to loading every single plugin during bootstrap." A boot set that nobody tests drifts until it's everything.

The cleanup's published results, before and after:

| Measure (Riot, League client) | Before | After |
| --- | --- | --- |
| Bootstrap | 29.5 s at the start of 2020 | 16 s for 90% of players (February 2021) |
| Plugins in the client | Baseline | 57% fewer |
| Out-of-memory crashes | 193,000 per patch (10.23) | 55% fewer by patch 10.25 |
| Client crashes per patch, CEF 74 to CEF 91 | 3,161,145 (11.16) | 1,214,155 (11.17), 61% fewer |
| Front-end memory per session, p50 | 597 MB on CEF 74 | 275 MB on CEF 91 |

The browser upgrade was the biggest single lever: the client had sat on CEF 74 since November 2019, and Riot called updating it "the single most impactful individual change we can make to improve the client." It needed preparation (web components updated so they wouldn't break on the newer engine) before it shipped. Others report the same dependency. Steam's release notes carry routine "Updated embedded Chromium build" entries (Chromium 84 in November 2021) alongside steamwebhelper crash fixes. ArenaNet replaced Coherent UI with CEF in Guild Wars 2's launcher, in-game books and Trading Post in 2023 because Coherent UI was "no longer supported by its vendor" and didn't meet the security standards payment processors were asking for; its Trading Post loaded in 6.99 ms of UI time against 19.241 ms, and an early CEF release crashed the launcher and was rolled back before shipping again. In the League data, the top remaining crash cause was running out of memory, almost half on Windows 7 machines, and an earlier published figure for JavaScript errors per patch turned out to be a measurement mistake.

![Two timeline plan views. The first, at 1 second to 20 pixels, shows Riot's published League client bootstrap times: B0 of 29.5 seconds at the start of 2020 and B1 of 16.0 seconds for 90 percent of players as reported in February 2021, with a goal line G1 at 15 seconds, 1.0 second short of B1. The second, at 1 second to 40 pixels, splits an illustrative 15-second budget into seven parts: process start and self-update check 1.00, session restore 2.00, local services ready 1.50, boot-set plugins 4.50, first data 3.00, home screen 1.50 and headroom 1.50, summing to 15.00. A variable table defines each code.](/diagrams/gm-client-startup.svg "Startup as a budget. The published numbers are Riot's; the split of the 15-second goal is illustrative, and it only holds if everything outside the boot set waits until the home screen is usable.")

Read together, these are a checklist. Startup cost grows with what loads at boot, so the boot set needs an owner and a test. An embedded browser is a dependency like any other, so schedule its upgrades instead of waiting for them to become a project ([Dependencies](/docs/engineering/dependencies)). Count crashes and errors per release, check the counting, and publish targets in percentiles, because the slowest tenth of machines is where a client's reputation is made.

## One Client for Every Game: The Riot Client

A publisher with several games usually ends up with one launcher for all of them. The Riot Client became the one client for all of that publisher's desktop games in September 2021, with a page per game for news, install and patching, and added opt-in background patching in May 2023, complete for one game and partial for the others, which still "update partially within their game clients." Epic's rebuilt launcher (in preview from October 14, 2026) does the same across the store and Epic's own games, with parties and voice chat "across Fortnite, Epic Games Store, and the Epic Games app," and Blizzard's Battle.net, EA's app and Ubisoft Connect play the same role for their publishers' catalogs. The split is the common one: a shared launcher owns sign-in, the library, social presence and the common patching path, while each game's own client or in-engine front end keeps the game-specific screens and any game-specific update steps.

## Local APIs: What Riot Supports and What It Doesn't

A client built from local services has an API on the player's machine, and players' tools will find it. Riot's developer portal draws the line explicitly. The League Client API (LCU), "a set of protocols that the Chromium Embedded Framework (CEF) uses to communicate with a C++ Library," is "not officially supported for use with third party applications," with "no guarantees of full documentation, service uptime, or change communication"; a January 2019 policy limited developers to "endpoints on our approved list." The supported surface is in the game process instead: a Game Client API over HTTPS at `https://127.0.0.1:2999` (with a published root certificate for its self-signed certificate) whose Live Client Data API exposes a running game's state, and an opt-in Replay API. The policy around both: "If your product serves players, you must register it with us," and products "must not use or incorporate information not present in the game client that would give players a competitive edge."

Valve reaches the same boundary from the other direction. Counter-Strike's Game State Integration has the game push JSON to "any local or remote HTTP POST endpoint" named in a `gamestate_integration_*.cfg` file the player or tool installs, with an auth token, buffer, throttle and heartbeat per endpoint; its documented uses are stage lighting at tournaments, peripheral lighting, stream overlays and annotating recorded matches. What a player's own game sends is limited to that player: the `allplayers` data is "only valid for HLTV and observers," and world positions are "only valid for GOTV or spectators." Riot pulls, Valve pushes, and both decide in the game what information a tool may see.

That split is a good default for any studio. Internal local APIs change every release and stay unsupported; a small, documented, read-only surface for overlays, stats and broadcasting tools is supported, versioned and governed by policy ([Esports & Spectating](/books/gaming/esports-and-spectating) uses the same kind of surface; [Anti-Cheat](/books/gaming/anti-cheat) owns where information stops being fair).

## Other Clients and Launchers

Public engineering detail on other launchers is thin, but what the companies say about their own clients lines up:

- **Steam.** Valve updates the client's embedded Chromium in ordinary release notes (build 84.0.4147.105 in November 2021). Its June 14, 2023 client update put "a good portion of the work" into "significant improvements under-the-hood," "including changes to how we share code across Steam Desktop, Steam Deck, and Big Picture Mode": one client serving a desktop window, a handheld and a TV.
- **Epic Games Launcher.** Epic's October 14, 2026 preview of a rebuilt launcher for Windows, macOS and, for the first time, Linux promises "faster cold starts, snappier navigation between library and store, and less load on your system while it runs in the background." Press coverage (secondary) reports Epic's own figure of a 5.47-second cold start against 10.07 seconds for Steam.
- **EA app.** EA calls it "our fastest and lightest PC client to date," with "automatic game downloads and background updates." It replaced Origin, whose UI public vulnerability records describe as AngularJS inside a Qt application (more under [Local APIs and Auth](#local-apis-and-auth)). EA publishes no benchmarks.
- **Xbox app on PC.** Microsoft's React Native team says the Xbox (Beta) app for PC "uses React Native for Windows" to "create great native experiences for gamers"; a secondary report (Thurrott, June 2020) quotes Microsoft saying the app moved from Electron to React Native and uses a third of the memory.
- **Ubisoft Connect.** In June 2023 Ubisoft said the PC app was "getting an entire technological overhaul to keep up with increasingly complex updates to Ubisoft's games and services," on one UI tech stack. Ubisoft doesn't name the stack.
- **Battle.net.** I found no first-party technical source; ArenaNet's engineers list it among CEF-based launchers.

Launchers compete on the same three things whatever they're built with: cold start, memory and CPU while a game runs, and keeping games patched without the player waiting. Microsoft's move away from Electron and Epic's rebuild are both pitched on the first two.

## Console and In-Engine Front Ends

On a console, and on PC games that skip a separate client, the platform's shell is the launcher and the front end is drawn by the engine. The store, the library, installs and patches belong to the platform ([How Platforms Deliver Updates](/books/gaming/patching#how-platforms-deliver-updates)); sign-in is the platform account, linked to yours behind the scenes ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)). What's left for the game's own front end is the same list as a desktop client's, minus patching, plus rules the platform sets:

- **The platform certifies it.** Microsoft publishes the Xbox Requirements (XRs), "the policies, technical requirements, and product component-related requirements" every Xbox title must meet; Sony's and Nintendo's equivalents are under NDA. Menus, sign-in flows, error messages and suspend and resume are where front ends most often meet those requirements ([Platform Certification](/books/gaming/production-pipelines#platform-certification)).
- **The shell reaches into the game.** PlayStation 5's Control Center shows Activities, cards that let a player "jump directly into levels or challenges," some in picture-in-picture "without having to leave the game." A front end that can only be entered from its title screen can't honor a card that points at a mode, a level or a challenge, so design every screen and mode to be reachable by a deep link with the session already restored.
- **Controller first, at a distance.** Valve's Steam Deck review is a public statement of what a controller-first front end needs: full navigation with the physical controls in the default configuration, no mouse-and-keyboard glyphs when they aren't the active input, text entry through the platform's on-screen keyboard API, and interface text readable at 30 cm, with 9 pixels at 1280x800 as "the absolute minimum" and 12 pixels recommended. Launchers are held to the same standard, and Valve recommends "strongly against requiring the user to navigate a launcher to play your game."
- **No second front end to maintain.** A game that ships on console and PC usually draws its front end in the engine everywhere and keeps a desktop client, if it has one, for the things only a PC needs (multiple games, background patching, a social presence outside the game). The engine's UI technology is the next section's subject, and its frame cost is the reason its choice matters.

## UI Technology Inside the Game

In-game UI (menus, HUDs, the store inside the game) has its own lineage, and a game that renders its front end in the engine picks from these:

| Technology | What it is (per its makers) | Notes |
| --- | --- | --- |
| Scaleform | Flash-based game UI middleware | Autodesk stopped selling it in July 2017, honoring maintenance contracts and giving customers the final source (PocketGamer.biz, secondary) |
| Coherent Gameface | "a game UI middleware" with HTML, CSS and JavaScript authoring | Its layout engine "is not a 'WebView' and is not based on WebKit/Chromium/Gecko/IE"; integrations for custom engines, Unreal and Unity |
| Ultralight | "a GPU-accelerated toolkit for embedding HTML in games and native apps," "a custom fork of WebKit" | Single-process; vendor figures of 9 MB of RAM on Windows against 72 MB for Chromium or Electron; same team as Awesomium |
| CEF in the game | Chromium rendering "off-screen" into a custom drawing framework, one of CEF's listed uses | Full browser compatibility at a browser's memory cost; Guild Wars 2 moved its in-game Trading Post and books to it from the unsupported Coherent UI in 2023 |
| Unreal Slate and UMG | Slate is Epic's "completely custom and platform agnostic user interface framework" for the editor and in-game UI; UMG widgets are "wrapped Slate controls that are exposed to UObjects" | Built in, designer-friendly through Widget Blueprints |
| Unity uGUI and UI Toolkit | Unity's manual recommends uGUI for a list of runtime cases; UI Toolkit (UXML and USS, a "web-like approach") is recommended for complex editor tools and "in active development" | Check the current manual's comparison before choosing |

The tradeoff is the launcher one at a smaller scale, with one addition: middleware can be discontinued under a shipping game (Scaleform, Coherent UI), so the exit path matters as much as the feature list. Web-style authoring gets a large talent pool and fast iteration; a purpose-built engine (Gameface's custom subset, Ultralight's stripped WebKit, or the engine's own UI) gets predictable memory and frame cost, which matters more inside a game than in a launcher, because UI time comes out of the frame budget ([Building Your Own Engine](/books/gaming/building-an-engine)).

## How to Build It

### Process Model

Split the client by lifetime:

- **A small bootstrapper** that starts first, checks for a client update, applies it and starts the client. It's the one piece that can't update itself while running, so keep it tiny and change it rarely.
- **A host process** that owns local services: session, social connection, patching, game launch, notifications. It holds the canonical state and lives as long as the client.
- **A UI process or renderer** (CEF, an Electron-style shell, or native UI) that can be torn down and rebuilt from the services. When the player minimizes the client or starts a match, close it or cut it to the minimum; that's why state lives in the host.
- **The game process,** started by the host with what it needs to join a match, monitored, and reported on when it exits or crashes.

Shipping clients show this shape in their process lists: a League session on Windows runs `League of Legends.exe` alongside `LeagueClient.exe`, `LeagueClientUx.exe` and `LeagueClientUxRender.exe`, and Steam's release notes fix crashes in `steamwebhelper`, the helper that hosts its embedded browser, as a component of their own.

### Local APIs and Auth

Local services need a local API, and a local API is an attack surface: other programs on the machine and web pages in the player's browser can try to reach it. So are a launcher's other entry points. EA's Origin client had two 2019 vulnerabilities through its `origin://` and `origin2://` URL handlers: template injection that escaped the AngularJS sandbox to run code (CVE-2019-11354), and argument injection that loaded a remote Qt plugin (CVE-2019-12828). Treat every URL scheme, command-line argument and local port the client accepts as untrusted input.

- **Bind to loopback only** (`127.0.0.1`), on a port chosen at startup, and publish the port and a per-session secret where only the player's own processes can read it.
- **Require the secret on every call** (Valve's Game State Integration does the reverse for the same reason: each endpoint's config carries an auth token, so the receiving tool can tell the game from anything else posting to it), use TLS as Riot's Game Client API does, and reject requests carrying a browser `Origin` you don't own, so a web page can't drive the client ([API Security](/docs/security/api-security)).
- **Never hand the game or a plugin the account's long-lived credential.** The host exchanges its session for a short-lived, narrowly scoped token for the game server and passes that, the way a Steam game asks the running Steam client for a session ticket that "must only be used once" and has the server or backend validate it with Steam ([Authentication](/docs/security/authentication) covers sessions; [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) covers game tokens).
- **Decide the support boundary on day one.** Mark internal endpoints internal, and offer a documented, versioned, read-only API for the tools you want to exist ([Versioning](/docs/api-design/versioning#breaking-and-non-breaking-changes)).

### Plugins and Ownership

A plugin system pays off when many teams ship into one client, and it needs four rules to stay healthy:

- **A build is a manifest:** plugin names, exact versions and declared dependencies, resolved at build time so a broken combination never ships. Riot's JSON plugin list is the public example.
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

- **Startup,** from launch to an interactive home screen, at the 90th percentile. Public references span a wide range: Riot's goal of about 15 seconds for a large multi-team client, and Epic's claim of 5.47 seconds cold for its rebuilt launcher; the drawing above splits a 15-second goal into an illustrative budget.
- **Memory,** for the UI and for the host separately, at the 50th and 90th percentiles, and specifically while a match is running, when the client should be close to the host's footprint alone. Riot's 2016 desktop services ran at about 20 MB and its front end at 275 MB at the median in 2021; Microsoft's Xbox app rebuild was reported at a third of its Electron predecessor's memory.
- **CPU while in game,** since every percent the client uses is taken from the game.
- **Interaction latency** for the moments that matter, like Riot's champion-select lock-in target of about 100 ms at the 90th percentile.

Tie each budget to an owner and a gate: a plugin that adds boot time takes it from someone else's share. The web side of the client can borrow the same tools as any web app ([Web Performance](/docs/frontend/web-performance)).

### Crash Reporting and Error Telemetry

A client crashes in three places, and each needs its own capture: native crashes in the host (minidumps with symbols per build), renderer crashes and out-of-memory kills in the embedded browser, and JavaScript errors in plugins. Tag every report with the build, the plugin manifest and the OS version, and count per release and per thousand sessions. A browser upgrade is where the counts move most: ArenaNet rolled back its first CEF launcher release over crashes, and Riot's CEF upgrade cut crashes per patch by 61%. Riot's posts show two more traps worth designing against. Out-of-memory crashes cluster on old hardware and operating systems (almost half on Windows 7 in 2021), so break counts down by platform before deciding what to fix. And measurement can be wrong (the 265 million JavaScript errors that were really a counting mistake), so treat a sudden change in a health metric as a question about the pipeline as well as the client. Crash pipelines and symbol servers are covered in [Production Pipelines & Builds](/books/gaming/production-pipelines), and the event pipeline in [Telemetry & Analytics](/books/gaming/telemetry).

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
- [Riot Games: Changes to the LCU API policy](https://www.riotgames.com/en/DevRel/changes-to-the-lcu-api-policy), the approved-endpoint list (January 2019)
- [Valve Developer Community: Counter-Strike Game State Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration), JSON pushed to configured HTTP endpoints, auth tokens, throttling, documented uses and observer-only data
- [Steamworks: User Authentication and Ownership](https://partner.steamgames.com/doc/features/auth), single-use session tickets from the Steam client validated by the game server or backend
- [NVD: CVE-2019-11354](https://nvd.nist.gov/vuln/detail/CVE-2019-11354), template injection in Origin's URI handler escaping the AngularJS sandbox in a Qt application
- [NVD: CVE-2019-12828](https://nvd.nist.gov/vuln/detail/CVE-2019-12828), argument injection through Origin's URI schemes loading a remote Qt plugin
- [Coherent Labs: Gameface overview](https://docs.coherent-labs.com/cpp-gameface/what_is_gfp/overview/), Gameface as game UI middleware, Cohtml and Renoir, and not a WebView
- [Ultralight](https://ultralig.ht/), the WebKit fork for embedding HTML in games, platforms and the vendor's memory figures
- [Epic Games: Slate overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/slate-overview-for-unreal-engine), Slate as Unreal's UI framework for the editor and in-game UI
- [Epic Games: UWidget API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/UMG/UWidget), UMG widgets as wrapped Slate controls
- [Unity Manual: Comparison of UI systems](https://docs.unity3d.com/Manual/UI-system-compare.html), uGUI for runtime, UI Toolkit for editor tools and its web-like approach

**In practice**

- [Riot Games: The Architecture of the League Client Update](https://www.riotgames.com/en/news/architecture-league-client-update), the move from Adobe AIR to CEF, the desktop C++ services, plugins and the survey result (May 2016)
- [Riot Games: Under the Hood of the League Client's Hextech UI](https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui), builds as plugin lists, semver resolution, Ember versions, shared plugins and WebSocket data binding (February 2017)
- [League of Legends: Introducing the Client Cleanup Campaign](https://www.leagueoflegends.com/en-us/news/dev/introducing-the-client-cleanup-campaign/), bootstrap and champion-select targets (March 2020)
- [League of Legends: Client Cleanup: Progress, Setbacks & Discoveries](https://www.leagueoflegends.com/en-gb/news/dev/client-cleanup-progress-setbacks-discoveries/), the Affinity discovery (May 2020)
- [League of Legends: Client Cleanup: 2020 Recap & What's Ahead](https://www.leagueoflegends.com/en-us/news/dev/client-cleanup-2020-recap-what-s-ahead), bootstrap from 29.5 s to 16 s, fewer apps and plugins, crash and memory figures (February 2021)
- [League of Legends: Client Cleanup: 2021 So Far & What's On Deck](https://leagueoflegends.com/en-pl/news/dev/client-cleanup-2021-so-far-what-s-on-deck), CEF 74, the upgrade plan and the JavaScript error correction (April 2021)
- [League of Legends: We launched the updated CEF](https://www.leagueoflegends.com/en-us/news/dev/client-cleanup-we-launched-the-updated-chromium-embedded-framework-cef/), CEF 91 in patch 11.17 and its crash, memory and CPU results (September 2021)
- [Riot Games: New Riot Client Coming Soon](https://www.riotgames.com/en/news/new-riot-client-coming-soon), one client for all desktop Riot games (September 2021)
- [Riot Games: Riot Client background patching](https://www.riotgames.com/en/news/riot-client-background-patching-valorant), opt-in background patching, full for VALORANT and partial for other games (May 2023)
- [Riot Games Support: New League patcher](https://support.riotgames.com/en-us/league-of-legends/client/new-league-patcher), the League client's process names
- [Guild Wars 2: Inside ArenaNet: Chromium Embedded Framework in Guild Wars 2](https://www.guildwars2.com/en/news/inside-arenanet-chromium-embedded-framework-in-guild-wars-2/), replacing the unsupported Coherent UI with CEF, the Trading Post timing, the launcher rollback and CEF-based launchers (April 2023)
- [Steam: Client Update, November 19, 2021](https://store.steampowered.com/oldnews/101607), the embedded Chromium build update and a steamwebhelper crash fix
- [Steam: Steam Client Update Released](https://store.steampowered.com/oldnews/195171), shared code across Steam Desktop, Steam Deck and Big Picture Mode (June 2023)
- [Epic Games Store: The new Epic Games Launcher is finally here in Preview](https://store.epicgames.com/en-US/news/epic-games-launcher-preview), the October 14, 2026 preview, platforms, faster cold starts and cross-product parties and voice chat
- [Gaming.net: Epic says it vibe coded its rebuilt launcher](https://www.gaming.net/epic-games-says-it-vibe-coded-its-rebuilt-launcher-now-in-preview/), secondary report of Epic's cold-start figures against Steam
- [EA: The EA app](https://www.ea.com/en-gb/inside-ea/news/ea-app), EA's description of its client and background updates
- [Microsoft DevBlogs: React Native at Build 2020](https://devblogs.microsoft.com/react-native/2020-06-01-build2020recap/), the Xbox (Beta) app for PC on React Native for Windows (June 2020)
- [Thurrott: Xbox app rebuilt in React Native](https://www.thurrott.com/?p=236311), secondary report quoting Microsoft on the move from Electron and memory use (June 2020)
- [Ubisoft News: The next evolution of Ubisoft Connect is here](https://news.ubisoft.com/en-gb/article/45npDyJWSNathaIDK3gvLp/the-next-evolution-of-ubisoft-connect-is-here), the technological overhaul and one UI tech stack (June 2023)
- [Xbox Requirements](https://devdocs.xbox.com/publishing/certification/xbox-requirements), the published policies and technical requirements every Xbox title must meet
- [Steamworks: Steam Deck compatibility review](https://partner.steamgames.com/doc/steamdeck/compat), controller navigation, glyphs, on-screen keyboard, text size and launchers
- [PlayStation Blog: First look at PlayStation 5's user experience](https://blog.playstation.com/2020/10/15/first-look-playstation-5s-next-generation-user-experience/), the Control Center and Activities cards (October 2020)
- [PocketGamer.biz: Autodesk kills off game middleware products](https://www.pocketgamer.biz/news/66202/autodesk-kills-off-game-middleware-products/), secondary report of Scaleform's end of sale (July 2017)
