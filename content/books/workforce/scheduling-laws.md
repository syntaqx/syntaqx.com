+++
title = "Fair Workweek & Scheduling Laws"
nav_title = "Scheduling Laws"
description = "Fair workweek laws as rules: advance notice, predictability pay, rest between shifts, on-call shifts, minors' hours, and premiums as earning codes."
category = "Workforce Industry"
order = 2633
part = "Time and Wage-Hour"
tags = ["payroll", "scheduling", "fair-workweek", "child-labor", "wage-and-hour", "frontline"]
+++

For most of wage-hour law, the schedule doesn't matter: the employer pays for the hours worked, whenever they were planned. Fair workweek laws change that. In the cities and states that have them, the schedule is a legal record with a publish date, and changing it costs money. A manager in Oregon who adds two hours to Friday's shift a week ahead owes an extra hour of pay; one who cuts Saturday from eight hours to four owes half pay for the four not worked; a worker who closes at 11 p.m. and opens at 7 a.m. is paid time and a half for the hours inside the ten-hour rest window. A new hire is owed a written good-faith estimate of the hours they'll get. Extra hours go to current part-timers before anyone new is hired. And for a 15-year-old, federal child labor rules make the schedule itself unlawful if it puts them at work past 7 p.m. on a school night.

The rules land in two systems at once: the scheduler, which has to know them before a schedule is published and before a change is made, and payroll, which has to pay the premiums as their own earning codes, leave them out of the regular rate, and keep the records for three years. This chapter covers what the laws regulate, Oregon and Seattle in detail, the other jurisdictions, worked premiums, premiums as earning codes, on-call shifts and California's reporting time pay, minors' hours under the FLSA, and how the schedule becomes a record. Frontline scheduling apps, which system owns the schedule and after-hours messages are in the Workplace & Collaboration volume's [The Schedule Is the System of Record](/books/workplace-and-collaboration/frontline-workers#the-schedule-is-the-system-of-record) and [Predictive Scheduling Laws](/books/workplace-and-collaboration/frontline-workers#predictive-scheduling-laws). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Scheduling products differ widely in how much of the law they model publicly. As of November 2026:

| Platform | Publishing | Fair workweek model | To payroll |
| --- | --- | --- | --- |
| **Deputy** | Published rosters | A documented Fair Work Week API: "predictability pay premiums that get added when an employee's schedule is changed with reduced notice," thresholds such as `changePeriodThresholdSeconds` of 1209600 (14 days) and `restBetweenShiftsThresholdSeconds`, a `clopeningshift` field, and consent fields (`fwwcominginearly`, `fwwleavinglate`, `fwwunscheduledshiftconsent` with values like "Yes, Manager Requested" and "Yes, I requested this", `fwwagreedtoextendshift`) | Premiums appear as pay lines through `TimesheetPayReturn`, for example a pay title "Predictability Pay - Hours Increased or Changed - Less than 14 days notice" and a payroll category "SCHEDULE PREMIUM - INCREASE 14DAYS" |
| **Harri** | Schedules | "compliant, optimized schedules that factor in labor laws" (marketing) | |
| **Homebase** | Notifies "by text, email, and in the app as soon as you publish or update a schedule" | Describes predictive scheduling as requiring "advanced notice of any schedule changes" (marketing) | |
| **7shifts** | Shifts with `publish_status` of draft, published, draft_deleted or published_deleted; a Schedule Enforcement endpoint | Attendance statuses (none, sick, no_show, late, called_off, called_in, custom); compliance exceptions with a violation type and cost (examples: spread of hours, split shift) | `compliance_exceptions_pay` in worked hours and wages |
| **Square** | "Draft shift details are writable, published shift details are read only"; publishing notifies affected team members by default, all members, or nobody | None documented | |
| **When I Work** | Schedules and notifications | No fair workweek article among its scheduling help | |

Deputy's API is the most complete public model, and its shape is the one to copy: thresholds as parameters, every change classified by notice period and by who asked for it, the worker's consent captured as a field on the timesheet, and premiums emitted as distinct pay lines with their own payroll category. Square's rule that a published shift is read-only is the other half: once a schedule is published, a change is a new event, not an edit.

