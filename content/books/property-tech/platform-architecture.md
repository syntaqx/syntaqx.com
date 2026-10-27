+++
title = "Platform Architecture"
description = "How a property platform fits together: tenancy, users and grants, entity ledgers, the rules engine, integration models, events, offline apps and data out."
category = "Property Tech Industry"
order = 1736
part = "Running the Platform"
tags = ["property-tech", "architecture", "multi-tenancy", "authorization", "integrations", "data-pipelines"]
+++

A property platform is a ledger with a building attached. Every chapter before this one describes a piece of it: the lease and its schedules, the resident ledger, the trust accounts and entity books, the rules of each jurisdiction, the work orders, the owner statements. This chapter is how the pieces fit, and the parts the earlier chapters left to it: who the tenant is, who the users are and what they may see, how one manager keeps many owners' books in one database, where the rules engine sits, how other software gets in and data gets out, and how a technician's app works in a basement. The hard problems are specific to the industry. One login has to serve a regional manager across forty properties, an owner who must see only her three, an investor who must see only his capital account, a board member, a resident's parent who pays but may not read maintenance requests, and a plumber who sees one work order. Integrations arrive through five commercial models with different consent steps, and an AI client now reads the same records with a user's permissions.

The general engineering lives in the playbook, and this chapter links to it rather than repeating it: [Multi-Tenancy](/docs/architecture/multi-tenancy), [Authorization](/docs/security/authorization), [Events & Async Messaging](/docs/architecture/events), [Webhooks](/docs/api-design/webhooks), [API Authentication](/docs/api-design/authentication), [Rate Limiting](/docs/requests/rate-limiting), [Custom Fields](/docs/architecture/custom-fields), [Offline-First Sync](/docs/architecture/offline-sync) and [Data Pipelines & Analytics](/docs/architecture/data-pipelines). The data model is in [The Core Data Model](/books/property-tech/property-business#the-core-data-model); what follows extends it.

## How the Platforms Do It

The suites describe their architecture in product terms, and the shapes underneath are similar:

| Vendor | System of record | Configuration | Third-party access | Data out and AI clients |
| --- | --- | --- | --- | --- |
| **Entrata** | One operating system on one database, by its S-1 | "Configure at the site or corporate level with over 3,000 settings" | API by agreement, partner tracks with a client sponsor, sandbox and webhooks | Data access "through Snowflake" for any BI tool |
| **Yardi** | Voyager and Breeze; interfaces per business area (resident transactions, common data, service requests, vendor invoices, job cost) | Not published (yardi.com blocks automated reading) | Licensed interfaces, per a third-party integrator: a fee and an agreement per interface | Virtuoso Connector for Claude, whose access "follows existing user permissions" |
| **RealPage** | OneSite and its product lines | Not published | RealPage Exchange: AppPartners and Registered Vendors, each client accepting or denying each integration | Lumina Connect: "zero-copy access" from Snowflake, Databricks, Microsoft Fabric or Google Cloud, and an MCP connector |
| **AppFolio** | One platform with Core, Plus and Max plans | Not published | Database API on Plus (read-only) and Max (read and write); Stack marketplace | Through the API |
| **Buildium** | One platform for residential and associations | Not published | Open API on the Premium plan, keys created by the customer, a sandbox and webhooks | Through the API |
| **Rent Manager** | Rent Manager Online | Not published | A REST API with "read" and "write" access and an Integrations Program | "Open Access provides comprehensive read-only views" of the database |
| **MRI Software** | Residential, commercial and occupier products | Not published | Solution Partners that "integrate with and complement" MRI's products | Not published |

Three patterns run through the table. **One database per customer view, whatever the product count:** every suite sells "one login" across modules, and the ones assembled by acquisition expose that as integrations between their own products. **Configuration is huge and hierarchical:** three thousand settings at corporate and site level is the scale a configuration model has to handle, with inheritance and a record of who changed what. **Access is a commercial decision before it's a technical one:** which partner may read which data, under which agreement and fee, is set by the program, and the API style follows.

## Tenancy: The Management Company

The tenant is the operator, not the owner ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)). A third-party manager is one tenant holding the records of every owner it works for; a self-managing owner or an owner-operator is a tenant of its own. The isolation mechanics (a `tenant_id` on every row, row-level security, tenant context per connection) are in [Multi-Tenancy](/docs/architecture/multi-tenancy); what property adds is the shape inside the tenant and the cases where the boundary bends.

**Inside the tenant, two trees cross.** The operator's tree is `portfolios`: regions, districts, owner groups, funds, with properties at the leaves. The owner's tree is `legal_entities` and `ownership_shares`: which entity holds title to each property and who owns that entity. Configuration inherits down the operator's tree; money rolls up the owner's. A regional manager's scope is a portfolio node; an owner's scope is an entity and everything it owns. Both resolve to a set of properties on a date, and the property is where rules, permissions and reports meet ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).

**The boundary bends in four places:**

- **An owner with two managers** is a legal entity in two tenants, each with its own records. Combining them is the asset manager's work in [Data from Third-Party Managers](/books/property-tech/investors-and-asset-management#data-from-third-party-managers): submissions from each manager, mapped and checked, never a cross-tenant join.
- **A property that changes managers** leaves one tenant and arrives in another as new records. The old tenant keeps its history read-only, because it stays answerable for the period it managed ([Onboarding and Offboarding an Owner](/books/property-tech/owners-and-management-agreements#onboarding-and-offboarding-an-owner)); [Switching Platforms & Acquisitions](/books/property-tech/switching-platforms#kinds-of-move) covers the move.
- **One person, several tenants.** A resident who rents from two managers, a vendor who serves ten, an investor in funds run by two sponsors: one login identity, a separate user in each tenant, and a tenant picker at sign-in. Nothing a person does in one tenant is visible in another.
- **Shared reference data has no tenant.** Jurisdictions, legal rules, HUD income limits, allowance rates and rule test cases are platform-wide rows that every tenant reads and none owns ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law)); a tenant's own policies sit on top of them.

