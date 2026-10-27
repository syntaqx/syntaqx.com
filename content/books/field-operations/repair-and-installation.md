+++
title = "Repair, Install & Commercial Work"
nav_title = "Repair, Install & Commercial"
description = "Repair, install and commercial work: flat rate, parts, assets, connected equipment, warranty and insurance payers, projects, change orders, SLAs and subs."
category = "Field Operations Industry"
order = 1505
part = "How the Work Flows"
tags = ["field-operations", "repair", "installation", "commercial", "warranty", "sla"]
+++

Recurring route service starts from a schedule: the agreement says a visit is due, and the platform finds a slot. Repair starts from a problem. A furnace won't light, a drain backs up, a garage door is stuck half open, a restaurant's walk-in cooler is warming. Nobody knows the price when the phone rings, often nobody knows the cause, and the fix may need a part that isn't on the truck. The work order is open before anyone knows what it is, can take one visit or four, can be paid by the customer, a manufacturer or a facilities client's purchase order, and can carry a contractual clock that started with the call. HVAC, plumbing, electrical, appliance, garage door, roofing and security businesses all run some version of this, and most also sell installs, maintenance agreements and commercial contracts on the same platform.

Some of that work is dispatched and paid by someone else: a home warranty company, a property insurer, a facilities client's work order network. This chapter covers that side of the business, using the core model from [The Field Operations Business](/books/field-operations/field-operations-business): the **work order** is the problem and the money, each trip to the property is a **visit**, the equipment is an **asset**, and a maintenance plan or service contract is an **agreement**.

## The Repair Job, From Call to Close

A repair moves through the same steps in every trade, whatever the vendor calls them:

1. **Call and triage.** The CSR (or an AI agent, see [AI in Field Operations](/books/field-operations/ai-in-field-operations)) records the problem, the property, the equipment and the priority. The property's asset history, open warranties, membership and past callbacks belong on that screen, because they change who gets sent and what the customer pays.
2. **Dispatch** a technician with the right skill and, for a known failure, the right part on the truck ([Dispatch & the Day of Service](/books/field-operations/dispatch)).
3. **Diagnose.** Billable time in most shops, which is what the diagnostic fee is for.
4. **Quote on site** from the pricebook, often with options.
5. **Approve.** The customer approves an option or declines; approval is a signed record of the price as shown.
6. **Repair or return.** Repair now if the part is on the truck; otherwise order it and book a return visit.
7. **Close.** Invoice, payment, the asset record updated, and a warranty claim opened if a manufacturer covers the part.

![A repair job from left to right: call, triage, diagnose, quote, approved and repaired, then closed, along an accented path. A dashed boundary marks diagnose through repair as the first visit. A dashed branch from quote leads to declined, which bills the diagnostic fee only. A dashed branch from approved leads to part ordered, with the work order on hold, then a return visit that leads back up to repair. From closed, a branch leads down to a warranty claim filed and then credited, covering parts and sometimes labor.](/diagrams/fo-repair-and-installation-lifecycle.svg "One work order, as many visits as the job takes. The work order holds the problem, the approved price and the money; each trip to the property is its own visit with its own status.")

The decision that matters is keeping the work order open across visits. In Dynamics 365 Field Service, completing a booking completes its work order by default, but a custom booking status with "Status completes work order" turned off (Microsoft's example is "Partially Completed") returns the work order to Unscheduled for follow-up. ServiceTitan uses holds: its documented reasons include waiting for parts or materials, a pending permit and needing authorization, and for a special-order part it suggests either booking from the sold estimate when the part arrives or booking now and holding the appointment with a waiting-for-parts tag, then reporting on held jobs so none are forgotten.

The core model already makes this structural: a diagnosis or partial repair completes the visit while the work order stays open on a `hold_reason` ([The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model) owns the end states and reasons). What repair adds is the part order behind the hold, so "jobs waiting on parts" is a query over work-order holds and open part orders, not free-text notes.

![A dimensional drawing of one repair work order on a day axis. Visit 1 on day 0 diagnoses and quotes and is completed while the work order stays open, on hold for a part for 6 days (H1). Visit 2 on day 6 repairs and closes the order. Two 30-day windows start at the repair, the warranty claim submit-by window W1 and the workmanship callback window K1, so the last day to file is day 36 (T1 = H1 + W1). Tables list the hold reasons part_needed, approval_needed and permit_needed with what releases each, and the variables.](/diagrams/fo-repair-and-installation-dwg-work-order.svg "One work order, two visits, and two clocks that start at the repair. The 30-day windows come from Ferguson's claim process and ServiceTitan's recall definition; the six-day part wait is illustrative.")

## Diagnostic Fees and Trip Charges

A **diagnostic fee** (service call fee, dispatch fee, trip charge) pays for showing up and finding the cause, whether or not the customer buys the repair. Shops credit it toward an approved repair, waive it for members, or charge it regardless, so all three have to be pricing rules, not technician discretion. The amount affects booking: a ServiceTitan analysis of residential jobs (vendor-reported) found lower booking rates for free diagnostics than for small fees, and different norms by trade.

It's also regulated in places. California's rules for electronic and appliance repair dealers (Business and Professions Code 9844 and its regulation, 16 CCR 2722) require a written estimate before any repair, allow a reasonable diagnostic fee only if disclosed in writing first, and bar charging beyond the estimate without the customer's prior consent; oral consent is recorded on the invoice with the date, time, name of who authorized it and the added cost. They reach appliance and electronics repair, not every trade, and other states have their own; check the ones you operate in. The design holds anyway:

- **The fee is a pricebook item with rules:** amount by trade, branch and time of day, waived for members, credited on approval if that's the policy.
- **The estimate records the disclosure:** the fee shown, when, and how the customer acknowledged it.
- **Overruns are a new approval,** with the same who, when and how as the first.

Distance charges are the commercial cousin: Dynamics adds a travel charge item automatically when the service account has a travel charge type and the booking recorded travel time.

## Flat Rate or Time and Materials

Residential repair is mostly sold at a **flat rate**: one price per task ("replace a capacitor", "rebuild a toilet") from standard hours, parts and markup, so the customer approves a number before work starts. Commercial and unpredictable work is often **time and materials (T&M)**: labor by the hour at a rate that depends on when it happens, plus parts at cost plus markup.

How flat-rate books are built, imported and priced (markup, margin, cost feeds, versioning, and the vendors that sell them) is in [Pricebooks: Where Prices Come From](/books/field-operations/pricing-and-sales-rules#pricebooks-where-prices-come-from). One repair-specific detail: a shop that starts from a third-party book will edit it locally, and the update path has to respect that; in Housecall Pro's Profit Rhino integration, optional content updates change only the items Profit Rhino still manages, so local edits survive.

One work order can mix methods: a T&M commercial call that turns into a quoted compressor replacement. My default: the **pricing method lives on each line**, and T&M labor is the technician's raw `time_punches` ([The Technician App](/books/field-operations/technician-app#how-to-build-it)) for the work order, priced with a rate type (regular, overtime, after hours) resolved when recorded. Billable time comes from timestamped events, as Dynamics derives it from booking journals, not a number keyed at the end.

## Options at the Door

A repair visit is also a sales visit. The technician who finds a cracked heat exchanger in a 19-year-old furnace presents a repair and a replacement, often as good-better-best options with financing ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)), and needs the asset's age, repair history and remaining warranty to make that conversation honest. Snapshot every option as shown, including declined ones: declined replacements are next season's sales list and the evidence when a customer says nobody told them.

