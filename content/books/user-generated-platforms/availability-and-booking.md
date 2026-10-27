+++
title = "Availability & Booking"
description = "Calendars, blocks and buffers, external calendar sync, request to book versus instant book, decline reasons, supply sanctions and trip modifications."
category = "User-Generated Platforms Industry"
order = 1826
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "reservations", "calendars", "instant-book", "double-booking"]
+++

A hotel knows its own inventory. A peer-to-peer marketplace doesn't: the RV in the host's driveway is also listed on two other sites, used by the host's family in August, and in the shop for a week the host forgot to block. The guest sees a calendar that says Saturday is free and expects the booking to hold. The marketplace's job is to make that calendar as true as it can, to let hosts decide how much control they keep over who books, and to make every booking a record that both sides, the payment system and the insurer can rely on, even when it changes after it's made.

Three tensions run through this chapter. **Control against conversion:** hosts want to approve each guest, guests want to book now, and every hour a request sits unanswered loses guests to another listing. **One calendar against many channels:** the marketplace is one of several places a host sells the same days, and the calendar is only as good as the slowest sync. **A fixed booking against a moving trip:** trips get extended, shortened, moved, delivered instead of picked up, and gain drivers, and each change touches price, insurance and the calendar. This chapter covers calendars and the rules that shape availability, external calendar sync, request to book and instant book, decline reasons and supply sanctions, the booking state machine, and modifications. It extends `listings` and `bookings` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). The host's and property manager's side of channel management (API connections, iCal as a degraded path, one calendar across channels) is in the Property Tech volume's [Short-Term Rentals](/books/property-tech/short-term-rentals#channels-listings-and-the-calendar); the general machinery of holds is [Reservations & Holds](/docs/architecture/reservations-and-holds).

## How the Platforms Do It

| Platform | Ways to book | Request window | Instant book | Calendar sync |
| --- | --- | --- | --- | --- |
| **Outdoorsy** | Booking request, instant book, custom quote | Requests expire if the host doesn't respond in 24 hours | Per listing: all trips, only stationary (delivered) trips, only pickup trips, or manual approval for all; lightning-bolt badge and a ranking factor | iCal import and export, refreshed every two hours, one listing per connection; export carries only Outdoorsy-made bookings |
| **RVshare** | Contact owner, request a quote, request to book | Not published | Not published | Not published |
| **Airbnb** | Request to book, Instant Book | Superhosts answer 90% of new messages and accept or decline requests within 24 hours | Host setting | iCal every three hours (Property Tech covers it) |
| **Turo** | Book; extensions and changes requested in-app | Not published | Host setting | Not a channel-manager market |
| **eBay, Etsy** | Purchase at checkout | Not applicable | Every purchase is instant | Stock, not calendars |

The guest's identity is part of booking. Airbnb gives a booking guest 12 hours to complete identity verification (1 hour if check-in is within 12 hours) or the reservation stays pending; Outdoorsy verifies every driver before coverage applies ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud) covers the verification; here it's a state the booking waits in).

The patterns:

- **Instant book is the platforms' preference, and they say so.** Outdoorsy makes it a ranking factor, badges it, and says hosts who use it earn more (its own marketing claim), and that about a third of qualified requests never get a host response. A request window is a conversion leak the platform measures.
- **Instant book has eligibility modes.** Hosts trust some trips more than others: Outdoorsy's split between stationary (delivered and set up, not driven) and pickup trips is a control over who drives the vehicle.
- **Sanctions are automatic.** Instant book is a privilege that cancellations take away; declines are allowed but measured.
- **The marketplace is one channel among several.** Hosts list the same RV on Outdoorsy, RVshare, Airbnb, Hipcamp and others (Outdoorsy's sync supports Airbnb, RVshare, RVezy, Hipcamp, Newbook, Vrbo, Turo and Hostaway), and the marketplace's calendar reflects those other channels only as fast as it polls them.

## The Calendar

The calendar is a view over everything that occupies the listing, never a grid of day cells that has to be kept in sync with bookings ([One Calendar, No Double Bookings](/books/property-tech/short-term-rentals#one-calendar-no-double-bookings)). What occupies a listing:

- **Bookings** that are held at checkout, confirmed or in progress.
- **Host blocks:** personal use, maintenance, "not renting that week."
- **Imported blocks** from external calendars.
- **Buffers:** preparation time between trips (cleaning, dumping tanks, a vehicle check), which belongs inside the occupied range, not in code the database can't see ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)).
- **Eligibility closures:** an inspection that will have lapsed by the departure date closes bookability for those days ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)).

Around occupancy sit the rules that decide which free days a guest can actually book:

| Rule | What it does |
| --- | --- |
| **Minimum and maximum length** | Nights for stays, days for vehicles; often higher in peak season or on weekends |
| **Advance notice** | How soon before start a booking may be made (same-day, one day, three days) |
| **Booking window** | How far ahead the calendar opens |
| **Check-in and return times** | Pickup and return windows; a vehicle's trip is a time range, not a set of nights |
| **Closed to arrival or departure** | Pickups only on certain days |
| **Preparation time** | The buffer added before and after each booking |

Rentals of vehicles are measured in time, not nights. A car booked from 10:00 Friday to 10:00 Sunday and another from 14:00 Sunday don't collide if the buffer is under four hours; a stay from Friday to Sunday and another from Sunday don't collide at all. The core model's `service_period` is a timestamp range in UTC for that reason, with the listing's time zone deciding what "Friday" means to the people involved.

My rule: **one table holds every claim on a listing's time, with one exclusion constraint.** Bookings, holds, host blocks, imported blocks and buffers are all occupancy; if any of them lives in a different table, the database can't stop two of them overlapping, and the application check that tries to will lose a race.

## External Calendars

Hosts who list on several marketplaces connect calendars by iCal: each side publishes a feed of blocked dates and polls the other's. The cadence differs by platform: Outdoorsy refreshes imported calendars every two hours, Airbnb every three, Vrbo's owner app every 30 minutes, and the gap between polls is the window in which two marketplaces can sell the same day. The Property Tech volume covers the mechanics and the host's side ([API Connections and iCal](/books/property-tech/short-term-rentals#api-connections-and-ical)); the marketplace operator's side adds four points:

- **Export only your own bookings.** Outdoorsy's export carries only bookings made on Outdoorsy. Re-exporting imported blocks creates loops in which a block bounces between platforms and never clears.
- **Show the host the staleness.** Each feed has a last successful fetch, a last change and an error state; a feed that hasn't loaded in a day is a double booking waiting to happen, and the host should see it.
- **Treat imports as blocks, not bookings.** An imported block has no guest, price or contract on this marketplace; it closes days and nothing more. When an import overlaps an existing booking here, the booking wins in the database, and the conflict goes to the host as a task, because the other marketplace's guest exists too.
- **Measure the window.** A booking made here for days that an import later blocks is the platform's evidence about which channel sold first; keep the fetch log, the Property Tech rule of logging every message in and out ([API Connections and iCal](/books/property-tech/short-term-rentals#api-connections-and-ical)).

API connections replace iCal where channel managers and property management systems connect directly, which professional hosts use; the marketplace exposes availability and booking APIs and treats partner pushes like any other writer to the occupancy table.

## Request to Book and Instant Book

The two ways to book differ in who decides and when money moves:

| | Request to book | Instant book |
| --- | --- | --- |
| Who decides | The host, within a window | The rules the host set, at checkout |
| Payment | Authorized at request, captured on acceptance (or charged and refunded on decline) | Charged at confirmation (or on the split schedule in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees)) |
| Calendar | Held while the request is open, or not held (a policy choice) | Occupied at confirmation |
| Risk checks | Before the request reaches the host, and again before acceptance | Before confirmation |
| Expiry | The request expires if the host doesn't answer (24 hours at Outdoorsy) | None |

Whether an open request holds the calendar is the important choice. Holding it protects the guest from losing the dates while the host decides, but lets a slow host block a weekend for a day; not holding it lets another guest book instantly in the meantime and turns the first guest's acceptance into a failure. The common middle: hold for the request window, expire on read when the window passes ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)), and let instant book override an open request only if the host has chosen that.

**Instant book eligibility** is a set of conditions on the guest and the trip that the host chooses from a menu the platform defines: the trip type (stationary or pickup), the guest's verification and review history, the driver's age, length of trip, advance notice. Outdoorsy's modes are one example; the general shape is a rule set per listing, evaluated at checkout and recorded with the booking, so "why was this booked without my approval" has an answer.

