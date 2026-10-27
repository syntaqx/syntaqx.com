+++
title = "Communities, Roles & Permissions"
nav_title = "Communities & Permissions"
description = "Forum, server and instance models, channels and categories, role hierarchies and the permission algorithm, invites, and ownership transfer."
category = "User-Generated Platforms Industry"
order = 1804
part = "Communities and Conversation"
tags = ["user-generated-content", "communities", "permissions", "roles", "authorization"]
+++

A community is the unit a user-generated platform is built around: a forum about one topic, a chat server for one group of friends or one game, a streamer's channel, a server on a federated network. It has members, rules, moderators and an owner, and nearly everything that happens on the platform happens inside one. Who may read it, who may post, who may remove what and who may hand the whole thing to someone else are decided at the community level, mostly by volunteers, inside limits the platform sets.

The engineering problem is authorization that ordinary users configure. A company's access control is designed by its own administrators; a community platform hands millions of owners a permission editor and has to make sure that whatever they build, a role can't escalate itself, a moderator can't ban the owner, a hidden channel stays hidden, and a timed-out member really can't speak. The rules must be fast enough to evaluate on every message and simple enough that an owner can predict the result.

This chapter covers the shapes communities take across platforms, channels and categories inside them, membership and invites, roles and the permission algorithm, how role rank limits who can act on whom, platform staff versus community roles, and ownership transfer and abandonment. It extends `communities`, `memberships`, `roles` and `membership_roles` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Community rules, automod and moderator caps are [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation); messages are [Real-Time Chat](/books/user-generated-platforms/real-time-chat); rooms are [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms); instances and defederation are [Federation & Open Protocols](/books/user-generated-platforms/federation). The general authorization patterns are the playbook's [Authorization](/docs/security/authorization).

## How the Platforms Do It

