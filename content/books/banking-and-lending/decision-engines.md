+++
title = "Underwriting & Decision Engines"
nav_title = "Decision Engines"
description = "How lenders decide: policy rules then models, Reg B scoring systems, DTI and ATR/QM, counteroffers, partner criteria, manual review and champion-challenger."
category = "Banking & Lending Industry"
order = 2444
part = "Origination and Underwriting"
tags = ["banking", "lending", "underwriting", "decision-engines", "atr-qm", "dti"]
+++

Underwriting answers three questions about every application: is this applicant eligible for this product at all, how likely are they to repay, and on what terms should the lender lend. Underwriters used to answer them with a file, a credit policy manual and judgment; most consumer credit is now decided by a **decision engine** that runs the lender's policy as rules, calls one or more models, applies a pricing grid and returns approve, counteroffer, decline or refer in under a second. Mortgages still pass through a human underwriter, but even there the first and often decisive call is to an agency's automated underwriting system. The engineering is in making that decision repeatable, explainable and testable: the same inputs must produce the same outcome under the same policy version, every outcome must carry its reasons, and a new model must be tried against the old one without breaking the law for the applicants who see it.

This chapter covers the shape of a decision (policy, then score, then price), Regulation B's view of scoring and judgmental systems, debt-to-income and residual income, ability to repay and the qualified mortgage rules, counteroffers, partner criteria in bank partnerships, manual review and overrides, automation rates, champion-challenger and shadow testing, and what to do when a data source is down. The data that feeds the engine is [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores); the notices that follow are [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action). Testing outcomes for discrimination is [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending), and validating the models is [Model Risk Management](/books/banking-and-lending/model-risk). The general pattern of rules beside models is the playbook's [Risk Scoring](/docs/architecture/risk-scoring); Payments' [Rules, Models and Decisions](/books/payments/fraud-and-risk#rules-models-and-decisions) applies it to fraud.

## How the Platforms Do It

As of October 2026, from agency guides, filings and vendor pages:

| Platform | Role | What it decides | Notes |
| --- | --- | --- | --- |
| **Fannie Mae DU** | GSE automated underwriting | Approve/Eligible, Approve/Ineligible, Refer with Caution, Out of Scope | No single factor decides; low-risk factors can offset high-risk ones; doesn't evaluate legal compliance; maximum DTI 50% |
| **Freddie Mac LPA** | GSE automated underwriting | Accept or Caution, with feedback on DTI, LTV and reserves | Shows what would turn a Caution into an Accept |
| **Upstart** | Lending marketplace for bank and credit union partners | Grades and prices personal, auto and HELOC loans | Partners set hard credit criteria and Upstart's models price inside them; the personal loan model grew from 23 variables in 2014 to more than 2,500 in 2025; 91% of 2025 loans fully automated |
| **Experian PowerCurve** | Decisioning platform | Strategies across the credit life cycle | Strategies "powered by scorecards, champion-challenger strategies and access to external modelling environments" |
| **Provenir** | Decisioning platform | Low-code decision flows with data and models | Strategy changes can be validated "against real production data before going live" |
| **Taktile** | Decisioning platform | Rules, models, agents and human review | "200+ integrations" for credit, KYC and fraud data; backtesting and A/B experiments; "versioning and sign-off procedures" |
| **Zest AI** | Machine-learning underwriting models for banks and credit unions | Risk scores delivered inside the LOS | Builds custom models from each client's data; a credit union customer reports 75% automated decisioning (customer-reported) |
| **MeridianLink DecisionLender** | Consumer LOS decision engine | Rules-based consumer loan decisions | Sold beside its consumer LOS |

Three patterns stand out. **Policy and model are separate layers everywhere:** the GSEs' systems sit inside lender overlays, Upstart's models sit inside its partners' hard criteria, and every platform sells rules and models side by side. **Automation is the headline metric:** the share of applications decided with no human touch is what lenders report and vendors sell. **Experimentation is a product feature:** champion-challenger, backtesting and A/B tests come built in, which makes testing on live applicants easy and its legal consequences easy to forget.

## Policy, Then Score, Then Price

