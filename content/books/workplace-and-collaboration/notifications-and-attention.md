+++
title = "Notifications, Presence & Attention"
description = "Who gets interrupted and when: mentions, keywords, presence, do-not-disturb, badges across devices, digests, push relays and right-to-disconnect laws."
category = "Workplace & Collaboration Industry"
order = 2015
part = "Chat and Messaging"
tags = ["notifications", "presence", "chat", "right-to-disconnect", "mobile-push"]
nav_title = "Notifications & Presence"
+++

A workplace chat product's most consequential output isn't a message; it's an interruption. Microsoft's 2025 analysis of anonymized Microsoft 365 signals found the average worker receiving 117 emails and 153 Teams messages a weekday, more than 50 messages outside core business hours, and interruptions roughly every two minutes during the day. Every one of those notifications was a decision some piece of software made: whether this message, for this person, on this device, at this moment, should make a sound.

The decision is hard for three reasons. It has many inputs (who sent it, where, whether it mentions the recipient, what they've told the product they care about, whether they're active on another device, whether they're in a meeting, what time it is where they are). It has several owners: the member sets preferences, the sender can escalate, the admin sets defaults and limits, and the law in some countries sets duties about contact outside working hours. And it has to be consistent across a desktop app, a browser tab, a phone and an email digest, so a message read in one place stops nagging in the others.

This chapter covers what triggers a notification, presence, do-not-disturb and escalation, unread state and badges across devices, push delivery (including how self-hosted products reach phones), email fallbacks, and the right-to-disconnect laws that turn a product setting into an employer's compliance tool. The generic machinery (a consent ledger, one outbound gate, provider errors, push tokens) is the playbook's [Notifications & Consent](/docs/architecture/notifications); the conversation models these notifications come from are [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat); unread markers are in [Chat at Scale](/books/workplace-and-collaboration/chat-architecture#ordering-unread-state-and-badges). Wage-hour risk of after-hours messages to hourly workers is in [Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers#after-hours-messages-and-wage-hour-law).

## How the Platforms Do It

As of October 2026:

| Product | Default triggers | Presence | Quiet time | Escalation past quiet time | Missed-activity email |
| --- | --- | --- | --- | --- | --- |
| **Slack** | DMs, mentions, channel-wide mentions, keywords; thread replies for participants | Active while the app is open; away after 10 minutes of desktop inactivity or when the mobile app is closed | Pause notifications; recurring schedule; admin default schedule | A DM sender can override a pause for an urgent message, once per day | Bundled every 15 minutes or hourly |
| **Microsoft Teams** | Chat messages and mentions; team and channel mentions set by owners | Computed from activity, app state and the Outlook calendar; eight-level availability order | Do not disturb; focus time from the calendar | Priority access list; urgent messages repeat every 2 minutes for 20 minutes | Missed activity emails (shared channels excluded) |
| **Google Chat** | Per space: all, main conversations, "for you" (mentions and followed threads), none | Status including Do not disturb | Do not disturb, muted conversations | Not covered here | Not covered here |
| **Mattermost** | Threads auto-followed on participation or mention | Not covered here | Not covered here | Not covered here | Not covered here |

Two patterns stand out. **Presence is derived, not declared:** both Slack and Teams compute it from activity and app state, and Teams adds the calendar. And **quiet time has an escape hatch with a limit:** Slack's once-a-day urgent override and Teams' priority access list both exist so that do-not-disturb is usable, because a setting that blocks a real emergency gets turned off.

## What Triggers a Notification

### Direct, Mention and Keyword

The baseline every product shares: a DM notifies; a mention of you notifies; a mention of a group you're in notifies; a keyword you've registered notifies. Slack's defaults are exactly that: someone sends you a DM, mentions you, notifies a channel you're in, or uses one of your keywords. Everything else (every message in a busy channel) is opt-in per channel.

Threads complicate the baseline. Slack notifies thread replies only to people who started the thread, replied to it or were mentioned in it, except in one-to-one DMs where all thread replies notify; anyone can follow or mute a single thread, and a channel can be set to notify about all replies. Google Chat's per-space choice is "All," "Main conversations," "For you" (mentions and threads you follow) or "None," where None still shows an indicator for mentions. The rule both encode: **participation is consent to follow.** Replying or being mentioned subscribes you; reading doesn't.

### Channel-Wide Mentions

`@channel`, `@here`, `@everyone`, `@team` are the most abused feature in workplace chat, so every product puts policy around them:

- Slack's `@channel` notifies every member whether active or away, `@here` only active members, and `@everyone` only works in the general channel. Channels with at least six members ask for confirmation, owners and admins can restrict who may use them, and in Enterprise organizations channels of 10,000 or more members allow them only for owners and admins. They don't notify people whose notifications are paused.
- Teams blocks team and channel mentions in teams over 10,000 members, and team owners can turn off mentioning the whole team or channel.
- Teams' **shift-based tags** go further: a tag like `@Cashiers` notifies only the people on shift at the moment it's used, from the Shifts schedule ([Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers#communicating-with-a-shift)).

A broadcast mention is a fan-out multiplier: one keystroke becomes thousands of pushes. My rule is that broadcast mentions are a permission with a size threshold, confirmed by the sender above a small channel size, and that `@here`-style "active only" is the default suggestion.

### Senders' Signals

Some products let the sender mark importance. Teams has **important** and **urgent** messages; urgent ones use priority notifications that "notify users every 2 minutes for 20 minutes or until messages that are marked as urgent are picked up and read," can't be edited after sending, and are enabled per user by messaging policy. Slack's equivalent is narrower: a DM sender can push a notification through a recipient's pause for an urgent message, once per day. Sender escalation needs a cap, or every message becomes urgent.

## Presence

Presence answers "is this person around?" and feeds both the sender (should I expect an answer?) and the notification decision (should this push go to their phone?).

**Slack** keeps it simple: a member is active while Slack is open, becomes away after 10 minutes of desktop inactivity, and on mobile becomes away on leaving or closing the app; members can set themselves away at any time and schedule up to five statuses with start and end times. Presence is served by dedicated presence servers, and clients receive updates only for users visible on screen.

**Teams** computes presence from three sources (user activity, the state of the Teams app, and the Outlook calendar) and orders the result from most to least available: Available, Busy, In a meeting, In a call, Do not disturb, Be right back, Away, Offline. The details are a specification worth copying:

- On a computer, a user becomes Away after a few minutes of inactivity or when the machine locks, and Offline when it sleeps; on mobile, Away whenever the app is in the background and Offline after 24 hours of inactivity.
- When signed in on several devices, the most recently active device determines presence.
- The calendar sets In a meeting during scheduled meetings, Out of Office from automatic replies or an out-of-office event, and Focusing from focus time scheduled through Viva Insights.
- A manually chosen status can only be less available than the computed one (except during calls and meetings), and without an explicit duration lasts indefinitely for Appear offline, one day for Busy or Do not disturb, and seven days for anything else.
- Through Microsoft Graph, each client and each app holds a **presence session**; the user's presence is aggregated with a user-preferred state overriding sessions and, among sessions, Do not disturb over Busy over Available over Away. An Available session fades to Away in two five-minute timeouts unless refreshed, and sessions expire after five minutes by default, configurable up to four hours.

Two policy points follow. **Presence is personal data about work patterns.** Teams shows presence to everyone in every organization by default, external access settings decide which other organizations can see it, and a tenant-wide privacy mode stops presence leaving the organization at all. Who can see presence, and whether "last seen" is shown, are admin decisions (the Employee Monitoring & Privacy chapter covers what presence must not be used for). And **presence drives delivery:** a user active on desktop shouldn't also get a phone buzz, which is the main reason presence has to be accurate across devices.

## Do Not Disturb, Schedules and Breakthrough

Every product has a manual pause and most have a schedule:

- **Slack** pauses all notifications for a chosen period (also `/dnd for 15 mins`), shows a snooze icon to others, and lets members set a recurring notification schedule so they're notified only on chosen days and hours. Owners and admins can set a default schedule for the workspace or organization, which a member's own schedule overrides. It's on all plans.
- **Teams** delivers chats regardless of presence but shows no banners in Do not disturb, sends calls to voicemail, and lets users add people to a priority access list whose messages and calls break through.
- **Google Chat** pauses notifications when status is Do not disturb or a conversation is muted.

The admin-default schedule is the workplace-specific feature here. An employer that wants evenings quiet can make that the default for everyone instead of hoping each person finds the setting, which matters for the laws below.

Breakthrough must be bounded on both sides: a recipient-chosen allowlist (priority access) and a sender-side escalation with a rate limit (once a day, or a repeating urgent alert that stops when read). I treat both as audited events, because "I sent it urgent at 2 a.m." is exactly the record an after-hours dispute turns on.

## Unread, Badges and Many Devices

A workplace user has a desktop app, a browser tab, a phone and sometimes a tablet. The notification system has to answer, per message: notify where, and when to stop?

- **Route by activity.** If the member is active on desktop, don't push to the phone. Slack lets members choose to get mobile notifications as soon as they're inactive on desktop or after an additional delay; Teams takes presence from the most recently active device. Both amount to a delivery delay for the phone that's cancelled if the message is read elsewhere first.
- **The badge is the server's number.** The badge is computed from server-side read markers and mention counters ([Ordering, Unread State and Badges](/books/workplace-and-collaboration/chat-architecture#ordering-unread-state-and-badges)), and a read on any device updates every other device. Matrix's sync API makes the split explicit with a `notification_count` and a separate `highlight_count` for mentions and keywords.
- **Collapse and supersede.** Push systems have their own storage limits. FCM keeps at most four distinct collapse keys per device, stores up to 100 non-collapsible messages for an offline device and discards them all on overflow (sending a special message so the app knows to resync), and maps collapsible messages to `apns-collapse-id` on Apple devices. A burst of chat messages to an offline phone should collapse to "12 new messages in #ops," not overflow.
- **Choose an interruption level.** iOS lets an app mark a notification passive (added to the list silently), active (the default: screen lights, sound), time-sensitive (breaks through system notification controls such as Focus) or critical (bypasses the mute switch, under a restricted entitlement). A workplace app should send ordinary channel activity as passive or active, reserve time-sensitive for DMs and mentions the member opted into, and never send critical.
- **Keep content off the lock screen when required.** Payloads show on lock screens and pass through Apple's and Google's services; the playbook's [Push Notifications](/docs/architecture/notifications#push-notifications) rule (send a short notice, fetch the content in the app) is the default, and some customers will require it.

## Push Through Someone Else's Pipe

A SaaS vendor sends pushes to APNs and FCM from its own servers. A self-hosted chat server can't: the mobile app in the store is signed by the vendor, so push credentials belong to the vendor, not to each customer's server. Self-hosted products solve this with a relay, and the relay is a privacy decision:

- **Zulip** runs a Mobile Push Notification Service because Apple's and Google's security model "does not allow self-hosted Zulip servers to directly send mobile notifications to the Zulip mobile apps." The service holds device tokens and basic organization metadata; from Zulip Server 12.0, notifications are end-to-end encrypted with a per-device key shared between the server and the app, so the relay forwards a payload it can't decrypt (timing and size still show). Organizations of up to 10 users use it free; larger ones need a paid or eligible free Community plan.
- **Mattermost** forwards through a push proxy (customers who build their own mobile apps host their own) and offers, on Enterprise, **ID-only push notifications**: the notification carries only a message id, and the app fetches content from the customer's server on receipt, keeping content out of APNs and FCM at the cost of slightly slower delivery.

The pattern is worth adopting even in SaaS for sensitive tenants: **the push carries a reference, the app fetches the content over the authenticated channel.** It's also what regulated customers will ask about, since a push payload is a copy of business content held by a third party.

## Email Fallbacks and Digests

When a member misses activity, products fall back to email. Slack bundles missed-activity emails every 15 minutes or once an hour depending on preference; Teams sends missed activity emails, which don't include notifications from shared channels. The rules that make fallbacks tolerable:

- **Only for what would have notified,** after a delay that gives the member a chance to see it in the app, and cancelled if they do.
- **Batched,** with a cap per digest and a link back to the app instead of full content where the customer's policy says content stays in the product.
- **Sent as a stream separate from product marketing,** through infrastructure built for transactional mail. Sending and deliverability are the Hosting & Cloud volume's [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms); the chat product's job is deciding what goes in the digest.

## The Right to Disconnect

Several jurisdictions now regulate after-hours work contact. None of them bans a notification; all of them make the employer responsible for a policy, and the collaboration tool is where that policy is either enforced or ignored.

| Jurisdiction | Rule | Who it covers | What it requires |
| --- | --- | --- | --- |
| **France** | Labour Code art. L2242-17, 7° | Employers subject to mandatory annual negotiation | Negotiate how employees exercise their right to disconnect and set up mechanisms regulating digital tools; failing agreement, the employer issues a charter after consulting the works council, with training on reasonable use |
| **Portugal** | Labour Code art. 199.º-A, added by Law 83/2021 of December 6 | Employers | A duty to refrain from contacting the worker during rest periods, except in force majeure; less favorable treatment for exercising rest is discriminatory; violation is a serious offense |
| **Australia** | Fair Work Act ss 333M to 333Q | Employees of employers with 15 or more employees from August 26, 2024; small business from August 26, 2025 | Employees may refuse to monitor, read or respond to contact outside working hours unless the refusal is unreasonable, judged by the reason for contact, how it's made and how disruptive it is, compensation for availability, role and responsibility, and personal circumstances |
| **Ontario** | Employment Standards Act, written policy on disconnecting from work | Employers with 25 or more employees on January 1 | A dated written policy on disconnecting (not engaging in work-related emails, calls, video calls or messages), in place before March 1 and given to employees within 30 days; it need not create a right to disconnect |

Australia's version is explicit that contact isn't unlawful; the right is to refuse unreasonably-timed contact, and a refusal is unreasonable if the contact is required by law. Ontario's guidance notes that reviewing or drafting emails after a shift is generally working time under its other rules even where a policy says not to work from home, which is the link to wage-hour law in [Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers#after-hours-messages-and-wage-hour-law).

What these laws mean for software:

- **Working hours are first-class data.** A member's working hours and time zone (from the calendar or the profile) drive default quiet time, and a sender sees "it's 9 p.m. for Ana" before sending.
- **Schedule send is the compliant default.** When a message to someone outside their working hours isn't urgent, offering to deliver it at the start of their day is the cheapest way to respect a disconnect policy. Teams offers delivery options in chats of up to 20 people, and Slack supports scheduled messages; the product should make it the suggested path.
- **Admin defaults, not individual heroics.** Slack's admin-set default notification schedule is the right shape: the employer's policy becomes the tenant's default, members can tighten it, and loosening it is the member's choice.
- **Policy text in the product.** Ontario requires a written, dated policy given to employees; a product can host it, show it in the notification settings, and record acknowledgment.
- **Escalation stays possible and recorded.** Every law here preserves contact that's required or genuinely urgent, so the breakthrough path stays, rate-limited and logged.

Other countries handle the subject through collective agreements or sector rules; I treat the four above as the design envelope, because a product that satisfies them can be configured for the rest.

## How to Build It

The chapter's additions. Preferences resolve from member to container to workspace default; deliveries are logged so the badge, the push and the digest agree.

```sql
CREATE TABLE notification_preferences (      -- member defaults and per-container overrides
  member_id     UUID NOT NULL REFERENCES members (id),
  container_id  UUID REFERENCES containers (id),   -- null = the member's default
  level         TEXT NOT NULL CHECK (level IN ('all', 'main', 'mentions', 'none')),
  thread_replies TEXT NOT NULL DEFAULT 'participating'
                   CHECK (thread_replies IN ('all', 'participating', 'none')),
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  muted_until   TIMESTAMPTZ,
  mobile_delay  INTERVAL NOT NULL DEFAULT '0',     -- after desktop inactivity
  UNIQUE NULLS NOT DISTINCT (member_id, container_id)
);

CREATE TABLE quiet_schedules (               -- member schedules and the workspace default
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  member_id     UUID REFERENCES members (id),     -- null = workspace default set by admins
  time_zone     TEXT NOT NULL,                    -- IANA name
  weekly_hours  JSONB NOT NULL,                   -- {"mon": [["09:00","17:30"]], ...}
  source        TEXT NOT NULL CHECK (source IN ('member', 'admin_default', 'calendar')),
  policy_item_id UUID REFERENCES items (id),      -- the published disconnect policy, if any
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dnd_states (                    -- manual pauses and statuses with expiry
  member_id    UUID PRIMARY KEY REFERENCES members (id),
  paused_until TIMESTAMPTZ,
  status       TEXT CHECK (status IN ('available', 'busy', 'dnd', 'brb', 'away',
                 'appear_offline')),
  status_until TIMESTAMPTZ,
  priority_member_ids UUID[] NOT NULL DEFAULT '{}'  -- breakthrough allowlist
);

CREATE TABLE presence_sessions (             -- one per client or app; aggregated on read
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  member_id    UUID NOT NULL REFERENCES members (id),
  client       TEXT NOT NULL,                -- 'desktop', 'web', 'mobile', or an app id
  availability TEXT NOT NULL CHECK (availability IN ('available', 'busy', 'dnd', 'away')),
  last_active_at TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE notification_deliveries (       -- the decision and what happened to it
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  member_id     UUID NOT NULL REFERENCES members (id),
  item_id       UUID NOT NULL REFERENCES items (id),
  reason        TEXT NOT NULL CHECK (reason IN ('dm', 'mention', 'group_mention',
                  'broadcast', 'keyword', 'thread', 'channel_all', 'urgent')),
  decision      TEXT NOT NULL CHECK (decision IN ('push', 'banner_only', 'badge_only',
                  'deferred_quiet', 'deferred_active_elsewhere', 'digest', 'suppressed')),
  breakthrough  TEXT CHECK (breakthrough IN ('priority_access', 'urgent_override')),
  decided_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deliver_after TIMESTAMPTZ,                 -- for deferrals
  cancelled_at  TIMESTAMPTZ,                 -- read elsewhere before delivery
  sent_at       TIMESTAMPTZ,
  channel       TEXT CHECK (channel IN ('apns', 'fcm', 'web_push', 'email'))
);
```

Notes on the sketch:

- **One decision function, evaluated at send time.** For each recipient: compute the reason (DM, mention, keyword, thread participation, channel level) from `notification_preferences` with the container override winning; apply `muted_until`; check `dnd_states` and the effective `quiet_schedules` (member row, else admin default) in the member's zone; allow breakthrough only through `priority_member_ids` or a rate-limited urgent override; then pick a device route from presence. Re-check at `deliver_after`, because the member may have read it elsewhere ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **Presence aggregates on read.** Drop expired sessions, then take the most restrictive of the live sessions (dnd over busy over available over away), overridden by a manual status until `status_until`. Store sessions, not a computed status, so a dying phone app can't leave someone "available" forever.
- **Broadcasts fan out lazily.** A `@channel` in a 10,000-member channel shouldn't write 10,000 rows synchronously; enqueue it, evaluate recipients in batches, and skip members who are paused or have the channel at `none`.
- **Urgent overrides are counted.** Enforce "once per day per sender per recipient" (or a repeat-until-read window) with a query over `notification_deliveries` where `breakthrough = 'urgent_override'`.
- **Pushes carry references.** The payload holds the item id and a count; the app fetches content. Tenants that allow content previews opt in.
- **Digests read deferred rows.** The digest job collects `decision = 'digest'` rows not yet cancelled and sends one email per member per window.

## Auditing

- **Schedule and policy changes,** including admin defaults and the published disconnect policy with its dates, because Ontario requires dated policies kept for three years after they stop applying.
- **Breakthroughs:** every urgent override and priority-access delivery outside quiet hours, with sender, recipient and recipient's local time.
- **Broadcast mentions** with the channel size at the time and whether the sender confirmed.
- **Presence visibility settings** (external sharing, privacy mode) and who changed them.
- **Delivery decisions** retained for a short window for support ("why didn't I get notified?"), then aggregated; they describe when people work, so they're not kept longer than needed ([Retention Windows](/docs/architecture/data-retention#retention-windows)).

## What This Means for the System You Build

- **Make participation the subscription:** DMs, mentions and threads you joined notify; everything else is opt-in per container.
- **Put policy around broadcast mentions:** a permission, a size threshold and a confirmation.
- **Derive presence from sessions with expiry,** aggregated across devices and the calendar; let admins control who can see it.
- **Give admins a default quiet schedule** and members the power to tighten it; store working hours and time zones as data.
- **Bound breakthrough on both sides** (a priority list, a rate-limited urgent override) and log it.
- **Route by activity and let the server own the badge,** collapsing bursts and choosing interruption levels deliberately.
- **Send references, not content, in pushes** by default, and plan a relay with encrypted or id-only payloads if you ship self-hosted.
- **Offer schedule-send as the default** for messages to people outside their working hours.

## References

**Vendor documentation**

- [Slack: Guide to Slack notifications](https://slack.com/help/articles/360025446073), default triggers, mobile notifications after desktop inactivity or a delay, email digests every 15 minutes or hourly
- [Slack: Use threads to organize discussions](https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions-), thread notification rules and following
- [Slack: Notify a channel or workspace](https://slack.com/help/articles/202009646-Notify-a-channel-or-workspace), @channel, @here and @everyone semantics, the six-member confirmation, the 10,000-member restriction, admin controls, paused members not notified
- [Slack: Pause notifications with Do Not Disturb](https://slack.com/help/articles/214908388-Pause-notifications-with-Do-Not-Disturb), pausing, schedules, admin default schedules, the once-a-day urgent override, availability on all plans
- [Slack: Set your Slack status and availability](https://slack.com/help/articles/201864558-Set-your-Slack-status-and-availability), away after 10 minutes of desktop inactivity, mobile behavior, scheduled statuses
- [Slack: Real-time messaging (2023)](https://slack.engineering/real-time-messaging/), presence servers, presence for on-screen users, scheduled messages
- [Microsoft Learn: User presence in Teams](https://learn.microsoft.com/en-us/microsoftteams/presence-admins), presence states and order, automatic and calendar-driven presence, device rules, manual durations, Do not disturb and priority access, privacy mode
- [Microsoft Learn: Manage presence state using the Microsoft Graph API](https://learn.microsoft.com/en-us/graph/cloud-communications-manage-presence-state), presence sessions, aggregation precedence, timeouts and expiration
- [Microsoft Learn: presence resource type](https://learn.microsoft.com/en-us/graph/api/resources/presence), availability and activity values, change notification support
- [Microsoft Learn: Manage messaging policies in Teams](https://learn.microsoft.com/en-us/microsoftteams/messaging-policies-in-teams), urgent messages repeating every 2 minutes for 20 minutes
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), mention blocking in teams over 10,000 members, shared channels excluded from missed activity emails, delivery options removed in chats over 20 members
- [Microsoft Learn: Overview of teams and channels in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/teams-channels-overview), team owners' control over team and channel mentions
- [Microsoft Learn: Manage the Shifts app for your organization](https://learn.microsoft.com/en-us/microsoftteams/expand-teams-across-your-org/shifts/manage-the-shifts-app-for-your-organization-in-teams), shift-based tags notifying only on-shift people
- [Google Chat Help: Turn Google Chat notifications on or off](https://support.google.com/chat/answer/7655718), space notification levels and Do not disturb
- [Mattermost: Organize conversations using threaded discussions](https://docs.mattermost.com/end-user-guide/collaborate/organize-conversations.html), auto-following threads
- [Mattermost: Host your own push proxy service](https://docs.mattermost.com/deployment-guide/mobile/host-your-own-push-proxy-service.html), the push notification service and ID-only push notifications
- [Zulip: Mobile push notification service](https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html), why self-hosted servers need a relay, end-to-end encrypted notifications from Server 12.0, the 10-user free tier
- [Apple Developer: UNNotificationInterruptionLevel](https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel), passive, active, time-sensitive and critical levels
- [Firebase: Collapsible and non-collapsible messages](https://firebase.google.com/docs/cloud-messaging/customize-messages/collapsible-message-types), four collapse keys per device, the 100-message limit and overflow behavior, `apns-collapse-id` mapping

**Standards**

- [Matrix Client-Server API v1.19](https://spec.matrix.org/v1.19/client-server-api/), `notification_count` and `highlight_count`, per-thread counts, presence values

**Law and regulation**

- [Légifrance: Code du travail, Article L2242-17](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893940), the right to disconnect in mandatory negotiation and the fallback charter
- [Diário da República: Lei n.º 83/2021, de 6 de dezembro](https://diariodarepublica.pt/dr/detalhe/lei/83-2021-175397114), Labour Code article 199.º-A, the duty to refrain from contact during rest periods
- [Fair Work Ombudsman: Right to disconnect](https://www.fairwork.gov.au/employment-conditions/right-to-disconnect), commencement dates, small business threshold, reasonableness factors, disputes and protections
- [Ontario: Your guide to the Employment Standards Act, written policy on disconnecting from work](https://www.ontario.ca/document/your-guide-employment-standards-act-0/written-policy-disconnecting-from-work), the 25-employee threshold, March 1 deadline, 30-day copy rule, definition, three-year retention, after-hours email as working time

**Research**

- [Microsoft WorkLab: Breaking down the infinite workday (2025)](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday), daily email and Teams message volumes, after-hours messages and interruption frequency
