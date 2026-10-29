+++
title = "Store Operations"
description = "Running stores in software: staff roles, PINs and manager overrides, cash drawers and end of day, shrink and organized retail crime law, store systems."
category = "Commerce Industry"
order = 2340
part = "Point of Sale and Stores"
tags = ["commerce", "stores", "staff", "cash-management", "shrink", "loss-prevention"]
+++

A store is a building full of goods and cash, run by people paid by the hour, many of them new. Each of those makes the software's job harder. Goods walk out the door without a sale, through theft, mistakes and damage nobody wrote down. Cash passes through a dozen hands a day, so it has to be counted at the start and end of every drawer, and any difference has to be explained by someone. Staff change every season, so each person needs access to exactly what their job requires, on a shared device, and every refund, discount and drawer open has to name the person who did it. The point of sale records the sale; this chapter covers what keeps the store honest around the sale.

It covers staff roles and permissions on the POS, manager overrides, cash management from the opening float to the bank deposit, shrink and loss prevention, the law on organized retail crime, and the other systems a store runs on. It extends `locations` and `inventory_levels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and the devices and tenders from [Point of Sale](/books/commerce/point-of-sale#how-to-build-it). Counts, cycle counts and the inventory ledger are [Inventory](/books/commerce/inventory#cycle-counts-and-shrink); stores as fulfillment hubs are [Omnichannel Fulfillment](/books/commerce/omnichannel-fulfillment); tips and tip pools are [Restaurants & Food Service](/books/commerce/restaurants). The playbook's [Authorization](/docs/security/authorization) and [Audit Trails](/docs/architecture/audit-trails) are the general patterns this chapter applies to a store.

## How the Platforms Do It

As of October 2026, from each vendor's help center:

| Platform | Staff access | Approvals | Cash | Activity record |
| --- | --- | --- | --- | --- |
| **Square** | Permission sets at Standard, Enhanced and Full levels, customizable; one shared "Team Permissions" set can be tied to a team passcode | Per permission | Cash drawer management on the register | A shared team passcode "does not support the ability to track sales, time, or activity by a team member" |
| **Shopify POS** | A unique PIN per staff member with POS access; custom POS roles on POS Pro | A role can require Manager Approval for returns and exchanges, given by a manager entering their PIN | A register session records "the starting float, any cash added or removed, and the final count" | An activity log of voids, refunds, manual discounts and customer record views, kept one year |

Three patterns:

- **One person, one PIN.** Both Square and Shopify document a personal code per staff member, and Square states the cost of the alternative: a shared passcode can't attribute anything. A store that shares a login has no loss prevention data, only totals.
- **Approval is a second person's PIN.** Shopify's Manager Approval is the general shape: the cashier starts the action, a manager enters their own PIN on the same device, and the record names both. It's the store version of the playbook's [Staff and Support Access](/docs/security/authorization#staff-and-support-access).
- **Logs leave gaps.** Shopify's activity log is explicit about what it doesn't record: cash drawer operations, failed or canceled actions, logins and logouts, and register sessions opening and closing. A loss prevention team needs those, so a system built for stores records them itself.

## Staff, Roles and Permissions

A store's people fall into a few roles, and each POS action belongs to some of them:

| Action | Cashier | Supervisor or key holder | Store manager | Back office |
| --- | --- | --- | --- | --- |
| Ring a sale, take tenders | Yes | Yes | Yes | No |
| Void a line before tender | Yes, or with approval above a value | Yes | Yes | No |
| Void a completed sale | No | Yes | Yes | No |
| Return without a receipt | No | With approval | Yes | No |
| Manual discount or price override | Up to a limit | Up to a higher limit | Yes | No |
| No-sale drawer open, paid in, paid out | No | Yes | Yes | No |
| Open and close a register session | With a supervisor | Yes | Yes | No |
| Accept offline card payments | Per the merchant's policy | Yes | Yes | No |
| Edit items, prices, staff | No | No | Some | Yes |

The table is typical, not a standard; every merchant tunes it. What carries across systems:

- **Permissions are per action, with limits.** "May discount up to 15%" or "may refund up to $100 without approval" is a permission with a parameter. Store it as data so a merchant can change the threshold without a release ([Rules as Data](/docs/architecture/rules-as-data)).
- **Roles are per location.** A manager at one store is often a cashier at another, or covers a shift elsewhere. The assignment is (person, role, location), not a role on the person.
- **The device is shared, the session isn't.** A register is used by several people in an hour; each sale, tender and void records the staff member signed in at that moment. A PIN is a quick re-authentication on a trusted device, not a login, so the device itself is enrolled and the PIN only works on enrolled devices at that location ([Authentication](/docs/security/authentication)).
- **Least privilege by default.** A new hire starts as a cashier with no overrides. Full access, in Square's model, also makes the person an authorized representative of the account, which is a business decision, not an HR default ([Least Privilege](/docs/security/authorization#least-privilege)).
- **Leaving is immediate.** A terminated employee's PIN stops working at every location at once, and their open drawer is closed by a manager with a count.

Time clocks usually live in the POS too: staff clock in on the register, and the hours feed payroll and labor scheduling. In restaurants, the clock-in also decides who shares in the night's tip pool ([Tip Pools](/books/commerce/restaurants#tip-pools)).

## Cash Management and End of Day

Cash moves through a store in a fixed loop, and each step is a count or a movement:

1. **Float.** A drawer opens with a counted starting amount (the **float** or bank), in known denominations, signed for by the person taking it.
2. **Sales and change.** Each cash tender adds the sale amount; change is already netted out ([Tenders](/books/commerce/point-of-sale#tenders)).
3. **Paid in and paid out.** Cash added (more change from the safe) or removed (petty cash for supplies, a cash refund, a delivery tip), each with a reason and a person.
4. **Drops.** Excess cash removed during the shift to a safe, so the drawer never holds much. A drop is counted, often sealed in a bag with a number, and recorded on both sides.
5. **Mid-shift read (X report).** A snapshot of the session so far, without closing it.
6. **Close and count.** At shift end the drawer is counted, ideally blind (the counter isn't shown the expected amount), and the system computes **expected cash** as float + cash sales + paid in − paid out − drops − cash refunds. Counted minus expected is **over or short**.
7. **End-of-day close (Z report).** All sessions closed, card batches settled, totals by tender reconciled, and the day locked.
8. **Deposit.** Cash beyond the next day's floats goes to the bank, by an employee or an armored carrier, and the bank's credit reconciles against the deposit slip.

Shopify's register session is this loop in its simplest form: the session records the float, cash added or removed and the final count, and at the end "the Cash tracking and the Session reports summarize payment activity" so the expected and counted amounts can be compared. The words differ between systems ("X" and "Z" come from cash register keys, and some systems call a session a shift or a till), but the arithmetic doesn't.

The rules that make it trustworthy:

- **Counts are by denomination.** Twenties, tens, rolls of quarters: a count by denomination can be recounted and catches a miscount that a total hides, and the next float needs the right mix.
- **Blind close, then reveal.** A counter who sees the expected amount tends to find it. Count first, then show the difference, and require a recount above a threshold.
- **Over is a problem too.** An over means a sale was rung short, change was miscounted, or a sale wasn't rung at all and the cash went in the drawer anyway. Both directions get a reason and a reviewer.
- **Every no-sale is suspicious in aggregate.** Opening the drawer without a sale is sometimes needed (making change for a neighbor's store) and is also how cash leaves without a record. Count no-sales per person per shift.
- **Card batches are part of the close.** A card batch that didn't settle is money the store thinks it has. The close checks that every captured card tender is in a settled batch ([Payouts & Settlement](/books/payments/payouts-and-settlement)), and that no offline payment is still waiting to forward ([Offline Mode and Its Limits](/books/commerce/point-of-sale#offline-mode-and-its-limits)).

Cash also carries legal weight beyond the store's own controls: some cities and states require in-person retailers to accept it, and large cash transactions have reporting rules of their own ([Where Cash Is Required](/books/payments/cash-payments#where-cash-is-required)). A cannabis dispensary that can't get a bank account runs almost entirely on this loop ([Banking and Payments](/books/commerce/cannabis-and-hemp#banking-and-payments)).

## Shrink and Loss Prevention

**Shrink** is the difference between the inventory the records say a store should have and what is there. The National Retail Federation's 2023 National Retail Security Survey put the average shrink rate at 1.6% of sales in fiscal 2022, up from 1.4% in 2021, and estimated it at $112.1 billion in losses. Loss prevention divides shrink by source: external theft (shoplifting and organized theft), internal theft by employees, process and paperwork errors, and vendor error or fraud. The survey's estimate of each source's share is in its full report, not on the page cited here, so no split is given. <!-- source-gap: nrf-shrink-split | missing | the NRF National Retail Security Survey's share of shrink by source (external theft, internal theft, process error, other) and any NRF figure newer than fiscal 2022 | closes with: the NRSS 2023 report PDF's sources-of-shrink chart (the PDF behind the page's Download Report button is image-only and unreadable to fetching; needs reading page by page), or a later NRF report | checked: 2026-10-28 -->

Each source leaves a different trail in the data:

| Source | How it happens | Where the software sees it |
| --- | --- | --- |
| **External theft** | Shoplifting, organized crews, return fraud with stolen goods, self-checkout skips | Counts that fall without sales; returns without receipts; high-value items missing in a cycle count |
| **Internal theft** | Sweethearting (ringing a friend's goods short), voids and refunds to oneself, no-sale cash removal, stock out the back door | Voids, refunds, discounts and no-sales per person; refunds to the same card; shorts on one person's drawers |
| **Process error** | Mis-receipts, wrong units of measure, unrecorded damage, transfers posted to the wrong store, price errors | Receiving variances; damaged goods without movements; transfers in flight that never arrive |
| **Vendor error or fraud** | Short shipments signed for in full, direct-store-delivery vendors stocking less than invoiced | Receipts that don't match counts for one vendor's items |

What a system does about it:

- **Record shrink as movements with reasons.** A count variance, a known theft, damage and a write-off are different `inventory_movements` reasons, and a known loss (a broken bottle, a theft caught on camera) is recorded when it happens, not discovered at the next count ([Movements, Not Overwrites](/books/commerce/inventory#movements-not-overwrites)). The shrink that remains unexplained after known losses is the number that matters.
- **Exception reporting.** Loss prevention teams look for outliers: one cashier's voids at three times the store average, refunds just under the approval limit, no-sales clustered at shift end, returns rung by the same person who sold the item. The POS has every input; the report is the product ([Risk Scoring](/docs/architecture/risk-scoring)).
- **Count what's stolen most, most often.** The item classes a store's own shrink events show losing most get more frequent cycle counts and sometimes locked cases; a count by item class feeds the store's buffer for online availability ([Store Inventory Accuracy](/books/commerce/omnichannel-fulfillment#store-inventory-accuracy)).
- **Tags and cameras are data sources too.** Electronic article surveillance (EAS) tags alarm at the door; RFID tags let a store count a rack in seconds and find what moved; cameras at self-checkout and the register can be tied to transaction IDs. Each is an integration that attaches evidence to a sale or a movement.

## Organized Retail Crime and the Law

Organized retail crime (ORC) is theft by groups who steal goods to resell them, often online. The law has moved on two fronts:

- **Online resale.** The federal INFORM Consumers Act, in effect since June 27, 2023, requires online marketplaces to collect and verify bank account, contact and tax ID information from **high-volume third-party sellers** (200 or more discrete sales of new or unused consumer products and $5,000 or more in gross revenue in any continuous 12-month period within the previous 24 months) and, for sellers with $20,000 or more in annual gross revenue, to disclose the seller's name, physical address and contact information to buyers. The FTC and state attorneys general enforce it; the FTC's guidance cites civil penalties of $53,088 per violation as of October 2026. The marketplace's side of the duty belongs to [Brand Protection](/books/commerce/brand-protection#inform-disclosures) and [Running Your Own Marketplace](/books/commerce/running-a-marketplace#seller-onboarding-and-verification); for a store, it's the reason stolen goods are harder to fence anonymously.
- **State penalties.** States have revised theft thresholds and added ORC offenses. California is the most visible example: Proposition 47 (2014) generally made shoplifting of goods worth $950 or less a misdemeanor, and Proposition 36 (2024) makes theft of $950 or less a felony for someone with two or more prior convictions for certain theft crimes and adds up to three years when three or more people committed the crime together, per the Legislative Analyst's analysis. Two 2024 California laws add sentencing enhancements until January 1, 2030: AB 1960 adds one, two or three years when property taken, damaged or destroyed in a felony exceeds $50,000, $200,000 or $1,000,000, and SB 1416 adds tiered enhancements, starting at one year above $50,000, for selling, exchanging or returning for value property taken by shoplifting, theft or burglary from a retail business, including for anyone acting in concert. Other states have their own ORC statutes and thresholds. Federally, the Combating Organized Retail Crime Act of 2025 (H.R. 2853) passed the House 348 to 60 on May 12, 2026 and was referred to the Senate Judiciary Committee on May 13; as of October 2026 congress.gov shows no further action.

For the software, the law turns into two requirements. Thresholds are aggregated across incidents in many statutes, so an incident record with value, time, location and any linked suspects is evidence a prosecutor can use, and it has to be exportable. And the store's own data (what was taken, its retail value, the camera reference) has to be recorded once and accurately, because the value of the goods can decide whether a theft is a misdemeanor or a felony.

## Store Systems

Around the POS, a store runs a handful of other systems, each with its own data and its own sync problem:

- **Workforce management.** Labor forecasting from sales and traffic, schedules, time and attendance, and the predictive scheduling laws some cities apply to retail and food service. It reads POS sales by hour and writes schedules and timecards.
- **Task management and communications.** Planograms, price changes, recalls and promotions pushed from headquarters as tasks with due dates and photo proof; store-to-store and headquarters-to-store messaging. A recall that reaches stores as a task with a confirmation is a recall a regulator can see was executed ([Recalls](/books/commerce/product-safety-and-recalls#recalls)).
- **Pricing and labels.** Shelf labels (paper or electronic) that must match the POS price, because a shelf price that differs from the register price can be a consumer protection problem ([Pricing & Price Lists](/books/commerce/pricing)).
- **Receiving and inventory.** Store receiving of warehouse transfers and direct-store deliveries, counts and adjustments, usually on handhelds ([Inventory](/books/commerce/inventory)).
- **Security.** EAS, cameras, alarms and access control, increasingly linked to POS transactions.

Each of these is a `connected_systems` row in [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it), with one system named as the source of truth for each object: the workforce system for schedules, the POS for sales and drawers, the inventory system for counts.

## How to Build It

The core model has locations and inventory; Point of Sale has devices and tenders. This chapter adds staff, roles and their assignments, register sessions and cash movements, approvals, and shrink events:

```sql
CREATE TABLE staff (                     -- people who work at a merchant's locations
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  display_name  TEXT NOT NULL,           -- shown on receipts and reports
  employee_ref  TEXT,                    -- the HR or payroll system's ID
  pin_hash      TEXT,                    -- a slow hash; unique per merchant at check time
  status        TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'terminated')),
  hired_on      DATE,
  terminated_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_roles (               -- a named permission set, per merchant
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  name         TEXT NOT NULL,            -- 'cashier', 'supervisor', 'store_manager'
  permissions  JSONB NOT NULL,           -- {"discount.manual": {"max_pct": 15},
                                         --  "refund.no_receipt": {"requires_approval": true}}
  version      INT NOT NULL DEFAULT 1,
  UNIQUE (merchant_id, name)
);

