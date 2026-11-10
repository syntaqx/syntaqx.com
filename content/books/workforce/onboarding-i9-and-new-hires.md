+++
title = "Onboarding: I-9, E-Verify & New Hire Reporting"
nav_title = "I-9 & New Hires"
description = "Form I-9 editions and timing, remote examination, reverification and retention, E-Verify cases and mismatches, state new hire reports and the W-4."
category = "Workforce Industry"
order = 2638
part = "Hiring and HR Records"
tags = ["onboarding", "form-i9", "e-verify", "new-hire-reporting", "compliance", "hr"]
+++

Onboarding is where an accepted offer becomes a worker payroll can pay, and three federal clocks start on the first day. The Form I-9 must be completed in two parts within days of the start, with the employee's documents examined in person or, for employers in E-Verify, by live video. If the employer uses E-Verify, a case must be created by the third business day and closed whatever the result. And the employer, or its payroll provider, must report the hire to a state directory within 20 days, which is how child support agencies find a parent's new employer. Around those clocks sit the forms payroll needs before the first check: the federal and state W-4s, the bank account for direct deposit, and the state notices an employer must hand a new hire.

Each of these is a document with a version, a deadline computed from the start date, and a retention date computed from the start and end of employment. The I-9 in particular outlives the job: it is kept until the later of three years after hire and one year after termination, and an inspection asks for every one, on the right edition, completed on time. This chapter covers the I-9 (editions, Section 1 and Section 2 timing, the remote alternative procedure, reverification and retention), E-Verify cases and mismatches, state new hire reporting, and the onboarding packet. The hire event that starts it all comes from [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth#joiner-mover-and-leaver-events); the W-4 calculation is in [Federal Withholding & the W-4](/books/workforce/federal-withholding).

## How the Platforms Do It

What I-9 and onboarding vendors publish, as of November 2026:

| Vendor | Product | What it publishes |
| --- | --- | --- |
| **Equifax** | I-9 HQ and I-9 Anywhere | I-9 HQ is "an industry-leading electronic I-9 management platform" that "integrates with E-Verify"; I-9 Anywhere uses authorized representatives to complete Section 2 for remote hires |
| **Mitratech** | Tracker I-9 | "Smart workflows submit eligible I-9 records automatically to E-Verify," a network of "300 Remote I-9 Centers," "detailed audit trails" and an API to HR systems |

Two models of remote Section 2 show up across vendors and in the rules. One uses an authorized representative, a person who examines the documents in person on the employer's behalf (a notary, a vendor's network location, a colleague); the employer remains liable for what the representative does. The other is DHS's alternative procedure, a live video examination, available only to employers enrolled in E-Verify. Equifax's I-9 Anywhere and Mitratech's remote centers are the first model; electronic I-9 systems support the second as a checkbox and a document upload. Payroll and HCM suites generally offer electronic I-9 completion inside onboarding and connect to E-Verify through it.

## Form I-9

### Editions

USCIS's current edition is dated **01/20/25**. Two versions with the 08/01/23 edition date were also acceptable, one "valid until its expiration date of 07/31/2026" and one "valid until its expiration date of 05/31/2027," and employers using an electronic I-9 had to update their systems to the version expiring 05/31/2027 by 07/31/2026 (USCIS's page, last updated June 3, 2026). As of November 2026, then, a new I-9 is completed on the 01/20/25 edition or the 08/01/23 version that expires 05/31/2027, and the 07/31/2026 version is no longer acceptable. The edition belongs on the document record (`documents.form_version` in the core model) because an inspection checks it, and the system has to stop offering an edition on the day it expires.

### Section 1 and Section 2

