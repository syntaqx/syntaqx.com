+++
title = "ACME & Certificates at Hosting Scale"
nav_title = "ACME at Hosting Scale"
description = "RFC 8555, ARI and profiles, Let's Encrypt's rate limits, and issuing and renewing certificates for millions of hosted sites, AutoSSL included."
category = "Hosting & Cloud Industry"
order = 2171
part = "Certificates"
tags = ["certificates", "acme", "lets-encrypt", "ari", "autossl", "tls"]
+++

Every hosting provider now gives every hostname a certificate, free, without the customer doing anything. That promise is a pipeline: notice a new hostname, check that its DNS points at the provider and that CAA allows the provider's CA, order a certificate over ACME, publish a challenge everywhere the CA might look, finalize, deploy the certificate to every server or edge location that serves the name, and then do it all again before the certificate expires, for every hostname, forever. At a few hundred sites it's a cron job. At millions it's one of the busiest systems the provider runs, bound by someone else's rate limits, someone else's lifetime rules and the customer's DNS, which the provider usually doesn't control.

The protocol that made it possible is ACME, RFC 8555, published in March 2019. Let's Encrypt went live with its first trusted certificate on 14 Sep 2015, passed one billion certificates issued in 2020, and first reached ten million certificates in a day in late September 2025. Most of that volume is hosts, platforms and CDNs issuing on behalf of customers who never see an ACME client.

