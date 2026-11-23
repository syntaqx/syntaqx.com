+++
title = "MRP, Scheduling & Work Orders"
nav_title = "MRP & Work Orders"
description = "From demand to the line: the master schedule, the MRP explosion and netting, lot sizing, action messages, capacity and scheduling, work orders and backflush."
category = "Logistics & Supply Chain Industry"
order = 2858
part = "Manufacturing"
tags = ["logistics", "manufacturing", "mrp", "scheduling", "work-orders", "backflush", "data-model"]
+++

Material requirements planning (MRP) turns demand for finished goods into a schedule of what to make and buy, and when. A distributor orders 100 pumps for week 3; the plant has 40 in stock, so it must make 60, which takes a week, so the pump work order starts in week 2; each pump needs a housing and two seal kits, so 60 housings and 120 seal kits must be ready by week 2, and each of those has its own stock, lead time and order size, and the seal kits also go into the housing. Done for every item, every plant and every week of the horizon, the result is a list of planned orders (make this, buy that) that become work orders on the floor and purchase orders and schedules to suppliers, and, downstream, the inbound and outbound freight this volume is about.

It is hard because the calculation is simple and the inputs are not. MRP assumes the BOM is right, lead times are fixed, stock counts are accurate and capacity is infinite; none is true. A plan rerun every night reschedules hundreds of orders by a day each and the floor stops trusting it; a work order reports 940 of 1,000 and the shortfall either reappears as demand or silently disappears; components consumed by backflush at the end of an order don't leave inventory until the order reports, so MRP plans against stock that is already in a machine. And capacity, which MRP ignores, is what actually decides when things get made.

This chapter covers the master production schedule, the MRP explosion and its netting, lot sizing, action messages and how to keep a plan stable, pegging, capacity and scheduling, the work order's life, and material consumption and backflush, with a worked gross-to-net example in Go and Rust. It extends `items`, `lots` and `orders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), with the plant settings and work centers from [ERP, MES & ISA-95](/books/logistics/manufacturing-systems#how-to-build-it) and the BOM versions from [BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change#how-to-build-it). A merchant's reorder points, safety stock and purchase orders are Commerce's [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#reorder-points-and-safety-stock); the forecast and the aggregate plan that feed the master schedule are [Demand & Supply Planning](/books/logistics/supply-chain-planning).

## How the Platforms Do It

As of November 2026, from each product's documentation:

| System | Planning run | Lot sizing | Stability controls | Capacity |
| --- | --- | --- | --- | --- |
| **Microsoft Dynamics 365 Business Central** | Plans items "according to each item's low-level code (BOM position)"; "Calculate Regenerative Plan" (all items) or "Calculate Net Change Plan" (changed items) | Fixed Reorder Qty., Maximum Qty., Order, Lot-for-Lot; modifiers applied "down to the maximum order quantity," "up to the minimum order quantity," "up to meet the nearest order multiple" | Rescheduling period (Lot-for-Lot only), lot accumulation period, dampener period; Planning Flexibility None on an order; a frozen zone before the planning start date | "doesn't include dedicated logic for capacity leveling or fine scheduling"; a rough-cut finite loading that splits operations into free slots |
| **Microsoft Dynamics 365 Supply Chain Management** | Planning Optimization runs master planning "outside Dynamics 365 Supply Chain Management and the related SQL database," holding data in memory, returning "planned orders and pegging information" | Coverage codes Manual, Per requirement, Per period, Min/Max, Priority, Decoupling point (DDMRP) | Firming planned orders into production orders, batch orders or kanbans | Operations scheduling ("a rough, long-term plan") and job scheduling ("a detailed plan," finite capacity, Gantt chart) |
| **Odoo** | Master production schedule by year, month, week or day "against a manually-adjustable demand forecast," with indirect demand for components | Safety stock target; minimum and maximum to replenish per period; above the maximum, "the remaining quantity is automatically transferred to the next period" | Manual adjustment of the suggested replenishment | Operations on the BoM, timed once work orders are enabled |
| **ERPNext** | Work orders issued by the production planner | Not on the pages cited | Overproduction percentage per work order | Optional capacity planning "the number of days in advance" set in Manufacturing Settings (30 by default, per the work order page), with overtime and holiday settings |
| **Oracle Fusion Cloud Supply Planning** | Supply plans, unconstrained or constrained | Not on the pages cited | A planning time fence: a planned order's due date "is always greater than or equal to the planning time fence date"; a natural time fence "at the latest date of firm supplies" | In constrained plans, "resource and supplier capacities are soft constraints that the planning process violates only when necessary," lead times hard; constrained plans run "only … in batch mode" |
| **Siemens Opcenter APS** | Scheduling after planning | n/a | n/a | "production planning and scheduling products help synchronize manufacturing processes" |

