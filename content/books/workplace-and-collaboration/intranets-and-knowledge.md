+++
title = "Intranets & Knowledge Bases"
description = "Intranets and knowledge bases: SharePoint home sites, Google Sites, Confluence, Guru, Staffbase, Simpplr; targeting, translation and verification."
category = "Workplace & Collaboration Industry"
order = 2026
part = "Docs, Wikis and Files"
tags = ["workplace", "intranet", "knowledge-management", "internal-communications", "search"]
+++

An intranet is the company's front page: the benefits link, the holiday calendar, the CEO's quarterly note, the expense policy, the IT status banner, the "how do I" answers that a thousand people need once a year. A knowledge base is the same idea aimed at answers rather than announcements: short, verified pieces of truth that support, sales and HR can quote without checking. Both sit on top of the docs and wikis of [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis), and both fail the same way: content goes stale, nobody owns it, search returns three contradictory pages, and employees stop trusting it and ask in chat instead.

What makes the category distinct is that the audience is everyone and the authors are few. A wiki is written by the people who use it; an intranet is published by communications, HR and IT to the whole company, often in many languages, to frontline workers on phones as well as desk workers in Teams, with targeting by role and region and analytics on who read what. That last part is where the customer's decisions matter most: the employer decides what to measure about its own employees' reading, under the privacy rules of [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy).

This chapter covers the platforms, the publishing model (sites, news, announcements, dashboards), targeting, translation, verification and expiry, findability, and what to build. Generic search ranking and permission-trimmed indexes are [Enterprise Search](/books/workplace-and-collaboration/enterprise-search); AI assistants answering from intranet content are [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants).

## How the Platforms Do It

As of October 2026:

| Platform | Shape | Publishing model | Targeting | Freshness |
| --- | --- | --- | --- | --- |
| **SharePoint and the SharePoint app in Teams** (formerly Viva Connections) | Communication sites, hub sites, one or more home sites; app inside Teams | News posts, boosted news, announcements, dashboard cards, resources | Microsoft Entra and Microsoft 365 groups; filtering, not security | Not covered in the sources cited here |
| **Google Sites** | Google Workspace site builder | Published sites, shared and published under the Drive sharing settings | Site sharing only; no audience targeting documented | No freshness or verification feature documented |
| **Confluence as intranet** | Spaces and page trees | Pages with a publish step | Space and page permissions | Owners, archiving, inactivity filters |
| **Guru** | Cards in collections, plus connected sources | Cards surfaced in other tools | Collections and groups | Verifier per card, intervals from 30 days to 1 year, AI auto-unverify |
| **Staffbase** | Employee app, intranet and email | Communications for comms, HR and IT | By role, location and context | Not covered in the sources cited here |
| **Simpplr** | AI intranet and employee experience platform | Intranet content and search | Not covered in the sources cited here | Governance of trusted content |

The suites build intranets out of their file and site platforms; the specialists (Staffbase, Simpplr and similar) sell to internal communications teams who want an employee app, newsletters and measurement on top of, or instead of, those sites; knowledge tools (Guru) sell verification and answer delivery inside the tools people already use. Microsoft's own trajectory shows where the suite is heading: Viva Topics, the AI-built knowledge layer, was retired on February 22, 2025, with Microsoft pointing customers to publish knowledge as SharePoint pages that Copilot and Microsoft Search use instead, and Viva Connections is now documented as "the SharePoint app in Teams."

## The Suite Intranet: SharePoint

SharePoint's intranet model has four layers, and each has published limits:

- **Sites.** Microsoft recommends organizing sites into **hubs** rather than nesting subsites (2,000 subsites per site collection is the cap, and an organization can have 2,000 hub sites). Site, hub, global and footer navigation are all limited to 500 child links per level.
- **A home site.** The landing experience and the gateway to other portals. The SharePoint app in Teams is built on home site technology and has four components: **News** (posts from organization news sites, boosted news, followed and frequent sites and colleagues), the **dashboard** (adaptive cards for tasks like clocking in or checking a paystub), **resources** (curated links) and **announcements** (short messages at the top of the home site, available only on home sites).
- **Multiple experiences.** An organization can set multiple home sites for different audiences (frontline workers, regions, subsidiaries). With a standard Microsoft 365 E, F or A license, users get one SharePoint app in Teams experience; two or more (up to 50) require every user in the tenant to hold a Viva Suite or Viva Communications and Communities license. That's the suite's upsell line drawn through the intranet.
- **News ranking.** The news reader is "a system driven news feed"; the admin's lever is that posts on the home site, on organization news sites and boosted news "are prioritized and show at the top." Boosted news from a newly designated organization news site can take up to 24 hours to appear.

