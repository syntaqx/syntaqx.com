+++
title = "Docs & Wikis"
description = "How workplace docs and wikis model content: Notion blocks, Confluence ADF, Google Docs, Loop and Coda; page trees, versions, publishing and ownership."
category = "Workplace & Collaboration Industry"
order = 2023
part = "Docs, Wikis and Files"
tags = ["workplace", "docs", "wikis", "content-model", "versioning"]
+++

A workplace doc is the smallest unit of company knowledge that someone will be asked to defend later. A design doc gets linked from a decision, a runbook gets opened at 3 a.m., an onboarding page gets read by every new hire for four years after its author left. The product has to make writing feel as light as a note and keep the result as durable as a record: every version recoverable, every page owned by somebody, every restriction honored in search and AI answers, and the whole corpus exportable when the customer leaves.

That combination is what makes the category hard. The editor needs a document model that can be edited by many people at once (the mechanics are [Real-Time Co-Editing](/books/workplace-and-collaboration/real-time-collaboration)), rendered on web, desktop and mobile, embedded in chat and email, and queried like a database. The wiki around it needs a hierarchy that carries permissions, a lifecycle that notices when content goes stale, and admin controls that decide whether anything can be published outside the company at all. In consumer content the platform decides what stays up; here the customer's admins and page owners do, and the vendor's job is to give them the levers (see [Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties) for the same inversion in chat).

This chapter covers the content models (blocks, trees and documents), the container hierarchy and how restrictions flow through it, templates and databases inside docs, version history and restore, publishing to the web, and staleness and ownership. Files and sync are [Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync); the intranet layer on top of wikis is [Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge); databases built by users are [No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools).

## How the Platforms Do It

As of October 2026:

| Product | Unit of content | Container | Storage format (public) | Versions | Publish outside the org |
| --- | --- | --- | --- | --- | --- |
| **Notion** | Blocks, each with a type, properties, child list and parent | Workspace, teamspaces, pages (a page is a block) | Block records in Postgres sharded by workspace | 7 days (Free) to unlimited (Enterprise) | Notion Sites on notion.site; Enterprise owners can disable publishing |
| **Confluence Cloud** | Pages and live docs in a page tree | Site, spaces | Atlassian Document Format (ADF) JSON in the editor | Full page history, restore by copy | Not covered here |
| **Google Docs** | A document of tabs, each a body of structural elements | My Drive or shared drives | Docs API JSON with UTF-16 indexes | Version history, up to 40 named versions | Publish to the web, limited by admin settings |
| **Microsoft Loop** | Components and pages in `.loop` files | Workspaces in SharePoint Embedded containers, or OneDrive and SharePoint | Fluid Framework distributed data structures | Through SharePoint and OneDrive versioning | Governed by SharePoint sharing policy |
| **Coda (now Superhuman Docs)** | Pages with tables and formulas | Docs inside workspaces | Not publicly detailed | Not publicly detailed | Not researched here |
| **Quip (Salesforce)** | Documents | Not researched here | Not publicly detailed | Not publicly detailed | Being retired; Slack canvases are the migration path |

