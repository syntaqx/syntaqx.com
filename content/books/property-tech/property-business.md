+++
title = "The Property Business"
description = "How rental property earns: owners, managers, residents and vendors, fees and embedded revenue, the market's size, and the core data model."
category = "Property Tech Industry"
order = 1701
part = "The Business"
tags = ["property-tech", "property-management", "business-models", "data-model", "rental-housing"]
+++

A property business sells the right to use space for a period. An apartment for twelve months, a house for a family that moved for work, a bed in a student building for an academic year, a storage unit by the month, a suite in an office park for ten years, a condo owner's vote and assessment, a vacation home for a long weekend: each is a promise of space, priced in advance, paid in installments, and governed by a contract and a body of law that changes at every state and city line. Behind almost every one of those promises stand three parties whose money must never mix: an owner who holds title and wants a return, an operator who runs the property for a fee or for itself, and a resident who pays and expects the heat to work. Every system in this volume exists to fill space, collect for it, keep it habitable, and account to the owner for every dollar, while following the rules of the place the property sits in.

The software is hard because occupancy, money and law all hang off the same few records. A lease decides who may live in a unit, what they owe on which day, which state's deposit rules apply, whose bank account the rent lands in, and what the owner's statement says at month end. A roommate leaving mid-term changes the lease, the ledger, the screening file and the renewal offer at once. This chapter is the map the rest of the volume uses: who the parties are, how each of them makes money, how big the business is, the life of a unit and of a resident, and the data model every later chapter extends. Terms will be collected in the volume's glossary.

## How to Read This Volume

The chapters follow a property from acquisition to the platform that runs it, in eight parts plus a reference. Chapters not yet published are listed by title:

- **The Business.** This chapter, then [The Software Landscape](/books/property-tech/software-landscape) (suites and point solutions, the major platforms, packaging, capital, and what to build).
- **Properties, Owners and Investors.** Portfolios, Properties & Units (the hierarchy, unit attributes and status, parking and storage as rentable spaces, addresses and parcels); Owners & Management Agreements (third-party management, fees, distributions, reserves, owner reporting and 1099s); Investors, Funds & Asset Management (entity structures, capital raising, waterfalls, data from third-party managers, valuations and benchmarks); Trust Accounting & the General Ledger (trust and deposit accounts by state, three-way reconciliation, entity ledgers, unclaimed property); and Budgets, Forecasts & Capital Projects (budgets, pro formas, job costing, renovations, draw requests, fixed assets).
- **Leasing.** Listings, Websites & Marketing (syndication, websites and search, accessibility, all-in pricing laws); Leads, CRM, Tours & the Leasing Center (guest cards, attribution, self-guided tours, centralized leasing, call recording and texting rules, reviews); Revenue Management & Pricing (lease-term and renewal pricing, and the antitrust record as design constraints); Applications & Screening (FCRA, fair housing, fair-chance and source-of-income laws, income and identity verification, fraud); The Lease (templates, addenda, e-signature, guarantors, concessions, renewals, notices and the lease state machine); and Move-In & Move-Out (inspections, keys, utility transfer, deposit itemization deadlines, damage charges).
- **Rent and Resident Money.** Charges & Resident Ledgers (recurring charges, proration, late fees, payment application order, concessions); Collecting Rent (ACH, cards, cash networks, check scanning, partial and flexible rent, and who holds the money); Resident Financial Products & Ancillary Revenue (rent reporting, rewards, marketplaces, bulk internet, revenue share); Insurance, Deposits & Guarantees (renters insurance, master policies, deposit alternatives, institutional guarantors); Utilities & Energy (resident billing, submetering, invoice processing, benchmarking laws); Subsidized & Affordable Housing (the owner side and the housing authority side); and Delinquency, Collections & Eviction (notices, filings, collection law, rental assistance).
- **Operations.** Maintenance & Work Orders (intake, triage, make-ready turns, preventive maintenance, entry notice, habitability); Vendors, Procurement & Payables (vendor compliance, purchasing, invoice approval, bill pay and payment-instruction fraud); Access, Smart Buildings & Parking (smart locks, access control, packages, towing law, resident privacy); and Resident Experience (portals, communications, amenities, surveys, retention).
- **Other Property Types.** Student Housing; Military & Specialty Housing (privatized military housing, manufactured housing, single-family and build-to-rent); Senior Living; Community Associations (HOA, condo and co-op); Commercial Property (expense recovery, percentage rent, the occupier side); Self Storage; and Short-Term Rentals.
- **The Rules.** Fair Housing; Landlord-Tenant Law as Data (state and city rules as effective-dated data, and the matrix linking each to the chapter that owns it); Records, Privacy & Audits; and Outside the US (Canada, the UK, Australia and the EU).
- **Running the Platform.** Platform Architecture (tenancy, owner and property scoping, integration models across vendors); AI in Property Management (agents, governance, cost allocation, fair housing risk); Operating Metrics (occupancy, trade-out, delinquency, turn time, NOI, and benchmarking as an antitrust risk); and Switching Platforms & Acquisitions (migrations, opening balances, trust cutover, onboarding acquired properties).
- **Reference.** The Property Tech Glossary, grouped by part.

