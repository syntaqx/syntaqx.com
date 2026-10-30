+++
title = "The Revenue Cycle"
description = "How a practice gets paid: front, middle and back end, the X12 transaction family and operating rules, the KPIs, and in-house versus outsourced RCM."
category = "Health Tech Industry"
order = 1919
part = "Revenue Cycle"
tags = ["health-tech", "revenue-cycle", "rcm", "x12", "hipaa-transactions", "data-model"]
+++

A practice is paid for a visit months after the patient walks out, by several parties, in pieces. Before the visit someone checks that the patient's coverage is active and what it pays for; during it the clinician documents what was done; after it the services become coded charges, the charges become a claim to the payer, the claim is checked, sent, acknowledged, adjudicated and paid (or not), the payment arrives as a bank deposit with a separate electronic explanation of what it covers, the explanation is posted to the patient's ledger line by line, and whatever the payer left to the patient becomes a statement, a card charge, a payment plan or a write-off. That chain is the **revenue cycle**, and revenue cycle management (RCM) is the work and the software that keep it moving. For a hospital it is a department of hundreds; for a three-dentist office it is one person at the front desk and a clearinghouse login.

The software is hard for three reasons. The chain crosses organizations that don't share a database: the practice's system, a clearinghouse, the payer, the payer's bank and the practice's bank, connected by batch files and acknowledgments that arrive hours or weeks apart. The messages are federal standards (HIPAA adopted the X12 transaction set by regulation), so the formats are fixed, but every payer reads them a little differently, and the companion guides that say how run to dozens of pages each. And the money is never one number: a $180 charge becomes a $112 allowed amount, a $90 payment, a $22 patient balance and a $68 contractual write-off, and each piece has to land on the right line of the right ledger with a code saying why. This chapter is the map of the part: the stages, the transactions, the operating rules, the numbers practices are judged by, and the choice between running RCM in-house and outsourcing it. The chapters after it take each stage in depth, starting with [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits). The records it builds on (`charges`, `claims`, `claim_lines`, `remittances`, `remittance_lines`, `payments`, `ledger_entries`) are the volume's core records, from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

The revenue cycle is sold in layers: a practice management system (PMS) that holds charges and the ledger, a clearinghouse that moves the transactions, and, optionally, a service company that does the work. As of October 2026, from each vendor's own pages and filings:

| Vendor | What it is | What it publishes |
| --- | --- | --- |
| **Waystar** | RCM software and clearinghouse for providers (NASDAQ: WAY) | Its 2025 10-K: "over 7.5 billion healthcare payments transactions," "over $2.4 trillion in annual gross claims," "over 30,000 clients" and "over one million distinct providers"; revenue of $1.10 billion in 2025, up from $944 million in 2024 |
| **Availity** | Payer-provider network; Availity Essentials is its provider portal | Real-time eligibility, claims, claim status, remittance, prior authorization with attachments and appeals in one portal; a Coverages API for 270/271 |
| **Stedi** | API-first clearinghouse | Per-transaction list prices: eligibility from $0.30 down to $0.08 a check, claims from $0.30 to $0.10, 835 ERAs from $0.20 to $0.08 per adjudicated claim, 277CA acknowledgments free |
| **Claim.MD** | Clearinghouse for small practices and billing services | $120 a month for unlimited claims and ERAs plus 1,000 eligibility checks; $60 a month for 100 transactions; $30 a month plus per-use fees |
| **Office Ally** | Clearinghouse with a free tier | Service Center "Start for Free" with claims and ERAs included ("Transactional fees may apply"); eligibility $10 a month for the first 100 checks |
| **Vyne Dental (Trellis)** | Dental clearinghouse and attachments network | Batch and real-time eligibility with benefit breakdowns, "Unlimited electronic claims and attachments" |
| **DentalXChange** | Dental clearinghouse (ClaimConnect) | Real-time eligibility, benefits and claim status over 270/271 and 276/277, integrated with Denticon, Open Dental and other PMSs |

Three patterns:

- **The PMS owns the money; the clearinghouse owns the wire.** Every vendor above sits between a practice system that creates charges and posts payments, and payers that adjudicate. The practice's ledger is the system of record; the clearinghouse is a router with a status screen. Which side builds the claim file, runs the edits and parses the remittance varies by product, and that division is the main integration decision ([Clearinghouses](/books/health-tech/clearinghouses)).
- **Price follows the transaction.** Clearinghouses charge per claim, per eligibility check or per month for bundles; RCM service companies usually charge a share of what they collect. Both scale with volume, which is why a small practice's RCM cost is mostly people, not software.
- **Dental runs on its own rails.** Dental claims use their own X12 claim (837D), their own code set (CDT) and their own paper form, and dental clearinghouses (Vyne, DentalXChange) sell attachments as a core product because dental payers ask for X-rays and charts on so many claims.

