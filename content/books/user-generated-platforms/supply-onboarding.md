+++
title = "Supply Onboarding & Verification"
nav_title = "Supply Onboarding"
description = "Bringing hosts and sellers on: identity, payout and tax gates, asset eligibility, the INFORM Act, DSA trader traceability and DAC7 data."
category = "User-Generated Platforms Industry"
order = 1829
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "onboarding", "identity-verification", "inform-act", "digital-services-act"]
+++

A peer-to-peer marketplace's inventory belongs to strangers. The RV, the car, the spare room and the jacket for sale are owned by people the platform has never met, and the platform has to decide, before a single guest or buyer sees them, whether the person is who they say, whether they can be paid and taxed, whether the thing they're offering is safe and insurable, and whether the law treats them as a private individual or as a trader with duties to disclose who they are. Every one of those questions has a regulator or an insurer behind it, and every one of them is cheaper to answer at the door than after a guest is stranded with a vehicle that should never have been listed.

Onboarding is hard because the gates pull in opposite directions. Each check added before the first listing loses supply that would have been fine; each check deferred is a listing that might publish with a fake identity, a bank account that belongs to someone else, or a vehicle with an open safety recall. The law adds thresholds that move a seller from one regime to another mid-relationship (a hobby seller becomes a high-volume seller under the INFORM Consumers Act on their two hundredth sale) and duties that last after the seller leaves (the DSA keeps trader data six months after the relationship ends). This chapter covers the gates (identity, payout, tax, asset and content), the marketplace laws that decide who is a trader and what must be collected and shown, asset eligibility for vehicles and homes, and the "not a party" posture marketplaces take toward the contracts they arrange. It extends `verifications` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it) and `listings` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). The KYC and KYB mechanics of making a host a payee are the Payments volume's [Merchant Onboarding](/books/payments/merchant-onboarding); this chapter covers the marketplace overlay.

## How the Platforms Do It

| Platform | Identity before listing | Money and tax before listing | Asset rules | Trader and seller law |
| --- | --- | --- | --- | --- |
| **Airbnb** (stays) | Legal name and address checked against third-party data, then government ID and sometimes a selfie, for primary hosts and co-hosts | Payout method; DAC7 and Brazil tax data for some hosts | City registration where required (Property Tech) | DSA trader traceability cited in its 10-K |
| **eBay** (goods) | Third-party identity verification and sanctions screening vendors | Payout account; holds for an unvalidated W-9 | Category exclusions | 10-K: the DSA requires verifying business sellers and product safety |
| **Etsy** (goods) | Identity and background check vendors named in its 10-K | Payment account; US sales tax collected by Etsy as marketplace facilitator | Listing category drives tax; seller indemnifies Etsy for miscategorization | INFORM and DSA |
| **Outdoorsy** (RVs) | Persona: ID front and a live selfie with head turns; existing hosts re-verify per new listing | Bank account linked, W-9 submitted | Inspection of tires, brakes, LP and gas within 90 days before departure; registration required; salvage titles not insured | Acts as a limited payment collection agent; "not a party" to bookings |
| **RVshare** (RVs) | Owners and renters vetted by DigiSure | Not published | RVs over 20 years old are liability-only under its protection plan | Not an insurer; protection plan is a contract |
| **Turo** (cars) | Hosts and guests screened; verification cost $16.2 million in 2023 | Stripe payouts | Reimbursement up to actual cash value of $200,000; up to 20% withheld on vehicles worth $125,000 or more without an activated manufacturer tracker | Disputes being a car rental company; regulated as peer-to-peer car sharing in many states |

Four patterns run through the table and the rest of the chapter:

- **Identity before publication, not before sign-up.** Every platform lets a person create an account freely and gates the first listing (or the first payout) on verification, because that's the moment the person can harm a counterparty. Outdoorsy states it directly: a listing can't publish until bank account, tax information and identity are done.
- **The asset is verified separately from the person.** A verified host can still list a vehicle that's too valuable, too old, salvaged or overdue for inspection, and the insurer's rules, not the platform's taste, set most of those limits.
- **Law sorts suppliers into private individuals and traders.** INFORM in the US and the DSA in the EU impose collection, verification and disclosure duties on sellers above a threshold or acting as a business, so the platform has to know which side of the line each seller is on and when they crossed it.
- **"We're not a party" is a posture, not a shield.** Marketplaces write terms that put the contract between host and guest, and courts, airports and the DSA test that line when the platform looks like the seller.

