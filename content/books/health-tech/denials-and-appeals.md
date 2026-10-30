+++
title = "Denials, Appeals & Claim Status"
nav_title = "Denials & Appeals"
description = "When payers say no or nothing: 276/277 claim status, denial categories, Medicare's five appeal levels, commercial appeals, audits, recoupments, underpayments."
category = "Health Tech Industry"
order = 1924
part = "Revenue Cycle"
tags = ["health-tech", "denials", "appeals", "claim-status", "x12-276", "audits", "data-model"]
+++

A claim that isn't paid in full ends one of three ways: someone fixes it and resends it, someone argues with the payer, or someone writes it off. Which one is right depends on why it wasn't paid, and the payer says why in codes: a claim status response that says the claim is pending, missing information or finalized; an 835 line with a denial reason and remark. Denial management is the work of reading those codes, routing each denial to the person who can fix it, meeting deadlines that are as strict as timely filing, and learning from the pattern so the next claim is clean. Appeals are the formal arguments, and for Medicare they run through five levels of law, from the contractor that paid the claim to a federal court.

The other half of this chapter is the payer coming back for money. Medicare's recovery auditors review paid claims and take back overpayments years later; commercial payers audit and recoup from future payments; and every provider has a legal duty to return overpayments it finds itself, within 60 days. A practice's system has to handle all of it: a status check on a claim that went silent, a denial queue with deadlines, an appeal with its letter and evidence, a recoupment posted against the right old claim, and an underpayment found by comparing the payment with the contract. This chapter covers claim status, denial categories, working denials, Medicare's appeal levels, commercial appeals, audits and recoupments, overpayments, and underpayments. It builds on [Claims](/books/health-tech/claims) and [Remittance & Posting](/books/health-tech/remittance-and-payment-posting), and on the core `claims`, `claim_lines` and `remittance_lines` of [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from regulators' and vendors' pages:

| Program or vendor | What it covers | Notable mechanics |
| --- | --- | --- |
| **Medicare fee-for-service appeals** | Five levels: redetermination by the contractor, reconsideration by a qualified independent contractor (QIC), an administrative law judge (OMHA), the Medicare Appeals Council, federal district court | Filing windows of 120, 180, 60 and 60 days; amount-in-controversy minimums of $200 for an ALJ hearing and $1,960 for court in 2026 |
| **Medicare Recovery Audit Program** | Post-payment review of Part A and B claims (regions 1 to 4) and DMEPOS, home health and hospice nationwide (region 5) | Performant in regions 1 and 2, Cotiviti in regions 3 to 5 |
| **ACA internal and external review (45 CFR 147.136)** | Commercial and marketplace plans | External review requested within four months; standard decisions within 45 days, expedited within 72 hours |
| **Availity Essentials** | Provider portal | Claim status and appeals among its transactions |
| **Stedi** | Clearinghouse API | Real-time 276/277 claim status, priced on its eligibility tiers |
| **DentalXChange** | Dental clearinghouse | Claim status by 276/277; "Update Status" for current information and a search for several claims at once |

Three patterns:

- **Status before appeal.** Every channel offers claim status first, because most "denials" a practice chases are claims the payer never received, is still pending, or is waiting on information it requested.
- **Deadlines are law or contract.** Medicare's windows are regulations; commercial windows are in the plan and provider contract, with federal floors for member appeals.
- **Recovery is industrialized.** Medicare contracts with private auditors region by region, and commercial payers run their own payment integrity programs.

## Claim Status: 276 and 277

A 276 asks a payer about a claim (by payer claim number, or by patient, date of service, charge and provider); the 277 response gives a status category and a status code per claim and, optionally, per line. The CAQH CORE claim status rule (vCS2.0 as of October 2026) is one of the operating rules adopted under HIPAA, so payers must support real-time status. X12's claim status category codes are the vocabulary:

| Category | Meaning (X12's wording, abbreviated) | What the practice does |
| --- | --- | --- |
| **A1** | Received; "does not mean that the claim has been accepted for adjudication" | Wait for acceptance |
| **A2** | "accepted into the adjudication system" | Wait; check again at the payer's normal turnaround |
| **A3** / **A7** | Rejected, not entered into adjudication / invalid information | Fix and resubmit as an original ([Submission and Acknowledgments](/books/health-tech/claims#submission-and-acknowledgments)) |
| **P1** / **P2** | In adjudication / "suspended and is pending review" | Wait, unless past the payer's prompt-pay window |
| **P3** | "waiting for information that has already been requested from the provider" | Find the request; send the documentation ([Attachments](/books/health-tech/claims#attachments)) |
| **R0** to **R17** | Requests for additional information: documentation (R4), medical necessity (R9), a specific code's justification (R12), and others | Route to whoever holds the record |
| **F1** / **F2** / **F4** | Paid / denied / adjudicated with "no further payment is forthcoming" | Look for the 835; if it's missing, ask for a copy ([EFT and Reassociation](/books/health-tech/remittance-and-payment-posting#eft-and-reassociation)) |

My rule for status automation: check claims with no 835 at the payer's expected turnaround (often 30 days for commercial payers, a contract term worth storing per payer), then on a schedule, never every night for every open claim; and treat P3 and R-category answers as urgent work, because a records request ignored becomes a denial for lack of documentation.

## Denial Categories

A denial's reason code says which of a small number of root causes it is, and the category decides who fixes it:

| Category | Typical CARCs | Stage that caused it | Fix |
| --- | --- | --- | --- |
| **Eligibility and coverage** | Coverage terminated, patient not covered, coordination of benefits | Front end | Find the right coverage; bill the right payer or the patient |
| **Authorization** | 197 "Precertification/authorization/notification/pre-treatment absent" | Front end | Retro-authorization if the payer allows; appeal with the clinical case; otherwise write off (not bill the patient, for in-network contracts) |
| **Missing or invalid information** | 16 "Claim/service lacks information or has submission/billing error(s)," with a RARC naming what | Back end | Corrected claim |
| **Coding and bundling** | 97 bundled into another service; modifier problems | Middle | Review documentation; corrected claim with the right modifier if supported; appeal if the edit is wrong |
| **Medical necessity and coverage policy** | Not covered for this diagnosis, frequency exceeded | Middle and front end | Appeal with records; for Medicare, check for a signed advance beneficiary notice ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#medical-necessity-ncds-and-lcds)) |
| **Timely filing** | Filed after the deadline | Back end | Appeal only with proof of timely submission; otherwise write off |
| **Duplicate** | Duplicate claim | Back end | Usually none; find the original's adjudication |
| **Contractual** | 45 charge over the fee schedule | None; not a denial | Post as a contractual adjustment ([Posting](/books/health-tech/remittance-and-payment-posting#posting)) |

HFMA's standard denial rate counts only actionable denials and excludes patient responsibility, duplicates and audit recoupments ([The KPIs](/books/health-tech/revenue-cycle#the-kpis)). The more useful number inside a practice is denials by category and stage, because a rising authorization denial rate is a front desk problem and a rising bundling rate is a coding problem.

## Working Denials

A denial becomes a work item with an owner, a deadline and a decision:

1. **Classify** from the CARC, RARC and group code into a category, by rules kept as data.
2. **Compute the deadline:** the payer's corrected-claim window or appeal window from the remittance date, stored on the item ([The Revenue Cycle](/books/health-tech/revenue-cycle#how-to-build-it)).
3. **Route** to the stage that can fix it: front desk for eligibility, the authorization coordinator, the coder, the biller.
4. **Decide:** corrected claim, reopening, appeal, bill another payer, transfer to the patient where the contract and the patient's agreement allow, or write off with a reason.
5. **Track the outcome** and feed it back: the payer and code that denied, the fix that worked, and a new scrubber rule if the denial was preventable ([Scrubbing and Edits](/books/health-tech/claims#scrubbing-and-edits)).

Two Medicare-specific shortcuts matter: a minor clerical error (a mathematical mistake, inaccurate data entry, a claim wrongly denied as a duplicate) is handled as a **reopening**, not an appeal (42 CFR 405.980), and a contractor may reopen for any reason within one year of the determination and for good cause within four. Many denials a practice would appeal are faster as reopenings.

## Medicare's Five Levels

Medicare fee-for-service appeals are set in regulation, each level with a filing window that starts on receipt of the prior decision (presumed five days after the notice date):

| Level | Decided by | Filing window | Notes |
| --- | --- | --- | --- |
| **1. Redetermination** | The Medicare administrative contractor that processed the claim | 120 days from the initial determination (42 CFR 405.942) | A different reviewer than the original |
| **2. Reconsideration** | A qualified independent contractor | 180 days from the redetermination (42 CFR 405.962) | The last level to submit evidence freely; evidence held back can be excluded later |
| **3. Hearing** | An administrative law judge or attorney adjudicator at OMHA | 60 days from the reconsideration (42 CFR 405.1002) | Amount in controversy at least $200 in 2026 |
| **4. Council review** | The Medicare Appeals Council | 60 days from the ALJ decision (42 CFR 405.1102) | |
| **5. Judicial review** | Federal district court | After the Council | Amount in controversy at least $1,960 in 2026 |

The amount-in-controversy thresholds are adjusted each year by Federal Register notice; the 2026 figures were published December 4, 2025, and a notice for 2027 followed in September 2026. Claims can be aggregated to meet them.

Medicare Advantage plans run their own provider appeal processes under their contracts, with members' appeals rights set by CMS rules, so a practice's appeal workflow is per payer type, not one Medicare process.

## Commercial Appeals

For commercial plans, two layers apply:

- **The provider contract** sets the provider's own dispute process: levels, windows, what must be included, and whether the provider can appeal in its own name.
- **The member's appeal rights** under the ACA's rules for group and individual plans (45 CFR 147.136): internal appeals, then external review by an independent review organization, requested "within four months after the date of receipt of a notice of an adverse benefit determination," decided within 45 days for a standard review and within 72 hours for an expedited one. Providers often file these as the patient's authorized representative, which needs the patient's signed designation.

An appeal is a package: a letter stating the claim, the denial, the argument and the requested outcome; the claim and remittance; the medical records that support necessity; the payer's own policy text where the denial contradicts it; and the authorization or proof of timely filing where relevant. Software builds it from records the system already holds and logs exactly what was sent, because the next level of appeal will be judged partly on what the previous one contained.

## Audits and Recoupments

Payers review paid claims after the fact, and the outcome of a finding is a demand or an offset against future payments:

- **Medicare Recovery Audit Contractors** (RACs) review claims after payment in five regions: Performant in regions 1 and 2, Cotiviti in regions 3, 4 and 5, with region 5 covering durable medical equipment, home health and hospice nationwide. CMS's older program materials describe a lookback of three years from the date the claim was paid; the current program page doesn't restate it. <!-- source-gap: rac-lookback | secondary | Medicare RACs review claims up to three years from the date paid | closes with: a current CMS Recovery Audit Program page or statement of work stating the lookback | checked: 2026-10-29 -->
- **Medicare Advantage risk adjustment audits** (RADV) audit diagnoses that raised plan payments, which reach practices as records requests ([Value-Based Care & Quality](/books/health-tech/value-based-care#medicare-advantage-and-risk-adjustment)).
- **Commercial payment integrity** programs request records, apply edits after payment and recoup by offset in a later 835, appearing as a provider-level adjustment that names the original claim ([Provider-Level Adjustments and Recoupments](/books/health-tech/remittance-and-payment-posting#provider-level-adjustments-and-recoupments)).

What the system must do: track every records request with its deadline (missing one usually means the payer recoups by default); link each recoupment to the claim it reverses; keep the appeal path open, because a recoupment is appealable like a denial; and keep the documentation that supported the claim retrievable for as long as the payer can audit it.

## Overpayments: The 60-Day Rule

A provider that finds it was overpaid by Medicare must report and return the money "60 days after the date on which the overpayment was identified" (or by the cost report due date, if later), for overpayments "within 6 years of the date the overpayment was received" (42 CFR 401.305). Rules finalized in the 2025 physician fee schedule, effective January 1, 2025, changed two things: "identified" now uses the False Claims Act's knowledge standard (actual knowledge, reckless disregard or deliberate ignorance), and the deadline is suspended during a "timely, good-faith investigation" for up to "180 days after the date on which the initial identified overpayment was identified." Medicare Advantage and Part D have parallel rules.

For software this is a workflow with a clock: a credit balance or audit finding opens an overpayment investigation with its start date, the 180-day suspension limit and the 60-day return deadline computed and shown; the result (refund, offset request or no overpayment) is recorded with the analysis. An overpayment kept past the deadline can become a False Claims Act liability ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#the-false-claims-act)). Credit balances on patient accounts are the commonest source, and the software should surface them rather than let them sit.

## Underpayments and Contracts

A payment can be on time, error-free and wrong: the payer paid less than its contract with the practice says. Finding it requires the contract as data:

- **Fee schedules per payer,** by code and effective date (the payer fee schedules of [The Practice Business](/books/health-tech/practice-business#how-to-build-it)), from the contract or the payer's published schedule.
- **Payment methodology,** where it isn't a simple fee schedule: a percentage of the Medicare rate for the year, multiple procedure reductions, a case rate.
- **Expected allowed amount** computed for every claim line when the claim is built, compared with the allowed amount in the 835.

A line paid below expected by more than a tolerance opens an underpayment work item with the variance. Patterns (one payer underpaying one code after a fee schedule update) are worth more than single lines, and the fix is usually a call to the payer's provider relations with the list. For small practices, this is often the most money RCM software can find that nobody was looking for. The payer loads the same contract as `network_contracts` to price the claim ([How to Build It](/books/health-tech/payers-and-plans#how-to-build-it) in Payers & Plans), so the two sides are checking one document.

## How to Build It

This chapter adds claim status checks, denials, appeals with their levels and deadlines, records requests, overpayment investigations, and payment methods on the payer fee schedules [The Practice Business](/books/health-tech/practice-business) defines:

```sql
CREATE TABLE claim_status_checks (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id         UUID NOT NULL REFERENCES claims (id),
  request_txn_id   UUID REFERENCES edi_transactions (id),
  response_txn_id  UUID REFERENCES edi_transactions (id),
  category_code    TEXT,                   -- A1, A2, P3, R4, F1, F2...
  status_code      TEXT,
  line_statuses    JSONB,
  reason           TEXT NOT NULL CHECK (reason IN ('no_response', 'scheduled', 'manual')),
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE denials (                   -- one denied claim line, or a whole claim
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id            UUID NOT NULL REFERENCES claims (id),
  claim_line_id       UUID REFERENCES claim_lines (id),
  remittance_line_id  UUID REFERENCES remittance_lines (id),
  group_code          TEXT NOT NULL,
  reason_code         TEXT NOT NULL,         -- CARC
  remark_codes        TEXT[] NOT NULL DEFAULT '{}',
  category            TEXT NOT NULL CHECK (category IN ('eligibility', 'authorization',
                        'information', 'coding', 'medical_necessity', 'timely_filing',
                        'duplicate', 'other')),
  caused_by_stage     TEXT NOT NULL CHECK (caused_by_stage IN ('front', 'middle', 'back', 'payer')),
  amount              BIGINT NOT NULL,
  work_item_id        UUID REFERENCES rcm_work_items (id),
  outcome             TEXT CHECK (outcome IN ('corrected', 'reopened', 'appealed', 'rebilled',
                        'to_patient', 'written_off', 'overturned', 'upheld')),
  recovered           BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE appeals (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  denial_id        UUID REFERENCES denials (id),
  recoupment_ref   UUID,                   -- provider_adjustments, when appealing an offset
  payer_id         UUID NOT NULL REFERENCES payers (id),
  program          TEXT NOT NULL CHECK (program IN ('medicare_ffs', 'medicare_advantage',
                     'medicaid', 'commercial_contract', 'aca_internal', 'aca_external', 'other')),
  level            SMALLINT NOT NULL,      -- 1 to 5 for Medicare FFS
  on_behalf_of     TEXT NOT NULL CHECK (on_behalf_of IN ('provider', 'patient')),
  representative_doc_id UUID REFERENCES documents (id),  -- the patient's designation, if any
  prior_decision_received DATE NOT NULL,   -- the window runs from receipt
  filing_deadline  DATE NOT NULL,          -- computed from the program's rule and stored
  filed_at         TIMESTAMPTZ,
  packet_doc_ids   UUID[] NOT NULL DEFAULT '{}',   -- exactly what was sent
  amount_in_controversy BIGINT,
  decision         TEXT CHECK (decision IN ('favorable', 'partially_favorable', 'unfavorable',
                     'dismissed')),
  decided_on       DATE,
  next_appeal_id   UUID REFERENCES appeals (id)
);

CREATE TABLE records_requests (          -- audits, P3/R-category status, payer letters
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  payer_id         UUID NOT NULL REFERENCES payers (id),
  source           TEXT NOT NULL CHECK (source IN ('claim_status', 'rac', 'radv', 'payer_audit',
                     'prepayment_review', 'letter')),
  claim_ids        UUID[] NOT NULL,
  received_on      DATE NOT NULL,
  due_on           DATE NOT NULL,
  sent_doc_ids     UUID[],
  sent_at          TIMESTAMPTZ,
  finding          TEXT,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sent', 'closed_no_finding',
                     'closed_finding', 'appealed'))
);

CREATE TABLE overpayment_investigations (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  payer_id          UUID NOT NULL REFERENCES payers (id),
  trigger           TEXT NOT NULL,          -- credit balance, internal audit, records request
  started_on        DATE NOT NULL,
  suspension_ends   DATE NOT NULL,          -- started_on + 180 days, for Medicare
  identified_on     DATE,                   -- when quantified, or when suspension ended
  return_due        DATE,                   -- identified_on + 60 days
  amount            BIGINT,
  resolution        TEXT CHECK (resolution IN ('refunded', 'offset', 'no_overpayment')),
  resolved_on       DATE,
  analysis_doc_id   UUID REFERENCES documents (id)
);

ALTER TABLE fee_schedules                -- The Practice Business's payer fee schedules (kind 'ppo', 'medicare'...)
  ADD COLUMN method       TEXT NOT NULL DEFAULT 'fixed' CHECK (method IN ('fixed',
                            'percent_of_medicare', 'case_rate')),
  ADD COLUMN percent      NUMERIC(6,4),            -- for percent_of_medicare
  ADD COLUMN source_doc_id UUID REFERENCES documents (id);  -- the contract or published schedule
```

Underpayments are a query over posted lines and the payer fee schedule in effect on the date of service:

```sql
SELECT rl.id, cl.claim_id, cl.code, rl.allowed_amount, fsi.amount AS expected,
       fsi.amount * cl.units - rl.allowed_amount AS variance
FROM remittance_lines rl
JOIN claim_lines cl ON cl.id = rl.claim_line_id
JOIN charges ch     ON ch.id = cl.charge_id
JOIN claims c       ON c.id = cl.claim_id
JOIN coverages cv   ON cv.id = c.coverage_id
JOIN fee_schedules fs
  ON fs.organization_id = c.organization_id
 AND fs.plan_id = cv.plan_id
 AND fs.method = 'fixed'
 AND fs.valid_during @> ch.service_on
JOIN fee_schedule_items fsi
  ON fsi.fee_schedule_id = fs.id
 AND fsi.code = cl.code
WHERE c.organization_id = $1
  AND rl.allowed_amount IS NOT NULL
  AND fsi.amount * cl.units - rl.allowed_amount > $2;   -- tolerance in cents
```

Design notes:

- **Every deadline is computed once and stored** with the rule that produced it: appeal windows from receipt dates, records request due dates, overpayment suspension and return dates ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Appeals chain.** Each level points to the next, so a claim's whole dispute history is one walk, and the evidence submitted at each level is fixed.
- **Classification is data:** CARC, RARC and group to category and stage, dated, so the categories can be tuned without code changes.
- **Recoupments and denials share the appeal path,** since both are appealable payer decisions.

## Auditing

- **Every status check, denial, appeal and records request,** with the raw transactions and documents sent.
- **Deadlines and whether they were met,** since a missed appeal window is a loss nobody can fix and a pattern worth seeing.
- **Every write-off of a denial,** by reason and person.
- **Overpayment investigations** with their dates and analysis, which is the evidence of a timely, good-faith investigation if the government later asks.

## What This Means for the System You Build

- **Check claim status before chasing a denial,** at the payer's turnaround, and treat requests for information as urgent.
- **Classify denials by category and causing stage** from codes kept as data, and route each to the person who can fix it.
- **Use reopenings for clerical errors** and corrected claims for the practice's own mistakes; save appeals for disagreements.
- **Encode Medicare's five levels** with their windows and amount-in-controversy thresholds by year, and per-payer windows for everyone else.
- **Track records requests and recoupments** with deadlines and links to the claims involved.
- **Run the 60-day overpayment clock,** with the 180-day investigation suspension, from credit balances and audit findings.
- **Load payer fee schedules and compare every allowed amount,** because underpayments are invisible without them.

## References

**Regulations and federal programs**

- [CMS: Medicare fee-for-service appeals](https://www.cms.gov/medicare/appeals-grievances/fee-for-service), the five levels
- [42 CFR 405.942: Time frame for filing a request for a redetermination](https://www.law.cornell.edu/cfr/text/42/405.942), 120 days
- [42 CFR 405.962: Timeframe for filing a request for a reconsideration](https://www.law.cornell.edu/cfr/text/42/405.962), 180 days
- [42 CFR 405.1002: Right to an ALJ hearing](https://www.law.cornell.edu/cfr/text/42/405.1002), 60 days
- [42 CFR 405.1102: Request for Council review](https://www.law.cornell.edu/cfr/text/42/405.1102), 60 days
- [42 CFR 405.980: Reopening of initial determinations](https://www.law.cornell.edu/cfr/text/42/405.980), one-year and four-year windows, clerical errors
- [Federal Register: Medicare appeals amount in controversy for 2026](https://www.federalregister.gov/api/v1/documents/2025-21879.json), $200 and $1,960, published December 4, 2025
- [45 CFR 147.136: Internal claims and appeals and external review](https://www.law.cornell.edu/cfr/text/45/147.136), the four-month request window and decision timeframes
- [CMS: Medicare Fee for Service Recovery Audit Program](https://www.cms.gov/data-research/monitoring-programs/medicare-fee-service-compliance-programs/medicare-fee-service-recovery-audit-program), regions and contractors
- [CMS: The Recovery Audit Program and Medicare (2013 slides)](https://www.cms.gov/research-statistics-data-and-systems/monitoring-programs/medicare-ffs-compliance-programs/recovery-audit-program/downloads/the-recovery-audit-program-and-medicare-slides-051313.pdf), the three-year lookback as described then
- [42 CFR 401.305: Requirements for reporting and returning overpayments](https://www.law.cornell.edu/cfr/text/42/401.305), 60 days, the six-year lookback and the 180-day suspension
- [Federal Register: CY 2025 physician fee schedule final rule](https://www.federalregister.gov/api/v1/documents/2024-25382.json), the overpayment rule changes

**Standards**

- [X12: Claim status category codes](https://x12.org/codes/claim-status-category-codes), A, P, R and F categories
- [CAQH CORE: Operating rules](https://www.dataspring.com/core/operating-rules), the claim status rule
- [X12: Claim adjustment reason codes](https://x12.org/codes/claim-adjustment-reason-codes), CARCs 16, 45, 97 and 197

**Vendors**

- [Availity Essentials](https://www.availity.com/essentials), claim status and appeals
- [Stedi: Pricing](https://www.stedi.com/pricing), claim status pricing
- [DentalXChange: Real-Time](https://help.dentalxchange.com/DentalXChangeHelp/RealTime.htm), dental claim status
- [HFMA: MAP Keys](https://www.hfma.org/tools-and-resources/map-keys/), the remittance denial rate definition
