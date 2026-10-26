+++
title = "Dispatch & the Day of Service"
description = "Running the day: dispatch consoles, visit states, same-day exceptions, live ETA links, geofence arrivals, telematics, weather, customer updates, escalation."
category = "Field Operations Industry"
order = 1511
part = "Scheduling and Routing"
tags = ["field-operations", "dispatch", "telematics", "tracking", "operations"]
+++

[Route Optimization](/docs/industries/field-operations/route-optimization) produces a plan. Dispatch is what happens to it once technicians start their trucks. By mid-morning on most days a technician has called in sick, a water heater install has run two hours long, two customers weren't home, a restaurant's walk-in cooler has failed under a four-hour response contract, a part isn't on the truck, and a storm is building over the west side of the branch. The optimizer wrote the first draft; the dispatcher keeps it true for the rest of the day, and the customer judges the company by whether anyone told them what changed.

What makes dispatch hard is that it's real-time work on shared state: the office, the technician's app, the optimizer, telematics devices and the customer's phone all change the same visits at once, over unreliable networks. The system's job is to make each change fast, valid and visible, and to remember all of it.

## The Dispatcher's Day

The title varies (dispatcher, scheduler, route coordinator, the office manager in a small shop) but the work has three phases:

- **Before the day:** review tomorrow's routes, fix what the optimizer couldn't know, confirm technicians, trucks and parts for scheduled repairs and installs, and publish. A pre-day check that lists confirmed visits still unassigned or missing something (a part, a gate code, a credential) catches problems while there's time to fix them.
- **During the day:** absorb changes, insert urgent work, answer the field, keep customers informed, and escalate what can't be fixed.
- **After the day:** close routes, chase visits that weren't completed, and make sure the work behind every `not_completed` visit returns to the pool with a reason.

Bringg's guidance for its operations managers sums up the posture: **manage by exception**. Nobody can watch two hundred technicians. The console's job is to surface the handful of visits that need a person and stay quiet about the rest.

## How the Platforms Do It

Every major platform has a dispatch console, and they converge on the same three panes (a list or tray of work, a timeline per technician, and a map) while differing in how much the system decides on its own.

| Console | Panes and actions | Automation |
| --- | --- | --- |
| Salesforce Field Service Dispatcher Console | Appointment list; Gantt with appointments, absences, breaks, travel and crews; map; KPI bar including appointments in jeopardy | Scheduling policy per console, Customer First by default; switch policy for storms or emergencies |
| Dynamics 365 schedule board | Drag and drop over resources (people, contractors, equipment) and a map with routes | Manual, a scheduling assistant, or the RSO add-on, including intraday and emergency runs |
| SAP FSM planning board | Drag and drop; Find Matching Technicians ranks candidates with each one's earliest valid slot | Fill Schedule, Rearrange Schedule, and autoscheduling on events or schedules |
| ServiceTitan Daily Dispatch Board | Technician rows by team, a job tray (Unassigned, Alerts, Dispatched and more), status colors, live map | Dispatched, Working and Done appointments can't be reassigned; late appointments outlined in red |
| Spoke Dispatch | Plans, stops and routes | A distributed plan is read-only; changes go through the live plans API to re-optimize and redistribute |
| Onfleet and Bringg | Task and order boards with drag-and-drop assignment | Onfleet's team auto-dispatch keeps a driver's tasks and interleaves new ones; Bringg's AutoDispatch assigns on-demand orders as they arrive |

Trades consoles are built around technicians and jobs of uneven length, delivery boards around many short stops assigned as orders arrive. Three ideas recur and are worth taking whichever you start from:

- **Locks follow progress.** ServiceTitan won't reassign Dispatched or Working appointments; Spoke makes a distributed plan read-only except through its live-plan path. Once a technician or customer has been told something, changing it is a deliberate act, not a side effect of a drag.
- **Policies are switchable.** Salesforce ships default policies (Customer First for an average day, High Intensity for surges such as storms, Emergency) and lets a dispatcher change the console's policy when the day changes. The rules for a calm Tuesday are wrong for the morning after a hailstorm or the first 100-degree day of an HVAC summer.
- **Urgent work has its own path.** Oracle's urgent routing can rearrange routes "even when the mobile worker is already on the way to an activity or in the middle of an activity," and refuses to route an activity whose ETA is past the SLA end minus a configured threshold. Dynamics schedules an urgent job as soon as possible ahead of lower-priority work. An emergency is a different operation from a reshuffle, with different rules about what may be disturbed, and for commercial contracts the SLA clock decides which emergency goes first.

