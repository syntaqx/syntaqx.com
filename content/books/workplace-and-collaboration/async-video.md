+++
title = "Async Video & Screen Recording"
nav_title = "Async Video"
description = "Async video at work: Loom, video as files in Microsoft 365, and Zoom Clips; recording and processing, storage cost, governance, and viewer analytics."
category = "Workplace & Collaboration Industry"
order = 2020
part = "Meetings and Voice"
tags = ["async-video", "screen-recording", "video", "viewer-analytics", "storage"]
+++

Async video is the meeting that didn't happen. Instead of booking thirty minutes to walk a colleague through a design, a bug or a quarterly plan, someone records five minutes of screen and face, pastes a link into chat, and the colleague watches it at 1.5x speed when they have time, leaves a timestamped comment, and replies with a video of their own. The category was built on that substitution: Loom, the product that defined it, was described by Atlassian at its acquisition as an "asynchronous (async) video messaging tool that helps users communicate through instantly shareable videos," with almost 5 million videos created each month by about 200,000 customers. Atlassian closed the deal on November 30, 2023, for total purchase consideration of about $885.6 million in cash.

The technology underneath is consumer video on demand: capture, upload, transcode, package, deliver ([Video on Demand](/books/user-generated-platforms/video-on-demand)). What changes at work is everything after the pipeline. A workplace video is a document: it has an owner in a tenant, sharing permissions, a retention policy, a place in search and discovery, and a viewer list that can turn a messaging tool into a monitoring tool. And the economics invert: consumer platforms pay for delivery to millions of viewers per hit, while a workplace library is millions of short videos each watched a handful of times, so storage, not bandwidth, dominates. This chapter covers how the vendors package async video, recording in the client, processing and playback, what it costs, video as a governed document, viewer analytics and the privacy line, and AI on recorded video. Meeting recordings are [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes).

## How the Platforms Do It

As of October 2026:

| Vendor | Model | Limits and tiers | Governance | Viewer data |
| --- | --- | --- | --- | --- |
| **Loom (Atlassian)** | Standalone async video product; acquisition announced October 12, 2023, closed November 30, 2023 | Free Starter: 25 recordings, 5-minute recording limit; Business $18 per user per month, unlimited; Business + AI $24; Enterprise by quote | Enterprise: SSO and SCIM through Atlassian Guard Standard, custom data retention policies, controls on public links, 99.95% uptime SLA | Business tier: "Request email to view" shows who is watching; Business + AI adds admin usage insights |
| **Microsoft 365 video (Clipchamp player, recorder and homepage)** | Video as ordinary files in OneDrive, SharePoint and Teams, with a player, recorder and editor over them | Counts against the tenant's pooled SharePoint storage | eDiscovery, legal hold, retention, DLP, Customer Key and multi-geo apply as to any file | Views, viewers and retention per video; named viewers only where a site owner turns them on |
| **Zoom Clips** | Short screen and camera clips inside Zoom Workplace, included with paid plans | Clips Basic: up to 5 recordings per person, 3-minute screen recording limit; Clips Plus $6.99 per user per month ($5.83 billed annually), unlimited | Clips Plus: video permission controls, download restriction, custom data retention policies | Clips Plus: viewer and admin insights, request email to view |

The split in the table is the strategic one. **Loom is a destination:** videos live in Loom's library, and the enterprise features (retention, SSO, SCIM, link controls) are sold as tiers on top. **Microsoft dissolved the destination:** it deprecated Stream (Classic) and made a video just another file, and its documentation explains why with its own telemetry from the old portal: 83% of page views "came from direct links to a video or embedding videos into other locations," 12% from group and channel pages, and 5% from the portal's home page. People don't browse a company video portal; they open a link someone sent. Once that's true, putting video in the same storage as documents gets governance for free. **Zoom sits between the two:** Clips is a feature of the meeting suite with its own library and its own tiered controls, priced like Loom's add-on rather than dissolved into file storage.

