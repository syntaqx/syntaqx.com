+++
title = "Saves, Progression & Player Data"
nav_title = "Saves & Player Data"
description = "Where progress lives: local, cloud and server saves, platform cloud limits, versioning, conflicts, corruption, and access, erasure and deletion in a live game."
category = "Gaming Industry"
order = 1615
part = "Backend and Live Services"
aliases = []
tags = ["gaming", "saves", "cloud-save", "progression", "gdpr", "account-deletion"]
+++

A player's progress is the thing in a game they can't buy back. A lost purchase can be restored from a receipt; a lost save, two hundred hours of a farm or a character, is gone unless the system kept a copy, and the player knows exactly how much it was worth to them. Progress also has more owners than it looks: the device that wrote it, the platform's cloud that synced it, the game's backend that holds the authoritative parts, and the law, which says the player can ask for a copy and ask for it to be deleted, while the same law and the game's own fairness rules say some of it must be kept.

This chapter covers where progress lives (on the device, in a platform's cloud, on your servers), what each platform's cloud save does and limits, how to version a save format, how to resolve conflicts between devices and recover from corruption, and then the player data side: access, erasure and portability requests against append-only ledgers, match history, leaderboards and ban records, and the account deletion flows that Apple and Google require. Cross-progression rules are in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#cross-play-cross-progression-and-cross-purchase); ownership and currency are in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements); the general mechanics of offline sync, erasure and retention are in the playbook and linked where they apply.

## How the Platforms Do It

Every platform holder offers a cloud for save files, and each has its own quota, sync moment and conflict rule. As of October 2026:

| Service | Limits | When it syncs | On conflict |
| --- | --- | --- | --- |
| **Epic Online Services Player Data Storage** | 200 MB per file, 400 MB and 1,000 files per user, 1,000 requests a minute | Online only; cross-platform | The game's own logic |
| **Game Center saved games** | Files per name, per player | System-managed | The app receives all conflicting versions and must resolve them |
| **Google Play Games saved games** | 3 MB per save, 800 KB cover image | On commit | A policy the game picks: manual, most recently modified, longest playtime, highest progress or last known good |
| **iCloud key-value store** | 1 MB total, 1,024 keys | System-managed | The system keeps the server's recent change and notifies the app |
| **Nintendo Switch Online Save Data Cloud** | Per compatible game; backups kept 180 days after a membership lapses, accessible on resubscribing | Automatic backup on by default for members | Per game; compatibility listed on each game's page |
| **PlayStation Plus cloud storage** (PS5) | Up to 100 GB of PS5 and 100 GB of PS4 saved data; 1,000 PS4 save files | When the game closes or the console enters rest mode, with automatic updates enabled; requires a PlayStation Plus membership | PS5 games sync "to the most recent data" |
| **Steam Cloud** | A byte quota and file count per user per game, set by the developer; 100 MB per write call | Before and after every session (Auto-Cloud on launch and exit); dynamic sync during a session on Steam Deck suspend, for apps that opt in | Steam shows a conflict window at launch; it "cannot automatically pick which version of the file to keep" |
| **Unity Cloud Save** | Player data: 2,000 keys and 5 MiB per access class; files: 1 GiB and 200 files per player | Online only | The game's own logic |
| **Xbox Game Saves** (formerly Connected Storage) | 256 MB per user per title, extendable through Microsoft; 16 MB per update with XGameSave, 64 MB per file with XGameSaveFiles | Local first, cloud when connected; every 30 minutes of play; one device holds the lock at a time | A system dialog asks the player which copy to keep |

Three patterns run through the table. **The platform clouds are file stores, not game logic.** They sync bytes; deciding which bytes are right is yours, and when they can't decide, most of them ask the player. **They are scoped to one platform.** A Steam Cloud save doesn't reach a PlayStation; cross-platform progress needs a backend that isn't any one platform's (EOS, Unity, PlayFab or your own). **They differ in what they promise after the subscription or the game ends.** PlayStation's and Nintendo's clouds are membership features; Nintendo keeps backups 180 days after a membership expires. A save design that relies on one of them inherits its terms.

## Where Progress Lives

There are three places to keep progress, and most live games use all three for different parts of it:

| Kind | What it is | Fits | Breaks when |
| --- | --- | --- | --- |
| **Local save** | A file on the device the game reads and writes | Single-player state, settings, anything the player may edit or lose without harming others | The device is lost, the player switches devices, or the file is edited to cheat |
| **Cloud-synced save** | The same file, copied to a platform cloud or your storage | Single-player progress that should follow the player across devices of one platform | Two devices play offline and diverge; the platform's cloud doesn't exist on the other device |
| **Server-authoritative progression** | State held by your backend; the client shows it and asks to change it | Anything with value to others or to the business: currency, items, rank, battle pass tiers, unlocks bought or earned in online play | The backend is down, or the game must work offline |

The dividing line is **whether the state matters to anyone but the player.** A single-player campaign's checkpoint can be a file: if the player edits it to give themselves infinite health, nobody else is harmed. A ranked tier, a currency balance or a tradeable item can't be: the client is untrusted ([Server Authority Is the First Defense](/books/gaming/anti-cheat#server-authority-is-the-first-defense)), so the server holds it and the client holds a cache. The same split decides what can be exported to a player and what can be deleted, so it's worth deciding per field, early.

My rule: **anything that was paid for, can be traded, is shown to other players, or decides a match is server-authoritative; everything else may be a file.** A free-to-play mobile game ends up almost entirely server-side; a premium single-player game ends up almost entirely in files plus a cloud copy; an online game with a campaign has both, and the campaign file must never contain anything the server should own, or a save edit becomes a currency exploit.

## Save Formats and Versioning

A save written today will be read by builds released for years. Every live game ships save migrations, and the ones that fail are the ones that weren't designed as migrations.

- **Every save has a format version** in its header, separate from the game's build version, incremented when the meaning of the data changes. The loader reads the version first and refuses to guess.
- **Migrations run forward, one step at a time.** A build that reads format 7 also carries migrations from 3 to 4, 4 to 5 and so on, and a save from format 3 walks through each. Each step is a pure function from one format to the next, tested against real saves from old builds kept as fixtures in CI.
- **Never write an older format.** Once a save is migrated and written, an older client can't read it. That matters with cross-device sync and staged rollouts: a phone on the new build migrates the cloud save, and a tablet still on the old build then can't load it. The loader on the old build must recognize "newer than I understand," keep the file untouched and ask the player to update, never overwrite it with an empty save ([Version Skew](/books/gaming/live-operations#version-skew)).
- **Unknown data survives.** A format that keeps fields it doesn't recognize (tagged fields, a key-value section) lets an old build round-trip a newer save without dropping what it can't read. Schema evolution in a self-describing format (Protocol Buffers, FlatBuffers, a versioned JSON envelope) gets this almost for free; a raw memory dump of structs never does.
- **Content IDs, not indexes.** A save that stores "item 42" by its position in this build's table breaks when the table is reordered. Store stable content IDs, and keep a mapping for anything renamed or removed, so a retired item becomes a compensation grant on load rather than a crash.

Server-side progression has the same problem with a different shape: the data is migrated in the database, under the zero-downtime rules any service follows ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations)), while clients on several builds still read it.

## Conflicts Across Devices

Two devices that play while disconnected produce two histories, and a cloud save has to pick. The general strategies (device wins, server wins, merge, per-command rules) are in [Conflicts: Choosing Who Wins](/docs/architecture/offline-sync#conflicts-choosing-who-wins), which also notes that "most recent" is a guess for saves. What the platforms do with it:

- **Ask the player.** Steam shows its conflict window when local files "differ from the ones stored on the cloud"; Xbox's system dialog offers "This console" or "The Xbox network (cloud data)", one overwriting the other. Steam's own support page warns that Offline Mode "is very likely to cause a conflict" and that Steam Support "cannot recover lost saves or assist in resolving cloud conflicts."
- **Hand both to the game.** Game Center tells the app when "multiple devices write to the same file while one or more of the devices are offline" and expects it to pick or merge and save again. Google Play Games returns both versions under its manual policy, which "ensures that no user changes to the state of the save game will ever be lost."
- **Pick by a game metric.** Google's other policies choose by most recent modification (which, Google says, may lose changes), longest played time, highest progress value, or last known good.
- **Avoid concurrency.** Xbox lets only one device at a time hold the user's save lock for a title, and a game can forcibly take the lock, "causing the other device to lose session data."

Asking the player works only if the prompt gives them what they need to choose. A dialog with two timestamps loses saves, because the player picks the newer one and the newer one is the five-minute session on the train. My default for a file save: **show both with game terms** (level, playtime, the last area, a thumbnail), default to the one with more progress rather than the newer one, and **keep the loser** as a recoverable backup rather than deleting it. Google's API supports exactly this, with played time and a progress value on each snapshot and a cover image.

For server-authoritative progression, conflicts are the server's job and are resolved per action, not per file: two devices that both claim a quest reward get one grant, keyed by the quest and the profile; two devices that both spend currency each post a ledger transaction, and the second fails if the balance can't cover it. There's no "pick a save" for that state, which is one more reason to keep valuable state on the server.

## Corruption, Backups and Recovery

Saves get corrupted: a crash mid-write, power loss, a full disk, a bug that writes garbage, a cloud sync that uploads half a file. Xbox's documentation is explicit that on power loss "any save operations that were active are lost." The defenses are old and cheap:

- **Write atomically.** Write the new save to a temporary file, flush it, then rename it over the old one, so a crash leaves either the old save or the new one, never half of each. Android's `AtomicFile` does exactly this ("writing to a new file and renaming it into the place of the original file after the write has successfully completed"), though it "does not confer any file locking semantics"; Apple's `.atomic` write option writes "to an auxiliary file first." Xbox's XGameSave applies each update to a container atomically: "If any part of it fails, the entire update fails."
- **Checksum every save** and verify on load, so corruption is detected rather than loaded.
- **Keep rotating backups.** The last few good saves on the device (and, for cloud saves, in the cloud), so a corrupt or regretted save rolls back to the previous one. Separate files for separate concerns also help: Steam recommends separate files for data that changes at different rates so unchanged state "will not be re-uploaded after every session," and a corrupt settings file then can't take the campaign with it.
- **Server-side history for server-side progression.** Append-only records (ledger entries, rating events, quest completions) are their own backup: a profile's state can be rebuilt by replaying them, and a bad migration or a bug's damage can be found and reversed by transaction. Snapshots of derived state are caches.

**Recovery is a support feature.** When a player writes in about a lost save, support needs to see the save history (versions, devices, conflicts and which side was kept) and restore a previous version with a recorded reason ([Player Support](/books/gaming/player-support)). My rule: a save restore is a support operation like a grant, logged with the ticket, the version restored and the agent, and the overwritten version is kept, not deleted.

## Cross-Progression

When one account plays on several platforms, progress has to follow it, and the platform agreements decide what may. The three cross-platform features, the platform rules and why entitlements carry a platform scope are in [Cross-Play, Cross-Progression and Cross-Purchase](/books/gaming/accounts-and-identity#cross-play-cross-progression-and-cross-purchase); this chapter adds what it means for saves.

Bungie's Cross Save rules for Destiny 2 show the shape most games end up with. The player picks one active account whose characters are reachable from every platform; characters on the other accounts "become dormant - you won't lose them, but you won't be able to access them either." DLC licenses "do not transfer between platform accounts," Silver (the paid currency) bought on the active account "can only be used on the platform on which it was purchased" while items bought with it work everywhere, and turning Cross Save off and on again has a 90-day wait that "exists to discourage activity like account recoveries by other players."

The patterns to take from it:

- **Progression crosses; some purchases don't.** Characters, levels and earned items move with the account; paid currency and some licenses stay scoped to the store that sold them, which is the `platform_scope` column on entitlements ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#how-to-build-it)). A wallet holds one currency, so paid currency scoped to a store is a currency code of its own per platform (`SILVER_PSN`, `SILVER_STEAM`), shown to the player as one name.
- **Choose, don't merge.** Destiny doesn't merge characters from two accounts; the player chooses which set is active. Merging two progressions is a game design problem (which level wins? both inventories?), and [Merging](/books/gaming/accounts-and-identity#merging) covers the account side.
- **Platform-specific saves don't cross by themselves.** A Steam Cloud save is invisible to a PlayStation. Cross-progression for file-based progress means moving the authoritative copy to a backend all platforms reach, and treating each platform cloud as a local cache of it.

## Player Data Rights in a Live Game

A game holds a lot of personal data: the account, linked platform identities, purchases, chat, voice clips attached to reports, match history, telemetry. Players have rights over it, and the general machinery (export jobs, an erasure pipeline that fans out to every store, keeping proof) is in [GDPR](/docs/compliance/gdpr#data-subject-rights) and [Data Retention](/docs/architecture/data-retention#erasure-requests). Under GDPR a controller answers "within one month," extendable by two more for complex or numerous requests; under the CCPA, within 45 calendar days, extendable by 45 more with notice. The game-specific part is that much of a game's data is about more than one player, or is evidence, or is money.

### Access and Portability

GDPR Article 15 gives the player a copy of their personal data; Article 20 gives them the data they provided "in a structured, commonly used and machine-readable format" where processing is by consent or contract and automated. For a game, the export includes:

- **The account and its links:** identities, sign-ins, security events.
- **Purchases and the ledger:** receipts, grants, currency transactions, refunds.
- **Profiles and progression:** per game, the progression state, inventory and settings, and the save files you hold.
- **Match history and stats** for the player's own participation.
- **Communications and reports:** chat they sent, reports they filed, penalties issued to them with reasons.

What it excludes is other people's personal data. A match record names nine other players; a chat log has the other side of the conversation; a report about the player names the reporter. The export pseudonymizes or removes other players: match participants as opponents without identifiers, chat as the player's own messages, reports against them without the reporter. My rule is that the export is a product feature built once, with each service contributing its section, not a query an engineer runs per ticket.

### Erasure Against Append-Only Records

Article 17 lets a player ask for erasure, and 17(3) carves out processing needed "for compliance with a legal obligation" or "for the establishment, exercise or defence of legal claims." The CCPA's deletion right has similar exceptions, including "certain business security practices" and complying with legal obligations. A game has four kinds of record that run into erasure:

- **Money.** Purchase records and the currency ledger are financial records, kept for tax and accounting. The playbook's answer applies: no personal data in ledger rows, the account scrubbed, the IDs kept so the books balance ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **Penalties and ban evasion.** A banned cheater who deletes their account and signs up again must not get a clean slate. Keep what fraud and security require (the penalty, the hashed hardware and identity signals, for a defined retention) and say so in the privacy notice. Riot's privacy notice is a public example: on deletion it deletes personal info used to provide the service "but will keep some account-related personal info (your match history, for instance) for other defined purposes such as security and fraud detection," and it states retention periods for reported chat (7 days if no action is taken, up to 2 years if action is taken). The retention must be bounded and purpose-bound; "we keep everything in case" is not an exception the law recognizes.
- **Shared records.** A completed match belongs to ten players. Deleting one player's participation would change the other nine's history and break rating recalculation. Pseudonymize: the participant row keeps its result and an opaque ID, the profile it pointed to is scrubbed, and displays show "deleted player."
- **Leaderboards, replays and esports records.** A leaderboard entry or a public replay shows a name. On erasure the name goes (the entry shows a placeholder or is removed and the board re-ranked, a per-game decision), and replays either re-render without the name or expire on their normal retention ([Replays and Server Recordings](/books/gaming/telemetry#replays-and-server-recordings)). Official tournament results are often public records a league is entitled to keep; decide that in the ruleset, before the request.

Telemetry and the warehouse are where erasure usually fails. Events keyed by account or profile ID need the same pseudonymization or deletion in the raw store and every model built from it ([Erasure Requests](/docs/architecture/data-retention#erasure-requests)); a warehouse that can't find a player's events can't erase them.

### Account Deletion the Stores Require

Apple and Google turned erasure into a client feature:

- **Apple** (Guideline 5.1.1(v), enforced from 30 June 2022): apps that support account creation must let users start account deletion inside the app, and must "delete the entire account record, along with associated personal data"; "only offering to temporarily deactivate or disable an account is insufficient." Apps with Sign in with Apple revoke the user's tokens through its REST API. A manual process is acceptable if the app tells the person how long it will take, and if some data must be kept by law, the app says what.
- **Google Play** requires both an in-app path and "a web link resource where users can request app account deletion" without reinstalling, with data kept for "security, fraud prevention or regulatory compliance" disclosed in the Data safety form. The deadline was 7 December 2023, with extensions to 31 May 2024.

The publisher account spans games, so deleting it from inside one mobile game deletes it everywhere, including PC and console progress. That has to be said in the flow, in plain words. Riot's deletion page shows one design: deletion covers the whole account "including the progress and content for all of our games," and after queuing it the player has 30 days to change their mind, after which the account "will not be recoverable."

My deletion flow:

1. **Re-authenticate** (a deletion request is a takeover target) and show what will be deleted across every game, what will be kept and why, and what happens to unspent currency and subscriptions.
2. **Lock the account** (`locked`, so no purchases, trades or sign-ins) and start a grace period, with a way to cancel by signing in.
3. **At the end of the grace period,** run the erasure fan-out: every service scrubs or deletes, platform links are removed, Sign in with Apple tokens are revoked, and the account becomes `closed`.
4. **Keep proof** of the request and its completion, without the erased data.

A paid currency balance at deletion is a consumer-law question as much as a technical one ([Loot Boxes & Consumer Law](/books/gaming/consumer-law-and-loot-boxes)); the flow must at least state, before the player confirms, that it is forfeited.

## How to Build It

The chapter's additions to the [core data model](/books/gaming/games-business#the-core-data-model): save slots with their revision history and conflicts, and data requests with their per-service steps.

```sql
CREATE TABLE save_slots (                     -- one named save per profile
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  player_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  slot_name         TEXT NOT NULL,            -- 'campaign_1', 'settings', 'photo_mode'
  current_revision_id UUID,                   -- set after the first revision
  platform_scope    TEXT,                     -- null: follows the account; otherwise one platform
  UNIQUE (player_profile_id, slot_name)
);

CREATE TABLE save_revisions (                 -- append-only; the blob lives in object storage
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  save_slot_id      UUID NOT NULL REFERENCES save_slots (id),
  parent_revision_id UUID REFERENCES save_revisions (id),  -- what the device last synced
  format_version    INTEGER NOT NULL,         -- the save format, not the build
  build_id          UUID NOT NULL REFERENCES builds (id),
  device_ref        TEXT NOT NULL,            -- which install wrote it
  blob_uri          TEXT NOT NULL,
  blob_sha256       TEXT NOT NULL,
  size_bytes        BIGINT NOT NULL,
  played_seconds    BIGINT,                   -- shown when the player chooses
  progress_value    BIGINT,
  summary           JSONB NOT NULL DEFAULT '{}',  -- level, area, thumbnail ref
  written_at        TIMESTAMPTZ NOT NULL,     -- device clock; for display only
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ               -- old revisions age out; current never does
);

CREATE TABLE save_conflicts (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  save_slot_id      UUID NOT NULL REFERENCES save_slots (id),
  revision_a_id     UUID NOT NULL REFERENCES save_revisions (id),
  revision_b_id     UUID NOT NULL REFERENCES save_revisions (id),
  kept_revision_id  UUID REFERENCES save_revisions (id),   -- null while unresolved
  resolved_by       TEXT CHECK (resolved_by IN ('player', 'policy', 'support')),
  policy            TEXT,                     -- 'highest_progress', 'manual', ...
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_requests (                  -- access, export or erasure, per account
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  account_id     UUID NOT NULL REFERENCES accounts (id),
  kind           TEXT NOT NULL CHECK (kind IN ('access', 'export', 'erasure', 'account_deletion')),
  regime         TEXT NOT NULL,              -- 'gdpr', 'ccpa', 'store_policy', ...
  channel        TEXT NOT NULL CHECK (channel IN ('in_game', 'web', 'support', 'platform')),
  status         TEXT NOT NULL CHECK (status IN ('received', 'verified', 'grace_period',
                   'in_progress', 'completed', 'cancelled', 'rejected')),
  due_at         TIMESTAMPTZ NOT NULL,        -- from the regime's deadline
  grace_ends_at  TIMESTAMPTZ,                 -- deletion only
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_request_steps (             -- one per service that holds the player's data
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  request_id  UUID NOT NULL REFERENCES data_requests (id),
  service     TEXT NOT NULL,                  -- accounts, ledger, saves, matches, chat, warehouse
  action      TEXT NOT NULL CHECK (action IN ('exported', 'deleted', 'pseudonymized',
                'retained')),
  retained_reason TEXT,                       -- 'tax_record', 'penalty_evasion', 'legal_hold'
  retain_until DATE,
  status      TEXT NOT NULL CHECK (status IN ('pending', 'done', 'failed')),
  done_at     TIMESTAMPTZ,
  UNIQUE (request_id, service),
  CHECK (action <> 'retained' OR (retained_reason IS NOT NULL AND retain_until IS NOT NULL))
);
```

Notes on the sketch:

- **A save is a chain of revisions.** The device uploads a revision with the parent it last synced. If the parent is the slot's current revision, it becomes current; if not, another device got there first and the server opens a `save_conflicts` row with both, rather than overwriting. This is optimistic concurrency on a file ([Transactions & Concurrency](/docs/database/transactions-and-concurrency)), and it never loses either side.
- **The server orders by what it received, not by the device clock.** `written_at` is shown to the player; `received_at` and the parent chain decide.
- **The blob is opaque to the backend,** except for its hash, size and the summary the client declares for display. Anything the backend needs to trust (currency, unlocks) is not in the blob at all.
- **Old revisions expire;** the current revision and the revision kept by a conflict don't, until the next one replaces them. Support restores by making an old revision current with a recorded reason.
- **A data request is a plan plus steps,** like an account merge: each service handles it idempotently on the request ID and reports what it did. A `retained` step must name its reason and end date, so "what did you keep and why" has a row-level answer. The request completes only when every step is `done`.
- **Account deletion uses the account states** from [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#how-to-build-it): `locked` during the grace period, `closed` when complete.
- **Events:** `save.revision_accepted`, `save.conflict_opened`, `data_request.received` and `account.deleted` go through the outbox; `account.deleted` is what every service, the warehouse and every vendor holding player data must consume ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

- **Save history.** Every revision, the device and build that wrote it, every conflict and which side was kept by whom, and every support restore with its ticket. "My save disappeared" is answered from this.
- **Data requests.** Receipt, identity verification, each service's step, what was retained and why, and the completion date against the deadline. Regulators ask for this record, and it must not contain the data that was erased ([Privacy Erasure and the Audit Store](/docs/architecture/audit-trails#privacy-erasure-and-the-audit-store)).
- **Retention exceptions.** The policy behind each retained category (penalty evidence, financial records, match history for fraud), its period, and the purge jobs that enforce it, with legal holds recorded.
- **Deletion flows by channel.** Which requests came from the iOS app, the Android web link, the website or support, so the store requirements can be shown to work.

## What This Means for the System You Build

- **Decide per field where progress lives:** paid, traded, public or competitive state on the server; everything else may be a file.
- **Treat platform clouds as per-platform caches** with their own quotas, sync moments and terms, and put cross-platform progress on a backend every platform reaches.
- **Version every save format,** migrate forward step by step against fixture saves in CI, and never let an old build overwrite a save it can't read.
- **Resolve conflicts in game terms,** defaulting to more progress rather than the newer clock, and keep the losing side.
- **Write saves atomically, checksum them and keep backups,** with server-side progress rebuildable from append-only records.
- **Make save restore a logged support operation.**
- **Build export and erasure as features,** with per-service steps, other players' data excluded from exports, and shared records pseudonymized rather than deleted.
- **Keep what fraud, ban evasion and the books require,** for a stated period and purpose, and say so in the privacy notice and the deletion flow.
- **Ship in-app and web account deletion,** with re-authentication, a cancellable grace period, a clear statement of what is lost across every game, and token revocation.

## References

**Specifications**

- [GDPR Article 12](https://gdpr-info.eu/art-12-gdpr/), one month to respond, extendable by two, free of charge
- [GDPR Article 15](https://gdpr-info.eu/art-15-gdpr/), the right of access and a copy of the data
- [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/), erasure and the 17(3) exceptions for legal obligations and legal claims
- [GDPR Article 20](https://gdpr-info.eu/art-20-gdpr/), portability in a structured, commonly used and machine-readable format
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), the right to delete and its exceptions, and the 45-day response with a 45-day extension (updated August 28, 2026)
- [Apple: Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/), deleting the whole account record, Sign in with Apple token revocation, timing and retained data
- [Apple: Account deletion requirement starts June 30](https://developer.apple.com/news/?id=12m75xbj), the enforcement date (May 24, 2022)
- [Google Play: Understanding app account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111), the in-app path, the web link resource, disclosed retention and the 2023 and 2024 deadlines

**Reference**

- [Steamworks: Steam Cloud](https://partner.steamgames.com/doc/features/cloud), the Cloud API and Auto-Cloud, per-user quotas, write limits, sync before and after sessions, separate files and dynamic cloud sync
- [Steam Support: Steam Cloud](https://help.steampowered.com/en/faqs/view/68D2-35AB-09A9-7678), the conflict window, Offline Mode and support's inability to recover saves
- [PlayStation: PlayStation Plus cloud storage for PS5 consoles](https://www.playstation.com/en-us/support/subscriptions/ps5-ps-plus-cloud-storage/), 100 GB each for PS5 and PS4 saves, the 1,000-file PS4 limit and auto-sync
- [Microsoft Learn: Game Saves storage systems](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-save/game-saves-storage-systems), the 256 MB per-user per-title limit and local-first saving
- [Microsoft Learn: XGameSave API overview](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-save/xgamesave), containers and blobs, atomic updates, 16 MB and 64 MB limits and one device at a time
- [Microsoft Learn: Understanding the Game Saves sync flow](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-save/game-saves-syncing), offline mode, 30-minute periodic sync, lock takeover and power loss
- [Microsoft Learn: Game Saves system dialogs](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-save/game-saves-dialogues), the conflict dialog and its causes
- [Nintendo: Save Data Cloud after a membership expires](https://www.nintendo.com/au/support/articles/after-my-nintendo-switch-online-subscription-expires-will-my-save-data-cloud-files-and-nintendo-entertainment-system-nintendo-switch-online-save-data-be-erased/), access restored on resubscribing within 180 days
- [Nintendo: Enable or disable automatic save-data backups](https://en-americas-support.nintendo.com/app/answers/detail/a_id/41209/), automatic backup on by default
- [Nintendo: Which games are compatible with Save Data Cloud](https://en-americas-support.nintendo.com/app/answers/detail/a_id/41267/), compatibility identified per game
- [Apple: NSUbiquitousKeyValueStore](https://developer.apple.com/documentation/foundation/nsubiquitouskeyvaluestore), the 1 MB and 1,024-key limits
- [Apple: player(_:hasConflictingSavedGames:)](https://developer.apple.com/documentation/gamekit/gksavedgamelistener/player(_:hasconflictingsavedgames:)), how Game Center saved games conflict and must be resolved
- [Apple: NSData.WritingOptions.atomic](https://developer.apple.com/documentation/foundation/nsdata/writingoptions/atomic), writing to an auxiliary file and replacing the original
- [Android Developers: Cloud save](https://developer.android.com/games/pgs/savedgames), the 3 MB save and 800 KB cover image limits (last updated October 6, 2026)
- [Google: SnapshotsClient](https://developers.google.com/android/reference/com/google/android/gms/games/SnapshotsClient), the conflict resolution policies
- [Android Developers: AtomicFile](https://developer.android.com/reference/android/util/AtomicFile), write-then-rename and no locking semantics
- [Epic Games: Player Data Storage Interface](https://dev.epicgames.com/docs/epic-online-services/player-and-game-data/player-data-storage-interface/player-data-storage-overview), per-file and per-user limits, request rate and cross-platform use
- [Unity: Cloud Save player data](https://docs.unity.com/en-us/cloud-save/concepts/player-data), 2,000 keys and 5 MiB per access class
- [Unity: Cloud Save files](https://docs.unity.com/en-us/cloud-save/concepts/files), 1 GiB and 200 files per player

**In practice**

- [Bungie: Destiny 2 Cross Save Guide](https://help.bungie.net/hc/en-us/articles/360049498031-Destiny-2-Cross-Save-Guide), the active account, dormant characters, DLC licenses and the 90-day wait
- [Bungie: Destiny Silver Purchases Guide](https://help.bungie.net/hc/en-us/articles/360049497091-Destiny-Silver-Purchases-Guide), Silver usable only on the platform where it was bought
- [Riot Games: Privacy Notice](https://www.riotgames.com/en/privacy-notice), match history kept after deletion for security and fraud, and chat report retention (last modified April 28, 2026)
- [Riot Support: Deleting your Riot account and all your data](https://support.riotgames.com/en-us/riot/account/deleting-your-riot-account-and-all-your-data), deletion across all games and the 30-day window (June 2, 2026)
