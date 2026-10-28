+++
title = "Video on Demand"
description = "Transcode farms, encoding ladders and per-title encoding, codec portfolios, HLS, DASH and CMAF packaging, DRM, signed playback and cost per viewer-hour."
category = "User-Generated Platforms Industry"
order = 1816
part = "Media"
tags = ["user-generated-content", "video", "transcoding", "streaming", "drm"]
+++

A video upload is the most expensive thing a user can hand a platform. The file arrives in whatever shape the phone, camera or editing app produced, and before anyone can watch it the platform has to decode it, scale it to several sizes, re-encode each size at several bitrates, cut every rendition into segments, write manifests that let a player switch between them, and push the results through a CDN to devices that support different codecs. Then it has to keep all of that for years, for a catalog where a handful of videos get most of the views and most videos are watched a few times or never. Every choice along the way trades compute, storage and delivery bandwidth against quality and time to publish, and the trades are different for a professional studio's library, a creator's back catalog and a teenager's ten-second clip.

This chapter covers that pipeline after the upload lands: transcode farms and job orchestration, encoding ladders and per-title encoding, the codec portfolio and watch-time-gated re-encoding, packaging in HLS, DASH and CMAF, thumbnails, captions and audio tracks, DRM and signed playback, downloads and creator archive export, and the arithmetic of cost per viewer-hour. It extends `media_assets` and the `media_variants` table from [Images at Scale](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand) in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Getting the bytes in and scanning them is [The Upload Path](/books/user-generated-platforms/upload-path); storage tiers, CDN egress and cache purges are [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery); live video is [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) and [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods); fingerprinting uploads against rights holders' references, and muting matched audio, is [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id).

## How the Platforms Do It

The public record splits into platforms that built their own pipeline, sometimes down to the silicon, and vendors that rent the same pipeline as an API:

| Platform or vendor | What's public about its VOD pipeline | The lesson |
| --- | --- | --- |
| **AWS Elemental MediaConvert** | Automated ABR picks 3 to 15 renditions per input with QVBR rate control and bills only the renditions it writes | Per-title ladders are a rentable job setting |
| **Cloudflare Stream** | Free encoding and ingress; $5 per 1,000 minutes stored and $1 per 1,000 minutes delivered; signed tokens with geo and IP rules | Some vendors meter minutes, not bytes, which moves the cost to watch time |
| **Meta (Facebook and Instagram Reels)** | A cheap hardware AVC encode at upload; software AVC, VP9 or AV1 encodes chosen from a convex hull of 35 candidates only once projected watch time crosses a threshold; Instagram cut the cost of basic adaptive encodings 94% by repackaging instead of re-encoding | Spend compute where the watch time is, not where the uploads are |
| **Mux** | Basic, Plus and Premium quality levels: Basic has a reduced ladder and no encoding charge, Plus adds per-title encoding, Premium an extended ladder; just-in-time encoding; signed playback; DRM as an add-on | Quality is a product tier with a price, and encoding can wait for the first viewer |
| **Netflix** | Replaced one fixed ladder (235 kbps at 320x240 up to 5,800 kbps at 1080p) with a ladder per title in December 2015 | The right bitrate depends on the content, not the resolution |
| **Twitch** | Stores recorded segments, thumbnails and playlists in S3; a metadata and post-processing system tracks every VOD type and runs jobs such as MP4 downloads | A VOD is a set of objects plus a metadata service, not a file |
| **YouTube** | Built the Argos video coding unit (VCU), a transcoding ASIC deployed across tens of thousands of servers; for offline two-pass encoding it gives 8x (H.264) to 20x (VP9) the throughput of software encoding and an order of magnitude better performance per cost | At the largest scale, the transcode farm becomes a hardware program |