## The Visit's Day

A route is a container; the visit is what moves through the day. Keep its states few, make each transition a recorded event with a source (`visit.dispatched`, `visit.arrived`, `visit.completed` and the rest), and separate states from flags:

![A visit's day as a row of states: scheduled, dispatched, en route, on site and completed, with the path from dispatched to completed highlighted. Above each, what moves it: booking, publishing the route, a tap or a geofence, a check-in or dwell, and captured proof. Dashed paths lead from dispatched, en route and on site to not completed with a reason (not home, no access, weather, unsafe), whose work order returns to the pool, and from scheduled to cancelled. Running late is a flag, not a state.](/diagrams/fo-dispatch-visit-day.svg "Visits move forward through the day or end without the work, and the work goes back to the pool with a reason. Lateness is a flag computed from the ETA, not a state of its own.")

The states are the volume's canonical ones: `held` (a reservation while a customer [books](/docs/industries/field-operations/booking-appointments), rarely seen by dispatch), `scheduled`, `dispatched` (on a published route, so the customer can be told), `en_route`, `on_site` and `completed` (with [proof](/docs/industries/field-operations/proof-of-service)), plus two exits: `not_completed` (the technician got there and nothing could be done) and `cancelled` (called off before the technician left, with who called it off). Both carry a `visits.status_reason`, and which reasons go with which end state (including `completed` with a work order `hold_reason` when anything was done on site) is defined once in [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model).

Dynamics 365 keeps the split between the work and the visit explicit: work orders and bookings have independent lifecycles, and booking transitions drive the work order (Traveling sets it In Progress). Copy that separation. A furnace repair can need a diagnostic visit and a second visit when the part arrives; a visit can fail without the work being cancelled.

**Unassigning** a visit is not **cancelling** the work, the same split Dynamics 365 draws between a booking and its work order. Unassigning ends that visit (`not_completed` if the technician got there, `cancelled` with the company as the actor if they never left) and returns its work order to the pool with the reason; the customer still has work owed and an appointment to rebook. Cancelling the work order ends it.

Each transition is a row, not just a new value on the visit:

```sql
CREATE TABLE visit_events (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  visit_id           UUID NOT NULL REFERENCES visits (id),
  from_status        TEXT,
  to_status          TEXT NOT NULL,         -- scheduled, dispatched, en_route, on_site, completed, not_completed, cancelled
  status_reason      TEXT,                  -- copied to visits.status_reason; same catalog
  source             TEXT NOT NULL,         -- tech_app, dispatcher, geofence, optimizer, customer
  staff_member_id    UUID REFERENCES staff_members (id),  -- null for automated sources
  device_recorded_at TIMESTAMPTZ NOT NULL,  -- when it happened, by the device's clock
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- when the server learned of it
  lat                DOUBLE PRECISION,
  lng                DOUBLE PRECISION,
  device_id          TEXT
);
```

The two clocks matter: a check-in made offline at 9:02 (`device_recorded_at`) can reach the server at 9:40 (`received_at`) ([The Technician App](/docs/industries/field-operations/technician-app)). Order by when it happened, alert on when you learned it, and never let a late-arriving event move a visit backwards past a state a dispatcher has since set by hand; send it to review instead ([Offline Sync](/docs/architecture/offline-sync#two-clocks)).

## Exceptions and Same-Day Changes

Most of a dispatcher's day is a short list of exceptions, each with a known response:

| Exception | What the system should do |
| --- | --- |
| **Technician out** | Release their route; offer to redistribute it across technicians with the right skills and licenses; cancel what doesn't fit (`tech_out`) and return its work to the pool |
| **Visit runs long** | Recompute downstream ETAs; flag visits whose ETA now passes the window; propose a swap or a move |
| **Customer not home, or no access** | Technician picks a reason; the visit ends `not_completed` and its work order returns to the pool; re-optimize that route only |
| **Part not on the truck** | If the technician diagnosed the problem, the visit ends `completed` and the work order stays open with `hold_reason = 'part_needed'`; if nothing could be done, the visit ends `not_completed` with `part_needed`. Either way, order or reserve the part ([Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety)) and book the return visit on the same work order when it's due. It isn't a callback |
| **Driver near an hours limit** | For drivers of commercial vehicles outside the short-haul exception, check remaining drive and on-duty time before inserting or redistributing work ([Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety)) |
| **Urgent or emergency job** | Find technicians who can reach it soonest without breaking pinned or in-progress work, ranked by SLA deadline where one applies; let the dispatcher choose, or auto-insert under an emergency policy |
| **Truck breakdown or crash** | End the technician's route at their current stop; redistribute the rest; open an incident |
| **Customer reschedules by text or portal** | Release and rebook through the booking rules ([Customer Self-Service](/docs/industries/field-operations/customer-self-service)); retract queued reminders |

Run every manual change through the same rules booking and optimization use; FieldRoutes, for one, marks appointments with no matching technician or skill with a red X and won't schedule them. Show only valid drop targets, explain invalid ones ("no termite license in this state", "not backflow certified"), apply moves optimistically, and let the server reject a move that conflicts with someone else's change ([Transactions & Concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency)). A whole-route reassignment is one operation that revalidates every stop, not forty drags. Crews move as a unit: reassigning a cleaning team's house moves all three cleaners' days.

Re-optimize narrowly: re-sequence one technician's unfrozen stops after a cancellation, redistribute across the branch after a sick call. Whole-branch re-runs mid-day reach customers as a stream of changed times. Freezing, pinning and the re-optimization scopes the engines offer are in [Route Optimization](/docs/industries/field-operations/route-optimization#re-optimization-freezing-and-pinning).

## Live Tracking and ETA Links

An arrival window says "between 8 and 12." A live ETA says "22 minutes, here's the truck." Customers value the second far more, and the platforms have converged on how to deliver it:

- **Salesforce's Real-Time Location** in Appointment Assistant notifies the customer when the worker starts traveling and again when they're about a mile or kilometer away, with a map showing location and ETA. The worker's location isn't shared until they mark themselves en route, and the customer stops seeing it after the appointment.
- **ServiceTitan** sends a dispatch notification when the first technician is dispatched and shows distance and ETA only when the address is verified.
- **FieldRoutes'** On My Way text can include a Live Technician View link, and tracking ends at check-in or 90 minutes after the message.
- **Onfleet's** notification triggers include an ETA threshold, a "Driver Arriving" message and a delay threshold.
- **Samsara's** live share link on each route stop needs no login, shows progress, location, status and ETA, and exposes no driver or vehicle personal information.

Building it well:

- **The link is a bearer token.** Anyone who has it sees a moving truck. Make it unguessable, scoped to one visit, and dead when the visit completes or after a maximum lifetime, as FieldRoutes' 90 minutes and Salesforce's end-of-appointment cutoff do. Never put the technician's full name, phone number or the next customer's address on it.
- **Share location only while en route to that customer.** Not before the technician starts toward them, not after they arrive, never between other customers' stops.
- **ETA is drive time plus remaining work.** Drive time from current position to the stop through the routing engine, plus the remaining service time on the current stop if they're not yet en route. Recompute on meaningful position change, not every GPS ping, and smooth it so it doesn't jump around.
- **Lateness is computed, not reported.** When the ETA passes the window end by more than a threshold, flag the visit and send one "running late" message with the new estimate, before the customer has to call.

## Arrival and Departure Detection

Technicians forget to tap "arrived." Geofences fill the gap and keep the tap honest. The standard semantics come from GIS event processing: Esri's GeoEvent defines **ENTER** as a position inside the fence when the previous position from the same track was outside, and requires a position outside before another ENTER counts; **EXIT** is the mirror. Track state is what turns raw positions into events.

Telematics providers send these events (Motive's entry and exit webhook, Samsara's route stop arrival and departure webhooks, Geotab's ZoneStop rules for a device stopped in a zone), tracking APIs such as NextBillion's fire them over polygon, circle or isochrone fences, and Bringg records whether a geofence checked a driver in automatically.

GPS is noisy and parking lots are big, so a geofence that fires on one point will produce phantom arrivals at the neighbor's house. Design for it:

- **Require dwell.** Arrival is "inside for N minutes" or "stopped inside," which is what Geotab's ZoneStop models, not "one point inside."
- **Use hysteresis.** A larger exit fence than entry fence stops a truck parked on the boundary from flapping.
- **Size per property.** A house needs a small fence; a hospital campus, an apartment complex or a farm needs a polygon. Store the fence on the property and let the office correct it.
- **Record the source and keep both.** A geofence arrival is evidence alongside the technician's tap, not a replacement for it. Store each with its source, and when they disagree by a lot (a check-in tapped from three miles away), flag it. Arrival and departure times feed time on site, which feeds pay, time-and-materials billing for repair work, and disputes about whether anyone came.

## Positions From the Vehicle

Positions and geofence events come from the telematics provider; how each vendor delivers them and how to ingest them idempotently is in [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety), with the general mechanics in [Webhooks](/docs/api-design/webhooks). For dispatch, two rules matter: order positions by device time, not arrival time, and join them to technicians through the day's route assignment, because people swap trucks.

Tracking a truck is tracking its driver, and some states regulate it. New Jersey's P.L.2021, c.449 subjects an employer who knowingly uses a tracking device in a vehicle used by an employee without providing written notice to civil penalties of up to $1,000 for a first violation and up to $2,500 for each subsequent one. My rule: give written notice everywhere as a baseline, check the law in each state you operate in, and limit what the console shows to working time.

## Weather and Emergencies

Weather stops outdoor work across an area at once, and some of it is a matter of law, not comfort. The National Weather Service is blunt that "there is no safe place outside when thunderstorms are in the area." Pesticide labels can carry minimum and maximum wind speeds to limit drift, so an exterior application in the wrong wind may be off-label ([Regulated Materials](/docs/industries/field-operations/regulated-materials)). Weather also creates work: a freeze fills plumbers' boards with burst pipes, a heat wave fills HVAC boards with no-cooling calls.

The platforms treat the stopping side as bulk rescheduling: Briostack markets rescheduling "by tech or branches" and texting customers "all at once about last-minute weather delays," and Salesforce's High Intensity policy is meant for "a storm scenario, where employee productivity is your top priority," so the catch-up runs under different rules from a normal day.

Build a **stand-down** as one operation on an area (a branch, zones or a drawn polygon) and a time range:

1. **Stop the affected visits.** Visits whose technician hasn't left yet end `cancelled` with `status_reason = 'weather'` and the company as the actor; a visit stopped on site before any work ends `not_completed` with the same reason, and one where work was done ends `completed` with the work order left open. Leave indoor work alone if the business allows it.
2. **Return the work to the backlog.** The occurrences behind those visits go back to `open` with their service windows intact, so the scheduler and optimizer refill them on later days like any other due work ([Recurring Schedules](/docs/industries/field-operations/recurring-schedules)). Dispatch doesn't pick the new dates by hand.
3. **Notify customers once** that today's visit is off and when they'll hear about the new one, then send the new time when it's booked.
4. **Record it** with the area, time range, who declared it and why, and a lift or extension as its own recorded action.

Run it as a resumable, idempotent job ([Background Jobs](/docs/architecture/background-jobs)). The free NWS API serves active alerts by area; use it to flag branches for a person to decide, because whether work is safe depends on the trade, the product and the site.

## Talking to the Customer

Drive messages from visit events through the one outbound gate that applies consent, channel and quiet hours ([Notifications](/docs/architecture/notifications)); on-my-way and running-late texts are informational messages that still need consent ([Consumer Contact](/docs/compliance/consumer-contact)). What dispatch adds:

- **Message on meaningful change, coalesced.** A visit moving ten minutes within its window isn't news; leaving the window, changing day, or a technician on the way is. A dispatcher rebuilding a route makes many edits in a few minutes, so send one message per affected customer about the final state; ServiceTitan's one-dispatch-notification-per-day option and Housecall Pro's choice to save an optimized route with or without notifications are the same instinct.
- **Retract what's stale.** A cancelled visit's queued reminder must not go out.
- **Route replies to a person.** FieldRoutes turns replies to an on-my-way text into office alerts; "I'm not home today" must reach the dispatcher before the truck does.

The field message lifecycle as a whole is in [Customer Communications](/docs/industries/field-operations/customer-communications).

## Escalation

Exceptions that nobody owns become complaints. Model escalation explicitly:

- **Jeopardy is computed.** Salesforce counts appointments in jeopardy on the console's KPI bar; ServiceTitan outlines late appointments in red with an Alerts tab; Oracle warns when an assignment risks the SLA window. Compute jeopardy from ETAs, windows, SLA deadlines and unacknowledged events (a technician not en route 30 minutes before their next window, say), and show it ranked.
- **Every alert has an owner and a clock.** An unacknowledged jeopardy alert moves up a level (dispatcher, branch manager, regional manager) after a configured time, in business hours for that team, and immediately for a commercial SLA about to be missed.
- **Field-to-office issues become cases.** Damage, a dispute, a safety concern or a customer who wants to cancel needs a case with a type, an owner and a service level, visible on the account; a cancellation the technician hears is captured as [Collections & Retention](/docs/industries/field-operations/collections-and-retention#cancellations) describes.
- **Safety goes straight up.** A crash event from telematics, a technician reporting an injury or an exposure ends that technician's route and pages a manager, regardless of time.

## Auditing the Day

Dispatch is where disputes start. What's specific to it:

- **Every visit transition with its source and both clocks** (`device_recorded_at` and `received_at`) and coordinates, and every assignment change with who moved which visit from whom to whom and why. ServiceTitan's audit trail, Salesforce's service appointment history and eLogii's task history, which can't be edited or deleted, show the expected depth.
- **Stand-downs and emergency insertions** as records with declarer, reason, scope and lift.
- **Location data** under a retention rule and an access log, since it's personal data about employees.
- **The vendor's own record**: ingest Samsara's routes audit-log feed and Geotab's audit feed, because the telematics provider's record is evidence when yours is questioned.

They answer a customer disputing that anyone came, a chargeback for a service "not rendered," a labor claim about unpaid drive time and a missed-SLA credit. Record structure and access logging are in [Audit Trails](/docs/architecture/audit-trails); field retention periods are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **A dispatch console over the domain API** with a work list, per-technician timelines and a map, valid drop targets, optimistic moves with server-side conflict checks, and whole-route and whole-crew operations.
- **Visit states separate from work orders,** with releasing a visit distinct from cancelling the work, one `status_reason` catalog, and every transition stored as an event with its source, device time and server receipt time.
- **Locks that follow progress** and switchable policies for normal days, surges and emergencies, with an urgent-insertion path ranked by SLA.
- **Narrow same-day re-optimization:** changed stops, one route, or redistribution, never a casual whole-branch re-run.
- **Expiring, single-visit tracking links** that share location only while en route, and ETAs from position, the routing engine and remaining work.
- **Geofence arrivals with dwell and hysteresis,** stored as evidence next to the technician's tap.
- **Vehicle positions ordered by device time** and joined to technicians through route assignments, with written notice of tracking.
- **An hours check for commercial drivers** before inserting or redistributing work.
- **Weather stand-downs as one resumable operation** that stops visits, returns occurrences to the backlog with windows intact, notifies customers and records the declaration and lift.
- **Event-driven customer messages** that are coalesced, retracted when stale and routed back to a person.
- **Computed jeopardy, owned alerts with escalation clocks, and cases** for field-to-office issues.

## References

**Specifications**

- [New Jersey P.L.2021, c.449](https://pub.njleg.state.nj.us/Bills/2020/AL21/449_.PDF), written notice before an employer uses a tracking device in a vehicle used by an employee, and its civil penalties
- [CTIA: Messaging Principles and Best Practices (May 2023)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), appointment reminders as informational messages that need the consumer's agreement
- [National Weather Service: API Web Service](https://www.weather.gov/documentation/services-web-api), free active alerts by area

**Reference**

- [National Weather Service: Lightning safety](https://www.weather.gov/safety/lightning-safety), no safe place outside during thunderstorms
- [EPA: Improving labels to reduce pesticide drift](https://www.epa.gov/reducing-pesticide-drift/improving-labels-reduce-pesticide-drift), minimum and maximum wind speeds on labels
- [Esri GeoEvent: Spatial filters](https://gis.dot.ny.gov/hostingny/help/en/geoevent/11.5/analyze/spatial-filters.htm), ENTER, EXIT, INSIDE and OUTSIDE semantics with track state
- [Samsara: Tiered plans for API and webhook access](https://developers.samsara.com/docs/tiered-plans-for-api-and-webhook-access), route stop arrival and departure webhooks and the routes audit-log feed
- [Samsara: Live share links](https://developers.samsara.com/docs/live-share-links), unauthenticated per-stop tracking links without personal information
- [Motive: Webhooks v2](https://developer.gomotive.com/reference/webhooks-v2), geofence entry and exit events
- [Geotab: GetFeed](https://developers.geotab.com/myGeotab/apiReference/methods/GetFeed/), the feed that serves audit and other records
- [Geotab: ExceptionRuleBaseType](https://developers.geotab.com/myGeotab/apiReference/objects/ExceptionRuleBaseType/), ZoneStop rules for stops inside a zone
- [NextBillion: Receive enter and exit events](https://docs.nextbillion.ai/tracking/live-tracking-api/examples/receive-enter-and-exit-events), monitors over polygon, circle and isochrone geofences
- [Bringg: Waypoint object](https://developers.bringg.com/reference/way-points-object), check-in time, coordinates, origin and automatic geofence check-in

**In practice**

- [Salesforce Trailhead: Explore the Dispatcher Console](https://trailhead.salesforce.com/content/learn/modules/field-service-dispatcher-console-for-dispatchers/explore-the-dispatcher-console), appointment list, Gantt, map, KPIs and appointments in jeopardy
- [Salesforce Trailhead: Customize a scheduling policy](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/customize-a-scheduling-policy), Customer First, High Intensity for storm-scale volume and Emergency
- [Salesforce Trailhead: Real-Time Location in Appointment Assistant](https://trailhead.salesforce.com/content/learn/modules/real-time-location-appointment-assistant/get-to-know-real-time-location-in-appointment-assistant), en-route and nearby notifications and location privacy
- [Microsoft Learn: Dynamics 365 Field Service overview](https://learn.microsoft.com/en-us/dynamics365/field-service/overview), the schedule board, its map and three scheduling methods
- [Microsoft Learn: Work order and booking statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), independent work order and booking lifecycles and the side effects of booking transitions
- [Microsoft Learn: Resource Scheduling Optimization overview](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-overview), intraday and emergency scheduling
- [Oracle Field Service: Immediate activity assignment](https://docs.oracle.com/en/cloud/saas/field-service/farcu/c-immediate-activity-assignment.html), urgent insertion ahead of in-progress work and the SLA threshold rule
- [SAP Learning: Implementing scheduling techniques](https://learning.sap.com/courses/managing-sap-field-service-management/implementing-scheduling-techniques), the planning board, Find Matching Technicians and quick planning
- [ServiceTitan: Use the Daily Dispatch Board](https://help.servicetitan.com/docs/use-the-daily-dispatch-board.md), job tray, statuses that can't be reassigned, map and alerts
- [ServiceTitan: Text and email dispatch notifications](https://help.servicetitan.com/docs/enable-text-and-email-dispatch-notifications.md), dispatch notices, arrival tracking and the one-per-day limit
- [FieldRoutes: On My Way notification](https://knowledgebase.fieldroutes.com/docs/on-my-notification.md), Live Technician View and the 90-minute cutoff
- [Onfleet: Notification triggers](https://intercom.help/onfleet-4f83d83093ac/en/articles/16090283-notification-set-up-triggers), ETA, arriving, predicted ETA and delay triggers
- [Onfleet: Team auto-dispatch](https://docs.onfleet.com/reference/team-auto-dispatch.md), keeping assigned tasks and interleaving new ones
- [Bringg: A day in the life of an ops manager](https://help.bringg.com/docs/a-day-in-the-life-of-a-bringg-ops-manager), managing by exception and AutoDispatch
- [Spoke Dispatch: API reference](https://developer.dispatch.spoke.com/api), read-only distributed plans changed through the live-plans API
- [FieldRoutes: An introduction to Intelligent Routing](https://knowledgebase.fieldroutes.com/docs/an-introduction-to-intelligent-routing.md), appointments without a matching technician or skill marked and left unscheduled
- [Housecall Pro: Optimize by Drive Time](https://help.housecallpro.com/en/articles/14093813-optimize-by-drive-time), saving an optimized route with or without customer notifications
- [Briostack: Scheduling and routing software](https://www.briostack.com/pest-control-software/scheduling-routing-software/), rescheduling by technician or branch and SMS updates about weather delays (marketing)
