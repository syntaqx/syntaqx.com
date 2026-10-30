+++
title = "Business Travel & Duty of Care"
nav_title = "Business Travel"
description = "Corporate travel as spend: booking inside policy, travel management companies, how they earn from suppliers and GDSs, NDC in brief, and duty of care."
category = "Banking & Lending Industry"
order = 2468
part = "Spend Management"
tags = ["banking", "spend-management", "travel", "policy", "duty-of-care", "distribution"]
+++

Travel is the one category of company spend that is booked weeks ahead, priced by an airline's revenue management system, paid partly before the trip and partly after, changed or canceled often, and carries a person with it. A finance team wants it inside policy and on the corporate card; a traveler wants it booked quickly and fixed when a flight is canceled at midnight; the company's security team wants to know who is in a city when something happens there. **Travel management companies** (TMCs) such as Amex GBT, and spend platforms that added travel (Navan started there, Ramp, Perk, SAP Concur), sell all three, and they earn most of their money from the suppliers, not the traveler.

This chapter covers booking with policy, what a TMC does and how it earns (client fees, supplier commissions and GDS incentives), the airline distribution shift from GDS to NDC in brief, paying for travel, duty of care, and the records a travel product keeps. The per diem allowances and IRS rules that often replace travel receipts are in [Reimbursements, Mileage & Per Diem](/books/banking-and-lending/reimbursements-and-per-diem#per-diem); the card the trip is charged to is in [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards); receipts and policy review after the trip are in [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management).

## How the Platforms Do It

As of October 2026, from filings and each company's own pages:

| Company | What it is | Scale (its figures) | How it earns | Inventory and channels | Duty of care |
| --- | --- | --- | --- | --- | --- |
| **Amex GBT** (Global Business Travel Group, 2025 10-K) | TMC: Egencia (configurable digital travel and expense), Neo (designed program), plus meetings and consulting; completed the CWT acquisition in September 2025 | About $36.3 billion of total transaction value and $2.72 billion revenue in 2025 | Travel revenue 79% (client transaction fees, supplier fees including "fees from the three major Global Distribution Systems"); products and professional services 21% (management fees, meetings, consulting) | GDSs plus "extensive NDC content" and an NDC bookings dashboard | "Traveler care tools", "duty of care compliance" analytics, destination emergency monitoring and alerts for advisors |
| **Navan** (FY2026 10-K, year to January 31, 2026) | Travel, expense and corporate card platform; competitors named include BCD, Amex GBT and SAP Concur | Gross booking volume $9.1 billion (up 38%); card payment volume $4.1 billion | Travel revenue is usage-based: supplier "commissions, incentives, or transactional fee arrangements", fees above volume thresholds, per-trip fees; expense management is subscription; fees from card partners on spend | "Over 600 airlines" through GDSs, NDC and low-cost carriers; "over two million individual lodging properties" | Not in the sections read; its virtual agent "Ava" handled about 52% of user interactions |
| **Ramp Travel** | Booking inside the spend platform | Not stated | Not stated on the travel page | Flights, hotels and cars; matches trips booked on "any travel platform" to card spend | Monitors "active and upcoming trips" so travelers can be reached in an emergency |
| **Perk** (formerly TravelPerk) | Travel and expense platform | Booking in "more than 178 countries" | Not stated | Flights, hotels, trains and cars, "the widest inventory on the market" (its claim) | Lists duty of care and travel alerts; automatic rebooking on disruption |
| **SAP Concur Travel** | Booking tool sold with Concur Expense and Invoice | Not stated | Not stated | "Unmatched supplier content & booking options" (its claim); an "agentic AI assistant trained on your policies" | Not on the page read |

Three patterns. **Policy is enforced at the moment of booking,** not at expense review: every platform shows the traveler which options are in policy and routes out-of-policy choices to approval, because a nonrefundable fare is spent when it's booked. **The supplier pays the TMC more than the traveler does:** Amex GBT and Navan both describe revenue from airline and hotel commissions and incentives and from GDSs, which makes distribution changes a revenue risk (below). **Spend platforms match travel they didn't book:** Ramp matches trips booked elsewhere to card transactions, because travelers book on airline sites anyway and the expense has to land on a trip either way.

## Booking With Policy

A travel policy is a set of rules a booking engine evaluates against each option the traveler sees:

- **Air:** cabin by flight duration (economy under some hours, premium above), lowest logical fare within a window of the cheapest option, advance purchase days, preferred carriers under a negotiated deal, refundable versus nonrefundable.
- **Hotel:** a nightly cap by city (many companies use the GSA lodging rate for the locality or a multiple of it, which [Per Diem](/books/banking-and-lending/reimbursements-and-per-diem#per-diem) describes), preferred properties with negotiated rates.
- **Car and rail:** car class, rail class, when rail is required instead of air.
- **Trip-level rules:** pre-trip approval above a cost or for international travel, travel to restricted destinations, how far ahead the trip must be booked.

Ramp sets rules "by location, trip length, and department", and Perk's pitch is to "set the rules once" and stop out-of-policy bookings rather than flag them. The design question is the same one an expense policy engine faces: a rule produces **in policy**, **out of policy with a reason** (the traveler picks a reason code and the booking goes to approval) or **blocked**, and the result is stored on the booking with the rule version that produced it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). An out-of-policy flight approved before booking isn't a policy violation at expense review, and the expense system can only know that if it reads the trip's approval.

Pre-trip approval has a clock problem the expense side doesn't: fares change by the hour, and an approval for a $612 fare is worthless if the fare is $780 when the approver clicks. Products either hold the fare where the airline allows it or approve a ceiling rather than a price.

## Travel Management Companies

A TMC books travel for a corporate client's employees under the client's policy and negotiated rates, through an online booking tool or human agents, and services the trip: changes, cancellations, disruption rebooking, unused ticket tracking, invoicing and reporting. Large companies run a **managed travel program**: a TMC contract, negotiated airline and hotel deals, a booking tool, a corporate card or central billing, and data from all of it to renegotiate the deals next year. Amex GBT's Neo is that model; Egencia and the spend platforms sell the self-serve version to smaller companies.

**How a TMC earns:**

- **Client fees:** transaction fees per booking or per trip, and management fees for dedicated agent teams (Amex GBT names both).
- **Supplier revenue:** commissions and incentives from airlines, hotels and car companies, often with overrides when volume passes thresholds (Navan describes fees above contractual thresholds).
- **GDS incentives:** payments from the global distribution systems for bookings made through them. Sabre's 10-K describes the other side: it pays agencies "upfront incentive consideration" that tends to "increase in each round of contract renewals", and larger agencies get more when they route "a certain volume or percentage of its bookings" through its GDS.

That last line explains why a TMC's channel choice isn't neutral, and why the airline industry's move to NDC is a revenue risk Amex GBT names in its risk factors.

## GDS and NDC in Brief

For decades, an airline published its schedules and fares to the **global distribution systems** (three major ones, of which Sabre is a public filer), and agencies booked through them; a booking creates a passenger name record (PNR) in the airline's and the GDS's systems and a ticket record. Sabre earns "transaction fees paid by travel suppliers for selling their inventory through our GDS", which airlines "negotiate for lower fees during contract renewals."

**NDC (New Distribution Capability)** is IATA's XML-based standard, adopted under IATA Resolution 787 in October 2012, "based on Offer and Order management processes for airlines to create and distribute relevant offers to the customer regardless of the distribution channel." In practice it lets an airline sell from its own offer engine, with its bundles, seat and bag options and dynamic prices, through an API that an agency or TMC can call directly or through an aggregator (including a GDS that has added NDC). IATA's next step, **ONE Order** (Resolution 797, June 2017), aims to replace the PNR and the e-ticket and EMD records with a single order record, "gradually phasing out" both.

For a spend or travel product, three consequences:

- **Content differs by channel.** A fare or bundle may exist only through NDC, so a booking tool that reads only the GDS shows the traveler less than the airline's site, and the traveler books direct, outside policy. Navan's "600 airlines through GDSs, NDC and low-cost carriers" is a statement about channel coverage.
- **Servicing differs by channel.** Changes, refunds and disruption handling for an NDC order happen through that airline's API, not the GDS's common commands, so an agent team needs per-airline tooling.
- **Revenue moves.** If volume shifts from GDS bookings to NDC, the GDS incentive shrinks; Amex GBT warns that "airlines shifting volume away from GDSs to the new distribution capability" could reduce its commission revenue. Sabre says its customers are "in various phases of adopting NDC strategies".

The booking record should therefore hold the channel and both kinds of identifier (a PNR record locator and ticket numbers for a GDS booking, an airline order ID for an NDC one), because the channel decides how the trip is changed and who earns what.

## Paying for Travel

Travel is paid several ways, often on one trip:

- **The traveler's corporate card,** at booking for air and at checkout for hotels, which the expense system then matches to the trip.
- **A central travel account,** a card number held by the TMC and billed centrally to the company, so air tickets never touch an individual card; the US government's GSA SmartPay travel line offers centrally billed (CBA) accounts alongside individually billed (IBA) ones, and its travel cards are the main way to buy City Pair Program fares (the commercial card types, lodge accounts among them, are in [Commercial Card Types](/books/banking-and-lending/corporate-cards#commercial-card-types)).
- **Virtual cards per booking,** especially for hotels, where a card number limited to one stay pays the room and taxes and nothing else ([Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls) covers issuing them).
- **Direct billing** to the company under a negotiated hotel agreement, which arrives later as an invoice and goes through [AP, Bill Pay & Procurement](/books/banking-and-lending/accounts-payable).

Each method leaves the charge in a different place, and the trip record is what reunites them. Air tickets bought months ahead are a prepaid expense until the trip happens, which the close has to treat consistently ([Accruals and the Close](/books/banking-and-lending/accounting-sync#accruals-and-the-close)). An unused nonrefundable ticket is usually a credit with the airline, valid for a period and often only for the same traveler, and a TMC tracks those credits so the next booking uses them; an unused credit that expires is money the company lost without anyone seeing it.

## Duty of Care

Duty of care in business travel is the employer's responsibility for the safety and well-being of employees it sends away from their normal place of work: knowing where they are, warning them of risks, reaching them in an emergency, and getting them home. The obligation comes from health and safety and employment law that varies by country, and from contracts and insurance; I couldn't open a primary source that states it for business travel in general, and ISO's travel risk management guidance (ISO 31030) wasn't publicly readable when this was written. <!-- source-gap: travel-duty-of-care-basis | missing | the legal basis of an employer's duty of care toward business travelers, and ISO 31030's scope | closes with: ISO 31030 abstract page readable, or a regulator's guidance (e.g. UK HSE, EU-OSHA) on travel for work | checked: 2026-10-30 -->

What the products do is consistent and concrete. Amex GBT sells "traveler care tools" and "duty of care compliance" analytics, and gives advisors "destination-related emergency monitoring and alerts" and trip recovery tools; Ramp monitors "active and upcoming trips so travelers can be reached quickly"; Perk lists duty of care and travel alerts and rebooks travelers automatically when a flight is disrupted. The capabilities underneath:

- **Know where people are,** from bookings (the itinerary says where a traveler should be tonight), from card transactions for trips booked elsewhere, and, only with consent, from a mobile check-in or location share. The itinerary is the defensible default; continuous location tracking is a privacy decision with its own law, which [Location Tracking](/docs/architecture/location-tracking) covers.
- **Match events to travelers.** When a risk feed reports an event in a city, find every traveler whose itinerary puts them there in the window, and every one arriving soon.
- **Reach them and record the answer.** Send a check-in by push, SMS or email, record "safe" or "need help", and escalate those who don't answer to a person.
- **Act on it.** Rebook, cancel future segments into the area, or hand off to an assistance provider.

The data is sensitive: passport numbers, dates of birth, known-traveler numbers, emergency contacts and where a named person will sleep tonight. Keep identity documents as vaulted identifiers (the core model's `party_identities` already has a `passport` kind) and restrict who can see an itinerary to the traveler, their arranger and the people with a duty-of-care role, with every access logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). Travelers are `parties` rows, their passports and known-traveler numbers `party_identities` rows; card charges reach a trip as card `expenses`, which point at it through `expenses.trip_ref` from [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management#how-to-build-it), and per diem days through `per_diem_claims.trip_id` from [Reimbursements, Mileage & Per Diem](/books/banking-and-lending/reimbursements-and-per-diem#how-to-build-it). This chapter adds policies, trips, bookings, booking-to-charge matches, unused ticket credits and duty-of-care check-ins.

```sql
CREATE TABLE travel_policies (             -- versioned rules a booking is evaluated against
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id    UUID NOT NULL REFERENCES parties (id),
  version        INT NOT NULL,
  applies_to     JSONB NOT NULL,         -- departments, roles or travelers in scope
  rules          JSONB NOT NULL,         -- cabin by duration, hotel caps by locality, advance days, ...
  approval_rules JSONB NOT NULL,         -- pre-trip approval and out-of-policy routing
  valid_during   TSTZRANGE NOT NULL,
  UNIQUE (business_id, version)
);

CREATE TABLE trips (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id    UUID NOT NULL REFERENCES parties (id),
  traveler_id    UUID NOT NULL REFERENCES parties (id),
  arranger_id    UUID REFERENCES parties (id),   -- who booked on the traveler's behalf
  purpose        TEXT NOT NULL,
  starts_on      DATE NOT NULL,
  ends_on        DATE NOT NULL,
  destinations   JSONB NOT NULL,         -- cities and countries with dates
  policy_id      UUID REFERENCES travel_policies (id),
  approval       TEXT NOT NULL CHECK (approval IN ('not_required', 'pending', 'approved',
                   'rejected')),
  approved_ceiling BIGINT,               -- an approval for up to an amount, not a price
  source         TEXT NOT NULL CHECK (source IN ('booked_here', 'tmc_import',
                   'matched_from_card', 'manual')),
  status         TEXT NOT NULL CHECK (status IN ('planned', 'booked', 'in_progress',
                   'completed', 'canceled')),
  CHECK (ends_on >= starts_on)
);

CREATE TABLE travel_bookings (             -- one segment: a flight, stay, car or rail leg
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trip_id          UUID NOT NULL REFERENCES trips (id),
  kind             TEXT NOT NULL CHECK (kind IN ('air', 'hotel', 'car', 'rail', 'other')),
  supplier         TEXT NOT NULL,        -- airline code, hotel chain and property, rental company
  channel          TEXT NOT NULL CHECK (channel IN ('gds', 'ndc', 'direct_api', 'low_cost_carrier',
                     'supplier_site', 'offline_agent')),
  record_locator   TEXT,                 -- PNR locator for a GDS booking
  supplier_order_id TEXT,                -- airline order ID for an NDC booking
  ticket_numbers   TEXT[],
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  location         JSONB NOT NULL,       -- airports, hotel address, pickup point
  fare_basis       TEXT,
  refundable       BOOLEAN,
  amount           BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('corporate_card', 'central_account',
                     'virtual_card', 'direct_bill', 'personal_card', 'credit')),
  policy_result    TEXT NOT NULL CHECK (policy_result IN ('in_policy', 'out_of_policy',
                     'blocked_overridden')),
  policy_reason    TEXT,                 -- the traveler's reason code when out of policy
  policy_version   INT,
  status           TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'ticketed', 'changed',
                     'canceled', 'used', 'no_show')),
  replaces_id      UUID REFERENCES travel_bookings (id),  -- an exchange or rebooking
  booked_at        TIMESTAMPTZ NOT NULL
);

CREATE TABLE booking_charges (             -- card or invoice charges matched to a booking
  booking_id      UUID NOT NULL REFERENCES travel_bookings (id),
  expense_id      UUID REFERENCES expenses (id),       -- a card charge, as its expense
  bill_id         UUID REFERENCES bills (id),          -- a direct-billed hotel invoice
  amount          BIGINT NOT NULL,
  matched_by      TEXT NOT NULL CHECK (matched_by IN ('booking_reference', 'virtual_card',
                    'merchant_date_amount', 'manual')),
  CHECK (num_nonnulls(expense_id, bill_id) = 1)
);

CREATE TABLE ticket_credits (              -- unused nonrefundable tickets held with the airline
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES travel_bookings (id),
  traveler_id     UUID NOT NULL REFERENCES parties (id),
  airline         TEXT NOT NULL,
  amount          BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL,
  transferable    BOOLEAN NOT NULL DEFAULT FALSE,
  expires_on      DATE NOT NULL,
  used_by_booking_id UUID REFERENCES travel_bookings (id),
  status          TEXT NOT NULL CHECK (status IN ('open', 'used', 'expired', 'refunded'))
);

CREATE TABLE traveler_checkins (           -- duty of care: an event, who was there, the answer
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  event_ref       TEXT NOT NULL,          -- the risk feed's event ID
  trip_id         UUID NOT NULL REFERENCES trips (id),
  traveler_id     UUID NOT NULL REFERENCES parties (id),
  located_by      TEXT NOT NULL CHECK (located_by IN ('itinerary', 'card_transaction',
                    'traveler_shared', 'agent')),
  sent_at         TIMESTAMPTZ NOT NULL,
  channels        TEXT[] NOT NULL,        -- 'push', 'sms', 'email', 'call'
  response        TEXT CHECK (response IN ('safe', 'needs_help', 'no_response')),
  responded_at    TIMESTAMPTZ,
  escalated_to    UUID REFERENCES parties (id),
  UNIQUE (event_ref, traveler_id)
);
```

Design notes:

- **A trip is the join.** Bookings, card charges, direct bills, per diem days and expense lines all point at the trip, so one query answers what a trip cost against what was approved, and expense review can see that an out-of-policy fare was approved before it was bought.
- **Bookings are replaced, not edited.** An exchange or rebooking is a new `travel_bookings` row with `replaces_id`, so the original fare, the change fee and the residual value are all visible, and an unused ticket becomes a `ticket_credits` row with its expiry.
- **Store the channel and both identifiers,** because servicing and supplier revenue depend on them.
- **Itinerary first for duty of care.** `traveler_checkins.located_by` records how a traveler was placed in the affected area; a check-in from continuous location data needs the traveler's consent recorded elsewhere and a retention limit.
- **Emit events.** `trip.approved`, `booking.ticketed`, `booking.changed`, `ticket_credit.expiring`, `checkin.no_response` drive approvers, expense matching, the travel manager's credit report and the security desk.

## Auditing

Travel records answer expense audits, tax substantiation of travel away from home (time, place and business purpose), supplier deal reconciliations, and after an incident, whether the company knew where its people were. Make sure the record shows:

- **The policy version each booking was evaluated against,** the result, the traveler's reason when out of policy, and the approval and ceiling that allowed it.
- **Every booking change,** with the original, the replacement, fees and residual credit, and every credit's use or expiry.
- **The match of every charge to a booking,** and every trip charge that wasn't matched.
- **Supplier and channel per booking,** so commissions, incentives and negotiated-rate volume can be reconciled with the TMC's and suppliers' statements.
- **Every duty-of-care event,** who was found in the area and how, each check-in and response, and each escalation.
- **Who viewed a traveler's identity documents or itinerary,** and in what role.

## What This Means for the System You Build

- **Enforce policy at booking,** store the result and the rule version on the booking, and let expense review read it.
- **Approve a ceiling, not a price,** or hold the fare, because fares move while approvals wait.
- **Make the trip the join** for bookings, card charges, direct bills, per diem days and expense lines.
- **Record channel, PNR locator, ticket numbers and NDC order IDs,** because servicing and revenue depend on the channel.
- **Track unused ticket credits** to their expiry and apply them to the next booking.
- **Place travelers by itinerary first** for duty of care, and log every check-in and escalation.
- **Vault identity documents and restrict itinerary access** to the traveler, arranger and duty-of-care roles.

## References

**Filings**

- [Global Business Travel Group (Amex GBT): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1820872/000162828026015817/gbtg-20251231.htm), Egencia and Neo, the CWT acquisition in September 2025, $36.3 billion TTV and $2.72 billion revenue, the travel and services revenue split, GDS fees, NDC content and the NDC revenue risk, traveler care and duty of care analytics
- [Navan: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1639723/000162828026023250/navn-20260131.htm), usage-based supplier revenue and subscription expense management, GBV of $9.1 billion and payment volume of $4.1 billion, 600 airlines via GDS, NDC and low-cost carriers, two million lodging properties, competitors, and the Ava agent
- [Sabre: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1597033/000162828026008800/sabr-20251231.htm), GDS transaction fees paid by suppliers, incentive consideration to agencies rising at renewals and tied to booking share, airlines negotiating lower fees, and NDC adoption

**Standards**

- [IATA: New Distribution Capability (NDC)](https://www.iata.org/en/programs/airline-distribution/retailing/ndc/), the XML standard based on offer and order management, Resolution 787
- [IATA: ONE Order](https://www.iata.org/en/programs/airline-distribution/retailing/one-order/), a single order record phasing out PNRs and ticketing records, Resolution 797

**Regulators and guidance**

- [GSA SmartPay: Business lines](https://smartpay.gsa.gov/about/business-lines/), travel accounts as individually or centrally billed, and travel cards for City Pair Program fares

**Vendor documentation**

- [Ramp: Travel](https://ramp.com/travel), policy at booking by location, trip length and department, matching trips booked on any platform to card transactions, and monitoring active and upcoming trips
- [Perk](https://www.perk.com/), booking in more than 178 countries, policy enforcement, duty of care and travel alerts, automatic rebooking, per diems and receipt matching
- [SAP Concur](https://www.concur.com/), Concur Travel's policy-trained assistant and supplier content claims
