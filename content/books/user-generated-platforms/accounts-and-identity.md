+++
title = "Accounts, Identity & Standing"
description = "Handles, DIDs and domain handles, verification badges, one login with host and guest roles, account standing, takeover defense, and deletion versus holds."
category = "User-Generated Platforms Industry"
order = 1803
part = "The Business"
tags = ["user-generated-content", "identity", "accounts", "verification", "data-retention"]
+++

An account on a user-generated platform is more than a login. It's a public name other people mention, follow and impersonate; a reputation built from years of posts, reviews and moderation history; a payee with tax forms and a payout bank account; and, on a marketplace, a host and a guest at once. Each of those has its own rules: who may claim a name, what a badge promises, which role a penalty applies to, what an attacker gains by taking the account over, and which records survive when the person asks to be forgotten.

This chapter covers the identity layer every later chapter keys on: handles, including decentralized identifiers and domain handles; verification and badges; one login with several roles; account standing; takeover defense; and account deletion against claim windows and legal holds. It extends the `accounts` and `profiles` tables in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Age assurance and minors' defaults belong to [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age) and are only touched here; generic authentication is the playbook's [Authentication & Sessions](/docs/security/authentication).

## How the Platforms Do It

| Platform | Handle | Verification | Standing and penalties | Deletion |
| --- | --- | --- | --- | --- |
| **Bluesky** | A domain name, resolved to a permanent DID | Blue checks from Bluesky, scalloped badges from Trusted Verifiers, domain handles as self-verification | Labels and takedowns from Bluesky's moderation service and chosen labelers | Account and repository can move to another host |
| **Mastodon** | `user@server`, resolved by WebFinger | None built in | Local actions: sensitive, freeze, limit, suspend; one appeal within 20 days | Suspended data purged after 30 days |
| **Discord** | Username, plus a server nickname | Not a public identity badge | Warning System with an Account Standing tab (October 2023) | Not covered here |
| **YouTube** | Channel handle | Not covered here | A first violation usually gets a warning; strikes last 90 days; three in 90 days can remove the channel | Not covered here |
| **X** | Handle | Paid checkmark | Not covered here | Not covered here |
| **Airbnb** | Not covered here | Identity verification for primary hosts, co-hosts and booking guests | Not covered here | Government ID images kept three years in the EU; selfies for the life of the account |
| **Outdoorsy** | Account name | Persona ID and selfie for hosts and every driver | Not covered here | Erasure of verification files 30 days after the last trip |

