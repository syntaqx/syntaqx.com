+++
title = "Permissions & Sharing"
description = "Role ladders, container inheritance, restrictions and link sharing; Zanzibar, OpenFGA and SpiceDB; Figma's policy DSL; permission checks in search and AI."
category = "Workplace & Collaboration Industry"
order = 2010
part = "Tenancy and Identity"
tags = ["workplace", "authorization", "permissions", "sharing", "rebac"]
+++

In a collaboration product, permissions are most of the product. Every page view, search result, notification, preview, export, API call and AI answer is a question of the form "can this person see this thing right now," asked billions of times a day, against a graph that changes every time someone shares a doc, joins a channel, moves a page or leaves a group. Get it slightly wrong in the permissive direction and a salary spreadsheet shows up in a search result; get it wrong in the restrictive direction and people email attachments to each other instead.

What makes it hard is that the model is chosen by users, not by the vendor's engineers. People create the containers, nest them, share them with groups, restrict a page inside a shared space, send "anyone with the link" URLs to customers, and move things between places with different rules. The vendor's job is to make that model predictable (a person can tell who sees what), enforceable everywhere at once (search, AI and notifications obey the same answer as the page view), and fast. This chapter covers the role ladders, how inheritance works in different products, link sharing, the relationship-based systems descended from Google's Zanzibar, Figma's public account of rewriting its permission logic, and what permission checks mean for search and AI. The generic engineering (choosing a model, where checks belong, caching decisions) is the playbook's [Authorization](/docs/security/authorization).

## How the Platforms Do It

As of October 2026, from each vendor's documentation and engineering write-ups:

| Product | Item roles | Containers and inheritance | Link sharing | Engine, where public |
| --- | --- | --- | --- | --- |
| **Google Drive** | Viewer, Commenter, Editor, plus one Owner; Editors can change permissions and share by default | Shared folder access flows to its files; shared drives are owned by the organization | General access: Restricted, your organization, or anyone with the link without signing in; admins can restrict | Zanzibar serves Drive, Calendar, Cloud, Maps, Photos and YouTube |
| **Notion** | Full access, Can edit, Can edit content (databases), Can create (databases, Business and Enterprise), Can comment, Can view | Subpages take the parent's permissions; the broadest access a person has applies; teamspaces set defaults | Only people invited, everyone in the workspace, or anyone on the web with the link, with optional expiry; Enterprise can disable public links | Not public |
| **Confluence** | Site, space and content-level permissions; content restrictions aren't on the Free plan | Open by default within a space; restrictions only narrow: an item can't have more access than its space or parent | Spaces or the whole site can be made public for anonymous access | Not public |
| **Figma** | Not covered here | Files, teams and organizations in a "context path" | Not covered here | A declarative allow and deny policy DSL with deny overriding allow, evaluated in TypeScript, Ruby and Go |

Three patterns:

- **Three ways to resolve conflicts.** Confluence narrows (a restriction inside a space can only remove access), Notion widens (the broadest grant wins, so a workspace-wide grant overrides a narrower one), and Figma's engine lets explicit deny beat allow. A person who moves between products has to relearn which one they're in, and a product that mixes them confuses everyone.
- **Every product has a "who can share" knob.** Drive Editors can share by default, Notion separates Full access (share) from Can edit (no share), and Confluence requires permission to manage content restrictions. Sharing is a permission, not a side effect of editing.
- **Public links are a separate audience.** Every product treats "anyone with the link" as a distinct principal with its own admin controls, because it is the one grant that crosses the tenant boundary without an identity.

## Role Ladders

Item-level roles are short and nearly identical across products: view, comment, edit, and some form of manage (share, change permissions, delete). The differences are in where the lines fall:

- **Can editors share?** Google Drive Editors can, unless the owner turns it off. Notion's Can edit can't; only Full access can share. A product that lets editors share has made every editor a potential leak path; one that doesn't creates a queue of share requests to owners.
- **Database and structure roles.** Notion's Can edit content lets someone create and edit pages and property values in a database without changing its structure, views, sorts or filters; Can create (on Business and Enterprise) lets someone add pages without seeing others'. Work trackers make the same split between editing items and editing the project's workflow and fields.
- **Owner as a role.** Drive has exactly one owner per file, who controls it and can transfer ownership; collaborators keep access to a trashed file until the owner permanently deletes it. Ownership is what offboarding has to move ([Content Ownership on the Way Out](/books/workplace-and-collaboration/provisioning-and-scim#content-ownership-on-the-way-out)).

Above the item sit container roles (space admin, channel manager, project lead, teamspace owner) and above those the administrative roles, which are a different system with different rules ([Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies)). Keeping the three layers distinct (what someone can do to an item, to a container, to the organization) is what keeps the model explainable.

## Containers and Inheritance

Content lives in containers (the core data model's `containers`: channels, spaces, projects, boards, folders), and permission flows down. The design choices:

**Narrow-only.** Confluence's rule is that "restrictions can only narrow access": a content item can't have more access than its container, whether that is the space or a parent page. Space permissions decide who can be in the space at all, restrictions remove people from parts of it, and group permissions are additive (in two groups where only one grants view, the person can view). A person who can't see a page with no restrictions on it is missing a space permission. The advantage is that a space admin can reason about the maximum exposure of anything in the space; the cost is that sharing one page with someone outside the space means adding them to the space.

**Broadest wins.** Notion's subpages inherit the parent's permissions until changed on the subpage, and Notion applies the broadest access a person has, so a workspace-wide grant overrides a narrower one. Pages can be reachable without their direct link when they're linked from a more broadly shared page, use a two-way relation to one, or are nested inside one. Moving a shared page to Private removes others' access to that page while subpage permissions stay as they were. The advantage is that sharing one page with anyone is one click; the cost is that the maximum exposure of a teamspace is only knowable by walking every page.

**Explicit deny.** Figma's DSL, modeled on AWS IAM, lets deny policies override allow policies. It handles the cases inheritance can't express ("everyone in the org can view files in this team, except files marked as deleted"), at the price of an extra rule to understand.

My default for a builder: inheritance from container to item, restrictions that narrow by default, explicit item-level grants for sharing outside the container only when the container's policy allows it, and an "effective access" view on every item that lists who can see it and why (direct grant, group, container, link). The why is what lets a person trust the model.

### Moves

Moving an item between containers is where inheritance bites. A page moved from a restricted space to an open one becomes visible to everyone in the new space if it carried no restrictions of its own; a page with explicit grants keeps them in Notion's model. The move is a permission change and should be shown as one: the product warns when a move widens access, records it as an audit event with the before and after audiences, and re-indexes the item's access in search immediately.

## Link Sharing

The anyone-with-the-link URL is the most convenient and most dangerous grant in the industry. Google Drive's general access offers Restricted (only people given access), your organization (members within the sharing levels the admin allows), and anyone with the link (anyone on the internet, without signing in), and work or school administrators may restrict the last. Notion offers only people invited, everyone at the workspace (optionally hidden from search), and anyone on the web with the link, with an optional link expiration date; commenting or editing through a public link requires a Notion login, Enterprise owners can disable public links, and publishing as a Notion Site can allow search engine indexing.

Two lessons from the field:

1. **A link is a bearer credential.** Anyone who has it has the access, and links leak through forwarded emails, browser histories, chat logs and referrer headers. Google's security update for link-shared Drive files added a resource key to the URLs of some files and folders (look for `resourcekey=` in the URL), so that an old link without the key no longer opens the item for people who hadn't already viewed it or been given direct access; Docs, Sheets and Slides files don't get a resource key. Admins can apply the update to all impacted files, remove it (not recommended), or let owners decide per file.
2. **Links need the same life cycle as grants.** Expiry dates (Notion), an admin switch for the whole tenant (Notion Enterprise, Drive's sharing settings), and an owner who can be found when the file is shared publicly. A share link created by someone who has left is still live until someone revokes it, which is why the offboarding worklist includes share links.

## Zanzibar and Relationship-Based Access Control

Google described Zanzibar, its global authorization system, at USENIX ATC in July 2019. Zanzibar stores access control lists for hundreds of Google services, including Calendar, Cloud, Drive, Maps, Photos and YouTube, and the paper reports scaling to trillions of ACLs and millions of authorization requests per second, with 95th-percentile latency under 10 milliseconds and availability above 99.999% over three years in production. Its decisions "respect causal ordering of user actions."

The model has become the reference design for collaboration products:

- **Relationships as data.** Permissions are stored as relationship tuples: a user (or a set of users, such as members of a group) has a relation (owner, editor, viewer, member, parent) to an object. A check asks whether a path exists in that graph from the object and relation to the user.
- **Rewrites instead of copies.** Rules such as "anyone who can view a folder can view the documents in it" are expressed once, in the schema, rather than by writing a tuple per document; that is what makes inheritance cheap to store and instant to change.
- **Nested groups need an index.** Deep group nesting turns one check into many serial lookups; Zanzibar's Leopard indexing system keeps an in-memory transitive closure of group membership so nested-group checks become one index call, kept current from the change stream.
- **Consistency tokens.** Zanzibar's zookies let a client bound how stale a permission answer may be: most checks can use slightly stale data for speed, and a client that has just changed an ACL can demand an answer at least as fresh as its change. This is the answer to the failure the paper calls the "new enemy" problem, where a check evaluated on data older than a recent permission removal grants access to content created after the removal.

Two open source systems implement the model:

- **OpenFGA** defines types (`document`, `repository`), relations (`viewer`, `editor`, `member`), relationship tuples of user, relation and object (optionally with a condition), and an authorization model combining type definitions, written in a DSL or JSON. Its API answers check requests (`allowed: true` or `false`), list-objects requests (every object of a type a user has a relation to) and accepts contextual tuples that apply to one request without being stored.
- **SpiceDB** is an open source (Apache-2.0) database for fine-grained authorization inspired by Zanzibar, with a schema, relationships written as data, permission checks and reverse queries ("what can this subject access?"), consistency chosen per request, and Google Cloud Spanner, CockroachDB, MySQL or PostgreSQL as the datastore.

Whether to run a Zanzibar-style service or keep authorization in the application database is the playbook's question ([Choosing a Model](/docs/security/authorization#choosing-a-model)). For a collaboration product the answer usually becomes a dedicated service once three things are true: content nests deeply, groups come from customer directories, and search and AI need list-objects answers rather than one check at a time.

## Figma's Policy DSL

Figma published the most detailed public account of a collaboration vendor replacing its permission logic, in March 2024. The starting point was a single `has_access?` method in its Ruby monolith: a long chain of conditional branches mixing database calls and boolean flags, duplicated in its LiveGraph real-time service, and feared by engineers because "a bug in these functions could leak access to every single file in Figma."

The replacement:

- **Declarative policies.** Each policy has an effect (allow or deny), a set of permissions and a resource type; conditions are boolean expressions built from triples such as `["file.deleted_at", "<>", null]` combined with and, or and not. Deny overrides allow.
- **Serializable, so portable.** Policies are written in TypeScript and serialized to JSON, contain no executable code, and are evaluated by three engines (TypeScript, Ruby and Go) that run the same test suites.
- **Data loading separated from logic.** A loader derives each policy's data dependencies statically from its expressions and loads rows along a context path of ids (file, team, org, user); lazy loading with a third "indeterminate" result lets evaluation stop as soon as the outcome is known, which the team reports roughly halved evaluation time.
- **Tooling falls out of data.** Because policies are data, Figma built a debugger that traces evaluations and a build-time linter for risky comparisons against null.

The general lessons match the playbook's [Policy as Code](/docs/security/authorization#policy-as-code): keep policy separate from data access, keep the evaluator small enough to implement more than once, and test it like a compiler.

## Permission Checks in Search, Notifications and AI

The page view is the easy case: one person, one item, one check. Everything that returns lists is harder:

- **Search.** A search engine retrieves candidates and then has to drop every one the searcher can't see. Post-filtering a top-k result set can return an empty page when most hits are restricted; pre-filtering requires the index to know each item's audience. The common design stores, per indexed item, the principals that can read it (users, groups, workspace, link), and the query filters on the searcher's principals. Keeping that audience current as grants change is ACL sync, and its latency is the window in which a removed person can still find something; Enterprise Search, in this volume's Search, Integrations and AI part, owns the details.
- **Notifications.** A mention or a digest that includes content the recipient can't open leaks its preview. Confluence doesn't notify users without access to a content item when they're @mentioned. Every notification renders under the recipient's permissions at send time.
- **AI assistants.** Retrieval-augmented answers are search plus summarization, so they inherit search's permission filter, and they amplify oversharing: content that was technically open but never found becomes an answer. The admin side (oversharing reports, restricting what the assistant may index) belongs to AI Assistants Over Company Data, in the same part.
- **Exports and APIs.** An export or an API token acts as some principal; it must not see more than that principal could in the UI, and the scopes of an app's token are a second filter on top (Apps & Marketplaces, also in that part, owns app consent).

The rule underneath all four: there is one authorization decision function, and every path calls it or a precomputed index derived from it with a known freshness. The playbook's [Where Checks Belong](/docs/security/authorization#where-checks-belong) and [Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely) cover the mechanics.

## How to Build It

The core data model's `grants` (`principal_type` and `principal_id` of member, group, workspace or link, `resource_type`, `resource_id`, `role`) and `share_links` are the tuple store. This chapter adds the container tree, restriction and grant metadata, link life cycle, an ACL revision counter for consistency, and a precomputed audience index for search.

```sql
ALTER TABLE containers
  ADD COLUMN parent_container_id UUID REFERENCES containers (id),   -- folders in folders, pages in pages
  ADD COLUMN restricted          BOOLEAN NOT NULL DEFAULT FALSE,     -- narrows inherited access
  ADD COLUMN external_sharing    TEXT NOT NULL DEFAULT 'inherit'
    CHECK (external_sharing IN ('inherit', 'blocked', 'allowed'));

ALTER TABLE items
  ADD COLUMN restricted BOOLEAN NOT NULL DEFAULT FALSE;              -- page-level restriction

ALTER TABLE grants
  ADD COLUMN workspace_id UUID NOT NULL REFERENCES workspaces (id),
  ADD COLUMN effect       TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'deny')),
  ADD COLUMN can_reshare  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN granted_by   UUID REFERENCES members (id),
  ADD COLUMN expires_at   TIMESTAMPTZ,
  ADD COLUMN acl_revision BIGINT NOT NULL,                           -- the revision that wrote it
  ADD CONSTRAINT grants_role_check CHECK (role IN ('owner', 'full_access', 'editor',
    'content_editor', 'creator', 'commenter', 'viewer'));

ALTER TABLE share_links
  ADD COLUMN audience     TEXT NOT NULL CHECK (audience IN ('organization', 'workspace', 'anyone')),
  ADD COLUMN role         TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'commenter', 'editor')),
  ADD COLUMN resource_key TEXT NOT NULL,          -- secret part of the URL; rotated to kill old links
  ADD COLUMN expires_at   TIMESTAMPTZ,
  ADD COLUMN created_by   UUID REFERENCES members (id),
  ADD COLUMN disabled_at  TIMESTAMPTZ,
  ADD COLUMN disabled_reason TEXT CHECK (disabled_reason IN ('owner', 'admin_policy', 'expired',
    'creator_offboarded'));

CREATE TABLE acl_revisions (              -- one monotonic counter per workspace: the consistency token
  workspace_id UUID PRIMARY KEY REFERENCES workspaces (id),
  revision     BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE access_index (               -- precomputed audience per item, for search and AI retrieval
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  principal_type TEXT NOT NULL CHECK (principal_type IN ('member', 'group', 'workspace', 'link')),
  principal_id   UUID NOT NULL,
  role           TEXT NOT NULL,
  acl_revision   BIGINT NOT NULL,         -- the revision this row reflects
  PRIMARY KEY (workspace_id, item_id, principal_type, principal_id)
);
```

Notes on the sketch:

- **One decision function.** `can(member, action, item)` walks item, container chain and grants (direct, group, workspace, link), applies restrictions and deny, and returns the answer with the reason. The UI's "who has access" panel, search, notifications, exports and the API all call it or read `access_index`.
- **Revisions bound staleness.** Every grant, restriction, group membership or move increments the workspace's `acl_revisions.revision` in the same transaction; responses carry the revision; a client that just changed access sends it back, and a check or search waits until its cache or index has caught up. This is the zookie idea with a single counter per workspace, which is enough while one workspace's ACL writes fit on one primary.
- **Index by audience, not by person.** `access_index` stores groups and the workspace as principals, so adding a person to a group doesn't rewrite millions of index rows; the query expands the searcher's own groups instead.
- **Links rotate.** Disabling or rotating `resource_key` invalidates every copy of an old URL; the offboarding worklist disables or reassigns links whose creator has left.
- **Moves are grants changes.** Moving an item writes a new revision, rebuilds its `access_index` rows, and records the audience before and after so a widening move can warn and be audited.
- **Events:** `grant.created`, `grant.removed`, `item.restricted`, `container.moved`, `share_link.created`, `share_link.disabled` and `acl.revision_advanced` go to the audit log, the search indexer (which processes them in revision order) and notifications for owners when access widens.

## Auditing

- **Every grant and removal,** with the actor, the principal, the role, and the effective audience before and after.
- **Public link life cycle:** created, used (with counts and coarse origin), rotated, expired and disabled.
- **Moves and restriction changes** that widen access, flagged.
- **Access to restricted content by admins or support,** logged as access ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Index freshness:** the lag between an ACL revision and its arrival in search, kept as an operational metric and alarmed.

## What This Means for the System You Build

- **Pick one conflict rule** (narrow-only is the most explainable) and use it everywhere in the product.
- **Make sharing its own permission,** separate from editing.
- **Store permissions as relationships with inheritance rules in the schema,** not as copies per item.
- **Treat "anyone with the link" as a bearer credential** with expiry, rotation, admin switches and an owner.
- **Have one decision function** and derive every index from it with a revision you can wait on.
- **Filter search, notifications, AI answers and exports by the same permissions as the page view.**
- **Show people who can see an item and why.**

## References

**Vendor documentation**

- [Google Drive Help: Share files from Google Drive](https://support.google.com/drive/answer/2494822), Viewer, Commenter and Editor roles, editors sharing by default, general access options, ownership and transfer, sharing with groups
- [Google Workspace: Manage the link-sharing security update for files](https://knowledge.workspace.google.com/admin/drive/manage-the-link-sharing-security-update-for-files), resource keys in URLs, files without keys, admin options
- [Notion: Sharing and permissions](https://www.notion.com/help/sharing-and-permissions), permission levels, subpage inheritance, broadest access applies, general access options and link expiry, public links on Enterprise, teamspace defaults
- [Atlassian: Manage permissions on the page level](https://support.atlassian.com/confluence-cloud/docs/manage-permissions-on-the-page-level/), site, space and content permissions, restrictions only narrow, additive groups, open by default, anonymous access, mentions without access

**Engineering write-ups**

- [Figma: How we rolled out our own permissions DSL at Figma (March 13, 2024)](https://www.figma.com/blog/how-we-rolled-out-our-own-permissions-dsl-at-figma/), the `has_access?` method, allow and deny policies, JSON serialization, three evaluators, the data loader and the halved evaluation time
- [Notion: Herding elephants, sharding Postgres at Notion](https://www.notion.com/blog/sharding-postgres-at-notion), every block belonging to one workspace

**Research and open source**

- [Google Research: Zanzibar, Google's consistent, global authorization system](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/), scale, latency and availability figures, client services, causal ordering
- [USENIX ATC '19: Zanzibar](https://www.usenix.org/conference/atc19/presentation/pang), the paper, authors and July 2019 publication
- [AuthZed: What is Google Zanzibar?](https://authzed.com/blog/what-is-google-zanzibar), zookies bounding staleness, relationship rewrites, the Leopard index for nested groups
- [OpenFGA: Concepts](https://openfga.dev/docs/concepts), types, relations, relationship tuples, authorization models, check, list objects, contextual tuples
- [SpiceDB on GitHub](https://github.com/authzed/spicedb), Apache-2.0, Zanzibar-inspired, schema and reverse queries, per-request consistency, supported datastores