Four patterns:

- **MRP plans level by level, top down.** Business Central's low-level code ("end items have low-level code 0") orders the run so that every parent's demand is known before its components are netted. The order is the algorithm.
- **Lot sizing is a small fixed menu.** Lot-for-lot, per period, fixed quantity, min/max and per order appear in every ERP under different names, with the same three modifiers (minimum, maximum, multiple) applied in the same order.
- **Stability is configured, not emergent.** Rescheduling and dampener periods, time fences, firm orders and "planning flexibility" all exist to stop a nightly rerun from moving every order a day. Without them the plan is mathematically right and operationally useless.
- **Capacity is a separate step.** Business Central says so outright, Dynamics 365 schedules after firming, Oracle offers constrained planning only in batch, and APS products sit beside the ERP. MRP's output is a capacity request, and scheduling decides when.

## The Master Production Schedule

The master production schedule (MPS) is the plan for the items the business sells or ships between plants: how many of each, in which period. It is the input MRP explodes. Odoo's MPS "is used to plan long-term replenishment for products against a manually-adjustable demand forecast," with a safety stock target and minimum and maximum per period; Business Central's planning code unit covers "MRP and MPS" together. Demand for the MPS is forecast consumed by orders: Business Central doesn't reduce the forecast itself, but "the forecast quantities that are used in the planning calculation are reduced by the sales order quantities before the remaining quantity enters the demand profile." Where the forecast comes from, and how a consensus forecast and an aggregate plan are agreed, is [Demand & Supply Planning](/books/logistics/supply-chain-planning#from-the-plan-to-the-master-schedule).

The near end of the schedule is frozen. Business Central treats everything before the planning start date as a "frozen zone" (all supply and demand there "considered part of inventory or shipped"); Oracle's planning time fence keeps new planned orders out of the near horizon and its natural time fence sits "at the latest date of firm supplies." Inside the fence the planner changes orders by hand; outside it, MRP is free.

## The MRP Explosion

Business Central states MRP's two goals: "Any demand will be met by sufficient supply" and "Any supply serves a purpose." For each item, in low-level-code order, and for each period of the horizon:

1. **Gross requirements:** independent demand (MPS quantities, sales orders, forecast not yet consumed, spares) plus dependent demand from every parent's planned and released orders, at the parent's start date.
2. **Scheduled receipts:** open work orders, purchase orders, supplier schedule releases and inbound transfers due in the period.
3. **Projected on hand:** the previous period's projection plus receipts minus gross requirements. Safety stock is a demand on the first day ("a demand that's loaded into the inventory profile on the planning starting date," in Business Central).
4. **Net requirement:** what the projection is short of zero (or of safety stock).
5. **Planned order receipt:** the net requirement, sized by the lot-sizing rule.
6. **Planned order release:** the receipt offset by the lead time, and, for a made item, the release that creates the components' gross requirements at the next level.

Rules that change the answer:

- **Low-level codes decide the order.** An item used at several depths (a seal kit that goes into the pump and into the housing) is planned at its deepest level, after every parent that uses it. Business Central can compute codes dynamically or by batch job, and if they aren't current "you must run the Calculate Low-Level Code batch job before you calculate a supply plan."
- **Not every supply can move.** Business Central won't replan "released production orders where consumption or output has been posted" or purchase orders "where receipt has been posted"; an order with Planning Flexibility None is used but never changed.
- **Specific demand needs specific supply.** Demand for a named lot "can only be fulfilled by supply with matching attributes," and an order-to-order link (make to order) is balanced exactly, outside lot sizing.
- **Demand has a priority.** Business Central's order on the demand side runs from already shipped, purchase returns and sales orders through "production component needs" down to blanket orders and forecast, so a sales order is covered before a forecast.
- **Lead times need a cushion.** A due date without a due time lands at the start of the day; Business Central recommends a safety lead time of "at least one day," or "the goods might arrive too late."
- **Negative projected stock on day one is an emergency, not a plan.** Business Central suggests "an emergency supply for the negative quantity to arrive on the planning starting date" and flags it, which is a data problem (an unposted receipt, a miscount) more often than a real shortage.

### A Worked Explosion

A pump (P) is a housing (H) and two seal kits (S); the housing also takes one seal kit. Weekly buckets; P has 40 on hand and a one-week lead time, lot-for-lot; H has 20 on hand, a one-week lead time, and an order multiple of 50; S has 300 on hand, a two-week lead time and a minimum order of 500. Low-level codes: P is 0, H is 1, S is 2 (because it sits under H). Demand for P: 100 in week 3, 150 in week 5.

