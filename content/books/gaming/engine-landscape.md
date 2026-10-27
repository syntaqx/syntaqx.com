+++
title = "The Engine Landscape"
description = "Unreal, Unity, Godot and the rest as of October 2026: license terms, architecture, studios that changed engines, and how to choose one for a game."
category = "Gaming Industry"
order = 1602
part = "How Games Get Made"
tags = ["gaming", "game-engines", "unreal-engine", "unity", "godot", "licensing"]
+++

A game engine is the part of a game that isn't the game: the loop that turns input into frames, the renderer, physics, audio, animation, networking, the asset pipeline that turns an artist's files into something a console can load, and the editor where designers build levels. It is the largest dependency a studio takes on. It decides which platforms the game can ship to, which language the team writes, how multiplayer works, what the build farm does all night, and what the studio pays when the game succeeds. Changing it later is possible, and a few studios have done it in public, but it costs years.

This chapter surveys what exists as of October 2026: the two commercial engines most studios license (Unreal and Unity), the open-source engines that have become serious options (Godot, O3DE, Bevy, Defold, Cocos), GameMaker, the proprietary engines large studios run, the studios that changed engines and said why, and how to choose. Building one yourself has its own chapter, [Building Your Own Engine](/books/gaming/building-an-engine); the pipelines around any engine are in [Production Pipelines & Builds](/books/gaming/production-pipelines).

## What an Engine Gives You

Every engine on this list provides the same layers, in different proportions:

| Layer | What it does | Where it shows up |
| --- | --- | --- |
| **Platform layer** | Windows, consoles, mobile, web: graphics APIs, input, audio, files | Which platforms you can ship to, and how much porting costs |
| **Core** | Memory, threads and jobs, the object model, reflection, serialization | How game code is structured and saved |
| **Simulation** | The game loop, timesteps, physics, animation, AI | Frame budget and determinism ([Building Your Own Engine](/books/gaming/building-an-engine)) |
| **Rendering** | Scene management, materials, lighting, post-processing | Visual ceiling and per-platform performance |
| **Networking** | Replication, RPCs, client prediction | Which multiplayer models are cheap ([Netcode Fundamentals](/books/gaming/netcode)) |
| **Scripting** | The language designers and gameplay engineers write | Who you can hire, how fast they iterate |
| **Editor and tools** | Level editing, visual scripting, profilers, debuggers | Day-to-day productivity of everyone who isn't an engine engineer |
| **Asset pipeline** | Import, conversion ("cooking") and packaging per platform | Build times, patch sizes ([Patching & Content Delivery](/books/gaming/patching)) |
| **Ecosystem** | Marketplace, documentation, community, the hiring pool | Whether an answer exists when something breaks |

The engine does not provide the things around the game: accounts, matchmaking, the store, entitlements, telemetry pipelines, moderation. Those are backend services ([Game Backend Architecture](/books/gaming/game-backend)), and keeping them outside the engine is what makes an engine migration survivable, as the TFT example below shows.

## Unreal Engine

Epic's Unreal Engine is a full-source C++ engine built for high-end 3D, and for a game its licensing is a single royalty.

**License terms, as of October 2026,** from Epic's license page:

- **Royalty, per product.** For "game developers and other users distributing applications that incorporate Unreal Engine code at runtime," a 5% royalty is due "when the lifetime gross revenue from that product exceeds $1 million USD." The royalty is on worldwide gross revenue "regardless of what company collects the revenue," calculated "on the amount over and above the first $1 million." The base is gross, before the store's own cut ([Stores, Fees & Payments](/books/gaming/stores-and-payments)).
- **A discount for launching on Epic's store.** "Effective Jan 1, 2025, the royalty rate may go down from 5% to 3.5%" if the game ships on the Epic Games Store before or at the same time as other stores, and revenue Epic processes through its store is excluded from the calculation.
- **Payment and notice.** Royalties are due 45 days after each calendar quarter closes, and Epic asks for a release notification before distribution.
- **Seats, for everyone else.** Companies above $1 million in annual gross revenue that aren't shipping engine code at runtime to third parties (for example in film, architecture or internal tools) buy Unreal Subscription seats at $1,850 per seat per year. A game paying royalties isn't required to buy seats. Custom terms can include "negotiated terms for lower royalties."

