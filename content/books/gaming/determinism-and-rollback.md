+++
title = "Lockstep, Rollback & Determinism"
nav_title = "Lockstep & Rollback"
description = "Deterministic lockstep for RTS, rollback for fighting games, what determinism really requires, finding desyncs, and replays and rewinds from recorded inputs."
category = "Gaming Industry"
order = 1610
part = "Multiplayer"
tags = ["gaming", "determinism", "rollback", "lockstep", "ggpo", "replays"]
+++

There's a second way to make players agree about a game world. Instead of one server computing the world and sending the result to everyone ([Netcode Fundamentals](/books/gaming/netcode)), every machine computes the whole world itself, from the same starting state and the same inputs, and gets the same answer. Only inputs cross the network, so bandwidth doesn't grow with the number of units on screen, and a match can be recorded as a list of inputs a few kilobytes long and replayed exactly.

The catch is in "the same answer." Two computers given the same program and the same inputs routinely produce different results: floating point rounds differently across compilers and CPUs, containers iterate in memory-address order, a variable is read before it's written, a clock is consulted. Determinism is a property you build and then defend, and when it breaks, the symptom (one player's army is in a different place) shows up thousands of frames after the cause.

This chapter covers the two networking models built on determinism (deterministic lockstep, used by real-time strategy games, and rollback, used by fighting games), what determinism requires in practice, how teams find divergences, and the third use that needs no peer-to-peer at all: recording an authoritative server's inputs to replay, debug or rewind a match. The engine-side mechanics of fixed timesteps are in [Building Your Own Engine](/books/gaming/building-an-engine).

## Three Ways to Agree

| Model | What crosses the wire | Who simulates | Latency is felt as | Fits |
| --- | --- | --- | --- | --- |
| State synchronization | Inputs up, state down | The server; clients predict their own character | Corrections and lag compensation | Shooters, action games, MMOs |
| Deterministic lockstep | Inputs, to everyone | Every machine, the whole world, in step | Input delay on every command | RTS, large unit counts, some sports and strategy games |
| Rollback | Inputs, to everyone | Every machine, speculatively ahead | Brief visual corrections after late inputs | Fighting games, other small-state twitch games |

Glenn Fiedler's networking series frames the trade-off well: with state synchronization "we don't just send input, we send both input and state," which tolerates imperfect determinism; with deterministic lockstep "you can network a physics simulation of one million objects with the same bandwidth as just one," as long as determinism is "exact down to the bit-level."

## Deterministic Lockstep

In lockstep, the simulation advances in turns, and a turn executes only when every player's commands for it have arrived. The classic public description is Paul Bettner's 2001 article on Age of Empires, "1500 Archers on a 28.8." The target was eight players on "a 16MB Pentium 90 with a 28.8 modem," and sending the state of every unit was impossible (the article estimates it would cap games at about 250 moving units). Instead, every machine ran "the exact same simulation" from "an identical set of commands."

The mechanics:

1. **Turns.** "Turns were typically 200 msec in length." Commands a player issues during a turn are sent to every other player immediately.
2. **Scheduling ahead.** Commands are tagged for a future turn: "commands issued during turn 1000 would be scheduled for execution during turn 1002." The two-turn gap is the time the network has to deliver them; that gap is the input delay players feel.
3. **Waiting.** If a player's commands for a turn haven't arrived, everyone waits. The game runs at the speed of the slowest connection.
4. **Speed control.** Age of Empires adapted turn length to conditions: each client reported its frame rate and latency, and the host set the turn length, weighted to rise quickly when internet latency jumped and settle back slowly.
5. **Checking.** Machines exchange checksums of the world; "any simulation that ran differently was tagged as 'out of sync' and the game stopped."

