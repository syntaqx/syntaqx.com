+++
title = "Rooms, Devices & the Hybrid Office"
nav_title = "Rooms & Hybrid Office"
description = "Teams Rooms and Zoom Rooms, certified devices, cross-vendor join, room and desk booking with auto-release, work location, visitors, and badge data limits."
category = "Workplace & Collaboration Industry"
order = 2022
part = "Meetings and Voice"
tags = ["meeting-rooms", "hybrid-work", "desk-booking", "occupancy", "employee-privacy"]
+++

The hybrid office is a building full of shared things that software has to know about: meeting rooms with a camera, microphones, a display and a touch console; desks nobody owns that someone books for Tuesday; a lobby where visitors sign in; badge readers on every door. Collaboration vendors moved into all of it once meetings went hybrid, because a meeting where half the people are in a room and half are remote only works if the room is a first-class participant, and because the same calendar that books the meeting books the room.

Rooms are hard in ways personal devices aren't. A room device is a shared, unattended computer signed in as a resource rather than a person, so licensing, security and management all work differently. Rooms must join meetings hosted on other vendors' platforms, because the customer doesn't control what the other company uses. Booking systems have to deal with the meeting that was booked and never happened. And the data the office generates (who badged in, who sat where, how many people were in the room) is employee data, which turns an occupancy dashboard into a monitoring question with law attached. This chapter covers room systems and their licensing, certified devices, joining across vendors, room intelligence, room and desk booking with check-in and auto-release, work location, visitor management, and occupancy data and its limits. Meetings themselves are [Meetings & Video](/books/workplace-and-collaboration/meetings-and-video); calendars and free/busy are [Email & Calendar](/books/workplace-and-collaboration/email-and-calendar).

## How the Platforms Do It

As of October 2026:

| Product | What it does | Key rules from public documentation |
| --- | --- | --- |
| **Microsoft Teams Rooms** | Room systems on Windows, Android or Surface Hub, with Teams Panels outside the door | Basic license free for up to 25 rooms; Pro adds management, Intune, Entra ID P1, Defender, speaker identification, people counting, dual screens; joins Zoom, Webex and Meet as a guest |
| **Zoom Rooms** | "A software-based conference room system" for meetings, wireless sharing, whiteboarding and room controls | $49 per room per month ($41.58 billed annually): up to 3 displays and 10 room controllers, 1,000-participant meetings, one-tap join to third-party meetings, Microsoft 365, Google and Exchange calendars, appliance or open hardware |
| **Zoom Workspace Reservation** | Desk and space booking in the Zoom Workplace app | $1.50 per space per month ($1.25 billed annually): booking from Google Calendar or Outlook, check-in alerts, QR-code check-in, release when done |
| **Exchange Online room mailboxes** | The calendar behind Microsoft rooms | Auto-accept by default, 180-day booking window, 24-hour maximum duration, delegates, room lists |
| **Google Calendar resources** | The calendar behind Google rooms | Up to 10,000 buildings and 10,000 resources per company; rooms released when all but one invitee declines |
| **Microsoft Places** | Buildings, floors, room and desk booking, check-in and auto-release, work location, building analytics | Auto-release after 10 minutes by default; workplace check-in off by default; badge data kept 28 days, aggregates 90; counts under 10 hidden |
| **Envoy** | Visitor management | Visitors sign NDAs before arrival, blocklists, a kiosk in 17 languages |

The pattern: **the room is a calendar resource first and a device second.** Every product hangs off a resource calendar (an Exchange room mailbox, a Google resource) that accepts or declines bookings, and the device in the room reads that calendar to show the day's meetings and offer one-touch join. The rest of the hybrid office (desks, check-in, occupancy) is built by extending the same resource model to more things.

## Rooms as Accounts

A Teams Rooms system signs in as a **resource account**: a mailbox-enabled identity for the room, not a person. That decides its licensing and its security posture.

