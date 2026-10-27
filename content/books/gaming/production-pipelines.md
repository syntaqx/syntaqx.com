+++
title = "Production Pipelines & Builds"
nav_title = "Pipelines & Builds"
description = "How a game gets from check-in to a certified build: large-binary source control, cooking, build farms, test automation, crash symbolication and console cert."
category = "Gaming Industry"
order = 1604
part = "How Games Get Made"
tags = ["gaming", "build-pipelines", "ci", "source-control", "crash-reporting"]
+++

A game's source is mostly not code. It is textures, meshes, animations, audio, levels and the data that ties them together, measured in hundreds of gigabytes, edited by artists who can't merge their work, and converted into a different form for every platform before anyone can play it. The production pipeline is everything between a person saving a file and a player running the result: source control, asset conversion, localization, build farms, automated tests, QA and playtests, crash reporting, profiling, the certification gates platform holders run before a build can ship, and the ports that take the game to another platform.

This chapter covers that pipeline. The engine runtime is in [Building Your Own Engine](/books/gaming/building-an-engine), getting the finished build onto players' machines is [Patching & Content Delivery](/books/gaming/patching), and the general CI practice it builds on is [CI & Continuous Deployment](/docs/delivery/ci-pipelines). The `builds` table from [The Games Business](/books/gaming/games-business) is where all of it is recorded.

## What a Build Is

A build is not a binary. For one platform it's a stack of parts produced together from one source revision, and the parts that ship are not all the parts that matter:

![An exploded axonometric drawing of a shippable build for one platform, four plates bottom to top: 01 manifest (build ID, file and chunk hashes), 02 content archives (cooked assets, packed in chunks), 03 shaders (compiled per graphics API) and 04 executable (game code, symbols stripped). A dashed plate off to the side is labeled symbols, kept in a symbol store and never shipped.](/diagrams/gm-production-pipelines-artifact.svg "A build is a set of parts from one revision. The symbols never ship, but without them every crash report from that build is a list of addresses.")

- **The executable,** compiled for the platform and configuration (development builds keep debugging and profiling hooks; shipping builds strip them).
- **Shaders,** compiled for the platform's graphics API.
- **Cooked content** in archives, split into chunks so patches, DLC and streaming installs can ship parts of it.
- **A manifest** naming every file and chunk by content hash, which launchers and patchers read.
- **Symbols,** produced by the same compile, matched to the executable by a build ID, kept in a symbol store and never shipped.

Every one of those is tied to the same revision and build ID. Lose that link and a crash can't be symbolicated, a patch can't be computed and a certification failure can't be reproduced.

## Source Control for Large Binaries

Code merges; a texture or a level doesn't. Two artists editing the same binary file produce two files and no way to combine them, so game source control is built around **locking**: you check out a binary asset exclusively, and nobody else can change it until you check it in. Unreal's documentation for Perforce says it plainly: `.uasset` and `.umap` files are binary and cannot be merged, so "the Editor will lock that file" when you check it out, and a typemap controls which file types are handled that way.

The options, as of October 2026:

| System | Model | Binary handling | Notes |
| --- | --- | --- | --- |
| Perforce P4 (formerly Helix Core) | Centralized | Exclusive file locking built in | Proxy and edge servers for distributed teams; vendor claims it is "trusted by 19/20 of the top AAA game development studios" |
| Git with Git LFS | Distributed | Large files replaced "with text pointers inside Git," content on a separate server | Files marked `lockable` check out read-only until locked; a push isn't halted if the server can't verify locks |
| Unity Version Control | Centralized or distributed | Locking, with "Smart Locks" that require the latest version before locking | Unity's "new brand for Plastic SCM"; "works with any engine, including Unreal"; file-based workflows for artists |

Perforce's long hold on AAA is about scale and locking: one server holds the whole depot, artists see a simple checkout model, and large studios run proxies near each office. Git's appeal is the tooling programmers already use, especially CI on branches and pull requests, and Git LFS scales further than its reputation: Riot's Legends of Runeterra moved from Perforce to a single Git LFS monorepo of about 100 GB and 1,000,000 files (as of May 2021), for "better CI/CD capabilities for changes that haven't made it to the main branch yet."

My default: Perforce (or Unity Version Control) when content dominates and artists are most of the team; Git with LFS when the team is mostly engineers and wants branch-based CI, with locking set up for the asset types that can't merge. Either way:

- **Lock what can't merge,** by file type, through the tool (a Perforce typemap, `lockable` patterns in Git LFS), not by convention. Git LFS locking is weaker than Perforce's: it makes files read-only locally and checks locks on push, but the push goes through if the server can't verify them.
- **Keep generated files out** (derived data, cooked output, intermediate builds); they belong in caches and artifact stores, keyed by the inputs that made them.
- **Give remote offices a nearby cache** (a proxy, an edge server, an LFS cache), because syncing a game over a long link is hours.

## Branching for a Live Game

A live game ships on a cadence: League of Legends had "a new patch every two weeks" in Riot's 2016 testing post. That cadence needs branches that separate what's being finished from what's being built:

- **Mainline** is where development happens and where the build farm runs continuously.
- **A release branch per patch** is cut from mainline at a fixed point. After the cut, only fixes for that patch go in, and they're reviewed harder.
- **Fixes go into the oldest branch that needs them and merge forward,** so a hotfix to the live release reaches the next patch and mainline. A fix made only on mainline gets lost when the next release branch is cut from an older point; a fix made only on the release branch reappears as a regression.
- **Content locks** stop new art and data entering a release branch after a date, because content is harder to test than code.
- **Unfinished features ship dark** behind flags rather than living on long branches that can't be merged ([Feature Flags & Progressive Rollout](/docs/delivery/feature-flags)).