This chapter covers how the hosts and platforms do it, how ACME works with its newer extensions (renewal information, profiles, the persistent DNS method), the problems that only appear at hosting scale (rate limits, renewal storms, names whose DNS isn't pointed yet, wildcards, failure handling), the control panel's version of the same pipeline in AutoSSL, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `acme_accounts`, `certificate_orders` and `dcv_challenges`. The trust rules the CA follows (validation methods, CAA, multi-perspective checks, CT) are [The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki); the lifetime schedule, revocation and moving off a distrusted CA are [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust).

## How the Providers Do It

How hosts and platforms issue certificates for customer hostnames, as of October 2026:

| Host or platform | CA | How it validates | Wildcards | Renewal | Notes |
| --- | --- | --- | --- | --- | --- |
| **cPanel & WHM (AutoSSL)** | Let's Encrypt is the default provider in current docs (v118 and later); "cPanel (powered by Sectigo)" was the default in earlier versions | HTTP and DNS; a parent domain's validation can cover its subdomains | Through the Let's Encrypt provider; the Sectigo provider didn't issue them | Runs nightly in `upcp`, after account creation, or on demand | Can replace other certificates that are invalid or expire within three days |
| **Cloudflare** | Let's Encrypt, Google Trust Services, SSL.com; Sectigo for backup certificates | Issued once the domain is active on Cloudflare | First-level subdomains on a full setup; deeper levels need Total TLS or Advanced certificates | Automatic | Universal SSL covers the apex and first-level subdomains on a full setup, free on every plan |
| **Vercel** | Let's Encrypt | `http-01` for each hostname, `dns-01` for wildcards | Only with Vercel nameservers | 14 to 30 days before expiry | `/.well-known` is reserved and can't be redirected or rewritten; team owners are notified of failed renewals |
| **Netlify** | Let's Encrypt | Managed by Netlify once DNS is configured | Automatic wildcard with Netlify DNS | Automatic for Netlify-managed certificates; manual for uploaded ones | Warns that more than five aliases under one domain can hit Let's Encrypt rate limits |
| **AWS Certificate Manager** | Amazon Trust Services | DNS (automatic renewal), email (manual), HTTP through CloudFront only | DNS or email validation | Managed renewal for certificates in use or exported; ACME-issued ones renew through the client | 198-day certificates; regional, so one per region |
| **Caddy** (server software many platforms embed) | Let's Encrypt, then ZeroSSL as fallback | ACME challenges in turn | `dns-01` only, as for any ACME client | Background renewal; on failure, backoff to at most a day between attempts, for up to 30 days | On-Demand TLS obtains a certificate during the first handshake and must be restricted by an "ask" endpoint |

What the table shows:

- **Let's Encrypt is the default almost everywhere,** and the platforms that add a second CA (Cloudflare, Caddy) do it for resilience, not price.
- **Wildcards follow DNS.** Every platform that offers wildcards ties them to running the customer's DNS, because only DNS validation can cover a parent name.
- **Renewal timing is the platform's choice, not the customer's,** and it is moving from fixed windows toward the CA telling the client when to renew.

## How ACME Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 14 Sep 2015 | Let's Encrypt's first certificate | DV certificates cost money and manual steps | A CA run as a nonprofit on sponsorship |
| 2016 | cPanel AutoSSL in version 58, on by default for new servers in version 60 (announced 17 Nov 2016), issuing free 90-day certificates signed by Comodo | Shared hosting customers had to buy and install certificates | A panel-wide nightly job against a CA's limits |
| 2018 | Let's Encrypt adds wildcard support | Many hostnames under one name needed one certificate each | Wildcards require DNS validation |
| Mar 2019 | RFC 8555 published | A standard protocol, so any client works with any CA | CAs and clients implement one specification and its extensions |
| 2020 | RFC 8737, `tls-alpn-01` | Validation when port 80 is unavailable | Support needed in the TLS terminator itself |
| 2020 | Let's Encrypt reaches one billion certificates issued | | |
| 2025 | RFC 9773, ACME Renewal Information | Clients renewing on fixed timers, and no way for a CA to ask for early renewal | Clients poll a new endpoint |
| Late Sep 2025 | Ten million Let's Encrypt certificates in one day | | |
| 15 Jan 2026 | Short-lived (160-hour) and IP address certificates generally available | Revocation that doesn't protect anyone | Renewal every few days |
| 18 Feb 2026 | Let's Encrypt announces DNS-PERSIST-01, production targeted for Q2 2026 | DNS write access in every issuance path | Account key protection becomes the central concern |
| 13 May 2026 | `tlsserver` profile moves to 45 days | Preparing for the 47-day limit | Opt-in |
| 10 Feb 2027, 16 Feb 2028 | `classic` moves to 64 days, then 45 days | The default catching up with the Baseline Requirements | Every client on a fixed 60-day timer breaks |

## How ACME Works

ACME is a JSON API over HTTPS in which every request is signed by the client's account key (a JWS), and reads are "POST-as-GET" so they are signed too. The objects, in RFC 8555's terms:

- **Directory.** One URL that lists the others: `newNonce`, `newAccount`, `newOrder`, `revokeCert`, `keyChange`, optionally `newAuthz`, and a `meta` object with `termsOfService`, `website`, `caaIdentities` and `externalAccountRequired`. Extensions add fields: ARI adds `renewalInfo`, and a CA that offers profiles lists them here.
- **Account.** Created with `newAccount`, identified by a URL. That URL is what a CAA `accounturi` parameter pins. A CA that sets `externalAccountRequired` (Google Trust Services, ZeroSSL, the commercial CAs) requires an **External Account Binding**: a key identifier and MAC key issued out of band, with which the client binds the new ACME account to a customer account the CA already has.
- **Order.** Created with `newOrder` and a list of `identifiers` (DNS names, and IP addresses where the CA supports them). It carries `status`, `expires`, `authorizations`, a `finalize` URL and, once issued, a `certificate` URL. Statuses: `pending`, `ready`, `processing`, `valid`, `invalid`.
- **Authorization.** One per identifier: proof that this account controls this name, with statuses `pending`, `valid`, `invalid`, `deactivated`, `expired`, `revoked`. A wildcard order's authorization names the base domain with `wildcard: true`. A valid authorization can be reused by later orders until it expires, within the CA's reuse period.
- **Challenge.** The ways to satisfy an authorization, each with a `token` and status `pending`, `processing`, `valid` or `invalid`. The client publishes the response and POSTs to the challenge URL to tell the CA to check.
- **Finalize and download.** When every authorization is valid the order is `ready`; the client POSTs a CSR naming exactly the order's identifiers to `finalize`; the order moves through `processing` to `valid`, and the certificate URL returns `application/pem-certificate-chain`, with `Link: rel="alternate"` headers for other chains.

Errors are typed problem documents. Two shape every client: `badNonce` (retry with the fresh nonce the response carries) and `rateLimited`, which "SHOULD" come with a `Retry-After` header that the client has to honor.

### Challenge types

The token-based challenges build their response from the **key authorization**, `token || '.' || base64url(Thumbprint(accountKey))`, which binds the proof to the account.

| Challenge | Where the response goes | Port | Covers wildcards | Fits | Fails when |
| --- | --- | --- | --- | --- | --- |
| **`http-01`** | `/.well-known/acme-challenge/<token>` over HTTP; the CA follows redirects (Let's Encrypt: up to 10, to `http:` or `https:` on ports 80 or 443) | 80 | No | Any site the host serves; CNAMEd customer domains | Port 80 blocked; one server of several lacks the file |
| **`dns-01`** | TXT at `_acme-challenge.<name>`: base64url SHA-256 of the key authorization | DNS | Yes | Wildcards; servers not on the internet | The host has no write access to the zone; slow propagation; DNS API credentials on web servers |
| **`tls-alpn-01`** (RFC 8737) | A TLS handshake on a dedicated ALPN protocol, per RFC 8737 | 443 | No | TLS-terminating proxies at large hosts | Limited client support; every terminator must answer |
| **`dns-persist-01`** (BR method 3.2.2.4.22) | A standing TXT at `_validation-persist.<name>` naming the CA and the `accounturi`, with optional `policy=wildcard` and `persistUntil` | DNS | With `policy=wildcard` | A customer who sets one record once; multi-tenant platforms | The account key is compromised; validation reuse is capped at 10 days |

Let's Encrypt follows CNAME and NS records for `_acme-challenge`, so a customer can point `_acme-challenge.example.com` at a zone the host controls and let the host answer `dns-01` without access to the rest of the customer's DNS. That one delegated record is how a host offers wildcards on domains whose DNS lives elsewhere.

### Renewal information

**ACME Renewal Information** (ARI, RFC 9773, 2025, by Aaron Gable of ISRG) moves the decision of when to renew from the client to the CA. The directory gains a `renewalInfo` URL; the client sends an unauthenticated GET to it with a certificate identifier made of the base64url authority key identifier, a period, and the base64url serial number. The response is a `suggestedWindow` with `start` and `end` and an optional `explanationURL`, and a `Retry-After` header that says when to ask again.

The client's rules, from the RFC:

- **Pick a uniform random time inside the window.** If it has passed, renew now; if not, schedule it. Randomness is the point: it spreads a CA's renewals across the window instead of the top of the hour.
- **Poll on the server's clock.** `Retry-After` is the desired wait, clamped to at least one minute and treated as at most a day. On temporary errors, back off exponentially; on long-term errors, check again after about six hours. Stop checking once the certificate is replaced or expired.
- **Say what you're replacing.** A new order should carry `replaces` with the predecessor's identifier; the CA checks it's the same account and an overlapping name, and returns `409 alreadyReplaced` if that certificate has already been replaced.

The CA's side is the reason it exists: a CA preparing to revoke certificates, or trying to spread a renewal spike, moves the window earlier and shortens `Retry-After`, and every ARI client renews on time without an email being read. Let's Encrypt makes it worth implementing: renewals coordinated through ARI are "exempt from all rate limits," as long as the new order shares an identifier with the certificate it replaces and that certificate wasn't already replaced.

### Profiles

A profile is a named certificate shape the client selects at order time, following an Internet-Draft (`draft-aaron-acme-profiles`) that Let's Encrypt is helping take to an RFC. Let's Encrypt's profiles, as of October 2026:

| | `classic` (default) | `tlsserver` | `shortlived` |
| --- | --- | --- | --- |
| Validity | 90 days | 45 days | 160 hours |
| Authorization reuse | 30 days | 7 hours | 7 hours |
| Pending authorization lifetime | 7 days | 1 hour | 1 hour |
| Order lifetime | 7 days | 8 hours | 8 hours |
| Names per certificate | 100 | 25 | 25 |
| Identifiers | DNS | DNS | DNS and IP |

The rows below validity are the ones that change a host's design. On `tlsserver` an order must finish within 8 hours and an authorization is reused for only 7 hours, so a pipeline that orders on Monday and publishes challenges on Tuesday no longer works, and every renewal is effectively a fresh validation. That is where `classic` is going too: 10-day authorization reuse from 10 Feb 2027 and 7 hours from 16 Feb 2028.

## Issuing for Millions of Sites

### Accounts and certificate shape

Let's Encrypt's integration guide recommends a single ACME account for most large hosting providers, "with the account key guarded carefully": it makes certificates easier to identify and rate limit overrides possible. One account per customer limits the damage of a stolen key but can't be given higher limits. The account key belongs in a KMS or HSM, with signing done there ([KMS or HSM](/docs/security/encryption-at-rest#kms-or-hsm)); it is the one secret that can obtain a certificate for every name the provider serves, and with `dns-persist-01` it becomes the whole of the authorization.

On certificate shape the guide leaves the choice "up to you": one certificate per hostname keeps adding and removing names simple and handshakes small; bundling many names (up to 100 on `classic`, 25 on the newer profiles) reduces how many certificates exist. At hosting scale the per-hostname shape wins on failure isolation: a bundled certificate fails to renew if any one of its names stops validating, which on shared hosting means one customer's expired domain can take down another customer's certificate. AutoSSL's large multi-domain certificates (1,000 domains per certificate on the older Sectigo-powered provider) sit at the bundling end of that choice.

### Rate limits

Let's Encrypt's limits are the envelope a host designs inside. As of its 5 Aug 2026 documentation:

| Limit | Allowance | Refill | Override |
| --- | --- | --- | --- |
| New orders per account | 300 per 3 hours | 1 per 36 seconds | Yes |
| New certificates per registered domain | 50 per 7 days | 1 per 202 minutes | Yes |
| Duplicate certificates (same set of identifiers) | 5 per 7 days | 1 per 34 hours | No |
| Authorization failures per identifier per account | 5 per hour | 1 every 12 minutes | No |
| Consecutive authorization failures per identifier per account | 1,152 | 1 per day; resets on success | No |
| New registrations per IP | 10 per 3 hours | 1 per 18 minutes | No |
| New registrations per IPv6 /48 | 500 per 3 hours | 1 per 22 seconds | No |

Per-endpoint request limits sit on top (`/acme/new-order` 300 requests a second per IP, `/acme/renewal-info` 1,000), returning HTTP 503 with `Retry-After` when exceeded. Renewals through ARI are exempt from all of these; other renewals of the same identifier set skip the order and registered-domain limits but still count toward authorization failures and duplicates. Overrides exist only for orders per account and certificates per registered domain, are requested through a form, and take "a few weeks," so they are capacity planning, not incident response.

Two of these limits are hosting problems specifically. **Certificates per registered domain** counts every name under one registered domain together, so a platform that gives each customer a subdomain of its own domain shares 50 new certificates a week across all of them until it gets an override. **Consecutive authorization failures** punishes exactly what a careless host does: retrying validation for a domain whose customer pointed it elsewhere, every night, until the identifier is paused. The integration guide's other warning is about storage: recreating many servers at once and having each one order a fresh certificate can exhaust the limits and leave sites without certificates "for several days," so servers should "first try to use a certificate and private key from durable storage."

### Renewal scheduling

> [!WARNING]
> Let's Encrypt says it plainly: "renewing at a hardcoded interval of 60 days will no longer be sufficient." From 10 Feb 2027 its default certificates last 64 days and from 16 Feb 2028, 45. A host whose renewal job is a fixed number of days after issuance will start serving expired certificates on a date it can look up today.

The schedule that holds as lifetimes shrink:

1. **Ask the CA.** Check ARI for each certificate at least twice a day, as the integration guide recommends, and renew at a random time inside the suggested window.
2. **Fall back to a fraction of the lifetime.** Without ARI, renew when a third of the lifetime remains (about 30 days for a 90-day certificate), or halfway through for certificates valid under 10 days. A fraction survives a lifetime change; a day count doesn't.
3. **Spread the load.** Above 10,000 hostnames, renew in small automated batches; after a bulk issuance, renew some certificates a day or two early to break up the cohort; run batch jobs at a random time of day rather than on the hour.
4. **Order only what's needed.** Renew with `replaces`, keep the identifier set stable, and never re-order a certificate that is already valid in durable storage.

The same arithmetic decides the failure budget. With a 90-day certificate renewed at 60 days, a host has 30 days to notice and fix a failed renewal; with 45 days renewed at two-thirds, about 15; with a 160-hour certificate renewed halfway, about three days. Monitoring has to alert on "renewal overdue against plan," not on "expires soon," or the alert arrives after the margin is spent.

### When DNS isn't pointed yet

The commonest certificate failure at a host isn't the CA. It's a customer who added a domain in the control panel but hasn't changed their nameservers or records yet, or moved them away and left the domain configured. Vercel's documentation describes the normal case: the platform "will automatically try to generate a certificate for every domain once it is added," but issuance works "once DNS records are added and propagated."

What a host does about it:

- **Preflight before ordering.** Resolve the name from outside: does it point at the provider's servers or edge, and does CAA (with tree climbing) allow the provider's CA? If not, don't create an ACME order; mark the hostname as awaiting DNS and tell the customer exactly which record is missing. Every order that fails validation spends authorization-failure budget and moves the identifier toward a pause.
- **Recheck with backoff, then stop.** Poll the DNS on a widening interval, and after a few weeks of no change stop trying and leave the site on HTTP with a visible warning, rather than asking a CA forever.
- **Mind the routes the CA uses.** Since September 2025 a CA blocks issuance when its remote perspectives disagree, so a name that resolves correctly from the host's own network but not from other regions still fails ([Multi-Perspective Issuance Corroboration](/books/hosting-and-cloud/web-pki#multi-perspective-issuance-corroboration)).
- **Gate on-demand issuance.** A TLS terminator that obtains certificates during the first handshake for any name a client sends will order for names an attacker chooses. Caddy's documentation says on-demand TLS "must be both enabled and restricted to prevent abuse," with an "ask" endpoint the server queries before issuing; the answer should come from the provider's own record of which hostnames are configured and pointed.

### Wildcards and dns-01

A wildcard needs a DNS method, so a host can issue one only where it can write a TXT record: when it runs the customer's DNS (Vercel requires its nameservers for wildcards; Netlify issues a wildcard automatically with Netlify DNS), when the customer has delegated `_acme-challenge` to the host by CNAME or NS, or, as `dns-persist-01` rolls out, when the customer has published a persistent record naming the host's account with `policy=wildcard`.

For `dns-01` at scale, the integration guide's advice: the TXT record must be present on every authoritative server before the client asks the CA to check (with multi-perspective validation, a lagging secondary is a failure), and old TXT records should be cleaned up so responses stay small. DNS API credentials on web servers are the risk Let's Encrypt names for this method, which argues for a central issuance service that holds them, not the fleet.

### Central issuance and challenge serving

With many front ends, the guide recommends a smaller set of servers that manage issuance: front ends redirect `/.well-known/acme-challenge/` to a validation service, which also stores certificates and keys durably. The guide's caveat is that this "delegates responsibility for issuance," so the validation service is as sensitive as the account key. The other requirement is consistency: every server that could answer for the name must answer the challenge the same way, from every network the CA checks from. Ports matter too: outbound 443 from the ACME client, inbound 80 for `http-01`, inbound 53 over TCP and UDP for DNS, and port 80 kept open to redirect to HTTPS.

### Failure handling

Renewal failure "should not be treated as a fatal error." The guide's schedule is exponential backoff with no more than one attempt per day per certificate after the first few (1 minute, 10 minutes, 100 minutes, then daily), tracking failures as well as successes, letting administrators request an early retry, and sending errors to whoever is responsible. Caddy's defaults are similar: retry once, try the next challenge type, try the next issuer, then back off to at most a day between attempts for up to 30 days. The general pattern is the playbook's [Exponential Backoff With Jitter](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter); what is specific here is that the backoff is per identifier, because the CA's failure limits are per identifier.

Failures have different owners, and the pipeline should sort them: `rateLimited` and 5xx are the provider's problem and retry on `Retry-After`; a CAA refusal, an unpointed name and a failed challenge are the customer's and need a notice with the fix ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)), re-checked before sending so a customer who fixed DNS an hour ago isn't told it's still broken. A CA outage or a refusal that affects many names at once is a reason to switch to the fallback CA for new orders, which only works if the fallback's account, CAA identity and client path were exercised before the outage.

