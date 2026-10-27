+++
title = "Portfolios, Properties & Units"
description = "The physical model: portfolio trees and groupings, properties, buildings, units and floor plans, rentable spaces, unit status, addresses and parcels."
category = "Property Tech Industry"
order = 1703
part = "Properties, Owners and Investors"
tags = ["property-tech", "data-model", "units", "addresses", "parcels"]
+++

Every number a property platform reports is a count or a sum over the same few physical records. Occupancy divides leased units by units; rent per square foot divides rent by an area someone measured under some standard; a lender's rent roll lists every unit whether or not it's rentable; a deposit limit, a rent cap and an eviction notice period all depend on which city the building is in. Getting the physical inventory right is unglamorous and decides whether everything above it can be trusted: a unit counted twice inflates vacancy, a model unit left in the rentable count understates occupancy for years, and a property geocoded to the wrong side of a city line applies the wrong rent control ordinance to every renewal.

This chapter extends the spine from [The Core Data Model](/books/property-tech/property-business#the-core-data-model): how portfolios and groupings are shaped, what a property, building and unit carry, how parking, storage, lots and beds fit, how a unit's own status is recorded over time, and how addresses, parcels and jurisdictions are resolved. Owners and money attach in [Owners & Management Agreements](/books/property-tech/owners-and-management-agreements) and [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting); renovations that take units offline are in [Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects).

## How the Platforms Do It

The suites agree on the hierarchy and differ in how far it bends to non-apartment property:

- **RealPage** describes its multifamily system as giving "a clear, centralized perspective on buildings, floor plans, units, and availability," for "conventional, student, affordable, tax credit, military and senior living properties," with site-specific control kept where operators need it.
- **Yardi Breeze** sells editions per property type. Its manufactured housing edition tracks "community-owned homes, resident-owned homes and lots," records "changes in home ownership and lot rental," and tracks "the manufacturer, make, model and title of homes and RVs," so a lot and the home on it are different records with different owners.
- **Entrata's** job costing ties renovation work to units, and "units that become available are automatically updated on the leasing side and show what renovations were made": unit status and unit attributes change because of a project, not by hand.
- **Small-portfolio platforms** (AppFolio, Buildium, Rent Manager) start from the single-family case, where a property is often one house with one unit, and grow upward into buildings and associations.

The common shape is a tree (company, region or owner group, property, building, unit) with floor plans as a catalog per property and everything else (parking, storage, amenities) hung off it. The differences that matter are whether a property can sit in more than one grouping, whether a unit's status has history, and whether non-dwelling inventory (a storage unit, a lot, a bed, a commercial suite) is a first-class unit or a workaround.

## Portfolios and Groupings

A management company groups properties in several ways at once, and they don't nest:

- **Operating tree.** Regions and districts with a regional manager each. This is where permissions and configuration inherit ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)), so it's the `portfolios` tree in the core model, and a property sits in exactly one node.
- **Ownership groupings.** All properties of one owner, one fund or one joint venture. These follow `legal_entities` and `ownership_shares`, not the operating tree: a fund's properties span regions, and a region holds properties of many owners.
- **Reporting and program groupings.** A same-store set for year-over-year comparison, a lender's collateral pool, a tax credit portfolio, a renovation program, a pricing cohort. These are named sets with effective dates, because "same store" changes every year and a collateral pool changes when a loan is refinanced.

My rule: one tree for operations and permissions, and any number of effective-dated groupings for everything else. Forcing ownership into the operating tree breaks the day a fund buys a property in a new region; forcing reporting sets into it makes every report a reorganization.

