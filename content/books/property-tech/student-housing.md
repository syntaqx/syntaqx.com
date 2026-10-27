+++
title = "Student Housing"
description = "By-the-bed leases, liability models, roommate matching and fair housing, bulk bed assignment, guarantors, per-bed pre-leasing, the August turn."
category = "Property Tech Industry"
order = 1725
part = "Other Property Types"
tags = ["property-tech", "student-housing", "leasing", "fair-housing", "data-model"]
+++

Purpose-built student housing rents the same buildings as a conventional apartment community, but it sells something smaller: one bed in a four-bedroom unit, for the academic year, to an 18-year-old whose parent pays. Three habits of the business break a model built for apartments. The thing leased is often a **bed, not a unit**, so four strangers can hold four separate leases on one front door, each with its own price, ledger, guarantor and renewal. The **calendar is the school's**: nearly every lease in the building starts and ends together, pre-leasing for next fall starts while this fall's residents have barely moved in, and the whole property turns over in the days between one academic year and the next. And the operator, not the residents, often decides **who lives with whom**, which turns roommate matching into a fair housing question that conventional leasing never asks.

The [core data model](/books/property-tech/property-business#the-core-data-model) bends rather than breaks. A student property is still a `multifamily` property with buildings and units; this chapter adds beds under units, a liability model on each lease, the academic terms leases are sold for, roommate profiles and requests, and the history of who was assigned to which bed. Occupancy, pricing, renewals and turns then count beds instead of units. The general machinery (effective dating, exclusion constraints, custom fields, rules as data) lives in the playbook and is linked where it applies.

## How the Platforms Do It

The enterprise suites sell student editions of their multifamily products, and a few specialists sit beside them for matching and campus housing. As of October 2026, from each vendor's own pages:

| Vendor | Student capabilities as described |
| --- | --- |
| **AppFolio** | Student housing capabilities on its Plus plan: leasing "by-the-bed or entire units," "flexibly switching between by-the-bed and joint-and-several," a placement board to "place students in beds with roommates who are looking to share a unit or bedroom," bulk leasing tools and pre-leasing percentages. |
| **Entrata** | A student solution with roommate matching on the operator's "own list of questions," bulk unit assignment by dragging residents "onto unit spaces" with assignment letters "generated automatically," pre-arrival information gathering and real-time move-in day management, move-in and move-out checklists, and bulk renewal offers. A separate product, Student Revenue Intelligence, suggests a price "for each bed available" and tracks progress against pre-lease goals. |
| **RealPage** | A student market page that leads with "Lease confidently by bed" and higher "prelease rates," a student version of its property management system, revenue management, and market data covering "over 1 million student beds." Its analytics blog publishes monthly pre-leasing by bed for the US market. |
| **Rent Manager** | A student page focused on roommate money: residents can "pay individually, one lump-sum payment, or allow one resident to pay rent for another," with "different rents or fee structures for each roommate," occupancy reporting, and a portal where "residents and parents" pay online. |
| **RoomSync** (specialist) | Roommate matching software: lifestyle questions the admin customizes, profiles with a compatibility score, mutual-match requests, "matching period dates," and a drafting worksheet for room placement. Since June 2025, on-site teams can "export eligible roommate matches from RoomSync to Entrata at the close of each matching round." |
| **StarRez** (campus housing) | The housing portal many universities run for their own residence halls. University pages describe group room selection where a roommate group "must fill the space you pick" and selection times assigned by credits earned. Campus housing offices are a different buyer from private operators, but students arrive at a private property expecting the same group-selection experience. |
| **Yardi** | Its market-data business, Yardi Matrix, sells student housing data with "academic-year leasing and pre-leasing curves" and "rents by bed." Yardi's own product pages for its student edition block automated retrieval, so this survey doesn't describe them. |

Two patterns are consistent. Every suite treats per-bed leasing and roommate placement as the edition's reason to exist, and none names a separate object for a parent: guarantors and parents get portal access to pay, while the lease engine's guarantor role carries the liability. And matching is increasingly split between the operator's own questionnaire and a specialist's app, joined by an export at the end of a matching round, which means the matching record lives in two systems unless the integration brings the result back with its inputs.

## By-the-Bed Leasing and Liability

A conventional lease rents a unit to a household, and every adult who signs it is liable for the whole rent. Student housing sells two contracts, often in the same building:

- **Joint and several.** One lease for the unit, signed by every roommate. Miami University's off-campus guide states the consequence plainly: "This type of lease holds everyone who signs the lease responsible for the total amount being charged," and if one person "doesn't pay or simply moves out, the other tenants on the lease are liable for any missing rent." This is the core model's lease with several leaseholders.
- **Individual (by the bed, or by the room).** Each resident signs a lease for one bed and the shared use of the unit's common areas. The same guide: "This lease pertains to only the one person who signs it," and "if your roommates move out or don't pay, the landlord can replace them with somebody else in order to fill the spot."

The individual lease is what makes the segment different, and it moves risk and work around:

| Question | Joint and several | Individual (by the bed) |
| --- | --- | --- |
| Who owes the rent | Every leaseholder, for all of it | Each resident, for their bed |
| A roommate stops paying | The others owe the shortfall; the operator collects from anyone on the lease | That resident's ledger goes delinquent; the others are unaffected |
| A roommate leaves | The lease continues; the operator adds a replacement only with the remaining leaseholders' signatures, and releases the leaver only by agreement | The leaver's lease runs on (or ends by agreement or buyout); the operator may place someone else in the bed without asking the others |
| Pricing | One rent for the unit, split however the roommates like | A price per bed, which can differ by room (private bath, larger room) |
| Ledger | One ledger; roommates settle among themselves, or pay split amounts into it | One ledger per bed, plus allocation of shared charges |
| Damage to common areas | Charged to the lease | Allocated across the unit's leases, by a rule the lease states |
| Renewal | The group renews or doesn't | Each resident renews alone, possibly into a different bed |

The operator gains a unit that stays partly occupied when one roommate leaves, and pays for it with four ledgers, four screenings, four guarantors and four renewal decisions per unit. The residents trade the right to choose who fills an empty bed for not owing a stranger's rent. AppFolio's "flexibly switching between by-the-bed and joint-and-several" reflects that many operators sell both, by property or by unit.

Three consequences for the lease engine:

- **Liability is a term of the lease,** chosen at signing and printed in the document, never inferred from how many people signed. The lease templates differ (individual leases carry a common-area and shared-utility addendum and a clause on filling vacant beds), and [The Lease](/books/property-tech/the-lease#templates-and-clause-libraries) owns template selection.
- **A roommate change is a different event in each model.** On a joint lease it's a change to `lease_members` (one leaseholder's `valid_during` ends, a replacement's begins) with every remaining leaseholder's consent. On individual leases it's one lease ending early and another lease starting on the same bed. A roommate who stops paying is a delinquency on their own lease only, and [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction) runs on that one ledger.
- **Release is not move-out.** A resident who leaves mid-year still owes rent until the lease ends or the operator releases them, and whether the operator must try to re-let the bed (and credit the new rent) is state law, which [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data) keeps as effective-dated rules per jurisdiction ([Rules as Data](/docs/architecture/rules-as-data)). The system records the release (who agreed, on what terms, any buyout fee) separately from the move-out date.

## Beds, Rooms and Bed Types

A by-the-bed property has three levels of space under the building: the **unit** (the front door, the kitchen and the shared utilities), the **bedroom**, and the **bed**. Most bedrooms in purpose-built student housing hold one bed, but shared bedrooms with two beds exist and are priced lower, and a private bathroom is a priced feature. The unit remains the thing that turns, gets a work order for the dishwasher, and is metered for utilities; the bed is what is leased, priced, assigned and counted.

Before residents are assigned to specific beds, the property sells **bed types**: a floor plan and room configuration such as "four bedroom, four bath, private room" or "two bedroom, shared room." A student signs in January for "a private room in a 4x4 for next academic year" without knowing which unit; AppFolio's placement board shows these "indirect pre-leases" against inventory until they're placed. That's the defining modelling problem: a signed lease with a price, a term and a guarantor, but no unit yet. The core model's `leases.unit_id` is mandatory, so the student edition lets a lease be signed against a bed type and requires a unit and bed before it can become current.

Beds also have their own rentable status, mirroring the unit's: a bed held for a resident assistant, a bed taken down for damage, a bed left empty because a unit is being consolidated. A unit taken down takes all its beds with it.

## Roommate Matching and Fair Housing

Students who don't arrive with a group want roommates who keep the same hours and standards, and operators compete on matching. Entrata matches on "your own list of questions"; RoomSync builds profiles from lifestyle questions the admin customizes, a compatibility score, and mutual requests; university housing portals let groups select rooms together. The questionnaire usually covers sleep schedule, cleanliness, noise, guests, study habits and smoking, and a student can also name requested roommates who request them back.

The fair housing question is whether an operator may use protected characteristics, sex above all, when it decides who shares a unit. The Fair Housing Act's advertising provision, 42 U.S.C. § 3604(c), bars any notice or statement "with respect to the sale or rental of a dwelling that indicates any preference, limitation, or discrimination based on race, color, religion, sex, handicap, familial status, or national origin." Its exemptions are narrow: § 3603(b)(2) covers rooms in a dwelling of "no more than four families" only "if the owner actually maintains and occupies one of such living quarters as his residence," and § 3607 exempts religious organizations, private clubs and housing for older persons. Nothing in either section exempts student housing by name.

The leading case is **Fair Housing Council of San Fernando Valley v. Roommate.com** (9th Cir. 2012), about a website whose questionnaire asked users their sex, sexual orientation and whether they had children, and matched them on the answers. The Ninth Circuit held that "we interpret the FHA and FEHA as not applying to the sharing of living units," reading "dwelling" as an independent living unit and reasoning that "it's hard to imagine a relationship more intimate than that between roommates." The court drew the line itself: "a business transaction between a tenant and landlord is quite different." The opinion protects individuals choosing whom they live with. It doesn't say that a company renting beds in its own units, to strangers it places together, gets the same treatment, and it binds only the Ninth Circuit. State and local law can add classes too: the District of Columbia's Human Rights Act lists "matriculation" among the traits protected in real estate transactions, so a "students only" policy is itself a question in some places. [Fair Housing](/books/property-tech/fair-housing#protected-classes) owns the full analysis; the design consequences belong here:

- **Separate resident choice from operator placement.** A mutual roommate request (both students asked for each other) is the residents choosing, and the system records it as their request. The operator's algorithm placing strangers together is the landlord deciding, and its inputs are the landlord's criteria.
- **Keep protected characteristics out of the matching inputs and out of every listing.** Questions about lifestyle, not identity. A question set is reviewed before use, versioned, and frozen for the matching round it served, with [Custom Fields](/docs/architecture/custom-fields) definitions carrying a flag for whether a question may feed matching at all.
- **Make any sex-based assignment an explicit, reviewed property policy.** Some properties assign shared bedrooms or units by sex. Whether and where that's lawful is counsel's call, by jurisdiction; the platform's job is to make it a named, effective-dated policy on the property that someone approved, applied the same way to everyone, and never a silent weight inside a compatibility score.
- **Handle disability as accommodation, not matching.** A request for a single room, an accessible unit or an assistance animal is a reasonable accommodation request with its own workflow and deadlines ([Reasonable Accommodations and Modifications](/books/property-tech/fair-housing#reasonable-accommodations-and-modifications)), and it overrides the matching result rather than feeding it.
- **Record the decision.** Each placement keeps the inputs (questionnaire version, answers, requests), the score or rule that produced it, and who approved it, so a complaint can be answered from the record ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record)).

## Bulk Assignment and Assignment Letters

Matching produces groups; assignment puts each resident in a specific bed. Operators do it in bulk once most of next year's beds are pre-leased, working a board of signed-but-unplaced leases against open beds by bed type, honoring requests and match groups, then publishing. Entrata's board lets staff "drag and drop residents onto unit spaces" with assignment letters generated automatically; AppFolio's placement board does the same against "indirect pre-leases"; RoomSync drafts placements on a worksheet and exports matches at the end of a round.

The engineering is a constrained assignment problem with a human in the loop:

- **Hard constraints:** one resident per bed per day; the bed's type matches the lease's bed type (or the resident agreed to a change, which is a lease amendment if the price differs); mutual requests placed together where beds allow; any property policy on shared units; accessibility accommodations.
- **Soft goals:** compatibility scores, keeping renewing residents in their current bed or unit when they asked, filling units completely so partly empty units can be sold whole or consolidated, and floor or building preferences.
- **Drafts, then publish.** Staff work a draft, the system validates the hard constraints on the whole draft, and publishing writes the assignments in one transaction, sends the letters, and locks the board until the next change. Re-running a publish after a timeout must not send letters twice; key it as [Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently) describes.
- **Assignment letters are notices.** The letter tells the resident (and, by the resident's consent, the guarantor) the building, unit, bed and roommates' first names, and goes through the outbound gate with consent and channel rules ([Notifications & Consent](/docs/architecture/notifications)). Sharing a roommate's contact details is the roommate's consent, not the operator's convenience.
- **Reassignment is history, not an edit.** Room swaps, transfers after a conflict, and consolidation of half-empty units after the semester starts are new assignment rows with a reason; the old ones end.

## Guarantors: Parents, International Families and Substitutes

Most student residents have little credit history and no income that clears a rent-to-income test, so a guarantor is the norm: Miami's guide lists "Parent's guarantee required (or full payment of the year's rent in advance)" as a common lease addendum. In the core model the guarantor is a `lease_members` row with role `guarantor` and financial responsibility, and that's where student housing keeps it. What changes is the shape of the relationship:

- **One guarantor per bed lease.** With individual leases, each resident brings a guarantor who guarantees that one lease. With a joint lease, a parent's guarantee may cover the whole unit's rent or only their child's share, and that difference is the single most disputed term in student leasing. The guaranty states its scope, and the data says whose obligation it backs and up to what amount.
- **Linked, independent access.** A parent needs to see the balance, pay, receive notices the guaranty entitles them to, and sign renewals, without seeing the student's maintenance requests or roommate messages unless the student shares them. Rent Manager's portal lets "residents and parents" pay online; the pattern is a separate login per guarantor, with grants scoped to the guaranteed lease, which [Platform Architecture](/books/property-tech/platform-architecture#users-roles-and-grants) defines for every user type. An adult student's records aren't the parent's by default.
- **Guarantors abroad.** International students' parents have foreign addresses, foreign phone numbers, foreign time zones and foreign bank accounts. Addresses need the international handling in [Addresses & Geocoding](/docs/fundamentals/addresses#addresses-no-vendor-knows), notices go by the channels the guaranty allows, and payments may arrive as international wires or card payments in another currency ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx)).
- **Substitutes.** When there's no qualifying guarantor, operators accept a larger deposit, prepaid rent, or a guarantor product. Entrata's Homebody Guaranty, for example, offers a guarantor waiver "in place of a traditional guarantor" with "built-in insurance safeguards." Institutional guarantors and guarantor waivers are a company (a `legal_entities` row), not a person, and their regulation and claims belong to [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#guarantors-and-institutional-guarantees).

Age matters here too. A first-year student can be under the age of majority when signing in spring for the fall. The age of majority is state law, and a minor's contract is a weak contract; the lease engine checks an applicant's age against the property's jurisdiction and routes an under-age applicant to a parent-signed lease or a co-signing parent, rather than accepting the signature.

## International Students

International students apply without what conventional screening assumes:

- **No Social Security number.** F-1 and J-1 students "are only eligible to receive a Social Security Number after they have obtained U.S. work authorization," and the Social Security Administration "will not assign a number to you just to enroll in a college or school." The application must accept a passport and visa documents as identity, and screening must run without an SSN rather than failing the applicant at the first field. [Applications & Screening](/books/property-tech/applications-and-screening#international-applicants-and-no-ssn) owns the identity rules and the fair housing limits on asking about immigration status.
- **A foreign credit file, or none.** Some providers translate foreign bureau data: Entrata's April 2025 integration of Nova Credit's Credit Passport covers 16 countries, with history "translated into a format that aligns with U.S. underwriting standards." Where no file exists, the criteria fall back to a guarantor, a substitute, or prepayment, and the written criteria say so in advance.
- **Prepaid rent.** A semester or a year paid up front is a credit on the ledger applied to each installment as it falls due, not rent recognized on receipt ([Accounting & Revenue Recognition](/docs/payments/accounting)). Whether prepaid rent counts as a deposit subject to a state's deposit limits is a jurisdiction rule.
- **Signing from abroad.** Leases are signed months ahead from another country, which makes the electronic signature ceremony, consumer consent and the language of the documents matter ([Electronic Signatures & Records](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).
- **Arrival windows.** Flights land before or after the official move-in day; early arrival and late check-in are scheduled exceptions, not phone calls.

## Academic Terms

Conventional leases start any day and run any length; student leases are sold for terms that follow the school calendar. A property near a university sells an academic-year term, and may also sell full-year terms, single semesters, quarters at quarter-system schools, and summer terms; the platforms frame the product the same way (Rent Manager's page talks about renewals "for the school year," Yardi Matrix about "academic-year leasing").

A term is a property-level product row: its name ("2027-28 academic year," "Spring 2028," "Summer 2028"), the lease period it implies, when leasing for it opens, and the school whose calendar it follows. Leases sold for a term carry the term's dates, so a calendar change (a later spring commencement, a semester that starts a week earlier) is a new term for future leases, never a silent change to signed ones. Terms also set:

- **Installment schedules.** Academic-year rent is often stated as a total contract amount and billed in installments; the charge schedules ([Recurring Charges and the Posting Run](/books/property-tech/charges-and-resident-ledgers#recurring-charges-and-the-posting-run)) are generated from the term, with proration rules for partial first and last months stated in the lease rather than computed differently per resident.
- **Summer and short terms.** Summer residents (interns, summer session students, residents staying between years) occupy beds that the academic-year leases have released, with their own pricing.
- **Renewal timing.** Renewing residents are offered next year's term before the bed goes to new pre-leasing, often in bulk; Entrata's student page describes generating renewal offers automatically and bulk-sending them to residents.

## Per-Bed Pricing and the Pre-Leasing Curve

Student housing is priced by bed type and term, and the decision that matters happens once a year. A conventional community prices every day against units coming vacant; a student property sells nearly all of next year's inventory in one season, and the bed that isn't leased by the start of classes is hard to fill until the next term. Pricing is therefore steered by **pace against the curve**: the share of next fall's beds leased by this week, compared with the same week in prior years, for this property and its competitors.

RealPage's monthly reports for the Fall 2026 season show the shape of the curve for the US market, measured as the share of beds leased:

| As of | Beds leased for Fall 2026 | What the report compared |
| --- | --- | --- |
| December 2025 | 27.1% | "Ahead of Fall 2025's December reading" but behind the December showings "near 40%" for Fall 2024 and Fall 2023; October had been the slowest start since Fall 2016 |
| April 2026 | 68.2% | A decade average of 66.6% for April; Fall 2025 was 69.3% at the same point |
| July 2026 | 91% | Called a record for July |
| August 2026 | 95.9% | 60 basis points below Fall 2025's record 96.5%; the August average over the past decade is about 93% |

Per-bed revenue management takes that curve as its main input. Entrata's Student Revenue Intelligence suggests "the best price for each bed available" and tracks pre-lease goals; RealPage sells student revenue management with its bed-level market data; Yardi Matrix sells the competitive pre-leasing curves; AppFolio describes "knowing when to adjust your rates." The levers differ from conventional pricing: price by bed type and term (a private bath, a shared room, a semester-only term), the gap between renewal and new-resident prices, and concessions and their deadlines as the season tightens. [Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026) owns the general mechanics and the antitrust record. One segment-specific note on that record: in the private class action over algorithmic rent pricing, a separate student-housing complaint was dismissed in late December 2023 while the multifamily claims went forward, as Bisnow reported in January 2024. That's one ruling on one complaint's pleadings, not a safe harbor for student pricing, and the same design constraints on competitors' non-public data apply.

## Occupancy Counted by Bed

A student property reports occupancy, leased percentage and pre-leasing by bed. A four-bedroom unit with three residents is one occupied unit and 75% occupied by bed, and only the bed figure says what the property earns. The platform therefore derives, for any date:

- **Rentable beds:** beds whose own status and whose unit's status are rentable.
- **Occupied beds:** beds with a current assignment.
- **Leased beds for a term:** signed leases for the term, whether or not they're assigned to a bed yet, divided by rentable beds of the term. Unassigned leases count toward pre-leasing by bed type, which is why a bed type's leased count can exceed the beds of that type still unassigned and must never exceed its total.

Joint leases at the same property count each of the unit's beds as leased. [Operating Metrics](/books/property-tech/operating-metrics#occupancy-leased-and-exposure) defines occupancy, leased % and pre-leased % for every segment; here the rule is to compute both unit and bed figures from the same lease and assignment rows, and report whichever the owner's lender and the market expect, which in this segment is beds.

## The Academic-Year Turn and Move-In Day

When nearly every lease ends at the end of one academic year and the next year's leases start at the beginning of the next, the property turns almost every unit in the same short window between the two. [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#make-ready-turns) owns make-ready in general; the student version is a production schedule:

- **Plan the turn as one project.** Every unit gets a turn work order generated from the lease end dates, sequenced by building and floor, with paint, cleaning, carpet and repair crews (staff and vendors) scheduled against the day the next residents arrive.
- **Inspect each bedroom and the common areas separately.** Damage in a bedroom is that resident's; damage in the kitchen is the unit's, allocated across its leases by the rule the leases state. Move-out inspections record which space each finding is in, so [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#deposit-deadlines-as-rules-data) can itemize deposits per lease within each state's deadline.
- **Stagger arrivals.** Move-in day for several hundred residents is a capacity problem: elevator, loading dock and parking capacity by hour. Arrival time slots are pooled inventory with a cap per slot ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)), booked by the resident or parent from the pre-arrival checklist.
- **Clear residents before they arrive.** Entrata describes gathering students' information before arrival and showing outstanding items in one place. A resident who arrives with an unsigned guaranty, an unpaid first installment or missing insurance holds up the line; the checklist (lease signed, guaranty signed, payment made, insurance verified, slot booked) is computed per resident and per bed, and keys or credentials are issued only when it's complete.
- **Run the day live.** Check-in staff see who has arrived, who is late and which beds are still turning, and route early arrivals to beds that are ready (managing move-in days "in real time," in Entrata's words).

## How to Build It

The deltas against the [core data model](/books/property-tech/property-business#the-core-data-model). `properties.segment` is added here and referenced by the other Part 6 chapters:

```sql
-- A student property is a multifamily property with a segment; segment is the
-- operating model, property_type the asset class.
ALTER TABLE properties
  ADD COLUMN segment TEXT CHECK (segment IN ('conventional', 'student', 'senior', 'military',
    'affordable', 'build_to_rent'));

CREATE TABLE bed_types (                 -- what a by-the-bed property sells before beds are chosen
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  code             TEXT NOT NULL,        -- '4x4-private-bath'
  name             TEXT NOT NULL,        -- 'Four bedroom, four bath, private room'
  room_type        TEXT NOT NULL CHECK (room_type IN ('private', 'shared')),
  has_private_bath BOOLEAN NOT NULL,
  UNIQUE (tenant_id, property_id, code)
);

CREATE TABLE beds (                      -- what is leased, priced and counted in a by-the-bed unit
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  unit_id       UUID NOT NULL REFERENCES units (id),
  bed_type_id   UUID NOT NULL REFERENCES bed_types (id),
  room_label    TEXT NOT NULL,           -- 'B': the bedroom
  bed_label     TEXT NOT NULL,           -- 'B1': the bed in it
  status        TEXT NOT NULL CHECK (status IN ('rentable', 'down', 'staff', 'non_revenue')),
  status_reason TEXT,                    -- required unless rentable; an RA bed is 'staff'
  UNIQUE (tenant_id, unit_id, bed_label),
  UNIQUE (id, unit_id),                  -- target for the lease's (bed, unit) pair
  CHECK (status = 'rentable' OR status_reason IS NOT NULL)
);

CREATE TABLE academic_terms (            -- the terms a student property sells leases for
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  name             TEXT NOT NULL,        -- '2027-28 academic year', 'Summer 2028'
  kind             TEXT NOT NULL CHECK (kind IN ('academic_year', 'full_year', 'semester',
                     'quarter', 'summer', 'custom')),
  institution      TEXT,                 -- the school whose calendar it follows
  lease_period     DATERANGE NOT NULL,   -- first through last day of a lease sold for it
  leasing_opens_on DATE,
  UNIQUE (tenant_id, property_id, name)
);

CREATE TABLE bed_type_rates (            -- asking price per bed type and term, over the season
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  bed_type_id      UUID NOT NULL REFERENCES bed_types (id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms (id),
  audience         TEXT NOT NULL CHECK (audience IN ('new', 'renewal')),
  amount           BIGINT NOT NULL,      -- minor units per installment period
  currency         CHAR(3) NOT NULL,
  valid_during     DATERANGE NOT NULL,   -- when this price was offered
  EXCLUDE USING GIST (bed_type_id WITH =, academic_term_id WITH =, audience WITH =,
    valid_during WITH &&)
);

-- A lease may be signed for a bed type before a unit and bed are assigned,
-- and states its liability model.
ALTER TABLE leases
  ALTER COLUMN unit_id DROP NOT NULL,
  ADD COLUMN bed_type_id      UUID REFERENCES bed_types (id),
  ADD COLUMN bed_id           UUID,     -- the bed a by-the-bed lease rents, once assigned
  ADD COLUMN liability        TEXT NOT NULL DEFAULT 'joint_and_several'
                                CHECK (liability IN ('joint_and_several', 'individual')),
  ADD COLUMN academic_term_id UUID REFERENCES academic_terms (id),
  ADD CONSTRAINT leases_bed_in_unit FOREIGN KEY (bed_id, unit_id) REFERENCES beds (id, unit_id),
  ADD CONSTRAINT leases_bed_is_individual CHECK (bed_id IS NULL OR liability = 'individual'),
  ADD CONSTRAINT leases_bed_needs_unit CHECK (bed_id IS NULL OR unit_id IS NOT NULL),
  ADD CONSTRAINT leases_space_known CHECK (
    unit_id IS NOT NULL
    OR (bed_type_id IS NOT NULL AND status IN ('draft', 'out_for_signature', 'signed',
        'cancelled'))),
  ADD CONSTRAINT leases_individual_has_bed CHECK (
    liability <> 'individual' OR bed_id IS NOT NULL OR bed_type_id IS NOT NULL);

-- Guarantees name whose obligation they back. The guaranty's document, scope, cap
-- (guaranty_limit_amount) and renewal coverage are The Lease's lease_members columns.
ALTER TABLE lease_members
  ADD COLUMN guarantees_person_id UUID REFERENCES people (id),  -- null: the whole lease
  ADD CONSTRAINT lease_members_guarantees_person CHECK (
    role = 'guarantor' OR guarantees_person_id IS NULL);

CREATE TABLE bed_assignments (           -- who sleeps in which bed, over time
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  person_id         UUID NOT NULL REFERENCES people (id),
  bed_id            UUID NOT NULL REFERENCES beds (id),
  valid_during      DATERANGE NOT NULL,  -- ends at move-out, swap or transfer
  reason            TEXT NOT NULL CHECK (reason IN ('bulk_assignment', 'resident_request',
                      'room_swap', 'transfer', 'consolidation', 'accommodation')),
  assignment_run_id UUID,                -- the published board this came from, if any
  letter_sent_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (bed_id WITH =, valid_during WITH &&),     -- one resident per bed
  EXCLUDE USING GIST (person_id WITH =, valid_during WITH &&)   -- one bed per resident
);

CREATE TABLE roommate_question_sets (    -- versioned, reviewed before a matching round uses them
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID REFERENCES properties (id),  -- null: the tenant's default
  version      INT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'retired')),
  approved_by  UUID REFERENCES users (id), -- a staff user; users are defined in Platform Architecture
  approved_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, property_id, version),
  CHECK (status = 'draft' OR approved_at IS NOT NULL)
);

CREATE TABLE roommate_profiles (         -- a resident's answers for one term's matching
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  person_id        UUID NOT NULL REFERENCES people (id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms (id),
  question_set_id  UUID NOT NULL REFERENCES roommate_question_sets (id),
  answers          JSONB NOT NULL,       -- validated against the set's definitions
  visible_to_peers BOOLEAN NOT NULL DEFAULT FALSE,  -- the resident's choice
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, person_id, academic_term_id)
);

CREATE TABLE roommate_requests (         -- residents choosing each other
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  academic_term_id    UUID NOT NULL REFERENCES academic_terms (id),
  requester_person_id UUID NOT NULL REFERENCES people (id),
  requested_person_id UUID NOT NULL REFERENCES people (id),
  status              TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined',
                        'withdrawn')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (requester_person_id <> requested_person_id),
  UNIQUE (tenant_id, academic_term_id, requester_person_id, requested_person_id)
);
```

Occupancy by bed on a date is a query, never a column:

```sql
SELECT b.property_id,
       COUNT(*) FILTER (WHERE b.status = 'rentable' AND u.status = 'rentable') AS rentable_beds,
       COUNT(a.id) AS occupied_beds
FROM beds b
JOIN units u ON u.id = b.unit_id
LEFT JOIN bed_assignments a
  ON a.bed_id = b.id AND a.valid_during @> DATE '2027-09-15'
WHERE b.tenant_id = $1
GROUP BY b.property_id;
```

Design decisions behind it:

- **Segment is not property type.** A student property is a `multifamily` asset with `segment = 'student'`; lenders, valuations and the asset-class CHECK stay as the core defines them, and the segment switches on behavior (bed inventory, terms, matching, bed-based metrics). Senior, military, affordable and build-to-rent chapters use the same column rather than new property types.
- **Beds hang under units, never instead of them.** The unit still owns the door, the meters, the work orders and the unit-level status; a down unit takes its beds out of rentable inventory through the query, not by updating each bed. A property that leases some units whole and others by the bed keeps beds on all of them, so a unit can switch models between years.
- **The lease can precede its bed.** Dropping `NOT NULL` on `leases.unit_id` is the one relaxation of the core: a lease signed against a bed type is a real, signed contract that can't yet name its space, and `leases_space_known` stops it from becoming current without one. Assignment fills in `unit_id` and `bed_id` within the signed bed type, which completes the contract rather than rewriting it; a move to a different bed type with a different price is an amendment that [The Lease](/books/property-tech/the-lease#the-lease-state-machine) handles.
- **Assignments are the history; the lease holds the current bed.** `bed_assignments` records every placement, swap and transfer with a reason, and its two exclusion constraints stop double-bedding and double-placing in the database ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)). Publishing a board writes assignments and the leases' `unit_id` and `bed_id` in one transaction. Joint leases get assignment rows too, so the property knows who sleeps where even when the lease rents the whole unit.
- **A unit is leased whole or by the bed, not both, on any date.** That rule spans two kinds of lease row and isn't a simple exclusion constraint: check it in the signing transaction with a lock on the unit, and report violations from a nightly query as a backstop.
- **Liability is a lease column, and the bed check follows from it.** `leases_bed_is_individual` keeps a bed-level lease from ever being joint and several. Each individual lease is its own ledger under the core `charges.lease_id`; shared charges (common-area damage, a unit utility bill) are allocated across the unit's leases by an allocation rule and posted as one charge per lease, never as a unit-level ledger, so [Utilities & Energy](/books/property-tech/utilities-and-energy#resident-utility-billing) and [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers) keep working unchanged.
- **Guarantors stay lease members.** The core role carries the liability; `guarantees_person_id` says which roommate's obligation a guarantee backs on a joint lease, and the guaranty terms [The Lease](/books/property-tech/the-lease#how-to-build-it) records (`guaranty_scope`, `guaranty_limit_amount`) hold any cap the guaranty states. A guarantor's portal login is a user linked to the guarantor's `people` row, independent of the student's login, whose access derives from the guarantor membership rather than an explicit grant ([Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants)). Institutional guarantors are legal entities, modelled in [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#how-to-build-it).
- **Terms are product rows, and leases copy their dates.** A lease sold for a term stores its own `starts_on` and `ends_on` from the term at signing; editing a term never moves a signed lease. Rates are effective-dated per bed type, term and audience, so the price a resident was offered on a given day is recoverable ([Effective Dating & History](/docs/database/temporal-data#effective-dated-rows)).
- **Matching inputs are versioned and reviewed.** Question sets are approved before a round uses them and frozen afterwards; question definitions use [Custom Fields](/docs/architecture/custom-fields) with a flag for whether each may feed matching, and anything touching a protected characteristic is not eligible. Requests are recorded as the residents' acts, separately from the operator's placement.
- **Emit the segment's events.** `bed.assigned`, `bed.reassigned`, `assignment_run.published`, `roommate_request.accepted` and `academic_term.leasing_opened`, alongside the core's lease events, drive letters, checklists, turn work orders and integrations with matching apps.

## Auditing

Student housing produces records that parents, residents, fair housing investigators and owners ask about:

- **The liability model as signed.** Which template, which liability, which roommates were on a joint lease on which dates, and every release with its consent and terms. A parent disputing a bill for a roommate's rent is asking this question.
- **Guaranties.** Who guaranteed which lease, for whose share, to what limit, signed when, and every notice sent to the guarantor under the guaranty.
- **Placement decisions.** For every assignment: the question set version, the answers and requests that fed it, the score or rule, the property policy in force (including any sex-based assignment policy and who approved it), and the staff member who published the board. A complaint that a placement was discriminatory is answered from this record or not at all ([Audit Trails](/docs/architecture/audit-trails)).
- **Accommodation requests** and their outcomes, kept with the assignment they changed.
- **Prices offered and accepted.** The bed type rate in force on the day each lease was signed, and every concession, so pricing questions from residents, owners or regulators can be checked against what was offered.
- **Bed status and turn records.** Beds taken down and why, and the move-out inspection findings by bedroom and common area that justified each deposit deduction.

Retention follows the record type ([Data Retention & Deletion](/docs/architecture/data-retention)): roommate questionnaire answers are personal data with a short useful life and should be deleted on a schedule after the matching round, keeping only what the placement record needs, while leases, guaranties and ledgers follow the longer schedules [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds) sets.

## What This Means for the System You Build

- **Add beds under units, not instead of them,** and keep the unit as the thing that turns, meters and takes work orders.
- **Make liability a term of every lease,** support joint and several and individual in the same property, and treat a roommate change differently in each.
- **Let a lease be signed for a bed type** before its unit and bed exist, and refuse to make it current until assignment fills them in.
- **Keep assignment history separate from the lease,** with database constraints against double-bedding, and publish boards transactionally with idempotent letters.
- **Separate residents' roommate choices from the operator's placement,** keep protected characteristics out of matching inputs and listings, and make any sex-based assignment an explicit, approved property policy.
- **Treat guarantors as lease members with their own login,** state the scope of each guarantee, and route institutional guarantors to the insurance and guarantee model.
- **Screen without an SSN,** accept foreign credit data and documented substitutes, and handle prepaid rent as a credit applied over the term.
- **Sell terms, not dates:** academic terms as product rows, rates per bed type, term and audience, and pricing steered by pre-leasing pace against prior years.
- **Count occupancy and pre-leasing by bed,** derived from leases and assignments, alongside unit figures.
- **Plan the August turn as one project,** inspect bedrooms and common areas separately, and run move-in day on capped arrival slots and per-resident checklists.

## References

**Statutes and cases**

- [42 U.S.C. § 3603 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/3603), the single-family house exemption and the owner-occupied dwelling of no more than four families exemption
- [42 U.S.C. § 3604 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/3604), the advertising provision in § 3604(c) and the protected classes
- [42 U.S.C. § 3607 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/3607), the religious organization, private club and housing for older persons exemptions; no exemption for student housing by name
- [Fair Housing Council of San Fernando Valley v. Roommate.com, LLC, No. 09-55272 (9th Cir. Feb. 2, 2012)](https://cdn.ca9.uscourts.gov/datastore/opinions/2012/02/02/09-55272.pdf), the FHA and FEHA read as not applying to the sharing of living units, the intimate-association reasoning, and the contrast with a landlord-tenant business transaction
- [D.C. Code § 2-1402.21](https://code.dccouncil.gov/us/dc/council/code/sections/2-1402.21), "matriculation" among the traits protected in real estate transactions in the District of Columbia

**Platforms**

- [Entrata: Student housing solution](https://www.entrata.com/solutions/student), roommate matching on the operator's questions, drag-and-drop bulk assignment with automatic assignment letters, pre-arrival and move-in day management, move-in and move-out checklists, bulk renewals
- [Entrata: Student Revenue Intelligence](https://www.entrata.com/products/srm), a price for each bed and pre-lease goal tracking
- [Entrata: Homebody Guaranty](https://www.entrata.com/products/homebody-guaranty), a guarantor waiver in place of a traditional guarantor with insurance safeguards
- [Entrata: Nova Credit's Credit Passport integration (April 15, 2025)](https://www.entrata.com/press/entrata-integrates-nova-credits-credit-passport-to-expand-housing-access-for-international-renters), foreign credit history from 16 countries translated for US underwriting
- [RealPage: Student housing](https://www.realpage.com/student/), leasing by bed, prelease rates, revenue management and over 1 million student beds of market data
- [AppFolio: Student housing](https://www.appfolio.com/markets/student-housing), by-the-bed and joint-and-several leasing, the placement board and indirect pre-leases, bulk leasing tools and pre-leasing percentages on the Plus plan
- [Rent Manager: Student housing](https://rentmanager.com/student-housing), individual, lump-sum and cross-roommate payments, separate rents per roommate, a portal for residents and parents
- [Yardi Matrix](https://www.yardimatrix.com/), academic-year leasing and pre-leasing curves for student housing
- [Yardi Matrix: Student housing](https://www.yardimatrix.com/property-types/student-housing/), bedroom-level rent tracking and rents by bed
- [RoomSync: How it works](https://roomsync.com/how-it-works), customizable lifestyle questions, compatibility scores, mutual matches, matching period dates and a placement drafting worksheet
- [RoomSync: Joins Entrata's partner ecosystem (June 24, 2025)](https://roomsync.com/post/roomsync-joins-entratas-industry-leading-partner-ecosystem), export of eligible roommate matches to Entrata at the close of each matching round
- [Concordia College: Housing for current students](https://www.concordiacollege.edu/student-life/residence-life/apply-for-housing/for-current-students/), the StarRez portal, occupancy-match group selection and selection times by credits earned

**Market data**

- [RealPage Analytics: Fall 2026 Pre-Lease Season Sees a Second Straight Month of Improvement (January 22, 2026)](https://www.realpage.com/analytics/december-2025-student-housing-update/), 27.1% of beds leased for Fall 2026 as of December 2025, comparisons with prior seasons
- [RealPage Analytics: Fall 2026 Pre-Leasing Reaches Nearly 70% (May 18, 2026)](https://www.realpage.com/analytics/april-2026-student-housing-update/), 68.2% as of April, the April decade average and Fall 2025's April reading
- [RealPage Analytics: Fall 2026 Student Housing Pre-Leasing Hits a Record 91% (August 14, 2026)](https://www.realpage.com/analytics/july-2026-student-housing-update/), 91% as of July
- [RealPage Analytics: Student Housing Pre-Leasing Finishes Near Record Highs for Fall 2026 (September 9, 2026)](https://www.realpage.com/analytics/august-2026-student-housing-update/), 95.9% as of August, Fall 2025's 96.5% and the August decade average, measured as the share of beds leased

**In practice**

- [Miami University: Lease signing](https://miamioh.edu/life-at-miami/living-off-campus/housing-search/lease-signing.html), joint and several versus individual leases, what happens when a roommate leaves or doesn't pay, and the parent's guarantee or prepaid-rent addendum
- [San Francisco State University: Social Security Number](https://ali.sfsu.edu/global/resources/ssn), F-1 and J-1 students eligible for an SSN only with work authorization, and none assigned for enrollment alone
- [Bisnow: Judge rejects RealPage's motion to dismiss rent-fixing lawsuit (January 3, 2024)](https://www.bisnow.com/news/national/multifamily/judge-rejects-realpages-motion-to-dismiss-rent-fixing-lawsuit-122269), the related student housing suit dismissed while the multifamily claims went forward
