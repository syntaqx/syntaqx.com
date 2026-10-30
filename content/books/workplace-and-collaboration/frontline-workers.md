+++
title = "Frontline & Deskless Workers"
description = "Collaboration without desks: frontline seats, shared devices, shift schedules, push-to-talk, task publishing and the wage-hour risk of after-hours messages."
category = "Workplace & Collaboration Industry"
order = 2017
part = "Chat and Messaging"
tags = ["frontline", "shift-scheduling", "shared-devices", "flsa", "wage-and-hour"]
nav_title = "Frontline Workers"
+++

Most collaboration software was designed for information workers: a laptop, a corporate email address, a calendar full of meetings, eight or more hours a day in the tools. Frontline workers (retail associates, nurses, factory and warehouse staff, drivers, hospitality and field crews) work on phones or shared devices, often have no company email, work in shifts, and are frequently paid by the hour. Microsoft describes them as people who "often work on tablets or phones and work either directly with customers or the general public." Vendors sell them cheaper, restricted seats; employers buy them to replace paper rosters, break-room bulletin boards, radios and text-message chains.

What makes the segment hard is that the employer's duties change shape. Identity can't assume an email address or a personal device. The schedule, not the calendar, is the system of record for who should be reachable. A message that an office worker reads at 9 p.m. is an annoyance; the same message read by an hourly worker can be compensable work time under US wage-hour law, and in some countries a contact the employee may lawfully refuse. And the products the segment depends on can disappear: Workplace from Meta, a workplace collaboration product, has closed.

This chapter covers frontline seats and their restrictions, identity and shared devices, schedules as the system of record, communicating with a shift (tags, push-to-talk, task publishing), predictive scheduling laws, and the wage-hour exposure of after-hours messages. Notification mechanics and the right-to-disconnect laws are in [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention); conversation models are in [Channels, Threads & Direct Messages](/books/workplace-and-collaboration/workplace-chat). Field-service dispatch and routing are the Field Operations volume's subject ([Dispatch & the Day of Service](/books/field-operations/dispatch)); seat pricing in general is the [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) chapter.

## How the Platforms Do It

As of October 2026:

| Product | Frontline seat | Identity | Scheduling | Communication features | Notes |
| --- | --- | --- | --- | --- | --- |
| **Microsoft 365 / Teams** | F1 and F3 licenses, assigned per user alongside enterprise licenses | Entra ID, with shared device mode on Android and iOS | Shifts app in Teams, standalone or connected to a workforce management system | Shift-based tags, Walkie Talkie push-to-talk, task publishing in Planner, tailored frontline app bar | Shifts data stored in regional geographies with local residency in several countries |
| **Slack** | Frontline Member account type, a paid add-on on Enterprise+ | SSO or username and password, no company email required; SCIM bulk invites | Not built in | Up to 10 channels added by admins, huddles, DMs within their channels | Billed on all Frontline Members added, active or not |
| **Connecteam** | Hub subscriptions with a flat fee for the first 30 users and a per-user charge above it; free for up to 10 users | Not covered here | Job scheduling and GPS time clock | Chat, updates, directory, surveys, knowledge base | Operations, communications and HR sold as separate hubs |
| **Workplace from Meta** | Closed | Not applicable | Not applicable | Not applicable | "Workplace has closed as of May 2026" |

Google sells frontline editions of Google Workspace as well; I couldn't open a current Google page describing what they include, so they're left out of the comparison. <!-- source-gap: google-workspace-frontline | missing | Google Workspace Frontline Starter and Standard editions: what they include and exclude | closes with: a Google Workspace product or Admin Help page on Frontline editions that loads | checked: 2026-10-29 -->

The pattern across vendors: **a frontline seat is a restricted member, not a different product.** Same tenant, same directory, same channels, fewer capabilities and a lower price, with admins (not the worker) deciding what the worker can reach.

## Restricted Seats

Slack's Frontline Member type is the most explicit public definition of a restricted seat. A Frontline Member is an employee, not a guest, using "a simple, mobile-first way to use Slack" at a lower cost. They can post in channels they've been added to (up to 10), join huddles, use `@channel` and `@here`, DM and group-DM people in their channels, upload files and run workflows shared in those channels. They can't create, join, leave, rename, archive, delete or even search for channels; can't message people outside their channels or appear in the directory to them; can't authorize or install apps or create workflows; can't use the listed AI features or upload more than 1 GB of files a month; and can't be added to user groups that include full members. Canvases and lists are also off-limits for creation. Admins add them to channels (they can't add themselves), invite them to a single workspace, provision them in bulk through SCIM or the identity provider, and can convert them to another role.

