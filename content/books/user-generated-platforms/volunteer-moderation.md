+++
title = "Volunteer Moderation & Community Governance"
nav_title = "Volunteer Moderation"
description = "Community rules over sitewide rules, automod rules engines, mod queues, logs and mail, moderator caps and accountability, and the 2023 blackout."
category = "User-Generated Platforms Industry"
order = 1810
part = "Communities and Conversation"
tags = ["user-generated-content", "moderation", "automod", "governance", "trust-and-safety"]
+++

Most moderation on community platforms is done by people the platform doesn't pay. Volunteer moderators write their community's rules, configure its filters, read its reports, remove posts, ban members and answer appeals, every day, for free. Reddit's transparency report for the second half of 2025 counts 154,198,211 posts and comments removed, 52.7% by community moderators and 44.7% by Reddit's admins, and 68.6% of the moderators' removals were made by automated tools they configured. Discord servers, Twitch channels, Mastodon instances, Facebook Groups and wikis work the same way. The platform's moderation stack is two stacks: the platform's own, enforcing sitewide rules and the law, and the communities', enforcing everything else.

That shape is a business dependency with governance problems. The work has a measurable value (a 2022 study estimated Reddit moderators' unpaid work at a minimum of 466 hours a day in 2020, about $3.4 million a year at comparable wages), and the people doing it can stop. Reddit's 10-K lists among its risks that moderators are volunteers, harder to recruit as communities grow, and that coordinated moderator action can degrade communities, which is what happened in June 2023. A platform that depends on volunteers has to give them tools good enough to do the work, rules that bound their power, and a relationship that survives disagreements.

The general moderation machinery is the playbook's [Trust & Safety](/docs/security/trust-and-safety): policy as a specification, reports and queues, penalty ladders, notices and statements of reasons, appeals, audit, transparency and moderator wellbeing. This chapter covers what volunteer moderation adds: the two tiers of rules, who moderates on each platform, automod rules engines, mod queues, logs and mail, apps and bots for moderation, the platform's controls over moderators (caps, codes of conduct, removal), the 2023 blackout as a case in governance, and what to measure. It adds community rules, removal reasons, automod rules and the moderator action log to [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Staff and outsourced review at scale is Moderation at Scale; live-stream channel moderators are Live Chat & the Interactive Layer.

## How the Platforms Do It

| Platform | Who moderates communities | Automation they control | Platform's control over them |
| --- | --- | --- | --- |
| **Reddit** | Volunteer moderators per community, with full or partial permissions | AutoModerator rules and moderation apps on its developer platform; 68.6% of moderator removals automated in the second half of 2025 | Moderator Code of Conduct; community bans; a 2025 limit on how many large communities one person may moderate |
| **Discord** | Server owners and members with moderation roles | AutoMod with keyword, regex, spam, mention-spam and profile rules; moderation bots | Community guidelines; server and account enforcement |
| **Mastodon** | Each server's owner, admins and moderators | Local filters, domain blocks, moderation webhooks | None above the server; other servers decide whether to federate ([Federation & Open Protocols](/books/user-generated-platforms/federation)) |
| **Twitch** | Broadcaster's moderators | Channel chat tools (Live Chat & the Interactive Layer) | Platform guidelines and enforcement on the channel |

The pattern is **delegation within bounds.** Every platform lets communities be stricter than the sitewide rules, gives their moderators removal, ban and filter powers scoped to the community, and keeps for itself the sitewide rules, the law, account-level penalties and the power to remove the moderators. Mastodon is the edge case: the community and the operator are the same, so there's no platform above to appeal to, only other servers that can stop federating.

## Two Tiers of Rules

**Sitewide rules apply everywhere; community rules apply on top.** Reddit describes it directly: users create communities and establish additional rules that moderators enforce independently, and mod enforcement "can be based on any reason specific to the rules of a given community" and isn't necessarily a sitewide violation. A cooking community can require recipes in every post; a support community can ban medical advice; a meme community can ban reposts. None of those are platform policy, and the platform shouldn't count them as violations of its rules.

The tiers need to stay distinguishable in the data:

- **A removal records which rule it enforced:** a community rule (with its version) or a sitewide policy category. That's what lets the transparency report say how much was removed for being off-topic versus for breaking platform rules, and what lets an author know whether to appeal to the community or to the platform.
- **Community rules are versioned text** the community publishes, shown on the community and cited in removal notices, the same "policy is the specification" principle as the playbook's [Policy Is the Specification](/docs/security/trust-and-safety#policy-is-the-specification), at community scale.
- **A community can't be looser.** Communities choose stricter rules and a content rating; they can't permit what sitewide rules forbid, and a sitewide removal can't be reversed by a community moderator.
- **Escalation goes up.** Moderators who see something beyond their remit (a credible threat, child sexual abuse material, an account farm) report it to the platform, and that report should get priority over an ordinary user's.

## Automod: Rules Engines for Volunteers

Automated rules are how a handful of volunteers moderate a community of millions. Two public engines show the range.

**Reddit's AutoModerator** is a per-community rules engine that moderators configure themselves: rules match conditions on a post or comment and on its author's account, and act on matches, removing an item, holding it for review or reporting it to the moderators. Reddit's transparency report names it, with moderation apps on its developer platform, as the automation behind the 68.6% of moderator removals that were automated. Conditions on the author's account (its age, its reputation) are the natural use, because new and farmed accounts are where spam comes from.

**Discord's AutoMod** is a structured engine with published limits, which make a good reference for what a platform can safely offer:

| Trigger | Rules per server | Matches |
| --- | --- | --- |
| Keyword | 6 | Up to 1,000 keywords of 60 characters and up to 10 Rust-flavored regular expressions of 260 characters, with allow lists |
| Spam | 1 | Generic spam |
| Keyword preset | 1 | Platform-maintained lists: profanity, sexual content, slurs |
| Mention spam | 1 | More than a set number of unique mentions (up to 50) |
| Member profile | 1 | Keywords in a member's name or profile |

Actions are block the message (with an optional custom explanation of up to 150 characters), send an alert to a moderators' channel, time the member out (up to 2,419,200 seconds, four weeks, and only for keyword and mention-spam rules), or block the member's interactions; each rule can exempt up to 20 roles and 50 channels.

The design lessons from both:

- **Offer structured rules first, expressions second.** Keyword lists with allow lists and platform-maintained presets serve most communities; regular expressions are powerful and easy to get catastrophically wrong, so cap their number, length and flavor (a linear-time engine such as Rust's, which can't be made to backtrack forever).
- **Filter, don't only remove.** "Hold for review" is the action that lets a cautious rule run without silencing legitimate members; it feeds the mod queue.
- **Bound the blast radius.** Limits per community on rules, keywords and timeouts keep a misconfigured rule from timing out every member, and exemptions for moderator roles keep it from locking out the people who can fix it.
- **Show who acted.** An automated removal is attributed to the rule and the moderator who last changed it, so the mod log and the author's notice say "removed by AutoMod under rule X" rather than leaving a mystery.
- **Platform presets are the platform's policy.** A preset list of slurs is maintained by the platform, versioned, and applied identically everywhere it's enabled; communities choose to enable it, not edit it.

Rules engines in general (versioned rules, effective dates, recording which rule decided) are the playbook's [Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided); automod is that pattern handed to non-engineers, which is why the limits and the attribution matter more than the expressiveness.

## Queues, Logs and Mail

Volunteer moderators work out of three tools, and each maps onto the playbook's model with community scope:

- **The mod queue** holds reported items and items filtered by automod, for the community's moderators. It's the playbook's [reports and queues](/docs/security/trust-and-safety#reports-and-queues) with `scope = 'community'` on the case: reports about community-rule breaches go to the community's queue; reports about sitewide violations go to the platform's, and many reports go to both. Queue age matters as much here as in a staffed queue, with the difference that volunteers triage by the time they have, not by a service level.
- **The mod log** records every moderator action in the community, automated or manual: removals, approvals, bans, unbans, timeouts, locks, rule changes, automod edits, role changes. It's the community's accountability record, visible to its moderators and sometimes partly to members, and it's what the platform reads when investigating a moderator.
- **Modmail** is the conversation channel between members and the moderation team as a team, not as individuals: appeals of bans, questions about removals, reports that need explanation. Messages go to the team so a moderator's departure doesn't lose the conversation, and so no member has to message an individual moderator privately.

**Removal reasons** connect the three. A community defines reasons (one per rule, usually), a moderator picks one when removing, and the author's notice states it. Communities that send reasons get fewer repeat violations and fewer angry modmails; platforms that require a reason get data on which rules are enforced. Whether a volunteer's removal must meet the formal requirements the EU Digital Services Act sets for a provider's statement of reasons is a question for each platform's counsel: the duties fall on the provider, which is an argument for building community removals on the same notice machinery as platform removals ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)) so the platform can meet whatever it's held to.

