+++
title = "SSO, Domains & Managed Accounts"
nav_title = "SSO & Managed Accounts"
description = "Domain verification, claiming personal accounts into managed ones, enforcing SAML and OIDC, MFA and session policy, break-glass admins, and the SSO tax."
category = "Workplace & Collaboration Industry"
order = 2007
part = "Tenancy and Identity"
tags = ["workplace", "sso", "saml", "identity", "mfa", "sessions"]
+++

In a consumer product the person owns their account. In a workplace product the employer wants to, and usually the account already exists. An engineer signed up for the design tool with a work address two years ago, a salesperson made a personal Google account on the company domain to use a calendar app, a contractor's account on the issue tracker uses a company mailbox. When the company buys the enterprise plan, it expects every one of those accounts to start signing in through its identity provider, obey its MFA and session rules, and disappear when the person leaves. The vendor has to move the account from the person's control to the organization's without destroying the person's other uses of it, and without letting an organization grab accounts that were never its own.

The mechanism is the same everywhere: prove you own the email domain, claim the accounts on it, then enforce sign-in policy on the claimed accounts. The details differ in ways that matter: what proof is accepted, whether claiming is automatic, what happens to a personal account that collides with a managed one, which plan the enforcement costs, and who can still sign in when the identity provider is down. This chapter covers those details. The protocols themselves (OIDC as the default, SAML for enterprise customers, per-customer connections) are the playbook's [SSO and Federation](/docs/security/sso-and-federation); provisioning and deprovisioning accounts from a directory is the next chapter, [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim).

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Domain proof | Managed accounts | SSO enforcement and its plan | Session controls |
| --- | --- | --- | --- | --- |
| **Slack** | DNS TXT record, with `_slack-challenge` for wildcard domains | Claimed domains restrict Slack Connect invitations and, on Enterprise, external workspace joins | SAML on Business+ and Enterprise (and Free and Pro with a connected Salesforce org); required, required except guests, or optional | Separate desktop and mobile session duration on all plans |
| **Atlassian** | HTTPS file, DNS TXT, or automatic via a connected Google Workspace or Microsoft Entra ID | Verified domain, then claim all accounts or a CSV list | Enforcing SSO and two-step verification needs Atlassian Guard Standard and a verified domain | Idle session duration in authentication policies, 30 days by default |
| **Google Workspace** | Domain verification at sign-up | Unmanaged personal accounts on the domain are transferred in or renamed | Third-party SSO profiles assigned by OU or group; super admins aren't redirected under the newer profiles | Web session length, 14 days by default, on higher editions |
| **Microsoft Entra ID** | DNS records on the tenant's custom domains | Every user is created or synced into the tenant | Federation or cloud sign-in; Conditional Access (P1) or free security defaults for MFA | Sign-in frequency, a rolling 90 days by default |
| **Notion** | DNS verification code, valid for a week | Enterprise organizations claim workspaces on the domain | SAML on Business and Enterprise; "Only SAML SSO" or any method | Not covered here |
| **Figma** | DNS TXT record | Domain capture adds company-email accounts as members, on Organization and Enterprise plans | Not covered here | Not covered here |
| **Zoom** | Associated domains | Users on the domain are invited to consolidate; they can't be forced | Not covered here | Not covered here |

Three patterns:

- **DNS TXT is the universal proof.** Every vendor accepts a TXT record; some add an HTTP file or trust an identity provider that has already verified the domain. None accepts an email to the domain's admin address as sufficient on its own for claiming.
- **Claiming is separate from verifying.** Verification proves the domain; claiming moves accounts. Atlassian keeps the two steps distinct, Notion waits 14 days between them, and Zoom never forces the second step.
- **Enforcement costs money.** SAML enforcement, MFA enforcement and multiple policies sit on Business+, Business, Guard or Organization tiers. The exception is Microsoft's security defaults, which give every tenant baseline MFA at no extra cost.

## Proving the Domain

Domain verification is the root of trust for everything in this part: claiming accounts, capturing sign-ups, blocking other workspaces, restricting where members may collaborate. The methods:

