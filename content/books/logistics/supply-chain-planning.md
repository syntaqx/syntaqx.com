+++
title = "Demand & Supply Planning"
nav_title = "Demand & Supply"
description = "Planning above MRP: demand forecasts and their hierarchy, the bullwhip effect, S&OP and its reviews, constrained supply plans, network sourcing, and vendors."
category = "Logistics & Supply Chain Industry"
order = 2859
part = "Manufacturing"
tags = ["logistics", "manufacturing", "supply-chain-planning", "forecasting", "s-and-op", "data-model"]
+++

Supply chain planning decides, months ahead and in aggregate, how much a manufacturer expects to sell, where it will make and stock it, and whether its plants, suppliers and freight can deliver. A consumer products company (illustratively) forecasts 2.4 million cases of a product family for the next quarter, by region and by month; the supply plan finds that one plant's filling line can make 1.9 million, so 300,000 move to a co-packer at a higher cost and 200,000 are built ahead in the slow month, which needs warehouse space and a pre-build of packaging; the financial review asks whether the margin still works; an executive meeting approves it, and the approved plan becomes the master production schedule that MRP explodes, the supplier forecasts sent out on 830s, and the volumes a freight procurement event bids.

It is hard because every function has its own number. Sales has a target, marketing a promotion calendar, finance a budget, operations a capacity, and each customer sends a forecast of its own that swings more than its sales do. A forecast at the item-store-week level is noisy and one at the family-month level hides the mix; plans are revised every cycle, and comparing this month's plan with last month's needs both kept as published. And the constraint that matters keeps moving: a line, a supplier's capacity, a port's congestion, a carrier market that tightened.

This chapter covers the planning horizons, demand planning from the manufacturer's side (statistical baselines, hierarchies and reconciliation, consensus and its accuracy), the bullwhip effect that makes upstream demand swing, sales and operations planning and its reviews, unconstrained and constrained supply plans, network sourcing, and how the plan reaches the master schedule, with the vendors. It extends `items`, `facilities` and `orders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). The forecasting methods themselves (exponential smoothing, Holt-Winters, Croston) and a merchant's reorder points are Commerce's [Forecasting](/books/commerce/purchasing-and-replenishment#forecasting); the master schedule and MRP are [MRP, Scheduling & Work Orders](/books/logistics/production-planning#the-master-production-schedule).

## How the Platforms Do It

As of November 2026, from vendor documentation, product pages and results:

| Vendor | What it says the product does | Public figure |
| --- | --- | --- |
| **Blue Yonder** | "Balance demand, supply and inventory with confidence"; "AI-powered forecasting, constraint-aware planning and multi-echelon inventory optimization"; for integrated business planning, "Evaluate scenarios, quantify business impact and guide revenue, margin and service decisions" | No standalone filing |
| **Kinaxis** | "Maestro™ is the only AI-infused end-to-end supply chain platform" | 2025 revenue $548.0 million (up 13%), SaaS revenue $362.4 million (up 17%), ARR $433 million (up 20%) at December 31, 2025; Q3 2026 revenue $160.3 million (up 19%) and ARR $483.9 million (up 19%); 2026 revenue guidance raised to $640 to $650 million |
| **Microsoft** | Dynamics 365 demand forecasting picks "a best fit among five time series forecasting methods to calculate a baseline forecast"; "Manual adjustments must be authorized before the forecasts can be used for planning"; a Demand planning app with "on-the-fly aggregation and disaggregation"; Planning Optimization for supply | Not broken out |
| **o9 Solutions** | "a single, enterprise-wide IBP process and planning cadence"; "All planning functions operate on a single data foundation, eliminating the 'battle of the numbers'"; "Touchless planning" | Private |
| **Oracle** | Plan types: a Demand Plan ("collaborative and statistical demand forecasting"), a Supply Plan, a Sales and Operations Plan ("for aggregate planning"), and a Demand and Supply Plan; S&OP cycles of product, demand, supply, financial and executive reviews | Not broken out |
| **SAP** | Integrated Business Planning | SAP's IBP documentation renders by script and could not be read for this chapter <!-- source-gap: logistics-scp-sap-ibp | missing | SAP IBP's S&OP, demand and supply planning functions as documented | closes with: a readable SAP IBP help page or a SAP filing describing IBP | checked: 2026-11-22 --> |

