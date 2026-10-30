+++
title = "Files, Sync & Storage"
description = "Dropbox block sync and Magic Pocket, Box, OneDrive and SharePoint, Google Drive: conflicts, versions, ransomware, ownership, pooled quotas and scanning."
category = "Workplace & Collaboration Industry"
order = 2025
part = "Docs, Wikis and Files"
tags = ["workplace", "files", "sync", "storage", "versioning", "ransomware"]
+++

A company's files are its oldest collaboration system and still its largest. Contracts, spreadsheets, CAD drawings, video, exports from every other tool: they live in a sync-and-share platform that has to look like a local folder on every laptop, a web app in every browser, a mobile app on every phone and an API for every integration, and stay consistent across all of them while people rename folders, work offline and share with outsiders. Then the business rules land on top: files belong to the company, not the employee who uploaded them; storage is bought as a pool; a ransomware infection on one laptop must be reversible across the whole tenant; and a file under legal hold can't be deleted by anyone, including the version-trimming job.

Consumer file sync has the same engineering and different duties. In a personal Dropbox the account holder owns everything; in a business tenant the organization does, and its admins decide sharing outside the company, retention, version limits, malware handling and what happens to a leaver's files. This chapter covers how the major platforms sync, how they store, how they handle conflicts, versions and ransomware, where the size limits sit, how ownership and pooled quotas work, and the scanning and preview pipeline. The upload mechanics themselves are [File Uploads](/docs/architecture/file-uploads); the generic object storage layer is the Hosting & Cloud volume's [Storage](/books/hosting-and-cloud/storage); retention and holds as a system belong to [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold).

## How the Platforms Do It

As of October 2026:

| Platform | Ownership model | Max file size | Version history | Bulk recovery | Storage pool |
| --- | --- | --- | --- | --- | --- |
| **Dropbox** | Member folders and team folders | 2 TB (web uploads over 375 GB may time out) | 30 days (Basic, Plus) to 365 days (Business Plus, Advanced, Enterprise) | Rewind, within version history | Team storage |
| **Box** | Folders with waterfall permissions | 250 MB (free) to 500 GB (Enterprise Advanced) | Not researched here | Not researched here | Enterprise storage |
| **OneDrive and SharePoint** | OneDrive per user; SharePoint sites per group or team | 250 GB | Admin-set count and age limits; 50,000 major versions maximum | Restore OneDrive to any point in the last 30 days | 1 TB plus 10 GB per license for SharePoint, separate from OneDrive |
| **Google Drive** | My Drive per user; shared drives owned by the organization | 5 TB for non-Google files | Not covered here | Not covered here | Pooled per user: 30 GB (Business Starter), 2 TB (Standard), 5 TB (Plus) |

The choice that shapes everything else is **who owns a file**. Personal ownership (My Drive, OneDrive, a Dropbox member folder) is natural for drafts and fails at offboarding, because the file's fate is tied to an account that will be deleted. Container ownership (shared drives, SharePoint sites, Dropbox team folders) ties the file to a team that outlives any member. Every platform has both, and the admin's job is to push durable content into containers.

## Block-Level Sync

Dropbox's public write-ups are the most complete description of a sync engine. Its 2014 post on streaming sync lays out the base design:

- **Files are split into 4 MB blocks**, the last possibly smaller, and each block is hashed with SHA-256. A file's contents are its **blocklist**, the list of block hashes.
- **Commit asks what's missing.** A client commits a file by sending the blocklist to the metadata server, which checks that the blocks exist and that the user can write to the namespace. If any are unknown, the server replies "need blocks," the client uploads only those, and retries. A one-line change to a large file uploads one block; a file that already exists anywhere in the system uploads nothing.
- **The metadata log is append-only.** A successful commit adds a row to the Server File Journal, and clients follow the journal to learn about changes.
- **Streaming sync** let blocks of an uncommitted file flow to other clients before the commit, so a downloading client is nearly finished when the commit lands; the post reports up to 2x lower sync latency for large new files.

