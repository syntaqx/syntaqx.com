+++
title = "Cancellations, Guarantees & Disputes"
nav_title = "Cancellations & Disputes"
description = "Cancellation policy catalogs, host cancellation penalties, guarantee programs in front of chargebacks, case lifecycles, and arbitration on marketplaces."
category = "User-Generated Platforms Industry"
order = 1836
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "cancellations", "refunds", "buyer-protection", "disputes"]
+++

A booking is a promise about the future, and a lot can happen before it's kept. Guests change plans; hosts double-book or sell the RV; a hurricane closes the coast; the car turns out to be a different car; the parcel never arrives. A marketplace has to say, for every one of those, who gets what money back, who pays a penalty, and who decides when the two sides disagree. It says it three ways: cancellation policies that set refunds by timing, chosen by the host and frozen at booking; guarantee programs that promise the guest or buyer a remedy when the other side fails; and a case process that decides disputes before they become chargebacks, lawsuits or arbitration demands.

The system problem is that each of these is a contract with a version, a clock and money attached, decided under rules that changed after the booking was made, sometimes by a different party than the one that pays. A refund computed from today's policy instead of the policy the guest accepted is wrong; a guarantee refund that the buyer also chargebacks is paid twice; a host penalty that nobody can explain is a host lost. This chapter covers policy catalogs and per-component refunds, grace periods, extenuating circumstances, host cancellations and their penalties, guarantee programs, the case lifecycle and the one-remedy rule, who funds refunds, support and safety lines, and arbitration. It extends `bookings`, `penalties` and the payments model from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Chargebacks themselves are the Payments volume's [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#on-a-platform-who-pays); this chapter covers the layer in front of them.

## How the Platforms Do It

| Platform | Guest policies | Grace period | Host cancellation | Guarantee |
| --- | --- | --- | --- | --- |
| **Airbnb** | Flexible, Moderate, Limited (from October 1, 2025), Firm; Strict and Super strict by invitation; long-term Firm and Strict; non-refundable rate option | Full refund within 24 hours of booking if booked at least 7 days before check-in | Fee of 10%, 25% or 50% of the reservation by timing (minimum $50), calendar blocked, possible loss of Superhost status, suspension for repeated cancellations | AirCover for guests: rebooking or refund when the host cancels, can't be reached, or the listing is significantly different |
| **eBay** | Not applicable | Not applicable | Seller cancellations counted in performance | Money Back Guarantee: item not received or not as described |
| **Etsy** | Not applicable | Not applicable | Not covered here | Purchase Protection: not as described, damaged, 7+ days late or not delivered |
| **Outdoorsy** | Flexible, Moderate, Strict (bookings from February 2, 2026); service fee non-refundable; protection, add-ons, prep fees and waiver always refunded | 24 hours after confirmation if the trip is 7+ days out, 1 hour if within 7 days, none same-day | Full refund to the guest; instant book paused after a second availability-related cancellation in six months | Not a separate program |
| **RVshare** | Flexible, Standard, Strict | 24 hours if booked 7+ days out, otherwise 1 hour | Full refund except the screening fee | Worry-Free Rental Guarantee up to $10,000 per occurrence, on-platform payments only |
| **Turo** | Free until 24 hours before start; outside that, a fee of half a day (trips of two days or less) or one day of the average trip price; non-refundable trips | 1 hour for bookings within 24 hours of start; 24 hours after booking for non-refundable trips | Full refund to the guest | Not covered here |
| **Vinted** | Not applicable | Not applicable | Not covered here | Refunds for lost, damaged, significantly not-as-described items from non-professional sellers, reported within 2 days of delivery |

The patterns:

- **Hosts choose a policy from a catalog; the platform writes the catalog.** Every rental platform offers three to five named policies with time-based schedules and a platform-wide grace period on top. The host's choice is a parameter, not a custom contract.
- **Refunds are per component.** Outdoorsy refunds protection, add-ons, prep fees and the waiver always, and the service fee never; Turo refunds protection, extras and young-driver fees in full; Airbnb's "full refund" refers to the listing price including taxes, with guest fee refunds treated separately.
- **Host cancellations are punished harder than guest ones.** A guest who cancels loses money under a schedule; a host who cancels pays a fee, loses calendar dates, risks status and ranking, and the platform rebooks the guest.
- **Guarantees promise one remedy, through the platform.** eBay's guarantee forbids a chargeback for the same issue; every rental guarantee applies only to payments made on the platform.

## Cancellation Policy Catalogs

A cancellation policy is a schedule: for a cancellation at a given time before the start, what share of each component the guest gets back and what the host keeps. Airbnb's catalog for stays under 28 nights shows the shape:

| Policy | Full refund until | Then |
| --- | --- | --- |
| **Flexible** | 24 hours before check-in | Host paid for nights stayed plus one night |
| **Moderate** | 5 days before check-in | Host paid one night plus 50% of unused nights |
| **Limited** | 14 days before check-in | 50% between 14 and 7 days; nothing under 7 days |
| **Firm** | 30 days before check-in | 50% between 30 and 7 days; nothing under 7 days |
| **Strict** (invitation) | Only the 24-hour grace period | 50% at 7 days or more; nothing under 7 days |
| **Super strict 30 or 60 days** (invitation) | Only the grace period | 50% at 30 or 60 days or more; nothing after |

Taxes are refunded in full before check-in under every policy. Long stays of 28 nights or more get their own Firm and Strict policies that pay the host for nights stayed plus 30 more. A non-refundable discounted rate sits beside a standard policy for guests who want a lower price.

Rental platforms use fewer tiers with the same structure. Outdoorsy's policies for bookings from February 2, 2026: Flexible refunds 50% of the rental within 30 days of the trip; Moderate refunds 50% between 30 and 8 days and nothing within 7; Strict refunds nothing within 30 days. RVshare's: Flexible (full refund minus fees 30 or more days out, 50% within 30), Standard (50% from 29 to 14 days, nothing within 14) and Strict (nothing within 30). Turo uses one policy for all trips with a fee for late cancellation.

My rules for policies:

- **The catalog is versioned data.** Each policy version is a schedule of tiers (from how long before start, which components refund at what percentage, what the host earns) with an effective range ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). Outdoorsy keeps its legacy policies for bookings made before February 2, 2026; Airbnb's Limited policy applies to bookings from October 1, 2025. The platform needs both versions live at once.
- **The booking freezes the version.** A refund is computed from the policy the guest accepted, never the listing's current policy, and the computation is recorded line by line against the booking's frozen price lines ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it)).
- **Time is measured in the listing's time zone** against the booked start, and the policy says so, because a guest in another zone reads "24 hours before" differently.
- **Components refund by their own rule.** The platform's own fee, protection, deposit waiver, taxes and add-ons each carry a refundability rule independent of the host's policy; the policy governs the host's share.

