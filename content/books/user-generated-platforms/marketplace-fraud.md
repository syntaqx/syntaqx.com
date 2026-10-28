+++
title = "Marketplace Fraud & Risk"
description = "Guest and driver verification, reservation risk scoring, linked accounts, fake listings and payment diversion, seller fraud, and sanctions screening."
category = "User-Generated Platforms Industry"
order = 1837
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "fraud", "risk-scoring", "identity-verification", "sanctions"]
+++

A marketplace is a fraud target from both sides and from outside. Guests use stolen cards, book homes for parties they promised not to throw, drive cars across borders and don't bring them back. Hosts list properties they don't own, take deposits by wire and vanish, file claims for damage that was already there. Sellers ship empty boxes and buyers claim the box was empty. Outsiders copy real listings to fake websites and message real guests with fake payment links. And because every transaction pays someone, every fraud pattern on a marketplace ends at a payout or a refund.

The marketplace's advantage is that it sees both sides of every transaction, keeps the conversation, and knows the history of every account, card, device and listing involved. Its constraint is that most of its users are honest and impatient: every check costs conversion, every false positive is a guest who booked elsewhere, and every block is a decision about a person that may have to be explained. This chapter covers guest and driver verification, reservation risk scoring and booking restrictions, linked accounts, takeover of host and seller accounts, fake and hijacked listings, payment diversion and off-platform scams, goods fraud, host and seller fraud, and sanctions screening and background checks. It extends `bookings` and `listings` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and uses the playbook's [Automated Risk Decisions](/docs/architecture/risk-scoring) for scoring machinery and the Payments volume's [Fraud & Risk](/books/payments/fraud-and-risk) for card fraud.

## How the Platforms Do It

| Platform | Verification | Risk scoring | Restrictions and programs |
| --- | --- | --- | --- |
| **Airbnb** | Guest and host identity against third-party data, then government ID and sometimes a selfie | Reservation screening of "hundreds of factors" that blocks bookings at high risk of parties or property damage; risk scoring, sanctions screening and background checks (US and India, for certain users) named in its 10-K | Global party ban; restrictions on local entire-home bookings by guests under 25 in the US and Canada; same-city, short-notice restrictions; an identity graph for linked accounts |
| **eBay** | Third-party identity verification and sanctions screening vendors | Not published | Authenticity Guarantee for luxury goods and collectibles; enhanced listing monitoring after a 2024 settlement |
| **Etsy** | Identity and background check vendors | Not published | Disbursement holds against fraud |
| **Outdoorsy** | Every driver: license front and back and a live face capture with head turns (Persona) | A "proprietary analysis of the overall booking" weighing "hundreds of factors" | Unverified drivers have no damage coverage |
| **RVshare** | License or passport plus selfie; renters and owners vetted by DigiSure | Not published | Guarantee covers listing fraud on on-platform payments |
| **Turo** | Guests upload a photo, license, phone and payment method and are screened at checkout | Turo Risk Score on every trip since April 2020, more than 50 inputs, trained on over 90 million days and 10 years of claims; adjusts guest fees; not used to price protection plans | Verification costs of $16.2 million in 2023 |

The patterns:

- **Verify the person who will hold the asset.** Rentals verify every driver, not just the booker, because the person with the keys is the risk.
- **Score the reservation, not just the payment.** A card can be good and the booking still be a party, a theft or a resale; marketplace scoring adds trip features (length, distance from home, local or not, weekend, vehicle value) to the payment's.
- **Scores change price and friction, not just yes or no.** Turo's score adjusts guest fees; Airbnb's restrictions narrow what a risky guest may book rather than banning them.
- **Off-platform payment is where protection ends,** and every platform says so to its users.

## Guest and Driver Verification

