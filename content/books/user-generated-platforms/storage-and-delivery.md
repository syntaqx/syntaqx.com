+++
title = "Storage, Dedup & Delivery Economics"
nav_title = "Storage, Dedup & Delivery"
description = "Exact and perceptual dedup, hot, warm and cold tiers, CDN and egress costs, hotlinking, takedown purges, orphans and link rot, storage caps and geo-withdrawal."
category = "User-Generated Platforms Industry"
order = 1815
part = "Media"
tags = ["user-generated-content", "storage", "cdn", "deduplication", "data-retention"]
+++

A media platform's storage bill only goes up. Users upload every day, almost nobody deletes, and every file the platform accepted is a promise to keep it and serve it to anyone with the link, for years, from anywhere. The reads don't follow the writes: a new upload is requested heavily for a few days and then barely at all, except for the old post that goes viral again or the image embedded on a forum thread that still gets traffic a decade later. Revenue follows neither. An ad-supported host earns on pages viewed on its own site, while a hotlinked image on someone else's page costs egress and earns nothing. Storage and delivery are where a user-generated platform's unit economics are won or lost, and where policy (what to keep, for whom, in which country) shows up as a line on the cloud invoice.

This chapter covers what happens to a file after it's accepted and processed: exact and perceptual deduplication; hot, warm and cold storage tiers; CDN delivery and egress pricing; hotlinking, embeds and signed URLs; purging caches when content is taken down; orphaned files, retention purges and the link rot they cause; why platforms cap free storage; and withdrawing a service from a country. It extends `media_assets` and the `media_variants` table from [Images at Scale](/books/user-generated-platforms/images-at-scale#how-to-build-it) in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Getting the bytes in is [The Upload Path](/books/user-generated-platforms/upload-path); video storage and delivery meters are [Video on Demand](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour); matching against child-safety, terrorist and intimate-image hash lists belongs to Child Safety: Detection & Reporting, Terrorism, Violent Extremism & Graphic Content and Intimate Image Abuse; the story of a platform-wide purge and of ending a service is Migrations, Purges & Shutdowns.

## How the Platforms Do It

| Platform or vendor | What's public | What it shows |
| --- | --- | --- |
| **Meta (Haystack, 2010)** | Over 260 billion images and 20 PB; four sizes stored per upload; one billion new photos (60 TB) a week; over one million images a second at peak; a CDN serves the hottest photos and the long tail misses it | Storage systems are built for the long tail, not the popular files |
| **Meta (f4, 2014)** | Warm storage for BLOBs whose request rate has cooled, chosen by age (one month for most types, three months for photos); Reed-Solomon (10,4) inside a datacenter and XOR across datacenters cut the effective replication factor from 3.6 to 2.8 or 2.1 over 65 PB; per-BLOB encryption keys, deleted to delete | Temperature tiers by age, erasure coding for warm data, deletion by key destruction |
| **Flickr (SmugMug)** | Free accounts capped at 1,000 photos and videos from January 8, 2019 (down from 1 TB); uploads blocked over the cap; deletion oldest first from February 5, 2019; Creative Commons photos exempt | A storage cap as a business model change, with notice, an export path and exemptions |
| **Imgur** | April 2023 terms to remove "old, unused, and inactive content that is not tied to a user account," effective May 15, 2023; UK access blocked from September 30, 2025, with embeds on other sites showing "Content not viewable in your region" | Anonymous uploads are the first purge candidates; a geo-block reaches every embed |
| **Twitch** | 100-hour cap on highlights and uploads in 2025, least-viewed deleted first, clips and past broadcasts exempt, storage called "costly"; Korean network fees "10 times more expensive than in most other countries," mitigated with peer-to-peer delivery and a 720p source cap before exiting Korea on February 27, 2024 | Caps aimed at content that doesn't earn; delivery cost decides product quality by country |
| **Pinterest** | Its 2025 10-K names dependence on AWS for "the vast majority" of compute, storage and data transfer, and a $312.3 million AWS commitment | A media platform's infrastructure bill is a disclosed business risk |
| **Cloudflare R2, Images, Stream** | R2 storage $0.015 per GB-month, infrequent access $0.01 plus $0.01 per GB retrieved, no egress fee; Images $1 per 100,000 delivered; Stream $5 per 1,000 minutes stored and $1 per 1,000 delivered (as of October 2026) | Vendors meter different things, and the meter decides which behavior costs money |
| **Amazon S3** | Storage classes from Standard to Glacier Deep Archive, with minimum storage durations of 30, 90 and 180 days on the colder classes; Intelligent-Tiering moves objects after 30 and 90 days without access | Cold tiers trade retrieval time and minimum charges for price |

