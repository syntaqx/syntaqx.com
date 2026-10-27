+++
title = "Handoffs, Damage & Claims"
description = "Check-in and check-out evidence, readings and signed agreements, claim windows, appraisal and total loss, subrogation, and fraud-aware settlement."
category = "User-Generated Platforms Industry"
order = 1829
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "claims", "evidence", "insurance", "handoffs"]
+++

Every rental ends with two people looking at the same vehicle and remembering it differently. The host says the awning was fine when it left; the guest says the scratch was already there; the photos are on two phones, one of them with the location turned off. A claim is decided on what was recorded at the handoff, under a deadline that started when the trip ended, by a process that has to pay an honest host quickly, refuse a dishonest one, and leave a record an insurer, a card network and possibly a court will read.

That makes the handoff the most important moment in the system and the claim its most scrutinized record. This chapter covers the handoff (in person, remote and delivered), the evidence it must capture to be worth anything later, the signed agreement, readings that feed usage charges, claim intake windows and requirements, appraisal, repair supplements and total loss, settlement across the layers of protection, recovery and subrogation, and the anti-fraud rules platforms apply to claims. It extends `bookings` and `media_assets` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and uses the deposits and protection products from [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection). The host's turnover and proof-of-service side of short-term rentals is in the Property Tech volume's [Turnovers](/books/property-tech/short-term-rentals#turnovers).

## How the Platforms Do It

| Platform | Handoff evidence | Claim window | Settlement rules |
| --- | --- | --- | --- |
| **Outdoorsy** (RVs) | In-app digital key exchange: rental contract signed, photos from the app camera with a non-editable timestamp and GPS, pre-existing damage tagged, mileage and generator readings; repeated at return; works offline and uploads later | 48 hours after the booking ends, with the app's pre- and post-trip photos and the signed contract | Licensed appraisers review repair supplements; total loss paid at ACV up to $300,000, lienholder paid first; deposit held at least 30 days when a claim is filed |
| **Turo** (cars) | Pre-trip photos taken within 24 hours before start and uploaded within 24 hours after; post-trip photos within 24 hours after the end; photos without date, time and geolocation metadata are invalid; remote unlock with Turo Go | Incidental invoices within 5, 4 or 3 days depending on the host's plan | Independent inspection possible; reimbursement-only settlement where fraud is suspected; repairs at Turo-listed ineligible facilities not reimbursed from August 18, 2026; no loss of income; claims administered by Constitution State Services |
| **Airbnb** (stays) | Host's own photos, videos, estimates and receipts | Request through the Resolution Center within 14 days of the guest's checkout | Guest has 24 hours to respond; then a host damage protection request reviewed by Airbnb (by the insurer for stays in Washington state); some requests reviewed automatically, with human review on request |
| **Outdoorsy's car brand** | In-app | Claims to the insurer within 48 hours from the host's fleet dashboard | Insurer-administered |

The patterns:

- **The platform's camera is the evidence.** Outdoorsy's and Turo's rules say the same thing in different words: photos count when the platform can prove when and where they were taken. A photo emailed later from a camera roll is a claim the platform can't defend.
- **Windows are short and measured from the trip's end.** Forty-eight hours, three to five days, fourteen days: short enough that evidence is fresh and the guest can still respond, long enough for a host to notice damage.
- **Settlement is fraud-aware by design.** Turo's reimbursement-only settlement, independent inspections and ineligible repair shops exist because claims are a payout path, and payout paths attract fraud.
- **The counterparty gets a turn.** Airbnb's 24-hour guest response before the platform steps in is the general shape: the guest can pay, contest or ignore, and each answer routes differently.

## The Handoff

A handoff is the moment control of the asset changes, and it does three jobs: it proves the asset's condition, it records the readings that price the trip, and it marks when the booking's coverage period starts or ends. In-person handoffs, remote handoffs and delivery all produce the same record:

- **In person.** Host and guest walk the vehicle together with the app open, both confirm the photos and readings, and the guest signs. Outdoorsy's digital key exchange is this flow, and completing it on time also releases the host's payout ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#payout-triggers) covers the trigger).
- **Remote.** The guest unlocks a car with the app (Turo Go) or collects keys from a lockbox, and takes the photos alone. The evidence rules carry more weight because nobody else was there.
- **Delivery.** The host brings the vehicle to the guest, often with live location shared, and for a stationary RV sets it up on site. The handoff happens at the delivery location, and a stationary rental that is later moved changes what's covered ([Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection)).

The handoff starts the booking's `in_progress` state and the return handoff ends it ([Availability & Booking](/books/user-generated-platforms/availability-and-booking)). Those two timestamps define the car sharing period that state law cares about, which is why they're server-recorded facts, not the booked times.

## Evidence That Holds Up

The rules converge on what makes a photo evidence:

| Property | Why | Published example |
| --- | --- | --- |
| **Captured in the platform's app** | The platform controls the timestamp and can show the file wasn't edited | Outdoorsy's in-app camera with a non-editable timestamp |
| **Device time and location** | Ties the photo to the handoff's place and time | Turo: photos without date, time and geolocation metadata are invalid |
| **Server receipt time** | Bounds when the photo existed, independent of the device clock | Turo's upload windows within 24 hours |
| **Inside the window** | A "before" photo from last month proves nothing about today | Turo's 24 hours before start; Outdoorsy's capture at the exchange |
| **Coverage of the asset** | Every side, the interior, the roof of an RV, the odometer and fuel gauge | Required angles per asset class |
| **Annotated damage** | Pre-existing damage tagged and described at pickup is excluded from the return claim | Outdoorsy's tagging of pre-existing damage |

Offline capture matters for rentals: campgrounds and trailheads don't have signal. Outdoorsy's app captures offline and uploads later. The design consequence is that device time and server time are both stored, the gap between them is visible to reviewers, and a capture's integrity is protected on the device (a hash computed at capture and checked at upload) rather than trusted on arrival.

Evidence photos are media assets like any other, with the core model's hashes and states ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)), plus capture metadata. Two rules specific to evidence: **never strip what makes them evidence** (location and capture time are removed from public images and kept on evidence, which is never public), and **never let a party edit them** (a correction is a new photo with a note, not a replacement). Perceptual hashes catch reuse: the same "damage" photo submitted for two claims, or a pickup photo recycled from an earlier trip, is a fraud signal ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud)).

### The Signed Agreement

The rental agreement is the contract the claim enforces. Outdoorsy lets both parties sign as soon as the booking confirms and requires the digital rental contract signed by both for charges beyond the deposit and for claims. The agreement is an electronic signature like any other: consent to electronic records, the document version, who signed, when and how ([What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds)). The platform-specific part is that its terms reference the booking's frozen protections, deposit and usage rates, so the agreement's version and the booking's version have to agree, and a modification that changes them may need a new signature.

### Readings

Odometer, generator hours, fuel or charge level and, for some assets, engine hours are captured at both handoffs with a photo of the gauge. They price usage (extra miles and generator hours, fuel not replaced: [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees)) and they're evidence in claims (a vehicle driven far beyond what was booked, a generator run for days). Store the reading, its unit, the photo and who entered it; compute the difference only from two readings on the same booking.

## Claims

A claim is a request by one side (usually the host) for money for a loss tied to a booking. Kinds differ in evidence and route:

| Kind | Typical evidence | Typical route |
| --- | --- | --- |
| **Damage** | Pickup and return photos, estimates, invoices | Deposit, then guest plan, then host plan or insurer |
| **Theft or non-return** | Police report, location data | Host plan or insurer; law enforcement (Outdoorsy requires a police report for theft and vandalism) |
| **Total loss** | Appraisal, title, lienholder details | Insurer or host plan at ACV |
| **Cleaning, smoking, pets** | Photos, receipts | Deposit or post-trip charge; often excluded from protection |
| **Usage and fuel** | Readings | Post-trip charge |
| **Liability** | Third-party claim, police report | Liability insurer |
| **Guest claims** | Misrepresentation, breakdown, injury | [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes); liability insurer |

### Windows and Requirements

Every claim has a filing window measured from the trip's end and a list of required documents, both set by the protection product in force at booking. Outdoorsy's is 48 hours with the app's photos and the signed contract; Airbnb's is 14 days from checkout through the Resolution Center, with photos or videos, estimates or receipts; Turo's incidental invoices fall within three to five days by plan. My rule: **the window is a stored deadline on the booking,** computed when the return handoff completes from the protection version frozen at booking ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), shown to the host, and enforced by the claim form. A claim after the window is refused by the system, with an exception path that records who allowed it and why.

The window also holds data. Records that a claim may need (identity verification images, messages, evidence photos, the deposit) can't be erased while the window is open or a claim is pending: Outdoorsy erases verification files only after a 30-day post-trip window and requires no open claims, deposits or disputes before full erasure. That's a `legal_holds` row with reason `claim_window`, released when the window closes without a claim or the claim is resolved ([Deletion, Claims and Legal Holds](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds)).

### The Counterparty's Turn

Before the platform or an insurer decides, the other side is told and can answer. Airbnb gives the guest 24 hours to pay, contest or ignore a host's request; ignoring or declining sends it to review. The design is a claim state machine with a response deadline and three exits:

- **Accepted:** the guest pays (from the deposit, the card on file or directly) and the claim closes.
- **Disputed:** the guest contests, with their own evidence; the claim goes to review with both sides' material.
- **No response:** the deadline passes; the claim goes to review as if disputed.

Messages about the claim stay in the booking's thread, because they're part of the record ([Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews)).

### Review, Appraisal and Supplements

Review compares the return evidence to the pickup evidence, checks the claim against the protection's exclusions and limits, and values the loss. For vehicles, valuation is an appraisal: an estimate from a repair facility, reviewed by an appraiser, and **supplements** when the repair uncovers more damage than the first estimate showed. Outdoorsy describes supplements reviewed by licensed appraisers. Turo may require an independent inspection and won't reimburse repairs at facilities it lists as ineligible.

Automated review is coming for the simple cases: Airbnb says some requests are reviewed automatically, with a human review on request and a chance to add evidence. An automated claim decision is an automated decision about money owed; record it like one ([Automated Risk Decisions](/docs/architecture/risk-scoring#the-decision-record)) and keep the human path.

### Total Loss

When repair costs approach the vehicle's value, it's a total loss, paid at actual cash value up to the plan's cap (Outdoorsy's $300,000, Turo's $200,000), and **the lienholder is paid first**: a financed vehicle's payoff goes to the lender before anything reaches the host. The claim therefore needs the lienholder and payoff amount (recorded on the asset at onboarding: [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)), and the title transfers to whoever paid. The listing is retired; the asset record stays, with the total loss on its history.

Loss of use (the bookings a host loses while the vehicle is repaired) is excluded by Outdoorsy's host protection and by Turo's plans ("no loss of income"), and included in Airbnb's host damage protection for stays. Whether it's covered is a term of the product, and hosts ask about it more than anything else.

## Settlement

A settled claim is paid from one or more sources, in an order the products define:

1. **The deposit**, captured up to the guest's deductible or the approved amount (Outdoorsy uses it first for deductibles).
2. **The guest's card on file**, for amounts the guest owes beyond the deposit and outside their plan ([Post-Trip Charges](/books/user-generated-platforms/deposits-and-protection#post-trip-charges) is the mechanism).
3. **The guest's protection plan**, for damage above the guest's maximum responsibility.
4. **The host's plan or the platform's guaranty**, for the host's loss above the host's deductible, up to the cap.
5. **An insurer**, for liability and, where the platform buys it, physical damage.
6. **The guest's own insurer**, where the platform's coverage is excess.

Each payment is a ledger entry with its source, so a claim's settlement can be rebuilt line by line, and the host's payout for the claim follows the Payments volume's payout model ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)). Turo pays reimbursements through Stripe to a debit card or by check.

### Recovery and Subrogation

When the platform, its plan or an insurer pays a host for damage the guest caused, it steps into the host's claim against the guest (subrogation) and recovers what it can: from the guest's card, from the guest's own insurer where the platform's coverage was excess, or through collections. Outdoorsy's terms have hosts appoint Outdoorsy or an affiliate as attorney-in-fact to file and receive insurance claims, which lets the platform pursue the insurers directly. Recovery is a separate record from settlement: the host is paid on the plan's terms whatever is later recovered, and the recovered amounts reduce the platform's or insurer's loss.

## Fraud-Aware Settlement

Claims pay money on evidence the claimant collected, so they attract fraud from both sides: hosts claiming old damage, inflating estimates or staging losses; guests disputing real damage or colluding with a host; repair shops billing for work not done. Platforms publish some of their defenses:

- **Reimbursement only.** Turo may settle only by reimbursing documented repairs, rather than paying an estimate in cash, where fraud is suspected. A host who must show the repair invoice can't pocket an inflated estimate.
- **Independent inspection.** Turo may send an inspector before paying.
- **Ineligible facilities.** Repairs at shops Turo lists as ineligible aren't reimbursed (from August 18, 2026).
- **Anti-theft conditions.** Turo withholds up to 20% on vehicles worth $125,000 or more without an activated manufacturer tracker.
- **Evidence integrity.** Metadata requirements and in-app capture defeat recycled photos.

Behind those, a claim gets the same risk scoring as a booking: the host's claim history, the asset's history, the guest's history, the gap between device and server times on evidence, reused photo hashes, and links between host and guest accounts ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud)). A high score routes to inspection or reimbursement-only settlement; it never denies a claim by itself.

## Goods: Not as Described

Goods marketplaces have the same problem without a handoff: the buyer opens the box and says the item isn't what was listed. There's no pickup photo, so the listing revision the buyer purchased is the "before" evidence ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)) and the buyer's photos and the return shipment's tracking are the "after." The case flow (buyer contacts seller, waits, escalates to the platform, return and refund) belongs to [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes).

## How to Build It

```sql
CREATE TABLE handoffs (                  -- pickup and return, each a signed record
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id         UUID NOT NULL REFERENCES bookings (id),
  phase              TEXT NOT NULL CHECK (phase IN ('pickup', 'return')),
  mode               TEXT NOT NULL CHECK (mode IN ('in_person', 'remote', 'delivery')),
  agreement_version  TEXT,               -- the rental agreement signed at pickup
  agreement_signed_by UUID[],            -- accounts that signed
  odometer           NUMERIC(10,1),
  odometer_unit      TEXT CHECK (odometer_unit IN ('mi', 'km')),
  generator_hours    NUMERIC(8,1),
  fuel_level_pct     SMALLINT CHECK (fuel_level_pct BETWEEN 0 AND 100),
  location           POINT,              -- where the handoff happened
  completed_by       UUID NOT NULL REFERENCES accounts (id),
  confirmed_by       UUID REFERENCES accounts (id),  -- the other party, when present
  device_completed_at TIMESTAMPTZ,       -- as the device reported
  completed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- server time
  UNIQUE (booking_id, phase)
);

CREATE TABLE handoff_photos (            -- evidence, never edited, never public
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  handoff_id       UUID NOT NULL REFERENCES handoffs (id),
  media_asset_id   UUID NOT NULL REFERENCES media_assets (id),
  area             TEXT NOT NULL,        -- 'front', 'roof', 'interior_galley', 'odometer', ...
  captured_in_app  BOOLEAN NOT NULL,
  device_taken_at  TIMESTAMPTZ,
  latitude         NUMERIC(9,6),
  longitude        NUMERIC(9,6),
  capture_sha256   BYTEA,                -- computed on the device at capture
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pre_existing_note TEXT,                -- damage tagged at pickup
  supersedes_id    UUID REFERENCES handoff_photos (id)  -- corrections add, never replace
);

ALTER TABLE bookings
  ADD COLUMN claim_window_closes_at TIMESTAMPTZ;  -- computed at the return handoff

CREATE TABLE damage_claims (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id       UUID NOT NULL REFERENCES bookings (id),
  asset_id         UUID REFERENCES assets (id),
  claimant_side    TEXT NOT NULL CHECK (claimant_side IN ('host', 'guest', 'platform')),
  kind             TEXT NOT NULL CHECK (kind IN ('damage', 'theft', 'non_return', 'total_loss',
                     'cleaning', 'usage', 'liability')),
  status           TEXT NOT NULL CHECK (status IN ('filed', 'awaiting_response', 'accepted',
                     'disputed', 'in_review', 'inspection', 'approved', 'partially_approved',
                     'denied', 'settled', 'withdrawn', 'appealed')),
  filed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  late_exception   TEXT,                 -- who allowed a filing after the window, and why
  response_due_at  TIMESTAMPTZ,          -- the counterparty's turn
  amount_claimed   BIGINT NOT NULL,
  amount_approved  BIGINT,
  currency         CHAR(3) NOT NULL,
  settlement_mode  TEXT CHECK (settlement_mode IN ('estimate', 'reimbursement_only')),
  risk_decision_id UUID REFERENCES risk_decisions (id),
  decided_by       TEXT,                 -- typed actor: 'system:claims', 'adjuster:<id>'
  decided_at       TIMESTAMPTZ
);

CREATE TABLE claim_items (               -- line by line: what was damaged, what it costs
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id        UUID NOT NULL REFERENCES damage_claims (id),
  description     TEXT NOT NULL,
  pickup_photo_id UUID REFERENCES handoff_photos (id),
  return_photo_id UUID REFERENCES handoff_photos (id),
  estimate_asset_id UUID REFERENCES media_assets (id),   -- estimate or invoice document
  kind            TEXT NOT NULL CHECK (kind IN ('estimate', 'supplement', 'invoice',
                    'appraisal')),
  amount          BIGINT NOT NULL,
  decision        TEXT CHECK (decision IN ('approved', 'denied', 'excluded')),
  reason          TEXT                   -- 'pre_existing', 'interior_excluded', 'wear', ...
);

CREATE TABLE claim_settlements (         -- each source that paid, in order
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id        UUID NOT NULL REFERENCES damage_claims (id),
  sequence        SMALLINT NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('deposit', 'guest_card', 'guest_plan',
                    'host_plan', 'platform_guaranty', 'insurer', 'guest_insurer')),
  booking_protection_id UUID REFERENCES booking_protections (id),
  post_trip_charge_id   UUID REFERENCES post_trip_charges (id),
  payee           TEXT NOT NULL CHECK (payee IN ('host', 'lienholder', 'repair_facility',
                    'third_party')),
  amount          BIGINT NOT NULL CHECK (amount > 0),
  currency        CHAR(3) NOT NULL,
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  paid_at         TIMESTAMPTZ,
  UNIQUE (claim_id, sequence)
);

CREATE TABLE claim_recoveries (          -- subrogation: what was recovered, from whom
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id        UUID NOT NULL REFERENCES damage_claims (id),
  from_party      TEXT NOT NULL CHECK (from_party IN ('guest', 'guest_insurer',
                    'third_party', 'third_party_insurer')),
  status          TEXT NOT NULL CHECK (status IN ('demanded', 'in_collections', 'recovered',
                    'partially_recovered', 'written_off')),
  amount_demanded BIGINT NOT NULL,
  amount_recovered BIGINT NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design decisions behind it:

- **Handoffs are records, one per phase.** Their server timestamps start and end `in_progress` and the car sharing period; readings, location and the signed agreement version live on them, and the other party's confirmation is recorded when present.
- **Evidence keeps both clocks and a capture hash.** Device time, server receipt time and a hash computed at capture let a reviewer see gaps and edits; corrections supersede, never replace. Evidence photos are `media_assets` exempt from metadata stripping and never public.
- **The window is a column, computed once.** `claim_window_closes_at` is set from the frozen protection when the return handoff completes, and a `legal_holds` row with reason `claim_window` keeps evidence, messages and verification files until it closes or the claim resolves.
- **Claims are items, not a lump sum.** Each damaged part carries its before and after photos, its document and its own decision and reason, so a partial approval explains itself and a supplement adds an item instead of editing one.
- **Settlement is ordered sources.** Each `claim_settlements` row says which layer paid, under which frozen protection, to whom (lienholder first for a total loss) and with which ledger transaction.
- **Recovery is separate from settlement.** The host's payment doesn't wait on subrogation; recoveries reduce the payer's loss on their own records.
- **Risk feeds the route, not the answer.** A claim's `risk_decision_id` can send it to inspection or reimbursement-only settlement; denial is a reviewed decision with reasons.
- **Events:** `handoff.completed`, `claim.filed`, `claim.response_due`, `claim.decided`, `claim.settled`, `claim.appealed` and `claim.recovered` go through the outbox to notifications, payouts, deposits (extension and capture) and the asset's history.

## Auditing

- **Handoffs:** both phases with server and device times, location, readings, agreement version and who confirmed, kept for as long as claims and statutes require (three years under Washington's car sharing law).
- **Evidence integrity:** every photo with its capture metadata and hash, and every correction.
- **Claims end to end:** filing time against the window, the counterparty's response, every item's decision and reason, appraisals and supplements, the deciding actor (automated or human) and appeals.
- **Settlement and recovery:** each source's payment with its ledger entry, lienholder payoffs, and each recovery attempt.
- **Holds:** every `claim_window` hold and its release, so erasure after the window can be shown to have waited for it.

## What This Means for the System You Build

- **Capture handoff evidence in your own app,** with device time, server time, location and a capture hash, offline-capable.
- **Record readings and the signed agreement on the handoff,** and use handoff timestamps, not booked times, for the trip's start and end.
- **Store the claim window as a deadline** computed from the frozen protection, and hold the records a claim needs until it closes.
- **Give the counterparty a turn** with a response deadline before review.
- **Break claims into items** with before and after photos, documents and per-item decisions; handle supplements as new items.
- **Pay lienholders first on a total loss,** and record whether loss of use is covered by the product in force.
- **Settle from ordered sources** with a ledger entry each, and track subrogation separately.
- **Route risky claims to inspection or reimbursement-only settlement,** never to automatic denial.

## References

**Law and regulation**

- [Washington Senate Bill Report: SHB 1389, peer-to-peer car sharing](https://lawfilesext.leg.wa.gov/Biennium/2021-22/Htm/Bill%20Reports/Senate/1389-S%20SBR%20BFST%20TA%2022.htm), three-year records provided to insurers for claims, the sharing period

**Filings**

- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), in-app check-in and check-out, Turo Go remote unlock, host delivery with live location, post-trip incidentals

**Platform documentation**

- [Outdoorsy: The Digital Key Exchange walkthrough for hosts](https://support.outdoorsy.com/hc/en-us/articles/43260235706907-The-Digital-Key-Exchange-Walkthrough-for-Hosts), contract signing, in-app photos with non-editable timestamp and GPS, offline capture, pre-existing damage, readings, return
- [Outdoorsy: What happens if my RV is returned with damage](https://support.outdoorsy.com/hc/en-us/articles/37607412541723-What-happens-if-my-RV-is-returned-with-damage), the 48-hour window, required photos and contract, total loss at ACV and lienholder payoff
- [Outdoorsy: What is a supplement](https://support.outdoorsy.com/hc/en-us/articles/37657671744667-What-is-a-supplement-How-is-a-supplement-filed), supplements reviewed by licensed appraisers
- [Outdoorsy: Summary of Host Protection Policy](https://support.outdoorsy.com/hc/en-us/articles/37881323218331-Summary-of-Host-Protection-Policy), police reports for theft and vandalism, no loss of use, ACV cap
- [Outdoorsy: What is the security deposit](https://support.outdoorsy.com/hc/en-us/articles/37455537111835-What-is-the-security-deposit-How-does-it-work-for-my-listing), deposit held at least 30 days on a claim, first source for deductibles
- [Outdoorsy: What if I need to charge more than the security deposit](https://support.outdoorsy.com/hc/en-us/articles/48932008371483-What-if-I-need-to-charge-more-beyond-the-amount-of-the-security-deposit), the signed contract requirement
- [Outdoorsy: Fee structure and how hosts get paid](https://support.outdoorsy.com/hc/en-us/articles/37916164272283-What-is-your-fee-structure-And-how-do-I-get-paid), completing the key exchange releases payout
- [Outdoorsy: Terms of Service](https://support.outdoorsy.com/hc/en-us/articles/37422344026779-Outdoorsy-Terms-of-Service), hosts appoint Outdoorsy as attorney-in-fact for insurance claims
- [Outdoorsy: Ride Auto Protection Packages](https://support.outdoorsy.com/hc/en-us/articles/46808722668827-Ride-Auto-Protection-Packages), insurer claims within 48 hours from the fleet dashboard
- [Outdoorsy: How do I delete my Outdoorsy account](https://support.outdoorsy.com/hc/en-us/articles/57132723095195-How-do-I-delete-my-Outdoorsy-account), the 30-day post-trip window and no open claims before erasure
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), photo windows and metadata rule, independent inspection, reimbursement-only settlement, ineligible facilities from August 18, 2026, incidental invoice windows, tracker withholding, no loss of income, Constitution State Services, Stripe payouts
- [Airbnb: Requesting payment for damage](https://www.airbnb.com/help/article/279), 14 days from checkout, evidence, the guest's 24 hours, host damage protection review, Washington state, automated and human review
- [Airbnb: AirCover for Hosts](https://www.airbnb.com/aircover-for-hosts), income loss among covered items for stays