The volume covers what property adds. The general engineering lives in the playbook, and chapters here link to it rather than repeat it: [Multi-Tenancy](/docs/architecture/multi-tenancy) (and its [tenant hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)), [Rules as Data](/docs/architecture/rules-as-data), [Effective Dating & History](/docs/database/temporal-data), [Audit Trails](/docs/architecture/audit-trails), [Addresses & Geocoding](/docs/fundamentals/addresses), [Matching, Merging & Many Sources](/docs/architecture/record-linkage), [Notifications & Consent](/docs/architecture/notifications), [Calls, Texts & Email](/docs/compliance/consumer-contact), [Electronic Signatures & Records](/docs/compliance/electronic-signatures), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Custom Fields](/docs/architecture/custom-fields), [Data Retention & Deletion](/docs/architecture/data-retention), [Automated Risk Decisions](/docs/architecture/risk-scoring), [AI Agents in the Product](/docs/architecture/ai-agents), [Customer Support Operations](/docs/operations/customer-support), [Location Tracking & Geofences](/docs/architecture/location-tracking), [Replacing a System](/docs/architecture/replacing-systems), [Money & Amounts](/docs/payments/money), [Payment States & Ledgers](/docs/payments/payment-states), [Accounting & Revenue Recognition](/docs/payments/accounting) and [PCI DSS](/docs/compliance/pci-dss). Two other volumes own topics this one leans on: [Payments](/books/payments/card-payments) for the rails rent moves on ([ACH & Bank Transfers](/books/payments/ach), [Surcharging & Fees](/books/payments/surcharging-and-fees), [Vendor Payouts](/books/payments/vendor-payouts), [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation)), and [Field Operations](/books/field-operations/field-operations-business) for sending technicians to a door ([Dispatch & the Day of Service](/books/field-operations/dispatch), [The Technician App](/books/field-operations/technician-app), [Proof of Service](/books/field-operations/proof-of-service)).

The volume is US-centric: rules are US federal, state and local law unless a passage says otherwise, and the vendors surveyed sell into US operators. The data model travels; the legal specifics (deposit limits, notice periods, screening and eviction law) need local counsel elsewhere, and Outside the US says what changes. No single vendor is the model: the vocabulary and tables are the industry's, benchmarked across several platforms, and a vendor's product name appears only where the chapter is describing that vendor.

## The System You're Building

Read end to end, the volume describes the components of a property management platform. Each has a chapter:

