+++
title = "Booking Appointments"
description = "Promising a visit: arrival windows, route-aware slot offers, online booking, holds, AI agents and lead sources, rescheduling, notifications, double-booking."
category = "Field Operations Industry"
order = 1509
part = "Scheduling and Routing"
tags = ["field-operations", "scheduling", "appointments", "booking", "concurrency"]
+++

An appointment is a promise with a time on it, and in field service it's made through more doors than in almost any other business: a customer service rep on the phone, a homeowner on the website at midnight with no hot water, a Google ad's booking button, a door-to-door rep on a porch, a technician offering the next visit from a driveway, an AI voice agent answering after hours, and the [recurring scheduler](/docs/industries/field-operations/recurring-schedules) booking thousands of visits overnight. All of them want the last open slot on Thursday morning, and all of them have to respect the same [territories, skills and capacity](/docs/industries/field-operations/territories-and-capacity). Booking is hard for three reasons: the promise is a window, not a time, because the visit before it can run long; the slot has to be held while a customer signs and pays, without being lost or double-sold; and every later change (reschedule, cancellation, a sick technician) has to keep the promise, the route and the customer's notifications in agreement.

## Arrival Windows

Field service customers are rarely given a start time. They get an **arrival window**: the period in which the technician is supposed to arrive. ServiceTitan's windows are presets assigned per business unit, can't run past midnight (a custom window on the job handles that), and become mandatory with capacity planning: "every new or rescheduled job must have an arrival window." Housecall Pro offers windows from none up to four hours, starting at the time the job is placed on the calendar, with a per-job override.

Salesforce separates the promise from the plan in the data model. A service appointment carries `ArrivalWindowStartTime` and `ArrivalWindowEndTime` (what the customer was told) separately from its scheduled start and end (what the optimizer planned), and its booking API takes an `exactAppointment` flag that "specifies whether the result uses exact appointments or an arrival window." That separation is the design to copy. The scheduled time moves every time the route is re-optimized; the arrival window moves only when someone tells the customer. Store the window as the customer heard it, a local date and times plus the property's time zone, and compute instants from it when you need them ([Time](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)).

Window width is a business choice with a measurable cost. A narrow window pleases the customer and pins the route; a wide one absorbs a long previous job and lets the optimizer work. ServiceTitan says its route optimizer is "less effective for businesses that give smaller arrival windows (2-3 hours), or that only run 1-3 jobs per day." The trades differ: a recurring pest or pool customer often accepts "Tuesday, anytime" because nobody needs to be home; a furnace repair needs an adult at the door and a window of two to four hours; a commercial account's SLA may promise a response time instead of a window; a delivery customer expects a narrower window than any of them. My default: offer narrow windows where route density is high and wider ones in sparse territories, and track on-time arrival against the window per territory so the choice gets revisited.

Not every booking needs a window at all. When nobody has to be home (a parcel left in a safe place, exterior lawn or pest service, a meter read), the promise can be a day, or no promise beyond "this week", and the optimizer gets the stop with no time constraint. That's the biggest density lever a booking flow has, so ask whether attendance is needed before showing a window picker, and record the answer on the work order ([Last-Mile Delivery & Distribution](/docs/industries/field-operations/last-mile-delivery)).

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

Listing slots answers "who could go?" It doesn't answer "which of these times should the business hope the customer picks?", and the gap between those two questions is a large share of a branch's drive time. That's the next section.

## Offer Times Where the Routes Already Are

A customer choosing from a calendar can't see where the trucks will be, so every set of times a booking screen offers is also a routing decision, made before the [route optimizer](/docs/industries/field-operations/route-optimization) ever sees the visit. The optimizer can only arrange the promises it's given. Which promises get made is decided here.

### Open Calendar Versus Route-Aware Booking

**Open-calendar booking** offers every window in which some qualified technician in the territory has room, and lets the customer pick any of them. It's the natural first version: it falls straight out of availability and capacity, it's easy to explain, and it gives the most choice. It's also what a calendar-first booking form does unless something else is configured; the online booking rows for Housecall Pro and ServiceTitan Scheduling Pro in the table above decide slots from availability, capacity, zones and buffers, and Jobber's drive time limit is a setting layered on top.

