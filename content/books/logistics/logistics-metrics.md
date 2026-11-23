+++
title = "Logistics Metrics"
description = "OTIF, on-time pickup and delivery, tender acceptance, cost per mile, operating ratio, dwell, inventory accuracy, dock-to-stock and OEE, each defined once."
category = "Logistics & Supply Chain Industry"
order = 2867
part = "Running the Platform"
tags = ["logistics", "metrics", "otif", "operating-ratio", "oee", "data-model"]
+++

Every company in this volume runs on a handful of numbers, and every one of those numbers has a fight attached. A carrier says it was on time because the driver arrived inside the appointment; the receiver says it was late because the truck sat at the gate for an hour; the retailer fines the supplier because the PO arrived a day early. A broker reports 92% tender acceptance from a carrier that rejected a third of its loads, because expired tenders weren't counted. A shipper's cost per mile falls when its TMS switches mileage engines. A warehouse's inventory accuracy is 99.8% by units and 94% by locations. None of these is a calculation error. Each is a definition nobody wrote down.

The engineering is the same across all of them, and it is the playbook's: one definition per metric, versioned, computed from the same rows every time, with its numerator and denominator kept beside the result ([One Definition per Metric](/docs/data/data-pipelines#one-definition-per-metric)). What logistics adds is the specific definitions, the records each one reads, and the places they go wrong. This chapter covers how carriers, railroads and researchers publish their numbers, then OTIF (and how a retailer's OTIF differs), on-time pickup and delivery, tender acceptance, cost and revenue per mile, operating ratio, dwell and detention, inventory accuracy, dock-to-stock, and OEE, each with a formula and the tables it reads. It extends `loads`, `stops`, `tenders` and `shipment_events` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) and the `metric_definitions` table that [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics#how-to-build-it) creates, and reads tables the visibility, warehouse and manufacturing chapters define. The Commerce volume's [Commerce Metrics](/books/commerce/commerce-metrics#definitions-as-code-restatements-as-rows) is the same exercise for a store.

## How the Companies Report

As of November 2026, from filings, regulations and published research:

| Source | Metric | Definition, as published | Figure |
| --- | --- | --- | --- |
| **Old Dominion Freight Line** (10-K for 2025) | Operating ratio; on-time service; cargo claims ratio; revenue per hundredweight | Operating ratio "calculated by dividing total operating expenses by revenue" | 75.2% (73.4% in 2024); "99% on-time service and a cargo claims ratio of 0.1%"; $33.31 per hundredweight including fuel surcharges |
| **Knight-Swift Transportation** (10-K for 2025) | Truckload operating ratio; empty miles; revenue per tractor; length of haul | Operating ratio "operating expenses as a percentage of total revenue, or the inverse of operating margin"; empty miles the "Percentage of miles without trailer cargo" | Truckload 97.0% GAAP, 94.8% adjusted; 13.9% non-paid empty miles; $199,897 per tractor, excluding fuel surcharge; 368 miles; LTL segment 97.4% |
| **Surface Transportation Board** (49 CFR 1250) | Class I railroad terminal dwell, train speed, cars online | "Terminal dwell is the average time a car resides at a specified terminal location expressed in hours"; train speed is train-miles over hours operated, between terminals | Reported weekly, for the system and its 10 largest terminals, due Wednesdays at 5 p.m. Eastern |
| **ATRI** (Operational Costs of Trucking, 2026 update, July 15, 2026) | Cost per mile | "The industry-average cost to operate a truck" | $2.336 a mile in 2025, up 3.4%; $1.854 excluding fuel |
| **DOT Office of Inspector General** (ST2018019, January 31, 2018) | Dwell and detention | Dwell is total time at a facility; detention is time beyond the contract limit | A 15-minute increase in average dwell raises the expected crash rate 6.2%; "Accurate industrywide data on driver detention do not currently exist" |
| **Walmart, Target** (retail OTIF programs) | OTIF | The retailer's own rule, by case or unit, against its window | Owned by Commerce: [OTIF Programs](/books/commerce/wholesale-and-retail-distribution#otif-programs) |

Three patterns:

- **Every public figure comes with its definition.** The filings quote the formula beside the number because the number is meaningless without it; Knight-Swift reports a GAAP and an adjusted ratio for the same segment, 2.2 points apart. A system that shows a figure without its definition invites the comparison the filers avoid.
- **Regulators define the metric when they want comparable numbers.** The STB doesn't let each railroad decide what terminal dwell means; 49 CFR 1250.2 does, with a fixed week (12:01 a.m. Saturday to 11:59 p.m. Friday) and a deadline. Where no regulator does, two companies' numbers aren't comparable.
- **The best-measured numbers are the least disputed.** A carrier's operating ratio comes from audited statements; detention, which the OIG found nobody measures consistently, is the most argued line on a freight bill. The difference is records: a gate time recorded by the facility, a check-in from the driver's app, and an ELD geofence all exist, and the metric's definition has to pick one.

## Definitions Are Data

The rules, applied to this volume's records:

- **Name the event that counts.** "Delivered" means the stop's `arrived_at`, or its `departed_at`, or the POD's signature time, or the receiver's receipt close. Each is a column or row in the core model; the definition picks one and says so.
- **Name the clock and the zone.** Appointments are ranges in the facility's time zone ([Facilities Resolve Time and Rules](/books/logistics/logistics-business#the-core-data-model)); a day boundary for "delivered on the 3rd" is the facility's midnight, not the server's.
- **Name the denominator's exclusions.** Cancelled loads, loads with no appointment, shipper-caused misses, force majeure, rebills counted once: each exclusion is a rule in the definition and a row per excluded record, with who approved it.
- **Freeze reported values.** A scorecard sent to a carrier on the 5th is a record; recomputing it on the 20th because a late 214 arrived changes the number in the database but not in the carrier's inbox. Values are stored with the definition version and the data cutoff they used, and a restatement is a new value, not an edit ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Use event time for performance, received time for latency.** On-time is judged on `occurred_at`; a partner's reporting lag (`received_at` minus `occurred_at`) is its own metric, and a carrier that reports deliveries six hours late is a visibility problem, not a late carrier ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).

