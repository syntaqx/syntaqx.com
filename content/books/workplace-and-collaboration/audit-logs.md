+++
title = "Audit Logs"
description = "Slack's Audit Logs API, Purview Audit after Storm-0558, Google Workspace, Atlassian and Notion logs, retention windows, SIEM export and the event shape."
category = "Workplace & Collaboration Industry"
order = 2046
part = "Security and Compliance"
tags = ["workplace", "audit-logs", "siem", "security", "compliance"]
+++

An audit log in workplace software is the customer's record of who did what to which resource, from where, inside the vendor's product. It is not the vendor's operational logging and not its analytics. The reader is the customer's security team, its compliance officers and, during an investigation, its lawyers; the questions are "who shared this file outside the company," "which app read the CEO's mailbox," "who turned off retention on the legal channel." Every enterprise buyer asks for it, every vendor sells it in its top tiers, and every security questionnaire asks how long it is kept and how it gets into the customer's SIEM.

It is hard for four reasons. **Coverage**: an event the product never emits can't be investigated, and products grow features faster than they grow audit events. **Reads**: logging that a setting changed is cheap; logging every time a message or mail item is read is expensive, and it is exactly what an intrusion investigation needs. **Retention**: vendors keep logs for months, investigations and regulations want years, so the customer has to run its own copy. **Actors**: a person, an admin acting on a person, an app using a person's token, a bot, a service principal, an AI agent and the vendor's own support engineer all show up in the same log, and a record that can't tell them apart answers nothing. This chapter is the workplace side of the playbook's [Audit Trails](/docs/architecture/audit-trails); the generic record design lives there.

The inversion that runs through this volume shows up plainly here. On a consumer platform the platform reads its own logs to police its users. In a workplace product the logs belong to the customer organization: its admins decide who may read them, how long they are kept beyond the vendor's window, and where they are sent. The vendor's duty is to emit complete, accurate, timely records and to hand them over in a usable form ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)).

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Where the log lives | Plan | Retention in the product | Getting it out |
| --- | --- | --- | --- | --- |
| **Slack** | Audit Logs API for the Enterprise organization, plus anomaly events | Enterprise | Data not available before March 2018; no retention period stated | Pull API at `https://api.slack.com/audit/v1/logs`, app installed by the Org Owner with the `auditlogs:read` scope, Tier 3 (up to 50 calls per minute per organization) |
| **Microsoft Purview Audit** | Unified audit log across Exchange, SharePoint, OneDrive, Teams, Entra and other services | Audit (Standard) with qualifying subscriptions; Audit (Premium) with E5, A5, G5 | Standard: 180 days. Premium: one year for Entra, Exchange, OneDrive and SharePoint by default, custom policies up to one year, up to 10 years with a per-user add-on | Portal search and CSV export, Audit Search Graph API, `Search-UnifiedAuditLog`, Office 365 Management Activity API (baseline 2,000 requests per minute, about twice that with Premium) |
| **Google Workspace** | Admin console audit and investigation pages; security investigation tool in higher editions | Log events in all editions; the investigation tool in Enterprise, Education Standard and Plus, Frontline, Enterprise Essentials Plus and Cloud Identity Premium | Generally 6 months; Vault log events indefinite; email log search 30 days | Admin console log search; the investigation tool for triage and action |
| **Atlassian** | Organization audit log in Atlassian Administration | Atlassian Guard Standard or Premium, or an Enterprise plan; without them organization-level logs "will not store or display any events" | Up to 180 days | CSV export; audit log webhooks (Enterprise or Guard Premium), up to 3 per organization |
| **Notion** | Workspace and organization audit logs | Enterprise | Up to 365 days | CSV export; a SIEM webhook (one per workspace) with partners such as Splunk, Datadog, Panther and Sumo Logic |
| **GitHub Enterprise Cloud** | Enterprise audit log and Git events | Enterprise | A paused stream buffers seven days | Streaming to Amazon S3, Azure Blob Storage, Azure Event Hubs, Datadog, Google Cloud Storage and Splunk |

Four patterns are worth stating before the details:

- **The audit log is a tier boundary.** Atlassian stores no organization-level events at all without Guard or Enterprise, and upgrading "doesn't recover earlier events"; Notion's log starts at the Enterprise upgrade date; Slack's API is Enterprise-only. A customer that buys late has no history from before it bought.
- **Retention in the product is short.** Six months (Google, Microsoft Standard), 180 days (Atlassian), a year (Notion, Microsoft Premium's default for core workloads). Anything longer is the customer's own store.
- **Export is push or pull.** Slack and Microsoft expose pull APIs that the customer's collector polls; Atlassian, Notion and GitHub push to a customer endpoint. The two fail differently, and both need deduplication.
- **Reads are the premium event.** Microsoft gates the richest read events (and the properties on them) behind Premium licensing; the next section is about what that cost.

## What an Audit Event Must Contain

The playbook's [What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds) is the general answer. The workplace vendors converge on the same shape, and Slack's documented event is a clean statement of it: an `id`; a `date_create` timestamp; an `action` such as `user_login` or `file_downloaded`; an `actor`, typically a user; an `entity` that the action was performed on (a user, channel, file, app, workspace or the enterprise); a `context` carrying the location (which workspace or the enterprise), user agent, IP address and session ID; optional `details`; and an `app` object when an app triggered the event. Microsoft's records carry the same facts in an `AuditData` JSON object with a `Workload` property naming the service where the activity happened; Google's log events and Atlassian's activities carry the actor, the action, the target and the IP.

The fields that separate a useful workplace audit log from a merely present one:

- **A typed actor, with on-behalf-of.** A person acting directly, an admin acting on another member's account, an app using a member's OAuth token, a bot, a service principal, an AI agent and vendor staff are different actors ([Typed Actors](/docs/architecture/audit-trails#typed-actors)). Microsoft adds an `AppAccessContext` property to Teams events such as `MessageRead`, `ChatRetrieved` and `MessagesListed` under Premium, so an investigator can see which application read a chat on whose behalf; Slack attaches an `app` object to app-triggered events. Microsoft keeps records generated by non-user entities (service principals, system events, application activity) for a fixed year that custom policies don't change, which tells a builder that non-human actors need their own retention rule.
- **The tenant location, at every level.** A Slack event says whether it happened in a workspace or at the enterprise level; a Microsoft record names its workload; an Atlassian event names the app. In a product with organizations, workspaces and containers, the record carries all three, because an org admin filters by workspace and a workspace admin must not see another workspace's events.
- **The target's identity and its name at the time.** A channel renamed after the event, a file moved, a user deleted: the record keeps the identifier and the display name as they were ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)). Notion keeps removed users searchable in its log filters for this reason.
- **Sensitivity context on reads.** Purview's Premium `MailItemsAccessed` record carries the `SensitivityLabel` of the item accessed. A read of a "Highly Confidential" item and a read of a lunch invitation are not the same event for an investigator; the label belongs in the record, not in a later join that may no longer resolve ([DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection)).
- **Network and session facts.** IP address, user agent and session ID, so a token replay from a new location stands out against the same user's normal sessions.
- **A stable event ID.** Atlassian's webhooks send "the same information and ID on every delivery," and both Atlassian and GitHub say they may deliver more than once; the ID is what makes deduplication possible downstream.

## Coverage: Admin Actions, User Actions and Reads

Audit events fall into three bands with very different costs:

- **Administrative changes:** settings, policies, roles, SSO configuration, app approvals, retention and hold changes, exports. Low volume, high value, every vendor logs them. These are also the events an attacker who gains admin rights produces first (turning off logging, adding a forwarding rule, approving an app), which is why changes to audit and retention configuration must themselves be audited ([Auditing](#auditing)).
- **User actions on content:** creating, sharing, moving, deleting, changing permissions, joining channels, external sharing. Medium volume. Slack's catalog lists actions such as `public_channel_created`, `private_channel_created` and `file_downloaded`; Google's Drive log covers file sharing, creation, deletion and who accessed documents.
- **Reads:** a message opened, a mailbox item accessed, a file viewed, a search run. Highest volume, and the band that shows the scope of a compromise. Microsoft's Premium list is mostly reads: `MailItemsAccessed`, records of when and what a user searched for in Exchange Online and SharePoint Online, and Teams `MessageRead`, `MessagesListed`, `MessageHostedContentRead` with `AppAccessContext`.

### The 2023 lesson: logging as a security baseline

In mid-June 2023 a US federal civilian agency noticed `MailItemsAccessed` events "with an unexpected `ClientAppID` and `AppID`" in its Microsoft 365 audit logs, and that is how the intrusion later attributed to Storm-0558 was found. CISA's advisory of July 12, 2023 (AA23-193A) said the agency had enabled enhanced logging of those events and knew its normal Outlook baseline, and noted that "This logging requires licensing at the G5/E5 level." The advisory recommended enabling Purview Audit (Premium) and pointed to OMB M-21-31, which requires federal agencies to keep Microsoft audit logs for 12 months in active storage and 18 months in cold storage.

A week later, on July 19, 2023, Microsoft announced that Purview Audit (Standard) customers would get detailed logs of email access and more than 30 other log types previously limited to Premium, and that default Standard retention would rise from 90 to 180 days, rolling out from September 2023 after coordination with CISA. The retention change applies to Standard logs generated on or after October 17, 2023.

Two rules follow for anyone building a workplace product:

- **Security-relevant reads are not a premium feature.** An event that is the only way to scope a breach must be emitted for every customer. What can reasonably be tiered is retention length, query tooling, alerting and API bandwidth, not whether the record exists.
- **Investigations need a baseline.** The agency caught the intrusion because it knew which app IDs normally read mail. A product that exposes app identity on every content-read event lets customers build that baseline; one that collapses all access into "user read item" doesn't.

## Lag, Order and Completeness

Audit logs are not real-time streams with transactional guarantees, and the vendors say so. Google's data retention and lag times page lists most log events (Admin, Drive, Gmail, Chat, Meet, SAML) as near real time; Calendar, Groups and user account events in tens of minutes, sometimes up to a couple of hours; token events in a couple of hours; OAuth and Cloud Search events up to a few hours; and admin console reports in one to three days. It adds that some events may be delayed beyond these times and "in rare cases events might not be reported at all." Atlassian's webhooks are unordered ("Event B may arrive before Event A"), at-least-once, retried up to three times, with no public delivery SLO. GitHub's streaming is at-least-once with a seven-day buffer when paused, resumes from a week back after a longer pause, and starts over with no backfill after three weeks; it runs a health check every 24 hours and expects a misconfigured stream to be fixed within six days. Notion retries its SIEM webhook up to seven times over about 24 hours, sends no page content and doesn't send organization-level events at all.

What the consumer has to do with that:

- **Deduplicate on the event ID** and order by the event's own timestamp, never by arrival.
- **Re-read a trailing window.** A collector polling a pull API asks again for the last few hours on each run, because late events land behind the cursor.
- **Monitor the gap, not just the pipe.** A healthy connection with no events from one workload for a day is a finding.
- **Know the dark spots.** Notion's organization events don't go to the SIEM webhook; Google's email log search keeps 30 days; Atlassian Government Cloud lacks some features. The customer's runbook lists which questions can only be answered in the vendor's console, and for how long.

## Retention and the Customer's Copy

Vendor retention is a search window, not a record-keeping system. Microsoft says the Management Activity API is how organizations "retain auditing data for longer periods than the default 180 days" and import it into a SIEM; Notion's help center recommends exporting regularly; Google's six months covers most events. Purview Premium's audit log retention policies can keep records by service, activity or user for up to a year, or ten years with the add-on, and Microsoft notes that a 10-year policy "isn't retroactive": records generated before it existed keep their original expiry.

The design consequences:

- **Retention is set when the record is written.** Microsoft states that an audit record's lifetime "is determined when the auditing pipeline adds the data" and later license or policy changes don't affect committed items. A vendor building this should do the same and show the customer the expiry on each record, so nobody believes a policy change reached backwards.
- **The customer's store is the system of record for anything older than the window.** It needs its own retention schedule, its own access controls (security, legal, internal audit) and its own integrity controls ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **Audit logs can be evidence.** Once litigation is reasonably anticipated, relevant audit records fall under the same preservation duty as messages ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)). A vendor's rolling deletion of log events is routine destruction the customer may have to suspend, which it can only do in its own copy.
- **Audit logs are personal data about employees.** They record what each person did all day. GDPR's storage limitation and the employee-monitoring rules apply to the customer's archive (Employee Monitoring & Privacy, later in this part, covers what employers may do with it; [Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records) covers the storage side).

## Who Reads It, and the Audit of the Auditors

The people who read workplace audit logs are powerful: they can see who talked to whom, who opened which file, who searched for what. The vendors log their activity too. Google records admin queries and actions in the security investigation tool in admin log events, and describes the Vault audit log as one that "can't be edited." Microsoft's Insider Risk Management has its own audit log so that actions by its reviewers can be independently reviewed.

Access to the audit log needs its own role, separate from workspace administration: Slack requires the Org Owner to install the audit app; Microsoft requires permissions to be assigned before anyone can use audit search; Atlassian and Notion restrict it to organization admins or owners. My default is a dedicated audit-reader role that can see events but change nothing, held by security and compliance staff, with every search it runs written to the same log.

The vendor's own staff are the last actor. When a support engineer accesses customer content, that access belongs in the customer's audit log with a reason and an approval, not only in the vendor's internal logs ([Visible to Both Sides](/docs/security/support-access#visible-to-both-sides), [Logging Support Access](/docs/security/support-access#logging-support-access)). Customers ask for it in security reviews, and a log that omits the one actor the customer can't otherwise observe is the weakest part of the record.

## Detection Built on the Log

The audit log feeds detection on both sides of the inversion. Vendors ship detections over their own events: Slack's catalog includes an `anomaly` action ("An anomalous user behavior was detected") and a configurable anomaly event response that can end all of a user's sessions or notify admins; Google's investigation tool lets admins find and erase malicious email and investigate Drive sharing. The customer's SIEM correlates the same events with identity provider sign-ins, endpoint telemetry and network logs, which no single vendor can do. The threats these detections look for (OAuth consent phishing, token theft, external-access phishing) are Threats & Incidents, later in this part. For the builder the point is narrower: every detection a vendor ships is only as good as the events it emits, and every event a vendor emits should be exportable so the customer's own detection can use it.

## How to Build It

The core data model's `audit_events` (The Workplace Software Business) is the table every chapter writes to. This chapter fixes its shape and adds the action catalog, export streams and per-record retention:

```sql
ALTER TABLE audit_events
  ADD COLUMN organization_id  UUID NOT NULL REFERENCES organizations (id),
  ADD COLUMN workspace_id     UUID REFERENCES workspaces (id),     -- NULL for org-level events
  ADD COLUMN occurred_at      TIMESTAMPTZ NOT NULL,                 -- when it happened
  ADD COLUMN recorded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),   -- when the pipeline wrote it
  ADD COLUMN action           TEXT NOT NULL REFERENCES audit_actions (action),
  ADD COLUMN actor_type       TEXT NOT NULL CHECK (actor_type IN ('member', 'admin', 'app',
                                'bot', 'service', 'agent', 'vendor_staff', 'system')),
  ADD COLUMN actor_member_id  UUID REFERENCES members (id),
  ADD COLUMN on_behalf_of_id  UUID REFERENCES members (id),         -- the member whose token or account was used
  ADD COLUMN app_installation_id UUID REFERENCES app_installations (id),
  ADD COLUMN api_token_id     UUID REFERENCES api_tokens (id),
  ADD COLUMN actor_label      TEXT NOT NULL,                        -- name or app name as it was
  ADD COLUMN target_type      TEXT NOT NULL,                        -- 'item', 'container', 'member', 'grant', 'policy', 'workspace'
  ADD COLUMN target_id        UUID,
  ADD COLUMN target_label     TEXT,                                 -- channel or file name at the time
  ADD COLUMN container_id     UUID REFERENCES containers (id),
  ADD COLUMN sensitivity_label_id UUID,                             -- label on the target when read
  ADD COLUMN ip_address       INET,
  ADD COLUMN user_agent       TEXT,
  ADD COLUMN session_id       TEXT,
  ADD COLUMN details          JSONB NOT NULL DEFAULT '{}',          -- before/after for changes
  ADD COLUMN expires_at       TIMESTAMPTZ NOT NULL,                 -- fixed at write time
  ADD COLUMN prev_hash        BYTEA,                                -- hash chain per organization
  ADD COLUMN row_hash         BYTEA NOT NULL;

CREATE TABLE audit_actions (                -- the published catalog, one row per action name
  action          TEXT PRIMARY KEY,         -- 'file.downloaded', 'retention_policy.updated'
  band            TEXT NOT NULL CHECK (band IN ('admin', 'content_change', 'read', 'auth', 'security')),
  description     TEXT NOT NULL,
  min_retention   INTERVAL NOT NULL,        -- the floor every plan gets
  plan_gate       TEXT,                     -- NULL: emitted on every plan
  introduced_at   DATE NOT NULL,
  deprecated_at   DATE
);

CREATE TABLE audit_streams (                -- a customer's SIEM destination
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  kind            TEXT NOT NULL CHECK (kind IN ('webhook', 's3', 'gcs', 'azure_blob',
                    'event_hubs', 'splunk_hec', 'datadog')),
  config          JSONB NOT NULL,           -- endpoint, bucket, region; no secrets
  secret_ref      TEXT,                     -- pointer into the secret store
  filter_actions  TEXT[],                   -- NULL: everything
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'failing', 'disabled')),
  cursor_at       TIMESTAMPTZ,              -- last recorded_at delivered
  last_success_at TIMESTAMPTZ,
  last_error      TEXT,
  created_by      UUID NOT NULL REFERENCES members (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_retention_rules (        -- Premium-style per-service or per-actor retention
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  match_action    TEXT REFERENCES audit_actions (action),
  match_band      TEXT,
  match_member_id UUID REFERENCES members (id),
  retain_for      INTERVAL NOT NULL,
  priority        SMALLINT NOT NULL,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT now()   -- never retroactive
);

CREATE INDEX audit_events_org_time_idx ON audit_events (organization_id, occurred_at);
CREATE INDEX audit_events_target_idx   ON audit_events (organization_id, target_type, target_id, occurred_at);
CREATE INDEX audit_events_actor_idx    ON audit_events (organization_id, actor_member_id, occurred_at);
```

Notes on the sketch:

- **Partition by organization and month.** Audit volume is dominated by reads; time-partitioned storage lets expiry drop whole partitions per retention class rather than deleting rows, and keeps one large tenant's history from slowing another's queries ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)).
- **`expires_at` is computed once.** At write time, from the highest-priority matching `audit_retention_rules` row in force, never below the action's `min_retention`. Changing a rule affects new records only, as Microsoft documents for its own pipeline. A legal hold on audit records suspends expiry for the matched rows without rewriting them ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)).
- **Write in the same transaction as the change.** Admin and content-change events are written with the state change they describe ([Capturing It](/docs/architecture/audit-trails#capturing-it)); read events go through an asynchronous pipeline with a bounded lag, which is published to customers like Google's lag table.
- **Streams are cursors over `recorded_at`.** The deliverer sends batches in `recorded_at` order with the event ID, re-sends a trailing window after any failure, marks the stream `failing` after repeated errors and emails the organization's admins, as GitHub's daily health check does. At-least-once delivery is the honest promise.
- **The catalog is an API.** `audit_actions` is published (Slack serves `/actions` and `/schemas` without authentication), versioned, and every new product feature that changes access or content ships with its actions in the catalog.
- **Customer scope is enforced in the query layer.** A workspace admin's query carries a `workspace_id` predicate the service adds, never the client; the audit-reader role is separate from workspace admin.

## Auditing

- **Changes to audit configuration:** every change to `audit_streams`, `audit_retention_rules`, audit-reader role grants and logging settings is itself an audit event with before and after values, and a stream disabled or a rule shortened alerts the organization's security contacts.
- **Searches and exports of the log:** who searched the audit log, for what, and who exported which range; Google's practice of logging investigation-tool queries is the model.
- **Coverage tests:** each release runs a suite that performs every catalog action against a test organization and asserts the event appears with a typed actor, target and context. An action in the product with no audit event is a release blocker.
- **Lag and loss:** per-workload p50 and p99 lag from `occurred_at` to `recorded_at`, and per-stream delivery lag, published on the status page; a workload that emits nothing for longer than its normal quiet interval opens an incident.
- **Integrity:** the per-organization hash chain verified daily, with the chain head exportable so a customer can verify its copy ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).

## What This Means for the System You Build

- **Emit security-relevant reads on every plan.** Tier retention, tooling and bandwidth; don't tier whether the event that scopes a breach exists.
- **Type every actor and record on-behalf-of,** so an app or agent using a member's token is distinguishable from the member, and keep vendor staff access in the customer's log.
- **Carry tenant location, target name at the time, IP, session and sensitivity label** on each record.
- **Publish the action catalog and the lag,** and treat a feature without audit events as unfinished.
- **Fix retention at write time,** never retroactively, and show the expiry on the record.
- **Export by push and pull with stable IDs,** at-least-once, with a trailing re-read window and a health check that tells the customer when its stream is broken.
- **Assume the customer's SIEM is the long-term record;** make the export complete enough that it can be.

## References

**Vendor documentation**

- [Slack: Audit Logs API](https://docs.slack.dev/admins/audit-logs-api), Enterprise-only availability, the `auditlogs:read` scope, Org Owner installation and the event fields
- [Slack: Audit Logs API methods and actions](https://docs.slack.dev/reference/audit-logs-api/methods-actions-reference), the base URL, the `/schemas`, `/actions` and `/logs` endpoints, filters, data from March 2018, Tier 3 rate limits and the action catalog including anomaly events
- [Microsoft Learn: Learn about auditing solutions in Microsoft Purview](https://learn.microsoft.com/en-us/purview/audit-solutions-overview), Standard and Premium capabilities, 180-day and one-year retention, the 10-year add-on, non-user records kept one year, the October 17, 2023 retention change, Premium properties such as `MailItemsAccessed` with `SensitivityLabel` and Teams `AppAccessContext`, API bandwidth and record lifetime fixed at write
- [Google Workspace Admin Help: Data retention and lag times](https://knowledge.workspace.google.com/admin/reports/data-retention-and-lag-times), six-month default retention, Vault log events indefinite, email log search 30 days, lag times by log type and the note that rare events may not be reported
- [Google Workspace Admin Help: About the security investigation tool](https://knowledge.workspace.google.com/admin/security/about-the-security-investigation-tool), capabilities, supported editions and logging of admin queries and actions
- [Atlassian Support: View audit log activities](https://support.atlassian.com/security-and-access-policies/docs/view-audit-log-activities/), 180-day storage, Guard or Enterprise required and no recovery of earlier events
- [Atlassian Support: Track organization activities from the audit log](https://support.atlassian.com/security-and-access-policies/docs/track-organization-activities-from-the-audit-log/), plan and role requirements and in-app data settings
- [Atlassian Support: Learn more about audit log webhooks](https://support.atlassian.com/security-and-access-policies/docs/learn-more-about-audit-log-webhooks/), plan requirements, three webhooks, three retries, unordered and duplicate delivery and no public SLOs
- [Atlassian Support: Differences administering Confluence Data Center and Cloud](https://support.atlassian.com/migration/docs/differences-administering-confluence-data-center-and-cloud/), the Confluence Cloud audit log's coverage compared with Data Center
- [Notion Help Center: Audit log](https://www.notion.com/help/audit-log), Enterprise availability, 365-day retention, CSV export, the SIEM webhook, its retries and exclusions
- [GitHub Docs: Streaming the audit log for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise), destinations, the seven-day buffer, resume behavior, at-least-once delivery and the daily health check
- [Microsoft Learn: Learn about Insider Risk Management](https://learn.microsoft.com/en-us/purview/insider-risk-management), the audit log of reviewer actions

**Government and incident sources**

- [CISA: Enhanced Monitoring to Detect APT Activity Targeting Outlook Online (AA23-193A)](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-193a), detection through `MailItemsAccessed` events with an unexpected AppID, the G5/E5 licensing note, the Purview Audit (Premium) recommendation and OMB M-21-31's 12 and 18 month retention
- [Microsoft Security Blog: Expanding cloud logging to give customers deeper security visibility (July 19, 2023)](https://www.microsoft.com/en-us/security/blog/2023/07/19/expanding-cloud-logging-to-give-customers-deeper-security-visibility/), more than 30 log types for Standard customers, 90 to 180 days, the September 2023 rollout and the CISA coordination
