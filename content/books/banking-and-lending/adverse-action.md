+++
title = "Adverse Action & Explaining Decisions"
nav_title = "Adverse Action"
description = "ECOA and FCRA notices after a decline: when one is owed, specific reasons, score disclosure, risk-based pricing, reasons from scorecards and models."
category = "Banking & Lending Industry"
order = 2445
part = "Origination and Underwriting"
tags = ["banking", "lending", "adverse-action", "ecoa", "fcra", "explainability"]
+++

A lender that says no has to say why. Two federal laws require it, for different reasons. The Equal Credit Opportunity Act requires the creditor to state the specific principal reasons it declined, so that an applicant can tell whether they were judged on their credit or on who they are, and can fix what can be fixed. The Fair Credit Reporting Act requires a user of a consumer report to tell the applicant the report played a part, which agency supplied it, the score it used and its key factors, so that the applicant can get the report and dispute what's wrong. One notice usually carries both, and the system has to generate it from the decision itself: the reasons must be the factors that actually drove the outcome, which is easy for a six-attribute scorecard and hard for a model with thousands of variables.

This chapter covers when a notice is owed, what the ECOA part must say and how specific the reasons must be, what the FCRA adds (score disclosure, agency information, third-party data, risk-based pricing and the credit score disclosure exception), business credit, building reasons from scorecards with a worked example, building reasons from machine-learning models, the CFPB circulars on algorithmic reasons and their 2025 withdrawal, and timing and delivery. The decision that produces the reasons is [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines); the score and its key factors come from [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores). Testing reasons and outcomes for discrimination is [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending); validating the model that produces them is [Model Risk Management](/books/banking-and-lending/model-risk). Property Tech's [Adverse action notices](/books/property-tech/applications-and-screening#adverse-action-notices) applies the FCRA half of this to tenant screening.

## How the Platforms Do It

As of October 2026, from regulators' forms and vendors' public pages:

| Source | What it provides | Notes |
| --- | --- | --- |
| **CFPB Regulation B sample forms** | Forms C-1 to C-8: notices of action taken with a reasons checklist, a credit scoring version, a counteroffer version, the right to request reasons, the incompleteness notice, business credit versions | Using them properly satisfies the notice content rules, but a checked box that isn't the actual reason doesn't |
| **FICO, VantageScore** | Key factor codes returned with every score | The FCRA's key factors, not ECOA reasons |
| **Plaid Check (LendScore)** | A cash-flow score with "the top five reasons the score is not higher, for use in adverse action notices" | Plaid Check is a consumer reporting agency, so the notice names it |
| **Nova Credit (Cash Atlas)** | Cash-flow attributes carrying adverse action codes | Lenders make the decision and send the notice; Nova handles disputes |
| **MeridianLink** | An adverse-action experience ("Pathway") in its consumer lending suite | Sold beside its LOS and decision engine |
| **Model diagnostic vendors** | Explanation tools for machine-learning underwriting models | FinRegLab's 2023 study evaluated seven (Arthur, H2O.ai, Fiddler, RelationalAI, SolasAI, Stratyfy, Zest AI) plus open-source tools for adverse action, fair lending and model risk uses |

Two patterns stand out. **Every data product now ships reasons,** because a lender can't use a score or attribute it can't explain in a notice. **Score factors and decision reasons are different things:** a bureau score's key factors describe the score; the ECOA reasons describe the lender's decision, which may have turned on DTI or a policy rule the score never saw. A notice that lists only the score's factors is incomplete.

## When a Notice Is Owed

Regulation B requires notice of the action taken on every application, approval included, within 30 days after a completed application (12 CFR 1002.9(a)(1)). The notice gets its content requirements when the action is **adverse action**: "a refusal to grant credit in substantially the amount or on substantially the terms requested," a termination of an account or an unfavorable change in its terms that doesn't affect all or substantially all of a class of accounts, and a refusal to increase a line on request (1002.2(c)). The cases a system must recognize:

| Situation | What's owed | When |
| --- | --- | --- |
| Decline of a completed application | Adverse action notice | Within 30 days of completion |
| Counteroffer the applicant doesn't accept or use | Adverse action notice (often combined with the counteroffer) | Within 90 days after the counteroffer |
| Incomplete application | A decision, or a notice of incompleteness naming what's needed | Within 30 days of receipt |
| Adverse action on an existing account (a line decrease or closure for credit reasons) | Adverse action notice | Within 30 days of taking the action |
| Prequalification evaluated and declined | Treated as an application: adverse action notice | Within 30 days |
| Approval at the requested terms | Notice of approval (the loan documents usually serve) | Within 30 days |

Exclusions matter as much: a change in terms that affects a whole class of accounts, action taken because of inactivity, default or delinquency on the account, and a refusal of a single transaction at a point of sale on an existing account aren't adverse action under Reg B. Joint applicants may receive one notice, sent to the primary applicant where one is readily apparent (1002.9(f)). When an application passes through a third party to several creditors (an auto dealer sending to five lenders, a marketplace routing to partners), a single notice may serve if it names each creditor that took adverse action; and if the applicant accepts any creditor's offer, the others owe nothing (1002.9(g)). The FCRA's duty is triggered separately: any adverse action based in whole or in part on a consumer report, which includes the line decrease and the counteroffer.

## What the ECOA Notice Says

The written notice must state the action taken, the creditor's name and address, the ECOA notice (a statement substantially like the regulation's model text that the law prohibits discrimination on the listed bases, naming the federal agency that administers compliance for this creditor), and either **a statement of specific reasons** or **a disclosure of the right to one**: if the applicant asks within 60 days, the creditor must give the reasons within 30 days, and the disclosure must name the person or office to ask (1002.9(a)(2)). Most lenders state the reasons in the notice, because the request path is a second workflow with its own clock.

How specific the reasons must be:

- **Specific and principal.** Statements that the decision was based on the creditor's internal standards or policies, or that the applicant failed to achieve a qualifying score on the creditor's scoring system, are insufficient (1002.9(b)(2)). "Insufficient score" isn't a reason; the factors that made the score insufficient are.
- **Accurate.** The reasons must relate to and accurately describe the factors actually considered or scored (comment 9(b)(2)-2). Checking the closest box on a sample form isn't enough if it isn't the real factor; the creditor adds the real factor or uses "Other" and specifies it.
- **Not more than about four.** No number is required, but disclosing more than four reasons "is not likely to be helpful" (comment 9(b)(2)-1).
- **No need to explain the link.** "Length of residence" suffices without explaining why it matters (comment 9(b)(2)-3).
- **The FCRA disclosure doesn't satisfy it.** Saying a credit report was used, or listing the score's key factors, doesn't state the ECOA reasons; if delinquent obligations were the reason, the notice says so (comment 9(b)(2)-9).
- **Automatic denials name their factor.** If a policy rule declines automatically (a bankruptcy, a residency requirement), that factor is the reason (comment 9(b)(2)-8).

Form C-1's checklist shows the vocabulary examiners expect: "Credit application incomplete," "Unable to verify income," "Excessive obligations in relation to income," "Length of employment," "No credit file," "Limited credit experience," "Delinquent past or present credit obligations with others," "Number of recent inquiries on credit bureau report," "Value or type of collateral not sufficient," among 24 items ending in "Other, specify."

## What the FCRA Adds

When adverse action is based in whole or in part on a consumer report, the user must give notice (oral, written or electronic) and, in writing or electronically (15 U.S.C. 1681m(a)):

- **The credit score** used, if a score was used, with its range, up to four key factors (five where the number of inquiries is one of them), the date it was created and who created it (1681g(f)).
- **The agency's name, address and telephone number,** toll-free for a nationwide agency, for every agency whose report contributed, and a statement that the agency didn't make the decision and can't explain it.
- **The right to a free copy** of the report from that agency within 60 days, and **the right to dispute** its accuracy or completeness.

