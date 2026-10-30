+++
title = "Reliability, Outages & SLAs"
description = "How collaboration vendors fail and report it: incident reviews, user-minute SLAs and credits, status feeds, maintenance notice, tenant restores and backup."
category = "Workplace & Collaboration Industry"
order = 2062
part = "Running the Platform"
tags = ["reliability", "outages", "sla", "status-pages", "disaster-recovery"]
nav_title = "Reliability & Outages"
+++

When a collaboration product goes down, a company stops talking to itself. Chat, meetings and the issue tracker are where work is coordinated, so an outage is felt by every employee at once, and it tends to land at the worst moment: the start of the working day, when every client reconnects and boots at the same time. Both of the Slack incident reviews below start on a weekday morning in the Americas, one of them the first working day of 2021, and both are about what happens when a fleet of cold clients arrives together.

The workplace twist on reliability is that the customer's admin, not the end user, sits between the vendor and the people affected. The admin reads the vendor's service health feed, tells employees what is happening and what to use instead, decides whether the contract's SLA is worth claiming, holds the incident contacts the vendor will use, and decides whether to buy a backup of data the vendor already replicates. The vendor's duties run to the organization; the organization's run to its people. This chapter surveys the SLAs and status channels of Microsoft 365, Google Workspace, Atlassian, Slack and Zoom, reads five public incident reviews for what they teach about collaboration architecture, covers maintenance, tenant-scoped restore and SaaS backup, and adds incident, SLA and restore records to the core data model from [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model). The generic machinery lives elsewhere: [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages) covers outages across infrastructure, [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits) covers how cloud SLAs are measured and claimed, and the playbook covers [incident response](/docs/operations/incident-response) and [disaster recovery](/docs/operations/disaster-recovery).

## How the Platforms Do It

| Vendor | Published commitment, as of October 2026 | Credit | Claim | Status channel |
| --- | --- | --- | --- | --- |
| **Microsoft 365** (Online Services SLA, October 2026 edition) | Teams, Exchange Online and SharePoint Online: 99.9% uptime per month, measured in user-minutes; Teams Calling Plans, Teams Phone and Audio Conferencing: tiers starting at 99.999% | 25% below 99.9%, 50% below 99%, 100% below 95%; calling 5% below 99.999% up to 100% below 95% | By the end of the month following the incident's month, with users affected and errors; decided "typically within forty-five (45) days" | Service health in the admin center, Message center for planned changes, the Service Communications API in Graph, status.cloud.microsoft when sign-in fails |
| **Google Workspace** (last modified August 31, 2026) | 99.9% Monthly Uptime Percentage per covered service | Days of service added to the term (a monetary credit for monthly-billed online customers): 3 days below 99.9%, 7 below 99.0%, 15 below 95.0%; capped at 15 days a month | Support case within 30 days of becoming eligible | A public status dashboard |
| **Atlassian Cloud** (effective April 30, 2026) | Premium 99.9%, Enterprise 99.95% for Jira, Confluence, Jira Service Management and Jira Product Discovery | Enterprise 5% below 99.95%; both 10% below 99.9%, 25% below 99.0%, 50% below 95.0% of the affected product's monthly fees | Ticket within 15 days after the end of the month; only if the account has no overdue payments | Per-product Statuspage sites |
| **Slack** (effective July 11, 2024) | "Commercially reasonable efforts" to be available 24/7; no percentage on the public page | None on the public page | Not stated | slack-status.com |
| **Zoom** (as passed through by reseller Mitel, August 2025) | "Commercially reasonable efforts" toward 99.9% Monthly Availability Per Service, weighted by affected licenses; direct customers' terms are in their agreement | 20% of the affected SKU's list price below 99.9%, 50% below 98.0%, for impacted licenses only, split across bundled services by published allocation factors | Ticket opened during the downtime, through the reseller; credits applied within 90 days of the month's end | zoomstatus.com (status.zoom.us) |

Four patterns:

