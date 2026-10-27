+++
title = "Voice & Live Rooms"
description = "Voice channels and stage rooms on community platforms: SFU design, regional assignment and failover, encryption, stage moderation, recording and consent."
category = "User-Generated Platforms Industry"
order = 1809
part = "Communities and Conversation"
tags = ["user-generated-content", "voice", "webrtc", "sfu", "recording-consent"]
+++

Voice turns a community from a place people read into a place people hang out. An always-on voice channel lets members drop in and out the way they would walk into a room; a stage turns a few speakers and thousands of listeners into a live show; screen sharing and camera streams sit on the same pipes. It's also the most expensive and least moderatable thing a community platform runs: media flows continuously whether anyone speaks or not, every second costs bandwidth, latency over a few hundred milliseconds breaks conversation, and what was said is gone unless someone recorded it, which brings consent law into the room.

The Gaming volume's [Voice](/books/gaming/social-systems#voice) section covers voice inside games: buying it from vendors, authorizing joins with server-issued tokens, channels mapped to parties and matches, and voice moderation by recording on report. This chapter covers what community platforms add: persistent rooms owned by communities, topologies and the selective forwarding unit, Discord's public account of running its own, regional assignment and failover, end-to-end encryption, stage rooms and their moderation, recording and consent, transcription, and the build-or-rent decision. It attaches room sessions to the voice and stage channels of [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#how-to-build-it). One-to-many video broadcast (RTMP ingest, HLS delivery) is the Media part's [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#ingest-protocols) and [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#distribution-at-scale).

## How the Platforms Do It

| Platform | Room types | Media stack | Public detail |
| --- | --- | --- | --- |
| **Discord** | Voice channels (up to 99 users), stage channels (up to 10,000), DM and group calls, screen share | Own selective forwarding unit in C++, Elixir signaling, stripped-down WebRTC in native clients | 2018 voice architecture post; DAVE end-to-end encryption for audio and video from 2024 |
| **Reddit** | Reddit Talk, live audio rooms in communities (2021 to 2023) | A third-party audio vendor | Shut down March 21, 2023, after the vendor shut down its service |
| **Platforms renting rooms** | Any | LiveKit (open-source SFU), Amazon IVS real-time stages, other real-time vendors | Vendor docs and pricing |

The pattern: **rooms are channels.** On every platform that does voice well, a room is a kind of channel inside a community, with the channel's permissions deciding who can join, speak, share video, and mute or move others. That keeps voice inside the permission model and the moderation model rather than beside them. The other pattern is how often community voice is rented, and how hard that bites when the vendor leaves: Reddit closed Reddit Talk two years after launch because, as reported at the time, its "3rd party audio vendor" was shutting down, which raised the cost of keeping it running, and it limited recording downloads to a few months.

## Room Types

- **Persistent voice channels** exist whether or not anyone is in them. Members join and leave freely; there's no host. Discord's channel resource gives voice channels a bitrate (96,000 bits per second on an ordinary server, up to 384,000 on boosted servers) and a user limit of up to 99.
- **Stages** separate speakers from an audience. A few speakers, moderators who invite and remove them, and listeners who can request to speak; Discord's stage channels allow up to 10,000 listeners at up to 64,000 bits per second, and its permission catalog has a request-to-speak bit. Stages are the community version of a live radio show or an AMA.
- **Calls** are rooms between people rather than in a community: DMs and group DMs.
- **Video and screen share** ride the same rooms: Discord's Go Live streams a screen or game to a voice channel.

The kind decides the media budget. A voice channel of ten people costs ten upstream audio streams and ninety downstream; a stage of five speakers and five thousand listeners costs five upstream and twenty-five thousand downstream, which is why large stages cap their audio quality and why platforms switch very large audiences to a broadcast pipeline.

## Topologies

RFC 7667 catalogs the ways to connect participants in a real-time session, and three matter:

- **Mesh:** every participant sends to every other. Upload grows with the room; it works for three or four people and not beyond.
- **Mixer (MCU):** a server decodes everyone, mixes audio (and tiles video) and sends each participant one combined stream. Cheap for clients, expensive for the server (decode and re-encode per room), and it adds latency.
- **Selective forwarding unit (SFU):** a server receives each participant's stream and forwards the ones each receiver needs without decoding them. The RFC notes that selective forwarding middleboxes have "extremely low delay" compared with transcoding mixers, and the design pairs with **simulcast** (each sender uploads several qualities) and **scalable video coding** (one stream in layers), so the SFU can send a phone the low layer and a desktop the high one.

Community platforms use SFUs. LiveKit, the most widely used open-source one, describes itself as a distributed WebRTC SFU written in Go on the Pion WebRTC stack, Apache 2.0 licensed, with simulcast and SVC, speaker detection and selective subscription, end-to-end encryption, multi-region deployment and moderation APIs.

## Running Voice at Community Scale

Discord's 2018 account of its voice system is the most detailed public write-up of community voice at scale, and its choices are worth knowing even for a platform that rents:

- **Scale:** more than 850 voice servers in 13 regions and over 30 data centers, a peak of more than 2.6 million concurrent voice users, and egress above 220 Gbps and 120 million packets a second.
- **Split signaling from media.** Signaling (who's in the room, keys, codec) runs in Elixir services shared with the rest of the backend; media goes through a C++ SFU that forwards audio and video, translates between native and browser clients and handles video bandwidth feedback.
- **Strip WebRTC where you control both ends.** Native clients skip ICE because every client connects to Discord's relay (which also hides participants' IP addresses from each other), replace SDP with an exchange of about 1,000 bytes, and replace DTLS and SRTP with Salsa20 encryption; browsers still speak standard WebRTC, with the SDP synthesized client-side.
- **Send nothing during silence.** Clients stop sending audio when nobody's talking, saving bandwidth and CPU, at the cost of handling stream stops and sequence rewrites.
- **Assign by load, discover by registry.** Voice servers report health and load to etcd; the service that owns a server's state assigns the least-utilized voice server in the chosen region to each server's voice.
- **Fail over by reassignment.** If the SFU process crashes, signaling restarts it and rebuilds state without client action; if a voice server dies, clients notice the severed connection and the server is reassigned to a new voice server. Under a DDoS attack, the targeted server is taken out of discovery and its rooms moved elsewhere until the attack subsides.

Hiding participant IPs is a safety feature in its own right. Peer-to-peer voice exposes every participant's address to every other, which is how voice-chat users get targeted with denial-of-service attacks and located; relaying all media through the platform's servers closes that.

### Regional Assignment

Voice is latency-bound, so a room runs on a server near its participants. The choices:

- **Automatic** picks the region from the first joiner or the participants' locations; Discord's channel resource exposes `rtc_region`, where null means automatic.
- **Pinned** lets the owner fix a region for a community whose members are in one place.
- **Moving a live room** to a new region is a reassignment: clients reconnect to a new server, the same mechanism as failover, which is why reassignment has to be fast and invisible.

Capacity is planned per region for the peak hour, with headroom for failover from a neighboring region and for DDoS-driven moves.

## Encryption

Transport encryption between client and SFU is standard; the SFU can still see media. End-to-end encryption removes that. Discord's DAVE protocol, announced September 17, 2024, end-to-end encrypts audio and video in DMs, group DMs, voice channels and Go Live streams: clients form a Messaging Layer Security group, derive a per-sender media key, and re-key when anyone joins or leaves; the SFU still forwards every packet but can't decrypt the media inside. Participants can compare a call-wide privacy code out of band, and pairwise verification codes confirm identities. The protocol whitepaper and client library are open source and were audited; Discord said it expected end-to-end encryption to become the default for those call types.

The trade-off is moderation. With media opaque to the server, the platform can't record a room for review, transcribe it for automod or sample it for detection; reports have to come from participants' own devices. Text chat stays outside DAVE and under content moderation ([Real-Time Chat](/books/user-generated-platforms/real-time-chat#encryption)). A platform deciding on end-to-end encrypted voice decides at the same time how voice reports work, what evidence exists, and how it will answer a regulator's question about risk to children in calls.

## Stage Moderation

A stage is a broadcast with a live microphone, and its controls are permissions on the channel:

- **Connect, speak and request to speak** decide who can enter, talk and ask to talk; a listener's raised hand is a request a moderator accepts or ignores.
- **Mute, deafen, move and disconnect** let moderators handle a disruptive participant in seconds. In the permission catalog these are separate bits (mute members, for example), and they obey rank: a moderator can't mute someone above them.
- **Timeouts** remove the ability to speak with everything else, as in text ([Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#how-to-build-it)).
- **Age rules** reach the stage: Discord's February 2026 announcement of its teen-by-default settings (launched globally on September 23, 2026, after a delay) reserved speaking on stage for accounts confirmed as adults.

Every moderation action in a room is a moderator action with a record ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#how-to-build-it)): who was muted or disconnected, by whom, in which session. Without recordings, those records and participants' reports are the only evidence of what happened in a room.

## Recording and Consent

Recording a room creates evidence, content and legal exposure at once. The law sets the floor:

- **US federal law is one-party consent.** Under 18 U.S.C. 2511(2)(d) it isn't unlawful for a party to a communication, or someone with one party's prior consent, to intercept it, unless the purpose is a criminal or tortious act.
- **Some states require all parties.** Washington, for one, prohibits recording a private conversation without first obtaining the consent of all the persons engaged in it, and several other states have all-party rules of their own; a room has participants from many states, so the strictest rule governs in practice.
- **In the EU and UK,** a recording of identifiable voices is personal data; recording needs a lawful basis, transparency and a retention limit ([GDPR](/docs/compliance/gdpr#lawful-bases)).

The design that satisfies all of them is **notice before capture and a visible indicator throughout:** a participant joining a recorded room sees that it's recorded before their audio is sent, everyone sees an indicator while recording runs, and a participant who doesn't consent can listen without speaking or leave. A consent record per participant per session (shown, accepted, declined) is the evidence the notice was given.

The same rules apply to bots. Community platforms let apps join voice channels, and a recording bot is a recording; requiring apps that capture voice to trigger the same indicator and consent prompt as a native recording, and to declare it in their app review, keeps the rule from being bypassed through the developer platform ([Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#bots-and-apps)).

**Moderation recording** is a separate case: recording for safety review, kept briefly and listened to only on a report. The Gaming volume's [Voice](/books/gaming/player-behavior#voice) coverage describes a published game example with in-client notice, opt-out by region and retention tied to outcome; a community platform adopting it needs the same notice, the same short default retention, and access logging for every listen. With end-to-end encryption, server-side moderation recording isn't possible, and the reporter's device has to supply the clip.

**Transcription and AI summaries** of rooms are recordings by another name: the transcript is personal data with the same consent and retention, and a summary posted to the community publishes what participants said in a room they may have thought ephemeral. Treat both as recording, with the same notice.

**Retention of shared recordings** is a product promise that outlives the product: when Reddit closed Talk, recordings could be downloaded only until June 1, 2023, and only for talks hosted after September 22, 2022. Decide at launch how long recordings are kept, and what happens to them if the feature ends ([Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#ending-a-feature-or-a-service)).

## Build or Rent

The landscape chapter's default holds: [build when it's the product, rent otherwise](/books/user-generated-platforms/platform-landscape#build-buy-or-rent). For a community platform:

- **Rent** when voice is a feature: a managed real-time service (Amazon IVS real-time stages list $0.072 per participant-hour as of October 2026, per [The Platform Landscape](/books/user-generated-platforms/platform-landscape#video)) or a hosted SFU. The platform still owns authorization (tokens minted by its permission check), room records, moderation actions and recording consent.
- **Self-host an open-source SFU** when costs or control matter: LiveKit and similar projects give the media layer; the platform runs regions, capacity and failover.
- **Build** when voice is the product at Discord's scale, where a custom SFU, a stripped protocol and bare-metal bandwidth pay for themselves.

Whichever is chosen, keep an exit: room sessions, participants, moderation actions and consents live in the platform's tables, not only in the vendor's dashboard, so a vendor change (or a vendor shutting down) doesn't erase the record.

## How to Build It

The chapter's additions. Rooms are `channels` of kind `voice` or `stage`; these tables record the media layer and what happened in each session:

```sql
CREATE TABLE media_servers (             -- SFU nodes, or vendor regions when renting
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  region        TEXT NOT NULL,           -- 'us-east', 'eu-central', ...
  endpoint      TEXT NOT NULL,
  provider      TEXT NOT NULL,           -- 'self', or the vendor
  state         TEXT NOT NULL CHECK (state IN ('active', 'draining', 'out_of_rotation',
                  'down')),
  capacity      INT NOT NULL,            -- participant slots
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE room_sessions (             -- one continuous run of a room on a server
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id       UUID NOT NULL REFERENCES channels (id),  -- kind voice, stage, dm, group_dm
  media_server_id  UUID NOT NULL REFERENCES media_servers (id),
  region           TEXT NOT NULL,
  e2ee             BOOLEAN NOT NULL,     -- could the platform see media?
  stage_topic      TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  end_reason       TEXT CHECK (end_reason IN ('empty', 'reassigned', 'server_failure',
                     'ddos', 'moderator', 'platform'))
);

CREATE TABLE room_participants (         -- who was in a session, as what, when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  room_session_id  UUID NOT NULL REFERENCES room_sessions (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  role             TEXT NOT NULL CHECK (role IN ('participant', 'speaker', 'listener',
                     'moderator', 'app')),
  present_during   TSTZRANGE NOT NULL,
  server_muted     BOOLEAN NOT NULL DEFAULT FALSE,
  server_deafened  BOOLEAN NOT NULL DEFAULT FALSE,
  video            BOOLEAN NOT NULL DEFAULT FALSE,
  screen_share     BOOLEAN NOT NULL DEFAULT FALSE,
  left_reason      TEXT CHECK (left_reason IN ('left', 'disconnected', 'moved',
                     'kicked', 'timed_out', 'reassigned'))
);

CREATE TABLE room_recordings (           -- anything captured: recording, clip, transcript
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  room_session_id  UUID NOT NULL REFERENCES room_sessions (id),
  kind             TEXT NOT NULL CHECK (kind IN ('recording', 'moderation_buffer',
                     'transcript', 'summary', 'report_clip')),
  initiated_by     UUID REFERENCES accounts (id),  -- a member, a moderator or an app's account
  app_id           UUID,                 -- apps.id when an app captured it
  media_asset_id   UUID REFERENCES media_assets (id),
  captured_during  TSTZRANGE NOT NULL,
  purpose          TEXT NOT NULL CHECK (purpose IN ('community', 'moderation', 'evidence')),
  purge_after      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recording_consents (        -- notice shown and answer, per participant
  room_recording_id UUID NOT NULL REFERENCES room_recordings (id),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  notice_version    TEXT NOT NULL,
  response          TEXT NOT NULL CHECK (response IN ('accepted', 'declined',
                      'listen_only', 'left')),
  jurisdiction      TEXT,                -- the participant's, for the consent rule applied
  responded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_recording_id, account_id)
);
```

Notes on the sketch:

- **Joining is a permission check, then a token.** The service evaluates connect (and speak, video, stream) for the member on the channel, then mints a short-lived media token naming the room, the identity and the granted capabilities; the SFU or vendor enforces the token, never the client's claim. The Gaming volume's [token pattern](/books/gaming/social-systems#voice) is the same.
- **Sessions survive reassignment as new rows.** A failover ends one session with `end_reason = 'reassigned'` and starts another for the same channel, so "who was in the room at 21:04?" spans both.
- **Server mute and deafen are state on the participant row,** set by moderator actions that are also logged as moderator actions; a timeout or ban from `penalties` ends the participation with `timed_out` or `kicked`.
- **Recording needs consent rows before audio.** The capture path checks that every speaking participant has an `accepted` consent for the current notice; a participant who declined is forced listen-only. Apps that capture use the same path.
- **Recordings are media assets** with a purpose and a purge date; moderation buffers expire quickly unless attached to a case, and evidence follows `legal_holds` ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)).
- **Events:** `room.started`, `room.ended`, `room.participant_joined`, `room.participant_left`, `room.speaker_added`, `room.recording_started`, `room.recording_stopped` and `media_server.out_of_rotation` go to the gateway (voice state fan-out), moderation, analytics and capacity planning.

## Auditing

- **Who was in which room, when, as what,** for harassment and child-safety investigations, kept for the safety retention window.
- **Every moderator action in a room** (mute, deafen, move, disconnect, speaker changes) with actor, rank and target.
- **Every recording, transcript and summary,** with initiator (member, moderator or app), purpose, consents collected and purge date, and every listen to a moderation recording logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Encryption state per session,** so what the platform could have seen at the time of a report is on record.
- **Server failovers and reassignments,** for capacity planning and incident review.

## What This Means for the System You Build

- **Make rooms channels,** with join, speak, video, mute and move as permissions under the same rank rules as text.
- **Use an SFU** with simulcast or SVC; avoid mesh beyond a handful of people and mixers except for special cases.
- **Relay all media** so participants never see each other's IP addresses.
- **Split signaling from media,** discover servers through a registry, assign by load and region, and fail over by reassignment.
- **Decide end-to-end encryption together with the report flow** and the evidence model.
- **Give stages speaker requests, fast moderator controls and age rules** on who may speak.
- **Show notice before capture and an indicator throughout,** record consent per participant, and hold apps to the same rule.
- **Treat transcripts and AI summaries as recordings.**
- **Rent voice unless it's the product,** and keep sessions, participants, actions and consents in your own tables so a vendor exit doesn't erase them.

## References

**Specifications and law**

- [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667), point-to-point, mesh, media-mixing mixers and selective forwarding middleboxes, simulcast and SVC
- [18 U.S.C. 2511](https://www.law.cornell.edu/uscode/text/18/2511), the federal one-party consent exception in (2)(d)
- [RCW 9.73.030](https://app.leg.wa.gov/RCW/default.aspx?cite=9.73.030), Washington's all-party consent rule for recording private conversations

**Reference**

- [Discord Developer Docs: Channel resource](https://docs.discord.com/developers/resources/channel), voice and stage bitrates and user limits, automatic region
- [Discord Developer Docs: Permissions](https://docs.discord.com/developers/topics/permissions), connect, speak, mute members and request-to-speak bits, and rank rules
- [LiveKit: livekit repository](https://github.com/livekit/livekit), an open-source distributed WebRTC SFU in Go with simulcast, SVC, selective subscription, E2EE and multi-region deployment
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), real-time participant-hour pricing

**In practice**

- [Discord: How Discord handles two and a half million concurrent voice users using WebRTC (2018)](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc), scale, Elixir signaling and C++ SFU, ICE, SDP and DTLS changes, Salsa20, silence suppression, etcd discovery, assignment and failover
- [Discord: Meet DAVE, end-to-end encryption for audio and video](https://discord.com/blog/meet-dave-e2ee-for-audio-video), MLS group keys, per-sender media keys, verification codes, the SFU unable to decrypt, open-source protocol and audits (September 17, 2024)
- [Discord: Discord Launches Teen-by-Default Settings Globally](https://discord.com/press-releases/discord-launches-teen-by-default-settings-globally), only confirmed adults able to speak on stage, and the February 24, 2026 delay
- [Discord: Safer for Teens, Same Discord for Adults](https://discord.com/blog/safer-for-teens-same-discord-for-adults), the September 23, 2026 global launch
- [TechCrunch: Reddit is shutting down its Clubhouse clone, Reddit Talk](https://techcrunch.com/2023/03/09/reddit-is-shutting-down-its-clubhouse-clone-reddit-talk), shutdown date, the vendor shutting down, and the recording download window (March 9, 2023, reported)
