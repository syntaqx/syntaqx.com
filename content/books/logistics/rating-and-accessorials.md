+++
title = "Rating, Tariffs & Accessorials"
nav_title = "Rating & Accessorials"
description = "Pricing a load: contract and spot rates, lane rate tables, mileage engines, fuel surcharges on the EIA diesel index, accessorials and detention."
category = "Logistics & Supply Chain Industry"
order = 2829
part = "Planning and Execution"
tags = ["logistics", "rating", "fuel-surcharge", "accessorials", "detention", "truckload", "data-model"]
+++

Rating is the step that turns a planned movement into money: given a shipment or a load, its lane, its equipment, its date and the agreements in force, produce the priced lines the customer will owe and the carrier will be paid. A truckload rate is usually a flat amount or a rate per mile on a lane, plus a fuel surcharge read off a table keyed to the government's weekly diesel price, plus accessorials for everything the base rate doesn't cover: waiting past free time, an extra stop, a truck ordered and then cancelled, a lumper at the receiving dock. An LTL rate is a discounted base tariff by class or density and weight, with its own fuel percentage and rules tariff; [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification) owns that mechanism, and this chapter links to it rather than repeating it.

It is hard because the price of one load is assembled from several documents with different owners and different clocks. The lane rate comes from a contract awarded months earlier or a spot quote taken an hour ago; the miles come from a commercial mileage engine and a specific version of it; the fuel surcharge comes from a schedule in the agreement applied to an index value the U.S. Energy Information Administration publishes on Tuesdays, under a rule about which week's price governs which pickup; the accessorials come from a schedule that says what triggers each one, how it is measured and what evidence the carrier must show. Each input changes over time, so rating is only reproducible if every input is stored with the version that was used. A carrier invoice that disagrees with the shipper's rating by $31.20 is usually one of these inputs disagreeing, and finding which one is the whole of freight audit.