Client and server builds must come from the same branch and revision when they share protocol or data, and the backend has to serve both the current and the next version during the rollout window ([Game Servers & Hosting](/books/gaming/game-servers), [Patching & Content Delivery](/books/gaming/patching)).

## Assets, Cooking and Packaging

Artists work in source formats (Photoshop files, high-resolution meshes, uncompressed audio). The engine imports them into editor assets, then **cooks** them for each platform. Epic's definition: "the process of converting content from the internal format to the platform-specific format is referred to as cooking." Textures are compressed into the formats each GPU decodes, meshes are optimized, shaders compiled for each graphics API, and data is stripped of editor-only fields.

Packaging then assembles the shippable build. Unreal documents the stages: **build** ("the project's code, plugins, and binaries are compiled for the target platform"), **cook**, **stage** (code and cooked content copied to a staging directory) and **package** (content "bundled into a distributable set of files"). The default archive is `.pak`, and archives can be split into chunks to separate DLC or patches and to set the download priority for a streaming install.

How you cook and pack decides how big every future patch is. Steam's SteamPipe documentation asks for pack files that keep changes localized: "avoid shuffling" asset order between builds, keep packs to a gigabyte or two, and don't write filenames or timestamps into each asset's data. A cook that isn't deterministic (the same input producing different bytes) turns a one-line change into a gigabyte download. [Patching & Content Delivery](/books/gaming/patching) covers delta computation; the pipeline's job is to keep output stable.

Cooking is expensive, so pipelines cache it. Each cooked output is keyed by a hash of its inputs (the source asset, the cooker version, the platform and the settings), and a build fetches from the cache whatever hasn't changed. The rule that makes this safe: every input that can change the output is part of the key. Miss one (a cooker setting, a shared include) and the cache serves stale content that passes every test on the build machine.

Validation belongs here too: textures over their size budget, meshes without LODs, missing references, names that break the platform's rules. Legends of Runeterra's pipeline runs asset validation as its own test stage, and errors caught at import or cook time cost minutes; caught at certification, they cost a submission.

## Localization

The general rules are in [Internationalization](/docs/frontend/internationalization): every string externalized under a stable key, grammar in the message instead of the code, room for text expansion and a pseudo-locale in CI. A game follows all of them. What changes is that its text lives in assets as much as in code, ships inside cooked builds, and renders in fonts the game carries itself.

