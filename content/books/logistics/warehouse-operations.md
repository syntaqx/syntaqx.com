+++
title = "Picking, Packing & Labor"
nav_title = "Picking, Packing & Labor"
description = "Slotting, waves versus waveless, pick methods and the task queue, packing, engineered labor standards, and the warehouse quota laws of five states."
category = "Logistics & Supply Chain Industry"
order = 2839
part = "Warehouses and Yards"
tags = ["logistics", "warehouse", "picking", "slotting", "labor-management", "quota-laws", "data-model"]
+++

Picking is where a warehouse spends its labor. Receiving and putaway move full pallets a few times; picking touches every order line, in eaches and cases, against a cutoff, thousands of times a shift, and most of a picker's time is walking between locations rather than taking product off a shelf. Everything a WMS does on the outbound side exists to cut that walk or make it count: slotting puts fast movers where the walk is short, waves and their successors group work so one trip fills several orders, the task queue interleaves replenishment and picks so nobody travels empty, and packing chooses the box that costs least to ship. Labor management then measures each task against an engineered standard and tells a supervisor who is behind.

That last step is now regulated. Since California's AB 701 took effect in 2022, five states (California, Washington, New York, Minnesota and Oregon) require large warehouse employers to disclose every quota in writing and give workers the right to their own work speed data on a deadline, and four of them forbid quotas that prevent meal and rest breaks or bathroom use. A labor standard used to discipline is a quota under those laws, so the system that computes standards is also the system that must produce the records, and the data model that separates direct work from breaks is what makes compliance provable.

The brand's view of picking methods (discrete, batch, zone and cluster) is in [Inside a Warehouse](/books/commerce/warehouses-and-3pls#inside-a-warehouse), and carton choice as a shipping cost is [Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight); this chapter goes deeper from the operator's side. It covers slotting and a worked slotting score, waves, waveless release and order streaming, pick methods and the task queue, packing and cartonization, value-added services, labor standards with worked numbers, and the quota laws. It extends `orders`, `order_lines` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and the locations, plates and balances from [Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it). Payroll, overtime and break premiums for warehouse workers are the Workforce volume's ([Breaks and Premiums](/books/workforce/breaks-and-premiums#california-rest-periods)).

## How the Platforms Do It

As of November 2026, from vendor documentation and product pages:

| Vendor | Releasing work | Slotting | Labor |
| --- | --- | --- | --- |
| **Blue Yonder** | "AI-driven execution adapts work as warehouse conditions change" | Not described on its WMS page | Workforce & Labor Management, to "measure performance accurately, uncover improvement opportunities, and help managers drive productivity" |
| **Infios** | Not compared here | Not compared here | "Calculate labor and equipment standards, configure travel times," "capture direct, indirect and lost-time activities," with "personal time, fatigue and delay allowances" and "actuals versus standard" in real time |
| **Manhattan Associates** | Order Streaming, which keeps work moving "without waiting for the next wave or manual intervention" | "Integrating slotting and re-slotting decisions directly into putaway and picking workflows" | Labor management and slotting "run together in one cloud-native application" with the WMS |
| **Microsoft** (Dynamics 365) | Wave templates processed manually, automatically at release, at weight, shipment and line thresholds, or by assigning lines to an open wave until a cutoff | Fixed locations per product or variant in location directives | Not compared here |
| **Oracle** (Warehouse Management Cloud and Workforce Management) | Wave templates, dynamic wave search and multiple wave instances | A reslotting workbench that matches item velocity codes to location rankings and creates the moves | Goals per activity per month, productivity % as goal time over actual time, utilization against clocked time |

Three patterns:

- **Waves are giving way to streams, not disappearing.** Manhattan sells waveless release; Microsoft's templates can process a wave the moment a line is released, which is waveless by configuration; Oracle still schedules waves. The data model needs both: a wave is a batch with a release time, a stream is a wave of one released continuously, and the task queue underneath is the same.
- **Slotting is a recurring decision, not a setup.** Oracle's workbench re-ranks against "current Item velocity"; Manhattan builds re-slotting into putaway and picking. Velocity shifts with season and promotion, so assignments carry validity dates and every move a re-slot creates is an ordinary task.
- **Labor standards are engineered elements plus travel plus allowances.** Infios names all three; Oracle varies goals by item group, unit and month, with higher goals in peak. The standard is data with an effective date, and what it is used for (coaching, pay incentives, discipline) decides which laws apply.

## Slotting

Slotting assigns items to pick locations. The inputs are the item's velocity (how many order lines pick it a week, which drives trips, and how many units, which drives replenishment), its cube and weight per unit, and each location's travel distance from the start of the pick path, its height band and its capacity. The rules of thumb are standard: fast movers closest to the front of the path and in the "golden zone" between waist and shoulder height, heavy items low, items often ordered together near each other, and a pick face sized to hold several days of demand so it isn't replenished every hour. Oracle's reslotting workbench reduces the decision to matching: each item gets an "Item-Facility Velocity Code," each location a ranking, and the workbench "identifies mismatches between item velocity and location rankings and generates replenishment tasks to re-slot the material," checking before it creates them "that the mismatches still exist."