Four patterns:

- **One data foundation is the pitch.** o9's "single data foundation," Blue Yonder's balancing of "demand, supply and inventory," Oracle's combined Demand and Supply Plan: the vendors sell the elimination of the separate spreadsheets each function keeps. The data model consequence is one item, location and time hierarchy shared by every plan.
- **Statistical baseline, then human override, then approval.** Microsoft picks a method per series by best fit and requires manual adjustments to be authorized; Oracle's demand review "reach[es] consensus on the future unconstrained demand plan." The override and its approval are records, not edits.
- **Unconstrained first, constrained second.** Oracle's demand review produces unconstrained demand and the supply review tests "the feasibility of internal and external supply capacity"; constrained plans treat capacity as soft and lead times as hard. Planning is two passes, and the gap between them is the decision.
- **Planning has moved out of the transactional database.** Microsoft's Planning Optimization runs "outside Dynamics 365 Supply Chain Management and the related SQL database," in memory, "not limited to daily runs"; Kinaxis sells a separate platform. The ERP holds the orders, the planning engine a copy, and the copy's freshness is a design parameter.

## The Planning Horizons

Planning is nested by horizon and grain, and each level hands its output to the next as a constraint:

| Horizon | Grain | Question | Output |
| --- | --- | --- | --- |
| **Years** | Plant, product family, region | Where to build, close or contract capacity; which suppliers to qualify | Network design, capital plan |
| **Months (12 to 24)** | Family, region, month | How much to sell, make, stock and buy, in aggregate | The approved S&OP plan |
| **Weeks (the next 8 to 26)** | Item, plant, week | What to make and when | The master production schedule |
| **Days and hours** | Order, operation, resource | In what sequence, on which line | The schedule |