| Item | Week | Gross | Receipts (planned) | Projected on hand | Planned release |
| --- | --- | --- | --- | --- | --- |
| P | 3 | 100 | 60 | 0 | 60 in week 2 |
| P | 5 | 150 | 150 | 0 | 150 in week 4 |
| H | 2 | 60 | 50 | 10 | 50 in week 1 |
| H | 4 | 150 | 150 | 10 | 150 in week 3 |
| S | 1 | 50 (from H) | | 250 | |
| S | 2 | 120 (from P) | | 130 | |
| S | 3 | 150 (from H) | 500 | 480 | 500 in week 1 |
| S | 4 | 300 (from P) | | 180 | |

Two things to notice: the seal kit's minimum order buys 480 more than week 3 needed, which is what lot sizing does; and S could only be planned once both of its parents had released their orders, which is why low-level codes come first. The same calculation, as code:

```go tab="Go"
package mrp

import (
	"math"
	"sort"
)

type Item struct {
	ID          string
	LowLevel    int     // 0 for end items; deeper is larger
	LeadTime    int     // in buckets
	OnHand      float64 // available at the start of bucket 0
	SafetyStock float64
	MinQty      float64 // order modifiers; 0 means none
	MaxQty      float64
	Multiple    float64
}

type BOMLine struct {
	Parent, Component string
	QtyPer            float64 // per one parent
	Scrap             float64 // fraction lost, 0 <= Scrap < 1
}

type PlannedOrder struct {
	ItemID   string
	Due      int // bucket the quantity is needed in
	Release  int // bucket the order must start in
	Qty      float64
	PastDue  bool // the lead time reaches before bucket 0
}

// sizes applies the modifiers in Business Central's order: down to the
// maximum, up to the minimum, up to the multiple; the rest repeats.
func sizes(net float64, it Item) []float64 {
	var out []float64
	for net > 1e-9 {
		q := net
		if it.MaxQty > 0 && q > it.MaxQty {
			q = it.MaxQty
		}
		if q < it.MinQty {
			q = it.MinQty
		}
		if it.Multiple > 0 {
			q = math.Ceil(q/it.Multiple) * it.Multiple
		}
		out = append(out, q)
		net -= q
	}
	return out
}

// Plan nets gross demand and scheduled receipts per bucket, item by item in
// low-level-code order, and pushes dependent demand to components.
func Plan(items []Item, bom []BOMLine, gross, receipts map[string][]float64, horizon int) []PlannedOrder {
	sort.SliceStable(items, func(i, j int) bool { return items[i].LowLevel < items[j].LowLevel })
	children := map[string][]BOMLine{}
	for _, l := range bom {
		children[l.Parent] = append(children[l.Parent], l)
	}
	row := func(m map[string][]float64, id string) []float64 {
		if len(m[id]) < horizon {
			m[id] = append(m[id], make([]float64, horizon-len(m[id]))...)
		}
		return m[id]
	}
	var orders []PlannedOrder
	for _, it := range items {
		demand, in := row(gross, it.ID), row(receipts, it.ID)
		avail := it.OnHand - it.SafetyStock
		for t := 0; t < horizon; t++ {
			avail += in[t]
			if net := demand[t] - avail; net > 0 {
				for _, q := range sizes(net, it) {
					rel := t - it.LeadTime
					po := PlannedOrder{ItemID: it.ID, Due: t, Release: max(rel, 0), Qty: q, PastDue: rel < 0}
					orders = append(orders, po)
					avail += q
					for _, l := range children[it.ID] {
						row(gross, l.Component)[po.Release] += q * l.QtyPer / (1 - l.Scrap)
					}
				}
			}
			avail -= demand[t]
		}
	}
	return orders
}
```