| Component | What it does | Where |
| --- | --- | --- |
| Tenancy and core model | Management companies, entities, properties, units, leases, ledgers | This chapter, Portfolios, Properties & Units, Platform Architecture |
| Owner accounting | Management fees, distributions, reserves, owner statements, 1099s | Owners & Management Agreements, Investors, Funds & Asset Management |
| Trust and general ledger | Money held for others, by entity and bank account, reconciled three ways | Trust Accounting & the General Ledger |
| Budgets and projects | Budgets, reforecasts, renovations, draws, fixed assets | Budgets, Forecasts & Capital Projects |
| Demand | Listings, websites, leads, tours, the leasing center | Listings, Websites & Marketing; Leads, CRM, Tours & the Leasing Center |
| Pricing | Asking rents, lease-term and renewal offers, inside legal limits | Revenue Management & Pricing |
| Applications | Screening, verification, decisions and adverse action | Applications & Screening |
| Lease engine | Documents, signatures, terms, renewals, notices, move-in and move-out | The Lease; Move-In & Move-Out |
| Resident ledger | Recurring and one-off charges, payments, application order, late fees | Charges & Resident Ledgers |
| Money in | Rent collection by every method, and who holds it in transit | Collecting Rent, and the [Payments](/books/payments/card-payments) volume |
| Resident products | Insurance, deposit alternatives, rent reporting, marketplaces, utilities | Resident Financial Products & Ancillary Revenue; Insurance, Deposits & Guarantees; Utilities & Energy |
| Programs | Subsidy, tax credit and housing authority compliance | Subsidized & Affordable Housing |
| Delinquency | Notices, payment plans, collections, eviction | Delinquency, Collections & Eviction |
| Operations | Work orders, make-ready, vendors, payables, access, amenities | Maintenance & Work Orders; Vendors, Procurement & Payables; Access, Smart Buildings & Parking; Resident Experience |
| Segment editions | Beds, allotments, care levels, associations, recoveries, liens, stays | The seven chapters of Other Property Types |
| Rules engine | Federal, state and city rules as effective-dated data | Fair Housing; Landlord-Tenant Law as Data; Records, Privacy & Audits |
| Platform | Integrations, agents, metrics, migration | Platform Architecture; AI in Property Management; Operating Metrics; Switching Platforms & Acquisitions |
| Vendors | Which layers to buy, extend or build | [The Software Landscape](/books/property-tech/software-landscape#build-buy-or-extend) |

## Who's Who

The same building looks different to each party, and the software has to serve all of them from one set of records:

| Party | Who they are | What they need from the platform |
| --- | --- | --- |
| **Owner** | Holds title: an individual, an LLC or partnership, a REIT, a fund, a housing authority, an association | Statements, distributions, budgets, approvals, tax documents |
| **Investor** | Puts capital into an owning entity without running it | Capital accounts, distributions, reporting across managers |
| **Asset manager** | Works for the owner; sets strategy, approves budgets, watches the manager | Portfolio performance against plan, the same numbers the manager sees |
| **Operator** | Runs the property day to day: an owner-operator for its own properties, or a third-party manager for a fee | Every workflow in this volume, scoped to the properties it runs |
| **Site and central staff** | Property manager, leasing agents, maintenance technicians; regional managers; central leasing, accounting and compliance teams | Queues by role across the properties they cover |
| **Resident** | The household that lives there: leaseholders, occupants, and guarantors who pay but don't live there | A portal, a ledger, a way to pay and to ask for repairs |
| **Prospect and applicant** | Someone shopping, touring or applying | Availability, an all-in price, an application, a decision with reasons |
| **Vendor** | Contractors, suppliers, utilities, insurers, screening agencies | Work orders, purchase orders, payment, compliance documents |
| **Lender, agency, regulator** | Mortgage lenders and agencies, HUD and housing authorities, state attorneys general, the FTC and CFPB, courts | Reports in their format, records on demand |

The split that shapes the data model is **owner versus operator**. Entrata's S-1 draws it in its glossary: owners are "organizations and investment firms that own the property," operators are the organizations "responsible for the day-to-day operations of the property," and an operator is either "a third-party management company or owner-operators." A third-party manager runs properties for many owners at once, so every dollar it touches belongs to someone else and every report has to cut cleanly by owner. An owner-operator is its own client, so the same platform runs with one owner, or with a handful of owning entities that are really one company.

How much of the market is professionally managed depends on size. The Census Bureau's 2021 Rental Housing Finance Survey found that about 22% of rental properties with one to four units were managed professionally, against about 84% of properties with 150 or more. Small landlords mostly manage themselves or hire a local manager; large properties almost always have an operator and a platform, which is why vendors segment by portfolio size before anything else ([The Software Landscape](/books/property-tech/software-landscape)).

## How the Money Is Made

Three ledgers sit on top of one another, and confusing them is the most common modeling mistake in the industry: the property's, the manager's and the software vendor's.

### The property's money

A property earns rent and other income and spends on operating it. The owner's question is net operating income, and the operator's statements build up to it in the same order everywhere:

```text
gross potential rent        every unit at its market or scheduled rent, all month
- vacancy loss              units nobody was paying for
- concessions               free weeks, discounts given to sign or renew
- bad debt                  rent charged and never collected
+ other income              fees, parking, storage, utility reimbursements, services
= effective gross income
- operating expenses        payroll, repairs, utilities, taxes, insurance, management fee
= net operating income      before debt service and capital spending
```

Other income is not a rounding error. The National Apartment Association's 2017 Survey of Operating Income and Expenses put other revenue at 5.4% of gross potential rent for conventional apartments and 7.7% for student housing, against vacancy losses of 6.0% and 8.1%. Those figures are dated; what has held since is the shape: fees, parking, pets, utilities and services are a real line, and the platform is where they're charged.

They're also where regulators look. On December 2, 2025, Greystar agreed to pay $24 million to settle claims by the FTC and Colorado that it advertised base rents while disclosing mandatory recurring fees (pest control, valet trash, package concierge, utility administration and certain amenities) only late in the leasing process, often after a nonrefundable application fee; the order requires a "Total Monthly Leasing Price" shown clearly and conspicuously, and the FTC chairman directed staff to begin proposing a rule on rental housing fees. For the platform, that makes every charge code a disclosure question: is it mandatory, recurring, and in the advertised price? Listings, Websites & Marketing owns the price display; Charges & Resident Ledgers owns the charge catalog.

### The manager's money

A third-party manager earns fees defined by a **management agreement** with each owning entity, and the platform computes them from the property's ledger. Public agreements filed with the SEC show the shape. Bell Partners' 2010 agreement to manage a 201-unit Nashville property for a Bluerock joint venture sets:

- **A base fee of 3% of gross receipts,** paid monthly, where gross receipts are cash-basis receipts including rent, parking, forfeited deposits, utility reimbursements and ancillary income, and exclude refundable security deposits, loan proceeds, capital contributions, sale proceeds and most insurance proceeds.
- **A construction management fee of 5%** of the completed cost of capital projects over $10,000 per item.
- **Reimbursement of on-site payroll,** because the property's employees are the manager's employees, paid back by the owner as an operating expense.
- **A fee on ancillary contracts:** 10% of upfront payments the manager negotiates for cable, internet, phone and laundry agreements.
- **Owner's money held in trust,** never commingled with the manager's, with security deposits remaining the owner's property subject to law, and standard monthly reports (balance sheet, budget comparison, rent roll, delinquency) due within 15 days of month end.

A 2020 agreement between AIR's management company and one of its owning partnerships, also on file with the SEC, has the same skeleton: a management fee and a construction management fee set in an exhibit, on-site staff employed by the manager with costs "reimbursable by Owner," and a separate security deposit account "used only for maintaining Tenant security deposits." Single-family and small-portfolio managers add per-lease leasing and renewal fees, markups on maintenance and owner-paid setup fees, which is why Owners & Management Agreements treats fee definitions as versioned data per agreement, the same way the Field Operations volume treats [franchise royalties](/books/field-operations/field-operations-business#branches-regions-and-the-org-chart): each agreement defines its base its own way, and the fee run is a computation over the ledger that has to be reproducible years later.

### The software's money

Property software is priced per unit or per plan and earns increasingly from transactions that residents make. AppFolio's 10-K for 2025 reports $950.8 million of revenue, of which $211.5 million was subscription services and $721.5 million was Value Added Services (electronic payments, tenant screening, insurance-related risk mitigation and other services), charged per use as a percentage of the transaction or a flat fee per transaction. Entrata's S-1 describes its revenue in the same two families: subscription-related revenue (monthly fees for its operating system, plus payment processing, rent reporting and utility services) and "Embedded Technology Solutions revenue, such as insurance and resident screening." RealPage's last public 10-K, for 2020, already listed resident payments and renters insurance among its products.

That revenue model reaches into the property's ledger. A convenience fee on a card payment, a screening fee paid by an applicant, a renters insurance premium, a monthly rent-reporting charge or a bulk internet bill is money a resident pays, sometimes through the owner's ledger and sometimes directly to the vendor, and sometimes with a revenue share back to the owner or the manager. My rule: every such flow is modeled as who pays, who collects, who keeps what, and under which contract, as data the platform can disclose and audit, never as a hard-coded fee. Resident Financial Products & Ancillary Revenue and Collecting Rent own those flows; [Surcharging & Fees](/books/payments/surcharging-and-fees) has the card network rules on passing card costs to the payer.

## How Big It Is

The Census Bureau counts the stock; the vendors' audited filings count the software:

| Measure | Figure | Source |
| --- | --- | --- |
| Rental properties and units | 19.3 million properties holding 49.5 million units (2021 RHFS) | Census and HUD |
| Owned by individuals | About 70% of rental properties, but 38% of rental units | 2021 RHFS |
| Owned by LLCs, LPs and LLPs | About 15% of properties, but 40% of units; 67% of properties with 150+ units | 2021 RHFS |
| Rental properties with a mortgage | About 41%, up from 35% in 2018 | 2021 RHFS |
| Renter-occupied share of housing | 31.3% of the inventory; rental vacancy 7.3%; homeownership 65.0% (second quarter 2026) | Census Housing Vacancies and Homeownership |
| US multifamily units | About 23.4 million as of 2023, per NMHC data cited in Entrata's S-1 | NMHC, via S-1 |
| Community associations | 373,000 associations, 29.6 million homes, 78.1 million residents (2025) | Foundation for Community Association Research |
| One suite's footprint | 2,529,199 units on Entrata's platform (June 30, 2026), described as about 10% of US multifamily | Entrata S-1 |
| Another's | 9.4 million units under management and 22,096 property management customers on AppFolio (December 31, 2025) | AppFolio 10-K |

Two shapes matter for the platform. **Ownership is long-tailed:** most properties are small and individually owned, while most units in large buildings sit in entities, often several layers of them, which is why the model separates the property from the entity that owns it and the entities from each other. **Housing is a minority of the market's complexity:** associations, commercial space, storage and short-term rentals each run on their own contracts and laws, and every one of them has a chapter.

## The Life of a Unit

A unit cycles through the same states for decades, and each state is a different answer to "can I rent it, and is anyone paying?":

- **Down.** Not rentable: under renovation, damaged, used as a model or an office, or held for an employee. Down units drop out of available inventory but stay in the count of units the owner owns, and the reason is recorded, because occupancy figures and lender reports depend on which units were excluded and why.
- **Vacant, not leased.** Rentable and empty. Revenue management prices it, marketing syndicates it, and leasing tours it. Every day here is vacancy loss.
- **Vacant, leased.** A future lease is signed and the unit is held for a move-in date. The make-ready has to finish before then.
- **Occupied.** A current lease, a household living there, recurring charges posting, maintenance requests arriving.
- **Occupied, on notice.** The household has given notice or the lease isn't being renewed. The unit is back on the market while someone still lives in it, so it can be pre-leased: occupied and leased to the next household at once.
- **Turn.** Move-out inspection, deposit accounting, then the make-ready (paint, clean, repair, replace) and back to vacant.

Occupancy and leased percentage are two different numbers built from these states (one counts who lives there today, the other who is committed to), and the platform derives both from leases and unit status rather than storing a single unit status that has to be kept in sync by hand. Operating Metrics defines them; Portfolios, Properties & Units owns the unit's own status; Maintenance & Work Orders owns the turn.

## The Life of a Resident

**Prospect.** A lead arrives from a listing site, the property website, a call, a walk-in or a referral, and becomes a guest card with a source. Attribution, follow-up and tour scheduling start here, and so do the rules on recording calls and texting people (Leads, CRM, Tours & the Leasing Center).

**Applicant.** The household applies: each adult is screened, income and identity verified, and a decision made against written criteria. An applicant denied or approved on worse terms because of a screening report is owed an adverse action notice under the Fair Credit Reporting Act, and every criterion is a fair housing question (Applications & Screening; Fair Housing).

**Leased.** The lease is generated from templates and addenda, priced from the revenue management offer, signed electronically by every leaseholder and any guarantor, and its recurring charges scheduled. The household is now a future resident (The Lease).

**Moved in.** Keys or access credentials issued, the unit's condition recorded, utilities transferred, renters insurance verified, the deposit or its alternative in place, the first month prorated (Move-In & Move-Out; Insurance, Deposits & Guarantees).

**Resident.** Most of a resident's life and most of the platform's load: rent posting on the first, payments by every method, late fees on a schedule the state allows, repair requests, package notices, amenity bookings, roommates added and removed, a transfer to another unit (Charges & Resident Ledgers; Collecting Rent; Maintenance & Work Orders; Resident Experience).

**Renewal or notice.** Months before the term ends, the household gets a renewal offer, priced inside any rent cap, or gives notice. A renewal is a new lease for the same household on the same unit, not an edit to the old one, so the old terms stay provable (Revenue Management & Pricing; The Lease).

**Moved out and final account.** Move-out inspection, damage charges, and a deposit accounting due within a deadline set by state law; then a final balance refunded, paid or sent to collections. A household that left owing money may come back years later as an applicant, with history the screening criteria may or may not be allowed to use (Move-In & Move-Out; Delinquency, Collections & Eviction).

## The Core Data Model

Every platform in this market converges on the same concepts under different names. This volume uses one set, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **tenant** | `tenants` | A management company (or a self-managing owner) using the platform; the isolation boundary |
| **legal entity** | `legal_entities` | A party that holds title, signs, banks and files taxes: the manager, an owning LLC, a fund, an association, an individual owner |
| **ownership share** | `ownership_shares` | Which entity owns how much of another, over time |
| **portfolio** | `portfolios` | The tenant's grouping tree: regions, owner groups, funds |
| **property** | `properties` | A managed asset with one owner of record and one jurisdiction: an apartment community, a scattered-site group of houses, an association, a shopping center, a storage facility |
| **building** | `buildings` | One structure inside a property |
| **unit** | `units` | What is leased and counted for occupancy: an apartment, a house, a suite, a storage unit, a lot |
| **rentable space** | `rentable_spaces` | Space rented alongside a unit: a parking space, a garage, a storage locker |
| **person** | `people` | A resident-side human: applicant, leaseholder, occupant, guarantor |
| **household** | `households` | The people who live together, kept across renewals and transfers |
| **lease** | `leases` | The contract for a unit for a term, with a landlord of record |
| **lease member** | `lease_members` | A person's role on a lease, over time |
| **charge code** | `charge_codes` | The tenant's catalog of what can be charged |
| **charge schedule** | `lease_charge_schedules` | A recurring charge the lease promises: rent, pet rent, parking |
| **charge** | `charges` | An amount posted to a lease's ledger, from a schedule or one-off |
| **payment application** | `payment_applications` | What part of a payment paid which charge |
| **vendor** | `vendors` | A business the operator buys from and pays |
| **work order** | `work_orders` | Maintenance to be done at a unit or a common area |

The split that matters most is **unit versus lease versus household.** The unit is the space, which outlives every lease on it. The lease is the contract, with a term, a landlord of record and a price, and it's never edited into a different deal: a renewal or a transfer is a new lease. The household is the people, who outlive any one lease when they renew or move to a bigger unit, and whose membership changes during a lease when a roommate leaves. Designs that hang residents directly off the unit, or rent directly off the resident, break on the first transfer, the first mid-lease roommate change, and the first renewal whose price has to be compared with the expiring one.

Three more distinctions recur in every chapter. **The tenant is the operator, not the owner.** A management company is a tenant in the [multi-tenancy](/docs/architecture/multi-tenancy) sense, and the owners it works for are legal entities inside it, with owner users given scoped grants to their own properties ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)). An owner who uses two managers appears in two tenants, each holding its own records; combining them is the asset manager's job in Investors, Funds & Asset Management, not a cross-tenant join. **A schedule is a promise; a charge is a fact.** `lease_charge_schedules` says what the lease will bill and when; `charges` holds what was actually posted, each one immutable and corrected only by a reversing charge. **The resident ledger is a view over the double-entry ledger,** not a balance column: charges and payments post balanced transactions to a receivable per lease, and payments are applied to charges rather than assigned to them, exactly as [Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned) describes, so this volume uses that ledger and the [Payments core model](/books/payments/card-payments#the-core-data-model) rather than inventing its own.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)). Every table carries `tenant_id`, enforced by row-level security; columns each chapter owns (addresses, screening results, deposit terms, GL accounts) are added there:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE tenants (                   -- a management company, or an owner that self-manages
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE legal_entities (            -- who holds title, signs, banks and files taxes
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL REFERENCES tenants (id),
  role        TEXT NOT NULL CHECK (role IN ('manager', 'owner', 'fund', 'association')),
  legal_name  TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('individual', 'llc', 'lp', 'corporation',
                'trust', 'nonprofit', 'government')),
  formed_in   TEXT,                      -- ISO 3166-2 of the state of formation, e.g. 'US-DE'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ownership_shares (          -- who owns an entity, and how much, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  entity_id    UUID NOT NULL REFERENCES legal_entities (id),   -- the entity owned
  holder_id    UUID NOT NULL REFERENCES legal_entities (id),   -- the owner
  share        NUMERIC(9, 8) NOT NULL CHECK (share > 0 AND share <= 1),
  valid_during DATERANGE NOT NULL,
  CHECK (entity_id <> holder_id),
  EXCLUDE USING GIST (entity_id WITH =, holder_id WITH =, valid_during WITH &&)
);

