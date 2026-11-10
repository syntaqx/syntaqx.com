+++
title = "Group Life & Disability"
description = "Group term life, AD&D, STD and LTD, voluntary benefits, ERISA claim rules, private plans for state disability and leave, carrier enrollment and billing."
category = "Insurance Industry"
order = 2766
part = "Life and Annuities"
tags = ["insurance", "group-insurance", "disability-insurance", "erisa", "employee-benefits", "life-insurance"]
+++

Most Americans who have life or disability insurance got it through work. Group insurance flips the individual model: the employer (or a union or association) is the policyholder, the insurer underwrites the group rather than each person, employees get certificates instead of policies, and the premium arrives on one bill computed from a census of everyone covered. Underwriting is light (guaranteed issue up to a limit, evidence of insurability above it), and because the plan is an employee benefit plan, federal law under ERISA governs how claims are decided and appealed, with clocks and notice rules that override most state claim practices. Group term life, accidental death and dismemberment, short- and long-term disability and the voluntary products employees buy at the worksite (accident, critical illness, hospital indemnity) are the core lines, written by carriers like Unum, MetLife, The Hartford, Lincoln, Guardian, Sun Life and Mutual of Omaha.

The employer's side of the same benefits, enrollment in the HR system, payroll deductions, the imputed income on group term life over $50,000 and the state disability and paid leave programs, belongs to the [Workforce](/books/workforce/workforce-business#how-to-read-this-volume) volume. Health plans belong to [Health Tech](/books/health-tech/payers-and-plans). This chapter covers the carrier's side: the products, conversion and portability, disability benefits and offsets with worked numbers, voluntary benefits, ERISA's claim rules, the private plans that substitute for state disability and leave programs, and enrollment and billing on the carrier's books, with the `group_census` and `certificates_of_coverage` tables against the core model's `policies` and `parties`.

## How the Platforms Do It

What group carriers and the state programs publish, as of November 2026:

| Company or program | What it does | What its public material shows |
| --- | --- | --- |
| **Unum** | Group disability, group life and AD&D, voluntary benefits, individual disability, dental and vision; Colonial Life at the worksite | Unum US premium in 2025: group disability 44.4%, group life and AD&D 29.2%, voluntary benefits 13.1%, individual disability 8.7%, dental and vision 4.6%; Colonial Life: accident, sickness and disability 54.0%, life 26.3%, cancer and critical illness 19.7%; leave management and ASO sold as fee-based services priced per employee per month; sold by field sales "in conjunction with independent brokers and consultants" (2025 10-K) |
| **NAIC 2025 market share** | Accident and health and life rankings | Unum (1.27%) and The Hartford (1.10%) among the top 25 life groups; after the health insurers, MetLife, Unum, Mutual of Omaha, Aflac, Guardian and Sun Life lead the accident and health ranking |
| **Majesco** | Intelligent Core for LA&H | Group and voluntary benefits on the same policy, billing and claims core as individual lines |
| **New York Disability and Paid Family Leave** | Statutory short-term disability and family leave, insured privately | Employers secure coverage through a DFS-authorized carrier, the State Insurance Fund or Board-approved self-insurance; employee DB contribution half of one percent of wages, up to 60 cents a week; the insurer notifies the Board electronically by the employer's FEIN |
| **California Voluntary Plan** | A private alternative to State Disability Insurance | Must provide all SDI benefits and at least one better, can't cost employees more than SDI, covers Paid Family Leave; employees in a VP aren't eligible for SDI; a carrier has 25 days to respond to a referred SDI claim |

Three patterns. **Group disability is the biggest line and the most claims-intensive,** which is why Unum's mix leans on it and why its fee services (leave management, ASO) sit next to it. **The state programs are insurance markets,** where private carriers write the statutory coverage and report it to the state electronically. **Group carriers sell services, not just risk:** leave management and administrative services only are fee businesses priced per employee per month, run on the same claim platform.

## Group Term Life and AD&D

The employer holds a master policy; each eligible employee gets a **certificate** describing the coverage, which the insurer issues to the policyholder for delivery to the insured (N.Y. Ins. Law 3220(a)(4)). Coverage is usually:

- **Basic life**, employer-paid, a flat amount or a multiple of salary, guaranteed issue for everyone eligible.
- **Supplemental (optional) life**, employee-paid by payroll deduction, in multiples of salary or units, guaranteed issue up to a limit at initial enrollment and subject to **evidence of insurability** (EOI) above it or for late entrants; EOI is individual underwriting with the same evidence and rules as [Life Underwriting](/books/insurance/life-underwriting#traditional-evidence).
- **Dependent life** on spouses and children.
- **Accidental death and dismemberment (AD&D)**, an extra benefit for accidental death and a schedule of percentages for specified losses, decided on cause and circumstances.

New York's group standard provisions make the group policy incontestable after two years from issue except for nonpayment by the policyholder (3220(a)(1)). The employer-paid premium for coverage over $50,000 is taxable to the employee as imputed income, which payroll computes from the IRS table ([Group-Term Life Over $50,000](/books/workforce/supplemental-wages-and-imputed-income#group-term-life-over-50-000)); the carrier's job is to give the employer the coverage amounts the computation needs.

## Conversion and Portability

When group coverage ends for an employee, the law gives a **conversion privilege**: an individual policy without evidence of insurability. New York's version (3220(a)(6) to (8)), which shows the moving parts every state's has in some form:

- Coverage ending because employment or class membership ends, the group policy terminates, or coverage is reduced, entitles the insured to apply within **31 days**, "without evidence of insurability," for an individual policy for the amount of group coverage lost, less any life insurance remaining in force (80% of prior coverage for certain reductions).
- If the policyholder terminates the group policy, the convertible amount is limited by coverage obtained elsewhere within 45 days.
- A **death within the 31-day period** is payable "as a death benefit by the insurer," whether or not the insured applied.
- **Total and permanent disability** ending coverage allows a life policy preceded by one year of term.
- Dependents' coverage may convert at the employee's option, effective when the group coverage ended (a)(7).
- **Notice** of the conversion right must be given "within fifteen days before or after" the triggering event; if given more than 15 but less than 90 days after, the conversion period extends 45 days from the notice; if not given within 90 days, the privilege "shall expire at the end of such ninety days" (a)(8).

**Worked numbers: a late notice.** An employee's employment, and group life coverage, ends Tuesday, June 30, 2026. With timely notice, the conversion window closes Friday, July 31 (31 days), and a death on July 20 is payable from the group policy. If the employer's file reaches the carrier late and the notice goes out Monday, August 10 (41 days after the event), the window extends 45 days from the notice, to Thursday, September 24. If no notice is ever given, the privilege expires Monday, September 28, 90 days after the event. Every date depends on the termination date the employer reports, which is why termination dates and their report dates are both stored, and why a late termination file is a liability for the carrier as well as the employer.

**Portability** is a separate feature some group contracts offer: the departing employee keeps group term coverage at group-based rates, billed directly, instead of converting to an individual whole life policy at individual rates. It is a contract term, so the census record has to say which options a certificate carries and when each expires.

## Short- and Long-Term Disability

Disability insurance replaces income when illness or injury stops someone working:

- **Short-term disability (STD)** pays a weekly benefit (a percentage of weekly earnings up to a maximum) after a short elimination period, for weeks or months. In New York and California it overlaps with, or is, the statutory program ([State Disability and Paid Leave: Private Plans](#state-disability-and-paid-leave-private-plans)).
- **Long-term disability (LTD)** pays a monthly benefit after a longer elimination period, often to normal retirement age. The definition of disability usually changes after an initial period: the employee must be unable to perform their **own occupation** for the first period, then **any gainful occupation** for which they are reasonably qualified. The plan in *Metropolitan Life Insurance Co. v. Glenn* (2008) is typical: 24 months of own-occupation benefits, then a stricter, Social Security-like standard.
- **Benefit and offsets.** LTD pays a percentage of pre-disability earnings, up to a monthly maximum, **less deductible sources of income**: CIRCOR's CFO letter describes 60% of monthly pre-disability earnings up to $15,000, "less deductible sources of income," and AutoZone's describes executive plans paying 70% tiers up to a combined $30,000 a month, which "may be reduced by deductible sources of income and disability earnings." Which income counts as a deductible source is the certificate's list, and Social Security disability benefits are the one that matters most, as the next case shows.

The Social Security offset is why LTD carriers help claimants apply for Social Security Disability Insurance. In *Glenn*, MetLife referred the claimant to a law firm to pursue SSDI; SSA awarded benefits retroactively, and about three-quarters of the back payment went to MetLife as an offset of benefits it had already paid, the rest to the lawyers, and none to the claimant.

**Worked numbers: an LTD benefit with offsets.** Mine, on an illustrative certificate: 60% of monthly pre-disability earnings up to $10,000, less deductible sources of income, with a minimum monthly benefit of $100, and offsets frozen at their initial amounts (later cost-of-living increases in Social Security don't reduce the benefit further).

| Item | Calculation | Monthly |
| --- | --- | ---: |
| Pre-disability earnings | | $6,000.00 |
| Gross benefit | 6,000 × 60% (under the $10,000 maximum) | $3,600.00 |
| SSDI, primary | | −$2,000.00 |
| SSDI, family (dependent child) | | −$1,000.00 |
| Net benefit | 3,600 − 3,000, above the $100 minimum | **$600.00** |

Before the SSDI award, the carrier pays the full $3,600 or estimates the offset, as the certificate provides. When SSA awards SSDI retroactive to eight months back, the carrier has overpaid 8 × $3,000 = $24,000, which it recovers from the retroactive award, reduces future payments to recoup, or both. The system has to keep the gross benefit, each offset with its source, effective dates and whether it is estimated or awarded, and the overpayment ledger, because offsets change after payments have already gone out.

## Voluntary Benefits

Voluntary (worksite) benefits are employee-paid products sold at the workplace through payroll deduction: accident insurance (fixed amounts for specified injuries and treatments), critical illness (a lump sum on diagnosis of a listed condition), hospital indemnity (fixed amounts per admission or day), plus supplemental life and disability. Unum's voluntary benefits were 13.1% of its US premium in 2025, and its Colonial Life segment, which sells at the workplace through an independent contractor sales force and brokers, was 54.0% accident, sickness and disability, 26.3% life and 19.7% cancer and critical illness. They pay fixed amounts on events rather than reimbursing medical bills, which keeps them outside Health Tech's claims model, though they are accident and health lines in NAIC's statistics. Enrollment is the hard part: an employee elects at enrollment, a benefits platform sends the election, payroll takes the deduction, and the carrier bills and reconciles.

## ERISA Claim Rules

A group life or disability plan an employer sponsors for employees is an ERISA employee benefit plan, and the Department of Labor's claims procedure regulation (29 CFR 2560.503-1) sets the clocks:

| Claim type | Initial decision | Extensions | Appeal window | Decision on appeal |
| --- | --- | --- | --- | --- |
| **Disability** | 45 days after the plan receives the claim (f)(3) | Up to 30 days for matters beyond the plan's control, then another 30, each with notice before the prior period ends | At least 180 days (h)(4) applying (h)(3)(i) | 45 days, extendable by up to 45 (i)(3) |
| **Life and other non-health, non-disability** | 90 days (f)(1) | Up to 90 days | At least 60 days | 60 days, extendable by up to 60 (i)(1)(i) |

The disability rules go further, for claims filed after April 1, 2018 (p)(3). An extension notice must explain the standards for entitlement, the unresolved issues and the information needed, and give the claimant at least 45 days to provide it; the decision clock is tolled while the plan waits. A denial notice must discuss why the plan disagreed with or didn't follow the views of the claimant's treating health care and vocational professionals, the plan's own medical or vocational experts, and any SSA disability determination (g)(1)(vii); include the internal rules, guidelines or protocols relied on, or say none exist; and describe any contractual limitations period with its calendar expiration date (j)(4)(ii). Before deciding an appeal adversely, the plan must give the claimant, free, any new or additional evidence or rationale, with time to respond (h)(4). If the plan fails to "strictly adhere to all the requirements" for a disability claim, the claimant is deemed to have exhausted administrative remedies and may sue, unless the violation is de minimis, for good cause, in a good-faith exchange and not part of a pattern (l)(2).

When a plan gives the insurer discretion, courts review its decisions for abuse of discretion, and *Glenn* held that an insurer that both decides and pays claims has a conflict of interest that courts weigh as one factor, more heavily where there is evidence of biased claims handling and less where the insurer has safeguards. Those safeguards (separating claim decisions from financial results, independent reviewers on appeal, the "not the original decider or a subordinate" rule) are system design: who can see what, and who can decide what.

The deadline arithmetic is a small function over the plan's claim type and the claim's events:

```go tab="Go"
import "time"

// DisabilityDecisionDue returns the initial decision deadline for an ERISA
// disability claim: 45 days from receipt, plus each 30-day extension taken,
// plus days tolled while waiting for the claimant's information.
func DisabilityDecisionDue(received time.Time, extensions int, tolledDays int) time.Time {
	if extensions > 2 {
		extensions = 2 // the regulation allows two 30-day extensions
	}
	return received.AddDate(0, 0, 45+30*extensions+tolledDays)
}

// AppealDue returns the decision deadline on review: 45 days for disability,
// 60 for other claims, doubled by one extension.
func AppealDue(requested time.Time, disability, extended bool) time.Time {
	d := 60
	if disability {
		d = 45
	}
	if extended {
		d *= 2
	}
	return requested.AddDate(0, 0, d)
}
```

```rust tab="Rust"
use chrono::{Duration, NaiveDate};

/// Initial ERISA disability decision deadline: 45 days, plus up to two
/// 30-day extensions, plus days tolled awaiting the claimant's information.
pub fn disability_decision_due(received: NaiveDate, extensions: i64, tolled_days: i64) -> NaiveDate {
    received + Duration::days(45 + 30 * extensions.min(2) + tolled_days)
}

/// Decision deadline on review: 45 days for disability, 60 otherwise; doubled by an extension.
pub fn appeal_due(requested: NaiveDate, disability: bool, extended: bool) -> NaiveDate {
    let d = if disability { 45 } else { 60 };
    requested + Duration::days(if extended { d * 2 } else { d })
}
```

A disability claim received Monday, March 2, 2026, with one extension and 20 days tolled while the claimant's records were outstanding, is due Friday, June 5 (45 + 30 + 20 = 95 days). Each extension and each tolling period is a `claim_tasks` row with the notice that justified it, because an extension without its notice is the kind of failure that triggers deemed exhaustion.

## State Disability and Paid Leave: Private Plans

Several states run statutory disability or paid family leave programs funded by payroll contributions; the [Workforce](/books/workforce/workforce-business#how-to-read-this-volume) volume's [State Paid Family & Medical Leave](/books/workforce/state-paid-leave) chapter covers each program's rates, wage bases and employer duties. Two states make the coverage itself an insurance product the employer can buy:

- **New York.** Employers must secure statutory disability benefits (DBL) and paid family leave (PFL) coverage through a carrier authorized by the Department of Financial Services, the New York State Insurance Fund (which must cover any employer that seeks coverage unless it owes NYSIF money), or Board-authorized self-insurance with a security deposit. Employers may collect employee contributions for DB of one-half of one percent of wages, capped at 60 cents a week, so an employee earning $1,000 a week contributes $0.60, not $5.00; PFL contribution rates are set by DFS each year. The insurer must notify the Workers' Compensation Board electronically of each employer's coverage by FEIN, and employers must give their carrier every FEIN when coverage starts or changes.
- **California.** A **Voluntary Plan** replaces SDI for an employer's workforce: it must include all SDI benefits and at least one that is better, can't cost employees more than SDI, and covers Paid Family Leave, so the employer must approve PFL requests; employees covered by a VP aren't eligible for SDI; when an SDI claim is referred to the VP carrier, the carrier has 25 days to respond; denials must explain appeal rights; and the employer files VP reports through SDI Online.

For the carrier, a statutory plan is a group policy with state-set minimum benefits, state reporting by employer identifier, and state deadlines on top of the contract's, and each state's rules are rows in the rules table, not a branch in code.

## Carrier-Side Enrollment and Billing

The carrier's group system runs on the **census**: who is eligible, in which class, for what coverage, at what earnings, effective when.

- **Eligibility and classes.** The policy defines classes (salaried, hourly, executives), eligibility rules (hours worked, waiting periods) and benefit schedules per class. The census row says which class each employee is in, effective-dated.
- **Enrollment.** Elections arrive from the employer or its benefits administration platform as files or API calls; new elections above guaranteed issue limits, or from late entrants, open EOI cases, and coverage over the limit is pending until EOI is approved.
- **Certificates.** Each covered person gets a certificate describing their coverage, generated from the policy and the census row ([Generated Documents](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
- **Billing.** The carrier bills the employer on a **list bill**: one invoice per period, computed from the census as of the bill date, with a line per employee and coverage; the employer remits, often net of changes it knows about. Retroactive changes (a termination reported two months late, a salary increase) produce adjustments on later bills, and the policy may limit how far back a termination can be credited. The invoice records reuse [Billing & Premium Finance](/books/insurance/billing-and-premium-finance#how-to-build-it)'s `invoices` and `payments`; reconciliation is the hard part, because the employer's payroll deductions ([Workforce Deductions](/books/workforce/deductions)) and the carrier's bill are computed from two copies of the same census.
- **Terminations and continuation.** A termination ends coverage at the policy's rule (end of the month, the day of termination), starts the conversion and portability clocks, and, for disability claimants, may continue coverage under a waiver of premium.

## How to Build It

Group business uses the core model's `policies` (the master policy, with the employer as named insured), `parties` (employer and covered people), `coverages` (per class and benefit), `claims` with `claim_tasks` for ERISA clocks, Billing & Premium Finance's `invoices` and `payments` for the list bill, and [Life Underwriting](/books/insurance/life-underwriting#how-to-build-it)'s `evidence_orders` for EOI. This chapter adds the census and the certificate:

```sql
CREATE TABLE group_census (                -- one covered person's group facts, effective-dated
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),   -- the master policy
  member_party_id    UUID NOT NULL REFERENCES parties (id),
  employer_fein      TEXT NOT NULL,         -- state reporting keys on it
  employee_ref       TEXT NOT NULL,         -- the employer's id for the person
  class_code         TEXT NOT NULL,         -- 'salaried', 'hourly', 'exec'
  earnings_basis     BIGINT,                -- annual or monthly, per policy definition
  hours_per_week     NUMERIC(5,2),
  hired_on           DATE,
  eligible_on        DATE,                  -- after the waiting period
  employment_ended_on DATE,
  valid_during       DATERANGE NOT NULL,    -- effective time of these facts
  reported_at        TIMESTAMPTZ NOT NULL,  -- when the employer told us
  source_file_ref    TEXT NOT NULL,
  EXCLUDE USING gist (policy_id WITH =, member_party_id WITH =, valid_during WITH &&)
);

CREATE TABLE certificates_of_coverage (    -- what each person is covered for
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  member_party_id    UUID NOT NULL REFERENCES parties (id),
  insured_party_id   UUID NOT NULL REFERENCES parties (id),  -- member, spouse or child
  coverage_code      TEXT NOT NULL,         -- 'basic_life', 'supp_life', 'add', 'std',
                                            -- 'ltd', 'accident', 'critical_illness', 'dbl', 'pfl'
  amount             BIGINT,                -- face, or monthly/weekly benefit
  amount_pending_eoi BIGINT NOT NULL DEFAULT 0,
  evidence_order_id  UUID,                  -- EOI case, if any
  elected_on         DATE NOT NULL,
  effective          DATERANGE NOT NULL,
  premium_payer      TEXT NOT NULL CHECK (premium_payer IN ('employer', 'employee',
                       'shared')),
  conversion_deadline DATE,                 -- computed on termination
  portability_deadline DATE,
  notice_sent_at     TIMESTAMPTZ,           -- conversion notice, drives extensions
  document_id        UUID,                  -- the certificate as issued
  status             TEXT NOT NULL CHECK (status IN ('active', 'pending_eoi',
                       'terminated', 'converted', 'ported', 'waived_premium'))
);
```

Three rules. **Keep both clocks on the census:** `valid_during` for when facts were true and `reported_at` for when the employer told the carrier, because late reports drive retroactive billing, conversion notice extensions and disputes ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)). **Compute bills from the census as of the bill date, as known on the bill date,** and post later corrections as adjustments, never by regenerating old invoices. **Model disability benefits as a gross amount minus offset entries,** each offset with its source, effective dates and whether it is estimated, plus an overpayment ledger.

## Auditing

- **ERISA clocks.** Every disability and life claim with its receipt date, extensions and their notices, tolling periods, decision dates, appeal requests and appeal decisions against the regulation's deadlines, plus the reviewer on appeal and evidence that they weren't the original decider or a subordinate.
- **Denial notice content.** For disability denials, the required discussions (treating providers, vocational experts, SSA determinations), internal rules, and the limitations period with its date.
- **Offsets and overpayments.** Every offset with its documentation and every overpayment recovery, because offsets are where LTD disputes concentrate.
- **Conversion notices.** Termination dates, report dates, notice dates and the resulting deadlines for every terminated member.
- **Statutory plans.** Coverage notifications to New York's Board by FEIN, California VP reporting, and the state-set benefit minimums applied.
- **Census to bill.** Each invoice line traceable to the census row as of the bill date.

## What This Means for the System You Build

- **Run the group book from an effective-dated census** with report times, and derive certificates, bills and eligibility from it.
- **Encode ERISA claim clocks as tasks** with extension notices and tolling, and design the appeal path so a different, non-subordinate reviewer decides.
- **Store disability benefits as gross minus dated offsets,** with estimated versus awarded status and an overpayment ledger.
- **Compute conversion and portability deadlines on termination** from the state rule and the notice date, and send the notice as a tracked document.
- **Treat state statutory plans as group products with state reporting by FEIN** and state minimum benefits as rules.
- **Bill from the census as known on the bill date** and post later changes as adjustments, reconciling against the employer's deductions.

## References

**Law and regulation**

- [29 CFR 2560.503-1](https://www.law.cornell.edu/cfr/text/29/2560.503-1), ERISA claims procedure: decision and appeal deadlines for disability and other claims, extension notices, disability denial notice content, contractual limitations periods, deemed exhaustion and the April 1, 2018 applicability date
- [N.Y. Ins. Law 3220](https://www.nysenate.gov/legislation/laws/ISC/3220), group life standard provisions: incontestability, certificates, the 31-day conversion privilege, death in the conversion period, disability conversion, dependents and the conversion notice rules

**Courts**

- [Metropolitan Life Insurance Co. v. Glenn, 554 U.S. 105 (2008)](https://www.law.cornell.edu/supct/html/06-923.ZO.html), the insurer's conflict of interest as a factor in review, the 24-month own-occupation LTD plan and the SSDI offset of the retroactive award

**Regulators and guidance**

- [New York Workers' Compensation Board: Employer disability benefits](https://apps.wcb.ny.gov/content/main/DisabilityBenefits/employer-disability-benefits.jsp), how employers secure DBL and PFL coverage, employee contribution limits and insurer notification by FEIN
- [California EDD: Voluntary Plan FAQ](https://edd.ca.gov/en/disability/FAQ_Voluntary_Plans), the VP standard, cost limit, PFL coverage, SDI ineligibility, the 25-day carrier response and reporting

**NAIC**

- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), Unum's and The Hartford's life shares and the accident and health ranking

**Filings**

- [Unum Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/5513/000000551326000008/unm-20251231.htm), premium mix by segment and product, Colonial Life's mix, leave management and ASO fee services, and distribution
- [CIRCOR International: CFO offer letter, Exhibit 10.4 to Form 10-Q (June 2020)](https://www.sec.gov/Archives/edgar/data/1091883/000109188320000084/cirq103292020ex104.htm), an LTD benefit of 60% of earnings up to $15,000 less deductible sources of income
- [AutoZone: Exhibit 10.1 to Form 8-K (September 2020)](https://www.sec.gov/Archives/edgar/data/866787/000117184320006452/exh_101.htm), executive LTD plans at 70% tiers up to $30,000 a month, reduced by deductible sources of income and disability earnings

**Vendor documentation**

- [Majesco](https://www.majesco.com/), Intelligent Core for LA&H across group and voluntary benefits
