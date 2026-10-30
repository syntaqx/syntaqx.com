+++
title = "APIs, Events & Rate Limits"
description = "How Slack, Microsoft Graph, Google Workspace and Atlassian expose data to apps: request APIs, event delivery, subscriptions, rate limits and data-use terms."
category = "Workplace & Collaboration Industry"
order = 2042
part = "Search, Integrations and AI"
tags = ["apis", "webhooks", "rate-limits", "microsoft-graph", "slack-api"]
+++

Every collaboration suite exposes three ways in. A **request API** reads and writes one thing at a time: post a message, fetch an issue, list a folder. An **event channel** tells an app something changed: a webhook, a WebSocket, a Pub/Sub topic. A **bulk path** moves a tenant's data in volume for compliance, migration or analytics, under different terms. The same customer data sits behind all three, and in workplace software it is the customer's: an app reads it because a customer admin granted a scope ([Admin Approval and Consent](/books/workplace-and-collaboration/apps-and-marketplaces#admin-approval-and-consent)), and the vendor's terms say what the app may do with it afterward.

The hard parts are not the HTTP. Events arrive late, twice or not at all, and subscriptions expire on schedules that differ by resource. Rate limits are set per method, per tenant and per app, and since 2025 they also enforce business policy: Slack lowered read limits for apps outside its Marketplace, and Atlassian moved to a points budget. And the data an app pulls out comes with use restrictions, including bans on training models with it, that the app's own storage design has to honor. This chapter covers the request APIs, event delivery on each platform, rate limits, metered and bulk paths, the 2025 Slack changes and the data-use terms. Generic webhook design is the playbook's ([Webhooks](/docs/api-design/webhooks)); what an app is and how it gets installed is [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces); community-platform APIs, where the platform owns the data, are [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis).

## How the Platforms Do It

As of October 2026:

| Platform | Request API | Events | Rate limit model | Bulk path |
| --- | --- | --- | --- | --- |
| **Slack** | Web API, one method per action (`chat.postMessage`, `conversations.history`) | Events API over HTTP, or Socket Mode over WebSocket | Per method, per workspace, per app, in tiers from 1+ to 100+ requests a minute | Discovery API for compliance partners; bulk export barred without an agreement |
| **Microsoft 365** | Microsoft Graph, one REST endpoint across mail, files, Teams and directory, with delta queries and JSON batching | Change notifications by subscription, to webhooks, Event Hubs or Event Grid | 429 with `Retry-After`; a global 130,000 requests per 10 seconds per app plus service-specific limits | Microsoft Graph Data Connect, outside the throttling limits |
| **Google Workspace** | Per-product APIs (Gmail, Drive, Calendar, Chat, Admin SDK) | Drive watch channels, Gmail via Cloud Pub/Sub, the Workspace Events API with CloudEvents over Pub/Sub | Per-project and per-user quotas | Vault exports for compliance |
| **Atlassian Cloud** | Jira and Confluence REST APIs | Webhooks (admin, Connect, OAuth dynamic), Forge triggers | Points-based hourly quotas, per-second burst limits and per-issue write limits, enforced from March 2, 2026 for apps | Backup and export, migration tooling |

The pattern: **the notification is a hint, not the data.** Drive's push notifications carry only headers; Gmail's carry a mailbox and a `historyId`; Graph's basic notifications carry an ID; Slack and Jira carry a payload but promise neither order nor single delivery. Every platform expects the app to fetch current state after an event, and every platform makes subscriptions expire so that abandoned apps stop receiving data.

## Request APIs

The four API styles in the table each push a different integration shape:

- **Slack's Web API** is RPC over HTTP: a method per action, a token in the header, JSON back. Read methods page with cursors, and the cost of a method is its tier ([Rate Limits](#rate-limits)). An app reads a channel's history with `conversations.history` and a thread with `conversations.replies`, which is why those two methods became the lever for Slack's 2025 policy change.
- **Microsoft Graph** puts every Microsoft 365 workload behind one endpoint and one token. Two features change how integrations are built: **delta queries**, which return only what changed since a stored token, and **JSON batching**, which combines several requests in one HTTP call. Microsoft's throttling guidance says polling and full scans are the patterns most likely to get an app throttled and points to change tracking and change notifications instead.
- **Google Workspace** has a separate API per product, each with its own resource model and quotas; Drive files, Gmail messages and Calendar events don't share an ID space or a change feed.
- **Jira and Confluence** expose REST resources (issues, pages, users, fields) with JQL and CQL as query languages, which makes a single request's cost vary with the query. That variance is what Atlassian's points model prices.

An integration over these APIs ends up as a sync engine: an initial backfill through the request API, then events to learn what changed, then fetches to read it, with a periodic reconciliation because events are lossy. The engine's cursor (Graph's delta token, Gmail's `historyId`, Drive's page token) is its most important piece of state.

## Event Delivery

### Slack Events and Socket Mode

Slack's Events API posts each event to the app's Request URL. The app must return a 2xx within three seconds or the attempt counts as failed; Slack retries up to three times (almost immediately, after one minute, after five minutes) and says which attempt it is in `x-slack-retry-num` and why in `x-slack-retry-reason`. An app can answer a non-200 with `x-slack-no-retry: 1` to stop redelivery. If more than 95% of deliveries fail over 60 minutes, Slack temporarily disables the app's event subscriptions, except for apps receiving fewer than 1,000 events an hour. Deliveries are capped at 30,000 per workspace, per app, per 60 minutes; past that, Slack sends one `app_rate_limited` event per affected minute instead.

Socket Mode replaces the public URL with a WebSocket. The app uses an app-level token to call `apps.connections.open`, gets a runtime WebSocket URL, and may hold up to 10 connections at once, with any event arriving on any of them. Each event is acknowledged by returning its `envelope_id`; connections refresh every few hours, so the app must reconnect quickly. Socket Mode suits apps behind a firewall, including internal apps a customer runs on its own network, and Socket Mode apps can't be listed in the Slack Marketplace.

### Microsoft Graph Change Notifications

A Graph integration creates a **subscription** on a resource path (a mailbox folder, a drive, all chat messages in the tenant) with a notification URL, an expiry and a required secret `clientState`. Before creating it, Graph sends a validation token to the URL, and the endpoint must echo it back as plain text within 10 seconds or the subscription isn't created. Notifications then arrive as POSTs that must be acknowledged with a 2xx within 3 seconds; Microsoft recommends queuing the work and returning `202 Accepted`. Failed deliveries are retried with exponential backoff for up to 4 hours, with the timeout extended to 10 seconds on retries. Endpoints that stay slow are throttled: more than 10% of responses over 3 seconds in a 10-minute window marks the endpoint "slow" and delays new notifications by 10 minutes; more than 15% over the 10-second retry timeout marks it "drop", and notifications are dropped for 10 minutes and can't be recovered. For high volume, the same subscriptions can deliver to Azure Event Hubs or Event Grid instead.

Subscriptions expire, and the maximum lifetime depends on the resource:

| Resource | Maximum subscription lifetime |
| --- | --- |
| Teams chats, channels, chat messages, teams, members | 4,320 minutes (three days) |
| Outlook messages, events, contacts | 10,080 minutes (under seven days); 1,440 minutes with resource data |
| OneDrive drive items, SharePoint lists | 42,300 minutes (under 30 days) |
| Users and groups | 41,760 minutes (under 29 days) |
| Presence | 60 minutes |
| Copilot AI interactions | 4,320 minutes (three days) |

Three more rules shape the design. **Basic notifications** carry only the changed resource's ID; **rich notifications** include the resource data, encrypted, and shorten some lifetimes. **Lifecycle notifications** warn when the endpoint's access token or the subscription is about to expire and when an admin revokes the app's permission, and an app that ignores them silently stops receiving data. And for Teams, the organization has one pool: 10,000 active subscriptions per tenant across all Teams resources and all apps, after which new subscriptions fail with 403. Latency is published per resource; chat messages average under 10 seconds with a one-minute maximum, drive items under a minute with a six-hour maximum.

### Google Workspace Push

Google has three mechanisms, one per era:

- **Drive watch channels.** An app calls `watch` on a file or on the `changes` feed with an HTTPS address. Channels on files last at most one day and on changes at most one week, defaulting to one hour; Drive doesn't renew them, so the app creates a new channel before the old one expires and may hold both briefly. Notifications are POSTs with an empty body and only `X-Goog-*` headers; the app then calls `changes.list` or `files.get`. An optional channel token comes back in `X-Goog-Channel-Token` for verification and routing.
- **Gmail through Cloud Pub/Sub.** The app calls `watch` on a mailbox, naming a Pub/Sub topic, and must call it again at least every seven days (Google recommends daily). Each notification carries the email address and the new `historyId`, the app calls `history.list` from its last known `historyId`, and Gmail limits each watched user to one notification per second, dropping the excess. Google warns that notifications can be delayed or lost and recommends periodic `history.list` calls as a fallback.
- **The Workspace Events API.** Subscriptions to Chat spaces and users, Drive files and shared drives, and Meet spaces and users, delivered to Pub/Sub as CloudEvents. A subscription that includes resource data lasts up to 4 hours (24 with domain-wide delegation); one that carries only the resource name lasts up to 7 days.

### Jira and Confluence Webhooks

Jira webhooks come from three registrations: admins in Jira administration, Connect apps in their descriptor, and OAuth 2.0 apps dynamically through REST. Dynamically registered webhooks expire 30 days after creation or refresh and must be extended through a refresh endpoint. Jira retries failed deliveries up to five times with randomized 5 to 15 minute delays on 408, 409, 425, 429 and 5xx responses or timeouts, warns that duplicates happen, and gives each delivery an `X-Atlassian-Webhook-Identifier` for deduplication; a "get failed webhooks" operation lists what couldn't be delivered. Primary webhooks should arrive within 30 seconds and secondary ones (from bulk or cascading operations) within 15 minutes. JQL filters narrow issue, comment, worklog and attachment events. Limits are per app: 100 webhooks per tenant for a Connect app, 5 per user per tenant for an OAuth app.

### What the Four Have in Common

- **Acknowledge fast, process later.** Three seconds is the budget at both Slack and Microsoft. The receiver verifies, persists and returns; a worker does the rest ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox) on the sending side, [Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent) on this one).
- **Deduplicate by delivery ID.** Slack's retry headers, Jira's webhook identifier and Graph's notification ID exist because every platform redelivers.
- **Renewal is the app's job.** Three days for a Teams chat subscription, one day for a Drive file, seven for a Gmail watch, 30 for a Jira dynamic webhook. A scheduler that renews before expiry and a reconciler that notices a missed renewal are part of every integration.
- **Lost events are normal.** Graph drops notifications to slow endpoints, Gmail drops above one per second, and Slack disables subscriptions after sustained failure. A periodic catch-up from the cursor is what makes the sync correct.
- **Verify the sender.** Graph's `clientState`, Drive's channel token, Slack's signing secret ([Signatures](/docs/api-design/webhooks#signatures)).

