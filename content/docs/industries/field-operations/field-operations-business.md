+++
title = "The Field Operations Business"
description = "How field businesses earn, from routes to repair, installs, contracts and delivery: route density, seasons, branches, the volume map and the core data model."
category = "Field Operations Industry"
order = 1501
part = "How the Work Flows"
tags = ["field-operations", "business-models", "route-density", "data-model", "branches"]
+++

A field operations business sells work done at someone else's property. A person drives a vehicle to a house, a restaurant, a warehouse or a curb, does something there, and leaves with proof it was done. An HVAC technician replacing a capacitor in July, a plumber clearing a drain at 9 PM, a lawn crew on its fourth fertilizer round, a pool tech balancing chlorine every Tuesday, a cleaning team in an office after hours, a pest technician on a quarterly visit and a driver dropping a sofa in a two-hour window look nothing alike to their customers. They share one operating problem: labor and drive time are the cost, the work can only happen where the customer is, and the customer usually wants it inside a window they chose. Every system in this volume exists to sell that work, put the right person at the right property at the right time, prove what happened, and collect for it, while driving as little as possible in between.

The software is hard because scheduling, routing, recurring billing, offline mobile and regulated recordkeeping all interact: a cancelled visit changes a route, an arrival window, a customer text and whether an invoice goes out. This chapter is the map the rest of the volume uses: how the business makes money, why route density decides whether it makes any, seasons and branches, a customer's life, and the data model every later chapter extends. Terms are collected in the [Glossary](/docs/industries/field-operations/glossary).

## How to Read This Volume

The chapters follow the work, in seven parts plus a reference:

- **How the Work Flows.** This chapter, then [The Software Landscape](/docs/industries/field-operations/software-landscape) (the products and what each class is built for), [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties), [Service Agreements & Plans](/docs/industries/field-operations/service-agreements) and [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation) (flat-rate repair, diagnostics, parts, warranty claims, installs and commercial SLAs).
- **Scheduling and Routing.** [Recurring Schedules](/docs/industries/field-operations/recurring-schedules), [Territories & Capacity](/docs/industries/field-operations/territories-and-capacity), [Booking Appointments](/docs/industries/field-operations/booking-appointments), [Route Optimization](/docs/industries/field-operations/route-optimization), [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives) and [Dispatch & the Day of Service](/docs/industries/field-operations/dispatch).
- **In the Field.** [The Technician App](/docs/industries/field-operations/technician-app), [Proof of Service](/docs/industries/field-operations/proof-of-service) and [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety).
- **The Rules.** [Regulated Materials](/docs/industries/field-operations/regulated-materials), [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits), [Consumer Protection](/docs/industries/field-operations/consumer-protection) and [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).
- **Selling.** [Door-to-Door Sales](/docs/industries/field-operations/door-to-door-sales), [Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules), [Signing the Agreement](/docs/industries/field-operations/signing-the-agreement) and [Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions).
- **Customers and Billing.** [Customer Communications](/docs/industries/field-operations/customer-communications), [Customer Self-Service](/docs/industries/field-operations/customer-self-service), [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service) and [Collections & Retention](/docs/industries/field-operations/collections-and-retention).
- **Running the Platform.** [Platform Architecture](/docs/industries/field-operations/platform-architecture), [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations), [Operating Metrics](/docs/industries/field-operations/operating-metrics) and [Switching Platforms](/docs/industries/field-operations/switching-platforms).
- **Reference.** The [Glossary](/docs/industries/field-operations/glossary).

The volume covers what field operations adds. The general engineering lives in the playbook, and chapters here link to it rather than repeat it: [Multi-Tenancy](/docs/architecture/multi-tenancy) (and its tenant hierarchies), [Events & Async Messaging](/docs/architecture/events), [Background Jobs](/docs/architecture/background-jobs), [Time & Date Formats](/docs/fundamentals/time), [Effective Dating & History](/docs/database/temporal-data), [Addresses & Geocoding](/docs/fundamentals/addresses), [Matching, Merging & Many Sources](/docs/architecture/record-linkage), [Rules as Data](/docs/architecture/rules-as-data), [Audit Trails](/docs/architecture/audit-trails), [Offline-First Sync](/docs/architecture/offline-sync), [Notifications & Consent](/docs/architecture/notifications), [Calls, Texts & Email](/docs/compliance/consumer-contact), [Electronic Signatures & Records](/docs/compliance/electronic-signatures), [Subscriptions & Recurring Billing](/docs/payments/subscriptions), [Sales Tax & VAT](/docs/payments/sales-tax), [AI Agents in the Product](/docs/architecture/ai-agents), [Webhooks](/docs/api-design/webhooks), [Support Access & Internal Tools](/docs/security/support-access) and [Data Pipelines & Analytics](/docs/architecture/data-pipelines). Taking card and bank payments is its own volume, [Payments](/docs/industries/payments/card-payments).

