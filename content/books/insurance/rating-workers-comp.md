+++
title = "Rating Workers' Comp & Premium Audit"
nav_title = "Rating Workers' Comp"
description = "Class codes and payroll, the premium algorithm, NCCI's experience mod worked with its primary/excess split, schedule rating, audit, pay-as-you-go, retro."
category = "Insurance Industry"
order = 2755
part = "Workers' Compensation"
tags = ["insurance", "workers-compensation", "experience-rating", "premium-audit", "rating", "class-codes"]
+++

Workers' compensation premium is a formula with public parts. The exposure is payroll, in hundreds of dollars, by classification code; the rate per $100 comes from the insurer's filing on the bureau's loss costs (or from the state, in administered pricing states); the experience modification comes from the bureau, computed from the employer's own payroll and losses for prior years under a plan every insurer in the state uses; schedule rating and other filed adjustments follow; and the premium at inception is an estimate, replaced after the policy ends by an audit of the payroll actually paid. Employers Holdings' 10-K describes the core in one sentence: the rate is applied to each class of the insured's payroll, and the result is adjusted by an experience modification factor, a schedule rating adjustment and other adjustments where applicable; it audits "substantially all" policyholders annually at expiration.

For the system, that means three calculations with different owners and clocks. The rating engine applies the filed algorithm. The mod is received from the bureau, computed on data the insurer itself reported eighteen months or more earlier. And the audit is a transaction after expiry that can move premium a long way in either direction. This chapter covers classifications and payroll, the premium algorithm with a worked example, NCCI's experience rating formula worked with its primary and excess split, schedule rating, premium audit with a worked adjustment, pay-as-you-go, and retrospective and deductible plans. It extends `risks` and `policy_transactions` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `experience_mods` and `premium_audits`. How payroll is computed and what counts as wages is the Workforce volume's ([Gross to Net](/books/workforce/gross-to-net)); this chapter is what the insurer does with it.

## How the Platforms Do It

As of November 2026:

| Party | Role in the price | What the public record says |
| --- | --- | --- |
| **NCCI** | Experience rating plan and mods in most states | The plan is approved in 39 jurisdictions; mods are mandatory for eligible employers and computed by NCCI from unit statistical data |
| **Independent bureaus** | Their own plans | NCCI's plan doesn't apply in California, Delaware, Michigan, New Jersey, New York or Pennsylvania; Indiana, Massachusetts and North Carolina bureaus produce intrastate mods under it |
| **Employers Holdings** | Insurer | Rate times payroll by class, adjusted by experience mod and schedule rating; substantially all policies audited annually; administered pricing states set rates |
| **ADP Pay-by-Pay** | Pay-as-you-go | Premiums "calculated and forwarded directly" to the carrier from each payroll run, through participating carriers with ADP's agency as agent of record |

## Classifications and Payroll

The bureau's classification manual assigns each employer a **governing classification** describing its business (a four-digit code in NCCI states), with standard exceptions for clerical office employees and outside salespeople where their duties qualify, and, in limited cases, additional classifications for operations that are separate businesses. The class is the business's, not the job title's: a bakery's drivers are usually in the bakery's class. A misclassification is the most expensive error in the line, because rates per $100 of payroll range from cents for clerical work to tens of dollars for roofing.

