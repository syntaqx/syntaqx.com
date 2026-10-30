+++
title = "Workplace Metrics"
description = "Vendor metrics from filings (ARR, net retention, large customers, DAU) and customer metrics (adoption reports, license reclaim), and what each misses."
category = "Workplace & Collaboration Industry"
order = 2067
part = "Running the Platform"
tags = ["metrics", "net-retention", "adoption", "license-utilization", "saas-management"]
+++

Workplace software is measured from two sides, and the two sides want different answers from the same data. The vendor wants to know whether accounts are growing: more seats, higher tiers, more products, fewer cancellations. The customer wants to know whether it's paying for seats nobody uses, whether a rollout worked, and which tools overlap. Both read activity: who signed in, who sent a message, who joined a meeting. And both are constrained by the fact that the activity belongs to employees, whose employer is the vendor's customer, which makes the line between an adoption dashboard and employee surveillance a design decision the vendor makes and the customer's admin enforces.

This chapter covers the metrics vendors report in filings and what their definitions actually count, the activity metrics a product team uses internally, the adoption and usage reports vendors give customer admins, license utilization and reclaim, and SaaS management tools that measure across vendors. It adds metric definitions, aggregated activity and license reclaim candidates to the core data model. The general mechanics are in the playbook's [Product Analytics](/docs/telemetry/product-analytics) and, for infrastructure providers, [Operating Metrics](/books/hosting-and-cloud/operating-metrics). How admins can and can't use activity data about individuals is the subject of Employee Monitoring & Privacy; this chapter keeps to metrics.

## How the Platforms Do It

What vendors disclose, from their own filings:

| Vendor | Customer metric | Large-customer metric | Retention metric | Activity metric |
| --- | --- | --- | --- | --- |
| **Slack** (S-1, as of January 31, 2019) | More than 88,000 paid customers (an organization with three or more users on a paid plan); more than 600,000 organizations with three or more users | 575 paid customers above $100,000 ARR, about 40% of fiscal 2019 revenue | Net dollar retention 143% (152% and 171% in the two prior years) | DAU above 10 million (created or consumed content in 24 hours, free or paid) |
| **Atlassian** (Q4 FY26 shareholder letter, quarter ended June 30, 2026) | 57,334 customers above $10,000 in Cloud ARR, over 85% of Cloud ARR | More than 700 customers above $1M ARR | Not disclosed in the letter | Rovo-assisted actions up over 50% quarter on quarter; over 80% of the Fortune 500 use Rovo |
| **Zoom** (Q2 FY27 release, quarter ended July 31, 2026) | Enterprise revenue $787.5 million, up 7.8%; Enterprise customers are business units engaged by direct sales, resellers or partners | 4,625 customers above $100,000 trailing 12-month revenue, up 8.2% | Trailing 12-month net dollar expansion rate for Enterprise customers 99%; Online average monthly churn 2.9% | Not in the release |

The patterns:

- **Everyone counts customers above a revenue line.** $10,000 of Cloud ARR at Atlassian, $100,000 of ARR at Slack, $100,000 of trailing revenue at Zoom. The large-customer count is the closest public proxy for enterprise success, and the share of revenue they represent (about 40% at Slack in 2019, over 85% of Cloud ARR above $10,000 at Atlassian) says how concentrated the business is.
- **"Customer" means different things.** Slack counted organizations with three or more paid users; Zoom counts "distinct business units," so one company can be several Enterprise customers. Comparisons across vendors without the definitions are meaningless.
- **Net retention moves with the cycle.** Slack's fell from 171% to 143% in two years as it grew; Zoom's Enterprise expansion rate sits at 99%, meaning existing Enterprise customers in aggregate spend about what they spent a year earlier. Net retention above 100% is seat and tier expansion outrunning churn and contraction.
- **Activity metrics fade from filings as companies mature.** Slack's S-1 led with DAU; later filings and letters from mature vendors report revenue cohorts and AI usage instead.

## What the Vendor Metrics Count

The definitions behind the numbers, and the traps in each:

- **ARR.** Annualized recurring revenue at a point in time: committed subscription value, annualized. It excludes usage and one-time fees by definition at most vendors, which matters as AI credits and metered add-ons grow. [Recurring Revenue: ARR and Run Rate](/books/hosting-and-cloud/operating-metrics#recurring-revenue-arr-and-run-rate) covers the variants.
- **Net dollar retention (or net expansion, net revenue retention).** Revenue this period from customers who were customers a year ago, divided by their revenue a year ago. It includes seat expansion, tier upgrades and cross-sell, net of contraction and churn. For seat-based workplace software it is mostly a measure of customers' hiring and of how many teams adopt; it falls when customers cut staff, regardless of product quality. [Net Dollar Retention and Its Variants](/books/hosting-and-cloud/operating-metrics#net-dollar-retention-and-its-variants) covers the formulas.
- **Churn by segment.** Zoom reports Online (self-serve) monthly churn separately from Enterprise expansion: 2.9% a month for Online customers, consistent with a year earlier. Self-serve and enterprise customers behave so differently that a blended churn number hides both.
- **Customers.** Defined by the vendor: an organization with a minimum number of paid users, a business unit, a billing account. The definition decides whether a company with five workspaces is one customer or five.
- **Paid seats.** The quantity on subscriptions, which for annual plans is the commitment, not current use ([Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management#counting-seats)). A vendor's paid seats can rise while customers' active users fall, until renewal.
- **DAU and MAU.** Slack's S-1 definition, "created or consumed content in a 24-hour period," counts readers as active. Definitions differ on whether a background client connection, a notification opened, or a meeting joined counts. DAU/MAU (stickiness) measures daily habit, which chat products have and project tools often don't; comparing them across categories is a mistake.

What the vendor metrics miss: whether the product is the system of record for the work it's meant to hold, whether usage is concentrated in a few power users, and whether customers are paying for seats they don't use. The last one is the customer's metric.

## Product Metrics Inside the Vendor

A product team runs on activity metrics computed per workspace and per member, with definitions that live in code ([Metric Definitions as Code](/docs/telemetry/product-analytics#metric-definitions-as-code)):

- **Activation.** The point at which a new workspace works for its team: a threshold of members, messages or items, integrations connected, within a window. It predicts paid conversion and retention, and it's specific to each product.
- **Workspace health.** Active members as a share of members, breadth across channels or projects, admins active, integrations in use, support tickets. Customer success teams use it to find accounts at risk before renewal.
- **Seat utilization.** Active members over paid seats, per subscription. Low utilization predicts contraction at renewal, which is why vendors with annual plans watch it as closely as customers do.
- **Feature adoption.** Use of the features that justify the tier (SSO configured, retention set, audit log exported, AI used), which tells the vendor whether an enterprise customer is getting what it pays for.
- **Expansion signals.** Domain spread and plan limits, used for sales ([Expansion Signals and Sales Assist](/books/workplace-and-collaboration/selling-to-enterprises#expansion-signals-and-sales-assist)).

The privacy rule for all of these: computed from metadata and events, never from content, and aggregated before anyone outside the product's data team sees them. The vendor is a processor of the customer's employees' data; its own analytics must stay within what its terms and the customer's DPA allow ([Consent and Privacy](/docs/telemetry/consent-and-privacy)).

## Adoption Reports for the Customer

Vendors give customer admins their own view of usage, and the design of those reports is where the employee-privacy question gets decided.

**Microsoft 365 usage reports.** Available for the last 7, 30, 90 and 180 days, typically within 24 to 72 hours, covering active users, email, OneDrive, SharePoint, Teams, Copilot and other services, and accessible through the Microsoft Graph reports API and Power BI. By default "all reports hide user information such as usernames, display names, groups, and sites to help companies support local privacy laws"; a Global Administrator can turn the concealment off, and showing identifiable user information "is a logged event" in the Purview audit log. When a user account is deleted, its usage data is deleted within 30 days. The reports' stated purpose includes license decisions: seeing who "barely uses it and might not need a Microsoft 365 license."

**Microsoft Adoption Score.** An organization-level score: five equally weighted categories (communication, meetings, content collaboration, teamwork, mobility) of 100 points each, plus AI adoption when Copilot licenses are enabled, for a maximum of 600 after the Technology experiences score was retired in early 2026 (the maximum had been 900). It is updated daily over the last 28 days, with 28-day and 180-day views, and compares the organization to peer benchmarks of similar region, size, license types, industry and tenure. "All insights are calculated using data at the organizational level, not the individual level," and the report is restricted to specific admin and reader roles. The history of its predecessor, Productivity Score, is covered in Employee Monitoring & Privacy.

**Slack analytics.** A dashboard whose "views and metrics available to you depend on your plan": basic metrics on Free, channel, member, AI and app detail on paid plans, private channel analytics only on Enterprise. Member analytics are visible to Workspace Owners and Admins by default; Owners can open them to all members or turn member metrics off; any member can see the Overview tab. Channel and member tables export to CSV.

The common design, and my default for building one:

- **Organization-level by default,** with individual detail off unless an admin turns it on, and turning it on audited.
- **Role-gated,** with a reporting role that doesn't carry admin powers.
- **Defined.** Every metric has a published definition (what counts as active, over what window).
- **Exportable through an API,** because large customers build their own dashboards.
- **Deleted with the user,** on a stated schedule.

## License Utilization and Reclaim

For the customer, the most valuable metric is the simplest: seats paid for and not used. In a seat-based suite at a large company, unused seats accumulate from leavers not deprovisioned, contractors whose projects ended, people licensed for a product they never adopted, and premium tiers given to everyone when a few needed them.

The process the customer's IT runs:

1. **Inventory.** Licenses purchased and assigned, per product and tier. Microsoft's admin center shows assigned and unassigned licenses under Billing and who is licensed under Users.
2. **Activity.** Last activity date per user per product. Microsoft's reports define it as "the most recent date on which a user performed any intentional activity within the app," independent of the report period.
3. **Candidates.** Users with no activity in a window (30, 60 or 90 days), excluding those on leave, new joiners and accounts that must stay licensed for compliance (a mailbox under litigation hold, for example).
4. **Action.** Notify the user or their manager, downgrade or remove the license, and return it to the pool. Under an annual commitment, a reclaimed license is reassigned to a new hire rather than reducing the bill, until the renewal, when the quantity can drop ([True-Ups and Tiers](/books/workplace-and-collaboration/billing-and-seat-management#true-ups-and-tiers)).

Some vendors do part of this for the customer in billing: Slack's Fair Billing Policy credits members inactive for more than 28 days automatically ([Proration](/books/workplace-and-collaboration/billing-and-seat-management#proration)). Most don't, and the customer reclaims through its own process.

What utilization misses: a seat used once a month may be essential (an executive approving documents, an auditor reviewing), and a seat used daily may duplicate another tool. Utilization says whether a license is used, not whether it's needed.

## SaaS Management Across Vendors

Large companies run hundreds of SaaS applications, many bought by teams on cards, and a category of SaaS management platforms (Zylo, Productiv, Torii and others) measures them together: discovering applications from expense data, single sign-on logs and browser extensions; pulling license and usage data through vendor APIs; flagging overlapping tools (three whiteboards, two chat tools); and tracking renewal dates so contracts are reviewed before they auto-renew. They depend on the APIs and reports workplace vendors expose, which is one more reason to offer usage data at the license level through an API.

For the customer, the cross-vendor metrics are cost per seat per product, utilization per product, overlap by category, and renewal exposure by month. For the vendor, a SaaS management platform is a new reader of its usage API with an agenda: finding seats to cut. Vendors that publish clear activity definitions and accurate last-activity dates come out of that review better than those whose data doesn't reconcile with their invoices.

## How to Build It

The core tables (`workspaces`, `members`, `subscriptions`, `seat_assignments`, `audit_events`) are fixed. This chapter adds versioned metric definitions, per-member daily activity flags (not content), a customer-facing privacy setting, and reclaim candidates.

```sql
CREATE TABLE metric_definitions (            -- one published definition per metric version
  code          TEXT NOT NULL,               -- 'active_member', 'dau', 'seat_utilization'
  version       INT NOT NULL,
  audience      TEXT NOT NULL CHECK (audience IN ('vendor_internal', 'customer_report',
                  'external_disclosure')),
  definition    TEXT NOT NULL,               -- plain-language rule shown with the number
  sql_ref       TEXT NOT NULL,               -- the query or model that computes it
  window_days   SMALLINT,                    -- 1 for daily, 28 for rolling
  valid_during  DATERANGE NOT NULL,
  PRIMARY KEY (code, version)
);

CREATE TABLE member_daily_activity (          -- flags per member per product per day
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  member_id     UUID NOT NULL REFERENCES members (id),
  day           DATE NOT NULL,
  product       TEXT NOT NULL,               -- 'chat', 'meetings', 'docs'
  intentional   BOOLEAN NOT NULL,            -- an action, not a background connection
  created_content BOOLEAN NOT NULL,
  consumed_content BOOLEAN NOT NULL,
  PRIMARY KEY (workspace_id, member_id, product, day)
) PARTITION BY RANGE (day);

CREATE TABLE workspace_report_settings (      -- what the customer's admin chose
  workspace_id        UUID PRIMARY KEY REFERENCES workspaces (id),
  conceal_identities  BOOLEAN NOT NULL DEFAULT TRUE,   -- names hidden in reports
  member_metrics_visibility TEXT NOT NULL DEFAULT 'admins'
    CHECK (member_metrics_visibility IN ('off', 'admins', 'all_members')),
  updated_by          UUID NOT NULL REFERENCES members (id),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE license_reclaim_candidates (
  subscription_id   UUID NOT NULL REFERENCES subscriptions (id),
  member_id         UUID NOT NULL REFERENCES members (id),
  last_activity_on  DATE,                    -- null: never active
  inactive_days     INT NOT NULL,
  excluded_reason   TEXT CHECK (excluded_reason IN ('legal_hold', 'leave',
                      'new_joiner', 'service_account', 'admin_override')),
  computed_on       DATE NOT NULL,
  action            TEXT CHECK (action IN ('notified', 'downgraded', 'removed', 'kept')),
  action_by         UUID REFERENCES members (id),
  PRIMARY KEY (subscription_id, member_id, computed_on)
);
```

Seat utilization and reclaim candidates for one subscription, using "intentional activity in the last 28 days" as the active definition:

```sql
-- $1: subscription id, $2: product, $3: inactivity threshold in days
WITH seats AS (
  SELECT sa.member_id
  FROM seat_assignments sa
  WHERE sa.subscription_id = $1 AND sa.released_at IS NULL
),
last_seen AS (
  SELECT s.member_id, MAX(a.day) AS last_activity_on
  FROM seats s
  LEFT JOIN member_daily_activity a
    ON a.member_id = s.member_id AND a.product = $2 AND a.intentional
  GROUP BY s.member_id
)
SELECT
  COUNT(*) FILTER (WHERE last_activity_on >= current_date - 27)::numeric
    / NULLIF(COUNT(*), 0) AS utilization_28d,
  ARRAY_AGG(member_id) FILTER (
    WHERE last_activity_on IS NULL OR last_activity_on < current_date - $3
  ) AS reclaim_candidates
FROM last_seen;
```

Notes on the sketch:

- **Flags, not events, leave the product.** `member_daily_activity` stores booleans per day, derived from the event stream; it never stores what was written or read. That's enough for activation, utilization, DAU and reclaim, and it bounds what a report can reveal.
- **Definitions are versioned and shown.** Every number in a customer report carries its `metric_definitions` code and version, so "active" means the same in the dashboard, the API and the invoice reconciliation, and a change is visible.
- **Concealment is the default.** Customer reports replace member identities with stable pseudonyms unless `conceal_identities` is off; switching it off writes `audit_events`, as Microsoft logs the same change.
- **Exclusions are explicit.** A member under legal hold, on leave, or a service account is excluded from reclaim with the reason recorded; the legal hold check reads `hold_custodians`.
- **Deletion follows the member.** When a member is deleted, their activity rows are deleted on a stated schedule; aggregates already computed keep their totals.
- **External metrics are reproducible.** The figures a vendor discloses (customers above a revenue line, net retention) are computed from billing tables under `external_disclosure` definitions, versioned, so a restated number can be explained.

## Auditing

- **Every metric definition version** and the dates it applied, for vendor disclosures and customer reports alike.
- **Every change to report privacy settings,** who made it and when.
- **Every reclaim action,** the activity evidence behind it and the exclusions considered.
- **Access to member-level analytics,** by whom, so a customer can show its employees and works council how the data was used.

## What This Means for the System You Build

- **Publish the definition with every metric:** what counts as a customer, an active member, a seat.
- **Report large customers by a revenue line and segment churn** (self-serve versus enterprise) instead of blending.
- **Store activity as daily flags, not content,** and compute product, customer and disclosure metrics from the same flags.
- **Give admins organization-level adoption reports by default,** with identities concealed until an admin chooses otherwise, and audit the choice.
- **Expose last-activity dates per license through an API** so customers and SaaS management tools can reclaim seats.
- **Exclude legal holds and other must-keep accounts** from reclaim automatically.
- **Remember that utilization measures use, not need.**

## References

**Filings**

- [Slack Technologies: Form S-1 (April 26, 2019)](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm), organizations, paid customers and their definition, customers above $100,000 ARR and their revenue share, DAU and its definition, net dollar retention
- [Atlassian: Q4 FY26 shareholder letter (Form 8-K exhibit 99.2, August 6, 2026)](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000031/teamq42026shareholderlet.htm), customers above $10,000 Cloud ARR and their share, customers above $1M ARR, Rovo usage, seat expansion
- [Zoom Communications: Q2 FY27 results (Form 8-K exhibit 99.1, August 25, 2026)](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000119/zm-20260731ex991.htm), Enterprise revenue, customers above $100,000 trailing revenue, Enterprise net dollar expansion, Online churn and the Enterprise customer definition

**Vendor documentation**

- [Microsoft Learn: Microsoft 365 admin center usage reports overview](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/activity-reports), report periods and latency, roles, concealed identities by default and the audited setting, deletion of usage data, last activity date
- [Microsoft Learn: Microsoft Adoption Score report overview](https://learn.microsoft.com/en-us/microsoft-365/admin/adoption/adoption-score), categories and points, the 600 maximum after the 2026 change, the 28-day window, peer benchmarks and organization-level calculation
- [Slack Help Center: View your Slack analytics dashboard](https://slack.com/help/articles/218407447-View-your-Slack-analytics-dashboard), metrics by plan, private channel analytics on Enterprise, member analytics visibility and export
- [Slack Help Center: Slack's Fair Billing Policy](https://slack.com/help/articles/218915077-Slacks-Fair-Billing-Policy), automatic credits for members inactive more than 28 days
