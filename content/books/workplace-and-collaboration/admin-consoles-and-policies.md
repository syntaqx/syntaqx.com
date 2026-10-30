+++
title = "Admin Consoles & Policies"
description = "Admin role ladders and scoped admins, just-in-time elevation, policy inheritance, conditional access, device and app controls, admin APIs and change history."
category = "Workplace & Collaboration Industry"
order = 2011
part = "Tenancy and Identity"
tags = ["workplace", "administration", "policies", "conditional-access", "rbac"]
+++

The admin console is where the inversion becomes a product. In a consumer app, the vendor decides what users may do; in a workplace app, the customer's administrators decide, and the vendor builds them the tools: who may administer what, which settings apply to whom, which apps may touch company data, which devices and networks may connect, and a record of every change. A large customer's admin console is used by dozens of people with different jobs (the help desk resetting passwords, the security team writing access policy, the compliance team running holds, a regional IT lead managing one country), and each needs exactly their slice.

It is hard for the same reasons that make permissions hard, with higher stakes. An admin role is a permission over other people's permissions, so a mistake in its scope is a tenant-wide breach. Policies come from several layers (the organization, a workspace, an organizational unit, a group, a single user) and have to resolve to one answer, predictably. And the console itself is a target: an attacker who gets an admin session owns the tenant. This chapter covers admin role ladders and scoping, just-in-time elevation, how policy scope and inheritance resolve, conditional access and device and app controls, controls over third-party apps, admin APIs, and change history. Item and container permissions are [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing); sign-in policy is [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts).

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Top role | Scoped and delegated admins | Just-in-time elevation | Admin change history |
| --- | --- | --- | --- | --- |
| **Slack** | Org Primary Owner (Enterprise) or Workspace Primary Owner | Org Owners and Admins, Workspace Owners and Admins, Channel Managers, 18 system roles, custom roles on Enterprise | Not covered here | Audit Logs API on Enterprise plans |
| **Google Workspace** | Super Admin | 11 other prebuilt roles; User Management Admin and Help Desk Admin can be limited to organizational units; custom roles | Not covered here; a Multi-party approval Admin role exists | Admin log events kept 6 months, near real time |
| **Microsoft Entra ID** | Global Administrator, recommended for fewer than five people | Over 65 built-in roles, custom roles (P1), administrative units for regional or departmental scope | Privileged Identity Management, eligible roles activated for a limited time (P2 or ID Governance) | Audit and sign-in logs kept 7 days on Free, 30 days on P1 and P2 |
| **Atlassian** | Organization admin | User access admin, site admin, app admin | Not covered here | Organization audit log; storing in-app data needs Guard Premium or Cloud Enterprise |

Three patterns:

- **One top role, kept small.** Every vendor has an all-powerful role (Primary Owner, Super Admin, Global Administrator, organization admin), and every vendor's guidance is to give it to few people and do daily work with narrower roles. Microsoft puts a number on it: fewer than five Global Administrators, and fewer than ten privileged role assignments overall, with warnings in the console past those numbers.
- **Scope by the same structure that holds people.** Google scopes admin roles to organizational units, Microsoft to administrative units, Slack to workspaces under the organization, Atlassian to apps and sites. The admin model reuses the tenant's own tree ([Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces)).
- **Change history is a paid, time-limited asset.** Log retention ranges from seven days to six months by default, with longer retention sold separately; the Audit Logs chapter in this volume's Security and Compliance part covers it in depth.

## Admin Role Ladders

### Slack

Slack's workspace roles are Workspace Primary Owner (the one owner who can delete the workspace or transfer ownership), Workspace Owners (the same, minus delete and transfer), Workspace Admins (members and administrative tasks, but no billing), full members, multi-channel and single-channel guests, and Channel Managers (administrative actions on assigned channels, paid plans). Enterprise plans add Org Primary Owner (the single owner who can transfer the organization and has access to system roles and channel management tools by default), Org Owners (the same, minus transfer and that default access) and Org Admins (org-level settings and policies).

