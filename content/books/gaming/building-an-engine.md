+++
title = "Building Your Own Engine"
description = "How a game engine works inside: the core loop, fixed timesteps and interpolation, frame budgets, job systems, ECS, streaming, and when building one pays."
category = "Gaming Industry"
order = 1603
part = "How Games Get Made"
tags = ["gaming", "game-engines", "game-loop", "ecs", "performance"]
+++

[The Engine Landscape](/books/gaming/engine-landscape) covers what you can license: Unreal, Unity, Godot and the rest, their terms and what each is built for. This chapter is about what is inside any of them, the parts you would write if you built your own, and the public reasoning studios give when they decide to build, keep or abandon one.

An engine is three things that get mistaken for one. There is a **runtime**: the loop that reads input, advances the world, draws it and plays its sound, sixty or more times a second, on hardware the studio doesn't control. There are **tools**: the editor, importers, debuggers and profilers the team lives in all day. And there is a **pipeline** that turns what artists and designers make into what the runtime loads ([Production Pipelines & Builds](/books/gaming/production-pipelines) owns that one). The runtime gets the attention; the tools and pipeline are where most of the cost goes, and they're why the decision at the end of this chapter is rarely about rendering.

![An exploded axonometric drawing of a game client as six stacked plates, bottom to top: 01 platform layer (OS, input devices, graphics API, audio), 02 engine core (memory, jobs, assets, time), 03 simulation (fixed-step world, physics, AI), 04 rendering (scene, draw submission, GPU resources), 05 UI (menus, HUD, input focus) and 06 game code (rules, content, modes). An arrow at the right says calls go down.](/diagrams/gm-client-exploded.svg "The layers of a game client. Each calls only the layers beneath it, and only the platform layer touches the OS and devices; that one rule is what makes an engine portable.")

## The Core Loop

Every engine, licensed or not, is built around one loop. Robert Nystrom's *Game Programming Patterns* states its intent as "decouple the progression of game time from user input and processor speed": unlike an application that sleeps until the user does something, a game loop "processes user input, but doesn't wait for it." Each pass does four things:

1. **Input.** Read what the devices reported since the last pass (and, in a networked game, what the server sent) into a snapshot the rest of the frame reads. Input that arrives after the read waits for the next frame, which is one source of latency the frame budget below makes visible.
2. **Simulate.** Advance the world: gameplay rules, movement, physics, animation state, AI. This is the part that has to be correct, and in multiplayer the part that may have to be reproducible ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)).
3. **Render.** Turn the world's state into draw commands: which objects are visible, which level of detail, which materials, in which order, then submit them to the GPU.
4. **Present.** Hand the finished image to the display, usually synchronized to its refresh.

The engine around the loop exists to make those four steps fast, predictable and safe to change. The layering above is the usual shape: a platform layer that hides the operating system, devices and graphics API; a core of memory, threading, asset loading and time; simulation and rendering on top; UI and game code at the top. Godot documents the same separation in its architecture diagram, with rendering, audio and physics implemented as "servers" ("singleton objects initialized at engine startup") beneath a scene layer.

## Fixed and Variable Timesteps

The first real design decision is how the simulation measures time. The naive loop measures how long the last frame took and passes that delta time (`dt`) to everything. Glenn Fiedler's "Fix Your Timestep!" (2004) is the standard explanation of why that breaks: "the behavior of your physics simulation depends on the delta time you pass in." A spring that is stable at 60 frames a second explodes at 20; a jump reaches a different height on a fast machine than a slow one; two players with different hardware get different games.

Fiedler walks through the alternatives:

- **Fixed `dt`, locked to the display.** Simple and stable, but only if every frame finishes in time and every display runs at the rate you assumed.
- **Variable `dt`.** Smooth on any hardware, but the simulation's results depend on the frame rate.
- **Semi-fixed.** Cap the step, and take several capped steps when a frame runs long. Better, but it invites the **spiral of death**, "what happens when your physics simulation can't keep up with the steps it's asked to take": a slow frame demands more steps, which makes the next frame slower.
- **Free the physics.** The renderer "produces" time and the simulation "consumes" it in fixed `dt` steps through an accumulator. Frame time is clamped before it's added (Fiedler's example uses 0.25 seconds), so a long stall can't demand unbounded catch-up.

```text
accumulator += min(frame_time, 0.25)
while accumulator >= dt:
    previous = current
    current = simulate(current, dt)
    accumulator -= dt
alpha = accumulator / dt
render(lerp(previous, current, alpha))
```

