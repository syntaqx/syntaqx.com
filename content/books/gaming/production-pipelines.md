+++
title = "Production Pipelines & Builds"
nav_title = "Pipelines & Builds"
description = "How a game gets from check-in to a certified build: large-binary source control, cooking, build farms, test automation, crash symbolication and console cert."
category = "Gaming Industry"
order = 1604
part = "How Games Get Made"
tags = ["gaming", "build-pipelines", "ci", "source-control", "crash-reporting"]
+++

A game's source is mostly not code. It is textures, meshes, animations, audio, levels and the data that ties them together, measured in hundreds of gigabytes, edited by artists who can't merge their work, and converted into a different form for every platform before anyone can play it. The production pipeline is everything between a person saving a file and a player running the result: source control, asset conversion, build farms, automated tests, crash reporting, profiling and the certification gates platform holders run before a build can ship.

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

Perforce's long hold on AAA is about scale and locking: one server holds the whole depot, artists see a simple checkout model, and large studios run proxies near each office. Git's appeal is the tooling programmers already use, especially CI on branches and pull requests. Riot's Legends of Runeterra team published a clean example of choosing between them: the game started on Perforce, and the team moved to Git because of "pain points with Unity's Perforce integration" and to get "better CI/CD capabilities for changes that haven't made it to the main branch yet." As of May 2021 the repository was a single Git LFS monorepo of about 100 GB and about 1,000,000 files, with Artifactory as the LFS store.

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

## Build Farms and CI

Building a game for several platforms is too slow for one machine, so the work is described as a **graph** and spread across a farm. Epic's BuildGraph is "a script-based build automation system that features graphs of building blocks," written in XML: nodes with dependencies, each producing outputs. For a distributed build, the graph is exported as JSON, each machine runs nodes, all sync the same changelist, and outputs pass between machines through a shared network location, running in parallel wherever dependencies allow.

Above that sit the systems that schedule the graph and remember the results:

- **Horde** is "a set of services supporting workflows Epic Games uses to develop Fortnite, Unreal Engine, and other projects": build automation "designed for teams working with large Perforce repositories," remote execution including "C++ compilation with Unreal Build Accelerator," a front end for automation test results, and analytics from editor telemetry.
- **Incredibuild** sells compile distribution and caching: it pools "idle CPUs you already own across your network or public cloud into a high throughput cluster" and reuses a shared cache "organization-wide to eliminate redundant build tasks." Its published case figure for Bandai Namco Studios is compilation falling from 50 to 18 minutes; that's a vendor case study, not an independent benchmark.
- **General CI systems** work too. Riot's Runeterra pipeline, as of May 2021, ran Jenkins scripted pipelines with build logic in Python, about 100 full pipeline runs a day building Windows, Android and iOS in one run, with an average pipeline of about 60 minutes on AWS build nodes (100 Windows t3.2xlarge, 5 Ubuntu m4.2xlarge and 2 mac1.metal machines).