A decision runs in stages, and the order matters for the reasons each stage can produce ([Stages and Ordered Rules](/docs/architecture/rules-as-data#stages-and-ordered-rules)):

1. **Eligibility and knockouts.** Hard rules a model can't override: the applicant's state is one the lender is licensed in and the product is offered in; the applicant is of age to contract; identity and fraud checks passed; the applicant is or isn't a covered borrower under the Military Lending Act (it changes the price ceiling); a minimum score or a maximum DTI the credit policy sets; no bankruptcy in the policy's lookback; the bank partner's criteria. A knockout produces a decline with a specific reason.
2. **Risk assessment.** One or more models produce a probability of default or a risk grade from bureau attributes, cash-flow attributes, application data and, for existing customers, account history.
3. **Affordability.** Debt-to-income or residual income on the proposed payment, and for mortgages the full ability-to-repay determination ([Ability to Repay and Qualified Mortgages](/books/banking-and-lending/mortgages#ability-to-repay-and-qualified-mortgages) has the product side).
4. **Pricing and terms.** The grade, term, amount and jurisdiction select a cell in a versioned pricing grid ([The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it)); the computed APR is checked against every rate cap that applies ([State Rate Caps as Data](/books/banking-and-lending/installment-loans#state-rate-caps-as-data)).
5. **Outcome.** Approve at the requested terms, counteroffer different terms, decline, or refer to a human.

Some knockouts belong to the lender, not the investor. Fannie Mae's Selling Guide now says "a minimum credit score is not required for DU loan casefiles" (the 620 floor came out in its November 5, 2025 update, SEL-2025-09), leaving DU's risk assessment to decide, while manually underwritten loans keep a 620 minimum for fixed-rate and 640 for adjustable-rate loans; lenders must still pull and deliver scores. A lender that keeps a 620 cutoff on DU loans is running its own overlay, and the rule should say so in its layer.

Running knockouts first is cheap (no paid data for applicants who can't qualify) and keeps reasons clean: a decline for state eligibility should never carry model-derived reasons. Within the model stage, reasons come from the model; within affordability, from the ratio that failed.

## Scoring and Judgmental Systems Under Reg B

Regulation B recognizes two kinds of system and treats them differently. An **empirically derived, demonstrably and statistically sound credit scoring system** evaluates creditworthiness mechanically, and must be based on data from an empirical comparison of creditworthy and non-creditworthy applicants who applied within a reasonable preceding period, developed for evaluating creditworthiness, developed and validated with accepted statistical principles, and "periodically revalidated" (12 CFR 1002.2(p)). Anything else is a **judgmental system** (1002.2(t)).

The difference shows up in a few places:

- **Age.** A qualifying scoring system may use age as a predictive variable, provided the age of an elderly applicant isn't assigned a negative value (1002.6(b)(2)).
- **Income.** A creditor may not discount income because it's from part-time work or retirement benefits, and must count alimony, child support or separate maintenance as income to the extent it's likely to be consistently made (1002.6(b)(5)). Nor may it consider whether income comes from a public assistance program (1002.6(b)(2)).
- **Reasons.** In a scoring system, reasons come only from scored factors; in a judgmental system, from factors the underwriter actually reviewed; in a combined system, from whichever part the applicant failed ([Building Reasons From Scorecards](/books/banking-and-lending/adverse-action#building-reasons-from-scorecards)).
- **Disparate impact.** Since July 21, 2026, Regulation B states that the Act doesn't adopt an effects test (91 FR 21620); the rule interprets ECOA only, so the Fair Housing Act and state fair lending laws (New York's regulator responded the same day) are separate questions, and a mortgage or a New York loan may still need its outcomes tested for disparate impact. [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending) covers the rule, its challenge and what testing remains.

Immigration status is one factor where guidance moved in 2026: a CFPB statement of June 8, 2026 (91 FR 34607, nonbinding) says Regulation B allows creditors to consider an applicant's immigration status, and that where a creditor relies on U.S. employment income it may, and in some circumstances must, consider whether that income will continue given the applicant's status. In policy terms that's an eligibility rule and an input to income stability, recorded like any other.

## Debt-to-Income and Residual Income

**Debt-to-income (DTI)** is total monthly debt obligations, including the proposed payment, divided by gross monthly income. It's the standard affordability measure, and each part has rules:

- **The payment** on the new loan, computed by the same schedule function that produces the disclosure; for a mortgage, principal, interest, taxes, insurance and any HOA dues; for an adjustable rate, the qualifying rate the rule requires.
- **Other debts** from the bureau file (minimum payments on revolving accounts, installment payments), plus obligations that aren't on it (alimony, child support), less debts being paid off at closing.
- **Income** stated, then verified: base pay, variable pay averaged over a history, self-employment from tax returns, and income from bank data where the product allows it ([Documents and Verification Services](/books/banking-and-lending/loan-origination#documents-and-verification-services)).

Fannie Mae's maximum total DTI is 50% for DU loans and 36% for manually underwritten loans, which can go to 45% with the credit score and reserves its eligibility matrix requires. **Residual income** asks the other question: after debts, how much is left each month to live on. It suits low incomes, where a 36% DTI can leave too little, and high ones, where 50% can leave plenty.

## Ability to Repay and the Qualified Mortgage

For most closed-end consumer mortgages, Regulation Z requires a reasonable, good-faith determination before consummation that the consumer can repay (12 CFR 1026.43(c)). The creditor must consider eight factors: current or reasonably expected income or assets (other than the dwelling); employment status, if it relies on employment income; the monthly payment on the loan; the payment on any simultaneous loan; mortgage-related obligations; current debts, alimony and child support; the monthly DTI ratio or residual income; and credit history. It must verify what it relies on using "reasonably reliable third-party records," with oral verification of employment allowed if recorded.

A **qualified mortgage** gets a presumption of compliance. The General QM, since the 2021 amendments, has no fixed DTI cap; instead the loan must have no negative amortization, interest-only or balloon features, a term of 30 years or less, points and fees within the limits, underwriting at the maximum rate in the first five years, the creditor must consider and verify DTI or residual income, and the APR must not exceed the average prime offer rate (APOR) by the threshold for its size. For 2026, a first-lien loan of $137,958 or more fails the price test at 2.25 percentage points over APOR or more; $82,775 to $137,958, at 3.5 points; below $82,775, at 6.5 points. Points and fees are capped at 3% of the loan amount for loans of $137,958 or more, with dollar and percentage caps for smaller loans. A QM that isn't higher-priced (APR less than APOR plus 1.5 points for a first lien) gets a safe harbor; a higher-priced QM gets a rebuttable presumption. [Mortgages & Home Equity](/books/banking-and-lending/mortgages) covers the product side; [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures) covers the APR disclosure.

**Worked numbers (mine).** A $400,000 first-lien purchase mortgage, 30-year fixed:

| Item | Monthly |
| --- | --- |
| Principal and interest at 6.875% | $2,627.72 |
| Taxes, insurance, HOA | $650.00 |
| **Housing payment** | **$3,277.72** |
| Car loan | $480.00 |
| Student loan | $310.00 |
| Card minimums (bureau) | $95.00 |
| **Total obligations** | **$4,162.72** |
| Verified gross income (base plus two-year average bonus) | $10,400.00 |

- **DTI:** 4,162.72 / 10,400 = **40.0%**. Within DU's 50%; above the 36% manual-underwriting base, so a manual file would need the score and reserves for 45%.
- **Price test:** the APR is 7.05% and APOR for a comparable loan that week is 6.30%: a spread of **0.75 points**, under the 2.25-point General QM threshold for a $400,000 loan, and under 1.5, so not higher-priced: a safe-harbor QM if the other conditions hold.
- **If the rate locked at 8.70%** with the same fees, the spread would cross 2.25 points and the loan couldn't be a General QM; the engine should catch that at pricing, not at closing.

The engine stores the inputs, the ratio, the APOR table version and the spread with each decision, because the QM status is a fact about the loan at consummation that an investor and a court can both question later.

## Counteroffers

Approving different terms than requested (a smaller amount, a shorter term, a higher rate, a co-signer) is a **counteroffer**. Regulation B treats "a refusal to grant credit in substantially the amount or on substantially the terms requested" as adverse action, so a counteroffer the applicant doesn't accept or use is a decline: the notice of the counteroffer can come within 30 days, and if the applicant doesn't take it, the adverse action notice is due within 90 days (1002.9(a)(1)); the CFPB's sample Form C-4 combines the counteroffer and the statement of reasons. A counteroffer the applicant accepts isn't adverse action under Reg B, but if the worse terms were set from a consumer report, the FCRA's risk-based pricing rules may require a notice ([What the FCRA Adds](/books/banking-and-lending/adverse-action#what-the-fcra-adds)).

Engines generate counteroffers by searching the grid: the largest amount the applicant qualifies for at the requested term, or the term at which the requested amount fits DTI. My default is to return at most a small set of alternatives, each a stored `credit_decisions` row of kind `counteroffer` with its own reasons, so that whichever the applicant takes (or none) has its paper trail.

## Partner Criteria in Bank Partnerships

When a bank or credit union is the lender of record for a platform's loans, the credit policy is the bank's even if the platform built the engine. Upstart's model is the public example: more than 100 bank and credit union partners set hard credit criteria, and Upstart's models and pricing operate inside them; loans a partner doesn't keep are sold to investors. The same shape appears in BNPL and embedded lending, where a partner bank originates and the program's engine decides ([Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing) covers the legal side, including true lender risk).

For the system that means:

- **Each partner's criteria are a versioned policy layer,** approved by the partner, run before the platform's own model, with the approval recorded ([The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) puts `partner_criteria_ref` on each pricing grid).
- **Routing is a decision too:** which partner's program an application goes to, by state, product and criteria, is stored with the decision, because it decides the lender of record, the disclosures and the notice's creditor name.
- **The bank must be able to see and test it:** decision logs, model documentation, overrides and fair lending results are the bank's examination materials, produced from the platform's records ([Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight) covers the supervision).

## Manual Review, Referrals and Overrides

Not every application should be decided automatically. A **referral** sends the file to an underwriter: a thin file, a score in a gray band near the cutoff, conflicting verifications, a high loan amount, a fraud signal. DU's Refer with Caution doesn't represent acceptable risk for a DU loan, but the lender may underwrite the loan manually if the product allows manual underwriting. A human decision is a judgmental decision, and its reasons come from what the underwriter actually reviewed; in a gray-band case decided by a person after the score, reasons come from both, with the combined list kept to about four (comment 9(b)(2)-7).

An **override** is a human changing the engine's outcome: approving a decline (a high-side override) or declining an approval (a low-side override). Overrides are where unexplained discretion, and so fair lending risk, concentrates. Each one needs a reason from a controlled list, the authority of the person who made it, and monitoring: override rates by underwriter, product and applicant group are a standard exam request ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)).

## Automation Rates

The share of applications decided with no human touch is what lenders and vendors report: Upstart says 91% of its 2025 loans were fully automated; Funding Circle says 73% of its decisions are instant (a company claim without a stated period); Zest AI shows a credit union customer at 75% automated decisioning (customer-reported). The figure is only meaningful with its definition (applications or funded loans; decisions or the whole flow including verification), and it moves with policy: tightening a gray band raises automation by pushing borderline files to automatic declines. My rule: report automation beside the referral rate, override rate and outcome distribution, so that nobody optimizes it alone.

## Champion-Challenger and Shadow Testing

A new model or strategy has to be compared with the current one before it takes over. Three methods, in increasing risk:

- **Backtesting** on historical applications whose outcomes are known, limited by **reject inference**: the old policy declined some applicants, so their repayment is unknown, and the new model's approvals among them can't be scored against reality ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).
- **Shadow mode:** the challenger scores live applications and its decision is logged, but the champion decides. No applicant is affected, and the lender learns how often the two disagree and on whom.
- **Champion-challenger:** a random share of live applications is decided by the challenger. This is the only way to observe the challenger's approvals repaying, and every applicant it decides is a real applicant: a decline needs reasons from the challenger, pricing must stay within caps, and the split itself must not route by a prohibited basis or a proxy for one. Assignment should be random and recorded per application, and the challenger must have passed the same validation and approval as any production model ([Model Risk Management](/books/banking-and-lending/model-risk) covers the governance).

The playbook's [Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely) and [Replay and Shadow Testing](/docs/architecture/weighing-objectives#replay-and-shadow-testing) cover the mechanics; the credit-specific additions are that challenger declines are adverse actions with their own reasons, and that experiment arms are part of the fair lending sample.

## When a Data Source Is Down

A bureau timeout, an aggregator outage or a model service failure mid-decision leaves three choices: fail the application (and owe nothing yet, if no decision was made), decide without the input, or queue and retry. Deciding without an input changes the policy, so it must be an explicit, approved fallback strategy, not an exception path: "if the cash-flow report is unavailable, decide on the bureau-only model with this cutoff" is a policy version like any other. Declining because a vendor was down, then telling the applicant their credit was the reason, is a wrong notice. The playbook covers the general case in [When the Scorer Is Down](/docs/architecture/risk-scoring#when-the-scorer-is-down).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `credit_decisions` (kind, policy and model versions, frozen inputs, outcome, terms and reasons), `applications`, and the pricing tables from [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) (`pricing_grids`, `loan_pricing`) and rate cap checks from [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) (`rate_cap_evaluations`). The scores the engine read are in `credit_scores` and `representative_scores` from [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores#how-to-build-it). This chapter adds the policy as versioned data, every rule's result, model outputs, affordability, experiments and overrides.

```sql
CREATE TABLE decision_policies (             -- a versioned strategy: rules, models, grid, fallbacks
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id          UUID NOT NULL REFERENCES products (id),
  program_id          UUID REFERENCES programs (id),          -- a partner's policy layer
  version             INT NOT NULL,
  layer               TEXT NOT NULL CHECK (layer IN ('partner_criteria', 'lender_policy',
                        'investor_overlay', 'fallback')),
  definition_ref      TEXT NOT NULL,          -- the rules and model calls, as data, frozen
  pricing_grid_id     UUID REFERENCES pricing_grids (id),
  approved_by         TEXT NOT NULL,          -- credit committee or the partner bank, by reference
  effective_from      TIMESTAMPTZ NOT NULL,
  effective_to        TIMESTAMPTZ,
  UNIQUE (product_id, program_id, layer, version)
);

ALTER TABLE credit_decisions
  ADD COLUMN policy_ids       UUID[] NOT NULL DEFAULT '{}',   -- every layer that ran, in order
  ADD COLUMN system_type      TEXT NOT NULL DEFAULT 'scoring'
    CHECK (system_type IN ('scoring', 'judgmental', 'combined')),  -- Reg B's categories
  ADD COLUMN routed_to_program_id UUID REFERENCES programs (id), -- the lender of record chosen
  ADD COLUMN experiment_arm   TEXT,           -- 'champion', 'challenger_b', or NULL
  ADD COLUMN application_data_version_id UUID REFERENCES application_data_versions (id),
  ADD COLUMN supersedes_id    UUID REFERENCES credit_decisions (id); -- an override or redecision

CREATE TABLE decision_rule_results (         -- every rule evaluated, passed or failed
  credit_decision_id  UUID NOT NULL REFERENCES credit_decisions (id),
  policy_id           UUID NOT NULL REFERENCES decision_policies (id),
  rule_key            TEXT NOT NULL,          -- 'state_eligible', 'min_score', 'max_dti', ...
  stage               TEXT NOT NULL CHECK (stage IN ('eligibility', 'risk', 'affordability',
                        'pricing')),
  input_values        JSONB NOT NULL,         -- what the rule read
  passed              BOOLEAN NOT NULL,
  reason_code         TEXT,                   -- the reason it yields if it failed
  PRIMARY KEY (credit_decision_id, policy_id, rule_key)
);

CREATE TABLE model_outputs (                 -- every model called, including shadows
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  credit_decision_id  UUID NOT NULL REFERENCES credit_decisions (id),
  model_key           TEXT NOT NULL,
  model_version       TEXT NOT NULL,          -- the validated, approved version
  role                TEXT NOT NULL CHECK (role IN ('deciding', 'shadow', 'challenger')),
  probability_default NUMERIC(8, 6),
  risk_grade          TEXT,
  contributions_ref   TEXT,                   -- per-feature contributions, for reasons
  latency_ms          INT,
  status              TEXT NOT NULL CHECK (status IN ('ok', 'timeout', 'error', 'fallback'))
);

CREATE TABLE repayment_assessments (         -- DTI, residual income and, for mortgages, ATR/QM
  credit_decision_id  UUID PRIMARY KEY REFERENCES credit_decisions (id),
  monthly_income      BIGINT NOT NULL,        -- verified, minor units
  income_verification_ids UUID[] NOT NULL DEFAULT '{}',   -- verifications rows relied on
  proposed_payment    BIGINT NOT NULL,        -- from the schedule function, qualifying rate
  other_obligations   BIGINT NOT NULL,
  dti_bps             INT NOT NULL,           -- 4003 = 40.03%
  residual_income     BIGINT,
  atr_required        BOOLEAN NOT NULL,       -- 1026.43 covered transaction
  qm_type             TEXT CHECK (qm_type IN ('general', 'seasoned', 'small_creditor', 'agency',
                        'non_qm')),
  apr_bps             INT,
  apor_bps            INT,
  apor_table_ref      TEXT,                   -- the APOR table version and week used
  points_and_fees     BIGINT,
  higher_priced       BOOLEAN,
  assessed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE decision_experiments (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id          UUID NOT NULL REFERENCES products (id),
  champion_policy_id  UUID NOT NULL REFERENCES decision_policies (id),
  challenger_policy_id UUID NOT NULL REFERENCES decision_policies (id),
  mode                TEXT NOT NULL CHECK (mode IN ('shadow', 'live_split')),
  challenger_share_bps INT NOT NULL CHECK (challenger_share_bps BETWEEN 0 AND 10000),
  assignment_method   TEXT NOT NULL,          -- 'hash_of_application_id': random, never by applicant traits
  approved_by         TEXT NOT NULL,
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ
);

CREATE TABLE decision_overrides (
  credit_decision_id  UUID PRIMARY KEY REFERENCES credit_decisions (id),  -- the new decision
  overridden_id       UUID NOT NULL REFERENCES credit_decisions (id),     -- the engine's
  direction           TEXT NOT NULL CHECK (direction IN ('high_side', 'low_side', 'terms')),
  reason_code         TEXT NOT NULL,          -- from a controlled list
  authority_ref       TEXT NOT NULL,          -- the lending authority the person holds
  overridden_by       TEXT NOT NULL,
  overridden_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The engine is a pure function of the frozen inputs (`inputs_ref`, the application data version, the score IDs) and the policy versions, so any decision can be replayed and must reproduce ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). `decision_rule_results` stores passes as well as failures, because "show me that you checked the MLA status" is answered by a passed row. `model_outputs` stores shadow and challenger outputs beside the deciding one, which is what makes the shadow comparison a query. Experiment assignment is a deterministic hash of the application ID, recorded in `experiment_arm`, never a field of the applicant. An override never edits the engine's decision; it creates a new `credit_decisions` row that supersedes it and a `decision_overrides` row that explains it ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)). `repayment_assessments` keeps the APOR table version used, so the QM status can be recomputed exactly as it was at consummation.

## Auditing

Decisions are what fair lending exams, model validators, partner banks and investors all sample ([Audit Trails](/docs/architecture/audit-trails)). Make sure the record shows:

- **Every decision's inputs, policy versions, model versions and outcome,** replayable to the same result.
- **Every rule evaluated,** passed or failed, with the values it read.
- **Every model output,** deciding, shadow or challenger, with its status and any fallback used.
- **Affordability as computed:** income and the verifications behind it, obligations, DTI or residual income, and for mortgages the ATR factors, QM type, APR, APOR and spread.
- **Every counteroffer,** what was offered and whether it was accepted.
- **Routing and the partner policy applied,** for bank partnership programs.
- **Every experiment:** its approval, split, assignment method and dates, and each application's arm.
- **Every override,** with direction, reason, authority and person, and override rates by person and product.
- **Approvals of each policy and model version,** by the credit committee or partner bank.

## What This Means for the System You Build

- **Run policy, then score, then affordability, then price,** and let each stage produce its own reasons.
- **Keep the policy as versioned data with an approver,** layered for partner criteria and investor overlays.
- **Make the engine replayable:** frozen inputs plus policy versions must reproduce every decision.
- **Store passed rules, not just failed ones,** and every model output including shadows.
- **Compute DTI from the disclosure's payment function** and verified income, and store the ATR/QM facts with the APOR version.
- **Create counteroffers as decisions** with their own reasons and track acceptance for the 90-day notice.
- **Treat challenger and fallback strategies as production policy:** validated, approved, and producing real reasons.
- **Make overrides new decisions** with a reason, an authority and monitoring.

## References

**Law and regulation**

- [Cornell LII: 12 CFR 1002.2, definitions (Regulation B)](https://www.law.cornell.edu/cfr/text/12/1002.2), the empirically derived, demonstrably and statistically sound credit scoring system and the judgmental system
- [Cornell LII: 12 CFR 1002.6, rules concerning evaluation of applications](https://www.law.cornell.edu/cfr/text/12/1002.6), no effects test, age in scoring systems, public assistance, part-time and retirement income, alimony and support
- [CFPB: Regulation B § 1002.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/), adverse action as a refusal on substantially the terms requested
- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), the 90-day counteroffer rule and comment 9(b)(2)-7 on combined systems
- [CFPB: Regulation B Appendix C, sample notification forms](https://www.consumerfinance.gov/rules-policy/regulations/1002/c/), Form C-4 for counteroffers
- [Cornell LII: 12 CFR 1026.43, minimum standards for transactions secured by a dwelling](https://www.law.cornell.edu/cfr/text/12/1026.43), the eight ATR factors, third-party verification, General QM features and price thresholds
- [CFPB: Regulation Z § 1026.43](https://www.consumerfinance.gov/rules-policy/regulations/1026/43/), higher-priced covered transactions, safe harbor and rebuttable presumption
- [Federal Register: Truth in Lending (Regulation Z) annual threshold adjustments, 90 FR 57890 (December 15, 2025)](https://www.federalregister.gov/documents/full_text/text/2025/12/15/2025-22773.txt), the 2026 General QM loan amount tiers and points-and-fees limits
- [Federal Register: Equal Credit Opportunity Act (Regulation B), 91 FR 21620 (April 22, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/04/22/2026-07804.txt), removal of the effects test, effective July 21, 2026
- [NYDFS: Industry letter on New York's fair lending law (April 22, 2026)](https://www.dfs.ny.gov/industry-guidance/industry-letters/20260422-nys-fair-lending-law), disparate impact under Executive Law 296-a, issued the day the Regulation B rule was published
- [Federal Register: Statement on ability to repay and immigration status, 91 FR 34607 (June 8, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/06/08/2026-11447.txt), immigration status under Regulation B and continuing income for ability to repay

**Agency guides**

- [Fannie Mae Selling Guide B3-2-01: General information on DU](https://selling-guide.fanniemae.com/sel/b3-2-01/general-information-du), no single factor, offsetting factors, the four recommendations and the lender's judgment
- [Fannie Mae Selling Guide B3-5.1-01: General requirements for credit scores](https://selling-guide.fanniemae.com/sel/b3-5.1-01/general-requirements-credit-scores), no minimum score for DU casefiles, 620 and 640 for manual underwriting, scores still required, and announcement SEL-2025-09 (November 5, 2025)
- [Fannie Mae Selling Guide B3-2-07: Refer with Caution recommendations](https://selling-guide.fanniemae.com/sel/b3-2-07/refer-caution-recommendations), not acceptable risk for DU loans and manual underwriting where allowed
- [Fannie Mae Selling Guide B3-6-02: Debt-to-income ratios](https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios), 50% for DU, 36% and up to 45% for manual underwriting
- [Freddie Mac: Loan Product Advisor](https://sf.freddiemac.com/tools-learning/loan-advisor/our-solutions/loan-product-advisor), Accept and Caution and feedback on reaching Accept

**Filings**

- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), lending partners' hard criteria, model variables, automation and funding

**Vendor documentation**

- [Experian Australia: Decisioning and credit risk management](https://www.experian.com.au/business/solutions/decisioning/decisioning-credit-risk-management), PowerCurve Strategy Management and champion-challenger strategies
- [Provenir](https://www.provenir.com/), low-code decisioning and validation against production data
- [Taktile](https://www.taktile.com/), rules, models and human review, integrations, backtesting and A/B experiments, versioning and audit trails
- [Zest AI](https://www.zest.ai/), custom underwriting models and the customer-reported automation figure
- [MeridianLink](https://www.meridianlink.com/), DecisionLender
- [Funding Circle](https://corporate.fundingcircle.com/), the instant decision share (company claim)
