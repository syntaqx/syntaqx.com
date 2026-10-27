+++
title = "Offline-First Sync"
description = "Apps that work without a network: a scoped local store, commands in a device outbox, attachments apart, two clocks, and conflict rules decided per command type."
category = "Architecture"
order = 413
tags = ["architecture", "offline", "sync", "mobile", "conflicts"]
+++

Most apps assume the network and cache around its absence. Some can't: a cashier whose store internet just dropped, an inspector on a rural site, a player on a plane, a crew working in a basement. For those, losing the network can't mean losing the work, and when it comes back, the device and the server have to agree again without anyone retyping anything.

## Offline-First, Not Cached

An **offline-first** app reads and writes a local database, always, and a background process reconciles that database with the server. The network is an optimization, not a dependency. An online app with a cache is the opposite: the server is the truth, the cache is a hint, and writes fail without a connection.

Offline-first means every screen reads local state and every action can be replayed later, against a server that may have changed meanwhile. That can't be retrofitted cheaply, so decide it at the start, for the flows that need it, and keep the rest online.

## A Scoped Local Store

The device holds a database, SQLite on mobile, with exactly what the user needs to work offline and nothing more. A point of sale gets the catalog, prices and tax rules for one store. An inspection app gets the assigned sites, their history and the checklist definitions. A game keeps the player's saves and the content they own. A field service app gets today's jobs and the customers on them.

Microsoft's Dynamics 365 calls this an offline profile, with sync intervals per table from five minutes to one day, and removes records from the device once they no longer match its filters. Whatever the name:

- **The scope is a server-side, versioned definition per role.** The server computes what a user's device may hold, the same way it computes what they may read through the API.
- **The scope is a security boundary.** Phones are lost and stolen far more often than servers are breached. A store's tablet shouldn't hold the whole customer list; the rules in [Authorization](/docs/security/authorization) apply to what you sync, not only to what you serve.
- **Data expires.** Records age out of scope, sign-out wipes the store, and the store is encrypted with a key the platform keystore protects.
- **Reference data carries versions.** Every answer or price recorded offline is bound to the form or price list version used, so the server can tell "priced from yesterday's list" from "priced wrong."

## Commands, Not Diffs

Record what the user did, not the row it produced. "Completed inspection 0194... at 14:02 with these answers" is a **command**. "Set `status` to `completed` and `completed_at` to 14:02" is a diff.

A command carries intent, so the server can validate it against current state: accept it, accept it with a note, or route it to a person. A diff can only be applied or overwritten. If the office cancelled the inspection while the inspector was offline, the diff silently resurrects it; the command produces a conflict someone can resolve. As in [Events & Async Messaging](/docs/architecture/events), a command can be rejected and an event can't: the server's acceptance of a queued command is the event the rest of the system hears about.

## The Device Outbox

Every user action does two things in **one local transaction**: it updates the local store so the screen reflects it immediately, and it appends a command to an outbox. It's the [transactional outbox](/docs/architecture/events#the-transactional-outbox) again, with the device as the producer and the network as the broker.

```sql
-- SQLite, on the device
CREATE TABLE outbox_commands (
  id                 TEXT PRIMARY KEY,  -- UUID v7, generated on the device
  sequence           INTEGER NOT NULL,  -- device-local order
  kind               TEXT NOT NULL,     -- 'inspection.complete', 'sale.record', ...
  entity_id          TEXT NOT NULL,
  base_version       INTEGER,           -- version the user was looking at
  payload            TEXT NOT NULL,     -- JSON
  device_recorded_at TEXT NOT NULL,     -- what the device clock said, RFC 3339
  attempt_count      INTEGER NOT NULL DEFAULT 0,
  last_error         TEXT
);
```

