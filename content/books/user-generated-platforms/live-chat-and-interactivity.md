+++
title = "Live Chat & the Interactive Layer"
nav_title = "Live Chat & Interactivity"
description = "Live chat fanout, rate limits and bots, moderation before delivery, shared chat, raids, channel points, polls, predictions, extensions, drops and event feeds."
category = "User-Generated Platforms Industry"
order = 1819
part = "Media"
tags = ["user-generated-content", "live-streaming", "chat", "moderation", "webhooks"]
+++

A live stream is half video and half crowd. The video goes one way, from one broadcaster to every viewer; the chat goes every way at once, from any viewer to every other viewer, a few seconds behind the picture, with the broadcaster reading it on air. Around the chat sits an interactive layer the audience uses to act on the stream: a poll the broadcaster runs, a points reward a viewer redeems to pick the next song, a prediction on whether the boss falls, a raid that carries the whole audience to another channel at the end, a game reward earned by watching, a third-party panel under the player. Each of those is a small real-time system with its own state, its own abuse cases and its own records.

The hard part is that every one of them runs at the moment of greatest load and least review. A popular channel's chat is a room where thousands of strangers type at once, where a coordinated attack can arrive as a raid, where a slur on screen is broadcast before anyone can remove it, and where the broadcaster's moderators are volunteers with a hotkey. Twitch's chat delivered "over 10 billion messages a day" in 2015 and "hundreds of billions of messages per day" by 2023. The platform has to fan those messages out cheaply, rate-limit people and bots without silencing legitimate excitement, check messages before delivery in milliseconds, and keep enough of a record to answer a report, an appeal or a court.

This chapter covers live chat fanout and rate limits, bots, moderation before delivery, shared chat across channels, raids and audience transfer, channel points with polls and predictions, extensions, drops, and the event feeds third parties build on. It extends `streams` and `communities` (a live channel is a community of kind `channel`) from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model), and its channel moderators and VIPs are core `roles`. The chat gateway, presence and message storage in general belong to [Real-Time Chat](/books/user-generated-platforms/real-time-chat#the-gateway); community rules and automod rule engines to [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#automod-rules-engines-for-volunteers); paid interactions (subscriptions, gifted subscriptions, cheers with a virtual currency, paid pinned messages) to [Creator Monetization](/books/user-generated-platforms/creator-monetization#tips-paid-messages-and-virtual-currencies); and the app and webhook platform to [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#bots-and-apps). Video latency, which sets how far chat runs ahead of the picture, is [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#what-each-tier-loses).

## How the Platforms Do It

| Platform or vendor | Chat transport and scale | Limits and moderation before delivery | Interactive layer | Third-party access |
| --- | --- | --- | --- | --- |
| **Twitch** | Go services: an edge speaking IRC over TCP and WebSockets, a hierarchical pubsub for fanout, a rules service that checks each message, a room service for who's in chat | 20 messages per 30 seconds for a regular user (1 per second per channel), 100 for broadcaster, moderators and VIPs, 7,500 for a verified bot; AutoMod holds; a 2, 4 or 6 second delay for non-moderators; Shield Mode | Channel points, polls, predictions, Hype Train, goals, charity campaigns, raids, shoutouts, shared chat, extensions, drops | EventSub over webhooks, WebSockets and conduits; Helix API; IRC as the older interface |
| **YouTube Live** | Live chat beside every stream, replayed with the recording by default | Held for review at Basic or Strict, blocked words, slow mode, subscribers-only and members-only chat, live commentary mode, hide user, standard and managing moderators | Live Redirect to another channel's stream or a Premiere | Live Streaming API: server-streaming `streamList` or polled `list`, 5 quota units a call |
| **Kick** | Chat beside every stream | Chat modes not documented in a public page that could be opened; bans are a published event | Channel reward redemptions, gifts of its own tipping currency | Public API with webhooks for chat messages, follows, subscriptions, reward redemptions, bans and livestream status, signed with Kick's RSA key |
| **Amazon IVS Chat** | WebSocket messaging and HTTPS control, rented per room | 50,000 concurrent connections and 50,000 rooms per account per region (adjustable); 100 messages per second per room (configurable); a review handler with a 200 ms timeout and a fallback result | None built in; custom events | The platform's own app is the client |

Four patterns recur and shape the rest of the chapter:

- **Chat is broadcast, not conversation.** One message goes to everyone in the room, so cost and load scale with deliveries, not sends. Amazon IVS Chat prices it that way: $0.56 per 1,000 messages sent and $0.008 per 1,000 delivered as of October 2026. A single message into a room of 20,000 viewers is 20,000 deliveries, about $0.16 at that rate, roughly 280 times the price of sending it (illustrative arithmetic from the published prices).
- **Every message passes a check before anyone sees it.** Twitch's rules services evaluate each message against the channel's AutoMod settings "to decide whether to deliver or reject" it; YouTube holds messages for review at a chosen strictness; IVS calls the platform's own handler for every message and waits at most 200 ms. The check is in the delivery path, not a cleanup job afterwards.
- **The broadcaster's team moderates, the platform sets the floor.** Chat modes, timeouts, held messages and bans are mostly in the hands of the broadcaster and their moderators; the platform's sitewide rules and penalties sit above them, as in every community ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)).
- **The interactive layer is an event stream.** Polls, predictions, redemptions, raids and goals are state machines whose transitions are published as events, so overlays, bots, extensions and game studios can react; Twitch's EventSub catalog is effectively the inventory of what a live platform can do.

## Chat Fanout

Twitch's 2015 engineering overview describes the shape most live chats converge on: an **edge** that holds client connections ("IRC over raw TCP and over WebSockets"), a **pubsub** layer that distributes messages across edge nodes and "together with Edge" forms a hierarchical system for very large fanout, a **rules** service ("Clue") that runs each user action through business logic such as whether the sender is banned or a subscriber, and a **room** service that tracks who is in each channel. The 2023 description adds a second rules service (Zuma) beside Clue, and a separate PubSub with an edge for subscriptions, a control service that authorizes subscriptions to non-public topics, and a broker that fans out platform events such as viewer counts, Hype Train progress and poll voting status.

The design follows from the traffic:

