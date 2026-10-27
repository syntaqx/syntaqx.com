+++
title = "Insurance, Deposits & Guarantees"
nav_title = "Insurance & Deposits"
description = "Renters insurance requirements and verification, master and force-placed policies, deposits by state, deposit alternatives, and institutional guarantors."
category = "Property Tech Industry"
order = 1717
part = "Rent and Resident Money"
tags = ["property-tech", "renters-insurance", "security-deposits", "deposit-alternatives", "guarantors", "insurance"]
+++

A lease is a bet that the resident will pay and leave the unit as they found it. Owners hedge the bet three ways: a security deposit held against damage and unpaid rent, insurance (the resident's liability coverage, so a kitchen fire doesn't land on the owner's policy), and a guarantee from someone with more money than the resident. Each has been turned into a product. Renters insurance is sold through agencies inside the portal, master policies cover units whose residents didn't buy their own, surety bonds and monthly premiums replace cash deposits, and insurance-backed guarantors stand in for a parent with good credit. These are among the most profitable things the platforms sell (they're "risk mitigation" and "Embedded Technology Solutions" in the filings), and they sit at the intersection of insurance regulation, landlord-tenant law and fee transparency. This chapter covers the requirements a property sets, verifying that residents meet them, landlord-placed coverage, security deposits and their limits, the alternatives that replace them, and guarantees. Itemizing deductions after move-out belongs to [Move-In & Move-Out](/books/property-tech/move-in-and-move-out#the-final-account-statement); holding deposits in trust accounts to [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#security-deposit-accounts).

## How the Platforms Do It

All three large suites sell renters insurance through their own agencies, and most sell a master policy, a deposit alternative or both:

- **RealPage** sells through "wholly-owned insurance agency subsidiaries" and says 4 million rental units rely on its insurance solutions. Its products span renters insurance (eRenterPlan), gap coverage for vacant units and uninsured residents (RenterProtection), a master policy program with payment with rent and tracking of third-party cancellations (RealCoverage), a lower-cost legal liability program residents pay through their rent ledger with optional contents coverage, insuring up to 100% of occupied units under one master policy (AssetProtect), and review of residents' own policies with automated notices (Policy Validator). Its 10-K for 2020 describes the revenue: commissions from carriers that underwrite the policies, including contingent commissions "affected by claims experienced at the properties". For deposits, it offers a one-time, non-refundable surety bond in place of the deposit (DepositIQ) and Obligo, which it describes as a non-insurance alternative paying out by ACH at move-out.
- **Entrata** sells renters insurance through what it calls a full-service agency; a master policy in two strategies (a standard one, where residents enroll or prove coverage and the unit is otherwise force-placed with costs recovered "based on applicable laws and regulations", and a blanket one, where every unit is enrolled and residents pay through lease charges or rent); verification of third-party policies, with cancellation, renewal and non-payment notices filtered and gap insurance on lapse; a deposit alternative described as a "true insurance policy" paid by a monthly premium, claimed to give 50% more coverage than a typical deposit; and an insurance-backed guarantor waiver covering resident default or eviction, approved within 30 minutes.
- **Yardi Breeze** lets a property require integrated or third-party renters insurance, with claims and complaints processing and resident enrollment.
- **Specialists** sell to properties on every platform. TheGuarantors operates as a licensed agent and broker through Guarantors Insurance Agency, sells a lease guarantee it describes as an insurance product (surplus lines in some states), usually paid for by the renter, and covers operators against defaults, vacancy and damages. Greenlight (formerly Rhino) describes itself as a licensed insurance agency acting as general agent for carriers rated A- or better, with its deposit alternative unavailable in four states.

What the vendor pages share is the shape: an agency owned by or partnered with the platform, a carrier behind it, a commission back, and an enrollment flow inside the lease. The rest of the chapter is what that shape requires.

## Renters Insurance Requirements

Most leases at professionally managed properties require renters insurance; RealPage's insurance page cites a 2013 NMHC survey finding 84% of communities did. The requirement is a lease term with data behind it:

- **Minimum liability,** commonly $100,000 or more per occurrence, so the resident's carrier, not the owner's, pays for the damage a resident causes to the building and neighbors.
- **The property as interested party** (or additional interest) on the policy, so the carrier notifies the property of cancellation or nonrenewal. That notice stream is what verification runs on.
- **When it must be in force:** from move-in through move-out, with proof before keys.
- **What happens without it:** the property places coverage and charges for it, if the lease and law allow, or treats the lapse as a lease violation.

States regulate the requirement and what can be charged for it. Virginia's statute is one detailed example: a landlord may require renters insurance in the rental agreement; must tell the tenant in writing that they may buy their own policy, which they then must prove and keep for the term; may charge premiums for landlord-obtained coverage as rent, not as a deposit, and recover actual costs and related administrative fees; must give a policy summary or certificate (saying whether it waives subrogation) before signing; may place coverage if the tenant's lapses; and if the lease doesn't require insurance, must give written notice that the landlord isn't responsible for the tenant's belongings and that renters insurance doesn't cover flood (Va. Code 55.1-1206). Rules like these are effective-dated data per jurisdiction ([Rules as Data](/docs/architecture/rules-as-data)): whether a requirement is allowed, what must be disclosed, how a landlord-placed premium may be charged, and whether it's rent.

The resident's choice matters for a second reason. A property that requires insurance and makes its own agency's policy the only practical path is tying a product to housing, and the premium is a mandatory fee in the advertised price ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)). My rule: always accept a qualifying third-party policy, make proving one as easy as buying one, and show the requirement (not a product) in the price disclosure.

