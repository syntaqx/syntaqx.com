+++
title = "The Software Landscape"
description = "The field service software market: SMB, trade, vertical, enterprise and AI-native platforms, specialists, the ecosystem, recent moves, and build vs buy."
category = "Field Operations Industry"
order = 1502
part = "How the Work Flows"
tags = ["field-operations", "fsm-software", "vendors", "build-vs-buy", "market-map"]
+++

Field service software is a crowded market with no single winner, because the businesses it serves don't agree on what the hard problem is. A two-truck plumber needs to quote, book and get paid from a phone by Friday. A pool company with forty routes needs the same stops every week, chemistry readings and autopay. A multi-branch lawn or pest operator needs a year of recurring visits generated, routed and billed every night, with records each state will accept. A national appliance repair network needs an optimizer that respects service levels across thousands of technicians, and a furniture retailer needs two-hour delivery windows re-planned through the day. Each of those buyers found vendors built for them, and each vendor's product carries the shape of its first customers in its data model.

That makes choosing hard in a specific way. Feature lists converge (everyone has scheduling, a mobile app, invoicing and texting), while the things that decide fit are buried in the help center: whether recurring visits are generated ahead or one at a time, whether the app works offline and who wins a conflict, whether regulated records export in your state's format, whether the API can do what your other systems need. A wrong choice shows up a year later as a migration. This chapter maps the market by class, says what each class optimizes for, records recent moves under a dated heading, and ends with when to buy, extend or build. [The Field Operations Business](/books/field-operations/field-operations-business) describes the business models these products serve.

## The Map

![A map in three bands. The top band, systems of record, holds five classes: SMB horizontal, trade suites, property care, enterprise and AI-native. The middle band holds specialists that connect to it through APIs, webhooks and marketplaces: scheduling engines, delivery dispatch, door-to-door field sales and AI front office. The bottom band is the ecosystem of rails and data, embedded or connected: payments, financing, SMS and voice, telematics, property data and accounting.](/diagrams/fo-software-landscape-map.svg "One system owns the customer, agreement, schedule and ledger; specialists do one job deeper and connect to it; the ecosystem supplies rails and data to both. Examples: Jobber and Workiz (SMB horizontal), ServiceTitan (trade suites), FieldRoutes and Skimmer (property care), Salesforce and Dynamics 365 (enterprise), Solea (AI-native); Skedulo and Timefold (scheduling engines), Onfleet, eLogii and Spoke (delivery dispatch), SalesRabbit and Spotio (door-to-door sales), Avoca, Probook and Rilla (AI front office).")

The useful distinction is between a **system of record**, which owns the account, the property, the agreement, the schedule and the money, and everything that reads from or writes to it. My rule: a business has exactly one system of record for field work, because two means reconciling them forever, and any number of specialists around it. Most of the market's strategic moves are about which band a vendor sits in: suites adding AI front offices so callers never reach a specialist, and specialists adding scheduling and billing until they become systems of record.

## Systems of Record, by Class

| Class | Examples | Built first for | Optimizes for |
| --- | --- | --- | --- |
| **Horizontal SMB** | Jobber, Housecall Pro, Workiz, FieldPulse, ServiceM8 | Owner-operators and small crews across trades | Self-serve setup, quoting, online booking, embedded payments, low monthly price |
| **Trade suites** | ServiceTitan, FieldEdge, Successware, simPRO; BuildOps and ServiceTrade for commercial | Residential and commercial HVAC, plumbing, electrical | Pricebook, memberships, call center booking, capacity, proposals, financing |
| **Vertical property care** | FieldRoutes, PestPac and GorillaDesk for pest; Real Green, Aspire and LMN for lawn; Skimmer and Pool Brain for pool; ZenMaid and Launch27 for cleaning | Recurring route businesses | Recurring generation, route density, chemical records, renewals |
| **Enterprise platforms** | Salesforce Field Service, Dynamics 365 Field Service, ServiceNow, Oracle, SAP, IFS | Large, often asset-heavy service organizations | Configurability, global optimization, assets and entitlements, ERP integration |
| **AI-native** | Solea and other vertical entrants | Operators who want fewer office staff | Agents as the primary operators: answering, booking, overnight scheduling |

### Horizontal SMB

