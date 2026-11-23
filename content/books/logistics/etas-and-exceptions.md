+++
title = "ETAs & Exception Management"
nav_title = "ETAs & Exceptions"
description = "Predicting arrivals with a range, choosing which ETA to show, exception rules as data, the exception workflow, and telling customers without flooding them."
category = "Logistics & Supply Chain Industry"
order = 2837
part = "Data and Visibility"
tags = ["logistics", "visibility", "eta", "exceptions", "notifications", "rules-as-data"]
+++

An ETA is a prediction of when freight will reach a stop, and in freight it is the number everyone plans around: the consignee's dock schedules labor and doors from it, the shipper's customer service promises a store from it, the broker's carrier rep decides whether to call the driver from it, and the next load the truck was booked for depends on it. Several parties predict the same arrival at once. The carrier sends an estimated delivery date in a 214, a visibility network computes one from positions, the ocean carrier publishes an estimated vessel arrival, the TMS has its own model, and a rep types in what the dispatcher said. They disagree, they change, and each was computed at a different time from different facts.

An exception is what happens when the plan and the predictions part ways: the pickup didn't happen in its window, the delivery will miss its appointment, the truck stopped reporting, the reefer drifted out of range, customs put the box on hold. The hard parts are deciding which prediction to believe and how sure to be, turning "late" into rules a business can tune per customer and lane without a deploy, working each exception to a resolution someone owns, and telling customers enough, early, without sending a message every time a number moves. This chapter covers what an ETA is made of, confidence ranges, choosing the ETA to show, exception rules and the exception workflow, customer notification, and the tables. The timeline these run on (milestones, sessions, arrivals) is [Visibility & Tracking](/books/logistics/visibility-and-tracking); the consumer delivery promise and parcel WISMO are Commerce's [Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises).

## How the Platforms Do It

As of November 2026, from developer documentation, product pages and published guides:

| Platform or standard | ETA | Range or confidence | Exceptions | Notes |
| --- | --- | --- | --- | --- |
| **C.H. Robinson** (as a consumer of LTL 214s) | G62 date qualifier 17, Estimated Delivery Date | None | AT702 status reason: "NS - Normal Status or see Late Reason Code List" (the guide accepts all 86 standard codes) | Appointment statuses AA (pickup) and AB (delivery) in AT703 |
| **DCSA Track & Trace** (ocean standard) | Events classified `EST`, beside `PLN` and `ACT` | None in the classifier | Not a separate object | Estimated vessel and equipment events |
| **FourKites** | "ML-powered ETAs" from "GPS data, check-call history and patterns across the network"; markets "FourKites Dynamic ETA" | Not publicly documented | "exception detection"; "Each affected load is tagged with the disruption reason" | Public API documentation not found |
| **NMFTA Digital Standards** | LTL Pickup Request and Visibility carries updated arrival times | Not stated | Delay reasons; LTL In-Transit Visibility has exception alerts for delays, damages and reweighs | FTL In-Transit Visibility is meant to flag delays early for exception management and customer communication |
| **project44** | `estimateDateTime` and `estimateLastCalculatedDateTime` on events; legacy `arrivalEstimate` with `estimatedArrivalWindow` and `lastCalculatedDateTime`; `externalArrivalEstimate` with a `source` on stops | A start and end window (legacy payload) | `exceptions` with `category`, `reason`, `status` and a `timeline` | "All Event Types can sometimes return an ETA or ATA" |
| **Samsara** (route stops, beta webhooks) | `RouteStopEtaUpdated` with `eta` "if this stop is currently en-route" and `scheduledArrivalTime` | `ontimeWindowBeforeArrivalMs`, `ontimeWindowAfterArrivalMs` around the schedule | `RouteStopEarlyLateArrival` with `arrivalStatus` early or late and `deviationMinutes` | Stop arrival payloads carry the driver's HOS `clocks` |
| **Trucker Tools** | ETA used for alerts | Not stated | "'running late' statuses and automated email alerts"; "Off Route Alerts"; "Out of Range" when a driver "is likely to miss a pickup" | Pings every five minutes |

FourKites' ETA and exception APIs aren't publicly documented, so the volume describes only what its product pages state. <!-- source-gap: logistics-etas-and-exceptions-fourkites-eta | missing | FourKites ETA fields, confidence and exception types in its API | closes with: a public FourKites developer or help-center page | checked: 2026-11-22 -->

Four patterns:

- **An ETA carries its own age.** project44 stamps when an estimate was last calculated, separately from the event; Samsara populates an ETA only while the stop is en route; a 214's estimated delivery date is as old as the message. An ETA without the time it was computed can't be compared with another one.
- **Several ETAs coexist, labeled by source.** project44 keeps its own estimate and an `externalArrivalEstimate` with its source side by side; a shipper receiving a carrier's 214 and a network's feed holds two. Every one is kept; one is chosen to show.
- **Exceptions are records with a life, not alerts.** project44's exceptions have a status and a timeline; FourKites tags each affected load with a reason; the NMFTA standards carry delay reasons and exception notifications as data. A message about an exception is one output of the record, not the record.
- **On time is a window defined as data.** Samsara puts an explicit on-time window before and after each scheduled arrival, and reports early or late with the deviation in minutes. Late is computed against a stored window, never against a judgment made in code.

## What an ETA Is Made Of

For a truck, an ETA is the current position, plus drive time on the remaining route, plus the time the driver must stop, plus the time spent at any stops before this one, constrained by when the facility can receive. The playbook's version (travel time plus remaining work, recomputed on meaningful change) is the base ([ETAs](/docs/building-blocks/location-tracking#etas)); freight adds four terms:

- **Truck routing.** Drive time comes from a routing engine that knows truck restrictions and traffic. Mapbox's Directions API, for example, takes `max_height`, `max_width` and `max_weight` and, with `depart_at` on its traffic profile, returns a duration that "is a prediction for travel time based on historical travel data and live traffic." A car route under a 12-foot bridge is not an ETA for a 13-foot-6 trailer.
- **Hours of service.** A property-carrying driver may drive 11 hours inside a 14-hour on-duty window after 10 consecutive hours off, and may not drive once 8 hours of driving have passed without a 30-minute interruption in driving, which may be off duty, in the sleeper berth or on duty not driving (49 CFR 395.3). A truck 500 miles out with 2 hours of driving left today isn't arriving tonight, whatever the router says. The driver's remaining clocks come from the ELD vendor (Samsara's stop arrival payloads carry them) and the rules from [Hours of Service](/books/logistics/hours-of-service#the-limits).
- **Stops before this one.** A multi-stop truckload's ETA to stop 3 includes the unloading time at stop 2, which the broker estimates from the facility's history; an LTL shipment's ETA is the carrier's published transit for the lane through its terminals ([LTL Networks](/books/logistics/ltl-networks#how-to-build-it) keeps `ltl_transit_lanes`), adjusted by scans.
- **The facility's hours.** A truck arriving at 03:00 at a DC that receives from 06:00 arrives, for planning, at 06:00 or at its appointment. An ETA to the gate and an ETA to the door are different numbers, and the second is what the consignee needs.

Other modes have their own terms: a rail leg's ETA turns on making the train's cutoff at the origin ramp ([Ramps and Rail Legs](/books/logistics/intermodal-and-drayage#ramps-and-rail-legs)) and on the railroad's estimate, an ocean leg's on the carrier's estimated vessel arrival and the terminal's discharge and availability, an air leg's on the flight and the time to break down a ULD.

**A worked truckload.** A load is due at an Atlanta DC in an 08:00 to 10:00 appointment window tomorrow (all times Eastern). At 15:00 the truck is 480 miles out. The driver came on duty at 05:00 after a 10-hour break, has driven 8.5 hours and taken a 30-minute break, so 2.5 hours of driving remain before the 11-hour limit, inside a window that closes at 19:00. With an illustrative 55 mph average:

| Step | Time | Miles left |
| --- | --- | --- |
| Now | 15:00 | 480 |
| Drive the remaining 2.5 hours (137.5 miles) | 17:30 | 342.5 |
| 10 consecutive hours off | 03:30 | 342.5 |
| Drive 342.5 miles at 55 mph (6 hours 14 minutes, under 8 hours, so no break due) | 09:44 | 0 |

The router alone says 23:44 tonight, ten hours early; the HOS-aware ETA says 09:44, inside the window with 16 minutes to spare, which is a different conversation with the consignee. Real computations add the driver's actual drive speed on the lane, fuel and a pre-trip inspection; the point is that the clock dominates the arithmetic.

## Confidence

A single time hides how sure the prediction is. 09:44 computed from a position five minutes old, for a lane the carrier runs daily, is a different claim from 09:44 computed from a check call eight hours old. The honest output is a range: "between 09:15 and 10:30," with a stated coverage (the share of arrivals that should fall inside it).

The simplest range that works is empirical. For past arrivals on the same lane (or region pair), mode, source and **horizon** (how far ahead the prediction was made), keep the residuals, actual minus predicted, and read their percentiles: the 10th and 90th give an 80% range around today's point estimate. Ranges widen with horizon, so a two-day-out ETA carries a wide range and the same model's two-hours-out ETA a narrow one. The range is checked the way any interval is: of the arrivals that happened, the share that fell inside their stated 80% range should be near 80%. A source whose ranges catch 50% is overconfident, and its ranges are widened or it stops being shown. Percentiles over a fleet are computed from pooled residuals, never by averaging per-carrier percentiles ([Histograms, Summaries and Percentiles](/docs/observability/metrics#histograms-summaries-and-percentiles)).

The second job is not to flood people when the range moves. The displayed ETA changes only when the new estimate differs by more than a threshold ([ETAs](/docs/building-blocks/location-tracking#etas)), and a notification goes out only when the answer to the question the recipient cares about changes: will it make the window? A function that does both, given the last range a recipient was told, the new range and the appointment:

```go tab="Go"
package eta

import (
	"slices"
	"time"
)

// Interval turns a point ETA into a range from past residuals (actual minus
// predicted, in minutes) for the same lane, mode, source and horizon bucket.
// It returns ok=false when history is too thin to state a range.
func Interval(eta time.Time, residuals []float64, lo, hi float64) (low, high time.Time, ok bool) {
	if len(residuals) < 30 { // my floor; below it, show the point and say so
		return eta, eta, false
	}
	r := slices.Clone(residuals)
	slices.Sort(r)
	q := func(p float64) time.Duration {
		pos := p * float64(len(r)-1)
		i := int(pos)
		v := r[i]
		if i+1 < len(r) {
			v += (pos - float64(i)) * (r[i+1] - r[i])
		}
		return time.Duration(v * float64(time.Minute))
	}
	return eta.Add(q(lo)), eta.Add(q(hi)), true
}

type Status int

const (
	OnTime Status = iota // the whole range is inside the window
	AtRisk               // the window's end falls inside the range
	Late                 // the whole range is after the window
)

func Classify(low, high, windowEnd time.Time) Status {
	switch {
	case !high.After(windowEnd):
		return OnTime
	case low.After(windowEnd):
		return Late
	default:
		return AtRisk
	}
}

type Told struct {
	Low, High time.Time // the range the recipient was last given
	Status    Status
	At        time.Time
}

type Policy struct {
	MinShift time.Duration // a late ETA must move this much to be news
	MinGap   time.Duration // between messages, unless the status gets worse
}

// ShouldNotify says whether this recipient hears about the new range.
func ShouldNotify(last *Told, low, high, windowEnd, now time.Time, p Policy) bool {
	s := Classify(low, high, windowEnd)
	if last == nil {
		return s != OnTime // nobody is told that the plan is still the plan
	}
	if s > last.Status {
		return true // worse news goes out at once
	}
	if now.Sub(last.At) < p.MinGap {
		return false
	}
	if s != last.Status {
		return true // recovered: tell them once
	}
	mid := low.Add(high.Sub(low) / 2)
	lastMid := last.Low.Add(last.High.Sub(last.Low) / 2)
	shift := mid.Sub(lastMid)
	if shift < 0 {
		shift = -shift
	}
	return s == Late && shift >= p.MinShift
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};

/// A point ETA widened to a range from past residuals (actual minus predicted,
/// in minutes) for the same lane, mode, source and horizon bucket.
/// None when history is too thin to state a range.
pub fn interval(eta: DateTime<Utc>, residuals: &[f64], lo: f64, hi: f64)
    -> Option<(DateTime<Utc>, DateTime<Utc>)> {
    if residuals.len() < 30 { // my floor; below it, show the point and say so
        return None;
    }
    let mut r = residuals.to_vec();
    r.sort_by(|a, b| a.total_cmp(b));
    let q = |p: f64| {
        let pos = p * (r.len() - 1) as f64;
        let i = pos as usize;
        let mut v = r[i];
        if i + 1 < r.len() {
            v += (pos - i as f64) * (r[i + 1] - r[i]);
        }
        Duration::seconds((v * 60.0).round() as i64)
    };
    Some((eta + q(lo), eta + q(hi)))
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum Status { OnTime, AtRisk, Late }

pub fn classify(low: DateTime<Utc>, high: DateTime<Utc>, window_end: DateTime<Utc>) -> Status {
    if high <= window_end {
        Status::OnTime
    } else if low > window_end {
        Status::Late
    } else {
        Status::AtRisk
    }
}

pub struct Told { pub low: DateTime<Utc>, pub high: DateTime<Utc>, pub status: Status, pub at: DateTime<Utc> }

pub struct Policy { pub min_shift: Duration, pub min_gap: Duration }

/// Whether this recipient hears about the new range.
pub fn should_notify(last: Option<&Told>, low: DateTime<Utc>, high: DateTime<Utc>,
                     window_end: DateTime<Utc>, now: DateTime<Utc>, p: &Policy) -> bool {
    let s = classify(low, high, window_end);
    let Some(last) = last else {
        return s != Status::OnTime; // nobody is told that the plan is still the plan
    };
    if s > last.status {
        return true; // worse news goes out at once
    }
    if now - last.at < p.min_gap {
        return false;
    }
    if s != last.status {
        return true; // recovered: tell them once
    }
    let mid = low + (high - low) / 2;
    let last_mid = last.low + (last.high - last.low) / 2;
    s == Status::Late && (mid - last_mid).abs() >= p.min_shift
}
```

Worse news bypasses the gap because a consignee told "at risk" at 06:00 needs "late" at 06:20; an improving or wobbling estimate waits. The policy values (the residual percentiles, the minimum shift and gap) are per customer and recipient type in the exception rules, not constants ([The Shape of a Rule](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)).

## Choosing the ETA to Show

With several predictions per stop, the system shows one, and the choice is a rule:

- **An actual beats every estimate.** Once a stop has an arrival, its ETA is history; showing a predicted 09:44 after a geofence entry at 09:31 is a bug.
- **Stale predictions drop out.** A prediction's age is now minus its `predicted_at`, and an ETA older than a threshold for its horizon isn't shown; a carrier's estimated delivery date from yesterday's 214 doesn't outrank a network's estimate from five minutes ago. A prediction in the past for a stop not yet reached is wrong by definition and is replaced, with a stale-tracking check.
- **Measured accuracy decides between fresh ones.** For each source, lane class and horizon, the error and the coverage of its ranges are known from history (the query in How to Build It). The shown ETA is the freshest prediction from the source with the best measured accuracy for that horizon, and the choice is recorded.
- **Ocean and air legs show the carrier's estimate, adjusted.** A vessel's `EST` arrival from the carrier is the input; terminal dwell to availability and the dray turn it into an ETA to the warehouse. Each leg's ETA is chained from the previous leg's.

## Exceptions

An exception is a condition on a load, stop or shipment that someone has to act on. The kinds a broker's, shipper's or carrier's operations team works, the rule that opens each, and what it reads:

| Kind | Opens when (thresholds are rule data) | Reads |
| --- | --- | --- |
| `late_pickup` | No pickup arrival by the end of the pickup appointment, plus grace | `stops.appointment`, arrival events |
| `missed_appointment` | Arrival after the appointment window, or no arrival when it ends | `stops`, the chosen arrival |
| `late_delivery_risk` | The shown ETA's range reaches past the delivery window's end | `stop_etas`, `stops.appointment` |
| `no_tracking` | No tracking session has started by a lead time before pickup | `tracking_sessions` |
| `stale_tracking` | A session in tracking has had no signal for N hours while the load is in transit | `tracking_sessions.last_signal_at` |
| `off_route` | Positions outside a corridor around the planned route for a duration | `positions`, the planned route |
| `dwell` | Time at a stop past its free time, the start of detention or storage | Arrival, departure, `stops.free_time_ends_at` ([Intermodal & Drayage](/books/logistics/intermodal-and-drayage#how-to-build-it)) |
| `temperature` | Reefer readings outside the setpoint band for a duration | `reefer_readings` ([Truckload](/books/logistics/truckload#how-to-build-it)) |
| `hold` | A hold event: customs, a partner agency, a carrier or a terminal | `shipment_events` with code `hold` |
| `os_and_d` | An overage, shortage, damage or refusal recorded | `osd_exceptions` ([LTL Networks](/books/logistics/ltl-networks#pickup-delivery-and-exceptions)) |

Trucker Tools' "Off Route Alerts" and "Out of Range" alerts, FourKites' disruption tags and project44's exception objects are vendor versions of rows in this table. Six rules make exceptions work as a system rather than a stream of alerts:

- **Rules are data, versioned.** Each rule has a kind, a scope (a customer, a lane, a mode, a facility, a carrier), its thresholds, a severity, who owns it and who hears about it, and validity dates. A customer that wants `late_delivery_risk` six hours ahead instead of two gets a new rule version, not a deploy; the most specific rule in scope wins, by an explicit precedence ([When Rules Overlap](/docs/building-blocks/rules-as-data#when-rules-overlap)). Every exception records the rule version that opened it ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **One open exception per condition.** A stale-tracking rule evaluated every few minutes finds the same load quiet each time; it updates the open exception's last-seen time, it doesn't open twenty. A partial unique index on kind and subject among open exceptions enforces it.
- **Exceptions are a workflow.** Open, acknowledged, resolved or cancelled, with every transition recorded and guarded in the database ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit), [Transition History](/docs/building-blocks/workflows#transition-history)). Acknowledgment has a deadline per severity, and an unacknowledged critical exception escalates to the next owner on a timer ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)); working one is a human step with an assignee ([Human Steps](/docs/building-blocks/workflows#human-steps)).
- **Some resolve themselves, on the record.** A stale-tracking exception resolves when signals resume, and a late-delivery risk when the ETA recovers; the system resolves it with `resolution` set and the event that cleared it, so the team's queue shows only what needs a person and the history still shows that it happened.
- **Cause is separate from symptom.** A late delivery is the symptom; the cause (carrier, shipper not ready, consignee refused the appointment, facility congestion, weather, customs) decides who pays detention, whether a retailer's OTIF chargeback is disputable ([OTIF Programs](/books/commerce/wholesale-and-retail-distribution#otif-programs)) and which carrier's scorecard takes the hit. A carrier's 214 states its reason in AT702 ("NS - Normal Status or see Late Reason Code List," with all 86 standard 4010 codes accepted in C.H. Robinson's LTL guide), mapped through [Partner Code Maps](/books/logistics/transportation-edi#partner-code-maps) into the exception's cause; the partner's own code is kept beside it, because the carrier's reason is a claim.
- **The exception holds the evidence.** The events, positions, readings and messages that opened it and that resolved it are linked, because exceptions become detention invoices, claims ([Cargo Claims](/books/logistics/cargo-claims)) and chargeback disputes months later.

## Telling the Customer

The recipients of freight notifications are mostly businesses: the shipper's customer service team, the consignee's receiving dock, the shipper's own customer, the carrier's dispatcher. Each wants different news on a different channel:

- **The consignee's dock** wants to know before the window passes that a truck won't make it, and a new time, so it can move the door and the labor. The appointment change itself is a dock scheduling transaction (Yard Management & Dock Scheduling owns it).
- **The shipper** wants exceptions with a cause and a plan, often as an outbound 214 with an appointment status (AB for a delivery appointment) and a reason code ([The 214 Shipment Status](/books/logistics/transportation-edi#the-214-shipment-status)), a webhook, a portal, or email to a team.
- **The shipper's customer,** a store or a plant, wants the current range and a tracking link ([Sharing the Timeline](/books/logistics/visibility-and-tracking#sharing-the-timeline)).
- **The carrier** wants to know that the broker sees the problem and what it needs (a new ETA, a reason, a recovery plan) before it gets a phone call.

Notifications are triggered by exception and ETA events, not written inline in the rule evaluator, and every one goes through the playbook's [One Outbound Gate](/docs/building-blocks/notifications#one-outbound-gate), which checks consent, suppression, quiet hours in the recipient's zone and frequency caps; urgent templates bypass quiet hours by configuration, never by a caller's flag. A scheduled message is re-checked when it's due: a "running late" message for a load that delivered in the meantime is dropped ([Event-Triggered, Re-Checked at Send Time](/docs/building-blocks/notifications#event-triggered-re-checked-at-send-time)). The notification record keeps what it said, including the ETA range it stated and which prediction that came from, because "you told us 10:30" is the first line of most disputes, and the next notification's decision reads the last one told ([The Message Log](/docs/building-blocks/notifications#the-message-log)).

## How to Build It

ETAs and exceptions extend `stops` and read `shipment_events`, and add the prediction history, the exception rules, the exceptions and their transitions, and the notification record. Tracking sessions and the arrival choice are in [Visibility & Tracking](/books/logistics/visibility-and-tracking#how-to-build-it).

```sql
CREATE TABLE stop_etas (                  -- every prediction for a stop, append-only
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  stop_id           UUID NOT NULL REFERENCES stops (id),
  source            TEXT NOT NULL CHECK (source IN ('carrier', 'visibility_provider',
                      'own_model', 'dcsa', 'iata', 'manual')),
  provider_party_id UUID REFERENCES parties (id),  -- which carrier or network, for external ones
  eta               TIMESTAMPTZ NOT NULL,
  eta_low           TIMESTAMPTZ,           -- the range, when the source states one or this system computes it
  eta_high          TIMESTAMPTZ,
  coverage          NUMERIC(3, 2) CHECK (coverage > 0 AND coverage < 1),  -- e.g. 0.80
  predicted_at      TIMESTAMPTZ NOT NULL,  -- when the source computed it
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  basis_position_at TIMESTAMPTZ,           -- device time of the position it was computed from
  model_version     TEXT,                  -- own_model: the model and parameters
  inputs            JSONB,                 -- own_model: HOS clocks, route, dwell assumptions
  event_id          UUID REFERENCES shipment_events (id),  -- the message an external ETA came in
  CHECK (eta_low IS NULL OR (eta_low <= eta AND eta <= eta_high)),
  CHECK ((eta_low IS NULL) = (eta_high IS NULL)),
  CHECK (source <> 'own_model' OR model_version IS NOT NULL)
);
CREATE INDEX ON stop_etas (stop_id, predicted_at DESC);

CREATE TABLE exception_rules (            -- rules as data, versioned
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_key          TEXT NOT NULL,         -- stable across versions, e.g. 'acme_late_delivery_risk'
  version           INT NOT NULL,
  owner_party_id    UUID NOT NULL REFERENCES parties (id),  -- whose operations run it
  kind              TEXT NOT NULL CHECK (kind IN ('late_pickup', 'late_delivery_risk',
                      'missed_appointment', 'no_tracking', 'stale_tracking', 'off_route',
                      'dwell', 'temperature', 'hold', 'os_and_d')),
  customer_party_id UUID REFERENCES parties (id),  -- scope; null means any
  carrier_party_id  UUID REFERENCES parties (id),
  facility_id       UUID REFERENCES facilities (id),
  mode              TEXT,                  -- a loads.mode value, or null
  precedence        SMALLINT NOT NULL,     -- lower wins when several rules match
  params            JSONB NOT NULL,        -- thresholds: grace, hours quiet, corridor meters
  severity          TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ack_within        INTERVAL,              -- escalate if not acknowledged in time
  escalate_to       TEXT,                  -- a queue or role
  notify            JSONB NOT NULL DEFAULT '[]',  -- recipient roles, channels, templates, policy
  auto_resolve      BOOLEAN NOT NULL DEFAULT TRUE,
  valid_during      TSTZRANGE NOT NULL,
  approved_by       UUID,
  UNIQUE (rule_key, version),
  EXCLUDE USING gist (rule_key WITH =, valid_during WITH &&)  -- needs btree_gist
);

CREATE TABLE shipment_exceptions (        -- one condition someone has to act on
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  kind              TEXT NOT NULL CHECK (kind IN ('late_pickup', 'late_delivery_risk',
                      'missed_appointment', 'no_tracking', 'stale_tracking', 'off_route',
                      'dwell', 'temperature', 'hold', 'os_and_d')),
  rule_id           UUID REFERENCES exception_rules (id),  -- null when opened by hand
  load_id           UUID REFERENCES loads (id),
  stop_id           UUID REFERENCES stops (id),
  shipment_id       UUID REFERENCES shipments (id),
  severity          TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged',
                      'resolved', 'cancelled')),
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  condition_at      TIMESTAMPTZ NOT NULL,  -- when the condition began, by event time
  last_seen_at      TIMESTAMPTZ NOT NULL,  -- the latest evaluation that still found it
  opened_by_event_id UUID REFERENCES shipment_events (id),
  eta_id            UUID REFERENCES stop_etas (id),  -- the prediction that put it at risk
  owner_user_id     UUID,                  -- the person working it
  owner_queue       TEXT,
  ack_due_at        TIMESTAMPTZ,
  acknowledged_at   TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,           -- when it closed, resolved or cancelled
  cause             TEXT CHECK (cause IN ('carrier', 'shipper', 'consignee', 'facility',
                      'weather', 'customs', 'equipment', 'other', 'unknown')),
  partner_reason_code TEXT,                -- as the partner sent it, e.g. an AT702 code
  resolution        TEXT CHECK (resolution IN ('recovered', 'rescheduled', 'delivered_late',
                      'reassigned', 'claim_opened', 'false_positive', 'condition_cleared',
                      'load_cancelled')),
  resolution_note   TEXT,
  CHECK (load_id IS NOT NULL OR shipment_id IS NOT NULL),
  CHECK ((status IN ('resolved', 'cancelled')) = (resolved_at IS NOT NULL)),
  CHECK (status <> 'resolved' OR resolution IS NOT NULL)
);
CREATE UNIQUE INDEX shipment_exceptions_one_open_idx
  ON shipment_exceptions (kind, COALESCE(stop_id, load_id, shipment_id))
  WHERE status IN ('open', 'acknowledged');
CREATE INDEX ON shipment_exceptions (status, severity, opened_at)
  WHERE status IN ('open', 'acknowledged');

CREATE TABLE shipment_exception_transitions (  -- every status change, append-only
  exception_id      UUID NOT NULL REFERENCES shipment_exceptions (id),
  seq               INT NOT NULL,
  from_status       TEXT,
  to_status         TEXT NOT NULL,
  actor_type        TEXT NOT NULL CHECK (actor_type IN ('user', 'rule', 'system')),
  actor_id          UUID,
  event_id          UUID REFERENCES shipment_events (id),  -- what cleared or changed it
  note              TEXT,
  at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (exception_id, seq)
);

CREATE TABLE exception_notifications (    -- what was told to whom, and the ETA it stated
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  exception_id      UUID REFERENCES shipment_exceptions (id),  -- null for an ETA update alone
  stop_id           UUID REFERENCES stops (id),
  recipient_party_id UUID NOT NULL REFERENCES parties (id),
  recipient_role    TEXT NOT NULL CHECK (recipient_role IN ('shipper', 'consignee',
                      'shipper_customer', 'carrier', 'internal')),
  contact_ref       TEXT NOT NULL,         -- the contact point, or a partner connection
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'edi_214', 'webhook',
                      'portal', 'phone')),
  template_key      TEXT NOT NULL,
  template_version  INT NOT NULL,
  stated_eta_id     UUID REFERENCES stop_etas (id),
  stated_low        TIMESTAMPTZ,           -- the range as shown, in case rendering rounded it
  stated_high       TIMESTAMPTZ,
  stated_status     TEXT CHECK (stated_status IN ('on_time', 'at_risk', 'late', 'recovered')),
  idempotency_key   TEXT NOT NULL UNIQUE,  -- subject, purpose, occurrence
  gate_decision     TEXT NOT NULL CHECK (gate_decision IN ('send', 'defer', 'block')),
  gate_reason       TEXT,
  message_log_id    UUID,                  -- the playbook's message log entry
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at           TIMESTAMPTZ
);
CREATE INDEX ON exception_notifications (stop_id, recipient_party_id, created_at DESC);

ALTER TABLE stops
  ADD COLUMN shown_eta_id UUID;            -- the prediction chosen to show, not always the newest
ALTER TABLE stops ADD CONSTRAINT stops_shown_eta_fkey
  FOREIGN KEY (shown_eta_id) REFERENCES stop_etas (id) NOT VALID;
ALTER TABLE stops VALIDATE CONSTRAINT stops_shown_eta_fkey;
```

External ETAs arrive as `shipment_events` with code `eta_updated` and classifier `estimated` (a 214's G62 17, a DCSA `EST` event, a network's estimate), and each becomes a `stop_etas` row pointing at the event; the model's own predictions are written straight to `stop_etas` with their inputs. The stop's `shown_eta_id` changes only through the choice rule above, which emits `stop.eta_changed` when the shown range moves past the display threshold.

The exception queue an operations lead opens first, by severity and age, with how long each has waited:

```sql
SELECT x.severity, x.kind, l.number AS load_number, s.sequence AS stop,
       x.owner_queue, x.owner_user_id, x.status,
       now() - x.condition_at AS open_for,
       x.ack_due_at < now() AND x.status = 'open' AS overdue_ack,
       e.eta_low, e.eta_high, s.appointment
FROM shipment_exceptions x
LEFT JOIN loads l ON l.id = x.load_id
LEFT JOIN stops s ON s.id = x.stop_id
LEFT JOIN stop_etas e ON e.id = x.eta_id
WHERE x.status IN ('open', 'acknowledged')
  AND l.owner_party_id = $1
ORDER BY array_position(ARRAY['critical', 'high', 'medium', 'low'], x.severity),
         x.condition_at;
```

ETA accuracy by source and horizon over the last 90 days, which is what the choice rule and the confidence ranges are tuned from. A horizon is how far ahead of the actual arrival the prediction was made; each prediction is scored against the arrival the system chose:

```sql
SELECT e.source,
       CASE
         WHEN s.arrived_at - e.predicted_at < interval '2 hours'  THEN '0-2h'
         WHEN s.arrived_at - e.predicted_at < interval '8 hours'  THEN '2-8h'
         WHEN s.arrived_at - e.predicted_at < interval '24 hours' THEN '8-24h'
         ELSE '24h+'
       END AS horizon,
       count(*) AS predictions,
       percentile_cont(0.5) WITHIN GROUP (
         ORDER BY abs(extract(epoch FROM s.arrived_at - e.eta)) / 60) AS median_abs_error_min,
       percentile_cont(0.9) WITHIN GROUP (
         ORDER BY abs(extract(epoch FROM s.arrived_at - e.eta)) / 60) AS p90_abs_error_min,
       avg((s.arrived_at BETWEEN e.eta_low AND e.eta_high)::int)
         FILTER (WHERE e.eta_low IS NOT NULL) AS range_hit_rate
FROM stop_etas e
JOIN stops s ON s.id = e.stop_id
WHERE s.arrived_at IS NOT NULL
  AND e.predicted_at < s.arrived_at
  AND s.arrived_at > now() - interval '90 days'
GROUP BY 1, 2
ORDER BY 1, 2;
```

`range_hit_rate` against each source's stated `coverage` is the calibration check: a source claiming 80% ranges with a hit rate of 0.55 is overconfident. The same residuals, `s.arrived_at - e.eta` grouped by lane, mode, source and horizon, are what `Interval` reads.

Design notes:

- **Predictions are append-only.** A new ETA is a new row; the history of what each source predicted, and when, is the input to accuracy measurement and the answer to "when did you know it would be late?"
- **Rule evaluation is idempotent.** Evaluators run on events (a new ETA, a stale-session tick, a reefer reading) and on a schedule for silence; each run either opens, refreshes or resolves, and the partial unique index makes a duplicate open a no-op ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Thresholds live in `params`, validated.** Each kind has a schema for its parameters, checked when a rule version is saved, and a rule is tested against past loads before it goes live ([Testing Rules](/docs/building-blocks/rules-as-data#testing-rules)).
- **Notifications are keyed by occurrence.** The idempotency key is the exception or stop, the purpose and the status or ETA occurrence, so a redelivered event or a retried job doesn't send twice ([Idempotency](/docs/requests/idempotency)).
- **Emit what others need.** `stop.eta_changed`, `exception.opened`, `exception.escalated` and `exception.resolved` feed the customer portal, outbound 214s, carrier scorecards and billing (detention starts from `dwell`).

## Auditing

- **Every prediction,** with its source, when it was computed and received, its range and, for the system's own model, the model version and inputs, so a "you knew and didn't tell us" complaint can be answered from what was known at each time.
- **Every rule version,** its scope, thresholds, approver and validity, and for every exception the version that opened it.
- **Every exception's life,** each transition with its actor (a user, a rule, the system), the evidence that opened and cleared it, the stated cause and the partner's own reason code.
- **Every notification,** whether the gate sent, deferred or blocked it and why, and the range and status it stated; detention, OTIF and claim disputes turn on what a party was told and when ([What a Record Holds](/docs/building-blocks/audit-trails#what-a-record-holds)).

## What This Means for the System You Build

- **Compute truck ETAs with hours of service and facility hours,** not drive time alone; take the driver's clocks from the ELD feed.
- **Store every prediction with its source, age and range,** append-only, and score each source by horizon against the chosen arrival.
- **State a range with a coverage,** from residual percentiles by lane, mode, source and horizon, and check that the ranges hold.
- **Choose the shown ETA by rule:** actuals first, stale ones out, the best-measured fresh source for the horizon.
- **Write exception rules as versioned data** with scope, thresholds, severity, owners and recipients; record which version opened each exception.
- **Run exceptions as a workflow** with one open record per condition, acknowledgment deadlines, escalation, self-resolution on the record, and cause kept separate from symptom.
- **Notify on changes that matter to the recipient,** through the outbound gate, re-checked at send time, recording the range each message stated.

## References

**Regulations**

- [49 CFR 395.3: Maximum driving time for property-carrying vehicles](https://www.law.cornell.edu/cfr/text/49/395.3), 10 consecutive hours off, the 14-hour window, 11 hours of driving and the 30-minute interruption after 8 hours of driving

**Standards**

- [DCSA EVENT_DOMAIN 1.0.4 (SwaggerHub)](https://api.swaggerhub.com/domains/dcsaorg/EVENT_DOMAIN/1.0.4), the ACT, PLN and EST event classifiers
- [NMFTA Digital Standards: API catalog](https://dsdc.nmfta.org/apis), delay reasons and updated arrival times in LTL Pickup Request and Visibility, exception alerts in LTL In-Transit Visibility, and early delay flags in FTL In-Transit Visibility 1.1.0

**Implementation guides**

- [C.H. Robinson: LTL Carrier X12 214 implementation guide](https://www.chrobinson.com/en//en-US/-/media/ChRobinson/documents/carrier-specs-docs/CHR%20LTL%20Carrier%20X12-214.pdf), G62 qualifier 17 Estimated Delivery Date, AT702 reason codes (NS or the late reason code list, 86 codes) and AT703 appointment statuses AA and AB

**Vendors**

- [project44: Shipment webhook data](https://developers.project44.com/api-reference/api-docs/shipment-webhook-data), `estimateDateTime` and `estimateLastCalculatedDateTime` on events, the legacy `arrivalEstimate` with `estimatedArrivalWindow`, `externalArrivalEstimate` with a source, and exceptions with category, reason, status and timeline
- [project44: FTL appendix](https://developers.project44.com/guides/shippers/visibility/ftl/appendix), "All Event Types can sometimes return an ETA or ATA"
- [Samsara: RouteStopEtaUpdated event](https://developers.samsara.com/docs/routestopetaupdated), a beta webhook; the stop ETA while en route, scheduled arrival and the on-time windows before and after it
- [Samsara: RouteStopEarlyLateArrival event](https://developers.samsara.com/docs/routestopearlylatearrival), a beta webhook; early or late arrival status and deviation in minutes
- [Samsara: RouteStopArrival event](https://developers.samsara.com/docs/routestoparrival), HOS clocks and duty status on stop arrival payloads
- [Mapbox: Directions API](https://docs.mapbox.com/api/navigation/directions/), vehicle height, width and weight restrictions and traffic-aware durations "based on historical travel data and live traffic"
- [FourKites: Real-time visibility](https://www.fourkites.ai/platform/real-time-visibility), ML-powered ETAs from GPS data, check-call history and network patterns, Dynamic ETA, exception detection and disruption reason tags
- [Trucker Tools: Load tracking](https://www.truckertools.com/brokers/load-tracking/), running-late statuses and email alerts, off-route alerts, out-of-range alerts for a likely missed pickup, and pings every five minutes
