+++
title = "Route Optimization"
description = "Optimizing field routes: the VRPTW, solvers and routing APIs, how FSM platforms expose it, hard and soft rules, freezing and pinning, async runs and audit."
category = "Field Operations Industry"
order = 1509
part = "Scheduling and Routing"
tags = ["field-operations", "routing", "optimization", "scheduling", "vrp"]
+++

[Booking Appointments](/docs/industries/field-operations/booking-appointments) decides which day and window a customer gets. Route optimization decides who goes where, in what order, so that the promises hold and the trucks don't zigzag across the county. For a business whose product is a technician at a door, drive time is the largest cost it can still change: every minute behind the wheel is a minute not billed, fuel burned and a later arrival for every customer after it.

The problem is hard in a precise sense. Assigning visits to technicians and ordering them is the **vehicle routing problem (VRP)**, and with arrival windows it's the **VRP with time windows (VRPTW)**. The number of possible plans grows factorially with the number of stops, so at branch scale, engines use heuristics within a time limit rather than proving optimality. Field service adds its own complications on top: skills and licenses, shifts that start from home, lunch breaks, customers who want the same technician, visits that may float across several days, and a plan that keeps changing after it's published. The shape varies by trade: a pool or lawn route is twenty short, uniform stops; an HVAC or plumbing day is four to six repair calls of unknown length plus emergencies; a cleaning crew is a team that moves together; a delivery route adds vehicle capacity and tight drop windows.

## The Problem, Stated Precisely

An optimizer needs the same few things whatever the product calls them:

- **Visits** (jobs, services, tasks, stops): a location, a service duration, one or more time windows, required skills, a priority, and optionally a pinned technician or time.
- **Resources** (vehicles, technicians, crews): a shift with start and end, a start and end location (often home, not the branch), skills, capacity where it matters (gallons of product, square feet of treatment), breaks, and limits such as maximum stops or maximum route minutes.
- **A travel matrix:** drive time and distance between every pair of locations, from a routing engine over a road network.
- **An objective:** what "good" means, usually a weighted mix of travel, overtime, lateness, unserved work and balance ([Weighing the Routing Objective](/docs/industries/field-operations/route-objectives)).

The output is an ordered list of visits per resource with planned arrival times, plus the visits that couldn't be placed. That second list matters as much as the first. Every serious engine returns it, and a system that hides it loses work.

Google's OR-Tools guide shows the core mechanics in a few lines: time is a **dimension** whose cumulative value at each stop is the arrival time, each stop's cumulative variable is restricted to its window, and the dimension allows slack because a technician may need to wait for a window to open. When the solver can't serve everything, each visit is wrapped in a **disjunction** with a penalty: the solver may drop it, and the penalty is added to the cost. Every product below is some elaboration of those two ideas.

## What Exists: Solvers and Routing APIs

The solvers split into libraries you run and hosted APIs you call. **OR-Tools** is Google's open-source optimization suite: you build the model in code, choose a first-solution strategy and a metaheuristic, and set a time limit, which defaults to effectively unlimited; its docs call guided local search "generally the most efficient metaheuristic for vehicle routing." **VROOM** is an open-source engine that takes JSON jobs and vehicles, treats skills as eligibility, returns unserved work in an `unassigned` array, and has a plan mode that computes ETAs and violations for a fixed route instead of re-solving, which is useful for checking a dispatcher's hand-built route. **Timefold** is an open-source constraint solver with a hosted Field Service Routing model whose docs are the most complete public treatment of field-service specifics (overtime, fairness, multi-day visits, real-time replanning). The hosted APIs cover the same ground with different knobs:

| Engine | Kind | Windows | Objective controls |
| --- | --- | --- | --- |
| OR-Tools | Library | Hard via time dimension; drop with penalty | Arc costs, span costs, penalties, any mix you code |
| VROOM | Library | Hard; plan mode reports violations | Vehicle costs (fixed, per hour, per km), priority 0 to 100 |
| Timefold FSR | Library or hosted | Hard and soft, scored in hard/medium/soft levels | Weighted constraints, incl. overtime and fairness |
| Google Route Optimization | Hosted | Hard plus soft windows with costs before or after | Per-hour, per-km, fixed and skip-penalty costs |
| Routific | Hosted | Multiple windows per visit; capped lateness | Driving time plus working hours, or distance; balance |
| OptimoRoute | Hosted | Windows, priority L/M/H/C | Balance by work time or order count |
| HERE Tour Planning | Hosted | List of windows per place | Vehicle-type costs; priorities 1 to 5 |
| Mapbox Optimization v2 | Hosted (beta) | `strict`, `soft`, `soft_start`, `soft_end` | Total travel time or longest schedule, one only |
| NextBillion | Hosted | Soft overtime and lateness limits | Objective and custom cost matrix |
| Esri ArcGIS VRP | Hosted | Hard when max violation is 0; two per order | Cost per time, distance, overtime; order revenue |
| GraphHopper | Hosted | Hard | Completion time, or min-max to finish together |