- **Credits are measured against users, not the service.** Microsoft's collaboration SLAs count downtime in user-minutes: "the sum of the length (in minutes) of each Incident... multiplied by the number of users impacted." Zoom's reseller terms use the same idea with licenses: affected licenses times downtime minutes over total licenses times the month's minutes. Google and Atlassian define downtime as an error rate above 5% for the customer's own traffic. Either way, the measurement is per tenant: a fleet-wide 99.99% says nothing about whether one organization's month qualified.
- **Credits come as time or as a share of fees.** Google credits days of service added to the end of the term; Microsoft, Atlassian and Zoom credit a percentage of fees against future invoices. None pays cash, and all are the sole remedy.
- **Plan tier buys the SLA.** Atlassian's SLA covers Premium and Enterprise only, with Enterprise getting a tighter target and an extra 5% tier. Google excludes the Essentials Starter edition. Free tiers are excluded everywhere: Microsoft says free services "are not included or eligible for SLA claims or credits."
- **Public SLAs are getting thinner, not thicker.** Slack's 2015 SLA "guarantees a 99.99% monthly uptime" for the Plus plan and above with credits of "100 times the amount" paid during downtime. The page in force since July 2024 promises commercially reasonable efforts and no credit. Large customers negotiate their SLA in the order form; the public page is a floor.

## What the Incident Reviews Teach

The public reviews of collaboration outages are unusually instructive because the products share a shape: many tenants, long-lived client connections, a boot call that loads everything a user needs, and caches that hide expensive queries. Five reviews cover most of the failure modes.

### Atlassian, April 2022: deleting tenants is the dangerous operation

On April 5, 2022, between 07:38 and 08:01 UTC, a maintenance script deleted 883 sites belonging to 775 customers. The team running it was retiring a legacy app, "Insight – Asset Management," and was handed site IDs instead of app IDs; the deletion API accepted either and "gave no warning" about which kind of object it was deleting. Peer review and staging didn't catch it because the site IDs didn't exist in staging. The first sites came back April 8, the last on April 18: up to 14 days for some customers.

The restore is the lesson. Atlassian kept backups for 30 days with point-in-time recovery and lost no more than five minutes of data for nearly all customers, so it "met our RPO" but "missed our RTO." Restoring individual tenants from backups built for whole-database recovery was slow: the first method took about 70 steps and roughly 48 hours per batch and required new site identifiers (used for 112 sites); the second, built during the incident, took over 30 steps and about 12 hours and reused old identifiers (771 sites). The script also deleted the sites' admin contacts and Cloud URLs, and the support form required a valid Cloud URL, so the affected admins couldn't file technical tickets; many billing and technical contacts on file were outdated. Atlassian's committed changes are a checklist for any multi-tenant product: block bulk site deletes, make soft delete universal with staged rollout and a tested rollback, automate multi-site restores and rehearse them, and keep authorized contact information outside the product instance.

### Slack, January 4, 2021: the first Monday back

Slack's review of January 4, 2021 starts with an AWS Transit Gateway that "became overloaded" and dropped packets as traffic rose after the holidays. Cold client caches made it worse: clients pulled more data on first connection. Packet loss lowered CPU, so autoscaling shrank the web tier; threads then backed up, so it tried to add capacity ("we attempted to add 1,200 servers to our web tier" between 7:01 and 7:15 a.m.), but the service that provisions new instances was slowed by the same network and hit the Linux open files limit and an AWS quota. Dashboards and alerting ran in a different VPC from their databases and failed with the gateway. AWS raised Transit Gateway capacity at 10:40 a.m. The fixes: put monitoring in the same VPC as its data, load test the provisioning service, and ask for preemptive capacity before the next holiday.

### Slack, February 22, 2022: a cache hid a scatter query

On February 22, 2022, a percentage-based rollout upgraded Consul on 25% of the fleet. Each agent restart deregistered a node, and the cache control plane replaced each departing memcached node with an empty spare, so the hit rate fell as the morning peak arrived. Client boot fetches a user's group DM memberships from a Vitess keyspace sharded by user, which means finding a conversation's members queries every shard; the cache normally hides that. With misses, "the database was overwhelmed as the read load increased superlinearly," queries timed out, the cache couldn't refill, and the system entered a metastable failure that didn't recover when the rollout paused. Engineers throttled client boot, raised the limit too fast once, and stepped it up again. The fix moved the query to a table sharded by channel and had the read fetch only what was missing from cache, from replicas as well as primaries, since membership of a group DM never changes.

