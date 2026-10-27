+++
title = "Short-Term Rentals"
description = "Nightly stays instead of leases: channels and calendar sync, double-booking, nightly pricing, turnovers, owner nights, lodging taxes, and city registration."
category = "Property Tech Industry"
order = 1731
part = "Other Property Types"
tags = ["property-tech", "short-term-rentals", "vacation-rentals", "channel-management", "lodging-tax", "reservations"]
+++

A short-term rental sells a house, a condo or a room by the night. The guest books through Airbnb, Vrbo, Booking.com or the operator's own website, arrives on a Friday afternoon, leaves on Sunday morning, and a cleaner has until the next guest's check-in at four to turn the place over. The operator is a host renting their own home, an investor with a few condos, or a vacation-rental management company running hundreds of homes for owners who keep some weeks for themselves. Everything that a multifamily platform builds around a twelve-month lease (screening, a deposit governed by landlord-tenant law, rent posted on the first, renewals) collapses into a few days, and something different takes its place: inventory sold on several marketplaces at once, a price for every night, a cleaning between every stay, taxes that look like a hotel's, and a city permit that decides whether the unit may be rented at all.

The model differs from the multifamily core in three places. **The contract is a stay, not a lease:** a reservation of a unit for a range of nights, held and then confirmed, with the guest a `person` but never a leaseholder, and a different body of law. **Availability is the product:** one calendar per unit has to be the only source of truth while several channels sell the same nights, which makes double-booking the central engineering problem. **The rules come from the hotel side of the code book:** lodging taxes, transient occupancy definitions and short-term rental ordinances, many of them enforced by making the booking platform check the operator's registration. This chapter covers those differences and extends [the core data model](/books/property-tech/property-business#the-core-data-model) with stays, channel listings, rates, lodging tax lines, registrations and turnovers.

## How the Platforms Do It