- **Client-generated IDs.** The command's ID is a [UUID v7](/docs/fundamentals/identifier-conventions) created on the device, as is the ID of anything it creates (a customer, a sale, an inspection). The device can refer to a record the server hasn't seen, and the server uses the command ID to [deduplicate retries](/docs/payments/idempotency).
- **Base versions.** Each synced record carries a server version, and each command carries the version the user saw. Without it, the server can't tell "changed after you looked" from "unchanged." It's [optimistic concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency) with a very long gap between read and write.
- **Ordered per entity.** ServiceNow's mobile app replays queued actions in the order they were triggered; a failed one is marked with an error and not retried automatically, while the rest continue. That's the right shape, like a [dead-letter queue](/docs/architecture/events#when-processing-fails), with one refinement for causal order: a later command that depends on a failed one waits, since it was written against state the server never accepted.
- **The server acknowledges, then the device deletes** the command and pulls the resulting versions. Retries back off, per [Retries & Timeouts](/docs/architecture/retries-and-timeouts).

Let the user see the queue: "3 changes waiting to sync," and which failed. An invisible outbox turns every sync bug into "I did it and the system lost it."

## Attachments on a Separate Lane

Photos, signatures, scanned documents and voice notes are large and slow, and they shouldn't hold up a two-hundred-byte status change. Upload them on their own lane:

- **Resumable, keyed by content hash,** so an interrupted upload continues instead of restarting, and the same photo sent twice is stored once.
- **Commands reference attachments by ID.** "Inspection completed, photos A, B and C" syncs immediately; the server records the inspection and marks the photos as pending until they arrive.
- **Upload on the platform's background transfer service** where one exists. On iOS, Apple's background `URLSession` lets transfers continue while the app is suspended, relaunching the app when they finish, but only uploads from a file survive the app exiting, so write the attachment to disk first.

## Background Execution Is Rationed

Users expect the queue to drain when the signal comes back, whether or not the app is open. The platforms ration that differently, and the outbox has to work within both.

- **Android:** WorkManager persists scheduled work across app restarts and device reboots, with constraints such as network availability and a configurable exponential backoff. Enqueue a sync job with a network constraint whenever the outbox gains a command, and let the system run it.
- **iOS:** the background task framework is opportunistic. Apple's guidance says the system decides when to launch a background task, and an app refresh task gets up to 30 seconds of runtime. Processing tasks for heavier work are scheduled for low-activity periods, such as overnight while charging.

So drain the outbox on launch, on resume and on every connectivity change, and treat background execution as a bonus.

Detecting "online" is its own problem. The OS reporting a network doesn't mean the server is reachable. Salesforce's field app, for one, checks its API connection every 15 seconds while online and waits for three failed requests before going offline and three successful ones before coming back. Hysteresis like that keeps an app from flapping on one bar of signal.

## Two Clocks

Every offline action has two times: when the user did it, by the device clock, and when the server learned about it. Store both, never let one overwrite the other, and name them for what they are (`device_recorded_at`, `received_at`), per [Time & Date Formats](/docs/fundamentals/time).

A sale rung up at 2:02 PM and synced at 6:40 PM is a 2:02 PM sale for the receipt, the tax period and the cashier's shift; the 6:40 PM receipt explains why the dashboard didn't show it.

Device clocks drift, and users change them, sometimes on purpose (a timesheet, a game's daily reward). So at each sync, estimate the device's offset from the server and store it with that session's commands. The NTP calculation in RFC 5905 works for a single request: with the client's send time T1, the server's receive time T2, the server's reply time T3 and the client's receive time T4, the offset is `((T2 - T1) + (T3 - T4)) / 2`. It assumes the trip out and the trip back take about the same time, which is good enough to flag a device that's hours off.

Keep the raw device time and the measured offset; derive a corrected time when you need one. Don't trust device time for anything that grants value: a time-limited offer, a reward cooldown or a deadline is checked against the server clock.

## Conflicts: Choosing Who Wins

Offline means two people, or one person on two devices, can change the same thing without seeing each other. The strategies sit on a spectrum:

| Strategy | What happens | Where it breaks |
| -------- | ------------ | --------------- |
| Record level, device wins | The offline version of the record overwrites the server's | The other person's change silently disappears |
| Record level, server wins | The server's version overwrites the offline one | Work done offline is lost or has to be redone |
| Field-level merge | Edits to different fields both survive | Fields that only make sense together (a start and end time) merge into something neither person made |
| Merge by data type (CRDTs) | Concurrent edits to different parts merge automatically | Same-property edits still need a rule; the change history grows |
| Rules per command type | The server applies domain rules for each kind of command | Every command type needs a decision, and some need a person |

Dynamics 365 is a documented example of the first two. Its conflicts are at the table level, not the field level ([Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/offline-data-sync)): a technician changing a work order's start time and a dispatcher changing its end time is a conflict, and the system "doesn't try to merge changes field by field." With conflict detection off (the default) the technician's offline changes win; with it on, the dispatcher's do. Either way someone's work is lost.

Games face the same choice with cloud saves. Google's Play Games Services [hands the game both versions](https://developer.android.com/games/pgs/android/saved-games) of a conflicting save, the server's and the local one, and the game must pick one or merge them; the policy in Google's own sample keeps the most recently modified. "Most recent" is a guess, though: a save with ten more hours of progress can be older by the clock, which is why many games ask the player.

**CRDTs** (conflict-free replicated data types) are the local-first answer. A CRDT is a data structure whose replicas can each be changed independently and concurrently, and whose merge is deterministic: any two replicas that have received the same updates reach the same state, whatever order the updates arrived in, without a central server deciding ([crdt.tech](https://crdt.tech/)). Convergence isn't intent, though. Ink & Switch's *Local-first software* essay notes that when two users change the same property, a CRDT can keep both values and leave the choice to the application or the user. They fit collaborative documents, notes and design tools, where every replica is a peer and the data is the user's own; the essay is candid that the change history grows and is hard to truncate. For business records with rules (an order that can't be fulfilled once cancelled, stock that can't go below zero), a CRDT merges the data and still leaves the business decision to you.

My recommendation: **decide per command type, and log every conflict.** For most apps the rules fall into a few groups:

- **Facts from the device win.** A reading, a photo, a signature, a sale, a completed inspection item: it happened. The server never discards it because the record moved; if the job was reassigned meanwhile, the work is still recorded and the reassignment becomes the thing to fix.
- **Plans from the server win.** Schedules, assignments, prices and permissions belong to the office or the system. The device takes the server's version on the next pull.
- **State transitions are checked, not overwritten.** "Complete" on a cancelled inspection, "pay" on a voided order: route these to a review queue with both sides visible, and notify whoever owns the plan, not the person who has moved on.
- **Free text appends.** Two people's notes are two notes.
- **Ask the user only when they're the right judge** and still in context, like a player choosing between two saves on launch.

Record every conflict with both versions, the rule applied and who resolved it. When a customer says the work was done and the system says otherwise, the conflict log is the first place anyone looks.

## What Stays Online

Some operations depend on state only the server has right now. Mark them online-only, and make the screen say so:

- **Claims on shared, scarce things:** the last seat, a stock reservation, a unique username, a booking slot. Two offline devices can both "take" it. Offline, record an intent and confirm it on sync, with the user told it's pending.
- **Payment authorization.** Some card terminals can store card payments offline and submit them later, but the risk moves to the merchant. Square's offline mode, for example, makes the seller [responsible for any expired, declined or disputed payments](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode) accepted offline, lets them cap the amount per transaction, and expires payments not uploaded within 72 hours. Treat that as a separate, limited state, never a normal approval, and per [Payment States](/docs/payments/payment-states) keep it distinct from authorized.
- **Signing in and changing credentials or permissions.** The device can keep a session alive within its expiry; it can't grant itself new access.
- **Anything that grants value from the client's word:** rewards, refunds, balance changes. The client is untrusted, as [Mobile Releases](/docs/delivery/mobile-releases) puts it, and offline makes that more true, not less.

## Native, React Native or a PWA

| Choice | Strengths | Costs and limits |
| ------ | --------- | ---------------- |
| **Native** (Swift, Kotlin) | Full access to background work, background transfers, Bluetooth peripherals, cameras, payment SDKs and device management | Two codebases and two teams |
| **React Native** | One JavaScript codebase rendered with native code, with native modules where needed | Native work still appears at the edges (background sync, payments, printers); upgrades take discipline |
| **Progressive web app** | One codebase, instant deployment, no store review | The Background Synchronization API is not Baseline and doesn't work in some widely used browsers; browser storage can be evicted, and Safari can clear a site's data after seven days of use without interaction unless the PWA is installed |

For an app that must work offline for days, take payments or talk to scanners and printers, a PWA is the wrong default: the parts it can't do reliably are the parts that matter. It's fine for light needs, like queueing a form while the tab is open. A web view inside a native shell suits content-heavy screens, as long as the database, outbox and background sync live in native code.

Whatever the choice, the sync protocol and the local database are the product, and they deserve the most senior engineers on the team. A local schema migration runs on every device and can't be rolled back, so it ships behind a kill switch, per [Mobile Releases](/docs/delivery/mobile-releases).

## Checklist

- **Define the device's scope on the server,** per role, versioned, expiring and wiped on sign-out.
- **Record commands, not diffs,** with client-generated UUID v7 IDs, base versions and device time, in an outbox written in the same transaction as the local change.
- **Drain in order per entity,** and don't let one failed command block the others.
- **Move attachments on a separate, resumable lane.**
- **Store both clocks and the measured offset.**
- **Decide conflicts per command type,** log every one, and give state conflicts a review queue with an owner.
- **List what stays online,** and show the user the queue.

For one industry's version of all of this, see [The Technician App](/books/field-operations/technician-app).

## References

**Specifications**

- [RFC 5905: Network Time Protocol Version 4](https://www.rfc-editor.org/rfc/rfc5905.html), the clock offset and round-trip delay calculation from four timestamps

**Reference**

- [Android Developers: Persistent work](https://developer.android.com/develop/background-work/background-tasks/persistent), WorkManager persistence across restarts and reboots, constraints and exponential backoff
- [Apple: Choosing background strategies for your app](https://developer.apple.com/documentation/backgroundtasks/choosing-background-strategies-for-your-app), the system choosing when background tasks run and the 30-second refresh window
- [Apple: Downloading files in the background](https://developer.apple.com/documentation/foundation/downloading-files-in-the-background), background sessions continuing while suspended, and file-only uploads after the app exits
- [MDN: Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API), deferred service-worker sync and its limited availability
- [web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web), browser eviction, persistent storage and Safari's seven-day rule
- [React Native](https://reactnative.dev/), JavaScript components rendered with native platform UI
- [Microsoft Learn: Configure offline data synchronization](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/offline-data-sync), offline profiles, sync intervals, table-level conflicts, the conflict detection setting and data removal
- [ServiceNow: Action item general guidelines](https://www.servicenow.com/docs/r/mobile/action-item-general-guideline.html), the ordered offline outbox and no automatic retry of failed actions
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), automatic offline mode health checks and switching thresholds
- [Android Developers: Saved games](https://developer.android.com/games/pgs/android/saved-games), Play Games Services conflicts between server and local saves, and offline saves synced on reconnect

**In practice**

- [crdt.tech: About CRDTs](https://crdt.tech/), replicas changed concurrently and merged automatically into a consistent state without a single server
- [Ink & Switch: Local-first software](https://www.inkandswitch.com/essay/local-first/), the local-first ideals, CRDT merging, the same-property exception and the costs of history growth
- [Square: Process card payments with offline mode](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode), seller liability for offline payments, per-transaction limits and the 72-hour upload window
