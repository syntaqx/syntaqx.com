+++
title = "Channels, Threads & Direct Messages"
description = "How workplace chat organizes talk: channels, threads and topics, DMs and group chats, canvases and huddles, and admin rules for edits, deletes and archiving."
category = "Workplace & Collaboration Industry"
order = 2013
part = "Chat and Messaging"
tags = ["chat", "messaging", "threads", "channels", "admin-controls"]
nav_title = "Channels, Threads & DMs"
+++

Workplace chat looks like consumer chat: a sidebar of channels, a box to type in, threads, reactions, direct messages. Underneath, almost every product decision is answered differently, because the people typing are employees, the workspace belongs to their employer, and the conversation is a business record. Whether a message can be edited after an hour, whether the author can delete it, whether a team owner can delete someone else's post, whether a channel can be deleted or only archived: on a community platform the platform decides, and in a workplace product the customer's admin does, by policy, for everyone in the tenant.

The other hard part is that the products disagree about the basic shape of a conversation. Slack hangs threads off messages in a channel; Teams started with posts and replies and added a chat-like threads layout; Google Chat moved every new space to in-line threads in 2023; Zulip makes every message carry a topic; Matrix models a room as a replicated event graph with threads as a relation. Each shape changes what "unread" means, what a notification is for, and what an export looks like. This chapter covers the conversation models, the container types (channels, private and shared channels, DMs and group chats), the work surfaces attached to them (canvases, lists, huddles), the admin rules for edits, deletes and archiving, and the data model that holds it all.

The generic real-time and storage mechanics (gateways, sharding by channel, time-ordered ids, tombstones) are in the User-Generated Platforms volume's [Real-Time Chat](/books/user-generated-platforms/real-time-chat), and the inversion this book is built on is stated there in [Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties). How the workplace vendors run chat at scale is the next chapter, [Chat at Scale](/books/workplace-and-collaboration/chat-architecture); mentions, presence and do-not-disturb are [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention). Guests and channels shared between two organizations are the [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration) chapter; what a retention policy or legal hold does to a deleted message is the [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) chapter.

## How the Platforms Do It

As of October 2026:

| Product | Containers | Thread model | Group DM | Who controls edits and deletes |
| --- | --- | --- | --- | --- |
| **Slack** | Public and private channels, DMs, group DMs, Slack Connect channels | Replies hang off a parent message; a reply can also be sent to the channel | Up to 9 people; can be converted to a private channel | Owners and admins (org policy on Enterprise) choose edit window and which roles can delete |
| **Microsoft Teams** | Teams with standard, private and shared channels; 1:1 and group chats | Channels offer a posts layout (post plus replies) or a threads layout; chats are flat | Up to 250 people | Admins assign messaging policies per user: edit, delete, owners delete others' messages |
| **Google Chat** | Spaces, DMs and group DMs | In-line threading in all new spaces since March 2023; older spaces organized by topic | Group DMs, in-line threaded since November 2025 | Only space owners can delete a space |
| **Zulip** | Channels, each message labelled with a topic; DMs | Topics instead of threads: every message belongs to one | Group DMs | Organization settings (self-hosted or cloud) |
| **Mattermost** | Teams with public and private channels, DMs, group messages | Collapsed reply threads, with a followed-threads view | Group messages | System admins configure thread behavior |
| **Matrix (Element)** | Rooms federated across homeservers | `m.thread` relation on events | Small rooms | Each homeserver operator, per room |

Three facts frame the rest of the chapter. Workplace chat is organized by **containers the customer administers**, not by a social graph. The **thread model is a product choice with data consequences**, and vendors have changed it in place. And **edits and deletes are tenant policy**, not user preference.

## Conversation Models

### Channels With Reply Threads

