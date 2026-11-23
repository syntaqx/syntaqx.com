+++
title = "Truckload"
description = "Full trailers from one shipper: dry van, reefer and flatbed, one-way and dedicated, live and drop, power-only, owner-operators and leases, driver pay, deadhead."
category = "Logistics & Supply Chain Industry"
order = 2805
part = "Road and Rail"
tags = ["logistics", "truckload", "trucking", "owner-operators", "equipment", "data-model"]
+++

Truckload is the simplest mode to describe and one of the hardest to run well: one shipper's freight fills one trailer, a driver picks it up and drives it to one consignee (or a few), and the carrier is paid for the trip. There is no terminal network and no sorting; the unit of work is the load, and the carrier's product is a truck and a driver at a dock inside a window. Knight-Swift's truckload segment, the largest of the carriers surveyed below, averaged 21,428 tractors in 2025 and ran each one 83,650 miles; Werner's one-way fleet ran 15.83% of its miles empty; Schneider earned 70% of its truckload revenue from dedicated fleets that serve a single customer's network under contract.

It is hard because almost every input is a choice with a cost that shows up somewhere else. A drop trailer saves the driver hours at the dock and costs the carrier a trailer that sits for days. A load that pays well into a market with no outbound freight costs the next load its empty miles. A dedicated fleet earns steady revenue per truck per week and loses money on every week the customer's volume falls short of the plan. An owner-operator leased onto a carrier changes the carrier's costs from wages and fuel into a settlement under a federal leasing regulation, and changes the employment question into one a state may answer differently. And the trailer itself (dry van, refrigerated or flatbed) brings its own rules: a reefer carrier must pre-cool and prove temperature when a food shipper asks, and a flatbed driver must secure each article with a minimum number of tiedowns.

This chapter covers the equipment and what each type adds, one-way and dedicated operations, live and drop loading, power-only, deadhead, owner-operators and the 49 CFR 376 lease, driver pay as far as a dispatch system needs it, and the weight and size limits a load must fit. It extends `loads`, `equipment_units` and `drivers` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Pricing a truckload (lane rates, fuel surcharge schedules, detention and the other accessorials) is Rating, Tariffs & Accessorials; offering it to a carrier is Tendering & Acceptance; and dispatch, trailer pools, maintenance and settlements are Carrier Dispatch & Asset Management. The employment status of an owner-operator belongs to the Workforce volume's [Worker Classification](/books/workforce/worker-classification#abc-tests); [Intermodal & Drayage](/books/logistics/intermodal-and-drayage) covers trucks that move containers.

## How the Carriers Do It

As of November 2026, from the carriers' 2025 annual reports:

| Carrier | Truckload business | Fleet | Productivity and mix | Profitability |
| --- | --- | --- | --- | --- |
| **J.B. Hunt** | Dedicated Contract Services ($3,376 million of revenue) builds and runs private fleets for customers; the Truckload segment ($734 million) hauls dry van loads, much of it in its trailers with other carriers' tractors | DCS: 11,878 company and 761 customer-owned trucks at year end, 12,659 on average; JBT: 12,658 company trailers and 2,003 independent contractors | DCS: $5,190 revenue per truck per week; contracts "ranging from three to 10 years, with the average being approximately five years" | Reported by segment in its 10-K |
| **Knight-Swift** | Truckload segment, $4,865.0 million of revenue, alongside LTL, logistics and intermodal | 21,428 average tractors (19,395 company, 2,033 independent contractor) and 84,851 trailers | 13.9% of miles without cargo; 368-mile average length of haul; $199,897 revenue per tractor; 83,650 miles per tractor | Operating ratio 97.0% (94.8% adjusted) |
| **Landstar** | No company trucks: owner-operators ("BCO Independent Contractors") leased on, and third-party carriers | 8,514 BCO trucks at year end | BCOs paid 62% to 70% of revenue with a tractor only, 73% to 77% with a trailer too | Agent model; see How Carriers, Brokers & 3PLs Make Money |
| **Schneider** | Truckload in "dedicated or network configurations" with dry van, bulk, temperature-controlled and flatbed trailers; Power Only in its logistics segment | About 7,800 sleeper and 4,100 day cab tractors, 52,000 trailers; owner-operators about 13% of driver capacity | Dedicated: $1,738.1 million on 8,504 trucks at $4,016 a truck a week; Network: $731.1 million on 3,747 trucks at $3,833 (revenue excluding fuel surcharge) | Truckload operating ratio 95.6% (on revenue excluding fuel surcharge) |
| **Werner** | Truckload Transportation Services, 69% of revenue, in Dedicated and One-Way | 7,100 trucks (6,785 company, 315 independent contractor), 28,780 trailers | Dedicated: 4,864 average tractors at $4,548 a week; One-Way: 2,573 at $4,737, 15.83% empty miles, 572-mile average loaded trip | Operating expenses 99.2% of segment revenue |

