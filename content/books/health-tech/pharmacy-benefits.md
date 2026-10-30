+++
title = "Pharmacy Benefits & PBMs"
description = "How drug benefits work: PBMs, formularies, rebates and spread pricing, NCPDP claims, real-time benefit checks, copay accumulators and cash pharmacies."
category = "Health Tech Industry"
order = 1953
part = "Payers"
tags = ["health-tech", "payers", "pbm", "pharmacy", "formulary", "ncpdp", "data-model"]
+++

A prescription is paid differently from every other kind of care. When a patient hands a prescription to a pharmacy, the pharmacy system sends a claim to a pharmacy benefit manager in real time, the PBM adjudicates it in about a second against the patient's plan, formulary and accumulators, and the pharmacist sees what to collect before the bag is handed over. The payer that bears the cost (an employer, an insurer, a Part D plan) has usually hired the PBM to build the pharmacy network, negotiate rebates with manufacturers, write the formulary and process those claims, and the largest PBMs are owned by the largest insurers. The money in the middle (what the plan pays the PBM, what the PBM pays the pharmacy, what the manufacturer rebates to the PBM, what the patient pays at the counter) is the most scrutinized pricing in US health care.

This chapter covers the parties, formularies and utilization management for drugs, the money (rebates, spread pricing, pass-through), NCPDP claims and the standards timeline, real-time benefit checks at the point of prescribing, copay assistance and accumulators, Medicare Part D's redesign, and cash-price channels. Prescribing itself (NCPDP SCRIPT, Surescripts routing, EPCS, PDMPs) is [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing) in Care Delivery; electronic prior authorization for drugs from the prescriber's side is [Pharmacy ePA](/books/health-tech/prior-authorization#pharmacy-epa); manufacturer copay cards and hub services are [Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial). It extends `medication_requests` and `coverages` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from FTC reports, filings and company pages:

| Company | Kind | What the public record says |
| --- | --- | --- |
| **CVS Caremark** (CVS Health), **Express Scripts** (Cigna), **Optum Rx** (UnitedHealth Group) | The three largest PBMs, each owned by an insurer | Handled nearly 80% of roughly 6.6 billion prescriptions dispensed by US pharmacies in 2023; their affiliated pharmacies account for nearly 70% of specialty drug revenue (FTC, July 2024) |
| **Navitus** | Pass-through PBM | "All savings from manufacturer rebates and discounts are passed directly to clients" |
| **Capital Rx** | PBM on its own platform | Judi, "a cloud-native enterprise health platform that unifies PBM operations"; "No hidden admin costs or rebate fees" |
| **Surescripts** | Network between prescribers, pharmacies and PBMs | Real-Time Prescription Benefit: 1 billion responses delivered to prescribers in 2025, with up to five covered alternatives |
| **GoodRx** | Discount card and pricing platform | Paid by PBMs a percentage or fixed fee when its codes are used; consumers use it "outside of any medication or other health benefits"; "nearly every retail pharmacy in the United States" |
| **Mark Cuban Cost Plus Drug Company** | Cash pharmacy | Sells at a published cost-plus price outside insurance; its pricing pages blocked automated reading for this chapter |

Three patterns:

- **The PBM is a payer inside the payer.** It adjudicates claims, keeps accumulators, writes the formulary, contracts the pharmacy network and negotiates with manufacturers, all on the plan's behalf. A medical plan with a combined deductible exchanges accumulator files with its PBM daily ([Accumulators](/books/health-tech/payer-operations#accumulators)).
- **Vertical integration is the market structure.** The FTC describes the largest PBMs as "vertically integrated with the nation's largest health insurers" and with specialty and retail pharmacies, and found the Big 3's affiliated pharmacies marked up numerous specialty generics by "hundreds and thousands of percent," earning more than $7.3 billion above estimated acquisition costs from 2017 through 2022 (FTC, January 2025).
- **Price shown, price paid and price netted differ.** A drug has a list price, a pharmacy reimbursement, a member cost-share and a net cost after rebates, and each party sees a different subset. Software that shows a patient "your cost" must say which price it means.

## The Parties and the Money

- **Plan sponsor.** The employer, insurer, Part D sponsor or Medicaid program paying for drugs.
- **PBM.** Contracts with the sponsor; builds the network, formulary, utilization management and claims processing; negotiates rebates.
- **Pharmacies.** Retail chains, independents, mail order and specialty pharmacies (often PBM-owned), reimbursed by the PBM per claim: an ingredient cost (from a benchmark such as a discount off average wholesale price, or a maximum allowable cost list for generics) plus a dispensing fee, less the member's cost-share.
- **Manufacturers.** Pay rebates to the PBM for formulary position, and sometimes fund copay assistance directly to patients.
- **Wholesalers.** Sell drugs to pharmacies; not part of the claim.

Two contracting models define the money flow between sponsor and PBM:

- **Spread pricing.** The PBM charges the plan one price for a claim and pays the pharmacy a lower one, keeping the difference as revenue.
- **Pass-through.** The PBM charges the plan exactly what it pays the pharmacy and passes rebates through, earning an administrative fee instead; Navitus and Capital Rx market variants of this.

**Rebates.** A manufacturer pays the PBM a percentage of list price for each unit dispensed, conditioned on formulary placement (preferred tier, exclusion of a competitor). The rebate arrives months after the claim, so a member's coinsurance, computed on the pre-rebate price at the counter, can exceed what the plan ultimately pays net. The FTC's insulin case attacks exactly this: on September 20, 2024 it filed an administrative complaint against Caremark, Express Scripts and Optum Rx and their rebate aggregators (Zinc, Ascent, Emisar), alleging a "perverse drug rebate system" that inflated insulin list prices, kept lower-priced insulins off formularies and shifted costs to patients. <!-- source-gap: ftc-insulin-case-status | status | status of the FTC administrative case against Caremark, Express Scripts and Optum Rx (settlements, stays, hearing) as of October 2026 | closes with: the FTC case page or a 2025-2026 FTC press release on the matter, opened | checked: 2026-10-29 -->

## Formularies and Drug Utilization Management

A formulary is the list of covered drugs, usually in tiers (preferred generic, generic, preferred brand, non-preferred brand, specialty) with a cost-share per tier, plus utilization management on specific drugs:

- **Prior authorization:** the plan must approve before it pays (the prescriber's side is [Pharmacy ePA](/books/health-tech/prior-authorization#pharmacy-epa), carried by NCPDP SCRIPT ePA transactions).
- **Step therapy:** a cheaper drug must be tried first.
- **Quantity limits:** a maximum quantity per fill or period.
- **Exclusions:** not covered at all, with an exception process.

**Medicare Part D sets the floor for one market.** A Part D sponsor's pharmacy and therapeutics committee must have a majority of practicing physicians and/or pharmacists, include an independent physician and pharmacist "free of conflict," include experts in care of elderly or disabled people, and base decisions on "the strength of scientific evidence and standards of practice." Each category and class must include at least two drugs that are not therapeutically equivalent, and a temporary supply must be available within the first 90 days of a new plan for new enrollees on non-formulary drugs, with written notice within 3 business days of the temporary fill (42 CFR 423.120(b)). The statute names six categories of clinical concern, the so-called protected classes, that plans must cover: anticonvulsants, antidepressants, antineoplastics, antipsychotics, antiretrovirals and immunosuppressants for treatment of transplant rejection (42 U.S.C. 1395w-104(b)(3)(G)(iv)).

Formularies change during the year (new generics, safety issues, rebate renegotiations), so a formulary is versioned data, and every claim and every benefit check records the formulary version that answered it.

## Pharmacy Claims and the NCPDP Standards

Pharmacy claims use NCPDP's Telecommunication Standard, the HIPAA standard for retail pharmacy claims, eligibility and related transactions, sent in real time from the pharmacy system through a switch to the PBM. Each claim identifies the patient (BIN, PCN and group on the card route it to the right PBM and plan), the drug by NDC, quantity and days' supply, the prescriber's NPI and the pharmacy's NPI, and returns paid, rejected (with reject codes, such as a prior authorization required or a refill too soon), or reversed. The NCPDP specifications themselves are licensed by NCPDP; this chapter describes their role, not their fields.

The standards are changing on a long federal timeline. As of October 2026:

| Standard | Rule | Dates |
| --- | --- | --- |
| **Telecommunication Version F6** (replacing D.0) and **Batch Version 15** (replacing 1.2), plus the Medicaid pharmacy subrogation standard | HHS final rule December 13, 2024; dates realigned by a final rule of August 21, 2025 | May use from August 14, 2027; must use only F6 and Version 15 from April 14, 2028 |
| **SCRIPT 2023011** (e-prescribing, medication history, ePA) | Part D and ONC final rule, June 17, 2024 | Either 2017071 or 2023011 through December 31, 2027; 2023011 only from January 1, 2028 |
| **Formulary and Benefit version 60** | Same rule | F&B 3.0 or version 60 until January 1, 2027; version 60 only from then |
| **Real-Time Prescription Benefit version 13** | Same rule | Part D sponsors' prescriber real-time benefit tools must comply by January 1, 2027 |

A platform that touches pharmacy claims (a pharmacy system, a PBM, a switch, a discount card processor) runs dual versions for the overlap window and keys the version to each trading partner, exactly as an X12 migration would.

## Real-Time Benefit Checks

A real-time benefit check answers, at the moment of prescribing, what this patient will pay for this drug at this pharmacy under their plan, whether it needs prior authorization, and what covered alternatives cost. The NCPDP RTPB standard "enables real-time exchange of a patient's eligibility, product coverage (including restrictions and alternatives), and estimated cost sharing," including alternative pharmacies and products, and has no fields for negotiated prices (the 2024 Part D rule). Part D sponsors must offer a prescriber real-time benefit tool, on RTPB version 13 by January 1, 2027.

In practice the check runs from the EHR's prescribing screen through Surescripts or a PBM's own interface. Surescripts describes patient-specific pricing and coverage, prior authorization flags and "up to five covered alternatives," and reports 1 billion responses to prescribers in 2025. For software:

- **It is an estimate with a timestamp.** The answer reflects accumulators and formulary at that moment; a claim days later can differ. Show it as "estimated, as of" and store it with the prescription.
- **The cheaper alternative is a clinical decision.** The tool offers alternatives; the prescriber chooses. A system that substitutes automatically is practicing medicine.
- **Cash prices are a separate answer.** A discount card or cash pharmacy price can be lower than the insured cost-share, and a patient who pays cash outside the plan doesn't build accumulators unless the plan has a program to count it.

## Copay Assistance and Accumulators

Manufacturers fund copay cards (coupons) that pay most of a commercially insured patient's cost-share for a brand drug. Three rules shape them:

- **Not for federal programs.** The OIG's 2014 bulletin calls coupons "remuneration offered to consumers to induce the purchase of specific items," implicating the Anti-Kickback Statute when the drug is paid by a federal program "(including Medicare Part D)," so cards exclude federal program beneficiaries, and OIG urged making coupons "universally identifiable in pharmacy claims transactions." The manufacturer's side of this is [Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial).
- **Accumulator adjustment programs.** A plan or PBM can decide that manufacturer assistance does not count toward the member's deductible and out-of-pocket maximum. The card pays until its annual maximum runs out, and then the member faces the full deductible mid-year.
- **Maximizer programs.** A variant that spreads the manufacturer's maximum across the year and sets the member's cost-share to match it.

The federal rule on counting is unsettled. In *HIV and Hepatitis Policy Institute v. HHS* (D.D.C., decided September 29, 2023), the court set aside the 2021 rule language that allowed plans to exclude manufacturer assistance from the annual limit on cost-sharing; in the proposed 2026 Notice of Benefit and Payment Parameters (October 10, 2024) the Departments said they intend future rulemaking on "the applicability of drug manufacturer support to the annual limitation on cost sharing." Many states also require fully insured plans to count third-party payments; those laws don't reach self-funded ERISA plans. A PBM's accumulator logic therefore needs to identify assistance payments on the claim (secondary claims to a copay card processor) and apply a rule that depends on the plan's funding, state and the program the sponsor elected.

## Medicare Part D Since the Redesign

The Inflation Reduction Act rebuilt Part D cost-sharing around an annual out-of-pocket threshold. For 2026, Medicare.gov states that the initial coverage stage ends when covered Part D drug spending "reaches $2,100 in 2026," after which the member is in catastrophic coverage, and that no plan may have a deductible above $615 (the 2027 limit is $700). The Medicare Prescription Payment Plan lets members spread out-of-pocket costs across the year and, in Medicare's words, "doesn't save you money or lower your drug costs." For software: the out-of-pocket cap is an accumulator with a hard stop, payment-plan billing is a separate monthly bill from the plan rather than a pharmacy charge, and both sit on the same claim data. The IRA's Medicare drug price negotiation program, under which negotiated prices begin to apply to selected drugs, adds a further price a pharmacy must be made whole on; its mechanics are outside this chapter.

## Cash Pharmacy and Discount Cards

Two channels sell drugs outside the benefit:

- **Discount cards.** GoodRx's 10-K describes discounted prices as rates negotiated with PBM partners or direct pharmacy contracts, "free to access for consumers by saving a GoodRx code," with GoodRx paid by the PBM a percentage or fixed amount per use, and since 2023 an integrated program for some PBM partners where members use their existing benefit card and get the discount automatically. The card runs over the same pharmacy claims rails as insurance, with a different BIN and PCN.
- **Cost-plus pharmacies.** Cash pharmacies such as Mark Cuban Cost Plus sell at a published acquisition cost plus a stated markup and fees, often by mail. <!-- source-gap: cost-plus-pricing | missing | Cost Plus Drugs' published markup, pharmacy fee and shipping fee, and whether it bills insurance | closes with: costplusdrugs.com pricing or FAQ page readable without automation blocks (returned 403) | checked: 2026-10-29 -->

Both matter to a practice's software because the patient's cheapest option may be one the benefit check doesn't show, and to a plan because cash claims don't reach its accumulators.

## How to Build It

The core `medication_requests` (the prescription) and `coverages` (the member's coverage, with the pharmacy BIN, PCN and group as part of the card) are the inputs. The PBM side adds the formulary, its entries and pharmacy claims; a practice or EHR keeps the real-time benefit answers it showed:

```sql
CREATE TABLE formularies (               -- a versioned drug list a plan uses
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the PBM or plan
  name            TEXT NOT NULL,
  version         TEXT NOT NULL,
  valid_during    DATERANGE NOT NULL,
  cms_formulary_id TEXT,                  -- Part D: the formulary CMS approved
  UNIQUE (organization_id, name, version)
);

ALTER TABLE plans
  ADD COLUMN formulary_id   UUID REFERENCES formularies (id),
  ADD COLUMN rx_bin         CHAR(6),       -- routes a pharmacy claim to the processor
  ADD COLUMN rx_pcn         TEXT,
  ADD COLUMN rx_group       TEXT,
  ADD COLUMN pbm_org_id     UUID REFERENCES organizations (id);

CREATE TABLE formulary_entries (         -- one drug's status on one formulary version
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  formulary_id    UUID NOT NULL REFERENCES formularies (id),
  rxnorm_cui      TEXT NOT NULL,          -- the clinical drug; NDCs map to it
  tier            SMALLINT,               -- null: not covered
  status          TEXT NOT NULL CHECK (status IN ('covered', 'excluded', 'not_listed')),
  prior_auth      BOOLEAN NOT NULL DEFAULT FALSE,
  step_therapy    JSONB,                  -- the drugs to try first
  quantity_limit  JSONB,                  -- {"quantity": 30, "days": 30}
  protected_class TEXT,                   -- Part D category of clinical concern, if any
  UNIQUE (formulary_id, rxnorm_cui)
);

CREATE TABLE pharmacy_claims (           -- one NCPDP claim as adjudicated, append-only
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),  -- the PBM, or the pharmacy
  coverage_id        UUID REFERENCES coverages (id),   -- null: cash or discount card
  medication_request_id UUID REFERENCES medication_requests (id),
  standard_version   TEXT NOT NULL,       -- 'D.0' or 'F6' during the overlap
  transaction        TEXT NOT NULL CHECK (transaction IN ('billing', 'reversal', 'rebill',
                       'eligibility')),
  bin                CHAR(6) NOT NULL,
  pcn                TEXT,
  pharmacy_npi       CHAR(10) NOT NULL,
  prescriber_npi     CHAR(10),
  ndc                CHAR(11) NOT NULL,
  quantity           NUMERIC(10, 3) NOT NULL,
  days_supply        SMALLINT NOT NULL,
  date_of_service    DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('paid', 'rejected', 'reversed',
                       'captured')),
  reject_codes       TEXT[] NOT NULL DEFAULT '{}',
  ingredient_cost    BIGINT,              -- what the PBM pays the pharmacy, cents
  dispensing_fee     BIGINT,
  plan_cost          BIGINT,              -- what the PBM bills the plan; differs under spread pricing
  member_pay         BIGINT,
  assistance_amount  BIGINT,              -- copay card or other third-party payment, if known
  counts_toward_oop  BOOLEAN,             -- the accumulator decision for the assistance
  formulary_entry_id UUID REFERENCES formulary_entries (id),
  reversed_claim_id  UUID REFERENCES pharmacy_claims (id),
  adjudicated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE benefit_checks (            -- a real-time benefit answer shown to a prescriber
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id       UUID NOT NULL REFERENCES organizations (id),  -- the practice
  medication_request_id UUID NOT NULL REFERENCES medication_requests (id),
  coverage_id           UUID REFERENCES coverages (id),
  standard_version      TEXT NOT NULL,    -- 'RTPB 13'
  pharmacy_npi          CHAR(10),
  estimated_member_pay  BIGINT,
  prior_auth_required   BOOLEAN,
  alternatives          JSONB NOT NULL DEFAULT '[]',
  response_ref          TEXT NOT NULL,    -- the stored response
  checked_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **Three prices on every claim.** `ingredient_cost` plus `dispensing_fee` (to the pharmacy), `plan_cost` (to the sponsor) and `member_pay` are separate columns because spread pricing and pass-through audits compare them; rebates are a separate quarterly ledger keyed to claims.
- **Formularies are versions.** A claim and a benefit check point at the formulary entry that answered them, so a mid-year change doesn't rewrite history ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Assistance is explicit.** `assistance_amount` and `counts_toward_oop` make the accumulator decision visible per claim; the rule that decided it is the sponsor's elected program filtered by funding and state.
- **Versions per trading partner.** `standard_version` lets D.0 and F6 run side by side through 2027 and 2028.
- **Estimates stay estimates.** `benefit_checks` records what the prescriber saw and when; it never becomes the claim.

## Auditing

- **Claim history:** every billing, reversal and rebill with the formulary version, reject codes and amounts, so a pharmacy audit or a sponsor's PBM audit can rebuild payments and spreads.
- **Formulary decisions:** P&T committee minutes, the evidence cited, the version published and the date, and Part D transition fills with their notices.
- **Accumulator treatment of assistance:** per claim, the rule applied and the plan election behind it.
- **Benefit checks shown,** with the response, for disputes about the price a patient was told.

## What This Means for the System You Build

- **Treat the PBM as a payer** with its own claims, accumulators and formulary, exchanging accumulator data with the medical plan daily.
- **Store ingredient cost, dispensing fee, plan cost and member pay separately,** and keep rebates as their own ledger.
- **Version formularies and record the version on every claim and benefit check.**
- **Plan for the NCPDP F6, SCRIPT 2023011, F&B 60 and RTPB 13 dates** with per-partner versioning.
- **Show real-time benefit answers as timestamped estimates** with alternatives, and let the prescriber decide.
- **Make copay assistance and its accumulator treatment explicit** per claim, since federal and state rules differ by plan funding.
- **Model cash and discount-card fills** as claims outside the coverage, so the patient's real cost and the plan's accumulators can both be explained.

## References

**Regulations and rules**

- [42 CFR 423.120: Access to covered Part D drugs (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/423.120), P&T committee composition, two drugs per category and class, the 90-day transition supply and 3-business-day notice
- [42 U.S.C. 1395w-104 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/1395w-104), the six categories and classes of clinical concern
- [Federal Register: NCPDP retail pharmacy standards final rule (December 13, 2024)](https://www.federalregister.gov/documents/2024/12/13/2024-29138/administrative-simplification-modifications-of-health-insurance-portability-and-accountability-act), Telecommunication F6 and Batch 15 replacing D.0 and 1.2, Medicaid subrogation
- [Federal Register: NCPDP standards compliance dates update (August 21, 2025)](https://www.federalregister.gov/documents/2025/08/21/2025-15958/administrative-simplification-modifications-of-health-insurance-portability-and-accountability-act), may use from August 14, 2027, must use from April 14, 2028
- [Federal Register (govinfo): Part D health IT standards final rule (June 17, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-06-17/html/2024-12842.htm), SCRIPT 2023011, F&B 60 and RTPB 13 with their dates, what RTPB carries
- [Federal Register (govinfo): Proposed 2026 Notice of Benefit and Payment Parameters (October 10, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-10-10/html/2024-23103.htm), the HIV and Hepatitis Policy Institute decision and planned rulemaking on manufacturer support

**Agencies**

- [FTC: Interim staff report on prescription drug middlemen (July 9, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-releases-interim-staff-report-prescription-drug-middlemen), nearly 80% of 6.6 billion prescriptions, vertical integration, nearly 70% of specialty revenue
- [FTC: Second interim staff report (January 14, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-releases-second-interim-staff-report-prescription-drug-middlemen), specialty generic markups and $7.3 billion, 2017 to 2022
- [FTC: Sues prescription drug middlemen for inflating insulin prices (September 20, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-sues-prescription-drug-middlemen-artificially-inflating-insulin-drug-prices), the administrative complaint, defendants and theory
- [HHS OIG: Special Advisory Bulletin on pharmaceutical manufacturer copayment coupons (September 2014)](https://oig.hhs.gov/documents/special-advisory-bulletins/878/SAB_Copayment_Coupons.pdf), coupons as remuneration, federal program exclusion, identifying coupons in claims
- [Medicare.gov: Costs for Medicare drug coverage](https://www.medicare.gov/drug-coverage-part-d/costs-for-medicare-drug-coverage), the $2,100 2026 threshold, $615 and $700 deductible limits, the Medicare Prescription Payment Plan

**In practice**

- [Surescripts: Real-Time Prescription Benefit](https://surescripts.com/what-we-do/real-time-prescription-benefit), patient-specific pricing, prior authorization flags, five alternatives, 1 billion responses in 2025
- [GoodRx: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1809519/000180951926000031/gdrx-20251231.htm), PBM-paid prescription transactions revenue, use outside insurance, integrated savings, direct pharmacy contracts
- [Navitus](https://navitus.com/), rebates and discounts passed to clients
- [Capital Rx](https://www.cap-rx.com/), the Judi platform and its financial terms
