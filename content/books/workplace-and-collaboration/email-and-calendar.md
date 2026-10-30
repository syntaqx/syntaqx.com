+++
title = "Email & Calendar"
description = "Exchange and Gmail as the backbone: sending limits, iCalendar and iTIP, CalDAV, free/busy, recurrence and time zones, room booking and calendar APIs."
category = "Workplace & Collaboration Industry"
order = 2016
part = "Chat and Messaging"
tags = ["email", "calendar", "icalendar", "scheduling", "time-zones"]
+++

Chat gets the attention, but email and the calendar are still the workplace's backbone. The mailbox is where identity lives (the address is the login, the invitation target, the recovery channel and the external collaboration address), where every other tool sends its notifications, and where meeting invitations travel between organizations that share nothing else. The calendar is the shared clock of the working day: it decides presence, room usage, meeting links, focus time and, increasingly, when other software is allowed to interrupt. For most organizations both run on one of two systems, Exchange Online with Outlook in Microsoft 365, or Gmail and Google Calendar in Google Workspace.

That makes the calendar the place where interoperability is hardest and most standardized. A meeting invite from one company's Exchange tenant to another company's Google Workspace is an iCalendar object carried by email under the iTIP protocol, and it has to survive updates, cancellations, counter-proposals, recurring exceptions and a daylight saving change in a third time zone. The core standards were published or revised between 2007 and 2012 (iCalendar in September 2009); the products extend them in incompatible ways; and anything a vendor builds that touches meetings (a scheduling link, a room panel, a meeting bot, an AI assistant that books time) has to fit in.

This chapter covers email as infrastructure for collaboration products (and why a product shouldn't send through users' mailboxes), the calendar standards, free/busy and availability, recurrence and time zones, rooms and resources, scheduling links, and the calendar APIs. Mailbox hosting and outbound deliverability are the Hosting & Cloud volume's territory: [Email Hosting](/books/hosting-and-cloud/email-hosting), [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms) and [Inbox Rules](/books/hosting-and-cloud/inbox-rules). Time handling in general is the playbook's [Time](/docs/fundamentals/time). The meeting itself (media, links, lobbies) is the [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video) chapter, and rooms as physical spaces with devices and sensors are the [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office) chapter.

## How the Platforms Do It

As of October 2026:

| System | Calendar data model | Invitations | Free/busy API | Rooms and resources | Change notifications |
| --- | --- | --- | --- | --- | --- |
| **Microsoft 365 (Exchange Online, Outlook)** | Events typed as single instance, series master, occurrence or exception; Windows time zone names in many APIs | Graph and Outlook send invitations; email to external parties | Graph `getSchedule` for users, distribution lists and resources | Room and equipment mailboxes with calendar processing rules | Graph subscriptions on events, up to 10,080 minutes; delta queries |
| **Google Workspace (Gmail, Calendar)** | Events, recurring series and instances | Calendar sends invitations; email to external parties | `freebusy.query` for up to 50 calendars | Resource calendars created by admins, invited like guests | Watch channels with expiry, no payload |
| **CalDAV servers** | iCalendar objects in WebDAV collections | Server-side scheduling (RFC 6638) on one system, iMIP between systems | Free-busy query via the scheduling outbox | Resources as calendar users | Not covered here |
| **Scheduling links (Calendly, Google appointment schedules)** | Booking pages over connected calendars | Create events on the host's calendar | Read busy times from connected calendars | Not their focus | Webhooks on bookings and cancellations (Calendly) |

The two suites converge on the same standards at their edges (iCalendar objects, iTIP methods, email transport between organizations) and diverge inside (time zone identifiers, recurrence representation, resource booking rules, APIs). A product that integrates with both has to normalize at the edge and never assume one side's internal model.

## Email as Infrastructure

Three facts about workplace email shape collaboration products.

**The mailbox has sending limits, by design.** Exchange Online limits each mailbox to 10,000 recipients per day, a configurable maximum of up to 1,000 recipients per message, and 30 messages per minute, plus a tenant-level external recipient rate limit that scales with the number of licenses (capped at 5,000 a day for trial tenants). Meeting messages have their own cap of 5,000 recipients. Google Workspace limits a user to 2,000 messages a day (500 on trial accounts), 2,000 recipients per message of which no more than 500 external, 10,000 total recipients a day and 3,000 external recipients a day, with each unique address counted once. Both vendors say outright that these mailboxes aren't for bulk sending. A product that sends notifications "from" users' mailboxes through delegated access inherits those limits and the users' reputation; product mail belongs on infrastructure built for it, as [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms) describes, with authentication and streams per the playbook's [Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams).

