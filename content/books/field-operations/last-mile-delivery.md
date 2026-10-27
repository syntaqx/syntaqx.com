+++
title = "Last-Mile Delivery & Distribution"
nav_title = "Last-Mile Delivery"
description = "Delivery as field work: the chain to the door, attended versus unattended stops, instructions, proof, failed attempts, loading, depots and who drives."
category = "Field Operations Industry"
order = 1506
part = "How the Work Flows"
tags = ["field-operations", "delivery", "last-mile", "proof-of-delivery", "routing", "data-model"]
+++

A delivery is a visit whose service time is measured in seconds. A driver pulls up, carries a box or a sofa to the door, proves it arrived, and leaves for the next of forty or a hundred stops. The core model still applies (work order, visit, route, window, proof), but the proportions change: drive time dwarfs time on site, the customer often isn't home, and the evidence that it arrived matters more than any signature, because nobody may have seen it happen. This chapter covers what a field operations platform needs to run delivery itself, and where delivery stops being field work and becomes logistics.

Delivery is also the clearest case of a distinction every trade has and rarely names: whether the customer has to be there. A parcel, a lawn treatment and a meter read can happen with nobody home; a sofa, a furnace repair and a house cleaning usually can't. That one attribute changes the window, the route, the risk and the proof.

## From Dock to Door

Goods move through a chain, and each link has its own software:

- **First mile:** from the shipper (a retailer, a manufacturer, a supplier) to the first warehouse or carrier facility.
- **Middle mile:** linehaul between facilities, in full trucks on fixed lanes, planned by a transportation management system (TMS).
- **Hubs and cross-docks:** facilities where goods are sorted and transferred onto outbound vehicles, ideally without being stored. Track-POD's API marks cross-docking routes and orders processed via a hub.
- **Last mile:** from the hub or depot to the door, a locker or a store counter, in vans and cars running many stops.

![The delivery chain from left to right: a shipper sends goods over the first mile to a warehouse, the middle mile carries them to a hub or depot, and the last mile fans out from the hub to a recipient who signs, a safe place with a photo, or a locker or counter. The first two links sit in a zone labelled logistics, the hub and last mile in a zone labelled field operations. A dashed path returns failed attempts from the door to the hub for a retry, a hold at a pickup point, or a return.](/diagrams/fo-last-mile-delivery-chain.svg "Field operations starts where goods are loaded onto a route. Failed attempts come back to the same hub, so the hub is both the start and the exception path.")

**Where field operations ends.** My rule: the field platform owns everything from the moment goods are assigned to a route out of a depot the tenant controls, through the door, and back if the delivery fails. Warehouse inventory and linehaul belong to a warehouse management system or TMS, which hands the field platform a manifest: orders, items, weights and the departing depot. The overlap is the hub, where items are scanned onto vehicles and failed deliveries come back. An appliance dealer or building supply yard delivering its own goods runs the whole last mile in the field platform; a business delivering for others receives orders by API from many shippers.

## Why the Last Mile Costs the Most

A linehaul truck moves thousands of items between two points; a last-mile van moves them one or two at a time to separate addresses, each with its own parking, walk and handoff. Capgemini Research Institute's survey of retail and consumer products firms, published in January 2019 (I found no newer primary study of the same share; the higher figures quoted since come from vendor blogs), put last-mile delivery at 41% of overall supply chain costs, "more than double any other category of spend, such as parceling or warehousing," and noted that much of that cost is variable, rising with volume. The same report found that organizations offering lockers and pickup points reported lower delivery costs, which is the density argument from the other side: one stop serving many customers.

The arithmetic is the route density argument from [The Field Operations Business](/books/field-operations/field-operations-business) with smaller service times, so drive time is an even larger share of the day. Two numbers carry it:

- **Stops per route** (or per hour), which density, windows and service time decide.
- **Cost per stop**, the route's cost divided by the stops it served.

A workable definition, since the vendors that report it don't publish one (Spoke's analytics track "the average cost per delivery over time"; Track-POD exposes planned and actual route cost):