- **Keys and gathering.** Unreal identifies each localizable text by a namespace and a key, and its String Tables "can be defined in C++, loaded using a CSV file, or created as an Asset," so code and assets reuse one entry. The Localization Dashboard gathers text from source and assets, exports it (Epic recommends the PO pipeline for external translation tools), imports translations and compiles the runtime data per culture. Unity's Localization package covers the same ground: strings and assets that change per locale, Smart Strings for placeholders and plurals, and import and export through XLIFF, CSV and Google Sheets. The gather belongs on the build farm, so a string that never reached a table fails a build instead of a translator's schedule.
- **Grammar in the message.** Unreal's text formatting has argument modifiers for plural forms (`{NumCats}|plural(one=is,other=are)`), gender (`{Gender}|gender(Le,La)`) and Korean post-positions (`{Arg}|hpp(은,는)`), the engine's counterpart to ICU's `plural` and `select` ([Plurals and Grammar](/docs/frontend/internationalization#plurals-and-grammar-icu-messageformat)). Games need them more than most software: item counts, a player character whose gender the player chose, a teammate's name in the middle of a sentence.
- **Pseudo-localization before translation.** Unity's package supports it to "test how your project will adapt to different localizations at an early stage." In a game, run the pseudo-locale through the automated screenshot and bot passes, because overflow in a HUD, a subtitle or a button prompt doesn't show up in a grep ([Pseudo-Localization in CI](/docs/frontend/internationalization#pseudo-localization-in-ci), [Text Expansion](/docs/frontend/internationalization#text-expansion)).
- **Localized assets.** Textures with words on them, voice lines and subtitles change per language too; Unity's package swaps "a texture, model, or audio file" by locale. Each language adds install size, so cook languages into their own chunks and download only the ones a player uses ([Patching & Content Delivery](/books/gaming/patching)).

**Fonts and glyph budgets.** A game draws its own text, which makes it carry its own glyphs. China's Table of General Standard Chinese Characters, issued by the State Council in 2013, holds 8,105 characters, 3,500 of them in the first-level table of common characters; a font atlas holds a limited number of glyphs, and TextMesh Pro's documentation says "the exact number depends on the font, the size of the atlas texture, and the settings you use." Engines answer with fallback chains. TextMesh Pro searches the text's font, its fallback fonts recursively, then the project-wide fallbacks, and finally draws a missing-glyph character; it names Chinese, Japanese and Korean as the case for spreading a character set across several font assets. Unreal's composite fonts assign sub-fonts by character range and optionally by culture, and UMG supports only runtime-cached fonts, which rasterize glyphs as they're needed. My rule: build the glyph set from the gathered strings, give font atlases a line in the per-platform memory budget ([Performance Budgets](#performance-budgets)), and include CJK in the pseudo-locale so a missing glyph shows up in CI as an empty box. Player-entered text (names, chat) can contain any character, so it needs a fallback font even when the UI ships in one language.

**Voice and lip sync.** Voice-over is recorded per language from a locked script, usually to the timing of the original line so cutscenes and subtitles still fit ([Subtitles and Captions](/books/gaming/accessibility#subtitles-and-captions)). Faces then need lip sync per language: animation authored for each, or generated from the recorded audio with audio-driven tools such as Speech Graphics' SGX and FaceFX. Either way it's per-language content in the cook, with its own budget.

**Linguistic QA.** Translators work from tables; players see a running build. LQA (linguistic quality assurance) is a pass in which testers fluent in each language play a localized build and log truncation, untranslated strings, text out of context, wrong terminology and broken formatting. QA vendors sell it as its own service (Testronic lists localization QA beside functional and compliance QA, and so does Side). Each LQA bug names the build and the string key, so the fix lands in the table and the next build proves it.

**Platform and regional requirements.** As of October 2026:

- **Xbox.** XR-003 says "there's no requirement on the amount of localization a title must support," but "in areas where localized text is supported, the text must be legible regardless of the display setup." XR-022 requires the naming in Microsoft's Terminology List when referring to Xbox features, services and hardware, so platform terms belong in the translators' glossary, not to free translation.
- **Steam.** Developers declare the languages a game supports in the store editor. For games without a Full Platform Support language, "English is Steam's fallback language and needs to have content, even if that content is actually another language."
- **China.** New Zealand's trade ministry, in its September 2026 market report, describes localization as "an integral part of the ISBN application": games "must be fully localised using simplified Chinese," text on in-game road signs, building names and signboards included, and other foreign-language text is "typically required to be translated or minimised." A Chinese publisher holding a Web Publishing Service License submits the application.

## Build Farms and CI

Building a game for several platforms is too slow for one machine, so the work is described as a **graph** and spread across a farm. Epic's BuildGraph is "a script-based build automation system that features graphs of building blocks," written in XML: nodes with dependencies, each producing outputs. For a distributed build, the graph is exported as JSON, each machine runs nodes, all sync the same changelist, and outputs pass between machines through a shared network location, running in parallel wherever dependencies allow.

Above that sit the systems that schedule the graph and remember the results:

- **Horde** is "a set of services supporting workflows Epic Games uses to develop Fortnite, Unreal Engine, and other projects": build automation "designed for teams working with large Perforce repositories," remote execution including "C++ compilation with Unreal Build Accelerator," a front end for automation test results, and analytics from editor telemetry.
- **Incredibuild** sells compile distribution and caching: it pools "idle CPUs you already own across your network or public cloud into a high throughput cluster" and reuses a shared cache "organization-wide to eliminate redundant build tasks." Its published case figure for Bandai Namco Studios is compilation falling from 50 to 18 minutes; that's a vendor case study, not an independent benchmark.
- **General CI systems** work too, with the graph in their own pipeline language. Riot's Runeterra pipeline (as of May 2021) ran Jenkins with build logic in Python: about 100 runs a day, each building Windows, Android and iOS in about 60 minutes on cloud build nodes.

![A dimensional timeline of one change moving through a build farm at 9 px per minute. The main lane runs seven stages from check-in to results: S1 queue and sync 3 minutes, S2 compile 14, S3 cook 12, S4 package 6, S5 deploy to test machines 4, S6 automated tests 18 (highlighted, from Riot's 2016 League figure) and S7 report 3, totaling B1 = 60 minutes. A side lane uploads symbols and the build for 5 minutes after packaging, off the critical path. A variable table marks every value illustrative except S6.](/diagrams/gm-production-pipelines-build.svg "One change, check-in to results (illustrative except the test stage). An hour is the figure both Riot posts land near; shortening it means attacking the longest stages, not the side lane.")

The stage split in the drawing is illustrative; the total and the test stage match Riot's published figures. The shape is what matters. The critical path runs through compile, cook and tests; uploads of symbols and artifacts run beside it. To shorten the loop:

- **Cache compile and cook output** by input hash, so a change rebuilds only what it touches.
- **Split the graph** per platform and per content chunk so independent nodes run on separate agents.
- **Tier the tests:** a fast smoke set on every change, the full suite on a cadence, long soak and performance runs nightly.
- **Keep agents warm,** with source synced and caches local, because a cold agent can spend longer syncing than building.

[CI & Continuous Deployment](/docs/delivery/ci-pipelines) covers the general practice. What's different here is scale: a game's CI is a farm, and its cost and queue time are worth tracking like any production service.

## Automated Testing at Scale

Games were long tested mostly by hand, and manual testing remains essential for whether something is fun or readable. Regressions are a different problem, and the scale of the problem is the argument for automating them. EA's SEED research group cites a paper estimating that testing Battlefield V's 601 features by hand would take about 0.5 million hours, "~300 work years." Live games carry suites to match: Rare described Sea of Thieves in 2024 as having "hundreds of thousands of automated tests" guarding a game that keeps changing, and Riot's 2016 post on League of Legends reported about 5,500 test cases run in about 18 minutes on every new build, with results "within about an hour of check-in."

The same League post has the clearest public figure on why the speed matters: "bugs discovered in automation get resolved eight times faster than the average bug." A failure tied to a specific build, an hour after the change, points at a handful of check-ins; a bug found by a person a week later points at hundreds.

The test layers in a game pipeline: static analysis, asset validation, unit tests, automated performance tests against the memory and frame budgets, and functional tests that launch real game processes. Riot's Runeterra pipeline published that stack (C# xUnit unit tests, pytest functional tests against game servers alone or with headless clients). In Unreal, Gauntlet is the launcher for the last layer: it runs sessions from a cooked build ("a multiplayer game may require four clients and a server"), and parses the logs and crashes they produce, with results collected by Horde across streams and projects.

Games add test types web services rarely need:

- **Headless clients and bots** that play scripted matches against a real server. Scripted bots break whenever a feature changes, which is why EA's SEED has deployed reinforcement-learning test agents in Battlefield V and Dead Space (2023) to explore what a script doesn't cover.
- **Replay tests** that feed a recorded game's inputs into a new build and compare the outcome, which needs a deterministic simulation; the loop and its tooling are in [Finding Desyncs](/books/gaming/determinism-and-rollback#finding-desyncs).
- **Soak tests** that run a client or server for hours to find leaks and fragmentation.
- **Device farms** for the spread of phones and PC hardware nobody can cover by hand.

Flaky tests are worse in games than elsewhere, because timing, frame rate and GPU drivers vary. Quarantine a flaky test immediately and fix it, or the farm teaches everyone to ignore red ([Testing Strategy](/docs/quality/testing)).

## QA and Playtesting

[Automated testing](#automated-testing-at-scale) catches regressions in what someone thought to check. People cover the rest: whether a feature works the way a player meets it, whether the build passes a platform's requirements, and whether the game is understood and enjoyed. Those are three different jobs with different staff.

- **Functional QA** runs test plans against a specific build: a plan per feature written before it lands, a regression pass on every release candidate, and exploratory passes on whatever changed most. Every bug records the build it was found on and the build that verifies the fix, the same discipline as crash groups below. "Fixed on mainline" tells a tester on a release branch nothing; "verified in build 26.21.0412" does.
- **Compliance QA** is pre-certification: running the platform holder's requirement test cases in-house before submitting, so the first failure costs a day instead of a submission ([Platform Certification](#platform-certification)). Microsoft publishes its test cases with the XRs; for Sony and Nintendo the requirements sit behind the developer portals, so this pass is run by people with portal access or a vendor under the same NDA.
- **Compatibility QA** covers the hardware spread: PC GPUs, drivers and controllers, and on phones the device tiers ([Testing on Devices](/books/gaming/mobile-games#testing-on-devices)).

Most of this can be bought. Large service companies sell QA beside localization and other production work: Keywords Studios lists QA testing and game localization in its Globalize division; Side (the company formerly called PTW, which unified its brands under that name in March 2025) lists quality assurance, localization QA and player support across more than 40 studios; Testronic lists functional, compliance, compatibility and localization QA. A vendor scales testers up for a launch and down after it. What it needs from the pipeline is what in-house QA needs: builds through the same promotion path, the same bug fields, and access to the build's symbols and logs.

**Playtests and user research** answer a different question: not whether the game works, but whether players understand it and want to keep playing. Valve's Steam Playtest runs on a separate "child" app ID tied to the main game, with a sign-up on the main store page. Access is limited by default (Steam picks testers "at random from the set of Steam accounts that have requested access," optionally prioritizing countries to protect server capacity) or open to everyone who asks, and a player who only played the Playtest can't review the game. It isn't confidential: "there shouldn't be an expectation of secrecy," and an NDA test needs your own registration and release override keys on the unreleased app. "Collecting feedback from players is up to you." Platform holders run their own research labs as well: Xbox Research recruits players 18 and over for remote studies and onsite sessions in Redmond and Vancouver, and PlayStation Research recruits players for confidential playtests and interviews, sometimes paid. A third-party studio runs its own sessions or hires a user research vendor.

My rule for playtests: a playtest build is a build. It gets a row in `builds`, its telemetry is tagged so it never mixes with live players' ([Telemetry & Analytics](/books/gaming/telemetry)), and every finding that becomes a bug names that build.

## Crash Reporting and Symbolication

A game crashes on hardware you don't own, with drivers you didn't test, and the crash report is often the only evidence. The pipeline:

1. **Capture out of process.** A crashed process can't be trusted to report on itself, so the engine launches a separate handler. Unreal's Crash Report Client "is a separate program"; it collects a minidump (the stack of each thread, register state and selected memory), logs and context, and sends them to whatever server `DataRouterUrl` in `[CrashReportClient]` names. "As of UE 5.4, Epic Games does not receive reports from packaged builds"; the engine ships no server, and Epic's docs point to Backtrace, BugSplat and Sentry.
2. **Receive and store.** Sentry's Unreal integration replaces or works with the engine's client (from UE 5.2 you pick one; "the two are mutually exclusive"), and covers Windows, Linux, macOS, iOS and Android, plus PlayStation, Xbox and Nintendo Switch. By default Sentry uses minidumps only to create events and then drops them; storing them as attachments is opt-in.
3. **Symbolicate.** A minidump holds addresses. Turning them into functions, files and line numbers needs the debug information files from the exact build: PDBs on Windows, dSYMs on Apple platforms, ELF symbols on Linux and Android, or Breakpad symbols anywhere. Sentry matches them by debug identifiers that "uniquely identify debug information files across builds," from uploads or from a symbol server it downloads from on demand. This is why symbol upload is a pipeline step on every build that might reach a player.
4. **Group.** Reports with the same faulting stack (after stripping addresses and normalizing inlined frames) become one issue, counted by build, platform, GPU and driver, so the team sees "this crash, 4,000 times, only on one driver version" instead of 4,000 reports.

The crash pipeline sits beside the backend's ordinary error and trace pipeline, and joins it by build and session ID so a client crash can be read next to the server errors in the same match ([Observability](/docs/operations/observability)). Phones add crashes the OS causes (jetsam and low-memory kills that leave no stack) and the stores' own crash consoles ([Crash Reporting on Mobile](/books/gaming/mobile-games#crash-reporting-on-mobile)). Minidumps contain memory, and memory can contain chat text, names or tokens. Treat them as personal data: collect only what you need, scrub, restrict access and expire them ([GDPR & Privacy](/docs/compliance/gdpr), [Data Retention & Deletion](/docs/architecture/data-retention)). Crash rate per build is defined in [Game Metrics](/books/gaming/game-metrics#technical-health), and it's one of the signals that decides whether a staged rollout widens ([Patching & Content Delivery](/books/gaming/patching#rollouts-rollbacks-and-hotfixes)).

## Profiling

You can't fit a frame budget you can't see. The tools:

- **Unreal Insights,** "a telemetry capture and analysis suite that can capture events from your project at high data rates": CPU and GPU timing, memory, networking, UI, asset loading, cook times and audio.
- **PIX,** Microsoft's "performance tuning and debugging tool for Windows and Xbox game developers using DirectX 12," with GPU captures, timing captures and a system monitor.
- **RenderDoc,** an MIT-licensed single-frame graphics debugger for Vulkan, D3D11, D3D12 and OpenGL on Windows, Linux and Android, with a Switch build distributed through the NintendoSDK.
- **Platform tools** from each console maker, under NDA, and general CPU profilers.

Instrumentation is the other half, and the pattern is the same everywhere: scoped timers that cost nothing in shipping builds, a capture format a standard viewer can read, and a sampling profiler for what the timers don't cover. Unreal's trace system recommends the `TRACE_CPUPROFILER_EVENT_SCOPE` macros for timing a scope; its channels are "disabled and must be explicitly opted into," and the log macros "compile to nothing when Trace is off." Tracy, a "hybrid frame and sampling profiler for games," does the same for engines without their own, across CPU, GPU, allocations and locks. Riot's 2015 post on League describes the in-house version: macros that "for public builds... compile out," captures viewed in Chrome's tracing viewer, and Intel VTune for sampling. Running servers report the same timings as telemetry ([Game Servers & Hosting](/books/gaming/game-servers)).

## Performance Budgets

A budget only works if a build can fail it. Set budgets per platform and subsystem (milliseconds of frame time, megabytes of memory, load time, install size, draw calls), and check them in the pipeline:

| Budget | Measured by | Fails the build when |
| --- | --- | --- |
| Frame time per subsystem | Automated runs of fixed camera paths or bot matches, with timers | p95 exceeds the subsystem's share of the frame |
| Memory per category | Memory reports at fixed points in a scripted session | Any category exceeds its platform cap |
| Load time | Timed loads of each map on reference hardware | Over the target |
| Install and patch size | Package and patch output | Over target, or a patch much larger than its change |
| Content limits | Cook-time validation | Texture, mesh or audio over its limits |

Runeterra's automated performance tests against its mobile memory budget are this pattern in practice. Two details make it work: measure on reference hardware, the low end you promised to support, not the build machine; and compare against the last good build as well as the absolute budget, so a slow creep of 2% a week gets caught before it adds up. The budget figures themselves come from the frame budget ([Building Your Own Engine](/books/gaming/building-an-engine#the-frame-budget)), and their history is the evidence for every argument about adding a feature. On phones the budget also includes heat and battery, which change the frame time a device can sustain ([Memory, Thermal and Battery Budgets](/books/gaming/mobile-games#memory-thermal-and-battery-budgets)).

## Platform Certification

Before a game or patch ships on a console, the platform holder tests it against its requirements. This is the slowest gate in the pipeline, and it's mostly confidential.

Microsoft publishes the most. The Xbox Requirements (XRs) "consist of the policies, technical requirements, and product component-related requirements" every Xbox title must meet; "XRs that are tested in Certification are identified with an asterisk"; unless noted they apply to games on "XBOX One, XBOX Series X|S console generations, xCloud, and PC"; and "inaccurate and incomplete submissions will be rejected from Certification." Retired XRs are removed, so the numbering has gaps.

Sony's and Nintendo's requirements and submission processes are available only to licensed developers under NDA, through their developer portals. Their names are public even though their contents aren't: porting studios call Nintendo's submission procedure Lotcheck, and QA vendors refer to Sony's requirement list as the TRC. Vendors use the labels loosely, so take each platform holder's term from its own portal. Beyond the names, this book says nothing about them.

PC stores have lighter gates. Steam reviews the store page and the build separately, each "typically 3-5 business days," and asks you to plan for at least 7 business days; the build must start up properly, implement every feature the store page lists, and use Steam Wallet for in-game transactions.

What the pipeline needs for certification, whatever the platform:

- **A release candidate build** promoted from a passing pipeline run, never rebuilt for submission, so what was tested is what ships.
- **Requirement checks in the pipeline** for whatever can be automated (save data handling, account and network state changes, suspend and resume), run long before submission.
- **A submission record** per platform: build ID, date, result, the requirements cited in any failure, and the fix.
- **Calendar slack.** A patch date that depends on passing certification on the first try is a guess. Plan for a failure and a resubmission, and coordinate the date with the store's own review time.

## Porting

A port takes a game to a platform it wasn't built for, and very little of the work is the game itself. What changes:

- **Platform SDK and services.** Sign-in, entitlements, the store, presence, friends and invites each have the platform's own API and rules ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#accounts-and-platform-identities)).
- **Certification.** A new platform brings its own requirements and submission process ([Platform Certification](#platform-certification)), and every patch goes through it again.
- **Input.** Controllers, touch or keyboard and mouse, with button prompts in each platform's names and glyphs, and remapping that works with all of them ([Input and Remapping](/books/gaming/accessibility#input-and-remapping)).
- **Performance targets.** Lower-end hardware means new frame, memory and install budgets, and usually content changes (texture resolution, draw distance, LODs) cooked as a separate platform target ([Performance Budgets](#performance-budgets)).
- **Saves.** Each platform has its own save storage and cloud sync, and a save on one doesn't appear on another without your own service ([Saves, Progression & Player Data](/books/gaming/saves-and-player-data#how-the-platforms-do-it)).
- **Achievements and trophies.** Xbox achievements, PlayStation trophies and Steam achievements are separate systems, each configured in its own platform's tools, so the game raises one unlock event and each platform target maps it to its own set.

Engines carry part of this: platform support is what an engine's platform layer sells ([What an Engine Gives You](/books/gaming/engine-landscape#what-an-engine-gives-you)). The rest is labor, and a lot of it is contracted. Porting houses and co-development partners take a game, or part of one, to new platforms: Virtuos, a Singapore-based studio specializing in co-development and remastering, whose credits include Dark Souls Remastered for Switch and Batman: Return to Arkham; Panic Button, whose featured work includes Forza Horizon 5 for PlayStation 5, DOOM Eternal and The Elder Scrolls V: Skyrim Anniversary Edition; Iron Galaxy, whose co-development list includes Uncharted: Legacy of Thieves and Crash Bandicoot N. Sane Trilogy; and Room 8 Studio, whose porting guidance is one of the public descriptions of Nintendo's submission procedure.

Before any of that, the studio needs access. As of October 2026:

- **ID@Xbox** is Microsoft's route to publishing on Xbox, offering technical and publishing support, incentives and promotion. Its FAQ asks that you be 18 or older (or have a parent or guardian start the relationship), sign an NDA and be in a country Microsoft can do business with.
- **PlayStation Partners** is where registration starts: basic studio details and a short project plan. Once the registration is approved and the Global Developer and Publisher Agreement (GDPA) signed, it opens development tools, documentation and publishing resources.
- **The Nintendo Developer Portal** lets individuals register as well as companies; accounts accept an NDA and terms of service, access to Nintendo Switch information takes a separate application, and a game is submitted to Nintendo for review before it can be sold.

Only Microsoft publishes its requirements (the Xbox Requirements); Sony's and Nintendo's sit behind those agreements. A port is planned around that: the requirements can't be read until the agreement is signed, and the certification calendar can't be estimated until they are read.

In the pipeline, a port is new platform targets in the build graph, new rows in `builds` per platform, and new `certification_submissions`. My default for a game that might be ported: keep platform services behind interfaces from the start, so a port adds an implementation instead of searching the codebase for every call to one store.

## Recording Builds

The core model's `builds` table holds each versioned client and server build, one row per platform ([The Games Business](/books/gaming/games-business#the-core-data-model)). The pipeline adds what made the build and what happened to it:

```sql
ALTER TABLE builds
  ADD COLUMN source_revision TEXT NOT NULL,     -- changelist or commit
  ADD COLUMN branch TEXT NOT NULL,              -- mainline, release/26.21
  ADD COLUMN platform TEXT NOT NULL,            -- windows, ps5, xbox_series, switch, ios, android
  ADD COLUMN configuration TEXT NOT NULL
    CHECK (configuration IN ('development', 'test', 'shipping')),
  ADD COLUMN engine_version TEXT NOT NULL,      -- 'unreal 5.6', or your own engine's tag
  ADD COLUMN pipeline_state TEXT NOT NULL DEFAULT 'queued'
    CHECK (pipeline_state IN ('queued', 'syncing', 'compiling', 'cooking',
      'packaging', 'testing', 'passed', 'failed')),
  ADD COLUMN promotion TEXT                     -- null until a passed build is promoted
    CHECK (promotion IN ('candidate', 'submitted', 'certified', 'released', 'withdrawn')),
  ADD COLUMN started_at TIMESTAMPTZ,
  ADD COLUMN finished_at TIMESTAMPTZ;

CREATE TABLE build_artifacts (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  build_id UUID NOT NULL REFERENCES builds (id),
  kind TEXT NOT NULL CHECK (kind IN ('package', 'chunk', 'manifest', 'symbols')),
  debug_id TEXT,                   -- for symbols: the identifier crash reports carry
  content_hash TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_uri TEXT NOT NULL,
  is_shipped BOOLEAN NOT NULL,     -- false for symbols
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  build_id UUID NOT NULL REFERENCES builds (id),
  suite TEXT NOT NULL CHECK (suite IN ('smoke', 'full', 'performance', 'soak', 'replay')),
  passed_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  quarantined_count INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ
);

CREATE TABLE crash_groups (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games (id),
  signature TEXT NOT NULL,         -- normalized faulting stack
  first_build_id UUID NOT NULL REFERENCES builds (id),
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'ignored')),
  fixed_in_build_id UUID REFERENCES builds (id),  -- a report on a later build reopens it
  UNIQUE (tenant_id, game_id, signature)
);

CREATE TABLE crash_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  crash_group_id UUID REFERENCES crash_groups (id),  -- set after symbolication
  build_id UUID NOT NULL REFERENCES builds (id),
  account_id UUID REFERENCES accounts (id),           -- only if the player was signed in
  gpu_model TEXT,
  driver_version TEXT,
  minidump_uri TEXT,                                  -- expires on the retention schedule
  is_symbolicated BOOLEAN NOT NULL DEFAULT false,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certification_submissions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  build_id UUID NOT NULL REFERENCES builds (id),  -- the build fixes the platform
  submitted_at TIMESTAMPTZ NOT NULL,
  result TEXT CHECK (result IN ('passed', 'failed', 'withdrawn')),  -- null while pending
  failure_notes TEXT,              -- requirement identifiers cited, under the platform's NDA
  decided_at TIMESTAMPTZ
);
```

Two state machines run over these rows. `pipeline_state` moves from `queued` through `syncing`, `compiling`, `cooking`, `packaging` and `testing` to `passed` or `failed`, written by the farm. `promotion` is a separate, human-approved path: a passed build becomes a `candidate`, is `submitted` and `certified` per platform, and is `released` or `withdrawn`. Keep them apart: a build that passed every test is not a release until someone promotes it, and every promotion is recorded with who did it ([Audit Trails](/docs/architecture/audit-trails)). Only a `passed` build can become a `candidate`, and the release a channel serves points at a promoted build ([Patching & Content Delivery](/books/gaming/patching#how-to-build-it)), so nothing reaches players that the farm didn't build and test.

Three smaller decisions make the tables useful later:

- **Crash groups regress.** A group marked `fixed` names the build that fixed it; a report from that build or a later one reopens the group instead of counting quietly toward a closed issue.
- **The engine version is a column,** not a note in a wiki, because an engine upgrade is when crash signatures, cook output and license terms change ([The Engine Landscape](/books/gaming/engine-landscape#unity) shows why the terms matter).
- **A crash report names an account only when the player was signed in,** and its minidump expires on the retention schedule while the symbolicated stack and the counts stay.

## What This Means for the System You Build

- **Source control with tool-enforced locks** for binary assets, generated files kept out, and caches near every office.
- **A branch per release,** fixes merged forward from the oldest branch that needs them, content locks, and dark features behind flags.
- **Deterministic, cached cooking** keyed on every input, with asset validation at import and cook time.
- **Localization as a pipeline step:** text gathered and checked on the farm, a pseudo-locale (CJK included) in automated runs, font atlases in the memory budget, languages in their own chunks, and an LQA pass on localized builds.
- **A build graph on a farm** with compile and cook caches, warm agents and an hour or less from check-in to results, measured and tracked.
- **Tiered automated tests,** including bots, replays, soak and performance runs against budgets on reference hardware, with flaky tests quarantined.
- **Human QA tied to builds:** functional, compliance and compatibility passes (in-house or a vendor), and playtests on builds that are recorded like any other, with every bug naming where it was found and where its fix was verified.
- **Symbols uploaded for every build** that can reach a player, crash reports captured out of process, symbolicated, grouped and treated as personal data.
- **Profiling hooks** that compile out of shipping builds and write a standard trace format.
- **A promotion path** from candidate to certified to released, recorded per platform, with certification time in the calendar.
- **Platform services behind interfaces,** so a port adds a platform target and an implementation, and the platform program's agreement is signed before the port is scheduled.

## References

**Specifications**

- [Xbox: Xbox Requirements](https://devdocs.xbox.com/publishing/certification/xbox-requirements), what XRs are, the asterisk for certification-tested requirements, which devices they cover and rejected submissions; XR-003 on localization support and legibility, XR-022 on the Terminology List
- [Xbox: XR-022 Official Naming Standards](https://devdocs.xbox.com/publishing/certification/xr/xr-022), a published requirement with its numbered test case
- [Steamworks: Review process](https://partner.steamgames.com/doc/store/review_process), store page and build review times, the seven-day planning advice and what the build review checks
- [State Council of China: Notice publishing the Table of General Standard Chinese Characters](https://www.gov.cn/zwgk/2013-08/19/content_2469793.htm), the 2013 notice (国发〔2013〕23号) issuing the table
- [Wikisource: 通用规范汉字表](https://zh.wikisource.org/wiki/%E9%80%9A%E7%94%A8%E8%A7%84%E8%8C%83%E6%B1%89%E5%AD%97%E8%A1%A8), the table's text: 8,105 characters, 3,500 in the first-level table of common characters

**Reference**

- [Unreal Engine: Using Perforce as source control](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-perforce-as-source-control-for-unreal-engine), unmergeable binary assets and editor locking on checkout
- [Perforce: P4](https://www.perforce.com/products/helix-core), exclusive file locking, proxy and edge servers and the vendor's AAA adoption claim
- [Git LFS](https://git-lfs.com/), large files replaced with pointers and stored on a separate server
- [Git LFS: File Locking](https://github.com/git-lfs/git-lfs/wiki/File-Locking), lockable patterns, read-only checkout and push-time lock checks
- [Unity: Unity Version Control](https://unity.com/solutions/version-control), the Plastic SCM rebrand, locking with Smart Locks, branching and artist workflows
- [Unreal Engine: Cooking content](https://dev.epicgames.com/documentation/en-us/unreal-engine/cooking-content-in-unreal-engine), the definition of cooking
- [Unreal Engine: Packaging your project](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project), build, cook, stage and package, pak archives and chunks
- [Steamworks: Uploading to Steam](https://partner.steamgames.com/doc/sdk/uploading), SteamPipe chunking and pack file guidance for small patches
- [Unreal Engine: Localization tools](https://dev.epicgames.com/documentation/en-us/unreal-engine/localization-tools-in-unreal-engine), the Localization Dashboard, gather, export, import and compile, and the PO pipeline
- [Unreal Engine: Text localization](https://dev.epicgames.com/documentation/en-us/unreal-engine/text-localization-in-unreal-engine), namespaces and keys, String Tables, and plural, gender and hpp argument modifiers
- [Unreal Engine: FCompositeSubFont](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/SlateCore/FCompositeSubFont), composite sub-fonts by character range and culture
- [Unreal Engine: Using fonts with UMG](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-fonts-with-umg-in-unreal-engine), UMG supporting only runtime-cached fonts
- [Unity: Localization package](https://docs.unity3d.com/Packages/com.unity.localization@1.5/manual/index.html), string and asset localization, Smart Strings, pseudo-localization and XLIFF, CSV and Google Sheets
- [Unity: TextMesh Pro fallback font assets](https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/FontAssetsFallback.html), atlas glyph limits, the fallback search order and CJK character sets
- [Steamworks: Languages supported on Steam](https://partner.steamgames.com/doc/store/localization/languages), declaring supported languages and English as the fallback language
- [Speech Graphics](https://www.speech-graphics.com/), audio-driven lip sync with SGX and FaceFX
- [Steamworks: Playtest](https://partner.steamgames.com/doc/features/playtest), the child app ID, limited and open sign-up, random selection, no reviews, no confidentiality and feedback collection
- [Xbox Research](https://xbox.com/community/research), age limit, remote and onsite studies and their locations
- [PlayStation Research](https://research.playstation.com/en-gb/home), confidential playtests and interviews, sometimes compensated
- [Microsoft: Publish on Xbox (ID@Xbox)](https://developer.microsoft.com/en-US/games/publish), what ID@Xbox offers and its age, NDA and country requirements
- [Sony Interactive: Showing your Game to PlayStation](https://sonyinteractive.com/en/?p=3011416), PlayStation Partners registration, approval and the GDPA
- [Nintendo Developer Portal](https://developer.nintendo.com/), registration for individuals and companies
- [Nintendo Developer Portal: The Process](https://developer.nintendo.com/the-process), the NDA and terms, the separate Switch application and review before sale
- [Unreal Engine: BuildGraph](https://dev.epicgames.com/documentation/en-us/unreal-engine/buildgraph-for-unreal-engine), XML build graphs and distribution across agents
- [Unreal Engine: Horde](https://dev.epicgames.com/documentation/en-us/unreal-engine/horde-in-unreal-engine), CI for large Perforce repositories, remote execution, test results and analytics
- [Incredibuild](https://www.incredibuild.com/), distributed compilation, shared caching and the Bandai Namco case figure
- [Unreal Engine: Crash reporting](https://dev.epicgames.com/documentation/en-us/unreal-engine/crash-reporting-in-unreal-engine), the Crash Report Client, DataRouterUrl and packaged-build reports since UE 5.4
- [Sentry: Unreal Engine](https://docs.sentry.io/platforms/unreal/), crash capture options, minidump defaults and supported platforms including consoles
- [Sentry: Debug information files](https://docs.sentry.io/platforms/native/data-management/debug-files/), symbol formats, debug identifiers and symbol servers
- [Sauce Labs: Unreal Engine error reporting setup](https://docs.saucelabs.com/error-reporting/platform-integrations/unreal/setup/), Backtrace's Unreal integration through the crash reporter
- [Unreal Engine: Gauntlet automation framework overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/gauntlet-automation-framework-overview-in-unreal-engine), sessions of several clients and a server from a cooked build, with log and crash parsing
- [Unreal Engine: Unreal Insights](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-insights-in-unreal-engine), the telemetry capture and analysis suite
- [Unreal Engine: Developer guide to tracing](https://dev.epicgames.com/documentation/en-us/unreal-engine/developer-guide-to-tracing-in-unreal-engine), the `TRACE_CPUPROFILER_EVENT_SCOPE` macros, opt-in channels and macros that compile to nothing when Trace is off
- [Tracy Profiler](https://github.com/wolfpld/tracy), a hybrid frame and sampling profiler for games covering CPU, GPU, allocations and locks
- [Microsoft: Introduction to PIX](https://devblogs.microsoft.com/pix/introduction/), GPU and timing captures for DirectX 12 on Windows and Xbox
- [RenderDoc](https://renderdoc.org/), the MIT-licensed frame debugger and its supported APIs and platforms

**In practice**

- [EA SEED: Applying machine learning research to AAA game testing](https://www.ea.com/seed/news/seed-ml-research-aaa-game-testing), the Battlefield V manual-testing estimate, the limits of scripted bots and RL test agents in Battlefield V and Dead Space
- [Microsoft Learn: Automated Testing of Shader Code (Pure Virtual C++ 2024)](https://learn.microsoft.com/en-us/shows/pure-virtual-cpp-2024/automated-testing-of-shader-code), Rare's hundreds of thousands of automated tests on Sea of Thieves
- [Riot Games: Automated Testing for League of Legends](https://www.riotgames.com/en/news/automated-testing-league-legends), test volume and run time per build, time to results, patch cadence and the eight-times-faster resolution of automation-found bugs
- [Riot Games: Legends of Runeterra CI/CD pipeline](https://www.riotgames.com/en/news/legends-runeterra-cicd-pipeline), the move from Perforce to Git LFS, repository size, Jenkins, run counts and test stages
- [Riot Games: Random Acts of Optimization](https://www.riotgames.com/en/news/random-acts-optimization), compiled-out instrumentation, Chrome tracing and VTune
- [Room 8 Studio: How to submit a game to the store from the first attempt](https://room8studio.com/news/how-to-submit-game-to-store-from-the-first-attempt-game-porting-tips), the Nintendo Switch submission procedure called Lotcheck (secondary)
- [iXie Gaming: Console compliance testing](https://www.ixiegaming.com/console-compliance-testing/), a QA vendor naming Sony's TRC (secondary)
- [New Zealand MFAT: Entering China's mobile gaming market](https://www.mfat.govt.nz/cn/trade/mfat-market-reports/entering-chinas-mobile-gaming-market-a-guide-to-licensing-and-regulatory-approval), September 2026 report: full Simplified Chinese localization as part of the ISBN application, and the publisher's license
- [Keywords Studios](https://www.keywordsstudios.com/en/), QA testing and game localization in the Globalize division
- [Side: PTW rebrands as Side](https://pressreleases.triplepointpr.com/?p=26899), the March 2025 rebrand, more than 40 studios, and services including QA, localization QA and player support
- [Testronic](https://www.testroniclabs.com/), functional, compliance, compatibility and localization QA
- [Video Games Chronicle: Virtuos](https://www.videogameschronicle.com/companies/virtuos), co-development and remastering, and its Switch and console credits
- [Panic Button](https://www.panicbuttongames.com/), featured multiplatform work
- [Iron Galaxy: Games](https://www.irongalaxystudios.com/games), co-development projects
