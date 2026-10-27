+++
title = "The Technician App"
description = "The field app: what vendors keep offline, field conflict rules, forms and readings, parts and equipment, flat-rate selling, payments, time and devices."
category = "Field Operations Industry"
order = 1513
part = "In the Field"
tags = ["field-operations", "mobile", "offline", "forms", "pricebook", "time-tracking"]
+++

The office runs on a desktop with fiber. The technician runs on a phone in a crawlspace, a basement mechanical room, an attic air handler, a rural route with one bar, or a high-rise utility closet with none. Everything the business promises the customer (arrive in the window, diagnose and fix the problem or do the service, record what was measured and applied, sell the repair or the plan, take the payment, send the report) happens through that phone, and most of it has to keep working when the network doesn't. That makes the technician app the hardest client in a field operations platform: an offline database, a forms engine, a parts catalog, a point of sale, a time clock and a compliance recorder, running on hardware the company may not own, used with gloves on.

The generic machinery (a scoped local store, a command outbox, two clocks, conflict policies, the native versus web choice) is in [Offline-First Sync](/docs/architecture/offline-sync). This chapter is the field-specific part: what the platforms keep on the device, which conflicts field work produces, and what the app has to capture for each trade.

## The Shape of a Technician's Day

The sequence is close to the same across trades, and it drives the data model:

1. **Load the day.** The route, the stops in order, each customer's notes, gate codes, pets, equipment on site and service history.
2. **Head out.** An "on my way" message with a live link ([Customer Communications](/books/field-operations/customer-communications)).
3. **Arrive and check in.** A timestamp, a location, and often a geofence check.
4. **Do the work.** For recurring service, a checklist, products applied and devices scanned. For repair, a diagnosis: readings, the failed part, photos of the data plate. For install, the new equipment's model and serial, commissioning readings and the old unit's disposal.
5. **Sell.** A repair priced from a flat-rate book, an upgrade, a maintenance plan, signed on the glass.
6. **Collect.** A card tap, a card on file, a check, cash, financing or a payment link.
7. **Complete.** Signature, required evidence, a service report to the customer ([Proof of Service](/books/field-operations/proof-of-service)), and the next stop.

Steps 1 and 7 are where connectivity bites. Loading the day needs a connection; completing it must not. Repair work adds a third pinch point in the middle: whether the part is on the truck, and if not, ordering it.

## What the Platforms Keep Offline

Offline support ranges from "the job you opened stays loaded" to a full local database with configurable sync. The vendors' documentation is candid about where each draws the line:

| Platform | Works offline | Needs a connection |
| -------- | ------------- | ------------------ |
| Dynamics 365 Field Service | Offline-first after first download, with sync intervals per table in an offline profile | Maps and Dataverse search |
| FieldRoutes Mobile | Check in and out, completion, notes, products, equipment scans, signatures, photos; sales flows including new customers and signed agreements | Unopened routes, scheduling, charging cards or ACH, texting, new contracts, login |
| GorillaDesk | The current week, loaded online first; status, check-in times, notes, materials | Invoices and job details are read-only |
| Housecall Pro | Jobs opened online beforehand are stored, up to a cap; editing offline "is not supported at this time" | Everything else |
| Salesforce Field Service | Offline briefcases prime the records each worker's profile needs; critical changes sync every five minutes | Varies by flow |
| ServiceTitan Field Mobile | Status, time, notes, signatures, photos, findings, forms, most estimate work, standard pricebook pricing | Purchase orders, inventory availability, financing, contracts and proposals, swipe and Tap to Pay, dynamic pricing |
| Successware | A dedicated offline mode, with jobs staying active once loaded and syncing when a stable connection returns | Not published |
| Zuper | Opt-in per company; assigned jobs "primed" at login with related records two levels deep, including assets and parts, expiring after one day | Accepting jobs, quotes and invoices, chat, previously added attachments |

