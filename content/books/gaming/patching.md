+++
title = "Patching & Content Delivery"
description = "Getting a new build onto millions of machines: binary deltas vs content-defined chunks, Riot's 2019 League patcher, platform rules, CDNs, signing, rollouts."
category = "Gaming Industry"
order = 1606
part = "Clients and Delivery"
tags = ["gaming", "patching", "content-delivery", "cdn", "chunking", "updates", "rollouts"]
+++

A live game ships a new version every few weeks, sometimes every two, and hotfixes in between. Each release has to reach every player's machine before they can play, it competes with every other download on their connection, and when it fails the player can't play at all. Patching is where a game's release process meets the player's disk, and it's judged on four things: how many bytes the player downloads, how long the update takes, how often it fails, and how quickly the studio can push, stop or reverse a release.

This chapter covers the two families of patching technique, the most detailed public account of a game patcher (Riot's 2019 redesign of the League of Legends patcher), how platforms deliver updates (Steam, Xbox and Windows, mobile stores, Unreal and Unity), and the parts every patcher needs whatever it's built on: CDNs, integrity and signing, staged rollouts and rollbacks, version compatibility and play while downloading. Building the content in the first place (cooking, build farms, deterministic output) belongs to [Production Pipelines & Builds](/books/gaming/production-pipelines); the client that runs the patcher belongs to [Game Clients & Launchers](/books/gaming/game-clients); release calendars and hotfix decisions belong to [Live Operations](/books/gaming/live-operations).

## The Problem

Four pressures pull against each other:

- **Size.** Every byte is paid twice: by the studio in CDN egress and by the player in time and, on metered or mobile connections, money. A small balance change shouldn't cost a gigabyte.
- **Speed.** The player is waiting, often at a moment they chose to play. Download speed matters, but so do the local steps: verifying files, decompressing, applying patches and writing to disk.
- **Reliability.** An update that fails halfway must leave the install in a known state and resume, and an install damaged by a crash, a full disk or antivirus software must be repairable without a full reinstall.
- **Rollout.** The studio needs to publish quickly (a hotfix is worth more an hour earlier), stage releases, stop a bad one, and keep the game servers, the clients and the platform stores in agreement about which versions may play together.

A design that minimizes size by computing precise patches between versions tends to make publishing slow and players who skipped versions expensive. A design that publishes fast and serves everyone from one layout tends to download more bytes. Most of this chapter is about where to sit on that curve.

## Two Families: Deltas and Chunks

### Binary Deltas

A binary delta encodes a new file as instructions against an old one: copy these ranges, insert these bytes. The tools have improved steadily:

- **bsdiff,** Colin Percival's tool, uses suffix sorting and "routinely produces binary patches 50-80% smaller than those produced by Xdelta." It's memory-hungry when building patches, needing max(17n, 9n+m) bytes for an old file of n bytes and a new one of m, while applying (bspatch) needs n+m and runs in linear time.
- **Courgette,** Chromium's updater, disassembles both executables, adjusts the new one's internal pointers to match the old, then runs bsdiff on the result. Its example update for Chrome was 10,385,920 bytes as a full download, 704,512 as a bsdiff patch and 78,848 with Courgette. Chromium's reason is worth quoting for any client: smaller updates narrow "the window of vulnerability."
- **zstd `--patch-from`** treats the old file as a compression dictionary (up to 2 GB), with long-range matching. Its maintainers report patches comparable to bsdiff at level 19, and much faster creation: over 200 times faster than bsdiff at level 1 and over 100 times at level 3.
- **Google Play's File-by-File patching** (2016) decompresses the files inside old and new packages, diffs the uncompressed contents with bsdiff and recompresses on the device. bsdiff alone had cut updates by 47% on average; File-by-File made them "on average, 65% smaller than the full app," at a cost of "a little over a second per megabyte" of recompression on 2016 phones.

Deltas are the smallest possible download for one known old version to one new one. Their costs are structural. A studio needs a patch from every version players might have, so it builds and stores N patches per release, and players further behind get full files. Every patch must be applied to exactly the right old bytes, so a damaged file breaks the update. And publishing waits for the diff jobs. Compressed or encrypted inputs defeat naive diffing, which is why Courgette and File-by-File both undo the transformation before diffing.

### Content-Defined Chunks

Content-defined chunking (CDC) splits files into variable-size chunks at boundaries chosen by the content itself. A rolling hash runs over the bytes, and a chunk ends wherever the hash meets a condition, for example its low 16 bits being zero, which gives chunks of about 64 KB on average. Because boundaries depend on nearby bytes rather than offsets, inserting data shifts only the chunks around the change; everything after it resynchronizes. Each chunk is named by a hash of its contents, so identical chunks deduplicate across files and versions, and a release is just a list of chunk hashes per file: a manifest.

The client's job becomes simple: read the new manifest, see which chunks it already has, download the rest. There's no per-version patch; any old version, a damaged install or an empty disk updates the same way. Server work is one pass over the new release.

The chunking algorithms are well studied. FastCDC (USENIX ATC 2016) is "about 10x faster than the best of open-source Rabin-based CDC" and "about 3x faster than the state-of-the-art Gear- and AE-based CDC," with nearly the same deduplication, by simplifying the hash check, skipping cut points below a minimum size and normalizing chunk sizes into a narrow range. casync (2017) uses a buzhash rolling hash with a 64K default average, names chunks by SHA-256 and compresses each with xz, aiming to "be friendly to Content Delivery Networks (CDNs)." zsync showed the server side of the idea in its paper: it "uses the rsync algorithm, but implemented on the client side," so "only one-off pre-calculations are required on the server, and no special server software."

The cost is granularity: a one-byte change costs a whole chunk, so chunked downloads run somewhat larger than a perfect delta.

| | Binary deltas | Content-defined chunks |
| --- | --- | --- |
| Download size | Smallest for a known old version | Slightly larger: changed chunks in full |
| Players far behind | Full files, or many patches | Same mechanism, proportional to change |
| Publish work | One diff per supported old version | One pass over the new release |
| Repair | Separate mechanism | Same mechanism: fetch missing or bad chunks |
| Rollback | Needs reverse patches | Point at the old manifest |
| Server | Static files | Static files with range requests |

## The League Patcher, 2019

Riot's July 30, 2019 post "Supercharging Data Delivery: The New League Patcher," by Javier Blazquez of League's Core Tech team, describes a move from the first family to the second in production, with results. Everything in this section is from that post.

**The old system.** For eight years League used RADS (Riot Application Distribution System), a binary-delta patcher using a JojoDiff-style tool. Each release carried patches from each of the previous eight versions to the latest; players further behind downloaded whole files. Generating a release meant diffing each file in the Game folder (only about 400 files, but large ones) against its eight previous versions, compressing and bundling the patches, compressing every original file for clients that couldn't patch, then uploading to a staging server and syncing to each CDN origin, which took several hours.

**Chunking.** The new patcher uses a content-defined chunker based on FastCDC, hashing at over 1 GB/s per core. The post's example is the one above: for 64 KB average chunks, split wherever the hash ends in 16 zero bits. A chunk's 64-bit hash is its identifier, and deduplication removes almost 10% of chunks. Each chunk is compressed on its own with Zstandard at level 19; LZMA compresses better but costs much more CPU to decompress, and players decompress while downloading. The tradeoff is the one above: "if even a single byte in a chunk has changed," the whole chunk downloads again, and patch sizes stayed "reasonably close" to RADS.

**Bundles.** Hundreds of thousands of small objects would make a slow download and a poor CDN cache, so the patcher groups chunks into bundles: League's data is over 300,000 chunks in fewer than 5,000 bundles, so a full download needs no more than 5,000 HTTP requests. Bundles have 64-bit IDs too, and each version shares over 85% of its bundles with the previous one, so most of a release is already cached at the edge.

**Manifest and publishing.** A release is described by a manifest of about 8 MB in the FlatBuffers binary format. It's uploaded to a C++ service called patchdata-service on AWS, which validates it, deploys it to S3 as the CDN origin and signs it; clients load only signed manifests. Generation is multithreaded, makes one pass over the new data and skips bundles already on the CDN, so a new League version deploys in "less than a minute instead of the five hours it used to take." The post notes what that means for hotfixes. Because chunk lists are precomputed and nothing has to be computed per client, no special server is involved, which the author compares to zsync rather than rsync.

**The client.** Local state lives in a small SQLite database, `Game.db`, recording files and chunks; it's a cache that can be rebuilt from disk, chosen for atomic commits. Each launch checks that files exist with the expected size and timestamp, which takes on the order of 100 ms; a full content scan runs only when a player asks for a full repair. Updates write files in place, in slices of up to 64 MB aligned to chunk boundaries, committing the database after each slice, so an interrupted update always leaves a known state. Downloads cap at 128 MB in flight over 8 concurrent HTTP/1.1 connections using multipart range requests; A/B tests found 8 the best count, "more than doubling download speeds for many players" against one connection. Connections spread across CDN edge servers and, where possible, several CDN providers, and the client queries DNS every minute to refresh its server list. Network errors aren't fatal: requests retry with a delay, and an update is cancelled only after a couple of minutes without progress. Riot didn't use HTTP/2 because of libcurl issues that would hurt speeds, and expected HTTP/3 to allow fewer connections. A partial repair rechunks only files that look inconsistent with the database; a full repair takes under two minutes on average.

![Exploded axonometric of one chunked release in four plates. At the top, highlighted, the release manifest: signed FlatBuffers, about 8 megabytes. Below it the bundles, CDN objects of which over 85 percent are reused from the previous version; then the chunks, content-defined with 64-bit ids and compressed with zstd level 19; then the install on disk, game files plus a SQLite Game.db. Side notes mark the client steps: verify the manifest and diff its chunk list against Game.db, fetch missing chunks by range requests, and write in place. A table lists Riot's figures: over 300,000 chunks, under 5,000 bundles, at most 5,000 requests for a full download, over 85 percent of bundles shared, about 10 percent removed by deduplication, a 64 KB example average chunk, an 8 MB manifest, and 64 MB write slices with 128 MB in flight.](/diagrams/gm-patch-manifest.svg "A chunked release from the top down: the signed manifest says what should exist, bundles are what the CDN serves, chunks are what the client reasons about, and the install is what's on disk. Figures are Riot's, July 2019.")

**Results.** Riot compared the two patchers on patch 9.9. The download grew, and everything else improved:

| Patch 9.9 (Riot) | RADS | New patcher |
| --- | --- | --- |
| Download | 68 MB | 83 MB |
| Average update time | Over 8 minutes | Under 40 seconds |
| Failure rate | 2.2% | 0.3% |
| Time to deploy a release | About 5 hours | Under a minute |

By region, updates were up to 14 times faster and errors fell by up to 95%. The rollout was incremental over several months, with RADS and the new patcher side by side so they could be compared under the same conditions.

![Three plan views compare Riot's published patch 9.9 results for RADS and the new chunked patcher. Average update time: T1 over 480 seconds for RADS against T2 under 40 seconds, so over 12 times faster. Download size: D1 68 megabytes against D2 83 megabytes, 15 megabytes or 22 percent larger. Failed updates: F1 2.2 percent against F2 0.3 percent, about 7.3 times fewer. A variable table also lists deploy time, about 5 hours before and under a minute after.](/diagrams/gm-patch-before-after.svg "Riot's patch 9.9 comparison, drawn to scale. Chunking bought a 22% larger download and paid it back in time, failures and publishing speed.")

The comparison is the strongest public argument for chunking in games: the player's time is spent on more than the download, and a patcher that writes in place, verifies cheaply and never applies a patch to the wrong bytes wins even when it moves more data. The same patcher turned out to be general infrastructure. Riot's Legends of Runeterra team (May 2021) uploads its whole repository ([Production Pipelines & Builds](/books/gaming/production-pipelines#source-control-for-large-binaries) has its size) to "the same chunking patcher" used for game distribution to sync CI build workspaces: about ten to fifteen seconds for an existing workspace, against one to two minutes for Git with LFS. They distribute Unity to build machines the same way.

Riot's support pages describe another new League patcher rolled out in 2025, which moves existing files rather than downloading them again and may use a bit less disk space; I found no engineering write-up of what changed.

## Not Every Fix Is a Client Patch

The fastest patch is the one players don't download. Riot's July 2021 TFT bug blog draws the line: client changes need a full patch, released "at least one of these every 2 weeks," while server-only fixes go out as micropatches, data overrides the game server loads, one of which fixed a broken item in about an hour. The same post shows the cost of the other direction: a mobile-only art fix needed a full patch to the Apple and Android builds, which changed the mobile version number in a cross-play game and had to be tested against PC. For the patcher, the consequence is design-time: put tunable values in server-authoritative data from the start, so fewer fixes need a client download at all. Choosing among full patches, hotfixes, server overrides and config is covered in [Live Operations](/books/gaming/live-operations#four-ways-to-change-a-running-game).

## How Platforms Deliver Updates

On someone else's store, the store's pipeline is the patcher, and content layout decides how well it works.

### Steam

SteamPipe "initially splits each file into roughly one megabyte (MB) chunks" and has "an efficient patching algorithm based on binary deltas." Content is always encrypted. Each depot build produces a manifest with a unique 64-bit ID, and builds go to branches, including private betas; a build set live is downloadable "within a couple of minutes," and you can "push out a new build or rollback to a previous build with just a few clicks." Steam's guidance on pack files is the most useful public advice on patch-friendly layout:

- Keep packs around "one or two gigabytes," with one table of contents near the beginning or end.
- Don't shuffle asset order, don't embed filenames or build timestamps per asset, and add new pack files for new content instead of rewriting old ones.
- Compress per asset rather than compressing a whole pack, and don't encrypt packs without a reason.
- Expect the client to rebuild a changed pack locally: "to update a 25 GB pack file, SteamPipe will always build a new, 25GB file," which costs disk space and time even when the download is small.

For Unreal, Valve's example passes `-patchpaddingalign=1048576 -blocksize=1048576` to the pak tool, aligning assets to Steam's 1 MB chunks.

### Xbox and Windows

Xbox packages (XVC on console, MSIXVC on PC) are "encrypted and integrity protected in 4-KiB blocks," and updates change, insert or remove data in 4 KiB multiples. Microsoft's guidance: align assets to 4 KiB, cluster changes ("It's more efficient to modify 400 KiB than to modify 4 KiB 100 times"), and remember that unchanged data under 64 KiB between changes may download again. "The game can't run between when the update starts installing and when the update finishes installing." `packageutil compare` and `makepkg /priorpackage` estimate an update before publishing.

MSIXVC2, for PC only, changes the model: "Content-based segmentation automatically identifies unchanged data regardless of alignment or layout." Microsoft reports some updates 64 to 94% smaller than MSIXVC, and hash-tree overhead cut by over 90%. As of October 2026 it's generally available, from the October 2026 GDK, after a public preview in the April 2026 GDK, and it's scheduled to become the default PC package format in the April 2027 GDK; consoles stay on XVC.

On Windows, Delivery Optimization is "a reliable HTTP downloader" that can also pull from peers on the local network and Microsoft Connected Cache servers, falling back to HTTP. Its support table lists Xbox Game Pass on PC with HTTP and Connected Cache but not peer-to-peer.

### Mobile

Mobile stores own delivery and set hard limits:

- **Google Play Asset Delivery** offers "auto-updates, compression, and delta patching," with three modes: `install-time` packs arrive with the app, `fast-follow` packs download automatically right after install without the app being opened, and `on-demand` packs download while the app runs. Install-time packs need free space of "at least two times the size of all the asset packs." As of October 2026 the limits are 500 MB for the base module, 1.5 GB per asset pack, 4 GB for everything installed up front, 30 GB for on-demand and fast-follow packs, and "the total maximum compressed download size for apps published on Google Play is 34 GB." Because the app binary can update before its asset packs finish patching, Google tells developers to handle an "Update in progress" state.
- **Apple Background Assets.** At WWDC25 Apple introduced Managed Background Assets, where "the system automatically manages downloads, updates, compression, and more for your asset packs," with Apple hosting (200 GB included in the developer membership) or self-hosting, and three policies: essential (part of install, ready at first launch), prefetch (starts during install, may continue after) and on-demand. Apple said "On-Demand Resources is a legacy technology, and it will be deprecated." On-Demand Resources had limits of 512 MB per tag, 2 GB for initial-install tags and 20 GB hosted, with an ideal tag of 64 MB or less.

The policies and review timelines around mobile releases are covered in [Mobile Releases](/docs/delivery/mobile-releases).

### PlayStation and Nintendo

Sony and Nintendo don't publish their patch rules openly; they live in developer documentation under NDA. Plan for each platform's patch-size and submission rules as constraints you learn when you sign up, and keep content layout patch-friendly so you're not negotiating exceptions.

### Engine Packaging

Engines decide how content is laid out on disk, and so how well any patcher can do:

- **Unreal.** With UE5's Zen loader, staging packs package data, bulk data and shaders into IoStore containers: a `.utoc` table of contents that records "chunk size and offset, compression format," and a `.ucas` file of data "addressed by a chunk ID," with `.pak` files kept for loose, less-accessed files. For its own launcher-style distribution, Epic's BuildPatchServices module builds chunked manifests and can "output the details of the patch" between two manifests, package chunks into chunkdb files, verify chunks against embedded hashes and delete orphaned chunks from a cloud directory.
- **Unity.** Addressables builds on AssetBundles and can serve content from a CDN. At startup it "checks for an updated content catalog," and a content update build, built against the `addressables_content_state.bin` saved from the last release, is what keeps players from having to "download all the remote AssetBundles again." The limit is stated plainly: "Addressables can only distribute content, not code."

## Layout Rules for Patchable Content

Whatever the patcher, these rules decide how big a patch is, and they're cheap to follow from the first build:

- **Deterministic builds.** Identical inputs must produce identical bytes: no timestamps, build machine paths or random ordering in cooked output. Nondeterminism turns every build into a full download ([Production Pipelines & Builds](/books/gaming/production-pipelines)).
- **Stable order and alignment.** Keep asset order stable inside packs, align to the store's block size (1 MB for Steam, 4 KiB for Xbox), and put indexes at one end of the file.
- **Compress per asset, not per pack,** so one change doesn't change every byte after it. Encrypt per asset if you must.
- **Append, don't rewrite.** New content goes into new packs; old packs stay byte-identical.
- **Separate what changes often** (data tables, localization, balance values) from what doesn't (textures, audio), and move what can into server-delivered data.
- **Measure every release's patch size in CI** against the last live build, with a budget, and fail or flag a build that blows it.

## CDNs and the Download Client

Game patches are a CDN's ideal workload: large, static, identical for everyone and requested in bursts at release time. The design choices that matter:

- **Cacheable objects.** Immutable, content-addressed names (chunk or bundle hashes) mean caches never need purging and old versions stay valid. Bundle reuse across versions, over 85% in League's case, means most of a release is warm at the edge before anyone asks.
- **More than one CDN.** Spread connections across providers and refresh the server list regularly, as Riot's patcher does by querying DNS every minute, so one provider's bad day slows players instead of stopping them.
- **A tuned download client.** A few parallel connections (Riot found 8 the best), range requests into larger objects, a cap on bytes in flight, retries with backoff and a progress-based timeout rather than a fixed one ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter)).
- **Release-day load.** Expect a spike when a patch goes live and every launcher wakes up. Pre-position content (publish before go-live), stagger background downloads, and let a preload window absorb the peak; on Steam, "preload updates are delivered as a delta patch from the previous build in the same way they are after release."
- **Peer and local caches** (Delivery Optimization, Connected Cache, LAN caches at events) take load off the internet path where they're available. Microsoft's IT department reports that "more than 76 percent of content came from peer devices" in its own Windows deployment.

## Integrity and Signing

A patcher writes executables to millions of machines, which makes it one of the most valuable targets a studio runs. The attacks an updater has to resist (arbitrary installation, rollback, freeze, mix-and-match, endless data, malicious mirrors, key compromise) and the defenses against them are in [Software Updates](/docs/security/software-updates#what-an-updater-must-resist). A chunked game patcher maps onto them directly:

- **The release manifest is the signed metadata.** Sign it with a key the CDN never holds and load nothing unsigned, as League's patcher does; chunks named by their hashes and listed in it are then verified by content, whoever served them ([Content-Addressed Chunks](/docs/security/software-updates#content-addressed-chunks)).
- **The "current release" pointer per platform and channel** is the short-lived, forward-only part: monotonic release numbers and a short expiry catch a frozen or rolled-back mirror ([Manifests That Only Move Forward](/docs/security/software-updates#manifests-that-only-move-forward)).
- **Chunk and bundle sizes come from the manifest,** so a download stops at the size it promised, which matters more for a 100 GB game than for most software.
- **Keys are separated by role** with the root offline, as [Separate Keys by Role](/docs/security/software-updates#separate-keys-by-role) describes; for a game, the platform holders' own signing on console and mobile sits outside yours, and your keys cover the PC launcher and the content you deliver yourself.

## Rollouts, Rollbacks and Hotfixes

Publish fast, expose slowly. A chunked patcher makes publishing nearly free; what's left is choosing who gets a release when:

- **Channels.** A live channel per platform and region, plus test channels (a public test realm, internal QA, a private beta branch as Steam offers). A channel points at one signed release at a time.
- **Staged exposure.** Move a release to a percentage of players, or a region at a time, and watch update failure rate, crash rate and match health before widening ([Deployment Strategies](/docs/delivery/deployment-strategies#canary); [Mobile Releases](/docs/delivery/mobile-releases#phased-rollouts) for store-managed rollouts). For games where everyone must be on one version to play together, staging happens before go-live (preloads, test realms) more than after it.
- **Rollback by publishing forward.** With content-addressed chunks, rolling back is pointing the channel at the previous manifest, and Riot names quick rollbacks as one of chunking's benefits. Make that a new release record with a higher sequence number that happens to reference the old content, so clients that refuse older manifests (as they should) still accept it. Steam's one-click rollback to a previous build is the same move.
- **Hotfixes** go through the same pipeline, faster. The difference between a five-hour and a one-minute deploy is the difference between a hotfix being an option or a plan for tomorrow. Server-side data overrides, like TFT's micropatches, are faster still and skip the client entirely; [Feature Flags](/docs/delivery/feature-flags#kill-switches) give the same lever for code paths.

## Version Compatibility and Forced Updates

Every release creates version skew: old and new clients, servers and data live at once. Why skew exists and how a live game manages it (Unreal's `FNetworkVersion` checks, cross-play across stores that approve on different schedules, save compatibility) is covered in [Live Operations](/books/gaming/live-operations#version-skew). The delivery system owns three pieces of it:

- **The version a client reports.** Every request from the client and every connection to a game server carries the build and a deliberate network protocol version, bumped when the wire format changes, not on every build, so servers and matchmaking can decide compatibility without guessing ([Matchmaking & Ranked](/books/gaming/matchmaking); [Game Servers & Hosting](/books/gaming/game-servers)).
- **A minimum supported version** per game and platform, the oldest build allowed to sign in or queue. The client checks it at startup and before queueing, and blocks with a clear "update required" screen that starts the update, rather than failing at match start ([Mobile Releases](/docs/delivery/mobile-releases#minimum-supported-versions-and-forced-upgrades)).
- **The go-live switch.** For a game where everyone must move together, the new manifest, the new minimum version and the new server builds flip at one instant, after preloads have put most of the bytes on disk.

## Play While Downloading

The best update is one the player never waits for. Platforms now support it directly:

- **Xbox streaming install** lets a title mark the subset of data "required for the title to start" (the launch set); the title runs as soon as that's installed, the rest installs in the background, and the title can reorder what installs next based on what the player does. Updates can also update chunks individually, and "after the chunks in the launch set have been updated, the title can be launched."
- **Mobile fast-follow and prefetch** (Google's `fast-follow`, Apple's prefetch policy) start downloading the next content right after install, so it's usually there before it's needed.
- **Background patching in launchers.** The Riot Client's opt-in background patching (May 2023) and the EA app's background updates download while the launcher is open, so the game is ready when the player is.

Designing for it means ordering content by when it's needed (the menus and first map before the rest), making missing content a state the game handles (a placeholder, a progress bar, a mode that isn't available yet), and having the client report what's installed so matchmaking doesn't offer a mode whose map isn't on disk.

## How to Build It

A sketch of the release side, extending the core model's `builds` table (its `promotion` path from candidate to released is in [Production Pipelines & Builds](/books/gaming/production-pipelines#recording-builds)):

```sql
-- A signed, published description of one build's content. The build fixes the platform.
CREATE TABLE release_manifests (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  build_id UUID NOT NULL REFERENCES builds (id),
  sequence_number BIGINT NOT NULL,        -- strictly increasing per game and platform
  manifest_sha256 BYTEA NOT NULL,
  signing_key_id TEXT NOT NULL,
  chunk_count INTEGER NOT NULL,
  bundle_count INTEGER NOT NULL,
  total_bytes BIGINT NOT NULL,
  patch_bytes_from_previous BIGINT,       -- measured in CI against the last live release
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE release_channels (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games (id),
  name TEXT NOT NULL,                     -- 'live', 'pbe', 'qa'
  platform TEXT NOT NULL,
  region TEXT,                            -- NULL: every region
  UNIQUE NULLS NOT DISTINCT (tenant_id, game_id, name, platform, region)
);

-- Which manifest a channel serves, to whom, and when. Rollbacks are new rows.
CREATE TABLE channel_releases (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES release_channels (id),
  release_manifest_id UUID NOT NULL REFERENCES release_manifests (id),
  exposure_percent NUMERIC(5, 2) NOT NULL CHECK (exposure_percent BETWEEN 0 AND 100),
  is_rollback BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  valid_during TSTZRANGE NOT NULL,
  approved_by TEXT NOT NULL
);

-- The oldest build allowed to sign in and queue, and the protocol it speaks.
CREATE TABLE client_version_policies (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games (id),
  platform TEXT NOT NULL,
  min_supported_build_id UUID NOT NULL REFERENCES builds (id),
  network_protocol_version INTEGER NOT NULL,
  valid_during TSTZRANGE NOT NULL
);
```

How the rows are used:

- **Publishing** inserts a `release_manifests` row only for a build whose `promotion` is at least `candidate`, under a per-game, per-platform lock that assigns the next `sequence_number`, so two publishes can't take the same number. The manifest is signed before the row commits; an unsigned manifest never has a row.
- **Staged exposure** overlaps rows: during a rollout a channel has the old release at 100% and the new one at, say, 10%. My default for choosing between them is a stable bucket per account, `hash(account_id, channel_id) mod 10000`, on the new release when it's below `exposure_percent × 100`, so a player stays on one side as the percentage widens and support can tell which release anyone was offered. Before sign-in (a fresh install) the bucket comes from an install ID.
- **Rollback** is a new `channel_releases` row pointing at a newer `release_manifests` row that references the old content, with `is_rollback` set and a reason, never an edit of history.
- **Version checks** read the `client_version_policies` row in force now; the client compares its build and protocol version at startup and before queueing.

Ranges keep history: the release a channel served at any moment, and the policy in force when a player was blocked, are both queries ([Temporal Data](/docs/database/temporal-data)). Every change to a channel or policy is an audited decision with an approver ([Audit Trails](/docs/architecture/audit-trails)).

## Auditing

A patcher is a privileged path onto millions of machines, and its records answer what each player was offered and who decided:

- **What was live, where, when?** `channel_releases` ranges give the manifest each channel served at any instant, with exposure and approver; rollbacks are rows with a reason, so the history of an incident reads in order.
- **Was it signed?** No `release_manifests` row exists for an unsigned manifest; signing keys and their use are logged by the signing service, and a key rotation or revocation is a recorded event ([Key Rotation and Compromise Recovery](/docs/security/software-updates#key-rotation-and-compromise-recovery)).
- **Who was blocked, and by which policy?** A player refused at sign-in for an old build is answered by the `client_version_policies` row in force at that time.
- **Which build crashed?** Crash reports and support tickets name the build and manifest, so a regression is a join, not an investigation ([Production Pipelines & Builds](/books/gaming/production-pipelines)).

## What This Means for the System You Build

- **Content-defined chunks and a signed manifest** as the default for your own launcher: any version to latest in one step, repair with the same mechanism, publishing in minutes. Choose deltas only where download size dominates and the version spread is tiny.
- **Patch-friendly content from the first build:** deterministic cooking, stable order, alignment to the store's block size, per-asset compression, append-only packs, and a patch-size budget checked in CI.
- **A download client that survives the internet:** a few parallel connections, range requests, a cap on bytes in flight, retries with backoff, progress-based cancellation, more than one CDN, and in-place writes with an atomic local state database.
- **Integrity against the updater attack list:** offline root keys, signed manifests with increasing sequence numbers and short expiry, content-addressed objects with expected sizes.
- **Channels with staged exposure,** rollbacks as new releases, and a server-data path for fixes that don't need a client patch.
- **Explicit compatibility:** a deliberate network protocol version on every connection, a minimum supported version per platform enforced before queueing, and one go-live switch for manifest, minimum version and server builds.
- **Play while downloading** wherever the platform allows it, with missing content as a state the game handles.

## References

**Specifications**

- [FastCDC (USENIX ATC 2016)](https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia), the chunking algorithm, its speed relative to Rabin and Gear-based CDC, and its three techniques

**Reference**

- [bsdiff](https://www.daemonology.net/bsdiff/), suffix-sorting deltas, patch size against Xdelta and memory use
- [Chromium: Software Updates: Courgette](https://www.chromium.org/developers/design-documents/software-updates-courgette/), disassemble, adjust and diff, with example update sizes and the window of vulnerability
- [Zstandard as a patching engine](https://github.com/facebook/zstd/wiki/Zstandard-as-a-patching-engine), `--patch-from`, the 2 GB dictionary limit and speed against bsdiff
- [casync](http://0pointer.net/blog/casync-a-tool-for-distributing-file-system-images.html), buzhash chunking, 64K average chunks, SHA-256 names and CDN friendliness (June 2017)
- [zsync technical paper](http://zsync.moria.org.uk/paper/), the rsync algorithm on the client and no special server software
- [Steamworks: Uploading to Steam](https://partner.steamgames.com/doc/sdk/uploading), SteamPipe chunks, manifests, branches, rollbacks and pack-file guidance
- [Xbox GDK: Streaming install and Intelligent Delivery](https://devdocs.xbox.com/build/core-features/common/packaging/overviews/streaming_install-intelligent_delivery.md), chunks, the launch set and running before install completes
- [Xbox GDK: Content update best practices](https://devdocs.xbox.com/build/core-features/common/packaging/packaging-updates), 4 KiB blocks, alignment, install-time restrictions and estimation tools
- [Xbox GDK: MSIXVC2 overview](https://devdocs.xbox.com/build/core-features/common/packaging/overviews/packaging-msixvc2-overview), content-based segmentation, update-size reductions and the 2026 to 2027 timeline
- [Microsoft Learn: What is Delivery Optimization?](https://learn.microsoft.com/en-us/windows/deployment/do/waas-delivery-optimization), peer and Connected Cache downloads, Xbox Game Pass support and Microsoft IT's peer share
- [Android Developers: Play Asset Delivery](https://developer.android.com/guide/playcore/asset-delivery), delivery modes, free-space needs and update behavior
- [Google Play Console Help: Maximum size limits](https://support.google.com/googleplay/android-developer/answer/9859372), module, asset pack and total download limits
- [Apple: Discover Apple-Hosted Background Assets (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/325/), managed asset packs, download policies, hosting capacity and On-Demand Resources' deprecation
- [Apple: On-Demand Resources size limits](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/On_Demand_Resources_Guide/PlatformSizesforOn-DemandResources.html), tag, install and hosting limits
- [Epic Games: Zen loader](https://dev.epicgames.com/documentation/unreal-engine/zen-loader-in-unreal-engine?lang=en-US), IoStore containers and chunk-ID addressing
- [Epic Games: IBuildPatchServicesModule](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/BuildPatchServices/IBuildPatchServicesModule), manifest diffing, chunk packaging, verification and cleanup
- [Epic Games: FNetworkVersion](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FNetworkVersion), network version checksums, overrides and compatibility checks
- [Unity: Addressables content update builds](https://docs.unity3d.com/Packages/com.unity.addressables@2.3/manual/content-update-builds-overview.html), catalog checks, the content state file and content-only updates

**In practice**

- [Riot Games: Supercharging Data Delivery: The New League Patcher](https://www.riotgames.com/en/news/supercharging-data-delivery-new-league-patcher), RADS, FastCDC chunking, bundles, the signed manifest, the client design and patch 9.9 results (July 2019)
- [Riot Games: Bug Blog: TFT Bugs and Patches](https://www.riotgames.com/en/news/bug-blog-tft-bugs-and-patches), full patches, server micropatches and cross-play testing after a mobile-only patch (July 2021)
- [Riot Games: Legends of Runeterra CI/CD pipeline](https://www.riotgames.com/en/news/legends-runeterra-cicd-pipeline), the chunking patcher syncing build workspaces and distributing Unity (May 2021)
- [Riot Games: Riot Client background patching](https://www.riotgames.com/en/news/riot-client-background-patching-valorant), opt-in background patching (May 2023)
- [Riot Games Support: New League patcher](https://support.riotgames.com/en-us/league-of-legends/client/new-league-patcher), the 2025 patcher change as described to players
- [Android Developers Blog: Reducing the size of app updates by 65 percent](https://android-developers.googleblog.com/2016/12/saving-data-reducing-the-size-of-app-updates-by-65-percent.html), File-by-File patching and its cost on device (December 2016)
- [EA: The EA app](https://www.ea.com/en-gb/inside-ea/news/ea-app), background updates in a publisher launcher
