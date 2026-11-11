+++
title = "Professional & Management Liability"
nav_title = "Professional Liability"
description = "E&O, D&O and EPLI as claims-made products: retro dates, tails and extended reporting periods worked under New York's rules, and defense within limits."
category = "Insurance Industry"
order = 2748
part = "Commercial and Specialty Lines"
tags = ["insurance", "professional-liability", "directors-and-officers", "epli", "claims-made", "commercial-lines"]
+++

Professional and management liability insures decisions rather than accidents. Errors and omissions (E&O, called professional liability for licensed professions) covers the claim that an architect, a lawyer, an accountant, a software vendor or an insurance agent made a mistake that cost a client money. Directors and officers (D&O) covers claims against an organization's leaders for how they ran it, and, in most forms, the organization itself for securities claims. Employment practices liability (EPLI) covers claims by employees and applicants for discrimination, harassment, wrongful termination and retaliation. Fiduciary liability covers the people who run an employee benefit plan. None of these fits an occurrence trigger well: the wrongful act and the claim can be years apart, and the injury is often a financial loss nobody can date. So they are written on a **claims-made** basis, and the data that decides coverage is a set of dates the system has to get right: the retroactive date, the policy period, the date a claim was first made, the date it was reported, and any extended reporting period.

This chapter covers the products, the claims-made mechanics with a worked timeline under New York's regulation (the most detailed public rulebook), defense costs inside the limit, and the data model. Occurrence versus claims-made in general is in [The Commercial Lines Map](/books/insurance/commercial-lines#occurrence-versus-claims-made); EPLI's subject matter (the employment law the claims arise from) is the Workforce volume's, and this book owns the insurance. It extends `coverages` and `claims` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `claims_made_terms`.

## How the Platforms Do It

As of November 2026, from public filings and pages:

| Company | Lines | What the public record says |
| --- | --- | --- |
| **RLI** | Professional services, executive products | 2025 net premiums earned of $108.1 million in professional services and $22.9 million in executive products, inside a casualty segment of $954.0 million |
| **Skyward Specialty** | Professional Lines division | One of nine underwriting divisions; 59% of 2025 gross written premium non-admitted |
| **ERGO NEXT** | Small business professional liability, E&O and EPLI online | Sold beside general liability and BOP to small businesses, online and through agents |
| **Kinsale** | E&S casualty including professional lines | Writes all lines on an E&S basis, with no delegated underwriting authority |

Large-account D&O and E&O are broker-placed in towers of primary and excess layers, often with several insurers per layer; small-business E&O and EPLI are sold as add-ons to a BOP or as standalone online policies. Much of the line is written non-admitted, on the insurer's own forms, which is why the forms vary more than in CGL ([Excess & Surplus Lines](/books/insurance/excess-and-surplus-lines)).

## The Products

**Errors and omissions.** The insuring agreement covers damages and defense for claims arising from a wrongful act in rendering or failing to render professional services. The definition of professional services is the coverage: a policy written for "architectural services" doesn't cover a contractor's construction work by the same firm. Exclusions usually take out bodily injury and property damage (left to the CGL), intentional and fraudulent acts (often only after a final adjudication), contractual liability beyond what the professional would owe anyway, and prior known acts.

**Directors and officers.** A D&O policy has three insuring agreements. Side A covers directors and officers directly for loss the organization does not indemnify (insolvency, or indemnification the law forbids), Side B reimburses the organization when it indemnifies them, and Side C covers the organization itself, for securities claims in a public company form and more broadly in private and nonprofit forms. The order of payments and the priority of Side A when the limit is shared is written into the policy, and a Side A-only policy sits above the tower for the directors' benefit alone.

**Employment practices liability.** Covers the employer and its people for employment-related claims, often including third-party harassment and discrimination claims by customers, with wage and hour claims excluded or sublimited and defense costs for them sometimes covered. EPLI is frequently sold as an endorsement on a BOP for small businesses and standalone or within a management liability package for larger ones.

**Fiduciary liability.** Covers breaches of fiduciary duty in running ERISA plans; claims-made, frequently packaged with D&O and EPLI.

## Claims-Made Mechanics

A claims-made policy covers a claim if four conditions hold:

1. The **wrongful act** happened on or after the **retroactive date** (and before the end of the policy period).
2. The **claim was first made** during the policy period (or an extended reporting period).
3. The claim was **reported** to the insurer within the policy's reporting window (in claims-made-and-reported forms, during the policy period or a short window after it).
4. No exclusion applies, notably the **prior knowledge** exclusion for acts the insured knew could lead to a claim before the policy began.

New York's Regulation 121 (11 NYCRR Part 73) defines the terms the industry uses. A retroactive date is "a date concurrent with the effective date of the policy" or an earlier date the parties agree; extended reporting period coverage, "tail or tail coverage," is coverage for the period specified in the policy after it ends; and a **claims-made relationship** is the period from the effective date of the first claims-made policy, through renewals with the same insurer, excluding any extended reporting period.

Four rules in 11 NYCRR 73.3 shape the system, and other states' rules and the forms themselves follow the same pattern:

- **The retro date is fixed for the relationship.** "A retroactive date may not be changed during the term of the claims-made relationship and any extended reporting period." A renewal that advances the retro date takes away coverage for acts the insured was covered for last year; the regulation forbids it within the relationship, and the record must carry the retro date forward on every renewal.
- **An automatic tail.** On termination, the insurer must provide "a 60-day automatic extended reporting period, or 90 days in case of public entity liability," at no charge.
- **A notice within 30 days.** "Within 30 days after termination of coverage, the insurer must advise the insured in writing" of the automatic tail and of the availability, premium and importance of buying more. The insured has the greater of 60 days from termination or 30 days from the notice's mailing or delivery to accept.
- **What must be offered.** The insurer must offer a three-year extended reporting period, or a one-year period for listed coverages including D&O (except for not-for-profits), employee benefit, fiduciary, public entity, pollution and employment practices liability. Its premium is based on the rates in effect when the policy was issued or last renewed, and "shall be commensurate with the coverage provided."

A tail does not extend coverage to new wrongful acts. It extends only the time to make claims for acts before the end of the last policy period and after the retro date. **Prior acts coverage** (nose coverage) is the mirror image: a new insurer accepts the old retro date so the insured keeps continuous coverage for past acts without buying a tail from the old one.

### A Worked Timeline

The dates are mine; the rules are New York's. An architecture firm buys its first claims-made E&O policy effective March 1, 2019, with the retroactive date March 1, 2019, and renews annually with the same insurer. The insurer nonrenews at the March 1, 2026 expiry. The claims-made relationship runs March 1, 2019 to March 1, 2026; the retro date has stayed March 1, 2019 on all seven terms.

| Event | Date | Result |
| --- | --- | --- |
| Termination of coverage | March 1, 2026 | The automatic 60-day extended reporting period runs to April 30, 2026 |
| Insurer's notice of the tail options, latest | March 31, 2026 | 30 days after termination |
| Notice actually mailed | March 20, 2026 | 30 days after mailing is April 19, 2026 |
| Insured's deadline to buy the tail | April 30, 2026 | The greater of 60 days from termination (April 30) and 30 days from mailing (April 19) |
| Optional tail offered | Three years | E&O for architects is not on the one-year list, so the three-year period applies, to March 1, 2029 |

Four claims against the firm, and which period answers each:

| Wrongful act | Claim first made | Covered? |
| --- | --- | --- |
| A design error in 2018 | June 2025 | No: the act predates the March 1, 2019 retro date |
| A design error in 2023 | June 2025 | Yes, under the March 1, 2025 to March 1, 2026 term, if reported as the policy requires |
| A design error in 2024 | April 10, 2026 | Yes, within the automatic 60-day tail |
| A design error in 2024 | September 2027 | Only if the firm bought the three-year tail; otherwise uncovered, unless a new insurer granted prior acts back to March 1, 2019 |
| A design error in May 2026 | 2027 | Never under this insurer: the act is after the last policy period ended |

The tail premium is computed from the rates in effect at the 2025 renewal, not today's, unless the policy provides at least a five-year tail with a separate aggregate of at least 100% of the annual aggregate, in which case current rates may apply.

The deadline arithmetic is small enough to keep as a function beside the rule data:

```go tab="Go"
type TailRule struct {
	AutomaticDays int    // 60, or 90 for public entity liability
	NoticeDays    int    // insurer must notify within this many days of termination
	AcceptFromEnd int    // insured may accept within this many days of termination...
	AcceptFromMail int   // ...or this many days of the notice, whichever is later
	OfferYears    int    // 3, or 1 for D&O, EPL, fiduciary and the other listed lines
	Citation      string // "11 NYCRR 73.3(d)-(g)"
}

type TailDates struct {
	AutomaticEnds, NoticeDue, AcceptBy, OptionalEnds time.Time
}

func Tail(r TailRule, terminated, noticeMailed time.Time) TailDates {
	accept := terminated.AddDate(0, 0, r.AcceptFromEnd)
	if m := noticeMailed.AddDate(0, 0, r.AcceptFromMail); m.After(accept) {
		accept = m
	}
	return TailDates{
		AutomaticEnds: terminated.AddDate(0, 0, r.AutomaticDays),
		NoticeDue:     terminated.AddDate(0, 0, r.NoticeDays),
		AcceptBy:      accept,
		OptionalEnds:  terminated.AddDate(r.OfferYears, 0, 0),
	}
}

// Tail(ny, 2026-03-01, 2026-03-20): automatic to 2026-04-30, notice by 2026-03-31,
// accept by 2026-04-30, optional tail to 2029-03-01.
```

```rust tab="Rust"
use chrono::{Days, Months, NaiveDate};

pub struct TailRule {
    pub automatic_days: u64,   // 60, or 90 for public entity liability
    pub notice_days: u64,      // insurer must notify within this many days of termination
    pub accept_from_end: u64,  // insured may accept within this many days of termination...
    pub accept_from_mail: u64, // ...or this many days of the notice, whichever is later
    pub offer_years: u32,      // 3, or 1 for D&O, EPL, fiduciary and the other listed lines
    pub citation: &'static str, // "11 NYCRR 73.3(d)-(g)"
}

pub struct TailDates {
    pub automatic_ends: NaiveDate,
    pub notice_due: NaiveDate,
    pub accept_by: NaiveDate,
    pub optional_ends: NaiveDate,
}

pub fn tail(r: &TailRule, terminated: NaiveDate, notice_mailed: NaiveDate) -> TailDates {
    let accept_by = (terminated + Days::new(r.accept_from_end))
        .max(notice_mailed + Days::new(r.accept_from_mail));
    TailDates {
        automatic_ends: terminated + Days::new(r.automatic_days),
        notice_due: terminated + Days::new(r.notice_days),
        accept_by,
        optional_ends: terminated + Months::new(12 * r.offer_years),
    }
}

// tail(&ny, 2026-03-01, 2026-03-20): automatic to 2026-04-30, notice by 2026-03-31,
// accept by 2026-04-30, optional tail to 2029-03-01.
```

### Notice of Circumstances

Most claims-made forms let the insured report, during the policy period, circumstances that may give rise to a claim; a later claim arising from them is treated as made when the circumstance was reported. A notice of circumstances is a claim record without a claimant yet, and it must lock the policy term it was reported under, because the claim that follows may arrive years later, after the insurer has changed.

### Related Claims and the Single Limit

Claims arising from the same or related wrongful acts are usually deemed a single claim made when the first was made, under one policy's limit and one retention. A securities class action and the derivative suits that follow it, or several clients' suits over one flawed product, land on one term. The claims system needs a relationship between claims that carries the deemed claim-made date and the responding term, rather than letting each new suit open a new term's limit.

## Defense Within Limits

In CGL, defense costs are paid in addition to the limit. In most professional and management liability, defense costs reduce the limit ("defense within limits," "eroding" or "burning" limits): a $1 million policy with $400,000 spent on lawyers has $600,000 left for a settlement. States regulate this. New York's Regulation 107 (11 NYCRR Part 71) forbids policies that reduce stated limits by legal defense costs except as the Part allows, and bars it entirely for motor vehicle liability, medical malpractice other than hospital coverage, and risks under its personal lines cancellation law. Section 71.3 allows the offset only for listed risks with minimum limits:

| Risk | Minimum per-occurrence limit for defense within limits |
| --- | --- |
| Employee benefit, fiduciary, employment practices liability | $100,000 |
| Environmental impairment and pollution, D&O, media and advertising, architects and engineers, E&O, professional liability other than medical malpractice | $500,000 |
| Hospital medical malpractice (renewals with approved offset provisions only) | $1,000,000 |

