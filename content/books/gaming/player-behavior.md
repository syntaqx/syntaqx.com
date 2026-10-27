+++
title = "Player Behavior & Moderation"
description = "How games answer disruptive play: in-match reports, text and voice moderation, gameplay detection, penalty ladders, reform, UGC safety and the pipeline."
category = "Gaming Industry"
order = 1620
part = "Fair Play and Safety"
tags = ["gaming", "moderation", "player-behavior", "trust-and-safety", "voice", "chat"]
+++

[Anti-Cheat](/books/gaming/anti-cheat) deals with players who break the game. This chapter deals with players who break the experience for others without touching a line of code: the teammate who types slurs, the one who screams into voice, the one who walks into the enemy team on purpose because the match isn't going their way. In a competitive game those players are inside the product, on your team, for thirty minutes, and you can't leave without losing. That's what makes game moderation different from moderation anywhere else, and why the largest publishers report on it in public.

The general machinery (policies, report queues, detection bands, penalty ladders, notices, appeals, child-safety reporting, audit and transparency) is the same as in any product with users, and it lives in the playbook's [Trust & Safety](/docs/security/trust-and-safety) chapter. This chapter is about what games add: the match as the unit of evidence, real-time text and voice, behavior that only shows up in gameplay telemetry, penalties that restrict a queue rather than an account, players who are often children, the duties the EU's Digital Services Act and the UK's Online Safety Act add, and the pipeline and tables that tie them together. The chat and voice services that carry the messages are in [Parties, Presence, Chat & Voice](/books/gaming/social-systems); cheating, its cases and hardware bans are in [Anti-Cheat](/books/gaming/anti-cheat); appeals that arrive as tickets are in [Player Support](/books/gaming/player-support#behavior-tickets-and-ban-appeals).

## The Scale of the Problem