Four patterns run through the table. **Access decays with age, then occasionally comes back:** Meta measured week-old content at an order of magnitude fewer requests than content under a day old for eight of nine types, and designed tiers around it. **The long tail is the storage system's real customer,** because the CDN absorbs the popular files and everything else misses. **Free storage ends in a cap,** and the cap's order (oldest first, least viewed first), exemptions and notice period are product decisions with public consequences. **Delivery cost is geographic:** the same stream costs ten times more to deliver in one country, and a platform's response (lower quality, peer assist, exit) is visible to every user there.

## Exact and Perceptual Dedup

Users upload the same file many times: a meme reposted by thousands of accounts, a photo shared to three communities, a re-upload after a deletion. Two kinds of matching find them, and they do different jobs.

**Exact dedup** keys on a cryptographic hash of the bytes. The core model already carries `media_assets.sha256`; dedup adds a blob layer so that every asset with the same hash points at one stored object, and the object lives until the last asset referencing it is purged. That's content-addressed storage, and it saves storage only for byte-identical copies: a re-encoded, resized or re-saved copy has a different hash. Two choices matter:

- **Which bytes to hash.** The original as received is the evidence and the thing a hash list matches, so the blob keyed on it is the original. Variants are derived and regenerable; deduplicating them adds little and complicates purges.
- **Whether dedup crosses accounts.** Cross-account dedup saves the most, but if the client can tell that an upload completed instantly because the bytes already existed, it can learn that someone else uploaded that exact file. My rule: dedup on the server after the full upload arrives, never let the client skip sending bytes the server already has, and never let the response time or the response reveal a match.

**Perceptual hashing** finds near-duplicates: the same picture recompressed, resized, cropped slightly or with a caption bar. Meta open-sourced PDQ for photos and TMK+PDQF for video in August 2019, for finding identical and nearly identical content; PDQ's reference documentation suggests a distance of 31 or less as the starting point for a match, to be tuned on the platform's own data, and discarding hashes whose quality score is 49 or below because featureless images match everything. The core's `media_assets.perceptual_hash` holds the PDQ hash; video keeps its own.

What near-duplicate links are for, outside the hash lists:

| Use | What the platform does with a near match |
| --- | --- |
| Repost collapsing | Fold reposts in a feed or search result into one, credit the earliest upload (Feeds & Recommendations) |
| Takedown sweeps | When one copy is removed for a policy or legal reason, queue the near matches for review, not automatic removal |
| Re-upload detection | Flag a re-upload of something the platform already removed, as a signal to the reviewer |
| Storage | None: near matches are different bytes and are stored separately |