## The Onboarding Gates

A supplier passes five gates, and each one is a separate record with its own state, because they fail, expire and re-open independently:

| Gate | What's checked | When | What it blocks |
| --- | --- | --- | --- |
| **Identity** | Government ID and liveness, or data matched against third-party sources | Before the first listing publishes; again on name change, new listing or risk | Publishing; new bookings |
| **Payout** | A bank account or debit card in the payee's name | Before the first payout, often before publishing | Payouts |
| **Tax** | W-9 or W-8, TIN match; in the EU, DAC7 data | Before the first payout; on threshold crossings | Payouts, and in some flows publishing |
| **Asset** | Ownership, value, age, title, registration, inspection, recalls | Before the listing publishes; on a schedule | The listing, not the account |
| **Content** | Photos, description and category against the listing content policy | Each listing and each revision | The listing |

The gates are not one onboarding flow with a single "approved" flag. A host whose bank account fails can keep a verified identity and a published listing whose payouts wait; a host whose inspection lapses keeps everything except that vehicle's bookability. The Payments volume's [A State Machine, Not a Checkbox](/books/payments/merchant-onboarding#a-state-machine-not-a-checkbox) and [Progressive Onboarding](/books/payments/merchant-onboarding#progressive-onboarding) describe the payee side (collect what's due when it's due, ask for the rest as volume grows); the marketplace adds the identity gate in front of publication and the asset gate per listing.

My rule: **gate the act, not the account.** Publishing checks identity and content; bookability checks the asset; paying out checks the payee and tax. Each gate is a query over verifications and checks in force at the moment of the act, the same way standing gates privileges in [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#account-standing). A cached "host approved" flag goes stale the day a driver's license or an inspection expires.

### Identity

The host or seller verifies the way a guest does, usually with the same vendor: a document plus a live selfie (Outdoorsy names Persona; RVshare names DigiSure), or data checks with document and selfie as fallbacks (Airbnb). Two marketplace twists:

- **Re-verify per asset or per change, not just once.** Outdoorsy requires existing hosts to re-verify for each new listing; Airbnb asks for re-verification when a legal name changes or risk is detected and blocks the host's calendar until it's done. A verification is a record with a validity range, and adding inventory is a reason to check it again ([Verification and Badges](/books/user-generated-platforms/accounts-and-identity#verification-and-badges)).
- **Co-hosts and staff are people too.** A co-host who manages listings on someone else's profile is verified as themselves (Airbnb verifies new co-hosts), with a scoped grant, never shared credentials.

### Payout and Tax

A listing that books but can't pay out is a liability waiting to happen: the platform holds guest money it can't release. Outdoorsy makes bank account and W-9 part of publishing; eBay holds payouts for an unvalidated W-9. The mechanics (TIN matching, backup withholding, the 1099-K threshold, DAC7 reporting) belong to [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#tax-interviews-and-withholding) and to the Payments volume's [Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s). Onboarding's job is narrower: collect them at the right gate, tie them to the payee entity rather than the profile ([One Login, Many Roles](/books/user-generated-platforms/accounts-and-identity#one-login-many-roles)), and record which law asked for each field, because INFORM, the DSA and DAC7 ask for overlapping data with different retention and use limits.

## Private Individuals and Traders

Consumer law protects buyers who deal with businesses; it largely doesn't apply when two private individuals trade. That's why the most consequential onboarding field is whether the supplier is a trader. Under the DSA, a trader is someone acting for purposes relating to their trade, business, craft or profession; under INFORM, the test is mechanical (a count of sales and revenue). A marketplace with both regimes keeps both answers, because a seller can be a high-volume seller under INFORM without self-declaring as a trader in the EU, and the reverse.

The answer changes what the platform must do:

| | Private individual | Trader or high-volume seller |
| --- | --- | --- |
| Identity data | Whatever the platform's risk policy needs | Statutory list, verified within a deadline |
| Disclosure to buyers | None required | Name, address and contact shown (with limits) |
| Product compliance | Platform policy | DSA Article 31 fields and checks ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking)) |
| Buyer rights | Platform guarantee only | Consumer law: withdrawal rights in the EU, statutory remedies |
| Data after exit | Retention policy | DSA: six months after the relationship ends |

Vinted's model shows the commercial consequence: its buyer protection fee funds refunds for items from non-professional sellers, and it runs a separate refund policy for professional sellers, because the law already gives buyers remedies against traders ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees) covers the fee).

### The INFORM Consumers Act

The INFORM Consumers Act (15 U.S.C. 45f), effective June 27, 2023, applies to online marketplaces with high-volume third-party sellers of new or unused consumer products. The rules, from the statute:

- **Who is high-volume.** A seller who, in any continuous 12-month period during the previous 24 months, made 200 or more discrete sales of new or unused consumer products and $5,000 or more in gross revenues. Only sales processed through the marketplace (directly or by its payment processor) count.
- **Collect within 10 days.** Bank account information (or the payee name), contact information, and a business tax ID or taxpayer ID, plus a working email and phone number. The marketplace verifies the information within 10 days of collecting it, and verifies any change within 10 days of being told.
- **Certify at least annually.** The marketplace reminds the seller to keep the data current, and the seller certifies within 10 days whether anything changed.
- **Disclose above $20,000.** Sellers with $20,000 or more in annual gross revenues have their full name, physical address and contact information shown to buyers on the listing page or in the order confirmation, with partial disclosure (no street address) available in limited cases such as a residential address.
- **A reporting channel on every listing.** Each high-volume seller's listings carry a clear way to report suspicious marketplace activity, both electronically and by telephone.
- **Suspend on non-compliance.** A seller who doesn't provide the data or certification gets notice and 10 days to respond, then future sales are suspended until they comply.

The FTC and state attorneys general enforce it. The first FTC action was against Temu: *United States v. Whaleco Inc.* (D. Mass., No. 1:25-cv-12466), filed September 5, 2025, with a $2 million civil penalty under a stipulated order, over reporting tools that were missing or late. The lesson for the build is that the reporting channel is as enforceable as the data collection.

What the statute does to the system:

- **High-volume status is computed, not declared.** It's a rolling query over the seller's completed on-platform sales of new or unused products in every 12-month window of the last 24 months, run daily. The date it first became true starts the 10-day clock.
- **Condition is a listing field.** Only new or unused consumer products count, so the listing's condition and category feed the count; a used-goods platform still has sellers who sell new items.
- **The clock is a deadline row.** Collection, verification, recertification and the 10-day notice before suspension are computed deadlines ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), and suspension is an automated restriction on the seller role, recorded as a `penalties` row so it shows in standing and lifts when the seller complies.
- **Data use is limited.** The statute limits use of the collected data to compliance; keep it in a store with its own access rules rather than copying it into marketing or analytics.

### DSA Trader Traceability

The EU's Digital Services Act applies to all online platforms from February 17, 2024, and Articles 30 to 32 add duties for platforms that let consumers conclude distance contracts with traders:

- **Article 30, collect before use.** Before a trader can offer products or services to consumers in the EU: name, address, telephone and email; a copy of an identity document or electronic identification; payment account details; trade register and registration number where registered; and a self-certification by the trader committing to offer only products or services that comply with EU law (a signed legal statement, unrelated to the content questionnaire a creator answers for ad suitability in [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#demonetization-the-creator-side)).
- **Best-efforts verification.** The platform makes best efforts to check those items are reliable and complete, against freely accessible official databases (trade registers, the EU's VAT number check) or by asking for supporting documents. Traders already on the platform on February 17, 2024 had 12 months to provide the data or be suspended.
- **Suspend on doubt.** When the platform has reason to believe the data is inaccurate, incomplete or outdated, it asks the trader to fix it, and if they don't, it swiftly suspends their offering to EU consumers until they do.
- **Keep six months, then delete.** Trader data is stored securely for six months after the contractual relationship ends, then deleted. [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#deletion-claims-and-legal-holds) records this as a `regulatory_retention` hold.
- **Show it.** Name, address, telephone, email, trade registration and the trader's self-certification are displayed to buyers, at least on the interface where the product is shown.
- **Articles 31 and 32** require the listing interface to let traders give the pre-contractual and product-safety information EU law requires, random checks against official databases of illegal products, and notice to buyers of the past six months when a product turns out to be illegal. [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) covers the fields and checks.

Article 29 exempts platforms that are micro or small enterprises from these articles (keeping them exempt for 12 months after they outgrow that status), unless the Commission designates them a very large online platform. Article 6(3) adds the liability edge: the hosting safe harbor doesn't apply to a platform's consumer-protection liability where it presents an item or enables a transaction so that an average consumer would believe the item comes from the platform itself or someone acting under its control. A marketplace that brands everything, sets the price and handles the fulfilment can find it is treated as the seller.

### DAC7 Data at Onboarding

DAC7 (Council Directive (EU) 2021/514) makes platform operators report sellers of four activities to tax authorities each year: rental of immovable property, personal services, sale of goods and rental of means of transport. The Dutch tax authority's guidance lists what must be collected: name, primary address, date of birth for individuals, VAT number, financial account identifier, tax identification number and its issuing member state, business registration number, any EU permanent establishment, and for rented property its address and land registration number. Excluded sellers include government entities, listed companies, sellers with more than 2,000 rentals of the same property, and goods sellers with fewer than 30 sales totalling less than €2,000 in the year; the goods exclusion doesn't apply to services or vehicle rentals. Data is collected and verified by December 31 of the reporting year and reported by January 31 of the next.

For onboarding, two consequences: the TIN and date of birth become required fields for EU sellers once they're likely to exceed the exclusion, and an RV or car host in the EU is reportable from the first rental, because the small-seller exclusion covers only goods. The filing, the seller notice and the US equivalents belong to [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#dac7-and-uk-platform-reporting).

## Asset Eligibility

A host's identity says nothing about the vehicle. Rental marketplaces publish asset rules, and almost all of them come from the insurer or the protection plan behind the trip:

| Rule | Published examples |
| --- | --- |
| **Value caps** | Turo reimburses up to an actual cash value of $200,000; Outdoorsy's host protection covers comprehensive and collision up to an ACV of $300,000; its car brand's packages exclude vehicles over $150,000 ACV; RVshare covers physical damage up to $300,000 by value |
| **Value and class limits on who may drive** | Outdoorsy allows drivers aged 21 to 24 only on US and Canadian listings under $75,000 that aren't Class A or fifth-wheel |
| **Age** | RVshare makes RVs over 20 years old liability-only |
| **Title** | Outdoorsy doesn't insure salvage titles; registration and certification required |
| **Inspection** | Outdoorsy requires an inspection of tires, brakes, LP and gas within 90 days before each departure, which insurers may request on a claim |
| **Recalls** | Washington's peer-to-peer car sharing law bars an owner with actual notice of a safety recall from making the vehicle available until the recall repair is done |
| **Anti-theft** | Turo withholds up to 20% of a reimbursement on vehicles worth $125,000 or more without an activated manufacturer tracker |

For stays the asset gate is the property's legal status: city registration, primary-residence rules and caps, which the Property Tech volume covers in [Registration, Permits and Caps](/books/property-tech/short-term-rentals#registration-permits-and-caps). For goods it's the category: prohibited and restricted items, and for some categories an authenticity check before the item reaches the buyer (eBay's Authenticity Guarantee for luxury goods and collectibles). For services the asset is the person and, for boarding, the place: [Services Marketplaces](/books/user-generated-platforms/services-marketplaces#licensing-boarding-in-someone-s-home) covers background checks and boarding licenses.

What the system does with asset rules:

- **The asset is its own record.** A vehicle has a VIN, year, make, model, class, value, title status, registration and lienholder independent of any listing; a host can relist it, a second host can't list the same VIN at the same time, and a claim three years later needs the vehicle as it was. One asset, many listings over time.
- **Eligibility is a check with a rule version.** Each listing is evaluated against the eligibility rules in force (value caps by plan and jurisdiction, age limits, title and inspection requirements), and the check records the rule set version, the inputs and the reasons ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). When the insurer changes a cap, the platform re-runs the checks and knows which listings fall out.
- **Expiring evidence closes bookability, not the listing.** An inspection valid for 90 days before departure means the check is per trip: a booking whose departure is past the inspection's horizon gets a task for the host, not a silent failure at handoff.
- **Recalls are a data feed.** A periodic check of every listed vehicle against a recall source is how "actual notice" becomes something the platform can show it acted on.

### The Host's Own Insurance and the Lender

Two parties outside the platform have a say over whether an asset can be shared. **The host's personal insurer** may exclude coverage while the vehicle is shared: Washington's law lets motor vehicle insurers exclude claims under the owner's policy during car sharing. **The lienholder** may forbid it: the same law requires the program to tell the owner, before the vehicle is listed, that sharing may violate a lien contract. Platforms also warn that their coverage is excess to the guest's own insurance where the guest has it (Outdoorsy, RVshare), which matters to the host when a claim arrives. These are disclosures at onboarding, recorded with their version and the host's acknowledgement ([Click-Through Terms Are Signatures Too](/docs/compliance/electronic-signatures#click-through-terms-are-signatures-too)); [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection) covers the coverage itself.

## The "Not a Party" Posture

Marketplaces write their terms so the contract for the trip or the sale is between the two users. Outdoorsy's terms say it "is not a party" to bookings and is not a vehicle broker, agent, travel agency or insurer, that a booking confirmation forms a contract directly between guest and host, and that it acts only as a limited payment collection agent; RVshare says it isn't an insurer and its protection plan is a contract limiting renter responsibility. Turo, in its S-1, disputes being a car rental company for rental-car taxes.

The posture holds until the law or a counterparty tests it:

- **The DSA's average-consumer test** removes the hosting safe harbor for consumer-protection liability when the platform looks like the seller (Article 6(3)).
- **Airports** sued Turo as an unlicensed rental operator: Massport's 2019 suit in Boston (trespass, unjust enrichment and Massachusetts consumer protection claims, with Turo counterclaiming on its CDA immunity) reached a settlement in principle in December 2021 with a peer-to-peer permit, and the S-1 listed pending cases at SFO and LAX and a DFW suit filed in October 2021, at a time when about 33% of its gross booking value came from airport-originating trips.
- **States wrote car sharing statutes** that make the platform, not the host, responsible for minimum insurance during the sharing period and for records ([Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection)).
- **Tax authorities treat marketplaces as facilitators** and make them collect and remit sales and rental taxes ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees)).

The design consequence is that onboarding records which entity the supplier contracts with, under which terms version, in which jurisdiction, because the platform's role (collection agent, facilitator, car sharing program, trader's intermediary) differs by place and product. My default is to assume the posture will be tested and to keep the records a regulator would ask for (who the supplier is, what they were told, what was checked) whether or not the platform believes it is a party.

## Keeping Supply Verified

Onboarding isn't a one-time event. The records that need re-checking, and their triggers:

- **Identity:** on legal name change, on a new listing where the platform requires it, on risk signals, and when a document expires.
- **Payout account:** on change, with a hold on the next payout and notice to the old contact ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)).
- **Trader data:** INFORM's annual certification; DSA re-verification on reason to doubt.
- **Assets:** inspection horizons, registration expiry, recall feed, value updates when the plan's caps depend on value.
- **Thresholds:** the INFORM count daily, DAC7 exclusions annually, and the 1099-K threshold in [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#information-returns-1099-k-1099-misc-and-1042-s).

The Payments volume's [Ongoing Monitoring](/books/payments/merchant-onboarding#ongoing-monitoring) covers the payee side. Supply quality is also a business choice beyond compliance: platforms remove listings that underperform or generate claims, which [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) covers.

## How to Build It

The chapter widens `verifications` from [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it) once for every marketplace chapter, and adds trader records, assets and eligibility checks:

```sql
-- One widening for the marketplace chapters: what can be verified about an account.
ALTER TABLE verifications
  DROP CONSTRAINT verifications_kind_check,
  ADD CONSTRAINT verifications_kind_check CHECK (kind IN ('identity', 'notability',
    'organization', 'phone', 'email', 'payment_instrument', 'driver_license', 'business',
    'tax_id', 'bank_account'));

CREATE TABLE trader_profiles (           -- what INFORM and the DSA require, per payee entity
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  merchant_id          UUID REFERENCES merchants (id),   -- the payee entity, when there is one
  regime               TEXT NOT NULL CHECK (regime IN ('inform', 'dsa')),
  legal_name           TEXT NOT NULL,
  address              JSONB NOT NULL,
  phone                TEXT,
  email                TEXT,
  tax_id_ref           TEXT,             -- vaulted reference, never the number in this table
  bank_verification_id UUID REFERENCES verifications (id),
  identity_verification_id UUID REFERENCES verifications (id),
  trade_register       TEXT,             -- register and number, DSA 30(1)(d)
  self_certified_at    TIMESTAMPTZ,      -- DSA 30(1)(e)
  disclosure           TEXT NOT NULL DEFAULT 'none' CHECK (disclosure IN ('none', 'full',
                         'partial')),    -- INFORM: partial hides the street address
  status               TEXT NOT NULL CHECK (status IN ('collecting', 'verifying', 'verified',
                         'suspended', 'ended')),
  became_required_at   TIMESTAMPTZ NOT NULL,  -- starts the statutory clock
  collect_by           TIMESTAMPTZ,      -- computed from the regime's rule
  verify_by            TIMESTAMPTZ,
  ended_at             TIMESTAMPTZ,      -- relationship end; DSA retention runs from here
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, regime)
);

CREATE TABLE trader_certifications (     -- INFORM's at-least-annual certification
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  trader_profile_id UUID NOT NULL REFERENCES trader_profiles (id),
  requested_at      TIMESTAMPTZ NOT NULL,
  due_at            TIMESTAMPTZ NOT NULL,      -- 10 days after the request
  certified_at      TIMESTAMPTZ,
  changed           BOOLEAN,                   -- the seller reported changes
  outcome           TEXT CHECK (outcome IN ('certified', 'suspended'))
);

CREATE VIEW high_volume_sellers AS       -- INFORM: 200 sales and $5,000 in any 12 of 24 months
SELECT DISTINCT b.host_account_id AS account_id
FROM bookings b
JOIN listing_attributes la ON la.listing_id = b.listing_id
  AND la.attribute = 'condition' AND la.value IN ('new', 'unused')  -- Listings, Search & Ranking
WHERE b.kind = 'purchase' AND b.status = 'completed'
  AND b.created_at >= NOW() - INTERVAL '24 months'
  AND EXISTS (
    SELECT 1 FROM bookings w
    WHERE w.host_account_id = b.host_account_id AND w.kind = 'purchase'
      AND w.status = 'completed'
      AND w.created_at BETWEEN b.created_at AND b.created_at + INTERVAL '12 months'
    HAVING COUNT(*) >= 200 AND SUM(w.total_amount) >= 500000);  -- USD minor units

CREATE TABLE assets (                    -- the thing a listing rents, across listings and hosts
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('car', 'rv_drivable', 'rv_towable', 'boat',
                     'property')),
  identifier       TEXT,                 -- VIN, hull number, or property registration
  year             SMALLINT,
  make             TEXT,
  model            TEXT,
  class            TEXT,                 -- 'class_a', 'class_c', 'fifth_wheel', ...
  declared_value   BIGINT,               -- minor units; the plan's caps read it
  currency         CHAR(3),
  title_status     TEXT CHECK (title_status IN ('clean', 'salvage', 'rebuilt', 'unknown')),
  lienholder       TEXT,
  owner_account_id UUID NOT NULL REFERENCES accounts (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kind, identifier)
);

ALTER TABLE listings
  ADD COLUMN asset_id UUID REFERENCES assets (id);  -- null for goods

CREATE TABLE asset_inspections (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_id        UUID NOT NULL REFERENCES assets (id),
  kind            TEXT NOT NULL CHECK (kind IN ('safety', 'registration', 'emissions',
                    'annual')),
  inspected_on    DATE NOT NULL,
  valid_until     DATE NOT NULL,         -- e.g. 90 days later for a pre-trip safety check
  result          TEXT NOT NULL CHECK (result IN ('passed', 'failed')),
  evidence_asset_id UUID REFERENCES media_assets (id)
);

CREATE TABLE asset_recall_checks (       -- a VIN against the recall feed
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_id    UUID NOT NULL REFERENCES assets (id),
  source      TEXT NOT NULL,             -- the recall data source
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  open_recalls TEXT[] NOT NULL DEFAULT '{}',
  remedied_at TIMESTAMPTZ                -- host evidence of the repair
);

CREATE TABLE listing_eligibility_checks (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id       UUID NOT NULL REFERENCES listings (content_item_id),
  ruleset_version  TEXT NOT NULL,        -- insurer and platform rules in force
  checkpoint       TEXT NOT NULL CHECK (checkpoint IN ('publish', 'booking', 'pre_trip',
                     'rule_change')),
  booking_id       UUID REFERENCES bookings (id),  -- for per-trip checks
  result           TEXT NOT NULL CHECK (result IN ('eligible', 'ineligible', 'needs_action')),
  reasons          TEXT[] NOT NULL DEFAULT '{}',   -- 'value_over_cap', 'inspection_expired', ...
  inputs           JSONB NOT NULL,       -- what the rules saw
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE onboarding_disclosures (    -- what the supplier was told and acknowledged
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL,         -- 'lienholder_notice', 'personal_insurance', 'terms'
  jurisdiction    TEXT,                  -- ISO 3166-2 where the rule applies
  document_version TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL
);
```

Design decisions behind it:

- **One verifications table for every check about a person.** Driver's licenses, business registrations, TINs and bank accounts are verifications with a method, a verifier, an evidence reference and a validity range, so standing, badges, gates and erasure all read one model. The widening lives here once; the other marketplace chapters use the kinds.
- **Trader data is per regime.** INFORM and the DSA ask for overlapping fields with different deadlines, display rules and retention, so each regime gets its own row with its own clock. `became_required_at` is when the threshold was crossed or the trader first offered to EU consumers; `collect_by` and `verify_by` are computed from the rule and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **High-volume status is a view.** It's derived from completed purchases of new or unused goods, never a counter, so a refund, a cancelled order or a recategorized listing changes the answer the next time it runs. The sketch shows the shape; at scale it's a daily job writing transitions, so the date the seller crossed is kept.
- **Suspension is a penalty.** A seller suspended for missing trader data gets a `penalties` row with role `seller`, scoped to the regime's market, so standing explains it and it lifts on compliance without touching the account.
- **Assets outlive listings.** The VIN is unique per asset, a listing points at its asset, and eligibility, inspections, recalls and claims all hang off the asset, so the vehicle's history survives a relist or a change of host.
- **Eligibility is evaluated, recorded and re-run.** A check per publish, per booking where per-trip evidence applies, and per rule change, with the inputs and the rule version, so "why was this RV bookable on July 3" has an answer.
- **Sensitive values live in a vault.** TINs and bank details are references to the vault ([Card Vault](/books/payments/card-vault) covers the pattern for card data), and the trader store has its own access rules because INFORM limits its use to compliance.
- **Events:** `trader.required`, `trader.verified`, `trader.suspended`, `trader.certification_due`, `asset.recall_found`, `asset.inspection_expiring` and `listing.eligibility_changed` go through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)) to notifications, search (an ineligible listing stops ranking) and standing.

