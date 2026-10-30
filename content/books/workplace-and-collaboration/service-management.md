+++
title = "IT & Service Management"
description = "ITIL practices, request portals, incidents, problems and changes, SLA clocks, the CMDB and HR service in ServiceNow, Jira Service Management and Freshservice."
category = "Workplace & Collaboration Industry"
order = 2035
part = "Work Management"
tags = ["itsm", "service-management", "slas", "cmdb", "change-management"]
+++

IT service management (ITSM) is work management for the people who keep a company's systems and services running: a portal where employees ask for things, queues where agents work them, clocks that measure how fast, and records of every incident, problem and change. It descends from ITIL, the practice framework that PeopleCert now publishes, and it is a large business: ServiceNow reported $12.9 billion of subscription revenue for 2025, and Freshworks says it derives "substantially all" of its revenue from Freshservice and Freshdesk. The same machinery now runs HR, facilities, legal and finance requests, under the name enterprise service management.

What makes it hard is that every record is a commitment. A request type promises a form and a path; an SLA promises a time, measured on a calendar with business hours and holidays, paused while someone waits for the requester; a change record promises that someone assessed the risk and someone else approved it. Those promises are made by the customer's service owners to their own employees, and in IT the customer is also the operator: the admin who configures the service desk sets the clocks that measure their own team. The vendor's part is the engine (forms, queues, SLA calculation, approvals, the configuration database) and the guarantee that a clock means the same thing in a report as on a ticket.

