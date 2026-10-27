+++
title = "Deposits, Protection Plans & Insurance"
nav_title = "Deposits & Protection"
description = "Deposit holds and waivers, post-trip charges, embedded insurance versus contractual protection, host and guest plan tiers, car-sharing law and licensing."
category = "User-Generated Platforms Industry"
order = 1828
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "insurance", "deposits", "protection-plans", "car-sharing"]
+++

A rental marketplace hands a stranger's $150,000 motorhome to another stranger for a week. Everything that makes that tolerable is money arranged in advance: a hold on the guest's card in case of damage, a protection plan the guest buys to limit what they owe, a plan the host chose that decides how much of a loss comes back to them, liability insurance that pays if the guest injures someone, and roadside help when a tire blows in the desert. Each of these is a product with a legal form (an authorization, a waiver, a contract, a guaranty, an insurance policy) and the legal form decides who may sell it, who regulates it, what the guest must be told and who pays when it fails.

The engineering is hard because the products are layered and timed. A deposit hold has to exist when the trip starts and survive long enough after it to cover a claim, but card authorizations expire in days. A guest's plan, a host's plan and the platform's insurance each cover part of the same loss, with deductibles, limits and exclusions that are frozen at booking and read months later when the claim arrives. And regulators draw lines: an insurance policy needs a licensed insurer and a licensed producer; a contractual promise to reimburse doesn't, as long as it isn't insurance. This chapter covers security deposit holds, deposit waivers, post-trip charge collection, the protection stack (embedded insurance, contractual reimbursement plans, guaranties), host and guest plan tiers, driver eligibility, roadside assistance, insurance producer licensing, and the peer-to-peer car sharing laws. It extends `bookings` and the payments model from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Claims, evidence and settlement are [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims); residential deposits and deposit alternatives are the Property Tech volume's [Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#security-deposits).

## How the Platforms Do It

| Platform | Deposit | Waiver | Host side | Guest side | Liability insurer |
| --- | --- | --- | --- | --- | --- |
| **Outdoorsy** (RVs) | Authorization hold placed 2 days before the trip; host sets the amount ($500 minimum for most RVs, $1,500 for Class A); released 7 days after the trip if no claim, extendable to 30 days | $199 Class A, $99 other, buying the deductible down to $0 (up to $4,000 and $1,500) | Up to $1 million liability, comprehensive and collision up to $300,000 ACV, no host premium, excess to the guest's own insurance | Protection packages with deductibles of $1,000 to $4,000; state minimum liability by default, $500,000 with the top package | Mobilitas |
| **RVshare** (RVs) | Hold shortly before the trip, released after safe return | Owner-optional; its pages disagree on price and cover ($149 or $199 for Class A) | Owners auto-approved for $500,000 liability, upgradable to $1 million; owner deductible $1,500 from the deposit | Plans up to $1 million liability; physical damage up to $300,000 by value; interior damage protection up to $1,500 | Crum & Forster, written as excess |
| **Turo** (cars) | Not the main instrument | Not applicable | Earnings plans: host keeps 70%, 80% or 90% against damage responsibility of $250, $1,500 or $2,750; contractual reimbursement up to $200,000 ACV, "not insurance" | Premier ($0 out of pocket), Standard ($500), Minimum ($3,000); optional supplemental liability up to $300,000 | Travelers Excess and Surplus Lines; liability up to $750,000 |
| **Airbnb** (stays) | Most hosts may not take deposits or card holds (exceptions for software-connected hosts and hotels) | Not applicable | AirCover: host damage protection up to $3 million (a guaranty, not insurance), host liability insurance up to $1 million | Travel insurance in some jurisdictions since June 2022 | Distributed under a licensed firm |
| **Vinted** (goods) | Not applicable | Not applicable | Not applicable | A mandatory buyer protection fee funds refunds for lost, damaged or significantly not-as-described items from non-professional sellers | Not applicable |

The patterns:

- **Protection is contract first, insurance second.** Turo, RVshare and Airbnb all say the damage product the guest or host buys is a contract or guaranty, not insurance; third-party liability is real insurance from a named carrier. The legal form is a design decision, not a footnote.
- **Coverage is excess where it can be.** Outdoorsy's and RVshare's coverage sits above the guest's own insurance and becomes primary only when there is none; car sharing laws then require that whichever coverage applies is primary during the trip, which pulls the other way.
- **The host's take buys the deductible.** Turo's plans make the trade explicit: a bigger share of the trip price for a bigger share of the risk.
- **Deposits are shrinking.** Airbnb bars most hosts from taking them; Outdoorsy and RVshare sell waivers; Turo relies on plans and post-trip invoices. A hold that the guest sees on their card is friction platforms try to replace with a product they can price.

## Security Deposit Holds

A rental deposit is almost never a charge. It's a card authorization placed shortly before the trip, released if nothing goes wrong, and partly captured if something does. The timing comes from two sides that don't agree:

- **The business wants a long hold.** It should exist when the vehicle leaves and last until damage is known: Outdoorsy places it two days before the trip, releases it seven days after the trip ends, can extend to 30 days from the trip's end, and keeps it at least 30 days when a claim is filed.
- **The card networks give a short one.** An online, customer-initiated card authorization is generally valid for seven days, and a Visa merchant-initiated one for about five; card-present authorizations are shorter still. Processors offer extended authorizations for eligible merchants and transactions ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)).

