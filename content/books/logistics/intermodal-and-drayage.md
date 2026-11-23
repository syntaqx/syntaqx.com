+++
title = "Intermodal & Drayage"
description = "Containers on rail between ramps and trucks at each end: equipment, chassis pools, intermodal marketing, ramps, port drayage, appointments and per diem."
category = "Logistics & Supply Chain Industry"
order = 2808
part = "Road and Rail"
tags = ["logistics", "intermodal", "drayage", "containers", "chassis", "rail", "ports", "data-model"]
+++

Intermodal freight moves in a box that never opens between origin and destination while the vehicle under it changes: a truck draws the container from a shipper's dock or a marine terminal to a rail ramp, a double-stack train carries it a thousand miles or more, and another truck draws it from the destination ramp to a warehouse. The truck legs are drayage; the long leg is rail; the box is either a 20- or 40-foot ISO container that crossed an ocean or a 53-foot domestic container that never leaves North America. J.B. Hunt's intermodal segment moved 2,138,191 loads in 2025 at an average length of haul of 1,643 miles, and Union Pacific counted 3,357,000 intermodal units in its Premium business the same year, "each intermodal container or trailer" counting as one carload.

It is hard to build for because one move is three or four loads owned by different companies with different clocks. The container belongs to an ocean carrier or an intermodal marketing company; the chassis under it belongs to a pool, a leasing company or the dray carrier; the rail leg is priced by an intermodal company or the railroad; and every hour the box or the chassis sits outside its owner's yard past free time is billed to someone as per diem, detention, demurrage or storage. A dray order that names the wrong terminal, an appointment missed by forty minutes, a chassis returned to the wrong pool or an interchange receipt that doesn't record a damaged door each turns into a charge a month later. This chapter covers the equipment (containers and chassis, and who owns them), the domestic and international intermodal models, ramps and the rail leg, port and rail drayage, terminal appointments and fees, per diem and the interchange agreement behind it, and the records that let a dray carrier, an intermodal company or a shipper defend every line. It extends `loads`, `equipment_units` and `stops` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the rail network itself, carload freight, car hire and rail demurrage are [Rail Freight](/books/logistics/rail-freight), and truckload operations are [Truckload](/books/logistics/truckload).

## How the Carriers Do It

As of November 2026, from 2025 annual reports and the providers' own pages:

| Company | Model | Scale (2025 unless noted) | Rail and equipment | Drayage |
| --- | --- | --- | --- | --- |
| **J.B. Hunt** (Intermodal segment) | Owns containers and chassis, buys the rail leg, sells door to door | $5,975 million revenue; 2,138,191 loads; $2,795 a load; 1,643-mile average haul | "Arrangements with most major North American rail carriers," with most business on BNSF and Norfolk Southern; 124,838 company-owned trailing units, "primarily" 53-foot high-cube containers, and 104,474 chassis | Company tractors draw most loads; "third-party dray carriers are used where economical" |
| **Hub Group** (Intermodal and Transportation Solutions) | Owns containers, buys the rail leg under multi-year contracts | About $4 billion of annual revenue, 57% of it in this segment (2024, its latest 10-K on file) | "Contractual relationships with two railroads"; about 50,000 dry and 900 refrigerated 53-foot containers at December 31, 2024 | About 73% of 2024 drayage on its own fleet (about 2,300 tractors and 500 owner-operators) |
| **Knight-Swift** (Intermodal segment) | Owns containers, buys rail | $364.9 million revenue; operating ratio 102.1%, a loss | 12,539 average containers | 595 average tractors |
| **Union Pacific** (Premium intermodal) | Railroad: sells the rail leg wholesale to intermodal companies and ocean carriers | $4,632 million revenue on 3,357,000 units, $1,380 a unit | Its own ramps, among them Inland Empire, Kansas City and Lathrop | Customers or their draymen |
| **CSX** (Intermodal) | Railroad, east of the Mississippi | $2,073 million on 2,995,000 units, $692 a unit | "About 30" terminals | Customers or their draymen |
| **CPKC** (Intermodal) | Railroad across Canada, the US and Mexico | About 18% of C$14,776 million freight revenue, 54% of it domestic and 46% international | Mexico Midwest Express, "the first truck-competitive, single-line rail option between the U.S. Midwest and Mexico" | Customers or their draymen |

