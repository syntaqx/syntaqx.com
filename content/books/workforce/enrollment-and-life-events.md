+++
title = "Enrollment & Life Events"
description = "Open enrollment, new hire windows, Section 125 status changes, HIPAA special enrollment, EOI, dependent checks, tiers and rates, and deductions to payroll."
category = "Workforce Industry"
order = 2645
part = "Benefits Administration"
tags = ["benefits", "enrollment", "section-125", "special-enrollment", "life-events", "payroll-deductions"]
+++

An enrollment is a promise with two sides that have to agree. On one side, a carrier or a self-funded plan covers a person from a date, at a tier, with named dependents. On the other, payroll deducts a premium from that date, pre-tax if a cafeteria plan says so, and the employer pays its share. Between them sit rules that decide when the election can be made at all: the plan's open enrollment window, a new hire window bounded by the 90-day waiting period limit, the cafeteria plan rules that freeze a pre-tax election for the plan year unless a permitted event opens it, and the HIPAA special enrollment rights that force a group health plan to take a new spouse or a newborn whatever the calendar says. Each event has its own effective date rule, and a birth is retroactive by law, so the deductions that match it are retroactive too.

The engineering problem is that the election, the coverage and the deduction are three records with three clocks. A life event reported on April 10 for a March 17 birth produces coverage from March 17, a deduction change that reaches back across two paid statements, a change file to the carrier, and possibly a request for evidence of insurability on supplemental life that leaves part of the coverage pending. This chapter covers the windows (open enrollment, new hire, life events), what Section 125 permits and what HIPAA requires, evidence of insurability, dependent verification, coverage tiers and rates, and how elections become payroll deductions, with their timing, arrears and imputed income. The carrier side of the file is in [Carrier Connections & the 834](/books/workforce/carrier-connections), what the carrier does with it is [Health Tech's payer view](/books/health-tech/payer-operations#enrollment-and-membership), and group life and disability as insurance products are [Insurance's](/books/insurance/group-life-and-disability#carrier-side-enrollment-and-billing).

## How the Platforms Do It

How enrollment and the deduction that follows it are modeled, from public documentation, as of November 2026:

| Platform | Enrollment model | Effective dating and deductions | Notes |
| --- | --- | --- | --- |
| **Check** | Benefit objects at company and employee level, typed: `125_medical`, `125_dental`, `125_vision`, `125_life`, `125_disability`, `hsa`, `fsa_medical`, `fsa_dependent_care`, `401k`, `roth_401k` and others | The type sets the tax treatment; catch-up contributions are allowed automatically "for employees who will reach the catch-up age during the calendar year of the contribution" | Enrollment happens in a partner (Benbase, SimplyInsured and others integrate), payroll receives the result |
| **Gusto Embedded** | Company benefits and employee benefits, with events for each | "A benefit is applied to payroll if it is effective on the pay period end date"; windows for the same benefit can't overlap, and an open-ended prior record is closed one day before the new one starts | Deductions follow pay period overlap at hire and termination |
| **Noyo** | Groups, members and member requests (new hire enrollment, termination), with member snapshots | A member change is a new snapshot of the family; a newer snapshot marks the earlier one `replaced` | A carrier connection layer, not a payroll; see [Carrier Connections & the 834](/books/workforce/carrier-connections) |
| **Employee Navigator and Ease** | Broker-distributed benefits administration for small and mid-size employers; Ease "is now owned by Employee Navigator" | Enrollment and life events in the platform, deductions pushed to payroll through integrations | Employee Navigator states 195,000+ employers and 7,000+ brokers; Ease 85,000+ employer groups |
| **Rippling, ADP, Paycom** | Benefits inside the HCM suite, with payroll on the same record | ADP lists "Automatic payroll deductions and carrier integrations"; Paycom's Benefits to Carrier "automates secure communication with your plan providers" | One record for the election and the deduction is the suites' pitch |

The pattern across them: **the election is effective-dated and the deduction is derived from it by the pay period,** never typed into payroll by hand. Where enrollment and payroll are different systems, the integration carries the effective date, the tier, the employee cost and the employer cost per period, and the payroll applies them by its own period rule. [Benefits Administration Platforms](/books/workforce/benefits-platforms) covers the vendors in depth.

## The Three Windows

Every election is made in one of three windows, and the window decides what may change.

**Open enrollment.** The plan sets an annual window before the plan year in which employees can elect, change or drop any benefit. Nothing in Section 125 dictates its length; the plan document does. What the law does fix is that a cafeteria plan is "a written plan" under which "all participants are employees" who choose between cash and qualified benefits, and that it can't offer deferred compensation (26 USC 125(d)), which is why elections are for the coming plan year and why unused health FSA money doesn't roll over without a carryover feature ([HSAs, FSAs & HRAs](/books/workforce/hsa-fsa-and-hras) covers it). Passive enrollment (last year's elections roll forward unless changed) is a plan design; active enrollment (no election means no coverage, or a default) is another. A health FSA election never rolls forward passively in most plans, because the amount is a fresh annual choice.

**New hire.** A new employee's window opens with eligibility, and coverage starts after the plan's waiting period, which for a group health plan "must not apply any waiting period that exceeds 90 days," counting every calendar day from the enrollment date, weekends and holidays included; an orientation period before it is allowed only if it "does not exceed one month" (29 CFR 2590.715-2708). A worked example of my own: a plan's rule is "first of the month after 60 days." An employee hired and eligible on January 15, 2027 completes 60 days on March 15, so coverage starts April 1. The 90-day limit, counting January 15 as day 1, ends on April 14, so coverage must start no later than April 15; April 1 complies. A rule of "first of the month after 90 days" would put coverage on May 1 and fail. The engine computes the start date from the rule and the hire date and checks it against the limit, rather than trusting the plan's description.

**Life events.** Between open enrollments, a pre-tax election can change only when the plan allows it and an event permits it. Treas. Reg. 1.125-4 lists what a cafeteria plan may permit, and says plainly that "Section 125 does not require a cafeteria plan to permit any of these changes." The events:

| Event | Source | What may change | Effective date |
| --- | --- | --- | --- |
| **HIPAA special enrollment** (marriage, birth, adoption, placement for adoption, loss of other coverage) | 1.125-4(b), 29 CFR 2590.701-6 | Health coverage, consistent with the special enrollment right | Set by HIPAA (below) |
| **Change in status** (legal marital status, number of dependents, employment status of the employee, spouse or dependent, a dependent gaining or losing eligibility, change in residence) | 1.125-4(c) | Elections that are "on account of and correspond with" the change (the consistency rule) | Prospective, per the plan |
| **Judgment, decree or order** (a qualified medical child support order) | 1.125-4(d) | Add or drop the child's coverage as the order requires | Per the order |
| **Medicare or Medicaid entitlement** | 1.125-4(e) | Cancel or reduce the entitled person's health coverage, or add it back when entitlement ends | Prospective |
| **Significant cost or coverage change** | 1.125-4(f) | Automatic contribution adjustments for cost changes; new elections when an option is added or significantly curtailed; not for health FSAs | Prospective |
| **FMLA leave** | 1.125-4(g) | Health elections as the FMLA allows | Per the FMLA rules |

Two consequences. The consistency rule means a marriage permits adding the spouse, not switching from a PPO to an HMO for no reason; the engine needs a matrix of event kind by allowed change, per plan, not a free edit. And 401(k) deferrals aren't in this table at all: 1.125-4's provisions "do not apply with respect to elective contributions" under a 401(k) arrangement, which plans let participants change as the plan document allows ([401(k) Deferrals & Remittance](/books/workforce/retirement-plan-deferrals)).

## HIPAA Special Enrollment

Special enrollment is not a plan option. A group health plan must let an employee and dependents enroll after these events, with at least 30 days to ask, and must give a notice of special enrollment rights "at or before the time" the employee is first offered enrollment (29 CFR 2590.701-6):

| Event | Request window | Coverage effective |
| --- | --- | --- |
| **Loss of other coverage** (divorce, the other job ending, COBRA exhausted; not for unpaid premiums or for cause) | At least 30 days | No later than "the first day of the first calendar month beginning after" the plan receives the request |
| **Marriage** | At least 30 days | No later than the first day of the first calendar month after the request |
| **Birth** | At least 30 days | The date of birth |
| **Adoption or placement for adoption** | At least 30 days | No later than the adoption or placement date |
| **Loss of Medicaid or CHIP, or becoming eligible for premium assistance under them** | "not later than 60 days after" the termination or the eligibility determination (29 USC 1181(f)(3)) | Per the plan, within the special enrollment rules |

Worked with invented dates, each on a plan that gives exactly 30 days and starts coverage as late as the rule allows:

- **A birth.** A child is born on March 17, 2027 and the employee reports it on April 10, inside the 30 days. Coverage is effective March 17, and the employee moves from employee-plus-spouse to family coverage from that date. If family coverage costs the employee $260.00 a semimonthly period and employee-plus-spouse costs $180.00, and the March 31 and April 15 statements were paid at $180.00 before the change was processed, the next statement carries $80.00 × 2 = $160.00 of catch-up premium on top of $260.00, pre-tax under the cafeteria plan, because 1.125-4(b) lets a plan permit an election change that corresponds with a HIPAA special enrollment right, and for a birth that right starts coverage on the date of birth.
- **A marriage.** Married June 20, reported July 8: coverage no later than August 1. Marriage is prospective; as an example in 1.125-4 puts it, "no retroactive coverage is required in the event of marriage."
- **A spouse's job ends.** The spouse's coverage ends September 30 and the request arrives October 20: coverage for the spouse no later than November 1.
- **Late.** A birth reported on day 45 under a 30-day plan is outside the special enrollment window; the plan may be more generous, but the engine should record the request date, the rule and the denial, because "the plan let one person in late" is how a plan loses consistency.

Dependent eligibility for children is federal too: a plan that covers children must make coverage "available for children until attainment of 26 years of age," and can't condition it on "financial dependency," residency, "student status" or "marital status" (29 CFR 2590.715-2714). Losing child status at 26 is a COBRA qualifying event ([COBRA & State Continuation](/books/workforce/cobra)), so the age-out date is computed and generates both a termination and a notice.

## Evidence of Insurability

Group life and disability are underwritten in bulk, with a **guaranteed issue** amount anyone eligible gets without questions, and **evidence of insurability** (EOI) for amounts above it, for late entrants and for increases outside the first window. The carrier side of EOI, its evidence and decisions, is [Insurance's Life Underwriting](/books/insurance/life-underwriting#traditional-evidence); the enrollment side is three records: the election as made, the amount in force now, and the amount pending.

A worked example of my own: supplemental life is offered in multiples of salary with a $150,000 guaranteed issue limit and a rate of $0.20 per $1,000 a month. An employee earning $80,000 elects 5×, $400,000, at open enrollment. From the plan year start, $150,000 is in force at $0.20 × 150 = $30.00 a month, and $250,000 is pending EOI. The employee completes the health questions; the carrier approves on February 20. From the carrier's effective date for the approval (often the first of the month after approval, by policy), $400,000 is in force at $80.00 a month. Three mistakes to design out:

- **Deducting for coverage not in force.** The deduction follows the amount in force, not the amount elected; charging $80.00 from January for coverage the carrier never approved is a premium the plan has to refund and a claim it may deny.
- **Losing the pending request.** EOI forms that are never completed are common. The request needs an owner, a reminder schedule and an expiry, after which the election falls back to the guaranteed amount and the employee is told.
- **Forgetting imputed income.** Employer-paid basic life over $50,000 is taxable to the employee by the IRS table, which payroll computes ([Group-Term Life Over $50,000](/books/workforce/supplemental-wages-and-imputed-income#group-term-life-over-50-000)); a coverage change on EOI approval or a salary change changes the coverage amount the computation reads, from that month.

## Dependent Verification

Federal law says who a plan must allow (a spouse under special enrollment, children to 26); the plan says who it covers and what proof it wants. Dependent verification is a plan and vendor practice, not a statutory requirement, so I treat it as configuration: the documents a plan accepts per relationship (a marriage certificate or joint return for a spouse, a birth certificate or adoption papers for a child, a court order for a legal guardianship), a deadline after enrollment, and what happens if proof never arrives (the dependent is dropped prospectively, or retroactively where the plan document allows and the coverage was never valid). The design points:

- **Coverage first, proof second.** A newborn's coverage can't wait for a birth certificate; the engine enrolls under the HIPAA rule and opens a verification with its own deadline.
- **Proof is a document,** stored with its type, the reviewer and the decision, and kept on the dependent's retention clock ([Employee Records, Privacy & Retention](/books/workforce/employee-records-and-privacy#retention-schedules-by-record)).
- **Removal is an event,** with a date, a reason and its own carrier file and deduction change, and, for a dependent who loses coverage for a reason that is a qualifying event, a COBRA notice.
- **Court-ordered children aren't optional.** A qualified medical child support order, and a National Medical Support Notice, which "shall be deemed to be a qualified medical child support order" (29 USC 1169), add a child whether or not the employee elected it; the child support side is in [Medical Support: The NMSN](/books/workforce/child-support-withholding#medical-support-the-nmsn).

## Coverage Tiers and Rates

A **coverage tier** is how many people the election covers and is the unit most employers price by: employee only, employee plus spouse, employee plus children, family, with some plans using employee plus one. Carriers price it in one of two ways, and the employer decides how much of it the employee pays.

**How the carrier prices it.** In the individual and small group markets, ACA rating allows premiums to vary only by individual or family coverage, rating area, age (at most 3:1 for adults 21 and over) and tobacco use (at most 1.5:1); family premiums are computed per member and summed, where "the premiums for no more than the three oldest covered children must be taken into account" for children under 21, and a small group may be billed on an "average enrollee premium amount" (a composite rate) that "does not vary during the plan year" (45 CFR 147.102). Large groups are usually priced as composite tier rates. Life and disability are priced per $1,000 of coverage, by age band, or as a percentage of covered payroll. The rate structure is the carrier's, received at renewal; [Benefits Administration Platforms](/books/workforce/benefits-platforms) covers its data model.

**What the employee pays.** The employer's contribution strategy turns the premium into an employee cost: a percentage (the employer pays 80% of employee-only and 50% of dependent cost), a flat dollar contribution, or a defined contribution the employee spends across options. A worked example of my own, for a plan year with monthly premiums of $700.00 employee only and $1,900.00 family, employer pays 80% of employee only and 60% of family:

| Tier | Monthly premium | Employer monthly | Employee monthly | Employee semimonthly (24) | Employee biweekly (26) |
| --- | --- | --- | --- | --- | --- |
| Employee only | $700.00 | $560.00 | $140.00 | $70.00 | $64.62 |
| Family | $1,900.00 | $1,140.00 | $760.00 | $380.00 | $350.77 |

The biweekly column is the annual cost over 26 periods ($140.00 × 12 ÷ 26 = $64.615, rounded to $64.62, with the last period absorbing the difference). The alternative many employers use is deducting the semimonthly amount on 24 of 26 biweekly checks and skipping the two months with a third check, which keeps each month's deduction equal to the month's premium. Both are policy; the engine needs the policy as data, because it changes what a mid-year life event and a termination owe.

**Whether the employee pays pre-tax.** Premiums under the cafeteria plan reduce income tax, Social Security, Medicare and FUTA wages; the taxability is per pay item type ([Section 125 Cafeteria Plans](/books/workforce/deductions#section-125-cafeteria-plans)). Domestic partner coverage is the common exception. Publication 15-B's rule is that "Any fringe benefit you provide is taxable and must be included in the recipient's pay unless the law specifically excludes it," the accident and health exclusion reaches employees, "their spouses, their dependents, and their children (under age 27 at the end of the tax year)," and a registered domestic partnership or civil union isn't a marriage for federal tax purposes. So the employer's share of coverage for a partner who is neither a spouse nor a tax dependent is taxable income to the employee. That plans take the employee's share for the partner after-tax follows from the same exclusion, but the IRS pages I opened don't say it in those words, so I treat it as a plan and tax counsel setting. <!-- source-gap: wf-domestic-partner-imputed | missing | the employee's own share of premium for a non-dependent domestic partner's health coverage can't be paid pre-tax through a cafeteria plan | closes with: an IRS publication, regulation or ruling stating the treatment of the employee share, opened | checked: 2026-11-10 -->

## From Election to Deduction

The election produces deductions by rules that a payroll applies every period:

- **Which periods.** A deduction applies to the periods its coverage covers by the payroll's rule. Gusto Embedded applies a benefit "if it is effective on the pay period end date"; others apply by check date or by coverage month. The rule must be stated, because a coverage start of April 1 on a period of March 25 to April 7 is deducted in one convention and not in the other.
- **Prepaid or in arrears.** Some employers deduct a month's premium in the month before coverage (prepay), most in the month of coverage. Prepay shifts which statement carries the last premium at termination, and a termination without a final deduction becomes a receivable from the former employee.
- **Retroactive changes.** A birth or a late-processed event reaches back; the engine computes the difference for each affected paid period and writes catch-up lines, never edits paid statements ([Arrears and Catch-Up](/books/workforce/deductions#arrears-and-catch-up)).
- **Short checks.** When pay is too small for the premium (unpaid leave, a short week), the arrears rule on the deduction election decides; coverage during FMLA leave has its own payment options, covered in [Group Health Premiums During Leave](/books/workforce/fmla#group-health-premiums-during-leave).
- **Employer cost as memo.** The employer's share is a memo line with a liability to the carrier, which is what invoice reconciliation reads ([Employer Contributions as Memo Lines](/books/workforce/deductions#employer-contributions-as-memo-lines)); for medical, it also feeds W-2 box 12 code DD.
- **Termination.** Coverage usually ends at the end of the termination month by plan rule; the final statement carries the last premium by the prepay or arrears convention, and the end date generates the carrier termination and the COBRA event ([The Separation Workflow](/books/workforce/terminations-and-warn#the-separation-workflow)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `benefit_enrollments`, `life_events`, `dependents` and `deduction_elections` exist; this chapter adds the windows, EOI, verification and the rates the employee cost comes from, and makes the enrollment carry what is in force versus what was elected.

```sql
ALTER TABLE benefit_plans
  ADD COLUMN cafeteria_plan_document_id UUID REFERENCES documents (id),  -- what makes it pre-tax
  ADD COLUMN waiting_period_rule TEXT,     -- 'first_of_month_after_60_days', 'date_of_hire', ...
  ADD COLUMN deduction_period_rule TEXT NOT NULL DEFAULT 'period_end_in_coverage',
  ADD COLUMN biweekly_policy TEXT NOT NULL DEFAULT 'annualize_26',
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT benefit_plans_deduction_period_rule_check
    CHECK (deduction_period_rule IN ('period_end_in_coverage', 'check_date_in_coverage',
        'coverage_month', 'prepay_prior_month')) NOT VALID,
  ADD CONSTRAINT benefit_plans_biweekly_policy_check
    CHECK (biweekly_policy IN ('annualize_26', 'deduct_24_of_26')) NOT VALID;

ALTER TABLE benefit_enrollments
  ADD COLUMN elected_amount     BIGINT,     -- cents of coverage elected (life, disability)
  ADD COLUMN in_force_amount    BIGINT,     -- cents in force now; the deduction reads this
  ADD COLUMN benefit_rate_id    UUID,       -- benefit_rates, the cost the deduction came from
  ADD COLUMN elected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN enrollment_window_id UUID,     -- enrollment_windows
  ADD COLUMN status             TEXT NOT NULL DEFAULT 'active',
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT benefit_enrollments_status_check
    CHECK (status IN ('pending', 'active', 'pending_eoi', 'terminated', 'canceled')) NOT VALID;

ALTER TABLE life_events
  ADD COLUMN rule_ref           TEXT,       -- '29 CFR 2590.701-6(b)', '26 CFR 1.125-4(c)', plan rule
  ADD COLUMN coverage_effective_on DATE,    -- computed: birth date, first of next month, ...
  ADD COLUMN evidence_document_id UUID REFERENCES documents (id);

CREATE TABLE enrollment_windows (          -- open enrollment, new hire and life event windows
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),        -- null for an open enrollment
  kind                TEXT NOT NULL CHECK (kind IN ('open_enrollment', 'new_hire', 'life_event',
                        'special_enrollment', 'rehire')),
  life_event_id       UUID REFERENCES life_events (id),
  plan_year           DATERANGE NOT NULL,   -- the elections it can make apply to this year
  opens_on            DATE NOT NULL,
  closes_on           DATE NOT NULL,        -- computed from the rule; 30 or 60 days for HIPAA
  allowed_changes     JSONB NOT NULL,       -- plan kinds and tiers this event may change
  rule_ref            TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'open', 'closed',
                        'extended')),
  CHECK (closes_on >= opens_on)
);

ALTER TABLE benefit_enrollments
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD FOREIGN KEY (enrollment_window_id) REFERENCES enrollment_windows (id) NOT VALID;

CREATE TABLE eoi_requests (                -- the amount over guaranteed issue, pending the carrier
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_enrollment_id UUID NOT NULL REFERENCES benefit_enrollments (id),
  person_id           UUID NOT NULL REFERENCES persons (id),   -- the employee or a dependent
  guaranteed_amount   BIGINT NOT NULL,      -- cents in force without evidence
  requested_amount    BIGINT NOT NULL,
  reason              TEXT NOT NULL CHECK (reason IN ('over_guaranteed_issue', 'late_entrant',
                        'increase_outside_window')),
  carrier_ref         TEXT,                 -- the carrier's case; Insurance's evidence_orders
  sent_on             DATE,
  expires_on          DATE NOT NULL,        -- after this the election falls back
  decided_on          DATE,
  approved_amount     BIGINT,
  effective_on        DATE,                 -- the carrier's date for the approved amount
  status              TEXT NOT NULL CHECK (status IN ('awaiting_employee', 'submitted',
                        'approved', 'partially_approved', 'declined', 'expired', 'withdrawn')),
  CHECK (requested_amount > guaranteed_amount)
);

CREATE TABLE dependent_verifications (     -- proof a dependent is who the plan covers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  dependent_id        UUID NOT NULL REFERENCES dependents (id),
  benefit_enrollment_id UUID REFERENCES benefit_enrollments (id),
  relationship        TEXT NOT NULL,        -- as claimed: 'spouse', 'child', 'domestic_partner', ...
  required_by         DATE NOT NULL,
  document_ids        UUID[] NOT NULL DEFAULT '{}',
  reviewed_by         TEXT,
  decided_at          TIMESTAMPTZ,
  outcome_life_event_id UUID REFERENCES life_events (id),  -- the removal, if it failed
  status              TEXT NOT NULL CHECK (status IN ('requested', 'received', 'verified',
                        'failed', 'waived', 'court_ordered'))
);

CREATE TABLE benefit_rates (               -- what a tier costs, and who pays it, for a plan year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  coverage_tier       TEXT NOT NULL,        -- 'employee', 'employee_spouse', 'employee_children',
                                            -- 'family', or a volume rate for life and disability
  eligibility_class   TEXT,                 -- 'full_time_salaried', 'hourly', ...; null: everyone
  age_band            INT4RANGE,            -- for age-banded rates; null: composite
  tobacco             BOOLEAN,              -- null: not rated on tobacco
  rate_basis          TEXT NOT NULL CHECK (rate_basis IN ('per_month', 'per_1000_per_month',
                        'percent_of_covered_payroll')),
  total_monthly       BIGINT NOT NULL,      -- cents, or cents per $1,000 for volume rates
  employer_monthly    BIGINT NOT NULL,
  employee_monthly    BIGINT NOT NULL,
  employee_per_period JSONB NOT NULL,       -- {"weekly": .., "biweekly": 6462, "semimonthly": 7000}
  source_rate_table_id UUID,                -- plan_rate_tables (Benefits Administration Platforms)
  valid_during        DATERANGE NOT NULL,   -- the plan year
  CHECK (employer_monthly + employee_monthly = total_monthly)
);

ALTER TABLE benefit_enrollments
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD FOREIGN KEY (benefit_rate_id) REFERENCES benefit_rates (id) NOT VALID;
```

The coverage date rule for a special enrollment is short enough to keep in code, with the rule reference stored on the life event:

```go tab="Go"
package enrollment

import "time"

// SpecialEnrollmentEffective returns the latest coverage date 29 CFR
// 2590.701-6 allows for an event reported (requested) on requestedOn.
func SpecialEnrollmentEffective(kind string, eventOn, requestedOn time.Time) time.Time {
	switch kind {
	case "birth", "adoption", "placement_for_adoption":
		return eventOn // the event date itself
	default: // marriage, loss_of_coverage
		y, m, _ := requestedOn.Date()
		return time.Date(y, m+1, 1, 0, 0, 0, 0, time.UTC) // first of the next month
	}
}
```

```rust tab="Rust"
use chrono::{Datelike, NaiveDate};

/// The latest coverage date 29 CFR 2590.701-6 allows for an event
/// reported (requested) on `requested_on`.
pub fn special_enrollment_effective(kind: &str, event_on: NaiveDate, requested_on: NaiveDate) -> NaiveDate {
    match kind {
        "birth" | "adoption" | "placement_for_adoption" => event_on,
        _ => {
            // marriage, loss_of_coverage: first day of the next calendar month
            let (y, m) = if requested_on.month() == 12 {
                (requested_on.year() + 1, 1)
            } else {
                (requested_on.year(), requested_on.month() + 1)
            };
            NaiveDate::from_ymd_opt(y, m, 1).unwrap()
        }
    }
}
```

Design notes:

- **Elected, in force and deducted are different numbers.** The deduction election reads `in_force_amount` and the `benefit_rates` row, never the elected amount; an EOI approval is an event that moves `in_force_amount` from its effective date and generates a deduction change and a carrier change.
- **A window is a computed record,** with its rule and its close date, so a late request is denied by a row, not by a person, and an extended window is an explicit status ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Allowed changes are a matrix per plan,** event kind by plan kind by tier change, so the consistency rule is data the enrollment screen and the API both enforce.
- **Retro is a recomputation.** A coverage date before the last paid period makes the engine recompute the deduction for each affected period from the enrollment as of that period and write the differences on the next statement ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Every enrollment change emits one event** (`benefit_enrollment.changed` with the before and after) that the carrier connection, payroll and COBRA subscribe to, so a change can't reach one of them and not the others ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **Map, don't duplicate, the carrier's census.** A `benefit_enrollments` row with `in_force_amount` is the employer-side twin of Insurance's `certificates_of_coverage` with `amount_pending_eoi` ([How to Build It](/books/insurance/group-life-and-disability#how-to-build-it)); an `eoi_requests` row maps to the carrier's evidence order by `carrier_ref`.

## Auditing

Enrollment is audited by carriers (premium and eligibility audits), plan auditors and the DOL (ERISA plan administration), the IRS (cafeteria plan qualification) and courts (a denied claim for a dependent the employer says was enrolled):

- **Every election with its window,** the event behind it, the rule that permitted it and the date and channel it was made, so "why was this change allowed mid-year" has an answer.
- **Every denial** (a late request, an inconsistent change) with the rule and the dates.
- **The notices given:** special enrollment rights at first enrollment, open enrollment materials, the plan's summary documents as versions.
- **EOI history** from request to decision, and the deduction amounts against the in-force amount for every month.
- **Dependent proof** with reviewer and decision, and every removal with its reason.
- **Retro adjustments** tied to the enrollment change that caused them, so the carrier's bill, the deductions and the coverage agree month by month. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model three windows** (open enrollment, new hire, life event) as computed records with their rules and close dates.
- **Check the waiting period** against the 90-day limit from the hire date, counting every calendar day.
- **Encode HIPAA's effective dates:** the birth or adoption date, and the first of the month after the request for marriage and lost coverage; 30 days to ask, 60 for Medicaid and CHIP.
- **Enforce the consistency rule as a per-plan matrix,** and remember that Section 125 permits rather than requires every mid-year change.
- **Keep elected, in-force and deducted amounts apart,** with EOI as a pending amount that has an owner and an expiry.
- **Enroll first and verify second** for dependents, with proof as documents and removal as an event.
- **Store rates and contribution strategy per tier and plan year,** with the biweekly policy and the deduction period rule as data.
- **Recompute retro changes period by period** and write catch-up lines, never edits.

## References

**Law and regulation**

- [26 USC 125](https://www.law.cornell.edu/uscode/text/26/125), cafeteria plans: the written plan, employees only, cash and qualified benefits, no deferred compensation, the health FSA limit, simple cafeteria plans
- [26 CFR 1.125-4](https://www.law.cornell.edu/cfr/text/26/1.125-4), permitted election changes: special enrollment, change in status and the consistency rule, orders, Medicare and Medicaid, cost and coverage changes, FMLA, and 401(k) elections outside its scope
- [29 CFR 2590.701-6](https://www.law.cornell.edu/cfr/text/29/2590.701-6), HIPAA special enrollment: events, the 30-day minimum, effective dates and the notice of rights
- [29 USC 1181](https://www.law.cornell.edu/uscode/text/29/1181), special enrollment for loss of Medicaid or CHIP and premium assistance eligibility, 60 days
- [29 CFR 2590.715-2708](https://www.law.cornell.edu/cfr/text/29/2590.715-2708), the 90-day waiting period limit, counting calendar days, and the one-month orientation period
- [29 CFR 2590.715-2714](https://www.law.cornell.edu/cfr/text/29/2590.715-2714), dependent coverage of children to age 26 and the conditions a plan can't impose
- [29 USC 1169](https://www.law.cornell.edu/uscode/text/29/1169), qualified medical child support orders and the National Medical Support Notice
- [45 CFR 147.102](https://www.law.cornell.edu/cfr/text/45/147.102), fair health insurance premiums: rating factors, per-member family rating with the three-oldest-children rule, and the small group average premium option

**Agency guidance and forms**

- [IRS: Publication 15-B](https://www.irs.gov/publications/p15b), fringe benefits taxable unless excluded, the accident and health exclusion's reach, and registered domestic partners not treated as married

**Vendor documentation**

- [Check: Types of benefits](https://docs.checkhq.com/reference/types-of-benefits.md), benefit types by tax treatment and automatic catch-up
- [Check: documentation index](https://docs.checkhq.com/llms.txt), benefit integration partners
- [Gusto Embedded: Benefit effective dating](https://docs.gusto.com/embedded-payroll/docs/benefit-effective-dating.md), effective and expiration dates, non-overlapping windows and the pay period end date rule
- [Noyo: documentation index](https://docs.noyo.com/llms.txt), groups, members, member requests and snapshots
- [Noyo: The member change workflow](https://docs.noyo.com/docs/members/snapshot-workflow/the-member-change-workflow.md), snapshot statuses including `replaced`
- [Employee Navigator](https://www.employeenavigator.com/), employers, brokers and integrations served
- [Ease: About](https://www.ease.com/about/), ownership by Employee Navigator and agencies, groups and employees served
- [ADP: Benefits](https://www.adp.com/what-we-offer/benefits.aspx), automatic payroll deductions and carrier integrations
- [Paycom: Benefits administration](https://www.paycom.com/software/benefits-administration/), Benefits to Carrier
- [Rippling: Benefits](https://www.rippling.com/benefits), benefits administration with in-house or third-party brokers