## Rate Limits

**Slack.** Web API methods are assigned tiers, applied per method, per workspace, per app, per minute: Tier 1 is 1+ requests a minute, Tier 2 is 20+, Tier 3 is 50+ and Tier 4 is 100+, with short bursts allowed. Special-tier methods have their own rules; `chat.postMessage` generally allows one message per second per channel plus a workspace-wide limit. Over the limit, Slack returns 429 with `Retry-After` in seconds, and other methods, and the same method in other workspaces, are unaffected.

**Microsoft Graph.** A throttled request gets 429 and a `Retry-After`; the app should wait that long, and immediate retries make it worse because usage keeps accruing while throttled. Limits stack: a global 130,000 requests per 10 seconds per app across all tenants, plus service-specific limits for Outlook, Teams, files and identity, and the first one reached throttles. Inside a JSON batch each request is evaluated separately, so a batch can return 200 with some members failed at 429, and SDKs that retry single requests don't retry batch members. Writes can be throttled while reads still pass.

**Atlassian.** For Forge, Connect and OAuth apps, Jira and Confluence enforce three independent limits from March 2, 2026. A **points-based hourly quota**: each request costs 1 point plus object costs (core objects like issues 1 point to read, identity and permission objects 2), writes cost the base point, and quotas reset at the top of each UTC hour. **Burst limits** per tenant and endpoint: 100 requests per second for GET and POST and 50 for PUT and DELETE by default. **Per-issue write limits**: 20 writes per 2 seconds and 100 per 30 seconds on one issue. Apps start in a global pool of 65,000 points an hour shared across tenants and may be moved to a per-tenant pool after review, sized by plan and users (100,000 plus 10 per user on Standard, 130,000 plus 20 on Premium and 150,000 plus 30 on Enterprise, each capped at 500,000). Responses carry `X-RateLimit-Remaining`, `X-RateLimit-NearLimit` when under 20% remains, and on a 429 `RateLimit-Reason` naming which limit fired. Traffic authenticated with personal API tokens isn't covered by the points model but still meets the burst limits.

