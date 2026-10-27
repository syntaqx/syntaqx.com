+++
title = "Territories & Capacity"
description = "Where work can happen and who can do it: territory polygons, PostGIS lookups, skills and licenses, crews and shifts, capacity models, forecasting."
category = "Field Operations Industry"
order = 1508
part = "Scheduling and Routing"
tags = ["field-operations", "scheduling", "territories", "capacity", "geospatial"]
+++

"Can someone come Tuesday morning?" sounds like a calendar question, and it's really five. Does the business serve this address at all? Which branch and which people cover it? Who is working Tuesday morning? Of those, who has the skills for this job and the license for this state? And does anyone have room left? A dispatcher can answer from memory for a ten-truck shop. A company with forty branches, HVAC install crews, licensed plumbers, termite specialists and a call center can't, and neither can the customer portal, the AI voice agent or the nightly [recurring scheduler](/books/field-operations/recurring-schedules), all of which ask the same question thousands of times a day. The answer has to come from data: territories drawn on a map, people with memberships, shifts, skills and licenses, and a capacity model that says how full a day may get. This chapter covers each of those and the engine that combines them.

## Territories

A **territory** is the area a team serves. The design choices are how the area is drawn, how an address is placed in it, and what membership means.

| Platform | Territory unit | How an address is placed | Membership |
| --- | --- | --- | --- |
| **Salesforce Field Service** | Service territory, optionally drawn as map polygons that can nest into a hierarchy | Point in polygon; with overlapping polygons, the highest or lowest level wins per setting | Service territory members; a resource can belong to several |
| **ServiceTitan** | Zones, defined by the ZIP codes served | ZIP code | Business units tie technicians, job types and zones together |
| **Oracle Field Service** | Capacity areas and work zones | Work zone matching | Resources in a capacity area |
| **FieldRoutes** | Routing regions | Region on the subscription | Routing groups by region or preferred tech |
| **Esri Territory Design** | Multilevel territories built from base geography | Spatial | A planning tool, not an operational one |