Nystrom recommends the same structure: fixed update, variable render, a lag accumulator, a cap on inner iterations, and interpolation for the leftover. Engines expose it directly. Unity runs `FixedUpdate` on its own fixed rate: when the frame rate is higher, "each frame has one fixed update or none at all"; when it's lower, Unity "performs an average of two or three fixed updates per frame to keep up," and "there is a maximum timestep period beyond which Unity will not attempt to catch up." Godot calls `_process()` once per drawn frame, while "physics processing happens at a fixed rate, 60 times per second by default." Riot's VALORANT netcode post says the game runs movement and physics "with a fixed timestep: exactly 128 times per second," on both clients and servers, regardless of render frame rate.

### Interpolating Render State

The accumulator leaves a remainder: time that has passed but hasn't been simulated, because it's less than one step. Rendering the latest simulated state would make motion stutter, since some frames advance two steps and some none. Fiedler's answer is to keep the previous state and blend: `alpha = accumulator / dt`, and the drawn state is `current * alpha + previous * (1 - alpha)`. VALORANT's post describes the same move: "We then linearly interpolate the state of the world within a move update."

![A timeline drawing with three rows over 70 ms at 8 px per ms. The top row shows four render frames of 12, 20, 14 and 24 ms. The middle row shows seven fixed simulation steps of 10 ms each. The bottom row hatches the time carried forward at each frame end: 2, 2, 6 and 0 ms. A table gives, per frame, the accumulated time, the steps run (1, 2, 1, 3), the carry and alpha (0.2, 0.2, 0.6, 0.0). Detail B shows frame 3 drawn at t = 36, 60 percent of the way from the previous state at t = 30 to the current state at t = 40.](/diagrams/gm-building-an-engine-timestep.svg "Variable frames, fixed steps (illustrative). The frames sum to 70 ms and the steps to 7 × 10 ms; interpolation draws the world exactly one step behind real time.")

The drawing shows the price. With interpolation, the image is always exactly one step behind the newest simulated state (frame 3 draws t = 36 at a wall-clock time of 46). At a 128 Hz step that is 7.8 ms; at 30 Hz it is 33 ms, which players feel. The alternatives are extrapolating forward from the current state, which removes the delay but draws positions that may never happen, or shortening the step. For a competitive game, my default is a short step plus interpolation; extrapolation belongs to remote entities in netcode, where [Netcode Fundamentals](/books/gaming/netcode) covers it.

Interpolation also has to know what not to blend. A teleport, a respawn or a camera cut should snap, not slide across the map for one frame, so state carries a flag or a generation counter that tells the renderer the previous state no longer applies.

### League's Choice: Capped Variable Frame Time

A fixed step is the textbook answer, and Riot's public account of League of Legends shows why a shipped game might not take it. In "Determinism in League of Legends: Unified Clock" (October 2017), Rick Hoskinson writes that when the determinism project started, the codebase had "8 clock instances with 6 unique implementations," and that League's server runs a capped, variable frame time rather than a fixed step. The post calls a fixed frame time "a more satisfying solution to the determinism problem," because it removes frame time as an input. The team still kept the capped frame rate, and the reason is about players: under a fixed step, a server that falls behind runs the game in slow motion; under a capped variable step, it lowers its update rate, adding latency the game already compensates for. Since server slowdowns are rare, Riot judged that "slowdown would likely be more jarring than temporary additional latency." Instead of changing the timestep, Riot chose what the post calls "a playback recording solution," which had less impact on the delivery schedule and let the team ship Project Chronobreak (below) at the start of Season 7.

The general lesson: a fixed step is the right default for a new engine, and switching a shipped game to one is a product decision as much as a technical one. Unifying the clocks (one source of game time that every system reads, recorded for replay) was the step that mattered either way.

## The Frame Budget

A frame rate is a budget in milliseconds. At 60 frames a second there are 1000 / 60 = 16.67 ms; Riot's 2017 tour of the League renderer puts it as "to achieve 60+ frames per second this work must be done in less than 16.66ms." At 30 it is 33.3 ms, at 120 it is 8.3, and a server ticking 128 times a second has 7.8125 ms per tick ([Game Servers & Hosting](/books/gaming/game-servers) covers how Riot's VALORANT servers fit several games per core inside that).

