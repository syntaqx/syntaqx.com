+++
title = "Carrier Dispatch & Asset Management"
nav_title = "Dispatch & Assets"
description = "Running a fleet: the carrier TMS, assigning drivers and tractors, trips and relays, maintenance under 49 CFR 396, and driver and owner-operator settlements."
category = "Logistics & Supply Chain Industry"
order = 2833
part = "Planning and Execution"
tags = ["logistics", "dispatch", "fleet-maintenance", "settlements", "trucking", "data-model"]
+++

A carrier's TMS runs the business of moving loads with its own people and equipment. When a shipper's or broker's tender is accepted, the load becomes the carrier's order; dispatch assigns a driver, a tractor and a trailer; the driver runs the trip, sometimes handing the trailer to another driver on the way; the tractor and trailer come back for inspections and repairs on schedules the regulations set; and at the end of the week each driver is paid from what they did, and each leased owner-operator is settled under a lease whose terms the regulations also set. Trimble describes its TruckMate as a "dispatch, operations and accounting system" covering everything "from order entry to settlement"; Alvys lists "Sourcing & Dispatching," "Asset Management" and "Carrier and Driver Settlement." The breadth is the point: in a carrier, the load, the driver's week and the truck's maintenance history are one operation.

It is hard because the scarce resources are people and machines with their own clocks. A driver can be assigned only if they have hours left, are qualified for the freight, are near enough, and can still get home when they're due; a tractor only if its inspections are current and no defect from yesterday's report is unrepaired; a trailer only if it is where the load starts or can get there. Every assignment consumes the next assignment's options. And pay depends on the same facts: miles by a named mileage standard, stops, detention time, the load's revenue for a percentage-paid owner-operator, and every chargeback the lease allows, each needing a document behind it.

