+++
title = "Worker Classification"
description = "Employee or contractor under each test: the IRS common-law test and SS-8, Section 530, the DOL rule and its 2026 proposal, ABC tests, 3509 costs and VCSP."
category = "Workforce Industry"
order = 2653
part = "Contractors and Global"
tags = ["worker-classification", "contractors", "abc-test", "flsa", "employment-tax", "misclassification"]
+++

Whether a worker is an employee or an independent contractor isn't one question. It's a question asked separately by the IRS for income tax withholding and FICA, by the Department of Labor for minimum wage and overtime, by each state for unemployment insurance, wage law and workers' compensation, and by courts in each of those contexts, under tests that differ in their factors and their burden. The IRS weighs behavioral control, financial control and the relationship. The DOL asks whether the worker is economically dependent on the business, under a 2024 rule its own investigators no longer apply and a 2026 proposal that hasn't been finalized. California, Massachusetts and other states presume employment unless the business proves three things, one of which (the work is outside the usual course of the business) a platform whose product is the work can rarely prove. The same person can be a contractor for federal tax and an employee under state wage law.

Classification is a legal determination for counsel, not the payroll system. What the system owns is the record: which test was applied to which worker, for which purpose and jurisdiction, on which facts and when; the consistency of treatment across similar workers, which is itself a legal test under Section 530; the date and mechanics of a conversion; and the cost, computed from the statute, when a classification is wrong. This chapter covers the IRS test and Form SS-8, Section 530 relief, the DOL test and its rulemaking status as of November 2026, ABC tests, the cost of misclassification with worked numbers under section 3509, the Voluntary Classification Settlement Program, and what a payroll system records. Gig platforms' version of the question (Proposition 22, the UK's *Aslam* case, the EU Platform Work Directive, minimum pay standards) is in the User-Generated Platforms volume's [Classification](/books/user-generated-platforms/gig-work-and-worker-law#classification); reporting payments to contractors is in [Contractors & 1099s](/books/workforce/contractors-and-1099s). This is a description of the rules for engineers, not legal advice.

## Which Test Applies

| Purpose | Who decides | Test |
| --- | --- | --- |
| **Federal income tax withholding, FICA, FUTA** | IRS | Common law: behavioral control, financial control, relationship of the parties; Section 530 relief for consistent treatment with a reasonable basis |
| **FLSA minimum wage and overtime** | DOL, courts | Economic reality: is the worker economically dependent on the business or in business for themselves; the 2024 rule's six factors in private litigation, Fact Sheet 13 in DOL enforcement |
| **California wage orders, Labor Code, UI** | State agencies, courts | ABC test (Labor Code 2775), with statutory exemptions |
| **Massachusetts wage and hour law** | State, courts | ABC test (c. 149, §148B) |
| **Other states' UI, wage and workers' compensation laws** | Each state | ABC tests, common-law tests or hybrids, often different for UI than for wage law |

The table is why a single `is_contractor` flag can't be right. The core model carries `workers.worker_type`, which is what payroll does (W-2 or 1099), and this chapter adds the assessments behind it, one per test, purpose and jurisdiction, each with its facts and date.

## The IRS Common-Law Test

The IRS groups the evidence of control and independence into three categories: **behavioral** ("Does the company control or have the right to control what the worker does and how the worker does his or her job?"), **financial** ("Are the business aspects of the worker's job controlled by the payer?" such as how the worker is paid, whether expenses are reimbursed and who provides tools) and **type of relationship** ("Are there written contracts or employee type benefits" such as insurance, a pension plan, vacation pay; will the relationship continue; is the work a key aspect of the business). "The keys are to look at the entire relationship," and no single factor decides.

When the answer is unclear, either the business or the worker can file **Form SS-8** (revision December 2023) and ask the IRS to determine the worker's status for federal employment taxes and income tax withholding. A determination may take "at least six months." Workers file SS-8s too, often after a dispute, which is why an employer's first notice of a classification problem may be an IRS letter asking it to complete its side of a form a former contractor filed.

## Section 530 Relief

Section 530 of the Revenue Act of 1978 (P.L. 95-600, printed as a note to 26 U.S.C. 3401) stops the IRS from assessing federal employment taxes for a worker the business treated as a contractor if three conditions hold:

- **Reporting consistency.** The business filed all required returns, including 1099s, consistently with treating the worker as not an employee.
- **Substantive consistency.** The business didn't treat anyone holding a substantially similar position as an employee for any period after December 31, 1977.
- **Reasonable basis.** The treatment rested on judicial precedent, published rulings, technical advice or a letter ruling; a past IRS audit with "no assessment attributable to the treatment" of such workers; a "long-standing recognized practice of a significant segment of the industry"; or another reasonable basis. The IRS can't require a showing that the practice is followed by "more than 25 percent of the industry" or has existed "for more than 10 years."

Substantive consistency is a data question. A business that has one designer on W-2 and four doing the same work on 1099 has lost Section 530 for the four, so a system that can list every worker in a position by `worker_type` over time is answering the question the statute asks. Section 530 is relief from federal employment tax only; it doesn't bind the DOL or any state.

## The DOL Economic Reality Test

Under the FLSA the question is whether the worker is economically dependent on the business for work or is in business for themselves. The 2024 rule (89 FR 1638, published January 10, 2024, effective March 11, 2024, at 29 CFR part 795) applies six factors in a "totality-of-the-circumstances analysis" (29 CFR 795.110):

1. Opportunity for profit or loss depending on managerial skill.
2. Investments by the worker and the potential employer.
3. Degree of permanence of the work relationship.
4. Nature and degree of control.
5. Whether the work is an integral part of the potential employer's business.
6. Skill and initiative.

The status as of November 10, 2026 has three layers:

- **Enforcement.** Field Assistance Bulletin 2025-1 (May 1, 2025) says "WHD will no longer apply the 2024 Rule's analysis" in investigations and will enforce under Fact Sheet 13 (July 2008) "as further informed by Opinion Letter FLSA2019-6."
- **Private litigation.** "Until further action is taken, the 2024 Rule remains in effect for purposes of private litigation."
- **The proposal.** On February 27, 2026 the Department published a proposed rule (91 FR 9932, RIN 1235-AA46, docket WHD-2026-0001) "proposing to rescind the analysis for determining employee or independent contractor status" in the 2024 rule and replace it with an analysis built on the January 2021 rule, extending it to the FMLA and the Migrant and Seasonal Agricultural Worker Protection Act (29 CFR parts 500, 795 and 825). Comments closed April 28, 2026. A Federal Register search for final rules on independent contractor status from the Wage and Hour Division since January 2024 returns only the 2024 rule, so as of November 10, 2026 no final rule has been published.

For a system, the federal FLSA test is therefore a dated rule with a context: which analysis applies depends on whether the question is a DOL investigation or a lawsuit, and it will change when a final rule takes effect. Assessments store the rule version they applied.

## ABC Tests

An ABC test presumes employment and puts the burden on the hiring entity to prove all three parts. California's Labor Code 2775(b)(1), from AB 5 (2019):

- **(A)** The person is "free from the control and direction of the hiring entity in connection with the performance of the work, both under the contract for the performance of the work and in fact."
- **(B)** The person "performs work that is outside the usual course of the hiring entity's business."
- **(C)** The person is "customarily engaged in an independently established trade, occupation, or business of the same nature as that involved in the work performed."

California's exemptions are lists of criteria, which suits a rules table: the business-to-business exemption (Labor Code 2776) requires all **12** of its criteria to be satisfied, and the professional services exemption (2778) requires six criteria and covers 15 listed services, including marketing, human resources administration, graphic design, grant writing, freelance writing and appraisal.

Massachusetts's test (c. 149, §148B) has the same three parts: the individual is "free from control and direction" both "under his contract" and "in fact"; the service is "performed outside the usual course of the business of the employer"; and the individual is "customarily engaged in an independently established trade, occupation, profession or business" of the same nature. Violations carry criminal and civil remedies and debarment under section 27C, and liability reaches "the president and treasurer of a corporation" and managing officers. <!-- source-gap: wf-nj-abc-test | missing | New Jersey's ABC test text (N.J.S.A. 43:21-19(i)(6)(A)-(C)) and its misclassification penalties | closes with: the statute's text or a New Jersey Department of Labor misclassification page, opened (three nj.gov URLs returned 404 on Nov 10, 2026) | checked: 2026-11-10 --> New Jersey also applies an ABC test for unemployment and wage purposes; I couldn't open its text for this chapter, so it isn't quoted.