The SharePoint app in Teams is available in most Microsoft 365 languages; dashboard authors can set content in several languages, news shows author-translated posts in the user's preferred language, and resources follow the site's default language. Extensibility is SharePoint Framework only.

The inversion is plain: Microsoft provides the slots, but the customer's communications team decides what's boosted, what's announced, who sees which dashboard card, and whether a second experience is worth licensing everyone.

## Google Sites and Confluence

**Google Sites** is the Google Workspace site builder. Its published limits as of October 2026: 15,000,000 characters per page, 40,000,000 characters per site, 10,000 pages per site and 15,000 images per site. I found no news ranking or audience targeting model documented for it, which is why it tends to serve departmental portals rather than a corporate front page. Its admin model is borrowed from Drive. An admin with the Sites administrator privilege can switch the service off for everyone (then "no one in your organization can create, view, or access Google Sites"), and two settings, "Users can edit sites" and "Allow users to create new sites," both on by default, can be turned off for organizational units that shouldn't build sites. Who can see a published site is not a Sites setting at all: "you define how people can share and publish sites in your organization in the Drive settings," so the external-sharing policy that governs files governs the intranet too, and Sites needs Drive turned on for every user who builds one.

**Confluence** works as an intranet when a company standardizes on it: a top-level space for company-wide content, department spaces beneath, and the page-tree restrictions of [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#containers-trees-and-restrictions). Its strengths are the ones a knowledge base needs: published pages with a review step, owners separate from creators, and archiving that removes stale pages from trees, search and feeds without breaking links, with Premium and Enterprise admins able to filter pages with no views, comments or updates over a period and reassign pages without active owners. Its weakness as an intranet is the same as any wiki's: it has no native model for audience-targeted news or a mobile employee app.

## Specialist Platforms

**Staffbase** calls itself an AI-native employee experience platform "that connects Comms, HR, and IT," with an intranet ("the digital front door for your company"), an employee app for frontline workers and internal newsletters, with communications "dynamically tailored by role, location, and context." **Simpplr** calls itself an AI intranet and employee experience platform built around governed, trusted content, AI search and answers, and analytics. I haven't found public engineering detail for either; they're in the survey as representatives of the category internal communications teams buy, not as models for any rule below.

The category's selling points tell you where the suites are thin: a mobile app that works for people without a corporate laptop or a Microsoft 365 account ([Frontline & Deskless Workers](/books/workplace-and-collaboration/frontline-workers)), email newsletters with read measurement, and multi-channel campaigns where one announcement goes to the intranet, the app, chat and email at once.

## Announcements and News

Corporate communication has a different lifecycle from a wiki page. An announcement has a **publish time**, an **audience**, a **channel set** (intranet, app, chat, email), sometimes a **required acknowledgment**, and an **end** after which it shouldn't appear on the front page even though it stays in the archive. SharePoint's split between news posts (in the feed, ranked) and announcements (short, top of the home site) is one version of this; most specialist platforms add acknowledgment tracking and campaign scheduling.

My rules for announcements:

- **Every announcement has an expiry from the front page.** "Office closed Friday" must not be the top item on Monday.
- **Acknowledgment is a record**, not a click metric: who acknowledged which version of which policy, when. That's the same evidence model as [Click-Through Terms Are Signatures Too](/docs/compliance/electronic-signatures#click-through-terms-are-signatures-too), and a policy acknowledgment may be produced in an employment dispute.
- **Urgent channels are rationed.** A banner, a push notification and a chat broadcast at once is for outages and emergencies, with a named small group allowed to send them. Notification fatigue is [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention).
- **Read analytics are aggregate by default.** Per-person read tracking of every news post is employee monitoring; offer counts and percentages by audience, and per-person tracking only for required acknowledgments.

## Targeting Is Not Permission

Every intranet targets content: this dashboard card for finance, these resource links for the UK, this news post for the project team. Microsoft states the rule that every vendor should: audience targeting "filters content and isn't a security measure. It isn't meant to manage permissions, access, or secure confidential content." Targeting in SharePoint uses Microsoft Entra groups (security groups, Microsoft 365 groups and dynamic groups); authors see everything in edit mode and readers see the filtered view; changes take effect when the page is republished; and a resource link can target up to 10 audiences. News in the reader is filtered by the user's audience memberships.

The design consequence is two independent checks on every intranet item: **can this person see it** (grants, which a direct link or search must respect) and **should it be shown to them here** (targeting, which only decides placement). Mixing them produces the classic leak: an "HR-only" salary-band page that's merely targeted, found by everyone through search. My rule: anything confidential is permissioned, and targeting is applied on top of permission, never as a substitute.

Targeting depends on directory data being right: department, location, employment type and manager, synced from the HRIS through the directory ([Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#joiner-mover-leaver) covers SCIM and HR-driven sync). A dynamic group built on a stale attribute targets the wrong people silently, so audience previews ("show me this page as a member of Sales, on mobile") are a core authoring feature; SharePoint's dashboard preview by audience and device is the reference.

## Translation

Intranets serve multilingual workforces, and the published models are mostly manual. SharePoint's multilingual sites and pages work this way:

- Each page in the site's default language can have a **translation copy** per enabled language, created by the author for all or chosen languages.
- "Pages are not translated automatically." Assigned **translators** edit and publish the copies.
- Edits to the source don't flow to translations. Saving a draft of the source page emails its translators that an update "may be required," once the source is republished.
- A site's default language is set at creation and "can't be changed later." Untranslated pages, navigation and the site name fall back to the default language.

Machine translation now sits on top of this in many products, and it changes the record question: a machine-translated policy is not the policy. My rules: the source-language page is authoritative and says so on every translation; a translation records the source version it was made from and shows "out of date" when the source has moved on; machine-translated copies are labeled as such until a human translator approves them; and legally binding content (policies, handbooks, works council agreements) isn't published in a language until a human-approved translation exists. Locale handling and right-to-left layouts are [Internationalization](/docs/frontend/internationalization#right-to-left-layouts).

## Verification and Expiry

Knowledge bases are built around one promise: the answer you found is still true. The mechanism, in every product that offers it, is a named person responsible for the content and a date after which it stops being trusted.

**Guru** is the clearest public example. Each card has one **verifier**, a person or a group, accountable for keeping it current. Verification intervals are "Does not expire," 30 days, 60 days, 90 days, 6 months and 1 year, with "Does not expire" the default for cards in collections created after January 2026. Cards show as verified or unverified; setting an interval sends the verifier periodic reminders; anyone can unverify a card to request a review. Guru's AI Knowledge Agents can **auto-unverify** content: off by default, enabled per agent, reviewing eligible content daily, applying unverification rules before verification rules, waiting 7 days before re-reviewing an item, flagging rather than deleting, and recording each decision in a quality log that can be overridden but not reverted.

**Notion** verified pages work the same way inside wikis and databases: verification until a date or indefinitely, a required owner, and notifications to the owner on expiry ([Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#staleness-and-ownership)). **Confluence** gets there with owners, inactivity filters and archiving rather than expiring verification.

The design points that make verification work:

- **Verifier and owner can differ.** The author owns the page; the subject-matter expert or a group verifies it. Group verifiers survive people leaving.
- **Expiry demotes, it doesn't delete.** An expired page drops in search ranking and shows a "not recently verified" badge; it stays readable and linked.
- **Expiry has a default by content type**, set by the knowledge admin: a pricing card might expire in 30 days, a company history page never.
- **AI may flag, humans verify.** Automated unverification (an AI noticing a contradiction with a newer source) is useful; automated verification of company policy is not something I'd turn on. Guru's choices (off by default, logged, overridable) are the right shape.
- **Offboarding moves verification.** When a verifier is deactivated, their cards go to their group or manager and show as needing review, in the same transaction.

## Findability

Intranets live or die in search. Three mechanisms beyond ranking recur:

- **Curated answers.** Microsoft Search **bookmarks** let search admins and editors map keywords to a titled link (published, drafted or scheduled), import SharePoint promoted results, and reserve a keyword for exactly one answer; a tenant can have 5,000 bookmarks, and a published bookmark is searchable immediately. Microsoft retired Microsoft Search in Bing on March 31, 2025, along with recommended bookmarks, so these answers now surface in Microsoft 365, SharePoint and Teams search, where Teams may suppress a bookmark that doesn't meet its machine-learning ranker threshold.
- **Verified content ranks higher.** Notion shows a verified check in search results; Guru's verified state is the product's core signal.
- **One canonical page per question.** Duplicates are the biggest findability problem in any intranet, and the fix is editorial: archive the old page, redirect its links, and give the canonical page the keywords people actually type (Microsoft suggests at least five keyword variants per bookmark).

Permission trimming is non-negotiable in every one of these: a bookmark or promoted result pointing to a restricted page must not reveal its title to people who can't open it. The machinery is [Enterprise Search](/books/workplace-and-collaboration/enterprise-search#permission-trimming)'s.

## How to Build It

The chapter adds announcements, audience targeting, translations and verification on top of `pages` from [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#how-to-build-it) and the [core](/books/workplace-and-collaboration/workplace-business#the-core-data-model) `groups`, `members` and `grants`.

```sql
-- containers.kind gains 'portal' (an intranet site; a workspace may have several).

CREATE TABLE audience_targets (            -- placement only; never consulted for access
  item_id          UUID NOT NULL REFERENCES items (id),   -- page, news post, card, link
  group_id         UUID NOT NULL REFERENCES groups (id),
  PRIMARY KEY (item_id, group_id)
);

CREATE TABLE announcements (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  portal_id        UUID REFERENCES containers (id),
  page_item_id     UUID REFERENCES pages (item_id),       -- the full text, if any
  headline         TEXT NOT NULL,
  urgency          TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'important', 'urgent')),
  channels         TEXT[] NOT NULL DEFAULT '{portal}',    -- portal, app, chat, email, push
  requires_ack     BOOLEAN NOT NULL DEFAULT FALSE,
  publish_at       TIMESTAMPTZ NOT NULL,
  front_page_until TIMESTAMPTZ NOT NULL,                  -- every announcement ends
  created_by       UUID NOT NULL REFERENCES members (id),
  approved_by      UUID REFERENCES members (id),          -- required when urgency = 'urgent'
  CHECK (front_page_until > publish_at),
  CHECK (urgency <> 'urgent' OR approved_by IS NOT NULL)
);

CREATE TABLE announcement_acks (           -- evidence, append-only
  announcement_id  UUID NOT NULL REFERENCES announcements (id),
  member_id        UUID NOT NULL REFERENCES members (id),
  page_version_id  UUID REFERENCES item_versions (id),    -- what exactly was acknowledged
  acked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel          TEXT NOT NULL,
  PRIMARY KEY (announcement_id, member_id)
);

CREATE TABLE page_translations (
  source_item_id   UUID NOT NULL REFERENCES pages (item_id),
  locale           TEXT NOT NULL,                         -- BCP 47
  translation_item_id UUID NOT NULL REFERENCES pages (item_id),
  source_version_id UUID NOT NULL REFERENCES item_versions (id),  -- translated from this
  method           TEXT NOT NULL CHECK (method IN ('human', 'machine', 'machine_reviewed')),
  translator_member_id UUID REFERENCES members (id),
  approved_at      TIMESTAMPTZ,
  PRIMARY KEY (source_item_id, locale)
);

CREATE TABLE content_verifications (       -- one current row per item; history in audit_events
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  verifier_kind    TEXT NOT NULL CHECK (verifier_kind IN ('member', 'group')),
  verifier_member_id UUID REFERENCES members (id),
  verifier_group_id UUID REFERENCES groups (id),
  interval_days    INT,                                   -- null = does not expire
  verified_at      TIMESTAMPTZ,
  verified_by      UUID REFERENCES members (id),
  expires_at       TIMESTAMPTZ,
  state            TEXT NOT NULL CHECK (state IN ('verified', 'unverified', 'expired')),
  unverified_by    TEXT CHECK (unverified_by IN ('member', 'expiry', 'ai_agent', 'offboarding')),
  CHECK ((verifier_kind = 'member') = (verifier_member_id IS NOT NULL)),
  CHECK ((verifier_kind = 'group') = (verifier_group_id IS NOT NULL))
);

CREATE TABLE search_answers (              -- curated keyword answers (bookmarks)
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  title            TEXT NOT NULL,
  target_item_id   UUID REFERENCES items (id),
  target_url       TEXT,
  keywords         TEXT[] NOT NULL,
  reserved_keyword TEXT,                                  -- unique per workspace when set
  state            TEXT NOT NULL CHECK (state IN ('draft', 'scheduled', 'published', 'suggested')),
  publish_at       TIMESTAMPTZ,
  UNIQUE (workspace_id, reserved_keyword)
);
```

Rendering an item for a reader applies, in order: the permission check (grants, then page-tree restrictions), then targeting (show if the item has no targets or the reader is in any target group), then locale (the reader's translation if approved and current, else the source with a banner), then freshness (badge and ranking demotion if `content_verifications.state` isn't `verified`). A nightly job moves expired verifications to `expired` and notifies verifiers; deactivating a member reassigns their `verifier_member_id` rows in the offboarding transaction.

## Auditing

The intranet's audit trail (core `audit_events`) needs:

- **Publishing**: publish, schedule, boost, unboost, front-page expiry, urgent sends with approver, channel fan-out results.
- **Targeting**: audience added or removed per item, so "why did the whole company see this" has an answer.
- **Acknowledgments**: kept as their own append-only table above, exported per announcement for HR.
- **Translations**: created, approved, marked out of date, method changes.
- **Verification**: verified, unverified (by whom or what), expired, reassigned at offboarding, AI agent decisions with the rule that fired.
- **Search answers**: created, published, retired, reserved keywords assigned.

Read analytics live outside the audit store, aggregated by default, with per-person reads only for acknowledgment-required content, as the customer's privacy policy and works council agreements allow.

## What This Means for the System You Build

- Separate the publishing model (news, announcements, dashboards) from the wiki model; an intranet needs schedules, audiences, channels and expiry.
- Keep targeting and permission as two independent checks, and say in the product that targeting isn't security.
- Give authors audience and device previews, because targeting depends on directory data that's often wrong.
- Make the source language authoritative, record which source version each translation came from, and label machine translations.
- Attach a verifier and an interval to knowledge content; expire into a demoted, badged state, never into deletion.
- Let AI flag stale content, keep its decisions logged and overridable, and keep verification a human act.
- Curate search answers for the questions everyone asks, and trim them by permission.
- Treat acknowledgments as evidence and reading analytics as employee data.

## References

**Vendor documentation**

- [Microsoft Learn: Overview of the SharePoint app in Teams](https://learn.microsoft.com/en-us/sharepoint/homesites/sharepoint-app-in-teams-overview), formerly Viva Connections, home site basis, news, dashboard, resources and announcements, localization, SPFx, multiple experiences up to 50 and their licensing
- [Microsoft Learn: The news reader in Viva Connections](https://learn.microsoft.com/en-us/sharepoint/homesites/news-reader), system-driven feed, prioritized home site, organization news and boosted news, audience filtering, 24-hour delay for new organization news sites
- [Microsoft Learn: Target content to specific audiences in the SharePoint app in Teams](https://learn.microsoft.com/en-us/sharepoint/homesites/use-audience-targeting-sharepoint-app-in-teams), targeting is not security, supported Entra groups, republish to apply, previews, 10 audiences per resource link
- [Microsoft Support: Create multilingual communication sites, pages and news](https://support.microsoft.com/en-us/office/create-multilingual-communication-sites-pages-and-news-2bb7d610-5453-41c6-a0e8-6f40b3ed750c), translation copies, manual translation, translator notifications, fixed default language, fallbacks
- [Microsoft Learn: SharePoint limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits), subsites, 2,000 hub sites, 500 navigation links per level
- [Microsoft Learn: Changes coming to Topics](https://learn.microsoft.com/en-us/microsoft-365/topics/changes-coming-to-topics), Viva Topics retired February 22, 2025, and what happened to topic pages
- [Microsoft Learn: Manage bookmarks](https://learn.microsoft.com/en-us/microsoftsearch/manage-bookmarks), bookmark states, reserved keywords, 5,000-bookmark limit, keyword guidance, Microsoft Search in Bing retired March 31, 2025, Teams ranking threshold
- [Google Workspace Admin Help: Turn Sites on or off for users](https://knowledge.workspace.google.com/admin/users/access/turn-sites-on-or-off-for-users), service on or off, the create and edit settings and their defaults, the Sites administrator privilege, Drive required
- [Google Workspace Admin Help: Support your Google Sites users](https://knowledge.workspace.google.com/admin/sites/support-your-google-sites-users?hl=en), sharing and publishing defined in the Drive settings
- [Google: Files you can store in Google Drive](https://support.google.com/drive/answer/37603?hl=en), Google Sites limits per page and per site
- [Atlassian: Introducing page and bulk archiving in Confluence Cloud (2020)](https://www.atlassian.com/blog/confluence/introducing-page-and-bulk-archiving-in-confluence-cloud), archiving behavior, inactivity filters, pages without active owners, plan availability
- [Guru: Verifying and unverifying cards](https://help.getguru.com/docs/verifying-and-unverifying-cards), verifiers, intervals, default for new collections, auto-unverify rules, 7-day re-review, quality log
- [Notion: Wikis and verified pages](https://www.notion.com/help/wikis-and-verified-pages), verification and expiry notifications

**Vendor positioning**

- [Staffbase](https://staffbase.com/), employee experience platform connecting comms, HR and IT; intranet, employee app and newsletters; targeting by role, location and context
- [Simpplr](https://www.simpplr.com/), AI intranet and employee experience platform; governed content, AI search, analytics