A property also has a **management period**: the dates the tenant actually ran it. Properties are acquired, sold, taken over from another manager and handed back, and reports for any past period must include exactly the properties managed in it. The management period comes from the management agreement ([Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#the-management-agreement)); the property record itself is kept after the period ends, read-only, because its history is evidence.

## Properties

A property in this volume is **a managed asset with one owner of record and one jurisdiction**. That definition settles the cases that come up constantly:

- **A community with two phases** owned by two LLCs is two properties, even if residents see one name and one leasing office, because rent goes to two owners and two sets of books. A shared leasing office is a cost allocated between them ([Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#allocations-and-shared-costs)).
- **A scattered-site portfolio** of forty houses owned by one LLC in one county can be one property with forty buildings, or forty properties, depending on whether the owner wants one set of statements or forty. Houses in two states are always two properties at least, because the rules differ.
- **A mixed-use building** with apartments over retail is one property with units of two kinds, unless the commercial condominium is owned separately, in which case it's two properties sharing a building.
- **An association** is a property whose units are owned by their occupants, and whose ledger charges assessments rather than rent (Community Associations).

The attributes worth modeling as columns (and not as [custom fields](/docs/architecture/custom-fields)) are the ones rules, reports and integrations read: property type and subtype (garden, mid-rise, high-rise; conventional, affordable, student, senior), year built and renovated, the program the property participates in (tax credit, project-based subsidy), the jurisdiction, the time zone, the business date, and the external identifiers it carries elsewhere. Everything else (pool hours, pet policy prose, the leasing office's phone tree) is configuration or content.

## Buildings, Floor Plans and Units

**Buildings** matter more than they look. Accessibility rules apply per building: under HUD's Fair Housing Act regulations, covered multifamily dwellings first occupied after March 13, 1991 must meet design requirements (an accessible entrance on an accessible route, usable kitchens and bathrooms, reinforced bathroom walls), and in a building without an elevator only ground-floor units are covered. Inspections, insurance schedules, utility meters, elevators and roof replacements are per building too.

A **floor plan** is a property's catalog entry for a layout: bedrooms, bathrooms, area, and the marketing name. Pricing, listings and availability work at the floor plan level, so it's a table, not text on the unit. Units of the same plan can still differ (a corner, a view, a renovated kitchen), which is what unit amenities are for.

A **unit** is what is leased and counted. Its attributes:

| Attribute | Why it's a column |
| --- | --- |
| Unit number and street address | Leases, notices and court filings name it; two buildings can both have a unit 101 |
| Floor plan | Pricing, listings and availability |
| Area, with the standard it was measured under | Rent per square foot, expense allocations, commercial rent |
| Floor | Accessibility coverage, pricing premiums |
| Accessibility features | Fair housing and program obligations |
| Amenities (from a per-tenant catalog) | Pricing premiums and listings |
| Kind | Dwelling, commercial suite, storage unit, lot |
| Rentable status and reason | Inventory counts and occupancy denominators |

**Area is never a bare number.** "850 square feet" means different things measured to the inside of walls, to their centerlines, or including a share of common space. BOMA publishes measurement standards per property type (office, industrial, retail, multifamily and hospitality, mixed-use); its multifamily standard offers a gross and a net method, and its office standard exists mainly to calculate rentable area for leasing. Commercial rent and expense recovery depend on which method a lease uses (Commercial Property); residential platforms mostly use the marketing number. My rule: store the area with its method and source, and never mix methods in one ratio.

**Accessible units** are tracked per unit with the feature set, not as a yes/no. HUD's Section 504 rules for federally assisted new construction require at least 5% of units (or one unit) accessible for people with mobility impairments and another 2% (or one unit) for people with hearing or vision impairments, and those units have to be offered first to households that need the features. A platform that can't list which units have which features can't show it did that (Fair Housing; Subsidized & Affordable Housing).

## Rentable Spaces, Lots and Beds

Non-dwelling inventory falls into three shapes, and the core model already separates them:

- **Spaces rented with a unit.** Parking spaces, garages, storage lockers, bike storage, a boat slip. Each is a `rentable_spaces` row with a label and kind, rented by putting it on a lease's charge schedule, and the core model's exclusion constraint stops two households renting it at once. Some spaces come with the unit (an assigned spot included in rent) and some are sold separately; the difference is whether a charge exists, not a different table. Parking permits, towing and gate access are in Access, Smart Buildings & Parking.
- **Spaces rented alone.** A self-storage unit, a manufactured-home lot, an RV site, a boat slip at a marina, a commercial suite. Each is leased by itself and counted for occupancy, so it's a `unit` with its own `kind`. A manufactured housing community has a second layer: the lot is the community's, and the home on it may be the community's (rented with the lot) or the resident's (with its own title, sold between residents while the lot lease continues). The home is an asset record with its title, attached to the lot over time, not an attribute of the lot (Military & Specialty Housing; Self Storage).
- **Spaces rented inside a unit.** A bed or a bedroom in a student or co-living unit, leased individually. Beds sit under units, and occupancy is counted by bed for those properties (Student Housing).

USPS address standards reflect the same variety: its secondary unit designators include APT, STE, UNIT, LOT, SPC, SLIP, TRLR and RM, all of which require a number after them. A lot or a slip gets an address like any apartment, which is one more reason the address lives on the unit.

## Unit Status and Its History

The core model stores a unit's own rentable status (`rentable`, `down`, `model`, `employee`, `non_revenue`) with a reason, and derives occupancy from leases ([The Life of a Unit](/books/property-tech/property-business#the-life-of-a-unit)). What it doesn't yet hold is history, and every report that covers a past period needs it: a unit down for eleven days in March for a fire is not in March's available inventory for those eleven days, and the lender's occupancy covenant and the owner's vacancy loss both depend on it.

So status is a set of effective-dated periods ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)), and `units.status` is a cached projection of the current one:

- **Every period has a reason and a source.** Fire damage, renovation (linked to the capital project), model, employee housing, office, legal hold, awaiting permit. A renovation's down period opens and closes from the project ([Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#renovations-and-units-offline)), so leasing sees the unit come back with its new attributes.
- **Future periods are allowed.** A renovation scheduled for June takes the unit out of June's availability now, so leasing doesn't sign a lease that starts in the middle of it ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)).
- **A down unit can't have a current lease starting in its down period.** The check runs when a lease is signed and when a down period is created, and the second case is a warning with the conflicting lease named, because damage doesn't wait for leases to end.
- **Corrections are recorded, not overwritten.** Backdating a down period changes past occupancy; record when the correction was made and by whom ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)), because a report sent to a lender in April must be reproducible as sent.

