+++
title = "Parcel Networks From the Carrier Side"
nav_title = "Parcel Networks"
description = "How UPS, FedEx, USPS and Amazon run parcel networks: hubs, sortation, zones and DIM as the carrier sets them, volumes, and the 2025-2026 reshuffle."
category = "Logistics & Supply Chain Industry"
order = 2810
part = "Road and Rail"
tags = ["logistics", "parcel", "sortation", "hubs", "zones", "ups", "fedex", "usps", "data-model"]
+++

A parcel carrier sells a promise to move one package from any address to any other address in a few days, and keeps it by running a network that touches every package several times: a pickup or a drop-off, a sort at an origin facility, a linehaul by truck or plane to a hub, a sort at the hub, another linehaul, a sort at the destination facility onto a delivery route, and a delivery. UPS handled 20.8 million packages a day in 2025, 5.2 billion in the year, through about 1,000 US package facilities; Pitney Bowes counted 23.1 billion US parcels across all carriers in 2025, 6.9 billion of them by Amazon Logistics, which "surpassed" the traditional carriers to become the largest by its count.

The carrier's problem is fixed cost and flow. Buildings, sorters, aircraft and routes are built for a volume and a mix, and every package that arrives outside the plan (too large for the sorter, too light for its box, mislabeled, at a building that has closed) costs more than the network priced it at. The prices shippers see, the zones, dimensional weight and surcharges that [Shipping & Carriers](/books/commerce/shipping-and-carriers) explains from the shipper's side, are the carrier's tools for pushing volume into the shape its network handles cheaply. This chapter is the carrier's view: the four national networks and how they've changed, hub-and-spoke design, sortation and sort plans, scans as the network's event stream, zones and dimensional weight as the carrier sets them, the 2025 and 2026 reshuffle (the UPS and Amazon glide-down, FedEx's Network 2.0 and the FedEx Freight spin-off, the Postal Service's processing network), and the records a carrier or a regional parcel carrier keeps. It extends `shipments` and `facilities` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Rate shopping, labels, tracking for a merchant and delivery promises belong to Commerce ([Shipping & Carriers](/books/commerce/shipping-and-carriers#rate-shopping)); final-mile routes, proof of delivery and failed attempts for an own fleet belong to Field Operations ([Last-Mile Delivery](/books/field-operations/last-mile-delivery#from-dock-to-door)); LTL freight is [LTL Networks](/books/logistics/ltl-networks).

## How the Carriers Do It

As of November 2026, from the carriers' filings and results:

| Carrier | Scale | Network | Recent change |
| --- | --- | --- | --- |
| **UPS** | 2025: 20.8 million packages a day, 5.2 billion in the year; US Domestic average daily volume 17,510,000, down from 19,161,000 in 2024; 2026 revenue guidance about $89.7 billion | About 1,000 US package facilities (about 90 million square feet); Worldport in Louisville as its principal air hub; 295 aircraft owned or operated; about 125,000 package cars, vans, tractors and motorcycles; Ground delivers about 15 million US packages a day | Cutting Amazon volume "by more than 50% by June 2026 from 2024 levels"; 93 buildings closed for daily operations and about 48,000 operational positions reduced in 2025; SurePost insourced as Ground Saver on January 1, 2025, then a December 2025 agreement for USPS to deliver part of it from 2026 |
| **FedEx** | Fiscal 2026 (to May 31, 2026) revenue $94,720 million; "more than 18 million shipments per day" globally | Memphis as its largest sort and the center of its air network, Indianapolis as the second national air hub, regional air hubs at Fort Worth, Newark and Oakland; about 1,200 surface facilities being consolidated | Network 2.0 at about 360 US locations as of May 31, 2026, done in Canada, US completion expected by the end of 2027; FedEx Ground and Express merged into Federal Express on June 1, 2024; FedEx Freight spun off June 1, 2026 |
| **USPS** | Fiscal 2025 (to September 30, 2025): $80.5 billion operating revenue; Shipping and Packages $32.6 billion on 6.8 billion pieces, down 5.7%; GAAP net loss $9.0 billion | Delivers to every address; Delivering for America added "348 new package sorting machines," for 70 million packages a day of processing capacity, and regional processing and distribution centers | Package volume falling while revenue per piece rises; network changes credited with $422 million less transportation expense |
| **Amazon Logistics** | 6.9 billion US parcels in 2025, by Pitney Bowes's estimate, the largest of any carrier | Its own sortation and delivery stations and delivery partners; Amazon doesn't publish a parcel count of its own | Took the top spot from USPS in Pitney Bowes's 2025 index; sells delivery to merchants as Amazon Shipping ([Shipping & Carriers](/books/commerce/shipping-and-carriers#how-the-platforms-do-it)) |

Three patterns:

- **Fewer, bigger, more automated buildings.** UPS closed 93 buildings for daily operations in 2025 under "Network Reconfiguration and Efficiency Reimagined," consolidating sorts into automated facilities; FedEx's Network 2.0 consolidates sortation facilities and pickup-and-delivery routes; the Postal Service built regional centers and hundreds of new package sorters. Each move changes which facility a package passes through, so sort plans, zone charts and transit times all change with it.
- **The biggest customer became a competitor.** Amazon was about 10.6% of UPS's 2025 revenue, and UPS chose to shed more than half of that volume; Pitney Bowes has UPS's share of parcel revenue falling from 34% in 2024 to 31.6% in 2025 while Amazon Logistics carries more parcels than any other network.
- **Ground and air networks merged.** FedEx's 2024 consolidation made Ground and Express "a single company operating a unified, fully integrated air-ground express network," and Network 2.0 puts their pickups and deliveries on the same routes; UPS has run one integrated network for longer. The separate networks that once justified separate services now share buildings, sorters and trucks.

## Hub and Spoke

A national parcel network is a hub-and-spoke system with several layers. Pickups and drop-offs flow into local facilities (UPS centers, FedEx stations, post offices, Amazon delivery stations) that sort outbound packages by direction and send them to a hub; hubs sort everything from everywhere to the outbound trailers or aircraft for each destination region; destination facilities sort inbound packages onto delivery routes. FedEx describes Memphis as its largest sorting facility and the center of its hub-and-spoke system and air network, with Indianapolis as a second national hub and regional hubs beneath; UPS names Worldport in Louisville as its principal hub with international hubs in Germany, China and Hong Kong.

Two networks run on the same buildings:

- **Air** packages (next day, two day) ride a nightly bank of flights into the air hub and out again, sorted in a few hours; the sort window is fixed by flight times, and a package that misses it waits a day.
- **Ground** packages ride trucks between ground hubs over one to five days, sorted at each hub they pass; the network is planned around trailer loads and sort windows on each lane.

The design choices behind a network are fixed costs against distance: more hubs mean shorter linehauls and fewer touches per package but more buildings; bigger hubs mean more sort capacity per dollar but longer drives to reach them. For the software, the result is a graph of facilities and lanes with schedules, and a package's planned path through it is computed, not stored per package.

## Sortation and the Sort Plan

A sort is the scheduled operation in a facility that takes inbound packages, reads each label, and diverts each package to the outbound door, chute or route bag its next leg leaves from. The sort plan says, for a facility and a sort window, where each destination goes next: packages for ZIP codes beginning 606 go to door 14 for the Chicago hub trailer; packages for routes 101 through 140 go to the chutes for those routes. Sort plans change every time the network changes: a closed building, a new hub, a peak-season overflow facility, a route reshuffle.

What makes a package expensive in a sort is that it can't ride the sorter. Automated sorters take packages in a size and weight range, and anything outside it (long, heavy, irregular, unboxed) is handled by people and equipment off the main line. That is what the shipper sees as Additional Handling and Oversize charges and what the carrier sees as non-conveyable volume; the thresholds are published in each carrier's service guide and covered from the shipper's side in [Zones, Surcharges and Rate Changes](/books/commerce/shipping-and-carriers#zones-surcharges-and-rate-changes).

**Scans are the network's event stream.** Each touch generates a scan: picked up, arrived at facility, departed facility, sorted, loaded, out for delivery, delivered, exception. A package passing through four buildings generates a dozen or more scans, each with a facility, a time and a reason code; across 20 million packages a day, that is the largest event stream in the business. The shipper's tracking page is a normalized subset ([Tracking Events](/books/commerce/shipping-and-carriers#tracking-events)); the carrier's own use is operational: a package scanned in at a hub but not out by the sort's end is a missort or a miss, and every package expected on a trailer but not scanned at the destination is a loss investigation.

The sort plan as data:

| Facility | Sort window | Destination key | Next | Valid from |
| --- | --- | --- | --- | --- |
| Origin station A | Evening outbound | ZIP3 606 to 608 | Ground hub CHI, trailer door 14 | Week of the network change |
| Origin station A | Evening outbound | Next-day air, any | Air hub, aircraft container 3 | Same |
| Ground hub CHI | Night sort | ZIP5 60614 | Destination station B, trailer 22 | Same |
| Destination station B | Pre-load | Route 117 | Route bag 117 | Same |

Each row is a rule with an effective date, and a package's path is the chain of rules it matches from origin to delivery ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)). When a building closes, the plan for every facility that fed it changes on the same night, which is why the plan is versioned as a whole and published to every sorter and scanner at once.

## Zones and Dimensional Weight as the Carrier Sets Them

A carrier prices distance by zone so that a rate table has a handful of columns instead of a price per pair of addresses. The Postal Service's zones are the clearest because they're published as rules: each 3-digit ZIP code area has a computed centroid, and "postal zones are based on the distance between these units of area." Zone 1 covers pieces within the same 3-digit pair or between pairs whose centroids are up to 50 miles apart; zones 2 through 7 extend to radii of "about" 150, 300, 600, 1,000, 1,400 and 1,800 miles; zone 8 is everything beyond, and zone 9 covers the freely associated states (DMM 608.9.4.2). The zone chart that results is published per origin 3-digit prefix, and the Postal Service's own chart tool says "the first 3-digits of your destination ZIP Code determine the zone," with flagged 5-digit exceptions; the current chart is effective November 1, 2026. UPS and FedEx publish zone charts per origin ZIP range on their own schemes.

Computing a postal-style zone from two centroids is a distance and a lookup:

```go tab="Go"
// Zone bands per DMM 608.9.4.2: upper radius in miles for zones 1 through 7;
// beyond 1,800 miles is zone 8. Zone 9 (freely associated states) is a destination list.
var zoneLimits = []struct {
	zone  int
	miles float64
}{{1, 50}, {2, 150}, {3, 300}, {4, 600}, {5, 1000}, {6, 1400}, {7, 1800}}

type Centroid struct{ Lat, Lon float64 }

func PostalZone(originZIP3, destZIP3 string, c map[string]Centroid) (int, error) {
	if originZIP3 == destZIP3 {
		return 1, nil
	}
	o, ok1 := c[originZIP3]
	d, ok2 := c[destZIP3]
	if !ok1 || !ok2 {
		return 0, fmt.Errorf("no centroid for %s or %s", originZIP3, destZIP3)
	}
	miles := haversineMiles(o, d)
	for _, z := range zoneLimits {
		if miles <= z.miles {
			return z.zone, nil
		}
	}
	return 8, nil
}

func haversineMiles(a, b Centroid) float64 {
	const r = 3958.8 // mean Earth radius in miles
	rad := math.Pi / 180
	dLat := (b.Lat - a.Lat) * rad
	dLon := (b.Lon - a.Lon) * rad
	h := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(a.Lat*rad)*math.Cos(b.Lat*rad)*math.Sin(dLon/2)*math.Sin(dLon/2)
	return 2 * r * math.Asin(math.Sqrt(h))
}
```

```rust tab="Rust"
use std::collections::HashMap;

/// Upper radius in miles for zones 1 through 7 (DMM 608.9.4.2); beyond is zone 8.
const ZONE_LIMITS: [(u8, f64); 7] =
    [(1, 50.0), (2, 150.0), (3, 300.0), (4, 600.0), (5, 1000.0), (6, 1400.0), (7, 1800.0)];

#[derive(Clone, Copy)]
pub struct Centroid { pub lat: f64, pub lon: f64 }

pub fn postal_zone(origin: &str, dest: &str, c: &HashMap<String, Centroid>) -> Option<u8> {
    if origin == dest {
        return Some(1);
    }
    let (o, d) = (c.get(origin)?, c.get(dest)?);
    let miles = haversine_miles(*o, *d);
    Some(ZONE_LIMITS.iter().find(|(_, m)| miles <= *m).map_or(8, |(z, _)| *z))
}

fn haversine_miles(a: Centroid, b: Centroid) -> f64 {
    let r = 3958.8_f64;
    let (lat1, lat2) = (a.lat.to_radians(), b.lat.to_radians());
    let d_lat = (b.lat - a.lat).to_radians();
    let d_lon = (b.lon - a.lon).to_radians();
    let h = (d_lat / 2.0).sin().powi(2) + lat1.cos() * lat2.cos() * (d_lon / 2.0).sin().powi(2);
    2.0 * r * h.sqrt().asin()
}
```

The function shows the rule; a carrier publishes the result as a chart, and a system that rates packages should load the published chart (with its effective date and 5-digit exceptions) rather than recompute it, because the chart is what the carrier bills on. The DMM's "about" and its "in whole or in part within a radius" wording mean a recomputation from centroids can disagree with the published chart at the edges.

**Dimensional weight is the carrier pricing cube.** A trailer or an aircraft container fills by volume before it fills by weight for light packages, so the carrier bills the greater of actual weight and cubic size divided by a divisor. All three national carriers use 139 as of 2026, the Postal Service since July 12, 2026; the arithmetic, thresholds and rounding rules are in [Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight). From the carrier's side, the divisor is a lever: a lower divisor raises billable weight on light, bulky packages, the ones that consume the most trailer space per dollar, and every change to it moves revenue without changing a rate table. A carrier that measures packages in its network bills an adjustment when the measured size differs from the shipper's declared one, which is why the shipper side keeps both a quoted and an adjusted cost.

## Volumes and the 2025 to 2026 Reshuffle

The national parcel market grew while the incumbents shrank. Pitney Bowes estimates US parcel volume at 23.1 billion in 2025, up 3.3%, and projects 31 billion by 2031, with the volume of carriers outside the named leaders up 127%, driven mainly by Shein and Temu shipments; inside that growth:

- **UPS shed volume on purpose.** Its US Domestic average daily volume fell from 19.161 million in 2024 to 17.510 million in 2025 as it reduced Amazon volume, and its fourth-quarter US Domestic revenue per piece rose 8.3%. It closed 93 buildings for daily operations and reported about $3.5 billion of planned cost savings in 2025, and said "upon completion of the Amazon glide-down, 2026 will be an inflection point." It brought its SurePost product in-house as Ground Saver on January 1, 2025, then agreed in December 2025 that the Postal Service would deliver part of Ground Saver and Mail Innovations volume from 2026.
- **FedEx merged its networks and spun off freight.** One FedEx (June 1, 2024) merged FedEx Ground into Federal Express; Network 2.0 had reached about 360 US locations by May 31, 2026. FedEx Freight, its LTL business, became a separate NYSE company (FDXF) on June 1, 2026: FedEx distributed 80.1% of the shares, one for every two FedEx shares held on May 15, 2026, and must dispose of its retained 19.9% within 24 months ([LTL Networks](/books/logistics/ltl-networks) covers the LTL side).
- **The Postal Service lost package volume and raised price.** Shipping and Packages volume fell 5.7% to 6.8 billion pieces in fiscal 2025 while revenue rose 1.0% to $32.6 billion, and controllable loss grew on "lower than expected revenues from our package business."
- **Amazon became the largest network.** Pitney Bowes puts Amazon Logistics at 6.9 billion parcels, ahead of the Postal Service; its index is a third-party estimate, and Amazon publishes no parcel count of its own. <!-- source-gap: logistics-parcel-networks-amazon-volume | secondary | Amazon Logistics 2025 US parcel volume and its rank among carriers | closes with: an Amazon filing or release stating its own US parcel volume | checked: 2026-11-22 -->

For a shipper, each of these is a rate, transit-time and label change ([Shipping & Carriers](/books/commerce/shipping-and-carriers#carrier-apis)); for a carrier, regional carrier or software vendor building on a carrier's network, each is a sort plan, zone chart, facility list and service calendar change, published at a date, and every system that keys a route, a cutoff or a transit time on a building that closed breaks that night.

## How to Build It

The core `shipments` row is one package with a tracking number for parcel (mode `parcel`); `facilities` holds the carrier's buildings. A carrier, a regional carrier or a delivery network adds the facilities' roles, the sort plans, the scan stream, the zone charts and the package's measured and billed dimensions. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE facilities
  ADD COLUMN parcel_role       TEXT,     -- the building's place in a parcel network
  ADD COLUMN daily_sort_capacity INT,    -- packages per day, as planned
  ADD COLUMN network_valid     TSTZRANGE;  -- when it carries packages; closures end it
ALTER TABLE facilities ADD CONSTRAINT facilities_parcel_role_check
  CHECK (parcel_role IS NULL OR parcel_role IN ('air_hub', 'ground_hub', 'sort_center',
    'origin_station', 'delivery_station', 'retail_counter', 'access_point')) NOT VALID;

ALTER TABLE shipments
  ADD COLUMN tracking_number  TEXT,      -- the carrier's package identifier
  ADD COLUMN service_code     TEXT,      -- the carrier's own service, e.g. ground or next-day air
  ADD COLUMN zone             SMALLINT,  -- as rated, from the chart in force
  ADD COLUMN declared_dims_mm INT[3],    -- as the shipper declared on the label
  ADD COLUMN measured_dims_mm INT[3],    -- as the carrier's dimensioner measured
  ADD COLUMN measured_weight_g BIGINT,
  ADD COLUMN billable_weight_g BIGINT;   -- max of actual and dimensional, per the carrier's rule

CREATE TABLE parcel_sort_plans (         -- a versioned plan, published as a whole
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  version      TEXT NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  published_at TIMESTAMPTZ,
  UNIQUE (carrier_party_id, version)
);

CREATE TABLE parcel_sort_rules (         -- where a package goes next from a facility's sort
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  parcel_sort_plan_id UUID NOT NULL REFERENCES parcel_sort_plans (id),
  facility_id         UUID NOT NULL REFERENCES facilities (id),
  sort_window         TEXT NOT NULL,     -- 'twilight', 'night', 'preload', 'day', as the facility names them
  service_class       TEXT NOT NULL CHECK (service_class IN ('air', 'ground', 'any')),
  destination_key     TEXT NOT NULL,     -- 'zip3:606', 'zip5:60614', 'route:117'
  next_facility_id    UUID REFERENCES facilities (id),  -- null at the last sort
  outbound_ref        TEXT NOT NULL,     -- door, chute, trailer, aircraft container or route
  priority            SMALLINT NOT NULL DEFAULT 100,  -- longer, more specific keys win
  UNIQUE (parcel_sort_plan_id, facility_id, sort_window, service_class, destination_key)
);

CREATE TABLE parcel_scans (              -- every touch of every package, append-only
  id            UUID NOT NULL DEFAULT uuidv7(),
  shipment_id   UUID NOT NULL,           -- the package; no FK on the hot partitioned path
  facility_id   UUID REFERENCES facilities (id),
  scan_type     TEXT NOT NULL CHECK (scan_type IN ('pickup', 'arrival', 'induct', 'sort',
                  'load', 'departure', 'unload', 'out_for_delivery', 'delivered',
                  'attempted', 'exception', 'return')),
  reason_code   TEXT,                    -- the carrier's exception or status code
  device_ref    TEXT,                    -- sorter, tunnel reader or handheld
  outbound_ref  TEXT,                    -- the door, trailer or route it was diverted to
  occurred_at   TIMESTAMPTZ NOT NULL,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);      -- monthly partitions; tens of millions of rows a day

CREATE TABLE parcel_zone_charts (        -- a carrier's published zone chart, as published
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  origin_key       TEXT NOT NULL,        -- 'zip3:606', or the carrier's origin range
  destination_key  TEXT NOT NULL,        -- 'zip3:100' or 'zip5:10001' for an exception
  zone             SMALLINT NOT NULL CHECK (zone BETWEEN 1 AND 99),
  valid_during     TSTZRANGE NOT NULL,
  document_id      UUID REFERENCES documents (id),  -- the chart file as downloaded
  EXCLUDE USING gist (carrier_party_id WITH =, origin_key WITH =, destination_key WITH =,
                      valid_during WITH &&)
);

CREATE INDEX CONCURRENTLY shipments_tracking_number_idx ON shipments (tracking_number);
ALTER TABLE facilities VALIDATE CONSTRAINT facilities_parcel_role_check;
```

The carrier's nightly question at each hub, which packages arrived but haven't left by the end of the sort, reads off the scans:

```sql
SELECT a.shipment_id, a.occurred_at AS arrived, s.tracking_number
FROM parcel_scans a
JOIN shipments s ON s.id = a.shipment_id
WHERE a.facility_id = $1
  AND a.scan_type IN ('arrival', 'unload', 'induct')
  AND a.occurred_at >= $2                 -- the sort window's start
  AND NOT EXISTS (
    SELECT 1 FROM parcel_scans d
    WHERE d.shipment_id = a.shipment_id
      AND d.occurred_at > a.occurred_at
      AND (d.facility_id <> $1 OR d.scan_type IN ('load', 'departure', 'out_for_delivery')))
ORDER BY a.occurred_at;
```

Design notes:

- **Scans are not milestones.** `parcel_scans` is the carrier's high-volume operational stream, partitioned by time and kept for the carrier's claims and audit window; the core `shipment_events` gets the normalized milestones (picked up, departed, out for delivery, delivered) that customers and partners read ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).
- **Sort plans are versioned as a whole.** A network change takes effect for every facility on the same night; the plan has one version and validity, and a package's diversion records the version it used.
- **Load the published zone chart.** Zones are billing data the carrier publishes; computing them is a check, not a source.
- **Keep declared, measured and billable dimensions.** The difference between the shipper's declaration and the dimensioner's reading is a billing adjustment and, from the shipper's side, a dispute; both sides need all three.
- **Buildings have validity.** A facility that closes ends its `network_valid` range rather than being deleted, so historic scans and plans still resolve.
- **Emit what the network needs.** `package.missorted`, `package.missed_sort`, `facility.closed`, `sort_plan.published` and `zone_chart.published` drive operations, customer notices and partner integrations ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every scan** with its facility, device, time and reason, for the claim window, because a loss claim is decided by the last scan.
- **Every sort plan version** and when it was published to each facility.
- **Every zone chart and service calendar** as published, with effective dates, so any invoice can be re-rated.
- **Declared and measured dimensions and weights** per package, and every billing adjustment made from them.
- **Facility openings and closures** with dates, and the plan and chart versions they triggered.

## What This Means for the System You Build

- **Model the network as facilities, lanes and versioned sort plans,** and compute a package's path rather than storing it.
- **Keep scans as an append-only, partitioned stream** separate from the customer-facing milestones.
- **Store zone charts as published data with effective dates,** and use them to rate; recomputed zones are a check.
- **Record declared, measured and billable dimensions** on every package, because dimensional weight is billed on the measurement.
- **Give facilities validity ranges** so closures don't erase history.
- **Expect the network to change under you:** building closures, merged networks, spun-off businesses and new final-mile partners arrive as dated changes to plans, charts and calendars.
- **Link the shipper and final-mile views** from Commerce and Field Operations instead of rebuilding them.

## References

**Filings and results**

- [UPS: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1090727/000162828026008432/ups-20251231.htm), facilities, hubs, aircraft and vehicles, packages per day and per year, Ground's daily volume, Amazon's share of revenue and the reduction by June 2026, Network Reconfiguration and Efficiency Reimagined savings, Ground Saver and the USPS final-mile agreement
- [UPS: Fourth quarter 2025 results, Form 8-K Exhibit 99.1 (January 27, 2026)](https://investors.ups.com/sec-filings/all-sec-filings/content/0001628280-26-003510/exhibit991-earningspressre.htm), US Domestic average daily volume, revenue per piece, buildings closed, positions reduced, the glide-down and 2026 guidance
- [FedEx: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1048911/000104891126000105/fdx-20260531.htm), revenue, shipments per day, hubs, Network 2.0 locations and timeline, surface facility consolidation, the One FedEx merger and the Freight spin-off
- [FedEx: Form 8-K Exhibit 99.1 on the FedEx Freight separation](https://www.sec.gov/Archives/edgar/data/0001048911/000110465926068519/tm2616055d2_ex99-1.htm), completion date, ticker, exchange, distribution ratio, retained stake and disposal window
- [USPS: Fiscal year 2025 results (November 14, 2025)](https://about.usps.com/newsroom/national-releases/2025/1114-usps-reports-fiscal-year-2025-results.htm), operating revenue, Shipping and Packages revenue and volume, net and controllable loss, and transportation savings

**Postal rules and plans**

- [USPS Domestic Mail Manual 608: Postal Information and Resources](https://pe.usps.com/text/DMM300/608.htm), 3-digit centroids and the zone definitions
- [USPS: Domestic zone chart](https://postcalc.usps.com/DomesticZoneChart), destination 3-digit prefixes, 5-digit exceptions and the November 1, 2026 chart
- [USPS: Delivering for America plan highlights](https://about.usps.com/what/strategic-plans/delivering-for-america/details.htm), regional processing and delivery centers, sorting and delivery centers, and the new package sorters and capacity

**Industry**

- [Pitney Bowes: Parcel Shipping Index](https://www.pitneybowes.com/us/shipping-index.html), 2025 US parcel volume and growth, Amazon Logistics' volume and rank, UPS's revenue share, other carriers' growth and the 2031 projection
