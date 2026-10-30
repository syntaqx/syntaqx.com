+++
title = "Encryption & Customer-Managed Keys"
nav_title = "Encryption & Customer Keys"
description = "Slack EKM, Atlassian CMK, Microsoft Customer Key and Double Key Encryption, Google client-side encryption, Zoom E2EE and Box KeySafe, and what each gives up."
category = "Workplace & Collaboration Industry"
order = 2050
part = "Security and Compliance"
tags = ["workplace", "encryption", "key-management", "e2ee", "security"]
+++

Every serious workplace vendor encrypts customer data in transit and at rest. That stopped being a differentiator years ago; Slack's trust page simply says customer data "is encrypted at rest and in transit by default," and Microsoft's says Microsoft 365 data "is always encrypted at rest" with BitLocker and its Distributed Key Manager. The question enterprise buyers actually ask is who holds the keys, and what the service can still do with the plaintext when they don't.

The answers form a ladder:

1. **Provider-managed keys.** The vendor generates, stores and uses every key. Protects against stolen disks and storage-layer mistakes; the vendor can read everything.
2. **Customer-managed root keys** (Slack EKM, Atlassian CMK, Microsoft Customer Key, Box KeySafe). The vendor's data keys are wrapped by a key in the customer's own cloud KMS. The service still decrypts to work, but only while the customer allows it, and every use can be logged in the customer's account. Revoking the key cuts the service off.
3. **Client-side or double-key encryption** (Google Workspace CSE, Microsoft Double Key Encryption). Content is encrypted on the user's device with a key the vendor never holds. The service stores ciphertext and can't search, scan, preview or summarize it.
4. **End-to-end encryption** (Zoom's E2EE meetings). Keys are generated on participants' devices; the server relays what it can't read.

Each rung up protects against more parties, the vendor included, and gives up more of what makes a collaboration product useful: search, previews, co-authoring, malware scanning, DLP, eDiscovery, AI. That trade, and who decides it, is the subject of this chapter. In the customer-controlled model this volume describes, the customer's admin chooses the rung per workspace, label or meeting; the vendor's job is to make each rung's consequences explicit. The cryptographic machinery (envelope encryption, key hierarchies, rotation, crypto-shredding) is the playbook's [Encryption at Rest](/docs/security/encryption-at-rest); consumer end-to-end messaging and its effect on safety work is [Encryption](/books/user-generated-platforms/real-time-chat#encryption) in the User-Generated Platforms volume.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Feature | Where the customer's key lives | What it covers | What it costs the customer |
| --- | --- | --- | --- | --- |
| **Slack** | Enterprise Key Management (EKM), a security add-on for Enterprise Grid and Enterprise+, included in GovSlack | AWS KMS in the customer's AWS account | Messages (including Slackbot conversations), canvases, snippets, uploaded files, the search index of customer data, app- and bot-generated content, app datastores and secrets | Member profiles, channel names and topics, file names and membership stay under Slack's keys; revocation can be granular |
| **Atlassian** | Customer-managed keys (CMK); BYOK closed to new enrollment, existing BYOK customers to be migrated | AWS KMS in the customer's AWS account | App data for new sites in scope; one CMK policy per organization; mandatory and built in for Isolated Cloud | Revoking key access "suspends access to all your apps"; BYOK couldn't be added to an existing app or migrated between locations |
| **Microsoft** | Purview Customer Key | Two root keys in Azure Key Vault (or Managed HSM) plus a Microsoft-protected availability key | Exchange mailboxes, SharePoint and OneDrive (including Teams files), Teams chat, media, recordings in Teams storage, Microsoft 365 Copilot interactions, Windows 365 Cloud PCs | The service keeps using the keys for "eDiscovery, anti-malware, anti-spam, and search indexing"; a data purge is possible only for mailbox policies |
| **Microsoft** | Double Key Encryption (DKE) | One key in the customer's DKE service, one in Azure | Office documents and emails labeled with a DKE sensitivity label | No eDiscovery, content search and indexing, mail-flow malware and spam inspection, Office web apps or co-authoring, Copilot; not for Teams meetings and chat |
| **Google Workspace** | Client-side encryption (CSE), in Frontline Plus, Enterprise Plus, Education Standard and Education Plus | A key service the customer chooses (Cloud HSM for Google Workspace, a partner, or its own built on the CSE API), with access through the customer's identity provider | Drive, Docs, Sheets, Slides, Gmail, Calendar and Meet content | Vault can retain and export but not search content or preview; no phishing or malware scanning; DLP sees only metadata; mobile Docs editors unsupported; Gmail delegation and aliases unavailable |
| **Zoom** | End-to-end encrypted meetings | Participants' devices | Meeting audio, video and content | Disables cloud recording, live transcription, live streaming, AI features, chat before and after, polls, Zoom Apps, Whiteboard; app clients only; 1,000 participants |
| **Box** | KeySafe | AWS KMS Custom Key Store or GCP Cloud HSM KMS | File content keys wrapped by the customer's key | Key use recorded in an unchangeable log with reason codes tied to Box events |

Three patterns run through the table:

- **Customer-managed keys don't make the vendor blind.** Every rung-2 product still decrypts to serve, index and scan. Microsoft says so in plain terms: the customer "explicitly authorize[s] Microsoft 365 to use your encryption keys to deliver value-added services." What the customer gets is a switch and a log, not secrecy from the service.
- **Metadata stays readable.** Slack keeps channel names, file names and profiles under its own keys; Google's DLP can scan a CSE file's title and labels; Microsoft's labels are clear text by design. Every scheme leaves the vendor knowing who talked to whom, in what container, about a file with what name.
- **Client-side and end-to-end encryption break the compliance stack.** The features that disappear (eDiscovery search, DLP, malware scanning, recording) are the ones the previous chapters depend on.

## What Customer-Managed Keys Buy

### A switch

The core promise of rung 2 is revocation. Atlassian: revoking access to the keys "suspends access to all your apps at any time." Slack lets customers "revoke granular access to encryption keys" to minimize disruption. Box describes being able to "cut off access to the content at any time" on suspicious activity. Microsoft's revocation path, for mailboxes, ends in cryptographic deletion.

A switch is useful in three situations: a suspected compromise of the vendor or of a path into the vendor, a contractual or regulatory requirement to be able to stop processing, and exit. It is also a loaded gun. Turning off the key turns off the product for the whole organization (Atlassian is explicit that it is all apps), so revocation is an incident-response decision with an owner, a runbook and a rehearsal, not an admin toggle.

### A log the vendor can't edit

Because the key sits in the customer's own KMS account, every unwrap the vendor asks for is recorded in the customer's cloud audit trail, outside the vendor's control. Box goes further and attaches reason codes "that correlate to Box events," so the security team can see not only that a key was used but why. The playbook's [Logging Key Use](/docs/security/encryption-at-rest#logging-key-use) covers the general practice. For a buyer, a key-use log is how the claim "the vendor only decrypts to serve our users" becomes checkable: a spike of unwraps at 3 a.m. with no matching user activity is a question to ask.

### A credible exit

At the end of a contract, a customer wants proof its data is gone. With customer keys it can make the data unreadable by destroying the keys ([Crypto-Shredding](/docs/security/encryption-at-rest#crypto-shredding)). Microsoft's process for Exchange shows what that looks like done carefully: remove the service's wrap and unwrap permissions on both Key Vault keys, place a permanent data purge request on the data encryption policy (after which it can't be assigned to mailboxes), request Microsoft's Data Purge eDocument, have an authorized representative sign it, and Microsoft then deletes the policy, marks mailboxes for permanent deletion and removes the availability key, after which the data "can't be recovered." Microsoft warns not to use it to delete a subset of mailboxes, doesn't support purging multi-workload policies at all ("Purging such a DEP would make data across all workloads inaccessible"), and doesn't support purging SharePoint and OneDrive policies.

The lesson is that crypto-shredding in a multi-tenant SaaS needs keys scoped to exactly what should be destroyed together. A key that covers a whole tenant's Teams, Exchange and Copilot data can't be used to delete one mailbox.

### Availability engineering

A customer key the vendor can't reach is an outage. Microsoft's design shows the engineering it takes: each data encryption policy uses two keys in separate Azure Key Vaults (in different regions for SharePoint), plus an availability key Microsoft protects for recovery; keys can be soft-deleted and recovered for up to 90 days; multi-geo tenants need one SharePoint policy per geo. Slack and Atlassian rely on AWS KMS durability in the customer's account. Box cites AWS key storage "designed with 99.99999999% durability" across availability zones.

What the vendor must still build: caching of unwrapped data keys with a bounded lifetime (so a brief KMS blip doesn't take the product down, and a revocation still takes effect within a known time), clear errors when the customer's KMS denies access, and a status page distinction between "vendor outage" and "customer key unavailable."

## What Client-Side and Double-Key Encryption Give Up

Rung 3 is for the small fraction of data that must be unreadable to the vendor. Microsoft frames DKE that way: a typical organization's data is about 80% nonsensitive, 15% sensitive and 5% highly sensitive, and DKE "is intended for your most sensitive data." Its documented costs:

- **No service processing:** mail flow rules including anti-malware and spam that need to see attachments, eDiscovery, content search and indexing, Office web apps and co-authoring, and Copilot. "DKE encrypted data isn't accessible at rest to Microsoft 365 services including Copilot."
- **SharePoint and OneDrive store but can't process DKE files:** they can't be opened in Office for the web, and co-authoring, eDiscovery, DLP and search don't work on them.
- **No AutoSave or co-authoring** for DKE-labeled Office documents; a DKE label can't be a SharePoint library's default; Loop doesn't support DKE labels.
- **No Teams:** "DKE labels can't be used to protect calendar items, Teams meetings, and chat."
- **Desktop clients only:** Microsoft 365 Apps on Windows (and the Information Protection Viewer) create and open DKE content, which can be stored but not viewed online; offline publishing needs a cached key.

Google's CSE has the same shape. Vault can "retain, search for, and export" client-side encrypted Drive files and Gmail messages, but admins "can't search their content, search by file type, preview the content, or download from the preview view," and can search only by metadata such as title and owner; exported files are decrypted with a command-line utility. Encrypted files and email "aren't scanned for phishing and malware," and DLP can't read them. Google lists further gaps per app: Docs, Sheets and Slides aren't yet supported on Android and iOS for CSE, Gmail delegation and aliases aren't available, Calendar focus time and appointment slots don't support it, and some Meet features are unavailable.

### The collision with legal duties

Encryption the service can't read meets the duties in the rest of this part head-on:

- **Holds.** Zoom's chat legal hold requires Advanced Chat Encryption to be disabled ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)). A hold over content the service can't decrypt preserves ciphertext; the customer must keep the keys for as long as the hold lasts, or the hold preserves nothing usable.
- **Discovery.** A production needs plaintext. Google's decrypter for Vault exports and Microsoft's DKE-aware clients are the paths; the customer's key service becomes part of its eDiscovery chain ([eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export)).
- **DLP.** Inspection is impossible; only labels and metadata can drive policy ([Encryption Limits Inspection](/books/workplace-and-collaboration/dlp-and-information-protection#encryption-limits-inspection)).
- **Regulated recordkeeping.** Archiving obligations assume the firm can produce the record. Encrypted modes are usually disabled for regulated users ([Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications), later in this part).

My rule: encryption that defeats the service is a property of specific containers or labels chosen by the customer for specific reasons, never a tenant-wide default, and the admin console shows, per container, which compliance functions it switches off.

## End-to-End Encrypted Meetings

Zoom's end-to-end encryption generates the keys for each meeting on participants' machines, "not by Zoom's servers," so Zoom's servers relay data they can't decrypt; the host can read a security code aloud for participants to verify. Enabling it disables Zoom AI features, cloud recording, live transcription, live streaming, meeting chat before and after the meeting, polling and surveys, Zoom Apps, My Notes and Zoom Whiteboard. Every participant must join from the desktop or mobile app or Zoom Rooms (no phone or SIP/H.323), meetings are limited to 1,000 participants, breakout rooms each get their own key, and a post-quantum variant is used automatically when every participant runs version 6.0.10 or later (6.1.0 for Zoom Rooms). Free accounts can host E2EE meetings after the host verifies a phone number.

The feature exists in its current form because of a promise Zoom couldn't keep. In its November 9, 2020 settlement announcement, the FTC alleged that since at least 2016 Zoom had advertised "end-to-end, 256-bit encryption" while providing a lower level of security, and that Zoom "maintained the cryptographic keys that could allow Zoom to access the content of its customers' meetings"; the FTC described end-to-end encryption as readable by sender and recipients and "not even the platform provider." The order required a comprehensive information security program, biennial independent assessments and an end to security misrepresentations. Meeting architecture is [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video#e2ee-as-shipped) in the Meetings and Voice part; for this chapter the lesson is about words. "End-to-end" means the vendor can't decrypt; a vendor holding the keys, or any key path, is at rung 1 or 2, and must say so.

## Keys and AI

AI assistants and search need plaintext, and the vendors handle it differently by rung:

- **Rung 2: index under the customer's key.** Slack's EKM covers the "Search index of Customer Data," and in Slack Connect each organization's messages are encrypted with its own keys while the shared search index is "duplicated and encrypted with each customer's keys." Microsoft's Customer Key multi-workload policy covers Microsoft 365 Copilot interactions. The derived data (indexes, embeddings, summaries) inherits the source's key, so revocation reaches it too.
- **Rung 3: no AI.** DKE content isn't available to Copilot at rest or in use in current Office versions. Google's CSE content can't be scanned by DLP, and the same opacity applies to any service-side processing.

A builder adding AI to a product with customer keys must treat embeddings and caches as customer data under the same key, or revocation leaves a readable shadow copy. The AI features themselves are [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants) in the Search, Integrations and AI part.

## Shared Spaces

When two organizations share a channel, whose key encrypts it? Slack's answer is both: each organization's messages are encrypted with its own EKM keys, and the shared search index is duplicated per customer. That preserves each admin's switch over its own people's content, which is the inversion applied to cryptography: Contoso's revocation makes Contoso's messages unreadable in the shared channel without touching Fabrikam's. A design that encrypts a shared container with the host's key hands the host a switch over the guest's content, which no guest's security team will accept.

## How to Build It

The [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) gives organizations, workspaces, containers, items and item versions. This chapter adds customer key references, the binding of keys to scopes, an encryption mode on containers, and a record of key use:

```sql
CREATE TABLE customer_keys (                 -- references to keys in the customer's KMS; never key material
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  provider         TEXT NOT NULL CHECK (provider IN ('aws_kms', 'azure_key_vault', 'azure_managed_hsm',
                     'gcp_kms', 'gcp_cloud_hsm', 'external')),
  key_uri          TEXT NOT NULL,             -- ARN or vault URI
  region           TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
  status           TEXT NOT NULL CHECK (status IN ('pending_validation', 'active', 'access_denied',
                     'revoked', 'purge_requested', 'purged')),
  last_validated_at TIMESTAMPTZ,
  added_by         UUID NOT NULL REFERENCES members (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE key_bindings (                  -- which data a key protects; the unit of revocation and purge
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  scope_type       TEXT NOT NULL CHECK (scope_type IN ('organization', 'workspace', 'container', 'member_mailbox')),
  scope_id         UUID NOT NULL,
  primary_key_id   UUID NOT NULL REFERENCES customer_keys (id),
  secondary_key_id UUID REFERENCES customer_keys (id),      -- second region for availability
  covers           TEXT[] NOT NULL,           -- 'content', 'files', 'search_index', 'embeddings', 'app_data', 'recordings'
  data_key_ttl     INTERVAL NOT NULL DEFAULT interval '15 minutes',  -- cache bound: how fast revocation bites
  state            TEXT NOT NULL CHECK (state IN ('encrypting', 'active', 'rewrapping', 'rolled_back', 'purged')),
  progress_pct     NUMERIC(5,2),
  UNIQUE (scope_type, scope_id)
);

ALTER TABLE containers
  ADD COLUMN encryption_mode TEXT NOT NULL DEFAULT 'provider'
    CHECK (encryption_mode IN ('provider', 'customer_key', 'client_side', 'end_to_end')),
  ADD COLUMN disabled_features TEXT[] NOT NULL DEFAULT '{}';  -- computed from mode: 'search', 'dlp', 'ediscovery_search', 'ai', 'recording'

ALTER TABLE item_versions
  ADD COLUMN key_binding_id UUID REFERENCES key_bindings (id),
  ADD COLUMN wrapped_dek    BYTEA,               -- data key wrapped by the binding's key
  ADD COLUMN client_side    BOOLEAN NOT NULL DEFAULT FALSE;  -- service holds ciphertext only

CREATE TABLE key_use_events (                -- the vendor's side of every unwrap, matched to the customer's KMS log
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  key_binding_id   UUID NOT NULL REFERENCES key_bindings (id),
  customer_key_id  UUID NOT NULL REFERENCES customer_keys (id),
  operation        TEXT NOT NULL CHECK (operation IN ('wrap', 'unwrap', 'rewrap', 'validate')),
  reason           TEXT NOT NULL CHECK (reason IN ('user_read', 'user_write', 'search_index', 'ai_retrieval',
                     'dlp_scan', 'malware_scan', 'ediscovery_export', 'backup', 'support_access', 'migration')),
  audit_event_id   UUID REFERENCES audit_events (id),  -- the user or system action that caused it
  kms_request_id   TEXT,                       -- the id the customer sees in its KMS log
  outcome          TEXT NOT NULL CHECK (outcome IN ('ok', 'denied', 'unavailable')),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Notes on the sketch:

- **Envelope encryption with bindings as the unit.** Each item version's data key is wrapped by the binding's customer key ([Envelope Encryption](/docs/security/encryption-at-rest#envelope-encryption)); a binding per mailbox or container makes per-scope purge possible, the limit Microsoft's multi-workload policy runs into. Choose binding granularity for the smallest thing customers will want to destroy separately.
- **Derived data shares the binding.** Search index shards, embeddings, thumbnails, transcripts and caches for a container are encrypted under the same binding (`covers`), so revocation and purge reach them. A derived store with its own provider key is a leak.
- **Revocation latency is a setting.** Unwrapped data keys are cached for `data_key_ttl`; the customer sees that number, and a revocation takes effect for all reads within it. `access_denied` from the KMS moves the binding to a degraded state the product reports to admins as "customer key unavailable," distinct from an outage.
- **Reason codes on every unwrap.** `key_use_events` ties each KMS call to the audit event that caused it, as Box does with reason codes, and stores the KMS request ID so the customer can reconcile its own KMS log against the product's audit log. Support access unwraps carry their approval reference ([Support Access](/docs/security/support-access)).
- **Modes compute feature loss.** Setting `client_side` or `end_to_end` on a container fills `disabled_features`, which the admin sees before confirming and which holds, DLP and eDiscovery read to report coverage gaps.
- **Shared containers bind per organization.** In a cross-organization channel, each organization's members' items use that organization's binding, and the search index is duplicated per organization, as Slack does.
- **Rotation re-wraps, not re-encrypts,** by default ([Rotation: Re-wrap and Re-encrypt](/docs/security/encryption-at-rest#rotation-re-wrap-and-re-encrypt)); `progress_pct` reports the rewrap the way SharePoint's `Registering` and `Rolling` states do.

## Auditing

- **Key lifecycle:** every key added, validated, rotated, denied, revoked and purge-requested, with who did it, in the customer's audit log ([Audit Logs](/books/workplace-and-collaboration/audit-logs)) and, for purge, the authorizing document.
- **Key use reconciliation:** a daily job matching `key_use_events` to audit events and flagging unwraps without a cause; customers can run the same match against their KMS log.
- **Revocation drills:** a scheduled test in a customer-approved sandbox workspace that revokes and restores a key, measuring time to full denial and time to recovery against the published TTL.
- **Mode changes:** every container moved to or from client-side or end-to-end encryption, with the features disabled and the holds and DLP policies affected at the time.
- **Claims review:** marketing, documentation and sales material reviewed against the actual rung for each feature, so "end-to-end" is never used for a mode where the vendor holds a key path.

## What This Means for the System You Build

- **Name the rung for every feature** (provider key, customer root key, client-side, end-to-end) and never call anything end-to-end if you hold a key path.
- **Scope customer keys to what customers will want to revoke or destroy separately,** and put derived data (indexes, embeddings, caches) under the same key.
- **Publish revocation latency and engineer for key unavailability** with dual-region keys, bounded caches and a "customer key unavailable" state.
- **Log every unwrap with a reason tied to an audit event,** reconcilable with the customer's KMS log.
- **Make client-side and end-to-end modes per container or label,** show exactly what they disable, and surface the gaps in holds, DLP and eDiscovery.
- **Encrypt shared spaces per organization,** so each admin's switch covers only its own people's content.
- **Write the exit path:** how keys are destroyed, what is purged, what can't be, and the signed record that proves it.

## References

**Vendor documentation**

- [Slack: Slack Enterprise Key Management](https://slack.com/help/articles/360019110974-Slack-Enterprise-Key-Management), plans, AWS KMS in the customer's account, data under customer and Slack keys, granular revocation, Slack Connect per-organization encryption and the duplicated search index
- [Slack: Security at Slack](https://slack.com/trust/security), encryption at rest and in transit by default
- [Atlassian Support: What is CMK encryption?](https://support.atlassian.com/security-and-access-policies/docs/what-is-cmk-encryption/), customer-managed keys in AWS KMS, one policy per organization, new sites, Isolated Cloud and suspension on revocation
- [Atlassian Support: What is BYOK encryption for Atlassian products?](https://support.atlassian.com/security-and-access-policies/docs/what-is-byok-encryption-for-atlassian-products/), Enterprise eligibility, closed enrollment and migration to CMK
- [Atlassian Support: BYOK limitations](https://support.atlassian.com/security-and-access-policies/docs/byok-limitations/), no migration between locations, one policy per organization, no retrofitting existing apps
- [Microsoft Learn: Overview of Customer Key](https://learn.microsoft.com/en-us/purview/customer-key-overview), BitLocker and DKM baseline, workloads covered, the authorization for eDiscovery, anti-malware, anti-spam and search indexing, DEP types, 50 mailbox DEPs and one SharePoint DEP per geo
- [Microsoft Learn: Manage Customer Key encryption policies](https://learn.microsoft.com/en-us/purview/customer-key-manage), the data purge path, unsupported purges, rollback, 90-day soft delete and SharePoint encryption states
- [Microsoft Learn: Double Key Encryption](https://learn.microsoft.com/en-us/purview/double-key-encryption), the two keys, the 80/15/5 framing, services unavailable with DKE, SharePoint and OneDrive limits, no Teams meetings and chat, and Copilot
- [Microsoft Learn: Learn about sensitivity labels](https://learn.microsoft.com/en-us/purview/sensitivity-labels), labels as clear-text metadata
- [Google Workspace Admin Help: About client-side encryption](https://knowledge.workspace.google.com/admin/security/about-client-side-encryption), the definition and supported editions
- [Google Workspace Admin Help: Client-side encryption FAQ](https://knowledge.workspace.google.com/admin/security/client-side-encryption-faq), key service options, Vault behavior, scanning and DLP limits and the export decrypter
- [Google Workspace Admin Help: Client-side encryption user experience overview](https://knowledge.workspace.google.com/admin/security/client-side-encryption-user-experience-overview), per-app limitations
- [Zoom Support: End-to-end encryption for meetings (KB0065408)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065408), key generation on participants' machines, disabled features, client requirements, the 1,000-participant limit, breakout room keys and post-quantum E2EE
- [Zoom Support: Chat legal hold (KB0057908)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057908), Advanced Chat Encryption disabled as a requirement
- [Box: KeySafe](https://www.box.com/security/keysafe), AWS KMS Custom Key Store and GCP Cloud HSM KMS, key wrapping, the unchangeable key-use log with reason codes, cutting off access and key durability

**Regulators**

- [FTC: FTC Requires Zoom to Enhance its Security Practices as Part of Settlement (November 9, 2020)](https://www.ftc.gov/news-events/news/press-releases/2020/11/ftc-requires-zoom-enhance-its-security-practices-part-settlement), the end-to-end and 256-bit encryption allegations, Zoom holding the keys and the order's requirements
