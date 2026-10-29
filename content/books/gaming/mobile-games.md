+++
title = "Mobile Games"
description = "Phones as a game platform: device tiers, memory and thermal budgets, OS lifecycle, store review and size limits, testing, crashes, attribution and ads."
category = "Gaming Industry"
order = 1607
part = "Clients and Delivery"
aliases = []
tags = ["gaming", "mobile", "attribution", "user-acquisition", "ad-mediation", "device-tiers"]
+++

Mobile is the largest segment of the games market, more than half of it by Newzoo's 2025 estimate ([How Big It Is](/books/gaming/games-business#how-big-it-is)), and it runs on hardware the studio controls even less than a PC. A phone game ships to thousands of device models through two stores that review every build, runs in a process the operating system will suspend or kill without asking, shares a battery and a heat budget with everything else on the device, and in most cases is free to download, so its business is buying installs and earning them back. None of that changes the core of a game backend; all of it changes the client, the release process and the analytics that decide whether the game survives.

This chapter is the mobile layer on top of the rest of the volume: device fragmentation and tiers, the memory, thermal and battery budgets, the OS lifecycle and what it means for saving, store review and size limits, device testing and crash reporting, and then the money side that is specific to mobile: user acquisition, attribution after Apple's App Tracking Transparency, ad mediation and rewarded ads, and the unit economics (CPI, ROAS, payback) that [Game Metrics](/books/gaming/game-metrics) builds on. Store fees and billing rules are in [Stores, Fees & Payments](/books/gaming/stores-and-payments), asset delivery mechanics in [Patching & Content Delivery](/books/gaming/patching#mobile), and the release process every mobile app shares (trains, phased rollouts, forced upgrades) in [Mobile Releases](/docs/delivery/mobile-releases).

## How the Platforms Do It

Two operating systems and their stores define the platform, and a set of third parties fills the gaps they leave:

| Concern | Apple (iOS, iPadOS) | Google (Android, Google Play) | Third parties |
| --- | --- | --- | --- |
| Device range | A small set of Apple devices, each with a memory limit iOS enforces per app | Thousands of models; Play Console can exclude devices by RAM or system on chip | Engine quality settings, Unity Adaptive Performance |
| Thermal and power | `ProcessInfo.ThermalState` (nominal, fair, serious, critical), Low Power Mode | ADPF Thermal API with a headroom forecast and status levels | Engine adapters over both |
| Lifecycle | Apps suspended shortly after leaving the foreground and terminated as needed | Cached processes killed at any time; `onDestroy()` not guaranteed | Engine pause callbacks |
| Review and size | App Review for every build; 4 GB uncompressed app limit; Background Assets for more | Policy review; 500 MB base module, asset packs up to 30 GB on demand | |
| Testing | Xcode, TestFlight | Pre-launch report, Firebase Test Lab (deprecated, shutting down 30 September 2027) | AWS Device Farm and other device clouds |
| Crashes | Xcode Crashes organizer, MetricKit, jetsam reports | Android vitals with bad-behavior thresholds | Firebase Crashlytics, Sentry and others |
| Attribution | App Tracking Transparency, AdAttributionKit and SKAdNetwork | Advertising ID, Play Install Referrer; Privacy Sandbox being phased out | Mobile measurement partners such as AppsFlyer and Adjust |
| Ads | | AdMob | Mediation such as AppLovin MAX and Unity LevelPlay |

The pattern is that the platform owns everything close to the device and the store, and publishes enough to let you measure it; the parts that decide your economics (where installs came from, which ad network fills a slot) are run by third parties integrated into the client.

## Device Fragmentation and Tiers

On PC the minimum spec is a line on the store page. On mobile it is a policy the game enforces on itself, because the store will happily install a 3D game on a phone with a fraction of the memory it needs. Google Play lets you exclude devices from the store listing: you "can create targeting rules based on RAM size or System on Chip (SoC)", such as excluding "devices with less than 512 MB RAM", and those rules use the device's total memory as reported, "not the branded memory." Exclusions override what the manifest declares.

Exclusion handles the floor. Above it, the game has to look and run differently on a five-year-old budget phone and this year's flagship, and the tool for that is a **device tier**: a small number of named quality levels (I use three or four), each with a bundle of settings (resolution scale, frame rate cap, texture quality, shadow and effect levels, how many players are drawn in full), and a rule that assigns each device to one.

Where the tier comes from:

- **Measured capability at first launch:** total RAM, GPU family, supported texture compression formats, and a short benchmark. Android also publishes a **performance class**, "a standard first introduced in Android 12" that "defines a set of device capabilities that goes beyond Android's baseline requirements"; a declared class is a useful floor signal on recent devices.
- **A device table from the server:** model and system-on-chip identifiers mapped to tiers, built from your own crash, frame-time and thermal telemetry. This is the part that improves over time, and it belongs in remote config, not in the build ([Flags, Kill Switches and Remote Config](/books/gaming/live-operations#flags-kill-switches-and-remote-config)).
- **Runtime adjustment:** the tier is a starting point, and thermal state can push the game down a level mid-session (below).

The tier also decides what gets downloaded. Google Play's device targeting lets an app bundle "ensure that a large asset is only delivered to devices with high RAM", targeting by device model, RAM, system features and system on chip, so low-end devices never download the high-resolution texture packs. Texture formats are the same idea: Google reports ASTC support on over 80% and ETC2 on over 95% of Play devices and calls ETC2 "a good choice for a default format", and Play Asset Delivery can serve a pack per format. Apple's device range is narrow enough that most games map tiers by model identifier.

My rule: the tier is data with a version, served from the backend, logged on every session and crash, and overridable per device by the player within the limits of the tier above. A crash or frame-time spike that clusters on one chipset becomes a row change, not a client patch.

## Memory, Thermal and Battery Budgets

A console game has a fixed memory budget; a phone game has one that the OS sets per device, changes at runtime and enforces by killing the process.

**Memory.** On iOS, "The memory limit that triggers the exception depends on the device, and once an app exceeds this limit, iOS terminates it." `os_proc_available_memory()` returns "The number of bytes the app may allocate before it hits its memory limit," and Apple warns that limits "can change during the app life cycle and don't necessarily correspond to the amount of physical memory available on the device." When the system needs memory it terminates apps; Apple calls this a jetsam event, and "If the system jettisons your app due to memory pressure while the app is visible, it will look like your app crashed." Low-memory warnings are "best-effort," and an app that "does not release enough memory during low-memory conditions" may be terminated outright. On Android, the system calls `onTrimMemory()` first and then the low-memory killer picks processes, "Background apps are first to be killed." Android vitals now measures a user-perceived LMK rate, and Google says "An LMK rate above 1% indicates a critical need for immediate action."

What this means for a game:

- **Budget against the tier's limit, measured on the device,** not against the device's advertised RAM. Read the available-memory figure at startup and after each level load, and send it with session telemetry.
- **Answer the warning.** Unload cached audio, pooled meshes and unused texture mips when the OS warns; a game that holds everything is the one the OS removes.
- **Count jetsam and LMK as crashes.** A memory kill looks like a crash to the player, but crash reporters often miss it: Apple's Crashes organizer doesn't include jetsam events, which arrive as separate reports. Track them as their own rate per tier and build.

**Thermal.** A phone that runs a GPU at full speed for twenty minutes gets hot and the OS throttles it, so the frame rate a game benchmarks in minute one isn't the frame rate it holds in minute twenty. Android's Thermal API (from Android 11) reports a status from `THERMAL_STATUS_NONE` through `LIGHT`, `MODERATE`, `SEVERE`, `CRITICAL`, `EMERGENCY` and `SHUTDOWN`, and `getThermalHeadroom()` forecasts how close the device is to throttling, from 0.0 ("no throttling") to 1.0 ("heavy throttling"); calling it more than once every 10 seconds returns NaN. iOS reports `ProcessInfo.ThermalState` as nominal, fair, serious or critical, the last meaning the device "needs to cool down." Unity's Adaptive Performance package wraps both for engines that use it.

My default response ladder, as config: at the first elevated state, cap the frame rate (60 to 30 is the largest single saving); at the next, drop the render scale and effects one tier; at the critical state, drop to the lowest tier and stop background work. Step back up only after the state has been nominal for a while, so the game doesn't oscillate. Log every step with the session, because "the game gets choppy after ten minutes" is a thermal report, not a netcode one.

**Battery.** Low Power Mode on iOS reduces "CPU and GPU performance" and screen brightness and pauses background activity, and Apple's guidance is to "take appropriate steps to reduce activity in your app." For a game that means honoring it: default to the lower frame cap and fewer background downloads, and let the player override. A game that drains a battery in an hour gets uninstalled whatever its retention curve predicted.

The general rule (budgets are measured on target hardware and enforced in CI) is in [Performance Budgets](/books/gaming/production-pipelines#performance-budgets); the mobile difference is that the budget is per tier, and part of it moves at runtime.

## The OS Lifecycle: Background, Suspend, Kill

A mobile game doesn't decide when it stops. The player takes a call, switches to a chat app or locks the phone, and the OS takes over.

On iOS, "When the user exits a foreground app, that app moves to the background state briefly before UIKit suspends it," and the system "terminates background apps as needed." The legacy `applicationDidEnterBackground` callback has "approximately five seconds to perform any tasks and return"; apps using scenes get `sceneDidEnterBackground` instead, and Apple's list of things to do on deactivation includes "Save user data to disk" and "Pause gameplay automatically." On Android, a cached process "is not currently needed, so the system is free to kill it as needed," apps "should cease all work while in the cached state," and "onDestroy() is not guaranteed to be called in the case that a process is killed by the system." Android's activity documentation adds that `onPause` "is very brief and does not necessarily offer enough time to perform save operations," and points heavier shutdown work to `onStop`.

So every mobile game has to assume that leaving the foreground may be the last thing that happens to the process. The rules I build to:

- **Save on background, not on quit.** Mobile players rarely quit; they leave. Write the save (atomically, see [Saves, Progression & Player Data](/books/gaming/saves-and-player-data)) on the background callback, and keep that write small enough to finish well inside the time the OS gives.
- **Save continuously for anything that costs money or time.** A purchase, a reward claim, a completed level: the server records it when it happens, so a kill loses at most the last few seconds of local state.
- **Pause, don't simulate.** A single-player game pauses on background. An online match can't: the server keeps simulating, and the client that comes back after thirty seconds has to reconnect and resync, or be replaced by a bot, under the same rules as any disconnect ([Netcode Fundamentals](/books/gaming/netcode)).
- **Resume is a restart that looks like a resume.** After a kill, the player opens the app and expects to be where they were. Restore from the last save and the server state, and re-validate the session token, which may have expired while the process was gone.
- **Background downloads are the OS's, not the game's.** Large content downloads go through the platform's asset delivery (below) rather than a game loop that dies on suspend; [Background Execution Is Rationed](/docs/architecture/offline-sync#background-execution-is-rationed) covers why.

## App Review and Store Rules

Every mobile build passes store review before players get it. Apple says App Review "typically" reviews "at least 50% of submissions in less than 24 hours and 90% in less than 48 hours," so a hotfix is a day or two away, not an hour; that delay is the reason mobile games lean so heavily on server-side configuration and kill switches ([Mobile Releases](/docs/delivery/mobile-releases)).

The rules that touch games most often, beyond billing (fees, IAP requirements and link-outs are in [Stores, Fees & Payments](/books/gaming/stores-and-payments#apple-app-store)):

- **Tracking requires permission.** Apple's Guideline 5.1.2(i): "You must receive explicit permission from users via the App Tracking Transparency APIs to track their activity," and the app may not require tracking (or push notifications or location) to play "or receive monetary or other compensation." A game can't give gems for accepting the tracking prompt.
- **Code outside the binary.** Guideline 4.7 lets apps offer "HTML5 and JavaScript mini apps and mini games, streaming games, chatbots, and plug-ins" that aren't embedded in the binary, with digital goods inside them following the IAP rules. It is the route for game hubs and UGC runtimes on iOS ([UGC & Creator Economies](/books/gaming/creator-economies)).
- **Randomized items, account deletion and age.** Loot box odds must be disclosed before purchase ([Store Odds Rules](/books/gaming/consumer-law-and-loot-boxes#store-odds-rules)), apps that create accounts must offer deletion inside the app ([Saves, Progression & Player Data](/books/gaming/saves-and-player-data)), and store age ratings and age signals are in [Ratings, Age & Children](/books/gaming/ratings-and-age).
- **Google Play technical requirements move every year.** As of October 2026, from 31 August 2026 new apps and updates must target Android 16 (API level 36), and existing apps must target Android 15 (API level 35) to stay available to new users, with extensions available to 1 November 2026. Apps targeting Android 15 or higher must support 16 KB memory pages on 64-bit devices, and from 1 February 2027 updates that don't can't be released. Apps with only Java or Kotlin code already comply; a game engine's native libraries have to be rebuilt, which makes the engine version a release dependency.

My rule: a calendar of store requirement deadlines lives beside the release calendar, owned by someone, because a missed target-API date blocks every update, including the hotfix you need that week.

## App Size and On-Demand Assets

Size limits shape a mobile game's content layout. As of October 2026:

- **Apple** allows a maximum uncompressed app size of 4 GB for iOS 9 and later, and points to Background Assets "to host larger assets."
- **Google Play** allows a 500 MB base module, 1.5 GB per asset pack, 4 GB for everything installed up front and 30 GB for on-demand and fast-follow packs, with a 34 GB total; above 200 MB, players on mobile data see a non-blocking warning dialog. Only install-time packs count toward the size shown on the store page.

The delivery systems themselves, Play Asset Delivery's install-time, fast-follow and on-demand packs and Apple's Managed Background Assets with essential, prefetch and on-demand policies (Apple called On-Demand Resources "a legacy technology"), are covered in [Patching & Content Delivery](/books/gaming/patching#mobile). What matters for game design:

- **The install is the first-session funnel.** Every megabyte before the first playable moment costs installs, and the 200 MB mobile-data warning is a visible threshold. Ship the tutorial and the first hour in the install, fetch the rest after.
- **Packs follow tiers and formats.** One texture set per tier and format, delivered by device targeting, instead of every device downloading every resolution.
- **The binary can be ahead of its content.** Google warns that the app can update before its asset packs do; the client checks the content version it has against the one it needs and shows a download state rather than crashing on a missing asset.
- **Content that changes weekly is not in the binary.** Event art, offers and balance data come from your own CDN as versioned content, on the live-ops schedule rather than the store review schedule ([Not Every Fix Is a Client Patch](/books/gaming/patching#not-every-fix-is-a-client-patch)).

## Testing on Devices

The emulator tells you the game starts. Only real devices tell you it holds 30 frames per second without overheating, fits in memory on a 3 GB phone, and survives an incoming call. Three layers, from cheapest to most expensive:

- **The store's own automated pass.** Google Play's pre-launch report installs each build "on a set of Android devices in our test lab" and crawls it "for several minutes"; for a game, which a crawler can't play, you supply "a Robo script or game loop."
- **Device clouds.** AWS Device Farm runs tests on "real, physical phones and tablets that are hosted by" AWS (in the us-west-2 Region only). Firebase Test Lab has real devices, Robo tests and Game Loop tests that run "through your gaming app while simulating the actions of a real player," but it is deprecated and "will be fully shut down on September 30, 2027," with a migration path to Google Cloud's Developer Device Platform; as of October 2026 a new pipeline shouldn't depend on it.
- **An in-house device lab** of the models that matter to your audience, chosen from your own install and crash data by tier, for the long soak tests (thermal, battery, memory over a 30-minute session) that cloud time is too expensive for.

What makes game testing on devices work is the **game loop**: a build mode that plays itself (scripted inputs, a bot, a replayed session) through the heaviest scenes while recording frame times, memory, temperature state and battery. The test asserts budgets per tier, not just "didn't crash" ([Automated Testing at Scale](/books/gaming/production-pipelines#automated-testing-at-scale)).

## Crash Reporting on Mobile

The pipeline (symbols, grouping, a crash per build) is the same as on any platform ([Crash Reporting and Symbolication](/books/gaming/production-pipelines#crash-reporting-and-symbolication)). The mobile twists:

- **The store scores you.** Android vitals sets bad-behavior thresholds, as of October 2026 a user-perceived crash rate of 1.09% and ANR rate of 0.47% overall, and 8% for each per phone model, and "If your app or game exceeds a bad behavior threshold, Play may reduce the visibility of your title" and show a warning on the store listing. Google's vitals page also publishes memory thresholds for games, with store visibility impact from February 2027. The crash rate is a store-ranking input, not just an engineering metric.
- **Native and managed crashes both.** A game engine crashes in C++, while the platform glue crashes in Java, Kotlin, Objective-C or Swift. Crashlytics, for example, supports Apple, Android, Flutter and Unity, and collects native stack traces for Android NDK libraries. Upload symbols for both from the build farm, keyed by build.
- **Not every death is a crash.** iOS memory kills, watchdog terminations and thermal events don't appear in Xcode's Crashes organizer; MetricKit delivers metric reports "at most once per day" and diagnostic reports immediately on iOS 15 and later. Android's ANRs and LMKs are separate vitals. I track crash, ANR or watchdog, and memory kill as three rates per tier and build, because they have three different fixes.
- **Tier is a dimension.** Every crash carries the device tier and model, so a regression on one chipset shows as a spike in one cell, not a small rise in the global rate.

## User Acquisition and Attribution

Most mobile games are free, so growth is bought: the studio pays ad networks for installs and judges each campaign by what those installs later spend. That loop needs **attribution**, knowing which ad led to which install, and attribution is where platform privacy rules have changed the most.

### iOS: ATT and AdAttributionKit

Since iOS 14.5, "your app must request tracking authorization before it can get the advertising identifier" (IDFA), through App Tracking Transparency. If the app hasn't asked, or the user declined, the identifier is all zeros. Device-level attribution on iOS therefore works only for users who opt in on both the advertising app and the publishing app. What ATT did to a store's ad measurement is the Commerce volume's [Signals After ATT](/books/commerce/acquisition-and-attribution#signals-after-att).

For everyone else, Apple provides aggregated, privacy-preserving attribution: SKAdNetwork, and its successor **AdAttributionKit** (iOS 17.4 and later), which also covers alternative app marketplaces; Apple's SKAdNetwork documentation now directs app ad campaigns to AdAttributionKit. Apps "don't need to use" App Tracking Transparency before calling these APIs. How it works, from Apple's documentation:

- **The ad network, not you, receives the postback.** The ad network signs the ad; when an install follows, the device sends a postback to the winning network (and up to five runners-up receive a postback marked as not winning).
- **Windows.** A view-through ad gives the person 24 hours to install, a click-through ad 30 days. After install, there are three conversion windows: days 0 to 2, 3 to 7 and 8 to 35.
- **Values, not events.** Your app updates a conversion value: a 6-bit fine value (0 to 63) available only in the first postback, or a coarse value of low, medium or high, which is what later postbacks and lower privacy tiers receive.
- **Crowd anonymity.** Apple assigns each install a postback data tier based on how many installs share the campaign: higher tiers carry the fine value and the country code; at Tier 0 there are no second or third postbacks.
- **Delays.** Postbacks arrive after a random delay, 24 to 48 hours for the first and 24 to 144 hours for the second and third, so the data is days late and never per user.
- **Re-engagement.** From iOS 18, AdAttributionKit also attributes click-through re-engagement of existing users, within monthly per-app and yearly per-device limits.

The design consequence is that six bits and three windows are the whole signal for most iOS installs, so the **conversion value schema** is a product decision: which first-48-hour behaviors (tutorial complete, first purchase, purchase value band, day-1 return) best predict a player's value, encoded so the 64 values and three coarse buckets mean something to the bidding model. The schema is versioned config, shared with the measurement partner and changed rarely, because every change breaks comparability across campaigns.

### Android: Advertising ID, Referrer, and the End of Privacy Sandbox

On Android the Advertising ID still exists, but when a user deletes it in settings, "Any attempts to access the identifier will receive a string of zeros instead of the identifier." The Google Play Install Referrer API gives the installed app the referrer URL of the install and timestamps for the referrer click and the install start, which ties an install to the click that led to it without a device identifier.

Google had planned a replacement: the Privacy Sandbox on Android, with the Attribution Reporting API, SDK Runtime and Topics. On 17 October 2025 Google announced it would retire these "in light of their low levels of adoption", including the Attribution Reporting API, Protected Audience, SDK Runtime and Topics on both Chrome and Android. As of October 2026, Google's status page lists the Android APIs as "Scheduled for phaseout" without dates. Build Android attribution on the Advertising ID with consent and the Install Referrer, and don't depend on Privacy Sandbox APIs.

### Measurement Partners

In practice almost every mobile game uses a **mobile measurement partner** (MMP), such as AppsFlyer or Adjust, an SDK in the client and a service that receives ad clicks and impressions from networks, matches installs to them, collects the iOS postbacks the networks forward, and reports per campaign. Their defaults are the industry's: AppsFlyer opens "a click lookback window" with "a default duration of 7 days" (configurable from 1 to 30) and calls seven days "the industry standard"; Adjust's click-based window also defaults to 7 days, with 24 hours for impression-based attribution.

What the MMP doesn't do is own your numbers. My rules:

- **Attribution is a label on an install, not a fact about a player.** Store it with its source (MMP device match, Install Referrer, SKAdNetwork or AdAttributionKit postback, organic) and the window that applied, and let it be wrong: a re-attributed install gets a new row, not an overwrite.
- **Revenue comes from your ledger, never from the SDK.** The MMP's revenue events are client-sent copies for bidding; the store receipts verified by your backend are the truth ([Receipt Validation and Entitlement Grants](/books/gaming/stores-and-payments#receipt-validation-and-entitlement-grants)). Send verified purchase events server-to-server where the MMP supports it, so refunds and fraud don't inflate campaign ROAS.
- **Consent first.** In the EU and UK, the MMP and ad SDKs run only within the consent the player gave, and children's rules switch most of this off entirely ([Ratings, Age & Children](/books/gaming/ratings-and-age), [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy)).

## Ad Mediation and Rewarded Ads

A game that shows ads rarely talks to one ad network. A **mediation** layer sits between the game and many networks and picks the best-paying ad for each slot. AppLovin MAX describes automating "waterfall management through a combination of in-app bidding and CPM updating," with networks competing in a "unified auction"; Unity LevelPlay (formerly ironSource) does the same job. The game integrates one SDK and one set of callbacks; the mediation dashboard decides which networks fill.

The form that suits games is the **rewarded ad**, where the player chooses to watch in exchange for an in-game item ([Ads in Mobile Games](/books/gaming/monetization#ads-in-mobile-games) covers the design and AdMob's server-side verification). Mediation platforms offer the same server-to-server callback, and their details show what a robust reward endpoint has to handle:

- **AppLovin MAX** sends HTTP or HTTPS GET callbacks with a unique 36-character event ID, the user ID, the amount and currency, and an event token computed as a SHA-1 hash of the event ID and your secret key; it times out after five seconds and retries up to two times.
- **Unity LevelPlay** signs callbacks with an MD5 hash over the timestamp, event ID, user ID, rewards and your private key, expects a 200 response containing `[EVENT_ID]:OK` within 400 milliseconds, and keeps retrying for days. Its client documentation also warns that `onAdRewarded` can fire after `onAdClosed`.

So the reward endpoint verifies the signature, keys the grant on the network's event ID so retries grant once, answers fast (grant asynchronously if it must), and treats the client's "ad finished" callback as a UI hint. The grant is a ledger transaction of kind `reward` whose `source_ref` is the network and event ID ([Wallets Are Ledgers](/books/gaming/economies-and-entitlements#wallets-are-ledgers)). Ad revenue per impression is reported by the mediation platform, and like MMP revenue it is an estimate until the network pays; the reconciled figure is what goes into `ad_revenue_amount` in [Game Metrics](/books/gaming/game-metrics#revenue-arpdau-arppu-conversion-and-ltv).

Ads and purchases interact: a player who buys "no ads" holds an entitlement every ad call site checks, and a player under the age where targeted ads are allowed must get only contextual ads, decided by the age band the backend holds, not by the ad SDK's guess.

## CPI, ROAS and Payback

Three numbers run a mobile game's growth. The vendors' definitions:

- **CPI** (cost per install): AppsFlyer defines it as the "predetermined price that the advertiser agrees to pay the publisher every time a user installs their app as a direct result of an ad," and distinguishes **eCPI**, the effective price actually paid when campaigns are bought on another basis.
- **ROAS** (return on ad spend): "how much revenue was earned in comparison to how much budget was spent," where "100% is the break-even point."

This book's working definitions, consistent with [Game Metrics](/books/gaming/game-metrics#revenue-arpdau-arppu-conversion-and-ltv):

```text
eCPI(campaign, period)    = ad_spend(campaign, period) / attributed_installs(campaign, period)
ROAS(cohort, N)           = net_revenue from cohort's accounts, days 0..N / ad_spend(cohort)
payback_day(cohort)       = smallest N where ROAS(cohort, N) >= 100%
predicted_ROAS(cohort, H) = realized ROAS to day N + forecast to horizon H,
                            labeled with model version and H
```

Notes on the definitions:

- **The cohort is installs attributed to the campaign,** on the install date, and its revenue is net revenue from the ledger (after store fees and refunds, plus reconciled ad revenue where the game shows ads). ROAS on gross bookings flatters every campaign by the store's cut.
- **ROAS always carries its day.** "D7 ROAS 30%" and "D30 ROAS 70%" describe the same campaign; ROAS without a day is meaningless. AppsFlyer's glossary gives the common heuristic that users who return "50% or more of their cost by Day 3" are likely to be profitable by day 30; treat that as a vendor's rule of thumb, and fit your own curve from your cohorts.
- **iOS cohorts are partly modeled.** For non-consenting users, the revenue per campaign comes from conversion values in delayed postbacks, not from your ledger joined to a device ID, so iOS campaign ROAS is an estimate with a model version, like predicted LTV.
- **Payback is a cash question.** A game can be profitable on a 365-day LTV and still run out of money if payback is 300 days. The finance view joins payback with the store payout schedule, because store revenue arrives weeks after the purchase.

## Web Shops Off the Store

Mobile publishers now sell outside the stores directly. Supercell runs a Supercell Store with stores for Brawl Stars, Clash of Clans, Clash Royale, Hay Day and Boom Beach, signed in with Supercell ID and with "Store-only special offers"; the Pokémon GO Web Store, operated by Scopely as of October 2026, sells PokéCoins from 110 to 15,500. Both put the purchase on the publisher's own account rather than a device, which is the prerequisite.

The legal status of in-app links to those shops differs by store and region, and in the US it is still in court: as of October 2026, the Supreme Court has granted Apple's petition in *Apple Inc. v. Epic Games* (No. 25-1311), limited to one question, with Epic's brief due 13 November 2026 and no argument date on the docket. The commission rules, the EU terms, Google's US programs and the attribution windows for link-outs are in [Stores, Fees & Payments](/books/gaming/stores-and-payments#web-stores-and-direct-payments). For the mobile backend, a web shop adds three things: a link token from the app to the checkout so the purchase lands on the right account and the commission window can be applied, a grant that reaches the device on its next sync or by push, and the same ledger, refund and fraud handling as the in-app store.

## How to Build It

The chapter's additions to the [core data model](/books/gaming/games-business#the-core-data-model): an install as its own record, device tiers as data, attribution as labels with sources, and rewarded-ad callbacks as idempotent grants.

```sql
CREATE TABLE client_installs (               -- one app install on one device
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  game_id          UUID NOT NULL REFERENCES games (id),
  install_xid      TEXT NOT NULL,            -- generated by the client on first launch
  platform         TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  store            TEXT NOT NULL,            -- 'apple', 'google', or an alternative marketplace
  device_model     TEXT NOT NULL,
  soc              TEXT,
  ram_mb           INTEGER,
  account_id       UUID REFERENCES accounts (id),  -- set on first sign-in; may change
  first_build_id   UUID NOT NULL REFERENCES builds (id),
  first_seen_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (game_id, install_xid)
);

CREATE TABLE device_tier_rules (             -- versioned; served as remote config
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  game_id        UUID NOT NULL REFERENCES games (id),
  rules_version  INTEGER NOT NULL,
  priority       INTEGER NOT NULL,           -- first match wins
  platform       TEXT NOT NULL,
  match_model    TEXT,                       -- exact model, or null
  match_soc      TEXT,
  min_ram_mb     INTEGER,
  tier           TEXT NOT NULL CHECK (tier IN ('low', 'mid', 'high', 'ultra')),
  settings       JSONB NOT NULL,             -- frame cap, render scale, texture set, effects
  reason         TEXT NOT NULL,              -- 'benchmark', 'crash cluster 2026-10', ...
  UNIQUE (game_id, rules_version, priority)
);

CREATE TABLE install_attributions (          -- a label, with its source; never overwritten
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  client_install_id UUID REFERENCES client_installs (id),  -- null for aggregate postbacks
  source           TEXT NOT NULL CHECK (source IN ('mmp_device', 'install_referrer',
                     'skadnetwork', 'adattributionkit', 'organic')),
  ad_network       TEXT,
  campaign_xid     TEXT,
  touch_type       TEXT CHECK (touch_type IN ('click', 'view')),
  window_days      INTEGER,                  -- the lookback window that applied
  postback_window  SMALLINT CHECK (postback_window IN (1, 2, 3)),
  conversion_value SMALLINT CHECK (conversion_value BETWEEN 0 AND 63),
  coarse_value     TEXT CHECK (coarse_value IN ('low', 'medium', 'high')),
  cv_schema_version INTEGER,                 -- what the six bits meant
  supersedes_id    UUID REFERENCES install_attributions (id),  -- re-attribution
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_reward_callbacks (           -- server-to-server rewarded ad callbacks
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  game_id         UUID NOT NULL REFERENCES games (id),
  mediation       TEXT NOT NULL,             -- 'applovin_max', 'levelplay', 'admob'
  network_event_xid TEXT NOT NULL,           -- the platform's event id
  account_id      UUID NOT NULL REFERENCES accounts (id),
  placement       TEXT NOT NULL,
  reward_amount   INTEGER NOT NULL,
  signature_ok    BOOLEAN NOT NULL,
  ledger_transaction_id UUID REFERENCES currency_ledger_transactions (id),  -- null if rejected
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mediation, network_event_xid)
);

CREATE TABLE ua_spend_days (                 -- imported from networks or the MMP, per campaign
  tenant_id     UUID NOT NULL,
  game_id       UUID NOT NULL REFERENCES games (id),
  day           DATE NOT NULL,
  ad_network    TEXT NOT NULL,
  campaign_xid  TEXT NOT NULL,
  country_code  TEXT NOT NULL,
  spend_amount  BIGINT NOT NULL,             -- minor units
  currency      TEXT NOT NULL,
  installs_reported INTEGER,
  PRIMARY KEY (game_id, day, ad_network, campaign_xid, country_code)
);
```

Notes on the sketch:

- **The install is not the account.** A player reinstalls, changes phones, or plays on a phone and a tablet; one account has many installs and, before sign-in, an install has no account. Attribution belongs to the install, revenue to the account, and the join between them is time-bounded: revenue counts toward the install's campaign from the install that first carried that account.
- **Tier rules are versioned and ordered.** The client fetches the current version, evaluates the first matching rule, and reports `rules_version` and the tier with every session and crash, so a regression can be traced to a rules change as easily as to a build.
- **Aggregate postbacks have no install.** SKAdNetwork and AdAttributionKit postbacks go to the network and arrive via the MMP per campaign, so `client_install_id` is null and the row counts toward the campaign, not a person. The conversion value schema version travels with it.
- **A rewarded callback is a store transaction in miniature:** verified, keyed by the network's ID, granted once, linked to the ledger transaction it produced. A rejected callback (bad signature, unknown account) is kept with `signature_ok = false` for fraud review.
- **Events:** `install.first_seen`, `install.attributed`, `device_tier.assigned` and `ad_reward.granted` go through the outbox to telemetry and metrics ([Events & Async Messaging](/docs/architecture/events)).

ROAS by cohort is then a query: installs by first-seen day and campaign, joined through their first account to net revenue from the ledger by day N, over `ua_spend_days` for the same campaign and day, with iOS campaigns' modeled revenue joined in from the MMP and labeled as such.

## Auditing

The disputes in mobile are about money moving between the studio and its partners, and about what the game did to a player's device:

- **Spend and attribution.** Every spend row's source (network report or MMP), import time and currency, and every attribution row's source and window, so a network's invoice can be reconciled against installs it claimed, and a re-attribution is visible rather than silent.
- **Reward callbacks.** Every callback received, its signature result, and the grant it produced or why it didn't, so "I watched the ad and got nothing" has an answer and a farm of fake callbacks shows up as a pattern.
- **Tier and consent decisions.** Which tier rules version a device ran, and which consent state governed tracking and ad personalization at each session; regulators ask about the second ([Audit Trails](/docs/architecture/audit-trails)).
- **Store requirement compliance.** Target API level, page-size support, privacy manifests and data safety declarations per build, recorded with the build ([Recording Builds](/books/gaming/production-pipelines#recording-builds)).

## What This Means for the System You Build

- **Device tiers as versioned data,** from measured capability and your own telemetry, served as remote config, logged on every session and crash.
- **Memory, thermal and battery budgets per tier,** with a runtime ladder that steps quality down on thermal pressure and Low Power Mode, and memory kills tracked as their own rate.
- **Save on background and record value on the server as it happens,** because the OS may kill the process at any time after the game leaves the foreground.
- **A store requirements calendar** next to the release calendar, and a hotfix plan that assumes a day or two of review.
- **A small install, content after,** by tier and texture format through the platform's asset delivery.
- **Device testing with a self-playing game loop** that asserts budgets, on a store pre-launch pass, a device cloud and a lab of your audience's models.
- **Crash, ANR or watchdog, and memory kill as separate rates** per build and tier, watched against the store's thresholds.
- **Attribution as labeled rows with their source,** a conversion value schema treated as versioned product config, and no dependency on Android's Privacy Sandbox.
- **Rewarded ads granted from signed server callbacks,** keyed by the network's event ID into the ledger.
- **CPI, ROAS and payback from ledger revenue and imported spend,** with ROAS always carrying its day and iOS figures labeled as modeled.

## References

**Specifications**

- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 5.1.2(i) on App Tracking Transparency and not rewarding tracking, and 4.7 on mini games and streaming games (last updated October 16, 2026)
- [Apple: App Review](https://developer.apple.com/distribute/app-review/), at least 50% of submissions reviewed in under 24 hours and 90% in under 48
- [Apple: App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency), the tracking authorization request
- [Apple: advertisingIdentifier](https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier), authorization required from iOS 14.5 and the all-zeros identifier when not authorized
- [Apple: AdAttributionKit](https://developer.apple.com/documentation/adattributionkit), availability from iOS 17.4, runner-up postbacks, re-engagement and no ATT requirement
- [Apple: Receiving postbacks in multiple conversion windows](https://developer.apple.com/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows), the three windows, random delays, fine and coarse values and postback data tiers
- [Apple: Receiving ad attributions and postbacks](https://developer.apple.com/documentation/adattributionkit/receiving-ad-attributions-and-postbacks), 24-hour view-through and 30-day click-through install windows and re-engagement from iOS 18
- [Apple: Identifying the parameters in a postback](https://developer.apple.com/documentation/adattributionkit/identifying-the-parameters-in-a-postback), the 6-bit conversion value and low, medium and high coarse values
- [Apple: SKAdNetwork](https://developer.apple.com/documentation/storekit/skadnetwork), the pointer to AdAttributionKit for App Store ad campaigns
- [Apple: Maximum build file sizes](https://developer.apple.com/help/app-store-connect/reference/app-uploads/maximum-build-file-sizes), the 4 GB uncompressed app limit and Background Assets for larger assets
- [Google Play: Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878), the 31 August 2026 requirements and the 1 November 2026 extension
- [Android Developers: Support 16 KB page sizes](https://developer.android.com/guide/practices/page-sizes), the requirement for apps targeting Android 15 and the 1 February 2027 update deadline
- [Google Play: App size limits](https://support.google.com/googleplay/android-developer/answer/9859372), base module, asset pack and total limits and the 200 MB mobile data dialog
- [Google Play: View and restrict your app's compatible devices](https://support.google.com/googleplay/android-developer/answer/7353455), RAM and SoC exclusion rules based on total memory

**Reference**

- [Apple: Reducing your app's memory use](https://developer.apple.com/documentation/xcode/reducing-your-app-s-memory-use), per-device memory limits and termination
- [Apple: os_proc_available_memory](https://developer.apple.com/documentation/os/os_proc_available_memory), bytes available before the limit, and limits that change at runtime
- [Apple: Identifying high-memory use with jetsam event reports](https://developer.apple.com/documentation/xcode/identifying-high-memory-use-with-jetsam-event-reports), jetsam events that look like crashes
- [Apple: Responding to low-memory warnings](https://developer.apple.com/documentation/xcode/responding-to-low-memory-warnings), best-effort warnings before jettisoning
- [Apple: applicationDidReceiveMemoryWarning](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/applicationdidreceivememorywarning(_:)), termination when an app doesn't release memory
- [Apple: ProcessInfo.ThermalState](https://developer.apple.com/documentation/foundation/processinfo/thermalstate-swift.enum), the four thermal states
- [Apple: isLowPowerModeEnabled](https://developer.apple.com/documentation/foundation/processinfo/islowpowermodeenabled), what Low Power Mode reduces and the guidance to reduce activity
- [Apple: applicationDidEnterBackground](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/applicationdidenterbackground(_:)), approximately five seconds and the scene-based replacement
- [Apple: Preparing your UI to run in the background](https://developer.apple.com/documentation/uikit/preparing-your-ui-to-run-in-the-background), suspension after backgrounding, saving data and pausing gameplay
- [Apple: Acquiring crash reports and diagnostic logs](https://developer.apple.com/documentation/xcode/acquiring-crash-reports-and-diagnostic-logs), report types missing from the Crashes organizer
- [Apple: MetricKit](https://developer.apple.com/documentation/metrickit), daily metric reports and immediate diagnostics from iOS 15
- [Android Developers: Thermal API](https://developer.android.com/games/optimize/adpf/thermal), thermal status levels, headroom from 0.0 to 1.0 and the 10-second polling limit
- [Android Developers: Memory allocation among processes](https://developer.android.com/topic/performance/memory-management), onTrimMemory and the low-memory killer
- [Android Developers: Low memory killers](https://developer.android.com/topic/performance/vitals/lmk), the user-perceived LMK rate and the 1% guidance
- [Android Developers: Performance class](https://developer.android.com/topic/performance/performance-class), the standard introduced in Android 12
- [Android Developers: Processes and app lifecycle](https://developer.android.com/guide/components/activities/process-lifecycle), cached processes killed at any time and onDestroy not guaranteed
- [Android Developers: The activity lifecycle](https://developer.android.com/guide/components/activities/activity-lifecycle), onPause too brief for saves, onStop for heavier work
- [Android Developers: Device targeting](https://developer.android.com/google/play/device-targeting), delivering assets by device model, RAM, system features and SoC
- [Android Developers: Target texture compression formats](https://developer.android.com/guide/playcore/asset-delivery/texture-compression), ASTC and ETC2 device shares and ETC2 as a default
- [Android Developers: Play Asset Delivery](https://developer.android.com/guide/playcore/asset-delivery), delivery modes and which packs count toward the store size
- [Android Developers: Android vitals](https://developer.android.com/topic/performance/vitals), crash and ANR bad-behavior thresholds, store visibility effects and game memory thresholds
- [Google Play: Use a pre-launch report](https://support.google.com/googleplay/android-developer/answer/9842757), automated crawls on test devices with a Robo script or game loop
- [Google Play: Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248), zeros returned after a user deletes the ID
- [Android Developers: Google Play Install Referrer](https://developer.android.com/google/play/installreferrer), referrer URL and click and install timestamps
- [Privacy Sandbox: Update on plans for Privacy Sandbox technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), the 17 October 2025 retirement announcement covering Android APIs
- [Privacy Sandbox: Feature status](https://privacysandbox.google.com/overview/status), Android APIs scheduled for phaseout (updated August 14, 2026)
- [Firebase: Test Lab](https://firebase.google.com/docs/test-lab), real devices and the deprecation with shutdown on September 30, 2027
- [Firebase: Game Loop tests](https://firebase.google.com/docs/test-lab/android/game-loop), tests that simulate a real player
- [AWS: What is AWS Device Farm?](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html), real devices hosted by AWS in us-west-2
- [Firebase: Crashlytics](https://firebase.google.com/docs/crashlytics), crash reporting for Apple, Android, Flutter and Unity
- [Firebase: Crashlytics for Android NDK](https://firebase.google.com/docs/crashlytics/android/get-started-ndk), native stack traces
- [Unity: Adaptive Performance](https://docs.unity3d.com/Packages/com.unity.adaptiveperformance@5.1/manual/index.html), thermal and power feedback for mobile devices
- [AppsFlyer: Attribution model](https://support.appsflyer.com/hc/en-us/articles/207447053), the 7-day default click lookback window and its range
- [Adjust: Attribution windows](https://help.adjust.com/en/article/attribution-windows), 7-day click and 24-hour impression defaults
- [AppsFlyer: Cost per install](https://www.appsflyer.com/glossary/cost-per-install/), CPI and eCPI
- [AppsFlyer: ROAS](https://www.appsflyer.com/glossary/roas/), return on ad spend, the break-even point and the day-3 heuristic
- [AppLovin: MAX getting started](https://support.applovin.com/en/max/getting-started), in-app bidding and a unified auction
- [AppLovin: S2S Rewarded Callback API](https://support.applovin.com/en/max/advanced-features/s2s-rewarded-callback-api), callback parameters, event token, five-second timeout and retries
- [Unity: LevelPlay rewarded ads integration for Android](https://docs.unity.com/en-us/grow/levelplay/sdk/android/rewarded-ads-integration), onAdRewarded possibly firing after onAdClosed
- [Unity: LevelPlay server-to-server callback settings](https://docs.unity.com/en-us/grow/levelplay/platform/settings/server-to-server-callback), signature, response format, 400-millisecond deadline and retry schedule
- [Supreme Court docket No. 25-1311](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/25-1311.html), Apple Inc. v. Epic Games: certiorari granted June 30, 2026 and the briefing schedule

**In practice**

- [Supercell Store](https://store.supercell.com/), web stores for five Supercell games
- [Supercell Store: Clash of Clans](https://store.supercell.com/clashofclans), store-only offers and Supercell ID sign-in
- [Pokémon GO Web Store](https://store.pokemongo.com/), PokéCoins sold on the web from 110 to 15,500, operated by Scopely Explore