The system roles carve specific jobs out of the admin role: Analytics Admin, Audit Logs Admin, Channels Admin, Content Admin, Customization Manager, DLP Admin, Export Admin, Integrations Admin, Legal Holds Admin, Message Activity Manager, Roles Admin, Sales Admin, Salesforce Admin, Security Admin, Skill Manager, Template Admin, Users Admin and Workflow Admin. They are on Enterprise plans, with Message Activity Manager, Sales Admin and Salesforce Admin also on Business+, and Enterprise plans can create custom roles. Members with the Security Admin or Users Admin system role can deactivate anyone except the Org Primary Owner. The lesson is that compliance jobs (legal holds, exports, DLP, audit logs) are separate roles, so a legal team can hold a custodian's messages without being able to change SSO.

### Google Workspace

Google's prebuilt administrator roles are Super Admin, Groups Admin (with Groups Reader and Groups Editor variants limited by group type), User Management Admin, Help Desk Admin, Services Admin, Multi-party approval Admin, Mobile Admin, Storage Admin, Google Voice Admin, Directory Sync Admin, Reseller Admin and Indirect Reseller Admin, plus custom roles built from individual privileges. User Management Admin and Help Desk Admin can be limited to specific organizational units, so a regional help desk resets passwords only for its region. The Admin console's own session lasts one hour and can't be changed, shorter than any user session.

### Microsoft Entra ID

Microsoft's guidance for Entra roles is the most prescriptive public text on admin design. Least privilege has three parts, "a specific set of permissions, over a specific scope, for a specific period of time." There are over 65 built-in roles for directory objects and for Microsoft 365 services such as Exchange, SharePoint and Intune, and custom roles when none fits. Administrative units scope a role to a subset of users, groups or devices for regional or departmental admins. Global Administrators "essentially have unrestricted access" and can elevate their access to read data; the recommendation is fewer than five of them, all with MFA, plus two cloud-only emergency access accounts ([Who Can Still Sign In When the Identity Provider Is Down](/books/workplace-and-collaboration/sso-and-managed-accounts#who-can-still-sign-in-when-the-identity-provider-is-down)). Microsoft also recommends assigning roles to groups so a group owner can delegate role management, using cloud-native accounts rather than on-premises synced ones for admin roles, and reviewing admin access on a recurring schedule. Licensing shapes what a tenant can do: custom roles and Conditional Access need P1, admins scoped to administrative units need P1, and Privileged Identity Management needs P2 or Microsoft Entra ID Governance.

### Atlassian

Atlassian has four admin roles. Organization admin "is the highest admin role you can hold in an organization," grants the other admin roles, and Atlassian recommends having more than one. A user access admin manages access to the app they administer and is granted only by an organization admin. A site admin manages apps in their site (and users, in the original user management experience). An app admin manages settings for a specific app without access to Atlassian Administration, granted by an organization admin or the app's user access admin, and only by an organization admin for Jira apps.

## Just-in-Time Elevation

Standing admin access is the risk; the industry answer is to make privileged roles eligible rather than active. In Microsoft's Privileged Identity Management, a user is made eligible for a role and activates it for a limited time when needed, after which the access is removed automatically; activation can require approval and MFA, notifications go out when someone activates a role, and PIM for Groups lets one activation grant several roles at once. Microsoft's session guidance pairs it with Conditional Access authentication context, so activating a privileged role can require reauthentication. Emergency access accounts are the deliberate exception: their Global Administrator assignment is permanent active, because the scenario they exist for is the one where activation doesn't work, and a configuration where every privileged role is eligible, activation needs approval, and no approver is left is one of Microsoft's listed lockout causes.

Google's prebuilt roles include a Multi-party approval Admin; two-person approval of sensitive admin actions is the same idea from another angle, limiting what one compromised admin can do alone. My default for a builder: separate standing roles for routine work (help desk, user admin) from eligible roles for anything that can read content or change security policy, require a reason and a time box on activation, and make two-person approval available for the actions that can't be undone (deleting a workspace, removing a legal hold, disabling SSO).

## Policy Scope and Inheritance

A setting in a workplace product is rarely global. It is set at one level and inherited, overridden or locked below. The vendors' models:

- **Locks from above (Slack).** On Enterprise plans, some workspace policies are controlled by Org Owners and Org Admins; a lock icon means an org admin has locked the setting, and workspace admins have to ask an org admin to change it. When an Org Owner sets an app management policy, app approval is enabled automatically in every workspace.
- **A tree with overrides, and groups on top (Google).** Settings flow from the top-level organizational unit to child units, a setting applied to a child overrides the inherited one, and a change at a higher level changes every child that inherits it, while "custom settings, however, remain unchanged." Configuration groups customize service settings independent of OU placement, and in data region policies group settings override organizational units. A user belongs to exactly one OU; to treat one person differently, an admin creates an OU or a group for them.
- **Targeted policies (Microsoft).** Conditional Access policies target users, groups, agents, applications and conditions rather than a tree position. Report-only policies evaluate without enforcing, and a "What if" view shows how policies would apply to a scenario.
- **Membership in one policy (Atlassian).** Every organization has a default authentication policy that applies to all users unless they're moved to another; each policy covers a set of members and states its two-step verification, SSO, password and idle session settings. More than one policy (up to twenty) requires Guard Standard.

Each model answers the question "what applies to this person, and why?" differently, and the question gets asked during every incident. My rule for a builder: one resolution order, written down and shown in the console (organization lock, then the most specific scope that sets the value, then inherited, then default), a "why does this apply" view per person and setting, and a report-only mode for any policy that can lock people out.

## Signals and Conditions

The modern admin policy is not a static setting but a rule over signals at sign-in and request time.

**Microsoft Conditional Access.** Policies are if-then statements ("if a user wants to access a resource, then they must complete an action"), enforced after first-factor authentication. Signals include the user, group or agent; IP location information, including country or region ranges; the device's platform and state; the application; real-time and calculated risk from Microsoft Entra ID Protection; and session controls from Microsoft Defender for Cloud Apps. Decisions are block, or grant with requirements: MFA, an authentication strength, a device marked compliant, a hybrid-joined device, an approved client app, an app protection policy, a password change or terms of use. Common policies are MFA for admin roles and for Azure management, blocking legacy authentication, and requiring organization-managed devices for specific apps. It requires Microsoft Entra ID P1 (or Microsoft 365 Business Premium), risk-based policies need P2, and when the license lapses, existing policies keep working but can't be edited.

**Google context-aware access.** Policies limit access to apps by IP range, device policy and operating system (encryption, password requirements), geographic origin and custom access levels, on personal and managed devices, for Frontline Standard and Plus, Enterprise Standard and Plus, Education Standard and Plus, Enterprise Essentials Plus and Cloud Identity Premium. It covers the core services (Gmail, Drive, Docs, Meet, Chat, Calendar, Vault, the Admin console, Gemini and others); for SAML apps, policies are checked at sign-in rather than continuously.

The two share a design: identity, device and network signals evaluated per request, with the decision attached to the session. A collaboration product that isn't itself an identity provider usually consumes these decisions (by requiring sign-in through the customer's identity provider) and adds the controls only it can enforce, such as blocking downloads on unmanaged devices or limiting a session to the web client.

### Devices and mobile apps

Mobile is where corporate data leaves managed devices. Microsoft Intune app protection policies keep data inside managed apps "with or without enrolling devices": requiring a PIN or biometric to open work content, preventing copy and paste and "save as" from work apps into personal ones, restricting corporate data to approved apps, encrypting app data, and wiping only corporate data from an app (the SDK checks for a selective wipe request every 30 minutes while the app is in use). Policies apply only in the work context of multi-identity apps, so a person's personal account in the same app is untouched. Conditional Access can require an app protection policy before granting access, which is how the two are tied together. Any collaboration vendor whose mobile app is used for work needs either this SDK integration or its own equivalent controls (passcode, no export to unmanaged apps, remote sign-out).

## Third-Party App Controls

Apps and integrations are the other way data leaves. Two public models:

- **Slack app approval.** By default members can install apps without approval; owners can switch to "only allow pre-approved apps," pre-approve or restrict apps from their Marketplace pages, let members request apps (with required comments, routed to app managers), and define automation rules that approve, restrict or dismiss requests. Approving an install approves the scopes it uses in the workspace. Restricting an app doesn't remove it where already installed. On Enterprise plans an org-level app management policy turns approval on in every workspace.
- **Google API controls.** Admins set each third-party app to Trusted (all scopes, including restricted services), Specific Google data (only listed scopes), Limited (unrestricted services only) or Blocked. Unconfigured apps can be allowed, limited to basic sign-in information, or blocked until configured. Each Google service can be marked restricted, which stops untrusted apps from using it and revokes their tokens, and Gmail, Drive, Docs and Chat can restrict a predefined list of high-risk scopes such as sending mail or deleting Drive files.