### Zoom, April 16, 2025: the domain is a dependency

Zoom's April 16, 2025 incident ran from 11:25 a.m. to 1:12 p.m. Pacific. Zoom's DNS servers were answering correctly; the zoom.us domain had a registry-level block placed by GoDaddy Registry after "a communication error between Zoom's domain registrar, Markmonitor, and GoDaddy Registry." There was no product, security or network failure at Zoom. The remediation was a registry lock "that restricts server block commands from being placed on the zoom.us domain." For a product whose meeting links are URLs on one domain, the registry is part of the serving path; [Transfers & Locks](/books/hosting-and-cloud/transfers-and-locks) covers registry locks.

### Microsoft, January 25, 2023: the suite rides on a shared network

Microsoft's post-incident review for tracking ID VSG1-B90 covers a global WAN failure from 07:08 to 12:43 UTC that reached Microsoft 365 and Power Platform along with Azure. An engineer adding WAN capacity in Madrid ran a command from a procedure that had been changed and not revalidated; the command purged the routing protocol's topology database, and on one router vendor's equipment it ran across every router joined to that routing domain, so they all recomputed their topology at once. Re-advertising internet routes took about an hour and 40 minutes, most regions recovered by 09:05 UTC, and the same command on a second Madrid router 33 minutes after the first caused a second wave. The repair items were to audit and block commands with that reach across all three router vendors, show on-call engineers who is changing network devices in real time, and review every procedure still awaiting qualification. For a collaboration suite, the lesson is that its availability is bounded by a shared network it doesn't control at the product layer; per-tenant SLAs and service health have to account for incidents whose origin is two layers down.

### What the five have in common

- **Tenant-scoped operations need tenant-scoped safety.** Atlassian's deletion and restore both operated at the wrong grain. Deleting a workspace must be a soft delete with a delay; restoring one must be a routine, rehearsed operation, not a database recovery.
- **Boot is the critical path.** Both Slack reviews turn on what clients fetch when they start. A boot payload that depends on a cache must survive the cache being cold, and must be throttled in a way that protects users already connected.
- **Morning peaks are synchronized.** Workplace traffic follows working hours by time zone, and the first day after a holiday is the year's worst. Capacity plans and rollouts should know the calendar.
- **Shared layers fail everything above them.** A WAN procedure at Microsoft and a registry block at Zoom took out products whose own code was healthy; the product's dependency list has to include the network and the domain.
- **The customer's admin needs a path that doesn't depend on the product.** Contacts stored inside the deleted tenant and a support form that required the tenant's URL turned an outage into a communication failure.

