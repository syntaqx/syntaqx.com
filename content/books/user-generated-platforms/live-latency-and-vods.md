+++
title = "Live Latency, Playback & VODs"
description = "Live latency tiers and what each gives up, distribution at scale, real-time stages, timed metadata and ad breaks, live to VOD, retention caps and clips."
category = "User-Generated Platforms Industry"
order = 1818
part = "Media"
tags = ["user-generated-content", "live-streaming", "video", "latency", "data-retention"]
+++

A live stream reaches its viewers some seconds after it happens, and how many seconds is a product decision, not a property of the network. At thirty seconds a streamer reads chat about a moment they've already forgotten; at five they can answer a question while the asker is still watching; under a second they can bring a viewer on screen and talk. Each step down costs something: more requests per viewer, less tolerance for a shaky home connection, fewer devices that can play it, features such as 4K or ad insertion that stop working, and a CDN bill that rises because caching gets harder. Then the stream ends, and the platform has to decide what it keeps: a recording of hours of mostly idle video, clips viewers cut from it, highlights the creator assembled, all of it stored at a cost and watched by a shrinking audience.

This chapter covers the playback half of live video and what happens after: latency tiers and what each loses, distribution to millions of concurrent viewers, real-time stages with guests, timed metadata and ad breaks inside the stream, live to VOD recording, retention tiers and storage caps, and clips and highlights. It extends the core `streams` table from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and follows on from [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding), which gets the stream into an origin as a ladder of renditions. Packaging formats and the cost meter are in [Video on Demand](/books/user-generated-platforms/video-on-demand); chat and the interactive features riding on top of the stream are in [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity); the SFU behind multi-party rooms is Voice & Live Rooms; ad economics and creator revenue shares are Ads, Brand Safety & Data Licensing and Creator Monetization; music claims on recordings are Copyright at Scale.

## How the Platforms Do It

| Platform or vendor | Latency choices | Live to VOD | Retention and clips |
| --- | --- | --- | --- |
| **YouTube Live** | Normal (all features, 4K), Low (under 10 seconds for most viewers, no 4K), Ultra-low (under 5 seconds, no 4K, more buffering) | Streams under 12 hours archived automatically; longer ones "may not be captured at all" | DVR rewind set by the creator; limited on streams over 12 hours |
| **Twitch** | HLS from origins through a replication tree of data centers to edges near viewers | Segments, thumbnails and playlists saved to S3 when the streamer enables recording; MP4 downloads by a post-processing system | Past broadcasts expire after a period; highlights and uploads capped at 100 hours per channel since 2025; clips up to 60 seconds |
| **Amazon IVS** | Channels under 5 seconds; real-time stages under 300 ms with up to 12 hosts; traditional OTT "as high as 30 seconds" for comparison | Auto-record to S3 with per-rendition HLS, byte-range playlists, thumbnails and reconnect merging | The customer's bucket, the customer's retention |
| **Mux** | Standard (about 25 to 30 seconds), reduced (about 12 to 20), low (as low as about 5, using LL-HLS) | A new asset per broadcast, the same asset across reconnects inside the window | DVR not recommended over four hours |
| **Cloudflare Stream** | HLS and DASH | A recording per broadcast, its own video ID, available within 60 seconds of the end | Recording access controlled by signed URLs and allowed origins |

The table shows two conventions the industry has settled on. **Latency is a per-stream setting with named tiers,** chosen by the creator or the platform before going live, not a dial that moves during a broadcast (Mux allows a change only while the stream is idle). **A broadcast becomes a normal on-demand asset** with its own ID, playback rules and retention clock, and every vendor merges short disconnects into one recording rather than producing a dozen fragments.

## Latency Tiers

Latency here means glass to glass: the time from the camera capturing a frame to a viewer seeing it. Amazon IVS's definition is the same ("from when a camera captures a live stream to when the stream appears on a viewer's screen"), and both it and YouTube state their figures as what most viewers get, because the viewer's own network and player buffer are part of it.

