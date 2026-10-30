+++
title = "DLP & Information Protection"
nav_title = "DLP & Info Protection"
description = "Sensitivity labels, DLP across chat, files and email in Purview, Google Workspace, Slack and Atlassian Guard, CASBs, insider risk, and false positives."
category = "Workplace & Collaboration Industry"
order = 2049
part = "Security and Compliance"
tags = ["workplace", "dlp", "sensitivity-labels", "casb", "insider-risk", "security"]
+++

Information protection is the customer organization deciding what its data is and where it may go, and the vendor's product enforcing that decision at the moment someone shares, sends, downloads or pastes. It has two halves. **Classification** says what something is: a label such as Confidential or Highly Confidential, applied by a person, a default, or a rule that detected credit card numbers or source code. **Data loss prevention** (DLP) acts on that: warn the sender, block the external share, hide the message, quarantine the file, alert the security team.

In consumer products the platform scans content against its own rules. In workplace products the customer writes the rules and the vendor runs them inside its message and file pipelines, for the customer's people only. That inversion has a sharp edge in shared spaces: when two companies talk in one channel, each admin's policy applies to its own members and neither can enforce on the other's. What makes DLP hard:

- **Latency.** A rule that inspects every chat message has milliseconds before delivery, or it acts after the fact and deletes what the recipient may already have seen.
- **False positives.** Pattern detection over chat produces alerts about test card numbers, order IDs that look like national identifiers and pasted logs. A noisy policy gets switched off or worked around.
- **Coverage.** Images, recordings, encrypted content, AI summaries and link previews are often out of scope, and each vendor lists different gaps.
- **Many enforcement points.** The same document is protected by a label in the file, a policy on the storage service, a rule in the chat product, a browser extension and a cloud access security broker, each configured separately.

This chapter covers labels, DLP policies, CASBs and insider risk as the workplace suites ship them. Key management and encryption that a label may trigger are [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys); regulated supervision and lexicon review of employee communications are Regulated Communications & Archiving, and what employers may lawfully monitor is Employee Monitoring & Privacy, both later in this part.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Classification | DLP coverage | Actions | Notes |
| --- | --- | --- | --- | --- |
| **Microsoft Purview** | Sensitivity labels on files, emails, meetings and containers (Teams, Microsoft 365 Groups, SharePoint sites, Viva Engage communities, Loop workspaces); default, mandatory and automatic labeling | Exchange, SharePoint, OneDrive, Teams chat and channel messages, Office apps, Windows and macOS endpoints, on-premises file shares, Fabric and Power BI, Microsoft 365 Copilot (preview), non-Microsoft cloud apps, Edge for Business and network inline for sites such as ChatGPT and Gemini | Policy tip, block with override and justification, block, quarantine at rest; in Teams chat, the sensitive information isn't displayed | Simulation mode before enforcement; policies take effect about an hour after being turned on; Teams chat DLP needs E5 |
| **Google Workspace** | Drive labels and Gmail classification labels, applied manually or automatically | Drive, Gmail, Chat, Calendar, Chrome (with Chrome Enterprise Premium), Gemini | Block sharing, warn, audit; restrict download, print and copy | Context-Aware Access conditions; can't scan client-side encrypted content |
| **Slack** | None native beyond channel settings | Messages, text-based files and canvases sent by members (Enterprise) | Dashboard alert, warn the member, or hide the message or file (a "tombstone") until reviewed | Custom PCRE rules or preconfigured detectors; alerts expire after 90 days; a long list of content not scanned |
| **Atlassian Guard** | Data classification levels on pages, blog posts, whiteboards and work items (Guard Premium), manual or rule-based | Data security policies across Jira and Confluence (Guard Standard and Premium) | Block export, attachment downloads, public links, anonymous access, Marketplace app access and Atlassian MCP server access | Policies default org-wide, override by space, app or (Premium) classification level |
| **Nightfall** | Detectors for secrets, PHI, PCI and PII | Slack DMs, private, public and Slack Connect channels, canvases, by API | Redact, delete or quarantine, notify employees, self-remediation or override with justification | Third-party, after-the-fact; vendor claims 95% precision |
| **Microsoft Defender for Cloud Apps** | Purview classification types and labels on content in connected SaaS apps | Shadow IT discovery plus connected apps | Apply a label, block downloads to unmanaged devices, remove external collaborators | A CASB evaluating discovered apps against more than 90 risk indicators |