CREATE TABLE portfolios (                -- the tenant's grouping tree
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  parent_id UUID REFERENCES portfolios (id),
  name      TEXT NOT NULL
);

CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  portfolio_id    UUID NOT NULL REFERENCES portfolios (id),
  owner_entity_id UUID NOT NULL REFERENCES legal_entities (id),  -- holds title
  name            TEXT NOT NULL,
  property_type   TEXT NOT NULL CHECK (property_type IN ('multifamily', 'single_family',
                    'manufactured_housing', 'association', 'commercial', 'mixed_use',
                    'self_storage', 'short_term')),
  subdivision     TEXT NOT NULL,         -- ISO 3166-2, e.g. 'US-CA'; rules resolve from here
  time_zone       TEXT NOT NULL,         -- IANA; sets the property's business date
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buildings (                 -- a scattered-site property has one per house
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties (id),
  name        TEXT NOT NULL,
  year_built  INT
);

CREATE TABLE units (                     -- what is leased and counted for occupancy
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  building_id  UUID REFERENCES buildings (id),
  unit_number  TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('dwelling', 'commercial_suite', 'storage_unit',
                 'lot')),
  status       TEXT NOT NULL CHECK (status IN ('rentable', 'down', 'model', 'employee',
                 'non_revenue')),        -- occupancy and leased state derive from leases
  status_reason TEXT,                    -- required unless rentable
  UNIQUE (tenant_id, property_id, unit_number)
);

