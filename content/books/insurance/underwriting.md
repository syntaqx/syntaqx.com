+++
title = "Underwriting Rules, Referrals & Models"
nav_title = "Underwriting Rules"
description = "Eligibility rules, filed underwriting guidelines, authority and referrals, inspections and underwriting periods, rules engines, and AI model governance."
category = "Insurance Industry"
order = 2723
part = "Rating and Underwriting"
tags = ["insurance", "underwriting", "rules-engines", "referrals", "inspections", "ai-governance"]
+++

Rating answers "what does this risk cost"; underwriting answers "do we want it, on what terms, and who gets to decide." The two are tangled in practice: a carrier may place an applicant in a costlier tier or affiliate company (an underwriting decision that changes the price), decline a dwelling with an old roof (eligibility), require an inspection before or after binding (a condition), or refer a commercial account above a premium threshold to a senior underwriter (authority). Each of those is a rule someone wrote down, and in some states the rule has to be filed with the regulator or produced on request, must be "sound, actuarially justified, or otherwise substantially commensurate with the contemplated risk" and may not be unfairly discriminatory, in Texas's words. Increasingly the rule is a model, and since the NAIC's 2023 model bulletin most states expect a governed program around every AI system that makes or supports an underwriting decision.

For a system that means three things: underwriting rules are versioned data with an owner and a filing status, every decision records which rules and models fired and who overrode them, and the post-bind underwriting period (when an insurer may still cancel because the inspection found something) is a clock set by state law. This chapter covers eligibility and guidelines, underwriting authority and referrals, inspections and underwriting periods, rules engines, and model governance. The legality of individual factors is What You May Rate On; MGA binding authority is MGAs, Programs & Fronting; the generic patterns are in [Rules as Data](/docs/building-blocks/rules-as-data) and [Risk Scoring](/docs/building-blocks/risk-scoring).

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform | Underwriting construct | How it works |
| --- | --- | --- |
| **Guidewire PolicyCenter** | Underwriting issues, referral reasons, authority profiles | An underwriting issue is "a flag attached to a job or policy that indicates an issue that may require underwriter review," most commonly blocking at quoting, binding or issuance; an issue can compare a value to a threshold (driver's age under 25); the assigned user can request approval from a user with greater authority; referral reasons attach to the policy and may raise an underwriting issue on the next job; a "special close" requires a `uwapproveall` permission |
| **Guidewire UnderwritingCenter** | A separate underwriting workbench product | Listed in Guidewire's InsuranceSuite in its FY2026 10-K |
| **Socotra** | Transaction states | Transactions move from draft through validation, pricing and underwriting before issuance |
| **Banking analog** | Decision engines | Policy rules, then score, then price, with manual review and overrides ([Decision Engines](/books/banking-and-lending/decision-engines#policy-then-score-then-price)) |

The shared shape: a rule evaluates facts on a quote or transaction and produces either a hard stop (ineligible), a soft stop that blocks a specific step until someone with enough authority approves it, or an informational flag. Approval is a record with a person, an authority level and a reason, and an override never deletes the issue, it closes it.

## Eligibility and Underwriting Guidelines

Underwriting guidelines are the carrier's written rules for which risks it accepts, in which company or tier, on what conditions: minimum years licensed, maximum points, roof age or material, distance to coast, number of prior claims, vacancy, dog breeds where lawful, business classes it won't write. Some states regulate them directly. Texas is the clearest:

- **Personal auto and residential property: filed.** "Each insurer shall file with the department a copy of the insurer's underwriting guidelines," and update the filing "each time the underwriting guidelines are changed"; group filers identify which guidelines apply to each company; the Office of Public Insurance Counsel may obtain a copy; the department or OPIC may publish a summary that doesn't identify the insurer; the guidelines "must be sound, actuarially justified, or otherwise substantially commensurate with the contemplated risk" and "may not be unfairly discriminatory," and they are subject to the Public Information Act (Tex. Ins. Code 38.002, added in 2003, amended effective April 1, 2009).
- **Other lines: produced on request, confidential.** For other lines the department or OPIC "may obtain a copy," and the guidelines "are confidential," with need-to-know access logged and use as evidence under a protective order (38.003).

Underwriting guidelines also meet the same discrimination rules as rating: Maryland's ban on cancelling, nonrenewing or refusing a homeowners risk for a claim more than three years old is an underwriting rule, as is its bar on using credit to refuse, cancel or nonrenew any auto policy (What You May Rate On). And Hawaii's supreme court has read its motor vehicle discrimination statute to reach underwriting standards, not just rating plans.

In a system, a guideline is a rule with a version, an effective date, the products it applies to, a filing reference where a state requires one, and a citation to the statute that constrains it. A change to a Texas personal auto guideline is therefore also a filing event: the system that publishes the new rule version should open the filing task.

## Authority and Referrals

Authority is who may accept what. Carriers grant it in layers:

- **System authority:** what the rules engine may approve with no human (straight-through processing for clean risks).
- **Agent or MGA authority:** what a producer may bind under its agency agreement or binding authority, with limits by line, class, limit and premium (MGAs, Programs & Fronting).
- **Underwriter authority:** tiers by premium, limit, class and exception type; Guidewire's model is an authority profile granted to users, with an approval request going to "a user with a greater level of authority."
- **Referral to a carrier or reinsurer:** risks above treaty limits or outside a program's guidelines go to the carrier's home office or a facultative reinsurer.

A referral is a work item with a reason, a due time and an owner; a quote with an open blocking referral can't bind. Two details distinguish good implementations. First, **a referral reason can outlive a transaction**: Guidewire attaches referral reasons to the policy so a concern found midterm (a new driver with a DUI) resurfaces as an underwriting issue on the next job, including the renewal. Second, **approvals are scoped**: an approval of "driver age under 25" on one quote version doesn't approve a different driver on a requote; when the value changes, the issue reopens.

## Inspections and Underwriting Periods

Many personal lines risks are bound before anyone looks at them, and the inspection comes after. State law then sets how long the insurer has to act on what it finds, and on what grounds:

- **Texas.** Personal auto in effect fewer than 60 days may be cancelled for any reason; homeowners in effect fewer than 60 days only if the insurer finds an undisclosed condition that increases the hazard and wasn't the subject of a prior claim, or if the insurer doesn't accept a qualifying inspection report dated no earlier than 90 days before the effective date. An inspection report submitted by the applicant is deemed accepted unless rejected before the 11th day after the insurer receives it (Tex. Ins. Code 551.104(g), (h)). Other policies in effect fewer than 90 days may be cancelled for any reason.
- **Florida.** For personal residential property, a cancellation in the first 60 days for reasons other than nonpayment needs at least 20 days' notice, unless there was a material misstatement or a failure to comply with the insurer's underwriting requirements. After 60 days the insurer may cancel only for a material misstatement, nonpayment, "a failure to comply, within 60 days after the date of effectuation of coverage, with underwriting requirements established by the insurer before the date of effectuation of coverage," a substantial change in the risk, or for a whole class (Fla. Stat. 627.4133(2)(b)).
- **New York.** Personal auto and personal lines policies may be cancelled for any stated reason in the first 60 days; after that only on listed grounds (N.Y. Ins. Law 3425(b), (c)).

A worked timeline, mine, for a homeowners policy effective 12:01 a.m. on March 1, 2027. In Texas, an applicant-supplied inspection report must be dated on or after December 1, 2026 (90 days before the effective date), and one received March 20 is deemed accepted unless the insurer rejects it by March 30; the insurer's own inspection must lead to any underwriting cancellation while the policy has been in effect fewer than 60 days, roughly through the end of April. In Florida, the requirements must be ones the insurer established before March 1, the insured has 60 days after effectuation to comply, and a cancellation in the first 60 days needs 20 days' notice. Whether the effective date counts as day one of "in effect for 60 days" is a convention the rule table has to state explicitly and test, because a one-day error is the difference between a lawful cancellation and a reinstatement with back coverage (Cancellation, Nonrenewal & Notice Law).

What the inspection system needs is therefore a dated pipeline: the requirement (set before the effective date), the order, the report with its date, the receipt date, the accept or reject decision with its deadline, and, if the decision is to cancel, the notice computed from the state's rule. An inspection that arrives after the underwriting period has closed is still useful at renewal, as a referral reason.

## Rules Engines

An underwriting rule has a condition over facts, an outcome (decline, refer, condition, flag, tier assignment), a blocking point (quote, bind, issue, renewal), an authority level that can clear it, a message, and metadata (owner, version, effective dates, products, states, filing reference, legal citation). Implementation choices, with my defaults:

- **Rules are data, versioned and dated like rate tables** ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), selected by the policy's effective date and transaction type. A renewal is evaluated on the rules in force for the renewal's effective date.
- **Every evaluation is recorded:** which rules ran, their versions, the facts they read, and the outcome, so "why was this declined" has an answer that doesn't depend on rerunning today's rules ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Hard stops are rare and reviewed.** A decline is an adverse action if a consumer report contributed to it (Consumer Reports & Third-Party Data), and in Texas an unfairly discriminatory guideline is a statutory violation, so declines need the same review a rating factor gets.
- **Models produce scores; rules make decisions.** A model's output (a loss propensity, a fraud score, a property condition estimate from imagery) is a fact a rule reads with a threshold, which keeps the decision explainable and lets underwriters tune thresholds without retraining ([Rules and Models Together](/docs/building-blocks/risk-scoring#rules-and-models-together)).

## Model Governance

The NAIC's Model Bulletin on the Use of Artificial Intelligence Systems by Insurers, adopted December 4, 2023, is the baseline in most states. Its operative expectation: decisions made or supported by AI systems "must comply with the legal and regulatory standards that apply to those decisions, including unfair trade practice laws," must not be "inaccurate, arbitrary, capricious, or unfairly discriminatory," and every insurer is expected to "develop, implement, and maintain a written program (an "AIS Program") for the responsible use of AI Systems that make, or support decisions related to regulated insurance practices." The program's contents:

- **Governance:** responsibility vested in senior management accountable to the board or a board committee; proportionate to use and reliance; may sit inside the ERM program and may adopt a framework such as NIST's AI Risk Management Framework; covers the whole insurance life cycle and every phase of the AI system life cycle, whether built in-house or by a vendor; notice to consumers that AI systems are in use.
- **Risk management:** documented processes for "designing, developing, verifying, deploying, using, updating, and monitoring" predictive models; "inventories and descriptions of the Predictive Models"; detailed documentation of development and use; monitoring for model drift ("the decay of a model's performance over time"); data lineage; validation and testing.
- **Third parties:** due diligence that vendor systems "will meet the legal standards imposed on the Insurer itself," and contract terms that "provide audit rights and/or entitle the Insurer to receive audit reports by qualified auditing entities" and require the vendor to cooperate with regulatory inquiries.
- **Examinations:** in an investigation or market conduct action the insurer "can expect to be asked about its development, deployment, and use of AI Systems" and to produce the written program.

Adoption, from the NAIC's map dated November 3, 2026: 29 jurisdictions (27 states, the District of Columbia and Puerto Rico) have adopted the bulletin, most recently South Carolina (Bulletin 2026-07, September 24, 2026) and North Dakota (Bulletin 2026-2, October 5, 2026). Four states have their own insurance-specific rules instead: California (Bulletin 2022-5, June 30, 2022), Colorado (3 CCR 702-10, effective November 13, 2023, amended effective October 15, 2025), New York (Circular Letter No. 7, July 11, 2024) and Texas (Bulletin B-0036-20, September 30, 2020). New York's letter adds the most specific testing and transparency duties: pre-production unfair discrimination testing, a less discriminatory alternative search, an inventory, vendor responsibility, and adverse decisions that state specific reasons, including the data source, without hiding behind "the proprietary nature of a third-party vendor's algorithmic processes" (What You May Rate On).

The generic machinery (inventory, validation, monitoring, vendor models) is the same as bank model risk management, and [Model Risk Management](/books/banking-and-lending/model-risk) covers it; the insurance-specific additions are the unfair discrimination testing standard, the market conduct exam as the place it gets checked, and the consumer notice. The model registry itself (`models`, `model_inventory`) belongs to Data, AI & Privacy Rules; this chapter's tables reference it.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `parties`, `products`, `policies`, `policy_transactions`, and `quotes` (Quote, Bind & Issue). This chapter defines `submissions`, `underwriting_rules`, the evaluations and `referrals` they produce, and `inspections`.

```sql
CREATE TABLE submissions (                 -- an application, before and across its quotes
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  applicant_party_id UUID NOT NULL REFERENCES parties (id),
  producer_id        UUID REFERENCES producers (id),
  channel            TEXT NOT NULL,         -- 'direct', 'agent', 'rater', 'mga', 'embedded'
  requested_effective_at TIMESTAMPTZ NOT NULL,
  answers            JSONB NOT NULL,        -- application questions as answered, versioned form
  application_form_id UUID,                 -- forms (Products, Coverages & Forms)
  prefill_provenance JSONB,                 -- per field: source, confirmed or changed
  status             TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'referred',
                       'quoted', 'declined', 'bound', 'withdrawn', 'expired')),
  policy_id          UUID REFERENCES policies (id),  -- once bound
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE underwriting_rules (          -- versioned, dated, owned and cited
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  code               TEXT NOT NULL,         -- 'HO_ROOF_AGE_20', 'PA_DRIVER_UNDER_25'
  version            INT NOT NULL,
  product_ids        UUID[] NOT NULL,
  states             TEXT[] NOT NULL,
  condition          JSONB NOT NULL,        -- expression over submission and report facts
  outcome            TEXT NOT NULL CHECK (outcome IN ('decline', 'refer', 'condition',
                       'tier', 'flag')),
  blocking_point     TEXT CHECK (blocking_point IN ('quote', 'bind', 'issue', 'renewal')),
  authority_level    INT,                   -- minimum level that may approve
  model_id           UUID,                  -- models (Data, AI & Privacy Rules), if a score is read
  filing_ref         TEXT,                  -- e.g. Texas 38.002 guideline filing
  legal_refs         TEXT[] NOT NULL DEFAULT '{}',
  owner              TEXT NOT NULL,
  effective_from     DATE NOT NULL,
  renewal_from       DATE,
  effective_to       DATE,
  UNIQUE (code, version)
);

CREATE TABLE underwriting_evaluations (    -- every rule run, with the facts it read
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID REFERENCES submissions (id),
  quote_id           UUID,
  transaction_id     UUID REFERENCES policy_transactions (id),
  rule_id            UUID NOT NULL REFERENCES underwriting_rules (id),
  facts              JSONB NOT NULL,        -- {"driver_age": 22, "threshold": 25}
  fired              BOOLEAN NOT NULL,
  evaluated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referrals (                   -- a blocking or informational issue to clear
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  evaluation_id      UUID REFERENCES underwriting_evaluations (id),
  policy_id          UUID REFERENCES policies (id),     -- policy-level reasons outlive a job
  scope              TEXT NOT NULL CHECK (scope IN ('job', 'policy')),
  blocking_point     TEXT,
  authority_level    INT,
  status             TEXT NOT NULL CHECK (status IN ('open', 'approved', 'declined',
                       'closed', 'special_closed', 'reopened')),
  approved_value     JSONB,                 -- what was approved; a changed value reopens it
  assigned_to        UUID,
  decided_by         UUID,
  decision_reason    TEXT,
  due_at             TIMESTAMPTZ,
  decided_at         TIMESTAMPTZ
);

CREATE TABLE inspections (                 -- ordered, received, decided, on the state's clock
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID REFERENCES policies (id),
  submission_id      UUID REFERENCES submissions (id),
  kind               TEXT NOT NULL,         -- 'exterior', 'interior', '4_point', 'roof',
                                            -- 'wind_mitigation', 'loss_control'
  requirement_set_on DATE NOT NULL,         -- must predate coverage for Fla. 627.4133(2)(b)3
  ordered_at         TIMESTAMPTZ,
  report_dated       DATE,                  -- Texas: no earlier than 90 days before effective
  received_at        TIMESTAMPTZ,
  decide_by          TIMESTAMPTZ,           -- Texas: rejected before the 11th day or accepted
  decision           TEXT CHECK (decision IN ('accepted', 'accepted_with_conditions',
                       'rejected', 'deemed_accepted')),
  findings           JSONB,
  underwriting_window_ends DATE,            -- last day an underwriting cancellation may issue
  rule_ref           TEXT NOT NULL          -- 'Tex. Ins. Code 551.104(g),(h)'
);
```

A bind is allowed only when no blocking referral is open for that point:

```sql
SELECT NOT EXISTS (
  SELECT 1
  FROM referrals r
  JOIN underwriting_evaluations e ON e.id = r.evaluation_id
  WHERE (e.quote_id = :quote_id OR r.policy_id = :policy_id)
    AND r.status IN ('open', 'reopened')
    AND r.blocking_point IN ('quote', 'bind')
) AS may_bind;
```

Design choices:

- **Evaluations are append-only** and carry the facts, so a decline from last year is explained by last year's rule and facts.
- **Approvals bind to a value.** `approved_value` records what was approved; requoting with a different value reopens the referral.
- **Inspection deadlines are computed from rules** with citations, the same way notice deadlines are ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **A rule that reads a model output names the model and version,** so the AIS program's inventory can list every decision point a model affects.

## Auditing

- **Every guideline version with its owner, dates, products, states and filing reference;** for Texas personal auto and residential property, proof that each change was filed.
- **Every decline, tier placement and condition with the rules and facts behind it,** and the adverse action decision where a consumer report contributed.
- **Every override and approval with the approver's authority level at that time** and the value approved.
- **Every inspection with its requirement date, report date, receipt, decision and deadline,** and every underwriting cancellation tied to one.
- **The AIS program's artifacts:** model inventory, validation and testing records, drift monitoring, vendor due diligence and audit rights, ready for a market conduct exam.

## What This Means for the System You Build

- **Treat guidelines as versioned rules with filing and legal metadata,** and open a filing task when a filed guideline changes.
- **Separate scores from decisions;** rules with thresholds decide, models inform.
- **Record every evaluation and approval with its facts and authority,** and reopen approvals when the approved value changes.
- **Compute inspection and underwriting-period deadlines from state rules** and make the day-count convention explicit.
- **Run every AI-supported decision inside a documented AIS program,** with the inventory pointing at the rules each model feeds.

## References

**Law and regulation**

- [Tex. Ins. Code 38.002](https://texas.public.law/statutes/tex._ins._code_section_38.002), filing of underwriting guidelines for personal auto and residential property, the soundness and unfair discrimination standards, and public information treatment
- [Tex. Ins. Code 38.003](https://texas.public.law/statutes/tex._ins._code_section_38.003), underwriting guidelines for other lines: obtainable by the department, confidential
- [Tex. Ins. Code 551.104](https://texas.public.law/statutes/tex._ins._code_section_551.104), cancellation in the first 60 and 90 days, homeowners inspection reports dated within 90 days, and deemed acceptance before the 11th day
- [Fla. Stat. 627.4133](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4133.html), residential cancellation in the first 60 days and the 60-day window to comply with pre-coverage underwriting requirements
- [N.Y. Ins. Law 3425](https://www.nysenate.gov/legislation/laws/ISC/3425), cancellation for stated reasons in the first 60 days and on listed grounds after
- [HRS 431:10C-207](https://data.capitol.hawaii.gov/hrscurrent/Vol09_Ch0431-0435H/HRS0431/HRS_0431-0010C-0207.htm), prohibited characteristics in motor vehicle rating and underwriting standards

**Regulators and guidance**

- [NY DFS: Insurance Circular Letter No. 7 (2024)](https://www.dfs.ny.gov/industry-guidance/circular-letters/cl2024-07), AI systems and external data in underwriting and pricing: testing, governance, vendors and specific reasons for adverse decisions

**NAIC**

- [NAIC: Model Bulletin, Use of Artificial Intelligence Systems by Insurers (PDF)](https://content.naic.org/sites/default/files/inline-files/2023-12-4%20Model%20Bulletin_Adopted_0.pdf), definitions, the AIS program's governance, risk management and third-party sections, and examination expectations
- [NAIC: Implementation of NAIC Model Bulletin on AI, adoption map (PDF)](https://content.naic.org/sites/default/files/legal-adoption-map-ai-model-bulletin.pdf), 29 adopting jurisdictions with bulletin numbers and dates, and the four state-specific alternatives, as of November 3, 2026

**Filings**

- [Guidewire Software: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), InsuranceSuite products including PolicyCenter and UnderwritingCenter

**Vendor documentation**

- [Guidewire: Underwriting issues in PolicyCenter](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-underwriting-issues/c_underwriting_issues_in_policycenter.html), issues as flags, blocking points at quoting, binding and issuance, value thresholds and approval by greater authority
- [Guidewire: Referral reasons](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-underwriting-issues/c_referral_reasons.html), policy-level referral reasons, closing, special closing and reopening, and issues raised on the next job
- [Socotra: Policy transactions](https://docs.socotra.com/features/policy-management/policy-transactions), transaction progression through validation, pricing and underwriting before issuance
