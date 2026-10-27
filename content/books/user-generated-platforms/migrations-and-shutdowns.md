+++
title = "Migrations, Purges & Shutdowns"
description = "Policy-driven purges, storage caps, link rot and tombstones, country withdrawals, data exports and portability, and how to end a feature or a whole service."
category = "User-Generated Platforms Industry"
order = 1848
part = "Running the Platform"
tags = ["user-generated-content", "data-retention", "portability", "shutdowns", "storage"]
+++

Everything a user-generated platform stores, it stores on someone else's behalf, and sooner or later it stops storing some of it. A new owner decides anonymous uploads from a decade ago aren't worth paying for. A policy change bans a category of content that millions of posts belong to. A storage cap arrives for free accounts. A country's law makes serving it uneconomic, or its network fees do. A product line closes, or the whole service. Each time, the platform is deleting or hiding things that other people made, that other websites link to and embed, that users may never have backed up, and that the law may require it to keep.

These events are rare for any one platform and routine across the industry: Tumblr's 2018 adult content ban, Flickr's 2018 cap on free accounts, Imgur's 2023 purge of anonymous uploads and explicit content, Google's 2023 inactive account policy, Twitch's 2025 storage cap and its 2024 exit from Korea, Imgur's 2025 exit from the UK, Google+'s 2019 shutdown. They share a shape: an announcement with a date, a way for users to save what they want, a bulk change run in batches, a tombstone for what's gone, exceptions for what must be kept, and broken links across the web afterwards.