Identity verification is the first filter: a document and a live selfie, or data matched against third-party sources with document and selfie as fallbacks ([Verification and Badges](/books/user-generated-platforms/accounts-and-identity#verification-and-badges)). The marketplace adds:

- **Every driver, before they drive.** Outdoorsy verifies each driver (license front and back, live face capture) and denies coverage to unverified drivers; additional drivers need their own accounts. The booking's participants list ([Availability & Booking](/books/user-generated-platforms/availability-and-booking)) is what the handoff checks.
- **A deadline, not a gate at search.** Airbnb gives a booking guest 12 hours to verify (1 hour if check-in is within 12 hours) before the reservation stays pending; checking at booking time rather than sign-up keeps browsing free and puts the cost where the risk is.
- **The license is a credential with a class and an expiry.** A driver's license verification records its class and expiration; Washington's car sharing law bars programs from contracting with drivers not licensed for the vehicle's class.
- **Liveness, not just a photo.** Head turns or other active checks defeat a printed photo; keep the vendor's inquiry reference and re-verify on risk.

Verification has a cost and a retention burden: Turo reported $16.2 million of verification costs in 2023, and ID images are sensitive data with their own retention limits (Airbnb keeps EU government ID images three years; Outdoorsy erases them 30 days after the last trip). A vendor breach of ID images is a real risk; the vendor's security and retention belong in the contract ([The Platform Landscape](/books/user-generated-platforms/platform-landscape#trust-and-safety) describes one such breach).

## Reservation Risk Scoring

A reservation score estimates the chance that a booking ends in a loss: fraud (stolen card, account takeover), misuse (an unauthorized party, commercial use, smuggling), damage, or non-return. Turo describes its Risk Score as running on every trip since April 2020 with more than 50 inputs per transaction, trained on more than 90 million days, 27 million transactions, 8.6 billion miles and 10 years of claims (its 2024 figures), used to adjust guest fees and control fraud, and not used to price protection plans. Airbnb describes reservation screening that analyzes hundreds of factors and blocks some bookings flagged as high risk for parties and property damage.

The published features for party risk give the flavor: Airbnb's screening weighs the guest's history of positive reviews, how long they've been on Airbnb, the trip's length, the distance to the listing, whether it's a weekend, and the listing's size, among many others. Airbnb reported that its restriction on certain local entire-home bookings by US and Canadian guests under 25 blocked over 770,000 reservation attempts in the two countries, a same-city, short-notice restriction blocked over 170,000, and nearly 9,000 high-risk reservations were cancelled proactively.

Three marketplace specifics on top of the general machinery ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle); [More Outcomes Than Yes and No](/docs/architecture/risk-scoring#more-outcomes-than-yes-and-no)):

- **Score at several checkpoints.** At the booking request (before the host sees it, so a blocked request never reaches them), at confirmation, before the trip (new facts: a changed driver, a card that started failing), at payout release, and on claims ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims)).
- **Restrict, don't just block.** Airbnb's under-25 rule blocks entire homes but not private rooms or hotel rooms; a risky guest may still book where a host is present. Outcomes include requiring a higher deposit, a verified second driver, a higher protection tier, host approval instead of instant book, or a shorter booking window.
- **Price is an outcome, carefully.** Turo adjusts guest fees by risk. Pricing by risk score is a decision about a person and, depending on the inputs, can stray into discrimination; keep protected characteristics and their proxies out of the inputs, record the inputs and the effect, and be able to explain it. Age-based rules like the under-25 restriction are deliberate, published policy, which is different from a model quietly learning age.

![Five scoring checkpoints along a booking: the booking request, before the host sees it; confirmation; before the trip, when a new driver or a failing card appears; payout release; and the claim. Accented lines from all five join into one score feeding the risk_decisions record, which keeps inputs, versions and outcome. Late labels, drawn dashed, a claim weeks later and a chargeback months later, are joined back into the record. The record leads to outcomes that restrict rather than only block: a higher deposit, a second driver, a protection tier, host approval and a shorter booking window.](/diagrams/ugp-marketplace-fraud-checkpoints.svg "Score at every checkpoint into one decision record, and let late labels find it. Most outcomes restrict the booking rather than refuse it.")

Every score is a `risk_decisions` row with its inputs, versions and outcome ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record)); labels arrive late (a claim three weeks after the trip, a chargeback two months later), and the training data must join them back ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).

## Linked Accounts

A banned guest returns with a new email; a host runs five listings under five accounts so one bad review doesn't hurt the others; a fraud ring books with a dozen accounts sharing three devices. Linking accounts to people is how a marketplace makes its penalties stick and finds rings.

Airbnb describes an identity graph of about 7 billion nodes and 11 billion edges, growing by about 5 million edges a day, queried four to eight hops deep, used for identity resolution, linked accounts and suspicious activity. The graph's edges are shared attributes: devices, payment instruments (card fingerprints are the same across customers: [The Core Data Model](/books/payments/card-payments#the-core-data-model)), phone numbers, verified identity documents, addresses, IPs, payout bank accounts, and behavior. Its uses on a marketplace:

- **Penalty evasion:** a new account linked to a banned one by a verified document or a payout account inherits the restriction pending review.
- **Self-dealing:** a host booking their own listing from a second account (to inflate reviews, or to cash out stolen cards through payouts) shows as a guest and host linked by device or payment.
- **Rings:** many accounts sharing few devices or cards, booking or listing in a pattern.
- **Payout concentration:** many hosts paid to one bank account.

Link with evidence and review the uncertain middle; never merge two people because they share a household router ([Review Bands](/docs/architecture/record-linkage#review-bands); [Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)). The account link records themselves are owned by [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it), which covers detection across the platform; this chapter reads them.

## Takeover of Hosts and Sellers

A taken-over host account is worth more than a guest's: it has payouts to redirect, upcoming guests to message with fake payment links, and listings whose reputation lends credibility to a scam. The defenses are [Takeover Defense](/books/user-generated-platforms/accounts-and-identity#takeover-defense)'s: step-up on payout and contact changes, a hold on the next payout after a bank change ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)), locking rather than banning, and undoing the session's actions. The marketplace addition is to watch for the takeover's purpose: a burst of messages to upcoming guests containing links or payment instructions, price changes to all listings, or new listings in a different region from a long-dormant account.

## Fake Listings and Payment Diversion

The scams users meet most often don't touch the platform's payments at all. The FTC's guidance on rental listing scams describes the patterns:

- **Hijacked listings:** scammers copy photos and descriptions from real listings and swap in their own contact details; the same address appears under a different owner's name.
- **Fake listings** for places that aren't for rent or don't exist, with prices too good to be true and an owner who is "out of the country."
- **Payment by wire transfer, gift card or cryptocurrency**, which the FTC calls "the same as sending cash," and pressure to decide quickly.
- **Vacation rental scams** that take a deposit before the guest has a contract or has confirmed the property exists.

On a marketplace, the same patterns appear as **payment diversion**: a "host" (a fake listing, or a hijacked account) persuades a guest to pay outside the platform, often by sending a link to a convincing copy of the platform's checkout. Every rental platform responds the same way: pay only through the platform, report fake-site links (Outdoorsy), and know that off-platform payment loses protection (Airbnb, Outdoorsy, RVshare; Vinted's refund policy excludes payments made outside Vinted). RVshare's guarantee covers listing fraud for on-platform payments.

The build:

- **Duplicate listing detection.** Perceptual hashes of listing photos, normalized addresses and VINs, and text similarity find the same property or vehicle under two hosts ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)); a match opens an investigation, and a VIN already active under another host is refused outright ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding)).
- **Message detection.** Payment requests, external links and contact details in messages are detected and blocked or warned on ([Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews)); a host whose messages trigger payment-request detection is a fraud signal, not just a leakage one.
- **Lookalike domains.** Fake checkout sites imitate the platform's domain; monitoring newly registered lookalikes and reporting them to registrars and hosts is part of the program ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#phishing-and-malware) covers the other side).
- **New host, high value, far away.** A new account listing a high-value property in a market it has no history in, priced well below comparable listings, is the classic fake-listing profile; it can publish, but its first bookings are reviewed and its payouts held ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).
- **Report outcomes feed the score.** Every confirmed scam report becomes a label for the listing, the account and every linked account.

## Goods Fraud

Goods marketplaces add fraud shaped by shipping:

- **Counterfeits.** eBay's Authenticity Guarantee routes luxury goods and collectibles through an authenticator before they reach the buyer, turning a dispute into a pre-delivery check.
- **Item not received and not-as-described abuse.** Buyers claim non-delivery of delivered items or return a different item; sellers ship empty boxes with valid tracking. eBay requires signature confirmation as delivery proof for items of $750 or more; the guarantee case process ([Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes)) and the buyer's and seller's case history are the defense.
- **Prohibited items.** eBay's 10-K describes a 2024 settlement under the Controlled Substances Act of $59 million with enhanced listing monitoring; listing monitoring for prohibited and regulated goods is a compliance program, with the categories, the detection and the outcomes recorded.
- **Holds on new sellers.** Etsy describes disbursement holds against fraud; a new seller's early payouts wait until delivery is confirmed ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#risk-holds-negative-balances-and-clawbacks) covers the mechanics).