Where each engine puts the price of an hour and a mile is compared in [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives#time-is-not-distance). The hosted APIs cap the size of a synchronous request and send anything larger through an asynchronous path, which shapes the integration more than any objective setting does ([Runs Are Jobs](#runs-are-jobs-and-results-go-stale) below).

Results can also differ between runs. Several commercial engines document it: Skedulo says a result is "often not replicated across multiple optimization runs with the same data," and Bringg warns that "each time you run route optimization on the same group of orders you may well receive a different result," so dispatchers should make focused changes to existing plans instead. The open-source engines differ from each other. VROOM's maintainer says the same problem on the same setup "will always trigger the same search path," with no random seed to change; an OR-Tools maintainer describes guided local search as "not deterministic," and any wall-clock time limit stops a search wherever it has got to. My rule: don't assume reproducibility from any engine, test it on your own snapshots, and compare plans by distribution, not by one run.

## What Exists: Routing Engines Over OpenStreetMap

The solver needs a travel matrix, and hosted APIs bring their own, with traffic models. If you run a library, an open-source engine over OpenStreetMap supplies it: **OSRM**'s `table` service (durations and distances of the fastest routes, not the shortest), **Valhalla** (matrix, isochrones and map matching, with costing per travel mode) or **openrouteservice**. OSRM's `trip` service is a traveling-salesman heuristic for one technician's day, not a VRP solver. A matrix is the largest input to the solve (500 locations is 250,000 pairs), so cache it by location pair and time-of-day bucket and refresh it when the road data changes, not on every run.

## How FSM Platforms Expose It

Field service platforms wrap these engines in very different scopes, and the scope is the first thing to compare:

| Platform | What the optimizer may change | What it respects | Notes from public docs |
| --- | --- | --- | --- |
| ServiceTitan Optimize Technician Route | Order of one technician's day | Arrival windows; skips Confirmed jobs | Starts from the tech's validated home address; each run logged in the job Audit Trail |
| Housecall Pro Optimize by Drive Time | Order of one technician's day | Locked jobs; anytime jobs float in business hours | Never changes day or technician; save with or without customer notifications |
| Jobber route optimization | Order of anytime visits | Fixed-time visits; optional fixed first and last stop | Up to 7 days at once |
| FieldRoutes Intelligent Routing | Builds routes from groups, then assigns them | Max stops, max minutes, skills, square or linear feet | Equal Stop vs Auto Optimize; truck, hazmat, bridge-height and same-side routing |
| Salesforce Field Service | Candidates, time and resource per appointment | Work rules (pass/fail) | Service objectives as weighted grades; default policies such as Customer First and High Intensity |
| Dynamics 365 RSO | Bookings across many jobs and resources | Characteristics, territories, promised windows | Paid add-on; ranked goals; overnight, intraday, simulation and emergency runs |
| SAP FSM | Assignments by policy | Policy: skills, distance, earliest | Manual, assisted and automatic scheduling |
| Solea Auto-Scheduling | Places due and new work overnight | Freeze window, locked visits, windows, hours | Dry-run preview; unplaceable work goes to a job pool |

The range runs from a single-technician reorder (the SMB tools, which assume the office already chose the day and the person) to whole-branch assignment with configurable policies (the enterprise suites) to an overnight run that builds tomorrow from the backlog (the vertical and AI-native tools for recurring work). Salesforce's model is the clearest vocabulary for the enterprise end: **work rules** reduce the candidates to those who can do the job, pass or fail, and **service objectives** grade the survivors, weighted by sliders; three work rules (Service Resource Availability, Earliest Start Permitted, Due Date Match Time) are mandatory. Dynamics' RSO ranks its **goals** instead of weighting them.

FieldRoutes also documents a consequence every recurring-service business meets: re-routing "can push back due dates for unassigned customers." An optimizer that drops low-priority visits to save drive time is making a service decision, not just a routing one.

## How to Build It: The Problem You Hand the Solver

Whether you buy an engine or run one, the design work is in building the problem and handling the answer. Build the problem from a consistent **snapshot** of the domain, never from live reads during the solve. The snapshot carries the row version of each visit and resource it read, which is what the apply step later checks (see below). Window and shift times are local to the branch's zone, as the customer and the technician understand them:

```json
{
  "run": {
    "id": "0193a1f2-7c4e-7d10-9b3a-5e2f1c8d4a01", "branch": "north_metro",
    "service_on": "2026-11-03", "time_zone": "America/Chicago"
  },
  "visits": [{
    "id": "0193a1f2-7c4e-7d10-9b3a-5e2f1c8d4b17", "row_version": 9,
    "location": [-90.10, 38.75], "service_minutes": 45,
    "windows": [{ "start_local": "08:00", "end_local": "12:00", "is_hard": true }],
    "skills": ["refrigerant_certified"], "priority": 70,
    "pinned_resource_id": null, "is_locked": false, "skip_penalty": 4000
  }],
  "resources": [{
    "id": "0193a1f2-7c4e-7d10-9b3a-5e2f1c8d4c42", "row_version": 3,
    "start": [-90.02, 38.80], "end": [-90.02, 38.80],
    "shift": { "start_local": "07:30", "soft_end_local": "16:30", "hard_end_local": "17:30" },
    "skills": ["refrigerant_certified", "hvac_repair"],
    "breaks": [{ "earliest_local": "11:00", "latest_local": "13:30", "minutes": 30 }],
    "max_stops": 8
  }]
}
```

The choices hidden in that shape are where plans go right or wrong:

- **Hard versus soft is a business decision.** A credential is hard: a technician without refrigerant certification can't recharge a system, and one without a termite license can't treat for termites, whatever it saves. A customer's preferred technician is soft. An arrival window you promised is hard in most businesses; an internal "service between the 1st and the 15th" target is soft. Skedulo and Timefold add a middle level, **medium**, for leaving as little unassigned as possible. Put each rule in configuration with its level, and record which version a run used ([Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Overtime has two edges.** Timefold's shift model is the one to copy: a soft end where overtime begins and a hard end that can't be crossed, so the solver can trade a little overtime for a visit that would otherwise slip. Esri does the same with an overtime start and a cost per overtime unit, and Routific with a maximum overtime. Wage rules sit behind this; [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety) covers hours limits for drivers who fall under them.
- **Skipping must cost something.** Give every visit a skip penalty that reflects its priority and how overdue it is. A penalty that's too low lets the solver shed the far-away customer every day, and that customer cancels.
- **Fairness is an objective, not a side effect.** Optimizing travel alone gives the closest technician the most work. Routific's `balance`, OptimoRoute's balancing modes and Timefold's "Balance time utilization" trade efficiency for evenness, and Timefold also takes each technician's historical utilization, so fairness holds across a week. For commissioned or piece-rate technicians, fairness is pay, so its weight is a policy someone signs off.
- **Multi-day visits need a cap.** A quarterly service due "this week" can go on any day, and an optimizer will happily fill Monday with it. Timefold separates **movable** visits (windows across several days) from non-movable ones and caps the share of each shift that movable work may take, keeping room for same-day and booked work. [Recurring Schedules](/docs/industries/field-operations/recurring-schedules) produces those due ranges; this is where they're placed.
- **Starts are usually homes.** ServiceTitan routes from the technician's validated, usually home, address; a wrong start distorts every first and last leg.
- **Ungeocoded addresses fail loudly.** Housecall Pro turns a job without coordinates into a time block that doesn't affect the route; ServiceTitan requires validated addresses. Either way, report them before the run, not as a mysterious unassigned visit after it.

## Weighing the Objective

A solver minimizes one number, so drive time, miles, overtime, lateness, unserved work, fairness and preferred technicians all have to be folded into it, and the folding decides what kind of plan comes back. My default is levels for what must hold, unserved work priced by a skip penalty, and a weighted sum in money for everything else, with labor per hour and vehicle cost per mile taken from real costs, and the weights kept as versioned, approved objective profiles per branch, territory or policy. That is its own chapter, [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives): weighted sums versus levels, why time is not distance, why metro and rural branches weigh differently, a worked example, integer scaling, and how to calibrate and test weights.

## Re-Optimization: Freezing and Pinning

A plan starts decaying the moment it's published. A technician calls in sick, a stop runs long, a customer cancels, an urgent job arrives. Re-running the whole optimization from scratch fixes the plan and breaks everything around it: customers already told an arrival time, technicians already driving, parts already loaded. Every mature product has the same two answers.

**Freezing** makes everything before a point in time unchangeable. Timefold's `freezeTime` divides the plan so that everything before it is fixed, and a matching `minStartTravelTime` keeps rescheduled travel out of the past. Google's `injectedSolutionConstraint` freezes portions of routes already done or not to be modified, and `injectedFirstSolutionRoutes` steers the solver toward the previous plan. The overnight auto-scheduler in the table above has a freeze window that leaves near-term visits out of the nightly run.

**Pinning** fixes a single visit's time or technician. ServiceTitan doesn't move Confirmed jobs, Housecall Pro has a lock icon, and OptimoRoute's `lockType` keeps planned routes or their resources while fitting new orders around them. In the volume's model, chapter 1's `visits.is_locked` is the full pin: the optimizer leaves the visit's technician and time alone. This chapter adds two columns to `visits`, a softer pin to a technician whose time may still move, and the version number that the apply step checks:

```sql
ALTER TABLE visits
  ADD COLUMN pinned_resource_id UUID REFERENCES resources (id),  -- this technician, any time; null = any
  ADD COLUMN row_version        INTEGER NOT NULL DEFAULT 1;      -- incremented on every write
```

![One technician's day as a row of stops: two done, one on site, the next stop whose customer already has an ETA, then a movable stop, a pinned stop and another movable stop. A shaded frozen region covers everything up to now plus the freeze window; after that edge, movable stops may be reordered or moved to another technician, while the pinned stop keeps its time and technician.](/diagrams/fo-route-optimization-freeze.svg "Re-optimization only touches what's after the freeze edge, and even there pinned visits stay put. The freeze window protects the stop a customer was just told about.")

The scope of a re-optimization should be a parameter, not a fixed behavior. Spoke's live plans expose it directly: re-optimize only the changed stops (the default), reorder all stops, or redistribute stops between drivers. A dispatcher absorbing one cancellation wants the first; a sick call needs the third ([Dispatch & the Day of Service](/docs/industries/field-operations/dispatch#exceptions-and-same-day-changes)). Make the freeze window a branch setting (long enough to cover the next stop and the customer notification already sent), and let dispatchers pin with a reason.

## Runs Are Jobs, and Results Go Stale

Optimization is slow by request standards: seconds for a technician's day, minutes for a branch-week. Every vendor that publishes its mechanics makes it asynchronous (Google's long-running operations, Routific's `/vrp-long`, Onfleet's schedule, start and apply steps, Mapbox's 202-then-200 polling). Build it the same way ([Background Jobs](/docs/architecture/background-jobs)): a run record, a worker that calls the engine with a time limit, and a completion event.

![The optimization pipeline: build a snapshot of visits, shifts and pins with an input version; get a travel matrix from a routing engine; run the solver as an async job; receive a candidate plan with routes, ETAs and unassigned visits, which go to a pool with reasons; check the input versions and review the diff; then apply in one transaction. If a version changed while the job ran, the result is discarded and re-solved from a new snapshot.](/diagrams/fo-route-optimization-pipeline.svg "Optimistic concurrency applied to a solve: the plan is computed from a snapshot and committed only if that snapshot's versions still match the live schedule.")

The hard part is the gap between the snapshot and the commit. While the solver worked, a dispatcher moved a visit, a customer cancelled, a booking landed. Applying the result blindly undoes those changes. This is the ordinary lost-update problem, and the standard answer is **optimistic concurrency**: Fowler's Optimistic Offline Lock "prevents conflicts between concurrent business transactions by detecting a conflict and rolling back the transaction." A solve is a long business transaction, so treat it like one; Timefold's real-time planning likewise resubmits a modified copy of the previous input rather than patching a result computed from stale data. So:

- **Version the inputs.** Every write to a visit or shift increments its `row_version`, and the run records the version of every row it read. At apply time, compare. If anything in scope changed, either discard and re-run, or apply only the parts whose inputs are unchanged and report the rest ([Transactions & Concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency)).
- **Apply in one transaction,** and stamp each changed visit with the run ID, so every assignment can say which run produced it.
- **Serialize runs per scope.** Onfleet allows one optimization per user or key at a time, and one team auto-dispatch at a time; do the same per branch and date, or two runs will fight.
- **Preview before applying.** Onfleet makes apply an explicit step ("the result will not apply unless this endpoint is called"); the overnight auto-scheduler above offers a dry-run preview; Skedulo lets users accept, modify or decline. Show the diff: visits moved, technicians changed, arrival times shifted beyond the window, customers who'll be notified.
- **Notify on meaningful change only,** and coalesce: one message per customer whose day or window moved, sent after apply ([Customer Communications](/docs/industries/field-operations/customer-communications)). Housecall Pro's choice between saving with or without notifications is the minimum.

## Explaining the Result

A plan nobody trusts gets overridden by hand, and then the optimizer is an expensive suggestion. Explanations build trust, and the engines give you the raw material:

- **Why a visit wasn't placed.** Esri returns violated-constraint codes on unassigned orders (capacity, time window, unmatched specialty, unreachable), and Spoke a reason such as `impossible_time_window`. Map them to plain language and show them on the pool.
- **What the plan costs.** VROOM's summary reports cost, duration, waiting time and violations; Timefold reports overtime and a fairness percentage. Show travel, overtime, lateness and balance per technician and in total, next to the same numbers for the plan it replaces.
- **Why this technician.** Salesforce's graded candidates are the model: for any visit, the rules it passed and the objective scores that ranked the winner.

Measure it afterwards too: planned versus actual drive time, the share of visits sent to the pool, and how often dispatchers override it ([Operating Metrics](/docs/industries/field-operations/operating-metrics)).

## Build, Buy or Integrate

Few companies should write a VRP solver. **Use the FSM's optimizer** when its scope matches the business: a single-technician reorder suits a shop where the office picks the day and the person, not a recurring-route business placing hundreds of due visits a night. **Call a hosted API** when you own the scheduling model but not the solver; you get traffic-aware matrices, pay per run or stop, and send customer locations to a processor your vendor review must cover. **Run a library** with a self-hosted OSM engine when cost, data residency or unusual constraints outweigh traffic data. Whichever you choose, keep your own problem model and translate at the edge ([Platform Architecture](/docs/industries/field-operations/platform-architecture)), so switching engines is one adapter and two can run on the same snapshot for comparison.

## Auditing Optimization

An optimizer makes thousands of decisions a night that affect pay, customer promises and compliance, so every run is a record:

- **The run:** who or what triggered it, scope, engine and version, rule versions and the objective profile version in force, the snapshot reference, time limit and outcome.
- **The result and the apply:** each assignment with technician, sequence and planned arrival, each unassigned visit with its reason, who applied it, the diff against the previous plan and which changes were rejected as stale.
- **Manual overrides:** every pin, lock, move and unpin, with before and after and a reason.

ServiceTitan logs each optimization in the job's audit trail. The records answer a customer disputing that they were ever scheduled, a technician claiming routes favored someone else (a pay question when routes drive commission), a regulator asking why a licensed applicator wasn't assigned, and an engineer asking why the plan did something strange. Keep input snapshots as long as you might need to reproduce a run. Recording automated decisions in general is in [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions); field retention periods are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Your own problem model** of visits, resources, windows, skills and pins, translated to whichever engine you use.
- **Hard and soft rules as versioned configuration,** with levels and skip penalties, and the version recorded on every run.
- **Objective profiles** priced in money, versioned and tested by replay ([Weighing the Routing Objective](/docs/industries/field-operations/route-objectives)).
- **Overtime as a soft end and a hard end,** fairness as a weighted objective, and a cap on movable multi-day work.
- **A cached travel matrix** from a routing engine, keyed by location pair and time bucket.
- **Asynchronous runs** with a run record, a time limit, one run per scope at a time, and a completion event.
- **Freezing and pinning** for every re-optimization (`is_locked` for a full pin, `pinned_resource_id` for a technician pin), with the freeze window as a setting and the scope (changed stops, all stops, redistribute) as a parameter.
- **Stale-result detection** by `row_version`, with a reviewed diff and one-transaction apply.
- **Unassigned work in a pool with reasons,** never silently dropped, and explanations of why each visit went where it did.
- **A full audit trail** of runs, results, applies and overrides, with snapshots kept long enough to reproduce a run.

## References

**Specifications**

- [EPA: Section 608 of the Clean Air Act](https://www.epa.gov/section608), the stationary refrigeration rules covering ozone-depleting refrigerants and their substitutes, such as HFCs, and technician certification

**Reference**

- [Martin Fowler: Optimistic Offline Lock](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html), detecting a conflict between concurrent business transactions and rolling back
- [Google OR-Tools: Vehicle Routing Problem with Time Windows](https://developers.google.com/optimization/routing/vrptw), time as a dimension with cumulative variables, slack for waiting, and solution windows
- [Google OR-Tools: Penalties and Dropping Visits](https://developers.google.com/optimization/routing/penalties), disjunctions that let the solver drop a visit at a penalty
- [Google OR-Tools: Routing Options](https://developers.google.com/optimization/routing/routing_options), first-solution strategies, guided local search, and time limits
- [VROOM: API documentation](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md), jobs, vehicles, skills, priority 0 to 100, vehicle costs (fixed, per hour, per km), plan mode and the unassigned array
- [VROOM issue 834: Are results deterministic?](https://github.com/VROOM-Project/vroom/issues/834), the maintainer on the same search path for the same problem and setup, and no random seed
- [OR-Tools issue 4843: Inconsistent solver results](https://github.com/google/or-tools/issues/4843), a maintainer describing guided local search as not deterministic
- [Timefold: Constraints](https://docs.timefold.ai/field-service-routing/latest/user-guide/constraints), hard, medium and soft levels
- [Timefold: Real-time planning](https://docs.timefold.ai/field-service-routing/latest/real-time-planning/real-time-planning), freeze time, minimum start travel time, pinning and resubmission
- [Timefold: Shift hours and overtime](https://docs.timefold.ai/field-service-routing/latest/vehicle-resource-constraints/shift-hours-and-overtime), soft and hard shift ends and overtime between them
- [Timefold: Fairness](https://docs.timefold.ai/field-service-routing/latest/vehicle-resource-constraints/fairness), balancing time utilization with historical utilization and a fairness percentage
- [Timefold: Multi-day schedules and movable visits](https://docs.timefold.ai/field-service-routing/latest/visit-service-constraints/multi-day-schedules-and-movable-visits), movable visits, earliest-day preference and the occupation cap
- [Google Maps Platform: Route Optimization overview](https://developers.google.com/maps/documentation/route-optimization/overview), shipments, vehicles, constraints and the three methods
- [Google Maps Platform: ShipmentModel](https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/ShipmentModel), vehicle cost per hour, per traveled hour and per kilometer, fixed cost, penalty cost and one cost unit
- [Google Maps Platform: optimizeTours](https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/projects/optimizeTours), injected solutions, freezing, refresh without re-solving, traffic and deadlines
- [Routific: API endpoints](https://docs.routific.com/docs/api-endpoints), synchronous requests capped by size and the `/vrp-long` asynchronous endpoint
- [Routific: Options](https://docs.routific.com/docs/options), default objective, shortest distance, balance, and overtime and lateness limits
- [OptimoRoute: API](https://optimoroute.com/api/), planning jobs, balancing modes, starting from current routes, lock types and priorities
- [HERE: Tour Planning quick start](https://docs.here.com/tour-planning/docs/quick-start), size-capped synchronous problems and the asynchronous path for larger ones
- [Mapbox: Optimization API v2](https://docs.mapbox.com/api/navigation/optimization/), objectives, window types, location and rate limits, and the dropped list
- [NextBillion: Route Optimization API](https://docs.nextbillion.ai/optimization/route-optimization-api), task and rate limits, soft constraints, mandatory skills and re-optimization
- [Esri: Vehicle Routing Problem service](https://developers.arcgis.com/rest/services-reference/enterprise/vehicle-routing-problem-service/), hard windows, cost per unit time, distance and overtime, overtime start and violated-constraint codes
- [GraphHopper: Route Optimization API](https://docs.graphhopper.com/openapi/route-optimization/solveasyncvrp), objectives, hard relations, skills and synchronous limits
- [OSRM: API documentation](https://project-osrm.org/docs/v5.24.0/api/), table matrices of fastest routes and the trip heuristic
- [Valhalla: API reference](https://valhalla.github.io/valhalla/api/), route, optimized route, matrix, isochrone and map matching services
- [openrouteservice](https://github.com/GIScience/openrouteservice), directions, matrices, isochrones and snapping over OpenStreetMap

**In practice**

- [ServiceTitan: Optimize Technician Route](https://help.servicetitan.com/docs/use-optimize-technician-route), single-day reorder, Confirmed jobs left alone, home-address starts and audit-trail entries
- [Housecall Pro: Optimize by Drive Time](https://help.housecallpro.com/en/articles/14093813-optimize-by-drive-time), single-day reorder with locks, anytime jobs and optional notifications
- [Jobber: Route optimization](https://help.getjobber.com/es/articles/route-optimization-new-schedule/), anytime visits only, up to 7 days and fixed first or last stops
- [FieldRoutes: An introduction to Intelligent Routing](https://knowledgebase.fieldroutes.com/docs/an-introduction-to-intelligent-routing.md), grouping, Equal Stop and Auto Optimize, vehicle constraints and pushed-back due dates
- [Salesforce Trailhead: Examine scheduling policies](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/examine-scheduling-policies), work rules, service objectives and the mandatory rules
- [Salesforce Trailhead: Customize a scheduling policy](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/customize-a-scheduling-policy), default policies (Customer First, High Intensity, Soft Boundaries, Emergency), objective weights and switching policies during the day
- [Microsoft Learn: Resource Scheduling Optimization overview](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-overview), ranked goals and overnight, intraday and emergency scenarios
- [SAP Learning: Implementing scheduling techniques](https://learning.sap.com/courses/managing-sap-field-service-management/implementing-scheduling-techniques), manual, assisted and automatic scheduling and policies
- [Solea: Scheduling and dispatch](https://www.solea.ai/product/scheduling-dispatch), overnight auto-scheduling, freeze window, locks, dry-run preview and the job pool
- [Spoke Dispatch: API reference](https://developer.dispatch.spoke.com/api), long-running optimization, live plans and re-optimization types
- [Onfleet: Route optimization](https://docs.onfleet.com/reference/route-optimization), the schedule, start and apply steps and one optimization at a time
- [Skedulo: Optimization of schedules (developer guide)](https://docs.skedulo.com/developer-guides/manage-and-schedule-work/optimization-of-schedules/), hard, medium and soft constraints, and results to accept, modify or decline
- [Skedulo: Optimize schedules](https://docs.skedulo.com/user-guides/manage-scheduling-availability/optimization-of-schedule/manage-and-use-route-optimization/optimize-schedules), results not replicated across runs with the same data
- [Bringg: A day in the life of an ops manager](https://help.bringg.com/docs/a-day-in-the-life-of-a-bringg-ops-manager), different results on each run and focused changes to existing plans
