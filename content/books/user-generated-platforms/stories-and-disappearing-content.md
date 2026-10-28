+++
title = "Stories & Disappearing Content"
nav_title = "Stories & Disappearing"
description = "Stories, close friends and audience snapshots, view-once and disappearing messages, what deleted really means, holds that beat expiry, and ephemeral safety."
category = "User-Generated Platforms Industry"
order = 1823
part = "Social and Short-Form"
tags = ["user-generated-content", "stories", "ephemeral-content", "messaging", "data-retention"]
+++

A post on a forum is written to last. A Story is written to vanish: a photo or a few seconds of video that sits at the top of friends' screens for a day and then goes away. That one design choice changed what people share. Snap's annual report says it plainly: "Snaps are deleted by default to mimic real-life conversations, so there is less pressure to look popular or perfect." The format began on Snapchat in October 2013, Instagram copied it in August 2016, WhatsApp, TikTok and others followed, and the disappearing message that started it all (a Snap that deletes once it's opened) is now a setting in WhatsApp and Instagram as well as Snapchat. Snap alone reported 493 million daily active users in the second quarter of 2026.

Ephemerality is a promise, and it's the hardest promise in this book to keep honestly. The item has to stop serving at the right moment for exactly the right people, but the platform also has to keep it when a report, a CyberTipline report, a preservation letter or a lawsuit says so; and every copy the system made along the way (variants, CDN caches, search entries, embeddings, notification payloads, backups, the viewer's own screenshot) has its own clock. The FTC's 2014 order against Snapchat is the canonical case of a platform that promised more disappearance than it could deliver. And the same property that makes a surface feel safe to post on makes it attractive to people who extort and groom, because the evidence is meant to go away.

This chapter covers the format (Stories, archives and highlights, the daily dual-camera prompt, notes and status), the tray that orders them, audiences and why an audience is fixed when the item is posted, disappearing messages and view-once media, what "deleted" actually means, safety on ephemeral surfaces, and the discovery products built on Stories (maps, Discover and Spotlight, Story ads). It extends `content_items` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) with a story kind and an expired state, `messages` from [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it) with retention settings and view-once opens, and `legal_holds` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it); it adds audience lists and snapshots, view receipts, capture events, expirations and a purge ledger. Legal process itself is [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework); the generic mechanics of deletion are the playbook's [Data Retention & Deletion](/docs/architecture/data-retention). The interest-graph feeds that now carry Stories beside short video belong to [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds), and the camera, lenses and dual capture to [Camera & Effects](/books/user-generated-platforms/camera-and-effects).

## How the Platforms Do It

| Platform | Ephemeral surfaces | Default lifetime | Audience controls | What survives |
| --- | --- | --- | --- | --- |
| **Snapchat** | Snaps, Chats, My Story, Private and Shared Stories, Snap Map | Snaps deleted once every recipient has viewed them, unopened ones after 31 days; Chats 24 hours after everyone viewed them or 31 days after sending, whichever is sooner; Stories usually 24 hours | Per-conversation chat timers (after viewing, 24 hours, 7 days, never); Private Stories with chosen viewers; location off by default with Ghost Mode | Messages someone saved, replied to or reacted to; Memories; public Story data up to 30 days; Topic Chats retained five years |
| **Instagram** | Stories, Close Friends Stories, Notes, Candid Stories, Instants | Stories 24 hours; Notes 24 hours; Instants gone once viewed and never viewable after 24 hours | Close Friends list only the owner sees; hide story from anyone; Notes to people you follow back or Close Friends | Private Stories Archive; Highlights until removed; Instants archive up to one year |
| **WhatsApp** | Status, disappearing messages, view once | Status 24 hours; messages 24 hours, 7 days or 90 days when turned on; default timer off | Per chat, or a default timer for new chats; admins control it in groups | Whatever a recipient forwards, saves or photographs before expiry |
| **TikTok** | Stories, TikTok Now | Stories 24 hours | Account privacy; under-16 accounts private by default | Highlights on the profile |
| **BeReal** | One daily dual-camera post | Daily | Friends; you see friends' posts only after posting your own | Not covered here |
| **YouTube** | Stories, retired | Seven days | Not covered here | Creation stopped June 26, 2023 |

