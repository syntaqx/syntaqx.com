+++
title = "Recurring Schedules"
description = "Turning a cadence into visits: RFC 5545 rules, seasonal rounds, how vendors generate recurring work, service windows, backlog, holidays and make-ups."
category = "Field Operations Industry"
order = 1507
part = "Scheduling and Routing"
tags = ["field-operations", "scheduling", "recurrence", "service-windows", "backlog"]
+++

Most field service revenue repeats. A pool is cleaned every Tuesday, an office is cleaned every weeknight, a furnace is tuned every fall, a lawn gets six or seven treatments in a growing season, a home is treated for pests every quarter, a restaurant's grease trap is pumped every 90 days. The agreement ([Service Agreements & Plans](/docs/industries/field-operations/service-agreements)) promises a cadence, not a list of dates, and the operation has to turn that cadence into dated visits on real routes, months ahead, for tens of thousands of customers at once, while technicians call in sick, customers ask to skip a month, holidays close the office and rain cancels a day of spraying. Generating dates is easy. The hard part is keeping every promise measurable as the plan meets reality: when is the next visit due, is it booked inside the window the agreement allows, and if it was missed, who owes whom a make-up.

## The Vocabulary

Four terms carry the chapter, and most confusion comes from collapsing two of them into one.

- A **recurrence** is the rule: what service, how often, for which property, starting when, ending when. It belongs to an agreement.
- An **occurrence** is one promised instance the rule produces: "the Q3 visit, due August 15." It exists whether or not anyone has scheduled it.
- A **service window** is the range of dates in which the occurrence counts as on time: August 8 to August 22, say. The window, not the due date, is the real promise.
- A **visit** is the scheduled work: a technician, a date and an arrival window. Booking an occurrence creates a **work order**, and one or more visits perform it.

The other distinction that matters is the **anchor**. A schedule-anchored recurrence computes every due date from its start ("the 15th of every third month"), so a late visit doesn't move the next one. A completion-anchored recurrence computes the next due date from when the last visit actually happened ("90 days after the last service"), so lateness compounds. Salesforce Field Service supports both: maintenance plans generate work orders on a calendar, and "floating work orders are created based on when the last work order was completed." Schedule anchoring suits contracts that promise visits per year (an HVAC membership's two tune-ups); completion anchoring suits work where the gap is what matters (a pesticide reapplication interval, a grease trap that fills at a steady rate).

## How the Platforms Generate Recurring Work

Every platform has to decide how far ahead to turn a rule into concrete work. Most answers fall into three families: a rolling horizon of real work, placeholders booked later, or the next visit generated only when the current one closes. Two more appear at the edges: rules per covered asset, and allowances that generate nothing until the customer asks.

| Platform | How recurring work appears | Notable controls |
| --- | --- | --- |
| **Dynamics 365 Field Service** | Agreement booking setups hold a recurrence; booking dates turn into work orders a set number of days ahead | Days in advance; pre and post booking flexibility in days |
| **Salesforce Field Service** | Maintenance plans with maintenance work rules generate work orders in batches | Generation timeframe and horizon; calendar, criteria or usage rules; floating work orders |
| **FieldRoutes** | Due subscriptions enter the Job Pool for routing; seasonal programs are Service Plans made of Service Rounds | Day-count frequencies; seasonal dates; per-round "wait after" |
| **ServiceM8** | Future bookings sit inactive until a lead time before the date, then activate as real jobs | Activation lead time in weeks |
| **FieldPulse** | Agreements create occurrences on a calendar, and a rolling window decides which become jobs | Generation window; per-routine generation rule; due period |
| **GorillaDesk** | The next job is created when the current one is completed or cancelled | Month, condition and frequency exceptions |
| **Skimmer** (pool) | Route assignments: each technician's permanent weekly stops | Permanent changes separate from one-time moves |

**Rolling horizon.** Dynamics is the clearest example, and Microsoft names the tradeoff directly: generate too far in advance and "your backlog of work orders might become larger than desired," too few days and "you might not have time to prepare." Two warnings on the same page apply to every generator. Auto-generated bookings follow the recurrence "without considering any other factors, including if the resource is active or their working hours," so generated work needs the same validation as manual booking. And agreement processes "run with the permissions of their owners. If the owner leaves the organization, agreement processes fail," which argues for running the generator under a service identity.

