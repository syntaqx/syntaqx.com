+++
title = "Consumer Reports & Third-Party Data"
nav_title = "Consumer Reports"
description = "MVRs, CLUE and loss history, prefill, insurance scores and property data; the FCRA for insurers, adverse action after Safeco v. Burr, and permissible purpose."
category = "Insurance Industry"
order = 2721
part = "Rating and Underwriting"
tags = ["insurance", "fcra", "consumer-reports", "adverse-action", "mvr", "clue", "underwriting-data"]
+++

A personal lines quote is mostly other people's data. The applicant types a name, an address and a date of birth; the insurer's system then pulls the household's drivers and vehicles from a prefill service, each driver's motor vehicle record from the state, seven years of auto or property claims from an industry exchange, a credit-based insurance score from a credit bureau's data, and for a home, the roof age, construction and hazard scores from property data vendors. Most of these are consumer reports under the Fair Credit Reporting Act, which makes the insurer a user of consumer reports with three duties: have a permissible purpose for each pull, give an adverse action notice when a report contributed to a worse outcome, and handle disputes and re-rating. State insurance scoring laws add more on top for credit. And a motor vehicle record comes from a state DMV under a different federal statute, the Driver's Privacy Protection Act.

The Supreme Court's 2007 decision in Safeco v. Burr settled the question that matters most to a rating engine: a first-time rate can be an adverse action, measured against the rate the applicant would have gotten without the credit score. That turns adverse action from an underwriting event into a rating computation, run on every quote. This chapter covers the data sources, the FCRA as it applies to insurers, adverse action after Safeco, and vendor contracts and permissible purpose. Whether a source may be used at all in a state is [What You May Rate On](/books/insurance/rating-factors-and-limits); the FCRA's lending side, which owns the generic machinery, is in [Adverse Action Notices](/books/banking-and-lending/adverse-action#what-the-fcra-adds) and [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores#permissible-purpose).

## How the Platforms Do It

Data vendors insurers order from, as of November 2026, from their public pages and the CFPB's list:

| Vendor or source | Product | What it returns | FCRA status |
| --- | --- | --- | --- |
| **State DMVs (often through resellers)** | Motor vehicle record (MVR) | Violations, convictions, suspensions and license status per driver | Released under the DPPA's insurer exception; a consumer report when assembled and sold by a CRA |
| **LexisNexis Risk Solutions** | C.L.U.E. Auto | Up to seven years of personal auto claims; the vendor says 99.6% of the auto industry contributes claims activity; ordered at new business, renewal and when a driver is added; an "Active Insights C.L.U.E. at Renewal" product pushes claims another insurer contributed after underwriting | Consumer report |
| **LexisNexis Risk Solutions** | C.L.U.E. Property | Date of loss, cause of loss and amounts paid, from claims data the vendor says over 90% of homeowners insurers provide | Consumer report |
| **LexisNexis Risk Solutions** | Data Prefill | Drivers, vehicles and property attributes from a few data points ("Verify data, don't collect it") | Depends on content and use |
| **Verisk** | A-PLUS loss history (property and auto) | Claims history reports; consumer disclosures handled by Verisk's A-PLUS Consumer Inquiry Center | Consumer report |
| **Credit bureaus and score vendors** | Credit-based insurance scores | A score and reason codes built from credit report data | Consumer report |
| **Telematics data holders** | Arity, LexisNexis Telematics OnDemand, Connected Analytic Services (CAS) and others on the CFPB's list | Driving behavior from apps or connected cars | Listed by the CFPB as consumer reporting companies with free reports |

The CFPB's list of consumer reporting companies (page modified October 29, 2026; list current as of January 2025) groups the insurance specialty agencies under personal property insurance (LexisNexis C.L.U.E. and Telematics OnDemand, Insurance Information Exchange (iiX), Arity, Drivers History, A-PLUS Property, CAS) and the life and disability underwriting ones under medical (MIB, Milliman IntelliScript), each with a free report.

## The Sources

### Motor Vehicle Records

An MVR is the state's record of a driver's license status, violations and convictions. States release personal information from motor vehicle records only under the Driver's Privacy Protection Act's exceptions, one of which is "for use by any insurer or insurance support organization, or by a self-insured entity, or its agents, employees, or contractors, in connection with claims investigation activities, antifraud activities, rating or underwriting" (18 U.S.C. 2721(b)(6)). Insurers order MVRs directly from states or through resellers, at new business, when a driver is added and at selected renewals, and the content feeds driving record rating (North Carolina's Safe Driver Insurance Plan, for example, assigns points from convictions and at-fault accidents) and underwriting eligibility. MVRs cost money per pull, which is why the ordering rule (every driver at new business, a sample or a trigger at renewal) is itself a product setting.

### Loss History Exchanges

C.L.U.E. and A-PLUS are contributory databases: insurers report their claims and query everyone's. A loss history report on an auto applicant shows prior claims across carriers, with dates, types and amounts; on a home, it shows claims at the property and by the applicant, which is why a home buyer can inherit a property's water claims. LexisNexis's C.L.U.E. Auto page cites its own 2024 data that 23.4% of added drivers had claims activity in the past three years. Two system consequences: a claim the insurer pays must be reported back to the exchange (contribution is the price of access), and a claim on the report is a fact with a date and an amount the underwriting rules can test, not free text.

### Prefill and Property Data

Prefill fills the application from a name and address: household drivers, vehicles by VIN, the home's year built, square footage and construction. Property data adds characteristics and hazard scores (wildfire, wind, flood, distance to fire station). Prefilled data is either confirmed by the applicant or used as is; the difference matters, because an application answer the applicant gave is a representation they can be held to, and a value the vendor supplied is not. My rule: **store every prefilled field with its source and whether the applicant confirmed or changed it**, so rating can use the confirmed value and a misrepresentation review later can show what the applicant actually said.

### Credit-Based Insurance Scores

An insurance score is ordered from a bureau or a scoring vendor with the applicant's identity and returns a score and reason codes. Where the state allows it ([What You May Rate On](/books/insurance/rating-factors-and-limits)), the NCOIL model's rules shape the order and its use: a disclosure at application that the insurer may obtain credit information; a report or score no older than 90 days for adverse action at new business or renewal; neutral treatment, or an approved alternative, when there is no hit; refresh at least every 36 months; re-rate on request at annual renewal; and the dispute and extraordinary life circumstance rules below.

## The FCRA for Insurers

The statute's insurance provisions, each from the current US Code:

- **Permissible purpose.** A consumer reporting agency may furnish a report to a person it has reason to believe "intends to use the information in connection with the underwriting of insurance involving the consumer" (15 U.S.C. 1681b(a)(3)(C)). Underwriting covers new business, renewal and re-rating. A claims or fraud use is a different purpose that needs its own basis (for MVRs, the DPPA's claims and antifraud exceptions), and marketing reaches consumer report data only through prescreening.
- **Prescreened offers.** A CRA may furnish lists for a transaction the consumer didn't initiate only if it is a "firm offer of credit or insurance," the CRA runs an opt-out system and the consumer hasn't opted out (1681b(c)); the recipient gets name and address and criteria-based information, not the consumer's accounts. Opting out through the CRAs' notification system lasts five years from five business days after notice; opting out with a signed election form lasts until revoked (1681b(e)). A prescreened insurance offer must say that report information was used, that the consumer met the criteria, that the offer may not be extended if they no longer do, and how to opt out (1681m(d)).
- **Adverse action defined for insurance.** "A denial or cancellation of, an increase in any charge for, or a reduction or other adverse or unfavorable change in the terms of coverage or amount of, any insurance, existing or applied for, in connection with the underwriting of insurance" (1681a(k)(1)(B)(i)).
- **The notice.** A person taking adverse action based in whole or in part on a consumer report must give notice of the action; disclose the numerical score used (with its range, up to four key factors, the date and the source) where a credit score was used; give the CRA's name, address and toll-free number with a statement that the CRA didn't make the decision; and tell the consumer of the right to a free report within 60 days and to dispute its accuracy (1681m(a)).
- **The CRA's side.** CRAs must require users to identify themselves, certify their purposes and use the report for nothing else, and must verify new users (1681e(a)); they must follow reasonable procedures for maximum possible accuracy (1681e(b)) and notify users of their obligations (1681e(d)).
- **Specialty agencies.** Insurance claims history is one of five categories of "nationwide specialty consumer reporting agency" (1681a(x)), which owe consumers free annual file disclosures; the CFPB's list marks the insurance agencies with free reports.

## Adverse Action After Safeco v. Burr

Safeco Insurance Co. of America v. Burr, 551 U.S. 47 (decided June 4, 2007, with GEICO General Insurance Co. v. Edo), answered three questions:

1. **An initial rate can be an adverse action.** The "increase in any charge for" language reaches a first-time rate; an applicant can be adversely affected by a quote they never had a previous price for.
2. **The baseline is the neutral-score rate.** For an initial rate, the comparison is "the rate that the applicant would have received had the company not taken his credit score into account." Notice is owed only if the credit score made the rate worse than that, i.e. if the report was a necessary cause of the higher rate.
3. **Willful includes reckless.** Willful violations, which carry statutory and punitive damages, include reckless disregard of the notice duty, judged objectively; Safeco's reading of the statute, though wrong, was not objectively unreasonable, so it was not reckless, and GEICO, on the facts, had not violated the statute.

The baseline makes adverse action a rating computation. A worked example, mine: the North Carolina-style policy from [How a Rate Is Built](/books/insurance/how-a-rate-is-built) rates at $1,444 before any insurance score. In a state and product that use a score as a multiplicative tier factor, the applicant's score maps to 1.10 and a neutral score (as the insurer defines it, per the NCOIL model) maps to 1.00. The quoted premium is $1,444 × 1.10 = $1,588.40, the neutral-score premium is $1,444.00, and because the quoted rate is higher than the neutral one, the credit report was a necessary cause of an increase: an adverse action notice is owed, with the score, its range, the key factors and the bureau's contact details, plus under the NCOIL model up to four factors in "sufficiently clear and specific language" ("poor credit history" does not comply). Had the score mapped to 0.92, the premium would be $1,328.48, below the neutral rate, and no credit-based notice would be owed for that quote. The same comparison runs for any report-driven factor: a loss history surcharge from a C.L.U.E. report or a violation surcharge from an MVR is an adverse action based on a consumer report, and the notice names that CRA.

Notice duties also attach to underwriting and renewal outcomes: a decline, a placement in a costlier company or tier, a cancellation or nonrenewal, or a renewal increase driven by a refreshed report. A state notice may also apply alongside the federal one; Maryland, for instance, requires disclosure at application that credit is used and, on request, a quote that "separately identifies the portion of the premium attributable to the applicant's credit history."

## Disputes, Re-Rating and Exceptions

- **Disputes.** If a consumer disputes a report with the CRA and the reinvestigation shows the information was incorrect, the NCOIL model requires the insurer to "re-underwrite and re-rate the consumer within 30 days of receiving the notice" and refund any overpayment back to the shorter of the last twelve months or the actual policy period.
- **Re-rating on request.** At annual renewal, on the consumer's or agent's request, the insurer re-underwrites and re-rates on a current report or score, at most once in twelve months, with exceptions such as an insured already in the best tier.
- **Extraordinary life circumstances.** On written request, reasonable exceptions to rates, classifications, tier placement or underwriting rules for the listed events (a declared catastrophe, serious illness or injury, death of a spouse, child or parent, divorce or interrupted support, identity theft, involuntary job loss of three months or more, overseas deployment); the insurer may require documentation and a request within 60 days of application or renewal, and tells the consumer the outcome within 30 days of sufficient documentation.
- **Scoring model filings.** The model requires insurers to file their scoring models with the department, treated as trade secrets, and bars CRAs from selling "trigger lists" built from insurance inquiries.

## Vendor Contracts and Permissible Purpose

A data vendor agreement for consumer reports has the same bones everywhere: the insurer certifies its permissible purposes per product (underwriting, claims, fraud), agrees to use reports only for them, agrees to the vendor's security and audit terms, and in a contributory database, agrees to contribute its own data on the vendor's schedule and format. For a system:

- **Every order carries a purpose** chosen from the contract's certified list, recorded on the order, and enforced before the call (a claims user can't order an underwriting MVR).
- **Every order is tied to a consumer and a transaction:** a quote, a renewal, a driver add, a claim. Orders without one are an audit finding.
- **Reports are stored as received,** with the vendor's reference number, so a dispute or an examiner request can reproduce exactly what was used.
- **Retention follows the contract and the state.** Some vendor terms restrict reuse of a report for a later quote; the 90-day freshness rule in the NCOIL model limits reuse for adverse action anyway.
- **Agents and comparative raters order on the insurer's behalf** and inherit its permissible purpose; the order record names who ordered it ([Comparative Raters & Agency Systems](/books/insurance/comparative-raters-and-agency-systems)).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `parties`, `quotes` ([Quote, Bind & Issue](/books/insurance/quote-bind-and-issue)) and `notices` ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal)). This chapter adds `consumer_report_orders`, the reports and the facts extracted from them, and `adverse_actions`, the decision that a notice is owed and the notice's content.

```sql
CREATE TABLE consumer_report_orders (      -- every pull, with its purpose and subject
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  vendor             TEXT NOT NULL,         -- 'lexisnexis', 'verisk', 'state_dmv_tx', ...
  product            TEXT NOT NULL,         -- 'mvr', 'clue_auto', 'clue_property', 'a_plus',
                                            -- 'insurance_score', 'prefill', 'telematics'
  is_consumer_report BOOLEAN NOT NULL,
  permissible_purpose TEXT NOT NULL CHECK (permissible_purpose IN ('underwriting',
                       'claims', 'antifraud', 'prescreen', 'consumer_requested')),
  legal_basis        TEXT NOT NULL,         -- '15 USC 1681b(a)(3)(C)', '18 USC 2721(b)(6)'
  subject_type       TEXT NOT NULL CHECK (subject_type IN ('quote', 'policy_transaction',
                       'renewal', 'claim')),
  subject_id         UUID NOT NULL,
  ordered_by         UUID NOT NULL,         -- user, agent or system actor
  ordered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status             TEXT NOT NULL CHECK (status IN ('ordered', 'returned', 'no_hit',
                       'error')),
  vendor_reference   TEXT,
  report_ref         TEXT,                  -- encrypted blob as received
  report_date        DATE,                  -- for the 90-day freshness rule
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE report_facts (                -- what rating and underwriting actually read
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id           UUID NOT NULL REFERENCES consumer_report_orders (id),
  kind               TEXT NOT NULL,         -- 'violation', 'claim', 'score', 'vehicle', 'roof_age'
  occurred_on        DATE,
  attributes         JSONB NOT NULL,        -- violation code, claim amount, score and reasons
  disputed           BOOLEAN NOT NULL DEFAULT FALSE,
  superseded_by      UUID REFERENCES report_facts (id)  -- a corrected fact after a dispute
);

CREATE TABLE adverse_actions (             -- the decision that a notice is owed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  subject_type       TEXT NOT NULL,         -- 'quote', 'policy_transaction', 'renewal'
  subject_id         UUID NOT NULL,
  action             TEXT NOT NULL CHECK (action IN ('higher_initial_rate', 'decline',
                       'higher_tier_or_company', 'renewal_increase', 'cancellation',
                       'nonrenewal', 'coverage_reduction')),
  order_ids          UUID[] NOT NULL,       -- the reports that were a necessary cause
  premium_actual     BIGINT,
  premium_neutral    BIGINT,                -- Safeco baseline: without the score or report
  score_disclosure   JSONB,                 -- score, range, key factors, date, source
  reasons            TEXT[] NOT NULL,       -- up to four, clear and specific
  state_rule_refs    TEXT[] NOT NULL DEFAULT '{}',  -- state scoring law notices also owed
  notice_id          UUID,                  -- notices (Cancellation, Nonrenewal & Notice Law)
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_exception_requests (   -- extraordinary life circumstances, disputes, re-rates
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  policy_id          UUID REFERENCES policies (id),
  kind               TEXT NOT NULL CHECK (kind IN ('extraordinary_life_circumstance',
                       'dispute_correction', 'rerate_request')),
  reason             TEXT,                  -- 'identity_theft', 'job_loss', ...
  received_at        TIMESTAMPTZ NOT NULL,
  documentation_complete_at TIMESTAMPTZ,
  respond_by         TIMESTAMPTZ,           -- 30 days after documentation or dispute notice
  outcome            TEXT CHECK (outcome IN ('granted', 'denied', 'rerated', 'no_change')),
  refund_amount      BIGINT,
  decided_at         TIMESTAMPTZ
);
```

The adverse action test runs inside rating: the engine rates twice when a consumer report fact affects a factor, once with the fact and once with the neutral treatment, and writes `adverse_actions` if the actual premium is higher. Storing both premiums is what lets an examiner see that the test ran.

## Auditing

- **Every order has a purpose, a legal basis, a subject and an actor;** an order with no quote, transaction or claim behind it is a permissible purpose finding.
- **Every adverse action decision stores both premiums and the reports that caused it,** and links to the notice as sent with its delivery proof.
- **No notice is skipped silently:** a quote with a report-driven factor above neutral and no `adverse_actions` row is an exception report.
- **Disputes and exceptions meet their clocks** (30 days in the NCOIL model), with refunds computed and paid.
- **Contribution obligations are met:** claims are reported to the loss history exchanges on schedule, reconciled against the claims system.

## What This Means for the System You Build

- **Record a permissible purpose and a subject on every consumer report order,** and enforce the purpose before the call.
- **Run the Safeco comparison on every rating that uses a consumer report:** rate with and without, and owe a notice when the report raised the price.
- **Separate report storage from the facts rating reads,** so disputes supersede facts without rewriting reports.
- **Store prefill provenance** and whether the applicant confirmed it.
- **Implement the state credit rules as clocks and refunds,** not policies in a manual.
- **Link [Adverse Action Notices](/books/banking-and-lending/adverse-action) for the generic FCRA machinery** and keep only the insurance specifics here.

## References

**Law and regulation**

- [15 USC 1681a](https://www.law.cornell.edu/uscode/text/15/1681a), adverse action for insurance, firm offers of credit or insurance, and nationwide specialty consumer reporting agencies including insurance claims
- [15 USC 1681b](https://www.law.cornell.edu/uscode/text/15/1681b), the underwriting permissible purpose, prescreened firm offers and the five-year and permanent opt-outs
- [15 USC 1681e](https://www.law.cornell.edu/uscode/text/15/1681e), user identification and purpose certification, accuracy procedures and notices to users
- [15 USC 1681m](https://www.law.cornell.edu/uscode/text/15/1681m), adverse action notice contents, score disclosure, and prescreened offer disclosures
- [18 USC 2721](https://www.law.cornell.edu/uscode/text/18/2721), the Driver's Privacy Protection Act and its insurer exception for claims, antifraud, rating and underwriting
- [Md. Code, Ins. 27-501 (PDF)](https://mgaleg.maryland.gov/2025RS/Statute_Web/gin/27-501.pdf), disclosure of credit use and the separately identified credit portion of an auto premium

**Courts**

- [Safeco Ins. Co. of America v. Burr, 551 U.S. 47 (2007)](https://www.law.cornell.edu/supremecourt/text/06-84), initial rates as adverse actions, the neutral-score baseline, and willfulness including reckless disregard

**Regulators and guidance**

- [CFPB: List of consumer reporting companies](https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/), the personal property insurance and medical specialty agencies and their free reports (modified October 29, 2026)
- [North Carolina Department of Insurance: Safe Driver Incentive Plan](https://www.ncdoi.gov/consumers/auto-and-vehicle-insurance/safe-driver-incentive-plan), points from convictions and at-fault accidents

**Standards**

- [NCOIL: Model Act Regarding Use of Credit Information in Personal Insurance, readopted November 15, 2025 (PDF)](https://ncoil.org/wp-content/uploads/2026/02/NCOIL-Credit-Model-November-2025.pdf), disclosure, the 90-day rule, refresh and re-rating, dispute re-rating within 30 days, extraordinary life circumstances, adverse action reasons, model filing and trigger lists

**Vendor documentation**

- [LexisNexis: C.L.U.E. Auto](https://risk.lexisnexis.com/products/clue-auto), seven years of auto claims, industry contribution, renewal alerts and added-driver claims activity
- [LexisNexis: C.L.U.E. Property](https://risk.lexisnexis.com/products/clue-property), loss date, cause and amounts paid from homeowners insurers' contributions
- [LexisNexis: Data Prefill](https://risk.lexisnexis.com/insurance/data-prefill), driver, vehicle and property prefill from a few data points
- [Verisk: FCRA consumer disclosure](https://fcra.verisk.com/), the A-PLUS Consumer Inquiry Center for loss history reports