The publishers that report in public describe the same shape. Riot's "An Update on Player Dynamics" (August 29, 2022) said it averaged about 240 million reports a month across its games in 2021; about 120 million games had at least one text report, and about 13 million of them ended in a confirmed transgression. Xbox's 2025 transparency report counts 39 million player reports across its platform in a year, 9.6% of which led to restrictions ([Automation at Scale](#automation-at-scale)), and Call of Duty's text system blocked over 45 million messages in under a year ([Text Chat](#text-chat)).

Two findings shape everything below. First, reports are noisy: players report teammates for playing badly, and some reports are malicious, so most reports don't end in action and investigating every one forces automation. Second, most disruptive players aren't committed to it. Riot describes an industry pattern in which 95% of people who are disruptive are only disruptive sometimes, while about 5% are consistently disruptive, and fewer than 10% of the players it penalized in 2021 were penalized again that year. Other publishers report the same responsiveness: Activision says 80% of players issued a voice chat enforcement had not re-offended (July 2024), and Blizzard says Overwatch players who get a warning often "immediately correct their behavior." A system built for the 5% (ban fast, ask nothing) treats the 95% as enemies; a system built for the 95% (warn, explain, restrict) has to recognize the 5% and stop being patient with them.

For a studio with more than one game, split ownership along the channel: communication moderation (text, voice, names) is shared infrastructure, and gameplay moderation (AFK, feeding, griefing) is game logic, because its detection depends on each game's own rules and telemetry. Riot's post reports its numbers on exactly that line.

## What Players Do

Before building detection, name what you're detecting. The Fair Play Alliance and the ADL's Center for Technology and Society published the **Disruption and Harms in Online Gaming Framework** in December 2020, a catalogue of problematic in-game conduct organized on four axes: expression (what form it takes), delivery channel (where in and around the game it happens), impact (who is affected and how) and root cause (why it happens). It separates **disruptive behavior**, "conduct that does not align with the norms that a player and the community have set", from **harmful conduct**, a subset that "causes significant emotional, mental, or even physical harm". The FPA has since become the Thriving in Games Group, which hosts the framework and its companion guides on assessing a game's behavior landscape and planning and building a penalty and reporting system.

For engineering, the useful cut is by channel, because each channel has its own evidence and its own detection:

| Channel | Examples | Evidence | Detection |
| --- | --- | --- | --- |
| Text chat | Slurs, threats, harassment, spam, sharing personal information | The message log | Filters and text classifiers, before or after send |
| Voice | The same, spoken; screaming; sexual harassment | Audio, only if recorded | Speech models on recorded or live audio |
| Gameplay | Going AFK, intentional feeding or throwing, griefing teammates, leaving | Match telemetry | Game-specific rules and models |
| Names and profiles | Offensive usernames, clan tags, avatars | The profile | Filters at creation and change |
| User-generated content | Maps, items, experiences, images | The content | Filters, image and text models, review |
| Off-platform | Harassment on social media or streams | Usually none you hold | Reports and investigation only |

The table is also a priority list. Text is the cheapest to moderate and the most common. Gameplay disruption is the most game-specific and often the most hated by players, because it costs them the match. Voice is the hardest and, in shooters, often the worst.

## Reporting in the Match

The report button is the intake for everything the systems don't catch, and in games it has a timing problem: a report filed after the match ends describes something that happened twenty minutes ago, the reporter is already in a new queue, and the evidence is scattered across the match's chat log, its telemetry and maybe a voice recording.

- **Report from where it happens.** League of Legends added in-game reporting in 2023 so players can report "right when it happens", alongside end-of-game reporting. The report then carries the moment, not just the match.
- **Attach the match, not just the player.** A report names the reported account, the match, the channel and a category; the server fills in everything else (timestamps, the chat lines around the moment, the telemetry window) from its own records. Never trust evidence the reporting client uploads.
- **Categories per channel.** "Verbal abuse", "voice comms abuse", "AFK", "intentional feeding", "cheating", "offensive name". VALORANT's patch notes point players to a "Voice Comms Abuse" report category; a separate category for voice is what lets a voice report trigger the voice pipeline. Route "cheating" to [Anti-Cheat](/books/gaming/anti-cheat), not to the behavior queue.
- **Weigh the reports.** Three teammates reporting one player for the same thing in the same match is strong evidence; a premade group reporting the one player outside it is weaker; a player who reports someone every game is weaker still. There are two ways to encode that. One is per-reporter credibility: Riot's 2023 update describes "credibility models (using probabilistic math to determine disruptive behavior based on number of reports)" extended across report categories. It uses the most information, but it's opaque to players and can drift as reporters learn what gets upheld. The other is a pattern rule: count distinct, unrelated reporters across several matches and act only when they agree, which is simple to explain and hard for one group to abuse, but slower and blind to a single bad match. My default combines them: a premade group counts as one reporter, each reporter carries a weight learned from how often their past reports were upheld (starting neutral and moving slowly), and the weight sets priority for review, never a penalty on its own.
- **Tell the reporter.** A "your report led to action" message after the fact is the cheapest reinforcement you have for the people doing your detection for free. Blizzard treats it as part of the system: when a bug stopped some Overwatch players getting those notifications, it fixed it and said so publicly.

The core model's `reports` table in [The Games Business](/books/gaming/games-business#the-core-data-model) names the reporter's and reported player's profiles and a policy category; the general shape of reports, cases (`moderation_cases`) and decisions is the playbook's. Moderation adds the match, and where and when:

```sql
ALTER TABLE reports
  ADD COLUMN match_id             UUID REFERENCES matches (id),  -- null for profile and UGC reports
  ADD COLUMN channel              TEXT CHECK (channel IN ('text_chat', 'voice', 'gameplay', 'name', 'ugc')),
  ADD COLUMN reported_during      TEXT CHECK (reported_during IN ('in_match', 'post_match', 'profile')),
  ADD COLUMN match_offset_ms      INTEGER,
  ADD COLUMN reporter_is_teammate BOOLEAN,
  ADD COLUMN reporter_is_premade  BOOLEAN;
```

The `category` stays the policy category (harassment, hate speech, griefing) and `channel` says where it happened, so a voice harassment report and a text one share a rule but take different evidence paths. The labels players see map onto the pair: "verbal abuse" is harassment on `text_chat`, "voice comms abuse" harassment on `voice`, "AFK" and "intentional feeding" griefing on `gameplay`, "offensive name" `inappropriate_name` on `name`, and "cheating" is routed to anti-cheat as a signal rather than kept as a behavior report. The label is presentation and can change by game and locale; the category is policy. `match_offset_ms` pins the report to a point in the match, so the evidence fetch can pull the telemetry and chat around it. A platform that runs moderation for several games or studios scopes every row by `game_id` and tenant, as [Multi-Tenancy](/docs/architecture/multi-tenancy) describes.

## Text Chat

Text is where moderation got good first, and the published direction is the same everywhere: move from "punish after reports" to "stop it before it lands".

**Filter before send.** Riot's May 2023 behavioral systems update describes League's auto-mute: the system "automatically detects zero tolerance chat in-game", blocks the message before it's sent, mutes the sender and shows the action to all players. The same update says integrating the machine learning models of GATES (its "game agnostic text evaluation service") let Riot act on over 15 times the amount of disruptive text it acted on before. Call of Duty's October 10, 2024 progress report says its system "analyzes text chat traffic in near real-time" and had blocked over 45 million messages violating the Call of Duty Code of Conduct since November 2023, with text and username moderation in 20 languages for Black Ops 6 on day one.

**Evasion is the job.** Players route around filters with spacing, numbers for letters, look-alike Unicode characters and slang that changes every month. Commercial filters sell exactly this: Microsoft's Community Sift (formerly Two Hat, used across Xbox) lists "subversions, acronyms, l33T speak, emojis" among what it handles, and says it's fast enough to check messages before others see them. Normalize text before matching (Unicode normalization, confusable-character folding, stripping separators), and treat the evasion itself as a signal: a message that only matches after folding was written to evade.

**Let players control their own experience.** Mute, block, party-only chat and per-player chat filters cost little and remove the target's exposure instantly, whatever the system decides later. League's 2023 update lists party-only chat and self-mute and deafen commands next to its detection work.

**Fail closed for text you don't control.** On a user-generated-content platform the game's own chat is only part of the text surface. Roblox's creator documentation says in-experience chat is filtered automatically, but creators are "responsible for filtering any displayed text that you don't have explicit control over": text from input fields, randomly generated words, text from external servers and stored text such as pet names. The API is `TextService:FilterStringAsync`, which returns a result object that produces either a broadcast string for everyone (`GetNonChatStringForBroadcastAsync`) or a per-viewer string that accounts for that viewer's settings such as age (`GetNonChatStringForUserAsync`). The sample code wraps both in `pcall` and shows nothing if filtering fails, and Roblox removes experiences found not filtering until they fix it. Any game that displays player-written text (names, guild descriptions, map titles, signs) needs the same rule: filter on the server, per viewer when viewers differ, and never fall back to unfiltered text.

## Voice

Voice is the hardest channel to moderate: no text to match, no log unless you record, privacy law that treats recordings as personal data, and players who expect their voice not to be stored. The published designs show the options.

**Record on a short fuse and evaluate on report.** VALORANT's Riot Voice Evaluation (RVE) launched in the background in North America, in English, to train its models before report-driven evaluation began. The retention rules are the design worth copying: recordings are kept for 24 hours and deleted if no report comes in; if a report is received, the recording is kept for 7 days; if a penalty is applied, it's kept based on the length of the penalty for up to 2 years (up to 7 years in Brazil). The opt-out is turning off voice chat. Riot's privacy notice describes the machinery in general terms: "advanced automated (such as machine learning, transcription, and analysis) tools", manual review and verification of "some of the output produced by the automated methods", and appeals where a player can ask for an agent to make "a final manual determination". VALORANT patch notes 13.06 (September 22, 2026) expanded RVE to Spanish, Portuguese and Korean.

**Analyze live and surface events.** Call of Duty's voice moderation is "powered by ToxMod", Modulate's product, which by Modulate's own description "continuously analyzes live voice channels and produces real-time signals and events" and surfaces "high-confidence events for moderators with audio clips, timestamps, and behavioral context", integrating with the game's existing voice infrastructure and moderation workflow. Activision's October 2024 report says voice moderation runs globally excluding Asia in English, Spanish and Portuguese, with French and German added for Black Ops 6's launch. Its results, as published: a combined 67% reduction in repeat offenders of voice-chat offenses in Modern Warfare III and Warzone since an improved enforcement rolled out in June 2024; in July 2024, 80% of players issued a voice chat enforcement since launch had not re-offended; and exposure to disruptive voice chat down 43% since January 2024.

**Transcribe, then treat it as text.** Blizzard says that shortly after Overwatch 2 launched it "began using machine-learning algorithms to transcribe and identify disruptive voice chat in-game," expanding by region and language. Transcription moves voice into the text pipeline's filters and review tools, at the cost of everything a transcript loses (tone, screaming, who was talking over whom).

The designs differ in what triggers evaluation (a report or continuous analysis) and what is analyzed (audio or a transcript), and agree on the parts that matter for the system you build:

- **Recording is a retention decision first.** Decide the windows (unreported, reported, actioned) before writing code, put them in the privacy notice, and enforce them with deletion jobs ([Data Retention](/docs/architecture/data-retention#retention-windows)). Audio is personal data under GDPR; [AI Agents in the Product](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data) covers recordings and transcripts as data.
- **Models flag, people confirm severe outcomes.** Riot's and Activision's designs both put audio clips with context in front of a person for anything beyond the most clear-cut cases.
- **Voice runs on the voice infrastructure.** Evaluation needs per-speaker audio streams (or the ability to attribute speech to a speaker), which is a requirement on the voice provider and the [voice chat](/books/gaming/social-systems) design, not something to bolt on later.
- **Language coverage is a launch gate.** A voice system that understands English and not Portuguese moderates one community and not the other; all three publishers expand language by language.

## Gameplay Disruption

Nobody types anything when they walk into the enemy team to lose the game. Gameplay disruption is detected from [telemetry](/books/gaming/telemetry), and it's game-specific: what "feeding" looks like depends on the map, the role and the state of the match.

- **AFK and leaving** are the easy cases: no input for a period, or a disconnect without reconnecting. The hard part is fairness to players whose internet dropped, so penalties escalate with frequency rather than firing on one incident. Overwatch 2's published rules show the shape: in Quick Play and other unranked modes, leaving four of your last 20 games brings a 10-minute queue suspension, rising to 30 minutes, while Competitive starts at 15 minutes and escalates with each violation up to a suspension for the rest of the season.
- **Intentional feeding or throwing** is hard. Riot says detecting it is harder than AFK, because a player having a terrible game and a player losing on purpose produce similar stats. Riot's 2022 post says Wild Rift's machine learning system for intentional throwing caught just under 2,000 instances from March 2022 to the post's date. Signals come from movement (pathing straight into enemies), deaths relative to the player's own history, item sales, and chat in the same match that announces the intent.
- **Griefing** (blocking teammates, stealing objectives, wasting shared resources) is detected per game mechanic, usually from reports plus telemetry around the report's timestamp.

Gameplay penalties belong with the game's own systems: leaver penalties in [matchmaking](/books/gaming/matchmaking) (queue delays, loss of ranked points), and restrictions that keep a disruptive player out of the modes they disrupt. Riot's 2023 update described restricting Ranked play for players penalized by its systems until they play other queues.

## Penalties and Reform

The playbook's [penalty ladder](/docs/security/trust-and-safety#penalties-and-escalation-ladders) applies directly. Games add one rule: restrict the feature that was abused, inside the game, before restricting the account.

| Behavior | First response | Repeated | Severe or persistent |
| --- | --- | --- | --- |
| Toxic text | Warning with the chat lines quoted | Chat restriction, then longer chat restriction | Suspension, then permanent ban |
| Toxic voice | Warning | Voice chat restriction | Suspension, then permanent ban |
| AFK or leaving | Queue delay | Loss of ranked points, longer delays | Ranked restriction, suspension |
| Intentional feeding | Warning | Ranked restriction | Suspension, then permanent ban |
| Offensive name | Forced rename | Rename and restriction | Suspension |
| Zero tolerance (threats, sexual content involving minors, extremism) | Skip the ladder | | Permanent ban, reports to authorities where required |

Xbox's published ladder, quoted in the playbook, works this way across a platform, ending in a suspension of social features before the account; the game-specific addition is its enforcement strike system (introduced in 2023), which shows players the cumulative effect of their enforcements, the visible standing the reform rules below depend on.

**Reform is the point.** The repeat rates in [The Scale of the Problem](#the-scale-of-the-problem) all say the same thing: for most players, a clear, specific, prompt consequence works. Three properties make it work:

- **Specific.** Show the player what they said or did: the chat lines, the match, the rule. A penalty that says "for negative behavior" reads as arbitrary and gets argued with.
- **Prompt.** Riot's 2023 update lists shortening the time between the offense and the penalty as an improvement. A penalty a week later is about a match the player has forgotten.
- **Proportionate, with a path back.** Strikes that expire, and visible standing that improves with clean matches, give the 95% a reason to change. The 5% exhaust the ladder quickly anyway.

Penalties aren't the only lever. After Overwatch added endorsements (players commending each other) and a looking-for-group tool, Blizzard's analysts reported in July 2018 that competitive matches with abusive chat were down 26.4% in the Americas and 16.4% in Korea, as PCGamesN reported the figures. Rewarding good conduct is cheap to build and shares the standing record the ladder already keeps.

Bans also have an evasion problem. A permanently banned player who buys a new account in five minutes is back the same evening, so permanent bans attach to whatever is hard to replace: verified phone numbers, payment instruments, hardware identifiers where the platform permits them (hashed, with an end, as `device_bans` in [Anti-Cheat](/books/gaming/anti-cheat#enforcement-bans-hardware-bans-and-appeals) stores them), and linked platform identities that can't be relinked while the ban lasts ([Bans: Account, Identity, Hardware](/books/gaming/accounts-and-identity#bans-account-identity-hardware)).

## Automation at Scale

The Xbox Transparency Report for 2025 is the most complete public picture of a games moderation pipeline at platform scale, and its numbers close.

![A dimensional drawing of Xbox's 2025 moderation volumes in three lanes: proactive scanning of 14.8 billion items with 368 million found violating and split into manual and automated processing, 39 million player reports with 3.7 million actioned and 65% processed automatically, and 332,000 appeals split into 85,000 reinstated and 247,000 upheld.](/diagrams/gm-player-behavior-pipeline.svg "Proactive detection dwarfs player reports, automation processes almost all of it, and appeals reverse about a quarter of what they review.")

| Code | Item (Xbox platform, calendar 2025) | Value |
| --- | --- | --- |
| S1 | Content proactively scanned (text, usernames, images, other UGC) | 14.8B |
| D1 | Identified as harmful or violating, 2.5% of S1 | 368M |
| M2, A2 | Proactively scanned content processed manually, automatically | 12.8M, 355.1M |
| R1 | Player reports received | 39M |
| R2 | Reports leading to restrictions, 9.6% of R1 | 3.7M |
| M1, A1 | Reported content processed manually, automatically | 1.3M, 2.4M |
| P1 | Appeals (case reviews) | 332K |
| N1, N2 | Reinstated (26%), upheld (74%) | 85K, 247K |

Three things stand out. Proactive detection finds two orders of magnitude more than players report, so a system that only acts on reports is moderating a sliver of the problem. Automation does nearly all the processing (the report puts it at 65% of user reports and 97% of all reports), and Xbox frames it as reducing human exposure to sensitive content and freeing moderators for nuanced cases, with QA, moderator reviews, reporting tools and appeals as the safeguards. And a quarter of appealed enforcements were reversed, which is the rate to watch as automation grows. The report also says Xbox expanded its AI detection in 2025 from spam and advertising "to cover 11 more harmful topics", including hate speech, bullying and harassment, and cheating.

Studios that don't build detection in-house buy it. As their own pages describe them:

| Vendor | What it moderates | How it describes the approach |
| --- | --- | --- |
| Community Sift (Microsoft) | Text, images, videos, usernames, reports | AI plus human expertise; curated topics and "risk sliders"; escalation of hard cases to moderators; 22 "premium" languages |
| GGWP | Chat, voice, usernames, images, player reports, Discord | Modules for scanning content on arrival, behavior over time, automated decisions and escalation of serious risks |
| Hive | Images, video, text, audio | Classification across categories including NSFW, hate, violence and CSAM |
| ToxMod (Modulate) | Voice | Live analysis producing events with clips, timestamps and context for moderators |

Vendor claims about accuracy and automation rates are marketing until you measure them on your own traffic. My default: run a vendor in shadow mode against a labeled sample of your own reports for a few weeks before it's allowed to act ([Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely)), and keep the decision thresholds and the penalty ladder in your own system, so changing vendors changes a signal, not your policy. The same pattern at the scale of the largest user-generated platforms, with classifier scores ordering human queues and review outsourced across languages, is in [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#classifiers-as-prioritizers).

## User-Generated Content and Young Players

When players build the game, moderation covers what they build. Roblox, whose audience includes young children, shows what that takes at platform scale:

- **Content labels gate who can play.** Roblox's content maturity labels (Minimal, Mild, Moderate, Content May Vary, Restricted) decide access by age group: Minimal and Mild are open to its youngest age groups, Content May Vary is limited to age-checked users 16 and older, and Restricted to ID-verified users 18 and older. Unlabeled experiences are restricted for all players, and applying a Restricted label restarts servers to remove players who aren't verified.
- **Chat is gated by age.** Roblox's January 7, 2026 announcement made an age check (facial age estimation through its vendor Persona, or ID) required to chat, rolling out globally wherever chat is available. Users chat with their own and adjacent age groups by default; under-9s need parental consent; users 13 and older can add "Trusted Connections" with people they know; and ID verification is the appeal path for a wrong estimate. Roblox says images and video used for the estimate are deleted immediately after processing, and reports a mean absolute error of 1.4 years for users under 18.
- **Creators carry filtering duties** (the text filtering rules above), and experiences that don't meet them are removed until they do.

How content is reviewed before it ships, and how scripts and assets move through a pipeline with versions, is in [Content Pipelines and Review](/books/gaming/creator-economies#content-pipelines-and-review).

For any game with young players, default settings are moderation. The order the FTC announced against Epic Games in December 2022, as the FTC describes it, prohibits enabling voice and text communications for children and teens unless a parent (or, for teens, the teen or a parent) gives affirmative consent through a privacy setting. Ratings, parental controls and age in games are covered in [Ratings, Age & Children](/books/gaming/ratings-and-age), and the privacy law and age assurance design behind them in [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy). A game whose players publish what they build is also a user-generated platform, and inherits that industry's duties in full: the CSAM reporting duty, preservation and hash matching in [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty), and age checks keyed to features such as messages from strangers in [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform).

## Regulatory Duties

Two laws turn parts of this pipeline from good practice into duties: the EU's Digital Services Act and the UK's Online Safety Act. The general machinery (notices, statements of reasons, appeals, transparency reports) is in the playbook's [Trust & Safety](/docs/security/trust-and-safety#notices-and-statements-of-reasons), and the children's side of both laws in [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#the-uk-online-safety-act). This section covers where a game lands under them; how the Commission, Ofcom and other regulators enforce them (fines, information requests and their clocks) is in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#regulator-requests-and-their-clocks). Dates are as of October 2026, and none of it is legal advice.

### The Digital Services Act

The DSA has applied in full since February 17, 2024 (Article 93). Its duties stack by kind of service. A **hosting service** stores information "provided by, and at the request of, a recipient of the service"; an **online platform** is a hosting service that also "stores and disseminates information to the public," meaning to "a potentially unlimited number of third parties." Any game that stores chat, names, profiles or user-generated content is a hosting service; whether it is also an online platform depends on the feature:

| Duty | Article | Applies to | In a game |
| --- | --- | --- | --- |
| Notice and action | 16 | Every hosting service | Anyone, player or not, can flag illegal content (a chat line, a name, a map, a stored voice clip); notices are handled "timely, diligent, non-arbitrary and objective," and automated processing is disclosed |
| Statement of reasons | 17 | Every hosting service | Every removal or visibility restriction, partial or full suspension of the service (a chat or ranked restriction), account suspension or payment restriction, for illegal content or a terms breach |
| Transparency report | 15 | Every intermediary service, at least once a year; micro and small enterprises exempt | Orders, notices, own-initiative moderation, complaints, and the automated tools with their accuracy and error rates |
| Internal complaint handling | 20 | Online platforms; micro and small enterprises exempt (Article 19) | A free, electronic appeal for at least six months after the decision, decided under "appropriately qualified staff" and "not solely on the basis of automated means" |
| Transparency Database | 24(5) | Online platforms; micro and small enterprises exempt (Article 19) | Every Article 17 decision and statement of reasons, submitted "without undue delay" and without personal data |

The micro and small enterprise test is the EU's SME definition: fewer than 50 staff and turnover or balance sheet of at most €10 million for small, fewer than 10 and €2 million for micro, with a group's figures counted for a studio inside a larger publisher. The exemption covers Article 15 and the online platform duties; it never covers Articles 16 and 17. A three-person studio with match chat still needs a notice channel and a statement of reasons for every penalty.

Where a game sits on the platform line is decided feature by feature. Recital 14 puts interpersonal communication "between a finite number of persons determined by the sender" outside the definition, and treats a closed group as public only where people are "automatically registered or admitted" without "a human decision or selection of whom to grant access." Party chat and direct messages between friends are close to messaging. Published user-generated content that any player can browse is the clear platform case. Match and lobby chat sits in between: the participants are few, but the sender didn't choose them and matchmaking admitted them automatically. The law hasn't settled that case, so my default is to treat matchmade chat, public lobbies and published UGC as platform features, and friends' messages and party chat as interpersonal.

What the DSA changes in the system:

- **Reports split into notices and reports.** An in-game report of griefing or feeding is a terms report; a report of a threat, of child sexual abuse material or of a hateful map is also an Article 16 notice of illegal content. Keep both in `reports`, mark which is which (the delta in [How to Build It](#how-to-build-it)), and give people who aren't players (a parent who saw a map, a rights holder) a web form, because Article 16 is open to any individual or entity.
- **Every penalty carries a statement of reasons.** The in-client notice from the [penalty pipeline](#penalties-and-reform) becomes the statement when it carries Article 17(3)'s contents: the restriction with its territorial scope and duration, the facts relied on and whether a notice prompted it, the use of automated means, the legal or contractual ground, and the routes to redress. Auto-mute and before-send filtering are decisions too: record each block, and decide with counsel at which level a statement is owed.
- **The decision record is the source.** The penalty's `decision_id` points at the playbook's `moderation_decisions` row, which already records whether detection and decision were automated; the DSA adds the ground, the territorial scope and the database submission, below. The statement, the Transparency Database entry, the appeal and the Article 15 counts are all queries over that row. The database held more than 4.5 billion statements submitted in the last 180 days as of October 26, 2026, so submission is a batch pipeline with retries, not a manual step.
- **Appeals cover cheating too.** An account suspension for cheating is a decision on terms grounds like any other, so the [anti-cheat appeal](/books/gaming/anti-cheat#enforcement-bans-hardware-bans-and-appeals) meets Article 20's six-month window and human oversight in the same flow.

### The Online Safety Act

The UK's Online Safety Act applies to services where users "interact with each other," which covers match chat, voice and UGC ([the scope and penalties](/docs/compliance/childrens-privacy#the-uk-online-safety-act)). Its duties arrived in stages:

- **Illegal harms.** Providers had to complete an illegal harms risk assessment by March 16, 2025, and the illegal content duties have been enforceable since March 17, 2025. Ofcom's codes include default settings for child users: profiles, locations and connections hidden from other users, no direct messages from non-connected accounts, and children left off lists of people others might add.
- **Children.** Services had until April 16, 2025 to carry out a children's access assessment and until July 24, 2025 to complete a children's risk assessment; the protection of children duties have applied since July 25, 2025, with "highly effective" age assurance required to keep children from the most harmful content.

The game twist is in where those defaults bite. "Players you recently played with" and "suggested friends" are suggested-connection lists; a whisper from a stranger met in matchmaking is a direct message from a non-connected account; a map browser is a feed. The risk assessments are also a per-feature exercise, and the feature list is the one [Ratings, Age & Children](/books/gaming/ratings-and-age#age-and-features) already keys by age band (text chat with strangers and friends, voice, UGC, friend requests, public profiles), so assess the features in that table and keep the assessment's version with the rule version that implements it.

## How to Build It

The pipeline has four latencies, and each needs its own path:

1. **Before send (milliseconds).** Text filtering and auto-mute run inline in the chat service, on the message path, with a strict latency budget and a fail-closed default for zero-tolerance categories. Name and profile filtering runs at creation and change.
2. **During the match (seconds).** Live voice analysis and in-match report signals can warn or mute a player before the match ends. Keep these actions reversible and content-level: a mute, not a ban.
3. **After the match (minutes).** Report evaluation runs when the match ends and its telemetry and chat are complete: fetch evidence around each report's offset, score it, group reports into a case, decide by band, issue the penalty, notify both sides. This is where most penalties come from, and where "prompt" is measured.
4. **Over time (days).** Behavior models look across matches for patterns no single match shows: the player who's borderline every game, the group that reports one person in every match, ban evasion.

The pieces, in the order a message travels:

- **Chat and voice services** emit every message and voice-session event as an [event](/docs/architecture/events), with match ID and offset, to a moderation stream. Text is kept per your retention policy; audio only within the recording windows.
- **The detection service** consumes the stream, calls filters, models and vendors, and writes scores, not penalties.
- **The case service** groups reports and scores into the playbook's `moderation_cases`, one per account and policy category while open, sets priority and routes to automation or a human queue. Cheating reports never land here; they become signals on an anti-cheat case.
- **The penalty service** applies the ladder, writes to the core model's `penalties` table (a `feature_restriction` with `restricted_feature` set to `text_chat`, `voice_chat`, `queue` or `ranked` covers the game's restrictions, and `ladder_step` the ladder position), and publishes `penalty.issued` and `penalty.ended` events.
- **Enforcement points** (chat, voice, matchmaking, ranked queue, login) check active penalties. Matchmaking checks at queue time, chat at send time, and both cache with invalidation on penalty events, so a penalty takes effect in the next match, not the next day.
- **The player-facing surface**: an in-client notice with the evidence and the rule, a standing page, the appeal path, and "your report led to action" messages to reporters.

```sql
ALTER TABLE penalties
  ADD COLUMN source_match_id     UUID REFERENCES matches (id),
  ADD COLUMN evidence_excerpt    TEXT,
  ADD COLUMN is_shown_to_player  BOOLEAN NOT NULL DEFAULT TRUE;
```

The core table already carries the ladder step, and the policy version sits on the decision, so moderation adds only the match and what the player is shown. Separate `text_chat` and `voice_chat` values for `restricted_feature` let a chat restriction take voice and leave text, or the reverse. The penalty's `evidence_excerpt` is what the in-client notice shows (the chat lines, the rule), copied at decision time so a later retention deletion of the chat log doesn't empty the notice the player is reading. Every decision, automated or human, is recorded as the playbook's [moderation decision](/docs/security/trust-and-safety#auditing-moderation-decisions) with the model version, threshold and policy version. Behavior appeals and ban questions arrive through [Player Support](/books/gaming/player-support); route them to the moderation appeal flow rather than letting general support agents reverse penalties.

The [regulatory duties](#regulatory-duties) add a notice path for people who aren't players and the DSA fields on the decision record:

```sql
ALTER TABLE reports
  ALTER COLUMN reporter_profile_id DROP NOT NULL,          -- a notice from someone who isn't a player
  ADD COLUMN is_illegal_content_notice BOOLEAN NOT NULL DEFAULT FALSE,  -- DSA Article 16
  ADD COLUMN notifier_contact          TEXT,              -- name and email from a web notice
  ADD CONSTRAINT reports_has_reporter
    CHECK (reporter_profile_id IS NOT NULL OR notifier_contact IS NOT NULL);

ALTER TABLE moderation_decisions
  ADD COLUMN ground             TEXT CHECK (ground IN ('illegal_content', 'terms')),
  ADD COLUMN ground_reference   TEXT,                       -- the law, or the terms clause, relied on
  ADD COLUMN territorial_scope  TEXT[] NOT NULL DEFAULT '{}',  -- country codes; empty: everywhere
  ADD COLUMN prompted_by_notice BOOLEAN,
  ADD COLUMN statement_sent_at  TIMESTAMPTZ,                -- the Article 17 statement reached the player
  ADD COLUMN transparency_db_id TEXT;                       -- set once submitted under Article 24(5)
```

A decision with a penalty and no `statement_sent_at` is a defect to alert on, and on a platform feature so is one still without a `transparency_db_id` after the submission batch has run. Appeals already work as the playbook describes them, a new decision that reviews the old one, so Article 20's "reverse its decision" is a `reversed` outcome that revokes the penalty.

## What This Means for the System You Build

- **The playbook's trust and safety system,** with one category enum, cases, bands, ladders, notices, appeals and audit, extended for matches and channels.
- **In-match reporting** that pins a report to a match and an offset, with server-side evidence, per-channel categories, reporter credibility and feedback to reporters.
- **Text filtering before send** with normalization against evasion, auto-mute for zero-tolerance categories, player-side mute and block, and server-side, fail-closed filtering of all player-written text.
- **Voice moderation designed from retention outward:** recording windows, deletion jobs, per-speaker audio, human confirmation of severe outcomes, and language coverage as a launch gate.
- **Gameplay detection owned by the game team,** from telemetry, with frequency-based leaver penalties and queue restrictions in matchmaking.
- **Ladders that restrict the abused feature first,** show the evidence, act promptly, let strikes expire and make permanent bans hard to evade.
- **Four pipeline latencies** (before send, in match, after match, over time) with penalties enforced at chat, voice, matchmaking and login through events.
- **Vendors behind your own thresholds,** proven in shadow mode on your own data.
- **Age-aware defaults** for chat and content, with labels and age assurance where young players are present.
- **Regulatory duties as queries:** DSA notices open to non-players, a statement of reasons for every penalty, database submissions and Article 20 appeals for platform features, and Online Safety Act risk assessments per feature, all built from the decision record.

## References

**Specifications**

- [Roblox Creator Docs: Text filtering](https://create.roblox.com/docs/ui/text-filtering), creators' filtering duty, cases that need filtering, the TextService API, failing closed and removal of experiences that don't filter
- [Roblox Creator Docs: Content maturity labels](https://create.roblox.com/docs/production/promotion/content-maturity), labels, access by age group and restrictions on unlabeled experiences
- [EUR-Lex: Regulation (EU) 2022/2065, the Digital Services Act](https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng), the official text of the regulation; the article pages below reproduce it
- [Digital Services Act, Article 3](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_3.html), definitions of hosting service, online platform and dissemination to the public
- [Digital Services Act, Recitals 11 to 20](https://www.eu-digital-services-act.com/Digital_Services_Act_Preamble_11_to_20.html), Recital 14 on interpersonal communication and closed groups
- [Digital Services Act, Article 15](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_15.html), yearly transparency reports and the micro and small enterprise exemption
- [Digital Services Act, Article 16](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_16.html), notice and action for hosting services
- [Digital Services Act, Article 17](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_17.html), the restrictions that need a statement of reasons and its contents
- [Digital Services Act, Article 19](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_19.html), the online platform duties micro and small enterprises are exempt from
- [Digital Services Act, Article 20](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_20.html), internal complaint handling, six months, reversal and human oversight
- [Digital Services Act, Article 24](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_24.html), submitting statements of reasons to the Commission's database without personal data
- [Digital Services Act, Article 93](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_93.html), application from February 17, 2024

**Reference**

- [ADL: Disruption and Harms in Online Gaming Framework](https://www.adl.org/resources/report/disruption-and-harms-online-gaming-framework), the four axes and the definitions of disruptive behavior and harmful conduct
- [Thriving in Games Group: Disruption and Harms in Gaming Framework](https://thrivingingames.org/disruption-and-harms-in-gaming-framework/), the framework by the Fair Play Alliance and ADL and its companion guides
- [FTC: Epic Games to pay more than half a billion dollars](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations), the order's voice and text defaults for children and teens
- [European Commission: SME definition](https://single-market-economy.ec.europa.eu/smes/sme-fundamentals/sme-definition_en), staff, turnover and balance sheet ceilings for micro and small enterprises, and group figures
- [European Commission: DSA Transparency Database](https://transparency.dsa.ec.europa.eu/), statements of reasons submitted in the last 180 days
- [GOV.UK: Online Safety Act explainer](https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer), illegal content duties enforceable from March 17, 2025, the children's access and risk assessment deadlines
- [GOV.UK: What's changing for children on social media from 25 July 2025](https://www.gov.uk/government/news/whats-changing-for-children-on-social-media-from-25-july-2025), the protection of children duties and age checks from July 25, 2025
- [Lewis Silkin: Ofcom publishes final illegal harms codes](https://www.lewissilkin.com/en/insights/2024/12/16/ofcom-publishes-final-illegal-harms-codes-102jrep), the March 16, 2025 risk assessment deadline and the default settings for child users (December 2024)

**In practice**

- [Riot Games: An Update on Player Dynamics](https://www.riotgames.com/en/news/an-update-on-player-dynamics), 2021 report and transgression volumes, the 95/5 pattern, repeat-penalty rate, team split and Wild Rift throwing detection
- [Overwatch: Defense Matrix, Driving Positivity in Overwatch](https://overwatch.blizzard.com/en-us/news/23934873/), machine-learning transcription of voice chat, players correcting behavior after a warning, and report-outcome notifications
- [Overwatch: Defense Matrix, Deterring Leavers in Overwatch 2](https://overwatch.blizzard.com/en-us/news/24009615), leaver suspensions by frequency over the last 20 games and Competitive escalation to a season suspension
- [PCGamesN: Overwatch toxicity has gone way down since endorsements were added](https://www.pcgamesn.com/overwatch/overwatch-toxicity), Blizzard's figures for abusive chat after endorsements and looking-for-group (July 2018)
- [League of Legends: /dev: Behavioral Systems Update](https://www.leagueoflegends.com/en-gb/news/dev/dev-behavioral-systems-update-may-2023/), auto-mute, GATES, in-game reporting, credibility models, faster penalties and Ranked restrictions
- [VALORANT: Voice Evaluation Update](https://playvalorant.com/en-us/news/announcements/valorant-voice-evaluation-update/), background launch, retention windows and opt-out
- [VALORANT: Patch Notes 13.06](https://playvalorant.com/en-gb/news/game-updates/valorant-patch-notes-13-06/), RVE expansion to Spanish, Portuguese and Korean and the Voice Comms Abuse category
- [Riot Games: Privacy Notice](https://www.riotgames.com/en/privacy-notice), automated chat analysis, manual verification, severity patterns, manual appeal decisions and voice retention
- [Xbox Transparency Report 2025](https://cms-assets.xboxservices.com/assets/8b/d9/8bd9775f-8742-4f12-ae2f-b296307316e7.pdf?n=2834905.pdf), proactive and reactive volumes, automation, AI expansion, enforcement ladder and appeals
- [Call of Duty: Anti-Toxicity Progress Report, October 2024](https://www.callofduty.com/blog/2024/10/call-of-duty-anti-toxicity-progress-report-black-ops-6-moderation-results), text blocking, ToxMod voice moderation, languages and reoffense and exposure results
- [Modulate: ToxMod](https://www.modulate.ai/tox-mod), live voice analysis and events for moderators
- [Microsoft: Community Sift](https://developer.microsoft.com/en-us/games/products/community-sift/), text, image, video and username classification and evasion handling
- [GGWP](https://www.ggwp.com/), chat, voice, username, image and report moderation modules
- [Hive](https://thehive.ai/), visual, text and audio moderation categories
- [Roblox: Age checks required to chat](https://about.roblox.com/newsroom/2026/01/roblox-age-checks-required-to-chat), facial age estimation, age-group chat rules, Trusted Connections and appeals by ID
