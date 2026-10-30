+++
title = "Threats & Incidents"
description = "Attacks on workplace tools from public reports: Teams help-desk phishing, device code and consent phishing, token theft, vendor breaches, Confluence CVEs."
category = "Workplace & Collaboration Industry"
order = 2054
part = "Security and Compliance"
tags = ["security", "incident-response", "phishing", "oauth", "token-theft", "threat-intelligence"]
+++

A workplace suite is the most valuable account an attacker can take. One sign-in reaches the mail, the chat, the files, the wiki and the calendar of a company, and every app the company has connected. The attacks on these tools in the public record rarely break the vendor's cryptography or find a bug in the core product. They abuse what the product is for: a chat from outside the company that looks like the help desk, a sign-in code the victim types on a real Microsoft page, a consent screen for an app that asks for the mailbox, a session token copied out of a support file, an OAuth token held by a connected SaaS tool. The self-hosted products are the exception, where unpatched servers were exploited at internet scale.

Most of the controls belong to the customer's admins: who outside the company may message employees, which apps users may consent to, which sign-in flows are allowed, how sessions are bound and revoked, which logs are kept and watched. The vendor owns the platform, its own corporate and support systems (which several of the incidents below went through), the defaults, and the tools admins use to respond. This chapter covers the attack patterns from vendors' and governments' own write-ups, how to detect them in a workspace, and the response playbook. The audit events themselves are [Audit Logs](/books/workplace-and-collaboration/audit-logs); content inspection is [DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection); guest and external access models are [Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration); app review is [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces); agents acting in workspaces are [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp). Abuse of infrastructure and stolen cloud keys are the Hosting & Cloud volume's [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure) and [Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#stolen-keys); the incident process itself is the playbook's [Incident Response](/docs/operations/incident-response).

## How the Platforms Do It

The incidents and campaigns below are from the affected vendor's own write-up or a government advisory; dates are as published.

| When | Target | What happened | Source |
| --- | --- | --- | --- |
| **June 2022** | Confluence Server and Data Center | CVE-2022-26134, OGNL injection letting an unauthenticated user execute code; all supported versions affected; active exploitation; Cloud not affected | Atlassian advisory, June 2, 2022 |
| **December 2022** | Slack's GitHub | A limited number of stolen employee tokens, from a third-party vendor's compromise, used to download private code repositories on December 27; no customer data | Slack, December 31, 2022 |
| **Mid-2023** | Teams users at fewer than 40 organizations | Midnight Blizzard sent Teams chats from compromised small-business tenants renamed with security-themed subdomains, posing as support, and talked users into entering MFA codes | Microsoft Threat Intelligence, August 2, 2023 |
| **September to October 2023** | Okta's support case system | A service account's credentials, saved to an employee's personal Google profile on a managed laptop, gave access from September 28 to October 17; files of 134 customers taken, some HAR files with session tokens; 5 customers' sessions hijacked | Okta root cause analysis, November 3, 2023 |
| **October 2023 to January 2024** | Confluence Data Center and Server | CVE-2023-22515 (unauthorized admin accounts, CVSS 10, exploited by a nation-state actor), CVE-2023-22518 (instance reset, raised to CVSS 10, ransomware), CVE-2023-22527 (template injection RCE, CVSS 10) | Atlassian advisories; CISA, FBI and MS-ISAC advisory AA23-289A |
| **November 2023 to March 2024** | Microsoft's corporate email | Midnight Blizzard password-sprayed a legacy non-production test tenant account without MFA, took over a legacy test OAuth app, granted itself `full_access_as_app` in Exchange Online and read senior leaders' email; later used stolen information to reach some source code and internal systems | Microsoft, January 19, January 25 and March 8, 2024 |
| **April to May 2024** | Windows users, then Teams | Storm-1811 flooded inboxes with subscriptions, called or messaged as IT support (Teams accounts named "Help Desk" from late May), had victims start Quick Assist, then deployed Black Basta ransomware | Microsoft Threat Intelligence, May 15, 2024, updated June 2024 |
| **August 2024 onward** | Microsoft 365 accounts | Storm-2372 sent fake Teams meeting invites that led victims to enter an attacker's device code on a real sign-in page, giving the attacker tokens; assessed in a July 31, 2026 update as an initial access sub-cluster of Midnight Blizzard | Microsoft Threat Intelligence, February 13, 2025 |
| **2025** | Salesforce, then Okta and Microsoft 365 | UNC6040 called employees as IT support and had them authorize an attacker's modified Salesforce Data Loader as a connected app, exfiltrated data and moved laterally with harvested credentials | Google Threat Intelligence, June 4, 2025 |
| **August 8 to 18, 2025** | Salesforce and a few Google Workspace accounts | UNC6395 used OAuth tokens stolen from the Salesloft Drift integration to export Salesforce data and hunt for secrets; on August 9 it used Drift Email tokens to read mail in a very small number of Workspace accounts | Google Threat Intelligence, August 26, updated August 28, 2025 |

Five patterns account for nearly all of it:

- **The help desk is the pretext.** Microsoft's Teams cases, Storm-1811 and UNC6040 all impersonate IT support, because employees are trained to cooperate with it.
- **The prize is a token or a grant, not a password.** MFA codes typed for the attacker, device codes, consent grants, connected-app authorizations and HAR files all hand over a session or an OAuth grant that survives a password change.
- **Apps are identities.** Microsoft's breach escalated through an OAuth app, Drift's tokens were the access, and Data Loader was authorized as a connected app; each held more access than any one user.
- **The vendor's own systems are targets.** Okta's support system, Microsoft's corporate tenant and Slack's code host were the entry points, not the products customers use.
- **Self-hosted servers fail at internet scale.** Every Confluence advisory above says Atlassian Cloud wasn't affected; the exposure was customers' own servers reachable from the internet and not yet patched.

## External Messages and Help-Desk Impersonation

In Microsoft Teams, [*external access*](/books/workplace-and-collaboration/guests-and-external-collaboration#external-access-as-an-attack-surface) lets users chat and meet with people in other Microsoft 365 organizations, separately from guest access. Microsoft's documentation states the default plainly: "By default, all external domains are allowed." An admin can allow only listed domains, block listed domains, or block all; can separately allow or block chat with unmanaged Teams accounts (and whether those accounts may start conversations); and can block specific external users, up to 200. Since federation needs both sides to allow it, an attacker who controls any tenant, including one compromised from a small business, can start a chat with employees of every organization left at the default. Teams blocks trial-only tenants by default (`-ExternalAccessWithTrialTenants` is `Blocked` unless changed), which removes the cheapest source of attacker tenants but not compromised paid ones.

The attacks then rely on the victim:

- **Midnight Blizzard (2023)** renamed compromised tenants with new `onmicrosoft.com` subdomains that read like security or product names, sent chat requests as support staff, triggered an MFA prompt on the victim's account, and asked them to type the displayed code into Authenticator. Microsoft's guidance: "any authentication requests not initiated by the user should be treated as malicious."
- **Storm-1811 (2024)** prepared the ground with email bombing (signing the victim up to many subscriptions), then offered to fix it. The victim only had to "press CTRL + Windows + Q and enter the security code" for Quick Assist, which is installed by default on Windows 11, and approve screen sharing; the actor then downloaded tools and later deployed Black Basta with PsExec.

The defenses, from Microsoft's own recommendations, split between the admin and the user:

- **Admin:** restrict external access to trusted domains where the business allows it; block or uninstall Quick Assist and other remote tools that aren't used; require phishing-resistant authentication through Conditional Access; let the security team manage blocked domains (a Teams setting, in preview, that feeds Defender's Tenant Allow/Block List).
- **User:** check the "External" label on the sender; never share account information or approve sign-ins in chat; only let a helper connect through Quick Assist when you started the support interaction.

For a vendor building a chat product with cross-organization messaging, the lesson is about defaults and labels. An open-federation default is a growth feature and an attack surface at once; a product that allows it needs a prominent external label on every message, a first-contact screen ("this person is outside your organization; accept or block"), admin allowlists, and a way for users to report an external sender that feeds the admin's block list.

## Phishing for Tokens

Phishing-resistant MFA stops a stolen password. The attacks above route around it by getting the victim to complete authentication for the attacker, or by stealing the session afterwards. Microsoft's token theft playbook defines the problem: attackers "compromise and replay tokens issued to a user, even if that user has satisfied multifactor authentication."

- **Device code phishing.** The device authorization flow lets a device without a keyboard sign in by showing a code the user enters elsewhere. Storm-2372 generated codes and sent them as Teams meeting invitations; victims entered them on the genuine sign-in page, and the attacker's device received access and refresh tokens. A February 14, 2025 update reported the actor switching to the Microsoft Authentication Broker client ID, which let it register a device in Entra ID, obtain a Primary Refresh Token and collect email from that device. Microsoft's advice is "blocking device code flow wherever possible" through Conditional Access.
- **MFA code relay.** Midnight Blizzard's Teams chats asked victims to type a number into Authenticator; the victim completed the attacker's sign-in.
- **Session token theft.** Okta's support system held HAR files (browser network recordings customers uploaded to troubleshoot) that contained live session tokens; the attacker used them to hijack five customers' sessions. Cloudflare detected the use of one against its own Okta instance on October 18, 2023, "more than 24 hours before we were notified of the breach by Okta."

What stops these:

- **Bind sessions to the device or network.** Okta's remediation included network-location-based session binding for its admin console, so a token used from a new network forces re-authentication; Microsoft's Conditional Access offers token protection. A token copied out of a HAR file or a browser profile then doesn't work elsewhere.
- **Disable flows nobody needs.** Device code flow is rarely required by ordinary users; block it by policy and allow it for the devices that need it.
- **Treat uploaded diagnostics as secrets.** A support system that accepts HAR files should strip cookies and authorization headers on upload; Okta's incident is the reason.
- **Revoke on suspicion, not on proof.** Revoking refresh tokens (Microsoft Graph's `revokeSignInSessions`) and wiping sessions (Slack's `admin.users.session.reset`) cost a user one sign-in; leaving a stolen token live costs the mailbox.

## OAuth Consent and App Abuse

Every workplace suite lets users and admins grant apps access to their data. Microsoft Entra's default lets "all users" consent to applications "for permissions that don't require administrator consent"; for example, a user can let an app read their mailbox but not every file in the organization. An **illicit consent grant** is an attacker's app that a user is tricked into approving: the consent screen is genuine, the app is the attacker's, and the result is an access token and usually a refresh token that keep working after a password reset.

Microsoft's incident response playbook names the permissions attackers ask for. Among delegated permissions, the "root" families misused in consent phishing are `Mail.*` (including `Mail.Send` but not `Mail.ReadBasic`), `Contacts.*`, `MailboxSettings.*`, `People.*`, `Files.*`, `Notes.*`, `Directory.AccessAsUser.All` and `user_impersonation`, and "attackers use a combination of the first six permissions in 99% of the consent phishing attacks." Application permissions (no user present, admin consent only) with write access, such as `Application.ReadWrite.All`, `Directory.ReadWrite.All` and `RoleManagement.ReadWrite.Directory`, are the highest risk.

The defenses Microsoft recommends:

- **Restrict user consent** to apps from verified publishers and to permissions the organization classifies as low impact, and turn on the admin consent workflow so users can request the rest.
- **Keep risk-based step-up on.** When Microsoft detects a risky consent request, it requires admin approval instead; this is on by default wherever user consent is allowed.
- **Review grants on a schedule,** especially `AllPrincipals` (tenant-wide) consents held by non-Microsoft apps.
- **Disable, don't delete,** a malicious app: a disabled app can't obtain new tokens, while a deleted one "might return later if another user grants consent."

Three incidents show that apps already trusted are the larger risk:

- **Microsoft, 2024.** Midnight Blizzard escalated from one test account to a legacy test OAuth app "that had elevated access to the Microsoft corporate environment," created new OAuth apps and a user to consent to them, and used the `full_access_as_app` role to read mailboxes through Exchange Web Services. Microsoft's guidance afterwards is to audit privileged apps and remove unneeded `EWS.AccessAsUser.All` and `full_access_as_app` grants.
- **Salesloft Drift, 2025.** The attacker didn't phish anyone; it stole the OAuth tokens the Drift integration held for its customers' Salesforce and Google Workspace accounts. Google's recommendation was to treat every token stored in or connected to Drift as compromised, and revoke and rotate them ([When an App's Tokens Are Stolen](/books/workplace-and-collaboration/apps-and-marketplaces#when-an-app-s-tokens-are-stolen)).
- **UNC6040, 2025.** The victim was talked into authorizing an attacker-controlled copy of Salesforce's Data Loader, often renamed to match the pretext ("My Ticket Portal"); Google's advice is to restrict who can manage connected apps and to allowlist approved ones.

For the customer's admin, the inventory of app grants is as important as the list of admins: which apps hold tenant-wide or offline access, who granted it, when it was last used. The archive and eDiscovery connections in [Capture: What an Archive Needs From the Tool](/books/workplace-and-collaboration/regulated-communications#capture-what-an-archive-needs-from-the-tool) are the most privileged of all. For the vendor, it means scopes narrow enough to grant safely, publisher verification, consent screens that say plainly what an app will read, and an API that lets an admin list, disable and revoke grants in one place.

## Secrets in Chat and Mail

Workplace content is full of credentials. Microsoft's March 2024 update said the attacker was using secrets found in exfiltrated email, "Some of these secrets were shared between customers and Microsoft in email," and contacted the affected customers. UNC6395's purpose, in Google's assessment, was "to harvest credentials": it searched exported Salesforce data for AWS access keys (`AKIA` prefixes), passwords and Snowflake tokens. Slack's own 2022 incident started with stolen employee tokens.

The countermeasures are ordinary and rarely complete:

- **Scan for secrets in messages and files,** with DLP rules for known token formats ([DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection) covers the tooling) and a prompt to rotate when one is posted.
- **Join the token-format ecosystems.** GitHub's secret scanning recognizes Slack API tokens and incoming webhook URLs, and Atlassian API tokens, among its supported patterns; a vendor that issues tokens in a recognizable format and accepts revocation reports from scanners gets leaked tokens revoked within minutes of a public push.
- **Rotate after any incident,** including secrets that only passed through the compromised mail or chat, as Microsoft did with its customers.

## When the Vendor Is the Target

Three of the incidents above went through the vendor rather than the customer, and each points at a system that holds customer access without being the product:

- **Support systems.** Okta's case system held customer-uploaded HAR files; its fix was to block personal Google profiles in Chrome on managed laptops, add detection on the support system and bind admin sessions to networks. A vendor's support tooling needs the same controls as production, and support access to customer tenants needs the controls in the playbook's [Support Access](/docs/security/support-access#delegation-not-impersonation).
- **Corporate tenants and test environments.** Microsoft's breach began in a legacy non-production test tenant without MFA, linked to production through an app. Every tenant a vendor runs, including test ones, is in scope for MFA, app review and logging.
- **Code hosts and third parties.** Slack's December 2022 incident came through a third-party vendor's compromise and reached its externally hosted GitHub; Slack's response was to invalidate the tokens, rotate credentials and add alerting on the repository.

The disclosure pattern is consistent and useful. Okta notified customers with registered security contacts and published a root cause; Microsoft filed public updates as its investigation progressed; Slack published within days. A vendor needs a security contact per customer organization, separate from billing and admin contacts, because the admin may be the account that was compromised.

## Self-Hosted Servers

The Confluence advisories are the self-hosted version of the same story. In each case Atlassian Cloud was patched by Atlassian and unaffected, while customers' own Data Center and Server instances needed patching by their admins:

- **CVE-2022-26134** (June 2, 2022): unauthenticated code execution in every supported version; Atlassian reported active exploitation.
- **CVE-2023-22515** (October 4, 2023): broken access control letting attackers create administrator accounts on internet-facing 8.x instances, rated CVSS 10, with Atlassian reporting a known nation-state actor exploiting it. CISA added it to the Known Exploited Vulnerabilities Catalog on October 5, and CISA, the FBI and MS-ISAC published AA23-289A on October 16, describing exploitation through the setup endpoint and data exfiltration with cURL and Rclone.
- **CVE-2023-22518** (October 31, 2023): improper authorization letting an unauthenticated attacker reset Confluence and create an administrator, raised to CVSS 10 on November 6 after Atlassian observed active exploits and ransomware.
- **CVE-2023-22527** (January 16, 2024): template injection giving unauthenticated code execution on out-of-date 8.x versions.

The joint advisory's response guidance is worth adopting for any self-hosted collaboration server: patch immediately or take the server off untrusted networks; if compromise is suspected, assume the attacker has full administrative access, collect artifacts, quarantine, issue new credentials and reimage, because removing malicious accounts alone may not remove persistence. The general practice of patching by exploitation risk rather than score is the playbook's [Prioritize by Risk, Not Score](/docs/security/vulnerability-management#prioritize-by-risk-not-score). For a vendor, that burden on self-hosted customers is one of the costs weighed when a product moves from servers to cloud, which [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching) covers.

## Detection

The signals that would have caught each pattern above are in the platforms' own logs, [if they're kept](/books/workplace-and-collaboration/audit-logs#the-2023-lesson-logging-as-a-security-baseline) and watched:

- **Consent and app changes.** In Microsoft 365, the "Consent to application" audit activity, with `IsAdminConsent` true for tenant-wide grants; new app registrations and credentials; apps granted mailbox-wide roles.
- **Sign-in anomalies.** Device code sign-ins, sign-ins from new devices or networks, anomalous token detections, and password spray patterns. Microsoft notes that Midnight Blizzard's residential proxies made IP-based indicators "infeasible," so behavioral detections matter more than IP lists.
- **Persistence moves.** New MFA methods or devices on an account, new inbox forwarding rules, new or reactivated users, MFA policy changes, and support-initiated events, which is Cloudflare's monitoring list for Okta.
- **Data movement.** Mass or unusual file downloads, large exports, unusual Exchange Web Services activity by an app, or large queries through a connected app.
- **External contact.** First-contact chats from external tenants, especially newly created or renamed ones, and users reporting external senders.

CISA's SCuBA project publishes secure configuration baselines for Microsoft 365 and Google Workspace, with two free assessment tools (ScubaGear for Microsoft 365 and ScubaGoggles for Google Workspace) that check a tenant's settings against them. Running one of them is the fastest way for an admin to find which of the defaults above are still in place.

## Responding in a Workspace

A compromise in a collaboration tenant follows the playbook's [Incident Response](/docs/operations/incident-response), with containment steps specific to these products. The order matters: cut live access first, then remove persistence, then rotate what the attacker could have read.

1. **Scope.** Which accounts, apps and tokens; from the audit log, which containers were read or exported and when. If auditing wasn't on before the attack, Microsoft's playbook warns, "you won't be able to investigate."
2. **Cut sessions.** Revoke refresh tokens and sessions for affected users (Graph `revokeSignInSessions`; Slack `admin.users.session.reset`, which "wipes all valid sessions on all devices for a given user" on Enterprise plans), reset passwords, and block the attacker's network where it's stable.
3. **Disable apps and grants.** Disable malicious or compromised apps rather than deleting them, revoke their grants, and revoke and rotate tokens held by any integration involved, including archive and DLP connections.
4. **Remove persistence.** Delete MFA methods and devices the attacker added, inbox rules and forwarding, new users and app credentials, and roll back changes made by compromised admins.
5. **Rotate exposed secrets.** Search the mail, chat and files the attacker reached for credentials and rotate them; tell customers or partners whose secrets were in those messages.
6. **Notify.** The customer organization, as controller, decides on notifications to regulators and individuals ([Breach Notification](/docs/compliance/gdpr#breach-notification)); the vendor notifies affected customers through their security contacts when the incident is on its side.
7. **Harden.** Close the default that let it happen: external access, user consent, device code flow, remote-assistance tools, session binding.

## How to Build It

The vendor builds the controls and the response surface the customer's admins use. Audit events themselves belong to [Audit Logs](/books/workplace-and-collaboration/audit-logs); this chapter adds alerts, incidents, response actions and app-grant facts to the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model):

```sql
-- consent_kind and the publisher's verification come from Apps & Marketplaces;
-- approved_by (the admin who granted it) and api_tokens.revoked_at are core
ALTER TABLE app_installations
  ADD COLUMN risk_level       TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN disabled_at      TIMESTAMPTZ,    -- disabled, not deleted, so it can't be re-consented
  ADD COLUMN last_used_at     TIMESTAMPTZ;

ALTER TABLE api_tokens
  ADD COLUMN bound_to         JSONB,          -- {"network": "...", "device_id": "..."} when bound
  ADD COLUMN last_used_ip     INET,
  ADD COLUMN revoked_reason   TEXT CHECK (revoked_reason IN ('user', 'admin', 'incident',
                                'leak_report', 'expired', 'app_disabled'));

CREATE TABLE security_contacts (         -- who the vendor tells when an incident is on its side
  organization_id UUID NOT NULL REFERENCES organizations (id),
  email           TEXT NOT NULL,
  verified_at     TIMESTAMPTZ,
  PRIMARY KEY (organization_id, email)
);

CREATE TABLE security_alerts (           -- detections over audit events, for the customer's admins
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  rule            TEXT NOT NULL,          -- 'admin_consent_new_app', 'device_code_signin',
                                          -- 'external_first_contact_burst', 'mass_download',
                                          -- 'mfa_method_added', 'inbox_forward_rule', 'leaked_token'
  severity        TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  subject_type    TEXT NOT NULL,          -- 'member', 'app_installation', 'api_token', 'container'
  subject_id      UUID NOT NULL,
  evidence_event_ids UUID[] NOT NULL,     -- audit_events rows that triggered it
  status          TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'dismissed', 'escalated')),
  incident_id     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_incidents (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID REFERENCES workspaces (id),   -- null for a vendor-side incident
  side            TEXT NOT NULL CHECK (side IN ('customer', 'vendor')),
  severity        TEXT NOT NULL,
  opened_by       TEXT NOT NULL,
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  contained_at    TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  summary         TEXT
);

ALTER TABLE security_alerts
  ADD CONSTRAINT security_alerts_incident_fk FOREIGN KEY (incident_id) REFERENCES security_incidents (id);

CREATE TABLE incident_actions (          -- every containment step, so the response itself is auditable
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_id     UUID NOT NULL REFERENCES security_incidents (id),
  action          TEXT NOT NULL CHECK (action IN ('revoke_sessions', 'reset_password',
                    'disable_app', 'revoke_grant', 'revoke_token', 'remove_mfa_method',
                    'remove_device', 'remove_inbox_rule', 'block_external_domain',
                    'quarantine_item', 'notify_customer')),
  target_type     TEXT NOT NULL,
  target_id       UUID NOT NULL,
  performed_by    UUID REFERENCES members (id),     -- null when automated
  performed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  result          TEXT NOT NULL CHECK (result IN ('done', 'failed', 'partial'))
);
```

The question an admin asks first in an app-abuse incident, as a query:

```sql
-- Apps holding tenant-wide or high-risk access, who granted it, and whether they're still used
SELECT ai.id, a.name, ai.consent_kind, ai.approved_by,
       a.publisher_verified_at IS NOT NULL AS publisher_verified, ai.risk_level,
       ai.last_used_at, array_agg(DISTINCT t.scopes) AS scopes
FROM app_installations ai
JOIN apps a ON a.id = ai.app_id
LEFT JOIN api_tokens t ON t.app_installation_id = ai.id AND t.revoked_at IS NULL
WHERE ai.workspace_id = $1
  AND ai.disabled_at IS NULL
  AND (ai.consent_kind = 'admin' OR ai.risk_level IN ('high', 'critical'))
GROUP BY ai.id, a.name
ORDER BY ai.risk_level DESC NULLS LAST, ai.last_used_at DESC NULLS LAST;
```

Notes on the sketch:

- **One action revokes everything for a user.** `revoke_sessions` ends web, desktop and mobile sessions and revokes refresh tokens, the way Slack's session reset and Graph's revocation do; it is idempotent and safe to run on suspicion.
- **Disabling an app is a state, not a deletion.** `disabled_at` blocks new tokens and new consents to the same app id, which is Microsoft's reason to disable rather than delete.
- **Leaked-token reports revoke automatically.** A report from a secret scanner matching an active token sets `revoked_reason = 'leak_report'`, raises a `leaked_token` alert and notifies the token's owner and admins.
- **Bound tokens fail closed.** A token with `bound_to` used from another network or device is rejected and raises an alert instead of silently working.
- **Vendor-side incidents reach security contacts.** `security_incidents.side = 'vendor'` notifications go to `security_contacts`, not to admins whose accounts may be the compromised ones.
- **Events:** `security_alert.created`, `incident.opened`, `incident_action.performed`, `app_installation.disabled` and `api_token.revoked` go to the customer's SIEM through the audit stream.

## Auditing

- **Every app grant,** user or admin, its scopes, who granted it and when, its last use, and its disablement.
- **Every token revocation** and its reason, including automated revocations from leak reports.
- **Every alert** with the audit events that triggered it and what happened to it.
- **Every incident action,** who or what performed it, on what, with what result, so the response can be reviewed in the postmortem.
- **Configuration that changes exposure:** external access settings, user consent policy, sign-in flows allowed, session binding, remote-assistance tooling where the vendor manages it.
- **Vendor-side support access** to customer tenants, with reasons and durations ([Logging Support Access](/docs/security/support-access#logging-support-access)).

## What This Means for the System You Build

- **Label external senders on every message** and put a first-contact screen in front of chats from outside the organization; give admins allowlists and a user-report path into the block list.
- **Ship narrow scopes, publisher verification and an admin consent workflow,** and let admins restrict user consent to low-impact permissions.
- **Bind sessions and tokens** to device or network where possible, and let admins revoke every session for a user in one call.
- **Let admins turn off flows nobody needs,** device code first.
- **Inventory every app grant** with who granted it and when it was last used, and disable rather than delete.
- **Revoke leaked tokens automatically** from scanner reports, in a token format scanners recognize.
- **Secure the vendor's own support, test and code systems** like production, and keep a security contact per customer.
- **For self-hosted products, assume exploitation within days** of an advisory and make patching and isolation easy.

## References

**Vendor write-ups**

- [Microsoft Threat Intelligence: Midnight Blizzard social engineering over Microsoft Teams (August 2, 2023)](https://www.microsoft.com/en-us/security/blog/2023/08/02/midnight-blizzard-conducts-targeted-social-engineering-over-microsoft-teams/), renamed tenants, MFA code prompts, fewer than 40 organizations, sectors and mitigations
- [Microsoft Threat Intelligence: Threat actors misusing Quick Assist (May 15, 2024)](https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/), Storm-1811, email bombing, Quick Assist, the Teams update, Black Basta and mitigations
- [Microsoft Threat Intelligence: Storm-2372 device code phishing (February 13, 2025)](https://www.microsoft.com/en-us/security/blog/2025/02/13/storm-2372-conducts-device-code-phishing-campaign/), the technique, the Authentication Broker update, the Midnight Blizzard assessment and mitigations
- [Microsoft: Actions following attack by Midnight Blizzard (January 19, 2024)](https://www.microsoft.com/en-us/msrc/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard), dates, password spray on a legacy test tenant account and email accessed
- [Microsoft: Midnight Blizzard guidance for responders (January 25, 2024)](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/), the OAuth app escalation, `full_access_as_app`, residential proxies and detection guidance
- [Microsoft: Update on Midnight Blizzard (March 8, 2024)](https://www.microsoft.com/en-us/msrc/blog/2024/03/update-on-microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard), source code access, tenfold password sprays and secrets shared in email
- [Okta: Unauthorized access to Okta's support case management system, root cause (November 3, 2023)](https://sec.okta.com/articles/2023/11/unauthorized-access-oktas-support-case-management-system-root-cause), the service account, dates, 134 customers, HAR files, five hijacked sessions, detection and remediation
- [Okta: HAR files incident follow-up](https://sec.okta.com/harfiles), the related posts and the forensic confirmation
- [Cloudflare: How Cloudflare mitigated yet another Okta compromise](https://blog.cloudflare.com/how-cloudflare-mitigated-yet-another-okta-compromise/), October 18, 2023 detection, hardware MFA and monitoring recommendations
- [Slack: Slack security update (December 31, 2022)](https://slack.com/blog/news/slack-security-update), stolen employee tokens, the GitHub repositories and response
- [Google Threat Intelligence: Voice phishing and data extortion (June 4, 2025)](https://cloud.google.com/blog/topics/threat-intelligence/voice-phishing-data-extortion), UNC6040, the modified Data Loader, lateral movement and recommendations
- [Google Threat Intelligence: Data theft from Salesforce via Salesloft Drift](https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift), UNC6395, dates, stolen OAuth tokens, credential harvesting, the Workspace update and recommendations

**Advisories**

- [Atlassian: Confluence security advisory 2022-06-02 (CVE-2022-26134)](https://confluence.atlassian.com/doc/confluence-security-advisory-2022-06-02-1130377146.html), OGNL injection, affected versions, Cloud unaffected and active exploitation
- [Atlassian: CVE-2023-22515](https://confluence.atlassian.com/security/cve-2023-22515-broken-access-control-vulnerability-in-confluence-data-center-and-server-1295682276.html), date, CVSS 10, affected and fixed versions, nation-state exploitation and Cloud unaffected
- [Atlassian: CVE-2023-22518](https://confluence.atlassian.com/security/cve-2023-22518-improper-authorization-vulnerability-in-confluence-data-center-and-server-1311473907.html), date, the severity increase, ransomware reports and Cloud unaffected
- [Atlassian: CVE-2023-22527](https://confluence.atlassian.com/security/cve-2023-22527-rce-remote-code-execution-vulnerability-in-confluence-data-center-and-confluence-server-1333990257.html), date, template injection RCE, affected versions and Cloud unaffected
- [CISA, FBI and MS-ISAC: AA23-289A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-289a), exploitation of CVE-2023-22515, the KEV date, exfiltration tools and response guidance
- [CISA: Secure Cloud Business Applications (SCuBA)](https://www.cisa.gov/resources-tools/services/secure-cloud-business-applications-scuba-project), baselines for Microsoft 365 and Google Workspace and the ScubaGear and ScubaGoggles tools

**Vendor documentation**

- [Microsoft Learn: Manage external meetings and chat](https://learn.microsoft.com/en-us/microsoftteams/trusted-organizations-external-meetings-chat), the all-domains default, allow and block options, unmanaged accounts, trial tenants, blocked users and Defender-managed blocked domains
- [Microsoft Learn: Configure how users consent to applications](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent), the default user consent, verified-publisher and low-impact policies and the admin consent workflow
- [Microsoft Learn: App consent grant investigation](https://learn.microsoft.com/en-us/security/operations/incident-response-playbook-app-consent), illicit consent grants, risky permissions and the 99% observation, audit events, risk-based step-up and disabling apps
- [Microsoft Learn: Token theft playbook](https://learn.microsoft.com/en-us/security/operations/token-theft-playbook), the definition of token theft, detections, containment and remediation steps
- [Slack: admin.users.session.reset](https://docs.slack.dev/reference/methods/admin.users.session.reset), wiping a user's sessions, its scope, Enterprise availability and parameters
- [GitHub Docs: Supported secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns), Slack and Atlassian token patterns