Four patterns:

- **Dedicated is most of the asset fleet.** Schneider's dedicated trucks outnumber its network trucks more than two to one, Werner's 4,850 dedicated trucks are about two thirds of its fleet, and J.B. Hunt's DCS is its second-largest segment. Dedicated is priced per truck per week under a multi-year contract, so its revenue looks like a lease, and the software problem moves from finding loads to planning a customer's network.
- **One-way is where the cycle bites.** The one-way (network, irregular-route) fleet competes with brokers for spot and contract loads lane by lane; its revenue per truck and its empty miles are what Freight Markets & Cycles tracks.
- **Owner-operators are a minority of the asset carriers and all of Landstar.** Knight-Swift ran about 9.5% of its average truckload tractors with independent contractors (2,033 of 21,428, my division), Werner 4.4%, Schneider about 13% of driver capacity; Landstar's entire truck capacity is leased or brokered.
- **Margins are thin.** An operating ratio of 95% to 99% leaves one to five cents of every revenue dollar as operating profit, which is why each empty mile, idle trailer and unbilled hour of detention matters to the carrier's system.

## Equipment

A truckload is defined by the trailer it needs, and the trailer is a column on the load (`loads.equipment_type`), a constraint on which carriers can cover it, and a source of its own rules:

| Equipment | What it hauls | What the system adds |
| --- | --- | --- |
| **Dry van** | Palletized or floor-loaded freight that needs no temperature control: retail replenishment, packaged goods, paper, parts | Trailer length, pallet positions and weight; seal numbers; whether the trailer can be dropped |
| **Refrigerated (reefer)** | Food, pharmaceuticals and anything that must stay inside a temperature range, frozen to warm | The setpoint and mode the shipper specifies, pre-cooling, and the temperature record that proves it was held |
| **Flatbed and step deck** | Steel, lumber, machinery, building materials: freight loaded from the side or top by crane or forklift | Dimensions and weight per article, securement (tiedowns, chains, tarps), oversize permits when a load exceeds the legal envelope |
| **Specialized** | Tank, bulk, auto carrier, heavy haul | The commodity's own rules, hazmat when it applies (Hazardous Materials in Transport) |

The size and weight envelope comes from federal rules for the National Network, which states must allow at a minimum. A semitrailer may not be limited to less than 48 feet, twin trailers to less than 28 feet each, and a state may impose no overall length limit on those combinations (23 CFR 658.13); the 53-foot van most truckload fleets run sits on state allowances above that federal floor. Width is 102 inches, "No State shall impose a width limitation of more or less" (23 CFR 658.15). Weight is 80,000 pounds gross, 20,000 on a single axle and 34,000 on a tandem, subject to the bridge formula:

```text
W = 500 x ( L x N / (N - 1) + 12 x N + 36 )

W = the maximum weight in pounds on any group of two or more consecutive axles
L = the distance in feet between the outer axles of the group
N = the number of axles in the group
```

The formula keeps weight spread over enough length to protect bridges (23 CFR 658.17). For a five-axle tractor and semitrailer whose first and last axles are 51 feet apart, it gives 500 × (51 × 5 / 4 + 60 + 36) = 79,875 pounds, short of 80,000; at 57 feet it gives 83,625, so the 80,000-pound cap governs. Two consecutive tandems may each carry 34,000 pounds if the first and last axles are at least 36 feet apart. A load planner that books 44,000 pounds of cargo without knowing the tractor's tare weight and axle spacing is guessing, which is why the check below belongs in the load builder:

```go tab="Go"
// BridgeLimit returns the federal bridge formula limit in pounds for a group
// of n consecutive axles whose outer axles are lengthFt apart (23 CFR 658.17(e)).
func BridgeLimit(lengthFt float64, n int) float64 {
	if n < 2 {
		return 20000 // a single axle: 658.17(c)
	}
	nf := float64(n)
	return 500 * (lengthFt*nf/(nf-1) + 12*nf + 36)
}

// GrossOK checks the whole combination against the bridge limit and the 80,000 cap.
func GrossOK(grossLb, outerAxleSpanFt float64, axles int) bool {
	limit := math.Min(BridgeLimit(outerAxleSpanFt, axles), 80000)
	return grossLb <= limit
}
```

