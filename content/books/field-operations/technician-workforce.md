+++
title = "Technicians: Time, Pay & Labor Rules"
nav_title = "Time, Pay & Labor Rules"
description = "Paying technicians: hourly, flat-rate, piece and commission pay, overtime's regular rate, hours worked, breaks, prevailing wage, credentials and field hazards."
category = "Field Operations Industry"
order = 1516
part = "In the Field"
aliases = []
tags = ["field-operations", "payroll", "wage-and-hour", "overtime", "safety", "workforce"]
+++

A technician's day is the product a field business sells, and the same day is what payroll has to pay for. That would be simple if technicians worked nine to five at one desk. They don't. An HVAC technician drives a company van home, takes a page at 6:40 AM, drives to the first call, waits forty minutes for a homeowner, runs to the supply house, sells a water heater that pays a spiff, and finishes in an attic at 104°F. A pool technician is paid per stop. A pest technician's spiff on a termite sale arrives three weeks later. A lawn crew in California is owed a separate rate for its rest breaks because it's paid by the yard. Each of those facts changes what the business owes, and most of them are recorded by the technician app before anyone in payroll sees them.

This chapter is the rules side of that: how technicians are paid, which hours count, how overtime is computed when pay isn't hourly, the state break and heat rules a schedule has to respect, prevailing wage on public work, credentials and training, and the field hazards that set safety records. The punch screen is in [Time Tracking](/books/field-operations/technician-app#time-tracking); commissions for salespeople, the outside sales exemption and the payroll export are in [Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions); the vehicle, PPE and incident records are in [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety). The book is US-centric, and this chapter more than most: it describes federal rules and a few states as examples, and it isn't legal advice.

## How the Platforms Do It

The field platforms record time and hand it to a payroll system; few compute pay themselves. What they record, and how they classify it, varies:

| Platform | How time is captured | Classification | To payroll |
| --- | --- | --- | --- |
| ServiceTitan | "tapping Dispatch, Arrive, and Close Out actions creates and ends timesheets" (Automatic Timekeeping) | Timesheet codes for non-job time: "Drive Time, Training, Parts Run, PTO, On Call" | Performance pay and payroll adjustments in-app; the report is exported and uploaded "to your payroll provider" |
| Jobber | Visit timers per job, location timers that "automatically track when your team arrives at and leaves a job site," GPS waypoints on app timers | Categories General, Driving, Office, Supplies; "Break time is tracked separately as unpaid time" | Syncs to Gusto and QuickBooks Online |
| Housecall Pro | Time Tracking app with clock-in and clock-out locations mapped per time card | Daily and weekly overtime settings, "daily overtime hours are counted first" | "Sync Hours to Payroll" into its own payroll |
| Dynamics 365 Field Service | "the system creates time entries based on the booking timestamps" when a work order completes; manual entries and time-off requests in the app | `msdyn_timeentry` types Work, Absence, Vacation, Overtime, On Break, Travel; statuses Draft, Submitted, Approved, Returned, Cancelled | Approval statuses on each entry; payroll is an integration |

Three things are common. Time is derived from the job's status events rather than typed; non-job time (driving, the parts run, training, on call) has its own codes; and approved time leaves for a payroll provider that does the tax math. Dynamics adds a fourth worth copying: an approved time-off request also removes the technician from scheduling ("the scheduling assistant doesn't recommend that resource for a job during that period"), so absence is one record read by both payroll and the [availability engine](/books/field-operations/territories-and-capacity#crews-shifts-and-operating-hours).

What none of them can do for you is decide the legal meaning of each minute. That's the rest of this chapter.

## How Technicians Are Paid

Five pay bases cover the trades, and many technicians are paid on two or three at once:

| Basis | What it pays | Common in | What the system must hold |
| --- | --- | --- | --- |
| **Hourly** | A rate per hour worked | Every trade; apprentices and helpers almost always | All hours, by kind |
| **Flat-rate or production pay** | A fixed amount per job or per pricebook task, or a share of the job's revenue, regardless of hours | HVAC, plumbing and electrical service; install crews | The job's pay value, plus all hours anyway |
| **Piece rate** | An amount per unit: a pool stop, a lawn, a home treated, a unit cleaned | Pool, lawn, pest, residential cleaning | Units per visit, plus all hours anyway |
| **Commission and spiffs** | A share of what the technician sold, or a fixed amount per item sold | Technicians who sell repairs, replacements and memberships | The sale, its earning event and the weeks it relates to |
| **On-call pay** | A stipend for being reachable, plus pay for callouts | Emergency service in every repair trade | On-call periods and each callout as time |

Bonuses ride on top of all of them: a callback-free month, a review score, a safety record, a membership contest.

The phrase that recurs in every row is "all hours anyway." Production and piece pay don't change the rule that a non-exempt employee is paid at least the minimum wage for every hour worked and overtime past 40, so a technician paid entirely per job still needs a complete record of hours, including the drive, the wait and the parts run. A flat-rate pay plan without hours is a wage claim waiting for a plaintiff.