**Custom quotes and offers** sit between the two: the host sends a priced offer for specific dates that the guest can accept instantly. They're a booking in `requested` state created by the host, with its own expiry, and the price is frozen in the offer.

**Demand rerouting** handles the request that fails: [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) covers offering an expired or declined request to similar listings.

### Declines and Their Reasons

Hosts may decline, and platforms try to make each decline useful. Outdoorsy lets hosts decline without penalty but standardizes the reasons, and some trigger prompts: choosing "dates unavailable" forces a calendar update, because a decline for unavailability means the calendar was wrong. Repeated declines can hurt visibility and trigger instant book checks.

The design: decline reasons are a fixed list, each with a consequence (none, a calendar task, a counted metric, a review of the host's instant book settings), and the guest sees a reason category but not the host's private note. Reasons that touch protected characteristics are not on the list, and a free-text reason is moderated like any message ([Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews)), because a decline is a decision about a person.

### Supply Sanctions

Host cancellations and unresponsiveness hurt guests, so platforms sanction them automatically. Outdoorsy pauses instant book for 45 days after a second availability-related host cancellation in a rolling six months, and the host must re-enable it manually. [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes) covers host cancellation penalties as a whole (fees, blocked calendars, status loss); the availability-side sanction belongs here because it changes how the listing can be booked.

Model it as a penalty, not a setting change: a `penalties` row on the host role with `restricted_feature = 'instant_book'`, a validity range and the automated decision that triggered it, counting cancellations from the record ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)). The host's setting stays what they chose; the gate reads both. When the penalty ends, nothing has to be restored, and standing shows the host why instant book was off ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)).

## The Booking State Machine

The core model's `bookings.status` is this volume's vocabulary; the platforms use their own names for the same states:

| Status | Meaning | Leaves by |
| --- | --- | --- |
| `requested` | A guest asked; the host hasn't answered (or a host offer the guest hasn't accepted) | Acceptance, decline, expiry, withdrawal |
| `pending_payment` | Dates held at checkout while payment and verification complete | Confirmation, expiry, failure |
| `confirmed` | The contract exists; dates are occupied | Trip start, cancellation |
| `in_progress` | Handoff done; the guest has the asset | Return and handoff, or an incident |
| `completed` | Returned; claim and review windows run from here | Terminal for the calendar; claims, reviews and disputes attach to it |
| `cancelled` | Ended by guest, host or platform after confirmation | Terminal; refunds under the frozen policy |
| `declined` | The host said no | Terminal |
| `expired` | A request or hold ran out | Terminal |

![Booking state machine. A guest request or host offer enters requested; an instant book checkout enters pending_payment. From requested, acceptance leads to confirmed, a host decline ends in declined, and no answer ends in expired; from pending_payment, paid and verified leads to confirmed, and a hold that runs out ends in expired. The accented trip's path runs from confirmed through the pickup handoff to in_progress and through the return handoff to completed, where claim and review windows start. A cancellation by guest, host or platform ends a confirmed booking in cancelled, refunded under the frozen policy. Dashed arrows end a booking; doubled outlines are terminal states.](/diagrams/ugp-availability-and-booking-states.svg "Two ways in, one trip path. The handoffs, not the booked times, move a booking into and out of in_progress.")

Waiting for the guest's identity verification is part of `pending_payment` (or a sub-state in its own column): Airbnb's 12-hour window to verify is a hold expiry in all but name. `in_progress` begins at the pickup handoff, not at the booked start time, because a guest who never shows up and a trip that started late are different facts ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims)). Every transition is an event (`booking.requested`, `booking.confirmed`, `booking.declined`, `booking.expired`, `booking.started`, `booking.completed`, `booking.cancelled`) through the outbox, and payment, protection, payouts, messages and reviews subscribe to them.

Goods purchases use the same table with `kind = 'purchase'`: no period, a quantity against the listing's stock, and a short path from `pending_payment` to `confirmed` and, on delivery, `completed`. Decrementing stock and confirming the purchase happen in one transaction with a check on stock ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)).

## Modifications

Trips change. The common modifications, and what each touches:

| Change | Calendar | Price | Protection and deposit | Who must agree |
| --- | --- | --- | --- | --- |
| **Extension** | New days must be free | Added days at the current or the original rate | Plan extended; deposit hold may need re-authorization | Host (or instant, if allowed) |
| **Shortening or date change** | Released days reopen | Refund under the cancellation policy for the removed part | Recomputed | Host |
| **Delivery instead of pickup** | Delivery and setup times added to the buffer | Delivery fee | Stationary or driven trip changes the protection package (Outdoorsy voids protection if a stationary rental is moved) | Host |
| **Added driver or guest** | None | Fees per driver or guest | Each driver verified; age surcharges | Host and platform |
| **Early or late return** | Following availability adjusts | Late fees, or no refund for early return | Coverage ends at return | Policy |

My rules for modifications:

- **A change is a request with its own record,** proposing new values, priced against the frozen quote, accepted or declined by the right party, and applied in one transaction that updates the occupancy, the price lines and the protection. The booking keeps its identity; the change history explains how it got here.
- **Extensions go through the exclusion constraint like a new booking.** If the next guest has the following day, the extension fails in the database, not in a phone call at pickup.
- **Policies are frozen at booking, and the change says which apply.** A guest who shortens a trip gets the cancellation policy that was frozen at booking applied to the removed days; a price for added days follows a stated rule; my default is to keep a changed trip's free-cancellation window tied to the original booking time, so a modification can't be used to reopen it. [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees) and [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes) own the money.
- **Every driver is a participant.** Additional drivers each need their own verification before they drive (Outdoorsy requires a unique email per driver); the booking's participants list is what coverage checks.

## How to Build It