```rust tab="Rust"
/// The federal bridge formula limit in pounds for `n` consecutive axles whose
/// outer axles are `length_ft` apart (23 CFR 658.17(e)).
fn bridge_limit(length_ft: f64, n: u32) -> f64 {
    if n < 2 {
        return 20_000.0; // a single axle: 658.17(c)
    }
    let nf = n as f64;
    500.0 * (length_ft * nf / (nf - 1.0) + 12.0 * nf + 36.0)
}

/// Checks the whole combination against the bridge limit and the 80,000 cap.
fn gross_ok(gross_lb: f64, outer_axle_span_ft: f64, axles: u32) -> bool {
    gross_lb <= bridge_limit(outer_axle_span_ft, axles).min(80_000.0)
}
```

The check runs on the combination as planned (tractor, trailer and cargo weights, axle spacing from the equipment record) and again on the scale ticket if the carrier weighs the truck; the federal rule is a floor on what states must allow, and a state's own limits and permits apply on top of it, so the limits belong in data with the jurisdiction they came from ([Rules as Data](/docs/building-blocks/rules-as-data#what-belongs-in-data)).

**Reefer adds a temperature duty.** Under FDA's sanitary transportation rule, a shipper of food that needs temperature control "must specify in writing to the carrier" the operating temperature and any pre-cooling; a carrier that has agreed in writing to be responsible for sanitary conditions must pre-cool each refrigerated compartment "as specified by the shipper," give the receiver the operating temperature specified by the shipper on request, and on request "demonstrate that it has maintained temperature conditions during the transportation operation," by means the shipper and carrier agree, such as readings at loading and unloading or time and temperature data (21 CFR 1.908). A reefer load therefore carries a setpoint from the shipper's instructions and a series of readings from the reefer unit with their times, kept with the load as evidence.

**Flatbed adds securement.** A flatbed driver secures each article with tiedowns, and the minimum count is a rule: an article not blocked against forward movement needs one tiedown if it is 5 feet or shorter and 1,100 pounds or lighter, two if it is heavier or longer than 5 feet up to 10, and for articles over 10 feet, two plus one more "for every 10 feet" of length, or fraction of it, beyond the first 10 (49 CFR 393.110). The planner records the articles' lengths and weights because they decide both the securement and whether the load needs an oversize permit.

## One-Way and Dedicated

**One-way** (also called irregular-route, over-the-road or network) truckload is a sequence of independent loads: a driver delivers in Atlanta and the carrier's planners look for the next load out of Atlanta, or as close to it as the driver's hours allow. Revenue is per load or per mile on each lane, priced on contract or spot; the carrier chooses which loads to accept, and its result is decided by how well the next load fits where the last one ended. Werner's one-way fleet earned $4,737 a tractor a week in 2025 and ran 15.83% of its miles empty on a 572-mile average loaded trip.

**Dedicated** truckload assigns trucks and drivers to one customer, usually to run that customer's own distribution network (store replenishment from a DC, plant-to-plant shuttles, inbound pickups on a milk run), under a contract priced per truck per week, per mile or both, often with fixed and variable components. The customer gets guaranteed capacity and drivers who know its docks; the carrier gets utilization it can plan. Dedicated contracts commit capacity in advance, so the planning question is sizing the fleet against the customer's forecast and pricing what happens when the volume is above or below it.

The system differences follow from that:

- **Who plans the route.** In one-way, the carrier's load planner matches drivers to available loads; in dedicated, the carrier plans the customer's routes, closer to [Route Optimization](/books/field-operations/route-optimization) than to load matching.
- **What a load is.** A dedicated driver's day can be a multi-stop route that is one `loads` row with many `stops`, or a series of shuttle loads; one-way loads are mostly one pickup and one delivery.
- **What is billed.** Dedicated invoices a fleet charge for the period plus variable lines (miles, stops, fuel), so billing aggregates over many loads; one-way bills each load.
- **What counts as empty.** In dedicated, the return trip to the customer's DC is part of the service and priced into the weekly charge; in one-way, it is deadhead the carrier absorbs.

## Live, Drop and Preloaded

How the trailer meets the freight decides who waits:

- **Live load or live unload.** The driver backs to the door and waits while the shipper or receiver loads or unloads. The driver's time at the dock is the carrier's cost, and past the free time the agreement allows, it is billable detention. The DOT Inspector General estimated in 2018 that detention cost for-hire truckload drivers $1.1 billion to $1.3 billion a year in earnings.
- **Drop and hook.** The driver drops an empty trailer (or a loaded one at delivery) and hooks a trailer the facility has already loaded or emptied. The dock works on its own schedule; the carrier keeps trailers sitting at customer yards, which is a fleet cost.
- **Preloaded.** The shipper loads a trailer before the driver arrives, and the driver only hooks it.

