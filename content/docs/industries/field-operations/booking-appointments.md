+++
title = "Booking Appointments"
description = "Promising a visit: arrival windows, slot search, online booking, holds, AI voice agents and lead sources, rescheduling, notifications, double-booking."
category = "Field Operations Industry"
order = 1508
part = "Scheduling and Routing"
tags = ["field-operations", "scheduling", "appointments", "booking", "concurrency"]
+++

An appointment is a promise with a time on it, and in field service it's made through more doors than in almost any other business: a customer service rep on the phone, a homeowner on the website at midnight with no hot water, a Google ad's booking button, a door-to-door rep on a porch, a technician offering the next visit from a driveway, an AI voice agent answering after hours, and the [recurring scheduler](/docs/industries/field-operations/recurring-schedules) booking thousands of visits overnight. All of them want the last open slot on Thursday morning, and all of them have to respect the same [territories, skills and capacity](/docs/industries/field-operations/territories-and-capacity). Booking is hard for three reasons: the promise is a window, not a time, because the visit before it can run long; the slot has to be held while a customer signs and pays, without being lost or double-sold; and every later change (reschedule, cancellation, a sick technician) has to keep the promise, the route and the customer's notifications in agreement.

## Arrival Windows

Field service customers are rarely given a start time. They get an **arrival window**: the period in which the technician is supposed to arrive. ServiceTitan's windows are presets assigned per business unit, can't run past midnight (a custom window on the job handles that), and become mandatory with capacity planning: "every new or rescheduled job must have an arrival window." Housecall Pro offers windows from none up to four hours, starting at the time the job is placed on the calendar, with a per-job override.

Salesforce separates the promise from the plan in the data model. A service appointment carries `ArrivalWindowStartTime` and `ArrivalWindowEndTime` (what the customer was told) separately from its scheduled start and end (what the optimizer planned), and its booking API takes an `exactAppointment` flag that "specifies whether the result uses exact appointments or an arrival window." That separation is the design to copy. The scheduled time moves every time the route is re-optimized; the arrival window moves only when someone tells the customer. Store the window as the customer heard it, a local date and times plus the property's time zone, and compute instants from it when you need them ([Time](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)).

Window width is a business choice with a measurable cost. A narrow window pleases the customer and pins the route; a wide one absorbs a long previous job and lets the optimizer work. ServiceTitan says its route optimizer is "less effective for businesses that give smaller arrival windows (2-3 hours), or that only run 1-3 jobs per day." The trades differ: a recurring pest or pool customer often accepts "Tuesday, anytime" because nobody needs to be home; a furnace repair needs an adult at the door and a window of two to four hours; a commercial account's SLA may promise a response time instead of a window; a delivery customer expects a narrower window than any of them. My default: offer narrow windows where route density is high and wider ones in sparse territories, and track on-time arrival against the window per territory so the choice gets revisited.

## How Slots Are Found

Slot search is the [availability engine](/docs/industries/field-operations/territories-and-capacity) run forward over a range of days, and the platforms take noticeably different approaches.

| Platform | How slots are offered | What decides them |
| --- | --- | --- |
| **Salesforce Field Service** | `AppointmentBookingService.GetSlots` returns slots, sortable by grade or date | Operating hours define the slot structure; the scheduling policy's work rules and objectives grade each slot |
| **Oracle Field Service** | Direct assignment, or quota by time slot or booking interval, chosen per capacity area | Remaining quota and qualified workers |
| **Timefold** | Time window recommendations for a requested visit | The existing plan; the accepted visit is optimized afterward |
| **Jobber** | Online booking slots by booking interval | Earliest availability, drive time limit, buffer time, team member availability |
| **Housecall Pro** | Flexible times or specific start times | Earliest availability and employees marked available for booking |
| **ServiceTitan Scheduling Pro** | Online or call-center scheduler | Zones, job type mapping, business hours, capacity, buffers, blocked dates |

Salesforce's flow is the clearest public one. `GetSlots` takes the appointment, a scheduling policy and an operating hours record that "represents various slots offered to the customer during appointment booking (for example, Mondays 9 to 11 AM, 11 AM to 1 PM...)," and returns available slots without scheduling anything. After the customer picks one, the code sets the arrival window and calls `ScheduleService`, which "performs resource locking and collision detection" and can, with sliding and reshuffling on, let "a higher-priority incoming appointment ... cause an existing appointment to be dropped." Recurring visits have their own call, `getRecurringAppointmentsSlots`, which returns up to three sets of options for a whole weekly series.

