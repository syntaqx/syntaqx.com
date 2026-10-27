+++
title = "AI in Games"
description = "Classic game AI (behavior trees, utility, navigation) and generative AI: LLM NPCs, content tools, Steam disclosure, performer consent, testing and safety."
category = "Gaming Industry"
order = 1629
part = "Running the Platform"
tags = ["gaming", "ai", "llm", "behavior-trees", "navigation", "safety"]
+++

"AI" in a game studio means two different technologies with different owners, budgets and risks. **Game AI** is the decades-old craft of making non-player characters choose actions and move through a level: state machines, behavior trees, utility scoring and navigation meshes, all deterministic code that a designer tunes and a tester can reproduce. **Generative AI** is the recent arrival: language models that let a player talk to a character in their own words, speech models that give it a voice, and tools that produce art, code and text during development. The first is part of the engine. The second is a set of external services with their own latency, cost, failure modes, legal obligations and safety problems. This chapter covers both: how characters decide and move (state machines, behavior trees, utility scoring, navigation) and what that costs on a multiplayer server; then player-facing language models, their latency, safety and records; then generative tools in production, store disclosure, performer consent and AI-driven testing. The generative half is built the way the rest of this playbook builds AI features: the model proposes, the game decides, and every step is logged ([AI Agents in the Product](/docs/architecture/ai-agents)). The engine loop that game AI runs inside is in [Building Your Own Engine](/books/gaming/building-an-engine), and the machine learning that moderates chat and detects cheats belongs to [Player Behavior & Moderation](/books/gaming/player-behavior) and [Anti-Cheat](/books/gaming/anti-cheat).

## Two Kinds of AI, Two Sets of Rules

| | Game AI | Generative AI |
| --- | --- | --- |
| Runs | In the game simulation, on the server in multiplayer | In a model, usually a remote service |
| Output | Actions chosen from a designed set | Open-ended text, audio, images |
| Reproducible | Yes, given the same inputs | No, by default |
| Cost | CPU per tick | Money per request, latency per turn |
| Failure | A character gets stuck or acts dumb | A character says something harmful, or the service is down |
| Rules that apply | Your design | Platform disclosure, performer contracts, child safety, consumer law |

My rule: generative AI never replaces the game AI layer. A character that talks through a language model still moves, fights and decides through a behavior tree or state machine; the model's output becomes, at most, a request to that layer.

## Classic Game AI

### Deciding: State Machines, Behavior Trees and StateTree

A **finite state machine** (patrol, chase, attack, flee, with transitions between them) is the oldest structure and still right for characters with a handful of behaviors. It becomes unmanageable when every state needs a transition to most others.

A **behavior tree** replaces the transition table with a hierarchy: composite nodes choose among children (a selector tries children until one succeeds, a sequence runs them in order until one fails), and leaves are tasks. Unreal Engine's implementation (documented for UE 5.8 as of October 2026) shows the production refinements:

- **A Blackboard holds the data,** "another asset called a Blackboard which serves as the 'brain' for a Behavior Tree": keys such as the current target or whether a light is on, which the tree reads to choose branches.
- **Event-driven, not polled.** "Unreal Engine Behavior Trees are event-driven to avoid doing unnecessary work every frame." Instead of re-evaluating the whole tree each tick, conditions observe their values.
- **Conditions are decorators.** Epic recommends "that you use Decorators for conditionals" rather than condition tasks, and decorators "observe their values and abort when necessary," cancelling a running branch when its condition stops holding.
- **Services for periodic work.** Services attach to composites and run on a timer while execution is inside their subtree, for work like re-evaluating the best target.
- **Simple Parallel instead of full parallel nodes:** one primary task plus a secondary subtree, "while doing A, do B as well."

Unity's equivalent, the Behavior package (1.0, as of October 2026), is "a visual tool for authoring behaviors that control non-player characters," calling its trees "behavior graphs" because branches can merge back, with Blackboard variables stored across the Editor and runtime.