The core model already has `stops.handling` (`live`, `drop`, `preloaded`) and the planned and actual times that detention is computed from. Truckload adds which trailer was dropped or hooked at each stop, so a pool of trailers at a customer's yard can be counted, and how long each sat, which is the evidence for a trailer detention charge and the input to sizing the pool. Detention rules and rates are Rating, Tariffs & Accessorials; the gate and yard records that prove arrival are Yard Management & Dock Scheduling.

## Power-Only

Power-only splits the trailer from the tractor commercially: the shipper, broker or asset carrier owns the trailers, and another carrier supplies only the tractor and driver to pull them. It lets a broker or carrier offer drop trailers without owning tractors for every move, and lets small carriers (often owner-operators with no trailer) haul loads that need one. J.B. Hunt's 360box program "utilizes our J.B. Hunt 360 platform to access capacity" to "offer efficient drop trailer solutions to our customers," with independent contractors or third-party carriers who "agree to transport freight in our trailers"; Schneider's logistics segment sells a "Power Only offering, leveraging a nationwide trailer pool."

For the data model, power-only means the trailer's owner and the tractor's carrier are different parties on the same load: `loads.trailer_id` points at an equipment unit owned by the broker or a pool, while `loads.carrier_party_id` is the power carrier. Trailer custody passes at each hook and drop, the pool owner wants to know where every trailer is and who has it, and a damaged or lost trailer is a claim between them. The interchange of a trailer between parties is the same shape as an intermodal equipment interchange ([Intermodal & Drayage](/books/logistics/intermodal-and-drayage)), and the trailer pool is a fleet the pool owner manages like any other.

## Deadhead

Empty miles are miles nobody pays for. Knight-Swift ran 13.9% of its truckload miles without cargo in 2025 and Werner's one-way fleet 15.83%. At the illustrative 570 total miles and $0.62 a mile driver pay of the asset carrier load in [The Logistics Business](/books/logistics/logistics-business#an-asset-carrier-load), 70 empty miles cost $43.40 of driver pay and about 10.8 gallons of fuel before the first loaded mile, and they don't appear on any invoice.

