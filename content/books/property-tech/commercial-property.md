+++
title = "Commercial Property"
description = "Office, retail and industrial leasing: measured space, CAM and NNN recovery, percentage rent, escalations, flex space, and ASC 842 on the occupier side."
category = "Property Tech Industry"
order = 1729
part = "Other Property Types"
tags = ["property-tech", "commercial", "expense-recovery", "lease-accounting", "coworking"]
+++

A commercial lease rents space to a business, not a household. The suite in an office tower, the storefront in a shopping center and the bay in a distribution building are leased for five, ten or fifteen years to a company that negotiated every clause with a broker and a lawyer, and the rent is rarely one number. The tenant pays base rent that steps up on a schedule or with an index, a share of the building's operating expenses, taxes and insurance billed monthly as estimates and trued up once a year, sometimes a percentage of its own sales, and it got months of free rent and an improvement allowance to sign. The landlord's software has to measure the space, keep a decade of negotiated exceptions straight, and produce a reconciliation that a tenant's auditor will try to take apart.

That changes the model from [The Property Business](/books/property-tech/property-business#the-core-data-model) in specific places. The lessee is a legal entity, not a household. A lease covers one or more suites that can grow and shrink by amendment, so the lease is amended over its life instead of being replaced at renewal. Rent depends on measured area, and area depends on a published measurement standard. Recurring charges include estimates that are wrong by design until the year-end reconciliation fixes them. Statutes written for residential tenancies mostly don't reach a business tenant, so the lease document becomes the rulebook: caps, exclusions, gross-ups and audit rights are contract terms per lease, not law per jurisdiction. And the same chapter has a second posture: a corporate occupier running its own leases as a lessee, where the job is lease administration and ASC 842 or IFRS 16 accounting rather than billing. Flex space and coworking sit between the two, selling memberships and meeting-room hours inside commercial buildings.

## How the Platforms Do It

Commercial is an edition of most multifamily suites and the core business of a few specialists. What each vendor's own pages say about the landlord side, as of October 2026:

| Vendor | Commercial capabilities on its own pages |
| --- | --- |
| **Entrata** (Commercial) | CAM, insurance and tax expenses pooled by square feet, with each tenant's share and monthly and annual charges; automated triple net reconciliations; lease abstracts; clause and exclusion tracking; tenant insurance compliance; commercial rent roll; tenant portal with permissions |
| **RealPage** (Commercial) | CAM calculation, billing and reconciliation; percentage rent calculated from tenant sales reported through the tenant portal; CPI escalations; scheduled rent postings; late fee and vacancy loss calculations; tenant portal where tenants pay invoices and upload insurance certificates |
| **Yardi Breeze** (Commercial) | Triple net, gross or combined leases; custom expense pools with caps; estimates posted monthly, quarterly or annually for later reconciliation; percentage rent and retail sales tracking; escalations; lease expiration tracking; a tenant portal and app as a Premier add-on; $2 per unit per month with a $200 monthly minimum on an annual agreement |
| **MRI Software** | Recoveries for office, industrial and retail; a retail product that automates "recoveries, percentage rent, and breakpoints"; lease abstraction; tenant portal; for occupiers, lease management with critical dates and lease accounting |
| **AppFolio** | "Common Area Maintenance tracking and reconciliation" in its Core plan |
| **Rent Manager** | CAM recovery with "commercial recoverable expenses" charged back with an optional markup; CAM reconciliation by pro-rata share; retail sales and commercial rent roll reports; charge escalations |

Three patterns show up across them. **Recoveries are pools.** Entrata pools CAM, insurance and tax by square feet, Yardi Breeze lets a manager define custom pools with caps, Rent Manager reconciles recoverable expenses by pro-rata share, and MRI describes applying "each tenant's unique recoveries profile" to the pools. **Estimates are ordinary recurring charges.** MRI stores the monthly estimates in "the recurring charges table on each lease" and posts the year-end difference as a one-time charge or credit, which is the [core model's](/books/property-tech/property-business#the-core-data-model) schedule-and-charge split applied to recoveries. **Tenants feed the system.** RealPage and Yardi Breeze collect retail sales through the tenant portal for percentage rent, and RealPage takes insurance certificate uploads there.

MRI's recoveries write-up is the clearest public description of the annual cycle: build next year's budget, load expense pools from the general ledger, apply each tenant's recovery terms, bill monthly estimates, then reconcile "a few months after year-end close" against actuals and post the difference. Its retail product has handled breakpoint mechanics for a long time: a 2014 MRI release describes a percentage rent calculator covering "prorated breakpoints, cumulative and noncumulative methods, and estimated payments and offsets."

Leasing itself often runs in a separate system. **VTS** sells a leasing product that "manages the end-to-end leasing pipeline, deal tracking, and portfolio analytics," alongside market data, tenant experience and AI products, according to an industry analyst profile (VTS's own site refused automated fetches). Commercial listing marketplaces such as Yardi's CommercialCafe, which describes "370K+ verified and up-to-date listings" of office, industrial, retail and coworking space, sit in front of the pipeline. The occupier side has its own specialists (Visual Lease, CoStar Real Estate Manager, FinQuery, MRI) covered in [The Occupier Side](#the-occupier-side), and flex operators have theirs (Yardi Kube) in [Flex Space and Coworking](#flex-space-and-coworking). [The Software Landscape](/books/property-tech/software-landscape#specialists-by-segment) places commercial among the segments where specialists lead.

## Commercial Leases

### Lease Structures: Gross to Triple Net

The industry names leases by who pays operating costs:

- **Full-service gross.** The landlord pays operating expenses, taxes and insurance out of a single rent. Many office leases are "gross" only above a base: the tenant pays its share of increases over a base year (below).
- **Modified gross.** Some costs are in the rent and others are passed through, in whatever split the parties negotiated: electricity separately metered, janitorial excluded, taxes over a base year.
- **Net, and triple net (NNN).** The tenant pays base rent plus its share of the three big cost families: common area maintenance (CAM), real estate taxes and property insurance. Retail and industrial lean this way. In an absolute net lease the tenant also bears structural and capital items.

MRI's summary is the useful one for software: in a net lease the tenant pays certain operating costs on top of base rent, while in a gross lease the landlord covers them out of a flat rent. My rule: store the label, but never compute from it. The label is a summary for people; the money comes from the lease's actual recovery terms per pool, because two "NNN" leases in the same center routinely differ in caps, exclusions, admin fees and which pools they join.

### Long Terms, Options and Critical Dates

A commercial lease is long and full of rights that expire. An office lease filed with the SEC in 2022 runs 156 months from a commencement that is "the later to occur" of the landlord's work being substantially complete or a fixed date; gives the tenant two options to extend for five years each, exercisable by notice "not less than 12 months prior to the scheduled expiration"; prices the extension at fair market rent with a floor; and grants a right of first refusal on two other floors. Each of those is a date somebody has to act on, and missing an option window can cost a tenant its renewal or a landlord its leverage.

The common clause families, each with dates attached:

- **Options:** renewal, extension, expansion, contraction, early termination (often with a fee), purchase.
- **Rights over other space:** right of first refusal, right of first offer, must-take space.
- **Retail protections:** exclusive use, co-tenancy (rent relief if anchors leave), radius restrictions, operating covenants and go-dark rights, relocation rights.
- **Money dates:** rent commencement (which can differ from lease commencement), escalation dates, abatement periods, reconciliation and audit deadlines, sales report due dates, certificate of insurance renewals.

Every one of these becomes a **critical date** with a window, an owner and a status. The deadline is computed from the clause and stored, the way [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) describes, so an alert fires off a stored date rather than a calculation re-run on the day it matters.

### Abstracts and Clause Tracking

A **lease abstract** is the structured summary of a long document: parties, premises, dates, rent schedule, recovery terms, options and the clauses above, each pointing back to the section it came from. Entrata advertises "succinct and customized lease abstracts" with clause and exclusion tracking; MRI and Visual Lease sell machine abstraction (Visual Lease's runs on "CoStar's Lease LLM"), and an analyst profile lists lease abstraction among VTS's AI capabilities. My rule for machine abstraction: the model proposes, a person verifies, and every abstracted field keeps its source section, the verifier and the time, because the abstract drives billing and the document still wins any dispute ([AI Agents in the Product](/docs/architecture/ai-agents#decide-in-code)).

Amendments are the commercial lease's normal life. A ten-year lease picks up an expansion, an extension, a rent reset and a relocation, each a signed amendment. Unlike the multifamily core, where a renewal is a new lease ([Renewals](/books/property-tech/the-lease#renewals)), a commercial extension usually amends the same lease, and keeping one lease row matters: base years, cumulative caps, straight-line schedules and the tenant's audit history all run across amendments. Each amendment is a record, and every term it changes is a new effective-dated row pointing at it.

## Measuring Space

Commercial rent is quoted per square foot (or square meter) per year, and recoveries are shared by area, so area is money. BOMA publishes the standards most US landlords cite, each an ANSI standard with its own edition history, as of October 2026: Office (ANSI/BOMA Z65.1, current edition 2024), Industrial (Z65.2, 2025), Gross Areas (Z65.3, 2024), Multi-Family and Hospitality (Z65.4, 2023), Retail (Z65.5, 2025) and Mixed-Use (Z65.6, 2026). BOMA says the office standard's primary purpose "is to calculate Rentable Area," and that the industrial standard "generates multiple Load Factors for various shared space types."

The vocabulary:

- **Usable area** is what the tenant occupies: the suite inside its demising walls.
- **Rentable area** is usable area plus the tenant's allocated share of shared space (floor corridors, restrooms, lobbies, building amenities).
- **Load factor** (or R/U ratio) is rentable divided by usable. A suite of 10,000 usable square feet at a 1.15 load factor rents as 11,500.

Three consequences for the data:

- **A measurement carries its standard and edition.** The same floor measured under two editions gives different numbers, and a landlord re-measuring a building under a newer standard changes every tenant's rentable area and pro-rata share at once. Measurements are effective-dated, with the standard on each row.
- **The lease's number can differ from the building's.** Leases often stipulate area and shares. The 2022 office lease above states 38,258 rentable square feet and a proportionate share "agreed and deemed to be 15.16%"; a 2014 restaurant lease computes the share as the premises' floor area (2,434 square feet) over the building's (8,983 square feet), about 27.1%, and lets the landlord change allocation methods on 30 days' notice. The system stores the measured area, the lease's agreed area, and the share method, and computes from whichever the lease says.
- **Pools have their own denominators.** A tenant's share of a retail center's CAM pool may divide by the area of the shops in that pool, excluding anchors who pay under their own agreements; its share of the tax pool may divide by the whole center.

## Expense Recovery

Expense recovery is where commercial software earns its price. The landlord spends on the property all year, bills tenants estimates, and once a year must show each tenant exactly what it owes under its own lease's terms.

### Pools and Pro-Rata Shares

A **recovery pool** groups expenses that are recovered together and shared over a defined set of spaces: CAM, real estate taxes, insurance, utilities, a mall's marketing fund. Each pool has expense accounts (mapped from the general ledger), a membership (which units share it, over time) and a denominator basis (member area, whole-property area, or a fixed figure). A tenant's **pro-rata share** of a pool is its area over the pool's denominator, unless the lease stipulates a share.

The two sides of that fraction create most disputes. A denominator that counts only leased space makes tenants pay for vacancy; one that counts all leasable space makes the landlord absorb it. Anchor and outparcel tenants that pay under separate agreements come out of the denominator, which raises everyone else's share, so leases sometimes cap that effect. My rule: pool membership and denominators are effective-dated data with the reason for each change, never a setting someone edits when a tenant leaves.

### Gross-Ups

Some costs rise with occupancy (janitorial, utilities in tenant areas, management fees on collections) and some don't (taxes, insurance, landscaping). In a building that is 60% occupied, the variable costs are lower than they would be full, so a base-year tenant would see a large "increase" as the building leases up even though nothing got more expensive. A **gross-up** adjusts variable costs to what they would have been at a stated occupancy. The 2022 office lease adjusts expenses to "ninety-five percent (95%)" occupancy if the building is less occupied in the base year, and only for items actually affected by occupancy.

The calculation, as an illustration: variable costs of $600,000 incurred at 60% occupancy, grossed up to 95%, are $600,000 / 0.60 × 0.95 = $950,000 for the base-year comparison. The system needs three things per pool and year: the occupancy measure the lease uses (area leased, area occupied, or average over the year), which expense accounts are variable, and the gross-up percentage, which can differ by lease. Grossing up applies to the base year and the comparison year alike, which is the point: it keeps the tenant from paying for the landlord's vacancy in either direction.

### Base Years and Expense Stops

Gross office leases pass through only increases:

- **Base year:** the tenant pays its share of expenses above what they were in a named year. The 2022 office lease's base year is calendar 2023, with pass-throughs starting January 1, 2024, and a separate tax base year tied to when the county assesses the new building's value.
- **Expense stop:** the same idea expressed as a fixed amount per square foot instead of a year's actual costs.

Base years are stored per lease and per pool, with the grossed-up base amount frozen once the base year closes. A re-measured building or a reclassified expense later must not silently move a tenant's base.

### Caps: Cumulative and Non-Cumulative

Tenants negotiate **caps** on how fast recoverable expenses may rise, usually on **controllable** expenses only. The 2022 office lease caps controllable operating expenses at 5% a year "calculated on a cumulative basis throughout the Term," and defines controllable by exclusion: everything except insurance, utilities, snow and ice removal, certain capital costs and costs outside the landlord's reasonable control.

The two methods differ in what happens to unused headroom. As an illustration, with a tenant share of controllable costs of $100,000 in the base year, a 5% cap, costs up 2% in year one ($102,000) and 8% in year two ($110,160):

- **Non-cumulative (year over year):** the year-two ceiling is 5% over year one's billed amount, $102,000 × 1.05 = $107,100. The tenant pays $107,100.
- **Cumulative (compounding from the base):** the year-two ceiling is $100,000 × 1.05² = $110,250. The year-one headroom carried forward, so the tenant pays the full $110,160.

Some leases cap off the prior year's actual cost rather than the billed amount, some compound and some add simple percentages, and some cap only the landlord's admin fee. The cap engine takes the method from the lease, and every reconciliation line records the ceiling, the uncapped amount and the method that produced the difference.

### Exclusions and Admin Fees

Each lease lists costs the landlord may not pass through. In the 2022 office lease, operating expenses exclude capital improvement costs (with exceptions) and leasing commissions. Typical lists add financing costs, costs of the landlord's own entity, costs reimbursed by insurance or other tenants, and repairs caused by the landlord's negligence. Landlords add an **administrative fee**: the 2014 restaurant lease adds a management charge of 5% of the landlord's gross operating income. Entrata advertises keeping "lease exclusions top of mind," and Rent Manager's recoverable expenses carry an optional markup. In the data, exclusions are per lease and per expense account or category, admin fees are per lease and pool, and both are applied in a fixed, recorded order (exclusions, then gross-up, then base, then cap, then fee, unless the lease says otherwise), because the order changes the answer.

### Estimates and the Annual Reconciliation

The year runs in two halves:

1. **Budget and estimates.** Before the year starts, the landlord budgets each pool, applies each lease's terms, and sets monthly estimate charges. The restaurant lease has the tenant pay its share "on the first day of each calendar month" based on the landlord's estimate. Yardi Breeze lets estimates post monthly, quarterly or annually.
2. **Reconciliation.** After year-end close, actual pool costs are computed, adjusted per lease, and compared with estimates billed. The restaurant lease gives the landlord 90 days to "endeavor to make available" a statement and 120 days to rebate any overpayment; MRI describes reconciling "a few months after year-end close" and posting the result as a one-time charge or credit. The next year's estimates usually reset at the same time.

A reconciliation is a document the tenant will check, so the system keeps it as an immutable, versioned statement: pool totals, occupancy, gross-up, the tenant's share, base, cap, exclusions, fee, estimates billed, and the balance, each line traceable to general ledger entries. The true-up posts as an ordinary charge or credit on the lease ledger, the same machinery [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog) describes for any one-off charge. A corrected reconciliation is a new version that supersedes the old one and posts the difference; it never edits the charge already billed.

Mid-year events complicate it: a tenant moving in or out mid-year pays for its days; a suite expansion changes the share from the amendment's effective date; a sale of the property splits the year between two owners' books. Each is a proration over effective-dated rows, which is why shares and memberships carry date ranges.

### Tenant Audit Rights

Most negotiated leases let the tenant audit the landlord's books behind a reconciliation. The 2022 office lease allows an audit "not more than one (1) time per year," requires notice "within one hundred twenty (120) days after delivery of the Landlord Statement," and has the landlord reimburse audit costs, capped at $4,500, if expenses are "overstated by more than 5%." Those three numbers (frequency, window, threshold) are data per lease, and the window is a critical date that starts when the statement is delivered, so delivery needs a recorded date. Audits are why every number on a reconciliation must be reproducible years later from the ledger, the pool definitions and the lease terms as they stood.

## Percentage Rent

Retail leases can add rent tied to the tenant's sales. The tenant pays a percentage of gross sales above a **breakpoint**:

- **Natural breakpoint:** base rent divided by the percentage rate, the sales level at which the percentage would equal the base rent. At $240,000 base rent and 6%, the natural breakpoint is $4,000,000 (an illustration).
- **Artificial breakpoint:** any other negotiated threshold, higher or lower, often fixed in dollars or stepped by year.

The 2014 restaurant lease (as amended) is a compact example: rent of "eight percent (8%) of Gross Sales ... in excess of such Lease Year's natural breakpoint," calculated monthly against "one/twelfth (1/12)" of the breakpoint, with the breakpoint rising 3% a year. Monthly statements are due "within ten (10) days after the close of each calendar month" and an annual statement within thirty days of the lease year's end; the landlord may audit, and if sales are understated by more than 5% the tenant pays the audit cost plus the rent due with interest.

What the software must handle:

- **Sales reports** by period, with the tenant's gross sales, the lease's permitted deductions (returns, sales tax, employee sales, and whatever else the lease defines), the source (portal, point-of-sale feed, staff entry, audit adjustment) and who certified it. Corrections are new rows that supersede old ones.
- **Cumulative or non-cumulative calculation** across the year. Billed monthly against a twelfth of the breakpoint, a tenant with a strong December would overpay against a weak spring unless the calculation is cumulative year-to-date with a year-end true-up; MRI's calculator names both methods.
- **Prorated breakpoints** for short lease years, and breakpoints that change by year.
- **Offsets**: some leases credit recoveries or other charges against percentage rent.
- **Tiers**: different rates above successive breakpoints.

Sales data is also an operating metric: occupancy cost as a share of sales tells a retail landlord which tenants are at risk. Keeping sales reports as first-class rows lets [Operating Metrics](/books/property-tech/operating-metrics#owner-reporting-metrics), which defines the occupancy cost ratio, use them without parsing charges.

## Escalations and Straight-Line Rent

Base rent changes over a long term, in three common ways:

- **Fixed steps,** in dollars or percentages. The restaurant lease's minimum rent "shall increase by three percent (3%) each year during the Lease Term and any extension."
- **Index-linked,** usually to a Consumer Price Index series, often with a floor and a ceiling. The Bureau of Labor Statistics notes that the CPI-U and CPI-W "are commonly used in escalation agreements," that a bare reference to "CPI" or "CPI-U" "can be ambiguous," and that it strongly recommends indexes that are not seasonally adjusted, because seasonally adjusted figures are revised for years. It also recommends national or regional indexes over volatile local ones.
- **Market resets,** at fair market rent determined at an option exercise or a mid-term date, often with a floor tied to the prior rent.

Fixed steps are just effective-dated charge schedules, which the [core model](/books/property-tech/property-business#the-core-data-model) already supports. Index escalations need an escalation row that names the exact BLS series, the base and comparison periods, the floor and cap, and the lag (an increase effective in January usually uses an index published weeks earlier), and that records the index values it used when it produced the new schedule. The index values themselves are stored as published, with the publication date.

### Straight-Line Rent for the Lessor

US GAAP requires a lessor to recognize operating lease income evenly, not as billed. Under ASC 842 a lessor recognizes "the lease payments as income in profit or loss over the lease term on a straight-line basis unless another systematic and rational basis is more representative," variable lease payments in the period the facts they depend on change, and initial direct costs over the term on the same basis. The FASB described lessor accounting as "largely unchanged" from the prior standard: most operating leases stay operating leases with income "on a generally straight-line basis."

The effect on the data is a second schedule beside the billing schedule. As an illustration, a 60-month lease with six months free and $10,000 a month after that bills $540,000 in total; straight-line income is $9,000 a month from the first month. During the free months income exceeds billing by $9,000 a month, building an accrued (straight-line) rent receivable of $54,000, which then unwinds by $1,000 a month over the remaining 54 months. Points to get right:

- **Which payments are straight-lined.** Fixed rent, fixed steps and free rent are. Payments that depend on an index are measured using the index at commencement, and a lessor does not remeasure lease payments unless the lease is modified (not as a separate contract), so later CPI increases are recognized as they occur rather than spread. Percentage rent and expense recoveries that vary are variable payments recognized when earned.
- **Modifications restart the math.** An amendment that is not a separate contract produces a new straight-line schedule from its effective date, versioned, with the old one kept.
- **Collectibility.** If collecting a tenant's payments is not probable, ASC 842 generally limits operating lease income to payments received, which reverses the straight-line receivable. Stakeholders in the FASB's 2025 review observed that lessors may not establish a general allowance on a portfolio of operating lease receivables, a change from the prior standard that raised concerns for lessors such as REITs.
- **Recoveries are a nonlease component.** CAM is a service, and the FASB's review lists allocating consideration between lease and nonlease components as a lessor challenge; the accounting policy decides how recoveries are presented, and the system needs recovery charges identifiable apart from rent to support either choice.

The product keeps the facts and finance picks the policy, exactly as [Accounting & Revenue Recognition](/docs/payments/accounting#recognition-schedules) describes for subscription revenue: the schedule is regenerated under a recorded policy version, never hand-edited.

## Tenant Improvements and Free Rent

Landlords pay tenants to sign. The two big incentives:

- **Tenant improvement (TI) allowance:** money the landlord contributes to build out the space, quoted per rentable square foot. The 2022 office lease grants $2,295,480, which on 38,258 rentable square feet is $60 per square foot. Allowances come with rules: what they may be spent on, a deadline to use them, disbursement against invoices and lien waivers, and sometimes conversion of unused allowance into rent credit. The construction itself is a capital project ([Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#capital-projects-and-job-costing)); the lease side tracks the allowance, draws and remaining balance.
- **Free rent (abatement):** months with base rent waived. The same lease abates base rent for months 1 to 12, $1,415,546 in total at $30,504 a month in the first year, "provided Tenant is not then in default," while additional rent (recoveries) stays payable. In the core model an abatement is a negative recurring charge schedule with a date range; the default condition belongs on it, because an abatement that a default can forfeit is a contingent credit, not a fixed one.

Together with term and rent, these produce the number brokers compare deals on, **net effective rent**: total rent over the term less the landlord's concessions and costs, spread per square foot per year. It is a deal-pipeline metric, computed from the proposal's economics, not stored as a lease term.

## Leasing Costs and Broker Commissions

Commercial deals usually involve a landlord's agent and often a tenant's broker, and the landlord typically pays both. The 2022 office lease names the landlord's broker (CBRE) and states the landlord "shall be responsible for the payment of all commissions"; the restaurant lease says no commission is due to a tenant's broker for extension periods and has each party warrant it dealt with no other broker. Those warranties exist because a broker who claims to have introduced the tenant can claim a fee.

What the system records per lease:

- **Who is owed:** each broker firm (a vendor, paid through [payables](/books/property-tech/vendors-and-payables#paying-vendors)), its side, and the agreement that sets its fee.
- **How it's computed:** commonly a percentage of aggregate base rent over the term, sometimes a rate per square foot or a flat amount, with different rates for new leases, renewals and expansions.
- **When it's paid:** commissions are often split into installments triggered by events such as execution, occupancy or rent commencement, and a commission on a future renewal or expansion is a contingent obligation tied to that event.

For the lessor's books, broker commissions are the textbook initial direct cost. ASC 842 lists "Commissions" as an example, and its worked example capitalizes $10,000 of broker commissions and recognizes them "ratably over the lease term, consistent with its recognition of lease income," while travel, legal fees and allocated salaries are expensed. So a commission row links to the lease, the vendor invoice and the amortization schedule. Commission management for brokerages (the broker's own revenue side) is a different product category and stays outside this chapter.

## Tenant Insurance Compliance

Commercial leases require the tenant to carry specific insurance (general liability, property on its improvements and contents, umbrella, workers' compensation, liquor liability for restaurants) at stated limits, with the landlord and its lender named as additional insureds. The restaurant lease requires policies or certificates by the commencement date and "at least thirty (30) days" before each policy expires, caps deductibles at $10,000, requires an insurer licensed in California, and lets the landlord buy the coverage and bill it as additional rent if the tenant doesn't comply. The office lease requires certificates before the commencement date.

Entrata advertises "complete visibility and control over tenant insurance compliance," and RealPage's tenant portal takes insurance certificate uploads. The model is requirements versus evidence: each lease has insurance requirements (coverage type, per-occurrence and aggregate limits, additional insured, maximum deductible) and each certificate received is a document with insurer, policy number, coverages, limits, effective dates and named additional insureds. A compliance check compares the two and produces findings (missing, deficient limit, missing additional insured, expiring). My rule: a certificate summarizes coverage but isn't the policy, so the record keeps which endorsement evidences each requirement, and expiry dates become critical dates. Vendor insurance on the landlord's own contractors uses the same shape and belongs to [Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables#vendor-compliance); residential renters insurance is in [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#renters-insurance-requirements).

## Deal Pipeline and Listings

Commercial leasing is a negotiation measured in months: inquiry, tour, proposal, letter of intent, lease drafting, approvals, execution. Each round of a proposal changes the economics (rent, term, free rent, TI allowance, escalations), and the landlord's investment committee approves deals against a budget and a net effective rent. VTS's leasing product covers "the end-to-end leasing pipeline, deal tracking, and portfolio analytics"; enterprise suites have their own deal tracking that hands the executed deal to the rent roll.

The design consequences:

- **A deal is not a lease.** The deal holds the prospect (a company, often represented by a tenant broker), the space under discussion (which may be several suites or a not-yet-demised portion of a floor), the stage, and a versioned list of proposals. Executing it creates the lease, its premises, schedules, recovery terms and commission records, and the deal keeps a link to what it produced.
- **Stacking plans** (floors with suites, tenants and expirations drawn as a stack) are a view over units, premises and leases, not a separate store.
- **Listings** feed demand from marketplaces. CommercialCafe lists office, industrial, retail and coworking space and lets brokers and landlords list for free; listing syndication mechanics belong to [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing#listings-and-syndication), and the guest-card model for prospects to [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#the-guest-card).

## Data Standards: OSCRE

Commercial data moves between landlords, asset managers, lenders, appraisers and occupiers far more than residential data does, and a standard exists for it. OSCRE is a nonprofit membership organization "focused on the development and implementation of real estate data standards"; its Industry Data Model is free to use, covers the "entire asset lifecycle," and defines data for more than 150 use cases. At least one major suite exports on it: a third-party API directory describes Yardi's Commercial Data Interface as exporting "property, unit, lease and rent roll information" from Voyager and built on the OSCRE standard.

My default: use the standard's entity definitions as the export and import contract (properties, spaces, leases, rent roll, recoveries), keep my own table names internal, and maintain a crosswalk of identifiers for every outside party, because asset managers receiving rent rolls from several managers have to resolve the same property and tenant across sources ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)). [Investors, Funds & Asset Management](/books/property-tech/investors-and-asset-management#data-from-third-party-managers) covers the receiving side.

## Flex Space and Coworking

Flex operators lease or manage commercial space and resell it in small, short slices: memberships for a hot desk or a dedicated desk, private offices on month-to-month or short terms, meeting rooms by the hour, day passes, and virtual offices (a business address, mail handling and some meeting-room access without a desk). The economics are hospitality-like (high churn, utilization, ancillary sales), and the software looks more like a subscription and booking system than a lease ledger.

Yardi Kube, the most visible suite product for operators, describes member management and contracts ("Send and manage member contracts"), billing where "every charge, payment, and report is automatically synced," meeting room reservations through branded member apps, "automated access management," centralized Wi-Fi and device control with bandwidth tracking, and syndication of spaces with live pricing through its listing network. A third-party API directory describes its API as covering "member management, billing, space booking, access control and CRM," with webhooks. On the marketplace side, Deskpass sells day passes ("Access to work on a desk or table in a space's communal area(s)"), hourly or daily conference rooms, and company plans with utilization-based pricing, consolidated billing and budget controls, across "290 cities, 22 countries"; its site carries a Yardi Systems copyright. CommercialCafe lists more than 9,500 US coworking spaces and offers operators tools to handle "bookings, meeting rooms, and packages."

How flex maps to the model:

- **Private offices are units.** A private office is a `commercial_suite` unit in a property of type `commercial`, occupied by one membership at a time, so occupancy and revenue per available office work like any other unit.
- **Desks and rooms are bookable resources,** not units: a meeting room, a hot-desk pool with a capacity, a phone booth. Bookings are reservations against them with the exclusion constraint from [Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time), and pooled seats use the counter pattern from [Reservations & Holds](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory).
- **Memberships are subscriptions.** A membership is a recurring plan with included credits (meeting-room hours, day passes), overage charges and a notice period, billed in periods as [Subscriptions & Billing](/docs/payments/subscriptions#periods-and-anchors) describes, rather than a lease ledger. The member company is a legal entity; its seated members are people with access grants.
- **Is it a lease?** ASC 842 defines a lease as a contract conveying "the right to control the use of identified property, plant, or equipment," so a hot-desk membership with no identified desk generally is not one, while a private office for a term may be. That classification is the operator's accountants' call per contract type; the system records which plan types are accounted as leases.
- **Access and IT are part of the product.** Door access follows active memberships and bookings ([Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)), and managed Wi-Fi and per-member network access are a service line ([Resident Financial Products & Ancillary Revenue](/books/property-tech/resident-financial-products#bulk-internet-and-managed-wi-fi) covers managed internet as ancillary revenue).

The operator's own head lease or management agreement with the building's landlord is an ordinary commercial lease from the other side: the operator is the lessee, which is the occupier posture below.

## The Occupier Side

A retailer with 800 stores, a bank with branches and data centers, or a company with offices in 30 countries holds hundreds or thousands of leases as the lessee. It needs to pay rent on time, never miss an option window, audit landlords' reconciliations, and account for every lease on its balance sheet. That's **corporate lease administration**, and since ASC 842 and IFRS 16 it's an accounting system as much as a property one.

The tenant posture flips. In the landlord model, the platform tenant owns or manages the property and bills lessees. On the occupier side, the platform tenant is the lessee: it doesn't own the building, the "property" may be a single floor in someone else's tower or a forklift, and the counterparty is a landlord or leasing company it pays. Vendors in this market, as described on their own or partners' pages as of October 2026:

| Vendor | Occupier capabilities |
| --- | --- |
| **Visual Lease** (part of CoStar Group) | Lease management across the life cycle; lease accounting producing "disclosures, journal entries, reports and footnotes" for ASC 842, IFRS 16 and GASB 87; real estate, fleet and equipment; AI lease abstraction |
| **CoStar Real Estate Manager** | "Enterprise-class solution for lease accounting and lease administration" for ASC 842, IFRS 16 and GASB 87, positioned as a subledger feeding the financial close (per Trintech's partner page) |
| **FinQuery** (formerly LeaseQuery) | Compliance with ASC 842, IFRS 16, FRS 102, GASB 87 and SFFAS 54; amortization schedules, journal entries and disclosure reports |
| **MRI Software** | Prolease for ASC 842, GASB 87 and IFRS 16 across "property, vehicle or equipment leases," with an audit trail; lease management with "centralized data, obligations and critical dates"; IWMS and room and desk booking |

### Lease Administration for Occupiers

The occupier's lease administration is the landlord's critical-date and abstract work from the other side, plus payables: rent and recovery estimates paid on schedule, landlord reconciliations checked against the lease's caps and exclusions (and audited when the numbers look wrong, inside the audit window), options exercised or declined by decision deadlines, and subleases where the occupier is itself a landlord. Payment runs go through the occupier's accounts payable, so the lease system feeds payables rather than collecting receivables.

### ASC 842 and IFRS 16 for Lessees

Both standards put leases on the lessee's balance sheet. The FASB issued ASC 842 in February 2016, effective for public companies for fiscal years beginning after December 15, 2018 and for most other organizations for fiscal years beginning after December 15, 2021; the IASB issued IFRS 16 in January 2016, effective for annual periods beginning on or after January 1, 2019. What a lessee records:

- **Lease liability:** the present value of the lease payments not yet paid. Payments include fixed payments (less lease incentives), payments that depend on an index or rate measured at the commencement index, and payments in optional periods only if the lessee is "reasonably certain" to exercise the option, which the FASB calls "a high threshold." Most variable payments (percentage rent, recoveries that float) stay out.
- **Right-of-use (ROU) asset:** the liability plus initial direct costs and prepaid rent, less incentives received.
- **Discount rate:** the rate implicit in the lease if readily determinable, which for a lessee it usually isn't, so in practice the **incremental borrowing rate (IBR)**, defined as "the rate of interest that a lessee would have to pay to borrow on a collateralized basis over a similar term an amount equal to the lease payments in a similar economic environment." A nonpublic entity may use a risk-free rate instead, and since ASU 2021-09 may elect that by class of underlying asset rather than entity-wide.

**Classification is where the standards part.** ASC 842 keeps two lessee classes. A lease is a **finance lease** if it transfers ownership, has a purchase option the lessee is reasonably certain to exercise, runs for the major part of the asset's remaining economic life, has payments (plus guaranteed residual) amounting to substantially all of the asset's fair value, or covers an asset so specialized it has no alternative use to the lessor; otherwise it's an **operating lease**. A finance lease shows amortization and interest separately; an operating lease shows "a single lease cost ... allocated over the lease term on a generally straight-line basis," so the ROU asset's reduction each period is whatever keeps the total level after interest accretes on the liability. IFRS 16 has a **single lessee model**: every recognized lease is accounted like an ASC 842 finance lease, with depreciation of the asset separate from interest on the liability. The FASB's own summary says leases classified as operating under its standard "will be accounted for differently under GAAP than under IFRS." A multinational reporting under both runs two schedules per lease from the same inputs.

**Exemptions.** Under ASC 842 a lessee may elect, by class of underlying asset, not to recognize leases of 12 months or less, expensing them straight-line. IFRS 16 exempts short-term leases (12 months or less) and leases of low-value assets, with "a personal computer" as its example. I keep the low-value test as a policy parameter set by the occupier's accountants rather than a constant in code.

**Remeasurement.** A lessee remeasures lease payments when the lease is modified and the modification is not a separate contract, when a contingency resolves so variable payments become fixed, or when the lease term or the assessment of a purchase option changes; index-based payments are then measured at the index at the remeasurement date. A modification counts as a separate contract only if it adds a right of use and the payments rise commensurate with its standalone price; otherwise the lessee reassesses classification and remeasures with updated inputs, including a new discount rate. In data terms, every remeasurement is a new measurement row (classification, rate, term, liability, ROU) effective from the event date, with the schedule regenerated forward and the prior version kept.

The FASB held a public roundtable on September 12, 2025 as part of its post-implementation review of Topic 842. Its materials name the hard parts: identifying embedded leases, the discount rate (determining and substantiating a collateralized IBR), allocating consideration between lease and nonlease components, and lease modifications. Those are exactly where a lease accounting system needs evidence trails.

### Equipment Leases and Embedded Leases

The standards cover all leased assets, not only real estate: vehicles, forklifts, copiers, servers, medical devices. MRI and Visual Lease both sell equipment and fleet coverage. Equipment leases are many, short and standardized, so the system needs bulk import, asset-class policies (the short-term election and nonpublic risk-free election are both by class), and schedules that don't assume a building. **Embedded leases** hide inside service contracts (a logistics agreement that dedicates specific trucks, a data center contract with identified racks); the FASB's review reports "significant costs and complexities" in finding them. The occupier's contract intake needs a question at signing (does this contract give us control of an identified asset?) more than a clever algorithm later.

### Space Management and IWMS

Occupiers also manage how space is used: floor plans, seat assignments, desk and room booking, move management, maintenance and capital planning for the space they occupy. Software that combines lease administration, space management, facilities maintenance and capital projects is sold as an **integrated workplace management system (IWMS)**; MRI lists IWMS, workplace management and "room and desk booking software" among its products. The data link to this chapter is the lease: space plans hang off the premises a lease covers, and occupancy per seat informs whether to exercise an option, expand or give space back. Room and desk booking is the same reservation pattern as flex meeting rooms.

## How to Build It

The changes against [the core data model](/books/property-tech/property-business#the-core-data-model). Commercial properties are `property_type = 'commercial'` (or `'mixed_use'`), suites are `units.kind = 'commercial_suite'`, and flex operators are commercial properties too.

```sql
-- Commercial lessees are companies, and leases cover suites that change by amendment.
ALTER TABLE legal_entities
  DROP CONSTRAINT legal_entities_role_check,
  ADD CONSTRAINT legal_entities_role_check CHECK (role IN ('manager', 'owner', 'fund',
    'association', 'investor', 'sponsor', 'venture', 'lender',  -- kept from Investors
    'commercial_tenant', 'occupier', 'counterparty'));

ALTER TABLE units
  ADD COLUMN space_use TEXT CHECK (space_use IN ('office', 'retail', 'industrial', 'flex',
    'medical', 'restaurant', 'private_office')),
  ADD CONSTRAINT units_space_use_ck CHECK (kind <> 'commercial_suite' OR space_use IS NOT NULL);

ALTER TABLE leases
  ALTER COLUMN household_id DROP NOT NULL,
  ADD COLUMN agreement_kind TEXT NOT NULL DEFAULT 'residential_lease'   -- which body of law governs
    CHECK (agreement_kind IN ('residential_lease', 'commercial_lease', 'storage_rental')),
  ADD COLUMN lessee_entity_id     UUID REFERENCES legal_entities (id),
  ADD COLUMN expense_structure    TEXT CHECK (expense_structure IN ('full_service_gross',
                                    'modified_gross', 'net', 'triple_net', 'absolute_net')),
  ADD COLUMN rent_commencement_on DATE,   -- can differ from starts_on
  ADD CONSTRAINT leases_one_lessee CHECK (num_nonnulls(household_id, lessee_entity_id) = 1),
  ADD CONSTRAINT leases_commercial_terms
    CHECK (agreement_kind <> 'commercial_lease' OR expense_structure IS NOT NULL);

ALTER TABLE charge_codes
  DROP CONSTRAINT charge_codes_category_check,
  ADD CONSTRAINT charge_codes_category_check CHECK (category IN ('rent', 'fee', 'deposit',
    'utility', 'ancillary', 'concession', 'recovery'));

CREATE TABLE lease_amendments (          -- every change to a commercial lease is one of these
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  amendment_no   INT NOT NULL,           -- 0 is the original lease
  kind           TEXT NOT NULL CHECK (kind IN ('original', 'expansion', 'contraction',
                   'extension', 'option_exercise', 'rent_reset', 'relocation', 'other')),
  executed_on    DATE NOT NULL,
  effective_on   DATE NOT NULL,
  prior_ends_on  DATE,                   -- the expiration this amendment replaced
  new_ends_on    DATE,
  document_id    UUID NOT NULL REFERENCES lease_documents (id),  -- the signed amendment (The Lease)
  UNIQUE (tenant_id, lease_id, amendment_no)
);

CREATE TABLE lease_premises (            -- which suites a lease covers, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  lease_id     UUID NOT NULL REFERENCES leases (id),
  unit_id      UUID NOT NULL REFERENCES units (id),
  amendment_id UUID NOT NULL REFERENCES lease_amendments (id),
  agreed_area  NUMERIC(12, 2),           -- the lease's stated rentable area, if any
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&)  -- one lessee per suite
);

CREATE TABLE area_measurements (         -- measured areas, by standard and edition
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  building_id   UUID REFERENCES buildings (id),
  unit_id       UUID REFERENCES units (id),
  standard      TEXT NOT NULL,           -- 'ANSI/BOMA Z65.1-2024'
  usable_area   NUMERIC(12, 2),
  rentable_area NUMERIC(12, 2) NOT NULL,
  area_unit     TEXT NOT NULL CHECK (area_unit IN ('sq_ft', 'sq_m')),
  measured_on   DATE NOT NULL,
  measured_by   TEXT NOT NULL,           -- the architect or surveyor of record
  valid_during  DATERANGE NOT NULL,
  CHECK (num_nonnulls(building_id, unit_id) = 1),
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&) WHERE (unit_id IS NOT NULL),
  EXCLUDE USING GIST (building_id WITH =, valid_during WITH &&) WHERE (building_id IS NOT NULL)
);
```

Expense recovery: pools, what's in them, who shares them, each lease's terms, and the reconciliation.

```sql
CREATE TABLE recovery_pools (            -- CAM, tax, insurance, utilities, marketing fund
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  name              TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('cam', 'tax', 'insurance', 'utility',
                      'marketing', 'other')),
  denominator_basis TEXT NOT NULL CHECK (denominator_basis IN ('member_area',
                      'property_area', 'fixed_area')),
  fixed_area        NUMERIC(12, 2),       -- when denominator_basis = 'fixed_area'
  UNIQUE (tenant_id, property_id, name)
);

CREATE TABLE recovery_pool_accounts (    -- which GL accounts feed a pool
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  pool_id              UUID NOT NULL REFERENCES recovery_pools (id),
  gl_account_id        UUID NOT NULL REFERENCES gl_accounts (id),  -- Trust Accounting's chart
  expense_category     TEXT NOT NULL,     -- 'janitorial', 'security', 'capital_repair'
  varies_with_occupancy BOOLEAN NOT NULL, -- grossed up when true
  valid_during         DATERANGE NOT NULL,
  EXCLUDE USING GIST (pool_id WITH =, gl_account_id WITH =, valid_during WITH &&)
);

CREATE TABLE recovery_pool_members (     -- which suites share a pool, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  pool_id      UUID NOT NULL REFERENCES recovery_pools (id),
  unit_id      UUID NOT NULL REFERENCES units (id),
  reason       TEXT NOT NULL,             -- 'anchor excluded per REA', 'new building'
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (pool_id WITH =, unit_id WITH =, valid_during WITH &&)
);

CREATE TABLE lease_recovery_terms (      -- one lease's deal with one pool
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  lease_id               UUID NOT NULL REFERENCES leases (id),
  pool_id                UUID NOT NULL REFERENCES recovery_pools (id),
  amendment_id           UUID NOT NULL REFERENCES lease_amendments (id),
  share_method           TEXT NOT NULL CHECK (share_method IN ('pro_rata_area', 'stipulated')),
  stipulated_share       NUMERIC(9, 8),     -- 'agreed and deemed to be 15.16%'
  base_kind              TEXT NOT NULL CHECK (base_kind IN ('none', 'base_year',
                           'expense_stop')),
  base_year              INT,
  expense_stop_per_area  BIGINT,            -- minor units per sq ft or sq m
  gross_up_to            NUMERIC(5, 4),     -- 0.9500; null: no gross-up
  cap_method             TEXT NOT NULL CHECK (cap_method IN ('none', 'cumulative_compound',
                           'cumulative_simple', 'non_cumulative')),
  cap_rate               NUMERIC(6, 5),
  cap_scope              TEXT CHECK (cap_scope IN ('controllable', 'all')),
  cap_first_year         INT,
  admin_fee_rate         NUMERIC(6, 5),
  audit_frequency_years  INT,
  audit_notice_days      INT,               -- window after statement delivery
  audit_cost_threshold   NUMERIC(5, 4),     -- landlord pays audit if overstated by more
  audit_cost_cap         BIGINT,
  currency               CHAR(3) NOT NULL,
  valid_during           DATERANGE NOT NULL,
  CHECK ((share_method = 'stipulated') = (stipulated_share IS NOT NULL)),
  EXCLUDE USING GIST (lease_id WITH =, pool_id WITH =, valid_during WITH &&)
);

CREATE TABLE lease_recovery_exclusions ( -- costs this lease won't pay for
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  terms_id         UUID NOT NULL REFERENCES lease_recovery_terms (id),
  expense_category TEXT NOT NULL,
  is_controllable  BOOLEAN,               -- per this lease's definition, for the cap
  excluded         BOOLEAN NOT NULL,      -- false rows only classify controllability
  lease_section    TEXT NOT NULL          -- 'Exhibit B (b)'
);

CREATE TABLE recovery_reconciliations (  -- an annual statement for one pool, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  pool_id            UUID NOT NULL REFERENCES recovery_pools (id),
  period             DATERANGE NOT NULL,   -- the expense year
  version            INT NOT NULL,
  supersedes_id      UUID REFERENCES recovery_reconciliations (id),
  status             TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'issued',
                       'superseded')),
  actual_total       BIGINT NOT NULL,
  occupancy          NUMERIC(5, 4) NOT NULL,
  grossed_up_total   BIGINT NOT NULL,
  denominator_area   NUMERIC(12, 2) NOT NULL,
  currency           CHAR(3) NOT NULL,
  ledger_snapshot_at TIMESTAMPTZ NOT NULL, -- the GL state it was computed from
  policy_version     TEXT NOT NULL,        -- the calculation order and code version
  issued_at          TIMESTAMPTZ,
  UNIQUE (tenant_id, pool_id, period, version)
);

CREATE TABLE recovery_reconciliation_lines ( -- one lease's result; immutable once issued
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  reconciliation_id UUID NOT NULL REFERENCES recovery_reconciliations (id),
  lease_id          UUID NOT NULL REFERENCES leases (id),
  terms_id          UUID NOT NULL REFERENCES lease_recovery_terms (id),
  days_in_pool      INT NOT NULL,           -- proration for mid-year moves
  share             NUMERIC(9, 8) NOT NULL,
  excluded_amount   BIGINT NOT NULL,
  base_amount       BIGINT NOT NULL,
  uncapped_amount   BIGINT NOT NULL,
  cap_ceiling       BIGINT,
  admin_fee         BIGINT NOT NULL,
  tenant_amount     BIGINT NOT NULL,
  estimates_billed  BIGINT NOT NULL,
  balance           BIGINT NOT NULL,        -- positive: tenant owes
  delivered_on      DATE,                   -- starts the audit window
  true_up_charge_id UUID REFERENCES charges (id),
  UNIQUE (tenant_id, reconciliation_id, lease_id)
);

CREATE TABLE recovery_audit_requests (   -- a tenant auditing a statement
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  reconciliation_id UUID NOT NULL REFERENCES recovery_reconciliations (id),
  lease_id          UUID NOT NULL REFERENCES leases (id),
  requested_on      DATE NOT NULL,
  within_window     BOOLEAN NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('open', 'settled', 'withdrawn',
                      'rejected')),
  overstatement     NUMERIC(6, 5),
  landlord_pays_audit BOOLEAN,
  settlement_charge_id UUID REFERENCES charges (id)
);
```

Percentage rent, escalations and the lessor's straight-line schedule:

```sql
CREATE TABLE percentage_rent_terms (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lease_id            UUID NOT NULL REFERENCES leases (id),
  amendment_id        UUID NOT NULL REFERENCES lease_amendments (id),
  breakpoint_kind     TEXT NOT NULL CHECK (breakpoint_kind IN ('natural', 'artificial')),
  method              TEXT NOT NULL CHECK (method IN ('cumulative', 'non_cumulative')),
  report_frequency    TEXT NOT NULL CHECK (report_frequency IN ('monthly', 'quarterly',
                        'annual')),
  report_due_days     INT NOT NULL,         -- 'within ten (10) days after'
  annual_due_days     INT NOT NULL,
  audit_threshold     NUMERIC(5, 4),        -- understatement that shifts audit cost
  currency            CHAR(3) NOT NULL,
  valid_during        DATERANGE NOT NULL,   -- usually one lease year
  EXCLUDE USING GIST (lease_id WITH =, valid_during WITH &&)
);

CREATE TABLE percentage_rent_tiers (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  terms_id   UUID NOT NULL REFERENCES percentage_rent_terms (id),
  breakpoint BIGINT NOT NULL,               -- annual; natural ones stored as computed
  rate       NUMERIC(6, 5) NOT NULL,        -- 0.08000
  UNIQUE (tenant_id, terms_id, breakpoint)
);

CREATE TABLE sales_reports (             -- append-only; corrections supersede
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  lease_id      UUID NOT NULL REFERENCES leases (id),
  period        DATERANGE NOT NULL,
  gross_sales   BIGINT NOT NULL,
  deductions    BIGINT NOT NULL DEFAULT 0,  -- as the lease defines them
  currency      CHAR(3) NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('portal', 'pos_feed', 'staff',
                  'audit_adjustment')),
  is_annual_certified BOOLEAN NOT NULL DEFAULT FALSE,
  supersedes_id UUID REFERENCES sales_reports (id),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE index_values (              -- published CPI values, as published
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  series_id    TEXT NOT NULL,             -- the exact BLS series, not 'CPI'
  period       DATE NOT NULL,             -- first day of the reference month
  value        NUMERIC(10, 3) NOT NULL,
  published_on DATE NOT NULL,
  UNIQUE (series_id, period, published_on)
);  -- reference data shared by all tenants

CREATE TABLE escalation_schedules (      -- how a rent schedule changes, and what it produced
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  lease_id             UUID NOT NULL REFERENCES leases (id),
  charge_code_id       UUID NOT NULL REFERENCES charge_codes (id),
  amendment_id         UUID NOT NULL REFERENCES lease_amendments (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('fixed_amount', 'fixed_rate', 'index',
                         'market_reset')),
  effective_on         DATE NOT NULL,
  fixed_amount         BIGINT,
  fixed_rate           NUMERIC(6, 5),
  index_series_id      TEXT,
  index_base_period    DATE,
  index_compare_period DATE,
  floor_rate           NUMERIC(6, 5),
  ceiling_rate         NUMERIC(6, 5),
  index_value_ids      UUID[],            -- the published values it used
  resulting_schedule_id UUID REFERENCES lease_charge_schedules (id),
  status               TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'disputed'))
);

CREATE TABLE straight_line_schedules (   -- lessor revenue view, versioned per modification
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  version        INT NOT NULL,
  amendment_id   UUID NOT NULL REFERENCES lease_amendments (id),
  term           DATERANGE NOT NULL,
  total_fixed    BIGINT NOT NULL,         -- fixed rent less abatements over the term
  monthly_income BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  policy_version TEXT NOT NULL,
  superseded_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, lease_id, version)
);
```

Incentives, commissions, insurance, clauses and dates:

```sql
CREATE TABLE tenant_improvement_allowances (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  lease_id      UUID NOT NULL REFERENCES leases (id),
  amendment_id  UUID NOT NULL REFERENCES lease_amendments (id),
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  use_by        DATE,                     -- unused allowance lapses or converts after
  unused_converts_to_rent_credit BOOLEAN NOT NULL DEFAULT FALSE
);  -- draws are payables against vendor or tenant invoices

ALTER TABLE lease_charge_schedules
  ADD COLUMN conditional_on TEXT;         -- 'no_default' for an abatement a default forfeits

CREATE TABLE leasing_commissions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  amendment_id   UUID NOT NULL REFERENCES lease_amendments (id),
  vendor_id      UUID NOT NULL REFERENCES vendors (id),   -- the brokerage
  side           TEXT NOT NULL CHECK (side IN ('landlord_agent', 'tenant_broker',
                   'co_broker')),
  basis          TEXT NOT NULL CHECK (basis IN ('rate_of_aggregate_rent', 'per_area',
                   'flat')),
  rate           NUMERIC(6, 5),
  amount         BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  is_initial_direct_cost BOOLEAN NOT NULL  -- capitalized and amortized with lease income
);

CREATE TABLE leasing_commission_installments (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  commission_id UUID NOT NULL REFERENCES leasing_commissions (id),
  trigger       TEXT NOT NULL CHECK (trigger IN ('execution', 'occupancy',
                  'rent_commencement', 'option_exercise', 'date')),
  amount        BIGINT NOT NULL,
  due_on        DATE,                     -- set when the trigger happens
  bill_id       UUID REFERENCES bills (id)  -- the broker's bill (Vendors, Procurement & Payables)
);

CREATE TABLE lease_insurance_requirements (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  lease_id              UUID NOT NULL REFERENCES leases (id),
  coverage              TEXT NOT NULL CHECK (coverage IN ('general_liability', 'property',
                          'umbrella', 'workers_comp', 'auto', 'liquor', 'other')),
  per_occurrence_limit  BIGINT,
  aggregate_limit       BIGINT,
  max_deductible        BIGINT,
  additional_insureds   TEXT[] NOT NULL,  -- landlord, lender, manager as named
  currency              CHAR(3) NOT NULL,
  valid_during          DATERANGE NOT NULL
);

CREATE TABLE certificates_of_insurance (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL REFERENCES leases (id),
  document_id        UUID NOT NULL,
  insurer            TEXT NOT NULL,
  policy_number      TEXT NOT NULL,
  coverage           TEXT NOT NULL,
  per_occurrence_limit BIGINT,
  aggregate_limit    BIGINT,
  additional_insureds TEXT[] NOT NULL,
  endorsement_document_id UUID,           -- the evidence behind additional insured status
  effective          DATERANGE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('received', 'compliant', 'deficient',
                       'expired')),
  findings           TEXT[],              -- 'limit_below_requirement', ...
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by        UUID REFERENCES users (id) -- user
);

CREATE TABLE lease_clauses (             -- the abstract, clause by clause
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  lease_id      UUID REFERENCES leases (id),
  occupier_lease_id UUID,                 -- references occupier_leases (below)
  amendment_id  UUID REFERENCES lease_amendments (id),
  clause_type   TEXT NOT NULL,            -- 'renewal_option', 'rofr', 'exclusive_use',
                                          -- 'co_tenancy', 'termination_option', ...
  terms         JSONB NOT NULL,           -- typed per clause_type, validated in code
  source_section TEXT NOT NULL,           -- 'Section 30.2'
  abstracted_by UUID NOT NULL REFERENCES users (id),  -- staff, or an AI agent's user
  verified_by   UUID REFERENCES users (id), -- the person who checked it
  verified_at   TIMESTAMPTZ,
  CHECK (num_nonnulls(lease_id, occupier_lease_id) = 1)
);

CREATE TABLE critical_dates (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID REFERENCES leases (id),
  occupier_lease_id UUID,
  clause_id      UUID REFERENCES lease_clauses (id),
  kind           TEXT NOT NULL CHECK (kind IN ('option_window', 'expiration',
                   'rent_commencement', 'escalation', 'abatement_end', 'coi_expiry',
                   'reconciliation_due', 'audit_window', 'sales_report_due', 'ti_use_by',
                   'other')),
  action_window  DATERANGE NOT NULL,      -- [opens, deadline]; one day for a single date
  computed_from  TEXT NOT NULL,           -- the clause logic and version that set it
  owner_user_id  UUID REFERENCES users (id),
  status         TEXT NOT NULL CHECK (status IN ('upcoming', 'actioned', 'waived',
                   'missed')),
  decision_note  TEXT,
  CHECK (num_nonnulls(lease_id, occupier_lease_id) = 1)
);

CREATE TABLE leasing_deals (             -- the pipeline; a deal produces a lease
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  prospect_entity_id UUID REFERENCES legal_entities (id),
  prospect_name     TEXT NOT NULL,
  tenant_broker_id  UUID REFERENCES vendors (id),
  unit_ids          UUID[] NOT NULL,      -- suites under discussion
  stage             TEXT NOT NULL CHECK (stage IN ('inquiry', 'tour', 'proposal', 'loi',
                      'lease_drafting', 'approval', 'executed', 'lost')),
  lost_reason       TEXT,
  lease_id          UUID REFERENCES leases (id),   -- set at execution
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deal_proposals (            -- each round of economics, never edited
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  deal_id            UUID NOT NULL REFERENCES leasing_deals (id),
  round              INT NOT NULL,
  from_side          TEXT NOT NULL CHECK (from_side IN ('landlord', 'prospect')),
  area               NUMERIC(12, 2) NOT NULL,
  term_months        INT NOT NULL,
  base_rent_per_area BIGINT NOT NULL,     -- annual, minor units
  escalation         JSONB NOT NULL,
  free_rent_months   NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ti_per_area        BIGINT NOT NULL DEFAULT 0,
  net_effective_rent BIGINT NOT NULL,     -- computed at save, with the method version
  currency           CHAR(3) NOT NULL,
  UNIQUE (tenant_id, deal_id, round)
);
```

Flex memberships and bookings:

```sql
CREATE TABLE flex_resources (            -- meeting rooms, desk pools, phone booths
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties (id),
  kind        TEXT NOT NULL CHECK (kind IN ('meeting_room', 'hot_desk_pool',
                'dedicated_desk', 'phone_booth', 'event_space')),
  name        TEXT NOT NULL,
  capacity    INT NOT NULL,
  credits_per_hour NUMERIC(6, 2)
);

CREATE TABLE flex_memberships (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID REFERENCES properties (id),  -- null for network-wide plans
  member_entity_id UUID REFERENCES legal_entities (id),
  member_person_id UUID REFERENCES people (id),
  plan_kind        TEXT NOT NULL CHECK (plan_kind IN ('hot_desk', 'dedicated_desk',
                     'private_office', 'virtual_office', 'day_pass_bundle')),
  unit_id          UUID REFERENCES units (id),        -- the private office, if any
  subscription_id  UUID NOT NULL,                     -- billing: /docs/payments/subscriptions
  seats            INT NOT NULL DEFAULT 1,
  notice_days      INT NOT NULL,
  accounted_as_lease BOOLEAN NOT NULL,                -- the operator's policy per plan
  valid_during     DATERANGE NOT NULL,
  CHECK (num_nonnulls(member_entity_id, member_person_id) = 1),
  CHECK ((plan_kind = 'private_office') = (unit_id IS NOT NULL)),
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&) WHERE (unit_id IS NOT NULL)
);

CREATE TABLE flex_bookings (             -- the reservations pattern, per resource
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  resource_id      UUID NOT NULL REFERENCES flex_resources (id),
  membership_id    UUID REFERENCES flex_memberships (id),
  guest_person_id  UUID REFERENCES people (id),       -- a day-pass or marketplace guest
  channel          TEXT NOT NULL,                     -- 'member_app', 'marketplace', 'staff'
  during           TSTZRANGE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'cancelled',
                     'expired', 'completed')),
  credits_used     NUMERIC(8, 2) NOT NULL DEFAULT 0,
  overage_amount   BIGINT NOT NULL DEFAULT 0,
  currency         CHAR(3) NOT NULL,
  idempotency_key  TEXT NOT NULL,
  UNIQUE (tenant_id, idempotency_key),
  CHECK (num_nonnulls(membership_id, guest_person_id) = 1),
  EXCLUDE USING GIST (resource_id WITH =, during WITH &&)
    WHERE (status IN ('held', 'confirmed'))   -- meeting rooms; desk pools use counters
);
```

The occupier side, where the platform tenant is the lessee:

```sql
CREATE TABLE occupier_leases (           -- leases the tenant's own entities hold as lessee
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lessee_entity_id    UUID NOT NULL REFERENCES legal_entities (id),  -- role 'occupier'
  lessor_entity_id    UUID NOT NULL REFERENCES legal_entities (id),  -- role 'counterparty'
  asset_class         TEXT NOT NULL CHECK (asset_class IN ('real_estate', 'vehicle',
                        'equipment', 'it', 'other')),
  location_address_id UUID,               -- Addresses & Geocoding; null for mobile assets
  description         TEXT NOT NULL,
  commences_on        DATE NOT NULL,
  ends_on             DATE NOT NULL,
  currency            CHAR(3) NOT NULL,
  is_embedded         BOOLEAN NOT NULL DEFAULT FALSE,  -- found inside a service contract
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'terminated',
                        'expired'))
);

CREATE TABLE occupier_lease_payments (   -- the payment schedule the lessee owes
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  occupier_lease_id UUID NOT NULL REFERENCES occupier_leases (id),
  kind              TEXT NOT NULL CHECK (kind IN ('fixed', 'index_based', 'variable',
                      'nonlease_component', 'incentive')),
  amount            BIGINT NOT NULL,
  frequency         TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual',
                      'one_time')),
  valid_during      DATERANGE NOT NULL,
  in_optional_period BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE lease_accounting_measurements ( -- one row per recognition or remeasurement
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  occupier_lease_id  UUID NOT NULL REFERENCES occupier_leases (id),
  standard           TEXT NOT NULL CHECK (standard IN ('asc_842', 'ifrs_16', 'gasb_87')),
  trigger            TEXT NOT NULL CHECK (trigger IN ('commencement', 'modification',
                       'term_reassessment', 'purchase_option_reassessment',
                       'contingency_resolved', 'impairment')),
  effective_on       DATE NOT NULL,
  classification     TEXT CHECK (classification IN ('finance', 'operating')), -- null: IFRS 16
  exemption          TEXT CHECK (exemption IN ('short_term', 'low_value')),
  term_end_assumed   DATE NOT NULL,       -- includes options reasonably certain
  discount_rate      NUMERIC(7, 6) NOT NULL,
  rate_basis         TEXT NOT NULL CHECK (rate_basis IN ('implicit', 'ibr', 'risk_free')),
  rate_evidence      TEXT NOT NULL,       -- how the IBR was derived
  liability          BIGINT NOT NULL,
  rou_asset          BIGINT NOT NULL,
  currency           CHAR(3) NOT NULL,
  policy_version     TEXT NOT NULL,
  supersedes_id      UUID REFERENCES lease_accounting_measurements (id),
  approved_by        UUID REFERENCES users (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lease_accounting_schedule_lines ( -- regenerated per measurement, never edited
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  measurement_id    UUID NOT NULL REFERENCES lease_accounting_measurements (id),
  period            DATE NOT NULL,        -- first day of the accounting period
  opening_liability BIGINT NOT NULL,
  interest          BIGINT NOT NULL,
  payment           BIGINT NOT NULL,
  closing_liability BIGINT NOT NULL,
  rou_reduction     BIGINT NOT NULL,      -- amortization or depreciation
  lease_cost        BIGINT NOT NULL,      -- single straight-line cost for ASC 842 operating
  journal_batch_id  UUID,                 -- the sync batch that posted it
  UNIQUE (tenant_id, measurement_id, period)
);
```

Design decisions behind it:

- **Amend the lease, don't replace it.** Multifamily renewals are new leases; commercial extensions and expansions amend one. Every term-bearing row (premises, recovery terms, escalations, percentage rent, commissions) carries the `amendment_id` that created it and an effective range, so the lease as of any date is a query, and base years, cumulative caps and straight-line schedules run unbroken across amendments.
- **The lessee is an entity.** `leases.lessee_entity_id` replaces the household for business tenants, with a check that exactly one is set. Personal guarantors of a commercial lease stay `lease_members` with role `guarantor`; a corporate guarantor is a legal entity linked the same way in [The Lease](/books/property-tech/the-lease#guarantors).
- **Premises are a table.** `leases.unit_id` stays as the principal suite for the core's queries, and `lease_premises` holds every suite the lease covers over time with the exclusion constraint that keeps two lessees off one suite.
- **Area is measured, agreed and pooled separately.** `area_measurements` holds the surveyor's numbers by standard and edition; `lease_premises.agreed_area` and `lease_recovery_terms.stipulated_share` hold what the lease says; pool denominators come from pool membership. A re-measurement never changes a stipulated share.
- **Recovery terms are data per lease and pool, and the calculation order is versioned.** Every reconciliation records the ledger snapshot and policy version it used, so the same statement can be reproduced for a tenant's auditor years later.
- **Estimates and true-ups are ordinary charges.** Recovery estimates are `lease_charge_schedules` under a `recovery` charge code; the reconciliation posts a true-up charge or credit; corrections are new reconciliation versions with difference charges, never edits.
- **Revenue views beside billing.** The straight-line schedule is the lessor's revenue view and the lease accounting schedule is the lessee's; both are regenerated from facts under a policy version, as [Recognition Schedules](/docs/payments/accounting#recognition-schedules) prescribes, and post to the general ledger by summary journal.
- **The occupier posture is its own model.** `occupier_leases` doesn't reuse `leases`, because the lessee doesn't own the building, half the assets aren't buildings, and the money flows out through payables. Clauses and critical dates are shared, with a one-of check between the two lease kinds.
- **Index values are shared reference data.** `index_values` is the one table without `tenant_id`: a published CPI value is the same for every tenant, and escalations point at the exact rows they used.
- **Flex billing is a subscription.** Memberships bill through the Payments model's subscriptions instead of adding a fourth account type to `charges`; private offices are units with an exclusion constraint, rooms are resources with the reservations pattern.
- **Emit events.** `lease.amended`, `critical_date.approaching`, `critical_date.missed`, `reconciliation.issued`, `sales_report.overdue`, `coi.deficient`, `escalation.applied` and `lease_measurement.remeasured` drive notifications, owner reporting and the general ledger sync ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Commercial records are audited by tenants, auditors, lenders and courts, often years after the fact:

- **Reconciliations.** Each statement, its version, the ledger state it was computed from, the terms in force for each lease, the order of operations, and the date it was delivered (which starts the tenant's audit window). Superseded versions stay readable.
- **The lease as amended.** Every amendment with its document and effective date, and each abstracted field with its source section, who abstracted it (person or model and version) and who verified it.
- **Critical dates and decisions.** When each option window opened, who was notified, what was decided and when. "We never got the reminder" is a common dispute, so notifications are logged with delivery status ([Notifications & Consent](/docs/architecture/notifications#the-message-log)).
- **Sales and percentage rent.** Every sales report as submitted, every correction and audit adjustment, and the calculation that produced each percentage rent charge.
- **Insurance compliance.** Each certificate, the requirement it was checked against, the finding, the reviewer, and any landlord-purchased coverage billed back.
- **Lease accounting.** Every measurement and remeasurement with its trigger, discount rate and the evidence for it, classification tests, approvals, and the journal batches that posted each schedule line. The FASB's review names the discount rate and modifications as the judgment-heavy areas, so those inputs need their reasoning stored, not just their values.
- **Measurements.** Each area measurement with standard, edition, surveyor and date, and every share change it caused.

The mechanics (typed actors, append-only history, snapshots of what changes underneath) are in [Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you); retention periods are in [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds).

## What This Means for the System You Build

- **Model the lessee as a company and the lease as amendable.** One lease row over a decade of amendments, with every term effective-dated and tied to the amendment that set it.
- **Store area three ways:** measured (by standard and edition), agreed in the lease, and pooled for recoveries, and compute from whichever the lease names.
- **Make recovery terms per lease and per pool,** including share method, base year or stop, gross-up, cap method, exclusions, admin fee and audit rights, and never compute from the "NNN" label.
- **Version the reconciliation** and keep the ledger snapshot and policy behind it, because the tenant's auditor will ask for both.
- **Treat estimates as schedules and true-ups as charges,** reusing the core ledger rather than a parallel CAM ledger.
- **Keep sales reports as first-class, append-only rows** and support cumulative and non-cumulative percentage rent with prorated and tiered breakpoints.
- **Name the exact index series** for CPI escalations, use unadjusted values, and record which published values each escalation used.
- **Run a straight-line schedule beside billing** for lessors and regenerate it on modification; keep CPI increases and variable payments out of it.
- **Turn every option, deadline and expiry into a stored critical date** with an owner and a status, and log the reminders.
- **Check insurance requirements against certificate evidence,** with expiry as a critical date.
- **Build the occupier side as its own posture,** with measurements and remeasurements as rows, ASC 842 and IFRS 16 schedules from the same inputs, and equipment as a first-class asset class.
- **Sell flex as subscriptions and bookings:** private offices as units, rooms as reservable resources, memberships billed in periods with credits.
- **Exchange data on a standard** (OSCRE's entities at the boundary) and keep a crosswalk for every outside identifier.

## References

**Standards**

- [FASB: Accounting Standards Update No. 2016-02, Leases (Topic 842), Section A (PDF)](https://storage.fasb.org/ASU%202016-02_Section%20A.pdf), lessee recognition, finance and operating cost patterns, the 12-month election, the five classification criteria, lease payments including index-based payments, reasonably certain options, initial direct costs and the broker commission example, lessee and lessor remeasurement, lessor straight-line income and variable payments
- [FASB: In Focus, ASU 2016-02 Leases (Topic 842) (PDF, revised June 2020)](https://storage.fasb.org/FIF%20ASU%202016-02%20Leases%20(Topic%20842)%20(Rev%206-3-20).pdf), issue date, lessor accounting largely unchanged, private-company risk-free rates, differences from IFRS 16, effective dates
- [FASB: Post-Implementation Review of Topic 842, Leases, public roundtable materials (PDF, September 12, 2025)](https://storage.fasb.org/September%2012%202025%20Leases%20Roundtable%20Discussion%20Materials_updated.pdf), the lease definition, the IBR definition, ASU 2021-09's by-class risk-free election, modification and separate-contract tests, embedded leases, nonlease components, operating lease collectibility for lessors
- [IFRS Foundation: IFRS 16 Leases](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/), the single lessee model, recognition for leases over 12 months unless low value, effective date
- [IFRS Foundation: IFRS 16 Project Summary and Feedback Statement (PDF, January 2016)](https://www.ifrs.org/content/dam/ifrs/project/leases/ifrs/published-documents/ifrs16-project-summary.pdf), depreciation separate from interest, short-term and low-value exemptions with the personal computer example
- [BOMA: Floor measurement standards](https://boma.org/boma-standards/), current editions of the office, industrial, gross areas, multi-family and hospitality, retail and mixed-use standards, rentable area and load factors
- [OSCRE](https://www.oscre.org/), the nonprofit's role and the Industry Data Model's scope and use cases
- [U.S. Bureau of Labor Statistics: CPI questions and answers](https://www.bls.gov/cpi/questions-and-answers.htm), CPI-U and CPI-W in escalation agreements, ambiguity of "CPI", unadjusted and national or regional indexes for escalation

**Lease documents**

- [Duolingo, Inc.: Lease for 141 S. St. Clair Street, Pittsburgh (Form 10-K exhibit, 2022)](https://www.sec.gov/Archives/edgar/data/1562088/000156208822000039/new_leasexexecutedxxsignedx.htm), term and commencement, rentable area and deemed share, base years, cumulative controllable cap, 95% gross-up, exclusions, audit right, window and threshold, extension options and notice, ROFR, TI allowance, conditional abatement, broker and commission responsibility, insurance certificates
- [Strategic Realty Trust: Restaurant lease, Sunset Triangle Investors and La Conq (Form 10-K exhibit, 2021)](https://www.sec.gov/Archives/edgar/data/1446371/000144637121000007/exhibit108leaseagreement.htm), floor-area pro-rata share, management charge, monthly estimates and statement and rebate deadlines, 3% annual increases, percentage rent over a natural breakpoint, sales reporting and audit, broker warranties, insurance certificate and deductible requirements

**Platforms**

- [Entrata: Commercial](https://www.entrata.com/solutions/commercial), expense pools, NNN reconciliations, abstracts, clause and exclusion tracking, tenant insurance compliance, rent roll
- [RealPage: Commercial](https://www.realpage.com/commercial/), CAM billing and reconciliation, percentage rent from reported sales, CPI escalations, tenant portal with insurance certificate uploads
- [Yardi Breeze: Commercial features](https://www.yardibreeze.com/commercial-features/), lease types, expense pools and caps, estimate frequencies, percentage rent and retail sales, escalations, tenant portal add-on, pricing
- [MRI Software: Managing real estate expense recoveries for retail](https://www.mrisoftware.com/au/blog/managing-real-estate-expense-recoveries-retail), the annual recoveries cycle, estimates in recurring charges, reconciliation after year-end
- [MRI Software: Retail](https://www.mrisoftware.com/au/solutions/retail/), recoveries, percentage rent and breakpoints
- [MRI Software: Northern Mall selects MRI (September 16, 2014)](https://www.mrisoftware.com/news/northern-mall-sdn-bhd-selects-the-award-winning-mri-commercial-property-management-software/), prorated breakpoints, cumulative and noncumulative methods, offsets
- [MRI Software: Commercial real estate software](https://www.mrisoftware.com/products/commercial-real-estate-software/), recoveries, lease abstraction, tenant portal
- [MRI Software: Lease accounting](https://www.mrisoftware.com/solutions/lease-accounting-software/), ASC 842, GASB 87 and IFRS 16 across property, vehicle and equipment leases, critical dates
- [MRI Software: Products](https://www.mrisoftware.com/products/space-management-software/), IWMS, workplace management and room and desk booking
- [AppFolio: Commercial property management software](https://www.appfolio.com/commercial-property-management-software), CAM tracking and reconciliation in Core
- [Rent Manager: Commercial](https://www.rentmanager.com/commercial/), CAM recovery and reconciliation, recoverable expense markup, retail sales report, escalations
- [Verdantix: VTS Platform](https://atlas.verdantix.com/vts/vts-platform), VTS Lease and the other VTS products
- [CommercialCafe](https://www.commercialcafe.com/), commercial and coworking listings and operator tools
- [Yardi Kube](https://www.yardikube.com/), member contracts, billing, meeting rooms, access and IT management, listing network, API
- [APIs.io: Yardi](https://apis.io/providers/yardi/), the OSCRE-based Commercial Data Interface and the Kube API with webhooks
- [Deskpass](https://www.deskpass.com/), day passes, conference rooms, company plans and network size
- [Visual Lease](https://visuallease.com/), lease management and accounting for ASC 842, IFRS 16 and GASB 87, equipment and fleet, AI abstraction, CoStar Group ownership
- [Trintech: CoStar Real Estate Manager](https://www.trintech.com/partner/costar-real-estate-manager/), lease accounting and administration for ASC 842, IFRS 16 and GASB 87 as a subledger
- [FinQuery](https://finquery.com/), formerly LeaseQuery, lease accounting standards supported, schedules and journal entries
