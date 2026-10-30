+++
title = "Real-Time Co-Editing"
description = "Co-editing: operational transformation in Google Docs, CRDTs (Yjs, Automerge, Peritext), Figma server authority, Fluid, presence, undo, offline merges."
category = "Workplace & Collaboration Industry"
order = 2024
part = "Docs, Wikis and Files"
tags = ["workplace", "collaboration", "crdt", "operational-transformation", "realtime"]
+++

Co-editing is the feature that made browser documents replace emailed attachments: two people type in the same paragraph and both see a sensible result within a fraction of a second, and nobody has to merge anything. Underneath, every keystroke is a change made against a version of the document the other editors don't have yet. The system has to reorder, adjust or merge those changes so every copy converges on the same document, while keeping each person's intent (the word they bolded stays bold even though someone inserted text before it), responding instantly to local typing, surviving dropped connections and laptops that were offline for a flight, and recording who changed what for the customer's audit and retention rules.

There are two families of solutions and a pragmatic middle. **Operational transformation (OT)** sends operations through a central server that orders them and transforms each against the ones it crossed; Google Docs is the reference implementation. **Conflict-free replicated data types (CRDTs)** give every element a stable identity so concurrent operations commute and replicas converge without a central order; Yjs and Automerge are the widely used libraries. **Server-authoritative object sync**, which Figma described in 2019, takes CRDT ideas but lets one server per document decide order, which removes most of the CRDT overhead for data that isn't long runs of text.

