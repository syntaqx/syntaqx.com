+++
title = "Model Risk Management"
description = "Model risk in lending after SR 26-2 replaced SR 11-7: what counts as a model, validation, monitoring and drift, vendor models, and ML and LLMs in credit."
category = "Banking & Lending Industry"
order = 2447
part = "Origination and Underwriting"
tags = ["banking", "lending", "model-risk", "sr-26-2", "machine-learning", "governance"]
+++

A lender's models decide who gets credit, at what price, with what limit, and which accounts get a collections call; others estimate losses for the allowance, project deposits for liquidity, and flag transactions for AML. When a model is wrong, or right for the population it was built on and wrong for the one it now sees, the lender loses money or breaks a law at scale, silently, until someone measures. Model risk management is the discipline that makes someone measure: an inventory of every model, documentation of how each was built, validation by someone who didn't build it, monitoring in production, and governance that can stop one.

For fifteen years US banks built that discipline on one document, the Federal Reserve's SR 11-7 and the OCC's matching Bulletin 2011-12. On April 17, 2026 the Federal Reserve, OCC and FDIC replaced both with revised guidance (SR 26-2, OCC Bulletin 2026-13) that narrows what a model is, scales expectations to size, says it sets no enforceable standards, and leaves generative and agentic AI outside its scope. This chapter covers the guidance and its status as of October 2026, what counts as a model in a lending stack, development, validation, monitoring and drift with worked numbers, vendor models, and machine learning and LLMs in credit decisions. The decision engine that runs the models is in Underwriting & Decision Engines; the notice explaining a model's decline is in Adverse Action & Explaining Decisions; the fairness testing of a model is in [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending#fair-lending-testing); the payments side of the same guidance is in [AI in Payments](/books/payments/ai-in-payments#model-risk-fair-lending-and-udaap).

## How the Platforms Do It

Lenders build some models and buy others, and a governance market sits around both. As of October 2026, from filings and vendor pages:

| Who | Role | Public detail |
| --- | --- | --- |
| **Upstart** | In-house ML underwriting for bank and credit union partners | Its personal loan model grew "from 23 variables at the end of 2014 to over 2,500"; it is "one of approximately 30 proprietary machine learning models"; trained on nearly 104 million repayment events; 91% of 2025 loans fully automated |
| **Credit bureaus and score developers** | Vendor models in nearly every decision | Bureau scores arrive as a number and reason codes; Credit Data & Scores covers which scores investors accept |
| **ValidMind** | Model and AI governance software | Inventories, risk tiers, approvals, automated testing and documentation; names SR 26-2 among the regimes it supports |
| **FairPlay** | Validation and bias testing | Model validation, "agentic validation" and automated bias testing |
| **SolasAI** | Fairness and drift monitoring | Monitors deployed models "for drift and emerging fairness risks" |

The pattern: lenders that compete on underwriting (Upstart is the clearest public example) build dozens of models and treat retraining as routine, which makes validation and monitoring a pipeline, not an annual report; banks running a bureau score and a vendor fraud score still own the risk of models they didn't build; and governance tooling sells the evidence (inventory, documentation, test results) more than the math.

## The Guidance in 2026

On April 17, 2026 the three federal banking agencies issued "Revised Guidance on Model Risk Management." As of October 2026:

- **What it replaced.** SR 26-2 supersedes SR 11-7 (April 4, 2011) and SR 21-8, the 2021 interagency statement on models in BSA/AML systems. OCC Bulletin 2026-13 rescinds the Comptroller's Handbook "Model Risk Management" booklet, OCC Bulletin 1997-24 on credit scoring model examination guidance, OCC Bulletin 2011-12, and OCC Bulletin 2021-19.
- **What a model is.** "A complex quantitative method, system, or approach that applies statistical, economic, or financial theories" to produce quantitative estimates. Simple arithmetic, such as spreadsheet calculations, and deterministic rule-based processes without statistical, economic or financial theory behind them are excluded.
- **What it covers.** Model development and use (including testing), validation and monitoring (including conceptual soundness and outcomes analysis), governance and controls (policies, roles, responsibilities), and vendor and third-party products (including their validation).
- **Who it's for.** It is "expected to be most relevant to banking organizations with over $30 billion in total assets," and practices should be "tailored to a banking organization's model risk profile and the size and complexity of its operations." The OCC's version applies to all national banks and federal savings associations subject to that limitation, and repeats its October 2025 clarification (Bulletin 2025-26) that its guidance "does not, and should not be interpreted to, require community banks to perform annual model validation."
- **How binding.** It "does not set forth enforceable standards or prescriptive requirements," so falling short of it doesn't by itself draw supervisory criticism. Weak model risk management still shows up as an unsafe practice when a model fails, and partner banks still impose their own policies on fintechs.
- **What it leaves out.** Generative and agentic AI models are "not within the scope of this guidance" because they are "novel and rapidly evolving."