### Grace Periods

On top of the schedule, every rental platform gives a short window after booking to change one's mind: Airbnb 24 hours if booked at least 7 days before check-in; Outdoorsy 24 hours if the trip is 7 or more days out, 1 hour within 7 days and none on the same day; RVshare the same split; Turo one hour for bookings within 24 hours of start and 24 hours after booking for non-refundable trips. A guest who withdraws a request before the host accepts is refunded in full (Outdoorsy). The grace period is part of the policy version, computed from the booking time, and stored as a deadline on the booking.

### Extenuating Circumstances

Platforms override policies for events beyond anyone's control. Airbnb's Major Disruptive Events Policy covers government-declared public health emergencies (not endemic disease or COVID-19), mandatory travel restrictions such as evacuation orders, military action and terrorism, prolonged utility outages affecting most homes in an area, and unforeseeable natural disasters, where the event affects the reservation's location, occurs after booking and prevents or legally prohibits the stay. When Airbnb activates it for an area and time, guests can cancel for a refund or credit regardless of the policy, and hosts can cancel without fees, though they're not paid for cancelled dates. It excludes illness, flight cancellations, non-binding advisories and foreseeable weather (hurricanes in Florida in season).

The build: an activation is a record with an area, a time range and the rules it overrides; eligibility is a query (does the booking's location and period fall inside, was it booked before the event), and cancellations under it carry a reason that exempts the host from penalties and the cancellation from status metrics (Airbnb's Superhost cancellation rate excludes them). Individual extenuating circumstances (a documented emergency) are cases with evidence, decided by staff.

## Host Cancellations