Unless the insured controls the defense, defense costs charged against the limit may not exceed 50% of it, and the insurer pays defense beyond that; the cap may be dropped when the insured can choose or consent to counsel, take part in the defense and consent to settlements. Large commercial insureds and programs above set thresholds (primary limits of at least $5 million per occurrence, or a retention of at least $100,000) are outside the general rule.

For the system, defense within limits makes every DCC payment a limit event. The available limit on an exposure is the limit minus indemnity paid minus DCC paid (and, for reserving, minus reserves on both), and the 50% cap is a separate counter. A claim that crosses the cap switches DCC from eroding to non-eroding, and the payment records must show which.

## Pricing and Underwriting

Claims-made rates step up with the maturity of the claims-made relationship: a first-year policy covers only claims from acts in the past year, a fifth-year policy covers five years of acts, so first-year premium is a fraction of mature premium and rises for several years. The rating algorithm reads the retro date to compute the policy's year of maturity, which is one reason the retro date is a rating input stored on the coverage, not only a policy condition.

Underwriting reads the applicant's services and revenue by service type, contracts and client mix, claims history and the insured's own risk controls; for D&O, financial statements, securities activity, ownership and governance; for EPLI, headcount by state, turnover, HR practices and prior charges. The application carries a warranty about known circumstances, and its answers become the evidence for the prior knowledge exclusion. Keep the application as signed, by version, for the life of the relationship.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): claims-made coverages carry dates the trigger needs, and claims carry the dates and relationships that decide which term answers.

```sql
CREATE TABLE claims_made_terms (           -- the trigger data for a claims-made coverage
  coverage_id        UUID PRIMARY KEY REFERENCES coverages (id),
  retro_date         DATE,                  -- null means full prior acts
  relationship_start DATE NOT NULL,         -- first claims-made policy with this insurer
  reporting_window_days INT NOT NULL DEFAULT 0,  -- claims-made-and-reported grace after expiry
  defense_within_limits BOOLEAN NOT NULL,
  dwl_cap_pct        NUMERIC(5, 2),         -- 50.00 under 11 NYCRR 71.3 unless waived
  maturity_year      INT NOT NULL,          -- rating input derived from retro_date
  prior_acts_from_carrier TEXT              -- nose: the prior insurer whose retro date is honored
);

CREATE TABLE extended_reporting_periods (  -- automatic and purchased tails
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  kind               TEXT NOT NULL CHECK (kind IN ('automatic', 'optional')),
  starts_on          DATE NOT NULL,         -- the termination date
  ends_on            DATE,                  -- null for unlimited
  premium_transaction_id UUID REFERENCES policy_transactions (id),
  separate_aggregate BIGINT,                -- when the tail has its own limit
  notice_id          UUID,                  -- notices: the offer letter and its deadline
  accept_by          DATE,
  accepted_at        TIMESTAMPTZ,
  rule_ref           TEXT NOT NULL          -- '11 NYCRR 73.3(d)', '11 NYCRR 73.3(f)'
);

ALTER TABLE claims
  ADD COLUMN first_made_at     TIMESTAMPTZ,  -- when the claim was first made against the insured
  ADD COLUMN wrongful_act_from DATE,         -- earliest alleged act, against the retro date
  ADD COLUMN kind              TEXT NOT NULL DEFAULT 'claim',
  ADD COLUMN related_to_id     UUID REFERENCES claims (id),  -- deemed a single claim
  ADD COLUMN deemed_made_at    TIMESTAMPTZ,  -- inherited from the first related claim
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT claims_kind_check CHECK (kind IN ('claim', 'circumstance')) NOT VALID;
```

Which term answers a claim is a query, not a judgment typed into a field:

```sql
SELECT pt.id AS term_id, cmt.retro_date, erp.kind AS via_tail
FROM claims c
JOIN policy_terms pt ON pt.policy_id = :policy_id
JOIN policy_versions pv ON pv.policy_term_id = pt.id
  AND pv.effective @> pt.effective_at AND upper_inf(pv.recorded)
JOIN coverages cv ON cv.policy_version_id = pv.id AND cv.code = :coverage_code
JOIN claims_made_terms cmt ON cmt.coverage_id = cv.id
LEFT JOIN extended_reporting_periods erp ON erp.policy_term_id = pt.id
  AND COALESCE(c.deemed_made_at, c.first_made_at)::date >= erp.starts_on
  AND (erp.ends_on IS NULL OR COALESCE(c.deemed_made_at, c.first_made_at)::date < erp.ends_on)
  AND (erp.kind = 'automatic' OR erp.accepted_at IS NOT NULL)
WHERE c.id = :claim_id
  AND (cmt.retro_date IS NULL OR c.wrongful_act_from >= cmt.retro_date)
  AND c.wrongful_act_from < pt.expires_at::date
  AND (COALESCE(c.deemed_made_at, c.first_made_at) <@ tstzrange(pt.effective_at, pt.expires_at)
       OR erp.id IS NOT NULL);
```

Design notes:

- **Carry the retro date forward by rule.** A renewal copies the retro date from the expiring coverage; changing it is a separate, referred transaction with the insured's signed agreement, and the system refuses it inside a New York claims-made relationship.
- **Tails are terms of coverage, not endorsements on a dead policy.** An extended reporting period is a row tied to the last term, with its own premium transaction and, when the form gives one, its own aggregate.
- **The termination starts clocks.** Nonrenewal, cancellation and a renewal with an advanced retro date or a reduced limit all write the automatic tail and the notice task with its deadline from the rule.
- **Limits erode by payment type.** The available limit is derived from payments by cost type and the defense-within-limits flag and cap; a DCC payment that would breach the cap is split into an eroding and a non-eroding part.

## Auditing

- **Retro date lineage.** For every claims-made coverage, its retro date on every term of the relationship, and any change with the insured's agreement.
- **Tail notices and elections.** The automatic tail written at every termination, the notice with its mailing date against the 30-day rule, the offer terms and premium basis, and the insured's acceptance or silence.
- **Claim dates.** For every claim and circumstance: the alleged act dates, when it was first made, when reported, related claims and the deemed date, so the coverage decision can be replayed.
- **Defense spending against the limit.** Every DCC payment with its eroding or non-eroding treatment and the running limit.

## What This Means for the System You Build

- **Store the retro date, the relationship start and the reporting window on every claims-made coverage,** and carry them forward on renewal.
- **Decide coverage from dates by query:** act after the retro date, claim first made in the term or a valid tail, reported in the window.
- **Write the automatic tail and its notice task on every termination,** with deadlines computed from the state's rule.
- **Model tails as rows with their own premium and limits,** tied to the last term.
- **Link related claims** so they share one term, one limit and one retention.
- **Erode limits by DCC where defense is within limits,** enforcing the state's minimum limits and any cap.

## References

**Law and regulation**

- [11 NYCRR 73.1](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-73.1), New York Regulation 121 definitions: retroactive date, extended reporting period coverage ("tail") and the claims-made relationship
- [11 NYCRR 73.3](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-73.3), the fixed retroactive date, the 60-day (90 for public entities) automatic tail, the 30-day notice, the acceptance window, the three-year and one-year tail offers and their premium basis
- [11 NYCRR 71.2](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-71.2), New York Regulation 107's prohibition on reducing limits by defense costs except as permitted, and the lines where it is barred
- [11 NYCRR 71.3](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-71.3), the risks and minimum limits for defense within limits, the 50% cap and the large-insured thresholds

**Filings**

- [RLI Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/84246/000110465926018013/rli-20251231x10k.htm), net premiums earned in professional services and executive products
- [Skyward Specialty: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1519449/000151944926000015/skwd-20251231.htm), the Professional Lines division and the admitted and non-admitted split
- [Kinsale Capital Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1669162/000166916226000015/knsl-20251231.htm), an E&S writer with no delegated authority

**In practice**

- [IRMI: Side A coverage](https://www.irmi.com/term/insurance-definitions/side-a-coverage), direct coverage of directors and officers for loss the organization doesn't indemnify
- [IRMI: Basic extended reporting period](https://www.irmi.com/term/insurance-definitions/basic-extended-reporting-period), the automatic tail in ISO's claims-made CGL and the 30 to 60 days typical in professional liability
- [ERGO NEXT: ERGO finalizes the full acquisition of NEXT Insurance](https://www.nextinsurance.com/blog/ergo-successfully-finalizes-the-full-acquisition-of-next-insurance/), small business professional liability, E&O and EPLI sold online and through agents
