+++
title = "Workers' Comp Claims"
description = "Injury reports and IAIABC EDI, compensability clocks, waiting periods and indemnity worked, medical fee schedules, return to work, Medicare reporting."
category = "Insurance Industry"
order = 2756
part = "Workers' Compensation"
tags = ["insurance", "workers-compensation", "claims", "edi", "medical-fee-schedules", "medicare-secondary-payer"]
+++

A workers' compensation claim is a benefit administered under a state's rules, more than a loss adjusted under a contract. The policy promises whatever the law requires, so the law sets almost every number on the claim: how quickly the employer must report the injury, how quickly the insurer must start paying or deny, how many days of disability go unpaid before benefits start, what fraction of wages is paid and up to what weekly maximum, what each medical service may cost, and when the claim must be reported to the state, which in most states means electronically, transaction by transaction, in a standard format. On top of the state come federal duties: Medicare must be told about claims involving its beneficiaries, and settlements must account for Medicare's future interest.

The claim also lasts. A lost-time claim can pay weekly benefits for months or years and medical care for decades, so it is a stream of payments, each one a reportable event, more than a single settlement. This chapter covers injury reporting and the EDI transactions to the states, the compensability clocks, indemnity benefits with worked waiting periods and rates, medical fee schedules and bill review, return to work, and Medicare secondary payer reporting. It extends `claims` and `exposures` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `edi_reports` and `medical_bills`. The general claim mechanics (exposures, reserves, payments, the diary) are in the Claims part; health claims data standards (837 and 835) belong to the Health Tech volume's [Claims](/books/health-tech/claims), which workers' compensation medical billing borrows from.

## How the Platforms Do It

As of November 2026, the parties a workers' compensation claim system talks to:

| Party | Role | What the public record says |
| --- | --- | --- |
| **IAIABC** | EDI standard | "EDI Claims Release 3.1 is the most current release and is maintained on an ongoing basis," current publication January 1, 2026; Release 3.0's final publication was January 1, 2017 and Release 1.0's February 15, 2002; the implementation guide is sold to non-members |
| **Texas Division of Workers' Compensation** | State EDI receiver | Required Release 1.0 first and subsequent reports from 1995; implemented Texas Release 3.1.4 on July 26, 2023 under 28 TAC 124.100 to 124.108, with Verisk (ISO) as its data collection agent |
| **California DIR** | Benefit rates and fee schedules | Publishes the temporary disability minimum and maximum each year and updates the Official Medical Fee Schedule to Medicare changes |
| **CMS** | Medicare secondary payer | Requires Section 111 reporting by workers' compensation insurers and self-insurers, and reviews set-aside proposals above thresholds |

## The Injury Report and the Clocks

A claim starts with the employer's report to the insurer, on a state deadline. Texas: when an injury causes an employee's absence "for more than one day," the employer reports to its carrier "not later than the eighth day" after the absence (or after notice of an occupational disease), gives the employee a copy with a plain-language summary of rights, and the carrier files the report with the division, generally electronically, within seven days of receiving it (Labor Code 409.005).

Then the insurer's decision clocks run:

| State | Clock | Rule |
| --- | --- | --- |
| Texas | Begin benefits or notify the division and employee of refusal | "Not later than the 15th day after the date on which an insurance carrier receives written notice of an injury" (Labor Code 409.021(a)) |
| Texas | Contest compensability | Not contested within 60 days of notice, the carrier "waives its right to contest compensability," unless evidence surfaces that couldn't reasonably have been found earlier (409.021(c), (d)); missing the 15-day deadline is an administrative violation but doesn't waive the 60-day right |
| California | Authorize treatment | "Within one working day after an employee files a claim form," the employer authorizes treatment and continues it until liability is accepted or rejected, with medical liability limited to $10,000 in the meantime (Labor Code 5402(c)) |
| California | Accept or reject | "If liability is not rejected within 90 days after the date the claim form is filed," the injury is presumed compensable, rebuttable only by evidence discovered later; 75 days for certain public safety presumptions (5402(b)) |

