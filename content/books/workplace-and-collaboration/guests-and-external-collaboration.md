+++
title = "Guests & Cross-Org Collaboration"
nav_title = "Guests & External Access"
description = "Guest accounts, federation and shared channels in Slack, Teams, Google and Atlassian; trust between two admins, who owns shared content, external-access abuse."
category = "Workplace & Collaboration Industry"
order = 2009
part = "Tenancy and Identity"
tags = ["workplace", "guests", "external-access", "slack-connect", "b2b"]
+++

Work crosses company lines constantly: an agency and its client, a law firm and opposing counsel, a vendor and the customer it supports, two companies in a joint venture. A workplace product that only serves one organization's employees forces those conversations back into email. Every major vendor therefore sells a way to bring outsiders in, and they have converged on three models: give the outsider an account inside your tenant (a guest), let each side keep its own accounts and talk across the boundary (federation), or share one container that both organizations host at once (a shared channel).

Each model answers the inversion differently. Inside one organization, the customer's admin holds every decision: who joins, what is kept, what is exported, who is removed. When two organizations share a space, there are two admins, two identity providers, two retention policies and two legal departments, and the product has to decide whose rules apply to each message. This chapter covers the guest models, the shared-container model, how two admins establish trust, who owns content that both sides wrote, how guests are billed, and how attackers abuse the external door. The account machinery underneath is [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts); the permission rules that decide what a guest can see are [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing).

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Product | Guest inside your tenant | Federation (each side keeps its accounts) | Shared container | Billing of outsiders |
| --- | --- | --- | --- | --- |
| **Slack** | Single-channel guests (one channel) and multi-channel guests, on paid plans | Slack Connect DMs, on any plan | Slack Connect channels, up to 250 organizations, all on paid plans | Single-channel guests free, up to 5 per paid active member; multi-channel guests billed as members |
| **Microsoft Teams** | Guest access: a Microsoft Entra B2B collaboration guest account in your directory | External access: find, call and chat with people in other organizations, on by default | Shared channels through B2B direct connect, blocked by default until both tenants allow it | Entra External ID bills guest users by monthly active users |
| **Google Workspace** | Sharing Drive items with external Google accounts or, with visitor sharing, with people who have no Google account | Chat externally, on or off per organizational unit, optionally limited to allowlisted domains | External spaces and group DMs, one organization-wide switch, optionally allowlisted | Not covered here |
| **Atlassian** | External users: Atlassian accounts the organization doesn't manage, invited to apps | Not covered here | Not covered here | Not covered here |
| **Notion** | Guests added to individual pages, with plan-dependent limits | Not covered here | Not covered here | Paid plans charge per member; converting a guest to a member adds a charge |
| **Confluence** | Anonymous access when a space or the site is made public | Not covered here | Not covered here | Not covered here |

Three patterns:

- **Every vendor sells more than one door.** Microsoft has three (guest, external access, shared channels), Slack has three (guests, Connect DMs, Connect channels), Google has three (external Drive sharing, external chat, external spaces). Each door trades control for convenience: a guest is fully governed by the host but has to manage a second account; federation keeps each person on their own account but shares less.
- **Shared containers need two consents.** Slack Connect invitations are accepted by the other organization; B2B direct connect works only when both tenants enable it in their cross-tenant access settings. No vendor lets one organization unilaterally place content inside another's tenant.
- **Guests are priced to encourage the cheap door.** Slack's free single-channel guests and Entra's monthly-active-user billing make occasional outsiders cheap; full access costs a seat.

## Three Models for an Outsider

**A guest account in the host's tenant.** The outsider gets an identity in the host's directory and the host's rules. In Teams, invited people get a Microsoft Entra B2B collaboration guest account, sign in to Teams with it, can be given "nearly all the same Teams capabilities as a native team member," and have to switch organizations in Teams to work with the host. In Slack, a single-channel guest is limited to one channel and can't start group DMs or accept private channel invitations from members; a multi-channel guest can be added to an unlimited number of channels, is billed as a regular member, and can create private channels only if the owner enables it. Neither kind of Slack guest can create public channels, remove members, install apps, be added to or mention user groups, or use the AI-powered Slackbot. Owners can set guests to deactivate automatically on a date; the guest and the person who set the limit get a reminder five days before.