CREATE TABLE rentable_spaces (           -- rented alongside a unit
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties (id),
  kind        TEXT NOT NULL CHECK (kind IN ('parking', 'garage', 'storage', 'other')),
  label       TEXT NOT NULL,             -- 'P2-114'
  UNIQUE (tenant_id, property_id, kind, label)
);

CREATE TABLE people (                    -- resident-side humans; staff are not people here
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  legal_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE households (                -- kept across renewals and transfers
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leases (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  unit_id             UUID NOT NULL REFERENCES units (id),
  household_id        UUID NOT NULL REFERENCES households (id),
  landlord_entity_id  UUID NOT NULL REFERENCES legal_entities (id),  -- as of signing
  renewal_of_lease_id UUID REFERENCES leases (id),
  status              TEXT NOT NULL CHECK (status IN ('draft', 'out_for_signature', 'signed',
                        'current', 'notice_given', 'ended', 'cancelled')),
  starts_on           DATE NOT NULL,
  ends_on             DATE,              -- last day of the term as written; null: periodic
  moved_in_on         DATE,
  moved_out_on        DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE lease_members (             -- roommates join and leave mid-term
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  lease_id                   UUID NOT NULL REFERENCES leases (id),
  person_id                  UUID NOT NULL REFERENCES people (id),
  role                       TEXT NOT NULL CHECK (role IN ('leaseholder', 'occupant',
                               'guarantor')),
  is_financially_responsible BOOLEAN NOT NULL,
  valid_during               DATERANGE NOT NULL,
  CHECK (role <> 'occupant' OR NOT is_financially_responsible),
  CHECK (role <> 'guarantor' OR is_financially_responsible),
  EXCLUDE USING GIST (lease_id WITH =, person_id WITH =, valid_during WITH &&)
);

CREATE TABLE charge_codes (              -- rent, pet rent, parking, late fee, concession
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  code      TEXT NOT NULL,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL CHECK (category IN ('rent', 'fee', 'deposit', 'utility',
              'ancillary', 'concession')),
  UNIQUE (tenant_id, code)
);

CREATE TABLE lease_charge_schedules (    -- what the lease promises to bill
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  charge_code_id    UUID NOT NULL REFERENCES charge_codes (id),
  rentable_space_id UUID REFERENCES rentable_spaces (id),  -- the space this rents, if any
  amount            BIGINT NOT NULL,     -- minor units; negative for a recurring concession
  currency          CHAR(3) NOT NULL,
  frequency         TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'annual')),
  valid_during      DATERANGE NOT NULL,
  EXCLUDE USING GIST (rentable_space_id WITH =, valid_during WITH &&)
    WHERE (rentable_space_id IS NOT NULL)  -- one renter per space at a time
);

CREATE TABLE charges (                   -- posted; never edited, only reversed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL REFERENCES leases (id),
  charge_code_id     UUID NOT NULL REFERENCES charge_codes (id),
  schedule_id        UUID REFERENCES lease_charge_schedules (id),  -- null for one-off charges
  amount             BIGINT NOT NULL,
  currency           CHAR(3) NOT NULL,
  service_period     DATERANGE,          -- the period a recurring charge covers
  posted_on          DATE NOT NULL,      -- business date in the property's zone
  due_on             DATE NOT NULL,
  reverses_charge_id UUID REFERENCES charges (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, schedule_id, service_period)  -- the nightly run can't post rent twice
);

-- Money in is a row in the Payments volume's payments table, scoped by tenant_id,
-- with the lease and payer this volume adds.
ALTER TABLE payments
  ADD COLUMN lease_id        UUID REFERENCES leases (id),
  ADD COLUMN payer_person_id UUID REFERENCES people (id);

CREATE TABLE payment_applications (      -- what each payment paid for
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments (id),
  charge_id  UUID NOT NULL REFERENCES charges (id),
  amount     BIGINT NOT NULL CHECK (amount <> 0),  -- negative reverses an application
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vendors (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  legal_name TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE work_orders (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  property_id            UUID NOT NULL REFERENCES properties (id),
  unit_id                UUID REFERENCES units (id),      -- null for common areas
  lease_id               UUID REFERENCES leases (id),     -- the household that asked, if any
  source                 TEXT NOT NULL CHECK (source IN ('resident', 'staff', 'inspection',
                           'preventive', 'make_ready')),
  priority               TEXT NOT NULL CHECK (priority IN ('emergency', 'urgent', 'routine')),
  status                 TEXT NOT NULL CHECK (status IN ('open', 'scheduled', 'in_progress',
                           'on_hold', 'completed', 'cancelled')),
  assigned_vendor_id     UUID REFERENCES vendors (id),    -- null when staff do the work
  permission_to_enter    BOOLEAN,        -- the resident's answer; notice rules are separate
  is_resident_chargeable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at           TIMESTAMPTZ
);
```

The lease states are this volume's vocabulary, not one vendor's; The Lease defines the transitions and maps them to the platforms' names, which differ more than the states do. A unit's occupancy (vacant, occupied, on notice, pre-leased) is never a column: it's a query over leases and their dates, so it can't drift from the leases that define it.

Design decisions behind it:

- **Property, not tenant, is the rule boundary.** Deposit limits, late fee caps, notice periods, rent control and fee disclosure rules attach to a jurisdiction, and a property sits in exactly one, so `property_id` goes on every row whose rules can differ and the property's `subdivision` (refined to city and county from its address in Portfolios, Properties & Units) is where Landlord-Tenant Law as Data starts resolving. Configuration also inherits down the portfolio tree with explicit overrides, as [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) describes.
- **Separate the owner of record from the people behind it.** `properties.owner_entity_id` is the entity on the deed and, usually, the landlord on the lease; `ownership_shares` says who owns that entity, a chain that Investors, Funds & Asset Management walks upward to funds and investors and that Owners & Management Agreements uses for distributions and 1099s. An individual owner is a legal entity of type `individual`, because they hold title and receive tax forms like any other owner. Shares are effective-dated ([Effective Dating & History](/docs/database/temporal-data#effective-dated-rows)), and a deferred check keeps each entity's shares summing to 1 on every date.
- **Units are what occupancy counts; rentable spaces ride along.** A parking space or a storage locker is rented by putting it on a lease's charge schedule, and the exclusion constraint stops two households renting it at once. A self-storage unit or a manufactured-home lot is a `unit` in its own right, because it's leased alone and counted; Student Housing adds beds under units, and Commercial Property adds suites' measured areas and recoveries.
- **Leases are new rows, never rewrites.** A renewal points at the lease it renews; a transfer ends one lease and starts another for the same household. That keeps every signed price, term and landlord provable, which is what renewal caps, rent control and fee disputes ask for.
- **People are residents; staff are users.** `people` holds applicants, leaseholders, occupants and guarantors. Staff, owner users and vendor users are accounts with grants, added in Platform Architecture, so a technician is never a `person_id`. Minors are occupants and never leaseholders.
- **Money is the Payments model.** Amounts in minor units with an explicit currency; every charge and every payment application posts a balanced ledger transaction; corrections are reversals ([Append-Only Records](/docs/payments/payment-states#append-only-records), [Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)). The resident ledger, the owner's ledger and each entity's general ledger are views over the same entries, which Trust Accounting & the General Ledger turns into bank accounts held in trust.
- **Business dates are the property's.** Rent is due on the first in the property's time zone, and `posted_on` and `due_on` are dates there ([Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays)); instants (`created_at`, `completed_at`) are UTC.
- **Resolve identities once.** Properties, parcels and owning entities arrive from deeds, lenders, other managers and data vendors under different identifiers. Keep a crosswalk of external IDs and match before creating ([Matching, Merging & Many Sources](/docs/architecture/record-linkage)); RealPage's July 2026 acquisition of Cherre, whose product "connects, resolves, and governs fragmented data," shows how central that problem has become.
- **Emit life-cycle events.** `lease.signed`, `lease.moved_in`, `lease.notice_given`, `lease.moved_out`, `charge.posted`, `payment.applied` and `work_order.completed` are what fee runs, owner reporting, notifications and integrations subscribe to ([Events & Async Messaging](/docs/architecture/events)).

Each later chapter extends a defined part of this spine:

| Table | Extended by |
| --- | --- |
| `tenants`, `portfolios` | Platform Architecture (users, grants, integrations); Switching Platforms & Acquisitions |
| `legal_entities`, `ownership_shares` | Owners & Management Agreements (agreements, fees, distributions, reserves); Investors, Funds & Asset Management (funds, capital accounts, waterfalls); Trust Accounting & the General Ledger (GL accounts, bank accounts) |
| `properties`, `buildings`, `units`, `rentable_spaces` | Portfolios, Properties & Units (addresses, parcels, attributes, status history); Budgets, Forecasts & Capital Projects; Access, Smart Buildings & Parking; each Other Property Types chapter |
| `people`, `households` | Leads, CRM, Tours & the Leasing Center (prospects, guest cards); Applications & Screening; Subsidized & Affordable Housing (household composition and income); Records, Privacy & Audits |
| `leases`, `lease_members` | The Lease (documents, signatures, states, notices); Move-In & Move-Out; Revenue Management & Pricing (offers); Delinquency, Collections & Eviction |
| `charge_codes`, `lease_charge_schedules`, `charges` | Charges & Resident Ledgers (proration, late fees, application order); Insurance, Deposits & Guarantees; Utilities & Energy; Resident Financial Products & Ancillary Revenue |
| `payments`, `payment_applications` | Collecting Rent, with the [Payments](/books/payments/card-payments#the-core-data-model) volume |
| `vendors`, `work_orders` | Maintenance & Work Orders (intake, triage, turns, inspections); Vendors, Procurement & Payables (compliance, purchase orders, invoices, payouts) |

What goes wrong most often is building for apartments and bolting on everything else: a model with residents hanging off units can't hold a guarantor, a by-the-bed lease, a storage unit rented with no apartment, or an association owner who pays assessments and signs no lease. My rule: decide the shape of every property type early, even if you build one.

## Auditing

The records in this chapter are the ones owners, residents, auditors and courts ask about later:

- **Ownership and authority.** Who owned each entity on each date, who was landlord of record on each lease, and which management agreement was in force. Distributions, 1099s, legal notices and eviction filings all depend on getting the party right as of a date.
- **The lease as signed.** Every term, price, addendum and signature as executed, with the renewal chain intact, so a rent increase can be checked against the cap in force when it was offered and a fee against what was disclosed.
- **Every money movement.** Charges, reversals and payment applications are append-only, with the user or job that posted them and the reason for every reversal, so any resident balance or owner statement can be rebuilt from its entries.
- **Status changes on units and work orders.** A unit taken down, a work order closed, permission to enter given: occupancy reports, habitability disputes and entry-notice claims turn on when and by whom.

The mechanics (typed actors, append-only history, snapshots) are in [Audit Trails](/docs/architecture/audit-trails); which records each regulator asks for, and for how long, is in Records, Privacy & Audits.

## What This Means for the System You Build

- **Make the management company the tenant** and the owners legal entities inside it, with owner access as scoped grants, never as separate tenants.
- **Separate the owner of record from the people behind it,** with effective-dated ownership shares that chain upward to funds and investors.
- **Keep unit, lease and household apart:** the space, the contract and the people each have their own life, and renewals and transfers are new leases.
- **Derive occupancy from leases** and store only the unit's own rentable status with a reason.
- **Treat a recurring charge as a schedule and a posted charge as a fact,** posted once per period and corrected only by reversal.
- **Use the Payments ledger:** minor units, double entry, payments applied to charges, resident and owner ledgers as views over the same entries.
- **Put `property_id` on every row whose rules can differ,** and resolve law from the property's jurisdiction.
- **Model every fee and revenue share as data:** who pays, who collects, who keeps what, under which agreement, and whether it's in the advertised price.
- **Support every property type in the core,** even if you sell to one first.
- **Emit life-cycle events** and let fee runs, owner reporting and integrations consume them.

## References

**Reference**

- [HUD: 2021 Rental Housing Finance Survey findings](https://archives.hud.gov/news/2022/pr22-242.cfm), 19.3 million rental properties and 49.5 million units, ownership by individuals and LLCs or partnerships, professional management by size, mortgage share
- [Census Bureau: Quarterly Residential Vacancies and Homeownership, Second Quarter 2026 (PDF)](https://www.census.gov/housing/hvs/files/currenthvspress.pdf), rental vacancy 7.3%, homeownership 65.0%, renter-occupied units 31.3% of the inventory (July 28, 2026)
- [NAA: Key Takeaways from the 2017 Survey of Income & Expenses](https://naahq.org/node/3100), other revenue and vacancy loss as a share of gross potential rent, conventional and student housing
- [National Law Review: U.S. Surpasses 373,000 Community Associations](https://natlawreview.com/press-releases/us-surpasses-373000-community-associations-housing-model-reaches-new-heights), the Foundation for Community Association Research's 2025 Statistical Review (April 1, 2026)
- [Multifamily Dive: Greystar settles FTC and Colorado rental fee lawsuit](https://www.multifamilydive.com/news/greystar-ftc-colorado-rental-fee-lawsuit/806960/), the $24 million settlement, the fees involved, the Total Monthly Leasing Price requirement and the FTC's rulemaking direction (December 2025)

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), definitions of owners, operators and residents; units on the platform; revenue families; NMHC's 23.4 million multifamily units
- [AppFolio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1433195/000143319526000011/appf-20251231.htm), units under management, customers, revenue by subscription and Value Added Services, per-transaction pricing
- [RealPage: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/1286225/000128622521000007/rp-20201231.htm), resident payments and renters insurance among its products
- [Bluerock Enhanced Multifamily Trust: Property management agreement with Bell Partners (2010)](https://www.sec.gov/Archives/edgar/data/1442626/000089180410005006/exhibit1037.htm), a 3% base fee on cash gross receipts, inclusions and exclusions, a 5% construction fee, reimbursed payroll, ancillary contract fees, trust handling and monthly reports
- [Aimco OP: Property management agreement (2020)](https://www.sec.gov/Archives/edgar/data/1820878/000119312520286288/d894747dex1011.htm), management and construction fees by exhibit, reimbursable on-site personnel, a separate security deposit account

**In practice**

- [RealPage: RealPage acquires Cherre](https://www.realpage.com/news/realpage-acquires-cherre/), resolving real estate records across identifiers (July 14, 2026)