These products win on time to first invoice. Jobber ships online booking and a client hub reached by emailed or texted links, so customers never create a password; pricing is published per plan, and route optimization comes only on the upper plans. They're increasingly payments companies too: Jobber charges a fee for instant payouts and offers consumer financing on quotes through Wisetack.

They're thinner in any one trade: Housecall Pro says offline editing "is not supported at this time," and Jobber records chemical use from the web app, not the mobile one. A recurring route business can outgrow them on generation and routing long before it outgrows them on headcount.

### Trade suites

Trade suites are built around the repair ticket and the sale that follows it. Their center of gravity shows in what they document most deeply. ServiceTitan's documentation runs deepest on memberships with recurring service and deferred revenue, arrival windows and capacity, good-better-best proposal templates, call scoring and marketing attribution. The flat-rate pricebook sits at the center of all of them; how the suites and third-party books build it is in [Pricebooks: Where Prices Come From](/books/field-operations/pricing-and-sales-rules#pricebooks-where-prices-come-from), and the repair job around it in [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation).

Commercial suites add the contract layer: ServiceTrade turns inspection findings into deficiency quotes, and BuildOps tracks margin per service agreement. What suites optimize less is the dense recurring route: ServiceTitan's documented route optimization reorders one technician's day, up to 70 jobs, rather than building multi-day routes for a book of recurring customers.

### Vertical property care

Property care vendors start from the agreement and the route. In pest, FieldRoutes generates due work into a job pool, routes it with drive time, skills and vehicle constraints, tracks product capacity per route, and exports state chemical reports in several states' formats; PestPac has technicians complete state-specific material reports in the field (California and Arizona among them) and projects chemical needs from scheduled jobs. Pool vendors add chemistry: Pool Brain calculates dosing from the technician's readings and tracks chemical cost per body of water, and Skimmer prices "monthly, per service location." Cleaning tools center on the frequency (Launch27's weekly or biweekly bookings, ZenMaid's "2nd Friday of every month") and on paying cleaners by the hour or by revenue share. Lawn vendors diverge again: Aspire treats renewal as a re-quote with recalculated prices, and LMN builds every estimate from the company's budget and overhead recovery.

### Enterprise platforms

Enterprise FSM is a configurable platform first and a field service product second. Salesforce Field Service models work orders, service appointments, territories, skills, maintenance plans and entitlements as platform objects, and schedules with **policies**: pass-fail work rules plus weighted objectives. Dynamics 365 Field Service separates work order and booking life cycles, generates work from agreements at a configurable time, offers Resource Scheduling Optimization as an add-on, and lets an admin decide whose edit wins an offline sync conflict. Oracle Field Service can route with no dispatcher at all; SAP sets scheduling policies centrally.

They suit organizations already running the platform for sales, service or ERP. The price is configuration effort, platform limits and an upgrade cadence you don't control.

### AI-native

The newest class claims the system of record should be designed for software agents, not clerks. Solea, built for pest control, argues that in bolt-on systems "the human is still the operator, and the AI is a feature," and builds the core itself: scheduling, booking, field app and billing. Probook and Broccoli look similar from outside but sit in a different band: they run dispatch and the phones with AI on top of an existing system of record such as ServiceTitan, rather than replacing it, so they're listed with the specialists below. [AI in Field Operations](/books/field-operations/ai-in-field-operations) covers what these products do. Treat customer results in this class (drive time saved, dispatchers no longer needed) as vendor-reported, not independently measured.

## The Specialists

| Specialty | Examples | What it does better than a suite | Integration shape |
| --- | --- | --- | --- |
| **Scheduling and optimization engines** | Skedulo, Timefold, Google Route Optimization, OR-Tools, VROOM, Routific, OptimoRoute | Constraint modeling, multi-day and real-time re-planning, scale | Submit a problem, poll or receive a solution, apply it |
| **Delivery dispatch** | Onfleet, eLogii, Bringg, Spoke, DispatchTrack, FarEye | Same-day re-optimization, live ETAs, proof of delivery, failure reasons | Tasks or stops in, webhooks out |
| **Door-to-door and field sales** | SalesRabbit, Spotio, RepCard, Enerflo | Territories, dispositions per door, leaderboards, offline knocking | Leads and sold agreements pushed to the system of record |
| **AI front office and dispatch** | Avoca, Netic, Hatch, Broccoli, Probook, Rilla | Answering every call, speed to lead, AI-first dispatch, call and ride-along scoring | Read availability, write bookings, assignments and notes into the FSM |