Microsoft draws the line through licensing rather than an account type. F licenses are assigned to frontline staff while information workers get enterprise licenses in the same tenant, and the products adapt: users with an F license get a **tailored frontline app experience** that pins Shifts, Walkie Talkie, Planner (tasks) and Approvals to the bottom bar of the Teams mobile app by default, and Frontline Worker and Frontline Manager policy packages bundle the Teams policies suited to each role.

Two things follow for anyone building a restricted seat:

- **Restrictions are permissions, enforced server-side,** not a slimmed-down client. A Frontline Member who can't search for channels must get nothing from the channel-list API either.
- **Billing follows assignment, not activity.** Slack bills Frontline Members on everyone added, active or not, which differs from its fair-billing treatment of other members; a frontline seat is a provisioned entitlement, and offboarding on the last day of employment is what stops the charge (the [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim) chapter).

## Identity Without a Desk

Frontline identity breaks two assumptions of the information-worker stack.

**No corporate email.** Slack's Frontline Members can sign in with SSO or a username and password without a company email address. Products that key accounts on email have to support an identifier that isn't an address (an employee number, a username, a phone number), with recovery that doesn't depend on a mailbox, and SCIM provisioning from the HR system keyed on the employee id.

**Shared devices.** Many frontline workers pick up a store- or ward-owned phone at the start of a shift and return it at the end. Microsoft Entra's **shared device mode** is the reference design: an iOS, iPadOS or Android device enrolled for shared use, where a worker signs in once and is signed in to every supporting app, and signs out once to be signed out of all of them, "making the device ready for the next user." Device administrators enroll devices through mobile device management (with the Microsoft Enterprise SSO plug-in on iOS), Conditional Access can require the shared device to be compliant, and app developers using the Microsoft Authentication Library must check on each use whether the signed-in user changed and clear the previous user's cached data. Apps that don't support the mode get no single sign-on or single sign-out.

The design rules for a product that frontline workers use on shared devices:

- **One sign-out ends every session on the device,** and the app wipes the previous user's local data, cached messages, drafts and push registration.
- **Push tokens belong to the device session,** not the account, so the next worker on the device doesn't receive the last worker's DMs.
- **Offline data is scoped to the signed-in user** and encrypted with a key that's destroyed at sign-out ([A Scoped Local Store](/docs/architecture/offline-sync#a-scoped-local-store)).

## The Schedule Is the System of Record

For an office worker, the calendar says when they're working. For a frontline worker, the **shift schedule** does, and it usually lives in a workforce management (WFM) system that also feeds payroll.

Microsoft's Shifts app shows the scope of a schedule product inside a collaboration suite:

- **Managers** create schedules (one by one or in bulk from Excel), open shifts for their own team and (in preview) for other locations, schedule groups by department or job, time sheet reports and totals of hours worked and time off, and handle requests.
- **Workers** view their own and their team's schedules, request open shifts, time off, swaps and offers to coworkers, clock in and out of shifts and breaks, and edit time card entries on mobile.
- **Integration** with a WFM system is either a Microsoft-managed connector (as of October 2026, one for Reflexis, hosted by Zebra) or a custom integration through Microsoft Graph, one-way or two-way. When connected, schedule changes are made in the WFM system and synced into Shifts, and worker requests are validated against the WFM system's rules before they're saved.
- **Extensibility:** Graph exposes shifts, open-shift requests, swaps, offers and time-off requests, with change notifications whose subscriptions last at most 360 minutes (six hours) and arrive within an hour at worst.
- **Data location:** Shifts stores data in Asia Pacific, EU or US geographies, with local residency in Australia, Canada, France, Japan and the United Kingdom.

The architecture choice every frontline product faces is **which system owns the schedule.** If the WFM system owns it (because it computes labor budgets, compliance rules and payroll), the collaboration product is a view plus a request channel, and every change a worker makes in chat is a request validated upstream. If the collaboration product owns it, it inherits the payroll-adjacent obligations below. Building a second, independently editable schedule is the worst option: two sources of truth for who was supposed to be at work.

### Predictive Scheduling Laws