## Verification and Lapse

Verification is a queue fed by three sources: policies bought through the property's program (verified automatically), proofs residents upload (read, checked against the requirement, approved or rejected), and notices from carriers (cancellation, nonrenewal, non-payment, renewal). Entrata's and RealPage's verification products both describe the same core work: review third-party policies and process carrier notices.

The policy is a record, not a PDF: carrier, policy number, named insureds, liability limit, effective dates, interested party listed or not, the document, and the verification decision with who made it. Every lease member who must be covered is either on a policy or isn't (commercial tenants are tracked the same way, through certificates of insurance: [Tenant Insurance Compliance](/books/property-tech/commercial-property#tenant-insurance-compliance)). Then:

- **Compliance is computed daily** per lease from requirements and policies, not stored as a flag.
- **A carrier notice changes a policy's status** (pending cancellation with a date), and the resident is told before the gap opens.
- **A lapse starts a clock.** The lease and the jurisdiction say what happens: a cure period, then landlord-placed coverage with its charge, or a violation notice. Both RealPage and Entrata sell gap coverage for the lapse.
- **Move-out ends the requirement,** and any landlord-placed charge stops with it.

Document reading is a good use of extraction models, with a person approving anything below a confidence threshold ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)), because a wrongly approved policy is discovered only when there's a claim.

## Master and Force-Placed Policies

A **master policy** is a policy the owner (or its agency program) buys that covers units, rather than residents. It comes in three forms, with very different consequences for the ledger:

- **Gap or force-placed coverage.** Units without a compliant resident policy are enrolled automatically, and the resident is charged, if the lease and law allow. This is Entrata's standard strategy and RealPage's RenterProtection. Coverage is often legal liability only (damage the resident causes to the property), sometimes with optional contents coverage.
- **Blanket coverage.** Every unit is enrolled, and every resident pays through a scheduled charge or rent. Entrata's blanket strategy; RealPage's AssetProtect bills liability coverage to the resident ledger.
- **Owner-only coverage** that protects the owner and isn't charged to anyone.

Three questions decide whether a program is lawful and honest, and the platform should store the answers:

1. **Is the resident an insured?** A policy the resident pays for that protects only the owner is a fee, not insurance. Virginia requires a landlord-obtained policy to "cover the tenant as an insured".
2. **Is the charge rent, a fee or a premium?** Virginia makes it rent; elsewhere the lease decides, and the answer controls late fees, [payment application](/books/property-tech/charges-and-resident-ledgers#payment-application-order) and whether nonpayment supports eviction.
3. **Is it mandatory?** A blanket program is a mandatory recurring charge and belongs in the advertised total; a gap charge is mandatory only for residents who don't buy their own.

Revenue runs the other way. The agency earns commission from the carrier, and RealPage's 10-K says part of it is contingent on claims experience at the properties. A manager may earn "marketing fees or commissions" (RealPage's page says so). That money is an [ancillary agreement](/books/property-tech/resident-financial-products#disclosure-and-revenue-share) like any other, disclosed to the owner, and a contingent commission tied to claims is a reason to watch who decides whether to file one.

## Security Deposits

A security deposit is the resident's money held against what they may owe at the end. It's the baseline every alternative competes with, and it's among the most regulated amounts in the lease. Two states show the dimensions:

| Rule | California (Civil Code 1950.5) | New York (GOL 7-103, 7-108) |
| --- | --- | --- |
| **Cap** | One month's rent for security demanded on or after July 1, 2024; two months for a natural person or all-natural-person LLC owning no more than two properties with no more than four units for rent, except for service members | One month's rent |
| **What counts** | Any payment, fee, deposit or charge at the start of a tenancy used for rent default, damage, cleaning or similar | Any deposit or advance |
| **Holding** | Not specified in the cap provisions | Held in trust, not commingled, at a bank with a place of business in New York; tenant told the bank and amount |
| **Interest** | Not required by state law | Interest-bearing account required in buildings of six or more units; landlord may keep 1% a year as an administrative fee |
| **Return** | Itemized statement within 21 days of vacating | Itemized statement within 14 days, or the right to keep any of it is forfeited |
| **Evidence** | Photos at move-in (tenancies from July 1, 2025) and at move-out before and after repairs (from April 1, 2025) | Move-in and pre-move-out inspection on request |

California's definition of security is the one to read twice: a charge "imposed at the start of a tenancy" for damage or default counts as security whatever it's called, so a non-refundable move-in fee doing a deposit's job may count toward the one-month cap. Whether a deposit alternative's premium is such a charge is a question for counsel in each state; the platform's part is to know, per jurisdiction, which charge codes count toward the cap, and to add them up before a lease is signed.

Deposits drive several platform behaviors:

- **The cap is checked at lease generation,** summing every charge code that counts as security in that jurisdiction, so a deposit, a pet deposit and a "move-in fee" can't exceed it together.
- **The deposit is a liability, not income,** posted to a deposits-held account on the landlord entity's books and often into a separate bank account; [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#security-deposit-accounts) owns those accounts, and the [ledger](/books/property-tech/charges-and-resident-ledgers#the-resident-ledger-and-the-general-ledger) keeps deposit charges on a deposit category that never counts as rent.
- **Interest accrues** where the law requires it, per deposit, at the account's rate less any allowed administrative fee, and is paid annually, credited to rent or returned at move-out, as the jurisdiction and the resident's choice dictate.
- **Unreturned deposits become unclaimed property** when the resident can't be found, which [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#unclaimed-property) covers.

## Deposit Alternatives

Deposit alternatives lower move-in cost by replacing cash with a product. Four structures exist, and they're different legal objects:

| Structure | Resident pays | Who pays the owner at move-out | Does the resident still owe? |
| --- | --- | --- | --- |
| **Surety bond** | A one-time, non-refundable premium (RealPage's DepositIQ) | The surety, up to the bond amount | Depends on the bond's indemnity terms, which the resident should see before buying |
| **Insurance policy** | A monthly premium (Entrata describes its product as a "true insurance policy") | The insurer | Depends on the policy's subrogation terms |
| **Deposit waiver or fee** | A monthly fee; no insurance | Nobody: the owner waives the deposit and pursues the resident for damage | Yes, directly |
| **Payment authorization or letter of credit** | Little or nothing up front; the resident authorizes a charge if a claim arises (RealPage describes Obligo as "non-insurance", paying out by ACH at move-out) | The resident's own funds or credit, through the provider | Yes |

The common misunderstanding, and the common complaint, is that the resident thinks they've bought out of liability when they've only bought out of the upfront deposit. A product that's non-refundable, recurring and leaves the resident owing for damage can cost far more than a deposit that would have been returned. So the platform presents alternatives with three plain facts at the moment of choice: the total cost over the lease term, that it's not refundable, and whether the resident still owes for damage and unpaid rent.

State law reaches these products from several directions. Virginia allows a landlord to require "damage insurance" and charge its premiums as rent, caps a deposit plus damage insurance at two months' rent combined, and lets a tenant who opts out buy their own policy or pay the full deposit instead (Va. Code 55.1-1206). Insurance and surety regulators license the agencies and approve the products, which is why the vendors describe themselves as licensed agencies and why some products aren't offered in some states. Deposit caps may count the product's cost if it's charged at the start of the tenancy. As of October 2026, those rules are fragmented and changing, so the platform treats "may this property offer this alternative, and how must it be disclosed and charged" as jurisdiction data owned by compliance, not a product toggle.

At move-out, a deposit alternative turns deposit accounting into a **claim**: the property itemizes what's owed (the same itemization the law requires for a cash deposit), submits it to the provider, and the provider pays and, depending on the structure, pursues the resident. The resident's ledger must show the claim and its payment as a third-party payment, and any amount the provider recovers from the resident is the provider's collection, not the landlord's. When the resident disputes the itemization, both the landlord's and the provider's records are in play, which is why the claim is a record with its evidence.

## Guarantors and Institutional Guarantees

A **personal guarantor** is a person (often a parent) who promises to pay if the resident doesn't. The core model already holds one: a `lease_members` row with role `guarantor`, financially responsible but not an occupant. Guarantors are screened like applicants ([Applications & Screening](/books/property-tech/applications-and-screening#the-application)), sign the lease or a separate guaranty ([The Lease](/books/property-tech/the-lease#guarantors)), and need their own portal access to see the ledger they're liable for, without seeing the household's maintenance requests or messages ([Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants)). [Student Housing](/books/property-tech/student-housing#guarantors-parents-international-families-and-substitutes) covers parental guarantors at scale.

An **institutional guarantee** replaces the person with a company. TheGuarantors describes its lease guarantee as an insurance product sold through its licensed agency; Entrata's guarantor waiver is insurance-backed, covers default and eviction, and is approved in about 30 minutes. The applicant pays (usually), the owner gets coverage of some multiple of monthly rent or months of the lease, and when the resident defaults the owner files a claim.

For the platform:

- **The guarantee is a record on the lease,** not a lease member: provider, policy or certificate number, coverage amount or months, premium and who paid it, term.
- **Approval conditions link to screening.** An applicant approved "with a guarantor" can satisfy the condition with a person or a qualifying institutional product, and the decision record says which ([More Outcomes Than Yes and No](/docs/architecture/risk-scoring#more-outcomes-than-yes-and-no)).
- **A claim follows delinquency.** The guarantee's claim deadline and documentation requirements become tasks in [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction#collections-after-move-out), and money from the provider is a third-party payment on the ledger.
- **Renewals need the guarantee renewed,** or a new decision.

## How to Build It

The core model's `lease_members` holds personal guarantors and `charges` carries premiums and deposits; this chapter adds requirements, policies, deposits and guarantees. Agency and commission contracts are `ancillary_agreements` from [Resident Financial Products & Ancillary Revenue](/books/property-tech/resident-financial-products#how-to-build-it):

```sql
CREATE TABLE insurance_requirements (    -- what a property requires, over time
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  property_id           UUID NOT NULL REFERENCES properties (id),
  min_liability         BIGINT NOT NULL,  -- minor units per occurrence
  interested_party_name TEXT NOT NULL,    -- as it must appear on the policy
  cure_period           INTERVAL NOT NULL DEFAULT '0 days',
  on_lapse              TEXT NOT NULL CHECK (on_lapse IN ('landlord_placed', 'violation', 'none')),
  landlord_placed_charge_code_id UUID REFERENCES charge_codes (id),
  valid_during          DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

CREATE TABLE resident_insurance_policies (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  lease_id        UUID NOT NULL REFERENCES leases (id),
  source          TEXT NOT NULL CHECK (source IN ('resident_purchased', 'property_program',
                    'landlord_placed', 'blanket')),
  agreement_id    UUID REFERENCES ancillary_agreements (id),  -- program policies
  carrier         TEXT NOT NULL,
  policy_number   TEXT NOT NULL,
  liability_limit BIGINT NOT NULL,
  covers_resident_as_insured BOOLEAN NOT NULL,
  interested_party_listed    BOOLEAN NOT NULL,
  coverage_period DATERANGE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending_review', 'verified', 'rejected',
                    'pending_cancellation', 'cancelled', 'expired')),
  verified_by     UUID REFERENCES users (id),  -- staff, the carrier feed's service user,
                                          -- or an AI agent's user (a person reviews)
  document_id     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insurance_policy_events (    -- carrier notices and status changes
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  policy_id   UUID NOT NULL REFERENCES resident_insurance_policies (id),
  kind        TEXT NOT NULL CHECK (kind IN ('issued', 'renewed', 'nonpayment_notice',
                'cancellation_notice', 'cancelled', 'nonrenewal', 'reinstated')),
  effective_on DATE NOT NULL,
  source      TEXT NOT NULL,              -- 'carrier_feed', 'email_intake', 'staff'
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_deposits (         -- what secures a lease, in whatever form
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  form              TEXT NOT NULL CHECK (form IN ('cash', 'surety_bond', 'insurance',
                      'waiver', 'payment_authorization')),
  amount            BIGINT NOT NULL,      -- cash held, or the coverage the product provides
  currency          CHAR(3) NOT NULL,
  charge_id         UUID REFERENCES charges (id),       -- the deposit charge, for cash
  agreement_id      UUID REFERENCES ancillary_agreements (id),  -- the provider's, for products
  certificate_number TEXT,
  bank_account_id   UUID REFERENCES bank_accounts (id),  -- where cash is held (Trust Accounting)
  interest_rule_evaluation_id UUID REFERENCES rule_evaluations (id),  -- null if no interest rule
  cap_rule_evaluation_id UUID REFERENCES rule_evaluations (id),  -- security_deposit_limit check
  counts_toward_cap BIGINT NOT NULL,      -- the amount the jurisdiction counts as security
  status            TEXT NOT NULL CHECK (status IN ('held', 'claim_pending', 'settled',
                      'refunded', 'escheated')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deposit_interest_accruals (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  deposit_id   UUID NOT NULL REFERENCES security_deposits (id),
  period       DATERANGE NOT NULL,
  gross_interest BIGINT NOT NULL,
  admin_fee    BIGINT NOT NULL DEFAULT 0, -- e.g. New York's 1% a year
  disposition  TEXT NOT NULL CHECK (disposition IN ('paid', 'credited_to_rent', 'held')),
  UNIQUE (deposit_id, period)
);

CREATE TABLE lease_guarantees (          -- an institutional guarantee; persons are lease_members
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  lease_id        UUID NOT NULL REFERENCES leases (id),
  agreement_id    UUID NOT NULL REFERENCES ancillary_agreements (id),  -- the provider's
  guarantor_entity_id UUID NOT NULL REFERENCES legal_entities (id),  -- the institutional guarantor
  certificate_number TEXT NOT NULL,
  coverage_amount BIGINT,
  coverage_months NUMERIC(4, 1),
  premium         BIGINT,
  premium_payer   TEXT NOT NULL CHECK (premium_payer IN ('resident', 'owner')),
  claim_deadline  INTERVAL,               -- after move-out or default, per the policy
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE guarantee_claims (          -- claims on bonds, policies, waivers and guarantees
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  lease_id        UUID NOT NULL REFERENCES leases (id),
  deposit_id      UUID REFERENCES security_deposits (id),
  guarantee_id    UUID REFERENCES lease_guarantees (id),
  amount_claimed  BIGINT NOT NULL,
  itemization     JSONB NOT NULL,         -- the same itemization the law requires for cash
  status          TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'paid', 'partially_paid',
                    'denied', 'withdrawn')),
  amount_paid     BIGINT,
  payment_id      UUID REFERENCES payments (id),  -- the provider's payment on the ledger
  resident_still_liable BOOLEAN NOT NULL, -- from the product's terms
  submitted_on    DATE,
  CHECK (deposit_id IS NOT NULL OR guarantee_id IS NOT NULL)
);
```

Decisions behind it:

- **One deposit table for every form,** so "what secures this lease" is one row whatever the product, and the cap check sums `counts_toward_cap` across them.
- **Compliance is derived** from requirements and policies by date, and every landlord-placed charge points to the lapse that triggered it.
- **Carrier notices are events,** idempotent on the carrier's reference, so status is reproducible and a duplicated email doesn't cancel coverage twice.
- **Claims carry their own itemization** and whether the resident still owes, so the resident's ledger, the provider's recovery and the move-out statement agree.
- **Commissions live in revenue share entries** on the agency agreement, not in this chapter's tables.

## Auditing

- **Every requirement and disclosure** in force when each lease was signed, including any state-required notices like Virginia's policy summary and flood warning.
- **Every verification decision** with the document, the reviewer (human or model) and the limits checked, and every lapse with the notice sent and the charge that followed.
- **Every deposit's life:** the cap check at signing, the account it was held in, interest accrued, and its settlement, refund or escheat, against the jurisdiction's deadline.
- **Every alternative's terms as presented,** the resident's election and the claim history, because "I was told I wouldn't owe anything" is the dispute these products generate.
- **Commissions by property and carrier,** including contingent commissions, for owner reporting and conflicts review.

## What This Means for the System You Build

- **Store insurance requirements per property and policies per lease,** and compute compliance daily from both.
- **Accept third-party policies as easily as program policies,** and verify with a person in the loop where a model isn't sure.
- **Record whether each landlord-placed or blanket policy insures the resident,** whether its charge is rent, a fee or a premium, and whether it's mandatory.
- **Check deposit caps at lease generation** across every charge the jurisdiction counts as security, and keep interest, holding and return rules as jurisdiction data.
- **Present deposit alternatives with total cost, refundability and remaining liability,** and treat their move-outs as itemized claims.
- **Model institutional guarantees as their own records,** linked to screening conditions and to delinquency for claims.

## References

**Statutes**

- [California Civil Code 1950.5](https://california.public.law/codes/ca_civ_code_section_1950.5), the one-month cap from July 1, 2024, the small landlord exception, the definition of security, 21-day itemization, move-in and move-out photos
- [New York General Obligations Law 7-103](https://www.nysenate.gov/legislation/laws/GOB/7-103), deposits held in trust, not commingled, at a New York bank; interest for buildings of six or more units; 1% administrative fee
- [New York General Obligations Law 7-108](https://www.nysenate.gov/legislation/laws/GOB/7-108), one-month cap, inspections, 14-day itemized return and forfeiture
- [Virginia Code 55.1-1206](https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1206/), required renters insurance, landlord-obtained premiums as rent, policy summaries, damage insurance in lieu of a deposit, the two-month combined cap

**Filings**

- [RealPage: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/1286225/000128622521000007/rp-20201231.htm), commission revenue from liability and renters insurance through agency subsidiaries, contingent commissions affected by claims experience

**In practice**

- [RealPage: Insurance](https://www.realpage.com/insurance/), renters insurance, gap coverage, master policy, ledger-billed liability coverage, policy validation, agency subsidiaries, 4 million units, the 2013 NMHC requirement figure
- [RealPage: Security deposit alternatives](https://www.realpage.com/resident-services/security-deposit-alternatives/), a one-time non-refundable surety bond and a non-insurance alternative
- [Entrata: Renters Insurance](https://www.entrata.com/products/renters-insurance), renters insurance through a full-service agency
- [Entrata: Master Policy](https://www.entrata.com/products/master-policy), standard and blanket strategies, force-placement, cost recovery where law allows
- [Entrata: Insurance Verification](https://www.entrata.com/products/insurance-verification), third-party policy review, notice handling, gap coverage on lapse
- [Entrata: Deposit Alternative](https://www.entrata.com/products/deposit-alternative), a monthly premium insurance policy in place of a deposit
- [Entrata: Homebody Guaranty](https://www.entrata.com/products/homebody-guaranty), an insurance-backed guarantor waiver covering default and eviction
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), requiring integrated or third-party renters insurance
- [TheGuarantors](https://www.theguarantors.com/), a lease guarantee sold as insurance through a licensed agency, surplus lines in some states
- [Greenlight Rent](https://www.greenlightrent.com/), a licensed agency acting as general agent for carriers, a deposit alternative not offered in four states