Commission and spiffs on technician sales are configured on the pricebook item and the job, and paid on completed, invoiced work; that machinery is in [Technician Sales and Upsells](/books/field-operations/sales-teams-and-commissions#technician-sales-and-upsells). On-call scheduling, and why an on-call shift is availability rather than capacity, is in [Emergencies, After Hours and On Call](/books/field-operations/repair-and-installation#emergencies-after-hours-and-on-call). This chapter handles what those earnings do to overtime.

## Overtime and the Regular Rate

Federal overtime is one and a half times the employee's **regular rate** for hours over 40 in a workweek, and the regular rate is not the hourly rate. It is "determined by dividing his total remuneration for employment" in the workweek by the hours actually worked in it (29 CFR 778.109). Fact Sheet 56A says it includes "all remuneration for employment," and "All compensation for hours worked, services rendered, or performance must be included."

That has four consequences for a technician's pay:

- **Commissions and spiffs raise the regular rate.** Commissions count "regardless of the method, frequency, or regularity of computing, allocating and paying the commission" (778.117). A weekly commission "is added to the employee's other earnings for that workweek," and the total is divided by the week's hours (778.118).
- **Late money reaches back.** A commission that can't be computed until later may be left out "until the amount of commission can be ascertained," and then must be "apportioned back over the workweeks of the period during which it was earned" (778.119). A bonus covering several weeks works the same way (778.209). A spiff on a July water heater install that posts in August reopens July's overtime.
- **Most bonuses aren't discretionary.** "If the employer promises in advance to pay a bonus, he has abandoned his discretion with regard to it," and production, attendance and similar bonuses "must be included in the regular rate of pay" (778.211). A callback-free bonus announced in the spring is in the regular rate; a thank-you check nobody was promised may not be.
- **Production and piece pay owe only the half.** For piece rates, the regular rate is the week's total piece earnings divided by hours worked, and "Only additional half-time pay is required" for the overtime hours, because the piece earnings already paid straight time for them (778.111). A flat sum "for doing a particular job, without regard to the number of hours worked" is the same shape: the employee "is then entitled to extra half-time pay at this rate for all hours worked in excess of 40" (778.112).

A worked example, illustrative only, for a flat-rate HVAC technician in one workweek:

```text
production pay (flat-rate tasks)    $1,350.00
spiffs (2 maintenance memberships)     $40.00
hours worked (all kinds)                50
regular rate                        $1,390.00 / 50 = $27.80
overtime premium (half-time)        10 h × $13.90  = $139.00
total for the week                  $1,529.00
spiff posted three weeks later        $60.00  → regular rate rises to $29.00,
                                               premium becomes $145.00: $6.00 more
                                               premium owed for that week, beside the $60
```

The trap in the first line is the hours. Fifty hours means every hour, including the 35 minutes to the first call when it counts and the supply house run. Undercount the hours and the regular rate goes up while the overtime hours go down, and the employer can still owe minimum wage in a slow week when production pay divided by real hours falls below it.

**California** adds a daily layer: time and a half for hours "in excess of eight hours up to and including 12 hours in any workday," double time "in excess of 12 hours," and special rules for the seventh consecutive workday. A pay engine that computes only weekly overtime is wrong for every California technician who works a ten-hour day in July.

**Exempt or not.** Almost every technician is non-exempt. The executive, administrative and professional exemptions require a salary of "not less than $684 per week" plus duties tests; DOL's 2024 increase was vacated in court, and a May 15, 2026 technical amendment restored the prior text to the regulations. A service manager may be exempt; a lead technician who mostly turns wrenches usually isn't. Salespeople who sell away from the office are a different exemption ([Employee or Contractor](/books/field-operations/sales-teams-and-commissions#employee-or-contractor)); a technician who sells at the job is still a technician, and a comfort advisor who spends the day in customers' homes is the case to put in front of counsel. Store the classification per person, period and state, never as a flag on the job title.

## What Counts as Hours Worked

The field version of hours worked is mostly about driving and waiting. Under the federal rules:

- **Home to the first job.** "Normal travel from home to work is not worktime" (29 CFR 785.35). Fact Sheet 22 calls it "ordinary home to work travel."
- **Job to job.** Travel "from job site to job site during the workday, must be counted as hours worked" (785.38). So is travel from a designated reporting place, such as the branch, to the first site, and the trip to the supply house in the middle of the day.
- **The take-home van.** The Employee Commuting Flexibility Act amended the Portal-to-Portal Act so that using an employer's vehicle to commute, and activities "incidental to the use of such vehicle for commuting," aren't principal activities "if the use of such vehicle for travel is within the normal commuting area for the employer's business" and is "subject to an agreement" between employer and employee (29 U.S.C. 254(a)). Two conditions, both of which the system should hold: the agreement, with its date, and the normal commuting area, per branch.
- **Work during the commute.** DOL's July 22, 2026 opinion letter FLSA2026-10, on a field service engineer with a company vehicle, draws the line the trades live on: "time spent receiving pages is not compensable hours worked as it is incidental to your use of an employer-provided vehicle for commuting," but "time spent calling clients to schedule appointments and scheduling other field service engineers is compensable hours worked," and where the employee must spend an hour calling clients before or during the commute, the travel itself stops being an ordinary commute and becomes "compensable hours worked." Reading the next day's route on the phone at breakfast is one thing; calling three customers to confirm windows is work, and it can start the workday.
- **Waiting.** A technician who waits on site for a homeowner, a part or an inspector is "engaged to wait," and the time is work (785.15). Time is off duty only when the employee is "definitely told in advance that he may leave the job" and the period is long enough to use as their own (785.16).
- **On call.** An employee "required to remain on call on the employer's premises" is working; one who just has to leave word where they can be reached generally isn't (785.17). On-call rules that restrict a technician heavily (respond in ten minutes, stay sober, stay within range) push toward working time; record on-call periods and callouts separately so the decision can be made per policy.
- **Training and meetings.** Off the clock only if all four hold: outside regular hours, "in fact voluntary," "not directly related to the employee's job," and no productive work (785.27). The Monday safety meeting, manufacturer training on a new furnace line and a ride-along with a senior technician all fail at least one test.
- **Breaks.** Federal law doesn't require breaks, but if given, short rest periods "running from 5 minutes to about 20 minutes" are paid (785.18), and a meal period is unpaid only if the employee is "completely relieved from duty"; "Ordinarily 30 minutes or more is long enough" (785.19). A lunch eaten in the van between calls, with the dispatcher allowed to interrupt it, isn't a bona fide meal period.

So the minimum set of time kinds a technician's day needs is larger than "on job" and "off": job time, travel between jobs, travel at the start and end with whether it counts, waiting, supply runs, shop time, training, on-call standby, callouts, rest breaks, meal periods, and for piece-rate workers in California, rest and recovery and other nonproductive time (below). ServiceTitan's and Jobber's non-job codes are the start of that list; the legal classification belongs on each entry, not in someone's head at payroll time.

## Breaks by State

Federal law sets no break requirement, and the states that do disagree on timing. Three examples show the range:

| State | Meal | Rest | Remedy or detail |
| --- | --- | --- | --- |
| California | 30 minutes "no later than the end of the employee's fifth hour of work"; a second "if an employee works more than ten hours per day" | "a net 10-minute paid rest period for every four hours worked or major fraction thereof" | "one additional hour of pay at the employee's regular rate of pay" for a missed meal, and one for missed rest, per workday |
| Washington | "at least thirty minutes," starting "no less than two hours nor more than five hours from the beginning of the shift" | "not less than ten minutes, on the employer's time, for each four hours"; no more than three hours without one | No more than five consecutive hours without a meal |
| Oregon | "not less than 30 continuous minutes" for a work period of six to eight hours | "not less than ten continuous minutes" per four hours "or major part thereof" | |

Breaks interact with field work in ways an office never sees. A technician on a long commercial call can't leave a refrigeration system open to take a meal; a route built with eleven back-to-back stops leaves no room for the rest period the law requires; a meal "taken" in the van while the dispatcher texts isn't relief from duty. The system's job is threefold. The route builder reserves break time in the day like any other constraint, as a break with an earliest and latest start on the shift ([The Problem You Hand the Solver](/books/field-operations/route-optimization#how-to-build-it)). The app records breaks as punches, with a prompt when a deadline approaches. And payroll computes premiums from the raw punches, because California's Supreme Court held in *Donohue v. AMN Services* (2021) that "employers cannot engage in the practice of rounding time punches" in the meal period context, and that time records showing noncompliant meal periods "raise a rebuttable presumption of meal period violations." Its example is a 21-minute lunch from 12:04 to 12:25 rounded to a compliant-looking 12:00 to 12:30.

## Piece Rate in California

California pays piece-rate workers twice over for time they don't produce. Under Labor Code 226.2 (from AB 1513, effective January 1, 2016), "Employees must be compensated for rest and recovery periods separate from any piece-rate compensation," and other nonproductive time must be paid "at an hourly rate that is no less than the applicable minimum wage." The rest and recovery rate is the higher of the minimum wage and the employee's average hourly rate for the week, which DIR describes as the week's pay, excluding rest and recovery pay and overtime premiums, divided by hours worked excluding rest and recovery time.

For a pool technician paid per stop or a cleaner paid per home, that means three numbers per week: piece earnings, rest and recovery hours with their computed rate, and nonproductive hours (the drive to the first stop when it counts, the restock, the morning meeting) at no less than minimum wage. The pay statement must show "the total hours of compensable rest and recovery periods," the rate and the gross wages for them, and the same for other nonproductive time. A piece-rate plan in California is a timekeeping system first.

## Prevailing Wage and Public Work

Public work brings its own wage floor and its own paperwork:

- **Davis-Bacon and Related Acts** cover contractors and subcontractors on federally funded or assisted contracts "in excess of $2,000" for the construction, alteration or repair of public buildings or works. Workers are paid at least the prevailing wages and fringe benefits in the wage determination for their classification, and contractors must "submit weekly certified payroll records to the contracting agency." DOL's 2023 update took effect October 23, 2023; a Texas court enjoined three provisions in June 2024, and the rest remains in effect.
- **The Service Contract Act** covers service work: contractors "performing services on prime contracts in excess of $2,500" pay service employees no less than the locality's prevailing wages and fringe benefits. Janitorial and building maintenance under a federal contract fall here.
- **Wage determinations** for both are published on SAM.gov, where "federal contracting officers" obtain them. States and cities can have their own prevailing wage laws for state and municipal work, with their own forms.

An HVAC replacement at a federally funded school and nightly cleaning of a federal office are both everyday work for a commercial branch, so prevailing wage is a property of the work order, not the company. In data: a work order carries the wage determination that applies (its number and modification), each technician's time on it carries a **labor classification** (an electrician, a laborer, an apprentice in a registered program), the pay engine pays the higher of the technician's own rate and the determination's rate for those hours, and fringe obligations are tracked separately. Certified payroll is then a weekly report over those entries, per project, signed by someone accountable. The trap is the mixed week: a technician who spends Tuesday on a prevailing wage job and the rest of the week on residential calls has two rates in one workweek, and the overtime calculation has to handle both.

## Timekeeping and Pay Statements

The punch interface, offline punches and status-derived time are in [Time Tracking](/books/field-operations/technician-app#time-tracking). The rules that interface serves:

- **Records.** Employers must keep hours worked each workday and each workweek for every non-exempt employee (29 CFR 516.2). The FLSA doesn't require pay stubs ("the FLSA does not require an employer to provide employees pay stubs"), but many states do.
- **Rounding.** Federal rules accept rounding "to the nearest 5 minutes, or to the nearest one-tenth or quarter of an hour" only if, "over a period of time," employees are paid for all time worked (785.48), and California bars rounding meal periods. My rule: don't round. A field app already has minute-accurate events; rounding saves nothing and creates a liability someone has to defend with statistics.
- **Edits.** A technician who forgot to clock out from the last call, a dispatcher who corrects a punch: each correction is a new, attributed entry with a reason, never an overwrite, and the technician sees it. Audits of wage claims start here.
- **Pay statements.** California's list (Labor Code 226(a), summarized on DLSE's paydays FAQ) is a good superset to design to: gross wages; total hours worked for non-exempt employees; "The number of piece-rate units earned and any applicable piece rate"; all deductions; net wages; the pay period's dates; the employee's name and last four digits of the Social Security number or an ID; the employer's legal name and address; and "All applicable hourly rates in effect during the pay period," with hours at each rate. Add the 226.2 lines for piece-rate workers. A statement that says "Production $1,350" with no units, rates or hours fails that list.

The payroll provider renders the statement; the field platform has to send it lines rich enough to render. That's the reason to export earnings by type (hourly by rate, production, piece units, commission, spiff, bonus, overtime premium, meal and rest premiums, rest and recovery) rather than a single "gross." The export mechanics, batch cutoffs and reconciliation are in [Paying It: Payroll Integration](/books/field-operations/sales-teams-and-commissions#paying-it-payroll-integration).

## Hiring, Training and Credentials

A technician's first weeks are the most expensive ones: paid, supervised and not yet productive. The system's part is gates, records and scheduling.

**Onboarding gates.** I-9, E-Verify, tax forms and background screening are the same gates sales reps pass ([Recruiting and Onboarding](/books/field-operations/sales-teams-and-commissions#recruiting-and-onboarding)), plus two the field adds: a driving record check before a van is assigned ([Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety)), and the credentials the work needs before anyone is dispatched to it.

**Credentials.** EPA Section 608 certification is by appliance type: "Type I" for small appliances, "Type II" for high- or very high-pressure appliances, "Type III" for low-pressure appliances, and "Universal" for all, and "Section 608 Technician Certification credentials do not expire." State pesticide applicator licenses, plumbing and electrical tiers, backflow tester certificates and apprentice registrations do expire and carry supervision rules. [Licenses & Permits](/books/field-operations/licensing-and-permits#a-licensing-model) owns the model; this chapter only adds that a credential is a hiring milestone with a date, so time-to-licensed is measurable per new hire.

**Ride-alongs and supervised work.** A new technician shadows, then works under supervision, then alone. In scheduling terms the ride-along is a second resource on the visit who doesn't add capacity, and supervised work is a visit whose eligibility depends on a supervisor's credential and presence ([Supervision](/books/field-operations/licensing-and-permits#supervision)). Model both explicitly: a `trainee` assignment role on the visit, and a duration multiplier for trainees (Timefold models one for exactly this reason, in [Skills, Licenses and Certifications](/books/field-operations/territories-and-capacity#skills-licenses-and-certifications)). Ride-along time is hours worked for the trainee, and often a training bonus for the mentor, which is in the regular rate.

**Training as data.** Each course, certificate, safety training and manufacturer program is a dated record per person, with the demonstration of understanding OSHA requires for PPE ([Protective Equipment](/books/field-operations/fleet-and-safety#protective-equipment)). Training time is paid time.

**Turnover.** Measure it by branch, tenure band and pay basis: departures in the first 90 days, departures after the first season, and time from hire to first solo day. The pay basis matters because the rules above make production and piece pay harder to get right. Keep the measurement on staff records, not in a spreadsheet, so it can be joined to callbacks, reviews and revenue per technician ([Operating Metrics](/books/field-operations/operating-metrics)).

## Field Hazards

PPE, incidents, OSHA reporting and vehicle safety are in [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety). Four hazards reach the schedule and the app directly.

### Heat

Field work is outdoor work, and attics and mechanical rooms are often hotter than outside. As of October 2026 there is no federal heat standard. OSHA proposed "Heat Injury and Illness Prevention in Outdoor and Indoor Work Settings" on August 30, 2024, with an initial trigger at a heat index of 80°F and a high-heat trigger at 90°F; it held an informal hearing starting June 16, 2025 and extended post-hearing comments to October 30, 2025. OSHA's latest published regulatory agenda entry lists a supplemental proposal for December 2026 and a final action for October 2027, so treat the federal rule as pending. Enforcement doesn't wait for it: OSHA replaced its heat National Emphasis Program with CPL 03-00-024 on April 10, 2026, in place for five years, which targets inspections in listed industries and treats days with a heat index of 80°F or more as heat priority days (as summarized by Littler; the directive's industry list is the authority). The states that act today:

| Rule | Trigger | What it requires |
| --- | --- | --- |
| California, Title 8 § 3395 (outdoor) | Shade "when the temperature exceeds 80 degrees Fahrenheit"; high-heat procedures "when the temperature equals or exceeds 95 degrees," in listed industries including landscaping and construction | Shade above 80°F, and high-heat procedures at 95°F in the listed industries |
| California, Title 8 § 3396 (indoor, operative July 23, 2024) | "all indoor work areas where the temperature equals or exceeds 82 degrees Fahrenheit" | Controls to reduce and maintain temperature and heat index below 87°F |
| Washington, WAC 296-62-095 (outdoor, amended effective July 17, 2023) | Action level 80°F for ordinary clothing (52°F for vapor-barrier clothing) | At or above 90°F, a cool-down rest of 10 minutes every 2 hours; at or above 100°F, 15 minutes every hour; observation options include radio or cell check-ins for lone workers |
| Oregon, OAR 437-002-0156 (indoor and outdoor) | Heat index at or above 80°F | A written rest break schedule for heat index at or above 90°F |

Indoor heat matters more to the trades than it looks: California's indoor rule reaches the attic where an HVAC technician replaces a coil, which the property's thermostat says nothing about. What the system can do:

- **Know the heat at the visit.** Pull forecast temperature and heat index per property and day; a branch-wide number misses the valley route that's ten degrees hotter.
- **Turn thresholds into rules.** The state's triggers are dated rules per jurisdiction ([Rules as Data](/docs/architecture/rules-as-data)), producing required cool-down breaks the route builder must reserve, a check-in cadence, and flags on visits with known hot spaces (attic air handlers, rooftop units).
- **Move the work when needed.** Shifting outdoor work earlier, splitting a long attic job, or standing down a territory are dispatch operations ([Weather and Emergencies](/books/field-operations/dispatch#weather-and-emergencies)).
- **Record it.** Acclimatization for new hires and returning workers, training, check-ins and every heat-related incident, against the state rule in force that day.

### Ladders and Falls

Falls are "the number one cause of construction worker fatalities," per NIOSH, and service technicians climb to roofs, gutters and attic hatches daily. Portable ladders used to reach an upper landing must extend at least 3 feet above it (29 CFR 1910.23 for general industry; 1926.1053 in construction, which allows securing the top and providing a grab rail when the ladder can't extend), and construction work at an unprotected edge 6 feet or more above a lower level needs guardrails, nets or personal fall arrest (1926.501). Which standard applies to a given job is a question for the safety program. For the system: tag service types and properties with roof access, ladder height and anchor points; require the right ladder on the van's inventory for the job; and make "roof work" a skill with training behind it rather than something anyone may be dispatched to.

### Confined Spaces and Crawlspaces

A confined space under OSHA is large enough to enter bodily, has "limited or restricted means for entry or exit," and "Is not designed for continuous employee occupancy"; it becomes a permit-required space when it has or may have a hazardous atmosphere, engulfment risk, a converging shape that can trap someone, or "any other recognized serious safety or health hazard" (29 CFR 1910.146). Crawlspaces, attics, vaults and some pits fit the first definition, and pesticide or refrigerant work can add the atmosphere. When OSHA wrote its construction confined space rule (effective August 3, 2015), it declined a request to exempt "attics, crawl spaces, basements, cabinets" in home building. For a field platform: record known confined spaces on the property with their hazards, require a documented evaluation in the visit form before entry where the tenant's program says so, and never dispatch a single technician to a permit-required entry that needs an attendant.

### Working Alone

Most technicians work alone, which turns a fall, a heat collapse or an electrical shock into a question of how long until anyone notices. Washington's heat rule names radio or cell check-ins for lone workers. My default goes further, all year: the app already knows when a technician arrived and when the visit should end, so a visit that runs well past its expected duration with no activity raises a check-in prompt, then an alert to the dispatcher, then an escalation. The same signal the dispatch console uses for jeopardy ([Escalation](/books/field-operations/dispatch#escalation)) is a safety signal. The technician must be able to dismiss it, and every alert and response is recorded.

## How to Build It

These sketches add pay facts to the staff, resource and visit model in [The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model). The raw punches stay as the technician app captures them; this chapter classifies them and turns them into earnings. Pay itself (tax, net pay, the statement) is computed by the payroll provider.

```sql
CREATE TABLE pay_profiles (               -- how a person is paid, over time
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  staff_member_id        UUID NOT NULL REFERENCES staff_members (id),
  work_state             CHAR(2) NOT NULL,       -- whose wage-and-hour law applies
  flsa_status            TEXT NOT NULL CHECK (flsa_status IN ('non_exempt', 'exempt')),
  exemption              TEXT,                   -- 'executive', 'outside_sales', ...; null if non_exempt
  pay_bases              TEXT[] NOT NULL,        -- hourly, production, piece, commission, on_call
  hourly_rate_minor      BIGINT,
  workweek_starts_dow    SMALLINT NOT NULL,      -- fixed per employer, ISO day of week
  commute_agreement_id   UUID,                   -- signed take-home vehicle agreement, if any
  valid_during           DATERANGE NOT NULL,
  CHECK ((flsa_status = 'exempt') = (exemption IS NOT NULL)),
  EXCLUDE USING GIST (tenant_id WITH =, staff_member_id WITH =, valid_during WITH &&)
);

CREATE TABLE time_entries (               -- classified hours, derived from raw punches
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  staff_member_id        UUID NOT NULL REFERENCES staff_members (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('job', 'travel_between_jobs',
                           'travel_first_last', 'waiting', 'supply_run', 'shop',
                           'training', 'on_call_standby', 'callout', 'rest_break',
                           'meal', 'rest_recovery', 'nonproductive')),
  is_hours_worked        BOOLEAN NOT NULL,       -- the legal decision, stamped with its rule
  classification_rule    TEXT NOT NULL,          -- e.g. 'travel_first_last.commute_area.v3'
  visit_id               UUID REFERENCES visits (id),
  work_order_id          UUID REFERENCES work_orders (id),
  labor_classification   TEXT,                   -- prevailing wage craft, when the work order has one
  during                 TSTZRANGE NOT NULL,     -- UTC instants from the punches
  business_on            DATE NOT NULL,          -- workday in the branch's zone
  source_punch_ids       UUID[] NOT NULL,        -- the time_punches rows it came from
  supersedes_id          UUID REFERENCES time_entries (id),  -- corrections are new rows
  corrected_by_id        UUID REFERENCES staff_members (id),
  correction_reason      TEXT,
  CHECK ((supersedes_id IS NULL) = (correction_reason IS NULL))
);

ALTER TABLE work_orders                   -- public work brings its own wage floor
  ADD COLUMN wage_determination TEXT;     -- e.g. the SAM.gov number and modification

CREATE TABLE earnings (                   -- one line per type, rate and workweek
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  staff_member_id        UUID NOT NULL REFERENCES staff_members (id),
  workweek_starts_on     DATE NOT NULL,          -- the week it was earned in, not paid in
  type                   TEXT NOT NULL CHECK (type IN ('hourly', 'production', 'piece',
                           'commission', 'spiff', 'bonus', 'on_call_stipend',
                           'overtime_premium', 'meal_premium', 'rest_premium',
                           'rest_recovery', 'nonproductive', 'prevailing_wage_topup',
                           'adjustment')),
  is_in_regular_rate     BOOLEAN NOT NULL,       -- false only for truly discretionary pay
  hours                  NUMERIC(7, 2),
  units                  NUMERIC(9, 2),          -- piece-rate stops, lawns, homes
  rate_minor             BIGINT,
  amount_minor           BIGINT NOT NULL,
  currency               CHAR(3) NOT NULL,
  source_ref             TEXT NOT NULL,          -- work order, commission entry, rule
  pay_run_id             UUID,                   -- the locked batch it went out in
  idempotency_key        TEXT NOT NULL,
  UNIQUE (tenant_id, idempotency_key)
);
```

Four decisions are in the shape:

- **Classification is stamped, not implied.** `is_hours_worked` and `classification_rule` record the decision about the drive to the first call or the wait at a locked gate, so a change in policy or law doesn't silently reclassify last year.
- **Earnings belong to the week they were earned in.** A spiff that posts in August carries July's `workweek_starts_on`, and the pay engine recomputes that week's regular rate and posts the difference as an `overtime_premium` adjustment in the current run. Nothing in a locked pay run is edited.
- **The regular rate is a query, not a stored field:**

```sql
-- Regular rate and federal half-time premium per workweek (daily and state rules layer on top)
SELECT e.staff_member_id,
       e.workweek_starts_on,
       SUM(e.amount_minor) FILTER (WHERE e.is_in_regular_rate
                                   AND e.type NOT IN ('overtime_premium', 'meal_premium',
                                                      'rest_premium')) AS regular_pay_minor,
       h.hours_worked,
       SUM(e.amount_minor) FILTER (WHERE e.is_in_regular_rate
                                   AND e.type NOT IN ('overtime_premium', 'meal_premium',
                                                      'rest_premium'))
         / NULLIF(h.hours_worked, 0) AS regular_rate_minor,
       GREATEST(h.hours_worked - 40, 0) AS overtime_hours
FROM earnings e
JOIN weekly_hours h USING (tenant_id, staff_member_id, workweek_starts_on)  -- from time_entries
WHERE e.tenant_id = $1
GROUP BY e.staff_member_id, e.workweek_starts_on, h.hours_worked;
```

  Whether meal and rest premiums belong in the regular rate is itself a state-law question, so the exclusion list is configuration, not this constant. The point is that the formula runs over stored facts and can be re-run when a late commission arrives.
- **Prevailing wage is per entry.** `labor_classification` on the time entry and the determination on the work order let the pay engine compute the top-up per hour and certified payroll render per project.

Two events matter to other modules: `time_entry.corrected` (the technician is notified, and payroll reopens the week) and `earnings.reallocated` (a late commission or bonus reopened a closed week).

## Auditing

Wage claims, DOL investigations, prevailing wage audits and OSHA inspections all ask for records the field platform holds. What to keep, beyond the general rules in [Audit Trails](/docs/architecture/audit-trails):

- **Raw punches and every correction,** with device time, server time, location, who corrected and why. The *Donohue* presumption means the raw meal punch is the evidence.
- **Classification decisions with their rule version:** why a drive was or wasn't counted, which commute agreement was in force, which on-call policy applied.
- **Pay profile history:** pay bases, rates, exemption decisions and the work state, effective-dated, with who approved each change.
- **Late-money reallocations:** each commission or bonus apportioned back, the weeks it reopened and the premium paid.
- **Break evidence:** scheduled breaks on the route, taken breaks from punches, premiums paid when missed, and any waiver the state allows.
- **Certified payroll as submitted,** per project and week, with the signer.
- **Safety records:** heat triggers evaluated per day and jurisdiction, cool-down breaks and check-ins, confined space evaluations, ladder and roof training, and lone-worker alerts with their responses.

Retention periods for field records are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Record every hour, whatever the pay basis.** Production, piece and commission pay all depend on hours for minimum wage and overtime.
- **Classify time by kind and stamp the legal decision** (hours worked or not, and the rule that decided it), with commute agreements and commute areas held as data.
- **Allocate earnings to the workweek they were earned in,** and recompute the regular rate when commissions, spiffs or bonuses arrive late.
- **Compute overtime from a pay engine that knows daily rules,** half-time for production and piece pay, and per-state premiums.
- **Reserve breaks in the route** and compute premiums from raw, unrounded punches.
- **Treat prevailing wage as a property of the work order,** with labor classifications on time entries and certified payroll as a report over them.
- **Export earnings by type, rate and units,** so the pay statement can meet the strictest state's list.
- **Make credentials, training and ride-alongs dated records** that gate dispatch and measure time to productive.
- **Turn heat rules into dated, per-jurisdiction rules** that add breaks, check-ins and dispatch actions, and use the visit timeline as a lone-worker safety signal.

## References

**Specifications**

- [29 CFR 778.109: The regular rate](https://www.law.cornell.edu/cfr/text/29/778.109), total remuneration divided by hours worked in the workweek
- [29 CFR 778.111: Pieceworker](https://www.law.cornell.edu/cfr/text/29/778.111), piece earnings divided by hours, with only additional half-time owed for overtime
- [29 CFR 778.112: Day rates and job rates](https://www.law.cornell.edu/cfr/text/29/778.112), a flat sum per job and half-time for hours over 40
- [29 CFR 778.117: Commission payments](https://www.law.cornell.edu/cfr/text/29/778.117), commissions in the regular rate regardless of how they're computed or paid
- [29 CFR 778.118: Commission paid on a workweek basis](https://www.law.cornell.edu/cfr/text/29/778.118), added to the week's earnings and divided by its hours
- [29 CFR 778.119: Deferred commission payments](https://www.law.cornell.edu/cfr/text/29/778.119), apportioned back over the weeks it was earned
- [29 CFR 778.209: Method of inclusion of bonus in regular rate](https://www.law.cornell.edu/cfr/text/29/778.209), multi-week bonuses apportioned back
- [29 CFR 778.211: Discretionary bonuses](https://www.law.cornell.edu/cfr/text/29/778.211), promised and production bonuses included in the regular rate
- [29 CFR 785.15: On duty](https://www.law.cornell.edu/cfr/text/29/785.15), engaged to wait
- [29 CFR 785.16: Off duty](https://www.law.cornell.edu/cfr/text/29/785.16), told in advance the employee may leave
- [29 CFR 785.17: On-call time](https://www.law.cornell.edu/cfr/text/29/785.17), on call on the premises versus leaving word
- [29 CFR 785.18: Rest](https://www.law.cornell.edu/cfr/text/29/785.18), short rest periods of 5 to about 20 minutes counted as work
- [29 CFR 785.19: Meal](https://www.law.cornell.edu/cfr/text/29/785.19), completely relieved from duty, ordinarily 30 minutes or more
- [29 CFR 785.27: General (training and meetings)](https://www.law.cornell.edu/cfr/text/29/785.27), the four conditions for unpaid training
- [29 CFR 785.35: Home to work](https://www.law.cornell.edu/cfr/text/29/785.35), normal home to work travel isn't worktime
- [29 CFR 785.38: Travel that is part of the day's work](https://www.law.cornell.edu/cfr/text/29/785.38), job site to job site travel counted
- [29 CFR 785.48: Use of time clocks](https://www.law.cornell.edu/cfr/text/29/785.48), rounding only if it doesn't underpay over time
- [29 CFR 516.2: Employees subject to minimum wage or overtime](https://www.law.cornell.edu/cfr/text/29/516.2), hours worked each workday and workweek
- [29 U.S.C. 254: Relief from liability (Portal-to-Portal Act, as amended by the Employee Commuting Flexibility Act)](https://www.law.cornell.edu/uscode/text/29/254), employer vehicle commuting within the normal commuting area under an agreement
- [Federal Register: Defining and Delimiting the Exemptions, Implementation of Federal Court Judgments (May 15, 2026)](https://www.federalregister.gov/api/v1/documents/2026-09839.json), technical amendment restoring the prior salary level text after the 2024 rule was vacated
- [Washington WAC 296-126-092: Meal periods, rest breaks](https://app.leg.wa.gov/wac/default.aspx?cite=296-126-092), meal timing and ten-minute rest per four hours
- [Oregon OAR 839-020-0050: Meal periods and rest periods](https://oregon.public.law/rules/oar_839-020-0050), 30-minute meals and ten-minute rest per four hours or major part
- [California Title 8 § 3395: Heat Illness Prevention in Outdoor Places of Employment](https://www.dir.ca.gov/title8/3395.html), shade above 80°F and high-heat procedures at 95°F
- [California Title 8 § 3396: Heat Illness Prevention in Indoor Places of Employment](https://www.dir.ca.gov/title8/3396.html), indoor work areas at 82°F, controls below 87°F, operative July 23, 2024
- [Washington WAC 296-62-09510: Scope (outdoor heat exposure)](https://app.leg.wa.gov/wac/default.aspx?cite=296-62-09510), outdoor heat scope and the 2023 amendment
- [Washington WAC 296-62-09530: Outdoor heat action levels](https://app.leg.wa.gov/wac/default.aspx?cite=296-62-09530), the 80°F and 52°F action levels by clothing
- [Washington WAC 296-62-09547: High heat procedures](https://app.leg.wa.gov/wac/default.aspx?cite=296-62-09547), cool-down rest at 90°F and 100°F and lone-worker check-ins
- [Oregon OSHA Division 2, Subdivision J, including OAR 437-002-0156 (PDF)](https://osha.oregon.gov/OSHARules/div2/div2J.pdf), heat index triggers at 80°F and the rest break schedule at 90°F
- [Federal Register: Heat Injury and Illness Prevention in Outdoor and Indoor Work Settings (89 FR 70698)](https://www.govinfo.gov/content/pkg/FR-2024-08-30/html/2024-14824.htm), the proposed federal rule's 80°F and 90°F heat index triggers
- [Reginfo.gov: RIN 1218-AD39 agenda entry](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202510&RIN=1218-AD39), the hearing, comment extension, supplemental proposal and final action dates
- [29 CFR 1910.23: Ladders](https://www.law.cornell.edu/cfr/text/29/1910.23), portable ladders extending 3 feet above the landing
- [29 CFR 1926.1053: Ladders (construction)](https://www.law.cornell.edu/cfr/text/29/1926.1053), the 3-foot extension or a secured top and grab rail
- [29 CFR 1926.501: Duty to have fall protection](https://www.law.cornell.edu/cfr/text/29/1926.501), protection at unprotected edges 6 feet or more above a lower level
- [29 CFR 1910.146: Permit-required confined spaces](https://www.law.cornell.edu/cfr/text/29/1910.146), confined space and permit space definitions
- [Federal Register: Confined Spaces in Construction (80 FR, May 4, 2015)](https://www.govinfo.gov/content/pkg/FR-2015-05-04/html/2015-08843.htm), the August 3, 2015 effective date and the refused exemption for attics and crawl spaces

**Reference**

- [Littler: OSHA updates and extends its heat program five more years](https://www.littler.com/news-analysis/asap/osha-updates-and-extends-its-heat-program-five-more-years), CPL 03-00-024 issued April 10, 2026, five years, and heat priority days at a heat index of 80°F (law firm summary)
- [U.S. Department of Labor: Fact Sheet 56A, Regular rate](https://www.dol.gov/agencies/whd/fact-sheets/56a-regular-rate), all remuneration for employment in the regular rate
- [U.S. Department of Labor: Fact Sheet 22, Hours worked](https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked), ordinary home to work travel and paid short rest breaks
- [U.S. Department of Labor: Opinion Letter FLSA2026-10 (PDF)](https://www.dol.gov/sites/dolgov/files/WHD/opinion-letters/FLSA/FLSA2026-10.pdf), pages during a vehicle commute versus scheduling calls that make travel compensable
- [U.S. Department of Labor: Fact Sheet 17A, Exemption for executive, administrative, professional, computer and outside sales employees](https://www.dol.gov/agencies/whd/fact-sheets/17a-overtime), the $684 weekly salary level
- [U.S. Department of Labor: FLSA FAQ](https://www.dol.gov/agencies/whd/flsa/faq), no federal pay stub requirement
- [U.S. Department of Labor: Construction (Davis-Bacon and Related Acts)](https://www.dol.gov/agencies/whd/government-contracts/construction), contracts over $2,000, SAM.gov wage determinations and the 2023 rule's status
- [U.S. Department of Labor: Fact Sheet 66, Davis-Bacon and Related Acts](https://www.dol.gov/agencies/whd/fact-sheets/66-dbra), weekly certified payroll to the contracting agency
- [U.S. Department of Labor: Service contracts](https://www.dol.gov/agencies/whd/government-contracts/service-contracts), prevailing wages on service contracts over $2,500
- [California DLSE: Meal periods FAQ](https://www.dir.ca.gov/dlse/faq_mealperiods.htm), meal timing, the second meal and the one-hour premium
- [California DLSE: Rest periods FAQ](https://www.dir.ca.gov/dlse/faq_restperiods.htm), ten paid minutes per four hours or major fraction and the premium
- [California DLSE: Overtime FAQ](https://www.dir.ca.gov/dlse/faq_overtime.htm), daily overtime over 8 hours, double time over 12 and the seventh day
- [California DIR: AB 1513 piece-rate FAQ](https://dir.ca.gov/pieceratebackpayelection/AB_1513_FAQs.htm), separate pay for rest and recovery and nonproductive time, and pay statement items
- [California DLSE: Paydays, pay periods and final wages FAQ](https://www.dir.ca.gov/dlse/faq_paydays.htm), the itemized wage statement under Labor Code 226(a)
- [Supreme Court of California: Donohue v. AMN Services, S253677 (PDF)](https://www4.courts.ca.gov/opinions/archive/S253677.PDF), no rounding of meal period punches and the rebuttable presumption
- [EPA: Section 608 technician certification requirements](https://www.epa.gov/section608/section-608-technician-certification-requirements), certification types and no expiration
- [NIOSH: Falls in construction](https://www.cdc.gov/niosh/falls/about/index.html), falls as the leading cause of construction worker deaths

**In practice**

- [ServiceTitan: Track time and process payroll](https://help.servicetitan.com/docs/track-time-process-payroll.md), timesheet codes for non-job time, payroll adjustments and export to a payroll provider
- [ServiceTitan: Configure automatic timekeeping](https://help.servicetitan.com/docs/configure-automatic-timekeeping-in-fma.md), timesheets created from Dispatch and Arrive
- [Jobber: Timesheets](https://help.getjobber.com/en/articles/timesheets), visit timers, location timers and GPS waypoints
- [Jobber: Track time categories and breaks](https://help.getjobber.com/en/articles/track-time-categories-and-breaks), General, Driving, Office and Supplies categories, unpaid breaks and Gusto and QuickBooks Online sync
- [Housecall Pro: Run payroll using time tracking](https://help.housecallpro.com/en/articles/8594391-how-to-run-payroll-using-time-tracking), syncing hours to payroll and daily overtime counted first
- [Microsoft Learn: Time entry in Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-time-entry), time entries from booking timestamps, manual entries and time off
- [Microsoft Learn: msdyn_timeentry table reference](https://learn.microsoft.com/en-us/dynamics365/field-service/developer/reference/entities/msdyn_timeentry), entry types and statuses
- [Microsoft Learn: Submit and approve time-off requests](https://learn.microsoft.com/en-us/dynamics365/field-service/submit-approve-time-off-requests), approved time off removing a resource from scheduling suggestions