Brushing, wash trading of sales and fake live viewers in shops run inside video apps are in [Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping#commerce-fraud).

## Host and Seller Fraud

Fraud by supply is quieter and costs more per case:

- **Claims fraud:** old damage claimed as new, inflated estimates, staged losses. Handled at settlement with evidence rules, inspections and reimbursement-only payment ([Fraud-Aware Settlement](/books/user-generated-platforms/damage-and-claims#fraud-aware-settlement)).
- **Cash-out:** a host books their own listing with stolen cards, receives the payout and disappears before the chargebacks arrive. Linked accounts and payout holds on new hosts are the defense ([Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud) covers bust-out at the payments layer).
- **Collusion:** host and guest agree on a fake claim against the platform's protection, or a fake non-return to collect an insurance payout.
- **Misrepresentation:** a listing that isn't what was delivered. Airbnb treats a listing grossly different from its description as a host cancellation, and RVshare's guarantee covers misrepresentation reported within 12 hours.

## Sanctions Screening and Background Checks

US persons, including US companies and their foreign branches, are generally prohibited from dealing with people on OFAC's Specially Designated Nationals list or entities 50% or more owned by them; property of blocked persons in a US person's possession is blocked (frozen, not seized) and reported to OFAC within 10 business days. A marketplace that pays hosts and sellers and accepts guests worldwide screens both sides: Airbnb and eBay name sanctions screening in their 10-Ks. Screening runs at onboarding, on every change of name or payout account, on list updates (rescreen everyone when the list changes), and before payouts; a potential match goes to review, never to an automatic block, because names collide.

Background checks are narrower: Airbnb runs them on certain users in the US and India. They're consumer reports in the US, with notice, consent and adverse action duties when used to deny someone ([Applications & Screening](/books/property-tech/applications-and-screening) covers the FCRA mechanics in another context), so they belong on the few decisions that need them. Services marketplaces, where the provider works inside the customer's home, check every provider; [Services Marketplaces](/books/user-generated-platforms/services-marketplaces#vetting-background-checks) covers that flow and its limits.

Vehicles add law enforcement. Rented vehicles have been used in crimes, and a car sharing platform receives warrants, subpoenas and emergency requests for trip and identity data; [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#the-us-framework) owns the process.

## How to Build It

```sql
-- Reservation risk: the playbook's risk_decisions, without tenant_id, with marketplace
-- subjects and checkpoints.
ALTER TABLE risk_decisions
  ADD COLUMN booking_id UUID REFERENCES bookings (id),
  ADD COLUMN listing_id UUID REFERENCES listings (content_item_id);
-- subject_type gains 'booking', 'listing', 'claim', 'payout'; checkpoint gains
-- 'booking_request', 'confirmation', 'pre_trip', 'claim', 'payout_release'.

CREATE TABLE booking_restrictions (      -- published rules that narrow what may be booked
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  code          TEXT NOT NULL,           -- 'under_25_local_entire_home', 'same_city_short_notice'
  version       INT NOT NULL,
  applies_to    JSONB NOT NULL,          -- listing categories and types, markets
  conditions    JSONB NOT NULL,          -- guest and trip conditions
  outcome       TEXT NOT NULL CHECK (outcome IN ('block', 'require_approval',
                  'require_deposit', 'require_protection_tier', 'require_verification')),
  published     BOOLEAN NOT NULL,        -- stated in the platform's policy
  valid_during  TSTZRANGE NOT NULL,
  UNIQUE (code, version)
);

CREATE TABLE booking_risk_outcomes (     -- what a decision did to a booking
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  booking_id       UUID NOT NULL REFERENCES bookings (id),
  risk_decision_id UUID REFERENCES risk_decisions (id),
  restriction_id   UUID REFERENCES booking_restrictions (id),
  effect           TEXT NOT NULL CHECK (effect IN ('blocked', 'held_for_review',
                     'host_approval_required', 'deposit_raised', 'fee_adjusted',
                     'verification_required', 'cancelled_proactively')),
  detail           JSONB NOT NULL DEFAULT '{}',  -- e.g. old and new deposit
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(risk_decision_id, restriction_id) >= 1)
);

CREATE TABLE listing_investigations (    -- fake, hijacked, duplicate or misrepresented listings
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id      UUID NOT NULL REFERENCES listings (content_item_id),
  kind            TEXT NOT NULL CHECK (kind IN ('duplicate_media', 'duplicate_address',
                    'duplicate_vin', 'hijacked', 'nonexistent', 'misrepresented',
                    'prohibited_item')),
  matched_listing_id UUID REFERENCES listings (content_item_id),
  source          TEXT NOT NULL CHECK (source IN ('detector', 'user_report', 'host_report',
                    'external_report')),
  case_id         UUID REFERENCES moderation_cases (id),
  status          TEXT NOT NULL CHECK (status IN ('open', 'confirmed', 'cleared')),
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

CREATE TABLE off_platform_payment_reports (  -- diversion attempts, reported or detected
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  reporter_account_id UUID REFERENCES accounts (id),
  reported_account_id UUID REFERENCES accounts (id),
  message_id       UUID REFERENCES marketplace_messages (id),
  listing_id       UUID REFERENCES listings (content_item_id),
  method           TEXT,                 -- 'wire', 'gift_card', 'crypto', 'fake_checkout_link'
  external_url     TEXT,                 -- the lookalike site, for takedown requests
  loss_reported    BIGINT,               -- what the victim says they paid, minor units
  currency         CHAR(3),
  case_id          UUID REFERENCES moderation_cases (id),
  reported_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sanctions_screenings (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID REFERENCES accounts (id),
  merchant_id     UUID REFERENCES merchants (id),   -- the payee entity
  trigger         TEXT NOT NULL CHECK (trigger IN ('onboarding', 'name_change',
                    'payout_account_change', 'list_update', 'payout')),
  list_version    TEXT NOT NULL,         -- which list publication was used
  result          TEXT NOT NULL CHECK (result IN ('clear', 'potential_match',
                    'confirmed_match', 'false_positive')),
  match_detail    JSONB,
  reviewed_by     UUID REFERENCES accounts (id),
  blocked_report_due_at TIMESTAMPTZ,     -- 10 business days from blocking
  screened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(account_id, merchant_id) >= 1),
  CHECK (result NOT IN ('confirmed_match', 'false_positive') OR reviewed_by IS NOT NULL)
);
```

Design decisions behind it:

- **Reservation risk uses the playbook's decision record.** `risk_decisions` gains a booking and a listing reference and the marketplace checkpoints; inputs, versions, outcome and supersession are already there ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record)).
- **Published restrictions are rules, not model outputs.** `booking_restrictions` holds the age, locality and notice rules a platform states in its policy, versioned, so a blocked guest can be told the rule; model-driven outcomes point at a risk decision instead.
- **Effects are recorded on the booking.** `booking_risk_outcomes` says what each decision or rule did (blocked, raised the deposit, adjusted the fee, required approval), which is what a guest's appeal, a host's question and a discrimination review all need.
- **Listing fraud is an investigation linked to a case,** with the matched listing, so duplicates, hijacks and prohibited items run through the same moderation pipeline as any content.
- **Diversion reports keep the evidence:** the message, the method, the lookalike URL and the reported loss, so they feed takedowns, labels and linked-account review.
- **Sanctions screening is per trigger and list version,** reviewed before any confirmed match, with the blocking report deadline stored.
- **Account links are read, not owned.** The edges between accounts live in the table [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it) defines; risk features read them, and penalties on linked accounts are separate decisions.
- **Events:** `booking.risk_scored`, `booking.restricted`, `listing.investigation_opened`, `listing.investigation_confirmed`, `sanctions.potential_match` and `scam.reported` go to moderation queues, payouts (holds) and the feature store.

## Auditing

- **Every risk decision and its effect** on a booking, listing, claim or payout, with inputs and versions, so a blocked guest's appeal and a regulator's discrimination question can both be answered ([Explanations and Appeals](/docs/architecture/risk-scoring#explanations-and-appeals)).
- **Published restrictions** with their versions and effective dates, and counts of what each blocked.
- **Verification records** for every guest, driver, host and seller, with vendor references, and their retention and erasure.
- **Listing investigations and scam reports** with outcomes, linked cases and the accounts involved.
- **Sanctions screenings** by trigger and list version, every potential match's review, and blocked-property reports.
- **Labels joined to decisions:** which blocked or allowed bookings later produced claims, chargebacks or scam reports, for measuring the model and the rules ([Measuring It](/docs/architecture/risk-scoring#measuring-it)).

## What This Means for the System You Build

- **Verify every driver or occupant who will hold the asset,** with liveness, before the trip, and record license class and expiry.
- **Score reservations at request, confirmation, pre-trip, claim and payout,** with trip features beside payment features.
- **Prefer restrictions to blocks:** narrower listings, approval, higher deposits or protection tiers.
- **Publish deliberate rules** (age, locality, notice) and keep them separate from model outcomes; keep protected characteristics out of models that set prices.
- **Read linked accounts** to make penalties stick and find self-dealing and rings; link with evidence and review the middle.
- **Detect duplicate listings by photo hash, address and VIN,** and refuse a VIN already active under another host.
- **Detect payment requests and links in messages,** warn users that off-platform payment loses protection, and pursue lookalike sites.
- **Hold early payouts for new, high-risk supply** and route claims fraud to evidence-based settlement.
- **Screen hosts, sellers and payees against sanctions lists** on every trigger, review potential matches, and report blocked property on time.

## References

**Law and regulation**

- [OFAC: Basic information on OFAC and sanctions](https://ofac.treasury.gov/faqs/topic/1501), who must comply, the SDN list and the 50% rule, blocking, reporting within 10 business days
- [FTC: Rental listing scams](https://consumer.ftc.gov/articles/rental-listing-scams), hijacked and fake listings, wire, gift card and crypto payments, vacation rental scams
- [Washington Senate Bill Report: SHB 1389, peer-to-peer car sharing](https://lawfilesext.leg.wa.gov/Biennium/2021-22/Htm/Bill%20Reports/Senate/1389-S%20SBR%20BFST%20TA%2022.htm), drivers licensed for the vehicle's class

**Filings**

- [Turo: Form S-1 (January 2022)](https://www.sec.gov/Archives/edgar/data/1514587/000119312522005696/d145731ds1.htm), the Risk Score since April 2020, not used to price protection
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), Risk Score inputs and training data, fee adjustment, guest screening at checkout, verification costs
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), risk scoring, background checks, sanctions screening, booking restrictions, anti-party technology
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), identity verification and sanctions screening vendors, Authenticity Guarantee, the 2024 Controlled Substances Act settlement
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), disbursement holds against fraud, identity and background check vendors

**Engineering**

- [Airbnb: Scaling Airbnb's identity graph](https://airbnb.tech/infrastructure/scaling-airbnbs-identity-graph-with-a-unified-knowledge-graph-infrastructure/), graph size, growth, query depth and uses for linked accounts

**Platform documentation**

- [Airbnb: Progress on efforts to stop parties](https://news.airbnb.com/airbnb-announces-progress-on-efforts-to-stop-parties-and-large-gatherings/), screening features, the under-25 and same-city restrictions, reservation attempts blocked and cancelled
- [Airbnb: AirCover for Hosts](https://www.airbnb.com/aircover-for-hosts), reservation screening of hundreds of factors for party and damage risk
- [Airbnb: Verifying your identity](https://www.airbnb.com/help/article/1237), the verification window and methods
- [Airbnb: Host cancellation policy for homes](https://www.airbnb.com/help/article/990), grossly different listings treated as host cancellations
- [Outdoorsy: How to become a Verified Driver for RV bookings](https://support.outdoorsy.com/hc/en-us/articles/37605703140891-How-to-become-a-Verified-Driver-for-RV-bookings), Persona verification of every driver, booking analysis, no coverage for unverified drivers
- [Outdoorsy: Why should I pay and communicate through Outdoorsy](https://support.outdoorsy.com/hc/en-us/articles/37462880150683-Why-should-I-pay-and-communicate-through-Outdoorsy-directly), reporting fake-site links, off-platform payment
- [RVshare: Renter FAQ](https://rvshare.com/blog/?p=168613), ID and selfie verification, the guarantee's listing fraud and misrepresentation cover
- [RVshare: RV rental insurance guide](https://rvshare.com/rv/rv-rental-insurance-binder), DigiSure vetting of renters and owners
- [eBay: Money Back Guarantee policy](https://www.ebay.com/help/policies/ebay-money-back-guarantee-policy/ebay-money-back-guarantee-policy?id=4210), signature confirmation at $750
- [Vinted: Refund policy](https://www.vinted.co.uk/help/465-the-vinted-refund-policy), payments outside Vinted excluded