Unit counts follow from this. **Total units** is every unit the property has; **rentable units** on a date excludes those in a non-rentable period; occupancy and leased percentage divide by rentable units (Operating Metrics defines them). Write down which denominator each report uses, because the industry doesn't agree, and the difference between the two on a property with a model and an office is two percentage points of occupancy on a hundred units.

## Addresses, Parcels and Jurisdictions

Three different things are often called "the property's location," and each answers a different question:

- **The mailing address** answers where notices go and what a lease says. It's per building and per unit (a garden community can have a different street address for every building), standardized and validated as [Addresses & Geocoding](/docs/fundamentals/addresses#standardize) describes, with the unit's secondary designator.
- **The parcel** answers who holds title and what the tax bill is. A parcel is the county assessor's unit of land, identified by an assessor's parcel number (the format differs by county) and keyed in practice by county plus that number. A property can span several parcels, a parcel can hold several buildings, and parcels split and merge when land is replatted, so the link from property to parcel is many-to-many and effective-dated. Property tax, assessment appeals, deeds and title all key on the parcel.
- **The jurisdictions** answer which rules apply: state, county, city, and sometimes a special district or an unincorporated area governed by the county. The postal city is not the jurisdiction; an address with a city's name can sit outside its limits, which is exactly the case a rent control or rental registration ordinance turns on ([Postal City, Service Point, Jurisdiction](/docs/fundamentals/addresses#postal-city-service-point-jurisdiction)).

The core model's `properties.subdivision` is the state; this chapter adds the full set of jurisdictions per property, resolved from the geocoded location against boundaries, reviewed by a person when the point is near a boundary, and effective-dated because cities annex land. Landlord-Tenant Law as Data starts its rule resolution from this set, never from the mailing city.

## Identity Across Sources