| Platform | Community unit | Inside it | Roles | Ownership |
| --- | --- | --- | --- | --- |
| **Reddit** | A community (subreddit), public, restricted or private | Posts and comment threads; chat | Moderators with full permissions or a named subset each | The top moderator; the platform reassigns unmoderated communities |
| **Discord** | A server (a guild in the API) | Channels of many types grouped into categories, threads | Roles with permission bits, ordered by position; per-channel overwrites | One owner account, transferable |
| **Mastodon** | An instance (a whole server) | Local timeline; accounts and their posts | Owner, Admin and Moderator roles plus custom roles, ranked by priority | Whoever runs the server |
| **Twitch** | A channel (one streamer's space) | One chat, the stream, VODs | Broadcaster, moderators, VIPs | The streamer's account |
| **Bluesky** | No community unit in the protocol; feeds and lists play the role | Feeds built by generators | None at the community level | Not applicable |

The pattern across them is a two-level structure with different emphasis. **The community holds membership, rules and moderators;** **channels inside it hold conversation and its narrower permissions.** Reddit puts most weight on the community and has a flat inside (a community is one stream of posts). Discord puts most weight on channels: a server is a container for dozens of channels with their own audiences and rules. Mastodon makes the whole server the community, which is why a moderation decision there is also a hosting decision. Twitch has one channel per community and one chat per channel. The core model's `communities.kind` (forum, server, channel, group) captures the outer shape; this chapter adds the inner one.

## Shapes of Community

**Forums** are communities of posts. Membership is often a subscription more than a gate: anyone can read a public forum, members get it in their feeds, and posting may require joining. Reddit's communities come in three visibilities, public, restricted (anyone can read, approved users post) and private (approved users only), and the same three appear on most forum software. A forum's content is meant to be found: it's indexed, ranked and recommended to people who never joined ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline), [Search & Discovery](/books/user-generated-platforms/search-and-discovery#ranking-community-search)).

**Servers** are communities of channels. A Discord server holds text channels, voice and stage channels, announcement channels, forum channels and media channels, grouped into categories; its API lists the channel types (text, DM, voice, group DM, category, announcement, three thread types, stage, directory, forum and media). Membership is a gate: you're in the server or you aren't, and each channel decides who among the members can see it. Most content is not meant to be found by outsiders, which shapes search, safety and law (a server's private channel is closer to a group chat than to a public forum).

**Instances** are communities that are also hosts. On Mastodon a server's admins decide who can sign up, moderate their local users and decide which other servers to federate with; Mastodon's documentation is explicit that "moderation in Mastodon is always applied locally." The community and the operator are the same party, with the duties of both ([Federation & Open Protocols](/books/user-generated-platforms/federation#the-operator-s-legal-position)).

**Channels** in the streaming sense are one person's community: the broadcaster owns it, appoints moderators and VIPs, and everything else is chat around a stream. [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity) covers that shape.

**Groups** (Facebook Groups and their imitators) sit between forums and servers: a feed of posts inside a membership gate, with admins, moderators and join questions.

My default for a platform that mixes shapes is the core model's: one `communities` table with a `kind`, one membership model and one role model, and channels as an optional inner layer. A forum is a community with no channels (or one implicit channel); a server is a community with many; a streaming channel is a community with one chat channel. That way the moderation pipeline, the permission evaluator and the transparency reports run once.

## Channels and Categories

A channel is a conversation space inside a community with its own audience. Three properties make channels more than folders:

- **Kind decides behavior.** A text channel holds messages; a forum channel holds threads that look like posts; an announcement channel can be followed from other servers; a voice or stage channel holds a room ([Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#room-types)); a category holds other channels and carries permissions they can inherit. Discord's channel resource documents per-kind fields: voice channels carry a bitrate (96,000 bits per second on an ordinary server, more for boosted ones) and a user limit of up to 99, stage channels up to 10,000 listeners, and a `rtc_region` where null means automatic.
- **Channels carry their own permission overwrites.** A staff-only channel denies view to everyone and allows it to the staff role. Overwrites are the second half of the permission algorithm below.
- **Category sync.** A channel can follow its category's overwrites, so changing the category changes every synced channel; editing a child's overwrites breaks the sync. The UI must show which channels are synced, because "I changed the category and one channel didn't follow" is the most common permission bug owners report to themselves.

Per-channel settings that are really moderation controls (slowmode, an age gate, who may create threads) live on the channel row too. Discord's slowmode (`rate_limit_per_user`) ranges from 0 to 21,600 seconds and applies to thread creation as well; users with a bypass permission are exempt. How those settings are enforced on messages is in [Real-Time Chat](/books/user-generated-platforms/real-time-chat).

## Membership, Invites and Gates

The core model stores membership as a range (join, leave and rejoin are each a row), so "was this person a member when they posted?" has an answer. On top of it, communities choose how people get in:

- **Open.** Anyone may join (a public forum, a public server listed in a directory).
- **Request.** A user asks; moderators approve, often after answering questions. Reddit's restricted and private communities and most groups work this way.
- **Invite.** A link or a direct invitation lets a specific person or anyone holding the link in. Invite links carry an expiry and a maximum use count, and the link that let someone in is worth recording: when a raid arrives through one leaked link, revoking it and finding everyone who used it is the response.
- **Gated.** Joining requires a condition: a verified email or phone, an account older than a threshold, rules accepted, a paid tier, or an age check. Gates are where the platform's minors rules reach communities: an adult-rated community requires an age-assured account ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform)), and on Discord the teen-by-default settings phased in from March 2026 block unverified accounts from age-restricted channels and servers and from speaking on stage.

Paid tiers are gates with money behind them. Discord's Server Subscriptions give paying members perks that include subscriber-only channels and unique roles, and the owner of a monetized server must meet eligibility rules of their own (at launch, being based in the US and in good standing); the money (splits, payouts, taxes) is [Creator Monetization](/books/user-generated-platforms/creator-monetization#subscriptions-and-memberships)'s, but the gate is a role grant here, made and revoked by the subscription's events, never by a moderator's hand.

## Roles and the Permission Algorithm

A role is a named set of permissions with a rank. Members hold several; the default role (Discord's `@everyone`) is held by all. The playbook's [Authorization](/docs/security/authorization) doc covers role-based access in general; what community platforms add is that the roles, their permissions and the exceptions per channel are written by users, so the evaluation must be deterministic, documented and cheap.

Discord publishes the most complete public version of the algorithm, and it's a good reference design:

1. **The owner has everything.** No role or overwrite applies to the owner.
2. **Base permissions** are the default role's permissions ORed with each of the member's roles. If the result includes `ADMINISTRATOR`, the member has every permission and overwrites are skipped.
3. **Channel overwrites** apply in a fixed order, each step clearing denied bits and then setting allowed bits: the default role's overwrite (deny, then allow); the member's roles' overwrites, combined across roles (all denies, then all allows); and the member's own overwrite (deny, then allow).
4. **Implicit rules** follow. Without view permission on a channel, every other permission there is moot. Without send permission, the dependent ones (mention everyone, text-to-speech, attach files, embed links) are off. Without connect on a voice or stage channel, the room permissions are off.
5. **Timeouts strip everything but reading.** A timed-out member keeps only view-channel and read-history; owners and administrators are exempt.

The order is what makes it predictable. A member-specific allow beats a role deny; a role allow beats the default role's deny; and because role overwrites are combined before applying, two roles that disagree on a channel resolve to allow (any allow wins at that level). Owners can reason about it without knowing role positions, because **role position doesn't affect permission math.**

![The permission algorithm as a flowchart. Owner? Yes leads straight to everything, where no role or overwrite applies. No leads to base permissions, the default role ORed with the member's roles, then administrator? Yes leads to everything. No leads down to the accented channel overwrites in their fixed order: the default role's overwrite (deny, then allow), the role overwrites (all denies, then all allows), the member's overwrite (deny, then allow). Then implicit rules (no view makes the rest moot; no send turns its dependents off), the timeout (view and read history only) and the effective permissions. A footer says role position never enters the math and rank decides who may act on whom.](/diagrams/ugp-communities-permissions.svg "Two short-circuits, then three overwrite steps in a fixed order. The order is what lets an owner predict the result without knowing role positions. The steps follow Discord's published algorithm.")

Permissions are bits. Discord defines flags from bit 0 to bit 52 and serializes the set as a string because it can outgrow the integer types of some languages: view channel is bit 10, send messages bit 11, manage messages bit 13, connect bit 20, speak bit 21, mute members bit 22, manage roles bit 28, request to speak bit 32, moderate (time out) members bit 40, administrator bit 3. A signed 64-bit column holds 63 flags; plan for the day the catalog passes that (a second column or a bit string), and never let a client send a permission integer the server doesn't validate against the catalog.

Reddit's model is a smaller version of the same idea: a moderator holds full permissions or a chosen subset, with named permissions such as posts, mail and flair in its API, so a community can add a helper who approves posts without letting them read modmail or change settings.

### Rank Decides Who Acts on Whom

Bits decide what a member can do; **rank decides to whom.** Discord's rules for apps state the general principle: an actor can assign only roles below its own highest role, can edit only lower roles and grant only permissions it holds itself, and can kick, ban or rename only members whose highest role is below its own. Mastodon's server roles work the same way: each role has a priority (the base role 0, Moderator 10, Admin 100, Owner 1000, custom roles up to 999), some actions are limited to targets with a lower priority than the actor's, and a user with permission to manage roles can't modify a role whose priority is equal to or higher than their own.

Rank checks close the escalation paths that bits alone leave open:

- **No self-escalation.** A moderator with manage-roles can't create a role above their own or give a role permissions they lack, so the permission to manage roles never becomes the permission to do everything.
- **No upward action.** A junior moderator can't ban, mute or demote a senior one; a rogue moderator's damage is bounded by their rank.
- **Owner untouchable.** The owner is above every role.

Both checks run on the server for every action, not in the client's menus, and both are part of the record: a moderation decision stores the actor's role and rank at the time, because a removal is only as legitimate as the role behind it ([The User-Generated Platform Business](/books/user-generated-platforms/platform-business#auditing)).

### Platform Staff Are Not a Community Role

Platform staff (trust and safety reviewers, support agents, engineers) must be able to act in any community, but they should never appear as a role inside one. Staff access is a separate grant with its own audit, its own just-in-time elevation and its own logging of every view, the pattern in the playbook's [Support & Admin Access](/docs/security/support-access). Mixing them produces two failures: community owners can see, rank or remove staff, and staff actions show up as community decisions in the transparency counts. The core model already separates them: `roles` are community roles, and moderation cases carry a `scope` of `community` or `platform`.

## Ownership Transfer and Abandonment

Ownership is a responsibility as much as a privilege. The owner is the account the platform holds accountable for the community's settings, the payee for a paid community, and the last resort when moderators disagree. Three events change it:

- **Voluntary transfer.** The owner names a member as the new owner. Because the transfer is irreversible from the new owner's side and gives away everything, it deserves the treatment a payout account change gets: re-authentication, a confirmation by the recipient, a notice to the moderators, and a short window in which the old owner can cancel if the request came from a hijacked session ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it)).
- **Abandonment.** Owners and moderators leave. A community whose top moderator is inactive drifts into spam, and the platform needs a process to hand it to someone active (a request from a member, checked against the owner's recent activity, with notice to the owner before the change) or to close it. Reddit's transparency report shows the cost of not reaching every one in time: of the 605,570 communities Reddit's admins banned in the second half of 2025, spam accounted for 76.7%, and 98.4% of the remaining bans were for communities being unmoderated.
- **Platform intervention.** The platform removes an owner or moderators who break its rules, or who stop moderating. Reddit's Moderator Code of Conduct is the published basis for this; in the second half of 2025 Reddit investigated and actioned 878 Code of Conduct reports, and its listed actions include removing moderators, temporarily restricting a community and limiting posting. When Reddit replaced moderators of communities that stayed closed after the June 2023 protest, it did so under that code ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-2023-blackout)).

A paid community makes transfer harder. Subscribers paid the old owner for access; payouts, tax forms and refunds belong to the old owner's payee record until a cutover date, and a new owner who doesn't meet the eligibility rules can't take over the paid tiers at all. Model it as a cutover: transfer the community, end the old owner's subscription program, and start a new one under the new owner, with subscribers told and given a way out.

## How to Build It

The chapter's additions to the core model:

```sql
ALTER TABLE communities
  ADD COLUMN join_policy    TEXT NOT NULL DEFAULT 'open'
                              CHECK (join_policy IN ('open', 'request', 'invite')),
  ADD COLUMN join_gates     JSONB NOT NULL DEFAULT '{}',  -- {"min_account_age_days": 7,
                                                           --  "verified_email": true, ...}
  ADD COLUMN default_role_id UUID REFERENCES roles (id);  -- the everyone role

ALTER TABLE memberships
  ADD COLUMN nickname      TEXT,
  ADD COLUMN joined_via    UUID,          -- community_invites.id, when an invite was used
  ADD COLUMN rules_accepted_at TIMESTAMPTZ;

CREATE TABLE channels (                  -- conversation spaces inside a community
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id       UUID NOT NULL REFERENCES communities (id),
  parent_id          UUID REFERENCES channels (id),     -- the category it sits in
  kind               TEXT NOT NULL CHECK (kind IN ('category', 'text', 'forum',
                       'announcement', 'voice', 'stage')),
  name               TEXT NOT NULL,
  topic              TEXT,
  position           INT NOT NULL,                       -- display order within the parent
  permissions_synced BOOLEAN NOT NULL DEFAULT TRUE,      -- follows the category's overwrites
  content_rating     TEXT NOT NULL DEFAULT 'general' CHECK (content_rating IN ('general',
                       'mature', 'adult')),
  slowmode_seconds   INT NOT NULL DEFAULT 0 CHECK (slowmode_seconds BETWEEN 0 AND 21600),
  settings           JSONB NOT NULL DEFAULT '{}',        -- per kind: bitrate, user_limit, ...
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at        TIMESTAMPTZ,
  CHECK (kind <> 'category' OR parent_id IS NULL)
);

CREATE TABLE permission_overwrites (     -- per-channel exceptions to role permissions
  channel_id  UUID NOT NULL REFERENCES channels (id),
  target_type TEXT NOT NULL CHECK (target_type IN ('role', 'membership')),
  target_id   UUID NOT NULL,             -- roles.id or memberships.id
  allow_bits  BIGINT NOT NULL DEFAULT 0,
  deny_bits   BIGINT NOT NULL DEFAULT 0,
  updated_by  UUID REFERENCES accounts (id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, target_type, target_id),
  CHECK (allow_bits & deny_bits = 0)     -- a bit is allowed or denied, never both
);

CREATE TABLE community_invites (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id UUID NOT NULL REFERENCES communities (id),
  channel_id   UUID REFERENCES channels (id),     -- where the invitee lands
  code         TEXT NOT NULL UNIQUE,              -- the shareable token
  created_by   UUID NOT NULL REFERENCES accounts (id),
  max_uses     INT CHECK (max_uses > 0),          -- null: unlimited
  uses         INT NOT NULL DEFAULT 0,
  grants_role_id UUID REFERENCES roles (id),      -- optional role on join
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE community_ownership_transfers (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id     UUID NOT NULL REFERENCES communities (id),
  from_account_id  UUID REFERENCES accounts (id),  -- null when the owner is gone
  to_account_id    UUID NOT NULL REFERENCES accounts (id),
  reason           TEXT NOT NULL CHECK (reason IN ('voluntary', 'abandonment_request',
                     'platform_intervention', 'account_closed')),
  status           TEXT NOT NULL CHECK (status IN ('requested', 'confirmed', 'completed',
                     'cancelled', 'rejected')),
  requested_by     UUID NOT NULL REFERENCES accounts (id),
  moderation_case_id UUID REFERENCES moderation_cases (id),  -- for interventions
  cancel_until     TIMESTAMPTZ,            -- the old owner's window to undo
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The permission catalog is data the server owns: one row per bit with a name, a description, the channel kinds it applies to, and the bits it depends on (send messages before attach files; connect before speak). Evaluating effective permissions follows the algorithm above. As a sketch in SQL, for one member in one channel (the service caches the result per member, channel and role-set version, and invalidates it on any role, overwrite or membership change):

```sql
CREATE FUNCTION effective_permissions(p_membership UUID, p_channel UUID)
RETURNS BIGINT LANGUAGE plpgsql STABLE AS $$
DECLARE
  c           communities%ROWTYPE;
  ch          channels%ROWTYPE;
  acct        UUID;
  base        BIGINT;
  ow_channel  UUID;                      -- whose overwrites apply: the channel or its category
  r_allow     BIGINT := 0;
  r_deny      BIGINT := 0;
  ADMIN       CONSTANT BIGINT := 1 << 3;
  VIEW        CONSTANT BIGINT := 1 << 10;
  READ_HIST   CONSTANT BIGINT := 1 << 16;
  ALL_BITS    CONSTANT BIGINT := 9223372036854775807;  -- every flag
BEGIN
  SELECT * INTO ch FROM channels WHERE id = p_channel;
  SELECT * INTO c FROM communities WHERE id = ch.community_id;
  SELECT account_id INTO acct FROM memberships
   WHERE id = p_membership AND state = 'active' AND valid_during @> NOW();
  IF acct IS NULL THEN RETURN 0; END IF;
  IF acct = c.owner_account_id THEN RETURN ALL_BITS; END IF;

  -- 1. base: the default role ORed with every role the member holds
  SELECT bit_or(r.permissions) INTO base
    FROM roles r
   WHERE r.community_id = c.id
     AND (r.is_default OR r.id IN (SELECT role_id FROM membership_roles
                                   WHERE membership_id = p_membership));
  IF base & ADMIN <> 0 THEN RETURN ALL_BITS; END IF;

  -- 2. overwrites, from the category when the channel is synced
  ow_channel := CASE WHEN ch.permissions_synced AND ch.parent_id IS NOT NULL
                     THEN ch.parent_id ELSE ch.id END;

  -- default role: deny, then allow
  SELECT (base & ~deny_bits) | allow_bits INTO base
    FROM permission_overwrites
   WHERE channel_id = ow_channel AND target_type = 'role' AND target_id = c.default_role_id
  UNION ALL SELECT base LIMIT 1;

  -- the member's roles, combined: all denies, then all allows
  SELECT COALESCE(bit_or(o.deny_bits), 0), COALESCE(bit_or(o.allow_bits), 0)
    INTO r_deny, r_allow
    FROM permission_overwrites o
    JOIN membership_roles mr ON mr.role_id = o.target_id
   WHERE o.channel_id = ow_channel AND o.target_type = 'role'
     AND mr.membership_id = p_membership;
  base := (base & ~r_deny) | r_allow;

  -- the member's own overwrite: deny, then allow
  SELECT (base & ~deny_bits) | allow_bits INTO base
    FROM permission_overwrites
   WHERE channel_id = ow_channel AND target_type = 'membership' AND target_id = p_membership
  UNION ALL SELECT base LIMIT 1;

  -- 3. implicit rules
  IF base & VIEW = 0 THEN RETURN 0; END IF;

  -- 4. community penalties in force: a ban removes everything, a timeout leaves reading
  IF EXISTS (SELECT 1 FROM penalties p
              WHERE p.account_id = acct AND p.community_id = c.id AND p.revoked_at IS NULL
                AND p.kind IN ('suspension', 'permanent_ban') AND p.valid_during @> NOW()) THEN
    RETURN 0;
  END IF;
  IF EXISTS (SELECT 1 FROM penalties p
              WHERE p.account_id = acct AND p.community_id = c.id AND p.revoked_at IS NULL
                AND p.kind = 'feature_restriction' AND p.restricted_feature = 'timeout'
                AND p.valid_during @> NOW()) THEN
    RETURN base & (VIEW | READ_HIST);
  END IF;
  RETURN base;
END $$;
```

Notes on the sketch:

- **Channels belong to communities here;** [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it) relaxes `community_id` for direct messages and adds thread kinds, and [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#how-to-build-it) attaches room sessions to voice and stage channels.
- **Overwrites never hold both bits.** The check constraint makes a bit allowed, denied or inherited, the three states an owner sees as a tri-state toggle.
- **Rank checks are a second function.** `can_act_on(actor, target)` compares the highest `roles.position` of each (the owner above all), and `can_grant(actor, bits)` checks that the actor holds every bit it grants; both run before any role, ban, timeout or nickname change.
- **The core's `penalties` table carries timeouts and community bans** with `community_id` set (a timeout is a `feature_restriction` with `restricted_feature = 'timeout'`; a community ban is a `suspension` or `permanent_ban`); the evaluator reads them, and nothing writes permissions to punish someone, so expiry needs no clean-up job. The penalty kinds and their ladders are the [Trust & Safety](/docs/security/trust-and-safety#penalties-and-escalation-ladders) doc's.
- **Gates are data.** `join_gates` holds the conditions a join is checked against at the moment of joining, read through the same standing view [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#account-standing) defines; the result and the gate version are stored on the membership's join event.
- **Invite uses are counted transactionally** (`UPDATE ... SET uses = uses + 1 WHERE uses < max_uses`) so a link with one use can't admit two people.
- **Events:** `community.created`, `membership.started`, `membership.ended`, `role.granted`, `role.revoked`, `role.updated`, `overwrite.updated`, `invite.created`, `invite.revoked`, `ownership.transfer_requested` and `ownership.transferred` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the gateway (which must re-evaluate what connected members can see), search, feeds and moderation.

## Auditing

- **Every role grant, revocation and permission change,** with who made it, their rank at the time and the before and after bits, so "who gave this account the power to ban?" has an answer months later ([Audit Trails](/docs/architecture/audit-trails)).
- **Every overwrite change,** because hiding or exposing a channel is as consequential as a role change, and a leaked private channel starts with an overwrite.
- **Every membership range,** with how the member joined (which invite, which gate version), for raid investigations and for "was this person a member when they posted."
- **Every ownership transfer,** with reason, requester, confirmation and the case behind a platform intervention.
- **Staff access to communities,** logged separately from community roles, with reason and duration.

## What This Means for the System You Build

- **Use one community model with a kind,** and channels as an optional inner layer, so forums, servers and streaming channels share moderation and permissions.
- **Store permissions as bits from a catalog the server owns,** with dependencies between bits, and validate every client-submitted set against it.
- **Publish your permission algorithm** and make it deterministic: base from roles, overwrites in a fixed order, implicit rules, then timeouts.
- **Keep rank separate from bits.** Rank decides who may act on whom; bits decide what; check both on the server for every action.
- **Never let a role grant what its holder lacks,** or create a role above its holder.
- **Keep platform staff out of community roles;** give them audited, time-limited grants instead.
- **Model timeouts and bans as penalties** the evaluator reads, never as permission edits.
- **Make invites expiring, countable and revocable,** and record which invite admitted whom.
- **Treat ownership transfer like a payout account change:** re-authenticate, confirm, notify, and allow a cancel window.
- **Run an abandonment process** so unmoderated communities get new owners or get closed.
- **Record every role, overwrite and ownership change** with the actor's rank at the time.

## References

**Reference**

- [Discord Developer Docs: Permissions](https://docs.discord.com/developers/topics/permissions), the computation order, implicit permissions, role hierarchy rules, timeouts and the flag catalog with bit values
- [Discord Developer Docs: Channel resource](https://docs.discord.com/developers/resources/channel), channel types, slowmode range, voice bitrate and user limits, automatic region, and overwrite objects
- [PRAW: ModeratorRelationship](https://praw.readthedocs.io/en/stable/code_overview/other/moderatorrelationship.html), moderators granted full or a named subset of permissions through Reddit's API
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), moderation always applied locally on each server
- [Mastodon: Roles](https://docs.joinmastodon.org/admin/roles/), the default Owner, Admin and Moderator roles, priorities and the rule that role managers can't modify equal or higher roles
- [TechCrunch: Discord to roll out age verification next month](https://techcrunch.com/2026/02/09/discord-to-roll-out-age-verification-next-month-for-full-access-to-its-platform/), teen-by-default settings restricting age-gated channels and servers and stage speaking (February 2026)
- [Tubefilter: Discord's first creator monetization feature is live](https://www.tubefilter.com/2022/12/01/discord-creator-monetization-server-memberships-open-to-us-servers/), Server Subscriptions perks including subscriber-only channels and roles, owner eligibility

**In practice**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), communities created and run by volunteer moderators under community and sitewide rules
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), community bans for spam and for being unmoderated, and Moderator Code of Conduct investigations and actions
- [Wikipedia: 2023 Reddit API controversy](https://en.wikipedia.org/wiki/2023_Reddit_API_controversy), the replacement of moderators of communities that stayed closed
