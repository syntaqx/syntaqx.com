+++
title = "Restaurant Reservations"
description = "Reservation software and diner networks: network and direct covers, tables and pacing, deposits and tickets, waitlists, who owns the guest, and resale law."
category = "Commerce Industry"
order = 2342
part = "Point of Sale and Stores"
tags = ["commerce", "restaurants", "reservations", "opentable", "waitlists", "point-of-sale"]
+++

A reservation is a promise of a table that doesn't exist yet. At 7:30 on Saturday the restaurant will have a certain number of tables free, depending on how long the 6:00 parties linger, whether the eight-top shows up, and how many walk-ins the host takes at 7:10. The reservation system sells that future table in advance, to someone who pays nothing for it in most cases and may not come. What it really sells is a forecast: covers the kitchen can handle in each fifteen minutes, tables that will turn in time, and a guest list the host can work from when the night goes sideways.

The industry's shape comes from one fact: the same company usually sells two products to the restaurant. One is software the restaurant runs every night (the host stand, the floor plan, the guest book, the waitlist). The other is a consumer network: an app and a website where diners search for a table and find restaurants they didn't know. The software is paid for by subscription; the network is paid for by the booking, and the bill depends on where each booking came from. Most of the system design in this chapter follows from keeping those two apart: who owns the guest, which cover is billable, whose cancellation policy applies, and which record wins at the host stand.