This chapter covers the carrier TMS, dispatch and the assignment decision, trips, legs, relays and repowers, equipment maintenance and inspections under 49 CFR 396, and driver and owner-operator settlements. It extends `loads`, `drivers` and `equipment_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). The trailer pools, hook and drop records, deadhead and the 49 CFR 376 lease tables are [Truckload](/books/logistics/truckload)'s; the hours-of-service clocks are [Hours of Service](/books/logistics/hours-of-service)'s; driver qualification is [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification)'s; roadside inspections are [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa)'s; payroll for company drivers is the Workforce volume's.

## How the Platforms Do It

As of November 2026, from vendor product pages (each vendor's claims are its own):

| Vendor | Product | Dispatch and operations | Assets and maintenance | Settlements |
| --- | --- | --- | --- | --- |
| **Alvys** | Alvys TMS, for carriers, brokers and hybrids | "Sourcing & Dispatching," "Dispatch and planning," a driver mobile app | "Asset Management," "Fleet management" | "Driver management and settlement," "Carrier and Driver Settlement"; "3,000+ trucking companies," by its count |
| **Fleetio** | Fleet maintenance | Not a dispatch product; integrates with telematics providers and ELDs | Preventive maintenance to "Increase uptime and reduce breakdowns"; work orders to "Plan, schedule and approve"; inspection forms; "Powering 1,300,000+ fleet assets" | Not applicable |
| **Rose Rocket** | Rose Rocket TMS | "Dispatch Workflows," "Quote Management" | Not described on the page | "Freight Audit & Pay" |
| **Trimble** | TMW.Suite, TruckMate, Trimble TMS for Carriers | TMW.Suite, "our enterprise level TMS solution" for truckload carriers, brokers, 3PLs and private fleets; TruckMate for LTL, intermodal and "complex trucking companies"; "AI-powered dispatch and order management" in TMS for Carriers | TMS for Carriers tracks "driver and equipment compliance deadlines" | TruckMate runs "from order entry to settlement" |
| **Trimble** | TMT Fleet Maintenance | Not applicable | Preventive maintenance, repairs and warranty recovery; "real-time engine diagnostics" connected to "shop work orders and parts inventory"; fault code tracking | Not applicable |

McLeod Software, whose LoadMaster product is a long-standing carrier TMS, refused automated fetches of its site, so it appears here without its own description. <!-- source-gap: logistics-carrier-ops-mcleod | missing | McLeod LoadMaster's scope for asset carriers | closes with: McLeod's product pages or a public customer filing describing LoadMaster | checked: 2026-11-22 -->

Three patterns:

- **The carrier TMS is an operations and accounting system.** TruckMate's "order entry to settlement" and Alvys' settlements and accounting show the scope: a carrier's TMS issues the customer invoice and the driver's pay from the same load, which a shipper's TMS never does.
- **Maintenance often lives in a separate product fed by telematics.** Trimble sells TMT apart from TMW.Suite; Fleetio integrates with telematics and ELD vendors. The carrier TMS needs maintenance status (is this tractor available?) without owning the shop.
- **Compliance deadlines are dispatch constraints.** Trimble's TMS for Carriers tracks "driver and equipment compliance deadlines" because an expired medical card or a lapsed annual inspection takes a driver or a truck out of the assignable pool, the same as a breakdown.

## The Carrier's Order

A tender accepted by a carrier becomes a load the carrier owns: the core `loads` row with `owner_party_id` set to the carrier, the customer's reference (the shipper's shipment ID or the broker's load number), the receivable rate from the tender or the customer's agreement, and the stops with appointments. A carrier keeps the customer's identifiers exactly as sent, because the customer's 214 status messages and the carrier's 210 invoice must quote them back (Transportation EDI covers the messages). Before it is dispatched, the load is checked against the customer's credit and any equipment or service requirement (team, hazmat, temperature) the carrier's fleet must meet.

## Dispatch

Dispatch is the assignment of a load (or the first leg of it) to a driver, a tractor and a trailer. The candidates are drivers who are or will be available near the pickup; the decision weighs:

- **Hours.** Each candidate driver's clocks (drive, window, break and cycle remaining) from `hos_clock_snapshots`, projected to the pickup and through the trip; a driver who can reach the pickup but not the delivery needs a planned rest or a relay ([How to Build It](/books/logistics/hours-of-service#how-to-build-it)).
- **Location and empty miles.** Distance from the driver's last delivery to the pickup, which is the deadhead the load costs ([Deadhead](/books/logistics/truckload#deadhead)).
- **Qualification.** A current CDL with the right endorsements (hazmat, tank, doubles), a current medical certificate, and a clean qualification status ([Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification)).
- **Equipment.** A tractor that is in service with no open out-of-service defect, and a trailer of the right type at or near the origin (or a preloaded trailer to hook: [Live, Drop and Preloaded](/books/logistics/truckload#live-drop-and-preloaded)).
- **Home time.** When the driver is due home and whether this load's destination helps or hurts.
- **Pay and cost.** For an owner-operator on percentage pay, the load's revenue; for a company driver, the miles and pay plan; for either, fuel and tolls on the route.

My rule is that dispatch proposes and a person (or a rule the carrier has explicitly approved) confirms, and that every constraint checked at confirmation is recorded with the values it saw: the clocks' `as_of`, the inspection due dates, the qualification status. A dispatch made at 06:00 on clocks reported at 02:00 should say so, because the 04:00 edit to the log will be the subject of the argument later ([Snapshot What Changes Underneath You](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you)).

The confirmation sends the load to the driver (stops, appointments, references, special instructions) through the driver app or the ELD's messaging, and moves the load to `dispatched`. The driver's acknowledgment is an event, not an assumption.

## Trips, Legs, Relays and Repowers

The core model has one driver, tractor and trailer on a load. Real loads often need more:

- **Team.** Two drivers alternate driving so the truck keeps moving; each driver's hours are their own.
- **Relay.** A driver runs the first part of a long load and hands the trailer to a fresh driver at a relay point (often a terminal), so the freight keeps moving while each driver gets home or rests.
- **Repower.** A truck breaks down or a driver runs out of hours mid-trip; another tractor and driver take the trailer the rest of the way.
- **Split pickup.** One driver brings an empty trailer and another hauls it loaded, as in drop-and-hook operations.

The structure that holds all of these is a sequence of **legs** on the load: each leg has a driver (and co-driver for a team), a tractor, a trailer, a start stop and an end stop (which may be a relay point that isn't a customer stop), and planned and actual times. The load's `driver_id`, `tractor_id` and `trailer_id` then describe the current leg, and pay, hours, fuel and maintenance all read the legs. An LTL carrier's linehaul is legs by nature (terminal to terminal); a truckload carrier's is mostly one leg until something goes wrong, which is why the model has to support many from the start.

## Equipment Maintenance and Inspections

The regulations set the maintenance records a carrier keeps, and the dispatch system enforces their consequences:

- **Systematic maintenance and its records** (49 CFR 396.3). "Every motor carrier and intermodal equipment provider must systematically inspect, repair, and maintain" the vehicles it controls, and for each vehicle it has controlled for 30 consecutive days keep its identification ("company number, if so marked, make, serial number, and year"), "a means to indicate the nature and due date of the various inspection and maintenance operations to be performed," and "a record of inspection, repairs, and maintenance indicating their date and nature." The records are kept where the vehicle is housed or maintained "for a period of 1 year," and "for 6 months after the motor vehicle leaves the motor carrier's control."
- **Driver vehicle inspection reports** (396.11). At the end of each day's work, the driver reports on each vehicle operated, covering brakes, steering, lights and reflectors, tires, horn, wipers, mirrors, coupling devices, wheels and rims, and emergency equipment, but "drivers are not required to prepare a report if no defect or deficiency is discovered by or reported to the driver." Before the vehicle runs again, the carrier certifies on the report that each listed defect was repaired or that repair is unnecessary, and keeps the report and certifications for three months. Carriers operating only one commercial motor vehicle are exempt.
- **The next driver's review** (396.13). Before driving, a driver must "be satisfied that the motor vehicle is in safe operating condition," review the last report where one was required, and "sign the report to acknowledge that the driver has reviewed it."
- **Periodic (annual) inspection** (396.17 and 396.21). Every commercial motor vehicle must have passed an inspection of the components in appendix A to part 396 "at least once during the preceding 12 months," with proof on the vehicle; the report identifies the inspector, the carrier, the date, the vehicle and the components with their results, and is kept "for a period of fourteen months."

Beyond the regulation, carriers schedule preventive maintenance by miles, engine hours or days (oil, brakes, tires, reefer units), and telematics fault codes open repair work; Trimble's TMT connects "real-time engine diagnostics" to work orders and parts, and [Telematics Beyond the Log](/books/logistics/electronic-logging-devices#telematics-beyond-the-log) covers the data coming off the truck. For dispatch, the output of all of it is one question per unit: is it available, and until when. A tractor with an open defect from a driver report, a lapsed annual inspection, or a preventive service overdue past the carrier's tolerance is not assignable, and a unit placed out of service at a roadside inspection ([Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa)) is not assignable until the violation is corrected.

## Settlements

A settlement is the statement of what a driver or owner-operator earned for a period and what was deducted, and it is computed from the loads and legs they ran.

**Company drivers** are employees paid through payroll; the carrier TMS supplies the inputs (miles by the pay plan's mileage standard, stops, detention and layover hours, per-load or hourly units, bonuses) and the payroll system computes pay, overtime treatment and taxes. Werner says most of its drivers are paid per mile, with the rate rising with length of service, and Schneider uses pay scales that rise with experience and performance ([Driver Pay, Briefly](/books/logistics/truckload#driver-pay-briefly)); the wage-hour treatment of those plans is the Workforce volume's ([Overtime and the Regular Rate](/books/workforce/overtime-and-the-regular-rate)).

**Leased owner-operators** are settled under their lease, and 49 CFR 376.12 sets what the settlement must honor:

- Payment "within 15 days after submission of the necessary delivery documents," with no time limit the carrier may set on submitting them (376.12(f)).
- When pay is a percentage of gross revenue, "a copy of the rated freight bill" before or at settlement, with the shipper and consignee names allowed to be deleted (376.12(g)).
- Every chargeback item specified in the lease, with "copies of those documents which are necessary to determine the validity of the charge" (376.12(h)).
- A cargo or property damage deduction only with a written explanation and itemization "delivered to the lessor before any deductions are made" (376.12(j)(3)).
- Escrow deposits and deductions shown on "individual settlement sheets" or accounted for monthly (376.12(k)(3)).

The lease terms themselves (revenue share, fuel surcharge share, cost responsibilities, chargeback list, escrow) are in [Truckload](/books/logistics/truckload#owner-operators-and-leases)'s `equipment_leases` and `equipment_lease_chargebacks`. A settlement reads them as of each trip's date, applies them to that trip's revenue lines, and lists every deduction with its source. Landstar's published practice, owner-operators paid 62% to 70% of revenue with a tractor only and 73% to 77% with a trailer, and 100% of fuel surcharges passed through, is the percentage model at scale ([An Asset Carrier Load](/books/logistics/logistics-business#an-asset-carrier-load)).

A settlement for one owner-operator's week, from the revenue lines of the trips they ran and the lease version in force, in integer minor units:

```go tab="Go"
type RevenueLine struct {
	LoadID string
	Kind   string // a freight_charges kind: "linehaul", "fuel_surcharge", "detention", ...
	Amount int64  // receivable, minor units
}

