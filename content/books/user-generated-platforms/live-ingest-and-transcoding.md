+++
title = "Live Streaming: Ingest & Transcoding"
nav_title = "Live Ingest & Transcoding"
description = "Getting a creator's live video in: RTMP, Enhanced RTMP, SRT and WHIP, stream keys, ingest routing, transcode versus transmux, and rationing capacity."
category = "User-Generated Platforms Industry"
order = 1817
part = "Media"
tags = ["user-generated-content", "live-streaming", "video", "transcoding", "ingest"]
+++

A live stream starts on hardware the platform doesn't control. A creator's encoder, usually OBS or a phone app, pushes a few megabits a second of video over a home connection to an address and a secret key the platform handed out, and from that moment the platform has a few seconds to accept the connection, decide where the video should be processed, turn one feed into a set of renditions every viewer's device and network can play, and keep doing it for hours while the creator's Wi-Fi drops, their GPU runs hot and a hundred thousand other creators do the same. Unlike an upload, there's no second chance: a segment that isn't produced on time is a stall every viewer sees, and a stream key that leaks is someone else broadcasting on the creator's channel.

The economics are as hard as the engineering. Server-side transcoding is the largest compute bill of a live platform, so every platform decides who gets a full ladder of renditions, who gets their source passed through unchanged, and who gets nothing extra, and the newest answer is to make the creator's own GPU do the encoding. This chapter covers the contribution side of live video: the ingest protocols (RTMP, Enhanced RTMP, SRT, WHIP), stream keys and ingest sessions, routing a stream from the edge to an origin with capacity, transcoding versus transmuxing, client-side multi-encode and vertical formats, rationing capacity, and simulcasting to other services. It extends the `streams` table in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). What happens after the renditions exist (latency tiers, distribution, recording, clips) is [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods); the live chat beside the video is [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity); on-demand encoding ladders are [Video on Demand](/books/user-generated-platforms/video-on-demand); multi-party real-time rooms are Voice & Live Rooms; detecting a livestreamed attack is Terrorism, Violent Extremism & Graphic Content; and copyrighted music in a stream is Copyright at Scale.

## How the Platforms Do It

What each platform or vendor publicly says it accepts from a creator's encoder, and what it does with it, as of October 2026:

| Platform or vendor | Ingest protocols | Input codecs | Input limits | Server processing |
| --- | --- | --- | --- | --- |
| **Twitch** | RTMP; Enhanced RTMP multitrack for Enhanced Broadcasting; its ingest edge also terminates WebRTC | H.264; HEVC for the 2K beta; AV1 described for RTX 40 GPUs | Not published in a source opened for this chapter | Transcodes a ladder and transmuxes the top rendition; server transcodes kept "as needed" beside client-side multi-encode |
| **YouTube Live** | RTMP, RTMPS, HLS, DASH | H.264 over RTMP(S); H.264 and HEVC over HLS; H.264 and VP9 over DASH; HEVC and AV1 in its encoder settings | Up to 60 fps; keyframes every 2 seconds, never over 4 | Transcodes every stream |
| **Kick** | RTMP (OBS, XSplit, Streamlabs, MELD) | H.264 only | 1920x1080, 8,000 kbps, 60 fps, CBR, 2-second keyframes | Not published |
| **Amazon IVS** | RTMPS (port 443, TLS 1.2+), RTMP, SRT (port 9000), Enhanced RTMP multitrack | H.264 and AAC-LC single-track; HEVC possible with multitrack | 1080p (2.1 million pixels, 1,920 per edge); 8.5 Mbps single-track, 15 Mbps multitrack; one stream key per channel | Four channel types: transcode, transcode to a lower ceiling, or transmux |
| **Cloudflare Stream** | RTMPS, SRT; WHIP for WebRTC inputs | VP9, VP8 and H.264 Constrained Baseline over WHIP | Not published | Multiple qualities for RTMPS and SRT, every stream recorded; WHIP inputs played only over WHEP |
| **Mux** | Not covered here | Not covered here | Not covered here | A reconnect window holds the stream open; restreams to up to six RTMP or RTMPS targets |

Four patterns hold across them. **RTMP is still the front door.** Every platform takes it, because every encoder speaks it, and the newer protocols arrive beside it rather than replacing it. **The platform dictates the encoder settings.** Kick, YouTube and IVS all ask for constant bitrate and a keyframe every two seconds, because the server's segments and renditions have to line up with the creator's keyframes. **Transcoding is a tiered, metered resource:** IVS sells it per input hour at prices that differ by 10 times between its cheapest and dearest channel type, and Twitch has historically given full transcoding to some creators and not others. **The encoding is moving to the creator's machine:** Twitch's Enhanced Broadcasting and IVS's multitrack input have the broadcaster's GPU produce the ladder and the server only repackage it.

## Ingest Protocols

The contribution protocol carries one creator's feed from their encoder to the platform's edge. Each protocol trades compatibility, resilience on bad networks and latency differently:

| Protocol | Transport | Standing | What it brings | What it costs |
| --- | --- | --- | --- | --- |
| **RTMP / RTMPS** | TCP; RTMPS adds TLS | The legacy RTMP and FLV specifications, which Enhanced RTMP keeps compatible | Every encoder and every platform speaks it; RTMPS encrypts the key and the video | Without the enhancements, platforms take H.264 and AAC (Kick, IVS single-track); TCP stalls behind lost packets on a bad uplink |
| **Enhanced RTMP** | Same as RTMP | Veovera specification; v2 is a release version dated January 31, 2026 | FourCC codec signaling for HEVC, VP8, VP9, AV1 and VVC video and Opus, FLAC, AC-3 and E-AC-3 audio; HDR; multiple audio and video tracks in one connection; a server-initiated reconnect request | Encoder and server both need the extension; it inherits TCP's behavior |
| **SRT** | UDP with selective retransmission | Published by its developers; the IETF draft (draft-sharabayko-srt-01) is an expired individual submission, not a standard | Retransmits lost packets within a latency window, drops packets that arrive too late, AES encryption (128-bit by default, up to 256), a stream ID of up to 512 bytes to say which stream a connection carries | Fewer consumer encoders than RTMP; the latency window has to be tuned to the network |
| **WHIP** | WebRTC (UDP, ICE, DTLS), signaled over HTTP | RFC 9725, IETF Standards Track, March 2025 | Publishing from a browser with no app; sub-second contribution; HTTP redirects and bearer tokens for routing and auth | One audio and one video track per session; WebRTC codecs; what the platform can do downstream is narrower (below) |
| **HLS / DASH push** | HTTP segments | HLS and DASH, delivery formats repurposed for contribution | YouTube takes HEVC and HDR over HLS and VP9 over DASH, which is its recommended path for 4K | Segment-based, so YouTube says neither is suitable for ultra-low latency |

**WHIP in detail,** because it is the only one with a current IETF standard. The encoder sends an SDP offer in an HTTP POST with content type `application/sdp`; the server answers `201 Created` with its SDP answer and a `Location` header naming the session; trickle ICE candidates and ICE restarts go by PATCH; a DELETE to the session URL ends the broadcast. Every WHIP client must implement bearer token authentication, so the stream key becomes an HTTP `Authorization` header rather than part of a URL. Redirects must be `307 Temporary Redirect` (301 and 302 are forbidden because they can turn the POST into a GET), and an overloaded endpoint may answer `503` with `Retry-After`, which gives the platform a standard way to steer a broadcaster to another ingest point. The limits matter for product design: a WHIP session carries a single media stream with at most one audio and one video track, and Cloudflare's WebRTC product, generally available and billing since October 15, 2026, plays WHIP inputs only over WHEP: no recording, no HLS playback and no simulcast for those inputs yet. A WebRTC-in, WebRTC-out path is a different product from a broadcast ([Real-Time Stages](/books/user-generated-platforms/live-latency-and-vods#real-time-stages)).

My default for a new platform: accept RTMPS as the baseline (and plain RTMP only for encoders that can't do TLS, as IVS allows by configuration), Enhanced RTMP for multitrack and modern codecs, SRT for creators on lossy or long-haul connections (IRL streamers, events), and WHIP for in-browser and in-app go-live. Terminate every one of them at the edge into one internal format so nothing past the edge cares which protocol the creator used; Twitch describes exactly that split, with a media proxy that terminates RTMP or WebRTC and converts to an internal canonical protocol.

## Stream Keys and Sessions

A stream key is a long-lived bearer credential: whoever holds it can broadcast on the channel. It appears in the RTMP URL path (`rtmps://<ingest>/app/<key>` on IVS), in an SRT `streamid` parameter beside a passphrase, or as a WHIP bearer token. Because creators paste it into third-party software, share it with production crews and leave it in screenshots, it leaks, and a leaked key lets a stranger broadcast anything (including content that gets the channel penalized) under the creator's name. The rules that follow:

- **One active key per channel, rotatable on demand.** IVS allows exactly one stream key per channel; Kick tells creators that after a reset they must update their streaming software with the new key. Rotation is the fix for a leak, so it must be a single click and must cut off a live session using the old key.
- **Revealing the key is a sensitive action.** Showing or resetting a key belongs behind the same step-up check as changing a payout account ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)), and a recovered account rotates its key as part of recovery ([Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense)).
- **Stored so it can be checked fast.** Ingest looks a key up on every connection attempt, from every edge. Keep a keyed hash (HMAC) for the lookup and, if the dashboard must show the key again, an encrypted copy under the platform's key management ([Encryption at Rest](/docs/security/encryption-at-rest)), never plaintext.
- **Penalties and quotas are checked at connect.** A channel suspended from streaming, a creator under a live restriction after a copyright strike (Copyright at Scale) or a region over its concurrent-stream quota is refused at the edge with a reason, not after the stream is public.

**A stream is not a connection.** A creator's broadcast survives several encoder connections: Wi-Fi drops, a switch from Wi-Fi to cellular, an encoder restart, a backup encoder taking over. The platform therefore separates the **stream** (the core model's `streams` row: one broadcast with a title, viewers and a recording) from **ingest sessions** (each connection that fed it), and holds the stream open for a **reconnect window** after a disconnect:

- **Mux** keeps a live stream open for 60 seconds by default for standard latency streams and zero seconds for reduced and low latency ones, adjustable from 0 to 1,800 seconds; during the window it can show a slate (the last frame, then a slate image after half a second), and a reconnect within the window continues the same playlist and the same recording. If the encoder doesn't return, the playlist is closed with `EXT-X-ENDLIST` and the stream goes idle; going live again later creates a new asset.
- **IVS** calls the same idea **stream takeover**: a new connection with a higher `priority` parameter on its key replaces the running one without disconnecting viewers or splitting the recording, provided resolution, codecs and track count match. Up to 100 takeovers are allowed per stream by default, and IVS's mobile broadcast SDK uses takeover to reconnect automatically up to five times, incrementing the priority each time.
- **Enhanced RTMP** adds the server side of the same need: a `NetConnection.Connect.ReconnectRequest` status tells the encoder to reconnect, optionally to a different server URL, at the next media boundary such as a keyframe, while the old server keeps processing until the client leaves. That's how an ingest server drains for maintenance without dropping a broadcast.

Takeover and reconnect are also an attack surface: anything that can present the key with a higher priority wins the channel. My rule: a takeover from a different network or client than the running session is an event the creator sees, and a channel can turn takeover off.

## Ingest Routing

The ingest edge is where a creator's connection lands; the **origin** is where its video is transcoded. The edge should be close to the creator (a long TCP path from a home uplink costs quality); the origin should be wherever there's spare transcoding capacity and backbone headroom. Connecting the two is a routing decision made per stream, at connect time and again when capacity changes.

Twitch's public history is the reference for why this needs its own service. Its original design had one origin in Silicon Valley and HAProxy in each of its points of presence forwarding streams to it. As origins multiplied, static configuration sent each PoP's streams to a single origin, which left capacity idle as load moved around the world through the day and made surges and failovers hard. Its replacement, **Intelligest** (described in April 2022), has three parts:

- **A media proxy in every PoP** ("nearly a hundred" of them, on a private backbone) that terminates the creator's protocol, extracts the stream's properties and asks where to send it.
- **The Intelligest Routing Service** in AWS, a stateful controller that picks the origin. It began as an offline optimization solved periodically and now runs a randomized greedy algorithm in real time, maximizing use of origin compute within each origin's and each backbone link's limits.
- **Two capacity feeds:** Capacitor, which tracks compute available in each origin (including capacity lost to maintenance), and The Well, which tracks backbone link utilization and availability.

Twitch says the result uses "100% of the compute resources available to Twitch at the peak times," and its 2023 State of Engineering describes the same shape at larger scale: edges that connect to local ISPs, origins with "hundreds to thousands of servers dedicated to transcoding," and a backbone carrying "hundreds of thousands of simultaneous live video streams." The rented services hide this layer but keep its shape: IVS describes its data plane as global, with ingest near the broadcaster and a regional control plane.

What a routing service needs, whoever builds it:

- **Inputs:** the stream's properties (resolution, frame rate, codec, bitrate, track count), the channel's processing tier (below), live origin capacity and link utilization, and any placement constraint (a jurisdiction the stream must stay in, an origin with hardware for a codec).
- **Outputs:** an origin, and the transcode mode and ladder to run there, recorded on the ingest session so the decision can be explained later.
- **Moves:** draining an origin means asking encoders to reconnect elsewhere (Enhanced RTMP's reconnect request, a WHIP `307` or `503 Retry-After`) or re-homing the stream inside the backbone without the creator noticing.

The generic edge mechanics (sticky routing, draining, avoiding reconnect stampedes) are the playbook's [Realtime Connections](/docs/architecture/realtime-connections#edge-and-routing); the live-video twist is that the scarce resource behind the edge is transcoding compute, not connection slots.

## Transcode or Transmux

**Transcoding** decodes the creator's feed and re-encodes it into several renditions at lower resolutions and bitrates, so a viewer on a phone on a train gets 360p and a viewer on fiber gets 1080p, and the player switches between them as bandwidth changes. **Transmuxing** repackages the creator's encoded video into the delivery format (RTMP in, HLS segments out) without re-encoding: almost free in compute, but viewers get exactly what the creator sent, at exactly that bitrate.

Twitch's 2017 description of its transcoder is the clearest public account of how a live ladder is built:

- **A ladder from one source.** A 6 Mbps 1080p60 H.264 source becomes 1080p60, 720p60, 720p30 and 480p30 HLS renditions.
- **The top rung is transmuxed.** The 1080p60 output is the source passed through, which saves the most expensive encode and loses no quality; the cost is that the platform no longer controls that rendition's encoding, which Twitch notes can break strict HLS compliance.
- **Keyframes line up across renditions.** Each rendition's IDR (keyframe) interval is two seconds, equal to the HLS segment length, and scene-cut keyframes are disabled, so segment boundaries align in every rendition and a player can switch between them at any segment. Because the transmuxed rung's keyframes are the creator's, the platform has to require a fixed two-second interval from the encoder, which is why Kick, YouTube and IVS all ask for it (IVS warns that intervals over five seconds mean it can't guarantee every segment starts with a keyframe, and YouTube says never to exceed four).
- **Shared work.** One decoder feeds every output, and renditions at the same resolution share a scaler, because decoding and scaling are a large share of the cost.
- **Frame-rate families.** A 50 fps (PAL) source steps down to 25 fps, not 30, for lower rungs.
- **Platform metadata.** Owning the transcoder let Twitch insert its own metadata into the output for its player to parse, which an off-the-shelf FFmpeg pipeline didn't give it.

