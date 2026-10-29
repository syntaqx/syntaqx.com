+++
title = "Restaurants & Food Service"
description = "In-house restaurant systems: table and counter service, checks and seats, kitchen display and coursing, tips, service charges and tip pools under the law."
category = "Commerce Industry"
order = 2341
part = "Point of Sale and Stores"
tags = ["commerce", "restaurants", "kitchen-display", "tips", "service-charges", "point-of-sale"]
+++

A restaurant sells something it hasn't made yet. The order is a set of instructions for a kitchen: which dishes, with which changes, for which seat, in which course, and when to start each one so the table's food arrives together and hot. The point of sale is where those instructions are written, the kitchen display is where they're read, and the check is what the guest pays at the end, sometimes split three ways, with a tip that the law says belongs to the staff and a service charge that the law says doesn't. A retail sale is over in a minute; a dinner table's order is open for two hours and changes the whole time.

This chapter covers in-house service: table and counter service, tables, seats and checks, menus and modifiers as the kitchen sees them, the kitchen display system and how tickets are routed and fired, coursing, tips and service charges under federal and state law, tip pools, and first-party online ordering into the same kitchen. It extends `orders`, `order_lines`, `items` and the modifier tables from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The menu model itself (menus, categories, items, modifier groups, pre-modifiers) and how a restaurant's menu syncs to delivery apps are [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items); the delivery order's lifecycle and prep-time estimates are [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas); couriers' tips are [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#tips). How a card is authorized for the bill and captured with the tip is the Payments volume's [Restaurants and Hospitality](/books/payments/payments-by-vertical#restaurants-and-hospitality). The register, tenders and offline mode are [Point of Sale](/books/commerce/point-of-sale), and staff, drawers and end of day are [Store Operations](/books/commerce/store-operations).

## How the Platforms Do It

As of October 2026, from each company's latest filing and its documentation:

| Platform | Position | What its documentation shows |
| --- | --- | --- |
| **Toast** | Restaurant-only POS; about 164,000 locations at the end of 2025, which Toast estimates is about 20% of the US restaurant market | Dining options tied to behavior, multiple checks per order, prep stations and expediter routing, coursing on the KDS, fire by prep time, offline mode after 40 seconds |
| **Lightspeed** | Hospitality concentrated in Europe; sold its US Upserve hospitality product in April 2026 | Restaurant POS as one of its two core lines |
| **NCR Voyix (Aloha)** | Enterprise restaurants; $818 million Restaurants segment revenue in 2025 | Aloha Next "cloud-based or hybrid-cloud POS"; a 2023 ransomware incident hit "specific Aloha cloud-based services" |
| **Clover (Fiserv)** | Small restaurants through bank and processor channels | Fiserv bought CardFree (hospitality, restaurant and lodging) in 2025 to extend Clover |

Three patterns:

- **The kitchen is the product.** Toast's filing names the kitchen display system and kitchen printers as what lets operators "integrate in-store and online orders." A restaurant POS is judged by whether the right ticket reaches the right station at the right time, not by its checkout.
- **Every order has a dining option.** Toast ties each order to a dining option that sets its behavior ("in-person, takeout, curbside pickup, delivery"), which is the same split as the core model's `fulfillment_type`. A dine-in order has a table and seats; a takeout order has a pickup time; a delivery order has a courier.
- **Hardware goes to the table.** Toast sells handhelds with optional cellular backup so servers take orders and payments at the table; paying at the table removes the tip-adjustment step entirely ([Restaurants and Hospitality](/books/payments/payments-by-vertical#restaurants-and-hospitality)).

## Service Models

| Model | How it works | What the system needs |
| --- | --- | --- |
| **Full service (table service)** | A host seats the guest, a server takes the order at the table, the kitchen sends courses, the guest pays at the end | Tables and seats, coursing, open checks for hours, splitting, tip on the card |
| **Counter service (quick service, fast casual)** | The guest orders and pays at the counter or a kiosk, then waits for a name or number | Pay first, a ticket number, a pickup screen, speed |
| **Bar** | Drinks ordered over time on an open tab, often with a card held | Tabs with a pre-authorization, quick reorder, age checks |
| **Takeout and curbside** | Ordered by phone, online or at the counter for later | A promised time, pickup check-in ([Pickup](/books/commerce/omnichannel-fulfillment#pickup)) |
| **Delivery** | Through a marketplace, a logistics network or the restaurant's own drivers | The delivery part of this volume |

A restaurant usually runs several at once: a dining room, a bar, takeout at the counter and two delivery apps all feeding one kitchen. That's why the kitchen sees tickets, not orders: whatever channel the order came from, it becomes tickets at stations.

## Tables, Seats and Checks

Full service adds three structures to the order:

- **Tables.** A floor plan of tables with capacities, grouped into sections assigned to servers. A table is open when guests are seated and closed when the last check is paid; table turn time (seated to paid) is a core restaurant metric.
- **Seats.** Each line carries a seat number, so the kitchen and the runner know who gets what, and so the bill can be split by seat later. Shared items (a bottle of wine, a starter for the table) have no seat or are split across seats.
- **Checks.** Toast states the model directly: "An order usually has only one check, but it can have multiple checks." A check is what one guest or group pays: the whole table, each seat, or a custom split. Splitting by item, by seat or evenly divides lines (or fractions of lines) across checks, and each check gets its own tax, tip and payment.

So a dine-in order is one order with many lines, one or more checks, and tenders against each check. Moving a line between checks, transferring a table to another server, merging two tables and splitting a check after a course has been fired are all edits to an open order, each attributed to the staff member who made it.

Bar tabs are the same structure with a twist: the guest opens a tab with a card that is pre-authorized for an estimate, orders over hours, and the tab closes with a final amount and tip. The card rules for estimated and incremental authorizations are the Payments volume's ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)).

## Menus and Modifiers In-House

The menu model is the same one delivery uses: menus with hours, categories, items, modifier groups with selection limits, nested modifiers and pre-modifiers like "no onions" or "on the side" ([Menus, Modifiers and Items](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items)). The POS is the source of truth for it ([The Source of Truth](/books/commerce/merchants-menus-and-catalogs#the-source-of-truth)). In-house service adds what only the kitchen and the floor need:

- **Course and station on the item.** An item knows which course it belongs to by default (a soup is a starter) and which prep stations make it (the grill makes the burger, the fry station makes the fries).
- **Prep time.** How long the item takes, used to fire items so they finish together ([Coursing and Firing](#coursing-and-firing)).
- **Kitchen name.** A short name for the ticket ("CHZBGR MR") separate from the menu name the guest sees.
- **86ing.** When the kitchen runs out, the item is marked unavailable at that location, and the POS, the online menu and the delivery apps all stop selling it ([Availability](/books/commerce/merchants-menus-and-catalogs#availability)).
- **Comps and voids.** A comped dish was made and given away (a manager decision, recorded with a reason); a voided line was never made. Both are staff actions with approvals ([Staff, Roles and Permissions](/books/commerce/store-operations#staff-roles-and-permissions)).
- **Allergens and special requests.** A free-text note and allergen flags on the line that print prominently on the ticket. An allergen flag is safety information and belongs in a typed field, not a note.

## The Kitchen: Tickets, Stations and the KDS

When a server sends an order, the POS turns its lines into **tickets** routed to **prep stations**. Toast's configuration shows the general model:

- **Routing.** Each item is sent to prep stations; a station can be set to receive tickets for the prep station and the expediter, the expediter only, or the prep station only, and "The Send to setting applies to both KDS and printed tickets."
- **Screens and printers.** "Prep stations assigned to KDS devices do not require a printer," but Toast recommends assigning a backup printer to every prep station, and an "Always Print Tickets" setting "only prints tickets when the Toast platform is in offline mode." The printer is the fallback when the screen can't be trusted.
- **The expediter.** The expo station "serves as the intermediary place between the front of house and back of house": it sees every item for an order, and the expo ticket turns green when every prep station has fulfilled its items, so the expediter knows the plate can go out.
- **Assembly lines and load balancing.** A KDS can pass a ticket through stations in a fixed order (assembly line) or spread tickets across identical stations (load balancing).
- **Ticket aging.** Ticket headings change color as they age, so a cook sees what's late.

A **kitchen display system (KDS)** is the screen version of the ticket rail: tickets appear, cooks **bump** items or whole tickets when they're done, and the times are recorded. Those timestamps are the kitchen's performance data (ticket time from fire to bump, per station and per item) and the input to the prep-time estimates that delivery dispatch relies on ([Prep Time and ETAs](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas)).

The KDS has the same offline problem as the register, sharper. Toast's newer KDS view requires local sync with the hub, which must stay connected to the router: if the kitchen loses the connection to the POS, orders stop arriving, and that is why the backup printer exists. A KDS design needs a local path from register to kitchen that doesn't go through the internet.

## Coursing and Firing

A table's order is placed once and cooked in stages:

- **Courses.** Items are grouped into courses (drinks, starters, mains, dessert). In Toast, courses are applied to menu items, and orders are "automatically split into separate course tickets on KDS devices"; the expediter can fulfill a ready course without waiting for the rest.
- **Hold and fire.** A server sends the whole order but holds later courses; the kitchen sees them as held and fires each when the server (or the expediter) releases it, usually when the previous course is cleared.
- **Fire by prep time.** Within a course, items should finish together. Toast's fire-by-prep-time sends the whole order at once and staggers firing by each item's prep time: a burger that takes 240 seconds fires immediately and mozzarella sticks that take 60 seconds fire about 180 seconds later, so both are ready at the same moment. It works on the KDS, not on printers.

In the model, each order line has a course and each ticket has a fire time; a held ticket is a ticket with `fired_at` null. Firing is a state change with a timestamp and a person, because "the mains were fired 25 minutes after the starters" is how a kitchen manager reads a bad review.

## Tips, Service Charges and the Law

A tip and a service charge look alike on a receipt and are treated completely differently by the law. Getting the two confused is a wage-and-hour problem, a tax problem and a consumer protection problem at once.

**A tip is the employee's money.** Under the federal Fair Labor Standards Act:

- **Tipped employees and the tip credit.** A tipped employee is one in an occupation in which they "customarily and regularly" receive more than $30 a month in tips (29 U.S.C. 203(t)). An employer may pay a tipped employee a cash wage of at least $2.13 an hour and count tips toward the federal minimum wage, a **tip credit** of at most $5.12 an hour, but only if the employee is told and keeps all their tips except through a valid pool, and the credit can't exceed the tips actually received (29 U.S.C. 203(m)(2)(A); DOL Fact Sheet #15). States set their own minimum wages and many don't allow a tip credit at all, so the cash wage is per location, as data.
- **The employer can't keep tips.** "An employer may not keep tips received by its employees for any purposes, including allowing managers or supervisors to keep any portion of employees' tips, regardless of whether or not the employer takes a tip credit" (29 U.S.C. 203(m)(2)(B)).

**A service charge is the restaurant's revenue.** The Department of Labor is explicit: "A compulsory charge for service, for example, 15 percent of the bill, is not considered a tip under the FLSA." The employer may distribute it to staff and count what it pays toward minimum wage, but it's the employer's money until then. The IRS draws the same line for tax: a tip must be "made free from compulsion," the customer must have "the unrestricted right to determine the amount," and it must not be "dictated by employer policy" (Rev. Rul. 2012-18); service charge amounts distributed to employees are "wages for FICA tax purposes," not tips. An automatic 18% gratuity for large parties is a service charge under that test, whatever the menu calls it.

**Tax reporting follows the split.**

- **Employees report tips.** IRS Publication 531: tips under $20 in a month for one job don't have to be reported to the employer; reports are due by the 10th of the following month. Forms 4070 and 4070A are now "historical," with the daily record and report steps in the publication itself. A POS that captures card tips per server is most of that report already.
- **Large food or beverage establishments file Form 8027.** An establishment where tipping is customary and the employer "normally employed more than 10 employees on a typical business day during the preceding calendar year" reports receipts and tips annually; if reported tips are below 8% of gross receipts (or an approved lower rate, not below 2%), the shortfall is **allocated** to directly tipped employees, and "No allocation is made to indirectly tipped employees."
- **The employer's FICA tip credit.** Section 45B gives the employer a credit for its Social Security tax on tips above what's needed to reach the federal minimum wage as of January 1, 2007; a 2025 amendment extended it beyond food and beverage to barbering, hair, nail, esthetics and spa services.
- **"No tax on tips."** The 2025 budget act added a federal deduction for **qualified tips** (26 U.S.C. 224): up to $25,000 a year, reduced by $100 for each $1,000 of modified adjusted gross income over $150,000 ($300,000 for joint filers), for tax years through 2028. Qualified tips must be voluntary, not negotiated, with the amount set by the payer, in an occupation that customarily received tips by December 31, 2024, and they include shared tips. A mandatory service charge doesn't qualify, which gives staff a reason to care how the restaurant labels it.

**States regulate how service charges are shown.** California's Honest Pricing Law (SB 478, effective July 1, 2024) bans advertising a price that "does not include all mandatory fees or charges"; SB 1524 amended it so restaurants, bars and food vendors may add a mandatory fee "so long as the fee is clearly and conspicuously displayed wherever prices are shown," per the California attorney general. Minnesota's wage law treats an "obligatory charge assessed to customers, guests or patrons" as gratuities belonging to employees unless the employer gives clear and conspicuous notice that it isn't the employee's property (Minn. Stat. 177.23, subd. 9), and since 2024 requires card and electronic gratuities to be paid to employees no later than the next scheduled pay period (177.24, subd. 3a). Other states and cities have their own rules; the general consumer-side rule on fees and drip pricing is [Consumer Protection Online](/books/commerce/online-consumer-protection), and card surcharges, a different thing again, are the Payments volume's [Surcharging & Fees](/books/payments/surcharging-and-fees#what-state-law-allows).

For the system, the rules become three:

- **Tips and service charges are different charge kinds.** A tip is an `order_charges` row with `kind = 'tip'`, payer customer, payee staff; a service charge is `kind = 'service_charge'`, payee merchant, with a flag for whether it's distributed to staff. They never share a column, because they go to different ledger accounts, different tax reports and different paychecks ([A Chart of Accounts](/docs/payments/payment-states#a-chart-of-accounts)).
- **The disclosure is part of the charge.** A mandatory service charge carries the rule that requires its disclosure and the text shown wherever prices appear (menu, online ordering, receipt), resolved by the location's jurisdiction ([Rules as Data](/docs/architecture/rules-as-data)).
- **Tip suggestions are configuration, and the tip base is a decision.** Whether suggested percentages apply to the pre-tax or post-tax total, before or after discounts, is something the guest sees and the merchant chooses; store which base was used on the charge.

## Tip Pools

A **tip pool** gathers tips and divides them among staff by a formula (hours worked, points per role, a percentage per role). Federal law limits who can be in it:

- **Among tipped employees, with a tip credit.** An employer taking a tip credit may require pooling only "among employees who customarily and regularly receive tips" (servers, bartenders, bussers, runners), and must give the required notice or lose the tip credit (DOL Fact Sheet #15).
- **Including the kitchen, without one.** Under the 2018 amendments and the Department of Labor's 2020 tip rule (effective April 30, 2021), an employer that pays the full minimum wage and takes no tip credit may include non-tipped workers such as "cooks and dishwashers" in a mandatory pool.
- **Never managers.** A manager or supervisor (primary duty managing, directing two or more full-time employees, with hire and fire authority) "may not receive any tips from the tip pool," even working a tipped shift, though they may keep tips they receive directly for service they provide directly and solely (DOL Fact Sheet #15B). Since 2021, the Department can assess civil money penalties for employers who keep employees' tips.

So a pool is a rule with an eligibility test, and the eligibility test depends on whether the location takes a tip credit, which can differ by state. The distribution is a computation over the period's tips and the eligible staff's hours or points, stored with its inputs, because a server who thinks the pool shorted them is asking to see exactly that.

## Online Ordering

Most restaurant POS vendors sell first-party online ordering: the restaurant's own ordering page or app, with no marketplace commission, feeding the same kitchen. Toast's filing describes its KDS and printers as the way operators "integrate in-store and online orders." The business model of first-party ordering against marketplaces is [The Delivery Landscape](/books/commerce/delivery-landscape#business-models).

What online ordering adds to the kitchen:

- **Throttling.** Online orders arrive in bursts. The ordering page needs a capacity per time slot (orders or items per 15 minutes), and quotes later pickup times when the kitchen is full, the same counter-style capacity as store pickup slots ([Capacity and Slots](/books/commerce/omnichannel-fulfillment#capacity-and-slots)).
- **Fire times.** A scheduled order for 7:00 shouldn't fire at 5:30 when it was placed. It fires at the promised time minus its prep time, and the KDS shows it as held until then.
- **Same menu, different prices.** Online and delivery prices often differ from in-house prices, by channel ([In-App Prices and Markups](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups)); the item is the same and the kitchen sees no difference.
- **Pausing.** A kitchen that is underwater pauses online ordering for a period, across its own page and every delivery app at once ([Availability](/books/commerce/merchants-menus-and-catalogs#availability)).

## How to Build It

The core model has orders with `fulfillment_type = 'dine_in'`, items and modifier groups. This chapter adds tables, seats and checks, kitchen stations and tickets, the service charge kind, and tip pools:

```sql
ALTER TABLE items
  ADD COLUMN kitchen_name       TEXT,      -- short name for the ticket
  ADD COLUMN default_course     TEXT,      -- 'drinks', 'starters', 'mains', 'dessert'
  ADD COLUMN prep_seconds       INT CHECK (prep_seconds >= 0),
  ADD COLUMN allergens          TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE order_lines
  ADD COLUMN seat               SMALLINT,  -- null: shared by the table
  ADD COLUMN course             TEXT,
  ADD COLUMN special_request    TEXT,      -- free text; allergens live in the typed column
  ADD COLUMN allergen_flags     TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN comped_by          UUID,      -- staff; made and given away
  ADD COLUMN comp_reason        TEXT;

ALTER TABLE order_charges
  DROP CONSTRAINT order_charges_kind_check,
  ADD CONSTRAINT order_charges_kind_check CHECK (kind IN ('shipping_fee', 'delivery_fee',
    'service_fee', 'small_order_fee', 'regulatory_fee', 'tax', 'duty', 'tip', 'discount',
    'commission', 'referral_fee', 'fulfillment_fee', 'processing_fee', 'allowance',
    'chargeback_deduction', 'advertising_fee', 'service_charge')),  -- adds 'service_charge'
  DROP CONSTRAINT order_charges_payee_check,
  ADD CONSTRAINT order_charges_payee_check CHECK (payee IN ('merchant', 'platform',
    'courier', 'authority', 'customer', 'staff')),   -- 'staff': a server's tip
  ADD COLUMN check_id           UUID,      -- checks, below; null: the whole order
  ADD COLUMN recipient_staff_id UUID,      -- a tip entered for one server
  ADD COLUMN distributed_to_staff BOOLEAN, -- for 'service_charge': wages if distributed
  ADD COLUMN tip_base           TEXT CHECK (tip_base IN ('pre_tax', 'post_tax',
                                  'pre_discount'));

CREATE TABLE dining_tables (             -- the floor plan
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  name         TEXT NOT NULL,            -- "12", "Bar 3", "Patio 2"
  section      TEXT,                     -- assigned to servers per shift
  seats        SMALLINT NOT NULL CHECK (seats > 0),
  status       TEXT NOT NULL CHECK (status IN ('active', 'retired')),
  UNIQUE (location_id, name)
);

CREATE TABLE table_sessions (            -- guests seated to last check paid
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  dining_table_id UUID NOT NULL REFERENCES dining_tables (id),
  order_id       UUID REFERENCES orders (id),
  server_id      UUID NOT NULL,          -- staff
  party_size     SMALLINT NOT NULL CHECK (party_size > 0),
  seated_at      TIMESTAMPTZ NOT NULL,
  closed_at      TIMESTAMPTZ,
  EXCLUDE USING gist (dining_table_id WITH =,
                      tstzrange(seated_at, closed_at) WITH &&)
);

CREATE TABLE checks (                    -- what one guest or group pays
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  number      SMALLINT NOT NULL,         -- 1, 2, 3 within the order
  status      TEXT NOT NULL CHECK (status IN ('open', 'paid', 'voided')),
  closed_at   TIMESTAMPTZ,
  UNIQUE (order_id, number)
);

CREATE TABLE check_lines (               -- a line, or a share of one, on a check
  check_id      UUID NOT NULL REFERENCES checks (id),
  order_line_id UUID NOT NULL REFERENCES order_lines (id),
  share         NUMERIC(7, 6) NOT NULL CHECK (share > 0 AND share <= 1),  -- 0.5: split in two
  PRIMARY KEY (check_id, order_line_id)
);

CREATE TABLE kitchen_stations (          -- grill, fry, cold, bar, expo
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('prep', 'expo', 'bar', 'pickup_screen')),
  route_mode       TEXT NOT NULL DEFAULT 'station_and_expo' CHECK (route_mode IN
                     ('station_and_expo', 'expo_only', 'station_only')),
  display_device_id UUID REFERENCES pos_devices (id),
  backup_printer_id UUID REFERENCES pos_devices (id),  -- used when the screen is offline
  UNIQUE (location_id, name)
);

CREATE TABLE item_stations (             -- which stations make an item
  item_id     UUID NOT NULL REFERENCES items (id),
  station_id  UUID NOT NULL REFERENCES kitchen_stations (id),
  PRIMARY KEY (item_id, station_id)
);

CREATE TABLE kitchen_tickets (           -- one course of one order at one station
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  station_id  UUID NOT NULL REFERENCES kitchen_stations (id),
  course      TEXT,
  fire_at     TIMESTAMPTZ,               -- scheduled or prep-time staggered fire
  fired_at    TIMESTAMPTZ,               -- null: held
  fired_by    UUID,                      -- staff, or null for automatic
  bumped_at   TIMESTAMPTZ,               -- done at this station
  printed     BOOLEAN NOT NULL DEFAULT FALSE,  -- went to the backup printer
  status      TEXT NOT NULL CHECK (status IN ('held', 'fired', 'in_progress', 'done',
                'recalled', 'voided'))
);

CREATE TABLE kitchen_ticket_lines (
  kitchen_ticket_id UUID NOT NULL REFERENCES kitchen_tickets (id),
  order_line_id     UUID NOT NULL REFERENCES order_lines (id),  -- modifiers ride with the parent
  bumped_at         TIMESTAMPTZ,
  PRIMARY KEY (kitchen_ticket_id, order_line_id)
);

CREATE TABLE tip_pools (                 -- a pooling rule for a location
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id     UUID NOT NULL REFERENCES locations (id),
  name            TEXT NOT NULL,
  takes_tip_credit BOOLEAN NOT NULL,     -- decides who may be in the pool
  basis           TEXT NOT NULL CHECK (basis IN ('hours', 'points', 'percent')),
  eligible_roles  JSONB NOT NULL,        -- {"server": 1.0, "busser": 0.5, "cook": 0.25}
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE tip_distributions (         -- one pool, one period, one person
  tip_pool_id   UUID NOT NULL REFERENCES tip_pools (id),
  period        TSTZRANGE NOT NULL,      -- a shift or a pay period
  staff_id      UUID NOT NULL,
  role          TEXT NOT NULL,
  hours         NUMERIC(6, 2),
  weight        NUMERIC(6, 3),
  amount        BIGINT NOT NULL CHECK (amount >= 0),
  inputs        JSONB NOT NULL,          -- the pool total and every share, as computed
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tip_pool_id, period, staff_id)
);
```

Design notes:

- **Tickets are derived, orders are the truth.** A ticket is one course of one order at one station, generated from the order lines and each item's stations. Editing a line after firing creates a new ticket marked as a change, never an edit to the bumped one, so the kitchen sees what changed.
- **Seat and course are line properties.** Splitting by seat and firing by course both read the line; checks share lines through `check_lines.share`, so a starter split three ways is three shares of one line and the item is sold once.
- **The station's route mode is configuration.** Expo-only drinks, station-only prep and the backup printer are per station, as Toast exposes them.
- **Tips can't be pooled with managers.** A distribution's eligibility check runs against the pool's roles and the staff member's role assignment on that shift ([Staff, Roles and Permissions](/books/commerce/store-operations#staff-roles-and-permissions)); a role flagged as a manager or supervisor is never eligible, whatever the pool's configuration says.
- **Tips flow to staff in full.** Tip charges sit in their own liability account until paid in payroll or cash, so "were all tips paid out" is a balance check, as it is for couriers ([Tips](/books/commerce/delivery-fees-and-the-law#tips)). A cash payout of card tips at end of shift is a `tip_payout` cash movement in the drawer ([Store Operations](/books/commerce/store-operations#how-to-build-it)).
- **Kitchen timestamps feed estimates.** Fire-to-bump times per item and station are the history the prep-time model for delivery learns from ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it)).
- **A local path to the kitchen.** Ticket creation and display must work over the restaurant's local network when the internet is down; the KDS and the register sync through a local hub, and the backup printer takes over when a screen is unreachable ([Offline Sync](/docs/architecture/offline-sync)).

## Auditing

- **Every tip:** amount, the check it was on, who entered or adjusted it and when, which server received it, and the pool and payroll period it was paid in.
- **Every service charge,** with the disclosure rule and text that applied at the location and whether it was distributed to staff.
- **Every tip pool distribution,** with its inputs, so an employee or the Department of Labor can see how each share was computed and that no manager shared in it.
- **Every comp, void and check transfer,** with staff and approver.
- **Kitchen timelines:** each ticket's fire, bump, recall and printer fallback, for food safety questions and complaint handling.
- **Form 8027 inputs** for establishments that file it: gross receipts, charged receipts with tips and reported tips per period ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Make the kitchen the center of the design:** orders become tickets at stations, with routing, expo, coursing and fire times, and a local path that works without the internet.
- **Put seat and course on the line,** and model checks as shares of lines so any split is possible after the fact.
- **Keep tips and service charges as different charge kinds** with different payees, accounts and reports, and never let a service charge be called a tip.
- **Resolve service-charge disclosure and tip-credit rules per location** as data.
- **Model tip pools as rules with eligibility,** exclude managers structurally, and store every distribution's inputs.
- **Throttle first-party online orders by kitchen capacity** and fire scheduled orders at their promised time minus prep time.
- **Record kitchen timestamps** and feed them to prep-time estimates for every channel.

## References

**Filings**

- [Toast: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1650164/000165016426000057/tost-20251231.htm), about 164,000 locations, the 20% market estimate, KDS and kitchen printers integrating in-store and online orders, and Toast Go 3 cellular backup
- [NCR Voyix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/70866/000007086626000006/ncr-20251231.htm), Restaurants segment revenue, Aloha Next and the 2023 Aloha ransomware incident
- [Lightspeed: Annual Information Form 2026](https://www.sec.gov/Archives/edgar/data/1823306/000182330626000025/annualinformationform2026.htm), the European hospitality focus and the Upserve divestiture
- [Fiserv: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/798354/000079835426000009/fi-20251231.htm), the CardFree acquisition for Clover

**Platform documentation**

- [Toast: Orders overview](https://doc.toasttab.com/doc/platformguide/platformOrdersOverview.html), dining options and multiple checks per order
- [Toast: Adding a prep station](https://doc.toasttab.com/doc/platformguide/adminAddPrepStation.html), send-to routing, KDS without a printer, backup printers and Always Print Tickets
- [Toast: Kitchen Display System overview](https://doc.toasttab.com/doc/platformguide/platformKDSOverview.html), the expediter, assembly lines, load balancing, ticket aging and local sync
- [Toast: KDS workflow using courses](https://doc.toasttab.com/doc/platformguide/platformKDSWorkflowUsingCourses.html), course tickets and fulfilling a ready course
- [Toast: Fire by prep time](https://doc.toasttab.com/doc/platformguide/adminFireByPrepTime.html), staggered firing so items finish together

**Wage and tax law**

- [29 U.S.C. 203 (Cornell LII)](https://www.law.cornell.edu/uscode/text/29/203), the tip credit, the ban on employers keeping tips and the tipped-employee definition
- [DOL Fact Sheet #15: Tipped employees under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa), the $2.13 cash wage, the $5.12 maximum tip credit, service charges and tip pooling notice
- [DOL Fact Sheet #15B: Managers and supervisors and tips](https://www.dol.gov/agencies/whd/fact-sheets/15b-managers-supervisors-tips-flsa), managers excluded from tip pools
- [DOL: Tips](https://www.dol.gov/agencies/whd/flsa/tips), the 2020 tip rule on including cooks and dishwashers, civil money penalties and the dual jobs rule history
- [IRS: Revenue Ruling 2012-18 (Internal Revenue Bulletin 2012-26)](https://www.irs.gov/irb/2012-26_IRB), the four tests for a tip and service charges as wages
- [IRS Publication 531: Reporting tip income](https://www.irs.gov/publications/p531), the $20 threshold, the 10th-of-the-month deadline and Forms 4070 as historical
- [IRS: About Form 8027](https://www.irs.gov/forms-pubs/about-form-8027), annual reporting by large food or beverage establishments
- [IRS: Instructions for Form 8027](https://www.irs.gov/instructions/i8027), the more-than-10-employees test, the 8% allocation and no allocation to indirectly tipped employees
- [26 U.S.C. 45B (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/45B), the employer FICA tip credit and its 2025 extension
- [26 U.S.C. 224 (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/224), the qualified tips deduction, its cap, phase-out, end date and voluntariness tests
- [IRS: What the no tax on tips deduction means for you](https://www.irs.gov/newsroom/what-the-no-tax-on-tips-deduction-means-for-you), the $25,000 maximum and the income phase-out

**State law**

- [California Attorney General: Hidden fees (SB 478 and SB 1524)](https://oag.ca.gov/hiddenfees), the all-in price rule and the restaurant fee exception
- [Minn. Stat. 177.23](https://www.revisor.mn.gov/statutes/cite/177.23), obligatory charges as gratuities unless disclosed
- [Minn. Stat. 177.24](https://www.revisor.mn.gov/statutes/cite/177.24), crediting card gratuities by the next pay period
</content>
</invoke>