Unreal also ships **StateTree**, "a general-purpose hierarchical state machine that combines the Selectors from behavior trees" with the states and transitions of conventional state machines. It is the structure I'd start a new Unreal project with: designers think in states, and the selectors keep the transition count down.

### Scoring: Utility AI

A behavior tree picks the first branch whose conditions pass. **Utility AI** scores every option and picks the best, which suits characters with many competing needs (eat, flee, attack, heal an ally) where a fixed priority order produces robotic behavior. Unreal's StateTree selectors make the model concrete:

- **Considerations score one factor each,** and "considerations output a normalized score between 0 and 1": a consideration for low health rises as health falls; another outputs a fixed score when an enemy is near.
- **Logic combines them:** "The AND operator outputs the lower of the two Consideration input scores," and OR the higher.
- **The parent picks the child with the highest utility,** and "if two or more states have the same score, select the first state on the list." A second selector picks at random weighted by utility, which adds variety without abandoning sense.

Unreal's Environment Query System applies the same idea to places and targets: a generator produces candidate items (locations or actors), filter tests remove some, scoring tests weight the rest, and the query returns the best item, run from a behavior tree through the Run EQS Query task. "Where should I take cover?" is a utility question over points.

Utility systems are tuned through their response curves, which makes them data, not code: keep the curves and weights in versioned configuration, with a debug view that shows every option's score for a chosen character, or nobody will be able to explain why it did what it did.

### Moving: Navigation

Characters find paths on a **navigation mesh**, a simplified polygon representation of where an agent can walk. Unreal's navigation system "generates a Navigation Mesh from the collision geometry in the Level and divides the mesh into tiles," finds "the optimal path with the overall lowest cost" across polygon costs, offers static, dynamic and dynamic-modifiers-only generation, and provides "two methods of avoidance for Agents": Reciprocal Velocity Obstacles and the Detour Crowd Manager. Unity's AI Navigation package (2.0, as of October 2026) builds navigation meshes "created automatically from your Scene geometry," with dynamic obstacles that "alter the navigation of the characters at runtime" and NavMesh links "to build specific actions like opening doors or jumping over gaps."

The engineering decisions are the same in either engine:

- **Tiles let you rebuild locally.** A destructible wall or a placed barricade rebuilds the tiles it touches, not the level. Budget the rebuild time per frame.
- **Pathfinding is a query, avoidance is a simulation.** The path says where to go; local avoidance keeps a crowd from walking through itself. Crowds cost CPU per agent per tick, so they have a cap.
- **Areas carry costs.** Water, fire, enemy territory and doors are areas with costs and flags, so the same mesh serves a cautious character and a reckless one.

### Game AI in Multiplayer

In a server-authoritative game the AI runs on the server, inside the same tick budget as everything else ([Game Servers & Hosting](/books/gaming/game-servers)), and its decisions replicate to clients like any other state ([Netcode Fundamentals](/books/gaming/netcode)). Three consequences:

- **AI cost is server cost.** Behavior tree evaluation, EQS queries and pathfinding are measured per frame on the server, and the share of server frames within budget ([Game Metrics](/books/gaming/game-metrics)) includes them. Stagger expensive queries across ticks.
- **Determinism matters for replays.** A game that replays recorded inputs ([Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback)) needs AI that uses the simulation's seeded random number generator and clock, never wall time or an unseeded RNG.
- **Bots that stand in for players are a product decision.** A bot filling an empty slot changes match fairness and the meaning of a win; record the bot as a participant with no profile ([How to Build It](#how-to-build-it)), and exclude it from ratings and metrics by rule.

## Generative AI for Players: Talking to Characters

### What Ships Today

A well-documented public example of a player-facing language model on a major game platform is Epic's **LLM conversations in Unreal Editor for Fortnite**. As documented in October 2026:

- **Models.** "We use Google's Gemini 3.1 Flash-Lite models to process audio inputs and generate text responses," with ElevenLabs' Eleven v3 for the character's voice.
- **Safety layers** keep responses aligned with the Fortnite Developer Rules, for example directing a player who expresses thoughts of self-harm toward professional help.
- **Reporting.** A player can report a character's response; the report sends Epic a text log of the interaction. Otherwise transcripts are not stored, and voice audio "is not stored and is not used to train AI models."
- **Children.** A parental control, "allow voice and written communication with AI Features," gates it, and cabined accounts (Epic's restricted accounts for younger players) need a parent or guardian to complete setup first.
- **Creators** define each character's persona with prompts through a persona component. The characters respond only in English.

That design is a useful checklist: a named model, a safety layer outside it, a player report path, no retention by default, and a parental switch.

The vendors around this space, as their own pages describe them in October 2026:

- **NVIDIA ACE** offers "ready-to-integrate cloud and on-device AI models for speech, intelligence, and animation": speech recognition, text-to-speech, small language models for on-device use, and Audio2Face-3D, which turns streaming audio into facial animation for lip-sync. NVIDIA names game uses including an on-device advisor in Total War: PHARAOH, AI teammates in PUBG, and adaptive bosses in MIR5.
- **Convai** sells embodied conversational characters for game engines, with plugins for Unreal Engine and Unity, characters that "perform complex actions through a sequence of animations," a document upload for character knowledge, and "AI Safety and Guard railing" listed among its enterprise features.
- **Inworld AI** now describes itself as building "models and inference for consumer applications" (speech models and hosted open models), and its home page no longer mentions games.

The last point is the lesson for any build. The vendor that hosts your characters' brains can change its product, its pricing or its business while your game is live. Keep the character's design (persona, knowledge, allowed actions, safety rules) in your own data, behind your own interface, so the model and voice providers can be replaced.

### How a Turn Works

A voice conversation turn is a pipeline of services, and the player feels the sum of their latencies from the moment they stop speaking to the moment the character starts.

![A latency budget for one voice conversation turn: end-of-speech detection, speech recognition, input moderation, the language model's first sentence, output moderation and text-to-speech drawn as a chain T1 to T6 summing to L1, with a detail showing the output filter checking each sentence before it is spoken and replacing a blocked one with a scripted line.](/diagrams/gm-ai-npc-turn.svg "Every stage adds to the silence the player hears; streaming sentence by sentence, with the output filter on each sentence, is what keeps the turn short and safe at once.")

The numbers on the sheet are illustrative; the structure is what to copy.

- **Stream everything.** Recognition streams partial text, the model streams tokens, and speech synthesis starts on the first complete sentence. Waiting for the whole reply before speaking adds the reply's full generation time to every turn.
- **Filter per sentence.** The output check runs on each sentence before it goes to synthesis, so a harmful sentence is never spoken and a scripted fallback line takes its place (note 3 on the sheet). Filtering the whole reply at the end means either waiting for it or speaking before checking.
- **Mask the wait with the game.** A character can look up, nod, or play a "thinking" animation the moment the player stops speaking. Games have always hidden latency with animation ([Netcode Fundamentals](/books/gaming/netcode)); conversation is no different.
- **Fail into the script.** When the model or voice service times out, the character says a written line and the game continues. A quest never depends on a model answering.

### The Model Proposes, the Game Decides

A character that only talks is a content feature. One that gives the player an item, opens a door or changes a quest's state is an actor in your economy, and it gets the treatment the playbook gives every AI agent ([AI Agents in the Product](/docs/architecture/ai-agents)): a small set of typed tools, and code that decides ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)).

- **Actions are a closed list.** The model may request `offer_quest(quest_id)`, `give_hint(topic)` or `play_emote(name)`; the game's rules check that the quest is available to this player, the hint unlocked, the emote valid. The model never writes to inventories, currencies or entitlements ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)).
- **Knowledge is scoped.** The character's context holds what that character should know (its lore, this player's quest state), never other players' data or account details. A model that has private data, reads untrusted content (the player's speech) and can send messages out has every part of [The Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta); remove one.
- **The call goes through your backend.** The game client never holds a model or voice vendor's key: the server builds the context, calls the provider, filters the output and enforces the budgets below. A key shipped in a client is extracted and spent by someone else.
- **Players will attack it.** Getting a friendly shopkeeper to say something offensive and posting the clip is a sport. Plan for direct prompt injection on day one ([Prompt Injection Is Unsolved](/docs/security/ai-security#prompt-injection-is-unsolved)): the persona prompt is not a safety control, the output filter is.

## Safety for Player-Facing Models

Player-facing generation joins the trust and safety system the game already runs ([Player Behavior & Moderation](/books/gaming/player-behavior)), with a difference: the speaker is your product, so you are responsible for every line.

- **Two filters, outside the model.** One on the player's input (to catch abuse and self-harm signals and route them, as Epic's safety layer does), one on each output sentence. Use the same classifiers and policy as player chat, so a word blocked from a player is blocked from a character.
- **Age-aware by default.** A conversational character is a communication feature, and the protections for younger players apply ([Ratings, Age & Children](/books/gaming/ratings-and-age)): off by default or behind a parental control for children's accounts, as Fortnite gates it.
- **A report button on the character,** sending the transcript of the reported exchange to review, with a reason code, into the same queue as player reports.
- **Retain little.** Epic keeps no transcript unless a player reports one. Transcripts and voice are personal data with retention limits ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)); keep what a report or an audit needs, for as long as it needs.
- **Say it's AI.** The EU AI Act's Article 50 transparency obligations apply from August 2, 2026: a system that interacts with people must tell them they're dealing with an AI unless that's obvious from the context, and generative systems must mark their output as machine-generated, with generative systems already on the market given until December 2, 2026 for the marking by the Digital Omnibus amendments ([The Law, at a Pointer Level](/docs/architecture/ai-agents#the-law-at-a-pointer-level)). In a game, "obvious from the context" is a fictional character in a fictional world for some players and not for others; my default is a visible label on generated characters and a line in the store disclosure, which also answers Steam's survey (below).
- **Bounded cost.** Per-player and per-server rate limits and token budgets, so a player looping a conversation, or a script farming it, costs a known amount.
- **Evals before every model or prompt change,** with a test set of known jailbreaks, slurs, self-harm statements and lore questions, run on the exact model version you will ship ([Evals](/docs/architecture/ai-agents#evals)). Model upgrades from the vendor are releases you test, not updates that happen to you.

## Generative AI in Production

Most generative AI in games is not player-facing. It is in the editor and the pipeline: concept art, placeholder voice, code completion, localization drafts, test data. The tools change quickly. Unity, as of October 2026, is "retiring the 'Unity AI' brand name," says "Unity Muse is a deprecated product offering," keeps Sentis as the runtime for running neural network models inside the Unity runtime, and ships an in-editor assistant whose tools "utilize third party models." Two of its statements are worth building around even if you never use Unity:

- "Assets generated by Unity's in-editor assistant contain embedded metadata flagging them as AI-generated."
- "Developers are fully responsible for managing app store declarations and verifying usage rights."

Together they say: the tool can mark what it made, and the declaration is yours. A studio that can't list which shipped assets were generated, by which tool, and whether a person reworked them, can't answer a store's survey or a performer's question honestly. Record provenance at import:

```sql
-- Provenance of shipped content. tenant_id: one platform serves many games or studios.
CREATE TABLE asset_provenance (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  game_id             UUID NOT NULL REFERENCES games (id),
  asset_path          TEXT NOT NULL,          -- path in source control
  first_build_id      UUID REFERENCES builds (id),
  origin              TEXT NOT NULL,          -- human, ai_generated, ai_assisted, licensed
  tool_name           TEXT,                   -- the generator, when origin is ai_*
  tool_version        TEXT,
  is_player_consumed  BOOLEAN NOT NULL,       -- ships and is seen or heard by players
  replica_consent_id  UUID,                   -- a digital replica's consent; key added in The Records
  recorded_by         UUID NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (tenant_id, game_id, asset_path)
);
```

[Production Pipelines & Builds](/books/gaming/production-pipelines) covers where an asset import hook like this lives.

## Disclosure: Steam's Content Survey

Valve's Steamworks content survey, as of October 2026, asks developers about AI used "to create content that ships with your game and is consumed by players," such as "artwork, sound, narrative, localization, etc." AI used only to make development faster is not the focus: "efficiency gains through the use of these tools is not the focus of this section." It separates two kinds:

- **Pre-Generated:** content created with AI tools during development that ships with the game. Valve reviews it like any other content, and the developer promises it isn't illegal or infringing and matches the game's marketing.
- **Live-Generated:** content created by AI "while the game is running." The same rules apply, and the developer must describe "what kind of guardrails you're putting on your AI" to keep it from generating illegal content. Valve does not "want to ship Live-Generated AI Adult Only Sexual Content at this time."

The provenance table above answers the first question; the safety design in the previous sections answers the second. Write the guardrails description from the system as built (the filters, the report path, the fallback lines), not from intentions, because it is a statement to the store you sell through.

## Performers and Digital Replicas

A character voiced by a model trained on, or imitating, a real performer is a contract matter before it is a technical one. The union terms in the United States are set by SAG-AFTRA's Interactive Media Agreement. What follows is from a law firm's published summary (Frankfurt Kurnit Klein & Selz, January 2026), a secondary source; the agreement and your own contracts govern:

- Consent to create and use a digital replica must be "clear and conspicuous," in a separate writing or a signed rider, and for most uses it can't be obtained at initial hire for future games.
- The employer gives a "reasonably specific description" of the intended use, including whether the replica will be used for "Real-Time Generation" (an AI chatbot is the example given) and whether it will voice sensitive content such as "profanity or racial slurs."
- The employer provides a usage report "within 90 days of a game's release," identifying the characters that used a replica and how pay was calculated; vocal replica pay is based on lines generated, a line being "roughly ten words."

Whatever the exact terms of your contracts, the system consequences are the same: **consent is a record with a scope** (which performer, which game, which characters, real-time or pre-generated, sensitive content allowed or not, valid when), checked before generation; and **every generated line is counted** against that consent, so a usage report is a query rather than a reconstruction. A real-time character with a replica voice logs a count of lines per consent even when it keeps no transcript.

## AI for Testing

Testing a game means playing it, and automated players have been part of QA for a long time ([Production Pipelines & Builds](/books/gaming/production-pipelines)). Reinforcement learning adds agents that learn to play instead of following a script. EA's SEED research group describes both the promise and the friction in public papers:

- "Augmenting Automated Game Testing with Deep Reinforcement Learning" (IEEE Conference on Games 2020) uses agents that explore "based on a user-defined, reinforcing reward signal," to increase test coverage, find "unintended game play mechanics, exploits and bugs," test map difficulty, and detect common problems in first-person shooters.
- "Technical Challenges of Deploying Reinforcement Learning Agents for Game Testing in AAA Games" (IEEE CoG 2023) adds an experimental RL system to an existing scripted-bot testing tool used on Battlefield 2042 and Dead Space (2023), and documents the largest time sinks, noting that the development environment can be very different from the final product.

My default: start with scripted bots that reproduce known paths (they are cheap and deterministic), and add learning agents where the question is open-ended, such as "can a player get out of the map?" or "is this route unexpectedly fast?". Treat their findings as leads for a person to reproduce, with the recorded inputs attached.

## AI in Moderation and Anti-Cheat

Machine learning is already central to trust and safety and fair play ([Trust & Safety](/docs/security/trust-and-safety#automated-detection-human-review)), and the game chapters own it: classifiers on text and voice, report triage and the human review behind them are in [Player Behavior & Moderation](/books/gaming/player-behavior); behavior-based cheat detection and its appeal path are in [Anti-Cheat](/books/gaming/anti-cheat); support bots in [Player Support](/books/gaming/player-support). The rule they share with this chapter: a model can flag, hide temporarily and prioritize, while penalties that are hard to undo go through a person ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)).

## How to Build It

Beyond `asset_provenance`, and following the playbook's rule that every automated decision records its model, inputs and outcome ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)), a game with conversational characters needs the consent and the per-turn facts, without keeping conversations by default, and a game with bots needs participants that aren't players:

```sql
CREATE TABLE replica_consents (
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  game_id                    UUID NOT NULL REFERENCES games (id),
  performer_ref              TEXT NOT NULL,        -- contract or agency reference, not a player account
  character_keys             TEXT[] NOT NULL,
  is_real_time_allowed       BOOLEAN NOT NULL,
  is_sensitive_content_allowed BOOLEAN NOT NULL,
  valid_during               TSTZRANGE NOT NULL,
  document_ref               TEXT NOT NULL         -- the signed writing or rider
);

CREATE TABLE npc_turns (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  match_id             UUID REFERENCES matches (id),
  player_profile_id    UUID NOT NULL REFERENCES player_profiles (id),
  character_key        TEXT NOT NULL,
  model_ref            TEXT NOT NULL,            -- provider, model and version
  prompt_version       TEXT NOT NULL,
  replica_consent_id   UUID REFERENCES replica_consents (id),
  lines_generated      SMALLINT NOT NULL,        -- for usage reporting
  sentences_blocked    SMALLINT NOT NULL DEFAULT 0,
  actions_requested    TEXT[],                   -- tool names the model asked for
  actions_executed     TEXT[],                   -- what the game allowed
  latency_ms           INTEGER,                  -- L1 on the drawing
  is_reported          BOOLEAN NOT NULL DEFAULT false,
  transcript_ref       TEXT,                     -- set only when reported; retention applies
  created_at           TIMESTAMPTZ NOT NULL
);

ALTER TABLE asset_provenance
  ADD FOREIGN KEY (replica_consent_id) REFERENCES replica_consents (id);

ALTER TABLE match_participants                     -- a bot fills a slot: no profile, a bot key
  ALTER COLUMN player_profile_id DROP NOT NULL,
  ADD COLUMN bot_key TEXT,                         -- behavior and difficulty, versioned with the build
  ADD CHECK ((player_profile_id IS NULL) <> (bot_key IS NULL));
```

Ratings, reports and metrics join on `player_profile_id`, so a bot drops out of them without a filter anyone can forget; a match's bot count is a query on `bot_key`.

`actions_requested` next to `actions_executed` is the audit of the model-proposes, game-decides rule ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)); `sentences_blocked` per model and prompt version is the safety metric to watch after every change.

## What This Means for the System You Build

- **Game AI stays in the engine.** Behavior trees or StateTree for decisions, utility scoring for many competing options, navigation meshes with tiles for movement, all within the server's tick budget and using the simulation's seeded randomness; a bot in a player's slot is a participant with no profile, outside ratings and metrics.
- **Generative output is a request,** made from your backend, never from a client holding a vendor key. Characters act through a closed list of typed actions that game rules validate; models never write to inventories, currencies or quest state.
- **Stream and filter per sentence,** with animation masking the wait and a scripted fallback for every failure.
- **Safety outside the model:** input and output filters shared with player chat, a report button per character, age gating, budgets, and evals before every model or prompt change.
- **Own the character's design,** so model and voice vendors can be replaced while the game is live.
- **Record provenance at import** and answer store surveys from the record; describe live guardrails as built.
- **Consent is scoped data, lines are counted,** and transcripts are kept only when reported.
- **Learning agents for open questions in testing,** scripted bots for known paths, and findings reproduced by a person.

## References

**Reference**

- [Unreal Engine: Behavior Trees](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-trees-in-unreal-engine), behavior trees and the Blackboard (UE 5.8 docs)
- [Unreal Engine: Behavior Tree Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview), event-driven evaluation, decorators as conditionals with observer aborts, services, Simple Parallel
- [Unreal Engine: StateTree](https://dev.epicgames.com/documentation/en-us/unreal-engine/state-tree-in-unreal-engine), a hierarchical state machine combining behavior tree selectors with states and transitions
- [Unreal Engine: StateTree Selectors Overview](https://dev.epicgames.com/documentation/unreal-engine/statetree-selectors-overview), utility selection, considerations normalized 0 to 1, AND as min and OR as max, ties, weighted random selection
- [Unreal Engine: Environment Query System Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/environment-query-system-overview-in-unreal-engine), generators, contexts, filter and scoring tests, best item
- [Unreal Engine: Navigation System](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-system-in-unreal-engine), tiled navigation mesh from collision, lowest-cost paths, RVO and Detour Crowd avoidance, generation modes
- [Unity: Behavior package manual](https://docs.unity3d.com/Packages/com.unity.behavior@1.0/manual/index.html), behavior graphs, nodes and Blackboard variables
- [Unity: AI Navigation package manual](https://docs.unity3d.com/Packages/com.unity.ai.navigation@2.0/manual/index.html), navigation meshes from scene geometry, dynamic obstacles, NavMesh links
- [Epic Games: LLM Conversations in UEFN](https://dev.epicgames.com/documentation/fortnite/llm-conversations-in-unreal-editor-for-fortnite), Gemini 3.1 Flash-Lite and Eleven v3, safety layers, reporting, storage and training, English only, parental controls and cabined accounts
- [Steamworks: Content Survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey), AI disclosure for pre-generated and live-generated content, guardrails, live-generated adult sexual content, efficiency tools out of scope
- [EU AI Act: Article 50](https://artificialintelligenceact.eu/article/50/), disclosure to people interacting with an AI system, marking of synthetic output, and the context exception
- [EU AI Act: Digital Omnibus on AI](https://artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/), Regulation (EU) 2026/1744; Article 50 kept at August 2, 2026, with a transition to December 2, 2026 for marking by systems already on the market
- [Unity: AI](https://unity.com/products/ai), brand retirement, Muse deprecation, Sentis, third-party models, AI-generated asset metadata, data use, developer responsibility for store declarations

**In practice**

- [NVIDIA: ACE for games](https://developer.nvidia.com/ace), cloud and on-device speech, language and animation models, Audio2Face-3D, named game uses
- [Convai](https://convai.com/), embodied conversational characters, actions, knowledge upload, Unreal and Unity plugins, guardrails as an enterprise feature (vendor page)
- [Inworld AI](https://inworld.ai/), current self-description as models and inference for consumer applications (vendor page)
- [Frankfurt Kurnit: Inside the New SAG-AFTRA Interactive Media Agreement](https://technologylaw.fkks.com/post/102mewu/inside-the-new-sag-aftra-interactive-media-agreement-new-standards-for-ai-and-di), secondary summary of digital replica consent, use descriptions, 90-day usage reports and per-line pay (January 2026)
- [EA SEED: Augmenting Automated Game Testing with Deep Reinforcement Learning](https://arxiv.org/abs/2103.15819), RL agents for coverage, exploits, map difficulty and FPS testing (IEEE CoG 2020)
- [EA SEED: Technical Challenges of Deploying RL Agents for Game Testing in AAA Games](https://ea.com/seed/news/cog23-challenges-deploying-rl-agents-game-testing), RL added to scripted-bot testing on Battlefield 2042 and Dead Space (IEEE CoG 2023)
