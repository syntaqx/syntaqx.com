+++
title = "Design Tools"
description = "Figma's browser engine and multiplayer, files and branches, seats, the 2025 IPO and the Adobe deal that failed, and how Sketch, Penpot and Canva differ."
category = "Workplace & Collaboration Industry"
order = 2037
part = "Design and Visual Collaboration"
tags = ["design-tools", "figma", "multiplayer", "webassembly", "collaboration"]
+++

A design tool is a vector editor, a layout engine and a rendering engine that has to draw tens of thousands of layers at interactive frame rates, and since about 2016 it is also a collaborative document that several people edit at once and many more people view, comment on and copy code from. The category moved in one decade from files on a designer's Mac (Sketch, Adobe XD, Photoshop before them) to documents that live at a URL in the vendor's cloud, opened in a browser, with the design file as the shared source of truth between design, product and engineering. That move turned design software into workplace software: the buyer became the company, the seat became the unit of sale, and the questions became the familiar ones of who can see the file, who pays for whom, and what happens to the work when someone leaves.

What makes it hard is that the two halves pull against each other. The editor needs native-grade performance on a document that may hold an entire product's screens and a component library, which argues for a thick client with the whole document in memory. Collaboration needs every client to agree on the document within a fraction of a second, which argues for a server that owns the truth. Figma's public engineering write-ups describe one resolution of that tension in more detail than any other vendor, so this chapter leans on them and benchmarks the others against them. It covers the tools and their architecture, files, versions and branches, seats and admin control, the business, and the Adobe deal. Libraries, variables, tokens and Dev Mode are [Design Systems & Handoff](/books/workplace-and-collaboration/design-systems-and-handoff); whiteboards (FigJam, Miro and the rest) are [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams). The general theory of co-editing (OT, CRDTs, presence) belongs to the [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration) chapter; this one covers what design files add to it.

## How the Platforms Do It

As of October 2026, from vendor documentation, filings and pricing pages:

| Tool | Where it runs | Collaboration | Where the file lives | How it is sold | Status |
| --- | --- | --- | --- | --- | --- |
| **Figma** | Browser and desktop app; C++ engine compiled to WebAssembly, WebGPU with WebGL fallback | Live multiplayer through a server that owns each open document | Figma's cloud, one URL per file; drafts, teams, projects; branches on Organization and Enterprise | Annual or monthly subscription per seat (Full, Dev, Collab, plus free viewers); AI credits on every seat | Public since July 31, 2025 (NYSE: FIG) |
| **Sketch** | Native Mac app; web app for viewing, commenting and inspecting | Real-time co-editing in the Mac app on documents saved to a Workspace | Sketch Workspace, or local files that do not collaborate | Subscription with a Workspace, or a Mac-only license | Independent |
| **Penpot** | Browser; self-hostable | Live collaboration | Penpot's cloud or the customer's own server | Free Professional plan; paid Unlimited and Enterprise; Private Server | Open source (MPL-2.0) |
| **Adobe XD** | Mac and Windows app | Cloud documents and shared prototypes | Adobe Creative Cloud | Creative Cloud | In maintenance mode |
| **Canva** | Browser and apps | Shared designs, comments, approvals on Business and Enterprise | Canva's cloud | Free, Pro, Business per person, Enterprise by contract | Affinity access on every plan |

The table hides the real split. Figma, Sketch and Penpot are tools for people who design software interfaces, and their buyers care about components, layout and handoff to engineers. Canva is a tool for people who make marketing and communication material, and its buyers care about templates, brand control and volume. Figma has been moving toward Canva's ground (Figma Buzz and Sites in 2025) and Canva toward Figma's (Affinity, components), but the products still answer different questions.

## The Browser as the Design Tool

Figma's bet was that a browser could run a professional design tool if the engine was not written in JavaScript. Its 2017 post on WebAssembly says the product "is written in C++", cross-compiled first to asm.js and then to WebAssembly, and that load time (initialization, downloading the file and the first full render) "improved by more than 3x" after the switch, regardless of document size. Its 2025 post on WebGPU fills in the rest of the stack: the renderer is C++, compiled to WebAssembly with Emscripten for the web app, and the same code builds as a native x64 or arm64 binary for server-side rendering, testing and debugging. Shaders are written once in WebGL 1-compliant GLSL and translated to WGSL for WebGPU.