This chapter covers ITIL's practices as data, requests and portals, incidents, problems and changes, SLA clocks, the CMDB, and service beyond IT. Customer service desks for a company's own customers (Zendesk and similar) appear only as a contrast; the playbook's [Customer Support](/docs/operations/customer-support#ticket-states) covers that side. Running an incident on your own production systems (declaring, roles, postmortems) is the playbook's [Incident Response](/docs/operations/incident-response#severity-levels) and the Hosting & Cloud chapter on [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#post-mortems-as-a-product); this chapter is the record-keeping system those practices run in.

## How the Platforms Do It

As of October 2026:

| Product | Position | Licensing | SLA engine | Change | Configuration and assets | Employee service |
| --- | --- | --- | --- | --- | --- | --- |
| **ServiceNow** | The enterprise platform; ITSM, ITOM, security operations, CRM and "Core Business" workflows | Subscription; 603 customers above $5 million ACV at December 31, 2025 | Task SLA records per task, multiple SLAs per task, schedules, pause | Standard, normal and emergency changes with state models; CAB definitions and meetings | CMDB and the Common Service Data Model (CSDM) | HR Service Delivery, workplace service delivery |
| **Jira Service Management** | Atlassian's service desk; the foundation of Service Collection (October 2025) | Per agent; customers who submit requests are free. Free for 3 agents; Standard $21.50 and Premium $55.28 per agent per month billed monthly; Enterprise annual only | Start, pause and stop conditions; calendars with hours, holidays and time zone | Standard, normal and emergency; approvals; deployment gating on Premium | Assets | Templates for HR, marketing and other teams on every plan |
| **Freshservice** | Mid-market ITSM from Freshworks | Per agent: Starter $19, Growth $49, Pro $99 per month billed annually; Enterprise custom | SLA management from Growth | Change, problem, release and major incident management on Pro and Enterprise | Asset management licensed in Asset Units, packs of 500 | Freshservice for Business Teams (HR, finance, facilities, legal) |
| **Zendesk** (contrast) | Customer service for a company's customers | Not covered in the sources cited here | SLA policies with first reply, next reply, periodic update, requester wait, agent work time and resolution targets | Not an ITSM change product | Not covered in the sources cited here | Not the focus |

Three patterns run through the table. **Agents pay, requesters don't:** every ITSM product licenses the people who work tickets and lets the whole company submit them, which is why seat counts in this market are a fraction of headcount. **The SLA engine is the product's core**, and its rules (what starts, pauses and stops a clock; which calendar applies) are the most configured and most disputed part. **ITIL's vocabulary is the schema:** incidents, problems, changes and requests are distinct record types with distinct workflows in every product, because the framework made them distinct.

## ITIL as a Data Model

ITIL 4 "launched in 2019" with guidance for "34 management practices," each defined as "a set of 4-dimensional organizational resources designed for performing work/accomplishing an objective." PeopleCert revised the first five practices in 2023 (incident management, problem management, service request management, monitoring and event management, and service desk), and as of October 2026 ITIL (Version 5) Foundation is available in English, with Version 5 organizing the 34 practices into product and service management practices and general management practices, keeping ITIL 4's value system and guiding principles, and running alongside ITIL 4 until "the current plan is to sunset all ITIL 4 modules on 31 December 2027." PeopleCert describes Version 5 as "not a reset."

For a builder, the practices that become record types are few:

- **Service request management**: a user asks for something standard (access, a laptop, a password reset). Requests come from a catalog and follow a fulfillment path.
- **Incident management**: something is broken or degraded. ServiceNow's definition is the standard one: it "restores normal service operation while minimizing impact to business operations and maintaining quality."
- **Problem management**: the underlying cause of one or more incidents, worked separately so incidents can close when service is restored.
- **Change enablement**: a planned modification to a service, assessed and authorized before it happens.
- **Service configuration management and IT asset management**: what exists, how it connects, and who owns it.

Each is a work item type with its own workflow, fields and SLAs ([Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#types-and-hierarchies)), linked to the others: incidents to the problem behind them, problems to the change that fixes them, all of them to the configuration items affected.

## Requests and Queues

In Jira Service Management, "request types are the types of requests that your customers can create," grouped "into portal groups" on a portal; each request type is a form with its own fields and workflow. Agents work from queues, saved filters over requests with a published limit: "the total number of queues is limited to 300 per service space per work category across all sections," with counts shown as "999+" beyond 999. The roles split by license: an agent is "a licensed role"; a customer is "an unlicensed role for individuals who submit requests"; stakeholders ("an unlicensed role for individuals who are not responders to an incident") exist only above Standard, since on Free and Standard only agents can be added as incident stakeholders. As of October 2026 the Free plan covers 3 agents, Standard lists at $21.50 and Premium at $55.28 per agent per month on monthly billing, with up to 100,000 agents and unlimited customers on paid plans, and Enterprise is sold annually.

The request catalog is where service management meets the customer's organization chart. A good catalog is the company's menu of internal services, and its design questions are product questions:

- **Who may request what.** Request types are visible to some groups and not others (contractors can't order laptops); the portal shows each person only what they may ask for.
- **Who approves.** Many requests need a manager's or an owner's approval before fulfillment; the approver is derived from the requester's directory data, which is why ITSM depends on HR-sourced identity ([Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#joiner-mover-leaver)).
- **What fulfillment does.** Some requests are fulfilled by a person, increasingly many by automation (grant the group, assign the license), which makes request types the front door for [Automation Rules](/books/workplace-and-collaboration/automation-rules#triggers-conditions-and-actions).

Queues are views ([Saved Filters and Views](/books/workplace-and-collaboration/queries-views-and-dashboards#saved-filters-and-views)) ordered by what the SLA says is due next.

## Incidents and Priority

Incident priority is computed, not chosen. ServiceNow's documentation states that "priority is based on impact and urgency, and it identifies how quickly the service desk should address the task," with sample lookup rules:

| Impact / urgency | Urgency 1 | Urgency 2 | Urgency 3 |
| --- | --- | --- | --- |
| **Impact 1** | 1 - Critical | 2 - High | 3 - Moderate |
| **Impact 2** | 2 - High | 3 - Moderate | 4 - Low |
| **Impact 3** | 3 - Moderate | 4 - Low | 4 - Low |

A matrix makes priority defensible: impact (how many people or how critical a service) and urgency (how soon it hurts) are facts the requester and agent can agree on, and priority follows. The SLA then keys off priority.

**Major incidents** get their own process. ServiceNow defines one as "an incident that results in significant disruption to the business," promoted from a candidate by a major incident manager after someone proposes it or a trigger rule flags it. Jira Service Management's major incidents are "incidents that cause significant disruption to everyday business operations," with their own queue, and as of October 16, 2024 moved from the Standard to the Premium plan (now requiring "a Service Collection Premium or Enterprise plan").

On-call and alerting moved into the service desk as well. Atlassian announced on March 4, 2025 that Opsgenie "would no longer be available for purchase, effective June 4, 2025," with end of support "effective April 5th, 2027," its "alerting and on-call capabilities" built "directly into Jira Service Management and Compass," and unmigrated data to be deleted. PagerDuty's escalation policies show the shape of on-call data: "an ordered set of rules (also called levels)," a default 30-minute timeout per level, up to 20 rules, repeats up to nine times. The operational practice those tools support is the playbook's [Incident Response](/docs/operations/incident-response#roles); the record in the service desk is what auditors and problem managers read afterward.

## Problems and Changes

A **problem** collects incidents with a common cause and tracks the investigation separately, so incidents can be resolved when service is restored while the cause is still open. Its outputs are a known error (a documented cause and workaround) and, usually, a change.

A **change** is a planned modification under control. Jira Service Management and ServiceNow use the same three types: standard changes are "low-risk, pre-authorized changes that are well understood and fully documented," normal changes "need to be scheduled, assessed and reviewed following a process," and emergency changes "must be implemented as soon as possible." In ServiceNow, "the change type determines which state model is invoked and the change process that must be followed." Normal changes go to a change advisory board (CAB): ServiceNow's CAB definitions set up "recurring CAB meetings for reviewing and authorizing change requests," with a CAB manager and delegates, and can add matching change requests to the agenda automatically.

The modern twist is linking change records to deployments. Jira Service Management's deployment gating can "allow or prevent deployments at specific points in the change management process," on its Premium plan; as of October 2026 the setup article covers Bitbucket Pipelines and Jenkins, and Atlassian's documentation lists further guides for GitHub and GitLab: the pipeline asks the service desk whether the change is approved and waits. That makes the CI/CD pipeline the change's implementation step and the change record its evidence, which is the delivery-side mirror of environment approvals in [Continuous Delivery Platforms](/books/hosting-and-cloud/continuous-delivery-platforms#approvals-and-environment-protection). My rule is that standard changes should be what most deploys are: pre-approved by type, recorded automatically from the pipeline, with CAB review reserved for changes the pipeline can't reverse quickly.

## SLA Clocks

An SLA is a target time for some event on a ticket, and every service desk implements the same machine: a clock that starts on one condition, pauses on others, stops on a final one, runs only during a calendar's working hours, and records whether it met its goal.

**Jira Service Management** configures SLAs as conditions and calendars: start under "Start counting time when," pause optionally ("may be used, for example, when you are waiting for a customer to respond"), and stop under "Finish counting time when"; with several conditions in a box, the SLA measures "the time when a work item meets either of the conditions." Calendars make sure "your goals are tracked based on the times and days your agents respond to requests," defaulting to 09:00 to 17:00, with holidays and a time zone.

**ServiceNow** stores each running clock as a Task SLA record ("Task SLA records for the SLAs attached to particular tasks") with stages In progress, Paused, Cancelled and Completed, a business elapsed time defined as "time within the specified schedule between start time and now (minus pause duration)," and a breach time equal to the planned end time. Its engines evolved from one that "tracks only one SLA per task" to one that "supports multiple SLAs per task," and then to one with retroactive pause calculations.

**Zendesk**, on the customer-service side, defines SLA targets by metric (first reply, next reply, periodic update, pausable update, requester wait, agent work time, total resolution) and priority, in calendar or business hours, applied in policy order, with a minimum target of 15 seconds.

The design rules that follow:

- **One clock per SLA per ticket**, as a row with its own state, so a ticket can carry first-response and resolution clocks at once.
- **Compute the deadline and store it** ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), recomputing only on pause, resume or calendar change, so queues can sort by breach time with an index.
- **Store the calendar version** the clock ran under. A holiday added in March must not retroactively breach a ticket from January.
- **Make pause conditions visible to the requester.** "Waiting for customer" is the condition most often abused, since it stops the clock, and the requester should see that it was set.
- **Record breach as an event** with the time it happened, not only a flag, because reports count breaches by period.

## The CMDB and Assets

A configuration management database (CMDB) records configuration items (servers, applications, services, laptops, licenses) and the relationships between them, so an incident can name what is affected and a change can show what it might break. ServiceNow's Common Service Data Model gives the service layer its vocabulary: a business service is "published to business users and it typically underpins one or more business capabilities"; a technical service is "published to service owners and typically underpins a business or application service"; a service offering is "a stratification of a service into capability, availability, pricing, and packaging options." Assets and configuration items overlap without being identical: "Many assets are CIs and vice versa, but that's not always the case." Jira Service Management's equivalent is Assets; Freshservice licenses asset management in Asset Units sold in packs of 500.

The CMDB's difficulty is staleness. Its value depends on accuracy, and its data comes from discovery tools, cloud APIs, endpoint managers and people, each of which disagrees with the others. A builder should treat every CI attribute as sourced (which discovery source said so, when), reconcile sources by precedence rather than by last write, and age out CIs nobody has confirmed. The record linkage problem is the playbook's [Record Linkage](/docs/architecture/record-linkage); the ITSM twist is that relationships matter more than attributes, because impact analysis walks the graph.

## Service Beyond IT

The same engine runs HR, facilities, legal and finance. ServiceNow's 10-K places HR, legal, finance, supply chain and facilities in its "Core Business" workflows, with HR Service Delivery that "automates routine HR tasks and supports processes such as onboarding, leave management, transfers, offboarding." Freshservice for Business Teams is pitched to HR, finance, facilities and legal teams without an ITSM implementation. Atlassian packaged Jira Service Management with Customer Service Management and Assets as the Service Collection in October 2025.

Employee service changes the privacy profile. An IT ticket is about a laptop; an HR case is about a person's leave, pay, health or a complaint about their manager. The customer's admins must be able to make HR request types and their queues visible only to HR agents, keep them out of enterprise search and AI assistants unless explicitly allowed, and apply different retention (HR records often carry statutory retention periods the customer's legal team sets). The inversion holds: the employer is the controller of its employees' case data and decides who sees it, and the vendor's job is to make item-level restriction, field-level redaction and per-request-type retention possible ([Permission-Trimmed Queries](/books/workplace-and-collaboration/queries-views-and-dashboards#permission-trimmed-queries)).

## How to Build It

The chapter adds request types, the service ticket extension of `work_items`, impact-urgency priority rules, SLA policies, calendars and clocks, change approvals, and configuration items. Service desks are `containers` of kind `project` with a service flag; tickets are `work_items` whose type is a request, incident, problem or change.

```sql
CREATE TABLE request_types (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  container_id   UUID NOT NULL REFERENCES containers (id),   -- the service desk
  name           TEXT NOT NULL,
  practice       TEXT NOT NULL CHECK (practice IN ('service_request', 'incident',
                   'problem', 'change')),
  work_item_type_id UUID NOT NULL REFERENCES work_item_types (id),
  portal_group   TEXT,
  form           JSONB NOT NULL,           -- field ids, labels, help text, required
  visible_to     UUID[],                   -- group ids; null: all requesters
  approval_rule  JSONB,                    -- 'requester.manager', a group, or none
  restricted     BOOLEAN NOT NULL DEFAULT FALSE   -- HR-style: agents of this desk only
);

CREATE TABLE service_tickets (             -- extends work_items for service desks
  item_id        UUID PRIMARY KEY REFERENCES work_items (item_id),
  request_type_id UUID NOT NULL REFERENCES request_types (id),
  requester_account_id UUID NOT NULL REFERENCES accounts (id),   -- may be unlicensed
  impact         SMALLINT CHECK (impact BETWEEN 1 AND 3),
  urgency        SMALLINT CHECK (urgency BETWEEN 1 AND 3),
  priority       SMALLINT,                 -- from priority_rules
  major_incident BOOLEAN NOT NULL DEFAULT FALSE,
  change_type    TEXT CHECK (change_type IN ('standard', 'normal', 'emergency')),
  planned_window TSTZRANGE                 -- changes
);

CREATE TABLE priority_rules (
  container_id   UUID NOT NULL REFERENCES containers (id),
  impact         SMALLINT NOT NULL,
  urgency        SMALLINT NOT NULL,
  priority       SMALLINT NOT NULL,
  PRIMARY KEY (container_id, impact, urgency)
);

CREATE TABLE business_calendars (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,
  version        INT NOT NULL,
  time_zone      TEXT NOT NULL,
  weekly_hours   JSONB NOT NULL,           -- {"mon":[["09:00","17:00"]], ...}
  holidays       DATE[] NOT NULL DEFAULT '{}',
  valid_during   TSTZRANGE NOT NULL,
  UNIQUE (id, version)
);

CREATE TABLE sla_policies (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  container_id   UUID NOT NULL REFERENCES containers (id),
  name           TEXT NOT NULL,            -- 'Time to first response'
  start_on       JSONB NOT NULL,           -- conditions, any of
  pause_on       JSONB NOT NULL DEFAULT '[]',
  stop_on        JSONB NOT NULL,
  goals          JSONB NOT NULL,           -- [{match:{priority:1}, target:'PT1H', calendar_id}]
  position       SMALLINT NOT NULL         -- policy order decides which goal applies
);

CREATE TABLE sla_clocks (                  -- one per policy per ticket
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id        UUID NOT NULL REFERENCES service_tickets (item_id),
  policy_id      UUID NOT NULL REFERENCES sla_policies (id),
  goal           INTERVAL NOT NULL,
  calendar_id    UUID NOT NULL,
  calendar_version INT NOT NULL,           -- the calendar the clock ran under
  state          TEXT NOT NULL CHECK (state IN ('running', 'paused', 'met', 'breached',
                   'cancelled')),
  started_at     TIMESTAMPTZ NOT NULL,
  paused_total   INTERVAL NOT NULL DEFAULT INTERVAL '0',
  breach_at      TIMESTAMPTZ,              -- computed deadline; null while paused
  stopped_at     TIMESTAMPTZ,
  breached_at    TIMESTAMPTZ,
  UNIQUE (item_id, policy_id),
  FOREIGN KEY (calendar_id, calendar_version) REFERENCES business_calendars (id, version)
);
CREATE INDEX sla_clocks_due ON sla_clocks (breach_at) WHERE state = 'running';

CREATE TABLE sla_clock_events (
  clock_id       UUID NOT NULL REFERENCES sla_clocks (id),
  event          TEXT NOT NULL CHECK (event IN ('start', 'pause', 'resume', 'stop',
                   'breach', 'recalculate')),
  cause          TEXT NOT NULL,            -- the status change or field that triggered it
  at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE change_approvals (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id        UUID NOT NULL REFERENCES service_tickets (item_id),
  approver_member_id UUID NOT NULL REFERENCES members (id),
  decision       TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comment        TEXT,
  cab_meeting_id UUID,
  decided_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE config_items (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  ci_class       TEXT NOT NULL,            -- 'business_service', 'technical_service', 'server', 'laptop'
  name           TEXT NOT NULL,
  owner_group_id UUID REFERENCES groups (id),
  attributes     JSONB NOT NULL DEFAULT '{}',   -- each value {v, source, seen_at}
  last_confirmed_at TIMESTAMPTZ
);

CREATE TABLE config_item_relations (
  from_ci_id     UUID NOT NULL REFERENCES config_items (id),
  to_ci_id       UUID NOT NULL REFERENCES config_items (id),
  relation       TEXT NOT NULL,            -- 'depends_on', 'runs_on', 'offering_of'
  source         TEXT NOT NULL,
  PRIMARY KEY (from_ci_id, to_ci_id, relation)
);

CREATE TABLE ticket_config_items (
  item_id        UUID NOT NULL REFERENCES service_tickets (item_id),
  ci_id          UUID NOT NULL REFERENCES config_items (id),
  role           TEXT NOT NULL CHECK (role IN ('affected', 'caused_by', 'changed')),
  PRIMARY KEY (item_id, ci_id, role)
);
```

Every status or field change on a ticket is evaluated against its desk's SLA policies in the same transaction: a matching start condition creates a clock, a pause condition pauses it (adding to `paused_total` on resume and recomputing `breach_at` against the stored calendar version), a stop condition closes it as met or breached. A sweeper job breaches running clocks whose `breach_at` has passed, using the partial index. Breach time is computed by walking the calendar's working intervals, which is a function, not a query, and is unit-tested against daylight-saving transitions and holidays ([Time](/docs/fundamentals/time)).

Impact analysis for a change walks the relations graph from the CIs it changes to the business services above them:

```sql
WITH RECURSIVE impacted AS (
  SELECT ci_id AS id, 0 AS depth FROM ticket_config_items WHERE item_id = $1 AND role = 'changed'
  UNION
  SELECT r.from_ci_id, i.depth + 1
  FROM config_item_relations r JOIN impacted i ON r.to_ci_id = i.id
  WHERE r.relation IN ('depends_on', 'runs_on') AND i.depth < 6
)
SELECT c.id, c.name, c.ci_class FROM impacted i JOIN config_items c ON c.id = i.id
WHERE c.ci_class IN ('business_service', 'technical_service');
```

## Auditing

- **SLA history is evidence**: every clock event with its cause, kept with the ticket, because SLA reports are contractual between IT and the business and often between an outsourcer and its client.
- **Change approvals and CAB decisions**, with approver, comment and the change's state at approval, plus every emergency change and who authorized it after the fact.
- **Priority overrides**: when an agent sets priority against the matrix, the reason and actor.
- **Restricted request types** (HR, legal): access to their tickets logged as reads, not only writes ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **SLA policy and calendar changes**, versioned, since they change what every past and future report means.

## What This Means for the System You Build

- **Make ITIL's practices record types** with their own workflows, linked to each other and to configuration items.
- **License agents, not requesters,** and design the portal for everyone in the company.
- **Compute priority from impact and urgency** and log overrides.
- **Model SLAs as clocks** with start, pause and stop conditions, a versioned calendar, a stored deadline and breach events.
- **Link change records to deployments,** and make standard changes the automated default.
- **Source every CMDB attribute** and reconcile by precedence; relationships are the point.
- **Let admins restrict HR and legal desks** in visibility, search, AI and retention.

## References

**Standards and frameworks**

- [PeopleCert: ITIL 4 management practices (2023)](https://www.peoplecert.org/news-and-announcements/itil-4-management-practices-2023), 2019 launch, 34 practices, practice definition and the five revised practices
- [PeopleCert: ITIL FAQ](https://www.peoplecert.org/help-and-support/faq-itil), Version 5 availability, practice groups, value system, parallel running and the planned ITIL 4 sunset on December 31, 2027
- [PeopleCert: ITIL Version 5 explained](https://www.peoplecert.org/news-and-announcements/itil-version-5-explained), phased release and "not a reset"

**Vendor documentation**

- [ServiceNow Docs: Priority lookup rules](https://www.servicenow.com/docs/r/it-service-management/incident-management/def-prio-lookup-rules.html?contentId=fNex3wXL_5Lzjtsyi6CTrQ), impact and urgency matrix
- [ServiceNow Docs: Incident Management](https://www.servicenow.com/docs/r/it-service-management/incident-management/c_IncidentManagement.html?contentId=O9~wtJdvyaPojrBgUDgyMA), definition
- [ServiceNow Docs: Major incident management](https://www.servicenow.com/docs/r/it-service-management/incident-management/major-incident-management.html?contentId=8UWRElZ4IQNPa0zvDxoFkg), definition and promotion of candidates
- [ServiceNow Docs: Change Management](https://www.servicenow.com/docs/r/it-service-management/change-management/c_ITILChangeManagement.html), three change types and state models
- [ServiceNow Docs: Create a CAB definition](https://www.servicenow.com/docs/r/it-service-management/service-operations-workspace/cm-create-cab-definition-sow.html?contentId=Ie6Shsp4Oq9xmmc2yRlOTQ), recurring CAB meetings, delegates and agenda rules
- [ServiceNow Docs: Task SLA table](https://www.servicenow.com/docs/r/it-service-management/service-level-management/r_TaskSLATable.html?contentId=wHbvtgZNb~AAWy26XTDirQ), stages, business elapsed time and breach time
- [ServiceNow Docs: Get started with SLAs](https://www.servicenow.com/docs/r/it-service-management/service-level-management/c_GetStartedWithSLAs.html?contentId=JjzN9kkqXNPX2H9THc7G1w), SLA engine generations
- [ServiceNow Docs: CSDM](https://www.servicenow.com/docs/r/it-service-management/service-portfolio-management/SPM2-csdm.html?contentId=evLSisMaUDoeEDP3AocMFA), business and technical services, service offerings, assets and CIs
- [Atlassian Support: What are request types?](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-request-types/), request types and portal groups
- [Atlassian Support: What are queues?](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-queues/), the 300-queue limit and 999+ counts
- [Atlassian Support: App roles in Jira Service Management](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-app-roles-in-jira-service-management/), licensed agents, unlicensed customers and stakeholders, and stakeholders' absence on Free and Standard
- [Atlassian: Service Collection pricing](https://www.atlassian.com/collections/service/pricing?bundle=jira-service-management), Free plan agent limit, Standard and Premium per-agent prices, agent ceiling, Enterprise billing and HR templates
- [Atlassian Support: Set up SLA conditions](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-sla-conditions/), start, pause and stop conditions
- [Atlassian Support: Set up SLA calendars](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-sla-calendars/), working hours, holidays and time zone
- [Atlassian Support: What are SLAs?](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-slas/), calendars and conditions together
- [Atlassian Support: What are changes?](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-changes/), standard, normal and emergency changes
- [Atlassian Support: What is change management?](https://support.atlassian.com/jira-service-management-cloud/docs/what-is-change-management/), review and approval
- [Atlassian Support: Set up deployment gating](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-deployment-gating/), Bitbucket and Jenkins setup, guides for GitHub and GitLab, and the Premium requirement
- [Atlassian Support: What are major incidents?](https://support.atlassian.com/jira-service-management-cloud/docs/what-are-major-incidents/), definition, queue and the October 16, 2024 plan change
- [Atlassian Support: Merge Opsgenie with Jira Service Management](https://support.atlassian.com/jira-service-management-cloud/docs/merge-opsgenie-with-jira-service-management/), alerting and on-call inside JSM and Compass
- [Atlassian: Opsgenie licensing](https://www.atlassian.com/licensing/opsgenie), March 4, 2025 announcement, June 4, 2025 end of sale, April 5, 2027 end of support, data deletion
- [Freshworks: Freshservice pricing](https://www.freshworks.com/freshservice/pricing/), per-agent prices, SLA, change, problem, release and major incident management by plan, Asset Units in packs of 500
- [Freshworks: Freshservice for Business Teams](https://www.freshworks.com/freshservice/business-teams/), HR, finance, facilities and legal
- [Zendesk: Defining and using SLA policies](https://support.zendesk.com/hc/en-us/articles/4408829459866-Defining-and-using-SLA-policies), SLA metrics, policy order and the 15-second minimum
- [PagerDuty: Escalation policies](https://docs.pagerduty.com/incident-management/schedules/escalation-policies), levels, timeouts, rule and repeat limits

**Filings and announcements**

- [ServiceNow: 2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1373715/000137371526000007/now-20251231.htm), subscription revenue, customers above $5 million ACV, product areas and HR Service Delivery
- [Freshworks: 2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1544522/000154452226000036/frsh-20251231.htm), substantially all revenue from Freshservice and Freshdesk
- [Atlassian: Service Collection](https://www.atlassian.com/blog/rovo/team25-europe-service-collection), October 7, 2025, JSM, Customer Service Management and Assets