**Route-aware booking** starts from the same candidates and asks one more question of each: what would it cost to add this visit to the plan as it stands? It then offers the windows where a technician will already be nearby, ranked by that marginal cost, and either keeps the other windows one tap away or doesn't show them.

The trouble with "any time" is that the order in which customers call, not where they live, decides which of them share a day:

- **Zig-zag days.** Monday's four visits end up in four corners of the territory because those were the four customers who wanted Monday.
- **Anchors.** One far stop with a fixed window pins a technician to the far side of town at that hour, and the rest of the day is planned around it. Jobber's drive time limit shows the mechanism from the other side: on a day with no bookings yet, a customer "will see all available time slots ... regardless of where they are," and that first booking becomes the reference point for the rest of the day's offers. A good first booking clusters the day; a bad one drags it across town.
- **Fragmented capacity.** Ninety minutes free between two stops forty minutes apart holds no job. The capacity ledger says the day has room; the route says it doesn't.
- **More driving per stop, fewer stops per day, more late arrivals.** Every long leg is unbilled time and another chance to miss the next window.
- **A promise the optimizer can't undo.** Once the customer has heard the window, it's a hard constraint ([Route Optimization](/docs/industries/field-operations/route-optimization#how-to-build-it-the-problem-you-hand-the-solver) treats a promised window as hard in most businesses, and ServiceTitan's optimizer "schedules each job within the indicated arrival window"). The optimizer can reorder everything around a bad promise; it can't move the promise without a call to the customer.

So the cost of a booking is mostly set when the window is offered, not when the route is optimized. Route-aware booking moves the cost model from [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives) forward to the moment of the offer.

![Two booking screens for the same customer and week. On the left, an open calendar: a grid of Monday to Friday by four two-hour windows, eighteen identical open windows and two marked full, then a Continue button. On the right, route-aware: three recommended times, the first highlighted with a technician nearby badge and the note on your street that morning, the second also nearby, the third a wider window with a $15 discount, then a See more times link and a Continue button.](/diagrams/fo-booking-appointments-offers.svg "An open calendar makes every window look equal. A route-aware screen shows the few windows where a technician will already be, best first, and keeps the rest behind a link.")

### A Worked Example

The numbers are illustrative, and the rates are the ones [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives#time-is-not-distance) uses: $45 an hour of loaded labor, or $0.75 a minute, and $0.76 a vehicle mile. A new customer books an hour-long furnace tune-up.

On Tuesday, Bob has a stop in the customer's neighborhood at 9:00 and another at 11:30. Today those two stops are six minutes and 2.5 miles apart. Fitting the new visit between them, in a 10-to-12 window, means driving four minutes (1.5 miles) to the new customer and five minutes (2.0 miles) on to the next stop, instead of the six-minute leg. The added drive is 4 + 5 − 6 = 3 minutes and 1.5 + 2.0 − 2.5 = 1.0 mile, which costs 3 × $0.75 + 1.0 × $0.76 = $3.01.

On an open calendar, the customer picks Thursday 8 to 10, the first window of their week. On Thursday, the only technician with room is Ana, whose route is on the other side of town. Her shift starts at 7:30 from home, and her first stop is twelve minutes (7 miles) away. To keep an 8-to-10 promise, the new visit has to come first: 36 minutes (23 miles) from her home to the customer, then 36 minutes (23 miles) back to her first stop, replacing the twelve-minute leg. The added drive is 36 + 36 − 12 = 60 minutes and 23 + 23 − 7 = 39 miles, which costs 60 × $0.75 + 39 × $0.76 = $45.00 + $29.64 = $74.64.

The knock-on effects are worse than the arithmetic. Ana's first existing stop moves from about 7:42 to about 9:42, and every stop after it moves too unless the plan had slack, so any of them with a narrow window is now at risk of a late arrival. If her Thursday was planned at 7.0 hours, the visit and its drive take it to 9.0, one of those hours at an overtime rate of $67.50 rather than $45, another $22.50. Or the optimizer keeps her day inside the shift by dropping her last visit to the pool, and that customer gets a rescheduling call.

![Two panels. On the left, Tuesday 10 to 12: the new visit sits between Bob's previous and next stops, replacing a 6-minute, 2.5-mile leg with legs of 4 minutes and 1.5 miles and 5 minutes and 2.0 miles, adding 3 minutes and 1.0 mile for $3.01. On the right, Thursday 8 to 10: the new visit is across town from Ana's home and first stop, replacing a 12-minute, 7-mile leg with two 36-minute, 23-mile legs, adding 60 minutes and 39 miles for $74.64 and pushing her day from 7.0 to 9.0 hours.](/diagrams/fo-booking-appointments-insertion.svg "The same visit, inserted where a route already is and where it isn't (illustrative numbers). Insertion cost is the new legs minus the leg they replace.")

The two windows differ by $71.63 for one booking. Ten bookings like Thursday's in a branch's week is $716.30 and ten hours of driving, more than a technician-day, every week: about $37,000 a year at these rates. The customer may well have been as happy on Tuesday; the open calendar never asked.

### The Strategies

Between "any time" and "the system decides" there is a spectrum, and most businesses end up mixing several points on it:

| Strategy | How it works | What it gains | What it costs |
| --- | --- | --- | --- |
| **Open calendar** | Every window with capacity, unranked | Most choice; simplest to build and explain | Customers' calendars decide the routes; anchors and fragmented days |
| **Hide far slots** | Show only windows whose insertion cost is under a threshold in drive minutes or money | Removes the worst bookings; the screen still looks like a calendar | Sparse areas see a near-empty week; the customer can't tell why Thursday is missing; a threshold to tune per branch |
| **Rank and badge** | Show everything, recommended windows first, marked "technician nearby" | No choice lost; a nudge rather than a rule | Works only as far as customers follow the nudge; the badge must be true when shown |
| **A few best offers** | Two or three windows, with "see more times" behind a link | Quick to read on a phone and to say on a call; most bookings land on cheap windows | Feels narrow; needs diversity (different days, morning and afternoon) or it offers three versions of one time |
| **Zone days** | Each area is served on fixed days ("Westside is Tuesdays and Fridays") | Dense routes by construction; predictable for recurring route work | Longer waits for one-off repairs; demand doesn't respect the zone calendar |
| **Incentives** | A discount or perk for a recommended window, or for accepting a wider one | The customer still chooses, with a reason to choose well | Costs margin; it's a price, so pricing and disclosure rules apply; needs measuring to know it pays |
| **Dynamic slot pricing** | Each window has its own price or fee, from its cost or demand | Prices the route cost directly | Complex to explain; a fee by neighborhood raises fairness questions; needs volume to tune |
| **Book now, assign later** | Promise a day and window against territory capacity; pick the technician and order at optimization time | The most flexible plan; the optimizer chooses who | The insertion estimate at booking can be wrong; the capacity guard has to be tight or days overfill; no technician's name at booking |

My default for one-off work, web and phone alike: **a few best offers, ranked, with every other window behind "see more times," also ranked.** The customer who needs Thursday can still get Thursday, while most bookings land where the routes already are; call-center reps and AI voice agents read the same top two or three, because nobody listens to a calendar read aloud. Recurring route work (pest, lawn, pool) does better with zone days, which [Recurring Schedules](/docs/industries/field-operations/recurring-schedules) generates as service windows anyway, and wide windows pair naturally with book now, assign later. I'd add incentives only after ranking alone has been measured, since a discount spent on a customer who would have taken the recommended window anyway is pure margin lost. Hiding far slots is the right call where a branch genuinely can't serve them that week, not as a way to steer.

Incentives and slot prices are prices. A "$15 off for a 4-hour window" is a promotion with conditions, shown before the customer chooses and recorded with the booking ([Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules#promotions)), and the invoice must honor it.

### Customers, Fairness and Urgent Work

**Customer experience and conversion pull both ways.** Fewer choices can make a decision faster, or lose a customer whose only free morning wasn't on the first screen. Which effect wins depends on the trade, the channel and the customer, and it's a number to measure per branch, not to assume (below).

**Fairness.** Ranking by route cost favors customers who live where the business is already dense. Someone at the edge of the territory sees fewer recommended windows, later ones, or only wide ones. That can be a reasonable decision, but it is a decision: the same kind of hidden policy as a weight that quietly drops outlying customers ([Weighing the Routing Objective](/docs/industries/field-operations/route-objectives#pitfalls)). My rule: every serviceable address gets a guaranteed floor of offers, say three windows within the next seven days, whatever they cost, and the floor is configuration someone approved. A business that won't serve an area should say so in its territory, not by never offering it a time.

**Urgent and emergency work skips the ranking.** No heat in January, a burst pipe or a walk-in cooler that's down wants the earliest feasible arrival, with route cost only breaking ties. Classify at intake by work type, and give emergencies their own path through the same availability engine, drawing on the room [Territories & Capacity](/docs/industries/field-operations/territories-and-capacity#reserving-room-and-forecasting) holds back for them.

**Commercial SLAs replace the customer's choice with a deadline.** A contract that promises a technician within four hours leaves nothing to offer: the system picks the cheapest feasible insertion that meets the deadline, and the deadline is the hard window.

**Window width and density interact.** The [Arrival Windows](#arrival-windows) default above (narrow where routes are dense, wide where they're sparse) is easier to keep with route-aware offers, because a two-hour window is cheap to promise where a route already is and expensive anywhere else. Timefold puts the trade-off from the solver's side: "as time windows get longer, you reduce the number of recommendations and the customer's options." The attended home delivery research below measured the other side, what narrow windows cost a route.

### What the Platforms and the Research Show

The field service suites expose the same calculation in different places:

- **ServiceTitan's Schedule Assistant** is the clearest public statement of insertion cost. It suggests "a date, time, and technician for a given job that minimizes drive time," lists up to 52 technicians "sorted by most efficient drive time," and shows on each card "the extra time and distance that would be added if the new appointment is added to the technician's route," computed as the time and distance from the previous appointment to the new one, plus from the new one to the next, minus from the previous to the next. That is exactly the worked example's arithmetic, offered to dispatchers and CSRs during call booking.
- **Salesforce Field Service** grades slots rather than filtering them. `GetSlots` can sort results by `Grade`, `SlotDateTime` or `NoSort`, each `AppointmentBookingSlot` carries a grade, and `GradeSlotsService` evaluates "all possible slots where a given service appointment can be scheduled." The grade comes from the scheduling policy: the optimizer "evaluates each available time slot and qualified candidate for the objectives" and "multiplies the grade for each objective by the relative weight of that objective," in Trailhead's example ASAP 4, Preferred Resource 4 and Minimize Travel 2. When ASAP outweighs Minimize Travel, the earliest slot outranks the cheap one, so those weights are where a business decides how much soonness to trade for route cost ([Weighing the Routing Objective](/docs/industries/field-operations/route-objectives#time-is-not-distance)).
- **Dynamics 365's schedule assistant** "recommends resources that match criteria like availability, skills, and location" and "estimates travel time for the recommended resources," for dispatchers who want the system to "estimate travel time and rank resources." Its docs add a warning worth copying: booking outside its recommended slots means "constraints such as capacity, work hours, and time windows aren't verified or enforced."
- **Jobber's drive time limit** is the filtering approach for online booking: it "Limits bookings to appointments that are within a set driving time of other bookings scheduled that day," with travel estimated from historical traffic, and shows every slot on a day with no bookings.
- **Timefold's time window recommendations** fit a visit into an existing plan and return, per requested window, up to `maxNumberOfRecommendationsPerTimeWindow` technician shifts, each with a `scoreDiff` against the plan without the visit. They offer a narrow window ("a specific afternoon slot instead of 'the first week in February'"), and the accepted visit is added to the draft plan and optimized afterward, so "the customer doesn't need to stay on the phone to wait for the optimized solution." The docs are candid that the recommended times "will likely change as additional visits are added to the plan," and that "it is important to decide how to manage concurrent requests."

Attended home delivery, grocery above all, studies the same problem under the name **time slot management**. Agatz, Campbell, Fleischmann and Savelsbergh worked with Albert.nl, the online channel of the Dutch grocer Albert Heijn, where customers chose a two-hour slot from a menu per ZIP code, each slot carried a delivery fee from €4.95 to €8.95 depending on day and time, and slots closed when capacity got tight. Albert.nl already differentiated by place: "a zip code with low demand potential receives only a few weekly time slots in an attempt to concentrate that demand," while keeping a balance of morning and afternoon slots as a service requirement. On Albert.nl's data, the paper found that "narrow delivery time slots are convenient for the customer, they greatly reduce routing efficiency": up to 25% higher delivery cost for two-hour slots than for slots spanning a whole morning or afternoon, and up to 10% savings from differentiating the offering by region instead of offering every slot everywhere. Its central trade-off is "between demand clustering and demand smoothing": clustering shortens the distance between stops, at the risk of leaving capacity unused. Earlier, Campbell and Savelsbergh studied "the use of incentives to influence consumer behavior to reduce delivery costs," with optimization models for two forms of incentive tested by simulation. A delivery stop takes minutes and a furnace repair takes an hour, so the numbers don't transfer, but the levers (which slots to offer where, how wide, at what price) are the same ones in the strategy table above.

### How to Build It

The slot search becomes a pipeline with one new step in the middle:

1. **Generate candidates.** Run the shared availability engine ([Territories & Capacity](/docs/industries/field-operations/territories-and-capacity#how-to-build-it), steps 1 to 5) over the booking horizon: territory, members, calendars, eligibility and capacity give each window the technicians who could take it. Hard rules stay the same for every caller.
2. **Score by insertion against the current plan.** For each candidate technician-day, take its current planned sequence (the last applied optimization plus bookings since) and try the new visit in each gap, including the legs from and back to the technician's home. A gap's cost is the new legs minus the leg they replace, in minutes and miles, priced with the branch's [objective profile](/docs/industries/field-operations/route-objectives) so a booking and a solve agree on what a minute is worth. A gap is feasible only if the arrival lands inside the window and the pushed-back stops still meet their promised windows and the hard shift end. Add what the legs don't capture: slack consumed (lateness risk), capacity eaten from what's reserved for emergencies, and a bonus for the customer's preferred technician. A window's score is its best feasible gap across technicians. This is a cheap insertion heuristic, linear in the stops on each day; the full re-optimization runs later, as the usual asynchronous job ([Route Optimization](/docs/industries/field-operations/route-optimization#runs-are-jobs-and-results-go-stale)). For book now, assign later, score against the territory-day instead and commit only capacity.
3. **Choose the offers.** Take the best few by score, then apply the diversity and floor rules from configuration (at least two days, a morning and an afternoon, the guaranteed minimum for sparse addresses), and attach badges and incentives.
4. **Hold, then commit.** When the customer picks, re-score that one window against the plan as it is now, since plans move between showing and choosing, then hold it as described under [Requests and Holds](#requests-and-holds). If two customers pick the last good gap at once, the database refuses the second ([Idempotency and Double-Booking](#idempotency-and-double-booking)) and that customer gets a fresh search, not an error.

**Latency.** A customer on a web page and a caller on the phone are both waiting, and a voice agent fills the silence badly. My default budget is about a second for the whole search, with a fallback to unranked availability if scoring runs over, so a slow matrix call costs ranking, never the booking. That budget rules out a solver run per page load and shapes the caches: each technician-day's planned sequence with arrival times and slack, invalidated by events (booking, cancellation, optimization applied, technician called in sick); the per-resource open intervals the availability engine already precomputes; and travel times from the [cached matrix](/docs/industries/field-operations/route-optimization#what-exists-routing-engines-over-openstreetmap), plus one many-to-one request from the new address to the stops on the candidate days. Geocode the address when it's entered, not at search time. Drive time, not straight-line distance or a fixed radius, is the measure throughout: a river, a bridge or a highway interchange makes the two disagree exactly where it matters.

**Record what was offered.** Every search writes the offers it showed and, later, which one was chosen. Without it, nobody can answer "why was I only offered Thursday?", show that a neighborhood wasn't steered, or measure anything below. A sketch beside the canonical `visits`, with windows local to the property's zone like the visit's own:

```sql
CREATE TABLE slot_offers (
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                 UUID NOT NULL,
  offer_set_id              UUID NOT NULL,            -- one search shown to one customer
  property_id               UUID NOT NULL REFERENCES properties (id),
  booked_via                TEXT NOT NULL,            -- the channel, as on visits
  offer_policy_version      INTEGER NOT NULL,
  objective_profile_version INTEGER NOT NULL,
  offer_rank                INTEGER NOT NULL,         -- 1 = shown first
  is_first_screen           BOOLEAN NOT NULL,         -- false: behind "see more times"
  service_on                DATE NOT NULL,
  window_starts_local       TIME NOT NULL,
  window_ends_local         TIME NOT NULL,
  resource_id               UUID REFERENCES resources (id),  -- null when assigned later
  added_drive_seconds       INTEGER NOT NULL,
  added_distance_meters     INTEGER NOT NULL,
  added_cost_amount         BIGINT NOT NULL,          -- minor units
  incentive_amount          BIGINT,                   -- minor units; null = none
  currency                  TEXT NOT NULL,
  badge                     TEXT,                     -- 'technician_nearby' or null
  shown_at                  TIMESTAMPTZ NOT NULL,
  chosen_at                 TIMESTAMPTZ,
  visit_id                  UUID REFERENCES visits (id)  -- set on the offer that was booked
);
```

**Configuration per branch.** How many offers, whether other windows sit behind a link or are hidden, the badge threshold, diversity and floor rules, incentives, and which work types bypass ranking all vary by branch and season, so they're a versioned policy like the objective profile ([Rules as Data](/docs/architecture/rules-as-data)):

```json
{
  "offer_policies": [{
    "branch": "north_metro", "version": 4, "valid_during": "[2026-11-02,)",
    "objective_profile": "metro_dense",
    "offers_on_first_screen": 3, "other_windows": "ranked_behind_link",
    "nearby_badge_max_added_minutes": 10,
    "diversity": { "min_days": 2, "morning_and_afternoon": true },
    "floor": { "min_offers": 3, "within_days": 7 },
    "incentives": [{ "name": "wide_window", "min_window_hours": 4,
                     "discount_amount": 1500, "currency": "usd" }],
    "skip_ranking_for": ["emergency", "sla_response"],
    "approved_by": "ops_director"
  }]
}
```

**What to measure.** From `slot_offers` and the visits they became:

- **Offer acceptance:** the share of offer sets where the customer chose a first-screen offer, and the rank chosen. A low rate means the offers are wrong for this branch's customers, or too few.
- **Added drive per booking:** planned at booking, then after the next optimization, then actual from the technician app. The gap between the first two shows how good the insertion estimate is.
- **Conversion:** bookings per customer who reached the time screen, compared with an open-calendar holdout of the same branch over the same weeks, bucketed by a stable key such as the property so a customer sees one experience ([Progressive Rollout](/docs/delivery/feature-flags#progressive-rollout)). This is the number that says whether steering costs customers.
- **Route outcomes:** on-time arrival against the promised window, drive share and stops per hour ([Operating Metrics](/docs/industries/field-operations/operating-metrics#route-efficiency)), by territory.
- **Floor and fairness:** offers per search and days to the first offer, by territory and ZIP code, so the edge of the map is watched rather than discovered.

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
- **The offers shown and the one chosen,** on every channel: each window with its rank, badge, incentive and added cost, and the offer policy and objective profile versions, from `slot_offers`. It answers "why was I only offered Thursday?", shows whether an area was steered, and backs any incentive the invoice must honor.
- **AI and lead-source bookings**: the call or chat ID, transcript and recording references and any handoff, so a caller's dispute over what the agent agreed to has evidence; and the lead source and lead ID, for attribution and for disputing lead charges.
- **Cancellation and reschedule reasons with the policy and any fee applied,** since fee disputes and [chargebacks](/docs/industries/payments/disputes-and-chargebacks) turn on whether the policy was disclosed and followed.

Record structure, typed actors and recording automated decisions are in [Audit Trails](/docs/architecture/audit-trails); field retention periods are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Store the arrival window separately from the scheduled time,** as local time plus the property's zone. Optimizers move the plan; only a customer notification moves the promise.
- **Offer times where the routes already are.** Score each candidate window by its insertion cost against the current plan, priced with the branch's objective profile; show the best few first and the rest ranked behind a link; optimize after acceptance, never inside the page load.
- **Keep a floor and an emergency path.** Every serviceable address gets a minimum of offers whatever they cost, and emergency and SLA work skips the ranking for the earliest feasible arrival.
- **Make the offer policy configuration:** offers shown, badges, diversity, floor and incentives per branch, versioned and approved, with incentives treated as prices.
- **Record every offer shown and the one chosen,** and measure acceptance, added drive per booking, on-time arrival and conversion against an open-calendar holdout.
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
- [Agatz, Campbell, Fleischmann and Savelsbergh: Time Slot Management in Attended Home Delivery (Transportation Science, 2011)](https://repub.eur.nl/pub/25987/TimeSlotManagement_2011.pdf), Albert.nl's slot menu and fees per ZIP code, few slots for low-demand ZIP codes, up to 25% higher cost for two-hour slots and up to 10% savings from regional differentiation
- [Campbell and Savelsbergh: Incentive Schemes for Attended Home Delivery Services (Transportation Science, 2006)](https://ideas.repec.org/a/inm/ortrsc/v40y2006i3p327-341.html), incentives to steer customers toward low-cost delivery slots, modeled and simulated

**In practice**

- [Salesforce: Field Service Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), `GetSlots` and its sort by grade or date, slot grades and `GradeSlotsService`, arrival window fields, `ScheduleService` resource locking and collision detection, recurring appointment slots
- [Salesforce Trailhead: Explore optimization](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-optimization/explore-optimization), time slots and candidates graded against weighted service objectives
- [ServiceTitan: Use Schedule Assistant](https://help.servicetitan.com/docs/use-schedule-assistant), date, time and technician suggestions that minimize drive time, sorted by drive time, with the added time and distance of inserting a job into a route
- [Microsoft Learn: Schedule assistant overview](https://learn.microsoft.com/en-us/dynamics365/field-service/schedule-assistant), resource recommendations with estimated travel time, and constraints not enforced outside recommended slots
- [Oracle Field Service: Activity booking overview](https://docs.oracle.com/en/cloud/saas/field-service/faaca/c-activitybookingoverview.html), booking methods per capacity area
- [Timefold: Time window recommendations](https://docs.timefold.ai/field-service-routing/latest/recommendations/recommendations), offering narrow windows while the customer is on the phone and optimizing afterward
- [Timefold: Visit time window recommendations](https://docs.timefold.ai/field-service-routing/latest/recommendations/visit-time-window-recommendations), recommendations per window with a score difference, the draft plan, longer windows giving fewer options, and concurrent requests
- [ServiceTitan: Set up arrival windows](https://help.servicetitan.com/docs/set-up-arrival-windows.md), preset windows per business unit, no spanning midnight, mandatory with capacity planning
- [ServiceTitan: Set up Scheduling Pro](https://help.servicetitan.com/docs/set-up-your-online-scheduler-with-scheduling-pro-in-servicetitan-max.md), online and call-center booking, zones, buffers and blocked dates
- [ServiceTitan: Configure voice agent settings](https://help.servicetitan.com/docs/configure-your-voice-agent-settings-in-servicetitan), per-action and per-job-type booking permissions, Adaptive Capacity dependency and retention offers
- [ServiceTitan: Optimize technician route](https://help.servicetitan.com/docs/use-optimize-technician-route), confirmed jobs left in place, jobs kept within arrival windows, and less benefit with narrow windows
- [ServiceTitan: Customer portal overview](https://help.servicetitan.com/docs/customer-portal-overview.md), appointment requests through the Web Appointment Scheduler, booked by staff
- [Housecall Pro: Setting your arrival window](https://help.housecallpro.com/en/articles/918018-setting-your-arrival-window), window options starting at the scheduled time
- [Housecall Pro: Online booking settings](https://help.housecallpro.com/en/articles/7034474-new-online-booking-settings), booking modes, employees available for booking, "Send request" creating a lead when no slot fits, Reserve with Google
- [Housecall Pro: Customer notifications overview](https://help.housecallpro.com/en/articles/357613-customer-notifications-overview), scheduled-job notifications resent when the time or employee changes
- [Jobber: Online booking](https://help.getjobber.com/hc/en-us/articles/13808363916951), booking intervals, drive time limits measured from the day's other bookings (every slot on an empty day), buffers and random assignment
- [Jobber: Receptionist](https://help.getjobber.com/hc/en-us/articles/25315927533847), AI booking through online booking settings, approvals, summaries, recordings and transcripts
- [Google: Local Services Ads charges](https://support.google.com/adwords/answer/7195435), booking requests charged as valid leads in the US and Canada
