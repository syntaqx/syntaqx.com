+++
title = "Military & Specialty Housing"
description = "Privatized military housing (BAH rent, allotments, tenant rights, SCRA), manufactured housing lots and homes, and single-family and build-to-rent operations."
category = "Property Tech Industry"
order = 1726
part = "Other Property Types"
tags = ["property-tech", "military-housing", "manufactured-housing", "single-family-rental", "build-to-rent", "data-model"]
+++

Three kinds of housing sit close enough to apartments that a multifamily platform can run them, and far enough that a platform built only for apartments runs them badly. **Privatized military housing** is family housing on or near an installation, owned and operated by a private partner under a long-term deal with a military department, where rent is set by the resident's housing allowance rather than by the market, is paid by allotment out of military pay, and is overseen by the installation and the service as well as by the owner. **Manufactured housing** is a community of lots, where the operator often rents only the ground and the resident owns a titled home that sits on it, so the platform tracks two assets with two owners and two sets of law. **Single-family rental and build-to-rent** is houses: one door per building, either scattered across a metro or built together as a rental community, where the operator manages many small properties with keys, yards and homeowners associations of their own.

Each changes a different part of the core model in [The Property Business](/books/property-tech/property-business#the-core-data-model). Military housing changes who sets the price and how the money arrives: the household is a service member with a pay grade, a dependency status and orders, the rent is an effective-dated government rate, and the payment is a file from a payroll system. Manufactured housing changes what a unit is: the leased thing is a lot, and the home on it is a separate record with a title, serial numbers and an owner who may sell it to the next resident. Single-family changes the shape of the portfolio: a property is a set of houses, each in its own neighborhood, often inside someone else's association. This chapter covers what each adds and what to build. Student housing, the other segment that bends the lease, is in [Student Housing](/books/property-tech/student-housing).

## How the Platforms Do It

The enterprise suites sell military housing as an edition of their multifamily product, and the small-portfolio products sell manufactured housing as an edition or module. Single-family sits in the core product of most vendors, with specialists around it for showings and access. As of October 2026, from each vendor's own pages:

| Vendor | Military | Manufactured housing and RV | Single-family and BTR |
| --- | --- | --- | --- |
| **Entrata** | A military edition: automatic yearly BAH rate updates, promotions, demotions and reconciliations under "automated MAC payment processes," Air Force Schedule G and Army PAM oversight reports, waitlist priorities set to each installation's "waterfall," pre-move-in submission of orders, power of attorney and leave and earnings statements, identification of deployed service members, and work-order response and due-time reporting with exclusions | An edition with "lot management and long-term leasing" on the same accounting and resident portal | BTR named in its S-1 among the housing types on its platform |
| **RealPage** | A military version of its multifamily leasing and rents product that "updates BAH rates every year," is "integrated with MAC," "posts payment files to the resident ledger" and "generates MIMO files each month" | Not described | Sold as Buildium for "scattered-site homes" |
| **Yardi Breeze Premier** | Not on Breeze pages (Yardi's enterprise military product pages couldn't be opened) | Tracks "community-owned homes, resident-owned homes and lots," records "changes in home ownership and lot rental," tracks "the title process for home purchase and sales" and the "manufacturer, make, model and title of homes and RVs," and claims to "control against unauthorized rent increases"; utility billing add-on; price on request | Residential edition |
| **Rent Manager** | Not described | Treats homes "as assets" leased "just like units," and on lease creation "generates one for the unit and the home asset"; asset receivables, payables, "home loans, rehabs"; metered utilities; a separate RV park and campground edition with nightly reservations, online booking, seasonal, weekend and holiday rates, and tax calculations | Residential edition |
| **Rently** (specialist) | | | Self-guided tours with "ID verification and renter screening before every tour," lockboxes opened by "a time-sensitive code," "time-restricted, one-time codes delivered per showing" on smart locks, and an entry log of "who, when, how long" |

Three patterns are worth taking whichever product you start from:

- **The allowance table is the price list.** Both military editions lead with the same claim: they load the new BAH rates every year and recompute what each household owes. Neither describes a pricing engine ([Revenue Management & Pricing](/books/property-tech/revenue-management#what-gets-priced)), because in privatized housing the operator doesn't set the rent; the Department of Defense does, through the allowance.
- **The payment arrives as a file, not a resident action.** "Posts payment files to the resident ledger" (RealPage) and "MAC payment processes" with reconciliation (Entrata) describe the same job: import a periodic file of allotments, match each line to a lease, and work the exceptions.
- **The home is an asset next to the unit.** Yardi Breeze and Rent Manager both keep the home as its own record with an owner, a title and a make and model, linked to the lot. A design that makes the home a unit attribute can't record a sale between residents, a home moved off a lot, or a community-owned home rented on a resident-owned lot's neighbor.

For single-family, the large platforms treat a house as a property with one unit, and the differences live in the specialists: self-showing and access, owner reporting for one-house owners, and association dues. Where vendors describe the same capability, this chapter uses its own words; MAC, PAM and Schedule G are the military's terms, not a vendor's, and appear as such.

## Privatized Military Housing

In 1996 Congress gave the Department of Defense authorities to obtain private-sector financing and management for housing repair and construction, and by GAO's 2018 count DoD "has since privatized 99 percent of its domestic housing." The program is the Military Housing Privatization Initiative (MHPI). Each project is a long-term partnership between a military department and a private company that owns or leases the homes, finances renovation and construction, and operates the community: leasing, rent, maintenance and the resident relationship. The company runs a property management platform like any multifamily operator; the differences are the people, the price, the payment and the oversight.

**The residents are service members and their households.** A lease in privatized housing is signed by, or on behalf of, a service member whose eligibility comes from their orders to the installation. The platform holds what an apartment platform never asks: branch, pay grade, whether the member draws the with-dependents or without-dependents allowance, the installation they're assigned to, and documents an apartment would never collect. Entrata's military edition lets members submit orders, a power of attorney and a leave and earnings statement before move-in and see what's outstanding. A power of attorney matters because a spouse often signs and pays while the member is deployed. These are sensitive records: orders show where a member is going and when, and the leave and earnings statement shows pay. Keep them in a restricted document store with access logged ([Audit Trails](/docs/architecture/audit-trails#log-access-not-just-changes)), and set retention by record type ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)).

**Who gets a home, and in what order.** Installations keep waitlists, and the order isn't first-come first-served. Members assigned to the installation come first; within that, priority depends on the service's rules and the project's agreement. When occupancy falls, a project's agreement can open homes to other groups in a fixed order that the industry calls the tenant **waterfall**. A 2015 Fort Campbell account describes retirees and DoD civilians being allowed to rent homes there, with active-duty families first, families already on a move list ranked above civilians, and a family waitlist that had fallen from "well over 1,000" to about 100. Entrata's edition sets "custom priorities" based on each installation's "waterfall needs." The waterfall is per installation and per project, and it changes when occupancy changes, so it's rules as data: an ordered list of eligibility tiers, each with its own conditions, effective-dated ([Rules as Data](/docs/architecture/rules-as-data#stages-and-ordered-rules)). A waitlist entry carries the household's tier, the date that orders their place (often the date of the orders or of arrival, per local policy), and the home size they're eligible for, and every offer, refusal and skip is recorded, because a family passed over will ask why.

**Unaccompanied housing.** Junior unaccompanied members usually live in barracks rather than family housing. GAO reported in 2023 that "hundreds of thousands of service members live in military barracks," that some barracks it observed were in poor condition, and that DoD "doesn't have reliable information about barracks conditions." The same report notes privatized as well as government-owned barracks. Government barracks are assigned, not leased, and charge no rent, so they belong in a housing assignment system rather than a resident ledger; privatized unaccompanied housing, where it exists, is leased like family housing, often by the bed or room. The modeling is the bed model from [Student Housing](/books/property-tech/student-housing#beds-rooms-and-bed-types): a bed under a unit, an assignment over a date range, and a lease where rent is charged. I haven't found a public source describing how any vendor handles barracks, so this chapter goes no further than the shape.

## Rent Is the Allowance

A service member who doesn't live in government quarters receives the Basic Allowance for Housing (BAH). The amount "depends on your location, pay grade, and whether you have dependents," and is normally the rate for where the member is assigned, not where they live. Rates are published annually and take effect on January 1: the 2026 rates rose an average of 4.2% on January 1, 2026. Rates are set for military housing areas from local rent and utility data. Outside the US, members without government housing draw the Overseas Housing Allowance (OHA) instead, a different allowance with its own rules.

In privatized housing the rent is the allowance. An Army housing partner's 2009 explainer describes the resident occupancy agreement starting a rent allotment "which equals the Soldier's BAH entitlement for his or her rank," and says the allotment "should reflect any BAH increases or decreases." Federal law backs the price with a limit on everything else: a privatized landlord "may not impose on a tenant of the housing unit a supplemental payment, such as an out-of-pocket fee," beyond rent, with exceptions for optional services like a gym or a parking space and certain non-essential utilities, and that applies even when the tenant's allowance is less than the rent ([10 U.S.C. 2891a(f)](https://www.law.cornell.edu/uscode/text/10/2891a)). Rental guarantees and differential lease payments are allowed only if they don't require an out-of-pocket fee beyond the BAH the tenant receives. The fee rules that dominate apartment pricing (application fees, amenity fees, all-in price disclosure) mostly collapse here into one question: is this charge optional?

That makes the rent a function, not a number on the lease:

`rent = allowance(military housing area, pay grade, dependency status, effective date)`, with project-specific adjustments the agreement allows. The function has inputs that change mid-lease, and the platform has to reprice the lease every time one does:

- **January 1.** New rates publish and the whole community reprices on one date. Both military editions advertise the annual update; the job is to load the published table, diff it against the old one, and generate new rent segments for every affected lease effective January 1, before the first allotment file of the year arrives.
- **Promotion or demotion.** A promotion raises the member's pay grade and the allowance with it, effective the date of rank; a demotion lowers it. Entrata's edition lists both. The new rent starts on the effective date, which is often learned weeks later, so the change is retroactive: post the difference for the past periods as adjustment charges, never by editing posted charges ([Effective Dating & History](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Dependency change.** A marriage, a birth or a divorce can move a member between the with-dependents and without-dependents rate.
- **Rate protection.** BAH has rate protection: a member who stays at the same duty station keeps their allowance even if the published rate for the area falls, while a member who moves gets the current rate for the new area. So the member's entitlement isn't always the current table's row. Store the entitlement per member as its own effective-dated record, with the rate row it came from and the reason (annual table, promotion, protection carried forward), rather than recomputing it from today's table.
- **Dual-military households.** When both spouses serve, the same Army explainer says rent equals "the senior grade member's BAH" at the with-dependents rate, and the other member keeps their own allowance. One household, two service members, one of whom sets the price.

The allowance also caps what a project earns, which is why its changes reach the owner's books. GAO's 2021 report on BAH found that DoD's rate reductions were the same dollar amount for members of the same pay grade and dependency status, while payments to privatized projects to offset the lost revenue had to differ by location, so some projects were paid more or less than the revenue they lost, in some cases by $1 million or more; the FY2022 NDAA then based those payments on national average rates. For the platform this is owner reporting: the difference between the allowance-driven rent roll and any government make-whole payment is its own revenue line, reconciled separately.

The allowance table is reference data published by the government and loaded into every tenant that runs military housing. Treat it as effective-dated rule rows keyed by military housing area, pay grade and dependency status ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), loaded once per publication with the source file kept, and never edited in place: a correction DoD publishes is a new version with its own load date, so a rent computed in March can be reproduced in December.

## Allotments, Files and Reconciliation

Most privatized-housing rent isn't paid by the resident through a portal. The member authorizes an **allotment**, a standing deduction from military pay sent to a payee, and the housing payment leaves the paycheck before the member sees it. The 2009 Army explainer describes the Military Assistance Company (MAC) as "an allotment management contractor" that collects and manages BAH payments, reports to the Army and works with an automated system linked to the Defense Finance and Accounting Service (DFAS), with BAH paid to the housing partnership on the last day of each month. If the allowance doesn't arrive as an allotment, the member is still responsible for rent until it's fixed. Both military editions describe importing these payments: RealPage "posts payment files to the resident ledger," and Entrata reconciles MAC payments.

The work is file reconciliation, the same shape as any bank or processor file ([Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation)):

1. **Start and stop.** The lease signing starts the allotment, and move-out stops it. The platform's job is to know, per lease, whether an allotment should be running, for how much, from when, and whether the start or stop request has been sent and confirmed. An allotment that wasn't stopped pays a former resident's rent for a home they left; one that wasn't started leaves a family delinquent through no act of their own.
2. **Import.** Each file is stored as received, with its period, its control totals and a hash, and parsed into lines. Re-importing the same file is a no-op ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
3. **Match.** Each line matches to a service member and through them to a lease, by the identifier the file carries. Matching is where it breaks: a member who transferred to another home, a dual-military household, a line for a member who moved out last month. Lines that don't match exactly go to an exceptions queue, never to a guess.
4. **Post.** A matched line becomes a payment on the lease and is applied to the rent charge for the period, like any payment ([Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned)). The allotment amount and the rent should be equal; when they aren't (the file carries last month's rate after a promotion, or a protected rate the platform didn't know), the difference is a balance on the lease that someone must explain, not a write-off.
5. **Close.** The file's total ties to the bank deposit, and every line is posted, returned, or in the exceptions queue with an owner.

RealPage also says its edition "generates MIMO files each month." Outbound files to the program (occupancy, move-ins and move-outs, by whatever the service's format requires) are the other half of the interface: generate them from leases, keep each as sent, and record the acknowledgment.

**Overseas and foreign currency.** Outside the US the allowance is OHA, not BAH, and where a housing operator bills overseas the rent, the allotment and the bank account may not share a currency. The core model already carries a currency on every amount; what an overseas allotment adds is a stored exchange rate and both amounts on the payment, with the gain or loss posted separately ([Multi-Currency](/docs/payments/multi-currency#storing-both-amounts)). I couldn't open a public vendor page describing overseas allotments, so treat the requirement as the shape, not a feature list.

## Oversight and the Tenant Bill of Rights

A privatized project answers to the military department as well as to its lenders and owners, and the service asks for its own reports. Entrata's edition names two: Air Force **Schedule G** and Army **PAM** reports, which it calls "project oversight reports required by the military," and it tracks work-order response and due times to report performance quarterly, with the ability to exclude specific work orders from the metric. The formats belong to each service and change, so build them as report definitions over the platform's own data, and snapshot each submitted report with the data as of its run, because a later correction to a work order must not silently change a report already sent ([Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)). Excluding a work order from a performance metric is a decision someone will be asked about: record who excluded it and why.

The rules tightened after reports of poor conditions in privatized homes. The National Defense Authorization Act for Fiscal Year 2020 (Pub. L. 116-92, December 20, 2019) added a statutory **Tenant Bill of Rights** and **Tenant Responsibilities**, now [10 U.S.C. 2890](https://www.law.cornell.edu/uscode/text/10/2890), plus management requirements in 2891a and a dispute process in 2894. The parts that become software requirements:

| Requirement | Statute | What the platform does |
| --- | --- | --- |
| A maintenance history of the home "before signing a lease" | 2890(b)(3) | Produce a unit's work-order history from records keyed to the unit, not the lease, so history survives every resident |
| An electronic work order system that lets the tenant "view work order history," status and other information | 2890(b)(11), 2891a(d)(12) | Resident portal access to work orders with status and history; the timeframe told at submission |
| Prompt repairs with notice of the required timeframe, and relocation at no cost when a habitability repair requires it | 2890(b)(12) | A promised-by date on every work order; a relocation record with its costs carried by the project |
| A written lease with clearly defined terms, and a plain-language briefing before signing and 30 days after move-in | 2890(b)(4), (b)(5) | Briefing dates as lease milestones with completion recorded |
| A common lease, and common documents and processes across installations | 2891a(d)(13)(A), 2890(b)(18) | Lease templates approved at the department level, versioned, with installation and state addenda |
| No non-refundable fees; rent credits not "arbitrarily held" | 2890(b)(17), 2891a(f) | Fee catalog flagged optional or prohibited; credits applied, not parked |
| Reasonable advance notice before entry, except emergencies | 2890(b)(16) | Entry notice records on work orders, as in [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#entry-notice) |
| Disclosure of bonus structures for community managers and of bonuses tied to maintenance | 2891a(d)(1) | Not a resident feature; owner and oversight reporting |
| A walkthrough inspection before a prospective tenant signs | 2891a(d)(3) | An inspection record linked to the lease before signature |

The tenant responsibilities in 2890(c) (report hazards in a timely manner, standard upkeep, allow reasonable access, read the lease materials) are attached to the lease like any rules addendum. The section also requires that the rights and responsibilities documents be attached to each lease, and the FY2020 Act directed DoD guidance on a universal lease that includes them plus any state-required addendum. Two practical consequences: the lease template ([Templates and Clause Libraries](/books/property-tech/the-lease#templates-and-clause-libraries)) is not the operator's to write alone, and every lease must carry the document versions in force when it was signed.

**Dispute resolution and segregated rent.** When other routes are exhausted, a tenant may enter a formal dispute process ([10 U.S.C. 2894](https://www.law.cornell.edu/uscode/text/10/2894)). Its clock is in the statute: the request is forwarded to the commander, housing office and landlord within 2 business days; the housing office investigates, including a physical inspection, within 7 business days; and the installation or regional commander decides within 30 calendar days of submission, never later than 60. The decision is final, may order remediation in no less than 10 business days, and if the landlord misses that deadline, amounts payable to it are reduced by 10 percent for each five-calendar-day period the problem remains. During a maintenance or habitability dispute the tenant may ask that all or part of their BAH and allotted pay be **segregated**, held so the landlord can't use it while the process is pending, with a commander's approval (2890(b)(15)), and the decision says how the held money is distributed.

Segregation is the requirement that breaks an apartment ledger. The rent is still charged and still paid, so the resident isn't delinquent and no late fee or collection step may fire; but the money isn't the landlord's yet. Model it as a case on the lease with its statutory dates, and route the period's payments to a held liability rather than applying them to rent ([Payment Application Order](/books/property-tech/charges-and-resident-ledgers#payment-application-order)); the decision then releases them to rent, returns them to the tenant as a credit or refund, or splits them, each as ledger entries that point at the decision. Every deadline is computed and stored when the case opens ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), the 10 percent reductions are adjustments against the landlord's receipts with the decision as their reason, and delinquency rules ([Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction#notices)) check for an open segregation before they act.

## Deployment, PCS Orders and the SCRA

Service members move on orders, and federal law lets them leave a lease when they do. Under the Servicemembers Civil Relief Act's lease provision ([50 U.S.C. 3955](https://www.law.cornell.edu/uscode/text/50/3955)), a lessee may terminate a residential lease after entering military service, after receiving orders for a permanent change of station (PCS) or a deployment of at least 90 days, or under a stop-movement order. The rules the platform encodes:

- **Notice.** Written notice plus a copy of the orders, delivered by hand, private carrier, certified mail with return receipt, or electronic means (added in 2021). Store the notice, the orders and how and when they arrived.
- **Effective date.** For monthly rent, termination is effective "30 days after the first date on which the next rental payment is due and payable" after notice; other leases end on the last day of the month following the month of notice. Compute the date when the notice arrives and store it on the lease, with the rule version that computed it.
- **Money.** Rent through the effective date is prorated; "The lessor may not impose an early termination charge"; rent paid in advance for periods after termination is refunded within 30 days. Knowingly holding a member's property or deposit to collect rent accruing after termination is a misdemeanor. So the termination workflow suppresses lease-break fees and concession clawbacks for this reason code, and the refund deadline is a tracked task.
- **Dependents and survivors.** Termination ends a dependent's obligation under the lease too. Since 2018 a spouse or dependent may terminate within one year of the member's death in service, and since 2019 a member with a catastrophic injury or illness (or a spouse or dependent, if the member lacks capacity) may terminate within one year.

The SCRA applies to any landlord renting to a service member, not only privatized housing, so this is a reason code in [The Lease](/books/property-tech/the-lease#early-termination) and [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#the-final-account-statement) for every property type; it's here because military housing sees it on every move-out. In privatized housing a PCS is the normal end of a lease, and the allotment stop and the termination date have to agree.

**Deployment.** A deployed member stays a resident, and the household may stay too. Entrata's edition helps "quickly identify deployed service members." The platform records deployments as date ranges on the service member, because they change who is reachable (the spouse, through a power of attorney), what notices are delivered how, and how delinquency and entry are handled. A home left empty during a deployment is still occupied for occupancy reporting.

## Manufactured Housing

A manufactured housing community leases lots. The resident usually owns the home and rents the ground under it; the community may also own homes and rent them, or sell homes to residents. Yardi Breeze describes tracking "community-owned homes, resident-owned homes and lots," and Rent Manager generates a lease "for the unit and the home asset" at once. The lot is the unit in the core model (`units.kind = 'lot'`), counted for occupancy and leased alone; the home is a separate asset with its own owner, title and life.

**The home is titled property, often personal property.** A manufactured home is built in a factory to the HUD construction and safety standards. Each transportable section carries a permanent HUD certification label whose number is a three-letter code for the production inspection agency plus a six-digit number ([24 CFR 3280.11](https://www.law.cornell.edu/cfr/text/24/3280.11)), and each home has a data plate near the main electrical panel with the manufacturing plant, serial number, model and date of manufacture ([24 CFR 3280.5](https://www.law.cornell.edu/cfr/text/24/3280.5)). A double-wide has two sections, so two labels and often two serial numbers. Ownership is evidenced by a state title, and whether the home is personal property or real property depends on state law and on what's been recorded. In California, for example, homes not on a recorded permanent foundation have titles "similar to automobiles" issued and tracked by the state housing department, while recording an HCD 433A permanent-foundation document reclassifies the home as real property taxed like a site-built house. So a home record holds identifiers for each section, the title state and number, the property classification, and the lien holders, and a sale is a title process, not a lease event. Yardi Breeze tracks "the title process for home purchase and sales."

**Two ledgers can meet on one lot.** For a resident-owned home, the lease is a lot lease: lot rent, perhaps utilities and fees. For a community-owned home, the resident rents the home and the lot together, or rents the home with an option to buy; Rent Manager lists "home loans" and rehabs among its asset tools, which describes communities that finance home purchases. Keep lot rent and home rent as separate charge codes on the lease's schedules, because rent-increase law usually governs the lot rent and the home's economics belong to whoever owns it.

**Home sales and ownership changes.** When a resident sells their home in place, a new person buys a titled asset and applies for a new lot lease; the community typically has to approve the buyer as a resident, and the seller's lease ends. The platform's job is to keep the chain: the home's ownership history, the title transfer's status, the lot lease that ended, the new one that started, and any balance owed by the seller. A home can also leave a lot, arrive on one, be abandoned or be repossessed by a lender, so a home's placement on a lot is a date range, and a lot can be vacant with no home, vacant with a community-owned home for sale, or occupied.

**State law is its own body.** Many states have a manufactured-home landlord-tenant act separate from the general residential one, and its rules are strongest exactly where the resident is least mobile: moving a home is expensive, so the law limits increases and protects the sale. Florida's Mobile Home Act is a dense example. A park owner must give written notice "at least 90 days before any increase in lot rental amount," stating the current and new amounts and the effective date, identifying all affected homeowners, and listing pass-through charges separately with their start and end dates; a homeowners' committee of up to five may meet the owner no later than 60 days before the effective date, where the owner must explain the material factors behind the increase and give a written summary ([Fla. Stat. 723.037](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0723/Sections/0723.037.html)). When an owner offers a park for sale, Florida gives the homeowners, through their association, the right to buy it at the owner's price and terms within 45 days of the mailed notice, with 10 more days if the owner later offers a lower price ([Fla. Stat. 723.071](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0723/Sections/0723.071.html)). Other states have their own notice periods, purchase rights and limits. These are rule rows per jurisdiction: notice lead time, required notice content, and the events that trigger a purchase right ([Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule)). Yardi's "control against unauthorized rent increases" is the same idea from the vendor side: an increase can't take effect unless a compliant notice was sent in time.

**RV sites.** Many communities rent RV sites next to home lots, some by the month and some by the night. Yardi Breeze tracks RVs' make, model and title alongside homes, and Rent Manager sells a separate RV park edition with nightly reservations, online booking, seasonal, weekend and holiday rates, and tax calculations. A long-term RV site is a lot with a monthly lease; a nightly site is a stay, which is the Short-Term Rentals model of reservations and lodging taxes ([Short-Term Rentals](/books/property-tech/short-term-rentals)). Don't force one into the other: a site can be monthly one season and nightly the next, which is a change of use on the unit over time.

**Utilities.** Communities often own the water and sewer system, or sit behind one master meter, and bill residents for usage. Yardi Breeze sells a utility billing add-on for this edition, and Rent Manager's metered utilities module "calculates rates and charges for residents." Utility billing, submetering law and invoice processing are in [Utilities & Energy](/books/property-tech/utilities-and-energy#submetering-law-and-licensing); what manufactured housing adds is that the community may be the utility, so meter reads per lot and rate rules may come from a state utility regulator rather than a lease addendum.

## Single-Family Rental and Build-to-Rent

A single-family rental (SFR) portfolio is houses. In the core model, a scattered-site property is a set of houses under one owner and one jurisdiction, with one `buildings` row per house and one dwelling `units` row in each; build-to-rent (BTR) is a community of houses or townhomes built to be rented, which looks like a horizontal apartment community: one property, many buildings, a leasing office or none, shared amenities. Entrata's S-1 lists "single-family build-to-rent ("BTR") communities" among the housing types on its platform, and RealPage sells Buildium for "scattered-site homes." The data model barely changes. The operations do:

**Scattered-site maintenance.** Every house is its own trip. A work order in an apartment community is a walk across the property; in a scattered portfolio it's a drive, often to a vendor rather than staff, with a lockbox code or a resident appointment, and the yard, roof, HVAC and water heater are the operator's, not shared. That is field service: routing, appointments and proof of work, covered in [Dispatch & the Day of Service](/books/field-operations/dispatch) and [Proof of Service](/books/field-operations/proof-of-service). Make-ready turns include exterior work and utilities that must be transferred into the owner's name between residents, since each house has its own meters.

**Self-showing and lockboxes.** With no leasing office near the house, scattered-site operators tour by letting the prospect in. Rently describes its version: "ID verification and renter screening before every tour," a lockbox opened by "a time-sensitive code to open the box, retrieve the key," or "time-restricted, one-time codes delivered per showing" on a smart lock, and a log of every entry. The pattern (verify, issue a short-lived single-use credential, log the entry, revoke) belongs with access control and touring in [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control) and [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#self-guided-tours). What SFR adds is that the vacant house is the most exposed asset in the portfolio: a self-tour credential is the key to an empty home, and the identity check before issuing it is the control against rental scams and squatting.

**Associations around rented homes.** Many single-family homes and most BTR townhomes sit inside a homeowners association, and the owner, not the resident, is the member. Three things follow:

- **Dues.** The association bills the owner. The manager either pays the dues from the owner's funds as a payable, or, where the lease says so, passes them through to the resident as a charge. Either way the manager tracks each house's association, account number, dues amount and due dates, because a missed payment becomes a lien on the owner's house. In some states the association can collect from the tenant directly: in Florida, when an owner is delinquent, the association "may demand that the tenant pay to the association the subsequent rental payments" until the debt is paid, the tenant is protected from the owner's claims for rent paid that way, and their liability is capped at the rent they owe ([Fla. Stat. 720.3085(8)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/0720.3085.html)). A platform that receives such a demand must redirect the resident's rent, credit it against the lease, and record the demand.
- **Rules and violations.** Association rules bind the resident through the owner. Violation notices and fines arrive at the owner (often at the manager's address); the manager forwards the notice to the resident, and where the lease allows, rebills the fine. Keep the notice, the forwarding and the rebill linked, because the resident will dispute a fine they never saw.
- **Rental restrictions.** Associations can limit renting. Florida, for example, applies a rental restriction enacted after July 1, 2021 only to owners who acquire title after it takes effect or consent to it, while letting an association restrict rentals shorter than 6 months or more than three times a calendar year for all owners ([Fla. Stat. 720.306(1)(h)](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/0720.306.html)). Acquisition diligence and leasing both need to know whether a house may be rented, for how short a term, and how often.

How associations bill and govern their owners is in [Community Associations](/books/property-tech/community-associations); this chapter covers the rented house's side of it.

**Owners with one house.** Many SFR owners own one or a few houses and use a third-party manager. That raises the owner-reporting load per unit: every house gets an owner statement, a distribution and a 1099, and owner-paid expenses (association dues, property tax, insurance) flow through the manager's books or around them. Those mechanics are in [Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#owner-distributions) and [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#whose-money-it-is). Institutional SFR and BTR owners are the opposite: thousands of houses under a few entities, managed like a multifamily portfolio with a field operations problem.

## How to Build It

The deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model). `properties.segment` (with `'military'` and `'build_to_rent'`) and `beds` come from [Student Housing](/books/property-tech/student-housing#how-to-build-it); `units.kind = 'lot'` and `properties.property_type` values `'single_family'` and `'manufactured_housing'` are already in the core.

```sql
-- Military housing --------------------------------------------------------

CREATE TABLE military_installations (     -- installations a tenant's projects serve
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  name              TEXT NOT NULL,
  branch            TEXT NOT NULL CHECK (branch IN ('army', 'navy', 'air_force', 'marine_corps',
                      'space_force', 'coast_guard', 'joint')),
  housing_area_code TEXT,                 -- the military housing area its allowance resolves from
  UNIQUE (tenant_id, name)
);

ALTER TABLE properties
  ADD COLUMN installation_id UUID REFERENCES military_installations (id);  -- privatized projects

CREATE TABLE service_members (            -- the military facts about a person
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  person_id UUID NOT NULL UNIQUE REFERENCES people (id),
  branch    TEXT NOT NULL,
  component TEXT NOT NULL CHECK (component IN ('active', 'guard', 'reserve', 'retired',
              'civilian'))                -- civilians and retirees reach housing by waterfall
);

CREATE TABLE service_member_statuses (    -- pay grade, dependency and duty station over time
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  service_member_id UUID NOT NULL REFERENCES service_members (id),
  pay_grade         TEXT NOT NULL,        -- 'E-5', 'O-3', 'W-2'
  with_dependents   BOOLEAN NOT NULL,
  installation_id   UUID REFERENCES military_installations (id),
  source_document_id UUID,                -- orders or LES in the restricted document store
  valid_during      DATERANGE NOT NULL,   -- from the effective date of rank, not the day it was reported
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (service_member_id WITH =, valid_during WITH &&)
);

CREATE TABLE service_member_absences (    -- deployments, PCS and stop-movement orders
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  service_member_id UUID NOT NULL REFERENCES service_members (id),
  kind              TEXT NOT NULL CHECK (kind IN ('deployment', 'pcs', 'stop_movement',
                      'unaccompanied_tour')),
  valid_during      DATERANGE NOT NULL,
  source_document_id UUID
);

CREATE TABLE allowance_rates (            -- published BAH/OHA tables, loaded, never edited
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  allowance       TEXT NOT NULL CHECK (allowance IN ('bah', 'oha')),
  housing_area_code TEXT NOT NULL,
  pay_grade       TEXT NOT NULL,
  with_dependents BOOLEAN NOT NULL,
  amount          BIGINT NOT NULL,        -- monthly, minor units
  currency        CHAR(3) NOT NULL,
  valid_during    DATERANGE NOT NULL,     -- '[2026-01-01,2027-01-01)'
  publication_id  UUID NOT NULL,          -- the loaded source file and its version
  EXCLUDE USING GIST (tenant_id WITH =, allowance WITH =, housing_area_code WITH =,
    pay_grade WITH =, with_dependents WITH =, valid_during WITH &&)
);

CREATE TABLE allowance_entitlements (     -- what this member draws, and why
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  service_member_id UUID NOT NULL REFERENCES service_members (id),
  allowance_rate_id UUID NOT NULL REFERENCES allowance_rates (id),
  amount            BIGINT NOT NULL,      -- may differ from the rate row under protection
  currency          CHAR(3) NOT NULL,
  reason            TEXT NOT NULL CHECK (reason IN ('annual_table', 'promotion', 'demotion',
                      'dependency_change', 'pcs', 'rate_protection', 'correction')),
  valid_during      DATERANGE NOT NULL,
  EXCLUDE USING GIST (service_member_id WITH =, valid_during WITH &&)
);

ALTER TABLE lease_charge_schedules        -- rent that follows an allowance
  ADD COLUMN allowance_entitlement_id UUID REFERENCES allowance_entitlements (id);

CREATE TABLE allotments (                 -- a standing deduction from pay to the project
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  service_member_id UUID NOT NULL REFERENCES service_members (id),
  processor         TEXT NOT NULL,        -- the allotment processor or pay system
  amount            BIGINT NOT NULL,
  currency          CHAR(3) NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('requested', 'active', 'stop_requested',
                      'stopped', 'rejected')),
  valid_during      DATERANGE NOT NULL,
  EXCLUDE USING GIST (lease_id WITH =, service_member_id WITH =, valid_during WITH &&)
);

CREATE TABLE allotment_files (            -- inbound payment files and outbound program files
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  direction    TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  file_kind    TEXT NOT NULL,             -- 'allotment_payments', 'occupancy', ...
  period       DATERANGE NOT NULL,
  content_hash TEXT NOT NULL,
  line_count   INT NOT NULL,
  total_amount BIGINT,
  currency     CHAR(3),
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, direction, content_hash)   -- the same file never imports twice
);

CREATE TABLE allotment_file_lines (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  file_id          UUID NOT NULL REFERENCES allotment_files (id),
  line_number      INT NOT NULL,
  member_reference TEXT NOT NULL,         -- the file's identifier, stored masked or tokenized
  amount           BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  allotment_id     UUID REFERENCES allotments (id),   -- null until matched
  payment_id       UUID REFERENCES payments (id),     -- the payment it became
  exception        TEXT,                  -- 'no_match', 'amount_mismatch', 'moved_out', ...
  resolved_by      UUID REFERENCES users (id), -- staff user
  UNIQUE (file_id, line_number)
);

CREATE TABLE housing_waitlist_entries (   -- installation waitlists with tiers
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  installation_id UUID NOT NULL REFERENCES military_installations (id),
  household_id    UUID NOT NULL REFERENCES households (id),
  priority_tier   INT NOT NULL,           -- from the installation's waterfall rule in force
  rule_evaluation_id UUID NOT NULL REFERENCES rule_evaluations (id),          -- which waterfall placed them
  eligible_on     DATE NOT NULL,          -- the date that orders the list, per local policy
  bedrooms        INT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('waiting', 'offered', 'accepted', 'declined',
                    'skipped', 'withdrawn', 'housed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE housing_disputes (           -- the 10 U.S.C. 2894 process
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  lease_id              UUID NOT NULL REFERENCES leases (id),
  submitted_on          DATE NOT NULL,
  forward_due_on        DATE NOT NULL,    -- computed from the rule version at submission
  investigation_due_on  DATE NOT NULL,
  decision_due_on       DATE NOT NULL,
  rule_evaluation_id    UUID NOT NULL REFERENCES rule_evaluations (id),
  segregation_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  segregation_during    DATERANGE,        -- periods whose payments are held
  decided_on            DATE,
  outcome               TEXT,             -- 'remediate', 'rent_reduction', 'credit', 'denied'
  remediation_due_on    DATE,
  CHECK (segregation_approved OR segregation_during IS NULL)
);

CREATE TABLE military_lease_terminations (  -- SCRA terminations, any property type
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL UNIQUE REFERENCES leases (id),
  ground             TEXT NOT NULL CHECK (ground IN ('entry_to_service', 'pcs', 'deployment',
                       'stop_movement', 'death', 'catastrophic_injury')),
  lease_notice_id    UUID NOT NULL REFERENCES lease_notices (id),  -- the notice as served: receipt,
                                          -- delivery, effective date and its rule evaluation
  orders_document_id UUID NOT NULL,
  prepaid_refund_due_on DATE NOT NULL     -- 30 days after the effective date
);

-- Manufactured housing and RV sites ---------------------------------------

ALTER TABLE units
  ADD COLUMN site_use TEXT CHECK (site_use IN ('home', 'rv_monthly', 'rv_nightly')),
  ADD CONSTRAINT units_site_use_on_lots CHECK ((kind = 'lot') = (site_use IS NOT NULL));

CREATE TABLE homes (                      -- a manufactured home or RV, an asset in its own right
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('manufactured_home', 'rv', 'park_model')),
  manufacturer        TEXT,
  model               TEXT,
  model_year          INT,
  serial_numbers      TEXT[] NOT NULL,    -- one per section for a multi-section home
  hud_label_numbers   TEXT[],             -- one per transportable section; null for RVs
  title_subdivision   TEXT,               -- ISO 3166-2 of the titling state
  title_number        TEXT,
  property_class      TEXT NOT NULL CHECK (property_class IN ('personal', 'real')),
  status              TEXT NOT NULL CHECK (status IN ('inventory', 'occupied', 'for_sale',
                        'rehab', 'abandoned', 'removed'))
);

CREATE TABLE home_ownerships (            -- who owns the home, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  home_id            UUID NOT NULL REFERENCES homes (id),
  owner_person_id    UUID REFERENCES people (id),            -- a resident owner
  owner_entity_id    UUID REFERENCES legal_entities (id),    -- the community or a lender
  acquired_by        TEXT NOT NULL CHECK (acquired_by IN ('purchase', 'inheritance',
                       'repossession', 'abandonment', 'new_inventory')),
  valid_during       DATERANGE NOT NULL,
  CHECK (num_nonnulls(owner_person_id, owner_entity_id) = 1)
);  -- co-owners are several rows over the same range; a deferred check keeps one holder set

CREATE TABLE home_placements (            -- which lot a home sits on
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  home_id      UUID NOT NULL REFERENCES homes (id),
  unit_id      UUID NOT NULL REFERENCES units (id),           -- kind = 'lot'
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (home_id WITH =, valid_during WITH &&),  -- a home is on one lot
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&)   -- a lot holds one home
);

CREATE TABLE home_sales (                 -- sales in place, and title transfer status
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  home_id          UUID NOT NULL REFERENCES homes (id),
  seller_ownership_id UUID NOT NULL REFERENCES home_ownerships (id),
  buyer_person_id  UUID REFERENCES people (id),
  buyer_entity_id  UUID REFERENCES legal_entities (id),
  price            BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  title_status     TEXT NOT NULL CHECK (title_status IN ('contract', 'buyer_approved',
                     'title_submitted', 'title_issued', 'closed', 'cancelled')),
  new_lease_id     UUID REFERENCES leases (id),   -- the buyer's lot lease
  CHECK (num_nonnulls(buyer_person_id, buyer_entity_id) = 1)
);

ALTER TABLE leases
  ADD COLUMN home_id UUID REFERENCES homes (id);  -- the home this lease rents, if community-owned

-- Single-family and build-to-rent ----------------------------------------

CREATE TABLE unit_association_accounts (  -- the HOA a rented house belongs to
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  unit_id              UUID NOT NULL REFERENCES units (id),
  association_entity_id UUID NOT NULL REFERENCES legal_entities (id),  -- role 'association'
  account_number       TEXT,
  dues_amount          BIGINT NOT NULL,
  currency             CHAR(3) NOT NULL,
  frequency            TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  paid_by              TEXT NOT NULL CHECK (paid_by IN ('owner_direct', 'manager_from_owner_funds',
                         'passed_through_to_resident')),
  valid_during         DATERANGE NOT NULL,
  EXCLUDE USING GIST (unit_id WITH =, association_entity_id WITH =, valid_during WITH &&)
);

CREATE TABLE association_notices (        -- violations, fines and rent demands on a rented house
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  account_id     UUID NOT NULL REFERENCES unit_association_accounts (id),
  lease_id       UUID REFERENCES leases (id),       -- the household it concerns
  kind           TEXT NOT NULL CHECK (kind IN ('violation', 'fine', 'delinquency',
                   'tenant_rent_demand', 'rule_change')),
  received_on    DATE NOT NULL,
  amount         BIGINT,
  currency       CHAR(3),
  forwarded_at   TIMESTAMPTZ,             -- when the resident was told
  rebill_charge_id UUID REFERENCES charges (id),    -- the fine passed through, if allowed
  document_id    UUID NOT NULL
);
```

Design decisions:

- **Rent follows an entitlement, not a table.** A military lease's rent schedule points at the member's `allowance_entitlements` row, and every change (January table, promotion, dependency change, protection) closes one schedule segment and opens another. The entitlement is separate from the published rate because rate protection and corrections make them differ, and because the owner, the service and the resident will each ask which rate applied on which date.
- **Allowance tables are reference rules, loaded per publication.** `allowance_rates` is keyed by allowance, area, grade and dependency over a date range, with the source file kept and the exclusion constraint stopping two rates for one cell. A republished table is a new publication, not an update.
- **Retroactive changes post adjustments.** A promotion learned in March with an effective date in January posts adjustment charges for January and February with the status row as their reason; posted charges stay untouched, and `service_member_statuses.recorded_at` keeps when the platform learned it ([Effective Dating & History](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Allotments are a payment source with a lifecycle.** `allotments` holds what should be running and its start/stop state; `allotment_files` and their lines hold what arrived, matched, posted or excepted. The payment rows themselves are the Payments volume's, so allotment money reconciles like any other deposit ([ACH & Bank Transfers](/books/payments/ach)).
- **Segregated rent is held, not applied.** During an approved segregation, payments post to a held liability on the lease and the dispute's decision releases, refunds or splits them. Delinquency, late fee and collection rules check `housing_disputes` first.
- **Deadlines are stored.** Dispute dates, SCRA effective dates and refund deadlines are computed from the rule version in force when the triggering event arrived and stored on the row, so a later rule change never moves them.
- **The waterfall is a rule, and the waitlist remembers which one.** Each entry records the rule version that placed it; a waterfall change re-tiers entries as new events, not silent rewrites.
- **Military documents live in a restricted store.** Orders, powers of attorney and leave and earnings statements are referenced by ID, never inlined, with access logged and a retention schedule of their own. File member identifiers are masked or tokenized at rest.
- **The lot is the unit; the home is an asset.** `home_placements` makes "one home per lot, one lot per home, at a time" a constraint, and `home_ownerships` keeps the title chain independent of any lease. A community-owned home rented to a resident is `leases.home_id`; a resident-owned home has no lease of its own, only an owner.
- **Lot rent and home rent are separate charge codes.** Increase-notice rules (rows per jurisdiction: lead days, required content, committee meeting deadline, purchase-right triggers) attach to lot rent, and a lot-rent increase can't post unless a compliant notice exists for it.
- **Nightly RV sites are stays.** A `site_use = 'rv_nightly'` lot is booked through [Short-Term Rentals](/books/property-tech/short-term-rentals#how-to-build-it)' `stays`, not a lease; changing a site's use is a dated change on the unit.
- **A scattered-site house is a building with one unit.** No new tables for SFR's shape; the new tables are for what surrounds the house: its association account and the notices that arrive about it. The association is a `legal_entities` row with role `'association'`, the same one [Community Associations](/books/property-tech/community-associations#how-to-build-it) uses when the manager also runs that association.

## Auditing

What owners, services, courts and residents ask about later:

- **The rate behind every military rent.** For any lease and month: the published table and version, the member's status and entitlement row, and why that row applied. When a family says their rent didn't drop with a demotion, or a project asks why January's rent roll changed, the answer is a query, not a reconstruction.
- **Every allotment file and what became of each line.** As received, with its hash and totals; each line matched, posted, returned or excepted, by whom, and when the exception closed. Start and stop requests with their confirmations.
- **Disputes and segregated funds.** Each statutory date and whether it was met, the segregation approval, every payment held, and the distribution the decision ordered, entry by entry. Remediation deadlines and any 10 percent reductions with their periods.
- **Tenant Bill of Rights evidence.** The maintenance history produced before signing, the briefing dates, the lease template and document versions attached, the entry notices, and the work-order timeframes promised and met. Work orders excluded from oversight metrics, with who excluded them and why.
- **Oversight reports as submitted.** A snapshot of each Schedule G, PAM or other report as sent, with the data as of its run.
- **SCRA terminations.** The notice, the orders, the delivery method, the computed effective date and the refund, and proof no early-termination charge posted.
- **Waitlist decisions.** Every offer, decline and skip, with the tier and rule version that placed the household.
- **Manufactured home title chains.** Each home's owners over time, title transfer steps, placements on lots, and the lot leases that started and ended around each sale. Rent-increase notices with their delivery and the rule version that set the lead time.
- **Association money on rented houses.** Dues paid or passed through, notices received and forwarded with timestamps, rebilled fines, and any rent redirected under an association's demand.

The mechanics (typed actors, snapshots, access logs for the restricted documents) are in [Audit Trails](/docs/architecture/audit-trails); retention by record type is in [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds).

## What This Means for the System You Build

- **Model the service member, not just the person:** branch, component, effective-dated pay grade, dependency status and installation, and deployments and orders as date ranges.
- **Make military rent a function of the allowance,** with the published tables as versioned rule rows and each member's entitlement (including protection) as its own effective-dated record that the rent schedule points to.
- **Reprice on January 1 and on every status change,** posting retroactive adjustments rather than editing posted rent.
- **Treat allotments as a file-based payment source:** start and stop per lease, idempotent import, line-level matching with an exceptions queue, posting through the Payments ledger, and outbound program files kept as sent.
- **Build the Tenant Bill of Rights in:** unit-level maintenance history, resident work-order visibility with promised timeframes, department-approved lease templates, no non-refundable fees, and briefing and walkthrough milestones.
- **Support segregated rent** as held funds under a dispute case with stored statutory deadlines, released or refunded only by the decision, with delinquency suppressed while it's open.
- **Handle SCRA terminations on every property type,** with computed effective dates, no early-termination charges, and tracked prepaid-rent refunds.
- **Keep waitlists tiered by a versioned waterfall rule** and record every offer and skip.
- **Make the lot the unit and the home an asset** with section serials, HUD labels, title and property class, an ownership history, and placements that can't overlap.
- **Enforce manufactured-housing notice law as data,** blocking lot-rent increases without a compliant, timely notice, and flagging purchase-right triggers on a community sale.
- **Run nightly RV sites as stays** and monthly ones as leases on the same lot table.
- **For single-family, model the house's surroundings:** its association account, dues payer, notices and rebills, and access credentials for self-showing that are short-lived, single-use and logged.

## References

**Statutes and regulations**

- [10 U.S.C. 2890: Rights and responsibilities of tenants of housing units](https://www.law.cornell.edu/uscode/text/10/2890), the eighteen tenant rights including maintenance history before signing, plain-language briefings, electronic work orders, dispute resolution, BAH segregation, entry notice, non-refundable fees and common documents; the tenant responsibilities; FY2020 NDAA (Pub. L. 116-92) notes on the universal lease
- [10 U.S.C. 2891a: Requirements relating to management of housing units](https://www.law.cornell.edu/uscode/text/10/2891a), bonus disclosure, the walkthrough before signing, the electronic work order system, the common lease, and the prohibition on out-of-pocket fees beyond rent and BAH
- [10 U.S.C. 2894: Dispute resolution process](https://www.law.cornell.edu/uscode/text/10/2894), the 2-, 7-, 30- and 60-day clocks, the commander's final decision, the 10-business-day remediation floor, 10 percent reductions per five-day period, and segregation of BAH and allotted pay
- [50 U.S.C. 3955: Termination of residential or motor vehicle leases (SCRA)](https://www.law.cornell.edu/uscode/text/50/3955), covered leases, notice and delivery methods, effective dates, no early termination charge, prepaid rent refunds, survivors and catastrophic injury
- [24 CFR 3280.11: Certification label](https://www.law.cornell.edu/cfr/text/24/3280.11), one label per transportable section, placement and the label number format
- [24 CFR 3280.5: Data plate](https://www.law.cornell.edu/cfr/text/24/3280.5), manufacturing plant, serial number, model, date of manufacture and location near the electrical panel
- [Florida Statutes 723.037: Lot rental increases](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0723/Sections/0723.037.html), 90-day notice, required contents, pass-through charges and the homeowners committee meeting
- [Florida Statutes 723.071: Sale of mobile home parks](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0723/Sections/0723.071.html), the homeowners' right to purchase within 45 days and the 10-day lower-price window
- [Florida Statutes 720.3085: Payment for assessments; lien claims](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/0720.3085.html), an association's demand that a delinquent owner's tenant pay rent to the association
- [Florida Statutes 720.306: Meetings of members; amendments](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/0720.306.html), rental restrictions after July 1, 2021 and the 6-month and three-times-a-year exceptions

**Government and reference**

- [GAO-18-218: Military Housing Privatization](https://gao.gov/products/gao-18-218), the 1996 authorities, 99 percent of domestic housing privatized, and BAH reductions' effects on project cash flows (March 13, 2018)
- [GAO-21-137: Military Housing allowances and privatized project payments](https://www.gao.gov/products/gao-21-137), BAH reductions by grade and dependency, miscalculated project payments and the FY2022 NDAA change (January 25, 2021)
- [GAO-23-105797: Military Barracks](https://www.gao.gov/products/gao-23-105797), barracks population, conditions, missing data and privatized barracks (September 19, 2023)
- [Air Force Benefits: Basic Allowance for Housing](https://www.myairforcebenefits.us.af.mil/Benefit-Library/Federal-Benefits/Basic-Allowance-for-Housing-(BAH)), location, pay grade and dependents; the 4.2% average increase effective January 1, 2026; OHA overseas
- [Army.mil: Picerne explains what happens to BAH under housing privatization](https://www.army.mil/article/29841/picerne_explains_what_happens_to_bah_under_housing_privatization), rent allotment equal to the BAH entitlement, the Military Assistance Company and DFAS, dual-military rent, monthly timing (November 4, 2009)
- [Army.mil: Campbell Crossing opens housing to civilians, retirees](https://www.army.mil/article/142348/campbell_crossing_opens_housing_to_civilians_retirees), opening privatized homes to retirees and DoD civilians, active-duty priority and the family waitlist (February 6, 2015)
- [MilitaryByOwner: 2026 BAH rates and updates](https://blog.militarybyowner.com/2026-bah-rates-and-updates-for-military-members-and-families), rate protection for members who don't move and the current rate after a PCS
- [Sacramento County Assessor: Manufactured homes](https://assessor.saccounty.gov/us/en/topics-a-to-z/mh-info.html), HCD titles for homes not on a recorded foundation and reclassification as real property under an HCD 433A

**In practice**

- [Entrata: Military](https://www.entrata.com/solutions/military), BAH updates, promotions and demotions, MAC payments, Schedule G and PAM reports, waterfall waitlists, member documents, deployed members and maintenance reporting
- [Entrata: Manufactured housing](https://www.entrata.com/solutions/manufactured-housing), lot management and long-term leasing
- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), single-family build-to-rent and military among the housing types on its platform
- [RealPage: Military](https://www.realpage.com/military/), annual BAH updates, MAC integration, payment files posted to the ledger and monthly MIMO files
- [RealPage: Single-family](https://www.realpage.com/single-family/), Buildium for scattered-site homes
- [Yardi Breeze: Manufactured housing features](https://www.yardibreeze.com/manufactured-housing-features/), community- and resident-owned homes and lots, ownership changes, title tracking, homes and RVs, rent-increase control and utility billing
- [Rent Manager: Manufactured housing](https://www.rentmanager.com/manufactured-housing/), homes as leasable assets, the lease for unit and home, home loans and rehabs, metered utilities
- [Rent Manager: RV parks and campgrounds](https://www.rentmanager.com/rv-park-campgrounds/), nightly reservations, online booking, seasonal and holiday rates and taxes
- [Rently: Self-guided tours](https://use.rently.com/self-guided-tours/), ID verification and screening before tours, time-sensitive lockbox codes, one-time smart-lock codes and entry logs