The table is sparse on purpose: each platform documents a different slice, and the chapter builds from the slices that are public. The pattern across them is consistent. **Names are claims that have to be checked** (Bluesky and Mastodon both verify a handle against something the account controls); **"verified" means different things** (identity checked, notability confirmed, a subscription paid); **standing is a history the user can see** (Discord's tab, YouTube's warning and strike counts); and **deletion is never instant for everything** (Mastodon's 30 days, Outdoorsy's post-trip window, Airbnb's ID retention).

## Accounts and Handles

A handle is a public, mentionable, impersonable name, and three rules follow:

- **Normalize for uniqueness, display as typed.** Two handles that look the same to a reader must collide: fold case, map confusable characters (Latin "a" and Cyrillic "а"), and decide what you do with dots and underscores. The core model's `handle_key` is the normalized form with the unique constraint; `handle` is what the user typed.
- **Changes are history, not edits.** A handle change keeps the old one in a history table, redirects mentions and profile links for a period, and holds the old name back from reuse, because links, screenshots and other people's memories still point at it. Releasing a popular handle the day it's abandoned invites impersonation of its former owner.
- **Reserve and protect.** Brand and public-figure names, staff-like names ("admin", "support", "trust-and-safety") and names of banned accounts are reserved. A trademark claim on a handle is a moderation case like any other, with the [Trust & Safety](/docs/security/trust-and-safety#reports-and-queues) machinery.

### Handles You Don't Own: DIDs and Domain Handles

Federated and decentralized networks separate the permanent identifier from the human-readable name.

**On the AT Protocol,** every account has a permanent decentralized identifier (DID), and the handle is a domain name. A handle resolves to a DID through a DNS TXT record at `_atproto.<handle>` whose value starts with `did=`, or through an HTTPS response at `/.well-known/atproto-did`; DNS wins if they disagree. The check runs both ways: the handle must resolve to the DID and the DID document must claim the handle, or anyone could alias someone else's account, and a handle that fails either direction shows as `handle.invalid`. The DID document lists the account's current host and keys; with the `did:plc` method the user can hold rotation keys (on paper, if they like) and repoint the DID to a new host without the old host's help, which is how an account moves.

**On Mastodon and ActivityPub,** a handle is `user@domain`. A server resolves it by asking the domain's `/.well-known/webfinger` endpoint for the `acct:` URI, following the `self` link to the ActivityPub actor, then running WebFinger again from the actor's own username and host to confirm they match.

What this means for any platform, federated or not:

- **Key everything on an immutable ID,** never the handle. Mentions, follows, blocks, penalties and payouts all point at `accounts.id` (or a DID for a remote account) so a handle change, or a domain that lapses, breaks nothing.
- **Re-verify external handles on a schedule.** A domain handle is only as good as the domain's registration. Store when it was last verified and what proved it, and drop the handle (not the account) when it stops resolving.
- **Remote accounts are accounts with a different authority.** A federated server keeps rows for remote actors it has seen, moderates them locally (limit, suspend) and can't delete them at their home; [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) owns that model.

## Verification and Badges

"Verified" carries at least four meanings in this market, and mixing them up has already cost a platform a fine:

| Meaning | What was checked | Who sees it | Example |
| --- | --- | --- | --- |
| **Identity verified** | A government ID, a selfie, or data matched against third-party sources | Counterparties in a transaction | Airbnb verifies every primary host, new co-host and booking guest; its 10-K says "identity verified" means the person "provided information we validated through our process" |
| **Authentic and notable** | That the account is who it says, and is someone people would look for | Everyone | Bluesky's blue checks: 4,327 accounts verified by the end of 2025, 3,567 by Bluesky and 777 by a network of 21 Trusted Verifiers whose badges are scalloped and name the organization that granted them |
| **Controls a domain** | DNS or a file on the domain | Everyone who reads the handle | Over 309,000 Bluesky accounts used domain handles by the end of 2025, which Bluesky treats as a form of verification separate from badges |
| **Paid** | A subscription | Everyone, often without knowing what was checked | The European Commission fined X €120 million on December 5, 2025, in its first DSA non-compliance decision, finding that the paid blue checkmark deceived users and raised their exposure to scams including impersonation |

My rules for badges:

- **One badge kind per meaning,** visually distinct, with a tap-through that says what was checked, by whom and when. Bluesky's tap-through to the granting organization is the pattern.
- **Verification is a record, not a flag.** Store the method, the verifier (the platform, a delegated organization, a vendor), the evidence reference, when it was granted and when it expires or was revoked. A badge is then a query over verifications in force.
- **A handle or name change re-opens it.** Airbnb asks for re-verification when a user changes their legal name or other account information, or when it detects risk, and blocks new reservations (or the host's calendar) until it's done. A notability badge that survives a rename is an impersonation kit.
- **Delegated verifiers are accountable.** A newsroom that verifies its journalists is acting for the platform; record which verifier granted each badge, review them, and be able to revoke a verifier's grants in bulk.

Identity verification for supply (hosts, sellers, high-volume traders under the INFORM Consumers Act and the DSA) adds bank accounts, tax data and business records, and [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#the-onboarding-gates) owns it. The vendors are in [The Platform Landscape](/books/user-generated-platforms/platform-landscape#marketplace-infrastructure).

## One Login, Many Roles

Marketplaces and creator platforms converge on one account with several roles. Outdoorsy describes "a single, unified account system" in which the same credentials work for hosting and traveling, with separate guest and host apps on top; Airbnb requires verification of hosts, co-hosts and booking guests on the same account model, and adds requirements for hosts who host as a business or earn rental income in the EU and Brazil. On community and streaming platforms the same account is a member, a moderator in some communities, a creator with earnings, and a viewer who buys subscriptions.

The model that holds up:

- **Identity is per account; roles are per profile and per relationship.** Sign-in, contact points, the security setup and identity verification live on the account. Being a host, a seller or a creator is a profile with its own public face and its own role-specific state (listings, payout readiness, tax interview), and being a moderator is a role in one community ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)).
- **The payee is a legal entity, not a profile.** A host who switches from hosting personally to hosting through an LLC keeps the same account and profile but a different payee, tax form and payout account. Payout and tax data hang off the Payments volume's merchant record for that entity ([Merchant Onboarding](/books/payments/merchant-onboarding#the-application-is-not-the-merchant)); [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#who-the-payee-is) owns the flow.
- **Penalties name the role they restrict.** A host who cancels repeatedly loses instant book or visibility; a guest who damages a vehicle loses booking; a member who harasses loses chat in one community. The [Trust & Safety](/docs/security/trust-and-safety#penalties-and-escalation-ladders) principle (restrict the feature that was abused) becomes "restrict the role that was abused," with a sitewide account suspension reserved for conduct that makes the person unsafe in every role.
- **Deleting a role isn't deleting the account.** Closing a host profile unpublishes listings and stops new bookings; the account, its trips as a guest and its records stay.
- **Shared and team accounts are delegation.** A co-host, a brand's social team or a channel editor acts on someone else's profile; give them their own accounts with a scoped grant, never shared credentials, so every action has a person behind it ([Authorization](/docs/security/authorization#least-privilege)).

## Account Standing

Standing is the user-facing summary of the penalties in force against an account: what they did, which rule it broke, what it restricts, and when it expires. Discord shipped the pattern in October 2023: a message for each warning or violation that links to the post, the action and the policy, and an Account Standing tab in settings showing past violations, with standing determined by active violations and their severity. YouTube runs the same shape as a ladder: a first violation usually gets a warning, which expires after 90 days if the creator completes a policy training; later violations become strikes that each last 90 days, with a one-week posting freeze for the first, two weeks for the second and possible channel removal on the third within 90 days. Mastodon, with no central operator, keeps it local: each server's actions (marking media sensitive, freezing, limiting, suspending) are emailed to the user with one appeal allowed within 20 days.

What standing is for:

- **Telling the user.** A user who can see why they're restricted, and when it ends, appeals less and reoffends less than one who can't; the DSA requires a statement of reasons for most restrictions anyway ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).
- **Gating privileges.** Monetization, verification badges, moderator roles, instant book and higher API limits all depend on standing. Discord's Server Subscriptions launched open only to owners in good standing with no recent Terms of Service or Community Guidelines violations; YouTube's strikes freeze uploads and live streaming. Each gate reads standing at the moment of the action, not a cached flag set when the user enrolled.
- **Driving the ladder.** The next penalty depends on the penalties in force, which is why strikes carry validity ranges and expire ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).

My rule: standing is derived, never stored. It's a query over `penalties` in force (sitewide and per community, per role), plus verifications and any open safety holds; a cached summary is fine for display but is recomputed whenever a penalty starts, expires or is overturned, and gates call the query.

Penalty evasion is the other half: a banned user returns on a new account. Linking accounts to one person (devices, payment instruments, identity documents, behavior) is the [record linkage](/docs/architecture/record-linkage#merges-recorded-and-reversible) problem; Airbnb describes an identity graph of about 7 billion nodes and 11 billion edges used for identity resolution, linked accounts and suspicious activity. [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#account-farms) and [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#linked-accounts) cover detection; the [Gaming](/books/gaming/accounts-and-identity#bans-account-identity-hardware) volume covers device and hardware bans.

## Takeover Defense

A user-generated platform's accounts are worth stealing for more than their contents. A creator's account carries an audience to scam; a moderator's carries the power to deface a community; a host's carries payouts to redirect and guests to defraud; any aged account with good standing is worth more to a spammer than a new one. The defenses are the playbook's ([Authentication & Sessions](/docs/security/authentication)): passkeys first, a second factor, rate limits on [credential stuffing](/docs/security/authentication#credential-stuffing-and-enumeration), and [recovery treated as the real login](/docs/security/authentication#recovery-is-the-real-login). What this market adds:

- **Choose the challenge per person.** Airbnb's identify-then-challenge flow has the user say who they are first, then a server-side policy engine picks the challenge most likely to succeed from the session and account history, with a "try another way" fallback ranked by predicted success. It reported 2.6% more successful authentications, 27% fewer duplicate accounts and about 11% lower one-time-code costs. Duplicate accounts matter here because every one splits a person's reputation and standing.
- **Step up where value or identity moves.** Changing the payout bank account, the email, the phone or the handle, adding a co-host or a moderator, transferring a community's ownership, and starting a stream with a new key all require a recent strong factor ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)). A changed payout account also holds the next payout and notifies the old contact, the vendor-payment pattern in [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account).
- **Lock, don't ban.** A suspected takeover moves the account to `locked`: sign-in refused, payouts held, the handle frozen, outbound messages stopped, while recovery runs. Locking is a status because it's about who controls the account, not about what its owner did; treating it as a penalty would put a victim's standing on their record.
- **Undo what the attacker did.** After recovery the owner needs to see and reverse the session's actions: posts, messages, listing edits, role grants, payout changes. That's only possible if every action records the session that made it ([Audit Every Auth Event](/docs/security/authentication#audit-every-auth-event)).
- **Support is a door.** Agents who can change emails, handles or payout accounts go through delegated, reasoned, logged sessions with a second approval for identity changes ([Support Access & Internal Tools](/docs/security/support-access#approvals-and-nobody-approves-their-own)).

## Minors

Age changes what an account may do: who can message it, whether it's discoverable, what it sees, whether it can stream or earn, and whether a parent can see its activity. Platforms now default unknown-age accounts to teen settings until they verify age (Discord announced a global rollout of age verification for early March 2026), and the methods, vendors and laws (COPPA, the UK and EU regimes, Australia's under-16 minimum age, and US state laws with their court status) are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform). The playbook's [Designing Age Assurance](/docs/compliance/childrens-privacy#designing-age-assurance) holds the general model, including age as a record rather than a field; this chapter's tables only reserve the place where the derived age band lands.

## Deletion, Claims and Legal Holds

A user asking to delete their account wants three different things, and the platform can give them on different clocks:

1. **Close the account now.** Sign-in stops, the profile disappears, listings unpublish, the handle stops resolving. Outdoorsy closes the account immediately, cancels upcoming reservations with full refunds to guests, treats a host's cancellations as host-initiated, and unpublishes listings; mid-trip deletion locks the user out of booking details and roadside help, so the platform warns against it.
2. **Remove what they published.** Posts, comments and media come down or are de-attributed. On a community platform, replies from others hang off those posts, so platforms commonly keep the thread shape and remove the author and text; the decision belongs in policy, and [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#policy-driven-purges) covers bulk removal.
3. **Erase their personal data.** The right to erasure under the [GDPR](/docs/compliance/gdpr#data-subject-rights) and state privacy laws, subject to the records the platform must or may keep.

The records that outlive closure, and why:

| Record | Kept because | Published example |
| --- | --- | --- |
| Transactions, tax documents, messages about a booking | Tax, accounting and legal requirements | Outdoorsy archives transaction records, tax documents and message histories after account deletion |
| Identity verification images | Claims, safety, fraud and legal compliance | Outdoorsy purges ID and selfie images only after a 30-day window from the last trip's return; Airbnb keeps government ID images three years from receipt in the EU and selfies for the life of the account |
| Open claims, deposits, payouts and disputes | Money still owed in either direction | Outdoorsy requires no open reservations or unresolved deposits, payouts, claims or disputes before full erasure |
| Content and data reported to NCMEC | A completed CyberTipline report is a request to preserve for one year | 18 U.S.C. 2258A(h) |
| Trader identity data | The DSA requires marketplaces to keep traders' data for six months after the relationship ends | DSA Article 30 |
| Moderation decisions and statements of reasons | Appeals, out-of-court disputes and transparency reporting | The [Trust & Safety](/docs/security/trust-and-safety#auditing-moderation-decisions) audit model |
| Data under a preservation letter or litigation hold | A court or law enforcement asked | [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework) |
| Suspended federated account data | Reinstatement window | Mastodon keeps suspended data 30 days, then purges it from the server |

The pattern: **closure is immediate, erasure is a job, and every exception is a hold with a reason and an end.** A deletion request records what the user asked for; each record type has a retention rule ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)); a legal hold suspends erasure for the records it names until it's released; and the erasure job runs when the last hold and window on each record has passed, then reports what it removed and what it kept ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)). A hold must never be visible to the user it concerns when it comes from a law enforcement request that forbids notice; [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#user-notice) covers nondisclosure.

Deleted accounts also come back. A person who deleted an account to escape a ban, or a host who closed an account with claims open, can sign up again with a new email; Outdoorsy says a returning user may sign up with the original email or another. The penalties and identity links of the closed account are retained exactly so that a return can be recognized, which makes them a legitimate-interest retention to document, not an oversight.

## How to Build It

The chapter's additions to the core model, as columns on existing tables and new tables:

```sql
ALTER TABLE accounts
  ADD COLUMN did                TEXT UNIQUE,  -- AT Protocol or other DID, when the account has one
  ADD COLUMN locked_reason      TEXT,         -- required while status = 'locked'
  ADD COLUMN age_band           TEXT NOT NULL DEFAULT 'unknown',  -- cache; Minors chapter owns it
  ADD COLUMN closure_requested_at TIMESTAMPTZ,
  ADD CONSTRAINT accounts_locked_reason
    CHECK ((status = 'locked') = (locked_reason IS NOT NULL));

CREATE TABLE account_handles (           -- every handle an account has held
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  handle       TEXT NOT NULL,
  handle_key   TEXT NOT NULL,            -- normalized, as on accounts
  kind         TEXT NOT NULL CHECK (kind IN ('platform', 'domain')),
  valid_during TSTZRANGE NOT NULL,
  reserved_until TIMESTAMPTZ,            -- held back from reuse after it's released
  EXCLUDE USING GIST (handle_key WITH =, valid_during WITH &&)  -- one holder at a time
);

CREATE TABLE handle_verifications (      -- a domain handle proved, and re-proved
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_handle_id UUID NOT NULL REFERENCES account_handles (id),
  method         TEXT NOT NULL CHECK (method IN ('dns_txt', 'https_well_known', 'webfinger')),
  result         TEXT NOT NULL CHECK (result IN ('valid', 'mismatch', 'unresolvable')),
  checked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verifications (             -- what was checked about an account, by whom
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  kind          TEXT NOT NULL CHECK (kind IN ('identity', 'notability', 'organization',
                  'phone', 'email', 'payment_instrument')),
  method        TEXT NOT NULL,           -- 'document_and_selfie', 'third_party_data', 'manual', ...
  verifier      TEXT NOT NULL CHECK (verifier IN ('platform', 'vendor', 'delegated')),
  verifier_ref  TEXT,                    -- vendor and inquiry id, or the delegating organization
  evidence_ref  TEXT,                    -- the evidence store, with its own retention
  status        TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'failed',
                  'expired', 'revoked')),
  valid_during  TSTZRANGE,               -- set when passed; closed on expiry or revocation
  revoked_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE badges (                    -- what's shown, and which verification backs it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  profile_id      UUID NOT NULL REFERENCES profiles (id),
  kind            TEXT NOT NULL CHECK (kind IN ('verified', 'verified_by_organization',
                    'identity_verified', 'subscriber', 'staff')),
  verification_id UUID REFERENCES verifications (id),  -- null only for 'subscriber'
  valid_during    TSTZRANGE NOT NULL,
  CHECK (kind = 'subscriber' OR verification_id IS NOT NULL),
  EXCLUDE USING GIST (profile_id WITH =, kind WITH =, valid_during WITH &&)
);

ALTER TABLE penalties
  ADD COLUMN role TEXT CHECK (role IN ('member', 'creator', 'host', 'seller', 'guest',
    'buyer', 'moderator'));              -- null: the whole account

CREATE TABLE deletion_requests (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  scope         TEXT NOT NULL CHECK (scope IN ('close_account', 'remove_content',
                  'erase_personal_data')),
  legal_basis   TEXT,                    -- 'gdpr_art_17', 'ccpa', 'user_request', ...
  status        TEXT NOT NULL CHECK (status IN ('received', 'verified', 'waiting',
                  'completed', 'rejected')),
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  outcome       JSONB                    -- per record type: erased, kept (and why)
);

CREATE TABLE legal_holds (               -- suspends erasure of named records until released
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID REFERENCES accounts (id),
  subject_type TEXT NOT NULL,            -- 'account', 'content_item', 'media_asset', 'booking', ...
  subject_id   UUID NOT NULL,
  reason       TEXT NOT NULL CHECK (reason IN ('claim_window', 'open_dispute',
                 'cybertipline_preservation', 'preservation_request', 'litigation',
                 'regulatory_retention', 'tax')),
  source_ref   TEXT,                     -- the case, booking, request or report behind it
  notify_user  BOOLEAN NOT NULL DEFAULT FALSE,  -- false when the requester forbids notice
  valid_during TSTZRANGE NOT NULL,       -- upper bound null until a release date is known
  released_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Notes on the sketch:

- **Account status is about control, not conduct.** `active`, `locked` (a takeover or recovery in progress, with a reason), `deactivated` (the user paused it) and `closed`. Every penalty, including a permanent ban, is a row in `penalties` with an optional `community_id` from the core model and a `role` from this chapter, so standing is a query and an overturned ban never touches the account row.
- **Handles are ranges.** The exclusion constraint on `handle_key` stops two accounts holding a name at once; `reserved_until` keeps a released name out of circulation; the current handle on `accounts` is a cache of the open range.
- **A badge needs a verification.** Every badge except a subscriber marker points at the verification that justifies it, so revoking the verification (a rename, a lapsed domain, a delegated verifier removed) closes the badge in the same transaction.
- **Standing is a view.** Penalties in force by scope and role, plus open locks and failed or expired verifications that gate privileges; the gates for monetization, instant book, moderator roles and badges read it at the moment of the action.
- **Erasure is a job over holds.** The erasure job walks each record type for the account, skips anything with a `legal_holds` row in force, erases or de-identifies the rest under the retention schedule, and writes the outcome; it re-runs when a hold is released ([Background Jobs](/docs/architecture/background-jobs)). Holds from law enforcement requests carry `notify_user = false` and are never shown in the user's data export.
- **Events:** `account.handle_changed`, `account.locked`, `account.recovered`, `verification.passed`, `verification.revoked`, `badge.granted`, `badge.revoked`, `account.closed` and `account.erased` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to search, mentions, payouts, moderation and the federation layer.

## Auditing

- **Every handle an account has held,** with the dates, so a screenshot, a harassment report or a court order naming an old handle resolves to the right account.
- **Every verification and badge,** with method, verifier, evidence reference and revocation reason. Regulators asked X what its checkmark meant; the answer has to be a record, not a design document.
- **Every standing change,** which is every penalty with its decision, notice and appeal ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **Every security event:** sign-ins, challenges chosen, recoveries, locks, step-ups, and changes to contact points, payout accounts and handles, with the session and, for support, the agent and reason.
- **Every deletion request and its outcome,** including which records were kept under which hold or retention rule and when they were finally erased.

## What This Means for the System You Build

- **Key everything on an immutable account ID** (or DID), never the handle; keep handle history and hold released names back from reuse.
- **Normalize handles** for case and confusables before the unique check.
- **Verify domain handles both ways** and re-check them on a schedule.
- **Keep one badge per meaning,** each backed by a verification record that says what was checked, by whom and when.
- **Use one login with role profiles,** and put payout and tax data on the payee entity, not the profile.
- **Scope penalties to the role and community abused;** suspend the whole account only when the person is unsafe in every role.
- **Show users their standing,** and gate monetization and privileges on standing computed at the moment of the action.
- **Lock accounts on suspected takeover** as a status, separate from penalties, and let the owner review and undo the attacker's session.
- **Step up and hold payouts** on payout account, email, handle and ownership changes.
- **Close immediately, erase as a job,** with every kept record tied to a hold or retention rule with an end.

## References

**Protocols**

- [AT Protocol: Overview](https://atproto.com/guides/overview), DIDs, handles as domain names, rotation keys, moving between hosts
- [AT Protocol: Handle](https://atproto.com/specs/handle), DNS TXT and well-known resolution, bidirectional verification, `handle.invalid`
- [Mastodon: WebFinger](https://docs.joinmastodon.org/spec/webfinger/), resolving `user@domain` handles and the confirming lookup

**Platform documentation**

- [Bluesky: Verification](https://bsky.social/about/blog/04-21-2025-verification), blue checks, Trusted Verifiers with scalloped badges, domain handles as verification
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), verified accounts, Trusted Verifiers and domain-handle accounts at the end of 2025
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), sensitive, freeze, limit and suspend, the 30-day purge, appeals within 20 days
- [Discord: Building a safer place for teens](https://discord.com/safety/safer-place-for-teens), the Warning System and Account Standing tab (October 24, 2023)
- [YouTube: Community Guidelines strike basics](https://support.google.com/youtube/answer/2802032?hl=en), warnings, strikes, 90-day expiry and penalties
- [Airbnb: Verifying your identity](https://www.airbnb.com/help/article/1237), who must verify, deadlines, re-verification triggers, ID and selfie retention
- [Airbnb: Flexible authentication](https://airbnb.tech/uncategorized/flexible-authentication-reimagining-authentication-for-millions-of-users-at-airbnb/), identify-then-challenge and its measured results
- [Airbnb: Scaling Airbnb's identity graph](https://airbnb.tech/infrastructure/scaling-airbnbs-identity-graph-with-a-unified-knowledge-graph-infrastructure/), graph size and uses for linked accounts
- [Outdoorsy: Your guide to your Outdoorsy account](https://support.outdoorsy.com/hc/en-us/articles/57236540510747-Your-guide-to-your-Outdoorsy-account-Hosting-and-Traveling), one account for hosting and traveling
- [Outdoorsy: How do I delete my Outdoorsy account](https://support.outdoorsy.com/hc/en-us/articles/57132723095195-How-do-I-delete-my-Outdoorsy-account), closure, cancelled trips, archived records, the 30-day window before erasure
- [Tubefilter: Discord's first creator monetization feature](https://www.tubefilter.com/2022/12/01/discord-creator-monetization-server-memberships-open-to-us-servers/), good standing as an eligibility requirement
- [TechCrunch: Discord to roll out age verification](https://techcrunch.com/2026/02/09/discord-to-roll-out-age-verification-next-month-for-full-access-to-its-platform/), the early March 2026 global rollout

**Law and enforcement**

- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), what "identity verified" means
- [eucrim: EU fines X 120 million euros in first DSA non-compliance decision](https://eucrim.eu/news/eu-fines-x-120-million-in-first-dsa-non-compliance-decision/), the paid checkmark finding (December 5, 2025)
- [18 U.S.C. 2258A](https://www.law.cornell.edu/uscode/text/18/2258A), one-year preservation after a CyberTipline report
- [DSA Article 30: Traceability of traders](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_30.html), trader data kept six months after the relationship ends