## What the Laws Regulate

The jurisdictions differ in coverage, numbers and exceptions, but they regulate the same handful of things:

| Element | What it requires | What the system needs |
| --- | --- | --- |
| **Coverage** | Industries (retail, food service, hospitality), employer size (often worldwide headcount), and for restaurants a location count | Employer attributes by date; the covered locations and employees |
| **Good-faith estimate** | A written estimate at hire of expected hours (Oregon: median monthly hours) and whether on-call shifts are expected | A document per hire, reissued on the jurisdiction's schedule |
| **Advance notice** | A written schedule posted a fixed number of days ahead (14 in Oregon and Seattle) | The published schedule as a dated snapshot |
| **Predictability pay** | Premium pay for employer changes inside the notice window, by kind of change | Every change with time, initiator, kind and notice given |
| **Right to decline** | Workers may decline hours not on the posted schedule | Consent per added shift or hours |
| **Rest between shifts** | A minimum gap between a closing and an opening shift (10 hours in Oregon and Seattle), with a premium for hours inside it | The gap computed at assignment, and the premium on hours worked inside it |
| **Access to hours** | Extra hours offered to current qualified employees before new hires (Seattle: posted for three days) | Offers, postings and responses |
| **Input and requests** | Workers may state availability limits and request changes; no retaliation | Requests and the employer's responses |
| **Records and notice** | Posters, records kept (Seattle: three years) | Retention by record type |

## Oregon and Seattle

The two with official pages I could open set the pattern:

| | Oregon (statewide) | Seattle (SMC 14.22, in effect since July 1, 2017) |
| --- | --- | --- |
| **Coverage** | Retail, hospitality and food service employers with "at least 500 employees worldwide"; not workers whose primary duties are outside those fields, salaried workers exempt from minimum wage, or workers supplied by leasing companies | Hourly employees at retail and food service establishments with 500 or more employees worldwide; full-service restaurants also need 40 or more full-service locations worldwide |
| **Advance notice** | Written schedule at least 14 days before its first day, including on-call shifts, posted where workers can see it | Schedules posted at least 14 days ahead |
| **Good-faith estimate** | At hire: median monthly hours, and an explanation of any voluntary standby list | At hire, annually and after significant changes: median hours and whether on-call shifts are expected |
| **Added time or changed shift** | One hour of pay at the regular rate for adding more than 30 minutes, changing a shift's time without loss of hours, or adding a shift | One hour of pay for added hours or a changed date or time |
| **Lost hours** | Half the regular rate for each scheduled hour not worked when hours are cut, a shift is canceled, or an on-call worker isn't called in | Half the hours not worked when sent home early or when an on-call shift isn't called in |
| **Rest between shifts** | No scheduling within 10 hours after a shift ends; work inside that window is paid at time and a half | Time and a half for hours worked between closing and opening shifts less than 10 hours apart |
| **Right to decline** | Workers can decline shifts not in the posted schedule | Employees can decline hours not on the original posted schedule |
| **Access to hours** | A voluntary standby list of workers who agreed in writing to take extra hours | Additional hours posted for three days and offered to qualified current employees first |
| **No premium when** | Changes from a natural disaster or similar event outside the employer's control; the worker asks for additional shifts in writing after posting; the worker accepts hours from the standby list | Exceptions in the ordinance and rules (not detailed on the city's page) |
| **Records** | Not stated on the agency's page | Three years |

The two differ in details that change code: Oregon's added-time premium needs more than 30 minutes added, Seattle's page states no minimum; Oregon's access-to-hours tool is a standby list workers opt into, Seattle's is a three-day offer to current staff before hiring. Each is a parameter of the jurisdiction's rule set, not a branch in the scheduler.

## Other Jurisdictions