Prong B is the one a system can't help much with: whether the work is outside the usual course of the business is a fact about the business, and a staffing or platform business whose product is the work fails it by construction. Prongs A and C produce evidence the system can hold: the contract, the worker's other clients, their business registration, and the controls the product imposes, which the User-Generated Platforms volume's [Controls Are Evidence](/books/user-generated-platforms/gig-work-and-worker-law#controls-are-evidence) treats in depth.

## The Cost of Misclassification

A reclassified worker costs back taxes, back wages and penalties, each under its own law.

**Federal employment tax, section 3509.** When an employer fails to withhold because it treated an employee as a contractor (and the failure isn't intentional disregard), its liability for the employee's taxes is reduced: income tax at "1.5 percent of the wages," and the employee's share of FICA at "20 percent" of the normal amount. If the employer also failed to file the required 1099s or W-2s, the rates double to "3 percent" and "40 percent." The employer's own share of FICA is owed in full, the employer can't recover the 3509 amounts from the employee, and 3509 doesn't apply where the employer intentionally disregarded the requirements (26 U.S.C. 3509).

**State penalties.** California's Labor Code 226.8 imposes civil penalties for "voluntarily and knowingly misclassifying" a worker of $5,000 to $15,000 per violation, and $10,000 to $25,000 per violation for a pattern or practice, on top of the wages, premiums and penalties the Labor Code owes an employee. Massachusetts's penalties are in section 27C.

**Wage-hour back pay.** Overtime, minimum wage, meal and rest premiums, expense reimbursement and waiting time penalties are owed as for any employee, computed with the regular rate and state rules in the Time and Wage-Hour part.

### Worked Numbers: Section 3509 on One Worker

An invented worker was paid $60,000 in 2026 as a contractor and is reclassified as an employee, with the employer's failure not intentional. Federal employment taxes, 2026 rates (7.65% FICA each side, under the Social Security wage base):

| Item | 1099s filed | No 1099s filed |
| --- | --- | --- |
| Income tax withholding: 1.5% (or 3%) of $60,000 | $900.00 | $1,800.00 |
| Employee FICA: 20% (or 40%) of 7.65% = 1.53% (or 3.06%) | $918.00 | $1,836.00 |
| Employer FICA: 7.65% in full | $4,590.00 | $4,590.00 |
| **Total under 3509, before FUTA, interest and penalties** | **$6,408.00** | **$8,226.00** |

Filing the 1099 saved $1,818.00 on one worker, which is why the reporting obligation in the previous chapter is also the classification defense. Without 3509 (intentional disregard), the employer would owe the full income tax that should have been withheld and both shares of FICA.

## The Voluntary Classification Settlement Program

VCSP lets a business reclassify workers prospectively and settle the past for a fraction of 3509. Eligibility: the business consistently treated the workers as nonemployees, filed all required 1099s for them for the previous three years, and isn't under IRS employment tax audit or a DOL or state audit on classification. It files Form 8952 "at least 120 days prior to the date the taxpayer wants to begin treating its workers as employees," and pays 10% of the employment tax liability on the workers' compensation for the most recent tax year, computed under the reduced rates of section 3509(a), with no interest or penalties and no employment tax audit of prior years for those workers. The IRS's Announcement 2012-45 removed an earlier requirement to extend the statute of limitations.

### Worked Numbers: VCSP on the Same Worker

For the $60,000 worker above, with 1099s filed: the 3509(a) liability is $6,408.00 (1.5% + 1.53% + 7.65% = 10.68% of compensation), and the VCSP payment is 10% of it, $640.80. To begin employee treatment on July 1, 2027, Form 8952 is filed by March 3, 2027, 120 days earlier. From July 1, the worker is an employee for federal employment taxes: a new `workers` row of type employee on the same person, a W-4, payroll withholding, and a 1099-NEC for the contractor payments before the conversion and a W-2 for the wages after it.

## What a Payroll System Records

The system's part is evidence, consistency and mechanics:

- **Assessments, one per test.** For each worker: the test (IRS common law, DOL economic reality and its version, a state ABC test, an exemption), the purpose and jurisdiction, the facts considered, the result, who decided (counsel, an HR reviewer, a tool), and the date. A reassessment is a new row.
- **Consistency across positions.** Every worker doing substantially similar work, by type, over time, for Section 530 and for the business's own consistency.
- **The contract and the controls.** The contract as signed and the product's controls that bear on prong A, versioned, so the facts at a date can be reproduced.
- **SS-8 and VCSP cases** with their forms, dates and outcomes.
- **Conversion mechanics.** The conversion date, the new worker row, the last 1099 payment and the first W-2 pay date, and any back-pay or 3509 calculation with its inputs.

A classification tool that scores workers is itself a record to audit: its inputs, its version and the human decision that followed ([Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Assessments attach to `workers`; forms and contracts are `documents`.

```sql
CREATE TABLE classification_tests (        -- the test as a dated rule version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  code                TEXT NOT NULL,         -- 'irs_common_law', 'flsa_2024_rule', 'flsa_fact_sheet_13',
                                             -- 'ca_abc_2775', 'ca_b2b_2776', 'ma_148b', ...
  purpose             TEXT NOT NULL CHECK (purpose IN ('federal_employment_tax', 'flsa',
                        'state_wage', 'state_ui', 'workers_comp', 'fmla')),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  factors             JSONB NOT NULL,        -- the factors or prongs, and any exemption criteria
  context             TEXT,                  -- 'dol_enforcement' or 'private_litigation'
  source_ref          TEXT NOT NULL,         -- '29 CFR 795.110', 'FAB 2025-1', 'Lab. Code 2775'
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE classification_assessments (  -- one per worker, test and decision
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  classification_test_id UUID NOT NULL REFERENCES classification_tests (id),
  position_key        TEXT NOT NULL,         -- groups substantially similar work
  facts               JSONB NOT NULL,        -- per factor or prong, with document references
  result              TEXT NOT NULL CHECK (result IN ('employee', 'contractor', 'exempt',
                        'undetermined')),
  decided_by          TEXT NOT NULL CHECK (decided_by IN ('counsel', 'hr_review', 'tool', 'agency',
                        'court')),
  tool_version        TEXT,
  contract_document_id UUID REFERENCES documents (id),
  assessed_on         DATE NOT NULL,
  supersedes_id       UUID REFERENCES classification_assessments (id)
);

CREATE TABLE ss8_requests (                -- Form SS-8, filed by either side
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  filed_by            TEXT NOT NULL CHECK (filed_by IN ('business', 'worker')),
  filed_on            DATE,
  irs_letter_notice_id UUID REFERENCES notices (id),  -- when the worker filed first
  document_id         UUID REFERENCES documents (id),
  determination       TEXT CHECK (determination IN ('employee', 'contractor', 'withdrawn')),
  determined_on       DATE
);

CREATE TABLE vcsp_applications (           -- Form 8952 and its payment
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_ids          UUID[] NOT NULL,       -- the class of workers reclassified
  employee_treatment_from DATE NOT NULL,
  form_due_on         DATE GENERATED ALWAYS AS (employee_treatment_from - 120) STORED,
  filed_on            DATE,
  base_year           SMALLINT NOT NULL,     -- the most recent tax year
  base_compensation_cents BIGINT NOT NULL,
  liability_3509_cents BIGINT NOT NULL,      -- computed under 3509(a)
  payment_cents       BIGINT GENERATED ALWAYS AS (liability_3509_cents / 10) STORED,
  closing_agreement_document_id UUID REFERENCES documents (id),
  status              TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'accepted', 'rejected',
                        'paid'))
);

ALTER TABLE workers
  ADD COLUMN converted_from_worker_id UUID REFERENCES workers (id);  -- contractor to employee
```

Consistency is a query: for each `position_key`, the `worker_type` of every worker in it over time, and any position with both types is flagged for review. A conversion creates the employee `workers` row with `converted_from_worker_id`, ends the contractor's payments at the conversion date, and starts onboarding (W-4, I-9) for the employee.

Design notes:

- **One assessment per test, purpose and jurisdiction,** never a single flag.
- **Store the test version,** because the federal FLSA analysis is in flux.
- **Group similar work by position** so Section 530's consistency question is a query.
- **Keep contracts and product controls as dated evidence.**
- **Compute 3509 and VCSP from statement-level inputs,** with the rates as data.

## Auditing

An IRS employment tax examination, a DOL investigation, a state audit or a lawsuit asks:

- **Each worker's assessments** with the test, facts, decision-maker and date.
- **Consistency of treatment** across workers in similar positions since the business began.
- **1099s filed** for every contractor for every year, the Section 530 reporting-consistency condition and the 3509 rate decider.
- **SS-8 and VCSP records,** and the conversion date and first W-2 pay date of any reclassified worker.
- **The contract and the controls in force** at the time of the work.

## What This Means for the System You Build

- **Record classification per test, purpose and jurisdiction,** with facts, decision-maker and date.
- **Version the tests,** including the DOL's enforcement and litigation contexts.
- **Make consistency across similar positions a standing report.**
- **File every 1099 on time,** since it halves the 3509 rates and preserves Section 530.
- **Model conversion as a new worker row** linked to the contractor row, with clean year-split reporting.
- **Support SS-8 responses and VCSP filings** as cases with their documents and clocks.

## References

**Law and regulation**

- [26 U.S.C. 3509: Determination of employer's liability for certain employment taxes](https://www.law.cornell.edu/uscode/text/26/3509), the 1.5% and 20% rates, 3% and 40% without returns, intentional disregard and no recovery from the employee
- [26 U.S.C. 3401 and notes: Section 530 of the Revenue Act of 1978](https://www.law.cornell.edu/uscode/text/26/3401), reporting and substantive consistency, reasonable basis and the 25%-of-industry and 10-year limits
- [29 CFR 795.110: Economic reality test](https://www.law.cornell.edu/cfr/text/29/795.110), the six factors and the totality-of-the-circumstances analysis
- [Federal Register: Employee or Independent Contractor Classification Under the FLSA, 89 FR 1638 (January 10, 2024)](https://www.federalregister.gov/api/v1/documents/2024-00067.json), the 2024 final rule effective March 11, 2024
- [Federal Register: Employee or Independent Contractor Status, 91 FR 9932 (proposed rule, February 27, 2026)](https://www.federalregister.gov/api/v1/documents/2026-03962.json), the proposal to rescind and replace the 2024 analysis, extend it to the FMLA and MSPA, and the April 28, 2026 comment deadline
- [Federal Register API: Wage and Hour Division final rules on "independent contractor" since 2024](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22independent+contractor%22&conditions[agencies][]=wage-and-hour-division&conditions[type][]=RULE&conditions[publication_date][gte]=2024-01-01), only the 2024 rule as of November 10, 2026
- [California Labor Code 2775](https://california.public.law/codes/ca_lab_code_section_2775), the ABC test
- [California Labor Code 2776](https://california.public.law/codes/ca_lab_code_section_2776), the business-to-business exemption's 12 criteria
- [California Labor Code 2778](https://california.public.law/codes/ca_lab_code_section_2778), the professional services exemption's criteria and listed services
- [California Labor Code 226.8](https://california.public.law/codes/ca_lab_code_section_226.8), willful misclassification penalties of $5,000 to $25,000 per violation
- [Massachusetts General Laws c. 149, §148B](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section148B), the three-part test, remedies under section 27C and officer liability

**Agency guidance and forms**

- [IRS: Independent contractor (self-employed) or employee?](https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-self-employed-or-employee), behavioral, financial and relationship categories, Form SS-8 and the six-month determination time
- [IRS: About Form SS-8](https://www.irs.gov/forms-pubs/about-form-ss-8), the form (Rev. 12-2023) and instructions
- [IRS: Voluntary Classification Settlement Program](https://www.irs.gov/businesses/small-businesses-self-employed/voluntary-classification-settlement-program), eligibility, Form 8952 at least 120 days ahead, the 10% payment under 3509(a) and Announcement 2012-45
- [DOL WHD: Field Assistance Bulletin 2025-1 (PDF)](https://www.dol.gov/sites/dolgov/files/WHD/fab/fab2025-1.pdf), enforcement under Fact Sheet 13 and the 2024 rule in private litigation
- [DOL WHD: Misclassification rulemaking](https://www.dol.gov/agencies/whd/flsa/misclassification/rulemaking), the Department's rulemaking page