## The System You're Building

Read end to end, the volume describes the components of a field operations platform. Each has a chapter:

| Component | What it does | Where |
| --- | --- | --- |
| Org tree and core model | Branches, accounts, properties, work orders, visits | This chapter, [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties) |
| Agreements | What was sold, on which terms | [Service Agreements & Plans](/docs/industries/field-operations/service-agreements) |
| Repair and project work | Flat-rate tickets, parts, warranty claims, installs, SLAs | [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation) |
| Recurrence engine | Agreements into promised occurrences | [Recurring Schedules](/docs/industries/field-operations/recurring-schedules) |
| Capacity and booking | Who works where, what fits, which windows to offer | [Territories & Capacity](/docs/industries/field-operations/territories-and-capacity), [Booking Appointments](/docs/industries/field-operations/booking-appointments) |
| Optimizer and dispatch | Routes, the objective they serve, then the live day | [Route Optimization](/docs/industries/field-operations/route-optimization), [Weighing the Routing Objective](/docs/industries/field-operations/route-objectives), [Dispatch & the Day of Service](/docs/industries/field-operations/dispatch) |
| Technician app | Offline work, evidence, vans | [The Technician App](/docs/industries/field-operations/technician-app), [Proof of Service](/docs/industries/field-operations/proof-of-service), [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety) |
| Compliance records | Controlled materials, credentials, consumer rules, history | [Regulated Materials](/docs/industries/field-operations/regulated-materials), [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits), [Consumer Protection](/docs/industries/field-operations/consumer-protection), [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records) |
| Sales | Canvassing, prices, signatures, commissions | [Door-to-Door Sales](/docs/industries/field-operations/door-to-door-sales), [Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules), [Signing the Agreement](/docs/industries/field-operations/signing-the-agreement), [Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions) |
| Customer surfaces | Messages and the portal | [Customer Communications](/docs/industries/field-operations/customer-communications), [Customer Self-Service](/docs/industries/field-operations/customer-self-service) |
| Money | Invoices, autopay, failed payments, saves | [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service), [Collections & Retention](/docs/industries/field-operations/collections-and-retention) |
| Platform | Tenancy, integrations, AI agents, metrics, migration | [Platform Architecture](/docs/industries/field-operations/platform-architecture), [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations), [Operating Metrics](/docs/industries/field-operations/operating-metrics), [Switching Platforms](/docs/industries/field-operations/switching-platforms) |

## Five Ways to Sell Work at a Property

Most field businesses run one dominant model and dabble in a second. The model decides what the scheduler optimizes and what the records hold.

| Model | Priced as | Schedule shape | Typical trades |
| --- | --- | --- | --- |
| **Recurring route-based** | Per visit, monthly or prepaid | Generated from a plan, routed days or weeks ahead | Pool, lawn, cleaning, pest |
| **On-demand repair** | Flat rate or time and materials | Booked into today's capacity; emergencies jump the queue | HVAC, plumbing, electrical, appliance |
| **Installs and projects** | Quoted, often financed, paid in milestones | Multi-visit, multi-crew, gated by permits and materials | HVAC replacement, roofing, solar |
| **Commercial contracts** | Contract value on a schedule, plus extras | Planned maintenance plus reactive calls with response times | Fire and life safety, janitorial, facilities |
| **Delivery and pickup** | Per stop or bundled in the price | Same-day or next-day batches, re-planned through the day | Retail, grocery, furniture, parts |

Dynamics 365 Field Service names the same split (reactive, preventive, predictive and project-based service), and delivery platforms start from a smaller unit: Onfleet's task is one destination and one recipient, grouped into route plans.

**Recurring route-based** service is the economic engine of property care: a customer signs once and pays for years, so a sale is worth the lifetime of the agreement. Pool is the purest case, where Skimmer's route assignments are each technician's permanent weekly stops; Launch27 creates a cleaning booking for each customer every week or few weeks, discounted by frequency. In pest control, recurring service is 85.2% of U.S. residential revenue (Specialty Consultants, reported by PCT).

**On-demand repair** sells capacity instead of routes: how many arrival windows a business can promise today without breaking them, which ServiceTitan computes from technician shifts and the jobs already booked. The ticket is priced from a **flat-rate pricebook** (tasks with a set price, built from labor, parts and markup) rather than the clock; Successware calls the price book "what everything in the platform connects to." Maintenance memberships layer recurring revenue on top, filling slow seasons with tune-ups.