Three patterns run through the table. **Encode lazily and in stages:** a cheap, fast encode makes the video playable, and expensive encodes follow only for videos that earn them (Meta's watch-time gate, Mux's Basic tier and just-in-time encoding, YouTube's dedicated hardware for the volume that remains). **The ladder is per title:** a fixed ladder wastes bits on cartoons and starves sports, so every pipeline that can afford it searches for the ladder per video. **Delivery dominates at scale:** encoding happens once and storage grows slowly, but every view of every rendition is egress, so the codec and the top rung's bitrate decide the bill.

## The Transcode Farm

A transcode farm is a job system: a queue of work units, a pool of encoders, and a scheduler that keeps the expensive part busy. The general mechanics (enqueue in the same transaction as the state change, retries with backoff, dead letters, visibility timeouts) are the playbook's [Background Jobs](/docs/architecture/background-jobs#job-design); the video twists are these:

- **Split the work.** A two-hour upload is one file but thousands of independent units. Pipelines cut the source into chunks at keyframes, encode chunks in parallel across many machines, and stitch the outputs, which bounds time to publish by chunk length rather than video length. Mux's 2018 description of just-in-time encoding starts with the same move: download the file and slice it into short chunks before any encoding happens. Its rule of thumb for conventional pipelines was that encoding takes 25% to 100% of the video's duration, with a minimum of 30 seconds.
- **Decode once, encode many.** Every rendition starts from the same decoded frames, so a worker that decodes once and feeds several scalers and encoders saves the repeated decode. Google's VCU paper names inline scaling and shared memory for "transcoding from a source video to multiple resolutions and formats in parallel" as a design point of the hardware.
- **Choose the hardware by volume.** CPUs run any codec and any setting; GPUs and ASICs run a few codecs much faster per watt. YouTube's VCU deployment reports 8x to 20x the throughput of software encoding for H.264 and VP9 two-pass encodes; Twitch reported a prototype ASIC transcode server at "over 10x the scale" of its previous solution; Meta uses hardware AVC at upload and saves software encodes for later. Hardware wins on cost per minute for the formats it supports and loses on flexibility, which is why the platforms that built ASICs kept software fallbacks.
- **Schedule for utilization.** Transcode capacity is bought for peak and idle off peak, so the farm runs priorities: first playable rendition for fresh uploads ahead of everything, advanced re-encodes and backfills (a new codec rolled across the back catalog) in the troughs. Google describes its VCU scheduler as an online multi-dimensional bin-packing problem across its data centers.
- **Record every job.** A job row with the input, ladder version, codec, worker type, outcome and output minutes is how the platform answers "why does this video look bad on that device," re-runs a failed rung without re-running the rest, and reconciles a vendor's invoice. Vendors bill by output: MediaConvert's automated ABR bills each rendition it writes per minute, so a ten-rendition, 60-minute stack is 600 billed minutes.

The state the rest of the platform sees is simpler than the farm. A video's `media_assets` row moves from `processing` to `ready` when its first playable rendition and manifest exist ([The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish) owns the earlier states); higher rungs, better codecs and captions arrive afterwards as new variants and tracks without changing that state. Platforms surface the difference to creators: a video can be public at low resolution while its higher renditions are still processing.

## Encoding Ladders and Per-Title Encoding

A ladder is the set of renditions a video is encoded into: resolution, bitrate and frame rate per rung, so a player can step down when bandwidth drops and up when it recovers. Apple's HLS authoring specification publishes the most widely copied starting point:

| Rung | Resolution | H.264 bitrate (kbps) | Frame rate |
| --- | --- | --- | --- |
| 1 | 416x234 | 145 | Up to 30 fps |
| 2 | 640x360 | 365 | Up to 30 fps |
| 3 | 768x432 | 730 | Up to 30 fps |
| 4 | 768x432 | 1,100 | Up to 30 fps |
| 5 | 960x540 | 2,000 | Same as source |
| 6 | 1280x720 | 3,000 | Same as source |
| 7 | 1280x720 | 4,500 | Same as source |
| 8 | 1920x1080 | 6,000 | Same as source |
| 9 | 1920x1080 | 7,800 | Same as source |

Apple calls these initial targets to evaluate against your content, makes the 2,000 kbps variant the default first choice, and publishes a separate HEVC ladder that reaches 1080p at 4,500 and 5,800 kbps (against H.264's 6,000 and 7,800) and continues to 3840x2160 at up to 16,800 kbps. Three properties of the table matter more than its numbers. **Rungs repeat resolutions:** two 720p rungs at different bitrates exist because a player chooses by bandwidth, not size, and at a given resolution the higher bitrate is simply better quality; MediaConvert's documentation makes the same point when explaining why its automatic stacks have several renditions at one resolution. **Frame rate drops at the bottom:** the lower rungs cap at 30 fps, and MediaConvert may halve 60 fps sources to 30 and then 15 for the lowest rungs. **Keyframes align:** every rendition has an IDR frame at the same timestamps (Apple recommends one every two seconds, and every segment must start with one), or the player can't switch cleanly at a segment boundary.

**Per-title encoding** replaces the fixed table with one computed for each video. Netflix's December 2015 change is the reference case: under its fixed ladder, *BoJack Horseman*'s flat animation got 1,750 kbps for 480p, while the per-title ladder delivered 1080p at 1,540 kbps; live-action *Orange Is the New Black* got its top 1080p rung at 4,640 kbps instead of 5,800, about 20% less. The method generalizes as the **convex hull**: encode the video at many (resolution, quality) points, score each against the source with a perceptual metric, plot quality against bitrate, and keep only the points on the upper-left boundary, where no other encode gives better quality for fewer bits. Meta's Reels pipeline describes the search concretely: for a 1080p video, seven resolutions times five CRF values is 35 trial encodes, each upscaled back to the original resolution and scored on its own 0 to 100 quality metric, with rungs then picked off the hull by target quality or bitrate.

The general mechanics underneath (inter-frame prediction, constant quality against target bitrate, perceptual metrics such as VMAF) are in [Media Compression](/docs/architecture/media-compression#rate-control-for-video).

The search is expensive, which is why the platforms ration it:

- **Gate it on expected watch time.** Meta stores only quality and bitrate measurements from its cheap upload-time encode, and runs the convex-hull optimization and advanced codecs only when projected watch time crosses a threshold. A video nobody watches never pays for its optimal ladder.
- **Sell it as a tier.** Mux's Basic level has a reduced ladder and no encoding charge; Plus adds "AI-powered per-title encoding"; Premium extends the ladder for sports and studio content at a higher per-minute price for encoding, storage and delivery.
- **Rent the analysis.** MediaConvert's automated ABR chooses the number of renditions (3 to 15, default maximum 15), their resolutions and their bitrates between a floor and a ceiling (defaults 600 kbps and 8 Mbps), "eliminating renditions that increase bitrate without providing increased video quality," with every rung encoded in QVBR, its quality-defined variable bitrate mode.

My rule: the ladder is versioned data, not code. Which rungs, which codecs, which bitrate ceilings and which watch-time thresholds apply to which kind of upload is a rule set with effective dates ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), and every variant records the ladder version that produced it, so a change to the ladder can be rolled across the catalog deliberately and an old video's renditions can still be explained.

## The Codec Portfolio

No single codec plays everywhere at the best efficiency, so platforms keep a portfolio and serve each device the best codec it can decode:

| Codec | Why it's in the portfolio | What holds it back |
| --- | --- | --- |
| **H.264 (AVC)** | Decodes on essentially every device; the universal fallback and the format of upload-time encodes | The least efficient of the four |
| **VP9** | Google's codec, the one YouTube's VCU accelerates alongside H.264 | Absent from Apple's HLS authoring specification, which lists H.264, HEVC and AV1 |
| **HEVC (H.265)** | Apple's HDR and high-efficiency path, with its own ladder in Apple's specification | Allowed only in fragmented MP4 in HLS; not covered by a royalty-free policy like AV1's |
| **AV1** | About 30% more efficient than VP9 and HEVC by Meta's measurement; published in 2018 by AOMedia under a royalty-free patent policy | Encoding is expensive and decoding is heavy on older phones |

Meta's AV1 rollout for Reels shows what a portfolio costs to run. On one example video the best-quality AV1 encode had a bitrate 65% lower than AVC and 48% lower than VP9; across Facebook Reels on iPhone, average bitrate fell 12% and AV1 reached about 70% of watch time in its first week. The device rules are the hard part: the dav1d software decoder plays 720p30 in real time on most sampled Android phones and 1080p30 only on some mid-range and high-end models, so AV1 went to select Android devices, and Meta was testing mixed-codec manifests in which a low-end phone plays AV1 up to 540p and switches to VP9 above it. Apple adds its own constraints: HEVC and AV1 only in fragmented MP4, HDR only as HDR10, HLG or Dolby Vision, and an SDR rendition always alongside HDR.

The portfolio multiplies everything else. Each codec is a second ladder, more storage and more cache footprint at the CDN, which is why new codecs are gated on watch time exactly like per-title ladders: H.264 for every video, better codecs for the videos whose views pay back the encode. A device-capability table (codec, profile, maximum resolution and frame rate per device class) belongs in data next to the ladder, and the manifest generator reads both.

**Repackage before you re-encode.** Instagram found that more than 80% of its video compute went to "minimum functionality" encodings: the basic renditions every video needs. It replaced re-encoding with repackaging the frames of its existing progressive encodes into an adaptive-streaming structure, trading some compression efficiency for a 94% cut in the cost of those encodings (0.36 seconds of CPU against 86.17 seconds to transcode a 23-second clip to 720p). The freed capacity raised advanced-encoding watch-time coverage by 33%, from a base of 15% of total watch time. The general rule: when a format change can be done by rewriting containers and manifests, never pay to encode again.

## Packaging: HLS, DASH and CMAF

Encoded renditions still have to be cut into segments and described in a manifest a player can read. Two adaptive streaming formats cover the market:

- **HLS** (HTTP Live Streaming), Apple's protocol, published as RFC 8216 in August 2017 (Informational, describing protocol version 7). A **multivariant playlist** (the RFC's master playlist) lists the variant streams with `EXT-X-STREAM-INF` and their required peak `BANDWIDTH`, plus codecs and resolution; each **media playlist** lists one rendition's segments in order under an `EXT-X-TARGETDURATION` ceiling. `EXT-X-MEDIA` declares alternate audio, subtitle and caption renditions, and `EXT-X-I-FRAME-STREAM-INF` points to I-frame-only playlists for scrubbing and fast-forward, which Apple's authoring specification requires. Segments can be MPEG-2 transport streams, fragmented MP4, packed audio or WebVTT. Apple targets six-second segments.
- **MPEG-DASH**, ratified by ISO in April 2012 as an open standard not owned by any one company, with an XML manifest (the MPD), templated segment URLs, multiple synchronized tracks, common encryption and multiple base URLs for multi-CDN delivery. The DASH Industry Forum publishes implementation guidelines, conformance software and the dash.js reference player.

For years serving both meant storing two sets of segments, transport streams for HLS and fragmented MP4 for DASH, which doubled storage and halved CDN cache efficiency. **CMAF** (the Common Media Application Format, ISO/IEC 23000-19) removes the duplication: one set of fragmented MP4 segments, referenced by both an HLS playlist and a DASH manifest, so an Apple device and an Android device request the same object under the same cache key. Encryption was the last obstacle (below), and Fraunhofer FOKUS's survey of device support concluded in 2021 that "CMAF + 'cbcs' + HLS/DASH manifests is the way."

![Two lanes compare packaging. Two formats, a set of segments each: renditions with aligned keyframes fan out to transport-stream segments, read by HLS playlists (multivariant and media), and fragmented MP4 segments, read by a DASH manifest (the MPD); a note says storage doubled and cache hits halved. CMAF, one set and two manifests: the same renditions become one accented segment set in fragmented MP4, which fans out to both the HLS playlists and the DASH manifest; a note says one object and one cache key.](/diagrams/ugp-video-on-demand-cmaf.svg "CMAF stores each segment once, so an Apple device and an Android device ask the CDN for the same object.")

Packaging choices that a UGC platform makes once and lives with:

- **Package at the edge or at rest.** Storing segments and manifests per format is simple and costs storage; packaging just in time from one stored copy of each rendition costs compute per cache miss and makes adding a format cheap. Vendors such as Mux do the latter for you.
- **Byte ranges instead of files.** HLS's `EXT-X-BYTERANGE` addresses a segment as a range of a larger file, so a rendition can be one object instead of thousands, which helps object-storage request costs and makes clipping a manifest operation ([Clips and Highlights](/books/user-generated-platforms/live-latency-and-vods#clips-and-highlights)).
- **Bitrates in the manifest must be true.** Apple requires measured VOD average and peak bitrates within 10% of the declared `AVERAGE-BANDWIDTH` and `BANDWIDTH`; a player that trusts an understated peak picks a rung it can't sustain and stalls.
- **Manifests are per viewer when access is.** A signed or DRM-protected video's manifest carries tokens or key URIs per session, so it can't be cached like a public one, while the segments still can.

## Thumbnails, Captions and Audio Tracks

A video page shows more than the video. Each of these is a derived artifact of the asset with its own job, storage and lifecycle:

- **Poster frames and thumbnails.** A default frame (Mux takes the asset's configured thumbnail time or the middle of the video), creator-uploaded custom thumbnails, and animated previews (Mux caps animated GIF previews at 10 seconds and 640 pixels). A custom thumbnail is user content: it is scanned and moderated like any image, because a clean video with an abusive thumbnail is the classic bait ([Scanning Before Publish](/books/user-generated-platforms/upload-path#scanning-before-publish)).
- **Storyboards.** A sprite sheet of frames at regular intervals, with a WebVTT or JSON index of tile positions and times, drives the preview on timeline hover; Mux generates 50 tiles for assets under 15 minutes and 100 above. HLS's I-frame playlists serve the same purpose for native players.
- **Captions and subtitles.** Apple's specification says captions should be provided, and accepts CEA-608, CEA-708, WebVTT and IMSC1; subtitle renditions must be WebVTT or IMSC1 and span the whole content. On UGC platforms most captions are automatic: YouTube generates them by speech recognition, warns that quality varies with accents, noise and overlapping speakers, publishes them automatically when ready (often not at upload time), lets creators edit or remove them, and masks potentially inappropriate words by default. Mux includes auto-generated captions for on-demand video in its pricing. Captions are an accessibility duty as much as a feature ([Accessibility](/docs/frontend/accessibility#images-and-media)), and an automatic track should never overwrite one the creator uploaded.
- **Audio tracks.** Multi-language audio lets one video carry dubbed tracks: YouTube offers it to creators with access to advanced features, defaults each viewer to their preferred language, and requires a creator to delete an automatic dub before uploading their own track for that language. In HLS these are `EXT-X-MEDIA` audio renditions; Apple requires a stereo AAC track and an audio-description track flagged with the accessibility characteristic where one exists.

The pattern for all four: a track or derived image has a source (automatic, creator, vendor), a language where relevant, a state, and a link to the asset version it was made from. When a copyright claim mutes a span of audio or a creator trims the video, the captions, storyboard and audio tracks derived from the old version are stale and must be regenerated or re-timed; [Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id) owns the claim, and this pipeline owns rebuilding what it invalidates.

## DRM and Signed Playback

Most user video is public, and the protection that matters is controlling where and for how long a URL works. Paid or premium content (a creator's members-only videos, a licensed film, a pay-per-view replay) needs more. The levels, from cheapest to strongest:

| Level | What it stops | Mechanism |
| --- | --- | --- |
| **Public URLs** | Nothing beyond guessing | Unlisted IDs with enough entropy |
| **Allowed origins** | Embedding on other sites (hotlinking) | Referer or origin checks on manifests and segments ([Hotlinking, Embeds and Signed URLs](/books/user-generated-platforms/storage-and-delivery#hotlinking-embeds-and-signed-urls)) |
| **Signed playback tokens** | Sharing a URL beyond its audience, time window or country | A short-lived signed token in place of the video ID, verified on every manifest and segment request |
| **Clear-key encryption** | Casual downloading of segments | HLS `EXT-X-KEY` with AES-128 or SAMPLE-AES and a key URL behind authentication |
| **DRM** | Copying decrypted content on supported devices | Widevine, PlayReady and FairPlay license servers and device-side content decryption modules |

**Signed playback** is the workhorse. Cloudflare Stream's implementation shows the parts: turn on `requireSignedURLs` for the video, create a signing key once (up to 1,000; revoking one invalidates every token it signed), and mint an RS256 JWT per viewer whose subject is the video ID, with an expiry no more than 24 hours out, an optional not-before time, a flag that allows downloads, and up to five ordered access rules that allow or block by country or IP range, evaluated continuously during playback. Mux requires signed URLs for any DRM-protected asset and adds domain and User-Agent restrictions; its thumbnails, GIFs and storyboards must be signed when the playback ID is. My default: sign every non-public video's manifest and segments, mint tokens server-side per viewer session after the entitlement check, keep them short, and never put entitlement logic in the player.

**DRM** adds encryption with keys released only to a trusted decryption module on the device. Three systems cover the market: Google's **Widevine** (built on Common Encryption, ISO/IEC 23001-7, with a hardware root of trust provisioned at the factory), Microsoft's **PlayReady**, and Apple's **FairPlay Streaming** for HLS on Apple platforms, for which Apple approves production credentials only for teams that provide a streaming service to consumers. The encryption scheme decides whether one set of files serves all three. Common Encryption defines four schemes, of which two are used: `cenc` (AES-CTR) and `cbcs` (AES-CBC with a subsample pattern). FairPlay originally supported only `cbcs` and Widevine and PlayReady only `cenc`, which forced two encrypted copies; Widevine and PlayReady clients have since added `cbcs`, slowly on embedded devices, which is what makes a single CMAF set with `cbcs` workable. Packagers such as Shaka Packager write all four schemes and the protection-system headers for several DRMs from one key source.

DRM is a cost and a constraint, not a checkbox. Mux charges $100 a month plus $0.003 per license, roughly one per view, as of October 2026; protects only video tracks (audio stays clear); enforces HDCP output protection on iPhone and iPad but not on Android or desktop Chrome and Edge; issues 24-hour streaming licenses by default; and needs the customer's own FairPlay certificate from Apple. Offline playback needs persistent licenses with an expiry and a play window. Thumbnails, previews and captions usually stay unencrypted, so a "protected" video still leaks its frames through its storyboard unless those are signed too. For user-generated video I reach for DRM only when a contract requires it (licensed content, studio partners) or when paid content is the product; signed playback covers everything else.

Geography is the last access rule. A video withheld in one country by a court order, a regulator or a rights holder's territory list is blocked at the request, by the viewer's location, not by deleting the asset; the restriction rows and country-level withdrawal belong to [Withdrawing From a Country](/books/user-generated-platforms/storage-and-delivery#withdrawing-from-a-country), and the playback token carries the result.

## Downloads and Archive Export

Two kinds of download leave the streaming pipeline:

- **Viewer downloads.** An MP4 a viewer can keep, or an offline download inside the app under a persistent DRM license. Twitch's post-processing system generates MP4 downloads on request; Cloudflare Stream exposes downloads only when the video allows them and the viewer's token carries the download flag, bills them by the share of the file delivered, and doesn't count the generated files as storage. Mux prices MP4 downloads by quality level as an add-on.
- **Creator export.** Creators can get their own uploads back. YouTube lets a creator download an MP4 of an uploaded video at 720p or 360p from Studio, or every upload through Google Takeout, and refuses the download when the video was removed, carries a copyright or Community Guidelines strike, uses a preapproved audio track, or has already been downloaded five times in 24 hours.

The YouTube rules generalize. **The export is not the original:** a platform that discarded the source after encoding (or never kept it past the highest rendition) can only return a rendition, and should say so; my default is to keep the original for as long as the video is live, because it's also what a new codec or ladder re-encodes from ([Hot, Warm and Cold Storage](/books/user-generated-platforms/storage-and-delivery#hot-warm-and-cold-storage)). **Moderation outranks portability:** removed or struck content isn't served for download even to its author, while the data-access and portability rights in [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#exports-and-portability) decide what the platform still owes the person. **Downloads are rate-limited and logged** like any bulk egress, because they are also the scraper's and the leaker's tool.

## Cost per Viewer-Hour

The unit that ties the pipeline to the business is cost per viewer-hour: what it costs to encode, store and deliver an hour of watched video, the measure the [cost and FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total) doc asks every platform to track per unit. Its components scale with different things:

- **Encoding** scales with uploads, renditions and codecs: per output minute on MediaConvert (every rendition billed), free on Cloudflare Stream and on Mux's Basic level, a capital and power cost on owned hardware.
- **Storage** scales with the catalog: Mux lists $0.003 per minute per month for 1080p basic (about $0.18 per hour of video per month) and Cloudflare Stream $5 per 1,000 minutes ($0.30 per hour per month), as of October 2026, each by duration rather than bytes. On raw object storage it's bytes: every rung of every codec, plus the original.
- **Delivery** scales with watch time and bitrate, and is usually the largest line at scale. A per-minute meter makes the arithmetic flat: Cloudflare Stream's $1 per 1,000 minutes delivered is $0.06 per viewer-hour at any resolution, counted from segment requests, including preloading, with browser-cache hits free; Mux's $0.001 per minute after 100,000 free minutes a month is the same $0.06. A byte meter makes it depend on the rung: a viewer held at a 4,500 kbps 1080p rung pulls about 2 GB an hour (4.5 Mbps times 3,600 seconds), so the ladder's top bitrate and the codec's efficiency multiply straight into CDN spend. Amazon IVS's live pricing, by resolution, shows the same shape for live: $0.036 per SD, $0.072 per HD and $0.144 per Full HD viewer-hour in its first North American tier, falling to $0.096 for Full HD above 500,000 hours a month, billed where the viewer connects.
- **Rights and protection** scale with views: DRM licenses at about one per view, and music or content licensing where it applies ([Creator Monetization](/books/user-generated-platforms/creator-monetization#music-costs-shared-with-creators) and [Copyright at Scale](/books/user-generated-platforms/copyright#music-in-streams)).

Three consequences for design. **Per-viewer-hour cost falls with the codec and the ladder,** which is why the platforms pay for AV1 and per-title encoding exactly on the videos with the most watch time, and nowhere else. **The long tail is a storage problem, the head is a delivery problem:** most uploads cost storage for years and almost no delivery, while a few cost little storage and enormous delivery, so tiering and retention ([Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#cdn-egress-and-the-delivery-bill)) and encoding gates attack different ends of the same catalog. **Measure it from your own usage, not the invoice:** viewer-seconds by rendition, codec, country and day, joined to the vendor's meter, give a cost per video, per creator and per country that the invoice total can't, and they are the input to the cost-per-viewer-hour figure in [Operating Metrics](/books/user-generated-platforms/operating-metrics#unit-costs).

QoE belongs in the same data. Players report each playback attempt: whether it started, how long startup took, how often and how long it rebuffered, which rungs it played and how much it upscaled; Mux Data groups these as Playback Success, Startup Time, Smoothness, Video Quality and an Overall Viewer Experience score. Rebuffering at a rung or on a codec is the signal that a ladder or a device rule is wrong, and it's measured per rendition, not per video.

## How to Build It

The chapter's additions to the core model and to `media_variants` from [Images at Scale](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand), which already carries purpose, format, dimensions, size and storage key for every derived file:

```sql
CREATE TABLE encoding_ladders (          -- versioned rules: which rungs, codecs and gates
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  name            TEXT NOT NULL,         -- 'ugc_baseline', 'ugc_advanced', 'premium'
  version         INT NOT NULL,
  codec           TEXT NOT NULL CHECK (codec IN ('h264', 'vp9', 'hevc', 'av1')),
  method          TEXT NOT NULL CHECK (method IN ('fixed', 'per_title', 'repackage')),
  rungs           JSONB,                 -- fixed: [{height, bitrate_kbps, max_fps}, ...]
  constraints     JSONB NOT NULL,        -- per-title: min/max kbps, max rungs, max height
  watch_time_gate_hours INT,             -- encode only once projected watch time exceeds
  effective_from  TIMESTAMPTZ NOT NULL,
  retired_at      TIMESTAMPTZ,
  UNIQUE (name, version)
);

ALTER TABLE media_variants              -- a video rendition is a variant with codec facts
  ADD COLUMN encoding_ladder_id UUID REFERENCES encoding_ladders (id),
  ADD COLUMN codec              TEXT CHECK (codec IN ('h264', 'vp9', 'hevc', 'av1')),
  ADD COLUMN codec_string       TEXT,    -- RFC 6381, as written to the manifest
  ADD COLUMN bitrate_kbps       INT,     -- measured average
  ADD COLUMN peak_bitrate_kbps  INT,     -- measured peak; the manifest's BANDWIDTH
  ADD COLUMN frame_rate         NUMERIC(6, 3),
  ADD COLUMN dynamic_range      TEXT CHECK (dynamic_range IN ('sdr', 'hdr10', 'hlg',
                                  'dolby_vision')),
  ADD COLUMN packaging          TEXT CHECK (packaging IN ('progressive_mp4', 'cmaf',
                                  'mpeg_ts', 'webm')),
  ADD COLUMN encryption         TEXT NOT NULL DEFAULT 'none' CHECK (encryption IN ('none',
                                  'aes_128', 'sample_aes', 'cenc', 'cbcs')),
  ADD COLUMN quality_score      NUMERIC(5, 2);  -- perceptual score against the source

CREATE TABLE transcode_jobs (            -- every encode, repackage and derived artifact
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id     UUID NOT NULL REFERENCES media_assets (id),
  kind               TEXT NOT NULL CHECK (kind IN ('baseline', 'advanced', 'repackage',
                       'just_in_time', 'thumbnails', 'storyboard', 'captions',
                       'audio_track', 'download')),
  encoding_ladder_id UUID REFERENCES encoding_ladders (id),
  trigger            TEXT NOT NULL CHECK (trigger IN ('upload', 'watch_time_gate',
                       'first_request', 'ladder_change', 'creator_edit', 'copyright_edit',
                       'creator_request', 'retry')),
  state              TEXT NOT NULL CHECK (state IN ('queued', 'running', 'succeeded',
                       'failed', 'cancelled')),
  priority           SMALLINT NOT NULL DEFAULT 5,  -- first playable outranks backfill
  executor           TEXT NOT NULL,      -- 'cpu_pool', 'gpu_pool', 'asic_pool', 'vendor:<name>'
  vendor_job_ref     TEXT,
  attempts           INT NOT NULL DEFAULT 0,
  error              TEXT,
  output_minutes     NUMERIC(12, 2),     -- what a vendor bills: renditions x duration
  queued_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at         TIMESTAMPTZ,
  finished_at        TIMESTAMPTZ
);

CREATE TABLE media_tracks (              -- captions, subtitles and audio beside the video
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id UUID NOT NULL REFERENCES media_assets (id),
  kind           TEXT NOT NULL CHECK (kind IN ('captions', 'subtitles', 'audio',
                   'audio_description')),
  language       TEXT NOT NULL,          -- BCP 47
  label          TEXT,
  source         TEXT NOT NULL CHECK (source IN ('creator', 'automatic', 'vendor',
                   'automatic_dub')),
  state          TEXT NOT NULL CHECK (state IN ('processing', 'ready', 'stale',
                   'removed')),
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  storage_key    TEXT,
  made_from_job_id UUID REFERENCES transcode_jobs (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (media_asset_id, kind, language, source)
);

CREATE TABLE playback_policies (         -- who may play it, how, for how long
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id        UUID NOT NULL REFERENCES media_assets (id),
  access                TEXT NOT NULL CHECK (access IN ('public', 'signed', 'drm')),
  drm_systems           TEXT[] NOT NULL DEFAULT '{}',  -- 'widevine', 'playready', 'fairplay'
  token_ttl_seconds     INT CHECK (token_ttl_seconds <= 86400),
  allowed_origins       TEXT[],          -- embed domains; null: any
  downloads_allowed     BOOLEAN NOT NULL DEFAULT FALSE,
  offline_license_seconds INT,           -- persistent licenses; null: streaming only
  valid_during          TSTZRANGE NOT NULL,
  reason                TEXT,            -- 'paid_content', 'licensed', 'unlisted', ...
  EXCLUDE USING GIST (media_asset_id WITH =, valid_during WITH &&),
  CHECK ((access = 'drm') = (cardinality(drm_systems) > 0))
);

CREATE TABLE playback_usage (            -- rolled up from player and CDN logs, per day
  usage_date      DATE NOT NULL,
  media_asset_id  UUID NOT NULL REFERENCES media_assets (id),
  variant_id      UUID NOT NULL REFERENCES media_variants (id),
  country         CHAR(2) NOT NULL,      -- the viewer's, as vendors bill by it
  channel         TEXT NOT NULL CHECK (channel IN ('stream', 'embed', 'download',
                    'offline')),
  viewer_seconds  BIGINT NOT NULL DEFAULT 0,
  bytes_delivered BIGINT NOT NULL DEFAULT 0,
  playbacks       INT NOT NULL DEFAULT 0,
  rebuffer_seconds BIGINT NOT NULL DEFAULT 0,
  drm_licenses    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (usage_date, media_asset_id, variant_id, country, channel)
);
```

Notes on the sketch:

- **A rendition is a variant.** `media_variants` is the one table for every derived file, images and video alike; video rows use the purposes [Images at Scale](/books/user-generated-platforms/images-at-scale#how-to-build-it) defines for renditions, posters, storyboards and downloads, and add codec, bitrates, frame rate, dynamic range, packaging and encryption here. The manifest is generated from these rows and the device-capability rules, never hand-maintained.
- **Ladders are versioned rules.** A variant points at the ladder version that made it, and a new version never edits an old one. Rolling a new codec or ladder across the catalog is a set of `transcode_jobs` with trigger `ladder_change`, ordered by watch time and run in the farm's troughs.
- **Gates live in the ladder.** `watch_time_gate_hours` on an advanced ladder is the threshold the scheduler compares with projected watch time from `playback_usage`; a baseline ladder has none. Changing the gate is a new version, so the cost effect of a threshold change is traceable.
- **Ready means first playable.** The asset's `state` becomes `ready` when the baseline job's variants and manifest exist; advanced jobs, captions and tracks arrive later and never move it back. A failed advanced job leaves the video playing on its baseline.
- **Tracks go stale, they aren't edited.** A creator trim or a copyright edit marks derived tracks, storyboards and thumbnails `stale` and queues jobs with trigger `creator_edit` or `copyright_edit`; [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it) records the claim, this pipeline records the rebuild.
- **One policy at a time.** The exclusion constraint keeps one playback policy in force per asset; changing a video from members-only to public closes one range and opens another, so a token dispute can be answered for any moment. Country blocks live in `delivery_restrictions` from [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#how-to-build-it) and are applied when tokens are minted.
- **Usage is a rollup, not a log.** Player beacons and CDN logs land in the analytics pipeline; `playback_usage` is the daily rollup the cost model, the creator's analytics, the watch-time gate and the DRM license reconciliation read. Per-session QoE detail stays in the analytics store.
- **Events:** `media.transcode_queued`, `media.ready`, `media.rendition_added`, `media.upgraded` (an advanced ladder finished), `media.track_ready`, `media.track_stale` and `playback.policy_changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to feeds (which may wait for a minimum rendition before ranking a video), notifications ("your video is ready"), search and analytics. A creator-facing status API over `transcode_jobs` follows the [long-running operation](/docs/requests/long-running-operations#the-operation-resource) pattern.

## Auditing

- **Which ladder and codec produced every rendition,** with the job, executor and quality score, so a quality complaint, a device bug or a vendor dispute resolves to a version and a job.
- **Every job and its billed output,** reconciled monthly against the vendor's invoice, rendition by rendition.
- **Every playback policy in force over time,** with its reason, so the platform can show who could watch a paid or restricted video at any moment, and when a DRM or token requirement started.
- **Every track's source.** Which captions and audio were automatic, which the creator supplied and which a vendor produced, because an automatic caption or dub that misstates what someone said is a complaint about the platform's words, not the creator's ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Every download by an author or viewer,** with the token or session behind it, for leak and scraping investigations.
- **Delivery and license counts by country,** as the basis for the cost model, rights reporting and any territory restriction a rights holder or regulator asks about.

## What This Means for the System You Build

- **Make the first playable rendition fast and cheap,** and let higher rungs, better codecs and captions arrive after the video is live.
- **Gate expensive encodes on watch time,** so per-title ladders and AV1 are spent on the videos whose views pay for them.
- **Repackage before you re-encode;** a container or manifest change should never cost an encode.
- **Keep ladders, codecs, gates and device rules as versioned data,** and record the version on every rendition.
- **Align keyframes and segment boundaries across every rendition,** and publish measured, honest bitrates in the manifest.
- **Prefer CMAF with `cbcs`** so one set of segments serves HLS, DASH and every DRM, and one cache key serves every device.
- **Sign every non-public playback,** mint short tokens after the entitlement check, and sign the thumbnails and storyboards too.
- **Use DRM only where a contract or paid content requires it,** and price it per view before you turn it on.
- **Keep the original** while the video is live; it is what every future codec, ladder and export comes from.
- **Treat captions, audio tracks and thumbnails as derived artifacts** with a source and a state, rebuilt when the video changes.
- **Measure viewer-seconds by rendition, codec and country,** and compute cost per viewer-hour from your own usage, not the invoice.

## References

**Standards and specifications**

- [IETF: RFC 8216, HTTP Live Streaming](https://www.rfc-editor.org/rfc/rfc8216), August 2017 and Informational status, multivariant and media playlists, `EXT-X-TARGETDURATION`, `EXT-X-BYTERANGE`, `EXT-X-KEY` methods, `EXT-X-MEDIA`, I-frame playlists, segment formats
- [Apple: HLS authoring specification for Apple devices](https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices), the H.264 and HEVC ladders, default variant, two-second keyframes, six-second segments, fMP4 for HEVC and AV1, HDR rules, bitrate accuracy, I-frame playlists, captions, subtitles and audio requirements
- [DASH Industry Forum: About](https://dashif.org/about/), MPEG-DASH ratified April 2012, multiple tracks, common encryption, multiple base URLs, implementation guidelines and dash.js
- [Fraunhofer FOKUS: Is this the end of 'cenc'?](https://websites.fraunhofer.de/video-dev/?p=936), the four Common Encryption schemes, `cenc` and `cbcs` support by DRM, CMAF with `cbcs` (March 2021)
- [AOMedia: Our story](https://aomedia.org/about/story/), AV1 published in 2018 under a royalty-free patent policy
- [Apple: FairPlay Streaming](https://developer.apple.com/streaming/fps/), FairPlay for HLS, the Server SDK and production approval rules
- [Google: Widevine DRM](https://www.widevine.com/solutions/widevine-drm), Common Encryption (ISO/IEC 23001-7), MP4 and WebM, factory-provisioned keyboxes

**Platform engineering**

- [Google: Warehouse-scale Video Acceleration, extended abstract (ASPLOS 2021)](https://www.asplos-conference.org/asplos2022/2021/abstracts/asplos21-paper388-extended_abstract.pdf), the VCU, 8x to 20x two-pass throughput for H.264 and VP9, order-of-magnitude performance per cost, inline scaling, bin-packing scheduler
- [Meta: Bringing AV1 to Facebook and Instagram Reels](https://engineering.fb.com/2023/02/21/video-engineering/av1-codec-facebook-instagram-reels/), AV1's 30% gain, staged pipeline with a watch-time threshold, 35 candidate encodes and the convex hull, bitrate and watch-time results, device decode limits, mixed-codec manifests
- [Meta: Reducing Instagram's basic video compute time by 94 percent](https://engineering.fb.com/2022/11/04/video-engineering/instagram-video-processing-encoding-reduction/), over 80% of compute on minimum functionality encodings, repackaging, the 0.36 s versus 86.17 s example, 33% more advanced coverage from a 15% base
- [Netflix Technology Blog: Per-Title Encode Optimization](https://netflixtechblog.com/per-title-encode-optimization-7e99442b62a2), December 14, 2015, the fixed ladder from 235 kbps at 320x240 to 5,800 kbps at 1080p, and the *BoJack Horseman* and *Orange Is the New Black* per-title figures
- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), VOD segments, thumbnails and playlists in S3, the metadata and post-processing system, MP4 downloads, the prototype ASIC at over 10x scale
- [Mux: The fastest video publishing in the multiverse](https://www.mux.com/blog/the-fastest-video-publishing-in-the-multiverse), just-in-time encoding, chunking, and conventional encoding at 25% to 100% of duration with a 30-second minimum (2018)

**Vendor documentation**

- [Mux: Use video quality levels](https://www.mux.com/docs/guides/use-video-quality-levels), Basic, Plus and Premium ladders, per-title encoding, encoding charges, just-in-time encoding
- [Mux: Protect videos with DRM](https://www.mux.com/docs/guides/protect-videos-with-drm), supported DRMs, FairPlay certificates, `cbcs`, pricing, signed URLs, video-only protection, HDCP, license durations, offline licenses
- [Mux: Pricing](https://www.mux.com/pricing), on-demand storage and delivery per minute, free delivery minutes, free auto-generated captions
- [Mux: Get images from a video](https://www.mux.com/docs/guides/get-images-from-a-video), default thumbnail time, animated GIF limits, signed image requests
- [Mux: Create timeline hover previews](https://www.mux.com/docs/guides/create-timeline-hover-previews), storyboards, WebVTT and JSON indexes, tile counts
- [Mux: Understand metric definitions](https://www.mux.com/docs/guides/data/understand-metric-definitions), Playback Success, Startup Time, Smoothness, Video Quality and Overall Viewer Experience
- [AWS: MediaConvert automated ABR](https://docs.aws.amazon.com/mediaconvert/latest/ug/auto-abr.html), 3 to 15 renditions, default bitrate floor and ceiling, frame rate halving, QVBR and multi-pass, billing per rendition minute
- [AWS: MediaConvert QVBR rate control](https://docs.aws.amazon.com/mediaconvert/latest/ug/cbr-vbr-qvbr.html), quality-defined variable bitrate
- [Cloudflare Stream: Pricing](https://developers.cloudflare.com/stream/pricing/), minutes stored and delivered, free encoding and ingress, segment-based counting, download billing
- [Cloudflare Stream: Secure your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), `requireSignedURLs`, signing keys, token claims and 24-hour limit, access rules by country and IP, allowed origins
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), output per viewer-hour by resolution and tier, billing by viewer location
- [Shaka Packager: Documentation](https://shaka-project.github.io/shaka-packager/html/documentation.html), protection schemes, key sources and multiple protection systems

**Platform documentation**

- [YouTube: Use automatic captioning](https://support.google.com/youtube/answer/6373554?hl=en), speech recognition, accuracy caveats, timing, editing and masked words
- [YouTube: Multi-language audio](https://support.google.com/youtube/answer/13338784?hl=en), who can add tracks, viewer defaults, creator dubs versus automatic dubs
- [YouTube: Download your own videos](https://support.google.com/youtube/answer/56100?hl=en), 720p or 360p MP4, Google Takeout, and the removal, strike, audio and five-per-24-hours restrictions
