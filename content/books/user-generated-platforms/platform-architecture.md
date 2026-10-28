+++
title = "Platform Architecture"
description = "How user-generated platforms are built at scale: the community as partition key, hot communities, service splits, media and moderation pipelines, events."
category = "User-Generated Platforms Industry"
order = 1851
part = "Running the Platform"
tags = ["user-generated-content", "architecture", "scalability", "partitioning", "events"]
+++

A user-generated platform's load has a shape no business application has. Writes come from millions of people at once and are tiny (a vote, a message, a like); reads are skewed toward a few communities, a few posts and a few live streams at any moment; and the skew moves, because a post goes viral or a streamer goes live and a quiet partition becomes the hottest thing on the platform in minutes. Media dominates storage and bandwidth; moderation and legal duties touch every write; and the same records feed ranking, search, notifications, payouts, transparency reports and regulators. The public engineering write-ups from Discord, Reddit, Pinterest, Twitch, Airbnb, Meta and the open protocols describe the same handful of decisions made under that pressure.

This chapter collects them: the community as the unit of partitioning and what happens when one community outgrows a partition, how the platforms split their systems and how they moved off monoliths, the media and moderation pipelines as asynchronous stages, the event spine everything else subscribes to, vendors at the edges, serving by jurisdiction, and a table of published scale. Generic architecture (service boundaries, multi-tenancy, events, caching, real-time connections) lives in the playbook and is linked rather than repeated; the components themselves have their own chapters ([Real-Time Chat](/books/user-generated-platforms/real-time-chat) for gateways and message storage, [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#hot-warm-and-cold-storage) for media storage, [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline) for ranking, [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) for video). The chapter adds one table to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model): where each community lives.

## How the Platforms Do It

| Platform | Partition unit | Store and services as published | Event and data spine | What forced the change |
| --- | --- | --- | --- | --- |
| **Airbnb** | Not covered here | An identity graph of about 7 billion nodes and 11 billion edges on JanusGraph and DynamoDB | Not covered here | Linked accounts and suspicious activity |
| **Bluesky (AT Protocol)** | The user's repository on a personal data server | Personal data servers, relays aggregating a firehose, app views indexing the network, independent feed generators and labelers | The relay firehose | A network no single operator owns |
| **Discord** | The server (guild): a process per guild; gateway shard by `guild_id`; messages keyed by channel and a time bucket | Cassandra, then ScyllaDB with Rust data services in front; Elasticsearch in "cells" for search; Elixir for real-time, C++ selective forwarding units for voice | Pub/Sub queue into search indexing | Hot partitions, tombstones and garbage collection pauses at trillions of messages |
| **Pinterest** | The graph (Pins and boards) for recommendation | Pixie: random walks over a 3 billion node, 17 billion edge graph held in memory | Not covered here | Engagement from real-time graph recommendations |
| **Reddit** | The community (subreddit) as the product's unit; services by domain (comments, accounts, posts, subreddits) | Python monolith moving to Go services; PostgreSQL, Memcached, Redis | Kafka: more than 500 brokers, over a petabyte of live data, "tens of millions of messages every second" | Write latency spikes up to 15 seconds in the legacy path |
| **Twitch** | The channel's stream, routed to an origin with transcoding capacity | Ingest proxies in nearly a hundred points of presence; a routing service picks origins; a replication tree distributes | Spade analytics at almost 3 million events per second; a data lake over 100 petabytes (2023) | Using all transcoding capacity at peak, and cost |

Four decisions repeat: **partition by the unit people gather in** (server, community, channel), because that's where reads and moderation concentrate; **put a service layer between the application and a hot store** that coalesces and routes requests; **move to an event log** that every derived system reads; and **migrate incrementally with the old and new systems compared** on live traffic before cutover.

## The Community Is the Partition Key

[The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) makes the community the scope for membership, rules, roles and moderation and has no tenant above it. The same choice is the natural partition key, for three reasons: most reads in a community's surfaces (its feed, its channels, its member list, its mod queue) touch only that community's rows; permission checks resolve within one community's roles; and moderation actions, rate limits and many legal requests are scoped to it. Discord's architecture is the clearest public example: each guild runs as an Elixir process, the gateway shards connections with `shard_id = (guild_id >> 22) % num_shards`, and messages are keyed by `(channel_id, bucket)` with a time bucket of about ten days so a partition stays under 100 MB.

The playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy) applies with the community in the tenant's place for placement and noisy neighbors ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)), but not for isolation: content crosses communities constantly (a crosspost, a user's profile across every community, a home feed drawn from many), so the community can't be a hard security boundary the way a business tenant is. The rule is **partition by community, query across communities through derived stores** (search indexes, feed caches, user timelines) built from events, never by scatter-gathering every partition on a request.

