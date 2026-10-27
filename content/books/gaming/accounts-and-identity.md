+++
title = "Accounts, Identity & Cross-Platform"
nav_title = "Accounts & Identity"
description = "Publisher accounts versus platform identities, linking and merging, cross-play rules, tokens, account security, regions, age controls and bans."
category = "Gaming Industry"
order = 1614
part = "Backend and Live Services"
tags = ["gaming", "identity", "accounts", "cross-platform", "cross-play"]
+++

A player who plays one game on a PlayStation, a PC and a phone has at least four identities: a PSN account, a Steam or Epic account, an Apple or Google account, and whatever the publisher knows them as. Each platform signs the player in, vouches for who they are and owns the record of what they bought in its store. The publisher's job is to tie those identities to one person, so that progress, purchases, friends and penalties follow them, without ever letting the wrong person take an account over by linking something they shouldn't.

This chapter is about that tie: the publisher account against platform identities, linking and merging, the platform rules that shape cross-play and cross-progression, sign-in and tokens, account security, where identity lives across regions, the age state an account carries, and how identity keeps a ban attached to the person. The core tables (`accounts`, `platform_identities`, `penalties`) are defined in [The Games Business](/books/gaming/games-business#the-core-data-model); this chapter adds what identity needs. Other chapters own the neighbors: what an account owns in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements), the global and regional split of every service in [Game Backend Architecture](/books/gaming/game-backend#global-and-regional-services), age rules in [Ratings, Age & Children](/books/gaming/ratings-and-age), and cheat detection in [Anti-Cheat](/books/gaming/anti-cheat). General login engineering is in [Authentication](/docs/security/authentication), and choosing an identity provider in [Identity Providers](/docs/security/identity-providers).

## Accounts and Platform Identities

An **account** is the publisher's record of a person: the thing a wallet, an entitlement, a friend list and a ban attach to. A **platform identity** is an account someone else issued: a Steam ID, a PlayStation Network account, an Xbox user, an Epic account, an Apple or Google sign-in, a Nintendo account. The platform authenticates the player; the publisher verifies that claim on its own servers and maps it to an account.

The platforms' public documentation shows how the verification works:

- **Steam.** A client asks Steam for a session ticket and sends it to the server, which validates it; for a backend, the Web API call that authenticates a ticket returns the player's 64-bit Steam ID. Tickets are single-use, and ticket validation also checks that the player owns the app, with separate calls for DLC ownership. Steamworks' guidance is that a peer shouldn't assume it knows the other side's identity until validation completes.
- **Xbox.** Tokens issued by the Xbox network carry the user's privileges, and the Xbox Requirements tell services that process those tokens to enforce privileges from the token's `prv` claim (XR-045, version 2.0, March 1, 2023).
- **Epic Online Services.** EOS splits authentication in two. Game Services (multiplayer, player data, trust and safety) authenticate through the Connect Interface with any supported identity provider, Steam, PlayStation, Google and others, and don't require an Epic account. Epic Account Services (friends, presence, the social overlay, crossplay with a combined friends list) authenticate through the Auth Interface and require an Epic account or a proxy account.
- **PlayStation and Nintendo** document their identity, friends and entitlement services to licensed developers under NDA, so the specifics aren't public. Design for the same shape: a platform token, verified server to server, mapped to your account.

The one rule that never changes: **key on the platform's stable ID, never on a name.** Display names change, collide and get recycled. Riot's move from League summoner names to Riot IDs (a game name plus a tag line) shows why: its developer FAQ (last updated October 30, 2023) gave the new format (game names of 3 to 16 characters, tag lines of 3 to 5 alphanumeric characters), said the old name field in match data would go stale after November 20, 2023, and recommended that developers keep their own player records keyed by the stable IDs, summonerID and PUUID. Anything keyed on the name had to be rebuilt.

## Three Identity Models

Games use one of three models, and the choice decides what cross-platform features are even possible:

| Model | How it works | Cross-progression | Example |
| --- | --- | --- | --- |
| **Platform only** | Each platform's identity is the player; no publisher account | None: a PC save and a console save are different players | Many single-platform and older games |
| **Publisher account with linked platforms** | The player has an account with the publisher; platform identities link to it | Yes, through the account | PlayFab's account linking across Windows, Xbox, Steam, PlayStation, Nintendo and mobile |
| **Product user keychain** | No publisher login; a backend user per game, with external identities linked into a keychain | Yes, if the player links identities | EOS Connect: a product user that external accounts and Device ID logins attach to |

The second and third differ in who the player thinks they are. With a publisher account, the player knows they have one, signs in with it on new devices and recovers it with an email; with a keychain, the player only ever sees platform logins, and the backend quietly ties them. Both work. What doesn't work is starting with the first model and adding cross-progression later, because by then every platform has its own copy of every player and there's no safe way to know which copies are the same person.

My default: the second model, with your own account ID as the primary key everything hangs off, and every platform identity (including a backend vendor's player ID) as a linked row. It's the model in the core schema, and it survives changing backend vendors.

## Linking

Linking attaches a platform identity to an account. The EOS Connect reference describes the canonical flow: always try to sign in with the external credential first; if no user is found, the login returns a continuance token, which the game passes either to create a new user or to link the identity to the user who is already signed in, provided that user isn't already linked to an identity from the same provider. The flow I'd build on any backend has the same steps:

1. **Sign in with the platform.** The client gets a platform token; the backend verifies it with the platform, server to server.
2. **Look up the identity.** If `platform_identities` has a live link, sign in to that account. Done.
3. **If it's new, decide create or link.** On first launch with no account, create an account and link the identity in one transaction. If the player is already signed in to an account (on another device, or through the web), offer to link.
4. **Prove both sides.** Linking requires a fresh platform token and a fresh, step-up-authenticated session on the account ([Authentication](/docs/security/authentication#step-up-for-sensitive-actions)). A link made with a stale session is how a stolen session becomes a stolen account on every platform.
5. **Refuse silent moves.** If the identity is already linked to a different account, don't move it. Show the player that the identity belongs to another account and offer the merge path or account recovery.

Three policies keep linking safe:

- **One live link per identity, one identity per platform per account.** The core model's exclusion constraint already prevents one Steam ID from belonging to two accounts at once; add the converse, so an account has at most one live PSN identity.
- **A cooldown before an identity relinks elsewhere.** After an unlink, the identity can relink to the same account at once, but linking it to a different account waits out a cooldown (30 days in the sheet below, an illustrative choice; it's policy, not a platform rule). The cooldown stops account-farming and makes a quiet takeover visible to the real owner, who gets a notification.
- **History, not overwrites.** Every link and unlink is an effective-dated row and an event with the actor, the verification step and the reason ([Effective Dating & History](/docs/database/temporal-data)). The crosswalk of external IDs to accounts is the same structure as any other system's ([Matching, Merging & Many Sources](/docs/architecture/record-linkage#crosswalks-of-external-ids)).

![Dimensional sheet in two views. Plan view A: one account, highlighted, at the center. On the left, five platform identities link into it: a Steam ID, a PSN account, an Xbox user, an Epic account and a Device ID marked as anonymous. Below it, two per-game profiles, game A and game B. On the right, three entitlement scopes: portable (web store, rewards, grants), platform-scoped (usable where bought) and time-bound (passes and subscriptions). Plan view B, a timeline at 2 px per day: one platform identity is linked to account A for V1 = 210 days, unlinked, waits a cooldown of G1 = 30 days, then links to account B with an open end; W1 = V1 + G1 = 240 days from first link to relink. A variable table defines V1, G1, W1 and V2, and the values are labeled illustrative.](/diagrams/gm-accounts-and-identity-linking.svg "One account, several identities, three scopes of ownership. A platform identity has one live link at a time, and its history of links survives every unlink and relink.")

### Anonymous First, Recoverable Later

Mobile games mostly start players with no login at all. PlayFab's login guidance calls anonymous device logins (iOS and Android device IDs, Nintendo Switch device IDs, custom IDs) the most common mechanism, because they ask the player for nothing. The cost is that they hold no recoverable information: a lost or broken device usually means an orphaned account. On iOS the device ID also changes if the game is uninstalled and reinstalled. Microsoft's recommendation is to create accounts anonymously, then offer a recoverable login (an email, a platform account, Game Center, Google, Facebook) and steer paying players to it, since a lost paid account costs revenue; one recoverable login is enough. EOS has the same pattern with Device ID pseudo-accounts that can later be moved into a keychain backed by real accounts.

My rule: prompt for a recoverable link at the first purchase and at the first meaningful progress milestone, and show the risk plainly ("This progress is stored only on this device").

## Merging

Linking attaches an identity to an account. Merging folds two accounts, each with its own history, into one, and it's where identity systems lose players' progress.

The EOS reference for transferring a Device ID account is the clearest public description of the problem. A player starts anonymously on a phone and makes progress; later they sign in with a platform account they already used for the same game elsewhere. The sign-in succeeds into the existing keychain, so the player now has two product users and can only play as one. Epic's documentation says the game should check whether the other user has meaningful progress or ask the player which progress to keep, because the transfer keeps one product user and permanently deletes the other, with no recovery, and warns that the player must be guided to the right choice to avoid losing all their progression.

The rules I'd apply to any merge:

- **Never merge progression automatically.** Per game, the player chooses which profile survives, after seeing both side by side (level, rank, last played, notable items). The other profile is retired, not deleted, for a recovery window.
- **Ownership is a union.** Purchases are never lost in a merge, and nothing is moved by editing a row. Each entitlement on the retired account is revoked with reason `merge` and granted again to the survivor with the merge ID as its source reference, keeping its platform scope; wallet balances move as one `merge` ledger transaction per currency; item instances on a retired profile are transferred to the surviving profile like a trade, with provenance ([Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#entitlements-are-the-source-of-truth)). The history then still says who owned what before the merge.
- **Penalties follow the person.** Active penalties on either account apply to the survivor. A merge must never be a way to shed a ban.
- **Recorded and reversible.** The merge is a recorded operation with a plan, the player's choices, an actor and a reversal path while the retired account still exists ([Matching, Merging & Many Sources](/docs/architecture/record-linkage#merges-recorded-and-reversible)).
- **Run it as a job.** A merge touches every service that keys on the account. Each applies its part idempotently on the merge ID, and the merge isn't done until all have confirmed ([Background Jobs](/docs/architecture/background-jobs)).

## Cross-Play, Cross-Progression and Cross-Purchase

Three features get called cross-platform, and they have different requirements:

- **Cross-play:** players on different platforms in the same match. Needs shared matchmaking and servers, plus each platform's permission.
- **Cross-progression:** the same profile, rank and unlocks on every platform. Needs the account to be the anchor.
- **Cross-purchase:** something bought on one platform usable on another, including virtual currency. Constrained by store agreements more than by technology.

The platform rules that are public are specific:

- **Xbox: privileges.** XR-045 (version 2.0, March 1, 2023) lists the privileges a title must check before the activity: multiplayer sessions (254), cross-network play (185), communications (252), user-generated content (247) and others. If a user lacks the cross-network privilege, the title must not put them in a session with players outside the Xbox network; on the GDK, it invokes system UI so the player, or a child's parent, can resolve it. Privileges hold for the session or until the token refreshes, whichever is shorter.
- **Xbox: communication.** XR-015 (version 1.3, March 1, 2025) requires titles to respect the user's privacy settings for text and voice, with separate settings for communication outside Xbox, and requires a way to mute any non-Xbox player for the session when cross-network communication exists. When two players' settings differ, the strictest applies.
- **PlayStation: revenue terms.** In the 2021 Epic v. Apple trial, a document reported by Video Games Chronicle (May 4, 2021) showed Sony seeking compensation when a game's PlayStation share of revenue fell below its share of play, with an 85% "cross-party revenue share" threshold and audit rights; Tim Sweeney testified that Sony was the only platform holder requiring it. That's a past arrangement surfaced in court. Current terms are under NDA, so treat cross-purchase on PlayStation as a business negotiation, not a feature flag.
- **Epic: social.** EOS crossplay with a combined friends list is an Epic Account Services feature, so it requires Epic or proxy accounts; the Game Services half doesn't.

How this shapes the system:

- **Eligibility is evaluated per session, from the strictest member.** A party's cross-play eligibility is the intersection of every member's platform privileges, age-based settings and own preference. One member who can't cross-play keeps the party in a platform-only pool ([Matchmaking & Ranked](/books/gaming/matchmaking)). Communication between two players follows the stricter of their settings ([Parties, Presence, Chat & Voice](/books/gaming/social-systems)).
- **Entitlements carry a scope.** Every entitlement records where it may be used: portable across platforms, scoped to the platform where it was bought, or bounded in time. The scope comes from the purchase's source and your platform agreements, and clients display only what's usable where they run ([Stores, Fees & Payments](/books/gaming/stores-and-payments)).
- **Cross-progression is per game and per feature.** Rank may cross while some purchased content stays on its platform. Model each separately rather than one global switch.

## Sign-In and Tokens

The sign-in path has the same structure on every platform:

1. The client obtains a platform token (or a credential for your own account).
2. Your auth service verifies it with the platform, server to server, never trusting a platform user ID the client merely states.
3. The auth service maps the identity to an account through `platform_identities`, checks account status and penalties, and records the sign-in.
4. It issues your own session: a short-lived access token for your services and a refresh credential, with the platform privileges captured for no longer than the platform token is valid.
5. For a match, the provisioning service issues a single-use join ticket bound to the account, the match and the assigned game server, with an expiry measured in seconds. The game server verifies it with a public key and calls nothing else.

Session design (server-side sessions, refresh, revocation, why not to use long-lived JWTs as the session) is in [Authentication](/docs/security/authentication#sessions-the-default). The game-specific parts are the platform verification at the front and the join ticket at the back, which keeps the game server's hot path free of calls to the identity service.

Mobile stores add their own rules. Apple's App Store Review Guideline 4.8 says an app that uses a third-party or social login for the user's primary account must also offer an equivalent login that limits data collection to name and email, lets the user keep their email private and doesn't collect app interactions for advertising without consent; an app that uses only the company's own account system is exempt. Guideline 5.1.1(v) requires an app that supports account creation to offer account deletion in the app. Account deletion is therefore a feature of the client on iOS, and it must cascade through every service ([Data Retention](/docs/architecture/data-retention#erasure-requests)).

## Account Security

Game accounts are worth stealing: they hold purchased cosmetics, ranks that sell, and currency. They're attacked with credential stuffing, phishing and support social engineering, the same as any consumer account ([Authentication](/docs/security/authentication#credential-stuffing-and-enumeration)).

Riot's public support pages describe a typical consumer setup. Multi-factor authentication sends a six-digit code by email, through the Riot Mobile app, or through an authenticator app such as Google Authenticator or Microsoft Authenticator, and the sign-in prompt offers a checkbox to ask for a code only every 30 days on a trusted device (Riot Support, page dated May 15, 2026). Riot also rewards players for turning it on: enabling MFA through Riot Mobile for the first time grants a one-time reward in each of League of Legends, Teamfight Tactics, VALORANT and Legends of Runeterra (an emote, tokens, a gun buddy and a chest; page dated November 14, 2025). Rewarding security with cosmetics is a pattern worth copying, because it costs almost nothing and changes behavior.

The rest of the setup:

- **Step-up for anything that moves value or identity.** Linking and unlinking platforms, changing the email, trading, gifting and large purchases require a recent second factor ([Authentication](/docs/security/authentication#step-up-for-sensitive-actions)).
- **Recovery is the real login.** An attacker who can recover the account doesn't need the password. A linked platform identity is a strong recovery factor because the platform authenticated it; an email alone is weaker ([Authentication](/docs/security/authentication#recovery-is-the-real-login)).
- **Support is the softest door.** Agents who can change emails or unlink platforms are the most common takeover route. Their actions go through delegated, reasoned, logged sessions, with changes to identity requiring a second person or a verification the player completes ([Support Access & Internal Tools](/docs/security/support-access), [Player Support](/books/gaming/player-support)).
- **Tell the owner.** Every link, unlink, email change and new-device sign-in notifies the account's verified contacts, with a one-step "this wasn't me" that locks the account and starts recovery.

## Regions and Data Residency

Identity is global; play is regional. [Game Backend Architecture](/books/gaming/game-backend#global-and-regional-services) draws that split for every service, with Riot's public API as the example. For identity it means:

- **A global account directory.** Account ID, credentials, linked identities, status and the account's home region. It's small, replicated for reads and written in one place.
- **Personal data in the home region.** Contact details, payment profiles and support history live where the account's home region says, which is where data-residency obligations attach ([GDPR](/docs/compliance/gdpr#international-transfers)).
- **Game data in the shard.** Profiles, match history and social data for a shard live with that shard, keyed by the global account ID.
- **Region transfer as a recorded job.** Moving a player between shards moves their profile data, keeps their account ID and entitlements, and leaves a record. Whether a transfer is allowed, how often and at what price is a business rule ([Rules as Data](/docs/architecture/rules-as-data)).
- **Partner regions are separate identities.** Where a partner operates the game under its own accounts (Riot's partner-run environments are the example in [Game Backend Architecture](/books/gaming/game-backend#running-it-containers-and-deployment)), treat its players as a separate identity system with its own links, not as rows in your directory.

## Age and Parental Controls

Age changes what an account may do: talk to strangers, see user-generated content, play with other platforms, spend money. The rules themselves (ratings, consent, the laws on children's data) are in [Ratings, Age & Children](/books/gaming/ratings-and-age) and [Children's Privacy](/docs/compliance/childrens-privacy); identity carries the state they act on.

The platforms already manage a lot of it. Xbox child accounts get age-based defaults and settings chosen by a family organizer, and XR-045 expects titles to invoke system UI so a child can ask a parent to approve an activity, such as multiplayer, for one specific title. EOS offers Kids Web Services, a separate service set for parent verification and consent. A game on several platforms gets several parental settings for the same child, plus its own.

How I'd carry it:

- **Signals in, one band out.** Every observation of age (a platform signal, the game's age screen, a parent's setting) is an append-only signal, and the effective band (`under_13`, `13_15`, `16_17`, `adult` or `unknown`) is derived from them, lowest wins. The signals and the derivation are the playbook's model, applied to games in [Ratings, Age & Children](/books/gaming/ratings-and-age#age-and-features). The account caches the derived band, never a birth date, so every service that gates a feature reads one column.
- **Effective permissions are an intersection.** Platform privileges, your own age-based defaults and any parental settings combine, and the strictest wins, the same rule XR-015 applies between two players.
- **Defaults fail closed.** An account with an `unknown` band gets the youngest band's defaults for communication and spending until a signal says otherwise.

## Bans: Account, Identity, Hardware

Penalties attach to the account in the core model, because a person is banned, not a device or a profile. The hard part in free-to-play games is that accounts are cheap. Riot's April 11, 2024 post on bringing Vanguard to League says repeat scripters return on fresh free accounts, which is why one ban isn't enough, and that Vanguard requires TPM 2.0 partly because it serves as a hardware identifier that's very hard to fake, so a returning cheater's machine can be recognized. The same post notes that Riot can't always tell which of its games a cheater meant to cheat in, so hardware signals cross games.

How identity supports enforcement without becoming surveillance:

- **The account is the subject; everything else is evidence.** Platform identities, device and hardware signals and payment fingerprints link accounts as evidence for a decision. They aren't identities and don't get their own login.
- **Linked identities can't launder a ban.** A platform identity linked to a banned account can't link to a new account while the ban lasts, and a merge carries the penalty ([Merging](/books/gaming/accounts-and-identity#merging)).
- **Hardware signals are hashed, scoped and time-bounded.** Store a keyed hash per tenant, not the raw identifier; give hardware-level penalties an end date and an appeal path, since machines are sold and reused. The table for them, `device_bans`, is in [Anti-Cheat](/books/gaming/anti-cheat#enforcement-bans-hardware-bans-and-appeals).
- **Detection lives elsewhere.** How signals are collected and judged is in [Anti-Cheat](/books/gaming/anti-cheat) and [Player Behavior & Moderation](/books/gaming/player-behavior); identity provides the links and the records.

## How to Build It

The chapter's additions to the core model, as columns on existing tables and three new tables:

```sql
ALTER TABLE accounts
  ADD COLUMN home_region       TEXT NOT NULL,  -- where personal data lives; set at sign-up
  ADD COLUMN age_band          TEXT NOT NULL DEFAULT 'unknown' CHECK (age_band IN
                                 ('under_13', '13_15', '16_17', 'adult', 'unknown')),
                                 -- cached; derived from age signals, lowest wins
  ADD COLUMN age_band_derived_at TIMESTAMPTZ,
  ADD COLUMN merged_into_id    UUID REFERENCES accounts (id),  -- set when retired by a merge
  ADD CONSTRAINT accounts_merged_closed
    CHECK (merged_into_id IS NULL OR status = 'closed');

ALTER TABLE platform_identities
  ADD COLUMN verified_at       TIMESTAMPTZ NOT NULL,   -- last successful server-side check
  ADD COLUMN linked_via        TEXT NOT NULL CHECK (linked_via IN ('sign_up', 'link',
                                 'merge', 'support')),
  ADD CONSTRAINT one_identity_per_platform EXCLUDE USING gist (
    tenant_id WITH =, account_id WITH =, platform WITH =, valid_during WITH &&);

ALTER TABLE entitlements
  ADD COLUMN platform_scope    TEXT;   -- null: portable; otherwise usable only on this platform

CREATE TABLE identity_link_events (     -- append-only history of links and unlinks
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  account_id           UUID NOT NULL REFERENCES accounts (id),
  platform_identity_id UUID NOT NULL REFERENCES platform_identities (id),
  action               TEXT NOT NULL CHECK (action IN ('linked', 'unlinked',
                         'relink_blocked')),
  actor_type           TEXT NOT NULL CHECK (actor_type IN ('player', 'support', 'system')),
  actor_ref            TEXT,                -- staff id and ticket, or job id
  step_up              TEXT NOT NULL CHECK (step_up IN ('mfa', 'platform', 'none')),
  reason               TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account_merges (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  surviving_account_id UUID NOT NULL REFERENCES accounts (id),
  retired_account_id   UUID NOT NULL REFERENCES accounts (id),
  kept_profiles        JSONB NOT NULL,      -- per game: which profile survives, the player's choice
  status               TEXT NOT NULL CHECK (status IN ('planned', 'applying',
                         'completed', 'reversed')),
  requested_by         TEXT NOT NULL CHECK (requested_by IN ('player', 'support')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  reversible_until     TIMESTAMPTZ,         -- the retired account is purged after this
  CHECK (surviving_account_id <> retired_account_id)
);

CREATE TABLE account_merge_steps (      -- one row per service that must apply the merge
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  merge_id   UUID NOT NULL REFERENCES account_merges (id),
  service    TEXT NOT NULL,             -- entitlements, wallets, ranked, social, ...
  status     TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'failed')),
  applied_at TIMESTAMPTZ,
  UNIQUE (merge_id, service)
);
```

Notes on the sketch:

- **`tenant_id` stays on every table,** as in the core model, because it's written for a platform that serves many studios. A single studio has one tenant.
- **Account status is a small state machine.** `active` moves to `locked` when a takeover is suspected or a recovery is in progress: sign-in is refused and links, email changes, trades and purchases are frozen until recovery returns it to `active`. `closed` is terminal, for a deleted account and for the retired side of a merge, which also carries `merged_into_id` so a stale token or a support search lands on the survivor. My rule: a ban is a penalty, never a status, so issuing, expiring or overturning one never touches the account row, and an appeal can't accidentally unlock a compromised account.
- **The age band is a cache.** The signals and the lowest-wins derivation live with the age model ([Ratings, Age & Children](/books/gaming/ratings-and-age#age-and-features)); a new signal recomputes `age_band` and emits `account.age_band_changed`, which chat, voice, store and matchmaking consume.
- **Two exclusion constraints** together give the policy: the core model's constraint stops one identity belonging to two accounts at once, and `one_identity_per_platform` stops one account holding two live identities from the same platform.
- **The relink cooldown is enforced in the link service,** reading the identity's last `unlinked` event, and every refusal is recorded as `relink_blocked` so support can see why a link failed.
- **A merge is a plan plus steps.** Each service applies its step idempotently on the merge ID and reports back; the merge completes when every step has applied, and a reversal runs the steps backward while `reversible_until` hasn't passed. The order matters: penalties and identity links first, so a half-applied merge can never leave a banned person on a clean account, then entitlements, wallets and instances, then profiles and the social graph. A step that fails stays `failed` and pages an owner; the merge stays `applying`, never quietly `completed`.
- **Events:** `identity.linked`, `identity.unlinked`, `account.merged` and `account.deleted` go through the outbox to every service that keys on the account ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

Identity records are the first thing anyone reaches for after a takeover, a disputed purchase or a ban appeal:

- **Every link and unlink:** who, from where, with which verification, and whether support was involved.
- **Every merge:** the player's choices, the plan, each service's step and any reversal.
- **Every support action on identity:** the agent, the ticket, the reason and the second approval ([Support Access & Internal Tools](/docs/security/support-access#logging-support-access)).
- **Every privilege decision that blocked a player:** which platform privilege or age rule denied cross-play, chat or a purchase, so "why can't my child play with their cousin" has an answer.

The record structure is in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Your own account ID as the anchor,** with every platform identity, and any backend vendor's player ID, as a linked, effective-dated row keyed on the platform's stable ID, never a name.
- **Server-side verification of every platform token,** mapped to an account, then your own short-lived session and single-use match join tickets.
- **Linking that proves both sides,** refuses silent moves, allows one live link per identity and one identity per platform per account, and waits out a cooldown before an identity changes accounts.
- **Anonymous starts with a prompt to add a recoverable login,** at the first purchase and the first real progress.
- **Merges the player decides,** per game, with ownership unioned, penalties carried, every service applying its step idempotently, and a reversal window.
- **Cross-play and communication evaluated per session from the strictest member,** with platform privileges, age defaults and parental settings intersected.
- **Entitlements that record their platform scope,** so clients show only what's usable where they run.
- **A global identity directory with a home region,** personal data in that region and game data in the shard.
- **Account status for takeover and closure only** (`active`, `locked`, `closed`), with bans kept as penalties and the age band cached from append-only signals.
- **Bans on the account, with identities and hardware signals as hashed, time-bounded evidence** that keeps linking and merging from laundering a penalty.

## References

**Specifications**

- [Apple: App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), guideline 4.8 on offering an equivalent privacy-preserving login and its exemptions, and 5.1.1(v) on in-app account deletion
- [Microsoft Learn: XR-045 Xbox network and Account Privileges](https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/xr/xr045), the privilege list including cross-network play (185), child accounts and approval UI, the `prv` claim and privilege lifetime (version 2.0, March 1, 2023)
- [Microsoft Learn: XR-015 Managing Player Communication](https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/xr/xr015), communication settings inside and outside Xbox, muting non-Xbox players and the strictest-setting rule (version 1.3, March 1, 2025)

**Reference**

- [Epic Games: Epic Online Services overview](https://dev.epicgames.com/docs/epic-online-services/eos-overview), Game Services through the Connect Interface without an Epic account, Epic Account Services through the Auth Interface, crossplay with a combined friends list, and Kids Web Services
- [Epic Games: EOS_Connect_LinkAccount](https://dev.epicgames.com/docs/api-ref/functions/eos-connect-link-account), linking external credentials with a continuance token after a user-not-found login
- [Epic Games: EOS_Connect_TransferDeviceIdAccount](https://dev.epicgames.com/docs/api-ref/functions/eos-connect-transfer-device-id-account), moving a Device ID product user into a real keychain, the player's choice of which progress to keep and permanent deletion of the other
- [Microsoft Learn: Login basics and best practices](https://learn.microsoft.com/en-us/gaming/playfab/features/authentication/login/login-basics-best-practices), anonymous device logins, orphaned accounts, iOS reinstall behavior and adding a recoverable login
- [Microsoft Learn: What is PlayFab?](https://learn.microsoft.com/en-us/gaming/playfab/what-is-playfab), account linking across Windows, Xbox, Steam, PlayStation, Nintendo, mobile and more
- [Valve: Steamworks User Authentication and Ownership](https://partner.steamgames.com/doc/features/auth), session tickets, single use, Web API ticket authentication returning the Steam ID, and ownership checks

**In practice**

- [Riot Games: Summoner Name to Riot ID FAQ](https://developer.riotgames.com/docs/summoner-name-to-riot-id-faq), the Riot ID format, the November 20, 2023 transition, keeping your own records by stable IDs and regional sharding of player data (October 30, 2023)
- [Riot Support: Multi-Factor Authentication How-to & FAQ](https://support.riotgames.com/en-us/riot/account/multi-factor-authentication-how-to-faq), email, Riot Mobile and authenticator app codes and the 30-day option to skip the code on a trusted device (page dated May 15, 2026)
- [Riot Support: Multi-Factor Authentication In-Game Rewards](https://support.riotgames.com/en-us/riot/rewards/multi-factor-authentication-in-game-rewards), one-time rewards for first enabling MFA through Riot Mobile, in four games (page dated November 14, 2025)
- [Riot Games: /dev: Vanguard x LoL](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol/), repeat offenders on new free accounts and TPM 2.0 as a hard-to-fake hardware identifier (April 11, 2024)
- [Video Games Chronicle: Sony is the only platform holder that charges for cross-play, Epic CEO claims](https://www.videogameschronicle.com/news/sony-is-the-only-platform-holder-that-charges-for-cross-play-epic-ceo-claims/), the trial document's 85% cross-party revenue share threshold and audit rights (Chris Scullion, May 4, 2021)
