+++
title = "Anti-Cheat"
description = "Defending a multiplayer game in depth: the threat model, server authority, client integrity, kernel drivers and their risks, detection, bans, appeals and Linux."
category = "Gaming Industry"
order = 1619
part = "Fair Play and Safety"
tags = ["gaming", "anti-cheat", "security", "fair-play", "kernel", "bans"]
+++

A competitive game is a contest whose rules are enforced by software running, in large part, on the opponent's computer. Everything the player's machine does can be read, changed or replaced by its owner, and a cheat is someone exercising that ownership against the other players in the match. Cheating is also a business: cheats are sold by subscription, accounts are leveled by bots and sold, and the people who write cheats test them against each anti-cheat update the way any vendor tests against a platform change. No single measure ends it. What works is defense in depth, with each layer chosen for what it can and can't see, and an enforcement system that is fast, accurate and correctable.

This chapter covers the threat model, server authority (the one layer a cheat can't patch), client integrity and kernel drivers, detection, bans and appeals with the tables behind them, Linux and Steam Deck, and the real risks a kernel driver adds. Disruptive behavior that doesn't touch code (abuse, griefing, throwing) is in [Player Behavior & Moderation](/books/gaming/player-behavior); the network model this chapter leans on is in [Netcode Fundamentals](/books/gaming/netcode); how bans attach to accounts and survive linking and merging is in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#bans-account-identity-hardware); and voiding a match and reversing its rating is in [Game Backend Architecture](/books/gaming/game-backend#game-results-exactly-once-per-match) and [Matchmaking & Ranked](/books/gaming/matchmaking#updating-ratings).

## The Threat Model

Start the way any security design starts, with what the attacker wants and what they need to get it ([Threat Modeling](/docs/security/threat-modeling)). In a game, the attacker is a player (or someone selling to players), the asset is the outcome of matches and the value of accounts, and the attack surface is everything the client knows and everything the server believes.

| Cheat | What it does | What it needs | First line of defense |
| --- | --- | --- | --- |
| Wallhack, ESP, map hack | Shows enemies, items or state the player shouldn't see | To read that state from client memory or traffic | Don't send it: server-side visibility |
| Aimbot, triggerbot | Aims or fires for the player | Enemy positions plus synthetic input | Detection: aim and input analysis; integrity checks |
| Scripting | Automates precise actions (dodging, last hits, combos) | To attach to the client and read its state | Client integrity, detection |
| Speedhack, teleport, god mode | Moves faster, ignores damage | A server that trusts client state | Server authority and input validation |
| Disconnect and lag exploits | Freezes or desyncs others, abuses timing | Gaps in how the server handles late or missing input | Server authority, rewind limits |
| Macros and input automation | Perfect recoil, rapid fire, repeated sequences | Input injection, sometimes in hardware | Detection: timing regularity |
| Botting | Plays the game to level accounts or farm currency | Simulated input, often unattended | Detection: behavior over time; economy signals |
| DMA and external hardware | Reads memory from a second device | A PCIe card or capture setup outside the OS | Hard; integrity checks on the system, detection |
| Account selling and boosting | Sells leveled or ranked accounts; plays on another's account | Bots or skilled players, and a market | Detection, account security, enforcement on the account |

Riot's 2018 description of League's anti-cheat defines two of these from the defender's side: scripting is third-party programs that "forcefully attach themselves to the game client" to use its memory and functions, and botting is third-party software that simulates game input, typically to level accounts for sale or farm currency. The same post sets out the three tenets that organize everything below: "prevention, detection, and deterrence," with prevention called "a more effective solution" because it "prevents cheating in the first place."

The layers below map those tenets onto where code runs. Each covers what the others can't see, and each sits on hardware with a different owner:

![Exploded axonometric of five stacked plates, bottom to top. 01 kernel driver: boot-time load, memory and driver checks. 02 client integrity: encrypted code, anti-debug, scans. 03 network: encrypted, obfuscated, rate-limited. 04 server authority, highlighted: inputs validated, hidden state withheld. 05 detection backend: signals, models, review, enforcement. Brackets on the right group the bottom two plates as the player's machine, the middle plate as in transit, and the top two as operator hardware. Notes say the server layer is the only one a cheat can't patch, and that Valve's Proton guidance doesn't support kernel-space anti-cheat.](/diagrams/gm-anti-cheat-stack.svg "Defense in depth, by where each layer runs. The two layers on operator hardware can't be patched by a cheat; the three below it raise the cost of cheating and feed the detection backend.")

## Server Authority Is the First Defense

The cheapest cheat to stop is one that has nothing to work with. In an authoritative client-server game the client sends inputs and the server decides what they do ([Netcode Fundamentals](/books/gaming/netcode#topologies-and-authority)); a client that claims full health, an extra jump or a position through a wall is simply overruled. Riot's 2018 post credits authoritative server decisions with preventing "common cheats like 'god mode' and 'disconnect hacks'"; VALORANT's netcode post says the game "uses a server-authoritative networking model to limit the types of cheats possible."

Authority covers more than physics:

- **Validate every input against the rules.** Fire rate against the weapon, movement against the maximum speed and the time since the last input, ability use against cooldowns and resources, purchases against the in-match economy. An input that couldn't have happened is rejected and counted, and the count is a detection signal.
- **Bound lag compensation.** A server that rewinds to judge shots has to cap how far it will go and check the client's claimed time against its measured latency, or a lag switch becomes a weapon ([Rewind Limits](/books/gaming/netcode#rewind-limits)).
- **Never trust the client about results.** Match outcomes, rewards and currency are written by the server and the backend, never reported by a client ([Telemetry & Analytics](/books/gaming/telemetry)).
- **Don't send what the player can't see.** This is the part most games skip, and it is the one that defeats wallhacks.

### Withholding Hidden State

A wallhack reads enemy positions from the client. If the client never receives them, there is nothing to read. Riot's 2018 post makes the general point (not sharing other players' state unless necessary helps avoid "map hacks"), and its April 2020 post on VALORANT's Fog of War describes building it for a 128-tick shooter: "the game server withholds information about the positions of enemies until a client needs to display it."

The engineering is in the cost and the edges:

- **Cost.** The first prototype, which raycast between players every frame (more than 350 relevancy checks a frame in a 10-player game, each with ten raycasts), took about half the server's frame time; frame times doubled, dropping the server from 128 to 64 ticks. Riot replaced the raycasts with a precomputed potentially visible set: a lookup table over voxels of the map, deliberately optimistic ("as long as any part of a voxel can see any part of the other voxel, the table returns 'visible'"), which brought the cost to "less than 2% of server frame time."
- **Latency.** Information has to arrive before the enemy appears, or players see opponents pop in late. Riot expanded each player's bounding box by velocity times a look-ahead longer than the expected ping, sending the position "just before the enemy came around the corner."
- **Honesty about the limit.** Riot's claim is that the system "drastically reduces the time enemy positions are available to players, and therefore reduces the effectiveness of wallhacks," not that it ends them. Positions still arrive slightly early, sounds still need positions, and an aimbot still works on every enemy the player can legitimately see.

The general version is interest management for fairness: relevancy rules decide what each client receives ([Interest Management and Relevancy](/books/gaming/netcode#interest-management-and-relevancy)), and the anti-cheat question for each replicated field is "what does a cheat gain if it reads this?"

### What Authority Can't Stop

Authority stops cheats that lie about state. It can't stop cheats that send valid inputs at superhuman quality, because an aimbot's mouse movement is a mouse movement. Riot's 2024 post on bringing Vanguard to League names the consequence: with the server as "the final arbiter of truth," cheaters turned to scripting, and in recent months "as many as" 1 in 15 games globally had a scripter or botter in them. Everything below this section exists because of that gap.

## Client Integrity

The client-side layer tries to make the client hard to read and modify, and to notice when it is being read or modified anyway. Riot's 2018 post lists the techniques League used:

- **Encrypted code,** specifically the executable's `.text` section, with only portions decrypted at a time, and an in-house bootstrapping library that loads first and validates dependencies.
- **Randomized anti-debugging checks** that vary between builds and don't always react immediately: a check may log a detection or make the game "crash five minutes later," so a cheat developer can't tell which action tripped it.
- **Encrypted in-memory values,** moved when they change, so a memory search can't find them.
- **An obfuscated network protocol,** with the obfuscation changed regularly.

None of this is permanent. It raises the cost of building and maintaining a cheat, and its value decays as cheat developers adapt; the 2024 League post says plainly that Packman, League's anti-tamper system for "nearly six years," was beaten. Riot's 2018 post says it doesn't "think efficacy depends solely on secrecy," and the techniques above are public; what stays private is the specific checks in a given build.

The structural limit of user-mode protection is privilege. A cheat running with the same or higher privilege than the anti-cheat can hide from it, feed it false answers or switch it off.

## Kernel Anti-Cheat

A kernel-mode driver runs with the operating system's own privilege, so a cheat can't outrank it unless it, too, runs in the kernel (or outside the machine). That is the argument for kernel anti-cheat, and the reason it is controversial.

**Riot Vanguard** is the most thoroughly documented. Riot's security and privacy teams explained it at VALORANT's launch (April 17, 2020): a user-mode-only design's "capabilities would be compromised by a cheat running at a higher privilege level," and advanced cheaters already used direct memory access (DMA) hardware to copy game memory to a second computer. The driver loads at startup "to prevent loading cheats prior to the client initialization"; it validates memory and system state, while "the client (user-mode) handles all of the anti-cheat detections while a game is running"; and "the driver does not collect or send any information about your computer back to us." The driver is signed with Riot's EV certificate and countersigned by Microsoft, was "reviewed by both internal and external security experts," and got its own scope in Riot's HackerOne program with higher bounties. Riot's support page (dated June 2026) describes the current shape: a client that runs while Riot games are active plus a kernel-mode driver, "usually an on-boot application," required "while you play most of our games."

Riot published results for League a few months after Vanguard arrived there. The April 2024 post adds TPM 2.0 to the design as "an extremely non-fungible form of hardware ID" and says the driver has "no network connectivity until you run one of Riot's games." The August 2024 retrospective reports:

| Measure (League, Riot's figures, August 2024) | Before | After |
| --- | --- | --- |
| Ranked games with a scripter | As many as 1 in 15 games had a scripter or botter (recent months, April 2024) | Ranked scripting rate "below 1% for the first time in nearly four years"; about 1 in 200 ranked games |
| Botting | "North of 1 million" hours a day | "Less than 5 thousand" hours a day |
| Time to action | 45+ games | Fewer than 10 games |
| Accounts banned for cheating | | Over 175,000 since release |
| Bot accounts removed before sale | | 3.5 million |
| False positives | | Under 0.01% of bans, fewer than 1 in 10,000, suspended under 72 hours on average |

The retrospective is also candid about cost. Third-party overlays and tools that tried to access the game were blocked and some retried in loops, causing click lag and frame drops; blue screens hit some Intel 13th and 14th generation systems with out-of-date firmware; enabling TPM led some players to switch to UEFI, where converting an MBR disk carelessly could leave it unbootable; and Riot says it "royally biffed" session handling, so a second computer re-authenticating could disconnect a player mid-game. Kernel software touches the whole machine, and its failures are the player's whole machine.

**Easy Anti-Cheat** (Epic, part of Epic Online Services) describes a "prevention-first approach," detection through "heuristics, gameplay analysis, and player report signals," a free basic tier with paid Core, Advanced and Premier tiers, and support for Windows, Mac, Linux and Steam Deck; its page doesn't say which parts run in kernel mode. **BattlEye** calls itself a "fully proactive kernel-based protection system," with scanning "controlled and altered by the backend" (so detections change without a client patch), server-side control that kicks violators, an RCon interface for server admins and a global ban system. **VAC** (Valve Anti-Cheat), per Steam Support, detects cheats "using their cheat signatures," and "users are not VAC banned based on reports alone." Vendor descriptions are as their pages stated them in October 2026.

**Platform security as a requirement.** The 2025 shooters moved part of the job onto the PC's own boot chain. EA's August 2025 notice says "Secure Boot is a requirement to play Battlefield 6 on PC," tied to its Javelin anti-cheat, because a machine that boots only signed components is harder to load a cheat driver into before the anti-cheat starts. Activision said the Call of Duty: Black Ops 7 beta on PC "will require TPM 2.0 and Secure Boot," and its launch post repeated the requirement for the full game. The trade is the same as with a kernel driver, moved earlier: players with older hardware, Secure Boot turned off for a second operating system, or firmware they've never touched get an error before they get a match, so support needs a guide for each motherboard vendor's settings on day one.

## Detection

Prevention narrows what cheats can do; detection finds the players who cheat anyway. The two have different economics. Prevention acts before harm and is visible to cheat developers, who route around it. Detection acts after harm (players have already met the cheater, as Riot's 2018 post notes) and can be hidden, which is its advantage.

### Signals

Detection draws on every layer of the stack:

- **Client integrity signals:** a known cheat's signature in memory, a modified file, a debugger, a blocked driver, an unexpected module injected into the game process. These are close to proof when they fire and blind to anything new.
- **Server-side gameplay signals,** which a cheat can't hide because the server computes them from inputs it had to receive:
  - **Aim kinematics:** how fast the crosshair reaches a target, how often it snaps there in one frame, how small the correction is afterward, how headshot rate changes with distance.
  - **Reaction time** from when a target became visible to the first shot, against the distribution for human players at the same skill level.
  - **Information leakage:** tracking or pre-aiming targets the player can't see. With hidden state withheld, this narrows to the short window before an enemy appears, which is exactly where a wallhack still helps.
  - **Input regularity:** intervals between inputs that are too even for a hand, recoil compensation that is too perfect, identical sequences repeated.
  - **Rejected inputs:** the validation failures from the authority layer.
- **Behavior over time:** win rate and rating climbing faster than any comparable account, play at all hours with no breaks (bots), the same routes and actions every session (farming), many new accounts from one device or payment method.
- **Reports,** which are noisy but cheap: route cheating reports to the anti-cheat pipeline, not the behavior queue ([Player Behavior & Moderation](/books/gaming/player-behavior)), and use them to prioritize review, not as proof. Valve's rule for VAC is the right one: no ban on reports alone.

### Models and Review

Statistical detection compares a player with the population at their skill level; a top player's numbers look impossible next to an average one's. Machine-learned models do the same with more features, trained on labeled cases (confirmed cheaters from signature bans and reviewed cases, and a sample of clean players). The general rules (rules and models together, bands with a human middle, decision records, late labels and holdouts) are in [Automated Risk Decisions](/docs/architecture/risk-scoring); what cheating adds:

- **Precision first, because the error is public.** Banning an innocent competitive player costs more than letting a cheater play another day, so the automatic band is narrow and the middle band goes to review with the replay, the aim traces and the signals attached ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)).
- **Score cases, not events.** One suspicious flick is a highlight; a hundred across fifty matches is a pattern. Accumulate signals per account into a case with a score.
- **The adversary retrains too.** Cheats change with every detection, so a model validated on last quarter's cheats overstates its accuracy on next quarter's; validate on a test set from after the training window ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).
- **Keep models out of the client.** Anything shipped to the client can be studied; scoring runs on the backend.

### Timing

When to act is a design decision. Banning immediately on detection protects the current match and tells the cheat developer exactly which build of the cheat was caught. Delaying (collecting detections and enforcing later, in batches) hides which check fired and catches more of a cheat's customers before it is updated, at the cost of letting known cheaters play for a while. Riot's 2018 description of anti-debug checks that respond later rather than immediately is the same idea at the level of a single check. My default: act immediately on what harms other players right now (a confirmed cheat in a ranked match: end the match or remove the player, void the result), and delay the account-level enforcement for signature detections, so the evidence of which signature fired reaches the cheat seller as late as possible.

Measure the system the way Riot reported it: prevalence (the share of matches with a cheater, by mode and region), time to action (matches from first detection to enforcement), the false positive rate (bans overturned), and how long innocent players stayed suspended.

## Enforcement: Bans, Hardware Bans and Appeals

A detection becomes a penalty through the same ladder, notices, appeals and audit trail as any moderation decision ([Trust & Safety](/docs/security/trust-and-safety); the game version is in [Player Behavior & Moderation](/books/gaming/player-behavior)). What cheating adds:

- **Severity starts high.** Confirmed cheating usually goes straight to a long suspension or a ban, because the harm is to every opponent in every match the player joins, and repeat offenders buy new accounts.
- **Undo the damage.** Void the result of matches with a confirmed cheater and restore the rating points the opponents lost. Riot's April 2024 post described making games ruined by cheaters eventually "undone," returning LP to those affected. Mechanically, a void is a new fact on the match's result and a `match.voided` event that ranked, progression and wallets each reverse on their own ([Game Results, Exactly Once per Match](/books/gaming/game-backend#game-results-exactly-once-per-match); the `reversal` rating event is in [Updating Ratings](/books/gaming/matchmaking#updating-ratings)).
- **Platform bans are separate from yours.** On Steam, a developer can use Valve's ban infrastructure through the `ICheatReportingService` Web API: the ban shows on the player's public profile and blocks them from secure servers for that game, "a permanent ban should only be issued for your game if the user was caught cheating in your game," and when the game was borrowed through Family Library Sharing the ban also applies to the owner. VAC bans are Valve's own: "permanent, non-negotiable, and cannot be removed by Steam Support," and removed automatically if found to have been issued incorrectly.
- **Go after the sellers, too.** Cheats are a business, and publishers sue the businesses. Bungie's case against AimJunkies over Destiny 2 cheats produced an arbitration award of about $4.3 million and, in May 2024, a jury verdict of $63,210 for copyright infringement, which the court then upheld against a request for a new trial. Activision won a default judgment against EngineOwning in May 2024 of $14,465,600 in statutory damages ($200 for each of 72,328 cheat downloads), plus fees and an injunction. Lawsuits don't stop the next seller, but the evidence they rest on (purchases of the cheat, the detections it triggered, the accounts that used it) comes from the same case records as bans, so keep those records good enough for a court.
- **Hardware bans** stop a banned player from simply creating a new account. They need an identifier that is hard to change: Riot uses the TPM for exactly that reason. They are also blunt. A hardware identifier follows the device, so a ban can land on the next owner of a secondhand PC or on a family that shares one, and the appeals process has to handle "this isn't my ban" as a real case, with a way to verify it. Store hardware identifiers hashed, keep them for enforcement only, and set an expiry.
- **Appeals,** reviewed by someone other than the original decision-maker, with the evidence. Riot's retrospective gives the target to beat: under 0.01% of bans overturned as false positives, those players back in under 72 hours on average. Ban questions reach [Player Support](/books/gaming/player-support) first; support routes them to the appeal flow and never reverses a ban on a persuasive ticket.

The data model adds cases and their signals beside the [core model's](/books/gaming/games-business#the-core-data-model) `penalties` and `matches`:

```sql
CREATE TABLE cheat_cases (                  -- signals accumulate into one case per account
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  account_id    UUID NOT NULL REFERENCES accounts (id),
  game_id       UUID NOT NULL REFERENCES games (id),
  status        TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'actioned',
                  'dismissed', 'overturned')),
  score         NUMERIC(6, 4) NOT NULL DEFAULT 0,
  model_version TEXT,                       -- the model that scored it last
  opened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at    TIMESTAMPTZ,
  decided_by    TEXT CHECK (decided_by IN ('system', 'staff'))
);

CREATE TABLE cheat_signals (                -- one detection or anomaly; never deleted while its case is open
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  case_id       UUID REFERENCES cheat_cases (id),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  match_id      UUID REFERENCES matches (id),
  build_id      UUID NOT NULL REFERENCES builds (id),  -- client or server build that saw it
  source        TEXT NOT NULL CHECK (source IN ('client_integrity', 'server_validation',
                  'gameplay_model', 'report', 'economy', 'manual')),
  kind          TEXT NOT NULL,              -- signature id, aim_snap, rejected_input, ...
  confidence    NUMERIC(5, 4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  details       JSONB NOT NULL DEFAULT '{}',
  observed_at   TIMESTAMPTZ NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL        -- retention by policy, extended while a case is open
);

CREATE TABLE device_bans (                  -- hardware bans, hashed, with an end
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  device_id_hash      BYTEA NOT NULL,       -- keyed hash of the hardware identifier
  id_kind             TEXT NOT NULL CHECK (id_kind IN ('tpm', 'platform_device', 'other')),
  origin_penalty_id   UUID NOT NULL REFERENCES penalties (id),
  valid_during        TSTZRANGE NOT NULL,
  revoked_at          TIMESTAMPTZ,          -- secondhand device, shared household, appeal
  revoke_reason       TEXT,
  EXCLUDE USING gist (tenant_id WITH =, device_id_hash WITH =, valid_during WITH &&)
);

ALTER TABLE penalties
  ADD COLUMN cheat_case_id   UUID REFERENCES cheat_cases (id),
  ADD COLUMN enforce_after   TIMESTAMPTZ;   -- delayed enforcement; null: immediately
```

A voided match needs no column here: the match's accepted result in `match_results` is marked `voided` with a reason that names the case, and the `match.voided` event does the rest ([Game Backend Architecture](/books/gaming/game-backend#game-results-exactly-once-per-match)).

How a case moves:

1. **Open.** The first signal for an account in a game opens a case; later signals attach to it while it's open, and a signal arriving after a case was dismissed opens a new one, so a dismissal is never quietly reopened by old evidence.
2. **Score.** Each new signal rescores the case. My default is to combine signals as independent evidence (one minus the product of one minus each signal's confidence, per signal kind, keeping only the strongest signal of each kind) so a hundred weak reports can't add up to one signature hit, and to store the model version that produced the score.
3. **Decide by band.** Above the automatic threshold, and only for signal kinds approved for automatic action (signature hits, impossible inputs), the case goes to `actioned` with `decided_by = 'system'`; in the middle band it goes to `in_review` with the evidence attached; below it, it stays open and expires with its signals.
4. **Enforce.** Actioning records the decision as the playbook's [moderation decision](/docs/security/trust-and-safety#auditing-moderation-decisions) (on a moderation case of category `cheating` whose evidence points at the cheat case), then writes the penalty against it, with `enforce_after` set when the enforcement is held back for a batch, and voids the ranked matches the case covers from the first confirmed signal on.
5. **Appeal.** An upheld appeal leaves the case `actioned`; an overturned one moves it to `overturned`, ends the penalty through `revoked_at`, revokes any device ban it created, and restores what the penalty took. Nothing is deleted; the case history is the explanation.

Every automated decision records the model version, threshold and policy version that made it ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)), so an overturned ban can be traced to its cause and a bad model version can be found and its bans reviewed in bulk.

## Linux, Steam Deck and Other Platforms

Where the anti-cheat runs decides who can play. Valve's Steamworks guidance for Proton, the compatibility layer behind Steam on Linux and Steam Deck, is direct: "Proton supports Easy Anti-Cheat without requiring any recompilation," though developers opt each build in; "Proton supports BattlEye and BattlEye-enabled games," with a manual setup per title; and "we recommend using user-space anti-cheat components for best results," because "kernel-space solutions are not currently supported and are not recommended."

So a kernel-level requirement is also a platform decision: it excludes Linux and Steam Deck players unless the game ships a user-space path for them. Consoles are a different case: the platform holder controls the operating system and the hardware, so a console client starts from a much stronger integrity position, and the remaining risks are mostly the server-side ones (input devices that emulate controllers, account trading). In a cross-play game, the weakest platform sets the floor for everyone in a shared queue. The choices are to require the same protection everywhere, to let players opt out of cross-play with less-protected platforms, or to match platforms separately in ranked modes; each one is a trade between fairness and queue size ([Matchmaking & Ranked](/books/gaming/matchmaking)).

## The Risks of Kernel Drivers

A kernel driver is privileged code that a game installs on millions of machines, often loaded at boot. That is a real risk, and the case for it should be made with the risk in view.

- **The rootkit question.** Dorner and Klausner's ARES 2024 paper, "If It Looks Like a Rootkit and Deceives Like a Rootkit," defines rootkits, separates them from ordinary kernel software, and examines four widely used kernel anti-cheat systems; it finds "two of the four anti-cheat solutions exhibiting rootkit-like behaviour," which the authors argue threatens user privacy and system integrity.
- **Signed drivers can be abused.** Trend Micro reported in August 2022 that a ransomware actor used `mhyprot2.sys`, the anti-cheat driver for Genshin Impact, to kill antivirus processes from kernel mode before deploying ransomware; "Genshin Impact does not need to be installed on a victim's device for this to work," and "as of this writing, the code signing for mhyprot2.sys is still valid." A legitimately signed driver with a dangerous interface is a tool for anyone who can load it.
- **Stability.** A bug in kernel code takes down the machine, not the game, and kernel software meets every combination of firmware, driver and overlay in the player base (Riot's retrospective lists several).
- **The platform is moving the other way.** After the July 2024 CrowdStrike outage, Microsoft's Windows Resiliency Initiative announced (November 2024) capabilities that allow "security product developers to build their products outside of kernel mode," and its June 2025 update said security products "can run in user mode just as apps do," with a private preview for antivirus vendors in the Microsoft Virus Initiative. Neither post mentions anti-cheat. As of October 2026 it's a direction, not a rule, but a design that keeps its detections in user mode and its kernel component small is the one that will move most easily if Windows narrows kernel access for third parties.

If you ship one, the mitigations follow from those risks:

- **Do as little as possible in the kernel.** Riot's design is the model: the driver protects and observes, and the detections run in user mode.
- **Expose no general-purpose interface.** A driver that will terminate any process or read any memory on request is exactly what the mhyprot2 case abused. Authenticate the caller and restrict every operation to the game's own process.
- **No network from the driver,** and state it publicly, as Riot does.
- **Sign it, have it reviewed outside the team, and pay a bounty** for vulnerabilities in it.
- **Plan for revocation.** If a driver version is found vulnerable, you need a way to block that version from loading and to ship a fixed one; tell defenders its hashes.
- **Test across hardware and firmware** before rollout, roll out gradually, and watch crash telemetry for the first sign of trouble.
- **Offer a path to remove it.** Riot's driver can be uninstalled from the system at any time; the game won't run without it, but the player decides.

## Privacy

Anti-cheat software sees a great deal of the player's machine, and players are right to ask what it does with what it sees. The rules are the general ones ([GDPR & Privacy Law](/docs/compliance/gdpr)), applied strictly:

- **Collect for one purpose,** cheat detection, and say so in public, in plain words. Riot's statements are concrete: the driver sends nothing back; League's Vanguard post says Riot "only collects what we need," keeps certain data in "warm" storage for 14 days, and will never use it for anything other than cheat detection.
- **Minimize.** Report a signature hit, not a list of running programs; hash hardware identifiers; keep file paths and process names only as long as a case needs them.
- **Separate pipelines and access.** Anti-cheat data doesn't flow into product analytics or marketing ([Telemetry & Analytics](/books/gaming/telemetry)), and the people who can read it are the people who decide cases.
- **Children.** A game rated for young players that installs a kernel driver needs a particularly clear case for it and a particularly clear notice to parents ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#data-minimization-for-minors); [Ratings, Age & Children](/books/gaming/ratings-and-age)).
- **Disclose** the anti-cheat, its components and its data use before purchase or install, and explain bans in the game. Valve's guidance to developers using its ban APIs asks for the same: tell customers an anti-cheat system exists.

## What This Means for the System You Build

- **A threat model** per game: the cheats that matter for its genre, what each needs, and the layer that stops it.
- **Server authority** for state and results, with input validation, rewind limits and hidden state withheld through relevancy rules that treat every replicated field as a possible leak.
- **Client integrity** that raises the cost of cheats, with checks that change by build and react with delay.
- **Kernel anti-cheat only with a case for it:** minimal privilege, no network, no general-purpose interface, signed, reviewed, revocable, tested across hardware, and a user-space path for platforms that can't run it.
- **Detection on the server,** from validation failures, aim and input analysis and behavior over time, accumulated into cases with scores, thresholds tuned for precision, and human review in the middle band.
- **Enforcement that repairs:** voided matches, restored rating, delayed account bans where they help, hashed and expiring hardware bans, and appeals that can overturn.
- **Metrics in public terms:** prevalence by mode and region, time to action, false positive rate and time to reinstatement.
- **Privacy by policy:** one purpose, minimized data, short retention, separate pipelines, and plain disclosure.

## References

**Reference**

- [Valve: Steamworks Anti-Cheat and game bans](https://partner.steamgames.com/doc/features/anticheat), developer-issued game bans, secure servers, permanence and Family Library Sharing
- [Valve: Steamworks Anti-Cheat Integration](https://partner.steamgames.com/doc/features/anticheat/vac_integration), the `ICheatReportingService` API and enforcing bans on the server
- [Valve: Steam Hardware and Proton](https://partner.steamgames.com/doc/steamhardware/proton), Easy Anti-Cheat and BattlEye under Proton and the recommendation against kernel-space anti-cheat
- [Steam Support: Valve Anti-Cheat (VAC) System](https://help.steampowered.com/en/faqs/view/571A-97DA-70E9-FF74), signature detection, no bans on reports alone, and permanent bans removed only if issued in error
- [Epic Games: Easy Anti-Cheat](https://www.easy.ac/en-us/), prevention-first approach, detection signals, tiers and supported platforms
- [BattlEye](https://www.battleye.com/), kernel-based protection, backend-controlled scanning, server control and global bans
- [Riot Games: What is Vanguard](https://support.riotgames.com/valorant/performance/what-is-vanguard), the client and kernel driver and the requirement to keep it active

**In practice**

- [Riot Games: Riot's Approach to Anti-Cheat](https://www.riotgames.com/en/news/riots-approach-anti-cheat), prevention, detection and deterrence, server authority, hidden state and client hardening techniques (July 2018)
- [Riot Games: Demolishing Wallhacks with VALORANT's Fog of War](https://www.riotgames.com/en/news/demolishing-wallhacks-valorants-fog-war), withholding enemy positions, the cost of raycasts, potentially visible sets and look-ahead (April 2020)
- [Riot Games: Peeking into VALORANT's Netcode](https://www.riotgames.com/en/news/peeking-valorants-netcode), the server-authoritative model and its anti-cheat purpose (July 2020)
- [Riot Games: A Message About Vanguard From Our Security & Privacy Teams](https://www.riotgames.com/en/news/a-message-about-vanguard-from-our-security-privacy-teams), the kernel rationale, boot loading, what the driver does and doesn't do, signing, review and bounties (April 2020)
- [League of Legends: /dev: Vanguard x LoL](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol/), why League's previous anti-cheat was beaten, prevalence, TPM hardware IDs and data retention (April 2024)
- [League of Legends: /dev: Vanguard x LoL Retrospective](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol-retrospective/), bans, prevalence, botting, time to action, false positives and the problems Riot acknowledged (August 2024)
- [Dorner and Klausner: If It Looks Like a Rootkit and Deceives Like a Rootkit (ARES 2024)](https://arxiv.org/abs/2408.00500), a critical examination of four kernel anti-cheat systems
- [Trend Micro: Ransomware Actor Abuses Genshin Impact Anti-Cheat Driver to Kill Antivirus](https://www.trendmicro.com/en_us/research/22/h/ransomware-actor-abuses-genshin-impact-anti-cheat-driver-to-kill-antivirus.html), a signed anti-cheat driver used by an attacker (August 2022)
- [EA: Battlefield 6 Secure Boot information](https://www.ea.com/games/battlefield/battlefield-6/news/secure-boot-information), Secure Boot required on PC for Javelin anti-cheat (August 2025)
- [Call of Duty: Black Ops 7 Beta Ricochet Anti-Cheat update](https://www.callofduty.com/blog/2025/09/call-of-duty-black-ops-7-beta-ricochet-anti-cheat-update), TPM 2.0 and Secure Boot required on PC (September 2025)
- [Call of Duty: Black Ops 7 Ricochet Anti-Cheat day one](https://www.callofduty.com/blog/2025/11/call-of-duty-black-ops-7-ricochet-anticheat-day-one), the requirement carried into launch (November 2025)
- [Windows Experience Blog: Windows security and resiliency](https://blogs.windows.com/windowsexperience/2024/11/19/windows-security-and-resiliency-protecting-your-business/), security products built outside kernel mode (November 2024)
- [Windows Experience Blog: The Windows Resiliency Initiative](https://blogs.windows.com/windowsexperience/2025/06/26/the-windows-resiliency-initiative-building-resilience-for-a-future-ready-enterprise/), the user-mode endpoint security platform and its private preview with MVI partners (June 2025)
- [TorrentFreak: Court denies AimJunkies a new trial, affirms Bungie's $4.3 million win](https://torrentfreak.com/court-denies-cheat-seller-aimjunkies-a-new-trial-affirms-bungies-4-3-million-win-240902/), the arbitration award and the jury verdict (September 2024)
- [TorrentFreak: Activision wins $14.4 million judgment against EngineOwning](https://torrentfreak.com/?p=252273), statutory damages per download, fees and injunction (May 2024)