Three shapes recur. **Block trees** (Notion, and the component model of Loop) treat everything, including the page itself, as a node with a type and children, so a heading can become a toggle, a page can be nested inside a list, and a database row is also a page. **Structured documents** (Confluence's ADF, Google Docs) keep a page as one document with a schema of block and inline nodes, edited as a whole and versioned as a whole. **Docs-as-apps** (Coda) put tables, formulas and buttons inside the page, which makes the doc a small application and pulls in the problems of [No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools).

## Blocks: Notion's Model

Notion published the most complete public description of a block model in 2021. Every block has:

- **An ID**, a random UUID v4.
- **A type**, which decides how the block renders and how its properties are read.
- **Properties**, a map of custom attributes; the most common is `title`, which holds the text.
- **Content**, an ordered list of child block IDs.
- **A parent**, the ID of the block above it, which the post says is "only used for permissions."

Three consequences follow, and they are the reasons teams pick a block model:

- **Type changes are cheap and lossless.** "Turn into" changes only the type; properties and children survive, so a checked to-do stays checked after a round trip through heading and back.
- **Structure is the content list.** Indenting a block moves it into the previous sibling's child list, and only if that sibling can hold children. Rendering depends on type: list children indent, toggle children show when expanded, page children open as a new page.
- **Permissions walk up, never down.** A block can appear in more than one content list, so inheriting access from content lists would be ambiguous ("ambiguity is unacceptable in a permissions system," in the post's words) and expensive. The upward parent pointer is the single path that decides access.

Edits are operations. Each UI action becomes one or more operations that create or update one record, grouped into a transaction the server commits or rejects whole. The client applies the change locally first, so the editor responds within a few milliseconds, queues the transaction, and sends it to `/saveTransactions`, which loads the affected records, applies the operations to a copy, checks permissions and coherence, and commits. Version snapshots, search indexing and real-time fan-out happen after the commit. Clients hold a WebSocket to a service that pushes new record versions for everything they've subscribed to; a client compares versions and fetches what's stale. Native apps cache records in SQLite or IndexedDB, persist the pending transaction queue the same way, and fall back to a server call that walks the content tree from a starting block when a page isn't cached.

The model has a cost that shows up at scale: a busy workspace is billions of tiny rows. Notion's 2021 sharding post split the monolith into 480 logical shards (Postgres schemas) across 32 physical databases, with the workspace ID as the partition key because "each block belongs to exactly one workspace," and every table reachable from `block` by foreign key sharded the same way. 480 was chosen because it divides evenly by many host counts. In 2023 the fleet went from 32 to 96 databases, each now holding 5 logical shards instead of 15, after some shards passed 90% CPU at peak and connection pooling hit its limits. Tenant-keyed sharding is the general rule ([Multi-Tenancy](/docs/architecture/multi-tenancy)); the industry twist is that the tenant is the customer's workspace, and that same boundary is what admins export, hold and delete.

The public API shows the model's edges. Notion's API caps rich text content at 2,000 characters per text object, block arrays at 100 elements per request and payloads at 1,000 block elements and 500 KB, and returns a `validation_error` beyond them; rate limits are 180 requests a minute per connection on most plans and 600 on Business and Enterprise (as of October 2026). A large page is a tree you page through, not a document you fetch.

## Structured Documents: Confluence, Google Docs and Loop

**Confluence** stores the editor's content as Atlassian Document Format, a JSON tree whose root is `doc` with a `version`, and whose nodes have a `type`, `content`, optional `attrs` and, for text, `marks`. Top-level block nodes include paragraphs, headings, lists, tables, panels, code blocks, expands, media and sync blocks; inline nodes include text, mentions, emoji, dates, status lozenges and inline cards; marks include strong, em, code, link, strike and text color. The schema is closed: an app that renders or writes Confluence content works against that list, which is what keeps third-party rendering and export predictable.

Confluence also has two content types side by side. **Pages** have separate view and edit modes and a publish step: readers see the published version while drafts change. **Live docs** save every change for everyone in real time and need no publishing; Atlassian's help center gives the limits as 100 simultaneous viewers and 40 simultaneous editors, and admins can turn live docs on or off per space. A live doc converts to a page (and gains the publish step) when a team wants a reviewed, stable version. The split is a product admission worth copying: some content is a conversation that happens to be written down, and some is a record that should change only when someone presses publish.

**Google Docs** exposes a document as tabs, each holding a body of structural elements (paragraphs, tables, section breaks, a table of contents), with paragraphs made of text runs of uniform style. Indexes are zero-based and "measured in UTF-16 code units," so an emoji outside the Basic Multilingual Plane consumes two, and headers, footers and footnotes are separate segments with their own index spaces. Edits through the API are `batchUpdate` requests that insert text or change styles at index ranges, the same vocabulary as the editor's operational transforms. A Google Doc can hold up to 1.02 million characters.

**Microsoft Loop** is the suite answer: components that live in Teams chats, Outlook mail and Loop pages at once, backed by `.loop` files (earlier `.fluid`) and the Fluid Framework. Where the content is stored depends on where it was created, which is the clearest illustration of the inversion in this part of the book:

| Created in | Stored in | Lifetime follows |
| --- | --- | --- |
| Loop app, shared workspace | SharePoint Embedded shared container | Workspace owners |
| Loop app, My workspace | The user's own SharePoint Embedded container, shared with Copilot Pages | The user account |
| Teams channel or channel meeting | The team's SharePoint site | The Microsoft 365 group |
| Teams private chat, Outlook mail, OneNote | The creator's OneDrive | The user account |

A component pasted into a group chat therefore lives in the sender's OneDrive and leaves with the sender's account unless an admin acts. Loop workspaces count against the tenant's SharePoint quota and are capped at 25 TB each. Admin control is split across tools: Cloud Policy settings govern Loop workspaces and components in Outlook, OneNote and Whiteboard, while Teams experiences need `Set-SPOTenant -IsLoopEnabled` in SharePoint PowerShell, and Microsoft's own page warns that both must be set to fully control Loop. Those controls stop new creation; they don't restrict access to existing Loop files, which takes conditional access policies.

**Coda** put tables and formulas inside docs and was bought by Grammarly, announced December 17, 2024, with Coda's CEO becoming Grammarly's CEO. Grammarly later took the name Superhuman, and on July 8, 2026 Coda was renamed Superhuman Docs. **Quip**, Salesforce's docs product, is being retired; Slack's help center describes converting Quip documents to Slack canvases one at a time (bulk conversion isn't supported, and converted documents become read-only), on paid Quip teams only. <!-- source-gap: quip-retirement-dates | secondary | Quip renewal cutoff and end-of-access dates | closes with: the text of Salesforce Help article 005299603 (JavaScript-rendered, unreadable to fetch) | checked: 2026-10-29 --> The exact renewal and shutdown dates appear only in secondary coverage, so I don't give them here.

## Containers, Trees and Restrictions

A wiki is a tree of pages inside a container: a Confluence space, a Notion teamspace, a Google shared drive, a Loop workspace. In the core data model the container is a `containers` row with `kind = 'space'` and the pages are `items` with `kind = 'page'`; the tree is a parent pointer on the page.

Restrictions flow through the tree, and the products differ in exactly how. Confluence's rules are explicit and worth adopting as a reference:

- **View restrictions inherit** from parent to children; **edit restrictions don't**. A person blocked from editing a parent can edit a child unless the child is restricted too.
- **Pages can only narrow access.** "A page cannot have greater access than its container": page restrictions further restrict space permissions and can't grant what the space doesn't.
- **Restricted pages disappear.** They don't show in the page tree or in macros for people who can't view them; a shared link reveals the title in the URL and nothing else.
- **Admins see through.** Space admins can view and change restrictions on any content in their space; site admins across the site.

Notion's walk-up-the-parent rule and Box's waterfall folders (in [Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#shared-drives-and-who-owns-the-file)) are the same principle with different exceptions. The generic modeling is in [Authorization](/docs/security/authorization#choosing-a-model); the permissions chapter of this book covers role ladders and link sharing in depth. What docs add is that every derived surface must apply the same check: search results, the page tree, backlinks, page previews in chat unfurls, embedded excerpts and transclusions (a Confluence excerpt include or a Loop component shown elsewhere), notifications, exports and AI answers. An excerpt macro that renders a restricted page's text into a public page is a data leak with a nice UI.

My rule: **compute effective access from the tree at read time, cache it with the tree version, and evaluate every embed against the viewer, not the author.** When a page moves, its effective access changes, so a move is a permissions event and gets audited like one.

## Templates and Databases in Docs

Templates are where a wiki's quality is decided, because most pages are created from one. Every product ships a template gallery, and most let an organization add its own. Two design points matter more than the template editor:

- **A template is versioned content, and a page records which version it came from.** When the incident-review template gains a "customer impact" section, someone will ask which reviews predate it.
- **Template fields become properties, not text.** An owner, a review date, a status and a classification typed into a heading are invisible to queries; the same values as page properties (Notion database properties, Confluence page properties, SharePoint columns) drive the staleness reports below.

Databases inside docs blur the line with no-code tools. A Notion database is a collection whose rows are pages with typed properties; since API version 2025-09-03 a database is a container of one or more **data sources**, each with its own schema, and queries, page creation and webhooks address the data source rather than the database. Wiki verification and ownership in Notion are implemented as database properties. I treat these as the same `items` with typed fields, extended in [No-Code Databases & Internal Tools](/books/workplace-and-collaboration/no-code-databases-and-internal-tools#how-to-build-it), so that a page is a page whether it sits in a tree or in a table.

## Versions and Restore

Every product keeps page history, and they differ on how long, who can see it, and what restore means:

- **Notion** keeps page history 7 days on Free, 30 on Plus, 90 on Business and any number of days on Enterprise; trash keeps pages 30 days, then they remain recoverable for 30 more days before becoming inaccessible, and Enterprise owners can change these settings. Restoring a database restores its rows and properties but not the rows' own content, which each page restores from its own history.
- **Google Docs** groups edits into versions automatically and lets editors name up to 40 versions per document (15 for spreadsheets); naming a version prevents it being merged into its neighbors. Browsing history needs edit permission.
- **Confluence** keeps the full page history; Atlassian's page history documentation (written for Data Center) says "all page history is retained" and restoring an older version creates a copy of it as the new current version, while a deleted version is gone for good. Rule-based version deletion is documented for Data Center; I didn't find an equivalent Cloud page. <!-- source-gap: confluence-cloud-version-retention | missing | whether Confluence Cloud can prune page versions by rule | closes with: an Atlassian Cloud help page on page version retention | checked: 2026-10-29 -->

Three rules for a version store in a workplace product:

- **Restore is a forward edit.** It writes a new version whose content equals an old one, attributed to the person who restored it. Nothing in history is overwritten, which is what makes history usable as evidence ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Version retention is the customer's policy, bounded by holds.** The plan sets a default window; an admin's retention policy can lengthen or shorten it; a legal hold freezes it. Microsoft's SharePoint versioning is the clearest public statement of that precedence: items under a retention policy or eDiscovery hold ignore library version limits until the hold is released ([Files, Sync & Storage](/books/workplace-and-collaboration/files-and-sync#versions-deletes-and-ransomware)). Retention policies and holds as a system are the subject of the book's retention and legal hold chapter.
- **Snapshot the rendered result, not just the operations.** A block tree's history is a stream of operations; reconstructing a page as of a date by replaying them is slow and breaks when the schema evolves. Periodic full snapshots plus the operations between them make "show me this page on March 3" a bounded read.

## Publishing to the Web

Docs products let content leave the organization by a link anyone can open, a published site, or an embed. Each is a decision the customer's admin should be able to switch off before any member can make it.

- **Notion** publishes any page and its subpages as a Notion Site on a notion.site address, updating as the page changes; search engine indexing is a separate "Discoverable on the web" switch, and Notion notes indexing can take up to four weeks. Unpublishing doesn't guarantee privacy if the page's general access is still "anyone on the web with link." Enterprise owners can turn on "Disable publishing sites, forms, and public links," which takes down live sites.
- **Google Docs** "Publish to the web" makes a read-only copy visible to anyone, or only to the organization or a group if the account's settings limit it, and republishes automatically when the source changes unless that's unchecked. Google notes that published charts reveal their underlying data. Administrators can turn publishing off, and for shared drives it depends on the drive's setting for sharing with non-members.

My defaults: publishing is off for new workspaces on business plans until an admin enables it; a published page shows a persistent banner to its editors; every publish, unpublish and change of general access is an audit event with the actor and the URL; and the published copy is a separate artifact with its own access log, so "who outside saw this" has an answer.

## Staleness and Ownership

Wikis rot. The author moves teams, the system changes, and the page keeps ranking in search because it's old and well linked. Vendors converged on three mechanisms, and they work only together:

- **An owner who is not the creator.** Confluence separates the two: the creator never changes; the owner is "the point person" and can be transferred by the owner or by space and product admins, but the new owner must have edit access, and the previous owner keeps edit access without being able to reclaim ownership. Notion makes the page creator the default owner and lets a wiki's owner property be limited to one person.
- **Verification that expires.** Notion verified pages show a check mark in search and mentions; verification can last until a date or indefinitely, a verified page must have an owner, and on expiry the owner is notified in Notion and by email to re-verify. Verification outside wikis needs a Business or Enterprise plan. Guru, in [Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge#verification-and-expiry), builds a product around the same idea.
- **Archive instead of delete.** Confluence archiving removes a page from page trees, search, the activity feed, macros and the home page while keeping its permissions and keeping links working; archived pages can't be edited, moved, copied or commented on; anyone can archive a single page and Premium and Enterprise admins can bulk archive, delete or change owners from a content manager that filters pages with no views, comments or updates over a chosen period, including pages "without active owners."

The ownership problem is mostly an offboarding problem. When a member is deactivated (the provisioning chapter covers the mechanics), every page they own needs a new owner or an explicit "unowned" state that shows in admin reports; silently leaving a deactivated account as owner is how a wiki ends up with thousands of pages nobody is responsible for. My rule: **ownership is a required field, reassigned in the same transaction as deactivation, to the person's manager or the space owner by policy, with the reassignment in the audit log.**

## How to Build It

This chapter adds the `pages` kind table and the page tree on top of the core model's `containers`, `items`, `item_versions` and `grants`. Blocks are stored per page because pages are the unit of permission, versioning and export; a block-level store (Notion's) is a valid alternative when blocks must be shared across pages, at the price of the parent-pointer walk on every check.

```sql
-- containers.kind gains 'space' (wikis); items.kind gains 'page'.

CREATE TABLE pages (                       -- kind table for items where kind = 'page'
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  container_id     UUID NOT NULL REFERENCES containers (id),
  parent_item_id   UUID REFERENCES pages (item_id),   -- null at the top of the space
  position         TEXT NOT NULL,          -- fractional index among siblings
  title            TEXT NOT NULL,
  mode             TEXT NOT NULL DEFAULT 'page'
                     CHECK (mode IN ('page', 'live')),  -- publish step or not
  published_version_id UUID REFERENCES item_versions (id),
  draft_version_id UUID REFERENCES item_versions (id),
  template_id      UUID REFERENCES page_templates (id),
  template_version INT,
  owner_member_id  UUID REFERENCES members (id),     -- null only while 'unowned' is flagged
  status           TEXT NOT NULL DEFAULT 'current'
                     CHECK (status IN ('current', 'archived', 'trashed')),
  archived_at      TIMESTAMPTZ,
  trashed_at       TIMESTAMPTZ,
  purge_after      TIMESTAMPTZ,            -- trash window from the plan or admin policy
  tree_version     BIGINT NOT NULL DEFAULT 0  -- bumps on move; keys the access cache
);

CREATE INDEX pages_tree ON pages (container_id, parent_item_id, position);

CREATE TABLE page_blocks (                 -- current content; history lives in item_versions
  page_item_id     UUID NOT NULL REFERENCES pages (item_id),
  block_id         UUID NOT NULL,
  parent_block_id  UUID,                   -- null for top-level blocks
  position         TEXT NOT NULL,
  type             TEXT NOT NULL,          -- paragraph, heading, toggle, table, embed, ...
  props            JSONB NOT NULL DEFAULT '{}',
  embed_item_id    UUID REFERENCES items (id),  -- transclusion or link preview target
  PRIMARY KEY (page_item_id, block_id)
);

CREATE TABLE page_templates (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  container_id     UUID REFERENCES containers (id),  -- null for workspace-wide templates
  name             TEXT NOT NULL,
  version          INT NOT NULL,
  body             JSONB NOT NULL,         -- blocks plus property defaults
  created_by       UUID NOT NULL REFERENCES members (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, version)
);

CREATE TABLE page_publications (           -- a page published outside the org
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  page_item_id     UUID NOT NULL REFERENCES pages (item_id),
  include_subpages BOOLEAN NOT NULL DEFAULT TRUE,
  public_url       TEXT NOT NULL UNIQUE,
  indexable        BOOLEAN NOT NULL DEFAULT FALSE,   -- search engines allowed
  auto_republish   BOOLEAN NOT NULL DEFAULT TRUE,
  published_version_id UUID REFERENCES item_versions (id),
  published_by     UUID NOT NULL REFERENCES members (id),
  published_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unpublished_at   TIMESTAMPTZ,
  unpublished_reason TEXT CHECK (unpublished_reason IN ('member', 'admin_policy',
                       'page_restricted', 'page_trashed'))
);
```

`item_versions` (core) holds each version's full snapshot plus the operation range since the last snapshot; a `kind` of `autosave`, `named` or `restore` distinguishes them, and a restore row records the version it copied. Ownership and verification columns live in `pages` here and are extended for expiry in [Intranets & Knowledge Bases](/books/workplace-and-collaboration/intranets-and-knowledge#how-to-build-it).

Effective access is a function, not a column:

```sql
-- View access walks up the tree: the container's grants, then each ancestor's
-- view restrictions, all of which must allow the viewer. Edit restrictions apply
-- only on the page itself. Cache the result keyed by (page, tree_version, member).
WITH RECURSIVE ancestors AS (
  SELECT item_id, parent_item_id, 0 AS depth FROM pages WHERE item_id = $1
  UNION ALL
  SELECT p.item_id, p.parent_item_id, a.depth + 1
  FROM pages p JOIN ancestors a ON p.item_id = a.parent_item_id
)
SELECT NOT EXISTS (
  SELECT 1 FROM ancestors a
  WHERE EXISTS (SELECT 1 FROM grants g            -- a view restriction exists here
                WHERE g.resource_type = 'page' AND g.resource_id = a.item_id
                  AND g.role = 'view_restriction')
    AND NOT EXISTS (SELECT 1 FROM grants g        -- and the viewer isn't in it
                    WHERE g.resource_type = 'page' AND g.resource_id = a.item_id
                      AND g.role = 'view_restriction'
                      AND g.principal_id = ANY ($2))   -- member, groups, workspace
) AS can_view;
```

The container-level check comes first and is cheaper; the recursive walk runs only for pages that sit under a restricted ancestor, which a `has_restricted_ancestor` flag maintained on move can short-circuit.

## Auditing

Docs are records the customer may have to produce, so the audit trail (core `audit_events`) needs, at minimum:

- **Content lifecycle:** create, publish, convert between page and live doc, move (with old and new parent and the effective-access change), archive, restore from archive, trash, purge, restore a version (with the source version).
- **Access:** restriction added or removed, grant changed, general access changed, share link created, publish and unpublish with the public URL, embed of restricted content into another page.
- **Ownership:** owner changed (by whom, from whom, why: transfer, offboarding, bulk admin action), verification set, renewed and expired.
- **Admin policy:** publishing allowed or disabled, live docs enabled per space, retention window changed, template published.

Page views are personal data about employees and belong to a separate, shorter-lived analytics store with its own access controls; the book's monitoring chapter covers what admins may see. [Audit Trails](/docs/architecture/audit-trails#what-a-record-holds) has the record format.

## What This Means for the System You Build

- Pick the content model on purpose: block trees for flexible, transformable content; structured documents for a closed schema that's easy to render, export and version whole.
- Keep a closed, versioned schema for block and inline types, so apps, exports and migrations work against a list.
- Inherit view restrictions down the tree, never let a page widen its container's access, and apply the viewer's check to every derived surface: search, previews, embeds, notifications, exports and AI.
- Treat a move as a permissions event: recompute, cache by tree version, audit.
- Make restore a forward edit and let retention policies and holds override plan-level version windows.
- Separate pages that publish from live docs that don't; readers of a runbook should see the reviewed version.
- Ship publishing off by default for business plans, with an admin switch that takes existing public pages down.
- Require an owner, reassign on offboarding in the same transaction, expire verification, and archive rather than delete.

## References

**Vendor documentation**

- [Notion: Duplicate, delete and restore content](https://www.notion.com/help/duplicate-delete-and-restore-content), page history by plan (7, 30, 90 days, unlimited), 30-day trash plus 30 days recoverable, database restore behavior
- [Notion: Wikis and verified pages](https://www.notion.com/help/wikis-and-verified-pages), wiki owners, verification until a date or indefinitely, expiry notifications, plan requirements
- [Notion: Public pages and web publishing](https://www.notion.com/help/public-pages-and-web-publishing), Notion Sites, indexing up to four weeks, unpublishing caveat, Enterprise switch to disable publishing
- [Notion Developers: Request limits](https://developers.notion.com/reference/request-limits), 2,000-character rich text, 100-element arrays, 1,000 blocks and 500 KB payloads, 180 and 600 requests a minute
- [Notion Developers: Upgrade guide for 2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03), databases as containers of data sources
- [Atlassian: Create and collaborate in real time with live docs](https://support.atlassian.com/confluence-cloud/docs/create-and-collaborate-in-real-time-with-live-docs/), live docs without publishing, 100 viewers and 40 editors, per-space admin switch, conversion
- [Atlassian: Add or remove page restrictions](https://confluence.atlassian.com/confcloud/page-restrictions-724764891.html), inherited view restrictions, non-inherited edit restrictions, pages can't exceed container access, admin visibility
- [Atlassian: Transfer ownership of your content item](https://support.atlassian.com/confluence-cloud/docs/transfer-ownership-of-your-page-to-another-person/), creator versus owner, who can transfer, edit access requirement
- [Atlassian: Document structure (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/), the `doc` root, block and inline nodes, marks and attrs
- [Atlassian: Page history and page comparison views](https://confluence.atlassian.com/doc/page-history-and-page-comparison-views-139379.html), restore as a copy of an old version, retained history and permanent version deletion (Data Center documentation)
- [Atlassian: Set retention rules to delete unwanted data](https://confluence.atlassian.com/doc/set-retention-rules-to-delete-unwanted-data-1108681072.html), version and trash retention rules documented for Data Center
- [Google: Files you can store in Google Drive](https://support.google.com/drive/answer/37603?hl=en), 1.02 million characters per Google Doc
- [Google: Find what's changed in a file](https://support.google.com/docs/answer/190843?hl=en), version history, up to 40 named versions per document and 15 per spreadsheet
- [Google: Make Google Docs, Sheets, Slides and Forms public](https://support.google.com/docs/answer/183965?hl=en), publish to the web, automatic republish, admin and shared drive limits, published chart data
- [Google Workspace Developers: Structure of a Google Docs document](https://developers.google.com/workspace/docs/api/concepts/structure), tabs, structural elements, text runs, UTF-16 indexes and segments
- [Microsoft Learn: Overview of Loop storage](https://learn.microsoft.com/en-us/microsoft-365/loop/loop-storage), storage location by creation path, lifetime owners, SharePoint quota, 25 TB container limit
- [Microsoft Learn: Manage Loop in your organization](https://learn.microsoft.com/en-us/microsoft-365/loop/loop-admin-configuration), `.loop` files, Cloud Policy versus SharePoint PowerShell controls, controls that don't restrict existing files
- [Slack: Guide to setup for Quip document conversion](https://slack.com/help/articles/52928008747667), Quip to canvas conversion on paid teams, no bulk conversion, read-only after conversion
- [Salesforce Help: Quip Retirement](https://help.salesforce.com/s/articleView?id=005299603&type=1), the retirement notice (page body not machine-readable)

**Engineering write-ups**

- [Notion: The data model behind Notion's flexibility (2021)](https://www.notion.com/blog/data-model-behind-notion), block attributes, parent pointers for permissions, transactions, `/saveTransactions`, MessageStore and offline caches
- [Notion: Herding elephants, sharding Postgres at Notion (2021)](https://www.notion.com/blog/sharding-postgres-at-notion), 480 logical shards on 32 databases keyed by workspace
- [Notion: The great re-shard (2023)](https://www.notion.com/blog/the-great-re-shard), 32 to 96 databases, 15 to 5 schemas each, CPU and connection pressure

**Corporate announcements**

- [Grammarly: Grammarly to acquire Coda (December 17, 2024)](https://www.grammarly.com/blog/company/grammarly-to-acquire-coda/), the acquisition and the CEO change
- [Superhuman: Superhuman launches Superhuman Docs (July 8, 2026)](https://blog.superhuman.com/superhuman-launches-superhuman-docs/), Coda renamed Superhuman Docs; Superhuman formerly Grammarly