A near match is a lead, not a verdict. Two different photos of the same landmark can sit within the threshold, and a meme template matches every meme made from it. Matching against hash lists of known illegal content is a separate pipeline with its own lists, thresholds and legal duties, recorded through the scan gate in [The Upload Path](/books/user-generated-platforms/upload-path#scanning-before-publish) and owned by Child Safety: Detection & Reporting, Terrorism, Violent Extremism & Graphic Content, Intimate Image Abuse and Copyright at Scale.

## Hot, Warm and Cold Storage

Meta's f4 paper is the clearest public account of why a media platform tiers storage. Haystack, the hot system, replicated every photo three times on RAID-6 nodes, an effective replication factor of 3.6, so it could serve high read rates from any copy. As the corpus grew, most of it stopped being read: more than 89% of objects in each examined type were warm in the most recent three-month interval. f4 stores locked volumes of warm data with Reed-Solomon (10,4) coding laid out across racks and XOR coding across datacenters, cutting the factor to 2.8 or 2.1 while still tolerating disk, host, rack and datacenter failures. It picked warm content by age, because age predicted request rate and delete rate: most deletes hit young objects, so content that has cooled is also unlikely to be deleted soon. Profile photos never moved; photos moved after three months.

On a cloud, the same choice is a storage class:

| Tier | Example (as of October 2026) | Retrieval | Minimum duration | Fits |
| --- | --- | --- | --- | --- |
| **Hot** | S3 Standard; R2 Standard at $0.015 per GB-month | Milliseconds | None | New uploads, variants in active use, anything a page may request |
| **Warm** | S3 Standard-IA; R2 Infrequent Access at $0.01 per GB-month plus $0.01 per GB retrieved | Milliseconds | 30 days | Originals of older media, rarely viewed archives that must still load on request |
| **Cold** | S3 Glacier Instant Retrieval | Milliseconds | 90 days | Long-tail originals that almost never load |
| **Archive** | S3 Glacier Flexible Retrieval and Deep Archive | Minutes to hours | 90 and 180 days | Evidence and originals kept for legal reasons, never served to a viewer |

The rules I use:

- **Anything a viewer can request stays in a millisecond tier.** An old post that goes viral again, or an embed on a busy page, must load; a tier that answers in hours is for files no user-facing path reads.
- **Tier by measured access, not by guess.** Age is a good default (Meta's one month, Intelligent-Tiering's 30 and 90 days without access), but record a sampled last-access time from CDN logs so the job can move a blob back up when it heats.
- **Mind the minimum duration.** Moving a file into a 30-day or 90-day class and deleting it a week later still pays the minimum, which is why young, frequently deleted content stays hot. Anonymous uploads with a pending retention purge are the classic mistake.
- **Variants are cheaper to delete than to tier.** A variant can be regenerated from the original, so a variant nobody has requested in months is deleted and rebuilt on demand ([Images at Scale](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand)). The original can't be rebuilt, so it's the one that moves down the tiers.
- **Retrieval fees are part of the price.** Warm and cold classes charge per GB read; a tier that's cheap to hold and expensive to read is wrong for anything a takedown sweep, an export or a re-encode will read back in bulk.

Meta's other trick belongs here too: f4 encrypts every BLOB with its own key held in a database, and deleting the key deletes the BLOB without rewriting the coded volume. The same crypto-shredding pattern ([Encryption at Rest](/docs/security/encryption-at-rest#crypto-shredding)) is how a platform makes deletion of a file in immutable or erasure-coded storage real, and how it reaches copies in backups ([Data Retention & Deletion](/docs/architecture/data-retention#backups)).

## CDN, Egress and the Delivery Bill

Every view of a file is a delivery, and on most clouds delivery costs more than storage over a file's life. Haystack's paper describes the shape: the CDN serves the hottest photos (profile pictures, recent uploads), Meta's own cache shields storage from the rest, and only about 10% of photo requests reached Haystack from the CDNs, but those were the long tail, where caching everything would need unreasonably large caches.

Unit prices, as of October 2026, show how far the meters diverge:

- **Object storage egress.** Amazon S3 bills data transferred out to the internet after the first 100 GB a month across AWS; Cloudflare R2 charges no egress fee at all. CloudFront's flat-rate plans bundle transfer (50 TB on the $15 Pro, $200 Business and $1,000 Premium plans). Cloudflare's Bandwidth Alliance members discount or waive transfer fees for shared customers.
- **Per-delivery pricing.** Cloudflare Images charges $1 per 100,000 images delivered (only 200 responses over 1,024 bytes count) and $0.50 per 1,000 unique transformations beyond 5,000 a month; on its free plan, cached transformations keep serving after the limit and new ones fail with error 9422. Cloudflare Stream charges $1 per 1,000 minutes delivered, and cached playback isn't billed.
- **Geography.** Twitch found Korean network fees ten times most other countries' and capped source quality at 720p there before leaving. A per-country delivery cost is a product constraint: lower bitrates, fewer variants, peer assist, or no service.

My rule: compute the cost per thousand views of each surface, not the monthly total ([Cost & FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)). For an image surface it's roughly bytes served per view times the egress price, plus per-request and per-transformation fees, divided by how often the CDN hits. Three levers move it: **smaller bytes** (AVIF and WebP where the browser accepts them, the right variant size for the slot: [Format Negotiation](/books/user-generated-platforms/images-at-scale#format-negotiation)), **a higher hit rate** (stable variant URLs, long `Cache-Control` lifetimes on immutable keys, a cache key that includes the variant and the negotiated format, with `Vary: Accept` only where the URL doesn't carry the format: [Caching](/docs/requests/caching#vary)), and **the provider's meter** (free egress changes which behaviors are expensive, so hotlinking and embeds stop being a bandwidth problem and become a revenue one). Cost per viewer-hour for video, and the meters behind it, are in [Video on Demand](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour); the dashboard version is Operating Metrics.

## Hotlinking, Embeds and Signed URLs

A hotlink is another site's page loading your file directly from your URL. For an image host, embeds were often the product: Imgur was built in 2009 to host images for Reddit, and its files sit inside forum posts, wikis and tutorials across the web. For a platform that earns on its own pages, every view through someone else's page is delivery without an ad impression. Three policies, set per surface:

| Policy | How it works | Costs |
| --- | --- | --- |
| **Open** | Any site may embed the file URL | Egress without revenue; the platform's files carry other people's pages |
| **Referrer-limited** | The CDN denies image requests whose `Referer` doesn't name an allowed domain; Cloudflare's hotlink protection checks gif, ico, jpg, jpeg and png requests, allows a blank referrer so direct visits work, and exempts any `hotlink-ok` directory | Easy to bypass (strip the referrer) and it also hides images from image search and from Pinterest and Facebook previews |
| **Signed** | The URL or a cookie carries an expiring signature the CDN verifies; CloudFront recommends signed URLs for individual files and signed cookies for sets of files such as every segment of an HLS stream | Short expiries cut cache reuse unless the signature is outside the cache key; links shared off-platform stop working |

The decision follows the content's visibility, not one global switch. Public posts on an ad-supported host stay open or referrer-limited with an embed product that carries attribution back to the post; private, members-only and paid media are signed, with expiry measured in minutes to hours; a removed or geo-blocked file is blocked whatever the policy. The policies are rows the CDN layer reads (`delivery_restrictions` below), so a community's private setting, a creator's paid post and a court order all use the same mechanism.

## Takedowns and Cache Purges

Removing a post isn't the end of a takedown: the file is still in the CDN, in every variant, at every edge, until it expires or is purged. A takedown that leaves a cached copy serving for a day has not been done, and for a court order, a TAKE IT DOWN Act request or child sexual abuse material the clock doesn't stop at the database.

- **Purge every URL the asset has.** The original if it's served, every variant and format, thumbnails, video segments and playlists. Tagging cached responses with the asset ID and purging by tag reaches all of them in one call; Cloudflare supports purge by URL, cache tag, hostname, prefix or everything, with per-plan rate limits and up to 100 operations per request.
- **Verify, don't assume.** Cloudflare's documentation says a 200 response to a purge only means the request was received; the check is to request the asset again and confirm the cache status is no longer a hit. A purge row records when it was requested and when it was confirmed.
- **Decide what the URL returns afterward.** A removed file returns a tombstone (HTTP 410, or a placeholder image for embeds) so a cache doesn't refill from the origin; a file blocked for a legal demand returns 451, which RFC 7725 defines as "Unavailable For Legal Reasons" and which should carry a `Link` header with `rel="blocked-by"` naming the blocking entity.
- **Dedup changes the blast radius.** Removing one post removes that asset, not the shared blob other assets still reference. A file judged illegal in itself (a hash-list match) is the opposite: every asset pointing at that blob is quarantined, every URL purged, and the blob kept under a legal hold as evidence while no path can serve it ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)).