Grading slots, not just listing them, is where the money is. A slot that adds four minutes of driving to a route already in the neighborhood is worth far more than one that sends a truck across town, and an operator wants the first offered first. Jobber approximates this with a drive time limit that offers slots near the day's other bookings. Timefold's recommendations return a narrow window ("a specific afternoon slot instead of 'the first week in February'") and optimize the accepted visit later, so "the customer doesn't need to stay on the phone to wait for the optimized solution."

The general pattern: compute candidate slots from availability and capacity, score each by the marginal cost of inserting the visit into the current plan (added travel, lost flexibility, preferred technician), offer the best few, and re-optimize after acceptance. Don't run a full [route optimization](/docs/industries/field-operations/route-optimization) inside a customer's page load.

## Online Booking

Self-service booking narrows what the customer may choose, because the customer doesn't know the business's constraints.

- **Jobber** forms book either an assessment or a job, never both on one form, with controls for earliest availability, booking interval, drive time limit and buffer time. When several team members are free, "Jobber assigns one at random."
- **Housecall Pro** has three modes: flexible scheduling, specific start times, or manual, where the booking creates an unscheduled job for the office. Each employee can be marked "Available for booking," and when nothing fits the customer can send a request instead (below). Reserve with Google embeds the form in the business's Google profile.
- **ServiceTitan Scheduling Pro** requires zones, job type mapping and business hours, offers buffers and blocked dates, and runs in Online Booking or Call Center mode.

Three design points follow. Offer only work whose duration and requirements are predictable: a pool opening, a quarterly pest service, a standard cleaning or a furnace tune-up books well online; a "no cooling" call books as a diagnostic visit of fixed length, with the repair priced on site from the flat-rate pricebook ([Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules)); a whole-home repipe or a system replacement is a request for an estimate. Always have a fallback when no slot fits, because a lead captured beats a visitor lost. And treat lead time and buffers as capacity policy, not form settings: the same "no same-day bookings" rule should apply to the portal and the voice agent.

## Requests and Holds

Two things can sit between a customer's wish and a scheduled visit, and they're opposites: a request is demand without a slot, a hold is a slot without a commitment.

A **request** asks for service without claiming time. ServiceTitan's Web Appointment Scheduler "allows your customers to submit appointment requests for jobs through your customer portal," and staff book them from the call booking screen. Housecall Pro's "Send request appears automatically whenever no matching time slot is available," and "creates a Lead, not a booking." Model a request as what it is: a work order with no visit yet, or a lead before there's an account at all. Either way it awaits a slot and consumes no capacity.

A **hold** reserves time before the commitment exists. A new customer often books in the middle of something else: [signing an agreement](/docs/industries/field-operations/signing-the-agreement), entering a card, a rep finishing a door-to-door sale, a commercial buyer waiting on a purchase order. Salesforce protects the slot at the moment of scheduling: "to prevent scheduling conflicts," `ScheduleService` "performs resource locking and collision detection." A hold extends that protection backward over the minutes a customer needs to finish.

There are three reasonable places to keep a hold:

| Option | How it works | Tradeoff |
| --- | --- | --- |
| **A visit in `held` with an expiry** | The hold is a visit row under the same overlap constraint as scheduled visits; confirming is a state change on that row | One constraint prevents every conflict; expired rows must be ignored on read and cleaned up |
| **A separate hold table** | Holds are their own rows, checked alongside visits | Keeps visits clean; every availability query and conflict check must read both tables |
| **A cache key with a TTL** | One key per resource and slot that expires on its own | Fast and self-cleaning; the database can't enforce it against visits, and a cache outage drops every hold |

Whichever you choose, three rules apply. Expiry is enforced at read time (an expired hold never blocks availability), so a stalled cleanup job can't leave slots stuck. The expiry is a per-channel policy, not a constant in code: a door-to-door rep finishing a contract needs longer than a web checkout. And converting a hold to a scheduled visit is atomic, so the slot can't be lost between the two.

Holds are also an abuse surface: a script, a competitor or a buggy client can hold every slot in a territory. Cap active holds per session and per customer, and rate-limit hold creation.

