+++
title = "Fleet, Inventory & Safety"
description = "Vans and box trucks as vehicles, warehouses and workplaces: CMV thresholds, DVIR and hours, telematics, safety scores, van stock, hazmat, PPE and incidents."
category = "Field Operations Industry"
order = 1515
part = "In the Field"
tags = ["field-operations", "fleet", "telematics", "inventory", "dot", "osha", "safety"]
+++

A service van is four things at once. It's a vehicle on public roads, and above certain weights a regulated commercial one. It's a warehouse, carrying thousands of dollars of parts and product that the business has to account for. It's a hazardous materials container, because pesticides, refrigerants, pool chemicals and fuel ride in it every day. And it's a workplace, where an employee spends most of the shift and where most of the injuries that matter happen. A field operations platform that treats the van as a line in an asset list misses all four. One that models it properly can tell a dispatcher which technician can legally take a job, tell the warehouse what to load tonight, tell an inspector what was on board, and tell an insurer what happened in the seconds before a crash.

## When a Service Van Is a Commercial Motor Vehicle

The federal motor carrier rules apply to a **commercial motor vehicle** (CMV) used in interstate commerce, and the definition in 49 CFR 390.5 has four prongs: a gross vehicle weight rating or gross combination weight rating (or actual weight) of 10,001 pounds or more, whichever is greater; designed or used to carry more than 8 passengers including the driver for compensation; more than 15 passengers not for compensation; or carrying hazardous materials in a quantity that requires placards.

The weight prong is the one service companies trip over. A light pickup isn't a CMV, but the same truck towing a spray rig or equipment trailer can cross 10,001 pounds combined, and a box truck often does on its own, so a furniture or appliance delivery fleet should classify each truck before its first route. A commercial driver's license is a separate, higher threshold: 26,001 pounds, 16 or more passengers, or placarded hazardous materials at any size (49 CFR 383.5). States apply their own versions of these rules to intrastate operations, so check current state law before assuming a vehicle that never crosses a state line is exempt.

Once a vehicle is a CMV, a set of obligations attach, and each one is a record the platform should keep or integrate:

| Rule | What it requires | What the system records |
| ---- | ---------------- | ----------------------- |
| Medical certification (49 CFR 391.45) | Drivers certified physically qualified within the preceding 24 months; 12 months for some conditions | Certificate dates per driver, expiry alerts, block assignment to CMVs after expiry |
| Hours of service, short-haul (49 CFR 395.1(e)(1)) | Drivers within a 150 air-mile radius (172.6 statute miles) who return and are released within 14 consecutive hours are exempt from records of duty status; the carrier keeps time records for 6 months | Report-in time, release time and total on-duty hours per day, which a field app clock already captures |
| Records of duty status and ELDs (49 CFR 395.8) | Drivers outside the short-haul exception log duty status; paper logs allowed for drivers needing records on 8 or fewer days in any 30-day period | Integration with an ELD provider rather than building one |
| Driver vehicle inspection reports (49 CFR 396.11) | A written report at the end of each day's work listing defects; none needed when no defect is found; defects repaired or certified before the vehicle runs again; 3 months' retention; not required of a carrier operating only one CMV | Defects, repair certification, and the driver's review |
| Periodic inspection (49 CFR 396.17) | Each CMV inspected within the preceding 12 months, with proof carried on the vehicle | Inspection dates and documents per vehicle |
| Hand-held phones (49 CFR 392.82) | No hand-held mobile phone use while driving a CMV, including while stopped in traffic; carriers may not allow or require it | App design: nothing that demands a tap while the vehicle moves |