type Lease struct {
	RevenueShareBP     int64           // e.g. 7000 for 70%
	SharedKinds        map[string]bool // which kinds the percentage applies to
	FuelSurchargeBP    int64           // share of fuel surcharge passed through, e.g. 10000
}

type Deduction struct {
	Item       string // "fuel_advance", "insurance_bobtail", "escrow"
	Amount     int64  // positive minor units, taken off
	DocumentID string // required: 376.12(h) copies on request
}

type SettlementLine struct {
	LoadID string
	Kind   string
	Base   int64 // the revenue the share applied to
	Amount int64 // positive: earned; negative: deducted
}

func Settle(lines []RevenueLine, l Lease, deductions []Deduction) ([]SettlementLine, int64, error) {
	var out []SettlementLine
	var net int64
	for _, r := range lines {
		var bp int64
		switch {
		case r.Kind == "fuel_surcharge":
			bp = l.FuelSurchargeBP
		case l.SharedKinds[r.Kind]:
			bp = l.RevenueShareBP
		default:
			continue // not shared under this lease version
		}
		amt := (r.Amount*bp + 5_000) / 10_000 // basis points, half up
		out = append(out, SettlementLine{r.LoadID, r.Kind, r.Amount, amt})
		net += amt
	}
	for _, d := range deductions {
		if d.DocumentID == "" {
			return nil, 0, fmt.Errorf("deduction %q has no supporting document", d.Item)
		}
		out = append(out, SettlementLine{"", d.Item, 0, -d.Amount})
		net -= d.Amount
	}
	return out, net, nil
}
```

```rust tab="Rust"
use std::collections::HashSet;

