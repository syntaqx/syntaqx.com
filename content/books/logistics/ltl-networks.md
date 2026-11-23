+++
title = "LTL Networks"
description = "LTL as a network: service centers, breakbulks, linehaul and pickup and delivery, bills of lading and PROs, exceptions, claims ratios and Yellow's failure."
category = "Logistics & Supply Chain Industry"
order = 2806
part = "Road and Rail"
tags = ["logistics", "ltl", "terminals", "bill-of-lading", "pro-number", "data-model"]
+++

Less-than-truckload carriers move shipments too small to fill a trailer (a few pallets, a crate, a drum) by combining many shippers' freight through a network of terminals. A pickup driver collects shipments from a dozen docks in the afternoon; the origin service center unloads them, sorts them by destination and loads them onto linehaul trailers that run overnight, often through a breakbulk hub that sorts again; the destination service center loads a delivery driver's truck in the morning. Old Dominion averaged 43,762 shipments a day in 2025 at 1,477 pounds each through 260 service centers; FedEx Freight, independent since June 1, 2026, averaged 86,100 a day in its fiscal 2026 through about 355 terminals and more than 26,000 doors.

It is hard because every shipment is handled several times by people and forklifts, rides several trailers, and is priced before anyone measures it. Each handling is a chance to lose, damage or misroute a pallet; each trailer is filled by cube as much as by weight, so a light bulky pallet costs the carrier space it may not be paid for; and the shipper's bill of lading, written before pickup, is the carrier's only description of the freight until its own dock scale and dimensioner say otherwise. The network itself is a fixed cost: service centers, doors, trailers and scheduled linehaul run whether they are full or not, which is why LTL profitability is about density (more shipments through the same doors and miles) and why Yellow, with 308 service facilities and about 30,000 employees at the end of 2022, could fail outright within a year.

This chapter covers the network (service centers, breakbulks, relays), the life of an LTL shipment through it, the bill of lading and the PRO number, pickup and delivery and the exceptions recorded at each, service areas and interline partners, the carriers' published operating metrics, and Yellow's failure. It extends `shipments`, `handling_units` and `facilities` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). How the freight is priced (class, density, base rates, discounts, minimums, reweighs and accessorials) is [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification). Claims law (Carmack, 49 CFR 370) is Cargo Liability & Claims; the 214 and 210 messages LTL carriers send are Transportation EDI.

## How the Carriers Do It

As of November 2026, from each carrier's latest annual report (calendar 2025, except FedEx Freight's fiscal year ended May 31, 2026):

| Carrier | Network | Volume | Yield and weight | Result |
| --- | --- | --- | --- | --- |
| **ArcBest** (ABF Freight, Asset-Based segment) | 239 service centers (229 plus 10 distribution centers in its property list), more than 9,600 doors | 20,456 shipments a day; tonnage per day up 1.2% | $49.02 billed revenue per hundredweight including fuel; 1,086 pounds per shipment | $2,734.9 million revenue; operating ratio 93.7% (91.2% in 2024); about 81% of the segment's employees under the Teamsters' ABF National Master Freight Agreement through June 30, 2028 |
| **FedEx Freight** | About 355 shipping terminals, about 10 linehaul relay sites, more than 26,000 doors; nearly 17,000 tractors; about 40,000 employees | 86,100 shipments a day (59,500 Priority, 26,600 Economy) | $41.54 revenue per hundredweight; 931 pounds per shipment | $8,795 million revenue; operating margin 6.1%; spun off from FedEx on June 1, 2026 |
| **Old Dominion** | 260 service centers (240 owned); 10,184 tractors, 30,824 linehaul and 14,313 pickup and delivery trailers; 20,591 employees, none under a collective bargaining agreement | 43,762 shipments a day | $33.31 revenue per hundredweight; 1,477 pounds per shipment; $492.01 per shipment | $5,496.4 million revenue; operating ratio 75.2%; "99% on-time service and a cargo claims ratio of 0.1%" |
| **Saia** | 213 terminals with direct service to the 48 contiguous states; about 7,700 tractors and 26,500 trailers | About 35,000 shipments picked up a day; 6.16 million tons in the year | $25.50 per hundredweight with fuel, $21.58 without; 1,380 pounds per shipment; 897-mile length of haul | $3.2 billion revenue; operating ratio 89.1% (85.0% in 2024) |
| **XPO** (North American LTL) | 356 North American LTL locations (150 owned); outsourced linehaul down to 5.1% of linehaul miles in the fourth quarter | 49,420 shipments a day; about 16 billion pounds in the year | $25.39 gross revenue per hundredweight excluding fuel, up 6.0%; 1,321 pounds per shipment | $4,832 million revenue; adjusted EBITDA $1,142 million; "a damage claims ratio of 0.3%" |