New York City (fast food and retail), Chicago, Philadelphia, San Francisco (formula retail), Los Angeles city and county (retail), Emeryville, Berkeley and Evanston have their own fair workweek or secure scheduling laws, each with its own coverage thresholds, notice periods, premiums and rest-between-shifts rules. <!-- source-gap: wf-fww-other-cities | secondary | Coverage, notice periods, premium amounts and rest rules for NYC, Chicago, Philadelphia, San Francisco, Los Angeles city and county, Emeryville, Berkeley and Evanston fair workweek laws | closes with: each city's ordinance and agency rules (nyc.gov DCWP, chicago.gov, phila.gov, sf.gov OLSE, lacity.gov pages returned 403 or 404 on Nov 9-10, 2026) | checked: 2026-11-10 --> Their official pages weren't reachable when this was written, so I don't state their numbers here; the parameters a rule set needs are the same as Oregon's and Seattle's, and each value comes from the ordinance and the agency's rules. Some differ in kind, not just in number: a flat dollar premium for a clopening shift instead of time and a half, a premium scale that steps by days of notice, or a just-cause rule for discharge that sits outside scheduling entirely.

## Worked Numbers: An Oregon Fortnight

An invented employee of a covered Oregon retailer earns $18.00 an hour. The schedule for November 15 through 28, 2026 was posted on November 1, 14 days ahead. Then:

| Change | Notice | Rule | Premium |
| --- | --- | --- | --- |
| Manager adds 2 hours to the Friday, November 20 shift, decided November 13 | 7 days | One hour at the regular rate for adding more than 30 minutes | 1 × $18.00 = $18.00 |
| Manager cuts the Saturday, November 21 shift from 8 to 4 hours, decided November 18 | 3 days | Half the regular rate for each scheduled hour not worked | 4 × $9.00 = $36.00 |
| Employee picks up a Sunday shift from the voluntary standby list | | Standby list hours earn no change premium | $0.00 |
| Employee closes at 11:00 p.m. Monday, November 23 and, having agreed, opens at 7:00 a.m. Tuesday | | Time and a half for work inside the 10-hour window (7:00 to 9:00 a.m.) | 2 × $9.00 = $27.00 extra |
| **Premiums for the fortnight** | | | **$81.00** |

The clopening hours are still regular hours paid at $18.00 each; the premium is the extra half for the two hours inside the window. If the employee had asked for the Friday hours in writing after the schedule was posted, the first line would be $0.00, which is why every change records who initiated it. And the $36.00 is owed for hours the employee never worked.

## Premiums as Earning Codes

Predictability pay and rest-between-shifts premiums are wages for tax and the pay statement, but they are not pay for hours worked in the FLSA's regular rate sense. The 2019 regular rate rule says so: payments "made pursuant to state or local scheduling laws" are excluded as payments like call-back pay, including pay mandated by state or local law for employees scheduled across shifts with "fewer than the legally required number of hours between the shifts" and predictability pay for employees who "do not receive requisite notice of a schedule change" (29 CFR 778.222(c), (d)), because such a payment is "over and above the employee's earnings for the hours actually worked." Payments that are prearranged can't be excluded.

So each premium is its own pay item type: excluded from the regular rate, with no hours toward overtime, subject to income tax, Social Security and Medicare as wages, and shown on the statement with a label that says what it is. Deputy's pay title ("Predictability Pay - Hours Increased or Changed - Less than 14 days notice") is a good model for the label. For the clopening premium, the straight time for the hours worked is ordinary pay in the regular rate; only the extra half is the excluded premium.

California adds a related wage that isn't a fair workweek premium. **Reporting time pay**: when an employee reports for a scheduled shift and is put to work for less than half of it, they're owed half the scheduled day, "never less than 2 hours or more than 4 hours," at the regular rate; it "constitutes wages," but the DLSE treats it as a penalty that doesn't count toward overtime thresholds. Called back the same day for less than 2 hours of work, the employee is owed 2 hours. Exceptions include threats to people or property, civil authority, failure of utilities and acts of God; sending someone home for poor performance isn't one. Under *Ward v. Tilly's* (2019), as the DLSE summarizes it, an employee doesn't have to physically appear: being required to phone in two hours before a possible shift can trigger it. For a scheduler, that makes an on-call shift with a call-in requirement a reporting event in California.

