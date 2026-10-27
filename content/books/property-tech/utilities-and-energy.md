+++
title = "Utilities & Energy"
description = "Billing residents for utilities by submeter or allocation, the state rules that limit it, utility invoice audit, procurement, and benchmarking laws."
category = "Property Tech Industry"
order = 1718
part = "Rent and Resident Money"
tags = ["property-tech", "utilities", "submetering", "rubs", "energy-benchmarking", "esg"]
+++

Utilities are the largest operating expense a property can recover from residents, and the one where recovery is most regulated. In an older building with one water meter, the owner gets one bill and either absorbs it or divides it among households by formula; in a newer one, every unit has a submeter and gets a bill for its own usage; in a third, residents hold their own accounts with the utility and the property pays only for common areas and vacant units. Every arrangement turns a utility's invoice into charges on resident ledgers, and states set the terms: what may be passed through, how it must be allocated and disclosed, what fees may be added, and whether nonpayment counts as unpaid rent. On the expense side, the same property pays dozens of utility bills a month that need entering, auditing and paying on time, buys energy in markets where it has a choice, and in a growing number of cities must report its energy use, and soon meet a limit on it. This chapter covers resident billing and its law, invoice processing and audit, procurement, tax refunds, and benchmarking and performance standards. Turning utilities on and off at move-in and move-out belongs to Move-In & Move-Out; submeters as connected devices to Access, Smart Buildings & Parking.

## How the Platforms Do It

Utility management is a service business wrapped in software, and the large suites sell both halves:

- **RealPage** lists resident billing aimed at cost recovery, submetering from installation to maintenance with meter data linked to billing, utility expense management that automates invoice processing and aims to reduce late fees and disconnects, energy management, sustainability services (benchmarking, procurement, conservation and ESG reporting), and smart waste management that tracks volumes and overflows. It claims "the industry's largest utility expense database".
- **Entrata** bills utilities on one monthly bill with rent, parking and fees, with experts who "configure utility charges" for regulatory compliance; processes property utility bills into accounts payable with bills routed to it and audited (its page says "up to 25% of utility bills contain an error"); automates ENERGY STAR Portfolio Manager data entry for benchmarking; and, through a partner (AUTA), recovers overpaid sales tax on utility bills on a contingency basis, with refunds in some states going back up to ten years.
- **Yardi Breeze** sells a utility billing add-on that monitors consumption, flags issues, detects invoice errors and recovers overages.
- **Specialist billing companies** run resident utility billing for properties on every platform, and their output arrives in the property's ledger as charges.

The split matters for design. Resident billing produces charges on resident ledgers and is regulated as landlord-tenant (and sometimes utility) law; expense management produces vendor bills in payables and is ordinary accounting; benchmarking produces filings with cities and states. One platform does all three, but they're different data flows with different owners.

## Resident Utility Billing

There are four ways a resident pays for utilities, and many properties use more than one (electricity direct, water by submeter, trash by flat fee):

| Method | How the charge is computed | Typical use |
| --- | --- | --- |
| **Direct account** | The resident has their own account with the utility; nothing on the ledger | Individually metered electricity and gas |
| **Submetered** | The unit's measured usage × the utility's rate, plus allowed charges | Newer buildings, water and sometimes electricity |
| **Allocated (ratio utility billing, RUBS)** | The master bill, less common areas, divided by a formula (occupants, square feet, unit type) | Buildings with one meter per service |
| **Flat fee** | A fixed monthly amount | Trash, small properties, some included services |

**Submetering** turns meter reads into bills: read (by radio, by drive-by or by hand), validate (a negative read, a zero for an occupied unit, a spike), price at the utility's rate for the period, and post. **Allocation** is a formula over a bill:

```text
master bill                     $12,400 water and sewer, for the service period
- common area share             15% by the property's policy: $1,860
= billable to units             $10,540
unit share                      weights per unit: 50% by occupants, 50% by square feet
unit 204 (2 occupants, 900 sq ft) of totals (420 occupants, 180,000 sq ft):
                                0.5 × 2/420 + 0.5 × 900/180,000 = 0.004881
unit 204 charge                 $10,540 × 0.004881 = $51.45
```

The design questions are the same whichever method:

- **Who pays for vacant units.** The owner does: the vacant units' share of an allocated bill, and vacant units' metered usage, are an operating expense, never spread across occupied units. The formula has to know which units were occupied on which days, which comes from leases, not from a status column ([The Life of a Unit](/books/property-tech/property-business#the-life-of-a-unit)).
- **Proration.** A resident who moved in on the 17th owes 15 days of an allocated bill or their own usage after the move-in read; the rule is per method and recorded ([Proration](/books/property-tech/charges-and-resident-ledgers#proration)).
- **Service periods don't match months.** A utility's bill covers its own read cycle, which is why utility charges carry a `service_period` different from rent's and post when the provider bill arrives.
- **Fees.** Billing or administrative fees, late fees on utility bills and setup fees are each regulated, sometimes separately from rent's fees.
- **One bill or two.** Most platforms post utility charges on the resident ledger so the resident sees one bill with rent; that convenience means the [application rule](/books/property-tech/charges-and-resident-ledgers#payment-application-order) and the late fee rules must know utility charges aren't rent where the law says so.
- **Disclosure.** Mandatory utility and "utility administration" fees are what regulators look for in advertised prices: the Greystar order named utility administration among the fees disclosed late ([The Property's Money](/books/property-tech/property-business#the-property-s-money)). Colorado's HB25-1090 lets a landlord's total price disclosure exclude the actual amount charged for utilities, but not the existence of the charge.

## Submetering Law and Licensing

States regulate resident utility billing in landlord-tenant statutes, in utility law, or both. Two examples show the range of what a rule set has to express:

**Oregon (ORS 90.315)** allows utility or service charges only if the written rental agreement provides for them, and only at the cost billed to the landlord by the provider; where one provider bill covers several tenants, the landlord must explain the allocation. Common-area charges must be described separately from the unit's. The landlord must bill within 30 days of receiving the provider's bill, state rent and utilities separately, include a copy of the provider's bill or say the tenant may inspect it, and treat payment as timely if the due date is at least 30 days after delivery. Cable, satellite and internet may carry up to 10% more than cost if the total stays below the direct price and the markup is listed. Unpaid utility charges are not rent or a fee, so nonpayment can't support a nonpayment-of-rent termination (only termination for cause). Violations cost the greater of one month's rent or twice the amount wrongfully charged.

**Texas (Water Code 13.503)** directs the Public Utility Commission to encourage water submetering for conservation and to set rules for submetering and allocation in apartments, manufactured home communities and multiple-use facilities. Owners may not charge more than the utility's per-gallon cost plus taxes and surcharges, may add a service charge of up to 9% of submetering costs (except for certain tax credit units and voucher holders), must keep records tenants can inspect, may charge a late fee of no more than 5% of the late bill, and must use submeters that meet the commission's accuracy and testing standards.

The common threads are what the data model needs: the method must be in the written lease; charges are capped at the provider's cost plus enumerated fees; allocation and the provider's bill must be explainable to the resident; fees have their own caps and exemptions for subsidized residents; equipment has standards; and utility charges often aren't rent. Other states and cities add rules on which utilities may be allocated at all, on billing companies' registration, and on when, if ever, a landlord may interrupt service, which Landlord-Tenant Law as Data covers. These belong in jurisdiction rules, effective-dated and cited ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), checked when the allocation method is configured and on every billing run.

**Who's billing matters too.** Many properties hire a third party to bill and collect utilities. That company is collecting money owed to the landlord from consumers, which brings the question of whether it needs a collection agency license in states that license collectors broadly; Entrata's S-1 discloses a putative class action in Maryland alleging it lacked a license under the Maryland Collection Agency Licensing Act. As of October 2026, that question is being litigated rather than settled, so the platform keeps billing companies, their licenses by state, and the agreement that names them as the landlord's agent as data, and lets compliance decide which flows need what ([Collections After Move-Out](/books/property-tech/delinquency-and-eviction#collections-after-move-out) covers the same issue for rent).

## Utility Invoice Processing and Audit

The expense side starts with a property's utility accounts: electric for common areas and vacant units, master water and sewer, gas for central boilers, trash, internet for the office. Each account produces a bill each cycle, and each bill is a payable with a due date and a disconnect risk. The work:

1. **Capture.** Bills are routed to a processor (Entrata routes bills directly to its team; RealPage describes automated invoice processing) or arrive by utility data feeds, PDF or paper, and are extracted to line items: account, meter, service period, usage, demand, rate components, taxes, late charges, total.
2. **Validate and audit.** Compare usage with the same period last year and the prior period, check the rate against the tariff, look for estimated reads, duplicate bills, late fees, taxes charged at the wrong rate, and accounts for units that should be in residents' names. Entrata's figure that up to 25% of bills contain an error is a vendor's claim, but the audit is how errors are found.
3. **Code and approve** to the property's GL accounts (common area electric, vacant unit electric, water and sewer) and route for approval; Vendors, Procurement & Payables owns approval and payment.
4. **Pay on time.** A missed utility payment means late fees on the property and, at worst, a disconnect notice for a building; RealPage markets reducing exactly those.
5. **Feed recovery.** Master bills feed allocation runs; vacant-unit bills feed vacancy cost reporting; consumption feeds benchmarking.

The flagship number this produces is **utility recovery**: the share of recoverable utility expense billed back to residents, by property and service, which Operating Metrics defines. A falling recovery rate is how missed move-ins, wrong allocation settings and vacant units billed to occupied ones show up.

**Sales tax** on utilities is its own audit. Where a state taxes residential and commercial utility use differently, a property billed at the wrong rate overpays, so specialist firms recover overpayments on contingency and fix the rate going forward; Entrata's partner offering says some states allow refunds up to ten years back. The platform's job is to keep the tax lines from every bill, by account and service period, so a claim can be filed from data ([Sales Tax](/docs/payments/sales-tax#exemptions-are-documents) covers exemption documents).

## Procurement

In states with retail choice for electricity or gas, a property (or a portfolio) can buy supply from a competitive supplier instead of the default utility rate: a fixed price for a term, an index price, or a blend, through a broker or energy advisor. The decisions are contract decisions (term, price structure, which accounts, renewal), and the platform's part is modest but useful: know each account's supplier, contract and expiry, so a contract doesn't roll to a variable rate unnoticed, and compare billed rates with contracted ones in the invoice audit. Resident-facing energy plans (a resident choosing a supplier for their own account) are marketplace referrals, covered in [Resident Marketplaces and Referral Revenue](/books/property-tech/resident-financial-products#resident-marketplaces-and-referral-revenue).

## Benchmarking and Performance Standards

Cities and states increasingly require large buildings to report their energy use each year (benchmarking) and, in a growing number, to meet limits on energy use or emissions (building performance standards, or BEPS). The common tool is ENERGY STAR Portfolio Manager, EPA's free benchmarking tool, which compares a building's use with its history and similar buildings, gives eligible buildings a 1 to 100 score, and, by EPA's count, already covers nearly 25% of US commercial building space. Two current laws show where the requirements are going:

- **New York City, Local Law 97.** Buildings over 25,000 gross square feet (or multiple buildings on one tax lot, or condominiums under one board, over 50,000) must meet greenhouse gas emission limits beginning in 2024, with stricter limits from 2030, toward a 40% reduction by 2030 and net zero by 2050. Annual emissions reports, certified by a registered design professional, are due by May 1 each year from 2025. Some affordable housing follows separate pathways.
- **Washington, Clean Buildings Performance Standard.** Tier 1 buildings over 50,000 square feet comply on a schedule by size: June 1, 2026 for more than 220,000 square feet, June 1, 2027 for more than 90,000, and June 1, 2028 for more than 50,000. Tier 2, including multifamily buildings over 20,000 square feet, reports by July 1, 2027. Tier 1 penalties can reach $5,000 plus $1.50 per square foot, and an owner may choose to pay rather than comply.

Those dates are as of October 2026. Requirements differ in every jurisdiction (thresholds, which property types are in scope, whether whole-building data is required, how tenant-paid usage is obtained), so a portfolio needs a calendar of obligations per building, not per property: one property may have several buildings, some in scope and some not.

The data problem is **whole-building usage when residents pay their own bills.** A benchmark needs every unit's consumption, which the owner doesn't receive when residents hold direct accounts. Utilities provide aggregated whole-building data for benchmarking in many places (EPA lists utilities that do), and the platform's job is to request it, load it with the property's own bills into Portfolio Manager (Entrata's product automates exactly that entry), and keep the submission record. **ESG reporting** to owners and investors draws on the same data, rolled up by fund and portfolio; Investors, Funds & Asset Management covers the reporting side.

**Retrofits** (LED lighting, low-flow fixtures, HVAC controls, solar, EV charging) are how buildings meet the limits and cut expense. They're capital projects with budgets and incentives (Budgets, Forecasts & Capital Projects), and the platform's contribution is measurement: consumption before and after, from the same invoice and meter data, so savings are evidence rather than a vendor's estimate. Financing structures that pay for retrofits from savings, offered through partners with no upfront capital, are an [ancillary agreement](/books/property-tech/resident-financial-products#disclosure-and-revenue-share) whose terms the owner should see.

**Waste** is the utility nobody meters well. Hauler invoices, compactor fullness sensors and valet trash programs (a mandatory resident fee in many communities, and therefore an all-in pricing item) all reach the same places: payables, a resident charge code, and in some cities a diversion report.

## How to Build It

Resident utility charges post as core `charges` with a `charge_codes.category` of `'utility'` and a service period; the [ledger chapter](/books/property-tech/charges-and-resident-ledgers#how-to-build-it) supplies the columns that say whether a charge counts as rent. This chapter adds accounts, meters, allocation, billing runs, provider invoices and benchmarking:

```sql
CREATE TABLE utility_accounts (          -- the property's accounts with providers
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID NOT NULL REFERENCES properties (id),
  building_id     UUID REFERENCES buildings (id),
  unit_id         UUID REFERENCES units (id),   -- a vacant-unit account in the owner's name
  vendor_id       UUID NOT NULL REFERENCES vendors (id),  -- the utility or supplier
  service         TEXT NOT NULL CHECK (service IN ('electric', 'gas', 'water', 'sewer',
                    'trash', 'stormwater', 'internet', 'other')),
  account_number  TEXT NOT NULL,
  serves          TEXT NOT NULL CHECK (serves IN ('master', 'common_area', 'vacant_unit',
                    'unit_backup')),
  supply_contract JSONB,                 -- supplier, price, term, expiry, in choice markets
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE submeters (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  unit_id       UUID NOT NULL REFERENCES units (id),
  account_id    UUID NOT NULL REFERENCES utility_accounts (id),  -- the master it sits behind
  service       TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  last_tested_on DATE,                   -- accuracy testing, where rules require it
  valid_during  DATERANGE NOT NULL,      -- installed to removed
  UNIQUE (tenant_id, serial_number)
);

CREATE TABLE meter_reads (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  submeter_id UUID NOT NULL REFERENCES submeters (id),
  read_at     TIMESTAMPTZ NOT NULL,
  reading     NUMERIC(14, 3) NOT NULL,   -- cumulative, in the meter's unit
  unit        TEXT NOT NULL,             -- 'gal', 'kWh', 'ccf'
  source      TEXT NOT NULL CHECK (source IN ('radio', 'manual', 'estimated', 'move_in',
                'move_out')),
  status      TEXT NOT NULL CHECK (status IN ('valid', 'flagged', 'replaced')),
  UNIQUE (submeter_id, read_at)
);

CREATE TABLE utility_allocation_methods ( -- how a master bill becomes unit charges
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  service             TEXT NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('submeter', 'allocation', 'flat', 'none')),
  common_area_percent NUMERIC(5, 4),     -- removed before allocation
  weights             JSONB,             -- {"occupants": 0.5, "square_feet": 0.5}
  admin_fee           JSONB,             -- {"type": "percent", "value": 0.09} within the cap
  charge_code_id      UUID NOT NULL REFERENCES charge_codes (id),
  rule_ids            UUID[] NOT NULL,   -- the jurisdiction rules checked when configured
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, service WITH =, valid_during WITH &&)
);

CREATE TABLE utility_invoices (          -- provider bills, captured and audited
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  account_id        UUID NOT NULL REFERENCES utility_accounts (id),
  service_period    DATERANGE NOT NULL,
  usage             NUMERIC(14, 3),
  usage_unit        TEXT,
  demand            NUMERIC(12, 3),
  amount            BIGINT NOT NULL,
  tax_amount        BIGINT NOT NULL DEFAULT 0,
  late_charge       BIGINT NOT NULL DEFAULT 0,
  is_estimated_read BOOLEAN NOT NULL DEFAULT FALSE,
  due_on            DATE NOT NULL,
  audit_status      TEXT NOT NULL CHECK (audit_status IN ('pending', 'passed', 'exception',
                      'disputed', 'resolved')),
  audit_findings    JSONB,
  payable_ref       TEXT,                -- the bill in payables; Vendors owns it
  document_id       UUID,
  UNIQUE (account_id, service_period)
);

CREATE TABLE utility_billing_runs (      -- one master bill or read cycle into resident charges
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  method_id      UUID NOT NULL REFERENCES utility_allocation_methods (id),
  invoice_id     UUID REFERENCES utility_invoices (id),
  service_period DATERANGE NOT NULL,
  billable_amount BIGINT NOT NULL,       -- after common area
  billed_to_residents BIGINT NOT NULL,
  vacant_share   BIGINT NOT NULL,         -- the owner's expense
  status         TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'posted', 'reversed')),
  posted_at      TIMESTAMPTZ,
  UNIQUE (method_id, service_period)
);

CREATE TABLE benchmark_submissions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  building_id   UUID NOT NULL REFERENCES buildings (id),
  law           TEXT NOT NULL,           -- 'NYC LL97', 'WA CBPS', a city benchmarking ordinance
  reporting_year INT NOT NULL,
  due_on        DATE NOT NULL,
  data_sources  JSONB NOT NULL,          -- owner bills, aggregated utility data, estimates
  status        TEXT NOT NULL CHECK (status IN ('not_started', 'data_requested', 'submitted',
                  'accepted', 'exempt', 'penalized')),
  submitted_on  DATE,
  result        JSONB,                   -- score, emissions, limit, penalty
  UNIQUE (building_id, law, reporting_year)
);
```

Decisions behind it:

- **Charges point back to their run, and runs to their invoice or reads,** so any resident's utility charge can be explained down to the provider's bill and the formula.
- **Vacant share is a column, not a remainder,** so the owner's expense is explicit and checked: billed plus vacant plus common area equals the bill.
- **Allocation methods are effective-dated and checked against rules when configured,** with the rule versions recorded, so a later audit can show the method was lawful when used.
- **Meter reads are append-only;** a corrected read replaces a flagged one with a new row and a reversed and re-posted charge.
- **Benchmarking is per building and law,** because a property's buildings differ in size and obligations.

## Auditing

- **Every resident utility charge** reproducible from the invoice or reads, the method version, the occupancy data and the fee rules, with the provider's bill available to the resident where the law requires it.
- **Every allocation method and its approval,** and the lease language that authorizes it, per lease.
- **Every invoice's audit result** and every dispute with a provider, with credits received.
- **Utility recovery by property and service,** month by month, with vacant and common-area shares, so owners see what was absorbed and why.
- **Every benchmarking submission** with its data sources, certifications and the regulator's response, kept for as long as penalties can be assessed.

## What This Means for the System You Build

- **Support every billing method side by side,** per property and service, with the method in the lease and effective-dated.
- **Never spread vacant units' or common areas' costs to residents;** compute the owner's share explicitly on every run.
- **Encode state utility billing rules as data:** cost caps, allowed fees, disclosure, billing deadlines, subsidized exemptions, and whether utility charges are rent.
- **Capture provider invoices to line items and audit them** for usage, rate, tax, duplicates and late charges before they're paid and before they're allocated.
- **Track supply contracts and their expiries** in choice markets, and compare billed rates with contracted ones.
- **Keep a per-building calendar of benchmarking and performance obligations,** and load whole-building data, including aggregated resident usage, into the reporting tool from the same records.

## References

**Statutes and programs**

- [Oregon ORS 90.315](https://oregon.public.law/statutes/ors_90.315), utility charges at provider cost, allocation explanations, billing within 30 days, the 10% cap for cable and internet, utility charges not rent
- [Texas Water Code 13.503](https://texas.public.law/statutes/tex._water_code_section_13.503), submetering and allocation under PUC rules, cost caps, the 9% service charge, the 5% late fee cap, meter standards
- [Colorado HB25-1090](https://leg.colorado.gov/bills/hb25-1090), total price disclosure that need not include the actual amount charged for utilities
- [NYC Department of Buildings: Local Law 97](https://www.nyc.gov/site/buildings/codes/ll97-greenhouse-gas-emissions-reductions.page), covered buildings, compliance periods, annual reports due May 1
- [Washington Department of Commerce: Clean Buildings](https://www.commerce.wa.gov/growing-the-economy/energy/buildings/), Tier 1 compliance dates, Tier 2 reporting, penalties
- [ENERGY STAR: Benchmark your building](https://www.energystar.gov/buildings/benchmark), Portfolio Manager, the 1 to 100 score, nearly 25% of commercial space benchmarked

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), the Maryland Collection Agency Licensing Act class action

**In practice**

- [RealPage: Utility Management](https://www.realpage.com/utility-management/), resident billing, submetering, expense management, energy, sustainability services, smart waste
- [Entrata: ResidentUtility](https://www.entrata.com/products/residentutility), utilities on one bill with rent and fees, configured for regulations
- [Entrata: Utility Expense Management](https://www.entrata.com/products/utility-expense-management), bill processing into payables, invoice audit, Portfolio Manager automation
- [Entrata: Sales Tax Audits](https://www.entrata.com/products/sales-tax-audits), contingency recovery of overpaid sales tax on utility bills
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), the utility billing add-on