Estes, R+L and other large LTL carriers are private and publish no filings; Estes publishes its integration surface instead, with APIs for transit times, PRO reservation, rate quotes, electronic bills of lading, pickups, tracking, document images and event subscriptions.

The figures don't compare directly. Revenue per hundredweight includes fuel surcharge in ArcBest's billed figure and Saia's first, and excludes it in XPO's and Saia's second; it rises as weight per shipment falls (ArcBest's 1,086-pound shipment yields far more per hundredweight than Old Dominion's 1,477-pound one); and carriers define their operating ratio and claims ratio their own way. Four patterns hold anyway:

- **Density is the business.** Saia says it gains "operating leverage by growing volume and density within our existing geography"; a network's costs are mostly fixed per door, per route and per linehaul schedule, so more shipments through the same network lower the cost of each.
- **Service quality is a published metric.** Old Dominion leads with its on-time and claims ratios; XPO reports its damage claims ratio falling from 1.2% in the fourth quarter of 2021 to 0.3%. The data behind those numbers is the exception record at every handling.
- **Linehaul is insourced where it can be.** XPO cut outsourced linehaul to 5.1% of its linehaul miles and its purchased transportation cost by more than half in 2025; purchased linehaul (rail or truckload carriers pulling the LTL carrier's trailers) is the flex capacity a network buys when its own drivers and tractors run out.
- **Union and non-union networks differ in cost and flexibility.** Old Dominion's workforce is non-union; ABF's labor costs were 52.2% of its Asset-Based revenue in 2025 under a national agreement; Yellow's last annual report put about 82% of its workforce under Teamsters agreements.

## The Network

An LTL network has three kinds of building and two kinds of trip:

- **Service centers** (end-of-line terminals) own a local area: their pickup and delivery drivers serve every shipper and consignee in it, and their docks consolidate outbound freight and break down inbound. Old Dominion: "Our service centers are responsible for the P&D of freight within their local service area."
- **Breakbulks** (hubs) sort freight between service centers that don't have enough volume for a direct trailer: a trailer from a small service center carries freight for many destinations to the breakbulk, which unloads it, sorts it and reloads it onto trailers for each destination or the next hub.
- **Relays** are where drivers swap trailers so each can return home the same night; FedEx Freight lists about 10 linehaul relay sites. A relay adds no handling, only a change of tractor and driver.
- **Pickup and delivery** (P&D, city) trips are multi-stop local routes from a service center, usually in shorter trailers or straight trucks, delivering in the morning and picking up in the afternoon.
- **Linehaul** trips run between buildings on a schedule: "Linehaul dispatchers control the movement of freight between service centers," and Old Dominion uses "scheduled routes and additional linehaul dispatches as necessary to meet our published transit times." LTL carriers count trailers in 28-foot units (FedEx Freight prices detention "per 28-foot trailer"), and federal rules require every state to allow twin 28-foot trailers on the National Network ([Truckload](/books/logistics/truckload#equipment) has the size rules), so one linehaul tractor can pull two trailers bound for different terminals and drop one at a relay or hub; Old Dominion counts its linehaul and P&D trailers separately.

In the core model, each building is a `facilities` row of kind `carrier_terminal`, a P&D route or a linehaul trailer's trip is a `loads` row of mode `pickup_delivery` or `ltl_linehaul`, and a shipment rides several loads in sequence (`load_shipments.leg`). What LTL adds is the network's own structure: which terminal serves which postal codes, which lanes run direct and which through which hub, and the cutoff for each scheduled departure. A shipment's planned route is the sequence of terminals its origin and destination service points imply, and transit time is a property of that route, published by the carrier per origin and destination (Estes's RouteGuides API "estimates transit times between origin and destination points").

## A Shipment's Path

One shipment, from the carrier's side:

1. **Pickup request.** The shipper requests a pickup by API, EDI, portal or phone, or the carrier picks up on a standing daily schedule. NMFTA's Digital LTL Council publishes a Pickup Request and Visibility standard (version 1.0.0) alongside its eBOL standard.
2. **Bill of lading and PRO.** The shipper tenders the shipment with a bill of lading, on paper or as an electronic BOL submitted by API, and the carrier assigns the PRO number that identifies the shipment inside its network for the rest of its life.
3. **Pickup.** The P&D driver loads the handling units, counts pieces against the bill, and notes any exception (a short count, visible damage) on the bill before signing it.
4. **Origin dock.** The pickup trailer is unloaded at the service center; each handling unit is scanned, weighed and dimensioned where the dock has the equipment, and loaded onto the linehaul trailer for its next terminal. This is where the carrier's measurements first disagree with the bill of lading.
5. **Linehaul and breakbulk.** The trailer departs on a scheduled run, possibly through a relay; at a breakbulk the freight is unloaded, sorted and reloaded. Each unload and load is a handling and a scan.
6. **Destination dock.** The destination service center unloads the linehaul trailer and loads delivery trucks by route and stop sequence, setting appointments where the consignee requires them.
7. **Delivery.** The driver delivers, the consignee signs the delivery receipt and notes any exceptions; the signed receipt (or a photo) is the proof of delivery that releases the freight bill.
8. **Billing.** The carrier rates the shipment from the bill of lading and its own measurements, invoices it (often as an X12 210) and keeps the delivery receipt as evidence.

Every step is a `shipment_events` row with its occurred and received times, and every handling is a fact about specific handling units on specific trailers. A shipment that misses its linehaul cutoff by twenty minutes loses a day; a pallet loaded on the wrong trailer is a misroute that surfaces at the wrong terminal the next morning. The system that knows which handling unit is on which trailer, and when it was loaded, can find both before the customer calls.

## The Bill of Lading and the PRO Number

The bill of lading is the shipper's contract with the carrier and its description of the freight. A motor carrier's bill must show the names of the consignor and consignee, the origin and destination points, the number of packages, a description of the freight, and its weight, volume or measurement where that is used to rate it (49 CFR 373.101). In LTL the bill also carries what the carrier rates from: the NMFC item and class or the handling unit dimensions for density rating, the accessorials the shipper requests (liftgate, residential delivery, appointment), any hazmat description and the declared value if the shipper wants more than the carrier's limited liability. Who pays (prepaid, collect or a third party) is on it too, and the bill-to party is often a 3PL or a freight payment provider rather than the shipper.

The **PRO number** (progressive number) is the carrier's identifier for the shipment, unique only within that carrier; the shipper's BOL number is unique only within the shipper. Carriers preprint PRO labels for shippers to apply, reserve them for software integrations (Estes's Reserve PRO API "pre-allocates Estes Shipment IDs (PROs) for future shipments"), or assign them at pickup. NMFTA's eBOL 2.1 (March 21, 2024) made the PRO the key for updates, adding methods "to update or delete eBOL data using the relevant PRO number as the key identifier," and requires carriers to "include and check digits in any PRO Number" returned in bill of lading or label images where they use them. The check digit scheme is each carrier's own, so a system that validates PROs stores the scheme per carrier, not one algorithm.

The **electronic bill of lading** standard replaced bespoke carrier BOL formats with one API shape. NMFTA's Digital LTL Council announced the eBOL pledge on October 24, 2022, asking carriers to operationalize it no later than July 20, 2023; Old Dominion describes itself as "one of over 70 affiliates" behind it, and Estes's BOL API "complies with version 2.0.1 of the DLC BOL standard." The council's catalog now lists LTL eBOL 2.1, Pickup Request and Visibility 1.0.0, Preliminary Freight Charges 1.0.0 and In-Transit Visibility 1.0.0. For a shipper's TMS or a broker, the practical consequence is one integration that works against many carriers' eBOL endpoints, with carrier-specific variations in authentication and optional fields; for a carrier, it is a standard inbound feed of shipment data before the driver arrives, which is what lets the dock plan the trailer. The playbook's [Integrations](/docs/building-blocks/integrations) covers the connection records and the [idempotency](/docs/requests/idempotency) that keeps a retried eBOL from creating a second shipment.

## Pickup, Delivery and Exceptions

At each handoff, the party taking the freight counts it and notes what is wrong, and that note is the evidence for every later claim:

- **At pickup,** the driver counts handling units and pieces against the bill and notes shortages or visible damage on it before signing. A clean bill is the carrier's acknowledgment that it received what the bill says.
- **On the dock,** each handling and scan can find an **overage** (freight with no matching bill, or more pieces than the bill), a **shortage** (fewer pieces than billed) or **damage**. Carriers call these OS&D, and the OS&D desk tries to match overages at one terminal with shortages at another.
- **At delivery,** the consignee counts and inspects, and notes exceptions on the delivery receipt: short, damaged, refused. A delivery receipt signed clear is strong evidence that the freight arrived complete and undamaged; one signed "subject to count" is weak evidence either way.

The **claims ratio** that carriers publish (Old Dominion's 0.1%, XPO's 0.3%) measures how much of that exception record turned into cargo claims, on a calculation each carrier defines for itself, so the ratios rank carriers only loosely. The claim process, liability limits and the regulation's acknowledgment and disposition deadlines belong to Cargo Liability & Claims; this chapter's job is to make the exception record exist, per handling unit, at the moment it is observed, with a photo where the driver or dock has a device.

Delivery carries its own accessorials and failure modes: appointments the consignee requires, residential and limited-access deliveries, liftgate service when there is no dock, refused or undeliverable freight, and redelivery. Each is an event that both proves service and creates a charge, priced in [Freight Class, Density & LTL Pricing](/books/logistics/freight-classification). The playbook's [Location Tracking](/docs/building-blocks/location-tracking#arrival-and-departure-detection) covers inferring arrival from positions; LTL's delivery proof is the signed receipt.

## Service Areas and Interline

Every LTL carrier publishes the postal codes it serves directly and the terminal that serves each one, and the days of service where an outlying point isn't served daily. Points outside its direct footprint are served through **interline** partners: the origin carrier hauls the shipment to an exchange point and a partner carrier delivers it, or the reverse. Saia, for example, offers direct service to the 48 contiguous states and reaches Canada and Mexico through interline carriers. Interline changes the shipment's records: it gets a second PRO from the partner, the partner's delivery receipt becomes the proof of delivery, the revenue is split between carriers, and the claims and tracking pass through the origin carrier. In the core model, the partner's leg is another load with another carrier, and the interline relationship is on the service point.

Carrier service areas also set the remote and high-cost delivery surcharges priced in the next chapter: XPO's Remote Charge has six tiers from $65.00 to $10,000, and FedEx Freight's High Cost Service Area Surcharge four, from $34 to $337, each by postal code. A rating engine that doesn't know which tier a postal code falls into can't price the shipment.

## Yellow's Failure

Yellow Corporation's failure moved terminals, freight and employees across the industry:

- **Its last annual report.** For 2022, Yellow reported operating revenue of $5,244.7 million, an operating ratio of 96.2 (98.0 in 2021), 54,860 LTL shipments and 30,460 tons a workday (down 17.2% and 19.4%), and 308 service facilities, with about 30,000 employees, "approximately 82%" of them represented by the Teamsters. It was in the middle of "One Yellow," a plan "to operate Yellow as one company, one network, under one Yellow brand," merging the YRC Freight, Holland, New Penn and Reddaway networks; phase one, in the western U.S., had integrated 89 legacy YRC Freight and Reddaway terminals in September 2022.
- **The filing.** On August 6, 2023, Yellow and its subsidiaries filed for Chapter 11 in the U.S. Bankruptcy Court for the District of Delaware, for what its press release called "the Company's planned operational wind-down" after "nearly 100 years in business"; the release blamed the Teamsters' leadership for halting its business plan, and its 8-K referred to the costs of "the Company's liquidation."
- **The terminals.** On December 12, 2023, the court approved the sale of 130 terminals to 21 buyers for $1.88 billion. Per the filing table reported by FreightWaves, XPO bought 28 for $870 million, Estes 24 for $248.7 million, Saia 17 for $235.7 million, Knight-Swift 13 for $51.3 million and ArcBest 3 for $30.2 million, among others. Saia's own 10-K says it "acquired 17 freight terminals and leases to operate an additional 11" in January 2024.

For software, Yellow's end was an exercise in what happens to records when a carrier disappears: open PROs that will never deliver, freight bills that will never be paid or disputed, claims against an estate, shippers moving tens of thousands of shipments a day to other carriers in days, and those carriers absorbing the freight into networks that had to buy doors to handle it. A routing guide that named Yellow on thousands of lanes needed a fallback for every one; a TMS that stored "the carrier" as a text label rather than a party with a status couldn't even find them. Freight Markets & Cycles covers what the lost capacity did to prices.

## How to Build It

The core model already holds the network's parts: terminals are `facilities`, P&D routes and linehaul runs are `loads`, and a shipment's trips are `load_shipments` legs. LTL adds the terminals' roles and doors, the service area map, PRO reservations, which handling unit rode which trailer, and exception records. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE facilities
  ADD COLUMN ltl_role   TEXT,            -- the terminal's place in an LTL network
  ADD COLUMN door_count SMALLINT;
ALTER TABLE facilities ADD CONSTRAINT facilities_ltl_role_check
  CHECK (ltl_role IS NULL OR ltl_role IN ('service_center', 'breakbulk', 'relay',
    'service_center_and_breakbulk')) NOT VALID;
ALTER TABLE facilities ADD CONSTRAINT facilities_door_count_check
  CHECK (door_count IS NULL OR door_count >= 0) NOT VALID;

ALTER TABLE shipments
  ADD COLUMN ltl_carrier_party_id UUID REFERENCES parties (id),  -- the carrier that issued the PRO
  ADD COLUMN pro_assigned_at      TIMESTAMPTZ,
  ADD COLUMN ebol_standard        TEXT,  -- 'dlc_ebol_2.1', 'dlc_ebol_2.0.1', 'carrier_api', 'paper'
  ADD COLUMN ltl_service          TEXT,  -- the carrier's service as tendered: standard, guaranteed
  ADD COLUMN ltl_destination_facility_id UUID REFERENCES facilities (id),  -- the delivering terminal
  ADD COLUMN delivered_clear      BOOLEAN;  -- delivery receipt signed with no exceptions
ALTER TABLE shipments ADD CONSTRAINT shipments_pro_carrier_check
  CHECK (pro_number IS NULL OR ltl_carrier_party_id IS NOT NULL) NOT VALID;

ALTER TABLE handling_units
  ADD COLUMN pieces SMALLINT;            -- cartons on the pallet, as counted at pickup
ALTER TABLE handling_units ADD CONSTRAINT handling_units_pieces_check
  CHECK (pieces IS NULL OR pieces > 0) NOT VALID;

CREATE TABLE ltl_service_points (        -- which terminal serves a postal code, and how
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id       UUID NOT NULL REFERENCES parties (id),
  country                CHAR(2) NOT NULL,
  postal_code            TEXT NOT NULL,
  serving_facility_id    UUID REFERENCES facilities (id),  -- null when a partner serves it
  service                TEXT NOT NULL CHECK (service IN ('direct', 'interline', 'not_served')),
  partner_party_id       UUID REFERENCES parties (id),  -- the interline carrier
  service_days           SMALLINT[],      -- ISO weekdays served; null: every business day
  remote_tier            TEXT,            -- the carrier's high-cost or remote tier for the code
  valid_during           TSTZRANGE NOT NULL,
  CHECK ((service = 'interline') = (partner_party_id IS NOT NULL)),
  EXCLUDE USING gist (carrier_party_id WITH =, country WITH =, postal_code WITH =,
                      valid_during WITH &&)
);

CREATE TABLE ltl_transit_lanes (         -- published transit between service points' terminals
  carrier_party_id         UUID NOT NULL REFERENCES parties (id),
  origin_facility_id       UUID NOT NULL REFERENCES facilities (id),
  destination_facility_id  UUID NOT NULL REFERENCES facilities (id),
  service_days             SMALLINT NOT NULL CHECK (service_days > 0),  -- business days
  via_facility_ids         UUID[] NOT NULL DEFAULT '{}',  -- breakbulks on the planned route
  cutoff_local             TIME,          -- last load-out for the scheduled departure, terminal time
  valid_during             TSTZRANGE NOT NULL,
  PRIMARY KEY (carrier_party_id, origin_facility_id, destination_facility_id, valid_during)
);

CREATE TABLE pro_reservations (          -- PROs reserved for an integration before pickup
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  pro_number       TEXT NOT NULL,
  reserved_for_party_id UUID NOT NULL REFERENCES parties (id),
  reserved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipment_id      UUID REFERENCES shipments (id),  -- set when used
  voided_at        TIMESTAMPTZ,
  PRIMARY KEY (carrier_party_id, pro_number)
);

CREATE TABLE load_handling_units (       -- which pallet rode which trailer, loaded and unloaded where
  load_id              UUID NOT NULL REFERENCES loads (id),
  handling_unit_id     UUID NOT NULL REFERENCES handling_units (id),
  loaded_at            TIMESTAMPTZ NOT NULL,
  loaded_facility_id   UUID REFERENCES facilities (id),  -- null: loaded at a customer's dock
  unloaded_at          TIMESTAMPTZ,
  unloaded_facility_id UUID REFERENCES facilities (id),
  trailer_position     TEXT,             -- 'nose', 'middle', 'tail', or a door-to-door sequence
  PRIMARY KEY (load_id, handling_unit_id)
);

CREATE TABLE osd_exceptions (            -- an overage, shortage, damage or refusal, as observed
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id       UUID REFERENCES shipments (id),  -- null for an overage not yet matched
  handling_unit_id  UUID REFERENCES handling_units (id),
  kind              TEXT NOT NULL CHECK (kind IN ('overage', 'shortage', 'damage', 'refused',
                      'misroute')),
  observed_at_stage TEXT NOT NULL CHECK (observed_at_stage IN ('pickup', 'origin_dock',
                      'breakbulk', 'destination_dock', 'delivery')),
  facility_id       UUID REFERENCES facilities (id),
  pieces            SMALLINT,
  noted_on          TEXT CHECK (noted_on IN ('bill_of_lading', 'delivery_receipt', 'dock_scan',
                      'driver_app')),
  description       TEXT NOT NULL,
  evidence_document_id UUID REFERENCES documents (id),  -- photo, signed receipt
  occurred_at       TIMESTAMPTZ NOT NULL,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matched_exception_id UUID REFERENCES osd_exceptions (id),  -- an overage matched to a shortage
  resolved_at       TIMESTAMPTZ
);

CREATE INDEX CONCURRENTLY shipments_carrier_pro_idx
  ON shipments (ltl_carrier_party_id, pro_number);
CREATE INDEX CONCURRENTLY load_handling_units_hu_idx ON load_handling_units (handling_unit_id);

ALTER TABLE facilities VALIDATE CONSTRAINT facilities_ltl_role_check;
ALTER TABLE facilities VALIDATE CONSTRAINT facilities_door_count_check;
ALTER TABLE handling_units VALIDATE CONSTRAINT handling_units_pieces_check;
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_pro_carrier_check;
```

The dock's most urgent question each night: which handling units unloaded at this terminal are due out on a lane whose cutoff is in the next hour and aren't on an outbound trailer yet.

```sql
SELECT hu.id AS handling_unit_id, s.pro_number, lane.destination_facility_id, lane.cutoff_local
FROM handling_units hu
JOIN shipments s ON s.id = hu.shipment_id
JOIN load_handling_units arrived ON arrived.handling_unit_id = hu.id
     AND arrived.unloaded_facility_id = $1                 -- this terminal
JOIN ltl_transit_lanes lane ON lane.carrier_party_id = s.ltl_carrier_party_id
     AND lane.origin_facility_id = $1
     AND lane.destination_facility_id = s.ltl_destination_facility_id
     AND lane.valid_during @> NOW()
WHERE s.status IN ('picked_up', 'in_transit')
  AND (NOW() AT TIME ZONE $2)::time BETWEEN lane.cutoff_local - INTERVAL '1 hour'
                                        AND lane.cutoff_local   -- $2: the terminal's zone
  AND NOT EXISTS (                                         -- not loaded out since it arrived
    SELECT 1 FROM load_handling_units out
    WHERE out.handling_unit_id = hu.id
      AND out.loaded_facility_id = $1
      AND out.loaded_at > arrived.unloaded_at)
ORDER BY lane.cutoff_local, lane.destination_facility_id;
```

The shape is the point: an arrival at a terminal without a later departure is freight at risk, and the cutoff is local time at the terminal, so it is compared in the facility's zone ([Facilities resolve time and rules](/books/logistics/logistics-business#the-core-data-model)).

Design notes:

- **The PRO is unique per carrier, and only for a while.** Key the shipment on its own UUID, index `(ltl_carrier_party_id, pro_number)`, and match inbound 214s and 210s on the PRO plus dates ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Handling units carry the scans.** A shipment is "in transit" only as a summary; the facts are which handling units were loaded and unloaded where, and a shipment with one pallet at the destination and one at a breakbulk is split, which only the handling-unit records show.
- **The service map is effective-dated.** Carriers re-map postal codes to terminals when they open or close buildings (Saia opened most of its 2025 terminals in the first quarter); an as-of lookup keeps old shipments' transit promises explainable ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Exceptions are append-only.** An overage matched to a shortage is a link between two rows, not an edit; a claim reads the original observations.
- **A carrier is a party with a status.** When a carrier stops operating, every open shipment, routing guide entry and rate agreement that names it can be found by its party ID.

## Auditing

- **The bill of lading as tendered** (paper or eBOL payload) with its hash, and every correction with who requested it and the charge for it.
- **Every handling of every handling unit:** load and unload times and terminals, so a loss or misroute can be traced to the last place it was seen.
- **Every OS&D exception** with its stage, notation, photo and resolution; these are the carrier's defense or the shipper's case in a claim.
- **The delivery receipt** as signed, with exceptions, which gates billing and starts the claim clock.
- **The service map and transit lanes in force** on the pickup date, which decide whether a guaranteed or standard transit promise was kept.

## What This Means for the System You Build

- **Model the network as data:** terminals with roles and doors, effective-dated postal code service points with interline partners, and lanes with transit days and the hubs between.
- **Track handling units on trailers,** not just shipments on loads, because LTL freight is handled, split and lost one pallet at a time.
- **Treat the PRO as a carrier-scoped identifier,** reserve and validate it per carrier, and key nothing on it.
- **Integrate eBOL once, with carrier variations configured,** and make submissions idempotent.
- **Record exceptions where they're seen,** with evidence, append-only, and compute claims ratios from the records rather than estimating them.
- **Plan for a carrier to disappear:** every reference to a carrier is a party with a status, so its open freight and its lanes can be found in minutes.

## References

**Filings**

- [ArcBest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/894405/000110465926019699/arcb-20251231x10k.htm), Asset-Based service centers, doors, revenue, operating ratio, shipments, tonnage, billed revenue per hundredweight, weight per shipment, labor share of revenue and the ABF National Master Freight Agreement
- [FedEx Freight Holding Company: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/2082247/000162828026053359/fdxf-20260531.htm), terminals, relay sites, doors, tractors, employees, Priority and Economy services, shipments, weight, yield, revenue, operating margin and the June 1, 2026 spin-off
- [Old Dominion Freight Line: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/878927/000119312526067161/odfl-20251231.htm), service centers, P&D and linehaul operations, fleet, employees and union status, revenue, operating ratio, shipments, weight, yield, on-time and claims ratios
- [Saia: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1177702/000119312526067030/saia-20251231.htm), terminals, direct and interline service, fleet, shipments, tonnage, yield, weight, length of haul, operating ratio, density as operating leverage and the Yellow terminal purchase
- [XPO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1166003/000116600326000016/xpo-20251231.htm), North American LTL revenue, shipments, weight, yield, locations, damage claims ratio, linehaul insourcing and purchased transportation
- [Yellow Corporation: Form 10-K for 2022](https://www.sec.gov/Archives/edgar/data/716006/000095017023002332/yell-20221231.htm), service facilities, employees, Teamsters share, revenue, operating ratio, tonnage and shipments, and the One Yellow network plan
- [Yellow Corporation: Form 8-K, August 7, 2023](https://www.sec.gov/Archives/edgar/data/716006/000119312523204370/d483482d8k.htm), the Chapter 11 filing in Delaware and the liquidation
- [Yellow Corporation: Press release, August 6, 2023 (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/716006/000119312523204370/d483482dex991.htm), the wind-down, its stated cause and nearly 100 years in business

**Regulations**

- [49 CFR 373.101: Motor carrier bills of lading](https://www.law.cornell.edu/cfr/text/49/373.101), required contents

**Standards and carrier documentation**

- [NMFTA: Digital LTL Council establishes eBOL standard (October 24, 2022)](https://nmfta.org/news/digital-ltl-council-establishes-new-industry-standard-for-electronic-bills-of-lading-seeks-widespread-adoption/), the eBOL pledge and its July 20, 2023 date
- [NMFTA: Digital LTL Council releases eBOL 2.1 (March 21, 2024)](https://nmfta.org/in-response-to-industry-feedback-digital-ltl-council-releases-ebol-2-1/), updates and deletes keyed by PRO, PRO check digits, SCAC and result codes
- [NMFTA DSDC: API standards](https://dsdc.nmfta.org/apis), the LTL and FTL standards and their versions
- [Old Dominion: Single-standard eBOLs (July 2023)](https://www.odfl.com/us/en/resources/freight-knowledge/odfl-blog/single-standard-ebols-july-2023.html), Old Dominion as one of over 70 affiliates behind the eBOL standard
- [Estes Express Lines: Developer portal](https://developer.estes-express.com/), RouteGuides, Reserve PRO, Rate Quote, BOL (DLC 2.0.1), Pickup, Tracking, Images and Subscription APIs
- [XPO: Tariff CNWY 199-AK.2 accessorial reference guide (effective May 18, 2026)](https://www.xpo.com/cdn/download_files/s1/p2831/CNWY_199-AK.2_Tri-Fold.pdf), remote pickup and delivery tiers
- [FedEx Freight: Surcharge quicksheet (effective January 5, 2026)](https://www.fedexfreight.com/content/dam/web/us/documents/fxf-quicksheet-2026.pdf), high cost service area tiers

**In practice**

- [FreightWaves: Judge approves Yellow terminal sales (December 12, 2023)](https://www.freightwaves.com/news/tremendous-outcome-judge-says-in-approval-of-yellow-terminal-sales), 130 terminals, 21 buyers, $1.88 billion and the purchases by buyer