Fiedler's article on deterministic lockstep adds the transport details. Over TCP, every lost packet stalls the simulation while it's retransmitted, about twice the round trip. Over UDP, send every input that the other side hasn't acknowledged in every packet; inputs are tiny (6 bits in his demo), so the redundancy is cheap, and his demo stays in sync at 2 seconds of latency and 25% packet loss. A playout delay buffer (100 ms in his implementation) absorbs jitter, and when inputs bunch up after a stall, the simulation catches up a bounded number of steps per rendered frame to avoid a "spiral of death."

A turn loop sketch:

```text
each render frame:
  sample local input; send it for turn (current + D), with all unacked inputs
  while every player's input for the current turn has arrived:
    apply inputs in player-id order          # a fixed order, never arrival order
    step the simulation one fixed step
    every K turns: send checksum(world) for this turn; compare peers' checksums
    current += 1
  if waiting on a player longer than T: show "waiting for player"; adjust D
```

D is the input delay in turns, K the checksum interval. Input order must be fixed (by player id), never arrival order, or two machines apply the same inputs differently.

Lockstep's costs are structural:

- **Input delay on everything.** Every command waits D turns. RTS players tolerate it because commands are orders, not reflexes; a shooter couldn't.
- **The slowest player sets the pace.** One bad connection slows the whole match. Speed control and dropping a player after a timeout are the mitigations.
- **Late join and reconnect are hard.** A joiner needs the full state at some turn plus every input since. Either replay the match from the start at high speed or serialize a snapshot, which means writing the state serializer you hoped lockstep would let you skip. My default is to write the serializer anyway, because replay seeking needs the same keyframes ([Replays and Spectating](#replays-and-spectating)): a reconnecting player loads the newest keyframe from the relay or host and fast-forwards through the inputs recorded since.
- **Every client has everything.** Each machine simulates the whole world, so it knows where every unit is, including under fog of war. A map hack only has to read memory. Lockstep games accept this or move the simulation to a server ([Anti-Cheat](/books/gaming/anti-cheat)).

Topology varies. Peers can send inputs to each other directly, through a host, or through a relay server that collects each turn's inputs and forwards them; a relay simplifies NAT traversal and gives you a place to record the match and detect a player who sends different inputs to different peers.

## What Determinism Requires

Determinism fails in a small number of well-understood ways. Each needs a rule, and each rule needs a tool that catches violations, because code review won't.

**Floating point.** Fiedler's survey of practitioners ("Floating Point Determinism," 2010) lands on "yes, if...": the same binary on the same CPU architecture with the same floating point settings is reliable, while naive C or C++ can't be expected to match across compilers, architectures, or even debug and release builds. The hazards it collects: x87 extended precision versus SSE, rounding mode and precision settings that a DLL can change underneath you, fused multiply-add contraction by the compiler (Microsoft documents that strict mode disables contractions), and transcendental functions (`sin`, `cos`) that differ between CPU vendors. The usual rules: ship one build per platform and compile with strict floating point, set and assert the FPU state each frame, avoid or wrap transcendental functions, and if the game must be deterministic across different architectures (a PC and a console playing together), use fixed-point or integer math for the simulation. Photon Quantum, a commercial deterministic engine for Unity, takes the last option by default: its `FP` type, Q48.16 fixed point stored in a `long`, "completely replaces all usages of `floats` and `doubles` to ensure cross-platform determinism."

**Randomness.** Every random number in the simulation must come from a seeded generator whose state is part of the game state, and every machine must make the same calls in the same order. GGPO's guide: "you must ensure that they are fully deterministic," with the same seed at frame 0 and the generator's state included in saved state. Age of Empires' programmers had to keep the number of random calls identical across machines. Factorio reimplements Lua's `math.random()` "to be deterministic," drawing at runtime from a shared generator seeded with the map seed; League of Legends unified its generators into one XOR-shift generator seeded with the game's unique id. Cosmetic randomness (particles, sound variations) uses a separate generator that the simulation never reads.

**Time.** The simulation must never read a clock. It advances by fixed steps, and anything time-based is counted in steps. GGPO warns: "Be careful if you use the current time of day in your game state calculation." Factorio's mod sandbox removes Lua's `os` and `io` libraries, "mostly to ensure determinism," which takes the clock out of mod code's reach. A codebase that didn't start this way has more clocks than anyone expects: League had "8 clock instances with 6 unique implementations" when Riot's determinism project began, and consolidating them into one recordable clock took nearly six months. (League kept a capped variable frame time rather than a fixed step, and recorded frame times instead; [Building Your Own Engine](/books/gaming/building-an-engine#league-s-choice-capped-variable-frame-time) explains the trade.)

**Order.** Iteration order must not depend on memory addresses or hash seeds. Factorio changed its embedded Lua so table iteration follows insertion order, "because Factorio has to be deterministic." Riot found League divergences from containers ordered by pointer (addresses differ between runs, especially with address-space randomization) and from recording on one operating system and playing back on another. Rule: containers in simulation code are ordered by stable ids, and unordered maps are never iterated where the order affects the outcome.

**Uninitialized memory.** A variable read before it's written holds whatever was there, which differs between runs. Riot traced a League spellcast that diverged in about 1 in 5,000 games to a three-float vector class that skipped zero-initialization for performance. Rule: initialize everything, and run a detector in the determinism suite. Clang's MemorySanitizer is "a detector of uninitialized memory use" with a typical slowdown of 3x, affordable on a nightly replay run.

**Threads.** Work split across threads must merge in a deterministic order, and the order must not depend on the machine. Factorio's FFF #415 (June 2024) traced a multiplayer desync, in the game since July 2017, to chunk generation that used all available CPU cores, so "the number of cores" changed the results slightly; it reproduced only between machines with different core counts, and the fix was found by making one machine pretend to have fewer. Riot's approach for League's server was the conservative one: a largely single-threaded loop, with other threads changing main-thread state only through deterministic blocking. Job systems are fine if results are combined in a fixed order, and the determinism test runs on machines with different core counts.

**Hidden state.** GGPO's list: static variables ("Static automatic variables in C" can't be rolled back), pointers in saved state that must be rebased on load, and anything outside the state you save. If it influences the simulation and isn't in the saved or recorded state, it's a future desync.

**Inputs from outside.** Everything that enters the simulation must be an input you record: player commands, network messages, configuration, match settings. A useful audit is to sort every input into "controlled" (constant across runs of the same version) and "uncontrolled" (noisy, random or player-generated), Riot's terms from League, and either eliminate or record each uncontrolled one. Network traffic can be recorded above the transport layer, which can stay nondeterministic.

## Finding Desyncs

A desync is found long after it happens, so detection has to be systematic:

- **Checksums per frame or per turn.** Hash the simulation state (or the parts that matter) and compare across machines. Fiedler's lockstep demo verifies with a per-frame checksum; Age of Empires checksummed the world, objects and pathfinding. Factorio plays multiplayer with a "heuristic CRC," "an incomplete but very fast check taken every tick," compared across all players; a desynced player is reconnected and redownloads the map. A checksum tells you that and when, not what.
- **State dumps at the first divergence.** Only the first divergent frame is worth reading; everything after it is noise. Factorio's debug mode CRCs the whole map every tick, replays a save alongside the original run, and saves both at the first mismatching tick for a binary diff: "since this is the first desynchronization tick the difference is usually very small," often one variable. Riot's League tooling logs game state as hierarchical key-value pairs in JSON, written at frame ends when values change, and a script reports the first divergence between two logs.
- **Reports from the field.** When a Factorio client desyncs, the game writes a desync report containing "the game state from the server and the client," which players attach to a bug report. Players find the desyncs no test suite reaches; collecting both sides of the state automatically is what makes their reports usable.
- **Self-checking modes.** GGPO's sync test "will execute a 1 frame rollback for every frame of your game," compares the results, and raises an error if they differ; run it in CI and in development builds.
- **Replay farms.** Record real matches and replay them on test hardware against the current build. Riot's May 2018 post described replaying roughly 2-3 thousand real games a day from public beta servers.
- **Make rare bugs frequent.** Inject faults (garbage in memory buffers, values forced to extremes like `FLT_MAX`), log every assignment during playback so a debugger can stop when a value changes, and vary the machine (core count, OS) the way Factorio's core-count bug needed.

My rule: a determinism test (record, replay, compare checksums) runs on every build, on every platform you ship, and a divergence fails the build like a crash. Determinism that isn't tested decays one feature at a time.

## Rollback

Lockstep makes everyone wait for inputs. Rollback doesn't wait. GGPO, the SDK that "pioneered the use of rollback networking in peer-to-peer games" in 2009, describes the difference: "traditional techniques account for network transmission time by adding delay to a players input," which feels sluggish, while "rollback networking uses input prediction and speculative execution to send player inputs to the game immediately," giving "the illusion of a zero-latency network." GGPO is open source under the MIT License. The model isn't limited to two-player peer-to-peer: Photon Quantum runs predict/rollback for any player count, with "an advanced rollback system" re-simulating mispredictions and a game-agnostic server that synchronizes clocks and manages input latency, so "clients never need to wait for a slower client."

The mechanism, per frame:

1. **Add local input** for this frame (`ggpo_add_local_input`). It's applied after a small configurable frame delay.
2. **Synchronize inputs** (`ggpo_synchronize_inputs`). For remote players whose input for this frame hasn't arrived, GGPO predicts it from the inputs it has already received. The game advances using exactly the inputs returned, and calls this "every frame, even those that happen during a rollback."
3. **Save state** for the frame, so it can be restored (`save_game_state` callback).
4. **Advance** one frame (`ggpo_advance_frame`).
5. **When a remote input arrives that differs from the prediction,** GGPO loads the saved state from the frame before the first wrong one (`load_game_state`) and calls `advance_frame` repeatedly to re-simulate up to the present with the real inputs, all within the current frame, before rendering.

The same loop, as the game sees it:

```text
each frame f:
  add_local_input(f)                        # applied at f + frame_delay
  inputs = synchronize_inputs(f)            # real where arrived, predicted where not
  if inputs fail: wait                      # a peer is past the prediction window
  if a confirmed input for some earlier frame g differs from what was predicted:
    load_state(g - 1)
    for each frame from g to f - 1: advance(confirmed or predicted inputs), save_state
  advance(inputs); save_state(f)            # into a ring of window + 1 states
  render(f); play effects held back during the resimulation
```

The saved states live in a ring as deep as the prediction window plus one, so the oldest frame a late input can reach is always restorable. Because players mostly hold or repeat inputs, predictions are usually right, and a rollback only changes what's on screen when a prediction missed. When it does, the player sees a short correction (a character snaps a few frames forward into an attack).

![Timeline plan view of rollback on one peer at 60 Hz across frames 1 to 12, 44 px per frame. In the remote input lane, frames 1 to 4 have confirmed input and frames 5 to 8 are dashed, running on predicted input; the real inputs for frames 5 to 9 arrive at the start of frame 9. In the simulation lane, frames 5 to 8 are dashed and frame 9 is shaded as the rollback frame. Dimensions: F1 = 16.67 ms per frame, P1 = 4 x F1 = 66.67 of prediction, the highlighted R1 = P1 / F1 + 1 = 5 frames simulated within frame 9, and M1 = 8 frames, GGPO's prediction limit, past which a hatched band marks a stall. Detail A expands frame 9 at 30 px per ms: A1 = 0.20 to load the saved state, four resimulated frames at S1 = 1.50 each, frame 9 itself, G1 = 5.00 to render and K1 = 3.97 of slack, summing to 16.67. At the 8-frame limit the same frame would need L1 = 18.70 ms, so each simulated frame must fit in S2 = 1.27 ms.](/diagrams/gm-determinism-and-rollback-rollback.svg "One late input, resimulated (illustrative costs; the 8-frame limit is GGPO's). The real budget of a rollback game is its worst-case resimulation: every frame of the prediction window, plus the current one, must fit in a single frame with rendering.")

The drawing shows the constraint that shapes every rollback game: in the worst case, one rendered frame has to load a state and simulate the whole prediction window plus the current frame. GGPO's prediction window is 8 frames (`MAX_PREDICTION_FRAMES` in its source); when a peer falls further behind than that, synchronizing inputs fails and the game waits. So at 60 Hz with 5 ms of rendering, a simulation step has to cost about 1.27 ms or less, and saving and loading state has to be close to free. That's why rollback suits games with small state (two characters, a stage, projectiles) and is hard for a world with thousands of physics objects.

GGPO's requirements are the determinism list plus three:

- **The state is fully encapsulated and serializable,** and saving and loading are cheap. In practice: game state in one contiguous block or arena, no pointers (or pointers rebased on load), copied with one memory copy.
- **The engine can simulate a frame without rendering it.** Rendering, audio and effects read the simulation; they never feed it.
- **Effects are deferred.** "Any effects or sounds which are generated during the rollback need to be deferred until after the rollback is finished," or a resimulated hit plays its sound five times.

**Frame delay** is the tuning knob between lockstep and pure rollback. A little input delay means fewer and shorter rollbacks; GGPO's guidance is that in fighting games "any frame delay larger than 1 can be noticed by most intermediate players," while puzzle and board games "may get away with setting the frame latency as high as 4 or 5." My default is to set the delay from the round trip measured at match start, so the rollback window only has to cover the rest.

Rollback isn't only peer-to-peer. Client-side prediction and reconciliation in a server game ([Netcode Fundamentals](/books/gaming/netcode#client-side-prediction-and-reconciliation)) is rollback applied to one player's own character: save, predict, receive the truth, rewind, replay. The difference is scope: server games roll back a character, rollback games roll back the world.

## Determinism on the Server: League of Legends

Determinism also pays when there's only one simulation. A server-authoritative game can make its server deterministic so that a recording of the server's inputs (player commands, match settings, configuration) replays the match exactly. That buys regression tests driven by recorded inputs, exact reproduction of bugs, and rewinds: an official can restore a live match to an earlier point by re-simulating to it. Because playback simulates rather than streams, it isn't throttled to real time.

The other way to get server replays is to record state: Unreal's DemoNetDriver records replay data through pluggable streamers (to local disk, memory or HTTP), with periodic checkpoints that "act as snapshots of the net changes to the world." State recording needs no determinism and survives more engine changes, but costs more storage, and it can't re-run the match through new code.

The one detailed public account of the input-recording route is Riot's 2017-2018 series on League of Legends, a live game retrofitted for it. The motivations were fast, repeatable tests from recorded inputs and Project Chronobreak, an esports rewind ([Esports & Spectating](/books/gaming/esports-and-spectating#replays-rewinds-and-recovery) covers how officials use it); the payoff figure is that "a recovery to 40 minutes often takes less than 3 minutes to execute." The cost is the cautionary part: making the server "gameplay deterministic" (identical gameplay, not byte-identical memory) took "almost a full year of effort from multiple engineers." Determinism is far cheaper designed in than retrofitted; a game that can't afford the retrofit records state instead.

## Replays and Spectating

A deterministic game gets replays almost free: store the initial state (or the seed and settings) and the inputs, and replay by simulating. An input recording is orders of magnitude smaller than a state recording. The costs are elsewhere:

- **Replays are tied to the exact build.** A replay plays back only on the build that recorded it, on a platform that computes identically. After a patch, keep old builds runnable for the recordings you promise to keep, convert them (to state snapshots or video) on the old build before it retires, or let them expire and say so to players ([Esports & Spectating](/books/gaming/esports-and-spectating#replays-rewinds-and-recovery) covers which recordings a competitive game must keep).
- **Seeking needs keyframes.** Simulating from the start to minute 35 takes time; store periodic state snapshots (or checksums plus snapshots) so playback can jump. State-recorded replays need them too, which is what Unreal's replay checkpoints are.
- **Server games can record state instead.** A non-deterministic server can record what it sends a spectator client (a stream of snapshots), which survives patches better and costs more storage ([Determinism on the Server](#determinism-on-the-server-league-of-legends)).

Spectating a live match uses the same streams with a delay (to stop spectators from relaying information to players), which belongs to [Esports & Spectating](/books/gaming/esports-and-spectating).

`match_recordings` is defined in [Esports & Spectating](/books/gaming/esports-and-spectating#replays-rewinds-and-recovery). An input recording needs a few more columns to be replayable and verifiable:

```sql
ALTER TABLE match_recordings
  ADD COLUMN rng_seed BIGINT,                      -- kind = 'inputs': the seed the match started from
  ADD COLUMN frame_count INTEGER,
  ADD COLUMN keyframe_interval_frames INTEGER,     -- state snapshots stored for seeking
  ADD COLUMN checksum_interval_frames INTEGER,     -- state checksums recorded alongside the inputs
  ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;  -- replayed once and matched every checksum
```

A recording that has never been replayed is a hope, not a replay; verify a sample on the build that made it, and every one you keep for a ruling.

Recordings capture everything every player did in the match, so their retention is a policy decision, not a default ([Data Retention](/docs/architecture/data-retention)). They're also evidence: a recording replayed on a server is how reports of cheating or abuse can be reviewed ([Player Behavior & Moderation](/books/gaming/player-behavior)).

## Choosing a Model

| If the game has | Choose | Because |
| --- | --- | --- |
| Hundreds or thousands of units, commands rather than reflexes | Deterministic lockstep | Bandwidth independent of unit count; input delay is tolerable |
| Two to a few players, small state, frame-precise inputs | Rollback | Local input feels instant; state is cheap to save and resimulate |
| Many players, fast reflexes, a need to hide information | Server state sync with prediction | Hidden information stays on the server; no one waits for the slowest player |
| A server game that needs exact replays, regression tests or rewinds | Deterministic server with input recording, or state recording if determinism can't be retrofitted | Replays and recovery from inputs; state recording is the cheaper fallback |
| Cross-platform play between different CPU architectures | State sync, or lockstep with fixed-point math | Floating point won't match across architectures by default |

My default: start with server state synchronization unless the genre clearly says otherwise, and make the simulation deterministic within a build anyway (fixed step, seeded randomness, ordered iteration, no clocks). It costs little designed in, and it buys replays, regression tests and the option to change models later.

## What This Means for the System You Build

- **A deterministic core by construction:** fixed timestep, all randomness from a seeded generator in game state, no clock reads, stable iteration order, everything initialized, deterministic merges of threaded work, and a separate generator for cosmetics.
- **One build and strict floating point per platform,** or fixed-point math if machines with different architectures must agree.
- **A determinism test on every build:** record, replay, compare per-frame checksums, with hierarchical state logs that point to the first divergence, and a replay farm of real matches.
- **For lockstep:** turns scheduled ahead with adaptive delay, inputs applied in player-id order, redundant inputs over UDP, checksums every few turns, and a plan for reconnects.
- **For rollback:** cheap save and load of a contiguous state, simulation without rendering, deferred effects, a frame delay set from the round trip, and a simulation step that fits the whole prediction window in one frame.
- **Input recordings tied to the exact build,** with keyframes for seeking, checksums for verification, a retention policy, and a decision about what happens to old replays after a patch.

## References

**Reference**

- [Glenn Fiedler: Deterministic Lockstep](https://gafferongames.com/post/deterministic_lockstep/), bit-exact determinism, bandwidth independent of object count, TCP stalls, redundant inputs over UDP and the playout delay buffer
- [Glenn Fiedler: Floating Point Determinism](https://gafferongames.com/post/floating_point_determinism/), when floating point is deterministic, x87 versus SSE, strict modes, fused multiply-add and transcendental functions
- [Glenn Fiedler: State Synchronization](https://gafferongames.com/post/state_synchronization/), sending input and state together when determinism is imperfect
- [GGPO](https://www.ggpo.net/), rollback networking created in 2009, delay-based versus rollback, and the illusion of zero latency
- [GGPO: Developer Guide](https://github.com/pond3r/ggpo/blob/master/doc/DeveloperGuide.md), the callbacks, determinism and serialization requirements, randomness, time, pointers and statics, deferred effects, frame delay guidance and sync test
- [GGPO: source, sync.h](https://github.com/pond3r/ggpo/blob/master/src/lib/ggpo/sync.h), the prediction limit `MAX_PREDICTION_FRAMES` of 8
- [GGPO: repository](https://github.com/pond3r/ggpo), input prediction and speculative execution, and the MIT License
- [Photon Quantum: Introduction](https://doc.photonengine.com/quantum/current/quantum-intro), input-only exchange, predict/rollback with re-simulation, and a server that synchronizes clocks and manages input latency so clients never wait for a slower one
- [Photon Quantum: Fixed point](https://doc.photonengine.com/quantum/current/manual/quantum-ecs/fixed-point), the Q48.16 `FP` type replacing floats and doubles for cross-platform determinism
- [Factorio: Lua libraries and functions](https://lua-api.factorio.com/latest/auxiliary/libraries.html), deterministic `pairs()` iteration order, a deterministic `math.random()` seeded from the map, and `os` and `io` removed for determinism
- [Clang: MemorySanitizer](https://clang.llvm.org/docs/MemorySanitizer.html), a detector of uninitialized memory use and its typical 3x slowdown
- [Unreal Engine: DemoNetDriver and Streamers](https://dev.epicgames.com/documentation/en-us/unreal-engine/demonetdriver-and-streamers-in-unreal-engine), replay recording through streamers and checkpoints as snapshots of net changes

**In practice**

- [Game Developer: 1500 Archers on a 28.8: Network Programming in Age of Empires and Beyond](https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond), simultaneous simulation, 200 ms turns scheduled two turns ahead, speed control and out-of-sync detection (March 22, 2001)
- [Factorio: Friday Facts #47, CRC fun](https://factorio.com/blog/post/fff-47), a whole-map CRC every tick, replaying a save and diffing both saves at the first desynchronized tick (August 15, 2014)
- [Factorio: Friday Facts #55, MP preview](https://factorio.com/blog/post/fff-55), the fast heuristic CRC every tick and automatic reconnect of desynced players (October 10, 2014)
- [Factorio: Friday Facts #188, Bug, Bug, Desync](https://factorio.com/blog/post/fff-188), deterministic lockstep and desync reports with server and client game state (April 28, 2017)
- [Factorio: Friday Facts #415, Fix, Improve, Optimize](https://factorio.com/blog/post/fff-415), a threading determinism bug from July 2017 that depended on CPU core count (June 14, 2024)
- [Riot Games: Determinism in League of Legends: Introduction](https://www.riotgames.com/en/news/determinism-league-legends-introduction), a deterministic server for recorded-input tests and Project Chronobreak, and fast recovery playback (June 20, 2017)
- [Riot Games: Determinism in League of Legends: Implementation](https://www.riotgames.com/en/news/determinism-league-legends-implementation), controlled and uncontrolled inputs, the unified random generator, the clock work's length, pointer-ordered containers, threads and almost a year of effort (2017)
- [Riot Games: Determinism in League of Legends: Unified Clock](https://www.riotgames.com/en/news/determinism-league-legends-unified-clock), 8 clock instances with 6 implementations consolidated into one (October 10, 2017)
- [Riot Games: Determinism in League of Legends: Fixing Divergences](https://www.riotgames.com/en/news/determinism-league-legends-fixing-divergences), hierarchical state logs, the first divergence, the replay farm, fault injection and the 1-in-5,000 uninitialized vector (May 1, 2018)