Microsoft sells two licenses as of October 2026. **Teams Rooms Basic** is free for "core meeting experiences" (scheduling, joining, content sharing, whiteboarding, basic security and management), limited to 25 per organization and to one certified system per room. **Teams Rooms Pro** is unlimited and adds the Pro Management portal, intelligent audio and video, front row and large galleries, dual screens, Teams Phone, Intune, Entra ID P1 (for Conditional Access on the room) and Defender for Endpoint. Two licensing rules show the shared-device boundary clearly:

- A shared meeting device "requires a Teams Rooms license whether it participates by signing in to a Microsoft Teams client, by anonymous join, or by authenticating a Microsoft 365 identity," and per-user enterprise licenses "aren't authorized for use on shared meeting devices." A room isn't a cheap seat.
- A license is "intended for a single room only," and using one account across devices in different rooms violates the terms.

Microsoft also advises against giving room accounts OneDrive, so that recordings and transcripts aren't saved to the room's storage instead of a person's or a channel's ([Who Owns a Recording](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#who-owns-a-recording)), and warns that because room devices sign in automatically, one signed in with an executive's own account needs physical security against unauthorized use.

The calendar side is configured on the room's mailbox. In Exchange Online, a room mailbox by default auto-accepts requests that fit its rules and declines conflicts and violations, with a booking window of 180 days, a maximum duration of 24 hours, optional working-hours-only booking and optional delegates who approve requests. Rooms carry capacity, location and features such as wheelchair access and the names of their audio, display and video devices; room lists group them by building, which Microsoft suggests once an organization has more than 100 rooms. Google Calendar's equivalent lets a company define up to 10,000 buildings with floors, up to 10,000 resources and up to 100 features, with capacity as a "recommended number of people."

## Certified Devices

Room hardware is sold through certification programs. Microsoft's says certified devices meet requirements for "security, audio and video quality, Teams experience, and accessibility," and is explicit about the limit: it "ensures certified devices meet specific requirements for hardware design and performance only" and "doesn't evaluate feature-level or cloud environment support." The catalog has two system families, Windows compute modules with a touch console (listed with processor, memory and storage) and Android all-in-one devices, plus certified peripherals with flags for content cameras, intelligent cameras, spatial audio and intelligent speakers.

Certification shifts work in both directions. The vendor gets a predictable hardware target for its room software and updates; the hardware maker gets a logo customers' procurement teams require; the customer gets fewer surprises but a shorter list. Small details still bite: a consumer TV used as a room display must support HDMI-CEC to wake to an active source, which "is not supported on all TVs."

Management is a licensing line. Since October 2, 2023, Teams Rooms devices without Pro (or legacy Premium) licenses lose the Pro Management portal's capabilities beyond enrollment and inventory; Pro adds remote configuration, peripheral health, device history, custom alerts, ITSM integration and analytics. For a facilities team running hundreds of rooms, that remote management is the product; the meeting experience is table stakes.

## Joining Across Vendors

A room bought for one platform will be invited to meetings on another. Teams Rooms offers two mechanisms, and Microsoft's comparison is the clearest public statement of the trade-offs:

| | Cross-platform via SIP | Direct Guest Join |
| --- | --- | --- |
| How | The room dials the other platform's SIP interop | The room opens the other platform's web client as a guest over WebRTC |
| Platforms (join button) | Amazon Chime, Webex, Google Meet, GoToMeeting, RingCentral, Zoom, other SIP services | Webex, Zoom, Google Meet |
| Video | Up to 1080p at 30 fps | Up to 720p at 30 fps |
| Front-of-room displays | Two | One |
| Send content over HDMI or content camera | Yes | No |
| Requires | A paid SIP dialing plan and Teams Rooms Pro | Direct internet access; Basic or Pro |

Getting the join button to appear exposes how fragile cross-vendor join is. For Teams meetings the room reads hidden properties in the invite, but for third-party meetings it has to read the invite body, so the room mailbox must keep it and accept externally created invites (`Set-CalendarProcessing -ProcessExternalMeetingMessages $True -DeleteComments $False`). Microsoft's own Safe Links needs no change, but third-party security products that rewrite URLs in email break the link the room needs to recognize, so the customer's admin adds the other vendors' meeting domains (Microsoft lists `*.webex.com`, `*.zoom.us`, `*.zoom.com`, `*.zoomgov.com` and `*.meet.google.com` as examples) to the product's rewrite exception list. And because Direct Guest Join connects straight to the other platform's website, firewalls and web filters must let the room reach it without authentication. A room with SIP dialing enabled uses SIP when it can and falls back to Direct Guest Join from the calendar button when an invite has no SIP dial string; join by ID has no such fallback and fails.

The opposite direction (other vendors' rooms into Teams) is Cloud Video Interop and SIP Guest Join, covered in [Interop With Rooms and Other Platforms](/books/workplace-and-collaboration/meetings-and-video#interop-with-rooms-and-other-platforms). Every one of these paths is a negotiated degradation: the guest room gets fewer features than a native participant, and the customer's admin configures mail flow, URL rewriting and firewalls so that it works at all.

## Intelligence in the Room

Room systems increasingly see and hear who is present. Teams Rooms Pro lists speaker identification, multi-camera support, a panoramic view, AI noise suppression and people counting among its features, and Teams can use enrolled voice and face profiles to attribute speech and recognize people in the room, under a separate admin configuration for Teams Rooms ([Transcripts, Captions and Speaker Identification](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#transcripts-captions-and-speaker-identification)).

Two kinds of data come out of a smart room, and they need different treatment. **Identification** (which enrolled person is speaking) is biometric processing of named individuals and needs their opt-in. **Counting** (how many people are in the room) is occupancy data, useful for space planning and safe to aggregate, but it becomes personal data the moment it's joined to a booking that names the organizer. The design keeps them apart: counts flow to space analytics without identities, and identities stay inside the meeting that consented participants are in.

## Booking Rooms and Desks

Booking is a reservation problem: one room, one time slot, no double booking, and the playbook's [Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time) is the core technique. The workplace-specific problem is the **ghost meeting**: a recurring booking that nobody attends, holding a room all quarter. The vendors solve it with two opposite kinds of evidence.

**Release on absence (check-in).** Microsoft Places releases a room automatically "if no one checks in within a configurable time window," 10 minutes by default (`Set-CalendarProcessing -EnableAutoRelease $true -PostReservationMaxClaimTimeInMinutes 20` makes it 20). Attendees check in on the Teams panel outside the room, by joining from the Teams Rooms console, through the meeting chat, or by email when chat isn't available. Microsoft recommends enabling auto-release only where rooms have panels or room systems "to ensure that all users have a way to check in," notes that setting changes take up to 48 hours, and as of October 2026 ties eligibility to Teams Premium licenses bought before April 1, 2026 or to rooms with a Teams Rooms or Shared Space license.

**Release on intent (declines).** Google Calendar can "release booked meeting rooms when all but one person declines the meeting," and fences it carefully: no release for declines less than 10 minutes before start, for meetings starting within 30 minutes, for meetings longer than four hours, for rooms holding 20 or more people, for meetings with external guests or no guests besides the organizer, or for rooms booked directly on the room's calendar. Admins can exempt rooms and user groups (Google suggests executives and business-critical rooms), and the organizer gets an email when a room is released.

Each design fails differently. Check-in releases a room when the meeting is real but people are late or forget to tap the panel; declines miss the meeting where nobody declined and nobody came. The general rule from the playbook applies: hold lifetimes are policy, and releases must be visible to the person who lost the hold ([Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)).

Desks extend the same model. Places supports desk pools and individual desk accounts, and can reserve a desk automatically when a user's laptop connects to a peripheral at it: the admin maps each monitor or device to a desk by product ID, vendor ID and serial number, and when the user plugs in with Teams running, the desk is booked, a calendar entry appears and an activity notification says "The [space or desk] is reserved and ready for you." Desk usage reports follow from the same events.

## Work Location and Presence

Hybrid scheduling needs to know who will be in the office, so presence gained a location. Microsoft 365 distinguishes a **planned work location** (a user's recurring work plan or a one-off entry in the calendar) from an **actual work location**, which users can set manually or let **workplace check-in** set automatically from the corporate Wi-Fi network (mapped to buildings by access point BSSID) or a configured desk peripheral. Microsoft's published rules for the automatic version are a model of the privacy line:

- Workplace check-in "is always off by default" and must be enabled by the admin, for everyone or for chosen users.
- For Wi-Fi, the admin picks **Inform mode** (users see a banner and are shared unless they opt out), **Ask mode** (nothing is shared unless they opt in) or **Off**; users can change their choice at any time in Inform and Ask modes, and must also grant the Teams desktop app operating-system location permission.
- The actual location is "cleared at the end of a user's working hours," isn't updated outside working hours, and "the history of actual location isn't available."
- Users can set, override or clear their location at any time, and work location is shared only inside the organization, by the user's choice.
- Microsoft states that workplace check-in "is not a tracking tool and can't be used to monitor employee attendance," and that it gives admins no monitoring or reporting views or historical location data.

That last list is what a collaboration feature looks like when its designer knows the monitoring rules: no history, no admin report, user override and a default of off.

## Visitors

Visitor management covers everyone who isn't an employee: guests, candidates, contractors, deliveries. Envoy's public product material lists a kiosk that supports 17 languages, NDAs that "visitors can now sign... before they arrive," pre-registration and blocklists. The design questions are the same across vendors:

- **The visitor log is personal data about non-employees,** who never signed the employer's handbook, so it needs a stated purpose, a notice at sign-in and a retention period.
- **Signed documents are records:** an NDA signed on a kiosk is an electronic signature with an audit trail ([Electronic Signatures](/docs/compliance/electronic-signatures)).
- **Blocklists and watchlists are adverse decisions about people,** so they need an owner, a reason and review.
- **Host notification** ties a visitor to an employee and, often, to a meeting in the calendar, which is where visitor data joins the collaboration graph.

## Occupancy Data and Its Limits

Real estate teams want to know how buildings are used, and the richest signal is the badge system. Microsoft Places' building analytics compares employees' work plans (intent) with "badge data to infer the number of employees present in a building" (actual), mapped to people through Entra ID profile data such as office location and manager. The badge feed it accepts is identity-level (the schema includes the badged user's email and a timestamp), and the privacy controls sit on retention and output:

- Uploaded badge data is retained for 28 days; aggregated processed data for 90 days.
- Analytics "always aggregates the data points"; "users can't identify information about any specific, individual employees."
- Leaders with fewer than 10 people under them aren't shown in the leader hierarchy, and days with fewer than 10 people in a building aren't shown, "due to privacy risks."

Those thresholds are the vendor's choice. Nothing stops a customer from pulling a per-person attendance report out of its own badge system, and an attendance policy enforced from badge swipes does exactly that. What the law says about it varies:

- **New York** requires employers that electronically monitor employees to give "prior written notice upon hiring," get an acknowledgment and post the notice; it covers monitoring of "telephone conversations or transmissions, electronic mail or transmissions, or internet access or usage," with civil penalties of up to $500, $1,000 and $3,000 for first, second and later offenses.
- **The NLRB's** General Counsel issued GC 23-02 on October 31, 2022, urging the Board to find that an employer "has presumptively violated the Act" when surveillance and management practices as a whole "would tend to interfere with or prevent a reasonable employee from engaging in activity protected by the Act," with disclosure of the technologies where business need outweighs that. The memo was rescinded on February 14, 2025 by GC 25-05; the Act's protection of concerted activity, which the memo interpreted, didn't change.
- **In the EU,** occupancy and badge data about identifiable employees is personal data under the GDPR ([GDPR](/docs/compliance/gdpr#lawful-bases)), with employee-specific rules and works councils on top.

The full treatment of what employers may watch is [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy#united-states). For the system builder, the line is the one Microsoft drew: **aggregate for space planning, keep raw identity data briefly, suppress small groups, and don't build the per-person attendance report into a collaboration product.** If a customer needs attendance tracking, it should be a deliberate HR system with its own notice, not a side effect of desk booking.

## How to Build It

Rooms are resource accounts (an `accounts` row managed by the organization and a `members` row with `kind = 'service'`), so they can be invited, granted and logged like anyone else. This chapter adds the building hierarchy, bookings with release, devices, work location, visitors and aggregate occupancy. The table is `places` rather than `spaces`, since `space` is already a container kind for wikis and documents. A place is where a room or desk is; its calendar booking policy (processing, conflicts, who may book) is the `calendar_resources` row from [Email & Calendar](/books/workplace-and-collaboration/email-and-calendar#rooms-and-resources), joined by `calendar_resource_id`, and the window and duration columns here are the desk-booking defaults for places without one.

```sql
CREATE TABLE places (                      -- buildings, floors, sections, rooms, desk pools, desks
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  parent_id          UUID REFERENCES places (id),
  kind               TEXT NOT NULL CHECK (kind IN ('building', 'floor', 'section', 'room',
                       'desk_pool', 'desk')),
  name               TEXT NOT NULL,
  resource_member_id UUID REFERENCES members (id),     -- the bookable resource account
  calendar_resource_id UUID REFERENCES calendar_resources (id),  -- its booking policy
  capacity           INT,
  features           TEXT[] NOT NULL DEFAULT '{}',     -- accessible, video, whiteboard
  address            JSONB,                 -- buildings
  auto_release_after INTERVAL,              -- null: never auto-release
  release_on_declines BOOLEAN NOT NULL DEFAULT FALSE,
  booking_window     INTERVAL NOT NULL DEFAULT INTERVAL '180 days',
  max_duration       INTERVAL NOT NULL DEFAULT INTERVAL '24 hours'
);

CREATE TABLE place_bookings (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  place_id           UUID NOT NULL REFERENCES places (id),
  booked_by          UUID NOT NULL REFERENCES members (id),
  meeting_id         UUID REFERENCES meetings (id),    -- when the booking is a meeting room
  ical_uid           TEXT,
  during             TSTZRANGE NOT NULL,
  state              TEXT NOT NULL CHECK (state IN ('held', 'checked_in', 'released',
                       'cancelled', 'completed')),
  checked_in_via     TEXT CHECK (checked_in_via IN ('panel', 'room_console', 'chat', 'email',
                       'peripheral', 'manual')),
  released_reason    TEXT CHECK (released_reason IN ('no_check_in', 'declines', 'organizer',
                       'admin')),
  EXCLUDE USING gist (place_id WITH =, during WITH &&)
    WHERE (state IN ('held', 'checked_in'))
);

CREATE TABLE room_devices (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  place_id           UUID NOT NULL REFERENCES places (id),
  resource_member_id UUID NOT NULL REFERENCES members (id),
  kind               TEXT NOT NULL CHECK (kind IN ('room_system', 'panel', 'peripheral',
                       'sensor')),
  model              TEXT NOT NULL,
  certified          BOOLEAN NOT NULL,
  hardware_ids       JSONB,                 -- product ID, vendor ID, serial for peripherals
  license            TEXT,                  -- the room license assigned
  third_party_join   TEXT[] NOT NULL DEFAULT '{}',     -- platforms enabled for guest join
  last_heartbeat_at  TIMESTAMPTZ
);

CREATE TABLE work_locations (              -- current state only; no history by design
  member_id          UUID PRIMARY KEY REFERENCES members (id),
  planned            TEXT CHECK (planned IN ('office', 'remote')),
  planned_place_id   UUID REFERENCES places (id),
  actual             TEXT CHECK (actual IN ('office', 'remote')),
  actual_place_id    UUID REFERENCES places (id),
  actual_source      TEXT CHECK (actual_source IN ('manual', 'wifi', 'peripheral')),
  share_with_coworkers BOOLEAN NOT NULL DEFAULT FALSE,
  clears_at          TIMESTAMPTZ            -- end of the member's working hours
);

CREATE TABLE visitor_visits (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  place_id           UUID NOT NULL REFERENCES places (id),  -- the building
  visitor_name       TEXT NOT NULL,
  visitor_email      TEXT,
  host_member_id     UUID REFERENCES members (id),
  purpose            TEXT NOT NULL,
  documents_signed   JSONB NOT NULL DEFAULT '[]',     -- NDA versions and signature records
  signed_in_at       TIMESTAMPTZ,
  signed_out_at      TIMESTAMPTZ,
  purge_after        TIMESTAMPTZ NOT NULL
);

CREATE TABLE occupancy_daily (             -- what analytics may show: aggregates only
  place_id           UUID NOT NULL REFERENCES places (id),
  day                DATE NOT NULL,
  source             TEXT NOT NULL CHECK (source IN ('badge', 'sensor', 'room_count',
                       'bookings', 'work_plans')),
  people             INT NOT NULL,
  peak               INT,
  suppressed         BOOLEAN NOT NULL,      -- true when people < the minimum group size
  PRIMARY KEY (place_id, day, source)
);
```

Notes on the sketch:

- **Bookings can't overlap** while held or checked in (the exclusion constraint); released bookings free the slot immediately.
- **Release is a job with two triggers:** no check-in by `lower(during) + auto_release_after`, or declines from all but one invitee under the room's `release_on_declines` fences; both notify the organizer and write `released_reason`.
- **Peripheral check-in is a lookup,** from the hardware IDs the client reports to a desk, which books it and sets `work_locations.actual` only if the member enabled automatic location.
- **Work location keeps no history.** The row is overwritten and cleared at `clears_at`; there's no events table for it, which is what makes "can't be used to monitor attendance" true in the schema rather than in a policy.
- **Raw badge events stay out of the collaboration database,** or live in a short-retention staging table that a job aggregates into `occupancy_daily`, suppressing groups under the minimum size and purging raw rows on schedule.
- **Room devices are accounts with licenses,** so device sign-in, Conditional Access and the audit log treat them as identities.
- **Events:** `place.booked`, `place.checked_in`, `place.released`, `device.offline`, `visitor.signed_in`, `visitor.signed_out`, `occupancy.aggregated` feed panels, notifications, facilities dashboards and the audit log.

## Auditing

- **Every automatic release,** with the trigger and the organizer notified, since a wrongly released room is a complaint with a timestamp.
- **Room and device configuration changes,** including third-party join, calendar processing settings and licenses.
- **Changes to work location policy** (off, inform, ask) and to which networks and peripherals map to buildings.
- **Visitor records, signed documents and blocklist entries,** with who added them and why, and their purge.
- **Every export of occupancy data and every change to the minimum group size,** since those are the points where space analytics could become monitoring ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Model rooms and desks as resource accounts with calendars,** licensed and managed as shared devices, never signed in as a person.
- **Certify hardware for performance and manage it remotely;** for a facilities team, management is the product.
- **Support joining other vendors' meetings,** and document the mail-flow, URL-rewrite and firewall settings the customer's admin must make.
- **Keep identification and counting apart:** opt-in biometrics inside meetings, anonymous counts for space planning.
- **Prevent double booking with constraints,** and release ghost meetings on absence or declines with visible, fenced rules.
- **Make automatic work location off by default, user-controlled, cleared daily and without history.**
- **Treat visitor logs as personal data of non-employees** with notice, purpose and retention.
- **Aggregate occupancy, keep raw badge data briefly and suppress small groups;** leave attendance tracking to systems built and disclosed for it.

## References

**Vendor documentation**

- [Microsoft Learn: Microsoft Teams Rooms licenses](https://learn.microsoft.com/en-us/microsoftteams/rooms/rooms-licensing), Basic and Pro, the 25-room limit, shared-device licensing, one room per license, Pro features including speaker identification and people counting, management portal changes from October 2, 2023, OneDrive and executive-account warnings
- [Microsoft Learn: Third-party meetings on Teams Rooms](https://learn.microsoft.com/en-us/microsoftteams/rooms/third-party-join), SIP join versus Direct Guest Join comparison, calendar processing settings, URL rewriting, network access, fallback behavior
- [Microsoft Learn: Teams Rooms certified systems and peripherals](https://learn.microsoft.com/en-us/microsoftteams/rooms/certified-hardware), the certification program's scope and limits, system and peripheral lists, HDMI-CEC for consumer displays
- [Microsoft Learn: Manage resource mailboxes in Exchange Online](https://learn.microsoft.com/en-us/exchange/recipients-in-exchange-online/manage-resource-mailboxes), room mailbox booking options and defaults, delegates, room features, room lists
- [Microsoft Learn: Microsoft Places documentation](https://learn.microsoft.com/en-us/microsoft-365/places/), the Places feature set
- [Microsoft Learn: Enable check in and autorelease (Rooms)](https://learn.microsoft.com/en-us/microsoft-365/places/room-desk-booking/enable-checkin-auto-rooms), check-in methods, the 10-minute default, configuration, propagation and eligibility
- [Microsoft Learn: Configure automatic check in with desk peripherals](https://learn.microsoft.com/en-us/microsoft-365/places/room-desk-booking/configure-auto-checkin-desk-peripherals), mapping peripherals to desks and the reservation flow
- [Microsoft Learn: Configure workplace check-in](https://learn.microsoft.com/en-us/microsoft-365/places/configure-auto-detect-work-location), planned and actual work location, Wi-Fi and peripheral signals, inform, ask and off modes, clearing and no history, the not-a-tracking-tool statement
- [Microsoft Learn: Building analytics](https://learn.microsoft.com/en-us/microsoft-365/places/enable-places-analytics/building-analytics), work plans versus badge data, the badge schema, 28-day and 90-day retention, the minimum group of 10
- [Microsoft Learn: Privacy, security, and compliance in Microsoft Places](https://learn.microsoft.com/en-us/microsoft-365/places/compliance-privacy-security-in-places), data residency and no model training on Places data
- [Microsoft Learn: Overview and configuration of voice and face enrollment](https://learn.microsoft.com/en-us/microsoftteams/rooms/voice-and-face-recognition), recognition profiles used in Teams Rooms
- [Google Workspace Admin Help: Create buildings, features, and Calendar resources](https://knowledge.workspace.google.com/admin/calendar/create-buildings-features-and-calendar-resources), building, resource and feature limits and capacity
- [Google Workspace Admin Help: Release unused Calendar meeting rooms](https://knowledge.workspace.google.com/admin/calendar/release-unused-calendar-meeting-rooms), release when all but one decline, the fences, exemptions, organizer email, editions
- [Envoy: Visitor management](https://envoy.com/visitor-management), the multilingual kiosk, NDAs before arrival, blocklists
- [Zoom: Zoom Rooms pricing](https://zoom.us/pricing/zoom-rooms), the Rooms plan price, displays and controllers, meeting capacity, third-party join, calendar integrations
- [Zoom: Workspace Reservation pricing](https://zoom.us/pricing/workspace-reservation), the per-space price, booking from Google Calendar and Outlook, QR-code check-in and release

**Law and regulation**

- [New York Civil Rights Law 52-c](https://www.nysenate.gov/legislation/laws/CVR/52-C*2), electronic monitoring notice, acknowledgment, posting, covered monitoring and penalties
- [NLRB: General Counsel issues memo on unlawful electronic surveillance and automated management practices (October 31, 2022)](https://www.nlrb.gov/news-outreach/news-story/nlrb-general-counsel-issues-memo-on-unlawful-electronic-surveillance-and), the proposed presumption and disclosure framework
- [NLRB: General Counsel memos](https://www.nlrb.gov/guidance/memos-research/general-counsel-memos?page=1), GC 23-02 and its rescission on February 14, 2025 by GC 25-05

**Filings**

- [Zoom Communications 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), Zoom Rooms as a software-based conference room system
