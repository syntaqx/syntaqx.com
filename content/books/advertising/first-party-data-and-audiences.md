+++
title = "First-Party Data & Audiences"
nav_title = "First-Party Audiences"
description = "CDPs, onboarding, customer match uploads, per-platform normalization and hashing, lookalikes, retargeting lists, and the records behind each audience."
category = "Advertising Industry"
order = 2928
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "audiences", "identity", "privacy", "data-model"]
+++

An audience is a set of people an advertiser wants to reach or avoid, expressed in identifiers an ad platform can recognize. First-party audiences are built from data the advertiser (or a publisher) collected itself: customers from a CRM, buyers from an order system, visitors recorded by its own pixel, users of its app. They are uploaded to an ad platform as hashed lists ("customer match", "custom audiences", "matched audiences"), recorded on the platform by a pixel or SDK as people visit, turned into identifiers a DSP can use by an onboarding service, or extended into lookalikes the platform models from them. Since browsers removed third-party cookies in Safari and Firefox and apps need permission to track on iOS, first-party audiences are what most targeting outside contextual rests on.

It is hard because an audience is personal data moving between companies under rules each side enforces differently. The advertiser has to normalize and hash identifiers exactly the way each destination expects, under the consent it collected, refresh the list as people buy and churn, and remove people who opt out or ask to be deleted everywhere the list went. The platform receiving the list has to match it without keeping what it should not, refuse audiences built on sensitive categories, keep the audience alive only as long as its rules allow, and serve ads to it without telling the advertiser who matched. And the same word, "audience", names a list of hashed emails, a rule over pixel events, a model's output and a purchased segment.