The FTC's Cooling-Off Rule reaches repair visits more often than shops assume ([Consumer Protection](/books/field-operations/consumer-protection#the-exclusions-read-narrowly) owns the rule and its exclusions). Its exclusion for a buyer-requested visit covers repair of the buyer's personal property, and HVAC, plumbing, electrical and similar work is on real property, so that exclusion usually doesn't apply. A buyer-requested home repair of $25 or more sold at the home is covered unless an exclusion applies; the one that usually fits a true emergency is the buyer's handwritten waiver, and whether a given piece of equipment is a fixture or personal property is a question [Consumer Protection](/books/field-operations/consumer-protection#the-exclusions-read-narrowly) leaves to counsel. My rule: the waiver is never a checkbox. It's an image of the buyer's handwritten statement attached to the work order, and without it the cancellation window applies, to the repair and to any replacement sold on the same visit.

## Parts: On the Truck or On Order

First-time fix depends on parts more than on skill. A part comes from one of three places:

- **Truck stock.** The van is a warehouse and using a part is a movement in an inventory ledger ([Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety)). Dynamics separates a work order product that is estimated and allocated, which reserves stock, from one marked used, which deducts it: exactly the quote-then-approve gap.
- **Special order.** Bought for this job on a purchase order that references the work order. The part order is a dependency of the return visit, which moves when the supplier's date moves.
- **Supplied.** The manufacturer ships the replacement under warranty, or the customer bought it. Record the source, because it changes what gets billed.

**Serial numbers** matter twice: the installed part's serial ties it to a warranty, and the removed part's serial and disposition (kept, returned, scrapped) are what a warranty claim asks for. Capture both serials on the visit, by scan where possible, and keep the failed part until the claim says what to do with it.

## Equipment Is an Asset

The furnace, condenser, water heater, panel, garage door opener, alarm panel or backflow assembly outlives every work order on it. ServiceTitan keeps equipment on the location record, because "equipment is tied to the service location where the job is performed"; [Customers, Accounts & Properties](/books/field-operations/customers-and-properties) covers how an asset hangs off a property.

An install should create the asset, not leave it for someone to type in later: Dynamics converts work order products flagged "Convert to Customer Asset" into customer assets when the work order completes. A replacement links to the asset it replaced, so the history at that address survives the hardware.

Warranty terms belong on the asset. Salesforce models warranty terms covering labor, parts and expenses, attaches standard terms to products, and creates asset warranty terms when a product is installed, linkable to the work orders that fulfill them. Registration can change the terms themselves. Carrier's residential warranty asks the homeowner to register within 90 days of installation: a registered system gets a choice of a 10-year parts-only limited warranty or 5 years of parts plus 3 years of labor (the labor option only where the installing dealer participates), an unregistered one gets the standard 5-year parts-only warranty, and where the law doesn't allow benefits to be conditioned on registration the 10-year parts warranty applies automatically. So the asset's warranty term depends on whether, when and where registration happened, and registration is a task with a deadline computed from the install date and owned by someone, not a reminder email ([Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Connected Equipment and Remote Monitoring

More of the equipment a field business services can now report on itself. A connected thermostat or air handler sends fault codes and runtime anomalies, a pool pump reports a priming failure, a rodent trap in a food plant signals that it fired. Each one can start a work order before the customer calls, and some can make a visit unnecessary.

The pattern is the same across vendors that publish it:

- **Device to asset.** Dynamics 365 Connected Field Service registers an IoT device "with the correct customer asset," and "Multiple IoT devices can be associated with a single customer asset." Salesforce lets a business "define criteria to trigger a workflow when an asset is in need of attention." The device is a sensor on an asset this chapter already models, never a separate customer record.
- **Alert to remote check to work order.** Microsoft's documented flow sends an alert to a case "to investigate remotely," and only "If the potential issue can't be identified or resolved remotely" does it create a work order. Commands go the other way: "Commands are programed instructions sent from the Field Service application to IoT devices," with "Reset Thermostat" as the example; Salesforce markets triggering "actions remotely in response to asset failures or error codes, such as rebooting or upgrading firmware," with a work order created if the fix fails.
- **Deduplication.** A failing device repeats itself. Connected Field Service's aggregation rules decide "whether the alert should be parented under an existing alert for the same device or asset," by default when the device ID matches and the alert falls "within five minutes," a configurable debounce window. Without that, one short-cycling compressor opens twenty work orders.

The trades each have a version:

- **HVAC.** Manufacturers sell dealer monitoring tied to their thermostats. Carrier's Infinity control "enables remote system health monitoring and diagnostics by your dealer" once the homeowner chooses to "opt into data sharing with your installing dealer"; Trane's dealer access requires the homeowner to "enable Trane Diagnostics" and then "allow or deny access"; Daikin lets a contractor be "authorized by the homeowner for remote access," and pushes critical errors to dealers; Resideo's Pro-IQ service sends contractors "alerts on runtime anomalies, humidity spikes or early signs of equipment failure" so they can "resolve easy issues without rolling a truck."
- **Pest.** Remote rodent monitoring puts sensors on traps: Rentokil's PestConnect lets technicians "identify the exact unit that has signalled rodent activity," and Ecolab sells "24/7 digital rodent activity monitoring" while stating it "doesn't replace your service program, it enhances it." Anticimex SMART works the same way. A triggered trap becomes a targeted visit to that unit, and the routine walk of every station gets less frequent where the customer's audit scheme accepts electronic monitoring (a food plant's auditor decides that, not the vendor).
- **Pool.** Pentair's app sends alerts "if you choose, to your trusted pool professional," and Pentair announced in August 2026 a planned feed of pump data into Pool Brain's route software for "early warnings on issues such as priming failures." Hayward documents only a homeowner-created guest user, so a pool company's access there is whatever the owner shares.

What the platform needs from this:

- **Consent is per asset and revocable.** Every manufacturer above makes the homeowner grant the dealer access, so the link between a device feed and a property records who granted it, when, and when it was revoked. A new owner of the house has granted nothing ([Customers, Accounts & Properties](/books/field-operations/customers-and-properties)).
- **Alerts are triaged by rules, not straight into the schedule.** An alert opens a work order only if it maps to a problem code, the asset is covered (a membership, a commercial contract) or the customer has asked to be called, and no open work order already covers that asset. Everything else is a task for a CSR to call about ([The Contact Center](/books/field-operations/contact-center)).
- **A remote fix is a record.** A reset or setting change made from the office is an activity on the work order, with who did it and the device's response, and it can close the work order without a visit. Whether it's billable is a pricebook rule, like a diagnostic fee.
- **Telemetry stays with the device vendor.** Keep the alerts and the readings a decision rests on, not the stream. The vendor's portal is the history; the platform keeps what it acted on.

## Warranty Claims: Getting Paid by Someone Else

When a covered part fails, the manufacturer pays for the part and sometimes the labor, but rarely directly and never automatically. The contractor files a claim, often through the distributor or a claim processor, and waits for a credit. The work order has a second payer, and the platform needs a receivable for it.

Requirements are strict and differ by program. Ferguson's HVAC process is representative: claims within 30 days of the repair date, the repair finished first, valid serial numbers for failed and replacement units or parts, install and failure dates, a failure code, prior authorization for full-unit claims, the failed part returned only if requested, and a credit once the manufacturer approves. Appliance repair runs through claim processors: ServiceWorks submits to ServiceBench and ServicePower, only for jobs marked delivered, with model, serial, defect and repair codes, and posts payments against a warranty claims receivable with write-offs and an overdue report. Adjudication is the manufacturer's; the platform's job is complete evidence.

Warranty is also separate from workmanship. ServiceTitan's contractor guide says most home service businesses treat a recall as "errors or omissions by the service technician within 30 days of a service call or within one year of an installation job", while a manufacturer defect follows the manufacturer's rules. The distinction decides who pays and whose metric it hits.

Model the claim as its own record with states (`draft`, `submitted`, `more_info_requested`, `approved`, `rejected`, `paid`, `written_off`), a submit-by date computed from the repair date, the evidence it carried (serials, rating plate photos, failure code), and amounts claimed and paid. Rejections for a missing serial are a measurable process failure, and an aging report of unpaid claims is money small shops often never collect.

## Home Warranty Companies

A home warranty (in Texas law a **residential service company**, regulated by TDLR since it took over from the Texas Real Estate Commission on September 1, 2021) is a third party that both dispatches and pays. The homeowner bought a contract covering systems and appliances; when the water heater fails they call the warranty company, not a plumber, and the warranty company picks the contractor. American Home Shield's contract says "AHS has the right to select an AHS authorized service contractor," and First American's says "Company will dispatch your call to a qualified Contractor," whose technicians "are independent contractors, not agents or employees of the Company."

For the contractor that changes four things:

- **The work arrives as a dispatch,** with the warranty company's reference number, through its portal or a network platform (Dispatch, used by home warranty companies, sells "a branded customer portal, no app required"). It's an inbound work order like a facilities client's, below.
- **The customer pays only a service fee,** which is not the contractor's diagnostic fee. AHS's homeowner owes "a Trade Service Call Fee for each trade service request"; First American's homeowner pays "the $75 service call fee when the independent contractor (Contractor) arrives." Whether the technician collects it at the door or the warranty company does is set by each program, so it's a rule per payer, and the rest of the invoice goes to the warranty company.
- **Repairs need authorization.** "AHS will not reimburse for services performed without its prior approval," so the technician diagnoses, calls or submits for authorization, and waits. The authorization number, the approved amount and what was excluded are recorded before any repair work, and anything the contract excludes is quoted to the homeowner as a separate, customer-paid line on the same work order.
- **The warranty company warrants the work.** AHS charges no new fee for a failure within 30 days; First American "warrants Contractor's work for 30 days." A recall from the warranty company is a callback in this book's sense, booked against the original work order and unpaid.

So a home warranty job is a work order with two payers, like a manufacturer warranty claim but with the third party in charge of dispatch and price. Frontdoor tells contractors it pays "within as little as 10 business days of submission," which makes the warranty company a receivable with its own aging ([Billing Recurring Service](/books/field-operations/billing-recurring-service#repair-install-and-commercial-work)).

## Installs and Projects

A system replacement, a re-roof, a panel upgrade or a security install looks like a small construction project: an estimate, a signed contract, permits, materials, one or more crews over several days, an inspection, and money in stages.

- **Estimate and sale.** Often measured remotely: AccuLynx populates roofing estimates and material orders from EagleView and GAF QuickMeasure aerial reports. Financing often decides the sale ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)).
- **Permits and inspections.** A pending permit is a work-order hold (`permit_needed`), and the inspection is a visit that records a pass or fail ([Licenses & Permits](/books/field-operations/licensing-and-permits)).
- **Materials.** AccuLynx orders from suppliers at local branch pricing and shares the order with the crew app, so crews confirm what arrived before starting. Delivery is a dependency of the work visits.
- **Crews and dependencies.** Salesforce models service crews and time dependencies between appointments: rough-in before trim-out, inspection after both.
- **Progress billing.** Deposit at signing, progress payments, final invoice. ServiceTitan builds an Application for Payment from a schedule of values (percent complete per line, previous billings carried forward, current payment due) in AIA G702 and G703 layouts, with optional retainage posted to a retainage receivable.

The install closes by creating the assets, registering warranties within their windows, and handing the property to a maintenance agreement.

**Change orders.** Installs change after the contract is signed: rotted decking under the shingles, a panel that can't take the new circuit, a homeowner who adds a zone. A change order is a signed amendment, not an edited estimate. ServiceTitan calls it "simply a contract that is tied to another job" that "needs a signature just like any other proposal," and requires "An original Sold estimate" before one exists; BuildOps says that "After approval, the change updates the project budget and contract value," and keeps internal change orders "off pay applications." On commercial work the AIA G701 form is the paper version: its execution "indicates agreement upon all terms of the change, including any changes in the contract sum (or guaranteed maximum price) and contract time." So a change order records the reason, the lines added or removed, the change in price and in schedule, who signed and when, and whether the customer sees it. Approved, it moves the contract value, the schedule of values and the job's budget at once, which is what [estimated vs actual job cost](/books/field-operations/operating-metrics#contracts-bids-and-job-cost) is measured against; a job whose actual cost ran over because of unsigned changes is the margin leak that report should catch. A change order sold at the home is also a new sale for cooling-off purposes ([Options at the Door](/books/field-operations/repair-and-installation#options-at-the-door)).

**Multi-day crew jobs.** A three-day install is one work order with a visit per crew per day, each with its own window, crew and status, linked by dependencies; the crew's hours on each day post to the job as labor cost from their classified time ([Technicians: Time, Pay & Labor Rules](/books/field-operations/technician-workforce#how-to-build-it)), and materials from what was delivered and used. A day lost to weather or a failed inspection is a `not_completed` or `cancelled` visit on that day, not a change to the job, so the schedule slip and the cost of the idle crew both stay visible.

**Delivery and install for someone else.** An appliance delivered and hooked up for a retailer, a replacement unit shipped under a manufacturer's warranty, furniture assembled for a brand: the retailer or manufacturer pays and sets the rules (delivery windows, proof photos, haul-away), while the work happens at the consumer's home, whose access notes and history the crew needs. That's the payer and site split from [Customers, Accounts & Properties](/books/field-operations/customers-and-properties): the work order bills the retailer's account, the consumer is a contact on it, and the property stays the consumer's, so the next repair at that address sees what was installed.

## Insurance Claims Work: Restoration and Roofing

Storm roofing, water and fire restoration are paid, in large part, by the homeowner's property insurer. The contractor's customer is the homeowner, but the scope and price are negotiated with an adjuster, and the money arrives in pieces.

- **The estimate is in the carrier's format.** Most US property claims are priced in Verisk's Xactimate; an advocacy group's summary of an industry report says carriers "use Xactimate's products to handle more than half of all property claims," with price lists regenerated monthly in most regions. Carriers send work through XactAnalysis, where the insurer will "create an assignment in XactAnalysis and send it to a service provider." A restoration contractor writes its scope in the same line items, because that is what the adjuster can compare. DASH (Cotality) and other restoration platforms connect to Xactimate and XactAnalysis rather than replacing them.
- **Supplements.** Items the adjuster missed (the decking found under the shingles, a code-required upgrade) go back as a supplement. Missouri's insurance department warns that "All supplements must be inspected and approved before repairs are completed, which may require multiple inspections." A supplement is a change order whose approver is the carrier, with its own status.
- **Depreciation is held back.** On a replacement-cost policy the first payment is "the estimated cost of repairs, minus depreciation and your deductible" (Texas Department of Insurance), and the carrier releases the withheld depreciation "once repairs have actually been made" (Missouri). Completing the job and sending the final invoice and photos to the carrier is what releases the last check, so it's a step with an owner.
- **Checks have several payees.** The insurer makes the check "out to both you and your mortgage company" (TDI), and the lender releases money "as the work is done." The contractor is paid by the homeowner as funds clear, or directly where the policy and state allow. Florida voided assignments of post-loss benefits under residential policies issued on or after January 1, 2023 (Fla. Stat. 627.7152(13)), so direct pay by assignment is a state-by-state rule, not a default.
- **The contractor can't be the adjuster or eat the deductible.** Texas says "A contractor may not act as a public adjuster or advertise to adjust claims for any property for which the contractor is providing or may provide contracting services" (Ins. Code 4102.163) and makes it an offense to "pay, waive, absorb, or otherwise decline to charge or collect" the deductible (Bus. & Com. Code 27.02); Colorado bars a roofing contractor from promising to "pay, waive, or rebate all or part of any insurance deductible." The deductible is always a customer-paid line, and a discount equal to it is the same violation by another name.

In data, the claim is a record on the work order: carrier, claim number, adjuster, date and type of loss, deductible, and each estimate version, supplement and payment received with its payees. ServiceTitan's claim fields (claim number, type of loss, carrier, deductible, date of loss, adjuster) and Roofr's job card ("Insurance company name," "Deductible," "Claim number") are the common core; neither field list publishes recoverable depreciation, which is the amount the contractor most often forgets to collect, so track it. Mitigation work adds evidence: trade guidance on the IICRC S500 water damage standard says to "record temperature, relative humidity, and grains per pound at the affected area" every day on site, because "Carriers reinspect, desk-review, and audit." Those readings are structured form results per visit ([Proof of Service](/books/field-operations/proof-of-service)), not photos of a clipboard.

## Maintenance Agreements in the Repair Trades

The repair trades' recurring layer is the maintenance agreement, usually sold as a membership: a tune-up per system in the shoulder seasons, a repair discount, priority scheduling, sometimes a waived diagnostic fee. Three things set it apart from a route-service agreement:

- **It generates work per asset.** A two-system home gets two tune-ups, and adding a water heater adds a line. The covered assets are part of the agreement's terms, so the generator in [Recurring Schedules](/books/field-operations/recurring-schedules) produces an occurrence per covered asset and service, and a replaced furnace moves its coverage to the new asset record.
- **Other workflows read its benefits.** Triage reads priority when a cold morning brings more no-heat calls than technicians; the pricebook reads the member discount and waived fee when the technician quotes. The quote records which benefit it applied, so a lapsed member isn't charged member prices and a member's discount survives a dispute.
- **The tune-up finds the repairs.** A spring check finds a failing capacitor, a fall check a cracked heat exchanger. Each finding is its own work order, linked to the occurrence that found it, which is how a membership shows its value in revenue.

Every member wants the visit in the same few weeks, so shops spread tune-ups across wide windows through the shoulder season. The agreement itself (terms, renewal, cancellation) is in [Service Agreements & Plans](/books/field-operations/service-agreements).

## Commercial Work: Contracts, Clocks and Caps

Commercial customers buy coverage, not jobs: a service contract across their sites with response times, planned maintenance per asset, reactive calls under a cap, and paperwork their own auditors read.

**Service levels are clocks.** Salesforce's entitlement management is the reference. An entitlement process is "a timeline that includes all the steps (milestones)" to resolve a record, of type Case or Work Order. Milestones such as first response and resolution time carry actions that fire as warnings before a violation, as violations after it, and as successes on completion; business hours decide which minutes count, and a Stopped flag pauses the process, for example while waiting on the customer. An entitlement's operating hours also bound booking: weekdays 8 AM to noon for one customer, 24/7 for another. The design to take: a **response clock** and a **resolution clock** per work order, each a target, a calendar in the property's time zone, and timestamped events (started, paused with a reason, resumed, met, violated). Compute breaches from the events so a disputed four-hour response can be replayed, and require a reason to pause, since pausing is how clocks get gamed.

![A dimensional drawing of response and resolution clocks on one commercial work order, with business hours from Tuesday to Thursday and nights broken out, a detail of the on-site arrival and a variable table. A call at 15:00 on Tuesday starts both. The 4-hour response clock R1 counts 2 hours on Tuesday and 2 on Wednesday, due at 10:00; the technician arrives at 09:30, using 3.5 hours with 0.5 to spare. The 16-hour resolution clock S1 counts 2, 3, 3 and 8 business hours (B1 to B4), skipping a 3-hour pause P1 while waiting on customer access, due Thursday at 16:00; the work is resolved at 14:00 after 14 hours.](/diagrams/fo-repair-and-installation-dwg-sla.svg "Both clocks count only business hours in the property's zone, and a recorded pause stops the resolution clock. The targets, hours and times are illustrative.")

**Planned maintenance is per asset.** Salesforce maintenance plans "define the maintenance schedule for specific assets" and typically reflect the service contract, with calendar, criteria (a panel above a temperature) or usage (gallons through a water heater) rules, and floating plans that schedule from the last completion rather than the calendar. BuildOps sets the frequency once in the agreement ("Agreements drive the schedule") and keeps history and nameplate data per unit. Planned visits find problems, and ServiceTrade's data model keeps deficiencies per asset and job, with severity, status and proposed fix, linked to quotes.

**Spending is capped.** A commercial work order carries the client's **purchase order** number, without which the invoice won't be paid, and often a **not-to-exceed (NTE)** amount. Dynamics supports price, cost and price-and-cost-margin NTEs, selected by customer, incident type or location, and warns on the work order and in the mobile app as the limit approaches, while still letting the work order save. ServiceChannel, which multi-site operators use to manage contractors, is stricter from the client's side: providers can't invoice above the NTE without an approved proposal. My default: warn the technician and require a recorded approval (who, the new amount, the client's reference) before crossing the cap, because the client's system will enforce it at invoice time anyway. Multi-site bill-to, consolidated invoicing and site-scoped portals are in [Customers, Accounts & Properties](/books/field-operations/customers-and-properties).

**Janitorial contracts are recurring scope with an inspection loop.** Commercial cleaning is sold as a scope of work: each task with its frequency, area by area. Loudoun County's janitorial specification is a typical public example. Routine cleaning runs nightly, with weekly, monthly, twice-yearly and quarterly tasks at defined spacing (weekly work at least four days apart, quarterly work about 90 days apart) and county holidays excluded. The contractor furnishes the consumables (paper goods, liners, soap, compatible with the building's dispensers) and runs a quality control plan: signed, dated inspection checklists, never accepted by the person who did the work, each sent to the county within 24 hours. Deficiencies the county's inspector finds must be fixed within 72 hours, or on receipt for a health or safety issue. In data that's a recurrence per task and area ([Recurring Schedules](/books/field-operations/recurring-schedules)), consumables as per-site stock billed as the contract says, inspections as structured results per area, and each deficiency as an item with its own correction clock, the same shape as a response SLA.

**Compliance inspections** are commercial work with a regulator attached. ServiceTrade's case study with a fire protection contractor describes each jurisdiction requiring its own form, with one digital form sent to each authority in its format and deficiencies feeding quotes. Backflow assemblies follow the water utility's rules; Sioux Falls, for example, requires an annual test by a certified tester from an approved company. The pattern: a structured result per asset, the tester's certification checked at dispatch, the report sent to customer and authority, and every failed item a deficiency that can become a quote.

## Subcontractors and Inbound Work Orders

Commercial work runs through other companies' systems in both directions.

**Inbound from facility managers.** Multi-site clients (retail chains, restaurant groups, property managers) dispatch their contractors through a work order network. ServiceChannel lets a provider "update the status of a work order via a check-in and check-out process" by phone or its mobile app, and the client's not-to-exceed binds the invoice (covered above). JLL's CorrigoPro generates an invoice when the provider receives the work order, auto-submits it at completion when the NTE is zero, and holds others "in PendingVerification status" until the facility manager confirms the work. The field platform's job is to mirror that work order, not retype it: ServiceTitan's integration can "receive ServiceChannel work orders directly in the ServiceTitan Job Booking screen" and sends invoice data back once exported. Three rules: the client's work order number is the idempotency key and goes on every document; the technician's check-in to the client's network is a step in the visit, because a missed check-in is unpaid work at many clients; and status flows back as events, never by someone updating two systems.

**Outbound to subcontractors.** A business takes work outside its trade or territory (the HVAC company's roofing leak, the pest company's exclusion carpentry, a rural site four hours away) and sends it to a sub. The sub is a resource of kind `contractor` in the core model; ServiceChannel lets a provider "automatically assign work orders to sub-contractors, based on trade and location," and Microsoft publishes a sample for contractors to "sign in to the Field Service mobile app" under their own bookable resources, offered "as-is." What the platform holds for a sub:

- **Credentials before dispatch.** The sub's license, its certificate of insurance and its bond are records with expiry dates, checked by the scheduler like a technician's skill ([Bonds and Certificates of Insurance](/books/field-operations/licensing-and-permits#bonds-and-certificates-of-insurance)).
- **Per-job pay.** A sub is paid an agreed amount or rate per job, from an approved sub invoice against the work order, not from payroll; the margin is the customer price minus that cost.
- **Limited access.** A sub sees the work orders assigned to it, the property's access notes and the forms to complete, through a portal or a scoped app login, and nothing else of the customer's account ([Support Access & Internal Tools](/docs/security/support-access)).
- **The same proof.** The sub's photos, readings and signatures go into the same visit record, because the customer, the regulator and the facility client hold the prime contractor responsible.

## Emergencies, After Hours and On Call

Emergency work jumps the queue, costs more and is staffed differently.

- **Priority from triage.** No heat in a freeze, an active leak, a failing restaurant cooler: priority comes from rules on problem codes, recorded with who set it, because it decides who gets bumped and what rate applies. Emergencies skip the route-cost ranking when slots are offered ([Customers, Fairness and Urgent Work](/books/field-operations/booking-appointments#customers-fairness-and-urgent-work)) and land in room held back for them ([Reserving Room and Forecasting](/books/field-operations/territories-and-capacity#reserving-room-and-forecasting)).
- **After-hours rates** are pricebook rules by time of day and day type, with holidays from the branch's calendar ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)); commercial contracts may set them.
- **On-call technicians can be sent but don't add bookable capacity;** the rule and Oracle's version of it are in [Crews, Shifts and Operating Hours](/books/field-operations/territories-and-capacity#crews-shifts-and-operating-hours).
- **On-call pay is a labor question.** On-call time restricted enough that the employee can't use it as their own is working time ([What Counts as Hours Worked](/books/field-operations/technician-workforce#what-counts-as-hours-worked)); keep on-call periods as shifts with their restrictions, and record each callout as `time_punches` ([The Technician App](/books/field-operations/technician-app#how-to-build-it)), so payroll can apply the rule and any state law.

## First-Time Fix and Callbacks

**First-time fix** asks whether the first visit solved the problem; its failure is the **callback** (recall). ServiceTitan's recall job can be booked only from a completed job, is set to no charge, and links back to the original. Callbacks count against workmanship; warranty failures belong to the manufacturer.

What keeps the metric honest is the link: a callback is a new work order with `source = 'callback'` and `callback_of_work_order_id` set when it's booked, never inferred from "same address within 30 days". First-time fix is computed per work order: fixed on its first completed visit, with no callback work order inside the window ([Operating Metrics](/books/field-operations/operating-metrics) gives the definition and window). A return trip for a part that wasn't on the truck is not a callback, because the work order never closed, but it does fail first-time fix. The causes are mostly upstream and measurable: the part wasn't on the truck, the wrong skill was sent, or the asset history was missing.

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business). It adds an asset table and its warranty terms, columns on `work_orders`, and tables of its own for parts, claims, clocks, devices, third-party payers, change orders and subcontractors; existing columns are unchanged, and visits use the canonical states and reasons.

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

-- hold_reason and callback_of_work_order_id are already on work_orders
-- (The Field Operations Business)
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
  item_id             UUID NOT NULL REFERENCES items (id),  -- the shared catalog
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

CREATE TABLE devices (                    -- a connected sensor or controller on an asset
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  asset_id            UUID NOT NULL REFERENCES assets (id),
  provider            TEXT NOT NULL,             -- the manufacturer's or IoT platform's name
  external_device_id  TEXT NOT NULL,
  access_granted_by   UUID REFERENCES people (id),  -- the owner who shared it
  access_during       TSTZRANGE NOT NULL,        -- open while shared; closed on revoke
  UNIQUE (tenant_id, provider, external_device_id)
);

CREATE TABLE device_alerts (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  device_id           UUID NOT NULL REFERENCES devices (id),
  parent_alert_id     UUID REFERENCES device_alerts (id),  -- repeats inside the debounce window
  code                TEXT NOT NULL,             -- the provider's fault or event code
  occurred_at         TIMESTAMPTZ NOT NULL,
  disposition         TEXT NOT NULL CHECK (disposition IN ('new', 'duplicate', 'resolved_remotely',
                        'work_order', 'csr_task', 'ignored')),
  work_order_id       UUID REFERENCES work_orders (id)
);

CREATE TABLE third_party_payers (         -- who pays besides the customer, per work order
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  payer_account_id    UUID NOT NULL REFERENCES accounts (id),  -- warranty company, insurer, FM client
  kind                TEXT NOT NULL CHECK (kind IN ('home_warranty', 'insurance_claim',
                        'facility_client', 'lender')),  -- manufacturers: warranty_claims
  external_ref        TEXT NOT NULL,             -- dispatch, claim or client work order number
  authorization_ref   TEXT,                      -- the approval the work waited for
  authorized_amount   BIGINT,
  customer_fee        BIGINT,                    -- service call fee or deductible, billed to the customer
  details             JSONB,                     -- adjuster, date of loss, depreciation held, ...
  currency            TEXT,
  UNIQUE (tenant_id, payer_account_id, external_ref)
);

CREATE TABLE change_orders (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  estimate_id         UUID NOT NULL REFERENCES estimates (id),  -- the sold estimate it amends
  approver            TEXT NOT NULL CHECK (approver IN ('customer', 'carrier', 'internal')),
  status              TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'approved', 'declined')),
  reason              TEXT NOT NULL,
  price_change        BIGINT NOT NULL,           -- minor units, signed
  days_change         INTEGER NOT NULL DEFAULT 0,
  approved_at         TIMESTAMPTZ
);

CREATE TABLE subcontractors (             -- another company that does work for this one
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  name                TEXT NOT NULL,
  tax_id_last4        TEXT                       -- the full ID lives with accounts payable
);

ALTER TABLE resources                     -- a contractor resource can belong to a sub
  ADD COLUMN subcontractor_id UUID REFERENCES subcontractors (id);
```

`items` is the one sellable and stock catalog from [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules#how-to-build-it); a part here is an item of kind `part` or `equipment`. Receiving the part order clears a `part_needed` hold and makes the work order schedulable again. The clock's events are the truth, and `due_at`, `met_at` and `violated_at` can be rebuilt from them. A device alert whose asset already has an open work order becomes a `duplicate` under it rather than a second job. A third-party payer is an account like any other, so the warranty company, the insurer and the facilities client get invoices and aging from [Billing Recurring Service](/books/field-operations/billing-recurring-service); its reference number is unique per payer, so a redelivered dispatch is one work order. An approved change order adds lines to the work order like an approved estimate option and moves the job's budget. The chapter adds outbox events `work_order.estimate_approved`, `work_order.part_received`, `device_alert.received`, `change_order.approved`, `sla_clock.warned`, `sla_clock.violated` and `warranty_claim.decided`, in the envelope from [Events & Async Messaging](/docs/architecture/events).

## Auditing

- **Estimate approvals and overruns.** Options shown, the one approved, the fee disclosed, and every consent to exceed an estimate or NTE: who, when, how (signature, oral, client reference) and the amount. This is the record in a billing dispute, a repair-dealer complaint and a client's invoice audit.
- **Serials and part disposition.** Installed and removed serial numbers, where each part came from, and what happened to the failed one. Warranty claims are paid or rejected on these.
- **SLA clock events.** Every start, pause (with its reason and who paused it), resume and breach, so a disputed response time can be replayed from the events.
- **Priority and rate changes.** Who marked a call as an emergency or after hours, since both change what the customer pays.
- **Third-party authorizations.** Each warranty authorization, insurance estimate version, supplement and payment with its payees, and each facilities client check-in, because the payer pays on these and audits them later.
- **Change orders and remote actions.** Who approved each change and what it moved, and every command sent to a customer's device with who sent it and the result.
- **Device access and sub credentials.** When an owner granted and revoked access to a device, and which license, insurance certificate and bond a subcontractor held on the day it was dispatched.

The general mechanics are in [Audit Trails](/docs/architecture/audit-trails); field records and their retention are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **One work order, many visits,** with canonical visit states and reasons, work-order holds, and part orders as dependencies of the return visit.
- **Diagnostic fees and after-hours rates as pricebook rules,** with disclosures and every overrun consent recorded.
- **Pricing method per line,** so flat rate and time and materials share a work order.
- **Every option snapshotted,** and cooling-off rights applied to sales made on repair visits.
- **Assets created by installs,** with serials, replacement links and warranty terms whose registration deadlines are tasks.
- **Warranty claims as receivables** with states, deadlines, evidence and aging.
- **Projects with permits, deliveries, crews, dependencies and progress billing,** signed change orders that move the budget and job cost, and delivery work billed to the retailer at the consumer's property.
- **Connected equipment as alerts on assets,** deduplicated, triaged by rules, resolvable remotely, under consent the owner can revoke.
- **Third-party payers as accounts:** home warranty companies, insurers and facilities clients, each with its reference, authorization and the customer's share (service fee or deductible) billed separately.
- **Subcontractors as resources** whose credentials gate dispatch, paid per job, seeing only their own work.
- **SLA clocks built from events,** NTE caps with recorded approvals, PO numbers on invoices, janitorial scope with inspections and correction clocks, and maintenance generated per asset.
- **On-call as availability, not capacity,** and **callbacks linked when booked.**

## References

**Specifications**

- [Cornell LII: 16 CFR 429.0, Definitions (Cooling-Off Rule)](https://www.law.cornell.edu/cfr/text/16/429.0), the bona fide emergency waiver by handwritten statement and the buyer-requested repair exclusion limited to personal property, excluding additional sales
- [California Business and Professions Code section 9844](https://california.public.law/codes/business_and_professions_code_section_9844), Electronic and Appliance Repair Dealer Registration Law: written estimate before repair, disclosed diagnostic fee and no charges beyond the estimate without consent
- [Cornell LII: 16 Cal. Code Regs. 2722](https://www.law.cornell.edu/regulations/california/16-CCR-2722), electronic and appliance repair dealer regulations: estimates including the initial service call, and recording oral consent on the invoice
- [Cornell LII: 29 CFR 785.17, On-call time](https://www.law.cornell.edu/cfr/text/29/785.17), when on-call time is working time under the FLSA
- [Fla. Stat. 627.7152: Assignment agreements](https://www.flsenate.gov/Laws/Statutes/2024/627.7152), no assignment of post-loss benefits under residential property policies issued on or after January 1, 2023
- [Tex. Ins. Code 4102.163](https://texas.public.law/statutes/tex._ins._code_section_4102.163), contractors may not act as public adjusters on properties they work on
- [Tex. Bus. & Com. Code 27.02](https://texas.public.law/statutes/tex._bus._and_com._code_section_27.02), the offense of paying, waiving or absorbing an insured's deductible
- [C.R.S. 6-22-105](https://colorado.public.law/statutes/crs_6-22-105), roofing contractors may not promise to pay, waive or rebate a deductible
- [City of Sioux Falls: Cross Connection Control](https://www.siouxfalls.gov/resident-services/utilities-billing/water/cross-connection-control), annual backflow assembly testing by certified testers from approved companies

**Reference**

- [Microsoft Learn: IoT alerts in Connected Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/cfs-iot-alerts), alerts to cases for remote investigation, then work orders, and aggregation within a five-minute window
- [Microsoft Learn: Register IoT devices](https://learn.microsoft.com/en-us/dynamics365/field-service/cfs-register-devices), devices associated with customer assets, several per asset
- [Microsoft Learn: Send commands to IoT devices](https://learn.microsoft.com/en-us/dynamics365/field-service/cfs-commands), commands from alerts, such as resetting a thermostat
- [Microsoft Learn: Vendor self-service for technician management](https://learn.microsoft.com/en-us/dynamics365/guidance/resources/fs-vendor-self-service-for-technician-management), a sample solution for contractors in the Field Service app
- [Salesforce: Field service asset management news](https://www.salesforce.com/news/stories/field-service-asset-management-news/), workflows triggered by asset conditions and work orders created when a remote fix fails (June 2024)
- [Salesforce: Field service asset management](https://www.salesforce.com/service/field-service-management/asset-management/), remote actions such as rebooting or firmware upgrades in response to error codes
- [TDLR: Residential service companies](https://www.tdlr.texas.gov/news/2021/09/01/residential-service-companies-home-warranties/), home warranty oversight moved from TREC to TDLR on September 1, 2021
- [Texas Department of Insurance: Homeowners claims](https://www.tdi.texas.gov/pubs/consumer/cb025.html), actual cash value payments, withheld depreciation and checks payable to the homeowner and mortgage company
- [Texas Department of Insurance: Roofing and insurance, know the law](https://www.tdi.texas.gov/Consumer/storms/roofing-and-insurance-know-the-law.html), no contractor public adjusting and no deductible waivers
- [Missouri DCI: Homeowners claims](https://dci.mo.gov/node/2226), supplements inspected and approved before repairs and depreciation released after repairs
- [AIA Contract Documents: G701-2017 Change Order summary](https://help.aiacontracts.com/hc/en-us/articles/1500009384382-Summary-G701-2017-Change-Order), changes in contract sum and time, and the parties' signatures
- [Salesforce: Entitlement Management admin guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_entitlements_implementation_guide.pdf), entitlement processes for cases and work orders, milestones, warning, violation and success actions, business hours and stopped time
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), entitlement operating hours, maintenance plans, warranty terms and asset warranty terms, service crews and time dependencies
- [Salesforce Trailhead: Create a maintenance plan](https://trailhead.salesforce.com/content/learn/modules/field_service_maint/field_service_maint_plan), calendar, criteria and usage-based rules, and floating work orders
- [Microsoft Learn: Work order lifecycle and system statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), bookings that don't complete the work order, travel charges, billable duration and conversion to customer assets
- [Microsoft Learn: Not-to-exceed values on work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-not-to-exceed), price, cost and margin NTEs, automatic selection and warnings that don't block saving

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
- [Carrier: Infinity smart thermostat](https://www.carrier.com/us/en/residential/smart-thermostats/systxccitc01-c/?page=1), dealer remote monitoring after the homeowner opts into data sharing
- [Trane: Dealer remote access](https://support.tranehome.com/hc/en-us/articles/360046235272), registering with a dealer, enabling diagnostics and allowing or denying access
- [Daikin: Cloud services](https://www.daikinac.com/products/cloud-services-apps), homeowner-authorized contractor access and critical errors pushed to dealers
- [Resideo: Pro-IQ services](https://www.resideo.com/us/en/corporate/newsroom/featured-articles/pro-iq-services-helps-contractors-win/), contractor alerts on runtime anomalies and fixes without a truck roll
- [Rentokil Initial: Connected technology](https://www.rentokil-initial.com/our-services/connect-technology.aspx), PestConnect remote rodent monitoring by unit
- [Ecolab: Connected Rodent](https://www.ecolab.com/offerings/pest/commercial-rodent-elimination-services/connected-rodent-pest-control), 24/7 digital rodent activity monitoring alongside the service program
- [Turner Pest: Anticimex SMART](https://www.turnerpest.com/?p=1957), connected traps and sensors reporting activity alongside regular inspections
- [Pentair: Pentair Pool app](https://www.pentair.com/en-us/pool-spa/education-support/homeowner-support/pentair-pool-app.html), alerts optionally shared with a pool professional
- [Pool Magazine: Pentair Pool and Pool Brain](https://www.poolmagazine.com/news/press-releases/pentair-pool-and-pool-brain/), planned pump data in route software for early warnings (August 2026)
- [Hayward: Add another user](https://www.hayward.com/knowledge-base/how-to-add-another-user/), OmniLogic sharing by guest user
- [American Home Shield: California sample contract (PDF)](https://4bbdwp2p.media.zestyio.com/CA-Contract.pdf), the Trade Service Call Fee, contractor selection, prior approval and the 30-day recall
- [First American Home Warranty: Sample contract (PDF)](https://homewarranty.firstam.com/media/contracts/P0.B.pdf), the service call fee paid on arrival, dispatch to independent contractors and the 30-day workmanship warranty
- [Frontdoor Pro: What to expect](https://www.frontdoor.com/pro/what-to-expect), contractor payment within as little as 10 business days and the contractor portal
- [Dispatch: Home warranty](https://dispatch.me/solutions/by-industry/home-warranty/), service provider network management with a branded customer portal
- [UpHelp: Xactimate, the history and the future](https://uphelp.org/claim-guidance-publications/xactimate-the-history-the-future/), Xactimate's share of property claims and monthly price lists (policyholder advocacy summary)
- [XactAnalysis: Service provider FAQ](https://xactanalysis-sp.helpdocs.io/l/enUS/article/1c1vb416pd-faq), carrier assignments to service providers and reassignment on rejection
- [Cotality: DASH integrations](https://content.cotality.com/restoration/dash-product-brochure/integrations), restoration software connected to Xactimate and XactAnalysis
- [ServiceTitan: Insurance claim information](https://help.servicetitan.com/v1/docs/insurance-claim-information-in-job-and-estimate-report-templates), claim number, loss type, carrier, deductible, date of loss and adjuster fields
- [Roofr: Insurance section on the job card](https://help.roofr.com/en/articles/15649776-how-to-use-the-insurance-section-on-the-job-card), carrier, deductible, claim number and amount
- [R&R: Documentation that survives an insurance audit](https://www.randrmagonline.com/articles/92115-documentation-that-survives-an-insurance-audit-moisture-mapping-drying-logs-and-photo-discipline), daily drying logs under IICRC S500 and carrier audits
- [ServiceTitan: Commercial change orders](https://www.servicetitan.com/commercial-playbook/commercial-change-orders), a change order as a signed contract tied to a job
- [ServiceTitan: Use change orders to reflect cost adjustments](https://help.servicetitan.com/how-to/use-change-orders-to-reflect-cost-adjustments), changes to contract value and the sold estimate requirement
- [BuildOps: Construction change orders](https://buildops.com/resources/construction-change-orders), approved changes updating budget, contract value and pay applications
- [ServiceChannel: IVR check-in and check-out](https://servicechannel.atlassian.net/wiki/spaces/SCUCP/pages/579764555/Using+the+Telephone+IVR+System+to+Check+In+and+Out+of+Work+Orders), provider status updates by phone or the provider mobile app
- [ServiceChannel: Assigning work orders to subcontractors](https://servicechannel.atlassian.net/wiki/spaces/SCUCP/pages/1674969913/Assigning+Work+Orders+to+Sub-Contractors+via+Work+Order+Assigment), automatic assignment by trade and location
- [CorrigoPro: Retrieving invoices](https://developer.corrigopro.com/docs/retrieving-invoices), invoices generated with the work order, zero-NTE auto-submission and pending verification
- [ServiceTitan: Integration with ServiceChannel](https://help.servicetitan.com/docs/servicetitan-integration-with-servicechannel), inbound work orders, NTE values and invoice sync
- [ServiceChannel: Work orders](https://servicechannel.com/products/work-orders), NTE limits on invoices and proposals above the NTE
- [BuildOps: Preventative maintenance](https://buildops.com/features/preventative-maintenance), agreements driving the schedule, per-unit history and deficiencies
- [ServiceTrade: AAA Fire Protection case study](https://servicetrade.com/resources/case-studies/aaa-fire-protection/), jurisdiction-specific inspection forms and deficiencies feeding quotes
- [ServiceTrade connector schema (Fivetran)](https://fivetran.com/docs/connectors/applications/servicetrade/connector-schema), deficiencies linked to quotes and jobs
- [AccuLynx: Ordering roofing materials](https://acculynx.com/order-roofing-materials), aerial measurement reports, supplier ordering and crew delivery checks
- [Loudoun County: Janitorial services specification](https://www.loudoun.gov/DocumentCenter/View/115634), task frequencies and spacing, contractor-supplied consumables, quality control inspections and 72-hour deficiency correction
