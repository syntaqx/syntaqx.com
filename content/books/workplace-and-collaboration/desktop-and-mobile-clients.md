+++
title = "Desktop & Mobile Clients"
description = "Electron and WebView2 desktop clients, update cadence and version floors, enterprise packaging (MSIX, MDM), app protection on phones, and push under OS limits."
category = "Workplace & Collaboration Industry"
order = 2061
part = "Running the Platform"
tags = ["desktop", "mobile", "electron", "mdm", "push-notifications"]
+++

Collaboration clients are open all day. A chat or meetings app starts with the machine, holds a connection for eight or ten hours, keeps hundreds of conversations and files cached, draws notifications over whatever the user is doing, and is expected to cost little memory while it does. On the phone it must deliver a message within seconds while the operating system does everything it can to keep it asleep. That alone makes client engineering hard. The workplace twist adds a second customer: the IT department that packages the client, decides when it updates, wraps it in mobile app protection, blocks it on jailbroken phones, and pins it to the organization's own domain. The end user picks a consumer app; the customer's admin deploys a workplace one.

This chapter covers why the desktop clients are mostly web technology in a native shell (Slack on Electron, the new Teams on WebView2), the memory and startup budgets that pushed both through rewrites, how auto-update works and why vendors refuse to let clients get old, the enterprise packaging and policy surface (MSIX, MSI, Intune, Group Policy, app configuration), mobile app management without device enrollment, and push delivery under Android's and iOS's background limits. It adds client releases, version floors and installs to the core data model. The playbook covers the generic pieces: [Mobile Releases](/docs/delivery/mobile-releases), [Software Updates](/docs/security/software-updates), [Offline Sync](/docs/architecture/offline-sync) and [Push Notifications](/docs/architecture/notifications#push-notifications).

## How the Platforms Do It

| Vendor | Desktop technology | Update model, as of October 2026 | Enterprise deployment | Mobile management |
| --- | --- | --- | --- | --- |
| **Slack** | Electron; rebuilt in 2019 as a React app with one Redux store per workspace in a single process | Automatic by default; admins can disable with the `AutoUpdate` setting and pick a release channel with `ReleaseChannel` | MSIX per user (`Add-AppxPackage`) or for all users (`Add-AppxProvisionedPackage`), via Configuration Manager, Intune, DISM or Group Policy; AppInstaller files to control or roll back versions | EMM on Enterprise Grid and Enterprise+: AppConfig keys (`OrgDomain`, `ApprovedDevice`, `DisableCopy`, `BrowserControl`), "Slack for EMM" or "Slack for Intune" only |
| **Microsoft Teams** | New Teams on WebView2; classic Teams end of support July 1, 2024, end of availability July 1, 2025 | Released twice a month, staged worldwide; in-app alert at one to three months old, blocking page beyond three months; critical updates out of band | `teamsbootstrapper.exe -p` provisions the MSIX for all users, online or offline from a local or UNC path; Intune, Configuration Manager, Group Policy; Microsoft AutoUpdate on Mac | Intune app protection policies, with or without device enrollment |
| **Electron apps generally** | Chromium plus Node.js | `autoUpdater` built on Squirrel.Mac and Squirrel.Windows, or the MSIX updater; macOS apps must be signed; no built-in Linux updater | Vendor-specific installers | Not applicable |

Three patterns:

- **Web technology won the desktop.** Both of the largest chat clients render with a browser engine, and both shipped a web version from the same code. What the vendors compete on is memory, startup and integration with the operating system, not the rendering technology.
- **Vendors make old versions stop working.** Teams shows a blocking page to clients more than three months old. A client is part of the service: the server can only drop old API behavior, fix protocol bugs and ship security fixes if the fleet moves with it.
- **The admin controls the update channel, not whether updates happen.** Slack lets an admin disable auto-update and choose a channel; Teams lets admins manage update behavior through policies and rings, but under the Modern Lifecycle Policy "users should remain on the most up-to-date version." The compromise is a delay the admin chooses, with a floor the vendor enforces.

## Why the Desktop Is a Browser

A collaboration product has to run in a browser anyway: guests, contractors, kiosk machines and locked-down desktops can't install anything. Once the web app exists, a desktop shell around it gets the vendor native notifications, a tray icon, start at login, deep links, screen sharing, file system access and a dock badge with most of the code shared. Electron bundles Chromium and Node.js into the app; WebView2 uses the Edge engine already on Windows (Teams updates it itself on macOS).

The costs are memory and startup. Slack's 2019 rewrite is the clearest public account of paying them down. The old client ran each signed-in workspace in a "separate Electron process," so a user in five workspaces ran five copies of the app. The new one put each workspace in its own Redux store, holding its data, connectivity status and WebSocket, inside one process, required React for all UI, and loaded data lazily so the client could start with incomplete data. The team didn't rewrite in a branch: it built a "modern" directory alongside the legacy code, with an interop layer in both directions, and shipped features into the new code one at a time, starting with the emoji picker. Memory usage was the primary metric. Microsoft's replacement of classic Teams with the new Teams, built on WebView2, aimed at the same budgets; Microsoft's admin overview describes the new client as installing and loading quickly with "low memory and disk usage."

The workplace-specific requirement in both rewrites is **multiple tenants in one client**. People belong to several workspaces or tenants (their employer's, a client's through a guest account, a community's), and switching between them must be fast while keeping them strictly apart: separate tokens, separate caches, separate policy (one tenant may forbid file downloads; another may not), separate notification settings. The architecture rule follows: the client holds one isolated context per tenant, and nothing (caches, search indexes, clipboard handling, logs) is shared between contexts without the policy of both tenants allowing it.

## Budgets: Memory, Startup and Boot

A client that runs all day needs budgets, measured in production telemetry per version, and enforced in release gates ([Release Health Gates](/docs/delivery/mobile-releases#release-health-gates)):

- **Memory at steady state,** per signed-in tenant, after hours of use. Leaks in a long-running app are the common failure: listeners not removed when a channel is closed, caches without bounds, images kept decoded.
- **Cold start to usable,** meaning the user can read the last-viewed conversation and type. The client paints from its local cache first and reconciles with the server after.
- **Boot payload.** The server call that loads a user's channels, preferences and unread state on connect. Both Slack incident reviews in [Reliability, Outages & SLAs](/books/workplace-and-collaboration/reliability-and-outages#what-the-incident-reviews-teach) turn on it: Slack describes boot as where channel lists, preferences and recent conversations are fetched and cached, and Slack isn't usable until it completes. Boot should be small, incremental (send what changed since the client's last sync token) and safe to throttle.
- **Reconnect behavior.** After a network change, sleep or server restart, every client reconnects; with jitter and backoff, the fleet arrives over minutes instead of seconds ([Reconnecting Without a Stampede](/docs/architecture/realtime-connections#reconnecting-without-a-stampede)).

## Offline Caches

Desktop and mobile clients keep a local store per tenant: recent messages, the channel list, drafts, unsent messages in an outbox, and file previews. The mechanics are the playbook's ([A Scoped Local Store](/docs/architecture/offline-sync#a-scoped-local-store), [The Device Outbox](/docs/architecture/offline-sync#the-device-outbox)). The workplace constraints come from the customer's policies:

- **Retention reaches the device.** When an admin sets a retention policy that deletes messages after 90 days, cached copies on laptops and phones must go too, on the next sync.
- **Sign-out and deactivation wipe the cache.** An offboarded employee's laptop must drop the tenant's data when the server revokes the session, and a mobile app under app protection can be selectively wiped by the admin.
- **Encryption at rest on the device,** with keys bound to the signed-in session, so a lost laptop with a revoked session is unreadable.
- **Downloads are a policy.** Some tenants block file downloads or copying on unmanaged devices; the client honors the policy per tenant, not per install.

## Auto-Update and Version Floors

Workplace clients update far more often than traditional enterprise software. Teams releases twice a month, after validation through Microsoft's Technology Adoption Program, staggered worldwide; critical updates bypass the schedule. On Windows it checks at startup and every few hours, downloads only the delta through Windows Delivery Optimization, and applies the update on restart, automatically when the app is idle; on Mac it uses Microsoft AutoUpdate and waits for the user to quit. Electron's built-in updater uses Squirrel on macOS and Windows (or the MSIX updater for MSIX packages) and requires the macOS app to be signed.

The vendor's side of this is a policy with three numbers per platform:

- **The current version** offered to clients in each channel (beta, general, delayed).
- **The warning floor,** below which the client nags (Teams: one to three months old).
- **The blocking floor,** below which the client stops working and points to the web app (Teams: more than three months old).

The blocking floor is what lets the server retire old behavior. It must be announced to admins in advance, because an enterprise that has frozen updates for a quarter will find its users blocked on the same morning. The customer's lever is the delay within the vendor's window: a ring of pilot users on the early channel, everyone else on general, and nobody past the floor. [Minimum Supported Versions and Forced Upgrades](/docs/delivery/mobile-releases#minimum-supported-versions-and-forced-upgrades) covers the general rules, and [Software Updates](/docs/security/software-updates) the signing and rollback-resistance an updater needs.

Common enterprise failures, all from Microsoft's own troubleshooting list, show how the customer's environment breaks updates: Delivery Optimization disabled or set to an unsupported mode, network rules that block the vendor's CDN, SSL inspection on the update endpoints ("known to cause high update download failure rate"), users altering files in the package directory, and out-of-support operating systems. The vendor's client should report its update failures to the admin console so IT sees a broken updater before users hit the blocking floor.

## Enterprise Packaging and Policy

The customer's IT team deploys workplace clients the way it deploys any software, which means the vendor must ship in the formats IT uses and expose settings IT can set centrally.

- **Machine-wide provisioning.** Teams' bootstrapper "installs the Teams application for all users on the computer, and any users who may be added afterwards," with an offline option from a local or UNC path to save bandwidth. Slack's MSIX can be registered per user or provisioned for all accounts on the machine. Machine-wide installs matter for shared PCs, VDI and labs.
- **Distribution tools.** Intune, Configuration Manager, Group Policy and third-party distribution all appear in both vendors' guides. On Mac, configuration profiles push managed preferences.
- **Centrally set preferences.** Slack's desktop app configuration controls auto-update, release channel and other settings; Teams' Mac client reads managed Microsoft AutoUpdate preferences, and government tenants set the cloud endpoint through a registry key or plist (`CloudType`, with values for Commercial, GCC, GCC High, DoD and Gallatin) so the client never contacts the wrong cloud before sign-in.
- **Virtual desktops.** VDI needs its own builds and media optimization, and has its own timelines; Microsoft's end of support for classic Teams in VDI came three months after native clients (October 1, 2024) with the same end of availability.

The design rule for a vendor: every setting an admin would want to force (update channel, sign-in domain, cloud endpoint, download restrictions, telemetry level) exists as a managed preference read at startup, documented with its key and values, and visible in the client's diagnostics so IT can confirm it took effect.

## Mobile: Managed Apps on Unmanaged Phones

Most employees read work chat on their own phones. The customer wants its data protected there without managing the person's device, and the industry's answer is app-level management.

Microsoft Intune's app protection policies "ensure an organization's data remains safe or contained in a managed app," and can be used "independent of any mobile-device management (MDM) solution." They require a PIN or biometric to open the work context, restrict cut, copy and paste and "save copies of org data" to approved locations, block managed apps on jailbroken or rooted devices, encrypt corporate data, and allow a selective wipe that removes company data without touching the rest of the phone; the SDK checks for a wipe request every 30 minutes while the app is in use and at sign-in. Policies apply only in the work context: a multi-identity app with personal and work accounts protects only the work one. Apps join by integrating the Intune SDK or being wrapped by the App Wrapping Tool.

Slack's EMM offering, available on Enterprise Grid and Enterprise+, works through AppConfig keys pushed by the customer's EMM: `OrgDomain` restricts the managed app to the organization's Slack, `ApprovedDevice` limits access to enrolled devices, `DisableCopy` blocks downloads and message copying, `BrowserControl` sends links to a managed browser. The admin can require "Slack for EMM" or "Slack for Intune" so "login will be blocked for any other version of the Slack app"; members on the regular app are signed out within 12 hours.

The inversion is plain here: on a consumer app the device owner decides what the app may do; on a workplace app the employer decides what its data may do inside an app on someone else's phone. A vendor building a mobile client needs a policy surface for that (per tenant, delivered at sign-in, re-checked periodically) and a wipe that is selective by tenant. Device and session policy as a whole is covered in Admin Consoles & Policies.

## Push Under the Operating System's Rules

Mobile workplace clients rely on push to wake them, and the operating systems ration that. On Android, Firebase Cloud Messaging delivers normal-priority messages "immediately when the device is not sleeping," but during Doze "delivery may be delayed to conserve battery." High priority lets FCM "wake a sleeping device when necessary," and is recommended for chat messages, but it is meant for user-visible content: if high-priority messages don't produce notifications, "your messages may be deprioritized to normal priority," judged over 7 days per app instance, and messages sent while the user has disabled notifications count against the app. iOS also leaves the timing of silent background pushes to the system.

The consequences for a collaboration product:

- **Send a visible notification for anything that should wake the phone,** carrying enough content (or a fetch hint) to render the notification without a background sync. Silent pushes are for opportunistic cache refresh only.
- **Decide on the server what deserves a push.** Mentions, DMs and keywords, filtered by the user's notification schedule and do-not-disturb, and suppressed when the user is active on another device. The attention model is the subject of Notifications, Presence & Attention.
- **Respect the tenant in the payload.** Lock-screen previews can leak message content; workplace clients let the admin hide previews for a tenant, so the push carries a generic body and the app fetches the content after unlock.
- **Keep the registration current.** Push tokens rotate and devices change hands; an install's token is replaced on refresh and deleted on sign-out or wipe.

## How to Build It

The core tables (`accounts`, `members`, `workspaces`, `audit_events`) are fixed by the core data model. This chapter adds client releases with version floors, tenant client policy, and the installs that tie a device to a member.

```sql
CREATE TABLE client_releases (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  platform      TEXT NOT NULL CHECK (platform IN ('windows', 'macos', 'linux', 'ios',
                  'android', 'web')),
  version       TEXT NOT NULL,              -- '26.10.2'
  channel       TEXT NOT NULL CHECK (channel IN ('beta', 'general', 'delayed')),
  released_at   TIMESTAMPTZ NOT NULL,
  critical      BOOLEAN NOT NULL DEFAULT FALSE,   -- bypasses staged rollout
  rollout_pct   SMALLINT NOT NULL DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  min_os        TEXT,
  artifact_sha256 TEXT,                     -- signed package digest
  UNIQUE (platform, version)
);

CREATE TABLE client_version_floors (        -- vendor-wide, effective-dated
  platform      TEXT NOT NULL,
  warn_below    TEXT NOT NULL,              -- versions below this see an alert
  block_below   TEXT NOT NULL,              -- versions below this are refused
  effective_at  TIMESTAMPTZ NOT NULL,
  announced_at  TIMESTAMPTZ NOT NULL,       -- to admins, before it takes effect
  PRIMARY KEY (platform, effective_at),
  CHECK (announced_at < effective_at)
);

CREATE TABLE workspace_client_policies (    -- what the customer's admin set
  workspace_id        UUID PRIMARY KEY REFERENCES workspaces (id),
  update_channel      TEXT NOT NULL DEFAULT 'general',
  allowed_mobile_apps TEXT NOT NULL DEFAULT 'any' CHECK (allowed_mobile_apps IN
                        ('any', 'managed_only', 'intune_only')),
  require_managed_device BOOLEAN NOT NULL DEFAULT FALSE,
  block_downloads_unmanaged BOOLEAN NOT NULL DEFAULT FALSE,
  hide_push_previews  BOOLEAN NOT NULL DEFAULT FALSE,
  device_cache_days   INT,                  -- bound on offline history
  session_max         INTERVAL,             -- forced sign-out on mobile
  updated_by          UUID NOT NULL REFERENCES members (id),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE client_installs (              -- one app instance on one device
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  platform        TEXT NOT NULL,
  version         TEXT NOT NULL,
  package_kind    TEXT CHECK (package_kind IN ('store', 'msix_user', 'msix_machine',
                    'msi', 'dmg', 'vdi', 'browser')),
  managed         BOOLEAN NOT NULL DEFAULT FALSE,  -- reported by MDM/MAM attestation
  app_variant     TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'emm', 'intune'
  push_provider   TEXT CHECK (push_provider IN ('fcm', 'apns', 'wns')),
  push_token      TEXT,
  last_seen_at    TIMESTAMPTZ NOT NULL,
  update_error    TEXT,                     -- last updater failure, for the admin console
  wiped_at        TIMESTAMPTZ,
  UNIQUE (push_provider, push_token)
);

CREATE TABLE client_install_workspaces (    -- the tenants signed in on that install
  install_id    UUID NOT NULL REFERENCES client_installs (id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members (id),
  signed_in_at  TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,                -- sign-out, deactivation or selective wipe
  PRIMARY KEY (install_id, member_id)
);
```

At connect, the server decides whether this client may proceed, for this tenant:

```sql
-- $1: install id, $2: member id, $3: reported version
SELECT
  CASE
    WHEN string_to_array($3, '.')::int[] <
         string_to_array(f.block_below, '.')::int[] THEN 'block'
    WHEN p.allowed_mobile_apps = 'intune_only' AND i.app_variant <> 'intune'
         AND i.platform IN ('ios', 'android') THEN 'block'
    WHEN p.require_managed_device AND NOT i.managed THEN 'block'
    WHEN string_to_array($3, '.')::int[] <
         string_to_array(f.warn_below, '.')::int[] THEN 'warn'
    ELSE 'ok'
  END AS decision
FROM client_installs i
JOIN members m ON m.id = $2
LEFT JOIN workspace_client_policies p ON p.workspace_id = m.workspace_id
JOIN LATERAL (
  SELECT * FROM client_version_floors
  WHERE platform = i.platform AND effective_at <= now()
  ORDER BY effective_at DESC LIMIT 1
) f ON TRUE
WHERE i.id = $1;
```

Notes on the sketch:

- **Policy is per tenant, enforced per connection.** One install may hold a tenant that requires managed devices and another that doesn't; the decision is made per member, so the client keeps working for one and blocks the other.
- **Floors are announced before they bite.** The `CHECK` keeps a floor from taking effect without an announcement; a job posts it to every affected tenant's admin feed (the same channel as [maintenance notices](/books/workplace-and-collaboration/reliability-and-outages#maintenance-windows-and-change-notice)) with the count of their installs below it.
- **Admins see the fleet.** A tenant's install inventory (versions, managed state, update errors) is a query over `client_installs` joined through `client_install_workspaces`, which is what an admin needs before a floor arrives.
- **Revocation reaches the device.** Deactivating a member or a selective wipe sets `revoked_at`; the next connection or push tells the client to delete that tenant's cache and tokens, and the push token is dropped if no tenant remains.
- **Push tokens are unique.** A token that moves to a new install (a reinstall, a device handed to someone else) moves with it; the old row loses it.
- **Events:** `client.blocked`, `client.update_failed`, `client.wiped` and `client.policy_changed` go to `audit_events` and the admin console.

## What This Means for the System You Build

- **Ship one web codebase in a thin desktop shell,** and spend the effort on memory, startup and OS integration.
- **Isolate tenants inside the client:** separate stores, tokens, caches and policy per signed-in workspace, in one process.
- **Budget memory, cold start and the boot payload** per release, from production telemetry.
- **Update often, stage worldwide, and enforce a warning and a blocking floor** announced to admins in advance.
- **Give IT the formats and settings it uses:** machine-wide MSIX, offline install, managed preferences for every setting an admin would force.
- **Support app-level protection on unmanaged phones,** with per-tenant policy and selective wipe.
- **Make every push that should wake the phone visible,** decide on the server what deserves one, and let admins hide previews.
- **Make retention, sign-out and deactivation reach the device cache.**

## References

**Vendor documentation**

- [Slack Help Center: Deploy Slack via Microsoft Installer](https://slack.com/help/articles/212475728-Deploy-Slack-via-Microsoft-Installer), MSIX per-user and all-users installs, deployment tools, AutoUpdate and ReleaseChannel settings, AppInstaller behavior
- [Slack Help Center: Manage Slack with enterprise mobility management](https://slack.com/help/articles/115002579426-Manage-Slack-with-enterprise-mobility-management-EMM), plan availability, device app policies, AppConfig keys and sign-out timing
- [Microsoft Learn: Overview of the Microsoft Teams client](https://learn.microsoft.com/en-us/microsoftteams/new-teams-desktop-admin), platforms, deployment options, update management, the Modern Lifecycle Policy and in-app alerts
- [Microsoft Learn: Teams updates](https://learn.microsoft.com/en-us/microsoftteams/teams-client-update), twice-monthly releases, staged rollout, critical updates, the three-month blocking page, Windows and Mac update mechanics, WebView2 and common update failures
- [Microsoft Learn: End of availability for classic Teams client](https://learn.microsoft.com/en-us/microsoftteams/teams-classic-client-end-of-availability), end of support and end of availability dates for native and VDI clients
- [Microsoft Learn: Bulk deploy the Microsoft Teams desktop client](https://learn.microsoft.com/en-us/microsoftteams/new-teams-bulk-install-client), teamsbootstrapper provisioning, offline MSIX install, prerequisites and the CloudType setting
- [Microsoft Learn: App protection policies overview](https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy), app-level protection without enrollment, data relocation and access settings, multi-identity, selective wipe and the 30-minute check
- [Electron: autoUpdater](https://www.electronjs.org/docs/latest/api/auto-updater), Squirrel.Mac and Squirrel.Windows, the MSIX updater, macOS signing and no built-in Linux support
- [Firebase: Set and manage Android message priority](https://firebase.google.com/docs/cloud-messaging/android-message-priority), normal and high priority, Doze, deprioritization of non-visible high-priority messages over 7 days

**Engineering write-ups**

- [Slack Engineering: Rebuilding Slack on the desktop (July 22, 2019)](https://slack.engineering/rebuilding-slack-on-the-desktop/), one Electron process per workspace before, one Redux store per workspace after, React, lazy data, the modern and legacy-interop approach, memory as the primary metric
- [Slack Engineering: Slack's incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/), client boot as the step that fetches channel lists, preferences and recent conversations