- **Split chat from platform events.** Chat lines and state updates (a poll's tally, a goal's progress, a viewer count) have different shapes: chat is append-only text everyone sees; state updates can be coalesced to the latest value. Sending the tally of a poll every second is cheaper than sending every vote, and a client that missed three updates only needs the fourth.
- **Fan out per node, not per viewer.** The sender's message is published once to the channel's topic; each edge node that holds viewers of that channel receives it once and writes it to its local sockets. The general pattern is the playbook's [Fan-Out](/docs/architecture/realtime-connections#fan-out); the live twist is that one channel can hold a large share of the platform's viewers for an evening.
- **Hot channels are the capacity plan.** The biggest channel at its peak, not the average, sizes the fanout tier. A broadcast event (a tournament final, a celebrity stream) puts a single room's deliveries into every edge node at once, so the tree has to be deep enough that no node fans out to all the others directly.
- **Shed what can be shed.** Under overload, a client in a room of 100,000 can't read 300 messages a second anyway. My rule: sample or rate-limit what each viewer receives in very large rooms before dropping connections, and keep moderator, broadcaster and system messages (a ban notice, a raid announcement) on a priority path ([Load Shedding](/docs/architecture/realtime-connections#load-shedding)).
- **Room membership is approximate.** Twitch's API warns of "a delay between when users join and leave a chat and when the list is updated." A chatter list is a cache for display and moderation, never an authorization input.
- **Chat is replayed with the recording.** YouTube's live chat replay is on by default and shows chat beside the archived stream as it appeared live. That makes chat part of the VOD's content: a message removed during the stream must stay removed in the replay, and the replay needs each message's offset into the stream ([From Live to VOD](/books/user-generated-platforms/live-latency-and-vods#from-live-to-vod)).