**Scheduling engines** are where the buy-the-hard-part decision usually lands. Skedulo classifies constraints as hard, medium and soft, weights its objectives, and says results "are near-optimal and may differ across runs." Timefold sells a Field Service Routing API with skills, shifts, fairness, multi-day visits and a freeze time for real-time planning, on an Apache-2.0 solver. Below them sit routing APIs and libraries you run yourself (Google's Route Optimization API, OR-Tools, VROOM). [Route Optimization](/books/field-operations/route-optimization) compares them.

**Delivery dispatch** products are the reference for the live day: Onfleet's tracking links stop showing location after completion, eLogii keeps an immutable task history with the location of every state change, and Spoke can re-optimize only changed stops ([Dispatch & the Day of Service](/books/field-operations/dispatch)).

**Field sales tools** own the door, and solar, roofing, security, lawn and pest all sell there. Property care suites have pulled this in (FieldRoutes' doors and knocks, GorillaDesk's DoorMamba), so a separate tool means a second system for leads and a sync for sold agreements.

**AI front-office** vendors are the fastest-moving specialty. They sit on the phone line and text inbox, read the FSM's availability and write bookings back: Avoca lists ServiceTitan as a certified integration, Broccoli books calls straight onto ServiceTitan's dispatch board, and Netic says bookings go "directly into the customer's CRM or FSM, following the company's operational rules." Systems of record answer with built-in agents (ServiceTitan's Voice Agent, Jobber's Receptionist, Housecall Pro's CSR AI).

## The Ecosystem

| Layer | Examples | What the platform owns vs buys |
| --- | --- | --- |
| **Payments** | Embedded processing in Jobber, Housecall Pro, ServiceTitan and FieldRoutes | Buy processing; own which account, agreement and invoice each payment belongs to. Stored-card portability is a contract term ([Processor Routing](/books/payments/processor-routing)) |
| **Consumer financing** | Wisetack, GreenSky, Synchrony, Affirm, Klarna | Buy the lending; own the offer moment and the disclosures shown with it |
| **Messaging and voice** | Messaging providers such as Twilio, which handle 10DLC registration with the carriers; Podium, Birdeye; CallRail | Buy delivery; own consent records and opt-outs per number |
| **Lead sources** | Google Local Services Ads, Angi, Thumbtack, Yelp | Integrate; own source attribution and lead credit tracking |
| **Telematics** | Samsara, Motive, Geotab, Verizon Connect | Buy devices and feeds; own the join of vehicle data to routes, visits and drivers |
| **Property data** | ATTOM, Regrid, Smarty, Nearmap, EagleView | License; own the key that joins a parcel to your property, and respect each license's use limits |
| **Accounting** | QuickBooks and ERPs | Integrate or own; decide which system is the book of record for revenue |

Almost nobody should build these. The work is in the glue, which has rules of its own: 10DLC registration through a campaign service provider, per-lead credit rules, and property data licenses that restrict caching, direct mail and AI training.

## Recent Moves, as of October 2026

Dated facts age fast; this is the market as of October 2026, from each company's announcement or the press coverage cited.

| Date | Move | Why it matters |
| --- | --- | --- |
| January 4, 2022 | ServiceTitan agrees to acquire FieldRoutes (formerly PestRoutes) | A trade suite buys into recurring property care rather than building it |
| December 4, 2024 | Workiz launches Genius Answering, an AI receptionist inside the FSM (per ACHR News) | AI call answering arrives inside SMB platforms |
| December 12, 2024 | ServiceTitan prices its IPO | The category's largest vendor becomes public |
| April 9, 2025 | Salesforce announces Agentforce for Field Service: self-scheduling, gap filling, job summaries | Enterprise platforms ship agents across the field workflow |
| November 13, 2025 | Netic raises a $23 million Series B | AI revenue engines for trades attract growth capital |
| January 2026 | Yelp acquires Hatch, an AI CSR platform, for about $270 million (as reported by Hatch) | A lead marketplace buys the follow-up layer |
| April 23, 2026 | IFS launches Loops Agent Studio with pre-built field service digital workers | Enterprise agents become packaged products |
| April 27, 2026 | Avoca reports more than $125 million raised across three rounds at a $1 billion valuation | AI front office becomes its own large category |
| June 23, 2026 | Probook raises $40 million for AI-first dispatch | Dispatch itself becomes the AI entry point |
| August 12, 2026 | Klarna and Housecall Pro add pay-over-time for home service pros | Consumer financing spreads to SMB platforms |
| September 25, 2026 | Solea closes a seed round, bringing total raised to $10 million | An AI-native system of record targets one vertical directly |
| October 13, 2026 | ServiceTitan launches ServiceTitan for Property Care for enterprise pest, lawn and pool, with a Sentricon reporting workflow built with Corteva; FieldRoutes keeps local and semi-regional pest | The suite moves into enterprise recurring routes |
| October 20, 2026 | Yelp announces Smart Lead Reply, an AI agent that answers and vets quote requests | Lead sources add their own agents ahead of the FSM |

Three patterns run through the list. **Consolidation by segment:** ServiceTitan now covers trades, local pest through FieldRoutes and enterprise property care in its core. **The front office is automated first,** because a missed call is measurable lost revenue, and suites, SMB tools, marketplaces and startups all ship agents there. **AI-native entrants attack the system of record itself,** one vertical at a time, arguing agents need one shared state rather than an integration.

## How the Leading Products Compare

Public documentation differs a lot in depth, so this table records only what each vendor's own pages say. "Not published" means the vendor has no public page on it, not that the feature is missing.

| Vendor | Recurring work | Routing | Offline app | Change history | API |
| --- | --- | --- | --- | --- | --- |
| **Dynamics 365 Field Service** | Agreements generate work orders and invoices | Schedule board, assistant, optimization add-on | Offline-first; admin sets who wins conflicts | Dataverse auditing, retention configurable | The Power Platform |
| **eLogii** | Templates repeat tasks or routes on set dates | Auto-optimization; en route tasks excluded by default | Sync of offline task actions | Immutable task history with locations | Webhooks with HMAC or OAuth |
| **FieldRoutes** | Subscriptions feed a job pool by due date | Multi-technician routing with vehicle, skill and capacity constraints | Service and sales offline; charging needs signal | Change Log Report; Changelogs API | Public reference |
| **Housecall Pro** | Service plans with included visits | One technician's day by drive time | Editing offline not supported | Activity feeds with device | Not published |
| **Jobber** | Recurring jobs create visits with the job's line items | Anytime visits, up to 7 days at once | Not published | Activity feed, kept up to a year | GraphQL, authorization code flow, app store |
| **Salesforce Field Service** | Maintenance plans with calendar, criteria and usage rules | Policies of work rules and weighted objectives | Briefcase priming; automatic offline mode | History objects per field service object | The Salesforce platform |
| **ServiceTitan** | Memberships generate recurring service events | Reorders one technician's day, up to 70 jobs | Most field work offline; some payments, financing and inventory need a connection | Audit trail with old and new values on customers and locations | OAuth client credentials plus app key |

## Build, Buy or Extend

Most field businesses should buy, and the market above is the reason: someone has already built for almost every trade and size. The real decision is narrower.

**Buy** when your operating model matches a vendor's first customers. The test isn't the demo; it's reading the help center for the five things that are expensive to change: how recurring work is generated (ahead, rolling window, or next on completion), how billing frequency relates to service frequency, offline behavior and conflict handling, regulatory exports for your states, and the API's coverage and rate limits. Also read who owns your stored payment cards if you leave, and what export the vendor provides ([Switching Platforms](/books/field-operations/switching-platforms)).

**Extend** when you already run an enterprise platform or have outgrown a vendor in one area. Two shapes:

- **Extend the platform.** Salesforce and Dynamics are built to be extended with custom objects, workflows and code, and Skedulo runs on Salesforce or standalone. You inherit the platform's limits and upgrade cadence, and your extensions become a codebase to maintain.
- **Extend around the FSM.** Keep the vendor as system of record and add specialists through its API: an AI answering service, a canvassing app, an optimization engine, a data warehouse. This works until the specialist needs data the API doesn't expose, or writes the vendor can't validate. ServiceTitan's app keys and per-tenant access, and Jobber's scoped apps, are the boundaries you design within.

**Build** when the operating model is the competitive advantage and no vendor's model fits: an unusual sales channel, a regulatory load no vendor will prioritize, or a scale where per-seat pricing exceeds an engineering team's cost. My default even then: build the domain and buy the rails.

```text
build (your model, your moat)          buy or license (commodity, regulated, hard)
------------------------------         --------------------------------------------
accounts, properties, agreements       card and ACH processing, card vault
recurring generation and renewals      SMS and voice delivery, 10DLC registration
scheduling rules and dispatch UX       maps, geocoding, travel-time matrices
pricing and sales rules                optimization solver (or a routing API)
commission and retention logic         telematics devices and feeds
audit history and compliance exports   property and parcel data
ledger of what each account owes       e-signature, tax rates, accounting system
```

The hard parts are the ones the market charges most for: an optimizer that handles skills, windows, locks and real-time changes; offline sync that never loses a technician's work; recurring billing that survives skips, pauses and price changes; and each state's regulatory exports. Budget for them as products. Put an [anti-corruption layer](/docs/architecture/service-boundaries) between your domain and every vendor, so changing messaging provider or routing API is an adapter swap, and drive your state from your own [events](/docs/architecture/events), not vendors' webhooks.

## Auditing

A landscape of connected systems needs auditing across the joins, not just inside each product:

- **Know which system wrote what.** Every record an integration or AI agent creates or changes carries that integration's identity, not a shared admin user. Dynamics 365's agent feed separates tasks completed by agents from tasks completed by users.
- **Know what each vendor keeps and for how long.** Jobber's activity feed keeps notifications up to a year; Dataverse audit retention defaults to forever; ServiceM8's account activity log keeps 90 days and can't be exported. If a regulator or a lawsuit needs seven years, the vendor's log isn't your archive.
- **Keep integration payloads** for the window disputes arise in, because "the AI booked it" and "the canvassing app said it was signed" are claims you'll need to prove.

The mechanics are in [Audit Trails](/docs/architecture/audit-trails), and the field records regulators ask for in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Decide what your system of record is,** and keep exactly one for accounts, agreements, schedules and the ledger; everything else integrates with it.
- **Evaluate vendors on their data model, not their feature list:** recurring generation, billing versus service frequency, offline conflict rules, regulatory exports and API coverage.
- **Buy the rails,** payments, messaging, maps, telematics, property data and usually the solver, and build only the domain that differentiates you.
- **Put an adapter layer between your domain and every vendor,** and drive your state from your own events.
- **Negotiate card portability and full data export before signing,** because they decide the cost of leaving.
- **Give every integration and AI agent its own identity,** and archive the audit history you need yourself.

## References

**Reference**

- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), the field service object model, booking and optimization APIs, history objects
- [Salesforce Trailhead: Scheduling policies](https://trailhead.salesforce.com/content/learn/modules/field-service-lightning-scheduling-basics/examine-scheduling-policies), work rules and weighted objectives
- [Microsoft Learn: Dynamics 365 Field Service overview](https://learn.microsoft.com/en-us/dynamics365/field-service/overview), service models, schedule board and optimization modes
- [Microsoft Learn: Resource Scheduling Optimization](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-overview), the optimization add-on
- [Microsoft Learn: Set up agreements](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-agreements-work-orders), generation time and lead days
- [Microsoft Learn: Mobile offline sync](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile-power-app-system-offline-sync), table-level conflicts and the conflict detection setting
- [Microsoft Learn: Supervise agents with agent feed](https://learn.microsoft.com/en-us/dynamics365/field-service/supervise-agents-with-agent-feed), tasks completed by agents versus users
- [Microsoft Learn: Dataverse auditing](https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing), audit configuration and retention
- [Oracle: Routing in a dispatcher-free environment](https://docs.oracle.com/en/cloud/saas/field-service/farcu/c-configure-routing-to-work-in-dispatcher-free-environment.html), continuous routing runs
- [SAP Learning: Scheduling techniques in SAP FSM](https://learning.sap.com/courses/managing-sap-field-service-management/implementing-scheduling-techniques), central scheduling policies
- [Skedulo: Optimization of schedules](https://docs.skedulo.com/developer-guides/manage-and-schedule-work/optimization-of-schedules/), hard, medium and soft constraints
- [Timefold: Field Service Routing introduction](https://docs.timefold.ai/field-service-routing/latest/introduction), the routing API and real-time planning
- [Timefold Solver (GitHub)](https://github.com/TimefoldAI/timefold-solver), the Apache-2.0 Community Edition
- [Google: Route Optimization API overview](https://developers.google.com/maps/documentation/route-optimization/overview), shipments, vehicles, windows and costs
- [Twilio: A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc), brand and campaign registration a messaging provider handles for US business texting

**In practice**

- [ServiceTitan: FieldRoutes acquisition](https://www.servicetitan.com/press/fieldroutes-acquisition), January 4, 2022
- [Renaissance Capital: ServiceTitan prices IPO](https://www.renaissancecapital.com/IPO-Center/News/108194/software-platform-servicetitan-prices-ipo-at-71-above-the-upwardly-revised), December 12, 2024
- [ServiceTitan: Property Care launch](https://www.servicetitan.com/press/servicetitan-expands-into-enterprise-pest-control-lawn-care-and-pool-spa-markets), October 13, 2026: enterprise pest, lawn and pool, Sentricon workflow, FieldRoutes' segment
- [ServiceTitan: Get started with API dev portal V2](https://help.servicetitan.com/docs/get-started-with-api-dev-portal-v2), OAuth client credentials and app keys
- [ServiceTitan: Optimize technician route](https://help.servicetitan.com/docs/use-optimize-technician-route), one technician's day, up to 70 jobs
- [ServiceTitan: Field Mobile offline capabilities](https://help.servicetitan.com/docs/servicetitan-field-mobile-app-offline-capabilities), what works without a connection
- [ServiceTitan: Voice Agent settings](https://help.servicetitan.com/docs/configure-your-voice-agent-settings-in-servicetitan), AI booking
- [FieldRoutes: Introduction to Intelligent Routing](https://knowledgebase.fieldroutes.com/docs/an-introduction-to-intelligent-routing.md), routing methods and constraints
- [FieldRoutes: State Chemical Report](https://knowledgebase.fieldroutes.com/docs/state-chemical-report.md), state formats for pesticide reporting
- [FieldRoutes: Mobile offline mode](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-offline-mode.md), service and sales work offline
- [FieldRoutes: API reference](https://knowledgebase.fieldroutes.com/apidocs), public resources including changelogs, doors and knocks
- [Jobber: Pricing](https://getjobber.com/pricing/), published plans and the instant payout fee
- [Jobber: What clients see in client hub](https://help.getjobber.com/en/articles/what-do-your-clients-see-in-client-hub/), password-free access by emailed or texted link
- [Jobber: Wisetack consumer financing](https://help.getjobber.com/en/articles/jobber-and-wisetack-consumer-financing-integration/), financing offered on quotes
- [Jobber: Create a recurring job](https://help.getjobber.com/en/articles/create-a-recurring-job/), visits created with the job's line items
- [Jobber: Developer Center](https://help.getjobber.com/en/articles/developer-center/), GraphQL apps and the authorization code flow
- [Jobber: Chemical tracking](https://help.getjobber.com/en/articles/chemical-tracking/), records entered from the web app, not the mobile app
- [Jobber: Route optimization](https://help.getjobber.com/en/articles/route-optimization-new-schedule/), anytime visits, up to 7 days, on the Connect, Grow and Plus plans
- [Jobber: Activity feed](https://help.getjobber.com/en/articles/activity-feed/), notifications retained up to a year
- [Jobber: Receptionist](https://help.getjobber.com/en/articles/receptionistpowered-by-jobber-ai/), AI call and text answering
- [Housecall Pro: Mobile FAQ](https://help.housecallpro.com/en/articles/4747652-housecall-pro-mobile-faq), offline editing not supported
- [Housecall Pro: Activity feed](https://help.housecallpro.com/en/articles/4154392-activity-feed), feeds with device
- [Housecall Pro: CSR AI overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), AI call answering
- [PYMNTS: Housecall Pro brings Klarna to home service pros](https://www.pymnts.com/bnpl/2026/housecall-pro-brings-klarna-payment-tools-to-home-service-pros/), August 2026
- [ACHR News: Jessica is the new AI receptionist for contractors](https://www.achrnews.com/articles/163805-jessica-is-the-new-ai-receptionist-for-contractors), Workiz Genius Answering, December 2024
- [PestPac: Chemical tracking](https://www.pestpac.com/features/chemical-tracking-software), state-specific material reports completed in the field and expected usage from scheduled jobs (marketing)
- [ServiceTrade: AAA Fire Protection case study](https://servicetrade.com/resources/case-studies/aaa-fire-protection/), inspection deficiencies turned into quotes
- [BuildOps: Service agreements](https://buildops.com/platform/service-agreements/), margin per agreement
- [Aspire: Contract renewal settings](https://guide.youraspire.com/docs/understanding-contract-renewal-settings), renewal as a re-priced quote
- [Skimmer](https://www.getskimmer.com/), pool routes, dosing and per-location pricing
- [Pool Brain: Features](https://www.poolbrain.com/features/), dosing from readings and chemical cost tracking
- [Launch27: Frequencies overview](https://intercom.help/Launch27/en/articles/4259417-frequencies-overview), weekly and custom cleaning frequencies
- [ZenMaid: Monthly cleans on a specific weekday](https://zenmaid.com/answers/en/articles/9952872-how-to-schedule-monthly-cleans-on-a-specific-weekday), "2nd Friday of every month" recurrence
- [ZenMaid: Run payroll](https://www.zenmaid.com/answers/en/articles/1767506-how-to-run-payroll-in-zenmaid), hourly, revenue share and flat-rate pay types
- [Solea: AI-native vs bolt-on](https://www.solea.ai/blog/ai-pest-control-software-ai-native-vs-bolt-on), the AI-native argument
- [Solea: Raises $10M](https://www.solea.ai/blog/solea-raises-10m), seed round, September 25, 2026
- [Fortune: Probook raises $40 million](https://www.fortune.com/2026/06/23/exclusive-this-startup-wants-to-be-the-ai-brain-for-home-services-and-it-just-raised-40-million-from-sequoia-and-a16z/), June 23, 2026, dispatch-first AI and ServiceTitan partnership
- [ServiceTitan Marketplace: Broccoli AI](https://marketplace.servicetitan.com/partner/broccoli-ai), AI phone agents booking onto the ServiceTitan dispatch board
- [Dealroom: Avoca raises $125M at $1B valuation](https://dealroom.co/news/127930-avoca-raises-125m-at-1b-valuation-to-bring-ai-to-service-businesses/), April 27, 2026
- [Avoca](https://www.avoca.ai/), AI CSR, coaching and ServiceTitan integration
- [Fenwick: Netic $23M Series B](https://www.fenwick.com/insights/experience/fenwick-represents-netic-in-23m-series-b-funding), November 13, 2025
- [Netic](https://www.netic.ai/), bookings written into the customer's FSM
- [Hatch: The new Hatch](https://www.usehatchapp.com/blog/the-new-hatch), Yelp acquisition for approximately $270 million, January 2026
- [PPC Land: Yelp Smart Lead Reply](https://ppc.land/yelp-charges-30-a-month-for-ai-agent-that-answers-and-qualifies-leads/), October 20, 2026, an AI agent answering and qualifying leads
- [Salesforce: Agentforce for Field Service](https://www.salesforce.com/news/stories/agentforce-for-field-service-announcement/), April 9, 2025
- [ATDb: IFS Loops launches Agent Studio](https://www.theatdb.com/news/ifs-loops-launches-agent-studio), April 23, 2026
- [Onfleet: Notification triggers](https://intercom.help/onfleet-4f83d83093ac/en/articles/16090283-notification-set-up-triggers), ETA, arriving and completion messages
- [eLogii: Task history](https://help.elogii.com/en/articles/5623895-task-history), immutable state and data history with locations
- [eLogii: Webhooks](https://help.elogii.com/en/articles/5645384-webhooks), events and authentication options
- [Spoke Dispatch: API](https://developer.dispatch.spoke.com/api), live re-optimization types
- [SalesRabbit: Features](https://salesrabbit.com/features/), territories and leaderboards
- [Wisetack: Compare Wisetack vs GreenSky](https://www.wisetack.com/compare/wisetack-vs-greensky), consumer financing for home services
- [Google: Local Services Ads charges](https://support.google.com/adwords/answer/7195435), pay per valid lead
- [Regrid: Terms](https://www.regrid.com/terms), use restrictions on licensed parcel data
- [ServiceM8: Account activity](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-view-your-account-activity.md), a 90-day activity log that can't be exported
