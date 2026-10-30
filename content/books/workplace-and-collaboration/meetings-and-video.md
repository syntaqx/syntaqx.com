+++
title = "Meetings & Video"
description = "How Zoom, Teams, Meet and Webex run meetings: signaling and media, SFUs, simulcast, codecs, E2EE and the FTC Zoom case, large events, interop, lobbies."
category = "Workplace & Collaboration Industry"
order = 2018
part = "Meetings and Voice"
tags = ["meetings", "video", "webrtc", "sfu", "end-to-end-encryption"]
+++

A workplace meeting is a scheduled, permissioned, real-time media session. Someone books it from a [calendar](/books/workplace-and-collaboration/email-and-calendar#the-calendar-standards), a link goes out, and at the start time a few people or a few thousand join from laptops, phones, browsers, conference rooms and dial-in numbers, on office Wi-Fi, home broadband and hotel networks behind firewalls that were never configured for real-time media. Audio has to arrive within a few hundred milliseconds or conversation breaks down; video has to degrade gracefully when a link congests; screen sharing has to stay legible at a fraction of the bitrate; and all of it has to work the same way for the guest who clicked a link from another company.

That is the media problem, and it's shared with consumer calling. What makes the workplace version its own industry is everything around the media: the meeting belongs to an organizer inside a customer tenant, the customer's admin decides who may record, who may join without waiting, whether anonymous people may join at all, whether the meeting is end-to-end encrypted and therefore unrecordable, and which meeting rooms from other vendors can dial in. This chapter covers how the four large platforms run meetings from their public documentation, the media architecture (signaling, relays, selective forwarding, simulcast, congestion control and codecs), encryption and the FTC's case against Zoom, large meetings and events, breakout rooms, interoperability with SIP and H.323 rooms, and meeting security. Recording and AI notes are the next chapter, [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes); rooms and devices are [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office). Community voice channels, where the platform rather than a customer admin moderates, are the User-Generated Platforms volume's [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms), which this chapter leans on for the generic mechanics.

## How the Platforms Do It

As of October 2026:

| Platform | Interactive meeting size | Larger formats | End-to-end encryption | Room interop | Public detail |
| --- | --- | --- | --- | --- | --- |
| **Microsoft Teams** | 300 on Business plans and Teams Essentials; 1,000 on E, A, F and G plans | Events: 1,000 interactive, 3,000 with large-event chat, 10,000 view-only; up to 100,000 with an Attendee Capacity Pack | Teams Premium organizers; up to 200 participants; 1:1 calls separately | Cloud Video Interop through Pexip, Cisco and Poly | Call-flow, bandwidth and limits documentation on Microsoft Learn |
| **Zoom** | Plan capacity, raised by Large Meeting add-ons | Zoom Webinars, with breakout sessions of their own | Opt-in E2EE since an October 2020 technical preview; whitepaper at version 4.7 (June 2025) | H.323/SIP devices join meetings; Zoom Rooms | 10-K: co-located data centers plus AWS and Oracle Cloud |
| **Google Meet** | 100 to 1,000 by Workspace edition; past 500, the next 500 join view-only | View-only overflow | Not covered here | Teams Rooms can join Meet as a guest | Tested AV1 video down to 40 kbps |
| **Webex** | Varies by plan | Webex webinar and event products | Zero-Trust E2EE using MLS and SFrame, up to 1,000 participants | Cisco is a Teams CVI partner | Help center and Zero-Trust technical paper |

Three patterns run through the table. **Capacity is a licensing decision, not a technical one:** the same service hosts 300 people for one customer and 1,000 for another, and sells the step to 10,000 or 100,000 as an add-on; the SKU ladder is [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats). **Above about a thousand people, every vendor switches from a meeting to a broadcast,** with attendees muted, cameras off and a few seconds of delay. And **end-to-end encryption is everywhere and almost nobody's default,** because turning it on removes recording, transcription, phone dial-in and AI, which are the features customers buy meetings for.

## Signaling and Media

A meeting is two systems. **Signaling** says who is in the meeting, what they may do and how to reach them: join, admit from the lobby, mute, promote to presenter, start recording. It's ordinary request and event traffic over HTTPS and WebSockets, tolerant of latency; Microsoft's call-flow documentation notes that most Teams signaling uses HTTPS-based REST interfaces, with SIP only toward session border controllers, and that it "may cause service outages or call timeouts if latency between the endpoints exceeds several seconds." The generic engineering of those long-lived connections is [Realtime Connections](/docs/architecture/realtime-connections#edge-and-routing).

**Media** is the audio, video and screen share, carried in RTP and encrypted hop by hop with SRTP, which in Microsoft's words encrypts only the payload. Media is latency-bound, so it wants UDP and the shortest path. Teams requires UDP ports 3478 (STUN), 3479 (audio), 3480 (video) and 3481 (sharing) open toward Microsoft 365, and uses standard ICE: each client gathers local, server-reflexive and relay candidates, exchanges them through signaling, runs connectivity checks and sends media on the best working pair. TCP and even HTTP tunneling are the last resort, with "bad quality implications." That is why every vendor's network guide tells customers to split-tunnel meeting traffic around the VPN: VPNs are "typically not designed or configured to support real-time media," may not carry UDP, add a redundant layer of encryption, and hairpin traffic through a concentrator far from the user.

Where the conference runs matters as much as how packets get there. Microsoft's stated principle is that "a Microsoft Teams conference is hosted by Microsoft 365 in the same region where the first participant joined," with a media endpoint allocated there for "mixing and routing purposes"; a one-to-one call goes peer to peer when it can and through a Transport Relay when firewalls prevent it, and pulls in a cloud media endpoint only when something needs to process the media, such as recording or transcription. Zoom's 10-K describes serving users "from various co-located data centers located throughout the world," with Amazon Web Services and Oracle Cloud for certain critical aspects of the business. Either way, the region a meeting lands in is a data residency question as well as a latency one; what residency promises cover for meetings is [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty#what-residency-covers).

The browser standard underneath is WebRTC: the IETF's [RFC 8825](https://www.rfc-editor.org/rfc/rfc8825) is the roadmap to the protocols, and the W3C's WebRTC API is a Recommendation (the current edition is dated March 13, 2025). Native clients use the same protocols with more control; Discord's choice to strip ICE, SDP and DTLS from its native clients is the extreme case ([Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#running-voice-at-community-scale)). Workplace vendors keep closer to the standards because their meetings must also admit browsers, room systems and gateways from other companies.

## Topologies: Why Everyone Runs an SFU

[RFC 7667](https://www.rfc-editor.org/rfc/rfc7667) catalogs the ways to connect participants: mesh, where everyone sends to everyone; a mixer (MCU), which decodes everyone and sends each participant one composed stream; and a selective forwarding middlebox (SFU), which forwards each sender's packets to the receivers that need them without decoding. The RFC's comparison is the whole argument: "contrary to transcoding MCUs, SFMs have extremely low delay." The User-Generated Platforms volume walks through the three in [Topologies](/books/user-generated-platforms/voice-and-live-rooms#topologies).

Workplace meetings run SFUs for video and keep mixing where the other end can't handle many streams:

- **Phone dial-in** is one audio stream in and out, so the bridge mixes audio for PSTN callers.
- **Legacy SIP and H.323 room systems** expect one composed video stream; interop gateways decode and compose for them (see Interop below).
- **Recording and broadcast** produce a composed layout, so a recorder or a broadcast encoder decodes and mixes server-side even when the live meeting is forwarded.

The cost structure follows. An SFU's work grows with packets forwarded; a mixer's grows with streams decoded and encoded. A 50-person meeting where everyone is on camera is cheap to forward and expensive to mix, which is why large galleries (Teams Rooms Pro shows up to 50 videos) are a forwarding feature, and why a recording captures far fewer: Microsoft notes that Teams meeting recordings don't capture "more than four people's video streams at once."

## Simulcast, SVC and Bandwidth Adaptation

An SFU can only forward what senders send, so senders send more than one thing. With **simulcast**, defined for SDP and RTP in [RFC 8853](https://www.rfc-editor.org/rfc/rfc8853), each sender encodes the same camera at several resolutions and bitrates and the SFU picks one per receiver. With **scalable video coding (SVC)**, one stream is built in layers the SFU can strip. Either way, the receiver on a phone in a train gets the bottom layer and the receiver on a fiber desktop gets the top, without anyone re-encoding in the middle.

Which layer a receiver can take is decided by **congestion control**. The Google Congestion Control draft that WebRTC implementations grew from combines a delay-based controller, which watches the variation in packet arrival times and lowers its estimate when queues build, with a loss-based controller that holds the rate below 10% packet loss, cuts it above, and raises it when loss stays under 2%. Delay-based control matters most: by the time packets are lost, the user already heard the stutter.

The adaptation policy is a product decision layered on top, and every vendor makes the same one: **audio first, then screen share, then video.** Microsoft's documentation says that when bandwidth is insufficient, "Teams prioritizes audio quality over video quality," and its bandwidth table makes the ladder concrete, per endpoint, as of October 2026:

| Modality (meetings) | Minimum | Recommended | Best performance |
| --- | --- | --- | --- |
| Audio | 10/10 kbps | 58/58 kbps | 76/76 kbps |
| Video | 150/200 kbps | 2,500/4,000 kbps | 4,000/4,000 kbps |
| Screen sharing | 250/250 kbps | 2,500/2,500 kbps | 4,000/4,000 kbps |

At the minimum, video is up to 240p and screen sharing runs at 1.875 to 7.5 frames per second; at the recommended level, up to 1080p. Screen sharing deserves its own policy because its content is the opposite of camera video: mostly static, text-heavy and ruined by blur, so encoders favor resolution over frame rate for slides and documents and switch to frame rate when someone shares a video.

## Codecs

WebRTC fixed a floor so that any two browsers can talk. [RFC 7874](https://www.rfc-editor.org/rfc/rfc7874) requires every WebRTC endpoint to implement Opus and G.711 for audio; [RFC 7742](https://www.rfc-editor.org/rfc/rfc7742) requires browsers to implement VP8 and H.264 Constrained Baseline for video. The floor shows up in odd places: Microsoft notes that Firefox users need the OpenH264 plugin for full Teams meeting support.

Above the floor, vendors move to newer codecs for the bad-network case. Google reported in 2023 that Meet "has tested AV1 successfully in extremely low bandwidth conditions, down to 40 kbps," and that Chrome's AV1 encoder at its real-time speed setting gave 12% better quality than VP9 at the same bandwidth while running 25% faster on desktops, and 45% better compression for screen content. The catch is decode and encode cost on old hardware without AV1 acceleration, which is why codec choice is negotiated per participant and the SFU forwards each receiver a stream it can decode. Codec families and rate control in general are [Media Compression](/docs/architecture/media-compression#rate-control-for-video).

## Encryption

Every meeting service encrypts media in transit. The question that has defined the industry's credibility since 2020 is who holds the keys.

**Transport encryption** protects packets between a client and the vendor's media servers; the SFU decrypts, forwards and re-encrypts, and so can record, transcribe, mix for phone callers and feed AI. **End-to-end encryption (E2EE)** keeps the keys on participants' devices; the SFU still forwards packets but can't read them. The standards for doing that in a group now exist: Messaging Layer Security ([RFC 9420](https://www.rfc-editor.org/rfc/rfc9420), 2023) for group key agreement, and SFrame ([RFC 9605](https://www.rfc-editor.org/rfc/rfc9605), 2024), which encrypts each media frame end to end while leaving the key ID and counter visible so a selective forwarding unit can still route frames "without having access to the actual media."

### The FTC's Zoom Case

In November 2020 the FTC announced a proposed settlement with Zoom, and on February 1, 2021 it gave final approval after a 3-2 vote on January 19, 2021. The FTC's allegations, as stated in its releases:

- Since at least 2016, Zoom had touted "end-to-end, 256-bit encryption" while its servers held cryptographic keys that could give Zoom access to meeting content, and it secured meetings with a lower level of encryption than promised.
- Zoom said cloud recordings were encrypted immediately after a meeting ended; some sat unencrypted on its servers for up to 60 days.
- In July 2018 a Mac update silently installed a local web server, ZoomOpener, that let Zoom launch meetings by bypassing a Safari safeguard, stayed behind when the app was deleted, and could reinstall the app; Apple removed it in July 2019.

The order requires a comprehensive information security program with annual risk assessments and vulnerability management, security review of software updates before release, biennial independent assessments, breach notification to the Commission and a ban on privacy and security misrepresentations. For anyone building a meeting product, the durable lesson is about words: "end-to-end" is a technical claim about who holds keys, and marketing that uses it for transport encryption is a deception case.

### E2EE as Shipped

Zoom announced its E2EE technical preview on October 14, 2020 as the first of four phases: the meeting host's client generates keys and distributes them to participants with public-key cryptography, so that "Zoom's servers become oblivious relays and never see the encryption keys." The launch version supported up to 200 participants and disabled join before host, cloud recording, streaming, live transcription, breakout rooms, polling, private chat and reactions. Zoom maintains its cryptography whitepaper in a public repository, at version 4.7 as of June 24, 2025.

The other vendors converged on the same trade:

- **Teams** offers E2EE for meetings to organizers with Teams Premium, up to 200 participants, and separately for one-to-one calls, where both parties see a 20-digit security code derived from the SHA-256 thumbprints of their endpoint certificates and can read it aloud. Recording, live captions and transcription, PSTN dial-in, breakout rooms, PowerPoint Live and Microsoft 365 Copilot are unavailable; web, VDI and Cloud Video Interop devices are blocked from joining; and a user subject to compliance recording can't use E2EE at all.
- **Webex** Zero-Trust E2EE uses MLS so participants derive a shared meeting key the service can't access, with SFrame for media, up to 1,000 participants; a security code changes as people join, and participants are marked verified or unverified. Cloud recording, transcription, the in-meeting AI assistant, PSTN and SIP calls, and the browser app are unavailable.

The admin decides, not the participant. In Teams, E2EE is an enhanced encryption policy: enabled by default for Premium meeting organizers, disabled by default for calls, and enforceable through meeting templates and sensitivity labels. That's the inversion this volume is built on ([Real-Time Chat](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)): a consumer platform decides whether calls are end-to-end encrypted for everyone, while a workplace vendor ships E2EE as a switch the customer's admin sets per group, because the same customer may need its board meetings unreadable by the vendor and its trading desk's calls recorded by law. Key custody, for meetings and beyond, is [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys#end-to-end-encrypted-meetings); the recording mandates are [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications).

## Large Meetings, Webinars and Town Halls

Past a thousand or so people, an SFU forwarding every speaker to every receiver stops being the right tool, and the products change shape:

- **Interactive meetings** let anyone unmute, share and turn on video. Teams caps them at 1,000 on enterprise plans.
- **Webinars** add registration, an attendee role that can't unmute by default, Q&A and reporting, while staying interactive. Teams events up to 1,000 attendees use webinar policy settings.
- **Broadcasts** (Teams town halls and events "optimized for large audiences") deliver video through a streaming pipeline: attendees can't turn on microphones or cameras on demand, "view the event at a slight delay," can pause and rewind, and are served through an enterprise content delivery network where one exists. Teams events go to 10,000 view-only attendees and to 100,000 with an add-on, with Microsoft recommending its own event services above 20,000.

Broadcast changes the network math inside a customer's offices. Microsoft's guidance is that without an eCDN, bandwidth "can be approximated at 2 Mbps per viewer at each location" (3 Mbps for 1080p), so a thousand employees in one building watching an all-hands would pull 2 Gbps through the internet edge; an eCDN (Microsoft's own or partners such as Hive, Kollective and Ramp) distributes the stream peer to peer or through caches inside the network. Producers can feed events from professional encoders over RTMP or SRT, the same ingest protocols as consumer live streaming ([Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#ingest-protocols)), and the latency tiers are the ones in [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#latency-tiers).

The product line churns. Microsoft retired Teams live events on June 30, 2026 in favor of the unified events experience, supporting events scheduled before then through February 28, 2027. A customer's runbook for the quarterly all-hands is therefore tied to a vendor roadmap, and an event platform's deprecations land on the customer's communications team.

## Breakout Rooms

Breakout rooms split one meeting into several and bring everyone back. They look like a UI feature and are a session-management one: each room is a sub-session with its own media routing, participants move between sessions without rejoining, hosts broadcast into all rooms, and assignments may be computed before the meeting.

The limits show where the cost sits, as of October 2026. Zoom allows up to 100 breakout rooms and pre-assignment of up to 1,000 participants, with those maximums requiring a Large Meeting add-on, and up to 200 breakout sessions in webinars. Teams allows breakout rooms only in meetings and events of up to 1,000 attendees, not in events optimized for large audiences, and "creating breakout rooms in a meeting or event automatically limits the number of attendees to 1,000." Breakouts also interact with encryption: they were among the first features both Zoom's and Microsoft's E2EE modes disabled.

## Interop With Rooms and Other Platforms

Workplace meetings inherit decades of room hardware that speaks SIP ([RFC 3261](https://www.rfc-editor.org/rfc/rfc3261), 2002) or ITU H.323, and customers routinely meet across vendors. Three mechanisms bridge them:

- **Gateways for standards-based rooms.** Microsoft's Cloud Video Interop is "a Microsoft Qualified third-party solution that enables third-party SIP and H.323 video room devices (VTCs) to join Microsoft Teams meetings," positioned explicitly as "an intermediate solution" for customers with 50 or more unqualified devices; the certified partners are Pexip, Cisco and Poly (powered by Pexip). Deploying it means the customer's admin consents to Graph application permissions that let the partner's service join calls as an app or as a guest and access media streams, which is the integration pattern this volume returns to in [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces): a third party gets read access to the tenant's meetings because the admin said yes.
- **Joining a foreign meeting as a guest.** Microsoft's SIP Guest Join lets a customer's CVI-enabled rooms join Teams meetings hosted by other organizations, with "no lobby bypass capability," and Teams Rooms can join Zoom, Webex and Google Meet meetings directly through a browser-based guest join ([Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office#joining-across-vendors)).
- **Phone dial-in** remains the universal fallback and the one every E2EE mode removes.

Interop is where the vendor's and the customer's interests diverge most visibly. Each vendor wants the customer's rooms on its own certified hardware; each customer has rooms bought from someone else and meetings hosted by companies that chose differently. The market answer has been gateways sold by third parties, priced per room or per scheduler, which the Teams documentation is candid about: the CVI license is needed "for each user who schedules meetings in which you want a CVI-enabled device to join."

## Meeting Security

The spring of 2020 made meeting security a public topic. In a post on April 1, 2020, Zoom said its daily meeting participants, free and paid, went from a maximum of about 10 million at the end of December 2019 to more than 200 million in March 2020; it announced a 90-day feature freeze to work on trust, safety and privacy, and acknowledged that "we have fallen short of the community's, and our own, privacy and security expectations." The abuse that named the period, strangers joining meetings whose links had been posted publicly and sharing obscene or hateful content, came from a product built for frictionless joining being used by schools, churches and public bodies with links on open web pages.

The controls that came out of it are now standard, and they are layered:

- **The lobby (waiting room).** People who aren't admitted automatically wait until an organizer admits them. The question is who bypasses it: everyone, people in the organization, people invited, or only organizers. Teams lets admins set defaults and organizers choose per meeting within them.
- **Authenticated join.** Requiring sign-in, or blocking anonymous users, ties every participant to an identity; Teams can require anonymous and unverified external presenters to verify before joining events.
- **Passcodes and unguessable IDs,** so links can't be enumerated.
- **Presenter controls.** Who can share screen, unmute or turn on video, set by default to organizers and presenters in large meetings.
- **In-meeting removal** and locking the meeting once it starts.
- **Link expiry.** Teams meeting links expire (in public preview as of October 2026): a one-time meeting 60 days after its scheduled time, a recurring series with no end date one year after its last use, with 60 days added each time a meeting is joined or updated. Expiry shrinks the stock of old links that still let someone in.
- **Watermarking** of shared content and video (a Teams Premium feature) to deter leaks from sensitive meetings.

Meetings also carry newer threats than uninvited guests: external chat and calls used for helpdesk impersonation, and malicious apps in meetings. Those belong to [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents) and the external-access settings in [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration#external-access-as-an-attack-surface).

## The Policy Stack

Every vendor resolves a meeting's settings through the same layering, and the layering is where "the customer's admin holds the decision" becomes code:

1. **Tenant policy**, set by the admin: may users record, transcribe, use AI, allow anonymous join, use E2EE, invite external presenters, stream out over RTMP.
2. **Group or user policy**, which overrides the tenant default for a population (executives get E2EE; the trading desk gets compliance recording; contractors can't record).
3. **Template or sensitivity label**, which a meeting inherits and which can lock options so the organizer can't change them.
4. **Organizer options**, chosen per meeting within what policy allows.
5. **In-meeting actions** by organizers and co-organizers.

Microsoft's events documentation lays this out as a table of features with one column for what admins control and one for what organizers control, and it is the honest description of a workplace meeting: almost every setting is "the admin can allow or prevent; if allowed, the organizer can choose." The admin consoles that hold these policies are [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies).

## How to Build It

The [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) treats a meeting series as a container (`containers.kind = 'meeting_series'`) and recordings as items. This chapter adds the meeting itself, the policy that governs it, the media sessions it runs on and who was in them. Recording, transcripts and consent are added in [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#how-to-build-it).

```sql
CREATE TABLE meeting_policies (            -- admin policy, assignable to tenant, group or member
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id             UUID NOT NULL REFERENCES workspaces (id),
  name                     TEXT NOT NULL,
  is_tenant_default        BOOLEAN NOT NULL DEFAULT FALSE,
  lobby_bypass             TEXT NOT NULL CHECK (lobby_bypass IN ('everyone', 'organization',
                             'invited', 'organizers_only')),
  anonymous_join           BOOLEAN NOT NULL,
  recording_allowed        BOOLEAN NOT NULL,
  transcription_allowed    BOOLEAN NOT NULL,
  ai_allowed               TEXT NOT NULL CHECK (ai_allowed IN ('off', 'during_only',
                             'during_and_after')),
  e2ee                     TEXT NOT NULL CHECK (e2ee IN ('not_allowed', 'organizer_may',
                             'required')),
  external_presenters      BOOLEAN NOT NULL,
  rtmp_out_allowed         BOOLEAN NOT NULL,
  max_interactive          INT NOT NULL,      -- from the plan; the SKU ladder lives in plans
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, name)
);

CREATE TABLE meeting_policy_assignments (  -- group or member overrides of the tenant default
  meeting_policy_id  UUID NOT NULL REFERENCES meeting_policies (id),
  principal_type     TEXT NOT NULL CHECK (principal_type IN ('group', 'member')),
  principal_id       UUID NOT NULL,
  priority           INT NOT NULL,          -- lower wins when a member is in several groups
  PRIMARY KEY (principal_type, principal_id, meeting_policy_id)
);

CREATE TABLE meetings (                    -- one scheduled or ad hoc occurrence
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id           UUID NOT NULL REFERENCES workspaces (id),
  container_id           UUID REFERENCES containers (id),   -- the meeting series, if recurring
  organizer_member_id    UUID NOT NULL REFERENCES members (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('meeting', 'webinar', 'broadcast',
                           'call')),
  ical_uid               TEXT,              -- RFC 5545 UID of the calendar event, when booked
  title                  TEXT,
  scheduled_during       TSTZRANGE,
  join_code_hash         BYTEA NOT NULL,    -- the unguessable part of the link
  passcode_hash          BYTEA,
  link_expires_at        TIMESTAMPTZ,
  options                JSONB NOT NULL,    -- organizer choices, validated against the
                                            -- effective policy when saved and at join
  locked_by_label        BOOLEAN NOT NULL DEFAULT FALSE,
  e2ee                   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meeting_sessions (            -- one continuous run of the media on a region's servers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  meeting_id         UUID NOT NULL REFERENCES meetings (id),
  parent_session_id  UUID REFERENCES meeting_sessions (id),  -- breakout rooms
  region             TEXT NOT NULL,         -- where the first joiner landed
  media_mode         TEXT NOT NULL CHECK (media_mode IN ('sfu', 'peer_to_peer', 'broadcast')),
  e2ee               BOOLEAN NOT NULL,      -- could the service see media in this session?
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at           TIMESTAMPTZ,
  end_reason         TEXT CHECK (end_reason IN ('ended_by_organizer', 'empty', 'time_limit',
                       'breakout_closed', 'failover', 'service'))
);

CREATE TABLE meeting_participants (        -- who was in which session, as what, from where
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  meeting_session_id  UUID NOT NULL REFERENCES meeting_sessions (id),
  member_id           UUID REFERENCES members (id),      -- null for anonymous and PSTN
  identity_kind       TEXT NOT NULL CHECK (identity_kind IN ('member', 'guest',
                        'external_federated', 'anonymous', 'pstn', 'room', 'interop_gateway',
                        'app')),
  display_name        TEXT NOT NULL,
  external_org        TEXT,                 -- the other tenant, for federated users
  app_installation_id UUID REFERENCES app_installations (id),  -- bots and gateways
  role                TEXT NOT NULL CHECK (role IN ('organizer', 'co_organizer', 'presenter',
                        'attendee')),
  lobby_waited        INTERVAL,             -- null if admitted directly
  admitted_by         UUID REFERENCES members (id),
  present_during      TSTZRANGE NOT NULL,
  client              TEXT,                 -- desktop, web, mobile, room, sip, h323, pstn
  left_reason         TEXT CHECK (left_reason IN ('left', 'removed', 'dropped',
                        'moved_to_breakout', 'meeting_ended'))
);
```

Notes on the sketch:

- **Effective policy is computed, then frozen at join.** Resolve tenant default, then the highest-priority group or member assignment, then template or label, then organizer options, and evaluate join (lobby, anonymous, E2EE capability of the client) against the result. Store the evaluated decision with the participant's join event so a later policy change doesn't rewrite why someone was admitted.
- **Join is a permission check that mints a short-lived media token,** naming the session, the identity and the granted capabilities (send video, share, unmute); the SFU enforces the token, never the client's claim. It's the same pattern as [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#how-to-build-it).
- **E2EE is a session property the server can prove.** If a session is E2EE, the recording, transcription and AI paths must refuse to start for it, and clients that can't do E2EE (browsers on older platforms, PSTN, gateways) are refused at join with a reason.
- **Breakouts are child sessions,** so "who was in the room where it was said" is answerable for each breakout, and moving between rooms is a leave and join with `moved_to_breakout`.
- **Non-human participants are participants:** rooms, interop gateways, recorders and notetaker bots each get a row with their app installation, which is what lets a recording-consent check or a compliance review see that a bot was present.
- **Events:** `meeting.created`, `meeting.started`, `meeting.participant_joined`, `meeting.participant_admitted`, `meeting.participant_removed`, `meeting.ended` and `meeting.policy_changed` feed attendance reports, the audit log, analytics and webhooks ([Webhooks](/docs/api-design/webhooks)).

## Auditing

- **Every policy change,** with the admin who made it and the before and after values, because "was recording allowed for this group on that date" is the question after an incident.
- **Every admission decision:** who waited in the lobby, who admitted them, and who joined anonymously or from another organization.
- **Every removal and every lock** of a meeting, with the actor.
- **Encryption state per session,** so what the vendor could have seen is a recorded fact, not a reconstruction.
- **Every app, gateway and bot that joined,** with the app installation and the admin consent behind it.
- **Attendance** for meetings whose attendance has legal weight (training completion, board meetings, regulated client calls), retained per the customer's policy rather than the vendor's. The audit store's design is [Audit Trails](/docs/architecture/audit-trails#what-a-record-holds); retention of these records is [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold).

## What This Means for the System You Build

- **Separate signaling from media,** and engineer media for UDP, ICE and relays from the first day; tell customers to split-tunnel it.
- **Host each meeting where its first participant is,** and treat that region as a residency fact you record.
- **Run an SFU with simulcast or SVC,** and keep mixing for PSTN, legacy rooms, recording and broadcast.
- **Adapt audio first, then screen share, then video,** with delay-based congestion control.
- **Implement the WebRTC codec floor** and negotiate newer codecs per participant.
- **Say "end-to-end" only when keys never reach your servers,** ship E2EE as an admin policy, and make recording, transcription and AI refuse E2EE sessions.
- **Switch large audiences to a broadcast pipeline** with an eCDN option, and keep breakout rooms inside the interactive limit.
- **Make interop a consented integration** with a recorded admin grant, and give gateways and bots participant rows.
- **Layer lobby, authenticated join, unguessable links, presenter controls and link expiry,** with admin defaults and organizer choices inside them.
- **Resolve settings through one policy stack** and record the decision at join.

## References

**Vendor documentation**

- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), meeting sizes by plan, recording length, breakout room limit, meeting link expiration, the 30-hour limit, live events retirement, OpenH264 in Firefox
- [Microsoft Learn: Plan for Teams events](https://learn.microsoft.com/en-us/microsoftteams/plan-events), event capacities, Attendee Capacity Pack, events optimized for large audiences, eCDN and 2 Mbps per viewer, RTMP and SRT in, admin and organizer controls
- [Microsoft Learn: Microsoft Teams call flows](https://learn.microsoft.com/en-us/microsoftteams/microsoft-teams-online-call-flows), signaling versus media, SRTP, UDP ports, ICE, Transport Relay, conference region, VPN guidance
- [Microsoft Learn: Prepare your organization's network for Teams](https://learn.microsoft.com/en-us/microsoftteams/prepare-network), bandwidth table, audio priority, split-tunnel VPN
- [Microsoft Learn: Manage end-to-end encryption for Teams meetings and one-to-one calls](https://learn.microsoft.com/en-us/microsoftteams/teams-end-to-end-encryption), Premium requirement, 200-participant limit, unavailable features, security code, policy defaults
- [Microsoft Learn: Cloud Video Interop for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/cloud-video-interop), certified partners, Graph permissions consent, SIP Guest Join, per-scheduler licensing
- [Microsoft Learn: Introduction to recording Teams calls, meetings, and events](https://learn.microsoft.com/en-us/microsoftteams/teams-recording-policy), what recordings don't capture
- [Microsoft Learn: Microsoft Teams Rooms licenses](https://learn.microsoft.com/en-us/microsoftteams/rooms/rooms-licensing), large gallery of up to 50 videos
- [Zoom: Zoom rolling out end-to-end encryption offering (October 14, 2020)](https://www.zoom.com/en/blog/zoom-rolling-out-end-to-end-encryption-offering/), technical preview, host-generated keys, oblivious relays, 200 participants, disabled features
- [Zoom: zoom-e2e-whitepaper repository](https://github.com/zoom/zoom-e2e-whitepaper), whitepaper version 4.7 of June 24, 2025
- [Zoom: A message to our users (April 1, 2020)](https://www.zoom.com/en/blog/a-message-to-our-users/), daily meeting participants, 90-day feature freeze, waiting rooms
- [Zoom Support: Managing meeting breakout rooms](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062540), 100 rooms, 1,000 pre-assigned participants, Large Meeting add-on
- [Zoom Support: Providing consent to be recorded](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059819), H.323/SIP participants in Zoom meetings
- [Google Meet Help: Meet participant limits](https://support.google.com/meet/answer/7317473), participant limits by Workspace edition and view-only beyond 500
- [Chrome for Developers: Improved video calling with faster AV1 encoding](https://developer.chrome.com/blog/av1), Meet's AV1 tests at 40 kbps and AV1 versus VP9 figures
- [Webex Help Center: End-to-end encryption for Webex Meetings and Webex Calling](https://help.webex.com/en-us/article/5h5d8ab), Zero-Trust E2EE with MLS and SFrame, 1,000 participants, unavailable features, verification

**Law and regulation**

- [FTC: FTC Requires Zoom to Enhance its Security Practices as Part of Settlement (November 9, 2020)](https://www.ftc.gov/news-events/news/press-releases/2020/11/ftc-requires-zoom-enhance-its-security-practices-part-settlement), the encryption and ZoomOpener allegations and the order's requirements
- [FTC: FTC Gives Final Approval to Settlement with Zoom (February 1, 2021)](https://www.ftc.gov/news-events/news/press-releases/2021/02/ftc-gives-final-approval-settlement-zoom-over-allegations-company-misled-consumers-about-its-data), the 3-2 vote of January 19, 2021 and final order terms
- [FTC Business Blog: Zooming in on Zoom's unfair and deceptive security practices](https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement), the "end-to-end AES 256-bit encryption" claim and the lower level delivered

**Standards**

- [RFC 8825: Overview: Real-Time Protocols for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc8825), the WebRTC protocol roadmap
- [W3C: WebRTC: Real-Time Communication in Browsers](https://www.w3.org/TR/webrtc/), the W3C Recommendation dated March 13, 2025
- [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667), mesh, mixers and selective forwarding middleboxes
- [RFC 8853: Using Simulcast in SDP and RTP Sessions](https://www.rfc-editor.org/rfc/rfc8853), simulcast negotiation
- [draft-ietf-rmcat-gcc-02: A Google Congestion Control Algorithm for Real-Time Communication](https://datatracker.ietf.org/doc/html/draft-ietf-rmcat-gcc-02), delay-based and loss-based controllers and their thresholds
- [RFC 7874: WebRTC Audio Codec and Processing Requirements](https://www.rfc-editor.org/rfc/rfc7874), Opus and G.711 required
- [RFC 7742: WebRTC Video Processing and Codec Requirements](https://www.rfc-editor.org/rfc/rfc7742), VP8 and H.264 Constrained Baseline required
- [RFC 9420: The Messaging Layer Security (MLS) Protocol](https://www.rfc-editor.org/rfc/rfc9420), group key agreement
- [RFC 9605: Secure Frame (SFrame)](https://www.rfc-editor.org/rfc/rfc9605), end-to-end media frame encryption through SFUs
- [RFC 3261: SIP: Session Initiation Protocol](https://www.rfc-editor.org/rfc/rfc3261), the signaling protocol of room systems and trunks

**Filings**

- [Zoom Communications 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), co-located data centers, AWS and Oracle Cloud, the Zoom Workplace product set
