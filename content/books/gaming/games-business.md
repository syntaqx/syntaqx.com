+++
title = "The Games Business"
description = "How games make money and get made: business models, the 2025 market, platforms, studios and publishers, the volume map and the core data model."
category = "Gaming Industry"
order = 1601
part = "How Games Get Made"
tags = ["gaming", "business-models", "live-service", "data-model", "platforms"]
+++

A game company sells time spent in a simulation. Sometimes the player pays once at the door, sometimes nothing at the door and a little at a time for years, sometimes a monthly fee for a library, and sometimes an advertiser pays for thirty seconds of the player's attention. Behind every one of those deals is the same machinery: a program that has to produce a frame every 16.67 milliseconds (at 60 frames per second) on hardware the studio doesn't control, a fleet of servers that keeps thousands of matches fair at once, a store and an inventory that must never lose a purchase, and a community that has to be kept safe while it plays. A single-player game on a cartridge needs only the first piece. A competitive online game needs all of them, and needs them for as long as anyone still plays.

The software is hard because those pieces interact under real-time pressure: a patch changes the client, the server and the store at the same minute; a ban touches the account, the match history and the purchases a player might want refunded; an engine migration has to leave every skin a player bought exactly where it was. This chapter is the map the rest of the volume uses: how games make money, how big the market is, the platforms, who builds and publishes games, how games are funded and the deals behind them, a game's life from prototype to sunset, and the data model every later chapter extends. Terms are collected in the [Gaming Glossary](/books/gaming/glossary).

## How to Read This Volume

The chapters follow a game from its first build to its years of live operation, in eight parts plus a reference:

- **How Games Get Made.** This chapter, then [The Engine Landscape](/books/gaming/engine-landscape) (Unreal, Unity, Godot, the rest, and how studios choose), [Building Your Own Engine](/books/gaming/building-an-engine) (the core loop, the frame budget, timesteps, entities, determinism) and [Production Pipelines & Builds](/books/gaming/production-pipelines) (source control for binaries, cooking, build farms, crash reporting, certification).
- **Clients and Delivery.** [Game Clients & Launchers](/books/gaming/game-clients), [Patching & Content Delivery](/books/gaming/patching) and [Mobile Games](/books/gaming/mobile-games) (device tiers, OS lifecycle, store review, attribution, ads and payback).
- **Multiplayer.** [Netcode Fundamentals](/books/gaming/netcode), [Game Servers & Hosting](/books/gaming/game-servers), [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback), [Matchmaking & Ranked](/books/gaming/matchmaking) and [Parties, Presence, Chat & Voice](/books/gaming/social-systems).
- **Backend and Live Services.** [Game Backend Architecture](/books/gaming/game-backend), [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity), [Saves, Progression & Player Data](/books/gaming/saves-and-player-data) (where progress lives, conflicts, access and erasure, account deletion), [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements), [Live Operations](/books/gaming/live-operations) and [Telemetry & Analytics](/books/gaming/telemetry).
- **Fair Play and Safety.** [Anti-Cheat](/books/gaming/anti-cheat), [Player Behavior & Moderation](/books/gaming/player-behavior) and [Player Support](/books/gaming/player-support).
- **Money.** [Monetization Models](/books/gaming/monetization), [Stores, Fees & Payments](/books/gaming/stores-and-payments) and [UGC & Creator Economies](/books/gaming/creator-economies) (creator payouts, affiliate codes and Drops, sandboxed scripts, takedowns).
- **The Rules.** [Ratings, Age & Children](/books/gaming/ratings-and-age), [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes) and [Accessibility](/books/gaming/accessibility).
- **Running the Platform.** [Game Metrics](/books/gaming/game-metrics), [AI in Games](/books/gaming/ai-in-games) and [Esports & Spectating](/books/gaming/esports-and-spectating).
- **Reference.** The [Gaming Glossary](/books/gaming/glossary).

The volume covers what games add. The general engineering lives in the playbook, and chapters here link to it rather than repeat it: [Multi-Tenancy](/docs/architecture/multi-tenancy), [Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Background Jobs](/docs/architecture/background-jobs), [Data Pipelines & Analytics](/docs/architecture/data-pipelines), [Rules as Data](/docs/architecture/rules-as-data), [Audit Trails](/docs/architecture/audit-trails), [Notifications & Consent](/docs/architecture/notifications), [Matching, Merging & Many Sources](/docs/architecture/record-linkage), [AI Agents in the Product](/docs/architecture/ai-agents), [Time & Date Formats](/docs/fundamentals/time), [Effective Dating & History](/docs/database/temporal-data), [Money](/docs/payments/money), [Idempotency](/docs/payments/idempotency), [Subscriptions & Recurring Billing](/docs/payments/subscriptions), [Sales Tax & VAT](/docs/payments/sales-tax), [GDPR](/docs/compliance/gdpr), [Authentication](/docs/security/authentication), [Identity Providers](/docs/security/identity-providers), [Support Access & Internal Tools](/docs/security/support-access), [AI Security](/docs/security/ai-security) and [Webhooks](/docs/api-design/webhooks). Taking card payments directly, for a web store, is its own volume, [Payments](/books/payments/card-payments).

## The System You're Building

Read end to end, the volume describes the components of a game and the platform that runs it. Each has a chapter:

| Component | What it does | Where |
| --- | --- | --- |
| Core model | Accounts, profiles, games, builds, ownership, matches, conduct | This chapter |
| Engine and runtime | The loop, rendering, simulation, the editor | [The Engine Landscape](/books/gaming/engine-landscape), [Building Your Own Engine](/books/gaming/building-an-engine) |
| Production | Source control, cooking, build farms, tests, crashes, certification | [Production Pipelines & Builds](/books/gaming/production-pipelines) |
| Client and delivery | Launcher, front-end client, patcher, CDN, the mobile client | [Game Clients & Launchers](/books/gaming/game-clients), [Patching & Content Delivery](/books/gaming/patching), [Mobile Games](/books/gaming/mobile-games) |
| Netcode | Prediction, reconciliation, lag compensation, tick rate | [Netcode Fundamentals](/books/gaming/netcode), [Lockstep, Rollback & Determinism](/books/gaming/determinism-and-rollback) |
| Server fleet | Allocating, hosting and draining game servers | [Game Servers & Hosting](/books/gaming/game-servers) |
| Matchmaking and social | Queues, ratings, parties, presence, chat, voice | [Matchmaking & Ranked](/books/gaming/matchmaking), [Parties, Presence, Chat & Voice](/books/gaming/social-systems) |
| Platform services | Backend architecture, accounts, linked platforms, saves and player data | [Game Backend Architecture](/books/gaming/game-backend), [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity), [Saves, Progression & Player Data](/books/gaming/saves-and-player-data) |
| Ownership and economy | Entitlements, inventories, wallets, ledgers | [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements) |
| Live operations | Patches, events, configuration, experiments | [Live Operations](/books/gaming/live-operations), [Telemetry & Analytics](/books/gaming/telemetry) |
| Fair play | Cheat detection, reports, penalties, appeals, support | [Anti-Cheat](/books/gaming/anti-cheat), [Player Behavior & Moderation](/books/gaming/player-behavior), [Player Support](/books/gaming/player-support) |
| Money | What is sold, through which store, at what fee; what creators earn | [Monetization Models](/books/gaming/monetization), [Stores, Fees & Payments](/books/gaming/stores-and-payments), [UGC & Creator Economies](/books/gaming/creator-economies) |
| The rules | Age ratings, children, randomized purchases, accessibility | [Ratings, Age & Children](/books/gaming/ratings-and-age), [Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes), [Accessibility](/books/gaming/accessibility) |
| Running it | The numbers, AI, competitive play and broadcast | [Game Metrics](/books/gaming/game-metrics), [AI in Games](/books/gaming/ai-in-games), [Esports & Spectating](/books/gaming/esports-and-spectating) |

## Five Ways Games Make Money

Most games run one dominant model and borrow from a second. The model decides which systems a game needs on day one, and which it can ignore.

| Model | The player pays | What the platform must hold | Typical games |
| --- | --- | --- | --- |
| **Premium** | Once, up front, plus optional DLC and expansions | Ownership of the game and each add-on | Story games, most console and PC releases |
| **Free-to-play** | Nothing to start; buys items, currency and passes | Entitlements, wallets, a catalog, offers, receipts | Competitive online games, most mobile games |
| **Live service** | Either of the above, for years | Everything above, plus seasons, events and configuration that change without a client patch | Shooters, MOBAs, MMOs, sports titles |
| **Subscription** | Monthly, for one game or a library | Entitlements bounded in time, renewal and lapse | MMOs, Game Pass, PlayStation Plus |
| **Advertising** | With attention; the advertiser pays | Ad placements, consent, rewards granted per view | Casual and hyper-casual mobile games |

**Premium** is the oldest model and still the default for story-driven console and PC releases: the player buys a copy, and later buys downloadable content. The ESRB's In-Game Purchases notice lists what can follow the box price: bonus levels, skins, subscriptions, season passes and upgrades such as removing ads. In Newzoo's estimate for 2025 (reported by GameDev Reports), game sales grew 25% on PC and 8.1% on consoles. For the platform, premium is the easy case: one durable entitlement per product, granted by a store, and a save file.

**Free-to-play** removes the price of entry and earns from a minority of players who spend. Apple's in-app purchase types are a good vocabulary for what gets sold: consumable, non-consumable, auto-renewable subscription and non-renewing subscription. A skin is non-consumable; a pack of currency is consumable. Everything sold this way is a record the studio must keep forever, so free-to-play is where the ownership and economy systems in this volume become mandatory, and where randomized purchases bring regulators in ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes)).

**Live service** is an operating model rather than a price: the game is a service that keeps changing after launch. Riot described League of Legends as shipping "a new patch every two weeks" in 2016. The model works because players stay a long time: according to Newzoo (via GameDev Reports), 64% of all PC gaming time in 2025 was spent in games released before 2019. A live game needs the whole backend in this volume, because content, prices, events and balance all change on a schedule ([Live Operations](/books/gaming/live-operations)).

**Subscription** comes in two forms. A single game can charge a monthly fee, as MMOs traditionally do; or a platform sells a library. Xbox Game Pass lists four tiers as of October 2026: Essential (50+ games), Premium (200+), Ultimate (500+) and PC Game Pass (300+ on PC). Newzoo reports that subscription revenue (PlayStation Plus, Xbox Game Pass) grew 10.2% in 2025. For the platform, a subscription is an entitlement with an end date that renews or lapses ([Subscriptions & Recurring Billing](/docs/payments/subscriptions)).

**Advertising** pays for most casual mobile games. Rewarded ads trade play for attention: Google's AdMob describes them as letting you "reward users with in-app items for interacting with video ads, playable ads, and surveys." The grant is a ledger entry like any other, with the ad view as its source, and the consent and children's rules that govern ad targeting apply in full ([Ratings, Age & Children](/books/gaming/ratings-and-age)).

[Monetization Models](/books/gaming/monetization) covers the design of each (battle passes, offers, pricing), and [Stores, Fees & Payments](/books/gaming/stores-and-payments) covers what each store takes.

## How Big It Is

Two public sources set the scale. Newzoo's market model is the most cited global estimate; its own site is gated, so the figures below come from GameDev Reports' summary of Newzoo's 2026 update, published June 26, 2026. The Entertainment Software Association's 2026 Essential Facts covers the United States.