The pattern is consistent: the work itself (status, notes, photos, forms, readings) is offline everywhere that offers offline at all, and anything touching shared, scarce or external state (inventory availability, purchase orders, live card authorization, financing, new contracts) needs a signal, the same line [What Stays Online](/docs/architecture/offline-sync#what-stays-online) draws in general. Solea draws it further in: its field app keeps the schedule and inspections working offline, while "checkout, signatures and payments need a connection." Where to draw it, per flow, is the first real decision, and the answer differs by trade: a route of mostly exterior recurring service can live offline all day, while an HVAC repair that needs a part checked against the warehouse can't finish the sale without one.

## What the Device Holds

The scope of the local store is the field version of the generic rule: exactly what one technician needs, defined on the server per role, expiring and wiped on sign-out. For a field app that means:

- **The route** for today and the next few days, with each stop's customer, property, access notes and enough history to be useful (last three visits, open findings, the last readings).
- **Equipment at each property:** make, model, serial, install date and warranty status, so a repair starts from what's there instead of a fresh data-plate photo every time.
- **The pricebook** as a versioned snapshot: services, flat-rate tasks, parts, labor rates and the good, better and best groupings, with the version stamped on every line quoted.
- **Form definitions** by version, so a checklist filled offline is bound to the definition it was filled against.
- **The product and parts catalog,** with what this truck is supposed to carry ([Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety) covers van stock).
- **Safety data sheets** for products on the van, under the access rule in [Regulated Materials](/books/field-operations/regulated-materials#safety-data-sheets).

A technician's phone shouldn't hold the whole customer list. Zuper's one-day expiry on primed data is a bound worth copying.

Work recorded offline is a queue of commands replayed in order, not a copy of rows. A field example of the outbox:

![Offline sync: a tap of Complete with no signal makes one local write to the record and the outbox, and the screen shows items waiting to sync; on reconnect the outbox replays in order to the server, which skips command IDs it has already applied, compares the base version and checks rules, and either applies it, appends it beside newer office changes, or sends a state conflict to a review queue; an acknowledgement removes the command and the device pulls new versions.](/diagrams/fo-technician-app-outbox.svg "Offline work is a queue of commands, not a copy of rows. The server deduplicates, checks each command against current state, and only the true conflicts reach a person.")

The field delta on [Two Clocks](/docs/architecture/offline-sync#two-clocks) is how many regulated records hang off the device clock: the visit, the pesticide application record (`applied_at`), the refrigerant log and the timesheet all take the time the technician did the work (`device_recorded_at`), and `received_at` only explains why the office saw it late.

## Conflicts in Field Work

Field work produces a predictable set of conflicts, because the office keeps planning while the technician is underground. Oracle Field Service, which replays offline actions in chronological order, documents three of them: a route deactivated offline while the office added an activity; an activity completed offline after the office moved it to someone else; an activity completed offline that the server had already set to not done.

I decide per command type, as [Conflicts: Choosing Who Wins](/docs/architecture/offline-sync#conflicts-choosing-who-wins) sets out. The field assignments:

- **From the field:** arrival, departure, readings, products applied, parts used, photos, signatures and payments. A completion on a visit reassigned mid-work is recorded against the visit; the reassignment is what gets fixed.
- **From the office:** schedule, assignment, route order, pins and pricebook changes.
- **To the dispatcher's review queue:** "Complete" on a visit the office set to `cancelled`, a `not_completed` reason on a visit the office already rebooked, or a sale on an agreement the office terminated.

## Forms, Checklists and Readings

Every trade has its paperwork: a pest inspection with findings by area, an HVAC maintenance checklist with refrigerant pressures and temperature split, a plumbing backflow test, a pool chemistry log, a cleaning inspection with scores by room. The platforms converge on configurable forms. Jobber's checklists have sections, required items with a progress bar, field types from short text to signature, and photo markup. ServiceTitan's technician forms are attached by office-defined triggers, distinguish Save from Complete, enforce required fields and can be completed offline.

Some of those forms are regulatory documents in their own right. Texas's backflow test report (form TCEQ-20700) is a good example of how much structure one carries: the assembly's type, manufacturer, model and serial; each check valve "held at" a reading in psid, closed tight or leaked; the relief valve's opening point; repairs and materials, then a test after repair; and the differential pressure gauge's serial number and last accuracy test, which must be within 12 months. The instructions say the form is meant to be completed on site while testing, that an electronic device used to fill it "must also be on-site," and that a signed original goes to the public water system unless approved electronic recordkeeping is in use. A plumbing app that captures this as free text can't produce the form; one that captures it as typed fields can.

Readings increasingly arrive from instruments rather than thumbs. measureQuick, an HVAC diagnostic app, reads Bluetooth probes and compares measured superheat and subcooling with the target for the metering device. Its ServiceTitan integration attaches a PDF report, photos, notes and status tags to the job, but its documentation doesn't describe the readings themselves syncing as structured data. Pool apps go the other way: Pool Brain calculates chemical dosing in the app when the technician enters readings, and Skimmer gives real-time LSI calculations and dosing recommendations, so the reading drives the next action on the spot.

To build it (tables in [How to Build It](#how-to-build-it)): a **form definition** is versioned data (sections, fields, types, units, validation, visibility conditions, which answers are required to complete). An answer set binds to the definition version it was filled against, so changing the form next month never reinterprets last month's answers. Evaluate required and conditional logic on the device (it must work offline) and again on the server (the device can be wrong or old). My default is to promote a few fields to typed data the rest of the platform reads, rather than leaving everything in a JSON blob:

- **Readings with units and their source** (typed, or from which probe and its serial), because a reading out of range creates a follow-up and a gauge past its calibration date invalidates a test.
- **Findings** that create a quote or a deficiency on the property.
- **Products applied and refrigerant added or recovered,** which feed the records in [Regulated Materials](/books/field-operations/regulated-materials).

## Parts, Equipment and Warranty

Repair and install work changes what the app has to know. A pest or lawn route consumes product from the van; an HVAC or plumbing call consumes specific parts, and whether the part is on the truck decides whether the job finishes today.

- **Parts on the truck.** The device holds what this truck should carry and what it has used today, so a technician can quote a capacitor replacement with confidence offline. Whether the warehouse has the compressor is a live question: ServiceTitan lists inventory availability and purchase orders among the things that need a connection. My default is to let the technician quote and sell offline with the part marked "to confirm," and have the server check stock and raise the order on sync, telling the office before the customer is promised a date.
- **Parts used become stock movements.** A part added to the invoice on site is a deduction from that truck's stock, and ServiceTitan turns materials used into replenishment purchase orders. The inventory ledger lives with [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety).
- **The app is where equipment gets captured.** Assets, warranty terms and registration deadlines are owned by [Equipment Is an Asset](/books/field-operations/repair-and-installation#equipment-is-an-asset); the app's part is to capture the data plate as a photo and as fields (scanned where the label has a barcode), on the property rather than the job, and to make model, serial and install date required on the install form, because those three start the registration deadline when the job completes.

Commercial work adds service-level terms (response within four hours, a quarterly inspection of every rooftop unit), so the app also shows which asset the visit covers and which contractual task it satisfies. [Service Agreements](/books/field-operations/service-agreements) covers the contract side.

## Selling From the Pricebook

The technician is often the best salesperson the company has, because they're standing next to the failing equipment. Repair trades mostly sell from a **flat-rate pricebook** (a price per task, so the customer approves a number before work starts), lawn, pest and cleaning from measured prices, and all of them present good, better and best options on the phone. How the books are built and what each vendor offers is in [Pricebooks: Where Prices Come From](/books/field-operations/pricing-and-sales-rules#pricebooks-where-prices-come-from) and [Good-Better-Best and Proposals](/books/field-operations/pricing-and-sales-rules#good-better-best-and-proposals).

The engineering issue is that prices change and phones are offline. ServiceTitan's offline matrix shows the boundary: standard pricebook pricing works offline, but "dynamic pricing rates require a connection." Build the pricebook as versioned snapshots synced to the device, and stamp every estimate line with the pricebook version and price it was quoted from. When a sale quoted on yesterday's prices syncs, the server honors what the customer signed (the signed document is the contract) and flags the variance rather than repricing silently. A flat-rate task bundles parts and labor, so the line also records which parts it assumed, which is what lets the server check stock afterwards. Discount limits, approval thresholds, tax codes and the final price checks belong in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules), and the signature ceremony in [Signing the Agreement](/books/field-operations/signing-the-agreement).

## Payments in the Field

The field is where card-present, card-on-file and paper payments meet, often in the same driveway:

- **ServiceTitan** holds keyed cards, checks, ACH, mobile check capture and cash securely offline and processes them "automatically on reconnect," tracked on a Deferred Payments screen; swipe and Tap to Pay need a connection.
- **FieldRoutes** says "charging customers always needs a signal," while the same article describes offline card charges becoming pending charges that process on reconnect.

These are different risk positions, not different features. A payment captured offline isn't authorized: the card can decline hours later, after the technician has left with the customer believing they paid. [Card-Present Payments](/books/payments/card-present) covers why approved offline isn't paid. The field rules:

- **Model offline payments as their own state** (captured, not authorized), visible to the office, with a per-company limit and an automatic follow-up when they fail. A $9,000 system replacement and a $120 quarterly service shouldn't share a limit.
- **Keep card data out of your app.** Use the processor's SDK or a certified reader so the phone never holds a card number ([Sensitive Data](/docs/payments/sensitive-data)).
- **Record the tender exactly:** entry mode, last four, check number, the cash amount and who holds it until deposit. Cash and checks in a van are a reconciliation problem before they're a payment.
- **Saving a card for future service** is a stored-credential agreement ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)) and belongs with [Billing Recurring Service](/books/field-operations/billing-recurring-service). Financing presentment is in [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules).

## Time Tracking

The app is usually also the time clock. ServiceTitan tracks clock in and out, meal breaks and timesheet entries offline; FieldRoutes has timer categories for working, paid break and lunch. Swept, for janitorial crews, only lets cleaners clock in on site and flags off-site punches.

Wage law decides what the clock must capture: job-to-job travel, the supply house run and waiting on site are hours worked, so a clock that only runs "on site" undercounts. Which minutes count is in [What Counts as Hours Worked](/books/field-operations/technician-workforce#what-counts-as-hours-worked), and the record, rounding and correction rules in [Timekeeping and Pay Statements](/books/field-operations/technician-workforce#timekeeping-and-pay-statements). For the app:

- **Derive time from status events where possible** (traveling, on site, at the supply house, on break), and keep manual edits as separate, attributed corrections.
- **Keep raw punches immutable.** Rounding, if any, is a payroll computation over the raw record, never a rewrite of it.
- **Store device time, server time and location for each punch,** and never require a signal to clock in.

[Technicians: Time, Pay & Labor Rules](/books/field-operations/technician-workforce#how-to-build-it) classifies these punches into `time_entries` and earnings; the export, earning types and cutoffs are in [Paying It: Payroll Integration](/books/field-operations/sales-teams-and-commissions#paying-it-payroll-integration).

## Devices and Peripherals

The company either issues devices or lets technicians use their own, and the app behaves differently in each case.

- **Company-owned devices** can be fully managed. Android's dedicated device mode lists field service management as a use case, and lock task mode restricts a device to an allowlisted set of apps. Apple's deployment program covers automated device enrollment, supervision and managed app distribution. Managed devices let you push app versions, enforce a passcode and encryption, and wipe a lost phone.
- **Personal devices** can't be locked down, so the app protects itself: an app-level lock, encrypted local storage, a remote sign-out that deletes the local database on next launch, and a short expiry on cached data.

Field apps also talk to hardware: card readers, Bluetooth gauges and probes, barcode scanners for bait stations and parts, label and receipt printers. That's most of why I'd build the technician app natively or in React Native with native modules for the database, outbox, payments and peripherals, and not as a progressive web app; the trade-offs are in [Native, React Native or a PWA](/docs/architecture/offline-sync#native-react-native-or-a-pwa). Either way, keep the fleet's app versions within a known window, because an old app replaying commands against a new server is a compatibility problem you'll otherwise discover in production ([Mobile Releases](/docs/delivery/mobile-releases)).

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model) with the three records the app creates that no other chapter owns: form answers, raw time punches and field payments. Payroll classifies hours from the punches; this table is only the immutable record of what the device saw. Each row carries both clocks; the outbox and sync machinery is in [Offline-First Sync](/docs/architecture/offline-sync).

```sql
CREATE TABLE form_definitions (          -- versioned; never edited once published
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  key          TEXT NOT NULL,            -- 'hvac_maintenance', 'tceq_20700', 'pool_chemistry'
  version      INTEGER NOT NULL,
  definition   JSONB NOT NULL,           -- sections, fields, types, units, validation, visibility
  published_at TIMESTAMPTZ,
  UNIQUE (tenant_id, key, version)
);

CREATE TABLE form_answer_sets (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  form_definition_id UUID NOT NULL REFERENCES form_definitions (id),  -- the version filled
  visit_id           UUID NOT NULL REFERENCES visits (id),
  asset_id           UUID REFERENCES assets (id),
  answers            JSONB NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('saved', 'completed')),
  device_recorded_at TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE readings (                  -- the answers the rest of the platform reads
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                UUID NOT NULL,
  form_answer_set_id       UUID NOT NULL REFERENCES form_answer_sets (id),
  asset_id                 UUID REFERENCES assets (id),
  quantity                 TEXT NOT NULL,  -- 'superheat', 'free_chlorine', 'check_valve_1'
  value                    NUMERIC NOT NULL,
  unit                     TEXT NOT NULL,  -- 'degF', 'ppm', 'psid'
  source                   TEXT NOT NULL CHECK (source IN ('typed', 'probe')),
  instrument_serial        TEXT,
  instrument_calibrated_on DATE            -- a gauge past its date invalidates the test
);

CREATE TABLE time_punches (              -- raw punches; rows are never edited; corrections are new rows
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  staff_member_id        UUID NOT NULL REFERENCES staff_members (id),
  work_order_id          UUID REFERENCES work_orders (id),  -- null for shift and break
  kind                   TEXT NOT NULL CHECK (kind IN ('shift', 'travel', 'on_job', 'break')),
  started_at             TIMESTAMPTZ NOT NULL,              -- device time of the event
  ended_at               TIMESTAMPTZ,                       -- null while running
  source                 TEXT NOT NULL CHECK (source IN ('status_event', 'punch', 'correction')),
  corrects_punch_id      UUID REFERENCES time_punches (id),
  correction_reason      TEXT,
  rate_type              TEXT,           -- T&M billing: regular, after_hours; payroll computes overtime
  location               GEOGRAPHY(POINT),
  received_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((source = 'correction') = (corrects_punch_id IS NOT NULL)),
  CHECK (source <> 'correction' OR correction_reason IS NOT NULL)
);

CREATE TABLE field_payments (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  invoice_id         UUID NOT NULL REFERENCES invoices (id),
  visit_id           UUID REFERENCES visits (id),
  collected_by_id    UUID NOT NULL REFERENCES staff_members (id),  -- holds cash and checks until deposit
  tender             TEXT NOT NULL CHECK (tender IN ('card_present', 'card_keyed', 'card_on_file',
                       'ach', 'check', 'cash', 'financing', 'payment_link')),
  amount             BIGINT NOT NULL,      -- minor units
  currency           TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('captured_offline', 'authorized', 'declined',
                       'collected', 'deposited', 'voided')),
  offline_limit      BIGINT,               -- the company limit applied when captured offline
  processor_ref      TEXT,                 -- never a card number
  card_last4         TEXT,
  check_number       TEXT,
  device_recorded_at TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

A card captured offline starts `captured_offline` and moves to `authorized` or `declined` when the processor answers, and a decline raises the follow-up task at that moment. Cash and checks go from `collected` to `deposited`, and the gap between the two, per technician, is the reconciliation report. Invoices and payment methods are sketched in [Billing Recurring Service](/books/field-operations/billing-recurring-service#how-to-build-it). Repair's time-and-materials labor prices `time_punches` of kind `on_job` and `travel` ([Flat Rate or Time and Materials](/books/field-operations/repair-and-installation#flat-rate-or-time-and-materials)), and the evidence a visit needs before it can complete is in [Proof of Service](/books/field-operations/proof-of-service#how-to-build-it).

## Auditing

The technician app produces most of the records the business is later asked to prove. Field-specific points:

- **Each command records device, app version, `device_recorded_at`, `received_at` and location with accuracy,** so a disputed arrival or a pesticide record can be placed in time and space.
- **Readings record their instrument:** typed or from which probe, and for regulated tests the gauge's serial and calibration date.
- **Offline payments and time punches keep their full history:** every tender with its state changes, every punch and every correction with who made it and why.
- **Conflicts are logged with both versions and the resolver,** the first place anyone looks when a customer says the technician was there and the system says otherwise.

The record shape, actors and amendment rules are in [Audit Trails](/docs/architecture/audit-trails); retention and production of field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Decide per flow what works offline,** keeping the work itself offline and inventory, live card authorization, financing and new contracts online.
- **Scope the device to the route,** with equipment, a versioned pricebook, form definitions and SDSs, expiring and wiped on sign-out.
- **Assign field conflicts by command type:** field facts win, office plans win, state transitions go to a dispatcher's review queue.
- **Capture readings, findings and products as typed data,** with units and instrument, bound to the form version.
- **Keep equipment on the property** with model, serial and install date, and start warranty registration tasks when an install completes.
- **Stamp every quoted line with its pricebook version,** honor what was signed, and check parts stock on sync.
- **Treat offline payments as a separate, limited state,** and keep card data inside the processor's SDK.
- **Keep raw time punches immutable,** derive time from status events, and compute rounding at payroll.

The general sync design is in [Offline-First Sync](/docs/architecture/offline-sync).

## References

**Specifications**

- [TCEQ: Form TCEQ-20700, Backflow Prevention Assembly Test and Maintenance Report](https://www.tceq.texas.gov/downloads/drinking-water/plan-technical-review/prevention/tceq-20700.docx), readings per check valve in psid, gauge serial and annual accuracy test, completion on site and the signed original to the public water system

**Reference**

- [Microsoft Learn: Configure offline data synchronization](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/offline-data-sync), offline profiles and sync intervals per table
- [Salesforce Trailhead: Offline briefcase](https://trailhead.salesforce.com/content/learn/modules/offline-briefcase/allow-access-to-information-online), priming the records each worker's profile needs and five-minute sync of critical changes
- [Oracle: Work offline](https://docs.oracle.com/en/cloud/saas/field-service/faaca/c-work-offline.html), chronological replay of offline actions and the documented conflict cases
- [Android Developers: Dedicated devices](https://developer.android.com/work/dpc/dedicated-devices), fully managed single-purpose devices for field service, and lock task mode
- [Apple: Platform Deployment](https://support.apple.com/guide/deployment/intro-to-apple-business-manager-dep1e9e2b6ad/web), automated device enrollment, supervision and managed app distribution with a device management service

**In practice**

- [ServiceTitan: Field Mobile App offline capabilities](https://help.servicetitan.com/docs/servicetitan-field-mobile-app-offline-capabilities), what works offline and what needs a connection, including inventory availability, purchase orders, deferred payments and dynamic pricing
- [ServiceTitan: Technician forms](https://help.servicetitan.com/mobile/docs/add-technician-forms-in-the-servicetitan-field-mobile-app), triggers, required fields and offline completion
- [ServiceTitan: Truck replenishment workflows](https://help.servicetitan.com/how-to/truck-replenishment-workflows), materials used on invoices turned into purchase orders
- [FieldRoutes: Mobile offline mode](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-offline-mode.md), offline service and sales flows, and payments needing a signal
- [FieldRoutes: Mobile technician overview](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-technician-overview.md), sync with office and timer categories
- [Successware: Field tools](https://www.successware.com/features/field-tools/), the dedicated offline mode
- [Zuper: Using Zuper offline](https://docs.zuper.co/Zuper_Mobile_Apps/Using_Zuper_Offline.md), data priming including assets and parts, and one-day expiry
- [Housecall Pro: Mobile FAQ](https://help.housecallpro.com/en/articles/4747652-housecall-pro-mobile-faq), offline editing not supported and stored jobs
- [GorillaDesk: App offline mode](https://intercom.help/gorilladesk/en/articles/6993151-app-offline-mode), the current week only, with read-only invoices
- [Solea: Field app](https://www.solea.ai/product/field-app), offline schedule and inspections with checkout, signatures and payments online
- [Jobber: Checklists](https://help.getjobber.com/en/articles/checklists/), field types, required items and photo markup
- [measureQuick: The app](https://measurequick.com/app/), Bluetooth probes, and superheat and subcooling compared with targets
- [measureQuick: ServiceTitan (v2) integration](https://support.measurequick.com/portal/en/kb/articles/servicetitan-v2-integration-with-measurequick), PDF reports, photos, notes and tags sent to the job
- [Pool Brain: Features](https://www.poolbrain.com/features/), dosing calculated from readings entered in the app (marketing)
- [Skimmer](https://www.getskimmer.com/), readings and dosages, LSI calculations and dosing recommendations (marketing)
- [Swept: Time tracking](https://sweptworks.com/cleaning-company-time-tracking-app), geofenced clock-in and flagged off-site punches
