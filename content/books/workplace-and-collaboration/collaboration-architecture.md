+++
title = "Building It Yourself"
description = "The services and data layout of a collaboration product: tenant sharding as Slack, Figma and Notion did it, cells, the permission service, indexes and events."
category = "Workplace & Collaboration Industry"
order = 2060
part = "Running the Platform"
tags = ["architecture", "sharding", "multi-tenancy", "cells", "permissions"]
+++

A collaboration product looks like a consumer chat or content product from the outside: messages, pages, files, comments, presence and notifications, delivered in real time to clients that stay connected all day. Inside, two things are different. Every row belongs to a customer organization that can set its own retention, residency, keys and permissions, and that will one day ask to leave with all of it. And the content is shared in ways that cut across the obvious partition: a Slack Connect channel spans two companies, an Enterprise Grid spans many workspaces, a Figma file is shared with a contractor outside the org, a Notion page is published to the web. The architecture has to keep tenants apart for isolation, residency and blast radius while letting a small, controlled fraction of content cross between them.

This chapter is about the shape of the whole system: the domains and services, how the three most-documented vendors sharded their databases and why each picked a different key, cells as the unit of failure, the permission service every other service calls, search and AI indexes per tenant, the event backbone, and the extension points. It extends the core data model from the book's first chapter (The Workplace Software Business) with placement records: which cell and shard each workspace lives on, and how it moves. The generic rules are in the playbook: [Multi-Tenancy](/docs/architecture/multi-tenancy), [Service Boundaries](/docs/architecture/service-boundaries), [Events](/docs/architecture/events) and [Realtime Connections](/docs/architecture/realtime-connections). Consumer chat's version of the same problem is [Real-Time Chat](/books/user-generated-platforms/real-time-chat), and the reason the duties differ is [Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties).

## How the Platforms Do It

| Vendor | Primary datastore and partition key, from public write-ups | Scale stated | Failure unit |
| --- | --- | --- | --- |
| **Slack** | MySQL sharded by workspace until 2017; then Vitess, with keyspaces sharded by user, team or channel (messages by channel ID) | 99% of query load on Vitess by December 2020; 2.3 million QPS at peak (about 2M reads, 300K writes), median 2 ms, p99 11 ms | Availability zones treated as drainable cells (2023) |
| **Figma** | Postgres: vertical partitioning by table group to a dozen databases by end of 2022, then horizontal sharding through a Go proxy (DBProxy) on UserID, FileID or OrgID | Database stack grew "almost 100x since 2020"; first horizontally sharded table September 2023 | Shards behind the proxy |
| **Notion** | Postgres sharded by workspace ID: 480 logical shards (schemas), on 32 physical databases in 2021, 96 in 2023 | More than 20 billion block rows at the start of 2021, more than 200 billion by 2024 | Physical shard |

The patterns:

- **Everyone starts with one database and the tenant as the implicit shard.** Slack's original layout put each workspace on one MySQL shard, with a metadata cluster mapping workspace to shard and a "kitchen sink" cluster for everything else. Notion chose workspace ID as its partition key explicitly. It's the right first key: almost every query is scoped to one tenant, and moving or deleting a tenant is moving or deleting its shard's rows.
- **The tenant key breaks when tenants get big or content crosses tenants.** Slack's write-up lists the failures: large customers outgrew the biggest hardware, Enterprise Grid and Slack Connect broke the assumption that a team's data lives on one shard, big customers created hot spots while most of the fleet idled, and one shard's outage took down every customer on it. Slack moved message data to be sharded "by the unique id of the channel."
- **Figma shards by the object, not the tenant.** Its keys are UserID, FileID and OrgID, chosen so "almost every table at Figma could be sharded using one of these keys," with related tables grouped in "colos" that share a key so joins and transactions within one key still work. A design file is the unit of collaboration, and files cross teams and orgs.
- **Logical shards decouple growth from hardware.** Notion picked 480 logical shards because "480 is divisible by a lot of numbers," so it could grow from 32 to 40 to 48 hosts evenly; in 2023 it tripled to 96 physical databases with five schemas each, with no user-visible downtime. Figma's DBProxy does the same with logical shards mapped to fewer physical ones.

## Domains and Services

The product's domains map onto the core data model, and the services follow the data's owners ([Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)):

