+++
title = "The Software Landscape"
description = "The property management software market: suites and point solutions, the major platforms, AI tiers, capital and consolidation, partner programs, build vs buy."
category = "Property Tech Industry"
order = 1702
part = "The Business"
tags = ["property-tech", "vendors", "market-map", "build-vs-buy", "property-management"]
+++

Property management software is an old market with a few large suites, a long tail of small-landlord tools, and a crowd of point solutions around both. A self-managing owner with nine houses needs listings, rent collection, a ledger and a 1099 by January. A third-party manager with four hundred owners needs trust accounting by owner, management fee runs and owner statements every month. An apartment operator with a hundred communities needs centralized leasing, pricing, screening, renewals and a general ledger per owning entity, and a housing authority, a student operator, a condo association and a self-storage chain each need things nobody else does. The suites grew by buying their way into those segments, and the products still carry the shape of the business they were first built for.

That makes choosing hard in a specific way. Feature lists converge (everyone has a resident portal, online payments, screening and maintenance), while the things that decide fit are commercial and structural: which segments run on the same database, how the vendor is paid and whether that's by your residents, which integrations the vendor allows and on what terms, and who owns the vendor and what they want from it in five years. This chapter maps the market by class, describes each major platform neutrally from its own pages and filings, then covers packaging, capital and consolidation, partner programs, centralization, and when to buy, extend or build. [The Property Business](/books/property-tech/property-business) describes the business these products serve.

## The Map

The market sorts into bands by what a product owns:

| Band | Owns | Examples |
| --- | --- | --- |
| **System of record** | Properties, units, leases, resident ledgers, owner and entity accounting | Enterprise suites, small-portfolio platforms, segment platforms |
| **Front office** | Listings, websites, leads, tours, the leasing conversation | Listing sites, CRMs, AI leasing agents, contact centers |
| **Resident money** | Payments, screening, insurance, deposit alternatives, rent reporting, utilities | Suite modules, payment processors, insurers, screening agencies |
| **Operations** | Maintenance, vendors, procurement, access, smart devices | Work order tools, vendor networks, smart-home and access vendors |
| **Data and capital** | Market data, benchmarking, investment management, entity and property records | Market data providers, investment platforms, data integrators |

The useful distinction is between the **system of record**, which owns the lease and the money, and everything that reads from or writes to it. My rule: an operator has exactly one system of record per property, because the resident ledger and the trust accounts can only be right in one place, and any number of specialists around it. Most of the market's strategic moves are about the boundary: suites adding front-office agents and resident financial products so specialists aren't needed, and specialists adding enough of the system of record that the suite becomes optional.

## Suites and Point Solutions

A **suite** sells most bands on one database: one login, one resident, one ledger, one set of permissions. Its advantage is that a lease, a payment and a work order are the same records everywhere, so nothing reconciles. Its cost is that each module is only as good as the vendor's investment in it, and switching one module out means an integration the suite may not want to support.