## OTIF

On time in full is the shipper's and the receiver's headline service metric, and it means two different things depending on who measures:

- **Transportation OTIF,** per shipment: the shipment was delivered on time (arrival inside the delivery appointment, plus the definition's grace) and in full (no shortage, overage, damage or refusal recorded against it at delivery). `OTIF = shipments on time and in full / shipments delivered in the period`. On time reads `stops.arrived_at` against `stops.appointment` at the delivery stop; in full reads `osd_exceptions` at stage `delivery` ([The Bill of Lading and the PRO Number](/books/logistics/ltl-networks#the-bill-of-lading-and-the-pro-number) and the OS&D records in [LTL Networks](/books/logistics/ltl-networks#how-to-build-it)).
- **Retail OTIF,** per PO, by the retailer's rule: whether the vendor's whole order arrived inside the retailer's window around its must-arrive-by date, measured in cases or units, and fined on the miss. Walmart's and Target's programs, their targets and fees, and the fact that an early arrival can fail are the Commerce volume's ([OTIF Programs](/books/commerce/wholesale-and-retail-distribution#otif-programs)).

The two diverge on the same truck:

| Case | Transportation OTIF | Retail OTIF |
| --- | --- | --- |
| Truck arrives a day before the MABD window opens, unloaded on appointment | On time if the appointment was kept | Can fail as early |
| The vendor shipped 950 of 1,000 cases ordered; all 950 arrive | In full (the shipment was complete) | Not in full (the PO wasn't) |
| The carrier arrived on time; the DC unloaded it the next morning | On time | Depends on the retailer's receipt time |
| One pallet damaged and refused | Not in full | Not in full, and the cases count as missing |

So a supplier needs both, computed separately, and the gap between them is the supplier's own problem (short shipping, early shipping) rather than the carrier's. My rule: store the retailer's definition as the retailer's, with its own version and the text it was published in, and compute it from the retailer's receiving data where the retailer provides it ([Channel Definitions Are Imported](/books/commerce/commerce-metrics#definitions-as-code-restatements-as-rows)); compute transportation OTIF from your own stops and exceptions; and never show one under the other's name.

## On-Time Pickup and Delivery

The component measures, per stop:

- **On-time pickup:** `pickup stops with arrived_at <= upper(appointment) + grace / pickup stops with an appointment`. Some shippers judge pickup on departure (the truck left loaded on time); the definition says which.
- **On-time delivery:** the same at delivery stops. Ocean, rail and parcel use the carrier's estimated or committed time instead of an appointment: a schedule's arrival, a service's committed day.
- **Early.** Arrival before `lower(appointment)` is on time for most carrier scorecards and a failure for some receivers. A three-valued result (early, on time, late) lets each definition decide.
- **Attribution.** A late arrival caused by the shipper (the load wasn't ready, the previous stop held the truck past its appointment) is excluded from the carrier's score and kept in the shipper's. The 214's reason codes and the dispatcher's notes are the evidence; the exclusion is a row with its reason.
- **No appointment.** A stop with no appointment (a first-come, first-served dock) is measured against the requested window on the shipment or left out of the denominator, never counted as on time by default.

On-time is computed in instants: the appointment range is stored as instants, the grace is a duration, and a facility's time zone matters only for which day a stop belongs to.

```go tab="Go"
type Punctuality string

const (
	Early         Punctuality = "early"
	OnTime        Punctuality = "on_time"
	Late          Punctuality = "late"
	NoAppointment Punctuality = "no_appointment"
	NotArrived    Punctuality = "not_arrived"
)

// Classify judges one stop under a definition's grace. Appointment bounds are
// instants; a nil upper bound means the window is open-ended.
func Classify(apptLower, apptUpper *time.Time, arrivedAt *time.Time, grace time.Duration) Punctuality {
	switch {
	case apptLower == nil && apptUpper == nil:
		return NoAppointment
	case arrivedAt == nil:
		return NotArrived
	case apptLower != nil && arrivedAt.Before(*apptLower):
		return Early
	case apptUpper != nil && arrivedAt.After(apptUpper.Add(grace)):
		return Late
	default:
		return OnTime
	}
}
```

```rust tab="Rust"
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Punctuality { Early, OnTime, Late, NoAppointment, NotArrived }

/// Judge one stop under a definition's grace. Appointment bounds are instants;
/// a missing upper bound means the window is open-ended.
pub fn classify(
    appt_lower: Option<DateTime<Utc>>,
    appt_upper: Option<DateTime<Utc>>,
    arrived_at: Option<DateTime<Utc>>,
    grace: Duration,
) -> Punctuality {
    if appt_lower.is_none() && appt_upper.is_none() {
        return Punctuality::NoAppointment;
    }
    let Some(at) = arrived_at else { return Punctuality::NotArrived };
    if appt_lower.is_some_and(|lo| at < lo) {
        return Punctuality::Early;
    }
    if appt_upper.is_some_and(|hi| at > hi + grace) {
        return Punctuality::Late;
    }
    Punctuality::OnTime
}
```

Whether `Early` counts as on time is the definition's, not the function's. Old Dominion's "99% on-time service" is a carrier's own measure under its own definition; a shipper's scorecard of the same carrier, against its own appointments and grace, will not match it, and shouldn't be expected to.

## Tender Acceptance

`Tender acceptance = tenders accepted / tenders the carrier received and could answer`, per carrier and lane; `first-tender acceptance = loads accepted by the first carrier tendered / loads tendered`, per lane. The denominators are where it goes wrong: skipped routing guide positions never received a tender, withdrawn tenders in a broadcast weren't the carrier's refusal, expired tenders were, auto-accepting channels inflate the rate, and an acceptance followed by a drop is worse than a rejection. [Measuring Acceptance](/books/logistics/tendering#measuring-acceptance) owns those rules and the market's version of the measure; this chapter stores the definition and its versions. The records are `tenders` (status, `dropped_at`, channel) and `tender_events`, and `tender_waterfalls.skips` for the positions that never received one ([Tendering & Acceptance](/books/logistics/tendering#how-to-build-it)).

## Cost and Revenue per Mile

The same name means three things:

- **A carrier's cost per mile:** operating expense over total miles driven, loaded and empty, for a fleet and a period. ATRI's industry average was $2.336 a mile in 2025, $1.854 excluding fuel. Per load, it is the load's allocated costs (driver pay, fuel, equipment at standard rates, trued up) over its total miles, from `load_cost_allocations` in [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics#how-to-build-it).
- **A carrier's revenue per mile:** revenue over loaded miles, or over total miles; the definition says which, and whether fuel surcharge is in. Knight-Swift's $199,897 of revenue per tractor (excluding fuel surcharge) over 83,650 total miles per tractor is about $2.39 per mile driven ([An Asset Carrier Load](/books/logistics/logistics-business#an-asset-carrier-load)).
- **A shipper's or broker's cost per mile:** linehaul (and, if the definition says so, fuel surcharge and accessorials) over loaded miles, from `freight_charges` on the payable side and the load's miles.

Every version needs a mileage source named in the definition. Practical routes, shortest routes, truck-legal routes and versions of the same engine give different miles for the same lane ([Mileage](/books/logistics/rating-and-accessorials#mileage)), and a change of engine moves every cost per mile without moving a dollar. The miles come from `loads.planned_miles` (planned, from the engine the rate used), from the carrier's ELD or settlement (actual), or from the billed quantity on the linehaul line; the definition picks one. Empty miles are a carrier's metric: `empty miles / total miles`, Knight-Swift's 13.9% ([Deadhead](/books/logistics/truckload#deadhead)).

## Operating Ratio

`Operating ratio = operating expenses / operating revenue`, lower is better; what moves it, and why GAAP and adjusted ratios differ, is [Operating Ratio](/books/logistics/logistics-economics#operating-ratio) ([How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics)). For the metric, the definition says GAAP or adjusted and lists the adjustments, and names the grain: the ratio comes from the general ledger, and attribution by terminal, lane, customer or fleet needs revenue and allocated cost on each load, from that chapter's `load_cost_allocations`. A railroad reports the same ratio; an asset-light broker's measure is adjusted gross profit over revenue instead ([A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload)).

## Dwell and Detention

- **Facility dwell,** per stop: `departed_at - arrived_at`. The DOT OIG's estimate that 15 more minutes of average dwell raises the expected crash rate 6.2% is why it is a safety number as well as a cost.
- **Detention,** per stop: `max(0, dwell - free time)`, where free time comes from the agreement ([Detention](/books/logistics/rating-and-accessorials#detention) owns the rules and the charge). The clock may start at the appointment, not the arrival, when the truck arrived early; the definition says which, and it is the same rule the detention charge uses, or the metric and the invoice disagree.
- **Where the times come from.** Gate in and gate out from the yard system, arrival and departure from geofences or the driver's app, check-in and check-out at the dock: each source gives a different dwell for the same visit. The OIG's finding that accurate industrywide detention data don't exist is partly a statement about this choice. My rule: the definition names the source in priority order, and the stop records which evidence set `arrived_at` and `departed_at` (`arrival_basis`, `departure_basis` and the deciding event, from [Arrival and Departure at Facilities](/books/logistics/visibility-and-tracking#arrival-and-departure-at-facilities)); the yard's own gate times are [Detention Evidence](/books/logistics/yard-and-dock#detention-evidence).
- **Rail terminal dwell:** the STB's definition, "the average time a car resides at a specified terminal location expressed in hours," reported weekly for each Class I's system and its 10 largest terminals. A shipper's own measure of a car's dwell at its siding is demurrage's question ([Rail Freight](/books/logistics/rail-freight#how-to-build-it)).
- **Container dwell:** days from discharge to gate out at the terminal, and from gate out to empty return; the first meets demurrage and the second detention, each with its own free time ([Free Time](/books/logistics/detention-and-demurrage#free-time) covers the ocean clocks).

## Inventory Accuracy and Dock-to-Stock

Warehouse metrics read the WMS tables ([Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it) defines `cycle_counts`, `cycle_count_lines` and `warehouse_receipts`; [Cycle Counting](/books/logistics/warehouse-management#cycle-counting) owns how counts are planned and approved):

- **Location accuracy:** `locations counted with no variance / locations counted`, from cycle count lines. A location with the right total but the wrong lot or LPN counts as a variance when the definition is by lot.
- **Unit accuracy:** `1 - sum(|counted - system|) / sum(system)` over the lines counted. Absolute values matter: a +10 and a -10 in two locations are 20 units wrong, not zero.
- **Value accuracy:** the same with `variance_value`, which is what finance's shrink reserve uses.
- **Which counts count.** Planned cycle counts measure accuracy; counts triggered by a short pick or a threshold are biased toward error and are reported separately. A wall-to-wall count is the reference.
- **Dock-to-stock time:** per receipt, from the trailer's check-in to the last unit put away and available, in hours; `warehouse_receipts` carries `checked_in_at` and `closed_at`, and the definition says whether the clock starts at gate in, door assignment or first scan. A 3PL's contract usually sets it as an SLA in hours from arrival, which makes the definition a contract term ([SLAs From the Operator's Side](/books/logistics/contract-logistics#slas-from-the-operator-s-side)).

I have no public benchmark for either to cite here: published warehouse benchmarks exist behind association memberships, and their figures aren't quoted. <!-- source-gap: logistics-metrics-warehouse-benchmarks | missing | industry benchmark values for inventory accuracy and dock-to-stock time | closes with: a publicly readable WERC DC Measures summary or a vendor's published benchmark with method | checked: 2026-11-22 -->

## OEE

Overall equipment effectiveness is the plant's measure of a work center: `OEE = Availability x Performance x Quality`, equivalently `(good count x ideal cycle time) / planned production time`, as Vorne's OEE reference states both forms.

- **Availability** = run time / planned production time; it "takes into account all events that stop planned production long enough." Run time is planned production time less stop time, from machine state events; Vorne counts unplanned stops and planned stops such as changeovers alike as stop time.
- **Performance** = (ideal cycle time x total count) / run time; anything that "causes the manufacturing process to run at less than the maximum possible speed."
- **Quality** = good count / total count; parts "that do not meet quality standards," from production confirmations' good and scrap quantities.

The definition choices are where plants differ: whether changeovers count as availability losses (Vorne's treatment) or are taken out of planned production time, which ideal cycle time is used (the nameplate rate, the best demonstrated rate, or the routing's standard), and whether rework counts as good. [ERP, MES & ISA-95](/books/logistics/manufacturing-systems#how-to-build-it) defines `work_centers` and `equipment_state_events` (with the edge's clock and a sequence for gaps), and [MRP, Scheduling & Work Orders](/books/logistics/production-planning#how-to-build-it) the `production_confirmations`; a gap in the state sequence is unknown time, not running time.

## How to Build It

The deltas extend `metric_definitions` with what a logistics definition needs (its owner, a partner's authorship, unit, direction, grain, sources and exclusions), add frozen values and per-record exclusions, attribute stop delays (the evidence behind each stop time is already on `stops` from [Visibility & Tracking](/books/logistics/visibility-and-tracking#how-to-build-it)), and add the ideal rates OEE divides by:

```sql
ALTER TABLE metric_definitions
  ADD COLUMN owner_party_id   UUID REFERENCES parties (id),  -- null: the platform's standard
  ADD COLUMN authored_by_party_id UUID REFERENCES parties (id),  -- a retailer's own OTIF rule
  ADD COLUMN unit             TEXT,          -- 'ratio', 'hours', 'minor_units_per_mile', 'percent'
  ADD COLUMN better           TEXT,          -- 'higher' or 'lower'
  ADD COLUMN grain            TEXT[] NOT NULL DEFAULT '{}',  -- '{carrier,lane,month}'
  ADD COLUMN event_sources    TEXT[] NOT NULL DEFAULT '{}',  -- priority order: '{yard_gate,geofence,driver_app}'
  ADD COLUMN mileage_engine_ref TEXT,        -- for per-mile metrics
  ADD COLUMN includes_fuel    BOOLEAN,       -- for revenue and cost metrics
  ADD COLUMN grace            INTERVAL,      -- for on-time metrics
  ADD COLUMN early_counts_as  TEXT,          -- 'on_time' or 'failure'
  ADD COLUMN exclusion_rules  JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN published_text_document_id UUID REFERENCES documents (id),  -- a partner's rule as received
  ADD COLUMN final_after      INTERVAL;      -- when a period's value stops changing

ALTER TABLE metric_definitions ADD CONSTRAINT metric_definitions_better_check
  CHECK (better IS NULL OR better IN ('higher', 'lower')) NOT VALID;
ALTER TABLE metric_definitions ADD CONSTRAINT metric_definitions_early_check
  CHECK (early_counts_as IS NULL OR early_counts_as IN ('on_time', 'failure')) NOT VALID;
ALTER TABLE metric_definitions VALIDATE CONSTRAINT metric_definitions_better_check;
ALTER TABLE metric_definitions VALIDATE CONSTRAINT metric_definitions_early_check;

CREATE TABLE metric_values (             -- computed, frozen when reported
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_definition_id UUID NOT NULL REFERENCES metric_definitions (id),  -- the exact version
  owner_party_id       UUID NOT NULL REFERENCES parties (id),
  subject_kind         TEXT NOT NULL CHECK (subject_kind IN ('carrier', 'lane', 'facility',
                         'customer', 'terminal', 'work_center', 'fleet', 'network')),
  subject_id           UUID,             -- the party, facility or work center
  subject_key          TEXT,             -- a lane key such as 'zip3:606>zip3:752'
  period               TSTZRANGE NOT NULL,
  numerator            NUMERIC(20, 4) NOT NULL,
  denominator          NUMERIC(20, 4) NOT NULL,
  value                NUMERIC(20, 6),   -- null when the denominator is zero
  data_through         TIMESTAMPTZ NOT NULL,  -- received_at cutoff of the inputs
  is_final             BOOLEAN NOT NULL DEFAULT FALSE,
  restates_id          UUID REFERENCES metric_values (id),
  reported_document_id UUID REFERENCES documents (id),  -- the scorecard as sent
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (denominator >= 0),
  CHECK ((denominator = 0) = (value IS NULL))
);
CREATE INDEX ON metric_values (metric_definition_id, subject_kind, subject_id, period);

CREATE TABLE metric_exclusions (         -- one record left out of a metric, and why
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_code          TEXT NOT NULL,    -- applies to every version of the metric
  record_kind          TEXT NOT NULL CHECK (record_kind IN ('stop', 'shipment', 'load',
                         'tender', 'receipt', 'cycle_count', 'work_order')),
  record_id            UUID NOT NULL,
  reason               TEXT NOT NULL CHECK (reason IN ('shipper_caused', 'consignee_caused',
                         'weather', 'force_majeure', 'cancelled', 'duplicate', 'data_error',
                         'contract_exempt', 'other')),
  responsible_party_id UUID REFERENCES parties (id),  -- who the miss is attributed to instead
  evidence_document_id UUID REFERENCES documents (id),
  approved_by_ref      TEXT NOT NULL,
  approved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at           TIMESTAMPTZ,
  UNIQUE (metric_code, record_kind, record_id)
);

ALTER TABLE stops                        -- arrival_basis and departure_basis: Visibility & Tracking
  ADD COLUMN delay_reason     TEXT,      -- normalized from the 214 reason or the dispatcher
  ADD COLUMN delay_party_id   UUID;      -- who caused a late arrival, when known
ALTER TABLE stops ADD CONSTRAINT stops_delay_party_fkey
  FOREIGN KEY (delay_party_id) REFERENCES parties (id) NOT VALID;
ALTER TABLE stops VALIDATE CONSTRAINT stops_delay_party_fkey;

ALTER TABLE tenders
  ADD COLUMN counts_for_acceptance BOOLEAN;  -- set at close: false for skips, withdrawals, auto-accepts

CREATE TABLE work_center_rates (         -- the ideal rate OEE divides by, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  work_center_id  UUID NOT NULL REFERENCES work_centers (id),
  item_id         UUID REFERENCES items (id),  -- null: the center's default
  ideal_cycle_seconds NUMERIC(10, 3) NOT NULL CHECK (ideal_cycle_seconds > 0),
  basis           TEXT NOT NULL CHECK (basis IN ('nameplate', 'best_demonstrated',
                    'routing_standard')),
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING gist (work_center_id WITH =,  -- btree_gist; a null item is the default row
    (COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    valid_during WITH &&)
);
```

On-time delivery and transportation OTIF per carrier for a month, from the core tables (the grace and early rule come from the definition version passed in):

```sql
WITH delivery_stops AS (
  SELECT l.carrier_party_id, s.id AS stop_id, ss.shipment_id, s.arrived_at,
         lower(s.appointment) AS appt_from, upper(s.appointment) AS appt_to
  FROM loads l
  JOIN stops s ON s.load_id = l.id AND s.kind IN ('delivery', 'pickup_delivery')
  JOIN stop_shipments ss ON ss.stop_id = s.id AND ss.action = 'drop'
  WHERE l.owner_party_id = $1
    AND l.status IN ('delivered', 'closed')
    AND s.appointment IS NOT NULL
    AND s.arrived_at <@ $2::tstzrange                 -- the period
    AND NOT EXISTS (SELECT 1 FROM metric_exclusions x
                    WHERE x.metric_code = 'otif_transport' AND x.record_kind = 'stop'
                      AND x.record_id = s.id AND x.revoked_at IS NULL)
),
judged AS (
  SELECT d.*,
         (d.arrived_at <= d.appt_to + $3::interval
          AND ($4 = 'on_time' OR d.arrived_at >= d.appt_from)) AS on_time,
         NOT EXISTS (SELECT 1 FROM osd_exceptions o
                     WHERE o.shipment_id = d.shipment_id
                       AND o.observed_at_stage = 'delivery') AS in_full
  FROM delivery_stops d
)
SELECT carrier_party_id,
       count(*) AS shipments,
       count(*) FILTER (WHERE on_time) AS on_time,
       count(*) FILTER (WHERE on_time AND in_full) AS otif,
       round(count(*) FILTER (WHERE on_time AND in_full)::numeric / count(*), 4) AS otif_rate
FROM judged
GROUP BY carrier_party_id;
```

Dwell and detention hours by facility, with the source that set each time, so a dispute about a number starts from its evidence:

```sql
SELECT s.facility_id,
       s.arrival_basis, s.departure_basis,
       count(*) AS visits,
       round(avg(extract(epoch FROM s.departed_at - s.arrived_at)) / 3600, 2) AS avg_dwell_hours,
       round(avg(greatest(0, extract(epoch FROM s.departed_at
             - greatest(s.arrived_at, lower(s.appointment))) / 3600 - $2)), 2)
         AS avg_detention_hours            -- $2: free time in hours, from the agreement
FROM stops s
WHERE s.arrived_at <@ $1::tstzrange AND s.departed_at IS NOT NULL
GROUP BY s.facility_id, s.arrival_basis, s.departure_basis;
```

Location and unit accuracy from planned cycle counts (the WMS tables), and OEE for a work center and a shift:

```sql
SELECT c.facility_id,
       count(DISTINCT c.location_id) AS locations,
       count(DISTINCT c.location_id) FILTER (WHERE NOT EXISTS (
         SELECT 1 FROM cycle_count_lines v
         WHERE v.cycle_count_id = c.id AND v.variance_qty <> 0)) AS exact_locations,
       1 - sum(abs(l.variance_qty)) / nullif(sum(l.system_qty), 0) AS unit_accuracy
FROM cycle_counts c
JOIN cycle_count_lines l ON l.cycle_count_id = c.id
WHERE c.trigger = 'plan' AND c.status = 'approved' AND c.counted_at <@ $1::tstzrange
GROUP BY c.facility_id;

WITH planned AS (                        -- $2: planned production seconds for the shift
  SELECT $2::numeric AS planned_s
),
run AS (                                 -- seconds in 'running', from ordered state events
  SELECT sum(extract(epoch FROM least(next_at, upper($3::tstzrange)) - occurred_at)) AS run_s
  FROM (SELECT state, occurred_at,
               lead(occurred_at) OVER (ORDER BY occurred_at, source_seq) AS next_at
        FROM equipment_state_events
        WHERE work_center_id = $1 AND occurred_at <@ $3::tstzrange) e
  WHERE state = 'running' AND next_at IS NOT NULL
),
counts AS (
  SELECT sum(good_quantity) AS good, sum(good_quantity + scrap_quantity) AS total
  FROM production_confirmations
  WHERE work_center_id = $1 AND occurred_at <@ $3::tstzrange
)
SELECT run.run_s / planned.planned_s AS availability,
       (r.ideal_cycle_seconds * counts.total) / nullif(run.run_s, 0) AS performance,
       counts.good / nullif(counts.total, 0) AS quality,
       (counts.good * r.ideal_cycle_seconds) / planned.planned_s AS oee
FROM planned, run, counts
JOIN work_center_rates r ON r.work_center_id = $1 AND r.item_id IS NULL
                        AND r.valid_during @> lower($3::tstzrange);
```

Design notes:

- **Values point at a version.** `metric_values.metric_definition_id` is the version used, so a scorecard from March and one from June are comparable only when they point at the same version, and a chart across a definition change shows the break ([Unit Metrics](/books/logistics/logistics-economics#unit-metrics) states the same rule).
- **Exclusions are rows, approved.** A shipper-caused miss is excluded per stop with evidence and an approver, never by a filter in a query; a carrier disputing its score sees each exclusion and each miss.
- **Read the evidence behind the time.** `stops.arrival_basis` and `stops.arrived_event_id` (added by [Visibility & Tracking](/books/logistics/visibility-and-tracking#how-to-build-it)) let dwell and on-time be recomputed when a source is later found wrong, and let two definitions with different source priorities coexist.
- **Freeze, then restate.** A reported value is final once its definition's `final_after` passes; a later correction is a new `metric_values` row with `restates_id`, and the scorecard document already sent stays as sent.
- **Partner definitions are imported.** A retailer's OTIF rule is a definition authored by the retailer's party with its published text attached, computed from the retailer's receiving data where available, and shown under the retailer's name.
- **Compute from the analytics copy.** Metrics run on the warehouse fed by change data capture, never against the transactional core at month end ([A Reference Architecture](/books/logistics/logistics-architecture#a-reference-architecture)).

## Auditing

- **Every reported number and how it was made.** The value, its definition version, its numerator and denominator, its data cutoff and the scorecard as sent, so a carrier's or customer's challenge is answered from the same inputs.
- **Every exclusion and attribution.** Which records were left out, why, on whose evidence, approved by whom, and any revocation.
- **Every definition change.** Old and new text, who approved it, and from when; a contract that pays a bonus or charges a penalty on a metric binds the version in force for the period.
- **The times behind service metrics.** Each stop's arrival and departure with the source that set them and the events that were available, which is what a detention invoice and an on-time dispute both rest on.

## What This Means for the System You Build

- **Write every metric down once,** with its event, clock, denominator, exclusions and source priority, and version it.
- **Keep transportation OTIF and retail OTIF separate,** compute each from its own data, and never show one under the other's name.
- **Judge on event time, report latency on received time,** and record which source set every arrival and departure.
- **Store numerators and denominators,** freeze reported values, and restate with new rows.
- **Make exclusions explicit rows** with reasons, evidence and approvers.
- **Name the mileage engine and fuel treatment** on every per-mile metric, and GAAP or adjusted on every operating ratio.
- **Use the regulator's definition where one exists,** as for rail terminal dwell, and the partner's where the partner fines on it.

## References

**Filings**

- [Old Dominion Freight Line: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/878927/000119312526067161/odfl-20251231.htm), operating ratio and its definition, on-time service, cargo claims ratio and revenue per hundredweight
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), operating ratio definition, truckload GAAP and adjusted ratios, empty miles and their definition, revenue per tractor, length of haul and the LTL ratio

**Regulations**

- [49 CFR 1250.1: Railroad performance data reporting](https://www.law.cornell.edu/cfr/text/49/1250.1), the reporting week and the Wednesday deadline
- [49 CFR 1250.2: Railroad performance data elements](https://www.law.cornell.edu/cfr/text/49/1250.2), terminal dwell, train speed and cars online definitions and the weekly elements

**Government and research**

- [DOT Office of Inspector General: ST2018019, commercial driver detention (January 31, 2018)](https://www.oig.dot.gov/library-item/36237), dwell and detention defined, the crash-rate estimate, and the absence of industrywide detention data
- [ATRI: Operational costs of trucking](https://truckingresearch.org/atri-research/operational-costs-of-trucking/), the 2026 update's 2025 cost per mile with and without fuel

**Standards and references**

- [Vorne Industries: Calculating OEE](https://www.oee.com/calculating-oee/), the simple and preferred OEE formulas and the availability, performance and quality factors