pub struct RevenueLine { pub load_id: String, pub kind: String, pub amount: i64 }

pub struct Lease {
    pub revenue_share_bp: i64,       // e.g. 7000 for 70%
    pub shared_kinds: HashSet<String>,
    pub fuel_surcharge_bp: i64,      // share of fuel surcharge passed through
}

pub struct Deduction { pub item: String, pub amount: i64, pub document_id: Option<String> }

pub struct SettlementLine { pub load_id: Option<String>, pub kind: String, pub base: i64, pub amount: i64 }

pub fn settle(lines: &[RevenueLine], lease: &Lease, deductions: &[Deduction])
    -> Result<(Vec<SettlementLine>, i64), String> {
    let mut out = Vec::new();
    let mut net = 0i64;
    for r in lines {
        let bp = if r.kind == "fuel_surcharge" {
            lease.fuel_surcharge_bp
        } else if lease.shared_kinds.contains(&r.kind) {
            lease.revenue_share_bp
        } else {
            continue; // not shared under this lease version
        };
        let amount = (r.amount * bp + 5_000) / 10_000; // basis points, half up
        out.push(SettlementLine { load_id: Some(r.load_id.clone()), kind: r.kind.clone(), base: r.amount, amount });
        net += amount;
    }
    for d in deductions {
        if d.document_id.is_none() {
            return Err(format!("deduction {:?} has no supporting document", d.item));
        }
        out.push(SettlementLine { load_id: None, kind: d.item.clone(), base: 0, amount: -d.amount });
        net -= d.amount;
    }
    Ok((out, net))
}
```

On the illustrative brokered load's carrier side, $1,700.00 linehaul and $624.00 fuel surcharge ([A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload)), a lease at 70% of linehaul with fuel passed through at 100% earns $1,190.00 plus $624.00; a $300.00 fuel advance, $45.00 of bobtail insurance and $50.00 to escrow (all illustrative) leave a net of $1,419.00. Every input is a row the settlement points to, and the settlement is due 15 days after the trip's delivery documents arrived, a date the system computes rather than remembers ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## How to Build It

The core model has a driver, tractor and trailer on each load. Carrier operations adds legs for teams, relays and repowers; availability and home time on drivers; meters and inspection dates on equipment; maintenance schedules, orders and inspection reports; and settlements with their lines. Trailer pools, custody events and leases are [Truckload](/books/logistics/truckload#how-to-build-it)'s and are referenced, not redefined. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE drivers
  ADD COLUMN home_time_due_at   TIMESTAMPTZ,  -- when the driver is due home
  ADD COLUMN available_at       TIMESTAMPTZ,  -- projected end of current work
  ADD COLUMN available_facility_id UUID,      -- where the driver will be then
  ADD COLUMN pay_plan_ref       TEXT;         -- the payroll plan, for company drivers
ALTER TABLE drivers ADD CONSTRAINT drivers_available_facility_fkey
  FOREIGN KEY (available_facility_id) REFERENCES facilities (id) NOT VALID;

ALTER TABLE equipment_units
  ADD COLUMN odometer_km         INT,
  ADD COLUMN engine_hours        INT,
  ADD COLUMN meter_read_at       TIMESTAMPTZ,  -- from telematics or a shop reading
  ADD COLUMN annual_inspection_on DATE,        -- the last passed 396.17 inspection
  ADD COLUMN assignable          BOOLEAN NOT NULL DEFAULT TRUE,  -- maintained by the rules below
  ADD COLUMN unassignable_reason TEXT;

ALTER TABLE loads
  ADD COLUMN dispatched_at       TIMESTAMPTZ,
  ADD COLUMN dispatched_by       TEXT,
  ADD COLUMN driver_acknowledged_at TIMESTAMPTZ;

CREATE TABLE dispatch_legs (             -- a load as driven: one row per driver and equipment
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id          UUID NOT NULL REFERENCES loads (id),
  sequence         SMALLINT NOT NULL CHECK (sequence > 0),
  kind             TEXT NOT NULL CHECK (kind IN ('single', 'team', 'relay', 'repower',
                     'empty_reposition')),
  driver_id        UUID NOT NULL REFERENCES drivers (id),
  co_driver_id     UUID REFERENCES drivers (id),
  tractor_id       UUID NOT NULL REFERENCES equipment_units (id),
  trailer_id       UUID REFERENCES equipment_units (id),
  from_stop_id     UUID REFERENCES stops (id),
  from_facility_id UUID REFERENCES facilities (id),  -- a relay point that isn't a stop
  to_stop_id       UUID REFERENCES stops (id),
  to_facility_id   UUID REFERENCES facilities (id),
  planned_start    TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  loaded_miles_tenths INT,
  empty_miles_tenths  INT,
  hos_snapshot_id  UUID REFERENCES hos_clock_snapshots (id),  -- the clocks dispatch saw
  checks           JSONB NOT NULL DEFAULT '{}',  -- qualification and equipment status as checked
  status           TEXT NOT NULL CHECK (status IN ('planned', 'dispatched', 'in_progress',
                     'completed', 'cancelled')),
  UNIQUE (load_id, sequence),
  CHECK (co_driver_id IS NULL OR co_driver_id <> driver_id)
);
CREATE INDEX ON dispatch_legs (driver_id, planned_start);
CREATE INDEX ON dispatch_legs (tractor_id, planned_start);

CREATE TABLE maintenance_schedules (     -- 396.3(b)(2): the nature and due date of each operation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  operation        TEXT NOT NULL,        -- 'annual_inspection', 'pm_a', 'brake_adjust', 'reefer_service'
  interval_km      INT,
  interval_hours   INT,
  interval_days    INT,
  last_done_on     DATE,
  last_done_km     INT,
  last_done_hours  INT,
  next_due_on      DATE,                 -- computed and stored from the intervals
  next_due_km      INT,
  next_due_hours   INT,
  blocks_dispatch  BOOLEAN NOT NULL DEFAULT FALSE,  -- true for regulatory items
  CHECK (interval_km IS NOT NULL OR interval_hours IS NOT NULL OR interval_days IS NOT NULL),
  UNIQUE (equipment_id, operation)
);

CREATE TABLE vehicle_inspection_reports (  -- DVIRs (396.11) and periodic inspections (396.21)
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  kind             TEXT NOT NULL CHECK (kind IN ('dvir', 'periodic', 'pre_trip_review')),
  driver_id        UUID REFERENCES drivers (id),
  inspector_name   TEXT,                 -- 396.21(a): the individual performing a periodic one
  inspected_at     TIMESTAMPTZ NOT NULL,
  defects          JSONB NOT NULL DEFAULT '[]',  -- component and description, per item
  result           TEXT NOT NULL CHECK (result IN ('no_defects', 'defects', 'passed', 'failed')),
  repairs_certified_at TIMESTAMPTZ,      -- 396.11(a)(3): before the vehicle runs again
  repairs_certified_by TEXT,
  reviewed_by_driver_id UUID REFERENCES drivers (id),  -- 396.13: the next driver's signature
  reviewed_at      TIMESTAMPTZ,
  document_id      UUID REFERENCES documents (id),
  retain_until     DATE NOT NULL,        -- three months for a DVIR, fourteen for periodic
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'periodic' OR inspector_name IS NOT NULL)
);
CREATE INDEX ON vehicle_inspection_reports (equipment_id, inspected_at DESC);

CREATE TABLE maintenance_orders (        -- 396.3(b)(3): what was inspected, repaired or maintained
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  source           TEXT NOT NULL CHECK (source IN ('schedule', 'dvir', 'fault_code',
                     'roadside_inspection', 'breakdown', 'other')),
  schedule_id      UUID REFERENCES maintenance_schedules (id),
  inspection_report_id UUID REFERENCES vehicle_inspection_reports (id),
  fault_code       TEXT,                 -- as the telematics vendor reported it
  vendor_party_id  UUID REFERENCES parties (id),  -- an outside shop, or null for in-house
  description      TEXT NOT NULL,
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  odometer_km      INT,
  cost             BIGINT,               -- minor units
  currency         CHAR(3),
  out_of_service   BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed',
                     'cancelled'))
);

CREATE TABLE driver_settlements (        -- one statement for a driver or owner-operator
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id   UUID NOT NULL REFERENCES parties (id),
  driver_id          UUID NOT NULL REFERENCES drivers (id),
  equipment_lease_id UUID REFERENCES equipment_leases (id),  -- null for company drivers
  period             DATERANGE NOT NULL,
  documents_complete_at TIMESTAMPTZ,     -- the delivery documents that start the 15 days
  due_on             DATE,               -- computed: 376.12(f)
  currency           CHAR(3) NOT NULL,
  net_amount         BIGINT,             -- a sum of the lines, stored when issued
  status             TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'void')),
  issued_at          TIMESTAMPTZ,
  paid_at            TIMESTAMPTZ,
  document_id        UUID REFERENCES documents (id),  -- the statement as sent
  UNIQUE (driver_id, period)
);

CREATE TABLE driver_settlement_lines (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_settlement_id UUID NOT NULL REFERENCES driver_settlements (id),
  load_id            UUID REFERENCES loads (id),
  dispatch_leg_id    UUID REFERENCES dispatch_legs (id),
  kind               TEXT NOT NULL CHECK (kind IN ('revenue_share', 'fuel_surcharge_share',
                       'per_mile', 'per_stop', 'hourly', 'detention', 'bonus',
                       'chargeback', 'escrow_deposit', 'escrow_interest', 'advance', 'other')),
  base_amount        BIGINT,             -- the revenue a percentage applied to
  quantity           NUMERIC(12, 3),     -- miles, stops, hours
  rate               NUMERIC(14, 4),     -- minor units per unit, or basis points as stated
  amount             BIGINT NOT NULL,    -- signed: deductions negative
  freight_charge_id  UUID REFERENCES freight_charges (id),  -- the revenue line it came from
  chargeback_id      UUID REFERENCES equipment_lease_chargebacks (id),
  support_document_id UUID REFERENCES documents (id),  -- 376.12(h) copies; rated freight bill
  CHECK (kind <> 'chargeback' OR (chargeback_id IS NOT NULL AND support_document_id IS NOT NULL))
);
```

