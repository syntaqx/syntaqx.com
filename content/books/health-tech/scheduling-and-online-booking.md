+++
title = "Scheduling & Online Booking"
description = "How a practice schedule works: providers, operatories, appointment types and patterns, blocks, slot search, online booking, insurance at booking, ASAP lists."
category = "Health Tech Industry"
order = 1930
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "scheduling", "online-booking", "appointments", "dental", "veterinary", "data-model"]
+++

A practice's schedule is its revenue plan drawn as a grid. In a dental office the columns are operatories (the treatment rooms, each with one chair) and the rows are ten-minute or five-minute units; every appointment occupies a column for a pattern of units, some of which need the dentist and some only the hygienist or an assistant; and the office manager has drawn blocks across the week reserving mornings for crowns and late afternoons for children. A veterinary clinic's grid adds exam rooms, surgery slots and drop-offs; an optometry office's adds pre-test equipment and the optical; a physical therapy clinic's lets one therapist see two patients in overlapping sessions. Every one of these lives in the practice management system (PMS), and every online booking widget, waitlist and booking marketplace has to respect it without being able to see all of it.

This chapter covers the practice schedule and booking into it: providers, operatories, appointment types and patterns, blocks and ideal days, finding open time, online booking for new and existing patients, insurance at booking, directories and marketplaces, waitlists and ASAP lists, and deliberate double booking. It extends `schedules`, `appointment_slots` and `appointments` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The general mechanics of holds and double-booking prevention are the playbook's [Reservations & Holds](/docs/architecture/reservations-and-holds); the field-service version of booking, with arrival windows and routes, is the Field Operations volume's [Booking Appointments](/books/field-operations/booking-appointments), and [How the Field Model Maps](#how-the-field-model-maps) below says what carries over. Reading and writing the PMS is [Integrating with Practice Management Systems](/books/health-tech/pms-integration).

## How the Platforms Do It

Booking runs in two places: the PMS's own scheduler (and, increasingly, its own online booking), and engagement vendors that read the PMS schedule and write bookings back. As of October 2026, from public documentation:

| Platform | Booking model | What decides open time | Notable mechanics |
| --- | --- | --- | --- |
| **Open Dental Web Sched** | Real-time, inside the PMS: New Patient, Existing Patient, Recall and ASAP modes, each a separate subscription | Provider schedules, operatories flagged for Web Sched, appointment types with their own lengths and patterns, blockouts | "Prevent double booking" option; duplicate-patient check; carrier rules for insurance; $75 per mode per location per month (ASAP $20, free with Recall) |
| **NexHealth** | Real-time from synced PMS data, writing the booking back | Working hours minus unavailabilities, filtered by appointment type; an operatory per slot | New or existing patient question, insurance at booking, a Google Business Profile button; Dentrix "Perfect Day" setups recreated by hand |
| **Weave Scheduling** | Request-based: patients "request appointments," the office approves "at your team's convenience" | Office approval | Works "with or without an integrated PMS"; a waitlist notified on cancellation |
| **Vetstoria** (veterinary) | Real-time against "over 30" PMSs | The clinic's live PMS calendar | "Matches clients and pets automatically"; writes the booking to the PMS |
| **ezyVet** (veterinary PMS) | Its own API for third-party booking | `/v4/calendar/availability` | `POST /v4/calendar/booking` for partners |
| **Luma Health** (medical) | Scheduling "from web, SMS/RCS, Google, or AI conversation" | EHR schedule rules (athenahealth, eClinicalWorks, Epic, Oracle Health, MEDITECH integrations) | "Waitlist that works with your schedule rules," eligibility checks "in bulk & before scheduling" |
| **Yapi** (dental) | Booking from a text or email link | Synced PMS schedule (Dentrix, Eaglesoft, Open Dental) | Bundled with forms, reminders and insurance verification |
| **Zocdoc** (marketplace) | Patients search and book across practices | Availability the practice exposes to Zocdoc | Fee per booking since 2018 to 2019, replacing a flat subscription |
| **Phreesia** (medical) | Self-scheduling and its MediFind directory inside an intake platform | EHR and PM integrations | One part of a platform that facilitated about 180 million patient visits in fiscal 2026 |

Three patterns stand out. Real-time booking is only as good as the schedule model the booking engine can see: NexHealth says outright that Dentrix's Perfect Day isn't read directly and has to be recreated. Request-based booking (Weave) sidesteps the model entirely by putting a person in the loop, at the cost of a patient who doesn't know whether they have an appointment. And the PMS vendors are moving booking inside: Open Dental sells four Web Sched modes, and booking inside the PMS needs no sync at all.

## The Practice Schedule

Open Dental's model is the clearest public one, and the other dental systems share its shape.

- **Provider schedules.** Each provider and employee has working hours per day, plus holidays, lunch and staff meetings; open and closed hours show as background colors in the Appointments Module, and "Warn on Provider Overlap" flags provider schedules that overlap in assigned operatories. A provider's schedule says when they work, not where.
- **Operatories.** The rooms, each a column. An operatory has a default provider and hygienist, can be marked hygiene, and can be flagged "Is Web Sched" for online booking. In veterinary clinics the equivalent is exam rooms, surgery and treatment areas; in optometry, exam lanes and pre-test equipment; in physical therapy, the gym and private treatment rooms.
- **Appointments.** An appointment is a patient in an operatory at a time (`PatNum`, `Op`, `AptDateTime`) with a **pattern**: a string of time units, five minutes each in Open Dental's API, where `X` marks time the provider is needed and `/` time the patient is in the chair without them. A crown prep might be `//XXXXXXXX//`: assistant setup, the dentist, then assistant cleanup. The pattern is how one dentist runs two or three chairs at once. Appointments also carry a provider and a hygienist (`ProvNum`, `ProvHyg`), an `IsHygiene` flag, an `AppointmentTypeNum`, an `IsNewPatient` flag and a priority (Normal or ASAP).
- **Appointment statuses.** Open Dental's list shows what a practice tracks beyond "booked": `Scheduled`, `Complete`, `UnschedList` (broken or cancelled and waiting to be rebooked), `ASAP`, `Broken`, `Planned` (treatment the patient needs but hasn't booked, covered in [Reminders, Confirmations & Recall](/books/health-tech/reminders-and-recall#reactivation-and-unscheduled-treatment)), and patient notes. Breaking an appointment records whether it was missed or cancelled (Open Dental uses procedure codes D9986 and D9987 for the two) and can send it to the Unscheduled List.
- **Appointment types.** A named type sets length, pattern and procedures: "New Patient Exam," "Prophy," "Crown Prep," "Puppy Vaccines," "Contact Lens Fitting." Online booking offers types, never free-form lengths.

### Blocks and Ideal Days

Practices don't schedule first-come, first-served. They plan the day around production: high-value procedures in the morning when the doctor is fresh, a block for emergencies at 11, hygiene columns kept full, new patients in specific slots so the doctor's exam time is protected. Dental systems model this as **blockouts** (reserved time on an operatory, by type) and templates for an ideal day (Dentrix's Perfect Day). Open Dental's Web Sched excludes blockouts "unless specific blockout types" are allowed for a given appointment type, which is the right rule: a block reserved for new patients should be bookable online by new patients and invisible to everyone else.

The implication for any booking engine is that open time is not free time. A slot is open for a particular appointment type, provider and patient kind, and most of the schedule's value is in which slots are hidden from whom.

## Finding Open Slots

Slot search runs the schedule forward for a requested appointment type. The public versions agree on the inputs:

- **Open Dental's `GET /appointments/Slots`** takes a date range, a length in minutes, a provider and an operatory, and returns start and end times with the provider and operatory; it defaults to the next 14 days and the practice's default provider. `GET /appointments/SlotsWebSched` takes the Web Sched appointment type and whether the patient is new.
- **NexHealth's slots** are "working hours minus calendar unavailabilities, filtered by appointment type": the type's `minutes` sets the length, and only working-hour records mapped to that type count, so an unmapped type returns no slots. Without an `operatory_id` it returns slots for only the first available operatory, which is a trap for any app that wants to show every room.
- **Open Dental's Web Sched New Patient** considers only "operatories associated with New Pat Appt Types," picks the leftmost open operatory, needs provider schedules to exist, and has a "Prevent double booking" checkbox.

My order of filters for a slot search:

1. **The appointment type** decides length, pattern, which providers and operatories qualify, and whether the patient kind (new, existing, recall) may book it.
2. **Provider schedules** for the qualifying providers, minus their existing appointments' provider time (the `X` units), so a dentist booked in chair 1 can still take a hygiene exam in chair 2 if the patterns interleave.
3. **Operatory availability** for the whole pattern, since the patient occupies the chair for every unit.
4. **Blockouts and rules**: blocks reserved for other types, lead time ("no same-day online bookings"), daily caps on new patients, and the practice's horizon.
5. **Freshness**: if the PMS copy is stale, offer nothing or fall back to a request ([Drift, Conflicts and Health Checks](/books/health-tech/pms-integration#drift-conflicts-and-health-checks)).

Step 2 is what makes dental search different from a hotel room or a field technician: one provider's time is shared across columns at a granularity of minutes, and the pattern, not the appointment, is the unit of conflict.

## Online Booking

Online booking narrows what a patient may choose to what the practice can predict.

### New Patients Versus Existing

New patients are the reason most practices buy online booking, and the hardest to book. They need the longest appointment, intake forms, often insurance, and a duplicate check, because a "new" patient is frequently an existing one who forgot. Open Dental's Web Sched New Patient checks for duplicates on last name, first or preferred name and birthdate, then email or phone. NexHealth asks whether the person is new or existing and, for existing patients, the date of their last appointment. Existing patients book from a recognized identity: a link in a recall text, a portal, or a match on name, birthdate and phone. For existing patients the safest booking path is a link from a message the practice sent, because the practice already knows who it sent it to; matching a stranger on a public widget is [patient matching](/docs/architecture/record-linkage#match-before-create) with the same risks as anywhere else.

### Insurance at Booking

Insurance decides whether many patients book at all, and practices decide which plans they take. Open Dental's Web Sched Carrier Rules decide whether patients enter insurance and which carriers are accepted; NexHealth collects insurance during booking. Collecting it at booking lets the office verify eligibility before the visit (the subject of this volume's [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) chapter) and lets the booking flow tell a patient with a plan the office doesn't accept before they drive in. Capture the card itself at intake ([Insurance Cards and ID](/books/health-tech/digital-intake-and-forms#insurance-cards-and-id)); at booking, the carrier and member ID are enough.

### Request-Based Versus Real-Time

Booking engines sit on a spectrum:

| Model | How it works | Gains | Costs |
| --- | --- | --- | --- |
| **Request** | Patient picks preferred times; the office confirms | No schedule model needed; the office keeps control | The patient has no appointment yet; requests made at night wait until morning |
| **Real-time into a request queue** | Patient picks a real open slot; it's held until the office approves | The slot is real; the office can still refuse | Two steps; held slots go stale if nobody approves |
| **Real-time, booked** | Patient picks a real slot; it's written to the PMS | Instant confirmation; works at 11 p.m. | Needs a correct schedule model and a working write-back; double bookings when the copy is stale |

My default: real-time, booked, for existing patients booking recall and routine types from a link the practice sent; real-time into a request queue for new patients and anything with a long or high-value pattern; plain requests only when the PMS can't be written. The patient's confirmation must say which happened. "You're booked" for something that is really a request is the most common complaint in the category.

### Holds and Write-Back

A patient choosing a slot takes a minute or two, and the slot has to be held while they do, so two patients don't take the last Tuesday cleaning ([Hold Lifetimes Are Policy](/docs/architecture/reservations-and-holds#hold-lifetimes-are-policy)). The hold lives in your system, not the PMS, because the PMS doesn't know about it. When the patient confirms, re-check the slot against the freshest copy, write the booking back as a job ([Writing Back](/books/health-tech/pms-integration#writing-back)), and if the PMS refuses (the front desk booked the chair in the meantime), tell the patient and the office at once. Open Dental marks Web Sched bookings with a confirmation status of "Created from Web Sched," which is how staff can see which appointments arrived online; any write-back should leave a marker like it.

## Directories and Marketplaces

Some bookings start outside the practice's own site.

- **Google.** Booking buttons on a Google Business Profile route to the practice's booking vendor; NexHealth and Luma both name Google as a booking channel. The practice's own listing is covered in [Listings and Health Directories](/books/health-tech/reviews-and-reputation#listings-and-health-directories).
- **Zocdoc** is a two-sided marketplace: patients search providers by specialty, insurance and location and book; practices pay. Zocdoc moved from a flat subscription to a fee per booking, which MedCity News dates to 2018 and which drew "an outcry among practices." The per-booking amounts aren't on any public page I could open. <!-- source-gap: zocdoc-booking-fees | missing | Zocdoc's per-booking fee amounts and whether fees apply only to new patients, as of 2026 | closes with: Zocdoc's provider pricing page or terms (zocdoc.com returned 403 to fetching) | checked: 2026-10-29 -->
- **Payer and health system directories** route members to in-network providers, sometimes with booking links.

A marketplace booking is a request from an outside party until your system confirms it against real availability, it arrives by webhook that may repeat, and it carries attribution the practice is paying for. That's the same rule the Field Operations volume gives for lead sources ([AI Voice Agents and Lead Sources](/books/field-operations/booking-appointments#ai-voice-agents-and-lead-sources)): record the source and its booking ID as a natural key, and keep the evidence for fee disputes.

## Waitlists and ASAP Lists

A cancelled hygiene appointment tomorrow morning is lost revenue unless someone fills it. Practices keep two lists:

- **The ASAP list**: patients already scheduled who'd take an earlier time. Open Dental's ASAP List holds "patients who would like to be contacted when an earlier appointment becomes available," built by marking scheduled, planned or unscheduled appointments or recalls as ASAP; staff right-click an open slot and "Text ASAP List," and Web Sched ASAP lets them claim it online.
- **The waitlist**: people without an appointment who want one (new patients, patients with planned treatment). Weave's waitlist notifies patients on a cancellation; Luma's works "with your schedule rules."

The engineering is a race. Several patients get the same text about one slot; the first to claim it wins and the rest must hear that it's gone, not book on top of it. Treat the offer as a hold contest: each notified patient gets a link to claim, the claim takes the slot with the same constraint as any booking, and the losers get a polite "already taken" and stay on the list. Send in small waves rather than to everyone at once, and stop sending when the slot is too close to fill: a text at 7:55 for an 8:00 cleaning is noise. Moving a scheduled patient earlier must free their old slot in the same transaction, which can start another round.

## Deliberate Double Booking

Health care double-books on purpose, and a booking engine that treats every overlap as an error can't model a practice.

- **Dentists across columns.** One dentist runs two or three operatories, with patterns interleaving their `X` time; and a hygienist's appointment carries a doctor's exam, so the hygiene patient needs a few minutes of the dentist in the middle.
- **Medical overbooking.** Clinics book more patients than slots to absorb no-shows; the overbooking rate is a policy, set from the no-show rate ([Overbooking Is a Policy, Not a Bug](/docs/architecture/reservations-and-holds#overbooking-is-a-policy-not-a-bug)).
- **Overlapping therapy sessions.** Physical therapy clinics see more than one patient at a time, under billing rules covered in this part's [Optometry, PT & Other Specialties](/books/health-tech/specialty-practices#physical-therapy) chapter.
- **Veterinary drop-offs.** A pet dropped off at 8 for a procedure during the day occupies a kennel and a surgery slot, not a fixed exam time.

So conflicts are defined per resource and per unit: the operatory can't hold two patients at once, a provider can't be needed in two places in the same five minutes, and everything else is policy. The front desk can override, and the override is recorded.

## How the Field Model Maps

The Field Operations volume's booking model carries over with these changes:

| Field operations | Practice | Difference |
| --- | --- | --- |
| Visit with an arrival window | Appointment with a start time | Patients come to the practice; the promise is a time, not a window |
| Technician (a `resource`) | Provider plus operatory | Two resources per appointment, with provider time shared across rooms by pattern |
| Territory and route capacity | Provider schedules, operatories and blockouts | Capacity is the grid, not drive time |
| Route-aware offers ranked by insertion cost | Offers ranked by production goals and blocks | The "cost" of a slot is lost production or a broken ideal day, not drive time |
| Lead sources | Directories and marketplaces | Same request-until-confirmed rule, same natural keys |
| Recurring service schedules | Recall | Recall is a due date that a patient must be persuaded to book, not a standing appointment |

The field rule that slot offers are a business decision ([Offer Times Where the Routes Already Are](/books/field-operations/booking-appointments#offer-times-where-the-routes-already-are)) holds here too: which open hygiene slots a new patient is shown is the practice's ideal-day plan, not a calendar's.

## How to Build It

The core model already has the shape: a `schedules` row is a bookable resource's calendar (a practitioner, an operatory, a room or equipment), an `appointment_slots` row is time on one schedule with an exclusion constraint against overlap, and an `appointments` row books a patient with a practitioner role and a schedule ([The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model)). The chapter adds operatory attributes, appointment types with patterns, schedule templates for working hours and blockouts, booking requests and waitlist entries, and makes the provider's `X` units and the chair's whole pattern into busy slots so the core constraint does the conflict checking:

```sql
ALTER TABLE schedules                              -- operatories are schedules with resource_kind 'operatory'
  ADD COLUMN operatory_kind TEXT CHECK (operatory_kind IN ('dental_operatory', 'exam_room', 'surgery',
                              'exam_lane', 'pretest', 'treatment_area', 'kennel', 'telehealth')),
  ADD COLUMN is_hygiene     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN default_practitioner_role_id UUID REFERENCES practitioner_roles (id),
  ADD COLUMN online_bookable BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN sort_order     INT;                    -- column order; some PMSs pick the leftmost open

CREATE TABLE appointment_types (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID REFERENCES locations (id),
  code               TEXT NOT NULL,                 -- matches appointments.appointment_type
  name               TEXT NOT NULL,                 -- 'New Patient Exam', 'Prophy', 'Puppy Vaccines'
  pattern            TEXT NOT NULL,                 -- per unit: 'X' provider needed, '/' chair only
  unit_minutes       SMALLINT NOT NULL DEFAULT 5,
  procedure_codes    TEXT[] NOT NULL DEFAULT '{}',  -- CDT, CPT or practice codes it schedules
  operatory_kinds    TEXT[] NOT NULL,
  practitioner_role_ids UUID[] NOT NULL DEFAULT '{}',  -- empty = any qualified
  bookable_by        TEXT[] NOT NULL DEFAULT '{}',  -- 'new_patient', 'existing', 'recall', 'marketplace'
  UNIQUE (organization_id, code),
  CHECK (pattern ~ '^[X/]+$')
);

CREATE TABLE schedule_templates (                  -- working hours, blockouts and ideal days, as rules
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  schedule_id        UUID NOT NULL REFERENCES schedules (id),
  kind               TEXT NOT NULL CHECK (kind IN ('working', 'blockout', 'closed')),
  weekday            SMALLINT CHECK (weekday BETWEEN 1 AND 7),  -- null with a date for one-offs
  on_date            DATE,
  starts_local       TIME NOT NULL,                 -- in the location's time zone
  ends_local         TIME NOT NULL,
  reserved_for_type_ids UUID[] NOT NULL DEFAULT '{}',  -- blockout: which appointment types may use it
  valid_during       DATERANGE NOT NULL,
  CHECK ((weekday IS NULL) <> (on_date IS NULL))
);

ALTER TABLE appointment_slots
  ADD COLUMN appointment_id UUID REFERENCES appointments (id),  -- set on busy slots an appointment holds
  ADD COLUMN reserved_for_type_ids UUID[] NOT NULL DEFAULT '{}'; -- blocked slots from a blockout

ALTER TABLE appointments
  ADD COLUMN appointment_type_id UUID REFERENCES appointment_types (id),
  ADD COLUMN hygienist_role_id UUID REFERENCES practitioner_roles (id),
  ADD COLUMN pattern TEXT,                          -- copied from the type, editable per appointment
  ADD COLUMN is_new_patient BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'asap')),
  ADD COLUMN hold_expires_at TIMESTAMPTZ,           -- set while status = 'proposed' during booking
  ADD COLUMN source_detail TEXT,                    -- 'web_sched', 'recall_link', 'marketplace:zocdoc'
  ADD COLUMN source_booking_ref TEXT,               -- the widget's or marketplace's booking id
  ADD COLUMN idempotency_key TEXT,
  ADD COLUMN overbook_reason TEXT,                  -- set when a person overrode a conflict
  ADD COLUMN overbooked_by UUID,
  ADD CONSTRAINT appointments_idem UNIQUE (location_id, idempotency_key);

CREATE TABLE booking_rules (                       -- online booking policy, versioned per location
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID NOT NULL REFERENCES locations (id),
  version            INT NOT NULL,
  min_lead_minutes   INT NOT NULL DEFAULT 120,
  horizon_days       INT NOT NULL DEFAULT 60,
  hold_minutes       INT NOT NULL DEFAULT 10,
  max_new_patients_per_day INT,
  mode_by_type       JSONB NOT NULL,              -- {"<type_id>": "booked" | "request_queue" | "request"}
  accepted_plan_ids  UUID[] NOT NULL DEFAULT '{}',
  max_sync_age_minutes INT NOT NULL DEFAULT 30,   -- older copy: no real-time offers
  effective_from     TIMESTAMPTZ NOT NULL,
  approved_by        UUID NOT NULL,
  UNIQUE (location_id, version)
);

CREATE TABLE booking_requests (                    -- demand without a confirmed appointment
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID NOT NULL REFERENCES locations (id),
  patient_id         UUID REFERENCES patients (id),   -- null until matched
  submitted_identity JSONB NOT NULL,               -- name, birth date, phone, email as entered
  appointment_type_id UUID REFERENCES appointment_types (id),
  preferred_times    JSONB,                        -- request mode
  held_appointment_id UUID REFERENCES appointments (id),  -- request-queue mode
  coverage_entered   JSONB,                        -- carrier and member id as typed
  source             TEXT NOT NULL,                -- 'website', 'google', 'marketplace:zocdoc'
  source_ref         TEXT,
  booking_rules_version INT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('open', 'booked', 'declined', 'expired',
                       'duplicate')),
  decided_by         UUID,
  decided_at         TIMESTAMPTZ,
  UNIQUE (source, source_ref)
);

CREATE TABLE waitlist_entries (                    -- ASAP list and waitlist
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  patient_id         UUID NOT NULL REFERENCES patients (id),
  location_id        UUID NOT NULL REFERENCES locations (id),
  kind               TEXT NOT NULL CHECK (kind IN ('asap', 'waitlist')),
  current_appointment_id UUID REFERENCES appointments (id),  -- asap: the one to move earlier
  appointment_type_id UUID REFERENCES appointment_types (id),
  practitioner_role_ids UUID[] NOT NULL DEFAULT '{}',
  available_times    JSONB,                        -- 'weekday mornings', as ranges
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at         TIMESTAMPTZ
);
```

Notes on the sketch:

- **Two resources, one constraint.** Booking an appointment writes busy `appointment_slots` rows: one on the operatory's schedule for the whole pattern, and one on the practitioner's schedule for each run of `X` units (and on the hygienist's for theirs). The core exclusion constraint on `(schedule_id, during)` then refuses a second patient in the chair and a provider needed in two rooms in the same minutes, while letting a dentist's time interleave across columns.
- **Overrides skip the slot, not the record.** Deliberate double booking writes the appointment with `overbook_reason` and `overbooked_by` and doesn't claim the conflicting slots, so the overlap is visible in a query and nobody can create it by accident.
- **Holds are proposed appointments.** An online booking in progress is an `appointments` row with `status = 'proposed'`, its slots marked `busy_tentative` and `hold_expires_at` set from `booking_rules.hold_minutes`; confirming moves it to `booked`, and a lapsed hold is cancelled in the same transaction as the next booking that wants the time ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)).
- **Patterns are data.** The type carries a pattern and the appointment copies it, because a front desk lengthens an appointment for a nervous patient; slots are rewritten from the pattern on every change.
- **The PMS is still the authority.** When the PMS owns the schedule, these constraints protect your copy and your holds; the write-back can still be refused, and that refusal is a normal outcome ([Writing Back](/books/health-tech/pms-integration#writing-back)). Rows created from sync carry `source = 'sync'`.
- **Booking policy is versioned.** `booking_rules` holds lead time, horizon, hold length, caps, per-type mode, accepted plans and the freshness limit, approved by the practice, with the version recorded on every request ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Requests are not appointments.** A `booking_requests` row consumes no time unless it holds one, keeps what the patient typed separately from the matched patient, and dedupes marketplace webhooks on `(source, source_ref)`.
- **Waitlist offers are holds.** A claim from a waitlist text goes through the same booking path and constraint; the waitlist only decides who is told.
- **Events:** `appointment.booked`, `appointment.rescheduled`, `appointment.cancelled`, `appointment.no_show`, `booking_request.received` and `waitlist.slot_offered` feed reminders, the waitlist and the PMS write-back.

## Auditing

- **Every appointment change with its actor and channel:** booked online, by the front desk, from a marketplace, by sync from the PMS, by an AI agent. A patient's "I booked online and you gave my slot away" is answered from it.
- **Every override of a conflict,** with who and why, since deliberate double booking is a decision someone made.
- **Booking requests and their outcomes,** with the rules version, so a declined new patient or a marketplace booking the practice was charged for can be explained.
- **Waitlist offers sent and claimed,** to show who was offered a slot and in what order.

## What This Means for the System You Build

- **Model the schedule as the practice does:** provider schedules, operatories, appointment types with patterns, and blockouts reserved per type.
- **Check conflicts per resource and per unit,** chair for the whole pattern and provider for the `X` time, and let people override with a recorded reason.
- **Filter slot search by appointment type first,** then provider time, operatory, blocks and rules, and offer nothing real-time when the PMS copy is stale.
- **Pick a booking mode per appointment type,** booked, request queue or request, and tell the patient truthfully which one they got.
- **Hold slots in your system, re-check at confirmation and write back as a job,** with refusals routed to the patient and the office.
- **Book existing patients from links the practice sent;** match strangers carefully and dedupe new patients.
- **Collect carrier and member ID at booking** and the card at intake.
- **Treat marketplace and directory bookings as requests** with natural keys and attribution.
- **Run waitlist offers as hold contests** in small waves, freeing the moved patient's old slot in the same transaction.

## References

**PMS documentation**

- [Open Dental: Schedules](https://www.opendental.com/manual/schedule.html), provider and employee schedules, holidays and meetings, provider overlap warnings
- [Open Dental: Appointments API](https://www.opendental.com/site/apiappointments.html), appointment fields and statuses, five-minute patterns, slot endpoints and their defaults, ASAP and Web Sched endpoints, breaking as missed or cancelled
- [Open Dental: Web Sched New Patient setup](https://www.opendental.com/manual/webschednewpatsetup.html), operatories per type, leftmost open operatory, blockout rules, double-booking prevention, duplicate checks, carrier rules, "Created from Web Sched"
- [Open Dental: Web Sched Recall setup](https://www.opendental.com/manual/webschedrecallsetup.html), Web Sched operatories and provider per time block
- [Open Dental: ASAP List](https://www.opendental.com/manual/asaplist.html), the ASAP list, texting it and Web Sched ASAP
- [Open Dental: Fees](https://opendental.com/site/fees.html), Web Sched mode prices per location per month
- [ezyVet: Developer documentation](https://developers.ezyvet.com/), calendar availability and booking endpoints

**Booking vendors**

- [NexHealth: Scheduling configuration and slots](https://docs.nexhealth.com/docs/level-2d-scheduling-configuration-slots), slots as working hours minus unavailabilities by appointment type, the first-operatory default
- [NexHealth: Online booking](https://www.nexhealth.com/features/online-booking), sync every few minutes, Perfect Day recreated, new or existing patients, insurance at booking, Google
- [Weave: Scheduling](https://www.getweave.com/weave-scheduling/), request-based booking and the waitlist
- [Vetstoria](https://www.vetstoria.com/?p=99416), real-time booking against the PMS and client and pet matching
- [Luma Health](https://www.lumahealth.io/), scheduling channels, the waitlist, eligibility before scheduling, EHR integrations
- [Yapi](https://yapiapp.com/), booking links and supported PMSs
- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), MediFind, self-scheduling and about 180 million patient visits

**In practice**

- [MedCity News: Zocdoc raises $150M (2021)](https://medcitynews.com/2021/02/after-pivot-from-scheduling-tool-to-telehealth-platform-zocdoc-raises-150m/), the 2018 move from subscription to fee per booking and the reaction from practices