Each of these is a `claim_tasks` row with its due date computed from the triggering event and the rule cited, exactly like the property claim clocks in the Claims part. The difference is that a missed workers' compensation clock can change the claim's legal status (a waiver of the right to contest, a presumption of compensability), not only expose the insurer to a penalty.

## EDI: Reporting to the State

Most states require insurers (and self-insurers and their TPAs) to report claims to the state agency electronically under the IAIABC's EDI Claims standard. Two families of transactions:

- **First Report of Injury (FROI):** the claim's existence and its facts: employer, employee, injury date and description, body part and nature of injury codes, the employer's and insurer's identifiers, and the initial decision. A FROI is sent when the claim meets the state's reporting threshold (typically lost time beyond the waiting period, or a denial), and later FROIs change or cancel it.
- **Subsequent Reports of Injury (SROI):** each benefit event: initial payment, a change in benefit type or rate, suspension, reinstatement, denial, a periodic report of payments to date, and the final report when the claim closes.

Each transaction carries a maintenance type code naming the event, and each state publishes its own implementation guide, element requirement tables and event table: which transactions it requires, which data elements are mandatory for each, the edits it applies and the deadline for each event, all versioned with effective dates. Texas's guide is an example: Release 3.1.4, implemented July 26, 2023, with claims the carrier knew of before that date reported as legacy claims. The state acknowledges each transaction (accepted, accepted with errors, or rejected), and errors must be corrected and resent.

<!-- source-gap: iaiabc-mtc-codes | missing | the list of FROI and SROI maintenance type codes and their meanings in IAIABC Release 3.1 | closes with: a state implementation guide or event table that reproduces the codes publicly | checked: 2026-11-09 --> The code list is in the IAIABC's paid implementation guide, so I describe the events without their codes.

For the system, EDI is a reporting engine driven by claim events:

1. A claim event (decision, first payment, rate change, suspension, closure) is recorded on the claim.
2. The state's event table, for the version in effect on the event date, says whether it triggers a report, which transaction, and by when.
3. The report is built from the claim, validated against the state's element requirements, and sent through the state's receiver or its data collection agent.
4. The acknowledgment is matched back; rejections become tasks with the errors.
5. Late or rejected reports are tracked against the deadline, because states fine late filing and measure carriers' timeliness.

## Indemnity Benefits

Indemnity is wage replacement. The main types are temporary total disability (TTD, called temporary income benefits in Texas) while the employee can't work, temporary partial disability for reduced earnings, permanent partial and permanent total disability, and death benefits. TTD has three state parameters: the waiting period, the rate and the minimum and maximum.

| State | Waiting period | Retroactive when | Rate | Rule |
| --- | --- | --- | --- | --- |
| California | First 3 days unpaid | Disability over 14 days, or inpatient hospitalization | Two-thirds of average weekly earnings | Labor Code 4652, 4653 |
| Texas | No benefits unless disability lasts at least one week; accrue from the 8th day | Disability of two weeks or more | 70% of the difference between average weekly wage and post-injury earnings (75% for the first 26 weeks for employees earning under $10 an hour) | Labor Code 408.082, 408.103 |
| Florida | First 7 days unpaid, except medical | Disability over 21 days | Maximum of 100% of the statewide average weekly wage | Fla. Stat. 440.12 |
| New York | First 7 days unpaid, except medical | Disability over 14 days | | WCL 12 |

The 2026 limits in two states:

| State | Period | Minimum weekly | Maximum weekly |
| --- | --- | --- | --- |
| California | Injuries in 2026 | $264.61 | $1,764.11 (state average weekly wage $1,789) |
| Texas | October 1, 2025 to September 30, 2026 | $191.00 | $1,271.00 |
| Texas | October 1, 2026 to September 30, 2027 | $197.00 | $1,314.00 |

