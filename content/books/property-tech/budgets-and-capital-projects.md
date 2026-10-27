+++
title = "Budgets, Forecasts & Capital Projects"
nav_title = "Budgets & Capital Projects"
description = "Annual budgets and reforecasts, pro formas, cost allocations, capital versus repair, job costing, renovations, lender draws, reserves and fixed assets."
category = "Property Tech Industry"
order = 1707
part = "Properties, Owners and Investors"
tags = ["property-tech", "budgeting", "capital-projects", "job-costing", "fixed-assets"]
+++

Every autumn, a property manager writes down what next year will look like, line by line, and the owner holds them to it. The budget is not a spreadsheet exercise that ends in December: it's the authority the manager spends under all year, the baseline every monthly variance report is measured against, the starting point of the valuation the owner's lender and investors see, and, under many management agreements, a contractual deadline with a tolerance for overspending. Capital projects sit beside it: replacing a roof, renovating units to raise rents, building a clubhouse. They're budgeted, contracted, invoiced, funded (sometimes by a lender, one draw at a time), and finally recorded as assets that depreciate for decades.

This chapter covers the planning and building side of the owner's money: the annual budget cycle and how budgets are built from the property's own data, reforecasts and variance, multi-year pro formas, allocating shared costs, the line between a repair and a capital improvement, job costing for projects, renovations that take units offline, lender draws and lien waivers, replacement reserves, and the fixed asset register. The manager's approval limits come from [Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#the-management-agreement); the ledger these post to is in [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting).

## How the Platforms Do It

Budgeting and job costing are standard modules in the suites, described similarly:

- **Entrata's** budgeting builds budgets from "system data, leverage formulas, or enter data manually," routes them for approval, "automatically tracks all changes," summarizes "Per Unit and Per Sq Ft metrics," and adds a "2-to-10-year forecast built natively into the platform and anchored to your live GL data" for refinances and dispositions. Its job costing manages "purchase orders, invoices, journal entries, draw requests, contracts, and payments in one system," with custom cost codes and budgets broken "into phases by property location down to unit level," and renovated units flowing back to leasing automatically.
- **RealPage's** accounting suite includes "a budget variance portal" and job cost features to "create draw packages and track replacement reserve limits," with visibility "all the way down to the unit level," plus budgeting and forecasting products.
- **Yardi Breeze** lets users "track budgets and quickly identify problem areas" and "track job costs including budgets, supplier contracts, payments and retention."
- **AppFolio** puts budgeting in its top plan (Max lists "Accounting Performer (Budgeting)"), and **MRI** sells fund modeling with forecasting for owners.

The features that differ are whether budgets are driven by the property's own leases and contracts or typed in, whether reforecasts are versions or overwrites, and whether job costing reaches the unit, the lender's draw and the asset register, or stops at a project total.

## The Budget Cycle

The management agreement sets the calendar. In the 2010 Bell Partners agreement filed with the SEC, the manager submits next year's budget no later than 90 days before the fiscal year, the owner approves it before December 31, spending above the approved budget is capped at 5% in aggregate (taxes, insurance and utilities excepted), and substantial variances are explained within 15 days of month end. The 2020 AIR agreement requires the owner's prior written approval for any cost outside the budget, except emergencies. Those terms become dates and checks ([Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)):