## Auditing

- **Every gate decision,** with the verification or check behind it, so the platform can show why a host could publish, book or be paid on a given date.
- **Trader data and its clock:** when each seller crossed a threshold, when data was collected and verified, every certification and every suspension, because the FTC and state attorneys general enforce INFORM's deadlines and the DSA's suspension duty.
- **What buyers were shown:** the trader disclosure on each listing over time, and the reporting channel's presence, which was the issue in the first INFORM action.
- **Asset eligibility over time:** each check with its rule version and inputs, inspections and recall checks, so an insurer's question after a claim, or a regulator's after an accident, has the record as it was.
- **Disclosures acknowledged:** lienholder and personal-insurance notices, terms versions and the supplier's acknowledgement, per jurisdiction.
- **Retention and erasure:** DSA trader data deleted six months after the relationship ends, and everything else under [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type).

## What This Means for the System You Build

- **Gate the act, not the account:** identity and content before publishing, the asset before bookability, payee and tax before payout.
- **Keep each gate as its own record** with a state and a validity range, never one "approved" flag.
- **Widen `verifications` once** for driver's licenses, businesses, TINs and bank accounts, and re-verify on name change, new inventory and risk.
- **Compute INFORM high-volume status daily** from on-platform sales of new or unused goods, and drive its 10-day deadlines, annual certification and suspension from stored dates.
- **Collect DSA trader data before an EU trader's first offer,** verify against official databases, display what Article 30 requires, and delete it six months after the relationship ends.
- **Collect DAC7 fields at onboarding** for EU sellers, remembering that rentals of vehicles and property have no small-seller exclusion.
- **Model the asset separately from the listing,** with eligibility checks that record the rule version, inspections that expire per trip, and a recall feed by VIN.
- **Record the supplier's disclosures and acknowledgements** for lienholders and personal insurance, by jurisdiction.
- **Assume the "not a party" posture will be tested,** and keep the records a regulator would ask for regardless.