![A dimensional timeline of one change moving through a build farm at 9 px per minute. The main lane runs seven stages from check-in to results: S1 queue and sync 3 minutes, S2 compile 14, S3 cook 12, S4 package 6, S5 deploy to test machines 4, S6 automated tests 18 (highlighted, from Riot's 2016 League figure) and S7 report 3, totaling B1 = 60 minutes. A side lane uploads symbols and the build for 5 minutes after packaging, off the critical path. A variable table marks every value illustrative except S6.](/diagrams/gm-production-pipelines-build.svg "One change, check-in to results (illustrative except the test stage). An hour is the figure both Riot posts land near; shortening it means attacking the longest stages, not the side lane.")

The stage split in the drawing is illustrative; the total and the test stage match Riot's published figures. The shape is what matters. The critical path runs through compile, cook and tests; uploads of symbols and artifacts run beside it. To shorten the loop:

- **Cache compile and cook output** by input hash, so a change rebuilds only what it touches.
- **Split the graph** per platform and per content chunk so independent nodes run on separate agents.
- **Tier the tests:** a fast smoke set on every change, the full suite on a cadence, long soak and performance runs nightly.
- **Keep agents warm,** with source synced and caches local, because a cold agent can spend longer syncing than building.

[CI & Continuous Deployment](/docs/delivery/ci-pipelines) covers the general practice. What's different here is scale: a game's CI is a farm, and its cost and queue time are worth tracking like any production service.

## Automated Testing at Scale

Games were long tested mostly by hand, and manual testing remains essential for whether something is fun or readable. Regressions are a different problem, and Riot's 2016 post "Automated Testing for League of Legends" shows what automating them looks like at the scale of a live game:

- "Well over 100 code and content changes" checked in every day, on the two-week patch cadence above.
- The build verification system (BVS) runs about 5,500 test cases in about 18 minutes for every new build, about 100,000 test cases a day, and "reports back within about an hour of check-in."
- Tests and harness are written in Python.
- "50 percent of all critical or blocker level bugs are discovered by the BVS," and "bugs discovered in automation get resolved eight times faster than the average bug."

The last figure is the argument for automation: a failure tied to a specific build, an hour after the change, points at a handful of check-ins, while a bug found by a person a week later points at hundreds.

The test layers in a game pipeline, using Runeterra's published stages as the example: static analysis, asset validation, unit tests (C# xUnit there), automated performance tests against the mobile memory budget, and functional tests with pytest against game servers alone or with headless clients. Unreal's equivalents are its Automation Tool and Gauntlet, whose results Horde collects across streams and projects.

Games add test types web services rarely need:

- **Headless clients and bots** that play scripted matches against a real server.
- **Replay tests** that feed a recorded game's inputs into a new build and compare the outcome, which needs a deterministic simulation ([Building Your Own Engine](/books/gaming/building-an-engine#determinism)); Riot's Delta Checker began as exactly this.
- **Soak tests** that run a client or server for hours to find leaks and fragmentation.
- **Device farms** for the spread of phones and PC hardware nobody can cover by hand.

Flaky tests are worse in games than elsewhere, because timing, frame rate and GPU drivers vary. Quarantine a flaky test immediately and fix it, or the farm teaches everyone to ignore red ([Testing Strategy](/docs/engineering/testing)).

## Crash Reporting and Symbolication

A game crashes on hardware you don't own, with drivers you didn't test, and the crash report is often the only evidence. The pipeline:

1. **Capture out of process.** A crashed process can't be trusted to report on itself, so the engine launches a separate handler. Unreal's Crash Report Client "is a separate program"; it collects a minidump (the stack of each thread, register state and selected memory), logs and context, and sends them to whatever server `DataRouterUrl` in `[CrashReportClient]` names. "As of UE 5.4, Epic Games does not receive reports from packaged builds"; the engine ships no server, and Epic's docs point to Backtrace, BugSplat and Sentry.
2. **Receive and store.** Sentry's Unreal integration replaces or works with the engine's client (from UE 5.2 you pick one; "the two are mutually exclusive"), and covers Windows, Linux, macOS, iOS and Android, plus PlayStation, Xbox and Nintendo Switch. By default Sentry uses minidumps only to create events and then drops them; storing them as attachments is opt-in.
3. **Symbolicate.** A minidump holds addresses. Turning them into functions, files and line numbers needs the debug information files from the exact build: PDBs on Windows, dSYMs on Apple platforms, ELF symbols on Linux and Android, or Breakpad symbols anywhere. Sentry matches them by debug identifiers that "uniquely identify debug information files across builds," from uploads or from a symbol server it downloads from on demand. This is why symbol upload is a pipeline step on every build that might reach a player.
4. **Group.** Reports with the same faulting stack (after stripping addresses and normalizing inlined frames) become one issue, counted by build, platform, GPU and driver, so the team sees "this crash, 4,000 times, only on one driver version" instead of 4,000 reports.

Minidumps contain memory, and memory can contain chat text, names or tokens. Treat them as personal data: collect only what you need, scrub, restrict access and expire them ([GDPR & Privacy](/docs/compliance/gdpr), [Data Retention & Deletion](/docs/architecture/data-retention)). Crash rate per build is defined in [Game Metrics](/books/gaming/game-metrics#technical-health), and it's one of the signals that decides whether a staged rollout widens ([Patching & Content Delivery](/books/gaming/patching#rollouts-rollbacks-and-hotfixes)).

## Profiling

You can't fit a frame budget you can't see. The tools:

- **Unreal Insights,** "a telemetry capture and analysis suite that can capture events from your project at high data rates": CPU and GPU timing, memory, networking, UI, asset loading, cook times and audio.
- **PIX,** Microsoft's "performance tuning and debugging tool for Windows and Xbox game developers using DirectX 12," with GPU captures, timing captures and a system monitor.
- **RenderDoc,** an MIT-licensed single-frame graphics debugger for Vulkan, D3D11, D3D12 and OpenGL on Windows, Linux and Android, with a Switch build distributed through the NintendoSDK.
- **Platform tools** from each console maker, under NDA, and general CPU profilers.

Instrumentation is the other half. Riot's 2015 post "Random Acts of Optimization" describes League's approach: an in-house tool, Waffles, that connects to internal client and server builds and shows live frame-time graphs; instrumentation macros that "for public builds... compile out" but in profile builds record timed events; Chrome's tracing viewer to visualize the captured buffer; and Intel VTune for sampling to find the slowest functions. That's the general pattern: scoped timers that cost nothing in shipping builds, a capture format a standard viewer can read, and a sampling profiler for what the timers don't cover. Riot's VALORANT server post adds per-subsystem telemetry sent to Riot's analytics platform from running servers ([Game Servers & Hosting](/books/gaming/game-servers)).

## Performance Budgets

A budget only works if a build can fail it. Set budgets per platform and subsystem (milliseconds of frame time, megabytes of memory, load time, install size, draw calls), and check them in the pipeline:

| Budget | Measured by | Fails the build when |
| --- | --- | --- |
| Frame time per subsystem | Automated runs of fixed camera paths or bot matches, with timers | p95 exceeds the subsystem's share of the frame |
| Memory per category | Memory reports at fixed points in a scripted session | Any category exceeds its platform cap |
| Load time | Timed loads of each map on reference hardware | Over the target |
| Install and patch size | Package and patch output | Over target, or a patch much larger than its change |
| Content limits | Cook-time validation | Texture, mesh or audio over its limits |

Runeterra's automated performance tests against its mobile memory budget are this pattern in practice. Two details make it work: measure on reference hardware, the low end you promised to support, not the build machine; and compare against the last good build as well as the absolute budget, so a slow creep of 2% a week gets caught before it adds up. The budget figures themselves come from the frame budget ([Building Your Own Engine](/books/gaming/building-an-engine#the-frame-budget)), and their history is the evidence for every argument about adding a feature.

## Platform Certification

Before a game or patch ships on a console, the platform holder tests it against its requirements. This is the slowest gate in the pipeline, and it's mostly confidential.

Microsoft publishes the most. The Xbox Requirements (XRs) "consist of the policies, technical requirements, and product component-related requirements" every Xbox title must meet; "XRs that are tested in Certification are identified with an asterisk"; unless noted they apply to games on "XBOX One, XBOX Series X|S console generations, xCloud, and PC"; and "inaccurate and incomplete submissions will be rejected from Certification." Retired XRs are removed, so the numbering has gaps.

Sony's and Nintendo's requirements and submission processes are available only to licensed developers under NDA, through their developer portals. That's all that can be said about them publicly, and it's all this book says.

PC stores have lighter gates. Steam reviews the store page and the build separately, each "typically 3-5 business days," and asks you to plan for at least 7 business days; the build must start up properly, implement every feature the store page lists, and use Steam Wallet for in-game transactions.

What the pipeline needs for certification, whatever the platform:

- **A release candidate build** promoted from a passing pipeline run, never rebuilt for submission, so what was tested is what ships.
- **Requirement checks in the pipeline** for whatever can be automated (save data handling, account and network state changes, suspend and resume), run long before submission.
- **A submission record** per platform: build ID, date, result, the requirements cited in any failure, and the fix.
- **Calendar slack.** A patch date that depends on passing certification on the first try is a guess. Plan for a failure and a resubmission, and coordinate the date with the store's own review time.

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

Two state machines run over these rows. `pipeline_state` moves from `queued` through `syncing`, `compiling`, `cooking`, `packaging` and `testing` to `passed` or `failed`, written by the farm. `promotion` is a separate, human-approved path: a passed build becomes a `candidate`, is `submitted` and `certified` per platform, and is `released` or `withdrawn`. Keep them apart: a build that passed every test is not a release until someone promotes it, and every promotion is recorded with who did it ([Audit Trails](/docs/architecture/audit-trails)). Only a `passed` build can become a `candidate`, and the release a channel serves points at a promoted build ([Patching & Content Delivery](/books/gaming/patching#the-data-model)), so nothing reaches players that the farm didn't build and test.

Three smaller decisions make the tables useful later:

- **Crash groups regress.** A group marked `fixed` names the build that fixed it; a report from that build or a later one reopens the group instead of counting quietly toward a closed issue.
- **The engine version is a column,** not a note in a wiki, because an engine upgrade is when crash signatures, cook output and license terms change ([The Engine Landscape](/books/gaming/engine-landscape#unity) shows why the terms matter).
- **A crash report names an account only when the player was signed in,** and its minidump expires on the retention schedule while the symbolicated stack and the counts stay.

## What This Means for the System You Build

- **Source control with tool-enforced locks** for binary assets, generated files kept out, and caches near every office.
- **A branch per release,** fixes merged forward from the oldest branch that needs them, content locks, and dark features behind flags.
- **Deterministic, cached cooking** keyed on every input, with asset validation at import and cook time.
- **A build graph on a farm** with compile and cook caches, warm agents and an hour or less from check-in to results, measured and tracked.
- **Tiered automated tests,** including bots, replays, soak and performance runs against budgets on reference hardware, with flaky tests quarantined.
- **Symbols uploaded for every build** that can reach a player, crash reports captured out of process, symbolicated, grouped and treated as personal data.
- **Profiling hooks** that compile out of shipping builds and write a standard trace format.
- **A promotion path** from candidate to certified to released, recorded per platform, with certification time in the calendar.

## References

**Specifications**

- [Xbox: Xbox Requirements](https://devdocs.xbox.com/publishing/certification/xbox-requirements), what XRs are, the asterisk for certification-tested requirements, which devices they cover and rejected submissions
- [Steamworks: Review process](https://partner.steamgames.com/doc/store/review_process), store page and build review times, the seven-day planning advice and what the build review checks

**Reference**

- [Unreal Engine: Using Perforce as source control](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-perforce-as-source-control-for-unreal-engine), unmergeable binary assets and editor locking on checkout
- [Perforce: P4](https://www.perforce.com/products/helix-core), exclusive file locking, proxy and edge servers and the vendor's AAA adoption claim
- [Git LFS](https://git-lfs.com/), large files replaced with pointers and stored on a separate server
- [Git LFS: File Locking](https://github.com/git-lfs/git-lfs/wiki/File-Locking), lockable patterns, read-only checkout and push-time lock checks
- [Unity: Unity Version Control](https://unity.com/solutions/version-control), the Plastic SCM rebrand, locking with Smart Locks, branching and artist workflows
- [Unreal Engine: Cooking content](https://dev.epicgames.com/documentation/en-us/unreal-engine/cooking-content-in-unreal-engine), the definition of cooking
- [Unreal Engine: Packaging your project](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project), build, cook, stage and package, pak archives and chunks
- [Steamworks: Uploading to Steam](https://partner.steamgames.com/doc/sdk/uploading), SteamPipe chunking and pack file guidance for small patches
- [Unreal Engine: BuildGraph](https://dev.epicgames.com/documentation/en-us/unreal-engine/buildgraph-for-unreal-engine), XML build graphs and distribution across agents
- [Unreal Engine: Horde](https://dev.epicgames.com/documentation/en-us/unreal-engine/horde-in-unreal-engine), CI for large Perforce repositories, remote execution, test results and analytics
- [Incredibuild](https://www.incredibuild.com/), distributed compilation, shared caching and the Bandai Namco case figure
- [Unreal Engine: Crash reporting](https://dev.epicgames.com/documentation/en-us/unreal-engine/crash-reporting-in-unreal-engine), the Crash Report Client, DataRouterUrl and packaged-build reports since UE 5.4
- [Sentry: Unreal Engine](https://docs.sentry.io/platforms/unreal/), crash capture options, minidump defaults and supported platforms including consoles
- [Sentry: Debug information files](https://docs.sentry.io/platforms/native/data-management/debug-files/), symbol formats, debug identifiers and symbol servers
- [Sauce Labs: Unreal Engine error reporting setup](https://docs.saucelabs.com/error-reporting/platform-integrations/unreal/setup/), Backtrace's Unreal integration through the crash reporter
- [Unreal Engine: Unreal Insights](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-insights-in-unreal-engine), the telemetry capture and analysis suite
- [Microsoft: Introduction to PIX](https://devblogs.microsoft.com/pix/introduction/), GPU and timing captures for DirectX 12 on Windows and Xbox
- [RenderDoc](https://renderdoc.org/), the MIT-licensed frame debugger and its supported APIs and platforms

**In practice**

- [Riot Games: Automated Testing for League of Legends](https://www.riotgames.com/en/news/automated-testing-league-legends), test volumes, run time, time to results, patch cadence and the value of automation-found bugs
- [Riot Games: Legends of Runeterra CI/CD pipeline](https://www.riotgames.com/en/news/legends-runeterra-cicd-pipeline), the move from Perforce to Git LFS, repository size, Jenkins, run counts, build nodes and test stages
- [Riot Games: Random Acts of Optimization](https://www.riotgames.com/en/news/random-acts-optimization), the Waffles tool, compiled-out instrumentation, Chrome tracing and VTune
- [Riot Games: VALORANT's 128-Tick Servers](https://www.riotgames.com/en/news/valorants-128-tick-servers), per-subsystem server telemetry