**Configuration is data with a source.** At thousands of settings, every setting needs a definition (type, default, the levels at which it may be set, whether a change needs approval), and every value records the node it's set on, its effective dates and who set it. The UI shows the resolved value and where it came from, because "why does this property charge that late fee" is the first support question a hierarchy produces. Settings that encode law (a late fee cap, a notice period) are not settings: they're rules from the rules engine, and a tenant policy may only be stricter than the law it sits under.

## Users, Roles and Grants

The core model keeps residents as `people` and says staff, owners and vendors are users with grants, defined here; every actor column in the book (`approved_by`, `decided_by`, `assigned_user_id` and the rest) points at this table, under the naming convention in [How to Build It](#how-to-build-it). The authorization model is the playbook's mix: roles for what kind of thing a user may do, and relationships for which records ([Choosing a Model](/docs/security/authorization#choosing-a-model)). Property management is the clearest case for that mix in the playbook, because most access in it comes from a relationship the domain already records.

| User | How they get access | Scope | What they typically see and do |
| --- | --- | --- | --- |
| **Staff** (site, regional, central, corporate) | An explicit grant of a role at a node | A portfolio subtree, a property, or a function across properties (central leasing, AP) | The workflows of their role; a central accountant sees invoices for every property in scope but no resident messages |
| **Owner user** | An explicit grant on an owning entity | The properties the entity owns on each date | Statements, budgets, approvals within the agreement's limits ([Owner Reporting](/books/property-tech/owners-and-management-agreements#owner-reporting)) |
| **Investor user** | An explicit grant on an investor entity | That investor's positions in funds and ventures | Capital account, distributions, tax documents, never property operations ([Investor Reporting and Tax](/books/property-tech/investors-and-asset-management#investor-reporting-and-tax)) |
| **Board member** | Derived from the association's board roles while seated | One association | Financials, approvals of invoices and architectural requests, votes ([Governance: Boards, Meetings and Votes](/books/property-tech/community-associations#governance-boards-meetings-and-votes)) |
| **Resident** | Derived from lease membership | Their own lease and household | Ledger, payments, requests, documents, amenity bookings |
| **Guarantor** | Derived from the guarantor role on a lease | The guaranteed lease, billing only | Balance, payments, notices the guaranty entitles them to; not maintenance or messages ([Guarantors: Parents, International Families and Substitutes](/books/property-tech/student-housing#guarantors-parents-international-families-and-substitutes)) |
| **Representative** | Derived from a verified authority record | One resident, by authority type | Billing for financial authority, care updates for health authority ([Families, Representatives and the Portal](/books/property-tech/senior-living#families-representatives-and-the-portal)) |
| **Vendor user** | Derived from assignment to a work order, purchase order or bid | Those records only | The job, the unit's access instructions for the work window, invoices and compliance documents |
| **Service account** | An explicit grant to an integration's identity | The properties the operator consented to | The scopes in the integration's agreement ([Service Accounts Are Users](/docs/security/support-access#service-accounts-are-users)) |
| **AI agent** | Its own identity, acting for a user or for the operator | The intersection of the agent's scopes and the user it acts for | Tools, never tables ([AI in Property Management](/books/property-tech/ai-in-property-management#governance-and-the-ai-audit-trail)) |

Five rules make this work:

- **Derive what the domain already says.** A resident's access is a lease membership; a board member's is a seat on the board; a guarantor's is a guaranty; a vendor's is an assignment. Copying those into a grants table creates a second record that drifts: the roommate who moved out keeps portal access because nobody revoked the grant. Derived access ends when the relationship's dates end.
- **Grant at a node, resolve to properties on a date.** A grant on a portfolio covers every property in the subtree; a grant on an owning entity covers every property the entity owns on that date, so an owner who sells a property loses its operations from the closing date while keeping the statements for months it owned. Resolution is a set of property ids per user, maintained when grants, trees or ownership change, so row-level security checks membership in an indexed table instead of walking trees per row.
- **Restricted data has its own permissions.** VAWA documentation, accommodation verification, demographic data collected for HUD programs, screening reports, clinical links and investor accreditation evidence live in stores with separate grants and read logging; a property manager's role doesn't include them by default ([Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits), [Fair Housing](/books/property-tech/fair-housing#how-to-build-it)).
- **Approval limits are permissions with amounts.** A property manager may approve invoices to a limit, an owner's approval is required above the agreement's threshold, and a board approves association spending: the limit is data on the grant or the agreement, checked in code, and the approval is a record ([Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables)).
- **Nobody acts as someone else.** Support staff use time-boxed, read-only, logged sessions with a reason ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation)); an agent acting for a user carries both identities in every record.

## Entity Ledgers

A manager keeps many sets of books in one ledger: each owning entity's, its own corporate books, funds' and associations'. The design is one ledger with every account dimensioned by legal entity and property, each entity's trial balance a filter, cross-entity transactions balanced by due-to and due-from entries, and period close per entity. [The General Ledger by Entity](/books/property-tech/trust-accounting#the-general-ledger-by-entity) owns it; the platform consequences are three:

- **Every module posts through one ledger service.** Charges, payments, fee runs, payables, deposits, utility billing runs and capital project costs all post balanced transactions with the entity and property on every line. A module that writes its own balances is a reconciliation project waiting to happen ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)).
- **The entity is resolved at posting time.** The landlord of record on the lease and the property's owner on the business date decide whose books an entry belongs to; a property sold mid-month splits the month between two entities by date, without anyone choosing.
- **Closed periods are a platform rule.** Every module that posts must respect each entity's closed periods and post corrections to the open one ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)), including the migrations and integrations that load history.

## The Rules Engine

Deposit limits, late fee caps, notice periods, rent caps, fee disclosures, repair deadlines, entry notice and screening limits are effective-dated rules attached to jurisdictions, resolved from the property, and evaluated by one service that records each evaluation ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law)). The platform's job is to make every module ask it:

- **Modules call; they don't embed.** The late fee run, the renewal pricer, the deposit return, the work order deadline and the listing's fee display each call the rules service with the property, the rule type and the as-of facts, and store the evaluation id on the record the rule shaped (as `work_orders.deadline_evaluation_id` and `renewal_offers.rule_evaluation_id` do).
- **Fail closed.** When no rule resolves for a property and a rule type that matters, the action stops for review rather than defaulting to the most permissive value ([Rules as Effective-Dated Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data)).
- **Tenant policy is a layer.** An operator's stricter policy (a lower late fee, a longer notice) sits on top of the law and is evaluated in the same call, so the record shows both.

## Integration Models

The industry's integrations come through five models that differ in who grants access, who pays and what the operator has to consent to. A platform builder chooses which to offer; an operator, which to accept; a point solution, which it can afford.

| Model | How it works | Public examples |
| --- | --- | --- |
| **Licensed interfaces** | Separate interfaces per business area, each licensed with its own agreement and fee; SOAP with credentials in the envelope; eligibility thresholds | Yardi, as a third-party integrator describes it: "an annual license fee per interface," "a separate agreement for each Yardi interface," and a requirement that "your company must be two years old and have at least three active Voyager clients" |
| **Partner-gated API with a client sponsor** | API access under an agreement, through a partner application that names a customer who endorses the applicant; tiers, sandbox and webhooks for partners | Entrata: "Using the Entrata API requires an agreement between your company and Entrata"; the partner form asks for "a client sponsor, a PMC that endorses your business"; calls are POST requests whose body names the method |
| **Certified marketplace with client consent** | A developer portal, API keys issued by the program, a certification review, and a per-client accept or deny step before any data flows | RealPage Exchange: AppPartners, with "a more extensive review and certification," and Registered Vendors, a track that is "free for vendors to integrate" with "comparatively limited API capabilities" |
| **API as a plan feature** | The customer buys API access with its plan and creates its own keys; no partnership for the customer's own integrations | AppFolio's Database API (read-only on Plus, read and write on Max); Buildium's Open API on Premium; Rent Manager's API and read-only Open Access |
| **AI connectors** | An MCP server that an AI client connects to with the user's own sign-in, so the model sees what the user may see | Yardi's Virtuoso Connector, on Anthropic's marketplace since February 2026; RealPage's Lumina Connect, "user permissioned and authenticated" |

Two more paths sit beside them: **nightly files** and **data shares** (Data Out, below). A third-party integrator notes that with the large suites "many integrations end up as CSV or XML files dropped on an SFTP server overnight," and RealPage's Registered Vendor track says some integrations "require configuration of an SFTP process."

### Licensed interfaces

The licensed-interface model splits the system of record into business areas: one third-party catalog lists Yardi interfaces for resident transactions (`ItfResidentTransactions20`), common data (`ItfCommonData`), service requests, vendor invoices and job cost, plus a commercial data interface "built on the OSCRE standard" and a SOAP API for self storage. The same integrator's sample SOAP header carries the interface user name and password, server, database, platform, interface entity and interface license in every call. The consequences for anyone building to this model are commercial before they're technical: a product that needs residents, common data and payables needs three licenses under three agreements, and the per-interface fee is paid whether the integration serves one property or a thousand. The integrator also observes that "neither Yardi nor RealPage have ubiquitous outbound webhooks for every meaningful event," so integrations poll on schedules and reconcile.

The history is part of the model. The interface programs have been litigated: Yardi's 2013 suit against Property Solutions (now Entrata) alleged it built interfaces outside the standard program, and Entrata's monopolization suit against Yardi settled in 2019 ([Capital and Consolidation, as of October 2026](/books/property-tech/software-landscape#capital-and-consolidation-as-of-october-2026)). Access terms are a competitive lever, and a platform that designs its own program is deciding how it will be read by customers, partners and, eventually, a court.

### Partner programs and the client sponsor

Entrata's program has API, strategic (reselling, referral, affiliate) and consulting tracks, with "sandbox environments and API documentation" and "webhooks" among API partner benefits, and access tiers that aren't published. Third-party connector documentation shows the request shape: "All requests are `POST` requests," authenticated with the Entrata account's credentials, with a body naming the method; another integrator's documentation shows a base URL at `apis.entrata.com` with API key authentication, and says Entrata's limits "are calculated using the leaky bucket algorithm," answered with HTTP 429.

The **client sponsor** is the distinctive step. A partner gets access because an operator vouches for it, which ties the platform's ecosystem to its customers' demand and gives the operator a voice in which vendors reach its data. My rule for a platform that runs a sponsor model: record the sponsor, the agreement and the scope per partner, and treat every additional operator that turns the partner on as its own consent, not an extension of the sponsor's.

### The consent handshake

RealPage's published technical specification for its Registered Vendor upgrade is the most detailed public description of a per-client consent flow:

- **Keys come from the program.** "API Keys will be issued by the RealPage Exchange team, upon registering through the RealPage Developer Portal," and the key in the HTTP header replaces the old per-user credentials; each SOAP call names the management company (`PmcID`) and site (`SiteID`).
- **Testing is on a copy of client data.** A vendor tests against a clone of a client's data, and "Clones are available for two weeks at a time."
- **The client decides, per site.** The vendor accepts the terms for each approved client, then the client is prompted "to Accept or Deny the new integration through the Integration Marketplace." Until then integrations "remain in a Pending state, which means you will not have access to the client data," and "If no action is taken within 30 days, the site(s) pending acceptance will be canceled."

That is the right shape for any platform: **consent is per operator and per property, expires if unanswered, and is a record the operator can see and revoke.** It also answers the audit question in [The Software Landscape](/books/property-tech/software-landscape#auditing): which third party the operator authorized to read which data, under which program, and when it was revoked.

### Plan-tier APIs

The small-portfolio platforms sell the API to the customer. Buildium's developer documentation says "To take advantage of the Buildium Open API you must have a Premium Subscription," that a client ID and secret "must be passed in every request header" as `x-buildium-client-id` and `x-buildium-client-secret`, created by an administrator in the product's Developer Tools, and that it limits clients "to 10 concurrent requests per second," returning 429 with a suggested retry after about 200 milliseconds. Rent Manager's web API follows "RESTful principles," issues a token at sign-in, and invalidates it when "the pertinent information about the user changes, such as permissions or password." AppFolio's Database API is read-only on Plus and read and write on Max; for its Stack marketplace, a third-party integrator describes an application, a review, "a security compliance questionnaire," terms and a build with AppFolio's team, and reports a cost of "$25,000–$50,000 annually, plus potential revenue share" (a third party's figure, not AppFolio's).

The design point is that the customer owns the key. Customer-created keys need everything in [API Keys](/docs/api-design/authentication#api-keys): prefixes, hashing, scopes and rotation, with the key bound to a service user whose grants say which properties it reaches, so a key created by one regional administrator can't read another region's owners.

### AI connectors and MCP

The newest model lets the customer's own AI client read the system of record. The Model Context Protocol's authorization is "based on established specifications," starting with the OAuth 2.1 draft, and the two public property examples both put the user's permissions at the center: Yardi's connector "authenticates through Yardi, so data access automatically follows existing user permissions," and RealPage says Lumina Connect "is user permissioned and authenticated," initially working with OpenAI's tools with "support for Claude and Microsoft Copilot planned soon."

What property adds to [Agents, Tools and MCP](/docs/security/ai-security#agents-tools-and-mcp):

- **The user's scope is the ceiling.** A regional manager's AI client sees the regional manager's properties; an owner's sees the owner's. Tools resolve the caller's property set exactly as the UI does, through the same policy layer.
- **Restricted stores stay out by default.** Screening reports, VAWA files, accommodation records and demographic data are not exposed as tools to general-purpose AI clients, whatever the user's role, because a model's context window is a copy the operator doesn't control.
- **Reads first, writes as commands.** A connector that only reads is a reporting channel; one that writes needs the same commands, validations, approval limits and audit records as any other client, plus the identity of the model client in the record ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)).
- **Rate and cost by user.** An AI client can issue more queries in a minute than a person does in a day; limits key on the user and the tenant, and expensive tools (portfolio-wide reports) get their own budgets ([What to Key On](/docs/requests/rate-limiting#what-to-key-on)).

### The headless front office

The integration model is also a product strategy. In October 2026 RealPage and Funnel announced that RealPage's screening, payments, pricing and availability "serve as the source of truth in Funnel's application workflow," where Funnel describes itself as "Multifamily's first AI front-office-only platform." That is a **headless front office**: a third party owns the prospect and resident conversation, the website, the CRM and the leasing workflow, while the suite stays the system of record and keeps the money rails (screening, payments, the lease and the ledger).

For a platform, supporting it means the front-office domain has to be fully available as commands, not just reads: create and merge guest cards, schedule tours with access grants, take applications and fees, request a screening decision, quote a price with its expiry, generate and sign a lease, and take the first payment, each with the same rules, holds and records as the suite's own front office ([Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours), [Applications & Screening](/books/property-tech/applications-and-screening), [The Lease](/books/property-tech/the-lease)). The suite still owns the regulated decisions: the screening company is the consumer reporting agency, the payment provider is the one holding the money, and the lease is signed against the suite's templates. My rule: a front office over someone else's ledger never keeps its own copy of the lease or the balance; it reads them, and it writes through commands that the system of record can refuse.

## APIs, Webhooks and Events

Whatever the commercial model, the technical surface follows the playbook: resource-oriented REST for partners ([REST: The Default for Anyone You Don't Control](/docs/api-design/api-styles#rest-the-default-for-anyone-you-don-t-control)), OAuth for apps installed by an operator ([OAuth 2.0 for Delegated Access](/docs/api-design/authentication#oauth-2-0-for-delegated-access)), limits on every response ([Headers](/docs/requests/rate-limiting#headers)), bulk endpoints and jobs for loads ([Bulk Operations](/docs/requests/bulk-operations)) and deliberate versions ([Versioning & Deprecation](/docs/api-design/versioning)). Property adds four things:

- **Key limits on the integration and the tenant together,** and give month-end its own budget. Rent posts on the first, payments peak in the first five days, owner statements close by the tenth: every tenant's busiest days are the same days.
- **Scope every token to properties.** An integration installed for twelve properties sees twelve. The consent handshake above produces the property list; the token's grants are derived from it.
- **Emit life-cycle events through an outbox.** The core events (`lease.signed`, `lease.moved_in`, `lease.notice_given`, `lease.moved_out`, `charge.posted`, `payment.applied`, `work_order.completed`) and each chapter's own (`guest_card.leased`, `tour_access.revoked`, `renewal_offer.sent`) are written in the transaction that changed the record and delivered by a relay, with the property, its business date and the actor ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). Partners subscribe per integration and receive only events for properties they're consented to.
- **Offer a changes feed beside push.** Integrators of the large suites poll because outbound webhooks aren't universal; a platform that offers webhooks should still offer a cursor-based feed of changes per resource, which is how a partner catches up after its own outage and how a nightly file is replaced ([Replay](/docs/api-design/webhooks#replay)).

## Offline Inspection and Technician Apps

Inspections and maintenance happen in basements, boiler rooms and garages. RealPage's maintenance product lets technicians perform inspections "with offline functionality and auto-sync capabilities," and HappyCo's inspections "capture offline and sync automatically when a connection is available." The device mechanics (a scoped local store, commands rather than diffs, an outbox per device, attachments on their own lane, two clocks) are in [Offline-First Sync](/docs/architecture/offline-sync), and the field rules for who wins a conflict are in [Conflicts in Field Work](/books/field-operations/technician-app#conflicts-in-field-work). The property-specific choices:

- **Scope the local store to the day's assignments.** A technician's device holds the units and work orders assigned to them, the unit's access instructions for the work window, and the inspection templates, never the property's resident ledger or screening data. A lost phone is a revocation event.
- **Inspection evidence is sealed on the device.** Photos and ratings are hashed when captured, with device time, and the server records arrival time; a move-out inspection is deposit evidence, so the record shows both clocks ([Capturing the record](/books/property-tech/move-in-and-move-out#capturing-the-record)).
- **Money and legal steps stay online.** A chargeback to a resident, an entry notice, a deposit deduction and a lease change are proposed offline and decided on the server, because each calls the rules engine with the facts as of the moment it's decided.
- **Keyless access is offline too.** Offline-capable locks learn revocations late ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)); a vendor's credential for a work window should expire on the lock by itself, not depend on a sync.

## Extensibility

Every operator tracks something the core doesn't. Custom fields land mostly on properties, units, leases, guest cards and work orders, and the design (definitions, validation, indexing, and values that reach the API, exports, webhooks and the audit trail) is in [Custom Fields](/docs/architecture/custom-fields). Two property cautions:

- **A custom field can become a protected-class field.** A free-text "notes about household" field or a "preferred language" field used in screening or pricing is a fair housing record. Field definitions carry a purpose, and fields that may hold protected or sensitive data are excluded from screening, pricing and targeting features by the same allowlist [Fair Housing](/books/property-tech/fair-housing#how-to-build-it) describes.
- **A custom field can become a charge.** A field like "pet weight" that drives a fee belongs in the charge catalog, where it's disclosed and capped ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)); fields don't post money.

Workflows and agents built by operators (rules that run on events, no-code agents from SOPs) are configuration with versions and owners, covered in [Marketplaces and Builders](/books/property-tech/ai-in-property-management#marketplaces-and-builders).

## Data Out

Operators and owners want their data in their own warehouse, and the suites now sell that path. Entrata's BI product lets customers "access your data through Snowflake," and its 2023 announcement says Data Share "gives any user the assurance of quality data regardless of the BI tool they use." RealPage's Lumina Connect "provides zero-copy access to authorized Realpage data" from "Snowflake, Databricks, Microsoft Fabric, or Google Cloud Platform," with "BI tools such as Power BI" on top. Rent Manager's Open Access offers read-only database views, and the plan-tier APIs are the other route.

The pipeline engineering (analytics off production, change data capture, transformations as code, data contracts, freshness) is in [Data Pipelines & Analytics](/docs/architecture/data-pipelines). What a property platform adds:

- **Shares are scoped like users.** A share for an institutional owner contains that owner's properties and entities only, resolved by date exactly as the owner's portal is; a share for the manager's corporate BI contains its tenant. A share is an integration with a consent record, not a database export.
- **Restricted data stays out of shares by default.** Screening reports, VAWA files, accommodation records, demographic data, bank account numbers and investor tax ids are excluded or tokenized unless a share's purpose requires them and its agreement says so ([Privacy and Retention](/docs/architecture/data-pipelines#privacy-and-retention)).
- **Ship definitions with the data.** Occupancy, trade-out and delinquency computed differently in the customer's warehouse and the platform's reports is the most common complaint about data shares. Publish the governed metric definitions and their versions with the share ([Operating Metrics](/books/property-tech/operating-metrics#why-the-same-metric-disagrees)).
- **Shares carry the platform's legal constraints.** A share that combines several operators' nonpublic data, or that feeds a pricing tool, is an information exchange question, not a BI question ([Inputs: Own, Public and Pooled Data](/books/property-tech/revenue-management#inputs-own-public-and-pooled-data)).

## How to Build It

This chapter extends `tenants` and `portfolios` from [The Core Data Model](/books/property-tech/property-business#the-core-data-model) with identities, users, roles and grants, the property access every row-level policy checks, configuration, integrations and their consents, credentials, event subscriptions and data shares.

One naming convention for actors holds across the book, and every such column references `users (id)`:

- **`<verb>_by`** records who did something: `approved_by`, `decided_by`, `verified_by`, `posted_by`, `set_by`, `inspected_by`. Jobs, integrations and AI agents act as `service` and `ai_agent` users, so a scheduled run or a model is a user here too, never a text label like `'system'`; the model's version goes in its own column or in the AI audit trail ([Governance and the AI Audit Trail](/books/property-tech/ai-in-property-management#governance-and-the-ai-audit-trail)).
- **`<role>_user_id`** names the user who holds a role on a record rather than performing one act: `assigned_user_id`, `agent_user_id`, `holder_user_id`, `signer_user_id`, and `actor_user_id` on history tables.
- **`<verb>_by_person_id`** references `people (id)` where the actor can be a resident or household member with no login, such as `requested_by_person_id` on an accommodation request.
- **A `_by` column typed `TEXT`** names an outside party who is not a user (the surveyor in `measured_by`, the reserve study preparer, the inspector of elections), or a method chosen from a `CHECK` list (`charged_by`, `remitted_by`); neither is an actor reference.

Likewise, every jurisdiction rule a record depends on is referenced through `rule_evaluation_id REFERENCES rule_evaluations (id)` ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it)).

```sql
CREATE TABLE identities (                -- a login; platform-wide, no tenant
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer         TEXT NOT NULL,          -- the IdP, or the platform's own
  subject        TEXT NOT NULL,
  email          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (issuer, subject)
);

CREATE TABLE users (                     -- an identity's membership in one tenant
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL REFERENCES tenants (id),
  identity_id     UUID REFERENCES identities (id),     -- null for service and agent users
  actor_type      TEXT NOT NULL CHECK (actor_type IN ('human', 'service', 'ai_agent')),
  person_id       UUID REFERENCES people (id),         -- residents, guarantors, board members,
                                                       -- representatives
  vendor_id       UUID REFERENCES vendors (id),        -- vendor staff
  display_name    TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('invited', 'active', 'suspended',
                    'deactivated')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, identity_id),
  CHECK ((actor_type = 'human') = (identity_id IS NOT NULL))
);

CREATE TABLE roles (                     -- what kind of thing a grant allows
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID REFERENCES tenants (id),            -- null: a platform template
  key          TEXT NOT NULL,                           -- 'property_manager', 'ap_clerk'
  audience     TEXT NOT NULL CHECK (audience IN ('staff', 'owner', 'investor', 'board',
                 'resident', 'guarantor', 'representative', 'vendor', 'service', 'ai_agent')),
  permissions  TEXT[] NOT NULL,                         -- 'invoices.approve', 'leases.read'
  version      INT NOT NULL,
  UNIQUE NULLS NOT DISTINCT (tenant_id, key, version)
);

CREATE TABLE grants (                    -- explicit access: a role at a node, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  user_id         UUID NOT NULL REFERENCES users (id),
  role_id         UUID NOT NULL REFERENCES roles (id),
  scope_type      TEXT NOT NULL CHECK (scope_type IN ('tenant', 'portfolio', 'property',
                    'legal_entity', 'integration')),
  scope_id        UUID NOT NULL,
  approval_limit  BIGINT,                               -- minor units, for approve permissions
  currency        CHAR(3),
  valid_during    TSTZRANGE NOT NULL,
  granted_by      UUID NOT NULL REFERENCES users (id),
  reason          TEXT NOT NULL,
  revoked_by      UUID REFERENCES users (id),
  CHECK (granted_by <> user_id)
);

-- Derived access: relationships the domain already records, never copied into grants.
CREATE VIEW derived_access AS
  SELECT u.tenant_id, u.id AS user_id, 'resident' AS audience,
         'lease' AS scope_type, lm.lease_id AS scope_id, lm.valid_during
  FROM users u JOIN lease_members lm ON lm.person_id = u.person_id
  WHERE lm.role IN ('leaseholder', 'occupant')
  UNION ALL
  SELECT u.tenant_id, u.id, 'guarantor', 'lease', lm.lease_id, lm.valid_during
  FROM users u JOIN lease_members lm ON lm.person_id = u.person_id
  WHERE lm.role = 'guarantor'
  UNION ALL
  SELECT u.tenant_id, u.id, 'board', 'property', ar.property_id, ar.valid_during
  FROM users u JOIN association_roles ar ON ar.person_id = u.person_id
  WHERE ar.body = 'board'
  UNION ALL
  SELECT u.tenant_id, u.id, 'representative', 'person', rr.resident_id, rr.valid_during
  FROM users u JOIN resident_representatives rr ON rr.representative_id = u.person_id
  WHERE rr.verified_at IS NOT NULL;
  -- vendor access derives from work order and purchase order assignment the same way

CREATE TABLE user_property_access (      -- resolved grants; what row-level security reads
  tenant_id    UUID NOT NULL,
  user_id      UUID NOT NULL REFERENCES users (id),
  property_id  UUID NOT NULL REFERENCES properties (id),
  permission   TEXT NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  source_grant_id UUID REFERENCES grants (id),          -- null when derived
  PRIMARY KEY (user_id, property_id, permission, valid_during)
);
```

`user_property_access` is rebuilt for a user when their grants change, and for everyone affected when a portfolio moves, a property changes owner (`ownership_shares`, `properties.owner_entity_id`) or a relationship's dates change. A policy on a property-scoped table then checks one indexed row:

```sql
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_property_scope ON work_orders
  USING (
    tenant_id = current_setting('app.tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM user_property_access a
      WHERE a.user_id = current_setting('app.user_id')::uuid
        AND a.property_id = work_orders.property_id
        AND a.permission = 'work_orders.read'
        AND a.valid_during @> NOW()
    )
  );
```

Lease-scoped users (residents, guarantors) and work-order-scoped users (vendors) get their own policies over `derived_access`; restricted stores have policies that never consult role grants alone.

Configuration, integrations and data out:

```sql
CREATE TABLE setting_definitions (       -- platform-wide registry
  key            TEXT PRIMARY KEY,       -- 'late_fees.grace_days_policy'
  value_type     TEXT NOT NULL,
  default_value  JSONB,
  settable_at    TEXT[] NOT NULL,        -- 'tenant', 'portfolio', 'property'
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  rule_type      TEXT                    -- set when a law bounds it; values checked against
                                         -- the rules engine, never above the legal limit
);

CREATE TABLE setting_values (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  key           TEXT NOT NULL REFERENCES setting_definitions (key),
  node_type     TEXT NOT NULL CHECK (node_type IN ('tenant', 'portfolio', 'property')),
  node_id       UUID NOT NULL,
  value         JSONB NOT NULL,
  valid_during  DATERANGE NOT NULL,
  set_by        UUID NOT NULL REFERENCES users (id),
  EXCLUDE USING GIST (tenant_id WITH =, key WITH =, node_id WITH =, valid_during WITH &&)
);

CREATE TABLE integration_partners (      -- platform-wide: who the program has admitted
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,
  track               TEXT NOT NULL CHECK (track IN ('certified', 'registered', 'reseller',
                        'consulting', 'customer_built')),
  security_review_on  DATE,
  certified_on        DATE,
  agreement_ref       TEXT
);

CREATE TABLE integrations (              -- one partner's access to one tenant
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  partner_id       UUID NOT NULL REFERENCES integration_partners (id),
  model            TEXT NOT NULL CHECK (model IN ('licensed_interface', 'partner_api',
                     'marketplace_app', 'customer_api', 'file_feed', 'data_share',
                     'ai_connector')),
  service_user_id  UUID NOT NULL REFERENCES users (id),
  scopes           TEXT[] NOT NULL,      -- 'leases.read', 'payments.write'
  sponsor_user_id  UUID REFERENCES users (id),   -- the operator user who vouched or installed
  agreement_ref    TEXT NOT NULL,
  fee_terms        JSONB,                -- per interface, per unit, per transaction
  status           TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended',
                     'revoked')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at       TIMESTAMPTZ,
  revoked_by       UUID REFERENCES users (id)
);

CREATE TABLE integration_properties (    -- the per-property consent handshake
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  property_id      UUID NOT NULL REFERENCES properties (id),
  status           TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'denied',
                     'expired', 'revoked')),
  requested_at     TIMESTAMPTZ NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,  -- unanswered requests lapse
  decided_by       UUID REFERENCES users (id),
  decided_at       TIMESTAMPTZ,
  UNIQUE (integration_id, property_id)
);

CREATE TABLE api_credentials (           -- keys and client secrets, never stored in clear
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  prefix           TEXT NOT NULL,         -- shown in the UI and logs
  secret_hash      BYTEA NOT NULL,
  created_by       UUID NOT NULL REFERENCES users (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ
);

CREATE TABLE event_subscriptions (       -- webhooks per integration
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  event_types      TEXT[] NOT NULL,       -- 'lease.signed', 'payment.applied'
  url              TEXT NOT NULL,
  secret_ref       TEXT NOT NULL,         -- in the secrets manager
  status           TEXT NOT NULL CHECK (status IN ('active', 'failing', 'disabled'))
);

CREATE TABLE data_shares (               -- a warehouse share is an integration with a scope
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  target           TEXT NOT NULL,         -- 'snowflake', 'databricks', 'fabric', 'bigquery'
  scope_type       TEXT NOT NULL CHECK (scope_type IN ('tenant', 'portfolio',
                     'legal_entity')),
  scope_id         UUID NOT NULL,
  dataset_version  TEXT NOT NULL,         -- the published schema and metric definitions
  excluded_classes TEXT[] NOT NULL,       -- 'screening', 'vawa', 'demographic', 'bank_account'
  last_refreshed_at TIMESTAMPTZ
);
```

Design decisions behind it:

- **Identity is global; users are per tenant.** One login can belong to several tenants, and every authorization question is asked inside one of them, so a vendor serving two managers never sees one manager's data from the other's session.
- **Explicit grants are for staff, owners, investors, integrations and agents; everything else derives.** The derived view reads lease members, board roles, representatives and assignments directly, so access ends on the relationship's end date without a cleanup job.
- **Scope types follow the two trees.** A `portfolio` grant walks the operator's tree; a `legal_entity` grant walks ownership to properties by date. Both land in `user_property_access`, which is the only thing policies read.
- **Grants carry approval limits** where a permission approves money, and a grantor can't grant to themselves; every grant has a reason, which is what an owner's auditor asks for.
- **Integrations are users with consent.** Each integration acts as a service user whose property access comes from accepted `integration_properties` rows; revoking the integration or one property's consent removes access at once, and a pending request that nobody answers expires.
- **Settings that a law bounds name the rule type,** and values are validated against the rules engine for every property they would apply to, so a tenant-wide late fee setting can't exceed one state's cap silently.
- **Shares publish a dataset version** with the schema and the metric definitions, and list the data classes they exclude.

## Auditing

The platform-level records owners, residents, partners, auditors and regulators ask for:

- **Who could see what, when.** Grants with their grantor and reason, revocations, the resolved property access as of any date, and derived access from lease membership and board seats. "Did the former roommate still have portal access in March" and "could the departing regional manager still approve invoices" are both questions about past dates.
- **Who did what, as whom.** Every write with its actor type (staff, owner, resident, vendor, service, AI agent), the user an agent or support session acted for, the channel (web, app, API, offline device, file feed, AI connector) and both times for offline work ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Reads of restricted data.** Access to screening reports, VAWA documentation, accommodation records, investor data and resident records in shares or AI connectors, logged as reads ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Integration consents and data leaving.** Each partner's agreement, scopes, property consents with who accepted and when, credentials issued and revoked, event deliveries, and each data share's scope and refreshes.
- **Configuration history.** Every setting value with who set it and when it applied, so a fee or a notice period on a past date can be explained.

## What This Means for the System You Build

- **Make the management company the tenant,** with the operator's portfolio tree and the owner's entity tree crossing at the property.
- **Keep one global identity and a user per tenant,** and never let one tenant's session see another's data.
- **Derive resident, guarantor, board, representative and vendor access** from the domain's own relationships; use explicit grants for staff, owners, investors, integrations and agents.
- **Resolve every grant to properties on a date** and enforce it in the database, with restricted stores behind their own permissions.
- **Post everything through one entity-dimensioned ledger** and call one rules service, storing each evaluation on the record it shaped.
- **Choose your integration models deliberately,** and record per integration the agreement, scopes, fees and per-property consent, with unanswered consents expiring.
- **Treat AI connectors as users,** capped by the caller's own scope, reads first, restricted stores excluded.
- **Support a headless front office** with commands for the whole leasing flow, while the system of record keeps the lease, the ledger and the regulated rails.
- **Emit events through an outbox** and offer a changes feed beside webhooks, scoped to consented properties.
- **Scope offline devices to the day's work** and keep money and legal decisions on the server.
- **Ship data out as scoped shares** with versioned metric definitions and restricted data excluded.

## References

**Specifications**

- [Model Context Protocol: Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), authorization based on the OAuth 2.1 draft and related specifications

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), one operating system with "one login, one database"

**Platforms and programs**

- [Entrata](https://www.entrata.com/), configuration "at the site or corporate level with over 3,000 settings"
- [Entrata: API documentation](https://docs.entrata.com/api/v1/documentation), API use requires an agreement with Entrata
- [Entrata: Partners](https://entrata.com/partners), API, strategic and consulting tracks, sandbox, webhooks and the client sponsor
- [Entrata: Business Intelligence](https://www.entrata.com/products/business-intelligence), data access through Snowflake
- [Entrata: Entrata launches Business Intelligence and Data Share products](https://www.entrata.com/press/entrata-launches-business-intelligence-and-data-share-products), Data Share for any BI tool (November 1, 2023)
- [RealPage: Online Data Exchange vendor upgrade technical specifications (PDF)](https://www.realpage.com/lp/online-data-exchange-migration/assets/Registered_Vendor_Technical_Specifications.pdf), API keys issued by the RealPage Exchange team, PmcID and SiteID, two-week clones, per-client terms, accept or deny, pending state and 30-day cancellation
- [RealPage: Lumina Connect](https://www.realpage.com/solutions/lumina-connect/), zero-copy access from data platforms, BI tools, an MCP connector, user permissioned and authenticated
- [RealPage: RealPage and Funnel announce partnership](https://www.realpage.com/news/realpage-and-funnel-announce-partnership/), RealPage capabilities as the source of truth in Funnel's application workflow (October 13, 2026)
- [Funnel](https://www.funnelleasing.com/), a "front-office-only platform" integrating with the operator's PMS
- [RealPage: Maintenance management](https://www.realpage.com/property-management-software/maintenance-management/), inspections with offline functionality and auto-sync
- [Buildium: Developer portal](https://developer.buildium.com/), Open API on Premium, client ID and secret headers, keys created in Developer Tools, 10 concurrent requests per second and 429 retries
- [Buildium: Pricing](https://www.buildium.com/pricing/), Open API on the Premium plan
- [Rent Manager: Software customization](https://www.rentmanager.com/software-customization/), read and write API, read-only Open Access views and the Integrations Program
- [Rent Manager: Technical documentation (PDF)](https://info.rentmanager.com/hubfs/PDFs/Technical%20Documentation.pdf), a RESTful web API, token authentication and invalidation on permission changes
- [MRI Software: Become a partner](https://www.mrisoftware.com/become-a-partner/), solution partners that integrate with MRI products
- [HappyCo: Best mobile inspection app](https://happy.co/comparisons/best-mobile-inspection-app), offline capture and automatic sync
- [Claude: Yardi Virtuoso connector](https://claude.com/marketplace/connectors/yardi-virtuoso), the marketplace listing added February 2026
- [Mann Report: Yardi brings Yardi Matrix data to Claude](https://www.mannpublications.com/mannreport/2026/06/17/yardi-brings-yardi-matrix-data-to-claude/), the Virtuoso Connector authenticating through Yardi so access follows user permissions (June 17, 2026)

**Third-party integrator descriptions**

- [Truto: Integrating with Yardi and RealPage](https://truto.one/blog/overcoming-legacy-api-constraints-when-integrating-with-yardi-and-realpage/), Yardi's per-interface license fee, agreement and eligibility, the SOAP header, overnight SFTP files, no ubiquitous webhooks, and RealPage's two tracks (May 8, 2026)
- [APIs.io: Yardi](https://apis.io/providers/yardi), Voyager interfaces by business area, the OSCRE-based commercial data interface, the self-storage SOAP API and the Virtuoso MCP server with OAuth 2.1
- [Propexo: RealPage important notes](https://docs.propexo.com/pms-guidance/real-page/important-notes), Registered Vendor free to vendors with limited APIs and SFTP, App Partner with stricter approval
- [Propexo: AppFolio integration and partnership](https://docs.propexo.com/pms-guidance/appfolio/integration-and-partnership), the Stack process, security questionnaire, reported cost, and Database API on Plus and Max
- [Tray.ai: Entrata connector](https://tray.ai/documentation/connectors/service/entrata), POST requests with the method in the body and account credentials
- [DataGrail: Entrata integration](https://docs.datagrail.io/docs/integrations/api-documentation/entrata), the apis.entrata.com gateway, API keys, leaky-bucket limits and 429 handling