**Installs and projects** are small construction jobs: options, financing, a contract, a permit, then milestones (Enerflo for solar, JobNimbus for roofing). Money arrives in deposits and progress payments.

**Commercial contracts** add response times, many sites under one bill-to, and reports a customer's own auditors read. Salesforce links work orders to entitlements for SLAs; ServiceTrade's contracts carry separate recurrences for the work and the invoicing; Swept compares scheduled to actual janitorial hours to find underbid sites. [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation) covers these three models.

**Delivery** stops take minutes, so a route holds dozens, and the business lives on same-day re-planning, proof of delivery and live ETAs: patterns field service keeps borrowing.

## How Big It Is

The Bureau of Labor Statistics counts the workers, which is the best common proxy for how many vans are on the road. Its Occupational Outlook Handbook pages report 2025 employment and May 2025 median pay:

| Occupation | Jobs (2025) | Median pay (May 2025) | Note from BLS |
| --- | --- | --- | --- |
| Janitors and building cleaners | About 2,432,600 | $36,840 | Many work evenings, after offices empty |
| Delivery truck drivers and driver/sales workers | About 1,511,400 | $43,950 | Early starts, late finishes, weekend and holiday work common |
| Grounds maintenance workers | About 1,299,200 | $40,080 | Busiest in spring, summer and fall; some jobs seasonal |
| Plumbers, pipefitters and steamfitters | About 510,600 | $63,800 | Often on call for emergencies; most states license plumbers |
| HVAC mechanics and installers | About 440,900 | $61,010 | Overtime and irregular hours in peak heating and cooling seasons |
| Pest control workers | About 108,700 | $45,250 | 88% work for pest control services firms; most states require a license |

Revenue figures are uneven by trade. Pest control's survey counts more than 17,000 firms, about two-thirds of them single-location, and that shape holds across trades: most buyers have one office and no IT staff, while the large operators are consolidators running many branches and brands.

## Route Density and Unit Economics

A technician's day is fixed: shift hours minus breaks. That time splits into three buckets, and only one of them earns money:

- **Service time**, at the property doing the work.
- **Drive time**, between properties and to and from the start location.
- **Dead time**, waiting for a window to open, restocking at the supply house, paperwork, a gate nobody opened.

**Route density** is how little drive time sits between consecutive stops, and it's the lever operators talk about most: a FieldRoutes post cites a PCT survey in which 55% of participants ranked it first among ten productivity factors.

The arithmetic makes the reason obvious. An illustrative pool route, not an industry benchmark:

```text
shift              8.0 h   (480 min)
service per stop   25 min
drive per stop     sparse route: 20 min   dense route: 8 min

stops per day      sparse: 480 / 45 = 10.7   dense: 480 / 33 = 14.5
revenue per stop   $60
revenue per day    sparse: $640              dense: $870
labor + vehicle    same either way
```

Labor and the vehicle cost the same whether the technician drives or works, so every minute moved from driving to servicing drops almost straight to margin. That one fact drives a surprising amount of the business:

- **Sales targets streets, not people.** Lawn, pest and pool companies canvass where routes already run, because a new customer on an existing street adds a stop with almost no drive time ([Door-to-Door Sales](/docs/industries/field-operations/door-to-door-sales)).
- **Pricing varies by geography,** by zone or by declining addresses outside the service area.
- **Scheduling trades flexibility for density.** A cleaning customer who insists on Tuesday at 9 AM can break a tight route, so preferred days are exceptions rather than defaults ([Recurring Schedules](/docs/industries/field-operations/recurring-schedules)).
- **Capacity isn't only hours.** FieldRoutes tracks product capacity per route (gallons of spray against a tank). A truck full of time can still be empty of chemical, or of the part the next HVAC call needs.

Repair businesses measure revenue per technician per day and kept arrival windows instead, and delivery measures cost per stop ([Operating Metrics](/docs/industries/field-operations/operating-metrics)). Density belongs to the whole book of business: a dispatcher can't make a sparse territory dense by optimizing harder ([Territories & Capacity](/docs/industries/field-operations/territories-and-capacity)).

## Seasons

Almost every field business has a season, and the season shapes the software more than any feature request:

- **HVAC** peaks in the first heat wave and the first cold snap. BLS notes overtime and irregular schedules in peak seasons, and maintenance memberships exist partly to schedule tune-ups into the shoulder months. Plumbing is steadier, but freezes bring burst-pipe surges.
- **Lawn and landscape** compress a year's work into spring, summer and fall, with some crews switching to snow removal. Programs run as numbered rounds, and the off-season is spent selling prepayment and renewals.
- **Pool** opens in spring and closes in fall in most of the country, and runs year-round in the Sun Belt, so one company can have two different calendars by branch.
- **Pest control** follows insect activity: FieldRoutes subscriptions carry a seasonal start and end date, and GorillaDesk's recurring jobs can skip selected months.

For the platform, seasons mean uneven load and forecasts to staff it (Oracle Field Service forecasts workload from history); billing that doesn't match service, since a monthly payment smoothing a six-month lawn program creates prepaid balances ([Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service)); and seasonal staff set up in hours.

## Branches, Regions and the Org Chart

A one-truck business has one of everything. A business with a few hundred trucks organizes like this:

![A hierarchy of five levels, each indented under the last: company or brand, region, branch, territory or route, and technician with a van. Beside each level is what lives there, from brands and price lists at the top, through the branch's licenses, stock, office and profit and loss, down to a technician's skills, license and van stock, and who works at that level, from the owner to the technician.](/diagrams/fo-field-operations-business-hierarchy.svg "The branch is where licenses, inventory, the office staff and the profit and loss meet, so most operational configuration lives there and rolls up.")

- **The branch** (office, location, service center) is the operating unit. It holds a state's business license and often the licensed supervisor the state requires (a master plumber, a certified pesticide applicator), a stock room, an office phone number, territories and its own profit and loss. ServiceTitan ties technicians, job types and zones to business units.
- **Territories** carve a branch into areas a technician or crew owns on given days: Salesforce's service territories, or the teams and hubs of delivery platforms like Onfleet.
- **Regions and brands** sit above. Consolidators keep acquired brands alive for local recognition, so one platform supports several brands with their own names, phone numbers, price lists and templates while one finance team reports across all of them.

Configuration resolves down this tree and reporting rolls up it, the pattern [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies) describes in general: a price list set at the brand and overridden for one branch's market has to resolve to one answer in the technician's app, and a regional P&L has to sum exactly to its branches.

## The Life of a Customer