Three patterns:

- **Labels are metadata that travels.** Microsoft stores a sensitivity label "in clear text in the metadata for files and emails," so it persists wherever the file goes and third-party tools can read it. Classification becomes the input every other control keys off.
- **DLP lives where the content is created.** Purview's policy store syncs policies to Exchange, OneDrive, SharePoint, Office desktop apps and Teams; Slack runs its rules on members' sends; Atlassian's policies are enforced in Jira and Confluence. A separate DLP product only sees what the platform's APIs show it, usually after delivery.
- **Every vendor documents a coverage gap list.** Slack's is explicit (below); Microsoft's says DLP doesn't scan previously existing email already in a mailbox; Google's says DLP can't read client-side encrypted content. Policy design starts from those lists.

## Classification

### Sensitivity labels

Microsoft's sensitivity labels are the most complete model and the one other vendors' features map to. A label is:

- **Customizable:** the organization defines the levels (Personal, Public, General, Confidential, Highly Confidential is Microsoft's example).
- **Clear text and persistent:** stored in file and email metadata, readable by other tools.
- **Single:** one sensitivity label per item, alongside at most one retention label.
- **Ordered:** the label list's order sets priority, least restrictive at the top, and that order defines what counts as a downgrade.

A label can apply encryption and usage rights, add headers, footers and watermarks, protect a container (privacy, external sharing, guest access, unmanaged-device access), set the default sharing-link type for SharePoint and OneDrive, and protect Teams meetings and chat. Label policies publish labels to users or groups and can set a default label, require a label before saving or sending (mandatory labeling), and require a justification to remove a label or replace it with a lower one; admins see the justification in activity explorer.

Microsoft's own guidance is a warning against over-design: a tenant can hold over 1,000 labels (500 if they apply encryption with specified users and permissions), but "effectiveness is noticeably reduced when users have more than five main labels or more than five sublabels per main label." It also cautions that a default label that applies encryption to documents is "usually not a good idea," because external recipients may not be able to open them, and that mandatory labeling without a default and training "can frustrate your users."

Atlassian Guard Premium's data classification is the same idea applied to Jira and Confluence objects: admins create, publish and archive levels, set a default minimum level, let users with edit access classify individual pages, blog posts, whiteboards and work items (a manual classification applies to that object, "not to child pages"), and configure rules that classify matching content automatically. Google's Drive labels and Gmail classification labels play the same role in Workspace and can be applied automatically by DLP rules.

### Detection

Classification by rule needs detection. Purview describes its analysis as "deep content analysis - not a simple text scan": keyword matches, regular expressions, internal function validation (a checksum on a card number), secondary matches near the primary one, and machine learning. Slack offers custom rules in PCRE regex and preconfigured rules for credit card numbers, national identifiers and secrets such as API keys and tokens, and says the preconfigured rules may miss some data and may flag false positives. Nightfall advertises language and computer vision models over more than 150 file types.

The detection choice is a precision trade. A regex for 16 digits matches order numbers; a regex plus a Luhn check plus a nearby "card" or "exp" keyword matches far fewer innocent strings. Proximity and validation are what make DLP on chat bearable.

## Where the Check Runs

The single most important design decision in workplace DLP is whether the rule runs before delivery or after.

- **Inline, before delivery.** The platform evaluates the message or share as part of the send and can refuse it. Purview's endpoint and Office-app policies block an action as the user attempts it; Atlassian's data security policies block an export or a public link at the control; Google's Drive rules block a share. The user gets the policy tip at the moment of the action, which is the only time it teaches anything.
- **Near-inline, just after.** Teams evaluates chat messages against DLP and, for a policy protecting messages to external users, messages with sensitive information "are deleted ... automatically, and within seconds," with the recipient seeing a blocked-message notice and the preview in activity notifications replaced by "Preview Unavailable." Slack's tombstone hides a message or file until reviewed. The recipient may glimpse it; the record shows it was sent.
- **After the fact, by API.** Third-party DLP for chat (Nightfall's model, Slack's Discovery API DLP partners such as Netskope, Zscaler and Nightfall) reads content after it lands and redacts, deletes or quarantines it. It covers history ("scan ... historical messages") and works across tools, but can't stop the first view.

My default for a builder is inline for shares, exports and downloads (rare, deliberate actions where a few hundred milliseconds don't matter), near-inline for chat messages (block delivery to external participants only when a rule matches, otherwise deliver immediately and evaluate asynchronously), and an API for third-party scanners that is fast enough and complete enough (edits, files, canvases) that they don't have to poll.

## Cross-Organization Conversations

Shared channels make the inversion concrete. Microsoft documents it precisely for Teams:

- **Shared channels** are built on Entra B2B direct connect, so each participant stays in its home tenant; "Because DLP evaluation is driven by the sender's identity, each user's messages are evaluated against the DLP policies of their own tenant, regardless of which tenant owns the shared channel." Contoso can't enforce its policies on Fabrikam users' messages, and vice versa.
- **External access chats** follow the hosting tenant, the one that started the chat: Contoso's policies apply to Contoso users' messages only when Contoso hosts, and a user's home policies "don't automatically follow the user into a conversation hosted by another tenant."
- **Guests** in the tenant are covered by the host's policies, and a Teams policy can delete messages with sensitive information sent to guests when the tenant initiated the chat.

Slack's DLP rules can be limited to Slack Connect conversations, which lets an admin be stricter where outsiders can read, and its legal holds exclude Slack Connect content, so a company that wants records of external conversations needs separate controls ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)). The trust model between two admins is Guests & Cross-Org Collaboration in the Tenancy and Identity part. For DLP the rule is simple and has to be shown to users: your company's policy protects what you send; it can't protect you from what the other company's people send, or stop them from copying what they read.

## Containers and Sharing Controls

Much of information protection isn't message scanning at all; it is setting the right defaults on containers so sensitive work happens in places that can't leak. Purview labels on Teams, groups and sites control privacy, guest access, external sharing, unmanaged-device access and channel sharing, and Microsoft can mark new SharePoint files as sensitive by default so they can't be shared externally until DLP has scanned them. Atlassian's data security policies set org-wide defaults (no public links, no anonymous access, no export) and override them per space. Google's DLP for Drive uses sharing boundaries and restricts download, print and copy.

Container controls are cheaper, more predictable and less noisy than content inspection. My default order of work for a customer rolling out information protection: label containers and set their sharing defaults first, then default labels on new items, then content-based DLP for the few patterns that matter (card numbers, national IDs, secrets, specific project code names), each in simulation before enforcement.

## False Positives and User Friction

Every vendor's documentation carries the same advice in different words, which is the strongest evidence that it matters:

- **Simulate first.** Purview: "plan your policies and deploy them in simulation mode, and evaluate their impact, before running them in more restrictive modes," using policy tips during simulation to raise awareness. Actions aren't applied in simulation, so the policy can safely cover every workload while it is tuned.
- **Tune scope, conditions and definitions.** Purview lists the dials: people and places in or out of scope, the conditions that decide a match, the sensitive information definitions, new controls and restricted sites.
- **Let users override with a reason, and count the reasons.** Purview's "block with override" captures a justification; Teams' blocked-message dialog lets the sender override or report the match for admin review; Nightfall's model includes self-remediation and override with justification. Overrides are the best tuning data a DLP program gets.
- **Expect alerts to age out.** Slack's DLP alerts expire after 90 days; Purview's DLP alerts are in the Purview dashboard for 30 days and in the Defender portal for six months; activity explorer shows 30 days. A program that needs history exports alerts to its own case system.
- **Know when a match reverses.** Purview records a "DLP Rule Undo" event when edited content or a changed policy means a previously matched item no longer matches, so a count of matches over time isn't a count of incidents.

Slack's list of what its DLP doesn't scan is a useful checklist for any product: images, video and audio; AI summaries; canvases in Slack Connect conversations; channel and file names; profiles; search results; Slack lists; workflow data not sent as a message; files over 100 MB; externally hosted files; and third-party link previews. A builder who writes that list for their own product before shipping DLP knows where customers will find leaks.

## Insider Risk

Insider risk management correlates many weak signals about one person (downloads, DLP matches, unusual sharing, an HR event) into a case. Microsoft's Insider Risk Management is the reference: policy templates such as "Data theft by departing users" (which needs an HR connector to know who is leaving), "Data leaks," "Data leaks by priority users," "Risky AI usage" and "Risky Agents"; alerts and cases; and escalation to eDiscovery (Premium) when a case needs preservation and review. It is "built with privacy by design": users are pseudonymized by default, access is role-based, and reviewers' own actions are audited.

Those defaults are the right ones for anyone building in this space, and they are not optional where employee privacy law applies: pseudonymize until a reviewer with cause unmasks, restrict who can unmask, log every unmasking, and keep the signal set proportionate to the risk. Works council co-determination over tools like this in Germany, and US monitoring-notice statutes, are Employee Monitoring & Privacy, later in this part.

## Information Protection and AI

AI assistants read across everything a user can access, which turns quiet oversharing into instant disclosure. The vendors have extended labels and DLP to them:

- **Microsoft:** Copilot and agents recognize sensitivity labels, show the highest-priority label among the items a response draws on, and return data from an encrypted item only if the user has the EXTRACT usage right; Purview DLP covers Microsoft 365 Copilot (preview); Insider Risk has a "Risky AI usage" template.
- **Google:** DLP for Gemini restricts access to sensitive content.
- **Atlassian:** a data security policy control can prevent Atlassian MCP server access by space, app or classification level.
- **Network and browser:** Purview's inline DLP for Edge for Business and network integrations covers uploads to ChatGPT, Gemini, DeepSeek and Copilot, the "unmanaged cloud apps" employees paste into.

Permission-aware retrieval and oversharing remediation belong to AI Assistants Over Company Data in the Search, Integrations and AI part; the information-protection rule is that labels and DLP decisions must be inputs to retrieval, not filters applied to the answer afterward.

## Encryption Limits Inspection

Strong encryption and DLP pull in opposite directions. Google says DLP scans "can't access client-side encrypted content in files or email" and can scan only unencrypted metadata such as the file title and Drive labels. Microsoft's Double Key Encryption content can't be processed by SharePoint and OneDrive, so DLP and search don't work on it there. A label that applies end-to-end or client-side encryption therefore removes the item from content inspection, and the label itself (in clear-text metadata) becomes the only signal DLP can act on. That trade is the subject of [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys); the DLP consequence is that the highest-sensitivity content must be governed by label and container rules, because content rules can't see it.

## How to Build It

The core model gives items, containers, grants and audit events. This chapter adds labels, their assignments, DLP policies and rules, and incidents:

```sql
CREATE TABLE sensitivity_labels (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  name             TEXT NOT NULL,
  parent_id        UUID REFERENCES sensitivity_labels (id),     -- label group
  priority         SMALLINT NOT NULL,                          -- higher = more restrictive
  scopes           TEXT[] NOT NULL,                            -- 'item', 'container', 'meeting'
  protections      JSONB NOT NULL DEFAULT '{}',                -- encryption mode, markings, sharing limits
  status           TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  UNIQUE (organization_id, name)
);

CREATE TABLE item_labels (                   -- one sensitivity label per item, with how it got there
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  label_id         UUID NOT NULL REFERENCES sensitivity_labels (id),
  method           TEXT NOT NULL CHECK (method IN ('manual', 'default', 'rule', 'inherited', 'dlp')),
  applied_by       UUID REFERENCES members (id),
  rule_id          UUID,                                       -- the classification or DLP rule
  downgrade_reason TEXT,                                       -- required when priority decreased
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE containers
  ADD COLUMN sensitivity_label_id UUID REFERENCES sensitivity_labels (id),
  ADD COLUMN default_item_label_id UUID REFERENCES sensitivity_labels (id);

CREATE TABLE dlp_policies (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  name             TEXT NOT NULL,
  locations        TEXT[] NOT NULL,                            -- 'chat', 'files', 'pages', 'work_items', 'export', 'ai'
  scope            JSONB NOT NULL,                             -- members, groups, workspaces, external-only
  mode             TEXT NOT NULL CHECK (mode IN ('simulate', 'simulate_with_tips', 'enforce', 'off')),
  priority         SMALLINT NOT NULL,
  version          INT NOT NULL DEFAULT 1,
  updated_by       UUID NOT NULL REFERENCES members (id),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dlp_rules (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id        UUID NOT NULL REFERENCES dlp_policies (id),
  conditions       JSONB NOT NULL,      -- detectors with min counts and confidence, label at or above, audience external
  action           TEXT NOT NULL CHECK (action IN ('audit', 'tip', 'block_override', 'block',
                     'hide_pending_review', 'quarantine', 'apply_label')),
  apply_label_id   UUID REFERENCES sensitivity_labels (id),
  notify           JSONB NOT NULL DEFAULT '{}',
  stop_processing  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE dlp_incidents (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  rule_id          UUID NOT NULL REFERENCES dlp_rules (id),
  policy_version   INT NOT NULL,
  item_id          UUID REFERENCES items (id),
  item_version_id  UUID REFERENCES item_versions (id),
  actor_member_id  UUID REFERENCES members (id),
  activity         TEXT NOT NULL,       -- 'send', 'share_external', 'download', 'export', 'ai_retrieval'
  detected         JSONB NOT NULL,      -- detector ids and counts, never the matched values
  context_snippet_ref TEXT,             -- pointer to a short masked excerpt, access-controlled
  outcome          TEXT NOT NULL CHECK (outcome IN ('simulated', 'tipped', 'blocked', 'overridden',
                     'hidden', 'released', 'deleted', 'undone')),
  override_reason  TEXT,
  reported_false_positive BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_id      UUID REFERENCES members (id),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX dlp_incidents_org_time_idx ON dlp_incidents (organization_id, occurred_at);
```

Notes on the sketch:

- **Evaluate the sender's policies.** For a message in a shared container, the engine loads the policies of the sender's organization, not the container owner's, and records which organization's policy acted. Delivery to another organization's members never runs their policies on your users' messages.
- **Two paths for chat.** The send path runs only cheap, high-precision rules that can block delivery (external audience plus a validated detector), with a hard time budget; everything else runs asynchronously after delivery and can hide the message, which the client renders as a tombstone. A timeout on the send path fails open to the asynchronous path and is counted.
- **Don't store what you caught.** `detected` holds detector IDs and counts; any context excerpt is masked, stored separately with its own access control, and expires. A DLP incident table full of card numbers is the breach.
- **Labels gate downgrades.** Changing an item's label to a lower priority requires `downgrade_reason` and writes an audit event; labels are copied into exports, search index entries and AI retrieval metadata so every consumer can act on them.
- **Policy versions are pinned on incidents,** so a simulation's results can be compared with enforcement later, and a "rule undo" (content no longer matching) updates the incident's outcome to `undone` instead of deleting it.
- **Scanning APIs for partners** expose message, edit, file and canvas events with labels and container audience, so third-party DLP doesn't have to scrape.

## Auditing

- **Policy and label changes:** every create, edit, mode change (especially simulate to enforce and enforce to off) and priority change, with before and after, in the customer's audit log ([Audit Logs](/books/workplace-and-collaboration/audit-logs)).
- **Label history per item:** who applied which label how, and every downgrade with its justification.
- **Incidents and their handling:** detection, outcome, overrides with reasons, false-positive reports and reviewer decisions, exportable to the customer's case system before the product's alert window expires.
- **Precision tracking:** per rule, the share of incidents overridden or reported as false positives; rules above a threshold are flagged for tuning.
- **Coverage statement:** a published list of what DLP doesn't inspect, versioned with the product, so customers can audit their own policy against it.

## What This Means for the System You Build

- **Make labels first-class metadata** on items and containers, ordered, persistent through export and copy, and readable by every downstream system including AI retrieval.
- **Block deliberate actions inline;** evaluate chat asynchronously except for a few high-precision rules on external audiences.
- **Apply the sender's organization's policies** in shared spaces and tell users what that means.
- **Ship simulation, override with justification and false-positive reporting** with the first version of DLP, not later.
- **Never store matched sensitive values** in incidents; store detector IDs and masked, expiring excerpts.
- **Publish what DLP can't see,** including encrypted content, media and link previews.
- **Pseudonymize insider-risk subjects by default** and log every unmasking.

## References

**Vendor documentation**

- [Microsoft Learn: Learn about data loss prevention](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp), detection methods, locations, inline web coverage, protective actions, simulation mode, policy sync, the one-hour activation, alert windows, activity explorer and DLP Rule Undo
- [Microsoft Learn: Data loss prevention and Microsoft Teams](https://learn.microsoft.com/en-us/purview/dlp-microsoft-teams), deletion of messages to external users within seconds, shared channel and external access evaluation, E5 licensing, scope table, policy tips, override and report options
- [Microsoft Learn: Learn about sensitivity labels](https://learn.microsoft.com/en-us/purview/sensitivity-labels), label capabilities, clear-text persistent metadata, scopes, priority, label limits, the five-label guidance, default and mandatory labeling, downgrade justification and Copilot's use of labels and the EXTRACT right
- [Microsoft Learn: Learn about Insider Risk Management](https://learn.microsoft.com/en-us/purview/insider-risk-management), policy templates, the HR connector, pseudonymization by default, reviewer audit and escalation to eDiscovery (Premium)
- [Microsoft Learn: Overview of Microsoft Defender for Cloud Apps](https://learn.microsoft.com/en-us/defender-cloud-apps/what-is-defender-for-cloud-apps), CASB functions, more than 90 risk indicators and information protection controls on connected apps
- [Microsoft Learn: Double Key Encryption](https://learn.microsoft.com/en-us/purview/double-key-encryption), SharePoint and OneDrive unable to process DKE files for DLP and search
- [Google Workspace Admin Help: About DLP](https://knowledge.workspace.google.com/admin/security/about-dlp), DLP for Drive, Gmail, Chat, Calendar, Chrome and Gemini, actions and Context-Aware Access conditions
- [Google Workspace Admin Help: Client-side encryption FAQ](https://knowledge.workspace.google.com/admin/security/client-side-encryption-faq), DLP unable to read client-side encrypted content and scanning of unencrypted metadata
- [Slack: Data loss prevention](https://slack.com/help/articles/12914005852819), Enterprise availability, the DLP Admin role, PCRE and preconfigured rules, actions, 90-day alert expiry and content not scanned
- [Slack: Discovery API](https://slack.com/help/articles/360002079527), DLP partners such as Netskope, Zscaler and Nightfall
- [Atlassian Support: What is a data security policy?](https://support.atlassian.com/security-and-access-policies/docs/what-is-a-data-security-policy/), Guard plans, the controls and their override scopes
- [Atlassian Support: What is data classification?](https://support.atlassian.com/security-and-access-policies/docs/what-is-data-classification/), Guard Premium, classifiable objects, manual and rule-based classification and the link to data security policies
- [Nightfall: DLP for Slack](https://www.nightfall.ai/integrations/slack), API integration, coverage, detectors, actions, override with justification and the vendor's precision claim
