+++
title = "Visibility & Tracking"
description = "How freight is tracked: milestones, ELD and app pings, check calls, tracking sessions, facility geofences, and one event timeline across sources and modes."
category = "Logistics & Supply Chain Industry"
order = 2836
part = "Data and Visibility"
tags = ["logistics", "visibility", "tracking", "geofences", "telematics", "events"]
+++

Visibility is knowing where freight is and what has happened to it, from a source other than a phone call. A shipper wants to know that the truck arrived at the plant, left with the goods, is 300 miles out and will make the 8 a.m. dock appointment; a broker wants the same thing for 2,000 loads at once, on carriers it doesn't control; a consignee wants to know which trucks will be in its yard tomorrow morning. The facts come from a dozen places: a carrier's X12 214 status messages, an ELD vendor's GPS feed the carrier authorized, a driver's phone, a visibility network that aggregates all of those, an ocean carrier's Track & Trace events, an airline's status messages, a railroad's car events, and a dispatcher typing in what a driver said on the phone. Each reports in its own vocabulary and time zone, at its own rate, late and sometimes twice.

The hard part is not getting positions; it's turning several partial, delayed and conflicting reports into one timeline that a detention invoice, an on-time scorecard and an angry customer can all be answered from. A geofence says the truck reached the gate at 13:52, the driver tapped "arrived" at 13:58 and the carrier's 214 says 14:05: one of those becomes the stop's arrival, and the other two stay on file. This chapter covers the milestones every mode reports, where positions come from, the tracking session that scopes them, arrival and departure at facilities, building one timeline across sources and across the ocean, rail and air legs of a journey, sharing it, and the tables. What happens with the timeline once it exists (predictions, late-running rules, telling the customer) is [ETAs & Exception Management](/books/logistics/etas-and-exceptions). The parcel and shipper view of tracking (normalized parcel statuses, WISMO) is Commerce's [Tracking Events](/books/commerce/shipping-and-carriers#tracking-events).

## How the Platforms Do It

Visibility is sold by networks that aggregate carriers, by telematics vendors whose devices are in the trucks, and defined by standards bodies for the messages between them. As of November 2026, from their developer documentation, help pages and published guides:

| Platform or standard | Where positions come from | How updates reach a subscriber | Event model | Notes |
| --- | --- | --- | --- | --- |
| **C.H. Robinson** (as a consumer of LTL and dray 214s) | The carrier's X6 "En Route to Location" check calls | X12 214, version 4010, one location per message | X3, AF, X1, CD (LTL) or D1 (dray), plus OA and I1 for dray gate moves | Wants in-transit updates "every 15 minutes" and statuses "Ideally within 15 minutes of the event"; times are local |
| **DCSA Track & Trace** (ocean standard) | Carrier and terminal systems | Query or subscription callbacks | Shipment, transport and equipment events, each classified ACT, PLN or EST | Covered in [Ocean Shipping](/books/logistics/ocean-shipping) |
| **Descartes MacroPoint** | Driver app, ELD/GPS provider, the carrier's TMS by API or CSV, or manual entry in the portal | Portal and integrations | Load tracking sessions | ELD+ combines telematics and app data in one session; claims a network of "435,000+ carriers, logistics providers and drivers" |
| **FourKites** | "One portal pulls in every telematics provider you use" | Not publicly documented | Not publicly documented | Public developer documentation not found; see the note below |
| **Geotab** | The device's GPS records (`LogRecord`) | `GetFeed` polling with a version token | Raw records, no load concept | "The server does not track your position" |
| **NMFTA Digital Standards** | Carrier systems | API standards: LTL In-Transit Visibility 1.0.0, LTL Pickup Request and Visibility 1.0.0, FTL In-Transit Visibility 1.1.0 | Milestones, exceptions, delay reasons | FTL visibility supports on-demand and event-driven updates |
| **project44** | Carrier connections, keyed by an equipment identifier: `MOBILE_PHONE_NUMBER`, `VEHICLE_ID`, `LICENSE_PLATE` or a sensor device ID | Webhook to a URL the subscriber defines | Unified payload with `events`, `positions`, `states` and `exceptions`; FTL event types include `ARRIVAL_AT_STOP`, `DEPARTURE_FROM_STOP`, `TRACKING_START`, `TRACKING_END_DUE_TO_TIMEOUT` and `DRIVER_DENY_TRACKING` | Events and positions arrive ascending by occurrence; states' "Order is not guaranteed"; positions "may be down-sampled" |
| **Samsara** | The vehicle gateway's GPS | Stats feed polled with a cursor; webhooks for `GeofenceEntry`, `GeofenceExit`, `RouteStopArrival` and `RouteStopDeparture` (all four beta) | Addresses with a circle or polygon geofence; route stops with states | Wait "a minimum of 5 seconds" when the feed has no next page |
| **Trucker Tools** | Driver app, SMS or WhatsApp ("All that's required is the driver's phone number"), ELD integrations | Portal and integrations | Load tracking with alerts | "location pings every five minutes" |

FourKites' API documentation isn't public, so its callback types are known only from third-party guides, which this volume doesn't rely on. <!-- source-gap: logistics-visibility-and-tracking-fourkites-api | missing | FourKites callback types and delivery mechanics | closes with: a public FourKites developer or help-center page describing callbacks | checked: 2026-11-22 -->

Four patterns:

- **Tracking is a session, not a stream.** project44 starts and ends tracking with events (`TRACKING_START`, `TRACKING_END_BY_USER`, `TRACKING_END_DUE_TO_TIMEOUT`) and holds a shipment in `ACTION_REQUIRED` when the carrier, equipment identifier or appointment windows are missing; MacroPoint says it will "only gather and post location data for the duration of the specified tracking session." Each session has a method, a start, an end and a reason it ended, and positions outside it aren't the shipper's business.
- **Two sources beat one.** MacroPoint's ELD+ pairs ELD pings with app confirmations so that one source covers when the other "stops reporting," and the comparison surfaces "conflicting locations and other anomalies"; Trucker Tools takes ELD integrations and phone-number tracking. The playbook's rule is the same: keep sources separate and treat disagreement as a fact ([Combining Sources](/docs/building-blocks/location-tracking#combining-sources)).
- **Positions and milestones are separate streams.** project44's payload separates `positions` from `events`; Samsara's stats feed carries GPS while route-stop webhooks carry arrivals; a 214 separates X6 check calls from X3 and X1 arrivals. Positions are high-rate measurements; milestones are a few business facts per stop.
- **Networks push, telematics is polled.** Visibility networks and the DCSA standard deliver to the subscriber's endpoint; Geotab and Samsara bulk feeds are read with a cursor. The ingestion side of both is [Logistics APIs & Standards](/books/logistics/logistics-apis#visibility-networks), with [Receiving Webhooks](/books/logistics/logistics-apis#receiving-webhooks) and [Polling Feeds](/books/logistics/logistics-apis#polling-feeds).

## Milestones

A milestone is a business fact at a place: arrived at the pickup, departed loaded, arrived at the consignee, delivered, gated out of a terminal, loaded on a vessel. Every channel reports the same few, in different words, and the core model's `shipment_events.code` is the one vocabulary they map into ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)):

| Milestone | Core `code` | X12 214 (AT701) | DCSA | project44 FTL |
| --- | --- | --- | --- | --- |
| Arrived at pickup | `pickup_arrived` | X3 Arrived at Pickup Location | | `ARRIVAL_AT_STOP` at a pickup stop |
| Departed pickup with the freight | `picked_up` | AF Departed Pickup Location | | `DEPARTURE_FROM_STOP` at a pickup stop |
| In transit, at a position | `position` | X6 En Route to Location | | A `positions` entry |
| Arrived at delivery | `delivery_arrived` | X1 Arrived at Delivery Location | | `ARRIVAL_AT_STOP` at a delivery stop |
| Delivered | `delivered` | CD Departed Delivery Location (C.H. Robinson LTL, Harris Teeter) or D1 Completed Delivery (C.H. Robinson dray) | | `DELIVERY` |
| Out of and into a terminal or ramp gate | `gate_out`, `gate_in` | OA Out Gate, I1 In Gate (C.H. Robinson dray) | Equipment events `GTOT`, `GTIN` | |
| Loaded on or discharged from a vessel or train | `loaded`, `discharged` | | Equipment events `LOAD`, `DISC` | |
| Vessel or train departed, arrived | `departed`, `arrived` | | Transport events `DEPA`, `ARRI` | |
| A new estimate | `eta_updated` (classifier `estimated`) | G62 qualifier 17 Estimated Delivery Date | Any event classified `EST` | `estimateDateTime` on an event |

Three things make the mapping harder than the table:

- **The same code means different things.** "Delivered" is CD for some partners and D1 for others, and some carriers send both. The map is per partner, per source and per field, with validity dates, and lives in [Transportation EDI](/books/logistics/transportation-edi#how-to-build-it)'s [Partner Code Maps](/books/logistics/transportation-edi#partner-code-maps); the 214 itself is [The 214 Shipment Status](/books/logistics/transportation-edi#the-214-shipment-status). An unmapped code becomes an `exception` event with its `source_code`, never a dropped message.
- **A partner's minimum is a contract.** C.H. Robinson's LTL guide says "At a minimum C.H. Robinson must receive the X3 & AF for every Pick Up location and X1 & CD for every Delivery location," one location per 214, with in-transit X6 updates every 15 minutes. A carrier's scorecard measures compliance against exactly that list, so the system records which expected milestones never arrived, not only the ones that did.
- **Local time without a zone.** The same guide says the AT7 date and time "are local time. No adjustments should be made for time zones," with time code `LT`. The receiver converts using the time zone of the facility the stop names, not the server's and not the carrier's office, and keeps the reported zone for display (`reported_tz`). An X6 in a city with no facility record is converted using the zone of the city and state in its MS1 segment, and the guide insists that sending latitude and longitude "does not replace the requirement for sending city/state in the MS1."

Classification matters as much as code. DCSA classifies every event as `ACT` (actual), `PLN` (planned) or `EST` (estimated); ONE Record's `eventTimeType` qualifies an event's time with values such as "actual" and "planned"; project44 carries `plannedDateTime`, `estimateDateTime` and the actual `dateTime` on one event. In the core model these become `shipment_events.classifier`. Only actual events move a stop's state; planned ones are the appointment, and estimates feed the prediction history in [ETAs & Exception Management](/books/logistics/etas-and-exceptions#how-to-build-it).

## Where Positions Come From

A position report reaches a shipper or broker by one of six methods, each with its own failure mode:

| Method | How it works | Fails when |
| --- | --- | --- |
| **ELD or telematics integration** | The carrier authorizes a visibility network, or the broker directly, to read its ELD vendor's GPS feed for the truck on the load ([Telematics Beyond the Log](/books/logistics/electronic-logging-devices#telematics-beyond-the-log)) | The wrong truck number is on the load, the carrier revokes the connection, or a tractor swap isn't recorded |
| **Driver app** | The driver installs the network's or broker's app and accepts tracking for the load | The app is killed, permissions are revoked, the phone dies, or the driver declines |
| **Phone number** | The network texts the driver a link and locates the phone once the driver accepts (Trucker Tools offers SMS and WhatsApp) | The number is wrong, the driver never answers, or the phone leaves the truck |
| **Visibility provider** | A network delivers positions and milestones it gathered by any of the above | The network can't connect to the carrier (project44's warning "Carrier out of network") |
| **EDI 214 or carrier API** | The carrier reports check calls (X6) and milestones from its own systems; LTL and parcel carriers report terminal scans | The carrier batches messages or reports only milestones |
| **Manual check call** | A broker's or shipper's rep calls the driver or dispatcher and types in the answer | Always partly: it's a person's statement, hours apart |

The rates differ by orders of magnitude. A telematics feed can be read almost continuously (Samsara's vehicle stats feed asks a poller to wait "a minimum of 5 seconds" before the next request only when nothing new is available); Trucker Tools advertises "location pings every five minutes"; C.H. Robinson asks for an X6 every 15 minutes; a manual check call comes only when someone makes it, often hours apart. That spread decides the storage rule: **raw breadcrumbs go in the playbook's `positions` table, partitioned by time, keyed to the vehicle or device, with accuracy and device time ([A Position Is a Measurement](/docs/building-blocks/location-tracking#a-position-is-a-measurement)); `shipment_events` keeps milestones and the check-call positions a partner reported as business statements** (an X6, a dispatcher's call, a network's in-transit event). A broker reading an ELD feed for every truck in transit would otherwise put a row per fix per truck into the table its billing queries read.

The method also decides what consent looks like. A driver can refuse app tracking: project44 reports `DRIVER_DENY_TRACKING`, and MacroPoint's carrier FAQ says "You reserve the right to choose not to participate" while noting that not participating "may impact your ability to do business with your customer." project44 obfuscates mobile phone numbers in its responses, for privacy. The rules for ELD positions (no harassment through ELD data, retention that protects the driver's privacy, reduced precision during personal use) are in [Telematics Beyond the Log](/books/logistics/electronic-logging-devices#telematics-beyond-the-log), and the general consent and retention rules in [Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention). For a broker the practical rule is the session: positions are requested for one load, from tender acceptance or a set lead time before pickup until delivery, and anything the provider sends outside that window is discarded, not stored.

## Tracking Sessions

A tracking session is one source tracking one load for a window: an ELD integration from the carrier's Samsara account for truck 4412, the driver's phone through a network's app, a carrier's 214 feed, or a rep's check calls. A load usually has several, in sequence or in parallel: the ELD session fails because the carrier swapped tractors, and the broker starts an app session; an LTL shipment has the carrier's 214 feed for its whole life and no positions at all.

Sessions have a life cycle the providers expose, and the system mirrors it:

- **Requested.** The broker or shipper asked a provider to track the load, with the carrier, equipment identifier and stops. project44's FTL create call "is necessary before tracking can start"; a shipment missing a carrier, identifier or appointment window goes to `ACTION_REQUIRED`, and a blocked one returns a `WARNING` such as "Invalid identifier" or "Tracking initialization failed."
- **Pending.** Waiting for the driver to accept or the first position to arrive. In project44's beta relaxed-window mode, a shipment stays "untracked until an appointment window is provided for the origin stop."
- **Tracking.** Positions or events are arriving. The session records the time of the last signal, which is what stale-tracking rules read.
- **Ended,** with a reason: completed at delivery, ended by the user, timed out, denied by the driver, failed, or replaced by another session. project44's relaxed mode documents configurable timeouts (30 days with no window, 48 hours after the delivery window ends, 7 days with only an origin window); every provider has some version of this, and the session's end reason is what explains a gap in the timeline later.

A session with no signal is an exception, not an absence: "no tracking" (never started) and "stale tracking" (started, then went quiet) are the two most common visibility exceptions a broker's operations team works, and both are defined in [ETAs & Exception Management](/books/logistics/etas-and-exceptions#exceptions).

## Arrival and Departure at Facilities

Positions become arrivals through geofences. The general rules are the playbook's and apply unchanged: an arrival is a transition from outside to inside computed from track state in device-time order ([Enter and Exit Need Track State](/docs/building-blocks/location-tracking#enter-and-exit-need-track-state)); the subject must stay inside for a dwell before it counts ([Dwell](/docs/building-blocks/location-tracking#dwell)); the exit fence is larger than the entry fence so a truck parked on the boundary doesn't flap ([Hysteresis](/docs/building-blocks/location-tracking#hysteresis)); fences are never smaller than the position accuracy and are shaped per site ([Fence Size and Shape](/docs/building-blocks/location-tracking#fence-size-and-shape)); and a geofence arrival is evidence, not truth ([Evidence, Not Truth](/docs/building-blocks/location-tracking#evidence-not-truth)).

Freight facilities add their own problems:

- **The address is not the dock.** A distribution center's address geocodes to the office; trucks enter at a guard shack a quarter mile away and wait in a yard. The core model stores the truck gate as `facilities.gate`, and the fence is drawn around the gate, yard and dock apron, as a polygon. Samsara's addresses take either a circle with `radiusMeters` or a polygon with "at least 3 vertices and less than 40," and the geocoded center is only a default.
- **Waiting outside is not arriving.** Drivers early for an appointment wait at a truck stop or on the shoulder near the gate. A dwell outside the fence is not an arrival, however close; but a truck that sat outside because the gate wouldn't let it in early is evidence for a detention dispute, so the system keeps the positions and the session, and the stop's arrival stays the gate entry.
- **Arrival, check-in and door are three times.** Rolling into the yard, being checked in at the gate, and backing onto a door can be an hour apart at a busy DC. A geofence sees the first; the facility's yard or dock system records the second and third ([Yard Management & Dock Scheduling](/books/logistics/yard-and-dock) owns them). Detention terms say which one starts the clock, so a stop keeps the event that set its arrival and the basis of that choice.
- **Fences change.** A facility adds a yard, a gate moves, an operations analyst redraws a polygon because arrivals were firing on the highway. A fence is versioned with `valid_during`; arrivals computed under the old fence are not recomputed silently, because invoices were sent on them.
- **Multi-stop and repeat visits.** A truck delivering to two docks of one campus, or returning to the origin to pick up a second load, enters the same fence twice. The state machine is per subject and fence, but the arrival is matched to a stop by the load's stop sequence and appointment, not by the fence alone.

A geofence evaluator that holds that state, with entry and exit radii, a dwell and an accuracy threshold, over fixes for one vehicle in device-time order:

```go tab="Go"
package geofence

import (
	"math"
	"time"
)

type Point struct{ Lat, Lon float64 }

// Fence is one version of a facility's fence, as a circle for brevity.
type Fence struct {
	Center      Point
	EntryRadius float64       // meters
	ExitRadius  float64       // meters, larger than EntryRadius: hysteresis
	Dwell       time.Duration // time inside before an entry counts
	MaxAccuracy float64       // ignore fixes with a worse 95% radius, in meters
}

type Fix struct {
	At       time.Time // device time, when it was measured
	Pos      Point
	Accuracy float64 // meters
}

// State is one subject's state for one fence; it is persisted between batches.
type State struct {
	Inside      bool
	Since       time.Time // when the current state began
	CandidateAt time.Time // first fix inside the entry radius while outside
	LastFixAt   time.Time
}

type Transition struct {
	Kind string    // "enter" or "exit"
	At   time.Time // the time the transition is dated
}

// Step folds one fix into the state. Fixes must arrive in device-time order;
// an older fix is skipped here, and a late batch triggers a replay from positions.
func Step(f Fence, s State, x Fix) (State, *Transition) {
	if !x.At.After(s.LastFixAt) || x.Accuracy > f.MaxAccuracy {
		return s, nil
	}
	s.LastFixAt = x.At
	d := Meters(f.Center, x.Pos)
	switch {
	case !s.Inside && d <= f.EntryRadius:
		if s.CandidateAt.IsZero() {
			s.CandidateAt = x.At
		}
		if x.At.Sub(s.CandidateAt) >= f.Dwell {
			s.Inside, s.Since, s.CandidateAt = true, s.CandidateAt, time.Time{}
			return s, &Transition{Kind: "enter", At: s.Since}
		}
	case !s.Inside:
		s.CandidateAt = time.Time{} // left before the dwell completed: no arrival
	case d > f.ExitRadius:
		s.Inside, s.Since = false, x.At
		return s, &Transition{Kind: "exit", At: x.At}
	}
	return s, nil
}

// Meters is the haversine distance between two points.
func Meters(a, b Point) float64 {
	const r = 6371008.8
	rad := math.Pi / 180
	dLat, dLon := (b.Lat-a.Lat)*rad, (b.Lon-a.Lon)*rad
	h := math.Pow(math.Sin(dLat/2), 2) +
		math.Cos(a.Lat*rad)*math.Cos(b.Lat*rad)*math.Pow(math.Sin(dLon/2), 2)
	return 2 * r * math.Asin(math.Sqrt(h))
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};

#[derive(Clone, Copy)]
pub struct Point { pub lat: f64, pub lon: f64 }

/// One version of a facility's fence, as a circle for brevity.
pub struct Fence {
    pub center: Point,
    pub entry_radius: f64, // meters
    pub exit_radius: f64,  // meters, larger than entry_radius: hysteresis
    pub dwell: Duration,   // time inside before an entry counts
    pub max_accuracy: f64, // ignore fixes with a worse 95% radius, in meters
}

pub struct Fix { pub at: DateTime<Utc>, pub pos: Point, pub accuracy: f64 }

/// One subject's state for one fence; persisted between batches.
#[derive(Clone, Default)]
pub struct State {
    pub inside: bool,
    pub since: Option<DateTime<Utc>>,
    pub candidate_at: Option<DateTime<Utc>>,
    pub last_fix_at: Option<DateTime<Utc>>,
}

#[derive(Debug, PartialEq)]
pub enum Transition { Enter(DateTime<Utc>), Exit(DateTime<Utc>) }

/// Folds one fix into the state. Fixes must arrive in device-time order;
/// an older fix is skipped here, and a late batch triggers a replay from positions.
pub fn step(f: &Fence, mut s: State, x: &Fix) -> (State, Option<Transition>) {
    if s.last_fix_at.is_some_and(|t| x.at <= t) || x.accuracy > f.max_accuracy {
        return (s, None);
    }
    s.last_fix_at = Some(x.at);
    let d = meters(f.center, x.pos);
    if !s.inside && d <= f.entry_radius {
        let start = *s.candidate_at.get_or_insert(x.at);
        if x.at - start >= f.dwell {
            s.inside = true;
            s.since = Some(start);
            s.candidate_at = None;
            return (s, Some(Transition::Enter(start)));
        }
    } else if !s.inside {
        s.candidate_at = None; // left before the dwell completed: no arrival
    } else if d > f.exit_radius {
        s.inside = false;
        s.since = Some(x.at);
        return (s, Some(Transition::Exit(x.at)));
    }
    (s, None)
}

/// Haversine distance between two points, in meters.
pub fn meters(a: Point, b: Point) -> f64 {
    let r = 6_371_008.8_f64;
    let (la1, la2) = (a.lat.to_radians(), b.lat.to_radians());
    let (dla, dlo) = ((b.lat - a.lat).to_radians(), (b.lon - a.lon).to_radians());
    let h = (dla / 2.0).sin().powi(2) + la1.cos() * la2.cos() * (dlo / 2.0).sin().powi(2);
    2.0 * r * h.sqrt().asin()
}
```

The entry is dated at the first fix inside the entry fence, not the fix that completed the dwell, because the truck was there from then; the exit is dated at the first fix beyond the exit fence, and the previous fix bounds it from below. Both are approximations to within the fix interval, so the transition is stored with the fixes that triggered it. The persisted state, including the time of the last fix, is what lets the evaluator survive a restart; a batch of fixes older than that time (a phone replaying after a dead zone) means replaying the subject's positions from the last checkpoint before the batch, not folding the old fixes in.

## One Timeline Across Sources

Every stop ends up with several reports of each milestone. The rules for turning them into one timeline:

- **Keep every report, choose one.** All arrivals for a stop stay in `shipment_events`, deduplicated only on exact repeats (`dedupe_key`). The stop's `arrived_at` is set from the one the system trusts, and the stop records which event that was and why ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)). Overwriting the 214's time with the geofence's loses the carrier's claim, which is exactly what a detention dispute argues about.
- **Precedence is data, by facility and partner.** My default order for an arrival: the facility's own gate or yard record, then a geofence entry with dwell, then the driver's tap in an app, then the carrier's reported milestone, then a manual check call. The order is a rule with validity dates, because a facility whose yard system goes live jumps to the top from that day ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), and the decision records which rule chose ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Disagreement is a finding.** A carrier's X1 forty minutes after the geofence entry is ordinary reporting lag, inside my default review threshold (45 minutes, in the sketch below); a driver tap from 20 miles away, or a CD with no position near the consignee all day, is a fraud or quality signal for review, never something to resolve by picking a winner quietly ([Combining Sources](/docs/building-blocks/location-tracking#combining-sources)). These mismatches are inputs to the controls in [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud).
- **Order by event time, never regress.** A late X3 arriving after the AF doesn't move the load back to "at pickup." State follows `occurred_at`; an event older than the current state is recorded and applied only to history ([Ordering](/docs/architecture/events#ordering)). project44 promises events and positions in ascending order but says of states "Order is not guaranteed," so even one provider's messages need this.
- **Measure lateness from the two clocks.** `received_at` minus `occurred_at` per partner and per source is the reporting latency, the number behind "ideally within 15 minutes." It belongs on the carrier scorecard ([Logistics Metrics](/books/logistics/logistics-metrics)), and it decides how long an exception rule waits before calling a milestone missing ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).

### Ocean, Rail and Air in the Same Timeline

An import moves as several loads: a pre-carriage dray in the origin country, one or more vessel legs with transshipments, a rail or truck on-carriage, and a final dray, each a load in the core model linked to the shipment with its leg number (`load_shipments.leg`). Their events come from different sources, and the shipment's timeline is the union across legs:

- **Equipment events fan out.** An ocean carrier's `GTOT`, `LOAD` and `DISC` are about a container, not a shipment. They attach to `equipment_id` and the load the container rode, and reach every shipment in it through `load_shipments`; a consolidated container carries many shipments from many shippers, so the fan-out is a query, not a copy. The DCSA event model and its mapping are in [Ocean Shipping](/books/logistics/ocean-shipping#the-dcsa-standards).
- **Transport events are about the vessel.** `DEPA` and `ARRI` describe a vessel at a port call; they move every container on board. Estimated vessel arrivals (`EST`) are predictions, and feed the ETA history rather than the timeline.
- **Rail car events and ramp events** arrive as rail EDI or railroad APIs ([Waybills, Interchange and Car Events](/books/logistics/rail-freight#waybills-interchange-and-car-events)); the event that starts a ramp's storage clock is "available," with its own occurred and received times ([Domestic and International Intermodal](/books/logistics/intermodal-and-drayage#domestic-and-international-intermodal)).
- **Air events can be partial.** A consignment can fly as two parts on two flights, and ONE Record flags a partial event with `partialEventIndicator` and the recorded piece count. A shipment has departed only when departures cover every piece; the status codes and the mapping are in [Air Cargo](/books/logistics/air-cargo#status-messages-and-one-record).
- **LTL and parcel report scans, not positions.** Terminal arrivals and departures, out for delivery and OS&D exceptions come from the carrier's network ([Pickup, Delivery and Exceptions](/books/logistics/ltl-networks#pickup-delivery-and-exceptions); the carrier-side scan model is in [Parcel Networks](/books/logistics/parcel-networks#sortation-and-the-sort-plan)).

What a reader sees is one ordered list per shipment: each actual milestone with its leg, place, source and the time in the place's zone, and the current estimate for each future one. What a builder stores is many sources per milestone, per leg, with the choice recorded.

## Sharing the Timeline

Shippers share tracking with their customers, brokers with shippers, and carriers with brokers; each hop narrows what is shown. Samsara's live sharing links come in three kinds (by asset, by location, by recurring route) and take an optional `expiresAtTime`; "If not provided then link will never expire," so my rule is to always set it, to the end of the stop's window plus a margin. A link is a bearer token scoped to one load or stop, live only while the freight is on the way to that recipient, and shows the stop, status and ETA, never the driver's name or phone number ([Shareable Tracking Links](/docs/building-blocks/location-tracking#shareable-tracking-links)). Inside a multi-tenant platform the same rule applies between tenants: a broker shows its shipper the loads that shipper tendered, never the truck's other loads that day ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

## How to Build It

Visibility extends `shipment_events` and `stops`, and adds the tracking session, the facility's fences and the per-subject fence state. High-rate positions go in the playbook's `positions` table, with `subject_type` `vehicle` for an ELD or gateway and `device` for a driver's phone. Ingestion of partner messages, the connections they arrive on and their raw payloads belong to [Logistics APIs & Standards](/books/logistics/logistics-apis#visibility-networks) (`partner_connections`, `inbound_webhook_deliveries`, `feed_cursors`) and [Transportation EDI](/books/logistics/transportation-edi#partner-code-maps) (`partner_code_maps`).

```sql
CREATE TABLE tracking_sessions (          -- one source tracking one load for a window
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id            UUID NOT NULL REFERENCES loads (id),
  method             TEXT NOT NULL CHECK (method IN ('eld_integration', 'driver_app',
                       'phone_number', 'visibility_provider', 'edi_214', 'carrier_api',
                       'manual_check_call')),
  provider_party_id  UUID REFERENCES parties (id),  -- the network, ELD vendor or carrier
  equipment_id       UUID REFERENCES equipment_units (id),  -- the tractor or trailer tracked
  device_ref         TEXT,                  -- a vault reference for a phone number or app install
  provider_ref       TEXT,                  -- the provider's shipment or session ID
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collection_window  TSTZRANGE NOT NULL,    -- when positions may be collected for this load
  started_at         TIMESTAMPTZ,           -- the first signal
  last_signal_at     TIMESTAMPTZ,           -- the latest position or event, by device time
  ended_at           TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('requested', 'pending', 'tracking',
                       'ended')),
  end_reason         TEXT CHECK (end_reason IN ('completed', 'ended_by_user', 'timed_out',
                       'driver_denied', 'failed', 'carrier_disconnected', 'replaced',
                       'cancelled')),
  consent_document_id UUID REFERENCES documents (id),  -- the acceptance or authorization
  consent_ref        TEXT,                  -- the provider's consent record, when that's all there is
  replaced_by_id     UUID REFERENCES tracking_sessions (id),
  CHECK ((status = 'ended') = (ended_at IS NOT NULL AND end_reason IS NOT NULL)),
  CHECK (method <> 'eld_integration' OR equipment_id IS NOT NULL)
);
CREATE INDEX ON tracking_sessions (load_id, requested_at);
CREATE INDEX ON tracking_sessions (status, last_signal_at) WHERE status IN ('pending', 'tracking');

CREATE TABLE facility_geofences (         -- a facility's fence, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  purpose          TEXT NOT NULL CHECK (purpose IN ('site', 'gate', 'yard', 'dock')),
  entry_area       GEOGRAPHY(Polygon, 4326) NOT NULL,  -- a circle is stored as its buffer
  exit_area        GEOGRAPHY(Polygon, 4326) NOT NULL,  -- larger: hysteresis
  dwell            INTERVAL NOT NULL,     -- time inside before an entry counts
  max_accuracy_m   REAL NOT NULL,         -- fixes with a worse 95% radius are ignored
  valid_during     TSTZRANGE NOT NULL,
  drawn_by         UUID,                  -- the user who drew or corrected it
  note             TEXT,                  -- why it changed
  CHECK (ST_Covers(exit_area::geometry, entry_area::geometry)),
  EXCLUDE USING gist (facility_id WITH =, purpose WITH =, valid_during WITH &&)  -- btree_gist
);

CREATE TABLE geofence_states (            -- per tracked subject and fence, in device-time order
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('device', 'vehicle')),
  subject_id       UUID NOT NULL,         -- as in the playbook's positions table
  geofence_id      UUID NOT NULL REFERENCES facility_geofences (id),
  inside           BOOLEAN NOT NULL,
  since            TIMESTAMPTZ NOT NULL,  -- when the current state began
  candidate_at     TIMESTAMPTZ,           -- first fix inside while still outside (dwell pending)
  last_fix_at      TIMESTAMPTZ NOT NULL,  -- device time of the last fix folded in
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (subject_type, subject_id, geofence_id)
);

ALTER TABLE shipment_events
  ADD COLUMN tracking_session_id UUID,    -- the session it arrived through
  ADD COLUMN accuracy_m          REAL;    -- the position's 95% radius, when reported
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_tracking_session_fkey
  FOREIGN KEY (tracking_session_id) REFERENCES tracking_sessions (id) NOT VALID;

ALTER TABLE stops
  ADD COLUMN arrived_event_id   UUID,     -- the shipment_events row that set arrived_at
  ADD COLUMN departed_event_id  UUID,
  ADD COLUMN arrival_basis      TEXT,     -- which kind of evidence set it
  ADD COLUMN departure_basis    TEXT,
  ADD COLUMN times_decided_at   TIMESTAMPTZ,  -- when the choice was last made
  ADD COLUMN times_rule_version TEXT;     -- the precedence rule version that chose
ALTER TABLE stops ADD CONSTRAINT stops_arrived_event_fkey
  FOREIGN KEY (arrived_event_id) REFERENCES shipment_events (id) NOT VALID;
ALTER TABLE stops ADD CONSTRAINT stops_departed_event_fkey
  FOREIGN KEY (departed_event_id) REFERENCES shipment_events (id) NOT VALID;
ALTER TABLE stops ADD CONSTRAINT stops_time_basis_check
  CHECK (arrival_basis IN ('facility_system', 'geofence', 'driver_app', 'carrier_report',
    'manual') AND departure_basis IN ('facility_system', 'geofence', 'driver_app',
    'carrier_report', 'manual')) NOT VALID;

CREATE INDEX CONCURRENTLY shipment_events_stop_code_idx
  ON shipment_events (stop_id, code, occurred_at);
CREATE INDEX CONCURRENTLY shipment_events_session_idx
  ON shipment_events (tracking_session_id);

ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_tracking_session_fkey;
ALTER TABLE stops VALIDATE CONSTRAINT stops_arrived_event_fkey;
ALTER TABLE stops VALIDATE CONSTRAINT stops_departed_event_fkey;
ALTER TABLE stops VALIDATE CONSTRAINT stops_time_basis_check;
```

The check on the basis columns passes when they are null, because a `CHECK` that evaluates to null is satisfied; stops without an arrival need no basis. Geofence entries are written as `shipment_events` with source `geofence`, code `pickup_arrived` or `delivery_arrived` (or `arrived` at an intermediate stop), the stop resolved from the load's sequence, and the triggering fixes referenced from the event's position and accuracy; the raw fixes stay in `positions`.

Choosing a stop's arrival from conflicting reports reads the candidates and a precedence that, in a real system, is a versioned rule per facility and partner; here it's inline:

```sql
WITH precedence (source, rank) AS (
  VALUES ('geofence', 1), ('driver_app', 2), ('eld', 2), ('api', 3), ('edi_214', 3),
         ('manual', 4)
), candidates AS (
  SELECT e.id, e.source, e.occurred_at, p.rank,
         min(e.occurred_at) OVER () AS earliest,
         max(e.occurred_at) OVER () AS latest
  FROM shipment_events e
  JOIN precedence p ON p.source = e.source
  WHERE e.stop_id = $1
    AND e.code IN ('pickup_arrived', 'delivery_arrived', 'arrived')
    AND e.classifier = 'actual'
)
SELECT id, source, occurred_at,
       latest - earliest > interval '45 minutes' AS needs_review  -- my illustrative default; data too
FROM candidates
ORDER BY rank, occurred_at
LIMIT 1;
```

The facility operator's own check-in record, which ranks above all of these, arrives through the yard or dock system's integration with source `api`, so in practice the rank is assigned per connection rather than per source; mapping each reporter to a precedence class is part of the connection's configuration ([A Connection Is a Record](/docs/building-blocks/integrations#a-connection-is-a-record)). The update to the stop writes `arrived_at`, `arrived_event_id`, `arrival_basis` and the rule version together, and emits `stop.arrived` through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); a later, better-ranked report reopens the choice, and a changed arrival on an invoiced stop goes to review rather than through.

Loads in transit whose tracking has gone quiet, the query behind the stale-tracking rule:

```sql
SELECT l.id, l.number, l.carrier_party_id,
       max(t.last_signal_at) AS last_signal_at,
       now() - max(t.last_signal_at) AS quiet_for,
       bool_or(t.status = 'tracking') AS any_session_live
FROM loads l
LEFT JOIN tracking_sessions t ON t.load_id = l.id AND t.collection_window @> now()
WHERE l.owner_party_id = $1
  AND l.status IN ('dispatched', 'in_transit')
GROUP BY l.id
HAVING max(t.last_signal_at) IS NULL
    OR max(t.last_signal_at) < now() - make_interval(hours => $2)
ORDER BY last_signal_at NULLS FIRST;
```

A null `last_signal_at` is a load with no tracking at all, which [ETAs & Exception Management](/books/logistics/etas-and-exceptions) treats as its own exception kind.

Design notes:

- **Sessions own the consent.** Every position and event that came through a session points at it, and a session's window bounds what is kept. A provider's positions outside the window are dropped at ingest, and positions are deleted on the playbook's raw-track schedule while milestones are kept as business records ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).
- **Fence state is a cache of a fold.** `geofence_states` can be rebuilt from `positions` and the fence version in force; it exists so the evaluator doesn't rescan, and so a restart resumes from `last_fix_at`. A late batch older than that time triggers a replay for that subject and fence.
- **Fences never rewrite history.** A new fence version applies to fixes from its `valid_during`; a stop decided under an old version keeps its event, and a deliberate recomputation is an explicit job with its own audit entry.
- **Events are statements, positions are measurements.** A partner's X6 with a city and state is a statement and goes in `shipment_events` with source `edi_214`; a gateway's GPS fix is a measurement and goes in `positions`. The geofence turns measurements into statements of this system, with source `geofence`.
- **Equipment changes are events.** A tractor swap or a trailer drop changes which subject's positions mean the load; the session for the old tractor ends with `replaced`, and the new one starts, so a timeline never stitches two trucks together.
- **Emit visibility events.** `tracking.started`, `tracking.ended`, `stop.arrived`, `stop.departed` and `tracking.stale` are what ETAs, exception rules, customer notifications and billing subscribe to.

## Auditing

- **Every report as received.** Each milestone with its source, source code, reported zone, occurred and received times, and the message or payload it came in, so a detention invoice or an on-time chargeback can be tested against what each party said and when.
- **Every choice.** The event that set each stop's arrival and departure, the basis, the rule version and when it was decided, and any reopened decision with the user who confirmed it.
- **Every fence version.** Who drew or changed it, why, and when it was in force, so a disputed geofence arrival can be replayed against the fence that produced it.
- **Every session.** Who requested tracking, the method and provider, the consent or authorization, the window, and why it ended, because a gap in the timeline is either the driver's refusal, a carrier's disconnection or a system failure, and each has a different owner.
- **Who looked.** Access to a vehicle's breadcrumb trail outside operations is access to a driver's whereabouts, and is logged ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Map every source into one milestone vocabulary,** per partner and field, with unmapped codes kept as exceptions rather than dropped.
- **Convert local times with the facility's zone,** and keep the zone the reporter stated.
- **Keep breadcrumbs in `positions` and milestones in `shipment_events`;** promote only derived facts into the business record.
- **Model tracking as sessions** with a method, provider, window, consent and end reason, and drop positions outside the window.
- **Detect arrivals with track state, dwell and hysteresis** on versioned, per-facility polygons drawn around the gate and yard, not the address.
- **Keep every report and choose one** by versioned precedence, recording the event, basis and rule on the stop; flag disagreements instead of hiding them.
- **Order by event time and never regress state;** measure partner latency from received time.
- **Fan container and vessel events out through loads,** and treat partial air events as partial.
- **Share timelines through expiring, scoped links** that show the stop, status and ETA only.

## References

**Standards**

- [DCSA EVENT_DOMAIN 1.0.4 (SwaggerHub)](https://api.swaggerhub.com/domains/dcsaorg/EVENT_DOMAIN/1.0.4), the event classifier codes ACT, PLN and EST (REQ for operations events), transport event codes ARRI and DEPA, equipment event codes, and `eventDateTime` as the local date and time of the event
- [IATA ONE Record: XFSU mapping](https://iata-cargo.github.io/ONE-Record/development/Orchestration/xfsu/), FSU codes as `StatusUpdateEvent` with `eventCode`, `eventDate`, `eventTimeType` (actual, planned) and `partialEventIndicator` with recorded pieces
- [NMFTA Digital Standards: API catalog](https://dsdc.nmfta.org/apis), LTL In-Transit Visibility 1.0.0, LTL Pickup Request and Visibility 1.0.0, FTL In-Transit Visibility 1.1.0 and what each covers, including on-demand and event-driven updates

**Implementation guides**

- [C.H. Robinson: LTL Carrier X12 214 implementation guide](https://www.chrobinson.com/en//en-US/-/media/ChRobinson/documents/carrier-specs-docs/CHR%20LTL%20Carrier%20X12-214.pdf), version 1.6 (4010): X3, AF, X1, CD and X6; the minimum milestones per stop; in-transit updates every 15 minutes and statuses ideally within 15 minutes; one location per 214; AT7 times local with no time zone adjustment; latitude and longitude in L11 not replacing city and state in MS1; G62 qualifier 17 Estimated Delivery Date
- [C.H. Robinson: Dray Carrier X12 214 implementation guide](https://www.chrobinson.com/en//en-US/-/media/ChRobinson/documents/carrier-specs-docs/CHR%20Dray%20Carrier%20X12-214.pdf), version 1.3: X3, AF, X1, D1 Completed Delivery, OA Out Gate and I1 In Gate
- [Harris Teeter: 214 X12 4010 guidelines](https://edi.kroger.com/EDIPortal/documents/Maps/ht/HT_214_X12_4010_Guidelines.pdf), CD Carrier Departed Delivery Location with NS Normal Status

**Vendors**

- [project44: Shipment webhook data](https://developers.project44.com/api-reference/api-docs/shipment-webhook-data), the unified payload's events, positions, states and exceptions, ascending order for events and positions, states' order not guaranteed, positions possibly down-sampled, and the discouraged legacy TL payload
- [project44: Shippers guide](https://developers.project44.com/guides/shippers), tracking all modes "through a single API, using a unified data structure"
- [project44: FTL create shipment](https://developers.project44.com/guides/shippers/visibility/ftl/create-shipment), creating the shipment before tracking can start, carrier and equipment identifier types, appointment windows with a local time zone, relaxed windows and their configurable timeouts
- [project44: FTL available tracking methods](https://developers.project44.com/guides/shippers/visibility/ftl/get-available-tracking-methods), equipment identifier types and phone numbers obfuscated for privacy
- [project44: FTL appendix](https://developers.project44.com/guides/shippers/visibility/ftl/appendix), event types (arrival, departure, tracking start and end, driver denial, missing identifiers and warnings) and state types
- [Samsara: Vehicle stats feed](https://developers.samsara.com/reference/getvehiclestatsfeed), the `endCursor` and `after` cursor, `hasNextPage`, the 5-second minimum wait and GPS fields
- [Samsara: Addresses guide](https://developers.samsara.com/docs/addresses-guide), circle or polygon geofences on addresses and geocoded centers
- [Samsara: GeofenceEntry event](https://developers.samsara.com/docs/geofenceentry), a beta webhook; the payload's address, geofence circle radius and polygon of at least 3 and fewer than 40 vertices
- [Samsara: GeofenceExit event](https://developers.samsara.com/docs/geofenceexit), a beta webhook
- [Samsara: RouteStopDeparture event](https://developers.samsara.com/docs/routestopdeparture), a beta webhook
- [Samsara: RouteStopArrival event](https://developers.samsara.com/docs/routestoparrival), a beta webhook; stop arrival and departure operations, stop states and actual arrival time
- [Samsara: Create live sharing link](https://developers.samsara.com/reference/createlivesharinglink), link types by asset, location and recurring route, and `expiresAtTime` with links that never expire when it's omitted
- [Geotab: Data feed guide](https://developers.geotab.com/myGeotab/guides/dataFeed), `toVersion` and `fromVersion`, the server not tracking the client's position, saving the checkpoint after processing, and GPS `LogRecord` data
- [Descartes MacroPoint](https://www.macropoint.com/), the network of 435,000+ carriers, logistics providers and drivers
- [Descartes MacroPoint: Carrier FAQs](https://macropoint.com/faqs/), tracking by app, ELD/GPS provider, TMS by API or CSV, or manual entry in the portal; data only for the tracking session; the right not to participate
- [Descartes MacroPoint: ELD+](https://macropoint.com/features/eld-plus/), "ELD and mobile app tracking within a single tracking session", a second signal when one stops, and surfacing conflicting locations
- [Trucker Tools: Load tracking](https://www.truckertools.com/brokers/load-tracking/), SMS and WhatsApp tracking from a phone number, pings every five minutes and ELD integrations
- [FourKites: Real-time visibility](https://www.fourkites.ai/platform/real-time-visibility), one portal for telematics providers and ML-powered ETAs; no public API documentation found