The patterns: **every platform separates serving from keeping** (a Snap stops showing on view, while Memories, saves and public Story data persist on their own clocks); **the audience is chosen per item, from lists only the poster sees**; **the lifetime is a setting with several values, not a constant** (WhatsApp's three durations, Snapchat's four chat options); and **every platform admits the recipient can keep a copy** (Snapchat's help says recipients can always screenshot or photograph the screen). The table is uneven because each platform documents a different slice; the chapter builds from the slices that are public.

## The Format

Snapchat announced Stories on October 3, 2013: a Snap added to your Story "lives for 24 hours before it disappears," and "each Snap in your Story includes a list of everyone who views it." Before that, a Snap appeared for up to ten seconds and was gone. Instagram's version, on August 2, 2016, set the template the rest of the industry copied: photos and videos that "disappear after 24 hours," shown in a bar at the top of the feed rather than in the profile grid, with "no likes or public comments," replies sent as private Direct messages, a swipe-up list of who has seen each item, and the ability to hide your story from anyone. WhatsApp rebuilt its text status as 24-hour photo, video and GIF updates in February 2017, end-to-end encrypted like its messages.

Why it worked is in the design: nothing accumulates. A grid of permanent posts becomes a portfolio people curate; a Story has no public like count, leaves no permanent record on the profile, and is replaced by tomorrow's. Snap's annual report frames the default as reducing the "pressure to look popular or perfect." My reading of what follows: posting costs less socially, so people post more often, to smaller audiences, about less.

Not every platform kept the format. TechCrunch reported that LinkedIn dropped Stories in 2021; YouTube stopped new Stories on June 26, 2023 (its Stories lasted seven days), saying that among creators who used both, Community posts drove "many times more comments and likes" and Shorts "many times more subscribers." Stories work where the graph is friends; on a creator platform the same slot is better spent on posts and short video. TikTok's Stories show the newer shape: they last 24 hours but can appear in the For You and Following feeds as well as the profile and inbox, so an ephemeral item is ranked like any other video.

### Archives and Highlights

Ephemeral for viewers isn't ephemeral for the poster. Instagram added a private Stories Archive in December 2017: stories save to it automatically when they expire, and the poster can collect them into Highlights, which appear on the profile and "stay on your profile until you remove them." Snapchat's Memories is "a searchable collection" stored on both the account and the device, kept "as long as you need it." TikTok Stories can be saved as Highlights; Instagram's Instants go to a private archive for up to a year.

The consequence for the system: **expiry ends serving to the audience; it doesn't end the poster's copy.** An expired item the poster archived is still personal data, still reportable if it reappears in a Highlight, still subject to a deletion request, and still preservable. A Highlight re-shows old items, and my rule is that it never widens them: an item posted to Close Friends appears in a Highlight only to people in its original audience.

### The Daily Prompt

BeReal turned ephemerality into a schedule: once a day at a random time everyone gets the "Time to BeReal" notification, has two minutes to take a photo with the front and back cameras at once, can't add filters, and sees friends' posts only after posting their own; a post made after the window is labeled with how late it was. The copies arrived quickly. Instagram's Candid Stories (December 2022) are visible only to people who also post their own and come with a daily reminder; TikTok Now (September 15, 2022) gave a daily prompt to capture a ten-second video or a photo with the front and back cameras. The data model needs a prompt event per region and a lateness value per post, and the rule "you see it only if you posted" is an audience rule like any other, evaluated at view time.

### Notes and Status

The smallest ephemeral formats are text. Instagram Notes (December 2022) are up to 60 characters of text and emoji, shown at the top of the inbox for 24 hours to people you follow back or your Close Friends, with replies arriving as DMs; since August 2025 notes from mutual follows also appear on Instagram's map for 24 hours. WhatsApp's original status was text only before 2017. These are Stories without media: one current item per author that a new one replaces, the same audience choices, and replies routed into messaging. They belong in the same table as Stories, with a surface value, rather than in a parallel system.

## The Tray

The row of avatars at the top of the screen is a ranked list of authors, not of items, and its order decides who gets seen. Instagram's ranking explainer (May 31, 2023) names the signals for its Stories tray: **viewing history** ("how often you view an account's stories"), **engagement history** ("how often you engage with that account's stories," such as likes or DMs) and **closeness** ("your relationship with the author overall"); the system predicts whether you'll tap into, reply to or skip a story and orders the tray from those predictions. It also says that popularity signals "matter much more in Explore than they do in Feed or in Stories," which is the point: the tray is a friends' surface ranked by relationship, not by reach.

Three mechanics sit under any tray:

- **Candidates come from the graph and the audience.** The tray is authors the viewer follows or is friends with who have at least one live item the viewer is allowed to see. The audience check is the expensive part, because it's per item and per viewer.
- **Unseen first.** An author whose items the viewer has all seen drops behind authors with something new; the view receipts that tell the poster who watched also tell the tray what's unseen.
- **Close-audience items stand out.** Instagram marks Close Friends stories with a green ring in the tray and a green badge on the story. A ranking that uses the audience as a feature is legitimate; one that tells a viewer which lists they're on beyond the item they can already see is a privacy leak.

The ranking model itself is the feed problem in [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline); this chapter's SQL sketch only produces the candidate set and the unseen flag that the ranker orders.

## Audiences

A Story is rarely for everyone. The controls the platforms expose:

- **Close Friends.** Instagram's list (November 30, 2018): "Only you can see your close friends list," and "no one can request to be added." Notes and Instants reuse it.
- **Hide from.** Instagram's launch post lets you "hide your entire story from anyone you don't want to see it," including followers.
- **Chosen viewers.** Snapchat's Private Stories: "only you decide which friends can view it," friends who can't view it aren't told it exists, and the viewers see it mixed in with your My Story.
- **Relationship audiences.** Followers, mutual follows ("followers you follow back"), friends, or public.
- **Shared Stories.** Several authors post into one story (Snapchat's hold up to 1,000 Snaps, newer replacing the oldest), and each author can save only their own Snaps from it.

Three properties make these lists different from the graph in [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#how-to-build-it): **they're private to the owner** (being on someone's Close Friends list is itself sensitive, so it's never exposed through an API, an export to the member, or a "who added me" view); **they're not consented edges** (nobody accepts being on a list, unlike a friendship); and **they change constantly**, often right before a post.

### Fixing the Audience at Post Time

When the poster edits a list after posting, which items does that change? Get this wrong in one direction and a person added to Close Friends today sees everything posted to Close Friends last night, which the poster never intended; get it wrong in the other and removing an ex from the list doesn't take effect until tomorrow. My rule is **an audience can narrow after posting, never widen:**

- **Lists freeze.** At post time the item gets an audience snapshot: the base (public, followers, friends, a list, or named recipients) and, for lists and named recipients, the resolved set of accounts. Someone added to the list later doesn't gain access to items already posted.
- **Revocations stay live.** Removing someone from the list, adding them to the hide-from list, a block, an unfollow, or the end of a friendship takes effect immediately on every live item, Highlights included.
- **Relationship audiences follow the graph.** An item posted to followers is visible to someone who follows after posting; the poster chose a relationship, not a list. Exclusions captured at post time still apply.
- **Derived surfaces inherit the snapshot.** A Highlight, a resurfaced memory, a reshare into the poster's own Story and a recap compiled from archived items all carry the original snapshot, narrowed by live revocations.

The snapshot is also evidence. A report about a Close Friends story, or a court asking who could see an item, needs the audience as it was when the item was posted, not as the list stands today.

### Seen Receipts, Replies and Reactions

Every item on these surfaces has a viewer list visible only to the poster: Snapchat's from the 2013 launch, Instagram's swipe-up "who's seen each photo and video." The receipt is a row per viewer per item, the same row the tray reads for unseen state, and it's personal data about the viewer: it expires with the item (plus whatever window the platform documents for the poster's insights), it's part of the poster's export only as the list the poster could already see, and it's held with the item when the item is held.

Replies don't go to a public thread. On Instagram they're Direct messages; Notes replies arrive as DMs; Instants allow reactions and replies. A reply is a message in [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it) that quotes the story item, so the conversation outlives the item it answers. Two consequences: the quoted reference must render as "story unavailable" once the item expires or is removed (never a cached copy of the media), and a reply is a first contact between two accounts, so the stranger rules in [Direct Messages and the Stranger Problem](/books/user-generated-platforms/real-time-chat#direct-messages-and-the-stranger-problem) apply to story replies as much as to DMs.

## Disappearing Messages and View-Once Media

Messaging inherited the format in two forms: a conversation-level timer and a per-item view-once flag.

**Conversation timers.** WhatsApp launched disappearing messages on November 5, 2020 with one option (new messages "disappear after 7 days," either person can turn it on in a one-to-one chat, admins control it in groups), and on December 6, 2021 added 24-hour and 90-day durations and a default timer for all new chats. Snapchat inverts the default: Chats delete 24 hours after everyone has viewed them or 31 days after sending, whichever is sooner, and the user can choose after viewing, 24 hours or 7 days after viewing, or never; Community Group Chats delete seven days after everyone has viewed them. In March 2024 Snap added the option to "retain indefinitely" per conversation, with in-chat notices showing the current setting. The design points that recur:

- **The setting is a property of the conversation over time.** Changing it is an event both sides see; each message is governed by the setting in force when it was sent, so turning a timer on doesn't delete history and turning it off doesn't resurrect what already expired.
- **The clock starts at different moments.** "After sent" (WhatsApp's timers), "after viewed by everyone" (Snapchat's default), or "after viewed, plus a duration." A viewed-based clock needs per-recipient read state, and a ceiling for messages never opened (Snapchat's 31 days), or an unread message lives forever.
- **Saving overrides the timer, visibly.** On Snapchat, saving, replying to or reacting to a message keeps it longer, and a saved message gets a gray background "so everyone in the Chat can see what's saved." Saving is a per-message, per-person flag that both sides can see and that the expiry job must read.
- **Deletion by the sender is a different act.** Snapchat lets you delete messages you sent, friends can see that a message was deleted, and "your friends can still take a screenshot before you delete the message." Unsend serves a tombstone, exactly as [Edits, Deletes and Retention](/books/user-generated-platforms/real-time-chat#edits-deletes-and-retention) describes.

**View once.** WhatsApp's View Once (August 3, 2021) sends a photo or video that disappears "after they've been opened" and shows as "opened"; Snapchat's Snaps have worked that way since the beginning (deleted from servers once every recipient has viewed them); Instagram's Instants (May 2026) disappear once viewed and can't be viewed after 24 hours, with screenshots and recordings blocked and an unsend available before the friend opens it. View-once is a per-recipient open event on one media asset, which means the asset can't be deleted until every recipient has opened it or the unopened ceiling passes, and the client must never cache it beyond the viewing session.

End-to-end encryption changes what the server holds. WhatsApp says View Once media "is protected by end-to-end encryption so WhatsApp cannot see them," and its Status updates are end-to-end encrypted too. On an encrypted service the server holds only ciphertext until delivery and the timer runs on the devices; reports become client-side (the reporter's device submits the decrypted content), as [Encryption](/books/user-generated-platforms/real-time-chat#encryption) covers.

### Screenshots and Screen Recording

The screenshot notification is the feature people associate with Snapchat, and it's the feature the FTC said overpromised. The operating systems give apps a signal, never control:

- **iOS** posts a notification when a person takes a screenshot, and it "posts after the screenshot is taken": the app learns of the capture, it can't stop it. A separate property reports whether the system is "actively recording, mirroring, or using AirPlay to stream the contents of the screen," which lets an app hide content while capture is running; the system blacks out FairPlay-protected video in recordings but includes its audio.
- **Android 14** added a screenshot detection API that fires only when the user presses the hardware button combination, and doesn't detect screenshots taken through ADB or instrumentation tests; the callback carries no image. Separately, `FLAG_SECURE` keeps an activity's contents out of screenshots and off non-secure displays, which is the kind of blocking WhatsApp tested for View Once in August 2022 and Instagram's Instants advertise.
- **Nothing stops a second camera.** Every platform says so: Snapchat's help says recipients can always screenshot or photograph their screen, and its Private Stories page says viewers "can always screenshot or screen record."

The honest design is to **notify when the OS signals, block where the OS allows, and never claim more**: the notice to the sender says "they took a screenshot," not "your Snap can't be saved," and the help text says a camera defeats both. Saves inside the app are a stronger signal than OS detection (Snapchat shows a screenshot icon in the poster's read receipts when someone saves a Snap from a Story), because the app performed them.

## What Deleted Actually Means

Three different events hide behind "it disappeared," and a platform that conflates them overpromises:

| Event | What happens | Who can still see it | Typical clock |
| --- | --- | --- | --- |
| **Expiry** | The item stops serving to its audience | The poster (archive, Memories), the platform | The surface's lifetime: 24 hours, after viewing, a timer |
| **Deletion** | The item is removed from the product: by the poster, a moderator or retention | The platform, for a documented window | Immediate in the product; a grace window before purge |
| **Purge** | Every copy the platform controls is destroyed | Nobody at the platform; recipients' own copies remain | After the window, unless a hold applies |

Snap's privacy policy shows the gap between the first two and the third in its own words: Snaps and Chats "will be deleted by default from our servers within 24 hours" after they're opened or expire, unless settings or saves say otherwise; the company "cannot promise that deletion will take place by a specific time"; it may keep content if "we receive a notice from a court asking us to keep a copy of your content," along with reports of abuse and content flagged for violations; and it "may also keep certain information in backup for a limited period of time or as required by law." Its help says opened or expired Snaps "typically cannot be retrieved from Snapchat's servers by anyone, for any reason." That's the right shape: a default, the exceptions named, and no absolute.

### Every Copy Has a Clock

The original file is the easy part. The copies a media pipeline makes, each of which must be on the purge list:

- **Variants and transcodes.** Thumbnails, sized images and video renditions from [Images at Scale](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand) and [Video on Demand](/books/user-generated-platforms/video-on-demand#how-to-build-it).
- **CDN caches.** An expired item served from an edge cache is still being served; expiry and deletion write CDN purges and wait for confirmation ([Takedowns and Cache Purges](/books/user-generated-platforms/storage-and-delivery#takedowns-and-cache-purges)). Short TTLs on ephemeral media, set from the item's `expires_at`, cut the purge load.
- **Search and discovery indexes.** A public Story or Map submission indexed for search must leave the index on expiry ([The Index and the Moderation Clock](/books/user-generated-platforms/search-and-discovery#the-index-and-the-moderation-clock)).
- **Derived features.** Embeddings, perceptual hashes, classifier scores and ranking features computed from the item. Hashes kept for child-safety or intimate-image matching are kept on purpose under their own rule; the rest go with the item.
- **Notification payloads and previews.** A push notification or a lock-screen preview carrying the image is a copy on a device and possibly at the push provider; ephemeral surfaces should push a reference, not the media ([Notifications & Consent](/docs/architecture/notifications#push-notifications)).
- **Backups.** Backups have their own retention, and an erasure log replayed after restore keeps expired items expired ([Backups](/docs/architecture/data-retention#backups)); per-item keys destroyed at purge make every copy unreadable at once ([Crypto-Shredding](/docs/security/encryption-at-rest#crypto-shredding)).
- **Copies the user keeps.** Archives, Memories, Highlights, saved messages, and Instants' one-year archive are the poster's or a participant's choice; they're governed by deletion requests, not expiry.
- **Copies outside the platform.** Screenshots, a second phone, a share off the app. Snapchat's help warns that Snaps shared off Snapchat may still appear elsewhere. Out of reach, and the product copy says so.

A deletion request under GDPR Article 17 reaches every copy the platform controls, and Article 17(2) adds that a controller who made the data public must take reasonable steps, "taking account of available technology and the cost of implementation," to inform other controllers processing it that erasure of "any links to, or copy or replication of" it was requested. The mechanics (one erasure pipeline, derived stores, proof) are [Erasure Requests](/docs/architecture/data-retention#erasure-requests); what's specific here is that expiry runs the same pipeline on a timer, millions of times a day, so it has to be cheap, batched and provable.

### The Snapchat Order

On May 8, 2014 the FTC announced that Snapchat had agreed to settle charges that it deceived users. The complaint's core: Snapchat marketed Snaps as able to "disappear forever," but recipients could save them indefinitely with third-party apps (a security researcher had warned the company); video Snaps were stored unencrypted outside the app's protected storage, where connecting the phone to a computer reached them; and the promised screenshot alert could be evaded on Apple devices running systems before iOS 7. The complaint also covered Android location collection despite a privacy policy saying the company didn't track it, the upload of iOS users' entire address books through Find Friends, and a failure to verify phone numbers that let a breach expose 4.6 million usernames and numbers. The order bars misrepresenting the privacy, security or confidentiality of user information and requires a comprehensive privacy program monitored by an independent privacy professional for 20 years; Snap's annual report says the final order issued in December 2014 and requires biennial independent privacy audits over its 20-year term.

The lessons are all about claims matching mechanics:

- **Describe the default, not the guarantee.** "Deleted by default from our servers," not "disappears forever."
- **Every client is in scope.** Third-party clients and unofficial APIs defeat ephemerality; the API terms, the authentication and the abuse detection that stop them are part of the promise ([Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#how-to-build-it)).
- **Local storage is a copy.** Media cached on the device must be encrypted and in app-private storage, and removed at the end of the viewing session.
- **Notifications have OS limits,** and the claim follows the weakest supported OS version.

US regulators enforce privacy promises as consumer protection, which is why the product copy for an ephemeral feature goes through the same review as the privacy policy ([US Regulators as Platform Regulators](/books/user-generated-platforms/regulators-and-enforcement#us-regulators-as-platform-regulators)).

### Holds Beat Expiry

An ephemeral item is still evidence, and four obligations stop the clock:

- **Preservation requests.** Under 18 U.S.C. 2703(f) a provider must preserve records in its possession for 90 days on a government request, extendable by another 90. Snap says it will "attempt to preserve any available Snapchat account records" for properly identified users in the requested date range and keep them "in an offline file for up to 90 days," extended once on a formal request. Preservation copies what exists when the request arrives; an item that already purged can't be recovered, which is why the purge window is a decision with law enforcement consequences ([Privacy Rights Against Evidence](/books/user-generated-platforms/law-enforcement-requests#privacy-rights-against-evidence)).
- **CyberTipline reports.** Since the REPORT Act, a completed report to NCMEC is treated as a request to preserve the contents and related context "for 1 year after the submission" ([Preservation](/books/user-generated-platforms/child-safety#preservation)). A Snap reported this way must not purge on view.
- **Litigation holds.** Once litigation is reasonably anticipated, the duty to preserve applies; [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type) covers what a court can do when it isn't met.
- **Reports and cases.** Snap says that "when you report content in the app, we're able to review and retain it, even if it would otherwise delete by default." A report holds what it names for the life of the case.

The implementation rule is the book's: every hold is a `legal_holds` row with a reason and an end, the expiry job stops serving on schedule regardless (expiry is about the audience, and holds don't extend visibility), and the purge job skips anything held, re-checking at execution, not just at scheduling. A hold from law enforcement is invisible to the user, so a held item still looks expired to its poster and its audience ([User Notice](/books/user-generated-platforms/law-enforcement-requests#user-notice)).

## Safety on Ephemeral Surfaces

### Reporting What Already Expired

A disappearing message is reported after the harm, often after the content is gone from the reporter's screen. The design that works captures evidence at the moment of the report, from the server, not from the reporter's screenshot. Snap's reporting page says that a reported piece of media is automatically included in the report, and for chats "some of the preceding messages will also be automatically included, so we have context about what occurred." The rules that follow:

- **Report from the conversation, not the item.** The reporter selects a message, a Snap or a story author; the server attaches what it still holds (the item if it isn't purged, the surrounding messages, the audience snapshot, the view and capture events) to the case ([Reports and Queues](/docs/security/trust-and-safety#reports-and-queues)).
- **Keep a short grace window after expiry.** If the purge happens the instant an item expires, a report filed a minute later has nothing to attach. A documented window (hours to days) between expiry and purge, during which the item serves to nobody but is still reportable, is the trade between privacy and safety, and it's the same trade [Edits, Deletes and Retention](/books/user-generated-platforms/real-time-chat#edits-deletes-and-retention) makes for chat.
- **Hold on report.** The report creates a hold on what it attaches, so the expiry job can't purge evidence under review.
- **Accept that some reports will be empty.** An item purged on schedule before anyone reported it is gone; the case records that, and the account-level signals (reports, blocks, the contact graph) carry the investigation.

The opposite design is a cautionary allegation. New Mexico's unredacted complaint against Snap quotes an internal email in which, the state alleges, Snap's CEO rejected preserving images categorized as abuse for review or for law enforcement: "we don't want to be responsible for storing that stuff. Better if they screenshot and email ghostbusters [Snap's user report mechanism] to report." Those are the state's allegations, not findings; the design lesson stands on its own, which is that asking a victim to screenshot the evidence is asking them to re-handle the abuse and leaves the platform with a copy it can't verify.

### Sextortion and Teen Defaults

Disappearing media is a tool for extortion: an offender persuades a victim to send an image they believe will vanish, captures it with a second device, then demands money or more images. The scale and the reporting duties are in [Grooming and Sextortion](/books/user-generated-platforms/child-safety#grooming-and-sextortion); the takedown routes for victims (Take It Down, StopNCII, the TAKE IT DOWN Act) are [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#hash-based-prevention). Snap says that in the first part of 2026 it was enforcing against "roughly 220 suspected sexual extortion instances per day, or around 6,600 per month globally," and it added a sextortion-specific reporting option in 2023, worded "They leaked / are threatening to leak my nudes" on outside experts' advice.

What ephemeral surfaces change is where the defaults bite:

- **Contact before content.** Snap's teen defaults: accounts private, communication only with "mutually accepted friends" or saved contacts, hidden from search without an existing connection, a warning when chatting with someone without mutual friends or saved contacts, and accounts set to 13 to 17 can't change to 18 or older. Instagram's Teen Accounts (September 17, 2024) let only people a teen follows or is connected to message them, and teens under 16 need a parent's permission to loosen the protections. The general table is [Defaults by Age](/books/user-generated-platforms/minors-and-age-assurance#defaults-by-age).
- **The disappearing setting is a risk feature.** A conversation between an adult and a teen with no mutual friends, a timer just switched on, and a view-once image requested is a pattern for the risk score, built from the setting change events this chapter records, without reading content ([Risk Scoring](/docs/architecture/risk-scoring)).
- **Engagement metrics off for teens.** Snap's teens don't see how many people favorited their Stories or Spotlights; a public count of story viewers is pressure the format was meant to remove.
- **Supervision sees metadata.** Snap's Family Center (August 9, 2022) shows parents who their teens are friends with and who they've been communicating with, without "revealing any of the substance of those conversations"; Instagram includes Instants in Teen Accounts and Family Center and notifies supervising parents the first time a teen downloads the Instants app. The design rules are [Family Supervision](/books/user-generated-platforms/minors-and-age-assurance#family-supervision).

### The State Cases

New Mexico's Attorney General sued Snap in state court in Santa Fe on September 4, 2024, and filed an unredacted complaint on October 1. As the state's press release describes it, the complaint alleges that Snap employees discussed 10,000 user reports of sextortion a month by November 2022 while acknowledging they "likely represent a small fraction of this abuse," that Quick Add suggested adult strangers to minors and Snap Map let adults find minors, that law enforcement warned that ephemeral messages made drug dealers' activity "untraceable," that the Discover feed recommended drug dealers who marketed through Stories, and that "only about 0.33% of teens have joined the Family Center." Snap moved to dismiss on November 18, 2024, arguing among other things lack of personal jurisdiction and Section 230, and disputes the allegations. As of October 2026 I state only the filing and the motion; I couldn't open a court record or report of the outcome. The broader design litigation against Snap and others, including the settlements before the first bellwether trials, is [The Addiction Cases](/books/user-generated-platforms/hosting-liability#the-addiction-cases).

The allegations map onto the system: recommendation of strangers is the graph's problem, location sharing is an audience problem, and "ephemeral means untraceable" is a retention-window and report-capture problem. A platform that can show its report capture, its hold records and its default settings over time is the one that can answer these suits with records.

## Discovery Built on Stories

### Location Sharing

Snap Map (June 21, 2017) shows friends who share their location and Snaps submitted to the map. Snap says location sharing "is off by default" and that Snapchatters "can only ever share their whereabouts with their existing Snapchat friends." The audience choices are all friends, all friends except some, or only selected friends; Ghost Mode hides the user from everyone on a timer of 3 hours, 24 hours or until turned off, with two caveats Snap states itself: the location "will still be shared with Snap," and "Snaps you submit to Snap Map can still show up on the Map, no matter what location setting you choose." Instagram's map (August 6, 2025) follows the same pattern: off unless you opt in, shareable with mutual follows, Close Friends, a handpicked group or no one, and supervising parents are notified when their teen starts sharing.

Location is an audience with a timer. It uses the same lists and the same narrow-never-widen rule; a pause is a dated row, not a toggle, so a timed Ghost Mode ends on its own; and the map submission is a separate public item with its own audience, which the product must label as such. Location in an image's metadata is a separate leak covered in [Metadata, Location and Orientation](/books/user-generated-platforms/images-at-scale#metadata-location-and-orientation). New Mexico's allegation that the map let adults find minors is why teen defaults restrict sharing to selected friends.

### Friends' Stories, Discover and Spotlight

Snap's annual report describes Stories as content "from friends, our community, and our content partners," with a Discover section of curated content from creators and publishers, and Spotlight, launched November 23, 2020, as the place that "showcases the best of Snapchat." The split matters for safety: friends' Stories reach an audience the poster chose; Discover and Spotlight are distribution the platform chooses. Snap's moderation page says Spotlight videos are "first reviewed via automation by artificial intelligence" before they can be recommended and reassessed during distribution, and that proactive harm detection runs on public, high-visibility surfaces including Stories; Spotlight "doesn't allow for public comments." My rule follows: **anything the platform distributes beyond the poster's chosen audience is reviewed before reach, like any recommended content**, and an ephemeral lifetime is no excuse to skip it, because a Story can collect its whole audience in an hour. The interest-graph machinery that ranks those surfaces is [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds).

Public ephemeral content also lasts longer than its label. Snapchat's help says public Story data may be kept up to 30 days and that Snap Map and public Stories may stay viewable for a day or two or much longer.

### Story Ads

Ads sit between Stories because full-screen vertical media between friends' items is high-attention inventory. Snap's ad formats include Story Ads ("Snapchatters can tap through a series of images or videos you curate") and single image or video ads that "can show up in the Stories and Spotlight ad placements." Two specifics follow from the format: an ad between friends' Stories inherits the brand-safety question of what it sits next to, which on a friends' surface is unknowable in advance ([Brand Safety and Suitability](/books/user-generated-platforms/ads-and-data-licensing#brand-safety-and-suitability)); and the targeting signals can't include the audience lists, because "this viewer is on a Close Friends list" is not an advertising attribute. Teen ad restrictions apply here as everywhere: Snap blocks gambling and alcohol ads for users under the legal age in their jurisdiction. Commerce inside Stories and live shopping are [Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping).

## How to Build It

The chapter's additions. A story item is a `content_item` with a side table, the way streams and listings are, because it's published, reported, ranked and moderated through the same pipeline; disappearing chat stays in `messages`, because chat is too many rows for the content pipeline ([Real-Time Chat](/books/user-generated-platforms/real-time-chat)).

```sql
ALTER TABLE content_items
  DROP CONSTRAINT content_items_kind_check,
  ADD CONSTRAINT content_items_kind_check CHECK (kind IN ('post', 'comment', 'media_post',
    'stream', 'listing', 'story')),
  DROP CONSTRAINT content_items_state_check,
  ADD CONSTRAINT content_items_state_check CHECK (state IN ('draft', 'pending_review',
    'published', 'hidden', 'removed', 'deleted', 'expired'));  -- expired: stopped serving

CREATE TABLE audience_lists (            -- close friends, custom lists, hide-from
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('close_friends', 'custom', 'hidden_from')),
  name             TEXT,                 -- custom lists; never shown to members
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX audience_lists_one_system_list
  ON audience_lists (owner_account_id, kind) WHERE kind <> 'custom';

CREATE TABLE audience_list_members (     -- private to the owner; nobody accepts membership
  audience_list_id UUID NOT NULL REFERENCES audience_lists (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (audience_list_id WITH =, account_id WITH =, valid_during WITH &&)
);

CREATE TABLE audience_snapshots (        -- who an item was for, fixed when it was posted
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id UUID NOT NULL REFERENCES accounts (id),
  base             TEXT NOT NULL CHECK (base IN ('public', 'followers', 'mutuals',
                     'friends', 'list', 'direct', 'posters_only')),
  audience_list_id UUID REFERENCES audience_lists (id),  -- base = 'list'
  included_count   INT,                  -- size of the resolved set, for lists and direct
  captured_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((base = 'list') = (audience_list_id IS NOT NULL))
);

CREATE TABLE audience_snapshot_accounts ( -- resolved inclusions (lists, direct) and exclusions
  audience_snapshot_id UUID NOT NULL REFERENCES audience_snapshots (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  effect               TEXT NOT NULL CHECK (effect IN ('include', 'exclude')),
  PRIMARY KEY (audience_snapshot_id, account_id)
);

CREATE TABLE daily_prompts (             -- one "post now" moment per region
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  region      TEXT NOT NULL,             -- a time zone group
  fired_at    TIMESTAMPTZ NOT NULL,
  window_ends TIMESTAMPTZ NOT NULL,      -- after this, posts are labeled late
  UNIQUE (region, fired_at)
);

CREATE TABLE story_items (               -- the ephemeral side of a story content item
  content_item_id      UUID PRIMARY KEY REFERENCES content_items (id),
  surface              TEXT NOT NULL CHECK (surface IN ('story', 'shared_story', 'note',
                         'status', 'daily_prompt', 'map_submission')),
  audience_snapshot_id UUID NOT NULL REFERENCES audience_snapshots (id),
  expires_at           TIMESTAMPTZ NOT NULL,  -- published_at plus the surface's lifetime
  daily_prompt_id      UUID REFERENCES daily_prompts (id),
  late_by              INTERVAL,         -- shown to viewers; null when on time
  replies_allowed      BOOLEAN NOT NULL DEFAULT TRUE,
  archived             BOOLEAN NOT NULL DEFAULT TRUE,  -- poster keeps a private copy
  CHECK ((surface = 'daily_prompt') = (daily_prompt_id IS NOT NULL))
);

CREATE TABLE highlights (                -- old items re-shown on a profile, never wider
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  profile_id     UUID NOT NULL REFERENCES profiles (id),
  title          TEXT NOT NULL,
  cover_asset_id UUID REFERENCES media_assets (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE highlight_items (
  highlight_id    UUID NOT NULL REFERENCES highlights (id),
  content_item_id UUID NOT NULL REFERENCES story_items (content_item_id),
  position        SMALLINT NOT NULL,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (highlight_id, content_item_id)
);

CREATE TABLE story_views (               -- seen receipts; partitioned by day, purged with the item
  content_item_id   UUID NOT NULL REFERENCES content_items (id),
  viewer_account_id UUID NOT NULL REFERENCES accounts (id),
  first_viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count        SMALLINT NOT NULL DEFAULT 1,
  PRIMARY KEY (content_item_id, viewer_account_id)
);

CREATE TABLE capture_events (            -- screenshots, recordings and saves, as signaled
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('content_item', 'message')),
  subject_id       UUID NOT NULL,        -- content item, or the message's channel
  message_id       BIGINT,               -- set when subject_type = 'message'
  actor_account_id UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('screenshot', 'screen_recording',
                     'save_in_app')),
  signal           TEXT NOT NULL CHECK (signal IN ('os_callback', 'capture_state',
                     'app_action')),     -- how it was observed; app actions are certain
  client_platform  TEXT NOT NULL CHECK (client_platform IN ('ios', 'android', 'web')),
  occurred_at      TIMESTAMPTZ NOT NULL,
  CHECK ((subject_type = 'message') = (message_id IS NOT NULL))
);

CREATE TABLE conversation_retention (    -- the disappearing setting of a DM or group, over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id    UUID NOT NULL REFERENCES channels (id),
  clock         TEXT NOT NULL CHECK (clock IN ('after_sent', 'after_viewed', 'keep')),
  duration      INTERVAL,                -- 24 hours, 7 days, 90 days; zero: on view
  unopened_max  INTERVAL,                -- delete even if never opened, e.g. 31 days
  set_by        UUID REFERENCES accounts (id),  -- null: the platform default
  valid_during  TSTZRANGE NOT NULL,
  CHECK ((clock = 'keep') = (duration IS NULL)),
  EXCLUDE USING GIST (channel_id WITH =, valid_during WITH &&)
);

ALTER TABLE messages
  ADD COLUMN retention_id UUID REFERENCES conversation_retention (id),  -- in force when sent
  ADD COLUMN view_once    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN expires_at   TIMESTAMPTZ;   -- computed once the clock starts; null while saved

CREATE TABLE message_opens (             -- per recipient, for view-once media
  channel_id UUID NOT NULL,
  message_id BIGINT NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts (id),
  opened_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, message_id, account_id)
);

CREATE TABLE message_saves (             -- a save keeps a message past its timer, visibly
  channel_id   UUID NOT NULL,
  message_id   BIGINT NOT NULL,
  account_id   UUID NOT NULL REFERENCES accounts (id),
  valid_during TSTZRANGE NOT NULL,       -- closed on unsave
  EXCLUDE USING GIST (channel_id WITH =, message_id WITH =, account_id WITH =,
    valid_during WITH &&)
);

CREATE TABLE location_shares (           -- no row: not sharing
  account_id       UUID PRIMARY KEY REFERENCES accounts (id),
  audience_base    TEXT NOT NULL CHECK (audience_base IN ('friends', 'list')),
  audience_list_id UUID REFERENCES audience_lists (id),
  hidden_until     TIMESTAMPTZ,          -- a timed pause; 'infinity' until turned off
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((audience_base = 'list') = (audience_list_id IS NOT NULL))
);

CREATE TABLE expirations (               -- one row per item or message whose lifetime ended
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type      TEXT NOT NULL CHECK (subject_type IN ('story_item', 'message')),
  subject_id        UUID NOT NULL,       -- content item, or the message's channel
  message_id        BIGINT,
  author_account_id UUID NOT NULL REFERENCES accounts (id),
  expired_at        TIMESTAMPTZ NOT NULL,  -- stopped serving to the audience
  purge_due_at      TIMESTAMPTZ NOT NULL,  -- expired_at plus the report grace window
  state             TEXT NOT NULL CHECK (state IN ('expired', 'held', 'purging',
                      'purged', 'kept_by_owner')),
  legal_hold_id     UUID REFERENCES legal_holds (id),  -- the hold that stopped the purge
  purged_at         TIMESTAMPTZ,
  CHECK ((subject_type = 'message') = (message_id IS NOT NULL)),
  CHECK ((state = 'purged') = (purged_at IS NOT NULL))
);

CREATE TABLE expiration_purge_steps (    -- proof of purge, copy by copy
  expiration_id UUID NOT NULL REFERENCES expirations (id),
  copy_kind     TEXT NOT NULL CHECK (copy_kind IN ('primary_row', 'origin_object',
                  'variants', 'cdn', 'search_index', 'derived_features', 'view_receipts',
                  'capture_events', 'backup')),
  status        TEXT NOT NULL CHECK (status IN ('pending', 'done', 'not_present',
                  'kept_by_rule')),      -- kept_by_rule: e.g. a hash kept for matching
  ref           TEXT,                    -- media_purges, cdn_purges or key-destruction id
  completed_at  TIMESTAMPTZ,
  PRIMARY KEY (expiration_id, copy_kind)
);

ALTER TABLE legal_holds
  DROP CONSTRAINT legal_holds_reason_check,
  ADD CONSTRAINT legal_holds_reason_check CHECK (reason IN ('claim_window', 'open_dispute',
    'cybertipline_preservation', 'preservation_request', 'litigation',
    'regulatory_retention', 'tax', 'report_evidence'));  -- a user report under review
```

Who can see a story item, with lists frozen and revocations live:

```sql
CREATE FUNCTION story_visible_to(p_item UUID, p_viewer UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT ci.author_account_id = p_viewer OR (
    ci.state = 'published' AND s.expires_at > NOW()
    AND NOT EXISTS (SELECT 1 FROM blocks b                     -- live: blocks either way
      WHERE b.kind = 'block'
        AND ((b.blocker_account_id = ci.author_account_id AND b.blocked_account_id = p_viewer)
          OR (b.blocker_account_id = p_viewer AND b.blocked_account_id = ci.author_account_id)))
    AND NOT EXISTS (SELECT 1 FROM audience_snapshot_accounts x  -- frozen: excluded at post
      WHERE x.audience_snapshot_id = a.id AND x.account_id = p_viewer AND x.effect = 'exclude')
    AND NOT EXISTS (SELECT 1 FROM audience_lists l               -- live: hidden since
      JOIN audience_list_members m ON m.audience_list_id = l.id
      WHERE l.owner_account_id = ci.author_account_id AND l.kind = 'hidden_from'
        AND m.account_id = p_viewer AND upper_inf(m.valid_during))
    AND CASE a.base
      WHEN 'public' THEN TRUE
      WHEN 'followers' THEN EXISTS (SELECT 1 FROM follows f
        WHERE f.follower_account_id = p_viewer AND f.target_type = 'account'
          AND f.target_id = ci.author_account_id::text)
      WHEN 'friends' THEN EXISTS (SELECT 1 FROM friendships fr
        WHERE fr.state = 'accepted'
          AND fr.account_low_id = LEAST(p_viewer, ci.author_account_id)
          AND fr.account_high_id = GREATEST(p_viewer, ci.author_account_id))
      WHEN 'mutuals' THEN EXISTS (SELECT 1 FROM follows f1 JOIN follows f2
          ON f2.follower_account_id = ci.author_account_id AND f2.target_type = 'account'
         AND f2.target_id = p_viewer::text
        WHERE f1.follower_account_id = p_viewer AND f1.target_type = 'account'
          AND f1.target_id = ci.author_account_id::text)
      WHEN 'posters_only' THEN EXISTS (SELECT 1 FROM content_items mine  -- posted today too
        JOIN story_items ms ON ms.content_item_id = mine.id
        WHERE mine.author_account_id = p_viewer
          AND ms.daily_prompt_id = s.daily_prompt_id AND mine.state = 'published')
      ELSE EXISTS (SELECT 1 FROM audience_snapshot_accounts x   -- 'list', 'direct': frozen
          WHERE x.audience_snapshot_id = a.id AND x.account_id = p_viewer
            AND x.effect = 'include')
        AND (a.base = 'direct' OR EXISTS (SELECT 1 FROM audience_list_members m  -- live: still on
          WHERE m.audience_list_id = a.audience_list_id AND m.account_id = p_viewer
            AND upper_inf(m.valid_during)))
    END)
  FROM content_items ci
  JOIN story_items s ON s.content_item_id = ci.id
  JOIN audience_snapshots a ON a.id = s.audience_snapshot_id
  WHERE ci.id = p_item
$$;
```

The tray's candidates and unseen flag; the ranker supplies the affinity scores (viewing, engagement and closeness predictions) as arrays:

```sql
WITH scores AS (
  SELECT * FROM unnest($2::uuid[], $3::real[]) AS t (author_account_id, affinity)
)
SELECT ci.author_account_id,
       MAX(ci.published_at)                    AS latest_item_at,
       BOOL_AND(v.viewer_account_id IS NOT NULL) AS all_seen,
       BOOL_OR(a.base = 'list')                AS has_close_audience_item,
       sc.affinity
FROM scores sc
JOIN content_items ci       ON ci.author_account_id = sc.author_account_id
JOIN story_items s          ON s.content_item_id = ci.id
JOIN audience_snapshots a   ON a.id = s.audience_snapshot_id
LEFT JOIN story_views v     ON v.content_item_id = ci.id AND v.viewer_account_id = $1
WHERE ci.kind = 'story'
  AND ci.state = 'published'
  AND s.expires_at > NOW()
  AND story_visible_to(ci.id, $1)
GROUP BY ci.author_account_id, sc.affinity
ORDER BY all_seen ASC, sc.affinity DESC, latest_item_at DESC
LIMIT 50;
```

The expiry sweep, in two jobs. The first stops serving and runs every minute; the second purges what's due and not held:

```sql
-- 1. Stop serving. Each flip writes an expirations row and a content.expired event
--    in the same transaction (outbox), which evicts caches and indexes.
WITH due AS (
  SELECT s.content_item_id
  FROM story_items s
  JOIN content_items ci ON ci.id = s.content_item_id
  WHERE ci.state = 'published' AND s.expires_at <= NOW()
  ORDER BY s.expires_at
  LIMIT 5000
  FOR UPDATE OF ci SKIP LOCKED
)
UPDATE content_items ci SET state = 'expired'
FROM due WHERE ci.id = due.content_item_id
RETURNING ci.id, ci.author_account_id;

-- 2. Purge what is due, skipping anything under a hold in force on the item,
--    its conversation or its author's account. Re-checked per item at execution.
SELECT e.id
FROM expirations e
WHERE e.state = 'expired'
  AND e.purge_due_at <= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM legal_holds h
    WHERE h.released_at IS NULL
      AND h.valid_during @> NOW()
      AND (   (h.subject_type = 'content_item' AND e.subject_type = 'story_item'
               AND h.subject_id = e.subject_id)
           OR (h.subject_type = 'channel' AND e.subject_type = 'message'
               AND h.subject_id = e.subject_id)
           OR (h.subject_type = 'account' AND h.subject_id = e.author_account_id)))
ORDER BY e.purge_due_at
LIMIT 1000
FOR UPDATE SKIP LOCKED;
```

Notes on the sketch:

- **Expired is a state, not a delete.** The item stops serving the moment `expires_at` passes; the row, the asset and the receipts stay until the purge job runs after the grace window. An item the poster archived moves to `kept_by_owner` instead of `purged` for its primary copy, and its served copies (CDN, search, receipts) still go.
- **Audiences are snapshots plus live revocations.** `audience_snapshots` and `audience_snapshot_accounts` are written in the same transaction as the item; the visibility function freezes list inclusions and applies blocks, hide-from additions and list removals live. A Highlight reads the original snapshot through `highlight_items`, so it can't widen an item.
- **Lists are private data.** `audience_lists` and their members are excluded from every API but the owner's own settings, and from other users' exports; the member's own export doesn't reveal which lists they're on ([Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)).
- **The conversation setting is a range.** `conversation_retention` holds one setting at a time per channel; each message records the one in force when sent. The chat expiry job computes `expires_at` from the clock: on send for `after_sent`, from the last recipient's `read_states` position for `after_viewed`, from `message_opens` for view-once media, and caps unopened messages at `unopened_max`. An open `message_saves` range sets `expires_at` to null; unsaving recomputes it.
- **Capture events record how they were known.** An OS callback, a capture-state change or an in-app save, by platform, so the notice shown to the poster and a later investigation both say exactly what the system observed, and nothing it didn't.
- **Purge is a ledger.** Each expiration fans out into `expiration_purge_steps`, one per kind of copy, pointing at the per-asset `media_purges` and the confirmed `cdn_purges` from [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#how-to-build-it) and at the key destruction for the blob. The expiration is `purged` only when every step is done, not present, or kept by a named rule. The backup step completes when the backup retention window passes or the key is destroyed.
- **Holds win, visibly to auditors and invisibly to users.** A report creates a `legal_holds` row with reason `report_evidence`; preservation requests, CyberTipline reports and litigation use the existing reasons. The purge query skips held subjects at item, conversation and account level and marks the expiration `held` with the hold's id; release puts it back in the queue ([Background Jobs](/docs/architecture/background-jobs)).
- **A Shared Story is a group.** Its items carry `community_id` from the core model, pointing at a community of kind `group` whose members may post; each author can save and delete only their own items.
- **Location is an audience with a timer.** No row means not sharing; `hidden_until` is a dated pause that ends on its own, and map submissions are separate story items with surface `map_submission` and their own public audience.
- **Events:** `story.published`, `content.expired`, `story.viewed` (batched), `capture.detected`, `conversation.retention_changed`, `message.expired`, `expiration.held`, `expiration.purged` and `location.sharing_changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the gateway, the CDN purge worker, search, ranking features, notifications and the risk score.

## Auditing

- **Every audience snapshot,** kept as long as the item or its evidence is kept, so "who could see this when it was posted" has an answer after the list has changed.
- **Every retention setting change** on a conversation, with who changed it and when; investigations of grooming and extortion turn on when a timer was switched on.
- **Every capture event** with its signal and platform, and every notice it produced.
- **Every expiration and its purge steps,** copy by copy, with the media and CDN purge references and the key destruction, as proof that an item described as deleted is deleted everywhere the platform controls ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)).
- **Every hold that stopped a purge,** with the report, case, request or matter behind it and its release; held items are the ones a regulator or court asks about.
- **Every report's captured evidence** and every access to it ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every product claim about disappearance,** versioned with the help text and in-app copy, beside the mechanics in force at the time; the FTC's order was about the gap between the two.
- **Teen defaults and location settings over time,** per account, because the state cases ask what the defaults were, not what they are now.

## What This Means for the System You Build

- **Separate expiry, deletion and purge,** each with its own state and clock, and say only what the mechanics deliver.
- **Fix the audience at post time:** lists freeze, revocations stay live, derived surfaces never widen.
- **Keep audience lists private** to their owner in every API and export.
- **Run every copy through the purge ledger:** variants, CDN, search, derived features, receipts and backups, with per-item keys destroyed at purge.
- **Keep a short grace window between expiry and purge** so a late report still has evidence, and capture evidence server-side at the moment of the report.
- **Let holds stop purges, never extend visibility,** and keep law enforcement holds invisible to the user.
- **Record conversation retention as ranges** and govern each message by the setting in force when it was sent; treat a save as a visible override.
- **Notify on screenshots where the OS signals, block where it allows,** and tell users a second camera defeats both.
- **Treat timer changes, view-once requests and stranger contact as risk signals** for teens, with contact-first defaults.
- **Review anything distributed beyond the poster's chosen audience** before it reaches people, however short its life.
- **Make location sharing off by default,** friends only, with dated pauses.
- **Push references, not media,** in notifications for ephemeral items.

## References

**Law and enforcement**

- [FTC: Snapchat settles FTC charges that promises of disappearing messages were false](https://www.ftc.gov/news-events/news/press-releases/2014/05/snapchat-settles-ftc-charges-promises-disappearing-messages-were-false), May 8, 2014: "disappear forever," third-party apps, unencrypted video storage, pre-iOS 7 screenshot evasion, location, address books, 4.6 million exposed records, the order's privacy program and 20-year monitoring
- [18 U.S.C. 2703: Required disclosure of customer communications or records](https://www.law.cornell.edu/uscode/text/18/2703), 90-day preservation under (f) and the 90-day extension
- [18 U.S.C. 2258A: Reporting requirements of providers](https://www.law.cornell.edu/uscode/text/18/2258A), one-year preservation after a CyberTipline report under (h)
- [GDPR Article 17: Right to erasure](https://gdpr-info.eu/art-17-gdpr/), erasure, the duty in 17(2) to inform other controllers of links, copies and replications, and the 17(3)(b) and (e) exceptions

**Litigation**

- [New Mexico Department of Justice: Attorney General Raúl Torrez files unredacted complaint against Snapchat (PDF, copy hosted by National Review)](https://nationalreview.com/wp-content/uploads/2024/10/press-release-attorney-general-raul-torrez-files-u.pdf), October 1, 2024: the September 4 filing and the state's allegations on sextortion reports, Quick Add, Snap Map, evidence preservation, ephemeral messages, Discover and Family Center
- [Bloomberg Law: Snap seeks dismissal of New Mexico child-exploitation lawsuit](https://news.bloomberglaw.com/litigation/snap-seeks-dismissal-of-new-mexico-child-exploitation-lawsuit), the court and Snap's motion (reported)
- [Snap: Snap files motion to dismiss New Mexico Attorney General's complaint](https://values.snap.com/news/new-mexico-motion-to-dismiss), the November 18, 2024 motion

**Platform documentation**

- [Snapchat Support: When does Snapchat delete Snaps and Chats?](https://help.snapchat.com/hc/en-us/articles/7012334940948-When-does-Snapchat-delete-Snaps-and-Chats), deletion after viewing, 31-day unopened ceiling, chat options, Community Group Chats, Topic Chats, Stories, public Story data, Shared Stories, Memories and screenshots
- [Snapchat Support: How do I save or delete Snapchat Chat messages?](https://help.snapchat.com/hc/en-us/articles/7012392635156-How-do-I-save-or-delete-Snapchat-Chat-messages), visible saves, deleting sent messages, screenshots before deletion
- [Snapchat Support: Can I request a copy of a Snap?](https://help.snapchat.com/hc/en-us/articles/7012328490644-Can-I-request-a-copy-of-a-Snap), opened or expired Snaps typically can't be retrieved
- [Snapchat Support: How do Private Stories on Snapchat work?](https://help.snapchat.com/hc/en-us/articles/7012308988820-How-do-Private-Stories-on-Snapchat-work), chosen viewers, hidden from others, screenshot and screen-record warning
- [Snapchat Support: How to save a Private or Shared Story](https://help.snapchat.com/hc/en-us/articles/7012356336020-How-to-Save-a-Private-or-Shared-Story-on-Snapchat), saving only your own Snaps and the screenshot icon in the poster's read receipts
- [Snapchat Support: How do I turn on Ghost Mode?](https://help.snapchat.com/hc/en-us/articles/7012322854932-How-do-I-turn-on-Ghost-Mode), timers and the caveats on location shared with Snap and map submissions
- [Snap: Privacy Policy](https://values.snap.com/privacy/privacy-policy), deletion by default within 24 hours, no promise of a specific deletion time, court notices, reports, Memories and backups
- [Snap: Safety enforcement and law enforcement](https://values.snap.com/safety/safety-enforcement), preservation under 2703(f) in an offline file for up to 90 days, extended once
- [Snap: Moderation, enforcement and appeals](https://values.snap.com/privacy/transparency/community-guidelines/moderation), reported content retained even if it would otherwise delete, proactive detection on Stories, AI review before Spotlight recommendation
- [Snap: Safety reporting](https://values.snap.com/safety/safety-reporting), a copy of reported media and preceding chat messages included in reports
- [Snap: Teens](https://values.snap.com/privacy/teens), teen defaults for contact, search, location, public profiles, engagement counts, unfamiliar-contact warnings and ads
- [Snap: Introducing Family Center](https://values.snap.com/news/introducing-family-center-on-snapchat), August 9, 2022, friends and contacts without conversation content
- [Snap: Looking out for friends on the Snap Map](https://values.snap.com/en-US/news/looking-out-for-friends-on-the-snap-map), February 18, 2022, location off by default and friends only
- [Snap: Fighting back against online sexual extortion](https://values.snap.com/news/fighting-back-against-online-sexual-extortion), the 2023 sextortion reporting option and its wording
- [Snap: Our response to the Heat Initiative/ParentsTogether Action report](https://values.snap.com/news/full-statement-heat-initiative-parent-together-coalition), about 220 sextortion enforcements a day in the first part of 2026
- [Snap Newsroom: Introducing Snap Map](https://newsroom.snap.com/introducing-snap-map?lang=en-US), June 21, 2017
- [Snap Newsroom: Introducing Spotlight](https://newsroom.snap.com/introducing-spotlight), November 23, 2020, moderated and without public comments
- [Snap Newsroom: New conversation settings offering more flexibility and control](https://newsroom.snap.com/infinite-retention-mode), March 14, 2024, conversations that retain indefinitely and in-chat notices
- [Snapchat for Business: Story Ads](https://forbusiness.snapchat.com/en-US/advertising/ad-formats/story-ads), Story Ads and the Stories and Spotlight ad placements
- [Instagram: Introducing Instagram Stories](https://about.instagram.com/blog/announcements/introducing-instagram-stories), August 2, 2016: 24 hours, no likes or public comments, replies by Direct, viewer list, hide story
- [Instagram: Introducing Stories Highlights and Stories Archive](https://about.instagram.com/blog/announcements/introducing-stories-highlights-and-stories-archive), December 5, 2017
- [Instagram: Curate Instagram Stories for Close Friends only](https://about.instagram.com/blog/announcements/curate-instagram-stories-for-close-friends-only), November 30, 2018, a private list nobody can request to join, green badge and ring
- [Instagram: Instagram ranking explained](https://about.instagram.com/blog/announcements/instagram-ranking-explained), May 31, 2023, Stories tray signals and predictions
- [Instagram: Introducing Teen Accounts](https://about.instagram.com/blog/announcements/instagram-teen-accounts), September 17, 2024, messaging limits and parental permission under 16
- [Meta: New sharing features on Instagram, Notes, group profiles and more](https://about.fb.com/news/2022/12/sharing-features-on-instagram-notes-group-profiles-and-more/), December 13, 2022, Notes and Candid Stories
- [Meta: New Instagram features to help you connect](https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/), August 6, 2025, the Instagram map, opt-in sharing, audiences and parent notices
- [Meta: Introducing Instants](https://about.fb.com/news/2026/05/instants-share-in-the-moment/), May 2026, view-once photos, 24-hour limit, screenshot blocking, unsend, one-year archive, teen protections
- [WhatsApp: Introducing disappearing messages](https://blog.whatsapp.com/introducing-disappearing-messages-on-whatsapp), November 5, 2020, seven days
- [WhatsApp: Default disappearing messages and multiple durations](https://blog.whatsapp.com/more-control-and-privacy-with-default-disappearing-messages-and-multiple-durations), December 6, 2021, 24 hours, 90 days and the default timer
- [WhatsApp: View Once photos and videos](https://blog.whatsapp.com/view-once-photos-and-videos-on-whatsapp), August 3, 2021
- [WhatsApp: New features for more privacy, more protection, more control](https://blog.whatsapp.com/new-features-for-more-privacy-more-protection-more-control), August 9, 2022, screenshot blocking for View Once in testing
- [TikTok Newsroom: Introducing TikTok Now](https://newsroom.tiktok.com/introducing-tiktok-now?lang=en), September 15, 2022, the daily prompt and teen defaults
- [TikTok Support: TikTok Stories](https://www.tiktok.com/support/faq_detail?id=7605444292726905364), 24 hours, profile, inbox, For You and Following, Highlights

**Operating systems**

- [Apple Developer: userDidTakeScreenshotNotification](https://developer.apple.com/documentation/uikit/uiapplication/userdidtakescreenshotnotification), posted after the screenshot is taken
- [Apple Developer: UIScreen.isCaptured](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured), recording, mirroring and AirPlay, and FairPlay video blacked out but audio included
- [Android Developers: Screenshot detection](https://developer.android.com/about/versions/14/features/screenshot-detection), Android 14's hardware-button-only detection, ADB exclusion and FLAG_SECURE

**Filings and figures**

- [Snap Inc.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1564408/000156440826000013/snap-20251231.htm), Snaps deleted by default, Stories, Discover, Spotlight, Snap Map, Memories, and the December 2014 FTC order's 20-year term and biennial audits
- [Snap Inc.: Second quarter 2026 results (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001564408/000156440826000047/snap-20260803xexx991pressr.htm), 493 million daily active users

**In practice**

- [Engadget: Snapchat introduces Stories](https://www.engadget.com/2013-10-03-snapchat-introduces-stories-picture-feeds-that-last-24-hours.html), October 3, 2013, the 24-hour Story and viewer list, quoting Snapchat's announcement (reported)
- [Tubefilter: WhatsApp launches Status](https://tubefilter.com/2017/02/21/whatsapp-facebook-snapchat-clone-status/), February 2017, 24-hour encrypted status updates (reported)
- [TechCrunch: YouTube Stories are shutting down June 26](https://techcrunch.com/2023/05/25/youtube-stories-are-shutting-down-june-26-as-company-focuses-on-shorts), the seven-day lifetime, YouTube's reasons, and LinkedIn dropping Stories in 2021 (reported)
- [Webwise: Explained, what is BeReal?](https://www.webwise.ie/trending/explained-what-is-bereal/), the daily notification, two-minute window, dual cameras, late label, post-to-see rule and no filters