## References

**Law and regulation**

- [15 U.S.C. 45f: INFORM Consumers Act](https://www.law.cornell.edu/uscode/text/15/45f), high-volume seller thresholds, 10-day collection and verification, annual certification, $20,000 disclosure, reporting channel, suspension
- [FTC: Informing businesses about the INFORM Consumers Act](https://www.ftc.gov/business-guidance/resources/informing-businesses-about-inform-consumers-act), effective date and enforcement by the FTC and state attorneys general
- [FTC: Whaleco Inc. (Temu), US v.](https://www.ftc.gov/legal-library/browse/cases-proceedings/232-3096-whaleco-inc-dba-temu-us-v), the first INFORM action, its docket number, filing date and $2 million civil penalty
- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Article 6(3) (the average-consumer exception to the hosting safe harbor), Article 29 (the micro and small enterprise exclusion, its 12 months after losing that status and the very large platform exception), Article 30 (data collected, the trader's self-certification in 30(1)(e), best-efforts verification, the 12-month transition, suspension, six-month retention, display to buyers), Article 31 (product information interface and random checks) and Article 32 (notifying buyers of illegal products bought in the past six months)
- [Belastingdienst: Information about DAC7 for platform operators](https://belastingdienst.nl/wps/wcm/connect/en/business/content/information-for-platform-operators-dac7), reportable activities, excluded sellers and thresholds, data collected, collection and reporting deadlines
- [Washington Senate Bill Report: SHB 1389, peer-to-peer car sharing](https://lawfilesext.leg.wa.gov/Biennium/2021-22/Htm/Bill%20Reports/Senate/1389-S%20SBR%20BFST%20TA%2022.htm), recall listing ban, lienholder notice, owner insurer exclusions, effective January 1, 2023

**Filings**

- [Turo: Form S-1 (January 2022)](https://www.sec.gov/Archives/edgar/data/1514587/000119312522005696/d145731ds1.htm), the Massport, SFO, LAX and DFW airport cases and the airport share of gross booking value, disputing car rental company status
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), verification costs in 2023
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), DSA trader traceability
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), identity and background check vendors
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), DSA business seller verification, identity verification and sanctions screening vendors, Authenticity Guarantee

**Platform documentation**

- [Outdoorsy: Why does Outdoorsy need to verify my identity before listing a vehicle](https://support.outdoorsy.com/hc/en-us/articles/40350047391515-Why-does-Outdoorsy-need-to-verify-my-identity-before-listing-a-vehicle), bank account, W-9 and Persona verification before publishing, re-verification per listing
- [Outdoorsy: Summary of Host Protection Policy](https://support.outdoorsy.com/hc/en-us/articles/37881323218331-Summary-of-Host-Protection-Policy), the 90-day inspection, salvage titles, registration, ACV cap, excess coverage
- [Outdoorsy: Terms of Service](https://support.outdoorsy.com/hc/en-us/articles/37422344026779-Outdoorsy-Terms-of-Service), not a party to bookings, limited payment collection agent
- [Outdoorsy: How to become a Verified Driver for RV bookings](https://support.outdoorsy.com/hc/en-us/articles/37605703140891-How-to-become-a-Verified-Driver-for-RV-bookings), drivers aged 21 to 24 limited to listings under $75,000
- [Outdoorsy: Ride Auto Protection Packages](https://support.outdoorsy.com/hc/en-us/articles/46808722668827-Ride-Auto-Protection-Packages), vehicles over $150,000 ACV excluded
- [RVshare: RV rental insurance guide](https://rvshare.com/rv/rv-rental-insurance-binder), not an insurer, DigiSure vetting, the 20-year rule, physical damage by value
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), the $200,000 ACV cap and the tracker withholding
- [Airbnb: Verifying your identity](https://www.airbnb.com/help/article/1237), host and co-host verification, re-verification triggers, DAC7 and Brazil tax data
- [eBay: Payouts for sellers](https://www.ebay.com/help/selling/getting-paid/payouts-sellers?id=4814), holds for an unvalidated W-9
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), marketplace facilitator collection by category and seller indemnity
- [Vinted: Buyer Protection fee](https://www.vinted.co.uk/help/342-buyer-protection-fee-on-vinted), protection funded for items from non-professional sellers