Content addressing gives deduplication for free, and with it two business rules. A block shared by many files is deleted only when no file version, in any tenant, references it; and deduplication across tenants means a hash lookup can reveal that a file exists somewhere, so cross-tenant dedup must never be observable to a client. The UGP volume's [Exact and Perceptual Dedup](/books/user-generated-platforms/storage-and-delivery#exact-and-perceptual-dedup) covers the same trade in media hosting.

## The Sync Engine

Dropbox's 2020 posts describe rewriting the desktop engine (from "Sync Engine Classic" to **Nucleus**, in Rust) because the old data model lacked stable file identifiers across moves and had few consistency guarantees, a design "for a simpler world without sharing." Nucleus persists observations rather than pending work, in three trees:

- **Remote tree**: the latest state of the user's Dropbox in the cloud.
- **Local tree**: the last observed state on disk.
- **Synced tree**: the last state known to be fully synced between the two, acting like a merge base in version control, so the engine can tell whether a difference came from a local or a remote change.

Nodes are identified by unique IDs, not paths, so a move is one attribute change instead of a delete and an add of every descendant. A **planner** compares the three trees and emits batches of operations (create this folder, upload this edit) that are safe to run concurrently: a file can't be created before its parent, but siblings can be edited in parallel. The redesigned protocol guarantees that client and server agree on the remote state before any mutation, that shared folders and files have global identifiers and never appear transiently duplicated or missing, and that moves are atomic regardless of subtree size.

The testing approach is as instructive as the design. Most of the engine runs on a single control thread that's deterministic for fixed inputs, which makes seeded randomized simulation possible: a randomized planner test (CanopyCheck) generates three trees, runs the planner's batches in shuffled order, and checks that the trees converge without panics within a bounded number of iterations, shrinking any failure to a minimal case; a whole-engine test (Trinity) mocks the filesystem, network and timers, reorders requests, injects failures and crashes, and replays the same seed to confirm determinism. Dropbox reports tens of millions of such runs nightly, and one found a directory cycle created when a local and a remote move were applied together.

The rules to take: **identify by ID, keep a merge base, plan operations from state, and test with deterministic randomized simulation.** A sync engine that persists "work to do" instead of "what I observed" can't recover cleanly from a crash in the middle of that work.

Microsoft publishes the limits rather than the design. OneDrive recommends syncing no more than 300,000 files in a single OneDrive or team site library, and warns the same performance issues appear with 300,000 items across all synced libraries, including shortcuts. The whole decoded path, folder and file name, can't exceed 400 characters in OneDrive and SharePoint. Large tenants hit these first through department libraries synced to every laptop.

## Storage Behind It

Dropbox stores file content in **Magic Pocket**, its own "immutable block storage system," described in 2016: blocks of up to 4 MB, compressed and encrypted, keyed by SHA-256, grouped into 1 GB buckets that are replicated and later erasure-coded, stored in at least two zones across the western, central and eastern US, in self-contained cells of around 50 PB of raw data each. Metadata lives separately. The migration moved over 90% of user data off Amazon S3, reaching that mark on October 7, 2015, by which time Dropbox had passed 500 PB of user data; it kept AWS for some locations, including data stored in Germany. The design principle the post singles out: "Immutability makes our lives *a lot* easier."