Ranking is the simple version. Scoring is the version that handles trade-offs, because a fast mover that is also bulky may cost more in replenishments in a small golden-zone slot than it saves in travel. A score puts every cost in one unit (seconds of labor a week) and treats fit as a hard constraint ([Hard and Soft Constraints](/docs/building-blocks/weighing-objectives#hard-and-soft-constraints)):

```go tab="Go"
package slotting

// ItemDemand is one item's weekly demand at the face, from the last few weeks of picks.
type ItemDemand struct {
	SKU          string
	LinesPerWeek int64 // order lines picked: each is a trip to the face
	UnitsPerWeek int64 // units picked: these drain the face
	UnitCubeCm3  int64
	UnitWeightG  int64
}

// Slot is a candidate pick face.
type Slot struct {
	Barcode     string
	TravelDs    int64 // round-trip travel from the path, in deciseconds
	Golden      bool  // between waist and shoulder height
	CapacityCm3 int64
}

// Costs are the building's configured labor times, in deciseconds.
type Costs struct {
	ReplenishDs    int64 // one replenishment trip from reserve
	AwkwardPickDs  int64 // extra time per line for a heavy item outside the golden zone
	HeavyG         int64 // what counts as heavy here
	MinCoverDays   int64 // the face must hold at least this many days of demand
}

// WeeklyCost is the labor a week of putting it in s costs, in deciseconds,
// and false if the face can't hold the minimum cover.
func WeeklyCost(it ItemDemand, s Slot, c Costs) (int64, bool) {
	weeklyCube := it.UnitsPerWeek * it.UnitCubeCm3
	if weeklyCube*c.MinCoverDays > s.CapacityCm3*7 {
		return 0, false
	}
	cost := it.LinesPerWeek * s.TravelDs
	if s.CapacityCm3 > 0 && weeklyCube > 0 {
		trips := (weeklyCube + s.CapacityCm3 - 1) / s.CapacityCm3 // round up
		cost += trips * c.ReplenishDs
	}
	if it.UnitWeightG >= c.HeavyG && !s.Golden {
		cost += it.LinesPerWeek * c.AwkwardPickDs
	}
	return cost, true
}

// Best returns the cheapest slot that fits, and false if none does.
func Best(it ItemDemand, slots []Slot, c Costs) (Slot, int64, bool) {
	var best Slot
	var bestCost int64
	found := false
	for _, s := range slots {
		cost, ok := WeeklyCost(it, s, c)
		if ok && (!found || cost < bestCost) {
			best, bestCost, found = s, cost, true
		}
	}
	return best, bestCost, found
}
```

```rust tab="Rust"
/// One item's weekly demand at the face, from the last few weeks of picks.
pub struct ItemDemand {
    pub sku: String,
    pub lines_per_week: i64, // order lines picked: each is a trip to the face
    pub units_per_week: i64, // units picked: these drain the face
    pub unit_cube_cm3: i64,
    pub unit_weight_g: i64,
}

/// A candidate pick face.
#[derive(Clone)]
pub struct Slot {
    pub barcode: String,
    pub travel_ds: i64, // round-trip travel from the path, in deciseconds
    pub golden: bool,   // between waist and shoulder height
    pub capacity_cm3: i64,
}

/// The building's configured labor times, in deciseconds.
pub struct Costs {
    pub replenish_ds: i64,
    pub awkward_pick_ds: i64,
    pub heavy_g: i64,
    pub min_cover_days: i64,
}

/// Weekly labor of putting the item in the slot, or None if the face can't hold the cover.
pub fn weekly_cost(it: &ItemDemand, s: &Slot, c: &Costs) -> Option<i64> {
    let weekly_cube = it.units_per_week * it.unit_cube_cm3;
    if weekly_cube * c.min_cover_days > s.capacity_cm3 * 7 {
        return None;
    }
    let mut cost = it.lines_per_week * s.travel_ds;
    if s.capacity_cm3 > 0 && weekly_cube > 0 {
        let trips = (weekly_cube + s.capacity_cm3 - 1) / s.capacity_cm3; // round up
        cost += trips * c.replenish_ds;
    }
    if it.unit_weight_g >= c.heavy_g && !s.golden {
        cost += it.lines_per_week * c.awkward_pick_ds;
    }
    Some(cost)
}

/// The cheapest slot that fits, with its cost.
pub fn best(it: &ItemDemand, slots: &[Slot], c: &Costs) -> Option<(Slot, i64)> {
    slots
        .iter()
        .filter_map(|s| weekly_cost(it, s, c).map(|cost| (s.clone(), cost)))
        .min_by_key(|(_, cost)| *cost)
}
```

Worked numbers with illustrative costs (a replenishment trip of 90 seconds, an awkward pick of 3 seconds, heavy at 10 kg, two days' minimum cover): an item picked on 700 lines and 1,400 units a week at 2,000 cm³ a unit needs 2,800,000 cm³ a week, so two days' cover is 800,000 cm³. A golden-zone face 8 seconds round trip holding 1,000,000 cm³ costs 700 × 80 + 3 × 900 = 58,700 deciseconds, about 98 minutes a week; a floor-level bulk face 14 seconds out holding 3,000,000 cm³ costs 700 × 140 + 1 × 900 = 98,900, about 165 minutes. The near face wins despite three replenishments a week. The same item at 6,000 cm³ a unit fails the near face's cover check outright and goes to the bulk face, which is the trade-off ranking alone misses.

A real slotting run solves all items at once (an assignment problem, because two items can't take the same face), limits how many moves it proposes (each re-slot is labor and a window where the item is in two places) and explains its proposals ([Explaining a Decision](/docs/building-blocks/weighing-objectives#explaining-a-decision)). Assignments carry their run and validity, so a pick in March can be judged against the slotting in force in March.

## Waves, Waveless and Order Streaming

A wave is a set of order lines released to the floor together, allocated, turned into tasks and worked as a group. Waves exist because grouping lets the building batch picks of the same item, plan replenishment before picks need it, and finish everything for a carrier's trailer before its departure. Microsoft's templates show the controls a wave needs: which lines it takes (a query over released lines, evaluated in template order, most specific first), when it processes (manually, at release, or "automatically at threshold" on weight, shipments or lines), and the methods it runs in sequence (allocate, replenish, containerize, create work). Its own example is a cutoff: to ship by 24 hours every order placed by noon, a template assigns lines to an open wave until 12:00 and then processes it.

The cost of waves is idle time and lumpiness: pickers wait for the next release, the end of each wave has a tail of a few slow orders, and a late order misses the wave it needed. Waveless release (Manhattan's Order Streaming) releases each order, or a small batch, as soon as it is allocatable and a worker or a machine is free, prioritized by its ship-by time. It suits buildings with automation that sorts and consolidates downstream (a put wall or a sorter can reassemble orders picked in any sequence) and e-commerce profiles of many small orders. Waves still suit buildings that load trailers by route and departure, where everything for a door must be finished together.

For the system, the difference is a release policy, not a different data model. Every release creates allocations and tasks; a wave groups them under a release with a cutoff, and a stream is a release per order. The scheduler's question is the same either way: which work, released now, keeps every order ahead of its ship-by time given the labor and equipment available.

## Pick Methods and the Task Queue

The methods (discrete, batch, zone, cluster) are in [Inside a Warehouse](/books/commerce/warehouses-and-3pls#inside-a-warehouse). Operators combine them with the unit of pick and the device:

- **By unit.** Full-pallet picks go from reserve by forklift (often the inbound plate shipped as it came), case picks from a pallet flow or floor face onto a pallet or conveyor, and each picks from shelving or a goods-to-person port into totes.
- **By device.** RF handhelds and ring scanners, voice (the system speaks the location and the picker speaks a check digit), pick-to-light and put walls (a light shows which slot gets the unit), and goods-to-person automation where the location comes to the picker ([Warehouse Automation](/books/logistics/warehouse-automation)).
- **By flow.** Pick and pass (a tote moves zone to zone), pick then sort (a batch is sorted to orders afterward), or pick to order.

Underneath is the task queue. A task is one unit of directed work: pick this quantity from this location to this plate, put this plate away, replenish this face, count this location, load this pallet. Oracle's tasks are created **Ready**, visible on the RF task list, or **HELD**, invisible until released; then Processing Started, Completed or Cancelled. Three behaviors make the queue efficient:

- **Dependencies.** A pick that needs a replenishment first is held until the replenishment completes; Oracle supports holding and releasing replenishment-dependent picking tasks, and Microsoft can start an immediate replenishment when a pick can't allocate.
- **Priority by deadline.** A task's priority comes from its order's ship-by time and its trailer's departure, recomputed as time passes, not from creation order.
- **Interleaving.** A forklift driver who puts a pallet away near a face that needs replenishment is given that replenishment next, so neither trip runs empty. Interleaving needs every task's location, which is why tasks carry from and to locations as foreign keys, not text.

A short pick (the face holds less than the system thought) is the event that matters most: the task records the shortfall, the order line is reallocated or backordered, and an opportunistic count is created for the face ([Cycle Counting](/books/logistics/warehouse-management#cycle-counting)).

## Packing and Cartonization

Packing turns picked units into outbound plates. Cartonization chooses the box before picking (so the picker picks into the shipping carton, which Oracle calls cubed picking) or at the pack station; either way it is a bin-packing problem over the item packaging table's dimensions, constrained by weight limits, crush rules and the items that may not share a carton. The objective is the carrier's bill: carriers price parcels by dimensional weight, so a box one size too large can cost more than the product's margin ([Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight)). Pack stations verify the contents by scan, weigh the carton against the expected weight (a variance flags a mis-pick before it ships), print the packing slip and label, and close the plate.

In the core model, the closed plate becomes a `handling_units` row on the outbound shipment with its measured dimensions and weight and, for retail freight, its SSCC; the link back to the plate is `handling_units.warehouse_lpn_id`. Pallets for LTL and truckload are built, wrapped, weighed and labeled the same way, and their measured density is what the carrier's class depends on ([Freight Class, Density & LTL Pricing](/books/logistics/freight-classification)).

## Value-Added Services

Buildings do more than store and ship: kitting (assembling components into a set), relabeling and ticketing for a retailer, retail compliance labeling, inserts, gift wrap, light assembly, returns inspection and refurbishment. Each is a task type with its own standard and, in a 3PL building, its own billable rate ([Contract Logistics & 3PL Billing](/books/logistics/contract-logistics)). Oracle has VAS location types and non-WMS activities with their own goals for this. The rule for the system: a value-added service consumes inventory and produces inventory (components become a kit, an unlabeled case becomes a labeled one), so it posts movements like any other task, and its labor is captured so it can be billed and measured.

## Labor Standards

A labor standard is the time a trained worker should take to do a task at a normal pace, plus allowances. Engineered standards build it from elements: a fixed time per task (get the task, scan the first location), a time per line, per case and per unit, travel computed from the task's actual distance and the equipment's speed, and an allowance for personal time, fatigue and delay (the three Infios names). Oracle defines goals per activity, varying "based on the SKU Line Group, UOM, Pre Pack or month of a year," and requires "at least one goal defined for each month of a year," with higher goals in peak seasons such as Black Friday.

Worked numbers with an illustrative standard (20 seconds a task, 8 a line, 3 a unit, travel at 4 feet a second, a 12% allowance): a pick task of 14 lines and 38 units over 620 feet of path has a base of 20 + 112 + 114 + 155 = 401 seconds and a goal of 401 × 1.12 = 449 seconds. A picker who completes it in 520 seconds performs at 449 / 520 = 86.3% on that task. Oracle's formulas are the standard ones: productivity is total goal time over total time on measured activities, times 100; utilization is time on activities over total clocked facility time; idle time is facility time minus activity time minus break time.

Three rules for the system:

- **Standards are versioned data,** per activity, facility and effective date, with the method (engineered study, historical average, estimate) and the study document behind each, because a disputed goal is answered with the study.
- **Compute the goal when the task is created,** from the task's actual lines, units and planned travel, and store it on the task. Recomputing goals later from a changed standard rewrites history.
- **Keep breaks, meals and indirect work as their own time categories.** Oracle has workers clock into breaks so the system can compare "actual time taken for a break versus the time allotted." Under the quota laws below, time for breaks and bathroom use can't count against a worker, so the record must show which minutes were which; an "idle" bucket that lumps them together is the record that loses a retaliation case.

## Quotas and the Law

Five states regulate warehouse quotas with statutes on a common pattern, and a sixth group of rules (federal OSHA) applies to every warehouse. The statutes define a quota broadly: California's is "a work standard under which an employee is assigned or required to perform at a specified productivity speed," which covers an engineered labor standard the moment it is used to judge a worker.

| | California | Washington | New York | Minnesota | Oregon |
| --- | --- | --- | --- | --- | --- |
| **Law** | AB 701 (2021), Labor Code 2100-2112 | RCW 49.84, effective July 1, 2024 | Warehouse Worker Protection Act, Labor Law 780-789 | Minn. Stat. 182.6526 (2023) | HB 4127, Oregon Laws 2024 chapter 36 |
| **Covered employers** | 100 or more employees at one warehouse distribution center, or 1,000 statewide | 100 at one, or 1,000 statewide, counting agency-supplied workers | 100 at one, or 1,000 statewide; couriers (NAICS 492110) included | 250 at one, or 1,000 statewide | 100 at one, or 1,000 statewide; refrigerated warehousing and couriers excluded |
| **Written description** | At hire, or within 30 days of the effective date | At hire, and within two business days of a change | At hire, and within two business days of a change | At hire; at least one working day before an increase | At hire, within two business days of a change, and with any adverse action for missing it |
| **Breaks** | No quota that "prevents compliance with meal or rest periods," including bathroom travel time | Rest breaks and bathroom time, with travel, can't count against the quota | Meal, rest and bathroom protected | Meal, rest, prayer and restroom protected | No break provision: a disclosure and records law |
| **Worker's data request** | Own last 90 days of work speed data, within 21 calendar days; a former employee gets one request | Own and aggregate data for six months, within seven business days (quota description in two); former employees for three years | Own and comparable workers' last 90 days, within 14 calendar days | Own and aggregate last 90 days, within four business days, up to four times a year | Own last 90 days, within 21 calendar days; former employees once, within three years |
| **Retaliation** | Rebuttable presumption for adverse action within 90 days of a request or complaint | Rebuttable presumption within 90 days | Rebuttable presumption within 90 days | No adverse action for missing a quota that prevents breaks | Civil penalty up to $1,000; no presumption |

New York added an injury reduction program (section 789): a written evaluation of the worksite by a "competent person," updated at least annually and within 30 days of a new or changed process, with review by a board-certified ergonomist when the employee safety committee asks. Minnesota triggers an investigation when a site's injury rate is at least 30% above its industry average. The table is a summary for building the system, not legal advice; Illinois's bill status and the effective dates of New York's original act and its 2024 amendment could not be confirmed from the official sites for this chapter. <!-- source-gap: logistics-warehouse-operations-quota-dates | status | Effective dates of New York's Warehouse Worker Protection Act and its section 789 amendment, Oregon HB 4127's effective date, and whether Illinois enacted a warehouse quota law | closes with: the NY chapter laws and approval dates on nysenate.gov, Oregon's session law effective date, and ilga.gov's bill status | checked: 2026-11-22 -->

Federal law adds safety, not quota disclosure. OSHA has no warehouse-specific standard, but its powered industrial truck standard requires that each operator be "competent to operate a powered industrial truck safely," with a performance evaluation "at least once every three years" and refresher training after an accident, a near miss or unsafe operation (29 CFR 1910.178(l)), and its materials handling standard requires "sufficient safe clearances" for aisles and stacks "limited in height" so they're stable (1910.176). OSHA's National Emphasis Program on warehousing and distribution center operations was reissued effective July 31, 2026 for five years (directive CPL 03-00-026), targeting powered industrial vehicles, material handling and storage, walking-working surfaces, egress, fire protection, heat and ergonomics, and removing the earlier version's mandatory screening for ergonomic and heat hazards. The Bureau of Labor Statistics counted 4.5 recordable injuries and illnesses per 100 full-time warehousing workers in 2025.

What the laws ask of the system:

- **Every quota is a disclosed, versioned document.** The text each worker received, the version and the date it was delivered, so "upon hire" and "within two business days of a change" can be shown per worker.
- **Work speed data is producible per worker on a clock.** A request is a record with its jurisdiction, its received date and a due date computed from the state's rule (21 calendar days, seven business days, four business days, 14 calendar days), and the export is a document kept with it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **The employer includes the staffing agency's workers.** Washington and California count agency-supplied workers toward the threshold, so the worker record names the employer of record separately from the operator of the building ([Staffing and Multiple Worksite Employers](/books/workforce/payroll-by-industry#staffing-and-multiple-worksite-employers)).
- **Protected time is never off-task time.** Break, meal and bathroom time are categories the performance calculation excludes, set by the jurisdiction's rule, and the retention of the underlying time records follows the Workforce volume ([Retention](/books/workforce/time-and-attendance#retention)).
- **Discipline cites the standard and the data.** Any adverse action linked to performance records which quota, which period and which data, because a 90-day presumption puts the burden on the employer's records.

## How to Build It

Operations adds the release of work and its measurement: waves, the task queue, slot assignments, workers, labor standards and time, and the quota records. Orders and their lines gain warehouse quantities. All `ALTER`s run on a live database ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- for the slot assignment exclusion below

ALTER TABLE orders
  ADD COLUMN ship_by                 TIMESTAMPTZ,  -- the building's deadline for this order
  ADD COLUMN released_to_warehouse_at TIMESTAMPTZ;

ALTER TABLE order_lines
  ADD COLUMN allocated_qty NUMERIC(14, 3) NOT NULL DEFAULT 0,
  ADD COLUMN picked_qty    NUMERIC(14, 3) NOT NULL DEFAULT 0,
  ADD COLUMN short_qty     NUMERIC(14, 3) NOT NULL DEFAULT 0;
ALTER TABLE order_lines ADD CONSTRAINT order_lines_warehouse_qty_check
  CHECK (allocated_qty >= 0 AND picked_qty >= 0 AND short_qty >= 0) NOT VALID;

ALTER TABLE handling_units
  ADD COLUMN packed_at       TIMESTAMPTZ,
  ADD COLUMN expected_weight_g BIGINT;      -- from the contents, for the pack-station check

CREATE TABLE waves (                     -- a release of work; a stream is a release per order
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id  UUID NOT NULL REFERENCES facilities (id),
  kind         TEXT NOT NULL CHECK (kind IN ('wave', 'stream', 'replenishment',
                 'work_order')),
  template_ref TEXT,                     -- the release rule that built it, and its version
  cutoff_at    TIMESTAMPTZ,              -- lines assigned until here
  status       TEXT NOT NULL CHECK (status IN ('open', 'released', 'in_progress',
                 'completed', 'cancelled')),
  released_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE warehouse_workers (         -- a person working the floor, and who employs them
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id       UUID NOT NULL REFERENCES facilities (id),
  person_party_id   UUID NOT NULL REFERENCES parties (id),
  employer_party_id UUID NOT NULL REFERENCES parties (id),  -- the operator or a staffing agency
  badge_ref         TEXT NOT NULL,
  hired_on          DATE,
  separated_on      DATE,
  status            TEXT NOT NULL CHECK (status IN ('active', 'leave', 'separated')),
  UNIQUE (facility_id, badge_ref)
);

CREATE TABLE warehouse_tasks (           -- one unit of directed work
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  kind               TEXT NOT NULL CHECK (kind IN ('pick', 'putaway', 'replenish', 'move',
                       'count', 'pack', 'load', 'unload', 'vas')),
  wave_id            UUID REFERENCES waves (id),
  order_line_id      UUID REFERENCES order_lines (id),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  item_id            UUID REFERENCES items (id),
  lot_id             UUID REFERENCES lots (id),
  from_location_id   UUID REFERENCES warehouse_locations (id),
  to_location_id     UUID REFERENCES warehouse_locations (id),
  lpn_id             UUID REFERENCES warehouse_lpns (id),
  quantity           NUMERIC(14, 3),
  uom                TEXT,
  depends_on_task_id UUID REFERENCES warehouse_tasks (id),  -- e.g. the replenishment first
  priority           INT NOT NULL,       -- recomputed from ship_by and departure
  status             TEXT NOT NULL CHECK (status IN ('held', 'ready', 'assigned',
                       'in_progress', 'completed', 'short', 'cancelled')),
  worker_id          UUID REFERENCES warehouse_workers (id),
  goal_ds            INT,                -- the standard, computed at creation, deciseconds
  labor_standard_id  UUID,               -- which standard computed it
  planned_travel_cm  INT,
  short_qty          NUMERIC(14, 3),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  CHECK (depends_on_task_id IS NULL OR depends_on_task_id <> id)
);
CREATE INDEX ON warehouse_tasks (facility_id, status, priority);

ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_task_fkey
  FOREIGN KEY (task_id) REFERENCES warehouse_tasks (id) NOT VALID;

CREATE TABLE slot_assignments (          -- which item a fixed pick face holds, and when
  location_id    UUID NOT NULL REFERENCES warehouse_locations (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  min_qty        NUMERIC(14, 3) NOT NULL,  -- replenish below this
  max_qty        NUMERIC(14, 3) NOT NULL,
  slotting_run_ref TEXT,                 -- the run that proposed it, and its score
  valid_during   TSTZRANGE NOT NULL,
  CHECK (max_qty >= min_qty),
  EXCLUDE USING gist (location_id WITH =, valid_during WITH &&)
);

CREATE TABLE labor_standards (           -- versioned goals per activity
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  activity         TEXT NOT NULL,        -- 'pick_each', 'pick_case', 'putaway_pallet', 'vas_kit'
  method           TEXT NOT NULL CHECK (method IN ('engineered', 'historical', 'estimate')),
  fixed_ds         INT NOT NULL DEFAULT 0,
  per_line_ds      INT NOT NULL DEFAULT 0,
  per_unit_ds      INT NOT NULL DEFAULT 0,
  per_case_ds      INT NOT NULL DEFAULT 0,
  travel_cm_per_s  INT,                  -- equipment speed for travel
  allowance_bp     INT NOT NULL CHECK (allowance_bp BETWEEN 0 AND 5000),  -- PF&D
  valid_during     TSTZRANGE NOT NULL,
  study_document_id UUID REFERENCES documents (id)
);

CREATE TABLE labor_time_entries (        -- what each worker's clocked minutes were spent on
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id  UUID NOT NULL REFERENCES warehouse_workers (id),
  category   TEXT NOT NULL CHECK (category IN ('direct', 'indirect', 'break', 'meal',
               'protected', 'unassigned')),  -- protected: bathroom and other time the law excludes
  activity   TEXT,
  task_id    UUID REFERENCES warehouse_tasks (id),
  during     TSTZRANGE NOT NULL,
  goal_ds    INT,                        -- for direct time, copied from the task
  source     TEXT NOT NULL CHECK (source IN ('task_scan', 'clock', 'supervisor_edit')),
  EXCLUDE USING gist (worker_id WITH =, during WITH &&)
);

CREATE TABLE quota_documents (           -- each quota as written, versioned
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id  UUID NOT NULL REFERENCES facilities (id),
  activity     TEXT NOT NULL,
  description  TEXT NOT NULL,            -- the words the worker receives
  version      INT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  document_id  UUID REFERENCES documents (id),
  UNIQUE (facility_id, activity, version)
);

CREATE TABLE quota_disclosures (         -- proof each worker received each version
  quota_document_id UUID NOT NULL REFERENCES quota_documents (id),
  worker_id         UUID NOT NULL REFERENCES warehouse_workers (id),
  due_by            TIMESTAMPTZ NOT NULL, -- from hire or change, per the state's rule
  delivered_at      TIMESTAMPTZ,
  channel           TEXT CHECK (channel IN ('paper', 'electronic', 'device')),
  PRIMARY KEY (quota_document_id, worker_id)
);

CREATE TABLE work_speed_requests (       -- a worker's or former worker's request for records
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id     UUID NOT NULL REFERENCES warehouse_workers (id),
  jurisdiction  TEXT NOT NULL,           -- 'US-CA', 'US-WA', 'US-NY', 'US-MN', 'US-OR'
  scope         TEXT NOT NULL CHECK (scope IN ('quota_description', 'own_data',
                  'own_and_aggregate')),
  period        TSTZRANGE NOT NULL,      -- the 90 days or six months the request covers
  received_at   TIMESTAMPTZ NOT NULL,
  due_at        TIMESTAMPTZ NOT NULL,    -- computed from the jurisdiction's rule, stored
  rule_ref      TEXT NOT NULL,           -- which rule and version computed due_at
  fulfilled_at  TIMESTAMPTZ,
  document_id   UUID REFERENCES documents (id)  -- the export as sent
);

ALTER TABLE warehouse_tasks ADD CONSTRAINT warehouse_tasks_standard_fkey
  FOREIGN KEY (labor_standard_id) REFERENCES labor_standards (id) NOT VALID;
ALTER TABLE order_lines VALIDATE CONSTRAINT order_lines_warehouse_qty_check;
ALTER TABLE inventory_movements VALIDATE CONSTRAINT inventory_movements_task_fkey;
ALTER TABLE warehouse_tasks VALIDATE CONSTRAINT warehouse_tasks_standard_fkey;
```

The floor's next task for a worker is a query over the queue: ready work in the worker's zone, by priority, nearest first, claimed so two workers can't take it:

```sql
UPDATE warehouse_tasks t
SET status = 'assigned', worker_id = $2
WHERE t.id = (
  SELECT q.id
  FROM warehouse_tasks q
  JOIN warehouse_locations l ON l.id = q.from_location_id
  WHERE q.facility_id = $1
    AND q.status = 'ready'
    AND l.zone_id = ANY ($3)             -- zones the worker is certified and placed in
  ORDER BY q.priority DESC,
           location_distance(l.id, $4)  -- the building's distance from the worker's last location
  LIMIT 1
  FOR UPDATE SKIP LOCKED)
RETURNING t.*;
```

`location_distance` stands in for whatever distance the building computes (pick sequence difference, aisle geometry); the claim itself is the `SKIP LOCKED` update.

A worker's productivity for a period excludes protected time by construction:

```sql
SELECT worker_id,
       SUM(goal_ds) FILTER (WHERE category = 'direct')::numeric * 100
         / NULLIF(SUM(EXTRACT(EPOCH FROM upper(during) - lower(during)) * 10)
                  FILTER (WHERE category = 'direct'), 0) AS productivity_pct
FROM labor_time_entries
WHERE worker_id = $1 AND during && $2
GROUP BY worker_id;
```

Design notes:

- **Tasks are the unit of everything.** Movements reference the task that made them, labor time references the task it was spent on, and billing counts tasks by kind ([Contract Logistics & 3PL Billing](/books/logistics/contract-logistics)); a scan with no task is an exception, not a shortcut.
- **Goals are frozen on the task.** The standard and its version are stored with the goal when the task is created, so a revised standard changes future tasks only.
- **Time entries don't overlap.** The exclusion constraint makes a worker's minutes a partition of their shift; a supervisor's correction is a new entry with its source, never an edit to a scan-derived one ([Edits, Approvals and Locks](/books/workforce/time-and-attendance#edits-approvals-and-locks)).
- **Jurisdiction rules are data.** Thresholds, disclosure deadlines, request windows and response deadlines differ by state and change by amendment; due dates are computed from a versioned rule and stored with the rule that computed them.
- **Slot assignments are time ranges.** One item per fixed face at a time, enforced by the exclusion constraint; a re-slot ends one range and starts another.
- **Personal data stays thin.** A worker is a party with a badge; pay, the time record of truth and personnel files live in the Workforce systems, and performance data is personal data with its own retention and access rules ([Employee Data Under the CCPA](/books/workforce/employee-records-and-privacy#employee-data-under-the-ccpa)).
- **Emit the work events.** `wave.released`, `task.completed`, `task.short`, `order.picked` and `work_speed_request.due_soon` are what the floor board, replenishment, carriers' load planning and compliance subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every task,** created, held, released, assigned, started, completed, shorted or cancelled, with its worker, goal, standard version and planned travel.
- **Every short pick and its follow-up,** the reallocation or backorder and the count it triggered.
- **Every slotting run,** its inputs, the moves it proposed, which were done, and the assignments' validity.
- **Every labor standard and study,** effective dates and method, so a goal can be traced to its basis.
- **Every quota version and disclosure,** what each worker received and when, against the state's deadline.
- **Every work speed request,** received, due, fulfilled and the export sent, and every performance-based adverse action with the quota, period and data it relied on.

## What This Means for the System You Build

- **Score slots in one unit, with fit as a hard constraint,** and keep assignments as time ranges with the run that proposed them.
- **Treat waves and streams as release policies** over the same allocations and tasks, prioritized by ship-by time.
- **Make every unit of floor work a task** with from and to locations, dependencies and a claim that two workers can't share.
- **Freeze the labor goal on the task** from a versioned standard of elements, travel and allowances.
- **Partition each worker's time** into direct, indirect, break, meal and protected categories, and never count protected time against a quota.
- **Keep quotas as versioned documents with per-worker disclosures,** and track work speed requests against deadlines computed per state.
- **Count agency workers as the statutes do,** recording the employer of record separately from the building's operator.
- **Verify packed cartons by scan and weight** and record the outbound plate as the shipment's handling unit.

## References

**Statutes and regulations**

- [California Labor Code 2100: Definitions (AB 701)](https://california.public.law/codes/labor_code_section_2100), covered employers, the definition of a quota and covered industries (mirror of the official code)
- [California Labor Code 2101](https://california.public.law/codes/labor_code_section_2101), the written description at hire or within 30 days
- [California Labor Code 2102](https://california.public.law/codes/labor_code_section_2102), quotas that prevent meal or rest periods, including bathroom travel time
- [California Labor Code 2104](https://california.public.law/codes/labor_code_section_2104), the 90 days of work speed data, the 21-day deadline and one request for a former employee
- [California Labor Code 2105](https://california.public.law/codes/labor_code_section_2105), the 90-day rebuttable presumption of retaliation
- [Revised Code of Washington, chapter 49.84](https://app.leg.wa.gov/RCW/default.aspx?cite=49.84&full=true), covered employers, descriptions, protected time, six months of data, two- and seven-business-day deadlines, former employees, retaliation and the July 1, 2024 effective date
- [New York Labor Law 780](https://www.nysenate.gov/legislation/laws/LAB/780), covered employers and industries
- [New York Labor Law 781](https://www.nysenate.gov/legislation/laws/LAB/781), the written description at hire or within 30 days, and within two business days of a change
- [New York Labor Law 785](https://www.nysenate.gov/legislation/laws/LAB/785), the right to quota descriptions and 90 days of data within 14 calendar days
- [New York Labor Law 786](https://www.nysenate.gov/legislation/laws/LAB/786), the 90-day rebuttable presumption
- [New York Labor Law 789](https://www.nysenate.gov/legislation/laws/LAB/789), the injury reduction program
- [Minnesota Statutes 182.6526](https://www.revisor.mn.gov/statutes/cite/182.6526), the 250-employee threshold, descriptions before increases, meal, rest, prayer and restroom protection, four-business-day responses and the injury rate trigger
- [Oregon HB 4127, enrolled (2024)](https://olis.oregonlegislature.gov/liz/2024R1/Downloads/MeasureDocument/HB4127/Enrolled), covered employers, the quota definition, documentation at hire, on change and with adverse action, 90 days of data within 21 days, former employees, the collective bargaining exemption and the $1,000 civil penalty
- [29 CFR 1910.178: Powered industrial trucks](https://www.law.cornell.edu/cfr/text/29/1910.178), operator competence, three-year evaluations and refresher triggers
- [29 CFR 1910.176: Handling materials, general](https://www.law.cornell.edu/cfr/text/29/1910.176), aisle clearances and stacking
- [OSHA: National Emphasis Program on Warehousing and Distribution Center Operations, CPL 03-00-026 (effective July 31, 2026)](https://www.osha.gov/sites/default/files/enforcement/directives/CPL-03-00-026.pdf), the reissue, its five-year term, hazards of focus and the removed screening requirements

**Statistics**

- [U.S. Bureau of Labor Statistics: Warehousing and Storage, NAICS 493](https://www.bls.gov/iag/tgs/iag493.htm), the 2025 injury and illness rate

**WMS and labor documentation**

- [Microsoft: Wave templates](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wave-templates), template order, processing modes, thresholds, methods and the noon cutoff example
- [Microsoft: Work with location directives](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/create-location-directive), fixed locations and immediate replenishment
- [Oracle Warehouse Management Cloud: Reslotting Workbench](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/optimize-pick-locations-with-reslotting-workbench.html), velocity codes, location rankings and the recheck before moves
- [Oracle Warehouse Management Cloud: Task Statuses](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/task-statuses.html), ready, held, processing started, completed and cancelled
- [Oracle Warehouse Management Cloud: Online Help contents](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/toc.htm), wave templates and instances, replenishment-dependent picking tasks, cubed picking and VAS locations
- [Oracle Workforce Management: Goals for WMS Activities](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmwf/goals-for-system-activities.html), goals per activity, unit and month, and peak-season goals
- [Oracle Workforce Management: Employee Performance Metrics](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmwf/employee-performance-metrics.html), productivity, utilization and idle time formulas
- [Oracle Workforce Management: Breaks](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmwf/breaks.html), clocking into breaks against allotted time

**Vendors**

- [Manhattan Associates: Warehouse Management](https://www.manh.com/solutions/supply-chain-management-software/warehouse-management), Order Streaming, slotting in putaway and picking, and labor in one application
- [Blue Yonder: Warehouse Management](https://blueyonder.com/solutions/warehouse-management), adaptive execution and Workforce & Labor Management
- [Infios: Labor Management](https://www.infios.com/en/supply-chain-solutions/labor-management), standards, travel times, direct and indirect time and allowances
