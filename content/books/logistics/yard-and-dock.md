+++
title = "Yard Management & Dock Scheduling"
nav_title = "Yard & Dock"
description = "Dock appointments and booking APIs, the gate and seal checks, yard spots and hostler moves, yard checks, drop trailers, and the records that prove detention."
category = "Logistics & Supply Chain Industry"
order = 2841
part = "Warehouses and Yards"
tags = ["logistics", "warehouse", "yard-management", "dock-scheduling", "appointments", "detention", "data-model"]
+++

The yard is the part of a warehouse that isn't inside it: the gate where trucks enter, the lot where trailers wait, the doors where they are loaded and unloaded, and the spotters (yard drivers, hostlers or shunters, in different regions) who move trailers between them. A busy distribution center may have more trailers in its yard than doors on its building, most of them owned by carriers, some loaded and waiting to be received, some empty waiting to be loaded, some loaded and waiting for a carrier to hook them. Dock scheduling decides when each truck is expected and at which door; yard management records what is actually in the yard, where, since when and in what state.

The records matter because the yard is where the warehouse's time and the carrier's time collide, and both bill for it. A carrier whose driver waited four hours past an appointment bills detention to its customer, who passes it to the shipper or receiver whose dock caused it; a carrier whose trailer sat in a customer's yard for nine days bills trailer detention; a receiver that refused a load for arriving three hours late wants that recorded too. The DOT Inspector General's estimate of what detention costs drivers and carriers is in [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#detention), which owns the rules and rates; FMCSA's own detention study, approved for information collection in February 2024, planned to collect data from about 80 carriers and 2,500 drivers. Whoever holds the gate and door records with trustworthy timestamps wins those disputes, and the warehouse is the party that has them.

This chapter covers the platforms, the yard as data, dock appointments and booking APIs, the gate (check-in, seals and inspections), yard moves, yard checks, live and drop operations, and detention evidence. It extends `facilities`, `stops` and `equipment_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and the locations and receipts of [Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it). Marine terminal and rail ramp appointments, booked in the terminal's own system, are [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it)'s `terminal_appointments`; trailer pools and hook and drop custody are [Truckload](/books/logistics/truckload#live-drop-and-preloaded)'s.

## How the Platforms Do It

As of November 2026, from vendor pages and developer documentation:

| Vendor | Product | What its public material shows |
| --- | --- | --- |
| **Blue Yonder** | Warehouse Management with yard visibility | "Machine vision delivers yard visibility" with the yard, dock and trailers connected through its network |
| **C3 Solutions** (private, Montreal) | C3 Yard and C3 Reservations | A "Web-based Yard Management Solution" for trailers "from gate to gate" that automates yard driver task assignment, with a claimed "average 30% reduction in shunter tasks & movements"; C3 Reservations, an "Online Dock Scheduling System" that tracks vendor compliance |
| **Infios** | Yard Management System | Connects "display panels, traffic lights, gate systems and transponders"; "constraint-based scheduling" of dock and slot availability |
| **Kaleris** | Yard Management | "A global leader in yard management solutions since 2004"; configurable check-in and check-out, live yard inventory checks, two-way move tasks for yard drivers, dock door management, tracking of "outbound trailers incurring detention charges" with accessorial charge profiles, self-scheduled appointments for "yard managers, warehouse teams, carriers, and suppliers," RTLS, and multilingual driver kiosks; a 2023 pre-check-in app issuing a QR code, with a claimed check-in time cut of "over 80%" |
| **Opendock** (Loadsmart) | Dock scheduling with a carrier API | JWT authentication; warehouse search; load types that set appointment length; availability by load type; appointment creation that may return a "requested" status when the warehouse confirms; per-warehouse reference number rules |
| **Oracle** | Warehouse Management Cloud | A Yard location type, a trailer screen, and appointments that track "planned and actual arrival time and the lead-time from the trailer's check-in time to the receipt of the first LPN" |

Three patterns:

- **Scheduling moved to the carrier.** Kaleris and Opendock both let carriers and suppliers book their own appointments against the facility's rules; the facility's job is to publish capacity and rules as data, and the booking arrives by API, portal or email-to-portal.
- **The gate became a sensor.** Kiosks, pre-check-in apps, cameras, transponders and real-time location systems replace a guard's clipboard; each produces a timestamped event with its source, and the system has to pick which one it trusts ([Evidence, Not Truth](/docs/building-blocks/location-tracking#evidence-not-truth)).
- **Detention is a product feature.** Kaleris sells detention tracking as part of yard management, because the yard holds the timestamps that prove or disprove a charge.

## The Yard as Data

A facility's yard is a set of places, and the WMS's location model already has the types: Oracle's location master includes Dock and Yard, and [Warehouse Management Systems](/books/logistics/warehouse-management#the-building-as-data) models both as `warehouse_locations`. A **door** is a dock location with a direction (inbound, outbound or both), its equipment (a leveler, a seal, a restraint, a reefer-capable door for temperature-controlled loads), the trailer lengths it takes and its status (open, blocked, under repair). A **yard spot** is a numbered parking position, some with reefer plugs, some reserved for empties, hazmat or a carrier's pool. The LTL chapter already gave `facilities` a `door_count` ([LTL Networks](/books/logistics/ltl-networks#how-to-build-it)); the yard model replaces the count with the doors themselves.

What occupies them is equipment: a trailer, a container on a chassis, a straight truck, a tractor waiting. The core model's `equipment_units` row is the trailer, identified by its carrier's unit number or a container's BIC number, owned by a carrier, a lessor or the shipper. The yard model records each **visit** (one arrival through the gate to one departure, with tractor, trailer, carrier, driver and seal), the trailer's **position** over time (each move from spot to door to spot) and its **state** (loaded or empty, sealed or open, what it's waiting for).

## Dock Appointments

A dock appointment is a reservation of a door's time for one delivery or pickup. The facility defines **appointment types** (Opendock calls them load types), each with a duration, a direction, the equipment it needs and who may book it. Booking is a search for capacity and a hold on it. Opendock's carrier flow is typical: find the warehouse, read its settings (operating hours, time zone, custom fields it requires), list the load types the carrier may book, request availability for a load type over a date range, and create the appointment with a reference number, a start time and the custom fields. The response is 201 Created, and "some warehouses require the appointment to be confirmed by them," in which case it starts as requested.

The rules that make a schedule work:

- **Capacity is per door and per type.** A door can't hold two trailers at once, and a facility may cap how many live unloads start in an hour (labor) independent of doors. The first is an exclusion constraint on the door's time; the second is a counter per time bucket ([Preventing Double-Booking](/docs/building-blocks/reservations-and-holds#preventing-double-booking)).
- **References are the key, and they're validated.** The appointment names the purchase orders, ASN or load numbers it delivers. Opendock lets a warehouse require the reference and require it to be unique, and rejects a duplicate with a 409 ("The PO Number '123' is already in use"). Matching the appointment to the inbound ASN and the receipt is by these references.
- **Times are the facility's.** Opendock returns the warehouse's time zone (for example `America/Chicago`) and expects availability requests as ISO 8601 with an explicit offset. Every appointment is stored as an instant range and shown in the facility's zone ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)).
- **Lead times, cutoffs and changes are policy.** How far ahead a carrier must book, how late it may reschedule, and what counts as late or a no-show are per facility and per type, versioned like any rule ([Hold Lifetimes Are Policy](/docs/building-blocks/reservations-and-holds#hold-lifetimes-are-policy)).
- **The appointment and the stop are linked, not merged.** The carrier's or broker's load has a stop with an appointment window in the core model (`stops.appointment` and `stops.appointment_ref`); the facility's schedule has its own appointment with its own confirmation number. The stop references the facility's appointment when the facility's system issued it, and a reschedule on either side is an event both must hear ([Tendering & Acceptance](/books/logistics/tendering#changes-and-cancellations) covers changes on the carrier's side).

Outcomes are the point of the record: arrived on time, early, late (by how much), no-show, cancelled (by whom and how far ahead), or refused. Receivers measure carriers' and suppliers' compliance from them (C3 Reservations sells vendor compliance tracking), and carriers measure facilities by the same records in reverse.

## The Gate

Check-in is where the yard's evidence starts. A truck arrives at the gate, and the guard, a kiosk or a pre-check-in app records:

- **Who:** the carrier (name and SCAC or USDOT number), the driver (a name and a phone number, kept thin), and the appointment or reference numbers.
- **What:** the tractor and trailer or container and chassis numbers, loaded or empty, the seal number, the temperature setting for a reefer.
- **When and how:** the gate-in time and the method (guard, kiosk, app, camera, transponder), because a kiosk's timestamp and a camera's are different evidence.

Kaleris's kiosks let drivers "check in at their convenience in any language"; its pre-check-in app issues a QR code and alerts the yard system in advance so a door or spot can be reserved before the truck reaches the gate.

**Seals and inspections.** For cross-border freight under CBP's CTPAT program, the shipper seals the trailer "immediately after loading/stuffing/packing" with a high-security seal meeting ISO 17712, and the seal is checked by the "VVTT" process: view the seal and locking mechanisms, verify the seal number against the shipment documents, tug on the seal, and twist and turn a bolt seal to make sure nothing unscrews. CTPAT's highway carrier criteria also call for 17-point inspections of tractors (7 points) and trailers (10 points) "upon entering and departing the storage yards and at the point of loading/stuffing," and for warehouse managers to "periodically verify seal numbers used on conveyances." Domestic shippers apply the same discipline to high-value and food loads. The data consequences: the seal number on the ASN or bill of lading, the seal number found at the gate, the seal applied at departure, and any mismatch as an exception with photos, since a broken or wrong seal decides who bears a shortage claim ([Cargo Liability & Claims](/books/logistics/cargo-claims)).

Check-out records the reverse: gate-out time, the seal applied, the trailer's state and the bill of lading that left with it. The gate-in to gate-out interval is the truck's time on site, the basis of detention.

## Yard Moves

A spotter's work is a queue of moves: pull trailer 4821 from spot 112 to door 7 for unloading, pull it from door 7 to the empty row when it's done, bring an empty to door 22 for loading, stage a loaded outbound trailer at the departure row before its carrier arrives. Each move is a task with a priority (an appointment starting now outranks a reposition), assigned to a yard driver's device and confirmed when done. Kaleris and C3 both sell this assignment, Kaleris with "two-way communication" for assigning and confirming moves and a pitch to "reduce time and frequency of yard moves," C3 with its claim of 30% fewer shunter tasks.

The move record is how the system knows where a trailer is: its last completed move, or its gate-in if it hasn't moved. A move to a door also changes the warehouse's state: the door is occupied, the receipt can start (Oracle's check-in to first LPN), and when unloading ends the door is free for the next appointment. Door occupancy is a fact the dock schedule, the WMS and the yard share, and it lives in one place.

## Yard Checks

Records drift from the yard. A driver drops a trailer in the wrong spot, a carrier hooks an empty without checking out, a trailer arrives without passing the gate log. A yard check is a physical audit: walk or drive the yard, record every spot's trailer, and reconcile against the system. Kaleris sells "live inventory checks"; RTLS, cameras and transponders make the check continuous. Every discrepancy (a trailer the system thinks is here that isn't, one here the system doesn't know, one in the wrong spot) is resolved by a recorded correction with the check as its source, never by editing the position silently, because yard positions are evidence later.

## Live, Drop and Pools

The operating choice for each stop is live (the driver waits while the trailer is loaded or unloaded at a door) or drop (the driver leaves a trailer and takes another), with preloaded as a drop the shipper loaded in advance; the core model records it as `stops.handling`, and [Truckload](/books/logistics/truckload#live-drop-and-preloaded) covers what each costs the carrier. For the yard:

- **Live loads** need a door at the appointment time and a fast turn; the driver's clock is running.
- **Drops** need a spot and a later door, and the clock that runs is the trailer's: carriers charge trailer detention after a number of free days, and keep pools of trailers at large customers' yards, which [Truckload](/books/logistics/truckload#how-to-build-it) models as `trailer_pools` and `trailer_custody_events`.
- **Empties** are the yard's inventory problem. A receiver that unloads a carrier's trailer must release it ("empty and available") and the carrier must pick it up; an empty no one has released accrues detention and takes a spot.

The yard system's records feed the carrier's: a drop at a customer is a `trailer_custody_events` row of action `drop` on the carrier's side and a gate-in and spot on the facility's side; when both companies run the same visibility network, they can be matched by trailer number, facility and time.

## Detention Evidence

[Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#detention) owns detention's rules (when the clock starts, free time, increments, caps, notice) and its arithmetic. The yard owns the facts those rules need:

| Fact | Record | Why it decides the charge |
| --- | --- | --- |
| **Appointment window** | The facility's dock appointment, as confirmed | An early driver's clock usually starts at the appointment, a late driver's may not start at all |
| **Arrival** | Gate-in time and method | The clock's start; a kiosk or camera timestamp is harder to dispute than a driver's call |
| **Door time** | The yard move to the door | Waiting in the yard and waiting at the door are different causes |
| **Work complete** | Receipt closed, or loading complete and bills signed | The facility's work ended here; time after is the driver's or the carrier's |
| **Departure** | Gate-out time | The clock's end |
| **Who caused it** | Late arrival, no door available, labor shortage, carrier paperwork, refused load | Some contracts waive detention when the carrier was late or the delay was the carrier's |

The same records answer the facility's side: a receiver that charges carriers or vendors for missed appointments (a common retail practice, in vendor compliance programs that Commerce covers in [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#routing-guides)) proves the miss with the appointment and the gate log. The law gives the facility a direct stake: a shipper or receiver that requires a driver to be assisted in loading or unloading must provide the assistance or compensate the owner or operator for its costs, and may not coerce a carrier to load or unload or to pay someone to do it (49 U.S.C. 14103(a) and (b), covered with lumpers in the rating chapter).

Every one of these facts is an event with an occurred time and a received time, in the facility's zone, with its source; the facility's version and the carrier's version of an arrival can differ by an hour, and both are kept ([Event Time Versus Received Time](/books/logistics/logistics-business#the-core-data-model)).

## How to Build It

Doors and spots are already `warehouse_locations` of kind `dock` and `yard`; the yard adds their attributes, appointment types and appointments, visits through the gate, moves, and checks. Stops gain the facility's appointment and the yard's actual times, and equipment gains a cached last-seen position. All `ALTER`s run on a live database ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- for the door exclusion constraint

ALTER TABLE warehouse_locations
  ADD COLUMN door_direction TEXT,          -- for kind 'dock': inbound, outbound or both
  ADD COLUMN reefer_capable BOOLEAN NOT NULL DEFAULT FALSE,  -- a door or a spot with a plug
  ADD COLUMN max_trailer_ft SMALLINT;
ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_door_direction_check
  CHECK (door_direction IS NULL OR door_direction IN ('inbound', 'outbound', 'both')) NOT VALID;

ALTER TABLE facilities
  ADD COLUMN yard_rules JSONB NOT NULL DEFAULT '{}';  -- late and no-show thresholds, versioned

ALTER TABLE equipment_units
  ADD COLUMN last_seen_facility_id UUID REFERENCES facilities (id),  -- a cache of the latest visit
  ADD COLUMN last_seen_at          TIMESTAMPTZ;

CREATE TABLE dock_appointment_types (    -- a facility's load types: duration, direction, who books
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id     UUID NOT NULL REFERENCES facilities (id),
  name            TEXT NOT NULL,         -- 'Live unload, floor loaded 53 ft'
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  handling        TEXT NOT NULL CHECK (handling IN ('live', 'drop', 'preloaded')),
  duration        INTERVAL NOT NULL,
  equipment_type  TEXT,
  carrier_bookable BOOLEAN NOT NULL DEFAULT TRUE,
  requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
  min_lead        INTERVAL NOT NULL DEFAULT '0',
  hourly_start_cap SMALLINT,               -- labor cap on starts per hour, independent of doors
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE dock_appointments (         -- the facility's reservation of a door's time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES facilities (id),
  appointment_type_id UUID NOT NULL REFERENCES dock_appointment_types (id),
  door_location_id    UUID REFERENCES warehouse_locations (id),  -- null until a door is assigned
  booked_window       TSTZRANGE NOT NULL,  -- shown in the facility's time zone
  carrier_party_id    UUID REFERENCES parties (id),
  booked_by_party_id  UUID NOT NULL REFERENCES parties (id),  -- carrier, broker, supplier or facility
  channel             TEXT NOT NULL CHECK (channel IN ('portal', 'api', 'edi', 'email', 'phone',
                        'internal')),
  reference_numbers   JSONB NOT NULL DEFAULT '{}',  -- {"po": [...], "asn": "...", "load": "..."}
  confirmation_number TEXT NOT NULL,
  external_ref        TEXT,              -- the scheduling platform's ID, when it isn't this system
  status              TEXT NOT NULL CHECK (status IN ('requested', 'scheduled', 'arrived',
                        'at_door', 'completed', 'no_show', 'cancelled', 'refused')),
  arrival_outcome     TEXT CHECK (arrival_outcome IN ('early', 'on_time', 'late')),
  late_by             INTERVAL,
  cancelled_by        TEXT CHECK (cancelled_by IN ('carrier', 'facility', 'supplier')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_id, confirmation_number),
  EXCLUDE USING gist (door_location_id WITH =, booked_window WITH &&)
    WHERE (status IN ('scheduled', 'arrived', 'at_door') AND door_location_id IS NOT NULL)
);

ALTER TABLE stops
  ADD COLUMN dock_appointment_id UUID,   -- the facility's appointment, when it issued one
  ADD COLUMN gate_in_at          TIMESTAMPTZ,
  ADD COLUMN at_door_at          TIMESTAMPTZ,
  ADD COLUMN work_complete_at    TIMESTAMPTZ,
  ADD COLUMN gate_out_at         TIMESTAMPTZ;

CREATE TABLE yard_visits (               -- one truck through the gate: in, and out
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  carrier_party_id   UUID REFERENCES parties (id),
  carrier_scac       TEXT,               -- as written at the gate, before it's matched
  tractor_ref        TEXT,
  trailer_id         UUID REFERENCES equipment_units (id),
  chassis_id         UUID REFERENCES equipment_units (id),
  driver_name        TEXT,               -- thin: no license numbers here
  dock_appointment_id UUID REFERENCES dock_appointments (id),
  stop_id            UUID REFERENCES stops (id),
  arrived_loaded     BOOLEAN,
  seal_in            TEXT,
  seal_in_matches    BOOLEAN,            -- against the ASN or bill of lading
  seal_out           TEXT,
  gate_in_at         TIMESTAMPTZ NOT NULL,
  gate_in_method     TEXT NOT NULL CHECK (gate_in_method IN ('guard', 'kiosk', 'app', 'camera',
                       'transponder', 'manual_backfill')),
  gate_out_at        TIMESTAMPTZ,
  inspection_document_id UUID REFERENCES documents (id),  -- the 17-point checklist, photos
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (gate_out_at IS NULL OR gate_out_at >= gate_in_at)
);

CREATE TABLE yard_moves (                -- a trailer moved from one spot or door to another
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  yard_visit_id    UUID NOT NULL REFERENCES yard_visits (id),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  from_location_id UUID REFERENCES warehouse_locations (id),  -- null: from the gate
  to_location_id   UUID REFERENCES warehouse_locations (id),  -- null: to the gate
  reason           TEXT NOT NULL CHECK (reason IN ('to_door', 'from_door', 'reposition',
                     'stage_outbound', 'to_gate', 'correction')),
  priority         INT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('requested', 'assigned', 'in_progress',
                     'completed', 'cancelled')),
  driver_worker_id UUID REFERENCES warehouse_workers (id),
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  trailer_state    TEXT CHECK (trailer_state IN ('loaded', 'empty', 'partial')),
  yard_check_id    UUID                  -- set when the move corrects a yard check finding
);
CREATE INDEX ON yard_moves (equipment_id, completed_at);

CREATE TABLE yard_checks (               -- a physical audit of spots against the record
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id   UUID NOT NULL REFERENCES facilities (id),
  method        TEXT NOT NULL CHECK (method IN ('walk', 'drive', 'camera', 'rtls')),
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  checked_by_ref TEXT NOT NULL
);

CREATE TABLE yard_check_lines (
  yard_check_id   UUID NOT NULL REFERENCES yard_checks (id),
  location_id     UUID NOT NULL REFERENCES warehouse_locations (id),
  observed_ref    TEXT,                  -- the trailer number seen; null: empty spot
  expected_equipment_id UUID REFERENCES equipment_units (id),
  finding         TEXT NOT NULL CHECK (finding IN ('match', 'missing', 'unexpected',
                    'wrong_spot', 'state_mismatch')),
  resolved_move_id UUID REFERENCES yard_moves (id),
  PRIMARY KEY (yard_check_id, location_id)
);

ALTER TABLE yard_moves ADD CONSTRAINT yard_moves_yard_check_fkey
  FOREIGN KEY (yard_check_id) REFERENCES yard_checks (id) NOT VALID;
ALTER TABLE stops ADD CONSTRAINT stops_dock_appointment_fkey
  FOREIGN KEY (dock_appointment_id) REFERENCES dock_appointments (id) NOT VALID;
ALTER TABLE warehouse_locations VALIDATE CONSTRAINT warehouse_locations_door_direction_check;
ALTER TABLE yard_moves VALIDATE CONSTRAINT yard_moves_yard_check_fkey;
ALTER TABLE stops VALIDATE CONSTRAINT stops_dock_appointment_fkey;
```

Where every trailer is now reads off the moves, falling back to the gate:

```sql
CREATE VIEW yard_inventory AS
SELECT v.facility_id, v.id AS yard_visit_id, v.trailer_id, v.carrier_party_id,
       m.to_location_id AS location_id,   -- null: not yet moved from the gate lane
       COALESCE(m.trailer_state, CASE WHEN v.arrived_loaded THEN 'loaded' ELSE 'empty' END)
         AS trailer_state,
       NOW() - v.gate_in_at AS on_site_for
FROM yard_visits v
LEFT JOIN LATERAL (
  SELECT to_location_id, trailer_state
  FROM yard_moves
  WHERE yard_visit_id = v.id AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1
) m ON TRUE
WHERE v.gate_out_at IS NULL;
```

The detention evidence for a stop is one row, computed in the facility's zone, that the rating engine prices and a dispute can cite:

```sql
SELECT s.id AS stop_id, f.time_zone,
       lower(a.booked_window) AS appointment_start,
       v.gate_in_at, s.at_door_at, s.work_complete_at, v.gate_out_at,
       a.arrival_outcome, a.late_by,
       GREATEST(lower(a.booked_window), v.gate_in_at) AS clock_start_candidate,
       v.gate_out_at - GREATEST(lower(a.booked_window), v.gate_in_at) AS time_on_site_after_start
FROM stops s
JOIN facilities f ON f.id = s.facility_id
JOIN dock_appointments a ON a.id = s.dock_appointment_id
JOIN yard_visits v ON v.stop_id = s.id
WHERE s.id = $1;
```

Which start the schedule actually uses (appointment, arrival, or none for a late driver) is the rating chapter's rule, applied to these columns.

Design notes:

- **Doors and spots are locations.** One location model covers racks, doors and yard spots, so door occupancy, receiving and yard moves share keys.
- **The appointment is a reservation with an outcome.** The exclusion constraint prevents two live appointments at a door; the outcome (early, on time, late, no-show, cancelled by whom) is recorded at the event, not inferred later ([Exclusion Constraints for Time](/docs/building-blocks/reservations-and-holds#exclusion-constraints-for-time)).
- **The visit is the unit of evidence.** Gate-in, moves, door time and gate-out hang off one visit with its method and source, and `stops` copies the times it needs for billing with a pointer to the visit.
- **Positions change only by moves.** A yard check finding is resolved by a correction move, so the trailer's history has no silent jumps.
- **Rules are versioned data.** Late and no-show thresholds, lead times and hourly caps change by facility and season; the appointment records which rule judged it ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Driver data stays thin.** A name and a phone number to call; licenses and identity checks belong to the carrier's systems ([Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification)).
- **Emit the yard's events.** `appointment.booked`, `appointment.rescheduled`, `yard.gate_in`, `yard.at_door`, `yard.gate_out` and `appointment.no_show` are what carriers' visibility feeds, the WMS's receiving, and billing subscribe to; a carrier's TMS often hears them as 214 statuses or API events ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every appointment,** booked, confirmed, rescheduled, cancelled (by whom, how far ahead) and its outcome, with the rule version that judged it.
- **Every gate event,** in and out, with method, times, seals expected and found, and the inspection record.
- **Every yard move,** requested, assigned, completed, with the driver and the trailer's state, and every correction with the yard check that caused it.
- **Every door's occupancy,** derived from moves, for capacity planning and for disputes about "no door available."
- **The detention evidence,** the row above as computed for each billed or disputed stop, kept with the charge it supported.

## What This Means for the System You Build

- **Model doors and yard spots as locations** with direction, equipment and capacity, sharing keys with the WMS.
- **Publish appointment types and capacity as data** and accept bookings by API, portal and EDI, with validated references and the facility's time zone.
- **Treat appointments as reservations** with exclusion on the door, a confirmation number and a recorded outcome.
- **Record every gate visit with method, seals and inspection,** and keep a mismatch as an exception with photos.
- **Move trailers only through recorded moves,** and resolve yard check findings with correction moves.
- **Assemble detention evidence from the facility's own events** in its zone, and keep it with the charge.
- **Link the facility's appointment to the carrier's stop** without merging them, and send changes both ways.

## References

**Regulations, statutes and programs**

- [49 U.S.C. 14103: Loading and unloading motor vehicles](https://www.law.cornell.edu/uscode/text/49/14103), the shipper's or receiver's duty to provide assistance or compensate, and the prohibition on coercing loading, unloading or lumper payments
- [CBP: CTPAT Minimum Security Criteria, Highway Carriers (October 2021)](https://www.cbp.gov/sites/default/files/assets/documents/2022-May/CTPAT%20Highway%20Carriers%20MSC%20October%202021%20%28508%29.pdf), the 17-point tractor and trailer inspection, ISO 17712 high-security seals, seal audits and the VVTT process
- [FMCSA: Impact of Driver Detention Time on Safety and Operations, information collection approval notice (February 16, 2024)](https://www.federalregister.gov/documents/2024/02/16/2024-03256/agency-information-collection-activities-approval-of-a-new-information-collection-request-impact-of), the planned study of about 80 carriers and 2,500 drivers

**Vendors and developer documentation**

- [Opendock (Loadsmart): Booking appointments for carriers](https://developer.loadsmart.com/docs/opendock/for-carriers/booking-appointments), authentication, warehouse search and settings, load types, availability, appointment creation, requested status, reference number rules and time zones
- [Kaleris: Yard Management](https://kaleris.com/solutions/yard-management/), check-in and check-out, live inventory checks, yard driver moves, dock doors, detention tracking, self-scheduled appointments, RTLS and kiosks
- [Kaleris](https://kaleris.com/), yard management since 2004
- [Kaleris: Driver pre-check-in app and multilingual kiosk (March 20, 2023)](https://kaleris.com/?p=12854), the QR code, advance alert and claimed check-in time reduction
- [C3 Solutions: C3 Yard](https://www.c3solutions.com/c3-yard/), web-based yard management, gate-to-gate flow, yard driver task assignment, the shunter-task claim, C3 Reservations, and its ownership and headquarters
- [Infios: Yard Management System](https://www.infios.com/en/supply-chain-solutions/yard-management-system), gate systems and transponders, and constraint-based dock and slot scheduling
- [Blue Yonder: Warehouse Management](https://blueyonder.com/solutions/warehouse-management), machine vision yard visibility
- [Oracle Warehouse Management Cloud: Location Master](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/location-master.html), the Dock and Yard location types
- [Oracle Warehouse Management Cloud: Appointments](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/appointments.html), planned and actual arrival and check-in to first LPN