- **DNS TXT.** The vendor issues a token; the customer publishes it at the domain apex or a well-known label; the vendor resolves it. Slack uses `@` for a standard domain and `_slack-challenge` for a wildcard domain and allows up to 72 hours for DNS to propagate; Atlassian also allows up to 72 hours; Figma and Notion use TXT records too. Notion's codes expire after one week.
- **HTTPS file.** Atlassian accepts a downloaded `atlassian-domain-verification.html` file at the domain root, served over HTTPS with a valid certificate ("self-signed certificates won't work").
- **Trust the identity provider.** Atlassian verifies the domains associated with a connected Google Workspace or Microsoft Entra ID automatically, because those providers have already done the proof.

Three rules follow from how vendors handle the edge cases:

1. **One owner per domain.** Notion allows one domain to belong to only one organization; Figma refuses a domain already verified by another organization with domain capture enabled; Atlassian claims are exclusive ("an account can't be claimed by your organization while another organization holds the claim"). Two companies sharing a domain (a parent and a subsidiary on separate contracts) is a sales problem, not a feature.
2. **Subdomains are separate.** Notion's verified domain doesn't cover its subdomains, and Figma's doesn't capture people on `brand.example.com` when `example.com` is verified. A builder should treat every label as its own claim, with wildcards as an explicit, separately verified option, as Slack does.
3. **Verification decays.** A TXT record deleted during a DNS migration, or a certificate that lapses, leaves the vendor trusting a proof that no longer holds. Atlassian recommends using more than one method so a domain stays verified if one method expires. My default is to recheck every verified domain on a schedule, alert the organization's admins when a check fails, and suspend new claims (not existing ones) until it passes again.

## Managed Versus Personal Accounts

Once the domain is proven, the organization wants the accounts on it. How each vendor moves them:

- **Atlassian: claim.** A verified domain "can have its accounts claimed, but verification alone doesn't claim them." The admin can claim all accounts (new accounts on the domain are then claimed automatically and added to the default authentication policy) or claim some by uploading a CSV of up to 10,000 email addresses per file (5 MB maximum). Claimed accounts become managed accounts the organization can edit, deactivate or delete, with security policies such as two-step verification and SAML SSO. Users get an in-app notification and a note in their account settings. If the organization unclaims them or removes the domain, users are told and keep their app access. An Atlassian account on the company domain that hasn't been claimed is still an external user to the organization: admins can invite it to apps and remove its access, but can't update or fully delete it.
- **Google: transfer or rename.** Personal Google accounts created with a company address before (or outside) the Workspace subscription conflict with the managed accounts the admin wants to create. A super administrator sees them in the Admin console under unmanaged users, where accounts can take up to 24 hours to appear after the domain is verified, and either invites each owner to transfer the account into the organization (which gives the admin access to its data and the ability to manage it) or requires the owner to rename it, leaving it a separate personal Google account. A conflicting accounts policy can replace conflicting accounts with managed ones unilaterally. The limits matter in practice: members of a family group can't be transferred, accounts on an alias domain can't, the account's primary address (not an alternate one) has to be on the organization's domain, and Google advises making sure the organization has enough storage before inviting transfers, because the account's data comes with it.
- **Zoom: consolidate by invitation.** With associated domains, admins see how many users outside the account share the domain, can email them an invitation, and choose whether users are offered to change their address or consolidate into the company account. Users can't be forced to consolidate, and users who join through associated domains don't use SSO by default.
- **Figma: capture.** Domain capture applies to "anyone with any existing Figma account" on the domain and to new sign-ups; captured people become members rather than guests, and keep access to other organizations and teams they belong to.
- **Slack: per workspace.** A Slack account lives in a workspace or organization, so there is no personal account to claim; claimed domains instead stop people on the domain from joining Slack Connect with, or being invited into, workspaces the organization doesn't manage.

The person's side of this deserves a design rule, because claiming takes something from someone. Every vendor above notifies the person, and Google and Zoom let the person decline (rename, or change their address). My default is: notify before the claim takes effect, let the person take their non-work content out (or rename the account) during a notice period, never transfer content from consumer services the organization doesn't license, and record the claim as an event with the domain proof it relied on. Notion's 14-day period between verification and claiming, during which workspace owners are notified, is the pattern.

## Enforcing Single Sign-On

With managed accounts, the organization can require that they sign in through its identity provider. The protocol choice (SAML 2.0, or OpenID Connect) and the per-customer connection model are in the playbook's [SAML for Enterprise Customers](/docs/security/sso-and-federation#saml-for-enterprise-customers) and [SSO for Business Customers](/docs/security/sso-and-federation#sso-for-business-customers). What workplace products layer on top:

- **Required, optional or partial.** Slack's workspace owners choose SSO required for all members, required for all except guests, or optional, and Slack recommends the partial option so guests can still sign in with email and password. Notion offers "Only SAML SSO" or SAML as one method among others. Requiring SSO for guests is usually wrong, because guests belong to another organization's identity provider ([Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration)).
- **SSO overrides self-serve joining.** Slack notes that enabling single sign-on overrides the workspace's sign-up preferences: once the identity provider is the gate, approved-domain joining no longer applies.
- **Just-in-time accounts.** Notion's "automatic account creation" lets people who sign in through SAML join the workspace automatically, and Notion doesn't recommend using it together with SCIM. JIT creation answers who may get in; it never answers who must leave, which is why it is a complement to directory provisioning, not a substitute.
- **More than one identity provider.** Mergers leave organizations with two. Notion's Enterprise organizations can have up to 25 SAML configurations so different groups can use different providers; a Business workspace has one.
- **Plan gating.** Slack SAML is on Business+ and Enterprise (and on Free and Pro when a Salesforce org is connected); Notion SAML is on Business and Enterprise; Atlassian's enforcement of single sign-on and two-step verification requires Atlassian Guard Standard and a verified domain.

### Who can still sign in when the identity provider is down

Enforced SSO makes the identity provider a single point of failure for the whole workspace, including the admins who would fix it. Every vendor leaves a way around it, and the shape is consistent:

- **Microsoft's emergency access accounts.** Microsoft recommends two or more emergency access accounts: cloud-only accounts on the `*.onmicrosoft.com` domain, not federated or synchronized, holding the Global Administrator role as a permanent active assignment, protected with a passkey (FIDO2) or certificate-based authentication different from the normal admins' method, excluded from any Conditional Access policy that blocks or restricts sign-in, monitored with an alert on every sign-in, and tested at least every 90 days. The reasons Microsoft lists include federation being unavailable because of an identity provider outage.
- **Google's super administrators.** Under Google's newer SSO profiles, super administrator SSO isn't supported: super administrators sign in with their Google credentials. Even under the legacy profile, which supports it in limited cases, super admins bypass SSO in the Admin console. That keeps a path into the Admin console when the identity provider fails, at the price that the most powerful accounts in the tenant don't get the identity provider's policies.

My default for any product with enforced SSO: a small number of organization owners can always sign in with a vendor-held credential protected by a phishing-resistant factor, every such sign-in alerts the other owners and lands in the audit log, and the product shows the organization how many such accounts exist. That is the break-glass account made visible instead of a hidden bypass.

## MFA Policy

Enterprise customers enforce MFA in their identity provider; the vendor enforces it for everyone else, and for itself. The generic guidance (passkeys first, factors ranked by phishing resistance, recovery as the real login) is the playbook's [Multi-Factor Authentication](/docs/security/authentication#multi-factor-authentication). What the suites show:

- **A free baseline exists.** Microsoft's security defaults require every user to register for MFA, require administrators to do MFA, prompt users when Microsoft judges it necessary, block legacy authentication protocols and protect Azure management, at no extra cost. Tenants created on or after October 22, 2019 may have them on; new tenants get them at creation with a 24-hour grace period before enforcement. Microsoft removed the 14-day MFA registration grace period for new and existing tenants starting July 29, 2024, and from July 1, 2026 all new tenants block device code flow under security defaults. Microsoft states that MFA and blocking legacy authentication stop more than 99.9% of common identity attacks.
- **Customization is the paid tier.** Conditional Access, Microsoft's policy engine for MFA and device conditions, requires Microsoft Entra ID P1; organizations that adopt it must turn security defaults off and replace them with policies ([Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies#signals-and-conditions)).
- **The vendor's own MFA covers people the identity provider doesn't.** Atlassian enforces two-step verification on managed accounts through authentication policies (with Guard Standard and a verified domain) and keeps a separate security policy for external users, whose accounts it doesn't manage. Any product that lets guests or unfederated accounts in needs the same split: the customer's identity provider for its own people, the vendor's factor for everyone else.

## Session Lifetime