The same property arrives from many directions: an acquisition's data room, a previous manager's export, a lender's rent roll, a listing site, a market data vendor, the county assessor. Each has its own identifier and its own spelling of the name. Keep a crosswalk of every external ID per property, building and unit, match before creating, and record merges so they can be undone ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids), [Match Before Create](/docs/architecture/record-linkage#match-before-create)). The vendors treat this as core infrastructure now ([The Core Data Model](/books/property-tech/property-business#the-core-data-model) notes RealPage's acquisition of Cherre for exactly this), and the property's parcel numbers and geocoded location are the strongest matching keys there are, much better than its marketing name, which changes with every rebrand.

Units are harder. A previous manager's unit "A-101" may be this system's "101" in building A; a renovation that combines two units retires both and creates a third. Unit merges and splits are recorded as events with the old and new units linked, so a lease history that references a retired unit still resolves.

## How to Build It

Deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model), in the same conventions: `tenant_id` on every row with row-level security, effective dates as `DATERANGE` named `valid_during`.

```sql
-- Groupings that are not the operating tree: owner groups, funds, same-store sets, loan pools.
CREATE TABLE property_groups (
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL REFERENCES tenants (id),
  kind      TEXT NOT NULL CHECK (kind IN ('owner_group', 'fund', 'same_store', 'loan_pool',
              'program', 'pricing_cohort', 'custom')),
  name      TEXT NOT NULL,
  UNIQUE (tenant_id, kind, name)
);

CREATE TABLE property_group_members (
  tenant_id    UUID NOT NULL,
  group_id     UUID NOT NULL REFERENCES property_groups (id),
  property_id  UUID NOT NULL REFERENCES properties (id),
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (group_id WITH =, property_id WITH =, valid_during WITH &&)
);

ALTER TABLE properties
  ADD COLUMN property_subtype TEXT,                 -- 'garden', 'mid_rise', 'high_rise', 'scattered_site'
  ADD COLUMN year_renovated   INT,
  ADD COLUMN status           TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('onboarding', 'active', 'offboarded'));
                                -- read-only after offboarding; history stays

ALTER TABLE buildings
  ADD COLUMN address_id         UUID REFERENCES addresses (id),   -- the playbook's addresses table
  ADD COLUMN first_occupied_on  DATE,                             -- accessibility coverage
  ADD COLUMN has_elevator       BOOLEAN,
  ADD COLUMN stories            INT;

CREATE TABLE floor_plans (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  code          TEXT NOT NULL,                       -- '2B2B-A'
  marketing_name TEXT,
  bedrooms      SMALLINT NOT NULL,                   -- 0 for a studio
  bathrooms     NUMERIC(3, 1) NOT NULL,              -- 1.5 is a real value
  area_sq_ft    INT,
  area_method   TEXT,                                -- 'marketing', 'boma_net', 'boma_gross', ...
  UNIQUE (tenant_id, property_id, code)
);

ALTER TABLE units
  ADD COLUMN floor_plan_id  UUID REFERENCES floor_plans (id),
  ADD COLUMN address_id     UUID REFERENCES addresses (id),       -- includes the secondary unit
  ADD COLUMN floor          TEXT,                                 -- 'G', '1', 'B1'
  ADD COLUMN area_sq_ft     INT,                                  -- overrides the plan's when measured
  ADD COLUMN area_method    TEXT,
  ADD COLUMN accessibility  TEXT[] NOT NULL DEFAULT '{}',         -- 'mobility', 'hearing_vision',
                                                                  -- 'adaptable', 'roll_in_shower'
  ADD COLUMN retired_on     DATE,                                 -- merged, split or demolished
  DROP CONSTRAINT units_kind_check,
  ADD CONSTRAINT units_kind_check CHECK (kind IN ('dwelling', 'commercial_suite', 'storage_unit',
                                         'lot', 'rv_site', 'slip'));

CREATE TABLE unit_status_periods (                   -- units.status is the current one, cached
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  unit_id           UUID NOT NULL REFERENCES units (id),
  status            TEXT NOT NULL CHECK (status IN ('rentable', 'down', 'model', 'employee',
                      'non_revenue')),
  reason            TEXT NOT NULL,                   -- 'renovation', 'fire', 'office', 'legal_hold'
  capital_project_id UUID,                           -- set by Budgets, Forecasts & Capital Projects
  valid_during      DATERANGE NOT NULL,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by       UUID NOT NULL,
  superseded_at     TIMESTAMPTZ,                     -- corrections supersede, never delete
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&) WHERE (superseded_at IS NULL)
);

CREATE TABLE amenities (                             -- per-tenant catalog
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  scope     TEXT NOT NULL CHECK (scope IN ('unit', 'property')),
  code      TEXT NOT NULL,                           -- 'corner', 'renovated_kitchen', 'pool'
  name      TEXT NOT NULL,
  UNIQUE (tenant_id, code)
);

CREATE TABLE unit_amenities (
  tenant_id    UUID NOT NULL,
  unit_id      UUID NOT NULL REFERENCES units (id),
  amenity_id   UUID NOT NULL REFERENCES amenities (id),
  valid_during DATERANGE NOT NULL,                   -- a renovation adds one from a date
  EXCLUDE USING GIST (unit_id WITH =, amenity_id WITH =, valid_during WITH &&)
);

ALTER TABLE rentable_spaces
  ADD COLUMN building_id     UUID REFERENCES buildings (id),
  ADD COLUMN included_with_unit_id UUID REFERENCES units (id),    -- assigned with a unit, no charge
  ADD COLUMN attributes      TEXT[] NOT NULL DEFAULT '{}';        -- 'covered', 'ev_charger', 'accessible'

-- beds (a layer under units for by-the-bed properties) are defined in Student Housing

CREATE TABLE parcels (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  county_fips CHAR(5) NOT NULL,                       -- state + county
  apn         TEXT NOT NULL,                          -- as the assessor formats it
  retired_on  DATE,                                   -- split or merged by replat
  UNIQUE (tenant_id, county_fips, apn)
);

CREATE TABLE property_parcels (
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  parcel_id    UUID NOT NULL REFERENCES parcels (id),
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, parcel_id WITH =, valid_during WITH &&)
);

CREATE TABLE property_jurisdictions (                 -- where rule resolution starts
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  level         TEXT NOT NULL CHECK (level IN ('state', 'county', 'city', 'special_district')),
  code          TEXT NOT NULL,                        -- FIPS place or county code, or a district ID
  name          TEXT NOT NULL,
  valid_during  DATERANGE NOT NULL,                   -- annexations move properties
  resolved_by   TEXT NOT NULL CHECK (resolved_by IN ('boundary_match', 'manual_review')),
  EXCLUDE USING GIST (property_id WITH =, level WITH =, valid_during WITH &&)
);

CREATE TABLE external_ids (                           -- the crosswalk, for any physical record
  tenant_id    UUID NOT NULL,
  record_type  TEXT NOT NULL CHECK (record_type IN ('property', 'building', 'unit', 'parcel')),
  record_id    UUID NOT NULL,
  source       TEXT NOT NULL,                         -- 'prior_manager:acme', 'lender:loan_123'
  external_id  TEXT NOT NULL,
  valid_during DATERANGE NOT NULL,
  UNIQUE (tenant_id, source, external_id, record_type)
);

CREATE TABLE unit_lineage (                            -- merges, splits, renumbering
  tenant_id        UUID NOT NULL,
  from_unit_id     UUID NOT NULL REFERENCES units (id),
  to_unit_id       UUID NOT NULL REFERENCES units (id),
  kind             TEXT NOT NULL CHECK (kind IN ('merge', 'split', 'renumber')),
  effective_on     DATE NOT NULL
);
```

