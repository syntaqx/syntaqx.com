+++
title = "FMLA Administration"
description = "FMLA eligibility from time records, the 12-week entitlement and leave year methods, notice and certification clocks, intermittent leave in hours, and records."
category = "Workforce Industry"
order = 2642
part = "Leave"
tags = ["fmla", "leave", "hr", "compliance", "wage-and-hour", "leave-administration"]
+++

The Family and Medical Leave Act gives an eligible employee up to 12 workweeks of unpaid, job-protected leave in a 12-month period for a serious health condition, the birth or placement of a child, care of a family member, or a qualifying military exigency, and up to 26 workweeks in a single 12-month period to care for a covered servicemember. The employer keeps group health coverage going on the same terms and restores the employee to the same or an equivalent job. None of that is money the payroll system pays, but nearly all of it is data the payroll and time systems already hold: whether the employee has 1,250 hours in the last 12 months is a query over time records, how much of the 12 weeks is left is a ledger in hours, and whether a notice went out within five business days is a timestamp compared with another timestamp.

The law is mostly clocks. An employer that learns leave may qualify has five business days to say whether the employee is eligible, then five more business days after it has enough information to designate the leave; the employee has 15 calendar days to return a certification and seven to fix one that's incomplete; and a failure to give a required notice can itself be interference with FMLA rights. This chapter covers coverage and eligibility, the entitlement and the four leave year methods with worked numbers, the notices and their deadlines, certification, intermittent and reduced-schedule leave tracked in hours, military leave, the interplay with the ADA, paid leave and state programs, health premiums during leave, and recordkeeping. State paid leave programs are in [State Paid Family & Medical Leave](/books/workforce/state-paid-leave); accrued sick time and PTO are in [Sick Leave & PTO Engines](/books/workforce/sick-leave-and-pto). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Payroll APIs model time off as policies, requests and balances; none of the public ones I read models an FMLA case with its eligibility test and notices. As of November 2026:

| Platform | What the public documentation exposes |
| --- | --- |
| **Gusto Embedded** | Time off policies of type vacation, sick and holiday; time off requests with approve and decline endpoints and a preview; balances per company; accrual methods including per hour worked |
| **Check** | Earning types `pto` and `sick` for paid leave hours on a payroll; no leave case object |
| **Merge (unified HRIS API)** | `TimeOff` and `TimeOffBalance` common models read from the underlying HR systems |