App review, marketplaces and OAuth verification belong to Apps & Marketplaces in this volume's Search, Integrations and AI part; the admin's side is the allow, restrict and request loop above.

## Admin APIs

Large customers manage the console through code: provisioning roles, applying policies from version control, exporting logs to a SIEM. The public surfaces:

- **Google Admin SDK Directory API:** users (with admin roles and privileges), groups and memberships, organizational units, devices (including actions on lost devices), roles and role assignments, and domains.
- **Microsoft Graph:** Conditional Access policies can be created from templates in the portal or through the Graph API, provisioning jobs are monitored and restarted through it, and Entra's provisioning service reads users and groups from it with delta queries.
- **Atlassian Organizations REST API:** list users and update their product access, create and update organization policies, and read domains and events, authenticated with an organization API key used as a bearer token.
- **Slack:** the Audit Logs API on Enterprise plans, the SCIM API, and a session duration API that sets durations for a subset of members.

The design lesson is that every console action needs an API equivalent with the same permission checks and the same audit events, attributed to the API key's owner and the key itself ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).

## Change History

Admins need to answer "who changed this setting, when, and from where?" The vendors' defaults:

- **Google Workspace** keeps Admin log events, Admin Data Action log events, Access Transparency log events and audit data retrieved through the API for six months, with near-real-time lag of a couple of minutes, and Vault log events indefinitely. Google warns that some events may be delayed beyond these times and, rarely, not reported.
- **Microsoft Entra ID** keeps audit logs and sign-in logs for seven days on Free and 30 days on P1 and P2; longer retention means routing them to Azure storage through Azure Monitor, or Microsoft Purview Audit (Premium) with E5-class licenses. Entra's logs are separate from the Microsoft 365 unified audit log in Purview. Upgrading from Free doesn't recover older data.
- **Slack's** Audit Logs API, on Enterprise plans, returns events with an action, an actor (a user, Slack's security agent or a placeholder), an entity (user, channel, file, app, workspace or enterprise) and a context with the location (enterprise or workspace), user agent, IP address, session id and the app, if one was involved.
- **Atlassian's** organization audit log tracks activity across the organization; whether it stores in-app data such as Confluence page titles and Jira work item identifiers is a setting on Guard Premium or Cloud Enterprise, and the audit log isn't covered by data residency.

The rule that matters for a builder: an admin change event records the before and after value, the scope, the actor and how they authenticated (including whether a role was activated just in time), and it is written in the same transaction as the change. Log design and retention are in the playbook's [What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds).

## How to Build It