**Email is the cross-organization fallback.** A Teams channel has an email address that accepts mail (24 KB message size before the message becomes a preview with a download link, up to 20 attachments under 10 MB each, throttled at 6 emails per 10 seconds per channel per user). Every chat product has some version of "reply by email" and "email into a channel," and every one of them has to decide whose identity an inbound email carries and how it's authenticated, because a forged From line is the cheapest phishing there is.

**The address is the identity.** Workspace membership, SSO domain claims, guest invitations and calendar attendees are all keyed by email address. When an employee's address changes (a name change, a merger, a domain rename), every system that stored the address as a key breaks quietly. Store the account id and keep the address as an attribute with history; the [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts) chapter covers domain claims.

## The Calendar Standards

The interoperable calendar is a stack of IETF standards. As of October 2026:

| Standard | What it defines |
| --- | --- |
| [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) iCalendar (September 2009) | The data format: `VEVENT`, `VTODO`, `VFREEBUSY`, `VTIMEZONE`, recurrence (`RRULE`, `RDATE`, `EXDATE`, `RECURRENCE-ID`), `UID`, `SEQUENCE`, `DTSTAMP` |
| [RFC 5546](https://www.rfc-editor.org/rfc/rfc5546.html) iTIP | The scheduling protocol: who may send which method, and how replies and updates are matched |
| [RFC 6047](https://datatracker.ietf.org/doc/html/rfc6047) iMIP (December 2010) | Carrying iTIP messages in MIME over email |
| [RFC 4791](https://datatracker.ietf.org/doc/html/rfc4791) CalDAV (March 2007) | Calendar access over WebDAV |
| [RFC 6638](https://www.rfc-editor.org/rfc/rfc6638.html) CalDAV Scheduling | Server-side (implicit) scheduling, scheduling inbox and outbox, free-busy queries |
| [RFC 7953](https://www.rfc-editor.org/rfc/rfc7953.html) Calendar Availability | `VAVAILABILITY`: publishing when a user can be booked, such as working hours |
| [RFC 8984](https://www.rfc-editor.org/rfc/rfc8984.html) JSCalendar | A JSON data model for calendar data, designed as an alternative and, over time, successor to iCalendar |

### iTIP: The Organizer Owns the Event

iTIP (RFC 5546, December 2009) defines eight methods: **PUBLISH** (send an object without expecting interaction), **REQUEST** (schedule or update, expecting responses), **REPLY** (an attendee reports their status), **ADD** (add instances to a recurring event), **CANCEL** (cancel instances or the whole event), **REFRESH** (an attendee asks for the latest version), **COUNTER** (an attendee proposes a change) and **DECLINECOUNTER** (the organizer rejects the proposal). The organizer has complete control over the master object; attendees reply and may propose changes, but never edit it.

Message ordering is defined by data, not arrival. Messages are matched by `UID` (plus `RECURRENCE-ID` for a single instance of a series); a higher `SEQUENCE` supersedes lower revisions; if `UID`, `RECURRENCE-ID` and `SEQUENCE` match, the later `DTSTAMP` wins; and organizers should store each attendee's last `SEQUENCE` and `DTSTAMP` so delayed, out-of-order replies can be discarded. Most calendar bugs that cross organizations ("the meeting moved back," "my decline didn't stick," "the cancelled meeting is still there") are violations of those rules: a client that didn't increment `SEQUENCE` on a time change, or an importer that applied an older reply over a newer one.

The rules a product must follow when it creates or edits meetings:

- **Keep the `UID` forever.** It's the identity of the meeting across every calendar that holds a copy.
- **Increment `SEQUENCE` on every significant change** (time, location, recurrence, attendees removed), and set `DTSTAMP` on every message.
- **Only the organizer sends REQUEST and CANCEL.** A tool acting for an attendee sends REPLY or COUNTER; a tool that "moves" a meeting it doesn't organize is creating a conflicting copy.
- **Address single instances with `RECURRENCE-ID`,** so moving one occurrence doesn't rewrite the series.

iMIP adds the security rule that makes email-borne invitations safe: the email's sender and reply-to headers can't reliably identify the organizer or attendee, so recipients must check the `ORGANIZER` and `ATTENDEE` properties in the calendar data, ignore changes to an event from anyone but its organizer (and status updates from anyone but that attendee), and authenticate the originator; the RFC specifies S/MIME for that and allows delegates ("sent-by") only with the calendar user's approval. A product that ingests invitations must at least enforce the organizer rule, because the sender headers of an unsigned invitation prove nothing about who organized the meeting.

### CalDAV and Implicit Scheduling

CalDAV (RFC 4791) stores iCalendar objects in WebDAV collections; CalDAV Scheduling (RFC 6638, June 2012) adds **implicit scheduling**: clients just create, change or delete events, and the server sends the resulting iTIP messages. Incoming messages land in a scheduling inbox that the server processes automatically; a POST to a user's scheduling outbox asks for free/busy. A `SCHEDULE-AGENT` parameter on each attendee says who does the work: `SERVER` (the default), `CLIENT` or `NONE`. A `Schedule-Tag` lets the server merge routine attendee replies without causing edit conflicts for clients. RFC 6638 covers users on one system; scheduling between servers falls back to iMIP email.

Exchange and Google implement the same idea inside their own services: saving a meeting in Outlook or Google Calendar sends the invitations. The lesson for anyone building on top: **let the calendar server schedule.** A product that writes an event through Graph or the Google Calendar API with attendees gets correct invitations for free; a product that composes its own iTIP emails takes on every ordering and update rule above.

### JSCalendar and the JSON Future

JSCalendar (RFC 8984, July 2021) is a JSON model for events, tasks and groups that's broadly compatible with iCalendar but isn't a one-to-one mapping: recurrence uses `recurrenceRules`, `excludedRecurrenceRules` and `recurrenceOverrides` (which can patch individual occurrences), and local date-times take their zone from a `timeZone` property naming an IANA zone, or are floating. It's the natural internal model for a new product: closer to how applications want the data than iCalendar's text format, with a defined mapping back to iCalendar at the edge.

## Free/Busy and Availability

Scheduling across people needs to know when they're busy without revealing why. Every system separates **free/busy** (time ranges and a status) from **details** (subject, location, attendees):

- **Microsoft Graph `getSchedule`** returns, for a set of users, distribution lists or rooms, an `availabilityView` string with one digit per slot (0 free, 1 tentative, 2 busy, 3 out of office, 4 working elsewhere), schedule items, and each person's working hours with their time zone. The slot length is configurable from 5 to 1,440 minutes, defaulting to 30, and a time slot containing more than 1,000 entries returns an error. The least-privileged permission is `Calendars.ReadBasic`.
- **Google `freebusy.query`** takes a time window and up to 50 calendars (and groups expanded to at most 100 members each) and returns busy ranges per calendar, with errors such as `groupTooBig` and `tooManyCalendarsRequested`.
- **CalDAV** answers free-busy queries through the scheduling outbox, and **RFC 7953** adds `VAVAILABILITY`: a container whose `AVAILABLE` subcomponents (which can recur, like weekday working hours) mark when a user can be booked, with everything else in its range treated as busy. Free-busy queries compute availability first and then lay events on top.

Two design rules follow. **Working hours are part of availability,** and both suites return them with free/busy; a scheduler that ignores them books a 7 a.m. meeting for someone in another time zone, which is the notification problem from [The Right to Disconnect](/books/workplace-and-collaboration/notifications-and-attention#the-right-to-disconnect) in calendar form. And **free/busy visibility is an admin policy:** who in the organization sees details versus just busy blocks, and whether people outside the organization see anything, is set by the tenant's sharing policy (the [Permissions & Sharing](/books/workplace-and-collaboration/permissions-and-sharing) chapter), with per-calendar overrides by the owner.

## Recurring Events and Time Zones

Recurring events are where calendar software fails most, and the playbook's [Recurrence: iCalendar](/docs/fundamentals/time#recurrence-icalendar) section covers the rules: anchor `DTSTART` with a `TZID`, express the pattern as an `RRULE`, remove instances with `EXDATE`, add them with `RDATE`, and expand with a library. Workplace calendars add three problems.

**Exceptions are separate objects.** Moving one instance of a weekly meeting creates an exception keyed by the series `UID` and the original start (`RECURRENCE-ID`). Microsoft Graph types every event as `singleInstance`, `seriesMaster`, `occurrence` or `exception`, records an occurrence's `originalStart`, lists a master's cancelled occurrences separately from its exceptions, and gives each occurrence its own `iCalUId`, so a mirror can't assume one identifier per series. When the organizer then changes the series (moves every Tuesday to Wednesday), each client has to decide what happens to existing exceptions, and the suites don't decide identically. A product syncing calendars must store exceptions with their `RECURRENCE-ID` and re-read the whole series after a series-level change rather than patching instances.

**Two vocabularies for time zones.** Google and the standards use IANA names (`America/Los_Angeles`); Exchange and parts of Microsoft Graph use Windows time zone names ("Pacific Standard Time") and can return custom zones defined by offsets and transition rules. The Unicode CLDR project publishes the mapping between Windows names and IANA zones (`windowsZones.xml`, where "Pacific Standard Time" maps to `America/Los_Angeles`). My rule: store IANA names internally, map Windows names at the integration boundary through CLDR, and keep the original identifier for round-tripping.

**Rules change, and recurring meetings must follow the wall clock.** The IANA time zone database records the history of local time worldwide, is updated as governments change their rules (release 2026f was published on October 27, 2026), and is maintained under BCP 175 (RFC 6557) by a TZ Coordinator through a public mailing list. A recurring 9:00 meeting stored as UTC instants drifts by an hour when a country changes its daylight saving rules; stored as wall time plus zone, it stays at 9:00 and moves in UTC. That's the playbook's [Future Wall-Clock Times](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone) rule, and calendars are its main customer. Ship tzdata updates promptly in servers and clients, and recompute stored UTC projections of future occurrences when the database changes.

## Rooms and Resources

Rooms, equipment and shared vehicles are calendar users without people. Exchange models them as [resource mailboxes](/books/workplace-and-collaboration/rooms-and-the-hybrid-office#rooms-as-accounts) whose calendar processing rules decide bookings automatically. The parameters, from the `Set-CalendarProcessing` reference:

- **`AutomateProcessing`:** `None`, `AutoUpdate` (requests stay tentative until a delegate approves) or `AutoAccept` (the booking assistant accepts or declines by policy). In Exchange Online, resource mailboxes created after November 15, 2018 default to `AutoAccept`.
- **`BookingWindowInDays`:** how far ahead the resource can be booked, 0 to 1,080 days, default 180.
- **`MaximumDurationInMinutes`:** default 1,440 (24 hours).
- **`AllowConflicts`:** default false. For recurring requests, `ConflictPercentageAllowed` and `MaximumConflictInstances` (both default 0) decide whether a series with some conflicts is declined entirely or accepted with the conflicting occurrences declined.
- **`AllBookInPolicy`, `BookInPolicy`, `RequestInPolicy` and `ResourceDelegates`:** who is auto-approved, who needs a delegate's approval, and who the delegates are.

Those parameters are a complete specification of resource booking as data, and they encode real workplace policy: boardrooms that need an assistant's approval, rooms that can't be held for a quarter in advance, equipment that can't be booked overnight. In Google Workspace, admins create calendar resources (rooms, projectors, fleet cars, guest offices) before users can schedule them, users add a resource to an event much as they invite a guest, and admins can be notified of bookings, changes and responses. The physical side (panels outside rooms, occupancy sensors that release no-show bookings, desk booking) is the [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office#booking-rooms-and-desks) chapter.

The design rule: **a resource is a calendar user with a booking policy,** evaluated by the server when the invitation arrives, and its decision is an iTIP REPLY like any attendee's. Building room booking as a separate reservation system next to the calendar produces double bookings the first time someone invites a room from Outlook directly.

## Scheduling Links

Scheduling links invert the invite: instead of the organizer proposing a time, the host publishes availability and the guest picks a slot. Calendly "checks your calendar for busy times and adds new meetings to it," with the host choosing which connected calendars to check for conflicts, and offers webhooks for bookings, cancellations and routing form submissions on paid plans. Google Calendar's appointment schedules let a user set appointment duration and availability and generate a booking page that reflects their availability and hides busy times, with some features (such as requesting payment through a connected Stripe account) requiring eligible subscriptions.

What makes a scheduling link correct:

- **Availability is computed at booking time,** from free/busy of every connected calendar and the host's rules (buffers, minimum notice, daily caps), and re-checked when the guest submits, because the slot shown five minutes ago may be gone.
- **The event is created on the host's calendar by the calendar server,** so the invitation, the `UID` and later updates follow iTIP; a reschedule is an update to the same event, not a cancel and a new one.
- **Time zones are the guest's to display and the host's to enforce;** show slots in the guest's zone, store them as instants plus the host's zone.
- **Round-robin and pooled links** across a team need a single booking decision per slot (a lock or a conditional write), or two guests book the same person.

## Calendar APIs and Sync

Products that integrate with calendars (meeting tools, CRMs, notetakers, AI assistants) keep a local mirror and keep it current through change notifications:

- **Microsoft Graph** subscriptions on Outlook events last up to 10,080 minutes (under seven days), or 1,440 minutes when notifications include resource data; they must be renewed before expiry, a request for under 45 minutes is extended to 45, and notifications for calendars arrive on average in under a minute and at most three. Events also support delta queries over a calendar view, which is the incremental sync a notification should trigger, and an event can carry at most 500 attendees.
- **Google Calendar** watch channels are created per resource with a unique id and an HTTPS address; a `sync` message confirms the channel, `exists` messages signal changes, notifications carry no body (the app makes another API call to get the changes), some notifications may be dropped, and there's no automatic renewal, so the app creates a new channel before the old one expires and tolerates a brief overlap.

The pattern for both: **a notification means "something changed, go look," never "here is the change."** Keep a sync cursor per calendar, run an incremental sync on every notification and on a timer (for the notifications that never arrive), renew subscriptions well before expiry, and treat a missing subscription as a full resync. API permissions are the tenant admin's decision (an application permission to read every calendar in a tenant is a significant grant), which the [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces) chapter covers.

## How to Build It

A product with its own calendar, or a mirror of external ones, extends the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) as follows. A calendar is a `containers` row with `kind = 'calendar'`; an event is an `items` row with `kind = 'event'`.

```sql
CREATE TABLE calendars (                     -- kind table: a person's, a group's or a resource's
  container_id  UUID PRIMARY KEY REFERENCES containers (id),
  owner_member_id UUID REFERENCES members (id),
  resource_id   UUID,                        -- set for rooms and equipment
  time_zone     TEXT NOT NULL,               -- IANA name
  source        TEXT NOT NULL CHECK (source IN ('native', 'exchange', 'google', 'caldav')),
  external_id   TEXT,                        -- the provider's calendar id when mirrored
  freebusy_visibility TEXT NOT NULL DEFAULT 'org_freebusy'
                  CHECK (freebusy_visibility IN ('private', 'org_freebusy', 'org_details',
                  'public_freebusy'))
);

CREATE TABLE calendar_events (               -- kind table for items of kind 'event'
  item_id         UUID PRIMARY KEY REFERENCES items (id),
  calendar_id     UUID NOT NULL REFERENCES calendars (container_id),
  ical_uid        TEXT NOT NULL,             -- RFC 5545 UID, kept forever
  recurrence_id   TIMESTAMPTZ,               -- set on exceptions: the original start
  series_item_id  UUID REFERENCES calendar_events (item_id),  -- master, for exceptions
  sequence        INT NOT NULL DEFAULT 0,
  dtstamp         TIMESTAMPTZ NOT NULL,
  organizer_email TEXT NOT NULL,
  organizer_member_id UUID REFERENCES members (id),  -- null when external
  summary         TEXT,
  start_local     TIMESTAMP NOT NULL,        -- wall time
  end_local       TIMESTAMP NOT NULL,
  time_zone       TEXT NOT NULL,             -- IANA; the original id kept in source_tzid
  source_tzid     TEXT,                      -- e.g. a Windows zone name, for round-trips
  all_day         BOOLEAN NOT NULL DEFAULT FALSE,
  rrule           TEXT,                      -- masters only
  exdates         TIMESTAMP[] NOT NULL DEFAULT '{}',
  show_as         TEXT NOT NULL DEFAULT 'busy' CHECK (show_as IN ('free', 'tentative',
                    'busy', 'oof', 'working_elsewhere')),
  status          TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
  online_meeting_url TEXT,                   -- the Meetings & Video chapter keys meetings by ical_uid
  UNIQUE (calendar_id, ical_uid, recurrence_id)
);

CREATE TABLE event_attendees (
  event_item_id   UUID NOT NULL REFERENCES calendar_events (item_id),
  email           TEXT NOT NULL,
  member_id       UUID REFERENCES members (id),
  role            TEXT NOT NULL DEFAULT 'required'
                    CHECK (role IN ('required', 'optional', 'resource', 'chair')),
  partstat        TEXT NOT NULL DEFAULT 'needs_action' CHECK (partstat IN ('needs_action',
                    'accepted', 'declined', 'tentative', 'delegated')),
  last_reply_sequence INT,                   -- iTIP: discard older replies
  last_reply_dtstamp  TIMESTAMPTZ,
  schedule_agent  TEXT NOT NULL DEFAULT 'server'
                    CHECK (schedule_agent IN ('server', 'client', 'none')),
  PRIMARY KEY (event_item_id, email)
);

CREATE TABLE calendar_resources (            -- rooms and equipment with a booking policy
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id           UUID NOT NULL REFERENCES workspaces (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('room', 'equipment', 'desk', 'vehicle')),
  name                   TEXT NOT NULL,
  capacity               INT,
  processing             TEXT NOT NULL DEFAULT 'auto_accept'
                           CHECK (processing IN ('none', 'auto_update', 'auto_accept')),
  booking_window_days    INT NOT NULL DEFAULT 180 CHECK (booking_window_days BETWEEN 0 AND 1080),
  max_duration           INTERVAL NOT NULL DEFAULT '24 hours',
  allow_conflicts        BOOLEAN NOT NULL DEFAULT FALSE,
  conflict_pct_allowed   INT NOT NULL DEFAULT 0,
  max_conflict_instances INT NOT NULL DEFAULT 0,
  book_in_policy_group_id UUID REFERENCES groups (id),  -- auto-approved
  delegate_group_id      UUID REFERENCES groups (id)    -- approves the rest
);

CREATE TABLE calendar_sync_cursors (         -- one per mirrored external calendar
  calendar_id     UUID PRIMARY KEY REFERENCES calendars (container_id),
  provider_cursor TEXT,                      -- delta token or sync token
  subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  last_full_sync_at TIMESTAMPTZ,
  last_notification_at TIMESTAMPTZ,
  state           TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'resync',
                    'reauth_required', 'disabled'))
);
```

Notes on the sketch:

- **Wall time plus zone is the stored truth.** `start_local` and `time_zone` are authoritative; any UTC projection for queries (a materialized occurrence table for the next year) is derived and rebuilt when the series changes or tzdata updates.
- **Masters and exceptions are rows of one table.** An exception has `series_item_id` and `recurrence_id`; expansion takes the master's `rrule`, removes `exdates` and the original starts of exceptions, and overlays the exceptions.
- **iTIP ordering is enforced on write.** An inbound REPLY updates `event_attendees` only if its `SEQUENCE` is not lower than the event's and, at equal sequence, its `DTSTAMP` is newer than `last_reply_dtstamp`; an inbound REQUEST updates the event only if its `SEQUENCE` is higher.
- **Resources decide on arrival.** When an event invites a `calendar_resources` row, evaluate the policy (window, duration, conflicts for each expanded occurrence, the organizer's group membership) and write the resource's `partstat` as its reply; requests outside policy go to the delegate group.
- **Sync is cursor plus timer.** Each notification marks the cursor dirty; a worker runs an incremental sync; a timer resyncs calendars with no notification for a set period; an expired or failed subscription moves `state` to `resync` and the next run does a full sync. The book's `api_tokens` row behind each mirror records the scopes the tenant admin granted.

## Auditing

- **Event changes with their `SEQUENCE`, actor and channel** (native client, API app, inbound iMIP), so a disputed "who moved the meeting?" has an answer.
- **Inbound scheduling messages that were discarded** as stale or unauthorized (a REQUEST from someone other than the organizer), because those are either bugs or spoofing.
- **Resource booking decisions** with the policy that applied, and delegate approvals and rejections.
- **Free/busy and calendar sharing changes,** especially anything that exposes details outside the organization.
- **Calendar API grants:** which app can read which calendars, granted by whom, and when subscriptions were created and renewed ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Don't send product mail through users' mailboxes;** both suites cap them and say they aren't for bulk sending.
- **Key identity on account ids, not addresses,** and keep address history.
- **Let the calendar server schedule:** create events with attendees through the provider's API and let it send iTIP, or implement iTIP's `UID`, `SEQUENCE` and `DTSTAMP` rules exactly.
- **Store wall time plus an IANA zone,** map Windows zone names through CLDR at the boundary, and update tzdata promptly.
- **Model exceptions as rows keyed by `RECURRENCE-ID`** and re-read whole series after series-level changes.
- **Treat working hours as part of availability** and free/busy visibility as admin policy.
- **Make resources calendar users with booking policies,** not a separate reservation system.
- **Treat change notifications as hints:** cursor, incremental sync, timer resync, early renewal.

## References

**Standards**

- [RFC 5545: Internet Calendaring and Scheduling Core Object Specification (iCalendar)](https://datatracker.ietf.org/doc/html/rfc5545), components and properties, recurrence, `UID`, `SEQUENCE`, `DTSTAMP`, `RECURRENCE-ID` (September 2009)
- [RFC 5546: iCalendar Transport-Independent Interoperability Protocol (iTIP)](https://www.rfc-editor.org/rfc/rfc5546.html), the eight methods, organizer and attendee roles, matching and ordering by `UID`, `SEQUENCE` and `DTSTAMP` (December 2009)
- [RFC 6047: iCalendar Message-Based Interoperability Protocol (iMIP)](https://datatracker.ietf.org/doc/html/rfc6047), iTIP over email, spoofing threats, checking ORGANIZER and ATTENDEE, S/MIME and sent-by (December 2010)
- [RFC 4791: Calendaring Extensions to WebDAV (CalDAV)](https://datatracker.ietf.org/doc/html/rfc4791), calendar access over WebDAV (March 2007)
- [RFC 6638: Scheduling Extensions to CalDAV](https://www.rfc-editor.org/rfc/rfc6638.html), implicit scheduling, scheduling inbox and outbox, `SCHEDULE-AGENT`, `Schedule-Tag`, single-system scope (June 2012)
- [RFC 7953: Calendar Availability](https://www.rfc-editor.org/rfc/rfc7953.html), `VAVAILABILITY` and its use in free-busy (August 2016)
- [RFC 8984: JSCalendar](https://www.rfc-editor.org/rfc/rfc8984.html), the JSON model, its relationship to iCalendar, recurrence properties and IANA time zones (July 2021)
- [RFC 6557: Procedures for Maintaining the Time Zone Database](https://www.rfc-editor.org/rfc/rfc6557.html), BCP 175, the TZ Coordinator and mailing list
- [IANA: Time Zone Database](https://www.iana.org/time-zones), what the database records and release 2026f of October 27, 2026
- [Unicode CLDR: windowsZones.xml](https://github.com/unicode-org/cldr/blob/main/common/supplemental/windowsZones.xml), the Windows to IANA time zone mapping

**Vendor documentation**

- [Microsoft Learn: Exchange Online limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits), recipient rate, recipient and message rate limits, the tenant external recipient rate limit, the 5,000-recipient meeting message limit, bulk mail guidance
- [Google Workspace Admin Help: Gmail sending limits in Google Workspace](https://knowledge.workspace.google.com/admin/gmail/gmail-sending-limits-in-google-workspace), daily message, recipient, external and unique recipient limits
- [Microsoft Learn: Limits and specifications for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams), emailing a channel: size, attachments and throttling
- [Microsoft Learn: calendar getSchedule](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule), availability view codes, interval range and default, working hours, the 1,000-entry error, permissions, Windows time zone names
- [Google Calendar API: Freebusy query](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query), request fields, the 50-calendar and 100-member expansion limits, error reasons
- [Microsoft Learn: event resource type](https://learn.microsoft.com/en-us/graph/api/resources/event), event types, `originalStart`, per-occurrence `iCalUId`, cancelled occurrences and exceptions, delta queries, the 500-attendee limit
- [Google Workspace Admin Help: What is a calendar resource?](https://knowledge.workspace.google.com/admin/calendar/what-is-a-calendar-resource), resources created by admins, booking by adding to events, booking notifications
- [Microsoft Learn: Set-CalendarProcessing](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/set-calendarprocessing), resource booking parameters, defaults and the November 15, 2018 default change
- [Microsoft Learn: subscription resource type](https://learn.microsoft.com/en-us/graph/api/resources/subscription), Outlook event subscription lifetimes, the 45-minute minimum, calendar notification latency
- [Google Calendar API: Push notifications](https://developers.google.com/workspace/calendar/api/guides/push), watch channels, resource states, bodiless notifications, dropped notifications, manual renewal
- [Google Calendar Help: Create a booking page with appointment schedules](https://support.google.com/calendar/answer/10729749), appointment schedules, booking pages and subscription-dependent features
- [Calendly Help: Webhooks overview](https://calendly.com/help/webhooks-overview), webhook subscriptions and plans, checking connected calendars for busy times