![A customer's path from left to right: lead, sold, initial visit, recurring and renewal, with a renewed loop from renewal back to recurring. A dashed exit from sold goes to cancelled during the cooling-off period, and dashed exits from recurring and a lapsed renewal go to terminated, from which a win-back campaign returns to lead.](/diagrams/fo-field-operations-business-lifecycle.svg "Each stage records something the next one depends on, and each exit is a moment the law, the commission plan or the retention team cares about.")

The diagram draws the recurring path; a repair customer runs the same stages faster (lead, sold on a flat-rate ticket, one visit, then a membership offer or nothing).

**Lead.** Leads arrive from the door, the phone, the web and marketplaces: Google's Local Services Ads charge per valid lead, and Jobber creates a client and a request for each Thumbtack direct lead. Jobber's definition is a good one: a client stays a lead until they approve a quote, have a scheduled job, or are sent an invoice. Record the source on day one; marketing spend, lead credits and the win-back campaign all depend on it.

**Sold.** The sale produces the agreement or approved estimate: service, frequency, price, term, renewal terms, payment method and the rep who sold it. A sale at the buyer's home can carry a federal right to cancel until midnight of the third business day, and state law adds more ([Consumer Protection](/docs/industries/field-operations/consumer-protection), [Signing the Agreement](/docs/industries/field-operations/signing-the-agreement)).

**Initial visit.** The first service is longer, priced differently and sets the baseline: a pool's startup chemistry, a deep clean before recurring maid service, a pest inspection, the HVAC equipment recorded with model and serial numbers. It's also where many cancellations happen, because a sloppy first visit tells the customer what the next three years will be like.

**Recurring.** Visits generate, get routed, happen, and bill. Most of a customer's lifetime and most of the platform's load is here: reminders, on-my-way texts, service reports, autopay, failed cards, reschedules.

**Renewal.** The agreement renews automatically, renews at a new price, or becomes a sales event (Aspire, built for landscape contracts, treats renewal as a re-quote). Automatic renewal is regulated in many states, so the agreed terms and every renewal notice need to be on file ([Subscriptions & Recurring Billing](/docs/payments/subscriptions)).

**Terminated and won back.** Customers leave for price, service quality, a move or nonpayment. Ending an active agreement is a termination with a churn type (voluntary, involuntary or administrative) and a reason; cancelled is kept for an agreement that ends before it ever became active, as in the cooling-off window ([Service Agreements & Plans](/docs/industries/field-operations/service-agreements) has the states; [Operating Metrics](/docs/industries/field-operations/operating-metrics) defines churn). A former customer who comes back isn't a new lead: they have history, possibly a balance, and a property the business already knows ([Collections & Retention](/docs/industries/field-operations/collections-and-retention)).

## Who Uses Which Tool

| Role | What they do | What they need from the platform |
| --- | --- | --- |
| **Customer service rep** | Answers calls and texts, books, takes payments (increasingly beside an AI agent) | Account and property on one screen, live availability |
| **Dispatcher** | Builds tomorrow's routes, fixes today's | Unassigned work, constraints, a map, optimization with locks |
| **Technician or driver** | Does the work, records it, collects payment | Today's route offline, property history, forms, parts and product logging |
| **Sales rep or comfort advisor** | Closes at the door or at an in-home estimate | Territories, good-better-best options, financing, e-signature |
| **Branch manager** | Runs a branch's P&L, staff and quality | Production, retention, AR, callbacks, compliance by technician |
| **Billing and compliance** | Autopay, collections, regulated records, licenses | Ledger by account, records in each regulator's format, expiry dates |
| **Owner or finance** | Prices, buys, sells, reports to lenders | Revenue by brand and branch, churn, deferred revenue |

Every role needs the same account, property and agreement, cut for its job and scoped by the hierarchy above.

## The Core Data Model

Every platform in this market converges on the same handful of concepts under different names ([Platform Architecture](/docs/industries/field-operations/platform-architecture) maps the vendors' names). This volume uses one set, and every later chapter extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **account** | `accounts` | The party that pays (prose may say customer) |
| **person** | `people` | A customer-side human (a contact), linked to accounts and properties with a contact role |
| **staff member** | `staff_members` | An employee or contractor who logs in or does the work |
| **property** | `properties` | The place served: a house, a pool, an office floor, a dock door |
| **asset** | `assets` | Serviced equipment: a furnace, a backflow preventer, a pool pump |
| **plan**, **plan version** | `plans`, `plan_versions` | The product sold, versioned so an agreement keeps its terms |
| **agreement** | `agreements` | The contract for a plan version at a property (vendors say membership, maintenance plan) |
| **recurrence** | `recurrences` | The agreement's schedule rule: an iCalendar RRULE plus a window |
| **occurrence** | `occurrences` | One promised instance generated from a recurrence |
| **service type** | `service_types` | The catalog of what work orders perform: a quarterly pest service, a drain clearing, a furnace install |
| **work order** | `work_orders` | The work to be done, from an occurrence, a request, a sale or a callback |
| **estimate** | `estimates` | A priced quote, with options, linked to the work order it would fill |
| **visit** | `visits` | A scheduled time and assignment that performs a work order |
| **resource** | `resources` | What the scheduler books, of kind `technician`, `crew`, `contractor` or `equipment`; a technician resource references a staff member |
| **route** | `routes` | One resource's ordered visits for a day |

![Data model: a person holds a contact role on an account, an account has properties, a property has assets; a plan has versions, and an agreement binds a plan version to a property with a recurrence; the recurrence generates occurrences, an occurrence becomes a work order, a work order has one or more visits, and visits are ordered into a resource's route for a day. The visit states run held, scheduled, dispatched, en route, on site, completed, with exits not completed and cancelled.](/diagrams/fo-field-operations-business-model.svg "The canonical model used across this volume. The work order says what to do, bill and prove; the visit says when, in what window, by whom.")

The split that matters most is **work order versus visit**. The work order is the unit of what was promised, priced and proven; the visit is the unit of time and assignment. Salesforce states it plainly ("work orders describe the work to be performed, service appointments represent the visits your team makes"), and Dynamics 365 gives work orders and bookings independent life cycles. Keep them separate even if most of your jobs take one visit, because the second visit (a part that wasn't on the truck, a retreatment, a callback, the second day of an install) is where single-table designs break.

Three more distinctions recur in every chapter. **People are customers; staff are staff.** `people` holds contacts on the customer side, and `staff_members` holds the employees and contractors who log in or do work, so a worker is always a `staff_member_id`, never a `person_id`. **Resources are what gets scheduled:** a technician resource points at its staff member, a crew is made of resources ([Territories & Capacity](/docs/industries/field-operations/territories-and-capacity)), and vehicles are a separate `vehicles` table ([Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety)). **Estimates are their own record.** My default is an `estimates` row linked to the work order it would fill, holding the options and snapshotted lines ([Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules)); approving an option copies its lines onto the work order as priced lines. The alternative, estimated lines on the work order itself, is simpler until a customer sees three options and declines two.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions). Every table carries `tenant_id`. Columns each chapter owns (prices, recurrence rules, addresses, signatures) are added there:

```sql
CREATE TABLE org_units (                 -- brand, region, branch
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  parent_id  UUID REFERENCES org_units (id),
  kind       TEXT NOT NULL CHECK (kind IN ('brand', 'region', 'branch')),
  name       TEXT NOT NULL,
  time_zone  TEXT NOT NULL,              -- IANA name; sets the branch's business date
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_members (             -- employees and contractors
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  branch_id  UUID NOT NULL REFERENCES org_units (id),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (                 -- what the scheduler books
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  branch_id       UUID NOT NULL REFERENCES org_units (id),
  kind            TEXT NOT NULL CHECK (kind IN ('technician', 'crew', 'contractor',
                    'equipment')),
  staff_member_id UUID REFERENCES staff_members (id),  -- technician: required; contractor: optional
  name            TEXT NOT NULL,
  CHECK (kind <> 'technician' OR staff_member_id IS NOT NULL),
  CHECK (kind NOT IN ('crew', 'equipment') OR staff_member_id IS NULL)
);

CREATE TABLE service_types (             -- what a work order performs
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  name       TEXT NOT NULL
);

CREATE TABLE properties (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  branch_id  UUID NOT NULL REFERENCES org_units (id),
  location   GEOGRAPHY(POINT),
  time_zone  TEXT NOT NULL,              -- IANA name, from the place
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agreements (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  account_id      UUID NOT NULL REFERENCES accounts (id),
  property_id     UUID NOT NULL REFERENCES properties (id),
  plan_version_id UUID NOT NULL REFERENCES plan_versions (id),
  status          TEXT NOT NULL CHECK (status IN ('draft', 'out_for_signature',
                    'signed', 'active', 'paused', 'on_hold', 'terminated',
                    'void', 'cancelled')),
  status_reason   TEXT,                  -- required for cancelled, terminated, on_hold
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE work_orders (
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                 UUID NOT NULL,
  property_id               UUID NOT NULL REFERENCES properties (id),
  agreement_id              UUID REFERENCES agreements (id),  -- null for one-off work
  service_type_id           UUID NOT NULL REFERENCES service_types (id),
  source                    TEXT NOT NULL CHECK (source IN ('occurrence', 'request',
                              'sale', 'callback')),
  callback_of_work_order_id UUID REFERENCES work_orders (id),  -- set for a callback
  status                    TEXT NOT NULL CHECK (status IN ('open', 'completed',
                              'cancelled')),
  hold_reason               TEXT CHECK (hold_reason IN ('part_needed', 'approval_needed',
                              'permit_needed')),               -- open but waiting
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((source = 'callback') = (callback_of_work_order_id IS NOT NULL))
);

CREATE TABLE visits (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  work_order_id          UUID NOT NULL REFERENCES work_orders (id),
  resource_id            UUID REFERENCES resources (id),  -- null until assigned
  route_id               UUID REFERENCES routes (id),
  window_starts_at_local TIMESTAMP,      -- the promise, in the property's zone
  window_ends_at_local   TIMESTAMP,
  time_zone              TEXT NOT NULL,  -- the property's IANA zone
  status                 TEXT NOT NULL CHECK (status IN ('held', 'scheduled', 'dispatched',
                           'en_route', 'on_site', 'completed', 'not_completed', 'cancelled')),
  status_reason          TEXT CHECK (status_reason IN ('no_access', 'not_home',
                           'customer_declined', 'part_needed', 'weather',
                           'unsafe_condition', 'tech_out', 'customer_asked',
                           'expired')),  -- required for not_completed and cancelled
  hold_expires_at        TIMESTAMPTZ,    -- only while held
  is_locked              BOOLEAN NOT NULL DEFAULT FALSE,  -- pinned; optimizers leave it
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Visit end states share one reason catalog,** `visits.status_reason`, and which state applies depends on what happened on site:

- **Work was performed** (a repair, a diagnosis, part of an install): the visit is `completed`. If the work order isn't finished, it stays `open` with a `hold_reason` (`part_needed`, `approval_needed`, `permit_needed`) until it can be booked again.
- **Nothing could be done on site:** the visit is `not_completed` with `no_access`, `not_home`, `customer_declined`, `part_needed`, `weather` or `unsafe_condition`.
- **Called off before the technician left:** the visit is `cancelled` with `weather`, `tech_out` or `customer_asked`. A booking hold that lapses is `cancelled` with `expired`.

There is no separate outcome column; later chapters use these values. A **callback** is a new work order with `source = 'callback'` and `callback_of_work_order_id` pointing at the work it redoes, and first-time fix is computed per work order from that link ([Operating Metrics](/docs/industries/field-operations/operating-metrics)). A part that wasn't on the truck is a hold, not a callback. Occurrences have their own states (upcoming, open, booked, completed, skipped, missed), defined in [Recurring Schedules](/docs/industries/field-operations/recurring-schedules).

Design decisions behind it:

- **Separate the payer from the place.** ServiceTitan's customer is the bill-to and its location the service site; Jobber's clients have zero, one or many properties. Collapse them and the first landlord with twelve rentals, or the restaurant group with forty kitchens, breaks the model. Who pays for a property changes over time, so that link is an effective-dated row in [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties).
- **One-off work needs no agreement.** A no-heat call, a water heater install and a furniture delivery are work orders with a null `agreement_id`. [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation) adds the assets, parts and warranty claims around repair and installs; delivery needs no extra model and is covered by [Proof of Service](/docs/industries/field-operations/proof-of-service), [Route Optimization](/docs/industries/field-operations/route-optimization) and [Dispatch & the Day of Service](/docs/industries/field-operations/dispatch). The work order is the unit dispatch, proof, billing and commissions all read.
- **Visit windows are local promises.** "Tuesday 8 to noon" means 8 at the property, so the window is local time plus the property's IANA zone ([Time & Date Formats](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)), and chapters that need instants (booking's overlap check, the metrics warehouse) derive them from these columns rather than storing a second promise; things that already happened (`arrived_at`, `completed_at`) are UTC instants.
- **Effective-date what changes and gets disputed:** territory membership, a plan's price, a property's payer, a technician's license, each with a `valid_during` range ([Effective Dating & History](/docs/database/temporal-data)).
- **Scope every row** by `tenant_id`, and by `branch_id` wherever a rule can differ by branch, enforced in the database ([Multi-Tenancy](/docs/architecture/multi-tenancy)).
- **Emit life-cycle events.** `agreement.signed`, `agreement.activated`, `visit.completed`, `agreement.cancelled` and `agreement.terminated` (with a reason) are what commissions, billing and reporting subscribe to ([Events & Async Messaging](/docs/architecture/events)). Each module polling the others' tables instead risks paying commissions on sales cancelled in the cooling-off window.

What goes wrong most often is building for one model and bolting on the next: a route system can't quote an install, and a repair system can't generate a year of visits. My rule: decide the shape of all five models early, even if you build one.

## Auditing

The business decisions in this chapter are the ones disputed later:

- **The sale.** Who sold it, where, when, which plan version and price list, what the customer signed, and when the cancellation notice was delivered: the evidence in a cooling-off dispute, a chargeback and a commission claim.
- **Changes to commercial terms.** Price, frequency, term, renewal setting and payment method, with before and after values. ServiceTitan's customer and location audit trail and FieldRoutes' Change Log Report both record user, field, timestamp and old and new values.
- **Organizational moves.** A property moved between territories, an account moved to another branch, a technician reassigned. These change commissions, routes and which license covered the work, so record the path an entry had when it was written.

The mechanics (typed actors, append-only history, snapshots) are in [Audit Trails](/docs/architecture/audit-trails); the field records regulators and courts ask for, and how long to keep them, are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Support all five business models in the core,** with recurring work on agreements and one-off work as work orders without one, so a tenant can run routes, repair, memberships, installs and contracts side by side.
- **Separate the work order from the visit,** one to many, with the visit states named once and used everywhere.
- **Model the org tree explicitly,** brand to region to branch, with configuration resolved down it and reporting summed up it.
- **Separate the account that pays from the property that's served,** with many properties per account and the payer link effective-dated.
- **Store visit windows as local time plus the property's zone,** and everything that already happened as UTC instants.
- **Treat route density as a first-class number:** stops per route, drive time per stop and service time per stop, by territory and over time.
- **Plan for seasons:** uneven load, prepaid and deferred balances, seasonal start and end dates on agreements, and fast onboarding for seasonal staff.
- **Record the source of every lead and the seller of every agreement,** because marketing, commissions and retention all depend on them.
- **Emit life-cycle events** and let billing, commissions and reporting consume them instead of polling.

## References

**Specifications**

- [Cornell LII: 16 CFR 429.1, The Cooling-Off Rule](https://www.law.cornell.edu/cfr/text/16/429.1), the buyer's right to cancel until midnight of the third business day

**Reference**

- [BLS: Janitors and Building Cleaners](https://www.bls.gov/ooh/building-and-grounds-cleaning/janitors-and-building-cleaners.htm), employment, pay and evening work
- [BLS: Delivery Truck Drivers and Driver/Sales Workers](https://www.bls.gov/ooh/transportation-and-material-moving/delivery-truck-drivers-and-driver-sales-workers.htm), employment, pay and schedules
- [BLS: Grounds Maintenance Workers](https://www.bls.gov/ooh/building-and-grounds-cleaning/grounds-maintenance-workers.htm), employment, pay and seasonal work
- [BLS: Plumbers, Pipefitters, and Steamfitters](https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm), employment, pay, on-call emergencies and licensing
- [BLS: Heating, Air Conditioning, and Refrigeration Mechanics and Installers](https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm), employment, pay and peak-season overtime
- [BLS: Pest Control Workers](https://www.bls.gov/ooh/building-and-grounds-cleaning/pest-control-workers.htm), employment, pay and state licensing
- [PCT: Pest control industry grew 8 percent in 2024](https://pctonline.com/news/pest-control-industry-8-percent-growth-2024), Specialty Consultants survey: $12.654 billion revenue, 17,000 firms, 85.2% recurring
- [Microsoft Learn: Dynamics 365 Field Service overview](https://learn.microsoft.com/en-us/dynamics365/field-service/overview), reactive, preventive, predictive and project-based service models
- [Microsoft Learn: Work order and booking statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), independent life cycles for work orders and bookings
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), work orders versus service appointments, service territories, entitlements and capacity
- [Oracle: Overview of forecasting](https://docs.oracle.com/en/cloud/saas/field-service/fasfc/c-overview-of-forcasting.html), workload forecasting from historical data

**In practice**

- [Skimmer: Manage route assignments](https://thepooldeck.getskimmer.com/manage-a-route-73/manage-route-assignments-web-skimmer-help-center-276), permanent weekly pool stops with a service day and stop date
- [Launch27: Frequencies overview](https://intercom.help/Launch27/en/articles/4259417-frequencies-overview), recurring cleaning bookings with a discount per frequency
- [Swept: Cleaning company time tracking](https://sweptworks.com/cleaning-company-time-tracking-app), scheduled versus actual hours to find underbid sites
- [Successware: Price book](https://www.successware.com/blog/2021/november/did-you-know-price-book/), the flat-rate price book as the center of the platform
- [ServiceTrade connector schema (Fivetran)](https://fivetran.com/docs/connectors/applications/servicetrade/connector-schema), contracts with separate service and invoice recurrences, deficiencies
- [FieldRoutes: Adding a service type subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), frequency, seasonal dates, billing frequency and sold-by fields
- [FieldRoutes: Capacity tracking](https://knowledgebase.fieldroutes.com/docs/capacity-tracking.md), product capacity per route
- [FieldRoutes: Change Log Report](https://knowledgebase.fieldroutes.com/docs/change-log-report.md), who changed what, field by field
- [FieldRoutes: Route density blog](https://www.fieldroutes.com/blog/route-density), a PCT survey ranking route density first (vendor blog)
- [ServiceTitan: Customer and location records](https://help.servicetitan.com/docs/customer-and-location-records-overview.md), the bill-to customer and the service location
- [ServiceTitan: Capacity planning](https://help.servicetitan.com/docs/capacity-planning.md), capacity from shifts, business units, job types and zones
- [ServiceTitan: Audit trail on customer and location records](https://help.servicetitan.com/docs/use-the-audit-trail-on-customer-and-location-records), user, field, timestamp and old and new values
- [Jobber: Client basics](https://help.getjobber.com/en/articles/client-basics/), clients, properties and when a lead becomes a client
- [Jobber: Thumbtack integration](https://help.getjobber.com/en/articles/jobber-and-thumbtack-integration/), marketplace leads becoming clients and requests
- [Google: Local Services Ads charges](https://support.google.com/adwords/answer/7195435), pay per valid lead
- [Onfleet: Tasks](https://docs.onfleet.com/reference/tasks), a task as one destination and one recipient in a route plan
- [Onfleet: Teams](https://docs.onfleet.com/reference/teams), teams and hubs as the delivery hierarchy
- [Enerflo](https://enerflo.com/), install tracking with configurable milestones for solar projects
- [JobNimbus: Statuses](https://support.jobnimbus.com/what-are-statuses), project statuses grouped into stages
- [GorillaDesk: Recurring jobs](https://intercom.help/gorilladesk/en/articles/1089485-recurring-jobs), month exceptions for seasonal customers
- [Aspire: Best practices for multi-year contracts](https://guide.youraspire.com/docs/best-practices-for-multi-year-contracts), renewal as a re-quote