The last row is an app requirement disguised as a driving rule. A technician app that pops up a "confirm your next stop" dialog or expects a dispatcher's message to be acknowledged while the van is moving is asking a CMV driver to break the law, and it's a distraction risk for every other driver too. Gate interactions on vehicle motion (from telematics or the phone's activity recognition), and let voice and auto-advance handle the rest.

## The Telematics Market

Fleet telematics vendors sell the hardware (a vehicle gateway on the diagnostic port, a dash camera) and a platform that turns its signals into locations, trips, hours of service logs, inspections, fuel tax reports and safety events. Field service platforms integrate with them rather than compete. The four most commonly integrated expose very different APIs:

| Vendor | Getting data out | Compliance surfaces | Safety | Notes |
| ------ | ---------------- | ------------------- | ------ | ----- |
| **Samsara** | REST API, a vehicle stats feed and webhooks | HOS clocks, logs and daily logs; DVIRs created, read and resolved through the API; IFTA reports | Harsh events, speeding and crash from the gateway; AI dash cam events with video; driver and vehicle safety scores | API and webhook access depends on license tier |
| **Motive** | Webhooks over HTTP POST or to SQS and SNS | HOS logs and violation webhooks; inspection report webhooks for DVIRs; IFTA reports | Driver performance and speeding event webhooks | |
| **Geotab** | `GetFeed` with a version token that returns only changes, resending modified old records with a newer version | Duty status logs, DVIR logs, fuel tax detail | Driver Safety Scorecard; a predictive Collision Risk model | Default limit of 60 requests a minute; some record types not guaranteed in chronological order |
| **Verizon Connect** | REVEAL Vehicle API syncing drivers, vehicles and groups with back-office systems | Not published | Not published | Odometer and engine-hours updates can be backdated up to 30 days |

Two patterns in these APIs shape any integration. First, the feeds resend: Geotab explicitly resends modified data, and Samsara's HOS logs reflect later edits by drivers and carriers, so consumers must upsert by the vendor's ID and version rather than append. Second, delivery is at-least-once: retries mean duplicates, so webhook handlers must be idempotent and verify each vendor's signature scheme; signing, retries and replay are in [Webhooks](/docs/api-design/webhooks) and [Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent).

## Integrating Telematics Into Field Operations

The useful joins are between the vehicle's world and the job's world:

- **Driver to vehicle, over time.** Telematics knows the vehicle; the field platform knows the technician. Keep an effective-dated assignment (who drove which van from when to when, per [Temporal Data](/docs/database/temporal-data)), because every downstream question (who was speeding, whose stock is this, whose hours are these) depends on it.
- **Arrival from two sources.** The technician taps "arrived" on the phone; the vehicle stops inside the property's geofence. How geofence arrival is decided and recorded for a visit is in [Arrival and Departure Detection](/books/field-operations/dispatch#arrival-and-departure-detection), and why phone and vehicle are kept as separate sources is in [Combining Sources](/docs/architecture/location-tracking#combining-sources). What fleet adds is the vehicle side of the join: Samsara has route stop arrival and departure webhooks, and Route4Me records both mobile and telematics distance per route, so a van parked at a customer for 3 minutes on a 30-minute service shows up against the tap.
- **Hours as a scheduling constraint.** Samsara documents a dispatch pattern that reads each driver's remaining drive, shift and cycle time and assigns a load only if the remaining time covers the route. For CMV drivers outside the short-haul exception, dispatch should check remaining drive and on-duty time the same way before inserting or redistributing work ([Dispatch & the Day of Service](/books/field-operations/dispatch)).
- **Mileage.** Odometer readings feed vehicle maintenance, fuel tax reporting and mileage reimbursement. Take them from the vehicle, not the phone.
- **Off the clock.** A vehicle taken home is tracked at night unless the platform says otherwise. Samsara exposes personal conveyance settings; whatever the vendor, decide what location is retained outside working hours, who can see it, and tell drivers.

Vehicles are their own table, not a kind of resource: the scheduler books technicians and crews, and the vehicle is what they drive. The core model in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model) has no vehicle table, so this chapter defines it in [How to Build It](#how-to-build-it), with an effective-dated driver assignment.

## Safety Scores and Dashcams

A business that drives all day carries crash risk all day, and telematics vendors compete on safety programs:

- **Samsara's** gateway accelerometer detects harsh acceleration, braking, turning, speeding and crashes; its AI dash cams add rolling stops, following distance, distracted driving and collision warnings, with video download URLs on the events. Without a Safety license, "no video safety events are generated," and safety scores need a higher tier.
- **Geotab's** Driver Safety Scorecard computes a 0 to 100 score from six weighted rules (below), with default risk bands of Low 90–100, Mild 75–90, Medium 60–75 and High 0–60. Its separate Collision Risk feature uses machine learning to predict the chance of a future collision.
- **Motive** emits driver performance and speeding events by webhook.

| Geotab default rule | Weight |
| ------------------- | ------ |
| Hard acceleration | 10% |
| Harsh braking | 10% |
| Harsh cornering | 10% |
| Seatbelt | 20% |
| Speeding | 20% |
| Excessive speeding (suggested above 85 mph) | 30% |

A score is a configured formula, so treat it like one: version the weights and thresholds, record which version produced each score, and never compare scores across a configuration change without saying so. The value is in the workflow around the score, not the number: an event is reviewed (many harsh-brake events are a driver avoiding someone else's mistake), the driver can see and contest it, coaching is recorded, and repeated patterns trigger action. Driver-facing cameras record employees' faces and conversations; tell drivers what's recorded and when, set a retention period for video, and check current state law on recording and employee monitoring before turning them on.

## Van Stock Is Inventory

A technician's van holds parts, product and equipment, and the business needs to know what's on it, what was used where, and what to reload. What's on board depends on the trade: a pest or lawn truck carries concentrate by the gallon and bait by the case; an HVAC van carries capacitors, contactors, motors, filters and refrigerant cylinders; a plumbing van carries fittings, valves, cartridges and sometimes a water heater. The value per van differs by an order of magnitude, and so does the cost of a part that isn't there when the technician needs it. The enterprise suites model this as general inventory, with the van as a location:

- **Dynamics 365 Field Service** defines a warehouse as "any company location that holds inventory," including technician trucks, and recommends associating a warehouse with each bookable resource so work order product usage deducts from the right place. It tracks quantity available, allocated, on hand (available plus allocated) and on order. A work order product that's estimated and allocated reserves stock; marking it used deducts it. Technicians can transfer stock truck to truck on mobile. "All inventory transactions are recorded in inventory journals," which serve as the ledger and as the integration point for ERP systems. And "Field Service doesn't enforce non-negative inventory by default."
- **Salesforce Field Service** uses product items, "the stock of a particular product at a particular location," where a location can be a warehouse, a service vehicle or a work site. Products required on work orders and work types let technicians "arrive prepared," products consumed decrement inventory, and product item transactions are generated automatically, alongside product requests, transfers, shipments, return orders and serialized products.
- **ServiceTitan** truck replenishment builds from usage: a material added to an invoice appears on a Materials Used list, which the office turns into purchase orders grouped by vendor, by vendor and truck, or by vendor, truck and job, tracked from Pending to Sent to Received.
- **FieldRoutes** capacity tracking treats product as a route constraint (for example, gallons of mosquito spray against a route's capacity of 100 gallons), warning when planned stops exceed what the vehicle carries.
- **PestPac** markets tracking materials from distributor to warehouse to technician, with automatic unit conversion and an expected usage report from scheduled jobs.

![Van stock as a ledger: stock is received from a supplier into a branch warehouse, transferred to a van that is itself a warehouse, and used on a visit; returns and damaged items go back to the warehouse; usage or falling below a minimum triggers restocking; every movement, including counts and adjustments, is one row in an inventory journal that is never edited.](/diagrams/fo-fleet-and-safety-van-stock.svg "The van is just another warehouse. Quantities are derived from an append-only journal of movements, so every can and coil on board can be traced to where it came from and where it went.")

Build it as a ledger, as Dynamics does. Quantity on hand per location is a sum of movements, never a field someone types over. Each movement records the item from the shared catalog, quantity and unit, the from and to locations, the reason (receipt, transfer, used on a visit, return, count adjustment, damage), the actor and device, for regulated products the lot and registration number, and for serialized items (a compressor, a water heater, a refrigerant cylinder) the serial, so the unit installed at a property can be traced back to its receipt for a warranty claim. A count that disagrees with the ledger posts an adjustment with a reason rather than overwriting the quantity, so shrinkage is visible. Units deserve care: concentrate is bought by the gallon and applied by the ounce in a mix. PestPac markets automatic unit conversion for this reason, and FieldRoutes' chemical tracking report warns that inventory valuation depends on correct units and default dilution rates.

Whether to allow negative stock is a real choice. Dynamics allows it by default, which keeps the technician working when the books are wrong; the cost is that negative balances must be reviewed. The alternative, blocking usage the books can't cover, keeps the ledger clean and stops the technician in a customer's driveway. My default is to allow it with an immediate exception, and always for regulated products, because blocking an application record because the books say the product isn't there produces a worse record, not a better one.

## Restocking

There are three common triggers, and most businesses combine them:

- **From usage**, as ServiceTitan does: whatever was used today gets reloaded tonight.
- **Par levels**: a minimum and maximum per product per van, with a pick list to bring each van back to maximum when it falls below minimum.
- **From the schedule**: tomorrow's visits imply tomorrow's products, which is what PestPac's expected usage report and FieldRoutes' route capacity point at. This is the most accurate for recurring service, because the route is known in advance.

The output is a pick list per van for the warehouse, a transfer per pick when it's loaded, and purchase orders when the warehouse itself runs low. Close the loop with periodic counts on the van, scanned where products are barcoded.

## Carrying Regulated Products

Many products a service technician carries (pesticides, pool chlorine and acid, refrigerant and brazing gases) are hazardous materials under the Department of Transportation rules, but small amounts carried for the business's own work can qualify as **materials of trade** under 49 CFR 173.6, which replaces most hazmat shipping requirements with lighter ones. For most classes, the per-package limit is 30 kg or 30 L for Packing Group II and III materials (0.5 kg or 0.5 L for Packing Group I); compressed gases in Divisions 2.1 and 2.2 qualify in cylinders of no more than 100 kg (220 pounds) gross weight each; the aggregate gross weight of all materials of trade on one vehicle "may not exceed 200 kg (440 pounds)"; packages must be leak-tight or sift-proof, securely closed, secured against shifting and in the manufacturer's original packaging or an equally strong one; non-bulk packages need a common or proper shipping name; and the vehicle operator must be told that hazardous material is on board. Above those limits the full hazmat rules apply, and placarding makes the vehicle a CMV regardless of weight.

States add storage and transport rules for pesticides, and they don't agree on the details. Two examples:

- **Arizona** requires pesticides on an unattended service vehicle to be in locked storage (or kept in sight under the applicator's control) and secured in a locked space while transported (Ariz. Admin. Code R3-8-302). Each service vehicle must carry material that can absorb a spill or leak of at least one gallon, a container large enough to hold the contaminated material, and a locking storage space designed to keep containers from being damaged in transit (R3-8-305).
- **Utah** requires a spill kit in each pesticide service vehicle, with specified contents for vehicles carrying concentrate or mixed solution, and containers secured with racks, bracing, chocks or tie-downs, not wedged against the van's walls (Utah Admin. Code R68-7-19).

Other states differ; check current state law for every state a branch operates in, and keep the checklist per jurisdiction rather than per company.

For the system:

- **Compute the load.** With van stock as a ledger, the platform can total regulated product per vehicle and warn before a transfer would push it over the materials of trade aggregate.
- **Keep a vehicle compliance checklist** (spill materials present, lockable storage, securement, cylinders secured upright) as a recurring inspection on each vehicle, alongside the DVIR, with the items resolved from the branch's state rules.
- **Route with the vehicle in mind.** FieldRoutes offers hazmat, commercial vehicle and bridge height routing constraints; Salesforce's `TravelMode` includes transporting hazardous materials; Route4Me has a hazardous goods truck attribute.

Application records, licensing of applicators and product labels are covered in [Regulated Materials](/books/field-operations/regulated-materials) and [Licenses & Permits](/books/field-operations/licensing-and-permits).

## Protective Equipment

OSHA's general PPE standard requires the employer to assess the workplace for hazards, select and fit protective equipment, and certify the assessment in writing, identifying the workplace, the person certifying and the date (29 CFR 1910.132(d)). Employees must be trained on when and what PPE is needed, how to wear it, its limits and its care, and must demonstrate they understand before doing the work; retraining follows when they don't. Employers pay for required PPE, with narrow exceptions such as non-specialty safety-toe footwear and prescription safety eyewear worn off the job. Pesticide labels add their own PPE requirements on top. The hazards that reach the schedule itself (heat, ladders and falls, confined spaces, working alone) are in [Field Hazards](/books/field-operations/technician-workforce#field-hazards).

What to record: the hazard assessments and their certification, PPE issued to each employee and when, and training with the demonstration of understanding. Safety data sheets for what's on the van follow the rule in [Regulated Materials](/books/field-operations/regulated-materials#safety-data-sheets); the van stock ledger is what tells the device which sheets to carry.

## Incidents

When something goes wrong (a crash, a spill, an injury, a customer's pet exposed to product), the first hours decide what can be proven later. OSHA requires reporting a work-related fatality within 8 hours and an in-patient hospitalization, amputation or loss of an eye within 24 hours (29 CFR 1904.39). A motor vehicle accident on a public street or highway doesn't have to be reported to OSHA unless it happened in a construction work zone, but it still has to be recorded if the employer keeps injury records. Those records (the 300 log, the annual summary and 301 incident reports) are kept for five years after the end of the calendar year they cover (29 CFR 1904.33).

Build an incident as its own record, linked to the employee, vehicle, visit, property and products involved, with a type (vehicle, injury, spill or exposure, property damage, customer complaint), a timeline, and the evidence: telematics events around the time, dashcam clips (download them before the vendor's retention expires), photos, witness statements and the product and lot. Start reporting deadlines from the time the company learned of the event, and alert the people responsible. Spill response and reporting for pesticides belong with [Regulated Materials](/books/field-operations/regulated-materials), and the heat, fall and lone-worker records that often explain an incident are in [Field Hazards](/books/field-operations/technician-workforce#field-hazards).

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model) with vehicles, who drove them, and the stock journal. Items come from the one sellable and stock catalog in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules#how-to-build-it); a branch warehouse and a van are both stock locations.

```sql
CREATE TABLE vehicles (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  branch_id         UUID NOT NULL REFERENCES org_units (id),
  unit_number       TEXT NOT NULL,             -- what the shop calls it: "Van 14"
  vin               TEXT,
  plate             TEXT,
  plate_region      TEXT,                      -- state or province of registration
  telematics_ref    TEXT,                      -- the vendor's vehicle ID
  gvwr_lbs          INTEGER,                   -- from the door-jamb label
  gcwr_lbs          INTEGER,                   -- when it tows
  is_cmv            BOOLEAN NOT NULL,
  cmv_basis         TEXT,                      -- weight, passengers, placarded hazmat
  capabilities      TEXT[] NOT NULL DEFAULT '{}',  -- liftgate, refrigerated, ladder rack, hazmat
  status            TEXT NOT NULL CHECK (status IN ('active', 'out_of_service', 'retired')),
  UNIQUE (tenant_id, unit_number)
);

-- one driver per vehicle at a time; needs the btree_gist extension
CREATE TABLE vehicle_assignments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  vehicle_id      UUID NOT NULL REFERENCES vehicles (id),
  staff_member_id UUID NOT NULL REFERENCES staff_members (id),  -- the driver
  valid_during    TSTZRANGE NOT NULL,        -- closed-open; open upper bound while current
  source          TEXT NOT NULL,             -- 'dispatch', 'eld_login', 'manual'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vehicle_assignments_valid_during_excl
    EXCLUDE USING GIST (vehicle_id WITH =, valid_during WITH &&)
);

CREATE TABLE stock_locations (           -- a branch warehouse or a van
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  branch_id  UUID NOT NULL REFERENCES org_units (id),
  kind       TEXT NOT NULL CHECK (kind IN ('warehouse', 'vehicle')),
  vehicle_id UUID REFERENCES vehicles (id),
  name       TEXT NOT NULL,
  CHECK ((kind = 'vehicle') = (vehicle_id IS NOT NULL))
);

CREATE TABLE inventory_movements (       -- append-only; on hand is a sum of these
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  item_id            UUID NOT NULL REFERENCES items (id),
  quantity           NUMERIC NOT NULL,   -- positive, in unit
  unit               TEXT NOT NULL,      -- 'gal', 'fl_oz', 'each'
  from_location_id   UUID REFERENCES stock_locations (id),  -- null for a receipt
  to_location_id     UUID REFERENCES stock_locations (id),  -- null when used or scrapped
  reason             TEXT NOT NULL CHECK (reason IN ('receipt', 'transfer', 'used',
                       'return', 'count_adjustment', 'damage')),
  visit_id           UUID REFERENCES visits (id),           -- set when used on a visit
  lot_number         TEXT,               -- regulated products
  serial_number      TEXT,               -- serialized items: compressors, cylinders
  staff_member_id    UUID REFERENCES staff_members (id),
  device_id          TEXT,
  device_recorded_at TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_location_id IS NOT NULL OR to_location_id IS NOT NULL),
  CHECK (reason <> 'used' OR visit_id IS NOT NULL)
);
```

`is_cmv` is stored, not computed, because the answer depends on how the vehicle is used (towing, passengers, placarded loads), and `cmv_basis` says why. An `out_of_service` vehicle (an open DVIR defect, an expired periodic inspection) can't take a route. `capabilities` is what delivery work matches against: an appliance that needs a liftgate, a full-room furniture delivery that needs a long box, a pharmacy order that needs refrigeration are requirements on the work order, checked against the vehicle the crew will drive. A two-person delivery crew is one driver plus a helper: the assignment names the driver, because hours of service and safety events belong to whoever is at the wheel, and the helper rides on the crew resource. Delivery vehicles also need capacity in weight, volume and pallets, loaded in reverse stop order and scanned on; [Last-Mile Delivery & Distribution](/books/field-operations/last-mile-delivery#how-to-build-it) adds those columns.

A part used on a repair is one `used` movement and one `work_order_parts` row ([Repair, Install & Commercial Work](/books/field-operations/repair-and-installation#how-to-build-it)); the movement moves stock, the part row bills it and carries the warranty serials.

## Auditing

Fleet, inventory and safety records are the ones roadside inspectors, OSHA, state pesticide inspectors, insurers and plaintiffs' lawyers ask for. Field-specific points:

- **Who drove which vehicle when,** from the effective-dated assignment, with CMV status per vehicle and why, so a speeding event, a DVIR or an hours record lands on the right person.
- **The inventory journal is the audit record:** actor, device, time and reason for every movement, counts posted as adjustments, serials for warranty-bearing parts.
- **Safety events keep their review:** each event, who reviewed it, the coaching, and the score configuration version that applied.
- **Incidents keep their clock:** when the company learned of the event, the reporting deadline computed from it, and the evidence preserved before vendor retention expired.

The general record shape is in [Audit Trails](/docs/architecture/audit-trails); retention and production of field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Classify every vehicle against the CMV thresholds,** including with trailers, and attach the medical, inspection, hours and DVIR obligations that follow.
- **Integrate telematics rather than build it,** with idempotent, version-aware ingestion and an effective-dated driver to vehicle assignment.
- **Never demand interaction from a moving driver;** gate app prompts on vehicle motion.
- **Model vans as warehouses with an append-only journal,** derive quantities, and post counts as adjustments.
- **Restock from the schedule as well as from usage,** with pick lists and transfers per van.
- **Total regulated product per vehicle** against the materials of trade limits, and keep vehicle compliance checks with the DVIR.
- **Drive the device's safety data sheets from van stock,** so every product on board has its sheet.
- **Make incidents first-class records** with deadlines, linked evidence and preserved video.

## References

**Specifications**

- [49 CFR 390.5: Definitions](https://www.law.cornell.edu/cfr/text/49/390.5), commercial motor vehicle at 10,001 pounds or more, and the passenger and placarded hazmat prongs
- [49 CFR 383.5: Definitions](https://www.law.cornell.edu/cfr/text/49/383.5), the commercial driver's license thresholds of 26,001 pounds, 16 passengers and placarded hazmat
- [49 CFR 391.45: Persons who must be medically examined and certified](https://www.law.cornell.edu/cfr/text/49/391.45), certification within the preceding 24 months, and 12 months for some drivers
- [49 CFR 395.1: Scope of rules in this part](https://www.law.cornell.edu/cfr/text/49/395.1), the 150 air-mile, 14-hour short-haul exception and six months of time records
- [49 CFR 395.8: Driver's record of duty status](https://www.law.cornell.edu/cfr/text/49/395.8), electronic logging and the paper-log exception for 8 or fewer days in 30
- [49 CFR 396.11: Driver vehicle inspection reports](https://www.law.cornell.edu/cfr/text/49/396.11), items covered, no report when no defect, repair certification, three-month retention and the one-vehicle exemption
- [49 CFR 396.17: Periodic inspection](https://www.law.cornell.edu/cfr/text/49/396.17), each vehicle inspected within the preceding 12 months with proof on the vehicle
- [49 CFR 392.82: Using a hand-held mobile telephone](https://www.law.cornell.edu/cfr/text/49/392.82), drivers and carriers, including while temporarily stationary in traffic
- [49 CFR 173.6: Materials of trade exceptions](https://www.law.cornell.edu/cfr/text/49/173.6), per-package limits, 100-kilogram gas cylinders, the 200-kilogram vehicle limit, packaging, marking and informing the operator
- [29 CFR 1910.132: Personal protective equipment, general requirements](https://www.law.cornell.edu/cfr/text/29/1910.132), hazard assessment and written certification, training, and employer payment
- [29 CFR 1904.39: Reporting fatalities, hospitalizations, amputations and losses of an eye](https://www.law.cornell.edu/cfr/text/29/1904.39), 8- and 24-hour deadlines and the public road exception
- [29 CFR 1904.33: Retention and updating](https://www.law.cornell.edu/cfr/text/29/1904.33), five years of injury and illness records
- [Ariz. Admin. Code R3-8-302: Storing and disposing of pesticides and devices](https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R3-8-302), locked storage on unattended service vehicles and in transport
- [Ariz. Admin. Code R3-8-305: Equipping a service vehicle](https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R3-8-305), absorbent material for a one-gallon spill, a container for contaminated material and locking storage in transit
- [Utah Admin. Code R68-7-19: Storage, transportation and disposal](https://www.law.cornell.edu/regulations/utah/Utah-Admin-Code-R68-7-19), spill kits on service vehicles and securing containers in transport

**Reference**

- [Microsoft Learn: Inventory, purchasing and returns](https://learn.microsoft.com/en-us/dynamics365/field-service/inventory-purchasing-returns-overview), trucks as warehouses, quantity types, allocation and use, inventory journals and negative inventory
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), product items at locations including service vehicles, transfers, transactions, and the hazardous materials travel mode

**In practice**

- [Samsara: Driver behavior guide](https://developers.samsara.com/docs/driver-behavior-guide), accelerometer and dash camera safety events, and driver and vehicle safety scores
- [Samsara: Tiered plans for API and webhook access](https://developers.samsara.com/docs/tiered-plans-for-api-and-webhook-access), license tiers for HOS, DVIR, IFTA, safety and route stop webhooks
- [Samsara: Compliance](https://developers.samsara.com/docs/compliance), HOS clocks and logs that reflect later edits, and personal conveyance settings
- [Samsara: TMS compliance](https://developers.samsara.com/docs/tms-compliance), assigning loads only to drivers with enough remaining drive time
- [Motive: Webhooks v2](https://developer.gomotive.com/reference/webhooks-v2), HTTP, SQS and SNS delivery, retries, and HOS, inspection and safety events
- [Geotab: GetFeed](https://developers.geotab.com/myGeotab/apiReference/methods/GetFeed/), version tokens, resent modified records and rate limits
- [Geotab: Safety scorecard](https://support.geotab.com/mygeotab/doc/safety-scorecard), default rules, weights and risk bands
- [Geotab: Collision Risk overview](https://support.geotab.com/help/mygeotab/industry-and-advanced-features/collision-risk/collision-risk-overview), predictive collision risk
- [Verizon Connect: Vehicle API](https://fleetmatics.apiportal.akana.com/content/api/fa5cace3-aa7e-49c0-a445-b130e0dc4fd6.fleetmatics/documents/Vehicle%20API.htm), syncing vehicles and drivers and backdated odometer updates
- [Route4Me: Getting started](https://integrate.route4me.com/docs/getting_started), mobile and telematics distance, and hazardous goods truck attributes
- [ServiceTitan: Truck replenishment workflows](https://help.servicetitan.com/how-to/truck-replenishment-workflows), materials used on invoices to grouped purchase orders and their statuses
- [FieldRoutes: Capacity tracking](https://knowledgebase.fieldroutes.com/docs/capacity-tracking.md), product capacity per route
- [FieldRoutes: Chemical tracking report](https://knowledgebase.fieldroutes.com/docs/chemical-tracking-report.md), inventory valuation and its dependence on units and dilution rates
- [FieldRoutes: Introduction to Intelligent Routing](https://knowledgebase.fieldroutes.com/docs/an-introduction-to-intelligent-routing.md), hazmat, commercial vehicle and bridge height routing
- [PestPac: Chemical tracking](https://www.pestpac.com/features/chemical-tracking-software), distributor to warehouse to technician tracking and expected usage (marketing)