Note the two different $1 million thresholds: the royalty threshold is per product, over its lifetime; the seat threshold is per company, per year.

**Source access.** Licensees get the full C++ source. Epic's documented route is to link a GitHub account to the Epic account, accept the EULA, and accept an invitation to the Epic Games organization on GitHub; licensees can also get source through Epic's Perforce server. Full source matters more than it sounds: when a console crash happens inside the engine, a studio can read, patch and ship the fix without waiting for a vendor.

**Architecture.** The parts a backend engineer meets first:

- **UObject** is the base class. It provides garbage collection ("Object destruction is handled automatically by the garbage collection system when an Object is no longer referenced"), reflection through `UCLASS`, `UPROPERTY` and `UFUNCTION` macros, serialization, editor integration and network replication. UObjects aren't created with `new` and `delete`.
- **Actors and components.** An Actor is "any object that can be placed into a level"; behavior is composed from components: ActorComponents with no transform, SceneComponents with a transform and attachment, PrimitiveComponents that render or collide.
- **Blueprints**, "a complete gameplay scripting system based on the concept of using a node-based interface," let designers write gameplay without C++.
- **Networking** is client-server and server-authoritative: "The server, as the host of the game, holds the one, true, authoritative game state." Actors replicate their creation, destruction and movement automatically; other properties replicate when flagged; RPCs run on the server, the owning client or all clients. A game can run listen servers (a player hosts) or dedicated servers ([Game Servers & Hosting](/books/gaming/game-servers)).
- **Iris** is a newer, opt-in replication system built "on Epic's experience with Fortnite Battle Royale" for larger worlds, higher player counts and lower server costs. The Unreal Engine 5.8 documentation still labels it **Experimental**.
- **Nanite** (virtualized geometry, streaming only the detail visible on screen), **Lumen** (fully dynamic global illumination and reflections) and **MassEntity** (a data-oriented framework where data lives in fragments and logic in processors) are the UE5 systems most studios cite when they choose it.

**In practice.** Riot's VALORANT runs on Unreal: Riot's post on its 128-tick servers describes Property Replication as "a system in Unreal Engine 4 (UE4) that allows for network synchronization of state between server and clients," and explains why they moved hot state changes from replication polling to RPCs to fit three games per CPU core. That post is the best public account of what it takes to run Unreal's networking at competitive tick rates ([Game Servers & Hosting](/books/gaming/game-servers)).

## Unity

Unity is a cross-platform engine used heavily for mobile and for 2D and 3D games on every platform. Its scripting language is C#, and its two programming models coexist: classic **GameObjects** with MonoBehaviour scripts, and the **Data-Oriented Technology Stack (DOTS)**.

**License terms, as of October 2026,** are the seat-based plans Unity returned to in September 2024. Per Unity's post of September 12, 2024, effective January 1, 2025:

- **Unity Personal** is free, with a revenue and funding ceiling of $200,000 a year; the Made with Unity splash screen is optional for Personal games built with Unity 6.
- **Unity Pro** is $2,200 per seat per year (an 8% increase), required above $200,000 of total annual revenue and funding.
- **Unity Enterprise** (a 25% increase) is required above $25 million, and a minimum subscription may apply.

Unity also said it would consider price increases "only on an annual basis," and that if it changes the Editor terms in ways that affect a customer, the customer "may continue using your current version of the software under the previously agreed terms."

**The Runtime Fee** is worth knowing in detail, because it shows how an engine's terms can change under a shipping game. It ran in three steps:

1. **September 2023: announced.** Unity announced a per-install Runtime Fee. (The original post is no longer retrievable at its URL, which now serves the cancellation, so this chapter doesn't quote its rates.)
2. **September 22, 2023: revised.** In "An open letter to our community," Unity's Marc Whitten apologized and narrowed it: no Runtime Fee for games on Unity Personal, whose cap rose from $100,000 to $200,000; no fee for any game under $1 million in trailing twelve-month revenue; the fee would apply only from "the next LTS version of Unity shipping in 2024 and beyond," leaving shipped games and current projects out unless upgraded; and Pro and Enterprise customers would pay the lesser of a 2.5% revenue share or an amount calculated from new players each month, both "self-reported."
3. **September 12, 2024: cancelled.** CEO Matt Bromberg's post cancelled the Runtime Fee "for our games customers, effective immediately." Unity's pricing-updates FAQ states the fee was never charged: "No new or existing Unity games have been, or will be, subject to the Runtime Fee." The updated Editor Software Terms took effect October 10, 2024.

The lesson isn't about Unity in particular. An engine license is a contract that can change, and a game that runs for ten years will see it change. My rule: read the terms for the engine version you ship on, record which version and which terms each title was built under, and treat staying on a version (with its terms) as a real option, at the cost of the upgrades you give up.

**Architecture.** In DOTS, the Entities package "provides a data-oriented implementation of the Entity Component System (ECS) architecture." An entity is "a unique identifier, like a lightweight unmanaged alternative to a GameObject," and entities with the same components are stored together in dense chunks so systems iterate contiguous memory; [Building Your Own Engine](/books/gaming/building-an-engine#objects-components-and-ecs) explains the layout and when it pays. Unity ships two networking stacks to match: **Netcode for GameObjects**, "a high-level networking library," and **Netcode for Entities**, a server-authoritative framework with client prediction built on ECS.

**In practice.** Riot's Legends of Runeterra is a Unity game; Riot's 2021 post on its CI/CD pipeline lists "Unity (just recently updated to use Unity 2020)" alongside a Git LFS monorepo and Jenkins pipelines that build Windows, Android and iOS in one run ([Production Pipelines & Builds](/books/gaming/production-pipelines)).

## Godot

Godot is a community-developed open-source engine, owned by no single company.

- **License.** "Godot is created and distributed under the MIT License." No royalties and no seats; the only requirement is to include the license text somewhere in the game (a credits screen, a licenses menu, a shipped file).
- **Model.** A game is a tree of **nodes**, the "smallest building blocks that you arrange into trees," grouped into reusable **scenes**. Nodes communicate through **signals** ("Nodes emit signals when some event occurs"), which keeps scenes decoupled.
- **Architecture.** Under the scene layer, rendering, physics and audio are **servers**: singletons initialized at startup that the scene tree talks to. A game that outgrows nodes for some system (thousands of bullets, say) can talk to the servers directly.
- **Languages.** "GDScript, C#, and, via its GDExtension technology, C and C++." One constraint matters for platform planning: "Projects written in C# using Godot 4 currently cannot be exported to the web platform."
- **The loop.** `_process()` runs once per drawn frame; "Physics processing happens at a fixed rate, 60 times per second by default."

Godot's MIT license means a studio owns its fork outright: it can patch the engine, ship the patch and never ask anyone. The tradeoff is that the studio is also its own vendor of last resort.

## Other Engines Worth Knowing

| Engine | License | Language | Built for | Notes |
| --- | --- | --- | --- | --- |
| **O3DE** (Open 3D Engine) | Apache 2.0, or MIT at your option | C++, Lua, Script Canvas | Large 3D, modular | The Linux Foundation formed the Open 3D Foundation in July 2021; AWS contributed an updated Amazon Lumberyard, released as O3DE |
| **Bevy** | MIT or Apache 2.0 | Rust | Code-first games on an ECS | Components are Rust structs and systems are Rust functions; still in development, with a breaking release "approximately once every 3 months" |
| **Defold** | Defold License (derived from Apache 2.0), free | Lua | 2D and light 3D, mobile and web | Created by Christian Murray and Ragnar Svensson, acquired by King in 2014, made source-available and moved to the Defold Foundation in May 2020; lists Xbox, PlayStation and Switch among its targets |
| **Cocos** (Cocos Creator) | MIT (engine) | TypeScript | Mobile, web and mini-game platforms | Runtime "half C++ and half TypeScript"; targets include WeChat Mini Games, TikTok Mini Games and Facebook Instant Games |
| **GameMaker** | Commercial tiers | GML (GameMaker Language) | 2D | Free tier is non-commercial; Professional is a one-time $99.99 for commercial desktop, web and mobile; console export needs the Enterprise subscription (as of October 2026) |

Two patterns in this table are worth naming. Bevy's release cadence is the honest cost of a young engine: every three months, the code that calls the engine may need to change, so a team adopting it budgets for migrations the way it budgets for features. And the mini-game platforms Cocos targets are a market of their own: games that run inside a super-app, distributed by that app's store rather than by Apple or Google ([Game Clients & Launchers](/books/gaming/game-clients)).

## Proprietary Engines

Many large studios run engines of their own. Little about them is public, so this section sticks to what the owners have said.

- **id Tech.** id Software has released the source of its older engines on GitHub: DOOM and Quake III Arena under GPL-2.0, DOOM 3 and DOOM 3 BFG under GPL-3.0, among others. Current versions are not public.
- **Frostbite** is EA's in-house engine.
- **Decima** is Guerrilla's engine. In February 2017, Guerrilla's technical director wrote that the studio was "sharing our engine, and collaborating on the future of it" with Kojima Productions: a public example of a proprietary engine licensed between studios rather than sold.
- **REDengine** was CD PROJEKT RED's engine from The Witcher 2 (2011) through Cyberpunk 2077, until the studio's move to Unreal Engine 5 described below.
- **League of Legends' engine,** which Riot's TFT FAQ calls Hextech ("our shared engine with League of Legends"). Riot's public posts describe two decisions that only an engine owner could make: keeping the Windows renderer on DirectX 9 for players still on Windows XP ([Building Your Own Engine](/books/gaming/building-an-engine#the-frame-budget)), and making the League game server deterministic so recorded games could be replayed and rewound, which became Project Chronobreak ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback#determinism-on-the-server-league-of-legends)).

The pattern behind these is control. An engine owner decides which hardware to keep supporting, can make the simulation deterministic, and can tune the server for its own game. It pays for that control with an engine team, tools that nobody else maintains, and the cost of hiring people who have to learn it from scratch.

## Studios Changing Engines

Three public decisions show the tradeoffs better than any feature list.

**CD PROJEKT RED to Unreal Engine 5 (March 21, 2022).** Announcing the next Witcher game, the studio said it was "currently in development with Unreal Engine 5" under a multi-year partnership with Epic that "covers not only licensing, but technical development of Unreal Engine 5," aimed at tailoring the engine for open-world games. Its CTO, Paweł Zawodny, gave the reason in one sentence: "It is vital for CD PROJEKT RED to have the technical direction of our next game decided from the earliest possible phase as; in the past, we spent a lot of resources and energy to evolve and adapt REDengine with every subsequent game release." The rationale is predictability: an engine team's work restarts with every game, and licensing moves part of that cost to a vendor whose business is the engine.

**Riot's Teamfight Tactics from Hextech to Unreal (2026).** Riot's migration FAQ, dated June 19, 2026, says "the time has come to part ways with Hextech (our shared engine with League of Legends)," and that the move "allows for more dedicated tools and tech" for TFT, including a dedicated client, "while giving more space for League developers." The FAQ is also a candid list of what a migration costs players. Minimum PC specifications rose to Windows 10 with DirectX 11. macOS support was dropped temporarily with Patch 18.1. On mobile, "iOS 2GB & Android 2/3 GB devices will no longer be supported." And it shows what a migration should not touch: "The content you purchased or earned is the heart of your TFT Account, so nothing should be lost in this migration," and on PC, RP "continues to be shared across League of Legends and Teamfight Tactics." Ownership lives in backend services, not in the engine, so changing the engine left it alone ([The Games Business](/books/gaming/games-business#the-core-data-model)).

**One company, three engines.** Read together, Riot's public posts describe League on its own engine, VALORANT on Unreal and Legends of Runeterra on Unity. The lesson I draw: a publisher doesn't need one engine; it needs one backend. Accounts, entitlements, matchmaking, telemetry and player behavior systems can be shared across titles while each game picks the engine that fits it.

What a migration touches, in order of how much it usually hurts:

1. **Content.** Levels, materials, shaders, animation graphs and effects are authored in engine formats. Some convert; much is rebuilt.
2. **Tools and pipelines.** Every custom importer, editor extension and build step is rewritten against the new engine ([Production Pipelines & Builds](/books/gaming/production-pipelines)).
3. **Gameplay code and its behavior.** Code is ported, but timing, physics and networking behavior differ, so balance and feel are re-tested.
4. **Platform reach.** Minimum specs move, and some devices fall off, as the TFT FAQ shows.
5. **The client around the game** (launcher, patcher, crash reporting) is reconnected ([Game Clients & Launchers](/books/gaming/game-clients)).
6. **The backend,** ideally, not at all.

## The Cost of Ownership

License fees are the visible part of an engine's cost, and they're easy to compare at one illustrative revenue figure. Take a game that grosses $5 million over its life, built by ten developers paying for three years of seats:

![A dimensioned plan view of an illustrative game's lifetime gross revenue of 5.00 million dollars, drawn as a bar whose first 1.00 million is hatched as royalty-free and whose remaining 4.00 million is the royalty base, with a centerline at the 2.32 million break-even point K1. A second plan view at ten times the scale compares license cost: the highlighted Unreal royalty at 5 percent is 0.200 million, at 3.5 percent 0.140 million, Unity Pro seats 0.066 million and Godot zero. A variable table defines every code and numbered notes give the license sources.](/diagrams/gm-engine-landscape-cost.svg "At this revenue the Unreal royalty is three times the Unity Pro seats; the break-even is K1 = 2.32 million, and none of it compares with the store's cut or the cost of an engine team.")

The sheet makes three points:

- **The Unreal royalty scales with success; Unity seats scale with headcount.** Below the break-even K1, seats cost more than the royalty; above it, the royalty costs more. K1 moves with team size and years, so compute it for your own numbers rather than reading it off this sheet.
- **The royalty base is gross revenue,** before the store's share. A store that takes its cut and an engine royalty on the same gross dollar compound ([Stores, Fees & Payments](/books/gaming/stores-and-payments)).
- **License fees are the small number.** An in-house engine has no license fee and a payroll; an open-source engine has no license fee and makes the studio its own support desk. Neither appears on a pricing page, and both usually dwarf the fees on this sheet.

## How to Choose

Choose for the game and the team first, then check the license at the revenue you hope for:

| If the game needs | Lean toward | Because |
| --- | --- | --- |
| High-end 3D, consoles, a large team, dedicated-server multiplayer | Unreal | Full source, server-authoritative replication, the UE5 rendering systems; a royalty only above $1M per product |
| Mobile or cross-platform 2D and 3D, with a C# team | Unity | A large hiring pool and two networking stacks; seat costs above $200,000 of revenue and funding |
| 2D or modest 3D with no license cost and full ownership of the engine | Godot | MIT license, scenes and nodes, GDScript or C# (C# can't export to web in Godot 4) |
| Web, mini-game platforms inside super-apps, TypeScript | Cocos | Targets WeChat, TikTok and Facebook Instant mini-games |
| Small mobile and web games in Lua, with consoles possible | Defold | Free under the Defold License; lists consoles among its targets |
| A code-first team in Rust that wants an ECS | Bevy | Data-driven by design; budget for a breaking release every three months |
| An open-source large-3D base to build a studio engine on | O3DE | Apache 2.0 or MIT, modular, foundation-governed |
| 2D with the gentlest on-ramp | GameMaker | GML and visual scripting; consoles need the Enterprise tier |
| Deterministic simulation, a rendering or scale target nobody sells, or decades of one franchise | Your own | Control at the price of an engine team ([Building Your Own Engine](/books/gaming/building-an-engine)) |

Questions that settle most cases:

- **Which platforms, on day one and in three years?** Console support depends on the engine's relationship with each platform holder and on the console SDKs, which are under NDA. Ask the engine vendor, or check the open-source project's documented targets, before committing.
- **Which multiplayer model?** Server-authoritative action games want an engine with mature replication and a dedicated-server build. Fighting games and RTS games want deterministic simulation, which most general engines don't guarantee ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)).
- **Who is on the team?** C++ engineers, C# engineers and designers who script visually are different hiring pools. The engine the team already knows ships a year sooner.
- **Do you need the source?** For a console game or a game that will run for years, my default is yes: a crash inside the engine is your crash.
- **What does success cost?** Compute the royalty and seats at the revenue the business plan hopes for, as in the sheet above.
- **What happens if the terms change?** Know which engine version and terms each title ships on, and whether you can stay on them.

The build-or-buy argument itself, from GDC 2012's public debate to the conditions under which owning an engine pays, is in [Building Your Own Engine](/books/gaming/building-an-engine#build-buy-or-both). My rule: license unless the game needs something no engine sells, and if it does, build only that part.

## What This Means for the System You Build

- **Keep the backend out of the engine.** Accounts, entitlements, wallets, matchmaking and telemetry belong to services the game calls, so the engine can change without touching what players own.
- **Record the engine version on every build** ([Production Pipelines & Builds](/books/gaming/production-pipelines#recording-builds)) and the license terms each version shipped under, so royalty reports and term changes can be traced to what shipped.
- **Report royalties from your own revenue data,** quarterly, from gross revenue across every store, not from net payouts.
- **Pick the engine for the game and the team,** then compute license costs at the revenue you hope for, including the break-even between royalty and seats.
- **Prefer engines with source access** for anything shipping on consoles or meant to run for years.
- **Budget for engine upgrades** as ongoing work, and for migrations as multi-year projects.
- **Design for a second engine** if you're a publisher: shared backend services and per-game engines are the normal shape.

## References

**Specifications**

- [Epic Games: Unreal Engine license](https://www.unrealengine.com/en-US/license), the 5% royalty above $1 million per product, the 3.5% Epic Games Store rate, seats at $1,850 and quarterly payment
- [Godot: Complying with licenses](https://docs.godotengine.org/en/stable/about/complying_with_licenses.html), the MIT License and how to include it
- [O3DE: LICENSE.txt](https://github.com/o3de/o3de/blob/development/LICENSE.txt), Apache 2.0 or MIT at the user's option
- [Defold: License](https://defold.com/license/), the Defold License 1.0

**Reference**

- [Unity: Unity is canceling the Runtime Fee](https://unity.com/blog/unity-is-canceling-the-runtime-fee), September 12, 2024: the cancellation, Personal, Pro and Enterprise terms from January 1, 2025
- [Unity: An open letter to our community](https://unity.com/blog/an-open-letter-to-our-community), September 22, 2023: the revised Runtime Fee terms
- [Unity: Pricing updates](https://unity.com/pricing-updates), the fee never charged and the October 10, 2024 Editor Software Terms
- [Unity: Entities overview](https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/index.html), DOTS as an ECS implementation
- [Unity: Archetypes](https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/concepts-archetypes.html), archetypes and 16 KiB chunks
- [Unity: Netcode for GameObjects](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/index.html), the high-level networking library
- [Unity: Netcode for Entities](https://docs.unity3d.com/Packages/com.unity.netcode@1.3/manual/index.html), server-authoritative networking with client prediction
- [Epic Games: Downloading source code](https://dev.epicgames.com/documentation/en-us/unreal-engine/downloading-source-code-in-unreal-engine), source access through GitHub or Perforce
- [Epic Games: Objects in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine), UObject garbage collection, reflection and replication
- [Epic Games: Actors](https://dev.epicgames.com/documentation/en-us/unreal-engine/actors-in-unreal-engine), actors and component types
- [Epic Games: Blueprints visual scripting](https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprints-visual-scripting-in-unreal-engine), node-based gameplay scripting
- [Epic Games: Networking overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine), the authoritative server, replication and RPCs
- [Epic Games: Iris replication system](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-replication-system-in-unreal-engine), opt-in and Experimental in 5.8
- [Epic Games: Nanite](https://dev.epicgames.com/documentation/en-us/unreal-engine/nanite-virtualized-geometry-in-unreal-engine), virtualized geometry
- [Epic Games: Lumen](https://dev.epicgames.com/documentation/en-us/unreal-engine/lumen-global-illumination-and-reflections-in-unreal-engine), dynamic global illumination and reflections
- [Epic Games: MassEntity overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-mass-entity-in-unreal-engine), fragments and processors
- [Godot: Key concepts](https://docs.godotengine.org/en/stable/getting_started/introduction/key_concepts_overview.html), scenes, nodes, the scene tree and signals
- [Godot: Architecture diagram](https://docs.godotengine.org/en/stable/engine_details/architecture/godot_architecture_diagram.html), the scene layer over servers
- [Godot: Scripting languages](https://docs.godotengine.org/en/stable/getting_started/step_by_step/scripting_languages.html), GDScript, C# and GDExtension, and the C# web export limit
- [Godot: Idle and physics processing](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html), physics at 60 ticks per second by default
- [Linux Foundation: Open 3D Foundation](https://www.linuxfoundation.org/press/press-release/linux-foundation-to-form-new-open-3d-foundation), July 6, 2021, O3DE from Amazon Lumberyard
- [Bevy](https://bevy.org/), a data-driven engine in Rust under MIT or Apache 2.0
- [Bevy: Introduction](https://bevy.org/learn/quick-start/introduction/), a breaking release about every three months
- [Defold: About](https://defold.com/about/), the engine's history from King to the Defold Foundation
- [Cocos Engine on GitHub](https://github.com/cocos/cocos-engine), MIT, C++ and TypeScript, mini-game platform targets
- [GameMaker: Get GameMaker](https://gamemaker.io/en/get), the Free, Professional and Enterprise tiers
- [GameMaker Language manual](https://manual.gamemaker.io/monthly/en/GameMaker_Language/GameMaker_Language_Index.htm), GML as GameMaker's proprietary language
- [id Software on GitHub](https://github.com/id-Software), released source for older id engines under the GPL

**In practice**

- [CD PROJEKT RED: New Witcher saga announced (via Game Developer)](https://www.gamedeveloper.com/press-release/new-witcher-saga-announced), March 21, 2022: the move to Unreal Engine 5 and the CTO's rationale
- [Riot Games: TFT Unreal Engine Migration FAQ](https://support.riotgames.com/tft/client/tft-unreal-engine-migration-faq), June 19, 2026: leaving Hextech, new minimum specs, purchases and currency preserved
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), Unreal Engine 4 replication on VALORANT's game servers
- [Riot Games: Legends of Runeterra CI/CD pipeline](https://www.riotgames.com/en/news/legends-runeterra-cicd-pipeline), Legends of Runeterra on Unity 2020
- [Riot Games: A Trip Down the LoL Graphics Pipeline](https://www.riotgames.com/en/news/trip-down-lol-graphics-pipeline), DirectX 9 for Windows XP players and the 16.66 ms frame
- [Riot Games: Determinism in League of Legends, introduction](https://www.riotgames.com/en/news/determinism-league-legends-introduction), a deterministic server and Project Chronobreak
- [Guerrilla: Decima](https://www.guerrilla-games.com/read/decima), sharing the engine with Kojima Productions