In Salesforce, resources "are assigned to one or more service territories as service territory members," a polygon "can be nested inside another polygon creating a hierarchy," and a location inside several is assigned "to either the highest or lowest-level territory in the hierarchy depending on your settings." ServiceTitan's online scheduler is built on Zones, "the ZIP codes you serve," and can't be configured without them; its capacity engine infers who can do what from the links among business units, job types, zones and skills. Territories sit below the branch in the [tenant hierarchy](/docs/architecture/multi-tenancy#tenant-hierarchies), and I still keep them out of the `org_units` defined in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model), in their own table with a `branch_id`. Org units carry what's licensed, staffed and accounted for (a time zone, licenses, a profit and loss); territories are drawings that change monthly and carry no books. Keeping them apart means a redraw never touches the tenant hierarchy, at the cost of one more link to follow (territory to branch) when rolling up. The alternative, a fourth `kind = 'territory'` in `org_units`, works if territories rarely change and need the same permissions as branches.

The two approaches trade precision for ease. A ZIP list is easy to sell, edit and explain to a franchisee, and it's coarse: one ZIP can straddle a river, a county line that matters for licensing, or a toll bridge that doubles the drive. A polygon follows the real boundary, at the cost of geocoding every address and maintaining shapes. My default: polygons as the source of truth, with ZIP lists generated from them for marketing and lead routing. The alternative, ZIP lists only, is fine for a single-branch lawn or cleaning business until the first boundary dispute between two branches or franchisees.

Territory *design* is a separate, strategic problem: where should the lines go so each branch or technician has a fair, compact, drivable book? Esri's Territory Design builds territories in levels from base geography, balances them on chosen variables (or on compactness if none are set), and can start from known centers like offices; without fixed centers, rerunning the solve may give different territories, and planners adjust boundaries by hand afterward. Treat a redesign as a planned change with an effective date, not a live edit: a redrawn line moves recurring customers, routes, and often commissions and royalties.

## Point in Polygon with PostGIS

If you build your own, territory lookup is a spatial join, and PostGIS does it well. The `properties` in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model) carry a geocoded `location GEOGRAPHY(POINT)` and a `branch_id`, and no territory link. This chapter adds territories, their dated areas, and the stored result of resolving a property against them. The areas are `GEOGRAPHY` too, so the join compares like with like and nothing is cast at query time (the exclusion constraints need `btree_gist`, as in [Booking Appointments](/books/field-operations/booking-appointments#idempotency-and-double-booking)):

```sql
CREATE TABLE territories (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  branch_id  UUID NOT NULL REFERENCES org_units (id),
  parent_id  UUID REFERENCES territories (id),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE territory_areas (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  territory_id  UUID NOT NULL REFERENCES territories (id),
  valid_during  DATERANGE NOT NULL,
  area          GEOGRAPHY(MULTIPOLYGON, 4326) NOT NULL,
  priority      INTEGER NOT NULL DEFAULT 0,      -- tie-break for overlaps
  CONSTRAINT territory_areas_valid_during_excl
    EXCLUDE USING GIST (territory_id WITH =, valid_during WITH &&)
);
CREATE INDEX territory_areas_area_idx ON territory_areas USING GIST (area);

CREATE TABLE property_territories (             -- the stored resolution
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  territory_id      UUID NOT NULL REFERENCES territories (id),
  territory_area_id UUID NOT NULL REFERENCES territory_areas (id),  -- the version that decided
  valid_during      DATERANGE NOT NULL,
  resolved_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT property_territories_valid_during_excl
    EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

-- Which territory's area covers this property on this date?
SELECT a.territory_id, a.id AS territory_area_id
FROM territory_areas a
JOIN properties p ON ST_Covers(a.area, p.location)
WHERE p.id = $1
  AND a.tenant_id = p.tenant_id
  AND a.valid_during @> $2::DATE
ORDER BY a.priority DESC
LIMIT 1;
```

I store the resolution as a dated link, not a `territory_id` column on `properties`, because territory changes are scheduled: when a branch takes over three ZIP codes on the first of next month, the property has one territory until then and another after, and both are known today. A resolved column would have to be rewritten on the effective date and couldn't answer "which territory was this in last March?" The link holds the leaf territory; parents come from `territories.parent_id`.

![An exploded axonometric drawing of three stacked territory levels for one branch: the branch service area at the bottom, two territories above it and four leaf territories on top, two inside each territory. A dashed line drops through the stack from one geocoded property point and marks where it lands on each level; the leaf territory that covers it is highlighted.](/diagrams/fo-territories-and-capacity-dwg-areas.svg "Areas nest into levels, and a property resolves to the leaf whose dated area covers its point. Parents come from parent_id, not from another spatial join.")

Two details matter in the query. Use `ST_Covers` rather than `ST_Contains`: PostGIS describes `ST_Covers` as having "a simpler definition" without the quirk that a geometry doesn't contain its own boundary, so an address geocoded exactly onto a shared edge still matches, and it has a geography form for a polygon covering a point. And index the shapes with GiST: spatial indexes store bounding boxes, so the query runs in two passes, a fast index match on boxes, then an exact test on the candidates. If you keep areas as `GEOMETRY` for the wider function set instead, cast the point (`p.location::GEOMETRY`) and index the geometry column, and do it the same way everywhere.

What goes wrong is rarely the query:

- **Gaps and overlaps.** Hand-drawn polygons leave slivers between them and overlap at the edges. Validate on save: every serviced address must land in exactly one territory at each level, or in an explicit priority order.
- **Bad geocodes.** A rural address geocoded to the center of its ZIP lands in the wrong territory, and a new subdivision may not geocode at all. Store the geocode's precision and route low-precision addresses to a person ([Addresses](/docs/fundamentals/addresses#geocode-and-precision)).
- **Lookups at booking time.** Resolve the territory when the property is created or its address changes, store it in `property_territories`, and re-resolve when a territory area version is added. Don't run a spatial join on every slot search.

## Skills, Licenses and Certifications

Territory narrows the pool by place. Skills narrow it by competence, and they're where vendors differ most.

- **Salesforce** treats skills as a work rule, a pass-or-fail filter: "Match Skills" confirms the candidate is qualified, alongside rules like Required Resource and Service Appointment Visiting Hours. Its scheduling policies then grade the survivors with weighted objectives.
- **Oracle** has required and preferred skill levels: the required level is eligibility, the preferred level ranks. Two defaults surprise people. A resource with no skills assigned is treated as having "all the work skills at the highest level." And when several workers qualify, direct-assignment booking "prefers the worker with the smaller set of working skills," keeping generalists free for later work.
- **Timefold** models integer skill levels with a `minLevel` per visit, a soft constraint that prefers "the lowest matching skill level," a `multiplier` that stretches service duration (a trainee takes longer), and `temporarySkillSets` that grant a skill only for part of a shift. A visit needing several skills stays unassigned "if no single technician has all of them."

Skills in the trades are concrete: a technician who can diagnose a heat pump but not braze a line set, a plumber not certified for backflow testing, a pool tech who can't do heater repair. Oracle's preference for the narrowest qualified worker is worth copying for repair work, where the one technician who can do commercial refrigeration is the scarcest resource in the branch.

A **license** is a qualification with a jurisdiction and an expiry. In California, a termite (wood-destroying organism) inspection must be made by a licensed Branch 3 field representative or operator, so an applicator, the entry-level license, isn't eligible however experienced; an HVAC technician who services equipment that could release refrigerant, ozone-depleting or a substitute such as an HFC, needs EPA Section 608 certification ([Regulated Materials](/books/field-operations/regulated-materials) covers Section 608 and the separate HFC leak-repair rule). [Licenses & Permits](/books/field-operations/licensing-and-permits) owns the rules and the data model. The availability engine asks it one question, whether this resource holds what this work requires in this jurisdiction on this date, so an expired license removes eligibility automatically instead of waiting for someone to untick a box. My rule: absence of a credential means ineligible. Oracle's "no skills means all skills" default is convenient for onboarding and exactly wrong for anything a regulator checks.

## Crews, Shifts and Operating Hours

Availability is the intersection of three calendars, plus the resources that are made of other resources.

**Operating hours** say when work may happen at all. Salesforce attaches them to accounts, territories and territory members, built from time slots per weekday, and an entitlement can carry its own booking window: "if Customer A is entitled to service Monday through Friday from 8 AM to noon, but Customer B is entitled to 24/7 service," each gets its own operating hours. That's the commercial calendar, and it's where commercial service level agreements live: the restaurant whose walk-in cooler is covered around the clock, the office building cleaned only after 6 p.m., the retail store that allows no work during trading hours.

**Shifts** say when a person works. ServiceTitan derives availability from Regular, On-Call, Overnight and Time Off shifts, and treats technicians as available during business hours if shifts aren't used. Oracle draws a distinction worth copying: an on-call shift "counts as valid working availability during candidate selection," but "on-call time does not count as capacity," so the plumber on call for burst pipes is a candidate for an emergency without inflating the bookable day.

**Holidays and absences** remove time. ServiceNow assigns location-based holiday calendars to technicians and warns when a shift falls on one. Branches in different states keep different holidays, so the calendar belongs to the place, not the tenant ([business days and holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)).

**Crews** are resources made of resources. Salesforce assigns a crew "as a unit" through a crew-type service resource. A crew's skills are the union of its members' (if the work needs one licensed person on site) or the intersection (if everyone must be qualified), and that choice belongs in the work type, not in code. Crew membership changes daily in lawn and landscape and on HVAC install teams, so rosters are effective-dated like everything else: a crew is a `resources` row of kind `crew`, and each member is a `staff_members` row linked to it for a `valid_during` range. Installs also span days: a two-day system replacement needs the same crew on consecutive days, which is a reservation of the crew, not two independent bookings.

![A funnel narrows every resource in the tenant to bookable candidates: territory (a polygon covers the address), membership on that date, availability from shifts, hours and absences, eligibility from skills, levels and licenses, and remaining capacity. Those are hard pass-or-fail rules; the surviving candidates are then graded by soft objectives.](/diagrams/fo-territories-and-capacity-filter.svg "One availability engine, many callers. Hard rules filter in order from cheapest to most expensive, and only the survivors are scored.")

## Capacity Models

Capacity is how much more work a day can take, and the platforms measure it in three different units: minutes, slots or counts.

| Platform | Unit | How it's computed | Notable behavior |
| --- | --- | --- | --- |
| **Oracle Field Service** | Man-minutes per capacity area, category and time slot | "Capacity = Quota – Used"; quota is the planned allocation of capacity | Booking by direct assignment, by quota per time slot or per booking interval, chosen per capacity area |
| **Salesforce Field Service** | Hours or appointment count per period, for capacity-based resources | Minutes used versus the resource's capacity | The scheduler stops offering resources whose capacity is full |
| **ServiceTitan Adaptive Capacity** | Technician time | Time provided by shifts or business hours minus time consumed | Jobs consume capacity even without a shift, so reports can go negative |
| **Solea** | Slots per day per capacity schedule | Filled counts, counted down at booking | A held slot counts against the day |
| **FieldRoutes capacity tracking** | Product, such as gallons per route | Estimated product per service type against route capacity | A different meaning of capacity: what the truck carries |

Oracle's model is the most formal. Capacity is "time available in man-minutes based on the availability of the resources in the capacity area," quota is the "company's planned usage of capacity allocated across different capacity categories and time slots," and booking is accepted only when capacity remains. The quota layer is what lets an HVAC business reserve Tuesday afternoons for installs and not let repair calls eat them.

Salesforce's capacity-based resources are typically contractors: a `ServiceResourceCapacity` holds the "maximum number of scheduled hours or number of service appointments that a capacity-based service resource can complete within a specific time period," and the scheduler uses minutes used "to prevent offering resources whose capacity is full." That's the right model for a subcontracted install crew or a courier partner who'll take twenty jobs a week but whose calendar you don't see.

Which to use depends on the work. Minutes suit variable-length jobs (HVAC repair, plumbing diagnostics, where a flat-rate task still takes as long as it takes). Slot counts suit uniform recurring stops (pest, pool, lawn), where a dispatcher thinks "Bob does a dozen a day." Counts per resource suit contractors and delivery partners. A platform serving several trades needs all three behind one interface: `remaining(scope, date, slot) -> quantity`, where the scope is a territory, a resource, a capacity category or a crew.

The other design question is whether capacity is **computed or counted**. Computed capacity (sum the booked minutes now) is always correct and gets slow under load. A counted ledger (decrement a row on booking) is fast and must be updated in the same transaction as the booking, or it drifts. My default is to count on the booking path and recompute nightly to catch drift, alarming when the two disagree; a small operation can skip the ledger and compute every time.

## Reserving Room and Forecasting

A day booked full of movable recurring work has no room for the no-heat call at 10 a.m. Timefold makes the reservation explicit: `movableOccupationRatioThreshold` "sets the ratio to control the percentage of the vehicle shift that can be assigned movable visits," so 0.5 on an eight-hour shift leaves about four hours for fixed and urgent work. Oracle's quota categories do the same job at the area level. Every capacity model needs this lever, set per territory and season: an HVAC branch in a heat wave needs far more held back for emergencies than a pool route in May, and a commercial cleaning contract with a response-time SLA reserves capacity whether or not the call comes.

![A dimensional drawing of one eight-hour shift as a capacity bar of 480 minutes. A movable share of 0.5 splits it into a 240-minute movable quota and a 240-minute reserve for fixed and urgent work. Below, 210 movable minutes are booked, leaving 30, and 90 fixed or urgent minutes are booked, leaving 150 held for urgent calls.](/diagrams/fo-territories-and-capacity-dwg-capacity.svg "Timefold's 0.5 threshold drawn as a quota: movable work stops booking when its share is spent, however much of the reserve is free. The booked minutes are illustrative.")

Forecasting tells you whether the lever is set right. Oracle's forecasting analyzes "up to 3 years of data" to forecast workload and "analyze gaps in your mobile workforce," compared by period and working area and rolled up to the company. Recurring businesses have an advantage: most of next month's demand is already generated as occurrences, so the forecast is the occurrence backlog by territory and week, plus a historical rate for new sales, reactive calls and make-ups. Repair-heavy trades lean on the historical rate and on weather (the first cold snap fills furnace calls; a freeze fills burst-pipe calls). Compare demand with capacity from shifts and you get the hiring plan, the seasonal staffing for spring lawn rounds, and early warning that a territory will run out of room in six weeks.

## How to Build It

Territory areas, memberships, crew rosters, shifts, credentials and capacity rules all change on scheduled dates (a branch takes over three ZIP codes on the first of next month, a license expires December 31), so each carries a `valid_during` range and every availability question carries a date, as [Temporal Data](/docs/database/temporal-data) describes. The engine is a filter pipeline over that effective-dated data, in the order of the diagram, cheapest test first:

1. **Resolve the territory** from `property_territories` for the date (written by the spatial join on address or area change).
2. **Find members** of that territory valid on the date, including members of neighboring territories if a soft-boundary policy allows them.
3. **Intersect calendars**: operating hours (account, territory, entitlement), shifts, holidays and absences, giving each candidate's open intervals.
4. **Check eligibility**: skills at the required level, credentials valid in the jurisdiction on the date (from [Licenses & Permits](/books/field-operations/licensing-and-permits)), crew rules, and resources the customer requires or excludes.
5. **Check capacity** in the relevant scope and slot.
6. **Grade** the survivors with soft objectives (travel added, preferred technician, workload balance) and return them.

Steps 1 to 5 are hard rules and should be the same code for every caller: the call center, the portal, the voice agent, the recurring scheduler and the optimizer's input builder. If the portal checks credentials and the voice agent doesn't, the voice agent will book a backflow test with a plumber who isn't certified for it. Step 6 is where callers legitimately differ: the portal may grade by earliest slot, the optimizer by route cost. The rules themselves (which work type needs which skill, which territories may borrow from which) are data, versioned like any other rule ([Rules as Data](/docs/architecture/rules-as-data)).

A minimal data model, beside the canonical `properties` and `visits`:

```text
territories(id, tenant_id, branch_id, parent_id, name)
territory_areas(id, tenant_id, territory_id, valid_during, area, priority)
property_territories(id, tenant_id, property_id, territory_id, territory_area_id, valid_during)
territory_members(tenant_id, territory_id, resource_id, kind: primary|secondary, valid_during)
resources(id, tenant_id, kind: technician|crew|contractor|equipment, staff_member_id, home_location)
crew_members(tenant_id, crew_resource_id, staff_member_id, valid_during)
shifts(id, tenant_id, resource_id, kind: regular|on_call|time_off, valid_during, is_bookable)
operating_hours(tenant_id, owner_type, owner_id, weekday, starts_local, ends_local, valid_during)
capacity_rules(tenant_id, scope_type, scope_id, unit: minutes|slots|jobs, slot, capacity_limit, valid_during)
capacity_ledger(tenant_id, scope_type, scope_id, service_on, slot, capacity_limit, used)
```

A technician resource points at its `staff_members` row; a crew's members are staff members, through `crew_members`. Shift and operating-hour times are local wall-clock times in the branch's zone (`org_units` carry `time_zone`), not instants ([Time](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)); a shift's `valid_during` is the computed range used for overlap checks. Each ledger row copies `capacity_limit` from the rule in force when the row is created, so booking's conditional update (`used < capacity_limit`) reads one row, and a held visit counts in `used` until it expires or converts.

**Performance.** The expensive callers are the portal showing three weeks of availability and the nightly scheduler asking for every due occurrence. Precompute per-resource open intervals for the booking horizon and invalidate them on events (shift changed, booking created, credential expired).

**Build, buy or extend.** Salesforce and Oracle model all of this; extending them is mostly configuration plus custom work rules. ServiceTitan and FieldRoutes use simpler models (ZIP zones, regions) that fit most residential operations. A custom platform should spend its design effort on the capacity units and the one shared pipeline.

## Auditing

Territory and capacity data decides who gets work and who gets paid for it:

- **Territory and membership changes**, with the before and after geometry and the properties, recurring plans and routes that moved as a result. A rep or franchisee whose book shrank will ask, and commissions and royalties often follow territory.
- **Credential-based eligibility as of the day.** When a regulator asks whether the inspector or refrigerant technician held the license or certification on the day of service, the answer comes from data valid on that date, plus every booking made on the strength of it.
- **Capacity overrides and quota changes**: who forced a booking past a limit or changed a reservation, and why.
- **Why an automated booking chose or rejected each candidate**, so "why didn't the portal offer Tuesday?" can be answered and an assignment can be shown not to be arbitrary.

Shift records also feed wage-and-hour questions, so keep them beside the time records from [The Technician App](/books/field-operations/technician-app). The record structure, typed actors and retention are in [Audit Trails](/docs/architecture/audit-trails); field record types and retention periods are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Draw territories as polygons, versioned by date.** Generate ZIP lists from them for marketing; never the reverse.
- **Resolve territories with `ST_Covers` over a GiST index** at address or area change, and store the result as a dated `property_territories` link.
- **Validate coverage on save.** Every serviced address lands in exactly one territory per level, or in a declared priority order.
- **Effective-date everything** with `valid_during`, and pass a date to every availability query.
- **Treat a missing credential as ineligible.** Licenses carry jurisdiction and expiry, and eligibility derives from them.
- **Separate availability from capacity.** On-call shifts make someone a candidate without adding bookable capacity.
- **Support minutes, slots and counts behind one capacity interface,** with a counted ledger updated in the booking transaction and a nightly recompute.
- **Reserve room for unplanned work and SLAs,** per territory and season.
- **Run one hard-rule pipeline for every caller.** Portal, call center, voice agent and scheduler differ only in how they grade.
- **Forecast from the occurrence backlog** plus historical rates for repair and emergency demand.
- **Audit territory, membership, credential and capacity changes,** and why automated bookings chose or rejected each candidate.

## References

**Specifications**

- [EPA: Section 608 of the Clean Air Act](https://www.epa.gov/section608), the stationary refrigeration rules covering ozone-depleting refrigerants and their substitutes, such as HFCs, and technician certification
- [California Business and Professions Code section 8516](https://california.public.law/codes/business_and_professions_code_section_8516), wood-destroying pest inspections made by a licensed Branch 3 field representative or operator

**Reference**

- [PostGIS: ST_Covers](https://postgis.net/docs/ST_Covers.html), containment that includes boundary points, its geography form, and automatic spatial index use
- [PostGIS Workshop: Spatial Indexing](https://postgis.net/workshops/postgis-intro/indexing.html), GiST indexes of bounding boxes and the two-pass query
- [California Structural Pest Control Board: Become licensed](https://www.pestboard.ca.gov/howdoi/lic.shtml), the Applicator as the entry-level license, Field Representatives and Operators by branch, and Branch 3 as wood-destroying organisms
- [Esri: What is territory design?](https://pro.arcgis.com/en/pro-app/3.1/help/analysis/business-analyst/what-is-territory-design-.htm), multilevel territories, balance variables, compactness and non-deterministic solves

**In practice**

- [Salesforce: Field Service Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), service territories and members, nested map polygons, operating hours and entitlement booking windows, capacity-based resources, crews
- [Salesforce Trailhead: Examine scheduling policies](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/examine-scheduling-policies), work rules as pass or fail filters and service objectives as grades
- [Oracle Field Service: About capacity and quota](https://docs.oracle.com/en/cloud/saas/field-service/faccu/c-about-capacity-and-quota.html), capacity in man-minutes and "Capacity = Quota – Used"
- [Oracle Field Service: Activity booking overview](https://docs.oracle.com/en/cloud/saas/field-service/faaca/c-activitybookingoverview.html), booking methods per capacity area, smaller skill sets preferred, on-call availability that isn't capacity
- [Oracle Field Service: Work skills and work skill conditions](https://docs.oracle.com/en/cloud/saas/field-service/farcu/c-work-skills-and-work-skill-conditions.html), required versus preferred levels, and no skills meaning all skills
- [Oracle Field Service: Overview of forecasting](https://docs.oracle.com/en/cloud/saas/field-service/fasfc/c-overview-of-forcasting.html), workload forecasts from up to three years of history
- [ServiceTitan: Capacity planning](https://help.servicetitan.com/docs/capacity-planning.md), Adaptive Capacity as provided minus consumed, shift types, eligibility from business units, job types, zones and skills
- [ServiceTitan: Set up Scheduling Pro](https://help.servicetitan.com/docs/set-up-your-online-scheduler-with-scheduling-pro-in-servicetitan-max.md), zones as the ZIP codes served
- [Timefold: Skills](https://docs.timefold.ai/field-service-routing/latest/visit-service-constraints/skills), skill levels, duration multipliers and temporary skills
- [Timefold: Multi-day schedules and movable visits](https://docs.timefold.ai/field-service-routing/latest/visit-service-constraints/multi-day-schedules-and-movable-visits), reserving a share of each shift with `movableOccupationRatioThreshold`
- [FieldRoutes: An introduction to Intelligent Routing](https://knowledgebase.fieldroutes.com/docs/an-introduction-to-intelligent-routing.md), routing regions and groups
- [FieldRoutes: Capacity tracking](https://knowledgebase.fieldroutes.com/docs/capacity-tracking.md), product capacity per route
- [Solea: Capacity planning](https://www.solea.ai/product/capacity-planning), daily slot limits per capacity schedule and held slots counting against capacity
- [ServiceNow: Field service holiday schedules](https://www.servicenow.com/docs/r/DBkKvgbNn2vmEpXdLk9O2w/6Gsx23mhIpgTjuMViPVB2w), location-based holiday calendars assigned to technicians