Tractors a dispatcher may assign right now, with the reason for every one that can't be:

```sql
SELECT e.id, e.identifier,
       CASE
         WHEN e.status <> 'active' THEN 'not active'
         WHEN e.annual_inspection_on IS NULL
           OR e.annual_inspection_on < CURRENT_DATE - interval '12 months'
           THEN 'annual inspection lapsed'
         WHEN EXISTS (SELECT 1 FROM vehicle_inspection_reports r
                      WHERE r.equipment_id = e.id AND r.result = 'defects'
                        AND r.repairs_certified_at IS NULL) THEN 'uncertified DVIR defect'
         WHEN EXISTS (SELECT 1 FROM maintenance_orders m
                      WHERE m.equipment_id = e.id AND m.out_of_service
                        AND m.status IN ('open', 'in_progress')) THEN 'out of service'
         WHEN EXISTS (SELECT 1 FROM maintenance_schedules s
                      WHERE s.equipment_id = e.id AND s.blocks_dispatch
                        AND (s.next_due_on < CURRENT_DATE OR s.next_due_km < e.odometer_km))
           THEN 'regulatory maintenance overdue'
       END AS blocked_by
FROM equipment_units e
WHERE e.owner_party_id = $1 AND e.kind = 'tractor';
-- blocked_by null: assignable; the carrier's own preventive-maintenance tolerance is a
-- separate, softer rule
```

