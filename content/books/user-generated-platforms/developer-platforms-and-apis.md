+++
title = "Developer Platforms, APIs & Data Access"
nav_title = "Developer Platforms & APIs"
description = "Bots and apps, privileged data, rate limits, on-platform app runtimes, API pricing changes, data licensing, researcher access and scraping suits."
category = "User-Generated Platforms Industry"
order = 1812
part = "Communities and Conversation"
tags = ["user-generated-content", "apis", "bots", "data-licensing", "scraping"]
+++

Every successful community platform grows an outer ring of software it didn't write: third-party clients that people prefer to the official app, moderation bots that communities depend on, games and utilities that run inside servers, archives and research tools, and, increasingly, search engines and AI companies that want the whole corpus. The API that feeds them was once a growth strategy (more clients, more tools, more reasons to stay). It became a cost, a security surface, a moderation dependency and, once the corpus turned out to be training data, a product with a price.

The years from 2023 to 2026 rewrote the terms. Twitter ended free API access in early 2023; Reddit announced paid API access in April 2023, and the protest against it took thousands of communities dark; Reddit signed data licensing deals with Google and OpenAI in 2024 and sued companies that took its content without one; in September 2026 it said it would end RSS feeds and close remaining public API access by March 2027. At the same time the EU required the largest platforms to give vetted researchers access to data, and fined X in part for failing to.

This chapter covers who builds on a community platform, bots and apps and how they're authorized, privileged data and its review, rate limits, on-platform app runtimes, webhooks, API pricing and why it changed, data licensing as an engineering obligation, researcher access, and anti-scraping enforcement in court. It adds apps, credentials, installations, privileged access reviews, API plans and usage, and data licenses to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Generic API design is the playbook's ([Authentication](/docs/api-design/authentication), [Versioning](/docs/api-design/versioning), [Webhooks](/docs/api-design/webhooks), [API Security](/docs/security/api-security)); licensing revenue and its accounting are [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#data-licensing-as-revenue); moderation bots' role in communities is [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#apps-and-bots-for-moderation).

## How the Platforms Do It

| Platform | Developer surface | Access terms (as of October 2026) | Data licensing and enforcement |
| --- | --- | --- | --- |
| **Reddit** | Data API (OAuth); Devvit, its developer platform for apps that run on Reddit | Free limits per OAuth client and paid usage since July 1, 2023; new public API requests closed after October 31, 2026, unregistered apps cut off January 12, 2027, remaining public access ending March 2027 | Licenses with Google (2024) and OpenAI (2024); suits against Anthropic (2025) and SerpApi, Oxylabs, AWMProxy and Perplexity (2025) |
| **Discord** | Bots over REST and the Gateway; slash commands and interactions; Activities; Social SDK for games | Free; privileged intents need approval at scale; per-route and global rate limits | Not applicable |
| **X** | REST API | Free read access ended in 2023; flat tiers from March 2023; a pay-per-use entry option replaced the $200 plan in 2026; commercial use on Enterprise plans | Fined by the European Commission in December 2025 partly for blocking researchers' access to public data |
| **Mastodon** | Open REST API per server; ActivityPub; moderation webhooks | Set by each server | Not applicable |
| **Bluesky** | Open AT Protocol: firehose, feed generators, labelers | Open by protocol | Not applicable |

The pattern: **centralized platforms are closing and pricing their APIs while moving developers onto runtimes they host; open protocols make the data public by design and compete on what's built on top.** A centralized platform now runs three different programs through what used to be one API: an app platform for tools and bots, a commercial data product for licensees, and a compliance channel for researchers, each with its own terms, limits and records.

## Who Builds on a Community Platform

- **Third-party clients** replace the official app for some users. They read and write everything a user can, and they carry the platform's content and ads (or don't) on someone else's terms.
- **Moderation tools and bots** automate community moderation: removal bots, ban-list sharing, queue tools, mobile moderation clients. Communities depend on them; Reddit's transparency report counts apps built on its developer platform among the automated tools behind moderator removals.
- **Community apps:** games, polls, music, reminders, ticketing, welcome flows, leveling systems inside servers and communities.
- **Researchers and archives** study public discourse and preserve it.
- **Search engines and AI companies** want the corpus, fresh, structured and at volume.
- **Scrapers** want the same without asking.

