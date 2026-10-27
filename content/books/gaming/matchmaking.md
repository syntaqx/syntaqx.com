+++
title = "Matchmaking & Ranked"
description = "Rating math from Elo to Glicko-2, TrueSkill and OpenSkill, hidden MMR versus visible rank, tickets, queues, widening, parties, smurfs and the matching loop."
category = "Gaming Industry"
order = 1611
part = "Multiplayer"
tags = ["gaming", "matchmaking", "ranked", "elo", "glicko", "trueskill", "multiplayer"]
+++

A matchmaker answers one question many times a second: of everyone waiting right now, who should play together? It answers with three kinds of information. A **rating** says how good each player probably is, and how sure the system is. **Constraints** say who may play together at all: the same mode, build and region, a ping ceiling, a role per slot, a party's rank spread. A **clock** says how long each player has waited, which decides how far the constraints may bend. Everything a player complains about ("my teammates are terrible", "I waited eight minutes", "that was a smurf") traces back to one of the three.

This chapter covers the rating systems with their math, the split between the hidden rating and the rank a player sees, queue design, parties, the quality-versus-time trade-off, new accounts and smurfs, the matchmakers you can adopt, and how to build one. What happens after a match is formed (allocating a server and connecting players) is in [Game Servers & Hosting](/books/gaming/game-servers). How queue time and fairness are measured is in [Game Metrics](/books/gaming/game-metrics#match-quality). Parties as a social object (invites, presence, chat) are in [Parties, Presence, Chat & Voice](/books/gaming/social-systems).

## What a Rating Is

A rating is a model of a hidden quantity, a player's skill, built from the only evidence a game reliably has: who won. Every system in this chapter does the same three things: it predicts the outcome of a game from the ratings, it observes the real outcome, and it moves the ratings in proportion to the surprise. A favorite who wins barely moves; an underdog who wins moves a lot. What separates the systems is what else they track (how uncertain the estimate is, how erratic the player is, how teams combine) and what evidence they accept beyond the result.

Two properties matter more than the formula. A rating must **predict**: if it says one side wins 70% of the time, that side should win about 70% of the time, which is testable on history. And it must **converge**: a new player's rating should reach the right neighborhood in a reasonable number of games, because every game played at the wrong rating is a bad game for nine other people.

## Elo, by FIDE's Rules

Elo is the system chess federations use, and FIDE's rating regulations (applied from 1 March 2024) are the clearest published implementation. Each player has one number. The expected score of a game comes from the rating difference; FIDE publishes the conversion as a table, where a 100-point gap gives the higher-rated player 0.64 and the lower-rated 0.36. Most game implementations use the logistic curve instead, which gives the same value at that gap:

```text
E_A = 1 / (1 + 10^((R_B - R_A) / 400))     -- A's expected score
ΔR_A = K × (S_A - E_A)                      -- S: 1 win, 0.5 draw, 0 loss
```

The **K-factor** sets how far one game moves a rating, and FIDE's values encode a policy about certainty: K = 40 for a player new to the list until they have completed 30 games, K = 20 while rated under 2400, K = 10 once the published rating has reached 2400 (and it stays 10 even if the rating drops back), and K = 40 for juniors through the year of their 18th birthday while under 2300. If K times the games in a rating period would exceed 700, K drops to the largest whole number that keeps it at or under 700. Since 1 October 2025, a difference above 400 points counts as 400 for players rated below 2650. The period's change, the sum of each game's ΔR times K, is rounded to a whole number, with 0.5 rounded away from zero.

![A dimensional sheet in two views. View A places two players on a rating axis from 1850 to 2050: A at 1900 and B at 2000, a difference of 100. A, the lower-rated player, wins; with K of 20 and an expected score of 0.36, A gains 12.8, rounded to 13, and B loses 13, so A moves to 1913 and B to 1987. View B shows Glickman's published Glicko-2 example as two intervals on an axis from 1000 to 2000: before the period, a rating of 1500 with a deviation of 200 gives an interval 800 wide; after one win and two losses the rating is 1464.06 and the deviation 151.52, so the interval narrows to 606.08. Two variable tables define each code.](/diagrams/gm-matchmaking-rating-update.svg "Both updates close: Elo moves the winner by K times the surprise, and Glicko-2 moves the rating and shrinks the uncertainty in the same period.")

Elo's weakness for games is the one K-factor fixes crudely: one number cannot say how sure it is. A player back after a year away and a player with 5,000 recent games at the same rating are treated alike, and a new account at the default rating spends its first dozens of games mismatched. FIDE's answer is a high K for the first 30 games. Games need something better, because a new account in a shooter is not a new chess player; it may be the best player in the region on an alternate account.

## Glicko-2: Ratings That Know Their Uncertainty

Glicko-2, by Mark Glickman, gives every player three numbers: a rating r, a rating deviation RD (how uncertain the rating is) and a volatility σ (how erratic the player's results are). The rating plus or minus two RD is a 95% interval: 1850 with an RD of 50 means the system is 95% confident the player is between 1750 and 1950. Unrated players start at 1500 with an RD of 350 and a volatility of 0.06, and a system constant τ limits how fast volatility can change; Glickman calls values between 0.3 and 1.2 reasonable and says to pick by testing predictive accuracy.

The algorithm works on **rating periods**: games within a period are treated as simultaneous, and ratings update at the period's end. It works best with "an average of at least 10-15 games per player in a rating period." The steps, from Glickman's paper:

1. Convert to the internal scale: μ = (r − 1500) / 173.7178 and φ = RD / 173.7178.
2. For each opponent j, weight their influence by their own uncertainty, g(φ_j) = 1 / √(1 + 3φ_j² / π²), and compute the expected score E = 1 / (1 + exp(−g(φ_j)(μ − μ_j))). An opponent with a wide RD tells the system less.
3. Compute v, the variance of the rating estimated from the period's results alone, and Δ, the estimated improvement: v times the sum of g(φ_j)(s_j − E).
4. Find the new volatility σ′ by iteration (Glickman replaced the original Newton-Raphson step with the Illinois algorithm in 2012 because the original occasionally failed to converge).
5. Widen the deviation for the passage of time, φ* = √(φ² + σ′²), then combine it with the evidence: φ′ = 1 / √(1/φ*² + 1/v), and move the rating: μ′ = μ + φ′² Σ g(φ_j)(s_j − E).
6. Convert back: r′ = 173.7178μ′ + 1500 and RD′ = 173.7178φ′.

Glickman's worked example is the one drawn above: a 1500 player with an RD of 200 beats a 1400 and loses to a 1550 and a 1700, and ends the period at 1464.06 with an RD of 151.52. Two properties make Glicko-2 better suited to games than Elo. The deviation shrinks as evidence accumulates, so new players move fast and settled players move slowly without a hand-set K schedule. And a player who doesn't play in a period gets only step 5: their rating stays, but their RD grows, so a returning player is treated as uncertain again.

The cost is the rating period. A game where players play ten matches in an evening wants ratings to move after every match, not at midnight. Running the update with a period of one match works, but it strays from the assumption Glickman states; test the predictive accuracy if you do.

## TrueSkill and TrueSkill 2: Teams

Chess has two players. Most competitive games have teams, sometimes more than two, and individual ratings must be inferred from team results. **TrueSkill**, by Herbrich, Minka and Graepel at Microsoft Research (NIPS, published January 2007), describes itself as "a generalisation of the Elo system used in Chess." Each player's skill is a Gaussian belief with a mean μ and a standard deviation σ. A team's performance is the sum of its players' performances, a match result is an ordering of team performances, and the update runs approximate message passing on a factor graph to push the result back through the team sums into each player's belief. It handles any number of teams, models draws explicitly, and, like Glicko, shrinks σ as evidence arrives. The paper reports its use in a large commercial online gaming service.

The structural limit of TrueSkill is the evidence it accepts: only who placed where. A player who carried a losing team and one who was carried to a win get the direction their team got. **TrueSkill 2** (Minka, Cleven and Zaykov, Microsoft Research technical report MSR-TR-2018-8, March 2018) adds the data shooters already have: player experience, squad membership (players who queue together perform differently), kill counts, tendency to quit, and skill in other modes. On historical *Halo 5* matches, "TrueSkill2 predicts historical match outcomes with 68% accuracy, compared to 52% accuracy for TrueSkill." The lesson outlasts the model: per-player performance signals, party membership and quitting all carry information about skill, and a system that ignores them leaves accuracy on the table.

Using performance stats has a cost the paper doesn't solve for you: players optimize what you measure. My caution: rate kills, and expect some players to stop playing the objective. Every signal added to the rating must be one you're content to see players chase.

## Weng-Lin and OpenSkill

TrueSkill's factor-graph inference is more machinery than many teams want, and its name is a Microsoft trademark. Ruby Weng and Chih-Jen Lin's "A Bayesian Approximation Method for Online Ranking" (Journal of Machine Learning Research 12, 2011) gets similar results with simple closed-form updates: it treats a game among k teams as a set of two-team comparisons and derives analytic update rules that avoid numerical integration. The authors report accuracy "competitive with state of the art systems such as TrueSkill," with shorter running time and shorter code.

**OpenSkill** implements the Weng-Lin family as open-source libraries; openskill.py is MIT-licensed, offers several models including Plackett-Luce, and its example rates a new player at μ = 25 and σ ≈ 8.33. Its README claims "Accuracy matches TrueSkill" and "150% faster than TrueSkill" without publishing the benchmark, so measure on your own history before relying on either.

## Choosing a System

| System | Tracks | Teams | Update | Fits |
| --- | --- | --- | --- | --- |
| Elo (FIDE) | Rating | No | Per game, K-factor | One-versus-one games, simple and explainable |
| Glicko-2 | Rating, deviation, volatility | No | Per rating period | One-versus-one with irregular play; inactivity handling |
| TrueSkill | Mean, deviation | Any number | Factor graph | Team and free-for-all games, draws |
| TrueSkill 2 | Plus experience, party, kills, quitting | Yes | Factor graph, more inputs | Shooters with rich per-player data |
| Weng-Lin / OpenSkill | Mean, deviation | Any number | Closed form | Team games without TrueSkill's machinery |

My default for a new team game is a Weng-Lin model through OpenSkill, with party membership as a feature and the rating's deviation driving placement, then evaluate against held-out history before launch. Whatever the choice, store the rating per player, per queue, per season, and treat the formula and its constants as versioned configuration, so a change can be replayed against last season's matches before it ships ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Hidden MMR and Visible Rank

Every major competitive game separates two numbers. The **matchmaking rating (MMR)** is the rating system's estimate, used to make fair matches. The **rank** is what the player sees: a tier and division, with points to the next one. Blizzard and Riot have both published how their games treat the split, and they describe the same design.

- **Overwatch 2.** Blizzard's launch post on competitive play says skill tier and division "aren't completely aligned with the matchmaking rating we use to determine matches," and replaced per-game rank changes with an update every seven wins or 20 losses. A later developer blog adds that "A player's visible rank will move towards their rating over time" and that seasonal rank decay "has no effect on players' underlying ratings."
- **VALORANT.** "You will never see your MMR," and it is "what we use to create fair matches." MMR is kept "slightly decoupled from your visible rank and RR" (Rank Rating, the visible points) so a rank doesn't swing wildly or demote a player right after a promotion. When rank sits above MMR, losses cost more RR than wins pay; when MMR is above rank, the reverse. Players are placed "on the low end of where we think you belong," and rank converges toward MMR.
- **League of Legends.** "Your MMR is...a secret!", a division generally takes 100 LP, LP gains and losses scale with the gap between MMR and rank, there is a separate MMR per queue, and initial Ranked placement takes Normal MMR into account.

The design works because the two numbers do different jobs. MMR has to be accurate, which means it moves by whatever the model says. Rank has to feel fair and motivating, which means it moves in predictable steps, never drops right after a promotion, and converges toward MMR from below. Showing players the raw rating invites them to read every game's change as a verdict; showing them a rank that drifts toward the rating gives the same information with less noise. The cost is trust: players know a hidden number exists and suspect it. Publishing how the two relate, as these posts do, is most of the answer.

Ranked adds the rest of the season machinery:

- **Seasons** reset or soften visible rank on a schedule, and placement re-converges it. Keep MMR continuous across seasons unless the game changed enough to invalidate it; a reset rating means dozens of mismatched games per player.
- **Decay** lowers a visible rank after inactivity in some games, so leaderboards reflect active players. In a Glicko-style system, inactivity already widens the deviation; decay the rank, not the rating, as Overwatch 2's decay does.
- **Restrictions** gate the queue: a minimum account level, an owned roster, no active ranked penalty. The core model's `penalties` table already holds it, as a `feature_restriction` with `restricted_feature = 'ranked'`; League's 2023 behavioral update described restricting penalized players from Ranked until they played other queues ([Player Behavior & Moderation](/books/gaming/player-behavior)).

## Queue Design

A **queue** is a pool of waiting requests plus the rules for matching them. PlayFab's matchmaking documentation (its matchmaker uses Xbox's SmartMatch technology) gives the vocabulary most systems share. A **ticket** is "a player or a list of players that want to play together, along with their attributes." Tickets go into a queue, and "Tickets can only match with other tickets in the same queue. A player can only be in one ticket at a time." A queue sets a minimum and maximum match size and fills to the maximum when it can.

Rules are hard constraints the match must satisfy. PlayFab's types cover most designs: string equality (same map, mode, build), difference (no two tickets' skill further apart than a maximum), set intersection (shared languages or maps), match total, region selection (every player's latency to a common data center under a ceiling), team size balance, team difference (team skill within a maximum) and team ticket size similarity (big parties on each side, or none).

**Latency** is usually the first constraint, not the last. A fair match on a server 150 ms away is not fair. The client measures its latency to each candidate region (Steam Datagram Relay's `PingLocation_t`, hosting providers' ping beacons, or your own probes) and puts the results on the ticket; the matchmaker then only forms matches with a region every member can reach under the ceiling. Activision's 2024 matchmaking paper ranks connection "the most critical and heavily weighted factor" in Call of Duty's matchmaking, with time to match second, and measures it as **delta ping**: the difference between a player's ping to their best data center and to the one being considered. Region pools are a product decision too: one large pool across neighboring regions gives faster, fairer matches to more people at a cost in ping for some.

**Role queues** add a slot constraint: each team needs exactly one of each role, players list the roles they will play, and the matchmaker assigns roles while matching. The role becomes part of the rating (a player's support MMR and their carry MMR are different numbers), and queue times split by role, because the scarce role sets everyone's wait. My default is to show the wait per role and reward players who fill the scarce one.

### Widening the Search

No queue has a perfect match waiting for every ticket, so every real matchmaker relaxes its rules as a ticket ages. PlayFab rules can "relax over time or become disabled after some time"; AWS GameLift FlexMatch calls them **expansions**. FlexMatch's documented example starts with players required to be within 5 skill levels of each other, widens to 10 after 15 seconds and to 20 at 25 seconds. A subtle detail: FlexMatch starts an expansion "when the age of the newest ticket in the incomplete match matches an expansion wait time," and adding a ticket to the match may reset the clock, so a forming match doesn't widen on the strength of its oldest member alone.

![A dimensional sheet in two plan views over a 40-second time axis. View A shows one ticket's skill window as a stepped band around its rating R0: a half-width of 5 from 0 to 15 seconds, 10 from 15 to 25 seconds, and 20 from 25 seconds on, following the AWS FlexMatch documentation example, with an illustrative match found at 19 seconds against an opponent 8 levels away. View B shows an illustrative latency ceiling of 60 ms until 30 seconds and 90 ms after, when the next region joins the pool. A variable table defines S0 to S2, T1 to T3 and L0 and L1.](/diagrams/gm-matchmaking-search-widening.svg "Every constraint gets a schedule: the window starts tight, widens in steps as the ticket ages, and the latency ceiling relaxes last, if at all.")

The schedule is the matchmaker's real policy, and it deserves the same care as the rating:

- **Widen skill before latency.** A slightly uneven match on a good connection is a better game than an even match with lag. Call of Duty calls its schedules "backoffs" and has "always backed off on skill more quickly than other matchmaking dimensions like Delta Ping." Some constraints (build version, mode, an age-gated chat setting) never relax.
- **Widen per population.** The top and bottom of the skill curve and small regions have fewer neighbors and need faster widening; a single schedule tuned on the median makes the edges wait.
- **Cap the widening.** Past some width a match is worse than no match; a timeout with an honest message ("no match found, try another mode") beats a stomp.
- **Tie the schedule to backfill.** FlexMatch's guidance warns against relaxing player-count requirements too quickly when automatic backfill will fill a started session's empty slots in a few seconds anyway.

**Backfill** is matching into a match that already exists: a player left a match in progress, or a persistent server has open slots. The server (or the service that owns the match) creates a backfill ticket describing the open slots and the current players' attributes, and the matchmaker treats it as a ticket that must be completed rather than formed. FlexMatch and PlayFab both support it. Rules for backfill are usually looser on skill and stricter on time remaining: nobody wants to join a ranked match with two minutes left and a loss on the record.

## Parties

A party queues as one ticket, so its members match together or not at all. PlayFab's join flow "ensures that all players in the group consent to match together," which is the matchmaker's half of party consistency; the other half (everyone is online, on the right build, owns the mode, has no queue penalty) is checked by the party service before the ticket exists ([Parties, Presence, Chat & Voice](/books/gaming/social-systems)).

Parties break skill matching in two ways. A coordinated party beats an equally rated group of strangers, which TrueSkill 2 measured by making squad membership an input; Activision's paper adds that without team balancing "a six-player party who are all in the 60th skill percentile would be rated higher than approximately 80% of randomly sampled six-player teams." And a party's members differ in skill, so the party needs one number to match on. Activision's example is a 50th-percentile player queuing with a 99th: match on the weaker and the stronger dominates every lobby, match on the stronger and the weaker is always last, so Call of Duty matches "in the middle." The common designs:

- **Average** of members' MMR. Simple, and wrong at the extremes: a top player carrying a low-rated friend matches into a lobby where the top player dominates.
- **Weighted toward the highest**, for example a power mean or the average plus a fraction of the spread. This reflects that the best player in a party influences the outcome more.
- **Average plus a party bonus**, a fixed or learned amount for queuing together, which accounts for coordination.

My default: a weighted mean that leans toward the highest-rated member, plus a learned party-size bonus, both fit on historical matches and both versioned. Then limit what the formula can't fix, and the published approaches differ on how:

- **Restrict the spread.** VALORANT's ranked parties were checked against an allowed rank range before entering the queue ("the parties service will ask the skill ratings service to verify," per Riot's 2020 load-testing post). It is simple and keeps lobbies tight, at the cost of pushing friends of different ranks onto new accounts (see [New Accounts and Smurfs](#new-accounts-and-smurfs)).
- **Allow any spread and match disparity with disparity.** Call of Duty "imposes no restrictions on how wide this skill gap can be for parties outside of ranked play," and adds a skill disparity rule so wide parties are grouped with other wide parties; Blizzard's Overwatch 2 developer blog names grouping as a main cause of wide matches and describes the same direction: matching parties with similar MMR disparities together more often. Riot later moved VALORANT this way for five-player parties, with high-discrepancy five-stacks earning and losing "diminished Ranked Ratings."
- **Balance party sizes.** PlayFab's team ticket size similarity rule makes a five-player party face a party, not five strangers; Call of Duty creates new lobbies with no team-size difference and lets backfill only join if it doesn't worsen one.

## Quality Versus Queue Time

The matchmaker trades two things players want, and the trade is not symmetrical. A longer wait costs every player in the queue. A worse match costs the ten players in it, for twenty to forty minutes, and the losing side often blames teammates, which feeds reports and churn. Neither extreme works: waiting forever for a perfect match empties the queue (players leave, which makes the next wait longer), and matching instantly at any quality makes ranked meaningless. Activision has published the clearest test of loosening skill: in a 2024 Modern Warfare III experiment that loosened skill constraints for half of North American players, returning players fell for 90% of them, quit rates rose for 80%, and only the top 10% benefited; its summary is that with skill in matchmaking, "80-90% of players experience better end-of-match placement, stick with the game longer and quit matches less frequently." Blizzard's description of the top of the ladder is the same trade from the other end: "a hard tradeoff between making worse matches or dramatically increasing queue times."

The practical form of the trade is a **match quality score** with a threshold that falls as tickets age. Quality is the predicted closeness of the match (how near the predicted win probability is to 50%, or the draw-probability measure described in [Game Metrics](/books/gaming/game-metrics#match-quality)) combined with penalties for ping, party mismatch and role fit. A candidate match is accepted when its quality clears the oldest ticket's current threshold. The widening schedule above is that threshold drawn as rule ranges instead of a score.

Population drives the whole thing. At peak in a large region, the pool is deep enough that tight matches form in seconds; at 4 a.m. in a small region, the same rules produce nothing. Watch the quality and queue-time distributions per region, hour and skill band, not overall ([Game Metrics](/books/gaming/game-metrics#match-quality)), and expect the policy to differ by time of day.

## New Accounts and Smurfs

A new account starts with a default rating and a wide deviation. For an honest new player that's correct. For an experienced player on a second account, a **smurf**, it's wrong in a way that hurts everyone: the smurf "stomps" a run of lower-skill matches while the rating catches up. Riot's VALORANT posts are the most detailed public numbers on it, and two of their findings transfer:

- **Why.** Riot's December 2022 Systems Health post found "the single largest reason players create alternate accounts is to play competitively with friends." Party rules that block friends of different ranks create smurfs, which is the cost of the restrict-the-spread approach in [Parties](#parties).
- **Detection.** The same post describes automated detection that moves a detected account's MMR toward its correct value. VALORANT counts a stomp as a win "by 8 or more rounds" (Call of Duty's equivalent in Team Deathmatch is a score delta over 30; the general measure is in [Game Metrics](/books/gaming/game-metrics#match-quality)). The stomp rate in matches with a smurf was 32% before the changes; adjusted smurfs reached their appropriate MMR "in as little as 4 matches," while a control group was "still ~3 divisions away" after 10 matches.

The mechanics a system needs, without guessing at anyone's detection model:

- **Placement uses every signal available before the first match.** League's placement takes Normal MMR into account; a new ranked profile on an old account should inherit from the account's other queues and games, with a wide deviation.
- **Early games move the rating fast.** A wide deviation (Glicko, TrueSkill, OpenSkill) does this automatically; Elo needs a high early K.
- **Performance evidence accelerates placement.** A new account that wins every match by a large margin, with per-player stats far above its lobby, is moved further per match. This is where TrueSkill 2's lesson applies most.
- **Gate ranked behind time played.** A minimum account level or unranked-game count raises the cost of a fresh account and gives the rating evidence before ranked stakes apply. Overwatch 2 made new accounts "win 50 Quick Play matches before Competitive unlocks," and Call of Duty requires players to "qualify for access to Ranked Play modes."
- **Account linking and identity.** Smurfing and ban evasion share a tool (cheap accounts), and the defenses in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) and [Anti-Cheat](/books/gaming/anti-cheat) raise its price.

Smurfs also distort the numbers outside matchmaking: every alternate account is a "new player" in retention cohorts and a separate active user, so I read the stomp rate next to new-player retention, where any harm stomps do to real new players would show up ([Retention and Cohorts](/books/gaming/game-metrics#retention-and-cohorts)).

Account sharing, boosting (a better player playing on someone else's account) and win-trading are the adversarial versions, handled as conduct, not as rating problems ([Player Behavior & Moderation](/books/gaming/player-behavior)).

## Matchmakers You Can Adopt

| Option | What it is | Notes |
| --- | --- | --- |
| **Amazon GameLift FlexMatch** | Managed rule sets with teams and expansions | 2 to 200 players, with separate large-match rule sets from 40 players; backfill |
| **Open Match** (Google, open source) | A framework: you write the matching logic | Version 1.8.0 (docs last modified June 17, 2025); an "Open Match 2" appears in the docs navigation without explanation |
| **PlayFab Matchmaking** (Microsoft) | Managed queues and rules, built on Xbox SmartMatch | Rule types above; backfill tickets; queue statistics |
| **Backend suites** (Nakama, EOS, Unity, AccelByte, Pragma) | Matchmaking as one service of a backend, open source or managed | Compared in [What You Can Adopt](/books/gaming/game-backend#what-you-can-adopt) |

Open Match is worth reading even if you never run it, because its architecture names the parts every matchmaker has. The **Game Frontend** "receives the matchmaking request from the game client," authenticates it and creates a **Ticket**, whose search fields are indexed. The **Director** "understands the types of matches (MatchProfiles) that can be served," periodically asks the backend for matches for each profile, gets a game server from the allocator, and writes an **Assignment** with the connection details back to the tickets. The **Match Function** holds "the core matchmaking logic," run against the **Ticket Pool** "actively being considered." An optional **Evaluator** deduplicates match proposals when several match functions propose overlapping matches. That separation (intake, pool, proposal, arbitration, assignment) is the right shape for a matchmaker you build too.

The trade-off between adopting and building is the usual one for a core loop: managed matchmakers are quick and proven, and they cap you at their rule language. If your matchmaking is your game's competitive identity (role assignment, party fairness, a custom rating model), plan to own the match function, even on a managed platform.

## How to Build It

### The Ticket Model

Tickets are short-lived, high-churn and mostly in memory; ratings and outcomes are durable. Extending the core model ([The Games Business](/books/gaming/games-business#the-core-data-model)), with `tenant_id` because the model serves many games:

```sql
CREATE TABLE rating_models (                -- the formula and constants, versioned
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  game_id      UUID NOT NULL REFERENCES games (id),
  queue        TEXT NOT NULL,                -- ranked_solo, ranked_flex, casual, ...
  algorithm    TEXT NOT NULL CHECK (algorithm IN ('elo', 'glicko2', 'trueskill',
                 'openskill')),
  parameters   JSONB NOT NULL,               -- K schedule, tau, beta, party weights
  valid_during TSTZRANGE NOT NULL
);

CREATE TABLE player_ratings (               -- current state, one row per queue and season
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  player_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  queue             TEXT NOT NULL,
  season            TEXT NOT NULL,
  rating            DOUBLE PRECISION NOT NULL,  -- hidden MMR (mu)
  deviation         DOUBLE PRECISION NOT NULL,  -- RD or sigma
  volatility        DOUBLE PRECISION,           -- Glicko-2 only
  games_played      INTEGER NOT NULL DEFAULT 0,
  visible_tier      TEXT,                       -- the rank the player sees
  visible_points    INTEGER,                    -- LP, RR
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_profile_id, queue, season)
);

CREATE TABLE rating_events (                -- append-only: every change and why
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  player_rating_id  UUID NOT NULL REFERENCES player_ratings (id),
  match_id          UUID REFERENCES matches (id),  -- null for placement, decay, correction
  rating_model_id   UUID NOT NULL REFERENCES rating_models (id),
  kind              TEXT NOT NULL CHECK (kind IN ('match', 'placement', 'decay',
                      'smurf_adjustment', 'reversal', 'season_reset')),
  rating_before     DOUBLE PRECISION NOT NULL,
  rating_after      DOUBLE PRECISION NOT NULL,
  deviation_before  DOUBLE PRECISION NOT NULL,
  deviation_after   DOUBLE PRECISION NOT NULL,
  points_delta      INTEGER,                      -- visible change shown to the player
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_rating_id, match_id, kind)       -- one update per match, ever
);

ALTER TABLE match_participants
  ADD COLUMN rating_before     DOUBLE PRECISION,  -- snapshot at match formation
  ADD COLUMN deviation_before  DOUBLE PRECISION,
  ADD COLUMN expected_score    DOUBLE PRECISION,  -- what the model predicted
  ADD COLUMN ping_ms           INTEGER,           -- to the chosen region, at matching
  ADD COLUMN ticket_created_at TIMESTAMPTZ,       -- wait = matched_at - ticket_created_at
  ADD COLUMN matched_at        TIMESTAMPTZ,
  ADD COLUMN widening_step     SMALLINT,          -- how far the schedule had relaxed
  ADD COLUMN role              TEXT;

ALTER TABLE matches
  ADD COLUMN queue           TEXT,                -- finer than mode: ranked_solo, ranked_flex
  ADD COLUMN region_pool     TEXT,                -- matched in; where it ran is the server's region
  ADD COLUMN match_quality   DOUBLE PRECISION,    -- the score the matchmaker accepted
  ADD COLUMN rating_model_id UUID REFERENCES rating_models (id);
```

These columns are the matchmaker's record of each match, written once at formation; [Game Metrics](/books/gaming/game-metrics#match-quality) reads queue time, calibration and quality from them rather than keeping copies.

The ticket itself lives in the matchmaker's memory or a fast store, not in Postgres: an id, the party id and member profile ids, the queue, each member's rating and deviation snapshot, per-region latency, roles, the created time, and a state. The states and their moves are few: `searching` to `proposed` when the loop reserves it, `proposed` to `assigned` when a server is allocated, `proposed` back to `searching` (keeping its age) on an allocation failure or another player's declined ready check, and `searching` to `cancelled` (the player left the queue) or `expired` (the widening cap was reached). Write a ticket's life-cycle as events (`ticket.created`, `ticket.matched`, `ticket.cancelled`, `ticket.expired`) so queue-time metrics come from facts, and so a disputed match can be explained afterwards ([Events & Async Messaging](/docs/architecture/events)).

### The Matching Loop

A matchmaker is a loop over pools, not a request handler. The shape:

```text
every tick (for example, every 1 s) for each queue and region pool:
  tickets = pool.searching, oldest first
  for each ticket t:
    window = schedule(queue, population, age(t))        -- the widening policy
    candidates = index.lookup(t, window)                 -- skill range, region, mode, roles
    proposal = best_match(t, candidates)                 -- team split maximizing quality
    if proposal and quality(proposal) >= threshold(age(oldest in proposal)):
      reserve(proposal.tickets)                          -- atomically; skip if any taken
      emit match.proposed
  hand proposals to the director: allocate a server, write assignments
  on allocation failure: release tickets back to the pool, keeping their age
```

The details that decide whether it works:

- **Oldest first.** Processing the longest-waiting tickets first is what makes the widening schedule fair; otherwise new tickets keep taking the good matches.
- **Reservation is atomic.** Two proposals can want the same ticket; one wins and the other is discarded (Open Match's evaluator does exactly this). A ticket that's been reserved stops being a candidate.
- **Team split is its own search.** Given ten players, choosing the two teams that make the closest match is a small combinatorial problem; for team sizes up to five, trying the splits is cheap. Call of Duty searches every team composition exhaustively for modes up to 12v12 once a lobby forms, keeps those with the smallest size difference, and picks the smallest skill difference among them; while lobbies are still forming, it only checks that the parties can be split evenly, with the Karmarkar-Karp heuristic.
- **Prune the candidates.** A pool too large to search exhaustively needs an ordering. Call of Duty runs its matching pass every five seconds, sorts candidates for each search by a weighted distance over geography, skill and control scheme, and sends only the top K on, because 300 players already allow more than 10^20 distinct 12-player lobbies.
- **Pools are partitioned** by queue, mode, build and region group, so each loop works on a manageable set and a slow pool doesn't stall others.
- **Allocation failure keeps the ticket's age.** A player who waited 90 seconds and then lost a server allocation should not go to the back of the line.
- **Ready checks and dodges.** If players must accept the match, a decline returns the others' tickets to the pool with their age and applies the decliner's penalty; a dodge in champion or agent select is the same.

### Updating Ratings

Rating updates consume `match.completed` events, never a poll of the matches table. An abandoned or remade match must not update anyone, and a match reversed for cheating must undo its updates, which is why `rating_events` is append-only with a `reversal` kind: League's Vanguard posts describe undoing matches and returning LP to players who faced cheaters ([Anti-Cheat](/books/gaming/anti-cheat)). The update is idempotent on (rating, match, kind), so a redelivered event changes nothing ([Idempotency](/docs/payments/idempotency)). Snapshot the ratings and the model version at match formation (`rating_before`, `rating_model_id`), so the update uses what the matchmaker used, even if a placement adjustment arrived mid-match.

### Fairness Metrics

The matchmaker must log what the [Game Metrics](/books/gaming/game-metrics#match-quality) chapter measures: for every match, the predicted win probability, the quality score accepted, each ticket's wait, the widening step it reached, ping, party sizes and the outcome. With that, calibration (did 70% predictions win 70% of the time?), stomp rate and queue-time percentiles by population are queries, not projects. Two checks belong in the release process for any rating or schedule change: replay last season's matches under the new model and compare predictive accuracy, and simulate the queue with recorded arrival rates to see queue times before players do.

## Auditing

- **Every rating change** is a `rating_events` row naming the match, the model version and the before and after values. A player who asks "why did I lose 30 points?" gets an answer from the record.
- **Every model or schedule change** is a new `rating_models` row with an effective range, the replay results that justified it, and who approved it ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Every adjustment that isn't a match result** (placement, smurf adjustment, decay, reversal, a manual correction by support) has its own kind and reason, so a ranked leaderboard dispute can separate play from intervention.

## What This Means for the System You Build

- **A rating with uncertainty** (Glicko-2, TrueSkill or Weng-Lin through OpenSkill), per player, per queue, per season, with the model and its constants versioned and replayable against history.
- **Hidden MMR and a visible rank** that converges toward it, with the relationship explained publicly.
- **Tickets, queues and pools** partitioned by mode, build and region group; latency measured by the client and enforced as a constraint.
- **A widening schedule per constraint and population,** latency relaxing last, a cap on how far it goes, and timing aligned with backfill.
- **Party rules** with a party MMR formula fit on history, a rank-spread policy that lets friends play without new accounts, and party-versus-party balance.
- **Placement that uses every prior signal,** fast early movement and performance-based acceleration against smurfs.
- **A matching loop** that serves the oldest tickets first, reserves atomically, keeps a ticket's age through failures, and hands assignments to the server allocator.
- **Event-driven, idempotent, reversible rating updates,** and a per-match record complete enough to compute fairness and explain any result.

## References

**Specifications**

- [FIDE: Rating Regulations effective from 1 March 2024](https://handbook.fide.com/chapter/B022024), the expected-score table, K-factors of 40, 20 and 10, the K × n cap of 700, the 400-point rule from 1 October 2025 and rounding
- [Mark E. Glickman: Example of the Glicko-2 system](http://www.glicko.net/glicko/glicko2.pdf), rating, deviation and volatility, the defaults, the update steps, the 2012 Illinois-algorithm revision and the worked example (March 22, 2022)

**Reference**

- [Microsoft Research: TrueSkill, a Bayesian skill rating system](https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system/), Herbrich, Minka and Graepel, team inference and draws by message passing on a factor graph (NIPS 20, January 2007)
- [Microsoft Research: TrueSkill 2](https://www.microsoft.com/en-us/research/publication/trueskill-2-improved-bayesian-skill-rating-system/), Minka, Cleven and Zaykov, experience, squads, kills and quitting as inputs, and 68% versus 52% prediction accuracy on Halo 5 (MSR-TR-2018-8, March 2018)
- [Weng and Lin: A Bayesian Approximation Method for Online Ranking](https://www.jmlr.org/papers/v12/weng11a.html), k-team games as two-team comparisons with analytic updates (JMLR 12, 2011)
- [OpenSkill: openskill.py](https://github.com/OpenDebates/openskill.py), the MIT-licensed Weng-Lin implementation, its Plackett-Luce model and its accuracy and speed claims
- [Open Match: Matchmaking using Open Match](https://open-match.dev/site/docs/guides/matchmaker/), the frontend, director, match function, evaluator, ticket pool and assignments (version 1.8.0)
- [Open Match: Documentation](https://open-match.dev/site/docs/), the framework's description, the 1.8.0 release and the June 17, 2025 modification date
- [Microsoft Learn: PlayFab Matchmaking](https://learn.microsoft.com/en-us/gaming/playfab/features/multiplayer/matchmaking/), tickets, queues, one ticket per player, party consent, match size, rule types, rules that relax over time and SmartMatch
- [AWS: Design a FlexMatch rule set](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-design-ruleset.html), latency requirements, relaxing rules over time, party aggregation and large matches from 40 players
- [AWS: Allow requirements to relax over time](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets-components-expansion.html), expansions, the 5, 10 and 20 skill example, the newest-ticket clock and backfill timing
- [AWS: What is Amazon GameLift Servers?](https://docs.aws.amazon.com/gamelift/latest/developerguide/gamelift-intro.html), FlexMatch for 2 to 200 players with backfill
- [Valve: Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay), `PingLocation_t` for estimating ping to data centers for matchmaking
- [Heroic Labs: Nakama](https://github.com/heroiclabs/nakama), the Apache 2.0 game backend with a matchmaker, parties and leaderboards

**In practice**

- [Activision: Matchmaking Series, The Role of Skill in Matchmaking](https://www.activision.com/cdn/research/CallofDuty_Matchmaking_Series_2.pdf), connection as the most heavily weighted factor, delta ping, skill backed off faster than delta ping, the party-in-the-middle example and the 60th-percentile party, unrestricted party spread with a skill disparity rule, team-size balance and backfill, the five-second pass and top-K candidate pruning, exhaustive team splits up to 12v12 and Karmarkar-Karp, blowouts over 30 in TDM, ranked qualification, and the 2024 deprioritized-skill test with the 80-90% summary (2024)
- [Blizzard: Initializing Systems, Updating Competitive Play for Overwatch 2](https://news.blizzard.com/en-us/article/23857518/initializing-systems-updating-competitive-play-for-overwatch-2), skill tiers not fully aligned with the matchmaking rating, updates every seven wins or 20 losses, and 50 Quick Play wins before Competitive for new accounts
- [Blizzard: Overwatch 2 Developer Blog, Explaining matchmaker goals and plans, part 2](https://overwatch.blizzard.com/en-us/news/23910161), visible rank moving toward rating, decay that leaves ratings untouched, grouping as a cause of wide matches, parties with similar MMR disparities, and the quality versus queue time trade at the top
- [VALORANT: Ask VALORANT, Rank Rating Edition](https://playvalorant.com/en-us/news/dev/ask-valorant-rank-rating-edition/), hidden MMR, its decoupling from RR, placement on the low end and convergence (March 18, 2021)
- [Riot Games Support: MMR, Rank, and LP](https://support.riotgames.com/en-us/league-of-legends/gameplay/mmr-rank-and-lp), secret MMR, 100 LP a division, LP by the MMR gap, an MMR per queue and placement from Normal MMR (May 28, 2026)
- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), the parties service asking skill ratings to verify a premade's rank range (December 15, 2020)
- [League of Legends: /dev: Behavioral Systems Update](https://www.leagueoflegends.com/en-gb/news/dev/dev-behavioral-systems-update-may-2023/), restricting penalized players from the Ranked queue (May 24, 2023)
- [League of Legends: /dev: Vanguard x LoL](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol/), undoing matches affected by cheaters and returning LP (April 11, 2024)
- [VALORANT: Systems Health Series, Smurf Detection](https://playvalorant.com/en-us/news/dev/valorant-systems-health-series-smurf-detection/), a stomp as a win by 8 or more rounds, a 32% smurf stomp rate, correct MMR in as few as 4 matches, alternate accounts to play with friends, and diminished RR for wide five-stacks (December 20, 2022)
