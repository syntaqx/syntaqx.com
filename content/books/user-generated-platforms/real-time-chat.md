+++
title = "Real-Time Chat"
description = "Community chat at scale: gateways and sharding, large-server fan-out and member lists, message storage, DMs and message requests, rate limits, and chat search."
category = "User-Generated Platforms Industry"
order = 1808
part = "Communities and Conversation"
tags = ["user-generated-content", "chat", "realtime", "messaging", "search"]
+++

Chat is the part of a community platform that never stops. A forum post can be read hours later; a chat message is expected on every member's screen within a second, in a channel that might have a hundred thousand people in it, and kept for years so anyone can scroll back. The volumes are an order of magnitude beyond posts: Reddit's transparency report counts 2.2 billion posts and comments in the second half of 2025 and 3.9 billion private messages and chats in the same six months, and Discord's message store passed trillions of messages by 2022.

The playbook and the Gaming volume already cover the generic real-time machinery. [Realtime Connections](/docs/architecture/realtime-connections) owns transports, edges and routing, authentication on connect, heartbeats, ordering and catch-up, reconnect storms and load shedding; the Gaming volume's [Parties, Presence, Chat & Voice](/books/gaming/social-systems) owns presence basics and fan-out, XMPP versus a custom protocol, and chat moderation hooks. This chapter covers what community chat adds: communities with thousands of channels and hundreds of thousands of members, the gateway that serves them and the bots that read them, member lists and presence in very large groups, message storage at trillion scale, direct messages and the stranger problem, rate limits as abuse control, encryption, and search over messages.