## On-Call Shifts

On-call scheduling is where the laws bite hardest, because the old practice (schedule a pool on call and call in whoever's needed) produces lost hours by design. Oregon and Seattle require on-call shifts on the posted schedule and pay half the scheduled hours when an on-call worker isn't called in; California's reporting time pay reaches call-in requirements. Separately from scheduling law, on-call time that restricts a worker enough is itself hours worked under the FLSA ([Hours Worked](/books/workforce/time-and-attendance#hours-worked)). The scheduler needs on-call shifts as their own shift type with their own call-in deadline, and every on-call shift ends in one of three recorded outcomes: called in, released with notice, or released without, each with its premium.

## Minors' Hours

Federal child labor rules turn the schedule into a compliance boundary for workers under 16. For 14 and 15 year olds in nonagricultural work (29 CFR 570.35, summarized in Fact Sheet 43, revised December 2016):

| Limit | Rule |
| --- | --- |
| When | Outside school hours only |
| School day | "no more than 3 hours on a school day, including Fridays" |
| Non-school day | 8 hours |
| School week | "no more than 18 hours during a week when school is in session" |
| Non-school week | "no more than 40 hours during a week when school is not in session" |
| Time of day | "between 7 a.m. and 7 p.m.," with the evening limit extended to 9 p.m. from June 1 through Labor Day |

Federal law sets no hours limits for 16 and 17 year olds in nonhazardous jobs, "though many States do," and where federal and state rules both apply, "the law with the stricter standard must be obeyed." The employer already keeps the date of birth of any employee under 19 (29 CFR 516.2(a)(3)), which is the input the scheduler needs.

A worked example of my own: a 15-year-old is scheduled in an October school week for 4:00 to 7:00 p.m. Monday through Friday (15 hours) and 9:00 a.m. to 5:00 p.m. Saturday (8 hours), 23 hours in all. The weekday shifts fit (3 hours each, ending at 7:00), and Saturday's 8 hours fit the non-school day limit, but the week exceeds 18 hours, so Saturday can be no longer than 3 hours. The same Friday shift ending at 8:00 p.m. would break the time-of-day rule in October and comply in July. The scheduler blocks these at assignment; the time system flags any punch that would exceed them, because a minor who stays late is still working.

## How the Schedule Becomes a Record

Fair workweek compliance is impossible to reconstruct from the current schedule, because the current schedule is the result of all the changes the law prices. What the record needs:

- **The published schedule, frozen.** Each publication is a snapshot with its timestamp and the notice it gave; later changes don't touch it (Square's published-is-read-only rule).
- **Every change as an event.** Who initiated it (employer, employee request in writing, standby list acceptance, swap between employees), when it was decided, which shift, the kind (added time, changed time, cut, canceled, on-call released), and the notice in days.
- **Consent where the law asks.** The worker's agreement to work inside a rest window, to take unscheduled hours, or to stay late, captured from the worker, as Deputy's consent fields do.
- **Premiums computed from the events,** with the rule version, and handed to payroll as lines.
- **Estimates and offers.** Each good-faith estimate as issued, and each offer of extra hours with its posting window and responses.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Shifts are planned work; postings freeze them; changes are events with initiators; premiums tie an event to the line that paid it; minor limits are rules read against `persons.date_of_birth`. `time_entries` gets the shift it worked.