The general patterns (global configuration pushes, control-plane dependencies, cells) are in [The Global-Config Failure Pattern](/books/hosting-and-cloud/outages-and-status-pages#the-global-config-failure-pattern) and [Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding); [Incidents at Communications Platforms](/books/hosting-and-cloud/outages-and-status-pages#incidents-at-communications-platforms) covers the messaging providers underneath.

## The Uptime Vendors Report

Microsoft publishes a quarterly worldwide uptime for Microsoft 365. As of October 2026 the table shows 99.98% to 99.99% every quarter of 2022 and 2023, 99.927% for Q4 2024, 99.954% for Q4 2025, and 99.526% for Q1 2026, followed by 99.994% for Q2 2026. A fleet-wide figure like this is a vendor metric, not a customer's: a tenant whose users were all in the affected region can have a far worse month than the average, which is why the SLA measures each tenant's user-minutes separately.

Two things follow for anyone building the product. The vendor needs per-tenant availability at the SLA's grain to know what it owes, and it should set its internal SLOs on the same definitions it publishes ([SLA Versus SLO](/books/hosting-and-cloud/slas-and-service-credits#sla-versus-slo)). And a user-minutes definition means an incident affecting a fifth of a tenant's users counts a fifth as much; the incident record has to carry the affected user count per tenant, not just a start and end time.

## Status, Service Health and the Admin

Consumer products publish one status page. Workplace vendors publish two layers: a public status page for everyone, and a tenant-scoped service health feed for admins that says whether this organization is affected.

Microsoft's model is the most detailed public example. The admin center's **Service health** page lists incidents ("a critical issue and the service or a major function of the service is unavailable") and advisories (a problem affecting some users "but the service is still available," often with a workaround), each with an ID, affected services, user impact, an issue origin (Microsoft or the customer's environment), and a status that moves through Investigating, Service degradation, Service interruption, Restoring service, Extended recovery, Service restored, False positive and Post-incident report published. Issues detected in the customer's own environment get their own section, "Issues for your organization to act on." Admins can report an issue that isn't listed; Microsoft compares reports across organizations and posts an incident if it originated with the service. Email notifications go to up to two addresses per admin. Updates come on an hourly cadence unless another is stated, and for broad incidents Microsoft commits to a preliminary post-incident review within 48 hours of resolution and a final one within five business days. When the admin can't sign in at all, status.cloud.microsoft is the fallback, and the same feed is available programmatically through the Service Communications API in Graph.

Atlassian runs a public Statuspage per product, Slack and Zoom one public page each. What the tenant-scoped layer adds is the difference between "Teams is degraded in Europe" and "your tenant's users in Europe can't join meetings," which is the information an admin needs to decide whether to tell five people or fifty thousand.

The admin's side of an outage is a workplace process the vendor should support, not replace:

- **Notify employees through another channel.** The chat tool can't announce its own outage. Admins keep an out-of-band path (email, an intranet banner, SMS) and a documented fallback (a phone bridge for meetings, the email thread for decisions).
- **Hold the contacts.** The vendor's outreach goes to the billing and technical contacts the organization registered. Atlassian found many outdated; its fix was to back them up outside the product. The organization's fix is to keep them current.
- **Decide whether to claim.** Every SLA in the table requires a claim within a window; most credits go unclaimed. Billing contacts own the claim, not the employees who were affected.

## Maintenance Windows and Change Notice

A suite updates continuously, so "maintenance" means two different things: planned work that may affect availability, and product changes that affect how people work. Both reach the admin, not the user.

- **Planned maintenance.** Microsoft notifies "no later than five days in advance of all planned maintenance" through Message center and schedules it when regional usage is lowest; planned maintenance is not shown in service health. Atlassian excludes routine scheduled maintenance and reasonable emergency maintenance from its SLA under its Maintenance Policy. Slack's public SLA excludes planned downtime with advance electronic notice.
- **Change notice.** Message center's "Plan for change" posts tell admins when a feature changes and how to prepare. This is the workplace version of a release note: the audience is the person who trains employees and updates internal documentation, and the lead time matters more than the wording. Release channels that let admins see changes early are covered in [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies).
- **SLA changes.** Microsoft won't modify the SLA during a subscription's initial term and gives "at least 90 days' notice for adverse material changes"; a renewal picks up the version current at renewal. That is the rule I'd copy: SLA versions are effective-dated, and a claim is judged by the version in force for that term.

## Backups, Restores and Shared Responsibility

Collaboration vendors replicate customer data and keep backups to recover from their own failures. Those backups are the vendor's, run on the vendor's schedule, and restored at the vendor's grain. They are not the customer's backup of its own content: an admin who deletes a workspace by mistake, an employee who wipes a SharePoint site, or ransomware that encrypts synced files is a customer-side event the vendor's disaster recovery isn't designed to undo.

Products cover the gap in three layers:

1. **In-product recovery.** Recycle bins, version history and soft-deleted containers let users and admins undo mistakes for a fixed period. These are product features governed by retention settings ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)).
2. **Vendor-run backup for the customer.** Microsoft 365 Backup backs up SharePoint sites, OneDrive accounts and Exchange mailboxes inside the Microsoft 365 boundary. As of October 2026: recovery windows configurable to 3 months, 6 months, 1 year or 2 years; recovery points every 10 minutes for the prior two weeks and weekly after that for OneDrive and SharePoint (every 10 minutes for 52 weeks for Exchange); restores of up to 1,000 average-sized sites at a median of 1 to 3 TB an hour; append-only storage; a 90-day grace period after offboarding; and pay-as-you-go billing at $0.15 per GB per month with restores free. Retention and deletion policies from Purview don't touch the backup window. Partner backup products can run on the same storage platform.
3. **Third-party backup.** Independent vendors copy data out through APIs into separate storage. They give independence from the vendor at the cost of API rate limits, partial fidelity (permissions, comments and integrations often don't round-trip) and a second copy of sensitive data to secure.

The decision of which layers to buy belongs to the customer's admin. The vendor's job is to make the first layer reliable, to offer the second if it can do it well, and to make the third possible through export APIs that don't fall over under a full-tenant copy ([APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits)).

For the vendor's own recovery, the Atlassian review sets the bar: a tenant-scoped restore must be an automated, rehearsed operation with a known duration, able to run for hundreds of tenants in parallel, keeping the tenant's identifiers so integrations and links keep working. The playbook's [Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter) states the general rule.

## Calendars, Cells and Morning Peaks

The architecture choices that make collaboration outages smaller are covered in [Building It Yourself](/books/workplace-and-collaboration/collaboration-architecture); three operational ones belong here:

- **Roll out by cell, outside the local morning.** A rollout that reaches 25% of a fleet at once (Slack's Consul upgrade) touches every tenant on those hosts. Rolling cell by cell, during each region's quiet hours, bounds the blast radius to a set of tenants and a time of day.
- **Budget for the first day back.** The Monday after a holiday is a predictable load event with cold caches and every client booting. Pre-scale, pre-warm caches, and freeze risky changes that week.
- **Shed boot, not sessions.** When the backend is overloaded, rate-limit new client boots so already-connected users keep working, as Slack did; then raise the limit in small steps, because the first big increase brings the overload back ([Reconnecting Without a Stampede](/docs/architecture/realtime-connections#reconnecting-without-a-stampede)).

## How to Build It

The core tables are fixed in the [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model); this chapter adds incident records with per-workspace impact, maintenance notices, versioned SLA terms, credit claims and tenant restore jobs. `subscriptions` and `workspaces` are core.

```sql
CREATE TABLE service_incidents (          -- one vendor-side incident or advisory
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  public_ref       TEXT NOT NULL UNIQUE,    -- 'INC-2026-0412', shown in service health
  kind             TEXT NOT NULL CHECK (kind IN ('incident', 'advisory')),
  services         TEXT[] NOT NULL,         -- 'chat', 'meetings', 'files', 'search'
  regions          TEXT[] NOT NULL DEFAULT '{}',
  cells            TEXT[] NOT NULL DEFAULT '{}',
  origin           TEXT NOT NULL CHECK (origin IN ('vendor', 'customer_environment',
                     'third_party')),
  status           TEXT NOT NULL CHECK (status IN ('investigating', 'degradation',
                     'interruption', 'restoring', 'extended_recovery', 'restored',
                     'false_positive')),
  user_impact      TEXT NOT NULL,           -- written for admins, not engineers
  started_at       TIMESTAMPTZ NOT NULL,
  mitigated_at     TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  public           BOOLEAN NOT NULL DEFAULT FALSE,  -- also on the public status page
  pir_due_at       TIMESTAMPTZ,             -- preliminary review deadline, if broad
  pir_published_at TIMESTAMPTZ
);

CREATE TABLE incident_impacts (           -- which tenants, how many people, for how long
  incident_id      UUID NOT NULL REFERENCES service_incidents (id),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  service          TEXT NOT NULL,
  impact_during    TSTZRANGE NOT NULL,
  affected_members INT NOT NULL,            -- for user-minute SLAs
  total_members    INT NOT NULL,            -- licensed members at the time
  error_rate_peak  NUMERIC(5,4),            -- for error-rate SLAs
  source           TEXT NOT NULL CHECK (source IN ('telemetry', 'admin_report',
                     'support')),
  PRIMARY KEY (incident_id, workspace_id, service, impact_during)
);

CREATE TABLE incident_updates (           -- the timeline admins read
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_id  UUID NOT NULL REFERENCES service_incidents (id),
  posted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       TEXT NOT NULL,
  body         TEXT NOT NULL,
  next_update_by TIMESTAMPTZ               -- the cadence promise, checked by a job
);

CREATE TABLE maintenance_notices (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  kind           TEXT NOT NULL CHECK (kind IN ('planned_maintenance', 'plan_for_change',
                   'sla_change')),
  services       TEXT[] NOT NULL,
  regions        TEXT[] NOT NULL DEFAULT '{}',
  maintenance_window TSTZRANGE,            -- null for a product change
  notified_at    TIMESTAMPTZ NOT NULL,
  min_notice     INTERVAL NOT NULL,        -- '5 days' for maintenance, '90 days' for
                                           -- adverse SLA changes
  body           TEXT NOT NULL,
  CHECK (maintenance_window IS NULL
         OR lower(maintenance_window) >= notified_at + min_notice)
);

CREATE TABLE sla_terms (                  -- one published version per service and plan
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  service          TEXT NOT NULL,
  plan_codes       TEXT[] NOT NULL,         -- plans.code values that carry it
  version          INT NOT NULL,
  measurement      TEXT NOT NULL CHECK (measurement IN ('user_minutes',
                     'error_rate_minutes')),
  error_threshold  NUMERIC(4,3),            -- 0.050 for "more than 5% errors"
  target_pct       NUMERIC(7,4) NOT NULL,   -- 99.9000
  credit_form      TEXT NOT NULL CHECK (credit_form IN ('fee_percent', 'service_days')),
  credit_tiers     JSONB NOT NULL,          -- [{"below": 99.9, "value": 25}, ...]
  claim_window     JSONB NOT NULL,          -- {"basis": "end_of_following_month"} or
                                            -- {"basis": "eligible", "days": 30}
  requires_paid_up BOOLEAN NOT NULL DEFAULT FALSE,
  document_url     TEXT NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (service, version)
);

CREATE TABLE sla_credits (                -- a claim and its outcome, per subscription
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id   UUID NOT NULL REFERENCES subscriptions (id),
  sla_terms_id      UUID NOT NULL REFERENCES sla_terms (id),
  period            TSTZRANGE NOT NULL,     -- the calendar month measured
  origin            TEXT NOT NULL CHECK (origin IN ('customer', 'automatic')),
  submitted_at      TIMESTAMPTZ NOT NULL,
  submitted_by      UUID REFERENCES members (id),  -- a billing admin
  incident_ids      UUID[] NOT NULL DEFAULT '{}',
  measured_uptime   NUMERIC(8,5),
  credit_value      NUMERIC(10,2),          -- percent of fees or days of service
  status            TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'denied',
                      'late')),
  decision_reason   TEXT,
  applied_invoice   TEXT,                   -- the invoice or term extension it hit
  UNIQUE (subscription_id, sla_terms_id, period)
);

CREATE TABLE workspace_restores (         -- vendor-run, tenant-scoped recovery
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  reason          TEXT NOT NULL CHECK (reason IN ('soft_delete_undo', 'vendor_incident',
                    'customer_request', 'drill')),
  restore_point   TIMESTAMPTZ NOT NULL,
  keep_ids        BOOLEAN NOT NULL DEFAULT TRUE,   -- same workspace and item IDs
  requested_by    TEXT NOT NULL,           -- typed actor
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('queued', 'running', 'verifying',
                    'done', 'failed')),
  verification    JSONB                     -- item counts before and after, by kind
);
```

User-minute uptime for one subscription's month, Microsoft's method, from the impact rows:

```sql
-- $1: subscriptions.id, $2: service, $3: the month (TSTZRANGE)
WITH ws AS (
  SELECT w.id FROM workspaces w
  JOIN subscriptions s ON s.organization_id = w.organization_id
  WHERE s.id = $1
),
licensed AS (
  SELECT seat_quantity AS seats FROM subscriptions WHERE id = $1
),
down AS (
  SELECT SUM(ii.affected_members *
             EXTRACT(EPOCH FROM (upper(ii.impact_during * $3) -
                                 lower(ii.impact_during * $3))) / 60) AS user_minutes
  FROM incident_impacts ii
  JOIN service_incidents si ON si.id = ii.incident_id
  WHERE ii.workspace_id IN (SELECT id FROM ws)
    AND ii.service = $2
    AND ii.impact_during && $3
    AND si.origin = 'vendor'                 -- customer-side issues are excluded
)
SELECT ROUND(100 * (1 - COALESCE(down.user_minutes, 0) /
         (licensed.seats * EXTRACT(EPOCH FROM (upper($3) - lower($3))) / 60)), 5)
         AS uptime_pct
FROM down, licensed;
```

Notes on the sketch:

- **Impact is per workspace.** The incident is one row; what each tenant experienced is another. Telemetry fills `incident_impacts` automatically from per-tenant error rates; admin reports and support tickets add rows the telemetry missed. The tenant-scoped service health page is a query over this table.
- **The cadence is enforced.** `next_update_by` is the promise to admins; a job pages the incident communicator when it passes without a new update, the same way a breached SLA timer would.
- **Notice is a constraint.** A maintenance window that starts before its minimum notice can't be inserted. Emergency maintenance is an incident, not a notice.
- **Credits can be automatic.** With the data above, the vendor can compute every subscription's uptime monthly and insert `origin = 'automatic'` credits; customer claims remain for when the admin's evidence differs. An approved credit is applied by the billing system ([Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management)) as a fee percentage on the next invoice or as days added to the term.
- **Restores keep identifiers.** `keep_ids` is the default because links, integrations, API tokens and audit records point at workspace and item IDs; a restore that issues new ones (Atlassian's first method) breaks every integration the customer built.
- **Deletes go through soft delete.** Workspace deletion sets a `deleted_at` and a purge date on `workspaces`, with a restore window long enough for the customer's admin to notice; the purge job refuses to run on workspaces not past it, and bulk deletes across many workspaces require a second operator.
- **Drills use the same table.** `reason = 'drill'` restores into a scratch workspace on a schedule, and `verification` compares counts, so restore time is a measured number, not a hope.
- **Contacts live outside the tenant.** The organization's incident and billing contacts are stored with `organizations`, replicated separately from workspace data, so deleting or losing a workspace never deletes the people to call.

## Auditing

- **Every incident's timeline.** Status changes, updates with their times, the affected services and tenants, and the post-incident review, kept long enough to answer an SLA claim and a customer's annual vendor review.
- **Per-tenant impact.** The affected-member counts and windows behind every uptime calculation, so a credit can be recomputed.
- **Every SLA version and every claim.** Terms in force by date, the measurement, the decision and who made it, and where the credit was applied.
- **Every destructive operation on a tenant.** Workspace deletes, purges and restores in `audit_events`, with the operator, the ticket and the second approver, because the costliest collaboration outage on record was a delete ([Audit Trails](/docs/architecture/audit-trails)).
- **Restore drills.** Dates, durations and verification results, which customers increasingly ask for in security questionnaires ([From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises)).

## What This Means for the System You Build

- **Measure availability per tenant,** in user-minutes or per-tenant error rates, at the grain your SLA promises.
- **Give admins a tenant-scoped service health feed** with incidents, advisories, user impact and an API, plus a status page that works when sign-in doesn't.
- **Make tenant deletion a soft delete** with a delay, a second approver for bulk operations and a purge date.
- **Make tenant restore routine:** automated, rehearsed, parallel, and preserving identifiers.
- **Keep customer contacts outside the tenant** and let admins reach support without a working workspace.
- **Design client boot to survive a cold cache,** and throttle new boots before existing sessions.
- **Plan capacity and rollouts around the working calendar:** cell by cell, outside local mornings, frozen around the first day back.
- **Version SLAs, give notice for adverse changes,** and compute credits automatically when you can.
- **Treat customer-side backup as the customer's decision,** and keep export APIs able to carry a full tenant.

## References

**Vendor SLAs and service documentation**

- [Microsoft: Service Level Agreements for Online Services](https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services), the consolidated SLA editions, October 2026 current
- [Microsoft: Online Services Consolidated SLA, October 2026 (Word document)](https://www.microsoft.com/licensing/docs/documents/download/OnlineSvcsConsolidatedSLA(WW)(English)(October_2026)(CR).docx), user-minute downtime, Teams, SharePoint and calling credit tiers, claim deadline, 45-day processing, 90 days' notice for adverse changes, free services excluded
- [Microsoft Learn: Service health and continuity](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/service-health-and-continuity), five days' maintenance notice, hourly updates, preliminary PIR within 48 hours and final within five business days, quarterly worldwide uptime 2022 to 2026
- [Microsoft Learn: How to check Microsoft 365 service health](https://learn.microsoft.com/en-us/microsoft-365/enterprise/view-service-health), incidents vs advisories, status definitions, issue origin, reporting an issue, email notifications, status.cloud.microsoft fallback
- [Microsoft Learn: Overview of Microsoft 365 Backup](https://learn.microsoft.com/en-us/microsoft-365/backup/backup-overview), recovery windows, recovery points, restore speeds, append-only storage, 90-day grace period and $0.15 per GB per month
- [Google Workspace: Service Level Agreement](https://workspace.google.com/terms/sla.html), 99.9% target, day-based credits, 15-day cap, 30-day claim window, 5% error-rate downtime, last modified August 31, 2026
- [Atlassian: Service Level Agreement](https://www.atlassian.com/legal/sla), Premium and Enterprise commitments, eligible products, 5% error-rate minutes, credit tiers, 15-day claim window, paid-up requirement, effective April 30, 2026
- [Slack: Service Level Agreement](https://slack.com/intl/en-au/terms/service-level-agreement), commercially reasonable efforts and planned downtime exclusion, effective July 11, 2024
- [Mitel: Zoom Availability Service Level Agreement Supplemental Terms (August 12, 2025, PDF)](https://www.mitel.com/sites/default/files/2025-08/Zoom%20Availability%20SLA_TMP%20%2812Aug25%29%20FINAL%20v1.pdf), the 99.9% target, the license-weighted availability formula, 20% and 50% credit levels, bundled-SKU allocation factors, the claim during downtime through the reseller and the 90-day credit
- [Slack: Service Level Agreement (archived January 7, 2015)](https://slack.com/policy-archives/service-level-agreement/2015-01-07), the earlier 99.99% guarantee and 100x credits for Plus and above

**Incident reviews**

- [Azure status history: Post Incident Review VSG1-B90, Azure Networking global WAN (January 25, 2023)](https://azure.status.microsoft/en-us/status/history/?trackingid=VSG1-B90), times, the purge command and its multi-router reach, Microsoft 365 impact, the second wave and repair items
- [Atlassian Engineering: Post-incident review on the Atlassian outage of April 2022](https://www.atlassian.com/engineering/post-incident-review-april-2022-outage), 883 sites and 775 customers, cause, restore methods and durations, RPO met and RTO missed, 30-day backups, contact and support failures, committed changes
- [Slack Engineering: Slack's outage on January 4th 2021](https://slack.engineering/slacks-outage-on-january-4th-2021/), Transit Gateway overload, autoscaling and provisioning failures, monitoring dependency, timeline and fixes
- [Slack Engineering: Slack's incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/), Consul rollout, empty cache nodes, the scatter query on a user-sharded keyspace, boot throttling and fixes
- [Zoom status: Issue with multiple Zoom services (April 16, 2025)](https://www.zoomstatus.com/incidents/pw9r9vnq5rvk), times, the registry server block, and the registry lock remediation
