+++
title = "Netcode Fundamentals"
description = "Authority, what crosses the wire, prediction, reconciliation, interpolation, lag compensation, peeker's advantage, tick rate and relevancy, mechanism first."
category = "Gaming Industry"
order = 1608
part = "Multiplayer"
tags = ["gaming", "netcode", "multiplayer", "latency", "lag-compensation", "udp"]
+++

A multiplayer game is a shared world that nobody actually shares. Every player sees a slightly different version of it, assembled from information that is already old when it arrives, and the game's job is to make those versions agree where it matters (who got hit, who picked up the item, who won the round) while hiding the disagreement everywhere else. Netcode is the collection of techniques that does this. None of them removes latency; light in fiber still takes its time. Each one moves the latency somewhere the player is less likely to notice, and each move has a cost that someone pays.

This chapter covers the mechanisms every real-time multiplayer game is built from: who holds the truth, what goes over the wire and how, how the client hides its own latency (prediction and reconciliation), how it shows other players smoothly (interpolation), how the server judges a shot fairly (lag compensation), why the player who peeks a corner wins, what tick rate and relevancy cost, what you can adopt, and how I'd order the server tick. The server process that runs all this, and the fleet that hosts it, are in [Game Servers & Hosting](/books/gaming/game-servers). Games that agree by running the same simulation everywhere (lockstep and rollback) are in [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback). Cheating, which shapes every decision below, is in [Anti-Cheat](/books/gaming/anti-cheat).

## Topologies and Authority

The first decision is where the truth lives. There are four common answers.

**Authoritative client-server.** One server runs the real simulation; clients send what the player did (inputs) and receive what happened (state). Gabriel Gambetta's widely read series puts it plainly: the server is "the one and only authority regarding everything that happens in the world," and clients are untrusted, on the principle to "always assume the worst" about players. Glenn Fiedler traces the lineage to Quake in 1996 and quotes Tim Sweeney's rule, "The Server Is The Man." The major engines are built on this model. Unreal: "UE uses the client-server architecture for networked multiplayer games." Valve's Source: the server "is authoritative about world simulation, game rules, and player input processing," and clients never talk to each other. Games on top say the same about cheating: Riot's July 2020 netcode post says "VALORANT uses a server-authoritative networking model to limit the types of cheats possible." Authority is the strongest anti-cheat measure a game has, because a client that only sends inputs can't claim it has full health or teleport through a wall.

**Listen server.** One player's machine is the server. Unreal's net modes name the difference: a `DedicatedServer` is "a server with no local players," a `ListenServer` is "a server that also has a local player who is hosting the game." Epic's guidance is that listen servers are easy to start and suit casual and small-group play, but the host has an advantage (zero latency to the authority) and carries the extra load; dedicated servers cost more and are fairer and more efficient, and suit competitive and large games. Listen servers also end the match when the host leaves, unless the game supports host migration, which is hard to get right.

**Peer-to-peer.** Every machine talks to every other. Fiedler's history describes the original form, deterministic lockstep in Doom and RTS games: each peer runs the same simulation and exchanges only commands, everyone waits for the most lagged peer, and late joining is impractical. Fighting games use peer-to-peer with rollback today. Both are deterministic designs with their own chapter, [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback). Peer-to-peer without determinism (each peer owning its own character) is cheap to host and easy to cheat in, because every peer is an authority over something.

**Relays.** A relay forwards packets between players or between players and servers without running the game. Valve's Steam Datagram Relay is the best-documented example: a "virtual private gaming network" for both peer-to-peer and dedicated-server traffic. Hiding addresses is the DDoS half of its value ([Game Servers & Hosting](/books/gaming/game-servers#ddos-protection)), and routing over a private backbone is the latency half ([The Network Between Player and Server](/books/gaming/game-servers#the-network-between-player-and-server)). A relay solves NAT traversal and IP exposure for peer-to-peer games; it doesn't solve authority.

| Topology | Truth lives | Hosting cost | Cheating surface | Typical genres |
| --- | --- | --- | --- | --- |
| Dedicated, authoritative | Your server | Highest: a process per match | Smallest | Competitive shooters, MOBAs, battle royale |
| Listen server | One player's machine | None | The host is trusted | Co-op, casual, small groups |
| Lockstep peer-to-peer | Everyone, identically | None (or a relay) | Full state on every client | RTS |
| Rollback peer-to-peer | Everyone, identically | None (or a relay) | Full state on every client | Fighting games |
| Relay in front of any of these | Unchanged | Relay bandwidth | Hides IPs | Anything with exposed peers |

My default for anything competitive is a dedicated authoritative server, with a relay or protected network in front when the budget allows. The rest of this chapter assumes it.

## What Crosses the Wire

An authoritative server can send clients one of two things, and most games send both.

**Inputs** are small and deterministic in meaning: buttons, aim angles, a sequence number. Clients send inputs up; the server never trusts anything else from them. Inputs going down to other clients only work when every machine simulates identically (lockstep and rollback).