What the three agree on, and what to build:

- **Honor `Retry-After` first,** then exponential backoff with jitter when it's absent ([Exponential Backoff With Jitter](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter)).
- **Budget per tenant, not per process.** Limits are per workspace or tenant and per app, so the integration's scheduler has to share one budget across every worker serving that tenant ([Retry Budgets](/docs/architecture/retries-and-timeouts#retry-budgets)).
- **Slow only what was limited.** Atlassian's guidance is explicit: on quota exhaustion pause everything until reset; on a burst or per-issue limit, slow only that endpoint or issue.
- **Prefer events and deltas to polling.** Every vendor's throttling page says so.

On the provider side, limits are the playbook's admission control ([Admission, Rate Limiting and Load Shedding](/docs/architecture/admission-control#admission-rate-limiting-and-load-shedding)) and noisy-neighbor isolation ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)), with one workplace twist: the tenant pays for the seats, so an app exhausting a tenant's budget degrades a paying customer's own integrations, and limits per app per tenant protect the customer from its own apps.

## Metered and Bulk Paths

Bulk access is priced and governed separately from the request API.

- **Microsoft** metered some Graph APIs, most visibly the Teams export and change-notification APIs that archiving, backup and compliance vendors use. As of August 25, 2025 the Teams APIs are no longer metered and need no billing configuration; the SharePoint and OneDrive `assignSensitivityLabel` API stays metered at $0.00185 per call, billed to an Azure subscription attached to the app. Some of these APIs are also **protected**: they need a request and validation beyond permissions and admin consent. For volume extraction Microsoft points to Graph Data Connect, which extracts Microsoft 365 data in bulk without the REST throttling limits.
- **Slack** reserves its Discovery API for security and compliance partners (exempted from the Marketplace install minimum) and its API terms bar bulk export of message and file data except under an additional agreement.
- **Google** routes compliance export through Vault rather than the product APIs.