The pattern is consistent: the payroll side knows that hours were paid as PTO or sick time, and the protected leave case (eligibility, designation, certification, hours charged against the 12 weeks) lives in an HRIS leave module, a leave administrator or a spreadsheet. The core model's `leave_cases` table is where this volume puts it, beside the time records it's computed from, because every FMLA number is derived from hours the time system already records ([The Record: 29 CFR 516](/books/workforce/time-and-attendance#the-record-29-cfr-516)).

## Coverage and Eligibility

Two tests apply, one to the employer and one to the employee.

**Covered employer.** A private-sector employer is covered if it employs "50 or more employees in 20 or more workweeks" in the current or previous calendar year; public agencies and local educational agencies are covered regardless of size (DOL). A covered employer must post the FMLA general notice even if no employee is eligible.

**Eligible employee.** Three conditions, each measured at a specific time (29 CFR 825.110):

| Condition | Rule | Measured |
| --- | --- | --- |
| **12 months of employment** | The months "need not be consecutive"; employment before a break in service of seven years or more need not be counted, except for a break caused by USERRA-covered military service or one covered by a written agreement to rehire; for intermittent or casual employment, "52 weeks is deemed to be equal to 12 months" | As of the date the leave is to start |
| **1,250 hours of service** | In the 12 months immediately before the leave starts, "determined according to the principles established under the Fair Labor Standards Act"; any accurate accounting of actual hours worked may be used, and without accurate records "the employer has the burden of showing that the employee has not worked the requisite hours" | As of the date the leave is to start |
| **50 employees within 75 miles** | The worksite has 50 or more employees "within 75 miles of that worksite" | When the employee gives notice of the need for leave |

The 75 miles are "measured by surface miles" over public roads by the shortest route, not a straight line; the count is of "the number of employees maintained on the payroll"; and an employee who works from home or travels a territory isn't at their home: "their worksite is the office to which they report and from which assignments are made" (825.111). Once an employee is found eligible in response to a notice, a later drop in headcount doesn't take eligibility away for that leave (825.110).

The engineering consequences are specific. The 12-month test reads `employments` across rehires on the same worker, which is why a rehire is a new employment row and not a new worker ([Rehire](/books/workforce/terminations-and-warn#rehire)). The 1,250 hours are hours worked under the FLSA, a sum over `time_entries` for nonexempt employees, not hours paid: paid vacation and holiday hours aren't hours worked. For an exempt employee with no time records, the employer carries the burden, so a system that can't produce hours should treat the employee as meeting the test unless the employer has a basis to show otherwise. A USERRA return credits the hours the employee would have worked, generally from their pre-service schedule. The 50-within-75 test needs every `work_locations` row geocoded and a road distance between them, computed once per worksite pair and stored with its date.

### Worked Numbers: The Hours Test

An invented part-time employee was hired June 1, 2025 and asks on June 1, 2026 for leave starting June 15, 2026. Twelve months: met on June 15 (June 1, 2025 to June 14, 2026 is more than 12 months). Hours from June 15, 2025 through June 14, 2026, from the time records:

| Item | Hours |
| --- | --- |
| Scheduled shifts worked, 48 weeks x 25 hours | 1,200.00 |
| Overtime worked in four busy weeks | 22.50 |
| Mandatory training paid as hours worked | 16.00 |
| Paid holidays and vacation (paid, not worked) | 56.00, excluded |
| **Hours of service** | **1,238.50** |

The employee is 11.5 hours short and not eligible for FMLA leave starting June 15. The eligibility notice must say so and give at least one reason. If the employer's records were incomplete (say, the overtime came from a manager's notes instead of punches), the burden would be on the employer to show the shortfall, which is why the eligibility check stores the query it ran and the records it read.

## The Entitlement and the Leave Year

The 12 workweeks are counted in a 12-month period the employer chooses, one of four methods (29 CFR 825.200(b)):

1. **The calendar year.**
2. **Any fixed 12-month leave year,** such as a fiscal year, a year required by state law, or one starting on the employee's anniversary date.
3. **The 12 months measured forward** from the date the employee's first FMLA leave begins.
4. **A rolling 12 months measured backward** from the date the employee uses any FMLA leave.

The method must be applied consistently to all employees. Changing it takes "at least 60 days notice to all employees," and the transition must let employees keep the full 12 weeks under whichever method gives them the greater benefit; if the employer never selected one, "the option that provides the most beneficial outcome for the employee will be used" (825.200(d), (e)). Military caregiver leave runs on its own clock: 26 workweeks "during a single 12-month period" measured forward from the first day of that leave, with all FMLA leave for any reason capped at a combined 26 workweeks in that period (825.200(f), (g)).

### Worked Numbers: Four Methods, One Employee

An invented employee took 12 weeks of FMLA leave from Monday, October 5 through Sunday, December 27, 2026, and asks for more starting Monday, January 4, 2027.

| Method | Available on January 4, 2027 | Why |
| --- | --- | --- |
| **Calendar year** | 12 weeks | A new year began January 1; the employee could take 24 consecutive weeks across the year-end |
| **Fixed year starting July 1** | 0 weeks until July 1, 2027 | The 12 weeks were used in the year July 1, 2026 to June 30, 2027 |
| **Forward from first use** | 0 weeks until October 5, 2027 | The period began October 5, 2026 |
| **Rolling backward** | 0 weeks; each week used in late 2026 becomes available again 12 months after it was used | On January 4, 2027 the 12 months back include all 12 weeks |

The calendar year is the simplest to explain and the most generous at the edges, which is why employers that care about stacking choose the rolling method; the rolling method is also the hardest to compute, because the available balance changes every day as old usage falls out of the window. In code, that's a sum over the usage ledger for the 12 months before the day in question:

```go tab="Go"
type Usage struct {
	Day   time.Time // a day leave was taken
	Hours float64   // FMLA hours charged that day
}

// RollingAvailable returns FMLA hours available on day under the rolling
// method: the entitlement minus hours used in the 12 months before day.
func RollingAvailable(usage []Usage, day time.Time, weeklyHours float64) float64 {
	windowStart := day.AddDate(-1, 0, 0)
	used := 0.0
	for _, u := range usage {
		if u.Day.After(windowStart) && u.Day.Before(day) {
			used += u.Hours
		}
	}
	return math.Max(0, 12*weeklyHours-used)
}
```

```rust tab="Rust"
use chrono::{Months, NaiveDate};

pub struct Usage {
    pub day: NaiveDate, // a day leave was taken
    pub hours: f64,     // FMLA hours charged that day
}

/// FMLA hours available on `day` under the rolling method: the entitlement
/// minus hours used in the 12 months before `day`.
pub fn rolling_available(usage: &[Usage], day: NaiveDate, weekly_hours: f64) -> f64 {
    let window_start = day - Months::new(12);
    let used: f64 = usage
        .iter()
        .filter(|u| u.day > window_start && u.day < day)
        .map(|u| u.hours)
        .sum();
    (12.0 * weekly_hours - used).max(0.0)
}
```

The entitlement is in workweeks, and hours are how a system counts them; the conversion depends on the employee's normal schedule, covered next.

## Intermittent and Reduced-Schedule Leave

Leave can be taken in blocks, intermittently (separate absences for one reason, such as treatments) or as a reduced schedule. Intermittent leave for a serious health condition is available when medically necessary; for bonding with a new child, only if the employer agrees (DOL). The counting rules are in 29 CFR 825.205:

- **Increment.** Leave is counted in the shortest increment the employer's payroll system uses for other forms of leave, "not greater than one hour." An employee can't be charged FMLA leave for time they're working.
- **Physical impossibility.** Where an employee can't start or end work mid-shift (the regulation's examples are a flight attendant and a railroad conductor), "the entire period that the employee is forced to be absent is designated as FMLA leave."
- **Fraction of a workweek.** Only leave actually taken counts: 8 hours off in a 40-hour week is one-fifth of a workweek. For part-time and variable schedules the entitlement is pro rata, and an employer may convert to hours if the conversion fairly reflects the employee's normal hours.
- **Varying schedules.** Where the schedule varies so much that the hours the employee would have worked can't be determined, use "a weekly average of the hours scheduled over the 12 months prior to the beginning of the leave period."
- **Overtime.** Required overtime the employee misses for an FMLA reason counts: an employee normally scheduled for 48 hours who works 40 uses 8 hours, one-sixth of a week. "Voluntary overtime hours that an employee does not work due to an FMLA-qualifying reason may not be counted."

### Worked Numbers: The 12 Weeks in Hours

Three invented employees, each with intermittent leave for treatments:

| Employee | Normal workweek | Entitlement in hours | Usage | Remaining |
| --- | --- | --- | --- | --- |
| Full-time | 40 hours | 12 x 40 = 480 | 3 hours twice a week for 10 weeks = 60 | 420 |
| Part-time | 24 hours | 12 x 24 = 288 | Same 60 | 228 |
| Full-time with required overtime | 48 hours | 12 x 48 = 576 | Same 60 | 516 |

If the full-time employee's schedule later drops to 30 hours, the remaining entitlement is reconverted at the new schedule rather than carried in hours: 420 / 40 = 10.5 weeks left, which is 10.5 x 30 = 315 hours. That is why the ledger stores both the hours charged and the workweek fraction each charge represents. A payroll system that records sick time in quarter-hours must count FMLA in quarter-hours too, because the increment is the shortest one "used to account for use of other forms of leave."

## Notices and Their Deadlines

The notices are where most administrative liability sits, because "failure to follow the notice requirements set forth in this section may constitute an interference with, restraint, or denial of the exercise of an employee's FMLA rights" (29 CFR 825.300(e)), with remedies including lost compensation and benefits, other actual monetary losses, and equitable relief such as reinstatement.

| Notice | When | Content |
| --- | --- | --- |
| **General notice** | Posted where employees and applicants can see it (electronic posting is enough), and also in a handbook or given to each new hire where employees are eligible; a willful posting violation carries a civil money penalty, which the regulation's text states as "not to exceed $216 for each separate offense" | The FMLA's provisions and how to file a complaint |
| **Eligibility notice** | Within five business days, "absent extenuating circumstances," after the employee requests leave or the employer learns the leave may qualify | Whether the employee is eligible and, if not, at least one reason; may be oral or written (DOL's optional Form WH-381) |
| **Rights and responsibilities notice** | With each eligibility notice, in writing | How leave counts against the entitlement, certification requirements, substitution of paid leave, premium payments during leave, key employee status, benefit and restoration rights, and liability for premiums if the employee doesn't return |
| **Designation notice** | Within five business days after the employer has enough information to decide whether the leave qualifies (often, after the certification) | Whether the leave is designated FMLA leave, any fitness-for-duty requirement, and the amount of leave counted against the entitlement, in hours, days or weeks, if known (Form WH-382) |
| **Amount of leave counted** | Where it isn't known at designation (unforeseeable intermittent leave), on request, no more than once in 30 days and only if leave was taken in that period | Hours, days or weeks charged |

The notice of the amount of leave counted may be oral, but an oral one must be confirmed in writing "no later than the following payday," or the subsequent payday if the next one is less than a week away (825.300(d)(6)). That rule ties an HR deadline to the pay schedule, which is a reason to compute it from `pay_periods` rather than type it.

### Worked Numbers: One Case's Clocks

An invented employee tells a manager on Monday, November 2, 2026 that they need surgery and six weeks off. Counting business days as Monday through Friday except federal holidays (Veterans Day, Wednesday, November 11, and Thanksgiving, Thursday, November 26):

| Event | Date | Rule |
| --- | --- | --- |
| Employer learns the leave may qualify | Mon, Nov 2 | The clock starts |
| Eligibility and rights and responsibilities notices due | Mon, Nov 9 | Five business days: Nov 3, 4, 5, 6, 9 |
| Certification requested with the notices | Mon, Nov 9 | Within five business days of the employee's notice (825.305); due back Tuesday, November 24, 15 calendar days later |
| Certification received, incomplete; deficiency notice sent | Fri, Nov 20 | Written notice of what's missing; the cure is due Friday, November 27, seven calendar days later |
| Complete certification received | Mon, Nov 23 | Enough information to designate |
| Designation notice due | Tue, Dec 1 | Five business days: Nov 24, 25, 27, 30, Dec 1 |

The business-day calendar is the employer's to define, and a system should store which calendar it used with each computed deadline; the regulation doesn't define "business day," and an employer that counts the Friday after Thanksgiving as a business day gets an earlier deadline than one that doesn't ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Certification

An employer may require medical certification of a serious health condition. The timing rules (29 CFR 825.305):

- **The request.** Generally at the time the employee gives notice or within five business days after; for unforeseen leave, within five business days after the leave starts. The employer may ask later if it has reason to question the leave's appropriateness or duration.
- **The response.** The employee provides the certification "within 15 calendar days after the employer's request," unless that's not practicable despite diligent, good-faith efforts, or the employer allows more time.
- **The cure.** If a certification is incomplete or insufficient, the employer must give the employee "seven calendar days" to cure it, unless that's not practicable despite diligent, good-faith efforts.
- **Later certifications.** Where the need for leave lasts beyond one leave year, the employer may require a new certification each leave year, subject to the authentication, clarification and second and third opinion rules in 825.307.

DOL publishes optional forms for each kind of certification: WH-380-E (the employee's serious health condition), WH-380-F (a family member's), WH-384 (qualifying exigency), WH-385 (a current servicemember's serious injury or illness) and WH-385-V (a veteran's), alongside WH-381 and WH-382 for the notices. Certifications are medical records: they're kept "as confidential medical records in separate files/records from the usual personnel files" (825.500(g)), which in a system means a separate store with its own access list, not a document type in the personnel file ([Medical and Genetic Information](/books/workforce/employee-records-and-privacy#medical-and-genetic-information)).

## Military Leave

The FMLA has two military provisions, and a third law touches its eligibility test:

- **Qualifying exigency leave.** Up to 12 workweeks, within the regular entitlement, for qualifying exigencies arising from a family member's military duty, certified on WH-384 (DOL).
- **Military caregiver leave.** Up to 26 workweeks "during a single 12-month period" to care for a covered servicemember or veteran with a serious injury or illness, with all FMLA leave capped at 26 combined in that period (825.200(f), (g)).
- **USERRA service counts toward eligibility.** Time away for USERRA-covered service counts toward the 12 months, and the employee gets credit for the hours they would have worked, generally from their pre-service schedule (825.110).

The caregiver period is the one place the leave year method doesn't apply: it's always measured forward from the first day of that leave, so a system using the rolling method for everything else needs a second, forward-measured window per caregiver case.

## The ADA, Paid Leave and State Leave

FMLA leave rarely runs alone. Three interactions decide what's counted and what's paid:

- **The ADA.** The FMLA doesn't displace anti-discrimination laws; the two "are different concepts, and must be analyzed separately." Leave as a reasonable accommodation under the ADA isn't capped at 12 weeks, reinstatement to the same job under the ADA can be a greater right than the FMLA's equivalent job, and the employer must "provide leave under whichever statutory provision provides the greater rights to employees" (29 CFR 825.702). An exhausted FMLA balance is the start of an ADA conversation, not the end of the case, which is why `leave_cases.program` allows an `ada_accommodation` case to follow an `fmla` one.
- **Paid leave.** "Generally, FMLA leave is unpaid leave." The employee may elect to substitute accrued paid leave, and if they don't, the employer may require it; the substituted paid leave runs concurrently. The employee must meet the paid leave policy's procedural rules only to get paid, and losing the pay doesn't lose the FMLA protection. Leave under a disability plan or workers' compensation can be designated FMLA leave, but because it isn't unpaid, neither side can require substitution of paid leave while benefits are paid, though they may agree to supplement them (29 CFR 825.207). In payroll terms: a PTO hour paid during an FMLA absence is a `leave_ledger` usage entry and a `pay_statement_lines` earning, tagged with the leave case.
- **State leave laws.** Where an absence qualifies under both, "the leave used counts against the employee's entitlement under both laws," and nothing in the FMLA supersedes a state law providing greater rights (29 CFR 825.701). The regulation's own example is a state allowing 16 weeks over two years: an employee can take 16 weeks in one year under state law and 12 the next under the FMLA, but never 28 in one year. State paid leave programs (wage replacement funded by payroll contributions) usually run concurrently with FMLA leave and pay benefits from a state fund, not the payroll; [State Paid Family & Medical Leave](/books/workforce/state-paid-leave#benefit-coordination-and-job-protection) covers coordination.

A pending federal change touches this chapter at the edge: the Department of Labor's February 27, 2026 proposed rule on employee or independent contractor status (91 FR 9932) would extend its test to the FMLA as well as the FLSA, which would change who counts toward the 50 employees. As of November 2026 it hasn't been finalized ([Worker Classification](/books/workforce/worker-classification#the-dol-economic-reality-test)).

## Group Health Premiums During Leave

The employer keeps group health coverage going during FMLA leave, and the employee keeps paying their share, which turns an HR obligation into a deduction problem (29 CFR 825.210):

- **During paid leave,** "the employee's share of premiums must be paid by the method normally used during any paid leave," which is the ordinary payroll deduction on the substituted PTO or sick pay.
- **During unpaid leave,** there's no paycheck to deduct from. The employer picks a method and gives advance written notice of it: payment due when the payroll deduction would have been, on the COBRA schedule, prepaid through a cafeteria plan at the employee's option, under the employer's existing unpaid leave rules (which can't require prepayment for FMLA leave), or another arrangement both agree to, such as larger deductions before a foreseeable leave. "No additional charge may be added to the employee's premium payment for administrative expenses."
- **A late payment.** Unless a policy gives longer, the employer's obligation to maintain coverage can end when a payment is "more than 30 days late," after written notice mailed "at least 15 days before coverage is to cease" (825.212). An employer that keeps coverage going by paying the missed employee share may recover it from the employee.
- **An employee who doesn't return.** The employer may recover its own share of premiums paid during unpaid FMLA leave, unless the employee doesn't return because of a continuing or new serious health condition or other circumstances beyond their control, and may do so "through deduction from any sums due to the employee," such as unpaid wages or vacation pay, within federal and state wage payment law (825.213).

In the core model, the employee's share during unpaid leave is a `deduction_elections` row whose arrears rule decides what happens when no pay exists ([Arrears and Catch-Up](/books/workforce/deductions#arrears-and-catch-up)), the payment terms and any delinquency letter are `leave_notices` rows, and a recovery at separation is a deduction on the final pay statement checked against the state's final pay and deduction rules.

## Recordkeeping

Employers keep FMLA records "for no less than three years" and make them available to DOL on request (29 CFR 825.500). For employers with eligible employees, the records are:

- **Basic payroll and identifying data:** name, address, occupation, rate of pay, hours worked per pay period, deductions and total compensation.
- **Dates of FMLA leave,** designated as FMLA leave in the records, and, for leave in "increments of less than one full day," the hours.
- **Copies of employee notices** of leave and of the notices the employer gave, which may be kept in personnel files.
- **Documents describing employee benefits** or policies on paid and unpaid leave.
- **Premium payments** for employee benefits.
- **Records of any dispute** with an eligible employee over designation of leave as FMLA leave, with the reasons each side gave.

Medical certifications and histories are confidential medical records in separate files, and where the ADA also applies its confidentiality rules govern; supervisors may be told about necessary work restrictions and accommodations, and first aid and safety personnel may be told when a condition might need emergency treatment.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). The core's `leave_cases` holds the case; this chapter adds the eligibility check, the notices, the certifications and the usage ledger in hours, and reads `time_entries`, `employments` and `work_locations` for eligibility.

```sql
ALTER TABLE employers
  ADD COLUMN fmla_covered            BOOLEAN NOT NULL DEFAULT FALSE,  -- 50+ in 20+ workweeks
  ADD COLUMN fmla_leave_year_method  TEXT CHECK (fmla_leave_year_method IN ('calendar',
                                       'fixed_year', 'forward_from_first_use', 'rolling_backward')),
  ADD COLUMN fmla_fixed_year_start   DATE,          -- for 'fixed_year': the anchor date
  ADD COLUMN fmla_method_notice_on   DATE;          -- 60 days' notice before a change

ALTER TABLE leave_cases
  ADD COLUMN reason                  TEXT CHECK (reason IN ('own_health', 'family_health',
                                       'birth_bonding', 'placement_bonding', 'qualifying_exigency',
                                       'military_caregiver')),
  ADD COLUMN schedule_kind           TEXT CHECK (schedule_kind IN ('continuous', 'intermittent',
                                       'reduced_schedule')),
  ADD COLUMN normal_weekly_hours     NUMERIC(5, 2), -- the conversion basis, re-set on schedule change
  ADD COLUMN caregiver_period        DATERANGE,     -- forward-measured 12 months for caregiver leave
  ADD COLUMN substitution            TEXT CHECK (substitution IN ('none', 'employee_elected',
                                       'employer_required', 'disability_plan', 'workers_comp'));

CREATE TABLE fmla_eligibility_checks (     -- one per notice of need; reproducible
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  leave_case_id       UUID NOT NULL REFERENCES leave_cases (id),
  leave_starts_on     DATE NOT NULL,         -- 12-month and 1,250-hour tests as of this date
  notice_on           DATE NOT NULL,         -- 50-within-75 test as of this date
  months_employed     NUMERIC(5, 2) NOT NULL,  -- across employments, minus 7-year breaks
  hours_of_service    NUMERIC(8, 2),         -- null when no records: burden on the employer
  hours_source        TEXT NOT NULL CHECK (hours_source IN ('time_entries', 'schedule_estimate',
                        'userra_credit', 'no_records')),
  worksite_id         UUID NOT NULL REFERENCES work_locations (id),  -- the reporting office
  employees_within_75 INT NOT NULL,          -- by surface miles, from the payroll count
  eligible            BOOLEAN NOT NULL,
  ineligible_reasons  TEXT[],                -- at least one when not eligible
  inputs_snapshot     JSONB NOT NULL,        -- the queries and rows read
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leave_notices (               -- every notice given, with its clock
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  leave_case_id       UUID NOT NULL REFERENCES leave_cases (id),
  kind                TEXT NOT NULL CHECK (kind IN ('eligibility', 'rights_responsibilities',
                        'designation', 'amount_counted', 'certification_deficiency',
                        'oral_amount_confirmation', 'premium_payment_terms',
                        'premium_delinquency', 'state_program')),
  triggered_on        DATE NOT NULL,         -- request, knowledge or sufficient information
  due_on              DATE NOT NULL,         -- computed from the rule and the calendar
  business_calendar   TEXT NOT NULL,         -- which holidays counted
  given_at            TIMESTAMPTZ,
  method              TEXT CHECK (method IN ('oral', 'written', 'electronic')),
  document_id         UUID REFERENCES documents (id),  -- WH-381, WH-382 or the employer's own
  late_reason         TEXT                   -- extenuating circumstances, if any
);

CREATE TABLE leave_certifications (        -- stored apart from personnel files
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  leave_case_id       UUID NOT NULL REFERENCES leave_cases (id),
  form                TEXT NOT NULL,         -- 'WH-380-E', 'WH-380-F', 'WH-384', 'WH-385', ...
  kind                TEXT NOT NULL CHECK (kind IN ('initial', 'recertification',
                        'second_opinion', 'third_opinion', 'fitness_for_duty')),
  requested_on        DATE NOT NULL,
  due_on              DATE NOT NULL,         -- 15 calendar days after the request
  received_on         DATE,
  deficiency_noted_on DATE,
  cure_due_on         DATE,                  -- seven calendar days
  status              TEXT NOT NULL CHECK (status IN ('requested', 'received', 'insufficient',
                        'sufficient', 'not_provided')),
  medical_document_id UUID                   -- in the confidential medical store
);

CREATE TABLE intermittent_leave_usage (    -- the FMLA ledger in hours and fractions
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  leave_case_id       UUID NOT NULL REFERENCES leave_cases (id),
  day                 DATE NOT NULL,
  hours               NUMERIC(6, 2) NOT NULL CHECK (hours > 0),
  increment_hours     NUMERIC(4, 2) NOT NULL,  -- the smallest increment used for other leave
  week_fraction       NUMERIC(6, 5) NOT NULL,  -- hours / normal_weekly_hours at the time
  required_overtime   BOOLEAN NOT NULL DEFAULT FALSE,  -- voluntary overtime never counts
  time_entry_id       UUID REFERENCES time_entries (id),  -- the absence as the clock saw it
  leave_ledger_id     UUID REFERENCES leave_ledger (id),  -- paid leave substituted, if any
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The entitlement is a query, never a stored balance: sum `week_fraction` over the window the employer's method defines (or the case's `caregiver_period`), subtract from 12 (or 26), and convert back to hours at the current `normal_weekly_hours`. Creating a case runs the eligibility check and computes the eligibility and rights notices' `due_on`; a received certification sets the designation notice's clock; and a monitor lists every notice and certification approaching its due date.

Design notes:

- **Eligibility is a reproducible query** over employments, time entries and worksites, stored with its inputs.
- **Count leave in workweek fractions, display it in hours,** and reconvert when the schedule changes.
- **Use the payroll's smallest leave increment** for FMLA, never a larger one.
- **Compute every notice and certification deadline** with the business calendar it used.
- **Keep certifications out of the personnel file,** in a separate store with its own access.
- **Tie substituted paid leave to the case,** so a PTO hour paid during FMLA leave is both a ledger entry and a designated hour.

## Auditing

A DOL investigation or an interference claim asks:

- **Eligibility as of the right dates,** with the hours and headcount behind it, for every request, including the ones found ineligible.
- **Every notice with its trigger, due date and delivery,** and any late notice with its reason.
- **Every certification request, receipt, deficiency and cure,** with the calendar dates.
- **Hours charged by day,** with the increment and the schedule basis, and required versus voluntary overtime.
- **The leave year method in force** and the 60-day notice of any change.
- **Group health premiums during leave** and any dispute over designation, with each side's reasons.
- **Three years of all of it,** with medical records kept separately.

## What This Means for the System You Build

- **Compute FMLA eligibility from time records** and employment history, as of the leave start and the notice dates.
- **Geocode worksites and store road distances** for the 50-within-75 test, with remote employees at their reporting office.
- **Implement all four leave year methods** and a separate forward window for military caregiver leave.
- **Track leave in the payroll's smallest increment** and as fractions of the employee's normal workweek.
- **Generate notices on clocks** and alert before each five-business-day deadline.
- **Link paid leave, state program benefits and ADA cases** to the FMLA case they run beside.
- **Collect the employee's health premium share during unpaid leave** by a noticed method, with the 30-day grace period and 15-day letter as clocks.
- **Keep medical certifications in a separate, access-controlled store.**

## References

**Law and regulation**

- [29 CFR 825.110: Eligible employee](https://www.law.cornell.edu/cfr/text/29/825.110), 12 months, the seven-year break rule, 1,250 hours under FLSA principles, the employer's burden and the timing of each test
- [29 CFR 825.111: Determining whether 50 employees are employed within 75 miles](https://www.law.cornell.edu/cfr/text/29/825.111), surface miles, the payroll count and the reporting office as a remote employee's worksite
- [29 CFR 825.200: Amount of leave](https://www.law.cornell.edu/cfr/text/29/825.200), the four leave year methods, 60 days' notice of a change, the most beneficial method by default and the military caregiver period
- [29 CFR 825.205: Increments of FMLA leave for intermittent or reduced schedule leave](https://www.law.cornell.edu/cfr/text/29/825.205), the one-hour maximum increment, physical impossibility, workweek fractions, varying schedules and overtime
- [29 CFR 825.207: Substitution of paid leave](https://www.law.cornell.edu/cfr/text/29/825.207), employee election and employer requirement, disability plans and workers' compensation
- [29 CFR 825.210: Employee payment of group health benefit premiums](https://www.law.cornell.edu/cfr/text/29/825.210), payment by the paid leave method, the options during unpaid leave and no administrative surcharge
- [29 CFR 825.212: Employee failure to pay health plan premium payments](https://www.law.cornell.edu/cfr/text/29/825.212), the 30-day grace period, 15 days' written notice and recovery of the employee share
- [29 CFR 825.213: Employer recovery of benefit costs](https://www.law.cornell.edu/cfr/text/29/825.213), recovery of the employer's premiums when an employee doesn't return, the exceptions and deduction from sums due
- [29 CFR 825.300: Employer notice requirements](https://www.law.cornell.edu/cfr/text/29/825.300), the general, eligibility, rights and responsibilities and designation notices, the $216 posting penalty, written confirmation of an oral amount-counted notice by the following payday, and interference
- [29 CFR 825.305: Certification, general rule](https://www.law.cornell.edu/cfr/text/29/825.305), five business days to request, 15 calendar days to provide, seven to cure and annual recertification
- [29 CFR 825.500: Recordkeeping requirements](https://www.law.cornell.edu/cfr/text/29/825.500), three-year retention, required records and confidential medical files
- [29 CFR 825.701: Interaction with State laws](https://www.law.cornell.edu/cfr/text/29/825.701), concurrent counting and the 16-weeks-over-two-years example
- [29 CFR 825.702: Interaction with Federal and State anti-discrimination laws](https://www.law.cornell.edu/cfr/text/29/825.702), the ADA analyzed separately and whichever provision gives greater rights
- [Federal Register: Employee or Independent Contractor Status Under the FLSA, FMLA and MSPA, 91 FR 9932 (proposed rule, February 27, 2026)](https://www.federalregister.gov/api/v1/documents/2026-03962.json), the proposal that would extend the contractor test to the FMLA

**Agency guidance and forms**

- [DOL WHD: Family and Medical Leave Act](https://www.dol.gov/agencies/whd/fmla), covered employers, eligibility, 12 and 26 workweeks, intermittent leave and health benefits (last updated January 26, 2026)
- [DOL WHD: Forms](https://www.dol.gov/agencies/whd/forms), the optional FMLA forms WH-380-E, WH-380-F, WH-381, WH-382, WH-384, WH-385 and WH-385-V

**Vendor documentation**

- [Gusto Embedded: Time off policies](https://docs.gusto.com/embedded-payroll/docs/time-off-policies.md), vacation, sick and holiday policy types
- [Gusto Embedded: Accrual methods](https://docs.gusto.com/embedded-payroll/docs/accrual-methods.md), per-hour-worked and other accrual methods and their fields
- [Gusto Embedded: LLM index](https://docs.gusto.com/embedded-payroll/llms.txt), time off request endpoints (create, preview, approve, decline) and company balances
- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), the `pto` and `sick` earning types
- [Merge: Unified API index](https://docs.merge.dev/merge-unified/llms.txt), the `TimeOff` and `TimeOffBalance` common models
