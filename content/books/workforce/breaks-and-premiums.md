+++
title = "Breaks, Premiums & Attestations"
nav_title = "Breaks & Premiums"
description = "Meal and rest breaks as rules: California premiums as wages, attestations and waivers, other states, PUMP Act breaks, and how time systems enforce them."
category = "Workforce Industry"
order = 2631
part = "Time and Wage-Hour"
tags = ["payroll", "breaks", "california", "meal-periods", "wage-and-hour", "timekeeping"]
+++

Federal law requires no meal or rest breaks for adults. It only says what happens to pay when breaks are given: a short rest break is paid work time, and a meal period is unpaid only if the employee is completely relieved of duty. The states that do require breaks set the clock (a meal before the end of the fifth hour, ten minutes per four hours, a second meal after ten hours), and California attaches a price to missing one: an additional hour of pay at the regular rate of compensation for each workday a meal period isn't provided, and another for rest, paid as wages on the next check and shown on the wage statement. Since 2021, a California time record that shows a short or late meal is presumed to be a violation unless the employer can show it paid the premium or provided the break and the employee chose to work through it.

That makes the time system the first line of defense and the main exhibit. It has to know, from raw punches, when each break was due, whether it was taken, for how long, whether a waiver applied, and what the employee said about it, and turn that into premium lines without a payroll clerk's judgment in the loop. This chapter covers California's meal and rest periods, the premium and why it is wages, attestations and waivers, other states' rules, lactation breaks under the PUMP Act, premiums and the regular rate, and how a time system enforces and records all of it. Breaks in field service (routes with no room for the rest period, lunch in the van) are in the Field Operations volume's [Breaks by State](/books/field-operations/technician-workforce#breaks-by-state); rounding of meal punches is in [Raw Punches and Rounding](/books/workforce/time-and-attendance#raw-punches-and-rounding). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Time and payroll products model breaks as typed intervals inside a shift, and differ on whether they model what went wrong. As of November 2026:

| Platform | Break model | Missed, waived and attested | Premiums |
| --- | --- | --- | --- |
| **Check** | Breaks arrive as hours | | No meal or rest premium earning type; `rest_and_recovery` is an hourly type for "Uninterrupted breaks in which the employee can not be required to work but must be compensated for" |
| **Deputy** | `MealbreakSlots` on each timesheet define the start and end of meal and rest breaks | Fair workweek fields `fwwreceivedallmealbreaks` and `fwwreceivedallrestbreaks`, marked "California Only" | Through pay rules |
| **Homebase** | Break tracking at the clock | "Break management & waivers" | Missed-break pay "calculated automatically" (marketing description) |
| **Rippling** | Breaks with start, end and a break type; must fall inside the entry, not overlap, and the worker must be assigned to the break policy | | |
| **Square** | `BreakType` per location with a name, an expected duration such as `PT30M` and `is_paid`; "You can only have three `BreakType` instances per location" | | None in the API |
| **Toast** | `TimeEntryBreak` with paid flag, break type and in and out times | `missed` ("whether the break was a missed break"), `waived` ("whether the break was waived by the employee") and `auditResponse` ("whether the employee was asked to take the break"), null for break types without acknowledgment tracking | |
| **When I Work** | Paid rest breaks counted as worked hours; unpaid meal breaks deducted | "break attestation requires users to report if they have taken breaks during their shift upon clock out"; a "no" requires a note; prompts appear after 3.5 hours (paid breaks) or 5.5 hours (unpaid) | |
| **Zeal** | Breaks as hours | | Earning components Meal Break Premium and Rest Break Premium, one extra hour of regular pay per workday a required break "is not provided or is waived" |

The shape that has emerged: **a break is an interval with a type, and a separate record says whether it was missed, waived or acknowledged.** Toast puts all three flags on the break; When I Work asks at clock-out and requires a reason for "no"; Deputy keeps California booleans per timesheet. Premiums are then an earning type that payroll pays (Zeal names them) or that the partner computes and sends. One caution from the table: whether a break was "waived" matters legally, because a valid waiver means no meal period was required, so an engine shouldn't emit a premium just because a waived flag is set; Zeal's description groups "not provided or is waived" together, and the engine deciding when to create the line needs its own rule.

## Federal Rules

The FLSA doesn't require breaks, but DOL's hours-worked rules decide how they're paid when given. Short rest periods "must be counted as hours worked." A meal period is not work time only if "The employee must be completely relieved from duty for the purpose of eating regular meals" (Fact Sheet 22). A 30-minute lunch at the desk answering the phone is paid time, and an auto-deducted meal that wasn't taken is unpaid work. The one federal break mandate is for nursing employees (below).

## California Meal Periods

California's rules, from the DLSE's meal period guidance and the wage orders:

- **First meal.** An employer "may not employ an employee for a work period of more than five hours per day without providing" a meal period of at least 30 minutes, starting no later than the end of the fifth hour of work. It can be waived by mutual consent "if the total work period per day of the employee is no more than six hours."
- **Second meal.** "A second meal period of not less than thirty minutes is required if an employee works more than ten hours per day," waivable by mutual consent only if the day is no more than 12 hours and the first meal wasn't waived.
- **On-duty meals.** Only when the nature of the work prevents relief, and only "by written agreement between the employer and employee" for a paid on-the-job meal period, which the employee can revoke in writing.
- **Provide, not police.** "an employer must do more than simply make a meal period 'available,'" but "An employer is not required to ensure that no work is performed." The employer relieves the employee of all duty and gives up control; if the employee then chooses to work, no premium is owed.

The timing rules are where systems fail. "No later than the end of the fifth hour" means a shift that starts at 7:00 a.m. needs the meal to start by 12:00 p.m.; the *Donohue* opinion's example is a worker who clocked in at 6:59 a.m. and out for lunch at 12:04 p.m., whose meal "started after five hours and five minutes of work," which a ten-minute rounding rule made look compliant. A meal of 29 minutes is short; a meal interrupted by a manager's question isn't off duty. And because *Donohue* held that "employers cannot engage in the practice of rounding time punches" in the meal period context, meal punches are evaluated to the minute ([Raw Punches and Rounding](/books/workforce/time-and-attendance#raw-punches-and-rounding)).

## California Rest Periods

Rest periods are "a net ten consecutive minutes for each four hour work period, or major fraction thereof," and the DLSE treats "anything more than two hours to be a 'major fraction' of four." "A rest period is not required for employees whose total daily work time is less than three and one-half hours." They are paid ("The rest period is counted as time worked"), taken "in the middle of each work period" insofar as practicable, and fully off duty: the employer must "relieve employees of all duties and relinquish control over how employees spend their time."

The count follows from the major-fraction reading, and engines encode it as a table:

| Hours worked in the day | Rest periods |
| --- | --- |
| Under 3.5 | 0 |
| 3.5 through 6 | 1 |
| Over 6 through 10 | 2 |
| Over 10 through 14 | 3 |
| Over 14 | 4 or more, one more per 4 hours or major fraction |

Six hours is one four-hour period plus two hours, which isn't more than two, so one rest period; six hours and one minute crosses into a second. A break of nine minutes isn't a "net ten," and a break during which the employee must keep a radio on isn't off duty.

## The Premium

Labor Code 226.7(c): if an employer doesn't provide a compliant meal, rest or recovery period, "the employer shall pay the employee one additional hour of pay at the employee's regular rate of compensation for each workday that the meal . . . period is not provided." Four properties drive the engine:

- **Per workday, per kind.** The DLSE describes the meal premium as "one additional hour of pay at the employee's regular rate of pay for each workday," and the rest premium the same way, so three missed rest breaks in one day are one rest premium, not three. The two kinds stack: in *United Parcel Service, Inc. v. Superior Court* (June 2, 2011) the Court of Appeal concluded "section 226.7 permits up to two premium payments per workday," one for meal and one for rest violations. Engines I'd build record them as separate premium kinds and pay both.
- **At the regular rate of compensation.** *Ferra v. Loews Hollywood Hotel* (July 15, 2021) held that the "regular rate of compensation" in 226.7(c), like the "regular rate of pay" for overtime, "encompasses all nondiscretionary payments, not just hourly wages," and applied it retroactively. The premium reads the same regular rate calculation as overtime ([California's Regular Rate](/books/workforce/overtime-and-the-regular-rate#california-s-regular-rate)).
- **Not hours worked.** "This additional hour is not counted as hours worked for purposes of overtime calculations." The premium line has amount but no hours toward any threshold.
- **Wages.** *Naranjo v. Spectrum Security Services* (May 23, 2022) held that the extra pay "constitutes wages subject to the same timing and reporting rules as other forms of compensation for work": it has to be paid on the regular payday, reported on the itemized wage statement, and owed at termination, where unpaid premiums can carry waiting time penalties ([Final Pay](/books/workforce/pay-frequency-statements-and-final-pay#final-pay)).

### The Premium at the Regular Rate of Compensation

A worked example of my own: a California employee paid $20.00 an hour earns a $100.00 nondiscretionary production bonus for a 40-hour week of five 8-hour days. The week's regular rate is ($800.00 + $100.00) ÷ 40 = $22.50.

| Day | What the punches show | Premiums |
| --- | --- | --- |
| Monday | Meal 11:30 to 12:00; rest breaks at 9:45 and 2:30 | none |
| Tuesday | Started 7:00, meal started 12:10 (after 5 hours 10 minutes) | 1 meal |
| Wednesday | Compliant | none |
| Thursday | Meal 12:04 to 12:25 (21 minutes); afternoon rest break not taken, attested "not provided" | 1 meal + 1 rest |
| Friday | Both rest breaks not taken, attested "not provided"; meal compliant | 1 rest |
| **Week** | | **4 premiums × $22.50 = $90.00** |

At the $20.00 hourly rate the premiums would be $80.00; *Ferra* makes the difference, $10.00, owed, and an engine that prices premiums off `pay_rates` rather than the regular rate calculation underpays every employee with a differential, commission or bonus. The four premium lines go on the week's statement as wages, with no hours, each pointing at the day and break rule that produced it. Had Thursday's employee attested "I was provided my break and chose to work," the rest premium wouldn't be owed and the attestation would be the evidence.

## Attestations and Waivers

*Donohue*'s second holding is why attestations exist: "time records showing noncompliant meal periods raise a rebuttable presumption of meal period violations, including at the summary judgment stage." The presumption doesn't mean "automatic liability"; "Employers can rebut the presumption by presenting evidence that employees were compensated for noncompliant meal periods or that they had in fact been provided compliant meal periods during which they chose to work," and "The rebuttable presumption does not require employers to police meal periods. Instead, it requires employers to give employees a mechanism for recording their meal periods and to ensure that employees use the mechanism properly."

That sentence is a product specification. The mechanism is:

- **Prompts before the deadline.** A notice to the worker and the manager before the fifth hour ends, and before the second meal is due, from the schedule and the live punches.
- **An attestation at clock-out** for any day the punches show a short, late or missing break: "Were you provided the opportunity to take a full, uninterrupted meal period?" with "Yes, I chose to work through it," "No, I was not provided it," and a reason. When I Work requires a note for "no"; Toast records whether the employee was asked (`auditResponse`) and whether the break was missed or waived.
- **The premium follows the answer.** "Not provided" (or no answer, or a manager's interruption) creates a premium event automatically; "provided, chose to work" creates none but keeps the attestation as evidence. A manager can't overwrite the worker's answer; a correction is a new record with both on file.
- **Waivers are documents.** A first-meal waiver for days of six hours or less, a second-meal waiver for days of 12 hours or less, and an on-duty meal agreement are signed documents with dates, and the engine checks them against the day's actual hours: a waiver for days of "no more than six hours" doesn't apply to a day that ran six hours and ten minutes.

An attestation is only as good as its honesty. An employer that pressures workers to answer "chose to work" has a record that rebuts nothing, which is why the answer should be the worker's, made on their own device or the clock, at the time, with no default.

## Other States

DOL's state tables (last revised January 1, 2023, so check each state's own rules before encoding them) show how much the rules vary:

| State | Meal period | Paid rest period |
| --- | --- | --- |
| Colorado | 30 minutes for shifts over 5 consecutive hours | 10 minutes per 4 hours |
| Connecticut | 30 minutes for 7.5 or more consecutive hours, after the first 2 and before the last 2 | |
| Illinois | At least 20 minutes for 7.5 or more continuous hours, starting no later than 5 hours in | Hotel room attendants in large counties: two paid 15-minute breaks in a 7-hour day |
| Kentucky | A reasonable off-duty period, usually 30 minutes, between the 3rd and 5th hour | 10 minutes per 4-hour period |
| Massachusetts | At least 30 minutes for each 6 hours, free of all duties and free to leave | |
| Minnesota | Sufficient unpaid time to eat for 8 or more consecutive hours | An "adequate rest period" within each 4 consecutive hours; breaks under 20 minutes can't be deducted |
| Nevada | 30 minutes for 8 continuous hours | 10 minutes per 4 hours |
| New York | Factories: 1 hour at noon; other establishments: 30 minutes at noon for shifts over 6 hours spanning it, with evening and midshift rules | |
| Oregon | 30 minutes fully relieved for 6 to 8 hour work periods | 10 minutes per 4 hours, separate from the meal |
| Rhode Island | 20 minutes in a 6-hour shift, 30 in an 8-hour shift | |
| Washington | 30 minutes for over 5 consecutive hours, between the 2nd and 5th hour, plus 30 more for 3 or more hours beyond the regular day | 10 minutes per 4 hours, no more than 3 hours without one |

Vermont requires only "reasonable opportunities" to eat and use the toilet, and states not listed require no paid rest periods for adults. Many of these rules carry exceptions (collective bargaining agreements in Nevada and Oregon, small employers in Nevada and Rhode Island, particular industries), and each state sets its own remedy, so the premium-per-day model is California's, not a default. DOL's meal table also lists separate rules for minors. For the engine, each row is a break rule set by jurisdiction, effective-dated, with its own thresholds, timing windows and remedy, and a work location carries the ones that apply.

## Lactation Breaks

The PUMP Act (signed December 29, 2022) extended the FLSA's break-time protection for nursing employees. DOL's Fact Sheet 73: employees may take breaks "each time such employee has need to express the milk" for up to one year after the child's birth, in a place other than a bathroom, "shielded from view and free from intrusion"; nearly all FLSA-covered employees qualify, including exempt employees. The time is unpaid only if the employee is completely relieved from duty; if the employer provides paid breaks, an employee who pumps during them is paid the same way; and work done while pumping must be paid. Employers with fewer than 50 employees are exempt only if compliance would impose undue hardship, and from April 28, 2023 violations can bring lost wages, liquidated damages and compensatory and punitive damages.

For the time system: a lactation break is its own break type, never auto-deducted, never counted against meal or rest rules in a way that shortens them, paid or unpaid by the same rule as the employer's other breaks, and recorded with minimal detail (no reason text, no visibility beyond the people who schedule coverage).

## Premiums and the Regular Rate

Break premiums interact with overtime in two directions. California's premium is paid at the regular rate (*Ferra*), so it reads the regular rate calculation; and the premium itself is pay, which raises the question of whether it enters that week's regular rate for overtime. <!-- source-gap: wf-break-premium-regular-rate | missing | Whether California meal and rest premiums are included in the federal FLSA regular rate (and California's own) for overtime | closes with: a DOL opinion letter, a WHD Field Operations Handbook section or a court decision addressing 226.7 premiums under 29 USC 207(e) | checked: 2026-11-10 --> I found no federal regulation or DOL statement on point among the sources I opened. Section 7(e) excludes payments "for occasional periods when no work is performed" and pay not for hours worked of certain kinds, and *Naranjo* describes the premium as compensating in part "for the work the employee performed during the break period," which cuts toward inclusion. My engine keeps the treatment as a rule on the pay item type under each rule set, so the answer can change without a migration, and records which treatment each calculation used.

## How a Time System Enforces Them

Enforcement is a pipeline from rules to records:

1. **Rules by location and date.** Each work location carries break rule sets (California's wage order, Washington's WAC, the employer's own policy) with thresholds and windows.
2. **The schedule reserves breaks.** A scheduled shift gets its breaks as windows ("meal starts between 10:00 and 12:00"), so the plan is compliant before anyone works it.
3. **Live prompts from punches.** The clock knows when the shift started and computes each deadline from raw punches; a prompt goes out before it passes, and kiosks can block a return from a meal that's under 30 minutes only if the worker can override with a reason (blocking otherwise creates unpaid work).
4. **Evaluation at clock-out.** The day's raw punches are evaluated against the rules: each required break, whether it occurred, start offset, net length, interruptions. Violations prompt the attestation.
5. **Premium events at approval.** Each violation without a "provided, chose to work" attestation or a valid waiver becomes a premium event for the day and kind; the manager reviews but can't silently delete one.
6. **Premium lines at calculation.** The pay run prices events at the week's regular rate of compensation and writes wage lines with no hours.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) and the time record in [The Workweek & the Time Record](/books/workforce/time-and-attendance#how-to-build-it). Break rules are effective-dated data per jurisdiction; break records are derived from raw punches; attestations and waivers are the worker's own records; premium events tie a violation to the line that paid it.

```sql
CREATE TABLE break_rules (                 -- a jurisdiction's or employer's break rule, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- null for employer policy
  break_kind          TEXT NOT NULL CHECK (break_kind IN ('meal', 'rest', 'lactation',
                        'recovery')),
  sequence            SMALLINT NOT NULL DEFAULT 1,   -- first meal, second meal, ...
  trigger_hours       NUMERIC(5, 2) NOT NULL,   -- required when the day exceeds this
  latest_start_hours  NUMERIC(5, 2),            -- must start by this offset (5.00 for a CA meal)
  earliest_start_hours NUMERIC(5, 2),           -- WA: no earlier than 2 hours in
  min_minutes         SMALLINT NOT NULL,        -- 30 for meals, 10 net for rest
  paid                BOOLEAN NOT NULL,
  per_hours           NUMERIC(5, 2),            -- rest: one per 4 hours ...
  major_fraction_over NUMERIC(5, 2),            -- ... or fraction over 2
  waivable_up_to_hours NUMERIC(5, 2),           -- 6.00 for a CA first meal, 12.00 for the second
  remedy              TEXT NOT NULL CHECK (remedy IN ('premium_hour_per_day', 'pay_time',
                        'none_stated')),
  applies_when        JSONB NOT NULL DEFAULT '{}',   -- {"min_employees": 2}, {"minor": true}
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE break_records (               -- each required break, as the punches show it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  workday             DATE NOT NULL,
  break_rule_id       UUID NOT NULL REFERENCES break_rules (id),
  start_punch_id      UUID REFERENCES raw_punches (id),
  end_punch_id        UUID REFERENCES raw_punches (id),
  start_offset_min    INT,                   -- minutes from the start of work
  net_minutes         INT,                   -- never rounded
  outcome             TEXT NOT NULL CHECK (outcome IN ('compliant', 'late', 'short', 'missed',
                        'interrupted', 'waived', 'not_required')),
  waiver_document_id  UUID REFERENCES documents (id),
  evaluated_at        TIMESTAMPTZ NOT NULL,
  rule_version        TEXT NOT NULL
);

CREATE TABLE break_attestations (          -- the worker's own answer, at the time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  break_record_id     UUID NOT NULL REFERENCES break_records (id),
  answer              TEXT NOT NULL CHECK (answer IN ('provided_chose_to_work', 'not_provided',
                        'interrupted', 'no_answer')),
  note                TEXT,                  -- required for 'not_provided' and 'interrupted'
  answered_on         TEXT NOT NULL CHECK (answered_on IN ('clock', 'mobile', 'web')),
  answered_at         TIMESTAMPTZ NOT NULL,
  prompt_version      TEXT NOT NULL,         -- the question as shown
  supersedes_id       UUID REFERENCES break_attestations (id)
);

CREATE TABLE premium_pay_events (          -- one per worker, workday and premium kind
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  workday             DATE NOT NULL,
  premium_kind        TEXT NOT NULL CHECK (premium_kind IN ('meal', 'rest', 'recovery')),
  break_record_ids    UUID[] NOT NULL,       -- the violations behind it
  status              TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid',
                        'reversed')),
  reversal_reason     TEXT,                  -- with the attestation or waiver that justified it
  regular_rate_calculation_id UUID REFERENCES regular_rate_calculations (id),
  amount_cents        BIGINT,                -- one hour at the regular rate of compensation
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  UNIQUE (worker_id, workday, premium_kind)
);
```

The unique key on `premium_pay_events` is the per-workday rule; `premium_kind` keeps meal and rest separate. The pay run reads approved events for days in the period, prices each from the week's `regular_rate_calculations` row, and writes a `pay_statement_lines` row with `hours` null, a premium pay item type and `work_period` of the day. A reversed event keeps its reason and the attestation or waiver behind it.

Design notes:

- **Evaluate breaks from raw punches,** to the minute, and store the rule version that judged them.
- **The worker's attestation is append-only** and can't be overwritten by a manager.
- **A waiver is a document checked against actual hours,** not a flag on the employee.
- **Premiums read the regular rate calculation,** never the base rate.
- **Lactation breaks are their own kind,** private and never auto-deducted.

## Auditing

A California meal and rest audit, or a class action, starts with the time records and the presumption:

- **Every required break per workday** with its rule, start offset, net minutes and outcome, from raw punches.
- **Every attestation as answered,** with the prompt shown, the device and the time, and any superseding answer.
- **Every waiver and on-duty meal agreement** with signature and revocation dates.
- **Every premium event,** approved, paid or reversed with a reason, and the statement line that paid it at the regular rate used.
- **Prompts sent** before deadlines, as evidence that the mechanism existed and was used ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).

## What This Means for the System You Build

- **Hold break rules as dated data per jurisdiction,** with triggers, windows, net minutes and remedies.
- **Reserve breaks in the schedule** and prompt before each deadline from live punches.
- **Judge breaks from unrounded punches** and keep every outcome.
- **Ask the worker at clock-out** when the punches show a problem, and let the answer decide the premium.
- **Pay one premium per workday per kind** at the regular rate of compensation, as wages with no hours.
- **Treat waivers as signed documents** tested against the day's actual hours.
- **Make lactation breaks their own private type** and never deduct them automatically.

## References

**Law and regulation**

- [California Labor Code 226](https://california.public.law/codes/ca_lab_code_section_226), the wage statement that must show premium wages

**Agency guidance and forms**

- [DOL WHD: Fact Sheet 22, Hours worked under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked), paid rest periods and bona fide meal periods
- [DOL WHD: Fact Sheet 73, FLSA protections for pumping breast milk at work](https://www.dol.gov/agencies/whd/fact-sheets/73-flsa-break-time-nursing-mothers), break time, space, pay, the small employer exemption, remedies from April 28, 2023 and the December 29, 2022 signing
- [DOL WHD: Minimum length of meal period required under state law](https://www.dol.gov/agencies/whd/state/meal-breaks), state meal rules revised January 1, 2023
- [DOL WHD: Minimum paid rest period requirements under state law](https://www.dol.gov/agencies/whd/state/rest-periods), state rest rules revised January 1, 2023
- [California DLSE: Meal periods FAQ](https://www.dir.ca.gov/dlse/faq_mealperiods.htm), first and second meals, waivers, on-duty meals, providing versus ensuring, and the premium not counted as hours worked
- [California DLSE: Rest periods FAQ](https://www.dir.ca.gov/dlse/faq_restperiods.htm), net ten minutes per four hours or major fraction, the 3.5-hour floor, timing, off-duty and the premium

**Courts and enforcement**

- [Supreme Court of California: Donohue v. AMN Services, S253677 (PDF)](https://www4.courts.ca.gov/opinions/archive/S253677.PDF), no rounding of meal punches, the 226.7(c) text, the rebuttable presumption and how employers rebut it
- [Supreme Court of California: Ferra v. Loews Hollywood Hotel, S259172 (PDF)](https://www4.courts.ca.gov/opinions/archive/S259172.PDF), premiums at a regular rate including nondiscretionary pay, applied retroactively
- [Supreme Court of California: Naranjo v. Spectrum Security Services, S258966 (PDF)](https://www4.courts.ca.gov/opinions/archive/S258966.PDF), premiums as wages subject to timing and wage statement rules
- [United Parcel Service, Inc. v. Superior Court (2011) 196 Cal.App.4th 57](https://static.case.law/cal-app-4th/196/cases/0057-01.json), up to two premium payments per workday, one meal and one rest

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings), the rest and recovery hourly type
- [Deputy: Fair Work Week and the Deputy API](https://developer.deputy.com/docs/fair-work-week-and-the-deputy-api.md), California meal and rest break booleans
- [Deputy: Timesheet](https://developer.deputy.com/docs/timesheet.md), meal break slots
- [Homebase: Time clock](https://joinhomebase.com/time-clock/), break management, waivers and missed-break pay
- [Rippling: Create a time entry](https://developer.rippling.com/documentation/rest-api/guides/create-time-entry.md), breaks inside entries and break policy assignment
- [Square: Create break type](https://developer.squareup.com/reference/square/labor-api/create-break-type), expected duration, paid flag and the three-per-location limit
- [Toast: TimeEntryBreak schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntryBreak/), missed, waived and acknowledgment fields
- [When I Work: All about breaks](https://help.wheniwork.com/articles/all-about-breaks/), break attestation at clock-out and prompt thresholds
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), Meal Break Premium and Rest Break Premium