**Placeholders.** ServiceM8 keeps a recurring booking inactive, with no job number, until a lead time before its date; an inactive booking "can be cancelled without activation" when a client wants to skip. Its auto-routing add-on "will never move a job to a date outside its recurrence date." FieldRoutes recommends scheduling "each appointment once the previous one is marked Completed," handing due work to the Job Pool for its optimizer. It can pre-book the next appointment, or the next two to nine, but says to do that sparingly, for the most valuable customers, because scheduling too many future routes limits what its routing tools can improve.

**On completion.** GorillaDesk creates the next job only when the current one is "Complete or Canceled." That keeps the calendar honest about unclosed work, and it makes long-range capacity invisible.

**Per asset and on demand.** Salesforce's "one work order per asset" method suits equipment contracts (each rooftop unit at a commercial site on its own rule) and multiplies work-order volume. Its usage-based rules (service after a meter reading) suit trades where a meter, not a calendar, decides when work is due. FieldPulse's on-demand agreements "do not generate jobs automatically," and an Unused Visit Policy decides what happens to visits never requested.

AI-native platforms move the date decision into the optimizer. Solea's auto-scheduling places due and new work overnight around drive time, skills, time windows and customer preferences, leaves anything inside a freeze window alone, and sends what it can't place to a job pool. Recurrence there produces demand; the optimizer produces dates. [Route Optimization](/docs/industries/field-operations/route-optimization) covers that half.

![Five generation models compared: a rolling window creates real work a set number of days ahead (Dynamics, Salesforce) but the horizon hides later capacity; due placeholders are booked later (ServiceM8, FieldRoutes) and can pile up unbooked; on-completion creates the next visit after the last (GorillaDesk, FieldRoutes) and one unclosed visit stalls the chain; per-asset rules (Salesforce) multiply work orders; an allowance generates nothing until requested (FieldPulse) and leaves an unused-visit liability.](/diagrams/fo-recurring-schedules-generation.svg "Each model trades schedule visibility against churn. Mature platforms often combine a short window of real visits with placeholders beyond it.")

My default is that combination: occurrences generated a year ahead for capacity planning, real visits only inside a short horizon (two to six weeks, by trade), and completion-anchored services carrying a projected tail that's replaced when each completion lands. A weekly pool or cleaning route is the exception: it's a standing route, and real visits a few weeks out are what the customer expects to see.

## RFC 5545 as the Rule Language

There is a standard for recurrence, and it's worth using rather than inventing columns. [Recurrence: iCalendar](/docs/fundamentals/time#recurrence-icalendar) covers RFC 5545's DTSTART, RRULE, EXDATE and RDATE and why to expand them with a library. Field cadences map onto it cleanly:

```text
Quarterly pest, the 15th:       FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=15
Pool, every Tuesday:            FREQ=WEEKLY;BYDAY=TU
Office cleaning, weeknights:    FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
Biweekly house cleaning:        FREQ=WEEKLY;INTERVAL=2;BYDAY=TH
Last workday of the month:      FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
Mosquito season, every 21 days: FREQ=DAILY;INTERVAL=21;UNTIL=20261015
```

Two RFC details matter more in field service than elsewhere. Instances that land on an invalid date, such as February 30, "MUST be ignored and MUST NOT be counted," which silently skips a month for a plan anchored on the 30th: a customer billed for twelve monthly visits gets eleven unless you use BYMONTHDAY=-1 (the last day). And RECURRENCE-ID identifies a modified instance by its *original* start, with RANGE=THISANDFUTURE applying a change to an instance and everything after.

That last idea is the most useful thing to borrow, even if you never store an RRULE string: **an occurrence is identified by its recurrence and its original due date, never by the date it was eventually booked.** Rebooking the Q3 visit from August 15 to August 19 doesn't create a new occurrence or orphan the old one; it moves the visit that fulfills it. Regeneration can then be idempotent: upsert on (recurrence, original due date), and anything already scheduled, edited or completed is left alone.

RRULE doesn't express what's specific to service work: the window, the anchor, minimum gaps between applications, holiday handling, and a season that restarts yearly. Store those as explicit fields beside the rule.

## Seasonal Programs

Three seasonal shapes cover most residential work, and each stresses the model differently.