Two more duties sit beside it:

- **Information from someone other than an agency.** When credit is denied or its cost increased because of information from a third party that isn't a consumer reporting agency, the creditor must disclose its nature on a written request made within 60 days, and must tell the applicant of that right in the notice (1681m(b)).
- **Risk-based pricing.** A creditor that uses a consumer report to grant credit on terms "materially less favorable than the most favorable material terms available to a substantial proportion of consumers" must give a risk-based pricing notice (1681m(h); 12 CFR 1022.72). It may identify who gets one by direct comparison, by a **credit score proxy** (a cutoff above which about 40% of its consumers score, recalculated at least every two years; everyone below gets a notice), or by **tiered pricing** (with four or fewer tiers, everyone outside the top tier; with five or more, everyone outside the top two tiers plus any further tiers needed to make the top group 30% to 40% of all tiers). No notice is needed if the consumer applied for and got specific terms, if an adverse action notice is given, or for a prescreened firm offer (1022.74(a) to (c)).

Most lenders don't run the comparison. They use the **credit score disclosure exception**: give every applicant a notice with their score, its range, its date and source, and a statement of where it falls, and no risk-based pricing notice is required (1022.74(d) for loans secured by one to four units of residential real property, 1022.74(e) for other credit); if no score was available from the agency the lender normally uses, a separate notice says so (1022.74(f)). Model forms H-3 to H-5 are optional safe harbors. Mortgage lenders also owe every applicant the **notice to the home loan applicant** with the scores and key factors they obtained (1681g(g)), whatever the decision. Section 1681m(h)(8) says the FCRA's civil liability sections don't apply to failures to comply with section 1681m, leaving its enforcement to the agencies.

## Business Credit

Reg B's notice rules relax for business credit (1002.9(a)(3)). For a business with gross revenues of $1 million or less in its last fiscal year, the creditor may give notice orally or in writing and may disclose the right to request reasons at application, and for a telephone application an oral statement of the action and of the right to reasons is enough. For a business over $1 million (and for trade credit, factoring and similar credit), notice may be oral or written within a reasonable time, with written reasons and the ECOA notice if the applicant asks in writing within 60 days. A creditor may rely on the applicant's stated revenue, and may apply the consumer rules or the $1 million rule to all its business credit for simplicity. A creditor that received 150 or fewer applications in the preceding calendar year may give oral notices (1002.9(d)). The FCRA's 1681m(a) duty attaches to a consumer report on the guarantor or owner when it contributes. [Small Business Lending](/books/banking-and-lending/small-business-lending) covers the product side.

## Building Reasons From Scorecards

For a points-based scorecard, Reg B's commentary describes methods without mandating one (comment 9(b)(2)-5). One identifies the factors where the applicant's score fell furthest below the average score of applicants who scored at or slightly above the minimum passing score; another uses the average of all applicants. Any substantially similar method is acceptable. Reasons must come from scored factors only, and a principal reason may not be left out because its link to creditworthiness seems weak (comment 9(b)(2)-4).

**Worked numbers (mine).** A scorecard with a cutoff of 200 points. The applicant scored 184 and was declined. The comparison group is applicants who scored 200 to 205:

| Attribute | Applicant's points | Comparison average | Shortfall | Reason statement |
| --- | --- | --- | --- | --- |
| Revolving utilization (82%) | 18 | 41 | **23** | Proportion of balances to credit limits too high |
| Months since most recent delinquency (7) | 22 | 38 | **16** | Delinquent past or present credit obligations with others |
| Inquiries in last 6 months (5) | 21 | 30 | **9** | Number of recent inquiries on credit bureau report |
| Age of oldest account (4 years) | 31 | 36 | **5** | Limited credit experience |
| Debt-to-income (31%) | 44 | 41 | (above average) | |
| Time at current employer (6 years) | 48 | 39 | (above average) | |
| **Total** | **184** | | | |

