+++
title = "Load Planning & Optimization"
nav_title = "Load Planning"
description = "Turning shipments into loads: mode choice, consolidation, multi-stop truckloads, pool distribution, cube and weight, hours of service, and plans as runs."
category = "Logistics & Supply Chain Industry"
order = 2832
part = "Planning and Execution"
tags = ["logistics", "load-planning", "optimization", "consolidation", "truckload", "data-model"]
+++

Load planning decides how a day's shipments travel: which go parcel, which go LTL, which are combined into a truckload, which share a multi-stop truck to three consignees, which ride a linehaul to a pool point and fan out on local trucks. A shipper with two hundred shipments leaving a distribution center tomorrow can tender two hundred LTL shipments or build thirty truckloads, and the difference is often a large share of its freight bill. A broker plans loads less often (its customers tender loads already built) but consolidates LTL into volume moves; a carrier plans the reverse problem, which loads its trucks take, in [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations).

It is hard because every combination has to be feasible on several measures at once and the measures belong to different domains. The freight has to fit the trailer by weight, floor positions and cube, with stacking rules; the stops have to be reachable inside each facility's appointment window, in order, with the driver's remaining hours of service; the freight has to be compatible (no food with certain hazmat, no frozen with dry unless the trailer is set for it); and the result has to cost less than the alternatives, which means rating every candidate against the agreements in force, including stop-off charges and out-of-route miles. Solving this well is a vehicle routing problem with pickup and delivery, time windows and capacities; Field Operations owns that problem and its solvers ([The Problem, Stated Precisely](/books/field-operations/route-optimization#the-problem-stated-precisely), [What Exists: Solvers and Routing APIs](/books/field-operations/route-optimization#what-exists-solvers-and-routing-apis)). This chapter covers what is specific to freight.

It covers mode choice, consolidation, multi-stop truckloads, pool distribution, cube, weight and floor space, continuous moves, how plans are run, frozen and accepted, and the records that hold them. It extends `loads`, `load_shipments`, `stops` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Pricing each candidate is [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials); the trailer types, the bridge formula and deadhead are [Truckload](/books/logistics/truckload); the hours-of-service clocks are [Hours of Service](/books/logistics/hours-of-service).

## How the Platforms Do It

As of November 2026, from vendor product pages and documentation (each vendor's claims are its own):

| Vendor | Planning scope, as described | Constraints and options named | Execution link |
| --- | --- | --- | --- |
| **Blue Yonder** (Transportation Management) | "Optimization and Planning," "intelligent optimization and load planning" for complex global networks | Not detailed on the page | "Faster multimodal execution" |
| **Manhattan Associates** (Active Transportation Management) | "Optimize loads, routes, modes, carriers, and constraints together"; plans "re-optimize[d] as capacity, rates, demand, and disruptions change" | Private fleet and common carrier capacity "in the same optimization run" with its Dispatch product | Shared data with its WMS for dock and door decisions; a customer reports cutting "empty miles by 8%" |
| **SAP** (S/4HANA Transportation Management) | Carrier selection after planning, by priority, cost, business share and allocations | Allocation capacity buckets per dimension (volume, weight, TEU); continuous moves or round trips allowed, disallowed or set per lane; incompatibilities checked when enabled | Ranked carriers feed tendering |
| **Trimble** (PC\*Miler and TMS) | Mileage and truck routing underneath planning: "practical, shortest or fastest routing options" | Truck-specific routing | Mileage for billing, driver pay and audit |
| **Field Operations' routing engines** (OR-Tools and peers) | The general vehicle routing problem with time windows and capacities | Covered in [What Exists: Solvers and Routing APIs](/books/field-operations/route-optimization#what-exists-solvers-and-routing-apis) | Not freight-specific |

Three patterns:

- **Planning and carrier choice are one problem in the suites.** Manhattan's "loads, routes, modes, carriers" in one run and SAP's carrier selection with allocations and business shares both treat the cheapest load as the one that is cheapest with the carrier that will take it, not the one with the fewest miles.
- **Capacity has several dimensions.** SAP's allocation buckets count volume, weight and containers separately; a trailer is full on whichever runs out first, and planners need all three on every handling unit.
- **Plans are re-run.** Re-optimizing "as capacity, rates, demand, and disruptions change" means a plan is a run with inputs and a time, not a permanent structure; the parts already tendered are frozen ([Re-Optimization: Freezing and Pinning](/books/field-operations/route-optimization#re-optimization-freezing-and-pinning)).

## Choosing the Mode

The first decision for each shipment is the mode, and it is a cost comparison under service constraints. The candidates for a domestic shipment of a few pallets:

| Option | When it wins | What it costs |
| --- | --- | --- |
| **Parcel** | A few cartons under the parcel carrier's limits | Per package by weight, zone and dimensional weight ([Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight)) |
| **LTL** | One to about six pallets to one consignee | Discounted base rate by class or density and weight, plus fuel and accessorials ([Base Rates, Weight Breaks and Discounts](/books/logistics/freight-classification#base-rates-weight-breaks-and-discounts)) |
| **Volume LTL or partial truckload** | More pallets than LTL prices well, not a full trailer | A quote by linear feet or pallets, often from the LTL carrier's capacity rules ([Cube, Length and Capacity Rules](/books/logistics/freight-classification#cube-length-and-capacity-rules)) |
| **Multi-stop truckload** | Several shipments along a route that together fill a trailer | Linehaul plus stop-off charges and out-of-route miles |
| **Pool distribution** | Many small shipments to one region | A truckload to a pool point plus local delivery per shipment |
| **Direct truckload** | A full trailer to one consignee | Linehaul plus fuel |

The comparison needs a rate for every candidate on the same basis, which is why the rating engine is called by the planner many times per run, and why its quotes are cached for the run's duration rather than written as charges ([The Rating Engine](/books/logistics/rating-and-accessorials#the-rating-engine)). LTL also has a ceiling the planner must respect: carriers' capacity-load and lineal-foot rules reprice large LTL shipments, so an "LTL" option above those thresholds isn't the price the base tariff suggests.

## Consolidation

Consolidation groups shipments onto one load. The candidates are shipments with compatible origins, destinations along a common path, overlapping windows, and freight that can ride together. The rules that make a group feasible:

- **Windows.** Each pickup and delivery inside its appointment or window, in the facility's time zone, with realistic dwell at each stop (an hour or two at a live load, minutes at a drop).
- **Order.** Pickups before their deliveries; for a truckload with several deliveries, the unload order compatible with the load order (the last stop's freight goes in first, at the nose).
- **Compatibility.** Hazmat segregation (Hazardous Materials in Transport owns the table), temperature (one setpoint per trailer compartment), food and non-food rules a shipper sets, and customers that require dedicated trailers.
- **Capacity.** Weight, floor positions and cube (the next section).
- **Hours.** The trip's driving and on-duty time against the clocks a driver will have (below).
- **Cost.** The consolidated load, priced with stop-offs and out-of-route miles, beats the sum of the alternatives; otherwise the shipments go separately.

Consolidation also changes what each shipper pays. A broker or 3PL consolidating several customers' freight on one truck bills each customer under its own agreement and pays the carrier once, so the receivable and payable lines are per shipment and per load respectively ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)); the allocation of the load's cost back to shipments, for a shipper's cost reporting, is a rule (by weight, by distance, by stand-alone rate) and is recorded with the plan.

## Multi-Stop Truckloads

A multi-stop truckload is one `loads` row with several `stops`, and every extra stop has a price and a time. J.B. Hunt's published carrier rule pays a stop-off added after tender at "$50 + Out of Route miles," at the load's per-mile rate, which is the shape most agreements use: a fee per stop beyond the first pickup and last delivery, plus the miles the detour adds. The planner prices both, and it also prices the stop's time: a stop with an hour and a half of dwell consumes the driver's 14-hour window as surely as driving does.

Sequencing the stops is a small traveling-salesman problem with time windows, usually solved exactly for the handful of stops a truckload has, or taken from the mileage engine's route. What makes freight sequencing different is that the plan has to be executable at the dock: the freight for the first delivery must be at the tail of the trailer, so the stop order fixes the loading order, and the WMS must build the trailer in reverse stop sequence. A plan that resequences stops after the trailer is loaded is a plan the driver can't follow.

Hours of service bound every multi-stop plan. A property-carrying driver may drive 11 hours inside a 14-hour window after 10 hours off, with a 30-minute break after 8 hours of driving and a cycle limit of 60 or 70 hours ([The Limits](/books/logistics/hours-of-service#the-limits)). A shipper planning loads for common carriers doesn't know which driver will run them, so it checks the plan against a fresh driver's clocks (a trip that needs more than 11 hours of driving or 14 on duty needs a rest stop or a team); a carrier or private fleet planning its own drivers checks against each driver's current clocks from `hos_clock_snapshots`, the vendor-reported or computed clocks [Hours of Service](/books/logistics/hours-of-service#how-to-build-it) defines, and projects them forward with the calculator there ([A Calculator](/books/logistics/hours-of-service#a-calculator)).

## Pool Distribution

Pool distribution (pooling) consolidates many small shipments bound for one region into a truckload to a **pool point**, a cross-dock or terminal in the region, where the freight is broken down and delivered locally on smaller trucks or LTL. It trades a linehaul truckload plus local delivery against many long-haul LTL shipments, and it wins when a region receives enough small shipments every day or week to fill a trailer. Retail store replenishment and regional distribution of a manufacturer's orders are the classic cases; LTL carriers' own linehaul and pickup-and-delivery networks are the same idea run by the carrier ([LTL Networks](/books/logistics/ltl-networks#the-network)).

For the data model, a pooled shipment rides two loads: the linehaul (leg 1, from the shipper to the pool point) and a local delivery (leg 2), which is what `load_shipments.leg` is for. The pool point is a `facilities` row of kind `cross_dock`, with the postal codes it serves and the operator that runs it; its cutoff time (freight must arrive by a time to make the next day's local routes) is a planning constraint, and its handling charge is a line on the shipment. Zone skipping, the parcel version of the same move (trucking parcels past the carrier's origin sort to inject them closer to the consignee), follows the same two-leg model.

## Cube, Weight and Floor Space

A trailer is full by one of three measures, and the planner checks all three on every candidate:

- **Weight.** The federal limit on the Interstate System is 80,000 pounds gross vehicle weight, 20,000 on any single axle and 34,000 on a tandem (23 CFR 658.17), and the bridge formula can lower the gross for a given axle spacing; [Truckload](/books/logistics/truckload#equipment) owns the axle check. Freight payload is what's left after the tractor and trailer's tare; ArcBest describes a 53-foot dry van as able to "accommodate up 45,000 pounds of freight," a figure to read as typical, since the real limit is the specific tractor and trailer's tare and axle spacing.
- **Floor positions.** A 53-foot dry van has "up to 26 standard pallet positions across their floor space" (ArcBest): 48-by-40-inch pallets two across and thirteen deep, loaded straight. Turned or pinwheeled pallets can fit more where the trailer's interior width allows, and stackable freight doubles positions only when the combined height and the pallets' stacking limits allow it.
- **Cube.** Light freight runs out of space before weight; the trailer's interior length, width and height (which vary by manufacturer and by lining) bound it. The handling units' dimensions as tendered, and as measured by the carrier where LTL freight was dimensioned, are the input ([Reweighs, Inspections and Reclassification](/books/logistics/freight-classification#reweighs-inspections-and-reclassification)).

The planner works per handling unit, not per line: a pallet's footprint, height, weight and stackability decide where it can go, and `handling_units.stackable` is already in the core model. Exact three-dimensional loading (which pallet where) is a bin-packing problem most freight planners approximate with floor positions and a stacking rule; the actual position of each handling unit, once loaded, is recorded per load in [LTL Networks](/books/logistics/ltl-networks#how-to-build-it)' `load_handling_units`. The equipment's own capacity (payload, floor positions, interior dimensions, compartments) is data per equipment type, not a constant in code, because a 53-foot reefer, a 48-foot flatbed and a 40-foot high-cube container each carry a different envelope.

A feasibility check for one candidate load, run thousands of times by a planner and once more before a planner approves:

```go tab="Go"
type Capacity struct {
	PayloadG       int64 // freight weight allowed for this tractor and trailer
	FloorPositions int   // single-stacked 48x40 positions
	CubeL          int64 // interior volume in liters
}

type Unit struct {
	WeightG     int64
	Positions   float64 // floor positions this unit occupies (1 for a 48x40 pallet)
	VolumeL     int64
	Stackable   bool
	StackHeight int // units of this kind that fit in one position's height
}

type Stop struct {
	WindowStart, WindowEnd time.Time // the appointment, in UTC
	DriveFromPrev          time.Duration
	Dwell                  time.Duration
}

type Problem struct{ Reason string }

// Feasible checks weight, floor, cube, stop windows and the driver's hours for a
// candidate load. Stops are in planned order; start is when the truck is first available.
func Feasible(c Capacity, units []Unit, stops []Stop, start time.Time,
	driveLeft, windowLeft time.Duration) []Problem {
	var probs []Problem
	var w, v int64
	var floor float64
	for _, u := range units {
		w += u.WeightG
		v += u.VolumeL
		if u.Stackable && u.StackHeight > 1 {
			floor += u.Positions / float64(u.StackHeight)
		} else {
			floor += u.Positions
		}
	}
	if w > c.PayloadG {
		probs = append(probs, Problem{"over payload weight"})
	}
	if floor > float64(c.FloorPositions) {
		probs = append(probs, Problem{"over floor positions"})
	}
	if v > c.CubeL {
		probs = append(probs, Problem{"over cube"})
	}

	t, drive, onDuty := start, time.Duration(0), time.Duration(0)
	for i, s := range stops {
		t = t.Add(s.DriveFromPrev)
		drive += s.DriveFromPrev
		onDuty += s.DriveFromPrev
		if t.Before(s.WindowStart) {
			onDuty += s.WindowStart.Sub(t) // waiting at the dock counts against the window
			t = s.WindowStart
		}
		if t.After(s.WindowEnd) {
			probs = append(probs, Problem{fmt.Sprintf("stop %d misses its window", i+1)})
		}
		t = t.Add(s.Dwell)
		onDuty += s.Dwell
	}
	if drive > driveLeft {
		probs = append(probs, Problem{"needs more driving than the driver has left"})
	}
	if onDuty > windowLeft {
		probs = append(probs, Problem{"runs past the driver's on-duty window"})
	}
	return probs
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};

pub struct Capacity { pub payload_g: i64, pub floor_positions: u32, pub cube_l: i64 }

pub struct Unit {
    pub weight_g: i64,
    pub positions: f64, // floor positions this unit occupies (1.0 for a 48x40 pallet)
    pub volume_l: i64,
    pub stackable: bool,
    pub stack_height: u32, // units of this kind that fit in one position's height
}

pub struct Stop {
    pub window_start: DateTime<Utc>,
    pub window_end: DateTime<Utc>,
    pub drive_from_prev: Duration,
    pub dwell: Duration,
}

/// Weight, floor, cube, windows and hours for a candidate load; empty when feasible.
pub fn feasible(c: &Capacity, units: &[Unit], stops: &[Stop], start: DateTime<Utc>,
                drive_left: Duration, window_left: Duration) -> Vec<String> {
    let mut problems = Vec::new();
    let weight: i64 = units.iter().map(|u| u.weight_g).sum();
    let volume: i64 = units.iter().map(|u| u.volume_l).sum();
    let floor: f64 = units.iter().map(|u| {
        if u.stackable && u.stack_height > 1 { u.positions / u.stack_height as f64 } else { u.positions }
    }).sum();
    if weight > c.payload_g { problems.push("over payload weight".into()); }
    if floor > c.floor_positions as f64 { problems.push("over floor positions".into()); }
    if volume > c.cube_l { problems.push("over cube".into()); }

    let (mut t, mut drive, mut on_duty) = (start, Duration::zero(), Duration::zero());
    for (i, s) in stops.iter().enumerate() {
        t = t + s.drive_from_prev;
        drive = drive + s.drive_from_prev;
        on_duty = on_duty + s.drive_from_prev;
        if t < s.window_start {
            on_duty = on_duty + (s.window_start - t); // waiting counts against the window
            t = s.window_start;
        }
        if t > s.window_end { problems.push(format!("stop {} misses its window", i + 1)); }
        t = t + s.dwell;
        on_duty = on_duty + s.dwell;
    }
    if drive > drive_left { problems.push("needs more driving than the driver has left".into()); }
    if on_duty > window_left { problems.push("runs past the driver's on-duty window".into()); }
    problems
}
```

The hours check here is the first-order one (driving and window against what's left); a trip long enough to need the 30-minute break, a 10-hour rest or a sleeper split is projected with the full calculator in [Hours of Service](/books/logistics/hours-of-service#a-calculator). The function returns every problem, not the first, because a planner deciding which shipment to drop needs to see that a load is both overweight and late.

## Continuous Moves

A continuous move (or round trip) links loads so that one carrier's truck delivers the first and picks up the second nearby, with little empty driving between. For a shipper, it is a way to buy two loads at a lower total from a carrier that would otherwise deadhead; SAP's carrier selection lets continuous moves be "allowed, disallowed, or set per transportation lane." For a carrier, it is the deadhead problem [Truckload](/books/logistics/truckload#deadhead) describes, solved from the shipper's side. The plan records the link between the loads and the discount it was priced at, and tenders them as a pair; if the carrier rejects one, the other's price no longer holds, which is a rule the tender carries.

## Plans as Runs

A planning run takes a set of shipments, equipment, carrier capacities and rates as of a moment, and returns a set of proposed loads with costs. Field Operations covers how solver runs behave as jobs: they take time, their results go stale as inputs change, and they must be explainable ([Runs Are Jobs, and Results Go Stale](/books/field-operations/route-optimization#runs-are-jobs-and-results-go-stale), [Explaining the Result](/books/field-operations/route-optimization#explaining-the-result)). Freight adds three rules:

- **Freeze what's tendered.** Once a load is tendered, re-planning must not move its shipments without unwinding the tender, so a run pins tendered and covered loads and plans only around them. A planner who wants to break a covered load does so explicitly, and the carrier gets a revision or a cancellation ([Changes and Cancellations](/books/logistics/tendering#changes-and-cancellations)).
- **Accept per load, not per run.** A run proposes thirty loads; the planner accepts twenty-six, edits two and rejects two. Each accepted proposal becomes a `loads` row in `planning` status, and the run records which proposals became which loads.
- **Keep the objective's weights with the run.** Cost against service against utilization is a weighted objective ([Weighing the Objective](/books/field-operations/route-optimization#weighing-the-objective)); the weights, the rate versions and the HOS ruleset used are the run's inputs, so a load's plan can be reproduced and defended.

## How to Build It

The core model has loads, their stops and the shipments on them, and handling units with dimensions, weight and stackability. Planning adds the equipment's capacity as data, the planned utilization and costs on each load, planned arrival times on stops, pool points, and planning runs with their proposals. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE equipment_capacity_profiles (  -- an equipment type's envelope, as data
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id   UUID REFERENCES parties (id),  -- null: a default profile
  equipment_type   TEXT NOT NULL,        -- '53_dry_van', '53_reefer', '48_flatbed', '40_high_cube'
  payload_g        BIGINT NOT NULL CHECK (payload_g > 0),
  floor_positions  SMALLINT NOT NULL CHECK (floor_positions > 0),  -- 48x40, straight
  interior_length_mm INT NOT NULL,
  interior_width_mm  INT NOT NULL,
  interior_height_mm INT NOT NULL,
  compartments     SMALLINT NOT NULL DEFAULT 1,  -- multi-temperature reefers
  max_stops        SMALLINT,             -- an operating rule, not a physical one
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE NULLS NOT DISTINCT (owner_party_id, equipment_type, valid_during)
);

ALTER TABLE handling_units
  ADD COLUMN floor_positions NUMERIC(4, 2),  -- 1.00 for a 48x40 pallet; more for oversize
  ADD COLUMN stack_limit     SMALLINT,       -- how many may stack, this one included
  ADD COLUMN compatibility   TEXT[] NOT NULL DEFAULT '{}';  -- 'food', 'frozen', hazmat classes
ALTER TABLE handling_units ADD CONSTRAINT handling_units_stack_limit_check
  CHECK (stack_limit IS NULL OR stack_limit >= 1) NOT VALID;

ALTER TABLE loads
  ADD COLUMN load_plan_run_id   UUID,
  ADD COLUMN capacity_profile_id UUID,
  ADD COLUMN planned_weight_g   BIGINT,
  ADD COLUMN planned_positions  NUMERIC(5, 2),
  ADD COLUMN planned_volume_l   BIGINT,
  ADD COLUMN planned_cost       BIGINT,  -- the rated estimate when planned, minor units
  ADD COLUMN continuous_with_load_id UUID,  -- the paired load of a continuous move
  ADD COLUMN frozen_at          TIMESTAMPTZ;  -- set at tender; later runs leave it alone
ALTER TABLE loads ADD CONSTRAINT loads_capacity_profile_fkey
  FOREIGN KEY (capacity_profile_id) REFERENCES equipment_capacity_profiles (id) NOT VALID;
ALTER TABLE loads ADD CONSTRAINT loads_continuous_fkey
  FOREIGN KEY (continuous_with_load_id) REFERENCES loads (id) NOT VALID;

ALTER TABLE stops
  ADD COLUMN planned_arrival       TIMESTAMPTZ,  -- from the plan, beside appointment and actual
  ADD COLUMN planned_drive_minutes INT,          -- from the previous stop
  ADD COLUMN planned_dwell_minutes INT,
  ADD COLUMN out_of_route_tenths   INT,          -- miles the stop adds, for stop-off pricing
  ADD COLUMN billable_stop_off     BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE pool_points (               -- a cross-dock that breaks down pooled freight
  facility_id      UUID PRIMARY KEY REFERENCES facilities (id),
  operator_party_id UUID NOT NULL REFERENCES parties (id),
  serves           TEXT[] NOT NULL,      -- lane keys: 'zip3:303', 'zip3:300'
  cutoff_local     TIME NOT NULL,        -- linehaul must arrive by, in the facility's zone
  delivery_days    SMALLINT NOT NULL DEFAULT 1,  -- days from cutoff to local delivery
  handling_charge  BIGINT,               -- per shipment, minor units
  currency         CHAR(3) NOT NULL,
  valid_during     TSTZRANGE NOT NULL
);

CREATE TABLE load_plan_runs (            -- one optimization or manual planning run
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  scope           JSONB NOT NULL,        -- origins, ship dates, modes considered
  shipment_count  INT NOT NULL,
  inputs_hash     BYTEA NOT NULL,        -- shipments, rates and capacities as of the run
  objective       JSONB NOT NULL,        -- weights: cost, service, utilization
  solver          TEXT NOT NULL,         -- 'manual', the vendor engine, or the internal one
  solver_version  TEXT NOT NULL,
  hos_ruleset     TEXT,                  -- the hos_rulesets code checked against
  status          TEXT NOT NULL CHECK (status IN ('queued', 'running', 'proposed',
                    'partially_accepted', 'accepted', 'discarded', 'failed')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  baseline_cost   BIGINT,                -- every shipment rated alone, for comparison
  planned_cost    BIGINT,
  currency        CHAR(3) NOT NULL
);

CREATE TABLE load_plan_moves (           -- one proposed load and what became of it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  load_plan_run_id UUID NOT NULL REFERENCES load_plan_runs (id),
  proposal_number  INT NOT NULL,
  mode             TEXT NOT NULL,        -- 'truckload', 'ltl', 'pool_linehaul', 'parcel'
  shipment_ids     UUID[] NOT NULL,
  stop_sequence    JSONB NOT NULL,       -- facility, kind and planned times, in order
  estimated_cost   BIGINT NOT NULL,
  cost_allocation  JSONB,                -- per shipment, and the rule used
  problems         TEXT[] NOT NULL DEFAULT '{}',  -- soft violations accepted with the plan
  decision         TEXT CHECK (decision IN ('accepted', 'edited', 'rejected')),
  decided_by       TEXT,
  decided_at       TIMESTAMPTZ,
  load_id          UUID REFERENCES loads (id),  -- the load it became
  UNIQUE (load_plan_run_id, proposal_number)
);

ALTER TABLE loads ADD CONSTRAINT loads_load_plan_run_fkey
  FOREIGN KEY (load_plan_run_id) REFERENCES load_plan_runs (id) NOT VALID;
CREATE INDEX CONCURRENTLY loads_plan_run_idx ON loads (load_plan_run_id);
```

What a run saved, and how full its loads were:

```sql
SELECT r.id,
       r.baseline_cost, r.planned_cost,
       r.baseline_cost - r.planned_cost                          AS saving,
       count(l.id)                                               AS loads,
       round(avg(l.planned_positions / p.floor_positions), 3)    AS avg_floor_utilization,
       round(avg(l.planned_weight_g::numeric / p.payload_g), 3)  AS avg_weight_utilization
FROM load_plan_runs r
JOIN loads l ON l.load_plan_run_id = r.id
JOIN equipment_capacity_profiles p ON p.id = l.capacity_profile_id
WHERE r.id = $1
GROUP BY r.id, r.baseline_cost, r.planned_cost;
```

And the shipments a re-plan may move, everything on the owner's open loads that isn't frozen:

```sql
SELECT ls.shipment_id, ls.load_id
FROM load_shipments ls
JOIN loads l ON l.id = ls.load_id
WHERE l.owner_party_id = $1
  AND l.status = 'planning'
  AND l.frozen_at IS NULL;
```

Design notes:

- **Capacity is data per equipment type and owner.** A carrier's reefer and a shipper's leased trailer have different envelopes; the planner reads `equipment_capacity_profiles`, never constants.
- **Planned, appointed and actual are three columns on a stop.** `planned_arrival` is the plan's, `appointment` the facility's, `arrived_at` the event's; on-time measures compare the last two, plan quality the first and last ([Planned Versus Actual](/books/logistics/logistics-business#the-core-data-model)).
- **Runs are reproducible.** The inputs hash, solver version, objective weights and HOS ruleset are stored; a run can be replayed against a new solver before switching ([Replay and Shadow Testing](/docs/building-blocks/weighing-objectives#replay-and-shadow-testing)).
- **Freezing is a column, set at tender.** Re-planning reads `frozen_at` and leaves those loads alone.
- **Proposals keep their fate.** Accepted, edited and rejected proposals are rows, so the planner's overrides become feedback on the optimizer.
- **Allocated cost is recorded with its rule.** A shipment's share of a consolidated load's cost is a decision; the rule and the result live with the proposal, not in the freight charges, which stay per load on the payable side.

## Auditing

- **Every planning run** with its inputs hash, solver, objective, HOS ruleset, baseline and planned cost.
- **Every proposal and its decision,** by whom and when, and the load it became.
- **Every load's planned weight, positions, volume and cost** beside what was actually loaded and billed.
- **Every pool point's cutoff and service area** with validity, for the shipments that missed a cutoff.
- **Every continuous move pairing** and the price it depended on.

## What This Means for the System You Build

- **Compare modes on rated cost** for every candidate, with the rating engine as the planner's oracle and quotes cached per run.
- **Check weight, floor positions and cube together,** per handling unit, against capacity profiles held as data.
- **Fix the loading order from the stop order,** and send it to the warehouse with the plan.
- **Check hours of service** against a fresh driver for common-carrier loads and against real clocks from `hos_clock_snapshots` for your own drivers.
- **Model pooling and multi-leg moves with `load_shipments.leg`** and pool points as facilities with cutoffs.
- **Treat plans as runs:** freeze what's tendered, accept per load, and keep the inputs to reproduce them.
- **Leave the VRP and solver mechanics to Field Operations' [Route Optimization](/books/field-operations/route-optimization),** and add freight's constraints on top.

## References

**Regulations**

- [23 CFR 658.17: Weight](https://www.law.cornell.edu/cfr/text/23/658.17), the 80,000-pound gross, 20,000-pound single axle and 34,000-pound tandem limits

**Vendors and carriers**

- [Manhattan Associates: Transportation management](https://www.manh.com/solutions/supply-chain-management-software/transportation-management), joint optimization of loads, routes, modes and carriers, re-optimization and private fleet planning
- [Blue Yonder: Transportation management](https://blueyonder.com/solutions/transportation-management), optimization and load planning
- [SAP Learning: Carrier selection](https://learning.sap.com/courses/planning-and-execution-in-sap-s-4hana-transportation-management/carrier-selection), allocation capacity by volume, weight and TEU, continuous moves per lane and incompatibilities
- [Trimble: PC\*Miler](https://transportation.trimble.com/en/solutions/mapping-and-routing/pcmiler), practical, shortest and fastest truck routing
- [ArcBest: What you need to know about dry van shipping](https://arcb.com/blog/what-you-need-to-know-about-dry-van-shipping), 26 pallet positions and about 45,000 pounds of freight in a 53-foot dry van
- [J.B. Hunt: Standardized accessorials in Carrier 360 (December 11, 2020)](https://www.jbhunt.com/blog/j-b-hunt-360/carrier/standardized-accessorials-in-carrier-360), the stop-off charge of $50 plus out-of-route miles