**Lawn and plant health rounds.** A lawn program is a sequence of different services (pre-emergent, fertilizer, weed control, winterizer), each in its own date range. FieldRoutes models it as a Service Plan holding ordered Service Rounds, each with a "wait after" period before the next round becomes due, and rounds are permanent once saved: "You can't delete a Service Round after you save it," only opt a customer out. A round is not an interval: round 3 is a different product, constrained both to its date range and to N days after round 2 was actually done, a completion anchor nested inside a calendar anchor.

**Weekly pool and cleaning routes.** Pool service is a route first: the same stops on the same weekday all season. Skimmer calls these route assignments, "a tech's recurring, permanent schedule of service locations," and separates permanent changes (frequency, day, tech, a stop-after date) from one-time moves. Residential and commercial cleaning work the same way, often with the same crew each time because customers want the person they gave a key to. The split matters: an edit to the plan and an edit to one occurrence have different blast radii, and the UI should never make one look like the other.

**Quarterly and seasonal pest, and HVAC seasons.** Pest plans are an interval with a seasonal envelope: FieldRoutes documents frequencies "in days, and multiples of 30 represent months (e.g., 90 = every 3 months)," with seasonal start and end dates. HVAC memberships are the calendar version: a cooling check in spring and a heating check in fall, each with a window of a month or more, because every member wants the visit in the same few weeks and the business needs to spread them.

Day-count and calendar intervals drift apart: four 90-day intervals are 360 days, so a "quarterly" day-count plan creeps five days earlier each year and eventually gives a customer an extra visit. Harmless if the agreement says "every 90 days," a billing problem if it says "four visits a year": store the unit the contract uses.

## Service Windows and Flexibility

The window turns a due date into something a scheduler can optimize. Dynamics fills date windows from pre and post flexibility: monthly maintenance on the 8th with seven days either side "can be scheduled between the first and the 15th of each month." FieldPulse is categorical: it "never books a job outside the due period."

Wider windows give denser routes; narrower ones give predictability. Scale the window with the cadence (a day for weekly pool or cleaning, a week either side for monthly, wider for quarterly and seasonal work) and make it configurable per service type, agreement and customer. Customers add their own constraints on top (preferred, required or blocked days), and FieldRoutes' advice holds everywhere: "Only set these preferences if the customer specifically asks for them," because every preference shrinks the solution space.

Some windows are regulatory rather than commercial. A pesticide label says how often a product may be used, and "the label is the law." When the product sets a minimum reapplication interval, the earliest date in the window is a hard constraint that no customer request or capacity crunch can pull forward. Model it as a minimum gap from the last *completed* application of that product at that site, which is why the scheduler needs the treatment history from [Proof of Service](/docs/industries/field-operations/proof-of-service), not just the plan.

## The Backlog

The **backlog** is the set of occurrences whose window has opened (or passed) with no booked visit. FieldRoutes' Job Pool is the familiar form: "visibility to all customers due for service during a specific date range" who "do not have a future scheduled Appointment," with a filter that can ignore wait-after periods to pull rounds forward.

A healthy backlog isn't empty; it's the inventory the router draws from. What matters is its age profile:

- **`upcoming`**: generated, window not open. Capacity planning input, not work.
- **`open`**: in window, unbooked. The router's working set.
- **`booked`**: a visit is on a route.
- **`missed`**: the window passed without the work done. A broken promise, counted by agreement, branch and service type.

Measure the last one daily and alarm on it. Its growth is the earliest signal of understaffing, a wrong territory boundary or a silently failing generator ([Operating Metrics](/docs/industries/field-operations/operating-metrics)).

## Holidays, Blackouts and Weather

Closures come in three kinds, and they need different handling.

**Planned closures.** Holidays are calendars scoped to territories and resources, kept as data with an owner, as [Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays) describes. ServiceNow assigns location-based holiday schedules to technicians and warns the dispatcher when a shift falls on one. Each plan needs a policy for an occurrence that lands on a closure: shift earlier, shift later, or drop it (a skip, with billing consequences). Commercial cleaning often runs the other way, with extra work scheduled for the day a building is empty.

**Blackouts.** A school during exams, a restaurant during a renovation, a customer on vacation: property-level or occurrence-level exclusions (EXDATEs in RFC terms), each with a reason.

**Weather.** Rain and wind cancel spray and lawn routes the same morning; ice cancels them in winter. Weather is a bulk reschedule: Briostack markets moving appointments "for a whole tech or branch at once" and texting every affected customer. The rained-out visits end with reason `weather` under the end-state rules in [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model). Either way, a rained-out day should return its occurrences to the backlog with windows intact for the router to refill, not leave three hundred visits to rebook by hand.