Short-term rental software is a separate market from multifamily, with its own leaders, and [The Software Landscape](/books/property-tech/software-landscape#specialists-by-segment) lists it among the segments with specialists. The products split into property management systems with a built-in channel manager, enterprise vacation-rental suites with trust accounting, pricing tools that sit on top of either, and a multifamily vendor's vacation edition:

| Product | Who it's for | What it says it does |
| --- | --- | --- |
| **Escapia** | Vacation rental managers in the Expedia Group ecosystem | Trust accounting where Vrbo revenue, fees and taxes flow into the ledger; owner statements split for shared ownership or consolidated across an owner's homes; automated month-end close; owner portal |
| **Guesty** | Hosts with 1 to 3 listings (Lite) up to enterprises with 200 or more | A property management system and channel manager that syncs "availability and pricing in real-time" across Airbnb, Vrbo, Booking.com and more than 60 channels; unified inbox; task management for cleaners; owners portal and trust accounting; dynamic pricing; direct booking websites; its own payments; damage protection coverage |
| **Hostaway** | Hosts and managers | Channel manager with a "Direct API Connection" to Airbnb, Vrbo, Booking.com, Google and Expedia; multi-calendar; unified inbox; owner statements with templates, an owner portal and automated delivery; direct booking site builder |
| **OwnerRez** | Owners and managers | Direct partnerships with the major channels, no percentage-of-revenue pricing, commission calculation and monthly owner statements, direct booking |
| **PriceLabs, Wheelhouse, Beyond** | Any of the above | Nightly pricing tools: PriceLabs recalculates prices and minimum stays daily and syncs them to Airbnb, Vrbo and more than 160 property management systems; Wheelhouse mixes rule-based and data-driven strategies with comp sets; Beyond sells dynamic pricing, market data and owner-facing projections |
| **Rent Manager** (vacation homes) | Operators running long- and short-term units in one system | A short-term rental dashboard with arrivals, departures and availability; nightly reservations; a check-ins register; guest charges; a make-ready board for turns |
| **Streamline** | Vacation rental managers | Trust accounting that tracks owner money, advance payments and taxes; owners and vendors paid by ACH or check; 1099 and 1042 year-end filing |
| **Track** | Vacation rental, hotel and resort operators | A core property management system with "native, dual-ledger-based trust accounting," housekeeping and maintenance automation, distribution to the major online travel agencies, a reservations contact center, payments with owner payouts and reconciliation, and APIs |

The channels publish their side. Airbnb's developer site describes a Homes API for listings, "real-time availability checks during booking," and reservations, with a sandbox for partners. Booking.com's connectivity portal offers a Rates & Availability API, a Content API and a Promotions API, says individual properties connect only through a channel manager, and, as of October 2026, says it is "pausing integrations with new connectivity providers until further notice." Airbnb and Vrbo also offer iCal calendar feeds for operators without an API connection.

Four patterns recur, and they shape the rest of this chapter:

- **The property management system owns the calendar; channels are distribution.** Every vendor above positions its channel manager as the place availability and price are set, pushed out to the channels, with reservations flowing back.
- **API connections replace iCal where they can.** Vendors lead with direct API connections; iCal is the fallback for channels or accounts without one.
- **Trust accounting is the enterprise dividing line.** The products built for managers with owners (Track, Streamline, Escapia, Guesty's higher tiers) lead with trust accounting and owner statements, because the manager holds guests' money for owners, exactly as [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#whose-money-it-is) describes for long-term rentals.
- **Pricing is a separate market.** Dedicated pricing tools write prices and minimum stays into the property management system or the channel daily; the system of record stores what was set and by whom.

## Stays Are Not Leases

A stay is a reservation: a unit, a range of nights, a party of guests, a price for the whole stay, and a cancellation policy. It has no term in the landlord-tenant sense, no renewal, no notice to vacate. The legal line between a guest and a tenant is drawn by state law, and the systems need to know where.

California's Civil Code excludes from its hiring-of-real-property chapter "transient occupancy in a hotel, motel, residence club, or other facility when the transient occupancy is or would be subject to tax under Section 7280 of the Revenue and Taxation Code," the section that lets cities levy a transient occupancy tax. The state's Department of Real Estate summarizes the result: an occupant of a hotel or motel for 30 days or less whose occupancy is subject to the hotel tax is a guest, not a tenant, while lodgers and hotel residents "living in these locations for more than 30 days" generally have the same rights as tenants. Section 1940.1 forbids a residential hotel from making a guest check out and re-register before 30 days to keep them transient, with a $500 civil penalty. Texas draws the tax line at the same place: its hotel occupancy tax applies to houses and apartments rented for less than 30 consecutive days, and a guest who stays at least 30 consecutive days becomes an exempt permanent resident. New Orleans defines a short-term rental as occupancy "for a period of less than thirty consecutive days," and New York City's registration law exempts rentals of 30 consecutive days or more.

Thirty days is a common line but not a universal one, and the tax threshold and the tenancy threshold in a given place can differ. The system consequences:

- **The threshold is a rule per jurisdiction,** stored with an effective date like any other ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)), not a constant in code. A stay is checked against it when it's booked and every time it's extended.
- **A long stay is a different product.** Operators offering monthly or "mid-term" stays cross into tenancy and need a lease, with the deposit, notice and eviction rules that come with it. My rule: a stay that reaches the tenancy threshold for its jurisdiction stops being editable as a stay; the system flags it, and continuing means a lease ([The Lease](/books/property-tech/the-lease); [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix)).
- **Extensions aren't free edits.** Two back-to-back stays for the same guest can add up to a tenancy, which is exactly what California's re-registration rule targets. Measure continuous occupancy by guest and unit, not by reservation.

Because a stay is short, everything about it is compressed. The money is collected before arrival (by the channel or the operator), the guest's identity and party size are set at booking, and the deposit, if any, is returned within days. The household concept from the core model doesn't apply: a stay has a booker and guests, and the same person booking twice is a repeat guest, matched across stays by [record linkage](/docs/architecture/record-linkage), not a household with a history.

## Channels, Listings and the Calendar

A unit is listed on several channels at once: online travel agencies (OTAs) such as Airbnb, Vrbo and Booking.com, the operator's direct booking site, sometimes Google and Expedia. Each listing is the channel's copy of the unit, with its own identifier, content, photos, fees and policies. A **channel manager** keeps those copies in step: it pushes availability, prices and restrictions out, and takes reservations, modifications and cancellations in. In most products the channel manager is part of the property management system; some operators run a separate one.

### API Connections and iCal

There are two ways to connect a listing to a channel, and the difference is the most important fact in this chapter.

**API connections** are partner integrations. The channel calls the system (or the system calls the channel) as things happen: a new reservation is delivered as a message, a price change is pushed, an availability check runs while the guest is booking. Access is gated: channels admit a limited set of software partners, and Booking.com, as of October 2026, isn't taking new ones.

**iCal** is a calendar feed: each side publishes a URL listing blocked dates, and each side polls the other's. It carries availability only (no prices, guest details or messages), and it's slow. Airbnb's calendar "automatically updates every 3 hours," with a manual refresh and a cap on how often it can ask other sites for updates; it imports up to two years of dates. Vrbo's owner app syncs imported calendars every 30 minutes, events can take up to 20 minutes to appear in its dashboard, it imports up to five calendars per property and shows imported events for the next 365 days, and calendar import isn't available to properties managed through third-party software. Airbnb notes that nights blocked elsewhere "may or may not be blocked" depending on its own preparation-time and advance-notice settings.

The lag is the double-booking window. If Airbnb sells Saturday night at 2:00 and Vrbo doesn't learn of it until its next poll, Vrbo can sell the same night in between. OwnerRez's guidance shows the second failure mode: "iCal must never run alongside a Vrbo channel integration connection," because two sync paths for the same listing fight each other, and channels can export abandoned checkouts as "ghost" bookings that block dates nobody bought, which is why it recommends importing bookings only.

My rules for connections:

- **One sync path per listing.** A listing is either API-connected or iCal-connected, recorded on the listing, and the system refuses to configure both.
- **Treat iCal as degraded.** Show the operator which listings rely on iCal, how stale each feed is, and the resulting exposure. Shorten the exposure with buffer rules (a minimum notice before arrival on iCal-only listings) rather than pretending the feed is real time.
- **Log every message in and out.** Every reservation delivered, every availability and rate push, every feed fetch, with the channel's identifier and a hash of the payload. When a guest and two channels disagree about who booked first, the message log is the only evidence.

### One Calendar, No Double Bookings

The calendar is a view over stays; it is not a separate grid of night cells that has to be kept in sync with them. A stay's nights are a closed-open date range from the arrival date to the departure date, so a stay ending Sunday and one starting Sunday don't collide, which is what allows a same-day turnover. Owner stays and maintenance blocks are stays of a different kind on the same calendar, so one rule covers everything that takes a night.

Overlap is prevented by the database, not by a check-then-insert in the application. [Preventing Double-Booking](/docs/architecture/reservations-and-holds#preventing-double-booking) explains why, and [Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time) gives the pattern this chapter uses: `EXCLUDE USING GIST (unit_id WITH =, stay_dates WITH &&)` over stays that are held or confirmed. Three flows write to it:

- **Direct booking checkout.** The guest picks dates on the operator's site; the system inserts a `held` stay with an expiry before taking payment, so two guests can't both reach the payment step for the same nights. The hold is released when payment fails or the timer runs out ([Hold Lifetimes Are Policy](/docs/architecture/reservations-and-holds#hold-lifetimes-are-policy)), and confirmation after payment is idempotent ([Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently)).
- **API-connected channels.** Where the channel asks for availability during its own checkout, the answer comes from the same constraint, and the reservation that follows confirms against it. Where the channel only delivers confirmed reservations, the system inserts them as `confirmed` and then pushes the closed nights to every other channel at once.
- **Concurrent confirmations.** An OTA reservation is a fact at the channel: the guest has a confirmation number and has paid. If it arrives for nights another stay already holds (an iCal lag, a slow push, two channels confirming in the same second), the insert fails with an exclusion violation, and the system can't simply reject it. It records the stay as `overbooked`, outside the constraint's predicate, and opens a case for a person to relocate or cancel one guest under the channel's rules. [Overbooking Is a Policy, Not a Bug](/docs/architecture/reservations-and-holds#overbooking-is-a-policy-not-a-bug) applies in reverse: the operator never chooses to overbook, but has to handle it when the channels do.

After any stay is confirmed, modified or cancelled, the availability change is written to an outbox in the same transaction and pushed to every connected channel ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). Pushes must be idempotent and ordered per listing, because a cancellation overtaken by an older "closed" push leaves nights blocked that should be for sale.

## Nightly Pricing

Long-term rents change once a year; short-term prices change daily. Every night has its own price, set by season, day of week, local events, how far away the night is, and how full the calendar is. Pricing tools set those prices automatically: PriceLabs says its prices and minimum stays "are recalculated daily and synced automatically," with date-specific overrides including orphan-day adjustments to fill short gaps between bookings and automatic last-minute and far-out adjustments; Wheelhouse offers more than 15 settings to adjust by day, event or season, and comp sets; Beyond sells dynamic pricing with two-way property management system integrations.

Around the nightly price sit the restrictions and adjustments that decide what a guest can actually book:

- **Minimum and maximum stay,** set per night or per arrival day. A two-night minimum on weekends and a seven-night minimum in peak season are common, and pricing tools change minimums dynamically, shortening them as a gap approaches.
- **Closed to arrival and closed to departure:** arrivals only on Saturdays in a market that turns over weekly, for example.
- **Gap or orphan nights:** a one-night hole between two stays that the minimum stay would otherwise make unsellable.
- **Length-of-stay discounts:** a percentage off for weekly or monthly stays, and last-minute or early-booking adjustments.
- **Fees:** cleaning fees per stay, pet fees, extra-guest fees per night above a base occupancy. All-in price display rules ([Fee Transparency and All-In Pricing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing)) apply to how they're shown.

The price a guest pays is computed once, at booking, from the nightly rates, restrictions and adjustments in force at that moment, and then frozen. My rule: store the quote night by night with the stay (`stay_nights` below), never recompute it from the rate table later. Rates change daily, and the owner's statement, a cancellation refund and the tax return all depend on what this guest was charged for each night.

The antitrust questions around pooled market data that [Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026) covers for apartments apply to nightly pricing tools too, since they price from market data; the design guidance there carries over.

## Turnovers

A turnover is the work between one stay's departure and the next stay's arrival: clean, change linen and towels, restock consumables, inspect for damage, reset the thermostat and locks, and report anything that needs maintenance. It's scheduled from the calendar, not requested by anyone: every departure creates one, and its window runs from checkout time to the next arrival's check-in time. A same-day turn may have five hours; a turn with no next arrival has days.

Turnovers are `work_orders` with source `turnover`, linked to the departing stay and the next one, with the window stored on the work order. Everything that [Dispatch & the Day of Service](/books/field-operations/dispatch) describes for field crews applies: assignment to a cleaner or cleaning vendor, a route across several homes in a morning, jeopardy when a turn runs late against a check-in, and changes when a guest leaves early or a stay is cancelled. Evidence matters more than in most maintenance: photos of each room at completion, a checklist with linen counts and consumables, and damage noted with timestamps are what a damage claim against a guest (or a channel's host protection program) is decided on, so they follow [Proof of Service](/books/field-operations/proof-of-service#required-evidence-configured-per-task).

The vendors all carry this: Guesty's task management for cleaners, Track's housekeeping and maintenance automation, Rent Manager's make-ready board for the turn process. Three design points:

- **Cleaning fees and cleaning cost are different numbers.** The guest pays a cleaning fee on the stay; the cleaner is paid per turn by the operator or the owner. Owner statements show both.
- **Late changes move the turn.** A modified departure, a late checkout or a cancellation has to update or cancel the turnover in the same transaction as the stay, or cleaners arrive at occupied homes.
- **A failed inspection blocks the calendar.** Damage that makes the home unrentable creates a maintenance block stay over the following nights, which closes them on every channel through the same path as a booking.

## Guests, Screening and Damage

Guest screening is lighter than tenant screening and mostly done by the channels. Airbnb describes guest identity verification against name, address and government ID, and reservation screening that "analyzes hundreds of factors" and blocks some bookings flagged as high risk for parties and property damage. Direct bookings get whatever the operator adds: identity verification, a rental agreement signed at booking ([Electronic Signatures & Records](/docs/compliance/electronic-signatures)), age minimums, and party and occupancy limits that local ordinances may also set. A guest screening decision that refuses a booking is still a decision about a person; keep the reason and the inputs ([Automated Risk Decisions](/docs/architecture/risk-scoring)), and note that fair housing and public accommodation questions don't disappear because the stay is short ([Fair Housing](/books/property-tech/fair-housing#protected-classes)).

For damage, operators choose among three instruments:

- **A refundable security deposit,** taken as an authorization or a charge and returned after the turnover inspection. It's money held for the guest, so it lands in trust where a manager holds it for owners, and its return is a deadline the system tracks.
- **A damage waiver:** a non-refundable fee per stay in exchange for the operator agreeing to absorb accidental damage up to a limit, often backed by insurance. It's revenue (and possibly taxable, depending on the jurisdiction), not a deposit, and should be a different charge code.
- **The channel's host protection program.** Airbnb's AirCover for Hosts includes host damage protection "up to $3M USD" for damage guests don't pay for, and "$1M liability insurance," on Airbnb bookings only. Guesty also lists damage protection coverage. Claims run on the channel's evidence rules and deadlines, which is why turnover evidence is captured at the door.

The system should record which instrument applies to each stay, set from the channel and the rate plan, so that a damage finding at the turnover routes to the right path: deduct from the deposit, absorb under the waiver, or file with the channel. How the channels run the other side, from [deposit holds and protection plans](/books/user-generated-platforms/deposits-and-protection#the-protection-stack) to [claims windows and evidence](/books/user-generated-platforms/damage-and-claims#windows-and-requirements), is in the User-Generated Platforms book.

## Owners, Owner Nights and Statements

Most professionally managed vacation rentals belong to individual owners who hand the home to a manager under a management agreement ([Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#the-management-agreement)). The economics are a revenue split rather than a percentage of rent:

- **Gross booking revenue** is the accommodation charge for the stay, net of discounts.
- **Channel fees** come off first: a channel deducts its host service fee from its payout.
- **Management commission** is a percentage of gross or net accommodation revenue under the agreement, sometimes different by booking source (direct bookings carry no channel fee, and some agreements split that saving).
- **Pass-through fees** (cleaning, pet, guest service) go to the manager or to the cleaner, according to the agreement.
- **Taxes** aren't revenue; they're collected for the jurisdiction and remitted by the channel or the manager.
- **Expenses** (repairs, supplies, utilities, the owner's share of turn costs) are charged to the owner.

**Owner nights** are stays where the owner, or guests the owner invites, use the home. They block the calendar like any stay, earn no accommodation revenue, may still incur a cleaning charge to the owner, and may be limited by the agreement (no owner nights over peak holidays, for example). They're stays of kind `owner` or `owner_guest` on the same calendar, so the exclusion constraint protects them and channels see them as unavailable.

Two accounting choices need to be explicit rather than accidental:

- **When revenue is recognized** for the owner statement: at booking, at check-in, across the nights stayed, or at checkout. A stay that runs from June 29 to July 3 belongs in different months depending on the choice, and an owner who sells the home mid-season wants to know whose it was. Storing the stay night by night lets any policy be applied ([Recognition Schedules](/docs/payments/accounting#recognition-schedules)).
- **Advance payments are liabilities.** A guest who pays in March for an August stay has paid money the manager holds for the owner and possibly must refund. Streamline describes tracking "advanced payments" alongside owner money and taxes; Escapia describes automated month-end closeouts and owner statements split across co-owners. It's the trust accounting problem, with arrivals in place of rent days.

Channel payouts complicate reconciliation: one payout from a channel covers many stays, net of the channel's fees and, where it remits taxes itself, of the taxes. The system needs payout lines that tie each payout amount back to stays, gross, fee and tax, so the bank deposit, the owner statements and the tax return all agree ([Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation#a-matching-engine)). Owner distributions then follow [Vendor Payouts](/books/payments/vendor-payouts).

## Lodging Taxes

A short-term stay is taxed like a hotel room. Most stays carry a state tax and one or more local taxes, each with its own rate, base, exemptions and filing:

- **Texas** levies a state hotel occupancy tax of 6 percent of the cost of a room, on rooms costing $15 or more per day; it applies to houses and condominiums rented for less than 30 consecutive days, exempts permanent residents who stay at least 30 consecutive days (from the date of written notice, or after 30 days without notice, with "any interruption in the term of occupancy" voiding the exemption), and authorizes cities, certain counties and special purpose districts to add local hotel taxes collected separately by the local authority.
- **San Francisco** requires hosts renting for fewer than 30 days to collect its 14 percent transient occupancy tax.

The defining complication is **who collects and remits.** Airbnb says it collects and remits occupancy taxes automatically where it has agreements with governments or is legally required to, in most US states, the District of Columbia, Puerto Rico and the US Virgin Islands, and in a list of countries, calculating the tax and collecting it from guests at booking. Hosts remain "responsible for assessing all other tax obligations," and by accepting a reservation a host waives any exemption from a tax Airbnb collects. The Texas Comptroller describes the other side: a platform that agrees to collect and remit state tax for a host files on the host's behalf, reporting receipts by city and county; hosts who book through their own website or a non-collecting platform collect and remit the state tax themselves; and local hotel taxes are separate, so hosts must contact the city and county even when a platform collects state tax.

So the same night in the same house can produce three different tax outcomes depending on the channel: Airbnb collects the state tax and some local taxes, another channel collects nothing, and a direct booking leaves everything to the operator. The design follows:

- **Tax rules are effective-dated rows per jurisdiction:** rate or flat amount, which charges are in the base (the cleaning fee usually is, in many places, and a damage waiver might be), the length-of-stay exemption, and the authority and filing frequency ([Rules as Data](/docs/architecture/rules-as-data#when-rules-overlap)). Jurisdiction comes from the unit's address, resolved to city, county and special districts ([Addresses & Geocoding](/docs/fundamentals/addresses)).
- **Who remits is a second rule,** per tax, per channel, per date, because platform collection agreements start and stop. Keep the evidence (the channel's published list, the agreement) with the row.
- **Every stay gets tax lines,** one per tax, each marked remitted by the channel or by the operator. Operator-remitted taxes are charges on the stay's ledger and a liability to the authority; channel-remitted taxes are recorded for reporting and reconciliation but never posted to the guest, or the guest is taxed twice. This is the same quote-then-finalize discipline as [sales tax](/docs/payments/sales-tax#tax-is-a-quote-until-the-invoice-finalizes), with sourcing by the property's location ([Sourcing Is Data](/docs/payments/sales-tax#sourcing-is-data)).
- **Filing is by jurisdiction and period,** from the operator-remitted lines, with the channel-remitted lines as the reconciliation that proves gross receipts were reported in full. The 1099-K side of channel payouts is in [Payments for Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data).

## Registration, Permits and Caps

Cities regulate short-term rentals as a land use, and over the last decade the dominant tools have become registration, primary-residence requirements, caps on nights, and making the booking platform enforce them. Three cities show the range (status as of October 2026):

- **New York City.** Local Law 18, adopted January 9, 2022, requires short-term rental hosts to register with the Mayor's Office of Special Enforcement and bars booking services from processing transactions for unregistered rentals; from September 5, 2023, enforcement focused on platforms using "the city's verification system." Registration is limited to "an actual person who is the permanent occupant" of the unit; rent-regulated and public housing units are ineligible, as are buildings on the city's prohibited buildings list. Under the rules that predate the law and still apply, nobody may rent an entire apartment or home for fewer than 30 days, the host must live in the unit with the guests, and no more than two guests may stay (children under 4 not counted). Airbnb's help center tells hosts their listing address must exactly match the city's records, and points hosts awaiting approval to a 30-night minimum stay.
- **San Francisco.** A host must be a permanent resident who lives in the unit at least 275 nights a calendar year, may register only the unit they live in, needs a business registration first, and holds a certificate valid for two years; unhosted stays are capped at 90 nights a year, hosted stays aren't capped, hosts report their stays quarterly, and they need $500,000 of liability insurance unless their platforms provide equivalent coverage. Every listing shows the registration number. Platforms must verify that a home is lawfully registered before providing booking services, submit a monthly affidavit that they did, and keep records for at least three years.
- **New Orleans.** A short-term rental is "not legal without a permit"; in a single-family home "one bedroom must be reserved for the owner's full time occupancy," the current structure dates from December 1, 2019, and ordinances in force from July 1, 2023 revised it. The city advises hosts to state their permit number and term-of-stay limits prominently in advertising, and notes that platforms "do not issue permits or enforce regulations."

The European Union moved the same machinery to the regional level. Regulation (EU) 2024/1028, adopted April 11, 2024 and applying from May 20, 2026, makes a registration number the unique identifier of a rented unit where a member state runs a registration procedure, has hosts declare the unit's address, type, whether it's a primary or secondary residence and its capacity, and has platforms provide rental activity data regularly through a single digital entry point in each member state. [Outside the US](/books/property-tech/outside-the-us#the-european-union) says what else changes there.

What the system has to carry:

- **Registrations are records per unit,** with the jurisdiction, kind (registration, permit, license, certificate, tax account), number, holder, status and validity dates, and the listing on each channel points at the registration it displays. A channel listing without a valid registration in a jurisdiction that requires one should not be publishable.
- **Caps are counted from stays.** Unhosted nights in San Francisco are a sum over the calendar year of confirmed, unhosted guest nights for the unit; the system computes it, warns before the cap, and closes unhosted availability when it's reached. Whether a stay is hosted is a field on the stay, set at booking, because it decides which cap it counts against.
- **Primary-residence and hosted-only rules shape the product.** Where the host must be present, the unit can't be sold as an entire home; where only the host's own unit qualifies, a manager's portfolio there is mostly unlawful. These are rule rows per jurisdiction that the listing setup checks, not advice in a help article.
- **Platforms ask for the number, cities ask for the data.** Channels verify registration numbers against city systems and remove listings that fail, and cities increasingly require platform data: San Francisco's monthly affidavits, the EU's single digital entry point. An operator should expect a listing to be suspended when a registration lapses, and the system should see the lapse coming from the registration's validity dates rather than from a channel's notice.

## How to Build It

The short-term model is a set of new tables beside the lease spine, sharing units, people, charges, payments and work orders. Units are `units` of kind `dwelling` on a property whose `property_type` is `short_term` (already in the core CHECK); a home a manager rents both ways is one unit that carries either leases or stays on non-overlapping dates, and a nightly RV site in a manufactured housing community is a `lot` unit that carries stays the same way ([Military & Specialty Housing](/books/property-tech/military-and-specialty-housing#manufactured-housing)). Non-lease ledgers follow the pattern [Community Associations](/books/property-tech/community-associations#how-to-build-it) introduces for `ownership_accounts`: a charge belongs to exactly one account, and a stay becomes the third kind.

```sql
CREATE TABLE short_term_rules (          -- typed slice of 'short_term_rental' legal_rules;
                                         -- platform-wide, so no tenant_id
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_rule_id          UUID NOT NULL UNIQUE REFERENCES legal_rules (id),  -- review, source, versions
  jurisdiction_id        UUID NOT NULL REFERENCES jurisdictions (id),       -- e.g. 'US-CA-SAN_FRANCISCO_CITY'
  tenancy_threshold_nights INT,          -- a stay this long becomes a tenancy question
  requires_registration  BOOLEAN NOT NULL,
  primary_residence_only BOOLEAN NOT NULL,
  min_residence_nights   INT,            -- 275 in San Francisco
  hosted_only            BOOLEAN NOT NULL,
  unhosted_night_cap     INT,            -- per calendar year; null: none
  max_guests             INT,
  platform_must_verify   BOOLEAN NOT NULL,
  valid_during           DATERANGE NOT NULL     -- copied from the legal rule
);

CREATE TABLE short_term_registrations (  -- a unit's registration, permit or license
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  unit_id           UUID NOT NULL REFERENCES units (id),
  jurisdiction_id   UUID NOT NULL REFERENCES jurisdictions (id),
  kind              TEXT NOT NULL CHECK (kind IN ('registration', 'permit', 'license',
                      'certificate', 'business_registration', 'tax_account')),
  number            TEXT,                -- null while pending without a record number
  holder_person_id  UUID REFERENCES people (id),
  holder_entity_id  UUID REFERENCES legal_entities (id),
  hosted_only       BOOLEAN NOT NULL DEFAULT FALSE,
  status            TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended',
                      'revoked', 'expired')),
  valid_during      DATERANGE NOT NULL,
  CHECK (num_nonnulls(holder_person_id, holder_entity_id) = 1),
  EXCLUDE USING GIST (unit_id WITH =, jurisdiction_id WITH =, kind WITH =,
    valid_during WITH &&) WHERE (status IN ('pending', 'active'))
);

CREATE TABLE channel_connections (       -- the operator's account on a channel
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  channel_code TEXT NOT NULL,            -- 'direct' or a channel identifier, as data
  method       TEXT NOT NULL CHECK (method IN ('api', 'ical', 'none')),
  account_ref  TEXT,                     -- the channel's host or account id
  status       TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'disconnected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE channel_listings (          -- a unit's listing on one channel
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  connection_id       UUID NOT NULL REFERENCES channel_connections (id),
  unit_id             UUID NOT NULL REFERENCES units (id),
  external_listing_id TEXT,
  registration_id     UUID REFERENCES short_term_registrations (id),  -- the number displayed
  ical_import_url     TEXT,              -- only on iCal connections
  last_synced_at      TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'listed', 'snoozed',
                        'suspended', 'delisted')),
  valid_during        DATERANGE NOT NULL,
  UNIQUE (connection_id, external_listing_id),
  EXCLUDE USING GIST (connection_id WITH =, unit_id WITH =, valid_during WITH &&)
);

CREATE TABLE rate_plans (                -- a priced offer: currency, policy, defaults
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  name                TEXT NOT NULL,
  currency            CHAR(3) NOT NULL,
  cancellation_policy TEXT NOT NULL,     -- a policy code; refund schedule lives with it
  default_min_nights  SMALLINT NOT NULL DEFAULT 1,
  damage_instrument   TEXT NOT NULL CHECK (damage_instrument IN ('deposit', 'waiver',
                        'channel_program', 'none')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE nightly_rates (             -- the current price and restrictions per night
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  rate_plan_id        UUID NOT NULL REFERENCES rate_plans (id),
  unit_id             UUID NOT NULL REFERENCES units (id),
  night               DATE NOT NULL,
  amount              BIGINT NOT NULL CHECK (amount >= 0),  -- minor units, plan currency
  min_nights          SMALLINT,          -- for arrivals on this night
  max_nights          SMALLINT,
  closed_to_arrival   BOOLEAN NOT NULL DEFAULT FALSE,
  closed_to_departure BOOLEAN NOT NULL DEFAULT FALSE,
  set_by              TEXT NOT NULL CHECK (set_by IN ('manual', 'pricing_tool', 'rule')),
  set_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rate_plan_id, unit_id, night)
);

CREATE TABLE rate_adjustments (          -- length-of-stay, last-minute, early-booking, gap
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  rate_plan_id       UUID NOT NULL REFERENCES rate_plans (id),
  kind               TEXT NOT NULL CHECK (kind IN ('length_of_stay', 'last_minute',
                       'early_booking', 'gap_night')),
  min_nights         SMALLINT,           -- for length_of_stay
  days_before_arrival_range INT4RANGE,   -- for last_minute and early_booking
  percent_bp         INT NOT NULL,       -- basis points; negative is a discount
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE stays (                     -- a reservation of a unit for nights; not a lease
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id               UUID NOT NULL,
  property_id             UUID NOT NULL REFERENCES properties (id),
  unit_id                 UUID NOT NULL REFERENCES units (id),
  kind                    TEXT NOT NULL CHECK (kind IN ('guest', 'owner', 'owner_guest',
                            'block')),
  status                  TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'overbooked',
                            'cancelled', 'expired')),
  stay_dates              DATERANGE NOT NULL,  -- [arrival, departure): the nights, property zone
  hold_expires_at         TIMESTAMPTZ,
  channel_listing_id      UUID REFERENCES channel_listings (id),  -- null: direct, owner, block
  channel_reservation_ref TEXT,              -- the channel's confirmation code
  rate_plan_id            UUID REFERENCES rate_plans (id),
  primary_guest_id        UUID REFERENCES people (id),
  adults                  SMALLINT,
  children                SMALLINT,
  pets                    SMALLINT,
  is_hosted               BOOLEAN NOT NULL DEFAULT FALSE,  -- host present; decides which cap
  block_reason            TEXT,              -- required for kind 'block'
  idempotency_key         TEXT NOT NULL,
  version                 INT NOT NULL DEFAULT 1,
  checked_in_at           TIMESTAMPTZ,
  checked_out_at          TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key),
  UNIQUE (channel_listing_id, channel_reservation_ref),
  CHECK (lower(stay_dates) < upper(stay_dates)),
  CHECK ((status = 'held') = (hold_expires_at IS NOT NULL)),
  CHECK (kind <> 'block' OR block_reason IS NOT NULL),
  EXCLUDE USING GIST (unit_id WITH =, stay_dates WITH &&)
    WHERE (status IN ('held', 'confirmed'))
);

CREATE TABLE stay_guests (               -- who is in the party
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id UUID NOT NULL,
  stay_id   UUID NOT NULL REFERENCES stays (id),
  person_id UUID NOT NULL REFERENCES people (id),
  role      TEXT NOT NULL CHECK (role IN ('booker', 'guest')),
  UNIQUE (stay_id, person_id)
);

CREATE TABLE stay_nights (               -- the quote, frozen night by night at booking
  tenant_id     UUID NOT NULL,
  stay_id       UUID NOT NULL REFERENCES stays (id),
  night         DATE NOT NULL,
  amount        BIGINT NOT NULL,         -- after adjustments, before fees and taxes
  currency      CHAR(3) NOT NULL,
  rate_set_at   TIMESTAMPTZ NOT NULL,    -- which version of the nightly rate was used
  PRIMARY KEY (stay_id, night)
);

-- A charge belongs to a lease, an ownership account or a stay: exactly one.
ALTER TABLE charges
  ADD COLUMN stay_id UUID REFERENCES stays (id),
  DROP CONSTRAINT charges_one_account,
  ADD CONSTRAINT charges_one_account
    CHECK (num_nonnulls(lease_id, ownership_account_id, stay_id) = 1);

-- Money in for stays: a direct guest's payment, or one channel payout across many stays.
ALTER TABLE payments
  ADD COLUMN stay_id               UUID REFERENCES stays (id),
  ADD COLUMN channel_connection_id UUID REFERENCES channel_connections (id),
  DROP CONSTRAINT payments_one_account,
  ADD CONSTRAINT payments_one_account
    CHECK (num_nonnulls(lease_id, ownership_account_id, stay_id, channel_connection_id) <= 1);

CREATE TABLE channel_payout_lines (      -- ties a channel payout back to stays
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  payment_id   UUID NOT NULL REFERENCES payments (id),
  stay_id      UUID NOT NULL REFERENCES stays (id),
  gross_amount BIGINT NOT NULL,          -- what the guest paid the channel, excluding tax
  channel_fee  BIGINT NOT NULL,          -- the host service fee withheld
  tax_withheld BIGINT NOT NULL,          -- taxes the channel collected and remits itself
  net_amount   BIGINT NOT NULL,
  currency     CHAR(3) NOT NULL,
  CHECK (net_amount = gross_amount - channel_fee)  -- tax_withheld never reaches the operator
);

CREATE TABLE lodging_tax_rules (         -- one tax in one jurisdiction: a typed slice of the
                                         -- jurisdiction's 'lodging_tax' legal rule; no tenant_id
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_rule_id      UUID NOT NULL REFERENCES legal_rules (id),  -- one rule may list several taxes
  jurisdiction_id    UUID NOT NULL REFERENCES jurisdictions (id),  -- state, county, city or district
  tax_code           TEXT NOT NULL,      -- 'state_hotel_occupancy'
  authority          TEXT NOT NULL,      -- who it's filed with
  basis              TEXT NOT NULL CHECK (basis IN ('percent', 'per_night', 'per_stay')),
  rate_bp            INT,                -- for percent: 600 = 6%
  flat_amount        BIGINT,             -- for per_night and per_stay
  currency           CHAR(3),
  min_taxable_nightly BIGINT,            -- Texas: rooms of $15 a day or more
  exempt_from_nights INT,                -- stays this long are exempt (30 in Texas)
  taxable_categories TEXT[] NOT NULL,    -- charge code categories in the base
  valid_during       DATERANGE NOT NULL,
  CHECK ((basis = 'percent') = (rate_bp IS NOT NULL)),
  EXCLUDE USING GIST (jurisdiction_id WITH =, tax_code WITH =, valid_during WITH &&)
);

CREATE TABLE lodging_tax_remitters (     -- who collects each tax on each channel, over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  tax_rule_id   UUID NOT NULL REFERENCES lodging_tax_rules (id),
  channel_code  TEXT NOT NULL,           -- 'direct' is always the operator
  remitter      TEXT NOT NULL CHECK (remitter IN ('channel', 'operator')),
  evidence_url  TEXT NOT NULL,           -- the channel's published list or the agreement
  valid_during  DATERANGE NOT NULL,
  EXCLUDE USING GIST (tax_rule_id WITH =, channel_code WITH =, valid_during WITH &&)
);

CREATE TABLE stay_tax_lines (            -- each tax on each stay, and who remits it
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  stay_id      UUID NOT NULL REFERENCES stays (id),
  tax_rule_id  UUID NOT NULL REFERENCES lodging_tax_rules (id),
  taxable_base BIGINT NOT NULL,
  amount       BIGINT NOT NULL,
  currency     CHAR(3) NOT NULL,
  remitted_by  TEXT NOT NULL CHECK (remitted_by IN ('channel', 'operator')),
  charge_id    UUID REFERENCES charges (id),  -- the posted tax charge, operator-remitted only
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((remitted_by = 'operator') = (charge_id IS NOT NULL))
);

CREATE TABLE channel_messages (          -- every reservation, push and feed fetch, in and out
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES channel_connections (id),
  direction     TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type  TEXT NOT NULL CHECK (message_type IN ('reservation_new',
                  'reservation_modified', 'reservation_cancelled', 'availability_push',
                  'rate_push', 'ical_fetch', 'ical_publish')),
  external_ref  TEXT,                    -- the channel's reservation or message id
  payload_sha256 BYTEA NOT NULL,
  stay_id       UUID REFERENCES stays (id),
  result        TEXT CHECK (result IN ('applied', 'duplicate', 'conflict', 'rejected',
                  'failed')),
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  UNIQUE (connection_id, direction, message_type, external_ref, payload_sha256)
);

-- Turnovers are work orders between a departure and the next arrival.
ALTER TABLE work_orders
  ADD COLUMN stay_id      UUID REFERENCES stays (id),   -- the departing stay
  ADD COLUMN next_stay_id UUID REFERENCES stays (id),   -- the arrival it must beat, if any
  ADD COLUMN work_window  TSTZRANGE,                    -- checkout time to next check-in time
  DROP CONSTRAINT work_orders_source_check,
  ADD CONSTRAINT work_orders_source_check CHECK (source IN ('resident', 'staff',
    'inspection', 'preventive', 'make_ready', 'turnover')),
  ADD CONSTRAINT work_orders_turnover_ck CHECK (source <> 'turnover' OR stay_id IS NOT NULL);
```

Design decisions behind it:

- **A stay is its own account, not a short lease.** It has no landlord of record, household or renewal chain, and its law is lodging law, so forcing it into `leases` would give it the wrong rules. Charges, payments and the ledger are shared, which keeps one receivable model ([Payment States & Ledgers](/docs/payments/payment-states#payments-are-applied-not-assigned)); `charges_one_account` makes every charge belong to exactly one of a lease, an ownership account or a stay.
- **One exclusion constraint guards every night.** Guest stays, owner stays and maintenance blocks share `stay_dates` on one table, so the database refuses any overlap among held and confirmed stays, exactly as [Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time) describes. Closed-open date ranges let one stay depart and the next arrive on the same day. Check-in and checkout are timestamps, not statuses, so a guest in the house is still `confirmed` and still blocks the night.
- **Overbooked is a status outside the constraint.** A channel's confirmed reservation that collides is recorded, not dropped, and waits for a person to resolve it. The partial predicate keeps it from blocking anything while it waits.
- **Leases and stays can share a unit, but not a night.** The stay constraint can't see leases, so a unit offered both ways also needs a check (a trigger, or a block stay generated for each lease's term) that keeps them apart. My default is to generate block stays from leases, so channels see the lease as unavailable through the same push.
- **The quote is frozen.** `nightly_rates` holds the current price, overwritten daily by a pricing tool, with its history in the audit log; `stay_nights` holds what this guest was charged for each night, which is what refunds, owner statements and tax returns use.
- **Channel payouts are payments with lines.** One payout is one `payments` row from a channel connection, applied to many stays' charges, with `channel_payout_lines` explaining the fee and the tax the channel kept. The `payments_one_account` constraint name follows Community Associations' pattern; whichever name that chapter uses, the rule is one source per payment.
- **Taxes are two rules and a line.** `lodging_tax_rules` says what the tax is, `lodging_tax_remitters` who collects it on each channel on each date, and `stay_tax_lines` what was computed for each stay. Only operator-remitted lines become charges, so a channel-collected tax can never be billed to the guest twice.
- **Registrations gate listings.** A listing references the registration it shows, and publishing checks the jurisdiction's `short_term_rules` and the registration's status and dates. Night caps are computed from stays with `is_hosted` and never stored as a counter that could drift.
- **Rules are platform content with operator policies on top.** `short_term_rules` and `lodging_tax_rules` are typed slices of the shared rules catalog in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it): each row belongs to one approved `legal_rules` row (rule types `short_term_rental` and `lodging_tax`), which carries the source, the review and the version history, and the slice adds typed columns the booking and tax code read. An operator's stricter choice (a lower guest cap, a longer minimum stay) is a `tenant_policies` row, per [Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided).
- **Emit stay events.** `stay.held`, `stay.confirmed`, `stay.modified`, `stay.cancelled`, `stay.checked_in`, `stay.checked_out` and `stay.overbooked` drive channel pushes, turnover scheduling, guest messages and owner reporting through the outbox ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Short-term rentals generate disputes on a schedule of days, and most of them turn on records:

- **The channel message log.** Every reservation delivered, availability and rate push sent, and iCal feed fetched, with timestamps and payload hashes. It decides who sold a night first when two channels confirmed it, and whether a cancellation reached the channel.
- **The stay as booked.** Dates, party, rate plan, cancellation policy, the night-by-night quote and every modification, with the actor (guest, channel, staff, pricing tool), so a refund or a chargeback can be checked against what was promised ([Audit Trails](/docs/architecture/audit-trails)).
- **Price changes.** Who or what set each night's rate and restrictions, and when. Pricing tools write daily; the history explains why two guests paid different prices for the same night.
- **Turnover evidence.** Completion photos, checklists and damage notes with times, because host protection claims, deposit deductions and guest complaints are decided on them.
- **Tax lines and filings.** For each stay, each tax, its base, rate and remitter, and for each filing the lines it included, so an audit by a city or state can be answered per stay and per period, and channel-remitted receipts can be shown to have been reported.
- **Registrations and caps.** Registration numbers displayed on each listing over time, status changes, and the night counts against each cap, because a city's enforcement case asks what was advertised and how many nights were sold.
- **Owner statements.** Revenue by night and stay, channel fees, commissions, owner nights and expenses, reproducible from the ledger for any month an owner questions.

## What This Means for the System You Build

- **Model the stay as a reservation, not a lease:** its own table and account, guests as people, and lodging law instead of tenancy law, with a check that flags stays reaching the jurisdiction's tenancy threshold.
- **Make the calendar a view over stays,** with guest stays, owner nights and blocks on one table and one exclusion constraint over held and confirmed stays.
- **Hold during direct checkout,** expire holds on read, and confirm idempotently; record colliding channel confirmations as overbooked and route them to a person.
- **Prefer API connections and treat iCal as degraded:** one sync path per listing, visible feed staleness, buffer rules on iCal-only listings, and a log of every message.
- **Push availability through an outbox,** ordered and idempotent per listing, after every stay change.
- **Store nightly rates as current state and freeze the quote per stay,** with restrictions, length-of-stay and gap adjustments as data and a record of who set each price.
- **Generate turnovers from departures** as work orders with a window to the next arrival, moved and cancelled with the stay, and backed by proof-of-service evidence.
- **Record the damage instrument per stay:** deposit held in trust, waiver as revenue, or the channel's program.
- **Split stay revenue explicitly** into accommodation, channel fees, commission, pass-through fees and taxes, with owner nights as stays and recognition policy applied night by night.
- **Reconcile channel payouts by stay,** with payout lines for gross, fee, withheld tax and net.
- **Compute lodging tax per stay from effective-dated rules and remitters,** posting only operator-remitted lines to the guest.
- **Gate listings on registrations** and compute caps from stays, so a lapse or a cap is seen before a channel or a city acts.

## References

**Statutes and regulations**

- [California Civil Code § 1940 (California Public Law)](https://california.public.law/codes/civil_code_section_1940), the exclusion of transient occupancy subject to Revenue and Taxation Code § 7280 from the hiring of real property
- [California Department of Real Estate: Who is a tenant?](https://dre.ca.gov/publications/ResourceGuidebook/gb04_whois.html), hotel and motel guests of 30 days or less are not tenants, tenant rights after 30 days, § 1940.1's re-registration rule and $500 penalty
- [Texas Comptroller: Hotel Occupancy Tax](https://comptroller.texas.gov/taxes/hotel/), the 6 percent state rate, rooms of $15 or more a day, houses rented to guests, local hotel taxes collected separately, third-party rental companies
- [Texas Comptroller: Hotel Occupancy Tax FAQ](https://comptroller.texas.gov/taxes/hotel/faq.php), the 30-consecutive-day permanent resident exemption and its notice rule, platform collection of state tax and Form AP-102, hosts responsible for direct and non-collecting bookings and for local tax
- [European Parliament Legislative Observatory: Regulation (EU) 2024/1028 summary](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1784477), application from May 20, 2026, registration numbers as unique identifiers, host declarations, platform data through a single digital entry point
- [European Commission Transition Pathways: EU regulation on short-term rental data](https://transition-pathways.europa.eu/legislation/eu-regulation-data-collection-and-sharing-short-term-accommodation-rentals), adoption on April 11, 2024 and scope

**Cities**

- [NYC Office of Special Enforcement: Registration Law](https://www.nyc.gov/site/specialenforcement/registration-law/registration.page), Local Law 18 adopted January 9, 2022, booking services barred from processing unregistered rentals, verification enforcement from September 5, 2023, the 30-day and Class B exemptions, the prohibited buildings list
- [NYC Office of Special Enforcement: What is Local Law 18](https://www.nyc.gov/site/specialenforcement/hosting-STRs/what-is-local-law-18.page), permanent-occupant eligibility, rent-regulated and NYCHA exclusions, no entire-unit rentals under 30 days, host living with guests, two-guest limit
- [NYC Office of Special Enforcement: Dos and don'ts](https://www.nyc.gov/site/specialenforcement/hosting-STRs/dos-and-donts.page), no more than two guests not counting children under 4, host present during the stay
- [San Francisco: Guide to opening a short-term residential rental](https://sf.gov/guide-opening-short-term-residential-rental), 275 nights a year, 90 unhosted nights, business registration, two-year certificate, quarterly reporting, $500,000 liability insurance, 14 percent transient occupancy tax
- [San Francisco Planning: FAQs on short-term rentals](https://sfplanning.org/fil/node/2002), registration numbers on listings, only the unit the host lives in, platform verification, monthly affidavits and three-year records
- [New Orleans: Overview of short-term rentals](https://nola.gov/next/short-term-rental-administration/topics/overview-of-short-term-rentals-in-new-orleans/), the less-than-30-days definition, permits required, owner occupancy of a bedroom in single-family homes, December 1, 2019 and July 1, 2023 dates, permit numbers in advertising, platforms not enforcing

**Channels**

- [Airbnb Help Center: Occupancy tax collection and remittance by Airbnb](https://www.airbnb.com/help/article/2509), where Airbnb collects and remits, hosts responsible for other taxes, exemptions waived by accepting a reservation
- [Airbnb Help Center: Taxes hosts can collect](https://www.airbnb.com/help/article/2522), host-collected taxes alongside automatic collection
- [Airbnb Help Center: Sync your calendars](https://www.airbnb.com/help/article/99), iCal updates every 3 hours, two years imported, limited update requests, nights blocked elsewhere subject to prep and notice settings
- [Airbnb Help Center: New York City short-term rental rules](https://www.airbnb.com/help/article/868), registration with the city, exact address match, 30-night minimum stays while awaiting approval
- [Airbnb Help Center: Responsible hosting in the United States](https://www.airbnb.com/help/article/1376), permits, zoning, HOA and rent board checks, hotel and transient occupancy taxes
- [Airbnb: AirCover for Hosts](https://www.airbnb.com/aircover-for-hosts), guest identity verification, reservation screening, host damage protection up to $3M, $1M liability insurance
- [Airbnb: Developer site](https://developer.withairbnb.com/), the Homes API for listings, real-time availability checks during booking and reservations
- [Vrbo Help: Import an iCal or Google calendar](https://help.vrbo.com/articles/How-do-I-import-my-iCal-or-Google-calendar), five calendars per property, 30-minute app sync, 20-minute dashboard delay, 365 days shown, not available through third-party software
- [Booking.com Connectivity](https://connect.booking.com/), Rates & Availability, Content and Promotions APIs, properties connecting through channel managers, new connectivity providers paused

**In practice**

- [Guesty](https://www.guesty.com/), PMS and channel manager, real-time sync, unified inbox, cleaner tasks, owners portal, trust accounting, dynamic pricing, direct booking, payments, damage protection, tiers by listing count
- [Hostaway](https://www.hostaway.com/), direct API connections to Airbnb, Vrbo, Booking.com, Google and Expedia, owner statements and portal, direct booking
- [Track Hospitality Software](https://trackhospitality.com/), PMS for vacation rental, hotel and resort operators, dual-ledger trust accounting, housekeeping and maintenance, distribution, payments and owner payouts, APIs
- [Streamline: Trust accounting](https://www.streamlinevrs.com/trust-accounting), owner money, advance payments and taxes tracked, ACH and check payables, 1099 and 1042 filing
- [Escapia: Trust accounting](https://escapia.com/features/trust-accounting/), Vrbo revenue, fees and taxes into the ledger, split and consolidated owner statements, automated month-end close
- [Rent Manager: Vacation homes](https://www.rentmanager.com/industries/vacation-homes/), short-term rental dashboard, nightly reservations, check-ins register, guest charges, make-ready board
- [OwnerRez](https://www.ownerrez.com/), direct channel partnerships, no percentage-of-revenue pricing, commission calculation and monthly owner statements
- [OwnerRez: Vrbo calendar import and export](https://www.ownerrez.com/support/articles/channel-management-calendar-import-export-vrbo), iCal never alongside a channel integration, ghost bookings from abandoned checkouts, importing bookings only
- [PriceLabs: Dynamic pricing](https://hello.pricelabs.co/dynamic-pricing/), daily recalculation of prices and minimum stays, orphan-day adjustments, last-minute and far-out adjustments, sync to channels and 160+ PMSs
- [Wheelhouse](https://www.usewheelhouse.com/), rule-based and data-driven pricing, 15+ settings, minimum stays, comp sets, 40+ integrations
- [Beyond](https://www.beyondpricing.com/), dynamic pricing, two-way PMS integrations, market insights, owner projections, payments and direct booking sites
