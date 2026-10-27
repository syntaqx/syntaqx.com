+++
title = "Community Associations"
description = "HOAs, condos and co-ops: owners' accounts, assessments, liens, reserves, violations, architectural review, votes, resale certificates and state acts."
category = "Property Tech Industry"
order = 1728
part = "Other Property Types"
tags = ["property-tech", "community-associations", "hoa", "condominium", "cooperative", "data-model"]
+++

A community association is a property whose residents own it. The homeowners association in a subdivision, the condominium association in a tower, and the cooperative corporation that owns an apartment building are all governed by the people who live there (or who own there and rent to someone else), through a board they elect, under recorded documents and a state statute written for exactly this arrangement. The association collects money from every owner to maintain what they share, saves for the roof that will fail in twenty years, enforces rules about paint colors and parked boats, holds elections, and tells buyers and their lenders what a unit owes before it changes hands. Most associations hire a management company to do that work, and that company is the operator this volume calls the tenant.

The model is the multifamily core turned inside out. There is no landlord and no lease: the person who pays is an owner, the client is the association, and the money is an **assessment** set by a budget the board adopts, allocated across units by a formula fixed in the declaration, rather than a rent negotiated per unit. Owners don't move in and out on a term; title passes at a closing, and the system has to say on that day exactly what the unit owes. Collections end in a lien and, within statutory limits, a foreclosure, not an eviction. And the rules people break are the community's own covenants, enforced through notice and a hearing before the board can fine anyone. The [opening chapter](/books/property-tech/property-business#the-core-data-model) warned that a model with residents hanging off leases can't hold "an association owner who pays assessments and signs no lease." This chapter adds that owner, and the ledger, governance and disclosure records around them.

## How the Platforms Do It

Association management is sold three ways: by association specialists, by multi-segment suites with an association edition, and by point products for payments, resale documents, insurance and voting that plug into either. As of October 2026, the public pages show:

| Vendor | What the public pages show for associations |
| --- | --- |
| **Vantaca** | A community management platform for management companies, sold with managed accounting, implementation and account management services; a resident product with ARC voting, documents, invoice approval and bank balances for board members; a vendor product with automated payments; "fee and admin billing attached to every action"; and HOAi, agents for community onboarding, board packets, month-end financials, assessments receivable and invoice coding |
| **AppFolio** (association edition) | Mobile violation logging with letters and history, architectural requests "electronically routed to the architectural review committee for approval," portals for homeowners and board members, online payments, an association calendar, maintenance requests and board member tracking |
| **Buildium** | Violations in every plan, "architectural requests with committee voting," board and committee management, a Resident Center, online payments with per-plan fees, association bank sync, and "resale documentation, powered by HomeWiseDocs" |
| **Yardi Breeze Premier** (associations) | Owner and board member tracking, violations, fees and special assessments, delinquency and fee schedules, owner maintenance requests with automatic charges for work done, ACH and card payments, escrow and trust accounts, budgets, job cost and 1099 e-filing, from $1 per unit per month with a $400 monthly minimum |
| **RealPage** (community associations) | Loft Payments by ClickPay for dues by ACH, card, paper check and online; HomeWiseDocs for resale documents and disclosures; CommunityCoverage for association insurance with policy tracking and renewal reminders |
| **CINC Systems** | Management and accounting, 38 direct bank integrations, CINC Connect for boards and residents with payments, and AI "skills" for architectural requests, board packets, invoices, budgets and email triage |
| **FRONTSTEPS** | Caliber for accounting and budgets, online assessment payments through a PCI DSS compliant processor, community apps for managers, boards and homeowners, and Dwelling for visitor management at gated communities |
| **Rent Manager** | Violations tied to CC&R compliance, architectural modification requests submitted through the homeowner portal and approved or denied by board members, and online voting |
| **MRI Software** | HOA, condo and co-op solutions: collections and delinquencies, e-payments for maintenance fees, and "integrated solutions for board communications, vote administration and association documents," with sites in Canada, the UK and Australia |

What the pages leave out is as telling. Yardi Breeze's associations page lists no architectural requests, voting, board portal, reserves or resale certificates; Vantaca's pages name neither violations nor resale; MRI's page names no violations, architectural review or reserves. Absence from a marketing page isn't absence from the product, but it marks which workflows each vendor leads with. Three patterns run across all of them:

- **Payments, resale documents and insurance are their own businesses.** RealPage sells all three as separate products and owns Buildium, which sells association accounting ([the landscape chapter](/books/property-tech/software-landscape#the-major-platforms) covers the ownership), and Buildium's own resale documents come from HomeWiseDocs. An association platform integrates with these as often as it builds them.
- **The board is a user, not just a report recipient.** Every vendor that describes a board experience gives board members approvals (invoices, architectural requests) and financial visibility, so board members need scoped grants like owner users in [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies), and their approvals become records.
- **The manager bills the association per action.** Vantaca's "fee and admin billing attached to every action" names what association management contracts do: a fee for a violation letter, a resale package, a collection step. Those fees are revenue for the management company and charges to either the association or the owner, and the system has to know which. The segment's specialists sit in [Specialists by Segment](/books/property-tech/software-landscape#specialists-by-segment).

## HOA, Condominium and Co-op

The Uniform Common Interest Ownership Act (UCIOA), the model act many states adopted in some form, sorts every "common interest community" into three kinds by who owns what. West Virginia's enactment defines them this way:

| | Condominium | Cooperative | Planned community (HOA) |
| --- | --- | --- | --- |
| **What the owner holds** | Title to a unit, plus an **undivided interest** in the common elements | Shares or membership in the association, plus a **proprietary lease** giving exclusive possession of a unit | Title to a lot or home |
| **Who owns the common property** | All the unit owners together, as tenants in common through their undivided interests | The association, which owns the whole real estate | The association, which owns or leases the common areas |
| **What the unit is** | The space inside boundaries the declaration describes, often by floors and ceilings | The right to possess a unit under the proprietary lease | Usually land with whatever is built on it |
| **Typical document** | Declaration (or master deed) and plats and plans | Articles, bylaws, proprietary lease (and any ground lease) | Declaration of covenants, conditions and restrictions (CC&Rs) |
| **What transfers at sale** | The deed to the unit | The shares and an assignment of the proprietary lease | The deed to the lot |

UCIOA calls a planned community simply "a common interest community that is not a condominium or a cooperative," which is how practitioners use HOA too. Florida keeps separate statutes for each: Chapter 718 for condominiums, 719 for cooperatives, and 720 for homeowners' associations, where Chapter 719 defines a cooperative as ownership "wherein legal title is vested in a corporation or other entity" and the owner's interest as "the shares or other evidence of ownership in a cooperative" together with the lease.

The forms differ in ways the software has to carry:

- **Allocated interests.** Each unit carries numbers fixed by the declaration: its share of the common expenses, its votes, and in a condominium its undivided interest. They may be equal, by square footage, by original price or by a formula, and they change only by amendment. Assessments are computed from them, so they are reference data with history, never a field someone edits.
- **What the association insures and maintains.** A condominium or co-op association insures the building, including the units' structure; an HOA usually insures only its common areas and leaves each house to its owner. That decides what a master policy covers and what a reserve study counts.
- **Transfers.** A co-op's buyer typically needs the board's consent under the proprietary lease and bylaws, and a co-op building often carries a blanket mortgage the owners pay down through their carrying charges. Condos and HOAs can carry a right of first refusal or other restraint on transfer, which UCIOA's resale certificate must disclose and Florida's estoppel certificate must answer yes or no. A co-op purchase therefore has an approval workflow (application, financials, interview, board decision) that a condo sale usually doesn't.
- **Mixed and layered communities.** A condominium can sit inside a master HOA, with owners paying both; a mixed-use tower can have residential and commercial condominium units under one declaration. The master and sub-associations are separate legal entities with separate ledgers, and Florida's estoppel certificate asks for a list of every other association the parcel belongs to.

## The Association, the Manager and the Owner

The association is a legal entity, usually a nonprofit corporation, that owns or administers the common property and acts through its board. It is the client: the management company signs a management agreement with the association, takes direction from its board, and runs the association's bank accounts and books as its agent. The owners are **members**: they elect the board, vote on what the documents reserve to them, pay assessments, and owe compliance with the covenants. They don't sign anything with the manager, and the manager's duties run to the association, not to any one owner.

In the core data model that maps cleanly:

- The **association** is a `legal_entities` row with role `association`, and the community is a `properties` row with `property_type = 'association'` whose `owner_entity_id` is that entity. In a condominium the owners hold the common elements, but the association is still the party that contracts, banks, sues and files taxes, which is what `owner_entity_id` means here.
- The **management company** is the tenant. A self-managed association that buys software directly is a tenant of its own.
- The **lot, home or condo unit** is a `units` row (`kind = 'dwelling'` or `'lot'`), and occupancy stays a query, but over title rather than leases.
- The **owner** is a person or a legal entity (an LLC that owns a rental condo, a trust, an investor holding hundreds of homes), and their relationship to the unit is an **ownership account**: the ledger and membership for one owner, or set of co-owners, of one unit for as long as they hold title. When the unit sells, that account closes and a new one opens for the buyer, the way a renewal is a new lease. An owner who rents their unit out has a tenant the association doesn't contract with, but the association still needs to know who lives there, because rules bind occupants and fines for a tenant's violation land on the owner's account.

Association money is held in trust for the association, never commingled with the manager's money or other associations' money, and most associations keep at least an operating account and a reserve account. Trust Accounting & the General Ledger owns the bank-account model; what's particular here is that the reserve account is restricted by statute and by the board's funding plan, and transfers out of it are governance events.

## Assessments

An assessment is the owner's share of what it costs to run the community. The board adopts an annual budget; the budget's total, split by each unit's common expense allocation, becomes each unit's regular assessment, usually billed monthly or quarterly. UCIOA's assessment section (as West Virginia enacted it) sets the template most statutes follow:

- **Assess at least yearly from an adopted budget,** allocating common expenses by each unit's common expense liability.
- **Charge some costs only to the units that benefit:** a limited common element's maintenance to the units assigned to it, an expense that benefits fewer than all units to those units, insurance "in proportion to risk" and utilities "in proportion to usage," if the declaration provides.
- **Charge an owner's misconduct to that owner's unit.**
- **Recalculate unpaid future assessments when allocations change.**

A **special assessment** is a one-time levy outside the regular budget: a roof replacement the reserves can't cover, an insurance deductible after a storm, a court judgment. It's allocated by the same formula unless the documents say otherwise, often payable in installments, and often requires an owner vote above a threshold the statute or documents set. California requires the annual budget report to state whether special assessments "are required or anticipated," with the estimated amount, start date and duration, and its resale disclosure includes approved changes to assessments not yet due.

Allocation is where rounding bites. A $412,000 budget across 137 units at unequal percentages produces fractions of a cent per unit per month; the allocation run must round each unit's share and then push the remainder to defined units so the sum equals the budget exactly, the same largest-remainder discipline as splitting any amount in [Money & Amounts](/docs/payments/money). The result is stored per unit and per period, so an owner's statement, an estoppel and a lender's questionnaire all show the same number.

Beyond assessments, the owner's ledger carries the same kinds of entries a resident's does, with different rules about each: late charges and interest, collection costs, fines, chargebacks for damage or for work done in the unit (Yardi Breeze lists owner maintenance requests "with automatic resident charges for work performed"), amenity and key fees, transfer and capital contribution fees at sale, and utility submetering in condos. Which of these become part of the lien, and which can support a foreclosure, varies by state, so every charge code carries a lien class.

## Delinquency, Liens and Foreclosure

An owner who stops paying can't be evicted from property they own. The association's remedy is the lien that the statute or declaration gives it on the unit, enforced by foreclosure or, increasingly, by collecting through a payment plan before it gets there. State law shapes every step:

- **When it's late, and what it costs.** California treats assessments as delinquent 15 days after they're due, caps the late charge at the greater of 10 percent of the delinquent assessment or $10, and allows interest of up to 12 percent a year starting 30 days after the due date. Florida's condominium statute defaults interest to 18 percent a year when the declaration sets no rate and allows an administrative late fee of up to the greater of $25 or 5 percent of each delinquent installment. UCIOA as enacted in West Virginia caps interest at 18 percent.
- **Where a payment goes.** Florida's condominium statute fixes the order: accrued interest, then administrative late fees, then collection costs and attorney fees, then the delinquent assessment. That's the opposite of the oldest-charge-first rule most resident ledgers use, so payment application order is a jurisdiction rule, not a tenant setting.
- **What the lien covers.** UCIOA makes "fees, charges, late charges, fines and interest" enforceable as assessments unless the declaration says otherwise; California says a disciplinary fine "may not be characterized nor treated" as an assessment that becomes a lien; Florida's HOA statute says a fine under $1,000 may not become a lien.
- **When foreclosure is allowed.** California bars foreclosure for delinquent assessments under $1,800 (excluding late charges, fees, collection costs, attorney fees and interest) unless they are more than 12 months delinquent, and requires the association to offer dispute resolution before recording a lien. Nevada bars foreclosing a lien based on a fine unless the violation threatens health, safety or welfare or the fine is for missing a required schedule. Florida requires written notice of intent to foreclose at least 45 days before judgment, and a recorded claim of lien expires after a year unless the association sues to enforce it.
- **Priority against the mortgage.** Normally a first mortgage recorded before the delinquency outranks the association's lien. UCIOA carves out a limited **super-priority**: the lien is "also prior" to that mortgage to the extent of budget-based assessments that would have come due in the six months before the association sued to enforce it. Nevada extends this to nine months of assessments plus capped enforcement costs (from $90 for an intent-to-record letter to $400 for a notice of default), but never less than six months if Fannie Mae or Freddie Mac rules require a shorter period. Florida takes the safe-harbor approach instead: a first mortgagee that takes title by foreclosure owes the lesser of the 12 months of assessments before it took title or 1 percent of the original mortgage debt.
- **Payment plans.** California lets an owner request a meeting with the board about a payment plan, which the board must hold in executive session within 45 days; while the owner complies, "additional late fees shall not accrue," a plan doesn't stop the association recording a lien, and on default collection resumes where it left off.

Each of these is a rule with a jurisdiction and an effective date, stored as data as [Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule) describes, and the collection workflow computes its deadlines from them and stores them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). The super-priority amount is a calculation over charge history (which assessments, from the budget, in which window), so it's only possible if charges keep their assessment schedule, service period and lien class. Collection agencies and attorneys work association accounts the way they work resident ones; the case model, notices and handoff belong to Delinquency, Collections & Eviction, with the ownership account in place of the lease.

## Reserves and Reserve Studies

Reserves are money set aside for replacing major components (roofs, paving, elevators, boilers, pool plaster, the building envelope) at the end of their lives. A **reserve study** inventories those components, estimates each one's remaining useful life and replacement cost, and produces a funding plan; the board's budget then sets the annual contribution. Underfunded reserves are the industry's most expensive failure: when a component fails, the money comes from a special assessment or a loan.

The rules got sharper after Champlain Towers South, a 12-story condominium in Surfside, Florida, partially collapsed on June 24, 2021. NIST's investigation released technical findings on June 22, 2026, concluding the collapse began when two connections between garage columns and the pool deck failed. Florida's response, as codified in the 2025 statutes:

- **Milestone inspections** (section 553.899). Condominium and cooperative buildings three habitable stories or higher need a structural inspection by a licensed architect or engineer by December 31 of the year the building turns 30 (or 25 if the local agency requires it, for example near salt water), and every 10 years after. Phase one is visual; if it finds "substantial structural deterioration," phase two follows with testing. Within 45 days of receiving the report the association must give every owner the inspector's summary, post it on the property, and publish the report on its website if it must have one.
- **Structural integrity reserve studies** (section 718.112(2)(g)). The same buildings need a SIRS at least every 10 years, covering the roof, structure, fireproofing and fire protection, plumbing, electrical, waterproofing and exterior painting, windows and exterior doors, and any other item whose deferred maintenance or replacement cost exceeds $25,000 (inflation-adjusted) and whose failure would affect those. It must be performed or verified by a licensed engineer or architect or a credentialed reserve specialist or professional reserve analyst. Associations existing on July 1, 2022 had until December 31, 2025, and none can complete it after December 31, 2026.
- **No waiving SIRS reserves.** For budgets adopted on or after December 31, 2024, a unit-owner-controlled association that must have a SIRS "may not determine to provide no reserves or less reserves than required" for those items, and SIRS reserves can be spent only on those components. A temporary relief lets an association that completed a milestone inspection in the prior two years pause or reduce contributions for up to two budgets adopted by December 31, 2028, with a majority of voting interests.

California's Davis-Stirling Act runs on disclosure rather than mandated funding. The board must have a visual inspection of the major components done "at least once every three years," when their replacement value is at least half the gross budget excluding reserves, and review the study every year. The study lists components with a remaining useful life under 30 years, their remaining life and cost, the annual contribution needed, and a funding plan. The annual budget report, distributed 30 to 90 days before the fiscal year ends, summarizes the reserves and the funding plan, states any deferred repairs with a justification, states anticipated special assessments, and may not assume a return on reserve cash more than 2 percent above the Federal Reserve Bank of San Francisco discount rate. The Assessment and Reserve Funding Disclosure Summary (Civil Code section 5570) goes with it.

For the software, a reserve study is a dated document with a component inventory, and each component row needs its category (so Florida's SIRS components can be flagged), useful and remaining life, replacement cost, and the study it came from. The next study produces new rows; comparing them is how a board sees that the roof's cost doubled. The budget's reserve contribution, the restricted reserve bank account, and the component inventory have to agree, and the gap between the funding plan and actual contributions is a number boards, buyers and lenders all ask for. Capital projects that spend reserves are the Budgets, Forecasts & Capital Projects chapter's job, with the reserve component as the link.

## Violations and Fines

Covenant enforcement is the workflow owners notice most. A manager or board member walks the community (AppFolio puts this on a phone), records an observed condition against a unit and a specific rule, and the association moves through a sequence that the documents and the statute constrain:

1. **Courtesy notice** with a cure period, usually a friendly letter first.
2. **Notice of hearing** if it isn't cured. California requires written notice at least 10 days before the board meeting, stating the date, time and place, the alleged violation, and that the member may attend and address the board, which meets in executive session if the member asks. A member who cures before the meeting, or commits money to a cure that takes longer, can't be disciplined.
3. **Hearing and decision.** In California the board decides and must deliver written notice of the decision within 14 days; discipline isn't effective unless the board followed these steps. Florida's HOA statute requires at least 14 days' notice and a hearing within 90 days before a committee of at least three members who are not officers, directors or employees; the committee can only confirm or reject the fine, must send its findings within 7 days, and the payment date must be at least 30 days after.
4. **Fine and escalation.** Florida's HOA statute caps a fine at $100 per violation and $1,000 in aggregate for a continuing violation unless the governing documents provide otherwise. Suspensions of common-area use or voting rights follow their own rules (in Florida, for obligations more than 90 days delinquent, without the hearing).

A violation is a case with a state machine, its own deadlines and its own evidence: who observed it, when, with what photos, which rule, every notice sent and how it was delivered, the hearing, the decision, the cure. A fine is a charge on the ownership account linked back to the violation, with a lien class that tells collections whether it can ever support a lien. Fines for a tenant's violation land on the owner's account, which is why the occupant of a rented unit matters. Notices that go by mail or personal delivery to meet a statute need proof of delivery, and notices sent electronically need the owner's consent to electronic delivery ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)); both run through the outbound gate in [Notifications](/docs/architecture/notifications#one-outbound-gate).

## Architectural Review

Owners who want to change the outside of their home (a fence, solar panels, a new roof color, a patio enclosure) submit an architectural request to an architectural review committee, often called the ARC or ACC, or to the board. AppFolio routes requests with attachments to the committee; Buildium describes "architectural requests with committee voting"; Rent Manager has board members approve or deny through the portal; Vantaca puts ARC voting in its board product; CINC's ACC skill aims at requests "that arrive complete."

The workflow is short, and the records are what matter:

- **The submission:** the unit, the owner, what's proposed, drawings, photos, contractor, materials and colors, and the guideline version it's judged against.
- **Completeness:** many documents start the review clock only when the application is complete, and many deem a request approved if the committee doesn't answer in time. Both make the received and completed dates, and the deadline computed from them, records the association depends on.
- **Committee votes:** each member's vote, with the quorum and threshold the committee's rules require, using the same vote records as governance.
- **The decision:** approved, approved with conditions, or denied, with reasons, and an appeal to the board if the documents allow one.
- **Follow-through:** an approval with conditions often needs an inspection after the work; work done without approval, or not as approved, becomes a violation linked to the request.

Some decisions aren't the association's to make. State laws limit restrictions on solar energy systems, flags, electric vehicle charging and drought-tolerant landscaping, and federal rules limit restrictions on certain antennas. These are jurisdiction rules attached to request categories, and the system should surface them to the committee rather than let a guideline silently deny what statute permits.

## Governance: Boards, Meetings and Votes

The board is elected by the members and acts at meetings that statutes require be noticed, open to members except for listed topics (personnel, litigation, member discipline, delinquencies), and minuted. Officers and committees act within delegated authority. For the software, governance is three record types:

- **Board and committee terms:** who served in which seat, from when to when, elected or appointed, so any approval can be checked against the authority in force that day.
- **Meetings:** notice sent, agenda, attendance, quorum, the minutes as approved, and which parts were executive session.
- **Votes:** a question put to a body (the board, a committee, or the members), the method (at a meeting, by written ballot, by electronic ballot), who was eligible, the weight of each vote (one per unit, or by allocated interest), the quorum and threshold, and the result.

Member elections carry the most rules, because they decide who controls the money:

- **Election rules.** California's election rules (Civil Code section 5105) involve an inspector of elections, deliver ballots and rules to members at least 30 days before the election, and bar rule amendments within 90 days of one.
- **Electronic voting.** California lets an association adopt a rule for electronic secret ballots run by the inspector, "except for an election regarding regular or special assessments." Members can switch to a written ballot no later than 90 days before an election and must be notified at least 30 days before that opt-out deadline; electronic voters need a valid email address; an electronic vote "shall not be revoked"; and nominations from the floor are prohibited in electronic-ballot elections. Florida's condominium statute allows online voting only for owners who consent in writing or electronically, after a board resolution that sets consent and opt-out procedures; the system must authenticate each owner, verify each vote was "not altered in transit," give a receipt, keep votes for recounts, and, for board elections, separate the voter's identity from the ballot so a ballot can't be linked to an owner. Owners must be able to test their device at least 14 days before the deadline. Board elections otherwise need a written ballot or voting machine, and general proxies can't be used in them.
- **Weighted and suspended votes.** Votes follow allocated interests, and Florida HOAs may suspend the voting rights of owners more than 90 days delinquent, excluding those votes from quorum and approval counts.

The secret-ballot requirement is a schema requirement. The record that an owner voted (for eligibility, quorum and preventing a second ballot) and the record of how the ballot was marked must be stored so they can't be joined: two tables, no shared key, ballot rows with no timestamp precise enough to reconstruct the order. An inspector or an election vendor may run the election itself, and the system then holds the certified result and the eligibility list rather than the ballots.

### Records Requests

Owners have a statutory right to inspect association records, with deadlines and penalties. California requires access to current fiscal year records within 10 business days of the request and to the prior two years within 30 calendar days, and keeps meeting minutes permanently open to inspection. Florida requires condominium records within 10 working days of a written request, presumes willful noncompliance after that, sets minimum damages of $50 a calendar day for up to 10 days, and makes associations of 25 or more units post listed documents on a website or app with an owners-only section, within 30 days of receiving or creating them. A records request is a case with a computed deadline, what was produced, what was withheld and why (Florida requires a checklist, kept for seven years), and the redactions applied.

## Resale Certificates and Estoppels

When a unit sells or refinances, the buyer, title company and lender need to know what it owes and what they are buying into. The association, through its manager, produces a package that goes by many names: resale certificate, resale disclosure, estoppel certificate, statement of account, payoff demand, lender or condo questionnaire. Management companies commonly route these orders through a document vendor: associations that use HomeWiseDocs list "resale disclosures, estoppels, demands, lender questionnaires and association governing documents" as available there, ordered by the professionals handling the transaction.

What's in the package, how fast, and for how much is state law:

- **UCIOA** (as enacted in West Virginia) requires the association to furnish a resale certificate within 10 days of an owner's request, disclosing any right of first refusal or other restraint on transfer, the assessment and any unpaid amounts, other fees, anticipated capital expenditures for this year and the next two, reserves, the latest balance sheet, income statement and budget, judgments and suits, insurance, known violations, and leasehold terms. The buyer isn't liable for unpaid assessments beyond the amount stated, and may void the contract until the certificate arrives and for five days after.
- **California** requires the association to provide the documents a seller must give a buyer within 10 days of the request: the governing documents, the latest budget and reserve disclosures, a statement of assessments and unpaid fines, unresolved violation notices, approved assessment changes not yet due, any rental restriction, 12 months of board minutes on request, and the latest inspection report under section 5551. The fee must be "based upon the association's actual cost," estimated in advance on a statutory form, separately stated and billed, and the same for electronic and paper copies, and delivery can't be conditioned on anything but paying it.
- **Florida** requires an estoppel certificate within 10 business days of a request from an owner, mortgagee or their designee. The statute's fee caps are $250, plus $100 if expedited and delivered within 3 business days, plus up to $150 if the account is delinquent, with aggregate caps for multiple units, adjusted every five years by the CPI as published by the state's regulator. No fee may be charged if the certificate is late. A certificate is effective for 30 days if delivered by hand or electronically and 35 if mailed, and the association waives any amount above what it stated to anyone who relies on it in good faith. The HOA statute spells out the contents field by field: assessment amount and frequency, paid-through date, next installment, itemized amounts owed and coming due in the effective period, open violations, whether board approval of the transfer is required and given, any right of first refusal, other associations the parcel belongs to, insurance contacts, and the attorney if the account is in collection.

The reliance rules make the certificate a binding snapshot. Once issued, the association can't collect more than it said from a good-faith buyer, so the certificate's figures must come from the ledger as of the issue date, be stored as issued (not regenerated from a ledger that later changes), and any charge posted afterward that falls inside the effective period must be checked against what was stated. Lenders send their own questionnaires about the project's finances, insurance and litigation, so the answers should be queries over the same records, not retyped. Fees are revenue to the manager or the association depending on the contract, collected from the requester at order, and refunded on cancellation where the statute requires.

## Insurance

The association's **master policy** insures what the association must insure, and the declaration and statute decide what that is. UCIOA (as enacted in West Virginia) requires property insurance on the common elements against all risks of direct physical loss commonly insured, for at least 80 percent of actual cash value after deductibles, and, in a cooperative or in a building whose units have horizontal boundaries, on the units themselves, though not the improvements owners install. It also requires liability insurance in an amount the board sets, makes every owner an insured, has the insurer waive subrogation against owners, and requires notice to all owners if the coverage isn't reasonably available. Florida requires condominium associations to carry "adequate property insurance" based on replacement cost re-determined at least every 3 years, covering the property as originally installed but excluding owners' personal property, floor, wall and ceiling coverings, fixtures, appliances, water heaters, cabinets, countertops and window treatments, which the owner's own policy must cover. The board sets deductibles consistent with industry practice; deductibles and uninsured losses are common expenses, except damage an owner or their occupants or guests cause, which can be charged to that owner.

Associations also carry directors and officers liability, fidelity or crime coverage for anyone who handles association money (including the manager), flood where required, and umbrella policies. The system tracks each policy, its limits, deductible, term and certificate, renews it on time (CommunityCoverage sells "automated policy tracking and renewal reminders"), answers lenders' and buyers' questions from it, and sends the certificate of insurance with resale packages. When a loss hits, the deductible and any shortfall become a special assessment or a chargeback, which is where insurance meets the ledger. The resident-side insurance products are Insurance, Deposits & Guarantees.

## State Acts as Data

No two states agree, and most have more than one act. As this chapter has shown, the same question (how long to produce a resale certificate, what a late fee can be, whether a fine can become a lien, whether electronic votes are allowed) has a different answer under UCIOA's enacted text, California's Davis-Stirling Act, Florida's Chapters 718, 719 and 720, and Nevada's Chapter 116, and the association's own documents can tighten many of those answers but not loosen them. The rule resolves from the property's jurisdiction, its association form, and sometimes its age or size (Florida's website rule starts at 25 units; its SIRS rule applies to buildings three habitable stories or higher).

| Rule | UCIOA (WV text) | California | Florida | Nevada |
| --- | --- | --- | --- | --- |
| Interest on delinquent assessments | Up to 18% | Up to 12% from day 30 | Declaration rate; 18% default (condo) | Not covered here |
| Late fee | Not covered here | Greater of 10% or $10 | Greater of $25 or 5% (condo) | Not covered here |
| Lien priority over first mortgage | 6 months of budget assessments | Not covered here | Lesser of 12 months or 1% of original debt (safe harbor) | 9 months plus capped costs |
| Foreclosure limits | Lien extinguished after 3 years without action | Under $1,800 and 12 months or less: no foreclosure | 45-day notice of intent | No foreclosure on fines, with exceptions |
| Fine notice | Not covered here | 10 days; decision within 14 | HOA: 14 days; independent committee | Not covered here |
| Resale deadline | 10 days | 10 days | 10 business days | Not covered here |
| Electronic voting | Not covered here | Electronic secret ballot by rule, not for assessments | Condo: owner consent and board resolution | Not covered here |

Each cell is a rule row with a jurisdiction, an association form, an effective date range and a citation, per [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions), and Landlord-Tenant Law as Data is where they are sourced and reviewed. The declaration's own terms (its interest rate, its late fee, its fine schedule) are association-level overrides inside the statutory bounds.

## How to Build It

The deltas against [the core data model](/books/property-tech/property-business#the-core-data-model): an association form on the property, allocated interests per unit, ownership accounts in place of leases (and charges and payments that can post to them), assessment schedules from adopted budgets, and the governance, enforcement, reserve and disclosure records.

```sql
-- The community. property_type 'association' already exists; owner_entity_id is the
-- association's legal_entities row (role 'association').
ALTER TABLE properties
  ADD COLUMN association_form   TEXT CHECK (association_form IN ('planned_community',
               'condominium', 'cooperative')),
  ADD COLUMN master_property_id UUID REFERENCES properties (id),  -- sub-association of a master
  ADD COLUMN fiscal_year_start  SMALLINT CHECK (fiscal_year_start BETWEEN 1 AND 12),
  ADD CONSTRAINT properties_association_form
    CHECK ((property_type = 'association') = (association_form IS NOT NULL));

CREATE TABLE unit_allocations (           -- the declaration's numbers; change only by amendment
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  unit_id                UUID NOT NULL REFERENCES units (id),
  common_expense_share   NUMERIC(12, 10) NOT NULL CHECK (common_expense_share >= 0),
  votes                  NUMERIC(12, 6) NOT NULL CHECK (votes >= 0),
  undivided_interest     NUMERIC(12, 10),  -- condominiums only
  source_document        TEXT NOT NULL,    -- 'Declaration art. 4', 'Third Amendment'
  valid_during           DATERANGE NOT NULL,
  EXCLUDE USING GIST (unit_id WITH =, valid_during WITH &&)
);

CREATE TABLE ownership_accounts (         -- one owner (or co-owners) of one unit, while they hold title
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  unit_id       UUID NOT NULL REFERENCES units (id),
  status        TEXT NOT NULL CHECK (status IN ('current', 'in_collections', 'closed')),
  acquired_by   TEXT NOT NULL CHECK (acquired_by IN ('sale', 'developer', 'foreclosure',
                  'deed_in_lieu', 'inheritance', 'other')),
  title_during  DATERANGE NOT NULL,          -- recorded transfer to recorded transfer
  previous_account_id UUID REFERENCES ownership_accounts (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (unit_id WITH =, title_during WITH &&)  -- one owner of record per day
);

CREATE TABLE ownership_account_holders (  -- who is on the account; a co-op holder holds shares
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  ownership_account_id UUID NOT NULL REFERENCES ownership_accounts (id),
  person_id          UUID REFERENCES people (id),
  legal_entity_id    UUID REFERENCES legal_entities (id),  -- LLC, trust, investor
  role               TEXT NOT NULL CHECK (role IN ('owner', 'co_owner', 'occupant')),
  is_member          BOOLEAN NOT NULL,       -- votes and may serve; occupants are not members
  valid_during       DATERANGE NOT NULL,
  CHECK (num_nonnulls(person_id, legal_entity_id) = 1),
  CHECK (role <> 'occupant' OR NOT is_member)
);

-- Charges and payments post to a lease or to an ownership account, never both.
ALTER TABLE charges ALTER COLUMN lease_id DROP NOT NULL,
  ADD COLUMN ownership_account_id UUID REFERENCES ownership_accounts (id),
  ADD CONSTRAINT charges_one_account CHECK (num_nonnulls(lease_id, ownership_account_id) = 1);

ALTER TABLE payments
  ADD COLUMN ownership_account_id UUID REFERENCES ownership_accounts (id),
  ADD COLUMN payer_entity_id      UUID REFERENCES legal_entities (id),  -- an owning LLC pays
  ADD CONSTRAINT payments_one_account CHECK (num_nonnulls(lease_id, ownership_account_id) = 1);

ALTER TABLE charge_codes
  ADD COLUMN lien_class TEXT CHECK (lien_class IN ('assessment', 'collection_cost', 'interest',
               'late_charge', 'fine', 'not_lienable'));  -- what the jurisdiction lets the lien carry

CREATE TABLE association_budgets (        -- adopted by the board for a fiscal year
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  fiscal_year          DATERANGE NOT NULL,
  operating_total      BIGINT NOT NULL,
  reserve_contribution BIGINT NOT NULL,
  currency             CHAR(3) NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('draft', 'adopted', 'superseded')),
  adopted_by_vote_id   UUID,               -- the board vote; FK added below
  EXCLUDE USING GIST (property_id WITH =, fiscal_year WITH &&) WHERE (status = 'adopted')
);

CREATE TABLE assessment_schedules (       -- what the association levies, before allocation
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  budget_id      UUID REFERENCES association_budgets (id),  -- null for a special assessment
  charge_code_id UUID NOT NULL REFERENCES charge_codes (id),
  kind           TEXT NOT NULL CHECK (kind IN ('regular', 'special')),
  total_amount   BIGINT NOT NULL,         -- per period, allocated across units
  currency       CHAR(3) NOT NULL,
  allocation     TEXT NOT NULL CHECK (allocation IN ('common_expense_share', 'equal',
                   'benefited_units')),
  frequency      TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual', 'once')),
  approved_by_vote_id UUID,               -- FK added below
  valid_during   DATERANGE NOT NULL
);

CREATE TABLE assessment_schedule_units (  -- benefited units, or a limited common element's units
  tenant_id              UUID NOT NULL,
  assessment_schedule_id UUID NOT NULL REFERENCES assessment_schedules (id),
  unit_id                UUID NOT NULL REFERENCES units (id),
  PRIMARY KEY (assessment_schedule_id, unit_id)
);

ALTER TABLE charges
  ADD COLUMN assessment_schedule_id UUID REFERENCES assessment_schedules (id),
  ADD CONSTRAINT charges_assessment_once
    UNIQUE (tenant_id, assessment_schedule_id, ownership_account_id, service_period);

CREATE TABLE reserve_studies (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  kind          TEXT NOT NULL CHECK (kind IN ('full', 'update_with_site_visit',
                  'update_without_site_visit', 'structural_integrity')),
  as_of         DATE NOT NULL,
  prepared_by   TEXT NOT NULL,
  credential    TEXT,                     -- 'PE', 'RA', 'RS', 'PRA'
  document_id   UUID NOT NULL             -- the signed study in the document store
);

CREATE TABLE reserve_components (         -- one row per component per study
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  reserve_study_id      UUID NOT NULL REFERENCES reserve_studies (id),
  name                  TEXT NOT NULL,     -- 'Roof, Building B'
  category              TEXT NOT NULL,     -- 'roof', 'structure', 'fireproofing', 'paving'...
  is_structural_integrity BOOLEAN NOT NULL DEFAULT FALSE,  -- a SIRS item where that applies
  useful_life_years     SMALLINT NOT NULL,
  remaining_life_years  SMALLINT NOT NULL,
  replacement_cost      BIGINT NOT NULL,
  currency              CHAR(3) NOT NULL
);

CREATE TABLE violations (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  unit_id              UUID NOT NULL REFERENCES units (id),
  ownership_account_id UUID NOT NULL REFERENCES ownership_accounts (id),  -- who answers for it
  rule_reference       TEXT NOT NULL,      -- 'CC&R 7.3(b)', 'Rules: Parking 2'
  architectural_request_id UUID,           -- unapproved or nonconforming work; FK added below
  status               TEXT NOT NULL CHECK (status IN ('open', 'notice_sent', 'hearing_set',
                         'fined', 'cured', 'dismissed', 'escalated')),
  observed_at          TIMESTAMPTZ NOT NULL,
  cure_by              DATE,
  closed_at            TIMESTAMPTZ
);

CREATE TABLE violation_steps (            -- notices, hearings and decisions, append-only
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  violation_id  UUID NOT NULL REFERENCES violations (id),
  kind          TEXT NOT NULL CHECK (kind IN ('courtesy_notice', 'hearing_notice', 'hearing',
                  'decision', 'fine_posted', 'cure_verified', 'appeal')),
  occurs_on     DATE NOT NULL,
  delivery      TEXT CHECK (delivery IN ('mail', 'certified_mail', 'personal', 'email',
                  'posted')),
  outcome       TEXT,
  charge_id     UUID REFERENCES charges (id),  -- the fine, when one is posted
  rule_id       UUID,                        -- the jurisdiction rule that set its deadline
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE architectural_requests (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  unit_id              UUID NOT NULL REFERENCES units (id),
  ownership_account_id UUID NOT NULL REFERENCES ownership_accounts (id),
  category             TEXT NOT NULL,      -- 'fence', 'solar', 'exterior_paint', 'addition'
  description          TEXT NOT NULL,
  guidelines_version   TEXT NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('submitted', 'incomplete', 'in_review',
                         'approved', 'approved_with_conditions', 'denied', 'deemed_approved',
                         'withdrawn', 'appealed')),
  submitted_at         TIMESTAMPTZ NOT NULL,
  complete_at          TIMESTAMPTZ,
  decide_by            DATE,               -- computed from the documents and the rule, stored
  decided_at           TIMESTAMPTZ,
  decision_vote_id     UUID,               -- FK added below
  conditions           TEXT
);

ALTER TABLE violations ADD FOREIGN KEY (architectural_request_id)
  REFERENCES architectural_requests (id);

CREATE TABLE association_roles (          -- board seats, officers, committee members
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  person_id    UUID NOT NULL REFERENCES people (id),
  body         TEXT NOT NULL CHECK (body IN ('board', 'architectural_committee',
                 'covenants_committee', 'fining_committee', 'other_committee')),
  title        TEXT NOT NULL,             -- 'Director', 'President', 'Treasurer', 'Member'
  seated_by    TEXT NOT NULL CHECK (seated_by IN ('election', 'appointment', 'developer')),
  valid_during DATERANGE NOT NULL
);

CREATE TABLE votes (                      -- a question put to a body
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  body           TEXT NOT NULL CHECK (body IN ('board', 'architectural_committee',
                   'fining_committee', 'members')),
  subject        TEXT NOT NULL CHECK (subject IN ('election', 'budget', 'special_assessment',
                   'amendment', 'architectural_request', 'invoice_approval', 'other')),
  method         TEXT NOT NULL CHECK (method IN ('meeting', 'written_ballot',
                   'electronic_ballot', 'unanimous_written_consent')),
  is_secret      BOOLEAN NOT NULL,
  weighting      TEXT NOT NULL CHECK (weighting IN ('per_person', 'per_unit', 'allocated_votes')),
  quorum         NUMERIC(6, 5),           -- fraction of eligible votes
  threshold      NUMERIC(6, 5) NOT NULL,  -- fraction needed to carry
  voting_during  TSTZRANGE NOT NULL,
  rule_id        UUID,                    -- the election rule or statute applied
  result         TEXT CHECK (result IN ('carried', 'failed', 'no_quorum')),
  certified_at   TIMESTAMPTZ,
  certified_by   TEXT                     -- the inspector of elections, where one is required
);

CREATE TABLE vote_participations (        -- who voted: eligibility, quorum, one ballot each
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  vote_id              UUID NOT NULL REFERENCES votes (id),
  ownership_account_id UUID REFERENCES ownership_accounts (id),      -- member votes
  association_role_id  UUID REFERENCES association_roles (id),      -- board and committee votes
  weight               NUMERIC(12, 6) NOT NULL,
  channel              TEXT NOT NULL CHECK (channel IN ('in_person', 'paper', 'electronic',
                         'proxy')),
  CHECK (num_nonnulls(ownership_account_id, association_role_id) = 1),
  UNIQUE (vote_id, ownership_account_id),
  UNIQUE (vote_id, association_role_id)
);

CREATE TABLE vote_ballots (               -- how ballots were marked; no link to a voter when secret
  id          UUID PRIMARY KEY DEFAULT uuidv7(),  -- random ordering if secret
  tenant_id   UUID NOT NULL,
  vote_id     UUID NOT NULL REFERENCES votes (id),
  participation_id UUID REFERENCES vote_participations (id),  -- NULL when votes.is_secret
  weight      NUMERIC(12, 6) NOT NULL,
  choices     JSONB NOT NULL               -- {"for": ["cand-3", "cand-7"]} or {"motion": "yes"}
);

ALTER TABLE association_budgets  ADD FOREIGN KEY (adopted_by_vote_id) REFERENCES votes (id);
ALTER TABLE assessment_schedules ADD FOREIGN KEY (approved_by_vote_id) REFERENCES votes (id);
ALTER TABLE architectural_requests ADD FOREIGN KEY (decision_vote_id) REFERENCES votes (id);

CREATE TABLE resale_requests (            -- resale certificates, estoppels, questionnaires
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  unit_id              UUID NOT NULL REFERENCES units (id),
  ownership_account_id UUID NOT NULL REFERENCES ownership_accounts (id),
  requester_kind       TEXT NOT NULL CHECK (requester_kind IN ('owner', 'buyer', 'title_agent',
                         'closing_attorney', 'lender', 'real_estate_agent', 'document_vendor')),
  requester_name       TEXT NOT NULL,
  document_kind        TEXT NOT NULL CHECK (document_kind IN ('resale_certificate',
                         'estoppel_certificate', 'payoff_demand', 'lender_questionnaire',
                         'governing_documents')),
  is_expedited         BOOLEAN NOT NULL DEFAULT FALSE,
  received_at          TIMESTAMPTZ NOT NULL,
  due_by               DATE NOT NULL,      -- from the jurisdiction rule, stored
  rule_id              UUID,
  fee_amount           BIGINT NOT NULL,
  currency             CHAR(3) NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('received', 'in_progress', 'issued',
                         'amended', 'cancelled', 'refunded')),
  issued_at            TIMESTAMPTZ,
  effective_until      DATE,               -- a Florida estoppel: 30 or 35 days
  issued_snapshot      JSONB,              -- every stated figure, frozen as issued
  amends_request_id    UUID REFERENCES resale_requests (id)
);

CREATE TABLE association_insurance_policies (  -- the master policy and the rest
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  kind           TEXT NOT NULL CHECK (kind IN ('master_property', 'general_liability',
                   'directors_and_officers', 'fidelity', 'flood', 'umbrella', 'other')),
  carrier        TEXT NOT NULL,
  policy_number  TEXT NOT NULL,
  limit_amount   BIGINT,
  deductible     BIGINT,
  currency       CHAR(3) NOT NULL,
  valid_during   DATERANGE NOT NULL,
  certificate_document_id UUID
);
```

Design decisions:

- **An ownership account replaces the lease, it doesn't imitate one.** Charges and payments post to exactly one of a lease or an ownership account, enforced by `charges_one_account` and `payments_one_account`, so the resident ledger, the owner ledger and the association's receivable are views over the same [double-entry ledger](/docs/payments/payment-states#double-entry-ledger). An owner who rents their unit through the same manager has both: an ownership account with the association and, as a landlord, leases with their tenant, in different properties' books.
- **A sale closes one account and opens another.** The exclusion constraint on `title_during` keeps one owner of record per unit per day; the buyer's account starts on the recorded transfer date, and assessments split by date at closing. Never rename the old account to the buyer: estoppels, liens and the seller's final balance all depend on the seller's history staying the seller's.
- **Owners are people or legal entities.** `ownership_account_holders` takes either, because investors, LLCs and trusts own units too, and an occupant is recorded without membership so rules and fines can reach the owner through the unit.
- **Allocations are the declaration's numbers, effective-dated.** Assessments, votes and super-priority calculations all read `unit_allocations` as of a date, and an amendment adds rows instead of editing them ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **An assessment schedule is the association's promise; the charges are facts.** The schedule holds the period total and the allocation basis; the posting run allocates it with largest-remainder rounding, posts one charge per ownership account per period, and the unique constraint keeps a rerun from posting twice, the same rule the core applies to lease schedules.
- **The lien class lives on the charge code.** What a lien can carry, what the super-priority covers and what can support a foreclosure differ by state, and all three are queries over charges by `lien_class` and service period, resolved against the jurisdiction's rules.
- **Secret ballots are two tables that can't be joined.** `vote_participations` proves eligibility and stops double voting; `vote_ballots` holds the choices with no participation link when the vote is secret. Board and committee votes are not secret, so their ballots link to the member's seat.
- **Every statutory deadline is computed once and stored.** Hearing notice dates, ARC decision deadlines, resale due dates, records-request deadlines and estoppel effective periods are stored on the row with the rule that set them, so a later rule change can't move a deadline that already ran ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **An issued certificate is frozen.** `issued_snapshot` keeps every figure as stated, because the association is bound by it; an amendment is a new row pointing at the old one.
- **Reserve studies are versions, not edits.** Each study brings its own component rows, so the history of every component's cost and life is a comparison between studies.

## Auditing

Association records are read by owners exercising inspection rights, buyers, lenders, auditors, insurers and, in disputes, judges:

- **Every assessment and how it was set.** The adopted budget, the vote that adopted it, the allocation as of the period, and every charge posted from it, so any owner can see their share is the declaration's percentage of the board's number.
- **Every charge to an owner's account,** append-only with reversals, the actor and reason for each, and the payment application order applied, so a lien amount, a super-priority calculation and a foreclosure threshold can be rebuilt.
- **Enforcement as process.** Each violation's observation, evidence, notices with delivery proof, hearing, decision and cure, because a fine imposed without the statutory steps isn't effective.
- **Votes and authority.** Who held each seat on each date, every board and committee vote, election eligibility lists and certified results, and for secret ballots the proof that ballots can't be linked to voters.
- **What the association told buyers.** Every resale certificate and estoppel as issued, with its fee and the deadline it met or missed.
- **Reserves.** Each reserve study and SIRS, each milestone inspection report and its delivery to owners, and every transfer into or out of the reserve account with the authorizing vote.
- **Access to records.** Each inspection request, what was produced, what was withheld and why, and when.

The mechanics (typed actors including the board member who approved and the inspector who certified, append-only history, snapshots) are in [Audit Trails](/docs/architecture/audit-trails#typed-actors), and the [snapshot](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you) pattern is what an issued certificate is. Retention follows the statutes (California keeps minutes open permanently; Florida keeps records checklists seven years) through [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type).

## What This Means for the System You Build

- **Model the owner as an ownership account,** with charges and payments posting to a lease or an ownership account, never both, on the same ledger.
- **Close an account at every sale** and open one for the buyer, with one owner of record per unit per day.
- **Store allocated interests as effective-dated declaration data** and compute every assessment, vote weight and super-priority amount from them.
- **Allocate budgets with exact rounding** so the units' shares sum to the adopted total, posted once per account per period.
- **Classify every charge code by lien class** so delinquency, lien priority and foreclosure limits are queries against state rules.
- **Treat state acts as rule rows** by jurisdiction, association form, size and building height, with the declaration's terms as bounded overrides.
- **Run violations, architectural requests, records requests and resale orders as cases** with computed, stored deadlines and the rule that set them.
- **Make secret ballots unlinkable in the schema,** and keep board and committee votes, seats and terms as the authority behind every approval.
- **Freeze every certificate as issued,** because the association is bound by what it states.
- **Keep reserve studies as versioned component inventories** tied to the budget, the reserve account and the inspections that feed them.
- **Expect to integrate** payments, resale documents, insurance tracking and e-voting from specialists as often as you build them.

## References

**Statutes and model acts**

- [West Virginia Code § 36B-1-103 (Uniform Common Interest Ownership Act)](https://code.wvlegislature.gov/36B-1-103/), definitions of allocated interests, common elements, condominium, cooperative, planned community, declaration, and a cooperative unit held under a proprietary lease
- [West Virginia Code § 36B-3-113](https://code.wvlegislature.gov/36B-3-113/), association property and liability insurance, 80 percent of actual cash value, units in cooperatives and stacked buildings, notice if unavailable
- [West Virginia Code § 36B-3-115](https://code.wvlegislature.gov/36B-3-115/), assessments from an annual budget, special allocations, 18 percent interest cap, owner misconduct, reallocation
- [West Virginia Code § 36B-3-116](https://code.wvlegislature.gov/36B-3-116/), lien coverage of fees and fines, six-month priority over first security interests, three-year enforcement limit
- [West Virginia Code § 36B-4-109](https://code.wvlegislature.gov/36B-4-109/), resale certificate contents, 10-day deadline, purchaser protections and five-day rescission
- [California Civil Code § 4525](https://california.public.law/codes/civil_code_section_4525), documents a seller must provide a buyer
- [California Civil Code § 4530](https://california.public.law/codes/civil_code_section_4530), association's 10-day delivery and cost-based, separately stated fees
- [California Civil Code § 5105](https://california.public.law/codes/civil_code_section_5105), election rules and electronic secret ballots, assessment exclusion, opt-out and notice deadlines
- [California Civil Code § 5210](https://california.public.law/codes/civil_code_section_5210), records inspection deadlines of 10 business days and 30 calendar days, minutes open permanently
- [California Civil Code § 5300](https://california.public.law/codes/civil_code_section_5300), annual budget report timing and reserve, deferral, special assessment and rate-of-return disclosures
- [California Civil Code § 5550](https://california.public.law/codes/civil_code_section_5550), reserve study visual inspection every three years, annual review, contents and funding plan
- [California Civil Code § 5650](https://california.public.law/codes/civil_code_section_5650), delinquency after 15 days, late charge and 12 percent interest caps
- [California Civil Code § 5665](https://california.public.law/codes/civil_code_section_5665), payment plan meetings within 45 days, no late fees during compliance, liens and default
- [California Civil Code § 5720](https://california.public.law/codes/civil_code_section_5720), $1,800 and 12-month foreclosure limits and dispute resolution before a lien
- [California Civil Code § 5725](https://california.public.law/codes/civil_code_section_5725), disciplinary fines not liens
- [California Civil Code § 5855](https://california.public.law/codes/civil_code_section_5855), 10-day hearing notice, executive session, cure, 14-day decision notice
- [Florida Statutes § 553.899 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/553.899), milestone inspections for buildings three stories or higher at 30 (or 25) years and every 10 years, phases, owner notice within 45 days
- [Florida Statutes § 718.111 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/718.111), condominium property insurance, deductibles, official records within 10 working days, minimum damages, website rule for 25 or more units
- [Florida Statutes § 718.112 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/718.112), structural integrity reserve studies, components, $25,000 threshold, deadlines, no waiver of SIRS reserves, temporary pause, written ballots and proxies
- [Florida Statutes § 718.116 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/718.116), first mortgagee safe harbor, interest and late fee defaults, payment application order, claim of lien, 45-day notice, condominium estoppel deadlines and fees
- [Florida Statutes § 718.128 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/718.128), electronic voting consent, authentication, ballot secrecy, receipts, retention and device testing
- [Florida Statutes § 719.103 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/719.103), cooperative definitions: title in the association, shares and the lease as the owner's interest
- [Florida Statutes § 720.305 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/720.305), HOA fine caps, notice and independent committee hearings, suspensions for 90-day delinquency
- [Florida Statutes § 720.30851 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/720.30851), HOA estoppel certificate deadline, fees, effective period, reliance and contents
- [Nevada Revised Statutes Chapter 116](https://www.leg.state.nv.us/NRS/NRS-116.html), NRS 116.3116 nine-month super-priority and capped enforcement costs, NRS 116.31162 limits on foreclosing for fines

**Reference**

- [NIST: Champlain Towers South collapse investigation](https://www.nist.gov/disaster-failure-studies/champlain-towers-south-collapse-ncst-investigation), collapse date and June 2026 technical findings

**In practice**

- [Vantaca](https://www.vantaca.com/), platform, services, resident, vendor and AI products
- [Vantaca: Platform](https://www.vantaca.com/platform), fee and admin billing attached to every action
- [Vantaca: Vantaca Home](https://www.vantaca.com/home), board ARC voting, invoice approval, documents and bank balances
- [Vantaca: HOAi](https://www.vantaca.com/hoai), agents for onboarding, board packets, financials, assessments and invoices
- [AppFolio: Community association management](https://www.appfolio.com/markets/hoa/management), violations, architectural review routing, portals, payments and board tracking
- [Buildium: HOA and community association management software](https://www.buildium.com/portfolios/association-management-software/), violations in every plan, architectural requests with committee voting, bank sync and HomeWiseDocs resale documents
- [Yardi Breeze: Association features](https://www.yardibreeze.com/associations-features/), association features, pricing from $1 per unit with a $400 minimum, and what the page omits
- [RealPage: Community associations](https://www.realpage.com/community-associations/), Loft Payments by ClickPay, HomeWiseDocs and CommunityCoverage
- [CINC Systems](https://cincsystems.com/), management and accounting, bank integrations, CINC Connect and AI skills
- [FRONTSTEPS](https://frontsteps.com/), Caliber accounting, assessment payments, community apps and Dwelling visitor management
- [Rent Manager: Associations](https://www.rentmanager.com/associations/), violations, architectural requests and online voting
- [MRI Software: HOA management software and condo, co-op solutions](https://www.mrisoftware.com/solutions/condo-hoa-management-software/), collections, maintenance fee e-payments, board communications and vote administration
- [Valley Ranch Association: Resale and refinance](https://www.valleyranch.org/resale-/-refinance), documents ordered through HomeWiseDocs
- [Spectrum Association Management: How do I order a resale certificate?](https://spectrumam.com/knowledge/how-do-i-order-a-resale-certificate), ordering resale certificates through HomeWiseDocs