```text
cost_per_stop =
  (driver paid hours x loaded hourly rate + route miles x cost per mile)
  / count(stops attempted on the route)

cost_per_delivery =
  same numerator / count(stops completed)
```

Report both. The gap between them is what failed attempts cost: a failed stop pays the drive and earns nothing, and its redelivery pays the drive again. Every section below about access, preferences and proof is also about cost.

## Attended and Unattended Service

**Attended** work needs someone present: to open the door, to sign, to show ID, to receive a large item, to let a technician inside. **Unattended** work doesn't: the package goes on the porch, the lawn is treated, the pool is balanced, the meter is read, and the customer finds out from a message and a photo.

| | Attended | Unattended |
| --- | --- | --- |
| **Examples** | Appliance and furniture delivery, signature or age-checked parcels, interior cleaning, HVAC and plumbing repair | Most parcels, exterior lawn, pest and pool service, meter reads, gutter cleaning |
| **Window** | Narrow and promised, often two to four hours | Wide (the day) or none |
| **Routing** | Windows constrain the sequence | The solver orders by geography |
| **Main risk** | A missed window, a customer not home | Access, theft, a wrong address, no proof |
| **Proof** | Signature, PIN or ID check, plus photos | Photo with location and time, handoff type |

![Two panels with the same depot and six stops. On the left, attended: stops carry alternating two-hour windows, 8 to 10 and 10 to 12, so the route serves A, C and E first, then B, D and F, and crosses itself. On the right, unattended: no windows, and the route is one clean loop A through F. Below each panel, the order, the shape and the main risk: a missed window on the left; access, theft and proof on the right.](/diagrams/fo-last-mile-delivery-attendance.svg "Windows, not distance, set the shape of an attended route. Remove them and the same stops form one loop, and the risk moves from timing to access and proof.")

Removing the window is the largest density lever a scheduler has. An attended route has to serve every early window before any late one, wherever the stops lie; an unattended route is free to sweep a street once. [Route Optimization](/books/field-operations/route-optimization) treats windows as hard constraints, and [Weighing the Routing Objective](/books/field-operations/route-objectives) prices lateness against drive time; both get easier when the window is the whole day. This is why recurring exterior trades route so densely, and why parcel networks push customers toward safe places and lockers.

The risks don't disappear; they move. With nobody home, the questions become: could the driver get in, was it left somewhere safe, was it the right house, and can the business prove it later?

**Attendance is an attribute of the work, resolved like any rule.** My default is a value on the work order with three levels, `required`, `preferred` and `not_required`, resolved from general to specific: the service type (an appliance install is `required`; a lawn round is `not_required`), the items (anything needing an adult signature or a two-person carry forces `required`), the shipper's terms, and the customer's own choice for this order. `preferred` means "try to catch them, but leave it if allowed," which is how most parcels work. The optimizer reads it: `required` work gets a promised window, `not_required` work gets the day.

## Preferences and Instructions

Carriers have spent years building programs that let recipients steer a delivery, and they show which preferences a platform needs:

- **FedEx Delivery Manager** lets recipients save driver instructions (a side door, don't ring the bell), redirect a package to a pickup point, sign in advance (except where an adult or direct signature is required), hold deliveries for up to two weeks, and, for a fee, redirect to a neighbor's address or pick a date and time.
- **USPS Informed Delivery** previews incoming mail and tracks packages, with text or email notifications as status changes.
- **Amazon Key In-Garage Delivery** gives the driver one-time access to a linked smart garage: Amazon "verifies the package and the driver's location before opening the garage door," and the driver can't re-enter without another delivery.
- **Amazon Locker** delivers eligible items (under 10 pounds and smaller than 16 x 12 x 14 inches) to a self-service locker, emails a code or barcode, holds the package for three calendar days, and returns and refunds it if nobody collects it.

Shippers set requirements the recipient can't waive. FedEx's signature options run from none (the driver may leave the package "no matter the circumstances"), through indirect (a neighbor or building manager may sign), direct (someone at the address must sign; otherwise FedEx reattempts or holds the package nearby), to adult signature, which requires "someone 21 or older with a valid government-issued photo ID." On-demand networks make these API fields: DoorDash Drive takes `dropoff_instructions`, a `contactless_dropoff` flag that "prompts a Dasher to take a picture of the delivery at drop-off," `dropoff_requires_signature`, and a PIN option only for orders that aren't contactless.

Those programs map onto a small set of preference kinds: a safe place, an access code, leave with a neighbor, do not leave unattended, hold at a pickup point, call on arrival, and a garage or in-home access grant. Three rules keep them straight:

- **Standing instructions live on the property; one-off choices live on the order.** "Side door" and the lobby code outlive any order; "I'm away Friday, hold it" belongs to one work order, the shape of Onfleet's `recipientNotes` override "for this task only." Access details already live on the property in [Customers, Accounts & Properties](/books/field-operations/customers-and-properties#what-lives-on-the-property).
- **Precedence is fixed:** the shipper's requirements (signature, age check, do not leave) win over the recipient's order-level choice, which wins over the property's standing instruction, which wins over the tenant's default. A safe-place instruction can't turn an adult-signature delivery into a porch drop.
- **Access codes and garage grants are secrets.** Encrypt them, show them only on the route that needs them and only near the stop, log each view, and expire a one-time grant when the visit ends ([Sensitive Data](/docs/payments/sensitive-data)). A door code that sits in plain text in a notes field is a burglary list.

Capture instructions where customers already are: Track-POD stores those entered on its live tracking page ([Customer Communications](/books/field-operations/customer-communications) covers the messages carrying that link). Record each instruction's source, because "the customer told us to leave it there" is a claim the business will need to back up.

## Proof When Nobody Signs

An attended delivery ends with a signature or a PIN. An unattended one ends with a photo and a claim about where the item was left, and [Proof of Service](/books/field-operations/proof-of-service) covers how to make that evidence hold up: captured in the app, hashed, with location and accuracy, required per task. Delivery adds three things.

**The handoff type is part of the proof.** Spoke's driver app records an outcome for each delivered stop: "Delivered to recipient," "Delivered to third party," "Left in mailbox," "Left in safe place" or "Other," each with optional signature, photos, recipient name and notes. My default is a required handoff value on every completed delivery visit (to recipient, to a third party, safe place, mailbox, locker, garage), because a dispute about a missing package turns on exactly that, and a photo of a doorstep means something different from a photo of a neighbor's.

**PINs and ID checks need the recipient, so they force attendance.** Onfleet's completion requirements include a PIN, which only dropoff tasks with a recipient can have, and a minimum age that requires the recipient's ID to be scanned and verified. Uber Direct's verification options include signature, barcodes, picture, identification and PIN, with identification "required for restricted items." A work order that needs any of these is `attendance = 'required'` whatever the recipient asked for. Record that the check passed, the threshold and who did it; don't keep an image of the ID.

**Photos are the default for unattended drops.** Uber Direct turns picture verification on automatically for Leave at Door deliveries, and DoorDash's contactless flag does the same. The photo should show the item and something that identifies the place (the door number, the porch, the mailbox), taken in the app at the stop. Platforms keep these for different periods (Uber Direct's docs say 30 days through the API); a theft claim or a chargeback can arrive later than that, so copy what you depend on into your own store at completion.

## Failed Attempts, Redelivery and Returns

A failed delivery is a visit that ends `not_completed` with a reason from the one catalog in [The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model), and the next attempt is a new visit on the same work order. The existing reasons cover most cases (`not_home` for a delivery that needed someone, `no_access` for a locked lobby or gate, `customer_declined` for a refusal, `weather`, `unsafe_condition`). Three values in that catalog exist for delivery and are used here: `address_not_found`, `id_check_failed` and `item_damaged`. Onfleet's default failure reasons include recipient unavailable, refused and unable to locate; eLogii keeps tenant-defined reasons for pickup and delivery in task history and reports them by team, driver and customer.

What happens next is a policy per shipper or service type, not a driver's improvisation:

- **Retry** on the next wave or the next day, up to a maximum number of attempts. Track-POD counts how many times an order was rescheduled.
- **Hold at a pickup point** (a locker, a store counter, the depot's will-call desk) for a set number of days, with the customer told where and until when. Amazon's lockers hold for three calendar days and FedEx's direct-signature packages fall back to a nearby location; the hold period is part of the promise.
- **Return to the depot** at the end of the route, where the item goes back into stock and is scanned in. If the depot is a warehouse in the inventory ledger, this is a transfer movement like any other ([Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety)).
- **Return to the shipper** after the last attempt or an expired hold, which closes the work order as `cancelled` with a reason and usually starts a refund on the shipper's side.
- **Dispose,** for perishables that can't come back.

On-demand networks make this choice a field on the order. Uber Direct's `undeliverable_action` defaults to return: the courier brings the item back to the pickup address on an automatically created return trip. DoorDash Drive's `action_if_undeliverable` takes `return_to_pickup` or `dispose`, and leaving it blank treats the delivery as contactless. Copy the shape: decide the action when the order is created, not when the driver is standing at a locked door.

Tell the customer what failed and what to do. Locate2u sends "failed delivery notifications with rescheduling instructions"; the reason and the next step belong in the same message, sent from the `visit.not_completed` event, and the dispatcher's side of the exception is in [Dispatch & the Day of Service](/books/field-operations/dispatch).

## Capacity and Loading

Service trades rarely fill a van. Delivery does, so capacity is a hard constraint, and it has several dimensions at once. Track-POD's orders carry weight, volume and pallets, and its vehicles carry matching capacities; Routific accepts capacity as an object of several dimensions, where a load fits only if it fits in every one; Bringg limits a route by length, weight or handling units. Item count is a dimension too, because handling time grows with pieces, not kilograms.

**Load order should match stop order.** The first stop's items go in last, by the door; the last stop's go in first. Spoke records a place in the vehicle for each stop (left or right, front, middle or back, floor or shelf), so the driver can find the package without unloading the van. A route re-sequenced after loading leaves the driver digging; Track-POD keeps both the planned sequence and an "updated sequence by driver." My rule: freeze the sequence when loading starts, and let only narrow changes through after it ([Route Optimization](/books/field-operations/route-optimization#re-optimization-freezing-and-pinning)).

**Scan at load and at drop.** Track-POD marks each goods line as loaded or not loaded, and Bringg can stop a driver leaving a waypoint until inventory is scanned. A load scan catches a missing item at the depot, not the doorstep. Partial delivery is per line: Track-POD records the accepted quantity per goods line, so a refused damaged chair doesn't fail the whole dining set.

**Large items change the crew and the vehicle.** A refrigerator needs two people, a hand truck, often a liftgate, and twenty minutes instead of two. Those are requirements on the work order matched against the crew resource and the vehicle's capabilities, which [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety) models along with the weight thresholds that can make a delivery truck a commercial motor vehicle and its driver subject to hours limits.

## Waves, Depots and Pickup-and-Delivery Pairs

**Depots** are where routes start and end. Onfleet's teams have hubs from which drivers start and end their shifts, and a Spoke plan can inherit its routes' start and end addresses from a depot. A tenant with several depots needs each order assigned to one (by zone, by stock, by the shipper's facility) before routing, or a multi-depot solve that chooses. Routific allows open-ended routes with no end location, which suits drivers who finish at home.

**Waves** are several routes per vehicle per day: a morning route, back to the depot to reload, an afternoon route. Bringg lets drivers return to the fulfillment center between routes with time for loading. Each wave is its own `routes` row with its own loading, which keeps load order and capacity per trip.

**Pickup-and-delivery pairs** are two stops that belong together: collect a return from one customer and bring it to the depot, take a part from a supplier to a job site, carry a meal from a restaurant to a door. The pickup has to come before the delivery on the same vehicle. Onfleet models it as two tasks, a pickup task and a dropoff task that lists it as a dependency; Bringg as one order with up to two waypoints. My default is two visits on one work order with a precedence link, because each stop has its own window, evidence and failure, and a pickup that fails cancels its delivery.

**Same-day and scheduled** delivery are different planning problems. Scheduled delivery is batch-optimized after an order cutoff (a branch setting in local time) and loaded before the first wave. Same-day work is inserted into routes already running, which is dispatch's re-optimization problem with capacity added: the van must still have room, and the item must be on it or at a depot it will pass.

## Who Drives

Delivery runs on four labor models, often side by side in one tenant:

- **Employees** in company vehicles: `staff_members` with technician resources, exactly as in service work.
- **Contractors**, individuals or small firms the tenant engages directly: a `contractor` resource, optionally linked to a staff login.
- **Delivery service partners:** independent companies that employ drivers and run routes on a larger network's platform. Amazon's program describes partners who "hire and develop drivers" while Amazon supports them "with infrastructure, technology, and a suite of exclusive services."
- **On-demand networks:** individuals who pick up work in an app. Amazon Flex drivers "use your own vehicle to deliver Amazon packages" in blocks booked up to a week ahead; DoorDash Drive lets businesses use its network of Dashers through an API; Uber Direct dispatches "a dedicated Uber courier" when a merchant calls its create-delivery endpoint.

The last model is different in kind: a delivery handed to DoorDash Drive or Uber Direct isn't routed by the tenant, and status and proof come back by webhook. Model it as a visit assigned to an external carrier rather than a resource: store the carrier, its delivery ID and tracking link, map its statuses onto the visit states, and copy its proof into your own records ([Webhooks](/docs/api-design/webhooks) covers receiving events that may arrive twice or out of order). Onfleet separates the organization shown to the recipient (`merchant`) from the one that fulfils the task (`executor`), which is the same split.

Whether a driver is an employee or a contractor is a legal question with different tests by jurisdiction; the platform shouldn't encode an answer, only keep accurate the facts it turns on: who assigned the work, who set the route, who could decline it.

## Tracking, ETAs and the Customer

Delivery customers watch the map closely, because a missed handoff costs them a trip to the depot. How an ETA is computed and smoothed and how a tracking link stays safe are general ([ETAs](/docs/architecture/location-tracking#etas), [Shareable Tracking Links](/docs/architecture/location-tracking#shareable-tracking-links)); the field platforms' links are in [Dispatch & the Day of Service](/books/field-operations/dispatch#live-tracking-and-eta-links), and the messages and their consent rules in [Customer Communications](/books/field-operations/customer-communications). Delivery adds three triggers worth copying from Onfleet: a predicted ETA for stops later in the route, a delay threshold, and a message when the task fails. For attended deliveries, a few-stops-away message turns a two-hour window into a person at the door.

## Who Pays: Shipper and Consignee

A delivery usually has two customers. The **shipper** (a retailer, a manufacturer, a marketplace) orders the delivery, sets its terms and pays for it. The **consignee** receives it at their own property, and may never have heard of the delivery company. That's the payer and site split from [Customers, Accounts & Properties](/books/field-operations/customers-and-properties): the shipper is an account; the consignee's address is a property; the consignee is a person with a contact role on it. The shipper's terms (signature rules, attempts, hold period, return action) live on its account and are copied onto each order; the consignee's preferences live on the property and the person.

Keep the property the consignee's even though the shipper pays: a tenant that delivers a washer today may repair it next year, and the access notes, the dog and the narrow stairs should carry over. Billing goes to the shipper, often batched per day or manifest, with surcharges for extra attempts, two-person service or haul-away.

## When the Delivery Becomes a Service Visit

An appliance or a bed often arrives with work attached: install it, assemble it, take the old one away. FarEye's consignment API carries these as value-added services, described as "installation, assembly, or old unit haul-away at the customer premises." Once work is attached, the stop stops being a drop: it's attended, it takes an hour, the crew needs the skill (and, for a gas range or a water heater, possibly the license), and haul-away adds a reverse load that takes capacity on the way back.

Model it as one work order with the items to deliver and the services to perform, and one visit, so the route, the window and the proof stay together. The installed unit becomes an asset at the property, and a later repair or warranty claim works from it ([Repair, Install & Commercial Work](/books/field-operations/repair-and-installation)). If the install can't happen (no water shut-off, the wrong outlet), the visit is `completed` for the delivery, the work order stays open, and the install gets a second visit on it.

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business). A delivery is a work order whose service type is a delivery; this chapter adds columns to `work_orders`, `visits` and `vehicles` (defined in [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety#how-to-build-it), a later chapter) and two tables of its own, and uses the three delivery values already in the core visit reason catalog. Existing columns are unchanged.

```sql
ALTER TABLE work_orders
  ADD COLUMN shipper_account_id   UUID REFERENCES accounts (id),  -- who ordered and pays; null when the property's payer does
  ADD COLUMN external_ref         TEXT,                            -- the shipper's order number
  ADD COLUMN attendance           TEXT NOT NULL DEFAULT 'required'
                                    CHECK (attendance IN ('required', 'preferred', 'not_required')),
  ADD COLUMN signature_rule       TEXT NOT NULL DEFAULT 'none'
                                    CHECK (signature_rule IN ('none', 'indirect', 'direct', 'adult')),
  ADD COLUMN min_recipient_age    INTEGER,
  ADD COLUMN max_attempts         INTEGER,
  ADD COLUMN undeliverable_action TEXT CHECK (undeliverable_action IN ('retry', 'hold_at_pickup_point',
                                    'return_to_depot', 'return_to_shipper', 'dispose')),
  ADD CONSTRAINT work_orders_attendance_check_rules
    CHECK (attendance = 'required' OR (signature_rule IN ('none', 'indirect')
                                       AND min_recipient_age IS NULL));

CREATE TABLE work_order_items (                -- packages and goods lines
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  work_order_id       UUID NOT NULL REFERENCES work_orders (id),
  item_id             UUID REFERENCES items (id),             -- the tenant's own goods; null for shippers' parcels
  barcode             TEXT,
  description         TEXT NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  weight_g            INTEGER,
  volume_cm3          INTEGER,
  is_two_person       BOOLEAN NOT NULL DEFAULT FALSE,
  required_capabilities TEXT[] NOT NULL DEFAULT '{}',          -- liftgate, refrigerated
  status              TEXT NOT NULL CHECK (status IN ('expected', 'loaded', 'delivered',
                        'refused', 'damaged', 'returned')),
  delivered_quantity  INTEGER,                                 -- partial acceptance per line
  loaded_at           TIMESTAMPTZ,
  delivered_visit_id  UUID REFERENCES visits (id)
);

CREATE TABLE delivery_instructions (           -- standing (property) or one-off (work order)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID REFERENCES properties (id),
  work_order_id       UUID REFERENCES work_orders (id),
  kind                TEXT NOT NULL CHECK (kind IN ('safe_place', 'access_code', 'leave_with_neighbor',
                        'do_not_leave', 'hold_at_pickup_point', 'call_on_arrival', 'garage_access')),
  detail              TEXT,                                    -- "side door, behind the planter"
  secret_ciphertext   BYTEA,                                   -- access codes only, encrypted
  source              TEXT NOT NULL,                           -- portal | tracking_page | phone | carrier_program | office
  person_id           UUID REFERENCES people (id),             -- who gave it
  valid_during        TSTZRANGE NOT NULL,
  CHECK ((property_id IS NULL) <> (work_order_id IS NULL))
);

ALTER TABLE visits
  ADD COLUMN attempt_number     INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN handoff            TEXT CHECK (handoff IN ('to_recipient', 'to_third_party', 'safe_place',
                                  'mailbox', 'locker', 'garage')),  -- required when a delivery completes
  ADD COLUMN external_carrier   TEXT,             -- set when an on-demand network performs the visit
  ADD COLUMN external_ref       TEXT,
  ADD COLUMN depends_on_visit_id UUID REFERENCES visits (id);  -- the pickup a delivery waits for
-- address_not_found, id_check_failed and item_damaged are already in the core
-- visits.status_reason catalog (The Field Operations Business)

ALTER TABLE vehicles                          -- defined in Fleet, Inventory & Safety
  ADD COLUMN capacity_weight_g  INTEGER,
  ADD COLUMN capacity_volume_cm3 INTEGER,
  ADD COLUMN capacity_pallets   NUMERIC;
```

`items` is the shared catalog from [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules#how-to-build-it): an appliance dealer delivering its own stock points each line at it, while a carrier delivering for shippers keeps only the barcode and description. The `work_orders` constraint makes the proof rule structural: an adult signature or age check can't sit on work that allows an unattended drop. Attempts are visits, so dispatch and metrics read attempts from rows they already have. Evidence (photos, the PIN result, the ID check result without the image) uses the model in [Proof of Service](/books/field-operations/proof-of-service). Shipper terms are resolved onto the work order at creation and snapshotted, so a shipper changing its attempt limit doesn't change orders in flight ([Rules as Data](/docs/architecture/rules-as-data)). The chapter adds outbox events `work_order_item.loaded`, `work_order_item.delivered` and `work_order.returned_to_shipper`, beside the visit events the core already emits.

## Auditing

- **Instructions as they stood.** Which delivery instruction and access grant applied to a visit, from whom and through which channel, captured at completion: "you were told to leave it there" depends on it.
- **Access to secrets.** Every view of a door code or use of a garage grant, by driver, time and place, and every grant's expiry.
- **Item custody.** Each scan from load to drop or return, with the vehicle and the person, so a missing item can be placed on a route and a shelf.
- **Handoffs to external networks.** What was sent to an on-demand carrier, the statuses and proof it returned, and when, since the tenant answers to the shipper for that delivery.

The record shape and tamper evidence are in [Audit Trails](/docs/architecture/audit-trails); retention for field records is in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Run delivery on the core model:** a work order with items, visits as attempts, routes from depots, and the canonical visit states and reasons.
- **Make attendance a resolved attribute of the work order,** and let it decide windows, routing freedom and the proof required.
- **Store standing instructions on the property and one-off choices on the order,** with fixed precedence below the shipper's requirements and access codes treated as secrets.
- **Require a handoff type and in-app photo on every unattended completion,** and force attendance for PINs, signatures and age checks.
- **Decide the undeliverable action when the order is created:** retry, hold at a pickup point, return to the depot or shipper, or dispose, with a maximum number of attempts.
- **Treat capacity as several dimensions,** load in reverse stop order, scan at load and at drop, and freeze sequence once loading starts.
- **Support depots, waves and pickup-and-delivery pairs** as routes per trip and precedence between visits.
- **Model on-demand carriers as external assignees** with their IDs, mapped statuses and copied proof.
- **Bill the shipper while keeping the property the consignee's,** so the next visit to that address inherits what this one learned.
- **Measure cost per stop and cost per delivery** with one definition, and report the gap as the cost of failed attempts ([Operating Metrics](/books/field-operations/operating-metrics)).

## References

**Reference**

- [Capgemini Research Institute: The last-mile delivery challenge (PDF)](https://www.capgemini.com/wp-content/uploads/2019/01/Report-Digital-%E2%80%93-Last-Mile-Delivery-Challenge1.pdf), January 2019: last mile at 41% of overall supply chain costs, mostly variable; lower delivery costs reported with lockers and pickup points
- [FedEx: Delivery Manager](https://www.fedex.com/en-us/delivery-manager.html), delivery instructions, hold at location, remote signing, vacation hold, redirect and scheduled delivery
- [FedEx: Signature services](https://www.fedex.com/en-us/delivery-options/signature-services.html), no, indirect, direct and adult signature, with reattempt or hold for direct signature
- [USPS: Informed Delivery](https://www.usps.com/manage/informed-delivery.htm), mail previews, package tracking and status notifications
- [Amazon: What is Amazon Key In-Garage Delivery](https://www.aboutamazon.com/md/news/amazon-prime/what-is-amazon-key-in-garage-delivery), one-time garage access after verifying the package and driver location
- [Amazon: How to use Amazon Locker](https://www.aboutamazon.com/news/operations/how-to-use-amazon-locker), size limits, pickup code, three-day hold, automatic return and refund
- [Amazon: Delivery Service Partners](https://www.aboutamazon.com/impact/empowerment/delivery-partners), partners who hire drivers, supported with infrastructure and technology
- [Amazon Flex](https://flex.amazon.com/), drivers using their own vehicles in pre-booked blocks

**In practice**

- [Onfleet: Create task](https://docs.onfleet.com/reference/create-task.md), pickup tasks, dependencies, quantity, service time, recipient notes override, merchant and executor
- [Onfleet: Teams](https://docs.onfleet.com/reference/teams), hubs where drivers start and end their shifts
- [Onfleet: Completing a task](https://intercom.help/onfleet-4f83d83093ac/en/articles/15254816), default failure reasons such as recipient unavailable, refused and unable to locate
- [Onfleet: Notification triggers](https://intercom.help/onfleet-4f83d83093ac/en/articles/16090283-notification-set-up-triggers), predicted ETA, delay and task failed messages
- [Onfleet: Completion requirements](https://docs.onfleet.com/reference/completion-requirements), signature, photo, notes, minimum age with ID scan, and PIN for dropoff tasks
- [Spoke: More options for providing proof of delivery](https://spoke.com/dispatch/product-updates/more-options-for-providing-proof-of-delivery), handoff outcomes such as left in safe place and delivered to third party
- [Spoke Dispatch API: Stop model](https://developer.dispatch.spoke.com/docs/models/stop), place in vehicle, package count, weight, attempt state and proof URLs
- [Spoke Dispatch API: Models](https://developer.dispatch.spoke.com/docs/models/description), plans linked to depots that set routes' start and end addresses
- [Spoke: Analytics for late and failed stops and delivery costs](https://spoke.com/dispatch/product-updates/analyze-late-and-failed-stops-and-track-delivery-costs-with-additional-analytics-reports), failed reasons and average cost per delivery
- [Track-POD API (OpenAPI)](https://api.track-pod.com/swagger/v1/swagger.json), weight, volume and pallets, load status, accepted quantity per line, driver sequence, rescheduled times, cross-docking routes, instructions from the tracking page
- [Routific: Fleet](https://docs.routific.com/docs/fleet), multi-dimensional capacity and open-ended routes
- [Bringg: Optimization settings](https://help.bringg.com/docs/optimization-settings-overview), route capacity by length, weight or handling units, and reloading between routes
- [Bringg: Waypoints](https://developers.bringg.com/reference/way-points-object), up to two waypoints per order and scanning inventory before leaving
- [eLogii: Task fail](https://help.elogii.com/en/articles/5645482-task-fail), failure reasons per pickup and delivery, task history and failed-reason analytics
- [Locate2u: Proof of delivery](https://locate2u.com/products/proof-of-delivery/), geotagged photos, vector signatures and failed-delivery notifications with rescheduling instructions
- [FarEye: API self-guide](https://developer.fareyeconnect.com/self-guide.html), forward and reverse consignments and value-added services such as installation and haul-away
- [DoorDash Drive API](https://developer.doordash.com/en-US/api/drive/), dropoff instructions, contactless photo, signature, PIN and the undeliverable action
- [DoorDash Drive: Integration requirements](https://developer.doordash.com/en-US/docs/drive/overview/integration_requirements/), businesses using the Dasher network through an API
- [Uber Direct: Overview](https://developer.uber.com/docs/deliveries/overview), a courier dispatched by the create-delivery endpoint
- [Uber Direct: Robo Courier](https://developer.uber.com/docs/deliveries/guides/robocourier), the undeliverable action, defaulting to return on an automatically created return trip
- [Uber Direct: Proof of delivery](https://developer.uber.com/docs/deliveries/guides/proof-of-delivery), signature, barcode, picture, identification and PIN, with picture on for Leave at Door