The system stores the rate table version applied on the claim, selected by the date the state's rule keys on, so later payments on an old claim don't pick up a newer year's limits by accident.

### Worked Benefits

The employees and dates are mine. An employee with an average weekly wage of $1,500 is hurt and can't work.

| Case | Computation | Benefit |
| --- | --- | --- |
| California, off 10 days | Rate 2/3 × $1,500 = $1,000.00 a week; first 3 days unpaid; 7 paid days | $1,000.00 |
| California, off 20 days | Over 14 days, so payable from the first day: 20/7 × $1,000.00 | $2,857.14 |
| California, AWW $3,000, off 20 days | 2/3 × $3,000 = $2,000.00, capped at $1,764.11; 20/7 × $1,764.11 | $5,040.31 |
| Texas, injured October 15, 2026, off 10 days | 70% × ($1,500 − $0) = $1,050.00 (under the $1,314 maximum); accrues from day 8: 3 days | $450.00 |
| Texas, same, off 15 days | Two weeks or more, so from day 1: 15/7 × $1,050.00 | $2,250.00 |

The retroactive rule means a claim's first payments are often wrong in hindsight: a California employee paid for days 4 to 10 who stays out past day 14 is owed the first three days too, which is a new payment and, in EDI states, a reportable change. The system computes benefits from the disability periods, not from what was paid, and pays the difference.

```go tab="Go"
type WaitingRule struct {
	WaitDays       int    // days unpaid at the start: 3 in CA, 7 in TX, FL, NY
	RetroAfterDays int    // paid from day 1 once disability exceeds this: 14 CA, NY; 21 FL; 13 TX
	Citation       string // "Cal. Lab. Code 4652"
}

// PaidDays returns how many days of a continuous disability are payable.
func PaidDays(r WaitingRule, disabilityDays int, hospitalized bool) int {
	if disabilityDays > r.RetroAfterDays || hospitalized {
		return disabilityDays
	}
	return max(0, disabilityDays-r.WaitDays)
}

// Weekly returns the TTD rate in cents, bounded by the injury-date limits.
func Weekly(awwCents, minCents, maxCents int64, num, den int64) int64 {
	rate := awwCents * num / den // 2/3 in CA, 70/100 in TX
	return min(max(rate, minCents), maxCents)
}

// CA (wait 3, retro after 14): PaidDays(ca, 10, false) == 7; PaidDays(ca, 20, false) == 20
// TX (wait 7, retro after 13): PaidDays(tx, 10, false) == 3; PaidDays(tx, 15, false) == 15
```

```rust tab="Rust"
pub struct WaitingRule {
    pub wait_days: u32,        // days unpaid at the start: 3 in CA, 7 in TX, FL, NY
    pub retro_after_days: u32, // paid from day 1 once disability exceeds this: 14 CA, NY; 21 FL; 13 TX
    pub citation: &'static str, // "Cal. Lab. Code 4652"
}

/// How many days of a continuous disability are payable.
pub fn paid_days(r: &WaitingRule, disability_days: u32, hospitalized: bool) -> u32 {
    if disability_days > r.retro_after_days || hospitalized {
        disability_days
    } else {
        disability_days.saturating_sub(r.wait_days)
    }
}

/// The TTD rate in cents, bounded by the injury-date limits.
pub fn weekly(aww: i64, min: i64, max: i64, num: i64, den: i64) -> i64 {
    (aww * num / den).clamp(min, max) // 2/3 in CA, 70/100 in TX
}

// CA (wait 3, retro after 14): paid_days(&ca, 10, false) == 7; paid_days(&ca, 20, false) == 20
// TX (wait 7, retro after 13): paid_days(&tx, 10, false) == 3; paid_days(&tx, 15, false) == 15
```

