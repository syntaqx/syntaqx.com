+++
title = "Third-Party Integrations"
nav_title = "Integrations"
description = "Being a client of other companies' APIs: connections per tenant, OAuth with PKCE, token refresh races, sync with cursors and webhooks, their limits."
category = "Building Blocks"
order = 459
tags = ["architecture", "integrations", "oauth", "webhooks", "sync"]
+++

Sooner or later every product connects to someone else's: the CRM a sales team already lives in, the accounting system the books close in, the calendar a technician's day comes from, the storefront that sends the orders. Each starts as "pull their contacts in" and a weekend of code. A year later there are forty customers connected, tokens expiring at 3 a.m., a provider that changed a field's type in a new API version, a sync that silently stopped for one tenant in March, and nobody can say which.

The shape that holds up: **a connection is a record with a status, tokens are secrets with one refresher, changes arrive through one idempotent path whatever their source, and their API is a budget you spend deliberately.** This chapter is the client side. Sending webhooks is in [Webhooks](/docs/api-design/webhooks), being an OAuth provider is in [API Authentication](/docs/api-design/authentication#oauth-2-0-for-delegated-access), and signing people in with someone else's identity provider is in [SSO & Federation](/docs/security/sso-and-federation).

## A Connection Is a Record

The unit of an integration isn't the provider, it's the **connection**: one tenant's link to one account at one provider. Two tenants on the same CRM are two connections with different tokens, different scopes, different rate limits and different failure states. One tenant with two QuickBooks companies is two connections too.

```sql
CREATE TABLE connections (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL REFERENCES tenants (id),
  provider              TEXT NOT NULL,                 -- 'hubspot', 'xero', 'google_calendar'
  external_account_id   TEXT NOT NULL,                 -- their id for the account, portal or company
  status                TEXT NOT NULL CHECK (status IN
                          ('active', 'needs_reconnect', 'revoked', 'disabled')),
  status_reason         TEXT,                          -- 'invalid_grant', 'scope_removed', 'plan_downgraded'
  scopes_granted        TEXT[] NOT NULL,               -- what came back, not what was asked for
  access_token_enc      BYTEA,                         -- ciphertext; see Storing Tokens
  refresh_token_enc     BYTEA,
  token_key_id          TEXT,
  access_expires_at     TIMESTAMPTZ,
  api_version           TEXT,                          -- the version this connection is pinned to
  last_success_at       TIMESTAMPTZ,
  last_error_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, external_account_id)
);
```

- **Status is first-class.** `active`, `needs_reconnect` (the grant stopped working; a person must re-authorize), `revoked` (they disconnected it, on our side or theirs) and `disabled` (we paused it: a billing hold, an abuse case). Every sync job checks it first, and the product shows it.
- **The unique key is their account, not the user who clicked Connect.** The person who authorized it may leave the company; the connection belongs to the tenant. Record who installed it in the [audit trail](/docs/building-blocks/audit-trails), not as an owner the connection dies with.
- **Cursors and sync state live in their own table,** one row per connection and resource type (`contacts`, `invoices`), so a broken invoice sync doesn't reset the contact cursor.

## OAuth: Authorization Code With PKCE

When a customer grants access to their account at another company, the flow is the OAuth 2.0 authorization code grant, and my default is to use PKCE with it every time. The OAuth Security Best Current Practice (RFC 9700) makes PKCE mandatory for public clients and says that "for confidential clients, the use of PKCE is RECOMMENDED"; a server-side integration is a confidential client, and PKCE costs one hash. Use the `S256` method: RFC 7636 says a client that can use it "MUST use 'S256'". The step-by-step flow is the same one [SSO & Federation](/docs/security/sso-and-federation#openid-connect-is-the-default) draws for sign-in.

What's specific to integrations:

- **`state` binds the callback to the tenant.** Generate it per attempt, store it server-side with the tenant, the user, the requested scopes and the PKCE verifier, and accept the callback only for a `state` you issued and haven't used. Without it, an attacker can complete their own authorization in your user's session and connect *their* account to *your customer's* tenant.
- **Exact redirect URIs.** RFC 9700 requires authorization servers to use "exact string matching" for them; register one callback per environment and never a wildcard.
- **Ask for the scopes the feature needs, when it needs them.** Google's guidance is that "it is generally a best practice to request scopes incrementally, at the time access is required, rather than up front." Read-only calendar sync and "create events for me" are separate grants, requested when the customer turns on the second feature.
- **Record the scopes you got, not the ones you asked for.** RFC 6749 says that when the issued scope differs from the request, the server "MUST include the 'scope' response parameter to inform the client of the actual scope granted." Users can untick boxes. Store `scopes_granted` from the token response, and have each feature check it before calling, so a missing scope is a clear "reconnect to enable this" rather than a 403 deep in a job.
- **Admin consent and app installs are different flows.** Some providers install an app into a whole workspace or portal by an admin, others grant per user. Model which one you have, because a per-user grant breaks when that user is deprovisioned.

API keys pasted by the customer still exist for providers without OAuth. They go through the same connection record and token storage, with a clear note in the UI that the key is the customer's to rotate.

## Storing Tokens

Access tokens and refresh tokens are credentials to your customers' accounts at other companies. A database dump that includes them is a breach of every connected system at once.

- **Encrypt them at the application layer** with envelope encryption, the key wrapped by a KMS, as [Encryption at Rest](/docs/security/encryption-at-rest#envelope-encryption) describes. Bind the ciphertext to the connection ID as associated data, so a token copied onto another tenant's row fails to decrypt.
- **One code path decrypts them,** in the service that calls the provider. Nothing else reads the columns, nothing logs them, and error reporters scrub `Authorization` headers ([Sensitive Data](/docs/security/sensitive-data#logging-and-errors)).
- **Revoke on disconnect.** When the customer disconnects, call the provider's revocation endpoint where one exists, then delete the tokens, then set `revoked`. Keep the connection row and its history.

## Refresh Without Racing

Access tokens are short-lived and refresh tokens renew them. The trap is concurrency: ten workers syncing one connection all see an expired token and all refresh at once.

That's worse than wasteful, because refresh tokens increasingly rotate. RFC 6749 already says that when a new refresh token is issued, "the client MUST discard the old refresh token and replace it with the new refresh token," and RFC 9700 requires refresh tokens for public clients to be sender-constrained or rotated. Under rotation, a server that sees an already-used refresh token can't tell your second worker from an attacker, so it "will revoke the active refresh token" (RFC 9700, section 4.14.2). Your own race logs the customer out. Even without rotation, providers cap how many refresh tokens can be outstanding: Google has "a limit of 100 refresh tokens per Google Account per OAuth 2.0 client ID," and past it, "creating a new refresh token automatically invalidates the oldest refresh token without warning."

So refresh is **single-flight per connection**: one refresher at a time, everyone else waits and reuses its result. The simplest correct lock is the connection row itself:

```go tab="Go"
const refreshSkew = 2 * time.Minute

// AccessToken returns a usable token for a connection. The row lock makes the
// refresh single-flight: a second worker waits on the lock, then finds the
// token the first one saved, and never presents a rotated refresh token.
func AccessToken(ctx context.Context, begin func(context.Context) (Tx, error), p Provider, id string) (string, error) {
	tx, err := begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	c, err := tx.LockConnection(ctx, id) // SELECT ... FOR UPDATE
	if err != nil {
		return "", err
	}
	if c.Status != "active" {
		return "", ErrNeedsReconnect
	}
	if time.Until(c.ExpiresAt) > refreshSkew {
		return c.AccessToken, tx.Commit()
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second) // the lock is held for this call
	defer cancel()
	g, err := p.Refresh(ctx, c.RefreshToken)
	if errors.Is(err, ErrInvalidGrant) {
		if err := tx.MarkNeedsReconnect(ctx, id, "invalid_grant"); err != nil {
			return "", err
		}
		if err := tx.Commit(); err != nil {
			return "", err
		}
		return "", ErrNeedsReconnect
	}
	if err != nil {
		return "", err // transient: retry later, the old refresh token is still good
	}
	if g.RefreshToken == "" {
		g.RefreshToken = c.RefreshToken // the provider didn't rotate it
	}
	if err := tx.SaveGrant(ctx, id, g); err != nil {
		return "", err
	}
	return g.AccessToken, tx.Commit()
}
```

```rust tab="Rust"
const REFRESH_SKEW: Duration = Duration::from_secs(120);

/// A usable access token for a connection. The row lock makes the refresh
/// single-flight: a second worker waits on the lock, then finds the token the
/// first one saved, and never presents a rotated refresh token.
pub async fn access_token(mut tx: impl Tx, provider: &impl Provider, id: &str) -> Result<String, TokenError> {
    let conn = tx.lock_connection(id).await?; // SELECT ... FOR UPDATE
    if conn.status != Status::Active {
        return Err(TokenError::NeedsReconnect);
    }
    if conn.expires_at > SystemTime::now() + REFRESH_SKEW {
        tx.commit().await?;
        return Ok(conn.access_token);
    }

    // The provider client carries a short timeout: the row lock is held for this call.
    match provider.refresh(&conn.refresh_token).await {
        Ok(grant) => {
            // Keep the old refresh token when the provider didn't rotate it.
            let refresh = grant.refresh_token.as_deref().unwrap_or(&conn.refresh_token).to_owned();
            tx.save_grant(id, &grant, &refresh).await?;
            tx.commit().await?;
            Ok(grant.access_token)
        }
        Err(RefreshError::InvalidGrant) => {
            tx.mark_needs_reconnect(id, "invalid_grant").await?;
            tx.commit().await?;
            Err(TokenError::NeedsReconnect)
        }
        // Transient: retry later; the old refresh token is still good.
        Err(RefreshError::Transient(e)) => Err(TokenError::Transient(e)),
    }
}
```

- **Refresh ahead of expiry,** a couple of minutes early, so a token doesn't expire between the check and the call. A 401 on a call with a fresh token means the grant is gone, not that you should refresh in a loop.
- **`invalid_grant` means a person must act.** RFC 6749 defines it as a grant or refresh token that is "invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client." Retrying won't fix any of those. Mark the connection `needs_reconnect` and stop.
- **Save before you use.** With rotation, the new refresh token exists only in the provider's response. Persist it in the same transaction before anything else can fail; a crash between refresh and save loses the grant.
- **The lock spans an HTTP call,** which is the cost of this design: bound it with a timeout, and keep the transaction to this one row. At high volume, an advisory lock keyed by connection or a per-connection token service does the same job without holding a row lock.
- **Google's refresh tokens die on their own too,** for example when one "has not been used for six months," and its guidance is to "anticipate the possibility that a granted refresh token might no longer work." Every provider has some version of this. Design for it, don't enumerate it.

## Connection Health and Reconnect

Integrations fail quietly. The token expired, the customer's admin removed the app, their trial lapsed and the API now returns 402, the field you filter on was renamed. The sync job logs an error, retries, and the customer finds out from stale data weeks later.

- **Classify every failure into the connection's status,** not just a log line. Auth failures (`invalid_grant`, a 401 with a fresh token, a missing scope) go to `needs_reconnect` with a reason. Transient failures (timeouts, 5xx, 429) stay `active` and retry. Permanent data errors (one record that won't map) fail that record, not the connection.
- **Show it where the customer works.** A banner in the product ("Your HubSpot connection needs to be reconnected. Contacts last synced 3 days ago.") with a one-click reconnect that reuses the existing connection record, so history and mappings survive. Notify the tenant's admins once, through [Notifications](/docs/building-blocks/notifications), not on every failed job.
- **Track freshness, not just errors.** `last_success_at` per connection and resource type, and an alert when it's older than the sync interval should allow. A sync that stopped without erroring is the failure an error-rate alert misses.
- **Support sees the same page.** Status, reason, last success, recent errors and the provider's request IDs per connection, so "my contacts aren't syncing" is answered in one look ([Customer Support Operations](/docs/operations/customer-support)).

## Sync Strategies

Most integrations keep a copy of some of the provider's data: contacts, invoices, events, orders. There are three ways changes reach you, and a correct sync uses more than one.

![Three sources of change from a third-party API join one path: their webhook goes through an inbox that verifies, dedupes and acknowledges; a cursor poll reads changes since the saved cursor; a full resync runs on a 410 or as a nightly check. All three feed a change queue per connection, then a fetch-and-map step that reads the current object, then an accented upsert by external ID.](/diagrams/integrations-sync.svg "Every source of change ends in the same idempotent upsert, so a webhook, a poll and a resync that see the same change agree.")

**Incremental pull with a cursor.** Ask for what changed since the last cursor, apply it, then save the new cursor. Microsoft Graph's delta query is a clean example of the contract: you follow `@odata.nextLink` pages until you get an `@odata.deltaLink`, and the deltaLink is the cursor for next time. Its documentation also lists what every cursor-based sync has to handle:

- **Replays.** "Your application must be prepared for replays, which occur when the same change appears in subsequent responses." Applying a change must be idempotent.
- **Deletes arrive as tombstones.** Graph represents removed items "by their id and an @removed object." Without tombstones, a deleted record lives on in your copy forever.
- **Cursors expire.** Graph can return `410 Gone`, meaning "the application must restart with a full synchronization," and directory delta tokens are valid for seven days.

When a provider only offers `updated_since` filters rather than opaque cursors, overlap the window by a few minutes and dedupe, since clock skew and in-flight transactions on their side can commit a change with a timestamp earlier than one you've already read. Save the cursor only after the page is applied, in the same transaction where possible, so a crash re-reads a page instead of skipping one.

**Webhooks plus reconciliation.** Their webhooks cut latency from minutes to seconds, but they're a hint, not the record. Delivery fails, endpoints get misconfigured, events arrive out of order. Merge, a unified-API vendor, recommends "a combination of webhooks and polling," because "webhooks can fail for a variety of reasons such as downtime or failed processing," and suggests polling "every 24 hours" as the backstop. That's my default for any webhook-driven sync: the webhook triggers a fetch, and a scheduled pull with a cursor catches whatever the webhooks missed.

**Full resync.** Re-read everything and diff. It's the recovery path when a cursor expires, a mapping bug corrupted data, or a customer reconnects after a long gap, and it's how you find drift that incremental sync can't see. Run it as a [background job](/docs/architecture/background-jobs) at the lowest rate-limit priority, resumable by page, and make it a button support can press.

All three feed the same queue and the same apply step. An event from a webhook, a row from a delta page and a row from a full resync for the same object go through one function that fetches or reads the current state and upserts by external ID. Then it doesn't matter which source saw a change first, or how many did.

## Their Rate Limits Are Your Budget

Every provider limits you, usually per connection, sometimes per app across all your customers. HubSpot, for example, limits public OAuth apps so that "each HubSpot account that installs your app is limited to 110 requests every 10 seconds." Hitting that during a backfill means the customer's interactive request ("sync this deal now") fails behind your own batch job.

- **Read the headers you get.** Providers report remaining quota in their own headers (HubSpot's `X-HubSpot-RateLimit-Remaining`, among others), and some adopt the IETF `RateLimit` and `RateLimit-Policy` fields, still a draft (`draft-ietf-httpapi-ratelimit-headers-11`, May 2026). Parse what each provider sends into one internal shape: remaining, window reset, and which partition it applies to. [Rate Limiting](/docs/requests/rate-limiting#headers) has the header semantics.
- **Honor `Retry-After` on a 429.** RFC 6585 says a 429 response "MAY include a Retry-After header indicating how long to wait," and RFC 9110 lets the value be either an HTTP date or a number of seconds. Parse both. Wait at least that long, for that connection only.
- **Budget per connection on your side.** A token bucket per connection (and one per app, where the provider limits the app too), sized just under their published limit, that every caller takes from before calling. Your workers then slow down before the provider says no, instead of discovering the limit with a burst of 429s.
- **Prioritize.** Interactive requests first, webhook-triggered fetches second, scheduled polls third, backfills and full resyncs last. A backfill that can use the whole budget should yield the moment anything else needs it.
- **Circuit-break per connection.** A provider outage or one tenant's broken account shouldn't fill your queues with retries. Exponential backoff with jitter, a retry budget and a breaker per connection are in [Retries & Timeouts](/docs/architecture/retries-and-timeouts#circuit-breakers).

## Receiving Their Webhooks

The receiving rules in [Webhooks](/docs/api-design/webhooks#consumer-expectations) apply as written: verify before parsing, acknowledge fast and process from a queue, dedupe by event ID, don't trust order, subscribe only to what you handle. As the receiver of many providers' webhooks, a few more things matter.

- **Every provider signs differently.** Stripe signs `timestamp.body` with HMAC-SHA256 into a `Stripe-Signature` header and requires the raw body ("any manipulation to the raw body of the request causes the verification to fail"); its libraries reject timestamps older than five minutes by default. Others use other headers, encodings and tolerances. Use each provider's official verification library where one exists, and route the raw body to it untouched.
- **Find the connection from the payload.** One endpoint per provider receives events for every tenant; the account or portal ID in the event maps to a connection through the unique key above. An event for an unknown or revoked connection is acknowledged and dropped, not retried forever.
- **Know their timeout and retry policy.** GitHub says your server "should respond with a 2XX response within 10 seconds," and "GitHub does not automatically redeliver failed deliveries." Stripe retries "for up to three days with an exponential back off in live mode." A provider that doesn't retry makes reconciliation polling mandatory, not optional.
- **Fetch, don't trust the payload.** Stripe "doesn't guarantee the delivery of events in the order that they're generated" and suggests using the API "to retrieve any missing objects." The event tells you what to look at; the current object from their API is what you apply. Stripe now offers "thin" events that carry little more than the ID for this reason.
- **Store the raw event** in an inbox table before acknowledging, with the provider's event ID under a unique constraint. Processing from the inbox is then a retryable [background job](/docs/architecture/background-jobs), and a bad deploy can replay the inbox instead of asking the provider to resend.

## Mapping Their Schema to Yours

Their `Contact` is not your `Customer`. Keep the translation in one place per provider, an adapter that turns their objects into your domain's commands, so their field names, enums and quirks never leak past it.

- **External IDs in a crosswalk.** Store `(connection_id, external_type, external_id) → internal_id` for every linked record, never their ID as your primary key. When two connections or a manual entry describe the same real-world thing, the matching and merge rules are [Record Linkage](/docs/building-blocks/record-linkage#crosswalks-of-external-ids)'s.
- **Decide who owns each field.** If both systems can edit a phone number, a two-way sync without an ownership rule ping-pongs forever. Per field: theirs wins, ours wins, or most recent wins with the provider's timestamp. [Survivorship per field](/docs/building-blocks/record-linkage#survivorship-per-field) is the same idea.
- **Unknown enum values are data, not crashes.** A provider adds a new deal stage and your strict parser fails the whole page. Map unknowns to an explicit `other` with the raw value kept, and alert on the first occurrence.
- **Keep the raw payload** for a while alongside the mapped record, so a mapping bug can be fixed and replayed without re-fetching, within your [retention](/docs/building-blocks/data-retention) rules for their data.
- **Writes back need idempotency.** When you create records in their system, send an idempotency key if they accept one, or create-then-record the external ID in a crosswalk row you check before retrying. A retried "create invoice" that makes two invoices in a customer's accounting system is a support ticket you'll get ([Idempotency](/docs/requests/idempotency#idempotency-beyond-the-api)).

## When They Change Their API

Their release schedule isn't yours. Shopify "releases a new API version every three months," supports each stable version "for a minimum of 12 months," and when a version is retired, "Shopify falls forward and responds using the oldest accessible stable version." Code that didn't upgrade doesn't break loudly; it silently gets a newer API.

- **Pin the version explicitly** on every request (header or URL), store it on the connection, and check the version the response reports when the provider echoes one back.
- **Keep a calendar.** Each provider's deprecation dates, owned by the team that owns the adapter, reviewed quarterly. Provider changelogs and deprecation emails go to a shared list, not one engineer's inbox.
- **Webhook payloads have versions too.** Stripe structures an event by the account's API version at the time the event occurred, and "you can't change Event objects after creation." Upgrading the API version without upgrading the webhook parser breaks in the gap.
- **Contract tests on recorded fixtures.** Real responses (scrubbed) from each version, replayed through the adapter in CI, so an upgrade shows exactly which mappings changed before production does.

## Sandboxes and Testing

Use the provider's sandbox for development, but don't mistake it for production. Sandboxes often behave differently in ways that matter: Stripe retries live-mode webhooks for three days but sandbox events "three times over the course of a few hours."

- **Unit-test the adapter against recorded fixtures,** including error responses: 401, 403 for a missing scope, 404 for a deleted object, 429 with `Retry-After`, 410 for an expired cursor, a malformed page.
- **Run a fake provider** in integration tests, a small HTTP server that serves fixtures and can be told to fail, so token refresh, the reconnect path, rate-limit backoff and cursor expiry are tested on every build. The races in particular (two workers, one expired token) need a test, not a hope.
- **Keep one real test account per provider** for a scheduled smoke test against the live API: connect, read, write, webhook received. It catches the change the fixtures don't know about yet.

## Build, or Buy a Unified API

Unified-API vendors put many providers behind one interface. Merge organizes data into "Common Models" per category (an ATS candidate, an HRIS employee), runs the syncs and reports per-model sync status. Nango says it "handles OAuth, API keys, token refresh, scopes, permissions, and credential storage" across more than a thousand APIs, with syncs you define, and offers an open-source deployment. Others sit at different points on the same spectrum, from managed auth only to fully normalized data.

What you get: auth flows, token refresh and rate-limit handling for a long tail of providers you'd never build yourself, and a sales story ("we integrate with 40 HR systems") on day one. What it costs:

- **A common model is a lowest common denominator.** The fields every provider shares are the ones that matter least; the one field your customers need from one provider usually needs a passthrough call anyway.
- **Their data flows through another processor.** The vendor sees or stores your customers' data from the source system, which goes in your subprocessor list and your DPA ([GDPR & Privacy](/docs/compliance/gdpr#controllers-processors-and-the-dpa)).
- **Their outage is your outage** for every integration at once, and their sync latency sits on top of the provider's.
- **Pricing usually scales with connections,** which is fine at forty customers and a line item at four thousand.

My default: **build the integrations that are the product in-house, and use a unified API for the long tail of a category.** If your field service product lives or dies on its accounting sync, that adapter is core code you own end to end. If customers ask for "any HRIS" so you can import an employee list once, a unified API is the right buy. Either way, keep your own connection record and crosswalk, so moving a provider in-house later is an adapter swap, not a migration. Multi-step jobs that span several calls and wait on the provider are a good fit for a [workflow engine](/docs/building-blocks/workflows).

## Checklist

- **One connection record per tenant and provider account,** with a status, a reason and last-success timestamps.
- **Authorization code with PKCE (`S256`)** and a `state` bound to the tenant; record the scopes actually granted.
- **Tokens encrypted with envelope encryption,** bound to the connection, decrypted in one place, revoked on disconnect.
- **Single-flight refresh** per connection, ahead of expiry; save rotated tokens before anything else; `invalid_grant` means reconnect.
- **Health in the product:** reconnect banners, admin notification once, freshness alerts.
- **Webhooks plus a cursor poll,** with full resync as the recovery path, all through one idempotent upsert by external ID.
- **A budget per connection** under their published limit, `Retry-After` honored, interactive work first.
- **Verify every provider's webhooks with its own scheme,** store raw events in an inbox, fetch the current object.
- **An adapter per provider,** external IDs in a crosswalk, field ownership decided, unknown enums tolerated.
- **Pinned API versions,** a deprecation calendar and contract tests on recorded fixtures.
- **Build the core integrations,** buy the long tail.

## References

**Specifications**

- [RFC 6749: The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749), granted scope in the token response, `invalid_grant`, and discarding a replaced refresh token
- [RFC 7636: Proof Key for Code Exchange](https://www.rfc-editor.org/rfc/rfc7636), the `S256` code challenge method
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700), PKCE for confidential clients, exact redirect URI matching, refresh token rotation and revocation on reuse
- [RFC 6585: Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585#section-4), `429 Too Many Requests` and `Retry-After`
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110#name-retry-after), `Retry-After` as an HTTP date or delay in seconds
- [IETF: RateLimit header fields for HTTP](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), the `RateLimit` and `RateLimit-Policy` draft and its partition keys

**Reference**

- [Google: Using OAuth 2.0 to access Google APIs](https://developers.google.com/identity/protocols/oauth2), incremental scopes, refresh token expiry and the 100-token limit
- [Microsoft Graph: Delta query overview](https://learn.microsoft.com/en-us/graph/delta-query-overview), delta and next links, replays, `@removed` tombstones, `410 Gone` resync and token lifetimes
- [Stripe: Receive events in your webhook endpoint](https://docs.stripe.com/webhooks), raw-body signature verification, quick 2xx, retries, ordering, duplicates and event API versions
- [GitHub: Best practices for using webhooks](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks), the 10-second response window and `X-GitHub-Delivery`
- [GitHub: Handling failed webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries), no automatic redelivery
- [HubSpot: API usage guidelines and limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines), per-account limits for OAuth apps and rate-limit headers
- [Shopify: API versioning](https://shopify.dev/docs/api/usage/versioning), quarterly versions, 12-month support and falling forward

**In practice**

- [Merge: Syncing data](https://docs.merge.dev/basics/syncing-data/), common models, sync status, and combining webhooks with polling
- [Nango: Introduction](https://nango.dev/docs/getting-started/intro-to-nango), managed auth, token refresh and syncs across many APIs