```sql
CREATE TABLE shifts (                      -- planned work, before it happens
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  work_location_id    UUID NOT NULL REFERENCES work_locations (id),
  worker_id           UUID REFERENCES workers (id),   -- null for an open shift
  job_assignment_id   UUID REFERENCES job_assignments (id),
  shift_kind          TEXT NOT NULL CHECK (shift_kind IN ('regular', 'on_call', 'standby_list')),
  scheduled           TSTZRANGE NOT NULL,
  call_in_deadline    TIMESTAMPTZ,           -- on-call shifts
  status              TEXT NOT NULL CHECK (status IN ('draft', 'published', 'changed',
                        'canceled', 'worked', 'released')),
  current_version     INT NOT NULL DEFAULT 1
);

CREATE TABLE schedule_postings (           -- each publication, frozen
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  work_location_id    UUID NOT NULL REFERENCES work_locations (id),
  covers              DATERANGE NOT NULL,    -- the dates the schedule covers
  published_at        TIMESTAMPTZ NOT NULL,
  notice_days         INT NOT NULL,          -- days between publication and the first day
  snapshot            JSONB NOT NULL,        -- every shift as published
  notified            TEXT NOT NULL CHECK (notified IN ('affected', 'all', 'none'))
);

CREATE TABLE schedule_changes (            -- every change after posting
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  shift_id            UUID NOT NULL REFERENCES shifts (id),
  posting_id          UUID NOT NULL REFERENCES schedule_postings (id),
  change_kind         TEXT NOT NULL CHECK (change_kind IN ('add_time', 'add_shift',
                        'change_time', 'cut_time', 'cancel', 'on_call_released',
                        'on_call_called_in', 'swap')),
  minutes_added       INT NOT NULL DEFAULT 0,
  minutes_lost        INT NOT NULL DEFAULT 0,
  initiated_by        TEXT NOT NULL CHECK (initiated_by IN ('employer', 'employee_written_request',
                        'standby_list', 'employee_swap', 'force_majeure')),
  worker_consent      TEXT CHECK (worker_consent IN ('consented', 'declined', 'not_asked')),
  decided_at          TIMESTAMPTZ NOT NULL,
  notice_days         NUMERIC(6, 2) NOT NULL,   -- from decided_at to the shift's start
  before              JSONB NOT NULL,
  after               JSONB NOT NULL
);

CREATE TABLE predictability_pay_events (   -- a premium the law owes for a change or a gap
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  schedule_change_id  UUID REFERENCES schedule_changes (id),
  premium_kind        TEXT NOT NULL CHECK (premium_kind IN ('change_one_hour',
                        'lost_hours_half', 'rest_between_shifts', 'reporting_time',
                        'on_call_not_called')),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  rule_version        TEXT NOT NULL,
  hours_basis         NUMERIC(6, 2) NOT NULL,   -- 1, the lost hours, or the hours in the window
  rate_multiple       NUMERIC(4, 2) NOT NULL,   -- 1.0, 0.5, 0.5 (the extra half), ...
  amount_cents        BIGINT,
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id)  -- excluded from the regular rate
);

CREATE TABLE minor_hour_limits (           -- child labor limits by jurisdiction and age, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  min_age             SMALLINT NOT NULL,
  max_age             SMALLINT NOT NULL,     -- 14 and 15 under the federal rule
  school_day_hours    NUMERIC(4, 2),         -- 3.00
  non_school_day_hours NUMERIC(4, 2),        -- 8.00
  school_week_hours   NUMERIC(5, 2),         -- 18.00
  non_school_week_hours NUMERIC(5, 2),       -- 40.00
  earliest_start      TIME,                  -- 07:00
  latest_end          TIME,                  -- 19:00
  summer_latest_end   TIME,                  -- 21:00, June 1 through Labor Day
  valid_during        DATERANGE NOT NULL
);

ALTER TABLE work_locations
  ADD COLUMN school_calendar_ref TEXT,       -- which weeks are school weeks, for minors
  ADD COLUMN fair_workweek_rule_codes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE time_entries
  ADD COLUMN shift_id UUID REFERENCES shifts (id);
```

Publishing writes a `schedule_postings` snapshot and moves shifts to `published`; every later change writes a `schedule_changes` row and bumps the shift's version, and the rule set for the location turns qualifying changes (employer-initiated, inside the notice window, not on the standby list, not force majeure) into `predictability_pay_events`. Rest-between-shifts events are computed from worked time, not the schedule: the premium is on hours actually worked inside the window. The minor check runs at assignment against every limit row for the worker's age on the shift's date and the location's jurisdictions, applying the strictest, and again on punches.

Design notes:

- **A published schedule is immutable;** changes are events with initiators and notice.
- **Premiums come from the change log,** never from comparing today's schedule to today's punches.
- **Each premium is its own pay item type,** excluded from the regular rate under 778.222, with no hours.
- **Consent is the worker's record,** captured on their device, not a manager's checkbox.
- **Minors' limits are data by jurisdiction and age,** checked at assignment and at the clock.

## Auditing

A fair workweek investigation reconstructs the schedule's history and the premiums it required:

- **Every posting** with its publication time, notice days and snapshot.
- **Every change** with its initiator, decision time, notice, before and after, consent, and the premium it produced or the exception that excused it.
- **Good-faith estimates and access-to-hours offers** as issued, with responses.
- **Predictability pay lines** paid, by worker and week, reconcilable to the changes.
- **Minors' schedules and punches** against the limits in force, with any block or override.
- **Records for the jurisdiction's period** (three years in Seattle) ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).

## What This Means for the System You Build

- **Freeze every published schedule** and treat later changes as events.
- **Record who initiated each change and when it was decided,** because the premium depends on both.
- **Hold each jurisdiction's thresholds as parameters** (notice days, minimum added minutes, rest hours, premium multiples, coverage).
- **Pay predictability and rest premiums as their own earning codes,** excluded from the regular rate.
- **Model on-call shifts explicitly** with a call-in deadline and a recorded outcome.
- **Capture the worker's consent on the worker's device** for rest-window work and unscheduled hours.
- **Check minors' hours at assignment and at the clock,** with the strictest rule winning.

## References

**Law and regulation**

- [29 CFR 778.222: Other payments similar to call-back pay](https://www.law.cornell.edu/cfr/text/29/778.222), scheduling law payments, short-gap premiums and predictability pay excluded from the regular rate unless prearranged
- [29 CFR 516.2: Employees subject to minimum wage or overtime](https://www.law.cornell.edu/cfr/text/29/516.2), date of birth for employees under 19

**Agency guidance and forms**

- [Oregon BOLI: Predictive scheduling](https://www.oregon.gov/boli/workers/pages/predictive-scheduling.aspx), coverage, 14-day notice, change premiums, rest between shifts, the good-faith estimate, the standby list and exceptions
- [Seattle Office of Labor Standards: Secure Scheduling Ordinance](https://www.seattle.gov/laborstandards/ordinances/secure-scheduling), coverage, 14-day notice, estimates, predictability pay, rest, access to hours and three-year records
- [DOL WHD: Fact Sheet 43, Child labor provisions for nonagricultural occupations](https://www.dol.gov/agencies/whd/fact-sheets/43-child-labor-non-agriculture), hours and time-of-day limits for 14 and 15 year olds and the stricter-standard rule
- [California DLSE: Reporting time pay FAQ](https://www.dir.ca.gov/dlse/faq_reportingtimepay.htm), half the scheduled day between 2 and 4 hours, exceptions, not counted toward overtime, and Ward v. Tilly's

**Vendor documentation**

- [Deputy: Fair Work Week and the Deputy API](https://developer.deputy.com/docs/fair-work-week-and-the-deputy-api.md), predictability pay lines, thresholds, clopening and consent fields
- [Harri: Manage](https://harri.ai/manage/), schedules that factor in labor laws
- [Homebase: Labor law compliance](https://joinhomebase.com/labor-law-compliance/), predictive scheduling and advance notice
- [Homebase: Employee scheduling](https://joinhomebase.com/employee-scheduling/), notifications on publish and update
- [7shifts: List scheduled shifts](https://developers.7shifts.com/reference/listscheduledshifts.md), publish and attendance statuses and schedule enforcement
- [7shifts: Get hours and wages](https://developers.7shifts.com/reference/gethoursandwages.md), compliance exceptions and their pay
- [Square: Scheduling](https://developer.squareup.com/docs/labor-api/scheduling), draft and published shifts and notification options
- [When I Work: Scheduling help](https://help.wheniwork.com/article-categories/scheduling/), its scheduling articles