Rentable units on a date, the denominator occupancy uses:

```sql
SELECT u.property_id, COUNT(*) AS rentable_units
FROM units u
JOIN unit_status_periods s
  ON s.unit_id = u.id AND s.superseded_at IS NULL
 AND s.valid_during @> :as_of::date AND s.status = 'rentable'
WHERE u.tenant_id = :tenant_id
  AND (u.retired_on IS NULL OR u.retired_on > :as_of)
GROUP BY u.property_id;
```

Design notes:

- **The operating tree stays single-parent;** every other grouping is a `property_groups` set with dates, so "same store 2026" and "Fund II" are queries, not reorganizations.
- **The manufactured home is not in these tables.** A home on a lot is an asset with a title and an owner, attached to a lot over time, and Military & Specialty Housing adds it; the lot is the unit.
- **Jurisdiction is resolved once and stored,** with how it was resolved. A property near a boundary goes to a person; the answer is effective-dated, and a change emits an event that Landlord-Tenant Law as Data uses to re-evaluate open renewals and notices.
- **Status periods never overlap** for live rows; a correction supersedes the old row, so the history shows both what was believed and what was true.
- **Emit `unit.status_changed`, `unit.retired` and `property.jurisdiction_changed`** for pricing, listings, metrics and rules to consume ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