![Five delivery tiers as bars on a seconds axis: real time over WebRTC under 0.3 seconds, low-latency HLS under 5 seconds, tuned HLS at the low setting under 10 seconds, tuned HLS at the reduced setting at about 12 to 20 seconds, and standard HLS at about 25 to 30 seconds.](/diagrams/ugp-latency-tiers.svg "Each tier is a published upper bound or typical range: real-time stages, LL-HLS channels and ultra-low modes, YouTube's low setting, Mux's reduced mode and standard HLS.")

The tiers come from how the segments reach the player:

- **Standard HLS (about 25 to 30 seconds).** The player fetches whole segments listed in a playlist and, by the HLS specification, starts no closer to the live edge than the playlist's `HOLD-BACK`, which must be at least three target durations and defaults to three. With six-second segments that's eighteen seconds of hold-back before encode, packaging and CDN time are added. Mux quotes its standard mode at "typically about 25 to 30 seconds"; IVS says a traditional OTT stream "may be as high as 30 seconds."
- **Tuned HLS (about 10 to 20 seconds).** Shorter segments and a smaller buffer, same protocol. Mux's reduced mode runs about 12 to 20 seconds; YouTube's Low setting gets most viewers under 10.
- **Low-latency HLS (under 5 seconds).** The current HLS draft (draft-pantos-hls-rfc8216bis-22, May 2026) splits each segment into partial segments (`EXT-X-PART`) no longer than a part target, lets the player ask for the next part before it exists (`EXT-X-PRELOAD-HINT`), and lets it block on a playlist request until a given segment or part is ready (`_HLS_msn` and `_HLS_part`, with the server deferring the response; if it can't answer within three target durations it should return 503). `PART-HOLD-BACK` must be at least twice, and should be at least three times, the part target, so with parts of a third of a second the player can sit about a second behind the newest part. Delta playlist updates (`CAN-SKIP-UNTIL`, with a skip boundary of at least six target durations) keep the constantly reloaded playlist small, and rendition reports tell the player how far each other rendition has got, so it can switch quality without a fresh round trip. IVS channels run under 5 seconds, YouTube's Ultra-low gets most viewers under 5, and Mux's low mode reaches "as low as about 5 seconds" on LL-HLS.
- **Real time (under 300 ms).** WebRTC delivers media over UDP without segments at all. IVS stages quote under 300 ms "from host to viewer." This is a different system from the HLS tiers: a selective forwarding unit per stage instead of a CDN cache (Voice & Live Rooms covers the SFU).

My default for a user-generated live platform is low-latency HLS as the standard tier, because chat, polls, predictions and raids only work when the audience and the streamer share a moment, and standard HLS as the fallback for players and networks that can't keep up. Real time is a separate product for the few people on stage, not the delivery tier for the audience.

## What Each Tier Loses

Every published tier lists what it gives up, and the losses fall into five groups:

- **Quality ceiling.** YouTube's Low and Ultra-low settings don't support 4K; only Normal does. Lower latency means less buffer to absorb a bitrate spike, so the top rung is capped.
- **Robustness.** YouTube warns that Ultra-low "may increase the chances that your viewers get buffering," and that network problems on the streamer's side reach viewers faster. Mux recommends reduced or low only when the creator controls the encoder, its hardware and its network, because home and mobile connections are often too unstable; streams in its reduced mode get no reconnect window at all.
- **Player and device reach.** Mux's low mode needs recent player versions and falls back to standard HLS on older ones, and a playback URL can force standard HLS. A platform serving smart TVs, consoles and old phones runs two tiers whether it wants to or not.
- **Features that need time.** IVS's server-side ad insertion requires the MPEG transport stream container and fails validation with fragmented MP4. YouTube limits DVR rewind on streams over 12 hours and on some devices. Anything that has to be decided before a viewer sees a segment (an ad, a moderation hold, a stream delay) needs latency budget to do it in.
- **Cost.** Shorter parts mean more requests per viewer-minute and more playlist reloads held open at the edge; real time abandons the shared cache entirely and prices per participant-hour. [Video on Demand](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour) builds the cost per viewer-hour from the vendors' meters.

Latency is also a safety and fairness setting. A competitive streamer may want the feed delayed so opponents can't watch their screen (the Gaming volume's [Spectating: Who Sees What, When](/books/gaming/esports-and-spectating#spectating-who-sees-what-when) covers the delay rule: buffer on the server, never on the client). And a platform that wants a human or classifier to see a stream before the audience does is buying latency: live moderation runs on sampled frames as the stream airs, and the incident protocols for a livestreamed attack are in Terrorism, Violent Extremism & Graphic Content.

## Distribution at Scale

The live origin produces a few renditions per stream; the audience may be millions of viewers on one popular stream and one viewer on each of a hundred thousand others. Distribution has to serve both shapes.

**Replication trees.** Twitch's 2023 engineering overview describes edges that connect to local ISPs, origins with "hundreds to thousands of servers" for transcoding, and data centers organized as "a directed graph hierarchy we call a Replication Tree": a viewer's request goes to the nearest available data center and is forwarded up the tree until something has the stream. The tree collapses a million identical requests into one per node, which is what makes a popular stream cheap per viewer, and a request for an unpopular stream walks the tree to the origin, which is why the long tail costs more per viewer than the head. The same overview counts more than 2.5 million average concurrent viewers and "hundreds of thousands of simultaneous live video streams."

**Managed CDNs and multi-CDN.** A platform that rents video gets the vendor's distribution: IVS describes a global data plane where viewers "watch your live streams globally via the Amazon IVS content-delivery network," and Mux lists multi-CDN delivery on every quality level. Rented distribution has quotas a platform must plan around: IVS's default is 15,000 concurrent views across all channels in a region (adjustable), and its documentation tells customers to request an increase before a large event.

**Peer-to-peer assist.** Viewers can share segments with each other to offload the CDN, at the cost of viewers' upload bandwidth and a more complex player. Twitch tested "a peer-to-peer model for source quality" in Korea, where it said network fees were "10 times more expensive than in most other countries," then capped source quality at 720p; neither made the business sustainable and Twitch shut its Korean business on February 27, 2024. The lesson for a platform is that delivery cost is set by the most expensive market it serves, and the levers (resolution caps, P2P, leaving) are product decisions with creator consequences.

**Live load is spiky.** A raid, a tournament final or a celebrity guest can multiply one channel's audience in a minute. The edge needs request coalescing (one upstream fetch per segment however many viewers ask at once) and the platform needs per-channel and per-region concurrency alarms against its own or its vendor's limits.

## Real-Time Stages

A stage is a small set of participants in real time, broadcast to a large audience at a higher tier. IVS describes stages with "up to 12 hosts" and audiences "beyond 25,000 viewers," for guest spots ("promote guests on stage, turning viewers into hosts"), versus mode, audio rooms and live auctions, and notes that when a stage is broadcast to a channel, channel viewers get low latency rather than real time. That split is the general design:

- **Hosts and invited guests are on the real-time tier.** They talk to each other without delay, so they're on WebRTC through an SFU, priced per participant-hour.
- **The audience is on the broadcast tier.** A composition of the stage (a server-side mix, or one host's encoder capturing the others) goes out as an ordinary stream with a normal ladder, recording and ads.
- **Promotion is a permission change.** Bringing a viewer on stage issues them a participant token for that stage, and the moderation consequences follow: a guest is a broadcaster for the minutes they're on, their conduct is on the host's stream, and the platform needs to know who was on stage when a report arrives. Live auctions on a stage add a fairness rule: every bidder must see the same moment, which is why IVS sells them as a real-time use case.

## Timed Metadata and Ad Breaks

Some events have to happen at a point in the video, not at a point in wall-clock time, because every viewer is at a different wall-clock offset from the live edge. A quiz question must appear when the host asks it on screen, an ad must replace the right seconds of content, and a chapter marker must land at the right place in the recording.

**Timed metadata.** IVS inserts metadata as ID3 tags in the video segments, so "all viewers of the stream get the metadata at the same time relative to the stream" and the tags survive in the recording; the player raises a cue event when playback reaches the segment. The limits are small on purpose: a `PutMetadata` payload is at most 1 KB, at 5 requests per second per channel and 155 per account. In HLS generally, `EXT-X-DATERANGE` carries timed metadata in the playlist, and a playlist containing one must also contain `EXT-X-PROGRAM-DATE-TIME`, which ties segments to absolute time. My rule: timed metadata carries an identifier and a version, never the content (the poll's ID, not its options), and the player fetches the rest; 1 KB is enough for that and not for anything else.

**Ad breaks.** Two mechanisms coexist:

- **Server-side ad insertion (SSAI).** The platform signals a break and the ad server stitches ad segments into each viewer's playlist. On IVS, `InsertAdBreak` takes a channel and a duration, IVS stitches the ads using an AWS Elemental MediaTailor playback configuration, a second break can't start while one is in progress (409 `ConflictException`), and post-rolls insert automatically at stream end. If no ad fills, the source content plays. A viewer who joins partway through a break gets its duration rounded up to the nearest quartile (joining with 35 of 60 seconds left yields a 45-second break). The live playlist declares each stitched ad with an `EXT-X-DATERANGE` and a discontinuity, and the recorded VOD playlist carries SCTE-35 out and in markers at the positions of the live breaks, so ads can be stitched into the replay too. The HLS draft maps SCTE-35 splice signals into `EXT-X-DATERANGE` attributes (`SCTE35-OUT`, `SCTE35-IN`, `SCTE35-CMD`) for exactly this.
- **Platform-run breaks.** Twitch's event surface includes `channel.ad_break.begin`, sent when a midroll runs "either manually or automatically via ads manager," with the duration, start time, whether it was automatic, and who requested it. The point for builders is that an ad break is an event other systems react to: the streamer's overlay, chat bots that announce the break, and the earnings ledger.

Whoever triggers it, an ad break is a cue with a requester, a requested duration, an actual duration and the viewers who saw it, and that record is what creator ad revenue, advertiser billing and disputes about missed breaks are reconciled against. How breaks are priced, scheduled for creators and shared is Creator Monetization and Ads, Brand Safety & Data Licensing.

## From Live to VOD

Recording is part of the live pipeline, not a job that runs afterwards. The vendors converge on the same shape:

- **Record the renditions you already made.** IVS writes HLS for each rendition to S3 as the stream runs, with a standard multivariant playlist and a byte-range playlist (HLS version 4) whose segments reference subranges of the media files, so a clip can start on any keyframe rather than on a ten-second file boundary. Twitch saves "copies of segments, thumbnails, and playlists" to S3. There's no re-encode: the recording is the live ladder, which is why a live stream's recording is available fast (Cloudflare says within 60 seconds of the end).
- **Merge reconnects into one recording.** Encoders drop. IVS's `recordingReconnectWindowSeconds` writes a reconnect within the window to the same recording if resolution, frame rate and codecs match and the bitrate is within 50% of the original, up to 20 merged streams or 48 hours, after which a new recording starts; the end-of-recording event is delayed by the window so nothing finalizes early. Mux keeps the same `active_asset_id` across reconnects inside its window (60 seconds by default, up to 30 minutes). A recording that splits into fragments on every Wi-Fi blip breaks clips, chapters, retention and the creator's patience.
- **Record the lifecycle as events.** IVS writes `recording-started`, `recording-ended` or `recording-failed` metadata files and EventBridge events; Mux emits a completion webhook when the asset is final. The recording is a media asset in the core model, moving from recording to processing to ready, with its source stream and the ingest sessions it merged.
- **Thumbnails and storyboards come from the live stream.** IVS writes a thumbnail every minute by default (configurable from 1 to 60 seconds), and the recording's thumbnails become the VOD's seek previews and the moderation team's quick view of hours of footage.
- **Some recordings must not exist or must change.** A creator can turn recording off; YouTube may not archive a stream over 12 hours; a stream removed for a violation keeps its recording as evidence but not as a public VOD; detected copyrighted music can mute or remove parts of a recording (Copyright at Scale). The VOD's public state is the content item's, separate from whether the file is kept.

Once finalized, a recording follows [Video on Demand](/books/user-generated-platforms/video-on-demand): optional re-encoding into a better on-demand ladder if it will be watched, captions, downloads (Twitch's post-processing system turns recordings into MP4 downloads) and the cost meter.

## Retention Tiers and Storage Caps

Most of a live platform's stored video is recordings that almost nobody will watch again, and every platform eventually limits them:

- **Expiring past broadcasts.** Twitch past broadcasts are deleted automatically after a period that has historically depended on the channel's program status; its help center didn't render for this chapter, so the exact days aren't cited here.
- **Caps on what creators keep.** Twitch announced on February 20, 2025 a 100-hour cap on highlights and uploads per channel, with clips and past broadcasts exempt and over-limit content deleted starting "with highlights with the least views," effective April 19, 2025. It said the cap affected "less than 0.5% of active channels" and content accounting for "less than 0.1% of hours watched," and gave cost and weak discovery as reasons.
- **Archive limits by length.** YouTube automatically archives streams under 12 hours and warns that longer streams may not be captured.
- **Customer-owned retention.** Rented video (IVS recording to the customer's bucket, Mux assets, Cloudflare recordings) leaves retention to the platform, which then has to write the rules itself.

Three design rules follow. **Retention is rules as data:** what kind of recording, which creator tier, how many days or hours, and which eviction order, versioned and effective-dated so a change applies forward and can be announced before it bites ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)). **Eviction order is a product decision:** least viewed first (Twitch's choice for highlights) protects what audiences value; oldest first is simpler and punishes long-time creators. **Holds beat retention:** a recording under a moderation case, a preservation request or a legal hold isn't deleted when its clock runs out ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows)), and the creator's export window (download before deletion) is part of the policy. [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#why-platforms-cap-storage) covers why platforms cap storage at all, and Migrations, Purges & Shutdowns covers the purges that happen when a policy changes all at once.

## Clips and Highlights

A **clip** is a short cut of a stream made by a viewer or the streamer, published as its own content item with its own author, page, reports and life. A **highlight** is a longer edit of a past broadcast made by the creator, kept after the past broadcast expires. Both are content items that point back to the source stream and recording.

Twitch's clip API shows the mechanics. Creating a clip needs the `clips:edit` scope and a live broadcaster with clips enabled; it captures up to 90 seconds (about 85 before the call and 5 after), publishes up to the last 30 seconds by default, and lets the creator trim to 5 to 60 seconds through an edit URL valid for 24 hours or until publication. Creation is asynchronous ("if the clip hasn't appeared after 15 seconds, assume it failed"), and the clip's offset into the VOD can take minutes to resolve. That implies a rolling buffer at the origin of at least the capture window, so a clip can be cut from the past 85 seconds before the recording is even finalized, and a clip that outlives its source: when the VOD is gone, the clip remains with an empty source reference.

Clips have become a discovery surface of their own. Twitch's 2025 announcements added in-stream clipping for all viewers, a Clip Leaderboard rewarding the viewers whose clips draw the most views, post-stream clip suggestions within about 5 to 10 minutes of the end, and Auto Clips, still in development as of its October 2025 announcement, which picks moments with AI and a "Clip That" voice command and adds captions. Twitch noted that "only about 1 in 4 streamers" clip right after streams, which is the case for automation.

What a builder has to get right:

- **A clip is a new content item with its own author.** The clipper is the author; the streamer is the source. Reports, removals and copyright claims on a clip are separate from the stream's, and a creator needs tools to remove clips of their channel (Twitch's 2020 bulk-delete tool for old clips came out of a music takedown wave, which Copyright at Scale covers).
- **Inherit restrictions from the source.** A clip of a removed stream, a subscriber-only stream or a stream under a music licence that limits recordings has to inherit that state, and a later removal of the stream has to reach its clips.
- **Store references, not copies, until it matters.** With byte-range playlists a clip can be a playlist over the recording's segments; it needs its own file only when the recording is due to expire or the clip is exported, which makes clips cheap until they're popular.
- **Make machine clips accountable.** An auto clip records the model and signals that chose it, the same as any automated decision ([Automated Risk Decisions](/docs/architecture/risk-scoring#the-decision-record)), because a creator will ask why a moment was or wasn't picked.

## How to Build It

The chapter's additions to the core model and to [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#how-to-build-it):

```sql
ALTER TABLE streams
  ADD COLUMN latency_mode TEXT NOT NULL DEFAULT 'low'
    CHECK (latency_mode IN ('standard', 'reduced', 'low', 'real_time')),
  ADD COLUMN dvr_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN record       BOOLEAN NOT NULL DEFAULT TRUE;   -- the creator's choice

CREATE TABLE vod_retention_rules (       -- how long recordings and edits are kept
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  applies_to      TEXT NOT NULL CHECK (applies_to IN ('past_broadcast', 'highlight',
                    'upload', 'clip')),
  creator_tier    TEXT NOT NULL,         -- 'default', 'affiliate', 'partner', ... as data
  keep_days       INT CHECK (keep_days > 0),          -- null: no age limit
  cap_hours       INT CHECK (cap_hours > 0),          -- null: no total cap
  eviction        TEXT NOT NULL CHECK (eviction IN ('oldest_first', 'least_viewed_first')),
  valid_during    TSTZRANGE NOT NULL,
  announced_at    TIMESTAMPTZ,           -- creators were told before it took effect
  EXCLUDE USING GIST (applies_to WITH =, creator_tier WITH =, valid_during WITH &&)
);

CREATE TABLE stream_recordings (         -- one broadcast's recording, across reconnects
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  stream_id         UUID NOT NULL REFERENCES streams (content_item_id),
  media_asset_id    UUID NOT NULL REFERENCES media_assets (id),  -- the VOD file set
  state             TEXT NOT NULL CHECK (state IN ('recording', 'finalizing', 'ready',
                      'failed', 'expired', 'purged')),
  storage_prefix    TEXT,                -- per-rendition playlists and byte-range playlists
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ,
  duration_ms       BIGINT,
  failure_reason    TEXT,
  retention_rule_id UUID REFERENCES vod_retention_rules (id),  -- the rule at finalization
  retain_until      TIMESTAMPTZ,         -- computed and stored; holds override it
  saved_as          TEXT CHECK (saved_as IN ('highlight', 'creator_export')),
  CHECK ((state = 'failed') = (failure_reason IS NOT NULL))
);

ALTER TABLE ingest_sessions             -- Live Streaming: Ingest & Transcoding
  ADD COLUMN recording_id UUID REFERENCES stream_recordings (id);  -- merged reconnects

CREATE TABLE clips (                     -- side table of a media_post content item
  content_item_id     UUID PRIMARY KEY REFERENCES content_items (id),
  kind                TEXT NOT NULL CHECK (kind IN ('clip', 'highlight')),
  source_stream_id    UUID NOT NULL REFERENCES streams (content_item_id),
  source_recording_id UUID REFERENCES stream_recordings (id),  -- null once it's gone
  offset_ms           BIGINT,            -- into the recording; resolved after capture
  duration_ms         INT NOT NULL CHECK (duration_ms > 0),
  clipped_by          UUID REFERENCES accounts (id),           -- null for automatic
  method              TEXT NOT NULL CHECK (method IN ('viewer', 'creator', 'automatic',
                        'api')),
  selector_ref        TEXT,              -- model and version, for automatic clips
  state               TEXT NOT NULL CHECK (state IN ('capturing', 'editable', 'published',
                        'failed')),
  edit_expires_at     TIMESTAMPTZ,
  own_asset_id        UUID REFERENCES media_assets (id),       -- materialized copy, if any
  CHECK (kind = 'highlight' OR duration_ms <= 60000),
  CHECK (method <> 'automatic' OR selector_ref IS NOT NULL)
);

CREATE TABLE stream_cues (               -- things that happen at a point in the video
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  stream_id        UUID NOT NULL REFERENCES streams (content_item_id),
  kind             TEXT NOT NULL CHECK (kind IN ('ad_break', 'metadata', 'marker',
                     'chapter', 'stage_change')),
  source           TEXT NOT NULL CHECK (source IN ('manual', 'automatic', 'api')),
  requested_by     UUID REFERENCES accounts (id),
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  program_time     TIMESTAMPTZ,          -- the program date-time it landed at
  requested_ms     INT CHECK (requested_ms >= 0),   -- ad breaks: duration asked for
  actual_ms        INT CHECK (actual_ms >= 0),      -- ad breaks: duration that ran
  vendor_ref       TEXT,                 -- e.g. the ad break ID the video vendor returned
  payload          JSONB,                -- an identifier and version, not the content
  CHECK (payload IS NULL OR octet_length(payload::text) <= 1024)
);
```

Notes on the sketch:

- **Latency is a stream setting, fixed while live.** `latency_mode` is read when the stream starts and copied to the ingest session, because the packager, player configuration and ad insertion depend on it and vendors only allow changes while idle. `real_time` marks a stage; its audience-facing composition is another stream at a broadcast tier.
- **One recording per broadcast, not per connection.** Ingest sessions point at the recording they were merged into, so a stream with three reconnects has three sessions and one recording, and the merge rule (same resolution, frame rate and codecs, bitrate within a band, a window) is the vendor's or yours, recorded on the session.
- **Retention is computed and stored.** `retain_until` is set from the rule in force at finalization and stored, as [Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) recommends, so changing a rule later is an explicit migration with notice, not a silent recomputation. The purge job skips anything under a `legal_holds` row ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it)) or an open moderation case, and a cap rule (`cap_hours`) is enforced by a job that ranks a channel's recordings by `eviction` and expires from the bottom ([Background Jobs](/docs/architecture/background-jobs#scheduling)).
- **The recording's file and its visibility are separate.** The VOD's public state lives on the stream's content item; `stream_recordings.state` is whether the file exists. A stream removed for a violation has a removed content item and a retained recording under a hold. The core `streams.recording_asset_id` points at the asset while it's kept.
- **Clips reference until they must copy.** A clip is a playlist over the recording's segments (`offset_ms`, `duration_ms`); a job materializes `own_asset_id` when the recording nears `retain_until` or the clip is exported. When the recording is purged, `source_recording_id` becomes null and the clip lives on its own copy.
- **Cues are the reconciliation record.** Every ad break and metadata insert is a row with requester, requested and actual duration and the vendor's ID, so earnings, advertiser reports and creator disputes ("my break never ran") reconcile against it. The payload check keeps metadata to an identifier-sized reference.
- **Events:** `stream.recording_started`, `stream.recording_ready`, `stream.recording_failed`, `recording.expiring` (for the creator's export notice), `recording.expired`, `clip.created`, `clip.published`, `stream.cue_inserted` and `stream.ad_break_began` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the player edge, chat bots, notifications, earnings and search.

## Auditing

- **Every recording's lifecycle,** with the ingest sessions merged into it, its failure reason, the retention rule that set its clock and the hold that stopped it, so "where is my VOD" and "why was it deleted" are queries.
- **Every retention rule and its changes,** with effective dates and when creators were told, because a cap applied without notice is a creator relations problem and, for paid tiers, possibly a consumer-law one.
- **Every clip's provenance:** source stream, offset, clipper or model, and later removals, so a report or a rights claim can be traced to the moment it came from.
- **Every cue,** especially ad breaks: who or what requested it, how long it was asked to run, how long it ran, and the vendor's identifier, for earnings and advertiser reconciliation.
- **Latency mode per stream,** because a creator complaining about delay, a moderation review asking what viewers saw when, and a cost analysis all need to know which tier a stream ran at.

## What This Means for the System You Build

- **Pick low-latency HLS as the default tier** for interactive streams, with standard HLS as the fallback for players and networks that can't keep up.
- **Treat real time as a stage product,** with hosts and guests on WebRTC and the audience on a broadcast tier.
- **Publish what each tier gives up** (4K, robustness, devices, ad insertion, rewind) in the creator's settings, not in a support article.
- **Plan distribution for both shapes:** request coalescing for one huge stream, cost per viewer for the long tail, and concurrency alarms against every quota.
- **Put events on the video timeline** with timed metadata that carries identifiers, not content.
- **Record every ad break and metadata insert as a cue** with requested and actual duration and the vendor's reference.
- **Record the live ladder** instead of re-encoding it, and merge reconnects into one recording.
- **Make retention versioned rules** with computed, stored deadlines, an announced eviction order and an export window, and let holds override them.
- **Model clips as content items** that reference their source recording, inherit its restrictions and outlive it.
- **Keep automatic clip selection accountable** with the model and signals recorded beside each clip.

## References

**Standards**

- [IETF: HTTP Live Streaming 2nd Edition (draft-pantos-hls-rfc8216bis-22)](https://datatracker.ietf.org/doc/draft-pantos-hls-rfc8216bis/), partial segments, preload hints, blocking playlist reload and its timeout, HOLD-BACK and PART-HOLD-BACK minimums, delta updates and the skip boundary, rendition reports, EXT-X-DATERANGE and its SCTE-35 mapping, program date-time

**Vendor documentation**

- [Amazon IVS: What is Amazon IVS Low-Latency Streaming](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/what-is.html), the latency definition, channels under 5 seconds, stages under 300 ms, traditional OTT up to 30 seconds, the global data plane and CDN
- [Amazon IVS: What is Amazon IVS Real-Time Streaming](https://docs.aws.amazon.com/ivs/latest/RealTimeUserGuide/what-is.html), up to 12 hosts, audiences beyond 25,000, guest spots, versus mode, audio rooms and live auctions
- [Amazon IVS: Auto-record to Amazon S3](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/record-to-s3.html), per-rendition HLS, byte-range playlists, thumbnail intervals, recording metadata files, reconnect merging rules and limits
- [Amazon IVS: Embedding metadata within a video stream](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/metadata.html), timed metadata as ID3 tags, synchronized delivery, presence in recordings
- [Amazon IVS: Service quotas](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/service-quotas.html), PutMetadata payload and rate limits, concurrent views and streams, InsertAdBreak rate
- [Amazon IVS: Server-side ad insertion](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/server-side-ad-insertion.html), mid-roll and post-roll breaks, MediaTailor, the in-progress conflict, unfilled breaks, quartile rounding, MPEG-TS requirement, DATERANGE and SCTE-35 markers in live and VOD playlists
- [Mux: Reduce live stream latency](https://www.mux.com/docs/guides/reduce-live-stream-latency), standard, reduced and low modes with their latencies, encoder and player caveats, the reconnect window
- [Mux: Stream recordings of live streams](https://www.mux.com/docs/guides/stream-recordings-of-live-streams), an asset per broadcast, the same asset across reconnects, DVR guidance over four hours
- [Mux: Use video quality levels](https://www.mux.com/docs/guides/use-video-quality-levels), multi-CDN delivery and the quality levels available to live streams
- [Cloudflare Stream: Watch a live stream](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/), automatic recordings available within 60 seconds, recording access controls
- [Cloudflare Stream: Record and replay live streams](https://developers.cloudflare.com/stream/stream-live/replay-recordings/), recordings as videos with their own IDs linked to the live input

**Platform documentation**

- [YouTube: Choose live stream latency](https://support.google.com/youtube/answer/7444635?hl=en), Normal, Low and Ultra-low, what each supports and the buffering trade-off
- [YouTube: Archive live streams](https://support.google.com/youtube/answer/6247592?hl=en), automatic archiving under 12 hours
- [YouTube: Turn on DVR on live streams](https://support.google.com/youtube/answer/9296823?hl=en), creator-controlled rewind and its limits on long streams
- [Twitch: Clips API](https://dev.twitch.tv/docs/api/clips/), capture window, default and editable lengths, edit URL validity, asynchronous creation and VOD offsets
- [Twitch: EventSub subscription types](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/), `channel.ad_break.begin` and its fields

**Platform engineering**

- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), edges, origins, the replication tree, VOD segments in S3, MP4 downloads, concurrent viewers and simultaneous streams
- [Twitch: An update on Twitch in Korea](https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/), network fees, the peer-to-peer test, the 720p cap and the February 27, 2024 shutdown
- [Twitch: Music-related copyright claims and Twitch](https://blog.twitch.tv/en/2020/11/11/music-related-copyright-claims-and-twitch/), the 2020 takedown wave on old clips and the clip mass-deletion tool
- [Twitch: Ten years of TwitchCon, Rotterdam](https://blog.twitch.tv/en/2025/05/31/ten-years-of-twitchcon-here-s-what-we-announced-in-rotterdam), in-stream clipping, the Clip Leaderboard and post-stream clip suggestions
- [Twitch: Ten years of TwitchCon, San Diego](https://blog.twitch.com/en/2025/10/17/ten-years-of-twitchcon-here-s-what-we-announced-in-san-diego/), Auto Clips, "Clip That," and the share of streamers who clip after streams

**Press**

- [TechCrunch: Twitch caps streamers' storage at 100 hours of highlights and uploads](https://techcrunch.com/2025/02/20/twitch-caps-streamers-storage-at-100-hours-of-highlights-and-uploads), the cap, exemptions, least-viewed-first deletion, share of channels and hours affected, rationale and deadline
