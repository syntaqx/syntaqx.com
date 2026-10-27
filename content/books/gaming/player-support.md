+++
title = "Player Support"
description = "Support for games: channels and in-game SDKs, context-rich tickets, bots that know when to hand off, refunds, account recovery and staff access to player data."
category = "Gaming Industry"
order = 1621
part = "Fair Play and Safety"
tags = ["gaming", "support", "customer-service", "automation", "refunds", "account-recovery"]
+++

Player support is where every other system in this volume shows up when it fails. A purchase that charged but didn't grant, an account taken over by someone who phished the password, a ban the player thinks was wrong, a rank lost to a server crash, a skin that vanished after a patch: each one becomes a ticket, and the ticket arrives from a player who is usually upset, often young, and sometimes not the account owner at all. Support in games has the volume of consumer support, the spikes of a live service (a launch, a new season, an outage), and the access problems of a system where staff can grant things that are worth real money.

This chapter is about building support for a game: the channels, the context a ticket should carry, the automation that answers what can be answered and hands off the rest, the three ticket types that dominate the hard cases (purchases, account recovery and behavior), and the tables and operations behind them. It links out for the systems support acts through: store refund policies and notifications are in [Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks), the clawback algorithm in [Inventories, Entitlements & Economies](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks), recovery and linked identities in [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity), lost and corrupted saves in [Corruption, Backups and Recovery](/books/gaming/saves-and-player-data#corruption-backups-and-recovery), and appeals in [Player Behavior & Moderation](/books/gaming/player-behavior). The staff side of data access is the playbook's [Support Access & Internal Tools](/docs/security/support-access); the general handoff rules for automated agents are in [AI Agents in the Product](/docs/architecture/ai-agents#human-handoff-is-a-product-feature).

## Channels

Players reach support through more doors than most products have:

| Channel | Strengths | Costs |
| --- | --- | --- |
| Help center (web, and inside the client) | Answers the common questions without a ticket; searchable; localized once | Goes stale after every patch unless someone owns it |
| Ticket form | Structured fields, attachments, asynchronous | Players pick the wrong category; slow by design |
| In-game support SDK | Ticket or chat without leaving the game; the game fills in context | An SDK in the client to update and localize; a surface in the game's UI |
| Live chat or messaging | Fast for simple cases | Staffing across time zones; long sessions for hard cases |
| Community (forums, Discord, social) | Scales through other players; finds outages early | Not a support channel for anything involving an account |
| Platform holders' support | Console stores and app stores own their purchases | You don't control the outcome; you still get the angry player |

In-game support SDKs exist because players don't want to leave the game to get help, and because the game knows things the player doesn't. Zendesk's SDK for Unity, announced December 15, 2020, put a help center and messaging with an agent inside the game, with a design that matches the game and "tailored support fields unique to the game". Helpshift describes "in-game support SDKs for mobile, PC, and web", "unified player context & workflows" and "console handoff via QR and links", for platforms where typing a ticket on a controller is the wrong experience: the console shows a code, and the player continues on a phone.

My default: an in-game entry point on every platform (a help button in the menu, deep-linked to the right article or form), a web help center with the same articles for players who are locked out of the game, and a ticket form or messaging behind both. Community channels are for announcements and peer help, never for account details.

## Context Comes With the Ticket

A ticket that says "my skin is gone" costs an agent ten minutes of questions. A ticket that arrives with the account, the platform, the build, the region and the player's last purchases costs one. The game client and the backend already know most of what support needs, so send it:

- **Who:** the account ID and the [platform identity](/books/gaming/accounts-and-identity) the player is signed in with, which matters when one person has several linked accounts.
- **Where:** game, platform, region or shard, client [build](/books/gaming/patching), device and OS.
- **What just happened:** the last match ID, the last few purchases and grants, active penalties, and recent error codes from the client.
- **Locale and age band,** so the ticket routes to an agent who speaks the language and to the right handling for young players.

Collect it on the server where possible (the SDK passes an authenticated token; the support backend looks up the rest) rather than trusting fields the client fills in, and show agents a masked view by default, as [Support Access](/docs/security/support-access#read-only-by-default) requires. Never ask for a password, and say so in the form; "support" asking for credentials is the classic phishing script, and a player who has learned that real support never asks is harder to phish.

```sql
CREATE TABLE support_tickets (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  game_id          UUID NOT NULL REFERENCES games (id),
  account_id       UUID REFERENCES accounts (id),
  platform_identity_id UUID REFERENCES platform_identities (id),
  build_id         UUID REFERENCES builds (id),
  last_match_id    UUID REFERENCES matches (id),
  category         TEXT NOT NULL,
  category_source  TEXT NOT NULL CHECK (category_source IN ('player', 'classifier', 'agent')),
  channel          TEXT NOT NULL CHECK (channel IN ('in_game', 'web_form', 'messaging', 'email', 'platform')),
  locale           TEXT NOT NULL,
  state            TEXT NOT NULL DEFAULT 'new'
                     CHECK (state IN ('new', 'waiting_on_player', 'waiting_on_agent', 'solved', 'closed')),
  helpdesk_xid     TEXT,
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  solved_at        TIMESTAMPTZ
);
```

`account_id` is nullable because the hardest tickets come from players who can't sign in. `helpdesk_xid` links to the helpdesk vendor's record; the game's own table keeps the fields the game needs to report on and act on, and the conversation itself lives in the helpdesk.

## Classify, Route, Answer

Riot's tech blog post on its support bot, "Blitzcrank Bot" (June 1, 2017), is still the clearest public account of automating game support, and its numbers explain why. Riot's Player Support received around 12,000 requests a day, mostly tickets. Before automation, responses took up to 25 hours and resolution up to 3 days on average; agents resolved about 70% of requests at the first touch; and players picked the right issue category about 80% of the time.

![A dimensional drawing of a day of support requests in 2017: 12,000 requests pass intake and a per-language classifier and split into 2,400 routed or answered by a bot and 9,600 left for agents, above a timeline of one ticket before automation with first response up to 25 hours and resolution up to 72 hours.](/diagrams/gm-player-support-intake.svg "A fifth of the intake handled by a bot was the daily work of about 50 agents, and the slow part of a ticket was the queue before anyone answered.")

| Code | Item (Riot Player Support, 2017) | Value |
| --- | --- | --- |
| Q1 | Requests a day | about 12,000 |
| B1 | Routed or answered by the bot, 20% of Q1 | 2,400 |
| H1 | Left for agents, Q1 minus B1 | 9,600 |
| E1 | The bot's work in agents' daily output | about 50 |
| L1 | First response before automation | up to 25 h |
| L2 | Resolution before automation | up to 3 days (72 h) |
| L3 | First response to resolution, L2 minus L1 | 47 h |
| F1 | Resolved at the first agent touch | about 70% |
| K1 | Players choosing the right category | about 80% |
| C1, C2 | Account recovery tickets identified at launch, and accuracy | 52%, about 93% |

The design in that post is the design to copy:

- **Classify first.** Riot trained classifiers on about 100,000 completed tickets per major language. One player in five picks the wrong category, so routing on the player's choice alone puts a fifth of tickets in the wrong queue. Store both the player's category and the classifier's (`category_source` above), and measure how often agents correct each.
- **Automate runbooks, not conversations.** The post's example is a promotional skin: the bot checks regional eligibility and sends a "Not Available" response if the player isn't eligible, escalates to an agent if the player already owns the skin, and otherwise grants it and responds. Every branch is a rule over known data, and the odd case goes to a person. That's [decide in code](/docs/architecture/ai-agents#decide-in-code): the model classifies, the code acts.
- **Keep a human one click away.** Satisfaction with bot answers dropped noticeably compared with agents at first. Riot added an opt-out checkbox to the ticket form and replaced the bot's closing line with a "Request a Human" button; most players didn't opt out, and satisfaction rose to match human agents.
- **Leave denials to people.** Denials delivered by the bot (Riot's examples include questions about bans and requests for free Riot Points) scored about 20% lower satisfaction than when an agent delivered them, so Riot deprioritized automating them. The answer was the same; who said it changed how it landed. Automate the yeses and the routing; let a person say no.

At the time of the post the bot routed or answered 20% of all tickets, the daily output of about 50 agents. Current vendors claim far higher automation rates (Helpshift advertises "70%+" automation and an AI agent that "autonomously resolves routine issues end-to-end"); treat those as vendor marketing, and measure on your own tickets with satisfaction and reopen rates next to the automation rate. A bot that closes tickets players reopen is moving work, not removing it.

Language-model agents make the conversational part easier and the risks larger: a support agent with tools can grant items, issue refunds and change accounts. Every rule in [AI Agents in the Product](/docs/architecture/ai-agents) applies (narrow tools, identity before account actions, typed results, audited tool calls), and the bot is a staff member with limits, as [Service Accounts Are Users](/docs/security/support-access#service-accounts-are-users) puts it.

## Purchases and Refunds

"I paid and didn't get it" and "I want my money back" are the tickets with money attached, and they're where support, the store and the [entitlements](/books/gaming/economies-and-entitlements) system meet.

**Who refunds depends on who sold it.** A purchase on a console store, Steam or a mobile app store is the platform's transaction, under the platform's refund policy; the game finds out through the platform's notifications and has to revoke what it granted. A purchase in the game's own web store is yours. [Stores, Fees & Payments](/books/gaming/stores-and-payments) covers the stores and their notifications; support needs a view that shows, for any purchase, which store sold it, its state there and what was granted.

**Platform policies set expectations.** Each store's refund rules are in [Stores, Fees & Payments](/books/gaming/stores-and-payments#refunds-and-chargebacks); what support needs is those rules in the help center, in the agent's macros, and in the purchase view, so an agent can say which store decides before the player asks the wrong one.

**Support applies the clawback rule; it doesn't invent one.** An agent's refund button calls the one algorithm in [Refunds, Chargebacks and Clawbacks](/books/gaming/economies-and-entitlements#refunds-chargebacks-and-clawbacks), with the policy for spent currency decided before launch; every grant, revocation and goodwill credit is an entitlement or [ledger](/books/gaming/economies-and-entitlements#wallets-are-ledgers) entry with a reason, never a balance edit. A chargeback is never by itself a reason to lock the account ([The FTC's Orders](/books/gaming/consumer-law-and-loot-boxes#the-ftc-s-orders)).

**Missing grants are a reconciliation problem.** Most "paid but didn't get it" tickets are a grant that failed after a successful charge. A job that reconciles store transactions against grants and fixes the gaps (idempotently, keyed by the store's transaction ID, as [Idempotency](/docs/payments/idempotency) describes) prevents the ticket instead of answering it.

## Account Recovery

Account recovery is the ticket where support can do the most damage. Riot's bot post singles it out as a category worth its own classifier: at launch, it identified 52% of account recovery tickets with about 93% accuracy. Game accounts are shared, sold, forgotten and stolen, and their value (rare items, rank, years of purchases) makes them targets.

The danger is that support is the easiest way to take over an account. "I lost access, please change the email to this one" is the attacker's script as often as the owner's. The rules in [Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login) apply, and [Accounts, Identity & Cross-Platform](/books/gaming/accounts-and-identity) covers how game accounts link to platform identities:

- **Self-service first.** Most recovery should never reach a person: reset through the verified email or phone, or sign in through a linked platform identity (console, Steam, mobile) that proves ownership on its own.
- **Agents verify, they don't decide by sympathy.** Recovery by an agent uses evidence the attacker is unlikely to have: purchase receipts with transaction IDs, the original email, past payment details, devices and regions the account has used. Score the evidence against a written threshold, record what was checked, and require a second person for high-value accounts.
- **Agents never set sign-in factors directly.** The agent unlocks the self-service flow to a verified contact point; the player sets the new password or passkey. Support Access lists sign-in factors among what a delegated session can never change.
- **Notify the old contact points** when recovery changes the email or phone, with a way to reverse it for a period. A legitimate owner who gets the notice can stop a takeover in progress.
- **Restore after takeover through the ledger.** Items and currency an attacker spent or traded away come back as reversing entries with a reason code, and traded items may need to be pulled back from other accounts, under a written rule.

## Behavior Tickets and Ban Appeals

Players who were banned write to support, and so do players who were harassed. Both are moderation work wearing a support ticket's clothes. The Fair Play Alliance's guide to planning a penalty and reporting system warns that behavior-related tickets are harder than other support requests (players may disagree with how you assessed their behavior, or feel you aren't doing enough) and that "passing judgment on behavior is more taxing than almost any other support request yet lumped together as part of day-to-day support".

Route them out of general support:

- **Ban appeals go to the moderation appeal flow** in [Player Behavior & Moderation](/books/gaming/player-behavior), reviewed by someone other than the original decision-maker, recorded as a new decision. A general support agent who unbans a player because the ticket was persuasive has bypassed the whole system. Riot's privacy notice describes appeals where a player can ask an agent to make "a final manual determination"; that agent belongs to the behavior team's process, with its evidence and its records.
- **Harassment reports that arrive as tickets** become moderation reports with the ticket attached, not a reply saying "please use the in-game report button".
- **Threats to life and child safety** follow the urgent path in [Trust & Safety](/docs/security/trust-and-safety#child-safety), with written escalation steps, from any channel, at any hour.
- **Tell agents what they can't say.** Support explains the rule and the evidence the player was shown; it doesn't reveal reporters, detection thresholds or other players' data.

## Support Access to Player Data

Support agents in a game can see private messages, purchase histories and linked accounts, and can grant items worth money. That makes the support console a target from both sides: an attacker who phishes an agent, and an agent who grants items to a friend or browses a streamer's account. [Support Access & Internal Tools](/docs/security/support-access) is the full design; the game-specific parts:

- **Find by anything a player quotes:** account name and tag, email, platform ID (a console gamertag, a Steam ID), store transaction ID, match ID.
- **Grants and restorations are named operations** through the same entitlement service the game uses, with a reason code and a ticket, and a second approver above a value threshold. The bot's runbook and the agent's button call the same operation.
- **High-profile accounts** (streamers, pros, staff) are flagged, and opening them alerts someone, because they're the accounts insiders browse and attackers target.
- **Every read is logged,** including chat logs viewed while investigating a behavior ticket.

## How to Build It

The helpdesk holds the conversation; the game's backend holds what support is allowed to do. The ticket itself moves through the playbook's [ticket states](/docs/operations/customer-support#ticket-states); the game twist is that tickets which become moderation reports or appeals stay linked but leave that machine, because their outcome is a moderation decision, not a support resolution.

**Operations, not buttons.** As in [Actions Are Operations](/docs/operations/customer-support#actions-are-operations), each thing support can change is an operation with a kind, a cap and an approval rule; a game's kinds are these:

```sql
CREATE TABLE support_operations (           -- every action support takes on a player's behalf
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  ticket_id         UUID NOT NULL REFERENCES support_tickets (id),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  kind              TEXT NOT NULL CHECK (kind IN ('grant_item', 'grant_currency', 'restore_item',
                      'reverse_takeover', 'refund_own_store', 'unlock_recovery',
                      'route_to_moderation')),
  idempotency_key   TEXT NOT NULL,          -- ticket + kind + target, so a double click grants once
  requested_by      TEXT NOT NULL,          -- typed actor: 'agent:<id>', 'bot:<runbook>'
  value_minor       BIGINT,                 -- real-money value, for thresholds
  approved_by       TEXT,                   -- required above the threshold; never the requester
  status            TEXT NOT NULL CHECK (status IN ('pending_approval', 'applied', 'rejected')),
  result_ref        TEXT,                   -- the entitlement or ledger transaction it produced
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at        TIMESTAMPTZ,
  UNIQUE (tenant_id, idempotency_key),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);
```

The decisions behind it:

- **The operation calls the owning service.** A grant goes through the entitlement service with `granted_by` set to the agent or bot and `source_ref` set to the ticket ([Entitlements Are the Source of Truth](/books/gaming/economies-and-entitlements#entitlements-are-the-source-of-truth)); support never writes to entitlement or ledger tables itself.
- **Caps per actor and per day,** in configuration: a bot's runbook can grant the promotional skin and nothing else; an agent can grant up to a value without approval; above it, a second person approves ([Approvals, and Nobody Approves Their Own](/docs/security/support-access#approvals-and-nobody-approves-their-own)).
- **Sign-in factors are not an operation.** `unlock_recovery` reopens self-service to a verified contact point; there is deliberately no `set_email` or `set_password`.
- **Bans are not an operation either.** `route_to_moderation` hands the ticket to the appeal flow; support has no way to end a penalty.

My default for a new game: ship the operation catalog and the ticket context before launch with a small set of kinds, and add a kind only when a ticket category has shown up often enough to write its runbook. An agent with a general-purpose "edit account" screen is a support team waiting for its first insider incident.

## Auditing

Support is a privileged path to other people's accounts, and its record has to answer three questions afterward:

- **Who changed what on this account, and why?** Every `support_operations` row names the ticket, the requester, the approver above the threshold and the entitlement or ledger transaction it produced, so a player's "my items vanished" and an investigator's "who granted these" read the same rows.
- **Who looked?** Opening a player's purchases, chat or recovery history is logged per agent and per field, as [Logging Support Access](/docs/security/support-access#logging-support-access) describes; flagged high-profile accounts (streamers, pros, staff) alert on any access.
- **Did support reverse a penalty?** It can't: `route_to_moderation` is the only behavior operation, and any penalty change appears as a moderation decision by an appeal reviewer, never as a support operation.

A weekly review of operations per agent against peers (grant value, grants to the same accounts, approvals by the same pair) finds the insider case before a player does.

## Measuring Support

The general set (response and resolution time as distributions, first-contact resolution, satisfaction, reopen rate) is in [Metrics](/docs/operations/customer-support#metrics). Riot's numbers give a game's baseline: "up to 25 hours" is the response tail players remember, first-contact resolution was about 70% for agents, and satisfaction per resolver is how Riot found that denials should stay human. The game-specific number is **contact rate per active player** around launches, patches and outages, joined to [telemetry](/books/gaming/telemetry), so a spike in "lost items" tickets after a patch reads as a bug report, not a staffing problem.

That one is the most valuable. Support tickets are the best bug tracker a live game has, and the [live operations](/books/gaming/live-operations) team should see ticket volume by category on the same dashboard as crash rates.

## What This Means for the System You Build

- **An in-game entry point on every platform,** a web help center for locked-out players, and console-to-phone handoff where typing is hard.
- **Tickets that carry context from the server:** account, platform identity, build, region, last match, recent purchases and penalties, masked for agents by default.
- **Classifiers per language,** the player's and the model's category both stored, and runbooks that act through code with escalation for odd cases.
- **A human one click away,** with denials, bans and judgment calls left to people, and automation measured by satisfaction and reopen rate, not just volume.
- **A purchase view across stores,** a refund rule per item type, grants and revocations as ledger entries, and a reconciliation job that fixes missed grants before players write in.
- **Recovery that favors self-service** and platform identity proofs, written evidence thresholds for agents, notices to old contact points, and no direct changes to sign-in factors.
- **Behavior tickets routed to moderation,** with appeals in the moderation flow and urgent cases on a staffed path.
- **A support console built to the playbook's access rules,** with every change a named, idempotent operation that calls the owning service, caps per actor, a second approver above a value, no operation for sign-in factors or bans, flagged high-profile accounts and every read logged.

## References

**Reference**

- [Fair Play Alliance and ADL: Planning a Penalty and Reporting System](https://thrivingingames.org/wp-content/uploads/2020/12/FPA-Framework-Planning-Penalty-Reporting-System.pdf), behavior tickets in player support and their toll on staff

**In practice**

- [Riot Games: Blitzcrank Bot](https://www.riotgames.com/en/news/blitzcrank-bot), request volume, response and resolution times, classifiers, runbooks, Request a Human and why denials stayed with agents
- [Riot Games: Privacy Notice](https://www.riotgames.com/en/privacy-notice), appeals with a final manual determination by an agent
- [Zendesk: Unity and Zendesk partnership](https://www.zendesk.com/company/press/unity-zendesk-partnership/), the in-game help center, messaging and game-specific fields in the Unity SDK
- [Helpshift](https://www.helpshift.com/), in-game support SDKs, player context, console handoff by QR code and automation claims