CREATE TABLE staff_role_assignments (    -- a person, a role, a place, a period
  staff_id     UUID NOT NULL REFERENCES staff (id),
  role_id      UUID NOT NULL REFERENCES staff_roles (id),
  location_id  UUID REFERENCES locations (id),  -- null: every location of the merchant
  during       TSTZRANGE NOT NULL,
  granted_by   UUID REFERENCES staff (id),
  EXCLUDE USING gist (staff_id WITH =, role_id WITH =, location_id WITH =, during WITH &&)
);

CREATE TABLE cash_drawers (              -- a physical drawer at a register
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id    UUID NOT NULL REFERENCES locations (id),
  pos_device_id  UUID REFERENCES pos_devices (id),  -- the cash_drawer device, if tracked
  name           TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('active', 'retired'))
);

CREATE TABLE register_sessions (         -- one drawer, one opening to one close
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  cash_drawer_id UUID NOT NULL REFERENCES cash_drawers (id),
  opened_by      UUID NOT NULL REFERENCES staff (id),
  opened_at      TIMESTAMPTZ NOT NULL,
  business_date  DATE NOT NULL,          -- in the location's time zone
  closed_by      UUID REFERENCES staff (id),
  closed_at      TIMESTAMPTZ,
  expected_cash  BIGINT,                 -- computed at close from cash_movements
  counted_cash   BIGINT,                 -- the final count
  status         TEXT NOT NULL CHECK (status IN ('open', 'closed', 'reviewed')),
  EXCLUDE USING gist (cash_drawer_id WITH =,
                      tstzrange(opened_at, closed_at) WITH &&)  -- one session per drawer at a time
);