Several US jurisdictions regulate how far ahead schedules must be published and what changes cost, and the software that holds the schedule is where compliance happens. Oregon's law is representative. For retail, hospitality and food service employers with 500 or more employees worldwide, it requires:

- a written schedule, including on-call shifts, at least 14 calendar days in advance;
- a good-faith estimate of median monthly hours at hire;
- no scheduling within 10 hours of the end of the previous shift, with time-and-a-half if the employee works in that window;
- premium pay for changes without proper notice: one hour's pay on top of wages when work is added or a shift changed, and half the regular rate for scheduled hours not worked when hours are cut or a shift cancelled;
- the employee's right to decline shifts not on the written schedule, and a voluntary standby list of employees who agreed in writing to take extra hours, whose accepted extra hours don't earn change premiums.

For the system holding the schedule, that means: **publish dates are records** (the schedule as published, with its timestamp, kept separately from later edits); **every change carries who initiated it** (employer change, employee request, standby-list acceptance), because premiums depend on it; **rest-period checks run at assignment time**; and **premiums are computed from the change log**, not reconstructed from the current schedule. Other cities and states have similar laws with different thresholds; the data model is the same.

## Communicating With a Shift

### Reaching Whoever Is On Shift

Frontline communication is addressed by role and time, not by name: "whoever is on the register now," "the on-call cardiologist." Teams' **shift-based tags** assign people tags matching their schedule and shift group in Shifts, and an @mention of the tag in a chat or channel post notifies only the people on shift at that moment. That's the right primitive for frontline messaging generally: **resolve the audience from the schedule at send time,** so people who are off shift aren't paged, which is both a courtesy and, as the wage-hour section shows, a risk control.

### Push-to-Talk

Frontline teams used radios long before chat, and collaboration suites now replace them. Teams' **Walkie Talkie** turns Android and iOS devices into push-to-talk handsets over Wi-Fi or cellular data, using the Teams channels the user already belongs to (standard and private channels, not shared ones). It's included in all paid Teams licenses, needs network round-trip latency under 300 ms, jitter under 30 ms and packet loss under 1%, uses about 20 Kb/s while sending or receiving audio, and doesn't work without connectivity. It works with generic wired headsets and with rugged devices and headsets that have a dedicated PTT button (Zebra, Honeywell, Samsung, Kyocera, Sonim and others), and its data is stored in the EU for tenants in the EU Data Boundary or the UK, and in the US for everyone else.

Push-to-talk is a different real-time workload from chat: one speaker at a time per channel, latency that's felt in a conversation, no persistent record by default, and hardware buttons that must work with the phone locked. The media mechanics belong with voice (the [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video) and [Business Phone & Contact Center](/books/workplace-and-collaboration/business-phone-and-contact-center) chapters); the collaboration-level decision is that the channel membership and permissions are shared with chat, so one roster governs both.

### Publishing Tasks to Locations

Headquarters-to-store work ("reset the seasonal display by Friday," "complete the safety check") is a one-to-many workflow. Microsoft's **task publishing** lets a publishing team (corporate or regional leadership) create task lists and publish them to selected locations, where managers assign tasks to team members, workers see their tasks on mobile, attach photos as proof and mark them complete, and publishers and managers see completion reports by location, list and task. It requires a **team targeting hierarchy**, uploaded as a CSV schema that defines how teams relate and which attributes (region, store format) can be used to select recipients.

The general shape: **an organizational hierarchy separate from the directory's reporting lines,** used to target content and roll up completion. The same hierarchy targets announcements and open shifts across locations, and it's admin-managed data like any other policy.

## After-Hours Messages and Wage-Hour Law

The most consequential difference between frontline and office deployments is legal. Under the US Fair Labor Standards Act, non-exempt (typically hourly) employees must be paid for all hours worked, and the Department of Labor's interpretive rules have said since 1961 that "work not requested but suffered or permitted is work time," including work done at home. The employer must "exercise its control and see that the work is not performed if it does not want it to be performed," and "the mere promulgation of a rule against such work is not enough."

The Wage and Hour Division's Field Assistance Bulletin 2020-5 (August 24, 2020) applies this to remote work and devices:

- An employer must pay for work it knows or has reason to believe is being performed, including through **constructive knowledge**: what it should have known through **reasonable diligence**, not everything it could have known.
- One way to exercise reasonable diligence is a **reasonable reporting procedure** for unscheduled time, with all reported hours paid, even hours not requested.
- If an employee doesn't report hours through such a procedure, the employer generally isn't required to investigate further; access to non-payroll records such as **records of employees accessing work-issued electronic devices outside reported hours** doesn't by itself require the employer to sift through them, though in some circumstances it could be practical and those records could then establish constructive knowledge.
- The procedure doesn't protect an employer that "prevents or discourages accurate reporting in practice," and employees can't waive FLSA rights.