```sql
CREATE TABLE availability_settings (     -- per listing; history in the audit trail
  listing_id          UUID PRIMARY KEY REFERENCES listings (content_item_id),
  unit                TEXT NOT NULL CHECK (unit IN ('night', 'day', 'hour')),
  min_length          SMALLINT NOT NULL DEFAULT 1,
  max_length          SMALLINT,
  advance_notice      INTERVAL NOT NULL DEFAULT '0 hours',
  booking_window      INTERVAL NOT NULL DEFAULT '365 days',
  prep_before         INTERVAL NOT NULL DEFAULT '0 hours',  -- buffer, inside occupancy
  prep_after          INTERVAL NOT NULL DEFAULT '0 hours',
  pickup_times        JSONB,               -- allowed pickup and return windows, local time
  instant_book        TEXT NOT NULL DEFAULT 'off' CHECK (instant_book IN ('off', 'all',
                        'stationary_only', 'pickup_only')),
  instant_book_rules  JSONB NOT NULL DEFAULT '{}',  -- guest conditions the host chose
  request_holds_dates BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE external_calendars (        -- iCal feeds in and out
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id       UUID NOT NULL REFERENCES listings (content_item_id),
  direction        TEXT NOT NULL CHECK (direction IN ('import', 'export')),
  source_name      TEXT,                 -- the other marketplace, as the host named it
  url              TEXT,                 -- import: theirs; export: ours, with a secret token
  status           TEXT NOT NULL CHECK (status IN ('active', 'failing', 'disabled')),
  last_fetched_at  TIMESTAMPTZ,
  last_changed_at  TIMESTAMPTZ,
  last_error       TEXT,
  UNIQUE (listing_id, direction, url)
);

CREATE TABLE occupancy (                 -- every claim on a listing's time, one constraint
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id       UUID NOT NULL REFERENCES listings (content_item_id),
  kind             TEXT NOT NULL CHECK (kind IN ('booking', 'hold', 'host_block',
                     'imported_block', 'eligibility_closure')),
  booking_id       UUID REFERENCES bookings (id),
  external_calendar_id UUID REFERENCES external_calendars (id),
  external_uid     TEXT,                 -- the iCal event UID
  period           TSTZRANGE NOT NULL,   -- what the guest or host sees
  blocked          TSTZRANGE NOT NULL,   -- period widened by prep buffers
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  hold_expires_at  TIMESTAMPTZ,
  reason           TEXT,                 -- host block note, closure reason
  CHECK ((kind IN ('booking', 'hold')) = (booking_id IS NOT NULL)),
  CHECK ((kind = 'imported_block') = (external_calendar_id IS NOT NULL)),
  CHECK ((kind = 'hold') = (hold_expires_at IS NOT NULL)),
  CHECK (blocked @> period),
  UNIQUE (external_calendar_id, external_uid),
  EXCLUDE USING GIST (listing_id WITH =, blocked WITH &&) WHERE (active)
);

ALTER TABLE bookings
  ADD COLUMN request_expires_at   TIMESTAMPTZ,  -- requests and host offers
  ADD COLUMN hold_expires_at      TIMESTAMPTZ,  -- checkout and verification hold
  ADD COLUMN instant_booked       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN instant_book_rules   JSONB,        -- the rules that let it through, as evaluated
  ADD COLUMN initiated_by         TEXT NOT NULL DEFAULT 'guest' CHECK (initiated_by IN
                                    ('guest', 'host_offer', 'partner_api')),
  ADD COLUMN decline_reason       TEXT CHECK (decline_reason IN ('dates_unavailable',
                                    'trip_type_not_offered', 'guest_requirements_not_met',
                                    'asset_unavailable', 'other')),
  ADD COLUMN started_at           TIMESTAMPTZ,  -- the pickup handoff
  ADD COLUMN ended_at             TIMESTAMPTZ,  -- the return handoff
  ADD COLUMN version              INT NOT NULL DEFAULT 1,
  ADD CONSTRAINT bookings_request_expiry
    CHECK (status <> 'requested' OR request_expires_at IS NOT NULL),
  ADD CONSTRAINT bookings_declined_reason
    CHECK ((status = 'declined') = (decline_reason IS NOT NULL));

CREATE TABLE booking_participants (      -- the guests and drivers on a booking
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES bookings (id),
  account_id      UUID REFERENCES accounts (id),   -- null for guests without an account
  role            TEXT NOT NULL CHECK (role IN ('primary', 'driver', 'guest')),
  verification_id UUID REFERENCES verifications (id),  -- kind 'driver_license' for drivers
  added_by_change_id UUID,               -- booking_changes, when added later
  UNIQUE (booking_id, account_id),
  CHECK (role <> 'driver' OR account_id IS NOT NULL)
);

CREATE TABLE booking_changes (           -- modification requests, applied atomically
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES bookings (id),
  kind            TEXT NOT NULL CHECK (kind IN ('extend', 'shorten', 'move',
                    'switch_to_delivery', 'switch_to_pickup', 'add_driver', 'add_guest',
                    'early_return', 'late_return')),
  proposed_by     TEXT NOT NULL CHECK (proposed_by IN ('guest', 'host', 'platform')),
  proposed        JSONB NOT NULL,        -- new period, participants, delivery details
  price_delta     BIGINT,                -- minor units; lines in Pricing, Fees & All-In Prices
  currency        CHAR(3),
  status          TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'declined',
                    'expired', 'withdrawn', 'applied', 'failed')),
  expires_at      TIMESTAMPTZ,
  decided_by      UUID REFERENCES accounts (id),
  applied_version INT,                   -- bookings.version after applying
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design decisions behind it:

- **Occupancy is one table with one constraint.** Holds, bookings, host blocks, imports and eligibility closures all compete for the same `blocked` ranges, so the database refuses any overlap among active rows; an extension, a block or an import that collides fails with SQLSTATE `23P01`, not a phone call. The core `bookings` constraint stays as a second guard on confirmed trips. The booking service writes the booking and its occupancy row in one transaction, and cancelling, expiring or completing a booking sets `active = false` on its row.
- **Buffers live inside the range.** `blocked` is the period widened by the listing's preparation times at the moment of booking, so changing prep time later doesn't retroactively create conflicts, and the constraint sees the buffer ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)).
- **Imports are idempotent by UID.** Each iCal event is upserted by its feed and UID, removed events deactivate their rows, and an import that collides with a booking here is logged and sent to the host as a conflict task rather than dropped silently.
- **Holds expire on read.** Creating a hold or a booking first deactivates expired holds in its way in the same transaction, the pattern in [Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read); a sweeper job tidies the rest.
- **The booking records how it was made.** `instant_booked` and the rules as evaluated, `initiated_by` for host offers and partner APIs, the decline reason, and the real start and end from the handoffs.
- **Changes are records applied with optimistic concurrency.** A `booking_changes` row is applied only if `bookings.version` still matches what it was priced against; the application updates occupancy, price lines, protection and participants in one transaction and bumps the version.
- **Sanctions are penalties.** The instant book pause is a `penalties` row (role `host`, `restricted_feature = 'instant_book'`), computed from cancellations, so the gate reads settings and standing together.
- **Events:** `booking.requested`, `booking.offer_sent`, `booking.confirmed`, `booking.declined`, `booking.expired`, `booking.started`, `booking.completed`, `booking.cancelled`, `booking.changed`, `calendar.blocked` and `calendar.import_failed`, through the outbox, feed search's availability index, the export feed, payments and messages.

## Auditing

- **Every booking's path:** each state change with its actor (guest, host, rule, platform, partner) and time, the instant book rules that let it through, and the decline reason, so a guest who says the host accepted and a host who says the system did can both be checked.
- **Calendar evidence:** every import fetch with its result and every export served, so a double booking across marketplaces can be traced to which side sold first and how stale the feed was.
- **Modifications:** proposals, who agreed, the price delta and the booking version before and after.
- **Sanctions:** the cancellations that triggered each instant book pause and when it lifted.
- **Response metrics:** request and response times per host, which feed status programs and ranking and which hosts contest.

## What This Means for the System You Build

- **Put every claim on a listing's time in one occupancy table** with one exclusion constraint, buffers inside the range.
- **Use timestamp ranges in UTC** with the listing's time zone, because vehicle trips are hours, not nights.
- **Import iCal as blocks keyed by event UID,** export only your own bookings, and show hosts each feed's staleness.
- **Decide whether requests hold dates,** expire requests and holds on read, and record the window.
- **Make instant book a rule set per listing,** evaluated at checkout and frozen on the booking.
- **Use a fixed list of decline reasons,** each with a consequence, and moderate free text.
- **Model instant book pauses and other supply sanctions as penalties** the host can see.
- **Map platform states to one booking vocabulary,** with events for every transition.
- **Treat modifications as change requests** priced against the frozen quote and applied atomically with a version check.
- **Verify every driver as a booking participant** before the trip starts.

## References

**Platform documentation**

- [Outdoorsy: What is calendar sync and how does it work](https://support.outdoorsy.com/hc/en-us/articles/37985661024027-What-is-calendar-sync-How-does-it-work), two-hour refresh, supported platforms, export of Outdoorsy bookings only, one listing per connection
- [Outdoorsy: Data dictionary](https://support.outdoorsy.com/hc/en-us/articles/37153357358747-Data-dictionary), booking requests expiring after 24 hours without a host response
- [Outdoorsy: What is Instant Book](https://support.outdoorsy.com/hc/en-us/articles/37916787033115-What-is-Outdoorsy-s-Instant-Book-What-benefits-do-I-receive), instant book modes, badge and ranking, the 45-day pause after a second availability-related cancellation in six months
- [Outdoorsy: Am I allowed to decline potential guests](https://support.outdoorsy.com/hc/en-us/articles/37918012902939-Am-I-allowed-to-decline-potential-Guests), standardized decline reasons, calendar prompts, visibility effects
- [Outdoorsy: Superhost program FAQs](https://support.outdoorsy.com/hc/en-us/articles/37419024607899-Outdoorsy-s-Superhost-Program-FAQs), the share of requests without a host response and instant book earnings (Outdoorsy's own claims)
- [Outdoorsy: How to send a customized quote](https://support.outdoorsy.com/hc/en-us/articles/37466414131995-How-to-send-a-customized-quote), host quotes
- [Outdoorsy: Roadside Assistance Program](https://support.outdoorsy.com/hc/en-us/articles/37452913403547-What-is-the-Outdoorsy-Roadside-Assistance-Program), moving a stationary rental voids protection
- [Outdoorsy: How to become a Verified Driver for RV bookings](https://support.outdoorsy.com/hc/en-us/articles/37605703140891-How-to-become-a-Verified-Driver-for-RV-bookings), verification of every driver, unique email per additional driver
- [RVshare: Renter FAQ](https://rvshare.com/blog/?p=168613), contact owner, request a quote and request to book
- [Airbnb: Verifying your identity](https://www.airbnb.com/help/article/1237), the 12-hour (or 1-hour) verification window before a reservation leaves pending
- [Airbnb: How to become a Superhost](https://www.airbnb.com/help/article/829), the 90% response and 24-hour accept-or-decline requirement
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), in-app check-in, extensions and changes, delivery