## The Stages

RCM vendors divide the cycle into three stages, and each has its own staff, records and failure modes:

| Stage | When | Work | Records | What goes wrong |
| --- | --- | --- | --- | --- |
| **Front end** | Before and at the visit | Registration, insurance capture, eligibility and benefits, prior authorization, estimates, collecting copays and deposits | `patients`, `guarantors`, `coverages`, eligibility checks, authorizations, estimates | Wrong member ID, inactive coverage, missing authorization, a patient surprised by the bill |
| **Middle** | During and after the visit | Documentation, coding (CPT, HCPCS, CDT, ICD-10-CM), charge capture, charge review | `encounters`, `procedures`, `documents`, `charges` | Unbilled services, wrong codes, missing modifiers, documentation that doesn't support the code |
| **Back end** | After the claim | Claim build and scrubbing, submission, acknowledgments, follow-up, remittance and posting, denials and appeals, patient statements and collections | `claims`, `claim_lines`, `remittances`, `remittance_lines`, `payments`, `ledger_entries`, `patient_statements` | Rejections, denials, underpayments, unposted cash, aged balances |

Most back-end problems are front-end problems found late. A denial for "coverage terminated" was an eligibility check nobody ran; a denial for "authorization absent" (CARC 197, "Precertification/authorization/notification/pre-treatment absent," in X12's code list) was a prior authorization nobody requested. My rule for any RCM product: every denial reason maps back to the stage that could have prevented it, and the reports show that stage, so the front desk sees the denials it caused ([Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals)).

A single visit, end to end, for a patient with commercial insurance at a physical therapy clinic:

1. **Scheduling.** The patient books; the front desk records the plan and member ID from the card and runs an eligibility check ([Eligibility & Benefits](/books/health-tech/eligibility-and-benefits)). The plan requires authorization after the twelfth visit, so the system sets a counter ([Prior Authorization](/books/health-tech/prior-authorization)).
2. **Check-in.** The patient pays a $40 copay that the 271 response reported, on a card kept on file for the balance.
3. **The visit.** The therapist documents the treatment and the time; the system turns timed and untimed services into CPT codes with units and ICD-10-CM diagnoses ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation)).
4. **Charges.** Each procedure becomes a `charges` row at the practice's fee schedule price.
5. **The claim.** Charges for the encounter become a professional claim (837P), are scrubbed against payer edits, and go to the clearinghouse ([Claims](/books/health-tech/claims)).
6. **Acknowledgments.** A 999 says the file was valid X12; a 277CA says the payer accepted the claim into adjudication (or rejected it, and why).
7. **Adjudication.** Weeks later, the payer pays some lines, adjusts others and assigns the rest to the patient.
8. **Remittance.** An 835 arrives through the clearinghouse and an ACH deposit arrives at the bank, linked by a trace number; the system matches them and posts each line ([Remittance & Posting](/books/health-tech/remittance-and-payment-posting)).
9. **Patient balance.** The coinsurance the payer assigned to the patient goes on a statement, or on the card on file under the consent the patient signed ([Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience)).
10. **Follow-up.** A denied line becomes a work item: corrected claim, appeal or write-off ([Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals)).

## The X12 Transaction Family

HIPAA's Administrative Simplification rules make certain electronic transactions between providers and health plans use adopted standards. CMS's table of adopted standards lists ASC X12 version 5010 for the core transactions, with a compliance date of January 1, 2012, and NCPDP D.0 for retail pharmacy. Each transaction set has a number, and the numbers are the industry's vocabulary:

| Transaction | X12 | What it does | Chapter |
| --- | --- | --- | --- |
| Eligibility inquiry and response | 270 / 271 | Is this member covered, and what does the plan pay for this kind of service? | [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) |
| Claim status inquiry and response | 276 / 277 | Where is this claim? | [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals) |
| Health care claim | 837P (professional, 005010X222), 837I (institutional, 005010X223), 837D (dental, 005010X224) | The bill | [Claims](/books/health-tech/claims) |
| Claim acknowledgment | 277CA | The payer accepted or rejected the claim into adjudication | [Claims](/books/health-tech/claims) |
| Implementation acknowledgment | 999 (and TA1 for the envelope) | The file was or wasn't valid X12 | [Claims](/books/health-tech/claims) |
| Payment and remittance advice | 835 (005010X221) | What was paid, adjusted and owed, and why | [Remittance & Posting](/books/health-tech/remittance-and-payment-posting) |
| Referral certification and authorization | 278 | Prior authorization request and response | [Prior Authorization](/books/health-tech/prior-authorization) |
| Claim attachment | 275 (with a 277 request for additional information) | Documentation supporting a claim | [Claims](/books/health-tech/claims#attachments) |
| Enrollment and premium payment | 834 / 820 | Employer to plan; not a provider transaction | |

The version numbers are worth knowing because they are law, not preference. The claim regulation (45 CFR 162.1102) names each 837 by its implementation guide identifier, such as "May 2006, ASC X12N/005010X222" for the professional claim. Moving to a newer X12 version takes another rule: in a June 14, 2023 letter, the National Committee on Vital and Health Statistics recommended that HHS "not adopt the version 008020 update" for claims and remittance "at this time," partly because adopting only some transactions would leave several versions in use at once, and as of October 2026 no proposed rule for a version past 5010 has been published. The one new X12 standard on the way is attachments: CMS-0053-F, a final rule effective May 26, 2026, adopts the X12N 275 (006020X314) and 277 request for additional information (006020X313) with HL7 C-CDA and attachment guides, with compliance required by May 26, 2028 ([Attachments](/books/health-tech/claims#attachments)). Pharmacy moves too: the same claim regulation adds NCPDP F6 alongside D.0 from August 14, 2027 and requires it from April 14, 2028.

What an X12 transaction looks like, briefly (this volume's examples are short fragments written for illustration, not copied from implementation guides, which X12 licenses): segments separated by `~`, elements by `*`, wrapped in an interchange envelope (`ISA`/`IEA`), a functional group (`GS`/`GE`) and a transaction set (`ST`/`SE`), with hierarchical loops for the billing provider, subscriber, patient and claim. A professional claim line, for instance, is an `SV1` segment with the procedure code, charge and units:

```
ST*837*0001*005010X222A1~
CLM*PT20261014A*180***11:B:1*Y*A*Y*Y~
HI*ABK:M5450~
LX*1~
SV1*HC:97110*90*UN*2***1~
DTP*472*D8*20261014~
SE*7*0001~
```

The `CLM` carries the practice's own claim identifier (the patient control number, which the payer echoes back on the 277CA and 835), the total charge and the place of service; `HI` carries the diagnosis; `SV1` the procedure code, charge, unit basis and count. The [Claims](/books/health-tech/claims#the-837-claim) chapter reads it segment by segment. The structure here is drawn from CMS contractor companion guides and clearinghouse documentation listed in the references.

## Operating Rules and Connectivity

A standard says what fields a transaction has; an **operating rule** says how the parties must behave around it: response times, connectivity, what a 271 must return, how an 835 matches its payment. HIPAA adopts operating rules too. The regulation incorporates CAQH CORE rules for eligibility (Phase I and II, from January 1, 2013), claim status, and the Phase III EFT and ERA rules (from January 1, 2014), including CORE 360 on consistent use of adjustment codes and CORE 370 on reassociating an EFT with its ERA (45 CFR 162.920). As of October 2026, caqh.org/core redirects to a CAQH CORE operating rules page that still describes CORE as designated by the Secretary of HHS and lists a current claim status infrastructure rule (vCS2.0).

What operating rules mean for software, concretely:

- **Real-time is a requirement, not a nicety.** Eligibility and claim status have mandated real-time modes, so a PMS can ask while the patient stands at the desk. CMS's own HETS (HIPAA Eligibility Transaction System) for Medicare is real-time only: it "does not accept batch transactions."
- **Remittance codes must be used consistently.** CORE 360 ties business scenarios to specific combinations of group, reason and remark codes, which is what makes automated posting possible at all ([Remittance & Posting](/books/health-tech/remittance-and-payment-posting#carc-rarc-and-group-codes)).
- **The ERA and the money have to meet.** CORE 370 sets when the 835 is released relative to the bank deposit, so the practice can match them ([Reassociation](/books/health-tech/remittance-and-payment-posting#eft-and-reassociation)).

Connectivity in practice is a clearinghouse. A provider can connect directly to a large payer, and Medicare contractors accept direct submitters, but almost every small practice sends everything through one clearinghouse, which holds connections to thousands of payers ([Clearinghouses](/books/health-tech/clearinghouses)).

## The KPIs

RCM performance is a handful of ratios, and the definitions matter because vendors quote them loosely. The Healthcare Financial Management Association publishes standard definitions (MAP Keys):

| KPI | HFMA definition | What it tells a practice |
| --- | --- | --- |
| **Days in net A/R** | Net accounts receivable over average daily net patient service revenue, using the last three months and the actual number of days | How long money sits between service and cash. Lower is better; a jump means claims or posting are stuck |
| **Clean claim rate** | Claims that pass edits with no manual intervention over claims accepted into the claims tool | How often the claim was right the first time |
| **Remittance denial rate** | Claims denied over claims remitted, counted per claim, actionable denials only (patient responsibility, duplicates and audit recoupments excluded) | How often payers say no |
| **Cash collection as a percentage of net patient service revenue** | Patient service cash collected over average monthly net revenue across three months | Whether billed revenue turns into cash |

Two measures practices use that HFMA's page doesn't define, so a product must state its formula: the **net collection rate** (payments over charges less contractual adjustments, the share of what was collectible that was collected) and the **first-pass resolution rate** (claims paid on first submission). My default is to show every KPI with its formula and period on the screen, because "our denial rate is 4%" means nothing without knowing whether patient-responsibility lines and rejected-before-submission claims count.

The arithmetic of a single claim shows what each number sees. A practice bills $1,000; the payer's contracted rate is $700, so $300 is a contractual adjustment (group code CO, reason 45, "Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement"). The payer pays $560 and assigns $140 to the patient as coinsurance (group PR, reason 2). The patient pays $100 and $40 is written off as bad debt. Gross collection is $660 of $1,000, 66%; net collection is $660 of $700, 94%; and days in A/R depends on when each of those dollars arrived. A gross collection rate looks alarming for any practice with discounted contracts; net collection is the one that measures the billing office.

Dental practices watch the same numbers under their own names (collections over production, insurance aging buckets), with one difference: a much larger share of dental revenue is patient-pay, so patient collection at the time of service moves the totals more than claim follow-up does, which is why [The Practice Business](/books/health-tech/practice-business) in Part 1 treats front-desk collection as a core job.

## In-House or Outsourced

A practice runs RCM one of three ways:

- **In-house.** Its own staff use the PMS and a clearinghouse. The practice controls the work and pays salaries plus per-transaction fees. Most small dental, optometry and veterinary offices work this way, partly because so much of their revenue is collected at the desk.
- **Outsourced billing.** A billing company works the claims, usually inside the practice's own PMS, and charges a percentage of collections. The practice keeps the system and the data; the vendor keeps the queue moving. Physician specialties with complex payer mixes outsource most often.
- **Bundled.** The practice software vendor sells the PMS and RCM services together, priced as a share of collections, so the vendor is paid only when the practice is.

What the choice changes for software:

- **Multiple users from different companies work one ledger.** An outsourced biller needs access to claims, remittances and ledgers but not to clinical notes, under a business associate agreement with the practice ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)). Roles have to separate billing access from chart access ([Authorization](/docs/security/authorization)).
- **Percentage pricing needs an auditable base.** A fee of a share of collections requires a collections number both sides agree on: payments posted in the period, by source, net of refunds and recoupments.
- **Work queues are the product.** Whoever does the work, RCM software is mostly lists: claims not acknowledged, claims with no response at 30 days, denials by reason, unapplied cash, statements returned. A good product makes each list owned, aged and finished.

## How to Build It

The core model has the money records (`charges`, `claims`, `claim_lines`, `remittances`, `remittance_lines`, `payments`, `ledger_entries`, `patient_statements`). This chapter adds what every later chapter in the part uses: a log of every electronic transaction exchanged with a clearinghouse or payer, work items that make the back end a set of queues, and month-end A/R snapshots.

```sql
CREATE TABLE edi_transactions (          -- every X12 file or API call, inbound and outbound
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),  -- the clearinghouse or payer link
  direction        TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  transaction_set  TEXT NOT NULL CHECK (transaction_set IN ('270', '271', '276', '277',
                     '277CA', '278', '275', '837P', '837I', '837D', '835', '999', 'TA1')),
  version          TEXT NOT NULL,          -- '005010X222A1'; the guide the file claims to follow
  control_number   TEXT,                   -- ISA13 / ST02, or the vendor's transaction id
  payer_id         UUID REFERENCES payers (id),
  correlates_to    UUID REFERENCES edi_transactions (id),  -- a 999 or 277CA points at its 837
  status           TEXT NOT NULL CHECK (status IN ('built', 'sent', 'accepted', 'rejected',
                     'received', 'parsed', 'failed')),
  raw_ref          TEXT NOT NULL,          -- object storage key of the exact bytes, kept
  parsed           JSONB,                  -- normalized form for the UI
  error            TEXT,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX edi_transactions_correlation_idx ON edi_transactions (correlates_to);

CREATE TABLE rcm_work_items (            -- one owned, aged task on the back end
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('eligibility_failed', 'auth_needed',
                     'claim_rejected', 'no_response', 'denial', 'underpayment',
                     'unapplied_cash', 'credit_balance', 'statement_returned', 'appeal_due')),
  claim_id         UUID REFERENCES claims (id),
  patient_id       UUID REFERENCES patients (id),
  stage            TEXT NOT NULL CHECK (stage IN ('front', 'middle', 'back')),  -- the stage that could have prevented it
  reason_code      TEXT,                   -- CARC, 277CA status, or internal code
  amount           BIGINT,                 -- cents at stake
  assigned_to      UUID,                   -- a user, possibly at an outsourced billing company
  due_at           TIMESTAMPTZ,            -- timely filing or appeal deadline, computed
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress',
                     'waiting_payer', 'done', 'written_off')),
  resolution       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);
CREATE INDEX rcm_work_items_queue_idx ON rcm_work_items (organization_id, kind, status, due_at);

CREATE TABLE ar_snapshots (              -- A/R by payer and age bucket, frozen at each month end
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  as_of            DATE NOT NULL,
  responsibility   TEXT NOT NULL CHECK (responsibility IN ('insurance', 'patient')),
  payer_id         UUID REFERENCES payers (id),          -- null for patient balances
  bucket           TEXT NOT NULL CHECK (bucket IN ('0_30', '31_60', '61_90', '91_120', '120_plus')),
  balance          BIGINT NOT NULL,
  claim_count      INT,
  UNIQUE NULLS NOT DISTINCT (organization_id, as_of, responsibility, payer_id, bucket)
);
```

A/R snapshots exist because aging is a point-in-time fact: a balance that was 45 days old at September's close stays reported that way after it's paid, and trend lines ("over-90 insurance A/R fell from 18% to 11%") need the frozen numbers, not a recomputation from today's ledger.

The KPIs are queries over the core tables, computed with the formulas shown on screen:

```sql
-- Days in net A/R for one organization: net A/R today over average daily net revenue, last 3 months
WITH ar AS (
  SELECT SUM(amount) AS net_ar
  FROM ledger_entries
  WHERE organization_id = $1                -- charges, payments and adjustments, signed
),
rev AS (
  SELECT SUM(amount)::numeric / (CURRENT_DATE - (CURRENT_DATE - INTERVAL '3 months')::date) AS per_day
  FROM ledger_entries
  WHERE organization_id = $1
    AND kind IN ('charge', 'contractual_adjustment')   -- net patient service revenue
    AND posted_on >= CURRENT_DATE - INTERVAL '3 months'
)
SELECT ar.net_ar / NULLIF(rev.per_day, 0) AS days_in_ar FROM ar, rev;
```

Design notes:

- **Keep the bytes.** Every file sent and received is stored exactly, by reference, because a payer dispute is settled by what was transmitted, and a parser bug found next month needs the original to re-parse. The parsed JSON is a convenience.
- **Correlate everything.** A 999 points at the file it acknowledges, a 277CA at its claim, an 835 claim at its claim through the patient control number. Without correlation, the work queues can't say "no response."
- **Deadlines are computed and stored** on the work item when it is created (timely filing from the date of service, an appeal window from the remittance date), following [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored), so a rule change doesn't silently move a deadline already promised.
- **The ledger is double entry.** Charges, payments, adjustments and transfers between payer and patient responsibility are entries that sum to balances, never edited in place ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)).
- **Events** (`claim.submitted`, `claim.acknowledged`, `claim.rejected`, `remittance.received`, `remittance.posted`, `denial.opened`) go through the [outbox](/docs/architecture/events#the-transactional-outbox) to work queues, patient messaging and reporting.

## Auditing

- **Every transaction exchanged:** raw bytes, direction, control numbers, the acknowledgment that answered it and when.
- **Every posting:** which remittance line or payment produced each ledger entry, by whom or by which automation, so a balance can be explained line by line to a patient or an auditor.
- **Every work item's history:** who owned it, what they did and why it closed, especially write-offs, which are where revenue disappears.
- **Access to billing data** by outsourced staff, logged like any PHI access ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), since an 835 names diagnoses and procedures.

## What This Means for the System You Build

- **Model the cycle as stages with owners:** front end, middle and back end, and trace every denial to the stage that could have prevented it.
- **Treat X12 versions as law:** 5010 for claims, eligibility, status and remittance, 275 attachments coming by May 2028, NCPDP F6 in pharmacy by April 2028.
- **Follow the operating rules,** real-time eligibility and status, consistent adjustment codes, and EFT and ERA that can be matched.
- **Log every transaction with its raw bytes and correlations,** so acknowledgments, status and remittances tie to the claims they answer.
- **Make the back end a set of owned, aged queues** with computed deadlines.
- **Publish KPI formulas** with the numbers, using HFMA's definitions where they exist.
- **Separate billing access from clinical access** for outsourced billers working inside the practice's system.

## References

**Regulations and standards**

- [CMS: Adopted Standards and Operating Rules](https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/HIPAA-ACA/AdoptedStandardsandOperatingRules), X12 5010 and NCPDP D.0, the January 1, 2012 compliance date, operating rules dates for 2013 and 2014
- [45 CFR 162.1102: Standards for health care claims](https://www.law.cornell.edu/cfr/text/45/162.1102), the 837P, 837I and 837D implementation guide identifiers, NCPDP F6 dates
- [45 CFR 162.920: Availability of implementation specifications and operating rules](https://www.law.cornell.edu/cfr/text/45/162.920), the CAQH CORE rules incorporated by reference
- [NCVHS: Recommendation letter on the updated X12 standard (June 14, 2023)](https://ncvhs.hhs.gov/wp-content/uploads/2023/06/Recommendation-Letter-Updated-Version-of-X12-Standard-June-14-2023.pdf), the recommendation not to adopt 008020 at this time
- [CMS: Claims attachments final rule fact sheet (CMS-0053-F)](https://www.cms.gov/files/document/nsg-attachments-final-rule-fact-sheet.pdf), the 275 and 277 standards and C-CDA guides adopted
- [X12: Final rule advancing standardized claims attachments](https://x12.org/news-and-events/news/x12-applauds-final-rule-advancing-standardized-health-care-claims-attachments), the May 26, 2026 effective date
- [MGMA: Electronic claims attachment transaction standards (April 20, 2026)](https://www.mgma.com/federal-policy-resources/april-20-2026-electronic-claims-attachment-transaction-standards), compliance required by May 26, 2028
- [CAQH CORE: Operating rules](https://www.dataspring.com/core/operating-rules), the current rule set and designation
- [CMS: HIPAA Eligibility Transaction System](https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system), real-time only, no batch
- [X12: Claim adjustment reason codes](https://x12.org/codes/claim-adjustment-reason-codes), CARC 2, 45 and 197

**Vendors and filings**

- [Waystar Holding Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1990354/000199035426000011/way-20251231.htm), transaction, claim, client and provider counts
- [SEC XBRL: Waystar revenue](https://data.sec.gov/api/xbrl/companyconcept/CIK0001990354/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json), revenue for 2023 through 2025
- [Availity Essentials](https://www.availity.com/essentials), the provider portal's transactions
- [Stedi: Pricing](https://www.stedi.com/pricing), per-transaction list prices
- [Claim.MD: Pricing](https://www.claim.md/pricing), monthly plans and per-use fees
- [Office Ally: Pricing](https://cms.officeally.com/products/pricing), the free Service Center tier and eligibility fees
- [Vyne Dental: Vyne Trellis](https://vynedental.com/blog/unlock-the-potential-of-vyne-trellis/), dental eligibility, claims and attachments
- [DentalXChange: Real-Time](https://help.dentalxchange.com/DentalXChangeHelp/RealTime.htm), dental 270/271 and 276/277 and PMS integrations
- [CGS Medicare: 837P companion guide](https://www.cgsmedicare.com/pdf/edi/837p_compguide.pdf), the claim structure and Medicare's acknowledgments

**Measures**

- [HFMA: MAP Keys](https://www.hfma.org/tools-and-resources/map-keys/), days in net A/R, clean claim rate, remittance denial rate, cash collection as a percentage of net revenue
