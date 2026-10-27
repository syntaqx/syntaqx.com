+++
title = "Parties, Presence, Chat & Voice"
nav_title = "Parties, Presence & Chat"
description = "The social layer of an online game: friends and blocks, presence and its fan-out, parties and invites, chat, server push, voice, platform rules and privacy."
category = "Gaming Industry"
order = 1612
part = "Multiplayer"
tags = ["gaming", "social", "presence", "chat", "voice", "parties", "xmpp"]
+++

Players come back to a game because their friends are in it. The social layer is what makes that true: a friends list that shows who is online and what they're doing, an invite that drops a friend into a party, a party that queues together, chat before, during and after a match, and voice once the match starts. None of it is gameplay, and all of it is load: the social tier is connected to every player who is online, not only the ones in a match, and it carries the most personal data in the game (who knows whom, who is online when, and what they said).

This chapter covers the social graph, presence and its fan-out, parties and invites, chat, server push, voice, cross-platform social and the platform rules around it, privacy, moderation hooks and scale. How a party becomes a matchmaking ticket is in [Matchmaking & Ranked](/books/gaming/matchmaking). Accounts and linked platform identities are in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity). What happens to a report about a message is in [Player Behavior & Moderation](/books/gaming/player-behavior) and, for the general system, [Trust & Safety](/docs/security/trust-and-safety).

## The Social Graph

The graph has three edge types, and they behave differently:

- **Friendship** is mutual and consented: one player requests, the other accepts. It's stored once per pair and read in both directions. A pending request is its own record with an expiry, so a request nobody answers doesn't sit forever.
- **Block** is one-directional and needs no consent: the blocker decides alone, and the blocked player is not told. A block overrides everything else in the graph. It removes a friendship if one exists, hides presence both ways, stops whispers and invites, mutes voice and text in shared channels, and, where the game allows it, keeps the two out of each other's matches.
- **Recent players** (people you just played with) is an implicit edge the game derives from matches. It's what the report and friend-request buttons after a match work from, and it expires.