Payroll is the exposure, in units of $100. What counts as payroll for premium is a bureau rule, not the payroll tax definition, and the bureaus differ. Pennsylvania's manual is one I could open: "Remuneration means money or substitutes for money," it includes "Extra pay for overtime work," it excludes expense reimbursements only to the extent the employer's records substantiate them as business expenses, and it caps the payroll of executive officers, sole proprietors, partners and LLC members at an "applicable weekly limitation" where the classification notes call for one ([PCRB Workers Compensation Manual, Rule V](https://pcrb.com/manuals/workers-compensation-manual/section-1-underwriting-rules/rule-v-premium-basis/)). Other bureaus are reported to exclude the premium portion of overtime pay (which payroll computes from the [regular rate](/books/workforce/overtime-and-the-regular-rate)) and to set dollar minimums and maximums for officers; I couldn't open those rules, so I give no amounts. <!-- source-gap: wc-payroll-rules | missing | the NCCI Basic Manual remuneration rules (overtime premium exclusion, executive officer minimum and maximum payroll, per diem) | closes with: the NCCI Basic Manual rule or another state bureau manual opened | checked: 2026-11-10 --> For the system, the payroll feed from payroll software must carry wages by employee, class, state and pay type so that the premium base can be computed from it under the bureau's rules; the Workforce volume owns the payroll records themselves.

## The Premium Algorithm

The order, from manual premium to the amount billed, in NCCI states:

1. **Manual premium:** payroll ÷ 100 × rate, per class and state.
2. **Experience modification:** manual premium × mod, for the classes subject to it.
3. **Schedule rating** where the state allows it, within the filed plan's range.
4. **Premium discount** for larger standard premiums, from the filed table, and an **expense constant** per policy.
5. **Other charges:** terrorism and catastrophe loadings, and state assessments and surcharges, some of which are collected for the state rather than earned.

The steps after the mod differ by state and insurer filing, so the order is configuration from the filing, not code. NCCI's guide gives the first two steps for a roofing company:

| Classification | Payroll | Payroll ÷ 100 | Rate per $100 | Premium |
| --- | --- | --- | --- | --- |
| Clerical | $70,000 | 700 | $0.750 | $525 |
| Roofer | $200,000 | 2,000 | $63.171 | $126,342 |
| Total | | | | $126,867 |
| Mod 1.25 | | | | $158,584 |

Continuing with filed values that are mine and illustrative (a 5% schedule credit, a premium discount of 9.1% on standard premium above $10,000, a $160 expense constant and a terrorism charge of $0.02 per $100 of payroll):

| Step | Computation | Amount |
| --- | --- | --- |
| Modified premium | | $158,584.00 |
| Schedule rating, −5% | × 0.95 | $150,654.80 |
| Standard premium | | $150,654.80 |
| Premium discount on the part above $10,000 | ($150,654.80 − $10,000) × 9.1% | −$12,799.59 |
| Expense constant | | $160.00 |
| Terrorism, 2,700 hundreds of payroll × $0.02 | | $54.00 |
| Estimated annual premium | | $138,069.21 |

Every row is a stored rating step with the table version it read. The mod row cites the bureau's mod record by its rating effective date; the schedule row cites the underwriter's `rating_modifications` row and its justification ([The Commercial Lines Map](/books/insurance/commercial-lines#how-commercial-rating-differs)).

## The Experience Mod

NCCI's experience rating plan compares an employer's actual losses to the losses expected for its classes and payroll, and produces a factor around 1.00: 0.75 means 25% better than average for its classes and size, 1.25 means 25% worse. The plan is mandatory: "if an employer meets the eligibility requirements, then experience rating is mandatory."

**Eligibility.** An employer qualifies if its premium subject to experience rating meets a state's eligibility point, in one of two ways: enough in the most recent 24 months, or the threshold on average over the whole experience period. NCCI's example uses a state requiring $14,000 in the most recent two years or an average of $7,000.

**Experience period.** Policies effective "no less than 21 months before the rating effective date and no more than 57 months before" are used. For a January 1, 2026 rating date, that is policies effective from April 1, 2021 to April 1, 2024, usually three policy years; the expiring policy isn't used because the mod is computed 60 to 90 days before the rating date and insurers don't report a policy's data until 18 months after inception.

**Expected losses.** For each class, the expected loss rate (ELR) is "the amount of expected losses for the classification for each $100 of payroll"; expected losses are ELR × payroll ÷ 100. The discount ratio (D-ratio) is the share of expected losses expected to be primary, so expected primary losses are expected losses × D-ratio. NCCI's worksheet example: an ELR of 1.413 on payroll of $3,125,350 gives $44,161 of expected losses, and a D-ratio of 0.41 gives $18,106 of expected primary losses.

**Primary and excess.** Each claim's actual incurred loss is split at the state's split point: the first dollars up to the split point are primary, the rest excess. Primary losses (frequency) weigh more in the formula than excess losses (severity). The split point was a countrywide $18,500; NCCI Item E-1409 moved states to state-specific split points that target an average D-ratio of about 40% and are indexed with each state's annual filing, with an illustration of $25,000 in a high-severity state and $15,000 in a low one. North Carolina, for example, proposed a split point of $25,000 effective April 1, 2024.

**Limits and reductions.** Each claim is capped at the state per-claim accident limitation (SAL), which E-1409 resets to the state's 95th percentile of lost-time claims (NCCI's guide shows a $500,000 claim entering at a $200,000 cap); a multiple-claim accident is capped at twice the SAL. Medical-only claims enter at 30%: "medical-only claims are reduced by 70%," the experience rating adjustment (ERA).

**The formula.** With actual primary and excess losses Ap and Ae, expected primary, excess and total losses Ep, Ee and E, a weight W applied to excess losses and a ballast B:

M = (Ap + W × Ae + (1 − W) × Ee + B) ÷ (E + B)

W is "a small percentage for small employers" that grows with size, so a small employer's excess losses barely count and a large employer's count nearly in full; the ballast, which "increases as expected losses increase," stabilizes the mod so one loss can't swing it too far. Both come from state tables keyed by expected losses. NCCI's own worked example checks the formula: actual losses $163,740 (primary $88,100, excess $75,640), expected $197,071 (primary $81,573, excess $115,498), W = 0.16 and B = $45,900 give (88,100 + 0.16 × 75,640 + 0.84 × 115,498 + 45,900) ÷ (197,071 + 45,900) = 243,120 ÷ 242,971 = 1.00.

### A Worked Mod

The employer's figures are mine; the method and the $25,000 North Carolina split point are the plan's. A contractor's experience period shows expected losses of $60,000 with a D-ratio of 0.40 (expected primary $24,000, expected excess $36,000), and state tables give W = 0.20 and B = $30,000 at that size. Three claims:

| Claim | Incurred | Ratable (after ERA) | Primary (split at $25,000) | Excess |
| --- | --- | --- | --- | --- |
| Lost-time fall | $80,000 | $80,000 | $25,000 | $55,000 |
| Lost-time strain | $12,000 | $12,000 | $12,000 | $0 |
| Medical-only cut | $5,000 | $1,500 (30%) | $1,500 | $0 |
| Total | $97,000 | $93,500 | $38,500 | $55,000 |

| Term | Value |
| --- | --- |
| Ap | $38,500 |
| W × Ae | 0.20 × $55,000 = $11,000 |
| (1 − W) × Ee | 0.80 × $36,000 = $28,800 |
| B | $30,000 |
| Numerator | $108,300 |
| E + B | $60,000 + $30,000 = $90,000 |
| Mod | 1.2033, published as 1.20 |

The fall, at $80,000, contributes $25,000 fully and $55,000 at 20%: $36,000 to the numerator. Had it been eight $10,000 claims instead, all $80,000 would be primary and the mod would be (93,500 + 0 + 28,800 + 30,000) ÷ 90,000 = 1.69. That is the plan's design: frequency predicts future losses better than one large claim does.

```go tab="Go"
type Claim struct {
	Incurred    decimal.Decimal
	MedicalOnly bool
}

type ModInputs struct {
	Claims             []Claim
	Expected, DRatio   decimal.Decimal // total expected losses and the D-ratio
	SplitPoint, SAL    decimal.Decimal // state values for the rating date
	W, B               decimal.Decimal // from the state tables at this expected loss size
}

var (
	era = decimal.RequireFromString("0.30")
	one = decimal.NewFromInt(1)
)

func Mod(in ModInputs) decimal.Decimal {
	var ap, ae decimal.Decimal
	for _, c := range in.Claims {
		loss := decimal.Min(c.Incurred, in.SAL)
		if c.MedicalOnly {
			loss = loss.Mul(era)
		}
		p := decimal.Min(loss, in.SplitPoint)
		ap, ae = ap.Add(p), ae.Add(loss.Sub(p))
	}
	ee := in.Expected.Sub(in.Expected.Mul(in.DRatio))
	num := ap.Add(in.W.Mul(ae)).Add(one.Sub(in.W).Mul(ee)).Add(in.B)
	return num.Div(in.Expected.Add(in.B)).Round(2)
}

// The worked mod: 108300 / 90000 = 1.2033, rounded to 1.20.
```

```rust tab="Rust"
use rust_decimal::{Decimal, RoundingStrategy};
use rust_decimal_macros::dec;

pub struct Claim {
    pub incurred: Decimal,
    pub medical_only: bool,
}

pub struct ModInputs {
    pub claims: Vec<Claim>,
    pub expected: Decimal,    // total expected losses
    pub d_ratio: Decimal,
    pub split_point: Decimal, // state values for the rating date
    pub sal: Decimal,
    pub w: Decimal,           // from the state tables at this expected loss size
    pub b: Decimal,
}

pub fn modification(i: &ModInputs) -> Decimal {
    let (mut ap, mut ae) = (Decimal::ZERO, Decimal::ZERO);
    for c in &i.claims {
        let mut loss = c.incurred.min(i.sal);
        if c.medical_only {
            loss *= dec!(0.30);
        }
        let p = loss.min(i.split_point);
        ap += p;
        ae += loss - p;
    }
    let ee = i.expected - i.expected * i.d_ratio;
    let num = ap + i.w * ae + (Decimal::ONE - i.w) * ee + i.b;
    (num / (i.expected + i.b)).round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero)
}

// The worked mod: 108300 / 90000 = 1.2033, rounded to 1.20.
```

The insurer doesn't compute mods for production; it receives them. But it computes them anyway, to check the bureau's worksheet, to estimate next year's mod for renewal pricing, and to answer the employer's question about what a claim will cost them.

### Mod Status and Ownership Changes

A mod has a status: **preliminary** when the state's final rating values for the period aren't approved yet, **final** when they are, and **contingent** when the bureau expected audited payroll or losses it hadn't received; a revised mod replaces the earlier one and the premium is recalculated, sometimes after the policy has expired. Each published mod has a rating effective date (usually the policy's anniversary) and applies for a year. Ownership changes (a merger, a sale of the business, a change of legal entity) can transfer the experience to the new entity or not, under the plan's ownership rules, reported on a bureau form; until the bureau rules, the mod on the policy may be wrong.

For the system: mods are received records with status and version, applied to policies by rating effective date, and every revision produces an endorsement or audit adjustment with the premium difference.

## Schedule Rating

Most competitive states allow insurers to file a schedule rating plan for workers' compensation, crediting or debiting an employer for characteristics the mod doesn't capture (safety programs, management cooperation, premises, employee selection and training), within a filed maximum. Employers Holdings describes schedule rating as an adjustment within limits set by its filings. The engine applies it after the mod; the underwriter's choices and reasons are stored as for any commercial schedule plan. The limits are state rules: Pennsylvania's bureau plan allows at most a 25% credit or a 25% debit, applied after the experience modification and before premium discount, on any risk at the carrier's option ([PCRB Schedule Rating Plan](https://pcrb.com/manuals/workers-compensation-manual/section-5-experience-rating-plan/section-vii-schedule-rating-plan/)), and Minnesota caps the debit at "no more than 25 percent of manual premium, after application of any experience modification" ([Minn. R. 2705.3000](https://www.revisor.mn.gov/rules/2705.3000/)). The maximum is a per-state value with its citation, not a constant.

## Premium Audit

The premium at inception is a deposit on estimated payroll. After the policy expires or is cancelled, the insurer audits the payroll actually paid, by class and state, and bills or refunds the difference. Audits are physical (an auditor visits and reviews payroll records, tax filings and the general ledger), virtual, or by mail (the employer completes a payroll report); the method depends on premium size and class. Employers Holdings audits substantially all policyholders at expiration or termination; California requires an annual payroll audit, including an in-person visit to verify the employee count, for every workers' compensation policy issued to a roofing contractor (C-39 license), with a surcharge allowed to recover the audit's cost (Ins. Code 11665).

What auditors find: payroll different from the estimate (growth or decline), payroll in the wrong class, classes the employer never reported, uninsured subcontractors (whose payroll the employer's policy picks up unless the sub had its own coverage, which is why auditors ask for subcontractors' certificates), and executive officers' and owners' payroll under the inclusion and exclusion rules.

### A Worked Audit Adjustment

Continuing the roofing company, with the same rates, mod and filed values (mine):

| Class | Estimated payroll | Audited payroll | Rate | Estimated premium | Audited premium |
| --- | --- | --- | --- | --- | --- |
| Clerical | $70,000 | $82,000 | $0.750 | $525.00 | $615.00 |
| Roofer | $200,000 | $246,000 | $63.171 | $126,342.00 | $155,400.66 |
| Uninsured subcontractor (roofer) | $0 | $38,000 | $63.171 | $0.00 | $24,004.98 |
| Manual premium | | | | $126,867.00 | $180,020.64 |

The audited manual premium runs through the same algorithm: × 1.25 mod = $225,025.80; × 0.95 schedule = $213,774.51 standard premium; premium discount ($213,774.51 − $10,000) × 9.1% = −$18,543.48; expense constant $160.00; terrorism on 3,660 hundreds of payroll = $73.20. Final premium $195,464.23, against the $138,069.21 deposit: an additional premium of $57,395.02, billed on the audit transaction. If the policy had a premium discount table with several bands, the larger premium would have moved into a higher band, which is why the audit reruns the algorithm rather than prorating the deposit.

An audit is a `policy_transactions` row of kind `audit`, effective at the term's start, processed months after expiry, with written premium equal to the difference, its own rating worksheet, and premium entries that earn immediately because the term is over. Audits are disputed often, so the transaction also carries the audit's documents, the employer's signoff or dispute, and any revision.

## Pay-As-You-Go

Pay-as-you-go computes premium from each payroll run instead of an annual estimate. ADP's Pay-by-Pay calculates premium from actual payroll each run and forwards it to the carrier, "may be able to eliminate the upfront deposit," and aims to "minimize your over or underpayments at year-end audit"; carriers may accept its report for the audit but can still audit in depth, and it works only with participating carriers, with ADP's agency as agent of record. In Ohio, where the state fund is the only insurer, the premium goes to the Ohio Bureau of Workers' Compensation.

For the system, pay-as-you-go turns one installment schedule into a stream of payroll reports: each report carries payroll by class and state for a period, is rated at the policy's rates and mod, and produces an invoice line; the audit compares the sum of reports to the audited payroll. The rating is the same algorithm, run per period with the premium discount and expense constant handled once at the policy level.

## Retrospective Rating and Deductible Plans

Larger employers can share the loss outcome of the policy year itself. Under a **retrospective rating plan**, the premium is recomputed after the year from the year's own losses: a basic premium for expenses and insurance charges, plus incurred losses (often limited per claim) multiplied by a loss conversion factor for claims handling, multiplied by a tax multiplier, bounded by a minimum and a maximum premium chosen at inception. Adjustments repeat at set evaluation dates until the parties close the plan, so a policy's premium can change for years after it expires. <!-- source-gap: wc-retro-formula | missing | the NCCI Retrospective Rating Plan formula and its components (basic premium, loss conversion factor, tax multiplier, minimum and maximum, adjustment timing) | closes with: the NCCI Retrospective Rating Plan Manual or a state-approved plan opened | checked: 2026-11-10 --> I couldn't open NCCI's plan manual, so the structure here is the plan's general shape without filed factors. Pennsylvania shows why the factors live with each carrier: there "a carrier must file with the Pennsylvania Insurance Department such plan rules and rating values as necessary to implement retrospective rating plans," and the bureau's manual publishes only selected rating values, which a carrier's own filed values supersede ([PCRB Workers Compensation Manual, Section 4](https://pcrb.com/manuals/workers-compensation-manual/section-4-retrospective-rating-plan/)).

Under a **large deductible plan**, the policy is standard and the insurer pays every claim, but the employer reimburses each claim up to a per-occurrence deductible, against collateral (letters of credit, trusts). The Workforce volume shows the PEO version: ADP's deductible layer of up to $1 million per occurrence and TriNet's $1 million per claim ([Revenue Models](/books/workforce/revenue-models)). The insurer remains liable to the injured worker if the employer can't reimburse, so the credit risk on the deductible receivable and the collateral is the insurer's.

For the system, both are claim-driven premium or receivables: retro adjustments are transactions computed from loss evaluations at set dates, and deductible reimbursements are `recoveries` billed from claim payments, aged and matched to collateral.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). Class exposures are `risks` of kind `class_exposure`; mods are received records applied by date; audits are transactions with their own details; pay-as-you-go reports are periodic exposure filings.

```sql
CREATE TABLE experience_mods (             -- as published by the bureau, every revision
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_party_id  UUID NOT NULL REFERENCES parties (id),
  bureau             TEXT NOT NULL,         -- 'NCCI', 'WCIRB', 'NCRB', ...
  bureau_risk_id     TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('intrastate', 'interstate')),
  states             TEXT[] NOT NULL,
  rating_effective   DATE NOT NULL,
  factor             NUMERIC(5, 2) NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('preliminary', 'final', 'contingent')),
  revision           INT NOT NULL,
  split_point        BIGINT,                -- worksheet values, for checking
  expected_losses    BIGINT,
  actual_primary     BIGINT,
  actual_excess      BIGINT,
  weight             NUMERIC(5, 4),
  ballast            BIGINT,
  worksheet_doc_id   UUID,
  received_at        TIMESTAMPTZ NOT NULL,
  UNIQUE (bureau, bureau_risk_id, rating_effective, revision)
);

CREATE TABLE premium_audits (              -- one audit of one policy term
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  method             TEXT NOT NULL CHECK (method IN ('physical', 'virtual', 'voluntary',
                       'payroll_service_report', 'estimated_noncompliance')),
  rule_ref           TEXT,                  -- 'Cal. Ins. Code 11665' for C-39 roofers
  ordered_at         TIMESTAMPTZ NOT NULL,
  completed_at       TIMESTAMPTZ,
  auditor_id         UUID,
  transaction_id     UUID REFERENCES policy_transactions (id),  -- kind 'audit'
  status             TEXT NOT NULL CHECK (status IN ('ordered', 'in_progress', 'completed',
                       'disputed', 'revised')),
  revises_id         UUID REFERENCES premium_audits (id),
  document_ids       UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE audit_exposures (             -- audited payroll by state and class
  premium_audit_id   UUID NOT NULL REFERENCES premium_audits (id),
  state              TEXT NOT NULL,
  class_code         TEXT NOT NULL,
  estimated_payroll  BIGINT NOT NULL,       -- from the policy's class exposure
  audited_payroll    BIGINT NOT NULL,
  source             TEXT NOT NULL CHECK (source IN ('payroll_records', 'tax_filings',
                       'uninsured_subcontractor', 'officer_rule')),
  PRIMARY KEY (premium_audit_id, state, class_code, source)
);

CREATE TABLE payroll_reports (             -- pay-as-you-go: one per payroll run
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  period_start       DATE NOT NULL,
  period_end         DATE NOT NULL,
  reporter           TEXT NOT NULL,         -- the payroll provider or PEO
  lines              JSONB NOT NULL,        -- [{"state","class_code","payroll"}]
  premium            BIGINT NOT NULL,       -- rated at the policy's rates and mod
  invoice_id         UUID,                  -- invoices (Billing & Premium Finance)
  received_at        TIMESTAMPTZ NOT NULL,
  idempotency_key    TEXT NOT NULL UNIQUE   -- provider's run id: a resent run is not new premium
);
```

The mod applied to a policy on a date is the latest revision of the mod whose rating effective date covers it:

```sql
SELECT DISTINCT ON (em.bureau_risk_id) em.factor, em.status, em.revision
FROM experience_mods em
WHERE em.employer_party_id = :employer
  AND :state = ANY (em.states)
  AND em.rating_effective <= :as_of
  AND em.rating_effective > :as_of - INTERVAL '1 year'
ORDER BY em.bureau_risk_id, em.rating_effective DESC, em.revision DESC;
```

Design notes:

- **The mod is received, versioned and applied by date.** A revision creates an endorsement (in term) or an audit adjustment (after expiry) with the premium difference; nothing edits the old rating.
- **The audit reruns the algorithm.** Audited exposures replace estimates and the full worksheet is recomputed, so premium discount bands, minimums and per-policy charges come out right.
- **Pay-as-you-go reports are idempotent.** The provider's run identifier is the key, so a resent file doesn't bill twice, and voids and corrections from payroll arrive as negative lines.
- **Unit statistical reporting comes from the same records.** The bureau's unit report of payroll and losses by class is a query over audited exposures and claims, filed on the bureau's schedule, and it becomes next year's mod.

## Auditing

- **Every mod received,** with status, revision and worksheet values, and every premium change it caused.
- **Every audit:** method, auditor, the records reviewed, audited payroll by state and class with its source, the rerated worksheet, the employer's acceptance or dispute, and revisions.
- **Classification decisions:** the evidence for each class assignment and every reclassification at audit with its premium effect.
- **Pay-as-you-go reconciliation:** the sum of payroll reports against audited payroll for each term.

## What This Means for the System You Build

- **Rate workers' compensation as a filed sequence:** manual premium, mod, schedule, discount, constants and charges, in the state's and filing's order.
- **Store mods as bureau records with status and revision,** applied by rating effective date, and recompute premium on every revision.
- **Compute mods yourself to check and forecast them,** with the state's split point, SAL, ERA, W and B by rating date.
- **Make the audit a transaction that reruns the whole worksheet** on audited exposures, with its documents and disputes.
- **Take pay-as-you-go payroll reports idempotently** and reconcile them to the audit.
- **Treat retro adjustments and deductible reimbursements as claim-driven money** with their own schedules and collateral.

## References

**Law and regulation**

- [Cal. Ins. Code 11665 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-11665/), the annual payroll audit with an in-person visit for policies issued to C-39 roofing contractors, and the cost surcharge

**Standards**

- [NCCI: ABCs of Experience Rating (PDF)](https://www.ncci.com/Articles/Documents/UW_ABC_Exp_Rating.pdf), where the plan applies, eligibility, the experience period, ELR and D-ratio, primary and excess, the ERA, W and ballast, mod statuses, and the worked roofing premium and mod
- [North Carolina Rate Bureau: Circular C-23-3, NCCI Item E-1409, March 8, 2023 (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/workers%20comp/2023/C-23-3%20Enhancement%20to%20NCCIs%20Experience%20Rating%20Plan%20Methodology%20(NCCI%20Item%20E-1409).pdf), state-specific split points targeting a 40% D-ratio, the SAL at the 95th percentile, the multiple-claim limit, the formula's variables and North Carolina's $25,000 split point from April 1, 2024

**Filings**

- [Employers Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1379041/000137904126000011/eig-20251231.htm), the premium formula, annual audits of substantially all policyholders, and administered pricing states

**Vendor documentation**

- [ADP: Pay-by-Pay workers' compensation](https://www.adp.com/what-we-offer/benefits/business-insurance/workers-compensation/adp-pay-by-pay.aspx), premium computed from each payroll run, deposits, the year-end audit, participating carriers and Ohio