Once a person is signed in, how long the session lasts is a policy the customer sets. The generic mechanics (server-side sessions, revocation, step-up for sensitive actions) are the playbook's [Sessions: The Default](/docs/security/authentication#sessions-the-default). The vendor settings show how varied the defaults are:

| Vendor | Control | Default and range |
| --- | --- | --- |
| **Google Workspace** | Web session length for Google services | 14 days by default; can be set to never expire; the Admin console is fixed at one hour; native Android and iOS apps don't expire except on reauthentication events |
| **Microsoft Entra ID** | Conditional Access sign-in frequency and persistent browser session | A rolling 90 days by default, with sessions revoked on posture changes such as a password change, a noncompliant device or a disabled account; "every time" reauthentication allows five minutes of clock skew |
| **Atlassian** | Idle session duration in authentication policies | 30 days on Atlassian Cloud and 24 hours in Atlassian Government Cloud; 15 minutes to 30 days for external users; mobile app sessions excluded from idle timeout |
| **Slack** | Desktop and mobile session duration | Set separately per platform on all plans; members warned two hours and again 15 minutes before sign-out; Enterprise admins can set durations for a subset of members by API |

Two things the table shows. First, vendors disagree on whether short sessions are safer: Microsoft's documentation argues that frequent prompts train users to type credentials into anything, and prefers long sessions revoked on risk signals; Google and Atlassian let admins shorten sessions sharply. Second, mobile is the exception everywhere: Google's native apps and Atlassian's mobile sessions sit outside the idle rules, because a chat app that signs out every day isn't used. My default is long sessions that end on signals (deprovisioning, password change, device noncompliance, an admin's revoke) with a short re-authentication for admin and export actions ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)), and a separate, configurable maximum for mobile.

## The SSO Tax

Gating SAML behind an upper tier is common enough to have a name. The site sso.tax ("The SSO Wall of Shame") lists vendors that charge more for single sign-on, with each vendor's base price, price with SSO and percentage increase, plus a table of vendors whose SSO price is quote-only; it argues SSO is "a core security requirement for any company with more than five employees." Its collaboration rows carry their own last-updated dates, many from 2023 or earlier, so they record the practice rather than current prices. The tier placements above show the practice as of October 2026: SAML at Slack Business+, Notion Business, Atlassian Guard and Figma Organization.

The vendor's argument is that SSO buyers are the customers who also need audit logs, SCIM and admin roles, so SSO is a reliable signal of an enterprise buyer worth pricing for. The cost of that argument is borne by small companies that need SSO for security and nothing else. My position: basic OIDC or SAML sign-in should be in every paid tier, and the enterprise tier should be priced on the things that are genuinely costly to provide (SCIM with group push, multiple identity providers, audit log retention, policy scoping, residency). The pricing side is this volume's Plans, Pricing & Seats chapter in The Business part.

## How to Build It

The core data model has `domains` (`organization_id`, `domain`, `verified_at`, `method`) and `accounts` (`managed_by` organization or personal). This chapter adds the proof's life cycle, claims, SSO connections, authentication policies and sessions.

```sql
ALTER TABLE domains
  ADD COLUMN verification_token TEXT NOT NULL,              -- the value expected in DNS or the file
  ADD COLUMN token_expires_at   TIMESTAMPTZ,                -- e.g. a week after issue
  ADD COLUMN is_wildcard        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN status             TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'check_failing', 'revoked')),
  ADD COLUMN last_checked_at    TIMESTAMPTZ,
  ADD COLUMN claimable_after    TIMESTAMPTZ,                -- verified_at plus the notice period
  ADD CONSTRAINT domains_method_check CHECK (method IN ('dns_txt', 'https_file', 'idp_trusted')),
  ADD CONSTRAINT domains_one_owner UNIQUE (domain);         -- one organization per domain label

CREATE TABLE account_claims (             -- moving an account from personal to managed, and back
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  domain_id        UUID NOT NULL REFERENCES domains (id),   -- the proof the claim relied on
  source           TEXT NOT NULL CHECK (source IN ('claim_all', 'csv', 'capture', 'transfer_accepted',
                     'conflict_replaced')),
  state            TEXT NOT NULL CHECK (state IN ('notified', 'effective', 'declined_renamed',
                     'released')),
  notified_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_at     TIMESTAMPTZ,
  released_at      TIMESTAMPTZ,
  actor_account_id UUID REFERENCES accounts (id)
);

CREATE TABLE sso_connections (            -- one or more identity providers per organization
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  protocol        TEXT NOT NULL CHECK (protocol IN ('saml', 'oidc')),
  name            TEXT NOT NULL,
  idp_entity_id   TEXT,                   -- SAML issuer, or the OIDC issuer URL
  sso_url         TEXT NOT NULL,
  signing_certs   JSONB NOT NULL DEFAULT '[]',  -- current and next, for rotation
  jit_create      BOOLEAN NOT NULL DEFAULT FALSE,
  state           TEXT NOT NULL DEFAULT 'testing' CHECK (state IN ('testing', 'active', 'disabled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE authentication_policies (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  name                TEXT NOT NULL,
  is_default          BOOLEAN NOT NULL DEFAULT FALSE,
  sso_connection_id   UUID REFERENCES sso_connections (id),
  sso_mode            TEXT NOT NULL DEFAULT 'optional'
    CHECK (sso_mode IN ('optional', 'required', 'required_except_guests')),
  mfa_required        BOOLEAN NOT NULL DEFAULT FALSE,
  idle_timeout        INTERVAL,               -- null: no idle limit
  max_session_web     INTERVAL,
  max_session_mobile  INTERVAL,
  break_glass         BOOLEAN NOT NULL DEFAULT FALSE,   -- the owners' bypass policy
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE authentication_policy_members (
  policy_id  UUID NOT NULL REFERENCES authentication_policies (id),
  account_id UUID NOT NULL REFERENCES accounts (id),
  PRIMARY KEY (account_id)                    -- one policy per account; the default applies otherwise
);

CREATE TABLE account_sessions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  client          TEXT NOT NULL CHECK (client IN ('web', 'desktop', 'mobile', 'api')),
  auth_method     TEXT NOT NULL,              -- 'saml:<connection id>', 'password+totp', 'passkey'
  policy_id       UUID REFERENCES authentication_policies (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  revoked_reason  TEXT CHECK (revoked_reason IN ('signout', 'policy_change', 'deprovisioned',
                    'admin', 'password_change', 'risk'))
);
```

Notes on the sketch:

- **The domain has a life cycle, not a flag.** `status` moves to `check_failing` when a scheduled recheck fails; claims and captures check `status = 'verified'` and `claimable_after` before they act, so a lapsed proof stops new claims without touching existing ones.
- **Claims are rows, not an update to `accounts.managed_by`.** The claim records the domain proof, the source and the notice, and a release is a new state, so "why does this organization manage my account?" always has an answer.
- **Two certificates per connection.** Identity providers rotate signing certificates; accepting the current and the next one prevents an outage on rotation day.
- **One policy per account, with a default.** Atlassian's model (a default policy, others assigned explicitly) avoids the precedence puzzles of overlapping policies; the break-glass policy is just a policy with `break_glass` set, assigned to few accounts and alarmed.
- **Policy changes apply at the next sign-in, not by mass sign-out.** Atlassian applies a new idle duration at the next login, and Slack spreads sign-outs across the chosen timeframe; revoking every session at once is reserved for incidents.
- **Events:** `domain.verified`, `domain.check_failed`, `account.claimed`, `account.released`, `sso_connection.activated`, `authentication_policy.changed` and `session.revoked` go to the audit log and, for the person affected, to a notification.

## Auditing

- **Domain proofs:** each verification and recheck, the method and the result, and who added or removed the domain.
- **Claims:** every account claimed, released or replaced, with the proof and the notice given.
- **SSO and policy changes:** connection activation, certificate changes, enforcement mode changes and policy assignments, with the before and after values ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Sign-ins and bypasses:** every sign-in that didn't go through the required identity provider, with an alert for break-glass use.
- **Session revocations** with their reason.

## What This Means for the System You Build

- **Accept DNS TXT for domain proof, add an identity-provider-trust path,** and recheck proofs on a schedule.
- **Enforce one owner per domain label** and treat subdomains and wildcards as separate claims.
- **Separate verifying from claiming,** notify people before the claim takes effect, and let them take personal content out.
- **Support required, optional and required-except-guests SSO,** several identity providers per organization, and certificate rotation without downtime.
- **Keep a visible, alarmed break-glass path** for owners when the identity provider is down.
- **Prefer long sessions that end on signals,** with step-up for admin and export actions and a separate mobile limit.
- **Put basic SSO in every paid tier;** charge for what is costly to run.

## References

**Vendor documentation**

- [Slack: Claim and verify email domains](https://slack.com/help/articles/5513043606547-Claim-and-verify-email-domains), DNS TXT and `_slack-challenge`, 72 hours, Slack Connect and external-join restrictions
- [Slack: Manage how people join your workspace](https://slack.com/intl/en-gb/help/articles/115004856503-Manage-how-people-join-your-workspace), SSO overriding sign-up preferences
- [Slack: SAML single sign-on](https://slack.com/help/articles/203772216-SAML-single-sign-on), plans, required, required-except-guests and optional modes, guidance for guests
- [Slack: Manage session duration](https://slack.com/help/articles/115005223763-Manage-session-duration), all plans, desktop and mobile settings, two-hour and 15-minute warnings, the Enterprise API
- [Atlassian: Verify a domain to manage accounts](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/), HTTPS, DNS and identity-provider verification, claiming all or by CSV (10,000 addresses, 5 MB), exclusive claims, user notices
- [Atlassian: What is an Atlassian organization?](https://support.atlassian.com/organization-administration/docs/what-is-an-atlassian-organization/), Guard Standard and a verified domain for enforcing two-step verification and SSO
- [Atlassian: Who are external users?](https://support.atlassian.com/security-and-access-policies/docs/who-are-external-users/), unclaimed accounts on the domain as external users
- [Atlassian: Update idle session duration](https://support.atlassian.com/security-and-access-policies/docs/update-idle-session-duration/), 30-day default, 24 hours in Government Cloud, applied at next login, mobile excluded
- [Atlassian: Set idle session duration for external users](https://support.atlassian.com/security-and-access-policies/docs/set-idle-session-duration-for-external-users), the 15-minute to 30-day range
- [Google Workspace: Use the transfer tool to migrate unmanaged users](https://knowledge.workspace.google.com/admin/users/use-the-transfer-tool-to-migrate-unmanaged-users), conflicting personal accounts, invite to transfer or rename, the conflicting accounts setting, family group, alias and primary-address limits, storage before transfer
- [Google Workspace: Super administrator SSO](https://knowledge.workspace.google.com/admin/apps/super-administrator-sso), super admins not redirected to the identity provider under the newer SSO profiles
- [Google Workspace: Set session length for Google services](https://knowledge.workspace.google.com/admin/security/set-session-length-for-google-services), 14-day default, never-expire option, one-hour Admin console, exclusions, editions
- [Microsoft Entra: Security defaults](https://learn.microsoft.com/en-us/entra/fundamentals/security-defaults), the enforced policies, October 22, 2019, the 24-hour grace, the July 29, 2024 and July 1, 2026 changes, the 99.9% claim, P1 for Conditional Access
- [Microsoft Entra: Conditional Access adaptive session lifetime](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-session-lifetime), rolling 90-day sign-in frequency, revocation on posture change, five-minute skew for every-time reauthentication
- [Microsoft Entra: Manage emergency access admin accounts](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access), two or more cloud-only accounts, passkeys or certificates, Conditional Access exclusion, monitoring, 90-day validation
- [Notion: SAML SSO configuration](https://www.notion.com/help/saml-sso-configuration), Business and Enterprise plans, SAML-only or any method, automatic account creation and SCIM, 25 configurations
- [Notion: Domain management](https://www.notion.com/help/domain-management), one-week codes, subdomains, one organization per domain, the 14-day notice period
- [Figma: Find users with Figma accounts outside your organization](https://help.figma.com/hc/en-us/articles/27503664218391-Find-users-with-Figma-accounts-outside-your-organization), DNS verification and subdomain behavior
- [Figma: Domain capture](https://help.figma.com/hc/en-us/articles/360040453113), existing and new accounts captured as members
- [Zoom: Account and user consolidation explainer](https://library.zoom.com/admin-corner/account-and-endpoint-management/account-and-user-consolidation-explainer), associated domains, invitations to consolidate, no forced consolidation, SSO not default for joined users

**In practice**

- [sso.tax: The SSO Wall of Shame](https://sso.tax/), base and SSO prices and percentage increases per vendor with per-row update dates, quote-only vendors, the argument for SSO as a core feature
