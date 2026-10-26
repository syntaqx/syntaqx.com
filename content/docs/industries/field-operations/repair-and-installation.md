+++
title = "Repair, Install & Commercial Work"
nav_title = "Repair, Install & Commercial"
description = "Repair, install and commercial work: the job from call to close, diagnostic fees, flat rate, parts, assets, warranty claims, projects, SLAs and NTEs."
category = "Field Operations Industry"
order = 1505
part = "How the Work Flows"
tags = ["field-operations", "repair", "installation", "commercial", "warranty", "sla"]
+++

Recurring route service starts from a schedule: the agreement says a visit is due, and the platform finds a slot. Repair starts from a problem. A furnace won't light, a drain backs up, a garage door is stuck half open, a restaurant's walk-in cooler is warming. Nobody knows the price when the phone rings, often nobody knows the cause, and the fix may need a part that isn't on the truck. The work order is open before anyone knows what it is, can take one visit or four, can be paid by the customer, a manufacturer or a facilities client's purchase order, and can carry a contractual clock that started with the call. HVAC, plumbing, electrical, appliance, garage door, roofing and security businesses all run some version of this, and most also sell installs, maintenance agreements and commercial contracts on the same platform.

This chapter covers that side of the business, using the core model from [The Field Operations Business](/docs/industries/field-operations/field-operations-business): the **work order** is the problem and the money, each trip to the property is a **visit**, the equipment is an **asset**, and a maintenance plan or service contract is an **agreement**.

## The Repair Job, From Call to Close

A repair moves through the same steps in every trade, whatever the vendor calls them:

1. **Call and triage.** The CSR (or an AI agent, see [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations)) records the problem, the property, the equipment and the priority. The property's asset history, open warranties, membership and past callbacks belong on that screen, because they change who gets sent and what the customer pays.
2. **Dispatch** a technician with the right skill and, for a known failure, the right part on the truck ([Dispatch & the Day of Service](/docs/industries/field-operations/dispatch)).
3. **Diagnose.** Billable time in most shops, which is what the diagnostic fee is for.
4. **Quote on site** from the pricebook, often with options.
5. **Approve.** The customer approves an option or declines; approval is a signed record of the price as shown.
6. **Repair or return.** Repair now if the part is on the truck; otherwise order it and book a return visit.
7. **Close.** Invoice, payment, the asset record updated, and a warranty claim opened if a manufacturer covers the part.

![A repair job from left to right: call, triage, diagnose, quote, approved and repaired, then closed. A shaded zone marks diagnose through repair as the first visit. A dashed branch from quote leads to declined, which bills the diagnostic fee only. A dashed branch from approved leads to part ordered, with the work order on hold, then a return visit that leads back up to repair. From closed, a branch leads down to a warranty claim filed and then credited, covering parts and sometimes labor.](/diagrams/fo-repair-and-installation-lifecycle.svg "One work order, as many visits as the job takes. The work order holds the problem, the approved price and the money; each trip to the property is its own visit with its own status.")