This chapter covers the reservation platforms and their business model, inventory (tables, combinations, shifts, pacing and turn times) and how bookable slots are generated and searched, deposits, cancellation fees and prepaid tickets, waitlists and walk-ins at the host stand, seating and the check, guest profiles and who owns them, reviews and dining points tied to seated reservations, and reservation bots and the state laws against resale. It extends `dining_tables`, `table_sessions` and the orders of [Restaurants & Food Service](/books/commerce/restaurants#how-to-build-it) and `customers` and `sales_channels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Hold mechanics are the playbook's [Reservations & Holds](/docs/building-blocks/reservations-and-holds); card authorization for deposits and no-show fees is the Payments volume's [Stored Cards & Recurring Billing](/books/payments/stored-credentials#who-started-the-payment); the kitchen, checks and tips are [Restaurants & Food Service](/books/commerce/restaurants). A services marketplace built on the same model, where licensed facilities run the platform's software and the network sells them bookings, is the User-Generated Platforms volume's [The Reservation Network Model](/books/user-generated-platforms/services-marketplaces#the-reservation-network-model).

## How the Platforms Do It

As of November 2026, from each company's filings, documentation and announcements:

| Platform | Owner and scale | How it charges the restaurant | What its documentation shows |
| --- | --- | --- | --- |
| **OpenTable** | Booking Holdings; "more than 60,000 restaurants worldwide" filling "1.9 billion seats a year" (February 2026) | Subscription fees for restaurant management services plus revenue from reservation services (Booking's 10-K); a competitor's comparison lists $149 to $499 a month and "$1 - $1.50 per network cover" | Reviews only from diners "who booked and honored their OpenTable reservations"; points earned "for every completed reservation made directly on the platform" |
| **Resy** (with Tock) | American Express (Resy since July 2019; Tock bought from Squarespace for $400 million, completed October 2024); Tock venues moved onto Resy in 2026, "More Than 25,000 Venues" | $289 or $459 a month; "no per-cover fees" and no per-reservation fees; 3% or 2% on prepayments on the Tock-powered plans, plus processing | Deposits applied to the bill or refunded, card holds for no-shows and late cancellations, event ticketing |
| **SevenRooms** | DoorDash, completed June 13, 2025, for $1,152 million; more than 13,000 venues | A monthly subscription by quote (Starter, Growth, Premium) | Reservations and guest data for restaurants, hotel food and beverage and nightlife |
| **Toast Tables** | Toast, the restaurant POS | Launched in 2023 at $50 and $199 a month with no per-cover fees (Restaurant Dive) | Waitlist, reservations and floor plan on the host stand; turn times by party size; max covers per reservation increment; seating can start the POS order |
| **Yelp Guest Manager** | Yelp | "$129 - $349/month," "No cover fees" | Reservations, waitlist and table management, listed on "Yelp, Reserve with Google, Apple Maps, ChatGPT" and more |
| **Reserve with Google** | Google (a channel, not a system) | Google doesn't bill the restaurant; "When you book through Google, your provider might charge you" | Partners must have "a direct contractual relationship" with every merchant they list; a daily availability feed plus updates within 5 minutes |

American Express also agreed in June 2026 to buy TheFork, Tripadvisor's European reservation network, and completed the purchase on November 1, 2026, for "$700 million, subject to certain adjustments, in an all-cash transaction" ([Tripadvisor 8-K](https://www.sec.gov/Archives/edgar/data/1526520/000119312526442627/trip-20261101.htm)).

Four patterns run through the table:

- **Software plus network, priced separately.** OpenTable's revenue, in Booking's words, is "revenues earned by OpenTable for its restaurant reservation services" and "subscription fees for restaurant management services." The bill splits the same way: a monthly fee for the host stand, and a fee per diner the network delivered.
- **The per-cover fee is the battleground.** Resy, Yelp and Toast all advertise the absence of cover fees, and Yelp's page puts OpenTable's network cover fee in its comparison table. A per-cover model pays for the consumer network; a flat model says the restaurant brings its own diners. Either way the system has to know where each cover came from.
- **Reservation companies are being bought by networks that already have the diner.** A card issuer (American Express with Resy, Tock and TheFork) and a delivery network (DoorDash with SevenRooms) each bought reservation software, and Toast and Yelp built their own. The guest record is the asset in every one of those deals.
- **Distribution is a feed.** Google, Apple Maps, Yelp, Instagram and now AI assistants are booking surfaces that show a provider's availability under the provider's contract with the restaurant. A restaurant on one system can be bookable in a dozen places, and every one of them reads the same inventory.

## Software and a Network

A restaurant that signs up with a reservation platform gets two things that are easy to confuse.

**The software** is what runs the dining room: the reservation book, the floor plan with tables and their status, the waitlist, server sections, the guest book with notes and visit history, and the reports. It's used by the host every shift, whether or not a single reservation comes from the platform's app. Toast Tables is purely this: a host-stand app to "manage the waitlist, take reservations, assign servers, and seat parties on your floor plan," sold with the POS.

**The network** is the consumer side: an app and website with search, a profile per restaurant, reviews, points, editorial lists and marketing, plus the distribution deals that put the restaurant's availability on Google and elsewhere. It earns its money by sending diners who wouldn't otherwise have booked, and a per-cover fee is how it gets paid for that.

### Where a Cover Came From

Because the network is paid per diner it delivers, every reservation carries an **attribution**: the channel the guest booked through, and whether that channel counts as the network's. The categories that recur across the vendors:

| Source | Example | Billed as a network cover? |
| --- | --- | --- |
| **The network's own app or site** | A diner searches the app and books | Yes, under a per-cover plan |
| **The restaurant's own channels** | The booking widget on the restaurant's site, its Instagram link, its own app | Depends on the plan; often free or a smaller fee |
| **Third-party surfaces under the provider's contract** | Reserve with Google, Apple Maps, an AI assistant | Set by the provider's terms, not by the surface |
| **Phone and walk-in** | The host types it into the book | No |

OpenTable's own US plan pages, which define which of these count as network covers and what each costs, didn't load for me; the figures above are the vendor categories, and the only per-cover prices I could open are a competitor's comparison and a 2019 news report of $1.50 per seated diner. <!-- source-gap: opentable-us-plans | secondary | OpenTable's current US plan prices, per-network-cover fees, and which booking sources (own website, Google, Instagram) count as network covers | closes with: OpenTable's US plans page (opentable.com/restaurant-solutions/plans) or a restaurant agreement, which timed out on every fetch | checked: 2026-11-10 -->

Attribution is the fee's legal and commercial basis, so it has the properties of a money record:

- **Captured at booking, frozen.** The channel, the referring surface, the plan in force and whether the cover is billable are stored on the reservation when it's made, not computed from logs at month end. A guest who found the restaurant on the app and later rebooks from the restaurant's site is two reservations with two sources.
- **Billed on what happened.** A network cover is usually billed for a seated party, so the fee depends on the reservation's final state (seated, no-show, cancelled) and its final party size. That ties billing to the host stand: a no-show marked as seated by a busy host is a fee the restaurant shouldn't owe, and a party seated without being checked in is one the network didn't collect.
- **Disputable.** The restaurant sees a statement of billable covers, each traceable to the reservation, its source and its seating record, with a way to dispute a line. This is the same discipline as a delivery marketplace's merchant statement ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it)).

The channel registry is the delivery part's `sales_channels`, with each location's presence on a network or surface as a `merchant_channel_enrollments` row ([The Delivery Landscape](/books/commerce/delivery-landscape#how-to-build-it)); a reservation network is one more channel, and Reserve with Google is a surface attached to the provider's enrollment rather than a contract of its own. How a direct-to-consumer brand attributes orders to ad spend is a different question, owned by [Acquisition & Attribution](/books/commerce/acquisition-and-attribution#attribution-models); a reservation's source is a fact recorded by the booking flow, not a model.

## Inventory: Tables, Shifts and Pacing

A restaurant's reservable inventory is a dining room over time, constrained in three ways at once: the tables (who fits where), the clock (how long each party stays), and the kitchen (how many covers can arrive in each interval without the line collapsing). Toast's documentation names the parts, and the other systems use the same ones under different labels:

- **Tables and combinations.** Each table has a capacity range (a four-top that takes two to four). Larger parties sit at combinations of adjacent tables that the restaurant defines in advance; Toast's troubleshooting guide says a party with no availability may simply have tables "too small," and the fix is combination tables. A combination is its own bookable unit that consumes every member table.
- **Shifts.** Availability exists only inside configured service periods: "Online reservations only appear for times that fall inside a configured shift on an active schedule." A shift has its days, its hours, its reservation increment and its own rules, and special dates and booking blocks override it for a holiday or a private event.
- **Turn times by party size.** "Turn times determine how long a party is expected to occupy a table," set by party size in five-minute increments. A two-top at lunch turns faster than a six-top at dinner, so turn time is per party size, per shift and per dining area.
- **Pacing.** The kitchen's limit is covers per interval, not tables. Toast calls it flow control: "Max cover" is the maximum number of guests that can book per reservation increment. Its guide gives the consequence: with 15-minute increments and max covers of 2, no party larger than two can book that slot, even with the dining room empty.
- **Online share.** A restaurant holds some inventory back from online channels for regulars, phone bookings and walk-ins. Toast's troubleshooting guide lists a dining area's table availability set to 0% among the reasons online slots don't appear, along with an online access window (minimum advance time and maximum days ahead) that excludes the requested time.

### Generating Bookable Slots

A slot is "a party of N can start at time T," and it's derived, never stored as the truth. For a requested date and party size, the engine walks the shift's increments and offers a start time only if all three constraints hold:

1. **A table or combination fits the party** and is free from T until T plus the turn time for that party size, given every confirmed reservation, live hold and seated party already on it ([Exclusion Constraints for Time](/docs/building-blocks/reservations-and-holds#exclusion-constraints-for-time)).
2. **The pacing counter has room**: covers already starting in that increment plus N stay within the max covers for it ([Counters for Pooled Inventory](/docs/building-blocks/reservations-and-holds#counters-for-pooled-inventory)).
3. **The channel may sell it**: the slot is inside the online access window, the dining area's online share isn't exhausted, and no block applies.

Two design choices follow. First, the engine can either assign a specific table at booking or only promise that one will fit. Assigning early makes the exclusion constraint do all the work and produces a clean floor plan, but locks the host into choices made weeks ago; promising capacity and assigning tables on the day (with an optimizer that packs parties into tables) fills the room better. My default is to promise capacity for most tables and assign at booking only where the guest booked a specific table or a combination that has to be reserved. Second, the system has to admit it's a forecast: real turn times drift from the configured ones, and the host overrides the engine many times a night. Turn times are configuration the restaurant tunes from its own seating history, which the table sessions record.

Deliberate overbooking (taking a few more covers than the room holds because some won't come) is legitimate, and it belongs in capacity, set from measured no-show rates and recorded, never as a gap in the constraint ([Overbooking Is a Policy, Not a Bug](/docs/building-blocks/reservations-and-holds#overbooking-is-a-policy-not-a-bug)).

### Searching Thousands of Restaurants

A diner asking "four people, Friday, 7:30, anywhere downtown" is asking every restaurant in a city to run the slot engine at once. Nobody does that live. The pattern visible in Google's partner specification is the one a network uses internally too:

- **Precomputed availability, pushed.** A partner uploads "a complete availability inventory Feed every day," with one slot per start time and party size (its sample lists separate slots for parties of one through six), and sends real-time updates as availability changes: Google expects the update "within 5 minutes of an update occurring on your side," and says batch syncs should run "at least every 5 minutes."
- **Search reads the cache; booking checks the source.** The search index answers from that availability, which is minutes stale by design. The booking step goes back to the restaurant's book, which is the only place the constraints are enforced; Google's specification requires the partner's server to confirm or deny a synchronous booking immediately. A slot that vanished between search and tap is an expected outcome with a designed message, not an error.
- **Holds at checkout.** When the booking needs more than one tap (a card for a deposit, a prepaid ticket, a phone verification), the slot is held for the guest for a few minutes, as a reservation row in a `held` state with an expiry enforced on read, capped per guest and device ([Where a Hold Lives](/docs/building-blocks/reservations-and-holds#where-a-hold-lives), [Caps and Abuse](/docs/building-blocks/reservations-and-holds#caps-and-abuse)). The hold lifetime is the payment session's lifetime or shorter.
- **Invalidate on every change.** A booking, cancellation, seated party running long, table blocked or shift edit changes availability, and the change is an event that recomputes the affected slots and pushes them to every surface. A restaurant with three surfaces and a stale cache is a restaurant that double-books.

## Deposits, Cancellation Fees and Tickets

Most reservations are free, which is why no-shows happen. In 2015 Tock's founder put no-show rates at "10 percent, 12 percent" and said Alinea lost "about 110 people a month" to them (PBS NewsHour). The platforms offer four tools, in increasing commitment, each a policy attached to a shift, a table type or a date:

| Policy | How it works | What the guest risks | What the system needs |
| --- | --- | --- | --- |
| **Card guarantee** | A card is saved at booking; a fee is charged only on a no-show or late cancellation. Resy describes "credit card holds" used to charge for no-shows or late cancellations | The stated fee | A saved card with the guest's agreement to a later merchant-initiated charge, the policy text shown, and the cancellation deadline |
| **Deposit** | An amount paid at booking, applied to the bill or refunded under the policy | The deposit | A payment linked to the reservation, then to the check when the party is seated |
| **Prepayment** | The full meal (or a set menu) paid in advance | The whole price | A sale before service, with tax and tip handling decided up front |
| **Ticket** | A prepaid seat at a specific time, priced like an event, sometimes varying by day and time | The ticket, often non-refundable, sometimes transferable | Inventory sold as tickets with their own price list and transfer rules |

Tickets are Tock's original model. PBS's 2015 report describes Chicago's Next replacing reservations with tickets requiring "full payment in advance," with "variable pricing": its example has a $90 early seating, $120 at 8:00 and less again late. Resy now sells the Tock-powered tiers with fees of 3% or 2% on prepayments. A ticketed restaurant is closer to an event venue than to a reservation book, and the BOTS Act still doesn't reach it ([Bots, Resale and the Law](#bots-resale-and-the-law)).

The money mechanics belong to the Payments volume. A no-show fee charged to a saved card is a merchant-initiated "no-show charge under a stated policy," an industry-practice transaction on a stored credential that must have been saved properly at booking ([Who Started the Payment](/books/payments/stored-credentials#who-started-the-payment)); in Europe the off-session charge also has to fit SCA's rules ([On-Session and Off-Session Payments](/books/payments/strong-customer-authentication#on-session-and-off-session-payments)). A disputed no-show fee is a chargeback whose evidence is the policy the guest accepted and the reservation's timeline ([Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)). Resy's restaurant terms put that cost on the restaurant: it "remains solely responsible for the payment of any and all chargebacks, disputed fees."

What's specific to reservations:

- **The policy is versioned and frozen on the booking.** Fee amount, per person or per party, the cancellation deadline (24 or 48 hours before is common), whether a party-size reduction counts as a partial no-show, and the text the guest saw. The fee is charged under the policy in force when the guest booked, never the one the restaurant set afterward.
- **No-show is a host decision with a delay.** A party is a no-show only after a grace period past the reservation time, and the fee runs after the host confirms it, never automatically at the deadline, because a party stuck in traffic who arrives at 7:50 is a seated party.
- **Deposits move to the check.** When the party sits down, the deposit is a tender on the table's check, so the guest pays only the difference and the receipt shows both ([Tenders](/books/commerce/point-of-sale#tenders)). A deposit that isn't linked to the check is a guest charged twice.
- **Who is the merchant.** On a restaurant's own policy, the restaurant is the seller and the platform processes for it; on a network that sells tickets in its own name, the network may be the merchant of record. Which one it is decides whose descriptor appears on the statement, who answers the chargeback and who owes sales tax on a prepaid meal ([Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties)).

## Waitlists, Walk-Ins and the Host Stand

Reservations are only part of a night. Walk-ins and the waitlist fill the rest, and on a busy night the host is balancing all three on one floor plan. That's why the **host stand is the source of truth** for the room: whatever the network, Google or the restaurant's website believes about 7:30, the host's book is what's real, and every channel reads from it.

- **The waitlist is a queue with a quote.** A walk-in party joins with a party size and a quoted wait; the host is notified when a suitable table opens, texts the party, and seats them or marks them gone. Toast's waitlist lets hosts add parties, notify guests and pre-assign tables. Guests can also join a waitlist remotely: Google offers it through its Actions Center, for restaurants only and through a Reserve with Google provider. The quote is a prediction from current table states and turn times, and the history of quoted against actual waits is what improves it.
- **Status is per table, live.** Toast's floor plan shows each table's status, the assigned server's color and "a turn-time progress bar." The status is fed partly by the POS: Toast sets tables to Ordered and Paid "from POS order data," so a table whose check is paid is about to turn.
- **The host overrides everything.** Seating a walk-in at a table the engine was holding for a 7:45 reservation, merging two tables for a party that grew, or moving a reservation that's running late are normal. Each override is an action by a named staff member, recorded, and pushed to availability at once.
- **The book works offline.** The host stand on a tablet loses Wi-Fi like the register does. The local book keeps working, holds bookings arriving from channels until sync, and resolves conflicts in the host's favor ([Offline Sync](/docs/building-blocks/offline-sync)).

### Seating and the Check

Seating a party is where the reservation meets the order. In the model, seating creates a `table_sessions` row ([Restaurants & Food Service](/books/commerce/restaurants#tables-seats-and-checks)) that points at the reservation or waitlist entry, and the POS order opens against it. Toast's integration shows both ways it can go: with the "Start Order on POS" setting enabled, "a new order starts on the POS automatically when you seat the party"; without it, the host's seating and the server's order are linked only by the table. A transferred check moves the server assignment on the floor plan.

The link pays for itself afterward. The check total flows back to the reservation, so the restaurant knows spend per cover by source (network diners against direct diners against walk-ins), the guest's profile shows what they ordered last time, and the network can show the restaurant what its covers were worth. American Express and Toast announced in August 2025 that Resy and Tock guest data would appear on Toast's kitchen and server chits, the same link from the other side. Matching a check to a reservation without an integration (by table and time) is a guess that fails on merged tables and moved parties; my default is to carry the reservation ID on the table session and the order.

## Who Owns the Guest

A diner who books through a network has two relationships: an account with the network (their profile, history, points, reviews, payment methods) and a visit to the restaurant, which keeps its own guest book (allergies, the regular's table, the anniversary, the spend). The commercial fight in this industry is over the overlap.

The published terms show how the platforms draw the line:

- **Resy's restaurant terms** (last updated June 11, 2024) don't assign ownership of guest data outright. The restaurant grants Resy "a nonexclusive, royalty-free, irrevocable, worldwide, perpetual" license to the content it provides; the restaurant must "comply with Resy's privacy policy and all applicable privacy laws"; Resy "MAY SHARE RESTAURANTS' AND CUSTOMERS' PERSONAL DATA WITH THIRD PARTIES" under its privacy policy; and the restaurant "maintains ultimate responsibility" for honoring its customers' venue marketing opt-ins and opt-outs.
- **OpenTable in 2019** changed its restaurant contracts so restaurants could no longer give third-party systems systematic access to guest data from OpenTable; it said it "can't allow third parties to systematically harvest information from our systems," while restaurateurs read the change as aimed at SevenRooms, which had been pulling OpenTable data into its own tools (Fortune, March 2019). I couldn't load OpenTable's current privacy policy or restaurant terms to quote what it shares with restaurants today. <!-- source-gap: opentable-guest-data-terms | missing | what OpenTable's current privacy policy and restaurant terms say about sharing diner data with restaurants and restaurants' rights to export it | closes with: OpenTable's privacy policy (opentable.com/legal/privacy-policy) and restaurant terms, which timed out on every fetch | checked: 2026-11-10 -->

For the system, ownership becomes three rules:

- **Two records, linked.** The network's diner is a `customers` row with no `merchant_id` (the core model's "marketplace's own account holder"); the restaurant's guest is a `customers` row with the restaurant's `merchant_id`. A booking through the network creates or matches the restaurant's guest and links the two, carrying only the fields the diner's consent and the contract allow: name, contact for this reservation, party notes. The restaurant's own notes (VIP, allergies it recorded, spend) live on its record and never flow back to the network's profile without a basis. Matching is record linkage, done carefully, because two guests named Alex Kim are not one guest ([Match Before Create](/docs/building-blocks/record-linkage#match-before-create)).
- **Marketing consent is per relationship.** Opting in to the restaurant's emails at booking is consent to the restaurant, recorded on the restaurant's guest, with the wording shown; it's not consent to the network or to other restaurants ([Marketing Consent](/books/commerce/customers-and-accounts#marketing-consent)).
- **Exports and leaving are designed.** A restaurant that leaves a platform asks for its guest book. What it may take (guests it entered itself, phone bookings and walk-ins, against network diners' data) is a contract term, and the export is a job with its own audit record. Privacy requests run against both records separately: deleting a network account doesn't delete the restaurant's guest record of a visit, and the reverse ([Privacy Law](/books/commerce/customers-and-accounts#privacy-law)).

## Reviews and Dining Points

Both are ways the network rewards diners for booking through it, and both are tied to a seated reservation for the same reason: it's the only proof the diner was there.

**Reviews.** OpenTable described the closed loop in 2011: "All OpenTable reviews are proactively solicited via email from diners who booked and honored their OpenTable reservations," and "Only reviews by verified diners are published." That makes a restaurant review a review of a visit, the analogue of a verified-purchase product review, and the FTC rule against fake and suppressed reviews applies the same way ([Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule)). Two details are specific to restaurants: the request goes out after the seating closes, not after the booking, and a restaurant that can't see who wrote a review (because the network keeps the diner's identity) can still respond to it publicly, which is what the review response API or dashboard is for. Asking only happy guests, or only network guests, is the selection bias [Collecting Reviews](/books/commerce/reviews-and-ratings#collecting-reviews) warns about.

**Dining points.** OpenTable relaunched its program as OpenTable Regulars on October 27, 2025: diners "earn points for every completed reservation made directly on the platform," 100 points per booking and up to 1,000 on select reservations, redeemable toward the check in the US, on prepaid experiences and for gift cards. Resy counts select Tock purchases toward the Resy Credit from September 15, 2026. A points program run by the network is a liability on the network's books, earned per seated cover, with breakage and expiry under the rules in [Points as Material Rights](/books/commerce/memberships-and-loyalty#points-as-material-rights). Points redeemed "toward the check" are a tender the restaurant accepts and the network settles, so they reconcile like a gift card from a third party. Points that only accrue on network bookings are also a reason for diners to book through the network rather than the restaurant's site, which is the per-cover fee's interest, not the restaurant's.

## Bots, Resale and the Law

A table at a restaurant that's booked out weeks ahead is worth money to someone, and bots that grab reservations the moment they open, under fake or rented accounts, then resell them, are the result. Resale marketplaces sell those reservations openly: Columbia News Service reported in July 2025 that Appointment Trader, founded in 2021, takes "a variable 20-30% cut," and halted New York City listings after that state's law. Resy says it deactivates rogue accounts, cancels suspicious reservations and blocks bot traffic.

The federal BOTS Act doesn't help: it covers tickets to events at venues with more than 200 seats ([Resellers, Sneaker Bots and the BOTS Act](/books/commerce/commerce-fraud#resellers-sneaker-bots-and-the-bots-act)). The states have acted instead, mostly by requiring the restaurant's consent before anyone sells its tables:

| Jurisdiction | Law | What it does | Penalty |
| --- | --- | --- | --- |
| **New York** | S.9365-A/A.10215-A, Chapter 601 of 2024, General Business Law §391-w; signed December 19, 2024, in effect 60 days later | A third-party restaurant reservation service may not "list, advertise, promote, or sell reservations" for an establishment without a written agreement with it; channels authorized by contract with the restaurant (or its designee) are excluded | Up to $1,000 per violation, accruing daily per establishment |
| **Louisiana** | Act 135 of 2025 (HB 90), R.S. 51:3291; effective August 1, 2025 | A written agreement between the platform and the restaurant | Civil penalty up to $1,000 per violation; restitution up to what the buyer paid |
| **Illinois** | HB 2456, Public Act 104-0227 (2025) | A written agreement; restaurants and consumers may sue | Up to $1,000 per violation, each day separate |
| **New Jersey** | A3318, P.L.2026, c.12, supplementing the Consumer Fraud Act; approved May 7, 2026, effective immediately | A written agreement; channels authorized by contract with the restaurant (or its designee) are excluded; charged diners and affected restaurants may sue within one year | Up to $500 per violation, accruing daily per establishment |
| **California** | AB 1640, the California Restaurant Reservation Anti-Piracy Act, Chapter 475 of 2026, Business and Professions Code §22599.7 and following; approved September 27, 2026 | No one may sell or transfer a reservation, or facilitate it, for more than was paid for it, unless a written agreement with the restaurant expressly authorizes the higher amount | Up to $1,000 per violation; the Attorney General, county counsel, city attorneys and harmed persons may sue |

Illinois's row comes from a bill tracker and news coverage; I couldn't open the enacted text. <!-- source-gap: il-nj-reservation-laws | secondary | Illinois HB 2456 (P.A. 104-0227) enacted text, penalties and effective date | closes with: the Illinois General Assembly's public act page (ilga.gov and my.ilga.gov fail with a certificate error) | checked: 2026-11-10 --> California's operative date isn't stated on the bill page I opened; the state's default for a 2026 statute is January 1, 2027. <!-- source-gap: ca-ab1640-operative | status | the operative date of California AB 1640 (Chapter 475, Statutes of 2026) | closes with: the chaptered text on leginfo.legislature.ca.gov, which returned 403 | checked: 2026-11-10 --> A federal bill, the Supporting Equal Access to Tables Act (H.R. 3403, introduced May 14, 2025), would require written agreements nationally and have the FTC enforce it; I found no action on it after referral to committee. <!-- source-gap: seat-act-status | status | any action on H.R. 3403 (SEAT Act) after its May 2025 referral | closes with: the Congress.gov bill page's actions tab (403 to fetchers; govinfo carries only the introduced text) | checked: 2026-11-10 -->

Two shapes of law produce two different systems:

- **Written-agreement laws (New York, Louisiana, Illinois)** regulate listing. A network or surface needs a contract on file for every restaurant it shows, the same rule delivery apps live under in New York and California ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law)). A listing without an agreement can't be published, which makes the agreement a gate on the enrollment ([Onboarding Merchants](/books/commerce/merchants-menus-and-catalogs#onboarding-merchants)).
- **Price-cap laws (California)** regulate resale itself. A transfer feature that lets a guest give a reservation to a friend is lawful; one that lets them sell it for more than they paid isn't, without the restaurant's written authorization. A prepaid ticket's transfer price becomes something the system checks.

The defenses inside the platform are the playbook's: rate limits and bot scores on search and hold creation, holds capped per account, device and card, reservation limits per identity rather than per account (counting linked phones, cards and devices, as in [Bots and Inventory Hoarding](/books/commerce/commerce-fraud#bots-and-inventory-hoarding)), a phone number verified at booking, a name on the reservation the host can check, and a card guarantee that makes a speculative booking cost something if it isn't used. The restaurant's own lever is the policy: non-transferable reservations, the name checked at the door, and a cancellation fee.

## How to Build It

The restaurants chapter has `dining_tables` and `table_sessions`; the core has `customers`, `orders` and the channel registry. This chapter adds capacity and combinations, shifts with turn times and pacing, reservations with their attribution and policy, the table assignments that the database keeps from overlapping, deposits and fees, the waitlist, guest links, billable covers, and the links from reviews and points to the visit:

```sql
ALTER TABLE dining_tables
  ADD COLUMN min_party     SMALLINT,
  ADD COLUMN max_party     SMALLINT,          -- defaults to seats
  ADD COLUMN dining_area   TEXT,              -- 'main', 'patio', 'bar'; online share is per area
  ADD COLUMN reservable    BOOLEAN NOT NULL DEFAULT TRUE,  -- bar seats may be walk-in only
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT dining_tables_min_party_check CHECK (min_party > 0) NOT VALID;

CREATE TABLE table_combinations (        -- adjacent tables booked as one unit
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  name         TEXT NOT NULL,            -- "12+13"
  min_party    SMALLINT NOT NULL CHECK (min_party > 0),
  max_party    SMALLINT NOT NULL,
  CHECK (max_party >= min_party),
  UNIQUE (location_id, name)
);

CREATE TABLE table_combination_members (
  combination_id  UUID NOT NULL REFERENCES table_combinations (id),
  dining_table_id UUID NOT NULL REFERENCES dining_tables (id),
  PRIMARY KEY (combination_id, dining_table_id)
);

CREATE TABLE reservation_shifts (        -- a service period with its own rules
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id        UUID NOT NULL REFERENCES locations (id),
  name               TEXT NOT NULL,      -- 'weekday dinner', 'Sunday brunch'
  days_of_week       SMALLINT[] NOT NULL,  -- ISO 1-7
  starts             TIME NOT NULL,      -- local to locations.time_zone
  ends               TIME NOT NULL,      -- last seating
  slot_minutes       SMALLINT NOT NULL CHECK (slot_minutes IN (5, 10, 15, 30)),
  max_covers_per_slot SMALLINT,          -- pacing; null: tables are the only limit
  overbook_covers    SMALLINT NOT NULL DEFAULT 0,  -- set from measured no-shows, recorded
  online_min_notice  INTERVAL NOT NULL DEFAULT '0',
  online_max_ahead   INTERVAL NOT NULL DEFAULT '30 days',
  policy_id          UUID,               -- reservation_policies, below
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE shift_online_shares (       -- inventory held back from online channels
  shift_id     UUID NOT NULL REFERENCES reservation_shifts (id),
  dining_area  TEXT NOT NULL,
  online_pct   SMALLINT NOT NULL CHECK (online_pct BETWEEN 0 AND 100),
  PRIMARY KEY (shift_id, dining_area)
);

CREATE TABLE turn_times (                -- expected minutes at the table by party size
  shift_id     UUID NOT NULL REFERENCES reservation_shifts (id),
  dining_area  TEXT NOT NULL DEFAULT '*',
  party_min    SMALLINT NOT NULL,
  party_max    SMALLINT NOT NULL,
  minutes      SMALLINT NOT NULL CHECK (minutes > 0 AND minutes % 5 = 0),
  PRIMARY KEY (shift_id, dining_area, party_min)
);

CREATE TABLE reservation_blocks (        -- special dates, private events, closures
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  period       TSTZRANGE NOT NULL,
  dining_area  TEXT,                     -- null: the whole location
  kind         TEXT NOT NULL CHECK (kind IN ('closed', 'private_event', 'walk_in_only',
                 'special_date')),
  reason       TEXT,
  created_by   UUID NOT NULL             -- staff
);

CREATE TABLE reservation_policies (      -- versioned; frozen on each reservation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  version          INT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('none', 'card_guarantee', 'deposit',
                     'prepayment', 'ticket')),
  amount           BIGINT,               -- minor units
  per              TEXT CHECK (per IN ('person', 'party')),
  cancel_deadline  INTERVAL,             -- before the reservation time; '24 hours'
  late_cancel_fee  BIGINT,
  no_show_fee      BIGINT,
  no_show_grace    INTERVAL NOT NULL DEFAULT '15 minutes',
  refundable       BOOLEAN NOT NULL DEFAULT TRUE,
  transferable     BOOLEAN NOT NULL DEFAULT FALSE,
  max_transfer_price_rule TEXT,          -- where a price-cap law applies
  terms_version    TEXT NOT NULL,        -- the text the guest is shown
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (location_id, version)
);

CREATE TABLE slot_pacing (               -- covers starting per slot; the kitchen's counter
  shift_id     UUID NOT NULL REFERENCES reservation_shifts (id),
  slot_start   TIMESTAMPTZ NOT NULL,
  capacity     SMALLINT NOT NULL,        -- max_covers_per_slot plus any overbook allowance
  claimed      SMALLINT NOT NULL DEFAULT 0 CHECK (claimed >= 0),
  PRIMARY KEY (shift_id, slot_start),
  CHECK (claimed <= capacity)
);

CREATE TABLE reservations (              -- the hold and the booking are the same row
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  guest_id         UUID REFERENCES customers (id),   -- the restaurant's guest (merchant_id set)
  network_customer_id UUID REFERENCES customers (id),  -- the network's diner, when booked there
  party_size       SMALLINT NOT NULL CHECK (party_size > 0),
  starts_at        TIMESTAMPTZ NOT NULL,
  expected_end     TIMESTAMPTZ NOT NULL,  -- starts_at plus the turn time at booking
  shift_id         UUID REFERENCES reservation_shifts (id),
  policy_id        UUID NOT NULL REFERENCES reservation_policies (id),  -- frozen
  channel_id       TEXT NOT NULL REFERENCES sales_channels (id),  -- 'opentable', 'own_web', 'phone'
  surface          TEXT,                 -- 'google', 'apple_maps', 'instagram', an assistant
  attribution      TEXT NOT NULL CHECK (attribution IN ('network', 'direct', 'partner_surface',
                     'phone', 'walk_in', 'staff')),
  plan_ref         TEXT,                 -- the restaurant's plan when booked; decides billing
  external_ref     TEXT,                 -- the network's or surface's booking ID
  status           TEXT NOT NULL CHECK (status IN ('held', 'booked', 'confirmed', 'arrived',
                     'seated', 'completed', 'cancelled', 'late_cancelled', 'no_show',
                     'expired')),
  hold_expires_at  TIMESTAMPTZ,          -- enforced on read while 'held'
  special_requests TEXT,
  occasion         TEXT,
  created_by       UUID,                 -- staff, for phone and walk-in
  idempotency_key  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel_id, external_ref),
  UNIQUE (idempotency_key),
  CHECK ((status = 'held') = (hold_expires_at IS NOT NULL))
);

CREATE TABLE reservation_tables (        -- a table or combination promised to a reservation
  reservation_id  UUID NOT NULL REFERENCES reservations (id),
  dining_table_id UUID NOT NULL REFERENCES dining_tables (id),  -- every member of a combination
  combination_id  UUID REFERENCES table_combinations (id),
  occupies        TSTZRANGE NOT NULL,    -- starts_at to expected_end, moved when the host moves it
  active          BOOLEAN NOT NULL DEFAULT TRUE,  -- false when cancelled, released or expired
  PRIMARY KEY (reservation_id, dining_table_id),
  EXCLUDE USING gist (dining_table_id WITH =, occupies WITH &&) WHERE (active)
);

CREATE TABLE reservation_status_changes (  -- append-only: who moved it, when, from where
  reservation_id UUID NOT NULL REFERENCES reservations (id),
  from_status    TEXT,
  to_status      TEXT NOT NULL,
  party_size     SMALLINT,               -- the party size at that moment
  changed_by     UUID,                   -- staff, guest, or null for the system
  source         TEXT NOT NULL CHECK (source IN ('host_stand', 'guest', 'network', 'surface',
                   'pos', 'system')),
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reservation_charges (       -- deposits, prepayments, fees and their refunds
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  reservation_id   UUID NOT NULL REFERENCES reservations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('card_guarantee', 'deposit', 'prepayment',
                     'ticket', 'late_cancel_fee', 'no_show_fee', 'refund')),
  amount           BIGINT NOT NULL CHECK (amount >= 0),  -- 0 for a guarantee's setup
  payment_ref      TEXT NOT NULL,        -- the Payments volume's record; MIT flags live there
  merchant_of_record TEXT NOT NULL CHECK (merchant_of_record IN ('restaurant', 'network')),
  applied_to_check UUID REFERENCES checks (id),  -- a deposit used as a tender
  approved_by      UUID,                 -- staff who confirmed the no-show
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE waitlist_entries (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  guest_id         UUID REFERENCES customers (id),
  party_size       SMALLINT NOT NULL CHECK (party_size > 0),
  source           TEXT NOT NULL CHECK (source IN ('host_stand', 'remote', 'google',
                     'network')),
  quoted_minutes   SMALLINT,
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at      TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  status           TEXT NOT NULL CHECK (status IN ('waiting', 'notified', 'seated',
                     'left', 'removed'))
);

ALTER TABLE table_sessions               -- seating closes the loop to the booking
  ADD COLUMN reservation_id    UUID REFERENCES reservations (id),
  ADD COLUMN waitlist_entry_id UUID REFERENCES waitlist_entries (id),
  ADD CONSTRAINT table_sessions_one_source CHECK
    (reservation_id IS NULL OR waitlist_entry_id IS NULL) NOT VALID;

CREATE TABLE guest_links (               -- the network's diner and the restaurant's guest
  network_customer_id  UUID NOT NULL REFERENCES customers (id),  -- merchant_id null
  guest_id             UUID NOT NULL REFERENCES customers (id),  -- the restaurant's
  network              TEXT NOT NULL REFERENCES sales_channels (id),
  shared_fields        TEXT[] NOT NULL,  -- what the diner's consent and the contract allow
  linked_by            TEXT NOT NULL CHECK (linked_by IN ('booking', 'match', 'staff')),
  linked_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_at          TIMESTAMPTZ,
  PRIMARY KEY (network_customer_id, guest_id)
);

CREATE TABLE guest_notes (               -- the restaurant's guest book
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  guest_id    UUID NOT NULL REFERENCES customers (id),
  kind        TEXT NOT NULL CHECK (kind IN ('allergy', 'dietary', 'seating', 'vip',
                'occasion', 'service', 'other')),
  body        TEXT NOT NULL,
  source      TEXT NOT NULL CHECK (source IN ('staff', 'guest_at_booking', 'network')),
  created_by  UUID,                      -- staff
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE network_cover_charges (     -- what the network bills, one line per reservation
  reservation_id   UUID PRIMARY KEY REFERENCES reservations (id),
  network          TEXT NOT NULL REFERENCES sales_channels (id),
  billable_covers  SMALLINT NOT NULL CHECK (billable_covers >= 0),  -- seated party size
  rate             BIGINT NOT NULL,      -- per cover, from plan_ref
  amount           BIGINT NOT NULL,
  statement_period DATERANGE NOT NULL,
  disputed_at      TIMESTAMPTZ,
  dispute_outcome  TEXT CHECK (dispute_outcome IN ('upheld', 'credited'))
);

ALTER TABLE reviews                      -- a review of a visit, not of a product
  ALTER COLUMN product_id DROP NOT NULL,
  ADD COLUMN location_id    UUID REFERENCES locations (id),
  ADD COLUMN reservation_id UUID REFERENCES reservations (id),  -- the seated visit
  ADD CONSTRAINT reviews_one_subject CHECK ((product_id IS NULL) <> (location_id IS NULL)) NOT VALID;

ALTER TABLE loyalty_ledger
  ADD COLUMN reservation_id UUID REFERENCES reservations (id);  -- points earn on a seated visit

CREATE VIEW reservation_spend AS         -- what each reservation was worth, by source
SELECT r.id AS reservation_id, r.location_id, r.channel_id, r.attribution,
       ts.party_size AS seated_covers,
       SUM(ol.amount) AS goods_amount
FROM reservations r
JOIN table_sessions ts ON ts.reservation_id = r.id
JOIN order_lines ol ON ol.order_id = ts.order_id
WHERE ol.status NOT IN ('cancelled', 'refunded')
GROUP BY r.id, r.location_id, r.channel_id, r.attribution, ts.party_size;
```

Design decisions behind it:

- **Slots are derived; the book and the constraints are the truth.** No table stores "7:30 is available." Availability is computed from shifts, turn times, table assignments, pacing counters, blocks and online shares, cached for search, and recomputed on every change. The cache is published to channels; the database refuses a conflicting booking whatever the cache said.
- **Two constraints for two limits.** `reservation_tables` excludes overlapping occupancy per table, so a combination claims every member table and can't overlap a reservation on any of them; `slot_pacing` caps covers per increment with a conditional update in the same transaction as the reservation row ([Counters for Pooled Inventory](/docs/building-blocks/reservations-and-holds#counters-for-pooled-inventory)). A reservation that promises capacity without a table yet claims only the pacing counter and a share of the area's table capacity; the table is assigned before service.
- **The hold is the reservation.** A booking that needs a card or a ticket purchase starts as `held` with an expiry enforced on read, and confirming is a state change on the same row, so a channel's retry with the same idempotency key returns the same reservation ([Confirming a Hold, Idempotently](/docs/building-blocks/reservations-and-holds#confirming-a-hold-idempotently)). Cancelled, expired and no-show reservations set `active` false on their table rows in the same transaction.
- **Attribution and policy are frozen at booking.** Channel, surface, attribution, plan and policy version are columns on the reservation, so the cover bill, the fee charged and any dispute read the booking as it was made.
- **Billing follows the host stand.** `network_cover_charges` is generated from the final seated party size after the night closes, not from the booking, and each line can be disputed back to the reservation's status history.
- **Deposits become tenders.** A deposit or prepayment links to the check it was applied to, so the guest pays the difference and the ledger shows one sale ([Point of Sale](/books/commerce/point-of-sale#how-to-build-it)).
- **Two guests, linked by consent.** The network's diner and the restaurant's guest are separate `customers` rows joined by `guest_links`, with the fields that may cross listed on the link; guest notes belong to the restaurant's record.
- **Reviews and points point at the visit.** A review or a points earn needs a reservation that reached `seated` or `completed`; the review's subject is the location, so the product-review constraint gives way to a one-subject check.
- **A local book.** The host stand keeps a local copy of the night's reservations, waitlist and table states and syncs both ways, with the host's change winning a conflict ([Offline Sync](/docs/building-blocks/offline-sync)).
- **Events:** `reservation.booked`, `reservation.cancelled`, `reservation.seated`, `reservation.no_show`, `availability.changed`, `waitlist.notified` and `cover_charge.disputed` go through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)) to channels, notifications, billing and the POS.

## Auditing

- **Every reservation's timeline:** creation with channel, surface and attribution, every status change with who and from where, the table assignments and moves, and the seating record, so a cover bill, a no-show fee or a guest complaint can be traced to what happened at the host stand.
- **Every fee and deposit,** with the policy version and text the guest accepted, the cancellation deadline, the staff member who confirmed a no-show, and the payment and any chargeback ([Audit Trails](/docs/building-blocks/audit-trails)).
- **Network cover statements,** line by line, reconciled to reservations and their final party size, with disputes and credits.
- **Availability publications:** what was pushed to each surface and when, so "the app said 7:30 was open" can be checked against the book at that minute.
- **Guest data movements:** links between network and restaurant records, the fields shared, marketing consents by relationship, exports by a departing restaurant, and privacy requests on each side.
- **Listing agreements** for every restaurant shown on a network or surface, with dates, where a written-agreement law applies.

## What This Means for the System You Build

- **Keep the software and the network as separate products** with separate bills: a subscription for the host stand and a per-cover or per-booking fee for diners the network delivered.
- **Record each reservation's source at booking** (channel, surface, attribution, plan) and bill covers from the seated party, with a statement the restaurant can dispute line by line.
- **Model the dining room as tables, combinations, shifts, turn times by party size and pacing per increment,** and derive slots from them; never store availability as the truth.
- **Search from a pushed cache and book against the source,** with holds that expire on read and invalidation on every change.
- **Version cancellation and deposit policies and freeze them on the booking;** confirm no-shows at the host stand after a grace period, and turn deposits into tenders on the check.
- **Make the host stand the source of truth,** working offline, with every override recorded.
- **Carry the reservation ID onto the table session and the order,** so spend, reviews and points tie to the visit.
- **Keep the network's diner and the restaurant's guest as two linked records,** with consent per relationship and a designed export.
- **Gate listings on written agreements** where the law requires them, cap transfer prices where California does, and count reservation limits per identity rather than per account.

## References

**Filings**

- [Booking Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1075531/000107553126000009/bkng-20251231.htm), OpenTable as a Booking brand, reservation services to consumers and management services to restaurants, and its reservation and subscription revenues
- [DoorDash: First quarter 2025 results (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1792789/000162828025022396/q12025dashex991-pressrelea.htm), the agreement to acquire SevenRooms for about $1.2 billion
- [DoorDash: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/0001792789/000179278926000070/dash-20260930.htm), completion on June 13, 2025 and $1,152 million consideration

**Companies and announcements**

- [American Express: Agreement to acquire Tock from Squarespace (June 21, 2024)](https://ir.americanexpress.com/news/investor-relations-news/investor-relations-news-details/2024/To-Enhance-Dining-Platform-American-Express-Enters-Agreement-to-Acquire-Tock-from-Squarespace-Also-Agrees-to-Acquire-Rooam-0bfe99f4d/default.aspx), $400 million, about 7,000 venues, and Resy acquired in July 2019
- [American Express: Completes acquisition of Tock (October 2024)](https://ir.americanexpress.com/news/investor-relations-news/investor-relations-news-details/2024/American-Express-Completes-Acquisition-of-Tock/default.aspx), completion and Tock as a division of American Express Global Dining
- [Resy: Resy welcomes Tock restaurants, wineries and experiences (August 11, 2026)](https://blog.resy.com/newsroom/resy-welcomes-tock-restaurants-wineries-experiences/), Tock venues on Resy, more than 25,000 venues, Tock purchases toward the Resy Credit from September 15, 2026
- [Resy: An update from CEO Pablo Rivero (February 24, 2026)](https://blog.resy.com/newsroom/resy-tock-update-ceo-pablo-rivero/), the unification of Resy and Tock venues
- [American Express and Toast: Strategic partnership (August 5, 2025)](https://blog.resy.com/newsroom/american-express-and-toast-announce-strategic-partnership-to-help-elevate-hospitality-experiences/), Resy and Tock guest data on Toast chits
- [Resy: Resy and partners support the Restaurant Reservation Anti-Piracy Act](https://blog.resy.com/newsroom/resy-and-partners-support-the-restaurant-reservation-anti-piracy-act), deactivating rogue accounts, cancelling suspicious reservations and blocking bots
- [DoorDash: Completes acquisition of SevenRooms](https://about.doordash.com/en-us/news/doordash-completes-acquisition-of-sevenrooms), more than 13,000 venues
- [Bloomberg Law: Amex to acquire European reservation platform for $700 million (June 15, 2026)](https://news.bloomberglaw.com/banking-law/amex-to-acquire-european-reservation-platform-for-700-million), TheFork from Tripadvisor and the expected close
- [Tripadvisor: Form 8-K (November 2, 2026)](https://www.sec.gov/Archives/edgar/data/1526520/000119312526442627/trip-20261101.htm), completion of the sale of TheFork to American Express on November 1, 2026
- [OpenTable Media launch (February 24, 2026, via Finviz)](https://finviz.com/news/319827/opentable-launches-new-media-network-connecting-brands-with-millions-of-global-diners), the boilerplate: part of Booking Holdings, more than 60,000 restaurants, 1.9 billion seats a year
- [OpenTable Regulars launch (October 27, 2025, via Mann Report)](https://www.mannpublications.com/mannreport/2025/10/27/opentable-unveils-revamped-loyalty-program-opentable-regulars/), points for completed reservations made directly on the platform, 100 to 1,000 points, redemption options
- [OpenTable: Tops 10 million online restaurant reviews (June 15, 2011)](https://prnewswire.com/news-releases/opentable-tops-10-million-online-restaurant-reviews-123905459.html), reviews solicited only from diners who booked and honored reservations

**Platform documentation**

- [Resy: Plans and pricing](https://resy.com/resyos/plans-and-pricing), plan prices, no per-cover or per-reservation fees, prepayment fees, deposits and card holds for no-shows
- [Resy: Merchant terms (June 11, 2024)](https://resy.com/join/merchant-terms/), the license to restaurant content, privacy policy compliance, sharing personal data, marketing opt-ins and chargebacks
- [SevenRooms: Pricing](https://sevenrooms.com/pricing/), quote-based Starter, Growth and Premium plans
- [Toast: Use Toast Tables](https://support.toasttab.com/article/Using-Toast-Tables-Waitlist), waitlist, reservations, floor plan status and turn-time bars, server assignment, Start Order on POS and statuses from POS data
- [Toast: Toast Tables Experiences](https://support.toasttab.com/en/article/Toast-Tables-Experiences), turn times by party size in five-minute increments, max covers per reservation increment, reservation increments
- [Toast: Get help with Toast Tables online waitlist and reservations](https://support.toasttab.com/en/article/Get-Help-with-Toast-Tables-Online-Waitlist-Reservations), shifts, the 15-minute and 2-cover example, combination tables, online share and the online access window
- [Yelp: Yelp Guest Manager](https://business.yelp.com/restaurants/products/yelp-guest-manager/), pricing, no cover fees, distribution surfaces and the comparison with OpenTable and Resy
- [Google: Actions Center](https://developers.google.com/actions-center), the dining vertical, reservations and waitlists
- [Google: Reservations End-to-End overview](https://developers.google.com/actions-center/verticals/reservations/e2e/overview), Reserve with Google partners and the direct contractual relationship requirement
- [Google: Availability feed samples and definitions](https://developers.google.com/actions-center/verticals/reservations/e2e/integration-steps/feeds/availability-feed/samples-definitions), slots per party size, spots, the daily complete feed and synchronous confirmation
- [Google: Structuring real-time updates](https://developers.google.com/actions-center/verticals/reservations/e2e/reference/real-time-updates-rest/rtu), updates within 5 minutes and the daily feed
- [Google Business Profile Help: Bookings through Google](https://support.google.com/business/answer/7475773), "your provider might charge you" and restaurant waitlists

**Law**

- [NY Senate: S9365-A (2023-2024), Chapter 601 of 2024](https://www.nysenate.gov/legislation/bills/2023/S9365), General Business Law §391-w, the written-agreement rule, exclusions, penalties and effective date
- [Governor of New York: Governor Hochul signs legislation cracking down on black-market restaurant reservations (December 19, 2024)](https://www.governor.ny.gov/news/bon-appetit-governor-hochul-signs-legislation-cracking-down-black-market-restaurant), the signing and the bill numbers
- [Louisiana Legislature: Act 135 of 2025 (HB 90) résumé digest](https://www.legis.la.gov/Legis/ViewDocument.aspx?d=1430161), the written agreement, penalties, restitution and August 1, 2025 effective date
- [BillTrack50: Illinois HB 2456](https://www.billtrack50.com/billdetail/1814423), Public Act 104-0227 and its summary
- [New Jersey Legislature: P.L.2026, c.12 (A3318)](https://pub.njleg.gov/Bills/2026/PL26/12_.HTM), the written agreement, penalties, private action and effective date
- [6abc: New Jersey bans restaurant reservation scalping (May 8, 2026)](https://6abc.com/post/new-jersey-bans-restaurant-reservation-scalping/19064117/), the signing and what the law prohibits
- [CalMatters Digital Democracy: AB 1640](https://calmatters.digitaldemocracy.org/bills/ca_202520260ab1640), the California Restaurant Reservation Anti-Piracy Act, Chapter 475 of 2026, the resale price cap, penalties and enforcement
- [GovInfo: H.R. 3403, Supporting Equal Access to Tables Act of 2025](https://www.govinfo.gov/content/pkg/BILLS-119hr3403ih/pdf/BILLS-119hr3403ih.pdf), the federal written-agreement bill as introduced

**Reporting**

- [Fortune: OpenTable data policy (March 15, 2019)](https://fortune.com/2019/03/15/opentable-data), third-party access to guest data, the $1.50 per seated diner fee and SevenRooms
- [PBS NewsHour: Why booking a table may soon mean buying a ticket (June 11, 2015)](https://www.pbs.org/newshour/show/booking-table-may-soon-mean-buying-ticket), Tock's tickets, variable pricing and no-show rates
- [Restaurant Dive: Toast adds reservation and waitlist management (April 25, 2023)](https://restaurantdive.com/news/toast-adds-reservation-waitlist-management-product/648443), Toast Tables' launch prices and no per-cover fees
- [Columbia News Service: Appointment Trader and New York's ban (July 28, 2025)](https://columbianewsservice.com/2025/07/28/new-york-banned-reservation-resales-now-appointment-trader-is-testing-the-law-with-ai/), the resale marketplace, its cut and its New York pause