For engineering, two changes matter. The definition gives a principled answer to "is this a model?", which decides what enters the inventory and gets validated. And the size scaling means the same platform serves a $5 billion bank partner that wants proportionate validation and a $100 billion bank that wants the full program; the evidence the system produces should satisfy the larger one, because that costs little more and the smaller bank's policy can always ask less.

## What Counts as a Model

In a lending stack, applying the 2026 definition:

- **Models:** credit scorecards and ML underwriting models, bureau and vendor scores, pricing and response models, line assignment and line management models, fraud and identity scores, collections prioritization, prepayment and loss forecasting, CECL allowance models, deposit and liquidity models, AML transaction monitoring scenarios that use statistical thresholds.
- **Not models:** the credit policy's knockout rules (minimum score, maximum DTI, state exclusions), a rate cap check, a fee calculation, the APR computation, a payment allocation waterfall. These are deterministic rules, governed as policy and code under change control ([Rules as Data](/docs/architecture/rules-as-data)), not validated as models.
- **The middle:** a rules engine whose cutoffs were set by statistical analysis, an "expert" scorecard with judgmental weights, and a vendor's black-box score. My rule is to inventory them all with a tier, and to treat anything that produces an estimate the lender couldn't recompute by hand as a model.

The inventory is the control everything else hangs from: a model that isn't in it isn't validated, monitored or owned. Each entry needs an owner, a use, a tier by materiality, its inputs and their sources, its versions, its validations and findings, and the decisions it feeds.

## Development and Use

A model is built for a purpose and a population, and its documentation says both. For a credit model the developer records the target (for example, 60 or more days past due within 12 months of origination), the development sample and its vintages, exclusions (fraud, deceased, never-paid), reject inference if any, the candidate variables and why each was kept or dropped (including any that could act as a proxy for a prohibited basis), the algorithm and hyperparameters, performance on holdout and out-of-time samples, and the intended use and limits.

The use is part of the model: a score built to rank applicants for approval isn't automatically valid for setting credit limits, and a model built on prime borrowers isn't valid for a new near-prime channel. When a use changes, validation is due again.

## Validation

Validation is an independent assessment that the model is sound and works as intended. Its parts:

- **Conceptual soundness:** the design, data and variables make sense for the purpose; the method fits the data; known limitations are stated.
- **Outcomes analysis:** predictions compared with what happened, on data the developer didn't use. For a credit model, back-testing predicted default rates against observed rates by score band and vintage, and rank-ordering measures over time.
- **Implementation testing:** the production code produces the same output as the validated model on the same inputs. In a stack where data science trains in one environment and a decision engine scores in another, this is where models most often fail: a missing-value default that differs, a feature computed as of a different date, a variable transformed twice.
- **Use review:** the model is used only for what it was validated for, and overrides are tracked.

Findings have severities and due dates, and a model can be approved with conditions (a restricted use, a tighter monitoring threshold) while findings are remediated. Independence means the validator doesn't report to the developer; at a small lender it can be a second team or an outside firm, and the guidance's size scaling lets that be proportionate.

## Monitoring and Drift

A credit model degrades because the population changes (a new marketing channel, a recession, a competitor's exit), because inputs change (a bureau changes an attribute's definition), or because the relationship between inputs and outcomes changes. Monitoring watches each:

- **Input stability:** the distribution of each input and of the score, compared with the development sample.
- **Performance:** rank ordering and calibration on loans old enough to have outcomes. For a 12-month target, the newest measurable vintage is a year old, so monitoring always looks backward ([Labels Arrive Late](/docs/architecture/risk-scoring#labels-arrive-late)).
- **Overrides and exceptions:** how often people overrule the model, in which direction, and how those loans perform.
- **Fairness:** outcome rates by group over time ([Fair Lending Testing](/books/banking-and-lending/fair-lending#fair-lending-testing)).

**Worked numbers: a population stability index.** The PSI compares the share of applicants in each score band now with the share at development: PSI = Σ (actual − expected) × ln(actual / expected).

| Score band | Expected (development) | Actual (last quarter) | Contribution |
| --- | --- | --- | --- |
| Lowest | 10% | 14% | (0.14 − 0.10) × ln(1.40) = 0.0135 |
| Second | 20% | 24% | (0.04) × ln(1.20) = 0.0073 |
| Middle | 30% | 29% | (−0.01) × ln(0.967) = 0.0003 |
| Fourth | 25% | 21% | (−0.04) × ln(0.84) = 0.0070 |
| Highest | 15% | 12% | (−0.03) × ln(0.80) = 0.0067 |
| **Total** | 100% | 100% | **0.0348** |

Every band's contribution is positive whichever way it moved, so the PSI measures how much the mix shifted, not which way. Here the applicants moved toward the riskier bands, which the PSI alone doesn't say and the band table does; the monitoring report shows both. The thresholds that trigger review are the lender's to set in the monitoring plan, per model and tier, and a breach opens a finding with an owner, the same as a validation finding. A shift like this one, after a new acquisition channel launched, is the classic signal that the model is now scoring a population it wasn't built on.

## Vendor Models

Most lenders' decisions run on at least one model they can't inspect: a bureau score, a fraud or identity score, a cash-flow score from bank data. The 2026 guidance covers vendor and third-party products, including their validation. What the lender can do without the code:

- **Get the developer's documentation:** purpose, development population, performance, limitations, and how the vendor tests for fairness and stability.
- **Validate outcomes on its own book:** rank ordering and calibration on the lender's applicants and loans, which is the evidence that matters.
- **Monitor inputs and outputs** the same as an internal model, and require notice of version changes in the contract.
- **Keep the version on every decision:** a vendor score without its model version can't be traced when the vendor ships a new one.

In a bank partnership, the bank owns the model risk of the platform's models as vendor models, and the program agreement is where its validation rights, documentation and change notice live ([Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight)).

## Machine Learning and LLMs in Credit

**Machine learning underwriting** is a model under the 2026 definition and its governance is the same, with three pressures heavier than for a scorecard. Explanations: a decline must state specific principal reasons (12 CFR 1002.9), so the lender needs a reason-code method validated alongside the model, and the withdrawal of the CFPB's 2022 circular on complex algorithms didn't change the regulation it interpreted (Adverse Action & Explaining Decisions covers the method). Proxies: with thousands of variables, some can stand in for a prohibited basis, and the 2026 Reg B comment still treats a criterion that functions as a proxy as discrimination ([Disparate Impact and the 2026 Reg B Rule](/books/banking-and-lending/fair-lending#disparate-impact-and-the-2026-reg-b-rule)). Retraining: a model retrained monthly is a new version each month, and each needs its validation evidence before it scores an applicant, which is only practical as an automated pipeline with a human approval gate.

**Large language models** sit outside the 2026 guidance, which doesn't make them ungoverned: the bank's own policy, UDAAP and the fair lending laws still apply to what they do. In lending they show up in document extraction (pay stubs, bank statements, tax returns), underwriter assistance, servicing and collections agents, and complaint triage. My rule is the one the playbook gives for agents: the model proposes, deterministic code decides ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)). An LLM can extract the income from a pay stub, with the extraction checked and recorded; it doesn't approve the loan, set the price or choose the reason codes. Every extraction it makes that feeds a credit decision is an input with a source, a confidence and a reviewer, so the decision record shows where each number came from ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

Outside the US, creditworthiness assessment is a high-risk use under the EU AI Act, with obligations now due in December 2027 ([AI in Payments](/books/payments/ai-in-payments#model-risk-fair-lending-and-udaap)).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). `credit_decisions` already carries `model_version` as text; this chapter adds the inventory it points into, validations and their findings, and monitoring runs, and links each decision to the exact version that scored it.

```sql
CREATE TABLE model_inventory (               -- every model, owned and tiered
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id        UUID REFERENCES institutions (id),   -- null: a platform model serving several
  name                  TEXT NOT NULL UNIQUE,
  use                   TEXT NOT NULL,         -- 'origination_score', 'line_assignment', 'fraud',
                                               -- 'collections_priority', 'cecl', 'aml', ...
  source                TEXT NOT NULL CHECK (source IN ('internal', 'vendor', 'partner')),
  vendor                TEXT,
  owner                 TEXT NOT NULL,         -- the accountable person or team
  tier                  TEXT NOT NULL CHECK (tier IN ('high', 'medium', 'low')),
  in_guidance_scope     BOOLEAN NOT NULL,      -- false for genAI, governed by internal policy
  status                TEXT NOT NULL CHECK (status IN ('development', 'approved', 'restricted',
                          'retired')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE model_versions (                -- what actually scores, by hash
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  model_id              UUID NOT NULL REFERENCES model_inventory (id),
  version               TEXT NOT NULL,         -- as the developer or vendor names it
  artifact_digest       TEXT,                  -- hash of the deployed artifact; null for vendor scores
  documentation_ref     TEXT NOT NULL,
  training_data_ref     TEXT,                  -- sample, vintages, exclusions
  intended_use          TEXT NOT NULL,
  approved_at           TIMESTAMPTZ,
  approval_conditions   TEXT,
  deployed_during       TSTZRANGE,             -- when it was live
  UNIQUE (model_id, version)
);

CREATE TABLE model_validations (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id      UUID NOT NULL REFERENCES model_versions (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('initial', 'periodic', 'change',
                          'implementation')),
  validator             TEXT NOT NULL,         -- independent of the owner
  scope                 TEXT[] NOT NULL,       -- 'conceptual_soundness', 'outcomes', 'implementation', 'use'
  conclusion            TEXT NOT NULL CHECK (conclusion IN ('approved', 'approved_with_conditions',
                          'not_approved')),
  report_ref            TEXT NOT NULL,
  completed_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE model_findings (                -- from validation or monitoring
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  model_id              UUID NOT NULL REFERENCES model_inventory (id),
  validation_id         UUID REFERENCES model_validations (id),
  monitoring_run_id     UUID,                  -- model_monitoring_runs, below
  severity              TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  description           TEXT NOT NULL,
  owner                 TEXT NOT NULL,
  due_on                DATE NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('open', 'remediated', 'accepted', 'closed')),
  closed_at             TIMESTAMPTZ
);

CREATE TABLE model_monitoring_runs (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id      UUID NOT NULL REFERENCES model_versions (id),
  period                DATERANGE NOT NULL,
  metrics               JSONB NOT NULL,        -- PSI per input and score, rank ordering, calibration by
                                               -- band and vintage, override rates
  thresholds            JSONB NOT NULL,        -- the monitoring plan's limits for this tier
  breached              TEXT[] NOT NULL DEFAULT '{}',
  run_at                TIMESTAMPTZ NOT NULL
);

ALTER TABLE credit_decisions
  ADD COLUMN model_version_id UUID REFERENCES model_versions (id),
  ADD COLUMN vendor_scores    JSONB;           -- each vendor score with its model version, as received
```

How it runs:

1. **Nothing scores without an approved version.** The decision engine loads a model by `model_versions.id` and refuses one without `approved_at`, or outside its `approval_conditions`. Deploying a new artifact is a new row, and the digest in the row is checked against what is loaded ([Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely)).
2. **Every decision names its versions.** `credit_decisions.model_version_id` and `vendor_scores` freeze what scored the applicant, beside `policy_version` and `inputs_ref`, so any decision can be replayed against the exact models that made it.
3. **Implementation is tested on every release:** the validation team's reference outputs for a fixed input set must match production scoring before the version goes live.
4. **Monitoring is a scheduled job per model and tier,** writing a run with its metrics and thresholds; a breach opens a `model_findings` row, and a high-severity finding can move the model to `restricted`, which the engine reads.
5. **LLM components are inventoried too,** with `in_guidance_scope = false`, and every extraction that feeds a decision is stored as an input with its source document and reviewer.

## Auditing

Examiners, partner banks and auditors ask:

- **The inventory:** every model, owner, use, tier and status, and when each entered and left.
- **For each version:** its documentation, training data, approval and conditions, and when it was live.
- **Validation:** each report, its scope, its conclusion, and every finding with its owner, due date and closure.
- **Monitoring:** each run's metrics against thresholds, breaches and what followed.
- **Decisions:** for any applicant, the model versions and vendor score versions that scored them, the policy version, and the inputs as frozen.
- **Overrides:** who overrode which decision, why, and how those loans performed.

## What This Means for the System You Build

- **Inventory every model, including vendor scores and LLM components,** with an owner, a use and a tier.
- **Apply the 2026 definition deliberately:** rules are policy under change control, estimates are models under validation.
- **Pin every decision to model versions by ID and digest,** including each vendor score's version.
- **Gate deployment on approval** and test implementation against the validator's reference outputs on every release.
- **Monitor stability, performance, overrides and fairness on a schedule,** with thresholds per tier and findings that can restrict a model.
- **Build for the largest partner bank's expectations,** since the evidence is the same and the guidance scales by size.
- **Let LLMs extract and propose, never decide,** and record each extraction that feeds credit as a sourced input.

## References

**Law and regulation**

- [12 CFR 1002.9 (Regulation B)](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), specific principal reasons in a notice of adverse action

**Regulators and guidance**

- [Federal Reserve: SR 26-2, Revised Guidance on Model Risk Management (April 17, 2026)](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm), supersedes SR 11-7 and SR 21-8; the risk-based approach and the $30 billion relevance statement
- [OCC: Bulletin 2026-13, Model Risk Management: Revised Guidance (April 17, 2026)](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html), the rescinded OCC issuances, the model definition, the covered areas, non-enforceability and the generative and agentic AI exclusion
- [OCC: Bulletin 2025-26, Model Risk Management: Clarification for Community Banks (October 6, 2025)](https://www.occ.gov/news-issuances/bulletins/2025/bulletin-2025-26.html), no annual validation requirement for community banks

**Filings and vendors**

- [Upstart Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), variables, the number of models, repayment events and the automation rate
- [ValidMind](https://validmind.com/), model and AI governance, inventories, validation automation and SR 26-2
- [FairPlay](https://fairplay.ai/), model validation, agentic validation and bias testing
- [SolasAI](https://www.solas.ai/), disparity testing and drift monitoring of deployed models
