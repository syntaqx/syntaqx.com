+++
title = "Self-Serve Ad Platforms"
description = "Building an Ads Manager: advertiser onboarding and verification, accounts and agency access, APIs and rate limits, budgets, reporting jobs and change history."
category = "Advertising Industry"
order = 2946
part = "Walled Gardens"
tags = ["advertising", "self-serve", "walled-gardens", "apis", "data-model"]
+++

A self-serve ad platform lets an advertiser buy without talking to anyone: sign up, verify, add a payment method, build a campaign, upload creative, launch, read reports, all in a web tool (Google Ads, Meta Ads Manager, Microsoft Advertising, TikTok Ads Manager, Amazon's ad console, Apple Ads) and through an API that agencies and tools use to do the same at scale. It is how the walled gardens sell most of their inventory and how retail media networks open theirs to thousands of brands; Instacart reported "more than 9,000 active brands" in the fourth quarter of 2025, a number no sales team serves by hand.

The hard parts are not the campaign forms. They are trust and scale at the edges. Anyone can sign up, so the platform needs to know who is advertising (for fraud, for policy, and because law now requires it for some ads) without making onboarding so slow that legitimate small businesses leave. Accounts are operated by people who change: agencies take over and hand back, employees leave, a manager account controls thousands of clients, and every action must be attributable to someone with the right to take it. The API is a product with customers who automate against it, so its limits, errors and versions decide how reliable their businesses are. And the numbers advertisers see (spend, conversions) are restated for days or weeks after the fact, so reporting is a data pipeline with a contract about when a number is final.

This chapter covers the platforms, onboarding and advertiser verification, accounts, roles and agency access, the API (access levels, rate limits, bulk writes and partial failure), budgets and spend controls, reporting (async jobs, restatement windows), change history, and the auction participant duties the MRC's standards put on self-serve platforms, then the records. It extends `ad_accounts`, `advertisers` and `campaigns` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The account hierarchy across platforms and budget rules are [Campaigns & Line Items](/books/advertising/campaigns-and-line-items); card billing thresholds, prepay and credit are [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit), in Contracts and Money, and the card charge itself is Payments' [Card Payments](/books/payments/card-payments); ad policy review and transparency centers are [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising) (creative review records are [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco)'s `creative_reviews`); bid strategies are [Automated Bidding](/books/advertising/automated-bidding); the platform-specific products are [Search Advertising](/books/advertising/search-advertising), [Social Advertising](/books/advertising/social-advertising) and [Retail Media Networks](/books/advertising/retail-media-networks). Generic API engineering is the playbook's: [Rate Limiting](/docs/requests/rate-limiting), [Bulk Operations](/docs/requests/bulk-operations), [Long-Running Operations](/docs/requests/long-running-operations), [Idempotency](/docs/requests/idempotency) and [OAuth 2.0 for Delegated Access](/docs/api-design/authentication#oauth-2-0-for-delegated-access).

## How the Platforms Do It

As of November 2026, from the platforms' developer and help documentation:

| Platform | Agency structure | API access | Rate limits | Reporting |
| --- | --- | --- | --- | --- |
| **Google Ads** | Manager accounts that "view and manage multiple Google Ads accounts"; one email can be on up to 20 accounts, so larger operators use a manager | Access levels per Google Cloud project since developer tokens were "sunset on September 9, 2026": Test, Explorer, Basic, Standard | Test 15,000 operations a day; Explorer 2,880 a day on production accounts; Basic 15,000; Standard unlimited, subject to system rate limits and per-service limits | Queries in Google Ads Query Language; change history through `change_event` for the past 30 days |
| **Meta** | Business-level ownership of ad accounts with partner access (not covered in detail here) | App access tiers: Limited (formerly Standard) and Full (formerly Advanced) | Score per ad account (reads 1 point, writes 3), max 60 (development) or 9,000 (full) with a 300-second decay; business use case limits per hour; 100 mutations per second per app per ad account | Async insights jobs; insights stop changing 28 days after being reported |

The table covers Google and Meta because those are the developer documents I opened for this chapter; Apple Ads and Microsoft Advertising run self-serve APIs too, but I didn't reach their documentation on access levels and limits. <!-- source-gap: adv-msft-apple-api-limits | missing | Microsoft Advertising and Apple Ads API access levels, rate limits and agency account structures | closes with: learn.microsoft.com Microsoft Advertising API documentation and Apple Ads Campaign Management API documentation | checked: 2026-11-22 -->

Three patterns:

- **Access is tiered by trust.** Google moves an application from Test to Standard through automated review, brand verification and a "detailed manual audit" (review time listed as 10 business days); Meta moves an app from Limited to Full access after enough successful calls with a low error rate. Higher tiers get higher limits.
- **Limits are per account as well as per app.** Meta scores calls per ad account and caps budget edits per ad set per hour; Google limits operations per day per project. A tool managing thousands of accounts must budget its calls per account.
- **Reporting is asynchronous and restated.** Large reports are jobs, not requests, and the numbers keep changing for weeks.

## Onboarding and Advertiser Verification

A self-serve platform's first job is knowing who it's selling to. Three layers, each with its own trigger:

- **Account creation** with a business name, website, country, currency and time zone, and a payment method or credit application. The currency and time zone are fixed for the account's life in this volume's model ([The Core Data Model](/books/advertising/advertising-business#the-core-data-model)): a changed time zone is a new account, so past days never move.
- **Advertiser verification.** Google began requiring election advertisers to verify in 2018 and introduced a global identity verification program in 2020 that "requires Google advertisers to verify information about their businesses"; its Ads Transparency Center (March 29, 2023) is "a searchable hub of all ads served from verified advertisers." What a program asks for (identity documents, business registration, licenses for some categories) and when it runs is each platform's policy; my default is to let a new account spend under a small limit while verification runs, with a deadline after which ads stop.
- **Category authorization.** Regulated categories (financial services, gambling, healthcare, political and issue ads) need extra proof before ads can run: Meta's advertising standards require prior written permission for dating and online gambling, and political and issue ads carry their own regimes. [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising) and [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) cover them.

The MRC's auction transparency standards make the same point as a requirement on any auctioneer: "auction participant qualification policies are required to be documented and made known to auction participants", "some level of verification (risk based) is required to be conducted to confirm compliance with these policies, initially and periodically", and "defined processes to address policy violations" are required. For creatives on self-serve tools specifically, they call for "logical restrictions on creative parameters out of policy", "automated creative scanning and/or sample-based checks" and "verifying the creative in relation to the buyer."

The design consequences:

- **Verification is a state machine on the advertiser, not a flag.** Not started, requested, submitted, under review, verified, failed, expired, each with its date, the program (identity, business operations, a category), the jurisdiction and the deadline. The core's `advertisers.verified_at` is the summary; the history is a table.
- **Spend gates read the state.** Ads may run before verification within a limit and stop at the deadline; a category's ads may not run until authorized. The serving system reads one computed eligibility, not the documents.
- **Verification belongs to the advertiser, not the account.** A business verified once should not re-verify for each account or each agency operating for it; the advertiser is the party, ad accounts are its seats on the platform.
- **Documents are sensitive data.** Identity documents are kept only as long as the program requires, encrypted and access-logged, and reviewers see what they need ([Encryption at Rest](/docs/security/encryption-at-rest)).
- **Fraud is the reason verification exists.** Stolen cards, compromised accounts and cloaked landing pages arrive through self-serve sign-up; verification, payment risk scoring and creative scanning are one defense ([Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit) covers billing fraud on the platform's own receivables; [Risk Scoring](/docs/building-blocks/risk-scoring) the generic engine).

## Accounts, Roles and Agency Access

Every self-serve platform separates three things this volume's core already separates: the advertiser (whose money it is), the ad account (its seat on the platform, with currency, time zone and billing) and the operator (the agency or the advertiser itself, `ad_accounts.operator_org_id`). On top sits access: which people and which other accounts may see or change an account.

**Manager accounts.** Google's manager account "lets you view and manage multiple Google Ads accounts" from one place; one email address can be on at most 20 Google Ads accounts, which is why agencies and tools work through managers rather than direct user access. Managers link to client accounts, and to other managers, forming a hierarchy; a client may be owned by one manager and linked to others.

**Roles.** Access levels (admin, standard, read-only, billing) are granted to people on accounts or managers, and inherited down a manager hierarchy. The platform needs to answer, for any account at any time, who could do what and through which grant.

**Agency changes.** When an advertiser moves from one agency to another, the account (and its history, its learned bid strategies, its pixel data) stays with the advertiser; the old agency's manager link is removed and the new one's added, and billing may move from the agency's invoice to the advertiser's card. Modeling the operator as a field on the account with a dated history keeps reporting by agency honest across the move.

**Delegated API access.** Tools act for users through OAuth: the user authorizes the tool's application, and the tool calls the API as that user, bounded by that user's grants ([OAuth 2.0 for Delegated Access](/docs/api-design/authentication#oauth-2-0-for-delegated-access)). The platform's record of a change must show both: the person whose grant was used and the application that made the call. Google's change history indicates "the client type (such as API or web client) that was used to make the change."

## The API

A self-serve platform's API is the same product as its web tool, used by agencies, tools and large advertisers to manage thousands of accounts. Four design areas matter most.

**Access levels.** Google's Ads API now grants access per Google Cloud project ("Developer tokens were sunset on September 9, 2026, and API access levels are now managed per Google Cloud project"), in four levels: Test (test accounts only, 15,000 operations a day), Explorer (production access at 2,880 operations a day, usually automated review), Basic (15,000 a day after brand verification) and Standard (unlimited, after a "detailed manual audit" with a listed review time of 10 business days). The tiers make abuse expensive (a new project can do little) and make good customers' growth a review, not a negotiation.

**Rate limits.** Meta scores each call against the ad account (reads 1 point, writes 3), with a maximum score of 60 for development-tier apps and 9,000 for full access, a 300-second decay and a block when exceeded; business use case limits per ad account per hour (for example `ads_management` at 100,000 for full access plus 40 per active ad); 100 mutation requests per second per app per ad account; one edit per object every 30 seconds; 10 spend limit changes a day; and 4 budget changes per ad set per hour. It reports usage in response headers (`X-Ad-Account-Usage`, `X-Business-Use-Case`, `X-FB-Ads-Insights-Throttle`) so clients can back off before they're blocked. Two of those limits are product rules dressed as rate limits: budget-change and spend-limit-change caps protect pacing and fraud controls from automation that flips them constantly. The playbook's [Rate Limiting](/docs/requests/rate-limiting) covers the mechanics; the ad-specific lesson is to limit per account and per object, not only per client.

**Bulk writes and partial failure.** A campaign build is hundreds of objects. Google's API lets a mutate request commit the operations that succeed and return errors for the rest: "the partial failure feature in the Google Ads API allows successful operations within a request to be committed, while returning errors only for the operations that failed", each error located by "the 0-based index of the operation" in the request. Without it, one bad keyword fails a thousand good ones; with it, the client must reconcile which succeeded. Every write needs an idempotency key so a retried batch doesn't create duplicates ([Idempotency](/docs/requests/idempotency)), and a validate-only mode lets tools check a build before committing it ([Bulk Operations](/docs/requests/bulk-operations)).

**Versions.** Ad APIs ship new versions often and retire old ones on a schedule, and retirements change products: Meta stopped allowing creation, duplication and updates of legacy Advantage+ shopping and app campaigns in v25.0 (February 18, 2026) ([Automated Campaigns](/books/advertising/social-advertising#automated-campaigns)). A platform should publish its sunset calendar, keep old objects editable under the versions that created them where it can, and record on each object the API version that created it ([Versioning](/docs/api-design/versioning)).

## Budgets and Spend Controls

[Campaigns & Line Items](/books/advertising/campaigns-and-line-items) covers budget rules (Google's average daily budget, which a campaign can spend "up to twice" on a day but "no more than 30.4 times" in a month; Meta's daily budget, which since v24.0 can be exceeded by up to 75% on a day while weekly spend stays at most 7 times the daily budget). The self-serve platform adds controls above campaigns:

- **Account spending limits** cap what an account can spend over its life or a period, regardless of campaign budgets; Meta caps how often they can change (10 changes a day).
- **Billing thresholds and credit lines** decide when the advertiser is charged and how far it can run ahead of payment; they are [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit)'s.
- **Budget change protections** (Meta's four budget changes per ad set per hour) exist because each change resets the pacing plan and, on some platforms, the learning state.

The rule for the platform is that every budget, limit and threshold change is an event with an author and an effective time, and the pacing and billing systems read the value in force at each moment ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

## Reporting

Advertisers live in reports, and self-serve reporting has three properties a builder must design for.

**Large reports are jobs.** Meta's insights API offers asynchronous jobs: a POST returns a `report_run_id` (which "expires after 30 days"), the client polls `async_status` and `async_percent_completion` until "Job Completed" at 100, then reads results; jobs can fail, or be skipped when they expire. Meta recommends trying synchronous calls first and switching to async "in cases where sync calls timeout", and notes that "it can take up to an hour to complete a request including retry attempts." The playbook's [Long-Running Operations](/docs/requests/long-running-operations) covers the pattern.

**Numbers are restated, and the contract says when they stop.** Meta's insights "refresh every 15 minutes and do not change after 28 days of being reported", and metrics "may continue to update for a couple of days after an ad has completed." Conversions arrive late through attribution windows, invalid clicks are removed after the fact, and spend is corrected. A self-serve platform should publish its restatement window and mark each reported row as provisional or final, so tools that copy reports into warehouses know when to stop re-pulling ([Watermarks and Late Data](/docs/data/streaming#watermarks-and-late-data)). Commerce's `ad_spend_daily` is an advertiser's import of exactly these rows, kept with `restated_at` because "networks restate recent days."

**History is bounded.** Meta limits some breakdowns: from June 10, 2025, breakdown queries starting more than 13 months back omit reach unless run async, capped at 10 requests per ad account per day. Platforms bound what they keep queryable for cost and privacy; the advertiser who needs more must export. State the bounds per metric.

**Attribution settings change what a number means.** Meta's insights now mirror the ad set's attribution setting and use impression-time reporting for on-Meta actions and conversion-time for off-Meta actions. A report row needs the attribution setting it was computed under, or two reports of "conversions" can't be compared. [Attribution](/books/advertising/attribution), in Measurement, covers the windows.

## Change History

Every self-serve platform keeps a change history because the first question after a bad week is "what changed." Google's `change_event` "provides a detailed breakdown of what changed in your account": old and new field values (creates show new values, updates both), the user's email when visible in the web client's history, and the client type (API, web client). It covers "the past 30 days", must be filtered by date, and returns at most 10,000 rows per query.

A platform building one should keep it longer than 30 days internally (disputes, audits and regulators reach back further than an advertiser's UI), expose a bounded window in the product, and make it complete: budget, bid, target, targeting, creative, status, access and billing changes, with the actor (person, application, the platform's own automation), the grant used and the request ID. The playbook's [Audit Trails](/docs/building-blocks/audit-trails) covers the mechanics; the ad-specific rule is that **changes the platform makes itself** (an auto-applied recommendation, an automated upgrade of match types or campaign types, a policy pause) are changes in the same history, with the platform as the actor, because an advertiser can't otherwise tell its own edits from the platform's.

## How to Build It

The core has `advertisers` (with `verified_at`), `ad_accounts` (with `operator_org_id`, currency, time zone, billing mode) and `campaigns`. Self-serve adds the verification history, manager links and role grants, the API clients and their access levels, report jobs, and the change history.

```sql
CREATE TABLE advertiser_verifications (  -- each verification program an advertiser went through
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id       UUID NOT NULL REFERENCES advertisers (id),
  program             TEXT NOT NULL CHECK (program IN ('identity', 'business_operations',
                        'election', 'financial_services', 'gambling', 'healthcare', 'other')),
  jurisdiction        TEXT NOT NULL,      -- ISO country or region the program applies in
  status              TEXT NOT NULL CHECK (status IN ('requested', 'submitted', 'in_review',
                        'verified', 'failed', 'expired', 'revoked')),
  requested_at        TIMESTAMPTZ NOT NULL,
  due_at              TIMESTAMPTZ,        -- after this, ads stop if not verified
  decided_at          TIMESTAMPTZ,
  decided_by          TEXT,               -- reviewer or automated check version
  evidence_ref        TEXT,               -- pointer to encrypted documents; never the documents
  expires_at          TIMESTAMPTZ,
  CHECK (status NOT IN ('verified', 'failed', 'revoked') OR decided_at IS NOT NULL)  -- expired keeps its decision
);
CREATE INDEX advertiser_verifications_current_idx
  ON advertiser_verifications (advertiser_id, program, jurisdiction, requested_at DESC);

CREATE TABLE manager_links (             -- a manager account's link to a client account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  manager_account_id  UUID NOT NULL REFERENCES ad_accounts (id),
  client_account_id   UUID NOT NULL REFERENCES ad_accounts (id),
  ownership           BOOLEAN NOT NULL DEFAULT FALSE,  -- the owning manager, at most one
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  active              TSTZRANGE NOT NULL,
  CHECK (manager_account_id <> client_account_id)
);
CREATE UNIQUE INDEX manager_links_one_owner_idx
  ON manager_links (client_account_id) WHERE ownership AND status = 'active';

ALTER TABLE ad_accounts ADD COLUMN is_manager BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE account_grants (            -- who may do what on an account, and since when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),  -- an account or a manager
  principal_kind      TEXT NOT NULL CHECK (principal_kind IN ('user', 'organization')),
  principal_ref       TEXT NOT NULL,      -- the identity provider's user ID, or an organization ID
  role                TEXT NOT NULL CHECK (role IN ('admin', 'standard', 'read_only',
                        'billing')),
  inherited_via       UUID REFERENCES manager_links (id),  -- null: granted directly
  granted_by          TEXT NOT NULL,
  active              TSTZRANGE NOT NULL
);

CREATE TABLE api_clients (               -- an application calling the API, and its access level
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_org_id        UUID NOT NULL REFERENCES organizations (id),
  name                TEXT NOT NULL,
  access_level        TEXT NOT NULL CHECK (access_level IN ('test', 'explorer', 'basic',
                        'standard', 'suspended')),
  daily_operations_limit INT,             -- null: no daily cap at this level
  brand_verified_at   TIMESTAMPTZ,
  audited_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE report_jobs (               -- an async report: requested, running, done, expired
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  api_client_id       UUID REFERENCES api_clients (id),  -- null: the web tool
  query               JSONB NOT NULL,     -- fields, breakdowns, date range, attribution setting
  status              TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed',
                        'failed', 'expired')),
  percent_complete    SMALLINT NOT NULL DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),
  result_location     TEXT,
  row_count           BIGINT,
  data_final_through  DATE,               -- days on or before this won't be restated
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL,
  error_code          TEXT
);

CREATE TABLE change_events (             -- every change to an account's configuration
  id                  UUID NOT NULL DEFAULT uuidv7(),
  changed_at          TIMESTAMPTZ NOT NULL,
  ad_account_id       UUID NOT NULL,      -- no FK across the partitioned log
  resource_kind       TEXT NOT NULL,      -- 'campaign', 'line_item', 'keyword', 'creative', 'budget',
                                          -- 'grant', 'billing', 'bid_strategy'
  resource_id         UUID NOT NULL,
  operation           TEXT NOT NULL CHECK (operation IN ('create', 'update', 'remove')),
  old_values          JSONB,              -- changed fields only
  new_values          JSONB,
  actor_kind          TEXT NOT NULL CHECK (actor_kind IN ('user', 'api_client', 'platform')),
  actor_ref           TEXT NOT NULL,      -- user ID, api client ID, or the platform job and version
  grant_id            UUID,               -- the account grant the change used, for users
  client_type         TEXT CHECK (client_type IN ('web', 'api', 'bulk_upload', 'mobile',
                        'automation')),
  request_id          TEXT,               -- the idempotency key or request ID
  PRIMARY KEY (changed_at, id)
) PARTITION BY RANGE (changed_at);
```

The question that comes after every surprising week, what changed and who did it, answered from the history:

```sql
-- One account's changes in a window, newest first, with who made each and through what.
SELECT ce.changed_at, ce.resource_kind, ce.resource_id, ce.operation,
       ce.old_values, ce.new_values,
       ce.actor_kind, ce.actor_ref, ce.client_type,
       g.role AS via_role
FROM change_events ce
LEFT JOIN account_grants g ON g.id = ce.grant_id
WHERE ce.ad_account_id = $1
  AND ce.changed_at >= $2 AND ce.changed_at < $3
ORDER BY ce.changed_at DESC
LIMIT 10000;
```

Design notes:

- **Verification is history; the advertiser row holds the summary.** `advertiser_verifications` keeps every program, attempt and decision; `advertisers.verified_at` is updated from it, and serving reads a computed eligibility per advertiser and jurisdiction, never the documents. Evidence is a pointer to encrypted storage with its own retention ([Data Retention](/docs/building-blocks/data-retention)).
- **Managers are accounts; links are dated.** A manager is an `ad_accounts` row with `is_manager`; `manager_links` carries the hierarchy with at most one owning manager per client (the partial unique index). An agency change ends one link and starts another, and `ad_accounts.operator_org_id` changes with a dated history.
- **Grants are explicit or inherited, never implied.** `account_grants` records direct grants and those inherited through a manager link, so "who could change this budget on March 3" is a query over active ranges.
- **API clients carry their tier.** `api_clients.access_level` and `daily_operations_limit` are what the rate limiter enforces per day; per-account and per-object limits (budget changes per hour) are enforced in the write path for every client alike.
- **Report jobs state their finality.** `data_final_through` tells a client which days it can stop re-pulling; `expires_at` mirrors the platform's retention of results; the query stores the attribution setting so a row's meaning travels with it.
- **The change history includes the platform.** `actor_kind = 'platform'` rows record automated upgrades, auto-applied recommendations and policy pauses with the job and version that made them; the advertiser's UI shows them beside its own edits ([Audit Trails](/docs/building-blocks/audit-trails)).
- **Writes are idempotent and batchable.** `request_id` on each change ties it to the API request's idempotency key, so a retried partial-failure batch can be reconciled operation by operation.

## Auditing

- **Who the advertiser is.** Every verification program, decision, deadline and expiry, with the evidence's location and reviewer, for regulators and for ad transparency centers.
- **Who could act on each account.** Grants and manager links with their active ranges and grantors.
- **Every change, by whom and through what.** User, application or the platform's own automation, with the grant used and the request ID.
- **Every API client's tier and review.** Access level changes, brand verification and audits, and suspensions for abuse.
- **What each report said, and when it was final.** Report jobs with their queries, attribution settings and finality dates, so a number given to an advertiser can be reproduced.

## What This Means for the System You Build

- **Verify advertisers once, as parties,** with a dated history per program and jurisdiction, and gate spend on a computed eligibility.
- **Model managers, links and grants explicitly** so agency changes and inherited access are queries, not guesses.
- **Tier API access by trust** and limit per account and per object as well as per client.
- **Support partial failure and idempotent batch writes,** and record which operations of a batch succeeded.
- **Publish restatement windows** and mark report data provisional or final.
- **Keep a complete change history** that includes the platform's own automated changes, longer internally than the product shows.
- **Fix each account's currency and time zone** and treat changes as new accounts.

## References

**Specifications**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), documented and verified auction participant qualification, violation processes and creative qualification on self-serve tools

**Filings**

- [Maplebear (Instacart): Fourth quarter 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000006/cartfourthquarter2025sha.htm), active brands in the fourth quarter

**In practice**

- [Google Ads API: Access levels](https://developers.google.com/google-ads/api/docs/api-policy/access-levels), the sunset of developer tokens on September 9, 2026, access per Cloud project, the four levels, their operation limits and review
- [Google Ads API: Partial failures](https://developers.google.com/google-ads/api/docs/best-practices/partial-failures), committing successful operations, the partial_failure_error and locating errors by operation index
- [Google Ads API: Change event](https://developers.google.com/google-ads/api/docs/change-event), the 30-day window, date filtering, the 10,000-row limit, old and new values, user and client type
- [Google Ads Help: About overdelivery and your average daily budget](https://support.google.com/google-ads/answer/2375423?hl=en), daily spend up to twice the average daily budget and the 30.4-times monthly cap
- [Google Ads Help: About manager accounts](https://support.google.com/google-ads/answer/6139186?hl=en), managing multiple accounts and the 20-account limit per email
- [Google: Announcing the launch of the new Ads Transparency Center (March 29, 2023)](https://blog.google/innovation-and-ai/technology/ads/announcing-the-launch-of-the-new-ads-transparency-center/), election advertiser verification since 2018, global advertiser verification since 2020 and the searchable hub of verified advertisers' ads
- [Meta for Developers: Marketing API rate limiting](https://developers.facebook.com/docs/marketing-api/overview/rate-limiting), per-account scoring, access tiers, business use case limits, mutation and concurrent-edit limits, spend limit and budget change caps, and usage headers
- [Meta for Developers: Insights API best practices](https://developers.facebook.com/docs/marketing-api/insights/best-practices), async jobs and statuses, report_run_id expiry, when to use async, refresh and the 28-day finality, reach limits on older breakdowns and attribution settings
- [Meta for Developers: Graph API v24.0 changelog (October 8, 2025)](https://developers.facebook.com/docs/graph-api/changelog/version24.0), daily budget flexibility raised to 75% with weekly spend at most 7 times the daily budget
- [Meta for Developers: Graph API v25.0 changelog (February 18, 2026)](https://developers.facebook.com/docs/graph-api/changelog/version25.0), no creation, duplication or updates of legacy Advantage+ shopping and app campaigns
- [Meta Transparency Center: Advertising Standards](https://transparency.meta.com/policies/ad-standards/), prior written permission for dating and online gambling