Immutability is the right default for workplace files. A block never changes; a new version is a new blocklist; deletion is removing references and collecting unreferenced blocks later. That makes versioning, deduplication, holds and ransomware recovery bookkeeping problems rather than storage problems. What durability numbers do and don't promise is in Hosting & Cloud's [What Durability Claims Mean](/books/hosting-and-cloud/storage#what-durability-claims-mean).

## Conflicts

Sync conflicts are inevitable: two people edit the same file at once, or one edits offline while another edits online, or an application on a forgotten machine autosaves. File platforms can't merge arbitrary binary formats, so they **keep both**. Dropbox creates a **conflicted copy**, naming it with the editor's username, the phrase "conflicted copy" and the date; the last version saved becomes the conflicted copy.

The rules I hold a file sync design to:

- **Never lose a write.** Every conflicting version survives, as a sibling file or a version entry, and the user can see both.
- **Name conflicts so a human understands them**: who, when, from which device.
- **Prefer prevention for formats that support co-editing.** Route documents the platform can co-edit to co-authoring instead of whole-file sync, which moves the problem to [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration#offline-and-conflicts).
- **Offer locking where co-editing isn't possible.** CAD, video and design files need check-out or advisory locks; a lock needs an owner, an expiry and an admin override.

## Versions, Deletes and Ransomware

Every platform keeps file versions, and the windows are commercial levers. Dropbox keeps 30 days of version history on Basic and Plus, 180 on Essentials and Business, and 365 on Business Plus, Advanced and Enterprise, with add-ons to extend it; upgrading starts the longer window from the upgrade date rather than retroactively.

SharePoint and OneDrive make version limits an admin policy with an explicit precedence:

- **Settings cascade** from organization defaults to sites to libraries; site owners can override the organization, and library owners the site.
- **Automatic** limits let Microsoft optimize version storage; **manual** limits set a count of major versions, optionally with an age (for example, 500 versions and 365 days). The UI won't go below 100 versions or 30 days, because lower values risk inadvertent data loss.
- **Trimming bypasses the recycle bin.** Versions removed because they exceed limits, or by a scheduled trim job, are permanently deleted; versions a user deletes go to the recycle bin.
- **Holds win.** Items under a retention policy or eDiscovery hold ignore library version limits until the retention period ends or the hold is released; a trim job that meets a held version stamps an expiry on it instead of deleting it, and versions of documents marked as records can't be deleted at all.
- **Everything is audited**: changes to limits at each level, report and trim jobs queued, and version deletions by users or by expiry.
- **The ceiling** is 50,000 major and 511 minor versions per file.

Ransomware turns version history into a recovery system. An infected laptop encrypts files in a synced folder, sync faithfully uploads the encrypted versions, and every device and colleague receives them. Recovery needs a tenant-wide way to say "put this back as of Tuesday":

- **Dropbox Rewind** undoes edits, renames, additions and deletions back to a chosen point, including in shared and team folders where the user can edit, within the account's version history; on teams only admins can rewind by default. It can't bring back permanently deleted files or undo folder membership changes.
- **OneDrive Restore** undoes all actions on files and folders within the last 30 days for Microsoft 365 subscribers, with an activity chart to find the spike, and after automatic ransomware detection pre-fills a suggested restore date. Files permanently deleted from the recycle bin can't come back; files created after the restore point go to the recycle bin.

My rule: **the ransomware window is the shortest of version history, recycle bin and trim policy, and admins must see that number.** A tenant with 365 days of versions and a 14-day trim job can recover 14 days. Backups outside the platform are the second line ([Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter)).

## Large Files and Upload Limits

Per-file limits differ by two orders of magnitude, and on Box they're a plan feature:

- **Dropbox**: 2 TB per file (2,199,019,061,248 bytes); uploads over 375 GB in a browser may time out, so the desktop app or API is recommended.
- **Box**: 250 MB on free personal accounts, 2 GB Starter, 5 GB Business, 50 GB Enterprise, 150 GB Enterprise Plus, 500 GB Enterprise Advanced.
- **Google Drive**: 5 TB for files that aren't converted to Google formats, and each user can upload and copy 750 GB within 24 hours.
- **SharePoint, OneDrive and Teams**: 250 GB per file, 250 MB per attachment on a list item, 20 GB for generated ZIP downloads, and moves or copies across sites limited to 100 GB and 30,000 files per operation.

Large uploads must be resumable and chunked ([Resumable Uploads](/docs/architecture/file-uploads#resumable-uploads)); block-level sync is the chunking. The daily cap matters for migrations: moving a terabyte-scale department into Drive under one account takes days, which is why migration tools spread work across accounts.

## Shared Drives and Who Owns the File

**Google shared drives** are the team container. Their limits as of October 2026: 500,000 items per drive (files, folders, shortcuts and trash), 600 members of which up to 100 can be groups, and 100 levels of nested folders. Even content an external person contributes to a shared drive the organization created is transferred to and owned by the organization. When a member is removed, they lose access to what was shared with them.

**My Drive** files belong to their creator, which makes offboarding a transfer job. An admin can transfer a user's files while deleting the account (Google recommends suspending first so nothing moves mid-transfer); My Drive folders and files, Computers folders from the desktop client and orphaned shortcuts transfer into a folder in the new owner's My Drive. Files in Trash don't transfer and are deleted with the account; transfers to or from external accounts aren't supported; a user on litigation hold can't be the source; and a transfer that runs longer than 36 hours fails.

**Box** permissions follow a waterfall: collaborators have access to the item they were invited to "and any content beneath it," at the same level. Access can't be reduced partway down (trying throws an error), though a collaborator can be given a higher level on a subfolder.

**SharePoint** inheritance breaks are capped: once a list, library or folder holds more than 100,000 items, its inheritance can't be broken or restored, though individual items still can; the supported limit is 50,000 unique permission scopes per list or library, with 5,000 recommended. Unique permissions are expensive everywhere, and these numbers are the public statement of that cost. [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#containers-trees-and-restrictions) covers the same inheritance problem for page trees.

My default: **personal space for drafts, team containers for anything another person will need after the author leaves**, with an admin report of files in personal space that are shared with more than a team's worth of people (those are team files living in the wrong place), and offboarding that transfers before it deletes.

## Quotas and Pooled Storage

Workplace storage is sold per seat and consumed as a pool. Google Workspace lists pooled storage per user of 30 GB on Business Starter, 2 TB on Standard and 5 TB on Plus (as of October 2026). SharePoint's tenant pool is 1 TB plus 10 GB per license purchased, not counting each user's OneDrive; sites can hold up to 25 TB each; extra storage is bought in 1 GB increments. Microsoft's service description adds the enforcement: a tenant that stays above its limit risks **read-only mode**, where users can't add or modify content until usage drops or capacity is bought, with a one-time-per-365-days option to lift read-only for up to 14 days while new capacity is applied. The recycle bin counts against the quota, and so do versions.

Pooling changes the admin's problem from "who's over their limit" to "what's eating the pool": version bloat in a few libraries, a departed user's OneDrive kept for retention, a team syncing video. Reports by site, by owner and by version share are the product; per-user caps inside the pool are an optional admin policy, not the default. The billing side (seat counts, add-on storage purchases) belongs to [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management) and to Hosting & Cloud's [Metering & Rating](/books/hosting-and-cloud/metering-and-rating).

## Scanning and Previews

Every uploaded file is untrusted input, and in a workplace it will be opened by colleagues who trust the sender. Microsoft 365 uses one virus detection engine across SharePoint, SharePoint Embedded, OneDrive and Teams, included with every subscription, and its documentation is candid about the limits:

- Scanning is **asynchronous** (some time after upload), and not every file is scanned; heuristics pick which. A browser download of an unscanned file triggers a scan first.
- A detected file is flagged, but **by default users can still download it** after a warning. Admins can block that with `DisallowInfectedFileDownload`.
- A file can sync to a laptop before it's flagged; after flagging, the synced copy can't be opened.
- SharePoint or Global Administrators can extract a flagged file for forensics with `Get-SPOMalwareFileContent` without access to the site.
- Microsoft calls the built-in engine a way "to help contain viruses," not a single line of defense; Defender for Office 365 adds Safe Attachments for these services.

The general pipeline (validate, scan, quarantine, then serve) is in the UGP volume's [Scanning Before Publish](/books/user-generated-platforms/upload-path#scanning-before-publish) and [Checking What Arrived](/docs/architecture/file-uploads#checking-what-arrived). The workplace differences: the customer's admin chooses the policy for infected files (warn or block), sensitivity labels and DLP may block sharing or download based on content ([DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection)), and customer-managed encryption can make server-side scanning and previews impossible, which [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys) weighs.

Previews are the other half of the pipeline: a thumbnail and an in-browser rendering for hundreds of formats, generated server-side so users don't download files to look at them. A preview is a derived copy of the file's content, so it inherits every control on the file: it's deleted when the file is, held when the file is held, unavailable when the viewer can't open the file, and never served for a file flagged as malware. Render previews in an isolated sandbox, because document parsers are a classic exploit surface.

## How to Build It

The chapter extends `items` with the `files` kind table and adds content-addressed blocks, sync cursors and quota accounting. `item_versions` ([core](/books/workplace-and-collaboration/workplace-business#the-core-data-model)) gains a pointer to each version's blocklist.

```sql
-- items.kind 'file'; containers.kind gains 'drive' (personal) and 'shared_drive' (team).

CREATE TABLE file_blocks (                 -- immutable, content-addressed, per storage region
  hash             BYTEA PRIMARY KEY,      -- SHA-256 of the plaintext block
  region           TEXT NOT NULL,          -- follows the workspace's residency
  size_bytes       INT NOT NULL CHECK (size_bytes <= 4194304),
  stored_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ref_count        BIGINT NOT NULL DEFAULT 0   -- maintained by version writes and purges
);

CREATE TABLE files (                       -- kind table for items where kind = 'file'
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  container_id     UUID NOT NULL REFERENCES containers (id),
  parent_item_id   UUID REFERENCES files (item_id),   -- folder; folders are files with is_folder
  name             TEXT NOT NULL,
  is_folder        BOOLEAN NOT NULL DEFAULT FALSE,
  owner_kind       TEXT NOT NULL CHECK (owner_kind IN ('member', 'container')),
  owner_member_id  UUID REFERENCES members (id),
  current_version_id UUID REFERENCES item_versions (id),
  size_bytes       BIGINT NOT NULL DEFAULT 0,
  mime_type        TEXT,
  scan_state       TEXT NOT NULL DEFAULT 'pending'
                     CHECK (scan_state IN ('pending', 'clean', 'infected', 'skipped', 'error')),
  lock_member_id   UUID REFERENCES members (id),
  lock_expires_at  TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'current'
                     CHECK (status IN ('current', 'recycled', 'purged')),
  recycled_at      TIMESTAMPTZ,
  UNIQUE (container_id, parent_item_id, name),
  CHECK ((owner_kind = 'member') = (owner_member_id IS NOT NULL))
);

ALTER TABLE item_versions
  ADD COLUMN blocklist BYTEA[],            -- ordered block hashes; null for non-file items
  ADD COLUMN content_hash BYTEA,           -- hash of the whole file for dedup and integrity
  ADD COLUMN created_by_device TEXT,
  ADD COLUMN conflict_of_version_id UUID REFERENCES item_versions (id),  -- kept both
  ADD COLUMN trim_state TEXT NOT NULL DEFAULT 'kept'
    CHECK (trim_state IN ('kept', 'expiry_stamped', 'trimmed')),
  ADD COLUMN expires_at TIMESTAMPTZ;       -- stamped instead of deleted while held

CREATE TABLE file_journal (                -- append-only change log clients follow
  container_id     UUID NOT NULL REFERENCES containers (id),
  seq              BIGINT NOT NULL,
  item_id          UUID NOT NULL REFERENCES items (id),
  op               TEXT NOT NULL CHECK (op IN ('create', 'edit', 'move', 'rename',
                     'recycle', 'restore', 'purge', 'permission')),
  version_id       UUID REFERENCES item_versions (id),
  actor_member_id  UUID REFERENCES members (id),
  at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (container_id, seq)
);

CREATE TABLE sync_cursors (                -- where each device is in each container's journal
  device_id        UUID NOT NULL,
  member_id        UUID NOT NULL REFERENCES members (id),
  container_id     UUID NOT NULL REFERENCES containers (id),
  last_seq         BIGINT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (device_id, container_id)
);

CREATE TABLE storage_usage (               -- pool accounting, rolled up nightly and on write
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  container_id     UUID NOT NULL REFERENCES containers (id),
  current_bytes    BIGINT NOT NULL DEFAULT 0,
  version_bytes    BIGINT NOT NULL DEFAULT 0,
  recycled_bytes   BIGINT NOT NULL DEFAULT 0,
  as_of            TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (organization_id, container_id)
);
```

The commit path: the client sends the new blocklist with the base version it edited; the server checks write access on the container, returns the hashes it doesn't have (scoped to the region, and never revealing whether a hash exists in another tenant), accepts those blocks, then in one transaction writes the `item_versions` row, updates `files.current_version_id`, increments block `ref_count`, appends to `file_journal` and adjusts `storage_usage`. If the base version isn't current, the server writes the version anyway with `conflict_of_version_id` set and creates a sibling conflicted copy rather than overwriting.

Version trimming runs as a job per library policy: candidates past the count or age limit are checked against `legal_holds` and `retention_policies` (core); held versions get `trim_state = 'expiry_stamped'` and an `expires_at`, the rest are trimmed, their block references decremented, and an audit event written per batch. Blocks with `ref_count = 0` are collected after a grace period, never immediately, so a crash between decrement and a new reference can't lose data.

The pool check runs on commit: if `storage_usage` for the organization exceeds the plan's entitlement (`subscriptions` and `seat_assignments` in the core model) plus purchased add-ons, the tenant goes to a read-only state that's visible in the admin console, with the grace and override rules in the plan, not in code.

## Auditing

What the file platform records in `audit_events`, beyond the journal:

- **Access**: downloads, previews, sync of a file to a new device, shares and share link creation, external access, by member and device.
- **Lifecycle**: recycle, restore, purge, version deletion by a user, version trimming by policy (batched with counts), restores of a whole drive or folder to a point in time (who, which point, how many files).
- **Ownership**: transfers at offboarding (source, destination, counts, failures), ownership changes between member and container.
- **Malware**: detection, download of an infected file after a warning, forensic extraction by an admin.
- **Policy**: changes to version limits, sharing policy, infected-file policy, quotas and read-only state.

Download and sync events are high volume and employee-identifying; keep them in the audit store with its own retention, not in product analytics ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- Store file content as immutable, content-addressed blocks; make versions blocklists and deletion a reference count.
- Ask the client for only the missing blocks, and never let cross-tenant dedup be observable.
- Persist observed state (remote, local, synced) with stable IDs, plan operations from it, and test with deterministic randomized simulation.
- Never lose a write in a conflict: keep both, name the conflict, and steer co-editable formats to co-authoring.
- Make version limits an admin policy that holds and records override, and show admins the real ransomware recovery window.
- Push durable content into team-owned containers, transfer before deleting at offboarding, and report team files living in personal space.
- Sell storage as a pool, report what consumes it, and define read-only enforcement in the plan.
- Scan uploads, let the customer choose warn or block for infected files, and give previews every control the file has.

## References

**Engineering write-ups**

- [Dropbox: Streaming file synchronization (2014)](https://dropbox.tech/infrastructure/streaming-file-synchronization), 4 MB blocks, SHA-256 blocklists, need-blocks commits, the Server File Journal, streaming sync latency
- [Dropbox: Rewriting the heart of our sync engine (2020)](https://dropbox.tech/infrastructure/rewriting-the-heart-of-our-sync-engine), Sync Engine Classic's limits, Nucleus in Rust, deterministic control thread, protocol guarantees
- [Dropbox: Testing sync at Dropbox (2020)](https://dropbox.tech/infrastructure/-testing-our-new-sync-engine), remote, local and synced trees, ID-based nodes, the planner, CanopyCheck and Trinity, nightly run counts
- [Dropbox: Inside the Magic Pocket (2016)](https://dropbox.tech/infrastructure/inside-the-magic-pocket), immutable block storage, 4 MB blocks keyed by SHA-256, zones, 50 PB cells, 1 GB buckets and erasure coding
- [Dropbox: Magic Pocket infrastructure (2016)](https://dropbox.tech/infrastructure/magic-pocket-infrastructure), over 90% of user data moved in-house by October 7, 2015, past 500 PB, AWS kept for some locations

**Vendor documentation**

- [Dropbox: Version history overview](https://help.dropbox.com/delete-restore/version-history-overview), version history by plan from 30 to 365 days, non-retroactive upgrades
- [Dropbox: Rewind](https://help.dropbox.com/delete-restore/rewind), what Rewind undoes and doesn't, plan availability, admin-only default on teams
- [Dropbox: Conflicted copies](https://help.dropbox.com/organize/conflicted-copy), when conflicted copies are created and how they're named
- [Dropbox: Upload limitations](https://help.dropbox.com/sync/upload-limitations), 2 TB maximum and the 375 GB browser guidance
- [Box: Understand the maximum file size you can upload](https://support.box.com/hc/en-us/articles/360043697314-Understand-the-Maximum-File-Size-You-Can-Upload-to-Box), upload limits by plan from 250 MB to 500 GB
- [Box: Understanding item permissions](https://support.box.com/hc/en-us/articles/360043697254-Viewing-and-Restoring-Previous-Versions-of-Files), waterfall permissions, no reduction lower in the tree, higher access on subfolders
- [Microsoft Learn: SharePoint limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits), tenant pool, 25 TB sites, 250 GB files, 400-character paths, 100,000-item inheritance cap, unique permissions, version maximums, 300,000-file sync guidance, move limits, read-only mode
- [Microsoft Learn: Version history limits for document library and OneDrive](https://learn.microsoft.com/en-us/sharepoint/document-library-version-history-limits), cascade of settings, automatic and manual limits, minimums, trimming behavior, holds and records, audit events
- [Microsoft Support: Restore your OneDrive](https://support.microsoft.com/en-us/office/restore-your-onedrive-fa231298-759d-41cf-bcd0-25ac53eb8a15), 30-day restore, ransomware detection, recycle bin limits
- [Microsoft Learn: Built-in virus protection in SharePoint, OneDrive and Teams](https://learn.microsoft.com/en-us/defender-office-365/anti-malware-protection-for-spo-odfb-teams-about), asynchronous heuristic scanning, default download after warning, `DisallowInfectedFileDownload`, forensic extraction, sync behavior
- [Google: Files you can store in Google Drive](https://support.google.com/drive/answer/37603?hl=en), 5 TB for other files
- [Google Workspace Admin Help: Shared drive limits](https://support.google.com/a/answer/7338880?hl=en), 500,000 items, 600 members and 100 groups, 100 nesting levels, 750 GB per user per 24 hours
- [Google Workspace: Shared drives vs. My Drive](https://support.google.com/a/users/answer/9310249?hl=en), external contributions owned by the organization, member removal
- [Google Workspace Admin Help: Transfer Drive files to a new owner as an admin](https://knowledge.workspace.google.com/admin/drive/transfer-drive-files-to-a-new-owner-as-an-admin?hl=en), transfer at deletion, what transfers, Trash, litigation hold, 36-hour limit
- [Google Workspace: Pricing](https://workspace.google.com/pricing), pooled storage per user by plan