The design lesson is that compliance and backup integrations are a different product from workflow integrations: they need every message in the tenant, they run under the customer's legal and retention obligations ([eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export) and [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)), and the vendors gate them with their own programs, terms and sometimes prices.

## The 2025 Slack Changes

On May 29, 2025 Slack changed both its API terms and its rate limits for apps that are commercially distributed but not listed in the Marketplace ("unlisted" apps):

- **Limits.** `conversations.history` and `conversations.replies` moved from Tier 3 to Tier 1 for unlisted apps: 1 request a minute, with the maximum and default page size cut to 15 objects. The limits applied at once to unlisted apps created on or after May 29, 2025 and to new installations of existing unlisted apps. The May 29 announcement page still says existing installations aren't affected, but Slack's developer changelog entry for the change sets a date for them: the new limits were applied to existing installations of unlisted, distributed apps on March 3, 2026. As of October 2026, then, every installation of an unlisted commercial app runs at Tier 1 on these two methods.
- **Who's exempt.** Marketplace apps saw no change. Internal, customer-built apps keep their existing limits (50+ requests a minute, up to 1,000 objects a page).
- **Terms.** The updated API terms applied immediately to apps created from May 29, 2025 and from June 30, 2025 to older apps. The current terms (effective October 10, 2025) say commercial distribution requires authorization, which for most apps means a Marketplace listing and agreement, or a partner agreement with Slack or Salesforce.