**State** is what the simulation produced: positions, velocities, health, animation state. Servers send state down, either as full **snapshots** of everything relevant to that client, or as **deltas** against the last snapshot the client acknowledged. Fiedler's articles give the scale of the problem: naively sending 60 snapshots a second of his 900-cube demo costs about 11.6 Mbit/s, and dropping to 10 a second cuts it to about 2 Mbit/s. His state-synchronization design sends input and state together ("we don't just send input, we send both input and state"), uses a **priority accumulator** so low-priority objects still get sent eventually (every object adds its priority to an accumulator each frame, the highest go out, and sent objects reset to zero), quantizes state identically on both sides so the client simulates exactly what it was sent, and fits a 256 kbit/s cap. Delta compression is "another order of magnitude improvement" at the cost of an acknowledgment system.

### Reliability Over UDP

Real-time games run over UDP and build only the reliability they need on top. TCP delivers a byte stream in order, so a lost packet blocks everything behind it until it is retransmitted: Fiedler's "UDP vs. TCP" explains that "you cannot access it until that lost packet has been retransmitted," and in lockstep over TCP each loss stalls the game for about twice the round trip. For a position update that's useless anyway by the time it arrives, waiting is the wrong behavior. Fiedler's rule is "Don't mix TCP and UDP!" for the game protocol; HTTP to web services alongside it is fine.

Game messages fall into three classes, and a good protocol treats them differently:

- **Unreliable, latest wins.** Movement and state snapshots. A newer one supersedes a lost one; never retransmit.
- **Reliable, ordered.** Chat, purchases in the buy phase, a round ending. Retransmit until acknowledged, deliver in order on its own channel so it can't block movement.
- **Reliable by redundancy.** Inputs. Instead of waiting to retransmit, every packet carries all inputs the other side hasn't acknowledged yet. Fiedler shows lockstep surviving 2 seconds of latency and 25% loss this way, with inputs of 6 bits each.

Unreal's own guidance echoes the split: make RPCs "unreliable if they are called especially often," and "use caution when binding reliable RPCs to player input," because a player mashing a button can overflow the reliable queue.

Packet size matters in a way it doesn't for web traffic. Riot's 2015 networking post measured League of Legends packets at about 55 bytes against the internet's typical 1,500, and explained why that hurts: "routers aren't counting the size of the packet, just the quantity," so game traffic "fills the buffer 27x as quickly," and many routers drop UDP first under load without being able to tell a game's reliable UDP from anything else.

A minimal packet header for an authoritative shooter looks like this:

```c
struct PacketHeader {
    uint16_t sequence;      // this packet's number, wraps around
    uint16_t ack;           // newest sequence received from the other side
    uint32_t ack_bits;      // bit n set: received (ack - 1 - n), so 33 acks per packet
    uint32_t server_tick;   // client to server: the tick it was rendering (for rewind)
};

struct ClientInputPacket {
    struct PacketHeader header;
    uint8_t  input_count;   // every input not yet acknowledged, oldest first
    struct {
        uint32_t move_number;   // the client's simulation step this input drives
        int16_t  yaw, pitch;    // quantized aim
        uint16_t buttons;       // fire, jump, crouch, abilities as bits
    } inputs[];
};
```

The ack bitfield makes acknowledgment redundant too, so one lost packet never loses an ack. The `move_number` is what prediction, reconciliation and lag compensation all hang on.

### Transport Libraries

You rarely write this layer from nothing. The established options, as of October 2026:

| Library or protocol | What it gives you | License or status |
| --- | --- | --- |
| ENet | Reliable UDP, the classic small C library | MIT |
| Valve GameNetworkingSockets | Connection-oriented, message-based API; reliable and unreliable messages; fragmentation for messages over the MTU; AES-GCM-256 with Curve25519; peer-to-peer NAT traversal with WebRTC's ICE; "Steam is not needed" | BSD-3-Clause; Valve's relay network is not reachable from the open-source build |
| KCP | An ARQ protocol tuned for latency: selective retransmit, RTO growing about 1.5x instead of doubling in fast mode, fast retransmit, immediate ACKs, congestion control optional; the project claims 30-40% lower average latency than TCP for 10-20% more bandwidth | MIT |
| QUIC (RFC 9000) | Multiplexed streams without cross-stream head-of-line blocking, fast connection setup with optional 0-RTT, connection migration | IETF standard, May 2021 |
| WebTransport | HTTP/3 over QUIC in the browser: reliable streams and unreliable datagrams | Baseline "newly available" since March 2026 per MDN; secure contexts only |
| Engine built-ins | Unreal's replication and RPCs, Unity's and Godot's networking layers | Tied to the engine |

For web games, WebTransport is the first browser API that fits the model above: MDN describes unreliable datagrams as suited to game "state updates where each message supersedes the last one that arrives," with reliable streams beside them for the rest. Before it, browser games used WebSockets (TCP, with head-of-line blocking) or WebRTC data channels. My default for a new web game is WebTransport datagrams for movement and a reliable stream for everything else, with a WebSocket fallback for browsers that don't have it.

## Client-Side Prediction and Reconciliation

With a purely authoritative server, pressing forward does nothing until the input reaches the server and the result comes back: a full round trip. Gambetta's warning is that "a lag of half a second isn't just noticeable, it actually makes the game unplayable." QuakeWorld's answer, in John Carmack's words quoted by Fiedler: "I am now allowing the client to guess at the results of the users movement."

**Prediction.** The client runs the same movement code as the server on its own inputs and shows the result immediately. Because the code is the same and movement is mostly deterministic, the guess is usually right.

**Reconciliation.** Each input carries a sequence number (the `move_number` above), and each server update says which input it processed last. When an update arrives, the client:

1. Takes the server's authoritative state for its own character, as of the last processed input.
2. Drops every stored input up to and including that one.
3. Replays the remaining, unacknowledged inputs on top of the server state.
4. Compares the result with what it is showing. If they match, nothing happens. If not, it corrects, smoothly for small errors and with a snap for large ones.

The client keeps a ring buffer of inputs and predicted states, sized for the worst round trip you support (at 128 steps a second and 250 ms, 32 entries). Mispredictions come from things the client couldn't know: another player blocked the doorway, a stun landed, the server rejected an impossible move. Source does the same: the client "runs exactly the same code and rules the server will use," treats a mismatch as a prediction error because "the server has final authority," and smooths the correction over a short time instead of jumping. Fiedler's smoothing approach renders an error offset that decays toward zero (he blends factors of about 0.95 for errors under 25 cm and 0.85 for a meter or more), so small corrections never show as a jump.

What to predict is a design decision. Predict the player's own movement, firing animation, muzzle flash and ammo count; they're the latency the player feels most. Don't predict outcomes another player could dispute, like a kill or a pickup, beyond a cosmetic hint; when the server disagrees, an undone kill is worse than a late one.

Prediction depends on both sides stepping at the same fixed rate, which is what makes moves numbered and comparable. Source clients create user commands "with the same tick rate that the server is running with" and batch several into each packet; VALORANT runs movement at 128 steps a second on client and server, per Riot's netcode post, so a client can report "I just simulated move #408" and the server knows exactly which state that means.

## Entity Interpolation

Prediction covers your own character. Everyone else you see from server updates, which arrive at the tick rate at best, with jitter and loss. Drawing each update as it arrives makes other players stutter.

**Interpolation** draws other entities a little in the past, between the two most recent server states that bracket the render time. Gambetta's example uses 100 ms: a player is "shooting where your target was 100 ms ago!" The buffer has to be deep enough to survive loss: Fiedler's rule is that "the interpolation buffer should have enough delay so that I can lose two packets in a row," which at 2-5% loss came to about three send intervals (300 ms at 10 packets a second, about 150 ms at 30, about 85 ms at 60), plus jitter headroom. Source's default reaches the same rule from the other direction: at 20 snapshots a second it interpolates 100 ms in the past (`cl_interp 0.1`), so "even if one snapshot is lost, there are always two valid snapshots to interpolate between." Hermite interpolation using velocity removes most artifacts at low send rates.

**Extrapolation** (dead reckoning) guesses forward from the last known velocity instead, and "fails when these conditions aren't met," as Gambetta puts it: players in shooters change direction constantly. Most games interpolate by default and extrapolate briefly to cover a late packet, then freeze rather than guess further; Source extrapolates for at most 0.25 seconds of loss, "since the prediction errors would become too big after that."

Interpolation delay is the most important number in a shooter's netcode that players never see. It is the floor on how old every enemy on your screen is, and the server has to undo it to judge your shots.

## Lag Compensation

When you fire, you aim at an enemy drawn in the past (interpolation delay), and your shot arrives at the server later still (half the round trip, plus buffering). By the time the server processes it, the enemy has moved. Without compensation, players would have to lead targets by their own ping, which is unplayable.

**Lag compensation** rewinds. The client sends the shot with what it was looking at (a timestamp, a tick or a move number) and the exact aim; the server, which keeps a short history of every hitbox, reconstructs the world as the shooter saw it, tests the shot there, and applies the result in the present. Gambetta: the server "can authoritatively reconstruct the world at any instant in the past." Valve's Source documentation gives the formula the server uses to pick that instant:

```text
Command Execution Time = Current Server Time - Packet Latency - Client View Interpolation
```

Source then moves only the other players back to that time, runs the shot, and restores them. Riot describes the same for VALORANT: the server "needs to rewind the world state to what you were looking at when you pulled the trigger."

The cost lands on the target. Because the server honors what the shooter saw, a target can die after reaching cover on their own screen. Valve calls it a paradox that "can't be solved in general because of the relatively slow packet speeds," and Gambetta calls it "somewhat unfair, but it's the most agreeable solution for everyone involved"; the alternative is unfair to every shooter on every shot.

![Timeline plan view of one shot on a 128-tick server, drawn in three lanes (server, network, client) at 6 px per millisecond. A server snapshot leaves at minus 33.13 ms, crosses the network in L1 = 17.50 and waits I1 = 15.63 of interpolation delay before the client renders it at 0, when the player fires. The shot crosses back in L1 = 17.50, waits S1 = 15.63 of server buffering (two ticks of T1 = 7.81), and is processed at 33.13 ms. The highlighted rewind dimension R1 = L1 + I1 + L1 + S1 = 66.25 runs from processing back to the snapshot the shooter saw; the confirmation reaches the client at C1 = L1 + S1 + L1 = 50.63. A hatched band past the rewind cap marks shots the server refuses to rewind for, and a detail view splits S1 into queue wait, network buffer and apply and send across two ticks.](/diagrams/gm-netcode-shot-timeline.svg "One shot, input to rewind to confirmation (L1 and I1 illustrative; T1 and two ticks of server buffering per Riot's published model). The server has to rewind further than the shooter's ping: R1 adds interpolation delay and buffering to both network legs.")