This chapter covers contract and spot rates, lane rate tables and how a lane is matched, mileage, fuel surcharges (per mile and percentage, weekly and monthly), accessorials and detention, and the rating engine that applies them in order. It extends `rate_agreements`, `lane_rates` and `freight_charges` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), whose [brokered truckload](/books/logistics/logistics-business#a-brokered-truckload) already priced one load through a fuel schedule and two hours of detention. Where the rates come from is [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides); offering the priced load to a carrier is [Tendering & Acceptance](/books/logistics/tendering).

## How the Platforms Do It

Most shippers' and brokers' rate schedules are contracts and not public. What is public, as of November 2026, are carriers' and government shippers' published schedules and the vendor documentation of the tools that apply them:

| Source | What it prices | Fuel | Accessorials, as published |
| --- | --- | --- | --- |
| **EIA** (U.S. Energy Information Administration) | The index, not a rate: the weekly U.S. on-highway diesel average, "prices include all taxes" | $5.937 a gallon for the week of November 16, 2026, down $0.190, released November 17; regional series for the East Coast and its three subregions, the Midwest, Gulf Coast, Rocky Mountain and West Coast regions, the West Coast less California, and California ($7.733) | Not applicable |
| **Estes Express Lines** | LTL and truckload | Percentage of linehaul off the DOE national average, "updated every Tuesday," with adjustments taking "effect the following Wednesday"; 2-cent steps, 0.1% a step below 361 cents a gallon and 0.2% above | In its rules tariff |
| **J.B. Hunt** (Carrier 360 standard accessorials, as paid to carriers, published December 11, 2020) | Brokered truckload, the buy side | Not stated on the page | Detention after 2 hours from the arrival check call, in 15-minute increments, $50 an hour with automated updates or $40 if recorded manually, up to 5 hours; then layover at $250 a day ($150 manual); truck ordered not used $200 ($150 without location services); stop-off "$50 + Out of Route miles"; driver assist $50 a stop |
| **Union Pacific** (carload, mileage-based HDF surcharge) | Rail carload, priced per mile | $0.05 a mile when the monthly average on-highway diesel price "equals or exceeds $2.30 per gallon," plus $0.01 for each $0.05 above; applied in the second month after the month averaged (84 cents a mile for December 2026, from October's $6.252) | Not on the page |
| **Military Surface Deployment and Distribution Command** (TR-12 policy) | Government freight: truckload freight all kinds (FAK) and protective service (TPS), and LTL | From June 10, 2019, a mileage-based fuel related rate adjustment for FAK and TPS truckload, with the baseline kept at $2.50; LTL keeps the percentage of line-haul formula, whose "increment factor will increase from $.10 to $.13" | In its rules publications |
| **Trimble PC\*Miler** | The miles, not the rate | Not applicable | Not applicable; "practical, shortest or fastest routing," used for "freight billing, driver pay and auditing" |
| **TForce Freight, XPO, FedEx Freight** (LTL rules tariffs) | LTL | Percentage of discounted linehaul | Per item in the rules tariff; compared in [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification#accessorials) |

Four patterns:

- **Fuel is indexed to one public series, but every schedule reads it differently.** Estes and TForce use the weekly national average with a Wednesday effective date; Union Pacific averages a month and applies it two months later; the government's truckload policy, like many truckload schedules, converts it to cents per mile. The index is shared; the base price, step, increment, averaging and lag are contract terms, and each one changes the number.
- **Accessorials are rules with triggers, units and evidence, not a fee list.** J.B. Hunt's detention starts two hours after an arrival check call, accrues in 15-minute increments, caps at five hours and turns into layover; the rate depends on whether the time was recorded automatically. A schedule stored as a list of fees can't price it.
- **Miles are a product with versions.** PC\*Miler sells routing types, and its vendor calls it "the recognized legal standard for the majority of North American freight contracts" (a marketing claim, but contracts do name a mileage engine and version). A per-mile rate is meaningless without the engine, version and routing type that produced the miles.
- **Buy-side and sell-side schedules differ on the same load.** A broker bills the shipper detention under the shipper's schedule and pays the carrier under its own, as J.B. Hunt's carrier-facing rules show; the same stop produces two lines with different free times and rates ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)).

## Contract and Spot Rates

A **contract rate** is a lane rate inside an agreement with a validity period, usually awarded in a bid; DAT puts contract freight at "between 80 and 90 percent, on average" of freight transactions, and notes that freight contracts are "usually binding only in price," not on volume or capacity. A **spot rate** is a price for one load, quoted within days or hours of shipping. In the core model both are `rate_agreements` rows: a contract with many `lane_rates`, or a `spot_quote` or `rate_confirmation` with one lane and a validity measured in hours. Keeping them in the same shape is what lets a rating engine price a load the same way whichever one applies, and lets a margin report compare a load covered at contract with one covered on the spot market.

Three rate bases cover almost every truckload lane:

- **Flat per load.** One amount for the lane, common for short hauls and dedicated shuttles, where miles matter less than time at the docks.
- **Per mile.** A rate times the lane's miles from the agreed engine. Two loads on the same zip-to-zip lane get the same miles only if the engine and version are fixed in the agreement.
- **With a minimum.** A per-mile rate with a minimum charge per load, so a short load on a long-haul rate isn't priced below the cost of dispatching a truck.

Spot quotes add an expiry. A broker's quote to a shipper and a carrier's quote to a broker are both offers good until a time, and the rating engine must refuse an expired quote rather than silently reprice; the tender that uses it carries the quote's identifier, and the rate confirmation that follows becomes the buy-side agreement for that load.

## Lane Rate Tables

A lane is an origin key and a destination key at a granularity: a facility, a five-digit postal code, a three-digit postal prefix, a state, a region or a market area. The core `lane_rates.origin` and `destination` are text keys (`zip3:606`, `state:US-IL`, `facility:<id>`), so one agreement can mix granularities, and a shipment from a Chicago dock to Atlanta may match a facility-to-zip3 row, a zip3-to-zip3 row and a state-to-state row at once.

My rule: the most specific match wins, and the order is data. A rating engine ranks candidate rows by origin specificity, then destination specificity, then equipment match (an exact equipment type beats a null), then the agreement's own priority, and records which row won and why. Two rows of equal specificity on one agreement are a data error caught when the agreement is loaded, not resolved at rating time ([When Rules Overlap](/docs/building-blocks/rules-as-data#when-rules-overlap)). Every match is evaluated as of the pickup date, not the rating date: a re-rate in March of a load that picked up in January uses January's rows ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).

Agreements also differ by side. A shipper's TMS holds payable agreements with its carriers; a broker's TMS holds receivable agreements with shippers and payable agreements (and rate confirmations) with carriers; an asset carrier holds receivable agreements with its customers. `rate_agreements.side` carries this, and the same lane can have a receivable and a payable rate in one tenant's tables.

## Mileage