![A dimensioned plan view of two horizontal bars at one scale, 2.8 pixels per billion dollars. The upper bar is the 2025 global games market split into mobile 113.3, console 44.7 and PC 43.6, chained to a highlighted overall dimension G1 of 201.6, with a dashed envelope for Newzoo's 2028 forecast of 234.4. The lower bar is 2025 United States consumer spending: content 52.3, hardware 5.4 and accessories 2.95, summing to 60.65. A variable table defines every code and notes cite the sources.](/diagrams/gm-games-business-market.svg "Mobile is more than half of the global market, and in the United States almost all spending is on content rather than hardware: the platform that sells and tracks that content is most of the business.")

What the numbers say for the systems in this volume:

- **The global market was $201.6 billion in 2025,** up 9.1%, the first time Newzoo's estimate passed $200 billion. Mobile was $113.3 billion (+10.7%), console $44.7 billion (+2.8%) and PC $43.6 billion (+12%, which Newzoo calls the highest PC growth rate in its records). Newzoo forecasts a 5.1% compound annual growth rate to $234.4 billion in 2028.
- **Microtransactions are concentrated.** PC microtransaction revenue grew 9.1% while console microtransaction revenue fell 4.6%, which Newzoo attributes to a few large titles underperforming: when a handful of games carry a segment's spending, their economies are that segment's economy.
- **In the United States, 212.3 million people play every week,** and consumers spent $60.7 billion on games in 2025: $52.3 billion on content, $5.4 billion on hardware and $2.95 billion on accessories (ESA). The ESA's separate economic impact report counts more than 250,000 jobs and $95.8 billion in total economic impact.

Forecasts get revised in both directions, so I date every market figure and cite the edition. These numbers are as of October 2026.

## Platforms

A game reaches players through a platform, and each platform brings four things the backend has to integrate with: an identity (a Steam ID, a PlayStation Network account, an Xbox gamertag), a store that sells and refunds, a certification process the build must pass, and rules about what the game may sell and how.

- **PC.** Storefronts include Steam, the Epic Games Store, the Microsoft Store and publishers' own launchers. PC is the most open platform: a studio can sell directly from its own site and patch on its own schedule. Its costs are the hardware range (every GPU and driver) and cheating, because the player controls the machine ([Anti-Cheat](/books/gaming/anti-cheat)).
- **Console.** PlayStation, Xbox and Nintendo Switch, now two generations of it: Nintendo Switch 2 launched on June 5, 2025, and Nintendo's results put it at 23.68 million units sold through June 30, 2026, against 156.59 million for the original Switch, which is still the larger installed base a game ships to. The platform holder approves the developer, certifies each build against its requirements and owns the store, the identity and the party and voice systems. Microsoft publishes the Xbox Requirements; Sony's and Nintendo's checklists are under NDA ([Production Pipelines & Builds](/books/gaming/production-pipelines)).
- **Mobile.** Apple's App Store and Google Play. The store's billing and review rules shape the product: currencies and items sold inside the game generally go through the store's in-app purchase system, and both stores require the odds of randomized items to be disclosed before purchase. Court orders and the EU's Digital Markets Act have changed what developers may link to outside the app, region by region, in 2025 and 2026 ([Stores, Fees & Payments](/books/gaming/stores-and-payments)). Device tiers, the OS lifecycle, attribution and the ad business are in [Mobile Games](/books/gaming/mobile-games).
- **Web and mini-game platforms.** Browser games reach players with no install, through portals and through apps that host mini games, and the portals publish their terms. Poki's default exclusive deal runs five years across the open web, Discord and YouTube Playables, pays a revenue share on the players Poki brings and leaves the developer everything from players who arrive directly; CrazyGames earns mainly through an ad revenue share, allows only ads served through its SDK and caps a game's initial download at 50 MB (both as of October 2026). Mini games inside apps such as WeChat are web games too: Apple's Mini Apps Partner Program, announced November 13, 2025, charges 15% on qualifying in-app purchases in mini apps built with web technologies, and Tencent's WeChat mini games were reported as joining it the same week. Discord Activities are web apps that run in an iframe inside Discord on desktop, mobile and web. Each channel is another identity and another payment path to reconcile.
- **Cloud streaming.** The game runs in a data center and the player receives video, so nothing is installed and the device only has to decode a stream; the cost is input latency, because every input travels to the server and back. Rights are licensed per service: GeForce NOW streams copies the player owns on stores such as Steam, the Epic Games Store, Ubisoft Connect and Xbox, and its Steam install-to-play titles need the publisher to opt in to Steam Cloud Gaming. Xbox Cloud Gaming streams the Game Pass catalog and, since November 2024, select games Game Pass Ultimate members own outside it. For the backend, a cloud session is the same build and the same entitlement check, running on hardware and in a region the streaming service chooses.
- **Subscription libraries.** Game Pass, PlayStation Plus and Apple Arcade sell access to a catalog rather than copies ([Five Ways Games Make Money](#five-ways-games-make-money)). The studio is paid under a deal with the platform holder, not per purchase ([Funding and Deals](#funding-and-deals)), and the player's access is an entitlement that ends when the subscription does.
- **VR and XR.** Meta Quest through the Meta Horizon Store, PC headsets through SteamVR, PlayStation VR2 and Apple Vision Pro. Meta requires every app to carry one of three comfort ratings (Comfortable, Moderate or Intense) and reviews it against its Virtual Reality Checks, asking for submission at least two weeks before launch; Apple asks visionOS apps with quick turns or sudden camera changes to declare motion information in App Store Connect, and to call themselves spatial computing apps rather than VR. Since August 7, 2024, PS VR2 has played SteamVR games on PC through Sony's adapter, without eye tracking, HDR, headset feedback or adaptive triggers, so one headset can arrive through two stores with different features. The comfort rating and the input and device features a build needs are catalog data, like an age rating; the comfort options behind it are in [VR Comfort](/books/gaming/accessibility#vr-comfort).

The consequence for the data model: one player can arrive from several platforms, and a cross-platform game has to link those identities to one account without letting a link become a takeover ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity)). Purchases made on one platform may or may not be usable on another, and that is a platform rule, not a technical one.

## Who Makes a Game

The industry runs on a handful of roles that one company may combine or several companies may split:

- **The developer** (the studio) builds the game. A studio may own its games, or build them under contract.
- **The publisher** funds, markets and distributes. Publishing deals typically trade funding for a share of revenue; a self-publishing studio does both jobs. Large publishers own many studios and run shared services (accounts, stores, anti-cheat, player support) that all their games use, which is why the model below puts accounts above games.
- **The platform holder** runs the hardware or store: Sony, Microsoft, Nintendo, Valve, Epic, Apple, Google. It sets certification, fees and identity.
- **Middleware and engine vendors** sell the parts: Epic and Unity license engines; others sell physics, audio, voice, anti-cheat, crash reporting and server hosting ([The Engine Landscape](/books/gaming/engine-landscape)).
- **Service partners** do work on contract: external art, porting, localization, quality assurance, co-development and player support.

These relationships decide where data lives. A publisher with ten games wants one account per player across all of them; a studio publishing on four platforms needs four sets of store receipts reconciled into one view of what a player owns; a work-for-hire studio must hand the publisher its data and keep none.

## Funding and Deals

A game is usually paid for before it earns anything, and the deal that pays for it decides who gets which share of every sale for years. The contracts are private, but survey data, published platform programs, court filings and grant rules show their shapes.

**Publisher advances and recoupment.** A publisher funds development with an advance, then takes it back out of the game's revenue before the developer earns a royalty. Before recoupment the publisher takes the larger share (a law firm's guide gives 70% as an example); after it, the split moves toward even or toward the developer. Voyer Law's analysis of over 100 developer-publisher agreements from 2017 to 2025, as summarized by GameDev Reports in May 2025, puts numbers on the shape: the median advance was $300,000 (the average $674,861); the advance was recouped from revenue in 93.9% of agreements, and in 48.4% recoupment finished before the developer's first revenue share payment; the developer's average share was 58.2% in deals with an advance (median 50%) and 67.9% without one (median 70%); and in deals with an advance, 96.4% of developers kept their IP. The outcome turns on definitions: whether the advance is recouped from all revenue or only from the developer's share, whether a markup is added first (one contract Game Developer reviewed in 2020 recouped the "funding amount + 15%" from 100% of revenue), and what "net revenue" deducts before the split (store fees, taxes, refunds).