Texas's "two weeks or more" is a disability of at least 14 days, so its threshold is 13 strictly exceeded; California's and New York's "more than 14 days" is 14, Florida's "more than 21 days" is 21. The hospitalization exception is California's, and should be off in the other states' rules.

## Medical Benefits and Fee Schedules

Medical care in workers' compensation has no deductible or copay for the employee, and in most states the price of each service is set by a state fee schedule, increasingly as a multiple of Medicare's payment. California's Official Medical Fee Schedule for physician services was updated on February 2, 2026 to conform to "relevant 2026 changes in the Medicare payment system," using Medicare's relative value units with a 2.7% Medicare Economic Index adjustment and a temporary 2.5% increase from federal law, for services on or after March 1, 2026, as Labor Code 5307.1 requires. Texas sets workers' compensation conversion factors for Medicare-based professional services (28 TAC 134.203): for 2026, $72.07 for evaluation and management, general medicine, physical medicine and rehabilitation, radiology, pathology, anesthesia and office-based surgery, and $90.48 for surgery in a facility, after a 2.7% MEI adjustment.

Bill review applies the schedule to every bill:

1. **Receive the bill** in the state's required format (most states use the CMS-1500 and UB-04 forms or their electronic X12 837 equivalents, and many require electronic billing) and match it to the claim and an accepted body part.
2. **Check compensability and authorization:** is the treatment for the accepted injury, was it authorized where the state's utilization review rules require it, is the provider in the employer's network where the state allows networks.
3. **Price each line** at the fee schedule or a contracted network rate below it, applying the state's coding edits.
4. **Pay and explain:** pay the allowed amount by the state's deadline and send an explanation of review with reason codes.
5. **Report:** many states collect medical bill data electronically too (IAIABC's medical EDI standard).

A worked line, with figures that are mine and illustrative: a provider bills $250.00 for an office visit; the code's maximum allowable reimbursement at Texas's $72.07 conversion factor is, say, $142.38; the bill reviewer pays $142.38 and explains the $107.62 reduction with the fee schedule reason code. Each line is a `medical_bills` line with billed, allowed and paid amounts and the fee schedule version, and the payment is a `claim_payments` row of cost type indemnity on the medical exposure.

## Return to Work

Indemnity ends when the employee returns to work, reaches maximum medical improvement, or reaches a statutory duration limit; permanent disability is then rated under the state's rating schedule. Return-to-work programs (modified duty offered by the employer, with the temporary partial benefits that make up lost earnings) are the main lever on claim cost. For the system, return to work is a set of dated status changes (released to modified duty, offer made and accepted or refused, full duty), each of which may change the benefit type or rate and trigger an EDI report, plus the physician's work status reports that justify them.

## Medicare Secondary Payer

Medicare is a secondary payer to workers' compensation: it shouldn't pay for care the workers' compensation plan owes. Two federal duties follow.

**Section 111 reporting.** Under 42 USC 1395y(b)(8) (MMSEA section 111), workers' compensation insurers and self-insurers are responsible reporting entities and must report claims involving Medicare beneficiaries to CMS. CMS's NGHP User Guide (version 8.6, October 5, 2026) requires reporting ongoing responsibility for medicals (ORM) that "existed or exists on or after January 1, 2010" (dollar amounts of ORM aren't reported), and excludes a claim "until further notice" only if it is medicals only, the lost time is within the state's medicals-only limit (or 7 days), all payments went directly to providers, and "Total payment for medicals does not exceed $750.00." One-time settlements (total payment obligation to the claimant, TPOC) are reportable above thresholds that stepped down over time: over $5,000 from October 1, 2010, over $2,000 from October 1, 2013, over $300 from October 1, 2014, and over $750 from October 1, 2016, with reporting of $750 and less optional.

**Set-asides.** When a settlement closes future medical care, the parties may set aside money for Medicare-covered future care (a workers' compensation Medicare set-aside, WCMSA). CMS reviews a proposal only when "The claimant is a Medicare beneficiary and the total settlement amount is greater than $25,000.00," or when the claimant has a reasonable expectation of Medicare enrollment within 30 months and the settlement is "expected to be greater than $250,000.00." Review is "a recommended process": "there are no statutory or regulatory provisions requiring that a WCMSA proposal be submitted to CMS for review."

For the system: every claimant needs a Medicare status query (CMS's query process returns whether the person is a beneficiary), refreshed during the claim; ORM start and end dates and each TPOC are reportable events with their own file submissions and responses, like state EDI; and a settlement workflow checks the set-aside thresholds and records the decision whether to submit a proposal.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). A workers' compensation claim has a medical exposure and an indemnity exposure for the employee (both with the employee as claimant), benefit periods that drive indemnity payments, state and federal reports driven by events, and medical bills priced by fee schedule.

```sql
ALTER TABLE claims
  ADD COLUMN jurisdiction_state TEXT,       -- whose law governs the claim
  ADD COLUMN employer_notice_at TIMESTAMPTZ, -- the employer's knowledge of the injury
  ADD COLUMN carrier_notice_at  TIMESTAMPTZ, -- written notice to the insurer, starts clocks
  ADD COLUMN compensability     TEXT CHECK (compensability IN ('pending', 'accepted',
    'denied', 'accepted_by_presumption', 'waived_contest')),
  ADD COLUMN aww                BIGINT,      -- average weekly wage, minor units
  ADD COLUMN benefit_table_ref  TEXT;        -- the injury-date rate table: 'CA TD 2026'

CREATE TABLE benefit_periods (             -- the disability facts benefits are computed from
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  benefit_type       TEXT NOT NULL CHECK (benefit_type IN ('ttd', 'tpd', 'ppd', 'ptd',
                       'death')),
  starts_on          DATE NOT NULL,
  ends_on            DATE,
  weekly_rate        BIGINT NOT NULL,
  post_injury_earnings BIGINT,              -- for partial and Texas income benefits
  hospitalized       BOOLEAN NOT NULL DEFAULT FALSE,
  rule_ref           TEXT NOT NULL,         -- 'Cal. Lab. Code 4652', 'Tex. Lab. Code 408.082'
  source_doc_id      UUID                   -- the work status report
);

CREATE TABLE edi_reports (                 -- every state or CMS transaction, and its fate
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  receiver           TEXT NOT NULL,         -- 'US-TX DWC', 'US-CA DIR', 'CMS Section 111'
  standard           TEXT NOT NULL,         -- 'IAIABC Claims 3.1.4', 'NGHP 8.6'
  transaction        TEXT NOT NULL,         -- 'FROI', 'SROI', 'NGHP claim input'
  event              TEXT NOT NULL,         -- 'original', 'initial_payment', 'suspension', ...
  event_at           TIMESTAMPTZ NOT NULL,
  due_at             TIMESTAMPTZ NOT NULL,  -- from the receiver's event table version
  rule_version       TEXT NOT NULL,         -- the event table or guide version applied
  payload            JSONB NOT NULL,        -- the data elements as sent
  sent_at            TIMESTAMPTZ,
  ack_status         TEXT CHECK (ack_status IN ('accepted', 'accepted_with_errors',
                       'rejected')),
  ack_errors         JSONB,
  corrects_id        UUID REFERENCES edi_reports (id),
  idempotency_key    TEXT NOT NULL UNIQUE   -- claim, event and sequence: one report per event
);

CREATE TABLE medical_bills (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),  -- the medical exposure
  provider_party_id  UUID NOT NULL REFERENCES parties (id),
  form               TEXT NOT NULL,         -- 'CMS-1500', 'UB-04', '837P', '837I'
  received_at        TIMESTAMPTZ NOT NULL,
  pay_by             TIMESTAMPTZ NOT NULL,  -- the state's payment deadline
  status             TEXT NOT NULL CHECK (status IN ('received', 'in_review', 'priced',
                       'paid', 'denied', 'disputed'))
);

CREATE TABLE medical_bill_lines (
  medical_bill_id    UUID NOT NULL REFERENCES medical_bills (id),
  line_no            INT NOT NULL,
  service_date       DATE NOT NULL,
  code               TEXT NOT NULL,         -- CPT, HCPCS or revenue code
  billed             BIGINT NOT NULL,
  allowed            BIGINT NOT NULL,       -- fee schedule or network rate
  fee_schedule_ref   TEXT NOT NULL,         -- 'TX 2026 CF $72.07', 'CA OMFS 2026-03-01'
  reason_codes       TEXT[] NOT NULL DEFAULT '{}',
  claim_payment_id   UUID REFERENCES claim_payments (id),
  PRIMARY KEY (medical_bill_id, line_no)
);

CREATE TABLE medicare_status_checks (      -- Section 111 query results over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  checked_at         TIMESTAMPTZ NOT NULL,
  beneficiary        BOOLEAN NOT NULL,
  orm_start          DATE,
  orm_end            DATE
);
```

Indemnity owed through a date is computed from benefit periods and the waiting rule, and compared to what was paid:

```sql
SELECT bp.exposure_id,
       SUM(bp.weekly_rate * paid_days(bp.rule_ref,
             (LEAST(COALESCE(bp.ends_on, :as_of), :as_of) - bp.starts_on + 1),
             bp.hospitalized) / 7) AS owed,
       (SELECT COALESCE(SUM(cp.amount), 0) FROM claim_payments cp
        WHERE cp.exposure_id = bp.exposure_id AND cp.status IN ('issued', 'cleared')) AS paid
FROM benefit_periods bp
WHERE bp.benefit_type = 'ttd'
GROUP BY bp.exposure_id;
-- paid_days() is the waiting-period function above, exposed to SQL or run in the service.
```

Design notes:

- **Benefits are derived from facts.** Disability periods, wages and the injury-date rate table produce what is owed; payments are what was paid; the difference is the next payment, so a retroactive waiting period or a corrected wage fixes itself.
- **Reports are events with deadlines.** Every claim event runs through each receiver's event table version to create the reports it requires, with due dates; acknowledgments and corrections are linked rows, never overwrites.
- **Fee schedules are versioned reference data.** Each bill line records the schedule version and conversion factor it was priced on, selected by service date.
- **Medicare status is checked, not assumed,** and the ORM and TPOC records feed Section 111 files through the same reporting engine as state EDI.

## Auditing

- **Every clock and its outcome:** employer and carrier notice dates, the benefit start or refusal, the contest deadline and the decision, against the state's rule.
- **Every state and CMS report,** as sent, with acknowledgment, errors and corrections, and its timeliness against the deadline.
- **Benefit calculations:** wage statements, disability periods with their evidence, the rate table version and the waiting rule applied, reproducible for any payment.
- **Medical bill pricing:** each line with billed, allowed and paid amounts, the fee schedule version and the reason codes sent to the provider.
- **Medicare decisions:** status checks, ORM dates, TPOC reports and set-aside threshold decisions.

## What This Means for the System You Build

- **Start every clock from the notice event** and store the rule; in workers' compensation a missed clock can change compensability.
- **Drive state EDI and Section 111 reporting from claim events** through versioned event tables, with deadlines, acknowledgments and corrections.
- **Compute indemnity from disability periods and the injury-date rate table,** applying the state's waiting and retroactive rules, and pay the difference from what was paid.
- **Price medical bills from versioned fee schedules** and keep the explanation of review per line.
- **Model return to work as dated status changes** that change benefits and trigger reports.
- **Check Medicare status during the claim** and gate settlements on the set-aside thresholds.

## References

**Law and regulation**

- [Tex. Labor Code 409.005](https://texas.public.law/statutes/tex._labor_code_section_409.005), the employer's report by the eighth day and the carrier's filing within seven days
- [Tex. Labor Code 409.021](https://texas.public.law/statutes/tex._labor_code_section_409.021), the 15-day deadline to begin benefits or refuse, and the 60-day contest waiver
- [Tex. Labor Code 408.082](https://texas.public.law/statutes/tex._labor_code_section_408.082), the one-week waiting period, accrual from the eighth day and retroactive payment at two weeks
- [Tex. Labor Code 408.103](https://texas.public.law/statutes/tex._labor_code_section_408.103), temporary income benefits at 70% (75% for low-wage employees for 26 weeks)
- [Cal. Labor Code 5402 (FindLaw)](https://codes.findlaw.com/ca/labor-code/lab-sect-5402/), the 90-day presumption, one-working-day treatment authorization and the $10,000 limit
- [Cal. Labor Code 4652 (FindLaw)](https://codes.findlaw.com/ca/labor-code/lab-sect-4652/), the three-day waiting period and payment from the first day after 14 days or hospitalization
- [Cal. Labor Code 4653 (FindLaw)](https://codes.findlaw.com/ca/labor-code/lab-sect-4653/), temporary total disability at two-thirds of average weekly earnings
- [Fla. Stat. 440.12](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0440/Sections/0440.12.html), the seven-day waiting period, retroactive payment after 21 days and the maximum at 100% of the statewide average weekly wage
- [N.Y. Workers' Compensation Law 12](https://www.nysenate.gov/legislation/laws/WKC/12), the seven-day waiting period and retroactive payment after 14 days

**Regulators and guidance**

- [California DIR: 2026 temporary disability rates, Release 2025-116](https://www.dir.ca.gov/DIRNews/2025/2025-116.html), the $264.61 minimum and $1,764.11 maximum from January 1, 2026 and the state average weekly wage
- [California DIR: Official Medical Fee Schedule physician update, Release 2026-16](https://www.dir.ca.gov/DIRNews/2026/2026-16.html), conformity to Medicare's 2026 changes, effective March 1, 2026
- [Texas Department of Insurance: Maximum and minimum weekly benefits](https://www.tdi.texas.gov/wc/employee/maxminbens.html), temporary income benefit limits for fiscal years 2026 and 2027
- [Texas Department of Insurance: Medical fee guideline conversion factors](https://www.tdi.texas.gov/wc/fee/conversionfactors.html), the 2026 conversion factors of $72.07 and $90.48
- [Texas DWC EDI (Verisk)](https://txdwcedi.info/) and the [Texas Claim EDI Release 3.1.4 Implementation Guide (PDF)](https://txdwcedi.info/documents/txedi31guide0723.pdf), the July 26, 2023 implementation, legacy claims, the 1995 Release 1.0 mandate and the rules at 28 TAC 124.100 to 124.108
- [CMS: Mandatory insurer reporting (Section 111)](https://www.cms.gov/medicare/coordination-benefits-recovery/mandatory-insurer-reporting), responsible reporting entities under 42 USC 1395y(b)(8)
- [CMS: MMSEA Section 111 NGHP User Guide v8.6, Chapter III, October 5, 2026 (PDF)](https://www.cms.gov/files/document/mmsea-111-october-5-2026-nghp-user-guide-version-8-6-chapter-iii-policy-guidance.pdf), ORM reporting from January 1, 2010, the $750 medicals-only exclusion and the TPOC thresholds by date
- [CMS: Workers' Compensation Medicare Set-Aside Arrangements](https://www.cms.gov/medicare/coordination-benefits-recovery/workers-comp-set-aside-arrangements), the $25,000 and $250,000 review thresholds and review as a recommended process

**Standards**

- [IAIABC: EDI Claims](https://www.iaiabc.org/edi-claims), Release 3.1 as the current release with its January 1, 2026 publication, and the history of Releases 1.0 and 3.0