It extends `channels` from [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#how-to-build-it) and adds messages, direct-message recipients, read states and message requests. Chat messages are deliberately not `content_items`: they're too many and too short-lived per row for the content pipeline, and the core model's `moderation_cases` already accepts `message` as a subject. Live stream chat (one channel, a hundred thousand viewers, a few seconds of attention per message) is Live Chat & the Interactive Layer; automod rules for chat are [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation).

## How the Platforms Do It

| Platform | Shape | Connection layer | Message store | Public detail |
| --- | --- | --- | --- | --- |
| **Discord** | Servers with many channels, threads, DMs and group DMs | One WebSocket gateway per client; Elixir processes per session and per server | Cassandra from 2015 to 2022, then ScyllaDB behind Rust data services | Gateway docs; engineering posts on storage, search and member lists |
| **Slack** | Workspaces with channels, threads and DMs | WebSocket to edge regions, Envoy, gateway servers, channel servers by consistent hashing | MySQL sharded by workspace, moved to Vitess sharded by channel | Engineering posts on real-time messaging, the Flannel edge cache and Vitess |
| **Reddit** | Chat channels in communities, plus direct chats | Not publicly detailed | Not publicly detailed | Private messages merged into chat in 2025; chat counted in the transparency report |
| **Twitch** | One chat per channel | IRC-derived edge and pub/sub | Short retention | Live Chat & the Interactive Layer |

The two best-documented systems converge on the same architecture from different ends. **An edge holds sockets; a stateful tier owns each channel or community; a router connects them.** Slack's 2023 post describes gateway servers that hold user subscriptions across regions and channel servers that own channel history in memory, mapped by consistent hashing, delivering messages worldwide in about 500 milliseconds; Discord describes session processes per connected client and a process per server that fans events out to sessions. Both shard their message stores by channel, not by community, after learning that the largest communities are too big for one shard.

## The Gateway

A community chat client opens one connection and receives everything for everywhere it belongs: messages in every channel it can see, typing indicators, presence, member changes, reactions, voice state, moderation actions. Discord's Gateway documentation is a complete public specification of such a connection, and its details are worth adopting:

- **Hello and heartbeat.** The server's first message sets a heartbeat interval; the client waits a random fraction of it before the first heartbeat, so a mass reconnect doesn't synchronize heartbeats into a wave ([Heartbeats and Dead Connections](/docs/architecture/realtime-connections#heartbeats-and-dead-connections)).
- **Identify with intents.** The client (or bot) declares which event groups it wants as a bitfield of intents. Intents cut fan-out at the source: a bot that only needs commands never receives typing events from fifty thousand servers.
- **Resume.** After a drop, the client reconnects to a session-specific resume URL with its session id and the last sequence number it saw, and the server replays what it missed, so a network blip doesn't become a full reload ([Ordering and Catch-Up](/docs/architecture/realtime-connections#ordering-and-catch-up)).
- **Limits.** 120 events sent per connection per 60 seconds, with immediate disconnection beyond it; 1,000 identifies per 24 hours across all of an app's shards, after which every session is terminated and the bot token reset.

### Large Communities

The hard cases are the largest communities, where a single event (a message in a popular channel, a member joining) has to reach hundreds of thousands of connected sessions. What the published systems do:

- **Send only what's visible.** A client doesn't need presence for 500,000 members; it needs the slice of the member list on screen. Discord's member list sends only the visible range, which required a sorted set that can report an item's index quickly; its 2019 post describes replacing an immutable Elixir structure that slowed down at 250,000 members with a Rust sorted set called through a native extension, at 0.61 to 3.68 microseconds per operation up to a million items.
- **Suppress what doesn't scale.** Presence and typing in a 200,000-member server are noise and load. Discord's UK changes for the Online Safety Act hide activity status in servers with 200 or more members, which is a safety rule and a fan-out cut at once.
- **Lazy-load the snapshot.** Slack's 2017 Flannel post describes the problem on the client side: the startup payload with every user and channel of a large team slowed startup, used memory and made reconnects expensive. Flannel, an application-level cache at the edge, served a slimmed-down payload and answered queries on demand, shrinking the startup payload 7 times for a 1,500-user team and 44 times for a 32,000-user team, at peak 4 million simultaneous connections and 600,000 queries a second.
- **Batch per node.** One event bound for many sessions is sent once to each edge node that holds any of them, which then delivers locally; the Gaming volume's [Fan-Out](/books/gaming/social-systems#fan-out) section describes Discord's Manifold for exactly this.

### Bots on the Gateway

Bots connect to the same gateway as clients, and at scale they must shard. Discord requires sharding once an app is in 2,500 servers, assigns each server to a shard by `shard_id = (guild_id >> 22) % num_shards` (the shift drops the low bits of the id, leaving its timestamp), sends events without a server (DMs) to shard 0, and limits how many shards may start at once through a `max_concurrency` value. The ids are Snowflakes: 64-bit integers whose top 42 bits are milliseconds since the platform's epoch (the first second of 2015 for Discord), followed by worker, process and sequence bits, so ids sort by time and can be generated without coordination. Bot access, privileged intents and rate limits are [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis).

## Message Storage at Scale

Chat storage is a write-heavy, read-recent workload with a long tail: most reads are the latest page of a channel, but anyone can scroll back years or jump to a search result. Discord's two public write-ups trace the path most large systems follow.

**2017, MongoDB to Cassandra.** Discord stored messages in a single MongoDB replica set until about 100 million messages, when data and indexes stopped fitting in RAM. It moved to Cassandra with the primary key `((channel_id, bucket), message_id)`: the partition is a channel within a time bucket of about ten days, so no partition grows past roughly 100 MB, and the clustering key is the Snowflake message id, so a page of history is one partition read in id order. The post lists the problems a wide-column store brings to chat: an edit racing a delete left rows without an author (fixed by deleting them); writing nulls created tombstones (fixed by writing only non-null fields); and a channel with millions of deleted messages caused ten-second garbage collection pauses on reads (fixed by shortening the tombstone grace period and tracking empty buckets).

**2023, Cassandra to ScyllaDB.** By early 2022 the cluster had 177 Cassandra nodes holding trillions of messages, and hot partitions (one busy channel) spread latency across everyone sharing their nodes. Discord moved to ScyllaDB and put **data services written in Rust** between the API and the database: one service endpoint per query shape, routing by consistent hashing on channel id so requests for one channel land on one instance, and **request coalescing**, where concurrent requests for the same rows trigger a single database query whose result all of them share. The migration ran at up to 3.2 million messages a second and cut over in May 2022; the result was 72 nodes instead of 177, historical-message fetch p99 from 40 to 125 ms down to 15 ms, and insert p99 from 5 to 70 ms down to a steady 5 ms.

**Slack, workspace to channel sharding.** Slack's 2020 post describes the same lesson in MySQL: shards held whole workspaces, which put the largest customers' load on single shards; moving to Vitess, Slack resharded message data by channel id, reaching 2.3 million queries a second at peak (about 2 million reads and 300,000 writes) with a median latency of 2 ms and a p99 of 11 ms, with 99% of query load on Vitess by late 2020.

The rules to take from both:

- **Partition by channel and time,** never by community: the biggest community is always bigger than a shard.
- **Use time-ordered ids** generated without coordination, so the id is the sort key and the bucket can be derived from it.
- **Coalesce reads for hot channels;** a popular channel is a thundering herd on one partition.
- **Design deletes deliberately.** In log-structured stores a delete is a write that lingers; mass deletion (a raid cleaned up, a purge) needs a plan for tombstones, not just a `DELETE`.

## Edits, Deletes and Retention

Chat messages are edited and deleted constantly, and they're also the evidence in harassment, grooming and threat cases. The design separates what's served from what's kept:

- **Edits keep history** for the moderation retention window: the served message shows the latest text and an edited marker, and reports point at the version the reporter saw.
- **Deletes serve a tombstone** (or nothing) immediately, while the content is retained for a short, documented window so that a report filed after the deletion can still be reviewed, and longer only under a legal hold or a decision ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)).
- **Retention by channel type and outcome**, as the Gaming volume's [Messages, Storage and Retention](/books/gaming/social-systems#messages-storage-and-retention) describes, applies equally here: unremarkable messages age out on the platform's schedule, reported ones are kept with their case, penalized ones longer.

Community owners also want retention controls (auto-delete in a channel after a period). They're compatible with the above if the owner's setting governs what's served and the platform's minimum governs what's kept for safety.

## Direct Messages and the Stranger Problem

Direct messages are where the most serious harms on community platforms start: grooming, sextortion, harassment, scams. They're private, so other members can't see or report them, and they often begin with someone the recipient met in a large public server. The industry's controls converge on **separating strangers from contacts:**

- **Message requests.** Discord's changes for the UK Online Safety Act route DMs from non-friends who share only servers of 200 or more members into a separate message-request inbox, and its global teen-by-default settings from March 2026 send messages from people a teen may not know to a separate inbox that only verified adults can change.
- **Friend-request warnings.** The same UK changes show an alert on friend requests from unfamiliar senders: no mutual friends, or a shared server of under 200 members.
- **Sensitive-media blur** by default for teens and as a setting for adults, so an unsolicited image arrives blurred; Discord's Teen Safety Assist (October 2023, built with Thorn) turned on sensitive-media blurring and alerts on a teen's first DM from a new sender by default.
- **DM settings per community.** Letting members refuse DMs from people whose only connection is a given community closes the path from a large public server to a private conversation.
- **Blocks everywhere.** A block from [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#how-to-build-it) stops DMs, friend requests and group-DM additions in both directions.

DM content is still subject to reports, and the report is the moment the platform sees it: the reporter's client sends the message ids, and the server attaches the stored messages (not a screenshot) to the case, with surrounding context ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)). Whether and how a platform scans DM content proactively is a policy and legal decision (Child Safety: Detection & Reporting covers the EU derogation and its lapse); the architecture should make it possible to apply hash matching to attachments in DMs without reading text, because that's the narrowest proactive check.

Reddit's report shows how quickly DM volume moves: private messages were progressively replaced by chat in 2025, with 3,893,884,194 chat messages exchanged in the second half of the year and 2,394,233 removed by admins.

## Rate Limits as Abuse Control

In chat, rate limits are moderation tools as much as capacity controls:

- **Slowmode.** A per-channel minimum interval between a member's messages; Discord's ranges from 0 to 21,600 seconds and also limits thread creation, with a bypass permission for moderators.
- **Per-account send limits** across channels catch the spammer who posts the same link in forty channels in a minute.
- **New-member limits.** Accounts that joined minutes ago get stricter limits on links, attachments, mentions and DMs; mention spam is a raid's first move, which is why mention limits are an automod trigger.
- **Connection limits** (events per connection, identifies per day) bound what a compromised token can do.

Limits that trip should produce a moderation signal, not only a 429: an account that hits the cross-channel send limit three times in a day is probably a spammer, and the event belongs in the spam pipeline (Spam, Bots & Inauthentic Behavior).

## Encryption

Transport encryption is a given; end-to-end encryption is a choice with consequences for safety work. Discord's DAVE protocol, announced in September 2024, end-to-end encrypts audio and video in DMs, group DMs, voice channels and Go Live streams using Messaging Layer Security for group keys, while text messages are not end-to-end encrypted and stay under its content moderation ([Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms)). The split is deliberate: text is where reports, automod and hash matching on attachments operate; end-to-end encrypting it removes the server's ability to apply them, leaving client-side reporting (the reporter's device decrypts and submits the messages) as the main path. A community platform that adds end-to-end encrypted text has to design the report flow, the evidence model and its legal position around that before launch.

## Workplace Chat Inverts the Duties

Workplace chat (Slack, Microsoft Teams) runs the same architecture with the duties turned around. On a community platform the platform sets the rules, moderates, keeps the evidence and answers legal requests; in a workplace product the customer organization does. Slack's data request policy says third parties seeking customer data "should contact the Customer," that "the Customer controls the Customer Data," that content requires a search warrant or equivalent, and that Slack notifies the customer before disclosure unless prohibited. Retention, legal holds and eDiscovery are the employer's tools: Slack's legal holds (on Enterprise plans) preserve custodians' messages and files regardless of retention settings, set by members with a legal-holds admin role, and Microsoft Purview's eDiscovery searches, holds and exports Teams chats for the organization's own investigators. The platform's job shrinks to operating the service and enforcing its acceptable-use terms against the customer as a whole. Enterprise collaboration in depth belongs to a future Workplace & Collaboration volume.

## Chat Search

Searching chat is a different problem from searching posts: the corpus is enormous, each user can see only a sliver of it, and the most valuable searches are inside private spaces. Discord's 2025 post on indexing trillions of messages describes the design that got there:

- **Cells of smaller clusters.** Two huge Elasticsearch clusters of over 200 nodes each became about 40 smaller clusters grouped in "cells" on Kubernetes, so a failure or a reindex touches one cell.
- **A queue and a router.** Messages to index flow through Google Pub/Sub; a Rust router batches them by destination index.
- **Shard by who searches.** Server messages are indexed by server id; DMs are indexed by user id, with each DM stored twice (once per participant) so a user can search all their DMs in one query.
- **Special-case the giants.** The largest servers ("Big Freaking Guilds" in the post) get dedicated multi-shard indices, because one Lucene index tops out around two billion documents.
- **Results:** median query latency fell from 500 ms to under 100 ms, and p99 from 1 second to under 500 ms.

Permission filtering is the rule that matters most: search results are filtered by the searcher's current permissions on each channel (a channel they lost access to yesterday must not appear today), deleted and removed messages leave the index on the removal path, and blocked users' messages follow the viewer's settings ([Search & Discovery](/books/user-generated-platforms/search-and-discovery#how-to-build-it)).

## How to Build It

The chapter's additions. The SQL sketch shows the relational shape; at scale the `messages` table lives in a wide-column store with the key `((channel_id, bucket), id)` and the same columns:

```sql
ALTER TABLE channels
  ALTER COLUMN community_id DROP NOT NULL,          -- DMs and group DMs have none
  DROP CONSTRAINT channels_kind_check,
  ADD CONSTRAINT channels_kind_check CHECK (kind IN ('category', 'text', 'forum',
    'announcement', 'voice', 'stage', 'thread', 'dm', 'group_dm')),
  ADD COLUMN parent_message_id BIGINT,              -- the message a thread hangs off
  ADD COLUMN owner_account_id UUID REFERENCES accounts (id),  -- group DM owner
  ADD COLUMN retention_days    INT,                 -- owner's served-retention setting
  ADD CONSTRAINT channels_dm_scope
    CHECK ((kind IN ('dm', 'group_dm')) = (community_id IS NULL));

CREATE TABLE channel_recipients (        -- who is in a DM or group DM
  channel_id  UUID NOT NULL REFERENCES channels (id),
  account_id  UUID NOT NULL REFERENCES accounts (id),
  added_by    UUID REFERENCES accounts (id),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (channel_id WITH =, account_id WITH =, valid_during WITH &&)
);

CREATE TABLE messages (                  -- partitioned by channel and time bucket
  channel_id       UUID NOT NULL REFERENCES channels (id),
  bucket           INT NOT NULL,         -- derived from the id's timestamp, e.g. 10-day windows
  id               BIGINT NOT NULL,      -- time-ordered: ms since epoch << 22 | worker | seq
  author_account_id UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL DEFAULT 'default' CHECK (kind IN ('default', 'reply',
                     'system', 'thread_starter', 'bot')),
  body             TEXT,                 -- null once deleted from serving
  reply_to_id      BIGINT,
  mentions         UUID[],
  flags            INT NOT NULL DEFAULT 0,  -- suppress_embeds, silent, ...
  edited_at        TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,
  deleted_by       TEXT CHECK (deleted_by IN ('author', 'moderator', 'platform',
                     'automod', 'retention')),
  PRIMARY KEY (channel_id, bucket, id),
  CHECK ((deleted_at IS NULL) = (deleted_by IS NULL))
);

CREATE TABLE message_revisions (         -- edit history, kept for the safety window
  channel_id UUID NOT NULL,
  message_id BIGINT NOT NULL,
  revision   SMALLINT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purge_after TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (channel_id, message_id, revision)
);

CREATE TABLE message_media (             -- attachments are media assets, hashed like any other
  channel_id     UUID NOT NULL,
  message_id     BIGINT NOT NULL,
  position       SMALLINT NOT NULL,
  media_asset_id UUID NOT NULL REFERENCES media_assets (id),
  PRIMARY KEY (channel_id, message_id, position)
);

CREATE TABLE read_states (               -- where each member is in each channel
  account_id           UUID NOT NULL REFERENCES accounts (id),
  channel_id           UUID NOT NULL REFERENCES channels (id),
  last_read_message_id BIGINT NOT NULL DEFAULT 0,
  mention_count        INT NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, channel_id)
);

CREATE TABLE message_requests (          -- first contact from someone who isn't a friend
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id        UUID NOT NULL REFERENCES channels (id),  -- the DM it would open
  sender_account_id UUID NOT NULL REFERENCES accounts (id),
  recipient_account_id UUID NOT NULL REFERENCES accounts (id),
  reason            TEXT NOT NULL CHECK (reason IN ('not_friends', 'large_server_only',
                      'recipient_teen_default', 'recipient_setting')),
  state             TEXT NOT NULL CHECK (state IN ('pending', 'accepted', 'ignored',
                      'reported', 'blocked')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at      TIMESTAMPTZ
);
```

Notes on the sketch:

- **Ids are the clock.** A 64-bit id with a millisecond timestamp in the top bits gives ordering, pagination (`WHERE id < $cursor ORDER BY id DESC LIMIT 50`) and the bucket in one value; generators need a worker id each, not a central sequence.
- **Buckets bound partitions.** Ten-day buckets were Discord's choice for its traffic; pick the window from your busiest channels' message rate so partitions stay well under the store's comfortable size, and track empty buckets so a history read on a quiet channel doesn't scan years of nothing.
- **Deletion is a state.** `deleted_at` and `deleted_by` serve the tombstone; a retention job nulls `body` and purges revisions after the window unless a `legal_holds` row or a case says otherwise. Reports snapshot the message and its revisions into the case's evidence ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)).
- **Attachments are media assets.** They pass through the same upload, scanning and hashing pipeline as post media (The Upload Path), which is what lets a known-image match work in a DM without reading text.
- **Message requests gate the DM.** A DM channel between non-friends opens with its first message held in a request; the recipient's acceptance opens the channel, and ignoring it never notifies the sender. Rules for when a request is required read friendships, shared communities and their sizes, the recipient's settings and age band.
- **Read states are hot.** They're updated on every scroll; batch them per session and write behind, and derive unread badges from `last_read_message_id` against the channel's latest id.
- **Events:** `message.created`, `message.edited`, `message.deleted`, `message_request.created`, `message_request.accepted` and `channel.recipient_added` go to the gateway for fan-out, to the search indexer, to automod, and to notifications for offline recipients ([Notifications & Consent](/docs/architecture/notifications#push-notifications)).

## Auditing

- **Messages and revisions for the safety window,** with every moderator view of DM content logged and justified ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Who could reach whom:** friendships, message requests and their outcomes, group-DM membership ranges and DM settings changes, because grooming and harassment investigations start there.
- **Deletions with their actor** (author, moderator, automod, retention), so "who deleted this?" has an answer.
- **Rate-limit and slowmode trips** as moderation signals with their thresholds.
- **Encryption scope per channel type,** so what the platform could and couldn't see at the time of a report is a record.

## What This Means for the System You Build

- **Reuse the playbook's real-time layer:** independent edges, a router, a stateful tier per channel or community, resume with sequence numbers.
- **Cut fan-out at the source** with intents and subscriptions, visible-range member lists and suppressed presence in large communities.
- **Lazy-load large communities' state** instead of sending the whole snapshot at connect.
- **Partition messages by channel and time,** with time-ordered ids generated without coordination; never shard by community.
- **Coalesce reads** for hot channels and plan for tombstones before mass deletes.
- **Serve deletions immediately and keep evidence for a short window,** longer only under a hold or a case.
- **Route strangers' DMs to message requests,** warn on unfamiliar friend requests, blur media by default for teens, and let members close DMs per community.
- **Treat rate limits as moderation signals,** with slowmode and new-member limits as community tools.
- **Decide encryption scope with the report flow;** keep attachments hashable.
- **Shard chat search by who searches,** index DMs per participant, and filter by current permissions.

## References

**Reference**

- [Discord Developer Docs: Gateway](https://docs.discord.com/developers/events/gateway), heartbeat jitter, intents, resume, per-connection send limits, the identify limit, sharding formula and threshold, and `max_concurrency`
- [Discord Developer Docs: API reference, Snowflakes](https://docs.discord.com/developers/reference), the 64-bit id layout and the 2015 epoch
- [Discord Developer Docs: Channel resource](https://docs.discord.com/developers/resources/channel), channel and thread types, slowmode range and bypass
- [Slack: User data request policy](https://api.slack.com/user-data-request-policy), third parties directed to the customer, customer control of data, warrant requirement and customer notice
- [Slack: Create and manage legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds), holds that preserve custodians' messages regardless of retention, on Enterprise plans
- [Microsoft Learn: Microsoft Purview eDiscovery](https://learn.microsoft.com/en-us/purview/ediscovery), organization-run search, hold and export of Teams chats

**In practice**

- [Discord: How Discord stores billions of messages (2017)](https://discord.com/blog/how-discord-stores-billions-of-messages), the MongoDB limit, Cassandra key design, buckets and tombstone problems
- [Discord: How Discord stores trillions of messages (2023)](https://discord.com/blog/how-discord-stores-trillions-of-messages), 177 Cassandra nodes to 72 ScyllaDB nodes, Rust data services with request coalescing, migration rate, cutover and latency figures
- [Discord: How Discord indexes trillions of messages (2025)](https://discord.com/blog/how-discord-indexes-trillions-of-messages), Elasticsearch cells, Pub/Sub and the Rust router, guild and per-user DM sharding, dedicated indices for the largest servers, latency results
- [Discord: Using Rust to scale Elixir for 11 million concurrent users (2019)](https://discord.com/blog/using-rust-to-scale-elixir-for-11-million-concurrent-users), visible-range member lists and the Rust sorted set
- [Discord: Adapting Discord for the UK Online Safety Act](https://discord.com/safety/adapting-discord-for-the-uk-online-safety-act), message requests, friend-request alerts and hidden activity status in large servers
- [TechCrunch: Discord to roll out age verification next month](https://techcrunch.com/2026/02/09/discord-to-roll-out-age-verification-next-month-for-full-access-to-its-platform/), teen-by-default message routing from March 2026
- [Discord: Building a safer place for teens](https://discord.com/safety/safer-place-for-teens), Teen Safety Assist with sensitive-media blur and first-DM alerts on by default for teens (October 2023)
- [Discord: Meet DAVE, end-to-end encryption for audio and video](https://discord.com/blog/meet-dave-e2ee-for-audio-video), encrypted audio and video, text not end-to-end encrypted (September 17, 2024)
- [Slack: Real-time messaging (2023)](https://slack.engineering/real-time-messaging/), gateway, channel, admin and presence servers, consistent hashing, Envoy at the edge, 500 ms delivery
- [Slack: Flannel, an application-level edge cache (2017)](https://slack.engineering/flannel-an-application-level-edge-cache-to-make-slack-scale/), startup payload reductions and connection and query volumes
- [Slack: Scaling datastores at Slack with Vitess (2020)](https://slack.engineering/scaling-datastores-at-slack-with-vitess/), workspace sharding, resharding messages by channel, query volume and latency
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), posts and comments versus private messages and chats, the merger of private messages into chat, chat removals