### When One Community Is Too Big

Skew is the defining problem. A few communities hold most of the activity, and one can grow from quiet to enormous overnight. The published fixes:

- **Give the biggest their own resources.** Discord's search runs Elasticsearch in many smaller clusters ("cells") instead of two huge ones, and gives "Big Freaking Guilds" dedicated multi-shard indices, because a single Lucene index tops out around two billion documents.
- **Coalesce identical reads.** When thousands of members open the same channel at once, Discord's Rust data services issue one database query for concurrent identical requests and route by consistent hashing on `channel_id`, which took message history p99 from 40 to 125 milliseconds down to 15.
- **Send only what's visible.** A member list of hundreds of thousands can't be sent whole; Discord's guild processes send the visible slice and needed a sorted set with index lookups, which it built as a Rust extension because immutable Elixir structures were too slow at 250,000 members.
- **Bucket by time.** Time-bucketed keys spread one channel's history across partitions so no partition grows without bound.
- **Move a community.** A community that outgrows its cell or shard moves, which requires knowing where it lives (the placement table below), a copy and catch-up, a cutover with a brief write pause, and redirection of its traffic.

### What Breaks at Scale

The write-ups agree on the failure modes, and each is specific to user-generated workloads:

- **Deletes are writes.** Users delete messages, moderators remove posts, purges remove millions of files. In Cassandra, Discord found that a channel with millions of deleted messages produced tombstones that caused ten-second garbage collection pauses; it cut tombstone retention from ten days to two, wrote only non-null values, and tracked empty buckets. A moderation purge or a policy-driven deletion ([Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#policy-driven-purges)) is a load event to plan.
- **Hot partitions plus quorum reads spread latency.** By 2022 Discord ran 177 Cassandra nodes; it moved to ScyllaDB and the Rust service layer and ended with 72 nodes, insert p99 down from 5 to 70 milliseconds to 5.
- **Fan-out is the cost.** A message to a large server, a post to a large following or a live chat line to a big audience multiplies at delivery; the playbook's [Fan-Out](/docs/architecture/realtime-connections#fan-out) covers the patterns, and [Real-Time Chat](/books/user-generated-platforms/real-time-chat#large-communities) and [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity#chat-fanout) cover the platform specifics.
- **Edit and delete races.** Discord found that a concurrent edit and delete under last-write-wins left rows without an author; it deletes such rows. Every store that merges writes needs a rule for that race.

## Splitting the System

The services a user-generated platform ends up with follow the parts of this volume:

| Service | Owns | Reads from others through |
| --- | --- | --- |
| Accounts and identity | Accounts, handles, verifications, sessions, standing | Penalties (events) |
| Communities | Communities, memberships, roles, rules | Accounts |
| Content | Content items and revisions, votes, threads | Communities (permissions), media (asset state) |
| Media pipeline | Media assets, variants, hashes, storage tiers | Content (references) |
| Moderation | Cases, reports, decisions, penalties, legal notices | Content, media, accounts (snapshots as evidence) |
| Messaging and real time | Channels, messages, presence, gateways | Communities, accounts, moderation |
| Distribution | Feeds, search, recommendations, notifications | Events from everything |
| Marketplace | Listings, calendars, bookings, claims | Content, accounts, payments |
| Money | Payments, ledgers, payouts, tax | Bookings, creator programs |
| Compliance | Regulator requests, legal requests, transparency reports, age rules | Moderation, accounts (read-only) |

The playbook's advice holds: start with a [modular monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith), split when a part needs its own scaling or team, and give every piece of data [one owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner). Reddit's move of comments from its Python monolith to a Go service, as Reddit engineers described it (reported by InfoQ), shows the split done safely: a share of live traffic was sent to the new service and its responses compared with the old one's while users still got the old responses ("tap compare"); writes touched three datastores (PostgreSQL for persistence, Memcached for caching, Redis for change data capture events), and three write endpoints across three stores meant eighteen validation paths, tested against sister datastores; p99 write latency halved. Comments and accounts were migrated by late 2025, posts and subreddits in progress. The general technique is the playbook's [Dark Launch and Shadow Reads](/docs/architecture/replacing-systems#dark-launch-and-shadow-reads).

Two splits are specific to this industry:

- **Moderation reads everything and owns its own copies.** A decision must point at the content as it was judged, after edits and deletions, so the moderation service snapshots evidence rather than reading live rows ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)). Its store has stricter access and retention than the content store, and child-safety evidence is stricter still.
- **Compliance is a reader with a clock.** Transparency reports, regulator responses and legal productions read across services from snapshots and the event log, and must never be computed from a cache that the product tolerates being stale ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query)).