![A dimensional drawing of one 60 Hz frame and two pipelined frames. The first plan view shows a 16.67 ms frame split into input 0.50, simulation 4.00, render submit 3.00, GPU 8.00 and present 1.17 ms, with a detail view of the input window and its latch. The second plan view shows the CPU preparing frame N+1 while the GPU draws frame N: the CPU side takes 7.50 ms, the GPU side 9.17 ms, so the pipelined frame interval is 9.17 ms, the CPU waits 1.67 ms, and one frame's latency from input to present is still 16.67 ms. A variable table and notes explain that the split is illustrative.](/diagrams/gm-frame-budget.svg "A frame is a budget, not a target. Serially every stage must fit F1; pipelined, each processor must fit it on its own, the slower side sets the pace, and latency doesn't shrink.")

The split in the drawing is illustrative; real numbers come from profiling the target hardware. Two things in it are structural. First, input is read once per frame, at a latch, so an event that lands just after it waits a whole frame. Second, engines don't run frames serially: the CPU prepares frame N+1 while the GPU draws frame N. Pipelining raises throughput to whatever the slower side allows (P1 in the drawing), but a single frame's journey from input to screen is as long as before, plus any time it sits in the queue. Every frame of queue added for smoothness is a frame of latency, which is why competitive games expose settings that shorten it.

Riot's post on League's renderer is a good picture of what fills a frame in a real game. The Windows renderer was limited to DirectX 9 features because, as of January 2017, "there are over ten million games per month played on Windows XP, so to maintain backwards compatibility we have to support DirectX 9." The post walks through 13 render stages in order (fog of war, shadows, static geometry, skinned meshes, outlines, grass, water, decals, special outlines, particles, post-processing, damage and health bars, and the HUD) and an example frame of about 200,000 triangles, "90,000 of them used for the particles alone," with "28 million pixels... rendered by 695 draw calls." The lesson isn't the numbers, which belong to one game and one year; it's that the audience's oldest hardware set the API, and the API set what the renderer could do.

My rule: give every subsystem a budget in milliseconds and in memory, per target platform, and measure against it in every build. A frame is a shared resource like a database connection pool; without budgets, every team spends it, and the overrun shows up as a frame-rate problem nobody owns. [Production Pipelines & Builds](/books/gaming/production-pipelines#performance-budgets) covers enforcing budgets in CI.

## Threads and Job Systems

A modern CPU has many cores, and a frame that runs on one of them wastes the rest. Early engines split work by system: a game thread, a render thread, an audio thread, a loading thread. That helps, but the busiest thread still sets the frame time, and the split can't use more cores than it has systems.

The model engines converged on is the **job system**: work is broken into small jobs with declared dependencies, and a pool of worker threads, about one per core, runs whatever is ready. Unity's documentation describes the pattern: worker threads "dependent on the number of CPU cores available," a scheduler that "ensures that there are only enough threads to match the capacity of the CPU cores," and work stealing, where an idle worker "looks at the other worker threads' queues and then processes tasks assigned to another worker thread." A frame becomes a graph: animate all characters (thousands of independent jobs), then resolve physics, then cull and build draw lists in parallel per view, then submit.

The hard part isn't the scheduler, it's data. Two jobs that write the same memory race, and races in a game show up as one-in-a-million crashes and desyncs. Unity's safety system "detects all potential race conditions" and gives each job "a copy of the data it needs to operate on rather than a reference." The general rules:

- **Declare reads and writes.** A job states which data it reads and which it writes; the scheduler runs two jobs at once only when their writes don't overlap anything the other touches.
- **Prefer data in arrays.** Jobs that process slices of a contiguous array split cleanly; jobs that chase pointers through an object graph don't.
- **Keep the order deterministic.** If results are combined in whatever order threads finish, the simulation stops being reproducible. Combine in a fixed order, or make the combination order-independent.
- **Keep the main thread for what must be serial,** such as calls into platform APIs that require it.

## Objects, Components and ECS

How the world is represented in memory decides how fast the simulation can run and how easily designers can make new things.

The first instinct is an **inheritance hierarchy**: `Entity`, then `Character`, then `Player` and `Monster`. It fails as soon as behaviors overlap. Nystrom's Component pattern chapter describes the problem (a class that needs two parents' behavior) and the fix: "allow a single entity to span multiple domains without coupling the domains to each other." The entity becomes a container of components: one for rendering, one for physics, one for input. Unreal's model is this: an Actor is "any object that can be placed into a level," built from components, with the transform on its root component; ActorComponents carry "conceptual functionality, like AI or interpreting player input"; and `UObject` underneath provides garbage collection, reflection, serialization and network replication. Godot's version is a tree of nodes in scenes, communicating through signals. These models are friendly to designers and to editors, because an object is a thing you can select, inspect and save.

The cost is memory layout. Each object lives wherever it was allocated, so updating 10,000 of them chases 10,000 pointers, and the CPU spends more time waiting for memory than computing. Nystrom's Data Locality chapter is the short version: "arrange data to take advantage of CPU caching." In his test, laying components out contiguously "made the update loop fifty times faster than the previous version."

An **entity component system (ECS)** takes the component idea to the end. An entity is just an ID. Components are plain data with no behavior. Systems are functions that run over every entity with a given set of components. Storage is organized for the systems, not the objects:

- **Unity's Entities package** (part of DOTS) "provides a data-oriented implementation of the Entity Component System (ECS) architecture." Entities with the same set of components share an archetype, stored in chunks: "each chunk consists of 16 KiB," and "a chunk contains an array for each component type, plus an additional array to store the entity IDs." When an entity is removed, "the last entity of the chunk is moved to fill the gap," so arrays stay dense.
- **Unreal's MassEntity** is "a framework for data-oriented calculations available in Unreal Engine 5": Fragments are "an atomic piece of data used in calculations," Processors are "stateless classes that supply the processing logic," and entities of identical composition form archetypes stored in chunks. Epic's page never uses the term ECS, but the structure is the same.
- **Bevy** is built on its own ECS, where components are Rust structs and systems are Rust functions ([The Engine Landscape](/books/gaming/engine-landscape#other-engines-worth-knowing) has its license and release cadence).

The storage, sketched:

```text
archetype {Position, Velocity, Health}
  chunk 0 (fixed size):
    entity_ids: [e17, e42, e99, ...]
    positions:  [p17, p42, p99, ...]   // contiguous
    velocities: [v17, v42, v99, ...]
    healths:    [h17, h42, h99, ...]

movement system: for each chunk with Position and Velocity:
    for i in 0..count: positions[i] += velocities[i] * dt
```

Adding or removing a component moves an entity to a different archetype, which is a copy; structural changes are usually deferred to a sync point so systems iterating chunks don't see them mid-loop.

ECS isn't a free upgrade. It's harder to debug (there's no object to click on), harder for designers to author directly, and awkward for one-of-a-kind logic like a boss fight script. My default: objects and components for gameplay that designers author and that exists in small numbers, and data-oriented storage for the large homogeneous sets (projectiles, crowds, particles, minions, physics bodies) where the cost actually is. Unity and Unreal both ship that hybrid: GameObjects or Actors on top, Entities or Mass underneath for the parts that need it.

## Memory and Asset Streaming

Consoles and phones have fixed memory, and a game that exceeds it doesn't slow down, it crashes. Engines manage memory far more deliberately than application code:

- **Budgets per category and platform:** textures, meshes, audio, animation, gameplay, UI, with the total held below the platform's limit, tracked in every build.
- **Allocators by lifetime.** A per-frame linear allocator (bump a pointer, reset at frame end) for temporary data; pools for fixed-size objects that come and go; long-lived heaps for level data. Garbage-collected languages need the same discipline in different form: avoid allocating in the frame loop, or a collection pause lands mid-fight.
- **Fragmentation awareness.** A heap with enough free bytes in total can still fail a large allocation, so long sessions get tested, not just level loads.

**Streaming** is how a world larger than memory fits. The engine keeps a resident set near the player and loads the rest asynchronously, ahead of need, from disk or the network:

- **What to load** comes from position, direction of travel, upcoming events and level-of-detail rules. Unreal's Nanite takes this to individual geometry: meshes are split into hierarchical clusters at import and streamed on demand, and "it intelligently does work on only the detail that is visible on-screen and no more."
- **How it's packed** decides how fast it loads. Assets read together should be stored together, compressed in a format the platform decodes quickly. Unreal's packaging splits content into chunks so DLC and patches ship separately and a streaming install can prioritize what's needed first, letting players "interact with a shipped project before it's finished installing."
- **What happens when it's late** is a design decision: a lower level of detail, a placeholder, or a hidden loading moment (a corridor, an elevator). A hitch is the worst option.

Asset references in the data should be stable IDs, not file paths, so the pipeline can repack content without breaking the game, and patches can replace content by ID ([Patching & Content Delivery](/books/gaming/patching)).

## Determinism

Some features need the simulation to produce the same result from the same inputs: lockstep and rollback multiplayer, replays recorded as inputs, server-side verification, and reproducing a bug from a recording. The engine is where determinism is won or lost, because every source of divergence is an engine decision: a wall clock read instead of simulation time, floating point that differs across compilers and CPUs, iteration in pointer or hash order, threads combined in completion order, uninitialized memory, unseeded randomness, and engine or middleware internals you can't see. [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback#what-determinism-requires) gives the rule and the detection tool for each, and explains how League's server was made deterministic for replays and Project Chronobreak.

What the engine owes the rest of the game is three seams, designed in from the first day:

- **One simulation clock and one seeded generator,** both part of the state, so nothing in the simulation reads the outside world except through recorded inputs.
- **A state hash** the engine can compute at any step over everything the simulation owns, in a fixed order.
- **An input recorder and player** at the boundary where commands enter the simulation.

With those, the record, replay and compare test in [Finding Desyncs](/books/gaming/determinism-and-rollback#finding-desyncs) is short to write and cheap to run on every build. Retrofitting the seams into a shipped engine is a long project; designing them in is not.

## Tools and the Editor

A runtime without tools is a demo. The editor is where a team spends its days, and its quality sets how fast content gets made. What an engine's tools layer needs:

- **Reflection.** The engine has to know the fields of its own types to show them in an inspector, save them, load them, diff them, replicate them and expose them to scripting. Unreal builds this into `UObject` through `UCLASS`, `UPROPERTY` and `UFUNCTION` markup; a custom engine needs its own, usually a code generator or macros.
- **Serialization with versioning,** so data saved by last month's build still loads after a field is renamed.
- **Fast iteration.** Hot reload of scripts, shaders and assets while the game runs. Every second between a change and seeing it is multiplied by every person on the team, every day.
- **Scripting for designers.** Unreal's Blueprints, "a complete gameplay scripting system based on the concept of using a node-based interface," or a text language such as Godot's GDScript or Lua. Designers who wait for engineers to change a number are designers not designing.
- **Importers and validation** for every source format artists use, with errors at import, not at runtime.
- **Profiling hooks** compiled into development builds and compiled out of shipping ones ([Production Pipelines & Builds](/books/gaming/production-pipelines#profiling)).

## Build, Buy or Both

The argument has been public for a long time. At GDC 2012's "great middleware debate," Alexander Bruce (*Antichamber*) argued for licensed engines: "Building your own engine is like building your own Photoshop," and "engines are about optimization," so licensed tech frees a team to work on design. John Edwards (thatgamecompany) argued for custom tech: licensed engines bring "leaky abstractions" (an engine built for one genre makes others harder), features you don't need pull at the team ("the engine is hungry… like a small child, starving for food"), and "engines can give you the illusion of progress."

The clearest recent public decisions are studios moving off proprietary engines: CD PROJEKT RED from REDengine to Unreal Engine 5 in 2022, and Riot's Teamfight Tactics from Hextech, the engine it shared with League of Legends, to Unreal in 2026. [The Engine Landscape](/books/gaming/engine-landscape#studios-changing-engines) quotes both and lists what a migration touches. Both read the same way: the engine was capable, and the cost was keeping it current for every new game and sharing it between teams. That's the real comparison. My read of the arithmetic: the license fee ([The Engine Landscape](/books/gaming/engine-landscape) has current terms) is usually small next to the salaries of an engine team, the tools team behind it, and the years before the editor is as good as the one you could have licensed.

Building, or keeping, your own engine is justified when:

- **The game's core is something engines don't do well,** such as a deterministic simulation of thousands of units, an unusual rendering model, or a world that has to run on a narrow hardware floor, and you need to own that core.
- **You can amortize it** over several games or a game that runs for a decade, with a team that maintains it as a product.
- **You'll own the tools too.** If the plan is a custom runtime with no editor, the cost moves onto every content creator.
- **Platform reach isn't the constraint,** or you're willing to build and certify each port yourself.

Otherwise license, and spend the engineering on the parts players notice. The common middle path is to license an engine and own a few systems that matter: a custom simulation core for determinism, a custom netcode layer, a custom renderer feature. Engines with source access make that possible: Unreal's source is available to licensees through Epic's GitHub organization or Perforce, and Godot, O3DE and Bevy are open source. My rule: decide which two or three systems are the game, own those, and license everything else.

## What This Means for the System You Build

- **A loop with a fixed simulation step,** an accumulator, clamped frame time and interpolation, with snaps for teleports and cuts. If you can't use a fixed step, unify every clock into one recorded source of game time.
- **Budgets in milliseconds and megabytes** for every subsystem on every platform, measured every build, with an owner for each.
- **A job system with declared reads and writes** and deterministic combination order.
- **Objects for authored gameplay, data-oriented storage for large sets,** with stable entity and asset IDs.
- **Streaming designed with the content,** packed by access pattern, with a defined fallback when data is late.
- **A determinism test from the first week** that replays recorded input and compares state hashes frame by frame.
- **Tools as part of the engine:** reflection, versioned serialization, hot reload, designer scripting and import validation.
- **A written build-or-license decision** naming the systems you'll own and why, revisited before each new game.

## References

**Reference**

- [Gaffer On Games: Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/), variable and semi-fixed steps, the spiral of death, the accumulator, clamped frame time and interpolation by alpha
- [Game Programming Patterns: Game Loop](https://gameprogrammingpatterns.com/game-loop.html), decoupling game time from input and processor speed, fixed update with variable render
- [Game Programming Patterns: Component](https://gameprogrammingpatterns.com/component.html), why inheritance fails for overlapping behaviors and how components decouple domains
- [Game Programming Patterns: Data Locality](https://gameprogrammingpatterns.com/data-locality.html), contiguous data for cache efficiency and the fifty-fold speedup in the author's test
- [Unity Manual: Fixed updates](https://docs.unity3d.com/Manual/fixed-updates.html), zero, one or several fixed updates per frame and the maximum catch-up timestep
- [Unity Manual: Job system overview](https://docs.unity3d.com/Manual/job-system-overview.html), worker threads per core, work stealing and the safety system
- [Unity Entities: Introduction](https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/index.html), Entities as DOTS's data-oriented ECS
- [Unity Entities: Archetypes](https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/concepts-archetypes.html), archetypes, 16 KiB chunks, per-component arrays and swap removal
- [Unreal Engine: Overview of Mass Entity](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-mass-entity-in-unreal-engine), fragments, processors, archetypes and chunks
- [Unreal Engine: Objects](https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine), UObject garbage collection, reflection, serialization and replication
- [Unreal Engine: Actors](https://dev.epicgames.com/documentation/en-us/unreal-engine/actors-in-unreal-engine), actors and component types
- [Unreal Engine: Blueprints visual scripting](https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprints-visual-scripting-in-unreal-engine), the node-based gameplay scripting system
- [Unreal Engine: Nanite virtualized geometry](https://dev.epicgames.com/documentation/en-us/unreal-engine/nanite-virtualized-geometry-in-unreal-engine), cluster hierarchies streamed on demand
- [Unreal Engine: Packaging your project](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project), chunks for DLC, patches and streaming install
- [Unreal Engine: Downloading source code](https://dev.epicgames.com/documentation/en-us/unreal-engine/downloading-source-code-in-unreal-engine), source access through GitHub or Perforce
- [Godot Docs: Idle and physics processing](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html), per-frame processing and the 60 Hz default physics rate
- [Godot Docs: Architecture diagram](https://docs.godotengine.org/en/stable/engine_details/architecture/godot_architecture_diagram.html), scene, server and driver layers
- [Bevy](https://bevy.org/), a data-driven engine in Rust on its own ECS

**In practice**

- [Riot Games: A Trip Down the LoL Graphics Pipeline](https://www.riotgames.com/en/news/trip-down-lol-graphics-pipeline), DirectX 9 for Windows XP players, 13 render stages, triangle and draw call counts and the 16.66 ms budget
- [Riot Games: Determinism in League of Legends, Unified Clock](https://www.riotgames.com/en/news/determinism-league-legends-unified-clock), eight clocks, capped variable frame time and why a fixed step was not adopted
- [Riot Games: Determinism in League of Legends, Introduction](https://www.riotgames.com/en/news/determinism-league-legends-introduction), a deterministic server, Delta Checker and Project Chronobreak
- [Riot Games: Peeking into VALORANT's Netcode](https://www.riotgames.com/en/news/peeking-valorants-netcode), a fixed 128 Hz step on client and server and interpolation within a move update
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), the 7.8125 ms server frame
- [Riot Games: TFT Unreal Engine migration FAQ](https://support.riotgames.com/tft/client/tft-unreal-engine-migration-faq), leaving Hextech for Unreal in 2026
- [Game Developer: New Witcher saga announced](https://www.gamedeveloper.com/press-release/new-witcher-saga-announced), CD PROJEKT RED's move from REDengine to Unreal Engine 5 (March 2022)
- [Game Developer: GDC 2012, the great middleware debate](https://www.gamedeveloper.com/programming/gdc-2012-the-great-middleware-debate), the public arguments for licensed and custom engines
