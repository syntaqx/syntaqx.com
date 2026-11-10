+++
title = "Life Underwriting"
description = "Traditional evidence, accelerated triage, MIB, prescription histories, MVRs and mortality scores under the FCRA, Colorado 10-1-1, genetic and HIV rules."
category = "Insurance Industry"
order = 2761
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "underwriting", "fcra", "mib", "accelerated-underwriting"]
+++

Life underwriting decides one thing that can't be changed later: the rate class. A property insurer that misprices a homeowner can re-underwrite at renewal; a life insurer that issues a 20-year level term policy at preferred rates is bound to those rates for twenty years, and after the contestable period it can't rescind the policy even if the application was wrong. So life underwriting front-loads evidence. For most of the industry's history that meant a paramedical exam, blood and urine, an attending physician's statement for anyone with a history, and weeks of waiting. Increasingly, carriers triage instead: they pull data they can get in seconds (the MIB, a prescription history, a motor vehicle record, a credit-based mortality score, sometimes medical claims and electronic health records), run it through a rules engine, and issue the cleanest applicants without an exam or fluids, sending the rest to traditional underwriting.

Every one of those data sources comes with law attached. The MIB, prescription history vendors and score providers are consumer reporting agencies under the Fair Credit Reporting Act, so each pull needs a permissible purpose and each adverse decision a notice; medical information in a consumer report needs the applicant's affirmative consent; pharmacy and medical records need a HIPAA authorization; Colorado requires a governance and testing framework for algorithms that use external consumer data; and states bar the use of genetic test results and regulate HIV testing. This chapter covers the evidence, the triage, the data sources and their rules, the decision and its notices, with the `evidence_orders` and `rate_class_decisions` tables against the core model's `submissions` and `parties`. The rating and model governance rules for all lines live in the Rating and Underwriting and Regulation and Solvency parts ([What You May Rate On](/books/insurance/rating-factors-and-limits); [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data#how-to-build-it); [Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules#how-to-build-it)); this chapter covers what life adds.

## How the Platforms Do It

What life underwriting data and platform vendors publish, as of November 2026:

| Vendor | Product | What its public material shows |
| --- | --- | --- |
| **MIB** | Member database of coded underwriting findings; Disability Income Record System | A file "generally exists" only if the consumer applied for individually underwritten coverage with a member in the past seven years and underwriting-significant information was found; group, guaranteed issue and ACA plans don't create one; members can't decide on the file "without further investigation"; a nationwide specialty consumer reporting agency under the FCRA with a free annual disclosure; DIRS holds disability income applications and coverage reported within the past 5 years |
| **Milliman IntelliScript** | Irix Identified Data Suite: Rules Engine; mortality, morbidity and LTC risk scores; prescription, medical claims, EHR, criminal and credit data; ReCheck for post-issue review and agent monitoring | "offers consumer reports and related services regulated by the Fair Credit Reporting Act" and other data that isn't; "does not make the decision to grant or deny insurance" |
| **ExamOne** (ScriptCheck) | Prescription history from pharmacy benefit managers | Claims "regardless of where they fill their prescriptions," including mail order and specialty; a HIPAA-compliant authorization in the application, "signed and dated prior to accessing the information" |
| **LexisNexis Risk Solutions** (Risk Classifier) | A numeric mortality risk score from public records, driving history and credit | "a consumer reporting agency product" that "may only be accessed in compliance with the Fair Credit Reporting Act"; system-to-system or batch; carriers set custom thresholds to triage |
| **iPipeline** (Resonant) | Underwriting automation | Named as its flagship; customizes and automates the underwriting process |
| **Hexure** (FireLight) | E-application | Collects the application and authorizations that the evidence orders depend on |

Three patterns run through the table. **Every data vendor says it doesn't decide.** IntelliScript and LexisNexis both say so, and the MIB bars decisions on its codes alone; the decision, its rules and its notices are the insurer's. **The data is regulated as consumer reports,** so the insurer's system carries the FCRA's duties (purpose, consent for medical information, adverse action, disputes), not the vendor's. **Monitoring doesn't end at issue.** IntelliScript sells ReCheck for post-issue review, because the contestable period gives the insurer two years to find what the application left out ([Death Claims & Unclaimed Benefits](/books/insurance/death-claims-and-unclaimed-benefits#the-contestable-period)).

## Traditional Evidence

Traditional underwriting gathers evidence scaled to the applicant's age and face amount, on a grid each carrier publishes to its producers:

- **The application** (Part 1, personal and financial; Part 2, medical history and lifestyle), with authorizations: an FCRA disclosure, a HIPAA authorization for medical and pharmacy records, and the MIB notice.
- **Paramedical exam**: height, weight, blood pressure, pulse, sometimes an EKG, taken by an examiner at home or work.
- **Labs**: blood and urine profiles (lipids, glucose and HbA1c, liver and kidney function, nicotine and cotinine, HIV with consent, drug screens).
- **Attending physician statement (APS)**: records ordered from the applicant's doctors under the HIPAA authorization, for anyone with a disclosed condition or above an age and amount threshold. The APS is the slowest piece, often weeks.
- **Financial underwriting** for large face amounts: income, net worth, business purpose, existing coverage, to keep the face amount in line with an insurable interest.
- **Inspection reports** and tele-interviews.

The underwriter (or the rules engine, for the clean cases) weighs the evidence against the carrier's underwriting manual, usually built with its reinsurers, and assigns a class.

## Rate Classes and Ratings

The output is a rate class on the carrier's scale: some form of preferred plus, preferred, standard plus and standard, each split into tobacco and non-tobacco; then **substandard** (table) ratings above standard; plus **flat extras**, a fixed charge per $1,000 of face for a specific risk (an avocation, a recent cancer history) sometimes for a limited number of years; and **postpone** or **decline**. The definitions of each table and the criteria for each class are the carrier's, filed as part of the product's rate filing where the state requires it.

**Worked numbers: a rated premium.** Mine, on illustrative rates: a $500,000 20-year term policy with a standard non-tobacco annual rate of $2.10 per $1,000 and a $60 policy fee, at a carrier whose rate manual defines each substandard table as an extra 25% of standard mortality cost (so Table 4 is +100%), with a $2.50 per $1,000 flat extra for three years for a private pilot.

| Decision | Calculation | Annual premium |
| --- | --- | ---: |
| Standard non-tobacco | 500 × $2.10 + $60 | $1,110.00 |
| Table 4 | 500 × $2.10 × 2.00 + $60 | $2,160.00 |
| Table 4 with the flat extra, years 1 to 3 | 2,160.00 + 500 × $2.50 | $3,410.00 |
| Table 4, years 4 to 20 | | $2,160.00 |

The decision record has to keep each piece separately (the class, the table, the flat extra and its duration, and the reasons), because premiums, the reinsurance cession, a later request for reconsideration and an adverse action notice each need a different part of it.

## Accelerated and Fluidless Underwriting

Accelerated underwriting replaces the exam and fluids, for applicants in an eligible age and face band, with data that arrives in seconds:

1. **Identity and prefill.** Verify the applicant and pull public records and existing coverage.
2. **MIB check.** Codes from earlier individually underwritten applications in the past seven years, compared to the application's answers; a discrepancy sends the case to an underwriter, never to an automatic decline.
3. **Prescription history.** PBM claims (ScriptCheck, IntelliScript's prescription data), with drug, dose, dates and prescriber; a statin or a metformin fill tells the engine about a condition the application may or may not have disclosed.
4. **Motor vehicle record.** Violations and suspensions, because driving behavior predicts accidental death.
5. **Mortality score.** A credit and public records based score (LexisNexis Risk Classifier) or an Rx and medical based score (IntelliScript's mortality score), with carrier-set thresholds.
6. **Medical claims and EHR** where the carrier has access and the applicant has authorized it.
7. **Rules engine.** The carrier's rules, written with its reinsurers, route the case: approve at the offered class, offer a different class, or refer to traditional underwriting with a targeted list of requirements.

"Fluidless" programs go further and issue at all classes without labs for a band of ages and amounts. The trade is speed and placement rates against some mortality slippage, which reinsurers price; the post-issue audit (random full underwriting of a sample of accelerated issues, plus continuous checks like ReCheck) is how carriers measure it. Every accelerated decision is a model-driven decision on consumer report data, so the model governance rules apply to it ([Colorado Regulation 10-1-1](#colorado-regulation-10-1-1)).

## The FCRA Layer

The data sources are consumer reports, so the FCRA governs each pull and each decision:

- **Permissible purpose.** A consumer reporting agency may furnish a report to a person it has reason to believe intends to use it in connection with "the underwriting of insurance involving the consumer" (15 USC 1681b(a)(3)(C)).
- **Medical information.** A consumer report containing medical information may be furnished in connection with an insurance transaction only if "the consumer affirmatively consents to the furnishing of the report" (1681b(g)(1)(A)), and the recipient may not redisclose it except as needed for the purpose or as the law allows (1681b(g)(4)). For an MIB or prescription report, the signed authorization on the application is that consent, and it has to be captured and kept with the order.
- **Adverse action.** If the insurer declines, rates or offers less favorable terms based in whole or in part on a consumer report, it must notify the applicant (orally, in writing or electronically), give the reporting agency's name, address and phone number, state that the agency "did not make the decision" and can't explain it, and tell the applicant of the right to a free copy within 60 days and to dispute the report's accuracy or completeness (1681m(a)). MIB adds its own path: a free copy of the MIB file when an adverse underwriting letter says an MIB record influenced the decision.
- **Non-CRA information.** Where an adverse decision rests on information from a third party that isn't a consumer reporting agency, the applicant may ask within 60 days for the nature of the information (1681m(b)).
- **HIPAA.** Pharmacy and medical records from covered entities come under the applicant's HIPAA authorization, signed and dated before access, as ExamOne's page requires; the authorization's scope and expiry decide which orders are allowed.

[Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data) defines `consumer_report_orders` and `adverse_actions` for every line; life uses them with its own products (MIB, prescription history, mortality score, medical claims) and its own notice content. The adverse action notice in life is a document generated from the decision record, listing every consumer reporting agency whose report contributed, which is why the decision must record which reports influenced it, not just which were ordered.

## Colorado Regulation 10-1-1

Colorado's Regulation 10-1-1 was the first rule requiring insurers that use external consumer data and information sources (ECDIS), and algorithms and predictive models that use them, to run a governance and risk management framework designed to find and fix unfair discrimination based on race. It applied first to life insurers; the Division of Insurance adopted an amended version, effective October 15, 2025, that extends it to private passenger auto and health benefit plan insurers and largely keeps the life requirements ([Colorado Division of Insurance: Notice of Adoption, Amended Regulation 10-1-1](https://content.govdelivery.com/accounts/CODORA/bulletins/3ee9c3f); Willkie Farr & Gallagher, September 2, 2025). The framework must include documented policies, processes and procedures, with assigned roles, "for the design, development, testing, deployment, use, and ongoing monitoring" of ECDIS and the models that use them, ensuring the ECDIS "is credible, relevant, and appropriate for its intended purpose," and ongoing supervision and training (Section 5.A.6). Unfair discrimination found through quantitative testing must be remediated. Reports are filed in SERFF with the filing type "Annual Report," one filing per insurer in a group.

The testing standard itself was still unsettled: the Division released a draft quantitative testing regulation for informal comment on September 28, 2023, and the American Council of Life Insurers presented its own draft on June 17, 2024. <!-- source-gap: co-quant-testing | status | whether Colorado has adopted a quantitative testing regulation for life insurers' algorithms as of Nov 2026 | closes with: the Colorado Division of Insurance's adopted regulations or bulletin page (doi.colorado.gov refused WebFetch) | checked: 2026-11-10 --> As of November 2026 I could not confirm from a Division page whether a testing regulation has been adopted. In the data, Colorado's rule means every accelerated underwriting model and data source is an entry in the model inventory ([Data, AI & Privacy Rules](/books/insurance/data-ai-and-privacy-rules) defines `models` and `model_inventory`), with its documentation, testing results and approvals, and each decision records the model versions it used.

## Genetic Information and HIV Testing

Two medical categories get their own state rules.

**Genetic information.** Florida bars health, life and long-term care insurers, absent a diagnosis of a related condition, from cancelling, limiting or denying coverage or setting different premium rates "based on such information," and from requiring or requesting genetic information, using test results or considering a person's decisions about genetic testing for any insurance purpose (Fla. Stat. 627.4301(2)(a)-(b)). "Genetic information" means information from genetic testing showing a variation or mutation linked to a disease or a statistically increased risk, in an asymptomatic person; routine exams, common blood and urine tests and family history questions are excluded unless done to obtain genetic information (1)(a). Life and LTC insurers may still access the medical record in an application and consider a diagnosis in it "even if a diagnosis was made based on the results of a genetic test" (2)(d). The statute covers disability benefits only as part of a life contract. For a system, this means the evidence pipeline must strip or block genetic test results from any data feed in states with such rules, while letting diagnoses through, which is a field-level filter on APS and EHR data, not a question on the application.

**HIV testing.** California requires a life or disability income insurer that asks for an HIV test to get written informed consent covering the test's purpose, uses and limitations, what results mean, how the applicant will be told, and the right to confidentiality; to give information about HIV and a list of counseling resources (including the State Department of Public Health and the CDC) before the applicant signs, on paper or electronically as the applicant chooses; and to report a positive result to the applicant's designated physician, or urge the applicant to seek counseling if none is designated (Cal. Ins. Code 799.03). The consent is an artifact the lab order depends on, and the result routing is a rule on the result, not on the decision.

## The Decision and Its Paper Trail

A life underwriting decision produces more than a class:

- **An offer** at the class applied for, or a **counter-offer** at a different class, which the applicant must accept (an amendment to the application signed at delivery).
- **A decline or postponement**, with adverse action notices for each consumer report that contributed.
- **The reinsurance cession**: automatic cessions under a treaty's automatic binding limits, or a facultative submission to reinsurers for large or impaired cases before the offer.
- **MIB reporting**: members report coded findings from the underwriting back to MIB, which is what creates the next carrier's file.
- **The contestable clock** starts at issue: two years under the New York, Texas and Florida statutes, during which the insurer may contest for material misrepresentation ([The Contestable Period](/books/insurance/death-claims-and-unclaimed-benefits#the-contestable-period)).

## How to Build It

Underwriting extends the core model's `submissions` (defined in [Underwriting Rules, Referrals & Models](/books/insurance/underwriting#how-to-build-it)) and `parties`, and the [Consumer Reports & Third-Party Data](/books/insurance/consumer-reports-and-third-party-data) chapter's `consumer_report_orders` and `adverse_actions`, whose `product` values gain the life sources (`mib`, `rx_history`, `mortality_score`, `medical_claims`, `ehr`). This chapter adds the evidence orders, which include non-consumer-report evidence (exams, labs, APS), and the decision:

```sql
CREATE TABLE evidence_orders (             -- every requirement on a life application
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID NOT NULL,         -- the application
  insured_party_id   UUID NOT NULL REFERENCES parties (id),
  kind               TEXT NOT NULL CHECK (kind IN ('mib', 'rx_history', 'mvr',
                       'mortality_score', 'medical_claims', 'ehr', 'paramed', 'labs',
                       'aps', 'ekg', 'financials', 'inspection', 'tele_interview')),
  consumer_report_order_id UUID,            -- set when the evidence is a consumer report
  authorization_ids  UUID[] NOT NULL,       -- FCRA, HIPAA, MIB, HIV consent documents
  vendor             TEXT NOT NULL,
  reason             TEXT NOT NULL,         -- 'age_amount_grid', 'rule:RX-STATIN', ...
  status             TEXT NOT NULL CHECK (status IN ('ordered', 'received', 'waived',
                       'cancelled', 'expired')),
  ordered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_at        TIMESTAMPTZ,
  result_ref         TEXT,                  -- vault reference to the result
  filters_applied    TEXT[] NOT NULL DEFAULT '{}'  -- 'genetic_results_blocked:FL'
);

CREATE TABLE rate_class_decisions (        -- the decision, with what drove it
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID NOT NULL,
  insured_party_id   UUID NOT NULL REFERENCES parties (id),
  path               TEXT NOT NULL CHECK (path IN ('accelerated', 'fluidless',
                       'traditional', 'simplified', 'guaranteed_issue')),
  outcome            TEXT NOT NULL CHECK (outcome IN ('approved_as_applied',
                       'counter_offer', 'postponed', 'declined', 'withdrawn',
                       'incomplete')),
  rate_class         TEXT,                  -- 'preferred_plus_nt', 'standard_t', ...
  table_rating       INT,                   -- 0 for none; carrier's table number
  flat_extra         JSONB,                 -- {"per_1000":250,"years":3,"reason":"aviation"}
  decided_by         TEXT NOT NULL CHECK (decided_by IN ('rules_engine', 'underwriter')),
  underwriter_id     UUID,
  model_versions     JSONB NOT NULL,        -- every model and ruleset version used
  rules_fired        JSONB NOT NULL,        -- rule ids and inputs that set the outcome
  influencing_reports UUID[] NOT NULL DEFAULT '{}',  -- consumer_report_orders that
                                            -- contributed: drives adverse action notices
  reinsurance        JSONB,                 -- automatic or facultative, with offers
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes_id      UUID REFERENCES rate_class_decisions (id)  -- reconsideration
);
```

Three rules keep it defensible. **Authorizations are prerequisites in the data,** not checkboxes: an order without the authorization documents it needs can't be placed, and an expired HIPAA authorization cancels pending APS orders. **The decision names what influenced it,** separately from what was ordered, because adverse action notices go to the agencies that contributed, and Colorado's testing and any reconsideration need the model versions and rules that fired ([The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record)). **Results are sensitive data,** stored by reference in a vault with field-level access, and genetic test results are filtered at intake in states that bar them ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).

## Auditing

- **Purpose and consent per pull.** Every consumer report order with its permissible purpose, the affirmative consent for medical information, and the HIPAA authorization for records, in force at the time of the order.
- **Adverse action completeness.** Every decline, rating or counter-offer that a consumer report influenced, with the notice, its date and every agency named.
- **Rules and models.** The ruleset and model versions behind each automated decision, and the inventory entries and testing evidence Colorado's framework requires.
- **Prohibited data.** Evidence that genetic results were blocked where state law bars them, and HIV consent forms and result routing where required.
- **Accelerated program monitoring.** The post-issue audit sample and its findings by class, which is the evidence that the accelerated program is working and the input to reinsurer reviews.
- **MIB reporting.** Codes reported back to MIB for each application, as the member rules require.

## What This Means for the System You Build

- **Model each requirement as an evidence order** tied to the authorizations it needs, whether or not it is a consumer report.
- **Record the decision with its class, table, flat extra and reasons separately,** plus the models, rules and reports that influenced it.
- **Generate adverse action notices from the decision record,** naming every consumer reporting agency whose report contributed.
- **Put every accelerated underwriting model and data source in the model inventory,** with documentation and testing, and record versions on every decision.
- **Filter prohibited data at intake,** genetic results by state, and route HIV results by rule.
- **Keep monitoring after issue** through the contestable period, with sampling and checks feeding back into the rules.

## References

**Law and regulation**

- [15 USC 1681b](https://www.law.cornell.edu/uscode/text/15/1681b), the insurance underwriting permissible purpose, affirmative consent for medical information in insurance transactions and the redisclosure limit
- [15 USC 1681m](https://www.law.cornell.edu/uscode/text/15/1681m), adverse action notices based on consumer reports and the 60-day request right for non-CRA information
- [Fla. Stat. 627.4301](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4301.html), genetic information in health, life and long-term care insurance: the definition, the prohibitions and the diagnosis exception
- [Cal. Ins. Code 799.03 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-799-03/), HIV testing consent, information and result notification for life and disability income insurers

**Regulators and guidance**

- [Willkie Farr & Gallagher: Colorado Division of Insurance adopts amended AI governance regulation, September 2, 2025 (PDF)](https://www.willkie.com/publications/2025/09/colorado-division-of-insurance-adopts-amended-ai-governance-regulation), Regulation 10-1-1's extension to auto and health benefit plans, the October 15, 2025 effective date, the framework requirements, SERFF reporting and the draft quantitative testing regulations

**Vendor documentation**

- [MIB: Request your record](https://www.mib.com/request_your_record.html), when a file exists, the seven-year window, the limit on deciding from the file, FCRA disclosure rights and the Disability Income Record System
- [Milliman IntelliScript](https://www.rxhistories.com/), the Irix suite, risk scores, data sets, ReCheck and its FCRA statements
- [ExamOne: ScriptCheck](https://www.examone.com/scriptcheck), PBM prescription claims and the HIPAA authorization requirement
- [LexisNexis Risk Solutions: Risk Classifier](https://risk.lexisnexis.com/products/risk-classifier), the mortality score, its inputs and delivery, carrier thresholds and its FCRA status
- [iPipeline](https://www.ipipeline.com/), Resonant underwriting automation
- [Hexure](https://www.hexure.com/), FireLight e-application