| Step | Who | Deadline | Rules |
| --- | --- | --- | --- |
| **Section 1** | The employee | "no later than the employee's first day of employment" | Only after the offer is accepted; the SSN is voluntary unless the employer uses E-Verify; the employer may not ask for documents to support Section 1; a preparer or translator signs Supplement A |
| **Section 2** | The employer or its authorized representative | "within three business days of the date employment begins" | The employee chooses which acceptable documents to present (one from List A, or one from List B and one from List C); the employer examines originals in person or by the alternative procedure |
| **Short jobs** | The employer | For employment of fewer than three business days, Section 2 is due "no later than the first day of employment" | |

Two engineering consequences follow. The Section 1 deadline is the first day of work, so onboarding should offer Section 1 as soon as the offer is accepted and block the first shift (or at least flag it) if it isn't done. And the employer may not specify which documents an employee presents, so the onboarding flow must let the employee choose from the lists and must not, for example, require a driver's license or ask for a "green card" because of the answer in Section 1; a request "for more or different documents than are required," or a refusal of documents that "reasonably appear to be genuine," is an unfair immigration-related employment practice when made with the intent of discriminating (8 USC 1324b(a)(6)), and a flow that asks every noncitizen for a specific card is the pattern that draws the charge.

### The Remote Alternative Procedure

DHS's "Optional Alternative 1 to the Physical Document Examination Associated With Employment Eligibility Verification (Form I-9)" (88 FR 47749, published July 25, 2023) made remote examination available from August 1, 2023. USCIS's page sets the conditions:

- **Who.** "If you participate in E-Verify in good standing, you are qualified to remotely examine," at E-Verify hiring sites, applied consistently at a site (an employer may limit it to remote hires, but not for a discriminatory reason).
- **How.** Review copies of the documents, then a "live video interaction" in which the employee presents the same documents, then "Retain a clear and legible copy of the documentation (front and back...)."
- **Marking.** Check the alternative procedure box in Section 2 of the 08/01/23 or 01/20/25 edition, or in Supplement B for a rehire or reverification.

For a system this is three records: the eligibility test (enrolled in E-Verify, in good standing, at that hiring site, with a consistent site policy), the evidence (copies front and back, kept with the I-9), and the E-Verify case that must follow, because an employer using the alternative procedure is by definition an E-Verify employer for that site.

### Reverification and Rehires

Some employees' work authorization expires; most never does. USCIS: "Reverification is never required for U.S. citizens or noncitizen nationals," and an expiring U.S. passport, passport card, Permanent Resident Card or any List B document doesn't trigger reverification. Other noncitizens "may require reverification" when their employment authorization expires, recorded in Supplement B. A reverification is a dated obligation on the I-9 record, computed from the expiration the employee entered in Section 1 or the document in Section 2, with reminders before it and a decision on the date (continued employment requires new evidence of authorization).

Rehires have a three-year window. "If you rehire employees within three years from the date you completed their previous Form I-9," the employer may record the rehire in Supplement B of that form or complete a new I-9, and "Employees rehired three years after you originally completed their Form I-9 must complete a new Form I-9" (M-274 section 6.2). Either way the rehire's I-9 is tied to the new employment and its own retention clock, so the window is a date comparison on the prior I-9's completion date.

### Retention

USCIS's M-274: keep each I-9 "three years after the date of hire" or "one year after the date employment ends, whichever is later," on "paper, microfilm or microfiche, or electronically." The rule is a formula, and it is the one most often implemented wrong (as "three years after termination," which over-retains, or "one year after termination," which under-retains for short jobs).

### Worked Numbers: Clocks and Retention

All dates are invented. An employee accepts an offer and starts work for pay on Wednesday, November 4, 2026, at an employer open Monday through Friday.

| Obligation | Rule | Date |
| --- | --- | --- |
| Section 1 | By the first day of employment | Wed, Nov 4, 2026 |
| Section 2 | Within three business days of the start | Mon, Nov 9 (Thu 5, Fri 6, Mon 9) |
| E-Verify case | "no later than the third business day after the employee starts work for pay" | Mon, Nov 9 |
| New hire report | Not later than 20 days after hire, unless the state sets a shorter deadline | Tue, Nov 24 |