Amazon IVS sells the choice as **channel types**, which make the trade-off and its price explicit (input prices as of October 2026):

| IVS channel type | Processing | Ladder from a 1080p60 input | Input price per hour |
| --- | --- | --- | --- |
| `STANDARD` (single-track) | Transcode, source passed through as the top rung | Source; 720p60 at 3.4 Mbps; 480p30 at 1.4 Mbps; 360p30 at 0.63 Mbps; 160p30 at 0.23 Mbps | $2.00 |
| `STANDARD` with multitrack input | Transmux of tracks the creator's encoder produced | Chosen per session for the creator's hardware, capped by the channel's maximum resolution | $0.50 |
| `ADVANCED_HD` | Transcode to a 720p ceiling, two presets, audio-only rendition | 720p60 at 3 Mbps; 480p30 at 1.3 Mbps; 360p30 at 0.7 Mbps; 160p30 at 0.27 Mbps; audio only at 64 kbps (higher-bandwidth preset) | $0.85 |
| `ADVANCED_SD` | Transcode to a 480p ceiling, two presets | 480p30 at 1.3 Mbps; 360p30 at 0.7 Mbps; 160p30 at 0.27 Mbps; audio only | $0.50 |
| `BASIC` | Transmux only, one rendition | The source, capped at 3.5 Mbps (1.5 Mbps at 480p) | $0.20 |