## Pipelines, Not Requests

Almost everything that happens after a user presses "post" is asynchronous. The life of a post in [The User-Generated Platform Business](/books/user-generated-platforms/platform-business#the-life-of-a-post) is a pipeline: upload to storage, hash and scan, process variants, publish, rank, notify, report and decide. The architecture choices that follow:

- **State machines on assets and items.** `media_assets.state` moves through uploading, scanning, processing, ready, quarantined, removed and purged; each transition is an event and each stage is a [background job](/docs/architecture/background-jobs) that can be retried and replayed. Publishing waits on the scan, never the reverse.
- **Scanning sits before visibility.** A hash match against child-safety or terrorist content lists must block publication, so the scan is on the critical path for media and its vendors' latency is a product latency ([The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish); [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching)).
- **Moderation is a queue system with priorities.** Reports and detections become cases with priority by harm; classifiers order the queue; humans and automation decide; decisions emit penalties and notices ([Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review)). Real-time surfaces (chat, live streams) get pre-send filters with tight time budgets: Amazon IVS's chat review handler gets 200 milliseconds before a fallback allow or deny applies.
- **Video is its own fleet.** Twitch's ingest proxies in nearly a hundred points of presence terminate the stream and ask a routing service which origin should transcode, using capacity and backbone utilization; Twitch said the design lets it use "100% of the compute resources available" at peak ([Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#ingest-routing)).

## The Event Spine

The core model's design notes already require life-cycle events (`content.published`, `content.removed`, `penalty.applied` and the rest) through a [transactional outbox](/docs/architecture/events#the-transactional-outbox). At platform scale those events become the spine every derived system reads: Reddit, as its engineers described it (reported by ByteByteGo), runs Kafka with more than 500 brokers and over a petabyte of live data carrying "tens of millions of messages every second," migrated from EC2 to Kubernetes without downtime, and describes large parts of the site breaking if it failed; Twitch's Spade analytics pipeline handled almost 3 million events per second in 2023.

What subscribes, and why the spine matters for correctness, not just scale:

- **Search, feeds and notifications** are derived stores; a `content.removed` that doesn't reach them leaves a removed post findable and recommended. Removal propagation is a moderation feature with a latency target.
- **Payouts and ledgers** consume booking and earnings events with idempotent consumers ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Transparency counts and metrics** are computed from the same events, through the warehouse ([Operating Metrics](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows)).
- **Federation and APIs** publish selected events outward: the AT Protocol's relays aggregate repository updates into a public firehose, and developer platforms expose webhooks ([Federation & Open Protocols](/books/user-generated-platforms/federation#the-at-protocol); [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#webhooks-for-moderation-and-automation)).

Events carry identifiers and the community, not copies of personal data, so that an erasure doesn't have to chase a payload through every consumer's retention ([Privacy and Retention](/docs/architecture/data-pipelines#privacy-and-retention)).

## Vendors at the Edges

The build, buy or rent table in [The Platform Landscape](/books/user-generated-platforms/platform-landscape#build-buy-or-rent) puts video, image delivery, hash matching, identity verification, payments and insurance with vendors. Architecturally each vendor is a boundary with four properties to design: **an adapter** owned by the platform so a vendor can be swapped (Twitch's own transcoder and Amazon IVS sell the same lineage, which shows the layer is commodity); **a latency budget** where the vendor is on a user's critical path (scanning before publish, age checks before a feature); **a failure mode** (fail closed for child-safety scanning, fail open with a later rescan where the policy allows); and **a data record** of what left the platform, kept for breaches and regulators.

## Serving by Jurisdiction

Laws apply to the viewer's location, so the request path carries a jurisdiction: the country from the network edge, refined by the account's settings and verified age signals where they exist. That jurisdiction selects the rules in force (age rules, geographic restrictions, consent requirements) at serving time ([Geoblocking, Withholding and Withdrawal](/books/user-generated-platforms/regulators-and-enforcement#geoblocking-withholding-and-withdrawal); [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#how-to-build-it)). Two architectural consequences: rules evaluation must be fast enough to run on every request, so it reads cached, versioned rule data at the edge; and data residency (EU users' data processed in the EU, the controller per region) is a placement property of accounts and their content, recorded alongside the community placement ([International Transfers](/docs/compliance/gdpr#international-transfers)).

## Published Scale

Numbers from the platforms' own write-ups and filings (Reddit's engineering figures as reported by InfoQ and ByteByteGo), dated:

| Platform | Measure | Figure | When |
| --- | --- | --- | --- |
| Airbnb | Identity graph | About 7 billion nodes and 11 billion edges | As published |
| Discord | Messages stored | Trillions, across 72 ScyllaDB nodes after migrating from 177 Cassandra nodes | 2022 to 2023 |
| Discord | Migration throughput | 3.2 million messages a second; nine days instead of an estimated three months | 2022 |
| Discord | Search | 40 Elasticsearch clusters; median query from 500 ms to under 100 ms, p99 from 1 s to under 500 ms | 2025 |
| Discord | Voice | 2.6 million concurrent voice users on 850-plus voice servers in 13 regions and 30-plus data centers, about 220 Gbps egress | 2018 |
| Meta | Warm photo storage | f4 held over 65 PB and cut the effective replication factor from 3.6 to 2.8 or 2.1 | 2014 |
| Pinterest | Recommendation graph | 3 billion nodes and 17 billion edges in memory; 1,200 requests a second per server at 60 ms | 2017 |
| Reddit | Content | Over 2 billion posts and 22 billion comments to date; 4.4 billion posts and comments created in 2025 | 2025 |
| Reddit | Event log | Kafka with 500-plus brokers, over a petabyte live, tens of millions of messages a second | 2026 |
| Twitch | Live video | Average concurrent viewers over 2.5 million; hundreds of thousands of simultaneous streams ingested; nearly a hundred ingest points of presence | 2022 to 2023 |
| Twitch | Data | Almost 3 million analytics events a second; a data lake over 100 petabytes | 2023 |

The numbers are a guide to proportion, not targets: chat and events dominate write volume, media dominates bytes, and the graph systems (recommendation, identity) dominate memory.

## How to Build It

The chapter adds one table: where each community lives. Everything else in this chapter is placement and process around the tables other chapters own.

```sql
CREATE TABLE community_placements (      -- where a community's partitioned data lives
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id   UUID NOT NULL REFERENCES communities (id),
  cell           TEXT NOT NULL,          -- the shard, cluster or cell
  region         TEXT NOT NULL,          -- data residency and serving region
  tier           TEXT NOT NULL DEFAULT 'shared' CHECK (tier IN ('shared', 'dedicated')),
  valid_during   TSTZRANGE NOT NULL,     -- placements change; history stays
  move_state     TEXT CHECK (move_state IN ('copying', 'catching_up', 'cutover',
                   'complete', 'rolled_back')),
  EXCLUDE USING GIST (community_id WITH =, valid_during WITH &&)  -- one home at a time
);
```

Notes on the sketch:

- **Placement is data with history.** The router reads the open placement for a community (cached at the edge, invalidated on change), and history answers where the community's data was on a date, which a legal request or a residency audit may ask.
- **Dedicated tier for the biggest.** Promoting a community to `dedicated` is the "Big Freaking Guild" move as a data change, triggered by thresholds on members, messages or index size from [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it).
- **Moves are a state machine.** Copy, catch up from the event log, pause writes briefly, cut over, keep the old copy until reconciliation passes ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)).
- **Keys stay global.** Content, accounts and messages keep globally unique, time-ordered ids (`uuidv7()` here; Discord's Snowflakes are the same idea), so moving a community never renumbers anything and references across communities survive.
- **Events:** `community.placement_changed` goes through the outbox to routers, caches and search so traffic follows the move.

## What This Means for the System You Build

- **Partition by community** and record placement as data, with a dedicated tier for the communities that outgrow it.
- **Query across communities through derived stores** built from events, never by fanning out to every partition on a request.
- **Plan for skew:** coalesce identical reads, send only visible slices, bucket by time, and give the biggest communities their own indexes.
- **Treat deletes and purges as load,** and pick stores and settings that survive millions of tombstones.
- **Split services by the parts of the domain,** with moderation keeping its own evidence and compliance reading from snapshots.
- **Run media, moderation and video as pipelines** of retryable stages, with scanning before visibility.
- **Make the event log the spine,** with removals propagating to search, feeds and caches on a latency target.
- **Wrap every vendor in an adapter** with a latency budget, a failure mode and a record of the data it received.
- **Carry the jurisdiction on the request** and evaluate rules at serving time from cached, versioned data.
- **Migrate with live comparison:** shadow traffic, sister stores and reconciliation before cutover.

## References

**Engineering write-ups**

- [Discord: How Discord stores billions of messages](https://discord.com/blog/how-discord-stores-billions-of-messages), channel and time-bucket keys, Snowflake ids, tombstones, the edit and delete race
- [Discord: How Discord stores trillions of messages](https://discord.com/blog/how-discord-stores-trillions-of-messages), hot partitions, ScyllaDB, Rust data services, request coalescing, migration throughput, node counts and latencies
- [Discord: How Discord indexes trillions of messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages), cells, dedicated indices for the largest guilds, cluster counts and query latency
- [Discord: Using Rust to scale Elixir for 11 million concurrent users](https://discord.com/blog/using-rust-to-scale-elixir-for-11-million-concurrent-users), guild processes and member list slices
- [Discord: How Discord handles two and a half million concurrent voice users](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc), voice servers, regions and egress
- [Discord Developer Documentation: Gateway](https://docs.discord.com/developers/events/gateway), the shard formula
- [InfoQ: Reddit migrates comment backend from Python to Go](https://infoq.com/news/2025/11/reddit-comments-go-migration/), tap compare, three datastores, eighteen validation paths, latency, migration status (reported)
- [ByteByteGo: How Reddit migrated petabyte-scale Kafka](https://blog.bytebytego.com/p/how-reddit-migrated-petabyte-scale), broker count, data volume, message rate, zero-downtime move to Kubernetes (reported)
- [Pinterest: Pixie (arXiv)](https://arxiv.org/abs/1711.07601), graph size, request rate and latency
- [Twitch: Ingesting live video streams at global scale](https://blog.twitch.tv/en/2022/04/26/ingesting-live-video-streams-at-global-scale/), points of presence, origin routing and peak compute use
- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), concurrent viewers, simultaneous streams, Spade events per second, the data lake
- [Airbnb: Scaling Airbnb's identity graph](https://airbnb.tech/infrastructure/scaling-airbnbs-identity-graph-with-a-unified-knowledge-graph-infrastructure/), graph size and storage
- [USENIX: f4, Facebook's warm BLOB storage system](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar), capacity and replication factor
- [AT Protocol: Overview](https://atproto.com/guides/overview), personal data servers, relays, app views, feed generators and labelers

**Platform documentation and filings**

- [Amazon IVS: Chat service quotas](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/service-quotas.html), the 200 ms message review handler timeout
- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), posts and comments to date
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), posts and comments created in 2025 (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