This chapter covers the kinds of first-party audience and where each lives, customer data platforms and onboarding, customer list uploads and how Google, Meta, Microsoft and LinkedIn differ, normalization and hashing per destination, website and app retargeting audiences, lookalikes and modeled audiences, the life cycle of an audience (membership duration, expiry, refresh, deletion), the sensitive-data rules that now block audiences outright, and the records a platform or an advertiser keeps. It extends `advertisers` and `line_items.targeting` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The identifiers the lists turn into are [Identifiers After Cookies](/books/advertising/identifiers-after-cookies); purchased third-party segments are [Data Brokers & Third-Party Data](/books/advertising/data-brokers); joining an advertiser's data with a publisher's without exchanging it is [Data Clean Rooms](/books/advertising/data-clean-rooms); the content and audience taxonomies segments are labeled with are [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies); how targeting is stored on a line item is [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#targeting-as-data). From the advertiser's seat, Commerce owns the workflow of uploading customer lists for acquisition and new-customer goals ([Google: Shopping and Performance Max](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max)) and sending conversions server to server ([Server-Side Conversions](/books/commerce/acquisition-and-attribution#server-side-conversions)); this chapter is the receiving and operating side.

## How the Platforms Do It

As of November 2026, from each platform's help center and developer documentation.

| Platform | List audiences | Identifiers and hashing | Life cycle | Lookalikes and modeled audiences |
| --- | --- | --- | --- | --- |
| **Adobe Experience Platform** (CDP) | Audiences built from unified profiles, then activated to destinations | Identity namespaces and merge policies decide which profile records combine | Batch audiences "automatically evaluated every 24 hours"; streaming and edge segmentation update in near real time | Not a delivery platform; sends audiences to platforms that model them |
| **Google Ads** | Customer Match: CSV upload or API, used on Search, Shopping, YouTube, Gmail and Display for signed-in users | Email, phone (E.164), first and last name, country and zip (unhashed), mobile device ID (unhashed, separate file); SHA-256 hex; Gmail dots removed before hashing | Membership up to 540 days; a list needs at least 100 members added or updated in that window to stay eligible | Included automatically in Smart Bidding and optimized targeting campaigns, currently on YouTube (opt-out available) |
| **LinkedIn** | Matched Audiences: contact and company list uploads, streaming DMP segment APIs, website retargeting through the Insight Tag | Contacts and companies matched to member profiles and company pages | Initial matching "can take up to 48 hours", later updates up to 24 hours; a segment unused for 30 days is archived and expires after 90 days unused | Predictive Audiences combine an advertiser's list with LinkedIn's modeling |
| **Meta** | Customer list custom audiences, website custom audiences from the Pixel, app and engagement audiences | `EMAIL`, `PHONE`, names, location, date of birth, `MADID` (unhashed, lowercase), `EXTERN_ID`; SHA-256 lowercase hex; up to 10,000 users per request | Changes "usually take up to 24 hours"; customer file audiences unused for two years flagged for deletion; audiences suggesting health conditions or financial status flagged and restricted from September 2, 2025 | Lookalikes from a seed of at least 100 people per country, 1% to 20% ratios, refreshed every 3 days |
| **Microsoft Advertising** | Customer match lists via the UI or Bulk API | Hashed email only, SHA-256 as a 64-character hex string | Match size available after 48 hours | Not covered here |

Three patterns run through the table:

- **Every platform takes SHA-256 hashes and every platform normalizes differently.** Google strips Gmail dots, Meta and Microsoft do not mention it, UID2 does it for `gmail.com` only, and Google and Meta disagree on which fields stay unhashed. One normalizer for all destinations is guaranteed to lose matches somewhere.
- **Audiences decay by rule, not only by behavior.** Google's 540-day membership, LinkedIn's 30-day archive and 90-day expiry, Meta's two-year flag and 90-day lookalike inactivity are platform rules a sync has to respect and record.
- **Platforms now police what an audience is about.** Meta's September 2025 flagging of health and financial audiences, Google's consent requirements in the EEA and the US enforcement record on health data have made "what is this list built from" a check that runs before the list can serve.

## Kinds of First-Party Audience

| Kind | Built from | Lives in | Identifier |
| --- | --- | --- | --- |
| **Customer list** | CRM, order system, loyalty program, newsletter list | Uploaded to each platform | Hashed email, phone, name and address; mobile device IDs; raw UID2s for DSPs that take them |
| **Website visitors** | The platform's pixel or tag firing on the advertiser's site | The platform, defined by a rule | The platform's own cookie or login match |
| **App users** | The platform's SDK or the advertiser's event uploads | The platform | Mobile advertising ID (with consent), platform account |
| **Engagement** | People who watched, clicked, followed or messaged on the platform | The platform | The platform's account |
| **Lookalike or modeled** | A seed audience plus the platform's model | The platform | The platform's account; the advertiser never sees members |
| **Publisher first-party** | A publisher's logged-in users and their behavior on its own properties | The publisher's ad server or a curated deal | PPID, publisher segments, curated audience segment IDs |
| **Clean room derived** | An overlap or model computed in a clean room | The clean room, activated to a platform | Whatever the activation path allows |

The distinction that matters for engineering is **who holds membership**. A customer list is held by the advertiser and copied to each destination; a website visitor audience is held only by the platform and defined by a rule the advertiser writes; a lookalike is computed by the platform and never leaves it. The advertiser can delete a person from the first kind and can only change the rule or stop the pixel for the second and third.

## Customer Data Platforms and Onboarding

A **customer data platform** (CDP), in the CDP Institute's definition, is "software that creates and maintains a persistent, unified customer record that is accessible to other systems", and it "assumes primary responsibility for defining and maintaining customer identity and customer record structure over time." For advertising, the CDP is where audiences are defined over unified profiles and sent to platforms. Adobe Experience Platform's segmentation is a representative design: streaming evaluation applies segment definitions to profile data as it arrives, "an ongoing data selection process that updates your audiences in response to user activity"; batch evaluation runs all profiles through definitions and "batch audiences are automatically evaluated every 24 hours"; edge evaluation decides on the request for same-page personalization; and merge policies decide how records for one person are combined into the profile the audience reads. The engineering consequence is that an audience in a CDP is a query plus a schedule, and the list a platform receives is that query's output at the last run.

The identity part of a CDP is [record linkage](/docs/building-blocks/record-linkage): deciding which records are the same person. My rule for advertising use is that a CDP's merged profile is fine for choosing who belongs in an audience, but the identifiers sent to a platform are the ones the person gave, with the consent attached to that identifier, never one inferred from a merge ([Observations, Not Overwrites](/docs/building-blocks/record-linkage#observations-not-overwrites)).

**Onboarding** turns offline or CRM identifiers into identifiers that ad tech can use in the bidstream: a service matches hashed emails, phones or postal addresses to its graph and delivers the resulting IDs (RampIDs, cookie IDs, device IDs) to DSPs and other destinations. The same outcome is available directly with UID2: an advertiser or data provider maps hashed emails to raw UID2s with `identity/map` and sends those to a DSP, which matches them against UID2 tokens in bid requests ([Identifiers After Cookies](/books/advertising/identifiers-after-cookies)). Onboarding is a disclosure of personal data to the onboarder and to each destination, under the advertiser's consent and contracts, and in US state law it is commonly a sale or a share for cross-context behavioral advertising, so the opt-outs in [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs) apply to it.

## Customer List Uploads

A customer list upload is a batch of normalized, hashed identifiers per person, sent with an audience ID, an operation (add, remove, replace) and, increasingly, consent fields. What the platforms require, from their documentation:

**Google Customer Match.** The file is CSV in ASCII or UTF-8 with English headers: `Email`, `Phone` (E.164 with country code), `First Name`, `Last Name` (no prefixes or suffixes), `Country` (ISO 2-letter, not hashed), `Zip` (not hashed; US 5 or 5+4 digits), and `Mobile Device ID` in a separate, unhashed file. Plain text uploads are hashed by Google; API uploads must be SHA-256 hex. Normalize before hashing: trim, lowercase, E.164 phones, and "Remove all periods (.) preceding the domain name in @gmail.com and @googlemail.com addresses"; a phone's `+` is optional in plain text and required when hashed. Match rates are shown only for API uploads with at least 100 matched users. Membership lasts up to 540 days, and a list stays eligible only if at least 100 members are added or updated within that window. Google recommends its Data Manager API over the Google Ads API for new integrations. In the EEA, Customer Match data needs both `ad_user_data` and `ad_personalization` consent granted from March 2024, and from early March 2024 Customer Match lists are no longer available on partner inventory and third-party exchanges in the EEA, UK and Switzerland, only on Google's owned properties.

**Meta customer list custom audiences.** The Marketing API takes a `schema` of keys (`EMAIL`, `PHONE`, `GEN`, `DOBY`, `DOBM`, `DOBD`, `FN`, `LN`, `FI`, `ST`, `CT`, `ZIP`, `COUNTRY`, `MADID`, `EXTERN_ID`, `PAGEUID`) and rows of values. "You must hash data as `SHA256`; we don't support other hashing mechanisms", as lowercase hex, except `EXTERN_ID`, app and page-scoped user IDs and `MADID` (lowercase, with hyphens). Normalization is per key: emails trimmed and lowercased; phones stripped of symbols, letters and leading zeros, with a country code added if `COUNTRY` is not sent. Each request takes up to 10,000 users, batched under a shared `session_id`; there is no limit on total records; changes "usually take up to 24 hours"; a replace runs at most 90 minutes on an audience under 100 million users. The advertiser must accept the Custom Audience Terms or the API returns an error. `EXTERN_ID` data is retained 90 days.

**Microsoft Advertising customer match.** Lists are uploaded through the Bulk API with hashed emails only: "The string must be hashed using the SHA-256 algorithm. The hashed Email must be a hexadecimal string of length 64." Accepting the Customer Match Terms (now possible in the bulk file) means agreeing "that you are able to lawfully disclose audience details, which is personal data, to Microsoft". Match counts appear after 48 hours, when ads can start showing.

**LinkedIn Matched Audiences.** Contact or company lists are uploaded as CSV or streamed to DMP segments; segments move through `BUILDING`, `READY`, `UPDATING`, `ARCHIVED` and `EXPIRED`. Initial matching "can take up to 48 hours", later additions and removals up to 24 hours. A segment unused in a draft or active campaign for 30 days is archived, and one unused or not updated for 90 days expires. Access to the DMP segment APIs requires separate approval from the Advertising API.

The rules that follow for the system sending lists:

- **One normalizer per destination, versioned.** The same email normalizes to different bytes for Google (Gmail and Googlemail dots removed), Meta and Microsoft (trim and lowercase), UID2 (dots and `+suffix` removed for `gmail.com` only) and Yahoo's ConnectID (lowercase); [Identifiers After Cookies](/books/advertising/identifiers-after-cookies) has the UID2 code. Keep them as separate, tested functions, and record which version produced each upload.
- **Hex for platforms, Base64 for UID2.** Google, Meta and Microsoft take lowercase hex SHA-256; UID2 takes Base64 of the raw bytes. A value in the wrong encoding is well-formed and matches nobody.
- **Leave unhashed what must be unhashed.** Country and zip for Google, mobile device IDs everywhere; hashing them breaks matching, and the platform will not tell you why.
- **Removal is an operation, not a re-upload.** Opt-outs and deletions are sent as removes to every destination the person was uploaded to, and the replace operation is used only when the whole list is authoritative.
- **Consent fields ride with the upload.** Google's EEA consent fields and any US opt-out state are per-person facts the upload must carry or filter on.

## Website and App Retargeting

A retargeting audience is a rule over events the platform's own tag or SDK observed: "visited `/cart` in the last 30 days and did not fire `Purchase`". Meta's website custom audiences are JSON rules with a filter over `url` or `event` fields (`i_contains` and other operators) combined with `and` or `or`; the retention parameter is documented as "Between `1` and `180` days" while the same page's FAQ says the longest duration is 365 days, an inconsistency in Meta's own documentation as of November 2026. <!-- source-gap: adv-meta-website-ca-retention | status | Meta website custom audience maximum retention (180 vs 365 days) | closes with: Meta reconciling the retention_days parameter and FAQ on the website custom audiences guide | checked: 2026-11-22 --> Google's and LinkedIn's website audiences work the same way through their tags.

What engineering owns in retargeting:

- **The tag is the collection.** Membership exists only because the platform's tag fired, so the tag runs only within consent ([Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks)), and the events it sends must not reveal a sensitive category: a URL like `/conditions/diabetes/treatment` in a pixel event is a health inference, which is the conduct the FTC's GoodRx and BetterHelp orders addressed ([Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting) covers the law).
- **Exclusions are audiences too.** "Did not purchase" needs a purchase audience to subtract, which is why retargeting depends on the same conversion events attribution does; a missing purchase event keeps showing ads to people who already bought.
- **Recency is the product.** Retargeting value falls fast with time since the visit, so audiences are usually defined in layers (1, 7, 30 days) and frequency-capped harder than prospecting ([Pacing & Frequency Capping](/books/advertising/pacing-and-frequency#frequency-capping)).
- **Browsers shorten what the advertiser can see, not what the platform holds.** Safari's seven-day cap on persistent cookies set from script (ITP 2.1) limits the advertiser's own analytics IDs; the platform's membership is keyed on its own login match. [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy) covers which browsers break which kind of retargeting.

## Lookalikes and Modeled Audiences

A lookalike (similar audience, predictive audience) is the platform's model of who resembles a seed audience. The advertiser supplies the seed and a size; the platform ranks its users by similarity and returns the top share in a market; membership is never visible to the advertiser.

Meta's Marketing API documents the mechanics in the most detail. A seed needs "at least 100 people" (and a conversion-based seed at least 100 unique conversions, with 200 or more recommended), with at least 100 seed members per country unless `allow_international_seeds` is set. The `ratio` runs from 0.01 to 0.20 in steps of 0.01, the top 1% to 20% of the selected country, or a `type` of `similarity` (about the top 1%) or `reach` (about the top 5%). Meta "refreshes members in a lookalike every 3 days" while it is used in an ad set, and a lookalike unused in active ads for 90 days returns `-1` for size. From Marketing API v27.0, lookalikes no longer take `country` or `location_spec`: location is set on the ad set. LinkedIn's Predictive Audiences combine a customer's contact or company list with LinkedIn's modeling to find members "most likely to convert". In Google's case, campaigns using Smart Bidding or optimized targeting include the account's Customer Match lists automatically (currently on YouTube campaign types, with an opt-out), which makes the list a signal to a model rather than a hard boundary.

Two consequences:

- **The seed is the sensitive part.** A lookalike built from a list of people with a health condition is a health-targeted audience even though no member's condition is known. Meta blocks flagged seeds: from September 2, 2025, audiences suggesting "specific health conditions" or "financial status" are flagged with `operation_status` 471 and lookalikes from them fail.
- **Modeled audiences move the boundary into the platform.** When automated campaigns treat lists as signals, the advertiser controls what goes in, not who sees the ad. Records of what was uploaded, when and under what consent are then the advertiser's whole audit trail; [Social Advertising](/books/advertising/social-advertising) and [Search Advertising](/books/advertising/search-advertising) cover the automated campaign types.

## Sensitive Data and Audience Rules

Audience rules are enforced from three directions, and a platform operating audiences encodes all three:

- **Platform policy.** Meta's flagging and restriction of health and financial audiences (from September 2, 2025), and its restrictions on custom conversions suggesting health conditions, apply at upload and at use; the Commerce volume's [Privacy Constraints](/books/commerce/acquisition-and-attribution#privacy-constraints) covers the conversion side.
- **Regulator orders.** The FTC's GoodRx order (February 2023, $1.5 million, the first Health Breach Notification Rule action) banned sharing health data for advertising, and the BetterHelp order (March 2023, $7.8 million) banned sharing health data for advertising and personal information for retargeting; both turned on uploading customer data to ad platforms.
- **Statute.** US state laws give opt-outs of targeted advertising and sale or sharing, several require opt-in consent for sensitive data, Maryland bans the sale of sensitive data outright and targeted advertising to known teens, and in the EU the DSA bans profiling-based ads using special categories of data and ads to known minors on online platforms. [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law), [Children, Teens & Advertising](/books/advertising/children-and-teens) and [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) cover them; the generic rules are [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection) and [Minors](/docs/telemetry/consent-and-privacy#minors).

The engineering form of all three is a check that runs on an audience's definition (its source, its rule, its seed) before upload and before activation, records its result, and blocks or limits the audience, the same as creative review does for ads.

## How to Build It

The core model has `advertisers` and a `targeting` expression on `line_items`; [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#targeting-as-data) defines that expression and its catalog. This chapter adds the audience as a record: its kind, owner, definition and rules; its members where this system holds them; each upload to a destination with its normalizer and consent; the platform's reference for it; and which line items use it, so a deletion or a policy block reaches every place it matters.

```sql
CREATE TABLE audiences (                 -- a set of people to reach or exclude, whoever holds members
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_org_id           UUID NOT NULL REFERENCES organizations (id),  -- advertiser's org or publisher
  advertiser_id          UUID REFERENCES advertisers (id),             -- null for a publisher audience
  name                   TEXT NOT NULL,
  kind                   TEXT NOT NULL CHECK (kind IN ('customer_list', 'website_visitors',
                           'app_users', 'engagement', 'lookalike', 'modeled', 'publisher',
                           'clean_room')),
  members_held_by        TEXT NOT NULL CHECK (members_held_by IN ('this_system', 'platform')),
  definition             JSONB NOT NULL DEFAULT '{}',  -- rule over events, CDP query ref, or seed
  seed_audience_id       UUID REFERENCES audiences (id),
  lookalike_ratio_bp     INT CHECK (lookalike_ratio_bp BETWEEN 1 AND 10000),  -- 100 = 1%
  membership_days        INT CHECK (membership_days > 0),  -- e.g. 540 for Google Customer Match
  purpose                TEXT NOT NULL CHECK (purpose IN ('targeting', 'exclusion',
                           'measurement', 'seed')),
  legal_basis            TEXT NOT NULL,   -- 'consent', 'us_opt_out_respected', ...; per region
  sensitive_review       TEXT NOT NULL DEFAULT 'pending' CHECK (sensitive_review IN ('pending',
                           'cleared', 'restricted', 'blocked')),
  sensitive_reviewed_at  TIMESTAMPTZ,
  status                 TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused',
                           'archived', 'deleted')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'lookalike') = (seed_audience_id IS NOT NULL)),
  CHECK (kind <> 'lookalike' OR members_held_by = 'platform'),
  UNIQUE (owner_org_id, name)
);

CREATE TABLE audience_members (          -- membership where this system holds it
  audience_id    UUID NOT NULL REFERENCES audiences (id),
  subject_key    BYTEA NOT NULL,         -- keyed HMAC of the person's internal ID, not an identifier
  added_at       TIMESTAMPTZ NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,   -- added_at + membership_days; refreshed on re-qualify
  removed_at     TIMESTAMPTZ,
  removal_reason TEXT CHECK (removal_reason IN ('expired', 'no_longer_qualifies', 'opt_out',
                   'deletion_request', 'consent_withdrawn', 'audience_blocked')),
  consent_ref    TEXT NOT NULL,          -- the consent record this membership relied on
  PRIMARY KEY (audience_id, subject_key)
);

CREATE TABLE audience_uploads (          -- one batch sent to one destination
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  audience_id        UUID NOT NULL REFERENCES audiences (id),
  destination_org_id UUID NOT NULL REFERENCES organizations (id),  -- Google, Meta, a DSP, an onboarder
  operation          TEXT NOT NULL CHECK (operation IN ('add', 'remove', 'replace')),
  identifier_types   TEXT[] NOT NULL,    -- {'email_sha256_hex','phone_sha256_hex','maid','raw_uid2'}
  normalizer_version TEXT NOT NULL,      -- e.g. 'google-cm-2026-03', 'meta-ca-v24', 'uid2-1'
  records_sent       BIGINT NOT NULL CHECK (records_sent >= 0),
  records_excluded   BIGINT NOT NULL DEFAULT 0,  -- filtered for consent, opt-out or region
  records_matched    BIGINT,             -- if and when the destination reports it
  consent_fields     JSONB NOT NULL DEFAULT '{}',  -- e.g. {"ad_user_data":"GRANTED"} per region
  external_job_id    TEXT,               -- session_id, offline job, list upload ID
  status             TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'processing',
                       'completed', 'failed', 'rejected')),
  rejection_code     TEXT,               -- e.g. Meta operation_status 471
  sent_at            TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  CHECK (records_matched IS NULL OR records_matched <= records_sent)
);

-- The destination's ID for the audience, in the crosswalk Campaigns & Line Items defines.
ALTER TABLE platform_entity_refs DROP CONSTRAINT platform_entity_refs_local_table_check;
ALTER TABLE platform_entity_refs ADD CONSTRAINT platform_entity_refs_local_table_check
  CHECK (local_table IN ('ad_accounts', 'campaigns', 'line_items', 'creatives',
         'shared_budgets', 'audiences')) NOT VALID;

-- Which line items use which audience, maintained when targeting is published.
CREATE TABLE audience_usages (
  audience_id   UUID NOT NULL REFERENCES audiences (id),
  line_item_id  UUID NOT NULL REFERENCES line_items (id),
  mode          TEXT NOT NULL CHECK (mode IN ('include', 'exclude', 'seed', 'signal')),
  line_item_version INT NOT NULL,        -- the published targeting version that referenced it
  PRIMARY KEY (audience_id, line_item_id, mode)
);

CREATE INDEX CONCURRENTLY audience_members_expiry_idx
  ON audience_members (expires_at) WHERE removed_at IS NULL;
```

A line item's targeting refers to audiences in the expression tree [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#targeting-as-data) defines, as a typed dimension:

```json
{"all": [
  {"dim": "audience", "include": ["aud_0195c1a2-7f3e-7c4b-9a41-2d1e0b6f9c10"],
                      "exclude": ["aud_0195c1a2-8a90-7d11-b2c3-51e9f04a7d22"]},
  {"dim": "geo.country", "include": ["US"]}
]}
```

The fan-out a deletion request needs, from one query:

```sql
-- Every audience, destination and line item a person's deletion must reach.
SELECT m.audience_id, a.name, a.kind,
       array_agg(DISTINCT u.destination_org_id) FILTER (WHERE u.operation <> 'remove') AS destinations,
       array_agg(DISTINCT us.line_item_id)                                          AS line_items
FROM audience_members m
JOIN audiences a           ON a.id = m.audience_id
LEFT JOIN audience_uploads u ON u.audience_id = m.audience_id AND u.status = 'completed'
                            AND u.sent_at >= m.added_at
LEFT JOIN audience_usages us ON us.audience_id = m.audience_id
WHERE m.subject_key = $1
  AND m.removed_at IS NULL
GROUP BY m.audience_id, a.name, a.kind;
```

Design notes:

- **An audience is a record before it is a list.** Kind, owner, purpose, legal basis, membership duration and sensitive review are columns, so an audience can be checked and blocked before any identifier is sent, and an audience whose members the platform holds still has a record here.
- **Members are keyed by the person, not the identifier.** `subject_key` is an HMAC of the internal person ID; the hashed email, phone or UID2 for each destination is computed at upload time by that destination's normalizer. A person who changes email stays one member, and a deletion finds every audience by one key.
- **Uploads are an append-only history.** Each batch records the destination, operation, identifier types, normalizer version, what was excluded and why, and the consent fields sent, which is what an advertiser needs to show what it disclosed to whom and on what basis; it is the advertiser-side twin of the platform's own records.
- **Removal is driven by `audience_members.removed_at`.** A removal reason of `opt_out` or `deletion_request` creates `remove` uploads to every destination that received the person after they joined, and the job is not done until each completes ([Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools)).
- **Respect each platform's clock.** `membership_days` mirrors the destination's maximum (Google's 540 days); a sync refreshes members who still qualify before they lapse and records the platform's archive or expiry state, because a LinkedIn segment unused for 90 days silently stops existing.
- **Usages make blocks enforceable.** When a sensitive review moves an audience to `blocked`, `audience_usages` lists every line item to pause; when a person leaves an exclusion list, it shows which line items may now reach them.
- **Lookalikes reference their seed.** The check that a lookalike's seed cleared sensitive review is a join, and blocking the seed blocks every lookalike built from it.
- **Records map across volumes.** Commerce's customer list uploads ([Acquisition & Attribution](/books/commerce/acquisition-and-attribution#how-to-build-it)) are this chapter's `audience_uploads` seen from the store; the platform's received copy is its own audience with `members_held_by = 'platform'`.

## Auditing

- **Every audience's definition and review.** Kind, source, rule or seed, purpose, legal basis, and each sensitive review with who decided and when, so a regulator's or platform's question about why an audience existed has an answer.
- **Every upload, with what was sent and withheld.** Destination, operation, identifier types, normalizer version, counts sent, excluded and matched, consent fields, rejection codes.
- **Membership changes with reasons.** When each person joined and left each audience and why, including opt-outs and deletions, kept as long as the law requires the response to be shown.
- **Which line items used which audience version.** So an ad shown to an audience can be traced to the audience as it was.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model the audience before the list.** Kind, owner, who holds members, purpose, legal basis, duration and sensitive review are data; the identifiers are computed per destination at upload.
- **Normalize and encode per destination.** Google's Gmail rule, Meta's per-key rules, Microsoft's hex emails, UID2's Base64; one versioned normalizer each, tested against the platform's examples.
- **Send removals as faithfully as additions.** Every opt-out, deletion and consent withdrawal becomes a remove to every destination that received the person, tracked to completion.
- **Mirror the platforms' life cycles.** Membership limits, archive and expiry rules, refresh windows and lookalike inactivity are platform rules a sync has to know.
- **Review what an audience is about, including seeds.** Health, financial status, children and other sensitive categories are blocked by platforms, ordered by regulators and limited by statute; check before upload and before activation.
- **Keep the tag inside consent and out of sensitive URLs.** Retargeting membership is created by the tag; what it sends defines what the audience reveals.
- **Treat CDP merges as a targeting convenience, not an identity to disclose.** Send the identifiers the person gave, with their consent, not ones a merge attached.

## References

**Regulation**

- [FTC: Enforcement action to bar GoodRx from sharing consumers' sensitive health info for advertising (February 1, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), the $1.5 million penalty and ban on sharing health data for ads
- [FTC: Ban on BetterHelp revealing consumers' data (March 2, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook), the $7.8 million order and the retargeting ban
- [Maryland: Chapter 455 of 2024, enrolled text](https://mgaleg.maryland.gov/2024RS/Chapters_noln/CH_455_sb0541e.pdf), the ban on selling sensitive data and on targeted advertising to consumers known to be 13 to 17
- [Regulation (EU) 2022/2065, Digital Services Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065), Art. 26(3) profiling ads using special categories and Art. 28(2) profiling ads to minors

**Reference**

- [WebKit: Intelligent Tracking Prevention 2.1](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/), the seven-day cap on persistent client-side cookies
- [CDP Institute: What is a CDP?](https://www.cdpinstitute.org/learning-center/what-is-a-cdp/), the definition of a customer data platform
- [Adobe Experience Platform: Segmentation Service overview](https://experienceleague.adobe.com/en/docs/experience-platform/segmentation/home), streaming, batch and edge evaluation, the 24-hour batch cycle and merge policies
- [Google Ads Help: About Customer Match](https://support.google.com/google-ads/answer/6379332), where lists serve, automatic inclusion in Smart Bidding and optimized targeting, the 540-day membership and 100-member eligibility rule, EEA partner inventory change
- [Google Ads Help: Customer Match data formatting guidelines](https://support.google.com/google-ads/answer/7659867), headers, unhashed fields, normalization including the Gmail rule, SHA-256 hex and the 100-user match rate display
- [Google Ads Help: Customer Match consent in the EEA](https://support.google.com/google-ads/answer/14310715), both consent fields required from March 2024
- [Meta for Developers: Custom audiences from customer lists](https://developers.facebook.com/docs/marketing-api/audiences/guides/custom-audiences), schema keys, SHA-256 hashing, per-key normalization, batch limits, processing time, terms, retention and health and financial flagging
- [Meta for Developers: Lookalike audiences](https://developers.facebook.com/docs/marketing-api/audiences/guides/lookalike-audiences), seed minimums, ratios, refresh every 3 days, inactivity, v27.0 location change and flagged seeds
- [Meta for Developers: Website custom audiences](https://developers.facebook.com/docs/marketing-api/audiences/guides/website-custom-audiences), rule format and the inconsistent retention limits
- [Microsoft Learn: Customer List Item record (Bulk)](https://learn.microsoft.com/en-us/advertising/bulk-service/customer-list-item), hashed email as 64-character SHA-256 hex, terms acceptance and the 48-hour match window
- [Microsoft Learn: LinkedIn Matched Audiences overview](https://learn.microsoft.com/en-us/linkedin/marketing/matched-audiences/matched-audiences), DMP segments, list uploads, Predictive Audiences, matching times and the archive and expiry states
- [UID2: POST /v3/identity/map](https://unifiedid.com/docs/endpoints/post-identity-map), mapping hashed emails to raw UID2s for onboarding