The table is also a lesson in what drives the bill. Input processing is charged per stream-hour whether one person watches or a million, so for a long tail of small channels (most of a user-generated platform's streams) the transcode is the cost and delivery is small; for a few huge channels it's the reverse ([Cost per Viewer-Hour](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour)). IVS also enforces the input envelope at the door: exceed the channel type's bitrate or resolution and "the stream probably will disconnect immediately," which is the right behavior for a platform too. A feed that breaks the contract should be refused with a reason the creator's software can show, not accepted and transcoded badly.

At the top of the market the answer to transcode cost has been custom hardware. Twitch reported in 2023 a prototype server that transcodes at "over 10x the scale" of its previous solution with better quality. Below that scale, the choice is a vendor's channel type, GPUs in a rented fleet, or CPU encoders, and the ladder itself is a versioned rule (which rungs, which bitrates, which codecs) the platform owns as data, whoever runs the encoders ([Encoding Ladders and Per-Title Encoding](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding)).

## Client-Side Multi-Encode

The creator's PC usually has a GPU with hardware encoders sitting partly idle. **Client-side multi-encode** uses it: the broadcast software encodes the whole ladder locally and sends every rendition as a separate track in one Enhanced RTMP connection, and the platform transmuxes them instead of transcoding.

- **Twitch Enhanced Broadcasting** (closed beta from January 2024) creates "multiple encodings of your stream using dedicated encoder resources in your GPU," initially on NVIDIA GeForce RTX cards in a Twitch build of OBS, with automatic configuration from the machine's processing power and upload bandwidth. Twitch said it would keep providing server-side transcodes as needed, cited AV1 as "40% more efficient" than AVC (on RTX 40 series GPUs), and in May 2025 used Enhanced Broadcasting to open a 2K (1440p) beta with HEVC to Partners and Affiliates through a waitlist.
- **Amazon IVS multitrack video** documents the mechanism end to end. The broadcast software calls `GetClientConfiguration` with the creator's preferences (canvas resolution, maximum aggregate bitrate, frame rate) and hardware details (GPU model, memory and driver, OS and CPU, system memory); a server-side algorithm ranks candidate configurations and returns one; the software then sends the agreed tracks over Enhanced RTMP. Fallbacks run from five renditions at 10.2 Mbps aggregate (1080p, 720p, 480p, 360p, 160p) down to two at 1.5 Mbps (480p and 360p), across H.264 and HEVC; the recommended setup for full HD is an NVIDIA GeForce 900-series or AMD Radeon RX 6000 GPU or newer, 12 Mbps of sustained upload and OBS Studio 30.2 or later. Multitrack requires fragmented MP4 output, because HEVC doesn't fit the MPEG-2 transport stream format.

Three design consequences:

- **The platform still decides the ladder.** The client proposes its capabilities; the server chooses the configuration; and IVS disconnects a client whose track count, resolution, frame rate, codec or bitrate doesn't match what it was told to send. A client-encoded ladder is untrusted input until checked, the same as an upload ([Validation and Hostile Files](/books/user-generated-platforms/upload-path#validation-and-hostile-files)).
- **The configuration call collects device data.** GPU model, driver and OS versions are telemetry about the creator's machine; they belong in the privacy notice and the retention schedule, not just the encoder settings.
- **It moves cost to the creator and price to the channel.** IVS charges $0.50 an hour for multitrack input against $2.00 for a standard transcoded channel, a 75% cut in the input line, and lets a channel's policy either allow or require multitrack clients "to optimize for lower cost." Requiring it shuts out creators on weak machines and phones, the people transcoding helps most, so a platform that requires it needs a server-side fallback tier.

**Vertical and dual format.** The same multitrack connection can carry different layouts, not just different sizes. Twitch announced in May 2025 that Enhanced Broadcasting streamers could send a horizontal and a vertical layout at once (desktop viewers see landscape, a phone held upright sees the vertical layout), first through OBS with the Aitum Vertical plugin, and moved dual format into beta in October 2025 with Streamlabs, Streamrun and StreamElements support, alongside native vertical streaming from phones and hands-free streaming from AI glasses through Meta's wearables toolkit. For the data model this means a track has a layout as well as a resolution, a stream can have two "top" renditions, and players, clips and thumbnails pick a layout, which is why the sketch below records each track's layout.

## Capacity Rationing

Transcoding capacity, backbone bandwidth and delivery in expensive regions are finite, and every live platform rations them; the choice is whether the rules are explicit.

- **Who gets transcoded.** OBS's knowledge base, describing Twitch in 2021, summarized it as Partners "guaranteed full access," Affiliates "as available, with priority," and all other streamers "as available (essentially distributes whatever is left)," while YouTube transcodes every stream. A creator without transcodes gets source only, which viewers on weak connections can't play smoothly, so transcoding tier is a growth lever and a fairness question as much as a cost.
- **Source caps where delivery is dear.** Twitch said in December 2023 that its network fees in South Korea were "10 times more expensive than in most other countries"; it tested peer-to-peer delivery for source quality, then capped source quality at 720p, and still closed its Korean business on February 27, 2024. A cap by region is a delivery rule applied at ingest: the origin produces nothing above the cap for viewers there.
- **Concurrent streams and views.** IVS's default quotas are 100 concurrent streams and 15,000 concurrent views per AWS region, both adjustable; a stream beyond the stream quota "is rejected," and IVS tells customers to raise limits before a large event. A platform's own fleet has the same ceilings without the documentation.
- **Input envelopes.** Maximum resolution, frame rate and bitrate per tier (Kick's 1080p, 60 fps and 8,000 kbps; IVS's 8.5 Mbps single-track and 15 Mbps multitrack) bound the worst case per stream, so capacity planning can count streams rather than guess at bitrates.

My rule: write the tiers down as data (which creators get which processing, in which regions, with which caps, at what priority when capacity runs short) and record on each ingest session what it was granted and why ([Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided)). Degrade in a fixed order when origins fill: drop the smallest audience's extra rungs first, never refuse a creator who already has viewers, and keep a reserve for scheduled large events. The general machinery of priority classes and shedding is the playbook's [Admission Control](/docs/architecture/admission-control#priority-classes); the unit cost that justifies each tier is [Cost per Unit](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total), and Operating Metrics tracks it.

## Simulcasting and Exclusivity

Creators want to broadcast to several services at once; platforms want the audience on their own chat, ads and subscriptions. The rules are product policy that the ingest layer has to carry.

**Twitch's rules,** announced at TwitchCon on October 20, 2023, allow simulcasting to any service "unless you have an agreement with Twitch that requires exclusivity," on conditions: the Twitch experience must not be compromised (quality on Twitch at least matching the simulcast), the streamer must keep engaging with the Twitch community through chat, must not link or direct viewers to leave Twitch, and may not show third-party services that combine activity from other platforms on the Twitch stream (merged chat overlays), though tools for the streamer's own use are allowed. Each condition maps onto something the platform can observe or must take on trust: input quality from the ingest session; chat engagement from the chat service ([Shared Chat](/books/user-generated-platforms/live-chat-and-interactivity#shared-chat) is the native cross-channel version); exclusivity from the creator's contract.

**Simulcasting as a feature.** The other direction is to offer it: Mux forwards a live stream to up to six RTMP or RTMPS targets (YouTube, Facebook, Twitch or any RTMP server), configured only while the stream is inactive and billed on top of live streaming, and Cloudflare's WHIP inputs can't be restreamed yet. A platform that restreams holds the creator's stream keys for other services, which are credentials like its own: encrypted, never shown in logs, revocable, and deleted when the creator disconnects the destination.

For the data model, exclusivity is a contract term with dates, held with the creator's program terms (Creator Monetization), and the go-live check reads it; simulcast targets are per-channel configuration with encrypted credentials.

## How to Build It

The chapter's additions to the core model: a channel's ingest profile on `streams`, stream keys, ingest sessions and their tracks, and simulcast targets. Channels are `communities` rows with `kind = 'channel'`.

```sql
ALTER TABLE streams
  ADD COLUMN ingest_profile   TEXT NOT NULL DEFAULT 'standard'
                                CHECK (ingest_profile IN ('standard', 'reduced',
                                  'passthrough', 'multitrack')),  -- as resolved at go-live
  ADD COLUMN processing_tier  TEXT NOT NULL DEFAULT 'as_available'
                                CHECK (processing_tier IN ('guaranteed', 'priority',
                                  'as_available', 'source_only')),
  ADD COLUMN source_cap_height INT,          -- e.g. 720 where delivery is capped; null: none
  ADD COLUMN reconnect_window_s INT NOT NULL DEFAULT 60
                                CHECK (reconnect_window_s BETWEEN 0 AND 1800);

CREATE TABLE stream_keys (               -- a bearer credential for one channel
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id     UUID NOT NULL REFERENCES communities (id),
  key_lookup     BYTEA NOT NULL UNIQUE,  -- HMAC of the secret; what ingest looks up
  key_ciphertext BYTEA,                  -- only if the dashboard re-shows the key
  key_hint       TEXT NOT NULL,          -- last characters, for the creator to recognize it
  created_by     UUID NOT NULL REFERENCES accounts (id),
  valid_during   TSTZRANGE NOT NULL,     -- closed on rotation or revocation
  revoked_reason TEXT CHECK (revoked_reason IN ('user_reset', 'suspected_leak',
                   'account_recovery', 'penalty', 'channel_closed')),
  EXCLUDE USING GIST (channel_id WITH =, valid_during WITH &&)  -- one live key per channel
);

CREATE TABLE ingest_sessions (           -- one encoder connection feeding a stream
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  stream_id            UUID REFERENCES streams (content_item_id),  -- null if rejected first
  channel_id           UUID NOT NULL REFERENCES communities (id),
  stream_key_id        UUID REFERENCES stream_keys (id),           -- null: unknown key
  protocol             TEXT NOT NULL CHECK (protocol IN ('rtmp', 'rtmps', 'enhanced_rtmp',
                         'srt', 'whip', 'hls_push', 'dash_push')),
  edge_pop             TEXT NOT NULL,    -- where the connection landed
  origin               TEXT,             -- where routing sent it
  routing_reason       JSONB,            -- inputs and rule version behind the choice
  client_software      TEXT,             -- encoder name and version, as reported
  client_ip            INET,             -- personal data; on the retention schedule
  video_codec          TEXT,
  audio_codec          TEXT,
  width                INT,
  height               INT,
  frame_rate           NUMERIC(6,3),
  keyframe_interval_ms INT,
  input_bitrate_kbps   INT,
  transcode_mode       TEXT CHECK (transcode_mode IN ('transcode', 'transmux',
                         'client_multitrack')),
  ladder_version       TEXT,             -- the encoding ladder rule applied
  takeover_priority    INT,
  state                TEXT NOT NULL CHECK (state IN ('connecting', 'live', 'reconnecting',
                         'ended', 'rejected')),
  reject_reason        TEXT CHECK (reject_reason IN ('unknown_key', 'key_revoked',
                         'streaming_restricted', 'over_quota', 'over_bitrate',
                         'over_resolution', 'unsupported_codec', 'track_mismatch',
                         'exclusivity')),
  end_reason           TEXT CHECK (end_reason IN ('encoder_disconnect',
                         'reconnect_window_expired', 'taken_over', 'key_rotated',
                         'stopped_by_moderation', 'stopped_by_platform', 'drained')),
  moderation_decision_id UUID REFERENCES moderation_decisions (id),  -- when moderation stopped it
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at             TIMESTAMPTZ,
  CHECK ((state = 'rejected') = (reject_reason IS NOT NULL)),
  CHECK (end_reason <> 'stopped_by_moderation' OR moderation_decision_id IS NOT NULL)
);

CREATE UNIQUE INDEX ingest_sessions_one_live
  ON ingest_sessions (stream_id)
  WHERE state IN ('connecting', 'live');   -- a takeover ends the old session first

CREATE TABLE ingest_tracks (             -- tracks a multitrack client sent
  ingest_session_id UUID NOT NULL REFERENCES ingest_sessions (id),
  kind              TEXT NOT NULL CHECK (kind IN ('video', 'audio')),
  track_id          SMALLINT NOT NULL,   -- Enhanced RTMP trackId; 0 is the default track
  codec             TEXT NOT NULL,
  width             INT,
  height            INT,
  frame_rate        NUMERIC(6,3),
  bitrate_kbps      INT NOT NULL,
  layout            TEXT CHECK (layout IN ('horizontal', 'vertical')),  -- video only
  language          TEXT,                -- BCP 47; audio only
  PRIMARY KEY (ingest_session_id, kind, track_id)
);

CREATE TABLE simulcast_targets (         -- other services a channel restreams to
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id         UUID NOT NULL REFERENCES communities (id),
  service            TEXT NOT NULL,      -- 'youtube', 'custom_rtmp', ...
  url                TEXT NOT NULL,
  key_ciphertext     BYTEA NOT NULL,     -- the other service's stream key, encrypted
  enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  created_by         UUID NOT NULL REFERENCES accounts (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at         TIMESTAMPTZ
);
```

Notes on the sketch:

- **Streams outlive connections.** A stream goes `live` on its first accepted session and stays live while a session is `live` or `reconnecting` within `reconnect_window_s`; it moves to `ended` (or `interrupted` when moderation or the platform stopped it) when the window expires. A takeover ends the running session with `taken_over` and inserts the new one in the same transaction, which the partial unique index enforces.
- **Rejections are rows.** A refused connection still gets an ingest session with a reason, because "why can't I go live" is the most common creator support question and repeated unknown-key attempts are the signal of a leaked or guessed key.
- **Routing is explainable.** `origin`, `routing_reason`, `transcode_mode`, `ladder_version` and the stream's `processing_tier` record what the platform gave this broadcast and under which rule version, so a creator's complaint about missing quality options, or a capacity incident, can be answered from data.
- **Keys are ranges.** Rotation closes the old key's `valid_during` and opens a new one; the exclusion constraint keeps one active key per channel. The ingest edge caches the lookup with a short lifetime and subscribes to rotations so a revoked key stops working within seconds, including for a session already live (`end_reason = 'key_rotated'`).
- **Moderation stops are decisions.** An ingest session ended by moderation points at the decision in the [Trust & Safety](/docs/security/trust-and-safety) tables; detection on live video (sampled frames and audio from the origin) and the incident protocol for a livestreamed attack are Terrorism, Violent Extremism & Graphic Content.
- **Events:** `stream.ingest_connected`, `stream.ingest_rejected`, `stream.started` (core), `stream.reconnecting`, `stream.taken_over`, `stream.ended` (core), `stream_key.rotated` and `simulcast_target.changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the player and distribution layer, notifications ("now live"), chat, recording and analytics.

## Auditing

- **Every key issued and revoked,** with who did it and why, so a broadcast by an intruder can be told apart from the creator's own and the channel's penalties attributed fairly.
- **Every ingest session and rejection,** with protocol, edge, origin, client software and IP, kept on the retention schedule: they answer takeover investigations, "who was broadcasting at 3 a.m.," and law enforcement requests (Law Enforcement Requests & User Data).
- **What processing each stream got,** tier, transcode mode, ladder version and source cap, so tier rules can be shown to have been applied as written, and per-tier cost reconciles with the vendor's invoice.
- **Every stop,** by moderation, platform action or key rotation, linked to its decision, with the time the ingest actually stopped, because a regulator or court asking about a livestreamed incident asks how fast it ended.
- **Simulcast destinations and exclusivity checks,** with dates, for disputes over a creator's contract.

## What This Means for the System You Build

- **Accept RTMPS as the baseline,** add Enhanced RTMP, SRT and WHIP for the creators who need them, and terminate all of them into one internal format at the edge.
- **Treat the stream key as a credential:** one active key per channel, HMAC for lookup, step-up to reveal, instant rotation that cuts off live sessions.
- **Separate streams from ingest sessions,** with a reconnect window, takeover rules and a recorded reason for every end and every rejection.
- **Route ingest to origins by live capacity,** not static configuration, and record each routing decision with its inputs.
- **Require the encoder settings your segments depend on:** constant bitrate and a fixed two-second keyframe interval.
- **Transmux the top rendition** where quality allows, and keep the ladder as a versioned rule you own.
- **Use client-side multi-encode to cut cost,** validate every client-encoded track against what the server agreed, and keep a server transcode tier for creators who can't encode.
- **Write rationing rules down as data:** who gets which processing, where sources are capped, what degrades first when capacity runs short.
- **Record a track's layout,** not only its size, so vertical and dual-format streams survive into playback, clips and thumbnails.
- **Model simulcast rules and destinations explicitly,** with exclusivity as a dated contract term and other services' keys encrypted.

## References

**Standards and specifications**

- [IETF: RFC 9725, WebRTC-HTTP Ingestion Protocol (WHIP)](https://www.rfc-editor.org/rfc/rfc9725.html), POST of the SDP offer, 201 with Location, PATCH for ICE, DELETE to end, mandatory bearer tokens, one track per kind, 307 redirects and 503 with Retry-After (March 2025, Standards Track)
- [IETF: The SRT Protocol (draft-sharabayko-srt-01)](https://datatracker.ietf.org/doc/draft-sharabayko-srt/), status as an expired individual submission not endorsed by the IETF
- [IETF: draft-sharabayko-srt-01 full text](https://www.ietf.org/archive/id/draft-sharabayko-srt-01.txt), selective retransmission, latency window and too-late packet drop, AES-128 default up to AES-256, caller-listener and rendezvous modes, the 512-byte stream ID
- [Veovera: Enhanced RTMP](https://github.com/veovera/enhanced-rtmp), added codecs, FourCC signaling, multitrack and reconnect request, v1 and v2 documents
- [Veovera: Enhanced RTMP v2](https://veovera.org/docs/enhanced/enhanced-rtmp-v2), release version of January 31, 2026, trackId-based multitrack, `NetConnection.Connect.ReconnectRequest` with optional redirect, VVC carriage, backward compatibility

**Platform engineering**

- [Twitch: Twitch engineering, an introduction and overview (2015)](https://blog.twitch.tv/en/2015/12/18/twitch-engineering-an-introduction-and-overview-a23917b71a25/), RTMP ingest, transcode to HLS, distribution and VOD subsystems
- [Twitch: Live video transmuxing and transcoding (2017)](https://blog.twitch.tv/en/2017/10/10/live-video-transmuxing-transcoding-f-fmpeg-vs-twitch-transcoder-part-i-489c1c125f28/), the example ladder, transmuxed top rendition, two-second IDR interval equal to segment length, no scene-cut keyframes, shared decoder and scalers, 25 fps for PAL sources, inserted metadata
- [Twitch: Ingesting live video streams at global scale (2022)](https://blog.twitch.tv/en/2022/04/26/ingesting-live-video-streams-at-global-scale/), nearly a hundred PoPs, the HAProxy design and its limits, Intelligest proxy, routing service, Capacitor, The Well, randomized greedy routing, 100% compute use at peak
- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), edges and origins, hundreds of thousands of simultaneous streams, the over-10x ASIC transcode prototype
- [Twitch: Introducing the Enhanced Broadcasting beta](https://blog.twitch.tv/en/2024/01/08/introducing-the-enhanced-broadcasting-beta), GPU multi-encode, automatic configuration, server transcodes as needed, AV1 efficiency claim (January 2024)
- [Twitch: What we announced in Rotterdam](https://blog.twitch.tv/en/2025/05/31/ten-years-of-twitchcon-here-s-what-we-announced-in-rotterdam), the 2K and HEVC beta for Partners and Affiliates, dual-format horizontal and vertical streaming via Aitum Vertical (May 2025)
- [Twitch: What we announced in San Diego](https://blog.twitch.com/en/2025/10/17/ten-years-of-twitchcon-here-s-what-we-announced-in-san-diego/), dual format moving to beta with more broadcast tools, native mobile vertical streaming, AI glasses streaming (October 2025)
- [Twitch: An update on Twitch in Korea](https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/), network fees 10 times most countries, peer-to-peer and 720p cap, closure on February 27, 2024

**Vendor and platform documentation**

- [Amazon IVS: Channel types](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/channel-types.html), transcode versus transmux, the STANDARD, ADVANCED and BASIC ladders and bitrates
- [Amazon IVS: Service quotas](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/service-quotas.html), 100 concurrent streams and 15,000 concurrent views by default, ingest bitrate and resolution limits, one stream key per channel, 100 takeovers per stream
- [Amazon IVS: Streaming configuration](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/streaming-config.html), RTMPS on port 443 and SRT on port 9000, keyframe guidance and the five-second warning, CBR, stream takeover and mobile auto-reconnect
- [Amazon IVS: Multitrack video setup](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/multitrack-video-setup.html), GetClientConfiguration inputs and server-side ranking, fragmented MP4, allow or require policy, disconnect on mismatch, fallback ranges, recommended hardware
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), input prices per hour by channel type and multitrack
- [Cloudflare Stream: Stream live video](https://developers.cloudflare.com/stream/stream-live/), RTMPS and SRT live inputs, per-input stream keys, automatic recording, continuing after encoder reconnects
- [Cloudflare Stream: WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/), WHIP ingest and WHEP playback, general availability and billing from October 15, 2026, no recording, HLS or simulcast for WHIP inputs, supported codecs
- [Mux: Handle live stream disconnects](https://www.mux.com/docs/guides/handle-live-stream-disconnects), reconnect window defaults and range, slates, one asset across reconnects, `EXT-X-ENDLIST` on expiry
- [Mux: Stream live to third-party platforms](https://www.mux.com/docs/guides/stream-live-to-3rd-party-platforms), simulcast targets, up to six per live stream, RTMP and RTMPS
- [YouTube: Live ingestion protocol comparison](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison), RTMP, RTMPS, HLS and DASH with their codecs and latency suitability
- [YouTube: Choose live encoder settings, bitrates and resolutions](https://support.google.com/youtube/answer/2853702?hl=en), RTMPS recommendation, H.264, HEVC and AV1, 60 fps, two-second keyframes never over four, CBR
- [Kick: Streaming setup guide](https://help.kick.com/en/articles/7066931-how-to-become-a-kick-affiliate), 1920x1080, 8,000 kbps, 60 fps, CBR, H.264 only, two-second keyframes, resetting the stream key
- [OBS Project: Transcodes / Transcoding](https://obsproject.com/kb/transcodes-transcoding), Twitch's tiered transcoding access and YouTube transcoding every stream (June 2021)

**Press**

- [Digital Music News: Twitch now allows users to simulcast on any platform or service](https://www.digitalmusicnews.com/2023/10/22/twitch-now-allows-users-to-simulcast-on-any-platform-or-service/), the simulcasting conditions: exclusivity, Twitch experience, chat engagement, no directing viewers away, no merged-activity overlays
- [Engadget: Twitch will allow simulcasting to competitor streaming platforms](https://www.engadget.com/twitch-will-allow-simulcasting-to-competitor-streaming-platforms-222133289.html), the October 20, 2023 TwitchCon announcement
