+++
title = "Terminations, Offboarding & WARN"
nav_title = "Terminations & WARN"
description = "The separation fan-out, WARN counting over 30 and 90 days, state mini-WARN laws, severance and releases in payroll, unemployment claims and rehire."
category = "Workforce Industry"
order = 2640
part = "Hiring and HR Records"
tags = ["terminations", "offboarding", "warn-act", "severance", "unemployment", "hr"]
+++

A termination is one event in the HRIS and a dozen obligations everywhere else. Final pay is due on a state's deadline, sometimes the same day. Accrued vacation may be wages that must be paid out. Health coverage ends on a date the plan sets, and the employer has 30 days to tell the plan so COBRA can start. Accounts, sessions and tokens must be revoked, and the person's files handed to someone else. A garnishment issuer may need to hear that the employee is gone. The I-9 retention clock starts. If the employee files for unemployment, the state agency will ask the employer why they left, with a short deadline and a charge to the employer's unemployment account at stake. And if the termination is one of many at a site, federal and state WARN laws may have required 60 or 90 days of written notice to the employees, the state and the local government, with back pay for every day short.

The engineering lesson is that a separation is a workflow, not a status. It has an effective date, a last day worked, a reason, and a fan-out of tasks with their own owners and deadlines, and some of those tasks (WARN counts, severance releases) depend on other separations, past and planned. This chapter covers the separation workflow, WARN and state mini-WARN counting, severance and release payments in payroll, unemployment claims and responses, and rehire. Final pay timing by state is in [Pay Frequency, Pay Statements & Final Pay](/books/workforce/pay-frequency-statements-and-final-pay); COBRA's clocks are in [COBRA & State Continuation](/books/workforce/cobra); identity revocation is in Workplace & Collaboration's [Joiner, Mover, Leaver](/books/workplace-and-collaboration/provisioning-and-scim#joiner-mover-leaver).

## How the Platforms Do It

What HRIS vendors and the unemployment system publish about separations, as of November 2026:

| Platform | What it publishes |
| --- | --- |
| **HiBob** | A left lifecycle webhook that fires "once the corresponding lifecycle entry becomes effective," at midnight in the site's time zone |
| **Rippling** | An `employee.terminated` partner webhook, and changes whose `effective_on` may be in the future while `applied_on` is when they were saved |
| **UI SIDES** | A system run with the U.S. Department of Labor to "streamline the processing of unemployment insurance (UI) claims," used by "employers, third-party administrators (TPAs), and professional employer organizations (PEOs)," with six exchanges for the steps of a claim |

Two timing models again (see [How the Platforms Do It](/books/workforce/hris-record-of-truth#how-the-platforms-do-it) in [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth)): HiBob announces a termination when it takes effect, Rippling exposes it when it is recorded. Offboarding needs both: payroll has to plan final pay from the moment a termination is entered, and identity has to revoke access at the effective moment, not before. On the agency side, SIDES is how employers and their third-party administrators answer state unemployment requests electronically instead of by mail.

## The Separation Workflow

Every separation starts with four facts, and the differences between them matter:

- **Termination date.** The last day of employment, which ends benefits eligibility rules, starts the COBRA and I-9 clocks and sets the employment row's end.
- **Last day worked.** Can be earlier (a resignation with paid notice not worked, a leave that ends in termination); final pay is computed through the termination date, time through the last day worked.
- **Reason.** Voluntary, involuntary, layoff, retirement, death, end of assignment (the core model's `termination_reason`), plus a detailed reason code, which drives final pay timing in some states, unemployment responses, WARN counts and rehire eligibility.
- **Notice given.** When the employee resigned or was told, which some states' final pay rules depend on (California's deadline for a quit differs by whether the employee gave 72 hours' notice).

The fan-out, with who owns each task and what sets its deadline:

| Task | Owner | Deadline set by |
| --- | --- | --- |
| **Final pay** | Payroll | State law by separation type; federal law has none ("Employers are not required by federal law to give former employees their final paycheck immediately") |
| **PTO payout** | Payroll | State law and policy; California treats accrued vacation as wages due at separation |
| **Deductions from final pay** | Payroll | State wage deduction rules and the employee's written authorizations |
| **Benefit end dates** | Benefits | The plan (end of the termination month is common) |
| **COBRA notice to the plan** | Employer | 30 days from the qualifying event, which the plan follows with an election notice within 14 days ([The Notices and Their Clocks](/books/workforce/cobra#the-notices-and-their-clocks)) |
| **Access revocation** | IT and identity | The effective moment; minutes, not days |
| **Content and device handover** | Manager and IT | Policy |
| **Garnishment issuers** | Payroll | The order's terms ([Child Support Withholding](/books/workforce/child-support-withholding) and [Garnishments & Levies](/books/workforce/garnishments-and-levies) cover what each requires) |
| **Unemployment notices to the employee** | HR | State law in some states |
| **Separation agreement and release** | HR and legal | OWBPA's 21 or 45 days plus 7 to revoke, where age claims are released |
| **I-9 retention** | HR | Recompute: the later of hire + 3 years and termination + 1 year |
| **Final W-2 address** | Payroll | The W-2 goes to the last known address by the deadline |
| **WARN count** | HR and legal | Every employment loss at the site in the surrounding 90 days |

The foundation chapter's [Life of a Hire](/books/workforce/workforce-business#the-life-of-a-hire) walks one termination through final pay and COBRA. The pattern the table implies: a separation is a record with its own state, the tasks are rows generated from rules when the separation is entered, and each task closes with evidence (a statement, a notice, a revocation log). A termination entered in the HRIS but not yet effective generates the tasks with future deadlines; a rescinded termination cancels them.

## WARN

The Worker Adjustment and Retraining Notification Act requires written notice "60 days" before a plant closing or mass layoff, to "each representative of the affected employees" (or each affected employee if there is none), to the state's dislocated worker unit, and to the chief elected official of the local government (29 USC 2102(a)).

**Who is covered.** An employer with "100 or more employees, excluding part-time employees," or 100 or more employees, including part-time ones, who together work at least 4,000 hours a week, not counting overtime (29 USC 2101(a)(1)). A part-time employee is one "employed for an average of fewer than 20 hours per week" or who has worked fewer than 6 of the 12 months before the notice date (2101(a)(8)); the regulations measure the average over "the shorter of the actual time the worker has been employed or the most recent 90 days" (20 CFR 639.3).

**What triggers it.**

| Event | Definition |
| --- | --- |
| **Plant closing** | "the permanent or temporary shutdown of a single site of employment," or of facilities or operating units within one, causing employment losses for 50 or more employees, excluding part-time employees, in any 30-day period |
| **Mass layoff** | A reduction in force, not from a plant closing, that causes employment losses at a single site in any 30-day period for at least 33% of the employees and at least 50 employees (excluding part-time employees in both counts), or for at least 500 employees |
| **Employment loss** | "an employment termination, other than a discharge for cause, voluntary departure, or retirement," "a layoff exceeding 6 months," or "a reduction in hours of work of more than 50 percent during each month of any 6-month period" |

A transfer offered to another site "within a reasonable commuting distance" is not an employment loss (639.3(f)), and in a sale of a business the seller is responsible for notice up to the sale's effective date and the buyer after it, with the seller's employees treated as the buyer's from that moment (2101(b)(1)).

**Aggregation.** Losses that are each too small can add up. Employment losses for two or more groups at a single site that each fall below the thresholds but together exceed them, "within any 90-day period," count as a plant closing or mass layoff, unless the employer shows they came from "separate and distinct actions and causes" (2102(d)). The regulation tells employers to "Look ahead 90 days and behind 90 days" at actions taken and planned (639.5(a)(1)(ii)). So the 30-day window defines a single event, and the 90-day window catches a series.

**Reduced notice.** The period can be shortened for a faltering company actively seeking capital that would have avoided a closing, for "business circumstances that were not reasonably foreseeable as of the time that notice would have been required," and, with no notice at all, for a natural disaster; the employer still gives as much notice as is practicable, with a brief statement of why the period was short (2102(b)).

**What the notice says.** To unrepresented employees: whether the action is permanent or temporary, the expected date the closing or layoff begins and "the expected date when the individual employee will be separated," whether bumping rights exist, and a company contact (639.7(d)). To the state and the local official: the same, plus the job titles affected and "the number of affected employees in each job classification" (639.7(e)).

**What a violation costs.** Back pay for each day of violation at the higher of the employee's average regular rate over the last three years or final regular rate, plus benefits, for up to 60 days and no more than half the days the employee was employed, reduced by wages paid and voluntary unconditional payments; and up to $500 a day in civil penalties to the local government, avoided if the employer pays each aggrieved employee within three weeks of the closing or layoff (29 USC 2104). Courts can't enjoin a closing.

### Worked Numbers: Counting Over 90 Days

The facts are invented. An employer has 1,200 employees nationally. One distribution center (a single site) has 180 full-time employees and 40 part-time employees who average 15 hours a week. The employer plans:

| Date | Action | Employment losses (full-time) | Part-time also laid off |
| --- | --- | --- | --- |
| Thu, Oct 1, 2026 | Eliminate the night shift | 40 | 10 |
| Mon, Nov 16, 2026 | Close the returns department | 30 | 5 |

Each action alone: 40 losses in a 30-day window is under 50, so neither is a mass layoff, and 30 is under 50 too. Together: the two are 46 days apart, inside 90 days, so they aggregate to 70 full-time employment losses. 70 is at least 50, and 70 / 180 = 38.9% is at least 33%, so the series is a mass layoff unless the employer can show separate and distinct causes. The 15 part-time employees are excluded from the counts (they average under 20 hours), though the employer should treat them as affected employees for notice where the regulations say so.

The notice clock: the regulations count from the first termination in the aggregated window, and each group is entitled to a full 60 days. Notice for the October 1 group was due by Sunday, August 2, 2026 (60 days before, so in practice by the Friday before), and for the November 16 group by Thursday, September 17. If the employer only decided on the returns closure in October, the October group's notice is already late when the aggregation becomes clear; the regulation's look-ahead language is why HR has to count planned actions, not just completed ones.

The exposure, if no notice was given: an employee hired 80 days before October 1 can recover at most 40 days of back pay (half the days employed); a long-tenured employee earning $24.00 an hour, eight hours a day, can recover up to 60 days: by my arithmetic, counting calendar days of violation, 60 x 8 x $24.00 = $11,520 plus benefits, before offsets. Courts have differed on whether to count calendar days or workdays. The Third Circuit held in [*United Steelworkers v. North Star Steel Co.*](https://law.resource.org/pub/us/case/reporter/F3/005/5.F3d.39.93-7056.93-7026.html), 5 F.3d 39 (1993), that "a violating employer is liable for 'back pay' for each of the calendar days of the violation"; the Eighth Circuit held in *Teamsters Local 838 v. Laidlaw Transit, Inc.*, 156 F.3d 854 (1998), following *Breedlove v. Earthgrains Baking Cos.*, 140 F.3d 797 (8th Cir. 1998), that the calculation "is properly based on the number of workdays at issue, rather than on the number of calendar days." The rule depends on the circuit, so the system should report both.

## State Mini-WARN Laws

States add lower thresholds, longer notice and, in New Jersey, mandatory severance. As of November 2026:

| State | Covered employer | Trigger | Notice | Notable |
| --- | --- | --- | --- | --- |
| **California** | A "covered establishment" with 75 or more full- and part-time employees in the preceding 12 months (counting employees with at least 6 of the 12 months) | A layoff of 50 or more in 30 days "regardless of percentage of workforce," a plant closure or a relocation of at least 100 miles affecting any number, or a call center relocation abroad | 60 days, to employees, the EDD, the local workforce board and the chief elected officials of each affected city and county | "New for 2026" (SB 617): notices describe the support offered, whether the employer will coordinate services with the local workforce board, CalFresh and its helpline; up to $500 a day in civil penalties, and back pay at the higher of the final or 3-year average rate |
| **New York** | "private businesses with 50 or more full-time employees in New York State" | Closings affecting 25 or more employees, mass layoffs of 25 or more full-time employees who are at least 33% of the site, or 250 or more, plus relocations and reductions in hours | 90 days, to employees, their representatives, the DOL, the local workforce board, the chief elected official, the school district and local emergency services | Regulations clarify "how remote work impacts WARN Act compliance" |
| **Illinois** | Employers "with 75 or more full-time employees (excluding part-time workers)," per [DCEO](https://dceo.illinois.gov/workforcedevelopment/warn.html) | A plant closure, or a mass layoff at a single site of "25 or more full-time employees if they constitute one-third or more of full-time employees at the site," or "250 or more full-time employees" | "60 days advance notice" | Lower employer threshold than federal WARN; the statute is 820 ILCS 65 |
| **New Jersey** | Employers with 100 or more employees, under the 2020 amendments (P.L.2019, c.423), which NJDOL says took effect "April 10, 2023" ([NJDOL WARN page](https://www.nj.gov/labor/business-services/layoffs-and-closing/file-warn-notice/)) | A mass layoff of "50 or more of the employees at or reporting to the establishment," or a transfer or termination of operations | 90 days before the first termination, or the federal period if longer | Mandatory severance of one week of pay per full year of employment, at the higher of the 3-year average or final rate, and four more weeks if notice was short |

Run the counts per law, not once. The invented distribution center above, if it were in California, would cross California's 50-in-30-days rule only if 50 or more were laid off within 30 days (neither group alone does, and they are 46 days apart), while the federal 90-day aggregation catches the series. In New York, the 40-person night shift alone is 25 or more full-time employees and 22.2% of the site, short of 33%; the series is 70 and 38.9%, and New York's own aggregation rules decide whether it counts. The engine needs each law's thresholds, windows and headcount definitions as rules.

## Severance and Releases in Payroll

**Taxes.** Severance is wages. The Supreme Court held in *United States v. Quality Stores* (March 25, 2014) that "The severance payments at issue are taxable wages for FICA purposes," and for income tax withholding severance is a supplemental wage, withheld at the flat rate or by the aggregate method ([Flat and Aggregate, Worked](/books/workforce/supplemental-wages-and-imputed-income#flat-and-aggregate-worked)). A payment after the final regular payroll goes on an off-cycle run with its own statement, keyed to the employment it ends.

**Payment schedules.** Lump sum, salary continuation on the regular schedule, or installments. Salary continuation keeps the person on payroll as a worker with a terminated employment and a severance earning code: their benefits deductions may continue if the agreement says so, and their status in every downstream system has to say "terminated, still paid," not "active."

**Releases.** Severance is usually conditioned on a release of claims, and releasing age discrimination claims has statutory conditions (29 USC 626(f)(1), the Older Workers Benefit Protection Act). The waiver must be written so the individual can understand it, refer specifically to the ADEA, not waive future claims, give consideration beyond what the person is already owed, and advise "in writing to consult with an attorney." The individual gets "at least 21 days" to consider it, or 45 in a group exit incentive or termination program, and "at least 7 days" after signing to revoke, before which the agreement isn't effective. A group program also requires a written disclosure of the decisional unit, eligibility factors and "the job titles and ages of all individuals eligible or selected for the program," with the ages of those not selected.

### Worked Numbers: When Severance Can Be Paid

The dates are invented. An individual separation agreement is delivered on Monday, November 2, 2026, offering $15,000 of severance on a signed, unrevoked release.

| Event | Date | Rule |
| --- | --- | --- |
| Agreement delivered | Mon, Nov 2 | Consideration period starts |
| Consideration period ends | Mon, Nov 23 | At least 21 days |
| Employee signs | Tue, Nov 10 | May sign early |
| Revocation period ends | Tue, Nov 17 | At least 7 days after signing |
| Agreement effective; severance payable | Wed, Nov 18 | The day after revocation lapses |

In a group layoff the consideration period is 45 days (to Thursday, December 17 from the same delivery date), and the disclosure of ages goes with the agreement. My rule for the system: the severance payment is a scheduled off-cycle line that can't be approved until the release's revocation period has passed without a revocation recorded, and its amount is computed from the agreement's formula and frozen into the `severance_agreements` row. A New Jersey mass layoff adds the statutory severance, which isn't conditioned on a release.

## Unemployment Claims

When a former employee files for unemployment, the state agency asks the last employer, and sometimes base-period employers, about the separation and the wages. The employer's answers decide whether the claimant is eligible (a voluntary quit without good cause and a discharge for misconduct generally disqualify; a layoff doesn't), and benefits paid are generally charged to the employer's experience rating, which sets its future SUTA rate ([SUTA: State Unemployment Insurance](/books/workforce/fica-futa-and-suta#suta-state-unemployment-insurance)). Each state sets its own response deadline, and a late or missing response can forfeit the employer's chance to contest the claim and the charge.

<!-- source-gap: wf-ui-response-deadlines | missing | state deadlines for employer responses to unemployment separation requests and the consequences of a late response | closes with: state workforce agency employer pages or the DOL Comparison of State UI Laws, administration chapter | checked: 2026-11-09 -->

For a system, a claim is a notice with a respond-by date (the core model's `notices`), a case that gathers the separation's facts (reason code, documentation, final pay, severance, warnings), a response sent through SIDES or the state portal, and later the determination, appeals and the benefit charge on the next rate notice. Three design rules carry most of the value:

- **Reason codes map to the agency's questions.** A detailed separation reason entered at termination, with documentation, answers most requests without anyone reconstructing the story weeks later.
- **The deadline is computed from the request's date and the state's rule,** stored, and escalated before it passes ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Charges are reconciled.** Benefit charge statements are checked against claims the employer contested and won; an uncontested charge that should have been relieved raises the rate for years.

Some states also require the employer to give a separating employee a written notice about unemployment benefits at separation; those are tasks in the fan-out, by state.

## Rehire

A former employee who returns is a rehire: a new `employments` row on the same `workers` row, so the year's Social Security wage base and year-to-date totals continue ([The Employee Record](/books/workforce/hris-record-of-truth#the-employee-record)). Four things depend on the gap:

- **New hire reporting.** A returning employee is "newly hired" if they were separated "for at least 60 consecutive days" (42 USC 653a); a shorter gap needs no report.
- **I-9.** A new I-9 or Supplement B, under the conditions in [Onboarding: I-9, E-Verify & New Hire Reporting](/books/workforce/onboarding-i9-and-new-hires).
- **Rehire eligibility.** A flag set at separation, with a reason, and checked by the ATS when the person applies again; it should never be a free-text note.
- **Benefits and service.** Plan rules on bridging service, waiting periods and break-in-service, read from `original_hire_date` and the employment history.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `employments` already carries `termination_date` and `termination_reason`, and [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth) added `last_day_worked` and `rehire_eligible`; this chapter adds the separation record and its tasks, WARN events, severance agreements and unemployment claims.

```sql
CREATE TABLE separations (                 -- one per terminated employment
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL UNIQUE REFERENCES employments (id),
  worker_change_event_id UUID NOT NULL REFERENCES worker_change_events (id),
  termination_date    DATE NOT NULL,
  last_day_worked     DATE NOT NULL,
  notice_given_on     DATE,                  -- when the employee resigned or was told
  reason              TEXT NOT NULL,         -- employments.termination_reason
  reason_detail_code  TEXT NOT NULL,         -- maps to agency questions and WARN counting
  counts_as_employment_loss BOOLEAN NOT NULL,   -- WARN: not for cause, quit or retirement
  warn_event_id       UUID,                  -- warn_events, when part of one
  rehire_eligible     BOOLEAN NOT NULL,
  rehire_reason       TEXT,
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'complete',
                        'rescinded')),
  CHECK (last_day_worked <= termination_date)
);

CREATE TABLE separation_tasks (            -- the fan-out, generated from rules
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  separation_id       UUID NOT NULL REFERENCES separations (id),
  kind                TEXT NOT NULL,         -- 'final_pay', 'pto_payout', 'benefit_end',
                                             -- 'cobra_notice', 'access_revocation',
                                             -- 'garnishment_notice', 'ui_notice', 'release',
                                             -- 'i9_retention', 'equipment', ...
  owner               TEXT NOT NULL,
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  due_at              TIMESTAMPTZ NOT NULL,  -- same-day final pay needs a time, not a date
  rule_ref            TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('open', 'done', 'waived', 'canceled')),
  evidence_ref        TEXT,                  -- a pay statement, notice, revocation log
  completed_at        TIMESTAMPTZ
);

CREATE TABLE warn_events (                 -- a closing or layoff at a site, under one law
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  site_ref            TEXT NOT NULL,         -- the single site of employment
  law                 TEXT NOT NULL,         -- 'federal', 'ca', 'ny', 'nj', ...
  kind                TEXT NOT NULL CHECK (kind IN ('plant_closing', 'mass_layoff',
                        'relocation', 'hours_reduction', 'below_threshold')),
  count_window        DATERANGE NOT NULL,    -- the 30- or 90-day span the count covers
  site_headcount      INT NOT NULL,          -- excluding part-time, as the law defines
  employment_losses   INT NOT NULL,
  aggregated          BOOLEAN NOT NULL DEFAULT FALSE,
  separate_cause_memo_document_id UUID REFERENCES documents (id),
  notice_due_on       DATE NOT NULL,         -- per group; the earliest group's date here
  notices_sent_on     DATE,
  notice_reduction    TEXT CHECK (notice_reduction IN ('faltering_company', 'unforeseeable',
                        'natural_disaster')),
  recipients          JSONB NOT NULL,        -- employees, state unit, local official, others
  status              TEXT NOT NULL CHECK (status IN ('monitoring', 'notice_required',
                        'noticed', 'closed'))
);

ALTER TABLE separations ADD FOREIGN KEY (warn_event_id) REFERENCES warn_events (id);

CREATE TABLE severance_agreements (        -- the offer, the release and the payment terms
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  separation_id       UUID NOT NULL REFERENCES separations (id),
  document_id         UUID NOT NULL REFERENCES documents (id),
  group_program       BOOLEAN NOT NULL,      -- OWBPA: 45 days and the age disclosure
  disclosure_document_id UUID REFERENCES documents (id),
  amount              BIGINT NOT NULL,       -- cents, from the formula, frozen
  formula             JSONB NOT NULL,
  statutory_amount    BIGINT NOT NULL DEFAULT 0,   -- e.g. New Jersey mass layoff severance
  schedule            TEXT NOT NULL CHECK (schedule IN ('lump_sum', 'salary_continuation',
                        'installments')),
  delivered_on        DATE NOT NULL,
  consider_until      DATE NOT NULL,         -- 21 or 45 days
  signed_on           DATE,
  revocable_until     DATE,                  -- 7 days after signing
  revoked_on          DATE,
  effective_on        DATE,                  -- the day after revocation lapses
  pay_run_id          UUID REFERENCES pay_runs (id)
);

CREATE TABLE ui_claims (                   -- one unemployment claim and its life
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  separation_id       UUID REFERENCES separations (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  notice_id           UUID NOT NULL REFERENCES notices (id),   -- the agency's request
  claim_ref           TEXT,
  channel             TEXT NOT NULL CHECK (channel IN ('sides', 'state_portal', 'mail', 'tpa')),
  respond_by          DATE NOT NULL,
  responded_at        TIMESTAMPTZ,
  position            TEXT CHECK (position IN ('not_contested', 'contested')),
  determination       TEXT CHECK (determination IN ('eligible', 'disqualified', 'pending')),
  appeal_status       TEXT,
  charged_amount      BIGINT,                -- from the benefit charge statement
  charge_relieved     BOOLEAN
);
```

The WARN monitor is a query run before every planned separation is approved: employment losses at the site in the 90 days on each side of the planned date, counting planned and completed ones:

```sql
SELECT count(*) AS losses
FROM separations s
JOIN employments e ON e.id = s.employment_id
JOIN job_assignments ja ON ja.employment_id = e.id AND ja.is_primary
                        AND ja.valid_during @> s.last_day_worked
JOIN work_locations wl ON wl.id = ja.work_location_id
WHERE wl.id = $1                                   -- the single site
  AND s.counts_as_employment_loss
  AND s.status <> 'rescinded'
  AND e.employment_type <> 'part_time'             -- refine with the hours test
  AND s.termination_date BETWEEN $2::DATE - 90 AND $2::DATE + 90;
```

Design notes:

- **The separation is the parent; tasks are generated.** A separation entered with a future date generates tasks with future deadlines from rules for each jurisdiction; a rescinded separation cancels them all.
- **Final pay deadlines are timestamps.** Where a state requires pay at the moment of discharge, `due_at` is the termination time, and the off-cycle run has to be ready before the meeting.
- **WARN is counted, not remembered.** `warn_events` rows are produced by the monitor query per law and site, with the window and headcount that produced them, so the decision (and any separate-cause memo) can be shown later.
- **Severance waits for the release.** The off-cycle line can't be approved before `effective_on`, and a recorded `revoked_on` cancels it.
- **Unemployment claims are notices with cases.** `ui_claims.notice_id` ties the request to the core model's notice inbox, and the charge reconciliation reads the rate notice that follows ([Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts)).

## Auditing

Separations are reviewed in wage claims, WARN suits, discrimination charges, unemployment hearings and benefit audits. Wrongful termination and discrimination claims are also what employment practices liability insurance answers, and the Insurance volume's [Professional & Management Liability](/books/insurance/professional-and-management-liability) covers the policy and its claims-made dates; the defense reads the same records. Keep:

- **Each separation's facts:** termination date, last day worked, reason, notice date, who decided and the documentation.
- **Every fan-out task** with its deadline, rule and evidence, especially final pay statements against their deadlines.
- **WARN counts** for every site with separations, including below-threshold windows, the notices sent and their recipients.
- **Severance agreements** with delivery, signature, revocation dates, disclosures and the payment that followed.
- **Unemployment requests, responses, determinations and charges,** with the response time against the deadline.

## What This Means for the System You Build

- **Model a separation as a record with a fan-out of tasks,** each with an owner, a computed deadline and evidence.
- **Keep termination date, last day worked, reason and notice date as separate facts.**
- **Count WARN employment losses per site and per law,** looking 90 days back and ahead, including planned separations, before approving each one.
- **Hold severance until the release is effective,** and compute OWBPA's 21 or 45 days and 7-day revocation from the delivery and signature dates.
- **Pay severance as supplemental wages** on an off-cycle run, subject to FICA.
- **Answer unemployment requests from structured reason codes** before the state's deadline, and reconcile the charges.
- **Treat a rehire as a new employment on the same worker,** with the 60-day new hire rule and a rehire eligibility flag with a reason.

## References

**Law and regulation**

- [29 USC 2101](https://www.law.cornell.edu/uscode/text/29/2101), WARN definitions: employer, plant closing, mass layoff, employment loss, part-time employee and sale of a business
- [29 USC 2102](https://www.law.cornell.edu/uscode/text/29/2102), the 60-day notice and its recipients, reduced notice, extended layoffs and 90-day aggregation
- [29 USC 2104](https://www.law.cornell.edu/uscode/text/29/2104), back pay and benefits up to 60 days and half the days employed, offsets, the $500 daily civil penalty and no injunctions
- [20 CFR 639.3](https://www.law.cornell.edu/cfr/text/20/639.3), the employer definition, the part-time average, employment loss and transfers, and single site of employment
- [20 CFR 639.5](https://www.law.cornell.edu/cfr/text/20/639.5), notice at least 60 days before, staggered terminations and the look-ahead and look-behind 90 days
- [20 CFR 639.7](https://www.law.cornell.edu/cfr/text/20/639.7), the contents of notices to employees, the state unit and the local official
- [29 USC 626](https://www.law.cornell.edu/uscode/text/29/626), subsection (f): the conditions for a knowing and voluntary ADEA waiver, 21 and 45 days, 7-day revocation and group disclosures
- [42 USC 653a](https://www.law.cornell.edu/uscode/text/42/653a), returning employees separated at least 60 consecutive days as newly hired
- [New Jersey P.L.2019, c.423](https://pub.njleg.gov/bills/2018/PL19/423_.HTM), the 2020 amendments to the Millville Dallas Airmotive Plant Job Loss Notification Act: 100 employees, 50 losses, 90 days and mandatory severance

**Agency guidance and forms**

- [California EDD: Worker Adjustment and Retraining Notification](https://edd.ca.gov/en/jobs_and_training/Layoff_Services_WARN/), covered establishments, triggers, recipients, the 2026 notice content under SB 617 and penalties
- [New York State DOL: WARN](https://dol.ny.gov/worker-adjustment-and-retraining-notification-warn), employers with 50 or more full-time employees, 90 days, triggers, recipients and remote work
- [California DLSE: Paydays, pay periods, and the final payment of wages](https://www.dir.ca.gov/dlse/faq_paydays.htm), final pay including accrued vacation on discharge, and the quit rules with and without 72 hours' notice
- [DOL: Last paycheck](https://www.dol.gov/general/topic/wages/lastpaycheck), no federal requirement of immediate final pay
- [DOL EBSA: An Employer's Guide to Group Health Continuation Coverage Under COBRA](https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/an-employers-guide-to-group-health-continuation-coverage-under-cobra), the 30-day employer notice and 14-day election notice
- [NASWA: UI SIDES](https://www.naswa.org/uisides), the claims exchange system run with DOL for employers, TPAs and PEOs

**Courts and enforcement**

- [United States v. Quality Stores, Inc., 572 U.S. 141 (2014)](https://www.law.cornell.edu/supremecourt/text/12-1408), severance payments are taxable wages for FICA

**Vendor documentation**

- [HiBob: Employee joined webhook](https://apidocs.hibob.com/reference/post_webhook_employee-joined.md), lifecycle events, including left, fired when the entry becomes effective
- [Rippling: Webhooks](https://developer.rippling.com/documentation/developer-portal/v2-guides/webhooks.md), the employee.terminated event
- [Rippling: Worker changes](https://developer.rippling.com/documentation/rest-api/guides/worker-changes.md), effective_on and applied_on
