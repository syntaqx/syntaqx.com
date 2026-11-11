+++
title = "The Workweek & the Time Record"
nav_title = "The Time Record"
description = "The FLSA workweek, what counts as hours worked, the 29 CFR 516 record, raw punches against rounding, edits, approvals and retention."
category = "Workforce Industry"
order = 2627
part = "Time and Wage-Hour"
tags = ["payroll", "timekeeping", "flsa", "wage-and-hour", "rounding", "recordkeeping"]
+++

Every dollar an hourly worker is paid starts as a time record, and the time record is the employer's evidence when the worker says it was short. The Fair Labor Standards Act sets the frame: a nonexempt employee is owed at least the minimum wage for every hour worked and time and a half for hours over 40 in a workweek, the workweek is a fixed block of 168 hours the employer picks in advance, and the employer, not the worker, must keep the record that proves both. Everything else in this part of the volume (overtime and the regular rate, minimum wage checks, break premiums, tip credits, predictability pay, final pay) is a calculation over that record, so a time system that gets the record wrong gets every one of them wrong at once.

The hard parts are not the punches. They are the definitions around them: which minutes are "hours worked" (the wait for a part, the security line at the exit, the 10 p.m. text from a manager), which workweek an overnight shift belongs to, whether a punch at 8:53 is paid from 8:53 or from 9:00, what happens to an approved timesheet when a manager edits it after payroll ran, and how long each version has to be kept. Federal law tolerates some imprecision (rounding that averages out, a de minimis few seconds); California tolerates much less, and its Supreme Court has said so three times since 2018. This chapter covers the FLSA basics a time system encodes, the workweek, hours worked, the 29 CFR 516 record, raw punches against rounding, edits and approvals, retention, and how to build the record so that every later calculation can be reproduced. The capture devices (clocks, kiosks, geofences and biometrics) are in [Clocks, Kiosks, Geofences & Biometrics](/books/workforce/time-clocks-and-biometrics); hours worked in field service (drive time, the take-home van, waiting on site) are in [What Counts as Hours Worked](/books/field-operations/technician-workforce#what-counts-as-hours-worked) in the Field Operations volume. This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Time and attendance products capture punches and hand hours to payroll; payroll APIs accept hours, already classified or not. Their public documentation shows how each treats the record's lifecycle, as of November 2026:

| Platform | Time record | Lifecycle and edits | Rounding and raw time |
| --- | --- | --- | --- |
| **Clockify** | Time entries from timers, kiosk punches and manual entry | Time Audit flags suspicious entries; an audit log records "who changed a start time or deleted an entry" | Rounding "doesn't change any data, only how it's displayed"; rounded values appear only in reports and exports |
| **Deputy** | Timesheets with `MealbreakSlots`, a kiosk photo reference and a `ValidationFlag` (for example "clocked in far away") | Separate flags for `TimeApproved` and `PayRuleApproved`, then `Exported` and `PayStaged` ("marked as paid and locked"); `Creator`, `Modified` and `TimeApprover` on each | An `AutoRounded` flag when automatic rounding rules changed the timesheet; no separate raw and rounded fields in the API |
| **Gusto** (app integrations) | Time sheets by shift, with `shift_started_at`, `shift_ended_at` in UTC, `time_zone`, a `version`, and entries classified Regular, Overtime or Double overtime | `pending`, `rejected`, `approved`, with `synced_to_payroll_at`; a change to an already paid period needs an off-cycle payroll | The partner sends hours already classified |
| **Rippling** | Time entries with breaks, job shifts, and computed regular, overtime and double overtime hours | `DRAFT` ("Needs admin review"), `APPROVED`, `FINALIZED` ("cannot be changed or unapproved"), `PAID`; errors `cannotModifyApprovedEntry` and `cannotModifyFinalizedEntry`; an `idempotency_key` from the external system | Job shifts carry `original_start_time` and `original_end_time` beside `start_time` and `end_time` |
| **Square** | `Timecard` (renamed from `Shift` in API version 2025-05-21) with location, wage, breaks and declared cash tips | `OPEN` or `CLOSED`; "A team member can be assigned to only one `OPEN` timecard at a time"; a `version` field for optimistic concurrency | No rounding fields |
| **Toast** | `TimeEntry` with `inDate`, `outDate`, a `businessDate`, regular and overtime hours "excluding breaks," and the wage in effect when the entry was made | `autoClockedOut` when the platform clocks a worker out at the end of the business day; soft delete (`deleted`, `deletedDate`) and read-only `createdDate` and `modifiedDate` | No rounding field |
| **When I Work** | Timesheet entries from a terminal, the mobile app or manual entry | Edit history shows "when the entry was created, how it was created, any edits made to the entry, and who made the changes"; "A timesheet becomes unapproved when an edit is made to it"; closed pay periods take no changes unless reopened | Rounding to 5, 6 or 15 minutes, to the nearest increment; "To view unrounded entries, view the timesheet entry history," and exports include both; punched breaks aren't rounded |

Three patterns recur. **Approval is a state, and later states lock.** Rippling's finalized and paid states, Deputy's paid-and-locked flag and When I Work's closed pay periods all stop edits once payroll has used the hours, and When I Work drops approval when an entry changes. **The edit history is part of the product,** shown to managers and exported for disputes. And **raw time survives rounding** wherever rounding exists: When I Work keeps unrounded entries in history and exports, Clockify never rounds stored data, and Deputy flags rounded timesheets. My default is Clockify's: store the minute, round only in a derived value if at all.

## The FLSA in One Page

The rules a time system encodes come from a short list of statutory sections and regulations:

- **Minimum wage.** Covered, nonexempt employees are owed at least $7.25 an hour (29 USC 206(a)(1)(C)), and many states and cities set more ([Minimum Wage as Data](/books/workforce/minimum-wage-as-data)).
- **Overtime.** No employee may be employed "for a workweek longer than forty hours" unless paid at "a rate not less than one and one-half times the regular rate" for the excess (29 USC 207(a)(1)). The regular rate is not the hourly rate ([Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate)).
- **Records.** The employer keeps the 29 CFR 516 record for every nonexempt employee, below.
- **Exempt employees.** Executive, administrative and professional employees who meet the salary and duties tests are outside the minimum wage and overtime rules, so the time system records them for leave and attendance, not pay; the salary level is in [Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#exemptions-and-the-salary-level).
- **Child labor.** Under-18 workers have occupation and, for 14 and 15 year olds, hours limits, which is why the record needs a date of birth for anyone under 19 ([Fair Workweek & Scheduling Laws](/books/workforce/scheduling-laws#minors-hours)).

The FLSA requires no pay stub: that is state law ([Pay Frequency, Pay Statements & Final Pay](/books/workforce/pay-frequency-statements-and-final-pay#pay-statements)). It also requires no breaks, no daily overtime and no final paycheck by a date; those are state rules too, and the chapters that follow treat each as a rule set the engine layers on top of the federal floor. Where both apply, the worker gets the better of the two, so the engine computes both and pays the higher.

## The Workweek

The workweek is the unit the FLSA measures. DOL's regulation calls it "a fixed and regularly recurring period of 168 hours," seven consecutive 24-hour periods; it "need not coincide with the calendar week" and may begin on any day and at any hour; an employer can set one for the whole establishment or different ones for different employees; and once set it stays fixed even when the employee's schedule changes (29 CFR 778.105). Fact Sheet 23 adds the consequence that drives the engine: "Averaging of hours over two or more weeks is not permitted." A worker with 30 hours one week and 50 the next is owed 10 hours of overtime, though the two weeks average 40.

What that means for the record:

- **The workweek is per employee and dated.** The start day and time are a property of the employer or of the employee, with effective dates, and 29 CFR 516.2(a)(5) makes "Time of day and day of week on which the employee's workweek begins" a required record. Gusto's payroll-by-workweek API exposes it as `workweek_start_day`, changeable once per pay period; Zeal's `work_week_start` sets "a fixed, 168-hour period that consists of seven consecutive 24-hour periods" starting any day at any time; Square's labor API has a workweek configuration with a start day and a start-of-day local time.
- **A change has to be permanent and not an overtime dodge.** The start can move only if the change "is intended to be permanent" and is not designed to evade overtime (778.105), with the transition week computed under 778.301 and 778.302. A system should keep the old definition, the new one and who changed it, and refuse to change it more than the policy allows.
- **Pay periods and workweeks don't align.** A biweekly period holds two workweeks exactly only if the two share a start. A semimonthly or monthly period doesn't: the 1st to the 15th cuts a workweek in two, and the overtime for a workweek that straddles two periods is owed in the period where the workweek ends (California's DLSE says overtime wages are due by the next regular payday after they're earned). The engine keys hours by workweek, not by pay period, and pays each workweek's overtime once.
- **Overnight shifts belong to one workday.** A shift from 10 p.m. Saturday to 6 a.m. Sunday crosses the workweek boundary when the workweek starts at midnight Sunday. Hours are counted in the workweek in which they are worked, so two hours go to the old week and six to the new, and daily rules (California's eight-hour day, Nevada's 24-hour workday that begins when the employee begins work) apply to their own day definitions. An engine that assigns a whole shift to the week it started in is wrong in exactly the weeks that matter.

One exception replaces the workweek entirely: hospitals and residential care establishments may use a 14-day period under section 7(j) ([Payroll by Industry](/books/workforce/payroll-by-industry#healthcare)). That is an alternate overtime rule set on the employment, not an edit to the workweek.

## Hours Worked

"Hours worked" is a legal conclusion, and the time system's job is to record enough to reach it. The federal rules, from Part 785 and Fact Sheet 22 (revised July 2008):

| Situation | Federal rule | What the record needs |
| --- | --- | --- |
| Work suffered or permitted | Work an employer allows, even unrequested, is work time; "The reason is immaterial" | A way to report unscheduled time, and the punches showing it |
| Waiting | Paid if the employee is "engaged to wait"; unpaid if "waiting to be engaged" | Waiting as its own time kind |
| On call | On call on the premises is work; on call at home "is not working (in most cases)" | On-call periods and callouts separately |
| Rest breaks | Short rest periods "must be counted as hours worked" | Breaks as punches with their length |
| Meal periods | Unpaid only if the employee is "completely relieved from duty" | Meal punches; interruptions |
| Sleeping time | For duty of 24 hours or more, sleep may be excluded only in defined cases, and "No reduction is permitted unless at least 5 hours of sleep is taken" | Sleep periods and interruptions |
| Training and meetings | Not work only if "it is outside normal hours, it is voluntary, not job related, and no other work is concurrently performed" | Training as its own kind, with the four facts |
| Travel | "Ordinary home to work travel" is not work; a special one-day trip to another city is; overnight travel is work "when it cuts across the employee's workday" | Travel segments with their type |
| Pre- and post-shift activities | Compensable if "integral and indispensable" to the principal activities; the Supreme Court held exit security screening at a warehouse was not (*Integrity Staffing Solutions v. Busk*, December 9, 2014) | Pre-shift and post-shift activities that the employer requires, timed |
| De minimis | "insubstantial or insignificant" periods of a few seconds or minutes that can't practically be recorded may be disregarded, but not fixed or regular working time, or time the employee is regularly required to spend (785.47) | Nothing to disregard if the clock already captures it |

Field service adds the driving and waiting cases in depth (the Employee Commuting Flexibility Act, the take-home van and DOL's 2026 opinion letter on pages during a commute), which are in the Field Operations volume's [What Counts as Hours Worked](/books/field-operations/technician-workforce#what-counts-as-hours-worked). Off-the-clock messages to hourly workers are in Workplace & Collaboration's [After-Hours Messages and Wage-Hour Law](/books/workplace-and-collaboration/frontline-workers#after-hours-messages-and-wage-hour-law): under Field Assistance Bulletin 2020-5, an employer that knows or should know about the work owes for it, and a reasonable, used reporting procedure is how it shows diligence.

### California Counts More Minutes

California defines hours worked under its wage orders as time "during which an employee is subject to the control of an employer," and includes "all the time the employee is suffered or permitted to work, whether or not required to do so." Two decisions make that matter for time systems:

- **No federal de minimis rule.** In *Troester v. Starbucks* (July 26, 2018), the California Supreme Court held that the state's statutes and wage order "do not permit application of the de minimis rule" where the employer "required the employee to work 'off the clock' several minutes per shift." The closing tasks in that case (setting the alarm, locking the door, walking coworkers to their cars) took four to 10 minutes a day. The court left open time "so minute or irregular that it is unreasonable to expect the time to be recorded," but a system that captures the minutes has no such argument.
- **Exit searches are hours worked.** In *Frlekin v. Apple* (February 13, 2020), it answered that time spent on the premises "waiting for, and undergoing, required exit searches" of bags and devices brought "purely for personal convenience" is compensable under Wage Order 7, the opposite of *Busk* under federal law.

The practical rule for a multistate time system: put the clock where the employer's control begins and ends. If a badge door, a security line or a closing checklist happens after the clock-out punch, the record is short in California even where it is lawful under the FLSA.

## The Record: 29 CFR 516

The regulation lists what an employer must keep for each nonexempt employee (29 CFR 516.2(a)). It is, almost line for line, a schema:

| Item | Regulation text | Where it lives |
| --- | --- | --- |
| 1 | "Name in full, as used for Social Security recordkeeping purposes," and any identifying number used in place of the name | `persons.legal_name`, `workers.worker_number` |
| 2 | "Home address, including zip code" | `person_addresses` |
| 3 | "Date of birth, if under 19" | `persons.date_of_birth` |
| 4 | "Sex and occupation in which employed" | the person and `job_assignments.title` |
| 5 | "Time of day and day of week on which the employee's workweek begins" | `workweek_definitions` (below) |
| 6 | "Regular hourly rate of pay for any workweek in which overtime compensation is due," the basis of pay, and the amount and nature of each 7(e) exclusion | `regular_rate_calculations` ([Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#how-to-build-it)) |
| 7 | "Hours worked each workday and total hours worked each workweek" | `time_entries` by workday and workweek |
| 8 | "Total daily or weekly straight-time earnings or wages due for hours worked" | earning lines |
| 9 | "Total premium pay for overtime hours," kept apart from straight time | overtime premium lines |
| 10 | "Total additions to or deductions from wages paid each pay period," with dates, amounts and nature | deduction lines |
| 11 | "Total wages paid each pay period" | `pay_statements.gross`, `net` |
| 12 | "Date of payment and the pay period covered by payment" | `pay_statements.check_date`, `pay_periods.period` |

Items 8 and 9 are the ones systems most often get wrong: the overtime premium has to be a separate number, not folded into a single "overtime" line at time and a half. Since 2026 the same number feeds the qualified overtime deduction's W-2 code TT ([The Overtime Premium as Payroll Must Track It](/books/workforce/tips-and-the-2025-deductions#the-overtime-premium-as-payroll-must-track-it)), so the regulation and the tax form now ask for the same split.

Paragraph (c) offers a shortcut for employees on fixed schedules: the employer may keep "the schedule of daily and weekly hours the employee normally works" and mark weeks the schedule was followed, recording exact hours only in weeks that differ. Few modern systems use it, and I wouldn't: a schedule is a plan, and the exceptions are where the disputes are. Employers taking a tip credit keep more for tipped employees ([Tipped Employees](/books/workforce/tipped-employees#tip-records)), and state laws add more (New York's six-year payroll record under Labor Law 195(4), California's itemized statement record under Labor Code 226).

## Raw Punches and Rounding

The federal rule on rounding is old and short. 29 CFR 785.48(b), first promulgated in 1961, says that recording start and stop times "to the nearest 5 minutes, or to the nearest one-tenth or quarter of an hour" will be accepted for enforcement "provided that it is used in such a manner that it will not result, over a period of time, in failure to compensate the employees properly for all the time they have actually worked." Paragraph (a) adds that employees who "voluntarily come in before their regular starting time or remain after their closing time" and do no work need not be paid for that time, so early and late punches "may be disregarded."

Courts read (b) as a neutrality test. The California Supreme Court, summarizing the federal cases in *Donohue v. AMN Services* (February 25, 2021), put it this way: federal courts permit rounding policies that "on average, favor[] neither overpayment nor underpayment," and find violations where a policy "systematically undercompensate[s] employees," such as one that "encompasses only rounding down." California's Court of Appeal adopted the same test for wages in *See's Candy Shops v. Superior Court* (2012): a policy is lawful if it "is fair and neutral on its face" and, as applied, doesn't underpay over time.

Then *Donohue* drew a line inside California. Its first holding: "employers cannot engage in the practice of rounding time punches -- that is, adjusting the hours that an employee has actually worked to the nearest preset time increment -- in the meal period context." AMN's system rounded to the nearest 10 minutes, so "a 21-minute lunch from 12:04 p.m. to 12:25 p.m." was "recorded as a 30-minute lunch from 12:00 p.m. to 12:30 p.m.," and a meal that began after five hours and five minutes looked as if it began after exactly five. Its second holding: "time records showing noncompliant meal periods raise a rebuttable presumption of meal period violations, including at the summary judgment stage" (break mechanics are in [Breaks, Premiums & Attestations](/books/workforce/breaks-and-premiums)).

### Worked Numbers: Neutral on Its Face, Not as Applied

Rounding to the nearest quarter hour on the usual seven-minute rule (1 to 7 minutes past a quarter rounds down, 8 to 14 rounds up) is neutral on its face. Here is an invented week for an employee scheduled 9:00 a.m. to 5:00 p.m. whose employer's kiosk blocks clock-ins more than seven minutes early and whose closing duties run a few minutes past five:

| Day | In (raw) | In (rounded) | Out (raw) | Out (rounded) | Minutes lost |
| --- | --- | --- | --- | --- | --- |
| Monday | 8:53 | 9:00 | 5:04 | 5:00 | 7 + 4 = 11 |
| Tuesday | 8:55 | 9:00 | 5:06 | 5:00 | 5 + 6 = 11 |
| Wednesday | 8:58 | 9:00 | 5:02 | 5:00 | 2 + 2 = 4 |
| Thursday | 8:54 | 9:00 | 5:07 | 5:00 | 6 + 7 = 13 |
| Friday | 8:57 | 9:00 | 5:03 | 5:00 | 3 + 3 = 6 |
| **Week** | | | | | **45** |

Every punch rounds against the employee, because the policy's own constraints (no early clock-in beyond seven minutes, closing tasks that end a few minutes after five) put every punch on the losing side of the rounding point. Forty-five minutes a week at an invented $20.00 an hour is $15.00, about $750 over 50 weeks, $150,000 a year across 200 employees like this one, and more where the minutes fall in overtime weeks at time and a half. If the employer can show the early minutes were not work (785.48(a)), those minutes drop out; the closing minutes are work by definition.

The audit query is the same one a plaintiff's expert will run: for each employee and period, the sum of rounded minus raw minutes, with the share of employees and periods that came out negative. A neutral policy shows sums near zero with as many winners as losers; this one shows every employee losing every week.

My rule, the same as in the Field Operations volume: don't round. A modern clock records the minute, rounding saves nothing a payroll engine needs, and it creates a liability that has to be defended with statistics. If an employer insists, store the raw punch, compute the rounded value as a derived column under a named, versioned rule, never round meal or break punches, and run the neutrality report every period.

## Edits, Approvals and Locks

A time record changes after it's made: a forgotten clock-out, a punch at the wrong job, a manager adding a missed shift, a worker disputing a deduction for a meal break. The rules that keep those changes defensible:

- **An edit is a new row, not an overwrite.** The core model's `time_entries.replaces_entry_id` makes each correction a new entry pointing at the one it replaces, with who made it and when ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)). The edit carries a reason from a list and free text, and the original stays visible ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **The worker sees the edit.** An edit the worker never sees is the fact pattern of every off-the-clock case. Products show the edit history (When I Work's shows who made each change); my default goes further and notifies the worker of every manager edit and records the acknowledgment or dispute.
- **Edits that reduce time need a reason the law accepts.** Deleting a punch because "the employee wasn't authorized to work" is not one: unauthorized work that is suffered or permitted is still paid, and the remedy is discipline, not a deleted minute.
- **Approval locks the hours for a run.** The core model's `timesheets` move from `open` to `submitted`, `approved` and `locked`. Approval is the manager's statement that the hours are right; lock is payroll's statement that it used them. An edit after approval reopens the timesheet (When I Work's rule), and an edit after lock creates a correction that flows to the next run or an off-cycle run ([Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections#off-cycle-runs)); Gusto's integration docs say the same, that a change to a paid period needs an off-cycle payroll.
- **Automatic actions are edits too.** Toast's `autoClockedOut` and the auto-deducted meal break in many products both change hours without a human punch. They are records with a typed actor (the system, by a named rule), and an auto-deducted meal that wasn't taken is the most common way they go wrong.

The timesheet approval is also where a time system should run its checks before payroll sees anything: missing punches, overlapping entries, shifts over a configured length, meal periods that start late or run short, a minor scheduled outside the allowed hours, and rounding drift. Each check produces an exception a manager resolves with a reason, not a silent fix.

## Retention

Federal retention is two-tier. Three years for "all payroll or other records containing the employee information and data required" by Part 516, from the last date of entry, along with written agreements, plans and collective bargaining agreements and memoranda of oral ones (29 CFR 516.5). Two years for supplementary records: "time and earning cards or sheets," wage rate tables, order and shipping records, and records of additions to and deductions from wages (516.6). So the punches are a two-year record and the payroll built from them is a three-year one, and the cheapest correct answer is to keep the punches as long as the payroll.

States lengthen it. New York requires payroll records "for not less than six years" (Labor Law 195(4)); California requires wage statement records for "at least three years" (Labor Code 226(a)). Retention is a schedule by record type and jurisdiction, computed per record, with legal holds that suspend deletion ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)); the HR records side of it is [Employee Records, Privacy & Retention](/books/workforce/employee-records-and-privacy) in the Hiring and HR Records part.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `time_entries` stays the record of hours; new tables hold the raw punch as captured, the edits against it, rounding policies and workweek definitions. `employers` gets a default workweek; `timesheets` gets its checks.

```sql
CREATE TABLE workweek_definitions (        -- 516.2(a)(5): when each workweek begins
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),   -- null: the employer default
  start_dow           SMALLINT NOT NULL CHECK (start_dow BETWEEN 0 AND 6),   -- 0 = Sunday
  start_time          TIME NOT NULL DEFAULT '00:00',
  time_zone           TEXT NOT NULL,         -- IANA zone the 168 hours are counted in
  overtime_period     TEXT NOT NULL DEFAULT 'workweek' CHECK (overtime_period IN ('workweek',
                        'fourteen_day_7j')),
  change_reason       TEXT,                  -- 778.105: permanent, not to evade overtime
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, (COALESCE(worker_id, employer_id)) WITH =,
    valid_during WITH &&)
);

CREATE TABLE raw_punches (                 -- every punch exactly as captured, never edited
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  punch_type          TEXT NOT NULL CHECK (punch_type IN ('in', 'out', 'meal_start', 'meal_end',
                        'rest_start', 'rest_end', 'job_change')),
  punched_at          TIMESTAMPTZ NOT NULL,  -- the device's time, as captured
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- the server's time
  clock_device_id     UUID,                  -- clock_devices (Clocks, Kiosks, Geofences & Biometrics)
  source              TEXT NOT NULL CHECK (source IN ('clock', 'mobile', 'kiosk', 'web',
                        'pos', 'import')),
  job_assignment_id   UUID REFERENCES job_assignments (id),
  location            JSONB,                 -- lat, lon, accuracy, geofence result, if captured
  idempotency_key     TEXT NOT NULL,         -- device id + local sequence: offline replays dedupe
  UNIQUE (worker_id, idempotency_key)
);

ALTER TABLE time_entries
  ADD COLUMN start_punch_id   UUID REFERENCES raw_punches (id),
  ADD COLUMN end_punch_id     UUID REFERENCES raw_punches (id),
  ADD COLUMN workday          DATE,          -- the workday the hours count toward
  ADD COLUMN time_kind        TEXT NOT NULL DEFAULT 'work',
  ADD COLUMN compensable      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN rounded_hours    NUMERIC(7, 2), -- derived under rounding_rule_id; hours stays raw
  ADD COLUMN rounding_rule_id UUID,
  ADD COLUMN created_by_kind  TEXT NOT NULL DEFAULT 'worker',
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT time_entries_time_kind_check
    CHECK (time_kind IN ('work', 'travel', 'waiting', 'on_call', 'callout', 'training', 'rest',
        'meal', 'sleep', 'pre_shift', 'post_shift')) NOT VALID,
  ADD CONSTRAINT time_entries_created_by_kind_check
    CHECK (created_by_kind IN ('worker', 'manager', 'admin', 'system', 'integration')) NOT VALID;

CREATE TABLE rounding_rules (              -- named, versioned; never applied to meal punches
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  increment_minutes   SMALLINT NOT NULL CHECK (increment_minutes IN (5, 6, 15)),
  mode                TEXT NOT NULL CHECK (mode IN ('nearest', 'none')),
  applies_to          TEXT[] NOT NULL DEFAULT ARRAY['in', 'out'],
  excluded_jurisdiction_ids UUID[] NOT NULL DEFAULT '{}',   -- where the employer won't round
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE time_edits (                  -- every change to the hours, with its reason
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  new_entry_id        UUID NOT NULL REFERENCES time_entries (id),
  replaced_entry_id   UUID REFERENCES time_entries (id),   -- null when an entry is added
  edited_by           TEXT NOT NULL,
  editor_kind         TEXT NOT NULL CHECK (editor_kind IN ('worker', 'manager', 'admin',
                        'system')),
  reason_code         TEXT NOT NULL CHECK (reason_code IN ('missed_punch', 'wrong_job',
                        'added_shift', 'auto_clock_out', 'meal_not_taken', 'dispute',
                        'correction_after_payroll', 'other')),
  reason_text         TEXT,
  minutes_delta       INT NOT NULL,          -- positive adds time, negative removes it
  worker_notified_at  TIMESTAMPTZ,
  worker_response     TEXT CHECK (worker_response IN ('acknowledged', 'disputed')),
  after_lock          BOOLEAN NOT NULL DEFAULT FALSE,   -- true: flows to a correction run
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timesheet_exceptions (        -- checks run before approval
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  timesheet_id        UUID NOT NULL REFERENCES timesheets (id),
  check_code          TEXT NOT NULL,         -- 'missing_punch', 'overlap', 'late_meal',
                                             -- 'minor_hours', 'rounding_drift', ...
  detail              JSONB NOT NULL,
  resolved_by         TEXT,
  resolution          TEXT,
  resolved_at         TIMESTAMPTZ
);

ALTER TABLE employers
  ADD COLUMN default_workweek_id UUID REFERENCES workweek_definitions (id);
```

The neutrality report is a query over raw and rounded time, per employee and period:

```sql
SELECT te.worker_id,
       date_trunc('month', te.workday)                        AS month,
       SUM(te.rounded_hours - te.hours) * 60                  AS net_minutes,  -- negative: employee lost
       COUNT(*) FILTER (WHERE te.rounded_hours < te.hours)    AS entries_lost,
       COUNT(*) FILTER (WHERE te.rounded_hours > te.hours)    AS entries_gained
FROM time_entries te
WHERE te.rounding_rule_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM time_entries n WHERE n.replaces_entry_id = te.id)
GROUP BY 1, 2;
```

The timesheet is a small state machine, guarded in the database ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit)): `open` to `submitted` by the worker, `submitted` to `approved` or `rejected` by a manager after its exceptions are resolved, `approved` back to `open` on any edit, and `approved` to `locked` by the pay run that reads it. A `locked` timesheet never reopens; an edit against it is a `time_edits` row with `after_lock = TRUE` and a correction on the next run.

Design notes:

- **Two clocks on every punch.** `punched_at` is the device's claim and `received_at` is the server's; a punch from an offline kiosk can arrive hours late, and a device with a wrong clock can claim any time ([Two Clocks](/docs/building-blocks/offline-sync#two-clocks)). Flag large gaps rather than trusting either blindly.
- **Assign hours to workweeks by instant, not by shift.** Split entries at the workweek boundary in the workweek's time zone, and compute daily rules on their own day definitions.
- **Keep time kinds and compensability on the entry.** The legal call (waiting is work, on call at home usually isn't) is made per entry under a rule, recorded with the rule that decided it ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)), not reconstructed at payroll time.
- **Store the raw punch forever (for the retention period).** Rounded hours are derived; if the rule is found unlawful, the engine recomputes from raw punches.

## Auditing

A DOL Wage and Hour investigator, a state labor commissioner and a plaintiff's expert ask for the same things:

- **The 516.2 record per employee per workweek,** with the workweek definition in force, hours by workday, straight-time earnings and the overtime premium as separate numbers.
- **Raw punches beside paid hours,** with the rounding rule each entry used and the neutrality report by period.
- **Every edit with its actor, reason and the worker's response,** and every automatic action (auto clock-out, auto-deducted meal) with the rule that took it.
- **Approval and lock history** for every timesheet, and the pay run that consumed it.
- **Time kinds and compensability decisions,** so "was the waiting paid" is a query.
- **Retention by record and jurisdiction,** with holds ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).

## What This Means for the System You Build

- **Make the workweek a dated record per employee,** and key hours by workweek, not pay period.
- **Split hours at the workweek boundary** and pay each workweek's overtime exactly once, in the period where the workweek ends.
- **Record time kinds, not just punches,** and decide compensability per entry by a named rule.
- **Put the clock where control begins and ends,** because California counts the security line and the closing checklist.
- **Keep the raw punch,** derive any rounded value, never round meal punches, and run the neutrality report.
- **Treat every edit and automatic action as a new, attributed record** the worker can see.
- **Lock approved hours when payroll uses them,** and route later changes to a correction run.
- **Keep punches as long as payroll,** on the longest applicable state schedule.

## References

**Law and regulation**

- [29 USC 206: Minimum wage](https://www.law.cornell.edu/uscode/text/29/206), $7.25 an hour
- [29 USC 207: Maximum hours](https://www.law.cornell.edu/uscode/text/29/207), overtime for a workweek longer than forty hours at one and one-half times the regular rate
- [29 CFR 516.2: Employees subject to minimum wage or overtime](https://www.law.cornell.edu/cfr/text/29/516.2), the twelve required items and the fixed-schedule alternative in paragraph (c)
- [29 CFR 516.5: Records to be preserved 3 years](https://www.law.cornell.edu/cfr/text/29/516.5), payroll records, agreements and sales records
- [29 CFR 516.6: Records to be preserved 2 years](https://www.law.cornell.edu/cfr/text/29/516.6), time and earning cards, wage rate tables, and additions and deductions
- [29 CFR 778.105: Determining the workweek](https://www.law.cornell.edu/cfr/text/29/778.105), a fixed and regularly recurring 168 hours, set per establishment or employee, changed only permanently
- [29 CFR 785.47: Where records show insubstantial or insignificant periods of time](https://www.law.cornell.edu/cfr/text/29/785.47), the de minimis rule and its limits
- [29 CFR 785.48: Use of time clocks](https://www.law.cornell.edu/cfr/text/29/785.48), early and late punches and rounding that does not underpay over time
- [New York Labor Law 195: Notice and record-keeping requirements](https://www.nysenate.gov/legislation/laws/LAB/195), payroll records kept six years
- [California Labor Code 226](https://california.public.law/codes/ca_lab_code_section_226), wage statement records kept three years

**Agency guidance and forms**

- [DOL WHD: Fact Sheet 22, Hours worked under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked), suffered or permitted work, waiting, on call, breaks, sleep, training and travel
- [DOL WHD: Fact Sheet 23, Overtime pay requirements of the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay), the 168-hour workweek and no averaging across weeks
- [California DLSE: Overtime FAQ](https://www.dir.ca.gov/dlse/faq_overtime.htm), overtime due by the next regular payday

**Courts and enforcement**

- [Supreme Court of California: Donohue v. AMN Services, S253677 (PDF)](https://www4.courts.ca.gov/opinions/archive/S253677.PDF), no rounding of meal period punches, the rebuttable presumption, the 785.48(b) text and See's Candy's neutrality test
- [Supreme Court of California: Troester v. Starbucks, S234969 (PDF)](https://www4.courts.ca.gov/opinions/archive/S234969.PDF), no federal de minimis rule for regular off-the-clock minutes
- [Supreme Court of California: Frlekin v. Apple, S243805 (PDF)](https://www4.courts.ca.gov/opinions/archive/S243805.PDF), exit searches as hours worked under Wage Order 7
- [LII: Integrity Staffing Solutions v. Busk, 574 U.S. (2014)](https://www.law.cornell.edu/supremecourt/text/13-433), exit screening not compensable under the Portal-to-Portal Act and the integral and indispensable test

**Vendor documentation**

- [Clockify: Time rounding](https://clockify.me/help/track-time-and-expenses/time-rounding), rounding changes display only
- [Clockify: Time audit](https://clockify.me/help/track-time-and-expenses/time-audit), suspicious entries and the audit log of changes
- [Deputy: Timesheet](https://developer.deputy.com/docs/timesheet.md), approval and payment flags, `AutoRounded`, meal break slots, validation flags and the kiosk photo
- [Gusto: Create a time sheet](https://docs.gusto.com/app-integrations/reference/post-companies-company_uuid-time_tracking-time_sheets.md), time sheet statuses, UTC shift times and pay classifications
- [Gusto: Syncing time tracking data](https://docs.gusto.com/app-integrations/docs/syncing-time-tracking-data.md), data by shift and an off-cycle payroll for changes to paid periods
- [Gusto Embedded: Payroll by workweek](https://docs.gusto.com/embedded-payroll/docs/payroll-by-workweek.md), workweek breakdowns covering the pay period
- [Rippling: Create a time entry](https://developer.rippling.com/documentation/rest-api/guides/create-time-entry.md), draft, approved, finalized and paid statuses, original shift times and the idempotency key
- [Square: Labor API overview](https://developer.squareup.com/docs/labor-api/what-it-does), the Shift object renamed Timecard in 2025-05-21
- [Square: Build with the Labor API](https://developer.squareup.com/docs/labor-api/build-with-labor), one open timecard per team member and optimistic concurrency
- [Square: Update workweek config](https://developer.squareup.com/reference/square/labor-api/update-workweek-config), start of week and start of day
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), business date, automatic clock-out and soft delete
- [When I Work: How timesheet rounding works](https://help.wheniwork.com/articles/how-timesheet-rounding-works/), 5, 6 or 15 minute rounding and unrounded entries in history and exports
- [When I Work: Viewing the timesheet edit history](https://help.wheniwork.com/articles/viewing-the-timesheet-edit-history/), who changed what and when
- [When I Work: Approve users' timesheets](https://help.wheniwork.com/articles/approve-users-timesheets/), approval dropped on edit and closed pay periods
- [Zeal: Overtime compliance](https://docs.zeal.com/docs/overtime-compliance.md), the fixed 168-hour `work_week_start`
