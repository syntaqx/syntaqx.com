+++
title = "Maintenance & Work Orders"
description = "Rental maintenance: intake and after-hours triage, make-ready turns, preventive work, assets, inspections, entry notice, habitability and chargebacks."
category = "Property Tech Industry"
order = 1721
part = "Operations"
tags = ["property-tech", "maintenance", "work-orders", "make-ready", "habitability", "inspections"]
+++

Maintenance is where a rental promise is kept or broken. Rent buys a habitable home, and the law in most of the country says so whether the lease mentions repairs or not, so a leaking supply line at 2 a.m., a dead refrigerator, a unit that has to be painted and cleaned in four days because the next household moves in on Saturday, and a smoke detector that has to be tested every year are all obligations with clocks attached. The work itself (sending a technician, the app in their hand, proof that the job was done) is the same field service problem the [Field Operations](/books/field-operations/field-operations-business) volume covers in depth. What property adds is the relationship around the work: the person reporting the problem lives in the unit but doesn't pay for the repair, the owner pays but often has to approve it, the operator has to give notice before entering someone's home, the law sets repair deadlines that start when the resident complains, and the cost sometimes ends up on the resident's ledger.

This chapter covers that twist: requests and after-hours intake, triage, make-ready turns, preventive maintenance, asset and warranty registers, inspections (including HUD's), entry notice, habitability and repair deadlines, and resident chargebacks. It links to Field Operations for [dispatch](/books/field-operations/dispatch), the [technician app](/books/field-operations/technician-app), [proof of service](/books/field-operations/proof-of-service) and the [contact center](/books/field-operations/contact-center), and extends the `work_orders` table from [the core data model](/books/property-tech/property-business#the-core-data-model). Buying from and paying the vendors who do much of this work is in [Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables).

## How the Platforms Do It

Every suite ships work orders, mobile apps, inspections and make-ready tracking; the differences are in intake automation, turn planning and how charges reach the resident's ledger. From the vendors' own pages:

- **Entrata.** Facilities Management lets teams "manage work orders for your properties and units," schedule "reoccurring work orders," "track time spent and materials costs" for charges to residents, complete work orders and inspections on mobile devices, and run "digital make-ready boards." Facilities Pro adds automatic assignment by skill, location and availability, two-way texting, "masked calling and texting" to protect staff numbers, "AI-driven triage," and a customizable Make Ready Board. Maintenance AI, announced June 11, 2025, takes requests through a chat assistant, with photos and videos, offers troubleshooting suggestions, can "detect emergencies," and escalates to onsite teams. Since May 2024 its Facilities app shows "work order descriptions and notes" in "the maintenance technician's preferred language."
- **RealPage.** Its maintenance product gives "single-view access to maintenance work orders" across properties, a technician app with "offline functionality and auto-sync" and voice-to-text, mobile inspections, "NSPIRE Compliance Tools" with scheduling and "audit-ready reporting," and asset tracking with "warranty information, and lifecycle data." Its AI Facilities Agent will "generate optimized make-ready plans," schedule work "based on technician availability," and prioritize turns "using move-ins and floor plan demand." Its contact center offers to act as residents' "first responders for handling and dispatching service requests 24/7."
- **AppFolio.** The Realm-X Maintenance Performer handles requests "24/7": it talks with residents, reviews photos, suggests simple fixes, flags emergencies using rules the operator sets, escalates under after-hours dispatch rules, routes vendors by issue type, severity and time of day, and texts them from the work order, "under human supervision."
- **Rent Manager.** Service issues track maintenance; inspections can "create service issues for any items that require attention"; and billable expenses can be charged back "to tenants or owners in the form of invoices," with an optional markup. Field staff update the stage from the mobile app and residents sign off on completed work electronically.
- **ResMan.** Work orders and make-ready boards, inventory, purchase orders and charges to the resident ledger tracked by unit, building and common area, with an add-on for inspections, a technician app, preventive maintenance, due diligence and incident tracking, and an AI resident assistant that takes maintenance requests by text.
- **Specialists.** HappyCo sells make-ready and inspection tools that automate "turn timelines and task sequencing," create work orders automatically from inspection findings, and sync with the property management system. Property Meld coordinates maintenance among managers, owners, vendors, residents and technicians, which is the single-family manager's version of the problem: most work goes to outside vendors and many owners must approve spend.

The convergence is clear: intake is becoming an AI conversation with emergency rules on top, turns are planned against move-in dates rather than worked first-come, and inspections feed work orders directly. What still separates products is whether the emergency rules, repair deadlines and entry notice are data the operator and the law control, or behavior buried in the agent.

## Requests and After-Hours Intake

Requests arrive from residents (portal, app, text, phone, email, walk-in), from staff walking the property, from inspections, from preventive schedules, from turns, and increasingly from devices: a leak sensor or a thermostat reporting no heat can open a work order before anyone calls (Access, Smart Buildings & Parking covers the device side in [Sensors and Smart Devices](/books/property-tech/access-and-smart-buildings#sensors-and-smart-devices)). The core table's `source` column records which; this chapter adds `request_channel` for how a resident reached the operator, because the channel decides whether the request counts as written notice for the repair deadlines below.

Three things differ from a homeowner calling a plumber:

- **The reporter isn't the payer.** The household reports, the owner pays, and the platform has to tie the request to the lease (who asked, what they've been told) and to the unit (where the work is). A leak reported in unit 304 may be caused in unit 404, so one root cause can have several requests; triage merges them under one work order and keeps every reporter informed.
- **The request carries consent and access.** Whether the resident gives permission to enter, whether there's a pet, and when someone is home are part of intake, not afterthoughts. The core `permission_to_enter` column holds the resident's answer; [Entry Notice](#entry-notice) covers what the law requires when the answer is no or missing.
- **After hours is the norm for emergencies.** Pipes burst at night, and most site offices are closed then. Operators cover nights and weekends with an on-call technician, an answering service, a suite's contact center, or an AI agent with escalation rules. The call handling itself (routing, overflow, scripts, the handoff to dispatch) is the [contact center](/books/field-operations/contact-center#routing-overflow-and-after-hours) problem; the property part is the emergency definition, which belongs to the operator's policy and the law, not to whoever answers.

My rule for AI intake follows the playbook: an emergency phrase or category routes to a human path before any model reasoning ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model)), the emergency list is configuration per portfolio, and the agent's troubleshooting advice ("reset the GFCI outlet in the bathroom") is logged on the work order like any staff note. Translation helps residents and technicians who don't share a language, but the original text is kept beside the translation, because a disputed repair turns on what the resident actually wrote.

## Triage and Priority

Triage sets three things: the category (plumbing, HVAC, appliance, electrical, pest, locks), the priority, and who does the work.

**Priority** in the core model is `emergency`, `urgent` or `routine`. Emergencies are threats to life, safety or the building: fire, gas, flooding, no heat in cold weather, no water, a door that won't lock, a sewage backup. Urgent work makes part of the home unusable (no refrigerator, one toilet in a one-bathroom unit). Everything else is routine. The categories map to priorities through the operator's policy, and the policy is checked against the law, because some statutes and codes define the clock by condition, as [Habitability and Repair Deadlines](#habitability-and-repair-deadlines) shows.

**Deadlines** are computed and stored, not recalculated on every read: `respond_by` (someone acknowledges and acts) and `complete_by` (the condition is fixed), each derived from the stricter of the operator's service level and any `repair_deadline` rule for the property's jurisdiction, with the rule that decided recorded ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored); the rules model is in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law)).

