+++
title = "Federation & Open Protocols"
nav_title = "Federation & Protocols"
description = "ActivityPub and the AT Protocol: delivery and signatures, portability, local and stackable moderation, labelers, defederation, bridges and big platforms."
category = "User-Generated Platforms Industry"
order = 1811
part = "Communities and Conversation"
tags = ["user-generated-content", "federation", "activitypub", "at-protocol", "moderation"]
+++

A federated network is many operators running one conversation. A user on one server follows a user on another, replies to a third, and sees all of it in one timeline; no single company holds the accounts, the posts or the rules. The appeal is exit: if a server's owner changes the rules, sells out or shuts down, users can move, and nobody can switch the whole network off. The price is that everything a centralized platform does in one database (deliver, delete, moderate, verify) becomes a message between independent servers that may not answer, may not agree, and may not exist tomorrow.

Two protocols carry most of it. **ActivityPub**, a W3C Recommendation since January 23, 2018, is the protocol of Mastodon and the wider "fediverse," and of Threads' opt-in federation. **The AT Protocol** is Bluesky's: it separates where a user's data lives from the services that index, rank and moderate it, which makes portability and moderation composable rather than tied to a server. Bluesky grew from 25.94 million to 41.41 million users during 2025.

This chapter covers why platforms federate and what it costs, ActivityPub's delivery model and signatures, deletion across servers, moderation on the fediverse (local actions, domain blocks, shared blocklists) and its child-safety gap, the AT Protocol's architecture, labels and stackable moderation, account portability on both, large-platform federation and bridges, and the legal position of an instance operator. Handles, DIDs, domain handles and WebFinger are [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#handles-you-don-t-own-dids-and-domain-handles); custom feed ranking is [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline). It adds instances, domain blocks, remote actors, deliveries, labelers and label subscriptions to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model).

## How the Platforms Do It

| Network | Protocol | Unit of operation | Moderation | Portability |
| --- | --- | --- | --- | --- |
| **Mastodon and the fediverse** | ActivityPub | A server (instance) with its own users, rules and admins | Always local: each server acts on its own copy; domain blocks limit or suspend whole servers | Followers move to a new account; posts stay behind |
| **Bluesky** | AT Protocol | Separate services: data hosts (PDS), relays, AppViews, feed generators, labelers | Bluesky's own service by default, plus independent labelers each user chooses | The account (DID) and its signed repository move to a new host, even without the old host's help |
| **Threads** | ActivityPub, opt-in | Meta's servers | Meta's rules for its users; other servers decide about Threads | Not applicable |
| **Bridgy Fed** | A bridge between ActivityPub, the AT Protocol and the web | A bridge service | Opt-in per user | Not applicable |

The pattern: **federation moves the moderation question from "what does the platform allow?" to "whom does each operator trust?"** On the fediverse that trust is per server and per domain; on the AT Protocol it's per user, through the labelers and feeds they subscribe to, with the app's own service as a floor. Both designs keep the legal duties where hosting happens: whoever stores and serves content on their own infrastructure has the host's obligations for it.

## Why Federate, and What It Costs

What federation buys:

- **Exit.** Users can leave a server or host without leaving their audience.
- **Local rules.** A server for a profession, a language or a fandom can set rules that fit it, as communities do on a centralized platform, but with control over hosting too.
- **Resilience.** No single operator can shut the network down, sell it or change its rules for everyone.

What it costs:

- **Moderation is local.** Each server moderates its own users and its own copies; nothing makes another server remove anything.
- **Deletion is a request.** A deleted post is gone from its home server; copies elsewhere are removed only if those servers honor the delete.
- **Spam and abuse cross borders.** A new server can be stood up in minutes, so blocklists and reputation for servers become necessary.
- **Small operators carry big duties.** A volunteer running a server for a few thousand people has the same child-safety reporting duties and much of the same legal exposure as a platform, without the staff or tooling (below).

## ActivityPub

In ActivityPub, every user (and every group or service) is an **actor** with an **inbox** and an **outbox**. Posting is adding an activity (`Create`, `Like`, `Announce`, `Follow`, `Delete`, `Update`) to the outbox; federation is the server delivering that activity by HTTP POST to the inboxes of its recipients, resolved from the activity's `to`, `cc`, `bto`, `bcc` and `audience` fields, with the actor's **followers collection** as the default audience. Delivery is asynchronous with retries; `bto` and `bcc` are stripped before sending. A server can advertise a **shared inbox** so a sender delivers one copy per server for public and follower-addressed activities instead of one per follower, which is what makes a post to a hundred thousand followers on a few thousand servers tractable.

The specification doesn't define authentication; its non-normative appendix notes there are "no strongly agreed upon mechanisms." The de facto standard is **HTTP Signatures**: Mastodon signs server-to-server requests with the actor's key under the draft-cavage specification (RSA-SHA256 over the request target, host, date and, for POSTs, a body digest), the receiver fetches the key from the actor document and checks that its owner matches the actor, and requests older than twelve hours are rejected. Mastodon has supported the standardized RFC 9421 HTTP Message Signatures by default since version 4.5.0, and its optional secure mode requires signatures on GET requests too, so a blocked server can't fetch public posts anonymously.

The vocabulary is ActivityStreams 2.0, and the protocol is deliberately incomplete: features like quote posts have no formal specification, so implementations agree through **Fediverse Enhancement Proposals.** Threads represents quote posts with FEP-e232 object links and Misskey's `_misskey_quote` property for that reason.

### Deletion Across Servers

When a post is deleted, the home server sends a `Delete` to every server that may hold a copy; the specification says a receiving server should remove its copy and may replace it with a `Tombstone`, answering later requests with 410 Gone. "Should" is the operative word: servers that are down, slow, defederated or uncooperative keep their copies. A platform federating must say so in its privacy notice and in the delete flow ("this removes your post here and asks other servers to remove their copies"), keep a record of which servers were sent the delete, and treat erasure under GDPR as best effort beyond its own servers ([GDPR](/docs/compliance/gdpr#data-subject-rights)). The same holds for moderation removals: removing a remote user's post on your server removes your copy, not theirs.

## Moderation on the Fediverse

Mastodon's moderation documentation starts with the rule that defines the fediverse: "Moderation in Mastodon is always applied locally." An admin acts only on their own server's copy of an account. The tools:

- **Account actions:** mark an account's media as sensitive; **freeze** a local account (no use, content kept); **limit** an account so only its followers see it (on this server only); **suspend** it, removing it from public view with its data kept 30 days before permanent deletion.
- **Appeals:** since version 3.5.0, users are emailed moderation decisions and can submit one appeal within 20 days.
- **Domain blocks** act on whole servers: **reject media** (no files processed from it), **limit** (all its accounts limited, follows become requests), or **suspend** (nothing from it stored except usernames; existing follows removed). Suspending a domain is **defederation**.
- **Blocklists** can be exported and imported as CSV files, so admins share them.
- **Spam controls:** email domain and MX blocks on sign-up, IP and CIDR blocks.
- **Webhooks** on moderation events, so admins can automate and alert.

Shared blocklists are the fediverse's answer to bad servers: admins import lists curated by other admins or by groups, and a new server known for harassment or spam is cut off by many servers within days. They're also a governance problem: a list maintainer can disconnect a server from much of the network, lists rarely have appeal processes, and an error propagates as fast as a correct entry. A platform importing blocklists should record which list each block came from, review imports rather than applying them blindly, and give blocked servers a way to ask for review.

### The Child-Safety Gap

The Stanford Internet Observatory's July 2023 study of child safety on federated social media shows what small operators lack. Out of about 325,000 posts analyzed over two days, it detected 112 instances of known child sexual abuse material and 554 further pieces of content flagged as highly likely sexually explicit in posts that also used hashtags or keywords common in exploitation communities. It found that Mastodon had no default mechanism for integrating with PhotoDNA or other perceptual hashing, making proactive detection of known material impossible without local modifications by each administrator, and that tens of thousands of servers each sending identical images to a hashing service is not a use case such services were built for. Its recommendations included built-in PhotoDNA support and CyberTipline reporting for server software.

For anyone running or building federated software the lesson is concrete: hash matching on uploaded and federated media, a reporting path to NCMEC for US operators, and preservation of evidence are not optional features of a large platform; they're duties of every host ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty)). Software that federates media should make them a configuration step, not a fork.

## The AT Protocol

The AT Protocol splits the jobs a social network does into separately operated services:

- **Personal Data Server (PDS):** hosts a user's **repository** of signed records (posts, likes, follows, profile) and manages their identity.
- **Relay:** collects updates from many PDSes into one combined stream, the **firehose**.
- **AppView:** indexes the network from the firehose and serves the aggregated views apps need: threads, counts of likes and reposts, follower lists, search.
- **Feed generators:** independent services that return a ranked list of post identifiers; the AppView hydrates them into full posts, and the requester's identity reaches the generator in a signed token. A feed is published as a record, so anyone can build one and users subscribe to it like an account ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations)).
- **Labelers:** independent services that attach labels to accounts and records.
- **Lexicons:** shared schemas (`com.atproto.*` for repository sync, `app.bsky.*` for the social app) that let independent services agree on record and API shapes.

Identity is a **DID**, a permanent identifier whose document names the account's current PDS and holds its keys: a signing key that validates the repository and rotation keys that authorize changes to the document. The PLC method supports rotation keys; `did:web` doesn't. The **handle** is a domain name layered on the DID.

![A map of separately operated services. Three personal data servers, each holding a signed repository (an account's DID names its PDS), feed a relay, the firehose. The relay is indexed by an app view that serves threads, counts and search, and the app view sends views to the app, which applies the user's choices. Above the app view, a feed generator that anyone can run sends ranked post identifiers. Below it, an accented labeler sends signed labels both to the app view and to the app, which uses them to hide, blur or warn. A footer says the app's own moderation service is always subscribed and others are added like accounts.](/diagrams/ugp-federation-at-services.svg "On the AT Protocol, hosting, aggregation, ranking and moderation are separate services. Bluesky runs its own of each, and anyone can run another.")

### Portability

Portability is where the two protocols differ most:

- **On the AT Protocol,** because a user can hold rotation keys, they can repoint their DID to a new PDS without the old host's cooperation, and restore their repository from a backup kept on their device or by a third party. The account, its posts and its followers move together.
- **On Mastodon,** a move redirects followers: the user creates an alias on the new account, starts the move from the old one, and followers are switched over; the old account becomes inaccessible, there's a 30-day cooldown before moving again, and posts and media stay behind (an ActivityStreams archive can be downloaded once every seven days but not imported). Follows, blocks, mutes and bookmarks move by CSV export and import.

For a platform, portability is a promise about its data model: content keyed to a permanent identifier that isn't the platform's own database id, signed so another host can serve it, and exportable in a format another server can import. [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#ending-a-feature-or-a-service) covers what happens when a server or service ends.

### Labels and Stackable Moderation

Bluesky's model, announced March 12, 2024, makes moderation a set of services users subscribe to. Every user is subscribed to Bluesky's own moderation service by default (staff review of reports plus automated systems, enforcing the guidelines for content shown in Bluesky's app); users can add independent labelers, as they would follow an account, and configure what each label does for them (hide, blur or warn, for example). Labelers can accept reports through the app's reporting flow, and Ozone, Bluesky's tool for collaborative review and labeling, is open source.

The label format is specified. A label has a source (the labeler's DID), a subject (a record's URI or an account's DID, optionally pinned to a specific version by content hash), a value of up to 128 bytes, a creation time, an optional expiry and a signature checked against the labeler's published key. Values are short lowercase tokens; system values carry a `!` prefix, such as `!warn`, `!takedown` and `!suspend`. A label is **retracted by negation:** the labeler publishes the same source, subject and value with `neg` set, and clients stop applying it. Records can carry **self-labels**, set by the author, whose authenticity comes from the repository's signature. Labels are distributed by a WebSocket stream with backfill and by a query endpoint, and a client tells the AppView which labelers' labels to apply with an `atproto-accept-labelers` header, where a `redact` parameter asks for content labeled `!takedown` or `!suspend` to be removed entirely rather than just labeled.

Bluesky's 2025 transparency report gives the scale: 9.97 million reports from 1.24 million users, 16.49 million labels applied, account takedowns rising from 1.02 million to 2.08 million, and 1,470 legal requests.

The design lessons:

- **Separate judging from enforcing.** A label is a claim by a named source; what happens because of it is decided by the app and the user. That lets several moderation opinions coexist and lets users opt into stricter (or differently focused) moderation without the platform adopting it.
- **A floor still exists.** The app's own moderation service is mandatory in its app, because legal duties (illegal content, child safety) don't depend on a user's subscriptions.
- **Sign and version labels.** A label pinned to a record version and signed by its source can be verified by anyone and can't be silently altered.
- **Negate, don't delete.** Retraction as a new signed statement keeps the history auditable.

## Large Platforms Joining

Meta's Threads began opt-in federation in March 2024: users 18 or older with public profiles could choose to federate their posts; posts with restricted replies, replies to non-federated posts, polls and reposts of non-federated posts didn't federate; and replies from the fediverse were viewable on the other server rather than in Threads. Meta described a phased rollout without fixed milestones and the difficulty of features ActivityPub doesn't specify.

A large platform joining changes the network's moderation math. Every fediverse server has to decide whether to federate with a platform whose users outnumber it and whose policies it doesn't set; a large platform has to decide which servers to reach, what to do with content arriving from servers it would never host, and how its own rules apply to replies from people who never agreed to its terms. The consent questions are sharper for bridges: **Bridgy Fed**, which bridges ActivityPub, the AT Protocol and the web, is opt-in, with bridging off until a user enables it (by following the bridge account or logging in) and off again when they block it, after which the bridged profile is deactivated though cached copies elsewhere may linger.

Tumblr's owner Automattic planned to move Tumblr onto WordPress infrastructure, which would have made it a federated app, and in July 2025 put the migration on hold indefinitely, with its CEO calling it an infrastructure project and saying fediverse support would be built on Tumblr's existing code if it became a priority again. Federation for an existing platform is a migration of its data model as much as a protocol feature.

## The Operator's Legal Position

Federation doesn't remove legal duties; it multiplies the parties who carry them. Each server operator stores and serves content on its own infrastructure, which makes it a host for that content under the EU Digital Services Act and an electronic service provider for US reporting purposes, with notice-and-action, child-safety reporting and, in the UK, Online Safety Act duties scaled to the service. Small operators may benefit from the size-based exemptions and proportionality those regimes include, not from being federated. The details are [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#dsa-hosting-liability) and [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-uk-online-safety-act).

Two practical consequences for anyone building federated software or joining a federation as a platform:

- **Remote content is still served by you.** A post fetched from another server and shown to your users is content you host and serve, subject to your notice-and-action process; domain blocks and media rejection are your controls.
- **Record what crossed the border.** Which remote actor sent what, when, through which delivery, and what you did with it (accepted, rejected, removed) are the records a takedown notice, a law enforcement request or a regulator's question will need.

## How to Build It

The chapter's additions to the core model, for a platform that runs a federated server or joins a federation:

```sql
CREATE TABLE instances (                 -- remote servers and services seen so far
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  domain        TEXT NOT NULL UNIQUE,
  protocol      TEXT NOT NULL CHECK (protocol IN ('activitypub', 'atproto', 'bridge')),
  software      TEXT,                    -- from NodeInfo or similar, if published
  shared_inbox  TEXT,
  status        TEXT NOT NULL CHECK (status IN ('active', 'unreachable', 'gone')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ,
  failure_count INT NOT NULL DEFAULT 0
);

CREATE TABLE domain_blocks (             -- this server's policy toward a whole server
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  instance_id   UUID NOT NULL REFERENCES instances (id),
  severity      TEXT NOT NULL CHECK (severity IN ('reject_media', 'limit', 'suspend')),
  reject_reports BOOLEAN NOT NULL DEFAULT FALSE,
  public_reason TEXT,                    -- shown on the public list of moderated servers
  private_note  TEXT,
  source        TEXT NOT NULL CHECK (source IN ('admin', 'imported_list')),
  source_list   TEXT,                    -- which shared blocklist, and its version
  moderation_case_id UUID REFERENCES moderation_cases (id),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (instance_id WITH =, valid_during WITH &&)
);

CREATE TABLE remote_actors (             -- remote users seen, mirrored as accounts
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL UNIQUE REFERENCES accounts (id),  -- local shadow account
  instance_id   UUID NOT NULL REFERENCES instances (id),
  actor_uri     TEXT NOT NULL UNIQUE,    -- ActivityPub actor id, or the DID
  inbox         TEXT,
  public_key    TEXT,                    -- for verifying signatures
  key_fetched_at TIMESTAMPTZ,
  moved_to_uri  TEXT,                    -- after a Move
  last_fetched_at TIMESTAMPTZ
);

CREATE TABLE federation_deliveries (     -- what was sent, to whom, and whether it landed
  id            UUID NOT NULL DEFAULT uuidv7(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity_type TEXT NOT NULL,           -- 'Create', 'Update', 'Delete', 'Announce', ...
  activity_uri  TEXT NOT NULL,
  subject_type  TEXT NOT NULL,           -- 'content_item', 'account', ...
  subject_id    UUID NOT NULL,
  instance_id   UUID NOT NULL REFERENCES instances (id),
  target_inbox  TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('queued', 'delivered', 'failed',
                  'abandoned', 'skipped_blocked')),
  attempts      INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  last_status_code INT,
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE TABLE labelers (                  -- label sources that can be applied
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  did            TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  signing_key    TEXT NOT NULL,          -- the published #atproto_label key, refreshed
  is_platform_default BOOLEAN NOT NULL DEFAULT FALSE,  -- the mandatory floor
  label_values   JSONB NOT NULL,         -- values it defines, with default behaviors
  status         TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'retired'))
);

CREATE TABLE label_subscriptions (       -- which labelers each user applies, and how
  account_id    UUID NOT NULL REFERENCES accounts (id),
  labeler_id    UUID NOT NULL REFERENCES labelers (id),
  preferences   JSONB NOT NULL DEFAULT '{}',  -- per value: 'hide', 'warn', 'show'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, labeler_id)
);

ALTER TABLE content_labels
  ADD COLUMN labeler_id UUID REFERENCES labelers (id),
  ADD COLUMN signature  BYTEA,           -- as received, for verification
  ADD COLUMN expires_at TIMESTAMPTZ,
  ADD CONSTRAINT content_labels_labeler
    CHECK ((source = 'labeler') = (labeler_id IS NOT NULL));

ALTER TABLE communities
  DROP CONSTRAINT communities_kind_check,
  ADD CONSTRAINT communities_kind_check CHECK (kind IN ('forum', 'server', 'channel',
    'group', 'instance'));               -- the local server as a community
```

Notes on the sketch:

- **Remote users are shadow accounts.** A remote actor gets an `accounts` row (no login, status `active`) so posts, follows, reports, blocks and penalties reference one kind of account; `remote_actors` holds what makes it remote. The account's `did` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it) carries AT Protocol identities.
- **Remote content is local content with an origin.** A federated post is a `content_items` row with its remote URI stored beside it and its media fetched as `media_assets`, so it passes through the same scanning, hashing, reporting and removal pipeline as anything uploaded locally; `reject_media` and `suspend` stop it at the door.
- **Deliveries are a log and a queue.** Each activity fans out to one row per target inbox (one per shared inbox where available), retried with backoff; `skipped_blocked` records deliveries withheld because of a domain block. Deletes and account deletions are delivered with the same retries and kept as proof that they were sent ([Background Jobs](/docs/architecture/background-jobs)).
- **Signatures are verified and keys cached** with expiry; a key rotation or a `Move` updates `remote_actors`, and verification failures are counted per instance as an abuse signal.
- **Domain blocks are ranges with sources.** Imported list entries say which list and version they came from; lifting a block closes its range.
- **Labels from labelers are rows in `content_labels`** with the signature as received; the read path applies the platform default labeler's labels to everyone and each user's subscriptions on top, and never applies a label whose signature doesn't verify.
- **Feed generators** are `feed_definitions` rows of kind `external_generator` ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#how-to-build-it)).
- **Events:** `federation.activity_received`, `federation.delivery_failed`, `instance.blocked`, `instance.unblocked`, `remote_actor.moved`, `label.received` and `label.negated` go to moderation, search, feeds and the transparency counts ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every domain block and its source,** with reasons, the case behind it and its time range, because a blocked server will ask why and when.
- **What arrived from where:** inbound activities by remote actor and instance, and what moderation did with them, for notices, legal requests and child-safety reports.
- **Deletes and account deletions sent,** per target server, as the record of best-effort erasure.
- **Labels received and applied,** with signatures, labeler versions and negations.
- **Signature verification failures** per instance, as a security and abuse signal ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Decide early whether you federate,** because it changes deletion, moderation and legal promises, not just the API.
- **Key content to permanent, portable identifiers** and sign what you publish.
- **Verify every inbound request's signature,** cache keys with expiry, and consider requiring signed fetches.
- **Run remote content through your own pipeline:** scanning, hashing, reporting and removal apply to everything you serve.
- **Treat deletion as best effort beyond your servers,** say so to users, and log every delete you send.
- **Make domain blocks ranges with sources and reasons,** review imported blocklists, and offer a review path.
- **Separate labels from enforcement:** signed, versioned labels from named sources, applied by user choice above a mandatory platform floor.
- **Make bridging and federation opt-in** per user where users didn't choose the protocol.
- **Ship child-safety tooling as configuration** in federated software: hash matching, reporting and preservation.

## References

**Specifications**

- [W3C: ActivityPub](https://www.w3.org/TR/activitypub/), actors, inboxes and outboxes, addressing, shared inboxes, Delete and Tombstone, and the non-normative note on authentication (Recommendation, January 23, 2018)
- [AT Protocol: Overview](https://atproto.com/guides/overview), PDS, relays and the firehose, AppViews, feed generators, labelers, DIDs with signing and rotation keys, handles, lexicons and account migration
- [AT Protocol: Labels](https://atproto.com/specs/label), label fields, values, self-labels, negation, signatures, distribution endpoints and the accept-labelers header

**Reference**

- [Mastodon: Security](https://docs.joinmastodon.org/spec/security/), HTTP Signatures under draft-cavage, key retrieval, digests and freshness, RFC 9421 support from 4.5.0, and secure mode
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), local moderation, account actions, the 30-day purge, appeals within 20 days, domain blocks, CSV blocklists, sign-up and IP blocks, webhooks
- [Mastodon: Moving or leaving accounts](https://docs.joinmastodon.org/user/moving/), aliases, follower redirection, the 30-day cooldown, posts left behind, archive and CSV exports
- [Bluesky: Custom feeds](https://bsky.network/docs/starter-templates/custom-feeds), feed skeletons, hydration, generator records and the requester's identity
- [Bridgy Fed: Docs](https://fed.brid.gy/docs), bridging between the fediverse, Bluesky and the web, opt-in and opt-out

**In practice**

- [Bluesky: Stackable moderation](https://bsky.social/about/blog/03-12-2024-stackable-moderation), the default moderation service, independent labelers, configurable label effects, reports to labelers and open-source Ozone (March 12, 2024)
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), user growth, reports, labels, takedowns and legal requests
- [Meta Engineering: Threads has entered the fediverse](https://engineering.fb.com/2024/03/21/networking-traffic/threads-has-entered-the-Fediverse/), opt-in conditions, what doesn't federate, quote posts through FEP-e232 (March 21, 2024)
- [Thiel and DiResta: Child Safety on Federated Social Media (Stanford Internet Observatory, 2023)](https://purl.stanford.edu/vb515nd6874), known material detected in a two-day sample, the lack of default hash matching, and recommendations for PhotoDNA and CyberTipline integration
- [TechCrunch: Automattic puts Tumblr migration to WordPress on hold](https://techcrunch.com/2025/07/01/automattic-puts-tumblr-migration-to-wordpress-on-hold/), the paused move that would have federated Tumblr