CREATE TABLE cash_movements (            -- append-only; the drawer's ledger
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  register_session_id UUID NOT NULL REFERENCES register_sessions (id),
  kind                TEXT NOT NULL CHECK (kind IN ('float', 'sale', 'refund', 'paid_in',
                        'paid_out', 'drop', 'tip_payout', 'no_sale')),
  amount              BIGINT NOT NULL,   -- signed: into the drawer positive
  tender_id           UUID REFERENCES tenders (id),  -- for 'sale' and 'refund'
  reason              TEXT,              -- required for paid in, paid out and no-sale
  drop_bag_number     TEXT,              -- for drops
  staff_id            UUID NOT NULL REFERENCES staff (id),
  approved_by         UUID REFERENCES staff (id),
  idempotency_key     TEXT NOT NULL UNIQUE,
  occurred_at         TIMESTAMPTZ NOT NULL,
  CHECK (kind <> 'no_sale' OR amount = 0),
  CHECK (kind NOT IN ('paid_in', 'paid_out', 'no_sale') OR reason IS NOT NULL)
);

CREATE TABLE drawer_counts (             -- a count by denomination: open, mid-shift or close
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  register_session_id UUID NOT NULL REFERENCES register_sessions (id),
  kind                TEXT NOT NULL CHECK (kind IN ('opening', 'mid_shift', 'closing',
                        'recount', 'safe')),
  denominations       JSONB NOT NULL,    -- {"2000": 12, "1000": 5, "25": 40} in minor units
  total               BIGINT NOT NULL,
  blind               BOOLEAN NOT NULL DEFAULT TRUE,  -- expected amount hidden while counting
  counted_by          UUID NOT NULL REFERENCES staff (id),
  verified_by         UUID REFERENCES staff (id),
  variance_reason     TEXT,              -- required above the merchant's threshold
  counted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE manager_approvals (         -- a second person's PIN on someone else's action
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  action       TEXT NOT NULL,            -- 'void_sale', 'refund_no_receipt', 'price_override'
  subject_kind TEXT NOT NULL,            -- 'order', 'order_line', 'tender', 'cash_movement'
  subject_id   UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES staff (id),
  approved_by  UUID NOT NULL REFERENCES staff (id),
  role_version INT NOT NULL,             -- the permission set in force
  pos_device_id UUID REFERENCES pos_devices (id),
  approved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (requested_by <> approved_by)
);

CREATE TABLE shrink_events (             -- a known loss, recorded when it happens
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id           UUID NOT NULL REFERENCES locations (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('theft_external', 'theft_internal',
                          'damage', 'expired', 'vendor_shortage', 'process_error',
                          'unknown_count_variance')),
  inventory_movement_id UUID REFERENCES inventory_movements (id),  -- the posted loss
  item_id               UUID REFERENCES items (id),
  quantity              INT,
  retail_value          BIGINT,          -- at the selling price; what ORC thresholds use
  cost_value            BIGINT,          -- at cost; what the books use
  incident_ref          TEXT,            -- a police report or case number
  evidence              JSONB,           -- camera clip references, linked order IDs
  recorded_by           UUID NOT NULL REFERENCES staff (id),
  occurred_at           TIMESTAMPTZ NOT NULL,
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expected cash for an open session: the number the closing count is compared to.
SELECT s.id,
       COALESCE(SUM(m.amount), 0) AS expected_cash
FROM register_sessions s
LEFT JOIN cash_movements m ON m.register_session_id = s.id
WHERE s.id = $1
GROUP BY s.id;

-- Exceptions: staff whose void rate is far above their location's this week.
WITH per_staff AS (
  SELECT o.location_id, o.staff_id,
         COUNT(DISTINCT o.id) AS sales,
         COUNT(v.id)          AS voids
  FROM orders o
  LEFT JOIN order_voids v ON v.order_id = o.id
  WHERE o.channel = 'pos' AND o.placed_at >= NOW() - INTERVAL '7 days'
  GROUP BY o.location_id, o.staff_id
)
SELECT p.*, p.voids::numeric / NULLIF(p.sales, 0) AS void_rate,
       AVG(p.voids::numeric / NULLIF(p.sales, 0)) OVER (PARTITION BY p.location_id) AS store_rate
FROM per_staff p
ORDER BY void_rate DESC NULLS LAST;
```

Design notes:

- **Staff here, staff members in Field Operations.** A Commerce `staff` row and a Field Operations [`staff_members`](/books/field-operations/field-operations-business) row are the same concept: a person who works for the merchant, scoped to where they work. A store's location is a branch's counterpart, and a role assignment per location is the same shape as a technician's branch. A merchant running both (a garden center with a lawn service) can share one person record and add the commerce role.
- **The drawer is a ledger.** Expected cash is the sum of `cash_movements`; nothing stores a running balance that can drift. A sale's cash movement comes from its tender, so the drawer and the sales reconcile by construction ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **A session per drawer, not per person.** Two cashiers sharing a drawer is a choice some stores make and loss prevention dislikes; the model records who did each movement either way, and a merchant that wants one person per drawer enforces it at open.
- **Counts are evidence.** Denominations, blind or not, who counted and who verified are stored for every count, so an over or short can be traced to a count, not argued about.
- **Permissions are versioned.** An approval records the role version in force, so a later change to the threshold doesn't make an old approval look wrong.
- **Shrink has two values.** Retail value is what a theft statute and an insurance claim use; cost is what the books write off. Record both when the event happens; the price changes later.
- **The PIN is a credential.** Hash it with a slow hash, rate-limit attempts per device, and require it to be unique per merchant so a PIN identifies one person; never log it.

## Auditing

- **Every register session's ledger:** float, every cash movement, every count by denomination, the variance and its reason, and who reviewed it.
- **Every manager approval,** with the requester, the approver, the device and the permission version, so a pattern of approvals between the same two people is visible.
- **Every role grant and revocation,** with who granted it and when it took effect, and every PIN reset ([Audit Trails](/docs/architecture/audit-trails)).
- **Every shrink event** with its evidence and value, and the unexplained count variance left after known losses, by location and item class.
- **End-of-day closes:** each business day's tender totals, settled card batches, outstanding offline payments and the deposit, with who closed it.

## What This Means for the System You Build

- **Give every staff member their own PIN** and attribute every sale, tender, void, discount and drawer open to the person signed in.
- **Model permissions as actions with parameters,** assigned per location and versioned.
- **Record approvals as a second person on someone else's action,** never as the requester's own elevated access.
- **Keep the cash drawer as an append-only ledger** with counts by denomination, blind closes and reasons for every variance.
- **Close the day against card batches and offline payments,** not just cash.
- **Record known losses as they happen,** with retail and cost value and evidence, so the shrink that remains is the unexplained part.
- **Build exception reports from the POS data** (voids, refunds, no-sales, overrides per person), because that's where internal loss shows.
- **Record what the systems around the POS don't:** drawer operations, logins and session opens and closes.

## References

**Platform documentation**

- [Square Support: Team member permissions](https://squareup.com/help/us/en/article/5822-employee-permissions), permission levels, the team passcode and what it can't track, and full access
- [Shopify Help: Understanding POS staff management](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/staff-management/understanding-pos-staff-management), PINs, custom POS roles on POS Pro and Manager Approval
- [Shopify Help: Shopify POS activity log](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/staff-management/pos-activity-log), what the log records and doesn't, and its one-year retention
- [Shopify Help: Cash register management](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/cash-register-management), register sessions, the float, cash added and removed, the final count and session reports

**Research**

- [NRF: National Retail Security Survey 2023](https://nrf.com/research/national-retail-security-survey-2023), shrink at 1.6% of sales in fiscal 2022, up from 1.4%, and $112.1 billion

**Law**

- [15 U.S.C. 45f (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/45f), the INFORM Consumers Act's high-volume seller thresholds and effective date
- [FTC: Informing businesses about the INFORM Consumers Act](https://www.ftc.gov/business-guidance/resources/informing-businesses-about-inform-consumers-act), the information marketplaces collect and disclose, the $20,000 disclosure threshold and civil penalties
- [California Legislative Analyst's Office: Proposition 36 (2024)](https://lao.ca.gov/BallotAnalysis/Proposition?number=36&year=2024), Proposition 47's $950 threshold and Proposition 36's repeat-theft felony and group enhancement
- [California AB 1960 (2024), Chapter 220](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB1960), property-loss sentencing enhancements (Penal Code 12022.6)
- [California SB 1416 (2024), Chapter 174](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB1416), enhancements for selling or returning stolen retail property (Penal Code 12022.10)
- [H.R. 2853, Combating Organized Retail Crime Act of 2025 (congress.gov)](https://www.congress.gov/bill/119th-congress/house-bill/2853/all-actions), passed the House May 12, 2026; referred to Senate Judiciary
</content>
</invoke>