Slack's model is the reference design. A channel is a flat stream; any message can become the parent of a thread, and replies live with the parent. The API makes the structure explicit: a reply sets `thread_ts` to the parent's timestamp (never a reply's), and `reply_broadcast` also shows the reply in the channel, which Slack's docs advise using sparingly. Notifications follow participation: in channels and multi-person DMs a member hears about replies only if they started the thread, replied to it, or were mentioned, while in a one-to-one DM every thread notifies. A Threads view collects the threads a member follows, unread ones first. Threads are on every plan, for members and guests.

The design's strength is that the channel stays scannable while side discussions continue. Its weakness is that substantive discussion migrates into threads that people outside them never see, and the channel's unread state stops reflecting where the conversation is. Every product with this model ends up building a "threads I follow" inbox for that reason.

### Posts, Chats and the Teams Threads Layout

Teams began with a different split. **Chats** (one-to-one and group) are flat, chat-like streams. **Channels** used a posts layout: start a post, reply to it, so every channel conversation was a thread from its first message. In 2025 Microsoft added a **threads layout** for channels that looks like a group chat, with replies opening in a side panel and followed threads collected in one view. Users pick "Layout > Threads" when creating a channel, and channel owners can convert an existing posts channel through "Edit channel"; general availability rolled out worldwide from mid-August 2025, and during the ring-based rollout clients without the new layout showed a threads channel in a backwards-compatibility mode, as a posts channel with a banner.

The lesson is that a thread model can change under existing data, and old clients will meet new shapes. A posts channel converted to the threads layout keeps its history, so the data model has to represent both shapes, older clients need a degraded rendering, and exports and eDiscovery must render a conversation whichever layout it was written in.

### In-Line Threads in Google Chat

Google Chat had two space formats: spaces organized by conversation topic, where every message started a topic with its own replies, and flat conversations. In October 2022 Google added in-line threading to spaces, with a thread panel listing threads a member follows or is mentioned in, and notifications only for threads a member took part in or chose to follow. It then announced that from March 13, 2023 all newly created spaces would be in-line threaded, with the topic option removed from space creation and existing topic-organized spaces to be migrated later. In November 2025 Google extended in-line threading to DMs and group DMs, on by default with no admin control and no user setting. Two of the three largest workplace chat products have therefore converged on the Slack shape from opposite starting points.

### Topics in Zulip

Zulip rejects the parent-message thread. Every message in a channel carries a topic label, like a short email subject, and "lots of conversations can happen in the same channel at the same time, each in its own topic." There is no thread sidebar: threads appear in the main message view, there is nothing special about a topic's first message, and a reply is addressed to the conversation being read without a separate "reply in thread" action. Zulip argues this suits long-running, asynchronous discussions that last hours or days.

The data consequence is that a topic is a mutable label on many messages, not a parent row. Renaming or moving a topic is a bulk update, and unread state is naturally per topic, which makes catching up on a busy channel tractable.

### Collapsed Reply Threads in Mattermost

Mattermost collapses replies under the root message, auto-follows threads a member participates in or is mentioned in, lets anyone follow a thread manually, and gives a Threads view per team with an unread filter. System admins configure whether threaded discussions are on by default and whether users can opt in, and can disable thread creation entirely. A self-hosted product exposes as an admin setting what a SaaS vendor decides centrally.

### Rooms as Replicated Event Graphs in Matrix

Matrix (the open protocol behind Element) models a room as a directed acyclic graph of signed events, replicated to every participating homeserver, with state events (name, topic, membership) kept as a key-value table and message events as the stream. Threads are an `m.thread` relation from an event to a thread root, with per-thread unread notification counts in the sync API. It's the only model here built for federation between independently operated servers, which is why the next chapter treats it as the counterpoint to Slack's single-copy design ([Chat at Scale](/books/workplace-and-collaboration/chat-architecture#federation-the-matrix-alternative)).

### Choosing a Model

My default for a new product is the Slack shape (flat channel, threads hanging off messages, an optional broadcast of a reply to the channel), because it's what users of the two dominant suites now expect, plus a followed-threads inbox from day one. Topic-per-message is better for asynchronous, long-lived discussion (open source projects, research groups) and worth offering as a channel setting if that's the market. Whatever the choice, store the thread relation explicitly (`thread_root_id` or a topic) rather than inferring it from timestamps, because the model will change and the history must survive.

## Containers: Channels, Chats and DMs

### Channel Visibility

Every product distinguishes channels anyone in the workspace can find and join from channels by invitation. Teams adds a third type, and its comparison table is the clearest statement of what each type costs:

| Capability | Standard channel | Private channel | Shared channel |
| --- | --- | --- | --- |
| People added without joining the team | No | No | Yes |
| Membership limited to a subset of the team | No | Yes | Yes |
| Guests can participate | Yes | Yes | No |
| External participants (B2B direct connect) | No | No | Yes |
| Dedicated SharePoint site | No | Yes | Yes |
| Moderation | Yes | No | No |
| Bots, connectors and messaging extensions | Yes | No | No |

The table shows the general rule: **each step away from "everyone in the container can see it" costs features**, because files, apps, compliance and search were built for the simple case. Private and shared channels each get their own SharePoint site because their files need different permissions from the team's. Slack draws the same line between workspace channels and Slack Connect channels, where two organizations' policies meet; that's the [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration#trust-between-two-admins) chapter.

### Direct Messages and Group Chats

Direct messages are containers too, just ones without names or owners. Slack DMs can include up to nine people and a group DM can be converted to a private channel when a conversation outgrows it. Teams group chats hold up to 250 people, but once a chat passes 20 people Teams turns off Outlook automatic replies and status messages in the chat, the typing indicator, audio and video calling, sharing and read receipts, and only 200 members can be added at once. Those cutoffs are a design statement: features that make sense among a handful of people (read receipts, typing, "is anyone there") become noise or load in a crowd, so the product changes behavior at a size threshold rather than degrading.

Teams also lets admins control whether users can delete a whole chat from their own list (it disappears for that user only; everyone else keeps it) and whether a user can remove others from a group chat. Both are policy settings, not user features, because deleting a conversation from one person's view must not delete the record.

### Membership Is Not Permission

A channel's membership list and its permission grants are different things. Membership drives notifications, unread state and the sidebar; permission decides who may read. Public channels can be read by non-members (search, previews, joining), private channels only by members, and admins may read content without being members at all, through compliance tools rather than the chat client. I keep membership in its own table and permissions in the book's `grants`, so a member leaving a public channel stops notifications without changing who can read it, and a compliance export reads through grants, not membership. The general model is in [Authorization](/docs/security/authorization); this book's version is the [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing) chapter.

## Canvases, Lists and Huddles

Chat products have absorbed adjacent tools so a channel can hold the documents, trackers and calls that belong to its work.

- **Canvases.** A Slack canvas is "a surface built into Slack where you can create and share fully-formatted content," either standalone (shared into conversations later) or attached to a channel or DM as a tab that can open by default. Canvases are on paid plans; editors and commenters are distinct permissions, view-only users can request access, and mentions notify only people who already have access. A canvas is a document with its own grants living inside a chat container, which is exactly the place permission bugs breed.
- **Lists.** Slack lists track work with fields (completion, name, assignee, due date by default, plus custom fields), items and subtasks, with a dedicated message thread on each item that travels with it. Pro and Business+ lists hold up to 1,000 items and subtasks, Enterprise Grid up to 5,000. A list is a small work-item tracker; the [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields) chapter covers the full version.
- **Huddles.** Huddles are informal calls started in any channel or DM, with video, screen sharing, a thread for notes, links and files, and a canvas for meeting notes. The free plan allows two participants; paid plans allow up to 50, with 25 on video at once and two people sharing screens. The media mechanics are the [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video) chapter.
- **Teams tabs and Loop components** play the same role in Teams: apps and documents pinned to a channel, with files stored in the channel's SharePoint folder or site.

Each absorbed tool creates a second object model inside the chat container. The rule that keeps it manageable: **the attached object has its own item kind and its own grants, defaulting to the container's members**, and retention, export and search treat it as its own item, not as a message.

## Editing and Deleting: The Admin's Decision

On a community platform, editing and deleting are user features bounded by the platform's safety needs. In workplace chat they're employer policy, because a deleted message may be evidence in an employment dispute, a regulatory inquiry or litigation.

**Slack.** Workspace owners and admins choose whether members can edit their messages "any time, never, or up to a certain timeframe" after sending; choosing never takes effect immediately. Which role types can delete their own messages (and unsend) is a separate setting on all plans. On Enterprise, an org-level policy applies to every workspace and org owners decide whether workspaces may change it. Retention is separate again: free workspaces keep messages for 90 days including edits and deletions or a year without them; paid plans can keep everything with or without edit history, or set a custom timeline, and owners can let members set retention for private channels and DMs.

**Teams.** Admins assign messaging policies to users or groups. The relevant switches are: owners can delete messages sent by others; users can delete their own sent messages; users can edit sent messages; users can delete bot messages; users can delete a chat from their own list; and, for the supervised-chat roles used in education tenants, users with full chat permissions can delete any group or meeting chat message. One policy applies to a user at a time. Microsoft's own example for preserving records is a custom policy that turns off owner deletes, user deletes and user edits. Behind the client, an edited or deleted message under a retention policy is copied or moved to a hidden folder where eDiscovery can still find it, so "deleted in the app" and "deleted from the record" are different events.

The pattern across both vendors:

- **Edit and delete are separate permissions**, each set by admin policy at the tenant (or org) level, with narrower scopes allowed where the policy permits.
- **Time windows bound edits**, because an edit made a week later changes a record people have already relied on.
- **Moderator deletes are a role**, not a side effect of being an owner; Teams makes "owners can delete others' messages" its own setting.
- **What the client shows is not what is retained.** Deletion from view is immediate; deletion from the record follows retention and holds ([Edits, Deletes and Retention](/books/user-generated-platforms/real-time-chat#edits-deletes-and-retention) describes the consumer version; the workplace version is the [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) chapter).

My default for a new product: edits allowed for a configurable window (default unlimited, as both leading vendors default to permissive), deletes allowed for authors, edit history kept as item versions regardless of what the client shows, and every setting expressed as a tenant policy with an audit event on change.

## Mentions, Reactions, Pins and Bookmarks

The small features carry policy too.

- **Channel-wide mentions.** Slack's `@channel` notifies every member, `@here` only active ones, and `@everyone` only works in the general channel; channels with at least six members ask for confirmation before sending one, owners and admins can restrict who may use them, and in Enterprise organizations channels of 10,000 members or more allow them only for owners and admins. Teams blocks team and channel mentions in teams over 10,000 members. Notification semantics are in [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention#what-triggers-a-notification).
- **Reactions and custom emoji.** Reactions are cheap metadata but they're also acknowledgments ("read and agreed"). Teams makes uploading and deleting custom emoji messaging-policy settings (upload on by default, delete off except for admins), and Teams retention for messages explicitly excludes reactions from others. If reactions matter as acknowledgments in a regulated setting, the record has to keep them deliberately.
- **Read receipts.** Teams shows read receipts in one-to-one and group chats of 20 or fewer, and admins choose user-controlled, on for everyone, or off for everyone; read receipts aren't captured in eDiscovery reporting. A read receipt is an employee-monitoring signal as much as a convenience, which is why it's an admin decision (the [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy) chapter).
- **Pins and bookmarks.** A pin elevates a message within a channel; a bookmark or saved item is personal. Pins are channel state (who pinned what, when), bookmarks are per-member state, and both point at items rather than copying them.

## Channel Management and Archiving

Channels accumulate. Every product separates **archiving** (closed to new activity, history kept) from **deleting** (gone), and gives deletion to fewer people.

- **Slack.** By default any member except Frontline Members and guests can archive a channel they belong to, owners can restrict that, and channel managers can always archive their channels. On Free, Pro and Business+ plans only workspace owners and admins can delete channels; Enterprise org owners can restrict deletion to roles or a custom role. Archived history stays searchable on paid plans; deleting a channel removes its messages permanently regardless of retention settings. An archived channel's name stays reserved, so reusing it means unarchiving and renaming. Business+ and Enterprise add central channel management tools.
- **Teams.** A deleted channel can be restored for 30 days and keeps counting toward the per-team limit of 1,000 channels (standard, private and shared combined) during that window. Channel names exclude a list of characters and reserved words such as `CON`, `PRN` and `desktop.ini`, a legacy of the SharePoint folders behind them.
- **Google Chat.** Only a space owner can delete a space, deletion can't be undone, it deletes all messages and tasks in the space, and Drive files shared there lose the space's permissions but aren't deleted.

The design rules: **archive is the default end of life; delete is a privileged, audited action that checks holds first**; names of archived containers stay reserved or are explicitly released; files referenced by a deleted container are governed by their own store's lifecycle.

## Limits That Shape Design

As of October 2026, from vendor documentation:

| Limit | Value |
| --- | --- |
| Teams: members in a team | 25,000 |
| Teams: channels per team (standard, private and shared, incl. deleted for 30 days) | 1,000 |
| Teams: members in a private channel | 5,000 |
| Teams: members in a shared channel | 5,000 direct members including up to 50 teams |
| Teams: people in a group chat | 250 (features reduced above 20) |
| Teams: message size | about 100 KB per post, 80 KB recommended for reliable delivery |
| Teams: org-wide team | up to 10,000 members, 5 per tenant |
| Slack: people in a group DM | 9 |
| Slack: message text | truncated above 40,000 characters; about 4,000 recommended |
| Slack: list items (Pro and Business+ / Enterprise Grid) | 1,000 / 5,000 |
| Slack: huddle participants (paid) | 50, with 25 on video |

The numbers are less important than the pattern: limits are set where a container's members, files or features stop fitting the architecture underneath (a SharePoint site, a mailbox per participant, a fan-out tier), and products change behavior at thresholds rather than letting things degrade silently.

## How to Build It

The chapter's additions to the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model). A channel is a `containers` row with `kind = 'channel'` plus a kind table; a DM or group chat is the same with its own kinds; a message is an `items` row with `kind = 'message'` plus the `messages` kind table; edits are `item_versions`.

```sql
CREATE TABLE channels (                      -- kind table for chat containers
  container_id     UUID PRIMARY KEY REFERENCES containers (id),
  conversation_kind TEXT NOT NULL CHECK (conversation_kind IN ('channel', 'dm',
                     'group_dm', 'meeting_chat')),
  visibility       TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'shared')),
  layout           TEXT NOT NULL DEFAULT 'threads'
                     CHECK (layout IN ('threads', 'posts', 'topics')),
  name             TEXT,                     -- null for DMs
  topic            TEXT,
  is_default       BOOLEAN NOT NULL DEFAULT FALSE,  -- the #general equivalent
  archived_at      TIMESTAMPTZ,
  archived_by      UUID REFERENCES members (id),
  name_released_at TIMESTAMPTZ,              -- archived names stay reserved until released
  CHECK ((conversation_kind IN ('dm', 'group_dm')) = (name IS NULL))
);

CREATE UNIQUE INDEX channels_live_name
  ON channels (lower(name)) WHERE name IS NOT NULL AND name_released_at IS NULL;
  -- in practice scoped per workspace through containers.workspace_id

CREATE TABLE channel_memberships (           -- who is in it; grants decide who may read
  container_id  UUID NOT NULL REFERENCES channels (container_id),
  member_id     UUID NOT NULL REFERENCES members (id),
  role          TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner', 'manager', 'moderator', 'member')),
  joined_via    TEXT NOT NULL CHECK (joined_via IN ('self', 'invite', 'group_sync',
                  'admin', 'org_default')),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (container_id WITH =, member_id WITH =, valid_during WITH &&)
);

CREATE TABLE messages (                      -- kind table for items of kind 'message'
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  container_id     UUID NOT NULL REFERENCES channels (container_id),
  seq              BIGINT NOT NULL,          -- per-channel order, assigned by the channel owner
  thread_root_id   UUID REFERENCES messages (item_id),
  topic            TEXT,                     -- for topic-layout channels
  also_in_channel  BOOLEAN NOT NULL DEFAULT FALSE,  -- a thread reply broadcast to the channel
  author_member_id UUID REFERENCES members (id),    -- null for system messages
  author_app_id    UUID REFERENCES apps (id),       -- set for bot and workflow messages
  subtype          TEXT NOT NULL DEFAULT 'message' CHECK (subtype IN ('message', 'system',
                     'bot', 'post', 'urgent')),
  body             JSONB,                    -- rich text blocks; null once removed from view
  mentions         UUID[] NOT NULL DEFAULT '{}',
  mention_scope    TEXT CHECK (mention_scope IN ('channel', 'here', 'everyone')),
  edited_at        TIMESTAMPTZ,
  removed_at       TIMESTAMPTZ,
  removed_by_kind  TEXT CHECK (removed_by_kind IN ('author', 'owner', 'admin',
                     'retention', 'dlp')),
  UNIQUE (container_id, seq),
  CHECK ((removed_at IS NULL) = (removed_by_kind IS NULL)),
  CHECK (thread_root_id IS NULL OR topic IS NULL)
);

CREATE TABLE message_reactions (
  message_id  UUID NOT NULL REFERENCES messages (item_id),
  member_id   UUID NOT NULL REFERENCES members (id),
  emoji       TEXT NOT NULL,                 -- unicode or a custom emoji id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, member_id, emoji)
);

CREATE TABLE channel_pins (                  -- channel state; personal saves live elsewhere
  container_id UUID NOT NULL REFERENCES channels (container_id),
  item_id      UUID NOT NULL REFERENCES items (id),   -- a message, canvas or file
  pinned_by    UUID NOT NULL REFERENCES members (id),
  pinned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (container_id, item_id)
);

CREATE TABLE messaging_policies (            -- tenant policy, assignable like Teams policies
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id           UUID NOT NULL REFERENCES workspaces (id),
  name                   TEXT NOT NULL,
  is_default             BOOLEAN NOT NULL DEFAULT FALSE,
  edit_window            INTERVAL,           -- null = any time; '0' = never
  authors_can_delete     BOOLEAN NOT NULL DEFAULT TRUE,
  owners_can_delete_others BOOLEAN NOT NULL DEFAULT FALSE,
  members_can_archive    BOOLEAN NOT NULL DEFAULT TRUE,
  channel_mentions       TEXT NOT NULL DEFAULT 'everyone'
                           CHECK (channel_mentions IN ('everyone', 'owners_admins', 'nobody')),
  read_receipts          TEXT NOT NULL DEFAULT 'user_controlled'
                           CHECK (read_receipts IN ('user_controlled', 'on', 'off')),
  locked_by_org          BOOLEAN NOT NULL DEFAULT FALSE  -- an org policy workspaces can't change
);

CREATE TABLE messaging_policy_assignments (
  policy_id      UUID NOT NULL REFERENCES messaging_policies (id),
  principal_type TEXT NOT NULL CHECK (principal_type IN ('member', 'group')),
  principal_id   UUID NOT NULL,
  rank           INT NOT NULL DEFAULT 0,     -- group assignments resolve by rank
  PRIMARY KEY (policy_id, principal_type, principal_id)
);
```

Notes on the sketch:

- **One item per message.** Messages are `items`, so retention policies, legal holds, search, DLP and export all see them through the same table as pages and files. At scale the `messages` kind table lives in a store partitioned by channel and time, as [Message Storage at Scale](/books/user-generated-platforms/real-time-chat#message-storage-at-scale) describes; `items` keeps the identity and the tenant.
- **Edits write versions.** Every edit writes an `item_versions` row with the previous body, whatever the client shows. Whether a member can see edit history is a display setting; whether the history exists is retention's decision.
- **Removal is a state, not a delete.** `removed_at` hides the message; the retention job (owned by the [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold#how-to-build-it) chapter) decides when the body and versions are purged, after checking `legal_holds`.
- **The edit check is a policy lookup.** On edit, resolve the member's effective `messaging_policies` row (direct assignment, then group assignments by rank, then the workspace default, with `locked_by_org` overriding) and compare `NOW() - items.created_at` with `edit_window`.
- **Thread model is per channel.** `layout` records how the channel was written; a converted channel keeps old posts as thread roots, and export renders each message by its `thread_root_id` or `topic`, not by the current layout.
- **Shared channels need a host.** A channel visible to two organizations is stored once, in the host's workspace; the [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture#how-to-build-it) chapter adds the table that records the host and the participating orgs.
- **Events:** `message.created`, `message.edited`, `message.removed`, `channel.archived`, `channel.deleted`, `channel_membership.changed` and `messaging_policy.changed` feed the gateway, search, notifications, compliance capture and audit.

## Auditing

- **Policy changes:** every change to a messaging policy or assignment, with before and after values and the admin who made it, because "who allowed edits after the fact" is a question in disputes.
- **Removals with their actor kind:** author, owner, admin, retention or DLP, and for owner and admin removals, which policy permitted it.
- **Channel lifecycle:** creation, visibility changes (public to private, sharing with another org), archive, unarchive, rename and delete, with the hold check result for deletes.
- **Membership ranges:** who was in a channel and when, so a later question ("could she have seen this?") has an answer from the record, not the current list.
- **Admin access to content** through compliance tools, logged as access ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); the [Audit Logs](/books/workplace-and-collaboration/audit-logs) chapter covers the event catalogs vendors publish.

## What This Means for the System You Build

- **Pick a thread model deliberately, store the relation explicitly,** and expect to change it: keep the channel's layout per channel and render history by its stored structure.
- **Separate membership from permission:** membership drives notifications and unread state; grants decide who can read.
- **Make edit and delete tenant policy,** assignable per user or group, with org-level locks and an audit trail, and keep edit history as versions regardless of what the client shows.
- **Treat "deleted in the client" and "deleted from the record" as two events** separated by retention and holds.
- **Change behavior at size thresholds** (receipts, typing, channel-wide mentions) instead of letting large containers degrade.
- **Give absorbed objects (canvases, lists, tabs) their own item kind and grants,** defaulting to the container's members.
- **Archive by default, delete by privilege,** with a hold check and reserved names.

## References

**Vendor documentation**

- [Slack: Use threads to organize discussions](https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions-), replying in threads, sending replies to the channel, thread notification rules, the Threads view, availability on all plans
- [Slack Developer Docs: chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage), `thread_ts` and `reply_broadcast` semantics, the 40,000-character truncation and 4,000-character guidance
- [Slack: Understand direct messages](https://slack.com/help/articles/212281468-Understand-direct-messages), DMs of up to nine people and converting a group DM to a private channel
- [Slack: Manage permissions for message editing and deletion](https://slack.com/help/articles/115004868646-Manage-permissions-for-message-editing-and-deletion), edit windows (any time, never, a timeframe), role-based delete permission, org-level policies
- [Slack: Customize message and file retention policies](https://slack.com/help/articles/203457187-Customize-message-and-file-permissions), retention options by plan, member and admin overrides, deletion of channels removing history regardless of retention
- [Slack: Archive or delete a channel](https://slack.com/help/articles/213185307-Archive-or-delete-a-channel), who can archive and delete by plan, searchable archives, reserved names, channel management tools
- [Slack: Use a canvas in Slack](https://slack.com/help/articles/203950418-Use-a-canvas-in-Slack), standalone and channel canvases, paid plans, access requests and mention behavior
- [Slack: Use lists in Slack](https://slack.com/help/articles/27452748828179-Use-lists-in-Slack), fields, items and subtasks, item threads, item limits by plan
- [Slack: Use huddles in Slack](https://slack.com/help/articles/4402059015315-Use-huddles-in-Slack), participant limits by plan, video and screen-share limits, huddle threads and canvases
- [Slack: Notify a channel or workspace](https://slack.com/help/articles/202009646-Notify-a-channel-or-workspace), @channel, @here and @everyone, the six-member confirmation, the 10,000-member restriction and admin controls
- [Microsoft Learn: Overview of teams and channels in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/teams-channels-overview), team roles, channel moderation, the standard, private and shared channel comparison, org-wide teams
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), team, channel, chat and shared channel limits, features turned off above 20 chat members, post size, deleted channel restore window, channel name rules
- [Microsoft Learn: Manage messaging policies in Teams](https://learn.microsoft.com/en-us/microsoftteams/messaging-policies-in-teams), edit and delete settings, owners deleting others' messages, delete chat, read receipts, custom emoji settings, the "retain sent messages" example
- [Microsoft Learn: Learn about retention for Teams](https://learn.microsoft.com/en-us/purview/retention-policies-teams), edited and deleted messages copied to hidden folders, reactions not retained
- [Microsoft Adoption: Threads in channels](https://adoption.microsoft.com/en-us/microsoft-teams/new-chat-and-channels-experience/threads-in-channels/), the threads layout for Teams channels
- [Microsoft 365 Message Center MC1088172: New threaded conversation layout option for channels](https://mc.merill.net/message/MC1088172), creating and converting threads-layout channels, the 2025 rollout dates and the backwards-compatibility mode (Message Center mirror)
- [Google Workspace Updates: New Google Chat spaces will be in-line threaded](https://workspaceupdates.googleblog.com/2023/02/new-google-chat-spaces-will-be-in-line-threaded.html), in-line threading for new spaces from March 13, 2023 and the planned migration of topic-organized spaces
- [Google Workspace Updates: In-line threading in Chat spaces](https://workspaceupdates.googleblog.com/2022/10/in-line-threading-in-Chat-spaces.html), in-line threads, the thread panel and follow-based notifications (October 2022)
- [Google Workspace Updates: Inline threading for direct messages in Google Chat](https://workspaceupdates.googleblog.com/2025/11/inline-threading-direct-messages-google-chat.html), in-line threading for DMs and group DMs, on by default without admin or user settings
- [Google Chat Help: Delete a space](https://support.google.com/chat/answer/7653861), owner-only deletion, no recovery, messages and tasks deleted, Drive files kept
- [Zulip: Introduction to topics](https://zulip.com/help/introduction-to-topics), channels and topics, no thread sidebar, replies addressed to the conversation being read
- [Mattermost: Organize conversations using threaded discussions](https://docs.mattermost.com/end-user-guide/collaborate/organize-conversations.html), collapsed threads, following, the Threads view, admin configuration

**Standards**

- [Matrix Specification v1.19](https://spec.matrix.org/latest/), rooms, events, the room DAG, federation and state events
- [Matrix Client-Server API v1.19](https://spec.matrix.org/v1.19/client-server-api/), the `m.thread` relation and per-thread unread notification counts