Where the graph lives is a product decision with long consequences. A publisher with several games usually wants one friends list across them, so the edges hang off the account, not the per-game profile ([The Games Business](/books/gaming/games-business#the-core-data-model)). Riot's 2015 chat architecture posts show how much else the graph ends up doing: the chat servers exposed the social graph over an internal REST interface used for checking how long two players had been friends before allowing in-store gifting (a defense against compromised accounts), suggesting friends of friends for Team Builder, and looking at a new player's friends to choose a starting league seed. Plan for the graph to become a shared service that other systems query, with the access control that implies.

Blocks need two details right. Store them with the blocker's account and enforce them in every service that connects two players, not only in chat. And make edits incremental: Riot's protocol post describes extending XMPP because the standard privacy-list extension (XEP-0016) only offers get and set of the whole list, so "we can't modify the existing privacy list by just adding or removing an item"; Riot added incremental add and remove commands. A client that rewrites a whole block list on every change will eventually lose an entry to a race.

## Presence

Presence is what the friends list shows about each friend: online or offline, and if online, what they're doing (in the menus, in a queue, in a match of a given mode, in a party of three with two open slots, joinable or not). It's the most-read and most-written data in the social tier, and almost none of it is worth storing durably.

A presence record has two parts. **Availability** is the coarse state the protocol carries; in XMPP, Riot's chat protocol, a client announces itself with `<presence type='available'/>`. **Rich presence** is the game-specific detail. Steam's enhanced rich presence is a public example of its shape: the game sets a `steam_display` key to a localization token (so friends see the status in their own language), and sets `steam_player_group` and `steam_player_group_size` so that "friends who are in a party, server, or match together will be grouped under the game category." Keep rich presence small, typed and localized by token, never free text from the game client, which is both a moderation surface and a way to leak information.

Presence is derived, not declared. A player is online while at least one of their sessions holds a live connection to the social tier; it's the union over devices (a PC client and a phone app at once is normal). Each session heartbeats over its connection; a missed heartbeat window marks the session gone, and when the last session goes the player goes offline. Presence state therefore belongs in memory or a fast store with expiry, keyed by account and session, and rebuilt from live connections after a restart, not loaded from a database.

### Fan-Out

When a player's presence changes, every online friend who may see it must be told. That's a fan-out, and its cost is what sizes the presence tier.

![A dimensional sheet in two plan views, all values illustrative. View A draws one player's friends list of 120 as a strip: 25 online friends who will be told, 5 online friends filtered out by privacy, appear-offline or blocks, and 90 offline friends, so 30 are online. View B follows one status change through four stages: the status change, a privacy filter that drops 5 of the 30, a session router that finds 25 recipients with 1.2 sessions each, and edge sockets that deliver 30 pushes. A formula multiplies 1,000,000 concurrent players by 6 changes per player-hour and 30 pushes per change, divided by 3600, for 50,000 pushes per second. A variable table defines each code.](/diagrams/gm-social-systems-presence-fanout.svg "Fan-out cost is concurrency times change rate times online recipients; the change rate is the term you control.")

The sheet's lesson is in the formula: pushes per second grow with concurrent players, changes per player and online recipients per change, and the last two are design choices. The levers, in the order I reach for them:

- **Coalesce changes.** A player moving from menu to queue to champion select to loading to in-game in thirty seconds produces five changes; nobody's friends list needs all five. Merge changes inside a short window per player and send the latest state. This cuts the change rate without changing what anyone sees.
- **Push only what the viewer shows.** A friends list that is closed doesn't need rich presence detail; send availability changes always and detail only to clients that have the list open or have subscribed to that friend.
- **Cap the list.** A maximum friends-list size bounds the worst case of a single change. Pick it from the distribution of real list sizes, not from a round number.
- **Route by session, not by broadcast.** A routing layer that knows which edge node holds each session (Riot's messaging service, below, is built exactly this way) sends one message per recipient session instead of asking every node.

### Privacy: Who Can See Presence

Presence tells people when someone is awake, where they are in the world (region and server) and who they play with. Treat it as personal data, with settings the player controls:

- **Visibility:** friends only (my default), everyone, or nobody. "Everyone" should be opt-in, never the default.
- **Appear offline,** which keeps the player able to play and chat with chosen people while their presence is hidden from everyone else. It must be enforced at the fan-out, server-side; a client that receives the real state and hides it has leaked it.
- **Detail level:** online only, or online plus what they're doing.
- **Blocks hide presence both ways,** and a blocked player's client must not be able to infer presence from other signals (an invite that fails differently for online and offline players leaks it).

Defaults for young players are not a style choice. The FTC's December 2022 order against Epic Games followed allegations that Fortnite enabled "real-time voice and text chat communications for children and teens by default," and required that voice and text communications be "turned off by default" for them unless consent is given. Roblox's January 2026 change requires an age check to chat and lets age groups chat with their own and adjacent groups by default. Build visibility and communication settings so their defaults can differ by age band and region, as configuration ([Ratings, Age & Children](/books/gaming/ratings-and-age); [GDPR](/docs/compliance/gdpr#privacy-by-design-and-by-default)).

## Parties and Invites

A party is a small group that moves through the game together: it forms in the menus, queues as one ticket, plays in the same match (often on the same team), and stays together between matches. The core model has a `parties` table with a leader; this chapter adds members and invites.

The party's life cycle:

| State | Meaning | Ends when |
| --- | --- | --- |
| `open` | Formed, in the menus; members can invite and leave | Leader starts a queue, or the party disbands |
| `queued` | A matchmaking ticket exists for the whole party | Match found, ticket cancelled, or a member leaves (which cancels the ticket) |
| `in_match` | Members were assigned to a match together | Match ends; the party returns to `open` |
| `disbanded` | Last member left or the party expired | Terminal |

Rules that keep it consistent:

- **One party per player per game,** enforced by the party service; joining a new party leaves the old one.
- **The leader starts the queue,** and the party service checks every member before creating the ticket: online, on the current build, owns the mode, no queue or ranked restriction, within the mode's rank spread. VALORANT's published flow is this pattern, with the rank check delegated to the ratings service ([Parties](/books/gaming/matchmaking#parties)).
- **Any change while queued cancels the ticket.** A member who leaves or joins changes the ticket's ratings and size; cancel and let the leader requeue rather than mutate a ticket the matchmaker is considering.
- **Leadership passes on leave,** by join order, so a party never has no leader.
- **Disconnects are not leaves.** A member whose session drops gets a grace period before removal, so a client crash doesn't dissolve the party.

**Invites** are records with a sender, a recipient, a party and an expiry. They respect the graph (blocked players can't invite each other) and the recipient's settings (friends only, or anyone with a join code). A deep link or join code lets players invite friends outside the game: Discord's Social SDK announcement describes invites from the in-game friends list that "drop them into the exact party/lobby/session." An invite to a full party, a party that has since queued, or one the recipient can't join (wrong build, region, age setting) should fail with a reason the client can show.

## Chat

Chat has channels with different audiences and rules:

| Channel | Audience | Lifetime | Notes |
| --- | --- | --- | --- |
| Whisper | Two friends | Persistent, with offline delivery | Blocks apply; the most sensitive content |
| Party | Party members | The party's life | League added party-only chat in 2023 |
| Team | One team in a match | The match | Usually hosted with the match, not the social tier |
| All | Everyone in a match | The match | Often off or filtered by default |
| Group or club | Opt-in members | Persistent | Needs owners, roles and moderation tools |

### Protocol: XMPP, or Your Own

Riot's 2015 "Chat Service Architecture" series is the most detailed public account of a game chat system, and it starts with the choice of protocol. The team weighed support for one-to-one, group and offline messages, built-in presence, open specifications, a proven security model, extensibility and available open-source projects, and concluded "XMPP best satisfied all of the above factors." XMPP is an XML protocol for messaging and presence (RFCs 6120, 6121 and 6122) with a roster (the friends list), presence stanzas and message stanzas. Riot extends it through internal "RXEP" proposals; one adds a private note to each friend, "only visible to the contact owner," encrypted at rest with AES-CTR-128 and signed with HMAC-SHA1.

The servers, per the second post: "We write Riot chat servers primarily in Erlang," with about 10% C for low-level work such as XML parsing and TLS. Each regional shard ran one cluster of six to twelve servers, every node autonomous and replaceable, sharing only "a few internal key-value tables that are fully replicated in-memory" (through Mnesia) that map players and group chats to the processes handling their sessions. Undelivered messages went to MySQL in legacy environments and Riak in new shards. Rewriting the session handling cut memory from over 150 kB per player session to 25 kB.

The alternative is a custom protocol over a WebSocket or the game's own connection: JSON or binary frames, your own channel model, no XML. It's less to learn and easier to shape around the game, and you write the parts XMPP gives you (rosters, presence semantics, offline delivery, extensions). My default for a new game is the custom route on a connection the client already holds, with the channel and presence semantics above written down as a protocol spec; XMPP earns its place when you want existing servers, federation or third-party clients.

### Messages, Storage and Retention

- **Match chat** is ephemeral by design: delivered to the match's participants, logged for moderation, and kept only as long as policy says.
- **Whispers and group chat** need offline delivery and history, which means durable storage with a retention period, not forever.
- **Every message gets a server-assigned id and timestamp,** so moderation, reports and deletion refer to the same record the recipient saw.
- **Retention is per channel type and per outcome.** VALORANT's voice evaluation post is a published example of outcome-based retention for voice: recordings are kept 24 hours, 7 days if reported, and up to 2 years if a penalty was applied (up to 7 years in Brazil). Text deserves the same treatment ([Data Retention](/docs/architecture/data-retention#retention-windows)).

### Filtering and Moderation Hooks

Chat is where most player-to-player harm happens, so the moderation hooks belong in the chat path, not bolted on afterwards:

- **Filter before delivery.** The filter sits in the delivery path, after the sender submits and before fan-out, and fails closed: a message the filter couldn't check isn't broadcast. What the filter detects and how it escalates is in [Player Behavior & Moderation](/books/gaming/player-behavior#text-chat).
- **Player-side tools:** mute, block, deafen-all and leave-channel work instantly and locally, before any review. League added self-mute and deafen-all commands in the same 2023 update.
- **Report from the message.** A report names the message ids, so the reviewer sees exactly what was said, in context, from the server's record rather than a screenshot.
- **Restrictions are enforced by the chat service.** A chat restriction from the core model's `penalties` table blocks sending (and, by policy, joining voice) for its duration; the client is told, and every server checks.

The review queues, penalties, appeals and transparency reporting are the general system in [Trust & Safety](/docs/security/trust-and-safety); the game-specific detection and penalty ladders are in [Player Behavior & Moderation](/books/gaming/player-behavior).

## Server Push

Presence and chat need a connection from the client to the social tier, and so does everything else that changes while the player is looking: a friend request, a party invite, a store refresh, a match found. Riot's "Riot Messaging Service" post (February 28, 2017) describes the general tool it built for this, "a backend service that allows other services to publish messages and enables clients to receive them." Its design has two layers:

- **Edge (RMSE):** "a collection of independent servers responsible for hosting player client connections." Clients connect over an encrypted WebSocket after authentication, and the connection lasts the session. Edge servers don't know about each other, so they scale linearly.
- **Routing (RMSR):** a clustered layer with "a global view of all client sessions across all RMSE servers," mapping each player to the edge node holding their session and routing published messages there.

RMS is written entirely in Erlang, packaged in Docker and deployed to AWS with Terraform. In load tests a single r3.8xlarge edge machine handled "at least 10M concurrent connections," with about 15 ms end to end from publish to receive; on a dropped connection, messages for the affected players are cached in memory and delivered on reconnect. The motivating example was League's Clubs: instead of every client polling the Clubs service every few seconds, the service publishes a change and members' clients refresh.

That split (independent edges holding sockets, a routing layer that knows where each session is, any backend service able to publish) is the general shape in [Realtime Connections](/docs/architecture/realtime-connections#edge-and-routing), which also covers authenticating on connect, heartbeats, catch-up and reconnect storms; the game twist is that one connection carries the whole social tier for the length of a session, so it's the shape I'd build that tier's connection layer on. Presence fan-out, chat delivery, invites and notifications all become publishes to a set of players; the routing layer turns them into deliveries. Messages that must survive a player being offline (a friend request, a gift) belong in a durable store with the push as a hint to refresh, and anything that must reach a player who isn't connected at all goes through [Notifications](/docs/architecture/notifications#push-notifications) instead.

## Voice

Voice is the hardest social feature to build and the easiest to buy, so most games buy it. The vendors, as documented:

- **Vivox,** acquired by Unity in January 2019 when, per TechCrunch, it powered chat "from Fortnite to PUBG to League of Legends," is now part of Unity Gaming Services as "Vivox Voice & Text Chat." Its channel model is a useful vocabulary: **echo** channels for microphone and connectivity tests, **non-positional** (2D) channels "for level-wide audio and text," used for teams, squads and party chat, and **positional** (3D) channels where voices attenuate and pan with distance and direction. A client can join only one positional channel at a time, and should join it before any non-positional ones; large 3D channels support up to 2,000 participants.
- **Discord Social SDK,** announced March 17, 2025, at no cost and usable "with or without a Discord account": a unified friends list, deep-link invites and rich presence at launch, with cross-platform messaging, linked channels and voice chat in closed beta. On August 13, 2025 the communication features (voice, lobbies and direct messages, linked channels) left closed beta and became available to all developers. As of October 2026 its compatibility page lists Windows, macOS, Android, iOS, Xbox Series X|S and PlayStation 5 as generally available, Linux, Xbox One and PS4 as experimental, and no Nintendo platform; console use needs the platform holder's approval, and on PlayStation account linking and linked channels aren't allowed.
- **Epic Online Services** Voice, with text chat, used through EOS Lobbies or your own trusted server.
- **PlayFab Party,** peer-to-peer voice and chat with transcription and translation across "more than 30 different languages."

Whichever vendor, the integration has the same three parts:

1. **Your server authorizes, the vendor carries audio.** Vivox's model is typical: "modify your game server to provide your game client with Vivox access tokens," which are "required when a game client wants to sign in or join a channel," and the server signs them with a shared secret. Its example join token names the action (`"vxa":"join"`), the user, the target channel and an expiry. The token is where your rules apply: only the match's team can get a token for the team channel, a chat-restricted player gets none, and a blocked pair's mute is applied when either joins.
2. **Channels map to your objects.** A party channel per party, a team channel per match team, a positional channel per match. Name channels from your ids, create them when the object is created, and revoke membership when it ends.
3. **Moderation spans both.** Voice reports need evidence, and evidence means recording, which means consent and retention rules. VALORANT's voice evaluation is a published example: an in-client notice, depending on region, that lets players opt out of being recorded, and the retention periods above. Decide before launch whether you record, where, for how long and who can listen, and write it in the privacy notice.

Build voice yourself only if voice is the product. WebRTC gives you the media stack; you still own selective forwarding servers, regions, echo cancellation tuning, positional mixing, the moderation pipeline and the cost of bandwidth.

## Cross-Platform Social and Platform Rules

On PC, a game can run its own social graph or use the platform's. On consoles, the platform already has one (friends, presence, parties, invites), and the console's own UI is how players expect to invite each other. Console platform services are documented under NDA; publicly, Microsoft describes Xbox services as "micro-services that expose features such as profile, friends and presence," reached through REST endpoints and secure WebSockets.

Cross-platform play forces a design choice: whose friends list does the player see? The usual answer is both, merged. Epic Online Services splits its offering along this line: Game Services sign in through any supported identity provider without an Epic account, while Epic Account Services need an Epic account and provide friends, presence, a Social Overlay and crossplay "with a combined friends list." Discord's Social SDK takes the same approach from the other side, showing Discord friends in game and game friends in Discord. A merged list needs:

- **A friend entry per edge source:** in-game friend, platform friend, or both, with the platform's id kept per entry so the platform's own invite can be used when both players are on it.
- **Platform rules first.** Platforms set requirements for how their friends, presence, invites, user-generated content and communication settings are honored; a console's parental controls and communication settings must govern your chat and voice for that player, even when talking to someone on another platform. These requirements come from the platform agreements, which are not public; read them before designing the merged list.
- **The strictest setting wins.** When a player's platform blocks communication with a user, or a parent has disabled chat, your service applies it across platforms.

Platform economics can reach the social layer too: cross-play itself has carried revenue terms on at least one console ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#cross-play-cross-progression-and-cross-purchase) has the court record), which is a reason to involve business development before promising cross-platform parties. Who may be in a session together at all is decided from every member's platform privileges, in the same chapter.

## Scale

The social tier is sized by online players and their connections, not by matches. The published reference points:

- **Riot chat (2015):** "a billion events" routed per day (presences, messages and IQ stanzas), 1.7 million new friendships formed on one July day, clusters of six to twelve servers per regional shard with no degradation in load tests to at least 30 servers, 25 kB of memory per session after optimization, and five nines of uptime across Riot's regions that year. The protocol post refers to a talk titled "Scaling LoL Chat to 70 Million Players."
- **Riot Messaging Service (2017 load test):** at least 10 million concurrent connections on one edge machine, about 15 ms publish to receive.

Two consequences follow. Connection count, not message rate, is usually the first limit: memory per idle session decides how many players an edge node holds, which is why Riot's 150 kB to 25 kB reduction mattered. And launches and patch days reconnect everyone at once; the presence tier sees every player come online within minutes, each one triggering a fan-out to friends who are also reconnecting. Stagger reconnects with jittered backoff in the client, rate-limit logins at the edge, and size for the reconnect storm, not the steady state ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter)).

## How to Build It

The durable parts extend the core model ([The Games Business](/books/gaming/games-business#the-core-data-model)); presence and sessions stay out of the database. The graph hangs off accounts, so one list covers a publisher's games.

```sql
ALTER TABLE parties                         -- the state machine above, persisted for history
  ADD COLUMN status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'queued',
                      'in_match', 'disbanded')),
  ADD CONSTRAINT parties_disbanded_complete
    CHECK ((status = 'disbanded') = (disbanded_at IS NOT NULL));

CREATE TABLE party_members (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  party_id          UUID NOT NULL REFERENCES parties (id),
  player_profile_id UUID NOT NULL REFERENCES player_profiles (id),
  valid_during      TSTZRANGE NOT NULL,          -- joined until left
  left_reason       TEXT CHECK (left_reason IN ('left', 'kicked', 'disconnected',
                      'disbanded', 'joined_other')),
  EXCLUDE USING gist (player_profile_id WITH =, valid_during WITH &&)  -- one party at a time
);

CREATE TABLE party_invites (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  party_id             UUID NOT NULL REFERENCES parties (id),
  inviter_profile_id   UUID NOT NULL REFERENCES player_profiles (id),
  invitee_profile_id   UUID NOT NULL REFERENCES player_profiles (id),
  status               TEXT NOT NULL CHECK (status IN ('pending', 'accepted',
                         'declined', 'expired', 'cancelled')),
  expires_at           TIMESTAMPTZ NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE friendships (                  -- one row per pair, smaller id first
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  account_low_id    UUID NOT NULL REFERENCES accounts (id),
  account_high_id   UUID NOT NULL REFERENCES accounts (id),
  source            TEXT NOT NULL CHECK (source IN ('in_game', 'platform', 'both')),
  valid_during      TSTZRANGE NOT NULL,          -- friends until removed or blocked
  CHECK (account_low_id < account_high_id),
  EXCLUDE USING gist (account_low_id WITH =, account_high_id WITH =,
    valid_during WITH &&)                         -- one live friendship per pair
);

CREATE TABLE friend_requests (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  from_account_id   UUID NOT NULL REFERENCES accounts (id),
  to_account_id     UUID NOT NULL REFERENCES accounts (id),
  status            TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined',
                      'expired', 'withdrawn')),
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocks (                        -- one-directional; never shown to the blocked
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  blocker_account_id  UUID NOT NULL REFERENCES accounts (id),
  blocked_account_id  UUID NOT NULL REFERENCES accounts (id),
  valid_during        TSTZRANGE NOT NULL,
  CHECK (blocker_account_id <> blocked_account_id),
  EXCLUDE USING gist (blocker_account_id WITH =, blocked_account_id WITH =,
    valid_during WITH &&)                         -- one live block per direction
);

CREATE TABLE social_settings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  account_id          UUID NOT NULL UNIQUE REFERENCES accounts (id),
  presence_visibility TEXT NOT NULL CHECK (presence_visibility IN ('friends', 'everyone',
                        'nobody')),
  is_appear_offline   BOOLEAN NOT NULL DEFAULT FALSE,
  invites_from        TEXT NOT NULL CHECK (invites_from IN ('friends', 'anyone', 'nobody')),
  text_chat           TEXT NOT NULL CHECK (text_chat IN ('everyone', 'friends', 'off')),
  voice_chat          TEXT NOT NULL CHECK (voice_chat IN ('everyone', 'friends', 'off')),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()   -- defaults set by age band and region
);

CREATE TABLE chat_messages (                -- whispers and group chat; match chat is logged elsewhere
  id                UUID PRIMARY KEY DEFAULT uuidv7(),  -- server-assigned, time-ordered
  tenant_id         UUID NOT NULL,
  channel_kind      TEXT NOT NULL CHECK (channel_kind IN ('whisper', 'party', 'group')),
  channel_ref       TEXT NOT NULL,             -- pair key, party id or group id
  sender_account_id UUID NOT NULL REFERENCES accounts (id),
  body              TEXT NOT NULL,
  filter_result     TEXT NOT NULL CHECK (filter_result IN ('clean', 'masked', 'blocked')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delete_after      TIMESTAMPTZ NOT NULL           -- set from the retention schedule
);
```

Notes on the sketch:

- **The live party is in memory; the row is its history.** The party service holds the current state and members for speed and writes each transition to `parties.status` and `party_members` as it happens, so "who was in this party when it queued" has an answer after the fact. A leader handoff is a new `leader_profile_id`, recorded with an event.
- **A block ends the friendship in the same transaction.** Inserting a `blocks` row closes any live `friendships` range for the pair and expires pending requests and invites between them, then emits `block.created`.
- **Recent players have no table.** They are a query over `match_participants` for the player's last few matches, filtered by blocks, so they expire with the window and never need cleanup.
- **Settings defaults come from configuration, not the column.** A new `social_settings` row is written from a defaults table keyed by age band and region, and rewritten when `account.age_band_changed` arrives ([Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity#how-to-build-it)), offering the player new choices rather than silently loosening anything.

The services, and where each one's state lives:

| Service | Owns | State |
| --- | --- | --- |
| Connection edge | Client sockets, authentication, heartbeats | In memory per node |
| Session router | Which edge node holds each session | Replicated in memory, rebuilt from edges |
| Presence | Availability and rich presence per account, privacy filtering, fan-out | Memory with expiry; settings from Postgres |
| Social graph | Friends, requests, blocks, recent players | Postgres, cached; emits `friendship.*`, `block.*` events |
| Parties | Members, invites, leader, consistency checks, ticket creation | Postgres for history; live party state in memory |
| Chat | Channels, filtering, delivery, offline storage, retention | Postgres or a wide-column store for history |
| Voice broker | Vendor tokens, channel mapping, restriction checks | Stateless; vendor holds the channels |

The design rules that hold it together:

- **Every service checks blocks and restrictions itself.** The graph service is the source; parties, chat, voice tokens and presence each enforce on their own path, from a cached copy invalidated by `block.created` events ([Events & Async Messaging](/docs/architecture/events)).
- **The edge is dumb and replaceable.** It authenticates, holds sockets and forwards; losing a node drops its players to reconnect elsewhere, and the router rebuilds from the edges, as Riot's chat nodes resync with peers when they return.
- **Durable intent, ephemeral delivery.** A friend request, an invite and a whisper are written first, then pushed; a lost push is recovered by the client's resync on reconnect. Presence and typing indicators are never written.
- **The social tier degrades separately from play.** A chat or presence outage must not stop matches from starting or finishing; a match in progress keeps its own team chat and voice. Decide which features depend on the social tier and which only use it when it's there.

## Auditing

- **Graph changes:** friend added and removed, block and unblock, with time and source. A harassment or grooming investigation starts with who could reach whom, and when ([Audit Trails](/docs/architecture/audit-trails)).
- **Setting changes,** especially communication and visibility settings for younger players, with who changed them (the player, a parent through a platform control, an age check).
- **Messages and their filter results,** kept for the retention period, with every moderator view logged ([Audit Trails](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Voice recordings,** if any: what was recorded, under which notice, when it was deleted.
- **Erasure:** a deleted account's messages, graph edges and settings are removed or anonymized on the schedule, while the moderation records the law requires you to keep are kept ([Data Retention](/docs/architecture/data-retention#erasure-requests)).

## What This Means for the System You Build

- **A social graph on the account,** with mutual friendships, one-directional blocks enforced by every service, expiring requests and recent players.
- **Presence derived from live sessions,** held in memory with expiry, filtered by privacy settings server-side, coalesced, and fanned out through a session router.
- **Privacy settings with friends-only defaults,** appear offline, and communication defaults that vary by age band and region.
- **A party service** with a written state machine, consistency checks before queueing, cancel-on-change, leader handoff and disconnect grace.
- **Chat with typed channels,** filtering before delivery, instant player-side tools, reports that cite message ids, and retention per channel and outcome.
- **One push layer** (independent edges, a routing layer, any service can publish) for presence, chat, invites and live updates.
- **Voice bought, not built,** authorized by your server through signed tokens, with channels mapped to your objects and a recording and retention policy decided before launch.
- **A merged cross-platform friends list** that follows each platform's rules and applies the strictest communication setting.
- **Capacity sized for the reconnect storm** and a social tier whose outage doesn't stop play.

## References

**Specifications**

- [RFC 6120: XMPP Core](https://www.rfc-editor.org/rfc/rfc6120), the XML streaming protocol Riot's chat is built on
- [RFC 6121: XMPP Instant Messaging and Presence](https://www.rfc-editor.org/rfc/rfc6121), rosters, presence subscriptions and messages

**Reference**

- [Valve: Steamworks Enhanced Rich Presence](https://partner.steamgames.com/doc/features/enhancedrichpresence), the `steam_display` key with localization tokens, and party grouping with `steam_player_group` and its size
- [Unity: Vivox channel types](https://docs.unity.com/en-us/vivox-unreal/developer-guide/channels/channel-types), echo, non-positional and positional channels, one positional channel at a time, and join order
- [Unity: Vivox positional channels](https://docs.unity.com/en-us/vivox-unity/developer-guide/channels/positional-channels), position and facing direction, and large 3D channels of up to 2,000 participants
- [Unity: Vivox access tokens](https://docs.unity.com/en-us/vivox-core/server-to-server-api-reference/access-tokens), server-issued tokens required to sign in or join a channel, signed with a shared secret
- [Unity: Vivox example join token](https://docs.unity.com/en-us/vivox-core/access-token-guide/access-token-examples/example-join-token), the join action, user, channel and expiry claims
- [Epic Games: Epic Online Services overview](https://dev.epicgames.com/docs/epic-online-services/eos-overview), Game Services versus Epic Account Services, friends, presence, the Social Overlay, the combined friends list and Voice
- [Microsoft Learn: What is PlayFab?](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), Party voice and chat with transcription and translation in more than 30 languages
- [Microsoft Learn: Xbox services](https://learn.microsoft.com/en-us/gaming/xbox-live/), profile, friends and presence as micro-services over REST and secure WebSockets

**In practice**

- [Riot Games: Chat Service Architecture, Protocol](https://www.riotgames.com/en/news/chat-service-architecture-protocol), why XMPP, RXEP extensions, encrypted friend notes and incremental ignore-list edits (July 24, 2015)
- [Riot Games: Chat Service Architecture, Servers](https://www.riotgames.com/en/news/chat-service-architecture-servers), Erlang servers, replicated in-memory tables, offline storage, the social graph over REST and the 2015 scale figures (September 23, 2015)
- [Riot Games: Riot Messaging Service](https://www.riotgames.com/en/news/riot-messaging-service), edge and routing layers, Erlang on AWS, 10 million connections per edge machine in load tests and about 15 ms delivery (February 28, 2017)
- [Riot Games: Scalability and Load Testing for VALORANT](https://www.riotgames.com/en/news/scalability-and-load-testing-valorant), the parties service checking a premade's ranks before queueing (December 15, 2020)
- [League of Legends: /dev: Behavioral Systems Update](https://www.leagueoflegends.com/en-gb/news/dev/dev-behavioral-systems-update-may-2023/), party-only chat, self-mute and deafen commands and in-game reporting (May 24, 2023)
- [VALORANT: Voice Evaluation Update](https://playvalorant.com/en-us/news/announcements/valorant-voice-evaluation-update/), the recording notice and opt-out, and retention of 24 hours, 7 days and up to 2 years (June 24, 2022)
- [Discord: Announcing Discord's Social SDK](https://discord.com/press-releases/announcing-discords-social-sdk-helping-power-your-games-social-experiences), free, with or without a Discord account, unified friends, deep-link invites, rich presence and the closed beta for messaging and voice (March 17, 2025)
- [Discord: Social SDK in-game communications](https://discord.com/press-releases/social-sdk-ingame-communications), voice, lobbies, DMs and linked channels available to all developers (August 13, 2025)
- [Discord Developer Docs: Social SDK platform compatibility](https://docs.discord.com/developers/discord-social-sdk/core-concepts/platform-compatibility), supported and experimental platforms, console approval and PlayStation restrictions
- [TechCrunch: Unity acquires Vivox](https://techcrunch.com/2019/01/29/unity-acquires-vivox-which-powers-voice-chat-in-fortnite-and-league-of-legends), the acquisition and the games Vivox powered (January 29, 2019)
- [FTC: Epic Games to pay more than half a billion dollars](https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations), voice and text chat on by default for children and teens, and the order to turn them off by default (December 19, 2022)
- [Roblox: Age checks required to chat](https://about.roblox.com/newsroom/2026/01/roblox-age-checks-required-to-chat), age checks for chat and default chat within one's own and adjacent age groups (January 7, 2026)