Per-mile rates, per-mile fuel surcharges, out-of-route stop-off miles and driver pay all need miles, and miles aren't a fact about the world: they are the output of a routing engine run with a routing type (practical, shortest, fastest), a set of truck restrictions, a version of the road network, and a rule for what point represents a postal code. Trimble describes PC\*Miler as used for "freight billing, driver pay and auditing" and for "fuel tax reporting requirements"; Rand McNally's MileMaker is the other engine commonly named in freight contracts (its site refused automated fetches, so I state that only from the contracts' practice). <!-- source-gap: logistics-rating-milemaker | missing | MileMaker as a contract mileage standard | closes with: Rand McNally's MileMaker product page or a published tariff naming it | checked: 2026-11-22 -->

The agreement names the engine, version and routing type; the rating engine looks miles up and stores the answer with those three facts. Driven miles from an ELD differ from contract miles, and both are legitimate for different purposes: billing uses contract miles, fuel tax and maintenance use driven miles, and [Truckload](/books/logistics/truckload#deadhead) keeps the loaded and empty miles a load actually ran. A rate dispute over miles is settled by rerunning the named engine and version, so the version is kept, not just the number.

## Fuel Surcharges

A fuel surcharge moves the fuel component of a rate with the price of diesel, so that neither side has to renegotiate every time the price moves. Every published schedule has the same five parts:

1. **The index.** Almost always the EIA's weekly U.S. on-highway diesel average, which "include[s] all taxes"; some agreements use a regional series instead (West Coast diesel was $6.948 for the week of November 16, 2026, against the national $5.937).
2. **The averaging and lag.** Which index value applies to which pickup: the latest weekly value effective from the following Wednesday (Estes, and TForce as [Base Rates, Weight Breaks and Discounts](/books/logistics/freight-classification#base-rates-weight-breaks-and-discounts) shows), or a calendar month's average applied two months later (Union Pacific). In November 2026 the EIA released its weekly data on Tuesdays, so a rule written as "Monday's price" means the value dated Monday and published the next day.
3. **The base or strike price.** The price at which the surcharge is zero or starts: $1.25 in the illustrative schedule of [A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload), $2.30 at Union Pacific, $2.50 in the government's TR-12 policy, 361 cents as the break between Estes' two step rates.
4. **The step.** The price interval that moves the surcharge one notch: six cents a gallon (illustrative), five cents (Union Pacific), two cents (Estes).
5. **The increment and its unit.** Cents per mile (one cent per step in the illustrative schedule and at Union Pacific) or a percentage of linehaul (0.1% or 0.2% per two-cent step at Estes).

The arithmetic for a per-mile schedule is the number of whole steps above the base times the increment, plus any starting amount. Worked for the week of November 16, 2026:

| Schedule | Price used | Steps | Rate | On 800 miles |
| --- | --- | --- | --- | --- |
| Illustrative: base $1.25, one cent a mile per $0.06 | $5.937 | ⌊(5.937 − 1.25) ÷ 0.06⌋ = 78 | $0.78 a mile | $624.00 |
| Union Pacific: $0.05 at $2.30, one cent per $0.05 | October average $6.252 | ⌊(6.252 − 2.30) ÷ 0.05⌋ = 79 | $0.05 + $0.79 = $0.84 a mile (Union Pacific's own table shows 84 cents) | $672.00 |

Two details decide whether a computed surcharge matches the carrier's. **Steps are floored**: 78.1 steps is 78, and a schedule that rounds to the nearest step instead bills one more increment in every week the price lands in the upper half of a step. **The price is compared in its published precision**, three decimals of a dollar, so the code works in integer thousandths and never in floating point ([Integer Minor Units](/docs/money/amounts#integer-minor-units)). A percentage schedule applies the same steps to a percentage and multiplies the linehaul (for LTL, the discounted linehaul, which is why a deeper discount also lowers the fuel charge; [Base Rates, Weight Breaks and Discounts](/books/logistics/freight-classification#base-rates-weight-breaks-and-discounts) works one through). Published schedules are sometimes tables of rows rather than formulas; those rows are loaded as data and the formula is used only to check them.

The calculation, with the index value chosen by the schedule's lag rule and every amount in integers:

```go tab="Go"
// FuelSchedule is one agreement's per-mile or percentage schedule.
// Prices are in thousandths of a currency unit per gallon ($5.937 = 5937).
type FuelSchedule struct {
	BaseMilli     int64 // price at which the surcharge starts
	StepMilli     int64 // price interval per step
	StartAmount   int64 // per-mile minor units at the base (UP: 5 cents); 0 if none
	IncrementCPM  int64 // per-mile schedules: minor units per mile per step
	StartPctBP    int64 // percentage schedules: basis points at the base
	IncrementBP   int64 // percentage schedules: basis points per step
	PerMile       bool
}

// Steps floors the number of whole steps at or above the base; below it, no surcharge.
func (s FuelSchedule) Steps(priceMilli int64) (int64, bool) {
	if priceMilli < s.BaseMilli {
		return 0, false
	}
	return (priceMilli - s.BaseMilli) / s.StepMilli, true
}

// Surcharge returns the charge in minor units for a load: per mile on miles
// (tenths of a mile, as rated), or a percentage of linehaul.
func (s FuelSchedule) Surcharge(priceMilli, milesTenths, linehaulMinor int64) int64 {
	steps, ok := s.Steps(priceMilli)
	if !ok {
		return 0
	}
	if s.PerMile {
		cpm := s.StartAmount + steps*s.IncrementCPM
		return roundHalfUp(cpm*milesTenths, 10)
	}
	bp := s.StartPctBP + steps*s.IncrementBP
	return roundHalfUp(linehaulMinor*bp, 10_000)
}

func roundHalfUp(n, d int64) int64 { return (n + d/2) / d } // n >= 0
```

```rust tab="Rust"
/// One agreement's per-mile or percentage schedule.
/// Prices are thousandths of a currency unit per gallon ($5.937 = 5937).
pub struct FuelSchedule {
    pub base_milli: i64,
    pub step_milli: i64,
    pub start_amount: i64,  // per-mile minor units at the base; 0 if none
    pub increment_cpm: i64, // per-mile: minor units per mile per step
    pub start_pct_bp: i64,  // percentage: basis points at the base
    pub increment_bp: i64,  // percentage: basis points per step
    pub per_mile: bool,
}

impl FuelSchedule {
    /// Whole steps at or above the base; None below it.
    pub fn steps(&self, price_milli: i64) -> Option<i64> {
        (price_milli >= self.base_milli)
            .then(|| (price_milli - self.base_milli) / self.step_milli)
    }

    /// Charge in minor units: per mile on tenths of a mile, or a share of linehaul.
    pub fn surcharge(&self, price_milli: i64, miles_tenths: i64, linehaul_minor: i64) -> i64 {
        let Some(steps) = self.steps(price_milli) else { return 0 };
        if self.per_mile {
            let cpm = self.start_amount + steps * self.increment_cpm;
            round_half_up(cpm * miles_tenths, 10)
        } else {
            let bp = self.start_pct_bp + steps * self.increment_bp;
            round_half_up(linehaul_minor * bp, 10_000)
        }
    }
}

fn round_half_up(n: i64, d: i64) -> i64 { (n + d / 2) / d } // n >= 0
```

With the illustrative schedule (`BaseMilli` 1250, `StepMilli` 60, `IncrementCPM` 1) and 8,000 tenths of a mile, a price of 5937 gives 78 steps and 62,400 minor units, the $624.00 on the brokered truckload. The price passed in is the one the lag rule selected for the pickup date, and the charge row stores that index value and its week, so a later audit doesn't have to reconstruct which week applied.

## Accessorials

An accessorial is a charge for a service or event outside the base rate. In truckload the common ones are a short list, and each has a trigger, a unit and the evidence that proves it:

| Accessorial | Trigger | Unit | Evidence |
| --- | --- | --- | --- |
| **Detention** | Time at a stop past free time, through the shipper's or receiver's delay | Per hour or per 15 minutes after free time, often capped | Arrival and departure times at the stop, from check calls, ELD or geofence events, or gate records |
| **Layover** | The truck can't load or unload until a later day | Per day | Appointment, arrival and the rescheduled time |
| **Truck ordered not used** (TONU) | The load is cancelled after the carrier dispatched | Per occurrence | The tender acceptance, the dispatch and the cancellation time |
| **Stop-off** | Each pickup or delivery beyond the first and last | Per stop, sometimes plus out-of-route miles | The stops on the load as delivered |
| **Driver assist or unload** | The driver loads or unloads | Per stop or per hour | The shipper's or receiver's request, signed paperwork |
| **Lumper** | A third party unloads at the receiver and the carrier pays it | Pass-through at cost, with a receipt | The lumper receipt |
| **Tarping, team, hazmat, temperature** | Equipment or service requirements | Per load | The tender's requirements |

J.B. Hunt's carrier-facing rules, as published in December 2020 (the newest public version I found, so current rates may differ), are an example of the precision required: detention "begins 2 hours after arrival check call," accrues every 15 minutes, pays $50 an hour if the stop's times came through its automated updates and $40 if entered manually, and becomes a $250-a-day layover ($150 if recorded manually) once time at the stop exceeds five hours, with no detention paid for that stop; a TONU pays only if the load was dispatched (driver en route or arrived) or was cancelled the same day as pickup and tendered more than 30 minutes before the pickup appointment; a stop-off after tender pays "$50 + Out of Route miles" at the load's per-mile rate. Each clause is a rule with inputs the system must already have recorded. <!-- source-gap: logistics-rating-jbhunt-current | status | J.B. Hunt Carrier 360 accessorial rates as of 2026 (source is a December 11, 2020 post) | closes with: a current J.B. Hunt carrier accessorial schedule or Carrier 360 help page | checked: 2026-11-22 -->

LTL accessorials (liftgate, residential, limited access, inside delivery, notification, reweigh) are priced in each carrier's rules tariff per hundredweight or per shipment with minimums and maximums; [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification#accessorials) compares two carriers' schedules item by item.

My rule for every accessorial: no line without its trigger. A detention line points at the stop whose arrival and departure produced it; a TONU line points at the tender and the cancellation; a lumper line points at the receipt in `documents`. An accessorial that arrives on a carrier's invoice without a matching trigger in the system is the first thing audit flags, and one that the system computed from its own events is the easiest to defend when the customer disputes it.

## Detention

Detention gets its own rules because it is the accessorial most often disputed, and the one with a public cost: the DOT Inspector General estimated in 2018 that detention cost for-hire truckload drivers $1.1 billion to $1.3 billion a year in earnings and their carriers $250.6 million to $302.9 million in net income, and that each 15-minute increase in average dwell raises the expected crash rate by 6.2%. The law puts a related duty on the shipper or receiver: one that requires the driver to be assisted in loading or unloading "shall be responsible for providing such assistance" or must compensate the owner or operator for all its costs (49 U.S.C. 14103).

Computing it takes four decisions the schedule must make explicit:

- **When the clock starts.** At the appointment time if the driver arrived early, at arrival if the driver was on time, and (in many schedules) not at all if the driver was late. J.B. Hunt starts it at the arrival check call. The arrival must be an event the system trusts, with its source ([Arrival and Departure Detection](/docs/building-blocks/location-tracking#arrival-and-departure-detection)).
- **Free time.** Two hours is the figure in J.B. Hunt's published rules and the brokered example's illustration; agreements set it per stop type (live load, live unload, drop) and sometimes per facility.
- **Increments and caps.** Per hour or per 15 minutes, rounded up or down, with a cap after which the charge becomes layover.
- **Notice.** Some schedules pay detention only if the carrier notified the broker or shipper before free time ran out; the notice is then an event with a timestamp, not an assertion on the invoice.

The arithmetic, on the illustrative brokered load with the shipper's schedule (two hours free, $75 an hour, quarter-hour increments) and the carrier's (two hours free, $50 an hour): arrival 08:02 for an 08:00 appointment, departure 12:07, so 4 hours 5 minutes at the stop, 2 hours 5 minutes past free time, 8 quarter-hours billable after rounding down. Receivable $150.00, payable $100.00, two lines on one stop. All times compute in the facility's time zone ([Facility Versus Address](/books/logistics/logistics-business#the-core-data-model)), because "arrived at 08:02" is local to the dock. Trailer detention (a dropped trailer kept past its free days) is computed from hook and drop records in [Truckload](/books/logistics/truckload#live-drop-and-preloaded).

## The Rating Engine

A rating engine is a function from a movement and a date to priced lines, applied in a fixed order:

1. **Select agreements** in force on the pickup date for the right side and counterparty, including any spot quote or rate confirmation the tender carries.
2. **Match the lane** by specificity and equipment, and record the winning row.
3. **Compute the base**: flat, miles times rate (miles from the named engine and version), or the LTL base tariff and discount.
4. **Apply the minimum.**
5. **Compute fuel** from the schedule, the index value the lag rule selects, and the base or miles.
6. **Add requested accessorials** from the shipment and load (stops, equipment, services) and, after execution, **event accessorials** from what happened (detention, layover, TONU, reweigh).
7. **Round once per line** and store each line as a `freight_charges` row with its source, rate and quantity.

Steps 1 to 5 run at quote and tender time and produce `estimated` charges; step 6 runs again after delivery, and its new lines join the estimated ones before invoicing. Rating is deterministic: the same inputs and versions give the same lines, which is what makes it testable with recorded cases ([Testing Rules](/docs/building-blocks/rules-as-data#testing-rules)) and lets a disputed invoice be re-rated as of the day it was priced.

## How to Build It

Rating extends `lane_rates` with a real fuel schedule and mileage terms, `rate_agreements` with accessorial schedules and a priority, and `freight_charges` with the inputs each line was computed from. New tables hold the fuel index, fuel schedules, accessorial rates, mileage lookups and quotes. LTL base tariffs, density scales and FAK bands are already [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification#how-to-build-it)'s. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE fuel_price_indexes (        -- a published index value, as published
  series        TEXT NOT NULL,           -- 'eia_us_diesel_weekly', 'eia_padd5_diesel_weekly'
  period_start  DATE NOT NULL,           -- the week (or month) the value is dated
  period_kind   TEXT NOT NULL CHECK (period_kind IN ('week', 'month')),
  price_milli   INT NOT NULL CHECK (price_milli > 0),  -- thousandths of a dollar per gallon
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  published_at  TIMESTAMPTZ NOT NULL,    -- when the publisher released it
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url    TEXT NOT NULL,
  PRIMARY KEY (series, period_start)
);

CREATE TABLE fuel_surcharge_schedules (  -- an agreement's schedule, versioned
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),
  name              TEXT NOT NULL,
  series            TEXT NOT NULL,       -- the index it reads
  method            TEXT NOT NULL CHECK (method IN ('per_mile', 'percent_of_linehaul',
                      'table')),
  averaging         TEXT NOT NULL CHECK (averaging IN ('latest_week', 'calendar_month')),
  effective_rule    TEXT NOT NULL,       -- 'next_wednesday', 'second_month_after', as data
  base_milli        INT NOT NULL,        -- price where the surcharge starts
  step_milli        INT CHECK (step_milli > 0),
  start_amount      NUMERIC(10, 4),      -- minor units per mile at the base, per-mile only
  increment_amount  NUMERIC(10, 4),      -- minor units per mile per step
  start_bp          INT,                 -- percentage: basis points at the base
  increment_bp      INT,                 -- basis points per step
  step_rounding     TEXT NOT NULL DEFAULT 'floor' CHECK (step_rounding IN ('floor', 'nearest')),
  currency          CHAR(3) NOT NULL,
  valid_during      TSTZRANGE NOT NULL,
  document_id       UUID REFERENCES documents (id),
  CHECK ((method = 'per_mile') = (increment_amount IS NOT NULL)),
  CHECK ((method = 'percent_of_linehaul') = (increment_bp IS NOT NULL))
);

CREATE TABLE fuel_surcharge_steps (      -- a published table, loaded row by row
  schedule_id  UUID NOT NULL REFERENCES fuel_surcharge_schedules (id),
  from_milli   INT NOT NULL,             -- inclusive; the row ends at the next
  amount       NUMERIC(10, 4),           -- minor units per mile
  pct_bp       INT,                      -- or basis points of linehaul
  PRIMARY KEY (schedule_id, from_milli),
  CHECK ((amount IS NULL) <> (pct_bp IS NULL))
);

CREATE TABLE mileage_engines (           -- a named engine, version and routing type
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor       TEXT NOT NULL,            -- 'pcmiler', 'milemaker', 'internal'
  version      TEXT NOT NULL,
  routing_type TEXT NOT NULL CHECK (routing_type IN ('practical', 'shortest', 'fastest')),
  point_basis  TEXT NOT NULL,            -- how a postal code or city becomes a point
  UNIQUE (vendor, version, routing_type, point_basis)
);

CREATE TABLE mileage_lookups (           -- every answer, kept for re-rating and disputes
  engine_id   UUID NOT NULL REFERENCES mileage_engines (id),
  origin      TEXT NOT NULL,             -- the key as sent: 'zip5:60606', 'facility:<id>'
  destination TEXT NOT NULL,
  miles_tenths INT NOT NULL CHECK (miles_tenths >= 0),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (engine_id, origin, destination)
);

ALTER TABLE rate_agreements
  ADD COLUMN priority          SMALLINT NOT NULL DEFAULT 100,  -- lower wins between agreements
  ADD COLUMN mileage_engine_id UUID,
  ADD COLUMN quote_ref         TEXT,     -- the quote or confirmation number, for spot
  ADD COLUMN quote_expires_at  TIMESTAMPTZ;
ALTER TABLE rate_agreements ADD CONSTRAINT rate_agreements_mileage_engine_fkey
  FOREIGN KEY (mileage_engine_id) REFERENCES mileage_engines (id) NOT VALID;
ALTER TABLE rate_agreements ADD CONSTRAINT rate_agreements_quote_expiry_check
  CHECK (kind NOT IN ('spot_quote') OR quote_expires_at IS NOT NULL) NOT VALID;

ALTER TABLE lane_rates
  ADD COLUMN fuel_surcharge_schedule_id UUID,  -- replaces the free-text fuel_schedule
  ADD COLUMN fuel_included   BOOLEAN NOT NULL DEFAULT FALSE,  -- an all-in rate
  ADD COLUMN origin_rank     SMALLINT,   -- specificity of the origin key, set on load
  ADD COLUMN destination_rank SMALLINT;
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_fuel_schedule_fkey
  FOREIGN KEY (fuel_surcharge_schedule_id) REFERENCES fuel_surcharge_schedules (id) NOT VALID;

CREATE TABLE accessorial_rates (         -- one accessorial rule inside an agreement
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  rate_agreement_id UUID NOT NULL REFERENCES rate_agreements (id),
  code              TEXT NOT NULL,       -- 'DET', 'LAY', 'TONU', 'STOP', or the tariff item
  kind              TEXT NOT NULL,       -- a freight_charges kind
  stop_kind         TEXT,                -- 'pickup', 'delivery', or null for any
  handling          TEXT,                -- 'live', 'drop', or null for any
  unit              TEXT NOT NULL CHECK (unit IN ('per_load', 'per_stop', 'per_hour',
                      'per_increment', 'per_day', 'per_cwt', 'per_mile', 'pass_through')),
  rate              NUMERIC(14, 4),      -- minor units per unit
  free_minutes      INT CHECK (free_minutes >= 0),
  increment_minutes INT CHECK (increment_minutes > 0),
  increment_rounding TEXT CHECK (increment_rounding IN ('down', 'up', 'nearest')),
  cap_minutes       INT,                 -- past this, the rule named in becomes applies
  becomes_code      TEXT,                -- 'LAY' once detention passes its cap
  minimum_charge    BIGINT,
  maximum_charge    BIGINT,
  requires          TEXT[] NOT NULL DEFAULT '{}',  -- evidence: 'arrival_event', 'notice', 'receipt'
  conditions        JSONB NOT NULL DEFAULT '{}',   -- e.g. clock start on early arrival
  valid_during      TSTZRANGE NOT NULL,
  UNIQUE (rate_agreement_id, code, stop_kind, handling, valid_during)
);

ALTER TABLE freight_charges
  ADD COLUMN accessorial_rate_id UUID,
  ADD COLUMN fuel_series         TEXT,   -- with fuel_period: the index value that priced it
  ADD COLUMN fuel_period         DATE,
  ADD COLUMN mileage_engine_id   UUID,
  ADD COLUMN stop_id             UUID,   -- the stop an event accessorial came from
  ADD COLUMN tender_id           UUID;   -- the tender a TONU or spot rate came from
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_accessorial_rate_fkey
  FOREIGN KEY (accessorial_rate_id) REFERENCES accessorial_rates (id) NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_fuel_index_fkey
  FOREIGN KEY (fuel_series, fuel_period) REFERENCES fuel_price_indexes (series, period_start)
  NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_stop_fkey
  FOREIGN KEY (stop_id) REFERENCES stops (id) NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_tender_fkey
  FOREIGN KEY (tender_id) REFERENCES tenders (id) NOT VALID;

CREATE TABLE rate_quotes (               -- a priced answer, kept whether or not it was used
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id   UUID NOT NULL REFERENCES parties (id),
  side             TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),
  shipment_id      UUID REFERENCES shipments (id),
  load_id          UUID REFERENCES loads (id),
  counterparty_id  UUID REFERENCES parties (id),
  pickup_on        DATE NOT NULL,        -- the date rated as of
  inputs           JSONB NOT NULL,       -- lane keys, equipment, stops, services, as sent
  engine_version   TEXT NOT NULL,        -- the rating code's version
  currency         CHAR(3) NOT NULL,
  total            BIGINT NOT NULL,      -- a sum of the lines, stored for display only
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (shipment_id IS NOT NULL OR load_id IS NOT NULL)
);

CREATE TABLE rate_quote_lines (
  rate_quote_id     UUID NOT NULL REFERENCES rate_quotes (id),
  line_number       SMALLINT NOT NULL,
  kind              TEXT NOT NULL,
  code              TEXT,
  quantity          NUMERIC(14, 3),
  rate              NUMERIC(14, 4),
  amount            BIGINT NOT NULL,
  rate_agreement_id UUID REFERENCES rate_agreements (id),
  lane_rate_id      UUID REFERENCES lane_rates (id),
  accessorial_rate_id UUID REFERENCES accessorial_rates (id),
  explanation       TEXT NOT NULL,       -- 'zip3:606 to zip3:303, dry van, row 41 of 2026 award'
  PRIMARY KEY (rate_quote_id, line_number)
);

CREATE INDEX CONCURRENTLY lane_rates_agreement_idx
  ON lane_rates (rate_agreement_id, origin, destination);
CREATE INDEX CONCURRENTLY freight_charges_stop_idx ON freight_charges (stop_id);
```

Selecting the fuel index value for a pickup, for a schedule that uses the latest weekly value effective the Wednesday after the week it is dated (so the week of Monday, November 16 governs pickups from Wednesday, November 18):

```sql
SELECT f.series, f.period_start, f.price_milli
FROM fuel_surcharge_schedules s
JOIN fuel_price_indexes f ON f.series = s.series AND f.period_kind = 'week'
WHERE s.id = $1
  AND f.period_start + 2 <= $2::date      -- $2: pickup date in the origin facility's zone
ORDER BY f.period_start DESC
LIMIT 1;
```

And detention owed at a stop under an agreement's rule, from the stop's own times:

```sql
SELECT st.id AS stop_id,
       a.code,
       GREATEST(0, EXTRACT(EPOCH FROM (st.departed_at
         - GREATEST(st.arrived_at, lower(st.appointment)))) / 60 - a.free_minutes)::int
         AS billable_minutes
FROM stops st
JOIN accessorial_rates a ON a.rate_agreement_id = $2 AND a.code = 'DET'
WHERE st.load_id = $1
  AND st.arrived_at IS NOT NULL AND st.departed_at IS NOT NULL
  AND (a.stop_kind IS NULL OR a.stop_kind = st.kind)
  AND (a.handling IS NULL OR a.handling = st.handling);
-- the application applies increments, rounding, the cap and the rule's conditions
-- (late arrival, notice), then writes one freight_charges row per side
```

Design notes:

- **Store the index as published.** The EIA value, its week and its release time are rows; a schedule references a series; a charge references the exact row it used. Revisions to a published value are new rows with a later `received_at` only if the publisher revises, which the weekly series rarely does.
- **Schedules are rules with validity, not text.** The core `lane_rates.fuel_schedule` text column is superseded by `fuel_surcharge_schedule_id`; backfill it, then stop writing the text ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Every line explains itself.** `rate_quote_lines.explanation` and the agreement, lane, accessorial and index references on `freight_charges` are what a customer service agent reads when a shipper asks why a load cost what it did ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Quotes are kept even when they lose.** A quote that wasn't booked is the evidence for what the market was, and the input to procurement's next bid.
- **Time is the facility's.** Pickup dates, detention clocks and the fuel week boundary compute in the origin or stop facility's zone, never the server's.
- **Rates have four decimals, amounts none.** Per-mile rates and per-mile fuel amounts are fractional cents; the line amount is rounded once ([Rounding](/docs/money/amounts#rounding)).

## Auditing

- **Every agreement, lane rate, fuel schedule and accessorial rule with its validity and source document,** so a charge can be judged against the terms in force on its pickup date.
- **Every fuel index value with its publication time and source,** and every charge's link to the value it used.
- **Every mileage answer with engine, version and routing type,** so a disputed per-mile charge can be recomputed.
- **Every event accessorial with its trigger:** the stop times and their sources for detention and layover, the tender and cancellation for TONU, the receipt for a lumper, and any notice a schedule requires.
- **Every quote,** booked or not, with its inputs, lines and the rating code version.
- **Every re-rate** as new lines with the voided originals and a reason, never an update in place.

## What This Means for the System You Build

- **Treat rating as a deterministic function of stored inputs,** and store every input with its version: agreement, lane row, miles and engine, fuel index value and schedule.
- **Match lanes by specificity as data,** reject ambiguous agreements when they load, and rate as of the pickup date.
- **Model fuel schedules as index, averaging, lag, base, step and increment,** work in integer thousandths, and floor the steps unless the agreement says otherwise.
- **Store accessorials as rules with triggers, units, free time, increments, caps and required evidence,** and compute event accessorials from the system's own stop and tender records.
- **Price both sides of a brokered load separately,** under each side's agreement, and never derive one from the other.
- **Keep LTL class, density and base-tariff mechanics in their own tables** ([Freight Class, Density & LTL Pricing](/books/logistics/freight-classification#how-to-build-it)) and call them from the same engine.

## References

**Government and regulation**

- [U.S. Energy Information Administration: Gasoline and diesel fuel update](https://www.eia.gov/petroleum/gasdiesel/), the weekly on-highway diesel average ($5.937 for November 16, 2026), regional values, taxes included and release dates
- [Federal Register: Updated TR-12 Fuel Related Rate Adjustment Policy (June 14, 2019)](https://www.govinfo.gov/content/pkg/FR-2019-06-14/html/2019-12594.htm), the mileage-based formula for FAK and TPS truckload from June 10, 2019, the $2.50 baseline, and the percentage of line-haul increment factor raised from $.10 to $.13
- [49 U.S.C. 14103: Loading and unloading motor vehicles](https://www.law.cornell.edu/uscode/text/49/14103), the shipper's or receiver's duty to provide or pay for loading help
- [DOT Office of Inspector General: ST2018019, commercial driver detention (January 31, 2018)](https://www.oig.dot.gov/library-item/36237), detention's cost to drivers and carriers and the crash-rate effect of dwell

**Carriers**

- [Estes Express Lines: Fuel surcharge](https://www.estes-express.com/resources/fees-and-surcharges/fuel-surcharge), the DOE index, Tuesday updates with Wednesday effect, and the 2-cent steps around 361 cents
- [Union Pacific: Carload mileage-based standard HDF fuel surcharge](https://www.up.com/customers/surcharge/mileage/index.htm), the $2.30 strike price, $0.05 steps, monthly averaging with a two-month lag, and the 2026 table (84 cents for December 2026 on October's $6.252)
- [J.B. Hunt: Standardized accessorials in Carrier 360 (December 11, 2020)](https://www.jbhunt.com/blog/j-b-hunt-360/carrier/standardized-accessorials-in-carrier-360), detention, layover, TONU, stop-off and driver assist rules and rates

**Vendors and market**

- [Trimble: PC\*Miler](https://transportation.trimble.com/en/solutions/mapping-and-routing/pcmiler), routing types, uses in billing, driver pay, auditing and fuel tax, and the legal-standard claim
- [DAT: Spot and contract freight, what's the difference and why it matters (May 2, 2022)](https://www.dat.com/blog/spot-and-contract-freight-whats-the-difference-and-why-it-matters), contract share of transactions and contracts binding on price only
