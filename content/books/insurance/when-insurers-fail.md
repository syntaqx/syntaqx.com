+++
title = "When Insurers Fail"
description = "Conservation, rehabilitation and liquidation, guaranty associations and their caps worked, what happens to policies and claims, Florida's failures, UDS."
category = "Insurance Industry"
order = 2712
part = "Regulation and Solvency"
tags = ["insurance", "solvency", "receivership", "guaranty-associations", "florida", "data-transfer"]
+++

When an insurer can no longer pay what it owes, there is no bankruptcy court and no federal deposit insurer. A domestic insurance company can't be a debtor under chapter 7 of the Bankruptcy Code, which also keeps it out of chapter 11 (11 U.S.C. 109(b)(2), (d)), so failing insurers are handled under state receivership law instead: the domiciliary commissioner petitions a state court, which appoints the commissioner (or a deputy) as receiver to conserve, rehabilitate or liquidate the company. On liquidation, two systems take over what the insurer used to do. The receiver (the liquidator) collects the estate's assets, including reinsurance, and pays creditors in a statutory priority order, years later and often at a fraction of the claim. The **guaranty associations**, one per line group in each state, pay policyholders' covered claims promptly, up to statutory caps, using assessments on the solvent insurers still writing in that state, and then stand in the policyholders' place against the estate.

For a system, an insolvency is a hard cutover of live policies and open claims to other organizations under fixed clocks: policies cancel 30 days after the liquidation order unless they expire or are replaced sooner, claims move to the guaranty associations of the claimants' states, and the data moves in a standard format. On the other side of the industry, every solvent insurer pays assessments and may recoup them from its own policyholders as a surcharge. This chapter covers the receivership stages and their triggers, what happens to policies and claims, the property-casualty and life guaranty systems and their caps (worked through on real claims), the priority of distribution, the Florida liquidations of 2019 to 2023 and the guaranty fund that absorbed them, and the Uniform Data Standard that carries the handoff. Bank deposit insurance, a different system with a federal fund and per-depositor limits, is in [Deposit Insurance](/books/banking-and-lending/deposit-insurance).

## How the Platforms Do It

The parties to an insolvency publish their mechanics, as of November 2026:

| Party | What it does | Scale, from its own publications |
| --- | --- | --- |
| **The receiver** (Florida's Division of Rehabilitation and Liquidation, for example) | Runs the estate: marshals assets, collects reinsurance, adjudicates creditor claims, makes distributions, transfers data | Twelve Florida insurers in liquidation as of November 2026, nine of them ordered into liquidation from 2019 to 2023 |
| **State P&C guaranty associations** (FIGA in Florida) | Pay covered claims and unearned premium refunds up to state caps, fund them by assessment | FIGA had received 47,596 claims from the seven Florida insolvencies of 2022 and 2023, with $1.67 billion of incurred losses, per its 2025 annual report |
| **NCIGF** | A nonprofit, member-funded association supporting the P&C guaranty funds of the 50 states, DC and Puerto Rico; coordinates multistate insolvencies and maintains the Uniform Data Standard; "does not pay claims" | |
| **NOLHGA and the state life and health associations** | Coordinate life, annuity and health insolvencies across states and pay covered benefits | More than $30.44 billion of coverage benefits since 1983, more than 100 multistate insolvencies, more than 3.2 million policyholders protected, per its July 2026 FAQ |

Two exclusions to keep in mind throughout. Policyholders of a **risk retention group** have no guaranty fund protection, and the Liability Risk Retention Act requires the policy to say so (15 U.S.C. 3902). Policyholders of a **surplus lines** insurer generally don't either, because guaranty associations cover admitted insurers' policies. Both are reasons the system must know which kind of insurer stands behind each policy ([The Insurance Business](/books/insurance/insurance-business#who-s-who)).

## The Stages

The NAIC's Insurer Receivership Model Act (#555, adopted 2005 and amended 2007, replacing the 1978 Insurers Rehabilitation and Liquidation Model Act) is the template; states' acts vary, but the stages are the same:

- **Grounds.** One petition can seek conservation, rehabilitation or liquidation, on any of 22 grounds in section 207, including that the insurer is impaired, insolvent or "about to become insolvent" (reasonably expected not to have "liquid assets to meet its next ninety (90) days' current obligations"), is in hazardous financial condition, has concealed or destroyed records, failed to file its annual statement, consents through its board, or has triggered regulatory control under the RBC law ([Solvency & Capital](/books/insurance/solvency-and-capital#the-action-levels) covers those levels). "Insolvency" means unable to pay obligations when due.
- **Supervision.** Before any court order, states with an administrative supervision law let the commissioner restrict what a troubled insurer may do (new business, transactions, payments) while it fixes the problem.<!-- source-gap: naic-admin-supervision | missing | NAIC administrative supervision model and which states have adopted it | closes with: the NAIC model PDF and its state page | checked: 2026-11-09 -->
- **Conservation** (sections 301-302). A short court-ordered holding action. Within 180 days the conservator must move for release, rehabilitation or liquidation; the court may grant one 180-day extension.
- **Rehabilitation** (sections 401-403). The receiver runs the company with the aim of restoring it or restructuring its obligations; a rehabilitation plan is due "within one year after the entry of the rehabilitation order." Policies stay in force, and the guaranty associations are not yet triggered.
- **Liquidation** (section 501). The liquidator takes title to the assets, and the estate's rights and liabilities "become fixed as of the date of entry of the order of liquidation." The petition should ask for a declaration of insolvency, because a finding of insolvency is what triggers the guaranty associations.

Rehabilitation can last years. PHL Variable Insurance Company, a Connecticut life insurer, was placed in rehabilitation on May 20, 2024 with a moratorium on surrenders and claims payments above set amounts; on December 31, 2025 the rehabilitator reported that a pure rehabilitation plan "is not feasible," and as of November 2026 no liquidation order had been entered. NOLHGA, whose member associations would cover its policyholders, says liquidation is "anticipated to occur sometime before year end 2027," and that guaranty coverage "generally begins when a court issues a liquidation order with a finding of insolvency." Until then the policyholders' only protection is the moratorium's allowances.

## What Happens to Policies and Open Claims

Under section 502 of Model #555, property-casualty policies of a liquidated insurer "shall continue in force ... until the earlier of":

1. 30 days from the entry of the liquidation order;
2. the policy's expiration date;
3. the date the insured replaces or terminates the policy;
4. the date the liquidator transfers the policy to another insurer; or
5. a cancellation date the court approves.

Reinsurance the insurer assumed is cancelled at the order, and life, health and annuity policies continue as the guaranty associations need. Texas uses the same rule in its statute ("the 30th day after the date of entry of the liquidation order," Tex. Ins. Code 443.152), and Florida's liquidation orders set cancellation at the order date plus 30 days.

Claims divide by when the loss happened:

| Claim | Who handles it | Covered? |
| --- | --- | --- |
| Loss before the order, still open | The guaranty association of the claimant's (or insured's) state, from data the receiver transfers | Up to the cap, less exclusions |
| Loss in the 30 days after the order (or until expiration or replacement) | The guaranty association | Same |
| Loss after the policy cancels | Nobody; the policy is gone | No |
| Unearned premium on cancelled policies | The guaranty association, as a covered claim | Up to the unearned premium cap |
| Amounts above the cap, excluded claims, other creditors | The estate, by filing a proof of claim with the receiver | In the priority order, at whatever percentage the estate pays |

For a policyholder, the operational consequence is a 30-day window to replace coverage, and for a mortgaged homeowner, a lender that will force-place coverage if they don't ([Property Tech's treatment of lapse](/books/property-tech/insurance-deposits-and-guarantees#master-and-force-placed-policies) covers that side for renters). For the replacement market, a liquidation is a surge of new business in a month.

## The P&C Guaranty System

The NAIC's Post-Assessment Property and Liability Insurance Guaranty Association Model Act (#540, adopted 1970 and amended in 2009 and at the 2023 Fall National Meeting) is the template for the state associations. "Post-assessment" is the key word: there is no standing fund; the association assesses its member insurers after an insolvency, in proportion to their net direct written premium in the state for the covered lines.

**What the model covers, and the caps:**

- Claims unpaid before the order and claims arising within 30 days after it (or before expiration or replacement, if sooner).
- Workers' compensation claims in full.
- Unearned premium "not exceeding $10,000 per policy."
- All other covered claims "not exceeding $500,000 per claimant," and cyber claims up to $500,000 per policy per insured event (added in 2023). The drafting note calls the caps "practical limitations, but each State will wish to evaluate these figures."
- An optional net worth exclusion: a "high net worth insured" (net worth over $50 million, or $25 million for first-party claims in one alternative) has no first-party coverage, and the association can recover third-party payments from it.

**What it excludes** (section 3): life, annuity, health and disability; mortgage and financial guaranty; fidelity and surety; credit, vendors' single interest and collateral protection; warranties and service contracts; title; ocean marine; and government insurance.

**How it's funded:** assessments capped at 2% of each member's prior-year net direct written premium in the state per year.

States set their own figures, and they differ from the model. **Florida's** (Fla. Stat. 631.57, as amended through 2022) caps covered claims at "less than $300,000," with "an additional $200,000 for the portion of a covered claim" for damage to structure and contents under a homeowner's policy; condominium and homeowners' association claims are limited to the lesser of policy limits or $200,000 times the number of residential units; FIGA isn't liable for penalties or interest. Its assessments are a regular assessment of up to 2% a year of in-state direct written premium, and an emergency assessment of up to 4% a year, available only for insurers "rendered insolvent by the effects of a hurricane." The assessments are treated as advances that insurers "may fully recoup" from their policyholders through a uniform surcharge, or since 2022 may elect not to recoup; nonpayment of the surcharge is treated as nonpayment of premium, so it can cancel a policy.

### Worked Numbers: A Florida Homeowners Claim Over the Cap

An illustration, my numbers. A Florida homeowner's house is damaged two weeks before their insurer's liquidation order. The adjusted claim under the policy: $520,000 for the dwelling, $50,000 for contents, $50,000 for additional living expense, $620,000 in all, with a $2,500 deductible already applied.

| Portion | Amount | FIGA pays | Left for the estate |
| --- | --- | --- | --- |
| Additional living expense (not structure or contents) | $50,000 | $50,000 from the general $300,000 | $0 |
| Structure and contents | $570,000 | $250,000 (rest of the general $300,000) + $200,000 (the homeowners' additional amount) = $450,000 | $120,000 |
| **Total** | **$620,000** | **$500,000** | **$120,000** |

(The statute's "less than $300,000" wording makes the general cap a dollar short of $300,000; the illustration rounds.) The homeowner gets $500,000 from FIGA on FIGA's timeline, and files a proof of claim with the receiver for the $120,000, which ranks with policy claims in the estate. Under the NAIC model's $500,000-per-claimant cap the result would be the same total, without the split by type of loss; in a state with a $300,000 cap and no homeowners' addition, the homeowner would carry $320,000 to the estate. Covered amounts are therefore a per-state rule with conditions on the type of loss, and the guaranty association's claim system computes them per claimant across all of a claimant's claims.

### Worked Numbers: An Assessment and Its Recoupment

FIGA levied a 1.0% emergency assessment by Office of Insurance Regulation order of April 10, 2023, after United Property & Casualty's liquidation, applied to policies written from October 1, 2023 until the bonds it backed are paid. For a solvent member insurer with $80 million of Florida net direct written premium in the assessable lines, the assessment is 1.0% × $80 million = $800,000. If it recoups, every policy it writes or renews in the period carries a 1.0% surcharge: a homeowners policy with a $3,400 premium adds $34.00. The insurer's billing system carries the surcharge as its own premium entry kind, with its own reporting (the core model's `premium_entries.kind = 'assessment'`), and remits or reconciles it against the assessment; when the order ends, the surcharge stops on new and renewal policies from the end date.

## Life and Annuity Guaranty Associations

The Life and Health Insurance Guaranty Association Model Act (#520, amended through 2017) gives the template caps, per life:

| Benefit | Model cap |
| --- | --- |
| Life insurance death benefit | $300,000 |
| Life insurance cash surrender or withdrawal value | $100,000 |
| Annuity benefits (present value) | $250,000 |
| Governmental retirement plan participants and structured settlement payees | $250,000 each |
| Disability income; long-term care | $300,000 each |
| Other health; health benefit plans | $100,000; $500,000 |
| Aggregate per life | $300,000 ($500,000 where health benefit plans are involved) |
| One owner of multiple policies, or unallocated contracts | $5,000,000 |

Unlike P&C policies, life, health and annuity policies don't cancel at 30 days: Model #555 keeps them in force as far as the guaranty associations need, so the associations can continue them or move them to a solvent insurer, because a 70-year-old can't replace a life policy in a month. The policyholder's benefit above the caps becomes a claim on the estate. An illustration: an owner with a $500,000 term policy and a $400,000 deferred annuity at a liquidated insurer is covered for $300,000 of death benefit, and the aggregate cap of $300,000 per life applies across both, so the annuity's $250,000 coverage doesn't stack on top; the excess of each is an estate claim. The exact caps are each state's, so the computation reads the claimant's state's rule row.

## The Priority of Distribution

The estate pays in classes, each paid in full before the next receives anything. Model #555's section 801 has 13:

| Class | Claims |
| --- | --- |
| 1 | Costs of administering the estate |
| 2 | Guaranty associations' administrative expenses (and, in one alternative, P&C loss adjustment expenses) |
| 3 | Policy claims, including unearned premium and the guaranty associations' claims for covered claims they paid |
| 4 | Mortgage and financial guaranty claims, warranties |
| 5 | The federal government |
| 6 | Employee wages earned in the prior year, up to the lesser of $5,000 or two months' salary |
| 7 | General unsecured creditors (including reinsurance obligations and bad faith or tort claims, which are excluded from class 3) |
| 8 | State and local governments |
| 9 | Penalties and punitive damages |
| 10 | Late-filed claims |
| 11 | Surplus notes |
| 12 | Interest |
| 13 | Shareholders |

Policyholders rank above general creditors, which is the point of the structure. A guaranty association that paid a claimant's covered claim takes the claimant's class 3 claim by subrogation and is paid with the other class 3 claims; the model's early access provisions let the receiver advance distributions to the associations before the estate closes, which is how FIGA's estate distributions arrive while claims are still being paid.

An illustration, my numbers: an estate collects $100 million (including reinsurance recoveries). Class 1 takes $8 million and class 2 $5 million, leaving $87 million against $250 million of allowed class 3 claims. Class 3 receives 87 / 250 = 34.8 cents on the dollar, and nothing reaches class 4 or below. The guaranty associations, holding most of the class 3 claims by subrogation, recover 34.8% of what they paid; the rest was the cost of the insolvency to the solvent insurers and, through recoupment, their policyholders. The homeowner in the earlier example recovers 34.8% × $120,000 = $41,760 of the amount over FIGA's cap.

## The Florida Liquidations

Florida's homeowners market produced the largest run of P&C insolvencies in recent years. The Florida Department of Financial Services' receivership pages list the orders, all from the Second Judicial Circuit in Leon County:

| Insurer | Liquidation order | Policies cancelled | Policies in force at the order |
| --- | --- | --- | --- |
| Florida Specialty Insurance Company | October 2, 2019 | November 1, 2019 | not stated |
| American Capital Assurance Corp. | April 14, 2021 | May 14, 2021 | about 2,300 |
| Gulfstream Property and Casualty | July 28, 2021 | August 27, 2021 | about 45,000 |
| St. Johns Insurance Company | February 25, 2022 | March 1, 2022 (policies moved to another insurer) | about 147,000 |
| Avatar Property & Casualty | March 14, 2022 | April 13, 2022 | not stated |
| Southern Fidelity Insurance Company | June 15, 2022 | July 15, 2022 | about 150,000 |
| Weston Property & Casualty | August 8, 2022 | September 7, 2022 | not stated |
| FedNat Insurance Company | September 27, 2022 | October 27, 2022 | about 13,000 (about 78,000 Florida policies had moved to another insurer before the order) |
| United Property & Casualty | February 27, 2023 | March 29, 2023 | about 146,260 in six states, 53,721 in Florida |

The cancellation dates are the 30-day rule in action: order date plus 30 days, except where the receiver transferred the book first (St. Johns) or the insurer had already moved most of it (FedNat). FIGA's 2025 annual report counts 47,596 claims received from the seven 2022 and 2023 insolvencies, with $1.67 billion of incurred losses; United Property & Casualty alone accounted for 25,019 claims and $769 million incurred by December 31, 2025, from 15,140 Florida claims open at the order. FIGA funded it from assessments, estate distributions and investment income ($331.3 million, $121.1 million and $27.5 million respectively as its 2025 report states them) and from $600 million of bonds issued in July 2023, $424 million of them outstanding at the end of 2025. Its assessments in the period:

| Assessment | Rate | OIR order | For |
| --- | --- | --- | --- |
| 2021 | 0.7% | October 11, 2021 | Insolvencies before 2022 |
| 2022A | 1.3% | March 11, 2022 | St. Johns |
| 2022B | 0.7% | August 26, 2022 | Southern Fidelity and Weston |
| 2023A | 1.0% (emergency) | April 10, 2023 | United Property & Casualty; policies from October 1, 2023 until the bonds are repaid |

FIGA levied no new assessments in 2024 or 2025. The reforms the legislature passed in response, and the growth and depopulation of Citizens, are in [Stressed & Residual Markets](/books/insurance/stressed-markets#florida).

## The Data Handoff: UDS

A liquidation has to move tens of thousands of open claims and unearned premium refunds from the failed insurer's systems into the guaranty associations' systems, across every state where it wrote business, within days. The **Uniform Data Standard (UDS)**, maintained by the NCIGF, is "a file format specification that allows receivers, liquidators, and guaranty associations to exchange" claims and financial data. Version 1 took effect April 1, 1995 and version 2.1 January 1, 2005; the P&C operations manual is in version 2.4 (April 2019 draft). Its record types:

| Record | Direction | Content |
| --- | --- | --- |
| **A** | Receiver to fund | Open loss claims |
| **B** | Receiver to fund | Unearned premium |
| **E** | Receiver to fund | Closed loss claims |
| **F** | Receiver to fund | Claim notes |
| **G** | Receiver to fund | Claim payment history |
| **I** | Both ways | Image file index (the claim file documents) |
| **M** | Both ways | Medicare Secondary Payer data |
| **C** | Fund to receiver | Loss and unearned premium payments the fund made |
| **D** | Fund to receiver | Quarterly financial report |

The manual's rules for identifiers are the ones any system should honor: UDS carries "the insolvent company policy and claim numbers, Receiver claim numbers, and the claim numbers assigned by the Fund," and "It is imperative that these numbers are maintained by the Funds exactly as transmitted by the Receiver," because they are how coverage is verified, reinsurance recoveries are tracked and aggregates are applied. The fund's C records back to the receiver are how the estate learns what was paid, so it can bill reinsurers and compute the associations' class 3 claims. The manual also notes that timely reporting lets receivers collect reinsurance sooner, which funds early access payments back to the associations.

The design consequence for an insurer's own systems is uncomfortable but real: the system should be able to produce UDS A, B and E records for its whole book at any time. An insurer that can't is one whose policyholders will wait longer if it fails, and a regulator taking over a troubled company asks for exactly that data first.

## How to Build It

Three sides need records: the insurer's own status (the core model's `insurers.status` already has `supervision`, `rehabilitation` and `liquidation`), the receivership and its transfers (for receivers, guaranty associations and their vendors), and assessments (for every solvent insurer):

```sql
CREATE TABLE receiverships (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  jurisdiction        TEXT NOT NULL REFERENCES jurisdictions (code),  -- domicile
  stage               TEXT NOT NULL CHECK (stage IN ('administrative_supervision',
                        'conservation', 'rehabilitation', 'liquidation', 'closed')),
  court               TEXT,                 -- 'Second Judicial Circuit, Leon County'
  case_number         TEXT,                 -- '2023 CA 000320'
  receiver_party_id   UUID REFERENCES parties (id),
  ordered_on          DATE NOT NULL,
  insolvency_found    BOOLEAN NOT NULL DEFAULT FALSE,  -- triggers guaranty coverage
  policies_cancel_on  DATE,                 -- order + 30 days unless the court sets otherwise
  claims_bar_date     DATE,                 -- deadline for proofs of claim
  supersedes_id       UUID REFERENCES receiverships (id)  -- rehabilitation then liquidation
);

CREATE TABLE guaranty_transfers (          -- UDS files between receiver and funds
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  receivership_id     UUID NOT NULL REFERENCES receiverships (id),
  association_party_id UUID NOT NULL REFERENCES parties (id),  -- FIGA, TPCIGA, ...
  record_type         TEXT NOT NULL CHECK (record_type IN ('A', 'B', 'C', 'D', 'E',
                        'F', 'G', 'I', 'M')),
  direction           TEXT NOT NULL CHECK (direction IN ('receiver_to_fund',
                        'fund_to_receiver')),
  uds_version         TEXT NOT NULL,        -- '2.1'
  period              DATERANGE,            -- for C and D records
  record_count        INT NOT NULL,
  file_document_id    UUID NOT NULL,        -- documents: the file as sent
  sent_at             TIMESTAMPTZ NOT NULL,
  acknowledged_at     TIMESTAMPTZ,
  exceptions          INT NOT NULL DEFAULT 0
);

CREATE TABLE guaranty_claim_links (        -- the three numbers UDS keeps together
  claim_id            UUID NOT NULL REFERENCES claims (id),  -- insolvent company claim
  receivership_id     UUID NOT NULL REFERENCES receiverships (id),
  receiver_claim_number TEXT,
  association_party_id UUID NOT NULL REFERENCES parties (id),
  fund_claim_number   TEXT,
  covered_cap         BIGINT,               -- from the claimant state's rule row
  paid_by_fund        BIGINT NOT NULL DEFAULT 0,
  excess_to_estate    BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (claim_id, association_party_id)
);

CREATE TABLE guaranty_assessments (        -- a solvent insurer's side
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  association_party_id UUID NOT NULL REFERENCES parties (id),
  jurisdiction        TEXT NOT NULL REFERENCES jurisdictions (code),
  order_ref           TEXT NOT NULL,        -- 'OIR order 2023-04-10, 2023A'
  rate_bp             INT NOT NULL,         -- 100 = 1.0%
  base_premium        BIGINT NOT NULL,      -- net direct written premium assessed
  amount              BIGINT NOT NULL,
  recoup              BOOLEAN NOT NULL,     -- Florida lets insurers elect not to
  surcharge_applies   DATERANGE,            -- policies effective in this range
  paid_on             DATE
);
```

The liquidation cutover is a scheduled job over the core tables: on the order date, every in-force policy gets a cancellation transaction effective on `policies_cancel_on` (or its expiration, if sooner), with the unearned premium computed for the B records; every open exposure is mapped to the guaranty association of its claimant's state and written to an A record; closed claims go as E records with payment history (G) and notes (F); the claim file documents are indexed for the I records. The receiver's own system then tracks proofs of claim by class and distributions per class over the life of the estate, and posts each association's C records against its subrogated claims.

## Auditing

- **Every receivership order** with its stage, court, case number, insolvency finding and policy cancellation date, and every change of stage.
- **Every UDS file sent and received,** with record counts, version, acknowledgments and exceptions, and the three claim numbers linked on every claim.
- **Covered amounts per claimant** with the state rule applied, what the fund paid and what went to the estate.
- **Proofs of claim by priority class** and every distribution, including early access payments.
- **For solvent insurers, every assessment and its recoupment:** the order, the base premium, the surcharge rate and the policies it applied to, reconciled to amounts remitted.

## What This Means for the System You Build

- **Record which insurer, and which kind of insurer, stands behind every policy,** because guaranty coverage depends on it (none for risk retention groups or surplus lines).
- **Be able to produce UDS A, B and E records for the whole book on demand;** a regulator taking control will ask for them first.
- **Keep the insolvent company's, the receiver's and the fund's claim numbers together,** exactly as transmitted.
- **Compute guaranty coverage per claimant from the claimant state's rule row,** with the conditions on type of loss Florida-style caps carry.
- **Model assessments and recoupment surcharges as premium entries of their own kind,** with the order and the policy date range they apply to.
- **Schedule the 30-day policy cutover as transactions,** never as a bulk status change, so unearned premium and coverage end dates are computed per policy.

## References

**Law and regulation**

- [Fla. Stat. 631.57](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0631/Sections/0631.57.html), FIGA's $300,000 cap plus $200,000 for homeowners' structure and contents, condominium limits, the 2% regular and 4% emergency assessments, and recoupment by surcharge or election not to recoup
- [Fla. Stat. 631.54](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0631/Sections/0631.54.html), definitions of covered claims, including unearned premium
- [11 USC 109](https://www.law.cornell.edu/uscode/text/11/109), domestic insurance companies excluded from chapter 7 and so from chapter 11
- [Tex. Ins. Code 443.152](https://texas.public.law/statutes/tex._ins._code_section_443.152), policies continuing until the 30th day after the liquidation order
- [15 USC 3902](https://www.law.cornell.edu/uscode/text/15/3902), the notice that risk retention group policyholders have no guaranty fund protection

**NAIC**

- [NAIC: Insurer Receivership Model Act (#555, PDF)](https://content.naic.org/sites/default/files/model-law-555.pdf), the grounds, conservation, rehabilitation and liquidation, continuation of coverage for 30 days, and the 13 priority classes and early access
- [NAIC: Post-Assessment Property and Liability Insurance Guaranty Association Model Act (#540, PDF)](https://content.naic.org/sites/default/files/model-law-540.pdf), the coverage window, the $10,000 unearned premium and $500,000 claim caps, the cyber cap, the net worth exclusion, the 2% assessment cap and excluded lines
- [NAIC: Life and Health Insurance Guaranty Association Model Act (#520, PDF)](https://content.naic.org/sites/default/files/model-law-520.pdf), the per-life caps for death benefits, cash values, annuities, health and the aggregates
- [NAIC: UDS B Record overview, version 2.1 (PDF)](https://content.naic.org/sites/default/files/inline-files/committees_e_ritf_uds_B_record_overview.pdf), the unearned premium record from receiver to fund

**Regulators and guidance**

- [Florida Department of Financial Services: Companies in receivership](https://www.myfloridacfo.com/division/receiver/companies), the insurers in liquidation and the detail pages with order dates, case numbers, cancellation dates and policy counts
- [Connecticut Insurance Department: PHL Variable stakeholder page](https://portal.ct.gov/cid/phlstakeholder), the May 20, 2024 rehabilitation, the moratorium and the rehabilitator's reports

**Standards**

- [NCIGF: Uniform Data Standard](https://www.ncigf.org/uds), UDS as the file format for receivers, liquidators and guaranty associations
- [NCIGF: UDS Operations Manual, P&C, version 2.4 draft, April 2019 (PDF)](https://www.ncigf.org/assets/docs/8-UDS-Manual.pdf), the record types and directions, version dates, the three claim numbers and maintaining them as transmitted, and early access through timely reporting

**In practice**

- [NCIGF: About](https://www.ncigf.org/about), a nonprofit member-funded association supporting the P&C guaranty funds of the 50 states, DC and Puerto Rico
- [FIGA: 2025 Annual Report (PDF)](https://figafacts.com/wp-content/uploads/2026/07/2025-FIGA-ANNUAL-REPORT_FINAL.pdf), claims and incurred losses from the 2022 and 2023 insolvencies, United Property & Casualty figures, funding sources, the 2023 bonds and the limits it administers
- [FIGA: 2023 Annual Report (PDF)](https://figafacts.com/wp-content/uploads/2024/03/2023-FIGA-ANNUAL-REPORT.pdf), the 2021 to 2023 assessments and their OIR orders, and that the NCIGF does not pay claims
- [NOLHGA: PHL Variable FAQs, updated July 15, 2026 (PDF)](https://www.nolhga.com/wp-content/uploads/PHL-FAQs-7.15.26.pdf), $30.44 billion of benefits since 1983, more than 100 multistate insolvencies, 3.2 million policyholders, when coverage begins, and the anticipated liquidation timing
