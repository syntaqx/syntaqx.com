+++
title = "The Upload Path"
description = "Direct-to-storage and resumable uploads, validation against hostile files and decompression bombs, mezzanine specs, and scanning before anything publishes."
category = "User-Generated Platforms Industry"
order = 1813
part = "Media"
tags = ["user-generated-content", "media", "uploads", "object-storage", "trust-and-safety"]
+++

Every file on a user-generated platform arrives through one door: a stranger's device sends bytes, and the platform has to accept them, store them, prove they are what they claim to be, check them against every list of things it must never publish, and only then let anyone else see them. The upload is the platform's largest untrusted input. A phone on a train sends a 2 GB video over a connection that drops every few minutes; a script sends ten thousand images an hour; a crafted 50 KB PNG declares itself 100,000 pixels square and takes down the worker that decodes it; a file that matches a known child sexual abuse hash must never reach a CDN, and must be kept as evidence rather than deleted.

The hard part is that these demands pull in different directions. Users want an upload to be fast and to survive a dropped connection; the platform wants its application servers out of the byte path, its storage bill free of abandoned half-uploads, its decoders isolated from hostile files, and a hard gate between "received" and "published" that no code path can skip. This chapter covers the path from the client to a media asset that is ready to publish: direct-to-storage uploads, resumable and chunked protocols, validation and hostile files, the mezzanine specs platforms publish for creators, and the scanning gate before publish. It extends `media_assets` in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). What happens after the gate belongs to the next chapters: variants, formats and metadata stripping to [Images at Scale](/books/user-generated-platforms/images-at-scale), dedup, tiers and purges to [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery), transcoding to [Video on Demand](/books/user-generated-platforms/video-on-demand), and live broadcasts, which never upload a file at all, to [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding). The lists the scanning gate checks against are owned by [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-hash-lists), [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#gifct-and-hash-sharing), [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#hash-based-prevention) and [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id); this chapter is the hook they plug into.

## How the Platforms Do It

What platforms and upload vendors publish about their upload paths, as of October 2026:

| Platform or vendor | How bytes get in | Published limits | After the bytes land |
| --- | --- | --- | --- |
| **Amazon S3** | Presigned `PUT` URLs; multipart upload for large objects | Presigned URLs valid up to 7 days from the SDKs; parts numbered 1 to 10,000; multipart recommended from 100 MB | Parts are billed until the upload is completed or aborted |
| **Cloudflare Images** | Direct Creator Upload: the backend requests a one-time upload URL, the user's browser uploads to it without the platform's token | 10 MB, 100 megapixels, 12,000 pixels on a side; animations limited by total megapixels across frames; HEIC accepted as input | A draft image record exists from the moment the URL is issued until the file arrives |
| **Cloudflare Stream** | Direct creator uploads: a basic `POST` under 200 MB, the tus protocol above | A required `maxDurationSeconds` reserved against storage until the upload arrives | Webhooks or polling for the video's status |
| **Discord** | Attachment upload in the client | Per plan: the free limit is 20 MB (raised from 10 MB in August 2026), Nitro Basic 50 MB, Nitro up to 1 GB | Attachments shown in the message |
| **Google Cloud Storage** | Resumable upload sessions | Sessions last up to a week; a size range can be enforced with a request header | The session URI itself is the credential |
| **Mastodon** | `POST /api/v2/media` to the instance | Published per instance through its API (the docs' example: 16,777,216 bytes and 33,177,600 pixels for images, 103,809,024 bytes and 120 fps for video) | Large video, GIF and audio return `202 Accepted`; clients poll until `206 Partial Content` becomes `200 OK` |
| **Mux** | Direct uploads: the API returns an authenticated, resumable URL with a CORS origin set to the platform's app | Chunks in multiples of 256 KB, sent in order | `video.upload.asset_created`, then `video.asset.ready` webhooks |
| **YouTube** | Resumable upload sessions in its Data API: a session URI, chunked `PUT`s, `308 Resume Incomplete` with the confirmed range | 256 GB or 12 hours, whichever is less; 15 minutes until the account is verified | Processing before the video plays; a published encoding spec for what to upload |

Four patterns run through the table. **Nobody proxies bytes through the application:** every vendor's design hands the client a scoped, expiring credential for one upload and keeps the platform's API in charge of permission, not transport. **Big files are resumable by default:** YouTube, Stream above 200 MB, Mux and S3 multipart all assume the connection will drop and give the client a way to ask "how much did you get?" **Limits are published and enforced in more than one place:** in bytes at the storage layer, in pixels and duration at the decoder, and in plan tiers at the product, and Mastodon goes as far as publishing them in its API so clients can resize before sending. **Upload is not publish:** every service returns an object that exists but isn't ready (a draft image, a `202`, an asset waiting for a webhook), and the product shows "processing" until the pipeline says otherwise.

## Direct-to-Storage Uploads

The application server should never carry the bytes. Proxying uploads through it ties up a request worker per upload for minutes, multiplies egress (client to app, app to storage), and puts the platform's most exposed code (request parsing) on its biggest inputs. The pattern that replaced it has four steps:

1. **Ask.** The client tells the API what it intends to upload: purpose (post media, avatar, message attachment, video), declared type, declared size, and an idempotency key. The API checks what only it can check: the account's standing, the community's rules (a community that bans video, a channel that allows no attachments), per-account rate limits and quotas ([Rate Limiting](/docs/requests/rate-limiting)), and whether the declared size and type fit the purpose.
2. **Grant.** The API creates the media asset in `uploading` with an upload session, generates a storage key itself, and returns a scoped credential for exactly that key: a presigned URL, a one-time vendor URL or a resumable session.
3. **Send.** The client sends the bytes straight to storage or the vendor.
4. **Confirm.** The storage notification (or the client's "done", verified) moves the asset to `scanning`. The server checks the object really exists, its size is within the grant and its checksum matches, and never takes the client's word for any of it.

The credential is the security boundary, so its shape matters:

- **A presigned URL is a bearer token.** Amazon's documentation says so in those words, and a presigned URL "can be used multiple times, up to the expiration date and time," which the SDKs allow to be as long as 7 days (the console caps it at 12 hours). It is also bound to the credentials that signed it: a URL signed with temporary role credentials dies when the role session does, whatever expiry it claims. My default is minutes, not days: long enough to start the upload (S3 checks expiry when the request starts, so a long upload that began in time finishes), short enough that a leaked URL is useless by the time anyone finds it.
- **The platform names the key.** An upload to an existing key replaces the object, so a key built from the user's filename lets one user overwrite another's file. Generate the key server-side from the asset's ID; keep the original filename, if at all, as a display field on the asset, because it often carries personal data (a name, a date, a device).
- **Bound the size at the storage layer.** A declared size in the API means nothing if storage accepts whatever arrives. Google Cloud Storage accepts an `x-goog-content-length-range` header and rejects a body outside it with `400 Bad Request`; vendor upload URLs carry their own caps. Whatever the provider, the confirm step compares the stored size against the grant and rejects anything outside it.
- **One-time and short-lived where the vendor allows it.** Cloudflare's Direct Creator Upload URL expires after 30 minutes if unused by default, configurable from two minutes to six hours, and creates a draft image record until the file arrives. Mux's direct upload URL is tied to a CORS origin, which its docs advise setting to the platform's own application.
- **Uploads land somewhere nobody reads.** The original goes to a private bucket or prefix that no CDN serves and no public URL reaches. Only processed variants, produced after the scanning gate, are ever published. OWASP's guidance is the same in general terms: store uploads on a separate host, or at least outside the web root. A platform that serves originals from its main origin is one content-sniffing mistake away from serving an attacker's HTML as its own ([Security Headers](/docs/security/security-headers#the-baseline) covers `X-Content-Type-Options: nosniff`).

Uploads by URL (paste a link, import from another service) invert the flow: the platform's server fetches the bytes, which makes it a server-side request forgery target. The fetcher runs outside the platform's network, refuses private and link-local addresses after DNS resolution, follows a bounded number of redirects and enforces the same size cap while streaming ([API7:2023 Server Side Request Forgery](/docs/security/api-security#api7-2023-server-side-request-forgery)).

Every surface that accepts a file goes through the same path: post media, comment images, avatars and banners (`profiles.avatar_asset_id` in the core model), chat attachments, listing photos, verification documents. Avatars are the classic gap, because they're small, look harmless and show up on every page the user touches.

## Resumable and Chunked Uploads

A single `PUT` works for a photo on a good connection. A 4 GB video from a phone on cellular needs a protocol that survives the connection dropping, the app being backgrounded, and the user coming back an hour later. Three families cover almost every platform:

**tus**, the open protocol several vendors speak (Cloudflare Stream requires it above 200 MB). The client creates an upload with a `POST` carrying `Upload-Length` and `Upload-Metadata` and gets back a `Location`. To resume, it asks with `HEAD` and the server returns `Upload-Offset`; the client then `PATCH`es from exactly that offset with `Content-Type: application/offset+octet-stream`. A `PATCH` whose offset doesn't match the server's gets `409 Conflict` and changes nothing. Extensions add an `Upload-Expires` time after which an unfinished upload may be removed, an `Upload-Checksum` per request (a mismatch returns `460`), termination with `DELETE`, and concatenation, where several partial uploads sent in parallel are joined into a final one.

**Google-style resumable sessions,** used by the YouTube Data API and Google Cloud Storage. The first request describes the file (`X-Upload-Content-Length`, `X-Upload-Content-Type`) and returns a session URI. The client `PUT`s bytes to it; after a failure it sends an empty `PUT` with `Content-Range: bytes */TOTAL`, and a `308 Resume Incomplete` response carries a `Range` header with the bytes confirmed so far. The next chunk must start exactly one byte past that range, because "overlapping or skipping bytes" uploads nothing. Chunks are multiples of 256 KB (only the last may be smaller); `500`, `502`, `503` and `504` are resumable with exponential backoff; an expired session returns `404` and the upload starts over. Cloud Storage sessions last up to a week, and its docs warn that the session URI "acts as an authentication token": anyone holding it can finish the upload. Mux's direct uploads behave the same way (`308` means keep going; chunks in multiples of 256 KB, in order).

**S3 multipart,** the object store's own answer. The client initiates an upload, sends parts numbered 1 to 10,000 in any order and in parallel, records each part's ETag, and completes with the list; a failed part is retried alone. Amazon recommends it for objects of 100 MB or more. Unlike the other two, a multipart upload has no expiry: parts are stored and billed until the upload is completed or aborted, and Amazon recommends a lifecycle rule with `AbortIncompleteMultipartUpload` to sweep the abandoned ones.

Whichever family the platform uses, the same rules apply:

- **The server's offset is the truth.** Resume from what the server says it has, never from the client's count; both tus and the Google protocol exist to make that question cheap.
- **Every session expires, and expiry cleans up.** An abandoned upload is storage the platform pays for and nobody will ever see. The session row carries an expiry, a sweeper aborts or deletes what didn't finish, and the asset moves to a terminal state ([Background Jobs](/docs/architecture/background-jobs#scheduling)). [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#orphans-purges-and-link-rot) counts these among its orphans.
- **Checksum the whole file, not just the parts.** Part checksums catch transmission errors; a whole-file hash is what dedup and hash matching need, and S3 can validate a full-object checksum at completion and fail with `BadDigest` on a mismatch.
- **Make "create upload" idempotent.** A mobile client that retries the create call after a timeout must get the same session back, not a second asset ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Reserve, then reconcile.** Cloudflare Stream makes the uploader declare `maxDurationSeconds` and holds that much of the account's storage until the file arrives, then charges only the real duration. A platform with per-user quotas can do the same: reserve the declared size or duration against the quota at grant time, release the rest at confirm, and release everything when the session expires.

In-app cameras push this onto the client: drafts encoded on the phone and uploaded in the background, before the user taps post, are in [Camera & Effects](/books/user-generated-platforms/camera-and-effects#drafts-and-the-offline-upload).

## Validation and Hostile Files

Validation answers one question: is this a file of an allowed kind, within limits, that the platform's own decoders can safely read? Each layer of the answer is cheap to fool on its own.

**Don't trust the name or the declared type.** OWASP's File Upload Cheat Sheet treats the client's `Content-Type` as a hint for catching honest mistakes, not a control, and file-signature (magic byte) checks as useful but "pretty common and easy" to bypass on their own. The asset keeps both the declared type and the type detected from the bytes, and a mismatch is a signal worth logging. The only real test is decoding the file with the platform's own decoder, under limits.

**Cap bytes, pixels and time separately.** A file's size says little about what it costs to process:

- **Decompression bombs** are small files that decode into enormous images: a PNG of uniform color compresses absurdly well and can declare dimensions that need gigabytes of memory to hold. Image libraries carry guards, and their defaults are worth knowing: Pillow's `MAX_IMAGE_PIXELS` is 89,478,485 pixels ("approximately 0.25GB for a 24-bit (3 bpp) image"), above which it warns, and above twice which it raises `DecompressionBombError`. A platform sets its own pixel cap below the library's and checks the header's declared dimensions before allocating anything.
- **Animations multiply.** Every frame is decoded, so the limit is on total pixels across frames, which is how Cloudflare Images states it ("GIF/WebP animations are limited to the total megapixels across all frames"), alongside its 10 MB, 100 megapixel and 12,000 pixel per side limits for hosted images.
- **Video limits are duration, resolution and frame rate,** checked by probing the container before any transcoding is scheduled: YouTube caps uploads at 256 GB or 12 hours and holds unverified accounts to 15 minutes; Mastodon's API publishes a video pixel matrix and a 120 fps frame rate limit.
- **Archives decompress.** OWASP recommends not accepting ZIP uploads at all, and measuring the decompressed size if you must.

Publishing the limits helps honest clients. Mastodon returns its instance's media limits from its API, so apps can resize and re-encode on the device before sending; a client that knows the cap never uploads 30 MB to be rejected.

**Decoders are attack surface.** Image and video libraries parse complex formats written by strangers, and they have a history:

- **ImageTragick** (disclosed May 3, 2016) was a set of ImageMagick flaws, the worst (CVE-2016-3714) allowing remote code execution through insufficient shell-character filtering in the delegates ImageMagick hands files to; others let a crafted file make the server fetch URLs (CVE-2016-3718), delete, move or read local files. The published mitigations were to check magic bytes before handing a file to ImageMagick and to disable the dangerous coders (MVG, MSL, URL, EPHEMERAL and others) in its `policy.xml`.
- **CVE-2023-4863** (September 2023) was a heap buffer overflow in libwebp's lossless decoder: a crafted file with an unbalanced Huffman tree made the library "write data beyond the buffer allocated for the lookup tables." Cloudflare's write-up notes the library is used by "virtually every application that handles WebP images," and Citizen Lab tied it to an exploit chain used against an iPhone. Cloudflare patched its own image pipeline from a fix in the libwebp repository before a release existed.

The rules that follow are about containment, because the next decoder bug is already written:

- **Allowlist formats per purpose.** An avatar needs JPEG, PNG, WebP and HEIC; it doesn't need SVG, TIFF, PSD or PDF. Every format accepted is a decoder kept patched.
- **Decode in a sandbox.** No network, a read-only filesystem, and CPU, memory and wall-clock limits per file; a worker that crashes or times out marks the asset `rejected` (or retries once on a fresh worker) and never takes the queue down.
- **Re-encode, don't pass through.** Publishing pixels the platform decoded and re-encoded (content disarm) removes most of what a crafted file carries, and strips metadata on the way, which [Images at Scale](/books/user-generated-platforms/images-at-scale#metadata-location-and-orientation) relies on. OWASP's caveat stands: rewriting "does not guarantee that all malicious content is removed," so the decoder that does the rewriting still needs the sandbox.
- **Patch decoders on the vulnerability clock.** An image library is internet-facing code even when it runs in a queue worker ([Remediation Targets](/docs/security/vulnerability-management#remediation-targets)).
- **Treat SVG as active content.** It's XML that can carry scripts and external references. Rasterize it, or serve it only from a separate cookieless origin with a strict content security policy.

**HEIC is a normal input now.** iPhones from the iPhone 7 on capture HEIF photos and HEVC video unless the user switches the camera to "Most Compatible," and whether a file is converted to JPEG on the way out depends on how it's shared, so a platform sees both. Refusing HEIC pushes conversion onto users who don't know what the format is. Accept HEIC at the upload path (Cloudflare Images lists it among its input formats), decode it in the same sandbox, and leave the conversion to web formats to [Format Negotiation](/books/user-generated-platforms/images-at-scale#format-negotiation). The same goes for orientation: the original's EXIF rotation must be applied before metadata is stripped, which [Metadata, Location and Orientation](/books/user-generated-platforms/images-at-scale#metadata-location-and-orientation) covers.

**Files that are only files** (documents, archives and binaries in chat or developer communities) can't be re-encoded. OWASP's advice is to run them through antivirus or a sandbox where available; the platform also serves them with `Content-Disposition: attachment` from a separate domain so a browser never renders them in the platform's origin.

## Mezzanine Specs

A mezzanine file is the high-quality master the platform transcodes from. Platforms accept almost anything decodable, but they publish what they'd like to receive, because the input decides the quality ceiling, how fast processing starts and how cleanly the file segments. YouTube's recommended upload encoding settings are the most detailed public spec:

| Setting | YouTube's recommendation |
| --- | --- |
| Container | MP4, no edit lists, `moov` atom at the front (fast start) |
| Video codec | H.264, progressive scan, High Profile, 2 consecutive B-frames, closed GOP of half the frame rate, CABAC, variable bitrate, 4:2:0 chroma |
| Audio | AAC-LC, Opus or Eclipsa Audio at 48 kHz |
| Frame rate | The rate it was recorded at; deinterlace first (1080i60 becomes 1080p30) |
| SDR bitrate, 24 to 30 fps | 1080p 8 Mbps; 1440p 16 Mbps; 2160p 35 to 45 Mbps |
| SDR bitrate, 48 to 60 fps | 1080p 12 Mbps; 1440p 24 Mbps; 2160p 53 to 68 Mbps |

Each line has a pipeline reason. **Fast start** puts the index at the front, so the platform can probe duration, codecs and dimensions from the first bytes and begin work before the whole file is read. **A closed GOP of half the frame rate** gives a keyframe every half second that doesn't depend on frames before it, so the file can be cut into segments and renditions that start cleanly ([Encoding Ladders and Per-Title Encoding](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding)). **Recording frame rate and progressive scan** avoid a frame-rate conversion or deinterlacing pass the platform would otherwise run on every rendition. **Bitrates well above the delivery ladder** give the encoder headroom, because every rendition is a re-encode and a starved master looks worse at every rung.

What I take from it for a platform's own path: probe every video on arrival, record what it is (container, codecs, resolution, frame rate, bitrate, whether it's fast-start), accept the deviations the transcoder can fix, reject only what it can't, and tell creators in the product when their upload falls short of the spec rather than silently publishing a worse version. The probe result also feeds the cost model: a 12-hour 4K upload is a very different transcoding job from a 30-second phone clip, and [The Transcode Farm](/books/user-generated-platforms/video-on-demand#the-transcode-farm) schedules on it.

## Scanning Before Publish

The gate between "received" and "visible to anyone else" is the most important control in the media pipeline. The playbook's rule is short: any service that accepts user images should match uploads against known hashes before they're visible ([Trust & Safety: Child Safety](/docs/security/trust-and-safety#child-safety)). In the core model the gate is the `scanning` state of `media_assets`:

| From | Event | To |
| --- | --- | --- |
| `uploading` | The client confirms and the bytes are complete | `scanning` |
| `uploading` | The session expires | `rejected` |
| `scanning` | Every blocking scan passes | `processing` |
| `scanning` | Validation fails | `rejected` |
| `scanning` | A list match or a hold | `quarantined` |
| `processing` | Variants are made | `ready` |

What runs at the gate, in order of cost:

1. **Validation,** above: type, limits, a successful sandboxed decode.
2. **Exact hash lookups.** The SHA-256 the confirm step computed is looked up against the platform's own record of files it has already rejected or removed, so a re-upload of a removed file never gets further than its first request (the same hash drives [Exact and Perceptual Dedup](/books/user-generated-platforms/storage-and-delivery#exact-and-perceptual-dedup)).
3. **Perceptual hash matching** against the industry lists: child sexual abuse material ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching)), terrorist and violent extremist content ([Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#gifct-and-hash-sharing)), non-consensual intimate imagery ([Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#hash-based-prevention)), and the platform's own list of previously removed content. These are blocking: no variant is generated and nothing reaches a CDN until they pass. The [vendors and programs](/books/user-generated-platforms/platform-landscape#trust-and-safety) that hold the lists, and how each match must be handled, belong to those chapters.
4. **Malware scanning** for files that are only files.
5. **Copyright fingerprinting** against reference files, blocking or not by policy and by what the rights holder chose (block, monetize, track); [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id) owns the claim that results.
6. **Classifiers** for nudity, graphic violence and the like, which set a content rating, route to human review, or blur, and which the playbook's [Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review) bands govern. These are often non-blocking: the asset proceeds and a high score holds the post for review instead.

![The media asset's states around the scanning gate. Uploading moves to scanning when the bytes are complete, scanning to processing when the blocking scans pass, and processing to ready when the variants are made; scanning is accented. Dashed exits: uploading to rejected when the session expires, scanning to rejected when validation fails, and scanning to quarantined on a list match or hold, where a case opens and evidence is held. Below, the checks at the gate in order of cost: validation (type, limits, sandboxed decode), exact hash (own rejected and removed files), perceptual hash (industry lists, blocking), malware (files that are only files), copyright fingerprint (blocking or not, by policy) and classifiers (often non-blocking). Double outlines mark terminal states.](/diagrams/ugp-upload-path-gate.svg "Nothing reaches a CDN until the blocking scans pass, and a list match quarantines rather than deletes. The cheap checks run first.")

Design rules for the gate:

- **Quarantine, never delete, on a list match.** A match is evidence. The asset moves to `quarantined`, its original stays in restricted storage under a legal hold (`legal_holds` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it)), a moderation case opens with the asset as subject, and the owning chapter's process (a CyberTipline report, a GIFCT incident, a copyright claim) takes over. What the uploader is told, and when, is that process's decision, not the upload path's.
- **Blocking scans fail closed.** If the hash-matching service is down, uploads wait in `scanning`; they don't publish and scan later. Non-blocking classifiers can fail open with a re-scan queued, and the timeout is recorded as a verdict, not swallowed.
- **Every scan is a row.** Which scanner, which version, which list and list version, the verdict, the score and how long it took. The [build, buy or rent](/books/user-generated-platforms/platform-landscape#build-buy-or-rent) rule applies: a vendor's answer is evidence in an appeal or a report and must survive the vendor changing its model.
- **Lists grow, so scanning is not once.** New hashes are added to the lists every day, so a file that passed last year may match today. Keeping each asset's perceptual hash (the core model's `perceptual_hash`) makes a back-scan of the archive a query rather than a re-decode of every file; the harm chapters own when to run one.
- **Every surface, every version.** Avatars, banners, chat attachments, listing photos, a replaced image on an edited post, and a recording when a live stream ends all pass the same gate. An edit that swaps the media is a new asset and a new scan, never an update of the old one's bytes.
- **Show the state.** The product says "processing" honestly. Mastodon's API returns `202 Accepted` and a null URL until the full file is ready, Mux and Stream send webhooks when the asset is ready, and a post with media isn't publishable until every attached asset is `ready`. A post that publishes with a broken image while its file is still being scanned teaches users to repost, which doubles the work.

The gate costs seconds, and the platforms accept that, because the alternative is a window in which a known abuse image sits on a CDN edge. Live streams are the exception, since they can't be checked before they air, and [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#livestreams) covers what replaces the gate there.

## How to Build It

The chapter's additions to the core model, as columns on `media_assets` and two new tables:

```sql
ALTER TABLE media_assets
  DROP CONSTRAINT media_assets_state_check,
  ADD CONSTRAINT media_assets_state_check CHECK (state IN ('uploading', 'scanning',
    'processing', 'ready', 'rejected', 'quarantined', 'removed', 'purged')),
  ADD COLUMN purpose           TEXT NOT NULL DEFAULT 'post_media' CHECK (purpose IN
                                 ('post_media', 'avatar', 'banner', 'message_attachment',
                                  'listing_photo', 'video', 'verification_document')),
  ADD COLUMN source            TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('direct',
                                 'resumable', 'url_import', 'api', 'federation',
                                 'live_recording')),
  ADD COLUMN declared_type     TEXT,     -- what the client said; a hint, never trusted
  ADD COLUMN detected_type     TEXT,     -- from decoding the bytes, e.g. 'image/heic'
  ADD COLUMN original_filename TEXT,     -- display only; never a storage key; personal data
  ADD COLUMN probe             JSONB,    -- container, codecs, fps, bitrate, fast start
  ADD COLUMN rejected_reason   TEXT,     -- 'too_large', 'pixel_limit', 'decode_failed', ...
  ADD COLUMN uploaded_at       TIMESTAMPTZ,  -- bytes confirmed in storage
  ADD COLUMN scanned_at        TIMESTAMPTZ,  -- every blocking scan passed
  ADD CONSTRAINT media_assets_rejected_reason
    CHECK ((state = 'rejected') = (rejected_reason IS NOT NULL));

CREATE TABLE upload_sessions (           -- one grant to send bytes for one asset
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id  UUID NOT NULL UNIQUE REFERENCES media_assets (id),
  account_id      UUID REFERENCES accounts (id),  -- null: an anonymous upload
  idempotency_key TEXT,                  -- the client's, so a retried create returns this row
  protocol        TEXT NOT NULL CHECK (protocol IN ('presigned_put', 'multipart', 'tus',
                    'resumable_session', 'vendor_direct', 'url_fetch')),
  vendor_ref      TEXT,                  -- the vendor's upload id, or the multipart upload id
  declared_bytes  BIGINT,                -- null when the client can't know yet
  max_bytes       BIGINT NOT NULL,       -- the cap from the purpose and the account's plan
  max_duration_ms INT,                   -- video: reserved against the quota until confirm
  received_bytes  BIGINT NOT NULL DEFAULT 0,  -- the server's offset, from storage
  status          TEXT NOT NULL CHECK (status IN ('open', 'completed', 'expired',
                    'aborted', 'rejected')),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  CHECK (received_bytes <= max_bytes),
  UNIQUE (account_id, idempotency_key)
);

CREATE TABLE media_scans (               -- one row per check per asset; the gate reads these
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id  UUID NOT NULL REFERENCES media_assets (id),
  stage           TEXT NOT NULL CHECK (stage IN ('validation', 'exact_hash', 'hash_list',
                    'malware', 'fingerprint', 'classifier')),
  scanner         TEXT NOT NULL,         -- 'platform', or the vendor
  scanner_version TEXT,                  -- model or engine version
  list_ref        TEXT,                  -- which list and list version, for hash_list
  blocking        BOOLEAN NOT NULL,      -- does the gate wait for this row?
  verdict         TEXT CHECK (verdict IN ('pass', 'match', 'flag', 'fail', 'error',
                    'timeout')),         -- null while running
  score           NUMERIC,               -- classifiers; distance for near matches
  detail          JSONB,                 -- the raw vendor result, kept as evidence
  moderation_case_id UUID REFERENCES moderation_cases (id),  -- opened on match or flag
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX media_scans_asset ON media_scans (media_asset_id, stage);
```

The gate is one query over those rows, run when a scan completes:

```sql
-- Move an asset out of 'scanning' only when every blocking scan has passed.
UPDATE media_assets a
SET state = 'processing', scanned_at = NOW()
WHERE a.id = $1
  AND a.state = 'scanning'
  AND NOT EXISTS (
    SELECT 1 FROM media_scans s
    WHERE s.media_asset_id = a.id
      AND s.blocking
      AND (s.verdict IS NULL OR s.verdict <> 'pass')
  );
```

Notes on the sketch:

- **The state machine is enforced, not hoped for.** Only the gate moves an asset from `scanning` to `processing`, only the variant step moves it to `ready`, and only `ready` assets can be attached to a published content item; a check in the publish path and a trigger on `content_media` both refuse anything else. `rejected` is the new terminal state for files that failed validation or whose session expired: their bytes are deleted and the row stays with its reason.
- **The session is the grant.** `max_bytes`, `max_duration_ms` and `expires_at` come from the purpose and the account's plan, so a free account's 10 MB limit and a creator's 12-hour video limit are rules looked up at grant time ([Rules as Data](/docs/architecture/rules-as-data)), not constants in the client. `received_bytes` is updated from storage, never from the client.
- **Quotas are queries over sessions.** Bytes or minutes uploaded per account per day, and open sessions per account, are sums over `upload_sessions`, checked at grant time alongside the request rate limit.
- **Sweepers close what users abandon.** A scheduled job expires `open` sessions past `expires_at`, aborts the multipart upload or deletes the partial object, and marks the asset `rejected` with `rejected_reason = 'expired'`; a storage lifecycle rule for incomplete multipart uploads is the backstop.
- **`media_scans` is the hook other chapters extend.** [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it), [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#how-to-build-it) and [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#how-to-build-it) add their list-match records (list, hash type, distance, report or incident reference) against the `hash_list` rows; [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it) adds claims against `fingerprint` rows. None of them adds a second scanning pipeline.
- **A match opens a case and a hold in one transaction.** The scan row, the `quarantined` state, the moderation case with the asset as subject and the `legal_holds` row are written together, so there is no moment when the asset is quarantined but nobody is looking at it, or flagged but erasable.
- **Events:** `media.upload_granted`, `media.uploaded`, `media.rejected`, `media.scanned`, `media.quarantined` and `media.ready` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)); processing, the composer's "processing" state, moderation queues and quota counters consume them.

## Auditing

- **Every upload's provenance:** who uploaded it (or that it was anonymous), from which surface and purpose, through which protocol, with the declared and detected type, the original filename where kept, and when the bytes were confirmed.
- **Every scan, with versions.** Scanner, version, list and list version, verdict, score, duration and raw result, so a CyberTipline report, a copyright dispute or an appeal can show exactly what matched and when, and a list update can be traced to the back-scan it triggered.
- **Every rejection and its reason,** so a creator who says "the upload failed" gets an answer, and limit changes can be measured against how many honest uploads they turn away.
- **Every state change of an asset,** including who or what released a quarantined asset and on which case decision.
- **Limits in force at the time.** Which size, pixel and duration caps applied to an account's plan on the day of an upload, because the caps change (Discord's free limit went from 10 MB to 20 MB in August 2026) and a dispute about a rejected file is judged against the rule of the day.

## What This Means for the System You Build

- **Keep bytes out of the application tier:** grant a scoped, short-lived credential for one platform-named key and let the client send straight to storage or the vendor.
- **Bound every upload in three places:** declared size at the API, enforced size at storage, decoded pixels, frames and duration in the worker.
- **Make large uploads resumable** with tus, a resumable session or multipart, resume from the server's offset, and checksum the whole file.
- **Expire and sweep every session,** including abandoned multipart parts the storage bill still counts.
- **Decode in a sandbox** with no network and hard limits, allowlist formats per purpose, re-encode before publishing, and patch image and video libraries on the vulnerability clock.
- **Accept HEIC and fix orientation** at the start of the pipeline rather than pushing format problems onto users.
- **Publish a mezzanine spec,** probe every video on arrival, and tell creators when an upload falls short.
- **Gate publication on blocking scans** that fail closed, with hash-list matching before any variant or CDN copy exists.
- **Quarantine and hold on a match,** opening a case in the same transaction, and let the owning harm chapter's process decide the rest.
- **Record every scan as a row** with scanner, version and list version, and keep perceptual hashes so back-scans are queries.
- **Send every surface through the same path:** avatars, attachments, listing photos and recordings included.

## References

**Standards and protocols**

- [tus: Resumable upload protocol 1.0](https://tus.io/protocols/resumable-upload), `HEAD` and `Upload-Offset`, `PATCH`, `409 Conflict` on offset mismatch, the creation, expiration, checksum, termination and concatenation extensions
- [OWASP: File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), extension allowlists, untrusted content types, limits of signature checks, generated names, separate hosts, image rewriting and its limits, antivirus, ZIP files and decompressed size

**Vendor documentation**

- [Amazon S3: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), presigned URLs as bearer tokens, reuse until expiry, 7-day and 12-hour limits, expiry with temporary credentials, expiry checked at request start
- [Amazon S3: Uploading objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html), uploads replacing an existing object at the same key
- [Amazon S3: Uploading and copying objects using multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), parts 1 to 10,000, the 100 MB recommendation, no expiry, parts billed until completed or aborted, `AbortIncompleteMultipartUpload`, full-object checksums and `BadDigest`
- [Google Cloud Storage: Resumable uploads](https://docs.cloud.google.com/storage/docs/resumable-uploads), session URIs as authentication tokens, one-week sessions, 256 KiB buffer multiples
- [Google Cloud Storage: HTTP headers and query string parameters](https://docs.cloud.google.com/storage/docs/xml-api/reference-headers), `x-goog-content-length-range` and the `400` it returns
- [YouTube Data API: Resumable uploads](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol), session URIs, the empty `PUT` status check, `308 Resume Incomplete` and `Range`, 256 KB chunks, backoff on `500` to `504`, `404` for expired sessions
- [Cloudflare Images: Direct Creator Upload](https://developers.cloudflare.com/images/upload-images/direct-creator-upload/), one-time upload URLs, 30-minute default expiry and the two-minute to six-hour range, draft records
- [Cloudflare Images: Limits](https://developers.cloudflare.com/images/get-started/limits/), 10 MB, 100 megapixels, 12,000 pixels, animation limits across frames, HEIC as an input format
- [Cloudflare Stream: Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/), basic uploads under 200 MB, tus above, `maxDurationSeconds` reservations
- [Mux: Upload files directly](https://www.mux.com/docs/guides/upload-files-directly), authenticated resumable URLs, CORS origin, `308` to continue, chunks in 256 KB multiples sent in order, upload and asset webhooks
- [Pillow: Image module](https://pillow.readthedocs.io/en/stable/reference/Image.html), `MAX_IMAGE_PIXELS` of 89,478,485, `DecompressionBombWarning` and `DecompressionBombError` at twice the limit

**Platform documentation**

- [YouTube: Recommended upload encoding settings](https://support.google.com/youtube/answer/1722171?hl=en), container, codec, GOP, audio, frame rate and bitrate recommendations
- [YouTube: Upload videos longer than 15 minutes](https://support.google.com/youtube/answer/71673?hl=en), the 15-minute default and the 256 GB or 12-hour maximum
- [Mastodon: Instance entity](https://docs.joinmastodon.org/entities/Instance/), media attachment limits published in the API
- [Mastodon: Media API methods](https://docs.joinmastodon.org/methods/media/), `202 Accepted` for asynchronous processing, `206 Partial Content` while processing
- [Apple: Using HEIF or HEVC media on Apple devices](https://support.apple.com/en-us/116944), HEIF and HEVC capture from iPhone 7, the Most Compatible setting, conversion depending on how media is shared
- [Discord: File Attachments FAQ](https://support.discord.com/hc/en-us/articles/25444343291031-File-Attachments-FAQ), the 20 MB free limit (up from 10 MB as of August 2026), Nitro Basic at 50 MB and Nitro at up to 1 GB

**Vulnerabilities**

- [ImageTragick](https://imagetragick.com/), CVE-2016-3714 and related ImageMagick flaws, the May 3, 2016 disclosure, magic-byte checks and `policy.xml` mitigations
- [Cloudflare: Uncovering the hidden WebP vulnerability](https://blog.cloudflare.com/uncovering-the-hidden-webp-vulnerability-cve-2023-4863/), CVE-2023-4863 in libwebp's Huffman tables, its reach, the in-the-wild exploit, and Cloudflare's patching of its image pipeline
