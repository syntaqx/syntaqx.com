+++
title = "Weighing the Routing Objective"
nav_title = "Weighing the Objective"
description = "Pricing a field routing objective: labor and mileage rates, time versus distance, metro and rural profiles, a worked example and the pitfalls."
category = "Field Operations Industry"
order = 1511
part = "Scheduling and Routing"
tags = ["field-operations", "routing", "optimization", "objectives", "vrp"]
+++

[Route Optimization](/books/field-operations/route-optimization) covers the problem you hand a solver: visits, resources, windows, hard rules, freezing, async runs and applying the result safely. This chapter is about the one input that decides what kind of plan comes back, the objective.

A solver minimizes one number. Everything the business cares about (drive time, miles, overtime, lateness, unserved work, how evenly the day is shared, which technician a customer prefers) has to be folded into that number before the solve starts, and the folding gives a plan its character. Two branches running the same engine on the same kind of work can want different plans, and the difference lives in the weights, not the solver. The weights are also where policy hides: a number that quietly drops outlying customers is a business decision nobody approved.

## Two Ways to Fold

The general choice, a **weighted sum** that prices every term on one scale or a **lexicographic** objective that ranks them in levels, and why most designs use both, is in [Two Ways to Fold](/docs/architecture/weighing-objectives#two-ways-to-fold). Field routing engines land on the same shape: Timefold scores plans in hard, medium and soft levels, with unassigned visits on the medium level and priced costs at the bottom, while Dynamics' RSO ranks its goals instead of weighting them. The level arrangement has a field cost: with unassigned visits above travel, the solver will add two hours of driving to place one low-priority inspection.

Inside the bottom level, magnitudes interact. A skip penalty is the price at which the solver may sell a visit. If serving an outlying stop takes a 50-minute detour of 40 miles, and a minute of labor costs $0.75 and a mile $0.76 (the rates below), the detour costs 50 × 0.75 + 40 × 0.76 = $67.90. A skip penalty of $50 tells the solver to drop that customer, and nothing in the output says the weights did it. Google's Route Optimization API makes the safe choice the default: a shipment with no `penalty_cost` must be performed.

## Time Is Not Distance

Drive time and distance are correlated, which is why a plan tuned on one looks reasonable on the other, but they diverge where the money is. A highway leg is long and fast; a crosstown leg on surface streets is short and slow. Traffic stretches time without adding miles, and tolls add money without adding either.

Set the ratio from real costs. A technician's hour costs the wage plus burden (payroll taxes, insurance, benefits); a vehicle mile costs fuel or energy, maintenance, tires and the depreciation that mileage drives. If you don't yet know your fleet's per-mile cost, the IRS business standard mileage rate is a public starting point: 72.5 cents a mile for January through June 2026 and 76 cents from July 1, 2026. It's a reimbursement rate, a proxy, not your fleet's cost; a loaded service truck costs more per mile than the average car. With $45 an hour of loaded labor (illustrative) and $0.76 a mile, an hour of driving costs as much as about 59 miles, so a minute is worth roughly a mile: a detour that saves five minutes pays if it adds fewer than five miles.

Every engine has a place for those numbers:

| Engine | Time | Distance | Other terms |
| --- | --- | --- | --- |
| Esri ArcGIS VRP | `CostPerUnitTime` over route duration | `CostPerUnitDistance` | `CostPerUnitOvertime`, `FixedCost`, order `Revenue` |
| Google Route Optimization | `cost_per_hour` (whole route, incl. waiting and visits) or `cost_per_traveled_hour` (travel only) | `cost_per_kilometer` | `fixed_cost`; `penalty_cost` per shipment; global duration cost |
| OR-Tools | Arc cost evaluator from a time callback | Arc cost evaluator from a distance callback | Span cost coefficients; disjunction penalties |
| Routific | Default: driving time and working hours | `shortest_distance` | `balance` of shift times; `min_vehicles` |
| Salesforce Field Service | Minimize Travel and ASAP objectives | Not published | Preferred Resource, Skill Level, Minimize Overtime, weighted |
| Timefold FSR | Minimize travel time, per second | Minimize travel distance, per meter (weight 0 by default) | Any soft constraint's weight |
| VROOM | `costs.per_hour` of travel (default 3600, so cost is travel seconds) | `costs.per_km` (default 0) | `costs.fixed` per vehicle used; priority |

A few details matter. Google's `cost_per_hour` also charges waiting and visit time, so it's where paid labor goes; `cost_per_traveled_hour` is for costs that accrue only while moving. In OR-Tools the arc cost is whatever the callback returns, so a money objective is one callback that prices a leg's seconds and meters together, and balance is a separate lever: the VRP guide sets a global span coefficient of 100, which "makes the global span the predominant factor in the objective function" and so minimizes the longest route. Timefold penalizes travel per second and distance per meter, units that can't be compared without weights, and its docs say the two goals are not typically used together; pick one, or convert both to money before they reach the solver. Salesforce states the trade-off in plain words: ASAP "can contradict other objectives," because the earliest slot often means more travel.

Price every term in money and per leg, scaled to integers where the engine needs them ([One Unit, Preferably Money](/docs/architecture/weighing-objectives#one-unit-preferably-money); [Integer Scaling](/docs/architecture/weighing-objectives#integer-scaling)). At $0.76 a mile a per-meter price rounds to zero cents, while a 6,400-meter leg priced in one step is 302 cents.

## Why Places Weigh Differently

The right ratio depends on where the trucks drive and who drives them:

- **Dense metro branches** lose time to traffic, parking and building access while covering few miles. Weight time, and judge plans by stops per hour. Salesforce's Soft Boundaries policy, which lets workers cross small territories, is aimed at urban areas.
- **Rural and sprawling branches** spend hours on highway legs where the fastest and shortest routes diverge most, and fuel is a large share of cost. Weight distance more, and check the first and last legs from technicians' homes, which can dominate the day.
- **Electric fleets** cost less per mile but have range and charging time. Range is a limit, not a price.
- **Toll regions** need tolls on the arc as money, or a toll-avoiding matrix, chosen deliberately.
- **Overtime-heavy or union labor** makes the overtime premium the dominant term; pair a steep overtime cost with soft and hard shift ends ([Route Optimization](/books/field-operations/route-optimization#how-to-build-it)), and encode any seniority or route rules the agreement sets as rules, not weights.
- **High-value commercial work** carries SLA credits or contract risk for lateness, so lateness penalties outweigh travel.
- **Seasonal peaks** trade efficiency for throughput. Salesforce's High Intensity policy ranks travel minimization and grouping first to get through as many appointments as possible, for periods such as storms, and dispatchers switch policies during the day as conditions change.

So weights are configuration, scoped to a branch, territory or policy, versioned, approved and effective from a date, like any other rule ([Rules as Data](/docs/architecture/rules-as-data); [Territories & Capacity](/books/field-operations/territories-and-capacity) owns the scopes). A sketch, with made-up values:

```json
{
  "objective_profiles": [
    {
      "name": "metro_dense", "version": 7, "valid_during": "[2026-11-02,)",
      "currency": "usd", "labor_per_hour": 45.00, "overtime_per_hour": 67.50,
      "vehicle_per_mile": 0.76, "tolls": "as_cost",
      "late_per_minute": 2.00, "skip_penalty_base": 400.00,
      "fairness": { "measure": "route_minutes", "per_minute_of_spread": 0.20 },
      "preferred_tech_bonus": 15.00, "approved_by": "ops_director"
    },
    {
      "name": "rural_wide", "version": 3, "valid_during": "[2026-09-14,)",
      "currency": "usd", "labor_per_hour": 41.00, "overtime_per_hour": 61.50,
      "vehicle_per_mile": 1.10, "tolls": "avoid",
      "late_per_minute": 0.75, "skip_penalty_base": 650.00,
      "fairness": { "measure": "drive_minutes", "per_minute_of_spread": 0.10 },
      "preferred_tech_bonus": 25.00, "approved_by": "ops_director"
    }
  ]
}
```

The rural profile's higher skip penalty is deliberate: outlying customers are exactly the ones a distance-heavy objective is tempted to drop.

## A Worked Example

The numbers here are illustrative. One technician, six stops, 270 minutes of service in total, an eight-hour regular day, labor at $45 an hour, overtime at $67.50, and a vehicle cost of $0.76 a mile. The same stops are solved twice: once weighted only by time (like VROOM's default cost per hour of travel) and once only by distance (like Routific's `shortest_distance`).

![Two panels with the same depot and six stops, A to F. On the left, weighted by time, the route takes the highway out to the far stop C and works back C, D, E, B, A, F on local streets: 3.0 hours and 92 miles of driving, a 7.5-hour day with no overtime, $407.42. On the right, weighted by distance, the route is a compact loop on surface streets, F, E, D, C, B, A: 4.0 hours and 58 miles, an 8.5-hour day with half an hour of overtime, $437.83.](/diagrams/fo-route-optimization-weights.svg "Same stops, two weightings (illustrative numbers). The shorter route costs more here because labor and overtime outweigh the 34 miles it saves; at a high enough cost per mile, the result flips.")

| Illustrative | Weighted by time | Weighted by distance |
| --- | --- | --- |
| Order | C, D, E, B, A, F | F, E, D, C, B, A |
| Driving | 3.0 h, 92 mi | 4.0 h, 58 mi |
| Day (driving plus 4.5 h service) | 7.5 h | 8.5 h |
| Overtime | None | 0.5 h |
| Labor | 7.5 × $45 = $337.50 | 8 × $45 + 0.5 × $67.50 = $393.75 |
| Vehicle | 92 × $0.76 = $69.92 | 58 × $0.76 = $44.08 |
| Total | $407.42 | $437.83 |

The distance-weighted plan saves 34 miles and costs $30.41 more, because the extra hour of driving pushes the day into overtime. The comparison isn't fixed, though. The labor difference is $56.25, so the shorter route wins once a mile costs more than $56.25 ÷ 34, about $1.65. At $2.00 a mile (a heavy truck, illustrative), the time-weighted plan costs $337.50 + $184.00 = $521.50 and the distance-weighted one $393.75 + $116.00 = $509.75. Neither single-term weighting is right; the cost ratio decides, and a solve with both terms in money would choose between these routes, or find a third that beats both.

## Pitfalls

Weights are set by replay and shadow runs, not by meeting ([Calibrating Weights](/docs/architecture/weighing-objectives#calibrating-weights); [Replay and Shadow Testing](/docs/architecture/weighing-objectives#replay-and-shadow-testing)). For routing, replay a season of real days from the optimization audit trail, including storms and short-staffed days, and compare a scorecard of drive hours, miles, stops per hour, window adherence, overtime, unassigned visits and fairness spread. Routing days can't be split between profiles without the halves competing for the same technicians, and Skedulo and Bringg both document different results between runs on the same data, so solve each day several times per profile and shadow a branch for a few weeks before switching on an effective date. What goes wrong:

- **Weights that encode hidden policy.** A low skip penalty for low-revenue customers, or a preference that keeps one technician off a neighborhood, is a business decision made in a number. Name it, and have someone accountable approve it.
- **Ignoring what dispatchers override.** If dispatchers keep moving the same kind of visit, the weights disagree with them. Override rates by reason ([Operating Metrics](/books/field-operations/operating-metrics#route-efficiency)) are the best calibration signal you have.
- **Fairness that holds only on average.** Equal mean route minutes can hide one technician who gets every long Friday drive. Measure the worst technician over several weeks, not the branch average, and where pay is commissioned ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)), measure revenue per technician too.

## Auditing

A weight is a decision that touches pay and service, so it gets the same record as any other rule:

- **The profile version on every run.** Each optimization run records the objective profile name and version it used, beside the rule versions, so a strange plan can be traced to the weights that produced it ([Route Optimization](/books/field-operations/route-optimization#auditing-optimization) keeps the rest of the run record).
- **Profile changes** with before and after values, who proposed and approved them, the effective date, and the replay or shadow results that justified the change.
- **Cost by term per run,** so a later question ("why did the north branch stop serving the lake houses?") can be answered from the run's own breakdown, not a re-solve.

Recording which rule version decided is covered in [Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided), and the record structure in [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions).

## What This Means for the System You Build

- **Objective profiles per branch, territory or policy:** every term priced in one unit (money), labor per hour and vehicle per mile from real costs, versioned, approved and effective-dated.
- **Levels for what must hold,** a skip penalty that reflects priority and lateness, and a weighted sum for everything else.
- **Integer-safe scaling,** priced per leg, with each run's cost reported by term.
- **A weights test bench:** replay of historical snapshots under candidate profiles, several runs each, a scorecard of drive time, miles, window adherence, overtime and fairness tails, and a shadow period before a branch switches.
- **The profile version on every run,** and every profile change approved and recorded.

## References

**Reference**

- [IRS: Standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates), the 2026 business rates of 72.5 cents a mile through June 30 and 76 cents from July 1
- [Google OR-Tools: Vehicle Routing Problem](https://developers.google.com/optimization/routing/vrp), the arc cost evaluator and a global span coefficient that minimizes the longest route
- [VROOM: API documentation](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md), vehicle costs (fixed, per hour, per km) and their defaults, and priority
- [Timefold: Constraints](https://docs.timefold.ai/field-service-routing/latest/user-guide/constraints), hard, medium and soft levels
- [Timefold: Route optimization](https://docs.timefold.ai/field-service-routing/latest/vehicle-resource-constraints/route-optimization), travel time per second, travel distance per meter and why they're rarely combined
- [Google Maps Platform: ShipmentModel](https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/ShipmentModel), vehicle cost per hour, per traveled hour and per kilometer, fixed cost, and a shipment with no penalty treated as mandatory
- [Routific: Options](https://docs.routific.com/docs/options), default objective, shortest distance, balance and minimum vehicles
- [Esri: Vehicle Routing Problem service](https://developers.arcgis.com/rest/services-reference/enterprise/vehicle-routing-problem-service/), cost per unit time, distance and overtime, fixed cost and order revenue

**In practice**

- [Salesforce Trailhead: Examine scheduling policies](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/examine-scheduling-policies), the service objectives and how ASAP contradicts travel
- [Salesforce Trailhead: Customize a scheduling policy](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/customize-a-scheduling-policy), High Intensity and Soft Boundaries policies, objective weights and switching policies during the day
- [Microsoft Learn: Resource Scheduling Optimization overview](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-overview), goals ranked rather than weighted
- [Skedulo: Optimize schedules](https://docs.skedulo.com/user-guides/manage-scheduling-availability/optimization-of-schedule/manage-and-use-route-optimization/optimize-schedules), results "often not replicated across multiple optimization runs with the same data"
- [Bringg: A day in the life of an ops manager](https://help.bringg.com/docs/a-day-in-the-life-of-a-bringg-ops-manager), a different result on each run over the same orders
