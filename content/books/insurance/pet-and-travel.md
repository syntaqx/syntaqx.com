+++
title = "Pet & Travel Insurance"
description = "The NAIC pet and travel model acts and adoption, waiting periods and preexisting conditions worked, wellness plans, and limited lines travel sales."
category = "Insurance Industry"
order = 2746
part = "Personal Lines"
tags = ["insurance", "pet-insurance", "travel-insurance", "limited-lines", "naic-models", "personal-lines"]
+++

Pet and travel insurance are small lines with outsized software problems. Both are sold mostly online, often by someone other than the insurer (a pet insurance brand on another company's paper, an airline or booking site offering trip protection at checkout); both are priced for high volume and low premium; and both were regulated for years by general property and casualty rules that fit them badly. The NAIC answered with two model acts: the Travel Insurance Model Act (#632) in 2018, which licenses the travel retailers that sell coverage at checkout and bans pre-checked boxes, and the Pet Insurance Model Act (#633) in 2022, which standardizes the definitions of preexisting conditions and waiting periods that pet claims turn on and separates wellness plans from insurance. As of November 2026 each has been adopted, in whole or in part, by a growing list of states.

This chapter covers pet insurance (the market, the model act's definitions, disclosures, waiting periods and wellness rules, with a claim worked) and travel insurance (what it covers, the model act's licensing of limited lines producers and travel retailers, premium tax, travel protection plans and sales practices). The general mechanics of selling insurance inside another product's checkout (licensing models, revenue share, the API) are in Embedded Insurance.

## How the Platforms Do It

As of November 2026:

| Company or body | Line | Public detail |
| --- | --- | --- |
| **NAPHIA** (North American Pet Health Insurance Association) | Pet, industry data | 7.6 million pets insured in North America at the end of 2025, up 8.5% from 7.03 million; its graphic shows $6.2 billion of gross written premium, up 19.4% (report released June 2026) |
| **Trupanion** | Pet | 1,096,173 subscription pets at December 31, 2025; $989.3 million of subscription revenue in 2025; targets returning 71% of premiums to members in claims |
| **Lemonade** | Pet among renters, homeowners, car and life | Pet in its product set; the 10-K describes pet in-force premium growing more than 35 times since launch |
| **Travel insurers and administrators** | Travel | Sold through airlines, online travel agencies, tour operators and travel agents as limited lines travel insurance producers and travel retailers under #632 |

Two structural facts recur. Pet brands often market on another company's paper, which is why #633 requires disclosing when "the underwriting company differs from the brand name used to market and sell the product." Travel coverage is often sold by a retailer whose staff are not licensed producers, which is the problem #632's licensing and registration scheme solves.

## Pet Insurance

The NAIC adopted the **Pet Insurance Model Act (#633)** at its 2022 Summer National Meeting; NAIC's State Implementation Report, as of March 9, 2026, counts 16 jurisdictions that have adopted it. (NAIC's per-state page for the model is dated Spring 2023 and shows only Maine, so it is stale; California's earlier pet insurance statute, Cal. Ins. Code 12880 et seq., covers the same ground.) Its parts:

**Definitions.** If a policy uses one of the model's terms, it must use the model's definition, include it in the policy, and link it from the insurer's or program administrator's website:

- **Pet insurance:** "a property insurance policy that provides coverage for accidents and illnesses of pets."
- **Preexisting condition:** a condition for which, before the policy's effective date or during a waiting period, a veterinarian provided medical advice, the pet received treatment, or (from verifiable sources) the pet had signs or symptoms directly related to the condition claimed. "A condition for which coverage is afforded on a policy cannot be considered a preexisting condition on any renewal."
- **Chronic condition:** one that "can be treated or managed, but not cured."
- **Orthopedic:** conditions of bones, skeletal muscle, cartilage, tendons, ligaments and joints, including hip and elbow dysplasia, intervertebral disc degeneration, patellar luxation and ruptured cranial cruciate ligaments, but not cancers or metabolic, hemopoietic or autoimmune diseases.
- **Waiting period:** time that must pass before some or all coverage begins; "Waiting periods may not be applied to renewals of existing coverage."
- **Wellness program:** a subscription or reimbursement program "separate from an insurance policy" for routine health goods and services.

**Disclosures (Section 4).** Exclusions for preexisting, hereditary, congenital or chronic conditions; waiting periods, deductibles, coinsurance and annual or lifetime limits; whether the insurer reduces coverage or raises premiums based on claim history, the pet's age or a move; a different underwriting company from the brand; the basis for claim payments (a benefit schedule, or usual and customary fees with how they are determined), posted by link from the website's main page; all collected in an "Insurer Disclosure of Important Policy Provisions" delivered with the policy in at least 12-point type.

**Free look.** Unless a claim has been filed, the applicant may return the policy within **15 days** of receipt for a full refund, paid within 30 days of the return. California's statute sets a free look of "not less than 30 days."

**Policy conditions (Section 5).** Insurers may exclude preexisting conditions, and carry the burden of proving the exclusion applies. Waiting periods may not exceed **30 days** for illnesses or orthopedic conditions not caused by an accident, and "Waiting periods for accidents are prohibited." A policy with a waiting period must let it be waived after a veterinary examination (paid by the policyholder unless the policy says otherwise). No veterinary exam may be required to renew. Eligibility can't depend on buying a wellness program.

**Wellness programs (Section 6).** Wellness programs may not be marketed as insurance or during the sale of pet insurance, must be priced and documented separately, and must carry a 12-point bold disclosure that they are not insurance; wellness benefits included in the insurance policy itself are insurance and subject to the insurance code.

**Producer training (Section 7).** Producers must be trained on preexisting conditions and waiting periods, the difference between insurance and wellness programs, hereditary and chronic conditions, and rating and renewal.

### A Pet Claim, Worked

Mine: an accident-and-illness policy effective March 1 with a $250 annual deductible, 80% reimbursement and a $10,000 annual limit, a 14-day illness waiting period (within the model's 30-day cap) and none for accidents.

| Claim | Facts | Result |
| --- | --- | --- |
| March 4: the dog swallows a sock; $3,000 surgery | Accident; no waiting period permitted | ($3,000 − $250) × 80% = **$2,200** paid |
| March 10: vomiting from gastritis; $600 | Illness during the waiting period | Excluded, and gastritis becomes a preexisting condition because signs appeared during the waiting period |
| June 20: gastritis recurs; $900 | Same condition | Excluded as preexisting |
| June 25: ear infection, first signs June 22; $400 | New illness after the waiting period; deductible already met | $400 × 80% = **$320** paid |
| Next March 1: renewal | Ear infection was covered this term | Can't be treated as preexisting on renewal; no new waiting period |

The claims system needs the onset date of each condition, not just the treatment date, and a condition register per pet that carries "first signs" and "first covered" across terms; the renewal rule turns on whether the condition was covered, which is a fact the system must keep as long as the pet is insured.

## Travel Insurance

The **Travel Insurance Model Act (#632)** was adopted in the fourth quarter of 2018 and takes effect 90 days after a state enacts it. NAIC's state page (Summer 2026) lists model adoption citations, some partial, in states including Alabama, Arizona, Arkansas, Colorado (2024), Delaware (2023), Florida (2020), Illinois (2021), Iowa (2022), Kansas (2024), Kentucky (2021), Massachusetts, North Carolina, North Dakota, Ohio, Oklahoma, Oregon (2025), Pennsylvania, Texas (2019), and newer entries for Alaska (2026), Hawaii (2025) and New Mexico (2025); the page's table layout makes a reliable count hard to extract, so a system's per-state rules should come from each state's statute.

**What travel insurance is.** Coverage "for personal risks incident to planned travel," including trip or event interruption or cancellation, lost baggage or personal effects, damage to accommodations or rental vehicles, sickness, accident, disability or death during travel, emergency evacuation, repatriation of remains, and other contractual obligations approved by the commissioner. It excludes major medical plans. Two things sold alongside it are not insurance: **travel assistance services** (security advisories, medical referrals, lost luggage assistance and the like, where no risk is transferred) and **cancellation fee waivers** (a travel supplier's agreement to waive its own cancellation fees). A **travel protection plan** combines the three and may be sold at one price if the plan discloses which parts are which and lets the buyer see the features and pricing of each (Section 6).

**Licensing (Section 4).** A **limited lines travel insurance producer** (LLTIP) license lets a business entity sell travel insurance through a licensed insurer. A **travel retailer** (an airline, booking site, tour operator or cruise line) may offer and disseminate travel insurance under the LLTIP's license if:

- Buyers get the material terms, the claims process, the review and cancellation process, and the insurer's and LLTIP's identity and contact information.
- The LLTIP keeps a **register** of each travel retailer offering coverage on its behalf (name, address, contact, a controlling officer, and federal tax ID), certifies each retailer's compliance with 18 U.S.C. 1033, and produces the register on request.
- The LLTIP designates a licensed individual producer as **Designated Responsible Producer** for compliance, and its officers meet fingerprinting requirements.
- Retailer employees who offer coverage complete training on the products, ethical sales and required disclosures.

Unlicensed retailer staff may describe coverage and price but may not interpret terms, evaluate the customer's existing coverage or hold themselves out as licensed; the LLTIP is responsible for the retailer's acts. Any producer licensed in a major line may sell travel insurance, and a P&C producer needs no appointment to do so.

**Premium tax (Section 5).** Tax is paid to the state where the individual primary policyholder, the primary certificate holder under group coverage, or the blanket policyholder (by residence or principal place of business, with apportionment) is located, and only the travel insurance part of a plan's price is reported as premium, never the assistance services or the cancellation fee waiver.

**Sales practices (Section 7).** All travel insurance sellers are subject to the Unfair Trade Practices Act; in addition:

- Illusory coverage (a policy that could never pay a claim) is an unfair practice.
- Marketing materials must match the policy, preexisting condition exclusions must be explained before purchase, and fulfillment materials must say whether coverage is primary or secondary.
- The buyer may cancel for a full refund of the plan price until at least **15 days** after delivery of the fulfillment materials by postal mail, or **10 days** after delivery by other means, unless a covered trip has started or a claim has been filed.
- **No negative option.** Coverage may not be sold by "negative option or opt out, which would require a consumer to take an affirmative action to deselect coverage, such as unchecking a box on an electronic form, when the consumer purchases a trip."
- Blanket coverage may not be marketed as free.
- Where the destination requires insurance, a seller may make the traveler choose between buying it and providing proof of their own.

**Administrators and forms (Sections 8 and 9).** A **travel administrator** must hold a P&C producer, MGA or third-party administrator license, and the insurer is responsible for its acts and records. Travel insurance is filed for rates and forms as inland marine, except that coverage for sickness, accident, disability or death during travel may be filed as accident and health or inland marine; it may be individual, group or blanket.

### Selling Travel at Checkout

The model act reads as a specification for a booking site's checkout:

- **The offer is opt-in.** The coverage control starts unselected; the purchase record stores that the traveler selected it, with the presented terms and price (Commerce's [Dark Patterns](/books/commerce/online-consumer-protection#dark-patterns) covers the broader rules on pre-checked boxes).
- **The disclosures render before purchase:** insurer and LLTIP identity, that buying insurance isn't required to buy the trip, preexisting condition information, and primary or secondary status, with versions stored.
- **Price components are separated** into travel insurance premium, assistance services and any cancellation fee waiver, because premium tax, commission and refunds are computed on the insurance part alone.
- **The refund window is computed from delivery** of fulfillment materials (10 or 15 days by delivery method), and closes early if the trip starts or a claim is filed.
- **The retailer is on the LLTIP's register** before its checkout goes live, and its staff training is recorded.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `risks` (kind `other` with pet or trip attributes), `coverages`, `producers` and `producer_licenses` (an LLTIP is a producer with a limited line of authority; Producer Licensing & Appointments), `claims` and `exposures`. The core model's extended-by table lists no new tables for this chapter; the deltas below are the condition and offer records the model acts require, kept small.

```sql
CREATE TABLE pet_conditions (              -- a pet's condition history across terms
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  risk_stable_key    UUID NOT NULL,         -- the pet, across terms
  condition_code     TEXT NOT NULL,         -- diagnosis grouping
  category           TEXT CHECK (category IN ('chronic', 'hereditary', 'congenital',
                       'orthopedic', 'other')),
  first_signs_on     DATE NOT NULL,         -- onset, from records
  first_covered_term_id UUID REFERENCES policy_terms (id),  -- set once a claim is paid
  preexisting        BOOLEAN NOT NULL,      -- per the model definition, at first term
  evidence_ref       TEXT NOT NULL          -- vet record
);

CREATE TABLE travel_retailer_registrations (  -- the LLTIP's register under #632 s4
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  lltip_producer_id  UUID NOT NULL REFERENCES producers (id),
  retailer_party_id  UUID NOT NULL REFERENCES parties (id),
  controlling_officer TEXT NOT NULL,
  fein_ref           TEXT NOT NULL,         -- vault reference
  s1033_certified_at TIMESTAMPTZ NOT NULL,
  training_program_ref TEXT NOT NULL,
  registered         DATERANGE NOT NULL
);

CREATE TABLE travel_plan_components (      -- one price, three regulatory treatments
  policy_id          UUID NOT NULL REFERENCES policies (id),
  component          TEXT NOT NULL CHECK (component IN ('travel_insurance',
                       'assistance_services', 'cancellation_fee_waiver')),
  amount             BIGINT NOT NULL,
  is_premium         BOOLEAN GENERATED ALWAYS AS (component = 'travel_insurance') STORED,
  PRIMARY KEY (policy_id, component)
);
```

The offer itself (presented terms, opt-in selection, disclosures shown) is an `offer_presentations` record defined in Embedded Insurance. Design choices that matter:

- **Condition onset is a fact separate from treatment,** recorded with its evidence, because waiting periods and preexisting exclusions turn on it.
- **A covered condition stays covered** on renewal; the system reads `first_covered_term_id` rather than re-deciding.
- **Only the insurance component is premium** for tax, commission and statistical reporting.
- **Free look and refund windows are computed** from delivery records and closed by trip start or claim.

## Auditing

- **Definitions used match the model's** in every state that adopted it, and are linked from the website as required.
- **No accident waiting periods,** no illness waiting periods over 30 days, and waivers honored after an exam.
- **Wellness programs priced and documented separately,** never a condition of eligibility.
- **Every travel retailer was on the register** before it sold, with training records.
- **No opt-out sales:** a sample of checkout records shows affirmative selection.
- **Premium tax** reported on the travel insurance component only, by the policyholder's state.

## What This Means for the System You Build

- **Keep a condition register per pet** with onset dates and the term each condition was first covered.
- **Encode waiting periods, free looks and disclosures per state** from the model act as adopted there, with California's own statute where it differs.
- **Split travel protection plans into insurance, assistance and fee waiver components** at the price level.
- **Run the LLTIP's retailer register and training records** as data the checkout checks.
- **Make coverage opt-in** and store proof of the traveler's selection.

## References

**Law and regulation**

- [Cal. Ins. Code 12880 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-12880/) and [12880.2](https://codes.findlaw.com/ca/insurance-code/ins-sect-12880-2/), California's pet insurance definition and disclosures, including a free look of not less than 30 days

**NAIC**

- [NAIC: Pet Insurance Model Act (#633) (PDF)](https://content.naic.org/sites/default/files/model-law-633.pdf), definitions, disclosures, the 15-day free look, preexisting condition burden, the 30-day waiting period cap and accident ban, exam waivers, wellness program rules and producer training
- [NAIC: Pet Insurance Model Act state page (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-633.pdf), the Spring 2023 adoption chart showing Maine
- [NAIC: State Implementation Report of NAIC-Adopted Model Laws and Regulations, as of March 9, 2026 (PDF)](https://content.naic.org/sites/default/files/national_meeting/Att%2011%20StateImplementationReport_FINAL.pdf), 16 jurisdictions adopting #633
- [NAIC: Travel Insurance Model Act (#632) (PDF)](https://content.naic.org/sites/default/files/model-law-632.pdf), definitions of travel insurance, assistance services and cancellation fee waivers, LLTIP licensing and the retailer register, premium tax, travel protection plans, sales practices including the refund windows and the negative option ban, travel administrators and filing as inland marine
- [NAIC: Travel Insurance Model Act state page, Summer 2026 (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-632.pdf), adoption citations by state

**Filings**

- [Trupanion: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1371285/000137128526000018/trup-20251231.htm), subscription pets, subscription revenue and the 71% value proposition
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), pet in the product set and its in-force premium growth

**In practice**

- [NAPHIA: Industry data](https://naphia.org/industry-data/), pets insured in North America at year-end 2025 and premium growth