The drawing makes the budget concrete. With a 35 ms round trip (Riot's latency target, split evenly as an assumption), two ticks of interpolation delay and two ticks of server buffering, the server rewinds about 66 ms to judge a shot that the shooter sees confirmed about 51 ms after pulling the trigger. Every term in R1 is a lever: Riot Direct and regional servers shrink L1, a higher tick rate shrinks T1 and therefore S1 and I1.

### Rewind Limits

Rewinding has to stop somewhere. Source's lag compensation keeps "a history of all recent player positions for one second," which bounds it by construction. Riot's post makes the limit explicit ("It's also important to put some limits on how far the server is willing to rewind the simulation for hit registration"), with the example of a 500 ms player killing someone half a second after they reached cover. The design choices:

- **A rewind cap.** Shots that claim to be older than the cap are judged at the cap, or rejected. Set it from your latency distribution (a bit above the worst round trip you intend to serve well, plus interpolation delay and buffering), not from the worst player.
- **Validate the claimed time.** The client says what tick it was rendering; the server checks it against the client's measured latency and interpolation setting. A client that claims a time far older than its ping explains is lying or broken.
- **Keep the history bounded.** A hitbox history covering the cap at the tick rate (at 128 ticks and a 200 ms cap, 26 frames per player) is cheap. VALORANT's server animates only every fourth frame and interpolates between those poses for rewinds, per Riot's 128-tick post, which cut animation cost about 75%.
- **Decide what is rewound.** Hitboxes, yes. Doors, projectiles, abilities that block line of sight: each one needs a rule, and inconsistencies here produce the "I was behind the wall" clips players share.

## Peeker's Advantage

The most important consequence of all this latency, for a tactical shooter, is that the player who moves wins. A player holding an angle is still; the peeker is moving. The peeker sees the holder as soon as the peeker's own client renders around the corner, because the holder's position was already known. The holder sees the peeker only after the peeker's movement has gone to the server, been buffered and processed, come back down, been buffered and rendered. Valve's Source documentation names the interpolation part of it: view interpolation delay "gives a moving player a small advantage over a stationary player since the moving player can see his target a split second earlier," and the effect "is unavoidable, but it can be reduced by decreasing the view interpolation delay." Riot's netcode post states the whole relationship: the holder's time to react is the peeker's reaction time minus the holder's round trip to the server minus the buffering on each side.

Riot is also the studio that published the numbers, for VALORANT. With its buffering model (the server about two frames: half a frame waiting for the queue point, half a frame of target network buffering, one frame to apply and broadcast; the client about three, with a full frame of network buffering and about half a frame of render delay), a 60 FPS client and the network as it was, "peekers have ~141ms longer to react than defenders." Riot Direct, the 35 ms ping target and 128-tick servers "shave off ~40ms (28%)," and running the client at 144 FPS brings "the total advantage of an enemy peeker down to ~71ms (a 49% reduction)."

![Plan view of VALORANT's published peeker's advantage figures as three bars on one millisecond scale. P0, the baseline, is 141 ms. Taking N1 = 40 ms for Riot Direct, 128-tick servers and the 35 ms target leaves P1 = 101 ms. At 144 FPS the advantage is P2 = 71 ms, the highlighted bar, and the 30 ms difference F1 is consistent with three client frames shrinking from 50.00 ms at 60 FPS to 20.83 ms at 144 FPS. A detail view sets server buffering at two 128-tick frames, 15.63 ms, beside the client's three frames at each frame rate.](/diagrams/gm-netcode-peekers-advantage.svg "Peeker's advantage in VALORANT per Riot's July 2020 post: the network and servers took out about 40 ms, and the client's frame rate about 30 more. Client frames count three times, so frame rate matters as much as the server's tick.")

Two things in Riot's post matter beyond VALORANT. First, the margins are small enough to measure: in playtests, "skilled players were able to accurately identify small changes (~10ms) to peekers advantage," and among evenly matched players a 10 ms change swung an Operator-holder-versus-rifle-peeker matchup from a 90% win rate for the holder to 90% for the peeker. Second, the client's frame rate is part of the server's fairness: client buffering is counted in client frames, so a faster client sees enemies sooner. That's a reason to spend engineering on client performance in a competitive game, not just on servers.

The design levers, in order of what they buy: lower network latency (regional servers, a better path), a higher tick rate, less buffering on the server and client (each buffered frame trades smoothness under jitter for advantage), and a faster client. Level and ability design is the remaining lever: angles and tools that make peeking cost something.

## Tick Rate and Its Costs

The **tick rate** is how many times a second the server simulates and sends updates. Higher ticks mean fresher state, smaller buffering (buffering is counted in ticks), finer rewind and fewer missed inputs. They cost CPU, roughly linearly: a 128-tick server does about twice the work of a 64-tick server per match, and Valve measured a Source server at tick rate 100 generating "about 1.5x more CPU load" than at 66. Valve's own defaults show how the choice follows the game: 66 ticks for Counter-Strike: Source and Team Fortress 2, 30 for Left 4 Dead, and 64 with sub-tick input for Counter-Strike 2. At 128 ticks a frame gets 7.8125 ms, shared with every other match on the core; [Game Servers & Hosting](/books/gaming/game-servers#the-frame-budget-at-128-ticks) walks through Riot's published budget and the work it took to fit it. Bandwidth grows with send rate too, which is why some games simulate at one rate and send at a lower one, and why Overwatch's 2016 move to a 60 Hz update rate on PC (from 21) fell back automatically for players without the bandwidth, according to GamesBeat's coverage.

Choose the tick rate from the game, not from forums:

- **Tactical shooters** with one-shot kills and held angles gain the most, because a few milliseconds decide duels. 64 and 128 are the usual choices.
- **Fast arena and hero shooters** need fresh state but lean more on prediction; Overwatch's 2016 change to 60 updates a second on PC was, in Tim Ford's words to GamesBeat, so "you will be shot around corners less."
- **Battle royale** trades tick rate against player count: a hundred players and tens of thousands of actors per process cost more per tick than ten players do.
- **MOBAs and slower games** can run lower rates: fights turn on abilities with wind-ups, not 8 ms duels.
- **Server cost** scales with tick rate times matches, so a tick rate is also a hosting budget. Decide it before you size the fleet.

A fixed timestep on both sides (as VALORANT uses for movement) is what makes prediction, reconciliation and rewind exact. The mechanics of fixed steps and render interpolation are in [Building Your Own Engine](/books/gaming/building-an-engine).

## Interest Management and Relevancy

A server shouldn't send every client everything. **Interest management** (relevancy, in Unreal's terms) decides which entities each client receives and how often. It saves bandwidth and server CPU, and it is also anti-cheat: what a client is never sent, a wallhack can't show.

Unreal's basics are per-actor: `bAlwaysRelevant`, `bOnlyRelevantToOwner`, and `NetCullDistanceSquared`, the "square of the maximum distance from the client's viewport that this actor is relevant and replicates." Per-actor, per-connection checks get expensive at scale, which is why Epic built the **Replication Graph**: Fortnite Battle Royale "starts each game with 100 connected players and about 50,000 replicated Actors," and evaluating each actor for each connection every frame doesn't fit. The graph keeps persistent nodes that group actors and build per-client lists, and "the world can be divided up into grid spaces" for battle royale, MOBA or MMO games, so a client gets the lists for the cells around it. Epic's next system, **Iris**, is "an opt-in replication system that works alongside Unreal Engine's existing replication system," aimed at larger worlds and lower server cost; as of October 2026 the Unreal Engine 5.8 documentation marks it **Experimental** ("use caution when shipping with it").

Relevancy rules for a competitive shooter go further than distance:

- **Line of sight with margin.** Send enemies a client can see, or could see within the next few frames given movement speed and latency, so they don't pop in. Too tight and peekers appear late (adding to peeker's advantage); too loose and wallhacks work. Riot's April 2020 post on VALORANT's fog of war is built on exactly this ("If you couldn't see an enemy, the server wouldn't tell you where they were"); its costs and its answer to pop-in are in [Anti-Cheat](/books/gaming/anti-cheat#withholding-hidden-state).
- **Priority, not just inclusion.** Fiedler's priority accumulator applies here: nearby enemies every tick, distant allies less often, cosmetic state rarely.
- **Audio relevancy.** Footsteps reveal position; whatever a client can hear, it must be sent, so audio range is a relevancy rule too.
- **Spectators and replays.** A spectator wants everything; a caster's client isn't a player's client. Treat them as separate relevancy profiles ([Esports & Spectating](/books/gaming/esports-and-spectating)).

## Bandwidth, Loss and Jitter

Players experience three properties of the network: latency, packet loss and jitter. Each one is absorbed by a different mechanism:

- **Latency** by prediction (your own actions), interpolation delay (others) and lag compensation (judging shots). It can't be hidden for interactions between players, which is why placement and network paths matter ([Game Servers & Hosting](/books/gaming/game-servers#regions-and-latency-based-placement)).
- **Loss** by redundancy (inputs repeated until acknowledged), by interpolation buffers deep enough to lose two packets in a row, and by never retransmitting state that a newer update replaces.
- **Jitter** by buffers on both ends (a jitter buffer of about four to five frames in Fiedler's state-sync demo; Riot's half-frame server and one-frame client targets). Every buffered frame is latency, so buffers should adapt: shrink on a clean connection, grow when jitter rises, and report their size so you can see it in telemetry.

Budget bandwidth per client explicitly: a cap per tick, a priority order that fills it, and quantization (positions to a fixed precision, angles to 16 bits, booleans to bits). Measure the 99th percentile packet, not the average, because the busiest moment (a ten-player fight with abilities) is the one that matters. Report round trip, loss, jitter, buffer depth and corrections per minute per match from the client and server to your telemetry pipeline ([Telemetry & Analytics](/books/gaming/telemetry)), and show players a network graph (Source's `net_graph` shows frame rate, latency, packet sizes and gaps for lost packets); they will find your problems before you do.

## What You Can Adopt

Everything above can be written from scratch, and the transport libraries in [What Crosses the Wire](#transport-libraries) are the usual floor if you do. Most teams start higher: the engine's own networking, an open-source framework, or a commercial service that bundles a relay. Each one makes the topology, authority and prediction decisions for you, so the choice is really a choice of those, plus a license and someone to run the servers. As of October 2026:

| Option | Topology | Authority | Tick and prediction | License, status | Hosting |
| --- | --- | --- | --- | --- | --- |
| Unreal replication (actor replication, RPCs, relevancy, Replication Graph; Iris) | Client-server: dedicated or listen server | Server | Fixed server tick you set; the Character Movement Component predicts, saves moves, takes server corrections and replays | Unreal Engine license ([The Engine Landscape](/books/gaming/engine-landscape#unreal-engine)); Iris marked Experimental in the 5.8 docs | Self-host the dedicated server on any fleet |
| Unity Netcode for GameObjects 3.1 | Client-server (dedicated or listen) or distributed authority, where clients share ownership through a small central state service | Server, or shared by object | Prediction not covered on its overview pages | MIT; actively developed (last push October 26, 2026) | Self-host; distributed authority needs the central state service |
| Unity Netcode for Entities 1.6 | Client-server | Server, "with client prediction" | Prediction with rollback and resimulation of predicted ghosts; simulation and network tick 60 Hz by default; physics lag compensation via `PhysicsWorldHistory` | Unity Companion License; requires ECS (DOTS) | Self-host |
| Godot MultiplayerAPI | Client-server over ENet, WebRTC or WebSocket peers | Server is peer 1 and the default authority, changeable per node | RPCs and synchronizers with a replication interval and per-peer visibility; prediction is yours to write | MIT, like the engine | Self-host (headless Godot) |
| Mirror (Unity) | Client-server, server and client in one project | Server | Lag compensation in beta and prediction "researching," per its README; KCP transport by default | MIT; active (last push October 19, 2026) | Self-host |
| FishNet (Unity) | Client-server, dedicated or a player acting as server and client | Server, "by design" | Prediction documented; "no CCU caps" | FirstGearGames' own license: royalty-free use in games, with restrictions on competing networking products; paid Pro tier; active (October 18, 2026) | Self-host |
| Colyseus rooms, Nakama matches (backend frameworks) | Client-server rooms or matches outside an engine; Nakama also relays | Server; none when relayed | Colyseus: schema state with binary delta patches, no prediction; Nakama: a match loop at a tick rate you set, in Go, TypeScript or Lua | Open source; licensing, hosting and the rest are in [Game Backend Architecture](/books/gaming/game-backend#what-you-can-adopt) | Self-host or managed |
| Photon Fusion 2 (commercial) | Dedicated server, client host or shared authority, one API | Server, host or shared | Tick-based, with client-side prediction and lag compensation "out of the box" | Proprietary; free for development, paid past the free tier | Photon's cloud; Dedicated Server mode runs your server build |
| Photon Quantum 3 (commercial) | Deterministic predict/rollback, up to 128 players | Every client simulates; a "game-agnostic authoritative server" syncs clocks and input latency | Fixed-point ECS, rollback | Proprietary; free for development, paid past the free tier | Photon Cloud |

How each one fits:

- **Use your engine's networking first** if it's Unreal. Unreal's replication is the most proven stack here (Fortnite's scale is the reason the Replication Graph exists, and VALORANT's 128-tick servers run on it, per Riot), and its character movement already implements the saved-moves prediction and correction loop described above. What you add is the game-specific part: hit validation, rewind limits, relevancy rules, and performance work on replication.
- **On Unity, pick by architecture.** Netcode for Entities is the one with prediction, rollback and physics lag compensation built in, at the cost of adopting ECS. Netcode for GameObjects is simpler and supports distributed authority, which suits co-op more than competitive play. Mirror and FishNet are the established open-source alternatives; check that the prediction and lag compensation you need are finished in the version you adopt, not on a roadmap.
- **Godot gives you transport, RPCs and replication** and leaves prediction, interpolation and rewind to you, which is honest for a general engine. Plan to write the movement prediction and reconciliation loop yourself.
- **Colyseus and Nakama** are room- or match-based authoritative servers outside a game engine. They fit browser, mobile, card, board and turn-based games, and casual real-time games whose server logic is simple enough to write in TypeScript, Go or Lua, without an engine on the server. Neither gives you shooter-grade prediction or lag compensation. Both are also backend services, and their licensing, hosting and the rest of what they do are in [Game Backend Architecture](/books/gaming/game-backend#what-you-can-adopt).
- **Photon** is the commercial reference: Fusion for engine-style client-server or shared authority with prediction included, Quantum for deterministic rollback. You trade a per-player price and a dependency on Photon's cloud for not running relays or writing rollback.

**Build your own** when the netcode is the product: competitive shooters and fighting games whose feel is the reason people play, games with an engine of your own ([Building Your Own Engine](/books/gaming/building-an-engine)), or player counts no framework is built for. Even then, own the gameplay protocol and adopt the transport (ENet, GameNetworkingSockets, KCP, WebTransport). My default by case:

- **Competitive shooter on Unreal:** Unreal replication, dedicated servers, and your own engineering on top of it.
- **Competitive game on Unity:** Netcode for Entities, or Photon Fusion if the team is small and the budget allows the per-player price.
- **Fighting game:** your own rollback on GGPO's model, or Quantum on Unity ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)).
- **Co-op and casual:** the engine's networking with a listen server or distributed authority, and a relay.
- **Browser, mobile and turn-based:** Colyseus or Nakama, self-hosted until the operations cost exceeds a managed tier.

## How to Build It

Whether the framework is adopted or written, the server side of an authoritative game comes down to one fixed-order tick and a small amount of state per connection. Getting the order wrong is how a shot gets judged against a world one tick newer than the one the shooter saw.

### The Server Tick

My default order, every tick:

```text
each tick n (fixed dt):
  1. drain the socket: per connection, update acks and RTT; queue inputs by move_number,
     dropping duplicates and anything older than the last move applied
  2. apply inputs: per player, consume the input for this tick; if none arrived,
     repeat the last one and count a missed input; cap how many queued inputs one tick
     may consume, so a client can't run faster than the clock by flooding moves
  3. judge actions that need the past: validate each shot's claimed tick against the
     rewind cap and the client's RTT, rewind hitboxes, test, apply the result at tick n
  4. step the simulation once
  5. record this tick's hitboxes in the history ring (sized to the rewind cap)
  6. per connection: relevancy and priority, delta against the newest acknowledged
     snapshot, quantize, fill the byte budget, send
  7. record frame time, missed inputs, corrections sent and rewinds refused
```

Shots are judged before the step (3 before 4) so the rewound world and the present one are both the world as of the end of tick n-1. Missed inputs are repeated rather than treated as "no input," because a player who held forward through a lost packet did not stop.

### State per Connection

```c
struct Connection {
    uint16_t next_sequence, remote_ack;      // reliability, from the header above
    uint32_t remote_ack_bits;
    float    rtt_ms, rtt_var_ms;              // smoothed, from ack timing
    uint32_t last_applied_move;               // the reconciliation point sent back
    struct InputQueue inputs;                 // move_number -> input, bounded
    uint32_t acked_snapshot_tick;             // the delta baseline
    struct Snapshot *sent[SNAPSHOT_HISTORY];  // baselines the client may still ack
    float    priority[MAX_ENTITIES];          // the priority accumulator
    uint16_t interp_delay_ms;                 // reported by the client, used to validate rewinds
    uint32_t reliable_channel_seq;            // ordered events, separate from state
};
```

The snapshot history is what makes delta compression safe: the server deltas against the newest snapshot the client has acknowledged, never the newest it sent, and falls back to a full snapshot when the baseline has aged out of the history. Nothing here is durable. What outlives the match is a per-player summary of round trip, loss and client build on `match_participants` ([Telemetry & Analytics](/books/gaming/telemetry#the-data-model)), and the server's frame counts on `matches` ([Game Metrics](/books/gaming/game-metrics#how-to-build-it)).

## What This Means for the System You Build

- **An authoritative dedicated server** for anything competitive; clients send inputs and receive state, and nothing a client claims is believed without validation.
- **A UDP protocol with three message classes:** unreliable latest-wins state, reliable ordered events on their own channel, and redundant inputs; a sequence, ack and ack-bitfield header; an established library (ENet, GameNetworkingSockets, KCP, or WebTransport for browsers) rather than your own.
- **A fixed simulation step** shared by client and server, numbered moves, prediction for the player's own actions, and reconciliation with smoothed corrections.
- **Interpolation buffers sized from loss and send rate,** adaptive under jitter, with the delay sent to the server.
- **Lag compensation with a bounded hitbox history,** validated rewind claims and a rewind cap set from your latency distribution.
- **A latency budget you can write down:** network legs, interpolation delay, server and client buffering, and the peeker's advantage it implies; and a tick rate chosen with its hosting cost.
- **Relevancy as anti-cheat:** never send what a client shouldn't know, with margins tuned against pop-in.
- **Adopt before you build:** the engine's networking or a framework whose topology, authority and prediction match the game, with your own protocol only where the netcode is the product.
- **Network telemetry** from both ends, per match: round trip, loss, jitter, buffer depth, corrections, rewinds refused.

## References

**Specifications**

- [RFC 9000: QUIC](https://www.rfc-editor.org/rfc/rfc9000.html), streams without cross-stream head-of-line blocking, low-latency setup and connection migration
- [MDN: WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API), reliable streams and unreliable datagrams over HTTP/3, game state updates as datagrams, and Baseline status since March 2026

**Reference**

- [Gabriel Gambetta: Client-Server Game Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html), the authoritative server and why a dumb client feels laggy
- [Gabriel Gambetta: Client-Side Prediction and Server Reconciliation](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html), sequence numbers, acknowledged inputs and replay
- [Gabriel Gambetta: Entity Interpolation](https://www.gabrielgambetta.com/entity-interpolation.html), rendering others in the past and why dead reckoning fails
- [Gabriel Gambetta: Lag Compensation](https://www.gabrielgambetta.com/lag-compensation.html), reconstructing the world as the shooter saw it, and the trade-off for the target
- [Glenn Fiedler: What Every Programmer Needs To Know About Game Networking](https://gafferongames.com/post/what_every_programmer_needs_to_know_about_game_networking/), peer-to-peer lockstep, Quake's client/server model and QuakeWorld prediction
- [Glenn Fiedler: UDP vs. TCP](https://gafferongames.com/post/udp_vs_tcp/), head-of-line blocking and not mixing TCP with the game protocol
- [Glenn Fiedler: Snapshot Interpolation](https://gafferongames.com/post/snapshot_interpolation/), snapshot bandwidth at 60 and 10 per second and interpolation buffer sizing
- [Glenn Fiedler: State Synchronization](https://gafferongames.com/post/state_synchronization/), input plus state, the priority accumulator, quantization, smoothing and the 256 kbit/s demo cap
- [Glenn Fiedler: Deterministic Lockstep](https://gafferongames.com/post/deterministic_lockstep/), redundant inputs over UDP at 2 seconds of latency and 25% loss
- [Valve Developer Community: Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking), the authoritative Source server, user commands at the tick rate, prediction and smoothed corrections, 100 ms default interpolation and 0.25 s extrapolation, the lag compensation formula and one-second history, the moving player's interpolation advantage, per-game tick rates, the CPU cost of tick rate 100 and the net graph
- [Epic Games: Networking Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine), net modes, listen versus dedicated servers and RPC reliability guidance
- [Epic Games: Actor Relevancy](https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine), always relevant, owner-only relevancy and net cull distance
- [Epic Games: Replication Graph](https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine), Fortnite's 100 players and about 50,000 replicated actors, nodes and grid spatialization
- [Epic Games: Iris Replication System](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-replication-system-in-unreal-engine), the opt-in replication system and its Experimental status in the 5.8 docs
- [ENet](https://github.com/lsalzman/enet), the reliable UDP library and its MIT license
- [Valve: GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets), message-based reliable and unreliable transport, encryption, ICE NAT traversal and the BSD-3-Clause license
- [KCP](https://github.com/skywind3000/kcp/blob/master/README.en.md), the latency-tuned ARQ protocol and its own latency and overhead claims
- [Valve: Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay), the relay network for peer-to-peer and dedicated-server traffic
- [Epic Games: Networked movement in the Character Movement Component](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine), saved moves, server validation, corrections and replay, and smoothing for simulated proxies
- [Unity: Netcode for GameObjects](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.1/manual/index.html), the high-level library, version 3.1
- [Unity: Netcode for GameObjects network topologies](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.1/manual/terms-concepts/network-topologies.html), dedicated and listen servers and distributed authority
- [Unity: Netcode for GameObjects repository](https://github.com/Unity-Technologies/com.unity.netcode.gameobjects), the MIT license and recent activity
- [Unity: Netcode for Entities](https://docs.unity3d.com/Packages/com.unity.netcode@1.6/manual/index.html), the server-authoritative framework with client prediction, version 1.6
- [Unity: Netcode for Entities prediction](https://docs.unity3d.com/Packages/com.unity.netcode@1.6/manual/intro-to-prediction.html), rollback and resimulation of predicted ghosts and the 60 Hz default tick rates
- [Unity: Netcode for Entities physics](https://docs.unity3d.com/Packages/com.unity.netcode@1.6/manual/physics.html), the lag compensation system and `PhysicsWorldHistorySingleton`
- [Unity: Netcode for Entities license](https://docs.unity3d.com/Packages/com.unity.netcode@1.6/license/LICENSE.html), the Unity Companion License
- [Godot: High-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html), MultiplayerAPI, ENet, WebRTC and WebSocket peers, RPCs and multiplayer authority
- [Godot: MultiplayerSynchronizer](https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html), replication interval and per-peer visibility
- [Godot: License](https://godotengine.org/license/), the MIT license
- [Mirror](https://github.com/MirrorNetworking/Mirror), the MIT-licensed Unity library, KCP by default, and the status of lag compensation and prediction
- [FishNet](https://github.com/FirstGearGames/FishNet), the Unity library and its repository activity
- [FishNet: License](https://raw.githubusercontent.com/FirstGearGames/FishNet/main/LICENSE.md), royalty-free use in games and the restrictions on other networking products
- [FishNet: Documentation](https://fish-networking.gitbook.io/docs), server authority, dedicated and host modes, and no CCU caps
- [Colyseus: Documentation](https://docs.colyseus.io/), rooms, Schema state with binary delta patches and transports
- [Heroic Labs: Nakama authoritative multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/), the match handler, its lifecycle functions, tick rate and runtime languages
- [Heroic Labs: Nakama relayed multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/relayed/), client-authoritative matches with no server validation
- [Photon: Fusion introduction](https://doc.photonengine.com/fusion/current/fusion-intro), dedicated server, client host and shared modes, prediction, lag compensation and pricing past the free tier
- [Photon: Quantum introduction](https://doc.photonengine.com/quantum/current/quantum-intro), deterministic predict/rollback ECS, up to 128 players and the game-agnostic server

**In practice**

- [Riot Games: Peeking into VALORANT's Netcode](https://www.riotgames.com/en/news/peeking-valorants-netcode), the server-authoritative model, buffering, rewind limits, the 141, 40 and 71 ms peeker's advantage figures, the 35 ms target and the 10 ms playtests (July 28, 2020)
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), the 7.8125 ms frame and server animation every fourth frame with interpolation for rewinds (August 31, 2020)
- [Riot Games: Fixing the Internet for Real Time Applications, Part I](https://www.riotgames.com/en/news/fixing-internet-real-time-applications-part-i), 55-byte game packets, routers counting packets not bytes, and UDP drops under load (November 6, 2015)
- [Riot Games: Demolishing Wallhacks with VALORANT's Fog of War](https://www.riotgames.com/en/news/demolishing-wallhacks-valorants-fog-war), the server withholding enemies a client can't see (April 14, 2020)
- [GamesBeat: Overwatch's netcode moves to 60Hz](https://gamesbeat.com/overwatch-netcode-tick-rate-60hz/), the PC update rate raised from 21 to 60 a second with automatic fallback for low bandwidth, and Tim Ford on being shot around corners less (September 9, 2016)