Retention for three separations, by the formula max(hire + 3 years, termination + 1 year), my arithmetic:

| Hire | Termination | Hire + 3 years | Termination + 1 year | Keep until |
| --- | --- | --- | --- | --- |
| Nov 4, 2026 | Feb 26, 2027 | Nov 4, 2029 | Feb 26, 2028 | **Nov 4, 2029** |
| Mar 2, 2020 | Nov 13, 2026 | Mar 2, 2023 | Nov 13, 2027 | **Nov 13, 2027** |
| Jul 6, 2025 | Jul 3, 2028 | Jul 6, 2028 | Jul 3, 2029 | **Jul 3, 2029** |

The first is a short job (hire governs); the second a long one (termination governs); the third crosses over at almost exactly three years. While employment continues, the I-9 can't be purged at all, so `retention_until` is null until a termination date exists, and recomputed if the termination date is corrected. A rehire with a new I-9 starts a new record; one completed in Supplement B extends the existing record to the new employment.

```go tab="Go"
// I9RetentionUntil returns the last day an I-9 must be kept: the later of
// three years after hire and one year after termination. With no termination,
// it returns false: the form is kept while employment continues.
func I9RetentionUntil(hire time.Time, terminated *time.Time) (time.Time, bool) {
	if terminated == nil {
		return time.Time{}, false
	}
	byHire := hire.AddDate(3, 0, 0)
	byTerm := terminated.AddDate(1, 0, 0)
	if byTerm.After(byHire) {
		return byTerm, true
	}
	return byHire, true
}

// AddBusinessDays counts forward n business days from start, skipping
// weekends and the given holidays (dates normalized to midnight UTC).
func AddBusinessDays(start time.Time, n int, holidays map[time.Time]bool) time.Time {
	d := start
	for n > 0 {
		d = d.AddDate(0, 0, 1)
		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday || holidays[d] {
			continue
		}
		n--
	}
	return d
}
```

```rust tab="Rust"
use chrono::{Datelike, Months, NaiveDate, Weekday};
use std::collections::HashSet;

/// The later of three years after hire and one year after termination;
/// None while employment continues.
pub fn i9_retention_until(hire: NaiveDate, terminated: Option<NaiveDate>) -> Option<NaiveDate> {
    let term = terminated?;
    let by_hire = hire.checked_add_months(Months::new(36))?;
    let by_term = term.checked_add_months(Months::new(12))?;
    Some(by_hire.max(by_term))
}

/// Count forward n business days, skipping weekends and holidays.
pub fn add_business_days(start: NaiveDate, mut n: u32, holidays: &HashSet<NaiveDate>) -> NaiveDate {
    let mut d = start;
    while n > 0 {
        d = d.succ_opt().expect("date in range");
        if matches!(d.weekday(), Weekday::Sat | Weekday::Sun) || holidays.contains(&d) {
            continue;
        }
        n -= 1;
    }
    d
}
```

`AddBusinessDays(Nov 4, 3, none)` returns Monday, November 9, matching the table. A hire on February 29 is the edge case: Go's `AddDate` normalizes February 29, 2027 to March 1, while chrono's `checked_add_months` clamps to February 28; pick one rule, document it, and use the later date when in doubt, since keeping a form one extra day is harmless and purging it early is not.

### Penalties

The Justice Department's inflation-adjusted civil penalties, for penalties assessed after July 3, 2025 on violations after November 2, 2015, are $288 to $2,861 per individual for paperwork violations and $716 to $5,724 per unauthorized worker for a first order on knowingly hiring or continuing to employ (28 CFR 85.5). Paperwork penalties are per form, which is why a missing Section 2 date or an expired edition across a workforce adds up, and why the records below keep every timestamp.

## E-Verify

E-Verify compares the I-9's information against DHS and SSA records. Participation is voluntary for most private employers; federal contracts and some state laws require it. The case rules:

- **Timing.** Create the case from a completed I-9 "no later than the third business day after the employee starts work for pay."
- **Photo matching.** For a Permanent Resident Card, an Employment Authorization Document, a U.S. passport or passport card, E-Verify shows the photo on file for the employer to compare.
- **Results.** Employment Authorized (closed automatically); E-Verify Needs More Time; Tentative Nonconfirmation (Mismatch); Case in Continuance; Close Case and Resubmit; Final Nonconfirmation.
- **Closing.** The employer must take every case to a final result and close it.

The mismatch process is a workflow with its own clock. The employer reviews the Further Action Notice with the employee "in private," gives them a copy, and records whether they will take action. An employee who takes action has "eight federal government working days" after the referral to contact DHS or visit an SSA office. Until the case reaches Final Nonconfirmation, the employer "may not terminate, suspend, delay training, withhold or lower pay" because of the mismatch. If the employee chooses not to take action, the case "can be treated as a Final Nonconfirmation," and the employer may close it and end employment.

The federal government working day is a different calendar from the employer's business day: it excludes federal holidays but not the employer's own closures, and an engine that computes both needs two calendars. Veterans Day (November 11) is the usual trap in the fall.

## State New Hire Reporting

Federal law requires every employer to report each newly hired employee to the State Directory of New Hires (42 USC 653a):

- **Who is new.** An employee who has never worked for the employer, or who has been "separated from such prior employment for at least 60 consecutive days."
- **What.** The employee's "name, address, and social security number," the date services for pay were first performed, and the employer's name, address and identifying number. Most states accept the W-4 as the report and publish optional fields of their own.
- **When.** "not later than 20 days after the date the employer hires the employee," or a shorter deadline the state sets. Electronic filers may instead send two monthly transmissions "not less than 12 days nor more than 16 days apart."
- **Where, for multistate employers.** An employer with employees in two or more states that reports electronically may designate one state for all its reports and must notify HHS in writing.
- **Penalties.** A state may impose up to $25 per failure, or up to $500 when the failure comes from a conspiracy between employer and employee.

<!-- source-gap: wf-onb-state-new-hire | missing | state new hire reporting deadlines shorter than 20 days, optional fields and independent contractor reporting by state | closes with: OCSE's state new hire reporting requirements chart or each state directory's page | checked: 2026-11-09 -->

The report feeds child support enforcement directly. The state must enter it within five business days of receipt, forward it to the National Directory of New Hires within three business days of entry, and, where the employee owes support, send the employer an income withholding notice within two business days of entry. So an employer that reports on day 20 can receive a withholding order within weeks of a hire, and the payroll system has to be ready to apply it from the next pay date ([Child Support Withholding](/books/workforce/child-support-withholding) covers the order). A payroll provider files new hire reports for its clients from the hire event; the report is a `filings` row with `form = 'new_hire'` and the worker as a `filing_lines` row, so it is tracked like any other filing, with its due date and acknowledgment.

For the two-transmission option, the arithmetic is the constraint: an employer that sends on the 1st and the 15th of each month (14 days apart) meets the 12-to-16-day rule, while one that sends on the 1st and the 20th (19 days) doesn't. A hire on November 4 entered after the November 15 file closed would ride the December 1 file, 27 days after hire. The federal twice-monthly option allows that, while the per-hire rule would have made the same report late, so the engine has to know which method each state account is on and check each hire against it.

## The Onboarding Packet

What a new hire completes or receives besides the I-9 is a mix of federal, state and employer items, each a document with a version, an acknowledgment and a due date:

- **Form W-4.** Employers "Ask all new employees to give you a signed Form W-4 when they start work"; without one, the employee is withheld as single or married filing separately with no adjustments ([Invalid, Missing and Replacement Forms](/books/workforce/federal-withholding#invalid-missing-and-replacement-forms)). The W-4 becomes a `tax_elections` row from its receipt.
- **State withholding forms** where the state has its own, or where the employee lives in one state and works in another ([State Forms in Brief](/books/workforce/federal-withholding#state-forms-in-brief), [Reciprocity Agreements](/books/workforce/multi-state-and-remote-work#reciprocity-agreements)).
- **Direct deposit.** A bank account, verified before the first credit, and the split across accounts (`bank_accounts`, `pay_distributions`); new accounts are also where payroll fraud starts, so a change shortly after onboarding deserves scrutiny ([Payroll Fraud & Security](/books/workforce/payroll-fraud-and-security) covers it). The rail-level details are in Payments' [ACH](/books/payments/ach).
- **State notices at hire.** Many states require written notices at hiring (wage rate and payday notices, paid leave and workers' compensation notices, and in New York a notice of electronic monitoring "upon hiring," which Workplace & Collaboration covers in [United States](/books/workplace-and-collaboration/employee-monitoring-and-privacy#united-states)). Each is a template by state, a delivery record and often a signed acknowledgment.
- **Benefits enrollment** in the new hire window ([Enrollment & Life Events](/books/workforce/enrollment-and-life-events) covers it).
- **Employer policies** (handbook, confidentiality, arbitration agreements), each with a signed version.

My rule for the packet: each item is a task with an owner (employee, HR, manager), a deadline computed from the start date and the rule that sets it, and a document it produces. The first payroll checks the tasks that payroll depends on (W-4, bank account, state forms) and pays with defaults where the law provides them, rather than holding the worker's pay.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). The I-9 form itself is a `documents` row (`kind = 'i9'`, `form_version`, `retention_until`); this chapter adds the I-9's structured record and its clocks, E-Verify cases, new hire reports and onboarding tasks.

```sql
CREATE TABLE i9_records (                  -- one per employment (or extended by Supplement B)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  document_id         UUID NOT NULL REFERENCES documents (id),   -- the form as completed
  form_edition        TEXT NOT NULL,         -- '01/20/25', '08/01/23 (exp 05/31/2027)'
  first_day_of_employment DATE NOT NULL,
  section1_completed_at TIMESTAMPTZ,
  section1_due_on     DATE NOT NULL,         -- the first day of employment
  section2_completed_at TIMESTAMPTZ,
  section2_due_on     DATE NOT NULL,         -- three business days, or day one for short jobs
  examination_method  TEXT CHECK (examination_method IN ('in_person', 'authorized_representative',
                        'alternative_procedure')),
  document_lists      TEXT NOT NULL CHECK (document_lists IN ('list_a', 'list_b_and_c')),
  document_copy_ids   UUID[] NOT NULL DEFAULT '{}',   -- required for the alternative procedure
  work_authorization_expires_on DATE,        -- null when reverification is never required
  reverify_by         DATE,
  retention_until     DATE,                  -- null while employed; max(hire + 3y, term + 1y)
  CHECK (examination_method <> 'alternative_procedure' OR cardinality(document_copy_ids) > 0)
);

CREATE TABLE i9_supplements (              -- A (preparers) and B (reverification, rehire)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  i9_record_id        UUID NOT NULL REFERENCES i9_records (id),
  supplement          TEXT NOT NULL CHECK (supplement IN ('a_preparer', 'b_reverification',
                        'b_rehire')),
  employment_id       UUID REFERENCES employments (id),   -- the rehire's new employment
  completed_at        TIMESTAMPTZ NOT NULL,
  alternative_procedure BOOLEAN NOT NULL DEFAULT FALSE,
  detail              JSONB NOT NULL
);

CREATE TABLE everify_cases (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  i9_record_id        UUID NOT NULL REFERENCES i9_records (id),
  case_number         TEXT UNIQUE,
  hiring_site         TEXT NOT NULL,
  create_by           DATE NOT NULL,         -- third business day after work for pay starts
  created_at          TIMESTAMPTZ,
  late_reason         TEXT,                  -- E-Verify asks when a case is created late
  status              TEXT NOT NULL CHECK (status IN ('draft', 'employment_authorized',
                        'needs_more_time', 'tentative_nonconfirmation', 'case_in_continuance',
                        'close_case_and_resubmit', 'final_nonconfirmation', 'closed')),
  fan_reviewed_at     TIMESTAMPTZ,           -- Further Action Notice reviewed in private
  employee_decision   TEXT CHECK (employee_decision IN ('take_action', 'no_action')),
  referred_at         TIMESTAMPTZ,
  contact_agency_by   DATE,                  -- eight federal government working days
  closure_reason      TEXT,
  closed_at           TIMESTAMPTZ
);

CREATE TABLE new_hire_reports (            -- one per hire per state directory
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),   -- the receiving state
  designated_state    BOOLEAN NOT NULL DEFAULT FALSE,   -- multistate single-state election
  method              TEXT NOT NULL CHECK (method IN ('per_hire', 'twice_monthly')),
  due_on              DATE NOT NULL,         -- 20 days or the state's shorter rule
  rule_ref            TEXT NOT NULL,
  filing_id           UUID REFERENCES filings (id),     -- the batch it went in
  status              TEXT NOT NULL CHECK (status IN ('pending', 'filed', 'accepted', 'rejected',
                        'not_required')),
  not_required_reason TEXT                   -- e.g. rehire within 60 consecutive days
);

CREATE TABLE onboarding_tasks (            -- every packet item with its owner and clock
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  kind                TEXT NOT NULL,         -- 'i9_section1', 'i9_section2', 'w4', 'state_w4',
                                             -- 'direct_deposit', 'state_notice', 'policy', ...
  owner               TEXT NOT NULL CHECK (owner IN ('employee', 'hr', 'manager', 'provider')),
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  template_ref        TEXT,                  -- the notice or form version
  due_on              DATE NOT NULL,
  rule_ref            TEXT NOT NULL,
  blocks_payroll      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at        TIMESTAMPTZ,
  document_id         UUID REFERENCES documents (id)
);
```

The daily compliance sweep is one query per clock. Every open I-9 whose Section 2 is late:

```sql
SELECT e.worker_id, r.section2_due_on
FROM i9_records r
JOIN employments e ON e.id = r.employment_id
WHERE r.section2_completed_at IS NULL
  AND r.section2_due_on < CURRENT_DATE;
```

Design notes:

- **Due dates come from the start date and a calendar.** `section2_due_on` and `create_by` use the employer's business days; `contact_agency_by` uses federal government working days; `due_on` for new hire reports uses the state's rule; all are stored with the rule that set them ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Retention is recomputed on every termination change.** A corrected termination date, a rehire under Supplement B or a legal hold changes `i9_records.retention_until` and the `documents.retention_until` it feeds.
- **No adverse action on a pending mismatch.** A termination or pay reduction for a worker whose `everify_cases.status` is `tentative_nonconfirmation` or `case_in_continuance` is blocked unless HR records an unrelated reason.
- **I-9 data stays out of the personnel file.** The I-9, its copies and the E-Verify case are kept together and separately from the employee's general file, with access limited to the people who complete and audit them ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).
- **New hire reports reuse filings.** The report is a filing with lines, so acknowledgment, rejection and resubmission work as for any other return.

## Auditing

I-9s are inspected by ICE on a Notice of Inspection, E-Verify use is monitored by USCIS, and new hire reporting is audited by state child support agencies. Keep:

- **Every I-9 on its edition,** with Section 1 and Section 2 timestamps, the examination method, document copies where kept or required, supplements, and the computed retention date.
- **Every E-Verify case** with its creation date against its deadline, the late reason, the Further Action Notice review, the employee's decision, referral dates and closure.
- **Every new hire report** with its due date, the method, the filing it went in and the acknowledgment.
- **Every onboarding task and acknowledgment,** including state notices by template version.
- **The purge log:** which I-9s were destroyed, when, under which retention computation, and which were held.

## What This Means for the System You Build

- **Track the I-9 edition and stop offering one on its expiry date.**
- **Compute Section 1, Section 2 and E-Verify deadlines from the first day of work,** on the employer's business-day calendar, and flag them before they pass.
- **Let the employee choose documents from the lists,** and never ask for specific documents.
- **Gate the alternative procedure on E-Verify enrollment at the site,** and keep the copies it requires.
- **Implement retention as max(hire + 3 years, termination + 1 year),** null while employed, recomputed on every change.
- **Run E-Verify mismatches as a workflow with federal-working-day clocks,** and block adverse action while they are pending.
- **File new hire reports from the hire event,** to the state or the designated state, within 20 days or the state's shorter rule, and be ready for the withholding order that may follow.
- **Make every packet item a task with an owner, a computed deadline and a document.**

## References

**Law and regulation**

- [42 USC 653a](https://www.law.cornell.edu/uscode/text/42/653a), new hire reporting: newly hired employees including 60-day rehires, data elements, the 20-day deadline and twice-monthly option, multistate designation, penalties, state entry and transmission, and withholding notices
- [8 USC 1324b](https://www.law.cornell.edu/uscode/text/8/1324b), paragraph (a)(6): requests for more or different documents, or refusing genuine-looking ones, with intent to discriminate
- [28 CFR 85.5](https://www.law.cornell.edu/cfr/text/28/85.5), inflation-adjusted civil penalties for I-9 paperwork and knowing-hire violations assessed after July 3, 2025
- [Federal Register: Optional Alternative 1 to the Physical Document Examination (2023-15533)](https://www.federalregister.gov/api/v1/documents/2023-15533.json), 88 FR 47749, published July 25, 2023, available from August 1, 2023

**Agency guidance and forms**

- [USCIS: Form I-9](https://www.uscis.gov/i-9), the 01/20/25 edition, the two 08/01/23 versions and their expirations, and the electronic system update deadline
- [USCIS: M-274, Completing Section 1 of Form I-9](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/30-completing-section-1-of-form-i-9), the first-day deadline, offer acceptance, the voluntary SSN, Supplement A and no document requests
- [USCIS: M-274, Completing Section 2](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/40-completing-section-2-employer-review-and-verification), three business days and short jobs
- [USCIS: M-274, Completing Supplement B](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/60-completing-supplement-b-reverification-and-rehire-of-form-i-9), who is never reverified and which expiring documents don't trigger it
- [USCIS: M-274, 6.2 Reverifying or Updating Employment Authorization for Rehired Employees](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/60-completing-supplement-b-reverification-and-rehire-of-form-i-9/62-reverifying-or-updating-employment-authorization-for-rehired-employees), the three-year window for Supplement B on a rehire
- [USCIS: M-274, Retaining Form I-9](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/100-retaining-form-i-9), the retention rule and storage media
- [USCIS: Remote examination of documents](https://www.uscis.gov/i-9-central/remote-examination-of-documents), E-Verify good standing, live video, copies front and back and the Section 2 box
- [E-Verify: Verification process](https://www.e-verify.gov/employers/verification-process), the third-business-day case, photo matching, case results and closing every case
- [E-Verify: Tentative nonconfirmations (mismatches)](https://www.e-verify.gov/employers/verification-process/tentative-nonconfirmations-mismatches), the private Further Action Notice review, eight federal government working days, no adverse action and Final Nonconfirmation
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), asking new employees for a signed W-4 and withholding without one

**Vendor documentation**

- [Equifax: I-9 Management](https://workforce.equifax.com/solutions/i-9-management), I-9 HQ with E-Verify integration and I-9 Anywhere's authorized representatives
- [Mitratech: Tracker I-9](https://mitratech.com/products/tracker-i-9-compliance/), automatic E-Verify submission, remote I-9 centers, audit trails and the HR system API