## Missed Visits and Make-Ups

A visit can end in several ways, and each means something different for its occurrence and the invoice. The visit's status and reason (the catalog in [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model)) and the occurrence's state are separate fields:

| What happened | Visit | Occurrence | Billing |
| --- | --- | --- | --- |
| **Performed** | `completed` | `completed`; next one per the anchor | Bill per the agreement |
| **Customer skipped it** | `cancelled`, `customer_asked`, or never booked | `skipped`, with who asked | Not billed, or credited |
| **No access** | `not_completed`, `no_access` or `not_home` | Back to `open` for a make-up inside the window | No charge, or a trip charge if the agreement allows it |
| **Rained out** | `cancelled`, `weather` (on site: `not_completed`, `weather`) | Back to `open`, same window | Not billed until performed |
| **Business cancelled** | `cancelled`, `tech_out` | Back to `open` | Not billed until performed |
| **Window closed** | none performed | `missed` | Not billed; a make-up is owed or credited |

The no-access charge is a policy choice the agreement states, not a default; the evidence that makes it defensible is in [Proof of Service](/docs/industries/field-operations/proof-of-service#when-the-work-can-t-be-done).

FieldRoutes returns a completely missed appointment to the Job Pool the following day. FieldPulse's Unused Visit Policy either expires visits at the end of the allowance period or banks them into the next: the decision every make-up policy makes, whether a missed visit is owed until the window closes, the period ends, or forever. My default is owed until the next occurrence's window opens, then credited, because a make-up stacked onto the next visit is two treatments too close together for some products and a wasted trip for most services.

Billing reaches the schedule through the work order. A booked occurrence points to its work order, and invoice lines carry `work_order_id` (plus `visit_id` on per-visit lines), so every charge traces back to the promise it paid for. The occurrence generator and the billing run don't call each other; both read the agreement and meet at the work order. Periodic billing still doesn't stop on its own when occurrences are skipped or missed, so the billing run checks for periods with no completed occurrence behind them ([Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service)); a missed, never-made-up visit that was billed anyway is a dispute waiting to happen.

Recurring visits also find work. A tune-up finds a failed capacitor, a pool visit a leaking pump seal, a quarterly service a termite swarm. That work is a new work order, linked to the occurrence that found it but outside the recurrence: it has its own quote, parts and approval, covered in [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation). Keep the link, because "found on maintenance" is how a membership proves its value.

![A recurrence generates occurrences within a horizon as upcoming; when the window opens they are open in the backlog, then booked onto a visit and completed. A visit that is not completed or is cancelled returns its occurrence to open for a make-up; an occurrence the customer asks to skip ends skipped, and one whose window passes undone ends missed.](/diagrams/fo-recurring-schedules-pipeline.svg "The pipeline from rule to history. Occurrences keep their identity (recurrence plus original due date) through every reschedule, which is what makes regeneration safe and every promise traceable.")

## How to Build It

Three tables do three jobs: the rule, the occurrences it produced, and the visits that fulfilled them. These extend the canonical model in [The Field Operations Business](/docs/industries/field-operations/field-operations-business); `visits` and `work_orders` are used as defined there.

```sql
CREATE TABLE recurrences (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  series_id         UUID NOT NULL,          -- shared by every version of the same rule
  agreement_id      UUID NOT NULL REFERENCES agreements (id),
  property_id       UUID NOT NULL REFERENCES properties (id),
  service_type_id   UUID NOT NULL REFERENCES service_types (id),
  rrule             TEXT NOT NULL,          -- RFC 5545, e.g. FREQ=MONTHLY;INTERVAL=3
  starts_on         DATE NOT NULL,          -- DTSTART, a date in the property's zone
  time_zone         TEXT NOT NULL,          -- the property's IANA zone
  anchor            TEXT NOT NULL,          -- schedule | completion
  window_before_days INTEGER NOT NULL,
  window_after_days  INTEGER NOT NULL,
  min_gap_days      INTEGER,                -- label or agronomic minimum
  season            DATERANGE,              -- repeats yearly; null if year-round
  holiday_policy    TEXT NOT NULL,          -- earlier | later | drop
  valid_during      DATERANGE NOT NULL      -- recurrence versions
);

CREATE TABLE occurrences (
  tenant_id         UUID NOT NULL,
  recurrence_id     UUID NOT NULL REFERENCES recurrences (id),
  series_id         UUID NOT NULL,          -- stable across recurrence versions
  original_due_on   DATE NOT NULL,          -- identity, never changes
  due_window        DATERANGE NOT NULL,
  status            TEXT NOT NULL,          -- upcoming | open | booked | completed | skipped | missed
  status_reason     TEXT,                   -- required for skipped
  terms_version     INTEGER NOT NULL,       -- agreement terms that produced it
  work_order_id     UUID REFERENCES work_orders (id),
  makeup_of_due_on  DATE,                   -- original_due_on of the one it replaces
  generation_run_id UUID NOT NULL,
  PRIMARY KEY (recurrence_id, original_due_on)
);
```

**The generator** is a scheduled background job ([Scheduling](/docs/architecture/background-jobs#scheduling)) that, for each recurrence on a live agreement, expands the rule from a watermark to the horizon, applies the season, holidays and exclusions, drops dates inside the agreement's pause and hold intervals (`agreement_suspensions`, not the agreement's current status, so a pause booked for next winter is honored while the agreement is still active), and upserts occurrences on (recurrence, original due date). Because of that key, reruns and backfills after a failed night are safe and can't resurrect a skipped occurrence. Run it per branch on the branch's business date (branches carry their `time_zone`) after the day's completions post, under a service identity, and emit `occurrence.generated` per new occurrence so the router and capacity forecast pick it up ([Events & Async Messaging](/docs/architecture/events)).

**Edits come in two scopes**, mirroring RECURRENCE-ID and THISANDFUTURE. "Move this visit" changes one occurrence's visit and leaves the recurrence alone. "Change the schedule from now on" closes the current recurrence version and opens a new one, as [Effective Dating & History](/docs/database/temporal-data) describes for any effective-dated row, so history still points at the rule that produced it. Every version shares a `series_id`, and occurrences carry it, so "the Q3 visit" stays one promise across versions for reporting and make-ups. The generator removes only future occurrences that are still `upcoming` and untouched. FieldPulse states the rule well: narrowing a live agreement's window "keeps every job a team member has edited." Never discard human edits on regeneration, and never rewrite past occurrences.

**Dates belong to the property.** Expand in the property's zone and keep dates as dates, not midnight UTC timestamps; appointment windows are local times plus that zone ([Time & Date Formats](/docs/fundamentals/time)).

What's genuinely hard:

- **Agreement changes mid-window.** A customer upgrades on the 10th while the current occurrence's window runs to the 20th. Decide whether the in-flight occurrence belongs to the old terms or the new, and make it a rule, not a dispatcher's call.
- **Several agreements at one property.** Pest, mosquito and termite monitoring at one house, or HVAC and plumbing memberships with one company, should usually be one stop. Merging occurrences with overlapping windows into one visit beats skipping one of them.
- **Scale.** Partition by tenant and branch, generate incrementally from a watermark, and keep real-visit horizons in weeks.

**Build, buy or extend.** Salesforce and Dynamics cover the generator; you add the window, holiday and make-up policy. FieldRoutes brings the job pool and seasonal rounds for pest and lawn; Skimmer brings standing pool routes. A custom build should use an RFC 5545 library (python-dateutil's `rrule`) and spend its effort on what no library models: windows, anchors, end states and the backlog.

## Auditing

Recurring schedules generate disputes long after the fact: "you only came three times last year," "I asked you to stop in March." The field-specific records:

- **Every recurrence version** with who changed it and from which channel (office, portal, sales app, API). A schedule change is a contract change and often a commission event ([Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions)).
- **Every occurrence's life**: generated by which run, booked, rescheduled (old and new date, who, why), and its final state with a reason. A skip the customer didn't request is a consumer complaint.
- **Generator runs and bulk operations**: recurrences processed, occurrences created and removed, and for a weather reschedule the operator, the scope and every occurrence moved, so one action that moved 300 visits can be explained and reversed.
- **Reapplication gaps**: occurrences tied to application records let an inspector see that the label interval was respected.

[Audit Trails](/docs/architecture/audit-trails) covers system actors and automated decisions; [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records) covers field records and retention.

## What This Means for the System You Build

- **Separate the rule, the occurrence and the visit.** Three records, three lifecycles; the occurrence is the unit of the promise.
- **Identify occurrences by recurrence and original due date.** Rescheduling moves the visit, not the identity, and regeneration upserts on that key.
- **Use RFC 5545 for the rule and explicit fields for the rest.** Window, anchor, minimum gap, season and holiday policy sit beside the RRULE.
- **Store the window as the promise.** Measure on-time against it, and never let automation book outside it.
- **Choose the generation model per service.** Occurrences far ahead, real visits in a short horizon, a projected tail for completion-anchored work, standing routes for weekly pool and cleaning.
- **Never discard human edits on regeneration.** Only untouched, upcoming occurrences may be removed.
- **Version recurrences with `valid_during` and a shared `series_id`.** Changes apply forward; history keeps pointing at the rule that produced it.
- **Give every non-completion a status and a reason.** Skipped, missed, rained out and cancelled each drive different make-up and billing rules.
- **Make bulk reschedules first-class.** Weather and closures return work to the backlog with windows intact.
- **Link work found on maintenance** to the occurrence that found it, as its own work order.
- **Watch the missed count daily.** It is the earliest signal of a staffing, territory or generator problem.

## References

**Specifications**

- [RFC 5545: Internet Calendaring and Scheduling Core Object Specification (iCalendar)](https://datatracker.ietf.org/doc/html/rfc5545), RRULE parts, ignored invalid dates, EXDATE, RECURRENCE-ID and THISANDFUTURE

**Reference**

- [EPA: Introduction to Pesticide Labels](https://www.epa.gov/pesticide-labels/introduction-pesticide-labels), "the label is the law," including how often a product may be used
- [python-dateutil: rrule](https://dateutil.readthedocs.io/en/stable/rrule.html), an implementation of the RFC's recurrence rules, with `rruleset` exclusions

**In practice**

- [Microsoft Learn: Set up customer agreements to generate work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-agreements-work-orders), booking setups, days in advance, pre and post booking flexibility, generation without checking resources, and owner permissions
- [Salesforce Trailhead: Maintenance plans](https://trailhead.salesforce.com/content/learn/modules/field_service_maint/field_service_maint_plan), generation timeframe and horizon, calendar, criteria and usage rules, per-asset work orders, floating work orders
- [FieldRoutes: How the Job Pool works](https://knowledgebase.fieldroutes.com/docs/how-the-job-pool-works.md), due customers without a future appointment, missed appointments returning, wait-after filter
- [FieldRoutes: Adding a service type subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), the Due Date Method of booking on completion, pre-booking the next two to nine appointments sparingly, and preferences only on request
- [FieldRoutes: Add or edit Service Plans](https://knowledgebase.fieldroutes.com/docs/add-or-edit-service-plans.md), seasonal plans with rounds, wait-after periods and opt-outs
- [FieldRoutes API: Subscriptions](https://knowledgebase.fieldroutes.com/apidocs/subscriptions.md), day-count frequencies and seasonal start and end dates
- [ServiceM8: Recurring Jobs and Reminders overview](https://support.servicem8.com/hc/en-us/articles/203323340-Recurring-Jobs-Reminders-Overview), inactive bookings activated by lead time
- [ServiceM8: How the Recurring Jobs Auto-Routing add-on works](https://support.servicem8.com/hc/en-us/articles/115005363503-How-the-Recurring-Jobs-Auto-Routing-Add-on-works), never moving a job outside its recurrence date
- [FieldPulse: Maintenance agreements](https://help.fieldpulse.com/en/articles/5722045-maintenance-agreements), generation windows and rules, due periods, kept edits, unused visit policy
- [GorillaDesk: Recurring jobs](https://intercom.help/gorilladesk/en/articles/1089485-recurring-jobs), next job on completion and month exceptions
- [Skimmer: Manage route assignments](https://thepooldeck.getskimmer.com/manage-a-route-73/manage-route-assignments-web-skimmer-help-center-276), permanent weekly pool routes versus one-time moves
- [Briostack: Scheduling and routing software](https://www.briostack.com/pest-control-software/scheduling-routing-software/), bulk weather rescheduling (marketing)
- [Solea: Scheduling and dispatch](https://www.solea.ai/product/scheduling-dispatch), overnight auto-scheduling with a freeze window and a job pool for unplaced work
- [ServiceNow: Field service holiday schedules](https://www.servicenow.com/docs/r/DBkKvgbNn2vmEpXdLk9O2w/6Gsx23mhIpgTjuMViPVB2w), location-based holiday calendars and shift conflict warnings