When a host cancels, the guest loses a trip they may not be able to replace, so platforms refund the guest in full and penalize the host. Airbnb's host cancellation policy for homes (effective October 9, 2023) is the most detailed published:

- **A fee** of 50% of the reservation amount for nights not stayed if cancelled 48 hours or less before check-in (or after), 25% between 48 hours and 30 days, and 10% more than 30 days out, minimum $50, on the base rate plus cleaning and pet fees, usually withheld from the host's next payouts.
- **No payout** for the cancelled reservation.
- **Calendar blocking** of the cancelled dates, so the host can't rebook them at a higher price.
- **Status and account consequences:** loss of Superhost status, and suspension or removal for repeated or unjustified cancellations.
- **Responsibility for "constructive" cancellations:** a listing grossly different from its description (a double booking, a substituted property, a missing pool) is treated as a host cancellation.
- **Waivers** for major disruptive events and documented valid reasons, though the host still isn't paid.

Outdoorsy refunds the guest in full, counts cancellations from account deletion as host cancellations, and pauses instant book for 45 days after a second availability-related cancellation in six months ([Availability & Booking](/books/user-generated-platforms/availability-and-booking)); RVshare refunds everything except the screening fee.

Model host consequences as separate records, because each has its own lifecycle: the fee is a ledger debit against the host's balance ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances) covers recovering it when the balance can't cover it); the calendar block is occupancy of kind `host_block` with a reason; the instant book pause and suspensions are `penalties` rows on the host role with the automated or staff decision behind them ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)); status loss is the next status evaluation ([Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews)). A waiver is a decision that suppresses the fee and the penalty, recorded with its evidence.

### Rebooking the Guest

The guest's remedy for a host cancellation is a refund plus, increasingly, a replacement. Airbnb's AirCover for guests rebooks into a comparable place (by location, amenities, availability and price) or refunds in full or in part, including service fees, when the host cancels before check-in, can't be reached, or the listing is significantly different from its advertisement; it excludes minor inconveniences and travel problems and says it "is not an insurance policy." RVshare's guarantee includes last-minute owner-cancellation rebooking. Rebooking is a booking on another listing linked to the cancelled one, with the price difference funded by the platform (and recovered from the host where the terms allow), and the demand rerouting machinery in [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) finds the candidates.

### When the Platform Cancels Everything

