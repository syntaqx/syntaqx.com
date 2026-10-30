+++
title = "Chat at Scale"
description = "How workplace chat runs: Slack's channel servers, cells and Unified Grid, Teams' chat service and mailbox copies, federation, unread state and search."
category = "Workplace & Collaboration Industry"
order = 2014
part = "Chat and Messaging"
tags = ["chat", "architecture", "realtime", "multi-tenancy", "search"]
+++

Workplace chat has the same engineering core as community chat: an edge that holds sockets, a stateful tier that owns each channel, a store partitioned by channel and time, and a search index. The User-Generated Platforms volume's [Real-Time Chat](/books/user-generated-platforms/real-time-chat) covers that core in depth (gateways, member lists, message storage at trillion scale, chat search), and the playbook's [Realtime Connections](/docs/architecture/realtime-connections) covers transports, fan-out, ordering and reconnects. This chapter covers what the workplace changes.

Three things change. First, **the tenant is a first-class architectural boundary**: a workspace is a customer, isolation between customers is a contractual promise, and the hardest scaling work at Slack has been about the tenant boundary itself (channels shared between two companies, users who belong to hundreds of workspaces in one enterprise). Second, **the record is a product requirement**: the customer's compliance team must be able to search, hold and export every message, so the storage design has a second consumer whose needs differ from the chat client's. Teams' answer, a primary chat store plus a compliance copy in every participant's mailbox, is the clearest public example. Third, **availability is a contract**, with service-level commitments that shaped Slack's move to cells.

This chapter covers Slack's public architecture (channel and gateway servers, the tenant boundary from shared channels to Unified Grid, cells), Teams' storage model, Matrix's federated alternative, ordering and unread state, search, very large channels and the APIs that read chat. The conversation models it serves are [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat); the notification layer on top is [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention); assembling the same tiers for a new product is [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture#the-real-time-tier).

## How the Platforms Do It

As of October 2026, from public engineering write-ups and documentation:

| Platform | Delivery path | Primary store | Compliance record | Tenant boundary | Public detail |
| --- | --- | --- | --- | --- | --- |
| **Slack** | Client writes through the web API; admin servers route to the channel server that owns the channel; gateway servers in each region push to subscribed clients | MySQL on Vitess; messages sharded by channel | The same store; retention settings and holds act on it | Workspace, then org-wide views under Unified Grid; shared channels stored once on the originating side | Engineering posts on real-time messaging, shared channels, cells and Unified Grid |
| **Microsoft Teams** | Not publicly detailed at component level | An "Azure-powered chat service" | Copies in a hidden mailbox folder of every chat participant, and in group mailboxes for channels | Tenant (Microsoft Entra), with cross-tenant shared channels | Purview and Teams admin docs |
| **Matrix (Element and others)** | Each homeserver syncs its clients; servers push events to each other | Each homeserver keeps its own copy of every room it participates in | Each server's own copy | The homeserver; rooms span servers | Open specification |
| **Discord (contrast)** | WebSocket gateway, process per session and per server | ScyllaDB behind Rust data services | Platform-held evidence | The platform | See [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-the-platforms-do-it) |

Slack has published more about its chat architecture than any other workplace vendor, so it's the reference here. Teams is documented from the outside in, through what admins and compliance teams are told about where data lives. Matrix is the public counterpoint: a design where no single party holds the authoritative copy.

## The Write Path at Slack

Slack's 2023 post on real-time messaging describes a set of Java services:

- **Channel servers** are stateful and in memory; each holds a consistent-hashed subset of channels, around 16 million per host at peak, and a replacement is ready to serve in under 20 seconds.
- **Gateway servers** are stateful, deployed in multiple regions, and hold each connected user's information and WebSocket subscriptions.
- **Admin servers** are stateless and connect the web application backend to the channel servers.
- **Presence servers** track who is online, with users hashed across them.
- A consistent-hash ring manager maintains the channel server ring, Consul does service discovery, and Envoy load-balances and terminates TLS.