The first four need an app platform; the fifth is a licensing business; the sixth is an enforcement problem. Designing one API for all of them is how platforms ended up in 2023.

## Bots and Apps

A bot or app is an identity of its own, created by a developer account, with credentials, and installed into communities by someone with permission to do so. Discord's model is the most completely documented:

- **Install with permissions.** An app is added to a server through OAuth with the bot scope and a permissions integer (the same permission bits as roles, from [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#roles-and-the-permission-algorithm)); the installing member can only grant permissions they hold, and the app gets a role in the server that moderators can narrow later.
- **Subscribe with intents.** On the Gateway, the app declares which event groups it wants. Three are **privileged**: server presences, server members, and message content. An app enables them in its developer settings; apps in 100 or more servers must be verified, and verified apps need approval for each privileged intent; apps above 10,000 users need a review, reconfirmed annually.
- **Message content is the sensitive one.** Without the message content intent, content fields arrive empty except in messages the app sent, DMs with the app, messages that mention it, and messages a context-menu command was used on. That's the design pressure toward **interactions:** slash commands and context menus deliver exactly the input the user chose to send the app, so most apps never need to read every message in a server.
- **Shard at scale.** Apps in 2,500 or more servers must shard their Gateway connections ([Real-Time Chat](/books/user-generated-platforms/real-time-chat#bots-on-the-gateway)).

The general lessons, which apply equally to scopes on OAuth APIs ([Scopes](/docs/api-design/authentication#scopes)):

- **Least data by default.** Apps get events about their own interactions; anything broader is a declared, reviewed privilege.
- **Review scales with reach.** An app in five servers is a hobby; an app in fifty thousand is a platform inside the platform, and its data access, security and operator deserve review before it gets there.
- **Installers can only grant what they hold,** and moderators can always narrow or remove an app.
- **Apps are actors in the record.** Every action an app takes is logged with the app's identity and the installation it acted through, so a moderation action by a bot is attributable ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#how-to-build-it)).
- **Tokens leak.** Bot tokens end up in public repositories; scan for them, revoke on detection, and make rotation cheap ([Rotation](/docs/api-design/authentication#rotation)). Discord resets an app's token automatically when it exceeds its daily identify limit, which doubles as a containment measure.

## Rate Limits

Rate limits on a community API do three jobs: protect capacity, price access, and contain abuse. Discord's REST rate limits are a well-documented reference:

- **Per-route buckets,** identified by an `X-RateLimit-Bucket` header and scoped to the top-level resource (a channel, a server, a webhook), so heavy use of one channel doesn't block another.
- **Headers on every response** (limit, remaining, reset time, reset-after, bucket) and a `Retry-After` on 429s, with the guidance not to hard-code limits but read them from responses.
- **A global limit** of 50 requests per second per bot (interactions excepted), and IP-based limits for unauthenticated requests.
- **An invalid-request limit:** 10,000 responses of 401, 403 or 429 per IP in 10 minutes triggers a temporary block at the edge, so a broken or malicious client that keeps hammering after being told no gets cut off before it costs more.

Reddit's 2023 terms are the reference for limits as pricing: 100 queries per minute per OAuth client id and 10 per minute without OAuth for free, and $0.24 per 1,000 calls for apps needing more.

The design rules, beyond the playbook's [Unrestricted Resource Consumption](/docs/security/api-security#api4-2023-unrestricted-resource-consumption) and [Admission Control](/docs/architecture/admission-control#fairness-and-bots):

- **Limit per client and per user,** so one popular client can't exhaust the platform and one user can't exhaust a client.
- **Count refusals.** Clients that ignore 429s are a signal; escalating blocks on repeated invalid requests contain them.
- **Separate the tiers physically** where it matters: licensees with contractual performance commitments shouldn't share capacity with free clients.

## On-Platform App Runtimes

The newer model hosts developers' code instead of giving them an API to call from elsewhere. Reddit's Devvit is its developer platform for apps that run on Reddit, and when Reddit announced the end of public API access it asked developers to rebuild their apps there, with an App Migration Program offering a $1 million fund, $1,000 payments to eligible apps that move, and free hosting; more than 14,000 apps and bots had registered by the announcement. Discord's Activities embed apps inside voice channels and its Social SDK brings friends, presence and voice into games (the Gaming volume's [Voice](/books/gaming/social-systems#voice) covers the SDK).

Hosting the code changes the platform's position:

- **Data never leaves.** An app that runs on the platform reads data through the platform's runtime APIs and can be kept from exporting it, which is the point when the corpus is a licensed product.
- **The platform is now the operator** of untrusted code: sandboxing, resource quotas, outbound network allowlists, secrets, and a kill switch per app ([Sandboxing User Scripts](/books/gaming/creator-economies#sandboxing-user-scripts) covers the same problem for game mods).
- **Review moves earlier.** Apps are reviewed before publication and on updates, and installations are per community with the community's moderators deciding.
- **The platform owns availability.** When an app's runtime breaks, communities that depend on it break, and the platform, not the developer, is on the hook.

## Webhooks for Moderation and Automation

Webhooks push events out: Mastodon offers webhooks on moderation events so admins can automate actions and alert their chat tools; Discord channels accept incoming webhooks for posting. Outgoing webhooks follow the playbook's [Webhooks](/docs/api-design/webhooks) (signed payloads, retries, replay); incoming ones are an unauthenticated write path into a community and need their own rate limits, content filtering and the ability for moderators to revoke them.

## API Pricing: What Changed and Why

**Twitter, 2023.** Twitter ended free read access to its API in early 2023. The tiers it published at the end of March 2023 were a write-only free tier of 1,500 posts a month, a Basic tier at $100 a month with up to 50,000 posts per app and 10,000 reads, and Enterprise pricing reported above $40,000 a month; a planned academic tier wasn't ready, so researchers had to pick a commercial one. The entry plan later rose to $200, and in April 2026 X replaced it with a pay-per-use option for hobbyist and prototype use, keeping commercial use on Enterprise.

**Reddit, 2023.** Announced April 18, 2023 and effective July 1: free limits per OAuth client, $0.24 per 1,000 calls above them, with moderation tools exempted. The developer of Apollo, a popular third-party client, estimated his costs at $20 million a year and announced on June 8 that the app would shut down on June 30. The protest that followed is [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-2023-blackout)'s case study.

**Reddit, 2026.** On September 30, 2026, Reddit said it would end RSS feeds on November 13, 2026, stop accepting new public API requests after October 31, cut off apps and users that hadn't registered by January 12, 2027, and close remaining public API access in March 2027, citing scraping and automated abuse, with Devvit as the path for developers.

The reasons the platforms gave and disclosed converge:

- **The corpus became training data.** Reddit's 10-K frames API terms as protecting the platform against commercial scraping and AI training without a license, says substantially all of its licensing contract value comes from two partners, and says those contracts include API performance requirements. A free API that serves the same data a licensee pays for undercuts the license.
- **Cost.** Third-party clients and bots consume capacity, and clients that don't show the platform's ads don't pay for it.
- **Control.** Clients and tools outside the platform's runtime are outside its safety controls, its measurement and its product decisions.

What was lost is also documented: third-party clients that users preferred, mobile moderation tools volunteers relied on, and researchers' access to public data, the gap the EU then legislated to close.

## Data Licensing as an Engineering Obligation

A licensing deal reads like a commercial contract and lands as a set of technical duties. The public descriptions show the shape: Google's February 22, 2024 announcement gave it access to Reddit's Data API for fresher, structured content and signals, with Reddit using Google's Vertex AI; OpenAI's May 2024 partnership gave it Data API access to real-time, structured content, with no financial terms disclosed. A licensee needs:

- **A feed, not a scrape:** structured records, incremental updates and a backfill, under credentials scoped to the license.
- **Performance commitments:** availability and freshness targets the platform must meet, on capacity separated from free and app traffic.
- **Deletion propagation.** When an author deletes a post, a moderator removes it, or a user erases their account, the licensee must be told, by a compliance feed of removals and erasures with a deadline to act, and the license must require them to act. Without it, licensing turns every removal into a copy that lives on elsewhere ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-requests)).
- **Scope rules:** which content is in (public posts, not private communities or messages; not content from minors' accounts where the platform's policy excludes it), which fields (no IP addresses or emails), which jurisdictions.
- **Usage records:** what was delivered to whom, when, under which license version, so a user's question ("was my post licensed?") and a regulator's can be answered.

How licensing revenue is recognized and how it fits the business are [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#data-licensing-as-revenue)'s subject.

## Researcher Access

The DSA made data access for research a legal duty for the largest platforms. **Article 40(4)** requires very large online platforms and search engines to give vetted researchers access to data, on a reasoned request from their Digital Services Coordinator, for research on systemic risks in the EU and the effectiveness of mitigation; **Article 40(8)** sets the vetting conditions (affiliation with a research organisation, independence from commercial interests, disclosed funding, data security, necessity and proportionality, and publishing results free of charge); **Article 40(12)** requires access without undue delay to data publicly accessible on the interface, including real-time data where technically feasible, for researchers meeting most of the same conditions. The Commission adopted the delegated act setting the procedures on July 2, 2025, with a data access portal for researchers, platforms and coordinators.

Enforcement has started. The Commission's first non-compliance decision under the DSA, a €120 million fine on X announced December 5, 2025, covered three findings, one of them that X failed to give researchers access to public data and imposed unnecessary barriers on them; X was given 60 to 90 days to set out measures.

For a platform that is or may become very large, researcher access is a third program beside the app platform and licensing: application intake tied to coordinator approvals, data delivered in a secure environment or by scoped export, terms that let researchers publish, and records of every dataset delivered. Which platforms are designated and on what clock is [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms)'s.

## Scraping and the Courts

Platforms that close their APIs turn to contracts, technical measures and lawsuits against those who take the data anyway. The cases so far:

- **hiQ Labs v. LinkedIn.** The Ninth Circuit upheld a preliminary injunction in 2019 letting hiQ keep scraping public LinkedIn profiles; after the Supreme Court's *Van Buren* decision narrowed the Computer Fraud and Abuse Act, the Ninth Circuit reaffirmed in 2022. In November 2022 the district court found hiQ had breached LinkedIn's User Agreement, and the parties settled in December 2022. The lesson platforms drew: scraping public data is hard to stop under computer-intrusion law, and contract claims do better.
- **X Corp. v. Bright Data.** Judge William Alsup dismissed X's claims against the data company in May 2024, finding that X's theories would have given it something like copyright control over posts its users own; contract terms couldn't do that work.
- **Reddit v. Anthropic.** Filed June 4, 2025 in San Francisco Superior Court, alleging breach of contract, trespass to chattels, unjust enrichment, tortious interference and unfair competition, and that the AI company accessed Reddit more than 100,000 times without permission and disregarded robots.txt and Reddit's user agreement.
- **Reddit v. SerpApi, Oxylabs, AWMProxy and Perplexity.** Filed in the Southern District of New York on October 22, 2025 (No. 25-cv-8736) on a different theory: that the defendants collected Reddit content from Google's search results pages by getting around Google's SearchGuard controls, in violation of the DMCA's anti-circumvention provisions, without alleging that they accessed Reddit's own servers. On July 31, 2026 the court denied the motions to dismiss in large part, keeping the Section 1201(a) circumvention claims against SerpApi and Perplexity, the trafficking claim under 1201(a)(2) against SerpApi and a New York civil conspiracy claim, while dismissing the 1201(b) claim and state unjust enrichment and unfair competition claims as preempted by the Copyright Act.

Taken together as of October 2026: computer-intrusion claims over public data are weak; contract claims depend on how the scraper agreed to the terms and run into copyright preemption when they try to control what users own; anti-circumvention claims are the newest theory and have survived a first test. The technical measures (bot detection, rate limits, robots.txt, logged-in walls) matter both for stopping scraping and as the "measures" a later claim relies on, so their deployment and changes belong in the record. The law of hosting and copyright is [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability) and [Copyright at Scale](/books/user-generated-platforms/copyright).

## How to Build It

The chapter's additions to the core model:

```sql
CREATE TABLE apps (                      -- a bot, client, on-platform app or data consumer
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id   UUID NOT NULL REFERENCES accounts (id),
  bot_account_id     UUID UNIQUE REFERENCES accounts (id),  -- the app's own identity, if any
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('bot', 'client', 'hosted_app',
                       'integration', 'licensee', 'researcher')),
  status             TEXT NOT NULL CHECK (status IN ('development', 'active', 'restricted',
                       'suspended', 'retired')),
  verified_at        TIMESTAMPTZ,
  privacy_policy_url TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_credentials (           -- hashed secrets and tokens; shown once
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id        UUID NOT NULL REFERENCES apps (id),
  kind          TEXT NOT NULL CHECK (kind IN ('client_secret', 'bot_token', 'api_key')),
  prefix        TEXT NOT NULL,           -- visible part, for leak scanning and support
  secret_hash   BYTEA NOT NULL,
  scopes        TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  revoked_reason TEXT                    -- 'rotated', 'leaked', 'identify_limit', ...
);

CREATE TABLE app_installations (         -- an app in a community, with what it was granted
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id           UUID NOT NULL REFERENCES apps (id),
  community_id     UUID REFERENCES communities (id),  -- null: installed by a user for themselves
  installed_by     UUID NOT NULL REFERENCES accounts (id),
  granted_permissions BIGINT NOT NULL DEFAULT 0,      -- bits, never more than the installer held
  role_id          UUID REFERENCES roles (id),        -- the app's role in the community
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (app_id WITH =, community_id WITH =, valid_during WITH &&)
);

CREATE TABLE app_privileged_access (     -- privileged intents and scopes, reviewed
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id        UUID NOT NULL REFERENCES apps (id),
  privilege     TEXT NOT NULL,           -- 'message_content', 'members', 'presences', ...
  justification TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'denied',
                  'revoked', 'expired')),
  reviewed_by   UUID REFERENCES accounts (id),
  decided_at    TIMESTAMPTZ,
  reconfirm_by  TIMESTAMPTZ,             -- annual re-review above the reach threshold
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_plans (                 -- limits and terms of use, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_key        TEXT NOT NULL,         -- 'free', 'paid_usage', 'enterprise', 'research'
  version         INT NOT NULL,
  product_id      UUID REFERENCES products (id),  -- kind 'api_plan'; null: free or research
  rate_limits     JSONB NOT NULL,        -- per client, per user, per route class
  commercial_use  BOOLEAN NOT NULL,
  valid_during    TSTZRANGE NOT NULL,
  UNIQUE (plan_key, version)
);

ALTER TABLE apps
  ADD COLUMN api_plan_id UUID REFERENCES api_plans (id);

CREATE TABLE api_usage (                 -- metered usage per app per day
  app_id        UUID NOT NULL REFERENCES apps (id),
  usage_date    DATE NOT NULL,
  route_class   TEXT NOT NULL,
  calls         BIGINT NOT NULL DEFAULT 0,
  throttled     BIGINT NOT NULL DEFAULT 0,   -- 429s returned
  invalid       BIGINT NOT NULL DEFAULT 0,   -- 401 and 403 returned
  PRIMARY KEY (app_id, usage_date, route_class)
);

-- data_licenses (the contract: purposes, scope, freshness, deletion propagation, revenue
-- program) belongs to Ads, Brand Safety & Data Licensing; access adds the licensee's app.
ALTER TABLE data_licenses
  ADD COLUMN app_id UUID REFERENCES apps (id);  -- kind 'licensee'; its credentials and plan

CREATE TABLE license_deliveries (        -- what went out, and the removals that followed it
  id              UUID NOT NULL DEFAULT uuidv7(),
  delivered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_license_id UUID NOT NULL REFERENCES data_licenses (id),
  kind            TEXT NOT NULL CHECK (kind IN ('backfill', 'increment', 'removal_notice',
                    'erasure_notice', 'opt_out_notice')),
  subject_type    TEXT NOT NULL,
  subject_ids     UUID[] NOT NULL,       -- batched
  acknowledged_at TIMESTAMPTZ,           -- the licensee confirmed applying it
  PRIMARY KEY (delivered_at, id)
) PARTITION BY RANGE (delivered_at);
```

Notes on the sketch:

- **One app model, several programs.** Bots, clients, hosted apps, licensees and researchers are `apps` with different kinds and plans, so credentials, usage, suspension and audit work the same way for all of them.
- **Secrets are hashed and prefixed.** A visible prefix lets secret scanning in public repositories recognize leaked tokens and revoke them automatically ([Store a Hash, Show the Key Once](/docs/api-design/authentication#store-a-hash-show-the-key-once)).
- **Installations are ranges with granted bits.** The grant is checked against the installer's own effective permissions at install time; moderators can narrow `granted_permissions` or end the range; actions taken through an installation are logged in the mod log with the app id.
- **Privileges expire.** Approved privileged access carries a reconfirmation date tied to the app's reach; crossing a reach threshold (servers, users) opens a review automatically.
- **Plans are versioned data,** so a limits change is a new version with an effective date. A paid plan points at an `api_plan` product, so its prices are [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it)' `product_prices` rows and its revenue a revenue program; usage is billed under the plan version and price in force ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **One license, two chapters.** The contract (purposes, content kinds, exclusions, freshness target, deletion propagation window, revenue program) is [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#how-to-build-it)' `data_licenses`; this chapter adds the licensee's app and the delivery log.
- **Removals reach licensees.** Content and account life-cycle events (`content.removed`, `content.deleted`, `account.erased`) and new `data_license_opt_outs` rows produce `removal_notice`, `erasure_notice` and `opt_out_notice` deliveries to every license whose deliveries included the subject; unacknowledged notices past the license's `deletion_propagation` window page someone.
- **Events:** `app.created`, `app.installed`, `app.uninstalled`, `app.privilege_requested`, `app.privilege_decided`, `credential.revoked`, `app.suspended` and `license.delivery_acknowledged` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every app's grants over time:** installations, granted bits, privileged access decisions and reviewers, because "which apps could read message content in this server last March?" is a breach and a regulator question.
- **Every action an app took** in a community, in the mod log, attributable to the app and the installation.
- **Credential lifecycle,** including leaks detected and automatic revocations.
- **Plan and price versions** with the usage billed under each.
- **Everything delivered under each license and research access grant,** with removal and erasure notices and their acknowledgements, so the platform can show that deletions propagated.
- **Anti-scraping measures and their changes,** with dates, as evidence for enforcement ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Separate the programs:** an app platform, a licensing product and a researcher channel, each with its own terms, limits and records, on one app model.
- **Give apps least data by default:** interactions over reading everything, privileged data by declared, reviewed request, with review scaling with reach.
- **Let installers grant only what they hold,** and let moderators narrow or remove any app.
- **Publish rate limits in headers,** limit per client and per user, and escalate on clients that ignore refusals.
- **Version API plans and prices** as data with effective dates, and give developers notice measured in months.
- **Host developer code when the data is the product,** and take on sandboxing, quotas, review and availability when you do.
- **Treat a data license as a deletion obligation:** a compliance feed of removals and erasures with deadlines and acknowledgements.
- **Plan for researcher access** if you may become very large: vetting intake, secure delivery and records.
- **Keep the record of your anti-scraping measures;** courts weigh them.
- **Know which tools your moderators depend on** before changing API terms.

## References

**Law**

- [EU Digital Services Act, Article 40](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_40.html), data access for regulators and vetted researchers, vetting conditions, publicly accessible data and delegated acts
- [Law Society Gazette: EU act to allow access to tech firms' data](https://www.lawsociety.ie/gazette/top-stories/2025/july/eu-act-to-allow-access-to-tech-firms-data/), the delegated act on data access adopted July 2, 2025 and the DSA data access portal
- [Law Society Gazette: X's €120 million fine a first under DSA](https://www.lawsociety.ie/gazette/top-stories/2025/december/xs-120-million-fine-a-first-under-dsa/), the December 2025 decision and its researcher-access finding
- [Wikipedia: hiQ Labs v. LinkedIn](https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn), the 2019 and 2022 Ninth Circuit rulings, the breach-of-contract finding and the 2022 settlement
- [Loeb & Loeb: Reddit v. SerpApi LLC](https://www.loeb.com/en/insights/publications/2026/08/reddit-v-serpapi-llc), the July 31, 2026 ruling on the motions to dismiss
- [PPC Land: SerpApi pushes to kill Reddit's DMCA suit over Google scraping](https://ppc.land/serpapi-pushes-to-kill-reddits-dmca-suit-over-google-scraping/), case number, filing date, defendants and the SearchGuard circumvention theory
- [SiliconANGLE: Reddit sues Anthropic](https://siliconangle.com/2025/06/04/reddit-sues-anthropic-alleged-scraping-commercial-use-user-data/), the June 4, 2025 complaint, claims and allegations
- [Social Media Today: X loses lawsuit against data scrapers](https://www.socialmediatoday.com/news/x-formerly-twitter-loses-lawsuit-against-data-scrapers/715868/), Judge Alsup's dismissal of X's claims against Bright Data (May 2024)

**Reference**

- [Discord Developer Docs: Gateway](https://docs.discord.com/developers/events/gateway), intents, privileged intents and their review thresholds, message content behavior, identify limits and sharding
- [Discord Developer Docs: Rate limits](https://docs.discord.com/developers/topics/rate-limits), per-route buckets, headers, the global limit and the invalid-request limit
- [Discord Developer Docs: Permissions](https://docs.discord.com/developers/topics/permissions), the permission bits apps are granted and the rule that grants can't exceed the granter's own
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), moderation webhooks

**In practice**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), licensing concentration in two partners, API performance requirements, protection against unlicensed scraping and AI training, litigation
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), developer-platform apps among the tools behind moderator removals
- [Wikipedia: 2023 Reddit API controversy](https://en.wikipedia.org/wiki/2023_Reddit_API_controversy), the April 18, 2023 announcement, Apollo's shutdown and the moderation-tool exemption
- [PCWorld: Reddit goes dark as user protest begins](https://www.pcworld.com/article/1949992/reddit-goes-dark-as-user-protest-begins.html), the July 1, 2023 price of $0.24 per 1,000 calls and Apollo's $20 million estimate
- [Decrypt: Reddit is killing RSS feeds and ending public API access](https://decrypt.co/379892/reddit-killing-rss-feeds-public-api-access-ai-scrapers), the September 2026 announcement, its dates, the App Migration Program and Devvit
- [Google: An expanded partnership with Reddit](https://blog.google/inside-google/company-announcements/expanded-reddit-partnership/), Data API access and Vertex AI (February 22, 2024)
- [Business Today: OpenAI signs deal with Reddit for real-time content access](https://www.businesstoday.in/amp/technology/news/story/openai-signs-deal-with-reddit-for-real-time-content-access-with-ai-features-coming-to-public-forum-429876-2024-05-17), Data API access, no disclosed financial terms (May 2024)
- [Social Media Today: Twitter announces new API access tiers](https://www.socialmediatoday.com/news/Twitter-Announces-New-API-Access-Tiers/646470/), the free, Basic and Enterprise tiers and the missing academic option (March 2023)
- [Open Terms Archive: X replaces its $200 entry-level API plan with a pay-per-use model](https://opentermsarchive.org/en/memos/x-replaces-its-dollar200-entry-level-api-plan-with-a-pay-per-use-model/), the 2026 change and Enterprise for commercial use