A marketplace that stops operating cancels its own bookings. Getaround announced on February 11, 2025 an orderly wind-down of its US business (car sharing and HyreCar), citing an ongoing lack of liquidity, while its European business continued. Every future booking becomes a platform-initiated cancellation with a full refund, hosts lose income on bookings they relied on, and coverage questions arise for trips in progress. Platform-initiated cancellation is a third initiator beside guest and host, with its own refund rule (always full) and no penalty on either side; [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#ending-a-feature-or-a-service) covers ending a service.

## Guarantee Programs

A guarantee is the platform's promise to the guest or buyer that it will make things right when the other side doesn't. Each published program has the same parts: what it covers, a precondition (pay on the platform, contact the other side first), a waiting period, a deadline, the platform's decision, and the remedy.

| Program | Covers | Process | Limits |
| --- | --- | --- | --- |
| **AirCover for guests** | Host cancels, can't be reached, listing significantly different | Contact Airbnb; rebooking or refund | Not insurance; minor issues excluded |
| **eBay Money Back Guarantee** | Item not received; not as described | Report from the estimated delivery date up to 30 days after; seller has 3 business days to respond; eBay steps in after that, automatically if there's no valid tracking; appeals within 30 days | On-eBay payments only; signature confirmation required as delivery proof on items of $750 or more; excludes vehicles, real estate, services and more; one remedy (no chargeback for the same issue); eBay may hold seller funds while a claim is open and recover refunds |
| **Etsy Purchase Protection** | Not as described, damaged, 7+ days late, not delivered | Buyer messages the seller first; a case can open 48 hours after the help request and once the estimated delivery window passes | Registered account required; eligible orders refunded by Etsy |
| **RVshare Worry-Free Rental Guarantee** | Listing fraud, misrepresentation or denied access (report within 12 hours), last-minute owner cancellation, deposit disputes | Report to RVshare | Up to $10,000 per occurrence; on-platform payments only |
| **Vinted buyer protection** | Not shipped or lost, damaged, significantly not as described, missing from a bundle, marked delivered but not received | Report within 2 calendar days of Vinted's delivery notice, or payment goes to the seller | Buy-now purchases from non-professional sellers; excludes fit, minor differences and payments outside Vinted |

The remedy is funded by the platform first and recovered from the seller where the seller was at fault: eBay may hold seller funds during an open claim and recover refunds it paid on the seller's behalf; Etsy's 10-K says it may reimburse buyers itself to protect its reputation. Buyer protection and forced reversals raise eBay's loss costs, its 10-K says. The ledger has to show both: the refund to the buyer from the platform's funds, and the recovery from the seller's balance, which can go negative. Services platforms often pay the remedy in platform credit instead of cash, which makes it a liability of its own ([Credits and Rewards Are a Liability](/books/user-generated-platforms/services-marketplaces#credits-and-rewards-are-a-liability)).

## The Case Lifecycle

Guarantee claims, damage claims from guests, and complaints about the other side all run on one case shape:

1. **Contact the other side.** The guest or buyer messages the host or seller in the booking's thread. Every program requires it, because most problems end here.
2. **Wait.** A fixed response period (eBay's 3 business days; Etsy's 48 hours; Airbnb's 24 hours for a damage request in the other direction).
3. **Escalate.** The claimant asks the platform to step in, inside the program's deadline.
4. **Decide.** The platform reviews both sides' evidence (messages, listing revision, tracking, handoff photos) and decides a remedy, sometimes automatically (eBay steps in automatically without valid tracking).
5. **Remedy.** Refund, partial refund, return and refund, rebooking, or denial.
6. **Appeal.** A second decision on request within a deadline (eBay's 30 days).

![Case lifecycle. Five numbered steps sit over a row of states: 1 contact over opened, 2 wait over awaiting_respondent, 3 escalate over escalated, 4 decide over in_review, and 5 remedy over decided. An accented remedy arrow leads from decided to closed, whose remedy is a refund, partial refund, return and refund, rebooking or denial. Step 6, appeal, leads from decided to appealed and back to in_review for a second decision. Dashed arrows from awaiting_respondent and escalated join on a chargeback on the payment and end in superseded_by_chargeback, where the dispute process takes the case's evidence. Doubled outlines are terminal states.](/diagrams/ugp-cancellations-and-disputes-case.svg "One case shape for every guarantee program, and one remedy: a chargeback on the same payment supersedes the case instead of paying twice.")

The case is a platform decision about two users' money, so it carries the [Trust & Safety](/docs/security/trust-and-safety#appeals) machinery's virtues: reasons, evidence, notice to both sides, an appeal. It's a different queue from content moderation, staffed by people who know refunds and shipping, but the records have the same shape.

### One Remedy, Not Two

A buyer can ask the platform for a refund and also ask their card issuer for a chargeback. eBay's Money Back Guarantee forbids both for the same issue. The build has to connect them:

- **A case knows its payment.** When a chargeback arrives on a payment with an open case, the case is closed or suspended and the dispute process takes over; when a case is decided in the buyer's favor, the refund is linked so a later chargeback can be answered with "already refunded" ([Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)).
- **Evidence is shared.** The case's messages, tracking and photos are the dispute's evidence package.
- **Who pays a chargeback** (platform or seller) follows the payment model; [On a Platform: Who Pays](/books/payments/disputes-and-chargebacks#on-a-platform-who-pays) covers it.

### Support and Safety Lines

Cases arrive through support as often as through forms. Rental marketplaces run around-the-clock support because trips happen at night and on weekends: Outdoorsy offers support by phone, email and chat at all hours; Airbnb runs an urgent safety line. A safety report (an injury, a threat, an unsafe vehicle) is not a refund case; it routes to a trust and safety queue with a short response target and may involve emergency services and law enforcement ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)). Support actions on bookings and money go through logged, reasoned access ([Support Access & Internal Tools](/docs/security/support-access)).

## Arbitration

Marketplace terms usually send disputes between the user and the platform to individual arbitration with a class action waiver; Outdoorsy publishes a dispute resolution and arbitration agreement alongside its terms. The waiver has created a new exposure: **mass arbitration**, where a law firm files thousands of individual demands at once, each carrying filing and arbitrator fees the company pays under consumer rules. Arbitration providers responded with special procedures: the American Arbitration Association's mass arbitration rules apply when 25 or more similar demands are filed against the same party with coordinated representation, with separate fee schedules (25 or more demands for consumer and employment cases), and a process arbitrator who handles non-merits issues before individual merits arbitrators decide each claim.

Marketplaces are a target because their users are many and their fees are uniform. A law firm has advertised individual arbitration claims against Outdoorsy over drip pricing (an advertisement for claimants, not a filed case or finding; [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees) covers the pricing law). For the system, two things follow: **the terms version each user accepted, and when,** decides which arbitration agreement applies, so acceptance records are evidence ([Re-acceptance on Change](/docs/compliance/electronic-signatures#re-acceptance-on-change)); and **demands are cases too,** tracked with the user, the claim, the representation and the deadlines, so a coordinated wave can be recognized and its exposure counted.

Disputes about moderation decisions in the EU (the DSA's out-of-court settlement bodies) belong to [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#out-of-court-dispute-settlement).

## How to Build It

```sql
CREATE TABLE cancellation_policies (     -- the catalog, versioned
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  code           TEXT NOT NULL,          -- 'flexible', 'moderate', 'limited', 'firm', ...
  version        INT NOT NULL,
  category       TEXT NOT NULL,          -- listings.category it applies to
  long_stay      BOOLEAN NOT NULL DEFAULT FALSE,
  by_invitation  BOOLEAN NOT NULL DEFAULT FALSE,
  tiers          JSONB NOT NULL,         -- [{"before_start": "30 days", "refund_bp":
                                         --   {"rental": 10000, "cleaning_or_prep": 10000}}, ...]
  grace_rules    JSONB NOT NULL,         -- [{"if_booked_before_start": "7 days",
                                         --   "window": "24 hours"}, ...]
  component_rules JSONB NOT NULL,        -- line kinds that always or never refund
  valid_during   TSTZRANGE NOT NULL,     -- bookings made in this range use this version
  UNIQUE (code, version, category, long_stay)
);

ALTER TABLE bookings
  ADD COLUMN cancellation_policy_id UUID REFERENCES cancellation_policies (id),  -- frozen
  ADD COLUMN grace_until            TIMESTAMPTZ;

CREATE TABLE disruption_events (         -- extenuating circumstances activations
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  kind         TEXT NOT NULL CHECK (kind IN ('public_health', 'travel_restriction',
                 'hostilities', 'utility_outage', 'natural_disaster')),
  area         JSONB NOT NULL,           -- subdivisions or a geometry
  affects      TSTZRANGE NOT NULL,       -- service periods covered
  booked_before TIMESTAMPTZ NOT NULL,    -- only bookings made before this
  activated_at TIMESTAMPTZ NOT NULL,
  activated_by UUID NOT NULL REFERENCES accounts (id)
);

CREATE TABLE cancellations (             -- one per cancelled booking
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id         UUID NOT NULL UNIQUE REFERENCES bookings (id),
  initiated_by       TEXT NOT NULL CHECK (initiated_by IN ('guest', 'host', 'platform')),
  reason             TEXT NOT NULL,      -- 'guest_changed_plans', 'host_double_booked',
                                         -- 'listing_not_as_described', 'disruption', ...
  disruption_event_id UUID REFERENCES disruption_events (id),
  within_grace       BOOLEAN NOT NULL,
  policy_tier        TEXT,               -- which tier of the frozen policy applied
  refund_lines       JSONB NOT NULL,     -- per booking_lines row: amount refunded
  host_fee           BIGINT NOT NULL DEFAULT 0,  -- host cancellation fee, minor units
  host_fee_waived    BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_evidence_ref TEXT,
  counts_against_host BOOLEAN NOT NULL,  -- status metrics and sanctions
  rebooking_id       UUID REFERENCES bookings (id),  -- the replacement, if any
  cancelled_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (initiated_by = 'host' OR host_fee = 0)
);

CREATE TABLE protection_cases (          -- guarantee and buyer-protection cases
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id       UUID NOT NULL REFERENCES bookings (id),
  program          TEXT NOT NULL,        -- 'item_not_received', 'not_as_described',
                                         -- 'host_cancelled', 'listing_fraud', ...
  program_version  INT NOT NULL,
  claimant_account_id UUID NOT NULL REFERENCES accounts (id),
  respondent_account_id UUID NOT NULL REFERENCES accounts (id),
  status           TEXT NOT NULL CHECK (status IN ('opened', 'awaiting_respondent',
                     'escalated', 'in_review', 'decided', 'appealed', 'closed',
                     'superseded_by_chargeback')),
  respond_by       TIMESTAMPTZ,
  escalate_after   TIMESTAMPTZ,          -- the waiting period
  escalate_by      TIMESTAMPTZ,          -- the program's deadline
  remedy           TEXT CHECK (remedy IN ('refund', 'partial_refund', 'return_and_refund',
                     'rebooking', 'denied')),
  refund_id        UUID REFERENCES refunds (id),
  recovered_from_seller BIGINT NOT NULL DEFAULT 0,
  dispute_id       UUID REFERENCES disputes (id),  -- the one-remedy link
  decision_id      UUID REFERENCES moderation_decisions (id),  -- reasons, notice, appeal
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);

CREATE TABLE arbitration_demands (       -- user claims against the platform
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID REFERENCES accounts (id),
  forum            TEXT NOT NULL,        -- the provider and rule set
  terms_version    TEXT NOT NULL,        -- the agreement the user accepted
  claim_kind       TEXT NOT NULL,        -- 'pricing', 'refund', 'account_action', ...
  representation   TEXT,                 -- the firm, to recognize a coordinated wave
  status           TEXT NOT NULL CHECK (status IN ('received', 'fees_due', 'pending',
                     'settled', 'award', 'dismissed', 'withdrawn')),
  received_at      TIMESTAMPTZ NOT NULL,
  next_deadline_at TIMESTAMPTZ
);
```

Design decisions behind it:

- **Policies are versioned schedules; bookings freeze them.** `cancellation_policies` holds tiers, grace rules and component rules as data; each booking points at the exact version, and the grace deadline is stored when the booking is made.
- **A cancellation records its computation.** `refund_lines` maps each frozen price line to its refund, so the ledger postings, the tax adjustment and the host's statement all come from one record; refunds themselves are the Payments `refunds` objects ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)).
- **Three initiators, each with its own rules.** Guest cancellations follow the policy; host cancellations refund fully and carry a fee, a block and possibly penalties; platform cancellations refund fully and penalize nobody.
- **Disruptions are activations with an area and time,** and eligibility is a query, so a hurricane's thousands of cancellations are computed consistently and excluded from status metrics.
- **Host consequences are separate records:** the fee in the ledger, the block in occupancy, sanctions in `penalties`, status in the next evaluation. Each can be waived or overturned on its own.
- **Cases have three clocks:** the respondent's deadline, the waiting period before escalation and the program's deadline, all stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **One remedy is enforced by links.** A case links to its refund and to any dispute on the same payment; a chargeback on a payment with an open case moves the case to `superseded_by_chargeback`, and a refunded case is the dispute's evidence.
- **Decisions reuse the moderation decision record** for reasons, notice and appeal, even though the queue is different.
- **Events:** `booking.cancelled`, `cancellation.host_fee_charged`, `disruption.activated`, `protection_case.opened`, `protection_case.escalated`, `protection_case.decided` and `arbitration_demand.received` feed payouts, refunds, notifications, standing and finance.

## Auditing

- **The policy as agreed:** each booking's policy version and grace deadline, and every policy version's schedule and effective range, so any refund can be recomputed.
- **Every cancellation's computation:** initiator, reason, tier applied, per-line refunds, tax adjustments, host fee and waivers with evidence.
- **Disruption activations:** area, time, who activated and which bookings qualified.
- **Cases end to end:** contact, waiting period, escalation, decision with reasons, remedy, recovery from the seller, appeal and any linked chargeback.
- **Host consequences:** fees, blocks, sanctions and status effects of each host cancellation, and their reversals.
- **Terms acceptance and arbitration demands,** by user and version, with representation and deadlines.

## What This Means for the System You Build

- **Keep cancellation policies as versioned schedules** with tiers, grace rules and per-component refundability, and freeze the version on each booking.
- **Store the grace deadline at booking** and measure time in the listing's time zone.
- **Record each cancellation's computation line by line** and post refunds as their own objects.
- **Handle guest, host and platform cancellations under separate rules;** refund fully when the host or platform cancels.
- **Model host consequences as separate records** (fee, block, sanction, status), each waivable with evidence.
- **Activate extenuating circumstances by area and time,** and exempt qualifying cancellations from penalties and metrics.
- **Run guarantees as cases with three clocks** and decisions that carry reasons, notice and appeal.
- **Enforce one remedy** by linking cases to refunds and chargebacks on the same payment.
- **Fund guarantee refunds from the platform and recover from sellers** through the ledger, including negative balances.
- **Track terms acceptance and arbitration demands,** so the applicable agreement and a coordinated wave are both visible.

## References

**Law and arbitration**

- [American Arbitration Association: Mass arbitration](https://www.adr.org/mass-arbitration), the 25-demand threshold, fee schedules and the process arbitrator

**Filings**

- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), the urgent safety line among its trust measures
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), Money Back Guarantee, buyer protection and forced reversals raising loss costs
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), reimbursing buyers to protect its reputation
- [Getaround: Press release, February 11, 2025 (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1839608/000095017025018225/getr-ex99_1.htm), the US wind-down, its reason and the continuing European business

**Platform documentation**

- [Airbnb: Cancellation policies for stays](https://www.airbnb.com/help/article/475), the policy catalog, Limited from October 1, 2025, invitation-only policies, long-term policies, the 24-hour window, the non-refundable option
- [Airbnb: Host cancellation policy for homes](https://www.airbnb.com/help/article/990), fees by timing, minimum, base, no payout, calendar blocking, status and account consequences, waivers, effective October 9, 2023
- [Airbnb: Major Disruptive Events Policy](https://www.airbnb.com/help/article/1320), covered and excluded events, what guests and hosts may do, payouts
- [Airbnb: AirCover for guests](https://www.airbnb.com/help/article/3218), rebooking or refund, covered problems, not insurance
- [Airbnb: How to become a Superhost](https://www.airbnb.com/help/article/829), cancellation rate excluding major disruptive events
- [Outdoorsy: Cancellation and reservation deposit policies for guests](https://support.outdoorsy.com/hc/en-us/articles/37453151389211-What-are-the-cancellation-and-reservation-deposit-policies-for-Guests), the February 2, 2026 policies, grace periods, component refundability, host cancellation refunds
- [Outdoorsy: Legacy cancellation policies](https://support.outdoorsy.com/hc/en-us/articles/45111107721627-Legacy-Outdoorsy-Cancellation-Policies), policies kept for earlier bookings
- [Outdoorsy: How do I delete my Outdoorsy account](https://support.outdoorsy.com/hc/en-us/articles/57132723095195-How-do-I-delete-my-Outdoorsy-account), deletion cancellations counted as host cancellations
- [Outdoorsy: How do I contact customer support](https://support.outdoorsy.com/hc/en-us/articles/37325912200859-How-do-I-contact-Outdoorsy-customer-support), 24/7 phone, email and chat
- [Outdoorsy: Dispute Resolution and Arbitration Agreement](https://support.outdoorsy.com/hc/en-us/articles/37417890458907-Dispute-Resolution-Arbitration-Agreement), the published arbitration agreement
- [RVshare: Renter FAQ](https://rvshare.com/blog/?p=168613), cancellation policies, grace periods, owner cancellations, the Worry-Free Rental Guarantee
- [Turo: Canceling a trip with your host](https://help.turo.com/en_us/canceling-a-trip-with-your-host-HJyUE4xN9.md), free cancellation windows, late cancellation fees, non-refundable trips
- [eBay: Money Back Guarantee policy](https://www.ebay.com/help/policies/ebay-money-back-guarantee-policy/ebay-money-back-guarantee-policy?id=4210), coverage, timing, seller response, eBay stepping in, appeals, one remedy, signature confirmation, exclusions, holds and recovery
- [Etsy: Purchase Protection](https://www.etsy.com/etsy-purchase-protection), coverage, contacting the seller, when a case can open
- [Vinted: Refund policy](https://www.vinted.co.uk/help/465-the-vinted-refund-policy), the 2-day window, coverage and exclusions

**In practice**

- [Labaton Keller Sucharow: Outdoorsy drip pricing claims](https://lantern.labaton.com/case/outdoorsy), a law-firm advertisement for individual arbitration claims, not a filed case