The generic transport (WebSockets, fan-out, ordering and catch-up, reconnect) is [Realtime Connections](/docs/architecture/realtime-connections); offline queues and conflict policy for business records are [Offline Sync](/docs/architecture/offline-sync). This chapter covers what document co-editing adds: the merge algorithms, rich text, presence, undo, offline merges, size limits, and the records a workplace product must keep. The page and block models being edited are [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis); design-canvas specifics are in [Design Tools](/books/workplace-and-collaboration/design-tools#multiplayer) and [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams#sync-and-storage).

## How the Platforms Do It

As of October 2026, from public sources:

| Product | Approach | Who orders changes | Offline | Public detail |
| --- | --- | --- | --- | --- |
| **Google Docs** | OT over a revision log of insert, delete and style operations | Central server | Limited | 2010 Drive blog series on collaboration |
| **Figma** | Per-property last-writer-wins on an object tree, CRDT-inspired | One server process per document | Arbitrary length; edits reapplied on reconnect | 2019 engineering post |
| **Notion** | Record-level operations in transactions; offline pages moved to a CRDT data model | Server commits or rejects transactions | Pages marked for offline use | 2021 data model post, December 2025 offline post |
| **Microsoft Loop and Fluid Framework** | Distributed data structures merged on clients | Ordering service assigns sequence numbers | Through client merge | Fluid architecture docs |
| **Confluence live docs** | Real-time editing without a publish step | Not publicly detailed | Not publicly detailed | Help center limits: 100 viewers, 40 editors |
| **Yjs** (library) | CRDT shared types | Nobody; updates merge in any order | Yes, with persistence providers | Library docs |
| **Automerge** (library) | CRDT with full change history | Nobody | Local-first by design | Library docs |

The pattern under the table: **every production system that publishes its design keeps a server in the loop**, even when the data structure doesn't need one. The server is where permissions are checked, where the durable copy lives, where version history and audit events are cut, and where the customer's admin controls apply. Pure peer-to-peer sync is a library capability; workplace products use it, if at all, for offline and for latency, not to remove the server.

## Operational Transformation

Google's 2010 description is still the clearest. Every edit in a Google document reduces to three operation types: insert text, delete text, and apply a style to a range. The document is stored as a **revision log** of those operations; editing appends to the log, and displaying replays it. The problem appears when two people edit at once. If one editor deletes characters 9 to 11 while another has just inserted two characters at the start, applying the delete naively removes the wrong characters, because its positions refer to a version that didn't have the insertion. The receiving editor must **transform** the incoming operation against its own unacknowledged ones (shift the delete two positions right) before applying it. Done correctly, "once all editors have received all changes, everyone will be looking at the same version of the document."

The transform functions are where the work is. Google's post gives two examples: a style range expands when transformed against an insertion inside it (bold over 10 to 20, after inserting three characters at 15, becomes bold over 10 to 23), and two different style changes over overlapping ranges don't conflict at all (text can be italic and red). Every pair of operation types needs a correct transform, and the number of pairs grows with every feature: tables, comments anchored to ranges, suggestions, smart chips.

The architecture that keeps OT tractable comes from Xerox PARC's Jupiter system, presented at UIST 1995: a central server, optimistic concurrency, and operation transformations to "fix up conflicting messages," where the centralized design "allows us to substantially simplify" the fully distributed algorithm it was derived from. Each client only ever transforms against one other party, the server, so the hard multi-party cases never arise. Google Docs' protocol is the same shape: changes go from an editor to the server and then to the others, and each editor transforms incoming changes against its local, unacknowledged ones.

What OT gives a workplace product:

- **A total order** of operations per document, which is also the audit order and the version history.
- **Small operations on the wire**, with positions rather than identities, so the document carries no per-character metadata.
- **A natural place for policy**: the server can reject an operation from someone whose access was just revoked, or from a suggestion-only editor trying to edit directly.

What it costs: correctness depends on every transform pair, offline editing is weak because the server must see operations in order, and the server is on the critical path of every edit.

## CRDTs

A CRDT gives each element a unique, stable identity (for text, typically the inserting replica's ID plus a counter) and defines operations so that applying the same set in any order yields the same state. Concurrent inserts at the same place are ordered by a deterministic tiebreak; deletes mark elements as removed (tombstones) rather than shifting positions. No transform functions are needed, and no central order.

- **Yjs** describes itself as "a high-performance CRDT for building collaborative applications that sync automatically," exposing shared types such as maps and arrays that merge without conflicts. It makes no assumptions about the network ("updates can arrive in any order"), has providers for WebSocket and WebRTC transports and for persisting updates to a database, and binds to editors including ProseMirror, Tiptap, Monaco, Quill and CodeMirror. Updates are exchanged as encoded state and applied with `applyUpdate`.
- **Automerge** is "a library of data structures for building collaborative applications," designed for local-first software, with a Rust core compiled to WebAssembly for browsers and a C API for other platforms. It keeps the full change history, so applications can view old versions, compare them, branch and merge.

The research framing that brought CRDTs into product conversations is Ink & Switch's 2019 essay on **local-first software**, which lists seven ideals (no spinners, work not trapped on one device, the network is optional, seamless collaboration, the long now, security and privacy by default, and ultimate ownership and control) and notes the cost plainly: CRDTs "accumulate a large change history," which creates performance problems.

That cost is the operational question for a vendor. Tombstones and history grow with every edit; a document edited daily for three years is mostly metadata about deleted characters. Production CRDT systems need **compaction** (garbage-collecting tombstones once every replica has seen the delete, or snapshotting state and dropping old updates), which reintroduces a coordination point, usually the server. My default for workplace documents: CRDT state on clients and in the live session, periodic server-side snapshots that become `item_versions`, and history older than the retention policy's minimum compacted into those snapshots.

## Rich Text Is the Hard Part

Plain-text merging is well understood. Formatting is not, because formatting is an intent about a range, and ranges change under concurrent edits. Ink & Switch's Peritext work (2021, revised for CSCW 2022) tested three common approaches and showed each failing: Markdown inside a plain-text CRDT interleaves concurrent asterisks so a word bolded twice can end up not bold; start and end control characters (the Yjs style) can lose formatting when spans overlap; and JSON spans (the Automerge style at the time) can duplicate a word one user bolded while another italicized it.

Peritext's rule is the one to design to: formatting "applies to any text inside a range between two characters, even if that text wasn't present when the formatting was applied." So text inserted inside a bolded sentence is bold; overlapping bold spans stay bold; bold and italic both apply; and conflicting values of the same attribute (two text colors) need a deterministic winner, with the conflict ideally shown to users. Span ends differ by type: text typed at the end of a bold span usually inherits bold, while text typed at the end of a link stays outside it, because links don't grow. Google's OT transform (a style range expanding when text is inserted inside it) encodes the same intent in a different mechanism.

The practical rules:

- **Define expand behavior per mark type** (bold expands at the end; links, comments and suggestions don't) and test it under concurrency, not just in a single editor.
- **Anchor comments to element identities, not offsets.** A comment on a sentence must survive edits before it, and must have a defined fate when its whole range is deleted (keep as orphaned with the quoted text, which is what reviewers expect).
- **Treat structure as a separate problem.** Lists, tables and nested blocks are trees; concurrent moves can create cycles, which text algorithms don't address.

## Server Authority: Figma's Approach

Figma rejected OT as "unnecessarily complex for our problem space" (a design tool, not a text editor) and built something "no more complex than necessary." A document is a tree of objects, conceptually `Map<ObjectID, Map<Property, Value>>`. The server tracks the latest value any client sent for each property of each object. Concurrent changes to different properties never conflict; concurrent changes to the same property resolve to whichever the server received last, and because the server defines the order, no timestamps are needed. Text in a single text property is atomic: two concurrent edits end as one client's whole value, not a merge.

The details are a checklist for any structured-object editor:

- **Creation works offline** because clients generate IDs that include a client ID. Deletion is explicit, and deleted objects' data lives in the deleting client's undo buffer rather than on the server.
- **Parent and position are one property.** Children are ordered by **fractional indexing** (a position string between its neighbors), and a reparent writes the new parent and position together so they can't disagree.
- **Cycles are rejected by the server.** Two users concurrently moving A into B and B into A would create a cycle; the server rejects the parent update that would cause one. A client may briefly see the cycle before the rejection arrives and temporarily removes those objects from the tree.
- **Local changes win locally until acknowledged.** To avoid flicker, the client discards incoming server changes that conflict with its own unacknowledged changes, since its own value is the most recent it knows of.
- **One server process per multiplayer document**, over WebSockets, with comments, users and teams in Postgres synced by a separate system.

This is the model I reach for when the content is structured objects (diagrams, boards, forms, database rows): per-field last-writer-wins with server order, explicit create and delete, fractional indexes for order, server-side invariant checks. It is CRDT-shaped enough to work offline and simple enough to reason about.

## Fluid and Hybrid Designs

Microsoft's Fluid Framework, under Loop components, splits the work differently. The service is a **total-order broadcast**: it assigns each client operation a sequence number, broadcasts it to connected clients and acknowledges the sender, while "the service knows nothing about the contents of any Fluid container." Clients run the merge logic in distributed data structures, which keeps the server simple and fast, and the service stores **summaries** so new clients load without replaying the whole operation log. It's OT's central order with CRDT-style client merges, and a reminder that the question is not OT versus CRDT but where ordering, merging and compaction each happen.

Notion sits at the record level. Edits are operations on block records, grouped into transactions the server commits or rejects whole after checking permissions and coherence; clients subscribe to the records they render and fetch new versions when notified ([Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#blocks-notion-s-model)). For offline mode, Notion's December 2025 post says pages marked for offline use are migrated to a new CRDT data model for conflict resolution, and that never showing partially downloaded pages offline keeps merges predictable. A page is kept offline for any of several independent reasons (marked by the user, visited recently, favorited, or inherited from a database marked offline, which downloads up to 50 pages of its current view), and stays offline until the last reason goes away: offline availability is a reference count, not a flag.

## Presence and Cursors

Presence (who's here, where their cursor is, what they've selected) is ephemeral state with different rules from document content:

- **Not part of the document.** Yjs keeps it in a separate awareness protocol, "a simple network agnostic CRDT that manages user status," where each client's state is an increasing clock attached to a JSON object. It never enters document history, version snapshots or exports.
- **Expires by silence.** A Yjs client that hears nothing from a peer for 30 seconds marks it offline, so clients rebroadcast periodically. A closed laptop must not leave a ghost cursor.
- **Anchored to content identity.** A cursor is a position relative to an element ID (or, in OT, a position transformed like any other operation), so it stays on the right word when someone types above it.
- **Bounded per document.** Presence fan-out is quadratic in participants. Confluence's live docs state limits of 100 simultaneous viewers and 40 simultaneous editors; above a threshold, show a count and the people near your viewport rather than every cursor.

Presence is also employee data. Who opened which document, when and for how long is exactly what [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy) worries about; keep presence in memory, and record document access in the audit trail only where the customer's policy asks for it, not as a by-product of the cursor system.

## Undo in Multiplayer

Single-user undo reverts the last change to the document. In multiplayer that's wrong: it would revert a colleague's typing. Every serious editor implements **local undo**: undo reverts my last change, transformed or merged against everything that happened since.

- **Yjs's UndoManager** is scoped to a set of shared types and by default tracks only local changes that don't carry a transaction origin, so remote changes never land on my undo stack. Changes within 500 ms merge into one undo step (`captureTimeout`), and stack items carry a metadata map so an editor can restore the cursor along with the content.
- **Figma's principle**: undoing a lot, copying, then redoing back to the present must leave the document unchanged, which means undo modifies the redo history and redo modifies the undo history.

Edge cases a design has to decide: undoing the creation of an object someone else has since edited (Figma keeps deleted object data in the undo buffer, so redo can bring it back with those edits); undo after reconnecting from offline; and whether undo crosses a version boundary (my rule: it doesn't cross a restore, which is a forward edit by someone else).

## Offline and Conflicts

Offline is where the families separate. A pure-OT server needs operations in order; long offline sessions mean a long transform chain on reconnect, which is why the local-first essay notes that Google Docs limits offline editing. CRDTs merge any amount of offline work by construction. Figma's clients can edit offline "for an arbitrary time"; on reconnect they download a fresh copy, reapply their offline edits on top and resume syncing.

Convergence isn't the same as a good result. Two people rewriting the same paragraph offline will converge on an interleaving that neither wrote. Products handle this by policy, not algorithm:

- **Merge silently** for small, disjoint edits (the common case).
- **Flag** a region edited concurrently by two offline sessions beyond a size threshold, with both authors notified.
- **Fork** when the divergence is large: keep the merged document and save each side's offline version as a named version, so nothing is lost. Dropbox's "conflicted copy" ([Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#conflicts)) is the file-level version of the same decision.

Permissions change while people are offline, and that's the workplace twist. An editor demoted to viewer, or a member offboarded, while their laptop was on a plane, will reconnect with queued edits. The server must re-check each queued operation against current access and reject what's no longer allowed, keep the rejected edits retrievable for the author (or for an admin, if the author was offboarded), and log the rejection. [Conflicts: Choosing Who Wins](/docs/architecture/offline-sync#conflicts-choosing-who-wins) has the general policy; the document rule is that access is always evaluated at the server's commit time, never at the client's edit time.

## Document Size Limits

Every co-editing system has a practical ceiling, because every participant holds the whole document (or its active part) in memory and every operation fans out to everyone:

- Google Docs caps a document at 1.02 million characters.
- Notion's API pages through a page's blocks and caps a request at 1,000 block elements and 500 KB, which shapes how large pages are loaded and written.
- Confluence live docs cap concurrent editors at 40 and viewers at 100.
- Loop workspaces sit in SharePoint Embedded containers with a 25 TB cap, a storage limit rather than an editing one.

Limits should be explicit and enforced before they become performance failures: a document approaching the cap gets a warning and a suggestion to split, a session above the editor cap opens new arrivals in view mode, and CRDT documents whose history dwarfs their content get compacted on the server.

## How to Build It

The chapter adds the live-session and operation log tables. The document itself stays in the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model): `items` (with `pages` from [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#how-to-build-it)) and `item_versions`.

```sql
CREATE TABLE doc_sessions (                -- one live editing session per document
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  engine           TEXT NOT NULL CHECK (engine IN ('ot', 'crdt', 'object_lww')),
  server_node      TEXT NOT NULL,          -- the process that owns ordering for this doc
  head_seq         BIGINT NOT NULL DEFAULT 0,  -- last sequence number assigned
  snapshot_version_id UUID REFERENCES item_versions (id),  -- last compacted snapshot
  snapshot_seq     BIGINT NOT NULL DEFAULT 0,
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  editor_cap       INT NOT NULL DEFAULT 40
);

CREATE TABLE doc_ops (                     -- the ordered log between snapshots
  item_id          UUID NOT NULL REFERENCES items (id),
  seq              BIGINT NOT NULL,        -- server-assigned total order
  member_id        UUID REFERENCES members (id),     -- null for system and app ops
  app_installation_id UUID REFERENCES app_installations (id),
  client_id        TEXT NOT NULL,          -- device or tab, for dedup and undo origin
  client_seq       BIGINT NOT NULL,        -- client's own counter; retries are idempotent
  base_seq         BIGINT NOT NULL,        -- the server seq the client had seen
  payload          BYTEA NOT NULL,         -- OT op, CRDT update or property writes
  offline          BOOLEAN NOT NULL DEFAULT FALSE,
  committed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (item_id, seq),
  UNIQUE (item_id, client_id, client_seq)
);

CREATE TABLE doc_rejected_ops (            -- queued edits refused at commit time
  item_id          UUID NOT NULL REFERENCES items (id),
  member_id        UUID REFERENCES members (id),
  client_id        TEXT NOT NULL,
  client_seq       BIGINT NOT NULL,
  payload          BYTEA NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('access_revoked', 'member_deactivated',
                     'document_locked', 'legal_hold_readonly', 'size_limit', 'invalid')),
  rejected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retrievable_until TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (item_id, client_id, client_seq)
);
```

The flow, whichever engine:

1. A client connects ([Authenticate on Connect](/docs/architecture/realtime-connections#authenticate-on-connect)), the session owner checks access against `grants`, and sends the latest snapshot plus the ops after it.
2. Each client op carries `client_id`, `client_seq` and `base_seq`. The owner re-checks the member's current access, transforms (OT) or validates (CRDT, object LWW: invariants such as no cycles), assigns `seq`, appends to `doc_ops`, acknowledges, and fans out.
3. A duplicate `(client_id, client_seq)` returns the original ack, so retries after a dropped connection don't double-apply.
4. Every N ops or M minutes, the owner writes a snapshot to `item_versions` and advances `snapshot_seq`; ops older than the snapshot and older than the retention minimum are deleted. A legal hold on the item suspends that deletion.
5. Presence travels on the same connection but is never written to these tables.

Sequence assignment requires one owner per document at a time. Route by document ID with consistent hashing ([Fan-Out](/docs/architecture/realtime-connections#fan-out)), and fence ownership changes with an epoch so a stale owner can't append after failover.

## Auditing

Per-keystroke audit is noise; per-session audit is too coarse for disputes. What I record in `audit_events`:

- **Session joins and leaves** per member, only where the customer's policy enables document access logging.
- **Edit summaries** per member per session: first and last op, op count, and the version range, so "who changed this paragraph and when" can be answered from `doc_ops` and the version history.
- **Rejected offline edits** with the reason, and retrieval of rejected content.
- **Version events**: snapshot cut, named version created, restore performed.
- **Compaction**: the range of ops deleted, so a gap in history is explained rather than suspicious.

Edits by apps and AI assistants are attributed to the app installation and the member who invoked it, never just to the member ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## What This Means for the System You Build

- Keep a server in the loop for ordering, permissions, durable snapshots and audit, even if the data structure is a CRDT.
- Choose by content: OT or a text CRDT for long-form text, per-property last-writer-wins with server order for structured objects.
- Define rich-text intent explicitly: which marks expand, how comments anchor, what happens when an anchored range is deleted.
- Keep presence out of the document, expire it by silence, cap it per document, and treat it as employee data.
- Implement local undo that never reverts other people's work.
- Re-check access at commit time for every queued offline edit; keep rejected edits retrievable and logged.
- Compact history into snapshots on the server, and let legal holds suspend compaction.
- Publish and enforce document size and editor limits before they become outages.

## References

**Engineering write-ups**

- [Google Drive Blog: What's different about the new Google Docs, Conflict resolution (September 22, 2010)](https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs_22.html), revision log of insert, delete and style operations, the transform example, style range expansion, server relay
- [Figma: How Figma's multiplayer technology works (2019)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), why not OT, object tree, per-property last-writer-wins, fractional indexing, cycle rejection, undo principle, offline reapply, one process per document
- [Notion: The data model behind Notion's flexibility (2021)](https://www.notion.com/blog/data-model-behind-notion), operations, transactions, server validation and record subscriptions
- [Notion: How we made Notion available offline (December 11, 2025)](https://www.notion.com/blog/how-we-made-notion-available-offline), offline page tracking (marked, recent, favorited, inherited, 50 pages per database view) and migration of offline pages to a CRDT data model

**Research**

- [Nichols, Curtis, Dixon and Lamping: High-Latency, Low-Bandwidth Windowing in the Jupiter Collaboration System (UIST 1995)](https://uist.acm.org/uist1995/abstracts/Nichols.html), central server, optimistic concurrency and simplified operation transformation
- [Ink & Switch: Local-first software (2019)](https://www.inkandswitch.com/essay/local-first/), the seven ideals, CRDT change-history cost, limited offline editing in server-centric apps
- [Ink & Switch: Peritext, a CRDT for rich-text collaboration (2021)](https://www.inkandswitch.com/peritext/), failure modes of existing approaches, formatting over ranges between characters, mark expansion rules

**Libraries and frameworks**

- [Yjs documentation](https://docs.yjs.dev/), shared types, network-agnostic updates, providers and editor bindings
- [Yjs: Awareness and presence](https://docs.yjs.dev/api/about-awareness), awareness CRDT outside the document, 30-second offline timeout
- [Yjs: Undo manager](https://docs.yjs.dev/api/undo-manager), scoped local undo, tracked origins, 500 ms capture timeout, stack item metadata
- [Automerge: Welcome](https://automerge.org/docs/hello/), CRDT for local-first apps, retained history, Rust core with WebAssembly and C bindings
- [Fluid Framework: Architecture](https://fluidframework.com/docs/concepts/architecture), total-order broadcast service, client-side merge, summaries, content-agnostic service

**Vendor documentation**

- [Atlassian: Create and collaborate in real time with live docs](https://support.atlassian.com/confluence-cloud/docs/create-and-collaborate-in-real-time-with-live-docs/), 100 simultaneous viewers and 40 simultaneous editors
- [Google: Files you can store in Google Drive](https://support.google.com/drive/answer/37603?hl=en), 1.02 million characters per document
- [Notion Developers: Request limits](https://developers.notion.com/reference/request-limits), 1,000 block elements and 500 KB per request
- [Microsoft Learn: Overview of Loop storage](https://learn.microsoft.com/en-us/microsoft-365/loop/loop-storage), 25 TB per Loop workspace container