The horizons and grains are my working defaults, not a standard; Oracle's S&OP plans "at an aggregate level for strategic time horizons." What doesn't change is the direction: the aggregate plan bounds the master schedule, and the master schedule bounds MRP and scheduling, which [MRP, Scheduling & Work Orders](/books/logistics/production-planning#capacity-and-scheduling) covers.

## Demand Planning

A manufacturer forecasts demand it sees through customers: distributors' orders, retailers' forecasts and point-of-sale data, its own direct orders, and the requirements its customers' plants send as planning schedules ([Supplier Schedules, JIT & Automotive EDI](/books/logistics/supplier-schedules#the-planning-schedule)). The forecast that matters is unconstrained demand: what customers would buy, before supply says what they will get.

### Statistical Baseline

The methods are those of Commerce's [Forecasting](/books/commerce/purchasing-and-replenishment#forecasting) section, applied per series. Microsoft's built-in demand forecasting shows the mechanics (Microsoft now recommends its newer Demand planning app instead): its machine learning experiments "look for a best fit among five time series forecasting methods," hold out a test set ("if you set the value to 20, the last 20 percent of the historical data will be used"), and report the model's accuracy as MAPE. What manufacturers add:

- **Independent and dependent demand.** Microsoft forecasts "independent demand from sales orders and dependent demand at any decoupling point"; spare parts and service kits are independent demand for components MRP would otherwise see only as dependent.
- **Customer-provided forecasts as inputs, not truth.** A customer's 830 or collaborative forecast is a signal with its own bias, measured like any other.
- **Shipments versus orders versus consumption.** Shipment history shows what supply allowed; order history includes cancelled and duplicated orders; consumption (sell-through, a customer plant's usage) is closest to demand and arrives last.

### Hierarchies and Reconciliation

Forecasts are needed at several levels at once (item, family, brand; customer, region, channel; week, month, quarter), and forecasts made independently at each level don't add up. Hyndman and Athanasopoulos describe the choices:

- **Bottom-up:** forecast each bottom series and sum, so "no information is lost due to aggregation," though "bottom-level data can be quite noisy and more challenging to model and forecast."
- **Top-down:** forecast the total and split by historical or forecast proportions, which suffers "loss of information due to aggregation."
- **Middle-out:** forecast a middle level and go both ways; it "can only be used for strictly hierarchical aggregation structures."
- **Optimal reconciliation (MinT):** forecast every level, then adjust them all to be coherent in a way that "minimises the total forecast variance of the set of coherent forecasts."

Microsoft's demand planning app does the planner-facing part: "Planners can edit forecasts at the corporate or product group level" with "on-the-fly aggregation and disaggregation." My rule: every edit records the level it was made at and the disaggregation rule used to push it down, because a family-level override of +10% split by last year's mix can put volume on an item that was discontinued.

### Consensus and Accuracy

The consensus forecast is the statistical baseline plus overrides (sales intelligence, promotions, new products, a customer's announced change), agreed in the demand review. Microsoft requires manual adjustments to "be authorized before the forecasts can be used for planning." Measurement keeps the process honest:

- **Freeze every published version.** Error is measured against the forecast as it stood at the lead time that mattered (the forecast made eight weeks out for an eight-week lead time), so each cycle's forecast is kept as published, as Commerce's chapter also requires.
- **Choose the error measure deliberately.** MAPE is "infinite or undefined if y_t = 0" and puts "a heavier penalty on negative errors than on positive errors"; scaled errors (Hyndman and Koehler's, "scaling the errors based on the training MAE from a simple forecast method") compare across series. Intermittent spare-parts demand needs a scaled measure.
- **Measure bias separately from error,** per series and per contributor.
- **Measure what each step adds.** The comparison of the baseline's error with the consensus forecast's error, per override source, shows which overrides help; I keep both in every snapshot so the comparison is a query.

## The Bullwhip Effect

Demand variability grows as it moves upstream. Lee, Padmanabhan and Whang's 1997 article describes Procter & Gamble's Pampers: retail sales "were fluctuating, but the variabilities were certainly not excessive," distributors' orders surprised executives "by the degree of variability," and in P&G's own orders to 3M "the swings were even greater." They name "four major causes": "Demand forecast updating," "Order batching," "Price fluctuation," and "Rationing and shortage gaming," and the remedy they put first is information sharing, in which "demand information at a downstream site is transmitted upstream in a timely fashion."

For the systems in this volume, each cause has a data answer:

- **Forecast updating:** plan on the customer's consumption or point-of-sale data where it is shared, not only on its orders.
- **Order batching:** lot-sizing minimums and full-truckload ordering batch orders; [Load Planning & Optimization](/books/logistics/load-planning)'s consolidation and MRP's lot sizing both add variance upstream, and a planner should see both.
- **Price fluctuation:** promotions and forward buying shift orders without changing consumption; record promotions as events so history can be cleaned.
- **Shortage gaming:** customers inflate orders when supply is allocated, then cancel; allocate on history or forecast, not on the latest order size.

## Sales and Operations Planning

Sales and operations planning (S&OP) is the cycle that agrees one plan. Oracle's definition: it "aligns product, demand, and supply plans at an aggregate level with your strategic and financial objectives," run as "a process of recurring planning cycles consisting of activities, tasks, and participants." Oracle's reviews, in order:

| Review | Purpose, in Oracle's words | Output |
| --- | --- | --- |
| **Product review** | "cross-functional review of new products and the life cycle of maturing products" | Introductions, phase-outs, supersessions |
| **Demand review** | "reach consensus on the future unconstrained demand plan" | The consensus demand plan |
| **Supply review** | "Use the latest consolidated, unconstrained demand plan and analyze the feasibility of internal and external supply capacity" | A constrained supply plan and its gaps |
| **Financial review** | "Compare the profitability of operational plans for the current fiscal year relative to the financial forecast target" | The plan in money |
| **Executive review** | "Make decisions and approve operational plans" | The approved plan |

Oracle notes the process "does not require you to have all of the review stages." My default cadence is monthly, with the executive review fixing the plan for the month; integrated business planning (IBP), o9's and Blue Yonder's term, is the same cycle with finance and strategy wired in rather than reviewed after. What makes it work in software:

- **Each review produces a version, not an edit.** The demand review's consensus, the supply review's constrained plan and the approved plan are separate, frozen versions, so the executive meeting compares the options and the next month compares with this one.
- **Gaps are explicit.** The difference between unconstrained demand and constrained supply, per family and month, is the agenda; each gap carries a decision (pre-build, overtime, co-pack, allocate, accept lost sales).
- **Scenarios are copies with a delta.** A plan with a second shift, a plan with a supplier's capacity cut by 30%: each a version that shares the base and records what changed.

## Supply Planning

The supply plan answers whether and how the consensus demand can be met: from which plants and suppliers, with what inventory build, at what cost. Oracle's documentation states the two modes:

- **Unconstrained:** "the supply quantity is determined first and then the lead time of the supply is calculated"; capacity overloads are reported, not resolved.
- **Constrained:** "supply quantity is determined based on capacity within the processing lead time"; "resource and supplier capacities are soft constraints that the planning process violates only when necessary," while "a constrained supply plan in general treats lead times as hard constraints," and it runs "only … in batch mode."

The constraints that matter for this volume: plant and line capacity, supplier capacity (often the customer's own 830 forecast to that supplier, turned around), storage at plants and distribution centers, and transportation (lane capacity under contract, transit times by mode, a port's dwell). Transit time is a lead time in the supply plan, so a mode shift from intermodal to truckload is a supply-plan input, not only a freight decision. Inventory targets by location, including multi-echelon optimization (Blue Yonder lists "multi-echelon inventory optimization"), set how much stock each tier holds so the whole network meets a service level at the least inventory.

Solving a constrained plan is an optimization with objectives in conflict (service, cost, inventory), weighed as the playbook's [Two Ways to Fold](/docs/building-blocks/weighing-objectives#two-ways-to-fold) describes; whatever the solver, its output must explain itself in the terms a supply review uses: which demand was cut, why, and what it would cost to restore.

## Network Sourcing

The network says which source supplies which destination: plant A makes family X for the east, plant B for the west and overflow; a distribution center is replenished from plant A by rail and from plant B by truck; a component comes 70% from one supplier and 30% from another. These sourcing rules are effective-dated data ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), and they connect planning to freight: every rule implies lanes, volumes and modes, which become the lanes in a freight bid ([Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides)) and the transit times in the next plan. A network design study (open or close a DC, move a product between plants) is a scenario over these rules, with freight costs from the lane rates the volume's rating chapters describe.

## From the Plan to the Master Schedule

The approved plan is aggregate; the master schedule is per item, plant and week. Disaggregation splits the family plan by the forecast mix within the family, by plant per the sourcing rules, and by week per the month's calendar; the master scheduler then firms the near weeks inside the planning time fence and leaves the rest to the plan. Three handoffs leave this chapter for the next ones:

- **To MRP:** master schedule quantities as independent demand ([The Master Production Schedule](/books/logistics/production-planning#the-master-production-schedule)).
- **To suppliers:** the components' requirements as planning schedules with firm, planning and authorization horizons ([Supplier Schedules, JIT & Automotive EDI](/books/logistics/supplier-schedules)).
- **To freight:** volumes per lane per month, for procurement and capacity commitments with carriers.

## How to Build It

Plans are versions; their numbers are values on a shared item, location and time grain. The tables are prefixed (`forecast_`, `planning_`, `supply_plan_`) to stay clear of the transactional tables MRP owns.

```sql fragment
ALTER TABLE items
  ADD COLUMN planning_family TEXT;       -- the aggregate the S&OP plan is made at

CREATE TABLE planning_cycles (           -- one S&OP or IBP cycle
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  name        TEXT NOT NULL UNIQUE,      -- '2026-12'
  horizon     DATERANGE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'approved', 'closed')),
  approved_at TIMESTAMPTZ
);

CREATE TABLE planning_reviews (          -- each review in the cycle and its decision
  cycle_id    UUID NOT NULL REFERENCES planning_cycles (id),
  review      TEXT NOT NULL CHECK (review IN ('product', 'demand', 'supply', 'financial',
                'executive')),
  held_on     DATE,
  outcome_version_id UUID,               -- the forecast or supply plan version it adopted
  decisions   JSONB NOT NULL DEFAULT '[]',  -- gap decisions: pre-build, co-pack, allocate
  PRIMARY KEY (cycle_id, review)
);

CREATE TABLE forecast_versions (         -- a forecast as published, never edited after
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  cycle_id      UUID REFERENCES planning_cycles (id),
  kind          TEXT NOT NULL CHECK (kind IN ('statistical', 'customer_provided', 'sales',
                  'consensus', 'scenario')),
  base_version_id UUID REFERENCES forecast_versions (id),  -- what a scenario or override started from
  method        TEXT,                    -- the model or source, e.g. the best-fit method's name
  published_at  TIMESTAMPTZ,             -- null while a draft
  approved_by   TEXT,
  CHECK (kind <> 'consensus' OR approved_by IS NOT NULL OR published_at IS NULL)
);

CREATE TABLE forecast_values (           -- one number on the shared grain
  forecast_version_id UUID NOT NULL REFERENCES forecast_versions (id),
  item_id         UUID REFERENCES items (id),    -- null when made at family level
  planning_family TEXT,
  facility_id     UUID REFERENCES facilities (id),  -- the shipping location
  customer_party_id UUID REFERENCES parties (id),
  bucket          DATERANGE NOT NULL,              -- a week or month
  quantity        NUMERIC(14, 3) NOT NULL CHECK (quantity >= 0),
  override_of     NUMERIC(14, 3),                  -- the value before a manual adjustment
  override_reason TEXT,
  override_level  TEXT,                            -- 'item', 'family', 'brand', 'region'
  CHECK (item_id IS NOT NULL OR planning_family IS NOT NULL),
  CHECK (override_of IS NULL OR override_reason IS NOT NULL)
);
CREATE INDEX forecast_values_grain_idx
  ON forecast_values (forecast_version_id, item_id, facility_id, bucket);

CREATE TABLE supply_sourcing_rules (     -- which source supplies which destination
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id              UUID REFERENCES items (id),  -- null: the whole family
  planning_family      TEXT,
  destination_facility_id UUID NOT NULL REFERENCES facilities (id),
  source_facility_id   UUID REFERENCES facilities (id),  -- a plant or DC
  source_party_id      UUID REFERENCES parties (id),     -- a supplier or co-packer
  share                NUMERIC(5, 4) NOT NULL CHECK (share > 0 AND share <= 1),
  rank                 SMALLINT NOT NULL DEFAULT 1,      -- overflow order
  mode                 TEXT,             -- the planned transport mode on the lane
  transit_days         SMALLINT NOT NULL CHECK (transit_days >= 0),
  valid_during         TSTZRANGE NOT NULL,
  CHECK ((source_facility_id IS NULL) <> (source_party_id IS NULL))
);

CREATE TABLE supply_plan_versions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  cycle_id      UUID NOT NULL REFERENCES planning_cycles (id),
  demand_version_id UUID NOT NULL REFERENCES forecast_versions (id),
  mode          TEXT NOT NULL CHECK (mode IN ('unconstrained', 'constrained')),
  scenario      TEXT,                    -- null for the base plan
  engine_version TEXT NOT NULL,
  inputs_as_of  TIMESTAMPTZ NOT NULL,
  published_at  TIMESTAMPTZ
);

CREATE TABLE supply_plan_lines (         -- the plan per item or family, location and bucket
  supply_plan_version_id UUID NOT NULL REFERENCES supply_plan_versions (id),
  item_id       UUID REFERENCES items (id),
  planning_family TEXT,
  facility_id   UUID NOT NULL REFERENCES facilities (id),
  bucket        DATERANGE NOT NULL,
  demand        NUMERIC(14, 3) NOT NULL,
  production    NUMERIC(14, 3) NOT NULL DEFAULT 0,
  purchases     NUMERIC(14, 3) NOT NULL DEFAULT 0,
  transfers_in  NUMERIC(14, 3) NOT NULL DEFAULT 0,
  transfers_out NUMERIC(14, 3) NOT NULL DEFAULT 0,
  ending_inventory NUMERIC(14, 3) NOT NULL,
  unmet_demand  NUMERIC(14, 3) NOT NULL DEFAULT 0,  -- the gap a supply review decides on
  binding_constraint TEXT,               -- 'line:FL2', 'supplier:<party>', 'lane:<id>'
  CHECK (item_id IS NOT NULL OR planning_family IS NOT NULL)
);
```

Notes on the choices:

- **Versions are immutable once published.** A change is a new version with `base_version_id`, so a scenario, an override and next month's plan can all be compared with what was approved.
- **Overrides keep the value they replaced.** `override_of`, `override_reason` and `override_level` make forecast value added a query rather than an investigation.
- **The binding constraint is on the line.** A supply review needs to know why demand was cut, not only by how much.
- **Sourcing shares must sum to one per destination and item** for the rank-1 rules in force; that is a check run at publish, because a constraint can't see across rows and validity ranges.

Accuracy at lead time, comparing what was forecast eight weeks before each bucket with what shipped, with weighted absolute percentage error per family (which, unlike MAPE, survives zero-demand items):

```sql
WITH lagged AS (
  SELECT DISTINCT ON (v.item_id, v.bucket) v.item_id, v.bucket, v.quantity
  FROM forecast_values v
  JOIN forecast_versions fv ON fv.id = v.forecast_version_id
  WHERE fv.kind = 'consensus' AND fv.published_at IS NOT NULL
    AND v.bucket = $1::DATERANGE
    AND fv.published_at <= lower(v.bucket) - INTERVAL '8 weeks'
  ORDER BY v.item_id, v.bucket, fv.published_at DESC   -- the last one published by the lag
), actual AS (
  SELECT sl.item_id, $1::DATERANGE AS bucket, SUM(sl.quantity) AS quantity
  FROM shipment_lines sl JOIN shipments s ON s.id = sl.shipment_id
  WHERE s.status = 'delivered'
    AND s.pickup_window && tstzrange(lower($1::DATERANGE), upper($1::DATERANGE))
  GROUP BY sl.item_id
)
SELECT i.planning_family,
       SUM(ABS(COALESCE(l.quantity, 0) - COALESCE(a.quantity, 0)))
         / NULLIF(SUM(a.quantity), 0) AS wape,
       SUM(COALESCE(l.quantity, 0) - COALESCE(a.quantity, 0))
         / NULLIF(SUM(a.quantity), 0) AS bias
FROM lagged l
FULL JOIN actual a ON a.item_id = l.item_id AND a.bucket = l.bucket
JOIN items i ON i.id = COALESCE(l.item_id, a.item_id)
GROUP BY i.planning_family;
```

Shipments measure supply-limited demand; where orders or consumption are available, they are the better actual, and the query swaps its source.

## Auditing

- **Every published forecast and plan version,** frozen, with its inputs time, engine version and approver, so a decision can be judged on what was known.
- **Every override with its prior value, reason, level and author,** and the disaggregation rule that pushed it down.
- **Every review's adopted version and its gap decisions,** which explain the inventory build, the co-pack invoice and the lost sales after the fact.
- **Sourcing rule changes with validity,** because they move freight volumes between lanes and carriers.

## What This Means for the System You Build

- **Plan on one item, location and time hierarchy** that every function's numbers share.
- **Forecast unconstrained demand first,** then constrain it in supply planning, and keep both.
- **Reconcile forecasts across levels deliberately,** and record the level and rule of every edit.
- **Publish versions and never edit them;** scenarios and overrides are new versions with a base.
- **Measure accuracy at lead time and bias separately,** with a measure that survives zero demand.
- **Share consumption data upstream** to damp the bullwhip, and show planners the batching their own rules add.
- **Store sourcing rules as effective-dated data,** and treat transit time and lane capacity as supply-plan inputs.
- **Record the binding constraint and the decision on every gap.**

## References

**Vendors and results**

- [Kinaxis: Fourth quarter and fiscal 2025 results (March 4, 2026)](https://www.kinaxis.com/en/news/press-releases/2026/kinaxis-inc-reports-record-fourth-quarter-2025-results), 2025 revenue, SaaS revenue and ARR
- [Kinaxis: Third quarter 2026 results (November 4, 2026)](https://www.kinaxis.com/en/news/press-releases/2026/kinaxis-inc-reports-third-quarter-2026-financial-results), Q3 2026 revenue and ARR, and the raised 2026 guidance
- [Kinaxis: Concurrent planning](https://www.kinaxis.com/en/concurrent-planning), the Maestro description
- [o9 Solutions: Integrated business planning](https://o9solutions.com/solutions/integrated-business-planning/), one IBP process, a single data foundation and touchless planning
- [Blue Yonder: Supply chain planning](https://blueyonder.com/solutions/supply-chain-planning), balancing demand, supply and inventory, constraint-aware planning and multi-echelon optimization
- [Microsoft Learn: Demand forecasting overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/introduction-demand-forecasting), independent and dependent demand, best fit among five methods and authorized adjustments
- [Microsoft Learn: Monitor forecast accuracy](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/monitor-forecast-accuracy), MAPE and the test set size
- [Microsoft Learn: Demand planning](https://learn.microsoft.com/en-us/dynamics365/supply-chain/demand-planning/demand-planning-home-page), aggregation and disaggregation of edits
- [Microsoft Learn: Master planning system architecture](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-architecture), Planning Optimization outside the database and not limited to daily runs
- [Oracle: Supply chain planning plan types (26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fausp/overview-of-supply-chain-planning-plan-types.html), demand, supply, S&OP and combined plans
- [Oracle: Overview of constraint-based supply planning (26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fausp/overview-of-constraint-based-supply-planning.html), constrained and unconstrained quantity logic, soft capacity, hard lead times, batch mode
- [Oracle: Overview of sales and operations planning (26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fasop/overview-of-sales-and-operations-planning.html), the S&OP definition and aggregate horizons
- [Oracle: Planning cycles in sales and operations planning (26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fasop/overview-of-planning-cycles-in-sales-and-operations-planning.html), the recurring cycle and the five reviews

**Research**

- [Hyndman and Athanasopoulos: Single level approaches (Forecasting: Principles and Practice, 3rd ed.)](https://otexts.com/fpp3/single-level.html), bottom-up, top-down and middle-out
- [Hyndman and Athanasopoulos: Forecast reconciliation](https://otexts.com/fpp3/reconciliation.html), MinT
- [Hyndman and Athanasopoulos: Evaluating point forecast accuracy](https://otexts.com/fpp3/accuracy.html), MAPE's weaknesses and scaled errors
- [Lee, Padmanabhan and Whang: The bullwhip effect in supply chains (MIT Sloan Management Review, 1997)](https://sloanreview.mit.edu/article/the-bullwhip-effect-in-supply-chains/), the Pampers example, the four causes and information sharing