Deadhead is measured from the end of the previous load (its last stop's departure) to the first pickup of the next, and it belongs on the load that caused it, not as an average, because the decision to accept a load is the decision to drive the empty miles to it. Three numbers make the decision: the loaded miles and revenue of the candidate load, the empty miles to reach it, and what is likely to be available at its destination (the next load's expected revenue and deadhead, which is a forecast from the carrier's history and market data). A planner that ranks candidates on revenue per loaded mile alone will keep accepting loads into markets that strand trucks; ranking on revenue per total mile, including the expected deadhead out of the destination, is the minimum ([Weighing Objectives](/docs/building-blocks/weighing-objectives)).

The core model has `loads.planned_miles`. Truckload adds loaded and empty miles separately, as planned and as driven, and links each load to the previous load of the same tractor so the empty leg between them is a fact, not a guess.

## Owner-Operators and Leases

An owner-operator owns or leases a tractor and drives it. One with its own operating authority is a motor carrier, hired like any other (Operating Authority & Registration covers authority; Carrier Onboarding & Vetting covers hiring one). One who **leases on** to a carrier runs under the carrier's authority, its insurance and its USDOT number, and the arrangement is regulated by statute and by 49 CFR Part 376.

The statute lets the Secretary require a carrier using vehicles it doesn't own to "make the arrangement in writing signed by the parties," specifying its duration and the compensation; to carry a copy in each vehicle; to inspect the vehicles and obtain liability and cargo insurance on them; and to "have control of and be responsible for operating those motor vehicles" as if it owned them (49 U.S.C. 14102). Part 376 does so:

- **A written lease and receipts.** "There shall be a written lease granting the use of the equipment"; the carrier gives the owner a receipt when it takes possession; it marks the equipment as its own and keeps either a copy of the lease or a statement naming the owner, the lease date and length, any commodity restrictions and where the original is kept on the equipment; and it keeps a document for each trip with the owner's name and address, the origin, the departure date and time and the final destination (49 CFR 376.11).
- **What the lease must say** (49 CFR 376.12). It is between "the authorized carrier and the owner of the equipment"; it states when it begins and ends; the carrier "shall have exclusive possession, control, and use of the equipment for the duration of the lease" and "complete responsibility for the operation"; compensation "shall be clearly stated on the face of the lease or in an addendum," delivered before any trip; it says who pays for "fuel, fuel taxes, empty mileage," permits, tolls, ferries, detention, accessorial services, base plates and licenses, and who loads and unloads; payment is due "within 15 days after submission of the necessary delivery documents," and the carrier may not set time limits for submitting them; when pay is a percentage of revenue, the lessor is entitled to the rated freight bill; every chargeback is listed with how it is computed, with copies of the supporting documents on request; the carrier's duty to insure for the public is stated, and any insurance the lessor buys through the carrier (such as bobtail coverage) and its chargeback; a cargo or damage deduction requires a written, itemized explanation delivered "before any deductions are made."
- **Escrow.** If the carrier holds an escrow fund or performance bond, the lease states its amount and what it may cover; the carrier accounts for it on settlement sheets or monthly, the lessor can demand an accounting at any time, "the carrier shall pay interest on the escrow fund on at least a quarterly basis" at no less than the average yield on 91-day Treasury bills, and "in no event shall the escrow fund be returned later than 45 days from the date of termination" (49 CFR 376.12(k)).

None of this decides employment. The regulation says its control provision is not meant to decide whether the lessor or its driver "is an independent contractor or an employee of the authorized carrier lessee" (376.12(c)(4)), so a leased owner-operator can be a contractor under the federal lease and an employee under a state's test. The employment question, including state ABC tests, is the Workforce volume's: [Worker Classification](/books/workforce/worker-classification#abc-tests). What a carrier's system owes the lease is narrower and mechanical: the lease document and its version, the compensation terms in force on each trip, the chargeback schedule, the escrow balance with its interest, and a settlement paid within 15 days of the documents, each traceable to the trip and the freight bill. Settlements themselves are Carrier Dispatch & Asset Management.

Landstar shows the percentage model at scale: its BCOs receive a share of each load's revenue, "generally" 62% to 70% with only a tractor and 73% to 77% with a trailer too, and it "passed 100%" of the fuel surcharges it billed to them in 2025. Schneider pays owner-operators "on a per load basis." The same freight bill therefore produces two numbers: what the customer owes the carrier (receivable) and what the carrier owes the owner-operator under the lease (payable), and the percentage applies to whichever revenue lines the lease says it applies to.

## Driver Pay, Briefly

Driver pay is payroll and the Workforce volume owns it; a dispatch system needs to know only what produces the inputs. Werner says "most of our professional drivers are compensated on a per-mile basis," with the rate generally rising with length of service; Schneider uses "driver pay scales which provide for increasing pay by experience level and performance," some with minimum guarantees; dedicated and local drivers are often paid by the hour, the day or the stop; and leased owner-operators are paid under their lease, per load or as a percentage. The dispatch record supplies miles (by whatever mileage standard the pay plan names), stops, detention and layover time, and the load's revenue; the pay calculation, minimum wage and overtime treatment belong to payroll ([Overtime and the Regular Rate](/books/workforce/overtime-and-the-regular-rate)). My rule: store the facts the pay plan reads, versioned with the plan that read them, and never store a driver's pay as a field on the load.

## How to Build It

The core `loads` row is one vehicle's trip; truckload adds what kind of service it is, the trailer's source, the miles it ran loaded and empty, and the reefer and flatbed facts. `equipment_units` adds the weights and axle spacing the bridge check needs; `drivers` adds the lease an owner-operator runs under. New tables hold leases, their chargeback terms, trailer pools, trailer custody at each stop and reefer readings. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE loads
  ADD COLUMN tl_service        TEXT,     -- 'one_way', 'dedicated', 'power_only', 'team', 'expedited'
  ADD COLUMN trailer_source    TEXT,     -- whose trailer: the carrier's, a broker's or shipper's pool
  ADD COLUMN previous_load_id  UUID REFERENCES loads (id),  -- same tractor's prior load
  ADD COLUMN empty_miles_planned NUMERIC(8, 1),  -- deadhead from the previous load's last stop
  ADD COLUMN loaded_miles_actual NUMERIC(8, 1),  -- from the ELD or the mileage engine, as driven
  ADD COLUMN empty_miles_actual  NUMERIC(8, 1),
  ADD COLUMN mileage_source    TEXT,     -- the mileage standard and version used for billing
  ADD COLUMN temp_setpoint_dc  INT,      -- reefer setpoint in tenths of a degree Celsius
  ADD COLUMN temp_mode         TEXT,     -- 'continuous' or 'cycle', as the shipper specified
  ADD COLUMN gross_weight_g    BIGINT;   -- tractor, trailer and cargo, as planned
ALTER TABLE loads ADD CONSTRAINT loads_tl_service_check
  CHECK (tl_service IS NULL OR tl_service IN ('one_way', 'dedicated', 'power_only', 'team',
    'expedited')) NOT VALID;
ALTER TABLE loads ADD CONSTRAINT loads_trailer_source_check
  CHECK (trailer_source IS NULL OR trailer_source IN ('carrier', 'broker_pool', 'shipper_pool',
    'customer_owned', 'leased')) NOT VALID;
ALTER TABLE loads ADD CONSTRAINT loads_temp_mode_check
  CHECK (temp_mode IS NULL OR (temp_mode IN ('continuous', 'cycle')
    AND temp_setpoint_dc IS NOT NULL)) NOT VALID;

ALTER TABLE equipment_units
  ADD COLUMN tare_weight_g   BIGINT,   -- empty weight, from a scale ticket
  ADD COLUMN axle_count      SMALLINT,
  ADD COLUMN axle_spacing_mm INT[],      -- distances between consecutive axles, front to back
  ADD COLUMN interior_length_mm INT,     -- trailers: usable length for pallet positions
  ADD COLUMN reefer_unit_ref TEXT;       -- the refrigeration unit's serial or telematics ID
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_weights_check
  CHECK ((tare_weight_g IS NULL OR tare_weight_g > 0)
    AND (axle_count IS NULL OR axle_count > 0)) NOT VALID;

ALTER TABLE drivers
  ADD COLUMN equipment_lease_id      UUID,  -- set for leased owner-operators
  ADD COLUMN home_terminal_facility_id UUID REFERENCES facilities (id);
ALTER TABLE drivers ADD CONSTRAINT drivers_lease_check
  CHECK (engagement <> 'leased_owner_operator' OR equipment_lease_id IS NOT NULL) NOT VALID;

CREATE TABLE equipment_leases (          -- a 49 CFR 376 lease of an owner-operator's equipment
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id      UUID NOT NULL REFERENCES parties (id),  -- the authorized carrier lessee
  lessor_party_id       UUID NOT NULL REFERENCES parties (id),  -- the equipment owner
  version               INT NOT NULL DEFAULT 1,
  valid_during          TSTZRANGE NOT NULL,  -- when it begins and ends, 376.12(b)
  compensation_basis    TEXT NOT NULL CHECK (compensation_basis IN ('percentage_of_revenue',
                          'per_mile', 'per_load', 'hourly', 'other')),
  revenue_share_bp      INT CHECK (revenue_share_bp BETWEEN 0 AND 10000),  -- for percentage
  rate                  NUMERIC(14, 4),    -- minor units per mile, load or hour
  revenue_lines_shared  TEXT[],            -- which freight_charges kinds the percentage applies to
  fuel_surcharge_share_bp INT CHECK (fuel_surcharge_share_bp BETWEEN 0 AND 10000),
  cost_responsibilities JSONB NOT NULL,    -- fuel, tolls, permits, empty miles, loading: who pays
  payment_days          SMALLINT NOT NULL DEFAULT 15 CHECK (payment_days <= 15),  -- 376.12(f)
  escrow_amount         BIGINT CHECK (escrow_amount >= 0),
  escrow_return_days    SMALLINT CHECK (escrow_return_days <= 45),  -- 376.12(k)(6)
  currency              CHAR(3) NOT NULL,
  document_id           UUID NOT NULL REFERENCES documents (id),  -- the signed lease as exchanged
  receipt_document_id   UUID REFERENCES documents (id),  -- 376.11(b) receipt for possession
  equipment_ids         UUID[] NOT NULL,   -- the tractor and any trailer it covers
  status                TEXT NOT NULL CHECK (status IN ('draft', 'active', 'terminated')),
  terminated_at         TIMESTAMPTZ,
  UNIQUE (carrier_party_id, lessor_party_id, version),
  CHECK ((compensation_basis = 'percentage_of_revenue') = (revenue_share_bp IS NOT NULL))
);

ALTER TABLE drivers ADD CONSTRAINT drivers_equipment_lease_fkey
  FOREIGN KEY (equipment_lease_id) REFERENCES equipment_leases (id) NOT VALID;

CREATE TABLE equipment_lease_chargebacks (  -- each item the carrier may deduct, 376.12(h)
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_lease_id UUID NOT NULL REFERENCES equipment_leases (id),
  item               TEXT NOT NULL,      -- 'fuel_advance', 'insurance_bobtail', 'plates', 'escrow'
  computation        TEXT NOT NULL,      -- how the amount is computed, as the lease states it
  fixed_amount       BIGINT,             -- when the lease fixes it
  requires_itemization BOOLEAN NOT NULL DEFAULT FALSE,  -- cargo and damage deductions, 376.12(j)(3)
  UNIQUE (equipment_lease_id, item)
);

CREATE TABLE trailer_pools (             -- trailers kept at a customer's yard or offered for power-only
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  facility_id    UUID REFERENCES facilities (id),  -- null: a network-wide pool
  customer_party_id UUID REFERENCES parties (id),
  target_count   SMALLINT CHECK (target_count >= 0),
  valid_during   TSTZRANGE NOT NULL
);

CREATE TABLE trailer_custody_events (    -- every hook and drop, by whom, where
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  trailer_id      UUID NOT NULL REFERENCES equipment_units (id),
  stop_id         UUID REFERENCES stops (id),
  facility_id     UUID REFERENCES facilities (id),
  trailer_pool_id UUID REFERENCES trailer_pools (id),
  action          TEXT NOT NULL CHECK (action IN ('hook', 'drop')),
  loaded          BOOLEAN NOT NULL,
  seal_number     TEXT,
  carrier_party_id UUID NOT NULL REFERENCES parties (id),  -- who had the tractor
  driver_id       UUID REFERENCES drivers (id),
  occurred_at     TIMESTAMPTZ NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  condition_document_id UUID REFERENCES documents (id)  -- photos, an inspection report
);

CREATE TABLE reefer_readings (           -- the temperature record a shipper can ask for
  load_id          UUID NOT NULL REFERENCES loads (id),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  recorded_at      TIMESTAMPTZ NOT NULL, -- when the unit recorded it
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  setpoint_dc      INT NOT NULL,         -- tenths of a degree Celsius
  return_air_dc    INT,
  supply_air_dc    INT,
  unit_mode        TEXT,                 -- as the unit reports it: continuous, cycle, defrost, off
  source           TEXT NOT NULL CHECK (source IN ('telematics', 'download', 'manual')),
  PRIMARY KEY (load_id, equipment_id, recorded_at)
);

CREATE INDEX CONCURRENTLY loads_previous_load_idx ON loads (previous_load_id);
CREATE INDEX CONCURRENTLY trailer_custody_trailer_idx
  ON trailer_custody_events (trailer_id, occurred_at);

ALTER TABLE loads VALIDATE CONSTRAINT loads_tl_service_check;
ALTER TABLE loads VALIDATE CONSTRAINT loads_trailer_source_check;
ALTER TABLE loads VALIDATE CONSTRAINT loads_temp_mode_check;
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_weights_check;
ALTER TABLE drivers VALIDATE CONSTRAINT drivers_lease_check;
ALTER TABLE drivers VALIDATE CONSTRAINT drivers_equipment_lease_fkey;
```

Two questions the tables answer. Empty miles by lane and month, the number a one-way fleet manages to:

```sql
SELECT date_trunc('month', s.departed_at) AS month,
       SUM(l.empty_miles_actual)                                    AS empty_miles,
       SUM(l.loaded_miles_actual + l.empty_miles_actual)            AS total_miles,
       ROUND(100.0 * SUM(l.empty_miles_actual)
             / NULLIF(SUM(l.loaded_miles_actual + l.empty_miles_actual), 0), 2) AS empty_pct
FROM loads l
JOIN stops s ON s.load_id = l.id AND s.sequence = 1
WHERE l.owner_party_id = $1
  AND l.tl_service = 'one_way'
  AND l.status IN ('delivered', 'closed')
GROUP BY 1
ORDER BY 1;
```

And trailers that have sat dropped at a customer's yard longer than the agreement allows, the evidence for a trailer detention line and the input to resizing the pool:

```sql
WITH latest AS (
  SELECT DISTINCT ON (t.trailer_id) t.trailer_id, t.facility_id, t.action, t.occurred_at
  FROM trailer_custody_events t
  WHERE t.trailer_pool_id = $1
  ORDER BY t.trailer_id, t.occurred_at DESC
)
SELECT trailer_id, facility_id, occurred_at AS dropped_at, NOW() - occurred_at AS sitting
FROM latest
WHERE action = 'drop'
  AND occurred_at < NOW() - make_interval(days => $2)  -- the agreement's free days
ORDER BY occurred_at;
```

Design notes:

- **The lease is versioned and every trip points at the version in force.** A rate change or a new chargeback is a new version with its own signed document; a settlement computed against the wrong version is the commonest lease dispute, and 376.12 requires the terms to be on the lease before the trip.
- **Compute the payment deadline, don't remember it.** The 15-day clock starts when the necessary delivery documents are submitted, so the system records when each document arrived and derives the due date from it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Escrow is a ledger, not a balance column.** Deposits, deductions, quarterly interest at the Treasury-bill-based rate and the return within 45 days of termination are entries with dates ([Accounting](/docs/money/accounting)).
- **Miles have a source.** Billing miles come from a named mileage standard and version, driven miles from the ELD; they differ, and a pay or billing dispute needs to know which number was used.
- **Reefer readings are evidence.** Store them as recorded, with the unit's timestamps and the time they arrived, and never smooth or resample the stored copy.
- **Positions are personal data.** A leased owner-operator's tractor is also the person's vehicle, so the retention and consent rules in [Location Tracking](/docs/building-blocks/location-tracking#consent-law-and-retention) apply to its positions.

## Auditing

- **Every lease and its versions,** with the signed document, the possession receipt, the chargeback schedule, and the trip documents 376.11 requires, kept as transportation records.
- **Every settlement's inputs:** the trip, the rated freight bill for percentage pay, the miles and their source, each chargeback with its computation and supporting document, the date the delivery documents were submitted and the date paid.
- **Escrow activity** with interest postings and the return date after termination.
- **Every trailer hook and drop,** with the party, seal, condition and time, which decides who had a trailer when it was damaged or lost.
- **Reefer setpoints and readings** for every temperature-controlled load, ready to hand a shipper or receiver who asks under 21 CFR 1.908.
- **Weights:** planned gross and axle weights against scale tickets, for overweight citations and for loads refused at the scale.

## What This Means for the System You Build

- **Treat the trailer type as a rule set,** not a label: reefer brings setpoints and readings, flatbed brings article dimensions and securement, and every load brings the weight envelope.
- **Run the bridge check in the load builder** with the equipment's actual tare and axle spacing, and keep the limits as data with their jurisdiction.
- **Model one-way and dedicated differently:** one-way bills loads and fights deadhead; dedicated bills fleets per week and plans a customer's routes.
- **Record which trailer was hooked and dropped at every stop,** with whose tractor, so pools, power-only and trailer detention all read the same facts.
- **Measure deadhead per load,** linked to the previous load, and rank candidate loads on total miles, not loaded miles.
- **Store leases as versioned documents with structured terms,** compute the 15-day payment deadline from the documents' arrival, and keep escrow as a ledger.
- **Leave classification to the Workforce volume** and pay calculation to payroll; a dispatch system supplies their inputs.

## References

**Filings**

- [J.B. Hunt Transport Services: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/728535/000143774926005294/jbht20251231_10k.htm), DCS and JBT revenue, fleets, revenue per truck per week, contract lengths, 360box and independent contractors
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), truckload revenue, average company and independent contractor tractors and trailers, deadhead, length of haul, revenue and miles per tractor, operating ratio
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), BCO trucks, revenue share paid to BCOs and fuel surcharges passed through
- [Schneider National: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1692063/000169206326000013/sndr-20251231.htm), segments, Power Only and its trailer pool, equipment counts, owner-operator share and per-load pay, driver pay scales, dedicated and network revenue, trucks and revenue per truck per week, truckload operating ratio
- [Werner Enterprises: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/793074/000079307426000071/wern-20251231.htm), TTS share of revenue, fleet by segment and ownership, trailers, revenue per tractor per week, empty miles, length of haul, per-mile driver pay and segment operating expenses

**Statutes and regulations**

- [49 U.S.C. 14102: Leased motor vehicles](https://www.law.cornell.edu/uscode/text/49/14102), the written arrangement, its copy in the vehicle, inspection, insurance and control
- [49 CFR 376.11: General leasing requirements](https://www.law.cornell.edu/cfr/text/49/376.11), the written lease, receipts, identification and trip records
- [49 CFR 376.12: Written lease requirements](https://www.law.cornell.edu/cfr/text/49/376.12), parties, duration, exclusive possession, compensation, cost responsibilities, the 15-day payment rule, chargebacks, insurance, deductions, escrow interest and return
- [23 CFR 658.13: Length](https://www.law.cornell.edu/cfr/text/23/658.13), the 48-foot semitrailer and 28-foot twin minimums and no overall length limit
- [23 CFR 658.15: Width](https://www.law.cornell.edu/cfr/text/23/658.15), 102 inches on the National Network
- [23 CFR 658.17: Weight](https://www.law.cornell.edu/cfr/text/23/658.17), 80,000 pounds gross, axle limits and the bridge formula
- [21 CFR 1.908: Sanitary transportation requirements](https://www.law.cornell.edu/cfr/text/21/1.908), the shipper's written temperature specification and the carrier's pre-cooling and proof of temperature
- [49 CFR 393.110: Minimum number of tiedowns](https://www.law.cornell.edu/cfr/text/49/393.110), tiedowns by article length and weight

**Government**

- [DOT Office of Inspector General: ST2018019, commercial driver detention (January 31, 2018)](https://www.oig.dot.gov/library-item/36237), detention's cost to drivers
