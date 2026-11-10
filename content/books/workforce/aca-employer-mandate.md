+++
title = "The ACA Employer Mandate & 1095-C"
nav_title = "ACA Employer Mandate"
description = "ALE status, full-time measurement and look-back periods, 2026 affordability at 9.96%, 4980H penalties worked, Forms 1094-C and 1095-C codes, and Letter 226-J."
category = "Workforce Industry"
order = 2647
part = "Benefits Administration"
tags = ["benefits", "aca", "4980h", "form-1095-c", "affordability", "measurement-periods"]
+++

The Affordable Care Act's employer mandate is not a requirement to offer coverage. It is a tax that applies when an employer large enough to be covered doesn't offer coverage, or offers coverage that is too expensive or too thin, and one of its full-time employees buys subsidized coverage on an exchange instead. Section 4980H calls the tax an assessable payment, the IRS calls it the employer shared responsibility payment, and the employer learns it owes one years later, from a letter that compares its own Forms 1094-C and 1095-C with the premium tax credits its employees claimed. Everything the employer can do to avoid the payment, and everything it must report, is computed month by month from hours, offers and the employee's share of the cheapest plan.

So the mandate is a payroll and timekeeping problem wearing a benefits label. Whether an employer is covered depends on last year's monthly headcount of full-time employees and full-time equivalents built from hours of service; whether an employee is full-time depends on hours measured monthly or over a look-back period of up to 12 months; whether an offer was affordable depends on the employee's required contribution against 9.96% of household income for 2026, which employers test with safe harbors built on W-2 wages, the rate of pay or the poverty line; and the penalty for each month is a formula with 2026 amounts of $3,340 and $5,010 a year. This chapter covers applicable large employer status, full-time determination and the look-back measurement method, affordability safe harbors, the two penalties worked, Forms 1094-C and 1095-C and their codes, the 2024 reporting laws, and Letter 226-J. Enrollment itself is in Enrollment & Life Events; the hours come from [The Workweek & the Time Record](/books/workforce/time-and-attendance).

## How the Platforms Do It

ACA tracking and reporting is a module in most HCM suites, because the inputs (hours, hire dates, offers, enrollments, W-2 wages) already live there. From public product pages, as of November 2026:

| Platform | What it states | Notes |
| --- | --- | --- |
| **Paycom** | An ACA dashboard with "measurement period details," alerts for "closing measurement periods" and when the company nears applicable large employer status; "automatically populating necessary forms," mailing a "physical 1095-C," and filing "Forms 1094-B and -C" with the IRS and state filings in certain jurisdictions | Measurement, forms and filing in one module |
| **Rippling** | "tracking employee hours for insurance eligibility," an Eligibility Report projecting eligibility for any measurement period, generating and filing the 1094-C "on your behalf," and 1095-Cs delivered through the employee profile | Hours from its own payroll |

The pattern: **the vendor computes monthly status from payroll hours and the benefits record, and the employer still owns the inputs** (the measurement method elected, the offer made, the safe harbor chosen) and the liability. A provider can fill in a 1095-C; it can't make an unaffordable offer affordable.

## Who Is Covered: Applicable Large Employer Status

An **applicable large employer** (ALE) is one that "employed an average of at least 50 full-time employees on business days during the preceding calendar year" (26 USC 4980H(c)(2)(A)), counting **full-time equivalents** for this test only. The computation, from 26 CFR 54.4980H-2:

- For each month of the prior year, count full-time employees (those with 130 or more hours of service in the month) and add full-time equivalents: the hours of everyone else, counting "not more than 120 hours of service" per employee, divided by 120 (fractions may be kept to hundredths).
- Add the 12 monthly totals and divide by 12; a fraction is "rounded to the next lowest whole number." Fifty or more is an ALE for the current year.
- **Seasonal exception.** An employer over 50 for 120 days or fewer in the year, where the excess was seasonal workers, is not an ALE; four calendar months, not necessarily consecutive, may be treated as 120 days.
- **Aggregation.** Employers under common control (IRC 414(b), (c), (m) and (o)) are counted together: the regulation's example is two corporations with 40 and 60 full-time employees that together are an ALE of 100. Each member still files its own returns, and the 30-employee reduction in the penalty is shared among them.
- **New employers** are ALEs in their first year if they reasonably expect, and actually have, an average of 50.