![Visit states for booking: a request (a work order or lead with no slot) becomes a scheduled visit when the office books it; a held visit becomes scheduled when the customer confirms. A scheduled visit is dispatched, goes en route, arrives on site and is completed. A hold that expires, or a visit called off, ends cancelled with a reason and who did it; a visit that can't be done on site ends not completed with a reason.](/diagrams/fo-booking-appointments-states.svg "A visit keeps its identity from booking to completion; rescheduling changes its window, never the record. Requests live outside the visit lifecycle until a slot is found.")

## AI Voice Agents and Lead Sources

A growing share of bookings are made by software acting for the business. ServiceTitan's Voice Agent can book jobs, confirm and reschedule, cancel (optionally after retention offers) and book after hours, each enabled at the account level and per job type, and ServiceTitan says to "Set up Adaptive Capacity first before allowing the voice agent to book jobs." Jobber's Receptionist books through the business's Online Booking settings; for actions not turned on, "Receptionist will ask before taking action," and every conversation keeps a summary, recording and transcript.

Both follow the right pattern: the agent books through the same availability and booking rules as the web form, with its permissions scoped per action and per job type. My rule: the voice agent is a client of the booking API with its own identity, never a privileged path around it. It holds a slot while confirming details, writes the transcript and recording reference onto the booking, and hands off to a person when the request falls outside its scope. The general design (tools rather than database access, handoff, evaluations) is in [AI Agents](/docs/architecture/ai-agents); disclosure and recording law is in [Consumer Contact](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai); the field products are surveyed in [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations).

Lead marketplaces book too. Google Local Services Ads charge for "a booking request from a customer (United States and Canada only)" like any other valid lead, and partner FSMs receive those bookings directly. An inbound booking from a lead source is a request until your system confirms it against real availability, and it usually arrives as a webhook that may come twice or out of order ([Webhooks](/docs/api-design/webhooks)). Record the channel (`booked_via = 'lead_source'`) and the source's lead ID on the booking: it's how marketing attribution works, and how you dispute a charge for a lead that was never serviceable (outside the territory, or for a trade you don't offer).

## Rescheduling and Cancellation

A reschedule is the same visit with a new window. Keep its identity, so the recurring occurrence, the agreement, the notifications and the history all stay attached ([Recurring Schedules](/docs/industries/field-operations/recurring-schedules) covers identifying an instance of a series). The operation is: find a new slot through the same search, then atomically move the visit, so the old slot is released only when the new one is secured.

Policy differs by who initiated it:

- **Customer-initiated.** Allow self-service changes up to a cutoff (the day before, say), and route later changes to the office. ServiceTitan's voice agent can make retention offers before cancelling.
- **Business-initiated.** Sick technicians and weather move many bookings at once. Keep the arrival window if the reassignment fits it; otherwise the customer must be told and, for recurring work, the occurrence must stay inside its service window. A repair that needs a part not on the truck books a second visit on the same work order, not a new job.
- **Optimizer-initiated.** Re-optimization moves scheduled times constantly. It must not move arrival windows already communicated; ServiceTitan's route optimizer "doesn't move *Confirmed* jobs" and "schedules each job within the indicated arrival window."

Cancellations need a `status_reason` from chapter 1's catalog and, where the agreement says so, a fee. Cancellation fees and their disclosure are consumer-law questions covered in [Consumer Protection](/docs/industries/field-operations/consumer-protection); the booking system's job is to record which policy applied and when the customer was told. A cancelled slot is released immediately and can trigger a waitlist or a backlog pull, since a fresh gap in a dense route is the most valuable capacity of the day.

## Notifications

Every visit state change is a potential customer message. Housecall Pro sends a text and email when a job is scheduled, sends an update "if a change is made to the time it is scheduled for," and again when the assigned employee changes. Derive notifications from visit events, not from UI actions, so a change made by the optimizer, the voice agent or the API notifies the customer exactly as a dispatcher's change would; and debounce, so a dispatcher dragging a job three times sends one message.

Appointment reminders are informational messages under CTIA's principles, and still need the customer's consent for that purpose. Capture it at booking, per channel, into the consent ledger and send through the one outbound gate described in [Notifications](/docs/architecture/notifications); the TCPA side is in [Consumer Contact](/docs/compliance/consumer-contact). The field message lifecycle (confirmations, reminders, on-my-way, completion reports) is in [Customer Communications](/docs/industries/field-operations/customer-communications).

## Idempotency and Double-Booking

Two failure modes matter, and they need different defenses.

**The same request twice.** A mobile app on a weak connection retries a booking; a lead source's webhook is delivered twice; a voice agent's tool call times out and repeats. Each must produce one visit. Require an idempotency key on every booking-creating request, store it with the result, and return the stored result on a retry; Stripe's API is the reference design, and [Idempotency](/docs/payments/idempotency) has the pattern. For lead sources, the source's own lead ID is a natural key.

**Two requests for the same slot.** The call center and the portal both book Bob for Thursday at 9. Checking availability and then inserting is a race. Make the database refuse the second write. PostgreSQL's range types and exclusion constraints do exactly this: `EXCLUDE USING GIST (room WITH =, during WITH &&)` "will reject overlapping ranges only if the meeting room numbers are equal," using the `btree_gist` extension for the equality part.

This sketch picks the first hold option from the table above, a visit row in `held`, because the volume's visit states already include `held`; with a separate hold table, the same constraint goes on that table and every availability read checks both. The canonical `visits` table in [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model) already holds the arrival window (local start and end plus the property's zone), the assigned `resource_id`, the status and `hold_expires_at`; booking adds only the columns below, and assumes one resource per visit for brevity (with a `visit_assignments` table, the range and the constraint live on the assignment row). `occupied_during` is the planned time on site as UTC instants, maintained by the booking service from the local window, the zone and the job's duration whenever any of them changes, so the promise stays local and the overlap check gets the range it needs:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE visits
  ADD COLUMN occupied_during TSTZRANGE,       -- planned time on site, closed-open; derived
  ADD COLUMN booked_via      TEXT NOT NULL CHECK (booked_via IN ('portal', 'csr',
                               'ai_agent', 'lead_source', 'technician', 'office',
                               'system')),
  ADD COLUMN idempotency_key TEXT NOT NULL,
  ADD CONSTRAINT visits_tenant_id_idempotency_key_key UNIQUE (tenant_id, idempotency_key),
  ADD CONSTRAINT visits_occupied_during_excl EXCLUDE USING GIST (
    resource_id WITH =,
    occupied_during WITH &&
  ) WHERE (status IN ('held', 'scheduled', 'dispatched', 'en_route', 'on_site'));
```

Every visit gets a `booked_via`, including the ones no customer asked for: `system` for visits the recurring generator or an optimizer creates, and `office` for visits a dispatcher creates without a customer request (a second visit for a held work order, say), while `csr` is a rep booking on a customer's behalf and `ai_agent` matches the channel name used for cancellations. System-created visits use a deterministic idempotency key, such as the occurrence ID.

The partial `WHERE` clause means cancelled and finished visits stop blocking the slot. An expired hold still has status `held` until something cancels it, so the safe form is a conditional update that cancels expired holds (`status_reason = 'expired'`) in the same transaction as the new insert.

Two refinements. When booking against a window rather than an exact time (the common case), the per-resource constraint doesn't capture capacity: three bookings in a 9-to-12 window for a team are fine if the team can serve three. For slot-count capacity, count against a ledger row with a conditional update (`UPDATE capacity_ledger SET used = used + 1 WHERE tenant_id = $1 AND scope_id = $2 AND service_on = $3 AND slot = $4 AND used < capacity_limit`, the ledger from [Territories & Capacity](/docs/industries/field-operations/territories-and-capacity#how-to-build-it)) in the same transaction as the insert; zero rows updated means the slot filled. And when the visit must also reach a vendor's API (a Salesforce or ServiceTitan instance), the database constraint protects only your copy: use the vendor's own scheduling call, which does its own locking, and treat a conflict response as a normal outcome with a fresh slot search. Isolation and locking choices are in [Transactions & Concurrency](/docs/database/transactions-and-concurrency).

Bookings that can't be decided synchronously (a lead-source booking that needs office review, a multi-day install that needs a crew on consecutive days) should be accepted as **requests** and answered later: an HTTP 202 with a request ID, then a `visit.scheduled` event when a slot is found, or a decline. Because a request is a work order or lead rather than a visit, it never blocks capacity, and the response stays honest about what was promised.

## Auditing

Bookings are the record of what the business promised, and they end up in complaints, chargebacks and lead-billing disputes. What's specific to booking:

- **The promised window and every change to it,** with the actor (customer, rep, voice agent, optimizer, integration) and channel. A "you never showed up" dispute is answered by the window that was promised and the messages that announced each change.
- **AI bookings**: the call or chat ID, transcript and recording references, the slots offered and the one chosen, and any handoff. If a caller disputes what the agent agreed to, this is the evidence.
- **Lead source and lead ID**, for attribution and for disputing lead charges.
- **Cancellation and reschedule reasons with the policy and any fee applied,** since fee disputes and [chargebacks](/docs/industries/payments/disputes-and-chargebacks) turn on whether the policy was disclosed and followed.

Record structure, typed actors and recording automated decisions are in [Audit Trails](/docs/architecture/audit-trails); field retention periods are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Store the arrival window separately from the scheduled time,** as local time plus the property's zone. Optimizers move the plan; only a customer notification moves the promise.
- **Grade slots by marginal route cost.** Offer the best few quickly and optimize after acceptance.
- **Run every channel through one booking API.** Portal, call center, rep app, lead sources and AI agents share availability, rules and permissions.
- **Book only predictable work online;** diagnostics book as fixed-length visits, large jobs as estimate requests.
- **Choose a hold store deliberately.** Whichever you pick, enforce expiry on read, convert atomically, and cap and rate-limit holds.
- **Accept undecidable bookings as requests.** Return 202 and answer with an event, rather than promising what isn't checked.
- **Keep a visit's identity through reschedules,** and release the old slot only when the new one is secured.
- **Let the database refuse double-booking** with an exclusion constraint per resource, plus a conditional capacity counter for window-based slots.
- **Require idempotency keys** on every booking-creating request, and use lead sources' IDs as natural keys.
- **Derive notifications from visit events** and debounce them; capture messaging consent per channel at booking.

## References

**Reference**

- [PostgreSQL: Range Types](https://www.postgresql.org/docs/current/rangetypes.html), exclusion constraints that prevent overlapping reservations, combined with equality through `btree_gist`
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), saved responses for retried keys and parameter mismatch errors
- [CTIA: Messaging Principles and Best Practices (2023)](https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf), appointment reminders as informational messages needing consent for that purpose

**In practice**

- [Salesforce: Field Service Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), `GetSlots`, arrival window fields, `ScheduleService` resource locking and collision detection, recurring appointment slots
- [Oracle Field Service: Activity booking overview](https://docs.oracle.com/en/cloud/saas/field-service/faaca/c-activitybookingoverview.html), booking methods per capacity area
- [Timefold: Time window recommendations](https://docs.timefold.ai/field-service-routing/latest/recommendations/recommendations), offering narrow windows while the customer is on the phone and optimizing afterward
- [ServiceTitan: Set up arrival windows](https://help.servicetitan.com/docs/set-up-arrival-windows.md), preset windows per business unit, no spanning midnight, mandatory with capacity planning
- [ServiceTitan: Set up Scheduling Pro](https://help.servicetitan.com/docs/set-up-your-online-scheduler-with-scheduling-pro-in-servicetitan-max.md), online and call-center booking, zones, buffers and blocked dates
- [ServiceTitan: Configure voice agent settings](https://help.servicetitan.com/docs/configure-your-voice-agent-settings-in-servicetitan), per-action and per-job-type booking permissions, Adaptive Capacity dependency and retention offers
- [ServiceTitan: Optimize technician route](https://help.servicetitan.com/docs/use-optimize-technician-route), confirmed jobs left in place, jobs kept within arrival windows, and less benefit with narrow windows
- [ServiceTitan: Customer portal overview](https://help.servicetitan.com/docs/customer-portal-overview.md), appointment requests through the Web Appointment Scheduler, booked by staff
- [Housecall Pro: Setting your arrival window](https://help.housecallpro.com/en/articles/918018-setting-your-arrival-window), window options starting at the scheduled time
- [Housecall Pro: Online booking settings](https://help.housecallpro.com/en/articles/7034474-new-online-booking-settings), booking modes, employees available for booking, "Send request" creating a lead when no slot fits, Reserve with Google
- [Housecall Pro: Customer notifications overview](https://help.housecallpro.com/en/articles/357613-customer-notifications-overview), scheduled-job notifications resent when the time or employee changes
- [Jobber: Online booking](https://help.getjobber.com/hc/en-us/articles/13808363916951), booking intervals, drive time limits, buffers and random assignment
- [Jobber: Receptionist](https://help.getjobber.com/hc/en-us/articles/25315927533847), AI booking through online booking settings, approvals, summaries, recordings and transcripts
- [Google: Local Services Ads charges](https://support.google.com/adwords/answer/7195435), booking requests charged as valid leads in the US and Canada