A two-day lead, a seven-day trip and a seven-day release window add up to sixteen days, well beyond a standard authorization. So a deposit is a sequence of authorizations, not one: authorize before pickup, re-authorize (or extend) before expiry while the trip runs and the claim window is open, capture part when a claim is approved, and release the rest. Each re-authorization can be declined, and the system has to decide what then: notify the guest, fall back to the card on file for later collection, or treat the booking as uncovered.

My rules for deposits:

- **A deposit is its own record with its own clock,** separate from the booking's payment: the amount and its basis (host-set within the platform's minimums), when it must exist, when it may be released, how long it may be extended, and each authorization behind it ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)).
- **Release is the default.** Without a claim, the hold is released on schedule automatically; extension requires a claim or a host request inside the window, recorded with a reason.
- **The deposit is the first source, not the only one.** Outdoorsy uses it first for insurance deductibles; RVshare takes the owner's deductible from it. Charges above it go to the card on file through post-trip collection.
- **A deposit isn't trust money on a marketplace, but it's still the guest's.** In residential rentals deposits are regulated as tenant funds ([Security Deposits](/books/property-tech/insurance-deposits-and-guarantees#security-deposits)); a rental marketplace's authorization moves no money until capture, but a captured deposit pending a claim decision is held for someone, and the ledger should say for whom.

## Deposit Waivers

A waiver replaces the hold with a fee. Outdoorsy's Security Deposit Waiver is a flat, non-refundable fee charged at booking, $199 for Class A and $99 for other RVs, that buys the protection package's deductible down to $0, covering up to $4,000 and $1,500 respectively; it doesn't cover interior damage or post-trip charges, which go to the card on file. RVshare offers a waiver the owner can allow, excluding late returns, cleaning, tanks, fuel, pets, intentional damage, tolls and events such as Burning Man. Its own pages disagree on the terms: one says $149 for Class A and $99 for others, covering up to $3,000 and $1,500; its insurance guide says $199 and $99 covering $4,000 and $1,500.

That disagreement is the lesson. A waiver is a product with a price, a covered amount, exclusions and a version, and the guest bought the version shown at checkout. The waiver's terms belong on the booking as frozen data, not in a help article that changes; when two pages disagree, the record of what this guest bought is the only answer that holds up. A waiver is also revenue, not a deposit, and may be taxable where a deposit isn't (the Property Tech volume makes the same point for stays: [Guests, Screening and Damage](/books/property-tech/short-term-rentals#guests-screening-and-damage)).

## Post-Trip Charges

Charges discovered after return (damage beyond the deposit, cleaning, fuel, tolls, citations, usage overages) are collected from the guest's card on file. Outdoorsy's published process for charges above the deposit: the host claims the full deposit, messages the guest on the platform, then sends bills to support, which charges the card on file, and the charge requires a digital rental contract signed by both parties. Usage overages have their own seven-day window ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees)).

The design:

- **Consent at booking, notice at charge.** The guest agrees at checkout that the card may be charged for post-trip amounts under the rental agreement; each charge then comes with notice, the evidence and a way to dispute it before (or as) it's taken. The card-network side is a merchant-initiated transaction on a stored credential ([Stored Credentials](/books/payments/stored-credentials)).
- **Evidence before money.** A post-trip charge links to the claim or usage record that justifies it: photos, readings, invoices and the signed agreement ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims)).
- **Expect chargebacks.** A charge the guest didn't expect is a chargeback waiting to happen, and the evidence above is what the platform submits ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)).

## The Protection Stack

A loss during a rental can be paid from several layers, and the booking has to record which layers applied and in which order:

| Layer | Legal form | Who sells it | What it typically pays |
| --- | --- | --- | --- |
| **Deposit or waiver** | Authorization; waiver contract | The platform | The deductible, small damage |
| **Guest protection plan** | Contract limiting the guest's responsibility (Turo, RVshare), or a package backed by insurance | The platform | Damage above the guest's deductible |
| **Host plan or damage protection** | Contractual reimbursement (Turo) or guaranty (Airbnb's host damage protection) | The platform | The host's loss above the host's deductible, up to a value cap |
| **Third-party liability** | Insurance policy | A licensed insurer, through a licensed producer | Injury and property damage to others |
| **Physical damage insurance** | Insurance policy, where the platform buys it | A licensed insurer | Damage to the vehicle in some jurisdictions (Turo's S-1 describes physical damage insurance or contractual reimbursement depending on jurisdiction) |
| **The guest's own insurance** | The guest's personal policy | Their insurer | Often primary, with the platform's coverage in excess |
| **The host's own insurance** | The host's personal or commercial policy | Their insurer | Often excluded during sharing |

The published detail shows how much each layer leaves out. Outdoorsy's host protection excludes interior damage (sold separately as damage protection), loss of use, and trips into Mexico, and requires a police report for theft and vandalism. Turo's plans exclude exterior wear under three inches and loss of income, and say no guest plan limits the guest's responsibility for interior or mechanical damage. A guest who declines Turo's protection is liable for all damage plus administrative and appraisal fees.

### Excess or Primary

Whether the platform's coverage pays first or only after the guest's own insurance is the most consequential term in the stack. Outdoorsy's coverage is excess to the guest's own insurance and primary only if there is none; RVshare's third-party liability from Crum & Forster is written as secondary; Turo's guest liability is secondary to personal insurance except in New York. Excess coverage is cheaper for the platform and slower for everyone: a claim has to go to the guest's insurer first, which may deny it because the policy excludes peer-to-peer rentals.

State car sharing laws cut across this for cars (below): coverage during the sharing period must be primary, and the program's insurance pays from the first dollar if the owner's or driver's coverage has lapsed or is inadequate.

### Host Plan Tiers

Turo's US plans since January 7, 2026 are the clearest published example of trading take rate for risk: a host keeps 70% of the trip price with $250 of damage responsibility, 80% with $1,500, or 90% with $2,750. Liability up to $750,000 comes from Travelers Excess and Surplus Lines; physical damage reimbursement is contractual, up to $200,000 ACV, with up to 20% withheld on vehicles worth $125,000 or more without an activated manufacturer tracker. In New York the plans default to state minimum liability from June 17, 2026.

The plan the host had when the trip was booked governs the claim, even if they change plans before it's filed, so the enrollment is a range and the booking freezes the plan version.

### Guest Plans and Driver Eligibility

Guest plans are priced per trip and set the guest's maximum responsibility: Turo's Premier, Standard and Minimum plans leave $0, $500 or $3,000 out of pocket; Outdoorsy's RV packages have deductibles of $1,000 to $4,000 by vehicle value; its car packages range from $2,500 down to $500. A plan is required to book at Outdoorsy (it's part of the mandatory price for all-in display; [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees)).

Eligibility belongs to the plan, not the listing: Outdoorsy requires drivers to be 25 or older, allowing 21 to 24 only on US and Canadian listings under $75,000 that aren't Class A or fifth-wheel, on the Essential or Stationary package, with a $25-a-night young-driver fee; Ride's top car package isn't available to drivers aged 21 to 24. Every driver must be verified (license front and back and a live face capture at Outdoorsy), and unverified drivers have no damage coverage. [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud) owns the verification; here it's a precondition the booking checks before pickup.

### Roadside Assistance

Roadside help is bought from a provider and attached to the trip. Outdoorsy's program runs through Coach-Net (towing, tire service, battery, lockout, fuel delivery, mobile mechanic, winching within 100 feet of a maintained road, concierge), doesn't pay for parts and labor, gives stationary bookings a reduced set, and voids protection for a stationary rental that's moved. RVshare runs its own 24/7 call center and provider network. The booking records the program and its tier, and roadside events feed claims and trip modifications.

## Insurance Law: Who May Sell It

An insurance producer is anyone who sells, solicits or negotiates insurance, and in the US each state licenses producers, with nonresident licenses for producers working outside their home state. A marketplace that offers its guests liability coverage, travel insurance or physical damage insurance at checkout is soliciting insurance, so it either holds producer licenses (Turo's S-1 describes Turo Insurance Agency, LLC as a licensed producer resident in Arizona), distributes under a licensed firm (Airbnb's 10-K describes host liability insurance distributed under a principal firm's license), or structures the product so it isn't insurance at all.

That's why so much of the stack is contract: a contractual reimbursement plan or a guaranty isn't sold under a producer license, but a regulator may decide it is insurance in substance. Turo's S-1 records New York's position: New York prohibited such policies until a December 2021 law authorized group peer-to-peer car sharing policies (subject to the state regulator's approval), after a 2014 consent order with a civil penalty; Washington entered a consent order with a fine in 2021. The design consequences:

- **Each product records its legal form and its regulator.** Insurance, contractual reimbursement, guaranty or waiver, with the carrier, the producer or distributor of record, and the jurisdictions where it may be offered.
- **Availability is per jurisdiction.** A product approved in one state may not be offered in another; checkout reads the product's jurisdictions against the listing's location and the guest's residence.
- **Disclosures are versioned documents** the guest acknowledges at checkout, frozen on the booking.

## Peer-to-Peer Car Sharing Laws

Car sharing statutes regulate the marketplace directly. Washington's SHB 1389, effective January 1, 2023, is a representative example:

- **Insurance during the sharing period.** The owner and driver must be insured at least to state minimum liability during each car sharing period, from the owner, the driver, the program or a combination, and the coverage used must be primary.
- **First-dollar backstop.** If the owner's or driver's insurance has lapsed or is inadequate, the program's insurance applies from the first dollar of a claim, and the program must defend it. The program assumes primary liability if it provides all or part of the coverage, control of the vehicle is disputed, and it lacks the required records.
- **Owner insurers may exclude** coverage under the owner's policy during sharing.
- **Disclosures** of insurance, fees, roadside and emergency contacts, and that insurance may end when the sharing period ends.
- **Lienholder notice** before the vehicle is listed, **three-year records** of vehicles, owners and drivers provided to insurers for claims, **open safety recalls** block listing, and drivers must be licensed for the vehicle's class.

The records requirement is the system requirement. The "car sharing period" begins and ends at defined events (the booking's start, the handoff, the return), and a dispute over who controlled the vehicle at the moment of a loss is decided by the timestamps on the booking and its handoffs. The asset rules (recalls, lienholder notice) are in [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding). Some states also tax peer-to-peer vehicle sharing (Outdoorsy lists such taxes among those it remits), and airports have demanded operating agreements ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees); [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)).

No RV-specific peer-to-peer rental statute turned up in my research. The car sharing statutes are drafted around motor vehicles, and whether a drivable motorhome or a towable trailer falls within them depends on each state's definitions, so an RV marketplace should check each statute's scope rather than assume.

## Goods: Protection Without a Deposit

Goods marketplaces protect buyers rather than assets, and the protection is usually funded by a fee or the take rate rather than a hold. Vinted charges the buyer a mandatory protection fee that funds refunds for lost, damaged or significantly not-as-described items from non-professional sellers. eBay's Money Back Guarantee and Etsy's Purchase Protection are guarantee programs that sit in front of chargebacks, covered in [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes). The pricing is in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees); the margin protection products earn is Monetization Strategies.

## How to Build It

```sql
CREATE TABLE protection_plans (          -- every protection product, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  code             TEXT NOT NULL,        -- 'guest_standard', 'host_balanced', 'deposit_waiver'
  version          INT NOT NULL,
  side             TEXT NOT NULL CHECK (side IN ('guest', 'host')),
  legal_form       TEXT NOT NULL CHECK (legal_form IN ('insurance', 'contractual_reimbursement',
                     'guaranty', 'waiver', 'service')),  -- 'service': roadside
  carrier          TEXT,                 -- insurer of record, for 'insurance'
  distributor      TEXT,                 -- producer or licensed firm of record
  position         TEXT CHECK (position IN ('primary', 'excess')),
  liability_limit  BIGINT,
  damage_limit     BIGINT,               -- ACV cap for physical damage
  deductible       BIGINT,               -- the party's maximum responsibility
  host_share_bp    INT,                  -- host plans: share of the trip price kept
  price_basis      TEXT CHECK (price_basis IN ('per_day', 'per_trip', 'percent_of_trip',
                     'none')),
  price            BIGINT,
  exclusions       TEXT[] NOT NULL DEFAULT '{}',  -- 'interior', 'loss_of_use', 'mexico', ...
  eligibility      JSONB NOT NULL DEFAULT '{}',   -- driver age, vehicle value and class
  jurisdictions    TEXT[] NOT NULL,      -- ISO 3166-2 where it may be offered
  disclosure_version TEXT NOT NULL,
  currency         CHAR(3) NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (code, version)
);

CREATE TABLE host_plan_enrollments (     -- the host's chosen plan, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  plan_id      UUID NOT NULL REFERENCES protection_plans (id),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, valid_during WITH &&)
);

CREATE TABLE booking_protections (       -- what applied to this booking, frozen
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id     UUID NOT NULL REFERENCES bookings (id),
  plan_id        UUID NOT NULL REFERENCES protection_plans (id),  -- the exact version
  side           TEXT NOT NULL CHECK (side IN ('guest', 'host')),
  price          BIGINT NOT NULL DEFAULT 0,       -- the booking_lines row carries the charge
  deductible     BIGINT,
  acknowledged_at TIMESTAMPTZ,           -- disclosure accepted at checkout
  status         TEXT NOT NULL CHECK (status IN ('active', 'voided', 'cancelled')),
  void_reason    TEXT,                   -- 'stationary_rental_moved', 'unverified_driver', ...
  UNIQUE (booking_id, plan_id)
);

CREATE TABLE deposit_holds (             -- the deposit and its clock
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id       UUID NOT NULL UNIQUE REFERENCES bookings (id),
  amount           BIGINT NOT NULL CHECK (amount > 0),
  currency         CHAR(3) NOT NULL,
  place_at         TIMESTAMPTZ NOT NULL,  -- e.g. two days before start
  release_due_at   TIMESTAMPTZ,           -- set at return: end plus the release window
  extend_limit_at  TIMESTAMPTZ,           -- the furthest it may be held
  status           TEXT NOT NULL CHECK (status IN ('scheduled', 'authorized', 'reauthorizing',
                     'held_for_claim', 'partially_captured', 'released', 'failed', 'waived')),
  captured_amount  BIGINT NOT NULL DEFAULT 0,
  waived_by_protection_id UUID REFERENCES booking_protections (id),
  released_at      TIMESTAMPTZ,
  CHECK (captured_amount <= amount)
);

CREATE TABLE deposit_authorizations (    -- each card authorization behind a deposit
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  deposit_hold_id UUID NOT NULL REFERENCES deposit_holds (id),
  payment_id      UUID NOT NULL REFERENCES payments (id),  -- manual-capture payment
  authorized_at   TIMESTAMPTZ NOT NULL,
  capture_before  TIMESTAMPTZ NOT NULL,  -- from the processor
  outcome         TEXT NOT NULL CHECK (outcome IN ('active', 'superseded', 'captured',
                    'released', 'expired', 'declined'))
);

CREATE TABLE post_trip_charges (         -- charges to the card on file after return
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id      UUID NOT NULL REFERENCES bookings (id),
  source_type     TEXT NOT NULL CHECK (source_type IN ('damage_claim', 'usage', 'cleaning',
                    'fuel', 'toll', 'citation', 'late_return')),
  source_id       UUID,                  -- damage_claims, handoffs or booking_lines
  amount          BIGINT NOT NULL CHECK (amount > 0),
  currency        CHAR(3) NOT NULL,
  from_deposit    BIGINT NOT NULL DEFAULT 0,  -- captured from the hold
  from_card       BIGINT NOT NULL DEFAULT 0,  -- merchant-initiated charge
  payment_id      UUID REFERENCES payments (id),
  notice_sent_at  TIMESTAMPTZ NOT NULL,
  contest_until   TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('noticed', 'contested', 'collected',
                    'failed', 'written_off', 'reversed')),
  CHECK (from_deposit + from_card <= amount)
);

CREATE TABLE producer_licenses (         -- who may sell which insurance where
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  holder        TEXT NOT NULL,           -- the agency or firm of record
  jurisdiction  TEXT NOT NULL,           -- ISO 3166-2
  residency     TEXT NOT NULL CHECK (residency IN ('resident', 'nonresident')),
  lines         TEXT[] NOT NULL,         -- lines of authority
  license_no    TEXT NOT NULL,
  valid_during  DATERANGE NOT NULL
);
```

Design decisions behind it:

- **Every product is a versioned row with its legal form.** Waivers, plans, guaranties, insurance and roadside are all `protection_plans`, so checkout, all-in display, claims and regulators read one catalog. The booking points at the exact version the guest bought, so a help page that changes (or two that disagree) never decides a claim.
- **Host plans are ranges; bookings freeze them.** The host's enrollment in force at booking decides the claim, not the one in force when it's filed.
- **Deposits are a schedule of authorizations.** `deposit_holds` holds the business clock; `deposit_authorizations` holds each card authorization with its processor deadline. A job places, re-authorizes, extends and releases on those dates ([Background Jobs](/docs/architecture/background-jobs)), and a declined re-authorization becomes a task and a notice, not a silent gap.
- **Release is automatic, extension is recorded.** Without a claim, `release_due_at` releases the hold; `held_for_claim` requires a claim and stops at `extend_limit_at`.
- **Post-trip charges carry their evidence and notice.** Each charge links to its source, records the notice and the contest window, and splits what came from the deposit and what was charged to the card, so a chargeback response can be assembled from one row and its links.
- **Eligibility is evaluated before pickup.** Plan eligibility (driver ages, verified drivers, vehicle value and class, trip type) is checked at booking and again before pickup against `booking_participants`; a failure voids the protection with a reason and blocks the handoff.
- **Licensing is data.** Checkout offers an insurance product only where a license of record covers the jurisdiction and line.
- **Events:** `deposit.authorized`, `deposit.reauthorization_failed`, `deposit.released`, `deposit.captured`, `protection.voided`, `post_trip_charge.noticed` and `post_trip_charge.collected` go through the outbox to notifications, payouts and claims.

## Auditing

- **What the guest and host bought:** each booking's protections with plan versions, prices, deductibles and the disclosure acknowledged, and the host's enrollment in force at booking.
- **The deposit's life:** each authorization, re-authorization, extension (with the claim or reason), capture and release, with timestamps against the published windows.
- **Post-trip charges:** source, evidence, notice, contest window and outcome, because consumer complaints and chargebacks ask for exactly these.
- **The car sharing period:** start and end events and who controlled the vehicle, kept three years where the statute requires, available to insurers for claims.
- **Licensing:** which license or distributor of record covered each insurance sale.

## What This Means for the System You Build

- **Model the deposit as a schedule of authorizations,** with business windows and processor deadlines tracked separately and re-authorization planned for.
- **Release deposits automatically** and extend only for a recorded claim or reason.
- **Make waivers, plans, guaranties, insurance and roadside one versioned catalog** with legal form, carrier, distributor, position, limits, deductibles, exclusions, eligibility and jurisdictions.
- **Freeze the exact versions on the booking,** with the disclosure the guest acknowledged.
- **Keep host plan enrollments as ranges** and apply the one in force at booking.
- **Collect post-trip charges with consent at booking, evidence, notice and a contest window,** and expect chargebacks.
- **Check driver and vehicle eligibility before pickup** and void protection with a reason when it fails.
- **Offer insurance only where a license of record covers it,** and treat a regulator's view of contractual products as a risk to plan for.
- **Record the car sharing period precisely** and keep the statutory records for their full term.

## References

**Law and regulation**

- [Washington Senate Bill Report: SHB 1389, peer-to-peer car sharing](https://lawfilesext.leg.wa.gov/Biennium/2021-22/Htm/Bill%20Reports/Senate/1389-S%20SBR%20BFST%20TA%2022.htm), primary coverage during the sharing period, first-dollar backstop, owner insurer exclusions, disclosures, lienholder notice, three-year records, recalls, effective January 1, 2023
- [NAIC: Producer licensing](https://content.naic.org/cipr-topics/producer-licensing), who must be licensed, state licensing and nonresident licenses

**Filings**

- [Turo: Form S-1 (January 2022)](https://www.sec.gov/Archives/edgar/data/1514587/000119312522005696/d145731ds1.htm), insurers including Travelers Excess and Surplus Lines, physical damage insurance or reimbursement by jurisdiction, Turo Insurance Agency, the New York and Washington history
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), host damage protection as a guaranty, host liability insurance under a licensed firm, guest travel insurance since June 2022

**Payments**

- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), authorization validity windows by brand and initiator, extended authorizations

**Platform documentation**

- [Outdoorsy: What is the security deposit](https://support.outdoorsy.com/hc/en-us/articles/37455537111835-What-is-the-security-deposit-How-does-it-work-for-my-listing), timing, minimums, release, extension and claims
- [Outdoorsy: What if I need to charge more than the security deposit](https://support.outdoorsy.com/hc/en-us/articles/48932008371483-What-if-I-need-to-charge-more-beyond-the-amount-of-the-security-deposit), collecting above the deposit, the signed contract requirement
- [Outdoorsy: What is a Security Deposit Waiver](https://support.outdoorsy.com/hc/en-us/articles/46384743917595-What-is-a-Security-Deposit-Waiver-and-what-does-it-mean-for-my-listings), price, cover and exclusions
- [Outdoorsy: Summary of Host Protection Policy](https://support.outdoorsy.com/hc/en-us/articles/37881323218331-Summary-of-Host-Protection-Policy), liability and physical damage limits, excess position, exclusions, Mobilitas
- [Outdoorsy: RV Protection Packages](https://support.outdoorsy.com/hc/en-us/articles/37646881475355-RV-Protection-Packages), guest liability and deductibles
- [Outdoorsy: How to become a Verified Driver for RV bookings](https://support.outdoorsy.com/hc/en-us/articles/37605703140891-How-to-become-a-Verified-Driver-for-RV-bookings), driver ages, the young-driver fee, verification, no coverage for unverified drivers
- [Outdoorsy: Ride Auto Protection Packages](https://support.outdoorsy.com/hc/en-us/articles/46808722668827-Ride-Auto-Protection-Packages), car package deductibles and the 21 to 24 restriction
- [Outdoorsy: Roadside Assistance Program](https://support.outdoorsy.com/hc/en-us/articles/37452913403547-What-is-the-Outdoorsy-Roadside-Assistance-Program), Coach-Net services and limits, stationary bookings
- [RVshare: Security deposit waiver for renters](https://rvshare.com/sd-waiver-renter), the $149 and $99 terms
- [RVshare: RV rental insurance guide](https://rvshare.com/rv/rv-rental-insurance-binder), the $199 and $99 terms, exclusions, Crum & Forster as excess, limits, owner deductible, interior damage protection, roadside
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), host plans, liability and claims administrator, New York defaults, ACV and tracker rules, exclusions
- [Turo: Protection plans for US guests](https://help.turo.com/en_us/summary-and-cost-of-protection-plans-or-us-guests-BJSgBNgVq.md), guest plans, supplemental liability, secondary position, declining protection
- [Airbnb: AirCover for Hosts](https://www.airbnb.com/aircover-for-hosts), damage protection and liability limits
- [Airbnb: Off-Platform and Fee Transparency Policy](https://www.airbnb.com/help/article/2799), most hosts may not take deposits or card holds
- [Vinted: Buyer Protection fee](https://www.vinted.co.uk/help/342-buyer-protection-fee-on-vinted), what the buyer fee funds
