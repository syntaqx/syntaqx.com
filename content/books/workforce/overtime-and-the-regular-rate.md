+++
title = "Overtime & the Regular Rate"
nav_title = "Overtime & Regular Rate"
description = "FLSA overtime and the regular rate: excludable pay, weighted averages, bonuses and retro overtime, state daily overtime, and the exempt salary level."
category = "Workforce Industry"
order = 2629
part = "Time and Wage-Hour"
tags = ["payroll", "overtime", "flsa", "regular-rate", "california", "wage-and-hour"]
+++

Overtime is the calculation most payroll systems think they do and most get subtly wrong. The rule sounds like multiplication: hours over 40 in a workweek at one and a half times the rate. But the statute says one and a half times the **regular rate**, and the regular rate is not the hourly rate on the job assignment. It is all the pay the week earned that the law doesn't exclude, divided by all the hours worked. A $1.00 night differential raises it. A cook who also runs the register at a lower rate has a regular rate that is neither of his two rates. A production bonus paid in March reaches back into January's overtime weeks. A meal premium in California is paid at a regular rate that includes last quarter's incentive. And a California employee who works 13 hours on a Tuesday is owed double time for the last one, whatever the week's total.

This chapter covers FLSA overtime, the regular rate under 29 CFR 778 (includable and excludable pay and the 2019 rule), weighted averages across two rates, bonuses and retroactive overtime with code, California's flat-sum bonus rule, state daily and seventh-day overtime (California, Alaska, Nevada, Colorado), the order the engine applies them in, and the exemptions and salary level after the 2024 rule's vacatur and its removal from the regulations on May 15, 2026. Piece rates, day rates and prevailing wage overtime, as technicians are paid, are in the Field Operations volume's [Overtime and the Regular Rate](/books/field-operations/technician-workforce#overtime-and-the-regular-rate); the FLSA premium as a W-2 amount for the qualified overtime deduction is in [The Overtime Premium as Payroll Must Track It](/books/workforce/tips-and-the-2025-deductions#the-overtime-premium-as-payroll-must-track-it); retroactive raises are in [Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections#retroactive-rate-changes). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Payroll APIs differ most on who computes the regular rate: the payroll provider, or the partner sending hours. As of November 2026, from public documentation:

| Platform | Who computes overtime | Regular rate | Notes |
| --- | --- | --- | --- |
| **Check** | The partner, for weighted overtime | "Currently, Check does not support weighted overtime calculations and you will need to determine the gross overtime amount"; the partner computes the average regular rate as total compensation divided by hours | Hourly types `overtime` and `double_overtime`; memo types `weighted_overtime` and `weighted_double_overtime` shown on pay stubs; Check computes gross when given a rate |
| **Deputy** | Deputy's pay rules | Pay rules with `IsMultiplier`, `MultiplierValue`, `MultiplierBaseRate` and `RemunerationBy` ("Base pay, shift loading or period loading") | Approved timesheets generate pay lines (`TimesheetPayReturn`) with an override and comment |
| **Gusto Embedded** | Gusto, per workweek | Worked example in its docs: "Weighted hourly rate: $1,275.00 ÷ 47 hrs = $27.13/hr"; `included_in_overtime_pay` on each earning type decides inclusion, set automatically except for Other, with `DiscretionaryBonus` defaulting to false | "Overtime pay is calculated on a per-workweek basis, not per pay period"; workweek breakdowns must cover the pay period without gaps; `pay_adjustments` carry "overtime premium corrections carried over from a previous workweek" |
| **Rippling** | Rippling | Not documented publicly | Each time entry returns computed `regular_hours`, `over_time_hours` and `double_over_time_hours` |
| **7shifts** | 7shifts, for hours and pay reporting | Not documented publicly | Worked hours and wages split overtime into `premium_overtime_hours` ("Premium / Double overtime hours") and `non_premium_overtime_hours` ("Daily + Weekly + Consecutive overtime hours"), and report `qualified_ot_premium`, "the FLSA overtime premium" |
| **Square** | Square | Not documented publicly | A workweek configuration with `start_of_week` and `start_of_day_local_time` for overtime |
| **Toast** | Toast | Not documented publicly | `overtimeHours` computed on each time entry |
| **Zeal** | The partner, or Zeal on request | "Any overtime should be paid at a rate of 1.5x the employee's regular rate of pay"; a fixed 168-hour `work_week_start` | Either the partner sends `overtime` shifts, or sends hours with a work location and `flsa_ot_recommendation: true`; daily overtime named for Alaska and California |

The split matters for anyone integrating. Where the provider classifies hours but the partner computes the rate (Check), a partner that sends overtime at time and a half of the base rate underpays every employee with a differential, commission or bonus. Where the provider computes it (Gusto), every earning type needs a correct inclusion flag, and a custom earning type with the wrong flag is the same bug. 7shifts' separate qualified premium shows the 2026 requirement in a time product: the FLSA premium is now a reported number, not an internal one.

## FLSA Overtime

Section 7(a)(1) bars employing a covered employee "for a workweek longer than forty hours" unless the excess is paid at "a rate not less than one and one-half times the regular rate at which he is employed" (29 USC 207(a)(1)). Four consequences shape the engine:

- **Hours worked, not hours paid.** Vacation, holiday and sick hours are paid but not worked, so they don't count toward 40 under federal law, and the pay for them is excluded from the regular rate (section 7(e)(2)). California's DLSE says the same of its weekly threshold: paid time off doesn't count toward 40. A contract or policy may count them, which is then contractual overtime, not FLSA overtime.
- **Each workweek alone.** No averaging across weeks ([The Workweek](/books/workforce/time-and-attendance#the-workweek)).
- **Salary doesn't buy overtime for a nonexempt employee.** Fact Sheet 23 (revised October 2019): "A fixed salary for a regular workweek longer than 40 hours does not discharge FLSA statutory obligations." Its example: a $405 salary for a 45-hour week is a $9.00 regular rate, and the 5 overtime hours add $22.50 at half the rate.
- **The fluctuating workweek is the exception.** Under 29 CFR 778.114, a nonexempt employee whose hours vary may be paid a "fixed salary that does not vary with the number of hours worked in the workweek, whether few or many," with a clear mutual understanding that it covers all hours, plus half the week's regular rate for each overtime hour. The regulation's example: a $600 salary, 44 hours, a regular rate of about $13.64 and $27.28 of premium, $627.28 in all. Bonuses and premiums are compatible with it and enter the regular rate, and the salary must cover the minimum wage in the longest week.

## The Regular Rate

The regular rate for a workweek is the includable compensation for the week divided by all hours worked in it. "The regular rate includes all remuneration for employment except certain payments excluded by the Act itself" (Fact Sheet 23). The exclusions are the eight paragraphs of section 7(e), and nothing else:

| 7(e) | Excluded | Examples and limits |
| --- | --- | --- |
| (1) | Gifts and special-occasion payments not tied to hours, production or efficiency | A holiday gift of the same amount to everyone |
| (2) | Pay for "occasional periods when no work is performed due to vacation, holiday, illness," and similar causes; reimbursed expenses | PTO and sick pay; reimbursements for expenses incurred for the employer |
| (3) | Discretionary bonuses "determined at the sole discretion of the employer," bona fide profit-sharing and thrift plan payments, talent fees | Only if discretionary in fact (below) |
| (4) | Employer contributions "irrevocably made" to a trustee or third person for retirement, insurance or similar benefits | Health and 401(k) contributions paid to the plan |
| (5) | Premium pay for hours over 8 in a day, over the maximum workweek or over normal hours | Daily overtime premiums under a contract or state law |
| (6) | Premium pay for Saturdays, Sundays, holidays or rest days at 1.5 times or more | A Sunday rate of time and a half |
| (7) | Contractual premium for work outside agreed normal hours at 1.5 times or more | A CBA's early-start premium |
| (8) | Value of stock options, stock appreciation rights and stock purchase programs meeting the statute's conditions | Exercise at least six months after grant, price at least 85% of fair market value |

Everything else is in: hourly and salaried pay, shift differentials, commissions (whenever and however paid), nondiscretionary bonuses, piece and job rates, and service charges distributed to staff ([Tipped Employees](/books/workforce/tipped-employees#service-charges-are-wages)). Section 7(h) adds the crediting rule: excluded sums can't be counted toward minimum wage or overtime owed, except the premiums in (5), (6) and (7), which can be credited against overtime due.

**Discretionary or not.** A bonus is excludable under (3) only if the employer keeps discretion "both as to the fact of payment and as to the amount" until at or near the end of the period, and "If the employer promises in advance to pay a bonus, he has abandoned his discretion with regard to it" (29 CFR 778.211). "The label assigned to a bonus does not conclusively determine whether a bonus is discretionary." Attendance, production, quality, retention and hiring bonuses, and bonuses from collective bargaining, are in the regular rate. The 2019 rule added examples that may be discretionary: bonuses for unique or extraordinary efforts not awarded under preset criteria, severance bonuses, referral bonuses for employees who aren't primarily recruiters, bonuses for overcoming challenging or stressful situations, and employee-of-the-month bonuses.

**The 2019 rule.** DOL's "Regular Rate Under the Fair Labor Standards Act" (84 FR 68736, published December 16, 2019, effective January 15, 2020) updated Parts 548 and 778 "to provide clarity and to better reflect the 21st-century workplace." For an engine, its most useful clarifications are the ones that decide earning codes: payments for forgoing unused leave are excluded ("the sum allocable to the forgone leave may be excluded from the regular rate," 29 CFR 778.219), and payments under state or local scheduling laws (predictability pay, and pay for working a shift with "fewer than the legally required number of hours between the shifts") are excluded as payments like call-back pay, made "over and above the employee's earnings for the hours actually worked," as long as they aren't prearranged (778.222; [Fair Workweek & Scheduling Laws](/books/workforce/scheduling-laws#premiums-as-earning-codes)).

In data, inclusion is a property of the pay item type under a jurisdiction's rule set, decided once and versioned, never a checkbox per company code. Gusto's `included_in_overtime_pay` per earning type is the vendor version of the same idea.

## Two Rates in One Week

An employee who works two jobs at two rates in one workweek has a regular rate that is the weighted average. The regulation: where an employee works "at two or more different types of work for which different nonovertime rates of pay (of not less than the applicable minimum wage) have been established, his regular rate for that week is the weighted average of such rates," that is, total earnings divided "by the total number of hours worked at all jobs" (29 CFR 778.115). California's DLSE says the same for state overtime.

A worked example of my own: in one workweek an employee works 30 hours as a cook at $18.00 and 15 hours as a cashier at $16.00, 45 hours in all.

| Step | Amount |
| --- | --- |
| Straight time: 30 × $18.00 + 15 × $16.00 | $780.00 |
| Regular rate: $780.00 ÷ 45 | $17.3333 |
| Overtime premium: 5 × ½ × $17.3333 | $43.33 |
| **Total for the week** | **$823.33** |

Section 7(g)(2) allows an alternative by agreement made before the work: pay the overtime hours at one and a half times the rate for the work actually done in them. If the last 5 hours were cashier hours, the week is 30 × $18.00 + 10 × $16.00 + 5 × $24.00 = $820.00, which is lawful with the prior agreement and $3.33 less than the weighted average. Without the agreement, the weighted average is the rule, and an engine that pays overtime at the rate of the "primary" job is wrong in either direction depending on which job the overtime fell in.

## Bonuses and Retro Overtime

A bonus earned over several workweeks raises each of those weeks' regular rates. When it can't be computed until the period ends, the employer may pay overtime on the other pay first; once the bonus is determinable it "must be included in computing his regular hourly rate of pay and overtime compensation," apportioned back over the workweeks it was earned in, with extra overtime for each overtime week (29 CFR 778.209(a)). If it can't be tied to particular weeks, "some other reasonable and equitable method of allocation must be adopted," such as assuming equal bonus earnings each week or each hour (778.209(b)).

A worked example of my own: an hourly employee at $20.00 earns a $400.00 production bonus for a four-week period, paid after the period closes. The four weeks had 40, 44, 50 and 38 hours, and overtime on the base rate was paid at the time.

| Week | Hours | Overtime hours | Equal per week: share | Per-hour value | Extra overtime |
| --- | --- | --- | --- | --- | --- |
| 1 | 40 | 0 | $100.00 | $2.5000 | $0.00 |
| 2 | 44 | 4 | $100.00 | $2.2727 | 4 × ½ × $2.2727 = $4.55 |
| 3 | 50 | 10 | $100.00 | $2.0000 | 10 × ½ × $2.0000 = $10.00 |
| 4 | 38 | 0 | $100.00 | $2.6316 | $0.00 |
| **Total** | 172 | 14 | $400.00 | | **$14.55** |

Allocating equally per hour instead gives every hour $400.00 ÷ 172 = $2.3256, and extra overtime of 14 × ½ × $2.3256 = $16.28. Both are reasonable and equitable methods; the engine needs one method per bonus plan, recorded with each allocation, and the same method every time. The $14.55 is paid with the bonus, it is FLSA-required overtime premium for the qualified overtime deduction in the weeks it belongs to, and it is reported in the year paid ([Retro Overtime from Bonuses](/books/workforce/retro-pay-voids-and-corrections#retro-overtime-from-bonuses)).

The calculation is small; the bookkeeping isn't. The engine has to find every workweek the bonus covers, recompute each week's regular rate with the share added, and pay the difference in premium, which means it needs each past week's includable pay and hours as they were, not as they are now ([As-Of Queries](/docs/database/temporal-data#as-of-queries)). A sketch in integer cents and hundredths of an hour, rounding once per week, half up; it assumes straight time for every hour is already in the week's earnings, as it is for hourly, piece and day-rate pay:

```go tab="Go"
package overtime

const fortyHours = 4000 // hours are in hundredths

// Earning is one kind of pay for the workweek, straight time only.
type Earning struct {
	Cents      int64
	Includable bool // false for section 7(e) exclusions
}

// Week is one fixed workweek's pay and all hours worked, in hundredths.
type Week struct {
	Earnings  []Earning
	HoursX100 int64
}

// Premium is the half-time premium section 7(a) requires for the week, in
// cents: includable pay over all hours, times half, times hours over 40.
func Premium(w Week) int64 {
	if w.HoursX100 <= fortyHours {
		return 0
	}
	var includable int64
	for _, e := range w.Earnings {
		if e.Includable {
			includable += e.Cents
		}
	}
	num := includable * (w.HoursX100 - fortyHours)
	den := 2 * w.HoursX100
	return (num + den/2) / den
}

// RetroPremium allocates a bonus equally across the weeks it was earned in
// (29 CFR 778.209(b)) and returns the extra premium owed for each week.
func RetroPremium(weeks []Week, bonusCents int64) []int64 {
	n := int64(len(weeks))
	out := make([]int64, len(weeks))
	for i, w := range weeks {
		share := bonusCents / n
		if int64(i) == n-1 {
			share += bonusCents % n // the remainder lands in the last week
		}
		with := w
		with.Earnings = append(append([]Earning{}, w.Earnings...), Earning{share, true})
		out[i] = Premium(with) - Premium(w)
	}
	return out
}
```

```rust tab="Rust"
const FORTY_HOURS: i64 = 4000; // hours are in hundredths

/// One kind of pay for the workweek, straight time only.
#[derive(Clone)]
pub struct Earning {
    pub cents: i64,
    pub includable: bool, // false for section 7(e) exclusions
}

/// One fixed workweek's pay and all hours worked, in hundredths.
#[derive(Clone)]
pub struct Week {
    pub earnings: Vec<Earning>,
    pub hours_x100: i64,
}

/// The half-time premium section 7(a) requires for the week, in cents.
pub fn premium(w: &Week) -> i64 {
    if w.hours_x100 <= FORTY_HOURS {
        return 0;
    }
    let includable: i64 = w.earnings.iter().filter(|e| e.includable).map(|e| e.cents).sum();
    let num = includable * (w.hours_x100 - FORTY_HOURS);
    let den = 2 * w.hours_x100;
    (num + den / 2) / den
}

/// Allocates a bonus equally across its weeks (29 CFR 778.209(b)) and
/// returns the extra premium owed for each week.
pub fn retro_premium(weeks: &[Week], bonus_cents: i64) -> Vec<i64> {
    let n = weeks.len() as i64;
    weeks
        .iter()
        .enumerate()
        .map(|(i, w)| {
            let mut share = bonus_cents / n;
            if i as i64 == n - 1 {
                share += bonus_cents % n; // the remainder lands in the last week
            }
            let mut with = w.clone();
            with.earnings.push(Earning { cents: share, includable: true });
            premium(&with) - premium(w)
        })
        .collect()
}
```

With the table's weeks (week 2 is 88,000 cents over 4,400 hundredths of an hour), `Premium` returns 4,000 cents before the bonus and 4,455 after, so the retro premium for week 2 is $4.55, and week 3's is $10.00. Computing the premium from the exact fraction and rounding once avoids the drift that comes from rounding the regular rate to cents first: in the two-rate example, a rate rounded to $17.33 times 2.5 hours of half-time is $43.325, a second rounding away from the exact $43.33, and across many weeks and employees rate-first rounding loses cents in one direction. The same function, called on a week with a differential or a commission, gives the weighted premium that Check asks partners to compute.

## California's Regular Rate

California follows the federal regular rate in most respects, and departs in two that change numbers.

**Flat-sum bonuses divide by nonovertime hours.** In *Alvarado v. Dart Container* (March 5, 2018), the California Supreme Court held that for a flat-sum bonus earned in a pay period, the divisor for the bonus's per-hour value is "the number of nonovertime hours the employee worked during the pay period," not all hours, and the overtime on the bonus is that per-hour value times 1.5 times the overtime hours. The bonus there was a $15 attendance bonus for each weekend shift completed. A worked example of my own: a $20.00 hourly employee in California works 45 hours in a week, 5 of them weekly overtime, and earns a $50.00 flat attendance bonus.

| | Federal method | California (*Alvarado*) |
| --- | --- | --- |
| Straight time: 45 × $20.00 | $900.00 | 40 × $20.00 = $800.00 |
| Overtime on the hourly rate | 5 × ½ × $20.00 = $50.00 premium | 5 × 1.5 × $20.00 = $150.00 |
| Bonus | $50.00 | $50.00 |
| Overtime on the bonus | 5 × ½ × ($50 ÷ 45) = $2.78 | 5 × 1.5 × ($50 ÷ 40) = $9.38 |
| **Total** | **$1,002.78** | **$1,009.38** |

The California method owes $6.60 more for the week. An engine that runs one regular rate formula for every state underpays every California employee with a flat-sum bonus in an overtime week.

**Premiums are paid at the same regular rate.** Labor Code 226.7(c) requires "one additional hour of pay at the employee's regular rate of compensation" for a missed meal, rest or recovery period, and in *Ferra v. Loews Hollywood Hotel* (July 15, 2021) the court held that "'regular rate of compensation' under section 226.7(c), like 'regular rate of pay' under section 510(a), encompasses all nondiscretionary payments, not just hourly wages," and applied the holding retroactively. So the meal premium engine reads the regular rate calculation ([Breaks, Premiums & Attestations](/books/workforce/breaks-and-premiums#the-premium-at-the-regular-rate-of-compensation)).

California also converts salaries for nonexempt employees by dividing the annual salary by 52 and then by 40, per the DLSE, so a nonexempt salaried employee's regular rate there assumes a 40-hour week whatever the schedule.

## State Daily and Seventh-Day Overtime

Four states add daily rules, each with its own definitions:

| State | Rule | Coverage and definitions |
| --- | --- | --- |
| **California** (Labor Code 510(a)) | 1.5× for "Any work in excess of eight hours in one workday and any work in excess of 40 hours in any one workweek" and for "the first eight hours worked on the seventh day of work in any one workweek"; 2× for "Any work in excess of 12 hours in one day" and for "any work in excess of eight hours on any seventh day of a workweek" | Alternative workweek schedules adopted by employee vote change the daily threshold |
| **Alaska** | "An employer may not employ an employee for a workweek longer than 40 hours or for more than eight hours in a day" without 1.5× | Doesn't apply to "Any employee of an employer who employs less than 4 employees in the regular course of business" |
| **Nevada** (NRS 608.018) | For employees paid less than 1.5 times the minimum wage: 1.5× for "More than 40 hours in any scheduled week of work" or "More than 8 hours in any workday," unless by mutual agreement the employee works a scheduled 10 hours a day for 4 days | A workday is "a period of 24 consecutive hours which begins when the employee begins work" (NRS 608.0126); a long list of exemptions in 608.018(3) |
| **Colorado** (COMPS Order #40, Rule 4.1.1) | 1.5× for work in excess of 40 hours per workweek, 12 hours per workday, or 12 consecutive hours "without regard to the start and end time of the workday" | Exemptions and variances in Rule 2; "Whichever of the three calculations ... results in the greater payment of wages shall apply" |

Colorado's rule comes from its COMPS Order, a regulation (7 CCR 1103-1) reissued by number: Order #40 was adopted December 8, 2025 and took effect February 1, 2026. Its 12-consecutive-hours test is the unusual one: a shift that crosses the workday boundary can trigger daily overtime even when neither workday exceeds 12 hours, meal periods may be subtracted from the consecutive hours only if they comply with the order's meal period rule (4.1.5), and paying it "will not alter the employee's established workday or workweek" (4.2). An engine should load the rule from the order in force, keyed by order number and effective date.

### Worked Numbers: A California Week

An invented hourly employee at $20.00 with no other pay works all seven days of a Sunday-to-Saturday workweek: 6, 10, 13, 8, 8, 9 and 9 hours, 63 in all. Saturday is the seventh consecutive day.

| Day | Hours | Regular | 1.5× | 2× | Why |
| --- | --- | --- | --- | --- | --- |
| Sunday | 6 | 6 | | | |
| Monday | 10 | 8 | 2 | | over 8 |
| Tuesday | 13 | 8 | 4 | 1 | over 8, over 12 |
| Wednesday | 8 | 8 | | | |
| Thursday | 8 | 8 | | | |
| Friday | 9 | 2 | 1 + 6 | | over 8 daily; 6 regular hours past 40 become weekly overtime |
| Saturday | 9 | | 8 | 1 | seventh day: first 8 at 1.5×, over 8 at 2× |
| **Week** | **63** | **40** | **21** | **2** | |

Regular hours accumulate 6, 14, 22, 30 and 38 through Thursday, so only 2 of Friday's 8 daily-regular hours fit under 40; the other 6 are weekly overtime. Pay is 40 × $20.00 + 21 × $30.00 + 2 × $40.00 = $800.00 + $630.00 + $80.00 = **$1,510.00**. Under the FLSA alone, 23 hours over 40 at time and a half is $800.00 + 23 × $30.00 = $1,490.00; California's rules add the $20.00 from the two double-time hours.

The same week shows why the FLSA premium has to be computed separately even in California. The FLSA-required premium is 23 × ½ × $20.00 = $230.00 (the daily overtime premiums are excluded from the regular rate under 7(e)(5) and credited against the weekly overtime under 7(h)); California paid $250.00 of premium (21 × $10.00 + 2 × $20.00). The qualified overtime amount for code TT is $230.00, not $250.00 ([The Qualified Overtime Deduction](/books/workforce/tips-and-the-2025-deductions#the-qualified-overtime-deduction)).

### Worked Numbers: Nevada's Rolling Workday

Nevada's workday starts when the employee starts work and runs 24 hours. An invented employee paid $15.00 an hour (under 1.5 times Nevada's $12.00 minimum, so daily overtime applies) works 2:00 p.m. to 10:00 p.m. Monday and 6:00 a.m. to 2:00 p.m. Tuesday. Monday's workday runs from 2:00 p.m. Monday to 2:00 p.m. Tuesday and holds all 16 hours, so 8 of them are daily overtime, though neither shift is longer than 8 hours. An engine that defines the workday as the calendar day finds no overtime. The same employee at $18.00 or more is outside the daily rule and owed only weekly overtime.

## The Order of Operations

Layered rules need an order, and the federal principle that keeps them from double counting is crediting: premium paid for hours over a daily standard is excludable from the regular rate and "creditable" against weekly overtime, so the same hour isn't paid an overtime premium twice (29 CFR 778.202; its example is a $12.00 rate with a $12.50 rate over 8 hours in a day, where the $0.50 daily premiums are credited against the weekly overtime owed). The engine sequence most products implement, and the one I use:

1. **Split hours into workdays and workweeks** on each rule set's own definitions (calendar day, Nevada's rolling 24 hours, the fixed workweek).
2. **Classify each workday's hours** under daily rules: regular, 1.5×, 2×, including seventh-day rules.
3. **Count daily-regular hours against the weekly threshold** in order through the week, converting regular hours past 40 to weekly overtime; hours already paid as daily overtime don't count again.
4. **Compute the regular rate** for the week from includable pay over all hours, by the jurisdiction's method (*Alvarado* in California for flat-sum bonuses).
5. **Price each overtime hour** at its multiple of the regular rate, and record the FLSA-required premium separately from what state law or a contract added.
6. **Compare with the FLSA alone** and pay the higher where rules differ.

Housecall Pro's documentation states the same convention for its own time product ("If the daily overtime and weekly overtime rules are turned on at the same time, daily overtime hours are counted first"), and 7shifts' fields separate daily, weekly and consecutive-day overtime from double time. <!-- source-gap: wf-ca-ot-order | missing | California's primary-source rule for applying daily overtime before weekly overtime on the remaining hours (DLSE Enforcement Manual section 48) | closes with: the DLSE Enforcement Policies and Interpretations Manual overtime section from dir.ca.gov | checked: 2026-11-10 --> California's enforcement manual (the March 2011 edition on dir.ca.gov) doesn't state the sequence in so many words, as far as I searched it, so the order here rests on vendor documentation rather than a primary source.

## Exemptions and the Salary Level

The white-collar exemptions take an employee outside overtime entirely if three tests are met: paid on a salary or fee basis, at or above the salary level, with a primary duty that fits an exemption. DOL's Fact Sheet 17A (revised September 2019) states the levels in force:

- **Standard salary level:** at least $684 per week ($35,568 a year), "compensated on a salary basis." Nondiscretionary bonuses and incentive payments, including commissions, may cover up to 10% of it.
- **Highly compensated employees:** total annual compensation of $107,432 or more, including at least $684 a week on a salary or fee basis, who regularly perform at least one exempt duty.
- **Duties.** Executive (managing the enterprise or a recognized department, directing at least two full-time employees, with weight on hiring and firing), administrative (office or non-manual work tied to management or business operations, with discretion and independent judgment on significant matters), learned and creative professional, computer and outside sales. "Job titles do not determine exempt status," and the exemptions don't reach manual laborers or police, firefighters, paramedics and other first responders at any pay.

The 2024 rule that would have raised the standard level was vacated by federal courts, and on May 15, 2026 DOL published a technical amendment, "Implementation of Federal Court Judgments" (91 FR 27833, effective the same day), that "removes the vacated 2024 regulatory text" from the CFR and republishes the prior text. As of November 2026, $684 and $107,432 are the federal levels in the regulations.

States set their own, higher levels. California requires "a monthly salary equivalent to no less than two times the state minimum wage for full-time employment," with full-time defined as 40 hours a week (Labor Code 515(a), (c)); at the 2026 minimum of $16.90, that is 2 × $16.90 × 2,080 = **$70,304** a year. A system has to test each exempt employee against the federal level and the level in each state they work in, by date, and flag the ones that fall under when a state minimum wage rises on January 1 (since the California level moves with it). Exempt status is a property of the job assignment for a period in a jurisdiction (`job_assignments.flsa_status` plus state status), set by a reviewed classification, not by title or pay alone.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) and the time record in [The Workweek & the Time Record](/books/workforce/time-and-attendance#how-to-build-it). Overtime rules are data per jurisdiction and employment; the regular rate calculation is a stored record per worker per workweek; bonus allocations tie a bonus to the weeks it reached back into. `qualified_overtime_amounts` (defined in [Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions#how-to-build-it)) is written from the calculation.

```sql
CREATE TABLE overtime_rules (              -- a rule set: federal, a state, a contract, 8 and 80
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  code                TEXT NOT NULL,         -- 'flsa', 'us-ca', 'us-ak', 'us-nv', 'cba-123', ...
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- null for contractual rules
  source              TEXT NOT NULL CHECK (source IN ('statute', 'contract', 'policy')),
  workday_definition  TEXT NOT NULL CHECK (workday_definition IN ('calendar_day',
                        'rolling_24h_from_start', 'employer_defined')),
  weekly_threshold    NUMERIC(5, 2),         -- 40.00; null where the rule has none
  daily_tiers         JSONB NOT NULL DEFAULT '[]',   -- [{"over": 8, "multiplier": 1.5},
                                             --  {"over": 12, "multiplier": 2.0}]
  seventh_day_tiers   JSONB NOT NULL DEFAULT '[]',   -- [{"over": 0, "multiplier": 1.5},
                                             --  {"over": 8, "multiplier": 2.0}]
  applies_when        JSONB NOT NULL DEFAULT '{}',   -- {"min_employees": 4} (AK),
                                             -- {"rate_below_min_wage_multiple": 1.5} (NV)
  bonus_divisor       TEXT NOT NULL DEFAULT 'all_hours' CHECK (bonus_divisor IN
                        ('all_hours', 'nonovertime_hours')),   -- 'nonovertime_hours' in CA
  includable_pay_item_types TEXT[] NOT NULL,  -- the regular rate's numerator, by catalog type
  valid_during        DATERANGE NOT NULL,
  UNIQUE (code, valid_during)
);

ALTER TABLE job_assignments
  ADD COLUMN overtime_rule_codes TEXT[] NOT NULL DEFAULT ARRAY['flsa'],  -- all that apply
  ADD COLUMN state_exempt_status TEXT CHECK (state_exempt_status IN ('exempt', 'nonexempt')),
  ADD COLUMN classification_review_id UUID,  -- the reviewed decision behind flsa_status
  ADD COLUMN fluctuating_workweek BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN alt_7g2_agreement_document_id UUID REFERENCES documents (id);  -- 7(g)(2)

CREATE TABLE regular_rate_calculations (   -- one per worker per workweek per rule set
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  workweek_start      DATE NOT NULL,
  overtime_rule_id    UUID NOT NULL REFERENCES overtime_rules (id),
  version             INT NOT NULL,          -- 1, then 2 when a bonus or correction reaches back
  hours_worked        NUMERIC(7, 2) NOT NULL,
  includable_cents    BIGINT NOT NULL,
  excluded_cents      BIGINT NOT NULL,       -- with detail in inputs, for 516.2(a)(6)
  regular_rate        NUMERIC(12, 4) NOT NULL,   -- for display and records; premiums use the fraction
  hours_by_tier       JSONB NOT NULL,        -- {"regular": 40, "ot_1_5": 21, "ot_2_0": 2}
  premium_required_cents BIGINT NOT NULL,    -- what this rule set requires
  flsa_premium_cents  BIGINT,                -- the FLSA section 7 premium, on every row
  inputs              JSONB NOT NULL,        -- statement line ids, time entry ids, rule version
  calculation_run_id  UUID REFERENCES calculation_runs (id),
  pay_statement_id    UUID REFERENCES pay_statements (id),
  supersedes_id       UUID REFERENCES regular_rate_calculations (id),
  UNIQUE (worker_id, workweek_start, overtime_rule_id, version)
);

CREATE TABLE bonus_allocations (           -- 778.209: a bonus apportioned back over its weeks
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  bonus_line_id       UUID NOT NULL REFERENCES pay_statement_lines (id),
  method              TEXT NOT NULL CHECK (method IN ('equal_per_week', 'equal_per_hour',
                        'actual_by_week')),
  earning_period      DATERANGE NOT NULL,    -- the weeks the bonus was earned in
  workweek_start      DATE NOT NULL,
  allocated_cents     BIGINT NOT NULL,
  before_calc_id      UUID NOT NULL REFERENCES regular_rate_calculations (id),
  after_calc_id       UUID NOT NULL REFERENCES regular_rate_calculations (id),
  retro_premium_cents BIGINT NOT NULL,       -- after minus before, paid with the bonus
  retro_line_id       UUID REFERENCES pay_statement_lines (id),
  UNIQUE (bonus_line_id, workweek_start)
);

ALTER TABLE pay_statement_lines
  ADD COLUMN regular_rate_calculation_id UUID REFERENCES regular_rate_calculations (id),
  ADD COLUMN overtime_tier TEXT CHECK (overtime_tier IN ('ot_1_5', 'ot_2_0', 'premium_only'));
```

A pay run computes, for each worker and each workweek ending in the period, one `regular_rate_calculations` row per applicable rule set (federal always, plus the state and any contract), pays the highest result per hour, writes the overtime lines with their tier and the calculation they came from, and writes `qualified_overtime_amounts` from the federal row. A bonus with an earning period creates `bonus_allocations` rows, each with a new calculation version for its week, and one retro premium line per week with that week as its `work_period`. A correction to hours in a past week does the same, as a new version that supersedes the old.

Design notes:

- **Inclusion lives on the rule set, by pay item type.** A new company code maps to a catalog type, and the type's inclusion is already decided for every jurisdiction ([Pay item type, not company code, drives tax](/books/workforce/workforce-business#the-core-data-model) applies to overtime too).
- **Keep the fraction, round the premium.** Store the regular rate to four places for records, but compute premiums from includable cents over hours and round once.
- **Every rule set runs every week,** and the federal premium is recorded even when state rules pay more, because the federal number is the one the W-2 needs.
- **Versions, not edits.** A bonus or a correction creates a new calculation version and a retro line; the original calculation stays as it was paid ([Snapshots](/docs/database/temporal-data#snapshots)).

## Auditing

An overtime audit, whether DOL's, a state's or a class action's, reconstructs each workweek:

- **The regular rate per worker per workweek** with the hours, includable pay and the amount and nature of each exclusion, which is 516.2(a)(6) itself.
- **The rule sets applied** and their versions, the workday and workweek definitions used, and the hours by tier.
- **Every bonus allocation** with its method, earning period, the weeks it reached and the retro premium paid for each.
- **The FLSA premium beside the state and contractual premium,** so the qualified overtime amount and the 207(h) crediting can be recomputed.
- **Exempt classifications** with the salary tested against each applicable level by date, and the review behind each duties decision.
- **Agreements that change the math:** fluctuating workweek understandings, 7(g)(2) agreements, alternative workweek elections, and Nevada's four-by-ten agreements.

## What This Means for the System You Build

- **Compute the regular rate every workweek** from includable pay over all hours, never from the base rate.
- **Decide inclusion per pay item type and jurisdiction,** versioned, so a new earning code can't silently drop out of overtime.
- **Apportion multi-week bonuses back** with a recorded method and pay the retro premium per week.
- **Run federal, state and contract rule sets side by side,** daily first, weekly on the rest, and pay the higher.
- **Define workdays per rule set,** including Nevada's rolling 24 hours and California's seventh day.
- **Use California's nonovertime-hours divisor for flat-sum bonuses** and its regular rate for premiums.
- **Store the FLSA premium separately** from every other overtime dollar.
- **Test exempt salaries against every applicable level by date,** and re-test when minimum wages change.

## References

**Law and regulation**

- [Colorado COMPS Order #40, 7 CCR 1103-1 (PDF)](https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12406&fileName=7+CCR+1103-1), adopted December 8, 2025 and effective February 1, 2026: Rule 4.1.1's three overtime tests, 4.1.2's greater-payment rule, 4.1.5 meal periods and 4.2
- [29 USC 207: Maximum hours](https://www.law.cornell.edu/uscode/text/29/207), overtime at one and one-half times the regular rate, the 7(e) exclusions, 7(g) rates for different kinds of work and 7(h) crediting
- [29 CFR 778.105: Determining the workweek](https://www.law.cornell.edu/cfr/text/29/778.105), the fixed 168-hour workweek
- [29 CFR 778.114: Fluctuating workweek method](https://www.law.cornell.edu/cfr/text/29/778.114), fixed salary for varying hours, half-time premium and the $600 example
- [29 CFR 778.115: Employees working at two or more rates](https://www.law.cornell.edu/cfr/text/29/778.115), the weighted average
- [29 CFR 778.202: Premium pay for hours in excess of a daily or weekly standard](https://www.law.cornell.edu/cfr/text/29/778.202), daily premiums excluded and credited against weekly overtime
- [29 CFR 778.209: Method of inclusion of bonus in regular rate](https://www.law.cornell.edu/cfr/text/29/778.209), apportionment back over the weeks and reasonable and equitable methods
- [29 CFR 778.211: Discretionary bonuses](https://www.law.cornell.edu/cfr/text/29/778.211), discretion as to fact and amount, labels not controlling, and the 2019 examples
- [29 CFR 778.219: Pay for foregoing holidays and vacations](https://www.law.cornell.edu/cfr/text/29/778.219), payments for forgone leave excluded
- [29 CFR 778.222: Other payments similar to call-back pay](https://www.law.cornell.edu/cfr/text/29/778.222), state and local scheduling law payments excluded unless prearranged
- [Federal Register: Regular Rate Under the Fair Labor Standards Act (84 FR 68736)](https://www.federalregister.gov/api/v1/documents/2019-26447.json), published December 16, 2019, effective January 15, 2020
- [Federal Register: Defining and Delimiting the Exemptions, Implementation of Federal Court Judgments (91 FR 27833)](https://www.federalregister.gov/api/v1/documents/2026-09839.json), the vacated 2024 text removed and the prior text restored, May 15, 2026
- [California Labor Code 510](https://california.public.law/codes/ca_lab_code_section_510), daily, weekly and seventh-day overtime and double time
- [California Labor Code 515](https://california.public.law/codes/ca_lab_code_section_515), the exempt salary of two times the state minimum wage for 40 hours a week
- [Nevada Revised Statutes chapter 608](https://www.leg.state.nv.us/nrs/nrs-608.html), 608.018 overtime for employees under 1.5 times the minimum wage and 608.0126 the 24-hour workday

**Agency guidance and forms**

- [DOL WHD: Fact Sheet 23, Overtime pay requirements of the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay), the regular rate's scope and the salaried nonexempt example
- [DOL WHD: Fact Sheet 17A, Exemption for executive, administrative, professional, computer and outside sales employees](https://www.dol.gov/agencies/whd/fact-sheets/17a-overtime), the $684 and $107,432 levels, the 10% bonus credit and the duties tests
- [DOL WHD: State minimum wage laws](https://www.dol.gov/agencies/whd/minimum-wage/state), California's $16.90 and Nevada's $12.00
- [California DLSE: Overtime FAQ](https://www.dir.ca.gov/dlse/faq_overtime.htm), weighted averages, salary conversion, nondiscretionary bonuses and paid time off not counted toward 40
- [Alaska Department of Labor: Wage and Hour Act](https://labor.alaska.gov/lss/whact.htm), 8 and 40 hours and the under-4-employees exemption

**Courts and enforcement**

- [Supreme Court of California: Alvarado v. Dart Container Corp., S232607 (PDF)](https://www4.courts.ca.gov/opinions/archive/S232607.PDF), the flat-sum bonus divided by nonovertime hours
- [Supreme Court of California: Ferra v. Loews Hollywood Hotel, S259172 (PDF)](https://www4.courts.ca.gov/opinions/archive/S259172.PDF), premiums at the regular rate including nondiscretionary pay

**Vendor documentation**

- [Check: Working with piece rate pay](https://docs.checkhq.com/docs/working-with-piece-rate-pay.md), no weighted overtime calculation and the partner's average regular rate
- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings), overtime, double overtime and weighted overtime memo types
- [Deputy: Pay rules](https://developer.deputy.com/docs/pay-rules.md), multipliers and remuneration bases
- [Deputy: TimesheetPayReturn](https://developer.deputy.com/docs/timesheetpayreturn.md), pay lines from approved timesheets
- [Gusto Embedded: Payroll by workweek](https://docs.gusto.com/embedded-payroll/docs/payroll-by-workweek.md), the weighted rate example, `included_in_overtime_pay` and premium carryovers
- [Gusto Embedded: Payroll by workweek support for earning types, pay schedules and payrolls](https://docs.gusto.com/embedded-payroll/changelog/added-payroll-by-workweek-support-for-earning-types-pay-schedules-and-payrolls.md), per-workweek overtime and `workweek_start_day`
- [Housecall Pro: Run payroll using time tracking](https://help.housecallpro.com/en/articles/8594391-how-to-run-payroll-using-time-tracking), daily overtime counted first
- [Rippling: Create a time entry](https://developer.rippling.com/documentation/rest-api/guides/create-time-entry.md), computed regular, overtime and double overtime hours
- [7shifts: Get hours and wages](https://developers.7shifts.com/reference/gethoursandwages.md), premium and non-premium overtime and the qualified premium
- [7shifts: Qualified OT added to worked hours and wages](https://developers.7shifts.com/changelog/qualified-ot-added-to-worked-hours-wages.md), the FLSA overtime premium as a field
- [Square: Update workweek config](https://developer.squareup.com/reference/square/labor-api/update-workweek-config), the workweek for overtime
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), computed overtime hours
- [Zeal: Overtime compliance](https://docs.zeal.com/docs/overtime-compliance.md), 1.5 times the regular rate, the fixed workweek and the overtime recommendation flag
