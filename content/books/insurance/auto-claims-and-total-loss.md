+++
title = "Auto Claims & Total Loss"
description = "Auto claims: estimating, repair rules and direct repair, total loss thresholds, a valuation with taxes and fees, salvage and title, rental and injury claims."
category = "Insurance Industry"
order = 2732
part = "Claims"
tags = ["insurance", "claims", "auto-insurance", "total-loss", "salvage", "estimating"]
+++

Auto is where claims became software first. A dented quarter panel turns into an estimate built from a parts and labor database, photographed by the owner, written by an appraiser who may never see the car, sent to a repair shop in the insurer's direct repair network, supplemented when the bumper comes off, and paid electronically to the shop. A car that costs more to fix than it's worth turns into a valuation built from comparable vehicles, a settlement that has to include sales tax and title fees, a payoff to the lienholder, a title transfer, and a salvage auction that sells the wreck within days of the title clearing. Each step has a vendor, and most steps have a rule: what the estimate must allow, how far the insured can be made to drive, which parts may be used, how the value is calculated, what deductions are allowed and how fast the insured can push back.

This chapter covers the platforms, liability versus physical damage, estimating and repair rules including direct repair programs and parts, when a car is a total loss and who decides, the valuation rules with a worked settlement including taxes and fees, salvage and title, rental and loss of use, and injury claims at pointer level. Salvage proceeds and subrogation against the other driver's insurer are in [Subrogation, Salvage & Recovery](/books/insurance/subrogation-and-salvage); the dealer's side of titling is in [Automotive Retail](/books/commerce/automotive-retail#titling-and-registration); compulsory coverage, no-fault and uninsured motorist rules are in [Personal Auto](/books/insurance/personal-auto).

## How the Platforms Do It

As of November 2026, from filings and vendor sites (vendor figures are their own):

| Platform | Role in the auto claim |
| --- | --- |
| **CCC Intelligent Solutions** | Estimating on a proprietary database with AI-suggested estimate lines (parts, labor and taxes), repairer estimating with OEM repair procedures and real-time parts pricing, total loss valuations "based on CCC's market-driven valuation methodology" with a fee calculator for title, registration and plate fees, direct repair network management (CCC says it pioneered US direct repair programs in 1992 and its software facilitates most of them), subrogation and casualty tools. More than 300 insurers, about 30,500 repair facilities, more than $200 billion of transactions a year and nearly 800 million photos a year (10-K for 2025) |
| **Snapsheet** | Virtual vehicle appraisal across private passenger, motorcycle, boat and RV, truck and exotic vehicles; total loss settlement; integrated payments |
| **Hi Marley** | Total Loss Assist, a total loss product on its SMS claims conversation platform |
| **Copart** | Salvage: pickup, advance charges, title processing with state DMVs, online VB3 auctions, salvage value estimates (Co.ai) and machine-learned minimum bids (IntelliSeller); insurers supplied 79% of the vehicles it processed in fiscal 2026 (10-K for the year ended July 31, 2026) |
| **RB Global (Insurance Auto Auctions)** | Copart names it among the largest US auctioneers competing for salvage |

The data contract across them: an **estimate** (versioned, with supplements), a **valuation** (comparables, adjustments, taxes and fees), a **salvage assignment** (pickup, charges, title status, sale, proceeds) and **payments** to the shop, the insured and the lienholder, all attached to the collision or comprehensive exposure, or to the third party's property damage exposure.

## Liability Versus Physical Damage

An auto accident produces two kinds of claim against two kinds of coverage. **First-party physical damage** is the insured's own car under collision or comprehensive (other than collision), paid less the deductible, whoever was at fault; the insurer then subrogates against the at-fault driver's insurer. **Third-party** claims are against the insured's liability coverage: property damage (the other car, a fence) and bodily injury, paid only if the insured is legally liable, up to the limits, with no deductible to the claimant. The same damaged car can be handled either way: the other driver may claim against the insured's liability coverage, or against their own collision coverage and let their insurer subrogate.

Claim rules limit the insurer's use of that choice. Model 902 says that where liability and damages are reasonably clear, insurers "shall not recommend that third party claimants make claim under their own policies solely to avoid paying claims under such insurer's policy," and California has the same rule (10 CCR 2695.8(d)). Third-party claimants are owed fair treatment on the clocks too ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law)), but the duty of good faith that supports bad faith suits runs mainly to the insured ([Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation)).

## Estimating and Repair

A repair estimate is a priced list of operations: replace or repair each part, labor hours by type (body, refinish, frame, mechanical), paint and materials, sublet work, taxes. Estimating platforms carry the parts catalogs, labor times and OEM repair procedures; the estimate is written by a staff appraiser, an independent appraiser, the shop, or from the owner's photos, and supplemented when teardown finds hidden damage. The rules on it, from Model 902 and California's regulation (10 CCR 2695.8, last substantively amended effective January 1, 2017):

- **The insured gets the estimate.** If a partial loss is settled on the insurer's written estimate, the insurer supplies a copy; the estimate must be reasonable and allow repairs "in a workmanlike manner." If the insured's shop writes a higher estimate, the insurer pays the difference or names at least one shop that will do the work for its estimate (Model 902; California adds the option to adjust the shop's estimate with itemized changes).
- **No unreasonable travel.** Insurers may not require a claimant to travel an unreasonable distance to inspect a replacement car, get an estimate or have it repaired; California sets the line at more than 15 miles in an urban area of 100,000 or more people and more than 25 miles elsewhere.
- **Inspections on a clock.** In California, a first-party inspection or reinspection is due within 6 business days, and a request for photos or an estimate in lieu of inspection within 3.
- **The insured chooses the shop.** California forbids requiring a particular shop or suggesting a different one after the claimant has chosen, except as Insurance Code 758.5 allows. Direct repair programs (shops that agree to the insurer's labor rates, estimating guidelines and cycle time targets in exchange for referrals) are lawful, but steering is not; the system records the claimant's choice and what they were told.
- **Parts.** California lets an insurer require non-original equipment manufacturer crash parts only if they meet conditions on quality, fit and warranty, with disclosure, and to stop immediately and notify the distributor within 30 days when it learns a part doesn't comply; Model 902 requires replacement crash parts to be identified and of the same quality as the original. No insurer may require the insured to supply parts.
- **Betterment.** Deductions for betterment or depreciation must be itemized, specified in dollars and documented; Model 902 limits a wear-and-tear or rust deduction to $1,000, and California says labor isn't depreciated unless the policy clearly permits it.
- **Towing and storage.** The insurer gives reasonable notice before it stops paying storage, and pays reasonable towing charges from any tow company unless it named one before the insured used another (Model 902).

## When a Car Is a Total Loss

Two different decisions share the name. The **insurer's decision** is economic: if the repair cost plus the salvage value the insurer would give up is more than the car's actual cash value, paying the value and selling the wreck costs less than fixing it. Copart's 10-K describes the start of the flow: the adjuster estimates the repair cost and the pre-accident value, then assigns the vehicle to a salvage auction and settles with the insured. The **state's decision** is about the title: when a damaged car must be branded salvage or nonrepairable, so the next buyer knows.

| State | Title rule |
| --- | --- |
| **Florida, Stat. 319.30** | A vehicle is a total loss when an insurer pays the owner to replace it (or pays for a theft); for an uninsured vehicle, when repair cost is 80% or more of the cost of a like kind and quality replacement. The owner forwards the title within 72 hours of the vehicle becoming salvage, and an insurer that pays a total loss obtains the title and forwards it within 72 hours of receiving it; an insurer that can't get a properly assigned title may apply for a salvage certificate 30 days after paying. A late model vehicle (seven model years or newer, retail $7,500 or more) with repair estimates of 90% or more of retail is declared unrebuildable and gets a certificate of destruction |
| **Texas, Transp. Code 501.091** | A salvage motor vehicle is one whose cost of repairs (excluding repainting and sales tax) exceeds its actual cash value, defined as market value, immediately before the damage; damage excludes hail, gradual damage, paint-only damage and theft without damage. A nonrepairable vehicle is one whose only residual value is as parts or scrap |

So in Florida any car an insurer pays as a total loss is a total loss for title purposes, whatever the ratio, while in Texas the title brand follows the damage ratio and hail is carved out. The claim system records both decisions separately: the insurer's in `total_loss_valuations`, with the numbers, and the title outcome (salvage, nonrepairable, certificate of destruction) as the `brand` on `salvage_titles`, with the state rule that produced it.

## Valuation Rules

Model 902 (Section 8A) governs first-party total losses settled on actual cash value or replacement with a vehicle of like kind and quality. The insurer may:

1. **Offer a replacement** from a licensed dealer within a reasonable distance: same manufacturer, same or newer year, similar body style, options and mileage, in as good or better condition, paying all taxes, license fees and other fees incident to transfer of ownership, at no cost other than the deductible; or
2. **Pay cash** based on the actual cost, less the deductible, to buy a comparable automobile, "including all applicable taxes, license fees and other fees incident to transfer of evidence of ownership," derived from (a) two or more comparable automobiles in the local market available within the last 90 days, (b) two or more in proximate markets, (c) quotations from two or more licensed local dealers, or (d) "any source for determining statistically valid fair market values" that gives primary consideration to local values, covers at least 85% of makes and models for the last 15 model years with all major options, and uses current data from the area where the car was principally garaged. Clause (d) is the regulatory home of the valuation vendors.

Deviations need documentation of the car's condition, and "any deductions from the cost, including deduction for salvage, must be measurable, discernible, itemized and specified as to dollar amount." The **right of recourse**: if the insured reports within 35 days of receiving the claim draft that they can't buy a comparable for the value, the insurer reopens the file and locates a comparable at that value, pays the difference, offers a replacement, or goes to the policy's appraisal provision, unless its settlement already identified a specific comparable vehicle with its VIN.

California's version (10 CCR 2695.8(b), (c)) is more prescriptive. Comparables must be the same manufacturer, same or newer model year, same model type, similar body type and similar options and mileage, available for retail purchase in the local market within 90 calendar days of the final settlement offer, and identified by VIN, stock or order number or plate with the seller's contact details; adjustments must be "discernible, measurable, itemized, and specified." The settlement includes "applicable taxes and one-time fees incident to transfer of evidence of ownership" and the license and other annual fees for the remaining registration term, whether or not the insured buys a replacement. If the owner keeps the car, the salvage value is deducted, the sales tax is reduced by the tax attributable to the salvage value, salvage transfer fees are included, and the insurer discloses the DMV notice requirement and the right to seek a refund of unused license fees. The reopening window is 35 calendar days after payment or the final offer.

### Worked Numbers: A Total Loss With Taxes and Fees

Mine, on California's rules, with an assumed 9.50% local sales tax rate, an assumed $25 of one-time transfer fees and assumed annual registration fees of $420 with 5 months left on the registration (the real figures come from the state's fee schedules and the vendor's fee calculator). A 2021 midsize sedan, collision deductible $1,000, financed with $14,200 owed to the lienholder. The repair estimate is $19,900 and the salvage bid is $4,800.

| Step | Calculation | Amount |
| --- | --- | --- |
| Comparables, local, within 90 days | $24,800, $25,600, $24,300; average | $24,900.00 |
| Condition adjustment, itemized | Prior unrepaired damage to the rear bumper, documented | -$350.00 |
| Actual cash value | | **$24,550.00** |
| Total loss check | Repair $19,900 + salvage $4,800 = $24,700 > $24,550 | Total loss |
| Sales tax on the comparable | 24,550 × 9.50% | $2,332.25 |
| One-time transfer fees | Assumed | $25.00 |
| Registration fees for the remaining term | 420 × 5 / 12 | $175.00 |
| Gross settlement | | $27,082.25 |
| Less deductible | | -$1,000.00 |
| **Net settlement** | | **$26,082.25** |
| To the lienholder | Payoff | $14,200.00 |
| To the insured | Balance | **$11,882.25** |

If the owner keeps the car instead: deduct the $4,800 salvage value and reduce the sales tax by the tax on it (4,800 × 9.50% = $456.00, so tax becomes $1,876.25); the settlement is 24,550 − 4,800 + 1,876.25 + 25 + 175 − 1,000 = **$20,826.25**, the title goes to salvage in the owner's name, and the owner is told about the DMV notice and the license fee refund. Either way, the valuation report lists every comparable with its identifier and source, every adjustment in dollars, and the tax and fee lines with their basis, because those are exactly the items a regulator or a class action audits.

Two lessons for the system. The **tax and fee lines are part of the indemnity**, not extras: a valuation engine that returns only actual cash value under-pays in every state that follows the model. And the **35-day recourse window is a task** that opens on payment or final offer, not a policy footnote.

## Salvage and Title

Once the insurer decides on a total loss and the owner accepts, the claim needs the title. The insurer pays off the lienholder (who releases the lien and the title), gets the title signed over by the owner (or uses the state's procedure when it can't, like Florida's salvage certificate after 30 days), and applies for a salvage or nonrepairable title in its name or the auction's. Copart describes its side: it picks up the car after receiving an assignment, pays advance charges (towing, storage, impound) and recovers them at sale, stores the car until ownership documents are transferred and title is cleared with the DMV (most US states allow sale of a total loss only after a salvage title issues; documents generally arrive 45 to 60 days after pickup), uses DMV integrations and a title service for some sellers, sells through online auctions, and remits proceeds net of seller fees. The salvage proceeds are a recovery on the exposure ([Subrogation, Salvage & Recovery](/books/insurance/subrogation-and-salvage)).

What the claim system tracks per total loss: the lien and payoff letter, the owner's title documents (power of attorney, odometer statement, keys), the state title application and its status, the salvage assignment and its charges, the title brand issued, and the sale. Most of the cycle time in a total loss is waiting for paper, which is why vendors sell tools for it, Copart's Title Express among them.

## Rental and Loss of Use

A first-party insured gets a rental car only if the policy has rental reimbursement coverage, usually limited per day and per claim. A third-party claimant whose car was damaged by an insured is owed the loss of its use for a reasonable repair period under liability coverage, whether or not they rent. Both are separate exposures (or separate cost lines on the property damage exposure) with their own reserves, because they're paid on a different coverage and limit. The clock that matters is the repair or total loss cycle time: every day the estimate, supplement or title waits is a day of rental the insurer pays. Model 902 also requires reasonable notice before the insurer stops paying storage charges, and California repeats it.

## Injury Claims at Pointer Level

Bodily injury exposures are a different trade: medical records and bills, wage loss, liens (health plans, Medicare and Medicaid), demands, attorney representation, litigation. They carry most of the money and most of the time in auto claims, and their rules belong to other chapters: no-fault PIP and medical payments and their state systems ([Personal Auto](/books/insurance/personal-auto)), the treatment of time-limited settlement demands and bad faith exposure ([Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation)), staged accidents and medical provider fraud ([Fraud & SIU](/books/insurance/insurance-fraud)), and 1099 reporting on payments to attorneys and medical providers ([Exposures, Reserves & Payments](/books/insurance/reserves-and-payments#sanctions-and-tax-reporting)). CCC's casualty product shows the shape of the tooling: it applies insurer-specific rules to separate payment-ready medical bills from bills needing review, and routes bills to negotiation services. The medical billing formats themselves are the [Health Tech](/books/health-tech/claims) volume's subject.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `exposures`, `incidents` ([First Notice, Coverage & Triage](/books/insurance/first-notice-and-triage)), `risks` (the insured vehicle) and `claim_payments`. This chapter adds `estimates`, `total_loss_valuations` and `salvage_titles`.

```sql
CREATE TABLE estimates (                   -- a repair estimate and each supplement
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  incident_id        UUID REFERENCES incidents (id),
  version            INT NOT NULL,          -- 0 original, 1.. supplements
  source             TEXT NOT NULL CHECK (source IN ('staff_appraiser', 'independent_appraiser',
                       'shop', 'photo', 'insured')),
  vendor             TEXT,                  -- estimating platform
  vendor_ref         TEXT,
  shop_party_id      UUID REFERENCES parties (id),
  drp                BOOLEAN NOT NULL DEFAULT FALSE,  -- shop in a direct repair program
  shop_chosen_by     TEXT CHECK (shop_chosen_by IN ('claimant', 'insurer_referral')),
  parts_total        BIGINT NOT NULL,
  labor_total        BIGINT NOT NULL,
  paint_materials    BIGINT NOT NULL DEFAULT 0,
  sublet_total       BIGINT NOT NULL DEFAULT 0,
  tax_total          BIGINT NOT NULL DEFAULT 0,
  betterment         BIGINT NOT NULL DEFAULT 0, -- itemized in lines
  gross_total        BIGINT NOT NULL,
  non_oem_parts      BOOLEAN NOT NULL DEFAULT FALSE,
  document_id        UUID NOT NULL,         -- the estimate as given to the insured
  written_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (exposure_id, version)
);

CREATE TABLE total_loss_valuations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  method             TEXT NOT NULL CHECK (method IN ('local_comparables', 'proximate_comparables',
                       'dealer_quotes', 'valuation_service', 'replacement_offer')),
  vendor_ref         TEXT,
  comparables        JSONB NOT NULL,        -- VIN or stock, seller, price, date, distance
  adjustments        JSONB NOT NULL,        -- each itemized in minor units with its reason
  actual_cash_value  BIGINT NOT NULL,
  repair_estimate    BIGINT,                -- for the total loss decision
  salvage_value      BIGINT,
  sales_tax          BIGINT NOT NULL,
  transfer_fees      BIGINT NOT NULL,
  registration_fees  BIGINT NOT NULL,       -- remaining term, where the state requires
  deductible         BIGINT NOT NULL,
  owner_retained     BOOLEAN NOT NULL DEFAULT FALSE,
  net_settlement     BIGINT NOT NULL,
  rule_ref           TEXT NOT NULL,         -- '10 CCR 2695.8(b)', 'NAIC 902 8A(2)(d)'
  offered_at         TIMESTAMPTZ NOT NULL,
  recourse_due_at    TIMESTAMPTZ NOT NULL,  -- 35 days
  document_id        UUID NOT NULL          -- the valuation report as sent
);

CREATE TABLE salvage_titles (              -- the paper and the car, until sold
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  vin                TEXT NOT NULL,
  title_state        TEXT NOT NULL,
  lienholder_party_id UUID REFERENCES parties (id),
  payoff_amount      BIGINT,
  lien_released_at   TIMESTAMPTZ,
  owner_docs_received_at TIMESTAMPTZ,       -- title, POA, odometer statement
  brand              TEXT CHECK (brand IN ('salvage', 'nonrepairable',
                       'certificate_of_destruction', 'total_loss', 'none')),
  brand_rule_ref     TEXT,                  -- 'Fla. Stat. 319.30(3)', 'Tex. Transp. Code 501.091'
  title_applied_at   TIMESTAMPTZ,
  title_issued_at    TIMESTAMPTZ,
  salvage_vendor     TEXT,
  assignment_ref     TEXT,
  advance_charges    BIGINT NOT NULL DEFAULT 0,
  sold_at            TIMESTAMPTZ,
  gross_proceeds     BIGINT,
  seller_fees        BIGINT,
  recovery_id        UUID                   -- recoveries (Subrogation, Salvage & Recovery)
);
```

The total loss flow is a state machine on the exposure: `appraising`, `total_loss_offered` (valuation sent, recourse window open), `accepted`, `lien_payoff`, `title_pending`, `paid`, `salvage_assigned`, `sold`, `closed`, with `recourse_reopened` and `appraisal` as side states. Each transition is an event the clocks read ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law#the-diary-as-a-rules-engine)).

Design choices:

- **Valuation output is the full settlement,** with taxes and fees by line, not a single value.
- **Comparables are evidence,** stored with identifiers and dates, because the rules require them in the file.
- **The shop choice is recorded with what the claimant was told,** to show there was no steering.
- **Title work is tracked as data with dates,** so cycle time and the Florida 72-hour duties are measurable.

## Auditing

- **Every estimate and supplement** as given to the insured, with source, shop, DRP status, parts types and betterment lines.
- **Every valuation** with comparables, adjustments, tax and fee lines, deductible, owner-retained treatment, rule, offer date and recourse outcome.
- **Every total loss decision** with repair, salvage and value, and the title brand with the state rule.
- **Every salvage assignment** with charges, sale, fees and the recovery posted.
- **Inspection and estimate timings** against California's 3 and 6 business day rules where they apply.

## What This Means for the System You Build

- **Attach estimates, valuations and salvage to the exposure,** versioned, with documents as sent.
- **Compute total loss settlements with taxes, transfer fees and registration fees** by state, and deduct salvage only as the state allows.
- **Keep comparables and adjustments itemized** with identifiers, and open a 35-day recourse task on every offer.
- **Separate the insurer's total loss decision from the title brand,** and encode each state's title rule.
- **Record shop choice and parts types,** with the disclosures given.
- **Track title paperwork and salvage as dated steps** and post proceeds as recoveries.

## References

**Law and regulation**

- [10 CCR 2695.8](https://www.law.cornell.edu/regulations/california/10-CCR-2695.8), California's auto claim standards: comparables, adjustments, taxes and fees, owner-retained salvage, valuation methods, the 35-day reopening, shop choice and distance, inspection timing, estimates, non-OEM parts, betterment and labor, and towing and storage; history through 2017 and 2021
- [Fla. Stat. 319.30](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399/0319/Sections/0319.30.html), total loss definition, 72-hour title duties, salvage certificates after 30 days and certificates of destruction; last amended by ch. 2026-56
- [Tex. Transp. Code 501.091](https://texas.public.law/statutes/tex._transp._code_section_501.091), actual cash value, damage, salvage motor vehicle and nonrepairable motor vehicle

**NAIC**

- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902) (PDF)](https://content.naic.org/sites/default/files/model-law-902.pdf), Section 8: total loss replacement and cash settlement methods, statistically valid sources, the 35-day right of recourse, itemized deductions, third-party steering, travel distance, estimates, betterment, storage and towing, and replacement crash parts

**Filings**

- [CCC Intelligent Solutions: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1818201/000119312526067448/ccc-20251231.htm), estimating, total loss valuation and fee calculator, direct repair programs, subrogation, casualty, and network scale
- [Copart: Form 10-K for the year ended July 31, 2026](https://www.sec.gov/Archives/edgar/data/900075/000119312526405731/cprt-20260731.htm), the total loss decision, pickup, advance charges, title processing and timing, auctions, seller fees, the insurer share of volume, competitors and seller tools

**Vendor documentation**

- [Snapsheet](https://www.snapsheetclaims.com/), virtual vehicle appraisal and total loss settlement
- [Hi Marley](https://www.himarley.com/), Total Loss Assist on its SMS platform