**Milestones and acceptance.** Advances are paid in tranches; Voyer found payment tied to milestone completion in 79.7% of agreements. A milestone is a deliverable the publisher accepts, named in the industry's build vocabulary (first playable, vertical slice, alpha, beta, gold master), and acceptance is what releases the money, so the acceptance criteria in the contract are the developer's cash flow. Each milestone is a build, and the build record in the core model ([Production Pipelines & Builds](/books/gaming/production-pipelines)) is the evidence of what was delivered and when.

**Platform exclusivity.** A store can pay to have a game only on that store. The Epic Games Store's early exclusives used minimum guarantees: an advance against the game's store sales in exchange for timed exclusivity, usually one year. Filings in Epic v. Apple, as reported by TechSpot in April 2021, put Epic's minimum guarantees in 2020 at $444 million, with $330 million of unrecouped costs. Since 2023 Epic has also run a published program in place of a negotiated one: Epic First Run gives a new game 100% of revenue for its first six months as an exclusive among third-party PC stores (the developer's own store and Epic's keyless redemption stay open), after which the store's standard terms apply ([Epic Games Store](/books/gaming/stores-and-payments#epic-games-store)). An exclusivity window is effective-dated data per game and store, and a release on another store before it ends is a breach somebody has to catch.

**Subscription-library deals.** A subscription service licenses a game rather than selling it, and the terms are rarely public. Microsoft's Phil Spencer told The Verge in 2020 (as reported by PC Games Insider) that Game Pass deals are "all over the place," "based on the developer's need," and that "[in] certain cases, we'll pay for the full production cost of the game." Apple Arcade developers, according to a mobilegamer.biz report summarized by MacStories, are paid an up-front fee plus payments from a "bonus pool" based on "qualifying sessions," an engagement measure Apple defines. Sony hasn't published how PlayStation Plus Game Catalog titles are paid, and I haven't found reliable reporting on it. Whatever the service, the studio's revenue from it arrives as fees, development funding or engagement-based payments, on the platform's terms and in the platform's reports, not as purchases in its own ledger, and the player's access is a time-bounded entitlement ([Subscriptions](/books/gaming/monetization#subscriptions)).

**Co-development and work-for-hire.** Service partners build parts of a game, or all of it, for a fee. Under US copyright law a work is "made for hire" when an employee creates it within the scope of the job, or when it is specially commissioned in one of nine listed categories (among them "a contribution to a collective work" and "a part of a motion picture or other audiovisual work") and both parties sign a written agreement saying so; the commissioning party is then the author and the copyright owner (Copyright Office Circular 30). Other countries have their own rules, so the contract's rights clause is what decides. A pure work-for-hire deal has no royalty to report; a co-development deal with a revenue share has the same statements as a publishing deal.

**Grants and public funding.** Governments fund games directly and through tax, each with its own eligibility test (as of October 2026):

- **UK Games Fund.** Backed by the UK government through DCMS; its Content Fund offers £100,000 to £250,000 for commercial games, beside prototype and starter funds.
- **UK Video Games Expenditure Credit.** A 34% taxable credit, which replaced Video Games Tax Relief from January 1, 2024, on qualifying expenditure (the lower of 80% of core expenditure or the actual UK core expenditure) for games that pass the British cultural test, with at least 10% of core expenditure in the UK.
- **Creative Europe MEDIA.** The 2026 video games and immersive content development call had an estimated EUR 10 million budget and lump-sum grants of up to EUR 200,000 per project, for concept development up to the first prototype only: production is ineligible, and the applicant must show a commercially distributed game since January 1, 2023, with work-for-hire projects not counting.
- **Ontario Interactive Digital Media Tax Credit.** Refundable: 40% of eligible Ontario labour and marketing and distribution expenses (marketing capped at $100,000 per product) for products a company develops for sale, and 35% of labour for fee-for-service work.

Grants and credits are claimed against costs by project and place, so the studio needs spend recorded per game and per location, which is the same discipline a royalty audit asks for.

**What the deals mean for the data.** Every deal above turns into a statement someone has to produce or check: for each period, gross sales by store, region and SKU; less each store's fee, refunds, chargebacks and taxes; net revenue; the split that applies (before or after recoupment); and the running unrecouped balance of each advance or minimum guarantee. A royalty statement is only as good as the sales data under it, and each store reports differently (Steam's transaction reports, Apple's and Google's server APIs and payout reports), so sales per store must reconcile to that store's payouts before any statement goes out ([Stores, Fees & Payments](/books/gaming/stores-and-payments), [Reconciliation](/docs/payments/payment-states#reconciliation)). My rule: keep the deal terms (splits, recoupment base, markups, exclusivity windows, territories) as effective-dated data per game and SKU, and compute statements from reconciled sales, never from a spreadsheet copy of them.

## The Life of a Game

![A game's life from left to right: prototype, production, launch and live, then sunset. A loop from live back to itself is labelled patches, seasons and events. A dashed exit from prototype goes to cancelled. Above each stage is what the platform must have by the end of it: a playable build; pipelines, test automation and certification; accounts, store, servers and support at scale; live configuration, telemetry and moderation; and what happens to purchases and data at shutdown.](/diagrams/gm-games-business-lifecycle.svg "Most of a successful game's cost, and nearly all of its backend, belongs to the years after launch.")

**Prototype.** A small team proves the game is fun. Code is thrown away, and engine choice happens here ([The Engine Landscape](/books/gaming/engine-landscape)). A prototype that isn't fun gets cancelled, which is the point of making it cheap. The platform at this stage is a build machine and a way to get builds to playtesters.

**Production.** The team grows to its largest, content is built at scale, and the pipeline becomes the product: source control that handles binary assets, build farms, automated tests and crash reporting ([Production Pipelines & Builds](/books/gaming/production-pipelines)). For an online game, the backend is built in parallel: accounts, matchmaking, servers, the store. Closed tests and betas exercise them with real players.

**Launch.** The game passes certification on each platform and goes live. Launch is a load event: the concurrency peak arrives in the first hours, from every region at once, and the backend, the server fleet, the patcher and player support all see their worst day. A launch that fails here is hard to recover from, which is why the load testing in [Game Servers & Hosting](/books/gaming/game-servers) happens months earlier.

**Live.** A live game patches, runs seasons and events, sells new content, balances, bans cheaters and answers tickets, for years. This is where most of the backend in this volume does its work. The numbers that run it (concurrent players, retention, conversion, revenue per player) are defined in [Game Metrics](/books/gaming/game-metrics).

**Sunset.** Every online game eventually shuts down its servers or moves to a reduced mode. What happens to the things players bought is a consumer-law question as much as a technical one ([When the Servers Shut Down](/books/gaming/consumer-law-and-loot-boxes#when-the-servers-shut-down)), and the shutdown itself is a runbook ([Live Operations](/books/gaming/live-operations#end-of-service)). The technical decisions are made years earlier: whether the game can run without the backend at all, whether purchased content is recorded in a way that can be honored or refunded, and whether saves and account data can be exported or deleted on schedule ([Saves, Progression & Player Data](/books/gaming/saves-and-player-data#player-data-rights-in-a-live-game)). My rule: write the sunset plan before launch, because the architecture decides which options exist.

## Who Uses Which Tool

| Role | What they do | What they need from the platform |
| --- | --- | --- |
| **Game designer** | Designs systems, levels, balance and progression | Data-driven tuning without a rebuild, telemetry on what players actually do |
| **Gameplay and engine engineer** | Builds the simulation, rendering, tools and netcode | Fast builds, profiling, crash reports with symbols, deterministic repro |
| **Artist and technical artist** | Builds and integrates content within budgets | Asset pipelines, locking for unmergeable files, per-platform budgets |
| **QA** | Tests builds, files and verifies bugs | Build history, automated test results, replays, test accounts |
| **Producer** | Plans scope, schedule and releases | Build and release status, certification state, risk |
| **Backend and platform engineer** | Runs accounts, matchmaking, servers, store and services | Observability, fleet capacity, feature flags, safe rollouts |
| **Live operations** | Ships patches, events, offers and configuration | Scheduling, targeting, experiments, instant rollback |
| **Data analyst** | Measures retention, economy and balance | A clean event stream and a warehouse with stable definitions |
| **Player support** | Answers tickets: purchases, bans, lost items | Account, purchase and penalty history on one screen, audited grant and restore tools |
| **Trust and safety** | Reviews reports, issues and reviews penalties | Evidence (chat, voice, replays), a policy, an appeals queue |
| **Community and esports** | Talks to players, runs competitions | Announcements, tournament tooling, spectator feeds |

Every role reads the same account, profile and match records, cut for its job. Support and moderation tools also write to them, so they follow the rules in [Support Access & Internal Tools](/docs/security/support-access).

## The Core Data Model

Every game backend converges on the same handful of concepts under different names. This volume uses one set, and every later chapter extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **game** | `games` | One title the tenant operates |
| **account** | `accounts` | A player's identity with the publisher, across all of its games |
| **platform identity** | `platform_identities` | A linked Steam, PlayStation, Xbox, Epic, Nintendo, Apple or Google identity |
| **player profile** | `player_profiles` | An account's presence in one game: name, progression, settings |
| **build** | `builds` | A versioned client or server build for one platform |
| **item** | `items` | The catalog entry for anything ownable: a game, DLC, a skin, a pass, gear |
| **entitlement** | `entitlements` | An account's right to an item, with where it came from and when it ends |
| **item instance** | `item_instances` | One copy of an item with its own state: rolled stats, wear, level |
| **wallet** | `wallets` | An account's balance of one virtual currency |
| **ledger entry** | `currency_ledger_entries` | One append-only change to a wallet; the balance is their sum |
| **match** | `matches` | One played session of a mode, on one server |
| **participant** | `match_participants` | A profile's place in a match: team, party, result |
| **game server** | `game_servers` | One allocated server process, running a server build |
| **party** | `parties` | Players who queue and play together |
| **report** | `reports` | One player reporting another |
| **penalty** | `penalties` | A sanction on an account, for one game or all |

![Data model in four rows. Who plays: an account has platform identities and player profiles, and a game has player profiles and builds. What they own: an account has wallets, a wallet has ledger entries, and an item, which belongs to a game or to the whole tenant, has entitlements held by accounts and instances held by profiles. Play: a game server hosts a match, a match has participants, and a party groups participants. Conduct: a report is filed by one profile about another, and can lead to a penalty on an account.](/diagrams/gm-games-business-model.svg "The canonical model used across this volume. The account is the publisher's view of a person; ownership and money hang off it, play and conduct hang off the per-game profile.")

Three distinctions recur in every chapter.

**The account is not the profile.** The account is the publisher's identity for a person, the thing a login, a linked platform, a wallet or a ban attaches to. The profile is that person inside one game: a name, a rank, progression, settings. A publisher with several games wants one account and many profiles, so a player who buys currency once can spend it in more than one title. Riot's 2026 move of Teamfight Tactics to a new engine is a public example: purchases and the currency shared with League of Legends came through untouched ([Studios Changing Engines](/books/gaming/engine-landscape#studios-changing-engines)). That only works because ownership and currency live in backend services above any one game's client.

**Entitlements are not item instances.** An entitlement is a right: this account owns this skin, this DLC, this season pass, from this purchase, until revoked. An item instance is the copy inside one game, and it carries whatever differs between copies (a weapon's rolled stats, a card's level, a tradeable item's history), so it belongs to a profile. Keeping them apart makes refunds tractable: the store refund revokes the entitlement, and the instance created from it goes with it, while a traded item needs the instance's whole chain ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements)).

**Balances are sums, never fields.** A wallet holds no balance column. Every grant, purchase, spend, refund and expiry is an append-only ledger transaction, keyed by its source so a retry posts once, and the balance is the sum of the entries (cached if needed, never authoritative). It's the same rule as any money ledger ([Money](/docs/payments/money), [Idempotency](/docs/payments/idempotency)), and it matters more here because currency is granted by game servers, stores, support agents and campaigns, often for the same event more than once.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions). Every table carries `tenant_id`, the studio or publisher, because this model is written as a platform that serves many games from many studios; a single studio's own backend has one tenant and can drop the column. It holds keys, relations and the states every chapter reads; the columns a chapter owns (an entitlement's source and validity, ledger amounts and transactions, a build's platform and promotion, a report's match and channel, ratings) are added in that chapter:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- for the exclusion constraint below

CREATE TABLE games (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,                 -- the studio or publisher
  slug       TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE accounts (                     -- one per player, across the tenant's games
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('active', 'locked', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_identities (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  account_id   UUID NOT NULL REFERENCES accounts (id),
  platform     TEXT NOT NULL CHECK (platform IN ('steam', 'psn', 'xbox', 'epic',
                 'nintendo', 'apple', 'google')),
  external_id  TEXT NOT NULL,               -- the platform's stable user id, never a name
  valid_during TSTZRANGE NOT NULL,          -- linked until unlinked
  EXCLUDE USING gist (tenant_id WITH =, platform WITH =, external_id WITH =,
    valid_during WITH &&)                   -- one account per platform identity at a time
);

CREATE TABLE player_profiles (              -- an account inside one game
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  account_id   UUID NOT NULL REFERENCES accounts (id),
  game_id      UUID NOT NULL REFERENCES games (id),
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, game_id)
);

CREATE TABLE builds (                       -- platform, branch, promotion: Production Pipelines
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  game_id    UUID NOT NULL REFERENCES games (id),
  kind       TEXT NOT NULL CHECK (kind IN ('client', 'server')),
  version    TEXT NOT NULL,                 -- what players and crash reports see
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE items (                        -- the catalog; trading and stacking: Economies
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  game_id    UUID REFERENCES games (id),    -- null: shared across the tenant's games
  kind       TEXT NOT NULL CHECK (kind IN ('game', 'dlc', 'cosmetic', 'pass',
               'consumable', 'gear')),
  name       TEXT NOT NULL
);

CREATE TABLE entitlements (                 -- source, validity, revocation: Economies
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts (id),
  item_id    UUID NOT NULL REFERENCES items (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE item_instances (               -- one copy; its state and source: Economies
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  item_id          UUID NOT NULL REFERENCES items (id),
  owner_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallets (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts (id),
  currency   TEXT NOT NULL,                 -- a virtual currency code, e.g. 'GEM'
  UNIQUE (account_id, currency)
);

CREATE TABLE currency_ledger_entries (      -- append-only; amounts, transactions: Economies
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_servers (                 -- one allocated server process: a match, or part of a persistent world
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  build_id     UUID NOT NULL REFERENCES builds (id),  -- a server build
  region       TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('ready', 'allocated', 'draining',
                 'shut_down')),
  allocated_at TIMESTAMPTZ,
  shut_down_at TIMESTAMPTZ
);

CREATE TABLE parties (                      -- members: Parties, Presence, Chat & Voice
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  game_id           UUID NOT NULL REFERENCES games (id),
  leader_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disbanded_at      TIMESTAMPTZ
);

CREATE TABLE matches (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  game_id        UUID NOT NULL REFERENCES games (id),
  mode           TEXT NOT NULL,             -- ranked, casual, custom, ...
  game_server_id UUID REFERENCES game_servers (id),  -- null for peer-hosted play
  status         TEXT NOT NULL CHECK (status IN ('forming', 'in_progress',
                   'completed', 'abandoned')),
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ
);

CREATE TABLE match_participants (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  match_id          UUID NOT NULL REFERENCES matches (id),
  player_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  party_id          UUID REFERENCES parties (id),  -- queued together
  team              SMALLINT,
  result            TEXT CHECK (result IN ('win', 'loss', 'draw', 'left')),  -- set at the end
  UNIQUE (match_id, player_profile_id)
);

CREATE TABLE reports (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  reporter_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  reported_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  category            TEXT NOT NULL CHECK (category IN ('cheating', 'harassment',
                        'hate_speech', 'griefing', 'inappropriate_name', 'other')),
  comment             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (reporter_profile_id <> reported_profile_id)
);

CREATE TABLE penalties (                   -- the playbook's table, scoped to a game
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  account_id         UUID NOT NULL REFERENCES accounts (id),
  game_id            UUID REFERENCES games (id),  -- null: every game on the account
  decision_id        UUID NOT NULL REFERENCES moderation_decisions (id),  -- who decided, why
  kind               TEXT NOT NULL CHECK (kind IN
                       ('warning', 'feature_restriction', 'suspension', 'permanent_ban')),
  restricted_feature TEXT CHECK (restricted_feature IN ('text_chat', 'voice_chat',
                       'queue', 'ranked', 'trading', 'ugc_publishing')),
  ladder_step        SMALLINT NOT NULL,
  valid_during       TSTZRANGE NOT NULL,    -- unbounded upper end for a permanent ban
  revoked_at         TIMESTAMPTZ,           -- overturned on appeal
  revoked_reason     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'feature_restriction') = (restricted_feature IS NOT NULL))
);
```

`penalties` is the playbook's [penalties table](/docs/security/trust-and-safety#penalties-and-escalation-ladders) with two game-specific changes: `game_id` scopes a penalty to one title, and `restricted_feature` names the game features a ladder restricts (chat, a queue, ranked play, trading). Who issued it, under which policy version and on what evidence lives on the playbook's `moderation_decisions` row that `decision_id` points to, so cheating and conduct penalties share one decision record and one appeal path.

Design decisions behind it:

- **Ownership hangs off the account; play hangs off the profile.** Entitlements, wallets and penalties reference `account_id`, because a player owns things and gets banned as a person. Matches, reports and item instances reference `player_profile_id`, because they happen inside one game. Where a penalty applies to one game only, `game_id` says so.
- **Platform links are effective-dated.** A Steam or PlayStation identity can be unlinked and relinked, sometimes to a different account after a recovery. The exclusion constraint allows one live link per platform identity, and the history of links survives for support and fraud review ([Effective Dating & History](/docs/database/temporal-data)).
- **Every build is a row,** client and server, per platform. Crash reports, matches (through the server), telemetry and support tickets all name the build they happened on, and a patch that breaks something is found by joining on it ([Patching & Content Delivery](/books/gaming/patching)).
- **A match names its server, and the server names its build.** That chain answers the questions that matter after an incident: which build was running, in which region, for which players. Allocation and draining are in [Game Servers & Hosting](/books/gaming/game-servers).
- **Instants are UTC.** Everything in this model is something that already happened or a range of instants. Local-time promises (an event that starts at 6 PM in each region) are the live-ops calendar's concern ([Time & Date Formats](/docs/fundamentals/time)).
- **Emit life-cycle events.** `entitlement.granted`, `entitlement.revoked`, `match.completed`, `report.filed` and `penalty.issued` are what the store, telemetry, ranked, moderation and support consume ([Events & Async Messaging](/docs/architecture/events)). A ranked service that polls the match table will, sooner or later, count an abandoned match.

What goes wrong most often is building for one game and then becoming a publisher: profiles get merged into accounts, currency gets stored per game, and the second title needs a migration of every player's purchases. My rule: model the account above the game from the first title, even if only one game will ever exist.

## Auditing

The decisions in this chapter are the ones disputed later:

- **Ownership.** Every entitlement and every ledger entry records its source and reference: the store receipt, the support agent and ticket, the campaign, the match that granted a reward. A chargeback, a refund request and a "my skin disappeared" ticket all start from this record.
- **Identity links.** Who linked or unlinked a platform identity, from where, and after which verification step. Account takeover usually shows up here first.
- **Penalties.** The evidence, the policy version, the decision (system or staff, and which staff member), the appeal and its outcome. Regulators and players both ask for the reason ([Player Behavior & Moderation](/books/gaming/player-behavior)).

The mechanics (typed actors, append-only history, snapshots) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Decide the business model early,** and design the core for the next one too: a premium game that adds a store later needs the entitlement and ledger model it skipped.
- **Model the account above the game** and the profile per game, with ownership and money on the account.
- **Link platform identities to accounts with history,** never by display name, and never more than one live link per platform identity.
- **Keep entitlements and item instances separate,** with the source of every grant recorded.
- **Make every balance a sum of an append-only, idempotent ledger.**
- **Record every client and server build,** and name the build on every match, crash and ticket.
- **Plan for the whole life of the game,** from the prototype's throwaway builds to a sunset plan written before launch.
- **Emit life-cycle events** and let ranked, telemetry, support and moderation consume them.

## References

**Reference**

- [Newzoo via GameDev Reports: Gaming market surpassed $200B](https://gamedevreports.substack.com/p/newzoo-gaming-market-surpassed-200), June 26, 2026 summary of Newzoo's 2025 market estimate, segments and 2028 forecast
- [ESA: Essential Facts About the U.S. Video Game Industry](https://www.theesa.com/resources/essential-facts-about-the-us-video-game-industry/), 212.3 million weekly players, 250,000 jobs and $95.8 billion economic impact
- [ESA: Essential Facts 2026 data](https://www.theesa.com/resources/essential-facts-about-the-us-video-game-industry/2026-data/), 2025 U.S. consumer spending by content, hardware and accessories
- [ESRB: Ratings guide](https://www.esrb.org/ratings-guide/), the In-Game Purchases notice and its examples
- [Apple: In-App Purchase](https://developer.apple.com/in-app-purchase/), the four in-app purchase types
- [Google AdMob: Rewarded ads](https://developers.google.com/admob/android/rewarded), rewarding players for watching ads
- [Xbox Game Pass](https://www.xbox.com/en-US/xbox-game-pass), the four tiers and their library sizes
- [Xbox Requirements](https://devdocs.xbox.com/publishing/certification/xbox-requirements), the published console certification requirements
- [Nintendo: Nintendo Switch 2 launches June 5](https://www.nintendo.co.jp/corporate/release/en/2025/250402.html), the launch date, announced April 2, 2025
- [Nintendo IR: Hardware and software sales units](https://www.nintendo.co.jp/ir/en/finance/hard_soft/index.html), Switch 2 and Switch hardware units through June 30, 2026
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), in-app purchase for currencies and items, loot box odds disclosed before purchase
- [Google Play: Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738), odds of randomized items disclosed close to the purchase
- [Apple: Alternative terms for apps in the EU](https://developer.apple.com/support/dma-and-apps-in-the-eu/), the EU terms under the Digital Markets Act
- [Apple: Introducing the App Store Mini Apps Partner Program](https://developer.apple.com/news/?id=xcz1s7cz), November 13, 2025, the 15% commission on qualifying In-App Purchases in mini apps and its required APIs
- [Apple: Submit your apps to the App Store for Apple Vision Pro](https://developer.apple.com/visionos/submit/), motion information for quick turns and camera changes, and "spatial computing" rather than AR or VR
- [Poki for Developers: Revenue deal types](https://developers.poki.com/guide/revenue-deal-types), the five-year default web exclusive across the open web, Discord and YouTube Playables, and the revenue share on players Poki brings
- [CrazyGames: Requirements](https://docs.crazygames.com/requirements/intro/), ad revenue share, SDK-only ads, Xsolla for in-game purchases and the 50 MB initial download
- [Discord: Activities overview](https://docs.discord.com/developers/activities/overview), Activities as web apps in an iframe on desktop, mobile and web
- [NVIDIA: GeForce NOW FAQ](https://www.nvidia.com/en-us/geforce-now/faq/), owning games on supported stores and publisher opt-in to Steam Cloud Gaming for install-to-play
- [Xbox Wire: Stream your own game on Xbox consoles](https://news.xbox.com/en-us/2024/12/11/xbox-insiders-with-game-pass-ultimate-stream-your-own-game-on-xbox-consoles/), December 11, 2024, streaming owned games beyond the Game Pass catalog since November 2024
- [Meta: Horizon Store app policies](https://developers.meta.com/vr/policy/app-policies/), the three comfort ratings and what each means
- [Meta: Submit your app](https://developers.meta.com/horizon/resources/publish-submit/), Virtual Reality Checks and submitting at least two weeks before launch
- [PlayStation Blog: PS VR2 players can access games on PC with adapter starting on August 7](https://blog.playstation.com/2024/06/03/playstation-vr2-players-can-access-games-on-pc-with-adapter-starting-on-august-7/), SteamVR games on PS VR2 and the features unavailable on PC
- [U.S. Copyright Office: Circular 30, Works Made for Hire](https://www.copyright.gov/circs/circ30.pdf), the two cases of a work made for hire, the nine commissioned categories and the hiring party as author
- [UK Games Fund](https://ukgamesfund.com/), DCMS backing, the Content Fund's £100,000 to £250,000 grants and the prototype and starter funds
- [BFI: About UK creative industry expenditure credits](https://www.bfi.org.uk/apply-british-certification-expenditure-credits/about-uk-creative-industry-expenditure-credits), the 34% Video Games Expenditure Credit, qualifying expenditure, the cultural test and the 10% UK spend rule
- [European Commission: Creative Europe call CREA-MEDIA-2026-DEVVGIM](https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/crea/wp-call/2026/call-fiche_crea-media-2026-devvgim_en.pdf), the EUR 10 million budget, lump sums of up to EUR 200,000, development-only scope, prototype definitions and track-record rule
- [Ontario Creates: OIDMTC](https://ontariocreates.ca/tax-incentives/oidmtc), the refundable 40% and 35% rates and the $100,000 marketing cap

**In practice**

- [Riot Games: Automated Testing for League of Legends](https://www.riotgames.com/en/news/automated-testing-league-legends), a new patch every two weeks
- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), one game server executable per running match beside a platform of backend services
- [GameDev Reports: Voyer Law, Publishing Agreements in 2025](https://gamedevreports.substack.com/p/voyer-law-publishing-agreements-in), May 12, 2025, over 100 agreements from 2017 to 2025: advances, splits, recoupment, milestones and IP retention
- [Winkler Partners: 5 Things to Note in a Video Game Publishing Agreement](https://winklerpartners.com/5-things-to-note-in-a-video-game-publishing-agreement/), January 16, 2023, advances, the publisher's larger share before recoupment (70% as an example) and splits after
- [Game Developer: What makes for a good game publishing contract?](https://www.gamedeveloper.com/business/what-makes-for-a-good-game-publishing-contract-2), December 27, 2020, an advance plus 15% recouped at a 100% rate
- [TechSpot: Epic Games Store lost $454 million in the past two years](https://www.techspot.com/news/89276-epic-games-store-lost-454-million-past-two.html), April 13, 2021, Epic v. Apple filings: $444 million in 2020 minimum guarantees, $330 million unrecouped, usually one-year exclusivity
- [VGC: Epic Games Store is offering developers 100% of revenue for six months of exclusivity](https://www.videogameschronicle.com/news/epic-games-store-is-offering-developers-100-of-revenue-for-six-months-of-exclusivity/), August 23, 2023, the Epic First Run terms and the sales that stay open
- [PC Games Insider: How Xbox Game Pass developers are compensated](https://www.pcgamesinsider.biz/news/71723/heres-how-xbox-game-pass-developers-are-compensated/), November 25, 2020, Phil Spencer to The Verge on Game Pass deals
- [MacStories: Some game developers are unhappy about Apple Arcade](https://www.macstories.net/linked/some-game-developers-are-unhappy-about-apple-arcade/), mobilegamer.biz's report of an up-front fee and a bonus pool based on qualifying sessions
- [The Register: Apple's new 15% mini-app deal gets Tencent to cut Cupertino in](https://www.theregister.com/2025/11/15/apple_tencent_app_deal/), November 15, 2025, Tencent's WeChat mini games and the Mini Apps Partner Program