A worked example of my own: an employer has 40 full-time employees every month of 2025, and part-time staff whose hours, each capped at 120, total 1,500 a month. Each month is 40 + 1,500 ÷ 120 = 52.5; the year averages 52.5, rounded down to 52. The employer is an ALE for 2026, even though it never had 50 full-time employees. With 1,100 part-time hours a month, each month would be 40 + 9.17 = 49.17 and the employer would not be an ALE.

An **hour of service** is "each hour for which an employee is paid, or entitled to payment, for the performance of duties," plus paid leave, so vacation, holiday and sick hours count and the timekeeping system's hours worked don't suffice by themselves (54.4980H-1). The engine sums paid hours by pay item type, which is one more reason the [pay item catalog](/books/workforce/workforce-business#the-core-data-model) carries hours on leave lines.

## Who Is Full-Time

A **full-time employee** averages "at least 30 hours of service per week," and "130 hours of service in a calendar month is treated as the monthly equivalent" (54.4980H-1(a)(21)). An ALE determines status by one of two methods, chosen per category of employee.

**The monthly measurement method.** Each month stands alone: 130 hours makes the employee full-time for that month. It is simple and it is volatile, because an hourly employee who works 128 hours in a short month and 134 in a long one flips status, and an offer has to follow. A new employee who is otherwise eligible doesn't trigger a penalty for the first three full calendar months if offered coverage by "the first day of the fourth full calendar month of employment" (54.4980H-3).

**The look-back measurement method.** Hours over a past period decide status for a future one, so status is stable even when hours aren't. For **ongoing employees** (54.4980H-3(d)):

- A **standard measurement period** of up to 12 months, the same for everyone in a category.
- An optional **administrative period** of up to 90 days to compute status and run enrollment.
- A **stability period** of "at least six consecutive calendar months" and no shorter than the measurement period, during which the status determined holds regardless of current hours.

For **new variable hour, seasonal and part-time employees**, an **initial measurement period** of 3 to 12 months starting near the hire date, and an administrative period, which together can't extend past "the last day of the first calendar month" beginning on or after the employee's first anniversary. A rehire after at least 13 consecutive weeks with no hours (26 for educational organizations) may be treated as a new employee.

Worked with invented dates and hours:

| Item | Ongoing employees | A new variable hour employee hired May 10, 2026 |
| --- | --- | --- |
| Measurement period | October 15, 2025 to October 14, 2026 (12 months) | June 1, 2026 to May 31, 2027 (12 months from the first of the month after hire) |
| Administrative period | October 15 to December 31, 2026 (78 days) | June 1 to June 30, 2027 (30 days) |
| Stability period | January 1 to December 31, 2027, matching the plan year | July 1, 2027 to June 30, 2028 |
| The limit it must meet | Admin period at most 90 days; stability at least as long as the measurement period | The initial period plus admin can't pass June 30, 2027, the last day of the first calendar month after the May 10, 2027 anniversary |

An employee with 1,612 hours of service in the ongoing measurement period averages 1,612 ÷ 52 = 31.0 hours a week and is full-time for all of 2027, offered coverage in the fall 2026 open enrollment that the administrative period exists to run. One with 1,508 hours (29.0 a week) is not full-time for 2027 even if they work 40 hours a week in January. During the new employee's initial measurement period, the employer owes no penalty for that employee's months, which the 1095-C reports with code 2D.

## Affordability and Minimum Value

An offer avoids the second penalty for an employee only if the coverage provides **minimum value** and is **affordable**. For 2026, affordability means the employee's required contribution for self-only coverage is no more than 9.96% of household income: Rev. Proc. 2025-25 sets the required contribution percentage "for plan years beginning in calendar year 2026" at 9.96%. The employer doesn't know household income, so the regulations give three safe harbors on the employee's share of "the employer's lowest-cost self-only coverage that provides minimum value" (54.4980H-5(e)(2)), each stated as 9.5% and indexed to the year's percentage:

| Safe harbor | Test (monthly unless stated) | 2026 example of my own |
| --- | --- | --- |
| **Form W-2** | Annual required contribution at most 9.96% of the employee's box 1 wages for the year, prorated for months offered | Box 1 of $30,000: at most $2,988.00 a year, $249.00 a month |
| **Rate of pay** | At most 9.96% of 130 × the lower of the hourly rate at the start of the coverage period and the lowest rate in the month; for salaried employees, monthly salary, unless it was reduced | $18.00 an hour: 130 × $18.00 = $2,340.00, at most $233.06 a month |
| **Federal poverty line** | At most 9.96% of the single-person poverty guideline ÷ 12 | 2026 guideline $15,960 for the 48 states and DC: $1,330.00 a month, at most $132.47 |

The choice is a design decision with consequences. The W-2 safe harbor uses box 1, which pre-tax deductions reduce, so an employee who defers heavily to a 401(k) can make an offer unaffordable after the fact, and it can only be confirmed after year end. Rate of pay is known in advance but fails for an hourly employee whose rate drops. The poverty line safe harbor is the most conservative and the only one that is certain for every employee, which is why employers that want a single contribution for everyone price the lowest-cost plan below it. A safe harbor protects the employer from the (b) penalty "even if" the coverage isn't affordable under the employee's actual household income.

Two more terms. **Minimum essential coverage** is what avoids the first penalty; **minimum value**, a floor on the share of costs the plan pays, is what, with affordability, avoids the second. And for the first penalty an employee counts as offered coverage only if the employer "also offers coverage to that employee's dependents" (54.4980H-4).

## The Two Penalties, Worked

Section 4980H(a), the "no offer" penalty, applies for a month when an ALE fails "to offer to its full-time employees (and their dependents) the opportunity to enroll in minimum essential coverage" and at least one full-time employee gets a premium tax credit. An ALE is treated as offering if it offers to "all but five percent (or, if greater, five) of its full-time employees" (54.4980H-4). The payment is the number of full-time employees, minus 30, times 1/12 of the annual amount, every month the condition holds, for all full-time employees, not just the uninsured ones.

Section 4980H(b), the "unaffordable or inadequate offer" penalty, applies when the employer did offer, but a full-time employee wasn't offered, or was offered coverage that was unaffordable or not minimum value, and got a premium tax credit. It is 1/12 of the annual amount per such employee per month, capped at what (a) would have been.

The 2026 annual amounts, from Rev. Proc. 2025-26, are the statutory $2,000 and $3,000 times a premium adjustment percentage of 1.6726771319, rounded down to multiples of $10: "$2,000 x 1.6726771319 = $3,345.3542638 rounded down to $3,340" and "$3,000 x 1.6726771319 = $5,018.0313957 rounded down to $5,010," effective for years "beginning after December 31, 2025." Monthly, that is $278.33 and $417.50.

A worked example of my own, an ALE with 200 full-time employees in every month of 2026 (5% of 200 is 10):

| Scenario | Penalty | 2026 amount |
| --- | --- | --- |
| Offers to 189 (11 not offered, over the 5% margin); one employee gets a premium tax credit | (a): (200 - 30) × $3,340 | $567,800.00 for the year ($47,316.67 a month) |
| Offers to 190 (meets 95%); 6 of the 10 not offered and 2 offered unaffordable coverage get premium tax credits all year | (b): 8 × $5,010, capped at the (a) amount of $567,800 | $40,080.00 |
| Offers to 190 affordably under a safe harbor; the same 6 not offered get credits | (b): 6 × $5,010 | $30,060.00 |
| Offers to everyone, affordably under a safe harbor, minimum value | None, whatever employees' household incomes turn out to be | $0.00 |

The first row is the cliff the 95% rule creates: one employee too many without an offer moves the penalty from per-claimant to per-headcount. The monthly computation in code, with amounts in cents:

```go tab="Go"
package aca

// MonthPenalty returns the 4980H payment for one month, in cents, for an
// ALE member with its share of the 30-employee reduction.
func MonthPenalty(fullTime, reduction, ptcNotOffered, ptcUnaffordable int64,
	offeredAllBut5Pct bool, annualA, annualB int64) int64 {
	capA := (fullTime - reduction) * annualA / 12
	if capA < 0 {
		capA = 0
	}
	if !offeredAllBut5Pct {
		if ptcNotOffered+ptcUnaffordable > 0 {
			return capA // 4980H(a): every full-time employee, less the reduction
		}
		return 0
	}
	b := (ptcNotOffered + ptcUnaffordable) * annualB / 12 // 4980H(b)
	if b > capA {
		return capA
	}
	return b
}
```

```rust tab="Rust"
/// The 4980H payment for one month, in cents, for an ALE member with its
/// share of the 30-employee reduction.
pub fn month_penalty(
    full_time: i64, reduction: i64, ptc_not_offered: i64, ptc_unaffordable: i64,
    offered_all_but_5_pct: bool, annual_a: i64, annual_b: i64,
) -> i64 {
    let cap_a = ((full_time - reduction) * annual_a / 12).max(0);
    if !offered_all_but_5_pct {
        // 4980H(a): every full-time employee, less the reduction
        return if ptc_not_offered + ptc_unaffordable > 0 { cap_a } else { 0 };
    }
    // 4980H(b), capped at the (a) amount
    ((ptc_not_offered + ptc_unaffordable) * annual_b / 12).min(cap_a)
}
```

With `annualA = 334000` and `annualB = 501000`, the first scenario is 170 × 334,000 ÷ 12 = 4,731,666 cents a month (integer division truncates; the IRS computes the year from its own figures). The function doesn't know about premium tax credits until the IRS tells the employer, which is the point: the employer's system computes exposure from the 1095-C it filed, and the IRS computes the payment from the credits.

## Forms 1094-C and 1095-C

An ALE files one **Form 1094-C** (the transmittal, with ALE member information and monthly counts) and a **Form 1095-C** for each full-time employee, and for any employee enrolled in its self-insured plan. For the 2025 forms, the instructions say an ALE "must furnish a Form 1095-C to each of its full-time employees by March 2, 2026" and file with the IRS by "March 2, 2026, or March 31, 2026, if filing electronically"; anyone filing "10 or more information returns during the year" must file electronically. The 2026 instructions weren't published when I checked; the deadlines follow the same January 31 rule with its automatic 30-day extension for furnishing (Notice 2025-15).

**1094-C Part III** reports, per month, a "Minimum Essential Coverage Offer Indicator," the "Section 4980H Full-Time Employee Count for ALE Member," the "Total Employee Count for ALE Member" and an "Aggregated Group Indicator," so the IRS can compute the (a) penalty from the form alone. A box for the "98% Offer Method" lets an employer that offered affordable coverage to at least 98% of employees skip the full-time count.

**1095-C Part II** is the monthly story for one employee, in three lines:

| Line 14: the offer | Meaning |
| --- | --- |
| `1A` | Qualifying offer: minimum value coverage with an employee contribution at or below 9.5% (as adjusted) of the mainland single poverty line, and coverage offered to spouse and dependents |
| `1B` | Minimum value coverage offered to the employee only |
| `1C` | To the employee and dependents, not the spouse |
| `1D` | To the employee and spouse, not dependents |
| `1E` | To the employee, spouse and dependents |
| `1F` | Minimum essential coverage that is not minimum value |
| `1G` | Self-insured coverage for someone not full-time in any month (whole year or not at all) |
| `1H` | "No offer of coverage" |
| `1J`, `1K` | Conditional offers of spousal coverage |
| `1L` to `1U` | Individual coverage HRA offers, by who is covered and whether affordability used the employee's residence ZIP code or the primary employment site ZIP code (HSAs, FSAs & HRAs covers ICHRAs) |

**Line 15** is the employee required contribution: "the employee share of the monthly cost for the lowest-cost, self-only, minimum essential coverage providing minimum value," whatever the employee actually enrolled in, entered as "0.00," not blank, if free.

| Line 16: why no (b) penalty | Meaning |
| --- | --- |
| `2A` | Not employed during the month |
| `2B` | Not a full-time employee (or terminated with coverage ending before month end) |
| `2C` | Enrolled in the coverage offered, every day of the month |
| `2D` | In a section 4980H(b) limited non-assessment period, such as an initial measurement period |
| `2E` | Multiemployer interim relief |
| `2F`, `2G`, `2H` | Affordable under the W-2, poverty line or rate of pay safe harbor |

Part III, for self-insured plans, lists each covered person by month, with a date of birth "only if an SSN or other TIN is not entered."

The codes are a derived view, and the derivation is where errors live: line 14 comes from the offer records, line 15 from the rate tables and the lowest-cost plan, line 16 from the measurement results, enrollments and safe harbor. A 1095-C with `1E` and no `2C` or safe harbor code for an employee who got a premium tax credit is a (b) assessment waiting to happen; one with `1H` for a part-time employee should have `2B`.

## The 2024 Reporting Laws

Two laws signed December 23, 2024 changed the reporting:

- **The Paperwork Burden Reduction Act (P.L. 118-167)** created an alternative to furnishing: a filer is treated as furnishing the statement if it gives "clear, conspicuous, and accessible notice" that individuals may ask for a copy and furnishes it by the later of January 31 or "30 days after the date of such request," for calendar years after 2023. Notice 2025-15 extended it to ALEs' 1095-Cs for full-time employees: the notice must be posted on the website by the furnishing due date including the automatic 30-day extension and kept "through October 15" of the following year. The 2025 instructions apply it: posted "by March 2, 2026," retained through October 15, 2026.
- **The Employer Reporting Improvement Act (P.L. 118-168)** allows "the individual's full name and date of birth to be substituted for the name and TIN" when a TIN can't be collected (returns due after December 31, 2024); treats an earlier consent to electronic statements as continuing unless revoked in writing; gives an ALE "at least 90 days from the date of the first letter" proposing a 4980H assessment to respond, now 4980H(d)(4); and limits assessment of the payment to six years from the due date of the 1094-C return (new 6501(n), returns due after December 31, 2024).

## Letter 226-J

The IRS assesses the payment by letter, after the employee's premium tax credit is final. "Letter 226-J is the initial letter issued to Applicable Large Employers (ALEs)" proposing an employer shared responsibility payment, based on the employer's Forms 1094-C and 1095-C and its employees' individual returns. It comes with Form 14764 (the response) and Form 14765 (the list of employees who received credits, by month). The employer agrees, or disagrees with "a full explanation" and corrections on the 14765, by the response date in the letter (at least 90 days under the 2024 law), and the IRS answers with a Letter 227 stating its determination and appeal rights. The IRS's own Q&A still shows 2023's amounts of $2,880 and $4,320, a reminder that each year is assessed with its own figures.

What the employer needs to answer one, years after the fact:

- **The month-by-month record for each listed employee:** hours of service and status by month, the measurement method and periods, the offer and its date, the enrollment or waiver, the required contribution and the safe harbor used.
- **The 1095-C as filed and any corrections,** with the inputs it was derived from.
- **Proof of offer,** which is the enrollment platform's record of what was presented and when, including waivers (Enrollment & Life Events).

Because the IRS starts from the codes, a wrong code produces a proposal for an employee who was in fact covered: a `1H` that should have been `1E` with `2C`, or a missing `2D` for a month inside an initial measurement period. Deriving the codes from records, rather than typing them, is the defense that is built before the letter arrives.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `filings` and `filing_lines` hold the 1094-C and 1095-Cs; `time_entries` and pay statement lines supply hours of service; `benefit_enrollments` supplies enrollment and waivers; `notices` holds Letter 226-J. This chapter adds the determinations and the monthly results the forms are derived from.

```sql
CREATE TABLE ale_determinations (          -- one employer group's ALE status for a year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  employer_ids        UUID[] NOT NULL,       -- the aggregated group's members
  for_year            SMALLINT NOT NULL,     -- the year status applies to
  monthly_counts      JSONB NOT NULL,        -- prior year: {"2025-01": {"ft": 40, "fte": 12.50}, ...}
  average             NUMERIC(8, 2) NOT NULL,
  seasonal_exception  BOOLEAN NOT NULL DEFAULT FALSE,
  is_ale              BOOLEAN NOT NULL,      -- floor(average) >= 50, unless the exception applies
  reduction_allocation JSONB NOT NULL,       -- employer_id -> share of the 30
  computed_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (company_id, for_year)
);

CREATE TABLE measurement_periods (         -- a look-back cycle for a category of employees
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),   -- set for an initial period, null for standard
  kind                TEXT NOT NULL CHECK (kind IN ('standard', 'initial', 'monthly')),
  employee_category   TEXT NOT NULL,         -- 'hourly', 'salaried', 'collectively_bargained', ...
  measurement         DATERANGE NOT NULL,
  administrative      DATERANGE,
  stability           DATERANGE NOT NULL,
  rule_ref            TEXT NOT NULL,         -- '26 CFR 54.4980H-3(d)'
  CHECK (upper(measurement) - lower(measurement) <= 366),
  CHECK (administrative IS NULL OR upper(administrative) - lower(administrative) <= 90)
);

CREATE TABLE aca_status_results (          -- one employee, one month: the facts the codes come from
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  month               DATE NOT NULL,         -- the first of the month
  hours_of_service    NUMERIC(7, 2) NOT NULL,
  full_time           BOOLEAN NOT NULL,
  measurement_period_id UUID REFERENCES measurement_periods (id),
  limited_non_assessment BOOLEAN NOT NULL DEFAULT FALSE,   -- initial period, waiting period
  offer               TEXT,                  -- 'employee', 'employee_spouse', 'employee_dependents',
                                             -- 'family', 'mec_not_mv', 'ichra', null for none
  offer_document_id   UUID REFERENCES documents (id),
  lowest_cost_contribution BIGINT,           -- cents, the line 15 amount
  safe_harbor         TEXT CHECK (safe_harbor IN ('w2', 'rate_of_pay', 'fpl')),
  affordable_under_safe_harbor BOOLEAN,
  enrolled_all_month  BOOLEAN NOT NULL DEFAULT FALSE,
  employed_any_day    BOOLEAN NOT NULL,
  PRIMARY KEY (worker_id, employer_id, month)
);

CREATE TABLE form_1095c_lines (            -- the codes as derived, and as filed
  filing_id           UUID NOT NULL REFERENCES filings (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  month               DATE NOT NULL,
  line_14             CHAR(2) NOT NULL,      -- '1A' ... '1U'
  line_15             BIGINT,                -- cents
  line_16             CHAR(2),               -- '2A' ... '2H'
  derived_from        JSONB NOT NULL,        -- the aca_status_results row as read
  overridden_by       TEXT,                  -- a person, with a reason, if not as derived
  override_reason     TEXT,
  PRIMARY KEY (filing_id, worker_id, month)
);

CREATE TABLE esrp_assessments (            -- a Letter 226-J and its life
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  notice_id           UUID NOT NULL REFERENCES notices (id),   -- the 226-J as received
  tax_year            SMALLINT NOT NULL,
  proposed_amount     BIGINT NOT NULL,
  respond_by          DATE NOT NULL,         -- at least 90 days from the letter's date
  employees_listed    INT NOT NULL,          -- from Form 14765
  our_exposure        BIGINT,                -- recomputed from form_1095c_lines and results
  response_document_id UUID REFERENCES documents (id),
  determination_notice_id UUID REFERENCES notices (id),   -- the Letter 227
  final_amount        BIGINT,
  status              TEXT NOT NULL CHECK (status IN ('received', 'analyzing', 'responded',
                        'determined', 'appealed', 'paid', 'closed'))
);
```

Line 16 as a derivation, simplified (the instructions give `2C` precedence "generally" and list exceptions, which a production rule set encodes):

```sql
SELECT r.worker_id, r.month,
       CASE
         WHEN NOT r.employed_any_day            THEN '2A'
         WHEN r.enrolled_all_month              THEN '2C'
         WHEN r.limited_non_assessment          THEN '2D'
         WHEN NOT r.full_time                   THEN '2B'
         WHEN r.affordable_under_safe_harbor AND r.safe_harbor = 'w2'          THEN '2F'
         WHEN r.affordable_under_safe_harbor AND r.safe_harbor = 'fpl'         THEN '2G'
         WHEN r.affordable_under_safe_harbor AND r.safe_harbor = 'rate_of_pay' THEN '2H'
       END AS line_16
FROM aca_status_results r
WHERE r.employer_id = $employer_id
  AND r.month >= make_date($tax_year, 1, 1) AND r.month < make_date($tax_year + 1, 1, 1);
```

Design notes:

- **Store monthly facts, derive codes.** `aca_status_results` holds hours, status, offer, contribution and safe harbor per month; the 1095-C codes are a query over it, and an override is a recorded exception with a reason, never an edit of the facts.
- **Hours of service come from paid hours,** including leave lines, summed from pay statement lines by work period, not from punches alone.
- **Measurement periods are rows with their limits checked,** and an initial period for each new variable hour employee is created at hire from the category's rule ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **The W-2 safe harbor closes after the W-2.** An affordability result under it is provisional until box 1 is final; the engine recomputes in January and flags months that fail, before the 1095-C is filed.
- **Penalty amounts and the percentage are rows** (`tax_rates` for $3,340, $5,010 and 9.96%, with source and year), so a 2023 assessment is checked with 2023's $2,880 and $4,320 ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Keep the inputs for six years from the 1094-C due date** at least, the assessment window the 2024 law set, and longer for any year with an open letter ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).

## Auditing

The ACA record is audited by the IRS through Letter 226-J, by employees disputing a 1095-C, and by the employer's own review before filing:

- **ALE status by year,** with the monthly counts and the group it was computed for.
- **Every employee-month:** hours of service with their source lines, status, measurement period, offer with proof, required contribution, safe harbor and enrollment.
- **The forms as filed,** with acknowledgment and corrections, and each code's derivation and any override with its reason.
- **Offers and waivers as documents,** dated, from the enrollment platform.
- **Every 226-J** with its response, the exposure recomputed from the record, and the final determination. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Compute ALE status from last year's monthly counts,** full-time plus FTEs capped at 120 hours, averaged and rounded down, across the aggregated group.
- **Count hours of service, not hours worked,** including paid leave.
- **Model measurement periods as rows,** with the 12-month, 90-day and anniversary limits enforced.
- **Test affordability at 9.96% for 2026** under a stated safe harbor, and recheck the W-2 safe harbor after year end.
- **Watch the 95% cliff,** where one missed offer turns a per-claimant (b) penalty into a per-headcount (a) penalty.
- **Store monthly facts and derive 1094-C and 1095-C codes** from them, with overrides recorded.
- **Keep everything six years from the due date,** and track each Letter 226-J against its 90-day response window.

## References

**Law and regulation**

- [26 USC 4980H](https://www.law.cornell.edu/uscode/text/26/4980H), the (a) and (b) payments, the ALE definition, the seasonal exception, the 30-employee reduction, full-time equivalents, the 30-hour definition, indexing and the 90-day response in (d)
- [26 CFR 54.4980H-1](https://www.law.cornell.edu/cfr/text/26/54.4980H-1), hour of service, full-time employee and the 130-hour monthly equivalent, full-time equivalent, seasonal worker
- [26 CFR 54.4980H-2](https://www.law.cornell.edu/cfr/text/26/54.4980H-2), ALE determination: monthly counts, the 120-hour cap, rounding, the seasonal exception, new employers, aggregation
- [26 CFR 54.4980H-3](https://www.law.cornell.edu/cfr/text/26/54.4980H-3), the monthly and look-back measurement methods, administrative and stability periods, new employees and rehires
- [26 CFR 54.4980H-4](https://www.law.cornell.edu/cfr/text/26/54.4980H-4), the offer to all but 5 percent (or five) of full-time employees
- [26 CFR 54.4980H-5](https://www.law.cornell.edu/cfr/text/26/54.4980H-5), the (b) payment and the W-2, rate of pay and poverty line affordability safe harbors
- [Paperwork Burden Reduction Act, P.L. 118-167 (govinfo)](https://www.govinfo.gov/content/pkg/PLAW-118publ167/html/PLAW-118publ167.htm), the alternative manner of furnishing under sections 6055 and 6056
- [Employer Reporting Improvement Act, P.L. 118-168 (govinfo)](https://www.govinfo.gov/content/pkg/PLAW-118publ168/html/PLAW-118publ168.htm), name and date of birth for a missing TIN, continuing electronic consent, the 90-day response, the six-year assessment period

**Agency guidance and forms**

- [IRS: Rev. Proc. 2025-26 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-26.pdf), the 2026 4980H amounts of $3,340 and $5,010 and the premium adjustment percentage
- [IRS: Rev. Proc. 2025-25 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-25.pdf), the 9.96% required contribution percentage for 2026
- [IRS: Notice 2025-15 (PDF)](https://www.irs.gov/pub/irs-drop/n-25-15.pdf), the alternative manner of furnishing Forms 1095-C, notice timing and retention, effective date
- [IRS: Instructions for Forms 1094-C and 1095-C (2025)](https://www.irs.gov/instructions/i109495c), furnishing and filing dates, the electronic filing threshold, the alternative manner, Part III columns, the 98% Offer Method, line 14, 15 and 16 codes, and dates of birth for covered individuals
- [IRS: Questions and answers on employer shared responsibility provisions](https://www.irs.gov/affordable-care-act/employers/questions-and-answers-on-employer-shared-responsibility-provisions-under-the-affordable-care-act), how the payments are computed, the reduction among ALE members, the 2023 amounts and Letter 226-J's basis
- [IRS: Understanding your Letter 226-J](https://www.irs.gov/individuals/understanding-your-letter-226-j), the letter, Forms 14764 and 14765, and Letter 227
- [HHS ASPE: Poverty guidelines](https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines), the 2026 guideline of $15,960 for one person in the 48 contiguous states and DC

**Vendor documentation**

- [Paycom: Enhanced ACA](https://www.paycom.com/software/enhanced-aca/), measurement period details, alerts, form generation, mailing and IRS and state filing
- [Rippling: ACA compliance](https://www.rippling.com/aca-compliance), hours tracking for eligibility, the eligibility report, 1094-C filing and 1095-C delivery