The bulletin relies on the Seventh Circuit's decision in *Allen v. City of Chicago*, 865 F.3d 936 (7th Cir. 2017), which held that employers "must pay for all work they know about, even if they did not ask for the work, even if they did not want the work done, and even if they had a rule against doing the work," and affirmed that the city didn't have to cross-reference phone records against reported time where a reporting system existed. A footnote notes that an employer that hasn't taught employees when to use the reporting system may not have been reasonably diligent.

For a collaboration product deployed to hourly workers, the implications are concrete:

- **Off-shift messaging creates exposure.** A manager's 10 p.m. chat that asks a cashier to cover tomorrow's opening, and the cashier's reply, is work the employer knows about. Products should make the audience's shift state visible to the sender and default to delivering at the start of the recipient's next shift.
- **Gate notifications on the schedule.** Shift-based tags already notify only on-shift staff; the same rule can apply to all non-urgent notifications for hourly members, with quiet periods derived from the schedule rather than a fixed evening window ([Do Not Disturb, Schedules and Breakthrough](/books/workplace-and-collaboration/notifications-and-attention#do-not-disturb-schedules-and-breakthrough)).
- **Provide the reporting path in the product.** If workers can work in the app off the clock, the app should offer a way to report that time (a "log time for this" action that creates a time-card entry for manager approval), because a reasonable, actually-used reporting procedure is the employer's defense.
- **Don't build a surveillance trail by accident.** Logs of off-shift app activity are the "non-payroll records" the bulletin discusses. Whether an employer must review them depends on circumstances; a product that surfaces "Ana was active at 11:40 p.m." on a manager dashboard may turn those records into constructive knowledge. Collect activity data for operations, retain it briefly, and keep it out of manager-facing views unless the employer configures otherwise (the [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy) chapter).
- **Let the employer block access off shift.** An employer may decide hourly workers shouldn't use the app outside their shifts at all; the product should support a schedule-aware access policy rather than leave employers to choose between all or nothing.

Outside the US the framing differs but the duty points the same way: Ontario's guidance says reviewing or drafting emails after a shift is generally working time even under a policy against it, and Australia's right to disconnect lets employees refuse unreasonable out-of-hours contact ([The Right to Disconnect](/books/workplace-and-collaboration/notifications-and-attention#the-right-to-disconnect)).

## When a Frontline Platform Closes

Meta's page for Workplace, its workplace collaboration product, now states that "Workplace has closed as of May 2026." For an employer whose store and factory staff communicated on a product like that, a shutdown is a migration of identities (often without email), groups mapped to locations, years of posts and files, and integrations, on the vendor's timeline. The lessons apply to buying and building:

- **Export must be complete and usable,** including membership history and the location hierarchy, not just posts; the [Migrations, Imports & Switching](/books/workplace-and-collaboration/migrations-and-switching) chapter covers export formats and the EU Data Act's switching rules.
- **Frontline identity must be portable:** if accounts were keyed on the vendor's own usernames, re-provisioning thousands of workers who have no corporate email is the hardest part of the move. Provisioning from the HR system through SCIM keeps the employer's identifier authoritative.
- **Records outlive products.** Retention obligations on messages don't end when the vendor does; the employer needs its archive before the shutdown date.

## How to Build It

The chapter's additions. A frontline member is a `members` row with a restricted seat; shifts and their changes are records with payroll consequences; shared-device sessions bind push tokens to the person holding the device.

```sql
ALTER TABLE members
  ADD COLUMN seat_profile   TEXT NOT NULL DEFAULT 'standard'
    CHECK (seat_profile IN ('standard', 'frontline')),
  ADD COLUMN pay_basis      TEXT CHECK (pay_basis IN ('hourly', 'salaried_exempt',
    'salaried_nonexempt'));              -- drives off-shift notification and access rules
-- members.employee_number (from Provisioning, SCIM & Offboarding) is the identity
-- when there is no corporate email

CREATE TABLE locations (                 -- the targeting hierarchy, separate from reporting lines
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  parent_id     UUID REFERENCES locations (id),
  name          TEXT NOT NULL,
  attributes    JSONB NOT NULL DEFAULT '{}',   -- region, format, size: used to select targets
  container_id  UUID REFERENCES containers (id), -- the location's team or channel
  time_zone     TEXT NOT NULL
);

CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id     UUID NOT NULL REFERENCES locations (id),
  member_id       UUID REFERENCES members (id),     -- null for an open shift
  shift_group     TEXT,                             -- 'Cashiers', 'Night nurses'
  scheduled       TSTZRANGE NOT NULL,
  is_on_call      BOOLEAN NOT NULL DEFAULT FALSE,
  source          TEXT NOT NULL CHECK (source IN ('native', 'wfm')),
  wfm_external_id TEXT,
  published_at    TIMESTAMPTZ,                      -- null while a draft
  cancelled_at    TIMESTAMPTZ
);

CREATE TABLE shift_changes (             -- append-only; premiums are computed from this
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  shift_id      UUID NOT NULL REFERENCES shifts (id),
  change        TEXT NOT NULL CHECK (change IN ('published', 'time_changed', 'added_hours',
                  'reduced_hours', 'cancelled', 'reassigned', 'swapped', 'offered',
                  'open_shift_claimed')),
  initiated_by  TEXT NOT NULL CHECK (initiated_by IN ('employer', 'employee_request',
                  'standby_list', 'wfm_sync')),
  actor_member_id UUID REFERENCES members (id),
  before_value  JSONB,
  after_value   JSONB NOT NULL,
  notice_given  INTERVAL,                -- time between this change and the shift's start
  premium_rule  TEXT,                    -- which jurisdiction's rule applied, if any
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE time_punches (              -- clock-ins and worker-reported off-shift time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  member_id     UUID NOT NULL REFERENCES members (id),
  shift_id      UUID REFERENCES shifts (id),
  kind          TEXT NOT NULL CHECK (kind IN ('clock_in', 'clock_out', 'break_start',
                  'break_end', 'reported_off_shift')),
  at            TIMESTAMPTZ NOT NULL,
  duration      INTERVAL,                -- for reported off-shift work
  related_item_id UUID REFERENCES items (id),  -- the message that prompted the work
  status        TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted',
                  'approved', 'adjusted', 'rejected')),
  decided_by    UUID REFERENCES members (id)
);

CREATE TABLE shared_device_sessions (    -- who holds a shared device right now
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  device_id     TEXT NOT NULL,           -- MDM device identifier
  member_id     UUID NOT NULL REFERENCES members (id),
  push_token    TEXT,                    -- bound to this session, not the account
  signed_in_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signed_out_at TIMESTAMPTZ,
  wiped_at      TIMESTAMPTZ              -- local data cleared confirmation from the client
);

CREATE UNIQUE INDEX shared_device_one_holder
  ON shared_device_sessions (device_id) WHERE signed_out_at IS NULL;
```

Notes on the sketch:

- **On-shift is a query.** "Who is on shift now at this location in this group" is `shifts` where `scheduled @> NOW()` and not cancelled; shift-based mentions resolve their audience from it at send time, and the notification decision for `pay_basis = 'hourly'` members defers non-urgent messages when no shift contains the current time.
- **The WFM owns WFM shifts.** Rows with `source = 'wfm'` are updated only by the sync; worker swaps and requests on them become `shift_changes` with `initiated_by = 'employee_request'` that the WFM system validates before they apply.
- **Premiums come from the change log.** `notice_given` and `initiated_by` are enough to evaluate rules like Oregon's (14-day notice, standby list exemption); the rule that applied is recorded with the change so a later audit doesn't depend on today's rule table.
- **Reported time links to its cause.** A "log time for this" action on a message writes a `reported_off_shift` punch with `related_item_id`, which gives the employer the reasonable reporting procedure the FAB describes and the manager the context to approve it.
- **Sign-out is a server event.** Ending a `shared_device_sessions` row revokes the session's tokens and deletes its push token, so pushes stop even if the device is offline; the client confirms the local wipe with `wiped_at`.
- **Restricted seats check on every API.** `seat_profile = 'frontline'` maps to a permission set (channel limit, no search, no app installs), evaluated in the same authorization layer as everything else.

## Auditing

- **Schedule publication and every change,** with initiator, notice given and the premium rule applied, retained as payroll-adjacent records.
- **Off-shift contact to hourly members:** messages and mentions delivered outside a member's shift, deferred or broken through, with sender and reason.
- **Reported off-shift time** and its approval or rejection, with the approver, because a rejected report is where "discouraging accurate reporting" would show.
- **Shared device sign-ins and sign-outs,** wipe confirmations and any session that ended without one.
- **Seat profile and pay basis changes,** since they change both price and notification behavior.

## What This Means for the System You Build

- **Model a frontline seat as a restricted member,** enforced server-side, billed on assignment, provisioned from HR by employee id.
- **Support identity without email** and shared devices with one sign-out that wipes local data and unbinds push tokens.
- **Decide which system owns the schedule;** never keep two editable schedules.
- **Keep published schedules and an append-only change log** with initiators, so predictive-scheduling premiums can be computed and defended.
- **Address frontline messages by role and shift,** resolved at send time, and defer non-urgent messages to hourly workers until their next shift.
- **Put a reporting path for off-shift work in the product,** and don't surface off-shift activity to managers by default.
- **Design for the vendor's exit:** complete exports, portable identity, archives that outlive the product.

## References

**Vendor documentation**

- [Microsoft Learn: Understand frontline worker user types and licensing](https://learn.microsoft.com/en-us/microsoft-365/frontline/flw-licensing-options), frontline and information worker types and mixing F and enterprise licenses
- [Microsoft Learn: Shifts for your frontline organization](https://learn.microsoft.com/en-us/microsoft-365/frontline/shifts-for-teams-landing-page), manager and worker capabilities, WFM connectors and custom integration, Graph extensibility
- [Microsoft Learn: Manage the Shifts app for your organization](https://learn.microsoft.com/en-us/microsoftteams/expand-teams-across-your-org/shifts/manage-the-shifts-app-for-your-organization-in-teams), data location and residency, the tailored frontline app experience, policy packages, shift-based tags
- [Microsoft Learn: Manage the Walkie Talkie app in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/walkie-talkie), push-to-talk over Wi-Fi and cellular, supported channels, licensing, network requirements, data usage, devices and data residency
- [Microsoft Learn: Manage the Planner app for your organization in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/manage-planner-app), task publishing, the team targeting hierarchy and completion reporting
- [Microsoft Learn: Shared device mode overview](https://learn.microsoft.com/en-us/entra/identity-platform/msal-shared-devices), single sign-in and sign-out across apps, MDM enrollment, Conditional Access and app responsibilities
- [Microsoft Learn: subscription resource type](https://learn.microsoft.com/en-us/graph/api/resources/subscription), Shifts change notification lifetimes and latency
- [Slack: Understand Frontline Members in Slack](https://slack.com/help/articles/56350332978323-Understand-Frontline-Members-in-Slack), the Frontline Member type, Enterprise+ availability, capabilities and restrictions, billing and administration
- [Slack: Use a canvas in Slack](https://slack.com/help/articles/203950418-Use-a-canvas-in-Slack), Frontline Members can't create canvases
- [Slack: Use lists in Slack](https://slack.com/help/articles/27452748828179-Use-lists-in-Slack), Frontline Members can't create lists
- [Connecteam: Pricing](https://connecteam.com/pricing/), hubs and features, per-user pricing structure, free plan for up to 10 users
- [Meta: Workplace](https://www.meta.com/workplace/), closure as of May 2026

**Law and regulation**

- [eCFR: 29 CFR Part 785, Subpart C](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-C), work suffered or permitted, work away from the premises and the duty of management
- [U.S. Department of Labor: Field Assistance Bulletin No. 2020-5](https://www.dol.gov/agencies/whd/field-assistance-bulletins/2020-5), reasonable diligence, reporting procedures, constructive knowledge and device access records, citing *Allen v. City of Chicago*, 865 F.3d 936 (7th Cir. 2017) (August 24, 2020)
- [Oregon Bureau of Labor and Industries: Predictive scheduling](https://www.oregon.gov/boli/workers/pages/predictive-scheduling.aspx), coverage, 14-day notice, good-faith estimate, rest between shifts, premium pay, right to decline, voluntary standby list
- [Ontario: Written policy on disconnecting from work](https://www.ontario.ca/document/your-guide-employment-standards-act-0/written-policy-disconnecting-from-work), after-hours email as working time
- [Fair Work Ombudsman: Right to disconnect](https://www.fairwork.gov.au/employment-conditions/right-to-disconnect), the right to refuse unreasonable out-of-hours contact