And owner-operator settlements coming due, with the days left on the 15-day clock:

```sql
SELECT s.id, s.driver_id, s.due_on, s.due_on - CURRENT_DATE AS days_left
FROM driver_settlements s
WHERE s.carrier_party_id = $1
  AND s.equipment_lease_id IS NOT NULL
  AND s.status IN ('draft', 'issued')
ORDER BY s.due_on;
```

Design notes:

- **Legs carry the people and machines.** Hours, pay, fuel and maintenance read `dispatch_legs`; the load's own driver, tractor and trailer columns describe the current leg only.
- **Dispatch snapshots what it checked.** `hos_snapshot_id` and `checks` keep the clocks, qualification and equipment status as they were at assignment, so a later log edit or a late inspection record doesn't rewrite what dispatch knew.
- **Availability is derived, never typed.** `equipment_units.assignable` is maintained from inspection reports, maintenance orders and schedules by the same rules as the query above; a dispatcher can't toggle it.
- **Retention is computed per record.** `retain_until` follows 396.11 (three months) and 396.21 (fourteen months); 396.3 records live for a year and six months after the vehicle leaves the carrier's control ([Data Retention](/docs/building-blocks/data-retention)).
- **Settlements are statements of lines.** Each line points at the revenue charge, the lease chargeback or the leg that produced it, and the supporting document; the net is a sum, stored only when the statement is issued.
- **The lease version is the trip's.** Settlement lines apply the `equipment_leases` version in force on each trip's date, which [Truckload](/books/logistics/truckload#how-to-build-it) versions.
- **Drivers' positions and hours are personal data.** Access and retention follow [Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention).

## Auditing

- **Every dispatch** with who confirmed it, the clocks and checks it relied on, and the driver's acknowledgment.
- **Every leg,** with driver, co-driver, tractor and trailer, times and miles, the record behind hours, pay and fuel tax.
- **Maintenance records per 396.3,** each vehicle's identification, schedule and history, kept a year and six months after it leaves the fleet.
- **Every driver vehicle inspection report** with the repair certification and the next driver's review, kept three months, and every periodic inspection report kept fourteen.
- **Every settlement** with its lines, the rated freight bill for percentage pay, every chargeback's supporting document, the date the delivery documents arrived and the date paid.

## What This Means for the System You Build

- **Run the load, the driver's week and the truck's maintenance in one model,** because each constrains the others.
- **Make dispatch a checked decision:** hours from `hos_clock_snapshots`, qualification, equipment availability, location and home time, recorded as seen.
- **Model loads as legs** so teams, relays and repowers are normal, not exceptions.
- **Derive equipment availability from 49 CFR 396 records:** open DVIR defects, lapsed annual inspections, out-of-service orders and overdue regulatory maintenance.
- **Compute settlements from lines with sources,** apply the lease version in force per trip, refuse undocumented chargebacks, and compute the 15-day due date.
- **Reuse Truckload's lease, pool and custody tables** and leave company-driver pay calculation to payroll.

## References

**Regulations**

- [49 CFR 396.3: Inspection, repair, and maintenance](https://www.law.cornell.edu/cfr/text/49/396.3), systematic maintenance, the required records and their retention
- [49 CFR 396.11: Driver vehicle inspection reports](https://www.law.cornell.edu/cfr/text/49/396.11), the end-of-day report, no-defect exception, repair certification, three-month retention and exemptions
- [49 CFR 396.13: Driver inspection](https://www.law.cornell.edu/cfr/text/49/396.13), the next driver's review and signature
- [49 CFR 396.17: Periodic inspection](https://www.law.cornell.edu/cfr/text/49/396.17), the 12-month inspection, proof on the vehicle and who may perform it
- [49 CFR 396.21: Periodic inspection recordkeeping](https://www.law.cornell.edu/cfr/text/49/396.21), report contents and fourteen-month retention
- [49 CFR 376.12: Written lease requirements](https://www.law.cornell.edu/cfr/text/49/376.12), the 15-day payment, rated freight bill, chargeback documents, damage deductions and escrow on settlement sheets

**Vendors**

- [Alvys](https://alvys.com/), dispatch, asset management and driver and carrier settlement
- [Fleetio](https://www.fleetio.com/), preventive maintenance, work orders, inspections and telematics integrations
- [Rose Rocket](https://www.roserocket.com/), dispatch workflows
- [Trimble: Transportation management](https://transportation.trimble.com/en/solutions/transportation-management), TMW.Suite, TruckMate and TMS for Carriers
- [Trimble: Fleet maintenance](https://transportation.trimble.com/en/solutions/fleet-maintenance), TMT Fleet Maintenance, diagnostics, work orders and parts