1. **Draft** at the property, built from drivers (below), in August or September for a calendar year.
2. **Review** by the regional manager and the manager's finance team.
3. **Submit** to the owner by the agreement's deadline, with a narrative.
4. **Revise** in rounds of comments, each round a version.
5. **Approve.** The approved version is frozen: it's the authority for spending and the baseline for variance for the whole year.
6. **Operate** against it: purchase orders and invoices check the remaining budget by account, and spending outside it needs the approval the agreement requires ([Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables#purchase-orders)).

My rule: an approved budget never changes. A mid-year change is a reforecast or an approved amendment, both new versions, so that "versus budget" in any report means one thing.

## Building a Budget

A useful budget is computed from the property's own records rather than last year's actuals plus 3%:

- **Rental income** starts from the rent roll: every unit's current lease, its expiration month, an assumed renewal rate (defined as in [Renewals and Turnover](/books/property-tech/operating-metrics#renewals-and-turnover)) and renewal increase (inside any legal cap; [Rent Limits in the Engine](/books/property-tech/revenue-management#rent-limits-in-the-engine)), market rents for units turning over, and the vacancy days between. Gross potential rent then falls out of units and rents rather than being typed, and changes when rents change.
- **Vacancy, concessions and bad debt** come from the leasing plan and history, and are budgeted as their own lines, in the same order as the operating statement in [The Property's Money](/books/property-tech/property-business#the-property-s-money).
- **Other income** comes from the charge catalog: parking spaces times rents and take-up, pet fees by pet count, utility reimbursements from the billing method ([Utilities & Energy](/books/property-tech/utilities-and-energy#resident-utility-billing)).
- **Payroll** comes from a staffing plan (positions, rates, benefits, raises by month), allocated to the property.
- **Contracts** come from the service contracts in force (landscaping, pest, elevators), with escalations and expirations.
- **Utilities** from usage history and rates; **property taxes** from the parcels' assessments and tax rates ([Addresses, Parcels and Jurisdictions](/books/property-tech/portfolios-properties-and-units#addresses-parcels-and-jurisdictions)); **insurance** from the renewal quote.
- **The management fee** from the agreement's fee rule applied to budgeted receipts ([Management Fees](/books/property-tech/owners-and-management-agreements#management-fees)).

Each budget line is an amount per GL account per month, and the drivers that produced it are kept with it, so a change in an assumption recomputes the lines that depend on it and a reviewer can see why a number is what it is. Per-unit and per-square-foot views divide by the property's unit count and area as of the budget year ([Portfolios, Properties & Units](/books/property-tech/portfolios-properties-and-units#unit-status-and-its-history)).

## Reforecasts and Variance

Each month, actuals post against the approved budget and the variance report explains the difference. Two things make it useful rather than noise:

- **Thresholds from the agreement.** Variances above a percentage or amount per line need a written explanation by a date, and the platform asks the person responsible, collects the answer, and puts it in the owner package ([Owner Reporting](/books/property-tech/owners-and-management-agreements#owner-reporting)).
- **Timing versus permanent.** A roof repair paid in March instead of April is a timing variance; a property tax increase is permanent. Tagging each explanation lets the reforecast pick up the permanent ones.

A **reforecast** is actuals for closed months plus a new forecast for the rest of the year, typically quarterly or at mid-year, approved like a budget and stored as a version beside it. Reports show actual, budget and latest forecast side by side, and never replace the budget with the forecast.

## Pro Formas

A **pro forma** is a multi-year projection of a property's operations and capital, used to buy, refinance or sell it, and to value it ([Valuations](/books/property-tech/investors-and-asset-management#valuations)). It's built like a budget at lower resolution (years rather than months, drivers rather than contracts) and adds a capital plan, debt service, and, for a sale, an exit value. Entrata's version runs 2 to 10 years from live ledger data. The platform's job is to keep the assumptions explicit (rent growth, expense growth, occupancy, capital spending, cap rate at exit) and versioned, so that an acquisition's underwriting can be compared with what actually happened three years later, which is the comparison asset managers and investors ask for.

## Allocations and Shared Costs

Properties share costs: two phases owned by different LLCs share one leasing office and one maintenance team; a regional manager oversees twelve properties; a central accounting team, a leasing contact center and an AI tier serve the whole portfolio. Each shared cost is pooled and allocated by a rule: a base (units, square feet, hours logged per property, work orders, interactions), a period, and a list of properties, producing one entry per property per period. Budgets use the same rules to budget the allocated amounts, so the budget and the actual allocate identically.

Whether a given allocation may be charged to an owner is the management agreement's question, answered in [Reimbursements and Allocated Costs](/books/property-tech/owners-and-management-agreements#reimbursements-and-allocated-costs); this chapter owns the mechanics. My rule: an allocation is a computation with stored inputs (the base quantities per property for the period), so a property's share can be explained and recomputed, never a percentage someone typed into a journal entry.

## Capital or Repair

Whether a cost is an operating expense (deducted this year, in the operating statement) or a capital improvement (recorded as an asset and depreciated) changes net operating income, taxes and sometimes who pays under a lease or an agreement. Tax law and book policy each draw the line, and not always in the same place. The IRS tangible property regulations give the tax framework:

- **De minimis safe harbor:** amounts up to $2,500 per invoice or item, or $5,000 with an applicable financial statement, can be expensed under the election.
- **Routine maintenance safe harbor:** recurring work to keep property in ordinarily efficient operating condition, which for buildings and building systems must be reasonably expected to occur more than once in the 10 years after the property is placed in service.
- **Improvements are capitalized** if they're a betterment (fixing a pre-existing defect, a material addition or increase in capacity, or a material increase in productivity, efficiency, strength, quality or output), a restoration (replacing a major component or substantial structural part, returning property from disrepair, rebuilding to like-new), or an adaptation to a new use.
- **Small taxpayer safe harbor** for buildings: taxpayers with average annual gross receipts of $10 million or less, for a building with an unadjusted basis under $1 million, can expense repairs, maintenance and improvements on it if the year's total doesn't exceed the lesser of 2% of the basis or $10,000.

The platform doesn't decide tax treatment, but it has to capture the facts that decide it, at the invoice line ([Invoice Capture and Approval](/books/property-tech/vendors-and-payables#invoice-capture-and-approval)): the amount, the property and building, the component (roof, HVAC unit, flooring in unit 214), whether it's a replacement, the project it belongs to, and the owner's book capitalization threshold. Classification is then a rule over those facts with a recorded reason, reviewable by the owner's accountant, instead of a GL account picked by whoever keyed the invoice ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).

## Capital Projects and Job Costing

A **capital project** has a budget broken down by **cost code** (demolition, cabinets, flooring, appliances, labor, permits, contingency) and often by **phase** and by **unit**, and its spending is tracked in three stages:

- **Budget:** what the owner approved for each cost code.
- **Committed:** contracts and purchase orders signed against it, including **change orders** that raise or lower a contract.
- **Actual:** invoices received and approved against commitments, and payments made.

Budget minus committed is what's left to commit; committed minus actual is what's still owed; and **cost to complete** is the project manager's estimate of what remains, which together with actual gives the forecast final cost. A project whose forecast final cost exceeds budget needs owner approval before it does, not after.

**Retention** (or retainage) is a percentage of each contractor payment held back until the work is accepted. It's a liability to the contractor, tracked per contract, released at completion, and its own line in every draw. Yardi Breeze lists retention as part of job costs; any job costing system that pays contractors needs it.

Projects also create fees and assets. A **construction management fee** is often charged under the management agreement: 5% of completed cost for capital projects over $10,000 per item in the 2010 agreement, computed from the project's actuals at completion ([Management Fees](/books/property-tech/owners-and-management-agreements#management-fees)). When the project closes, its capitalized costs become **fixed assets** (below).

## Renovations and Units Offline

A **value-add renovation** program upgrades units as they turn over (kitchens, floors, fixtures) to lease them at a premium. It's a project with a budget per unit and a per-unit return, and it touches leasing directly:

- **The unit goes down for the renovation,** as a status period linked to the project, so it leaves available inventory and the vacancy is attributed to the renovation, not to leasing ([Unit Status and Its History](/books/property-tech/portfolios-properties-and-units#unit-status-and-its-history)).
- **The unit comes back with new attributes:** dated amenities ("renovated kitchen" from the completion date) that pricing and listings use. Entrata describes renovated units appearing on the leasing side with "what renovations were made."
- **The premium is measured:** the first lease after renovation against the same floor plan's unrenovated leases, which is the return the program is judged on. That comparison needs the renovation's date per unit and the leases on each side.
- **Down time is a cost.** Days offline times the unit's rent is part of the renovation's true cost, and a program that renovates faster earns more even at the same spend.

## Draw Requests and Lien Waivers

Renovations and new construction are often financed by a lender that funds the work in **draws**: periodic advances against a construction or renovation loan, each supported by a package the lender's inspector and servicer review. Entrata names draw requests and RealPage names draw packages as job costing features. A draw package typically holds:

- **A schedule of values:** each cost code's budget, work completed in prior draws, work completed this period, materials stored, retainage, and balance to finish.
- **Invoices and contracts** supporting this period's amounts.
- **Lien waivers** from contractors and suppliers.
- **The owner's certification** and, at the lender's option, an inspector's confirmation of percent complete.

**Lien waivers** exist because a contractor or supplier who isn't paid can file a mechanic's lien against the property. Waivers come in kinds: conditional (effective only when the payment clears) or unconditional, and progress (through a date) or final. Their form and legal effect are matters of state law, so the form is chosen per state, and a draw that pays a contractor should collect the conditional waiver for this payment and the unconditional waiver for the last one. The platform tracks, per contract and per payment, which waiver is due, which was received, its kind, its through date and its amount, and refuses to release retention without a final waiver.

## Replacement Reserves

Lenders on income property commonly require a **replacement reserve**: monthly deposits held by the lender or servicer and released for the replacement of capital items (roofs, HVAC, appliances, paving). Fannie Mae's Multifamily Guide, for example, has sections on determining and funding the reserve, alternative funding, and, for servicing, its administration, new property condition assessments, interest on reserve funds, and eligible and ineligible items. RealPage's job costing tracks "replacement reserve limits."

For the platform, the reserve is:

- **An asset of the owner held by a third party,** recorded as its own ledger account per loan, funded by the monthly deposit with the mortgage payment, and reconciled to the servicer's statement like a bank account.
- **A requirement with terms:** the monthly deposit, any required balance, eligible items, and the release process, as data per loan.
- **A source of funds for projects:** a capital project can be funded partly from the reserve, which needs a release request with invoices and, often, lender inspection; the project tracks which costs were reimbursed from the reserve so they aren't claimed twice.

An owner's own operating reserve under the management agreement is a different thing ([Reserves](/books/property-tech/owners-and-management-agreements#reserves)), and so is an association's reserve fund ([Community Associations](/books/property-tech/community-associations#reserves-and-reserve-studies)).

## Fixed Assets

Capitalized costs become **fixed assets**, each with a cost, a placed-in-service date, a location (property, building, unit) and a component. For US tax purposes, IRS Publication 527 says residential rental buildings (where 80% or more of gross rental income comes from dwelling units) are depreciated over 27.5 years under the general depreciation system, improvements are depreciated as separate property items over the period that would apply to the original property, and land is not depreciable. Book depreciation follows the owner's accounting policy and can differ.

The register matters operationally as well as for tax:

- **Component-level assets** (each HVAC unit, each roof section, each appliance) carry warranties, expected lives and replacement dates, which feed the capital plan and the replacement reserve budget. [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#assets-and-warranties) keeps the equipment and warranty side of the same records in `property_assets`, and the two should be one register, not two: a component's `fixed_assets` row points at its `property_assets` row, and the warranty date lives only there.
- **Disposals:** a replaced component is retired from the register when its replacement is placed in service, so the books don't depreciate two roofs.
- **Acquisitions:** a purchased property arrives with an allocation of price between land, building and components, which sets depreciation for years; it's recorded with its source (an appraisal or a cost segregation study) and never re-derived.

## How to Build It

Deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model), using `gl_accounts` and the multi-entity ledger from [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#how-to-build-it) and `cost_allocations` and `agreement_terms` from [Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#how-to-build-it).

```sql
CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL REFERENCES tenants (id),
  property_id     UUID NOT NULL REFERENCES properties (id),
  fiscal_year     INT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('budget', 'reforecast', 'pro_forma')),
  version         INT NOT NULL,
  horizon_years   INT NOT NULL DEFAULT 1,             -- 2 to 10 for a pro forma
  status          TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'submitted', 'approved',
                    'superseded', 'rejected')),
  due_on          DATE,                               -- from the agreement's budget lead time
  submitted_at    TIMESTAMPTZ,
  approved_by     UUID REFERENCES users (id),         -- the owner's approver
  approved_at     TIMESTAMPTZ,
  based_on_id     UUID REFERENCES budgets (id),        -- the prior version or the budget reforecast
  UNIQUE (tenant_id, property_id, fiscal_year, kind, version)
);

-- One approved budget per property and year.
CREATE UNIQUE INDEX budgets_one_approved
  ON budgets (property_id, fiscal_year) WHERE kind = 'budget' AND status = 'approved';

CREATE TABLE budget_lines (
  budget_id      UUID NOT NULL REFERENCES budgets (id),
  gl_account_id  UUID NOT NULL REFERENCES gl_accounts (id),
  month          DATE NOT NULL,                       -- first day of the month (or year)
  amount         BIGINT NOT NULL,                     -- minor units
  driver         JSONB,                               -- inputs: units, rates, take-up, contract id
  note           TEXT,
  PRIMARY KEY (budget_id, gl_account_id, month)
);

CREATE TABLE variance_explanations (
  tenant_id      UUID NOT NULL,
  budget_id      UUID NOT NULL REFERENCES budgets (id),
  gl_account_id  UUID NOT NULL REFERENCES gl_accounts (id),
  month          DATE NOT NULL,
  variance       BIGINT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('timing', 'permanent')),
  explanation    TEXT NOT NULL,
  due_on         DATE NOT NULL,                       -- from the agreement
  written_by     UUID NOT NULL REFERENCES users (id),
  written_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (budget_id, gl_account_id, month)
);

CREATE TABLE allocation_rules (                        -- produce cost_allocations rows
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  cost_pool      TEXT NOT NULL,
  base           TEXT NOT NULL CHECK (base IN ('units', 'square_feet', 'hours', 'work_orders',
                   'interactions', 'fixed_share')),
  property_group_id UUID NOT NULL REFERENCES property_groups (id),
  valid_during   DATERANGE NOT NULL
);

CREATE TABLE capital_projects (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID NOT NULL REFERENCES properties (id),
  kind            TEXT NOT NULL CHECK (kind IN ('replacement', 'renovation_program',
                    'new_construction', 'repositioning', 'other')),
  name            TEXT NOT NULL,
  approved_budget BIGINT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'in_progress',
                    'substantially_complete', 'closed', 'cancelled')),
  approved_by     UUID REFERENCES users (id),
  funding         TEXT[] NOT NULL DEFAULT '{}',        -- 'owner', 'reserve', 'construction_loan'
  completed_on    DATE
);

ALTER TABLE unit_status_periods
  ADD CONSTRAINT unit_status_periods_project_fk
  FOREIGN KEY (capital_project_id) REFERENCES capital_projects (id);

CREATE TABLE project_budget_lines (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  project_id  UUID NOT NULL REFERENCES capital_projects (id),
  cost_code   TEXT NOT NULL,                          -- tenant's cost code catalog
  phase       TEXT,
  unit_id     UUID REFERENCES units (id),              -- per-unit budgets for renovation programs
  amount      BIGINT NOT NULL,
  UNIQUE NULLS NOT DISTINCT (project_id, cost_code, phase, unit_id)
);

CREATE TABLE project_commitments (                     -- a contract, or a purchase order
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  project_id      UUID NOT NULL REFERENCES capital_projects (id),
  vendor_id       UUID NOT NULL REFERENCES vendors (id),
  purchase_order_id UUID REFERENCES purchase_orders (id),  -- null for a contract
  budget_line_id  UUID NOT NULL REFERENCES project_budget_lines (id),
  original_amount BIGINT NOT NULL,
  retainage_bps   INT NOT NULL DEFAULT 0,              -- 1000 = 10% held back
  document_id     UUID NOT NULL,
  signed_on       DATE NOT NULL
);

CREATE TABLE change_orders (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  commitment_id  UUID NOT NULL REFERENCES project_commitments (id),
  number         INT NOT NULL,
  amount         BIGINT NOT NULL,                      -- signed: up or down
  reason         TEXT NOT NULL,
  approved_by    UUID NOT NULL REFERENCES users (id),
  approved_on    DATE NOT NULL,
  UNIQUE (commitment_id, number)
);

CREATE TABLE project_costs (                            -- actuals: approved invoice lines
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  project_id         UUID NOT NULL REFERENCES capital_projects (id),
  commitment_id      UUID REFERENCES project_commitments (id),
  budget_line_id     UUID NOT NULL REFERENCES project_budget_lines (id),
  bill_line_id       UUID NOT NULL REFERENCES bill_lines (id),
  amount             BIGINT NOT NULL,
  retainage_held     BIGINT NOT NULL DEFAULT 0,
  component          TEXT,                              -- 'roof', 'hvac', 'flooring'
  capitalize         BOOLEAN NOT NULL,
  capitalize_reason  TEXT NOT NULL,                     -- the policy rule that decided it
  funded_from        TEXT NOT NULL CHECK (funded_from IN ('owner', 'reserve', 'loan_draw')),
  draw_request_id    UUID,                              -- set when included in a draw
  ledger_transaction_id UUID REFERENCES ledger_transactions (id)
);

CREATE TABLE cost_to_complete (                         -- dated estimates, never overwritten
  budget_line_id UUID NOT NULL REFERENCES project_budget_lines (id),
  as_of          DATE NOT NULL,
  amount         BIGINT NOT NULL,
  estimated_by   UUID NOT NULL REFERENCES users (id),
  PRIMARY KEY (budget_line_id, as_of)
);

CREATE TABLE draw_requests (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  project_id    UUID NOT NULL REFERENCES capital_projects (id),
  lender_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  number        INT NOT NULL,
  period_end    DATE NOT NULL,
  requested     BIGINT NOT NULL,
  approved      BIGINT,
  status        TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'inspected', 'approved',
                  'funded', 'rejected')),
  package_uri   TEXT,                                   -- the package as submitted
  UNIQUE (project_id, number)
);

CREATE TABLE draw_request_lines (                        -- the schedule of values for one draw
  draw_request_id    UUID NOT NULL REFERENCES draw_requests (id),
  budget_line_id     UUID NOT NULL REFERENCES project_budget_lines (id),
  scheduled_value    BIGINT NOT NULL,
  previously_completed BIGINT NOT NULL,
  this_period        BIGINT NOT NULL,
  materials_stored   BIGINT NOT NULL DEFAULT 0,
  retainage          BIGINT NOT NULL,
  PRIMARY KEY (draw_request_id, budget_line_id)
);

CREATE TABLE lien_waivers (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  commitment_id   UUID NOT NULL REFERENCES project_commitments (id),
  kind            TEXT NOT NULL CHECK (kind IN ('conditional_progress', 'unconditional_progress',
                    'conditional_final', 'unconditional_final')),
  through_date    DATE NOT NULL,
  amount          BIGINT NOT NULL,
  form_state      TEXT NOT NULL,                        -- whose statutory form, if any
  document_id     UUID NOT NULL,
  received_on     DATE NOT NULL
);

CREATE TABLE reserve_requirements (                      -- lender replacement reserves
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  lender_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  loan_reference   TEXT NOT NULL,
  monthly_deposit  BIGINT NOT NULL,
  eligible_items   TEXT[] NOT NULL,
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts (id),  -- held by the servicer
  valid_during     DATERANGE NOT NULL
);

CREATE TABLE reserve_releases (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  reserve_requirement_id UUID NOT NULL REFERENCES reserve_requirements (id),
  project_id             UUID REFERENCES capital_projects (id),
  requested              BIGINT NOT NULL,
  released               BIGINT,
  status                 TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'released',
                           'denied')),
  submitted_on           DATE NOT NULL
);

CREATE TABLE fixed_assets (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  owner_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  property_id          UUID NOT NULL REFERENCES properties (id),
  building_id          UUID REFERENCES buildings (id),
  unit_id              UUID REFERENCES units (id),
  component            TEXT NOT NULL,                   -- 'land', 'building', 'roof', 'hvac', ...
  cost                 BIGINT NOT NULL,
  placed_in_service_on DATE NOT NULL,
  source               TEXT NOT NULL CHECK (source IN ('project', 'acquisition_allocation',
                         'migration')),
  project_id           UUID REFERENCES capital_projects (id),
  book_life_months     INT,                              -- null for land
  tax_recovery_years   NUMERIC(4, 1),                    -- 27.5 for residential rental buildings
  tax_method           TEXT,
  property_asset_id    UUID REFERENCES property_assets (id),  -- equipment and warranty side
  replaces_asset_id    UUID REFERENCES fixed_assets (id),
  disposed_on          DATE,
  CHECK (component <> 'land' OR (book_life_months IS NULL AND tax_recovery_years IS NULL))
);
```

Project position by budget line, the job cost report's core:

```sql
SELECT bl.cost_code, bl.phase, bl.unit_id,
       bl.amount AS budget,
       (SELECT COALESCE(SUM(c.original_amount), 0)
          FROM project_commitments c WHERE c.budget_line_id = bl.id)
     + (SELECT COALESCE(SUM(co.amount), 0)
          FROM change_orders co
          JOIN project_commitments c ON c.id = co.commitment_id
         WHERE c.budget_line_id = bl.id)                         AS committed,
       (SELECT COALESCE(SUM(pc.amount), 0)
          FROM project_costs pc WHERE pc.budget_line_id = bl.id) AS actual,
       (SELECT ctc.amount FROM cost_to_complete ctc
         WHERE ctc.budget_line_id = bl.id
         ORDER BY ctc.as_of DESC LIMIT 1)                        AS cost_to_complete
FROM project_budget_lines bl
WHERE bl.project_id = :project_id;
```

How it runs:

1. **Budgets build from drivers** read from leases, the charge catalog, contracts, parcels and the staffing plan; changing a driver recomputes its lines in a new draft version.
2. **Approval freezes a budget,** and spending checks (purchase orders, invoices) read the approved version and the agreement's tolerance.
3. **Variance explanations are requested automatically** for lines over threshold after each close, with due dates from the agreement.
4. **Every project cost is classified at entry,** capitalize or expense with the rule that decided it, and the classification can be changed only by a reviewer with a recorded reason.
5. **A draw request snapshots** its schedule of values, invoices and waivers into a package before submission, and costs in a funded draw can't be edited.
6. **Project close** posts the capitalized costs to `fixed_assets` by component, retires replaced assets, computes the construction management fee, and closes renovation down periods with the units' new amenities.

## Auditing

- **Every budget version,** who built, reviewed, submitted and approved it, and the drivers behind each line; the approved version frozen.
- **Variance explanations** as written, with their due dates and whether they were on time.
- **Allocations with their inputs,** so any property's share can be recomputed.
- **Capital or expense decisions** per cost, with the rule and any reviewer override.
- **Project commitments, change orders, costs and retention** reconciling to the project's position at any date.
- **Draw packages as submitted,** with lien waivers, approvals and fundings, and reserve releases with their invoices.
- **The fixed asset register** with sources, placed-in-service dates, replacements and disposals.

## What This Means for the System You Build

- **Build budgets from the property's own records** (leases, charges, contracts, parcels, staffing) and keep the drivers with the lines.
- **Version everything:** budgets, reforecasts and pro formas are versions; an approved budget is frozen for the year.
- **Compute deadlines and spending tolerance from the management agreement** and enforce them in purchasing.
- **Make allocations rules with stored inputs,** shared by budgets and actuals.
- **Capture the facts that decide capital versus repair** at the invoice line and classify by rule with a reason.
- **Track projects through budget, committed and actual** by cost code, phase and unit, with change orders, retention and dated cost-to-complete.
- **Link renovations to unit status and amenities,** and measure the rent premium they earn.
- **Treat draw packages and lien waivers as records,** and refuse to release retention without a final waiver.
- **Model lender reserves as the owner's assets held by servicers,** with requirements and releases as data.
- **Keep one component-level fixed asset register** that maintenance and accounting share.

## References

**Agreements**

- [Bluerock Enhanced Multifamily Trust: Property management agreement with Bell Partners (2010)](https://www.sec.gov/Archives/edgar/data/1442626/000089180410005006/exhibit1037.htm), budget submission 90 days before the fiscal year, approval before December 31, the 5% tolerance, variance explanations within 15 days, the 5% construction management fee over $10,000 per item
- [Aimco OP: Property management agreement (2020)](https://www.sec.gov/Archives/edgar/data/1820878/000119312520286288/d894747dex1011.htm), owner approval for costs outside the budget, emergency exceptions

**Tax and lending**

- [IRS: Tangible Property Final Regulations](https://www.irs.gov/businesses/small-businesses-self-employed/tangible-property-final-regulations), de minimis safe harbor of $2,500 or $5,000, routine maintenance safe harbor, betterment, restoration and adaptation, small taxpayer safe harbor for buildings
- [IRS: Publication 527, Residential Rental Property](https://www.irs.gov/publications/p527), 27.5-year recovery for residential rental property, the 80% dwelling-unit test, improvements as separate property, land not depreciable
- [Fannie Mae Multifamily Guide](https://mfguide.fanniemae.com/node/4246), replacement reserve sections on determining, funding and alternative funding, and servicing sections on administration, property condition assessments, interest and eligible items

**Platforms**

- [Entrata: Budgeting](https://www.entrata.com/products/budgeting), budgets from system data and formulas, approval routing, change tracking, per-unit and per-square-foot summaries, 2-to-10-year pro formas from live GL data
- [Entrata: Job Costing](https://www.entrata.com/products/job-costing), purchase orders, invoices, draw requests and contracts, custom cost codes, phased budgets to the unit level, renovated units returning to leasing
- [RealPage: Accounting & Financial Suite](https://www.realpage.com/property-management-software/accounting-software/), budget variance portal, draw packages and replacement reserve limits to the unit level
- [Yardi Breeze: Residential Features](https://www.yardibreeze.com/residential-features/), budgets and job costs with supplier contracts, payments and retention
- [AppFolio: Property Manager](https://www.appfolio.com/property-manager), budgeting in the Max plan
- [MRI Software: Investment Management](https://www.mrisoftware.com/solutions/investment-management/), fund modeling and forecasting