- **Unit counts per period, reproducible.** Total and rentable units for any past date, with the status periods (as recorded at the time and as corrected) that produced them. Lenders, owners and program auditors compare these with what was reported.
- **Who took a unit offline, why, and for how long,** with the linked project or incident. Long-running "down" units are a known way to flatter occupancy, and an owner's auditor looks for them.
- **Measured areas and their method,** with the date and source of each measurement, because commercial rents and expense allocations are computed from them.
- **Jurisdiction resolution,** including manual reviews and the boundary data version used, since a misresolved city is a misapplied rent cap.
- **Accessible unit inventory and how those units were offered,** for fair housing and program reviews.

## What This Means for the System You Build

- **One operating tree for permissions and configuration,** and effective-dated groupings for ownership, funds, same-store sets and loan pools.
- **Define a property as one owner of record and one jurisdiction,** and split anything that isn't.
- **Make floor plans a table** and keep unit-level differences as dated amenities.
- **Store areas with their measurement method** and never compare areas measured differently.
- **Make lots, storage units, slips and suites first-class units,** keep spaces rented alongside a unit in `rentable_spaces`, and put beds in a layer under units, defined in [Student Housing](/books/property-tech/student-housing#beds-rooms-and-bed-types).
- **Keep unit status as effective-dated periods with reasons,** cache only the current one, and derive rentable counts from the periods.
- **Separate mailing address, parcel and jurisdiction,** resolve jurisdictions from location against boundaries, and date them.
- **Keep a crosswalk of external IDs** and record unit merges and splits as lineage.

## References

**Regulations and standards**

- [24 CFR 100.205: Design and construction requirements](https://www.law.cornell.edu/cfr/text/24/100.205), Fair Housing Act requirements for covered multifamily dwellings first occupied after March 13, 1991, and ground-floor coverage in buildings without elevators
- [24 CFR 8.22: New construction, housing facilities](https://www.law.cornell.edu/cfr/text/24/8.22), Section 504 minimums of 5% of units for mobility and 2% for hearing or vision impairments
- [BOMA Floor Measurement Standards](https://boma.org/boma-standards/), measurement standards for office, industrial, retail, multifamily and hospitality, and mixed-use properties, and their gross and net methods
- [USPS Publication 28, Appendix C2: Secondary Unit Designators](https://pe.usps.com/text/pub28/28apc_003.htm), APT, STE, UNIT, LOT, SPC, SLIP, TRLR and the designators that require a number

**Platforms**

- [RealPage: Property Management Software](https://www.realpage.com/property-management-software/), buildings, floor plans, units and availability across conventional, student, affordable, tax credit, military and senior properties
- [Yardi Breeze: Manufactured Housing Features](https://www.yardibreeze.com/manufactured-housing-features/), community-owned and resident-owned homes, lots, ownership changes and title tracking for homes and RVs
- [Entrata: Job Costing](https://www.entrata.com/products/job-costing), renovation budgets to the unit level and renovated units returning to leasing automatically
