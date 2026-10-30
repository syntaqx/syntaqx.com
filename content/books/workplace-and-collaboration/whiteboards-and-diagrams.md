+++
title = "Whiteboards & Diagrams"
description = "Miro, FigJam, Mural, Microsoft Whiteboard, Excalidraw and tldraw: infinite canvases, object models, sync, facilitation, admin controls and diagram-as-code."
category = "Workplace & Collaboration Industry"
order = 2038
part = "Design and Visual Collaboration"
tags = ["whiteboards", "diagrams", "infinite-canvas", "mermaid", "collaboration"]
+++

A digital whiteboard is the meeting-room wall made permanent: an unbounded surface where a group puts sticky notes, shapes, arrows, images and embedded documents, moves them around together, and comes back to the result next week. A diagramming tool is its stricter cousin, where the shapes mean something (a process step, a database, a network link) and the arrows stay attached when the shapes move. Since 2020 both have become ordinary workplace software, bought by the seat, governed by the admin, retained and discovered like any other file.

The engineering is harder than it looks. A board has no edges, so the renderer must draw only what is on screen at whatever zoom the user picked, while thousands of objects sit outside the view. Objects connect to each other, so moving one must move the arrows bound to it, for everyone, without the arrows ending up pointing at nothing. Twenty people may drag stickies at the same moment in a workshop, while the facilitator runs a timer and a hidden vote. And because boards hold the raw output of planning sessions (roadmaps, incident timelines, reorganization charts), the customer's admin needs the same retention, legal hold and sharing controls a document gets. This chapter covers the canvas, the object model, sync and storage, facilitation, plan limits and admin control, and diagrams as code. Figma's engine and multiplayer model are [Design Tools](/books/workplace-and-collaboration/design-tools#multiplayer); co-editing theory is the Real-Time Co-Editing chapter.

## How the Platforms Do It

As of October 2026, from vendor pricing pages, help centers and developer documentation:

| Product | Shape | Where the data lives | Free tier | Enterprise and admin controls | Developer surface |
| --- | --- | --- | --- | --- | --- |
| **Miro** | Whiteboard and visual workspace with AI | Miro's cloud; EU hosting on all plans, US, Australia and Japan hosting on Enterprise | 3 editable boards | SAML SSO, SCIM, audit logs and SIEM, board classification, Enterprise Guard add-on, sharing policies, AI controls | REST API with typed item endpoints, credit-based rate limits |
| **FigJam** | Whiteboard in the Figma platform | Figma's cloud, as Figma files | Figma's plans | Figma's org and team controls; templates published to org or team | Figma plugins and widgets |
| **Mural** | Whiteboard built around facilitation | Mural's cloud | Unlimited murals, 3 editable at a time | Business and Enterprise plans | Not covered here |
| **Lucid** (Lucidchart, Lucidspark) | Diagramming plus whiteboard | Lucid's cloud | Not covered here | MCP server and AI connectors announced in 2026 | MCP server |
| **Microsoft Whiteboard** | Whiteboard in Microsoft 365 and Teams meetings | A `.whiteboard` file in the creator's OneDrive | Enabled by default in Microsoft 365 tenants | Tenant on/off, Teams meeting policy, Conditional Access; OneDrive retention, legal hold, DLP, basic eDiscovery | Fluid Framework |
| **Excalidraw** | Hand-drawn-style whiteboard | Browser storage; shared scenes encrypted on the server | Free app (MIT-licensed open source) | Not applicable to the open-source app | npm package, `.excalidraw` JSON format |
| **tldraw** | Whiteboard SDK and app | Wherever the integrating product stores it | Development use only without a license key | Not applicable | SDK with a record store, bindings and a sync server |

Two kinds of product hide in the table. Miro, FigJam, Mural, Lucid and Microsoft Whiteboard are **products**: a company buys seats and its people use the vendor's boards. Excalidraw and tldraw are mainly **components**: open-source or source-available editors that other products embed, so the canvas inside a wiki, an issue tracker or an internal tool is often one of them.

## The Infinite Canvas

Every whiteboard works in two coordinate systems. **Page space** is the board itself: shapes store their positions there, and those numbers don't change when anyone pans or zooms. **Screen space** is pixels on the user's display. A camera (an offset and a zoom factor) maps one to the other. tldraw's documentation is the clearest public statement of the model: page space is where top-level shapes keep their coordinates, the camera "determines which part of page space is visible", and the editor offers conversions both ways (`screenToPage`, `pageToScreen`) plus a third viewport space measured from the editor's container. Every pointer event has to be converted to page space before hit-testing, and every overlay that floats above the board (a comment pin, a cursor label) has to be converted back.

Rendering an unbounded surface is a culling problem. tldraw's culling checks each shape's page bounds against the viewport and hides the ones that don't intersect it, while keeping the selected shape and the one being edited visible even off screen. Culled shapes stay in the DOM with `display: none` and stay in the store, so they can still be selected, hit-tested and exported; a shape type with effects beyond its bounds (a glow) can opt out, at a cost in recalculation. Rendering technologies vary: tldraw renders shapes as DOM elements, Excalidraw describes itself as a "canvas-based whiteboard", and Figma's own editor draws with a C++ engine compiled to WebAssembly on WebGPU or WebGL ([Design Tools](/books/workplace-and-collaboration/design-tools#the-browser-as-the-design-tool)). The choice trades text quality and accessibility (DOM) against raw object counts (canvas and GPU), and it shapes everything from screen-reader support to export fidelity; accessibility of canvases is the Accessibility & Localization chapter.

My rules for any canvas renderer:

- **Store page coordinates only.** The camera is per-user session state, never part of the document.
- **Cull by bounds every frame,** with exceptions for selection and editing, and keep culled objects addressable.
- **Simplify at low zoom.** When a sticky note is four pixels wide its text is noise; draw a colored block. The thresholds are product decisions, not standards.
- **Keep hit-testing geometry separate from drawing,** so a shape can be selected precisely whatever renders it (tldraw's shape utils return geometry for hit-testing distinct from the component that draws).

## Object Models

The vendors' public data models converge on the same shape: a flat set of typed objects with positions, a parent for grouping or framing, an order, and connectors that reference other objects.

- **Miro** exposes boards as collections of typed items, each type with its own create, update and get endpoints: sticky notes, text, shapes, cards, app cards, documents, embeds, frames and images, plus tags. Connectors replaced the old line widgets, and for a connector "`startItem` and `endItem` fields are required"; free-form lines are not supported through the API, and a connector's shape is straight, elbowed or curved.
- **tldraw** keeps everything in a reactive store of JSON records with three scopes. **Document** records (shapes, pages, bindings, assets) are saved and synced; **session** records (the current page, the camera) stay in one editor instance; **presence** records (cursors, selections) sync live to others but are never saved. A **binding** is its own record with `fromId`, `toId`, a type and props; for an arrow, the arrow is always the "from" side, the props store the anchor on the target, and when either end moves a callback updates the arrow. Deleting a shape cleans up its bindings automatically, and an arrow can "let go" at its current point instead of pointing at empty space. Every shape also carries a free-form `meta` object that tldraw stores and syncs without reading.
- **Excalidraw** saves to an open JSON format: `type` (always `"excalidraw"`), a schema `version`, a `source`, an `elements` array, an `appState` for editor settings, and `files` holding image data keyed by id.
- **Figma's files** (FigJam included) are a tree of nodes with a `DOCUMENT` root and a `CANVAS` node per page, per the REST API.

What to take from them:

- **Connectors are relations, not drawings.** An arrow that stores its endpoints as coordinates breaks the first time someone moves a box. Store the attachment (which object, which anchor point), recompute geometry when either end moves, and decide what happens on delete.
- **Separate what is saved from what is shared from what is local.** tldraw's three scopes are the right decomposition: the document is durable and retained; presence is ephemeral and must never reach the retention store or eDiscovery; the camera is per-user.
- **Version the schema in the document.** Excalidraw's `version` and tldraw's migrations let an old board open in a new client, which matters because boards are kept for years.
- **Leave room for integrators.** Typed items with an app-card type (Miro) and an opaque `meta` (tldraw) let an integration store a Jira key or a ticket status on a sticky without a schema change.

## Sync and Storage

The sync architectures are the same family as design tools': one authority per board, changes not renders over the wire.

**tldraw sync** runs one `TLSocketRoom` per document that "stores the authoritative copy of the document, relays changes between sync clients over WebSockets", with a warning that there must only ever be one room instance per document globally. Its Cloudflare template gives each room a Durable Object with SQLite storage, and keeps large binary assets (images, video) out of the document, in object storage (R2 in the template), behind an asset-store interface. The server validates documents and runs migrations so clients on different versions can collaborate.

**Microsoft Whiteboard** runs on the Fluid Framework, which tenants enable with `Set-SPOTenant -IsWBFluidEnabled $true`. Fluid's service is close to a pure total-order broadcast: it "gives each op a sequential order number" and sends every op to every client, knows nothing about the contents of a container, stores summaries so clients don't replay a long history on load, and leaves merge logic to the clients.

**Excalidraw** shows the other end of the trust spectrum. Its shareable links are end-to-end encrypted in the browser: the client generates a random 128-bit AES-GCM key, encrypts the scene, uploads only ciphertext, and puts the key after the `#` in the URL, which browsers never send to the server. The project describes its collaboration as end-to-end encrypted too. The consequence is the one the Encryption & Customer-Managed Keys chapter generalizes: a server that holds only ciphertext can't index, preview, retain meaningfully or answer an eDiscovery request about the content.

Where the bytes live decides who controls them, and Microsoft Whiteboard is the instructive case. New boards are `.whiteboard` files created in the OneDrive of the person who started them, including boards started in Teams meetings, chats and channels (boards from Surface Hub and Teams Rooms devices, and older boards, live in Azure). As files, they inherit the tenant's OneDrive controls: retention policies, quota, legal hold, DLP and basic eDiscovery (keyword and file-type search), with file audit events for create, modify, share and delete. Boards still stored in Azure support none of DLP, eDiscovery or retention policies, and Microsoft says they will eventually have to be migrated to OneDrive or deleted. When an employee leaves, an admin preserves their boards by moving the files out of their OneDrive before it is deleted; on Azure storage, since June 1, 2022, deleting a user deletes even the boards they had shared. That is the book's inversion in miniature: the board is the employer's record, and the employer's admin decides how long it lives and who gets it when its creator is gone.

## Templates and Facilitation

Whiteboards earn their seats in workshops, and the workshop features are where the products differ most.

- **Templates.** FigJam templates add pre-made content to a board, and anyone with can-edit access can publish a custom template to the organization or the current team. Templates are how a company standardizes its rituals (retrospectives, incident reviews, planning), which makes template publishing a governance question as well as a content one.
- **Voting.** In FigJam's voting sessions "each participant's choices are hidden while they vote", with the tally revealed when the session ends. Hidden voting is the point: it avoids anchoring on the first visible votes.
- **Following.** FigJam's spotlight asks everyone to follow the presenter's view, and viewers get a few seconds to ignore the request.
- **Ephemeral talk.** FigJam's cursor chat sends live, temporary messages attached to a cursor, and Figma keeps no log of them. That is a deliberate retention decision: content designed to vanish is outside the record, which the customer's legal team should know before it treats boards as complete.
- **The facilitator's toolkit.** Mural lists on every plan, including Free: summon and take control, timer, voting, private mode, laser pointer, celebrate, outline and instructions, hide and reveal content, facilitator lock and a custom toolbar. Private mode (participants can't see each other's notes until the reveal) and facilitator lock (the board structure can't be moved by participants) are the two that change how a session runs.

Facilitation features share a data property: most of their state is ephemeral (a running timer, who is being summoned) but some of it is a record (the result of a vote, the content revealed at the end). Model them separately: session state in presence, outcomes as document objects.

## Plans, Limits and the Admin

The free tiers are designed around one limit: **editable boards**. Miro's Free plan keeps three boards editable (you can create more, but only the newest three stay editable), makes every board visible to all team members by default, and has no guest or visitor roles. Mural's Free plan allows unlimited members and murals, of which three can be editable at a time. A team that runs more than three active workshops has to pay; a team that only looks at old boards doesn't.

Above the free tier, the plans add the same controls the rest of this book catalogs, and the admin, not the board owner, holds them. As of October 2026, Miro's pricing lists Starter at $8 and Business at $20 per member per month billed yearly, and Enterprise by contract from 30 members, with SAML SSO and enforcement, SCIM provisioning and deprovisioning, audit logs and SIEM integrations, domain control, configurable sharing policies, granular AI controls, manual board classification (automated classification is a paid add-on) and Enterprise Guard, an add-on for managing sensitive content on boards. Data residency is a plan line: EU hosting is on all plans, US, Australia and Japan hosting are Enterprise-only, and moving existing EU customers costs extra. AI is metered: Miro's credits (25 per member per month on Starter, 50 on Business, from 2,500 a month pooled on Enterprise) reset monthly without rollover, and calls to its MCP server are capped per day by plan.

Microsoft Whiteboard shows the suite version of admin control, with an edge worth knowing. Admins turn it on or off for the whole tenant, hide it in meetings with a Teams meeting policy, and block it with a Conditional Access policy; Microsoft notes that meeting policies "only hide Whiteboard entry points; they don't prevent the users from using Whiteboard", while Conditional Access prevents access without hiding the entry points. A policy that hides a feature is not a policy that forbids it, and an admin console should say which kind each switch is.

## Diagrams and Diagram-as-Code

Diagramming tools add meaning to shapes: a shape library per notation (flowchart, UML, network, cloud architecture, org charts), connectors that route around shapes, and data linking that colors or labels shapes from a spreadsheet or a live source. Lucid's 2026 announcements show where the category is heading: an MCP server for Lucid content (March 26, 2026), a Claude connector (April 7, 2026) and a ChatGPT integration through an MCP server app (April 13, 2026), all aimed at letting AI assistants read and produce diagrams. Agents acting on workplace content are the AI Agents, Connectors & MCP chapter.

The alternative is to write the diagram as text and render it. **Mermaid** describes itself as letting you "create diagrams and visualizations using text and code" in a Markdown-inspired syntax, with flowcharts, sequence, class, state, entity-relationship, Gantt, Git graph, mind map, timeline, C4 and many more types. GitHub has rendered Mermaid code blocks in Markdown since February 14, 2022: its pipeline replaces the block with a template, and in a browser an iframe pointing at GitHub's rendering service runs Mermaid.js locally, so user-supplied diagram code is "locked away in an iframe". **PlantUML** draws UML (sequence, use case, class, activity, component, deployment, state, timing) and many non-UML types from text, uses Graphviz as its default layout engine, and is distributed under several licenses (GPL, LGPL, Apache 2.0, BSD, EPL 2.0 and MIT).

The trade-off is a real one, and I pick per diagram:

- **Text diagrams win when the diagram is part of the system.** They live in the repository next to the code, diff in a pull request, can be generated from the system itself and never drift into a forgotten board. Architecture decision records, sequence diagrams in API docs and runbooks belong here.
- **Canvases win when the diagram is a conversation.** Divergent work (workshops, early system sketches, incident timelines built live) needs free placement, many hands and no syntax.
- **Render untrusted diagram code in a sandbox.** Any product that renders user-supplied Mermaid or PlantUML is running a layout engine on attacker-controlled input; GitHub's iframe isolation is the pattern, and a server-side renderer should be resource-limited the same way.
- **Convert one way, deliberately.** Importing text into a canvas is easy; keeping a canvas and a text source in sync is not. Pick one as the source of truth.

## Building on an SDK

A product team that wants a whiteboard inside its own product will usually embed one, and the licenses differ in ways procurement must catch. Excalidraw is "released under the MIT license", with an npm package. tldraw's SDK is source-available, not open source: without a key it "permits use only in development"; production needs a commercial license, a free 100-day trial (which reports a hash of the license key to tldraw's servers, never canvas content) or a discretionary non-commercial hobby license that requires a "made with tldraw" watermark. The other SDK-level decision is sync: tldraw ships a sync server with one room per document; Microsoft's Fluid Framework offers ordering as a service; Excalidraw publishes an example collaboration server.

Developer platforms of the board products themselves have their own budgets. Miro's REST API gives each app 100,000 credits per minute per user, with methods in four levels costing 50, 100, 500 or 2,000 credits a call (2,000, 1,000, 200 or 50 calls a minute), returning HTTP 429 `tooManyRequests` when exceeded. The general design of such limits is the APIs, Events & Rate Limits chapter.

## How to Build It

A board is an `items` row of kind `design` with a `design_files` row whose `editor` is `whiteboard` ([Design Tools](/books/workplace-and-collaboration/design-tools#how-to-build-it)): the document lives in a snapshot plus change log served by one room. This chapter adds a relational **projection** of board objects for the things the document store can't do (search, API listing, connectors, eDiscovery export), plus facilitation outcomes and templates.

```sql
-- A projection of a board's document objects, rebuilt from the change log.
-- Never edited directly: the room is the authority.
CREATE TABLE board_objects (
  item_id        UUID NOT NULL REFERENCES design_files (item_id),
  object_id      TEXT NOT NULL,              -- client-scoped id from the document
  kind           TEXT NOT NULL CHECK (kind IN ('sticky', 'text', 'shape', 'card', 'frame',
                   'image', 'embed', 'app_card', 'connector', 'drawing', 'section')),
  parent_id      TEXT,                       -- frame, section or group
  order_key      TEXT NOT NULL,              -- fractional index among siblings
  x              DOUBLE PRECISION NOT NULL,  -- page space
  y              DOUBLE PRECISION NOT NULL,
  width          DOUBLE PRECISION,
  height         DOUBLE PRECISION,
  text_content   TEXT,                       -- plain text for search and export
  author_member_id UUID REFERENCES members (id),
  app_installation_id UUID REFERENCES app_installations (id),  -- app cards
  meta           JSONB NOT NULL DEFAULT '{}', -- integrator data, stored not read
  deleted_at     TIMESTAMPTZ,
  head_seq       BIGINT NOT NULL,            -- document change that produced this row
  PRIMARY KEY (item_id, object_id)
);

-- Connectors as relations: endpoints reference objects, not coordinates.
CREATE TABLE board_connectors (
  item_id        UUID NOT NULL,
  object_id      TEXT NOT NULL,              -- the connector's own board_objects row
  start_object_id TEXT,                      -- NULL when an end was let go
  start_anchor   POINT,                      -- normalized 0..1 on the target
  end_object_id  TEXT,
  end_anchor     POINT,
  route          TEXT NOT NULL CHECK (route IN ('straight', 'elbow', 'curved')),
  PRIMARY KEY (item_id, object_id),
  FOREIGN KEY (item_id, object_id) REFERENCES board_objects (item_id, object_id)
);

-- Facilitation: the session is ephemeral, its outcome is a record.
CREATE TABLE board_votes (
  id             UUID PRIMARY KEY,
  item_id        UUID NOT NULL REFERENCES design_files (item_id),
  started_by     UUID NOT NULL REFERENCES members (id),
  votes_per_person INT NOT NULL CHECK (votes_per_person > 0),
  hidden_until_end BOOLEAN NOT NULL DEFAULT true,
  started_at     TIMESTAMPTZ NOT NULL,
  ended_at       TIMESTAMPTZ
);

CREATE TABLE board_vote_ballots (
  vote_id        UUID NOT NULL REFERENCES board_votes (id),
  member_id      UUID NOT NULL REFERENCES members (id),
  object_id      TEXT NOT NULL,
  cast_at        TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (vote_id, member_id, object_id)
);

-- Templates published to a team or the whole organization.
CREATE TABLE board_templates (
  id             UUID PRIMARY KEY,
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  source_item_id UUID NOT NULL REFERENCES design_files (item_id),
  source_version_id UUID NOT NULL REFERENCES item_versions (id),  -- frozen at publish
  scope          TEXT NOT NULL CHECK (scope IN ('team', 'organization')),
  scope_group_id UUID REFERENCES groups (id),                     -- the team, when scoped
  published_by   UUID NOT NULL REFERENCES members (id),
  published_at   TIMESTAMPTZ NOT NULL,
  retired_at     TIMESTAMPTZ,
  CHECK ((scope = 'team') = (scope_group_id IS NOT NULL))
);
```

The rules:

- **The projection lags and says so.** `board_objects.head_seq` tells a reader how current the row is; search and export state the sequence they reflect.
- **Presence never lands in tables.** Cursors, selections, live timers and cursor chat stay in the room's memory; nothing in this schema stores them, which is the retention decision made explicit.
- **Ballots are hidden by permission, not by the client.** Until `ended_at`, the API returns a member only their own ballots; the facilitator sees counts only if the vote allows it.
- **Templates are frozen versions.** Publishing points at an `item_versions` row, so editing the source board doesn't change a template mid-quarter.
- **Assets live outside the document,** in object storage under the workspace's region, referenced by id, and deleted by the retention job when the last referencing board is purged ([File Uploads](/docs/architecture/file-uploads)).
- **Retention, holds and eDiscovery see the board as a file** plus its `board_objects` text, because an export of only the snapshot blob is unreadable to a reviewer.

## Auditing

- **Board lifecycle and sharing:** create, duplicate, move, ownership transfer (above all when the creator leaves), link and guest changes, deletion and restore.
- **Template publishing and retirement,** with scope, since a template changes how many teams work.
- **Vote outcomes** with their settings (hidden or open, votes per person), so a decision taken on a board can be shown to have been taken fairly.
- **App and embed additions:** which app card or embed was placed, by whom, through which installation.
- **Exports** (image, PDF, CSV of stickies) with the exporter, because exported boards leave the tenant's controls.
- **What the record excludes:** a per-tenant statement that cursor chat and presence aren't retained, so legal teams don't assume they are ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Keep documents in page coordinates** and the camera in per-user session state.
- **Cull by viewport bounds** and simplify at low zoom, with selection and editing exempt.
- **Model connectors as bindings** to objects and anchors, with defined behavior on delete.
- **Split saved, shared and local state** the way tldraw's document, presence and session scopes do, and keep presence out of every record.
- **Run one authority per board,** keep assets out of the document, and version the schema inside it.
- **Store boards where the customer's controls reach them;** a board outside retention, DLP and eDiscovery is a compliance gap.
- **Treat facilitation outcomes as records** and facilitation state as ephemeral.
- **Label admin switches honestly:** hiding an entry point is not blocking a feature.
- **Use text diagrams for what belongs to the system** and canvases for conversations, and sandbox the renderer.
- **Read the SDK license** before shipping an embedded canvas.

## References

**Vendor documentation**
- [Miro: Pricing](https://miro.com/pricing/), plan prices, editable-board limit, free-plan visibility and roles, SSO, SCIM, audit logs, board classification, Enterprise Guard, data residency by plan, AI credits and MCP call caps
- [Miro Developer Platform: REST API comparison guide](https://developers.miro.com/docs/rest-api-reference-guide), typed item endpoints, item types, connectors requiring start and end items, connector shapes
- [Miro Developer Platform: Rate limiting](https://developers.miro.com/reference/rate-limiting), 100,000 credits per minute, four cost levels, HTTP 429
- [Figma Help: Guide to FigJam](https://help.figma.com/hc/en-us/articles/1500004362321-Guide-to-FigJam), stickies, connectors, stamps, hidden voting, spotlight, templates published by can-edit members, widgets, sections
- [Figma Help: Cursor chat](https://help.figma.com/hc/en-us/articles/1500004414842-Guide-to-widgets-in-FigJam), temporary cursor messages with no log kept
- [Figma REST API: Files](https://developers.figma.com/docs/rest-api/files/), DOCUMENT and CANVAS nodes
- [Mural: Pricing](https://www.mural.co/pricing), plan prices, three editable murals on Free, facilitation features on every plan
- [Lucid: Newsroom](https://lucid.co/newsroom), the MCP server (March 26, 2026), Claude connector (April 7, 2026) and ChatGPT MCP app (April 13, 2026) announcements
- [Microsoft Learn: Manage access to Microsoft Whiteboard](https://learn.microsoft.com/en-us/microsoft-365/whiteboard/manage-whiteboard-access-organizations), tenant toggle, Fluid enablement, meeting policies that only hide entry points, Conditional Access
- [Microsoft Learn: Manage data for Microsoft Whiteboard](https://learn.microsoft.com/en-us/microsoft-365/whiteboard/manage-data-organizations), OneDrive and Azure storage, supported data controls, the June 1, 2022 deletion change, transfer when a user leaves, audit events
- [tldraw: Editor](https://tldraw.dev/docs/editor), the editor's store, transactions and history
- [tldraw: Store](https://tldraw.dev/sdk-features/store), document, session and presence scopes, snapshots and migrations
- [tldraw: Coordinates](https://tldraw.dev/sdk-features/coordinates), screen, viewport and page space and conversions
- [tldraw: Culling](https://tldraw.dev/sdk-features/culling), viewport-bounds culling, `display: none`, exemptions and opt-out
- [tldraw: Shapes](https://tldraw.dev/docs/shapes), shape utils, geometry for hit-testing, the meta object
- [tldraw: Bindings](https://tldraw.dev/sdk-features/bindings), binding records, arrow semantics, cleanup and isolation on delete
- [tldraw: Sync](https://tldraw.dev/docs/sync), one authoritative room per document, Durable Objects and SQLite, asset storage, migrations
- [tldraw: License](https://tldraw.dev/community/license), development-only default, trial, commercial and hobby licenses, watermark, trial telemetry
- [Excalidraw on GitHub](https://github.com/excalidraw/excalidraw), MIT license, canvas-based whiteboard, end-to-end encrypted collaboration, export formats
- [Excalidraw: JSON schema](https://docs.excalidraw.com/docs/codebase/json-schema), the `.excalidraw` file format
- [Excalidraw: excalidraw-room](https://github.com/excalidraw/excalidraw-room), the example collaboration server
- [Fluid Framework: Overview](https://fluidframework.com/docs/), client-owned state and a thin sequencing service
- [Fluid Framework: Architecture](https://fluidframework.com/docs/concepts/architecture), total-order broadcast, summaries, client-side merge
- [Mermaid: Introduction](https://mermaid.js.org/intro/), text-based diagrams and the diagram types
- [PlantUML](https://plantuml.com/), diagram types and Graphviz layout
- [PlantUML: Download](https://plantuml.com/download), the licenses PlantUML is distributed under

**Engineering write-ups**
- [Excalidraw: End-to-end encryption in the browser (2020)](https://plus.excalidraw.com/blog/end-to-end-encryption), 128-bit AES-GCM keys in the URL fragment, ciphertext-only server
- [GitHub: Include diagrams in your Markdown files with Mermaid (2022)](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/), February 14, 2022 launch, iframe-isolated client-side rendering