A message's path: the client sends it to the **web API** (not over its socket), the web app hands it to an admin server, which finds the owning channel server on the ring; the channel server forwards it to every gateway server worldwide that has a subscriber in that channel, and each gateway pushes it to its connected clients. Slack reports delivery worldwide in about 500 milliseconds. Booting a client is the reverse: the client fetches a token and connection info from the web app, opens a WebSocket to the nearest edge region, and the gateway server loads the user's channels, sends initial data and subscribes to the relevant channel servers.

Two details matter for workplace products in particular:

- **Persist first, then fan out.** Sending through the web API means the message is accepted and stored by the same path that enforces permissions, retention settings, DLP hooks and app events before any socket sees it. That's the playbook's rule that [the push is a hint; the store is the truth](/docs/architecture/realtime-connections#ordering-and-catch-up), and in a product where every message is a business record it's not optional.
- **Not every event is a record.** Reactions, bookmarks and joins follow the message path and are persisted; typing indicators are transient, fanned out through the channel servers without storage; presence is queried for the users visible on screen. Slack also notes load spikes at the top of each hour from reminders, scheduled messages and calendar events, a workplace-specific pattern: the working day is synchronized by the calendar.

## The Tenant Boundary

### Workspace Sharding and Its Limits

Slack's original design made the workspace "the unit of tenancy": each workspace had one database shard, one messaging server shard and one search shard, and code identified the workspace first and then routed to its shards. That's the simplest correct design for multi-tenant SaaS (the playbook's [Isolation Models](/docs/architecture/multi-tenancy#isolation-models)), and it fails in two ways that workplace products hit as they grow: the largest customers outgrow a shard, and some data stops belonging to exactly one workspace. Slack's move of message data to Vitess sharded by channel id solved the first ([Message Storage at Scale](/books/user-generated-platforms/real-time-chat#message-storage-at-scale) has the numbers). The second took two projects.

### Shared Channels: One Copy, Two Views

When Slack built channels shared between two organizations (now Slack Connect), it considered copying the channel into both workspaces' shards and rejected it, because writing to multiple databases and real-time servers "risked having inconsistent write times." Instead each shared channel keeps **one** `channels` row and one copy of its messages, reactions and pins, on the originating workspace's shard. A `shared_channels` table holds two extra rows per channel, one in each workspace, each naming the other as the target, with overrides for properties each side controls: each workspace sets its own name, topic and purpose for the channel. Privacy moved from the channel id's prefix to an explicit `is_private` flag, and the `conversations.*` API replaced separate APIs for channels and private groups so any channel-like object could be handled one way. The edge cache had to start subscribing to presence and membership events for users from the other organization.

The general rules: **store cross-tenant content once, in a host tenant; give each participating tenant an overlay of the properties it controls; route every read and write through the host.** Who owns that content, whose retention applies and whose admins can remove it are policy questions for the [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration#who-owns-shared-content) chapter; the storage answer is that there is exactly one copy and the host is recorded.

### Unified Grid: From Workspace to Organization

Enterprise Grid let large customers split an organization into many workspaces, and users ended up in several, switching between them and missing activity; some customers have thousands of workspaces. Slack's Unified Grid project (rolled out from fall 2023 to March 2024, described in a July 2024 post) re-oriented the architecture around the user and the organization:

- A new boot API returns data for all of a user's workspaces and channels across the organization, and clients store it at the organization level.
- Key tables were sharded on axes other than the workspace (messages by channel), so the workspace no longer determines routing for them.
- Permission checks became shared helpers that evaluate across all of a user's workspaces: whether a user can act as an admin in a cross-workspace channel depends on whether they're an admin in *any* workspace the channel is shared with, or an org admin.
- APIs that still need workspace context may query the shard of every workspace the user belongs to; because some users belong to hundreds, Slack capped the "relevant" workspaces at 50 and let users configure the list.

The lesson for anyone designing a workplace product: **the workspace is a permission and administration boundary, not a storage boundary.** Shard by the thing that has the access pattern (channel, document, user), keep the tenant id on every row for isolation and residency, and design permission evaluation to work across sibling workspaces of one organization from the start. The book's [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) makes this explicit with `organizations` above `workspaces`; the [Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces) chapter covers the admin side.

## Cells and Draining

On June 30, 2021, a network link connecting one availability zone in Slack's US East region to the others failed intermittently; it was removed, came back, failed again and was permanently removed hours later. Only one zone was affected, yet users saw errors, because components disagreed about which backends were healthy (a gray failure). Slack's response, described in an August 2023 post, was to treat each availability zone as a **cell** and build a manual drain:

- **Goals:** remove as much traffic as possible from a zone within 5 minutes, without user-visible errors, in increments as small as 1%, without depending on anything inside the zone being drained. The 5 minutes is a design goal set against a 99.99% availability commitment, which allows less than an hour of unavailability a year.
- **Siloing:** a siloed service receives traffic only from its own zone and sends upstream traffic only within it, so each service becomes one virtual service per zone, and draining means steering user requests away at the front end and letting the zone go quiet.
- **Mechanism:** edge load balancers moved from HAProxy to Envoy, configured by an in-house xDS control plane; a drain sets a zone's weight in a weighted cluster to zero, in-flight requests finish, and weight changes propagate in seconds.
- **Scope:** moving the most critical user-facing services to cells took about a year and a half.

Workplace vendors sign availability commitments with service credits (the [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages) chapter), so a design that limits a partial failure to a fraction of customers, and can be steered by an operator in minutes, is part of the product. My default for a new product is cells from the first multi-zone deployment, with the drain tested on a schedule, because adding siloing later means auditing every cross-zone call.

## Teams: A Chat Service and a Record in Every Mailbox

Microsoft documents Teams storage from the compliance side, and the picture is a deliberate double write:

- **Primary storage** for all chat and channel messages is "an Azure-powered chat service."
- **A compliance copy** of each chat message is stored in a hidden folder in the Exchange Online mailbox of **every participant** in the chat, and channel messages go to a hidden folder in the team's group mailbox. Shared channel messages are stored in a special group mailbox type, and private channel messages, previously stored in members' mailboxes, were moved to group mailboxes in a migration at the end of 2025.
- **Ingestion follows membership.** If a user is added to a chat, a copy of all messages shared with them is ingested into their mailbox, with the original created dates.
- **Search and holds depend on the mailbox.** Admins can search and hold chats only for participants with Exchange Online mailboxes; users on on-premises mailboxes in a hybrid deployment can chat, but their chats can't be searched or held.
- **Deletes propagate from the record to the service.** When a retention policy deletes a message, the copy moves to a soft-delete folder and a delete is sent to the chat service, which removes it from the client for all users, including users in other organizations whose own copies may be kept longer. Microsoft states plainly that "messages visible in the Teams app are not an accurate reflection of whether they're retained or permanently deleted."
- **External users split the record.** A guest in your tenant gets a shadow mailbox; a user from another Microsoft 365 organization keeps their copy in their own tenant, beyond your retention policies.

The design trades storage (one copy per participant) and consistency (two stores, reconciled asynchronously) for something compliance teams value: **each custodian's record is self-contained**, so holding or exporting one person's communications doesn't require reconstructing conversations from a shared store, and an employee's departure turns their mailbox into an inactive mailbox that keeps their chats under the policies that applied. It's the clearest public example of the record being a separate product with its own data model. The retention mechanics belong to the [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) chapter, export formats to [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export).

Slack takes the other path: one store, with workspace retention settings applied to it directly by a daily deletion job. Both are defensible. My default for a new product is Slack's (one authoritative store, with per-custodian views computed from membership ranges), plus an append-only capture stream that compliance archivers can consume, because a per-participant copy multiplies storage by the average conversation size and puts the reconciliation burden on the vendor forever.

## Federation: The Matrix Alternative

Matrix answers the shared-channel problem in the opposite way from Slack. A room's history is a directed acyclic graph of signed events; **every participating homeserver keeps its own copy** of the graph and synchronizes through the server-server API; the design favors availability over strict consistency, so servers converge eventually, and state resolution is deterministic so every server reaches the same room state regardless of the order events arrived. Events are signed by their origin server and can be backfilled on request.

What that buys: no single operator controls the conversation, each organization keeps its own record of rooms it participates in, and a server can be self-hosted under its owner's jurisdiction, a property sovereignty requirements sometimes ask for (the [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty#sovereignty-beyond-location) chapter). What it costs: every participating server holds a copy, so deletion is a redaction event that each server applies to its own copy rather than a single delete, and moderation and retention are per server. For a workplace vendor, federation is a deployment option a customer may require, not a default architecture.

## Ordering, Unread State and Badges

Workplace users judge a chat product by whether "unread" is right on every device. The mechanics:

- **One sequence per channel, assigned by the owner.** The channel server (or the store) assigns a monotonically increasing position within a channel; Slack's message timestamps serve as ids and as thread references (`thread_ts`). Clients order by it and detect gaps by it ([Ordering and Catch-Up](/docs/architecture/realtime-connections#ordering-and-catch-up)).
- **A read marker per member per channel,** stored server-side as the last-read position, updated in batches as the member scrolls. Unread counts derive from the channel's latest position and the marker; mention counts are a separate counter, because "3 unread" and "1 mention" drive different notifications.
- **Threads need their own markers.** Once threads exist, a channel can be fully read while a followed thread has new replies. Matrix's sync API shows the shape a standard settled on: per room, an `unread_notifications` object with a `notification_count` and a `highlight_count` (for mentions and keywords), and optionally `unread_thread_notifications` keyed by thread root with the same fields.
- **The server owns the count.** A member reads on a laptop and their phone's badge must clear. The badge is the server's computed total pushed to every device, not a client-side tally, which is why marker updates are events the gateway fans out to the member's other sessions.

Read markers are the hottest small writes in a chat system. Batch them per session, write behind, coalesce to the latest position, and never let a marker move backwards.

## Search Over Messages

Message search in a workplace product has the community version's problems ([Chat Search](/books/user-generated-platforms/real-time-chat#chat-search)) plus two of its own:

- **Permission trimming has to be exact and current.** Results are filtered by the searcher's access at query time: membership in private channels, the shared-channel host and overlays, guest scopes, and any information barriers the customer configured. A user removed from a private channel yesterday must not find its messages today, and a compliance admin searching through an eDiscovery tool sees what the chat client's search never shows.
- **The index is customer data under the customer's controls.** Retention deletes must remove indexed copies on the same schedule as the source; legal holds must not be defeated by index rebuilds; residency commitments cover the index as well as the store; and customer-managed keys (the [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys) chapter) have to cover the index as well as the message store.

Organization-wide search, connectors to other tools and AI retrieval over chat are the [Enterprise Search](/books/workplace-and-collaboration/enterprise-search) and [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants) chapters. The architecture rule for chat itself: **index from the same event stream that drives retention and holds**, so the index can't drift from the record.

## Very Large Channels

Company-wide announcement channels, all-hands chats and shared customer channels reach sizes where per-member behavior breaks:

- **Teams** supports up to 25,000 members in a team, blocks team and channel mentions in teams over 10,000, allows shared channels of 5,000 direct members including up to 50 teams, and delivers real-time updates in a shared channel to only 25,000 users at a time, showing only 25,000 in the channel list. Group chats over 20 people lose typing indicators, read receipts and calling.
- **Slack** asks for confirmation before `@channel` in channels of six or more and, in Enterprise organizations, restricts `@channel` and `@here` to owners and admins in channels of 10,000 or more.

These are fan-out controls disguised as product rules. A large channel should behave like a broadcast: posting restricted to a few, replies in threads, no typing or receipts, presence only for visible members, and notifications batched. The community platforms' techniques (visible-range member lists, lazy loading, per-node batching) are in [Large Communities](/books/user-generated-platforms/real-time-chat#large-communities).

## APIs That Read and Write Chat

Every workplace chat product is also a platform, and the API is a second write path that must obey the same rules as the client.

- **Slack** rate-limits posting specially: about one message per second per channel for an app, several hundred messages per minute across a workspace, with bursts allowed.
- **Microsoft Graph** lets apps subscribe to chat and channel message changes, with subscriptions to Teams chat messages lasting up to 4,320 minutes (three days) before renewal, an average notification latency under 10 seconds and a maximum of a minute; subscriptions to Teams resources more than an hour out require a lifecycle notification URL so the app learns when a subscription is removed or needs reauthorization.

The general API design (rate-limit tiers, events, data-use terms) is the [APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits) chapter. The architecture rule is that **API writes go through the same accept-and-persist path as client writes**, so DLP, retention and audit can't be bypassed by a bot.

## How to Build It

The [core tables](/books/workplace-and-collaboration/workplace-business#the-core-data-model) (`containers`, `items`, `members`, `legal_holds`) and the chat tables from [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat#how-to-build-it) carry most of the model. This chapter adds the delivery and record-keeping state.

```sql
CREATE TABLE channel_heads (                 -- the owner's view of each channel's stream
  container_id    UUID PRIMARY KEY REFERENCES channels (container_id),
  last_seq        BIGINT NOT NULL DEFAULT 0, -- messages.seq is assigned from this
  last_message_at TIMESTAMPTZ,
  member_count    INT NOT NULL DEFAULT 0,
  broadcast_mode  BOOLEAN NOT NULL DEFAULT FALSE  -- large-channel behavior: no typing,
                                                  -- receipts or channel-wide mentions
);

CREATE TABLE channel_read_states (           -- one row per member per channel
  member_id      UUID NOT NULL REFERENCES members (id),
  container_id   UUID NOT NULL REFERENCES channels (container_id),
  last_read_seq  BIGINT NOT NULL DEFAULT 0,
  mention_count  INT NOT NULL DEFAULT 0,     -- mentions and keyword hits since last_read_seq
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, container_id)
);

CREATE TABLE thread_read_states (            -- followed threads have their own marker
  member_id       UUID NOT NULL REFERENCES members (id),
  thread_root_id  UUID NOT NULL REFERENCES messages (item_id),
  following       BOOLEAN NOT NULL DEFAULT TRUE,
  last_read_seq   BIGINT NOT NULL DEFAULT 0,
  mention_count   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (member_id, thread_root_id)
);

CREATE TABLE capture_events (                -- append-only feed for compliance consumers
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  position      BIGINT NOT NULL,             -- per-workspace, gap-free
  item_id       UUID NOT NULL REFERENCES items (id),
  event         TEXT NOT NULL CHECK (event IN ('created', 'edited', 'removed',
                  'membership_changed', 'purged')),
  container_id  UUID NOT NULL REFERENCES containers (id),
  custodians    UUID[] NOT NULL,             -- members who could see it at the time
  occurred_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (workspace_id, position)
);
```

Notes on the sketch:

- **Sequence assignment happens once.** The channel's owner (a channel server, or a row lock on `channel_heads` in a small deployment) increments `last_seq` and stamps the message in the same transaction as the insert, so `messages.seq` is gap-free per channel and clients can detect missed events.
- **Write, then publish.** The message insert, the `channel_heads` update, the `capture_events` row and an outbox event commit together; the gateway, search indexer and notification service consume the outbox. The outbox table in [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture#how-to-build-it) is the shared mechanism.
- **Read states are write-behind.** Clients send marker updates at most every few seconds per channel; the server keeps the maximum, never decreasing, and fans the update to the member's other sessions so badges clear everywhere.
- **Custodians are computed, not copied.** Instead of a copy per participant, each capture row records who could see the item at that moment, from `channel_memberships.valid_during` and grants. A per-custodian export or hold is a query over the stream, and an archiving partner reads the stream from its last position (the [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications) chapter covers capture for regulated firms).
- **Shared channels write to the host.** A message in a channel hosted by another organization is inserted in the host's workspace; the participant's `capture_events` gets a row too, so both organizations' compliance tools see it under their own retention.
- **Large channels switch modes.** When `member_count` crosses the configured threshold, set `broadcast_mode` and stop fanning out typing, receipts and per-member presence for that channel.

## Auditing

- **Every message accepted, with its write path** (client, API token, workflow, bridge) and the policy checks it passed, so "how did this get posted?" has an answer.
- **The capture stream's integrity:** positions are gap-free and consumers record the last position they processed, so a missing range is detectable ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **Cross-tenant operations:** shared-channel creation, host recorded, overlays changed, and every read or write routed to another organization's host.
- **Operator actions:** cell drains and restores with the operator, scope and duration, because they affect which customers saw errors and feed SLA credit calculations.
- **Index operations:** rebuilds, deletions for retention and the hold check that preceded them.

## What This Means for the System You Build

- **Persist through one accept path, then fan out;** API, bot and client writes share it, and sockets carry hints.
- **Shard by access pattern (channel), isolate by tenant id,** and make permission checks work across an organization's workspaces from the start.
- **Store cross-organization content once, in a recorded host,** with per-tenant overlays for names and settings.
- **Treat the compliance record as a second product:** an append-only capture stream with custodians computed from membership ranges, or a per-custodian copy if you accept the storage and reconciliation cost.
- **Silo by zone and practice draining** before you sign an availability commitment.
- **Keep read markers per channel and per followed thread on the server,** batched, monotonic and fanned out to every device.
- **Index from the same event stream as retention and holds,** with permission trimming at query time and keys and residency covering the index.
- **Switch large channels into broadcast mode** at a threshold.

## References

**Engineering write-ups**

- [Slack: Real-time messaging (2023)](https://slack.engineering/real-time-messaging/), channel, gateway, admin and presence servers, consistent hashing, the write path through the web API, transient events, top-of-hour spikes, channels per host, replacement time and 500 ms delivery
- [Slack: How Slack built shared channels (2019)](https://slack.engineering/how-slack-built-shared-channels/), the workspace as unit of tenancy, rejecting duplicated writes, one copy on the originating shard, the `shared_channels` table and per-workspace overrides, `is_private`, the `conversations.*` API and edge cache changes
- [Slack: Unified Grid, how we re-architected Slack for our largest customers (2024)](https://slack.engineering/unified-grid-how-we-re-architected-slack-for-our-largest-customers/), org-wide boot API, sharding off the workspace axis, cross-workspace permission helpers, the 50-workspace cap and the 2023 to 2024 rollout
- [Slack: Slack's migration to a cellular architecture (2023)](https://slack.engineering/slacks-migration-to-a-cellular-architecture/), the June 30, 2021 availability zone incident, drain goals, siloing, Envoy weighted clusters and the migration's duration
- [Slack: Scaling datastores at Slack with Vitess (2020)](https://slack.engineering/scaling-datastores-at-slack-with-vitess/), workspace sharding and resharding messages by channel

**Vendor documentation**

- [Slack: Customize message and file retention policies](https://slack.com/help/articles/203457187-Customize-message-and-file-permissions), retention settings applied to the workspace's messages, deletions running once a day
- [Microsoft Learn: Learn about retention for Teams](https://learn.microsoft.com/en-us/purview/retention-policies-teams), the Azure-powered chat service as primary storage, compliance copies in participant and group mailboxes, mailbox types, ingestion on being added to a chat, the 2025 private channel migration, delete propagation, external users and inactive mailboxes
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), chats searchable only with Exchange Online mailboxes, team and shared channel limits, the 25,000-user real-time limit, mention blocking above 10,000 members, features off above 20 chat members
- [Microsoft Learn: subscription resource type](https://learn.microsoft.com/en-us/graph/api/resources/subscription), maximum subscription lifetimes, lifecycle notification URLs for Teams resources, chat message notification latency
- [Slack Developer Docs: chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage), `thread_ts`, posting rate limits per channel and per workspace
- [Slack: Notify a channel or workspace](https://slack.com/help/articles/202009646-Notify-a-channel-or-workspace), the six-member confirmation and the 10,000-member restriction on channel-wide mentions

**Standards**

- [Matrix Specification v1.19](https://spec.matrix.org/latest/), the room DAG, per-server copies, eventual consistency, deterministic state resolution, signing and backfill
- [Matrix Client-Server API v1.19](https://spec.matrix.org/v1.19/client-server-api/), `unread_notifications` with `notification_count` and `highlight_count`, per-thread unread counts, redactions
