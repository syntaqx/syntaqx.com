+++
title = "Data, AI & Privacy Rules"
description = "The NAIC AI bulletin and who adopted it, Colorado SB21-169, NY Circular Letter 7, data security Model 668 and Part 500, GLBA and Model 672, insurance scores."
category = "Insurance Industry"
order = 2709
part = "Regulation and Solvency"
tags = ["insurance", "regulation", "artificial-intelligence", "privacy", "cybersecurity", "model-governance"]
+++

Insurance has always discriminated, in the neutral sense: pricing by age of driver, construction type and claim history is the business. What the law forbids is unfair discrimination, and for most of the industry's history that meant a rating factor without actuarial support, or a factor like race that is banned outright. The rules in this chapter are what regulators added when the inputs and the methods changed: external consumer data (credit-based scores, purchase and lifestyle data, telematics, property imagery), predictive models and machine learning that combine hundreds of variables, and generative AI in claims and service. The answer so far has been governance rather than a list of banned algorithms: a written program, an inventory of models, testing for unfair discrimination including through proxies, accountability to the board, responsibility for vendors' models, and documentation an examiner can ask for. Alongside sit the data security and privacy rules every financial institution carries, in insurance-specific form because state insurance regulators enforce them.

This chapter covers the NAIC's AI Model Bulletin and its adoption, Colorado's statute and regulations, New York's Circular Letter No. 7, the Insurance Data Security Model Law (#668) and New York's Part 500, GLBA privacy through the NAIC's Model #672, and credit-based insurance scores at the level of the rule. Which rating factors each state allows is [What You May Rate On](/books/insurance/rating-factors-and-limits); consumer report mechanics, FCRA adverse action notices and *Safeco v. Burr* are [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data); model governance inside underwriting is [Underwriting Rules, Referrals & Models](/books/insurance/underwriting).

## How the Platforms Do It

Regulators' documents define the landscape more than vendors' do, as of November 2026:

| Rule | Who it binds | What it requires |
| --- | --- | --- |
| **NAIC Model Bulletin: Use of AI Systems by Insurers** (adopted December 4, 2023) | Insurers in the 29 jurisdictions that had adopted it as of the NAIC's November 3, 2026 map | A written AIS Program with governance, risk management, model inventories, third-party controls and documentation regulators may request |
| **Colorado SB21-169** (C.R.S. 10-3-1104.9) and 3 CCR 702-10 | Life insurers from November 13, 2023; amendments effective October 15, 2025 extended the framework | No unfair discrimination through external data, algorithms or models on protected classes; a risk management framework, testing and a chief risk officer attestation |
| **New York Insurance Circular Letter No. 7** (July 11, 2024) | Insurers using external consumer data or AI systems in underwriting and pricing in New York | Actuarial validity, proxy discrimination assessment, quantitative metrics, board oversight, vendor responsibility, and specific notice of adverse decisions |
| **Insurance Data Security Model Law (#668)** (2017) | Licensees in adopting states: insurers, producers and other licensees | An information security program from a risk assessment, third-party oversight, 72-hour notice to the commissioner, an annual certification |
| **23 NYCRR 500** (New York cybersecurity regulation, amended effective November 1, 2023) | Covered entities: anyone operating under a license under the Banking, Insurance or Financial Services Law | A cybersecurity program, 72-hour incident notice, 24-hour notice of extortion payments, an April 15 annual filing |
| **GLBA Title V and NAIC Model #672** | Insurers and producers as financial institutions, enforced by state insurance regulators | Initial and annual privacy notices, opt-out for sharing financial information with nonaffiliated third parties, authorization before sharing health information |

What carriers and vendors share, under all of it, is an inventory: every model and external data source, what decisions it touches, in which states, with what testing. The rest of the chapter is what that inventory has to hold.

## The NAIC AI Model Bulletin

The bulletin, adopted by the NAIC on December 4, 2023, is written for a commissioner to issue under existing authority: it reminds insurers that decisions made or supported by AI systems must comply with the state's unfair trade practices, unfair claims settlement practices and rating laws, and sets out what the department expects and may ask for. It applies "regardless of the tools and methods Insurers use."

**The AIS Program.** Each insurer is expected to "develop, implement, and maintain a written program (an 'AIS Program') for the responsible use of AI Systems that make, or support decisions related to regulated insurance practices," designed to mitigate the risk of **Adverse Consumer Outcomes** (a decision subject to insurance regulatory standards that adversely affects a consumer). Its guidelines:

- **Scope:** the whole insurance life cycle ("product development and design, marketing, use, underwriting, rating and pricing, case management, claim administration and payment, and fraud detection") and every phase of an AI system's life cycle from design to retirement, whether the system is built in-house or by "a third-party vendor."
- **Proportionality:** tailored to the insurer's use of AI and the "Degree of Potential Harm to Consumers"; it may sit inside the insurer's ERM program and may rely on a recognized framework such as the NIST AI Risk Management Framework 1.0.
- **Governance:** senior management accountable "to the board or an appropriate committee of the board."
- **Risk management and controls:** oversight and approval of development or acquisition; data practices "including data currency, lineage, quality, integrity, bias analysis and minimization, and suitability"; for predictive models, "Inventories and descriptions," detailed development documentation, and assessments of "interpretability, repeatability, robustness, regular tuning, reproducibility, traceability, model drift"; validation and retesting after implementation; protection of nonpublic information including the models themselves; and data and record retention.
- **Third parties:** due diligence on vendors and their data, and where available contract terms giving audit rights and requiring "the third party to cooperate with the Insurer with regard to regulatory inquiries."
- **Notice:** processes "providing notice to impacted consumers that AI Systems are in use."

**What a regulator may ask for** (section 4) is the bulletin's most concrete part and, for a system, the specification: the written program and evidence of its adoption; the inventories of predictive models and AI systems "used by the Insurer to make or support decisions that can result in Adverse Consumer Outcomes"; for any specific model, the data used with "source, provenance, data lineage, quality, integrity, bias analysis and minimization, suitability, and Data Currency," the techniques, measurements and thresholds applied, and validation, testing and auditing "including evaluation of Model Drift"; and for vendor systems, the due diligence, the contracts and the audits. The bulletin says it doesn't "prescribe specific practices or ... specific documentation requirements," and that insurers may show compliance by other means.

**Adoption.** As of the NAIC's map dated November 3, 2026, 29 jurisdictions had adopted the bulletin: Alaska, Arkansas, Connecticut, Delaware, the District of Columbia, Hawaii, Illinois, Iowa, Kentucky, Maryland, Massachusetts, Michigan, Mississippi, Nebraska, Nevada, New Hampshire, New Jersey, North Carolina, North Dakota, Oklahoma, Pennsylvania, Puerto Rico, Rhode Island, South Carolina, Vermont, Virginia, Washington, West Virginia and Wisconsin, the most recent North Dakota (Bulletin 2026-2, October 5, 2026). Four states have their own insurance-specific rules instead: California (Bulletin 2022-5, June 30, 2022), Colorado (3 CCR 702-10), New York (Circular Letter No. 7) and Texas (Bulletin B-0036-20, September 30, 2020). The Federal Insurance Office's September 2026 report says it monitors state implementation. A bulletin is enforceable only through the department's existing statutory powers; that is why Colorado legislated.

## Colorado: SB21-169

Colorado's statute (SB21-169, signed July 6, 2021, effective September 7, 2021, codified at C.R.S. 10-3-1104.9) is an insurance law aimed specifically at external data and algorithms. It prohibits insurers from "unfairly discriminating based on an individual's race, color, national or ethnic origin, religion, sex, sexual orientation, disability, gender identity, or gender expression" in any insurance practice, and from using external consumer data and information sources, algorithms or predictive models that do so, under rules the commissioner adopts for each type of insurance after a stakeholder process. Those rules require insurers to tell the commissioner what external data sources they use and how, "establish and maintain a risk management framework" to detect unfair discrimination, report the framework's results and remediation, and provide an attestation from the chief risk officer that it is implemented on a continuous basis. Rules could not take effect before January 1, 2023; title insurance, surety bonds and exempt commercial policyholders are excluded.

The governance regulation (3 CCR 702-10, Regulation 10-1-1) took effect for life insurers on November 13, 2023, and the NAIC's map records amendments effective October 15, 2025, which extended the framework beyond life (reported as private passenger auto and health benefit plans). The Division's own pages refused automated access, and the scope of the 2025 amendments and the status of quantitative testing rules are from secondary summaries.<!-- source-gap: co-10-1-1-2025-scope | secondary | Colorado Regulation 10-1-1 as amended effective Oct 15, 2025: extension to private passenger auto and health benefit plans, and status of quantitative testing regulations | closes with: the regulation text or Division bulletin on doi.colorado.gov or the Colorado Code of Regulations | checked: 2026-11-09 -->

## New York: Circular Letter No. 7

New York's DFS finalized Insurance Circular Letter No. 7 on July 11, 2024 (proposed January 17, 2024), covering insurers' use of external consumer data and information sources (ECDIS) and AI systems in underwriting and pricing. It is the most operational of the rules:

- **Actuarial validity.** ECDIS should have "a clear, empirical, statistically significant, rational, and not unfairly discriminatory relationship" to the risk, supported by accepted actuarial standards.
- **Proxy discrimination.** Insurers should assess whether ECDIS correlate with protected classes, using available data or accepted statistical inference, and if so whether the use is justified by legitimate business necessity.
- **A three-step test.** Look for disproportionate adverse effects; if found, look for a legitimate, lawful and fair rationale; search for less discriminatory alternatives, and repeat the search at least annually.
- **Quantitative metrics.** It names adverse impact ratios, denial odds ratios, marginal effects, standardized mean differences, z- and t-tests and drivers-of-disparity methods (Shapley values, sensitivity analysis), with "no expectation that insurers collect additional data" to compute them.
- **Governance.** The board is responsible for oversight and outcomes; senior management for implementation; written policies reviewed at least annually; internal audit covering AI and ECDIS risk management.
- **Vendors.** "The responsibility to comply with anti-discrimination laws remains with the insurer at all times"; contracts should include audit rights and regulator cooperation.
- **Notice.** Disclosures should say whether AI systems and external vendor data are used and that the consumer may request the data behind a decision; an insurer "may not rely on the proprietary nature of a third-party vendor's algorithmic processes" to justify vague adverse action reasons; a declined applicant should get written notice within 15 days with the reasons and a way to review the data.

### Worked Numbers: An Adverse Impact Ratio

An illustration, my numbers, of the first metric the circular letter names. An accelerated underwriting model approves applicants for a preferred class. Using inferred group membership (the circular letter allows accepted statistical inference; the insurer doesn't collect race), the results over a quarter:

| Group | Applicants | Approved preferred | Approval rate |
| --- | --- | --- | --- |
| Group A (highest rate) | 4,000 | 2,880 | 72.0% |
| Group B | 1,500 | 900 | 60.0% |

The adverse impact ratio is the lower group's rate over the highest group's: 60.0% / 72.0% = 0.833. The circular letter names the metric but sets no threshold; a ratio below 1.0 is a disproportionate effect that moves the analysis to step two (is there a legitimate actuarial rationale, documented) and step three (would an alternative model or variable set achieve the same predictive power with a ratio closer to 1.0). What the system needs: the decision record for every applicant with the model version and inputs ([The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record)), a reproducible way to attach inferred group membership for testing without using it in the decision, and a stored test result per model version, period and metric.

## Data Security: Model #668 and Part 500

The **Insurance Data Security Model Law (#668)**, adopted by the NAIC in the fourth quarter of 2017, applies to "Licensees" (insurers, producers and other persons licensed under the insurance code). Its requirements:

- **An information security program** based on a risk assessment, with administrative, technical and physical safeguards proportionate to the licensee's size, complexity and the sensitivity of the nonpublic information it holds, including information held by third-party service providers.
- **Third-party service provider oversight:** due diligence in selecting them and a requirement that they implement appropriate safeguards (the model gave two years from the effective date to implement this part, one year for the rest of the program).
- **An annual certification:** each domestic insurer submits "a written statement by February 15, certifying that the insurer is in compliance," and keeps the supporting records "for a period of five years."
- **Notice to the commissioner** "as promptly as possible but in no event later than 72 hours from a determination that a Cybersecurity Event has occurred," when the state is the insurer's domicile (or a producer's home state), or when the event involves nonpublic information of "250 or more Consumers residing in this State" and either requires notice to another government body or is reasonably likely to materially harm consumers or operations. A third-party provider's event is the licensee's to report.
- **Exceptions:** licensees "with fewer than ten employees, including any independent contractors," are exempt from the program requirements; licensees maintaining a HIPAA information security program are treated as compliant if they certify it.

Adoption is uneven: the NAIC's Summer 2026 state page lists model adoptions in roughly half the states (Alabama, Connecticut, Delaware, Illinois, Indiana, Michigan, Ohio, Pennsylvania, Virginia and Wisconsin among them, by my reading), with others relying on general breach laws or their own rules. New York is the main one with its own: **23 NYCRR 500**, adopted effective March 1, 2017 and amended effective April 22, 2020 and November 1, 2023, which requires covered entities to notify the superintendent "in no event later than 72 hours after determining that a cybersecurity incident has occurred" at the entity, an affiliate or a third-party service provider; to give notice within 24 hours of an extortion payment and a written explanation within 30 days; and to file a certification of material compliance or an acknowledgment of noncompliance by April 15 for the prior year, signed by the highest-ranking executive and the CISO.

The clocks are hours, not business days, and they start at the determination, so the system's incident record needs the determination time as a first-class field:

```go tab="Go"
// NoticeDeadlines returns the regulator deadlines that run from a
// cybersecurity event's determination time. Each regime is a rule row in
// practice; these are the NAIC Model 668 and 23 NYCRR 500.17 values.
type Deadline struct {
	Regime string
	Due    time.Time
}

func NoticeDeadlines(determined time.Time, extortionPaid *time.Time) []Deadline {
	d := []Deadline{
		{"NAIC 668 s6A (adopting states)", determined.Add(72 * time.Hour)},
		{"23 NYCRR 500.17(a)", determined.Add(72 * time.Hour)},
	}
	if extortionPaid != nil {
		d = append(d,
			Deadline{"23 NYCRR 500.17(c) notice", extortionPaid.Add(24 * time.Hour)},
			Deadline{"23 NYCRR 500.17(c) explanation", extortionPaid.AddDate(0, 0, 30)})
	}
	return d
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};

/// Regulator deadlines that run from a cybersecurity event's determination
/// time: NAIC Model 668 and 23 NYCRR 500.17 values, rule rows in practice.
pub struct Deadline {
    pub regime: &'static str,
    pub due: DateTime<Utc>,
}

pub fn notice_deadlines(
    determined: DateTime<Utc>,
    extortion_paid: Option<DateTime<Utc>>,
) -> Vec<Deadline> {
    let mut d = vec![
        Deadline { regime: "NAIC 668 s6A (adopting states)", due: determined + Duration::hours(72) },
        Deadline { regime: "23 NYCRR 500.17(a)", due: determined + Duration::hours(72) },
    ];
    if let Some(paid) = extortion_paid {
        d.push(Deadline { regime: "23 NYCRR 500.17(c) notice", due: paid + Duration::hours(24) });
        d.push(Deadline { regime: "23 NYCRR 500.17(c) explanation", due: paid + Duration::days(30) });
    }
    d
}
```

A determination at 4:00 p.m. on a Friday puts both 72-hour notices at 4:00 p.m. Monday. Consumer notification runs separately under each state's breach notification law, and an insurer with policyholders in many states owes notices on many clocks; the incident response itself belongs to the security playbook ([Sensitive Data](/docs/security/sensitive-data)).

## Privacy: GLBA and Model #672

The Gramm-Leach-Bliley Act's privacy title covers insurers as financial institutions, and state insurance regulators enforce it against "any person engaged in providing insurance" (15 U.S.C. 6805(a)(6)). Many states implement it through the NAIC's **Privacy of Consumer Financial and Health Information Regulation (#672)** (California, for example, at 10 CCR 2689.1 to 2689.24; Alabama, Alaska, Arizona, Arkansas and Colorado are among the others on the NAIC's state page). Its requirements, in the form a system implements:

- **Initial notice** of privacy policies and practices to a customer when the relationship begins, and to a consumer before sharing their information with nonaffiliated third parties.
- **Annual notice** "not less than annually during the continuation of the customer relationship," meaning "at least once in any period of twelve (12) consecutive months"; the model's own example is that a customer who opens an account in year 1 gets an annual notice by December 31 of year 2 if the insurer uses calendar years. A licensee that shares only under the exceptions and hasn't changed its policies is excused from the annual notice.
- **Opt-out** before disclosing nonpublic personal financial information to nonaffiliated third parties outside the exceptions, with "a reasonable means by which the consumer may exercise the opt out right."
- **Opt-in for health information:** a licensee "shall not disclose nonpublic personal health information about a consumer or customer unless an authorization is obtained," except for listed insurance functions such as claims administration and adjustment, underwriting, fraud prevention and reinsurance.

The NAIC has been revising #672 article by article since abandoning a replacement model (#674) in 2024; a law firm's May 2025 summary describes exposure drafts on limits to sharing for targeted marketing, opt-in for sales of information and sensitive personal information, with California's own insurance privacy rules moving in parallel. I have not found a primary source for where that revision stands in November 2026.<!-- source-gap: naic-672-revision-2026 | missing | Status of the NAIC Privacy Protections Working Group's revision of Model #672 as of Nov 2026 | closes with: the working group's page or an adopted model on content.naic.org | checked: 2026-11-09 -->

## Credit-Based Insurance Scores

Credit-based insurance scores are the oldest and most regulated piece of external consumer data in insurance. The NAIC's consumer page (updated March 19, 2026) describes them as scores "used to estimate how likely someone is to file an insurance claim," not to predict repayment, and states the common rule: "In most states, insurers cannot use these scores as the sole reason to increase rates" (or to deny, cancel or nonrenew), while "Some states impose additional restrictions or prohibit certain uses altogether." The state-by-state rules (which lines, which uses, extraordinary life circumstances exceptions, re-scoring on request) are rating factor rules and live in [What You May Rate On](/books/insurance/rating-factors-and-limits); the FCRA side (permissible purpose, adverse action notices) in [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data). For this chapter's purposes they are the template for everything since: an external data source with a statistical relationship to loss, disparities across groups, and a regulatory answer of limits on use plus notice.

## How to Build It

This chapter adds the model inventory every one of these rules asks for, the tests run on each model version, cybersecurity events with their clocks, and privacy notices with their delivery:

```sql
CREATE TABLE models (                      -- predictive models, AI systems, external data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('predictive_model', 'ai_system',
                        'generative_ai', 'external_data_source', 'rules_set')),
  vendor_party_id     UUID REFERENCES parties (id),  -- null if built in-house
  owner               TEXT NOT NULL,        -- the accountable business owner
  description         TEXT NOT NULL,        -- intended goals and objectives
  contract_audit_rights BOOLEAN,            -- AI bulletin s3, 4.2
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE model_versions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  model_id            UUID NOT NULL REFERENCES models (id),
  version             TEXT NOT NULL,
  inputs              JSONB NOT NULL,       -- variables and the data sources behind them
  training_data_ref   TEXT,                 -- lineage: where, when, which cut
  validated_at        TIMESTAMPTZ,
  approved_by         UUID,
  status              TEXT NOT NULL CHECK (status IN ('development', 'approved',
                        'production', 'retired')),
  UNIQUE (model_id, version)
);

CREATE TABLE model_inventory (             -- where each version is used, and under what rules
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id    UUID NOT NULL REFERENCES model_versions (id),
  practice            TEXT NOT NULL CHECK (practice IN ('marketing', 'underwriting',
                        'rating', 'claims', 'fraud', 'service', 'other')),
  line                TEXT NOT NULL,
  jurisdictions       TEXT[] NOT NULL,
  can_cause_adverse_outcome BOOLEAN NOT NULL,
  harm_tier           TEXT NOT NULL CHECK (harm_tier IN ('low', 'medium', 'high')),
  filed_in            UUID[],               -- regulatory_filings, where it is a rating factor
  in_use              DATERANGE NOT NULL
);

CREATE TABLE model_tests (                 -- bias, drift and validation results, per version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id    UUID NOT NULL REFERENCES model_versions (id),
  test_kind           TEXT NOT NULL CHECK (test_kind IN ('adverse_impact_ratio',
                        'denial_odds_ratio', 'standardized_mean_difference', 'drift',
                        'holdout_performance', 'less_discriminatory_alternative')),
  period              DATERANGE NOT NULL,
  method              JSONB NOT NULL,       -- inference method for group membership, etc.
  result              JSONB NOT NULL,       -- {"group_a": 0.72, "group_b": 0.60, "air": 0.833}
  conclusion          TEXT NOT NULL,
  reviewed_by         UUID,
  run_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cybersecurity_events (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID REFERENCES insurers (id),
  detected_at         TIMESTAMPTZ NOT NULL,
  determined_at       TIMESTAMPTZ,          -- the clocks start here
  third_party_party_id UUID REFERENCES parties (id),
  consumers_by_state  JSONB,                -- {"US-OH": 1200, "US-NY": 310}
  extortion_paid_at   TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('investigating', 'determined',
                        'notified', 'closed', 'not_an_event'))
);

CREATE TABLE privacy_notices (             -- every privacy notice owed and sent
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('initial', 'annual', 'revised',
                        'opt_out', 'health_authorization_request')),
  template_version    TEXT NOT NULL,
  due_by              DATE,                 -- annual: within the 12-month period
  document_id         UUID,                 -- documents, as sent, with delivery proof
  sent_at             TIMESTAMPTZ,
  response            TEXT CHECK (response IN ('opted_out', 'authorized', 'declined')),
  responded_at        TIMESTAMPTZ
);
```

Notes:

- **Rating factors from a model are filed.** Where a model's output enters a filed rating plan, `model_inventory.filed_in` ties the version to the filing that approved it ([Filing Rates & Forms](/books/insurance/rate-and-form-filing#how-to-build-it)); a new model version is a rate change in prior approval states.
- **Group membership for testing never enters the decision.** Inferred attributes live in the test pipeline with their method recorded in `model_tests.method`, separate from the features the production model reads.
- **Notification tasks come from `cybersecurity_events`,** one per regime and state from `jurisdiction_rules`, each due from `determined_at`.
- **Opt-outs are honored at the sharing point,** not just recorded: every outbound data feed to a nonaffiliated party checks the party's latest `privacy_notices` response.

## Auditing

- **The inventory as of any date:** every model and external data source in use, by practice, line and state, with the version, owner and the decisions it touched.
- **Every model version's development, validation and test history,** with the data lineage the AI bulletin and Circular Letter 7 ask for and the conclusion of each bias test.
- **Vendor due diligence and contract terms** for each third-party model or data source, including audit and regulator-cooperation rights.
- **Every cybersecurity event** with detection, determination, notices sent per regime and state, and the time each went out against its deadline.
- **The February 15 and April 15 certifications** with the evidence behind them, kept five years under #668.
- **Privacy notices and choices:** every notice owed, sent and how, and every opt-out or authorization and where it was enforced.

## What This Means for the System You Build

- **Keep a model inventory that covers vendors' models and external data,** by practice, line and state; it is the first thing every one of these rules asks for.
- **Version models like rate tables,** and tie the versions used in rating to the filings that approved them.
- **Run and store bias tests per model version and period,** with the method for any inferred attribute and a documented search for less discriminatory alternatives.
- **Put an adverse-decision reason path in every automated decision,** specific enough to meet New York's notice expectations without hiding behind a vendor.
- **Make the cybersecurity determination time a field,** and generate regulator notice tasks per state and regime from it.
- **Treat privacy notices and opt-outs as records with deadlines,** enforced at every outbound data feed.

## References

**Law and regulation**

- [Colorado SB21-169: Restrict Insurers' Use of External Consumer Data](https://leg.colorado.gov/bills/sb21-169), signed July 6, 2021, effective September 7, 2021; protected classes, the risk management framework, chief risk officer attestation, the January 1, 2023 earliest effective date of rules, and exemptions
- [23 NYCRR 500.1](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.1), covered entities as persons licensed under the Banking, Insurance or Financial Services Law
- [23 NYCRR 500.17](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.17), 72-hour notice of cybersecurity incidents, 24-hour notice and 30-day explanation of extortion payments, the April 15 annual filing, and the 2017, 2020 and 2023 dates
- [15 USC 6805](https://www.law.cornell.edu/uscode/text/15/6805), GLBA privacy enforcement by state insurance authorities

**NAIC**

- [NAIC: Model Bulletin, Use of Artificial Intelligence Systems by Insurers, adopted December 4, 2023 (PDF)](https://content.naic.org/sites/default/files/inline-files/2023-12-4%20Model%20Bulletin_Adopted_0.pdf), the AIS Program, Adverse Consumer Outcomes, governance, risk management, model inventories, third-party terms, consumer notice, and what regulators may request
- [NAIC: Implementation of the AI Model Bulletin, status as of November 3, 2026 (PDF)](https://content.naic.org/sites/default/files/legal-adoption-map-ai-model-bulletin.pdf), the 29 adopting jurisdictions with bulletin numbers and dates, and the California, Colorado, New York and Texas rules
- [NAIC: Insurance Data Security Model Law (#668, PDF)](https://content.naic.org/sites/default/files/model-law-668.pdf), the information security program, third-party oversight, February 15 certification, 72-hour notice, the 250-consumer threshold and the fewer-than-ten-employees exception
- [NAIC: Insurance Data Security Model Law state page, Summer 2026 (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-668.pdf), model adoptions and related activity by state
- [NAIC: Privacy of Consumer Financial and Health Information Regulation (#672, PDF)](https://content.naic.org/sites/default/files/model-law-672.pdf), initial and annual notices, the 12-month definition and example, opt-out notices, and authorization for health information
- [NAIC: Privacy of Consumer Financial and Health Information Regulation state page, Spring 2024 (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-672.pdf), state adoptions including California's 10 CCR 2689.1 to 2689.24
- [NAIC: Credit-based insurance scores](https://content.naic.org/insurance-topics/credit-based-insurance-scores), what the scores estimate and the common sole-reason limit, updated March 19, 2026

**Regulators and guidance**

- [New York DFS: Insurance Circular Letter No. 7 (2024)](https://www.dfs.ny.gov/industry-guidance/circular-letters/cl2024-07), actuarial validity, proxy discrimination, the three-step assessment, quantitative metrics, governance, vendor responsibility, disclosure and the 15-day adverse decision notice
- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), FIO's monitoring of state AI bulletin implementation

**In practice**

- [Willkie Farr & Gallagher: Latest Developments on Insurance Privacy Laws, May 29, 2025](https://www.willkie.com/publications/2025/05/latest-developments-on-insurance-privacy-laws), the NAIC's article-by-article revision of Model #672 and California's parallel insurance privacy work