The standalone business-video platforms have consolidated. Vimeo, which described itself as "a leading video platform for business" with Self-Serve, Streaming and Enterprise segments, agreed in September 2025 to be acquired by Bending Spoons for $7.85 per share in cash, about $1.38 billion; the merger completed on November 24, 2025, when Nasdaq trading in the stock was suspended and Vimeo asked for it to be delisted. A customer choosing a standalone video vendor is choosing an owner as well as a product, and both Loom and Vimeo changed hands within two years.

## Recording in the Client

The recorder is the product. It captures a screen, a window or a tab, overlays a camera bubble, mixes microphone and sometimes system audio, and lets the creator pause, redo and annotate. Microsoft's recorder lets a user "record your screen, webcam, and annotate with text, inking, & images" and can record a PowerPoint presentation with a teleprompter and a placed camera.

The engineering problem is the moment recording stops. Async video only works if the link is ready immediately, because the creator pastes it into chat the second they finish. That rules out "record to disk, then upload": a ten-minute screen recording can run to hundreds of megabytes, and nobody waits for it. My default is to **upload while recording**, in chunks, to resumable direct-to-storage sessions, so that at stop the server already has all but the last few seconds ([Resumable Uploads](/docs/architecture/file-uploads#resumable-uploads), and [Resumable and Chunked Uploads](/books/user-generated-platforms/upload-path#resumable-and-chunked-uploads) for the consumer version). A local copy stays until the server confirms every chunk, so a dropped connection costs a retry, not a recording.

Two more client decisions shape everything downstream. **Encode once, on the device, at a sensible mezzanine quality,** because the server will re-encode anyway and screen content compresses very differently from camera video ([Media Compression](/docs/architecture/media-compression#choosing-a-format-by-content-class)). And **capture what the user consented to share,** nothing more: a whole-screen recording catches notifications, other windows and other people's messages, which is why recorders default to a window or tab and show what's being captured.

## Processing and Playback

Server-side, a workplace video goes through the consumer pipeline with workplace inputs:

- **Transcode to a ladder** of renditions and package for adaptive playback. Microsoft serves "adaptive bitrate playback backed by CDN for any video file uploaded to SharePoint, OneDrive, Teams, or Yammer." The ladder, per-title encoding and packaging choices are [Encoding Ladders and Per-Title Encoding](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding) and [Packaging: HLS, DASH and CMAF](/books/user-generated-platforms/video-on-demand#packaging-hls-dash-and-cmaf).
- **Transcribe and caption.** Microsoft generates transcripts and captions automatically "for the language spoken in the video," lets owners edit them and upload WebVTT subtitle files, and supports alternative audio tracks for audio description and dubbing ([Thumbnails, Captions and Audio Tracks](/books/user-generated-platforms/video-on-demand#thumbnails-captions-and-audio-tracks)).
- **Make it findable.** Microsoft Search indexes videos "based on the metadata and transcript of video files," so a word said in a video is findable like a word in a document; enterprise search over all of it, with permission trimming, is [Enterprise Search](/books/workplace-and-collaboration/enterprise-search).
- **Make it navigable:** chapters, a link to a timestamp, playback speed, and comments on the player page.

The order matters for the instant-link promise. A first playable rendition (often the uploaded mezzanine itself, or one fast transcode) must be ready within seconds of stop; the full ladder, transcript, chapters and AI summary can follow over the next minutes and appear when they're done.

## What It Costs

Consumer video's cost model, with storage tiers and cost per viewer-hour, is [Cost per Viewer-Hour](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour) and [Hot, Warm and Cold Storage](/books/user-generated-platforms/storage-and-delivery#hot-warm-and-cold-storage). The workplace shape is different in three ways:

- **Views per video are tiny.** Most async videos are watched by one to a few people, a few times, in the first days. Delivery cost is small; storage is forever unless something deletes it.
- **Volume grows with headcount and habit,** not with an audience: every seat that adopts async video adds a steady stream of new files, and the library only shrinks if retention policy shrinks it.
- **Someone else's quota pays.** In Microsoft 365, videos live in OneDrive and SharePoint, where storage is pooled per organization (Microsoft lists 1 TB per organization plus 10 GB per license purchased on the common business and enterprise plans), so a video habit draws down the same quota as documents. Loom prices the free tier on volume instead, at 25 recordings of up to 5 minutes, and Zoom's Clips Basic at 5 recordings per person of up to 3 minutes.

The levers follow: tier old renditions to colder storage, keep only the mezzanine and regenerate renditions on demand for videos nobody has opened in months, and let retention policy delete what the customer says it may. The last one is the only lever that scales, which is why custom data retention is an Enterprise feature at Loom and a standard file policy at Microsoft.

## Video as a Governed Document

Once a video is a document, every question a document raises applies to it.

- **Ownership and offboarding.** A video belongs to a creator inside a workspace. When the creator leaves, their videos must move to a team or a manager rather than disappear with the account ([Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#content-ownership-on-the-way-out)).
- **Sharing.** Microsoft gives videos "advanced sharing options... the same as for any other file," including guest access and "unauthenticated external video sharing from OneDrive and SharePoint 'anyone' links," which the admin's external-sharing policy can turn off. Loom's Enterprise tier sells "advanced content privacy controls for public links." A screen recording leaks more than a document does (a customer's name in a tab, a dashboard in the background), so the default for new videos should be the workspace, not the internet. Link sharing in general is [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing#link-sharing).
- **Retention, holds and discovery.** Microsoft applies "eDiscovery, legal hold, retention, & DLP policies" to videos, along with Customer Key encryption and multi-geo storage, because they're files. A standalone product needs each of those built separately, and a customer's legal team will ask for each one; Loom's answer is the Enterprise tier's custom data retention policies.
- **Edits are versions.** Trimming, stitching and re-recording produce new versions; Microsoft keeps version history on videos like any file, and notes a consequence for analytics: after an edit saved over the original, most metrics reset, so it recommends uploading an edited video as a new file.

## Viewer Analytics and Privacy

Creators want to know whether anyone watched. Organizations want to know whether everyone watched the mandatory security training. Viewers mostly don't expect either to be watching them back. The products draw the line in different places, and the line is a design decision with legal weight.

Microsoft's per-video analytics, shown to the owner, site members and anyone with edit access, report **views** (any intentional play longer than zero seconds), **viewers** (unique people, available for 7 and 30 days but not 90), and **viewership retention** (views at each point as a percentage of the most-watched point, including rewatches). The counts come from "a standard probabilistic algorithm" with less than 2% error, and the analytics are deleted with the video. None of that names anyone.

Names are a separate switch. The SharePoint Viewers feature shows viewers of files and pages on a file's card; site owners "control whether people see the names of people who view files or pages," within what the organization-level sharing settings permit, and turning it on shows historical data, including views recorded while it was off. Loom's Business tier offers "Request email to view," which shows the creator who is watching by asking viewers to identify themselves, and Zoom's Clips Plus lists the same request-email-to-view control alongside viewer and admin insights.

My default for a workplace video product:

- **Aggregate counts and retention curves for every video,** with no names.
- **Named viewer lists only where viewers are told before they press play,** either because the creator required sign-in with a visible notice or because the workspace admin enabled named views for a container whose members know it.
- **Admin control over the whole feature,** at the workspace level, and an audit record whenever someone opens a named viewer list.

The reason is that a named view list of a policy video is attendance monitoring, and employee monitoring has notice laws, works councils and labor-board scrutiny attached ([Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy)). A creator seeing that three of five teammates watched their walkthrough is collaboration; HR exporting who didn't watch is monitoring, and the product should make the second a deliberate, visible admin choice.

## AI on Recorded Video

Because every async video has a transcript, it's a natural target for AI. Loom's Business + AI tier lists automatic summaries and chapters, text-based editing with silence and filler-word removal, "video-to-text automation" that creates issues, documents and messages from a video, and personalized videos at scale with variables; Microsoft lists manual chapters, transcripts and search over transcripts. The same rules as meeting AI apply ([AI Summaries and Meeting Assistants](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#ai-summaries-and-meeting-assistants)): an AI summary is a new derived record with provenance, a work item created from a video should link back to the timestamp it came from, and the video's permissions bound who may see anything generated from it. Training commitments for customer content are [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants#data-use-commitments).

## How to Build It

Async video reuses the `recordings` kind table from [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#how-to-build-it) with `source = 'async'`, and `item_versions` for edits. This chapter adds renditions, the upload session that lets the link work at stop, and viewer data at two levels of identity.

```sql
CREATE TABLE recording_upload_sessions (   -- chunks arrive while the creator is still recording
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  recording_item_id  UUID NOT NULL REFERENCES recordings (item_id),
  member_id          UUID NOT NULL REFERENCES members (id),
  storage_upload_id  TEXT NOT NULL,         -- the object store's multipart or resumable id
  chunks_received    INT NOT NULL DEFAULT 0,
  bytes_received     BIGINT NOT NULL DEFAULT 0,
  state              TEXT NOT NULL CHECK (state IN ('recording', 'finalizing', 'complete',
                       'abandoned')),
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);

CREATE TABLE video_renditions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  recording_item_id  UUID NOT NULL REFERENCES recordings (item_id),
  item_version_id    UUID NOT NULL REFERENCES item_versions (id),
  kind               TEXT NOT NULL CHECK (kind IN ('mezzanine', 'quick_play', 'ladder_rung',
                       'audio_only', 'thumbnail', 'captions')),
  codec              TEXT,
  height             INT,
  bitrate_kbps       INT,
  storage_key        TEXT NOT NULL,
  storage_tier       TEXT NOT NULL CHECK (storage_tier IN ('hot', 'cool', 'archive')),
  regenerable        BOOLEAN NOT NULL,      -- can be rebuilt from the mezzanine on demand
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE video_view_settings (         -- what viewers are told and what owners can see
  container_id       UUID PRIMARY KEY REFERENCES containers (id),
  named_viewers      BOOLEAN NOT NULL DEFAULT FALSE,    -- admin-enabled per container
  notice_text_version TEXT,                 -- shown to viewers before play when named
  set_by             UUID NOT NULL REFERENCES members (id),
  set_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE video_view_daily (            -- aggregate, unnamed, for every video
  recording_item_id  UUID NOT NULL REFERENCES recordings (item_id),
  day                DATE NOT NULL,
  views              INT NOT NULL,
  viewers_estimate   INT NOT NULL,          -- from a cardinality sketch, not a list
  retention_curve    INT[] NOT NULL,        -- views per segment of the duration
  PRIMARY KEY (recording_item_id, day)
);

CREATE TABLE video_named_views (           -- only written when the container allows it
  recording_item_id  UUID NOT NULL REFERENCES recordings (item_id),
  member_id          UUID NOT NULL REFERENCES members (id),
  first_viewed_at    TIMESTAMPTZ NOT NULL,
  last_viewed_at     TIMESTAMPTZ NOT NULL,
  furthest_position  INTERVAL NOT NULL,
  notice_text_version TEXT NOT NULL,        -- what the viewer was told
  PRIMARY KEY (recording_item_id, member_id)
);
```

Notes on the sketch:

- **The share link exists before the video does.** Creating the recording item and its upload session on record start lets the client show the link at stop; the player shows "processing" until the quick-play rendition lands.
- **Abandoned sessions expire.** A job finalizes or aborts upload sessions stuck in `recording` after a timeout, and deletes orphaned chunks ([Orphans, Purges and Link Rot](/books/user-generated-platforms/storage-and-delivery#orphans-purges-and-link-rot)).
- **Renditions are disposable, the mezzanine is the record.** Tiering and regeneration work on `regenerable` rows; holds and retention act on the item and its versions.
- **Named views are opt-in at the container,** so the default write path records only the aggregate, and the viewer's player shows the notice whenever `named_viewers` is on.
- **Analytics follow the video.** Deleting or purging a recording deletes its rows in both view tables, as Microsoft does with its analytics.
- **Events:** `recording.upload_started`, `recording.available`, `recording.rendition_ready`, `recording.transcript_ready`, `video.shared`, `video.named_views_enabled` feed search indexing, retention, notifications and the audit log.

## Auditing

- **Every share,** especially public and anonymous links, with who created and who revoked them.
- **Every change to named-viewer settings,** with the admin and the notice text in force.
- **Every time someone opens a named viewer list or exports view data,** since that's the monitoring use.
- **Ownership transfers** of videos at offboarding.
- **Deletions, retention purges and skipped purges under hold** for videos, as for any document ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## What This Means for the System You Build

- **Upload while recording,** so the link works the moment recording stops.
- **Treat a video as a document** with an owner, sharing, versions, retention, holds and discovery; reuse your file governance rather than building a parallel one.
- **Default sharing to the workspace,** and make public links an admin-governed choice.
- **Transcribe everything and index the transcript** with the video's permissions.
- **Plan for storage, not delivery:** tier renditions, keep the mezzanine, regenerate on demand, and let retention delete.
- **Show aggregate analytics to creators;** make named viewer lists an admin choice with notice to viewers and an audit trail.
- **Link anything generated from a video back to its timestamp,** under the video's permissions.

## References

**Vendor documentation**

- [Atlassian: Atlassian acquires Loom (October 12, 2023)](https://www.atlassian.com/blog/announcements/atlassian-acquires-loom), Loom as async video messaging, about 5 million videos a month from about 200,000 customers, standalone availability
- [Atlassian: Loom pricing](https://www.atlassian.com/software/loom/pricing), Starter limits, Business and Business + AI prices and features, "Request email to view," Enterprise SSO, SCIM, retention, link controls and SLA
- [Microsoft Learn: Overview of Microsoft Clipchamp's video player, camera and homepage](https://learn.microsoft.com/en-us/clipchamp/), videos as files in SharePoint, OneDrive and Teams, governance inherited from Microsoft 365, Stream (Classic) telemetry on page views
- [Microsoft Learn: Features in Microsoft Clipchamp](https://learn.microsoft.com/en-us/clipchamp/features-clipchamp), recording, adaptive bitrate playback, transcripts, captions and audio tracks, sharing and anyone links, analytics, eDiscovery, holds, retention, DLP, Customer Key and multi-geo
- [Microsoft Learn: Video analytics in Microsoft 365](https://learn.microsoft.com/en-us/clipchamp/video-analytics-viewership-retention), views, viewers and retention, time windows, the probabilistic count, edits resetting metrics, deletion with the video
- [Microsoft Support: Allow people to see who views their files or pages](https://support.microsoft.com/office/allow-people-to-see-who-views-their-files-or-pages-ee26dde0-c30e-4eca-b1c3-38922c450967), the SharePoint Viewers feature and the site owner's choice
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), pooled SharePoint storage of 1 TB per organization plus 10 GB per license
- [Zoom: Zoom Clips pricing](https://zoom.us/pricing/clips), Clips Basic and Clips Plus limits, prices, permission and retention controls, viewer and admin insights, request email to view

**Filings**

- [Atlassian 10-Q for the quarter ended December 31, 2023](https://www.sec.gov/Archives/edgar/data/1650372/000165037224000010/team-20231231.htm), the Loom acquisition closing on November 30, 2023 and purchase consideration of about $885.6 million in cash
- [Vimeo 8-K, Exhibit 99.1: Vimeo to be acquired by Bending Spoons (September 10, 2025)](https://www.sec.gov/Archives/edgar/data/1837686/000110465925088898/tm2525763d1_ex99-1.htm), the $7.85 per share, about $1.38 billion all-cash deal and Vimeo's segments
- [Vimeo 8-K (November 24, 2025)](https://www.sec.gov/Archives/edgar/data/1837686/000110465925115501/tm2532050d1_8k.htm), completion of the merger, trading suspension and delisting request
- [Zoom Communications 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), Zoom Clips as part of Zoom Workplace, included with paid plans