**Community bans and appeals** follow the penalty model with `community_id` set: a ban from one community is a penalty scoped to it, not an account penalty ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)). The appeal goes to the community's moderators through modmail first; the platform's appeal path is for sitewide penalties, and for moderator conduct that breaks the platform's rules for moderators.

## Apps and Bots for Moderation

Volunteer communities build their own tools when the platform's aren't enough, and the platform has to decide whether to host that ecosystem or tolerate it. Reddit's transparency report counts moderation apps built on its developer platform among the automated tools behind moderator removals, beside AutoModerator; Discord's moderation is largely done by bots that read messages and act through its API; Mastodon offers moderation webhooks so admins can automate and alert. Which access those tools get, how they're reviewed and what happens when the API changes is [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis). The governance lesson is in the blackout below: **moderators' tools are infrastructure,** and changing the terms they run on is a moderation policy change whether the platform intends it or not.

## The Platform's Controls over Moderators

Delegating power needs limits on its holders:

- **A code of conduct.** Reddit's Moderator Code of Conduct sets expectations for moderators, accepts reports about moderators and communities, and is enforced by admins through outreach first and then actions that include removing moderators, temporarily restricting a community and limiting posting. In the second half of 2025 Reddit investigated and actioned 878 Code of Conduct reports from communities in 25 countries and sent 2,250 educational and enforcement messages; the grounds it names include allowing policy-violating content, interfering with other communities and inactive moderation.
- **Caps on concentration.** One person moderating dozens of the largest communities is a single point of failure and a lever over the platform. Reddit's 10-K says that in 2025 it limited how many large communities one user can moderate. A cap like this is configuration, by community size band, enforced when an invitation is accepted and checked periodically against current sizes, with a transition for moderators already over it.
- **Inactivity and abandonment.** Moderation teams that stop moderating leave communities to spam; Reddit's bans in the second half of 2025 for communities being unmoderated are the result. A process to hand inactive communities to active members, or close them, belongs to [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions).
- **Community-level enforcement.** The platform can quarantine, restrict or ban a whole community that won't enforce sitewide rules. Reddit banned 605,570 communities in the second half of 2025, most of them spam (76.7%), and repeated violation without receptiveness to requests is its stated ground for banning established ones.
- **Wellbeing.** Volunteers see the same harmful material staff do, without employer support. Blurring, grayscale and muted-by-default media in moderation tools, and the option to escalate the worst material straight to platform staff, apply to volunteers as much as to staff ([Moderator Wellbeing](/docs/security/trust-and-safety#moderator-wellbeing)).

## The 2023 Blackout

The clearest public case of what volunteer dependence means is Reddit in June 2023. On April 18, 2023, Reddit announced it would charge for access to its Data API; the terms, effective July 1, set free limits per OAuth client and a price of $0.24 per 1,000 calls above them (the pricing itself is [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis)'s subject). Third-party apps that many moderators used to moderate on mobile faced costs their developers said they couldn't pay; Apollo's developer estimated his would reach $20 million, and Apollo announced on June 8 that it would shut down on June 30.

On June 12, 2023, thousands of communities went private or restricted posting in protest; one tracker counted over 7,800. The protest was planned for 48 hours, and many communities extended it indefinitely. Reddit's administrators urged communities to reopen and warned that moderators who kept them closed could be replaced, and it later removed or replaced moderators of some communities under its Moderator Code of Conduct. Reddit exempted third-party moderation tools from the charges, and the new terms took effect as planned.

What it shows for a platform's design:

- **Moderators control availability.** A community's moderators can take it private with a setting. Thousands doing it at once is an outage of the platform's content, and the 10-K now lists coordinated moderator action as a risk.
- **Tool dependencies are invisible until they break.** The platform didn't know which moderation workflows ran on which third-party apps, so it couldn't predict the impact of an API change on moderation. Knowing which apps moderators use (from API client registrations) is part of moderation capacity planning.
- **The platform's powers over communities will be used.** Removing moderators who keep a community closed is within the rules on most platforms; using that power at scale is a governance event with reputational cost, and it should run through the same documented, logged process as any other moderator removal.
- **Volunteers need a voice before changes, not after.** Councils, advance notice, and exemptions decided before launch cost less than a blackout.

## What to Measure

- **Removals by tier and actor:** community moderators versus platform, manual versus automated, by community rule versus sitewide policy, the split Reddit reports.
- **Automation share** of moderator actions, and automod rule precision (how many automated removals are reversed by moderators or on appeal).
- **Queue age** per community, and communities whose queues aren't being worked (an early sign of abandonment).
- **Moderator coverage:** active moderators per community and per thousand active members, concentration of large communities among few moderators, and moderator churn.
- **Code of conduct reports and actions,** and community-level enforcement counts.

These feed the transparency report, which Transparency Reporting covers in full.

## How to Build It

The chapter's additions to the core model:

```sql
CREATE TABLE community_rules (           -- versioned, published community rules
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id  UUID NOT NULL REFERENCES communities (id),
  rule_key      TEXT NOT NULL,           -- stable across versions: 'no_reposts'
  version       INT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  applies_to    TEXT[] NOT NULL DEFAULT ARRAY['post', 'comment', 'message'],
  position      INT NOT NULL,
  valid_during  TSTZRANGE NOT NULL,
  created_by    UUID NOT NULL REFERENCES accounts (id),
  UNIQUE (community_id, rule_key, version),
  EXCLUDE USING GIST (community_id WITH =, rule_key WITH =, valid_during WITH &&)
);

CREATE TABLE removal_reasons (           -- what the author is told
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id     UUID NOT NULL REFERENCES communities (id),
  community_rule_id UUID REFERENCES community_rules (id),
  title            TEXT NOT NULL,
  message          TEXT NOT NULL,        -- the notice text, with placeholders
  active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE automod_rules (             -- versioned rules a community runs
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id  UUID NOT NULL REFERENCES communities (id),
  rule_key      TEXT NOT NULL,
  version       INT NOT NULL,
  trigger       TEXT NOT NULL CHECK (trigger IN ('keyword', 'regex', 'preset', 'spam',
                  'mention_spam', 'profile', 'author_conditions', 'link_domain')),
  conditions    JSONB NOT NULL,          -- validated against a schema per trigger
  actions       JSONB NOT NULL,          -- [{"type": "filter"}, {"type": "timeout", "seconds": 600}]
  exempt_role_ids UUID[] NOT NULL DEFAULT '{}',
  exempt_channel_ids UUID[] NOT NULL DEFAULT '{}',
  community_rule_id UUID REFERENCES community_rules (id),  -- the rule it enforces
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  valid_during  TSTZRANGE NOT NULL,
  edited_by     UUID NOT NULL REFERENCES accounts (id),
  UNIQUE (community_id, rule_key, version)
);

CREATE TABLE automod_matches (           -- every time a rule fired, and what it did
  id               UUID NOT NULL DEFAULT uuidv7(),
  matched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  automod_rule_id  UUID NOT NULL REFERENCES automod_rules (id),
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('content_item', 'message',
                     'profile')),
  subject_id       TEXT NOT NULL,        -- content item id, or channel and message id
  author_account_id UUID NOT NULL REFERENCES accounts (id),
  matched_text     TEXT,                 -- the matched span, kept for the rule's review
  actions_taken    TEXT[] NOT NULL,
  reversed_at      TIMESTAMPTZ,          -- a moderator approved it after all
  PRIMARY KEY (matched_at, id)
) PARTITION BY RANGE (matched_at);

CREATE TABLE moderator_actions (         -- the mod log: every moderator act in a community
  id                UUID NOT NULL DEFAULT uuidv7(),
  acted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  community_id      UUID NOT NULL REFERENCES communities (id),
  actor_type        TEXT NOT NULL CHECK (actor_type IN ('moderator', 'automod', 'app',
                      'platform')),
  actor_account_id  UUID REFERENCES accounts (id),
  actor_role_position INT,               -- the actor's rank when acting
  automod_rule_id   UUID REFERENCES automod_rules (id),
  app_id            UUID,                -- apps.id when a moderation app acted
  action            TEXT NOT NULL,       -- 'remove', 'approve', 'ban', 'timeout', 'lock',
                                         -- 'rule_edit', 'role_grant', 'room_mute', ...
  target_type       TEXT NOT NULL,
  target_id         TEXT NOT NULL,
  community_rule_id UUID REFERENCES community_rules (id),
  removal_reason_id UUID REFERENCES removal_reasons (id),
  moderation_decision_id UUID REFERENCES moderation_decisions (id),
  details           JSONB,
  PRIMARY KEY (acted_at, id)
) PARTITION BY RANGE (acted_at);

CREATE TABLE moderation_limits (         -- platform caps on moderators, as data
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  limit_key     TEXT NOT NULL,           -- 'large_communities_per_moderator'
  size_metric   TEXT NOT NULL,           -- 'weekly_visitors'
  size_threshold BIGINT NOT NULL,
  max_count     INT NOT NULL,
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (limit_key WITH =, valid_during WITH &&)
);

ALTER TABLE moderation_decisions
  ADD COLUMN community_rule_id UUID REFERENCES community_rules (id),  -- when a community rule
  ADD COLUMN removal_reason_id UUID REFERENCES removal_reasons (id);   -- decided it
```

Notes on the sketch:

- **Community decisions are decisions.** A moderator's removal on a reported item writes a `moderation_decisions` row on the community-scoped case (with `actor_type = 'moderator'`, the community rule and the removal reason) and a `moderator_actions` row; actions with no case (a lock, an approval of a filtered item, a rule edit) write only the log. One pipeline serves notices, appeals and transparency counts ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)).
- **Rules and automod are versioned by ranges.** A decision references the rule version in force; editing a rule closes its range and opens a new one, so "which rule removed this, as it was worded then" has an answer.
- **Automod validates before it saves.** Conditions are checked against a schema per trigger and against the platform's limits (counts, lengths, regex flavor and size), and new rules can run in a report-only mode first, logging matches without acting, so moderators see a rule's effect before it removes anything.
- **Matches feed precision.** `automod_matches.reversed_at` is set when a moderator approves a filtered item or an appeal overturns an automated removal; precision per rule is a query, shown to the community's moderators.
- **Caps are data.** `moderation_limits` holds the current cap; a check runs when a moderator invite is accepted and on a schedule against current community sizes, opening a case for the platform's community team rather than removing anyone automatically.
- **The mod log is append-only** and partitioned by time; moderators see their community's log, the platform sees all of them.
- **Events:** `automod.matched`, `moderator.action`, `community_rule.updated`, `automod_rule.updated`, `moderator.added`, `moderator.removed` and `moderation_limit.exceeded` go through the outbox to notices, analytics and the platform's community team ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **The mod log, complete:** every human, automod, app and platform action in each community, with the actor's rank at the time and the rule and reason cited.
- **Rule and automod history,** with editors and versions, because an automated removal is only as legitimate as the rule that made it.
- **Moderator appointments and removals,** including the platform's removals of moderators and the code of conduct case behind each.
- **Community-level enforcement:** quarantines, restrictions, bans and closures, with grounds.
- **The tier of every removal** (community rule or sitewide policy, moderator or platform, automated or not), which is what transparency reports and regulators count ([Transparency Reporting](/docs/security/trust-and-safety#transparency-reporting)).

## What This Means for the System You Build

- **Keep two tiers of rules,** let communities be stricter but never looser, and record which tier and which rule each removal enforced.
- **Version community rules** and cite them in removal notices.
- **Ship a structured automod** with presets, allow lists, report-only mode, exemptions and hard limits; offer regular expressions only in a linear-time flavor.
- **Attribute every automated action** to its rule and the rule's last editor.
- **Route reports by tier:** community rules to the community's queue, sitewide policy to the platform's, the worst categories straight to staff.
- **Give moderators a team inbox, a complete mod log and removal reasons.**
- **Run community decisions through the same decision and notice pipeline** as platform decisions.
- **Treat moderators' tools as infrastructure:** know which apps they depend on before changing API terms.
- **Bound moderator power** with a code of conduct, concentration caps as data, and an abandonment process.
- **Measure volunteer moderation** (automation share, rule precision, queue age, coverage and churn) as operating metrics, not anecdotes.

## References

**Reference**

- [Discord Developer Docs: Auto Moderation](https://docs.discord.com/developers/resources/auto-moderation), trigger types and per-server limits, keyword and regex limits, actions, timeout maximum and exemptions

**Research**

- [Li, Hecht and Chancellor: Measuring the Monetary Value of Online Volunteer Work (ICWSM 2022)](https://arxiv.org/abs/2205.14528), Reddit moderators' minimum hours per day in 2020 and their value at comparable wages

**In practice**

- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), removals by moderators and admins, the automated share of moderator removals including AutoModerator and developer-platform apps, community rules over Reddit Rules, community bans and Moderator Code of Conduct actions
- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), moderator recruitment and coordinated moderator action as risk factors, the 2025 limit on moderating large communities
- [Wikipedia: 2023 Reddit API controversy](https://en.wikipedia.org/wiki/2023_Reddit_API_controversy), the announcement and effective dates, the blackout from June 12, 2023 and its extension, Reddit's warnings and moderator replacements, the exemption for moderation tools
- [PCWorld: Reddit goes dark as user protest begins](https://www.pcworld.com/article/1949992/reddit-goes-dark-as-user-protest-begins.html), over 7,800 communities dark, the $0.24 per 1,000 calls price and the Apollo cost estimate (June 2023)
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), local moderation, domain blocks and moderation webhooks