```rust tab="Rust"
use std::collections::HashMap;

#[derive(Clone)]
pub struct Item {
    pub id: String,
    pub low_level: u32,  // 0 for end items; deeper is larger
    pub lead_time: i32,  // in buckets
    pub on_hand: f64,    // available at the start of bucket 0
    pub safety_stock: f64,
    pub min_qty: f64,    // order modifiers; 0 means none
    pub max_qty: f64,
    pub multiple: f64,
}

pub struct BomLine {
    pub parent: String,
    pub component: String,
    pub qty_per: f64, // per one parent
    pub scrap: f64,   // fraction lost, 0 <= scrap < 1
}

#[derive(Debug)]
pub struct PlannedOrder {
    pub item_id: String,
    pub due: usize,     // bucket the quantity is needed in
    pub release: usize, // bucket the order must start in
    pub qty: f64,
    pub past_due: bool, // the lead time reaches before bucket 0
}

/// Down to the maximum, up to the minimum, up to the multiple; the rest repeats.
fn sizes(mut net: f64, it: &Item) -> Vec<f64> {
    let mut out = Vec::new();
    while net > 1e-9 {
        let mut q = net;
        if it.max_qty > 0.0 && q > it.max_qty {
            q = it.max_qty;
        }
        if q < it.min_qty {
            q = it.min_qty;
        }
        if it.multiple > 0.0 {
            q = (q / it.multiple).ceil() * it.multiple;
        }
        out.push(q);
        net -= q;
    }
    out
}

/// Nets gross demand and scheduled receipts per bucket, item by item in
/// low-level-code order, and pushes dependent demand to components.
pub fn plan(
    items: &mut [Item],
    bom: &[BomLine],
    gross: &mut HashMap<String, Vec<f64>>,
    receipts: &HashMap<String, Vec<f64>>,
    horizon: usize,
) -> Vec<PlannedOrder> {
    items.sort_by_key(|it| it.low_level);
    let mut children: HashMap<&str, Vec<&BomLine>> = HashMap::new();
    for l in bom {
        children.entry(l.parent.as_str()).or_default().push(l);
    }
    let zero = vec![0.0; horizon];
    let mut orders = Vec::new();
    for it in items.iter() {
        let demand = gross.entry(it.id.clone()).or_insert_with(|| vec![0.0; horizon]).clone();
        let incoming = receipts.get(&it.id).unwrap_or(&zero);
        let mut avail = it.on_hand - it.safety_stock;
        for t in 0..horizon {
            avail += incoming.get(t).copied().unwrap_or(0.0);
            let net = demand.get(t).copied().unwrap_or(0.0) - avail;
            if net > 0.0 {
                for q in sizes(net, it) {
                    let rel = t as i32 - it.lead_time;
                    let release = rel.max(0) as usize;
                    avail += q;
                    for l in children.get(it.id.as_str()).into_iter().flatten() {
                        let row = gross.entry(l.component.clone()).or_insert_with(|| vec![0.0; horizon]);
                        row[release] += q * l.qty_per / (1.0 - l.scrap);
                    }
                    orders.push(PlannedOrder { item_id: it.id.clone(), due: t, release, qty: q, past_due: rel < 0 });
                }
            }
            avail -= demand.get(t).copied().unwrap_or(0.0);
        }
    }
    orders
}
```

Run on the example, both return P 60 (release 2) and 150 (release 4), H 50 (release 1) and 150 (release 3), and S 500 (release 1). A production planner adds what the sketch leaves out: decimal quantities rather than floats, calendars (lead times in working days at the plant), a planned order per BOM version and plant, firm orders that are netted but never resized, pegging from every planned order to the demand it covers, and a past-due flag that becomes an exception for a planner rather than a silent order in bucket 0.

## Lot Sizing

The rules, with Business Central's and Dynamics 365's names for them:

| Rule | Quantity | Names |
| --- | --- | --- |
| **Lot-for-lot** | "the sum of the demand that becomes due in the time bucket" | Business Central Lot-for-Lot |
| **Per period** | All demand of a period, ordered "for the first day of the period" | Dynamics 365 Per period; Business Central's lot accumulation period |
| **Per requirement or order** | Exactly one demand, linked to it | Dynamics 365 Per requirement ("expensive items with intermittent demand"); Business Central Order |
| **Fixed quantity** | At least a set quantity, often with a reorder point | Business Central Fixed Reorder Qty. |
| **Up to a maximum** | The gap to a maximum level | Business Central Maximum Qty.; Dynamics 365 Min/Max |
| **Buffer-driven** | Replenish buffers at decoupling points by priority | Dynamics 365 Priority and Decoupling point (DDMRP) |

Then the modifiers, in order: down to the maximum order quantity, up to the minimum, up to the multiple, with any remainder sized the same way. The economic order quantity and the reorder point formulas are Commerce's [Reorder Points and Safety Stock](/books/commerce/purchasing-and-replenishment#reorder-points-and-safety-stock); in a plant the minimum often comes from a supplier's MOQ, a die's run length or a furnace's batch, and the multiple from a container.

## Action Messages and a Stable Plan

A rerun doesn't just add orders; it changes existing ones. Business Central's actions are New, Change Quantity, Reschedule, Reschedule and Change Quantity, and Cancel, and the planner accepts or rejects each. A plan that emits hundreds a night is "nervous," and the controls that calm it:

- **A rescheduling period:** within it an order is moved; outside it, it's cancelled and a new one suggested (in Business Central, only for Lot-for-Lot items).
- **A dampener period:** "Changes from the supply date until one dampener period from the supply date don't generate action messages," so a one-day slip isn't a message.
- **Firm orders:** a planned order the planner has firmed is netted but not resized or moved; Dynamics 365 creates production orders "by firming planned orders."
- **Time fences:** no new planned orders inside the fence (Oracle's planning time fence; Business Central's frozen zone).
- **Net change between full regenerations.** Business Central's net change plan "calculates only the items that have had a change in their demand and supply pattern," which is faster and touches less.

My rule: every planned order and every action message records the run that produced it, and acceptance is an explicit, logged decision, so a planner's override survives the next run and the plan's history can explain why a work order moved.

## Pegging

Pegging links each supply to the demand it covers, up and down the tree: this purchase order for seal kits covers these two housing orders, which cover this pump order, which covers this customer's sales order. Business Central's dynamic order tracking does it in real time as orders are entered ("first-come-first-served," which "can lead to disorder in priorities") and its planning run rebuilds the links by due date and priority; Dynamics 365's Planning Optimization returns "planned orders and pegging information" with each run. Pegging is what answers "which customers are hurt if this supplier ships late," which is the question a late inbound load raises, and it is the bridge between this chapter and the exception management of the transportation chapters.

## Capacity and Scheduling

MRP assumes infinite capacity; a plant doesn't have it. Business Central's planning "doesn't include dedicated logic for capacity leveling or fine scheduling," and its finite loading is a rough cut that assigns "each operation to the nearest available time slot" and splits it when the slot is too small. The layers above it, as the platforms divide them:

- **Rough-cut capacity:** load per work center per week from the MPS, checked before MRP runs; a week loaded at 140% is a planning problem, not a scheduling one.
- **Capacity requirements:** load from every planned and released order's routing, by work center and period, after MRP.
- **Operations scheduling:** start and end dates per order and operation, forward from today or backward from the due date; Dynamics 365's "rough, long-term plan."
- **Finite job scheduling:** each operation on a specific resource at a specific time, respecting capacity, setups and sequence; Dynamics 365's "detailed plan" with a Gantt chart, ERPNext's capacity planning over a set number of days, and dedicated APS products (Siemens's Opcenter APS among them).
- **Constrained planning:** planning and capacity in one solve. Oracle's constrained plans treat resource and supplier capacity as "soft constraints that the planning process violates only when necessary" and lead times as hard, and run only in batch.

Finite scheduling is an optimization with competing objectives (due dates, setups, utilization, overtime), weighed as the playbook's [Hard and Soft Constraints](/docs/building-blocks/weighing-objectives#hard-and-soft-constraints) describes. Whichever tool schedules, the schedule's dates feed back to MRP as the scheduled receipts of the next run, and an order that moves late moves its components' requirements with it.

## Work Orders

A work order (a production order, a manufacturing order, a job) is the instruction to make a quantity of an item by a date, with a BOM and routing version. ERPNext's definition is the plainest: "a document given to the manufacturing shop floor by the Production Planner." Its life, combining Dynamics 365's statuses with ERPNext's stock entries:

| Status | What happens | Inventory effect |
| --- | --- | --- |
| **Created** (firmed from a planned order, or entered) | BOM and routing version fixed on the order | None |
| **Estimated** | Material and resource needs calculated | Components on order to the work order |
| **Scheduled** | Operations get dates; jobs get resources | None |
| **Released** | Material availability checked; pick lists and job cards issued; in Dynamics 365, BOM lines released to warehouse management | Picks generated |
| **Picked / staged** | Components at the line; ERPNext's "Material Transfer for Manufacture" into the WIP warehouse | Components move to WIP |
| **Started** | Consumption reported, or preflushed | Components consumed |
| **Reported as finished** | Good quantity received; unreported consumption backflushed; quality orders triggered | Finished goods into stock (often as a new lot) |
| **Ended / closed** | Actual cost calculated; estimates "reversed and replaced with actual costs" | Variances posted |

Two quantity rules every plant has to set:

- **Overproduction.** ERPNext's "allowable percentage by which the actual production quantity can exceed the planned quantity specified in a work order"; my rule is to refuse a report above it rather than warn.
- **Underproduction.** ERPNext allows partial completion; Dynamics 365 leaves an order open for "additional quantities" until "End job" is set. Whether a short order is closed (the shortfall becomes new demand at the next MRP run) or held open (its remaining quantity stays a scheduled receipt) is a rule per item, and MRP's view of supply depends on it.

The output of a work order is usually a lot: the core `lots` row, made at the plant, with its production date. Which component lots went into it is the genealogy that [Lot & Serial Traceability](/books/logistics/lot-traceability) records; this chapter records quantities consumed per component, and traceability records them per lot.

## Consumption and Backflush

Components leave inventory one of three ways:

- **Manual issue:** an operator or the warehouse issues what was used, line by line. Accurate, slow.
- **Preflush:** consumption posted when the order starts, at BOM quantities; Dynamics 365's "preflushing, forward flushing, or autoconsumption."
- **Backflush:** consumption posted when output is reported, at BOM quantities times the good (and sometimes scrap) quantity; in Dynamics 365, allocation "through back-flushing involves the post-deducting of inventory transaction processes," and its lean manufacturing "is implemented based on the backflush costing principle." ERPNext lets a plant backflush based on the BOM or on the material actually transferred for manufacture.

Backflush is what makes high-volume lines reportable, and it has three failure modes that land in logistics: inventory overstated between the pick and the report (MRP thinks the components are still in the warehouse), a wrong BOM consuming the wrong components (one system's stock goes negative while another's is overstated), and scrap not reported, so consumption is understated and the plant runs out of a part the system says it has. My rules: backflush only items with stable, accurate BOMs and short order durations; move components to a WIP location on staging so they leave available stock even before consumption; report scrap with its reason as its own transaction; and reconcile cycle counts of backflushed items more often than the rest.

## How to Build It

The planning parameters are per item per plant; routings hang off the BOM's parent item; an MRP run produces planned orders and pegs; work orders carry their version choices, materials, operations and confirmations.

```sql fragment
ALTER TABLE items
  ADD COLUMN low_level_code SMALLINT;    -- deepest BOM level the item appears at; 0 for end items
ALTER TABLE lots
  ADD COLUMN work_order_id UUID;         -- the order that produced it, when made in house

CREATE TABLE item_planning_parameters (  -- how MRP plans an item at a plant
  item_id            UUID NOT NULL REFERENCES items (id),
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  lot_sizing         TEXT NOT NULL CHECK (lot_sizing IN ('lot_for_lot', 'per_period',
                       'per_order', 'fixed_quantity', 'up_to_maximum', 'manual')),
  period_days        SMALLINT,           -- for 'per_period'
  fixed_quantity     NUMERIC(14, 3),
  min_order_qty      NUMERIC(14, 3),
  max_order_qty      NUMERIC(14, 3),
  order_multiple     NUMERIC(14, 3),
  safety_stock       NUMERIC(14, 3) NOT NULL DEFAULT 0,
  lead_time_days     SMALLINT NOT NULL CHECK (lead_time_days >= 0),  -- working days at the plant
  safety_lead_days   SMALLINT NOT NULL DEFAULT 1,
  planning_fence_days SMALLINT NOT NULL DEFAULT 0,  -- no new planned orders inside it
  dampener_days      SMALLINT NOT NULL DEFAULT 0,   -- no reschedule-out messages inside it
  backflush          TEXT NOT NULL DEFAULT 'manual' CHECK (backflush IN ('manual', 'preflush',
                       'backflush')),
  valid_during       TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  PRIMARY KEY (item_id, facility_id, valid_during),
  CHECK (min_order_qty IS NULL OR max_order_qty IS NULL OR min_order_qty <= max_order_qty)
);

CREATE TABLE routing_operations (        -- the steps to make an item, one version
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  version          INT NOT NULL,
  operation_seq    INT NOT NULL,         -- bom_lines.operation_seq points here
  work_center_id   UUID NOT NULL REFERENCES work_centers (id),
  setup_minutes    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  run_minutes_per  NUMERIC(12, 4) NOT NULL,  -- per unit of the item's base_uom
  queue_minutes    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  move_minutes     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  effective_during TSTZRANGE NOT NULL,
  UNIQUE (item_id, facility_id, version, operation_seq)
);

CREATE TABLE mrp_runs (                  -- one planning run, reproducible
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_ids   UUID[] NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('regenerative', 'net_change')),
  horizon        DATERANGE NOT NULL,
  inputs_as_of   TIMESTAMPTZ NOT NULL,   -- the snapshot of orders, stock and receipts read
  engine_version TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ,
  status         TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'superseded'))
);

CREATE TABLE planned_orders (            -- MRP's suggestions, until firmed or dropped
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  mrp_run_id       UUID NOT NULL REFERENCES mrp_runs (id),
  item_id          UUID NOT NULL REFERENCES items (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  supply_kind      TEXT NOT NULL CHECK (supply_kind IN ('make', 'buy', 'transfer', 'subcontract')),
  quantity         NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  release_on       DATE NOT NULL,
  due_on           DATE NOT NULL,
  bom_header_id    UUID REFERENCES bom_headers (id),  -- the version chosen for 'make'
  action           TEXT NOT NULL CHECK (action IN ('new', 'change_quantity', 'reschedule',
                     'reschedule_and_change', 'cancel')),
  existing_supply_ref TEXT,              -- the work order, PO or release an action changes
  exception        TEXT CHECK (exception IN ('past_due', 'emergency', 'below_safety_stock',
                     'capacity_overload')),
  status           TEXT NOT NULL CHECK (status IN ('suggested', 'accepted', 'rejected',
                     'firmed', 'converted', 'expired')),
  decided_by       TEXT,
  decided_at       TIMESTAMPTZ,
  CHECK (release_on <= due_on)
);

CREATE TABLE mrp_pegs (                  -- which demand each supply covers
  mrp_run_id      UUID NOT NULL REFERENCES mrp_runs (id),
  supply_kind     TEXT NOT NULL CHECK (supply_kind IN ('planned_order', 'work_order',
                    'purchase_order', 'schedule_release', 'on_hand', 'transfer')),
  supply_ref      UUID NOT NULL,
  demand_kind     TEXT NOT NULL CHECK (demand_kind IN ('sales_order_line', 'forecast',
                    'planned_order', 'work_order_material', 'safety_stock', 'transfer')),
  demand_ref      UUID NOT NULL,
  quantity        NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (mrp_run_id, supply_kind, supply_ref, demand_kind, demand_ref)
);

CREATE TABLE work_orders (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  number             TEXT NOT NULL,
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  item_id            UUID NOT NULL REFERENCES items (id),
  bom_header_id      UUID NOT NULL REFERENCES bom_headers (id),  -- fixed at creation
  routing_version    INT,
  planned_order_id   UUID REFERENCES planned_orders (id),
  order_line_id      UUID REFERENCES order_lines (id),  -- make to order: the demand it serves
  quantity           NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  overproduction_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  good_quantity      NUMERIC(14, 3) NOT NULL DEFAULT 0,  -- sum of confirmations, maintained
  scrap_quantity     NUMERIC(14, 3) NOT NULL DEFAULT 0,
  scheduled_during   TSTZRANGE,
  due_on             DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('created', 'estimated', 'scheduled',
                       'released', 'staged', 'started', 'reported_finished', 'closed',
                       'short_closed', 'cancelled')),
  mes_ref            TEXT,               -- the MES's order ID
  UNIQUE (facility_id, number)
);
ALTER TABLE lots ADD CONSTRAINT lots_work_order_fkey
  FOREIGN KEY (work_order_id) REFERENCES work_orders (id) NOT VALID;
ALTER TABLE lots VALIDATE CONSTRAINT lots_work_order_fkey;

CREATE TABLE work_order_materials (      -- what the order needs and what it used, per component
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  work_order_id     UUID NOT NULL REFERENCES work_orders (id),
  bom_line_id       UUID REFERENCES bom_lines (id),     -- null: a substitute or ad hoc item
  item_id           UUID NOT NULL REFERENCES items (id),
  operation_seq     INT,
  required_quantity NUMERIC(14, 3) NOT NULL,
  issued_quantity   NUMERIC(14, 3) NOT NULL DEFAULT 0,
  consumed_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,  -- by lot: the traceability chapter's
  consumption       TEXT NOT NULL CHECK (consumption IN ('manual', 'preflush', 'backflush'))
);

CREATE TABLE production_confirmations (  -- good and scrap reported against an operation
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  work_order_id   UUID NOT NULL REFERENCES work_orders (id),
  operation_seq   INT,                   -- null: a report for the whole order
  work_center_id  UUID REFERENCES work_centers (id),
  good_quantity   NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (good_quantity >= 0),
  scrap_quantity  NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (scrap_quantity >= 0),
  scrap_reason    TEXT,
  labor_minutes   NUMERIC(10, 2),
  machine_minutes NUMERIC(10, 2),
  output_lot_id   UUID REFERENCES lots (id),
  final           BOOLEAN NOT NULL DEFAULT FALSE,  -- the operator ended the operation
  occurred_at     TIMESTAMPTZ NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL CHECK (source IN ('mes', 'terminal', 'erp', 'api')),
  source_ref      TEXT NOT NULL,         -- the MES's confirmation ID: replays are no-ops
  UNIQUE (work_order_id, source, source_ref),
  CHECK (scrap_quantity = 0 OR scrap_reason IS NOT NULL)
);
```

Notes on the choices:

- **A planned order belongs to a run.** Each run writes its own suggestions; the previous run's unaccepted suggestions expire, accepted and firmed ones carry forward as supply. That keeps a planner's decisions from being overwritten by a rerun, and lets a run be compared with the last.
- **The run records what it read.** `inputs_as_of` and `engine_version` make a run reproducible in the same way as the load plans in [Plans as Runs](/books/logistics/load-planning#plans-as-runs).
- **The work order fixes its versions at creation.** A BOM change applied later doesn't rewrite an open order; the ECO's open-order action decides whether it changes ([BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change#engineering-change)).
- **Confirmations are idempotent and carry both times.** The MES retries; `(work_order_id, source, source_ref)` makes a replay a no-op, and `occurred_at` versus `received_at` separates when the line made the parts from when the ERP heard ([Idempotency](/docs/requests/idempotency)).
- **Scrap needs a reason.** Unreported scrap is the commonest cause of backflush shortages.

Backflushing a confirmation, in the transaction that records it, at the work order's own BOM version:

```sql
UPDATE work_order_materials m
SET consumed_quantity = consumed_quantity
      + (l.quantity_per / h.base_quantity / (1 - l.scrap_factor)) * ($2 + $3)
FROM bom_lines l JOIN bom_headers h ON h.id = l.bom_header_id
WHERE m.work_order_id = $1
  AND m.bom_line_id = l.id
  AND m.consumption = 'backflush';
-- $2: good quantity, $3: scrap quantity reported, when scrap consumes material
```

## Auditing

- **Every MRP run, with its inputs snapshot, engine version, suggestions and the decisions on them,** so "why did the plan say to buy 500" is answerable a month later.
- **Every work order's versions, quantities and status changes,** with who released, short-closed or cancelled it ([Transition History](/docs/building-blocks/workflows#transition-history)).
- **Every confirmation as received,** with both times, its source ID and its scrap reason.
- **Every consumption posting and the rule that produced it** (manual, preflush or backflush), because inventory accuracy audits and cost variances trace to them.

## What This Means for the System You Build

- **Plan level by level in low-level-code order,** and recompute the codes when any BOM changes.
- **Net gross demand against projected stock and receipts that can actually move,** and leave firm, posted and order-linked supply alone.
- **Size lots with a small fixed menu** and apply minimum, maximum and multiple in that order.
- **Make the plan stable on purpose:** time fences, dampener and rescheduling periods, firm orders and logged acceptance of every action.
- **Peg every supply to its demand,** so a late inbound load names the customer orders it puts at risk.
- **Treat capacity as its own step,** and feed the schedule's dates back to MRP as scheduled receipts.
- **Fix BOM and routing versions on the work order,** confirm idempotently with both times, and require a reason for scrap.
- **Backflush only where BOMs are accurate,** stage components to WIP, and count backflushed items more often.

## References

**Vendors**

- [Microsoft Learn: Design details, central concepts of the planning system (Business Central)](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-central-concepts-of-the-planning-system), planning by low-level code, regenerative and net change plans, the frozen zone, order tracking, planning flexibility, warnings and finite loading
- [Microsoft Learn: Design details, planning parameters (Business Central)](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-planning-parameters), reordering policies, safety lead time, rescheduling, lot accumulation and dampener periods, order modifiers and low-level codes
- [Microsoft Learn: Design details, balancing supply and demand (Business Central)](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-balancing-demand-and-supply), the planning goals, what can't be replanned, forecast consumption, demand priorities, safety stock, emergency orders, the order modifiers' sequence and the action messages
- [Microsoft Learn: Coverage settings (Dynamics 365 Supply Chain Management)](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/coverage-settings), coverage codes and demand-specified BOM versions
- [Microsoft Learn: Master planning system architecture](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-architecture), Planning Optimization outside the database, in memory, with pegging
- [Microsoft Learn: Production process overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview), the production life cycle, firming, operations and job scheduling, preflushing and back-flushing
- [Odoo: Master production schedule](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/manufacturing/workflows/use_mps.html), the MPS, its periods, safety stock target, minimum and maximum, and indirect demand
- [Odoo: Bill of materials](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/manufacturing/basic_setup/bill_configuration.html), operations on the BoM and the work orders setting
- [Frappe: ERPNext Work Order](https://docs.frappe.io/erpnext/user/manual/en/work-order), work orders, material transfer, job cards, backflush, partial completion and the 30-day capacity planning default
- [Frappe: ERPNext Manufacturing Settings](https://docs.frappe.io/erpnext/user/manual/en/manufacturing-settings), backflush basis, overproduction percentage and capacity planning
- [Oracle: Time fence options (Fusion Cloud Supply Planning 26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fausp/time-fence-options.html), the planning and natural time fences
- [Oracle: Overview of constraint-based supply planning (26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fausp/overview-of-constraint-based-supply-planning.html), soft capacity and hard lead time constraints and batch-only constrained runs
- [Siemens: Opcenter](https://www.siemens.com/en-us/products/opcenter/), Opcenter APS