The decision that matters is keeping the work order open across visits. In Dynamics 365 Field Service, completing a booking completes its work order by default, but a custom booking status with "Status completes work order" turned off (Microsoft's example is "Partially Completed") returns the work order to Unscheduled for follow-up. ServiceTitan uses holds: its documented reasons include waiting for parts or materials, a pending permit and needing authorization, and for a special-order part it suggests either booking from the sold estimate when the part arrives or booking now and holding the appointment with a waiting-for-parts tag, then reporting on held jobs so none are forgotten.

My rule: a visit can be `completed` while its work order is not. A diagnosis or a partial repair completes the visit, and the unfinished work order stays open with a `hold_reason`; the full end-state rules are in [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model).

"Jobs waiting on parts" is then a query over work-order holds and open part orders, not free-text notes.

## Diagnostic Fees and Trip Charges

A **diagnostic fee** (service call fee, dispatch fee, trip charge) pays for showing up and finding the cause, whether or not the customer buys the repair. Shops credit it toward an approved repair, waive it for members, or charge it regardless, so all three have to be pricing rules, not technician discretion. The amount affects booking: a ServiceTitan analysis of residential jobs (vendor-reported) found lower booking rates for free diagnostics than for small fees, and different norms by trade.

It's also regulated in places. California's rules for electronic and appliance repair dealers (Business and Professions Code 9844 and its regulation, 16 CCR 2722) require a written estimate before any repair, allow a reasonable diagnostic fee only if disclosed in writing first, and bar charging beyond the estimate without the customer's prior consent; oral consent is recorded on the invoice with the date, time, name of who authorized it and the added cost. They reach appliance and electronics repair, not every trade, and other states have their own; check the ones you operate in. The design holds anyway:

- **The fee is a pricebook item with rules:** amount by trade, branch and time of day, waived for members, credited on approval if that's the policy.
- **The estimate records the disclosure:** the fee shown, when, and how the customer acknowledged it.
- **Overruns are a new approval,** with the same who, when and how as the first.

Distance charges are the commercial cousin: Dynamics adds a travel charge item automatically when the service account has a travel charge type and the booking recorded travel time.

## Flat Rate or Time and Materials

Residential repair is mostly sold at a **flat rate**: one price per task ("replace a capacitor", "rebuild a toilet") from standard hours, parts and markup, so the customer approves a number before work starts. Commercial and unpredictable work is often **time and materials (T&M)**: labor by the hour at a rate that depends on when it happens, plus parts at cost plus markup.

Most flat-rate shops start from a third-party book such as Profit Rhino's, which arrives with labor, materials and duration preset per task; in Housecall Pro's integration, optional content updates change only the items Profit Rhino still manages, so local edits survive. [Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules) covers markup, margin, cost feeds and versioning.

One work order can mix methods: a T&M commercial call that turns into a quoted compressor replacement. My default: the **pricing method lives on each line**, and T&M labor is time entries with a rate type (regular, overtime, after hours) resolved when recorded. Billable time comes from timestamped events, as Dynamics derives it from booking journals, not a number keyed at the end.

## Options at the Door

A repair visit is also a sales visit. The technician who finds a cracked heat exchanger in a 19-year-old furnace presents a repair and a replacement, often as good-better-best options with financing ([Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules)), and needs the asset's age, repair history and remaining warranty to make that conversation honest. Snapshot every option as shown, including declined ones: declined replacements are next season's sales list and the evidence when a customer says nobody told them.

The FTC's Cooling-Off Rule reaches repair visits more often than shops assume ([Consumer Protection](/docs/industries/field-operations/consumer-protection#the-exclusions-read-narrowly) owns the rule and its exclusions). Its exclusion for a buyer-requested visit covers repair of the buyer's personal property, and HVAC, plumbing, electrical and similar work is on real property, so that exclusion usually doesn't apply. A buyer-requested home repair of $25 or more sold at the home is covered unless an exclusion applies; the one that usually fits a true emergency is the buyer's handwritten waiver, and whether a given piece of equipment is a fixture or personal property is a question [Consumer Protection](/docs/industries/field-operations/consumer-protection#the-exclusions-read-narrowly) leaves to counsel. My rule: the waiver is never a checkbox. It's an image of the buyer's handwritten statement attached to the work order, and without it the cancellation window applies, to the repair and to any replacement sold on the same visit.

## Parts: On the Truck or On Order

First-time fix depends on parts more than on skill. A part comes from one of three places:

- **Truck stock.** The van is a warehouse and using a part is a movement in an inventory ledger ([Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety)). Dynamics separates a work order product that is estimated and allocated, which reserves stock, from one marked used, which deducts it: exactly the quote-then-approve gap.
- **Special order.** Bought for this job on a purchase order that references the work order. The part order is a dependency of the return visit, which moves when the supplier's date moves.
- **Supplied.** The manufacturer ships the replacement under warranty, or the customer bought it. Record the source, because it changes what gets billed.

**Serial numbers** matter twice: the installed part's serial ties it to a warranty, and the removed part's serial and disposition (kept, returned, scrapped) are what a warranty claim asks for. Capture both serials on the visit, by scan where possible, and keep the failed part until the claim says what to do with it.

## Equipment Is an Asset

The furnace, condenser, water heater, panel, garage door opener, alarm panel or backflow assembly outlives every work order on it. ServiceTitan keeps equipment on the location record, because "equipment is tied to the service location where the job is performed"; [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties) covers how an asset hangs off a property.

An install should create the asset, not leave it for someone to type in later: Dynamics converts work order products flagged "Convert to Customer Asset" into customer assets when the work order completes. A replacement links to the asset it replaced, so the history at that address survives the hardware.

Warranty terms belong on the asset. Salesforce models warranty terms covering labor, parts and expenses, attaches standard terms to products, and creates asset warranty terms when a product is installed, linkable to the work orders that fulfill them. Registration can change the terms themselves. Carrier's residential warranty asks the homeowner to register within 90 days of installation: a registered system gets a choice of a 10-year parts-only limited warranty or 5 years of parts plus 3 years of labor (the labor option only where the installing dealer participates), an unregistered one gets the standard 5-year parts-only warranty, and where the law doesn't allow benefits to be conditioned on registration the 10-year parts warranty applies automatically. So the asset's warranty term depends on whether, when and where registration happened, and registration is a task with a deadline computed from the install date and owned by someone, not a reminder email ([Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Warranty Claims: Getting Paid by Someone Else

When a covered part fails, the manufacturer pays for the part and sometimes the labor, but rarely directly and never automatically. The contractor files a claim, often through the distributor or a claim processor, and waits for a credit. The work order has a second payer, and the platform needs a receivable for it.

Requirements are strict and differ by program. Ferguson's HVAC process is representative: claims within 30 days of the repair date, the repair finished first, valid serial numbers for failed and replacement units or parts, install and failure dates, a failure code, prior authorization for full-unit claims, the failed part returned only if requested, and a credit once the manufacturer approves. Appliance repair runs through claim processors: ServiceWorks submits to ServiceBench and ServicePower, only for jobs marked delivered, with model, serial, defect and repair codes, and posts payments against a warranty claims receivable with write-offs and an overdue report. Adjudication is the manufacturer's; the platform's job is complete evidence.

Warranty is also separate from workmanship. ServiceTitan's contractor guide says most home service businesses treat a recall as "errors or omissions by the service technician within 30 days of a service call or within one year of an installation job", while a manufacturer defect follows the manufacturer's rules. The distinction decides who pays and whose metric it hits.

Model the claim as its own record with states (`draft`, `submitted`, `more_info_requested`, `approved`, `rejected`, `paid`, `written_off`), a submit-by date computed from the repair date, the evidence it carried (serials, rating plate photos, failure code), and amounts claimed and paid. Rejections for a missing serial are a measurable process failure, and an aging report of unpaid claims is money small shops often never collect.

## Installs and Projects

A system replacement, a re-roof, a panel upgrade or a security install looks like a small construction project: an estimate, a signed contract, permits, materials, one or more crews over several days, an inspection, and money in stages.

- **Estimate and sale.** Often measured remotely: AccuLynx populates roofing estimates and material orders from EagleView and GAF QuickMeasure aerial reports. Financing often decides the sale ([Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules)).
- **Permits and inspections.** A pending permit is a work-order hold (`permit_needed`), and the inspection is a visit that records a pass or fail ([Licenses & Permits](/docs/industries/field-operations/licensing-and-permits)).
- **Materials.** AccuLynx orders from suppliers at local branch pricing and shares the order with the crew app, so crews confirm what arrived before starting. Delivery is a dependency of the work visits.
- **Crews and dependencies.** Salesforce models service crews and time dependencies between appointments: rough-in before trim-out, inspection after both.
- **Progress billing.** Deposit at signing, progress payments, final invoice. ServiceTitan builds an Application for Payment from a schedule of values (percent complete per line, previous billings carried forward, current payment due) in AIA G702 and G703 layouts, with optional retainage posted to a retainage receivable.

The install closes by creating the assets, registering warranties within their windows, and handing the property to a maintenance agreement.

**Delivery and install for someone else.** An appliance delivered and hooked up for a retailer, a replacement unit shipped under a manufacturer's warranty, furniture assembled for a brand: the retailer or manufacturer pays and sets the rules (delivery windows, proof photos, haul-away), while the work happens at the consumer's home, whose access notes and history the crew needs. That's the payer and site split from [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties): the work order bills the retailer's account, the consumer is a contact on it, and the property stays the consumer's, so the next repair at that address sees what was installed.

## Maintenance Agreements in the Repair Trades

The repair trades' recurring layer is the maintenance agreement, usually sold as a membership: a tune-up per system in the shoulder seasons, a repair discount, priority scheduling, sometimes a waived diagnostic fee. Three things set it apart from a route-service agreement:

- **It generates work per asset.** A two-system home gets two tune-ups, and adding a water heater adds a line. The covered assets are part of the agreement's terms, so the generator in [Recurring Schedules](/docs/industries/field-operations/recurring-schedules) produces an occurrence per covered asset and service, and a replaced furnace moves its coverage to the new asset record.
- **Other workflows read its benefits.** Triage reads priority when a cold morning brings more no-heat calls than technicians; the pricebook reads the member discount and waived fee when the technician quotes. The quote records which benefit it applied, so a lapsed member isn't charged member prices and a member's discount survives a dispute.
- **The tune-up finds the repairs.** A spring check finds a failing capacitor, a fall check a cracked heat exchanger. Each finding is its own work order, linked to the occurrence that found it, which is how a membership shows its value in revenue.

Every member wants the visit in the same few weeks, so shops spread tune-ups across wide windows through the shoulder season. The agreement itself (terms, renewal, cancellation) is in [Service Agreements & Plans](/docs/industries/field-operations/service-agreements).

## Commercial Work: Contracts, Clocks and Caps

Commercial customers buy coverage, not jobs: a service contract across their sites with response times, planned maintenance per asset, reactive calls under a cap, and paperwork their own auditors read.

**Service levels are clocks.** Salesforce's entitlement management is the reference. An entitlement process is "a timeline that includes all the steps (milestones)" to resolve a record, of type Case or Work Order. Milestones such as first response and resolution time carry actions that fire as warnings before a violation, as violations after it, and as successes on completion; business hours decide which minutes count, and a Stopped flag pauses the process, for example while waiting on the customer. An entitlement's operating hours also bound booking: weekdays 8 AM to noon for one customer, 24/7 for another. The design to take: a **response clock** and a **resolution clock** per work order, each a target, a calendar in the property's time zone, and timestamped events (started, paused with a reason, resumed, met, violated). Compute breaches from the events so a disputed four-hour response can be replayed, and require a reason to pause, since pausing is how clocks get gamed.

**Planned maintenance is per asset.** Salesforce maintenance plans "define the maintenance schedule for specific assets" and typically reflect the service contract, with calendar, criteria (a panel above a temperature) or usage (gallons through a water heater) rules, and floating plans that schedule from the last completion rather than the calendar. BuildOps sets the frequency once in the agreement ("Agreements drive the schedule") and keeps history and nameplate data per unit. Planned visits find problems, and ServiceTrade's data model keeps deficiencies per asset and job, with severity, status and proposed fix, linked to quotes.

**Spending is capped.** A commercial work order carries the client's **purchase order** number, without which the invoice won't be paid, and often a **not-to-exceed (NTE)** amount. Dynamics supports price, cost and price-and-cost-margin NTEs, selected by customer, incident type or location, and warns on the work order and in the mobile app as the limit approaches, while still letting the work order save. ServiceChannel, which multi-site operators use to manage contractors, is stricter from the client's side: providers can't invoice above the NTE without an approved proposal. My default: warn the technician and require a recorded approval (who, the new amount, the client's reference) before crossing the cap, because the client's system will enforce it at invoice time anyway. Multi-site bill-to, consolidated invoicing and site-scoped portals are in [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties).

**Janitorial contracts are recurring scope with an inspection loop.** Commercial cleaning is sold as a scope of work: each task with its frequency, area by area. Loudoun County's janitorial specification is a typical public example. Routine cleaning runs nightly, with weekly, monthly, twice-yearly and quarterly tasks at defined spacing (weekly work at least four days apart, quarterly work about 90 days apart) and county holidays excluded. The contractor furnishes the consumables (paper goods, liners, soap, compatible with the building's dispensers) and runs a quality control plan: signed, dated inspection checklists, never accepted by the person who did the work, each sent to the county within 24 hours. Deficiencies the county's inspector finds must be fixed within 72 hours, or on receipt for a health or safety issue. In data that's a recurrence per task and area ([Recurring Schedules](/docs/industries/field-operations/recurring-schedules)), consumables as per-site stock billed as the contract says, inspections as structured results per area, and each deficiency as an item with its own correction clock, the same shape as a response SLA.

**Compliance inspections** are commercial work with a regulator attached. ServiceTrade's case study with a fire protection contractor describes each jurisdiction requiring its own form, with one digital form sent to each authority in its format and deficiencies feeding quotes. Backflow assemblies follow the water utility's rules; Sioux Falls, for example, requires an annual test by a certified tester from an approved company. The pattern: a structured result per asset, the tester's certification checked at dispatch, the report sent to customer and authority, and every failed item a deficiency that can become a quote.

## Emergencies, After Hours and On Call

Emergency work jumps the queue, costs more and is staffed differently.

- **Priority from triage.** No heat in a freeze, an active leak, a failing restaurant cooler: priority comes from rules on problem codes, recorded with who set it, because it decides who gets bumped and what rate applies.
- **After-hours rates** are pricebook rules by time of day and day type, with holidays from the branch's calendar ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)); commercial contracts may set them.
- **On-call is availability, not capacity.** Oracle Field Service treats an active on-call shift as availability when picking a technician, while capacity quotas keep using regular working time: on-call technicians can be sent, but they don't make tomorrow look emptier than it is.
- **On-call pay is a labor question.** Under the federal rule, on-call time restricted enough that the employee can't use it as their own is working time; record on-call periods and callouts as time entries so payroll can apply it and any state law.

## First-Time Fix and Callbacks

**First-time fix** asks whether the first visit solved the problem; its failure is the **callback** (recall). ServiceTitan's recall job can be booked only from a completed job, is set to no charge, and links back to the original. Callbacks count against workmanship; warranty failures belong to the manufacturer.

What keeps the metric honest is the link: a callback is a new work order with `source = 'callback'` and `callback_of_work_order_id` set when it's booked, never inferred from "same address within 30 days". First-time fix is computed per work order: fixed on its first completed visit, with no callback work order inside the window ([Operating Metrics](/docs/industries/field-operations/operating-metrics) gives the definition and window). A return trip for a part that wasn't on the truck is not a callback, because the work order never closed, but it does fail first-time fix. The causes are mostly upstream and measurable: the part wasn't on the truck, the wrong skill was sent, or the asset history was missing.

## A Data Model Sketch

This extends the core model in [The Field Operations Business](/docs/industries/field-operations/field-operations-business). It adds an asset table and its warranty terms, columns on `work_orders`, and four tables of its own; existing columns are unchanged, and visits use the canonical states and reasons.

```sql
CREATE TABLE assets (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  replaced_asset_id   UUID REFERENCES assets (id),
  kind                TEXT NOT NULL,             -- furnace, condenser, water_heater, backflow_assembly
  manufacturer        TEXT,
  model_number        TEXT,
  serial_number       TEXT,
  installed_on        DATE,
  installed_by_work_order_id UUID REFERENCES work_orders (id),
  retired_on          DATE
);

CREATE TABLE asset_warranty_terms (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  asset_id            UUID NOT NULL REFERENCES assets (id),
  provider            TEXT NOT NULL,             -- manufacturer | installer | extended
  covers              TEXT[] NOT NULL,           -- parts, labor, compressor
  valid_during        DATERANGE NOT NULL,
  register_by_on      DATE,                      -- registration deadline that changes the terms
  registered_at       TIMESTAMPTZ
);

-- hold_reason and callback_of_work_order_id are already on work_orders (chapter 1)
ALTER TABLE work_orders
  ADD COLUMN asset_id                UUID REFERENCES assets (id),
  ADD COLUMN problem_code            TEXT,
  ADD COLUMN priority                TEXT,       -- emergency | urgent | routine
  ADD COLUMN customer_po             TEXT,
  ADD COLUMN nte_amount              BIGINT,     -- minor units
  ADD COLUMN currency                TEXT,
  ADD COLUMN callback_cause          TEXT CHECK (callback_cause IN ('workmanship',
                                       'diagnosis_wrong', 'equipment_failure')),
  ADD CONSTRAINT work_orders_callback_cause_check
    CHECK (callback_cause IS NULL OR source = 'callback');

CREATE TABLE work_order_parts (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  visit_id            UUID REFERENCES visits (id),
  product_id          UUID NOT NULL,
  quantity            NUMERIC NOT NULL,
  source              TEXT NOT NULL,             -- truck_stock | special_order | supplied
  purchase_order_id   UUID,
  status              TEXT NOT NULL,             -- estimated | ordered | received | used | returned
  serial_number       TEXT,                      -- installed part
  removed_serial_number TEXT,                    -- failed part, evidence for a claim
  removed_part_disposition TEXT                  -- kept | returned | scrapped
);

CREATE TABLE warranty_claims (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  asset_warranty_term_id UUID REFERENCES asset_warranty_terms (id),
  submitted_to        TEXT NOT NULL,             -- manufacturer, distributor or claim processor
  external_ref        TEXT,
  status              TEXT NOT NULL,             -- draft ... paid | rejected | written_off
  claimed_amount      BIGINT,
  paid_amount         BIGINT,
  currency            TEXT,
  submit_by_on        DATE,
  submitted_at        TIMESTAMPTZ,
  decided_at          TIMESTAMPTZ
);

CREATE TABLE sla_clocks (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  agreement_id        UUID NOT NULL REFERENCES agreements (id),  -- the contract that set the target
  kind                TEXT NOT NULL,             -- response | resolution
  target_minutes      INTEGER NOT NULL,
  calendar_id         UUID NOT NULL,             -- business hours or 24/7, in the property's zone
  started_at          TIMESTAMPTZ NOT NULL,
  due_at              TIMESTAMPTZ NOT NULL,      -- recomputed on pause and resume
  met_at              TIMESTAMPTZ,
  violated_at         TIMESTAMPTZ
);

CREATE TABLE sla_clock_events (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  sla_clock_id        UUID NOT NULL REFERENCES sla_clocks (id),
  kind                TEXT NOT NULL,             -- started | paused | resumed | warned | met | violated
  reason              TEXT,                      -- required for paused
  occurred_at         TIMESTAMPTZ NOT NULL,
  staff_member_id     UUID REFERENCES staff_members (id)  -- null when a system rule acted
);
```

A completed visit whose work order carries `hold_reason = 'part_needed'` leaves the work order open; clearing the hold makes it schedulable again. The clock's events are the truth, and `due_at`, `met_at` and `violated_at` can be rebuilt from them. The chapter adds outbox events `work_order.estimate_approved`, `work_order.part_received`, `sla_clock.warned`, `sla_clock.violated` and `warranty_claim.decided`, in the envelope from [Events & Async Messaging](/docs/architecture/events).

## Auditing

- **Estimate approvals and overruns.** Options shown, the one approved, the fee disclosed, and every consent to exceed an estimate or NTE: who, when, how (signature, oral, client reference) and the amount. This is the record in a billing dispute, a repair-dealer complaint and a client's invoice audit.
- **Serials and part disposition.** Installed and removed serial numbers, where each part came from, and what happened to the failed one. Warranty claims are paid or rejected on these.
- **SLA clock events.** Every start, pause (with its reason and who paused it), resume and breach, so a disputed response time can be replayed from the events.
- **Priority and rate changes.** Who marked a call as an emergency or after hours, since both change what the customer pays.

The general mechanics are in [Audit Trails](/docs/architecture/audit-trails); field records and their retention are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **One work order, many visits,** with canonical visit states and reasons, work-order holds, and part orders as dependencies of the return visit.
- **Diagnostic fees and after-hours rates as pricebook rules,** with disclosures and every overrun consent recorded.
- **Pricing method per line,** so flat rate and time and materials share a work order.
- **Every option snapshotted,** and cooling-off rights applied to sales made on repair visits.
- **Assets created by installs,** with serials, replacement links and warranty terms whose registration deadlines are tasks.
- **Warranty claims as receivables** with states, deadlines, evidence and aging.
- **Projects with permits, deliveries, crews, dependencies and progress billing,** and delivery work billed to the retailer at the consumer's property.
- **SLA clocks built from events,** NTE caps with recorded approvals, PO numbers on invoices, janitorial scope with inspections and correction clocks, and maintenance generated per asset.
- **On-call as availability, not capacity,** and **callbacks linked when booked.**

## References

**Specifications**

- [Cornell LII: 16 CFR 429.0, Definitions (Cooling-Off Rule)](https://www.law.cornell.edu/cfr/text/16/429.0), the bona fide emergency waiver by handwritten statement and the buyer-requested repair exclusion limited to personal property, excluding additional sales
- [California Business and Professions Code section 9844](https://california.public.law/codes/business_and_professions_code_section_9844), Electronic and Appliance Repair Dealer Registration Law: written estimate before repair, disclosed diagnostic fee and no charges beyond the estimate without consent
- [Cornell LII: 16 Cal. Code Regs. 2722](https://www.law.cornell.edu/regulations/california/16-CCR-2722), electronic and appliance repair dealer regulations: estimates including the initial service call, and recording oral consent on the invoice
- [Cornell LII: 29 CFR 785.17, On-call time](https://www.law.cornell.edu/cfr/text/29/785.17), when on-call time is working time under the FLSA
- [City of Sioux Falls: Cross Connection Control](https://www.siouxfalls.gov/resident-services/utilities-billing/water/cross-connection-control), annual backflow assembly testing by certified testers from approved companies

**Reference**

- [Salesforce: Entitlement Management admin guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_entitlements_implementation_guide.pdf), entitlement processes for cases and work orders, milestones, warning, violation and success actions, business hours and stopped time
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), entitlement operating hours, maintenance plans, warranty terms and asset warranty terms, service crews and time dependencies
- [Salesforce Trailhead: Create a maintenance plan](https://trailhead.salesforce.com/content/learn/modules/field_service_maint/field_service_maint_plan), calendar, criteria and usage-based rules, and floating work orders
- [Microsoft Learn: Work order lifecycle and system statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), bookings that don't complete the work order, travel charges, billable duration and conversion to customer assets
- [Microsoft Learn: Not-to-exceed values on work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-not-to-exceed), price, cost and margin NTEs, automatic selection and warnings that don't block saving
- [Oracle: Activity booking overview](https://docs.oracle.com/en/cloud/saas/field-service/faaca/c-activitybookingoverview.html), on-call shifts as availability for assignment but not as quota capacity

**In practice**

- [ServiceTitan: Place a job on hold](https://help.servicetitan.com/how-to/place-a-job-on-hold), hold reasons and the special-order part workflow
- [ServiceTitan: Book a recall job from an existing job](https://help.servicetitan.com/how-to/recall-job-from-exisiting-job), recalls from completed jobs only, no charge and linked to the original
- [ServiceTitan: Recalls, callbacks and warranty](https://www.servicetitan.com/guides/contractor-playbook/recalls-callbacks-warranty), the 30-day service and one-year install recall definition, and workmanship versus manufacturer warranty
- [ServiceTitan: The perfect home service diagnostic fee](https://www.servicetitan.com/blog/home-service-diagnostic-fee), booking rates for free versus small diagnostic fees and norms by trade from more than a million residential jobs (vendor-reported)
- [ServiceTitan: Bill for project progress](https://help.servicetitan.com/docs/bill-for-project-progress), applications for payment, schedule of values, AIA G702 and G703 and retainage
- [ServiceTitan: Customer and location records](https://help.servicetitan.com/docs/customer-and-location-records-overview.md), equipment tied to the service location
- [Housecall Pro: Profit Rhino with Housecall Pro](https://help.housecallpro.com/en/articles/8754493-profit-rhino-with-housecall-pro-a-complete-guide), preset labor, materials and duration and optional content updates
- [Carrier: Residential warranty](https://www.carrier.com/residential/en/us/homeowner-resources/warranty/), registration within 90 days, the 10-year parts or 5-year parts plus 3-year labor choice, the 5-year default and jurisdictions where registration can't be required
- [Ferguson: HVAC warranty claims](https://www.ferguson.com/content/customer-support/warranty-information/hvac-warranty/), the 30-day window, serial numbers, failure codes, authorization, part returns and credits
- [ServiceWorks: Warranty claims, step by step](https://blog.service.works/tutorial/warranty/warranty-claims-in-serviceworks-a-complete-step-by-step-guide/), submitting to ServiceBench and ServicePower, claim data and the warranty claims receivable
- [ServiceChannel: Work orders](https://servicechannel.com/products/work-orders), NTE limits on invoices and proposals above the NTE
- [BuildOps: Preventative maintenance](https://buildops.com/features/preventative-maintenance), agreements driving the schedule, per-unit history and deficiencies
- [ServiceTrade: AAA Fire Protection case study](https://servicetrade.com/resources/case-studies/aaa-fire-protection/), jurisdiction-specific inspection forms and deficiencies feeding quotes
- [ServiceTrade connector schema (Fivetran)](https://fivetran.com/docs/connectors/applications/servicetrade/connector-schema), deficiencies linked to quotes and jobs
- [AccuLynx: Ordering roofing materials](https://acculynx.com/order-roofing-materials), aerial measurement reports, supplier ordering and crew delivery checks
- [Loudoun County: Janitorial services specification](https://www.loudoun.gov/DocumentCenter/View/115634), task frequencies and spacing, contractor-supplied consumables, quality control inspections and 72-hour deficiency correction