Two Slack APIs sit alongside: the **Data Access API**, introduced in a limited release in January 2025 for AI apps that need Slack data, and the **Real-Time Search API**, both governed by the terms below.

Read as policy, the change says the customer's own apps and Marketplace-reviewed apps may read history at volume, and everything else may only sip it. One request a minute at 15 messages is enough to answer a user's question about a thread and not enough to copy a workspace into an outside index. The rate limit became the enforcement mechanism for a data-use policy, which is why it landed in the same announcement as the terms.

## Data-Use Terms

API data in workplace software is licensed for a purpose, and the platforms now write the purpose down.

- **Slack's API terms** bar applications offered outside the developer's organization from using API data to train a large language model, and from bulk-exporting message and file data without an additional agreement; they require use, processing and retention of other organizations' API data to be limited to the minimum necessary. For the Data Access and Real-Time Search APIs, apps may not create persistent copies, archives, indexes or long-term stores of other organizations' data, and temporary data must be deleted promptly once its specific need is met.
- **Google's Workspace API user data policy** prohibits transferring, selling or using user data to create, train or improve a machine learning or AI model, except a model personalized to that user for the approved feature; it also bans ads use, data broker transfers and credit decisions, and generally bars humans from reading user data except with consent or for security, legal or aggregated operations.
- **Google's API Services User Data Policy** adds the annual security assessment for apps using sensitive and restricted scopes ([Marketplace Review](/books/workplace-and-collaboration/apps-and-marketplaces#marketplace-review)).

For an app developer these terms are storage requirements. An AI feature built on Slack data can retrieve at query time and must not keep a vector index of another organization's messages; a Workspace add-on can't pool customers' mail into a training set. The retention clock, the index design and the deletion path all follow from the terms, and an app that ignores them is building on a revocable license. For a platform building its own API, writing these terms is how the customer's controller role ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)) reaches data after it leaves the platform: the customer authorized a purpose, and the platform's terms bind the app to it. AI assistants and agents bring the same question to the platform's own products ([AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants)).

## How to Build It

The [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) has `apps`, `app_installations` and `api_tokens`. A platform that offers events and enforces limits adds event subscriptions with expiry, a delivery log, rate-limit policies as data, and the data-use terms each app accepted:

```sql
CREATE TABLE event_subscriptions (           -- an app's standing request for changes
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  app_installation_id UUID NOT NULL REFERENCES app_installations (id),
  resource           TEXT NOT NULL,          -- '/chats/getAllMessages', 'container:...'
  event_types        TEXT[] NOT NULL,        -- 'item.created', 'item.updated', ...
  delivery           TEXT NOT NULL CHECK (delivery IN ('webhook', 'socket', 'queue')),
  target             TEXT,                   -- URL or queue name; null for socket
  include_data       BOOLEAN NOT NULL DEFAULT FALSE,  -- rich: shorter max lifetime
  client_state_hash  BYTEA,                  -- secret echoed in each delivery
  encryption_key_id  TEXT,                   -- for payloads that carry resource data
  status             TEXT NOT NULL CHECK (status IN ('validating', 'active', 'slow',
                       'dropping', 'disabled', 'expired', 'revoked')),
  expires_at         TIMESTAMPTZ NOT NULL,   -- capped by resource and include_data
  last_renewed_at    TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX event_subscriptions_expiry_idx ON event_subscriptions (expires_at)
  WHERE status IN ('active', 'slow');

CREATE TABLE event_deliveries (              -- every attempt, for retries and audits
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES event_subscriptions (id),
  event_id         UUID NOT NULL,            -- stable across retries: the dedupe key
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  attempt          SMALLINT NOT NULL,
  attempted_at     TIMESTAMPTZ NOT NULL,
  status_code      SMALLINT,
  latency_ms       INT,
  outcome          TEXT NOT NULL CHECK (outcome IN ('delivered', 'failed', 'timeout',
                     'dropped', 'rate_limited')),
  UNIQUE (event_id, subscription_id, attempt)
);

CREATE TABLE rate_limit_policies (           -- limits as data, versioned
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  scope          TEXT NOT NULL CHECK (scope IN ('method', 'tenant_quota', 'burst',
                   'resource_write', 'global_app')),
  method         TEXT,                       -- 'conversations.history', 'GET /issue'
  app_class      TEXT NOT NULL CHECK (app_class IN ('internal', 'marketplace',
                   'unlisted', 'first_party', 'any')),
  plan_id        UUID REFERENCES plans (id), -- per-plan quotas
  limit_value    INT NOT NULL,
  per_user_add   INT NOT NULL DEFAULT 0,     -- '+ 10 x users' style pools
  cap            INT,
  window_seconds INT NOT NULL,
  max_page_size  INT,                        -- the 15-object rule is a limit too
  valid_during   TSTZRANGE NOT NULL
);

CREATE TABLE api_terms_acceptances (         -- which data-use terms bind which app
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id         UUID NOT NULL REFERENCES apps (id),
  terms_version  TEXT NOT NULL,              -- '2025-10-10'
  accepted_by    UUID NOT NULL,              -- developer account
  accepted_at    TIMESTAMPTZ NOT NULL,
  ai_training_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  max_retention_days  INT,                   -- for data pulled from other orgs
  bulk_export_agreement TEXT                 -- reference when an addendum allows it
);
```

Notes on the sketch:

- **Lifetimes are computed, not requested.** `expires_at` is the smaller of what the app asked for and the cap for the resource and `include_data`, the way Graph caps chat subscriptions at three days and shortens rich Outlook subscriptions to one.
- **Health drives status.** A sliding window over `event_deliveries` moves a subscription to `slow` and `dropping` on Graph's percentages, or to `disabled` on Slack's 95%-failure rule, with a lifecycle event sent to the app at each change.
- **Revocation cascades.** Revoking an installation or blocking an app ([How to Build It](/books/workplace-and-collaboration/apps-and-marketplaces#how-to-build-it)) sets every subscription to `revoked` and emits the lifecycle notice Graph sends when an admin removes permission.
- **Counters live in a fast store; policies live here.** The per-tenant, per-app, per-method counters belong in Redis or the gateway; `rate_limit_policies` is what they're configured from and what support reads to explain a 429. `RateLimit-Reason`-style responses name the policy row that fired.
- **App class is a policy input.** The 2025 Slack change is a `rate_limit_policies` row keyed on `app_class = 'unlisted'`, effective from a date, applied at install time; storing it as data makes "which installations got which limits when" answerable.

## Auditing

- **Subscriptions created, renewed, expired and revoked,** with resource paths, whether they carried data and the installation behind them; a tenant admin can list every app subscribed to their chats.
- **Deliveries by attempt,** kept long enough to answer "did the app receive this event" during an incident or a dispute with the developer.
- **429s by app, tenant and policy,** both for support and to spot apps that page through a tenant's history at the limit.
- **Terms versions accepted by each app,** and the date each term began to bind it.
- **Bulk and protected API access,** with the program, agreement or approval that allowed it, reported to the tenant as data leaving through compliance channels.

## What This Means for the System You Build

- **Treat events as hints and keep a cursor:** fetch current state, deduplicate by delivery ID, and reconcile on a schedule.
- **Acknowledge within the platform's window** (three seconds at Slack and Microsoft) and do the work from a queue.
- **Renew every subscription before it expires,** handle lifecycle notices, and alert on a subscription that went quiet.
- **Share one rate-limit budget per tenant per app** across all workers, honor `Retry-After`, and slow only what was limited.
- **Use the bulk path for bulk work;** paging a tenant through the request API is the pattern every vendor throttles.
- **Read the data-use terms as storage requirements:** no training, no persistent copies of other organizations' data where the terms say so, deletion when the need ends.
- **If you run the platform,** version limits and terms as data, key them on app class and plan, and expect them to become policy tools.

## References

**Vendor documentation**

- [Slack: Rate limits](https://docs.slack.dev/apis/web-api/rate-limits), the four tiers, `chat.postMessage`'s per-channel limit, the Events API delivery cap and `Retry-After`
- [Slack: Rate limit changes for non-Marketplace apps (May 29, 2025)](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps), the Tier 1 limits, 15-object pages, effective dates, exemptions and terms dates
- [Slack: The Events API](https://docs.slack.dev/apis/events-api/), the three-second window, retry schedule and headers, automatic disabling and delivery cap
- [Slack: Using Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode), app-level tokens, the 10-connection limit, envelope acknowledgment and refreshes
- [Slack developer changelog](https://api.slack.com/changelog/2026-02-real-time-search-api), the March 3, 2026 date for existing installations of unlisted apps and the January 2025 limited release of the Data Access API
- [Slack API Terms of Service](https://slack.com/terms-of-service/api), the October 10, 2025 terms, LLM training and bulk export prohibitions, minimum necessary use and the persistent-copy rule for the Data Access and Real-Time Search APIs
- [Microsoft Learn: Change notifications overview](https://learn.microsoft.com/en-us/graph/change-notifications-overview), notification types, delivery channels, supported resources, the 10,000 Teams subscription pool, maximum lifetimes and latency
- [Microsoft Learn: Receive change notifications through webhooks](https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks), validation within 10 seconds, the 3-second acknowledgment, 4-hour retries, slow and drop thresholds, `clientState` and lifecycle notifications
- [Microsoft Learn: Microsoft Graph throttling guidance](https://learn.microsoft.com/en-us/graph/throttling), 429 and `Retry-After`, batching behavior and Data Connect for bulk extraction
- [Microsoft Learn: Microsoft Graph service-specific throttling limits](https://learn.microsoft.com/en-us/graph/throttling-limits), the global 130,000 requests per 10 seconds per app
- [Microsoft Learn: Metered APIs and services in Microsoft Graph](https://learn.microsoft.com/en-us/graph/metered-api-list), Teams APIs unmetered from August 25, 2025, `assignSensitivityLabel` at $0.00185 per call and protected APIs
- [Google for Developers: Drive push notifications](https://developers.google.com/workspace/drive/api/guides/push), watch channels, lifetimes, empty-body notifications, channel tokens and manual renewal
- [Google for Developers: Gmail push notifications](https://developers.google.com/workspace/gmail/api/guides/push), Pub/Sub delivery, seven-day renewal, one notification per second and `history.list`
- [Google for Developers: Google Workspace Events API](https://developers.google.com/workspace/events), supported resources, CloudEvents over Pub/Sub and subscription lifetimes
- [Atlassian Developer: Jira Cloud rate limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/), points costs, burst and per-issue limits, quota tiers, the March 2, 2026 enforcement date, headers and handling guidance
- [Atlassian Developer: Jira webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/), registration types, 30-day expiry, retry policy, deduplication, delivery targets, JQL filters and per-app limits

**Policy**

- [Google Workspace API User Data and Developer Policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy), the prohibition on training AI and ML models with user data and the other restricted uses
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), Limited Use and the annual security assessment for sensitive and restricted scopes