Edge scanning adds a second net. Cloudflare's CSAM Scanning Tool compares content served through its cache against known lists from child-safety organizations, blocks matches where it can and sends the customer a daily email with the file paths; Child Safety: Detection & Reporting covers what a platform must do when such a notice arrives. Copies outside the platform (search engine caches, archives, re-uploads elsewhere) aren't purged by any of this, which is why the decision record notes what was removed where ([Trust & Safety](/docs/security/trust-and-safety#auditing-moderation-decisions)).

## Orphans, Purges and Link Rot

An orphan is stored data nothing points at, and a media pipeline makes them constantly:

- **Abandoned uploads.** A multipart upload that never completes keeps its parts, and Amazon S3 bills for them until the upload is completed or aborted; AWS recommends a lifecycle rule that aborts incomplete multipart uploads after a set number of days ([The Upload Path](/books/user-generated-platforms/upload-path#resumable-and-chunked-uploads)).
- **Unattached assets.** A file uploaded for a post that was never published, or whose post was deleted, sits in `media_assets` with no `content_media` row.
- **Variants of purged originals,** and variants of sizes a redesign no longer uses.
- **Anonymous uploads.** Files with no owner account, which the core model marks with a null `owner_account_id`. Nobody can manage them, nobody can be notified, and they are the first purge candidates. Imgur's 2023 terms named exactly that set: "old, unused, and inactive content that is not tied to a user account."

A retention purge is a rule applied by a job, not a script: which assets it targets, after how long, in what order, with what exemptions and notice, and what it skips because of a hold ([Data Retention & Deletion](/docs/architecture/data-retention#retention-windows); [Background Jobs](/docs/architecture/background-jobs)). The purge's cost lands off the platform. Pew Research found that 38% of web pages that existed in 2013 were no longer accessible a decade later and that 54% of Wikipedia pages had at least one reference link pointing to a page that no longer exists; an image host's purge turns tutorials, forum answers and reference pages that embedded its files into broken placeholders, which is what critics predicted of Imgur's change. Platforms can't avoid all of that, but they can soften it:

- **Purge what was never viewed first,** using measured last access, so the files embedded somewhere live are the last to go.
- **Tell owners, and give them an export,** with a notice period long enough to act on; anonymous uploads can only be announced publicly.
- **Serve a tombstone, not a 404 storm,** so embeds show a clear "removed" placeholder and caches stop asking the origin.
- **Keep the record of the purge,** asset by asset, because users, journalists and regulators ask what was removed and why.

The full story of platform-wide purges (Imgur in 2023, Tumblr's removal of adult content) and of ending a service is Migrations, Purges & Shutdowns.

## Why Platforms Cap Storage

Free storage is a liability that grows forever while the revenue it supports doesn't. A platform caps it when the files that cost the most earn the least, and the public cases share a structure:

| Platform | Cap | Order and exemptions | Notice |
| --- | --- | --- | --- |
| **Flickr** (2018 to 2019) | 1,000 photos and videos for free accounts, replacing 1 TB | Uploads blocked over the cap; deletion oldest first; Creative Commons photos exempt | Announced November 2018; uploads blocked January 8, 2019; deletion from February 5, 2019; batch download offered |
| **Twitch** (2025) | 100 hours of highlights and uploads per channel | Least-viewed highlights deleted first; clips and past broadcasts exempt; under 0.5% of active channels affected | Announced February 2025 with a download or export recommendation before the April deadline |
| **Imgur** (2023) | Old, unused content not tied to an account | Anonymous uploads first; sexually explicit content removed separately | Announced April 19, 2023, effective May 15, 2023 |
| **Cloudflare Stream** (vendor) | Prepaid minutes stored | Uploads and new live streams stop when storage is exhausted | Not a purge: the customer buys more or deletes |

Design rules from the cases:

- **Cap what doesn't earn.** Twitch exempted clips and past broadcasts, which drive discovery, and capped highlights, which it said didn't; Flickr exempted Creative Commons work that others depend on.
- **Block before deleting.** Stopping new uploads over the cap is reversible; deleting is not. Flickr did both, in that order, a month apart.
- **Make the order explicit.** Oldest first and least viewed first remove different things; the rule is versioned data the platform can publish ([Rules as Data](/docs/architecture/rules-as-data)), not a constant in the purge job.
- **Account for paid tiers.** A cap is usually also a pricing decision (Flickr's Pro at $50 a year when the cap took effect), so the rule reads the account's plan at the time it runs.

The live-video version, with VOD expiry tiers by creator status and Twitch's cap in detail, is [Retention Tiers and Storage Caps](/books/user-generated-platforms/live-latency-and-vods#retention-tiers-and-storage-caps).

## Withdrawing From a Country

Sometimes the cheapest compliance answer a platform finds is to stop serving a country. Imgur blocked UK access from September 30, 2025, after the ICO issued its owner a notice of intent to fine it over children's data; Imgur content embedded on third-party sites stopped displaying for UK visitors, replaced by a "Content not viewable in your region" placeholder. The ICO's statement called the restriction a commercial decision and said that "exiting the UK does not allow an organisation to avoid responsibility" for past breaches. The regulatory side of that case belongs to Minors, Age Assurance & US State Law and Regulators & Enforcement; the delivery side belongs here, because a geo-block on a media host is a CDN rule with three consequences:

- **It reaches every embed.** The files are served from the platform's domain wherever they appear, so a block on the domain blanks images across other people's sites in that country. A community platform that blocks only its own pages leaves its files loading elsewhere; a media host can't.
- **It's decided on the request, not the row.** The country comes from the CDN's geolocation of the viewer, not from the uploader's account or the asset, which is why the core model keeps jurisdiction on rows for rules but enforces geography at the edge.
- **It's leaky and has to be recorded.** VPNs pass through, cached copies elsewhere still serve, and the block itself is a decision someone will ask about. The response is 451 with a `blocked-by` link, and the restriction is a dated row with its legal basis.

The same mechanism serves narrower cases: one file withheld in one country under a court order or a regulator's notice, a community restricted in a jurisdiction where its content is illegal, a stream blocked in a territory where the platform lacks rights. One table of restrictions, scoped to the platform, a community or an asset, keeps them all in one place for the CDN to read and for transparency reporting to count.

## How to Build It

The chapter adds a blob layer under `media_assets`, storage tiers, near-duplicate links, retention rules and purges, CDN purge records and delivery restrictions:

```sql
CREATE TABLE media_blobs (               -- one stored object per distinct original
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  sha256             BYTEA NOT NULL UNIQUE,
  storage_key        TEXT,               -- null once purged
  byte_size          BIGINT NOT NULL CHECK (byte_size >= 0),
  tier               TEXT NOT NULL CHECK (tier IN ('hot', 'warm', 'cold', 'archive')),
  tier_changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at   TIMESTAMPTZ,        -- sampled from CDN and origin logs
  encryption_key_ref TEXT NOT NULL,      -- per-blob key; destroying it is the delete
  state              TEXT NOT NULL CHECK (state IN ('active', 'pending_purge', 'purged')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purged_at          TIMESTAMPTZ,
  CHECK ((state = 'purged') = (purged_at IS NOT NULL)),
  CHECK (state = 'purged' OR storage_key IS NOT NULL)
);

ALTER TABLE media_assets
  ADD COLUMN blob_id UUID REFERENCES media_blobs (id);  -- shared by exact duplicates

ALTER TABLE media_variants
  ADD COLUMN tier             TEXT NOT NULL DEFAULT 'hot'
                                CHECK (tier IN ('hot', 'warm')),
  ADD COLUMN last_accessed_at TIMESTAMPTZ,
  ADD COLUMN deleted_at       TIMESTAMPTZ;  -- dropped as unused; rebuilt on demand

CREATE TABLE media_near_matches (        -- perceptual near-duplicates; leads, not verdicts
  asset_a_id  UUID NOT NULL REFERENCES media_assets (id),
  asset_b_id  UUID NOT NULL REFERENCES media_assets (id),
  algorithm   TEXT NOT NULL CHECK (algorithm IN ('pdq', 'tmk_pdqf')),
  distance    SMALLINT NOT NULL CHECK (distance >= 0),
  found_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (asset_a_id, asset_b_id, algorithm),
  CHECK (asset_a_id < asset_b_id)         -- one row per pair
);

CREATE TABLE media_retention_rules (     -- caps and purges as versioned data
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  name            TEXT NOT NULL,
  version         INT NOT NULL,
  target          TEXT NOT NULL CHECK (target IN ('anonymous_upload', 'unattached_asset',
                    'inactive_asset', 'over_account_cap', 'unused_variant',
                    'abandoned_upload')),
  plan            TEXT,                  -- account plan it applies to; null: all
  kind            TEXT CHECK (kind IN ('image', 'animation', 'video', 'audio', 'file')),
  idle_days       INT CHECK (idle_days > 0),      -- since last access or creation
  cap_items       INT CHECK (cap_items > 0),
  cap_bytes       BIGINT CHECK (cap_bytes > 0),
  cap_duration_ms BIGINT CHECK (cap_duration_ms > 0),
  purge_order     TEXT NOT NULL CHECK (purge_order IN ('oldest_first',
                    'least_viewed_first', 'idle_longest_first')),
  exemptions      JSONB NOT NULL DEFAULT '{}',    -- e.g. {"license": ["cc"], "kind_of_item": ["clip"]}
  block_uploads   BOOLEAN NOT NULL DEFAULT FALSE, -- stop new uploads over the cap first
  notice_days     INT NOT NULL DEFAULT 0 CHECK (notice_days >= 0),
  effective_during TSTZRANGE NOT NULL,
  UNIQUE (name, version)
);

CREATE TABLE media_purges (              -- each asset a rule removed, or chose not to
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_id         UUID REFERENCES media_retention_rules (id),  -- null: a one-off decision
  media_asset_id  UUID NOT NULL REFERENCES media_assets (id),
  status          TEXT NOT NULL CHECK (status IN ('scheduled', 'notified', 'purged',
                    'skipped', 'cancelled')),
  skip_reason     TEXT CHECK (skip_reason IN ('legal_hold', 'exempt', 'reaccessed',
                    'owner_upgraded', 'owner_exported')),
  scheduled_for   TIMESTAMPTZ NOT NULL,
  notified_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  CHECK ((status = 'skipped') = (skip_reason IS NOT NULL))
);

CREATE TABLE cdn_purges (                -- every request to evict cached copies
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  media_asset_id   UUID REFERENCES media_assets (id),
  trigger          TEXT NOT NULL CHECK (trigger IN ('takedown', 'owner_delete',
                     'retention_purge', 'restriction', 'variant_rebuilt')),
  decision_ref     UUID,                 -- moderation_decisions, media_purges or a restriction
  provider         TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('url', 'tag', 'prefix', 'hostname')),
  targets          TEXT[] NOT NULL,      -- URLs, tags or prefixes sent
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ,          -- re-fetch showed no cache hit
  CHECK (confirmed_at IS NULL OR confirmed_at >= requested_at)
);

CREATE TABLE delivery_restrictions (     -- what the edge refuses, where, and why
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  scope          TEXT NOT NULL CHECK (scope IN ('platform', 'community', 'asset')),
  community_id   UUID REFERENCES communities (id),
  media_asset_id UUID REFERENCES media_assets (id),
  kind           TEXT NOT NULL CHECK (kind IN ('geo_block', 'referrer_allowlist',
                   'signed_only', 'embed_block')),
  countries      CHAR(2)[],              -- ISO 3166-1; geo_block only
  config         JSONB NOT NULL DEFAULT '{}',  -- allowed referrers, signature TTL
  legal_basis    TEXT,                   -- 'court_order', 'regulator_notice', 'rights', 'commercial', ...
  source_ref     TEXT,                   -- the order, notice, case or decision behind it
  valid_during   TSTZRANGE NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((scope = 'community') = (community_id IS NOT NULL)),
  CHECK ((scope = 'asset') = (media_asset_id IS NOT NULL)),
  CHECK ((kind = 'geo_block') = (countries IS NOT NULL))
);
```

Notes on the sketch:

- **The blob is the stored object; the asset is the upload.** Every asset points at a blob, and exact duplicates share one. The asset's own `storage_key` from the core model is the blob's key, kept for reads; the blob row is what counts references, changes tier and gets purged. A blob is purged only when no asset referencing it is in a state other than `purged` and no `legal_holds` row covers any of them.
- **Delete by destroying the key.** Each blob is encrypted with its own key ([Encryption at Rest](/docs/security/encryption-at-rest#crypto-shredding)); purging destroys the key first, then removes the object, so copies in erasure-coded volumes and backups become unreadable on the same day.
- **Tiering is a job over access.** A daily job reads sampled access from CDN and origin logs into `last_accessed_at`, moves blobs down after their idle threshold, moves them back up when they heat, and never moves a blob with a pending purge into a class with a minimum duration. Variants are deleted rather than tiered once unused and rebuilt on the next request.
- **Near matches are pairs with a distance.** The perceptual hash index (a BK-tree or multi-index hashing over the PDQ values, or the vendor's matcher) writes pairs under the platform's threshold; feeds, search and moderation read them as signals. Hash-list matches are not here: they go through `media_scans` in [The Upload Path](/books/user-generated-platforms/upload-path#how-to-build-it) and the harm chapters' tables.
- **Retention rules are versioned data.** A purge row references the rule version that scheduled it, so the platform can answer which rule removed a file, and changing a cap creates a new version without rewriting history. Holds win: the job checks `legal_holds` at execution, not only at scheduling, and records a skip.
- **A takedown isn't done until the CDN confirms.** A removal decision, a retention purge or a new restriction writes `cdn_purges` rows in the same transaction (through the outbox); a worker sends them, re-fetches, and sets `confirmed_at`. An unconfirmed purge older than its target pages someone.
- **Restrictions are what the edge reads.** The CDN's rules (edge functions, signed URL policies, geo rules) are generated from `delivery_restrictions` in force; the restriction is dated and carries its legal basis, so transparency reporting can count geo-restrictions by basis and country.
- **Events:** `media.deduplicated`, `media.near_match_found`, `blob.tier_changed`, `media.purge_scheduled`, `media.purged`, `media.purge_skipped`, `cdn.purge_requested`, `cdn.purge_confirmed`, `delivery.restricted` and `delivery.restriction_lifted` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to feeds, search, moderation, transparency counts and the owner's notifications.

## Auditing

- **Every purge, asset by asset,** with the rule version, the notice sent, and anything skipped and why. "What did you delete, and under which policy" is the first question after any large purge.
- **Every hold that stopped a purge,** linked to the case, request or report behind it, so evidence kept past a deletion is explainable ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **Every CDN purge with its confirmation time,** because the time a takedown took effect is the time the cached copies stopped serving, not the time the row changed. Legal clocks are measured against it.
- **Every delivery restriction,** with countries, legal basis, source and dates, for transparency reports and for answering a regulator or court about what was withheld where.
- **Key destruction for purged blobs,** logged with the key reference and time ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)), as proof that a deleted file is unreadable everywhere it was stored.
- **Storage and delivery cost by surface,** retained long enough to justify a cap or a purge with the platform's own numbers rather than a guess.

## What This Means for the System You Build

- **Put a blob layer under assets,** deduplicate on the server by hash of the original, and never let upload behavior reveal that a file already exists.
- **Treat perceptual near matches as signals** for repost collapsing, takedown sweeps and reviewer context, never as automatic removals.
- **Keep every viewer-reachable file in a millisecond tier,** tier originals down by measured access, and delete unused variants instead of tiering them.
- **Respect minimum storage durations:** don't move young or soon-to-be-purged files into cold classes.
- **Compute cost per thousand views per surface,** and pick providers by the meter that matches your traffic, including egress and per-country delivery cost.
- **Set hotlink, embed and signing policy by content visibility,** from rows the CDN reads, not one global switch.
- **Purge every cached copy on takedown,** by tag, and confirm eviction before calling the takedown done.
- **Delete by destroying per-blob keys,** so erasure reaches erasure-coded storage and backups.
- **Make retention and caps versioned rules** with explicit order, exemptions, upload blocks before deletion, notice and export.
- **Serve tombstones and 451s,** never silent 404s, and record every geo-restriction with its legal basis.
- **Remember that a media host's geo-block reaches every embed** on every site in that country.

## References

**Platform engineering and filings**

- [Meta: Finding a needle in Haystack (OSDI 2010, PDF)](https://www.usenix.org/legacy/events/osdi10/tech/full_papers/Beaver.pdf), 260 billion images and 20 PB, four sizes per upload, weekly uploads, one million images a second, the long tail missing the CDN, about 10% of requests reaching Haystack, NFS metadata as the bottleneck
- [Meta: f4, Facebook's warm BLOB storage system (OSDI 2014)](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar), 65 PB and the replication factor from 3.6 to 2.8 or 2.1
- [Meta: f4 paper (PDF)](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-muralidhar.pdf), Reed-Solomon (10,4) and XOR coding, age as a proxy for temperature, one-month and three-month cutoffs, the warm share of content, per-BLOB keys for deletion
- [Meta: Open-sourcing photo- and video-matching technology](https://about.fb.com/news/2019/08/open-source-photo-video-matching/), PDQ and TMK+PDQF for identical and near-identical content (August 2019)
- [Meta ThreatExchange: PDQ](https://github.com/facebook/ThreatExchange/blob/main/pdq/README.md), the distance-31 starting threshold and the quality cutoff
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), dependence on AWS for compute, storage and data transfer, the $312.3 million AWS commitment
- [Twitch: An update on Twitch in Korea](https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/), network fees ten times most countries, peer-to-peer and 720p mitigations, the February 27, 2024 exit

**Vendor documentation**

- [Amazon S3: Storage classes](https://aws.amazon.com/s3/storage-classes/), retrieval times, minimum storage durations, Intelligent-Tiering transitions
- [Amazon S3: Pricing](https://aws.amazon.com/s3/pricing/), the first 100 GB a month of data transfer out free and tiered transfer pricing
- [Amazon S3: Multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), billing for parts of incomplete uploads and the abort lifecycle rule
- [Amazon CloudFront: Pricing](https://aws.amazon.com/cloudfront/pricing/), flat-rate plans and their bundled transfer
- [Amazon CloudFront: Serve private content with signed URLs and signed cookies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html), signed access through the CDN
- [Amazon CloudFront: Decide to use signed URLs or signed cookies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-choosing-signed-urls-cookies.html), single files versus sets such as HLS segments
- [Cloudflare R2: Pricing](https://developers.cloudflare.com/r2/pricing/), Standard and Infrequent Access prices, retrieval fee, 30-day minimum, free egress
- [Cloudflare Images: Pricing](https://developers.cloudflare.com/images/pricing/), transformations, storage, delivery and error 9422
- [Cloudflare Stream: Pricing](https://developers.cloudflare.com/stream/pricing/), minutes stored and delivered, cached playback not billed, uploads blocked when storage runs out
- [Cloudflare: Hotlink Protection](https://developers.cloudflare.com/waf/tools/scrape-shield/hotlink-protection/), file types, referrer check, blank referrers, `hotlink-ok`, effect on image search
- [Cloudflare: Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/), purge methods, rate limits, verifying eviction
- [Cloudflare: CSAM Scanning Tool](https://developers.cloudflare.com/cache/reference/csam-scanning/), matching cached content against known lists, blocking and daily notification
- [Cloudflare: Bandwidth Alliance](https://www.cloudflare.com/bandwidth-alliance/), discounted or waived transfer fees between members

**Standards and research**

- [RFC 7725: An HTTP Status Code to Report Legal Obstacles](https://www.rfc-editor.org/rfc/rfc7725.html), status 451 and the `blocked-by` link relation
- [Pew Research Center: When Online Content Disappears](https://www.pewresearch.org/data-labs/2024/05/17/when-online-content-disappears/), 38% of 2013 pages gone, broken links on news, government and Wikipedia pages

**Platform policies and press**

- [Engadget: Flickr will start deleting your photos tomorrow if you're over its limit](https://www.engadget.com/2019-02-04-flickr-1000-photo-limit-psa.html), the 1,000-item cap, oldest-first deletion from February 5, 2019, Creative Commons exemption, the prior 1 TB, Pro at $50 a year
- [Pixel Envy: Flickr announces free account changes](https://pxlnv.com/linklog/flickr-announces-free-account-changes/), the November 1, 2018 announcement quoting Flickr, the January 8, 2019 upload block and the February 5 deletion schedule
- [Wikipedia: Imgur](https://en.wikipedia.org/wiki/Imgur), founded in 2009 to address file retention for images shared on Reddit
- [How-To Geek: Imgur is about to break the world wide web](https://www.howtogeek.com/887420/imgur-is-about-to-break-the-world-wide-web/), the April 19, 2023 announcement, the May 15 effective date, anonymous inactive content, link rot in embeds
- [TechCrunch: Twitch caps streamers' storage at 100 hours of highlights and uploads](https://techcrunch.com/2025/02/20/twitch-caps-streamers-storage-at-100-hours-of-highlights-and-uploads), the cap, exemptions, least-viewed-first deletion, share of channels affected, "costly" storage
- [BleepingComputer: Imgur blocks UK users after data watchdog signals possible fine](https://www.bleepingcomputer.com/news/technology/imgur-blocks-uk-users-after-data-watchdog-signals-possible-fine/), the September 30, 2025 block and embeds showing "Content not viewable in your region"
- [ICO: Statement on the Imgur investigation](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/statement-update-on-imgur-investigation/), the notice of intent and "exiting the UK does not allow an organisation to avoid responsibility"