Three patterns:

- **The railroad is wholesale.** Union Pacific, CSX and the other Class I railroads sell the line haul to intermodal marketing companies, asset-owning intermodal carriers and ocean lines; Norfolk Southern describes its intermodal customers as "intermodal marketing companies, international steamship lines, premium customers, and asset-owning companies." The shipper's contract is usually with the intermodal company, which carries the rail cost as purchased transportation.
- **Whoever owns the box owns the clock.** J.B. Hunt and Hub Group own their 53-foot containers, and J.B. Hunt says its containers and chassis "may only be paired together" for productivity; an international box belongs to an ocean carrier, and its free time and per diem come from that carrier's terms.
- **Drayage is where the margin goes.** The rail leg is the cheap mile; the dray at each end is short, slow and exposed to terminal queues and appointments. Knight-Swift's intermodal segment lost money in 2025, and J.B. Hunt and Hub Group both run their own dray fleets for most of their loads.

## Containers and Chassis

A container is identified by its BIC code: three letters for the owner, a category letter ("U for all freight containers," "J for detachable freight container-related equipment," "Z for trailers and chassis"), six digits of serial number at the owner's choosing, and a check digit that validates the rest. The same physical box is a record in the ocean carrier's system, the terminal's, the railroad's, the dray carrier's and the shipper's, and the container number is the only key they share; the core model keeps it as `equipment_units.identifier` and never as a primary key, because containers are reused trip after trip ([Keys Are This System's](/books/logistics/logistics-business#the-core-data-model)).

**International and domestic boxes are different businesses.** An ISO container (20 or 40 feet, often a 40-foot high cube) is owned or leased by an ocean carrier, travels inland from a port on rail or by truck, and must come back empty to a depot the carrier names. A 53-foot domestic container is owned by an intermodal company or a railroad program, never goes to sea, and is repositioned empty inside North America. BNSF's Consumer Products group, which includes "Domestic Intermodal," "International Intermodal" and "Automotive," carried 5,601,000 cars and units in 2025 at an average $1,463, the lowest revenue per unit of its four groups. CPKC's intermodal revenue split 54% domestic, "primarily" manufactured consumer products in 53-foot containers, and 46% international.

**A chassis is separate equipment with its own owner.** Ocean carriers once supplied chassis with their containers; most have exited, and pools now supply them. DCLI says it "pioneered the exit of ocean carriers from the chassis business," runs more than 260,000 chassis at "over 500 locations," and created "the Pool of Pools in LA/LB"; TRAC Intermodal reports "over 175,000 marine chassis" and "eleven pools under management," and announced that it would begin its transition out of the Pool of Pools on June 1, 2026. A pool is a shared fleet that a dray carrier draws from at a terminal or ramp and returns to any location of the same pool, billed per day to the motor carrier, the shipper or the ocean carrier depending on who the pool's contract makes the user. J.B. Hunt owns its chassis outright. For the software, a chassis is an `equipment_units` row with its own owner and pool, its own usage days, and its own bill, independent of the container on it.

**The equipment provider and the trucker share safety duties.** FMCSA's intermodal equipment rules (49 CFR 390 subpart C) require an intermodal equipment provider to mark its equipment with its USDOT number, "systematically inspect, repair, and maintain" it and keep a system of driver vehicle inspection reports, and require a driver accepting the equipment to be satisfied the listed components are "in good working order" and to report known damage, defects or deficiencies when it is returned (49 CFR 390.40 and 390.42). Section 390.40 carries a suspension note tied to FMCSA's registration rules (suspended indefinitely again effective November 18, 2024, per its annotation), so the identification wording in force should be checked before it is relied on; the inspection-report duty in 390.42 is what dray software records.

**The interchange agreement sets the commercial terms.** The Uniform Intermodal Interchange and Facilities Access Agreement (UIIA), published by the Intermodal Association of North America, is "the only standard industry contract that outlines the rules for the interchange of equipment" between intermodal trucking companies and equipment providers such as ocean carriers, railroads and leasing companies; about 13,000 intermodal trucking companies participate, and IANA says 95% of North American equipment interchanges run under it. Its binding arbitration covers invoice disputes over per diem, maintenance and repair, and equipment use or rental charges. An equipment provider's addendum to the UIIA carries its own free time and per diem rates, which is why per diem is data per provider, not a constant.

## Domestic and International Intermodal

A domestic intermodal load is sold like a truckload: a shipper tenders a 53-foot load from a dock in Chicago to a dock in Los Angeles, and the intermodal company quotes a door-to-door rate, dispatches a dray to pick it up, gates it into the origin ramp, books it on a train, and dispatches a dray at the destination ramp. The shipper sees one load and one invoice; the intermodal company sees three loads (dray, rail, dray), two ramp gate events at each end, a train, and the equipment's round trip. J.B. Hunt's MD&A puts "payments to railroads, dray carriers and other third parties" in purchased transportation, and the margin is what's left after both.

An international intermodal move starts at a marine terminal. The ocean carrier, on a through bill of lading, or the importer, on a port-to-door arrangement, books the container onto an inland train at the port's on-dock or near-dock rail yard, or has a dray carrier take it from the terminal to a warehouse near the port, where it may be transloaded into a 53-foot domestic container or trailer for the inland trip. Transloading turns one international box into a domestic shipment and frees the ocean carrier's container early, which is one way importers avoid per diem on a long inland trip.

The rail leg's events arrive from the railroad as X12 322 (Terminal Operations and Intermodal Ramp Activity) messages, 315s from ocean carriers, rail EDI or API calls: gated in, loaded on a train, departed, arrived, available for pickup, gated out. Union Pacific's Action API includes "intermodal terminal reservations," and its Shipment API gives "real-time information on your shipment's location and ETAs"; third parties must hold "an active Letter of Authority with Union Pacific." The "available" event starts a ramp's storage clock, so it's the event the dray dispatcher waits for and the one the system must record with its own occurred and received times.

## Ramps and Rail Legs

A rail ramp (an intermodal terminal or hub) is a facility with a gate, a parking grid, lift equipment and track. Its record carries what any facility carries in the core model, a time zone and an appointment rule ([Facility Versus Address](/books/logistics/logistics-business#the-core-data-model)), plus the cutoff for each train and the free time before storage charges start. BNSF lists about 27 intermodal hubs, CSX "about 30" terminals, and Union Pacific has named its Inland Empire, Kansas City and Lathrop terminals among its 2025 investments. Two clocks run at a ramp:

- **The outbound cutoff.** A box gated in after a train's cutoff waits for the next train, which is the most common reason a domestic intermodal load misses its delivery date. The planner needs the cutoff per ramp, per lane and per day of week as versioned data.
- **The inbound free time.** After the box is available at the destination ramp, the dray carrier has a set number of days to pull it before storage charges start; the railroad or intermodal company sets the number and the rate in its rules publication. Union Pacific's accessorial revenue, $475 million in 2025, includes "intermodal accessorial revenue."

The rail leg itself is a load in the core model with mode `intermodal_rail`, whose carrier is the railroad and whose stops are the two ramps (`stops.kind` of `pickup` and `delivery`, or `interchange` where the box changes railroads). The box rides as `loads.trailer_id`. Load-to-shipment links carry the leg number, dray as 1, rail as 2 and dray as 3 (`load_shipments.leg`), which is how one shipment spans three loads.

## Drayage

Drayage is short-haul trucking of containers and chassis: from a marine terminal to a warehouse or a ramp, from a ramp to a door, or between two terminals in the same city (a cross-town move). It differs from truckload in three ways a TMS has to model:

- **The equipment isn't the carrier's.** The container belongs to an ocean carrier or an intermodal company and the chassis to a pool, so every dray load records which container and which chassis, from which provider, out and back, and the interchange receipt at each gate (an equipment interchange receipt, or EIR) documents its condition. A dray carrier that can't show a clean out-gate EIR pays for the dent.
- **The stops have appointments the carrier doesn't control.** Terminals at the large ports run their own appointment systems. In 2015, terminals at Los Angeles and Long Beach began requiring appointments for import pickups, each through its own system; a dray dispatcher books a window at the terminal, a window at the warehouse and, for the empty return, sometimes a third window at the depot the ocean carrier names. Appointments are held reservations with expiry, the same pattern as any bookable slot ([Exclusion Constraints for Time](/docs/building-blocks/reservations-and-holds#exclusion-constraints-for-time)).
- **The moves pair up.** A dual transaction drops an empty or an export at the terminal and picks up an import in the same visit; a street turn reuses an import's empty container for a nearby export load instead of returning it to the depot, with the ocean carrier's permission. Both save a trip; both mean one container's life spans two shipments and two customers.

**Terminal fees ride on the box.** At Los Angeles and Long Beach, the 12 container terminals collect a Traffic Mitigation Fee through PierPass that funds their extended gate hours; from August 1, 2026 it is $40.63 per TEU and $81.26 for "all other size containers," a 4.77% increase that matched the rise in longshore wage and assessment rates. Empty containers, transshipment cargo, empty chassis and bobtails don't pay it, nor does cargo moving through the Alameda Corridor in a container subject to its fee. The fee must be paid before the terminal releases the container, so it is a gate condition as well as a charge.

**A worked dray.** An importer's 40-foot container is available at a Long Beach terminal on a Monday. A dray carrier pulls it Wednesday on a pool chassis, delivers it to a warehouse in Ontario, California, leaves it for the warehouse to unload (a drop), and returns the empty to the ocean carrier's depot the following Tuesday. The lines, with every rate but the TMF illustrative:

| Line | Side | Payer | Payee | Amount |
| --- | --- | --- | --- | --- |
| Drayage, Long Beach to Ontario and empty return (illustrative) | Receivable | Importer | Dray carrier | $725.00 |
| Traffic Mitigation Fee, one FEU (August 1, 2026 rate) | Receivable | Importer | Terminal operators, through PierPass | $81.26 |
| Fuel surcharge, 28% of linehaul (illustrative) | Receivable | Importer | Dray carrier | $203.00 |
| Chassis, 7 days at $40 (illustrative) | Receivable | Importer | Dray carrier, which pays the pool | $280.00 |
| Chassis, 7 days at $32 (illustrative) | Payable | Dray carrier | Chassis pool | $224.00 |
| Per diem, 7 days out against 4 free at $150 (illustrative) | Receivable | Importer | Ocean carrier | $450.00 |

The chassis appears twice because it is a pass-through with a margin; the per diem doesn't involve the dray carrier's revenue at all, but the dray carrier's gate times prove it. In the core model every line is a `freight_charges` row with its side, kind, source and evidence ([One Rule for All of Them](/books/logistics/logistics-business#one-rule-for-all-of-them)): the dray is `drayage`, the chassis `chassis`, the per diem `per_diem`, and the TMF `terminal_handling` with its own code, not `government_fee`, because the terminal operators levy it, not a government. Had the dray carrier pulled the box early to its own yard to beat terminal demurrage (a pre-pull), a yard storage line and a second dray move would join the table.

## Per Diem, Detention and Storage

Four charges for equipment time sound alike and are owed to different parties for different clocks:

| Charge | Clock starts | Clock stops | Owed to | Set by |
| --- | --- | --- | --- | --- |
| **Demurrage** (ocean) | Free time at the marine terminal ends | Container gates out | Ocean carrier or terminal | The carrier's tariff or service contract ([46 CFR 541](/books/logistics/logistics-business#an-ocean-import)) |
| **Per diem, or detention** (ocean equipment) | Container gates out of the terminal (plus free days) | Empty gates back into the depot | Ocean carrier, which bills the importer or, under the UIIA, the motor carrier | The carrier's terms and its UIIA addendum |
| **Storage** (rail ramp) | Free time after the box is available | Container gates out of the ramp | Railroad or intermodal company | Its rules publication |
| **Chassis usage** | Chassis leaves the pool | Chassis returns to a pool location | Chassis pool or lessor | Pool contract |

Which party pays per diem is the hard question. The ocean carrier's contract is with the shipper or importer on the bill of lading, but under the UIIA the motor carrier that took the equipment is the party in interchange and is billed for equipment use, and passes the charge to its customer if its own contract lets it. A dray carrier therefore needs the in-gate and out-gate times of every container it touched, the provider's free time and rate that applied that day, and the reason for each late day (no appointment available at the depot, a warehouse that didn't unload, a terminal closure), because the UIIA's dispute process and the FMC's rules on ocean detention and demurrage billing both turn on those facts. Detention & Demurrage, later in this volume, owns the FMC billing rule, OSRA 2022 and the disputes; this chapter owns the gate events that feed them.

The free-time count is a computation over interchange events, contract terms and a calendar, and it runs every night for every box out:

```go tab="Go"
// PerDiemDays returns the chargeable days for one container interchange.
// Terms come from the equipment provider's addendum in force at out-gate.
type PerDiemTerms struct {
	FreeDays         int  // e.g. 4
	CountWeekends    bool // some providers count calendar days, some skip weekends
	CountHolidays    bool
	DayEndsLocalHour int  // a "day" boundary in the facility's time zone, often midnight
}

func PerDiemDays(outGate, inGate time.Time, loc *time.Location, t PerDiemTerms,
	holidays map[string]bool) int {
	start := outGate.In(loc)
	end := inGate.In(loc)
	days := 0
	for d := dayStart(start, t.DayEndsLocalHour); d.Before(end); d = d.AddDate(0, 0, 1) {
		wd := d.Weekday()
		if !t.CountWeekends && (wd == time.Saturday || wd == time.Sunday) {
			continue
		}
		if !t.CountHolidays && holidays[d.Format("2006-01-02")] {
			continue
		}
		days++
	}
	if days <= t.FreeDays {
		return 0
	}
	return days - t.FreeDays
}

func dayStart(t time.Time, hour int) time.Time {
	d := time.Date(t.Year(), t.Month(), t.Day(), hour, 0, 0, 0, t.Location())
	if t.Before(d) {
		d = d.AddDate(0, 0, -1)
	}
	return d
}
```

```rust tab="Rust"
use chrono::{DateTime, Datelike, Duration, NaiveDate, TimeZone, Utc, Weekday};
use chrono_tz::Tz;
use std::collections::HashSet;

/// Terms from the equipment provider's addendum in force at out-gate.
pub struct PerDiemTerms {
    pub free_days: i64,
    pub count_weekends: bool,
    pub count_holidays: bool,
    pub day_ends_local_hour: u32,
}

/// Chargeable per diem days for one container interchange.
pub fn per_diem_days(out_gate: DateTime<Utc>, in_gate: DateTime<Utc>, tz: Tz,
                     t: &PerDiemTerms, holidays: &HashSet<NaiveDate>) -> i64 {
    let start = out_gate.with_timezone(&tz);
    let end = in_gate.with_timezone(&tz);
    let mut d = tz
        .with_ymd_and_hms(start.year(), start.month(), start.day(), t.day_ends_local_hour, 0, 0)
        .single()
        .expect("unambiguous local time");
    if start < d {
        d = d - Duration::days(1);
    }
    let mut days = 0;
    while d < end {
        let weekend = matches!(d.weekday(), Weekday::Sat | Weekday::Sun);
        let holiday = holidays.contains(&d.date_naive());
        if (t.count_weekends || !weekend) && (t.count_holidays || !holiday) {
            days += 1;
        }
        d = d + Duration::days(1);
    }
    (days - t.free_days).max(0)
}
```

The function is deliberately dumb: every term is an input from the provider's addendum, versioned with an effective date ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), and the gate times are the ones the interchange receipts proved, in the facility's time zone. The answer is stored with the terms and events that produced it, so a disputed invoice can be recomputed and compared ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

## Accruing the Rail and Dray Cost

An intermodal company bills its customer when the box is delivered and receives the railroad's and the dray carriers' invoices later, so its purchased transportation for the month is an accrual: the estimated payable lines for every load moved, trued up when the real invoices arrive ([Month-End Close](/docs/money/accounting#month-end-close)). Getting the accrual wrong is material. Hub Group reported on February 5, 2026 that it had "identified an error that resulted in the understatement of purchased transportation costs and accounts payable in the first nine months of 2025," said its first three 2025 quarterly reports "should no longer be relied upon," filed a late-filing notice for its 2025 10-K on March 3, 2026, and had not filed that 10-K on EDGAR as of November 22, 2026. The filings don't say how the error arose. The defense is the one the core model already gives: a payable line per load per vendor, created estimated at tender, accrued at pickup, matched to the vendor's invoice line by line, and an aging of accrued lines with no invoice ([Charges Are Estimated, Then Accrued, Then Billed](/books/logistics/logistics-business#the-core-data-model)).

## How to Build It

The core model already holds the pieces: a container, a chassis and a tractor are `equipment_units`; a dray and a rail leg are `loads` linked to the same shipment by `load_shipments.leg`; terminals, ramps and depots are `facilities` of kinds `port_terminal`, `rail_ramp` and `container_yard`. Intermodal adds the equipment's ownership and pool, the interchange receipts, the terminal appointments, the chassis usage and the free-time terms. All `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE equipment_units
  ADD COLUMN size_type_code   TEXT,     -- ISO 6346 size and type, e.g. '45G1'; null for non-containers
  ADD COLUMN service          TEXT,     -- 'international' (ocean) or 'domestic' (53-foot programs)
  ADD COLUMN provider_party_id UUID REFERENCES parties (id),  -- who interchanges it to truckers
  ADD COLUMN pool_code        TEXT,     -- the chassis pool it belongs to, as the pool names it
  ADD COLUMN usdot_marked     BOOLEAN;  -- intermodal equipment provider's USDOT marking seen
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_service_check
  CHECK (service IS NULL OR service IN ('international', 'domestic')) NOT VALID;
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_provider_check
  CHECK (kind NOT IN ('container', 'chassis') OR provider_party_id IS NOT NULL) NOT VALID;

ALTER TABLE loads
  ADD COLUMN chassis_id   UUID REFERENCES equipment_units (id),  -- the chassis under the box
  ADD COLUMN train_ref    TEXT,           -- the railroad's train symbol, for the rail leg
  ADD COLUMN rail_cutoff  TIMESTAMPTZ;    -- the gate cutoff for that train at origin

ALTER TABLE stops
  ADD COLUMN terminal_appointment_id UUID,  -- set when the facility's own system issued it
  ADD COLUMN free_time_ends_at       TIMESTAMPTZ;  -- storage or demurrage starts after this

CREATE TABLE equipment_interchanges (    -- one EIR: equipment handed to or from a trucker
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id        UUID NOT NULL REFERENCES equipment_units (id),
  facility_id         UUID NOT NULL REFERENCES facilities (id),
  direction           TEXT NOT NULL CHECK (direction IN ('out_gate', 'in_gate')),
  motor_carrier_id    UUID NOT NULL REFERENCES parties (id),  -- party in interchange
  provider_party_id   UUID NOT NULL REFERENCES parties (id),  -- the equipment provider
  load_id             UUID REFERENCES loads (id),
  driver_id           UUID REFERENCES drivers (id),
  paired_equipment_id UUID REFERENCES equipment_units (id),   -- the chassis with the box
  loaded              BOOLEAN NOT NULL,
  seal_number         TEXT,
  condition           JSONB NOT NULL DEFAULT '[]',  -- damage codes and locations as recorded
  occurred_at         TIMESTAMPTZ NOT NULL, -- gate time per the receipt
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_id         UUID REFERENCES documents (id),  -- the EIR as issued
  UNIQUE (equipment_id, facility_id, direction, occurred_at)
);

CREATE TABLE terminal_appointments (     -- a slot booked in a terminal's or ramp's own system
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id       UUID NOT NULL REFERENCES facilities (id),
  motor_carrier_id  UUID NOT NULL REFERENCES parties (id),
  purpose           TEXT NOT NULL CHECK (purpose IN ('import_pickup', 'export_drop',
                      'empty_return', 'empty_pickup', 'dual')),
  container_number  TEXT,                -- as booked; may differ from what shows up
  slot_window       TSTZRANGE NOT NULL,  -- displayed in the facility's time zone
  external_ref      TEXT NOT NULL,       -- the terminal system's confirmation number
  status            TEXT NOT NULL CHECK (status IN ('booked', 'used', 'missed', 'cancelled')),
  booked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_id, external_ref)
);

CREATE TABLE chassis_usages (            -- one chassis out of its pool and back
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  chassis_id       UUID NOT NULL REFERENCES equipment_units (id),
  pool_party_id    UUID NOT NULL REFERENCES parties (id),
  user_party_id    UUID NOT NULL REFERENCES parties (id),  -- billed per the pool contract
  out_interchange  UUID NOT NULL REFERENCES equipment_interchanges (id),
  in_interchange   UUID REFERENCES equipment_interchanges (id),
  days_billed      INT,                   -- per the pool's invoice
  days_computed    INT,                   -- from the interchanges, for audit
  freight_charge_id UUID REFERENCES freight_charges (id)
);

CREATE TABLE equipment_free_time_terms ( -- a provider's free time and per diem, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_party_id  UUID NOT NULL REFERENCES parties (id),
  applies_to         TEXT NOT NULL CHECK (applies_to IN ('per_diem', 'ramp_storage',
                       'terminal_demurrage', 'chassis')),
  equipment_type     TEXT,               -- null: every type
  free_days          SMALLINT NOT NULL CHECK (free_days >= 0),
  count_weekends     BOOLEAN NOT NULL,
  count_holidays     BOOLEAN NOT NULL,
  tiers              JSONB NOT NULL,     -- [{"from_day": 1, "to_day": 4, "rate": 15000}, ...]
  currency           CHAR(3) NOT NULL,
  valid_during       TSTZRANGE NOT NULL,
  document_id        UUID REFERENCES documents (id),  -- the UIIA addendum or rules page
  EXCLUDE USING gist (provider_party_id WITH =, applies_to WITH =,
                      COALESCE(equipment_type, '') WITH =, valid_during WITH &&)
);

CREATE INDEX CONCURRENTLY equipment_interchanges_equipment_idx
  ON equipment_interchanges (equipment_id, occurred_at);
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_service_check;
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_provider_check;
```

The question every dray dispatcher asks each morning, which boxes are out and how close they are to per diem, reads off the interchanges:

```sql
SELECT e.identifier, p.display_name AS provider, o.occurred_at AS out_gate,
       t.free_days, NOW() - o.occurred_at AS out_for
FROM equipment_interchanges o
JOIN equipment_units e ON e.id = o.equipment_id
JOIN parties p ON p.id = o.provider_party_id
JOIN equipment_free_time_terms t
  ON t.provider_party_id = o.provider_party_id AND t.applies_to = 'per_diem'
 AND t.valid_during @> o.occurred_at
WHERE o.direction = 'out_gate'
  AND o.motor_carrier_id = $1
  AND e.kind = 'container'
  AND NOT EXISTS (
    SELECT 1 FROM equipment_interchanges i
    WHERE i.equipment_id = o.equipment_id AND i.direction = 'in_gate'
      AND i.occurred_at > o.occurred_at)
ORDER BY o.occurred_at;
```

Design notes:

- **Interchanges are the evidence.** Per diem, chassis days, damage and ramp storage are all computed from out-gate and in-gate receipts, so each receipt is kept as issued (`documents`) with its parsed copy, never edited, and a corrected receipt is a new row.
- **The box and the chassis are two clocks.** A container and its chassis go out together and often come back separately (the chassis to a pool location, the empty box to a depot), so their usage is computed independently.
- **Terms are versioned per provider.** Free time, per diem tiers and whether weekends count differ by ocean carrier, ramp and pool and change during a year; the computation uses the terms in force at out-gate, and stores which row it used.
- **Appointments are reservations.** A terminal appointment has an external reference, a window in the terminal's time zone and an outcome (used, missed, cancelled); a missed one is evidence in a per diem dispute when no other slot was available.
- **Legs are loads.** A dray, a rail leg and a dray are three loads with their own carriers, charges and events; the shipment's status rolls up from all three, and a missed rail cutoff is an exception on the shipment as well as on the rail load.
- **Emit the gate events.** `equipment.out_gated`, `equipment.in_gated`, `container.available`, `appointment.missed` and `free_time.expiring` are what billing, customer notifications and the dispatcher's board subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every interchange receipt**, as issued and as parsed, with gate time, condition, seal and the party in interchange, for per diem, chassis and damage disputes.
- **Every appointment**, booked, used, missed or cancelled, with the terminal's confirmation number and what other windows were offered.
- **The terms in force** for every computed day of per diem, storage or chassis use, and the computation's inputs and result next to the vendor's billed figure.
- **Every pass-through charge** on both sides (chassis, terminal fees, per diem rebilled to a customer) with the vendor invoice that proves it.
- **Accruals.** Every estimated and accrued payable line for rail and dray cost, its age, and the invoice that settled it; an unbilled accrual older than the vendor's normal billing lag is a finding.

## What This Means for the System You Build

- **Model each leg as its own load,** linked to one shipment by leg number, with the railroad as carrier on the rail leg.
- **Treat containers and chassis as separate equipment** with their own owners, providers, pools and clocks.
- **Keep every interchange receipt as evidence,** and compute per diem, chassis days and storage from gate events, never from a dispatcher's typing.
- **Store free time and per diem terms per provider as versioned data,** and record which terms priced each day.
- **Book terminal appointments as reservations** with the terminal's own reference and an outcome.
- **Record train cutoffs and ramp availability** as first-class events; they decide on-time delivery and storage.
- **Pass terminal fees and chassis through as lines on both sides,** never folded into the dray rate.
- **Accrue rail and dray cost per load per vendor** and age the accruals until the invoices arrive.

## References

**Filings**

- [J.B. Hunt Transport Services: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/728535/000143774926005294/jbht20251231_10k.htm), JBI revenue, loads, revenue per load, length of haul, containers and chassis, rail partners, dray practice and purchased transportation
- [Hub Group: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/940942/000095017025026866/hubg-20241231.htm), revenue and segment share, two rail contracts, container fleet and drayage share on its own fleet
- [Hub Group: Form 8-K, Item 4.02 (February 5, 2026)](https://www.sec.gov/Archives/edgar/data/940942/000119312526039396/d77454d8k.htm), the understatement of purchased transportation costs and non-reliance on three 2025 quarters
- [Hub Group: EDGAR filing index](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000940942&type=&dateb=&owner=include&count=40), the NT 10-K of March 3, 2026 and no 2025 10-K on file as of November 22, 2026
- [Knight-Swift Transportation: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1492691/000149269126000016/knx-20251231.htm), Intermodal segment revenue, operating ratio, containers and tractors
- [Union Pacific: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/100885/000010088526000037/unp-20251231.htm), intermodal revenue, units and revenue per unit, the container-as-carload convention, terminal investments and accessorial revenue
- [CSX: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/277948/000027794826000006/csx-20251231.htm), intermodal revenue, units, revenue per unit and terminals
- [Norfolk Southern: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/702165/000162828026006268/nsc-20251231.htm), intermodal customers by type
- [Burlington Northern Santa Fe: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/934612/000093461226000004/bni-20251231.htm), Consumer Products business units, volume and revenue per unit, and intermodal hubs
- [Canadian Pacific Kansas City: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/16875/000001687526000008/cp-20251231.htm), intermodal share of freight revenue, domestic and international split, and Mexico Midwest Express

**Regulations**

- [49 CFR 390.40: Intermodal equipment provider responsibilities](https://www.law.cornell.edu/cfr/text/49/390.40), USDOT marking, systematic inspection, inspection reports, and the suspension annotation
- [49 CFR 390.42: Motor carrier responsibilities for intermodal equipment](https://www.law.cornell.edu/cfr/text/49/390.42), the driver's inspection on acceptance and the report of damage on return

**Industry**

- [IANA: UIIA](https://intermodal.org/uiia/), the standard interchange contract, participating trucking companies, share of interchanges and arbitration of per diem disputes
- [PierPass: TMF increase effective August 1, 2026](https://www.pierpass.org/?p=4416), the per-TEU and per-container fee, its basis in longshore wage rates, and exemptions
- [PierPass](https://www.pierpass.org/), the TMF and the 12 terminals at Los Angeles and Long Beach
- [FreightWaves: Los Angeles/Long Beach container terminals adopt appointment system (August 27, 2015)](https://www.freightwaves.com/news/los-angeles-long-beach-container-terminals-adopt-appointment-system-for-drayage-drivers), terminal appointments required for imports and run per terminal
- [Union Pacific: API developer resources](https://www.up.com/shipping/resources/api-developer), the Shipment and Action APIs, intermodal terminal reservations and the Letter of Authority

**Equipment providers and standards**

- [BIC: Check digit calculator](https://www.bic-code.org/check-digit-calculator/), owner code, equipment category identifiers, serial number and check digit
- [DCLI](https://www.dcli.com/), chassis fleet and locations, ocean carriers' exit from chassis, its pools and the Pool of Pools
- [TRAC Intermodal](https://www.tracintermodal.com/), marine chassis fleet, pools under management and its transition out of the Pool of Pools from June 1, 2026
- [X12: Transaction sets](https://x12.org/products/transaction-sets), the 322 Terminal Operations and Intermodal Ramp Activity and 315 titles