The four reasons, in order, are the four attributes with the largest shortfalls. The two attributes where the applicant beat the comparison group don't appear. The score's own bureau key factors go in the FCRA part of the notice separately, even if they overlap. If the decision had instead failed a policy rule (DTI above the product's maximum) before scoring, the reason would be "Excessive obligations in relation to income" alone, from the rule, and the scorecard's shortfalls wouldn't apply.

Two engineering rules follow. **The reason must be computed from the decision's own frozen inputs and model version,** at decision time, and stored; regenerating it later from a newer model gives a different, wrong answer. **The mapping from attribute to reason statement is versioned data** reviewed by compliance, because the statement is what the applicant reads.

## Reasons From Machine-Learning Models

A gradient-boosted model or a neural network has no points table, so a lender needs another way to find the factors that drove a particular applicant's score. The common approach is a per-applicant attribution: estimate each input's contribution to this prediction relative to a reference, then rank. SHAP (Lundberg and Lee, 2017) is the most widely cited method, assigning each feature an importance value for a particular prediction; Reg B's comparison-group method maps onto it naturally if the reference is the population near the cutoff.

What makes it harder than a scorecard:

- **Correlated features split the credit.** Fifty utilization-related variables can each contribute a little, so no single one ranks in the top four even though utilization drove the decline. Group features into **reason families** before ranking, and rank families.
- **Interactions.** A feature can hurt only in combination with another; the attribution has to assign the joint effect somewhere, and the reason statement must still describe something the applicant would recognize.
- **Stability.** Attribution methods have parameters (the reference, sampling), and two tools can rank the same applicant's factors differently. FinRegLab's 2023 empirical study evaluated model diagnostic tools from seven vendors and open-source libraries specifically for the information they produce for adverse action notices, fair lending and model risk management; the choice of tool and its settings is a validated part of the model, not a reporting detail.
- **Statements must stay specific.** "Insufficient cash flow" is too vague in the same way "insufficient score" is; "Recurring deposits too low relative to obligations" or "Overdrafts in the last 90 days" names something.

**The CFPB circulars.** Circular 2022-03 (May 26, 2022; 87 FR 35864) said creditors using complex algorithms must still give specific and accurate reasons, and that "a creditor's lack of understanding of its own methods is therefore not a cognizable defense." Circular 2023-03 (89 FR 27361, April 17, 2024) said a creditor can't rely on the sample forms' checklist when the listed reasons don't reflect the actual factors, which matters for models that use alternative data. On May 12, 2025, the CFPB withdrew both, among 67 guidance documents, saying withdrawn guidance "should not be enforced or otherwise relied upon by the Bureau while this review is ongoing" and that the withdrawal "is not necessarily final" (90 FR 20084). The 2023-03 page is marked archived; the 2022-03 page was still online with no label in October 2026.

The withdrawal changed guidance, not the regulation. Section 1002.9(b)(2) and its commentary, which say reasons must be specific and must accurately describe the factors actually considered or scored, are unchanged, and the 2026 Regulation B rule amended the effects test, discouragement and special purpose credit programs but not 1002.9. My reading as of October 2026: the circulars were explanations of rules that still bind, so a system built to their standard is built to the regulation's. State regulators and private plaintiffs enforce ECOA too.

## Worked Numbers: The Notice Clocks

An illustration of my own:

- **Completed application June 1; declined June 3.** The notice is due by **July 1** (30 days after completion). Sending it on June 3, with the decision, is the default; the deadline is a ceiling.
- **Counteroffer June 5** of $8,000 instead of the $12,000 requested, which the applicant ignores. The adverse action notice is due by **September 3** (90 days after the counteroffer). The counteroffer notice and the adverse action statement can be one document (Form C-4).
- **Line decrease on an existing card account, July 10,** because a periodic soft review found new delinquencies elsewhere. The notice is due by **August 9**, and because a consumer report drove it, it carries the FCRA disclosures ([Credit Limits](/books/banking-and-lending/credit-cards#credit-limits) covers the over-limit protections).
- **A notice sent July 1 gives the right to request reasons** instead of stating them; the applicant writes on August 20, inside the 60 days. The reasons are due by **September 19** (30 days after the request).

Each date is a stored deadline on the notice, computed from its trigger ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Timing and Delivery

- **Send with the decision.** Generating the notice in the same transaction as the decline removes the 30-day risk entirely; a separate batch is where notices go missing.
- **Electronic delivery needs E-SIGN consent** obtained before delivery, or the notice goes by mail ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).
- **One notice for both laws** is normal and the CFPB's forms combine them; the ECOA reasons and the FCRA score factors are separate sections.
- **Name the right creditor.** In a bank partnership the lender of record is the creditor on the notice, and the agency named in the ECOA notice is that creditor's regulator.
- **Keep it.** The notice and statement of reasons are retained with the application for 25 months (12 months for most business credit), longer if an investigation or lawsuit is pending (1002.12(b)).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `credit_decisions.reasons` holds the principal reasons in order, and `disclosures` (kind `adverse_action`) stores each rendered notice as delivered. Upstream, `decision_rule_results` and `model_outputs` from [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines#how-to-build-it) produce the reason codes, and `credit_scores` and `credit_report_pulls` from [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores#how-to-build-it) supply the score, key factors and agencies. This chapter adds the reason catalog and its mapping from features, the notices with their clocks, and reason requests. Property Tech's `adverse_action_notices` is the FCRA-only subset of `decision_notices` here.

```sql
CREATE TABLE reason_codes (                  -- the statements an applicant reads, versioned
  code                TEXT NOT NULL,          -- 'R_UTILIZATION_HIGH', 'R_DTI_EXCESSIVE', ...
  version             INT NOT NULL,
  statement           TEXT NOT NULL,          -- 'Proportion of balances to credit limits too high'
  regb_form_item      TEXT,                   -- the Form C-1 item it corresponds to, if any
  approved_by         TEXT NOT NULL,          -- compliance sign-off
  effective_from      DATE NOT NULL,
  effective_to        DATE,
  PRIMARY KEY (code, version)
);

CREATE TABLE feature_reason_map (            -- model features and rules to reason families
  model_key           TEXT NOT NULL,          -- or 'policy' for rule-based reasons
  model_version       TEXT NOT NULL,
  feature             TEXT NOT NULL,          -- 'util_rev_6m_max', 'rule:max_dti', ...
  reason_code         TEXT NOT NULL,
  reason_version      INT NOT NULL,
  PRIMARY KEY (model_key, model_version, feature),
  FOREIGN KEY (reason_code, reason_version) REFERENCES reason_codes (code, version)
);

CREATE TABLE decision_notices (              -- every notice a decision owes, with its clock
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  credit_decision_id  UUID REFERENCES credit_decisions (id),
  application_id      UUID REFERENCES applications (id),
  account_id          UUID REFERENCES accounts (id),          -- existing-account action
  kind                TEXT NOT NULL CHECK (kind IN ('adverse_action', 'counteroffer',
                        'incompleteness', 'approval', 'risk_based_pricing',
                        'credit_score_disclosure', 'no_score_available',
                        'mortgage_score_disclosure')),
  trigger_at          TIMESTAMPTZ NOT NULL,   -- completion, counteroffer, account action
  due_on              DATE NOT NULL,          -- computed from the rule and the trigger
  rule_ref            TEXT NOT NULL,          -- '1002.9(a)(1)(i)', '1002.9(a)(1)(iv)', '1022.74(e)', ...
  creditor_institution_id UUID NOT NULL REFERENCES institutions (id),  -- the lender of record
  recipient_party_id  UUID NOT NULL REFERENCES parties (id),
  reasons_mode        TEXT CHECK (reasons_mode IN ('stated', 'right_to_request')),
  disclosure_id       UUID REFERENCES disclosures (id),       -- the rendered notice as delivered
  sent_at             TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'not_required',
                        'superseded'))
);

CREATE TABLE notice_reasons (                -- ECOA reasons as stated, in order
  notice_id           UUID NOT NULL REFERENCES decision_notices (id),
  rank                SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 8),
  reason_code         TEXT NOT NULL,
  reason_version      INT NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('policy_rule', 'model', 'underwriter')),
  attribution         NUMERIC(10, 4),         -- shortfall or contribution that ranked it
  PRIMARY KEY (notice_id, rank),
  FOREIGN KEY (reason_code, reason_version) REFERENCES reason_codes (code, version)
);

CREATE TABLE notice_report_disclosures (     -- FCRA: each agency and score that contributed
  notice_id           UUID NOT NULL REFERENCES decision_notices (id),
  pull_id             UUID NOT NULL REFERENCES credit_report_pulls (id),
  score_id            UUID REFERENCES credit_scores (id),     -- the score used, if any
  PRIMARY KEY (notice_id, pull_id)
);

CREATE TABLE reason_requests (               -- when the notice offered reasons on request
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  notice_id           UUID NOT NULL REFERENCES decision_notices (id),
  kind                TEXT NOT NULL CHECK (kind IN ('ecoa_reasons', 'third_party_information',
                        'business_written_reasons')),
  received_at         TIMESTAMPTZ NOT NULL,
  within_window       BOOLEAN NOT NULL,       -- 60 days from the notice
  response_due_on     DATE,                   -- 30 days for ECOA reasons
  response_disclosure_id UUID REFERENCES disclosures (id),
  responded_at        TIMESTAMPTZ
);
```

The notice is created in the same transaction as the decision that owes it, with `due_on` computed and `status = 'pending'`, so a decision without its notice can't exist; a delivery job sends pending notices and a monitor alerts on any past `due_on` ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). Reasons are computed once, from `decision_rule_results` for policy failures and from `model_outputs.contributions_ref` grouped through `feature_reason_map` for model declines, ranked, capped and stored in `notice_reasons` with the attribution that ranked them; the rendered document is a `disclosures` row. A counteroffer creates a `counteroffer` notice and a pending `adverse_action` notice due in 90 days, which is marked `not_required` if the applicant accepts. `notice_report_disclosures` lists every agency whose report contributed, so a decline that used a tri-merge names all three. The reason catalog is versioned and approved by compliance; changing a statement creates a new version and never edits one already sent ([Explanations and Appeals](/docs/architecture/risk-scoring#explanations-and-appeals)).

## Auditing

Adverse action files are among the first things a fair lending or consumer compliance exam samples ([Audit Trails](/docs/architecture/audit-trails)). Make sure the record shows:

- **Every notice owed,** with its trigger, rule, due date, sent date and the rendered document as delivered.
- **The reasons as stated,** each traceable to the rule result or model attribution that produced it, under the model and reason catalog versions in force.
- **Every agency and score disclosed,** matched to the pulls that contributed.
- **Counteroffers and their outcome,** and the 90-day notice where not accepted.
- **Risk-based pricing or score disclosure notices** for approvals, and the method used to decide who gets them.
- **Reason requests** and third-party information requests, received and answered, against their windows.
- **The creditor named** on each notice, matching the lender of record.
- **Decisions without a notice:** there should be none, and a query proving it.
- **Retention** for 25 months (12 for business credit) or longer on legal hold.

## What This Means for the System You Build

- **Create the notice with the decision,** in one transaction, with its due date stored.
- **Compute reasons from the decision's own inputs and model version** and store them; never regenerate them later.
- **Keep ECOA reasons and FCRA score factors separate,** and include both.
- **Rank model reasons by reason family,** not raw feature, with a validated attribution method and a versioned feature-to-reason map.
- **Write specific reason statements,** approved by compliance, and version them.
- **Name every agency that contributed** and the score used, and give the score disclosure to every applicant if relying on the exception.
- **Track counteroffers to acceptance** and send the 90-day notice when they lapse.
- **Build to the circulars' standard** even though they were withdrawn; the regulation they explained still applies.

## References

**Law and regulation**

- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), timing, content, specific reasons and their commentary, incomplete applications, business credit, multiple applicants and third parties
- [CFPB: Regulation B § 1002.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/), adverse action and its exclusions
- [CFPB: Regulation B Appendix C, sample notification forms](https://www.consumerfinance.gov/rules-policy/regulations/1002/c/), Forms C-1 to C-10, the C-1 checklist, and proper use
- [CFPB: Regulation B § 1002.12, record retention](https://www.consumerfinance.gov/rules-policy/regulations/1002/12/), 25 and 12 months and legal holds
- [Cornell LII: 15 U.S.C. § 1681m, requirements on users of consumer reports](https://www.law.cornell.edu/uscode/text/15/1681m), adverse action disclosures, third-party information, risk-based pricing notices and their administrative enforcement
- [Cornell LII: 15 U.S.C. § 1681g, disclosures to consumers](https://www.law.cornell.edu/uscode/text/15/1681g), score disclosure content, the inquiries exception and the notice to the home loan applicant
- [CFPB: Regulation V § 1022.72, general requirements for risk-based pricing notices](https://www.consumerfinance.gov/rules-policy/regulations/1022/72/), direct comparison, the credit score proxy and tiered pricing methods
- [CFPB: Regulation V § 1022.74, exceptions](https://www.consumerfinance.gov/rules-policy/regulations/1022/74/), specific terms, adverse action, prescreened offers, the credit score disclosure exceptions and no score available
- [Federal Register: Equal Credit Opportunity Act (Regulation B), 91 FR 21620 (April 22, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/04/22/2026-07804.txt), the sections amended, which don't include 1002.9

**Regulators and guidance**

- [CFPB: Circular 2022-03, adverse action notification requirements in connection with credit decisions based on complex algorithms](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/), the holding quoted and the page's status in October 2026
- [CFPB: Circular 2023-03, adverse action notification requirements and the proper use of the sample forms](https://www.consumerfinance.gov/compliance/circulars/circular-2023-03-adverse-action-notification-requirements-and-the-proper-use-of-the-cfpbs-sample-forms-provided-in-regulation-b/), marked archived
- [Federal Register: Interpretive rules, policy statements, and advisory opinions; withdrawal, 90 FR 20084 (May 12, 2025)](https://www.federalregister.gov/documents/full_text/text/2025/05/12/2025-08286.txt), both circulars withdrawn, not enforced during review, not necessarily final

**Research**

- [Lundberg and Lee: A unified approach to interpreting model predictions (2017)](https://arxiv.org/abs/1705.07874), SHAP feature attributions for individual predictions
- [FinRegLab: Machine learning explainability and fairness, insights from consumer lending (July 13, 2023)](https://finreglab.org/research/machine-learning-explainability-fairness-insights-from-consumer-lending/), the evaluation of seven vendors' and open-source diagnostic tools for adverse action, fair lending and model risk

**Vendor documentation**

- [Plaid: Plaid Check documentation](https://plaid.com/docs/check/), LendScore's top five reasons for adverse action notices
- [Nova Credit](https://www.novacredit.com/), lenders sending adverse action notices and Nova handling disputes
- [Nova Credit: Cash Atlas](https://www.novacredit.com/cash-atlas), adverse action codes on cash-flow attributes
- [MeridianLink](https://www.meridianlink.com/), the Pathway adverse-action experience