This chapter covers policy-driven purges, storage caps, link rot and what a removed URL should serve, country withdrawals as an operation, data exports and portability, and ending a feature or a service. The decision to block a country is [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#geoblocking-withholding-and-withdrawal)'s, and its `geo_restrictions` table holds it; storage economics and dedup are covered in [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery); generic migration technique is the playbook's [Replacing a System](/docs/architecture/replacing-systems) and retention is [Data Retention & Deletion](/docs/architecture/data-retention). The chapter extends `content_items` and `media_assets` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) with purge policies and runs, tombstones, exports and sunsets.

## How the Platforms Do It

| Event | What changed | Notice | What users could do | What happened to the content |
| --- | --- | --- | --- | --- |
| **Tumblr adult content ban** | Real-life genitals, female-presenting nipples and depictions of sex acts banned (exceptions for breastfeeding, art, political speech, written erotica); announced December 3, 2018 | Two weeks: effective December 17, 2018 | Not covered here | Existing adult posts set to private, visible only to the poster; automated flagging of new posts |
| **Flickr free account cap** | Free accounts limited to 1,000 photos, replacing a free terabyte offered since 2013 (announced November 1, 2018) | Not covered here | Upgrade to Pro ($5.99 a month or $50 a year) or download | Free accounts held to the cap |
| **Imgur terms change** | Removal of "old, unused, and inactive content that is not tied to a user account" and of explicit content; announced April 19, 2023 | Under four weeks: effective May 15, 2023 | Download anything to keep | Anonymous uploads deleted; images embedded across Reddit and forums at risk of breaking |
| **Google inactive accounts** | Personal accounts unused for two years may be deleted with their content; announced May 16, 2023, deletions from December 2023 | Over six months, and multiple notices to the account and recovery email before any deletion | Sign in; signing in to Photos specifically keeps photos | Accounts deleted after notices; no plans to delete accounts with YouTube videos at the time |
| **Twitch storage cap** | 100 hours of highlights and uploads per channel; announced February 20, 2025 | Two months: effective April 19, 2025 | Download or export | Over-limit content deleted starting with the least viewed; clips and past broadcasts excluded; under 0.5% of active channels affected |
| **Twitch in Korea** | Business closed because network fees were about ten times most countries' | Announced December 5, 2023; closed February 27, 2024 | Twitch said it would help streamers move communities to other Korean services | Service ended in the country |
| **Imgur in the UK** | UK access blocked after the ICO's notice of intent to fine | Not covered here | Request a copy of data or deletion under UK GDPR | UK users can't log in, view or upload; embeds don't display to UK visitors |
| **Google+ consumer shutdown** | Shutdown moved up from August 2019 to April 2019 after an API bug exposed profile data of about 52.5 million users (announced December 10, 2018) | About four months | Download and migrate data, with tools promised in the following months | Service ended; APIs shut within 90 days |

The patterns: **purges target what nobody can vouch for** (anonymous uploads, inactive accounts, the least viewed highlights), because no owner complains and the risk and cost are concentrated there; **notice periods range from two weeks to six months,** and the short ones produce the worst press; **"private" is a common middle state** between visible and deleted (Tumblr's adult posts); **a cap excludes what drives the business** (Twitch kept clips and past broadcasts; Google spared accounts with YouTube videos); and **a withdrawal breaks the rest of the web,** because embeds and links outlive the platform's decision.

## Policy-Driven Purges

A purge is a bulk moderation or retention decision applied to a population defined by a rule. The engineering is the same whether the reason is policy (Tumblr's and Imgur's explicit content), security (Google's inactive accounts: abandoned accounts are at least ten times less likely to have two-step verification), or cost (Twitch: "The storage of this content is costly"):

1. **Define the population as a query, version it, and count it.** "Old, unused, and inactive content that is not tied to a user account" needs a definition (no account owner, no view in N months, older than a date), and How-To Geek noted at the time that Imgur hadn't said what "inactive" meant. The count, by community and by referrer, is what tells you how much of the web will break.
2. **Exclude what must be kept.** Anything under a `legal_holds` row (a preservation request, a CyberTipline report's one-year preservation, litigation, an open claim) is skipped and stays as evidence ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)). Content in an open moderation case or appeal is skipped until it closes.
3. **Announce with a date and a way out.** What's affected, when, how to keep it (download, sign in, upgrade, claim the upload by attaching it to an account), and who to ask. Google's model (several notices over months to two addresses) is the high end; Tumblr's and Imgur's fortnight to a month drew criticism.
4. **Move through intermediate states.** Restrict or hide first, delete later: a private or hidden state lets a mistake be reversed and lets owners still export. Tumblr made existing adult posts visible only to their posters rather than deleting them.
5. **Run in batches with a kill switch.** Deletes are load ([What Breaks at Scale](/books/user-generated-platforms/platform-architecture#what-breaks-at-scale)); a purge of millions of files and rows runs as throttled [background jobs](/docs/architecture/background-jobs), ordered by the rule (Twitch deleted least-viewed first), pausable, and idempotent.
6. **Leave a tombstone** for every removed item (below), and remove derived copies: search indexes, feed caches, CDN caches, thumbnails, AI answer indexes and licensed exports.
7. **Report what happened:** counts deleted, kept under holds, restored after mistakes; and for policy removals, the moderation decisions that the transparency report counts ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query)).

Automated classification at purge scale makes mistakes at purge scale. Tumblr enforced its 2018 ban with automated flagging of posts. A purge driven by a classifier needs the error budget and appeal path of any automated action ([AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-moderation-and-error-budgets)), sized for the burst.

## Storage Caps

A cap turns an open-ended liability into a product: free up to a limit, paid beyond it. Flickr's 2018 change replaced a free terabyte with 1,000 items, and its chief executive argued the free terabyte "largely attracted members who were drawn by the free storage"; Twitch's 100-hour cap affected under 0.5% of active channels and under 0.1% of hours watched. The design choices:

- **Cap the unit users understand** (items, hours), not bytes, and show usage against it continuously.
- **Exclude what the business depends on,** and say so: Twitch excluded clips and past broadcasts.
- **Choose the deletion order and publish it:** oldest first, least viewed first, or the user's choice within a grace period. Least viewed minimizes broken links; oldest first is easiest to explain.
- **Block before deleting:** stop new uploads over the limit first, delete only after the grace period, and let paying restore the allowance before deletion.
- **Price the cap against the unit cost** of storing and serving ([Unit Costs](/books/user-generated-platforms/operating-metrics#unit-costs)).

## Link Rot and Tombstones

User-generated content is cited, embedded and linked from everywhere: Imgur launched in 2009 as an image host for Reddit links. When content goes, every one of those references breaks, and How-To Geek's 2023 critique of Imgur was that broken embeds would fill old Reddit threads, forums and tutorials with "image missing" placeholders. The platform can't prevent that, but it controls what the URL says afterwards, and that response is information to the user, to the embedding site, to search engines and to archivists.

| What happened | Response | Body |
| --- | --- | --- |
| Removed for a policy violation | 410 Gone, or a page for the web | "Removed for violating the content policy," with the policy, not the details |
| Deleted by its author | 410 Gone | "Deleted by its author"; no content, no author name if the account is erased |
| Purged under a retention or storage policy | 410 Gone | "Removed under the storage policy announced on (date)" with a link to it |
| Withheld in the viewer's country | 451 Unavailable For Legal Reasons | The legal basis and a `Link` to the blocking entity, as RFC 7725 describes ([Geoblocking, Withholding and Withdrawal](/books/user-generated-platforms/regulators-and-enforcement#geoblocking-withholding-and-withdrawal)) |
| Service withdrawn from the country | 451 | Imgur showed UK visitors that content "is not available in your region" with an explainer |
| Never existed or never public | 404 Not Found | Nothing that confirms or denies |
| Private or restricted to members | 404 to outsiders, or a sign-in prompt | Never confirms existence to someone who can't see it |

Rules for tombstones:

- **Keep the identifier forever.** The tombstone row outlives the content: id, kind, community, the reason category and the date, never the text, media or anything the erasure removed. It lets the platform answer "what was here?" for its own records and keeps ids from being reused.
- **Thread shape survives.** A deleted comment with replies becomes a "deleted" placeholder so the replies keep their context, the pattern [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds) describes for account deletion.
- **Media URLs answer too.** A direct image or video URL, the kind embedded elsewhere, returns the same status, with a small placeholder image only if the platform decides an image response is better for embeds than an error; the CDN cache is purged so the old bytes stop being served.
- **Never tombstone in a way that leaks.** A reason like "removed: child sexual abuse material" on a public URL is itself harmful; the public reason is coarse, the internal record is in the moderation case.

## Leaving a Country

A country exit is a shutdown with a border. Imgur's UK block from September 30, 2025 shows the parts: UK users couldn't log in, view or upload; embeds stopped displaying to UK visitors on every third-party page; visitors first got a bare 400 error, later a page saying content "is not available in your region" with an explainer; and users could still request a copy of their data or its deletion under UK GDPR, while Imgur said it might keep limited data where necessary and lawful, such as to defend legal claims. The ICO said leaving didn't end its investigation and fined the owner months later ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#withdrawals)). Twitch's Korea exit had a different cause (network fees about ten times other countries', after a peer-to-peer delivery trial and a 720p source cap didn't close the gap) and a longer runway (twelve weeks), and Twitch said it would help Korean streamers move their communities to other services.

The operation:

- **Decide the scope** as a `geo_restrictions` row with scope `service`: who counts as being in the country (network location, account country, both), and whether accounts registered there are closed, frozen or left reachable from abroad.
- **Keep the rights path open.** Data subjects in the country still have access, portability and erasure rights; an exit page that offers the export and deletion forms is the minimum.
- **Settle money.** Subscriptions refunded or cancelled, creator and seller balances paid out, open bookings cancelled under policy ([Payouts & Settlement](/books/payments/payouts-and-settlement)).
- **Mind the embeds and APIs.** Blocking the web app isn't blocking the media CDN, the API, the oEmbed endpoint or federation; each must apply the restriction, or the block is the leaky geoblock Ofcom fined a forum for ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-uk-online-safety-act)).
- **Keep the records.** Past processing remains enforceable; the evidence of what was done and when stays.

## Exports and Portability

Every shutdown, purge and cap tells users to download what they want to keep, so the export has to exist before the announcement. The GDPR's portability right (Article 20) covers personal data the user provided, processed on consent or contract by automated means, in a "structured, commonly used and machine-readable format," with direct transfer to another controller "where technically feasible," and without adversely affecting others' rights ([Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)). On a user-generated platform the last clause matters: a user's export includes their posts and messages, but not other people's replies and messages in full.

The open networks show what real portability takes:

- **AT Protocol:** an account's identity is a DID it controls, and with rotation keys it can repoint that DID to a new host without the old host's help, taking its signed repository of posts and follows with it ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#handles-you-don-t-own-dids-and-domain-handles)).
- **Mastodon:** a profile move redirects followers to the new account automatically (in batches), after the user sets an alias on the new account; posts don't move (they can be downloaded as an Activity Streams archive once every seven days, but not imported); follows, blocks, mutes and lists move by CSV export and import; another move must wait 30 days.
- **Industry tooling:** the Data Transfer Initiative, a nonprofit since 2023 that grew from the 2018 Data Transfer Project, builds open-source tools and schemas for moving data between services.

What an export should contain on these platforms: the account's profile and settings, every item the user published (with revisions they authored and media originals, not just variants), their votes and saves, messages they sent and received with the other party identified only as far as the user could see them, community roles and moderation actions they took as a moderator, purchases, payouts and tax documents, and verification status (without the documents). Build it as a resumable [long-running operation](/docs/requests/long-running-operations) with an expiring download, rate-limited per account, and re-authenticated, because an export is the most valuable thing an account takeover can steal.

## Ending a Feature or a Service

A shutdown is a sequence of states with dates, and users should be able to see where it is:

1. **Announce.** The date, what will happen to content, how to export, how money is settled, and what happens to links and embeds. Google's Google+ announcement gave about four months and promised export and migration tools in the months that followed.
2. **Freeze new activity.** No new accounts, uploads or bookings; existing content readable.
3. **Read-only.** Everything viewable and exportable; no writes.
4. **Close.** Content hidden; exports still available for a stated period; accounts closed; APIs off (Google shut the Google+ APIs within 90 days).
5. **Delete.** The erasure job runs over everything except records under holds or retention rules, and reports what it kept ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
6. **Tombstone and redirect.** URLs return 410 with a pointer to the announcement, or redirect to an archive if one exists.

For a feature inside a living platform (a retired media type, an API version, a monetization program), the same sequence applies at smaller scale, and the playbook's [Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive) and [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter) cover the migration side. Third-party clients and integrations break when an API they depend on changes terms or shuts down; that history is covered in [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#api-pricing-what-changed-and-why).

## How to Build It

The chapter adds purge policies and their runs, tombstones, exports and sunsets. Standing storage rules (caps, idle and anonymous-upload purges) and the per-asset purge log are [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#how-to-build-it)' `media_retention_rules` and `media_purges`; a purge policy here is the announced, one-time event (a content policy change, a new cap) that may create such a rule and whose file removals land in that log. Country withdrawals use `geo_restrictions` from [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it).

```sql
CREATE TABLE purge_policies (            -- a bulk removal rule, announced and dated
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  name             TEXT NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('content_policy', 'storage_cap',
                     'inactivity', 'security', 'feature_retired', 'legal')),
  population_ref   TEXT NOT NULL,        -- the versioned query that selects targets
  intermediate_state TEXT CHECK (intermediate_state IN ('hidden', 'private', 'quarantined')),
  deletion_order   TEXT,                 -- 'least_viewed', 'oldest_first'
  announced_at     TIMESTAMPTZ,
  announcement_url TEXT,
  restrict_at      TIMESTAMPTZ,          -- intermediate state from here
  delete_at        TIMESTAMPTZ,          -- deletion from here
  estimated_items  BIGINT,               -- counted before announcing
  retention_rule_id UUID REFERENCES media_retention_rules (id),  -- a new standing cap, if any
  approved_by      UUID NOT NULL REFERENCES accounts (id),
  CHECK (delete_at IS NULL OR announced_at IS NULL OR delete_at > announced_at)
);

CREATE TABLE purge_runs (                -- one batch of one policy
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  purge_policy_id  UUID NOT NULL REFERENCES purge_policies (id),
  phase            TEXT NOT NULL CHECK (phase IN ('restrict', 'delete')),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  items_selected   BIGINT NOT NULL DEFAULT 0,
  items_actioned   BIGINT NOT NULL DEFAULT 0,
  items_held       BIGINT NOT NULL DEFAULT 0,  -- skipped under legal_holds or open cases
  items_restored   BIGINT NOT NULL DEFAULT 0,  -- reversed after review or appeal
  status           TEXT NOT NULL CHECK (status IN ('running', 'paused', 'completed', 'aborted'))
);

-- Files a bulk purge removes are Storage, Dedup & Delivery Economics' per-asset
-- media_purges rows, pointing at the policy instead of a standing retention rule.
ALTER TABLE media_purges
  ADD COLUMN purge_policy_id UUID REFERENCES purge_policies (id),
  ADD CONSTRAINT media_purges_one_source CHECK (rule_id IS NULL OR purge_policy_id IS NULL);

CREATE TABLE content_tombstones (        -- what a removed item's URL answers, forever
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('content_item', 'media_asset',
                     'account', 'community')),
  subject_id       UUID NOT NULL,
  community_id     UUID REFERENCES communities (id),
  status_code      SMALLINT NOT NULL CHECK (status_code IN (404, 410, 451)),
  public_reason    TEXT NOT NULL CHECK (public_reason IN ('policy', 'author_deleted',
                     'retention', 'storage_policy', 'legal', 'region', 'service_ended')),
  purge_policy_id  UUID REFERENCES purge_policies (id),
  decision_id      UUID REFERENCES moderation_decisions (id),  -- internal detail lives here
  geo_restriction_id UUID REFERENCES geo_restrictions (id),     -- for 451
  removed_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (subject_type, subject_id)
);

CREATE TABLE data_exports (              -- a user's copy of their data
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  scope            TEXT[] NOT NULL,      -- 'profile', 'content', 'media_originals', 'messages',
                                         -- 'moderation_actions', 'payments', 'social_graph'
  format           TEXT NOT NULL CHECK (format IN ('json', 'activity_streams', 'csv',
                     'atproto_repo')),
  trigger          TEXT NOT NULL CHECK (trigger IN ('user_request', 'gdpr_art_15',
                     'gdpr_art_20', 'sunset', 'purge_notice')),
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reauthenticated_at TIMESTAMPTZ NOT NULL, -- step-up before an export
  ready_at         TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,          -- the download link's life
  downloaded_at    TIMESTAMPTZ,
  excluded         JSONB                 -- what was left out and why (others' data, holds)
);

CREATE TABLE service_sunsets (           -- ending a feature, a service or a country
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  scope            TEXT NOT NULL CHECK (scope IN ('service', 'feature', 'api_version',
                     'country')),
  subject          TEXT NOT NULL,        -- the feature, API version or country code
  geo_restriction_id UUID REFERENCES geo_restrictions (id),  -- for scope = 'country'
  announced_at     TIMESTAMPTZ NOT NULL,
  frozen_at        TIMESTAMPTZ,          -- no new activity
  read_only_at     TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ,
  exports_until    TIMESTAMPTZ,
  delete_at        TIMESTAMPTZ,
  state            TEXT NOT NULL CHECK (state IN ('announced', 'frozen', 'read_only',
                     'closed', 'deleted')),
  CHECK (scope <> 'country' OR geo_restriction_id IS NOT NULL)
);
```

Notes on the sketch:

- **A purge is a policy plus runs.** The policy carries the versioned population query, the dates and the approver; runs record what each batch selected, actioned, held and restored, so the totals are a sum and the run can stop and resume. Each item's removal is still a moderation decision or a retention action on that item, and the `media_assets` state moves to `removed` and then `purged` ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)).
- **Holds win.** The purge job skips any subject with a `legal_holds` row in force or an open case, counts it in `items_held`, and leaves it for the next run after the hold is released.
- **Tombstones are the only thing left.** `content_tombstones` keeps the id, the coarse public reason and the status code, and points to the internal record; the serving path and the CDN read it to answer 404, 410 or 451, and nothing in it is personal data.
- **Exports are re-authenticated and expire.** `reauthenticated_at` records the step-up ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)); `excluded` records what was left out (others' content, data under a nondisclosure order, as [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#user-notice) requires).
- **A sunset is a state machine with dates.** Users, support and the API read its state; transitions emit events that close sign-ups, flip writes off, hide content and finally start the erasure job.
- **Events:** `purge.announced`, `purge.run_completed`, `content.tombstoned`, `export.ready`, `sunset.state_changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to search, feeds, the CDN purge service, notifications and licensed-data exports.

## Auditing

- **Every purge policy** with its population query version, dates, approver, announcement and estimated count, and every run's totals.
- **Every item kept** from a purge, and the hold or case that kept it.
- **Every tombstone** with its reason category and the internal decision behind it.
- **Every export** with who requested it, the re-authentication, what it included and excluded, and when it was downloaded.
- **Every sunset and withdrawal** with its timeline, the notices sent, money settled and the final erasure report.

## What This Means for the System You Build

- **Build the export before you need it,** re-authenticated, resumable and expiring, with originals and history, not just variants.
- **Define purge populations as versioned queries,** count them, and know who links to what you're about to delete.
- **Announce with dates and a way out,** and give more than two weeks.
- **Restrict before deleting,** so mistakes and late exports are recoverable.
- **Run purges as throttled, pausable batches** that skip anything under a legal hold or open case.
- **Tombstone every removed item** with 404, 410 or 451 and a coarse public reason, and purge every derived copy.
- **Cap storage in units users understand,** exclude what the business depends on, and publish the deletion order.
- **Treat a country exit as a shutdown:** rights requests open, money settled, embeds and APIs covered, records kept.
- **Support moving away:** stable identifiers, follower redirects and machine-readable formats make portability real.
- **Run a sunset as a dated state machine** that users, support and integrations can read.

## References

**Law and standards**

- [GDPR Article 20: Right to data portability](https://gdpr-info.eu/art-20-gdpr/), scope, format, direct transfer and others' rights
- [RFC 7725: An HTTP Status Code to Report Legal Obstacles](https://www.rfc-editor.org/rfc/rfc7725.html), status 451 and its explanation

**Platform announcements and documentation**

- [Google: Updating our inactive account policies](https://blog.google/technology/safety-security/updating-our-inactive-account-policies/), the two-year rule, notices, scope, the YouTube exception and the security rationale
- [Google: Expediting changes to Google+](https://blog.google/technology/safety-security/expediting-changes-google-plus/), the accelerated April 2019 shutdown, the API bug and the 90-day API shutdown
- [Twitch: An update on Twitch in Korea](https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/), network fees, mitigations tried, the February 27, 2024 closure and help for streamers
- [Mastodon: Moving or leaving accounts](https://docs.joinmastodon.org/user/moving/), follower redirects, aliases, the 30-day cooldown, what moves and what doesn't
- [AT Protocol: Overview](https://atproto.com/guides/overview), DIDs, rotation keys and moving between hosts
- [Data Transfer Initiative: About](https://dtinit.org/about), the nonprofit and the Data Transfer Project

**Reporting**

- [TIME: Tumblr's adult content ban](https://time.com/5469831/tumblr-ban-december-2018), the December 17, 2018 ban, exceptions, private mode for existing posts and automated flagging
- [TechCrunch: Flickr revamps under SmugMug with new limits on free accounts](https://techcrunch.com/2018/11/01/flickr-revamps-under-smugmug-with-new-limits-on-free-accounts-unlimited-storage-for-pros/), the 1,000-item cap, the earlier free terabyte, Pro pricing and the rationale
- [How-To Geek: Imgur is about to break the web](https://www.howtogeek.com/887420/imgur-is-about-to-break-the-world-wide-web/), the April 19 and May 15, 2023 dates, what was removed, the undefined "inactive" and embed breakage
- [TechCrunch: Twitch caps streamers' storage at 100 hours](https://techcrunch.com/2025/02/20/twitch-caps-streamers-storage-at-100-hours-of-highlights-and-uploads), the cap, exclusions, deletion order, share affected and rationale
- [The Register: Imgur exits the UK](https://www.theregister.com/2025/10/01/imgur_exits_uk/), what UK users lost, embeds, the error and region pages, rights requests and the ICO's statements
- [Wikipedia: Imgur](https://en.wikipedia.org/wiki/Imgur), the 2009 launch as an image host for Reddit