| Domain | Owns (core tables) | Notes |
| --- | --- | --- |
| **Tenancy** | `organizations`, `workspaces`, `domains`, placement | The directory of tenants and where each one lives; every request resolves through it |
| **Identity** | `accounts`, `members`, `groups`, `group_members` | SSO, SCIM and sessions; covered in Part 2 |
| **Content** | `containers`, `items`, `item_versions` and kind tables | Messages, pages, files, work items; usually split by kind once teams grow |
| **Permissions** | `grants`, `share_links` | A service every other one calls; see below |
| **Real-time** | No durable tables; connection and subscription state | Gateways and channel servers ([Real-Time Chat: The Gateway](/books/user-generated-platforms/real-time-chat#the-gateway)) |
| **Search and AI** | Derived indexes per tenant | Rebuilt from content and grants, never the source of truth |
| **Governance** | `retention_policies`, `legal_holds`, `hold_custodians`, `audit_events` | Runs against every content store; Part 9 |
| **Commerce** | `plans`, `subscriptions`, `seat_assignments` | [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management) |
| **Platform** | `apps`, `app_installations`, `api_tokens` | The public API, events to apps, marketplace; Part 8 |

Two of these are cross-cutting in a way consumer products rarely are. Governance has to see every store, including caches, search indexes, AI embeddings and exports, because a retention policy or legal hold set by the customer's admin applies to every copy. And tenancy is on every request path: the tenant context decides the shard, the region, the encryption key, the policy set and the feature flags before any business logic runs ([Tenant Context](/docs/architecture/multi-tenancy#tenant-context)).

My default is a modular monolith for content, identity, permissions and commerce, with real-time gateways, search, media processing and the public API as separate services from the start, because they scale on different axes (connections, index size, CPU per file, external request rate) and fail differently.

## Choosing the Shard Key

The key is chosen by asking what the unit of sharing is, because the shard key should keep shared things together.

- **Tenant (workspace or organization).** Best when content rarely crosses tenants and tenants are small relative to a shard. It makes residency, tenant export, tenant deletion and per-tenant keys simple: the tenant is a set of rows on one shard. It fails for very large tenants (a single enterprise outgrowing a shard) and for cross-tenant content. Notion's workspace key works because a workspace is the unit of sharing for blocks.
- **Container (channel, file, project).** Best when the container is the unit of collaboration and can be shared across tenants. Slack's channel key lets a shared channel live in one place regardless of how many organizations are in it. The cost: a tenant's data is spread across shards, so tenant-wide operations (export, deletion, retention sweeps, residency moves) become scatter jobs, and "which channels is this user in" needs its own index sharded by user.
- **Object plus owner keys (Figma's colos).** Several keys, each for a group of tables that are queried together. It fits a product whose objects move between teams and orgs. The cost is in the proxy: it has to route by whichever key a query carries, and queries without one become scatter-gather across all shards.

The constraints are the same whichever key: no atomic cross-shard transactions, no foreign keys or globally unique indexes across shards (Figma lists all three), and scatter queries that are cheap while a cache hides them. Slack's February 2022 incident ([What the Incident Reviews Teach](/books/workplace-and-collaboration/reliability-and-outages#what-the-incident-reviews-teach)) was a query that found a group DM's members by asking every shard of a user-sharded keyspace; the fix moved it to a table sharded by channel. My rule: every query on the hot path carries the shard key of the table it reads, and any scatter query is listed, measured and owned.

My default for a new product is the tenant key with logical shards, plus a small set of global tables (the tenant directory, accounts, domains) and an explicit model for shared containers: a shared channel or externally shared file lives in its host tenant's shard, and other tenants hold a reference. It keeps residency and deletion simple until a single tenant or a shared container is too big, which is the point to add a container-keyed keyspace for that table, as Slack did for messages.

## Logical Shards and Moving Tenants

Physical databases will be added, split and replaced many times; tenants will move between regions for residency and between shards for load. The two write-ups agree on how:

- **Many more logical shards than hosts.** Notion's 480 schemas on 32, then 96 hosts; Figma's logical shards on fewer physical ones. A move is a remap, not a re-partition.
- **Copy, then catch up, then verify, then cut over.** Notion's 2021 migration double-wrote through an audit log and a catch-up script, backfilled in about three days on a 96-CPU instance with version checks so newer data wasn't overwritten, verified with sampled comparisons and dark reads, and switched over with a reverse audit log as the rollback plan. Its 2023 re-shard used Postgres logical replication and cut sync time from 3 days to 12 hours by building indexes after the copy; each cutover paused traffic, confirmed replication had caught up, updated the PgBouncer mapping and reversed replication for rollback. Figma's first failover caused "ten seconds of partial availability" on primaries.
- **Roll out logically before physically.** Figma first sharded with Postgres views on the existing database, which proved routing and query support at low risk, and moved data afterwards.

A tenant move is also how residency changes happen (Data Residency & Sovereignty) and how merger consolidations are executed ([Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching)). The same copy-verify-cutover machinery serves all three, so it's worth building once and running often.

## Cells

A cell is a slice of the system that fails alone: its own app servers, caches, queues and databases, serving a fixed set of tenants. In a collaboration product the natural cell assignment is by tenant, and an outage in one cell is an outage for those customers only.

Slack's 2023 write-up takes a different cut: each availability zone is a cell, and "cells may be drained." After a June 30, 2021 gray failure in one zone that its multi-zone design didn't contain, Slack built a drain that removes traffic from a zone within five minutes (sized to fit its 99.99% target), without user-visible errors, incrementally down to 1%, and without depending on anything in the drained zone. Services are "siloed": they take traffic only from their own zone and call only servers in it, so redirecting user requests at the Envoy edge quiets everything behind it. Weights propagate "on the order of seconds."

The two cuts compose. Zone cells contain infrastructure failures; tenant cells contain bad deploys, poison data and noisy tenants. My default is tenant cells within a region, each spread over zones, with deploys rolled cell by cell, plus the ability to drain a zone. [Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding) covers the general design, and [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages#calendars-cells-and-morning-peaks) the operational rules.

Shared containers again need a decision: a Slack Connect channel between tenants in two cells lives in one of them. Members from the other cell read it through the host's cell, so a host-cell outage affects the guest organization's view of that channel. That's acceptable if the product says so; it's a surprise if it doesn't.

## The Real-Time Tier

Workplace clients hold a connection open all day, and every message, edit, reaction and presence change fans out to the members of a container. Slack's public description (April 2023) is the reference: Channel Servers hold channel history in memory, each responsible for a subset of channels via consistent hashing on channel ID ("about 16 million channels are served per host" at peak, with a replacement ready "in under 20 seconds"); Gateway Servers, deployed across regions, hold each user's WebSocket and channel subscriptions; Admin Servers sit between the web app and the Channel Servers; Presence Servers track who is online. A message goes from the client to the web app API, to an Admin Server, to the Channel Server for that channel, to every Gateway Server subscribed to the channel, to the clients. Slack says it delivers messages "across the world in 500ms" to "tens of millions of connected clients."

The design point that matters for a workplace product: the durable write happens first (the web app persists the message), then fan-out. Real-time is a notification path; clients that miss events catch up from the API on reconnect. [Fan-Out](/docs/architecture/realtime-connections#fan-out) and [Ordering and Catch-Up](/docs/architecture/realtime-connections#ordering-and-catch-up) cover the mechanics, and Chat at Scale covers Slack's and Teams' chat architecture in depth.

## The Permission Service

Every read in a collaboration product is a permission check: can this member see this message, open this page, edit this file, find this result in search, have this document summarized by AI. The checks are numerous, nested (container inheritance, group membership, guest restrictions, link sharing) and dangerous: Figma's write-up notes that "a bug in these functions could leak access to every single file in Figma," and that permission checks drove about 20% of database load.

Figma's March 2024 rewrite is the clearest public design. Permission logic moved from Ruby `has_access?` methods into declarative, JSON-serializable policies (effect allow or deny, permissions, conditions; deny overrides allow), authored in TypeScript and evaluated by the same evaluator implemented in TypeScript, Ruby and Go against shared tests, so the backend and the real-time layer can't drift. Each policy's data dependencies are derived from its expressions, data loads lazily with a third "indeterminate" result, and evaluation stops when the answer is definitive; that "more than halved" evaluation time. Google's Zanzibar and its open-source descendants take the relationship-graph approach instead; Permissions & Sharing compares them.

For the architecture, three rules:

- **One decision point.** Every service, including search, AI retrieval, exports, notifications and the real-time tier, asks the same service or evaluates the same policies. A second implementation is a second chance to leak.
- **Check at read time, and again at fan-out.** A message pushed to a gateway is checked when it's fanned out to each subscriber, because a grant may have been revoked since the subscription began.
- **Derived indexes carry permissions, and lag is a bug budget.** A search or AI index that stores ACLs alongside content must be updated when grants change, and the lag between a revocation and the index honoring it is a measured number with a target (Enterprise Search).

The general model is in [Authorization](/docs/security/authorization).

## Search and AI Indexes per Tenant

Search and AI retrieval are derived stores built from content, grants and governance state. The workplace constraints:

- **Per-tenant isolation in the index,** by separate index or by a tenant filter that is enforced, not optional. A cross-tenant search result is a data breach.
- **Residency and keys follow the tenant.** An index for an EU tenant is built and stored in the EU; a tenant with customer-managed keys expects its index encrypted with them or not built.
- **Governance reaches the index.** A deleted message, a retention purge or a revoked share must leave the index on a schedule the vendor can state, and a legal hold must keep items findable for eDiscovery even after users delete them.
- **Build from change data, not from the API.** Notion's data lake (July 2024) streams Postgres changes through Debezium CDC and Kafka into Apache Hudi tables on S3, transformed with Spark, to "unlock AI, Search, and other product use cases that require denormalized data"; it notes that denormalized block permission data was especially costly to build before. Ingestion that took more than a day dropped to minutes for small tables and a couple of hours for large ones, and moving large datasets off Postgres saved "over a million dollars" in 2022.

## Events, Webhooks and Extensibility

Every state change produces an event through a [transactional outbox](/docs/architecture/events#the-transactional-outbox), and four consumers depend on it: the real-time tier, search and AI indexing, governance (audit, retention, DLP) and the platform (webhooks and app events to customer-installed apps). The workplace twist is that the customer's admin controls the last one: apps are installed per workspace with scopes the admin approved, and events to an app are filtered by those scopes and by the permissions of the installing user or bot.

Extensibility in workplace products takes four forms, each covered in Part 8: APIs and events (APIs, Events & Rate Limits), apps with UI surfaces and a marketplace (Apps & Marketplaces), customer-built automation (Integration Platforms & Workflow Builders) and AI agents (AI Agents, Connectors & MCP). Architecturally they share a requirement: an app is a principal with its own identity, grants and audit trail, not a user's session in disguise.

## How to Build It

This chapter adds the placement layer to the core data model: cells, shards and the record of where each workspace lives and how it moves. The tenant directory is global and small; everything else lives in a cell.

```sql
CREATE TABLE cells (
  id            TEXT PRIMARY KEY,           -- 'us-east-1-c03'
  region        TEXT NOT NULL,              -- residency region served
  zones         TEXT[] NOT NULL,            -- spread across zones
  status        TEXT NOT NULL CHECK (status IN ('active', 'draining', 'closed')),
  accepts_new   BOOLEAN NOT NULL DEFAULT TRUE,
  deploy_wave   SMALLINT NOT NULL           -- rollout order within the region
);

CREATE TABLE shards (                       -- logical shards, many per database
  id            INT PRIMARY KEY,            -- 0..479
  keyspace      TEXT NOT NULL,              -- 'content', 'messages_by_channel'
  cell_id       TEXT NOT NULL REFERENCES cells (id),
  database_host TEXT NOT NULL,              -- physical placement, remapped on moves
  UNIQUE (keyspace, id)
);

CREATE TABLE workspace_placements (         -- one current row per workspace and keyspace
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  keyspace      TEXT NOT NULL,
  shard_id      INT NOT NULL,
  cell_id       TEXT NOT NULL REFERENCES cells (id),
  region        TEXT NOT NULL,              -- must equal workspaces.region
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, keyspace),
  FOREIGN KEY (keyspace, shard_id) REFERENCES shards (keyspace, id)
);

CREATE TABLE placement_moves (              -- residency changes, rebalancing, mergers
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  keyspace         TEXT NOT NULL,
  from_shard       INT NOT NULL,
  to_shard         INT NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('rebalance', 'residency',
                     'cell_evacuation', 'merger', 'large_tenant')),
  phase            TEXT NOT NULL CHECK (phase IN ('planned', 'copying', 'catching_up',
                     'verifying', 'cutover', 'done', 'rolled_back')),
  copy_lag_seconds INT,                     -- replication lag, gates the cutover
  verify_report    JSONB,                   -- sampled row and version comparisons
  write_pause      INTERVAL,                -- measured pause at cutover
  requested_by     TEXT NOT NULL,           -- typed actor; residency moves cite the request
  started_at       TIMESTAMPTZ,
  finished_at      TIMESTAMPTZ
);

CREATE TABLE shared_container_hosts (       -- a container visible to more than one org
  container_id      UUID PRIMARY KEY REFERENCES containers (id),
  host_workspace_id UUID NOT NULL REFERENCES workspaces (id),  -- where it is stored
  participant_orgs  UUID[] NOT NULL         -- organizations with members in it
);

CREATE TABLE outbox_events (                -- written in the same transaction as the change
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL,
  aggregate     TEXT NOT NULL,              -- 'item', 'container', 'grant', 'member'
  aggregate_id  UUID NOT NULL,
  type          TEXT NOT NULL,              -- 'item.created', 'grant.revoked'
  payload       JSONB NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ
);
```

Routing a request is two lookups, both cached at the edge of the cell:

```sql
-- $1: workspace id from the session or the URL, $2: keyspace
SELECT p.cell_id, s.database_host, p.shard_id, w.region
FROM workspace_placements p
JOIN shards s ON s.keyspace = p.keyspace AND s.id = p.shard_id
JOIN workspaces w ON w.id = p.workspace_id
WHERE p.workspace_id = $1 AND p.keyspace = $2;
```

Notes on the sketch:

- **`workspace_id` on every row, in every shard.** Even container-keyed tables carry it, so tenant export, deletion, retention and residency moves can find a tenant's rows without a scatter of unknown size, and row-level security can enforce isolation ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)).
- **Placement is versioned by moves.** A residency request from the customer's admin creates a `placement_moves` row with `reason = 'residency'`; the cutover only runs when `copy_lag_seconds` is near zero and `verify_report` is clean, and the old copy is purged after the rollback window, with the purge recorded in `audit_events`.
- **The region check is a constraint.** A placement whose cell serves a different region than `workspaces.region` can't be committed, so a rebalance can't silently move a tenant out of its residency region.
- **Shared containers have one host.** Guests' organizations read through the host; the host's retention applies to the stored copy, and each participant org's retention and holds apply to the copies it exports or caches, which Guests & Cross-Org Collaboration covers.
- **Events carry the workspace.** Consumers route by it: indexers build the right tenant's index in the right region, and the platform filters webhooks by installation.
- **Global tables stay small.** `organizations`, `domains`, `accounts` and the placement directory are replicated globally; they hold no content, so residency commitments can exclude them explicitly.

## What This Means for the System You Build

- **Pick the shard key by the unit of sharing,** start with the tenant, and add a container-keyed keyspace for the tables where tenants or shared containers outgrow it.
- **Use many logical shards per host** so growth is a remap, and build copy-verify-cutover once for rebalancing, residency and mergers.
- **Put `workspace_id` on every row** regardless of the shard key.
- **Make the hot path carry its shard key,** and list, measure and own every scatter query.
- **Combine tenant cells with drainable zones,** and roll out cell by cell.
- **Run one permission decision point** for every reader, including search, AI, exports and fan-out.
- **Treat search and AI indexes as derived, tenant-scoped, residency-bound stores** that governance reaches.
- **Publish every change through an outbox** to real-time, indexing, governance and apps.
- **Model shared containers explicitly** with a host tenant and participant organizations.

## References

**Engineering write-ups**

- [Slack Engineering: Scaling datastores at Slack with Vitess (December 1, 2020)](https://slack.engineering/scaling-datastores-at-slack-with-vitess/), the workspace-sharded MySQL layout, why it broke, the Vitess migration from 2017, 99% of load and 2.3 million QPS, sharding messages by channel
- [Slack Engineering: Slack's migration to a cellular architecture (August 22, 2023)](https://slack.engineering/slacks-migration-to-a-cellular-architecture/), the 2021 gray failure, zones as drainable cells, the five-minute drain goal, siloing and Envoy weights
- [Slack Engineering: Real-time messaging (April 11, 2023)](https://slack.engineering/real-time-messaging/), Channel, Gateway, Admin and Presence Servers, consistent hashing on channel ID, channels per host, 500 ms delivery
- [Slack Engineering: Slack's incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/), the scatter query on a user-sharded keyspace and the move to a channel-sharded table
- [Figma: How Figma's databases team lived to tell the scale (March 14, 2024)](https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale/), vertical partitioning, colos, logical and physical sharding, DBProxy, shard keys and cross-shard constraints
- [Figma: How we rolled out our own permissions DSL at Figma (March 13, 2024)](https://www.figma.com/blog/how-we-rolled-out-our-own-permissions-dsl-at-figma/), the risk and database cost of permission checks, JSON policies, cross-language evaluators and lazy loading
- [Notion: Herding elephants: lessons learned from sharding Postgres at Notion (October 6, 2021)](https://www.notion.com/blog/sharding-postgres-at-notion), workspace ID as partition key, 480 logical shards on 32 databases and the migration steps
- [Notion: The Great Re-shard (July 17, 2023)](https://www.notion.com/blog/the-great-re-shard), 32 to 96 databases, logical replication, PgBouncer and cutover without perceived downtime
- [Notion: Building and scaling Notion's data lake (July 1, 2024)](https://www.notion.com/blog/building-and-scaling-notions-data-lake), block growth, the CDC pipeline, permission data for AI and search, and savings