**Who does it** is a choice between site staff and an outside vendor, and on third-party managed properties often a question of money: a management agreement can cap what the manager may spend on a repair without the owner's approval, often with an exception for emergencies, so a work order over the cap waits for the owner. That cap is data on the agreement ([Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#the-management-agreement) owns it), and the approval is a step on the work order with its own timestamp. Matching a staff technician by skill, location and availability is [dispatch](/books/field-operations/dispatch); sending it to a vendor is a purchase order ([Purchase Orders](/books/property-tech/vendors-and-payables#purchase-orders)).

## Make-Ready Turns

A **make-ready** (or **turn**) is the work that takes a unit from the day the last household leaves to the day it's ready for the next: move-out inspection, trash-out, repairs, paint, flooring, appliance checks, cleaning, a final quality inspection, and then the unit is ready. Every vacant day is vacancy loss, which is why turn time is one of the operating metrics owners watch most closely ([Turns and Maintenance](/books/property-tech/operating-metrics#turns-and-maintenance) defines it, with days vacant and cost per turn).

What makes turns a planning problem, not a list of work orders:

- **The deadline is the next lease.** A pre-leased unit has a move-in date, so the turn is scheduled backward from it; an unleased unit is scheduled by how fast it can be rented, which is why RealPage's agent prioritizes "using move-ins and floor plan demand." The turn record carries both the vacate date and the target ready date.
- **Tasks have an order.** Paint before carpet cleaning, repairs before paint, cleaning last, and the final inspection after cleaning. Vendors (painters, carpet cleaners, cleaners) are booked into slots that depend on each other, so a late painter pushes every later task. A board that shows each unit's stage and the next blocker is the standard view, which is what the suites' make-ready boards and HappyCo's turn timelines provide.
- **Scope comes from the move-out inspection.** The inspection's findings become the turn's tasks, and the same findings decide what is damage the departing household may be charged for and what is normal wear the owner absorbs ([Resident Chargebacks](#resident-chargebacks)). [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#inspections) owns that inspection and the deposit itemization deadline (California's is 21 days from move-out), which runs in parallel with the turn and often needs the turn's invoices.
- **Renovation turns are capital.** A turn that replaces cabinets and counters as part of a value-add program is a capital project with a budget, not an operating repair, and its costs go to a different place on the owner's books ([Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#renovations-and-units-offline)).

The unit's own status stays `rentable` during an ordinary turn, since occupancy is derived from leases; a turn that will take months (fire damage, a full renovation) takes the unit `down` with a reason, as the core model requires.

## Preventive Maintenance

Preventive maintenance is recurring work generated from a schedule: HVAC filter changes and coil cleaning, smoke and carbon monoxide detector tests, water heater flushes, gutter cleaning, fire extinguisher and sprinkler inspections, elevator and backflow inspections required by local codes, and seasonal work like winterizing irrigation. Platforms call it recurring, scheduled or preventive maintenance; Entrata schedules "reoccurring work orders" and ResMan sells preventive maintenance with its inspection add-on.

Generating recurring work from a rule is a solved problem in field service ([RFC 5545 as the Rule Language](/books/field-operations/recurring-schedules#rfc-5545-as-the-rule-language)). The property twist is scope and access: a schedule attaches to an asset (this boiler), a building (every unit in building C), or a property, and a schedule that enters every unit in a building generates one work order per unit, each needing its own entry notice. My default is to generate building-wide in-unit work as a batch with one notice per household, served on the same day, and to report completion per unit, so units the team couldn't enter come back as their own follow-ups.

## Assets and Warranties

An **asset register** lists the equipment the owner is responsible for: appliances, water heaters, HVAC units, boilers, roofs, elevators, each with its location (unit, building or common area), make, model, serial number, install date, warranty end, and expected useful life. RealPage tracks unit-level assets with "warranty information, and lifecycle data," and ResMan pairs inventory with asset tracking.

The register pays for itself three ways. **Warranty first:** before a repair is sent to a vendor, check whether the part is under warranty, because a manufacturer or installer may owe the repair ([Warranty Claims](/books/field-operations/repair-and-installation#warranty-claims-getting-paid-by-someone-else)). **Repair or replace:** a fourth compressor repair on a fourteen-year-old unit is a replacement decision, and the work order history by asset is what supports it. **Reserves and budgets:** expected remaining life by asset is the input to replacement reserve schedules and capital budgets, which [Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#replacement-reserves) owns. Capture the data plate when a technician first touches the equipment, the way the Field Operations app does ([Parts, Equipment and Warranty](/books/field-operations/technician-app#parts-equipment-and-warranty)), so the register fills itself through ordinary work.

## Inspections

Properties are inspected constantly, by different parties for different reasons: move-in and move-out (owned by [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#inspections)), annual unit inspections, preventive walks, lender and insurer inspections, municipal code inspections, due diligence before an acquisition ([Switching Platforms & Acquisitions](/books/property-tech/switching-platforms#onboarding-acquired-properties)), and, for HUD-assisted housing, federal physical inspections.

The federal standard is **NSPIRE** (National Standards for the Physical Inspection of Real Estate). HUD's final rule was published May 11, 2023, applying to public housing from July 1, 2023 and to multifamily housing programs from October 1, 2023. Under it, owners and housing authorities self-inspect, keeping self-inspection records for three years rather than submitting them electronically, and correct deficiencies on a clock: life-threatening and severe deficiencies within 24 hours of the inspection, moderate ones within 30 days, and low ones within 60 days. That is why RealPage sells NSPIRE scheduling and audit-ready reports, and why [Subsidized & Affordable Housing](/books/property-tech/affordable-housing#inspections) treats inspection results as compliance records.

For the platform, inspections share one shape:

- **Templates are versioned.** An inspection runs a template (areas, items, rating scales, required photos) that changes over time, and a completed inspection keeps the version it ran, so a 2024 move-in inspection can be compared item by item with a 2026 move-out.
- **Findings create work.** A deficient item becomes a work order automatically with a priority from its severity; HappyCo and Rent Manager both do this. The finding and the work order link both ways, so an NSPIRE deficiency shows its correction date.
- **Inspections are offline work.** Basements, boiler rooms and parking garages have no signal, so the inspection app stores photos and ratings locally and syncs later ([Offline Sync](/docs/architecture/offline-sync)), as the [technician app](/books/field-operations/technician-app#what-the-platforms-keep-offline) does.
- **Photos are evidence.** Timestamped, unedited photos of conditions are what a deposit dispute, a habitability claim or a HUD review turns on, so they're kept as proof under the rules in [Proof of Service](/books/field-operations/proof-of-service#photos-and-location).

## Entry Notice

A resident's home is theirs to occupy, and entering it is regulated. State law sets when a landlord may enter, how much notice is due, in what form, and at what hours; the details differ in ways the software has to model, not paraphrase:

| Jurisdiction | Notice | Form and hours | Request as consent |
| --- | --- | --- | --- |
| California, Civil Code § 1954 | 24 hours presumed reasonable; 6 days if mailed | Written, with the date, approximate time and purpose; normal business hours | For agreed repairs, an oral agreement to enter within one week needs no written notice |
| Washington, RCW 59.18.150 | 2 days; 1 day to show the unit | Written, with the exact date and time or a window, and a phone number to object or reschedule; reasonable times | Not addressed; the tenant may not unreasonably withhold consent |
| Arizona, A.R.S. § 33-1343 | 2 days | Reasonable times | The tenant's service request is permission to enter for that request |

All three let a landlord enter without notice in an emergency, and California and Washington also after abandonment. California adds entry when the tenant consents at the time and limits entry to listed purposes, including necessary or agreed repairs and showing the unit; Washington forbids using the right of access to harass.

So the platform treats entry as a rule evaluation, not a checkbox:

- **The rule is data.** An `entry_notice` rule for each jurisdiction holds the minimum notice, the mailed-notice period, allowed hours, required content, and whether a service request counts as consent. The rules model and its sources are in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data).
- **The notice is a record.** Each entry has an `entry_notices` row: the work order, the lease, when and how it was served, the entry window, and the rule evaluation that approved it. Serving it is a message through the notification gate ([Notifications & Consent](/docs/architecture/notifications)), and a posted paper notice is recorded with a photo.
- **The schedule respects it.** Dispatch can't book an in-unit visit before the notice period ends unless the resident gave permission or the work order is an emergency, and the technician app shows which applies before the technician knocks. A smart-lock credential for the technician is issued for the notice's entry window only ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)).
- **Emergencies are recorded as such.** An emergency entry without notice records the condition that justified it and a notice left afterward, because "it was an emergency" has to be provable later.

## Habitability and Repair Deadlines

Most US jurisdictions read an **implied warranty of habitability** into residential leases: the landlord must keep the home safe and fit to live in whatever the lease says, measured largely by the housing code, and the tenant's duty to pay rent depends on it. The doctrine traces to *Javins v. First National Realty Corp.* (D.C. Cir. 1970), in which tenants defending an eviction for nonpayment offered a housing inspector's testimony of more than 1,000 code violations. A breach can excuse rent in whole or part, which is why a work order history is evidence in housing court.

Statutes make the standard concrete, and some put clocks on it:

- **What counts.** California's Civil Code § 1941.1 lists the conditions without which a dwelling is untenantable: weather protection, working plumbing and gas, hot and cold running water and sewage, heating, electrical lighting, clean and sanitary premises free of vermin, adequate garbage receptacles, and floors, stairways and railings in good repair. For leases entered into, amended or extended on or after January 1, 2026, it adds a working stove and refrigerator (a tenant may agree in writing to supply their own refrigerator).
- **How fast, by state.** Washington's RCW 59.18.070 requires the landlord to begin remedial action after written notice within 24 hours when the defect cuts off hot or cold water, heat or electricity or is imminently hazardous to life, within 72 hours when it removes the refrigerator, range and oven, or a major plumbing fixture, and within 10 days in other cases.
- **How fast, by city.** New York City's Department of Housing Preservation and Development classifies violations it issues: Class A (non-hazardous) must be corrected within 90 days, Class B (hazardous) within 30, and most Class C (immediately hazardous) within 24 hours, with 21 days for lead-based paint, window guards, mold and pests and 14 for self-closing doors. Owners certify corrections, and certifications may be audited.
- **Federal programs.** HUD-assisted properties add NSPIRE's 24-hour, 30-day and 60-day correction periods, described under [Inspections](#inspections).

Each of these is a `repair_deadline` rule keyed by condition (category and severity) and by trigger: Washington's clock starts at the tenant's written notice, New York's at service of the violation, NSPIRE's at the inspection. That makes two design choices load-bearing. **Record the trigger precisely:** `reported_at` and `request_channel` on the work order, and for code violations the violation number and service date, because a deadline computed from the wrong start is wrong. **Treat a portal or app request as written notice,** which is my rule: it's in writing, it's timestamped, and arguing otherwise in court is a poor position. Where a deadline is missed because the cause was outside the landlord's control (Washington's statute excuses that but still requires action "as soon as possible"), the work order records the reason, the parts on order, and each attempt. Response and completion against these stored deadlines is the work order SLA metric, defined in [Turns and Maintenance](/books/property-tech/operating-metrics#turns-and-maintenance).

## Resident Chargebacks

Some repairs are the household's cost: a window broken by a guest, a disposal jammed with a fork, holes in walls beyond picture hangers, pet damage. The platforms all support charging residents from a work order: Entrata tracks time and materials for "billing residents," Rent Manager charges back "to tenants or owners in the form of invoices" with an optional markup, and ResMan posts charges to the resident ledger from maintenance.

The law draws the line at **normal wear and tear**, and it demands evidence. California's deposit statute (Civil Code § 1950.5) lets a landlord deduct for damage beyond ordinary wear and tear and for cleaning back to move-in condition, and requires the itemized statement to show its work: for the landlord's own labor, a description with the time spent and hourly rate; for a contractor, the bill, invoice or receipt; for materials, a receipt or invoice. Photos are required after move-out before repairs, and again after, starting April 1, 2025, and at the start of tenancies beginning on or after July 1, 2025. Below $125 of combined repair and cleaning deductions the documentation can be skipped unless the tenant asks within 14 days. [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#damage-charges) owns the deposit accounting; the work order is where its evidence comes from.

So a chargeback is a link between a work order and a posted charge, with its basis and evidence:

- **Decide chargeability at triage, confirm at completion.** The core `is_resident_chargeable` flag is set when the cause is known, and the technician's notes and photos at completion either support it or clear it.
- **Price it from the work, not a guess.** Labor at the recorded time and a published rate, parts at cost from the invoice or price list, and any markup only where the lease and law allow it. A flat-rate damage schedule in the lease is common, and its amounts are lease terms, not maintenance settings.
- **Post it through the ledger.** The charge posts to the lease with a charge code like any other ([Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#chargebacks-from-operations) owns the catalog), and a reversal undoes it, never an edit. A chargeback disputed by a resident is answered with the same evidence bundle Field Operations builds for card disputes ([Evidence for Disputes and Chargebacks](/books/field-operations/proof-of-service#evidence-for-disputes-and-chargebacks)).
- **Owners get chargebacks too.** On third-party managed properties, work the manager's staff performs is billed to the owner, sometimes with a markup set in the management agreement, and that bill follows the agreement's terms rather than the resident's lease.

## How to Build It

These are deltas against [the core data model](/books/property-tech/property-business#the-core-data-model): `work_orders` gains intake, deadline and linkage columns, and new tables hold turns, preventive schedules, assets, inspections, entry notices and chargebacks. Entry and repair deadlines resolve through `legal_rules` and are recorded in `rule_evaluations`, both defined in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it). Visits, routes and technician app records are the Field Operations tables.

```sql
CREATE TABLE unit_turns (                -- one make-ready, from vacate to ready
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  unit_id           UUID NOT NULL REFERENCES units (id),
  prior_lease_id    UUID REFERENCES leases (id),   -- the household that left
  next_lease_id     UUID REFERENCES leases (id),   -- set when pre-leased
  kind              TEXT NOT NULL CHECK (kind IN ('standard', 'renovation')),
  vacated_on        DATE NOT NULL,
  target_ready_on   DATE NOT NULL,                  -- next move-in, or a policy target
  ready_on          DATE,                           -- when the final inspection passed
  status            TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'ready',
                      'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE turn_tasks (                -- ordered steps; each may become a work order
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  turn_id          UUID NOT NULL REFERENCES unit_turns (id),
  kind             TEXT NOT NULL,                  -- 'trash_out', 'repair', 'paint', 'flooring', 'clean', 'final_inspection'
  sequence         SMALLINT NOT NULL,
  depends_on_task_id UUID REFERENCES turn_tasks (id),
  scheduled_on     DATE,
  completed_at     TIMESTAMPTZ,
  UNIQUE (turn_id, sequence)
);

CREATE TABLE property_assets (           -- the asset and warranty register
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  building_id         UUID REFERENCES buildings (id),
  unit_id             UUID REFERENCES units (id),   -- null for common-area equipment
  category            TEXT NOT NULL,                -- 'water_heater', 'hvac', 'refrigerator', 'roof', 'elevator'
  make                TEXT,
  model               TEXT,
  serial_number       TEXT,
  installed_on        DATE,
  warranty_ends_on    DATE,
  expected_life_years SMALLINT,
  removed_on          DATE,                         -- replaced assets stay, with history
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pm_schedules (              -- preventive maintenance rules
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  building_id  UUID REFERENCES buildings (id),      -- scope: a building's units
  asset_id     UUID REFERENCES property_assets (id),  -- or one asset
  name         TEXT NOT NULL,                       -- 'Smoke and CO detector test'
  category     TEXT NOT NULL,
  in_unit      BOOLEAN NOT NULL,                    -- true: one work order and notice per unit
  rrule        TEXT NOT NULL,                       -- RFC 5545, e.g. 'FREQ=YEARLY;BYMONTH=10'
  valid_during DATERANGE NOT NULL
);

CREATE TABLE inspections (               -- every kind; move-in/out and subsidy chapters extend it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  unit_id          UUID REFERENCES units (id),       -- null for common areas or a whole site
  lease_id         UUID REFERENCES leases (id),      -- move-in and move-out
  turn_id          UUID REFERENCES unit_turns (id),
  kind             TEXT NOT NULL CHECK (kind IN ('move_in', 'pre_move_out', 'move_out',
                     'make_ready', 'annual', 'preventive', 'quality', 'nspire_self',
                     'nspire_hud', 'hcv', 'lender', 'municipal', 'due_diligence')),
  template_version_id UUID NOT NULL,                 -- the template as it was when run
  standard         TEXT,                             -- 'NSPIRE', 'NSPIRE-V', a state or lender standard
  status           TEXT NOT NULL CHECK (status IN ('offered', 'scheduled', 'in_progress',
                     'completed', 'signed', 'disputed', 'cancelled')),  -- signed, disputed: move-in/out
  scheduled_for    TIMESTAMPTZ,
  inspected_by     UUID REFERENCES users (id),       -- staff, vendor, or the resident's own user
  inspected_at     TIMESTAMPTZ,                      -- when completed
  result           TEXT CHECK (result IN ('pass', 'fail', 'inconclusive')),  -- scored standards
  external_reference TEXT,                           -- HUD inspection or code violation number
  supersedes_id    UUID REFERENCES inspections (id), -- re-inspections and amendments are new rows
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status NOT IN ('completed', 'signed', 'disputed')
         OR (inspected_by IS NOT NULL AND inspected_at IS NOT NULL))
);

CREATE TABLE inspection_findings (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  inspection_id   UUID NOT NULL REFERENCES inspections (id),
  area            TEXT,                              -- 'kitchen', 'bedroom_2', 'roof'
  item            TEXT NOT NULL,                     -- template item key
  rating          TEXT NOT NULL,                     -- template scale: 'good', 'damaged', 'missing'
  severity        TEXT CHECK (severity IN ('life_threatening', 'severe', 'moderate', 'low')),
  cure_by         DATE,                              -- NSPIRE or code correction deadline
  asset_id        UUID REFERENCES property_assets (id),  -- the register entry, for useful life
  media           JSONB NOT NULL DEFAULT '[]',       -- [{sha256, captured_at, received_at, source}]
  note            TEXT,
  UNIQUE (inspection_id, area, item)
);

ALTER TABLE work_orders
  ADD COLUMN category              TEXT,              -- 'plumbing', 'hvac', 'appliance', 'electrical'
  ADD COLUMN request_channel       TEXT CHECK (request_channel IN ('portal', 'app', 'sms',
                                     'phone', 'email', 'in_person', 'device')),
  ADD COLUMN reported_at           TIMESTAMPTZ,       -- starts statutory clocks
  ADD COLUMN respond_by            TIMESTAMPTZ,       -- computed, stored with the rule that set it
  ADD COLUMN complete_by           TIMESTAMPTZ,
  ADD COLUMN deadline_evaluation_id UUID REFERENCES rule_evaluations (id),
  ADD COLUMN merged_into_id        UUID REFERENCES work_orders (id),  -- duplicate reports
  ADD COLUMN turn_id               UUID REFERENCES unit_turns (id),
  ADD COLUMN asset_id              UUID REFERENCES property_assets (id),
  ADD COLUMN pm_schedule_id        UUID REFERENCES pm_schedules (id),
  ADD COLUMN inspection_finding_id UUID REFERENCES inspection_findings (id),
  ADD COLUMN owner_approval_status TEXT CHECK (owner_approval_status IN ('not_required',
                                     'pending', 'approved', 'declined')),
  ADD COLUMN reported_text         TEXT,              -- the resident's words, untranslated
  ADD COLUMN reported_language     TEXT;              -- BCP 47

CREATE TABLE entry_notices (             -- one per planned entry into an occupied unit
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  work_order_id      UUID NOT NULL REFERENCES work_orders (id),
  lease_id           UUID NOT NULL REFERENCES leases (id),
  basis              TEXT NOT NULL CHECK (basis IN ('notice', 'resident_permission',
                       'request_as_consent', 'emergency', 'abandonment', 'court_order')),
  served_at          TIMESTAMPTZ,                     -- null for emergency entries until after
  method             TEXT CHECK (method IN ('personal', 'posted', 'first_class_mail',
                       'email', 'sms', 'portal')),  -- The Lease's delivery vocabulary
  entry_window       TSTZRANGE NOT NULL,
  purpose            TEXT NOT NULL,
  message_id         UUID,                            -- the notification log row
  rule_evaluation_id UUID NOT NULL REFERENCES rule_evaluations (id),
  entered_at         TIMESTAMPTZ,                     -- from the visit or the lock's access event
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE work_order_chargebacks (    -- a work order's cost posted to a ledger
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  work_order_id  UUID NOT NULL REFERENCES work_orders (id),
  charge_id      UUID REFERENCES charges (id),          -- the posted resident charge
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),  -- owner_billable: the
                                                      -- owner ledger entry (Payments)
  basis          TEXT NOT NULL CHECK (basis IN ('damage_beyond_wear', 'cleaning',
                   'lease_damage_schedule', 'resident_caused', 'owner_billable')),
  labor_minutes  INT,
  labor_rate     BIGINT,                              -- minor units per hour
  evidence_ids   UUID[] NOT NULL,                     -- photos, invoices, finding ids
  created_by     UUID NOT NULL REFERENCES users (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (charge_id),
  CHECK ((basis = 'owner_billable') = (ledger_transaction_id IS NOT NULL)),
  CHECK (num_nonnulls(charge_id, ledger_transaction_id) = 1)
);
```

Design notes:

- **Deadlines are stored with their rule.** `respond_by` and `complete_by` are set when the work order is triaged, from the stricter of the operator's service level (a `tenant_policies` row) and any `repair_deadline` rule, and `deadline_evaluation_id` says which won. Reprioritizing recomputes and records a new evaluation; the old one stays.
- **Duplicates merge, they don't delete.** `merged_into_id` keeps each reporter's request and its timestamp, because the earliest report starts the statutory clock and every reporter is owed updates.
- **One entry, one notice row.** The entry check runs at scheduling and again at check-in, and `entered_at` comes from the visit record or the smart lock's access event, so an entry outside the window shows up in a query.
- **Owner chargebacks are not resident chargebacks.** `owner_billable` work posts to the owner's ledger under the management agreement, not to a lease; the same table records both so a work order's whole cost is traceable.
- **One inspections table for every kind.** This chapter owns `inspections` and `inspection_findings`; [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#how-to-build-it) adds the baseline comparison, notice and sealing columns, and [Affordable Housing](/books/property-tech/affordable-housing#how-to-build-it) ties subsidy inspections to HAP contracts.
- **Inspections never update in place.** A re-inspection is a new row (`supersedes_id`); findings link to the work orders they created through `work_orders.inspection_finding_id`.
- **Emit events.** `work_order.reported`, `work_order.deadline_set`, `work_order.completed`, `turn.ready`, `inspection.completed` and `entry_notice.served` feed notifications, owner reporting and the turn board.

## Auditing

Maintenance records are evidence in habitability defenses, deposit disputes, entry complaints, HUD reviews and owner disputes over spend. Keep them so each question has an answer from the record ([Audit Trails](/docs/architecture/audit-trails)):

- **When the operator knew.** Every request with its channel and timestamp, duplicates included, and the resident's original words, so the start of each repair clock is provable.
- **Which deadline applied and why.** The rule evaluation behind each `respond_by` and `complete_by`, with the rule's version and source, and every change of priority with who made it.
- **What was done, and when.** Visits, notes, photos and completion from the Field Operations records, with the reasons for any delay (parts on order, no access, a condition outside the operator's control).
- **Every entry.** The notice served, its method and window, the basis for any entry without notice, and the actual entry time from the visit or lock log.
- **Every chargeback.** The finding, the evidence and the pricing behind each charge, linked to the posted charge and any reversal.
- **Inspections as run.** The template version, the inspector, the findings with photos, and the work orders they created, kept as long as NSPIRE (three years for self-inspections) and the operator's retention schedule require ([Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds)).

## What This Means for the System You Build

- **Link Field Operations for the work** and build the property relationship around it: reporter, payer, approver and the person whose home is entered are different parties.
- **Make emergencies policy plus law,** configured per portfolio, with emergency intake routed to a human before any model reasons about it.
- **Compute repair deadlines from rules** keyed by condition and trigger, store them on the work order with the rule that set them, and record `reported_at` precisely.
- **Treat a written request in the portal or app as notice** for statutory clocks.
- **Plan turns backward from the next move-in,** with ordered tasks, dependencies and a board, scoped by the move-out inspection.
- **Keep an asset register** that fills itself from ordinary work and checks warranty before a repair is bought.
- **Version inspection templates,** create work orders from findings, and keep NSPIRE correction clocks on the findings.
- **Model entry as a rule evaluation and a record:** notice served, window, basis, and the actual entry time, with smart-lock credentials limited to the window.
- **Post chargebacks through the ledger** with their basis and evidence, separate resident from owner chargebacks, and never edit a posted charge.

## References

**Statutes and regulations**

- [California Civil Code § 1954](https://california.public.law/codes/civil_code_section_1954), purposes of entry, 24 hours' written notice presumed reasonable (6 days if mailed), notice contents, business hours, oral agreement for repairs within one week, emergency, consent and abandonment exceptions
- [California Civil Code § 1941.1](https://california.public.law/codes/civil_code_section_1941.1), the conditions that make a dwelling untenantable, including stove and refrigerator for leases from January 1, 2026
- [California Civil Code § 1950.5](https://california.public.law/codes/civil_code_section_1950.5), deductions for damage beyond ordinary wear and tear, the 21-day statement, photo requirements from April 1 and July 1, 2025, labor, invoice and receipt documentation, the $125 threshold
- [Washington RCW 59.18.070](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.070), 24-hour, 72-hour and 10-day deadlines to begin repairs after written notice
- [Washington RCW 59.18.150](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.150), two days' written notice to enter, one day to show, notice contents, emergency and abandonment
- [Arizona Revised Statutes § 33-1343](https://www.azleg.gov/ars/33/01343.htm), two days' notice, emergency entry, and a tenant's service request as permission to enter
- [Federal Register: NSPIRE final rule (May 11, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-05-11/html/2023-09693.htm), effective dates for public housing and multifamily, self-inspection records kept three years, 24-hour, 30-day and 60-day correction periods
- [NYC HPD: Clear Violations](https://www.nyc.gov/site/hpd/services-and-information/clear-violations.page), correction periods by violation class and the exceptions, certification of correction

**Reference**

- [Cornell LII: Implied warranty of habitability](https://www.law.cornell.edu/wex/implied_warranty_of_habitability), the doctrine, its recognition in most US jurisdictions, *Javins* as its origin
- [Wikipedia: Javins v. First National Realty Corp.](https://en.wikipedia.org/wiki/Javins_v._First_National_Realty_Corp.), the 1970 D.C. Circuit decision, the tenants sued for nonpayment and the inspector's testimony of more than 1,000 code violations

**Platforms**

- [Entrata: Facility Management](https://www.entrata.com/products/facility-management), work orders, recurring work orders, time and materials for resident charges, mobile inspections, make-ready boards
- [Entrata: Facilities Pro](https://www.entrata.com/products/facilities-pro), routing by skill, location and availability, two-way texting, masked calling, AI triage, make-ready board
- [Entrata: AI-powered maintenance (June 11, 2025)](https://www.entrata.com/press/ai-powered-maintenance), Maintenance AI intake with photos and video, troubleshooting, emergency detection
- [Entrata: Centralization, Homebody Marketplace and AI features (May 2024)](https://www.entrata.com/press/entrata-unveils-expansion-of-centralization-functionality-homebody-marketplace-and-ai), work order translation into the technician's preferred language
- [RealPage: Maintenance Management](https://www.realpage.com/property-management-software/maintenance-management/), multi-property work orders, offline app with voice-to-text, inspections, NSPIRE compliance tools, asset warranty and lifecycle tracking
- [RealPage: AI Facilities Agent](https://www.realpage.com/property-management-software/ai-facilities-agent/), make-ready plans, scheduling by technician availability, turn priority by move-ins and floor plan demand
- [RealPage: Contact Center](https://www.realpage.com/contact-center/), 24/7 handling and dispatching of service requests, after-hours emergency routing
- [AppFolio: Realm-X Performers](https://www.appfolio.com/product-demos/realm-x-performers), 24/7 maintenance intake, operator-set emergency rules, after-hours dispatch, vendor routing, human supervision
- [Rent Manager: Maintenance](https://www.rentmanager.com/maintenance/), service issues, chargebacks to tenants or owners with markup, inspections creating service issues, mobile stage updates
- [ResMan: Maintenance](https://www.myresman.com/solutions/maintenance/), work orders, make-ready boards, inventory and resident ledger charges, inspections and preventive maintenance add-on, AI resident assistant
- [HappyCo: Make Ready](https://happy.co/solutions/processes/make-ready), turn timelines and task sequencing, inspections that create work orders, PMS sync
- [Property Meld](https://propertymeld.com/), maintenance coordination among managers, owners, vendors, residents and technicians