The core data model has `audit_events`; the OU tree (`org_units`) comes from [Tenants, Workspaces & Organizations](/books/workplace-and-collaboration/tenants-and-workspaces#how-to-build-it). This chapter adds admin roles and their scoped, possibly just-in-time assignments, and scoped policies with revisions.

```sql
CREATE TABLE admin_roles (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID REFERENCES organizations (id),   -- null for built-in roles
  key             TEXT NOT NULL,                        -- 'org_owner', 'help_desk', 'legal_holds_admin', custom
  privileges      TEXT[] NOT NULL,                      -- 'users.reset_password', 'holds.manage', ...
  privileged      BOOLEAN NOT NULL DEFAULT FALSE,       -- can change security policy or read content
  built_in        BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (organization_id, key)
);

CREATE TABLE admin_role_assignments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  admin_role_id   UUID NOT NULL REFERENCES admin_roles (id),
  principal_type  TEXT NOT NULL CHECK (principal_type IN ('account', 'group')),
  principal_id    UUID NOT NULL,
  scope_type      TEXT NOT NULL CHECK (scope_type IN ('organization', 'workspace', 'org_unit', 'app')),
  scope_id        UUID NOT NULL,
  assignment      TEXT NOT NULL CHECK (assignment IN ('active', 'eligible')),
  max_activation  INTERVAL,                             -- for eligible assignments, e.g. '4 hours'
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  granted_by      UUID NOT NULL REFERENCES accounts (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_role_activations (     -- just-in-time elevation of an eligible assignment
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  assignment_id   UUID NOT NULL REFERENCES admin_role_assignments (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  reason          TEXT NOT NULL,
  approved_by     UUID REFERENCES accounts (id),
  activated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ NOT NULL,
  ended_early_at  TIMESTAMPTZ,
  CHECK (approved_by IS NULL OR approved_by <> account_id)   -- nobody approves their own
);

CREATE TABLE admin_policies (             -- one value of one setting at one scope
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  setting_key     TEXT NOT NULL,          -- 'apps.require_approval', 'sharing.external', 'network.ip_allowlist'
  scope_type      TEXT NOT NULL CHECK (scope_type IN ('organization', 'workspace', 'org_unit', 'group')),
  scope_id        UUID NOT NULL,
  value           JSONB NOT NULL,
  locked          BOOLEAN NOT NULL DEFAULT FALSE,   -- lower scopes can't override
  mode            TEXT NOT NULL DEFAULT 'enforce' CHECK (mode IN ('enforce', 'report_only')),
  revision        INT NOT NULL DEFAULT 1,
  updated_by      UUID NOT NULL REFERENCES accounts (id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, setting_key, scope_type, scope_id)
);

CREATE TABLE admin_policy_revisions (     -- the full history; audit_events points here
  admin_policy_id UUID NOT NULL REFERENCES admin_policies (id),
  revision        INT NOT NULL,
  value           JSONB NOT NULL,
  locked          BOOLEAN NOT NULL,
  mode            TEXT NOT NULL,
  changed_by      UUID NOT NULL REFERENCES accounts (id),
  via_activation_id UUID REFERENCES admin_role_activations (id),
  changed_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (admin_policy_id, revision)
);
```

Notes on the sketch:

- **Resolution is a function with a reason.** `effective_policy(account, setting_key)` returns the value and the row it came from: a locked organization value first, then group, then the account's OU and its ancestors nearest first, then workspace, then organization, then the built-in default. The console's "why does this apply" view calls the same function.
- **Assignments are scoped, and checked twice.** An admin action checks that the actor holds a privilege through an assignment whose scope contains the target (the target member's OU, the workspace, the app), and that the assignment is active or has a current activation.
- **Privileged roles are eligible by default.** Built-in roles flagged `privileged` are granted as `eligible` unless the grantor chooses otherwise; break-glass accounts are the documented exception, with standing active assignments and alarms.
- **Policies have a report-only mode.** A `report_only` policy is evaluated and logged ("would have blocked") without enforcing, so an admin can see the effect of an IP allowlist or a device rule before locking anyone out.
- **Revisions are immutable.** Each change writes `admin_policy_revisions` and an `audit_events` row in one transaction, including the activation it was made under, so a change made during a just-in-time window can be traced to the reason given.
- **Events:** `admin_role.assigned`, `admin_role.activated`, `admin_role.activation_ended`, `admin_policy.changed` and `admin_policy.mode_changed` go to the audit log, to a notification for the organization's other owners when a privileged role is granted or activated, and to the SIEM export.

## Auditing

- **Every role assignment, activation and removal,** with scope, reason, approver and duration.
- **Every policy change** with before and after values, scope, lock and mode, and the activation it was made under.
- **Report-only outcomes,** so the effect of a policy is known before it is enforced.
- **Top-role headcount over time:** owners, super admins and Global Administrators, with alerts past a threshold.
- **Admin console and API sign-ins,** including the authentication method and whether the session went through the customer's identity provider.

## What This Means for the System You Build

- **Keep one top role small** and give routine jobs (help desk, users, holds, exports, DLP) their own roles.
- **Scope admin roles with the tenant's own structure:** organization, workspace, organizational unit, app.
- **Make privileged roles eligible, with time-boxed activation, a reason and optional approval;** nobody approves their own.
- **Write down one policy resolution order,** show it in the console, and support locks and report-only mode.
- **Consume the customer's conditional access decisions** and add the controls only your product can enforce.
- **Give admins allow, restrict and request controls over third-party apps and their scopes.**
- **Offer an API for every console action** with the same checks, and record every change with before and after values.

## References

**Vendor documentation**

- [Slack: Types of roles in Slack](https://slack.com/help/articles/360018112273-Types-of-roles-in-Slack), workspace and org roles, the system roles and their plans, custom roles on Enterprise
- [Slack: Manage a workspace on Enterprise Grid](https://slack.com/intl/en-gb/help/articles/115005225987), policies locked by Org Owners and Admins
- [Slack: Deactivate a member's account](https://slack.com/help/articles/204475027-Deactivate-a-members-account), Security Admin and Users Admin system roles deactivating anyone but the Org Primary Owner
- [Slack: Manage app approval for your workspace](https://slack.com/help/articles/222386767-Manage-app-approval-for-your-workspace), pre-approved apps, restricted apps, requests, app managers, automation rules, org-level app management policies
- [Slack: Audit Logs API](https://docs.slack.dev/admins/audit-logs-api), Enterprise plans, event structure with actor, action, entity and context
- [Slack: Manage session duration](https://slack.com/help/articles/115005223763-Manage-session-duration), the session duration API for a subset of members
- [Google Workspace: Prebuilt administrator roles](https://knowledge.workspace.google.com/admin/users/prebuilt-administrator-roles), the role list and OU-scoped roles
- [Google Workspace: Set session length for Google services](https://knowledge.workspace.google.com/admin/security/set-session-length-for-google-services), the one-hour Admin console session
- [Google Workspace: How the organizational structure works](https://knowledge.workspace.google.com/admin/users/advanced/how-the-organizational-structure-works), OU inheritance and overrides, configuration and access groups
- [Google Workspace: Choose a geographic location for your data](https://knowledge.workspace.google.com/admin/compliance/choose-a-geographic-location-for-your-data), group settings overriding organizational units
- [Google Workspace: Protect your business with context-aware access](https://knowledge.workspace.google.com/admin/security/protect-your-business-with-context-aware-access), attributes, editions, covered apps, SAML apps checked at sign-in
- [Google Workspace: Control which apps access Google Workspace data](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data), Trusted, Specific, Limited and Blocked access, unconfigured apps, restricted services, high-risk scopes
- [Google Workspace: Data retention and lag times](https://knowledge.workspace.google.com/admin/reports/data-retention-and-lag-times), six-month retention of admin and API audit data, Vault logs, near-real-time lag
- [Google Workspace Admin SDK: Directory API guides](https://developers.google.com/workspace/admin/directory/v1/guides), users, groups, OUs, devices, roles and domains
- [Microsoft Entra: Best practices for Microsoft Entra roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/best-practices), least privilege, over 65 built-in roles, PIM, fewer than five Global Administrators and ten privileged assignments, groups, administrative units, licensing
- [Microsoft Entra: Manage emergency access admin accounts](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access), permanent active assignments for emergency accounts, the approval lockout scenario
- [Microsoft Entra: Conditional Access overview](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview), if-then policies, signals, decisions, report-only and What if, Graph API, P1 and P2 licensing, lapsed licenses
- [Microsoft Entra: Conditional Access adaptive session lifetime](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-session-lifetime), reauthentication on PIM activation through authentication context
- [Microsoft Entra: How application provisioning works](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works), delta queries and the Graph synchronization job API
- [Microsoft Entra: Data retention](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/reference-reports-data-retention), seven-day and 30-day log retention, Azure Monitor and Purview Audit for longer
- [Microsoft Intune: App protection policies overview](https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy), protection without enrollment, PIN, data transfer controls, encryption, selective wipe every 30 minutes, multi-identity
- [Atlassian: Give users admin permissions](https://support.atlassian.com/user-management/docs/give-users-admin-permissions/), organization admin, user access admin, site admin and app admin
- [Atlassian: Organizations REST API](https://developer.atlassian.com/cloud/admin/organization/rest/intro/), users, policies, domains and events, API key as a bearer token
- [Atlassian: Track organization activities from the audit log](https://support.atlassian.com/security-and-access-policies/docs/track-organization-activities-from-the-audit-log/), in-app data settings on Guard Premium or Cloud Enterprise, audit log outside data residency
- [Atlassian: Understand authentication policies](https://support.atlassian.com/security-and-access-policies/docs/understand-authentication-policies/), the default policy, members moved between policies, the settings shown, Guard Standard for up to twenty policies
