+++
title = "Rail Freight"
description = "Class I railroads, carload and intermodal, reporting marks and Umler, waybills and interchange, car hire, STB demurrage rules, rail EDI and the UP-NS merger."
category = "Logistics & Supply Chain Industry"
order = 2809
part = "Road and Rail"
tags = ["logistics", "rail", "railroads", "demurrage", "car-hire", "edi", "stb", "data-model"]
+++

A railroad sells movement of cars, not of trucks or boxes: a covered hopper of plastic pellets from a resin plant's siding in Texas to a converter's siding in Ohio, a tank car of chemicals, a string of auto racks, or a well car carrying two containers. Six large railroads (the Class I carriers) run most of the North American network, and their 2025 filings give the scale: Union Pacific earned $23,220 million of freight revenue on 8,447,000 carloads, BNSF $22,792 million on 9,622,000 cars and units, and CSX, Norfolk Southern, CPKC and CN between them run roughly 79,000 more route miles (my sum of their stated networks). A rail shipment changes hands between railroads at junctions, sits in yards between trains, and is billed per car under a tariff or contract; the car itself may belong to a third railroad, a leasing company or the shipper, and every hour it spends on someone's track is owed to its owner as car hire or to the serving railroad as demurrage.

The software is hard because a railcar is a long-lived, shared asset whose identity, ownership and location are kept in industry-wide registries, and a shipment's record is spread across a waybill, interchange reports between railroads, a stream of car events and monthly settlements. A shipper's question (where is my car, when will it be placed, why was I billed demurrage on it) needs data from the serving railroad, the line-haul railroad, the car owner and the shipper's own plant. This chapter covers the Class I networks, carload versus intermodal freight, cars and their reporting marks, waybills and interchange, car hire between railroads and car owners, demurrage under the Surface Transportation Board's rules, the rail EDI sets and APIs, and the Union Pacific and Norfolk Southern merger. It extends `loads`, `equipment_units` and `freight_charges` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); containers on rail, ramps and drayage are [Intermodal & Drayage](/books/logistics/intermodal-and-drayage).

## How the Railroads Do It

As of November 2026, from the six Class I carriers' 2025 annual reports (CN's figures from its January 30, 2026 results release, which its 40-F incorporates rather than reprints); the Canadian carriers report in Canadian dollars:

| Railroad | Network | 2025 revenue | Operating ratio | Volume | Intermodal |
| --- | --- | --- | --- | --- | --- |
| **Union Pacific** | 32,889 route miles in 23 western states | $24,510 million operating; $23,220 million freight | 59.8% | 8,447,000 carloads, $2,749 average per car | $4,632 million on 3,357,000 units |
| **BNSF** (Berkshire Hathaway) | Over 32,500 route miles in 28 states and three Canadian provinces; about 6,700 locomotives and 70,700 freight cars | $23,421 million operating; $22,792 million freight | Not reported (65.6%: $15,366 million of operating expenses over $23,421 million, my division) | 9,622,000 cars and units, $2,369 average | Consumer Products (intermodal and automotive) $8,196 million on 5,601,000 units |
| **CSX** | About 20,000 route miles in 26 states, DC, Ontario and Quebec | $14.1 billion | Not reported; operating margin 32.1% | 2.6 million merchandise carloads, 718,000 coal | $2,073 million on 2,995,000 units |
| **Norfolk Southern** | About 19,100 route miles in 22 states and DC | $12.2 billion | 64.2% | 2.3 million merchandise carloads, 78.0 million tons of coal | 4.1 million units, 25% of revenue |
| **CPKC** | About 20,000 miles in Canada, the US and Mexico | C$15,078 million total; C$14,776 million freight | 62.8% (59.9% core adjusted) | 4,514,000 carloads; 219,420 million revenue ton-miles | C$2,679 million on 1,780,600 carloads, about 18% of freight revenue |
| **CN** | Nearly 20,000 miles from Canada's coasts to the US Midwest and Gulf | C$17,304 million | 61.9% (61.7% adjusted) | 5,458,000 carloads; 238,159 million revenue ton-miles | C$3,892 million, 22% of revenue, its largest commodity group |

Three patterns:

- **Two in the West, two in the East, two across Canada.** Union Pacific and BNSF split the western US (Union Pacific's 23 states are "in the western two-thirds of the country"), CSX and Norfolk Southern the eastern, and CN and CPKC span Canada, CPKC as "the only freight railway spanning Canada, the United States ("U.S."), and Mexico." A coast-to-coast US shipment changes railroads at an interchange today; the pending Union Pacific and Norfolk Southern merger would create "America's first transcontinental railroad," in Union Pacific's words.
- **Operating ratios near 60%.** The railroads report operating expenses as a share of revenue as trucking companies do, and their reported 59.8% to 64.2% (65.6% for BNSF by my division) sit well below Old Dominion's 75.2% in LTL and Knight-Swift's 97.0% in truckload ([An LTL Shipment](/books/logistics/logistics-business#an-ltl-shipment), [An Asset Carrier Load](/books/logistics/logistics-business#an-asset-carrier-load)); How Carriers, Brokers & 3PLs Make Money compares them.
- **Intermodal is the volume, merchandise is the money.** Intermodal is 48% of CSX's volume and 15% of its revenue; at BNSF, Consumer Products averaged $1,463 a unit against $4,616 for Agricultural and Energy. A car of merchandise is worth several boxes on a well car, and the systems that price, bill and track the two are different.

## Carload and Intermodal

**Carload** freight moves in a railcar that the railroad, a lessor or the shipper owns: a boxcar of paper, a covered hopper of grain or plastics, a tank car of chemicals, a gondola of steel, an auto rack of finished vehicles. The serving railroad switches empty cars into a customer's siding, the customer loads and releases them, a local train pulls them to a yard, they're classified onto line-haul trains, and at the destination a local switches them into the consignee's siding. A car can wait in several yards and change railroads at one or more interchanges. Union Pacific's 2025 Bulk group (grain, coal, fertilizer) averaged $3,690 a carload and its Industrial group $3,840.

**Intermodal** freight moves in a container or trailer lifted onto a flat or well car at a ramp, and Union Pacific's volume statistics count it so that "for intermodal shipments, each container or trailer equals one carload"; the intermodal box's life at the ramps and on the road is in [Intermodal & Drayage](/books/logistics/intermodal-and-drayage).

**Automotive** freight is its own business: finished vehicles in multi-level auto racks, which are flat cars with racks (appurtenances) that can have a different owner from the car under them. Union Pacific moved 793,000 automotive carloads in 2025 at $3,024 each.

For the data model, a carload shipment is one `shipments` row per waybill (one car, or a block of cars moving together under one waybill), and each railroad's segment is a `loads` row of mode `rail` whose `trailer_id` is the car; a unit train of a hundred cars of coal under one waybill is one shipment and one load with a hundred equipment rows attached.

## Cars, Reporting Marks and Umler

A railcar is identified by its reporting mark (an alphabetic code for its owner) and a number. Railinc's mark register says a railroad's code depends on operating authority "approved by the Surface Transportation Board" (or the Canadian or Mexican authority), with code availability checked with NMFTA, and that private marks are four letters assigned by equipment type: "All privately owned railcars end in X," while trailer and chassis marks end in Z. The mark is a party identifier as much as an equipment one: a car marked ABCX belongs to a private owner, whichever railroad is hauling it.

Every car in interchange service is registered in Umler, the industry's equipment registry, which Railinc maintains and describes as "the source of critical data for more than 2 million pieces of North American rail equipment." A Umler record carries the car's four-character Equipment Type Code, its mechanical designation, its owner (the stenciled mark) and its lessee. Umler data also drives car hire: a car "must be registered in Umler" to take part in rate negotiation, and a car whose Umler data fails Railinc's edits is "zero-rated" until it is corrected. A shipper or lessor with a fleet of tank cars therefore cares about Umler data quality because its income from the cars depends on it.

My rule: store the reporting mark and number as two columns plus the registry facts the system needs (owner mark, lessee mark, equipment type code, private or railroad mark), refresh them from the owner's or the railroad's data on a schedule, and never key anything on them, because marks are reassigned when railroads merge and cars are restenciled.

## Waybills, Interchange and Car Events

A rail shipment starts with the shipper's bill of lading instructions, sent as an X12 404 (Rail Carrier Shipment Information) or entered in the railroad's portal. The railroad creates a waybill, its contract of carriage and routing instruction, naming the car, the shipper, the consignee and any care-of party, the commodity (by its Standard Transportation Commodity Code, whose master list travels as the 435), the origin and destination stations, the route by railroad and junction, and whether the car is loaded or empty. When the car leaves one railroad for another, the delivering railroad sends the receiving one the waybill (417, Rail Carrier Waybill Interchange) and an advance consist of the train (418), and the Liability Continuity System that Railinc runs establishes "the official interchange record for Car Hire settlement" from the railroads' event reports, correcting illogical or missing ones from a view of the whole network.

The X12 rail sets map onto the core model's records:

| Set | Title | What it carries | Where it lands |
| --- | --- | --- | --- |
| 404 | Rail Carrier Shipment Information | The shipper's bill of lading to the railroad | `shipments`, `documents` |
| 426 | Rail Revenue Waybill | The waybill as rated | `rail_waybills` |
| 417 | Rail Carrier Waybill Interchange | The waybill passed between railroads | `rail_waybills`, `documents` |
| 418 | Rail Advance Interchange Consist | The cars on a train about to be interchanged | `shipment_events` |
| 421 | Estimated Time of Arrival and Car Scheduling | ETAs for cars | `shipment_events` (estimated) |
| 422 | Equipment Order | A customer's order for empty cars | `rail_car_orders` (not built here) |
| 423 | Rail Industrial Switch List | Cars to pull and place at a customer's tracks | `railcar_placements` |
| 410 | Rail Carrier Freight Details and Invoice | The freight bill | `freight_invoices` |
| 432 | Rail Car Hire Rate Negotiation | Car hire offers between owners and users | `car_hire_rates` |
| 437 | Railroad Junctions and Interchanges Activity | Junction reference data | `facilities` (kind `rail_yard`) |
| 451 | Railroad Event Report | Car events | `shipment_events` |
| 322 | Terminal Operations and Intermodal Ramp Activity | Ramp events for intermodal | `shipment_events`, `equipment_interchanges` |

Railroads also expose APIs. Union Pacific publishes a Shipment API with "real-time information on your shipment's location and ETAs," an Action API to "release equipment, order-in rail cars or create intermodal terminal reservations," and a Cases API that says "when shipments are off course"; developers register through a portal, and third-party providers must "have an active Letter of Authority with Union Pacific," managed by Transentric. A shipper or a TMS acting for one therefore stores, per railroad, the authorization under which it may see a customer's cars, alongside the credentials ([A Connection Is a Record](/docs/building-blocks/integrations#a-connection-is-a-record)).

Car events are where the shipper's own operations meet the railroad's. At a plant with its own tracks, the events that matter are the ones the demurrage rules name: the car's original estimated arrival, its receipt at the last interchange, its actual placement on the customer's track or its constructive placement (held by the railroad because the customer's track was full, with notice to the customer), the customer's order to bring it in, and its release. These are the timestamps on a demurrage invoice, and they are the shipper's evidence for disputing one.

## Car Hire

Car hire is what a railroad pays a car's owner for using the car while it is on the railroad's lines. CSX's filing defines it as "a charge paid by one railroad for its use of cars belonging to another railroad or car owner," and its accounting appears in equipment rents: Union Pacific's equipment and other rents were $912 million in 2025, "primarily" rent it pays "for freight cars owned by other railroads or private companies," and its car hire expense fell on "favorable haul length and improved cycle times," which partly offset inflation; BNSF's equipment rents were $709 million, and CSX's $357 million net of the rents it receives. Faster cars mean lower car hire, which is one reason railroads measure car velocity and dwell.

The rates are negotiated, not prescribed. The ICC's order effective January 1, 1993, implemented on January 1, 1994 and phased in fully by January 1, 2003, replaced a formula with market rates ("Deprescription"); the statute still lets the Board set compensation for the use of cars tied to "a fair return on its cost" (49 U.S.C. 11122). The industry runs the market through Railinc's CHRNSS and CHARM systems:

- **Six rates per car per owner and user.** Loaded hourly, empty hourly, loaded mileage, empty mileage, loaded appurtenance and empty appurtenance, published monthly in the Car Hire Accounting Rate Master, "the official source of time and mileage rates for freight cars." Rates between one owner and one user are confidential; default rates are not.
- **Rates change only on month boundaries.** An effective date "must always be the first day of a month," an expiration date "the last day of a month," and "rates are always in effect for a full calendar month."
- **Defaults and fallbacks are rules.** A new car gets a default rate from a quarterly table (the lowest negotiated positive rate for its equipment type code at the end of the prior quarter); a spot rate that expires falls back to the last negotiated market rate, or the default.
- **Negotiation has clocks.** An open offer with no activity for 45 days is deleted (with reminders at 15 and 30 days); a call for best and final offers gives each side 28 calendar days; best and final offers stay binding for 180 days, during which either side can take the dispute to "baseball-style" arbitration, where the arbitrator picks one of the two offers and the result binds for a year.
- **Private cars sit outside it.** Cars with private marks "are not subject to the Code of Car Hire Rules or Deprescription"; their owners are paid by lease and mileage agreements with the railroads, and trailers and containers are excluded too.

A car owner's system (a lessor, or a shipper with its own fleet) reconciles each month's car hire receivable against CHARM rates and the interchange record; a railroad's reconciles its payable. Both are joins of hours and miles per car per railroad against a rate valid for that month, which is why the rate table is versioned by month and the hours come from the official interchange record rather than the railroad's own events.

## Demurrage Under 49 CFR 1333

Demurrage is the serving railroad's charge for a shipper or receiver holding a car past free time, and the STB's rule defines its two jobs: it "compensates rail carriers for the expenses incurred when rail cars are detained" beyond free time, and "serves as a penalty for undue car detention" (49 CFR 1333.1). Part 1333 (first published April 16, 2014, and amended in 2020 and 2021) sets who may charge it and what the bill must show:

- **Contract or tariff.** A serving carrier and its customers "may enter into contracts pertaining to demurrage"; absent a contract, "demurrage will be governed by the demurrage tariff of the serving carrier" (1333.2).
- **Notice before liability.** A person that receives cars for loading or unloading and holds them past free time can be liable only if the carrier gave it actual notice of the tariff, in writing or electronically, before the cars were placed (1333.3(a)).
- **Warehouses and transloaders.** Where cars go to a third-party intermediary, the shipper or consignee can agree to be billed directly by a Class I carrier through a joint notice naming the party to bill and a start date at least 20 days later, which either party can end by notice (1333.3(b), amended May 6, 2020).
- **What a Class I invoice shows.** The billing cycle; each car's reporting marks and number; where applicable its waybill date, loaded or empty status, commodity, shipper, consignee or care-of party, and origin station and state; the dates and times of its original estimated arrival, receipt at the last interchange, actual placement, constructive placement, notice of constructive placement, ordered-in (closed-gate) point and release; and the credits and debits attributable to each car (1333.4, April 6, 2021).
- **In machine-readable form.** Class I carriers must give "machine-readable access" to the same information, meaning "data in an open format that can be easily processed by computer without human intervention" (1333.5).

The railroads disclose demurrage as part of other revenue: BNSF's other revenues, $629 million in 2025, are "primarily generated from accessorial services provided to railroad customers which are primarily storage and demurrage," and CSX's other revenue rose $31 million "primarily due to increased carload demurrage." The credit-and-debit mechanics (credits earned for releasing cars early offset debits for holding them late, netted over a billing cycle) are set by each railroad's tariff and differ in their free time, rates and netting rules; the regulation only requires that the credits and debits per car appear on the bill.

**A worked month.** A plastics converter receives covered hoppers under a tariff with two days of free time after placement, each started 24 hours counting as a day, an illustrative $100 a day after that, and credits for early release that can offset debits within the month. Three cars in one billing cycle:

| Car | Actual or constructive placement | Release | Days held | Free days | Credits or debits | Charge (illustrative) |
| --- | --- | --- | --- | --- | --- | --- |
| ABCX 100201 | Placed Mar 3, 07:10 | Mar 4, 15:00 | 2 | 2 | 0 | $0 |
| ABCX 100202 | Constructively placed Mar 3, 07:10; notice 07:30; ordered in Mar 6 | Mar 9, 06:00 | 6 | 2 | 4 debits | $400 |
| ABCX 100203 | Placed Mar 5, 06:00 | Mar 5, 18:00 | 1 | 2 | 1 credit | ($100) offset |
| **Net for the cycle** | | | | | 3 debits | **$300** |

Whether the second car's constructive placement counts against the customer depends on the notice time and on whether the railroad could have placed it; disputes are about exactly those timestamps, which is why 1333.4 requires them on the invoice and why the customer's own track records (its gate and switch list) should be kept to compare.

## The Union Pacific and Norfolk Southern Merger

Union Pacific agreed to acquire Norfolk Southern on July 28, 2025, in a "stock-and-cash transaction": each Norfolk Southern share converts into one Union Pacific share and $88.82 in cash. The status, as of November 22, 2026:

| Date | Step |
| --- | --- |
| July 28, 2025 | Merger agreement; a $2.5 billion termination fee in specified circumstances; end date January 28, 2028, extendable |
| December 19, 2025 | Major merger application filed in STB Docket No. FD 36873 |
| January 16, 2026 | The STB found the application incomplete and "rejected the application without prejudice" |
| April 30, 2026 | Revised application filed |
| May 28, 2026 | The STB accepted the revised application (Decision No. 21) and held the proceeding in abeyance for supplemental information |
| July 7 and July 27, 2026 | Applicants filed the supplemental information |
| August 18, 2026 | The STB removed the proceeding from abeyance and adopted a procedural schedule, "not a finding on the merits," and denied an expedited track for the applicants' proposals to divest control of the Terminal Railroad Association of St. Louis |
| September 18, 2026 | Decision No. 37 denied motions for summary denial of the revised application, reaching "no conclusions on the merits" |
| November 18, 2026 | Comments, protests and requests for conditions due; the same day the Board set November 27 for comments on the completeness of responsive applications, with replies due December 1 |
| February 16, 2027 | Responses to comments due |
| To be set | A public hearing, before final briefs, then a decision |

For software, a Class I merger is a data migration across the industry: reporting marks and stations are consolidated over time, car hire between the two merged roads stops being an external settlement (the Code of Car Hire Rules covers "Merged Railroads" in its Rule 1), interline routes become single-line, EDI partner IDs and SCACs change, and every customer's contracts and tariffs are reissued. A system that keys cars on marks, stations on a railroad's own codes, or carriers on SCACs breaks; one that stores them as identifiers with validity ranges, mapped to its own keys, carries on.

## How to Build It

The core model's `loads` (mode `rail`), `equipment_units` (kind `railcar`), `stops` (kind `interchange` at a junction) and `freight_charges` (kind `demurrage`) carry rail already. Rail adds the car's registry facts, the waybill, the placement events demurrage is billed on, the demurrage invoice's per-car lines, and car hire rates for owners and railroads. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE equipment_units
  ADD COLUMN reporting_mark       TEXT,   -- 'UP', 'BNSF', 'ABCX'; railcars only
  ADD COLUMN car_number           TEXT,   -- as stenciled, without leading zeros normalized away
  ADD COLUMN lessee_mark          TEXT,   -- Umler lessee, when not the stenciled owner
  ADD COLUMN equipment_type_code  CHAR(4),  -- Umler's four-character code
  ADD COLUMN registry_checked_at  TIMESTAMPTZ;
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_railcar_mark_check
  CHECK (kind <> 'railcar' OR (reporting_mark IS NOT NULL AND car_number IS NOT NULL)) NOT VALID;

ALTER TABLE loads
  ADD COLUMN rail_waybill_id UUID;        -- the waybill this railroad's segment moves under

CREATE TABLE rail_waybills (             -- the railroad's contract of carriage for a car or block
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id           UUID NOT NULL REFERENCES shipments (id),
  issuing_railroad_id   UUID NOT NULL REFERENCES parties (id),
  waybill_number        TEXT NOT NULL,
  waybill_date          DATE NOT NULL,
  origin_station        TEXT NOT NULL,   -- as the railroad codes it, with state
  destination_station   TEXT NOT NULL,
  care_of_party_id      UUID REFERENCES parties (id),  -- a transloader or warehouse
  stcc                  CHAR(7),         -- Standard Transportation Commodity Code
  loaded                BOOLEAN NOT NULL,
  route                 JSONB NOT NULL,  -- [{"railroad": "<party id>", "junction": "CHGO"}, ...]
  rate_agreement_id     UUID REFERENCES rate_agreements (id),  -- the contract or tariff
  document_id           UUID REFERENCES documents (id),        -- the 426 or 417 as received
  superseded_by         UUID REFERENCES rail_waybills (id),    -- a corrected waybill
  UNIQUE (issuing_railroad_id, waybill_number, waybill_date)
);

CREATE TABLE rail_waybill_cars (         -- the cars a waybill covers
  rail_waybill_id UUID NOT NULL REFERENCES rail_waybills (id),
  equipment_id    UUID NOT NULL REFERENCES equipment_units (id),
  PRIMARY KEY (rail_waybill_id, equipment_id)
);

CREATE TABLE railcar_placements (        -- one car's visit to a customer's tracks
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id            UUID NOT NULL REFERENCES equipment_units (id),
  facility_id             UUID NOT NULL REFERENCES facilities (id),
  serving_railroad_id     UUID NOT NULL REFERENCES parties (id),
  rail_waybill_id         UUID REFERENCES rail_waybills (id),
  original_eta            TIMESTAMPTZ,   -- each time below is one 1333.4(d) element
  received_interchange_at TIMESTAMPTZ,
  constructive_at         TIMESTAMPTZ,
  constructive_notice_at  TIMESTAMPTZ,
  ordered_in_at           TIMESTAMPTZ,   -- the closed-gate order-in point
  actual_placement_at     TIMESTAMPTZ,
  released_at             TIMESTAMPTZ,
  source                  TEXT NOT NULL CHECK (source IN ('railroad_invoice', 'railroad_api',
                            'rail_edi', 'customer_records')),
  received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (released_at IS NULL
         OR released_at >= COALESCE(actual_placement_at, constructive_at, released_at))
);

CREATE TABLE rail_demurrage_invoices (   -- a demurrage bill, per 49 CFR 1333.4
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_invoice_id  UUID NOT NULL UNIQUE REFERENCES freight_invoices (id),
  serving_railroad_id UUID NOT NULL REFERENCES parties (id),
  billing_cycle       DATERANGE NOT NULL,  -- 1333.4(a)
  billed_party_id     UUID NOT NULL REFERENCES parties (id),
  via_intermediary_id UUID REFERENCES parties (id),  -- direct billing under 1333.3(b)
  machine_readable_ref TEXT              -- where the 1333.5 data was fetched from
);

CREATE TABLE rail_demurrage_car_lines (  -- each car on the bill, as billed
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  rail_demurrage_invoice_id UUID NOT NULL REFERENCES rail_demurrage_invoices (id),
  railcar_placement_id     UUID REFERENCES railcar_placements (id),  -- matched to the receiver's record
  reporting_mark           TEXT NOT NULL,  -- 1333.4(b), as billed
  car_number               TEXT NOT NULL,
  as_billed                JSONB NOT NULL, -- 1333.4(c) and (d) values as the railroad sent them
  credits                  SMALLINT NOT NULL DEFAULT 0,  -- 1333.4(e)
  debits                   SMALLINT NOT NULL DEFAULT 0,
  amount                   BIGINT NOT NULL,              -- minor units, signed
  disputed                 BOOLEAN NOT NULL DEFAULT FALSE,
  dispute_reason           TEXT
);

CREATE TABLE car_hire_rates (            -- a month's car hire rates between an owner and a user
  equipment_id      UUID NOT NULL REFERENCES equipment_units (id),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),
  user_party_id     UUID NOT NULL REFERENCES parties (id),
  effective_month   DATE NOT NULL CHECK (EXTRACT(DAY FROM effective_month) = 1),
  rate_type         CHAR(1) NOT NULL CHECK (rate_type IN ('O', 'M', 'S', 'Z', 'B', 'N', 'R',
                      'D', 'L', 'U', 'V', 'W')),  -- CHARM rate type indicator
  loaded_hourly     NUMERIC(10, 4),      -- minor units per hour
  empty_hourly      NUMERIC(10, 4),
  loaded_mileage    NUMERIC(10, 4),      -- minor units per mile
  empty_mileage     NUMERIC(10, 4),
  loaded_appurtenance NUMERIC(10, 4),
  empty_appurtenance  NUMERIC(10, 4),
  currency          CHAR(3) NOT NULL,
  source_file       TEXT NOT NULL,       -- the CHARM file it came from
  PRIMARY KEY (equipment_id, owner_party_id, user_party_id, effective_month)
);

ALTER TABLE loads ADD CONSTRAINT loads_rail_waybill_fkey
  FOREIGN KEY (rail_waybill_id) REFERENCES rail_waybills (id) NOT VALID;
CREATE UNIQUE INDEX CONCURRENTLY equipment_units_railcar_idx
  ON equipment_units (reporting_mark, car_number) WHERE kind = 'railcar' AND status = 'active';
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_railcar_mark_check;
ALTER TABLE loads VALIDATE CONSTRAINT loads_rail_waybill_fkey;
```

A receiver's audit of a demurrage bill compares each billed car with its own placement record and flags the ones where the railroad's times and its own disagree:

```sql
SELECT l.reporting_mark, l.car_number, l.debits, l.amount,
       l.as_billed ->> 'released_at'  AS billed_release,
       p.released_at                   AS own_release,
       l.as_billed ->> 'constructive_notice_at' AS billed_notice,
       p.constructive_notice_at        AS own_notice
FROM rail_demurrage_car_lines l
JOIN rail_demurrage_invoices i ON i.id = l.rail_demurrage_invoice_id
LEFT JOIN railcar_placements p ON p.id = l.railcar_placement_id
WHERE i.freight_invoice_id = $1
  AND (p.id IS NULL
       OR (l.as_billed ->> 'released_at')::timestamptz <> p.released_at
       OR (l.as_billed ->> 'constructive_notice_at')::timestamptz
            IS DISTINCT FROM p.constructive_notice_at)
ORDER BY l.amount DESC;
```

Design notes:

- **The car is equipment; the mark is an identifier.** `equipment_units` keys on its own UUID; mark and number are columns, unique among active cars only, because marks are reassigned in mergers and cars are restenciled.
- **Keep the bill as billed and your record as observed.** The railroad's per-car times live on the invoice line (`as_billed`), the customer's on `railcar_placements`; a dispute is the difference, never an overwrite of one by the other.
- **One placement, many sources.** A placement's times can arrive from the railroad's API, its EDI, its invoice and the plant's own switch list; keep the source and the time received, and prefer the one the contract names.
- **Car hire rates are monthly.** A rate is valid for a calendar month and keyed by car, owner and user, as CHARM is; never store a "current rate" without its month.
- **Demurrage is a freight charge.** Each billed car's amount becomes a `freight_charges` row of kind `demurrage` on the shipment or load, payable for the receiver and receivable for the railroad, with the demurrage line as evidence.
- **Authorization is data.** A Letter of Authority to see a customer's cars is a record with its scope and dates, checked before each API call made on that customer's behalf.
- **Emit the car events.** `railcar.placed`, `railcar.constructively_placed`, `railcar.released`, `waybill.created` and `demurrage_invoice.received` drive plant scheduling, accrual and audit ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every waybill as issued and corrected,** with the route, commodity and rate reference that priced it.
- **Every placement's times by source,** the railroad's and the customer's, with when each was received; they are the evidence in every demurrage dispute.
- **Every demurrage invoice per 1333.4,** car by car, with the machine-readable data fetched under 1333.5, the match to the customer's records, and the disputes raised.
- **The notice that made a party liable,** under 1333.3(a), and any direct-billing notice under 1333.3(b) with its start and end.
- **Car hire rates by month** as received from CHARM, and each month's reconciliation of hours and miles against the official interchange record.
- **Every authorization** to access a customer's rail data, with its scope and validity.

## What This Means for the System You Build

- **Treat each railroad's segment as a load** and the car as equipment, with marks and numbers as identifiers, never keys.
- **Model the waybill as its own record,** corrected by supersession, because rating, routing and settlement all point at it.
- **Record the 1333.4 times per car per placement,** from every source, so a demurrage bill can be checked line by line.
- **Keep demurrage bills as billed** and compute disputes as differences, never edits.
- **Version car hire rates by calendar month** per car, owner and user, and reconcile against the official interchange record.
- **Store per-railroad API authorizations** alongside credentials, and check them per call.
- **Plan for the merger** by mapping marks, stations, SCACs and partner IDs with validity ranges rather than hardcoding them.

## References

**Filings**

- [Union Pacific: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/100885/000010088526000037/unp-20251231.htm), route miles, states, revenue, carloads and revenue per car by group, intermodal and automotive, operating ratio, equipment rents and car hire, accessorial revenue, and the Norfolk Southern merger agreement, termination fee, end date and the STB's January 2026 rejection
- [Burlington Northern Santa Fe: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/934612/000093461226000004/bni-20251231.htm), route miles, states and provinces, locomotives and cars, revenue, volume and revenue per unit by group, equipment rents, and other revenues from storage and demurrage
- [CSX: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/277948/000027794826000006/csx-20251231.htm), route miles and territory, revenue and volume by line of business, operating margin, intermodal terminals, car hire and demurrage definitions, equipment rents and demurrage-driven other revenue
- [Norfolk Southern: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/702165/000162828026006268/nsc-20251231.htm), route miles, revenue, operating ratio, volumes and the merger consideration
- [Canadian Pacific Kansas City: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/16875/000001687526000008/cp-20251231.htm), network, total and freight revenue, reported and core adjusted operating ratio, carloads, revenue ton-miles, and intermodal revenue, carloads and share
- [Canadian National Railway: Form 40-F for 2025](https://www.sec.gov/Archives/edgar/data/16868/000110465926010352/tm261145d1_40f.htm), network and intermodal as its largest commodity group, 22% of revenue
- [CN: Fourth-quarter and full-year 2025 results (January 30, 2026)](https://www.cn.ca/en/news/2026/01/cn-announces-solid-fourth-quarter-and-year-end-results/), revenues, operating ratio, carloads, revenue ton-miles and intermodal revenue

**Statutes and regulations**

- [49 U.S.C. 11122: Compensation and practice for use of cars](https://www.law.cornell.edu/uscode/text/49/11122), the Board's car service rules and car compensation tied to cost and a fair return
- [49 CFR Part 1333: Demurrage liability](https://www.law.cornell.edu/cfr/text/49/part-1333), section titles, authority and the 2014 source
- [49 CFR 1333.1: Demurrage defined](https://www.law.cornell.edu/cfr/text/49/1333.1), compensation and penalty
- [49 CFR 1333.2: Who may charge demurrage](https://www.law.cornell.edu/cfr/text/49/1333.2), contracts and the serving carrier's tariff
- [49 CFR 1333.3: Who is subject to demurrage](https://www.law.cornell.edu/cfr/text/49/1333.3), actual notice, and direct billing through a third-party intermediary
- [49 CFR 1333.4: Information requirements for demurrage invoices](https://www.law.cornell.edu/cfr/text/49/1333.4), the per-car invoice contents
- [49 CFR 1333.5: Machine-readable access](https://www.law.cornell.edu/cfr/text/49/1333.5), the open-format requirement

**Government**

- [Surface Transportation Board: press release No. 26-21 (August 18, 2026)](https://www.stb.gov/wp-content/uploads/PR-26-21.pdf), the UP-NS procedural schedule, the May 28, 2026 acceptance and abeyance, supplemental filings, comment and response dates, the hearing and the St. Louis terminal ruling
- [Surface Transportation Board: Decision No. 37 in FD 36873 (September 18, 2026)](https://www.railwayage.com/wp-content/uploads/2026/09/53244.pdf), denial of the motions for summary denial, the revised application's filing date and Decision No. 21's acceptance
- [Surface Transportation Board: UP-NS merger resources](https://www.stb.gov/?p=81275), the docket's filings and decisions from the December 19, 2025 application through the November 18, 2026 order on responsive applications

**Industry**

- [Railinc: Car Hire Deprescription, CHRNSS business rules (August 2026)](https://public.railinc.com/sites/default/files/documents/Deprescription_Business_Rules.pdf), deprescription dates, CHARM's six rates and rate types, effective and expiration months, default and fallback rates, negotiation, best and final offer and arbitration clocks, private cars, Umler zero-rating, the Liability Continuity System, private marks ending in X, and Umler's scale
- [Railinc: Mark Register](https://public.railinc.com/resources/mark-register), railroad codes on STB (or Canadian or Mexican) authority, NMFTA availability checks, and private marks ending in X and Z
- [Union Pacific: API developer resources](https://www.up.com/shipping/resources/api-developer), the Shipment, Action and Cases APIs, the Letter of Authority and Transentric

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the titles of the 322, 404, 410, 417, 418, 421, 422, 423, 426, 432, 435, 437 and 451