The WebGPU rollout is the instructive part, because it shows what shipping a GPU-bound product on uncontrolled hardware involves. Figma first planned to test WebGPU compatibility before load; that failed on Windows because WebGPU could break mid-session, so the renderer gained a live fallback that starts on WebGPU and drops to WebGL when needed. Because the fallback causes a visible hitch, Figma blocklisted device classes by their measured fallback rates before finishing the rollout. The result reported was faster rendering on some device classes and neutral results elsewhere, with no regressions.

Three rules fall out of this for anyone building a canvas-heavy collaborative editor:

- **One engine, several targets.** The same rendering and document code runs in the browser, on the server (thumbnails, exports, previews) and in tests. That is what makes server-side rendering of a file identical to what the user sees.
- **The document is in memory on the client.** The client downloads the file and edits it locally; the network carries changes, not render calls. This is what makes a 60 frames-per-second editor possible at all, and it is also why document size limits exist (a file has to fit in a browser tab's memory).
- **Graphics capability is a runtime question.** Detect it, fall back live, and measure fallbacks by device so the decision is data.

Sketch took the opposite path: a native Mac app, with a web app that lets anyone view, comment and inspect but not co-edit ("real-time collaboration is a feature of the Mac app"). Penpot is browser-first and built on open standards, describing itself as working with SVG, CSS, HTML and JSON, and its inspect tab produces SVG, CSS and HTML code. Its repository carries a separate `render-wasm` directory, which suggests a WebAssembly renderer in progress, though Penpot's README does not describe it.

## Multiplayer

Figma's 2019 post on multiplayer is the clearest public description of how a design tool syncs, and its choices are now common across canvas products:

- **[Server authority](/books/workplace-and-collaboration/real-time-collaboration#server-authority-figma-s-approach), not peer-to-peer.** Clients connect over WebSockets to a cluster that runs "a separate process for each multiplayer document". A 2019 infrastructure post adds that each design file maps to one multiplayer instance. Figma rewrote the performance-sensitive parts of that server from TypeScript to Rust in 2018, because unpredictable latency spikes in a single-threaded process stalled every file on that worker.
- **Not operational transforms.** The post says Figma "didn't want to use operational transforms" because OT was more complex than the problem required, and that its approach is "inspired by" CRDTs without being a true CRDT, since the central server is the authority.
- **The document is a map of maps.** A file is a tree of objects, each with an id and properties: `Map<ObjectID, Map<Property, Value>>`. The server keeps the last value it received for each property of each object. Two people changing different properties of the same rectangle never conflict; two people changing the same property resolve to whichever change reached the server last. That is why two people typing in the same text layer don't merge: text is one property value.
- **No flicker.** A client applies its own edits at once and ignores server updates that conflict with its own unacknowledged edits, so an old value never briefly overwrites a newer local one.
- **Ids without coordination.** Each client has a unique id that is part of every object id it creates, so offline creation can't collide.
- **Tree moves as properties.** The parent link is a property of the child, and the server rejects any change that would create a cycle. Sibling order is a fractional index between 0 and 1 (insert between two siblings by averaging their positions), stored with the parent link as one property so a move is atomic.
- **Undo is local.** Undo and redo apply to the user's own history, with the rule that undoing a lot, copying, and redoing back to the present leaves the document unchanged. Deleted objects live in the deleting client's undo buffer, not on the server.
- **Everything else syncs elsewhere.** Multiplayer carries only document changes; comments, teams and other metadata live in Postgres behind a separate sync system.

Sketch's real-time collaboration, by its own documentation, makes different trade-offs: collaborators see each other's changes when an action completes, not pixel by pixel; you can undo only your own actions, though an undo can override a collaborator's later edit to the same layer; offline changes are stored locally and synced on reconnect, and edits to an object someone else deleted can't be applied. Uploading a local copy over a Workspace document while others are active is blocked, and an update that could overwrite collaborators' edits asks for confirmation.

The practical rule both designs share: **choose conflict granularity to match how people actually collide.** On a canvas people rarely edit the same property of the same object at the same moment, so per-property last-writer-wins at a server is enough and far simpler than merging. Text inside a layer is the exception both tolerate. A product whose users routinely co-type in the same paragraph (a document editor) needs the sequence algorithms covered in the [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration) chapter; the generic connection mechanics are the playbook's [Realtime Connections](/docs/architecture/realtime-connections#ordering-and-catch-up), and reconnect-and-reapply is [Offline Sync](/docs/architecture/offline-sync#conflicts-choosing-who-wins).

## Files, Versions and Branches

The unit of work is the file, and the hierarchy above it is a permission hierarchy. In Figma, files sit in projects inside teams, inside an organization on the Organization and Enterprise plans (with workspaces on Enterprise), plus personal drafts. Team access has two parts that behave differently: **audience access** (only invited people, or the whole organization or workspace) decides who can reach the team and does not pass down; **individual roles** (can view, can edit) pass down to the team's folders and files. A folder or file can grant more access than the team role, never less. The same "grant up, never down" inheritance appears in most workplace products and is treated in general in the [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing) chapter.

**Version history** is automatic. Figma records a checkpoint every 30 minutes and on connection loss or crash, and anyone with edit access can save a named version. Drafts and the Starter plan keep 30 days of history; paid plans keep the full history. Restoring is non-destructive: it adds checkpoints for the current state and the restored one, and comments from every version survive. Duplicating a file from a version creates a new file without the original's comments or history, which matters for handoff to an outside party.

**Branching** brings the source-control model to design files. A branch is a separate working copy of a file, its library or prototype; changes reach the main file only by merging, and a merge offers conflict resolution first. Updates from main can be pulled into a branch but only all at once. Someone without edit access to main must request a review and have an editor merge; an editor who does not require review can merge directly. Merged and archived branches stay restorable. Branching is available only on Organization, Enterprise, Government and Education (K-12) plans, creating a branch takes a Full seat, and a library can only be published from the main file, never from a branch. Branching as a plan gate is a pattern: the feature that makes design files safe for a large team is the one sold to large teams.

## Seats, Admins and Who Decides

Design tools invert the consumer default the same way the rest of this book does: the customer's admin, not the designer and not the vendor, decides who may do what.

- **Seats.** Figma's 2025 filing lists the seat ladder: free viewers who view and comment; Collab seats for FigJam and Figma Slides; Content seats (Figma Buzz, the Sites CMS, FigJam, Slides; not yet available at filing); Dev seats (Dev Mode plus the Content products); and Full seats (Design, Draw, Make, Dev Mode, Buzz, Sites, FigJam and Slides). Figma's pricing page says a Collab seat "only includes basic inspection on Dev Mode". Which person gets which seat is an admin decision with a cost attached; the seat machinery (approval of upgrade requests, true-ups) belongs to the [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) chapter.
- **AI credits.** The same filing says Figma introduced AI credits across all seats in 2025, planned to begin enforcing credit limits in March 2026, and would offer add-on or pay-as-you-go credit plans. Usage allowances on top of seats are now the norm (Canva's plans share a monthly AI allowance; Miro's credits are pooled across the organization, as [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams#how-the-platforms-do-it) shows).
- **Library access.** Admins set default libraries for a team or organization, which enables them in every file, and on Organization and Enterprise plans they control who can use each library ([Design Systems & Handoff](/books/workplace-and-collaboration/design-systems-and-handoff#libraries-and-publishing)).
- **Sharing.** Who can reach a team and whether files can be shared outside the organization are org-level settings, and external collaborators are guests in the customer's tenant, governed by the [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration) chapter.

## Sketch, Penpot, Adobe XD and Canva

**Sketch** is the native-app holdout. Its libraries carry symbols, text styles, color variables, layer styles and frame templates, with update notifications for documents that use them; real-time collaboration needs a subscription and documents in a shared Workspace, and "a Mac-only license only includes the Mac app". The design here is a deliberate hybrid: local-file freedom for those who want it, cloud collaboration for those who pay for it, and the browser as a viewer and inspector rather than an editor.

**Penpot** is the open-source option. It is released under the Mozilla Public License 2.0 by Kaleidos, designed for self-hosting, and priced (as of October 2026) at $0 per user for a "free and fully featured" Professional plan, $7 per editor per month for Unlimited (capped at $175 a month), $25 per member per month for Enterprise with centralized administration, and $50,000 a year for a dedicated private server. Self-hosting is the feature that matters to a regulated or sovereign buyer: the customer holds the files, the backups and the access logs, and the vendor never sees the work. Penpot added native design tokens in its 2.7 release on May 12, 2025 ([Design Systems & Handoff](/books/workplace-and-collaboration/design-systems-and-handoff#variables-and-tokens)).

**Adobe XD**, Adobe's interface design tool, is in maintenance mode, per a notice on its help center as of October 2026. It is the visible casualty of the market Figma took, and the context for the deal below.

**Canva** sells to everyone who isn't a product designer. As of October 2026 its plans are Free (one Brand Kit, three colors only), Pro at $144 a year for one person (five Brand Kits), Business at $250 a year per person (100 Brand Kits and approvals, collaboration and team admin tools) and Enterprise by contract (SSO and SCIM provisioning, 1,000 Brand Kits with tiered approvals and multi-team management). Every plan includes access to Affinity, a professional design suite. A **brand kit** is Canva's version of a design system for non-designers: approved colors, fonts and logos, applied through templates, with approval workflows so a marketing team can let hundreds of people make material without leaving the brand. The admin decision is the same as in Figma, framed differently: what the many may change, and who signs off.

## The Business

Figma's filings give the only audited numbers in the category. From its annual report for 2025, filed February 18, 2026:

- **Revenue** of $1,055.8 million in 2025, up 41% from $749.0 million in 2024.
- **Gross margin** of 82%, down from 88% in 2024 and 91% in 2023.
- **Net dollar retention** of 136% for 2025 (134% in 2024, 122% in 2023).
- **Paid customers** with more than $10,000 in annual recurring revenue: 13,861; with more than $100,000: 1,405 (963 a year earlier).
- **A majority of revenue** from outside the United States, and non-designers at about two-thirds of monthly active users in the last quarter of 2025.
- **The IPO.** Class A stock began trading on the NYSE as FIG on July 31, 2025; the offering closed August 1 at $33.00 per share, with 12.5 million shares sold by the company for net proceeds of $393.1 million.

The non-designer share is the business model in one number. A design tool that only designers use is a small market; a design file that product managers, engineers, writers and marketers open every day is a seat-expansion engine, and the seat ladder above (viewer, Collab, Dev, Content, Full) is built to monetize each of those audiences at its own price. The product launches follow the same logic. At Config on May 7, 2025, Figma launched Figma Make (prompt-to-code prototypes from a design), Figma Sites (designing and publishing responsive websites), Grid (a new auto layout option), Figma Draw (a rebuilt vector toolkit) and Figma Buzz (on-brand marketing assets from templates), each aimed at a team outside product design. How these figures compare with other collaboration vendors is the [Business Models & Unit Economics](/books/workplace-and-collaboration/business-models) chapter.

## The Adobe-Figma Deal and Why It Ended

Adobe announced on September 15, 2022 that it would acquire Figma for cash and stock. On December 18, 2023 the two companies announced a mutual termination, saying they saw "no clear path to receive necessary regulatory approvals from the European Commission and the UK Competition and Markets Authority". Both said they disagreed with the regulators' findings. Figma's 2025 annual report records the $1.0 billion termination fee Adobe paid it in 2023, which the filing books under the abandoned merger.

The aftermath is worth reading against the reason the deal died: XD is in maintenance mode, Figma went public as an independent company, and Figma's 2025 launches (Draw, Buzz, Sites) moved into ground Adobe and Canva occupy. Bundling and antitrust across the industry, including the Teams unbundling, is the [Suites, Bundling & Antitrust](/books/workplace-and-collaboration/suites-bundling-and-antitrust) chapter; the dated timeline of acquisitions is the Collaboration Landscape chapter.

## How to Build It

A design file is an `items` row of kind `design` in a container of kind `project` (core model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model) chapter). Its body is not rows: it is a document served by one multiplayer process and stored as a snapshot plus a change log, the way Figma describes. The relational side holds what everything else needs: identity, ownership, branches, the latest snapshot pointer, and checkpoints in `item_versions`.

```sql
-- One row per design-tool document (design file, and the whiteboard and
-- slide editors that share the engine). The body lives in object storage.
CREATE TABLE design_files (
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  editor           TEXT NOT NULL CHECK (editor IN ('design', 'whiteboard', 'slides', 'site')),
  schema_version   INT  NOT NULL,                 -- document format, for client migrations
  snapshot_uri     TEXT NOT NULL,                 -- latest compacted snapshot
  snapshot_seq     BIGINT NOT NULL,               -- last change folded into it
  head_seq         BIGINT NOT NULL,               -- last change accepted by the server
  size_bytes       BIGINT NOT NULL,
  main_item_id     UUID REFERENCES items (id),    -- set on a branch: the file it branched from
  branched_at_seq  BIGINT,                        -- main's head_seq when the branch was made
  thumbnail_uri    TEXT,                          -- rendered server-side by the same engine
  CHECK ((main_item_id IS NULL) = (branched_at_seq IS NULL))
);

-- Branch lifecycle and review, beside the branch's own design_files row.
CREATE TABLE design_branches (
  branch_item_id   UUID PRIMARY KEY REFERENCES design_files (item_id),
  main_item_id     UUID NOT NULL REFERENCES design_files (item_id),
  created_by       UUID NOT NULL REFERENCES members (id),
  status           TEXT NOT NULL CHECK (status IN ('active', 'in_review', 'merged', 'archived')),
  reviewer_id      UUID REFERENCES members (id),
  merged_by        UUID REFERENCES members (id),
  merged_at        TIMESTAMPTZ,
  merge_version_id UUID REFERENCES item_versions (id),  -- the checkpoint saved before merging
  CHECK (branch_item_id <> main_item_id)
);

-- Checkpoints are item_versions rows; design files add why each exists.
ALTER TABLE item_versions
  ADD COLUMN checkpoint_kind TEXT CHECK (checkpoint_kind IN
    ('autosave', 'named', 'disconnect', 'restore', 'pre_merge', 'publish')),
  ADD COLUMN snapshot_uri    TEXT,          -- design files: the snapshot at this checkpoint
  ADD COLUMN head_seq        BIGINT;

-- The live session: which server process owns the open document.
CREATE TABLE design_sessions (
  item_id          UUID PRIMARY KEY REFERENCES design_files (item_id),
  host             TEXT NOT NULL,           -- the process holding the document
  region           TEXT NOT NULL,           -- placed near its editors, within residency
  opened_at        TIMESTAMPTZ NOT NULL,
  connected        INT NOT NULL DEFAULT 0
);
```

The rules that make it work:

- **One owner per open document.** Route every connection for a file to the process in `design_sessions`; the process sequences changes, assigns `head_seq`, rejects cycles and broadcasts. Two owners for one file is the bug that loses work, so take the row with a lease and fence writes by it.
- **Per-property last-writer-wins.** Store changes as `(object_id, property, value, client_id, seq)`; fold them into a snapshot in the background and advance `snapshot_seq`. Clients load the snapshot and replay the tail.
- **Client-scoped ids** so offline creation can't collide, and fractional indexes for sibling order, stored with the parent link.
- **Checkpoints on a clock and on events:** every 30 minutes of activity, on disconnect, before a merge, on publish and on restore, each as an `item_versions` row. Restore writes a new checkpoint; it never rewinds history.
- **Retention follows the plan,** with legal holds overriding it: a hold on a custodian keeps every checkpoint of their files ([Data Retention](/docs/architecture/data-retention) is the general rule; the [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) chapter covers holds in this book).
- **Branches are files.** A branch is its own `design_files` row pointing at main; merging is a three-way comparison of main at `branched_at_seq`, main now and the branch, with conflicts presented per object and property. Publishing a library from a branch is refused.
- **Render server-side with the client's engine** for thumbnails, exports and previews, so what search, chat unfurls and exports show matches the editor.

## Auditing

- **File lifecycle:** create, duplicate (with the source version), move between projects and teams, transfer of ownership, delete and restore, each with actor and source.
- **Sharing and access:** link setting changes, invites, guest additions and removals, and role changes at team, project and file level, so "who could see this file on March 3" has an answer.
- **Branches:** creation, review requests and decisions, merges with the pre-merge checkpoint, and archive.
- **Exports and downloads:** who exported or downloaded what, in which format, because a design file often holds unreleased product plans.
- **Seat changes:** upgrade requests, approvals and downgrades with the approving admin, since each is a billing event ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Write the engine once** in a language that compiles to WebAssembly and to native, so the browser, the server renderer and the tests run the same code.
- **Treat GPU support as runtime data:** fall back live, record fallbacks per device class and blocklist from the data.
- **Give each open document one authoritative process,** and sync changes, not renders.
- **Resolve conflicts per property** at the server, with client-scoped ids, fractional ordering and local undo; reach for sequence CRDTs only for text that people co-type.
- **Make version history automatic and restores additive,** with retention by plan and holds above retention.
- **Sell branching and review to the customers who need it,** and refuse to publish from branches.
- **Put seat assignment and library access in the admin's hands,** priced by role, because the business grows by adding non-designers.
- **Offer self-hosting** if your buyers include those who can't let a vendor hold their product plans; Penpot shows it can be the whole pitch.

## References

**Vendor documentation**
- [Figma Help: View a file's version history](https://help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history), 30-minute checkpoints, 30 days on Starter and drafts, full history on paid plans, non-destructive restore, duplicates without comments or history
- [Figma Help: Guide to branching](https://help.figma.com/hc/en-us/articles/360063144053), plans with branching, Full seat to create, review and merge rules, conflict resolution, archived branches, publish only from main
- [Figma Help: Guide to libraries](https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-files-in-Figma), default libraries set by admins, library access control on Organization and Enterprise
- [Figma Help: Team access and permissions](https://help.figma.com/hc/en-us/articles/360039970673-Share-files-and-prototypes), audience access versus individual roles, inheritance, more access but not less
- [Figma: Pricing](https://www.figma.com/pricing/), Full, Dev and Collab seats and what each includes
- [Figma REST API: Files](https://developers.figma.com/docs/rest-api/files/), files as a tree of nodes rooted at a DOCUMENT node with CANVAS pages
- [Sketch: Real-time collaboration](https://www.sketch.com/docs/sharing-and-collaborating/real-time-collaboration/), Mac-app co-editing on Workspace documents, action-level updates, own-action undo, offline edits, upload blocking
- [Sketch: Libraries](https://www.sketch.com/docs/libraries/), library contents and update notifications
- [Penpot on GitHub](https://github.com/penpot/penpot), MPL-2.0 license, open standards, self-hosting, inspect code, the render-wasm directory
- [Penpot: Pricing](https://penpot.app/pricing), Professional, Unlimited, Enterprise and Private Server prices
- [Penpot 2.7 release notes](https://penpot.app/release-notes/2-7-all-the-small-things), native design tokens, May 12, 2025
- [Adobe XD Help](https://helpx.adobe.com/xd/desktop.html), the maintenance-mode notice
- [Canva: Pricing](https://www.canva.com/pricing/), plan prices, Brand Kit counts, approvals, SSO and SCIM on Enterprise, Affinity access, shared AI allowance

**Engineering write-ups**
- [Figma: WebAssembly cut Figma's load time by 3x (2017)](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/), the C++ engine, asm.js to WebAssembly, the load-time result
- [Figma: Figma rendering, powered by WebGPU (2025)](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/), Emscripten, native builds, GLSL to WGSL, live fallback to WebGL, device blocklisting
- [Figma: How Figma's multiplayer technology works (2019)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), process per document, no OT, CRDT-inspired property map, last-writer-wins, flicker rule, client ids, reparenting, fractional indexing, undo
- [Figma: Rust in production at Figma (2018)](https://www.figma.com/blog/rust-in-production-at-figma/), multiplayer server rewrite from TypeScript, latency spikes
- [Figma: Under the hood of Figma's infrastructure (2019)](https://www.figma.com/blog/under-the-hood-of-figmas-infrastructure/), one multiplayer instance per file, share of users outside the US
- [Figma: Config 2025 recap](https://www.figma.com/blog/config-2025-recap/), Make, Sites, Grid, Draw and Buzz, May 7, 2025

**Filings and announcements**
- [Figma, Inc. Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm), revenue, gross margin, net dollar retention, customer counts, seat types, AI credits, revenue outside the US, non-designer share, IPO terms, the $1.0 billion termination fee
- [Figma, Inc. prospectus (424B4), July 31, 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828025037014/figma424b4.htm), the IPO prospectus
- [Adobe: Adobe and Figma mutually agree to terminate merger agreement](https://news.adobe.com/news/news-details/2023/adobe-and-figma-mutually-agree-to-terminate-merger-agreement), December 18, 2023 termination, the September 15, 2022 announcement, European Commission and CMA