![A live chat message's path in two rows. Before delivery, cheapest first: the sender's one message passes penalties (banned or timed out here?), chat modes (slow, followers, subscribers), terms and classifiers (drop or hold), the hold (hidden until a moderator allows it) and the delay (2, 4 or 6 seconds for non-moderators). Then, accented, fanout once per edge node: the message is published once to the channel topic, which fans out to three edge nodes, and each edge node writes to its own viewers' local sockets. A footer says ban notices, raid announcements and moderator messages ride a priority path, and very large rooms sample.](/diagrams/ugp-live-chat-path.svg "Every layer runs before any viewer sees the line, and the publish happens once: each edge node receives the message once, however many viewers it holds. The moderation layers are detailed under Moderation Before Delivery below.")

Third-party clients read chat in one of three ways, and each has a cost. **A long-lived socket** (Twitch's IRC and EventSub WebSockets, IVS's messaging WebSocket) is the cheapest for continuous reading. **Server streaming** is YouTube's recommended path: `liveChatMessages.streamList` sends recent history on connect, then pushes new messages over the open connection, at 5 quota units a call and 200 to 2,000 messages a response. **Polling** is the fallback: `liveChatMessages.list` returns a `pollingIntervalMillis` the client must wait before asking again, and asking faster than that returns a rate-limit error. My rule: offer a push channel for chat; a poll interval is a rate limit the server hands out, and it should lengthen under load.

## Rate Limits and Bots

Live chat rate limits do three jobs: keep a single sender from flooding a room, keep a bot farm from flooding many rooms, and keep the platform's own fanout inside its budget. Twitch publishes the clearest set:

| Sender | Messages | Joins |
| --- | --- | --- |
| Regular account, not broadcaster, moderator or VIP | 20 per 30 seconds, and 1 per second per channel | 20 per 10 seconds |
| Broadcaster, moderator or VIP in that channel | 100 per 30 seconds | 20 per 10 seconds |
| Verified bot | 7,500 per 30 seconds | 2,000 per 10 seconds |

A bot that exceeds the message limits is ignored "for 1 hour," except in channels where it is the broadcaster, a moderator or a VIP. Since May 15, 2024 an account may be joined to at most 100 channels concurrently, not counting channels where it is broadcaster or moderator or where the broadcaster authorized the bot. A single message is capped at 500 characters through the API. Announcements can be sent once every 2 seconds; a shoutout once every 2 minutes, and to the same channel once every 60 minutes.

What the published limits teach:

- **Rate limits depend on role in the room.** A moderator clearing spam or a broadcaster's bot answering commands needs more room than a viewer, so the limit is keyed on the sender's role in that channel, not just the account. The key is `(account, channel)` for the per-room limit and `account` for the global one ([What to Key On](/docs/requests/rate-limiting#what-to-key-on)).
- **Bots are accounts with a declared purpose.** Twitch's verified bot status raises message and join limits but "doesn't exempt the bot from AutoMod" and doesn't grant the chat bot badge; a bot shows the badge only when the broadcaster authorizes it for their channel. Separating "may send more" from "is labeled as a bot here" from "is trusted by this broadcaster" keeps one grant from implying the others, and the labeling matters for viewers who need to tell automation from people.
- **Silence, don't error.** Ignoring an over-limit bot for an hour is a penalty, not an HTTP error, which makes floods expensive for the operator and invisible to the room. For human senders the response is a client-side cooldown (the slow mode the viewer sees) rather than silent drops, so people don't think they were censored.
- **Cap joins as well as sends.** Join limits and concurrent-join caps are what stop one account from sitting in thousands of channels to scrape or to spam the moment a channel goes live. Spam rings that rotate accounts are the problem of [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#account-farms); the chat layer's job is to make each account's reach finite.

Amazon IVS shows the same limits from the infrastructure side: 10 messaging requests per second per connection (not adjustable), 100 `SendMessage` per second per room (configurable per room), 1,000 per second across an account's rooms, and 100 deletions or disconnections per second. A platform renting chat inherits those ceilings and still needs its own per-viewer limits above them.

## Moderation Before Delivery

Live chat moderation is layered. Each layer runs before the message reaches viewers, from the cheapest and bluntest to the most expensive:

1. **Penalties in force.** Is the sender banned or timed out in this channel, or restricted sitewide? Twitch timeouts run from 1 second to 1,209,600 seconds (two weeks); a ban has no duration. These are rows in the core `penalties` table with a `community_id`, checked on every send.
2. **Chat modes.** Channel-wide gates the broadcaster sets for the moment (below).
3. **Term lists and classifiers.** Blocked terms and an automated filter that either drops the message or holds it.
4. **The hold.** A held message is invisible to the room until a moderator allows it. YouTube offers None, Basic and Strict holding, and held messages "stay hidden from viewers unless you choose to show them"; Twitch's moderators allow or deny each AutoMod hold through the same tools the API exposes (`ALLOW` or `DENY`), and the sender is told their message was caught.
5. **A delay for everyone else.** Twitch's non-moderator chat delay holds every non-moderator message for 2, 4 or 6 seconds "to give chat moderators and bots a chance to remove them before viewers can see the message."

**Chat modes** are the broadcaster's dials, and the platforms converge on the same set:

| Mode | Twitch | YouTube | What it buys |
| --- | --- | --- | --- |
| Slow mode | 3 to 120 seconds between messages per user, default 30 | A gap the channel sets; owner, moderators and members exempt | Readable chat in a busy room |
| Followers-only | Must have followed for 0 minutes up to 129,600 (three months) | None | Stops accounts created for the raid |
| Subscribers or members only | Paid subscribers only | Subscribers-only (optionally for a minimum time) or members-only, not both | A paying or committed audience during an attack |
| Emote-only | Messages of emotes only | None | Keeps hype without text |
| Unique chat | Only unique messages may be posted | None | Stops copy-paste floods |
| Approved users only | None | Live commentary mode: only approved users send, everyone reads | A panel or a press event |

**A review hook is a latency budget.** Amazon IVS's message review handler is the vendor version of the rules service: IVS calls the platform's function for every `SendMessage` with the content, the sender's ID, attributes and IP, and the function returns `ALLOW` (optionally with edited content) or `DENY` (optionally with a reason the sender receives). The timeout is 200 ms and not adjustable; on a timeout, an invalid response or an error the message is allowed or denied according to a `fallbackResult` the platform chose in advance. Every platform with a classifier in the chat path makes the same choice. My default: fail closed (deny or hold) for channels in Shield-style lockdown, for accounts under restriction and for content types already flagged; fail open with an after-the-fact scan for everything else, because a chat that silently eats messages every time a classifier is slow teaches people the platform is censoring them. Record which way each message went and why ([Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review)).

**Graduated actions for chatters.** Beyond timeouts and bans, Twitch added two lighter tools. A **warning** blocks the user from chatting until they acknowledge it, with a reason of up to 500 characters, and a new warning replaces the old one. A **suspicious user** status of `ACTIVE_MONITORING` or `RESTRICTED` marks a chatter (often a suspected ban evader) so moderators see their messages flagged, or so they are held, without banning a possibly innocent account. Both are penalties with a scope of one channel; the playbook's ladder treats them as early rungs.

**Lockdown for attacks.** A hate raid is many new or throwaway accounts arriving at once to flood a channel with abuse. Twitch's answer, launched November 30, 2022, is Shield Mode: settings a channel "pre-programmed" in advance and turned on with one click by the broadcaster or a moderator, plus a bulk ban that removes everyone who recently used a chosen term, with those terms reset "every time Shield Mode is activated." The API exposes it as a single on/off state with the moderator who set it and when, and EventSub sends begin and end events. The design point is generic: a channel needs a preset "under attack" bundle (followers-only for a long period, no first-time chatters, stricter holds, slow mode) that one person can apply in a second and that is logged as one decision, and a mass action keyed on what the attackers did rather than who they are.

**Who holds the hotkey.** Channel moderators are volunteers appointed by the broadcaster, with ranks: YouTube distinguishes standard and managing moderators, and only the owner or a managing moderator can change the hold settings; Twitch announced a Lead Moderator role, able to add and remove moderators and change all moderation settings, assignable from November 2025. In the core model these are `roles` in the channel's community with permission bits, so the same permission algorithm that governs a forum governs a channel. [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-platform-s-controls-over-moderators) covers moderator tooling, caps and retention.

**Records that outlive the stream.** A held message, a deletion, a timeout and a ban are moderation decisions with the same audit needs as any other: who acted, under which channel or sitewide rule, on which message as it was. Platforms show the channel some of this history: YouTube's Channel Activity lists up to 50 public chat messages per stream and counts of deletions, timeouts and hides over the last year. A report from a viewer names the message IDs, so the reviewer sees the line from the server's record, not a screenshot ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)).

## Shared Chat

Collaborative streams (several broadcasters live together) used to fragment the audience across several chats. Twitch's Shared Chat merges them: while a session is active, each participating channel shows one combined chat, and Twitch made starting and managing a session simpler on mobile from June 2025. The developer surface shows how it is modeled:

- **A session spans channels.** EventSub sends `channel.shared_chat.begin`, `update` and `end` per participating channel, and the API returns the current session for a channel or nothing.
- **Every message keeps its origin.** A chat message in a shared session carries `source_broadcaster_user_id` and `source_message_id` (the channel and message where it was actually sent), the sender's badges in the source channel, and an `is_source_only` flag for messages shown only in their own channel. Moderation events carry the source channel too.
- **Some state can be shared.** Hype Train events carry `is_shared_train` and a list of participants, so a group event across channels is one train, not several.

The lesson for any platform that merges rooms: **the room is a view, the message belongs to one community.** Penalties, chat modes, holds and reports are decided by the community where the message was sent, under that community's rules and moderators; the other channels display it. A ban in one channel shouldn't silently ban a user from a partner's channel, and a sitewide penalty applies everywhere regardless. Paid events (a subscription, a cheer) stay with the channel that received them, which is a money question for [Creator Monetization](/books/user-generated-platforms/creator-monetization#tips-paid-messages-and-virtual-currencies).

## Raids and Audience Transfer

At the end of a stream, a broadcaster can send their viewers to another live channel. On Twitch this is a raid: the broadcaster starts it, chat shows how many viewers will be sent, and it happens when the broadcaster clicks Raid Now "or after the 90-second countdown expires." The API allows 10 raid requests within a 10-minute window, and fails when the raiding broadcaster is blocked by the target, when the target "doesn't accept raids from this broadcaster," or when there are "too many viewers in the raiding party." Whether the raid happened is an event (`channel.raid`, with the viewer count), not the API response. YouTube's equivalent is Live Redirect: when a stream ends, autoplay moves viewers to a Premiere or to another channel's live stream, the sender needs "more than 1,000 subscribers" and "no Community Guideline strikes," and the target must allow redirects from channels it subscribes to, from all channels, or from a list of up to 100.

A raid is a growth feature and an attack vector at once, which is why the designs converge:

- **The target consents.** An opt-in setting (everyone, followed channels, an allowlist, no one) is the first defense against raids used to deliver harassment.
- **The sender is accountable.** Eligibility gates (an audience size, a clean standing) and a rate limit make the feature costly to abuse; a raid records the sender, so a raid that brings abuse is a moderation case against the sending channel.
- **Arriving viewers are a cohort.** The target's moderators need to know who came in with the raid, so the platform tags arriving chatters with the raid for its first minutes. That makes "remove everyone from this raid" one action, the same shape as Shield Mode's bulk ban.
- **A countdown is a hold.** The 90 seconds let the sender cancel and the target prepare (switch on followers-only, warn moderators). Model the raid as a short-lived reservation with an expiry, like any hold ([Reservations & Holds](/docs/architecture/reservations-and-holds)).

Shoutouts are the lighter version: a broadcaster recommends another channel in chat, with the rate limits above and events for both sides.

## Channel Points, Polls and Predictions

Most of the interactive layer runs on a channel-scoped points currency that viewers earn by watching and spend on the channel's rewards. Twitch's channel points are the reference. Watch Streaks, rolling out to all channels from late 2025, reward regular viewers with channel points, and a viewer who missed a stream can keep the streak by watching its clips or VOD within 24 hours.

**Rewards.** A channel can define up to 50 custom rewards, counting enabled and disabled ones. Each has a cost of at least 1 point, an optional maximum per stream and per user per stream, a global cooldown, and a choice of whether redemptions go into a queue for the broadcaster to fulfill or are fulfilled immediately. A redemption is `UNFULFILLED` until the broadcaster or their tool marks it `FULFILLED` or `CANCELED`, and canceling refunds the points. Only the app that created a reward can update its redemptions, which keeps two tools from fighting over one queue.

**Polls.** A poll has a question of up to 60 characters and 2 to 5 choices of up to 25 characters each, runs for 15 to 1,800 seconds, and only one runs at a time. Viewers vote once, and a channel can allow extra votes paid in channel points (1 to 1,000,000 points a vote). Polls stay retrievable for 90 days.

**Predictions.** A prediction is a question of up to 45 characters with 2 to 10 outcomes; viewers stake channel points on an outcome during a window of 30 to 1,800 seconds. The broadcaster can lock it (no new predictions), resolve it with a winning outcome (points go to those who predicted it) or cancel it (points are refunded). If it isn't resolved within 24 hours of the window closing, Twitch cancels it and returns the points. Only one runs at a time.

**Hype Train, goals and charity.** A Hype Train is a time-boxed group event: contributions (cheers, subscriptions and gifted subscriptions) add points toward levels, the train expires if contributions stop, and a cooldown follows its end; the API reports level, total, progress, goal and top contributors, and all-time highs. Creator goals track progress toward a follower or subscription target, counted as followers, subscriptions or subscription points. Charity campaigns show a fundraising total and goal in the channel, in minor currency units, and Twitch says campaign data is "unavailable after the campaign ends," so a platform that shows a charity total on a stream has to keep its own record of what it displayed. The money in a Hype Train or a charity drive is real money and belongs to [Creator Monetization](/books/user-generated-platforms/creator-monetization#tips-paid-messages-and-virtual-currencies); the interactive layer only counts and displays it.

What these share, and how to build them:

- **Points are a ledger, not a balance.** Every accrual, spend, refund, stake and payout is an entry with a reason and a source, and the balance is a sum. A canceled redemption or a canceled prediction is a refund entry, never an edit; the 24-hour auto-cancel is a background job writing refunds ([Background Jobs](/docs/architecture/background-jobs)).
- **Keep points out of money's rules.** My rule: channel points are earned, never bought, never transferable between viewers or channels, and never redeemable for cash or items of monetary value. Cross any of those lines and the points become a virtual currency with refund, consumer-protection and gambling questions (a prediction market staked with purchasable points is a wager), which is the territory of [Creator Monetization](/books/user-generated-platforms/creator-monetization#paid-earned-and-promotional-currency) and [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#virtual-goods-and-currencies).
- **One active poll, one active prediction.** The platform's limits make the state machines simple: a partial unique index on the channel where status is active.
- **Votes and stakes are idempotent.** A viewer's double-tap or a reconnect must not vote twice or stake twice; key each on `(poll, account)` or `(prediction, account)` and an idempotency key ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Tallies are coalesced events.** Votes write rows; viewers receive a tally every second or so through the platform-events path, not every vote.
- **Time is the stream's.** A poll opened at a moment in the stream is also a cue in the recording ([Timed Metadata and Ad Breaks](/books/user-generated-platforms/live-latency-and-vods#timed-metadata-and-ad-breaks)), so a viewer watching the VOD later sees the poll where it happened, closed.

## Extensions

Extensions put third-party code into the viewing experience. Twitch's model is the reference: an extension is a web page in one of three views (a **panel** below the video, an **overlay** over the whole video, or a **component** inside part of the video that viewers can hide), running in a sandboxed iframe on a separate domain (`ext-twitch.tv`) that the browser treats as a different origin from the platform. A supervisor frame embeds it and sets a content security policy whose `frame-src` blocks anything but the extension, the developer configures the extension's CSP in the console (meta tags aren't allowed), and the extension talks to the platform only through `postMessage` wrapped by a helper library. Mobile extensions have worked on iOS and Android without a separate allowlist since July 9, 2024.

The privacy design is the part to copy:

- **Opaque identities by default.** The extension gets an opaque viewer ID, not the account: logged-in viewers get a `U-` ID that persists across sessions, logged-out viewers an `A-` ID that changes between sessions. Only if the extension enables identity linking and the viewer accepts a prompt (`requestIdShare`) does it receive the real user ID.
- **A backend of its own.** The extension's server (the Extension Backend Service) receives requests from the extension and can push messages to every instance of the extension in a channel at once through the platform's pubsub.
- **Rate-limited speech.** An extension can post into chat, but only 280 characters at a time and 12 messages a minute per channel.
- **Review before release.** Extensions, developer organizations and game ownership go through platform review, the same queue as any app.

A platform's own version needs the same pieces: an install per channel with a slot (panel, overlay, component), a per-extension opaque ID derived from the account (a keyed hash of extension and account, so the same viewer looks different to different extensions and can't be joined across them), a consent record for identity sharing, and the extension's scopes. Extensions that sell items for a virtual currency are a revenue split between broadcaster and developer, which is [Creator Monetization](/books/user-generated-platforms/creator-monetization#the-spread). The app catalog, credentials and review process belong to [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#bots-and-apps); the chapter models only the install.

## Drops

Drops connect watching to a game: a game studio runs a campaign, viewers who watch participating channels (or subscribe) earn an in-game reward, and the studio grants it when the viewer's platform account is linked to their game account. Twitch's figures: "41 million Drops were claimed across over 6,000 campaigns" in 2024. Its guidance sets the shape:

- **Two kinds of campaign.** Time-based (15 to 30 minutes of watching for a standard reward, about 3 to 6 hours for higher-value ones) and subscription-based (typically 1 to 2 subscriptions).
- **No monetary value.** Rewards are granted off-platform and can take any form "as long as they are of no monetary value," and the guidance advises against transferable items or items that give an advantage.
- **Late links still count.** Studios must fulfill for viewers who claim and link "at least 14 days after the campaign ends," a requirement Twitch may waive for rare time-sensitive campaigns.
- **Few campaigns per channel.** At most two at a time on a channel: one global and one channel-specific.
- **Grants are events.** EventSub's `drop.entitlement.grant` notifies the studio's organization (batching is required for this type), and each notification has an ID "for de-duplicating messages."

Watch time is the input, so drops are a bot magnet: an account farm left watching streams earns rewards at scale. The earning rule has to count only verified viewing (an active player, a signed-in account in good standing, one stream at a time) and the entitlement has to be one per account per reward. The studio's side (reading the claim, granting idempotently, marking fulfilled) is the Gaming volume's [Affiliate Codes and Drops](/books/gaming/creator-economies#affiliate-codes-and-drops); the platform's side is the campaign, the eligibility rule and the entitlement record. Twitch was testing time-limited badge drops for special streams in late 2025, an on-platform reward with the same shape.

## Event Subscriptions

Everything above is consumed by tools the platform didn't write: overlays that show the latest follower, bots that run the poll, studio servers that grant drops, analytics dashboards. The platforms publish an event catalog and deliver it to subscribers:

- **Twitch EventSub** covers chat (messages, deletions, clears, notifications, settings changes), AutoMod holds, shared chat, raids, channel points rewards and redemptions, polls, predictions, Hype Train, goals, charity campaigns, Shield Mode, shoutouts, moderation actions, ad breaks (`channel.ad_break.begin`), stream online and offline, and drop grants. It delivers over three transports (webhooks, WebSockets and conduits), "at least once," with a stable message ID to de-duplicate and a timestamp handlers should reject if older than 10 minutes. Webhook messages carry an HMAC signature header computed with the subscriber's secret; a subscriber that doesn't answer "within a few seconds" too many times has its subscription revoked as `notification_failures_exceeded`. WebSocket clients may hold 3 connections per user token with 300 enabled subscriptions each.
- **Kick's webhooks** cover chat messages, follows, new, renewed and gifted subscriptions, reward redemption updates, livestream status and metadata, bans and gifts of its tipping currency. Each request is signed with Kick's private key (SHA-256 with RSA over the message ID, timestamp and body), carries a ULID message ID to use as an idempotency key, and the public key is fetched from Kick's API rather than hard-coded because Kick can rotate it.
- **YouTube** exposes live chat through its API (above) rather than a push catalog.

The webhook mechanics (signatures, retries, replay, consumer expectations) are the playbook's [Webhooks](/docs/api-design/webhooks); the live-specific rules are three. **Events need a scope and a consent.** A subscription to a channel's chat or redemptions needs the broadcaster's (or a moderator's) authorization, and a chat subscription through an app token additionally needs the bot account's consent; read access to a channel is granted by its owner, not by the app. **The cost of a subscription is part of the API contract.** Twitch gives each subscription a cost and each client a maximum total cost, which bounds how much of the platform one tool can watch. **Order isn't guaranteed.** Twitch warns that it "does not make strong assurances about the order of message delivery," so a Hype Train progress event can arrive after its end; each event carries enough state (level, total, timestamps) for the consumer to discard stale ones. Who may subscribe is the app and installation model of [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#how-to-build-it) (an app, its installation in the channel, its reviewed privileged access), and delivery follows the playbook's webhooks doc; this chapter only emits the events.

## How to Build It

The chapter's additions to the core model, as columns on existing tables and new tables. Chat messages themselves are rows in the message store of [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it); the sketch refers to them by that store's key (channel, time bucket and message id), and a live channel's chat is a `channels` row there under the channel's community.

```sql
ALTER TABLE communities                  -- live channels: kind = 'channel'
  ADD COLUMN incoming_raids TEXT NOT NULL DEFAULT 'everyone'
    CHECK (incoming_raids IN ('everyone', 'followed', 'allowlist', 'nobody'));

CREATE TABLE chat_settings (             -- a channel's chat modes over time
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id            UUID NOT NULL REFERENCES communities (id),
  slow_mode_seconds     INT CHECK (slow_mode_seconds BETWEEN 1 AND 600),  -- null: off
  followers_only_minutes INT CHECK (followers_only_minutes >= 0),        -- null: off
  supporters_only       BOOLEAN NOT NULL DEFAULT FALSE,  -- subscribers or members
  emote_only            BOOLEAN NOT NULL DEFAULT FALSE,
  unique_only           BOOLEAN NOT NULL DEFAULT FALSE,
  approved_only         BOOLEAN NOT NULL DEFAULT FALSE,  -- live commentary mode
  first_time_chatters   BOOLEAN NOT NULL DEFAULT TRUE,
  hold_level            TEXT NOT NULL DEFAULT 'basic' CHECK (hold_level IN ('off', 'basic',
                          'strict')),
  non_moderator_delay_seconds SMALLINT NOT NULL DEFAULT 0
                          CHECK (non_moderator_delay_seconds IN (0, 2, 4, 6)),
  lockdown              BOOLEAN NOT NULL DEFAULT FALSE,  -- the preset "under attack" bundle
  review_fallback       TEXT NOT NULL DEFAULT 'allow' CHECK (review_fallback IN ('allow',
                          'hold', 'deny')),               -- when the classifier times out
  set_by_account_id     UUID REFERENCES accounts (id),  -- null: platform default
  valid_during          TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (channel_id WITH =, valid_during WITH &&)
);

CREATE TABLE chat_holds (                -- messages kept from the room pending a decision
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  chat_channel_id    UUID NOT NULL,      -- Real-Time Chat's messages key: channel,
  message_bucket     INT NOT NULL,       -- time bucket
  message_id         BIGINT NOT NULL,    -- and time-ordered id
  channel_id         UUID NOT NULL REFERENCES communities (id),  -- the live channel
  sender_account_id  UUID NOT NULL REFERENCES accounts (id),
  held_by            TEXT NOT NULL CHECK (held_by IN ('classifier', 'blocked_term',
                       'restricted_sender', 'review_timeout', 'lockdown')),
  category           TEXT,               -- the classifier's category, e.g. 'harassment'
  score              NUMERIC(5, 4),
  model_version      TEXT,               -- vendor and version, or the term list version
  status             TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'allowed',
                       'denied', 'expired')),
  decided_by_account_id UUID REFERENCES accounts (id),  -- a channel moderator or staff
  decided_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (chat_channel_id, message_bucket, message_id)
    REFERENCES messages (channel_id, bucket, id),
  CHECK ((status IN ('allowed', 'denied')) = (decided_at IS NOT NULL))
);

CREATE TABLE raids (                     -- an audience sent from one channel to another
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  from_channel_id     UUID NOT NULL REFERENCES communities (id),
  to_channel_id       UUID NOT NULL REFERENCES communities (id),
  from_stream_id      UUID REFERENCES streams (content_item_id),
  requested_by        UUID NOT NULL REFERENCES accounts (id),
  status              TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled',
                        'rejected')),
  rejected_reason     TEXT,              -- 'not_accepted', 'blocked', 'too_many_viewers', ...
  viewer_count        INT,               -- as sent
  expires_at          TIMESTAMPTZ NOT NULL,  -- the countdown
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  CHECK (from_channel_id <> to_channel_id)
);

CREATE TABLE channel_point_rewards (     -- what a channel's points can buy
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id              UUID NOT NULL REFERENCES communities (id),
  title                   TEXT NOT NULL,
  cost                    BIGINT NOT NULL CHECK (cost >= 1),   -- in points, not money
  needs_input             BOOLEAN NOT NULL DEFAULT FALSE,
  max_per_stream          INT CHECK (max_per_stream >= 1),
  max_per_viewer_per_stream INT CHECK (max_per_viewer_per_stream >= 1),
  global_cooldown_seconds INT CHECK (global_cooldown_seconds >= 1),
  skips_queue             BOOLEAN NOT NULL DEFAULT FALSE,  -- fulfilled on redemption
  managed_by_app          TEXT,          -- only this app may resolve its redemptions
  enabled                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at              TIMESTAMPTZ
);

CREATE TABLE channel_point_redemptions (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  reward_id         UUID NOT NULL REFERENCES channel_point_rewards (id),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  stream_id         UUID REFERENCES streams (content_item_id),
  cost              BIGINT NOT NULL,     -- as charged, whatever the reward costs later
  user_input        TEXT,                -- moderated like a chat message
  status            TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (status IN ('unfulfilled',
                      'fulfilled', 'cancelled')),
  resolved_by       UUID REFERENCES accounts (id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

CREATE TABLE channel_point_entries (     -- the points ledger; a balance is a sum
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id      UUID NOT NULL REFERENCES communities (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  amount          BIGINT NOT NULL CHECK (amount <> 0),  -- credit positive, debit negative
  reason          TEXT NOT NULL CHECK (reason IN ('watch', 'watch_streak', 'bonus',
                    'redemption', 'redemption_refund', 'poll_vote', 'prediction_stake',
                    'prediction_payout', 'prediction_refund', 'adjustment', 'expiry')),
  source_type     TEXT,                  -- 'stream', 'redemption', 'live_poll', 'prediction'
  source_id       UUID,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE live_polls (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id           UUID NOT NULL REFERENCES communities (id),
  stream_id            UUID REFERENCES streams (content_item_id),
  title                TEXT NOT NULL,
  choices              TEXT[] NOT NULL CHECK (cardinality(choices) BETWEEN 2 AND 5),
  extra_vote_cost      BIGINT CHECK (extra_vote_cost >= 1),  -- null: one vote each
  status               TEXT NOT NULL CHECK (status IN ('active', 'completed',
                         'terminated', 'archived')),
  created_by           UUID NOT NULL REFERENCES accounts (id),
  opens_at             TIMESTAMPTZ NOT NULL,
  closes_at            TIMESTAMPTZ NOT NULL,
  CHECK (closes_at > opens_at)
);
CREATE UNIQUE INDEX live_polls_one_active ON live_polls (channel_id) WHERE status = 'active';

CREATE TABLE live_poll_votes (
  poll_id       UUID NOT NULL REFERENCES live_polls (id),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  choice        SMALLINT NOT NULL,       -- index into live_polls.choices
  votes         INT NOT NULL DEFAULT 1 CHECK (votes >= 1),  -- extra votes cost points
  points_spent  BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (poll_id, account_id, choice)
);

CREATE TABLE predictions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id       UUID NOT NULL REFERENCES communities (id),
  stream_id        UUID REFERENCES streams (content_item_id),
  title            TEXT NOT NULL,
  outcomes         TEXT[] NOT NULL CHECK (cardinality(outcomes) BETWEEN 2 AND 10),
  status           TEXT NOT NULL CHECK (status IN ('active', 'locked', 'resolved',
                     'cancelled')),
  window_ends_at   TIMESTAMPTZ NOT NULL,
  resolve_by       TIMESTAMPTZ NOT NULL,  -- after this, cancelled and refunded
  winning_outcome  SMALLINT,
  created_by       UUID NOT NULL REFERENCES accounts (id),
  resolved_at      TIMESTAMPTZ,
  CHECK ((status = 'resolved') = (winning_outcome IS NOT NULL))
);
CREATE UNIQUE INDEX predictions_one_open ON predictions (channel_id)
  WHERE status IN ('active', 'locked');

CREATE TABLE prediction_entries (        -- one outcome per viewer per prediction
  prediction_id UUID NOT NULL REFERENCES predictions (id),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  outcome       SMALLINT NOT NULL,
  points        BIGINT NOT NULL CHECK (points >= 1),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (prediction_id, account_id)
);

CREATE TABLE drop_campaigns (            -- a studio's watch-to-earn campaign
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  studio_account_id    UUID NOT NULL REFERENCES accounts (id),  -- the game's organization
  game_category        TEXT NOT NULL,
  title                TEXT NOT NULL,
  scope                TEXT NOT NULL CHECK (scope IN ('global', 'channel')),
  channel_ids          UUID[],           -- for scope = 'channel'
  kind                 TEXT NOT NULL CHECK (kind IN ('watch_time', 'subscription')),
  required_minutes     INT CHECK (required_minutes >= 1),
  required_subscriptions INT CHECK (required_subscriptions >= 1),
  runs_during          TSTZRANGE NOT NULL,
  fulfil_until         TIMESTAMPTZ NOT NULL,  -- at least 14 days after the campaign ends
  CHECK ((kind = 'watch_time') = (required_minutes IS NOT NULL))
);

CREATE TABLE drop_entitlements (         -- one reward earned by one account
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  campaign_id      UUID NOT NULL REFERENCES drop_campaigns (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  status           TEXT NOT NULL CHECK (status IN ('earned', 'claimed', 'fulfilled',
                     'voided')),
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at       TIMESTAMPTZ,
  fulfilled_at     TIMESTAMPTZ,          -- reported by the studio
  void_reason      TEXT,                 -- e.g. 'inauthentic_viewing'
  UNIQUE (campaign_id, account_id)
);

CREATE TABLE extension_installs (        -- third-party code in a channel's viewing surface
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id        UUID NOT NULL REFERENCES communities (id),
  extension_ref     TEXT NOT NULL,       -- the app in Developer Platforms' catalog
  version           TEXT NOT NULL,
  slot              TEXT NOT NULL CHECK (slot IN ('panel', 'overlay', 'component')),
  identity_linking  BOOLEAN NOT NULL DEFAULT FALSE,  -- may ask viewers to share their ID
  installed_by      UUID NOT NULL REFERENCES accounts (id),
  active_during     TSTZRANGE NOT NULL
);
```

Notes on the sketch:

- **Channel moderators and VIPs are roles.** A lead moderator, a moderator and a VIP are `roles` in the channel's community with `membership_roles`, and the permission bits decide who can change `chat_settings`, decide holds, time out and start raids. Timeouts, warnings, suspicious-user restrictions and bans are rows in `penalties` with the channel's `community_id`; a sitewide ban has none and applies in every channel.
- **Settings are history.** Each change to a channel's chat modes closes one `chat_settings` row and opens another, so "was followers-only on when this message was held" is an as-of query ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). Turning on lockdown is one row with the bundle applied, recorded as one decision.
- **Holds are moderation decisions.** A `chat_holds` row records which layer held the message, the model and its version, and who allowed or denied it. A held message nobody decides stays hidden and expires with the room; a denied message can still be reported and become a `moderation_cases` row with `subject_type = 'message'`.
- **The delivery path reads caches.** Penalties in force, the current `chat_settings` row and the sender's role in the channel are cached at the chat edge and invalidated by events; the database is the record, not the hot path.
- **Points are an append-only ledger.** Balances are sums over `channel_point_entries` per channel and account (with a running snapshot for speed), spends lock the account's row in a balance cache to stay non-negative, and every refund (a canceled redemption, a canceled or auto-cancelled prediction) is a new entry with its own idempotency key. Points are never money and never cross channels.
- **Redemptions keep their price.** `channel_point_redemptions.cost` is what was charged, so a refund returns that amount after the reward's price changes.
- **One poll and one prediction at a time** per channel, enforced by partial unique indexes; the auto-cancel at `resolve_by` is a scheduled job that writes refund entries and moves the prediction to `cancelled`.
- **Drops count verified watching only.** The watch-time accrual reads the viewer's playback sessions, excludes accounts under restriction or flagged as automated, and writes at most one entitlement per account per campaign; `voided` keeps the record when an entitlement is reversed for inauthentic viewing.
- **Extensions see opaque IDs.** The ID shown to an extension is a keyed hash of the extension and the account, so it is stable for that extension and useless to any other; the real account ID is released only after the viewer accepts an identity-sharing prompt, recorded as a consent.
- **Events:** `chat.settings_changed`, `chat.message_held`, `chat.hold_decided`, `chat.lockdown_started`, `chat.lockdown_ended`, `raid.requested`, `raid.completed`, `channel_points.redeemed`, `channel_points.redemption_resolved`, `poll.started`, `poll.progress`, `poll.ended`, `prediction.started`, `prediction.locked`, `prediction.resolved`, `prediction.cancelled`, `drop.entitlement_granted` and `extension.installed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the platform-events fanout, overlays, the recording's cue track and the third-party event feed. Progress events are coalesced and carry full state, because consumers can't rely on order.

## Auditing

- **Every moderation action in chat,** with the actor (broadcaster, channel moderator, staff, a bot acting for a moderator, or an automated layer with its model version), the channel, the message as sent and the policy behind it ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)). Chat logs are short-lived; the decisions and the messages they judged are not.
- **Every chat settings change and lockdown,** with who set it and when, so a report about a raid can be read against what the channel had switched on.
- **Every hold and its outcome,** including holds that defaulted on a classifier timeout, so the fallback rate is measurable and an appeal can see that a message was held by a timeout rather than a judgment.
- **Every raid,** with sender, target, viewer count and the accounts that arrived with it, because a harassment raid is a case against the sending channel.
- **Every points movement,** as ledger entries tied to the redemption, vote or prediction that caused them, so a viewer's complaint about lost points is a query, not a guess.
- **What was shown on stream.** A poll's question and final tally, a charity total, a goal's progress at the moment the broadcaster displayed them; the vendor or platform API may not keep them after the event.
- **Which third parties had access,** with scopes, the broadcaster's authorization, and which extensions received real identities from which viewers.

## What This Means for the System You Build

- **Size chat by deliveries, not sends,** and plan capacity for the biggest channel's peak, not the average room.
- **Split chat lines from platform events,** and coalesce tallies, counts and progress to the latest state.
- **Key rate limits on the sender's role in the channel** as well as the account, cap joins as well as sends, and give bots a declared, separately granted status.
- **Run moderation in the delivery path:** penalties, chat modes, term lists, classifiers, holds and a short delay, each before the room sees the message.
- **Give every classifier hook a time budget and a recorded fallback,** fail closed where the channel or sender is under restriction, and measure how often the fallback fires.
- **Ship a one-click lockdown and a mass action keyed on behavior,** so a moderator can stop a hate raid in seconds.
- **Make shared rooms views over communities:** each message keeps its source channel, whose rules and moderators decide it.
- **Make raids consensual and accountable:** target opt-in, sender eligibility, a countdown hold, and arriving viewers tagged as a cohort.
- **Run points as a non-monetary, per-channel ledger** with refunds as entries, and keep anything purchasable or transferable out of it.
- **Count only verified viewing for drops,** one entitlement per account per reward.
- **Give extensions opaque, per-extension viewer IDs** and release real identities only on the viewer's consent.
- **Publish every interactive state change as an event,** at least once, with IDs to de-duplicate and full state to discard stale ones.

## References

**Platform engineering**

- [Twitch: Twitch engineering, an introduction and overview (2015)](https://blog.twitch.tv/en/2015/12/18/twitch-engineering-an-introduction-and-overview-a23917b71a25/), chat edge, pubsub, rules and room services, IRC over TCP and WebSockets, over 10 billion messages a day
- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), Clue and Zuma rule evaluation before delivery, PubSub edge, control and broker, hundreds of billions of messages a day
- [Twitch: Ten years of TwitchCon, Rotterdam (May 2025)](https://blog.twitch.tv/en/2025/05/31/ten-years-of-twitchcon-here-s-what-we-announced-in-rotterdam), Shared Chat on mobile, Watch Streaks rewarding channel points
- [Twitch: Ten years of TwitchCon, San Diego (October 2025)](https://blog.twitch.com/en/2025/10/17/ten-years-of-twitchcon-here-s-what-we-announced-in-san-diego/), Lead Moderator role from November 2025, Watch Streaks keeping rules, badge drops testing

**Platform developer documentation**

- [Twitch: Chat and chatbots](https://dev.twitch.tv/docs/chat/), message and join rate limits, verified bots, the one-hour ignore, concurrent join cap from May 15, 2024, the chat bot badge and `channel:bot`, EventSub and API preferred over IRC
- [Twitch: Twitch API reference](https://dev.twitch.tv/docs/api/reference/), Send Chat Message (500 characters), announcements and shoutout limits, Update Chat Settings ranges, Ban User timeout range, Warn Chat User, suspicious user statuses, Manage Held AutoMod Messages, Shield Mode status, Get Chatters delay, Start a raid (countdown, rate limit, failures), custom rewards and redemption status, Create Poll, Create and End Prediction, Hype Train status, creator goals, charity campaigns, shared chat session, extension chat messages
- [Twitch: EventSub subscription types](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/), the event catalog, shared chat source fields, shared Hype Trains, raid viewer counts, drop grants with batching, ordering caveat
- [Twitch: EventSub](https://dev.twitch.tv/docs/eventsub/), webhook, WebSocket and conduit transports, at-least-once delivery, message ID de-duplication, 10-minute timestamp check
- [Twitch: Handling webhook events](https://dev.twitch.tv/docs/eventsub/handling-webhook-events/), HMAC signature header, response within a few seconds, revocation as `notification_failures_exceeded`
- [Twitch: Managing EventSub subscriptions](https://dev.twitch.tv/docs/eventsub/manage-subscriptions/), subscription cost, WebSocket connection and subscription limits
- [Twitch: Extensions](https://dev.twitch.tv/docs/extensions/), panel, overlay and component views, sandboxed iframe on `ext-twitch.tv`, supervisor CSP, opaque `U-` and `A-` IDs, backend service, mobile extensions from July 9, 2024, review
- [Twitch: Extensions reference](https://dev.twitch.tv/docs/extensions/reference/), `requestIdShare` identity linking
- [Twitch: Drops](https://dev.twitch.tv/docs/drops/), time and subscription campaigns, no monetary value, 14-day fulfillment, two campaigns per channel, 41 million claims across 6,000 campaigns in 2024
- [YouTube: Live Streaming API, liveChatMessages.streamList](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/streamList), server streaming, initial history, 5 quota units, 200 to 2,000 results
- [YouTube: Live Streaming API, liveChatMessages.list](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list), `pollingIntervalMillis`, quota cost
- [Kick: Event types](https://docs.kick.com/events/event-types), the webhook catalog
- [Kick: Webhook security](https://docs.kick.com/events/webhook-security), RSA signature over message ID, timestamp and body, ULID message IDs, rotating public key

**Platform help and vendor documentation**

- [YouTube: Moderate live chat](https://support.google.com/youtube/answer/9826490?hl=en), held for review levels, blocked words, slow mode exemptions, subscribers-only and members-only chat, live commentary mode, hide user, standard and managing moderators, live chat replay, Channel Activity
- [YouTube: How to use Live Redirect](https://support.google.com/youtube/answer/10359590?hl=en), redirecting viewers at stream end, target permission, eligibility
- [Amazon IVS: Chat service quotas](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/service-quotas.html), connection, room, message rate and deletion quotas, 200 ms review handler timeout
- [Amazon IVS: Chat message review handler](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/chat-message-review-handler.html), allow, deny and edit, fallback result on errors, deny reason to the sender
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), chat messages sent and delivered

**Press**

- [CogConnected: Twitch rolls out Shield Mode to mitigate hate raid abuse](https://cogconnected.com/2022/11/twitch-shield-mode/), launch on November 30, 2022, one-click presets, bulk ban by term, terms reset on each activation
