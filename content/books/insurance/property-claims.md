+++
title = "Property Claims"
description = "Property claims: estimating, replacement cost vs ACV with a worked roof claim, matching, appraisal, public adjusters, Florida's AOB ban, mortgagees."
category = "Insurance Industry"
order = 2733
part = "Claims"
tags = ["insurance", "claims", "property-insurance", "homeowners", "appraisal", "public-adjusters"]
+++

A property claim is a construction project with a contract attached. The adjuster measures the damage, prices every line of the repair from a regional price list, applies the policy's valuation terms (replacement cost, actual cash value, or one until the work is done and the other after), subtracts a deductible that may be a percentage of the dwelling limit, and writes a check that names the mortgagee. The policyholder may hire a public adjuster who takes a percentage, a contractor may want the benefits assigned to them, a water mitigation company is running dryers before anyone agrees on scope, and if the two sides disagree on the amount the policy's appraisal clause lets a panel of three decide it. After a hurricane, a wildfire or a hailstorm, thousands of these claims open in a week, which is why property claim law has catastrophe provisions and why Florida rewrote much of it between 2019 and 2023.

This chapter covers estimating, replacement cost and actual cash value with a worked roof claim, matching, the appraisal clause with numbers, public adjusters and their fee caps, assignment of benefits and Florida's ban, mitigation vendors, and mortgagee interests. Catastrophe operations and event coding are in Catastrophe Events; homeowners forms and coverages A through F are in Homeowners & Renters; Florida's claim clocks are in [Claim Handling Law & Clocks](/books/insurance/claim-handling-law#the-state-rules).

## How the Platforms Do It

As of November 2026, from filings and vendor sites:

| Platform | Role in the property claim |
| --- | --- |
| **Verisk (Xactimate)** | Property estimating: a patented sketch program that calculates material and labor quantities from the drawing, price lists for 468 economic areas in North America built from market surveys and claim data, revised monthly and as often as weekly after major disasters, about 22,000 unit-cost line items, plus virtual adjusting (video, remote measurement, AI damage assessment). Verisk's FY2025 10-K credits property estimating and anti-fraud for its claims revenue growth |
| **Duck Creek Claims** | Core claims with catastrophe volumes it markets at 60,000+ claims a day |
| **Snapsheet, Five Sigma** | Cloud claims systems with workflow and AI agents, used by carriers, MGAs and TPAs for property and other lines |
| **Hi Marley** | SMS claim conversations, including conversational FNOL |

Verisk says its building and repair pricing data is commonly used by insurance repair contractors, so the insurer's adjuster, an independent adjuster, a public adjuster and a contractor often price the same loss from the same price data, which makes disputes line-item disputes: the quantity of roofing squares, whether a line is "remove and replace" or "repair," the overhead and profit percentage, the price list date.

## Estimating

A property estimate is a sketch plus a priced list: each room or roof facet measured, each operation (tear off, haul away, felt, shingles, drip edge, drywall, paint) as a line with a quantity, a unit price from the price list for the loss location and date, tax, and typically contractor overhead and profit when the repair needs a general contractor. Depreciation is applied per line for actual cash value. The estimate is a document the policyholder is owed: Florida requires the insurer to send a copy of any detailed estimate within 7 days after its adjuster generates it, and, when it pays less than a detailed estimate, to explain the difference in writing (Fla. Stat. 627.70131(3)(e), (7)(a)). Model 902 requires the insurer, on request, to provide the claim file worksheets detailing depreciation.

For the system the estimate is versioned data, not a PDF: the vendor estimate identifier, the price list (area and month), totals by trade, recoverable and non-recoverable depreciation, overhead and profit, and the coverage each line belongs to (dwelling, other structures, contents), because the limits, deductibles and payees differ by coverage.

## Replacement Cost and Actual Cash Value

Most homeowners policies pay **replacement cost** on the dwelling: the cost to repair or replace without deduction for depreciation, up to the limit. Most pay it in two steps: **actual cash value** (replacement cost less depreciation) first, and the withheld depreciation (the "holdback" or recoverable depreciation) once the repair or replacement is done. The rules:

- **ACV is replacement cost less depreciation.** Model 902 defines it that way for residential fire and extended coverage, with a copy of the depreciation worksheets on request. California's statute is the most specific: for a partial or total loss to a structure or contents, ACV is the cost to repair, rebuild or replace less "a fair and reasonable deduction for physical depreciation based upon its condition at the time of the injury," and depreciation applies only to "components of a structure that are normally subject to repair and replacement during the useful life of that structure" (Cal. Ins. Code 2051).
- **Time to collect the holdback.** California gives the insured no less than 12 months from the first ACV payment to collect the full replacement cost, 36 months for a loss in a state of emergency, with six-month extensions for good cause (permit delays, material shortages, contractor unavailability), and bars requiring proof of loss sooner than 100 days after a state-of-emergency loss; an insured who rebuilds or buys elsewhere after a total loss still collects replacement cost up to what rebuilding at the original site would have cost, without a deduction for the new land's value (Cal. Ins. Code 2051.5; policy forms issued or renewed from July 1, 2026 must comply with the whole section).
- **Consequential damage and betterment.** On replacement cost policies, Model 902 includes in the loss any consequential physical damage from making the repair, and the insured doesn't pay for betterment, only the deductible.

### Matching

When replacement items don't match the undamaged ones, how far the repair extends is a rule. Model 902: where replaced items "do not match in quality, color or size, the insurer shall replace all items in the area so as to conform to a reasonably uniform appearance," interior and exterior. Florida's statute says the insurer "shall make reasonable repairs or replacement of items in adjoining areas," weighing the cost of repairing the undamaged portion, the uniformity that results and its remaining useful life (Fla. Stat. 626.9744). A hail claim on one slope of a roof whose shingles are discontinued is the classic case: matching rules can turn a $6,000 repair into a full roof.

### Worked Numbers: A Hurricane Roof Claim

Mine. A Florida home with a $400,000 Coverage A limit and a 2% hurricane deductible ($8,000). Wind removes shingles across the roof; water damages a bedroom ceiling. The roof is 12 years old with an assumed 25-year life for the shingle system; the interior line items carry $900 of depreciation.

| Item | Replacement cost | Depreciation | Actual cash value |
| --- | --- | --- | --- |
| Roof replacement (matching requires the full roof) | $28,000 | 12 / 25 = 48%: $13,440 | $14,560 |
| Interior: ceiling drywall, insulation, paint | $6,000 | $900 | $5,100 |
| **Total** | **$34,000** | **$14,340** | **$19,660** |

| Payment | Calculation | Amount | Payees |
| --- | --- | --- | --- |
| First (ACV) payment | 19,660 − 8,000 deductible | **$11,660** | Insured and mortgagee (dwelling) |
| Holdback, on proof of completed repair | Recoverable depreciation | **$14,340** | Insured and mortgagee, or contractor as the insured directs |
| Total paid if repaired | 34,000 − 8,000 | $26,000 | |

If the insured never repairs, the claim ends at $11,660. The deductible applies once to the hurricane loss across coverages, not per line. The payment notice for the first check carries Florida's 12-point bold uppercase statement that the claim is still under evaluation, and the ACV payment falls under Florida's 60-day pay-or-deny clock ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law#the-rules-at-a-glance)). Additional living expense, if the bedroom were uninhabitable, would be paid to the insured alone (Mortgagee Interests, below).

## Appraisal

When the insured and insurer agree there is a covered loss but not on its amount, the appraisal clause resolves it without a lawsuit. The California standard form fire policy, whose text is set out in the Insurance Code, shows the clause most homeowners policies echo: if the two fail to agree on actual cash value or the amount of loss, on the written request of either, "each shall select a competent and disinterested appraiser and notify the other of the appraiser selected within 20 days of the request"; the appraisers first select a competent and disinterested umpire, and if they fail for 15 days to agree, a judge of a court of record in the state where the property is selects one; "an award in writing, so itemized, of any two when filed with this company shall determine the amount of actual cash value and loss" (Cal. Ins. Code 2071). The same policy makes the loss payable 60 days after proof of loss and ascertainment by written agreement or by the filing of an award, requires a sworn proof of loss within 60 days after the loss unless the insurer extends it, and bars suit unless commenced within 12 months after inception of the loss (24 months for a state of emergency loss). Appraisal decides the amount of loss, not whether the loss is covered.

### Worked Numbers: An Appraisal Award

Mine, continuing the roof claim (at replacement cost before deductible). The insured's appraiser values the loss at $41,000 (adding a second layer tear-off and higher overhead and profit); the insurer's at $34,000. They agree on an umpire on day 9, so no court is needed. The umpire agrees with the insurer's appraiser on the roof quantities and with the insured's on overhead and profit, and the two sign an itemized award of **$37,500**. The insurer owes 37,500 − 8,000 = $29,500 on a replacement cost basis, less what it already paid: if the ACV payment of $11,660 and no holdback had been paid, and the award's depreciation is itemized at $15,400, the new ACV is 37,500 − 15,400 − 8,000 = $14,100, so a supplemental ACV payment of $2,440 is due within the policy's 60 days of the award, with the holdback ($15,400) on completion.

What the system records: the written demand and its date, each appraiser and their disclosure of independence, the umpire selection date (or the court order), the itemized award, which two signed it, and the payment computed from it.

## Public Adjusters

A **public adjuster** is a licensed adjuster the policyholder hires, usually for a percentage of the recovery, to prepare and negotiate the claim. States regulate the contract and the fee more tightly after catastrophes:

| State | Fee rule | Other rules |
| --- | --- | --- |
| **Florida, Stat. 626.854** (latest amendment ch. 2026-174) | 10% of claim payments for claims under a Governor's state of emergency, during the year after the declaration; 20% otherwise and for reopened or supplemental claims; 1% if the insurer pays or commits in writing to pay the full limit of a coverage part within 14 days after the loss or 10 days after the contract, whichever is later; nothing on payments made or agreed before the contract | Rescission within 10 days of signing (30 days after the loss or 10 days after signing, whichever is longer, for emergencies), and without penalty if no written estimate arrives within 60 days; solicitation only Monday to Saturday, 8 a.m. to 8 p.m. for residential claims; the adjuster must ensure prompt notice of the claim to the insurer, give the insurer the contract, make the property available for inspection and let the insurer interview the insured |
| **Texas, Ins. Code 4102.104** | Total commission may not exceed 10% of the settlement; none on a percentage basis if the insurer pays or commits to pay the limit within 72 hours after the loss is reported | Anyone paying proceeds must name the insured as a payee and get the insured's endorsement; the public adjuster may not endorse a check for the insured, even with authorization |

Mine: on the roof claim above, if the policyholder signed a public adjuster contract a week after the hurricane (so the emergency cap applies) and the insurer had already paid $11,660 before the contract, the fee base is only the later payments: on a $2,440 supplemental payment and a $15,400 holdback, the cap is 10% × 17,840 = **$1,784**. The system needs the contract date, the declaration date and the payment dates to compute it, and the payment can't be issued without the insured as a payee in Texas.

For the claim file, a public adjuster is a party role with a representation contract: date signed, rescission deadline, fee percentage and cap rule, and the effect on communications (Florida's acknowledgment rules treat represented claimants differently, Fla. Stat. 627.70131(1)(c)).

## Assignment of Benefits and Florida's Ban

An **assignment of benefits (AOB)** transfers the policyholder's right to be paid under the policy, for a particular loss, to a contractor, typically a water mitigation or roofing company, which then deals with (and often sues) the insurer directly. Florida first regulated and then banned it. For residential and commercial property policies issued from July 1, 2019 through December 31, 2022, an AOB had to be written, include a written, itemized, per-unit cost estimate, be rescindable without penalty within 14 days after signing (later if work hadn't begun), cap emergency services at the greater of $3,000 or 1% of the Coverage A limit, and the assignee had to serve a presuit notice at least 10 business days before suing, with an itemized invoice or estimate. For policies issued on or after January 1, 2023, "a policyholder may not assign, in whole or in part, any post-loss insurance benefit," and any attempt is "void, invalid, and unenforceable" (Fla. Stat. 627.7152(13), from ch. 2022-271, Senate Bill 2-A).

So the system's rule depends on the policy's issue date: a contractor's AOB on a policy renewed in December 2022 may be valid under the 2019 rules and their notice and cap requirements; the same document on a policy renewed in January 2023 is void, and the contractor is paid, if at all, as a payee the insured directs, not as an owner of the claim. Storing the policy term's issue or renewal date on the claim makes the check mechanical.

## Mitigation Vendors

Policies require the insured to protect the property from further damage, and the first vendor on a water loss is usually a mitigation company: extraction, drying, removal of wet materials, antimicrobial treatment, with moisture readings and equipment logs as its documentation. The industry's reference is the ANSI/IICRC S500 standard for professional water damage restoration (5th edition, 2021, under revision as of November 2026), which covers drying principles, equipment, safety, documentation and inspections. Insurers manage mitigation through vendor programs with pricing agreements, or pay the insured's chosen vendor on a reasonable-and-necessary basis; either way the mitigation invoice is its own line on the dwelling exposure, often the first payment, and in Florida before 2023 it was the most common AOB.

## Mortgagee Interests

A mortgage lender named on the policy has its own rights under the mortgage clause. In the California standard fire policy, a designated mortgagee's interest can be cancelled only with 10 days' written notice to it, and if the insured fails to render proof of loss, the mortgagee, upon notice, renders it within 60 days and is bound by the appraisal, payment and suit provisions (Cal. Ins. Code 2071). In practice the mortgagee is a joint payee on dwelling payments, which protects the collateral and slows repairs, because the homeowner must get the lender (or its servicer's loss draft department) to endorse. States limit it to the dwelling: Florida requires contents, additional living expense and other items not subject to a recorded security interest to be paid to the policyholder alone (Fla. Stat. 627.70121). Payee derivation and multi-payee checks are in [Exposures, Reserves & Payments](/books/insurance/reserves-and-payments#paying-claimants-and-vendors); the mortgage servicer's side, including escrow and force-placed coverage, is in [Mortgage Servicing](/books/banking-and-lending/mortgage-servicing#force-placed-insurance).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `exposures`, `party_roles` (mortgagee, public adjuster, contractor), `claim_payments` and `claim_tasks`. This chapter adds `property_estimates`, `appraisals` and `representation_contracts`.

```sql
CREATE TABLE property_estimates (          -- each estimate, by whoever wrote it
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  version            INT NOT NULL,
  author_role        TEXT NOT NULL CHECK (author_role IN ('insurer_adjuster',
                       'independent_adjuster', 'public_adjuster', 'contractor', 'appraisal_award')),
  vendor_ref         TEXT,                  -- the estimating platform's id
  price_list         TEXT NOT NULL,         -- economic area and month
  lines              JSONB NOT NULL,        -- coverage, operation, qty, unit, price, dep, O&P
  rcv_by_coverage    JSONB NOT NULL,        -- {"cov_a": 3400000, "cov_c": 0}
  depreciation_recoverable BIGINT NOT NULL,
  depreciation_nonrecoverable BIGINT NOT NULL DEFAULT 0,
  overhead_profit    BIGINT NOT NULL DEFAULT 0,
  generated_at       TIMESTAMPTZ NOT NULL,
  sent_to_insured_at TIMESTAMPTZ,           -- FL: within 7 days of generation
  document_id        UUID NOT NULL,
  UNIQUE (claim_id, version)
);

CREATE TABLE appraisals (                  -- the policy's appraisal clause, invoked
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  demanded_by        TEXT NOT NULL CHECK (demanded_by IN ('insured', 'insurer')),
  demanded_at        TIMESTAMPTZ NOT NULL,
  insured_appraiser_party_id UUID REFERENCES parties (id),
  insurer_appraiser_party_id UUID REFERENCES parties (id),
  appraisers_named_by TIMESTAMPTZ NOT NULL, -- demand + 20 days on the standard form
  umpire_party_id    UUID REFERENCES parties (id),
  umpire_selected_by TEXT CHECK (umpire_selected_by IN ('appraisers', 'court')),
  award_estimate_id  UUID REFERENCES property_estimates (id),
  award_amount       BIGINT,
  award_signed_by    TEXT[],                -- any two of 'insured_appraiser',
                                            -- 'insurer_appraiser', 'umpire'
  award_filed_at     TIMESTAMPTZ,
  clause_ref         TEXT NOT NULL          -- form and edition, or 'Cal. Ins. Code 2071'
);

CREATE TABLE representation_contracts (    -- public adjusters, attorneys, assignees
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  party_role_id      UUID NOT NULL REFERENCES party_roles (id),
  kind               TEXT NOT NULL CHECK (kind IN ('public_adjuster', 'attorney',
                       'assignment_of_benefits', 'contractor_direction')),
  signed_at          TIMESTAMPTZ NOT NULL,
  rescission_until   TIMESTAMPTZ,           -- FL 10 or 30 days; AOB 14 days
  fee_pct_bp         INT,                   -- in basis points
  fee_cap_rule       TEXT,                  -- 'Fla. Stat. 626.854(11)(b)', 'Tex. Ins. Code 4102.104'
  emergency_declared_at DATE,               -- for the 10% year
  policy_issued_on   DATE,                  -- FL AOB: void if on or after 2023-01-01
  valid              BOOLEAN NOT NULL,      -- computed from the rules at signing
  validity_reason    TEXT,
  document_id        UUID NOT NULL
);
```

A public adjuster's fee cap for a payment is computed, not entered: the payment date against the contract date and the emergency declaration's anniversary picks the percentage, payments made before the contract are excluded, and a payment that would breach Texas's endorsement rule is refused. An AOB on a Florida policy is validated on receipt against `policy_issued_on`, and an invalid one becomes a task to tell the contractor and the insured, not a payee change.

Design choices:

- **Estimates are line data with their price list,** so appraisal and public adjuster disputes are diffs between versions.
- **Holdbacks are tracked as recoverable depreciation per coverage,** with the deadline to collect (California's 12 or 36 months) as a task.
- **Representation changes who is contacted and who is paid,** and the rules that follow from it are computed from the contract record.
- **Mortgagee payees come from the policy version as of the loss date,** limited by coverage where state law says so.

## Auditing

- **Every estimate** as generated and as sent, with the send date against Florida's 7 days and the written explanation when payment is below it.
- **Every appraisal** with the demand, appointments, umpire selection, award, signers and resulting payment.
- **Every representation contract** with its rescission window, fee rule and computed fee, and every AOB's validity decision with the policy date.
- **Every ACV and holdback payment** by coverage, with depreciation basis and payees.
- **Matching decisions** with the rule applied and the items extended.

## What This Means for the System You Build

- **Store estimates as versioned line items** with price list, coverage and depreciation per line.
- **Pay ACV, then recoverable depreciation,** with a task for the state's collection window.
- **Encode matching rules by state** and record how far each repair was extended.
- **Run appraisal as a dated workflow** that ends in an itemized award and a computed payment.
- **Compute public adjuster fee caps from contract, declaration and payment dates,** and enforce payee rules.
- **Validate Florida AOBs against the policy issue date** and treat post-2022 assignments as void.
- **Derive mortgagee payees from the policy and limit them by coverage.**

## References

**Law and regulation**

- [Cal. Ins. Code 2051 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-2051/), actual cash value as repair or replacement cost less a fair and reasonable deduction for physical depreciation, limited to components normally repaired or replaced
- [Cal. Ins. Code 2051.5 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-2051-5/), replacement cost without depreciation, 12 and 36 months to collect, extensions, proof of loss after a state of emergency, rebuilding elsewhere, and the July 1, 2026 form compliance date
- [Cal. Ins. Code 2071 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-2071/), the standard form fire policy: appraisal, mortgagee interests, when loss is payable, proof of loss and suit limits
- [Fla. Stat. 626.854](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.854.html), public adjuster fee caps, rescission, estimates, solicitation hours and duties to the insurer; latest amendment ch. 2026-174
- [Fla. Stat. 626.9744](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.9744.html), matching in adjoining areas
- [Fla. Stat. 627.70121](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70121.html), contents and living expense payable to the policyholder alone
- [Fla. Stat. 627.70131](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html), estimate copies within 7 days, explanations of payments below an estimate, and represented claimants
- [Fla. Stat. 627.7152](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.7152.html), assignment of benefits rules for 2019-2022 policies and the ban for policies issued on or after January 1, 2023
- [Tex. Ins. Code 4102.104](https://texas.public.law/statutes/tex._ins._code_section_4102.104), the 10% public adjuster commission cap, the 72-hour exception and payee and endorsement rules

**NAIC**

- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902) (PDF)](https://content.naic.org/sites/default/files/model-law-902.pdf), Section 9: consequential damage, betterment and matching on replacement cost policies, and actual cash value with depreciation worksheets

**Standards**

- [IICRC: ANSI/IICRC S500](https://iicrc.org/s500/), the water damage restoration standard, its 2021 edition and revision status

**Filings**

- [Verisk: 2025 Annual Report and Form 10-K (PDF)](https://www.sec.gov/Archives/edgar/data/1442145/000119312526141402/d859327dars.pdf), property estimating: sketching, 468 economic areas, monthly and post-disaster price revisions, about 22,000 line items, virtual adjusting and claims revenue growth

**Vendor documentation**

- [Duck Creek: Claims](https://www.duckcreek.com/products/claims/), catastrophe-day claim volumes
- [Snapsheet](https://www.snapsheetclaims.com/) and [Five Sigma](http://fivesigma.ai/), cloud claims platforms for carriers, MGAs and TPAs
- [Hi Marley](https://www.himarley.com/), conversational FNOL