## AutoSSL

AutoSSL is cPanel & WHM's built-in version of this pipeline for shared hosting; the panel side is [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#autossl). The parts that matter here:

- **When it runs.** Nightly during `upcp` (the panel's update script), from the task queue after an account is created, and on demand (`autossl_check --all` or the per-user check). A new account gets a certificate the same night or sooner, not when its customer asks.
- **Providers.** The current documentation (version 118 and later) names Let's Encrypt as the default provider included with the license, with "Disabled" as the alternative. The version 88 documentation named "cPanel (powered by Sectigo)" as the default, credited it with 1,000 domains per certificate, said it did not issue wildcards, and warned that some certificates could take up to 48 hours.
- **Ancestor DCV.** Validating a parent domain counts for its subdomains, which saves authorizations on accounts with many subdomains.
- **Replacing other certificates.** When enabled, AutoSSL replaces certificates that are invalid or expire "within three days," which the documentation warns against for paid OV and EV certificates since they'd be replaced by DV.
- **Logs.** In `/var/cpanel/logs/autossl`, as text and JSON, kept 30 days.

A nightly batch per server is a good fit for 90-day certificates and a weak one for short lifetimes and ARI windows: a certificate whose suggested window opens at 14:00 waits for the night, and a server that misses a few nights has spent a meaningful share of a 45-day certificate's margin. A host running AutoSSL fleet-wide should watch per-server success, not just per-certificate expiry.

## The Alternatives

Where a host's certificates can come from:

| Approach | Model | Strengths | Failure modes | Ownership | Cost |
| --- | --- | --- | --- | --- | --- |
| **Own ACME pipeline, free CA primary, second CA fallback** | The host orders, validates and deploys for every hostname | Full control of preflight, scheduling, CA choice and notices | The host owns rate limits, DNS edge cases and the account key | The host; open CAs | Engineering and operations |
| **Commercial CA over ACME with EAB** | Same pipeline, a contracted CA | Support, contractual limits, OV and EV through one protocol | Contract and price; the CA can still be distrusted | Commercial CA | Per certificate or volume contract |
| **Panel-managed (AutoSSL)** | The control panel issues per server, nightly | Zero integration work for shared hosting | Batch timing, per-server visibility, the panel's provider choices | Panel vendor | Included in the panel license |
| **Platform-managed (ACM, a CDN's edge certificates)** | The cloud or CDN issues and renews for its own endpoints | No certificate operations at all | Certificate tied to that platform; key often can't leave | Cloud or CDN | Free with the service |
| **On-demand at the TLS terminator** (Caddy's model) | Certificate obtained at first handshake | No pre-provisioning; handles names added at any time | Abuse without an ask gate; slow first handshake | The host | Engineering |
| **Customer uploads their own** | Customer buys from any CA and uploads | Any CA, OV and EV | Manual renewal; expiry becomes the host's support ticket | The customer | The customer's CA bill |

And the certificate shapes, side by side:

| Shape | Covers | Validation | Best for | Risk |
| --- | --- | --- | --- | --- |
| **One certificate per hostname** | One name (plus `www` if wanted) | Any challenge | Shared hosting, platforms with customer domains | More certificates, more orders |
| **Per-customer SAN bundle** | A customer's names | Any challenge per name | Control panel accounts | One failing name blocks the renewal of all |
| **Wildcard** | One level of subdomains | DNS only | Platforms with many subdomains of one domain, when the host runs DNS | Key covers everything under the name; needs zone write access |

## My Default

My default is an issuance service the host owns: one ACME account per CA with the key in a KMS, Let's Encrypt as primary and a second free ACME CA configured and tested monthly as fallback, one certificate per hostname, a DNS and CAA preflight before any order, ARI-driven renewal with a two-thirds-of-lifetime fallback, and a per-identifier backoff that stops ordering for names that aren't pointed. Certificates and keys live in durable encrypted storage and are pushed to servers, never ordered by servers. That design keeps every limit that matters (orders, failures per identifier, the account key) in one place where it can be watched, and it is indifferent to lifetimes: when `classic` drops to 64 days in February 2027 nothing changes but how often ARI says to renew.

I'd use the `tlsserver` profile now for hostnames the host fully controls (its own platform subdomains, names on its DNS), because 8-hour orders and 7-hour authorization reuse are where the default profile ends up in 2028, and finding the pipeline's slow steps a year early is cheaper. I'd keep AutoSSL for a cPanel fleet that is small enough that per-server batch timing doesn't matter, and replace it with the central service once the fleet is large enough that "which servers didn't run AutoSSL last night" becomes a question. The tradeoff that would change this is size: below a few thousand hostnames, the platform-managed option or the panel's built-in job is cheaper than any pipeline a team builds.

## How to Build It

The chapter adds `acme_accounts`, `certificate_orders` and `dcv_challenges`, and ARI columns on the core `certificates` side table. CAs, their certificates, `certificate_names` and `ct_submissions` are [The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki#how-to-build-it)'s; revocations and CA migrations are [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#how-to-build-it)'s, and a migration's orders are ordinary `certificate_orders` rows with their reason set.

```sql
CREATE TABLE acme_accounts (             -- the provider's account at a CA
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  ca_id           UUID NOT NULL REFERENCES certificate_authorities (id),
  environment     TEXT NOT NULL CHECK (environment IN ('production', 'staging')),
  account_url     TEXT NOT NULL UNIQUE,   -- what a CAA accounturi pins
  key_ref         TEXT NOT NULL,          -- KMS key id; signing happens in the KMS
  eab_key_id      TEXT,                   -- the CA's EAB key identifier, when required
  status          TEXT NOT NULL CHECK (status IN ('valid', 'deactivated', 'revoked')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certificate_orders (        -- one attempt to obtain one certificate
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id              UUID NOT NULL REFERENCES accounts (id),   -- the customer
  target_resource_id      UUID NOT NULL REFERENCES resources (id),  -- site or hosting account
  ca_id                   UUID NOT NULL REFERENCES certificate_authorities (id),
  acme_account_id         UUID REFERENCES acme_accounts (id),
  profile                 TEXT,           -- 'classic', 'tlsserver', 'shortlived'
  identifiers             TEXT[] NOT NULL,  -- normalized, sorted: the duplicate-limit key
  reason                  TEXT NOT NULL CHECK (reason IN ('new', 'renewal', 'name_change',
                            'reissue', 'ca_migration', 'revocation_replacement')),
  replaces_certificate_id UUID REFERENCES certificates (resource_id),  -- ARI 'replaces'
  ca_migration_id         UUID,           -- set by the distrust playbook; see 2172
  status                  TEXT NOT NULL CHECK (status IN ('awaiting_dns', 'blocked_caa',
                            'queued', 'pending', 'ready', 'processing', 'valid',
                            'invalid', 'abandoned')),
  acme_order_url          TEXT,
  order_expires_at        TIMESTAMPTZ,    -- 8 hours on tlsserver, 7 days on classic
  attempt                 SMALLINT NOT NULL DEFAULT 0,
  next_attempt_at         TIMESTAMPTZ,
  last_error_type         TEXT,           -- 'urn:ietf:params:acme:error:rateLimited', 'dns_not_pointed'
  last_error_detail       TEXT,
  certificate_id          UUID REFERENCES certificates (resource_id),  -- set when valid
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ,
  CHECK ((status = 'valid') = (certificate_id IS NOT NULL))
);
CREATE UNIQUE INDEX certificate_orders_one_open   -- never two live orders for one name set
  ON certificate_orders (target_resource_id, identifiers)
  WHERE status IN ('awaiting_dns', 'blocked_caa', 'queued', 'pending', 'ready', 'processing');

CREATE TABLE dcv_challenges (            -- one authorization's chosen challenge
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id            UUID NOT NULL REFERENCES certificate_orders (id),
  identifier          TEXT NOT NULL,
  wildcard            BOOLEAN NOT NULL DEFAULT false,
  authorization_url   TEXT NOT NULL,
  challenge_type      TEXT NOT NULL CHECK (challenge_type IN ('http-01', 'dns-01',
                        'tls-alpn-01', 'dns-persist-01', 'dns-account-01')),
  token               TEXT,               -- null for dns-persist-01
  published_at        TIMESTAMPTZ,        -- confirmed live on every server or nameserver
  responded_at        TIMESTAMPTZ,        -- POSTed to the challenge URL
  status              TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'valid',
                        'invalid', 'deactivated', 'expired')),
  authorization_expires_at TIMESTAMPTZ,   -- the reuse window the CA reported
  error_type          TEXT,
  error_detail        TEXT,
  cleaned_up_at       TIMESTAMPTZ,        -- file or TXT record removed
  CHECK (NOT wildcard OR challenge_type IN ('dns-01', 'dns-persist-01', 'dns-account-01')),
  CHECK (responded_at IS NULL OR published_at IS NOT NULL)
);

ALTER TABLE certificates                 -- ARI state; renew_after is the core's column
  ADD COLUMN ari_window           TSTZRANGE,
  ADD COLUMN ari_retry_after      TIMESTAMPTZ,   -- when to ask the CA again
  ADD COLUMN ari_explanation_url  TEXT,
  ADD COLUMN ari_checked_at       TIMESTAMPTZ;
```

The renewal time is chosen once per ARI response, at random inside the window, with the lifetime fraction as the fallback:

```sql
-- Set renew_after from the latest ARI window, or from the lifetime if the CA has none.
UPDATE certificates c
SET renew_after = CASE
      WHEN c.ari_window IS NOT NULL
        THEN lower(c.ari_window) + random() * (upper(c.ari_window) - lower(c.ari_window))
      WHEN c.not_after - c.not_before < INTERVAL '10 days'
        THEN c.not_before + (c.not_after - c.not_before) / 2
      ELSE c.not_after - (c.not_after - c.not_before) / 3
             - random() * INTERVAL '2 days'          -- break up issuance cohorts
    END
WHERE c.resource_id = $1;
```

Due renewals go out in small batches, oldest window first, never for a certificate that already has a replacement in flight:

```sql
INSERT INTO certificate_orders (account_id, target_resource_id, ca_id, acme_account_id,
                                profile, identifiers, reason, replaces_certificate_id,
                                status, next_attempt_at)
SELECT r.account_id, r.parent_id, c.ca_id, a.id, c.profile,
       ARRAY(SELECT n.name FROM certificate_names n
             WHERE n.certificate_id = c.resource_id ORDER BY n.name),
       'renewal', c.resource_id, 'queued', NOW()
FROM certificates c
JOIN resources r ON r.id = c.resource_id AND r.state = 'active'
JOIN certificate_authorities ca ON ca.id = c.ca_id AND ca.status = 'active'
JOIN acme_accounts a ON a.ca_id = c.ca_id AND a.environment = 'production'
                    AND a.status = 'valid'
WHERE c.source = 'issued'
  AND c.renew_after <= NOW()
  AND NOT EXISTS (SELECT 1 FROM certificate_orders o
                  WHERE o.replaces_certificate_id = c.resource_id
                    AND o.status NOT IN ('invalid', 'abandoned'))
ORDER BY c.renew_after
LIMIT 500
ON CONFLICT DO NOTHING;                  -- the partial unique index keeps it single
```

Notes on the sketch:

- **Preflight is a status, not a failed order.** `awaiting_dns` and `blocked_caa` rows never reach the CA; the worker re-resolves them on its own backoff and moves them to `queued` when DNS and CAA allow, so customer misconfiguration costs no authorization-failure budget.
- **Backoff is per order and visible.** `attempt` and `next_attempt_at` implement the integration guide's 1 minute, 10 minutes, 100 minutes, then daily; a `rateLimited` error sets `next_attempt_at` from `Retry-After` instead.
- **Publish, then respond.** The check constraint on `dcv_challenges` makes "told the CA before the challenge was live everywhere" impossible to record, which is the mistake multi-perspective validation now punishes.
- **The identifier set is a key.** Sorting and normalizing `identifiers` makes duplicate-certificate limits and the one-open-order rule checkable in the database.
- **The job runs through the playbook's queue,** with the scheduler and dead letters from [Background Jobs](/docs/architecture/background-jobs#scheduling); the private keys it produces are encrypted with the provider's [envelope encryption](/docs/security/encryption-at-rest#envelope-encryption).
- **Events:** `certificate.order_blocked` (with the reason the customer must fix), `certificate.issued`, `certificate.renewal_overdue` and `certificate.renewal_failed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to deployment, notifications and on-call.

## Auditing

- **Every order and every challenge.** Which account asked which CA for which names, with which challenge, when it was published and answered, and what the CA said; kept past the certificate's expiry, because a misissuance report or a CA's own incident will ask which validation backed which certificate.
- **Who could issue.** ACME accounts, EAB bindings and the KMS key behind each, with key use logged ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)), since the account key is a credential for every hosted name.
- **What the provider wrote to customers' DNS.** `_acme-challenge` and `_validation-persist` records created and removed on customer zones, with actor and time.
- **Notices sent for blocked orders.** The message the customer received and when, because "you never told me my certificate would fail" is the support case after an expiry ([The Message Log](/docs/architecture/notifications#the-message-log)).

## What This Means for the System You Build

- **Own the issuance service centrally** and push certificates to servers; servers that order their own certificates exhaust limits when they're rebuilt.
- **Renew on the CA's clock:** ARI first, a lifetime fraction second, a fixed number of days never.
- **Preflight DNS and CAA before ordering,** and treat an unpointed name as the customer's task with a notice, not a retry loop against the CA.
- **Back off per identifier,** because the CA's failure limits are per identifier and a paused name stays paused.
- **Publish challenges everywhere before responding,** and keep the paths the CA validates free of geo rules and allowlists.
- **Offer wildcards only where you can write DNS,** by hosting the zone, an `_acme-challenge` delegation or a persistent record.
- **Keep a second CA live,** with its account, CAA identity and client path exercised, so switching is a flag.
- **Alert on overdue renewals against plan,** not on approaching expiry; with 45-day certificates the margin is two weeks.

## References

**Standards**

- [RFC 8555: Automatic Certificate Management Environment (ACME)](https://www.rfc-editor.org/rfc/rfc8555), March 2019: directory, account, order, authorization and challenge objects and statuses, wildcards, finalize and download, key authorization, `http-01` and `dns-01`, `rateLimited` and `badNonce`, External Account Binding
- [RFC 8737: ACME TLS ALPN Challenge Extension](https://www.rfc-editor.org/info/rfc8737), `tls-alpn-01`, 2020
- [RFC 9773: ACME Renewal Information (ARI) Extension](https://www.rfc-editor.org/rfc/rfc9773), 2025: `renewalInfo`, the certificate identifier, `suggestedWindow`, random selection, `Retry-After` clamping, `replaces` and `alreadyReplaced`
- [CA/Browser Forum Baseline Requirements](https://github.com/cabforum/servercert/blob/main/docs/BR.md), method 3.2.2.4.22 and its 10-day reuse cap

**Let's Encrypt**

- [Rate limits](https://letsencrypt.org/docs/rate-limits/), the limits, refill rates, endpoint limits, the ARI exemption and overrides, as of 5 Aug 2026
- [Profiles](https://letsencrypt.org/docs/profiles/), validity, authorization reuse, order lifetimes and name limits per profile, as of 4 Oct 2026
- [Integration guide](https://letsencrypt.org/docs/integration-guide/), one account for large hosts, certificate shape, ARI twice a day, the one-third fallback, batching and jitter, central validation, durable storage, ports, backoff
- [Challenge types](https://letsencrypt.org/docs/challenge-types/), ports, wildcards, redirect rules and CNAME delegation of `_acme-challenge`
- [Decreasing certificate lifetimes to 45 days](https://letsencrypt.org/2025/12/02/from-90-to-45), the 2026 to 2028 schedule and the 60-day warning
- [Short-lived and IP address certificates generally available](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability), 160 hours, opt-in
- [Introducing DNS-PERSIST-01](https://letsencrypt.org/2026/02/18/dns-persist-01), the record, `policy=wildcard`, `persistUntil`, rollout plan and the account key tradeoff
- [Ten years of Let's Encrypt](https://letsencrypt.org/2025/12/09/10-years), first certificate, one billion in 2020, ten million in a day, wildcard support in 2018
- [Our first certificate](https://letsencrypt.org/2015/09/14/our-first-cert/), 14 Sep 2015

**Hosts and platforms**

- [cPanel: Manage AutoSSL (version 118 and later)](https://docs.cpanel.net/whm/ssl-tls/manage-autossl/), Let's Encrypt as default, when it runs, ancestor DCV, the three-day replacement rule, logs
- [cPanel: Manage AutoSSL (version 88)](https://docs.cpanel.net/whm/ssl-tls/manage-autossl/88/), the Sectigo-powered default provider, 1,000 domains per certificate, no wildcards, up to 48 hours
- [cPanel blog: Securing your site with Comodo and cPanel AutoSSL](https://www.cpanel.net/blog/products/securing-your-site-comodo-cpanel-autossl/), version 58 and 60, 17 Nov 2016
- [Cloudflare: Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/), coverage and plans
- [Cloudflare: Certificate authorities](https://developers.cloudflare.com/ssl/reference/certificate-authorities/), the CAs per certificate type
- [Vercel: Working with SSL certificates](https://vercel.com/docs/domains/working-with-ssl), `http-01` and `dns-01`, nameservers for wildcards, renewal 14 to 30 days before expiry, failure notices
- [Netlify: HTTPS (SSL)](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/), wildcards with Netlify DNS, manual renewal of custom certificates, the alias rate limit warning
- [AWS Certificate Manager: public certificate characteristics](https://docs.aws.amazon.com/acm/latest/userguide/acm-certificate-characteristics.html), 198 days, validation methods, wildcards
- [AWS Certificate Manager: managed renewal](https://docs.aws.amazon.com/acm/latest/userguide/managed-renewal.html), eligibility, ACME certificates renewed by the client, regional certificates
- [Caddy: Automatic HTTPS](https://caddyserver.com/docs/automatic-https), on-demand TLS and the ask endpoint, issuer fallback, retry and backoff
- [Google Cloud: Public CA with an ACME client](https://docs.cloud.google.com/certificate-manager/docs/public-ca-tutorial), EAB keys
- [ZeroSSL: ACME documentation](https://zerossl.com/documentation/acme/), EAB credentials
