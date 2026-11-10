+++
title = "COBRA & State Continuation"
nav_title = "COBRA"
description = "COBRA's qualifying events, notice clocks, 60-day elections, 45-day first payments, 30-day grace, premiums up to 102%, administrators and state mini-COBRA laws."
category = "Workforce Industry"
order = 2648
part = "Benefits Administration"
tags = ["benefits", "cobra", "continuation-coverage", "notices", "terminations", "state-law"]
+++

COBRA is a set of clocks that start when someone loses group health coverage. An employee is terminated or has hours cut, a spouse divorces, a child turns 26, an employee dies or becomes entitled to Medicare, and the plan must offer the people who lost coverage the right to keep it, at their own expense, for 18, 29 or 36 months. The employer tells the plan administrator within 30 days, the administrator sends an election notice within 14 days, the qualified beneficiaries get at least 60 days to decide, 45 days after deciding to pay the first premium, and 30 days of grace for every premium after that. Coverage elected late in the window is retroactive to the day it was lost, which is why a former employee can wait to see whether they get sick before paying.

For a system, COBRA is notices with deadlines computed from events the HRIS and the benefits record already hold, a premium ledger for people who are no longer on payroll, and a coverage record that must go back to the carrier as active for someone who isn't an employee. The federal law covers employers with 20 or more employees; state continuation laws cover smaller employers' insured plans and sometimes extend federal coverage, with their own durations, premium caps and administrators. This chapter covers who is covered, qualifying events and qualified beneficiaries, the notices and their clocks worked on one termination, elections and premiums, durations and extensions, early termination, administrators, state continuation, and penalties. The separation that starts most COBRA events is in [Terminations, Offboarding & WARN](/books/workforce/terminations-and-warn#the-separation-workflow); the carrier side of continued coverage is [Carrier Connections & the 834](/books/workforce/carrier-connections).

## How the Platforms Do It

The DOL notes that plans are "frequently administered, in whole or in part, by a separate individual or organization, such as a professional benefits administration firm," and that "Carrying out the requirements of COBRA is the direct responsibility of the plan administrator." From public pages, as of November 2026:

| Platform | What it states | Notes |
| --- | --- | --- |
| **WEX** | COBRA administration with "Automated notifications and workflows," "Online elections and payment management," "Integrated payment processing" and "Date-aware lockbox settlement" | A third-party administrator; no fees published on the page |
| **Noyo** | COBRA members in its member model alongside waives, rehires and reinstatements | The carrier connection keeps a COBRA participant enrolled at the carrier |
| **Benefits administration and HCM suites** | COBRA as a module or a partner, fed by the termination and enrollment record | See [Benefits Administration Platforms](/books/workforce/benefits-platforms) |

The pattern: **the employer's systems produce the qualifying event and the coverage facts; the administrator runs the notices, elections and premium collection; the carrier keeps the coverage active.** Each hand-off has a federal deadline, so each needs a record of when it happened.

## Who Is Covered

COBRA "generally applies to all private sector group health plans maintained by employers that had at least 20 employees on more than 50 percent of its typical business days in the previous calendar year." Part-time employees count as fractions: "a part-time employee who works 20 hours per week counts as half of a full-time employee" where full-time is 40 (DOL's employer guide). The tax code's version of the exception is the plan of an employer that "normally employed fewer than 20 employees on a typical business day" in the prior year (26 USC 4980B(d)(1)). Employers below the line are where state continuation laws apply.

Each group health plan the person loses (medical, dental, vision, each as its own plan) is its own continuation offer and its own election. Life and disability insurance aren't continued under COBRA; their portability and conversion rights are [Insurance's](/books/insurance/group-life-and-disability#conversion-and-portability). A health FSA has a limited obligation: when its benefits are excepted benefits and the most it can charge for a year of COBRA "equals or exceeds the maximum benefit available under the health FSA for the year," it "is not obligated to make COBRA continuation coverage available for any subsequent plan year," and within the current year it owes an offer only to a beneficiary who could still receive more than that charge (26 CFR 54.4980B-2, Q&A-8). HRA continuation I leave to the plan document and the administrator.

## Qualifying Events and Beneficiaries

A qualifying event counts only "if they cause the covered employee to lose coverage." The DOL's list:

| Qualifying event | Qualified beneficiaries | Maximum period |
| --- | --- | --- |
| Termination of employment "for any reason other than 'gross misconduct,'" or reduction in hours | Employee, spouse, dependent children | 18 months |
| Employee becomes entitled to Medicare | Spouse, dependent children | 36 months |
| Divorce or legal separation | Spouse, dependent children | 36 months |
| Death of the employee | Spouse, dependent children | 36 months |
| Loss of dependent child status (for example, age 26) | Dependent child | 36 months |

Each qualified beneficiary "has an independent right to elect continuation coverage": an employee can decline while the spouse elects, though "the covered employee or the covered employee's spouse" can elect for everyone. A child "born to or adopted by a covered employee during a period of continuation coverage" is automatically a qualified beneficiary and must be allowed onto the coverage.

The reduction in hours deserves a rule of its own. An hourly employee whose hours fall below the plan's eligibility threshold loses coverage without leaving, which is a qualifying event the termination workflow never sees. The benefits eligibility job that ends coverage for lost eligibility has to open the COBRA event too.

## The Notices and Their Clocks

The deadlines run from different starting points, and a plan's own documents can choose some of them (29 CFR 2590.606-1 through 606-4, and the DOL guide):

| Notice | From | To | Deadline |
| --- | --- | --- | --- |
| **General notice** | Plan administrator | Employee and spouse | "not later than the earlier of" 90 days after coverage begins and the election notice date if a qualifying event happens first; one notice to both at the same address is allowed |
| **Qualifying event notice (employer events)** | Employer | Plan administrator | "within 30 days after the event occurs" (termination, reduction in hours, death, Medicare entitlement, employer bankruptcy) |
| **Qualifying event notice (beneficiary events)** | Employee or beneficiary | Plan administrator | The plan may set a limit no shorter than 60 days after the latest of the event, the loss of coverage, and being told of the duty (divorce, legal separation, a child's loss of dependent status) |
| **Election notice** | Plan administrator | Each qualified beneficiary | "not later than 14 days after receipt of the notice of qualifying event"; where the employer is also the administrator, "not later than 44 days after" the qualifying event (or the loss of coverage, if the plan says so) |
| **Notice of unavailability** | Plan administrator | The person denied | Within 14 days of the request, with the reason |
| **Disability or second event notice** | Qualified beneficiary | Plan administrator | No shorter than 60 days after the latest of the SSA determination (or event) and related dates; a plan may require disability notice "before the end of the first 18 months" |
| **Early termination notice** | Plan administrator | Qualified beneficiary | "as soon as practicable" after deciding, with the date, the reason and any conversion rights |

The model notices are DOL's; "Use of the model notice is not mandatory," but a properly completed model election notice is treated as "good faith compliance with the election notice content requirements."

**Worked on one termination, with invented dates.** An employee with family medical coverage is discharged on Friday, August 13, 2027; the plan ends coverage at the end of the month.

| Step | Date | Rule |
| --- | --- | --- |
| Qualifying event | August 13 | Termination, not for gross misconduct |
| Coverage lost | August 31 | Plan's end-of-month rule |
| Employer's notice to the administrator, last day | September 12 | 30 days after the event |
| Administrator receives it | September 10 | |
| Election notice, last day (third-party administrator) | September 24 | 14 days after receipt |
| Election notice, last day (employer as administrator) | September 26 | 44 days after the event |
| Election notice sent | September 20 | |
| Election period ends, at the earliest | November 19 | At least 60 days from the later of the notice and the loss of coverage |
| Family elects | November 1 | Coverage is retroactive to September 1 |
| First premium due, at the earliest | December 16 | At least 45 days after the election; covers September through December |
| Maximum period ends | February 13, 2029 | 18 months from the event |

Two things the table shows. Between August 31 and November 1 the family had no active coverage at the carrier and a right to make it retroactive; a claim incurred in October is pended or denied and then reprocessed when they elect and pay, which is why carriers want COBRA elections fast and why the carrier connection needs a reinstatement path (`025`). And the employer's 30 days and the administrator's 14 add to the 44-day single deadline, which is the same budget whether the employer outsources or not.

## Elections and Premiums

**The election.** Plans must give "at least 60 days to choose," starting from the later of the election notice and the date coverage would be lost. A waiver can be revoked before the election period ends, in which case "the plan may make continuation coverage begin on the date the waiver was revoked." Continuation coverage "must be identical" to what similarly situated active participants have, including the right to change options at open enrollment.

**The premium.** The plan may charge up to 102% of the applicable premium, the 2% being "for administrative costs," and up to 150% during the 11-month disability extension; payments may be monthly, and the first can't be required "before the 45th day after" the initial election (29 USC 1162). Every later payment is timely if made "within 30 days after the date due," and a payment short by no more than the lesser of $50 and 10 percent of the amount due counts as full unless the plan notifies the beneficiary, who then gets 30 days to pay the difference (26 CFR 54.4980B-8). The applicable premium is "computed and fixed" before each 12-month determination period, so it changes at most once a year.

Worked with my own numbers for the family above, with a plan cost of $1,900.00 a month for family coverage:

| Item | Computation | Amount |
| --- | --- | --- |
| Monthly COBRA premium | $1,900.00 × 102% | $1,938.00 |
| First payment, due December 16 | 4 months (September to December) × $1,938.00 | $7,752.00 |
| January payment, timely through | January 1 + 30 days | January 31 |
| A $1,900.00 January payment | Short $38.00, under the lesser of $50 and 10% ($193.80) | Full payment, unless the plan sends a shortfall notice; then $38.00 within 30 days |
| Disability extension, months 19 to 29 | $1,900.00 × 150% | $2,850.00 |

The 2% is the administrator's margin or the employer's cost recovery, and the rest is a liability to the carrier (insured) or to the plan (self-funded). For a self-funded plan, the applicable premium is a computed figure, not a carrier rate, which makes the determination period's computation a record to keep.

## Durations, Extensions and Early Termination

Coverage runs "from the date of the qualifying event" for the maximum period: 18 months for termination or reduction in hours, 36 for the other events. Two extensions turn 18 into more:

- **Disability.** If the SSA determines a qualified beneficiary disabled at some time "during the first 60 days of continuation coverage" (29 USC 1162) and the disability continues, every qualified beneficiary in the family gets an 11-month extension, "for a total maximum period of 29 months," at up to 150%.
- **Second qualifying event.** During an 18-month period, death of the employee, divorce or legal separation, Medicare entitlement (in some cases) or loss of dependent child status extends the spouse's and children's period to 36 months, if the event "would have caused the qualified beneficiary to lose coverage under the plan in the absence of the first qualifying event."
- **Medicare before termination.** When an employee became entitled to Medicare less than 18 months before the termination, the spouse and children get coverage "for up to 36 months after the date the employee becomes entitled to Medicare." The DOL's example: entitlement 8 months before termination gives the family 28 months.

Coverage may end early when premiums aren't paid on time, the employer stops maintaining any group health plan, a qualified beneficiary gets other group coverage or Medicare after electing, or for fraud. Each early end is an early termination notice and a carrier termination.

Losing coverage also opens other doors the notice should name: special enrollment in a spouse's plan within 30 days ([Enrollment & Life Events](/books/workforce/enrollment-and-life-events)), and marketplace coverage, where the person "must select Marketplace coverage within 60 days before or after the loss of other coverage." Being offered COBRA "does not limit eligibility for coverage or for a tax credit through the Marketplace"; electing and then dropping it outside an enrollment window can.

## State Continuation

States fill the gap below 20 employees, and some add time on top of federal COBRA. They regulate insurance, so they reach insured plans, not self-funded ones, and several put the administration on the carrier rather than the employer. As state sources describe them, as of November 2026:

| State | Who it covers | Duration | Premium cap | Who administers |
| --- | --- | --- | --- | --- |
| **New York** (Insurance Law 3221(m)) | Insured group hospital, surgical and medical policies | Up to "thirty-six months after" coverage would otherwise end | "not more than one hundred two percent of the group rate" | The policyholder gives notice and collects; 60 days to elect from notice |
| **Florida** (Fla. Stat. 627.6692) | Employers that employ "fewer than 20 employees" | "18 months after the date on which" coverage would have ended | "may not exceed 115 percent of the applicable premium" | "the insurance carrier shall send each qualified beneficiary by certified mail" the election notice |
| **Texas** (TDI guidance) | Plans "subject to Texas insurance laws"; not "self-funded plans"; three months of prior coverage required | "nine months after your job ends," or six months after federal COBRA ends | Not stated on the page | The insurer |
| **Massachusetts** (M.G.L. c. 176J, sec. 9) | Small group plans; not those "with only one eligible employee or with greater than nineteen eligible employees" | "eighteen months after the date of the qualifying event" for termination or reduced hours, "thirty-six months" for most other events | "shall not exceed one hundred and two percent of the applicable premium" | The carrier's plan; the carrier may not require payment until 45 days after the election |
| **Connecticut** (Conn. Gen. Stat. 38a-512a) | Insured group health policies issued or continued in the state | "a period of thirty months after the date of such layoff" (termination, reduced hours or leave), with shorter periods for some events | 102% of the group premium for the main continuation cases | The insurer must "provide the option to continue coverage"; the section names no notice duty |

California's Cal-COBRA (small employers, and an extension of federal COBRA to 36 months) is the largest of these programs. Health and Safety Code 1366.21 covers "an employer with 2 to 19 eligible employees" (measured as employing that many "on at least 50 percent of its working days during the preceding calendar year"), 1366.27 runs coverage to "36 months after the date the qualified beneficiary's benefits under the contract" would otherwise have ended, and 1366.26 caps the premium at "not more than 110 percent of the applicable rate." Illinois and New Jersey have their own continuation laws whose current official text I couldn't open (Illinois's statute site failed a certificate check), so they aren't in the table. <!-- source-gap: wf-state-continuation-others | missing | state continuation rules (size, duration, premium cap, administrator) for Illinois and New Jersey | closes with: 215 ILCS 5/367e and N.J.S.A. 17B:27A-27 current text, or each state's insurance department page, opened | checked: 2026-11-10 -->

The design consequence: continuation is a rule set keyed by the plan's funding (insured or self-funded), the policy's situs state, the employer's size, and the event, producing a law, a duration, a cap and an administrator. An employer with 15 employees and an insured Florida plan has no federal COBRA obligation and a carrier-run state one; the same employer with 25 employees has federal COBRA and nothing extra from Florida.

## Penalties

The tax code imposes an excise of $100 per qualified beneficiary for each day of noncompliance, capped at $200 a day when more than one beneficiary has the same event, with no tax for failures not discovered with reasonable diligence or corrected within 30 days for reasonable cause, and an annual cap for unintentional failures of the lesser of 10% of the employer's prior-year group health plan spending or $500,000 (26 USC 4980B). A worked example of my own: an election notice for the family above sent 20 days late, with the employee, spouse and a child as qualified beneficiaries of the same event, is 20 days × $200 = $4,000 of excise tax before any argument about correction. The larger exposure is usually the claim: a beneficiary who never got a valid notice and later needed coverage can claim the plan owes the benefits, which is why proof of mailing matters more than the excise. ERISA adds its own penalty for administrators who fail to give notices: under section 502(c)(1) a court may award up to $110 a day, the maximum 29 CFR 2575.502c-1 "increased from $100 a day to $110 a day" for violations after July 29, 1997.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `life_events` holds the qualifying event (termination, reduction in hours, divorce, death, a child aging out); `benefit_enrollments` holds the coverage lost and, after an election, the continuation coverage with `life_event_id` pointing at the event; `documents` holds every notice as sent. This chapter adds the COBRA case, its notices, elections and premium ledger.

```sql
CREATE TABLE cobra_events (                -- one qualifying event under one continuation law
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  life_event_id       UUID NOT NULL REFERENCES life_events (id),
  separation_id       UUID REFERENCES separations (id),   -- when a termination started it
  law                 TEXT NOT NULL,         -- 'federal', 'ny_3221m', 'fl_627_6692', 'tx_state', ...
  event_kind          TEXT NOT NULL CHECK (event_kind IN ('termination', 'reduction_in_hours',
                        'medicare_entitlement', 'divorce', 'legal_separation', 'death',
                        'dependent_aging_out', 'employer_bankruptcy')),
  event_date          DATE NOT NULL,
  coverage_lost_on    DATE NOT NULL,
  administrator       TEXT NOT NULL CHECK (administrator IN ('employer', 'third_party', 'carrier')),
  employer_notice_due DATE NOT NULL,         -- event + 30 days, for employer events
  employer_notice_sent_at TIMESTAMPTZ,
  administrator_received_on DATE,
  election_notice_due DATE NOT NULL,         -- receipt + 14, or event + 44 for employer-administered
  maximum_period      DATERANGE NOT NULL,    -- from the event: 18, 29 or 36 months
  extended_by         TEXT CHECK (extended_by IN ('disability', 'second_event', 'medicare')),
  status              TEXT NOT NULL CHECK (status IN ('open', 'notified', 'elected', 'waived',
                        'expired', 'active', 'terminated_early', 'exhausted'))
);

CREATE TABLE cobra_notices (               -- every notice, with its clock and proof
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  cobra_event_id      UUID REFERENCES cobra_events (id),   -- null for a general notice
  worker_id           UUID REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('general', 'qualifying_event', 'election',
                        'unavailability', 'early_termination', 'shortfall', 'conversion')),
  addressees          UUID[] NOT NULL,       -- persons; one notice may cover a household
  address_snapshot    JSONB NOT NULL,        -- the address as mailed, from person_addresses
  due_on              DATE NOT NULL,
  rule_ref            TEXT NOT NULL,         -- '29 CFR 2590.606-4(b)(2)', ...
  sent_at             TIMESTAMPTZ,
  delivery_method     TEXT CHECK (delivery_method IN ('first_class_mail', 'certified_mail',
                        'electronic')),
  proof_ref           TEXT,                  -- mailing log, certificate, delivery receipt
  document_id         UUID REFERENCES documents (id)
);

CREATE TABLE cobra_elections (             -- each qualified beneficiary decides separately
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  cobra_event_id      UUID NOT NULL REFERENCES cobra_events (id),
  person_id           UUID NOT NULL REFERENCES persons (id),
  election_period     DATERANGE NOT NULL,    -- at least 60 days from the later of notice and loss
  decision            TEXT CHECK (decision IN ('elected', 'waived', 'waiver_revoked')),
  decided_on          DATE,
  elected_by_person_id UUID REFERENCES persons (id),  -- the employee or spouse electing for all
  benefit_enrollment_ids UUID[] NOT NULL DEFAULT '{}', -- the continuation coverages
  coverage_from       DATE,                  -- the loss date, or the revocation date
  first_payment_due   DATE,                  -- decided_on + 45 days at the earliest
  UNIQUE (cobra_event_id, person_id)
);

CREATE TABLE cobra_premiums (              -- the ledger for people no longer on payroll
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  cobra_event_id      UUID NOT NULL REFERENCES cobra_events (id),
  coverage_month      DATE NOT NULL,         -- first of the month
  applicable_premium  BIGINT NOT NULL,       -- cents, fixed for the determination period
  surcharge_percent   NUMERIC(5, 2) NOT NULL CHECK (surcharge_percent IN (100.00, 102.00, 150.00)),
  amount_due          BIGINT NOT NULL,
  due_on              DATE NOT NULL,
  grace_ends_on       DATE NOT NULL,         -- due + 30 days; the first payment has its own date
  paid_amount         BIGINT NOT NULL DEFAULT 0,
  paid_on             DATE,
  shortfall_notice_id UUID REFERENCES cobra_notices (id),
  status              TEXT NOT NULL CHECK (status IN ('due', 'paid', 'paid_short_insignificant',
                        'short_noticed', 'late', 'terminated_for_nonpayment')),
  liability_id        UUID REFERENCES liabilities (id),   -- what is owed to the carrier or plan
  UNIQUE (cobra_event_id, coverage_month)
);
```

The clock arithmetic belongs in one place, with the rule stored next to each result:

```go tab="Go"
package cobra

import "time"

// Clocks returns the federal deadlines for an employer event: the
// employer's notice, the election notice and the earliest election close.
func Clocks(event, lost, receivedByAdmin, noticeSent time.Time, employerIsAdmin bool) (empNotice, election, electionCloses time.Time) {
	empNotice = event.AddDate(0, 0, 30)
	if employerIsAdmin {
		election = event.AddDate(0, 0, 44) // 29 CFR 2590.606-4(b)(2)
	} else {
		election = receivedByAdmin.AddDate(0, 0, 14)
	}
	start := noticeSent
	if lost.After(start) {
		start = lost
	}
	electionCloses = start.AddDate(0, 0, 60) // at least 60 days from the later date
	return
}
```

```rust tab="Rust"
use chrono::{Duration, NaiveDate};

/// The federal deadlines for an employer event: the employer's notice, the
/// election notice and the earliest election close.
pub fn clocks(
    event: NaiveDate, lost: NaiveDate, received_by_admin: NaiveDate,
    notice_sent: NaiveDate, employer_is_admin: bool,
) -> (NaiveDate, NaiveDate, NaiveDate) {
    let emp_notice = event + Duration::days(30);
    let election = if employer_is_admin {
        event + Duration::days(44) // 29 CFR 2590.606-4(b)(2)
    } else {
        received_by_admin + Duration::days(14)
    };
    let closes = notice_sent.max(lost) + Duration::days(60);
    (emp_notice, election, closes)
}
```

Design notes:

- **The event comes from three places,** not one: separations, eligibility changes (a reduction in hours that ends coverage) and life events reported by employees (divorce, a child's status). Each creates a `cobra_events` row with its law, so none depends on the termination workflow alone.
- **Pick the law with rules,** from the plan's funding and situs, the employer's prior-year size and the event, and store which one applied ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Notices are generated documents with proof,** kept exactly as sent, with the address snapshot used and the mailing evidence, because "we mailed it" is the whole defense ([What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
- **The election is per person,** and coverage on election is a reinstatement from the loss date: a `benefit_enrollments` row for the continuation coverage and a carrier change that reinstates rather than adds.
- **Premiums are a receivables ledger,** not payroll deductions: the person is off payroll, the payment arrives by ACH or check through the administrator, and a missed grace period terminates coverage at the end of the last paid month and sends an early termination notice.
- **Deadlines compute in calendar days** from stored dates, and the earliest dates the law allows are floors; a plan that gives more time stores its own rule.

## Auditing

COBRA records are what a former employee's lawyer, the DOL and the IRS ask for when coverage was lost:

- **Every qualifying event** with its source, its date, the loss of coverage date, and the law chosen.
- **Every notice as sent,** with its due date, sent date, addressees, address and proof of mailing.
- **Every election and waiver** per person, with revocations, and the coverage dates that followed.
- **Every premium** with its applicable premium, surcharge, due and grace dates, payment and shortfall handling.
- **Carrier confirmations** of reinstatement and termination, tied to the elections and payments. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Test coverage each year:** 20 employees on more than half of the prior year's business days, part-timers as fractions; below that, state continuation for insured plans.
- **Create COBRA events from every coverage loss,** including reductions in hours and dependents aging out, not just terminations.
- **Compute every clock:** 30 days to the administrator, 14 for the election notice or 44 when the employer administers, at least 60 to elect, 45 to the first payment, 30 days of grace.
- **Treat each qualified beneficiary as an independent electer,** and coverage on election as a retroactive reinstatement.
- **Charge up to 102%, or 150% in a disability extension,** from a premium fixed for the determination period, and apply the $50 or 10% shortfall rule.
- **Track 18, 29 and 36 months,** with disability, second events and prior Medicare entitlement as extensions.
- **Key state continuation on funding, situs, size and event,** and record which law applied.
- **Keep every notice with proof of mailing.**

## References

**Law and regulation**

- [29 USC 1162](https://www.law.cornell.edu/uscode/text/29/1162), maximum periods, the disability extension, Medicare entitlement, early termination, the 102% and 150% caps, monthly installments, the 30-day grace and the 45-day first payment
- [29 CFR 2590.606-1](https://www.law.cornell.edu/cfr/text/29/2590.606-1), the general notice and its timing, single notices to a household and the model notice
- [29 CFR 2590.606-3](https://www.law.cornell.edu/cfr/text/29/2590.606-3), notices from qualified beneficiaries and their 60-day minimums
- [29 CFR 2590.606-4](https://www.law.cornell.edu/cfr/text/29/2590.606-4), the election notice within 14 days, 44 days for employer-administrators, contents, unavailability and early termination notices
- [26 CFR 54.4980B-8](https://www.law.cornell.edu/cfr/text/26/54.4980B-8), the applicable premium, timely payment, the 45-day rule and insignificant shortfalls
- [26 CFR 54.4980B-2](https://www.law.cornell.edu/cfr/text/26/54.4980B-2), group health plans under COBRA, and Q&A-8's limited obligation for health FSAs
- [29 CFR 2575.502c-1](https://www.law.cornell.edu/cfr/text/29/2575.502c-1), the ERISA 502(c)(1) penalty of up to $110 a day
- [26 USC 4980B](https://www.law.cornell.edu/uscode/text/26/4980B), the $100 and $200 daily excise, the reasonable cause and diligence exceptions, the annual cap and the small employer exception
- [New York Insurance Law 3221](https://www.nysenate.gov/legislation/laws/ISC/3221), continuation for 36 months at no more than 102% of the group rate under subsection (m)
- [California Health and Safety Code 1366.21](https://california.public.law/codes/ca_health_and_safety_code_section_1366.21), Cal-COBRA's 2 to 19 eligible employee threshold
- [California Health and Safety Code 1366.26](https://california.public.law/codes/ca_health_and_safety_code_section_1366.26), the 110% premium cap
- [California Health and Safety Code 1366.27](https://california.public.law/codes/ca_health_and_safety_code_section_1366.27), continuation to 36 months
- [Massachusetts General Laws c. 176J, sec. 9](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter176J/Section9), small group continuation for 2 to 19 eligible employees, 18 and 36 months, 102%
- [Connecticut General Statutes 38a-512a](https://www.cga.ct.gov/current/pub/chap_700c.htm#sec_38a-512a), continuation for 30 months after layoff or termination, 102%
- [Florida Statutes 627.6692](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.6692.html), continuation for employers with fewer than 20 employees, 18 months, 115%, carrier notices by certified mail

**Agency guidance and forms**

- [DOL EBSA: An Employer's Guide to Group Health Continuation Coverage Under COBRA (PDF)](https://www.dol.gov/sites/dolgov/files/ebsa/about-ebsa/our-activities/resource-center/publications/an-employers-guide-to-group-health-continuation-coverage-under-cobra.pdf), coverage, counting part-timers, qualifying events and beneficiaries, notices and deadlines, independent elections, waivers, identical coverage, premiums, maximum periods and extensions, early termination, administrators, special enrollment and the Marketplace
- [Texas Department of Insurance: Continuing your health coverage](https://www.tdi.texas.gov/pubs/consumer/cb005.html), state continuation for nine months, six months after COBRA, insured plans only, three months of prior coverage

**Vendor documentation**

- [WEX: COBRA administration](https://www.wexinc.com/products/employee-benefits/cobra/), notifications, online elections, payment processing and lockbox settlement
- [Noyo: documentation index](https://docs.noyo.com/llms.txt), COBRA members in the member model
