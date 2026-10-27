+++
title = "Self Storage"
description = "Storage units and their pricing, online move-ins, gate access, state lien law from notice to auction and surplus, protection plans versus insurance."
category = "Property Tech Industry"
order = 1730
part = "Other Property Types"
tags = ["property-tech", "self-storage", "lien-law", "auctions", "access-control", "data-model"]
+++

A self-storage facility rents lockable space by the month to people who keep their belongings there and come and go on their own. Nobody lives in it, and the statutes say so: California's act defines the facility as real property for renting storage space to "occupants," and adds that "no occupant may use a self-service storage facility for residential purposes"; Florida's act says the same of its "tenants." That one fact changes almost everything an apartment platform assumes. The contract is a rental agreement under a state self-service storage facility act, not a residential lease under landlord-tenant law, so there is no warranty of habitability, no eviction case and no deposit-return deadline. The parties are an **owner** (the operator) and an **occupant** (California's term; Florida and Texas say tenant), and the occupant almost always rents month to month: Extra Space Storage's 2025 10-K says "nearly all of our leases are on a month-to-month basis," and Public Storage offers "storage spaces for lease on a month-to-month basis, for personal and business use."

In return for giving up landlord-tenant protections, the occupant gets a different and very specific set: the owner holds a statutory lien on everything in the unit, and when rent goes unpaid it can deny access, then sell the contents at a public auction, but only after a sequence of notices whose days, delivery methods and wording each state writes into its act. Most of the platform's legal weight sits in that sequence. The rest is a retail business: units priced like airline seats, rented online with no staff present, accessed by a gate code issued at checkout, paid by card on file, and topped up with a protection plan or insurance and a lock and some boxes. This chapter covers the inventory and its pricing, online rentals and access, autopay, the lien process state by state, protection plans and insurance, and ancillary retail, then extends [the core data model](/books/property-tech/property-business#the-core-data-model).

## How It Differs From the Multifamily Core

The core model already makes room for storage: a self-storage facility is a `properties` row of type `self_storage`, each unit is a `units` row of kind `storage_unit`, and the rental agreement is a `leases` row with `ends_on` null, because it is periodic ([Holdover and Month-to-Month](/books/property-tech/the-lease#holdover-and-month-to-month)). What changes is everything hanging off those rows:

| | Multifamily core | Self storage |
| --- | --- | --- |
| **Contract** | Residential lease under landlord-tenant law, usually a fixed term | Rental (occupancy) agreement under a state self-storage act, month to month |
| **Parties** | Landlord and resident household | Owner and occupant, often one person or a business, no household |
| **Screening** | Credit, criminal, eviction history, fair housing rules | Usually identity and a payment method only |
| **Unit** | A dwelling, priced by floor plan and lease term | A space priced by size, climate control, access and floor, re-priced constantly |
| **Price changes** | At renewal, inside any rent cap | Existing-customer rate increases on notice, any month |
| **Default remedy** | Notice, eviction filing, judgment, writ | Deny access, statutory lien, notices, advertisement, sale of contents |
| **Possession** | The resident lives there | The occupant visits; the gate decides who gets in |
| **Ancillary revenue** | Fees, parking, renters insurance | Protection plans or tenant insurance, locks, boxes |

So the storage edition of a property platform is mostly new tables around an unchanged spine: unit types and street rates instead of floor plans and lease-term pricing, access state instead of keys, and lien cases instead of evictions ([Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction)). The pieces that stay the same matter as much: charges are still schedules and posted facts, payments are still applied to charges, and the owner of record still gets an owner statement ([Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#owner-reporting)).

## How the Platforms Do It

Self storage has its own specialists, and the multifamily suites reach it through separate editions. As of October 2026:

| Vendor | What it sells for storage | Notable public detail |
| --- | --- | --- |
| **Storable** | Three management systems (Storable Edge, Sitelink and Storable Easy), plus access control, auctions, collections, CRM, insurance, websites and a marketplace | Payment processing "comes standard"; Access ties gate codes to payment status and, on Edge only, will "automatically lock out tenants who miss payments and send them a payment link to restore access"; works with third-party gate providers such as DoorKing and PTI/Falcon |
| **Yardi** | Breeze self storage edition; an enterprise self-storage system (Yardi Store) | Breeze lists online reservations and leases, "Manage auctions," "Track and sell retail items" and "an integrated stored goods protection plan," with pricing on request; its Store Web Services API (SWS2, formerly Centershift) is SOAP with tokenized authentication |
| **Rent Manager** | Self storage edition of its general platform | Dashboard of move-ins, move-outs and availability, online payments, an API and 160+ integrations |
| **Tenant Inc.** | Hummingbird management software, Mariposa websites, Mobile Manager field app, Auction Manager | December 2025 integration sends lien workflow data and unit details from Hummingbird into StorageTreasures listings; Mobile Manager handles overlocks, photos and unit condition records |
| **RealPage** | Marketing only (formerly G5, now Demand Marketing) | Websites, ads, call scoring and reputation for "170+ brands," integrating with other vendors' management systems rather than selling one |
| **OpenTech Alliance** | INSOMNIAC kiosks and cloud access control, a call center, and the StorageTreasures auction site | StorageTreasures helps operators "auction delinquent units, recover rent, and reduce lien liability" |
| **Janus (Nokē)** | Nokē Smart Entry: smartphone keys for the gate and individual unit locks | Automates "overlocking and release"; each unit controller stores up to 300 events offline; the Infinitē lock adds NFC that works after the battery dies, shipping from the third quarter of 2026 |
| **Lockerfox** | Online storage auctions | Buyers pay a 15% premium with a $10 minimum; lien law and newspaper ad references for operators |

Three things stand out. First, the specialists bundle the revenue lines: one vendor sells the management system, the payment processing, the insurance program, the auction marketplace and the gate integration, so each of those is both a feature and a revenue share, a pattern The Software Landscape describes in [the major platforms](/books/property-tech/software-landscape#the-major-platforms). Second, the lien process is spread across systems: the management system tracks the delinquency and notices, a field app records the overlock and photos, and an auction site sells the unit, which is why integrations that move a case from one to the next without re-keying are the selling point. Third, staffing is optional: kiosks, call centers, online move-ins and automatic lockouts exist so that a facility can run with nobody on site, and every rule that a manager used to apply by judgment has to be data the system applies.

## Unit Inventory

A storage unit is a box with a door, but the attributes that price it are many:

- **Size.** Width by depth (a 5x10, a 10x10, a 10x30), sometimes height, and the derived square footage that every revenue and occupancy figure in the industry is expressed in (occupancy by square foot is defined in [Operating Metrics](/books/property-tech/operating-metrics#occupancy-leased-and-exposure)). Public Storage reports realized rent "per occupied square foot," not per unit.
- **Climate control.** Heated and cooled, sometimes humidity controlled. A different product at a different price, and a different risk when the HVAC fails.
- **Access.** Interior (reached through a building, hallway and maybe an elevator), drive-up (a roll-up door you can back a truck to), or a locker. Floor level is a pricing attribute for interior units, since carrying things up stairs or an elevator is work.
- **Vehicle, RV and boat parking.** Outdoor, covered or enclosed spaces, priced by length. These units hold titled property, which changes the lien process (below).
- **Door and features.** Door width and type, an electrical outlet, alarm or lighting per unit, and whether the unit carries a smart lock.

Operators sell by **unit type**, the bundle of attributes a customer chooses from ("10x10, climate controlled, interior, ground floor"), and price at that level, while the system rents a specific unit inside the type. The **unit mix** is the count of each type at a facility, and it is a capital decision: where partition walls are movable, a 10x20 can become two 10x10s when small units are scarce, so unit numbers and sizes can change over a building's life and the history has to survive it.

Status follows the core rule: the unit carries only its own rentable status with a reason (down for damage, used as an office), and occupancy is derived from agreements. Storage adds states the operator cares about that are not occupancy: a unit with an overlock, a unit awaiting a lock check after a move-out, a unit whose contents have been sold but not yet cleaned out. Those derive from the access and lien records below rather than from a status column someone must keep in sync.

## Street Rates, In-Place Rates and Rate Increases

Storage pricing has two prices for the same unit type at the same moment:

- **Street rate** (the move-in rate): what a new customer pays today, posted on the website and marketplaces and changed as often as demand moves.
- **In-place rate**: what each existing occupant pays, set at move-in and raised over time.

The gap between them is the business model. Public Storage's 2025 10-K reports that it "lowered move-in rental rates to stimulate move-in activity" in 2025, and that the average annual contract rent per square foot was $12.80 for tenants moving in and $20.30 for tenants moving out. It also says it "typically increase[s] rental rates to our long-term tenants," and that cumulative increases to existing long-term tenants drove revenue growth that was partly offset by lower rates for new ones. Promotions sit on top: the same filing reports promotional discounts of about $56.9 million in 2025, "generally, '$1.00 rent for the first month.'" Low entry prices and first-month promotions win the move-in; **existing customer rate increases** (ECRIs, in the industry's shorthand) recover the margin from occupants who rarely move their belongings to save a few dollars.

Both prices are set by revenue management. Public Storage describes being able to "quickly change each of our individual property's pricing and promotions" and lists revenue management among its centralized functions; Extra Space describes "real-time, interactive pricing and discount tools." The inputs (occupancy by unit type, move-in and move-out velocity, competitor street rates, seasonality) and the antitrust record of pricing software that pools competitors' data are the subject of [Revenue Management & Pricing](/books/property-tech/revenue-management#inputs-own-public-and-pooled-data); this chapter covers what storage adds.

What storage adds is regulation of the increase itself, which is newer than most pricing engines:

- **Notice before a change.** California lets the owner change the terms of the rental agreement, rent included, only after "a period of at least 30 days from giving notice in writing," by personal delivery, first-class mail or consented email; continued storage after the notice takes effect makes the new terms part of the agreement (BPC 21715.5, effective January 1, 2025).
- **Disclosure at move-in.** For agreements entered on or after January 1, 2026, California requires the first page of the agreement to disclose, in larger type set off from the surrounding text, whether the occupant got a promotional or discounted rate and for how long, and "whether the rental fee is subject to change and, if so, the maximum rental fee that the owner could charge during the first 12 months," along with every step needed to terminate and stop future charges (BPC 21715.2).
- **Emergency caps.** Both REITs' 10-Ks cite temporary California rules, after wildfires and floods, that limited the rents they could charge at certain facilities, and Extra Space lists "limitations on rent increases due to state of emergency or similar orders" among the regulations it is subject to.

So an ECRI is not an edit to a number. It is a scheduled change with a notice, a delivery record, an effective date computed from the notice, a check against the maximum disclosed at move-in, and a check against any emergency order covering the property's area on that date. My rule: the pricing engine proposes, and a rules layer decides whether the proposal is allowed and when it can take effect, exactly as [Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) describes for computed deadlines.

## Online Rentals and Contactless Move-In

Storage moved online earlier and further than apartments, because there is little to screen and nothing to inspect. Public Storage reports that "nearly three quarters of our new rental agreements" in 2025 were completed through its eRental and Rent by Phone process; Storable Easy's site promises tenants can "check availability, rent units and make payments 24/7"; Yardi Breeze lists "Complete reservations, screening and leases online"; and Tenant Inc. describes a "touchless" rental through its websites.

A complete online move-in runs, in one session:

1. **Choose a unit type** at a street rate, with any promotion.
2. **Hold a unit.** Either a reservation for a future date or an immediate rental. A reservation holds inventory while the customer decides or until the move-in date, with an expiry, the pattern in [Reservations & Holds](/docs/architecture/reservations-and-holds#where-a-hold-lives). Whether a reservation holds a specific unit or only a count of a unit type is a real choice: holding a type ([counters for pooled inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)) keeps the best units free for walk-ins, holding a unit ([unique keys for discrete units](/docs/architecture/reservations-and-holds#unique-keys-for-discrete-units)) lets the website promise "unit 2114, ground floor, next to the elevator."
3. **Identify the occupant**, capture the alternate contact the state requires (below), and ask the questions the statute demands, such as Florida's requirement that the agreement or application state "whether the applicant is a member of the uniformed services."
4. **Choose coverage**: the operator's protection plan, its tenant insurance, or proof of the occupant's own policy.
5. **Sign the agreement** electronically, with the state's required lien disclosure and, in California, the first-page price disclosures; [Electronic Signatures & Records](/docs/compliance/electronic-signatures#consumer-consent-comes-first) covers the consent and evidence, and the consent to receive lien notices by email is its own signed line in states that allow email notice.
6. **Pay** the first period, prorated or anniversary-billed, plus any admin fee, and store the card for autopay.
7. **Issue access**: a gate code or a mobile key, live at the gate within seconds, and the unit number or a smart-lock key.

The transaction that converts the hold into an agreement is where double-renting happens if it isn't atomic: two websites, a marketplace and a kiosk can sell the last 10x10 at once. The hold, the agreement row and the unit's claim belong in one database transaction with a constraint that only one open agreement can exist per unit, and the access credential is issued only after that transaction commits ([Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently)).

## Autopay and the Card on File

Autopay matters more in storage than in housing, because a failed payment is the first day of a lien timeline. Two things follow. The card on file needs the stored-credential consent and network rules the Payments volume describes in [Autopay Against a Balance](/books/payments/stored-credentials#autopay-against-a-balance), and the dunning schedule has to be designed around the state's lien clock rather than a generic retry curve ([Dunning](/books/payments/stored-credentials#dunning)): a retry that succeeds on day 13 in a state where a preliminary notice can go out on day 14 saves a certified mailing, an overlock and a phone call. Storable's lockout flow (deny the gate, text a payment link, restore on payment) is the same idea pushed to the gate. Card data stays with the processor and its vault ([PCI DSS](/docs/compliance/pci-dss#shrink-the-scope)); the storage platform stores a token and the agreement that authorizes charging it.

## Gate Access and Overlocks

Possession in storage is a gate code. The access system (keypads and gate controllers from hardware makers, or a cloud access system like Storable Access, INSOMNIAC CIA or Nokē Smart Entry) holds the facility's credentials and enforces them at the gate, the building doors, elevators and, with smart locks, each unit. The management system is the source of truth for who should get in: it issues a credential at move-in, suspends it when the account goes delinquent, restores it on payment, and revokes it at move-out. The access system is the source of truth for who did get in, through an event log of entries, denials and door openings that operators use for security, disputes and, in a lien dispute, evidence of when an occupant last visited.

Two remedies sit on that boundary:

- **Denial of access** is a statutory step with its own clock. Florida lets the owner deny access without notice once 5 days have passed from the date rent was due (83.8055). Washington allows it after rent is unpaid for six consecutive days, if the rental agreement provides for it (RCW 19.150.030). California ties the right to deny access to the lien attaching on the termination date in the preliminary lien notice (BPC 21705(a)), which comes much later. A platform that suspends gate codes on day 1 everywhere is breaking some states' rules.
- **The overlock** is a second lock the operator puts on the unit door so the occupant's own key no longer opens it. It's the physical form of denying access, and it's done by a person walking the facility with a list, or by a smart lock switching state. Janus says Nokē automates "overlocking and release," and Tenant Inc.'s Mobile Manager handles overlock tasks and photos. The record that matters is when the overlock went on and came off, by whom, and with what photo, because a removed overlock is what an occupant who paid at 11pm expects to find in the morning.

Gate codes are credentials ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)), so they get the treatment of credentials: never stored or shown in plain text where they don't need to be, rotated at move-out, and pushed to the access system idempotently, since a gate controller that missed a "suspend" message leaves a delinquent occupant with access, and one that missed a "restore" message locks out someone who paid. My default: the management system holds the desired access state per agreement, the integration reconciles the gate's actual state against it on a schedule, and every disagreement is an alert.

## Lien Sales and State Lien Law

Every state with a self-service storage act gives the owner a lien on the stored property, and every act prescribes how to enforce it. California's is typical in scope: "a lien upon all personal property located at a self-service storage facility for rent, labor, late payment fees, or other charges, present or future, incurred pursuant to the rental agreement and for expenses necessary for the preservation, sale, or disposition" (BPC 21702). The sequence is the same everywhere (default, access denial, preliminary notice, cure period, lien attaches, notice of sale, advertisement, sale, surplus), and the details differ at every step. Three states I opened show how much:

| Step | California (BPC 21700 et seq.) | Florida (83.801–83.809) | Washington (RCW 19.150) |
| --- | --- | --- | --- |
| **Agreement must say** | Property may be liened and sold if charges are unpaid for 14 consecutive days; must request an alternate contact, or the lien doesn't attach (21712) | Whether the occupant is in the uniformed services (83.808(2)) | Lien and sale after 14 consecutive days unpaid; disclose lienholders; request an alternate address, or the lien doesn't attach (19.150.120) |
| **Deny access** | When the lien attaches (21705) | 5 days after rent is due, no notice needed (83.8055) | After 6 consecutive days unpaid, if the agreement provides (19.150.030) |
| **First notice** | Preliminary lien notice after 14 consecutive days unpaid; at least 14 days to pay (21703) | Notice demanding payment within at least 14 days of delivery (83.806(2)) | Preliminary lien notice after 14 consecutive days unpaid; at least 14 days to pay (19.150.040) |
| **Delivery** | Certified mail, first-class with certificate of mailing, or email if the agreement says so and the occupant signed consent; email needs proof of actual receipt or a mailed resend (21712(c)) | In person, email, or first-class with certificate of mailing; an unanswered email notice of sale must be re-sent by first-class mail (83.806(1)) | Preliminary: first-class mail or email by express agreement; final: personal service, verified mail, or email, re-sent by verified mail if there is no reply or receipt (19.150.040, .060) |
| **Notice of sale** | After the lien attaches; sale not less than 14 days after mailing; occupant may return a declaration in opposition, which forces a court action (21705, 21710) | The same notice states the time and place of sale | Final notice; sale at least 14 days after it and at least 42 days after rent first went unpaid (19.150.060) |
| **Advertisement** | Twice in a newspaper, or once in a newspaper and once online for 7 days before the sale (21707) | Once a week for 2 consecutive weeks in a newspaper; sale at least 15 days after first publication (83.806(4)) | Not required by the chapter; advertising is a recoverable cost of sale (19.150.010) |
| **Sale** | "Commercially reasonable," expressly including an online auction site (21707(b)) | Commercially reasonable; may be on a public auction website, no auctioneer license needed (83.806(4)–(5)) | Commercially reasonable public sale; property under $300 may be disposed of; owner and staff may not buy (19.150.080) |
| **Surplus** | Held for 1 year, then paid to the county treasury (21707(b)) | Held for the tenant; deemed abandoned after 2 years (83.806(8)) | Held for 6 months, then to the state as unclaimed property (19.150.080) |
| **Vehicles and boats** | Enforced under the Civil Code and Harbors and Navigation Code lien sale processes, with titled lienholders taking priority; may tow after 60 days with 10 days' notice (21702.5) | May sell or tow after 60 days unpaid (83.806(10)) | May tow after 60 or more days in default, with notice (19.150.160) |

Texas adds its own clock: after delivering notice of the claim, the owner may sell only if the tenant hasn't paid by the 14th day, and then not until the 15th day after the sale notice is first published, or the 10th day after it is posted (Texas Property Code 59.042).

What the table means for the system:

- **Timelines are computed, per agreement, from the rules in force** ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix) keeps them as effective-dated rows). "Day 14" in California counts from when rent went unpaid; Florida's 14 days run from delivery of the notice; Washington's sale date is the later of two dates. Each case stores the rule version it ran under and every deadline it computed, so that a sale in March can be checked against the law that applied when the notice went out ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). Statutes change often here: California's chapter carries amendments effective in 2023, 2025 and 2026.
- **Delivery methods are not interchangeable.** Certified mail (a USPS service with a signature), first-class mail with a certificate of mailing (proof of mailing, not of receipt), "verified mail" (Washington's term for any USPS method "that provides evidence of mailing"), email with signed consent, and personal delivery are distinct channels with distinct evidence, and the rule says which are allowed for which notice. Email is allowed only under conditions (consent in the agreement, a designated sender, proof of receipt, a fallback by mail), so the notice record holds the delivery evidence and the fallback it triggered. Notices go through the [one outbound gate](/docs/architecture/notifications#one-outbound-gate) with the consent ledger behind it, and mailed notices are usually printed and mailed by a vendor whose tracking number comes back into the record.
- **The alternate contact is load-bearing.** In California and Washington, an agreement that didn't request an alternate address means the lien doesn't attach at all, and notices must go to both addresses. That is a required field in the move-in flow, not an optional profile field.
- **Advertisement is a vendor step with proof.** A newspaper's affidavit of publication or the online listing's dates are the evidence that the sale was advertised as required.
- **The sale is usually online now.** California and Florida expressly allow online sales, and auction sites (StorageTreasures, Lockerfox, the vendors' own) carry the listing, photos, bidding and buyer payment. Storable says its winning bidder "cleans out the unit within 72 hours"; Lockerfox charges buyers a 15% premium. The platform records the sale, the winning bid, the costs and what was applied to the lien.
- **Redemption stops everything.** Florida lets the tenant pay the lien and reasonable expenses at any time before the sale and recover the property (83.806(6)); California lets the occupant regain the space by paying the full lien amount before the sale date, and lets a secured creditor or claimant pay to stop the sale (21705, 21708, 21709). A payment that arrives after the listing goes live has to cancel the auction, restore access and remove the overlock, and the system must make that one atomic outcome, not three tasks.
- **Surplus is someone else's money.** The excess of the sale over the lien and costs belongs to the occupant (or a senior lienholder), is held for a statutory period, and then goes to a county, the state's unclaimed property program, or is deemed abandoned, depending on the state. It's a liability in the trust ledger from the day of the sale ([Unclaimed Property](/books/property-tech/trust-accounting#unclaimed-property)).
- **Small-value and abandoned property have their own paths.** Washington and California allow disposal instead of sale when the contents are worth under $300 (RCW 19.150.080; BPC 21712.8 for property left after an agreement ends), and Washington lets the occupant reclaim personal papers and photographs for six months after a sale before they may be disposed of.

### Military Occupants

The federal Servicemembers Civil Relief Act overrides the state process for anyone in military service. Under 50 U.S.C. 3958, a person holding a lien on a servicemember's property "for storage, repair, or cleaning" may not foreclose or enforce it during the period of military service and for 90 days after, without a court order; the court may stay the proceeding or adjust the obligation, and a knowing violation is a federal crime punishable by up to a year in prison. The practical consequence: before a lien case passes the point of no return (advertising or sale), the platform checks the occupant's military status, records the result and its source, and a positive result moves the case to a court-order path or a hold, never to the auction. Florida's requirement that the agreement ask about uniformed service status puts the first data point into the record at move-in.

### Vehicles and Boats

A car, boat, RV or trailer in a parking space or a unit is titled property, and titled property has lienholders on record. California makes the vehicle or vessel lender's lien senior to the storage lien and routes the sale through the general vehicle and vessel lien sale processes rather than the storage act, and caps the storage charges that can be included; Florida and Washington let the owner tow instead after 60 days. The data the case needs (VIN or hull number, plate and state, the titled owner and lienholder) is collected at move-in for vehicle spaces, because finding it after default is slower and sometimes impossible. Washington's rule that the agreement require the occupant to disclose lienholders and secured parties generalizes: record them at move-in, and notify them as the rule says.

## Protection Plans, Tenant Insurance and Value Limits

Storage operators sell coverage for the stored goods in two legally different forms, and the difference is the whole design:

- **Tenant insurance.** A policy issued by a licensed insurer, sold at the counter or online. The large operators reinsure it themselves: Public Storage's tenants "have the option of purchasing insurance from a non-affiliated insurance company," a wholly owned subsidiary "fully reinsures these policies" and receives reinsurance premiums "substantially equal to the premiums collected from our tenants," with coverage up to $5,000 per storage unit; Extra Space describes the same structure, with a wholly owned subsidiary that "fully reinsures such policies and thereby assumes all risk of losses." Both say their insurance activities are subject to state insurance laws. California has a licensing article for self-service storage agents selling coverage on behalf of insurers (Insurance Code Article 16.3, described in *Heckart*).
- **Protection plan.** The operator itself agrees, for a monthly fee, to bear losses to the stored goods up to a limit, as a term of the rental agreement, with no insurer. Whether that is unlicensed insurance depends on the state. The California Supreme Court held in *Heckart v. A-1 Self Storage* (April 23, 2018) that a plan charging $10 a month to have the operator retain liability up to $2,500, on a unit renting for $55, was not insurance subject to the Insurance Code, because the indemnity was incidental to the principal purpose of renting space. New York's Insurance Department concluded in 2004 that a storage owner that isn't an authorized insurer may not offer a fee-based "warranty" paying for losses from fortuitous events such as fire or theft, though it may charge for assuming its own legal liability, and must say in advertising that the plan is not insurance.

Two related contract terms appear in nearly every agreement. **The occupant insures.** Washington's act says the occupant is responsible for insuring stored property against fire, theft or damage, and the owner has no obligation to provide insurance (RCW 19.150.130). **The value limit.** Agreements commonly cap the value of property that may be stored; California preserves "the right to limit the value of the property the occupant may store" (BPC 21713), Florida makes the agreement's limit the maximum value of the property in the space (83.806(9)), and Washington says the limit caps only the owner's liability (RCW 19.150.170).

Most operators require one of the three at move-in (their plan, their insurance, or proof of the occupant's own policy), and Storable reports that operators using its default enrollment options see a 65% enrollment rate. The platform therefore needs a coverage catalog where each product carries its legal form, the states it may be sold in, its limit and price; an enrollment per agreement over time; the evidence for an occupant's own policy; and a rule that a product whose form is insurance in a state is offered there only through a licensed insurer and licensed sellers. Claims for protection plans are paid by the operator and need their own record; insurance claims go to the insurer. [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#verification-and-lapse) covers the general insurance-verification and master-policy model for housing; storage is the segment where the operator most often is, through reinsurance or a plan, the risk carrier.

## Fees, Late Charges and Ancillary Retail

Storage statutes cap late fees with formulas that are easy to encode and easy to get wrong. California allows a late fee only after rent is unpaid for at least 10 days, one per missed payment, stated in the agreement, and deems reasonable $10 for monthly rent of $60 or less, $15 for rent between $60 and $100, and the greater of $20 or 15% at $100 and above (BPC 21713.5). Florida deems reasonable the greater of $20 or 20% of monthly rent and also allows a reasonable fee for lien enforcement expenses (83.808(3)); Washington uses the same greater-of-$20-or-20% test, once per month (RCW 19.150.150). These are rule rows per jurisdiction, effective-dated, evaluated when the late fee posts.

Ancillary retail is a small store at the counter: locks, cardboard boxes, tape, moving supplies. Public Storage's merchandise sales are "primarily consisting of locks and cardboard boxes." Retail sales differ from rent in three ways the system has to carry: a buyer may not be an occupant at all (a walk-in buying boxes), the items are tangible goods taxed as retail sales where the store is, and inventory has to be counted. Whether the storage rental itself is taxable also varies by state. A tax code per item and per charge code, resolved by the facility's location, is the model in [Sales Tax](/docs/payments/sales-tax#taxability-varies-by-place).

## How to Build It

The deltas below extend [the core data model](/books/property-tech/property-business#the-core-data-model). A facility is a `properties` row of type `self_storage`, each rentable space is a `units` row of kind `storage_unit`, and each rental agreement is a `leases` row with `ends_on` null:

```sql
CREATE TABLE storage_unit_types (        -- what a customer chooses and the price is set for
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  category         TEXT NOT NULL CHECK (category IN ('unit', 'locker', 'vehicle_parking')),
  width_in         INT NOT NULL CHECK (width_in > 0),   -- inches; sizes are quoted in feet
  depth_in         INT NOT NULL CHECK (depth_in > 0),
  height_in        INT,
  climate          TEXT NOT NULL CHECK (climate IN ('none', 'heated', 'climate_controlled')),
  access           TEXT NOT NULL CHECK (access IN ('interior', 'drive_up', 'outdoor',
                     'covered', 'enclosed')),
  floor_level      INT,
  has_power        BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (tenant_id, property_id, category, width_in, depth_in, climate, access, floor_level)
);

ALTER TABLE units                        -- a unit can be resized; history lives in the audit trail
  ADD COLUMN storage_unit_type_id UUID REFERENCES storage_unit_types (id),
  ADD COLUMN has_smart_lock       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD CONSTRAINT units_storage_type CHECK ((kind = 'storage_unit') = (storage_unit_type_id IS NOT NULL));

CREATE TABLE street_rates (              -- the move-in price of a unit type, over time
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  storage_unit_type_id UUID NOT NULL REFERENCES storage_unit_types (id),
  amount               BIGINT NOT NULL CHECK (amount > 0),   -- monthly, minor units
  currency             CHAR(3) NOT NULL,
  valid_during         TSTZRANGE NOT NULL,
  source               TEXT NOT NULL CHECK (source IN ('manual', 'revenue_management')),
  EXCLUDE USING GIST (storage_unit_type_id WITH =, valid_during WITH &&)
);

-- leases.agreement_kind (added in Commercial Property) says which body of law governs the
-- agreement; a storage agreement is 'storage_rental'.

CREATE UNIQUE INDEX leases_one_open_storage_rental  -- no pre-leasing: one open agreement per unit
  ON leases (unit_id)
  WHERE agreement_kind = 'storage_rental'
    AND status IN ('out_for_signature', 'signed', 'current', 'notice_given');

CREATE TABLE storage_agreement_terms (    -- what the storage act requires the agreement to capture
  lease_id                  UUID PRIMARY KEY REFERENCES leases (id),
  tenant_id                 UUID NOT NULL,
  alternate_contact_name    TEXT,
  alternate_contact_address TEXT,         -- mailing address, per the addresses doc
  alternate_contact_email   TEXT,
  email_notice_consent_at   TIMESTAMPTZ,  -- the signed line consenting to lien notices by email
  declared_uniformed_service BOOLEAN,     -- the answer at move-in, where the statute asks
  value_limit               BIGINT,       -- the agreement's cap on stored value, minor units
  currency                  CHAR(3) NOT NULL,
  move_in_rate              BIGINT NOT NULL,   -- the in-place rate at signing
  disclosed_max_rate_12m    BIGINT,       -- the most the rate can reach in 12 months, if disclosed
  promotion_code            TEXT,
  promotion_ends_on         DATE
);

CREATE TABLE storage_reservations (      -- a hold on a unit or a unit type until move-in or expiry
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  storage_unit_type_id UUID NOT NULL REFERENCES storage_unit_types (id),
  unit_id              UUID REFERENCES units (id),           -- null: holds a count of the type
  person_id            UUID NOT NULL REFERENCES people (id),
  quoted_rate          BIGINT NOT NULL,
  currency             CHAR(3) NOT NULL,
  held_during          TSTZRANGE NOT NULL,                  -- ends at expiry
  status               TEXT NOT NULL CHECK (status IN ('held', 'converted', 'expired',
                         'cancelled')),
  lease_id             UUID REFERENCES leases (id),          -- set when converted
  source               TEXT NOT NULL,                        -- website, marketplace, kiosk, phone
  EXCLUDE USING GIST (unit_id WITH =, held_during WITH &&)
    WHERE (unit_id IS NOT NULL AND status = 'held')
);

CREATE TABLE rate_change_notices (       -- an existing-customer rate increase, from proposal to effect
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lease_id            UUID NOT NULL REFERENCES leases (id),
  current_amount      BIGINT NOT NULL,
  new_amount          BIGINT NOT NULL,
  currency            CHAR(3) NOT NULL,
  rule_evaluation_id  UUID NOT NULL REFERENCES rule_evaluations (id),     -- notice period, caps and emergency orders applied
  notice_delivered_on DATE,
  effective_on        DATE,              -- computed from delivery and the rule
  status              TEXT NOT NULL CHECK (status IN ('proposed', 'blocked', 'sent', 'applied',
                        'cancelled')),
  blocked_reason      TEXT,              -- over disclosed max, emergency cap, notice not delivered
  new_schedule_id     UUID REFERENCES lease_charge_schedules (id),   -- set when applied
  CHECK (status <> 'blocked' OR blocked_reason IS NOT NULL)
);

-- Gate codes and mobile keys are rows in access_credentials (Access & Smart Buildings):
-- purpose 'lease', kind 'pin', 'mobile' or 'fob', the occupant or an authorized user as
-- holder_person_id, and the access system's ID in external_id, never the code itself.

CREATE TABLE access_states (             -- what the gate should do for this agreement, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  lease_id     UUID NOT NULL REFERENCES leases (id),
  state        TEXT NOT NULL CHECK (state IN ('active', 'suspended_delinquent', 'lien_denied',
                 'ended')),
  valid_during TSTZRANGE NOT NULL,
  reason       TEXT NOT NULL,
  rule_evaluation_id UUID REFERENCES rule_evaluations (id),                  -- the rule that allowed a suspension, if any
  synced_at    TIMESTAMPTZ,              -- when the access system confirmed it
  EXCLUDE USING GIST (lease_id WITH =, valid_during WITH &&)
);

CREATE TABLE overlocks (                 -- the physical lock on the door, with evidence
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  unit_id     UUID NOT NULL REFERENCES units (id),
  lease_id    UUID REFERENCES leases (id),
  reason      TEXT NOT NULL CHECK (reason IN ('delinquent', 'lien', 'vacated_lock_left',
                'investigation')),
  applied_at  TIMESTAMPTZ NOT NULL,
  removed_at  TIMESTAMPTZ,
  method      TEXT NOT NULL CHECK (method IN ('physical', 'smart_lock')),
  photo_ids   UUID[]
);

CREATE TABLE stored_vehicles (           -- titled property in a space: lienholders get notices
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  lease_id         UUID NOT NULL REFERENCES leases (id),
  kind             TEXT NOT NULL CHECK (kind IN ('car', 'truck', 'rv', 'boat', 'trailer', 'other')),
  vin_or_hull_id   TEXT,
  plate            TEXT,
  plate_subdivision TEXT,                -- ISO 3166-2 of the registering state
  lienholder_name  TEXT,
  lienholder_address TEXT
);

CREATE TABLE lien_cases (                -- one delinquency taken through the state process
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  property_id        UUID NOT NULL REFERENCES properties (id),
  lease_id           UUID NOT NULL REFERENCES leases (id),
  rule_evaluation_id UUID NOT NULL REFERENCES rule_evaluations (id),      -- the jurisdiction's lien rules as of the case's start
  path               TEXT NOT NULL CHECK (path IN ('contents_sale', 'vehicle_lien_sale',
                       'tow', 'small_value_disposal')),
  status             TEXT NOT NULL CHECK (status IN ('open', 'notice_period', 'lien_attached',
                       'advertised', 'listed', 'sold', 'redeemed', 'disposed', 'military_hold',
                       'disputed', 'cancelled')),
  default_on         DATE NOT NULL,      -- the first unpaid due date
  lien_attaches_on   DATE,               -- computed
  earliest_sale_on   DATE,               -- computed; the sale is blocked before it
  military_checked_at TIMESTAMPTZ,       -- required before 'advertised'
  military_result    TEXT CHECK (military_result IN ('not_in_service', 'in_service', 'unknown')),
  military_source    TEXT,
  closed_on          DATE,
  CHECK (status NOT IN ('advertised', 'listed', 'sold') OR military_result = 'not_in_service')
);

CREATE UNIQUE INDEX lien_cases_one_open ON lien_cases (lease_id)
  WHERE status NOT IN ('sold', 'redeemed', 'disposed', 'cancelled');

CREATE TABLE lien_notices (              -- every notice, ad and fallback, with its evidence
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  lien_case_id     UUID NOT NULL REFERENCES lien_cases (id),
  notice_type      TEXT NOT NULL CHECK (notice_type IN ('preliminary', 'notice_of_sale',
                     'final', 'advertisement', 'tow', 'lienholder', 'surplus')),
  recipient        TEXT NOT NULL CHECK (recipient IN ('occupant', 'alternate_contact',
                     'lienholder', 'public')),
  channel          TEXT NOT NULL CHECK (channel IN ('certified_mail', 'first_class_certificate',
                     'verified_mail', 'email', 'personal_delivery', 'posting', 'newspaper',
                     'website')),
  document_id      UUID NOT NULL,        -- the rendered notice as sent
  sent_at          TIMESTAMPTZ NOT NULL,
  evidence_ref     TEXT,                 -- tracking number, certificate, affidavit, read receipt
  delivered_at     TIMESTAMPTZ,          -- when proof of delivery or receipt arrived
  fallback_of_id   UUID REFERENCES lien_notices (id),   -- the email this mailing replaced
  deadline_on      DATE                  -- the date this notice gives, computed from the rule
);

CREATE TABLE lien_sales (                -- the auction and its money
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  lien_case_id    UUID NOT NULL UNIQUE REFERENCES lien_cases (id),
  venue           TEXT NOT NULL CHECK (venue IN ('online', 'in_person')),
  platform        TEXT,                  -- the auction site, if online
  listing_ref     TEXT,
  sold_at         TIMESTAMPTZ NOT NULL,
  gross_proceeds  BIGINT NOT NULL CHECK (gross_proceeds >= 0),
  costs_of_sale   BIGINT NOT NULL CHECK (costs_of_sale >= 0),
  applied_to_lien BIGINT NOT NULL CHECK (applied_to_lien >= 0),
  surplus         BIGINT GENERATED ALWAYS AS (gross_proceeds - costs_of_sale - applied_to_lien)
                    STORED,
  currency        CHAR(3) NOT NULL,
  cleanout_due_at TIMESTAMPTZ,
  cleaned_out_at  TIMESTAMPTZ,
  CHECK (gross_proceeds >= costs_of_sale + applied_to_lien)
);

CREATE TABLE surplus_proceeds (          -- the occupant's money after a sale, until claimed or remitted
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lien_sale_id   UUID NOT NULL UNIQUE REFERENCES lien_sales (id),
  amount         BIGINT NOT NULL CHECK (amount > 0),
  currency       CHAR(3) NOT NULL,
  claim_until    DATE NOT NULL,          -- computed: 6 months, 1 year, 2 years by state
  destination    TEXT NOT NULL CHECK (destination IN ('county', 'state_unclaimed_property',
                   'deemed_abandoned', 'senior_lienholder')),
  status         TEXT NOT NULL CHECK (status IN ('held', 'claimed', 'remitted', 'abandoned')),
  disposed_at    TIMESTAMPTZ,
  payee          TEXT                    -- the claimant or the agency paid
);

CREATE TABLE coverage_products (         -- protection plans and insurance, by legal form
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  legal_form      TEXT NOT NULL CHECK (legal_form IN ('protection_plan', 'insurance')),
  insurer_name    TEXT,                  -- required for insurance
  name            TEXT NOT NULL,
  coverage_limit  BIGINT NOT NULL,
  monthly_price   BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL,
  subdivisions    TEXT[] NOT NULL,       -- ISO 3166-2 where this form may be sold
  valid_during    DATERANGE NOT NULL,
  CHECK (legal_form <> 'insurance' OR insurer_name IS NOT NULL)
);

CREATE TABLE coverage_enrollments (      -- which coverage an agreement carried, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  lease_id            UUID NOT NULL REFERENCES leases (id),
  coverage_product_id UUID REFERENCES coverage_products (id),  -- null: the occupant's own policy
  own_policy_doc_id   UUID,              -- proof of the occupant's own policy
  enrolled_by         TEXT NOT NULL CHECK (enrolled_by IN ('occupant_choice', 'default',
                        'staff')),
  schedule_id         UUID REFERENCES lease_charge_schedules (id),
  valid_during        DATERANGE NOT NULL,
  CHECK ((coverage_product_id IS NULL) = (own_policy_doc_id IS NOT NULL)),
  EXCLUDE USING GIST (lease_id WITH =, valid_during WITH &&)
);

CREATE TABLE retail_items (              -- locks, boxes, tape
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  sku       TEXT NOT NULL,
  name      TEXT NOT NULL,
  tax_code  TEXT NOT NULL,               -- resolved by the facility's location
  price     BIGINT NOT NULL,
  currency  CHAR(3) NOT NULL,
  UNIQUE (tenant_id, sku)
);

CREATE TABLE retail_sales (              -- a counter or online sale, occupant or not
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties (id),
  lease_id    UUID REFERENCES leases (id),         -- null for a walk-in
  payment_id  UUID REFERENCES payments (id),
  subtotal    BIGINT NOT NULL,
  tax         BIGINT NOT NULL,
  currency    CHAR(3) NOT NULL,
  sold_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE retail_sale_lines (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  retail_sale_id UUID NOT NULL REFERENCES retail_sales (id),
  retail_item_id UUID NOT NULL REFERENCES retail_items (id),
  quantity       INT NOT NULL CHECK (quantity > 0),
  unit_price     BIGINT NOT NULL,
  tax            BIGINT NOT NULL
);
```

The lien rules themselves are `legal_rules` rows of type `storage_lien` per jurisdiction ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix)), effective-dated as [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions) describes: days to deny access, days to the first notice, the cure period and what it counts from, allowed channels per notice type and their conditions, advertisement modes and lead times, the earliest-sale formula, surplus hold period and destination, the vehicle threshold, the small-value threshold and the rate-change notice period (late fee caps are `late_fee_cap` rules, resolved for `agreement_kind = 'storage_rental'`). `rule_evaluation_id` on cases, notices, rate changes and access suspensions points at the evaluation, and through it the rule version, that decided.

Design decisions:

- **A storage agreement is a lease row with a different governing law.** Keeping it in `leases` reuses charge schedules, ledgers, payments and owner reporting unchanged, and `agreement_kind` is what tells the rules layer to resolve a self-storage act rather than landlord-tenant law, and the documents layer to say "occupant" and "owner." The same column lets commercial agreements opt out of residential rules.
- **Price at the type, rent the unit.** Street rates attach to `storage_unit_types` and change constantly; the in-place rate is the agreement's rent schedule; the gap is a query, not a column. A resized unit gets a new type, and the audit trail keeps the old one.
- **One open agreement per unit, enforced by the database.** Storage has no pre-leasing, so the partial unique index is safe and is the guard against two channels renting the same unit. Holds use an exclusion constraint on the unit's hold window, per [Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time).
- **A rate increase is a notice with a computed effective date,** blocked with a reason when it would exceed what was disclosed or what an emergency order allows, and applied by ending one rent schedule and starting another, never by editing an amount.
- **Access is desired state plus reconciliation.** `access_states` says what the gate should do; the integration confirms it and records `synced_at`; overlocks are separate physical records with photos.
- **A lien case is a state machine whose transitions are gated by computed dates and evidence.** It can't be advertised before `lien_attaches_on`, sold before `earliest_sale_on`, or advertised at all without a negative military check; a redemption payment moves it to `redeemed` in the same transaction that ends the suspension, removes the overlock task and cancels the listing.
- **Notices are records with evidence and fallbacks,** because a sale is only as valid as the proof that each notice went the way the statute allows.
- **Surplus is a liability with a clock,** carried in the trust ledger and remitted or released on the date the state's rule computes.
- **Coverage carries its legal form.** A product is either a plan or insurance, sold only where that form is allowed, and the enrollment history answers "was this unit covered on the night of the break-in."

## Auditing

The records that get asked about are the ones that let someone check a sale after the goods are gone:

- **The lien file.** Every notice as rendered, its channel, its proof of mailing or receipt, every fallback, the advertisement's affidavit or listing dates, the military status check and its source, the computed deadlines and the rule version, the overlock and its photos, the sale result, and the surplus disposition. Lien sale disputes and class actions are argued from this file, and Public Storage lists "consumer protection laws and regulations, including those related to lien sales" among its risks.
- **Rate history.** Every street rate by unit type over time, every in-place rate change with its notice and effective date, and the disclosed maximum, so an increase can be checked against what the occupant was told and the rules on the day.
- **Access.** Credentials issued and revoked, desired access state, confirmations from the gate system, and the gate's own entry log, which settles "I was locked out after I paid" and "nobody has entered that unit in a year."
- **Coverage.** Which product, of which legal form, covered each agreement on each date, who enrolled it (the occupant, a default, or staff), and the evidence of an occupant's own policy.
- **Retail and tax.** Each sale's lines, tax code and tax computed, reconciled to the sales tax return.

Retention for lien files should run at least as long as the limitations period for wrongful-sale claims plus the surplus claim window, longer than the account itself, which [Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type) treats as a per-record-type schedule. The mechanics are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Model the agreement as a lease row governed by a storage act,** with the occupant and owner vocabulary, month-to-month terms and an `agreement_kind` the rules layer reads.
- **Price unit types, rent units:** street rates effective-dated by type, in-place rates on the agreement, promotions as their own terms.
- **Treat rate increases as regulated notices,** checked against the disclosed maximum, notice periods and emergency caps before they're sent.
- **Make online move-in one atomic transaction** from hold to agreement to payment to access, with the database preventing a double rental.
- **Collect what the lien needs at move-in:** the alternate contact, email-notice consent, military status question, value limit and, for vehicle spaces, VIN and lienholder.
- **Run the lien process as a case with computed deadlines,** per-state rule versions, notices with delivery evidence and fallbacks, and transitions that can't skip a step.
- **Check military status before advertising** and route servicemembers to a court-order path or a hold, never to the auction.
- **Treat redemption as one outcome:** paid, access restored, overlock removed, listing cancelled.
- **Hold surplus as a liability** with the state's claim window and destination.
- **Keep access as desired state reconciled with the gate,** and credentials out of plain text.
- **Record each coverage product's legal form** and sell it only where that form is lawful.
- **Tax retail by item and place,** and allow sales to people who aren't occupants.

## References

**Statutes and regulation**

- [California Business and Professions Code, Division 8, Chapter 10 (Self-Service Storage Facility Act, 21700–21716)](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=8.&title=&part=&chapter=10.&article=), occupant and owner definitions, no residential use, lien scope, preliminary lien notice at 14 days, delivery methods and email consent and proof of receipt, notice of lien sale and declaration in opposition, advertisement options, online sale as commercially reasonable, surplus to the county after one year, vehicles and vessels, value limits, late fee schedule, 30-day notice to change terms, first-page rate disclosures from 2026, $300 disposal threshold
- [Florida Statutes 83.803, Definitions](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0000-0099/0083/Sections/0083.803.html), tenant and owner, no residential use, last known address by email
- [Florida Statutes 83.8055, Withholding access](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0000-0099/0083/Sections/0083.8055.html), denial of access 5 days after rent is due without notice
- [Florida Statutes 83.806, Enforcement of lien](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0000-0099/0083/Sections/0083.806.html), notice delivery and email fallback, 14-day demand, newspaper advertisement and 15-day rule, online sale without an auctioneer license, redemption, surplus deemed abandoned after 2 years, value limit, vehicles and watercraft after 60 days
- [Florida Statutes 83.808, Contracts](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0000-0099/0083/Sections/0083.808.html), uniformed services question in the agreement, late fee of $20 or 20%, lien enforcement fees
- [Revised Code of Washington, Chapter 19.150](https://app.leg.wa.gov/RCW/default.aspx?cite=19.150&full=true), verified mail definition, denial of access after 6 days, preliminary and final notices, 42-day minimum, $300 disposal, surplus to unclaimed property after 6 months, lienholder disclosure, occupant insures, late fees, vehicles after 60 days, value limit caps owner liability
- [Texas Property Code 59.042 (Public.Law)](https://texas.public.law/statutes/tex._prop._code_section_59.042), 14 days after notice of claim, sale after the 15th day from publication or 10th from posting
- [50 U.S.C. 3958, Enforcement of storage liens (LII)](https://www.law.cornell.edu/uscode/text/50/3958), no enforcement during military service and 90 days after without a court order, stays, criminal penalty
- [New York Insurance Department, OGC Opinion 04-04-24](https://www.dfs.ny.gov/insurance/ogco2004/rg040424.htm), a storage owner's fee-based loss warranty is insurance business; assuming its own legal liability is allowed with a not-insurance disclosure
- [Heckart v. A-1 Self Storage, Inc. (Cal. Supreme Court, S232322, April 23, 2018), via SCOCAL](https://scocal.stanford.edu/opinion/heckart-v-1-self-storage-34578), $10 per month plan up to $2,500 on a $55 unit held not insurance under the principal object and purpose test; Insurance Code Article 16.3 storage agents

**Filings**

- [Public Storage, Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1393311/000162828026007696/psa-20251231.htm), month-to-month leases, rate increases to long-term tenants, move-in versus move-out contract rent per square foot, promotional discounts, eRental share of new rentals, tenant reinsurance structure and $5,000 limit, merchandise of locks and boxes, lien sale and emergency rent regulation, occupancy
- [Extra Space Storage, Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1289490/000128949026000011/exr-20251231.htm), nearly all leases month to month, pricing and discount tools, tenant reinsurance through a wholly owned subsidiary, regulation of insurance, rent increases and lien sales, occupancy

**Vendors**

- [Storable](https://www.storable.com/), Edge, Sitelink, Storable Easy, access, auctions, insurance, marketplace, payment processing standard
- [Storable: Access Control](https://www.storable.com/products/access-control/), gate codes from the software, third-party gate providers, automatic lockout with payment link on Edge, logs
- [Storable: Auctions](https://www.storable.com/products/auctions/), online listings, photos, 72-hour cleanout
- [Storable: Insurance](https://www.storable.com/products/insurance-solutions/), tenant insurance integrated with management software, default enrollment and 65% enrollment rate
- [Storable: Edge](https://www.storable.com/products/edge/), collections and corporate tools for multi-facility operators
- [Storable: Sitelink](https://www.storable.com/products/sitelink/), electronic leases, payments and reports on myHub
- [Storable Easy](https://www.storageunitsoftware.com/), 24/7 online rentals and payments, remote access control and lockouts
- [Yardi Breeze: Self Storage features](https://www.yardibreeze.com/self-storage-features/), online reservations and leases, auctions, retail items, stored goods protection plan, pricing on request
- [apis.io: Yardi](https://apis.io/providers/yardi/), Store Web Services API (SWS2), formerly Centershift, SOAP with tokenized authentication
- [Rent Manager: Self Storage](https://www.rentmanager.com/self-storage/), dashboard, online payments, API and 160+ integrations
- [RealPage: Self-Storage Marketing](https://www.realpage.com/self-storage-marketing/), websites, ads, call scoring, reputation, 170+ brands, PMS integrations
- [Tenant Inc.: integration with StorageTreasures (December 10, 2025)](https://www.tenantinc.com/blog/tenant-inc-announces-integration-with-storagetreasures), Hummingbird lien workflows to auction listings, Mobile Manager overlocks and photos
- [OpenTech Alliance](https://www.opentechalliance.com/), INSOMNIAC kiosks and access control, call center, StorageTreasures auctions
- [StorageTreasures](https://www.storagetreasures.com/), online storage auctions operated by OpenTech Alliance
- [Lockerfox](https://www.lockerfox.com/), online storage auctions, 15% buyer's premium with $10 minimum
- [Janus: Nokē Smart Entry](https://januseurope.com/noke/), smartphone access to gate and units, automated overlocking and release, 300 events per controller
- [Modern Storage Media: Janus releases Nokē Infinitē (April 6, 2026)](https://www.modernstoragemedia.com/news/janus-releases-nokē-infinitē-a-bluetooth-nfc-wireless-smart-lock), Bluetooth and NFC lock, shipping in the third quarter of 2026