A **point solution** does one band better than a suite module: an AI leasing agent, document fraud detection, smart locks, a front office over someone else's ledger. Its advantage is depth and speed; its cost is that it lives on the suite's integration terms. The friction concentrates where the suite earns transaction revenue. AppFolio's 2025 revenue was more than three times as much from Value Added Services (payments, screening, insurance-related services) as from subscriptions, and Entrata's S-1 calls out payment processing and "Embedded Technology Solutions revenue, such as insurance and resident screening" ([How the Money Is Made](/books/property-tech/property-business#how-the-money-is-made)). A point solution in those categories competes with the suite's own revenue, which shapes the partner terms it's offered.

The two models are converging from both ends. In October 2026, RealPage and Funnel announced a partnership in which RealPage's screening, payments, pricing and availability "serve as the source of truth" in the application workflow of Funnel, which calls itself a "front-office-only AI platform," while operators can still choose RealPage's own front office. A suite exposing its money rails under a competitor's front office is a different deal from a suite that sells everything, and the integration patterns behind it are in [The Headless Front Office](/books/property-tech/platform-architecture#the-headless-front-office).

## The Major Platforms

In alphabetical order, from each vendor's own pages and filings. Unit and customer counts are given only where an audited filing states them; marketing counts vary between a vendor's own releases.

**AppFolio** is a public company selling to residential and commercial managers. Its 10-K for 2025 reports 9.4 million units under management, 22,096 property management customers and $950.8 million of revenue, and lists single-family, multifamily, affordable, commercial, student and community association properties. It sells three plans (Core for small managers, Plus adding affordable and student housing and read-only API access, Max adding leasing CRM and read/write API access) and builds AI into workflows under the Realm name.

**Buildium** sells to small and mid-size residential and association managers on published plans (Essential from $58, Growth from $183 and Premium from $375 a month, with its Open API on Premium) and a pay-as-you-go marketplace. Its footer reads "Buildium, A RealPage Company," and its AI carries RealPage's Lumina brand.

**Entrata** sells a single operating system to multifamily operators, with editions for student, affordable, military, commercial and manufactured housing, organized into an operations platform (OXP), a resident platform (RXP) and an AI layer (ELI). Its S-1 reports 2,529,199 units on the platform at June 30, 2026, described as about 10% of US multifamily, and revenue of $509.3 million for 2025, up from $412.0 million; its customers generally sign three- to five-year subscription terms.

**MRI Software** sells across residential (multifamily, affordable, public housing, condo and HOA, single-family rental) and commercial (office, industrial, retail) real estate, for owners and operators and for occupiers, plus investment management, on a platform it calls Agora with a Partner Connect program.

**RealPage** sells to multifamily and many other segments: its navigation lists multifamily, affordable, commercial, community associations, institutional, military, mixed-use, senior living, single-family, small portfolios, storage and student. Its last public 10-K reported about 19.7 million units and more than 31,700 clients at the end of 2020, and more than 50 acquisitions since 2002. It has been private since 2021, and its AI suite is Lumina.

**Rent Manager** is made by London Computer Systems and lists residential, commercial, associations, self storage, manufactured housing, vacation homes, student housing, RV parks and campgrounds, and affordable housing, with an API and "Open Access" for customization and an AI product called Orion AI.

**ResMan** sells property management for multifamily and affordable housing (HUD, Rural Development and tax credit programs among them), with accounting, budgeting, leasing, maintenance and AI assistants for leasing, residents and invoice entry. Its site calls it "An Inhabit brand."

**Yardi** is privately held and, in a September 2026 account of its Sidero Labs acquisition, "bootstrapped" with no outside investors and more than 10,000 employees. Its enterprise platform is Voyager; its small-portfolio product, Breeze, publishes per-unit pricing for residential, commercial, affordable, association, self-storage and manufactured housing editions. It also owns businesses beside the software: the RentCafe listing site and Yardi Matrix market data.

## Specialists by Segment

Some segments have their own leaders, because the contract and the law differ enough that a multifamily suite's edition doesn't fit everyone:

| Segment | What's different | Examples |
| --- | --- | --- |
| **Self storage** | Month-to-month rentals online, gate access, lien sales, tenant protection plans | Storable (Storable Edge, Sitelink, Storable Easy, with a marketplace, payments and insurance); Yardi Breeze and Rent Manager editions |
| **Short-term rentals** | Nightly inventory across booking channels, turnovers, lodging taxes | Guesty (property management system and channel manager); Rent Manager's vacation homes edition |
| **Community associations** | Assessments, boards, violations, resale documents | Vantaca; association editions of AppFolio, Buildium, Yardi Breeze and MRI |
| **Commercial** | Long leases, expense recovery, percentage rent, occupier-side lease accounting | MRI; commercial editions of Yardi, AppFolio, Entrata and Rent Manager |
| **Affordable and public housing** | Program certifications, subsidy billing, the housing authority side | ResMan, MRI (affordable and public housing), Yardi Breeze Premier Affordable, RealPage and Entrata editions |
| **Senior, student, military** | Care levels, by-the-bed leases, military allotments | Editions of the enterprise suites (RealPage lists all three; Entrata student and military) |

Around every segment sit the horizontal specialists: AI leasing and resident communication (EliseAI, which sells to housing and healthcare providers), applicant fraud detection (Snappt verifies "income, identity, and rental history"), smart-home access and self-guided tours (SmartRent, a public company), and front-office platforms (Funnel). Their chapters describe what they do: [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours); [Applications & Screening](/books/property-tech/applications-and-screening); [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings); [AI in Property Management](/books/property-tech/ai-in-property-management).

## Packaging: Core, Tiers and AI

How a vendor charges decides what an operator can afford to turn on, and increasingly what a resident pays:

- **Per unit, per month,** with minimums, is the small-portfolio norm: Yardi Breeze starts at $1 per unit for residential and associations, $2 for commercial and $3 for affordable, with minimums.
- **Flat plans by capability:** Buildium's three plans and AppFolio's Core, Plus and Max both put API access on the upper plans (Buildium's Open API on Premium; AppFolio's read-only API on Plus and read/write on Max), so integration capability is something the customer buys rather than a partnership the vendor grants. AppFolio's 10-K says its subscription fees vary by property type and scale with the size of the customer's business.
- **Multi-year enterprise contracts,** typically three to five years at Entrata, priced by negotiation.
- **Transactions on top:** payments, screening and insurance priced per use, as a percentage of the transaction or a flat fee, often paid by the resident or applicant rather than the operator. This is now the larger revenue line at AppFolio.
- **An AI tier above the core.** Entrata introduced Entrata Pro in September 2026 as "a new elevated agentic platform tier," with a console, an agent studio and an AI Admin that records every AI interaction (model, answer, sources, reasoning) and, for third-party operators, breaks AI cost down by property and by owner. Yardi sells Virtuoso Enterprise, with its Matrix connector for Claude as an add-on; RealPage sells the Lumina AI Suite, whose agents it says are "co-developed with OpenAI"; Rent Manager has Orion AI and ResMan sells AI assistants as products.

Two consequences for anyone building on these products. **AI cost becomes an owner expense question:** a third-party manager has to allocate an AI tier's cost to the owners whose properties used it, under management agreements that may not mention it, which is why per-owner cost attribution appears in the vendors' own governance features ([AI Cost Allocation to Owners](/books/property-tech/ai-in-property-management#ai-cost-allocation-to-owners)). **Resident-paid fees are part of the price:** a suite whose revenue comes from resident transactions has an incentive the operator and the regulator both watch ([The Property Business](/books/property-tech/property-business#how-the-money-is-made)).

## Capital and Consolidation, as of October 2026

Ownership shapes a vendor's roadmap, pricing and appetite for acquisitions more than any feature does. The dated record from public sources:

| Date | Move | What it signals |
| --- | --- | --- |
| October 2013 | Yardi sues Property Solutions International (now Entrata) in Los Angeles, alleging it used Voyager without a license to build custom interfaces instead of Yardi's standard interface; PSI denies it and calls the suit an attempt to limit competition | Interface access as a competitive weapon |
| September 16, 2019 | Entrata's monopolization suit against Yardi in the District of Utah settles confidentially on the eve of trial | The same fight, from the other side |
| January 15, 2020 | Harvest Partners invests in MRI Software alongside existing backers TA Associates and GI Partners | Private equity ownership of a multi-segment suite |
| April 22, 2021 | Thoma Bravo completes its take-private of RealPage at $88.75 a share, about $10.2 billion including net debt | The largest take-private in the market |
| August 27, 2021 | Inhabit IQ adds ResMan; Inhabit's backers include Goldman Sachs Asset Management, Insight Partners, Greater Sum Ventures and PSG | Roll-ups of mid-market platforms with ancillary products |
| March 2022 | Silver Lake affiliates acquire a majority of Entrata's stock | Growth equity control of an enterprise suite |
| May 15, 2025 | Blackstone makes a $200 million minority investment in Entrata at a $4.3 billion valuation | A large owner investing in its software vendor |
| November 2025 | Entrata pays a $356.3 million special dividend, funded with cash and a $400 million term loan | Leveraged recapitalization before a listing |
| 2026 | Entrata files to list on the NYSE as ENT | A second public property management suite |
| July 14, 2026 | RealPage completes its acquisition of Cherre, which links real estate records across identifiers and stays "an open hub" | Data integration as the base for AI |
| September 15, 2026 | Entrata introduces Entrata Pro, its agentic platform tier | AI sold as a tier |
| October 13, 2026 | RealPage and Funnel announce RealPage's money and screening rails under Funnel's front office | Suites unbundling the front office |

Three ownership models now coexist. **Public** (AppFolio, and Entrata if its listing completes) means audited numbers, quarterly pressure and disclosed risks. **Private equity** (RealPage, MRI, the Inhabit brands) means acquisitions, price increases and an exit in view. **Founder-owned and bootstrapped** (Yardi) means no outside investors to answer to and no audited numbers to read. My rule for buyers: read the vendor's capital structure the way a lender would. A vendor with debt to service and an exit to reach will monetize the installed base, which usually means transaction revenue from residents and price increases at renewal; a vendor without one decides on its own clock, which is good until you need it to decide on yours.

**Vendors also own data and demand.** Yardi owns the RentCafe listing site and Yardi Matrix, a "market intelligence platform" across multifamily, office, industrial and self storage; RealPage owns Cherre and market analytics. A vendor that runs the system of record, a listing site and a market data business sits on both sides of several transactions, and pooled data from competing operators is exactly what the antitrust cases against pricing software turned on. [Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026) and [Operating Metrics](/books/property-tech/operating-metrics#benchmarking-as-an-information-exchange-risk) treat that as a design constraint, not a footnote.

## Partner Programs

Every major platform has a program for third parties, and the programs differ in who grants access, who pays and how much of the data is reachable. At a headline level (the mechanics are in [Integration Models](/books/property-tech/platform-architecture#integration-models)):

- **Partner-gated APIs with a client sponsor.** Entrata's partner program has API, strategic (reseller, referral, affiliate) and consulting tracks; API partners get a developer portal, sandbox, documentation and webhooks, and the application asks for a client sponsor: a property management company that endorses the applicant's business.
- **A certified marketplace.** RealPage Exchange is an "Integration Marketplace, offering secure, standardized APIs across all RealPage products," with two tracks: certified AppPartners, and Registered Vendors whose access runs through APIs the client licenses. For vendors not yet registered, RealPage's migration page for its older Online Data Exchange says it will "require them to register through the Developer Portal."
- **Licensed interfaces.** Yardi runs an interface partner program; a third-party integrator, quoting consultants, describes an annual license fee per interface, a separate agreement per interface, and eligibility requiring a company at least two years old with at least three active Voyager clients. The 2013 and 2019 lawsuits above were both about building integrations outside a vendor's program.
- **API as a plan feature.** AppFolio (read-only on Plus, read/write on Max) and Buildium (Open API on Premium) sell API access to the customer, with no partnership needed for the customer's own integrations; marketplaces (AppFolio Stack with App Partners and Solution Partners, Buildium Marketplace, MRI Partner Connect) list the vendors that have partnered.
- **AI connectors.** Yardi has published connectors for Claude on Anthropic's marketplace, and RealPage's Lumina Connect offers "governed access" to its data "with the model you choose": the newest access path, and the one where the customer's own AI reads the system of record with a user's permissions.

For an operator, the program decides what your other vendors can do with your data, and whether you pay for it. For a point solution, it decides whether you can serve a suite's customers at all. For a platform builder, it's a design choice with commercial consequences either way: Platform Architecture compares the models.

## Centralization and the Outsourced Back Office

The operating model behind the software has moved work off-site. Leasing calls, accounting, invoice processing, compliance file review and utility billing that once happened in each property's office now happen in a central team, at the vendor, or at an outsourcer, and the vendors sell the outsourced version as a service:

- **Outsourced leasing.** Entrata's Leasing Center is "a full-service contact center for capturing calls and turning leads into leases," handling inbound calls, applications, appointments and maintenance requests; its pitch is to "outsource time-consuming leasing responsibilities."
- **Outsourced accounting, IT and compliance.** RealPage's services menu lists SmartSource Accounting, SmartSource IT, Compliance Services, Billing Services and Resident Utility Billing alongside vendor credentialing and training.
- **Partner accountants.** AppFolio Stack lists Solution Partners, independent accounting and consulting firms for bookkeeping, financial reporting and process improvement.

Centralization changes the software's shape more than its features. Permissions move from "staff at this property" to "this function across these properties," so grants are scoped by role and portfolio, not by site ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies), [Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants)). Work arrives in queues that cross properties and time zones, so every queue item carries its property and that property's business date. And cost allocation becomes contractual: whether a central leasing agent's time, an outsourced invoice-keying fee or an AI tier is reimbursable by the owner depends on the management agreement, which may define reimbursable payroll only for on-site staff ([Reimbursements and Allocated Costs](/books/property-tech/owners-and-management-agreements#reimbursements-and-allocated-costs)). My rule: record which team, person or agent did each piece of work and for which property, because owner billing, audits and fair housing reviews all ask.

## How the Leading Products Compare

Public pages differ a lot in depth, so this table records only what each vendor's own pages and filings say, as of October 2026. "Not published" means the vendor has no public page on it, not that the capability is missing.

| Vendor | Ownership | Segments named on its site or filings | Packaging | Third-party access |
| --- | --- | --- | --- | --- |
| **AppFolio** | Public | Single-family, multifamily, affordable, commercial, student, associations | Core, Plus, Max; transactions per use | Read-only API on Plus, read/write on Max; Stack marketplace |
| **Buildium** | A RealPage company | Residential, associations, mixed-use, student, commercial | Essential, Growth, Premium from $58 to $375 a month | Open API on Premium; pay-as-you-go marketplace |
| **Entrata** | Silver Lake majority; Blackstone minority; NYSE listing filed | Multifamily, student, affordable, military, commercial, manufactured housing | Entrata Pro agentic tier; three- to five-year enterprise terms | Partner program with client sponsor; developer portal, sandbox, webhooks |
| **MRI Software** | Private equity (Harvest, TA Associates, GI Partners as of 2020) | Multifamily, affordable, public housing, condo and HOA, single-family rental, office, industrial, retail, occupiers | Not published | Agora platform, Partner Connect |
| **RealPage** | Thoma Bravo, private since 2021 | Multifamily, affordable, commercial, associations, military, senior, single-family, storage, student and more | Not published | RealPage Exchange, AppPartner certification |
| **Rent Manager** | London Computer Systems | Residential, commercial, associations, storage, manufactured housing, vacation, student, RV, affordable | Bundles, price on request | API and Open Access |
| **ResMan** | An Inhabit brand | Multifamily, affordable | Not published | Integrations and partner program |
| **Yardi** | Private, founder-owned, no outside investors | Voyager and Breeze editions; Breeze lists residential, commercial, affordable, associations, storage, manufactured housing | Breeze from $1 per unit per month, minimums apply | Interface partner program (described by third parties); AI connectors |

## Build, Buy or Extend

Almost every operator should buy the system of record, and the market above is the reason: the trust accounting, the owner reporting, the affordable program compliance and the state-by-state lease rules took the incumbents decades. The real decision is narrower.

**Buy** when your segments and operating model match a vendor's first customers. The test isn't the demo; it's reading the vendor's terms for the five things that are expensive to change: which of your segments run on the same database, how owner and entity accounting is structured, which resident fees the vendor charges and who keeps them, what the partner program lets your other vendors do, and what data you can export, in what form, if you leave ([Exit Rights](/books/property-tech/switching-platforms#exit-rights)).

**Extend** when the core fits and one band doesn't. Two shapes:

- **Extend inside the suite,** with its own add-on modules or AI tier: no integration, but the module's depth is the vendor's choice and its price is the vendor's leverage.
- **Extend around the suite,** with point solutions through its partner program or API: a front office, a fraud check, smart access, a data warehouse. This works until the specialist needs data the program doesn't expose, writes the suite won't accept, or a revenue category the suite keeps for itself.

**Build** when the operating model is the advantage and no vendor's model fits: an owner-operator at a scale where per-unit and per-transaction pricing exceeds an engineering team's cost, a segment no suite serves well, or a resident experience that is the product. Building a system of record means owning trust accounting, the rules of every jurisdiction you operate in, and the audits that come with both. My default even then: build the domain and buy or partner for the regulated rails.

```text
build (your model, your moat)              buy, license or partner (regulated, commodity)
-----------------------------              ---------------------------------------------
properties, units, leases, households      payment processing, card vault, ACH origination
charge schedules and resident ledgers      consumer reports and screening (a regulated agency)
owner and entity accounting                renters insurance (licensed agency, insurer)
pricing logic within your own data         market data, under its license terms
resident and staff experience              e-signature, identity verification, SMS delivery
work orders and make-ready                 bank accounts and trust banking
```

The right-hand column is regulated or networked: a screening company is a consumer reporting agency under federal law, an insurance program needs a licensed agency, and payments need a processor and sometimes money transmission licenses ([Applications & Screening](/books/property-tech/applications-and-screening#fcra-the-screening-report-is-a-consumer-report); [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#renters-insurance-requirements); [Collecting Rent](/books/property-tech/collecting-rent#who-holds-the-money); [The Payments Landscape](/books/payments/payments-landscape#build-buy-or-extend)). A platform that starts by partnering for these keeps the option to bring one in-house later, and the suites above show where the revenue in each one is.

## Auditing

Vendor choices create records that matter later:

- **Which system was the record, when.** For every property and date, which platform held the lease and the ledger, so a disputed balance from before a migration is answered from the right place.
- **Integration consents.** Which third party the operator authorized to read or write which data, under which program and agreement, and when it was revoked: residents' data leaves through these doors.
- **Resident-paid vendor fees.** Which vendor charged residents what, under which agreement, and what was shared back to the owner or manager: the evidence in a fee disclosure dispute and an owner's audit.
- **Who did the work.** Central staff, outsourced teams and AI agents act on properties they don't sit at; record the actor, the team and the property for each action ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Keep one system of record per property** and make every specialist read from or write to it, never hold a second copy of the lease or the ledger.
- **Read a vendor's revenue model before its feature list:** transaction revenue from residents shapes partner terms, fees and incentives.
- **Read a vendor's capital structure** like a lender: public, private equity and founder-owned vendors make different promises.
- **Treat partner programs as part of the architecture,** with consents, scopes and costs recorded per integration.
- **Design for centralized and outsourced work:** grants by function and portfolio, queues that cross properties, the property's business date on every item, and the actor on every action.
- **Allocate shared costs (central staff, AI tiers, outsourced services) to owners** by rules that cite the management agreement.
- **Build the domain; buy or partner for the regulated rails,** and keep the option to bring one in-house.

## References

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), units and share of US multifamily, revenue, contract terms, embedded revenue, Silver Lake majority, special dividend and term loan, proposed NYSE listing as ENT
- [AppFolio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1433195/000143319526000011/appf-20251231.htm), units, customers, revenue split, Core, Plus and Max plans and API access, segments, Realm AI
- [RealPage: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/1286225/000128622521000007/rp-20201231.htm), units, clients, revenue, acquisitions since 2002, the Thoma Bravo merger agreement

**Capital and litigation**

- [RealPage: Thoma Bravo completes acquisition of RealPage](https://www.realpage.com/news/thoma-bravo-completes-acquisition-of-realpage/), $88.75 a share, about $10.2 billion including net debt, private from April 22, 2021
- [MRI Software: MRI Software receives investment](https://www.mrisoftware.com/uk/?p=25377), Harvest Partners alongside TA Associates and GI Partners (January 15, 2020)
- [ResMan: Inhabit IQ adds ResMan](https://www.myresman.com/?p=3284), the August 27, 2021 combination and Inhabit IQ's private equity partners
- [Multifamily Executive: Entrata secures $200 million investment from Blackstone](https://www.multifamilyexecutive.com/technology/entrata-secures-200-million-investment-from-blackstone_o), a minority investment at a $4.3 billion valuation (May 15, 2025)
- [Pulse 2.0: Yardi acquires Sidero Labs](https://pulse2.com/yardi-acquires-sidero-labs-to-expand-secure-kubernetes-and-virtualization-infrastructure/), Yardi as privately held, bootstrapped, profitable, with more than 10,000 employees (September 15, 2026)
- [Pacific Coast Business Times: Yardi goes head to head with software rival](https://www.pacbiztimes.com/2013/11/08/yardi-goes-head-to-head-with-software-rival/), the 2013 suit over interfaces and PSI's response
- [Bloomberg Law: Yardi, Entrata settle real estate antitrust suit on eve of trial](https://news.bloomberglaw.com/antitrust/yardi-entrata-settle-real-estate-antitrust-suit-on-eve-of-trial), the 2019 District of Utah settlement

**Platforms**

- [Buildium](https://www.buildium.com/), plans and prices, Open API on Premium, marketplace, RealPage ownership, Lumina AI
- [Entrata](https://www.entrata.com/), segments and the OXP, RXP and ELI platforms
- [Entrata: Entrata introduces Entrata Pro at Summit 2026](https://www.entrata.com/press/entrata-introduces-entrata-pro-at-summit-2026-giving-new-ai-capability-across-the-entrata-os), the agentic tier and AI Admin's audit trail and cost by property and owner (September 15, 2026)
- [Entrata: Leasing Center](https://www.entrata.com/products/leasing-center), outsourced leasing contact center
- [MRI Software](https://www.mrisoftware.com/), residential, commercial and occupier segments, Agora and Partner Connect
- [RealPage](https://www.realpage.com/), segments and services including SmartSource Accounting and IT, Compliance Services and Resident Utility Billing
- [RealPage: Lumina AI](https://www.realpage.com/platforms/lumina-ai/), the AI suite, agents co-developed with OpenAI, Lumina Connect
- [RealPage: RealPage acquires Cherre](https://www.realpage.com/news/realpage-acquires-cherre/), entity resolution and the open hub (July 14, 2026)
- [RealPage: RealPage and Funnel announce partnership](https://www.realpage.com/news/realpage-and-funnel-announce-partnership/), RealPage rails under Funnel's front office (October 13, 2026)
- [Rent Manager](https://www.rentmanager.com/), segments, API and Open Access, Orion AI, London Computer Systems
- [ResMan](https://myresman.com/), segments, AI assistants, Inhabit brand
- [Yardi Breeze](https://www.yardibreeze.com/), per-unit pricing and editions
- [Yardi Matrix](https://www.yardimatrix.com/), market intelligence across property types
- [RentCafe](https://www.rentcafe.com/), Yardi's listing site
- [AI Journal: Yardi publishes second connector on Anthropic marketplace](https://aijourn.com/yardi-publishes-second-connector-on-anthropic-marketplace-bringing-yardi-matrix-data-to-claude/), the Matrix connector as an add-on to Virtuoso Enterprise (June 17, 2026)

**Partner programs**

- [Entrata: Partners](https://entrata.com/partners), API, strategic and consulting tracks, sandbox and webhooks, client sponsor
- [RealPage Exchange](https://www.realpage.com/exchange/), the integration marketplace, AppPartners and partner list
- [RealPage: Integration Marketplace ODE Migration](https://www.realpage.com/lp/online-data-exchange-migration/), the AppPartner and Registered Vendor tracks and registration through the Developer Portal
- [AppFolio Stack](https://www.appfolio.com/stack), App Partners and Solution Partners
- [Truto: Integrating with Yardi and RealPage](https://truto.one/blog/overcoming-legacy-api-constraints-when-integrating-with-yardi-and-realpage/), third-party description of Yardi's interface fees and eligibility

**Specialists**

- [Storable](https://www.storable.com/), self-storage software, marketplace, payments and insurance
- [Guesty](https://www.guesty.com/), vacation rental property management and channel manager
- [Vantaca](https://www.vantaca.com/), community association management
- [EliseAI](https://eliseai.com/), AI for housing and healthcare providers
- [Snappt](https://snappt.com/), applicant fraud detection and verification
- [SmartRent](https://smartrent.com/), smart community and operations solutions, NYSE: SMRT