The guest model's strength is control (the host's retention, [DLP](/books/workplace-and-collaboration/dlp-and-information-protection#cross-organization-conversations), audit and offboarding apply in full); its weakness is that the guest's own employer has no say. When the guest leaves their company, the host's guest account lives on until someone at the host removes it, which is why expiry dates and periodic access reviews exist. Microsoft's access reviews can be scoped to guests and to external B2B direct connect users in shared channels.

**Federation.** Each person keeps their home account and the products talk across the boundary. Teams external access lets users "find, call, chat, and set up meetings with people outside your organization," is enabled by default, and controls separately whether users may talk to Teams accounts not managed by any organization. Compared with guests, external access users can chat, call, see presence and be added to group chats and meetings, but can't access the host's Teams resources or share files. Slack Connect DMs, available on any plan, are the Slack equivalent. Federation is the cheapest door and the one attackers like most (below), because by default anyone on any tenant can start a conversation.

**A shared container.** One channel lives in two or more organizations at once. A Slack Connect channel can include up to 250 organizations, every one on a paid plan, and members of each join themselves or are added by a colleague. A Teams shared channel uses B2B direct connect: the external person accesses the channel from their home tenant's Teams "without having to switch tenants or sign in with a different account," has access to that channel but not to the rest of the team, and has no presence in the host's directory, so the shared channel owner manages them in the Teams client. Google Chat's external spaces are the same idea under one organization-wide setting ("Allow users to create & join spaces & group direct messages with people outside their organization"), which requires external chat to be on and can be limited to allowlisted domains; turning it off stops new external spaces, but users can still join external conversations other organizations created, and existing spaces aren't deleted: invited external users keep access while the organization's own users lose it, and content already shared there, such as Drive files, stays reachable until the external members are removed. This is the model enterprises prefer for long-running relationships, and the one that raises the ownership questions below.

### Sharing files and pages with outsiders

Content products bring outsiders in item by item rather than by account. Google Drive's admin settings for external sharing are a three-way switch: off (no sharing outside, and previously shared external users lose access), on with options such as warning users before they share or blocking link sharing, or limited to allowlisted domains, in which case users can't share with personal accounts and the allowlist is all-or-nothing. Drive marks files owned by or shared with outsiders with an External indicator by default, can block moving content from the organization's shared drives to external shared drives or external users' My Drive, and can block items shared by external users from reaching the organization's users. Visitor sharing extends sharing to people with no Google Account, for anyone or only trusted domains. Setting changes can take up to 24 hours to take effect.

Box's collaboration allowlist is the strictest domain control in the survey, and it is sold separately: it comes with the Governance package and is enabled on request. Admins list the domains their users may collaborate with, and the limit runs both ways (members can't invite people from other domains, and people from other domains can't invite members). A `+` before a domain allows only inbound collaboration and a `-` only outbound; entries are literal, so `example.com` doesn't cover `eu.example.com`; named managed users can be exempted, up to a hard limit of 1,000, and Box treats 200,000 domains as a soft limit.

Notion adds guests to individual pages, with access flowing to subpages by default; an address on one of the organization's domains is added as a member instead. Enterprise owners can stop members from inviting guests to pages or from requesting that guests be added, leaving guest invitations to workspace owners; Plus and Business owners can turn off page access requests from non-members. Atlassian treats any account the organization doesn't manage as an external user: admins can invite external users to apps and remove their access, but "can't update or fully delete those accounts," and an unclaimed account on the company's own domain counts as external. Confluence can go further than guests, with anonymous access that makes a space or the whole site public to anyone on the internet.

## Trust Between Two Admins

The shared-container and federation models require each organization's admin to decide which other organizations to trust, and how much. Microsoft's cross-tenant access settings are the most detailed public model:

- **Inbound and outbound, separately.** Inbound settings control whether users from an external organization can access your resources; outbound settings control whether your users can access theirs. Both can target everyone or specific users, groups and applications.
- **Default deny for the deep integration.** Microsoft Entra ID blocks all inbound and outbound B2B direct connect by default; an organization adds a partner and allows it specifically, and the partner must do the same in reverse ("B2B direct connect is possible only when both organizations allow access to and from the other organization").
- **Trusting the other side's checks.** Trust settings decide whether your Conditional Access policies accept the partner's MFA, compliant-device and hybrid-joined claims. If your policy requires MFA and you don't trust the partner's MFA claim, their users are blocked from your shared channel unless they've done MFA in a way you accept. Tenant restrictions handle the reverse risk: your users signing in to someone else's tenant on your devices and network.
- **Organization-specific overrides.** A partner-specific configuration takes precedence over the defaults, so the common pattern is "block by default, allow named partners," down to a named group in the partner's directory.

Slack expresses trust through domains rather than tenant pairs. Claiming a domain on a paid plan means members can accept Slack Connect invitations only from claimed domains, so they can only connect with workspaces the organization manages; an organization can also mark itself as the primary organization for Slack Connect when verifying. Atlassian expresses it through an external user security policy applied to everyone the organization doesn't manage, with idle session duration settable from 15 minutes to 30 days. Box expresses it as the domain allowlist above, enforced in both directions.

My default for a builder: model trust as a row per pair of organizations with inbound and outbound settings, require acceptance by both admins before any shared container exists, deny by default for anything beyond messaging, and let each side's admin see and revoke the relationship at any time.

## Who Owns Shared Content

When two organizations write into one channel, each message has an author whose employer is a controller of that message under its own retention, legal hold and discovery duties. Slack's rules for Slack Connect are the clearest public statement of how a product divides that:

- **Each side's retention governs its own people's messages.** "Any content sent by external people will be retained or deleted based on their organization's retention settings." If external people are invited with permission only to post, only the host organization can set a custom retention policy for the channel.
- **Only the sender's organization can edit or delete.** Messages "can be edited or deleted only by the organization that sent them," which also limits the Discovery API: every organization can read content in its Slack Connect channels and DMs, but can edit or delete only its own members' messages.
- **Each side's keys encrypt its own messages.** Enterprise Key Management keys encrypt only the messages and files the organization's members send ([Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys#shared-spaces)).
- **Exports include the other side.** Paid-plan owners and admins can export public channels shared with other companies, including external members' messages with their display names; Business+ and Enterprise owners can apply to export private channels and DMs with external people. Another organization's retention settings affect what appears.
- **The creator controls the channel.** The organization that created a Slack Connect channel is the only one that can invite or remove other organizations, manage posting permissions and keep using the channel after others are removed or disconnected; only the organization that added an app can remove it.
- **Disconnecting is final.** When an organization disconnects from another, every channel they share is affected, including channels owned by a third party, and the step can't be undone. Organizations with full permissions keep an archived, read-only copy of each channel; post-only organizations keep no copy; DMs are archived for all participants with history intact; files shared by the other organization become inaccessible.

Microsoft's shared channels put the records on the host side. Teams audit events for shared channel lifecycle and membership are available in the tenant that hosts the shared channel, and "there are no audit logs in the external user's home tenant related to their activity in an external shared channel." Both tenants' sign-in logs record B2B direct connect sign-ins, and the resource tenant's logs include the Conditional Access policies applied.

The two designs differ in a way that matters for discovery and retention ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) and [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export) own the rules). Slack splits governance per message by author's organization; Teams keeps the content and the records in the host tenant. A guest's home employer under the Teams model can't preserve or search what its employee wrote in another tenant's channel; under the Slack model it can, for its own employee's messages. My default is the Slack-style split: tag every item with its author's organization at write time, apply each organization's retention and holds to its own authors' items, and give each organization discovery over everything in containers it participates in, with edit and delete limited to its own items.

## External Access as an Attack Surface

The external door is also how attackers reach employees without phishing email filters in the way. Microsoft Threat Intelligence described Storm-1811, a financially motivated group known for Black Basta ransomware, flooding targets' inboxes by signing them up for many subscription services and then contacting them as IT support; from the end of May 2024 the group used Teams to message and call targets from attacker-created tenants that impersonated help desk staff, persuading them to start a Quick Assist screen-sharing session that handed over control of the device. Microsoft's guidance includes educating Teams users "to verify 'External' tagging on communication attempts from external entities."

The product lessons, which belong in depth to [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents#external-messages-and-help-desk-impersonation):

- **Label every external principal everywhere.** Teams' External tag, Slack's External Connections sidebar section and banner, and Drive's External indicator all exist so a person can tell a colleague from a stranger at a glance.
- **Let admins allow only known partners.** Federation that is on by default to every tenant is convenient and is also the attack path; an allowlist of partner domains or tenants closes it.
- **Separate unmanaged accounts.** Teams lets admins decide whether users can talk to Teams accounts not managed by an organization at all, and whether those accounts can start conversations.
- **Treat a first contact from outside as a message request.** The consumer pattern of holding a stranger's first message for acceptance ([Direct Messages and the Stranger Problem](/books/user-generated-platforms/real-time-chat#direct-messages-and-the-stranger-problem)) applies to workplace federation too.

## How to Build It

The [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model)'s `members` has `kind` (full, guest, external, bot, service), and `containers` has `visibility`. This chapter adds guest limits, the trust relationship between organizations, the participants of a shared container, and the author's organization on every item.

```sql
ALTER TABLE members                        -- core already has invited_by
  ADD COLUMN guest_scope       TEXT CHECK (guest_scope IN ('single_container', 'multi_container')),
  ADD COLUMN guest_expires_at  TIMESTAMPTZ,              -- automatic deactivation date
  ADD COLUMN home_organization_id UUID REFERENCES organizations (id),  -- the guest's employer, if known
  ADD CONSTRAINT members_guest_scope CHECK ((kind = 'guest') = (guest_scope IS NOT NULL));

CREATE TABLE organization_trusts (        -- one row per direction per pair of organizations
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id       UUID NOT NULL REFERENCES organizations (id),   -- whose setting this is
  partner_organization_id UUID REFERENCES organizations (id),          -- null: the default row
  inbound               TEXT NOT NULL DEFAULT 'blocked' CHECK (inbound IN ('blocked', 'messaging',
                          'shared_containers')),
  outbound              TEXT NOT NULL DEFAULT 'blocked' CHECK (outbound IN ('blocked', 'messaging',
                          'shared_containers')),
  allowed_group_ids     UUID[],              -- limit to named groups on either side
  trust_partner_mfa     BOOLEAN NOT NULL DEFAULT FALSE,
  trust_partner_device  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by            UUID NOT NULL REFERENCES accounts (id),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, partner_organization_id)
);

CREATE TABLE container_organizations (    -- the organizations participating in a shared container
  container_id     UUID NOT NULL REFERENCES containers (id),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  role             TEXT NOT NULL CHECK (role IN ('host', 'participant')),
  permission       TEXT NOT NULL DEFAULT 'full' CHECK (permission IN ('full', 'post_only')),
  invited_by       UUID REFERENCES members (id),
  accepted_by      UUID REFERENCES accounts (id),     -- the partner admin's consent
  joined_at        TIMESTAMPTZ,
  disconnected_at  TIMESTAMPTZ,
  keeps_archive    BOOLEAN,                            -- set at disconnect from role and permission
  PRIMARY KEY (container_id, organization_id)
);

CREATE UNIQUE INDEX container_one_host
  ON container_organizations (container_id) WHERE role = 'host';

ALTER TABLE items
  ADD COLUMN author_organization_id UUID NOT NULL REFERENCES organizations (id);  -- set at write, never changed
```

Notes on the sketch:

- **Trust is directional and defaults to blocked.** The row with a null partner is the organization's default; partner rows override it. A shared container can be created only when the host's outbound and the participant's inbound (and the reverse) both allow `shared_containers`, checked at invite and again at accept.
- **One host per shared container.** The host's admins control who participates and keep the container after others leave, matching Slack's channel-owner rule; `post_only` participants keep no archive at disconnect.
- **The author's organization is written once.** Retention jobs, legal holds and discovery exports select items by `author_organization_id`, so each organization's policy applies to its own people's words; edit and delete checks require the actor's organization to match.
- **Guests expire.** A daily job deactivates guests past `guest_expires_at`, after a reminder five days before, and access reviews list guests by inviter and last activity.
- **Events:** `organization_trust.changed`, `container.organization_invited`, `container.organization_joined`, `container.organization_disconnected`, `member.guest_invited` and `member.guest_expired` go to both organizations' audit logs where both are affected, and to notifications for the admins on each side.

## Auditing

- **Trust changes on both sides:** who allowed or blocked which partner, for which groups, with which MFA and device trust.
- **Shared container membership:** organizations invited, accepted, removed and disconnected, with the consenting admin; and in both organizations' logs, not only the host's.
- **Guest life cycle:** invitations with the inviter, expiry dates, extensions, deactivations and reviews.
- **External content movement:** external shares created, link sharing to outsiders, and moves of organization content to external drives.
- **First contacts from outside:** external chats and calls started, especially from unmanaged accounts or tenants without a trust row, as inputs to threat detection.

## What This Means for the System You Build

- **Offer guests, federation and shared containers,** and be clear which rules apply in each.
- **Expire guests** and support access reviews scoped to outsiders.
- **Model trust per organization pair,** directional, default deny for shared containers, accepted by both admins, revocable by either.
- **Record each item's author organization at write time** and apply retention, holds, keys and edit rights per author organization.
- **Give each participant organization discovery and audit records** for the shared containers its people use.
- **Make disconnecting explicit** about what each side keeps.
- **Label external principals everywhere,** let admins allowlist partners, and hold first contact from strangers.

## References

**Vendor documentation**

- [Slack: Multi-channel and single-channel guests](https://slack.com/help/articles/202518103-Multi-Channel-and-Single-Channel-Guests), guest abilities and limits, free single-channel guests up to 5 per paid member, multi-channel billing, time limits and five-day reminders
- [Slack: Slack Connect guide](https://slack.com/help/articles/115004151203-Slack-Connect-guide--work-with-external-organizations), 250 organizations per channel, paid plans, channel owner controls, DMs on any plan, External Connections section and banner
- [Slack: How data management features apply to Slack Connect](https://slack.com/help/articles/115004152843-How-data-management-features-apply-to-Slack-Connect), per-organization retention, edit and delete by the sending organization, EKM, exports, the Discovery API
- [Slack: Slack Connect, disconnect from an organization](https://slack.com/help/articles/360063030933-Slack-Connect--Disconnect-from-an-organization), archived copies by permission, DMs, files, scope and irreversibility
- [Slack: Claim and verify email domains](https://slack.com/help/articles/5513043606547-Claim-and-verify-email-domains), Slack Connect limited to claimed domains, primary organization for Slack Connect
- [Microsoft Teams: Use guest access and external access](https://learn.microsoft.com/en-us/microsoftteams/communicate-with-users-from-other-organizations), external access on by default, guests as B2B collaboration users, unmanaged Teams accounts, the comparison tables
- [Microsoft Entra: B2B direct connect overview](https://learn.microsoft.com/en-us/entra/external-id/b2b-direct-connect-overview), mutual trust, default block, inbound and outbound settings, trust settings, Teams shared channels, audit logs only in the resource tenant, access reviews
- [Microsoft Entra: External ID pricing](https://learn.microsoft.com/en-us/entra/external-id/external-identities-pricing), monthly active user billing for guest users, members across owned tenants not counted
- [Google Workspace: Manage external sharing for your organization](https://knowledge.workspace.google.com/admin/drive/manage-external-sharing-for-your-organization), off, on and allowlisted domains, External indicator, visitor sharing, blocking moves and inbound shares, 24 hours to apply
- [Google Workspace: Control external Chat & spaces chat options](https://knowledge.workspace.google.com/admin/chat/control-external-chat-and-spaces-chat-options), external chat per unit with an allowlist, the organization-wide external spaces setting, what happens to existing spaces when it's turned off
- [Box: Limit collaboration to allowlisted domains](https://support.box.com/hc/en-us/articles/4946326084755-Limit-collaboration-to-allowlisted-domains), Governance package by request, both directions, `+` and `-` prefixes, literal entries, exempt users and the 1,000 and 200,000 limits
- [Notion: Add members, admins, guests and groups](https://www.notion.com/help/add-members-admins-guests-and-groups), page-level guests, domain addresses added as members, Enterprise and Plus or Business guest controls
- [Atlassian: Who are external users?](https://support.atlassian.com/security-and-access-policies/docs/who-are-external-users/), accounts the organization doesn't manage, what admins can and can't do
- [Atlassian: Set idle session duration for external users](https://support.atlassian.com/security-and-access-policies/docs/set-idle-session-duration-for-external-users), the 15-minute to 30-day range for external user security policies
- [Atlassian: Manage permissions on the page level](https://support.atlassian.com/confluence-cloud/docs/manage-permissions-on-the-page-level/), anonymous access to spaces or the whole site

**Threat reporting**

- [Microsoft Threat Intelligence: Threat actors misusing Quick Assist in social engineering attacks leading to ransomware](https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/), Storm-1811, email bombing, Teams messages and calls from attacker tenants from the end of May 2024, the External tag guidance
