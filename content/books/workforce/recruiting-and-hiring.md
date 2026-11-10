+++
title = "Recruiting, ATS & AI in Hiring"
nav_title = "Recruiting & ATS"
description = "Requisitions, candidates, applications and offers, EEO self-identification after the 2026 rules, ATS APIs, AI hiring laws and candidate data retention."
category = "Workforce Industry"
order = 2636
part = "Hiring and HR Records"
tags = ["recruiting", "ats", "hiring", "eeo", "ai-in-hiring", "data-retention"]
+++

Before there is an employee there is a candidate, and before a candidate there is a decision to hire. An applicant tracking system (ATS) records that chain: a requisition that approves a hire, a job posting that advertises it, applications from candidates, interviews and scorecards, an offer with its approvals and its letter, and finally a hire that hands the candidate to the HRIS. Each step creates records that employment law reaches: who applied and when, what they were asked, how they were screened, why they were rejected, and, for a growing set of tools, whether software did the screening and whether anyone checked it for bias.

The data is also more sensitive than it looks. An ATS holds demographic self-identification that must be kept away from the people making decisions, salary expectations that some states bar employers from asking about, background check results that the next chapter governs, and the personal data of thousands of people who never worked for the employer and have privacy rights of their own. This chapter covers requisitions, candidates and applications, offers and the hand-off to the HRIS, EEO data collection after the 2025 and 2026 changes, the ATS vendors and their APIs, the laws on AI in hiring, and how long candidate data is kept. Pay ranges in postings and salary history bans are in [Pay Transparency, Pay Equity & EEO-1](/books/workforce/pay-transparency-and-equity); background checks and fair chance sequencing are in [Background Checks, Fair Chance & Drug Testing](/books/workforce/background-checks-and-fair-chance).

## How the Platforms Do It

What ATS vendors publish about their objects, hiring hand-offs and candidate data, as of November 2026:

| Platform | Core objects | Hire hand-off | EEO and privacy |
| --- | --- | --- | --- |
| **Ashby** | Candidates, applications, jobs, openings, offers | A `candidateHire` webhook, "Triggered when a candidate is hired (including candidates that are hired on confidential jobs)," plus `offerCreate` and `applicationSubmit` | Not described on the index page reached |
| **Greenhouse** | Applications as "the bridge between a candidate (person) and a job," with jobs, openings, offers and scorecards; Harvest v3 with OAuth 2.0 and cursor pagination | `POST /v1/applications/{id}/hire` requires that "all approvals for the job and offer must have occurred"; the `hire_candidate` webhook "occurs when an offer is accepted" | An EEOC object for "voluntary self-identification of race, gender, veteran status, and disability status," demographic answers as a separate object, an anonymize endpoint, and a `candidate_anonymized` webhook |
| **iCIMS** | Not public: the developer community is gated behind a "New User Request form" | | |
| **Lever** | Opportunities: "A candidate or contact may have multiple applications, each of which will be on a unique Opportunity"; postings with a `salaryRange`; offers with statuses from `draft` to `signed` | A `candidateHired` webhook "when a candidate is marked as hired in Lever" | EEO responses with a separate PII endpoint; "collecting disability information is only allowed for US contractors"; anonymized records and a GDPR consent expiry |
| **SmartRecruiters** | Jobs, candidates, offers (offer search needs Extended or Admin roles) | Webhook subscriptions that must be "activated" before delivery | Consent request endpoints tied to its GDPR tools; Audit API data "retained at least 26 months" |
| **Workable** | Jobs, candidates, offers, employees, with scopes such as `r_jobs`, `r_candidates` and `r_offers` | A subscriptions API with candidate and employee events | Offers "Accessible only with user tokens" |
| **Workday Recruiting** | A Recruiting web service alongside Staffing and Human_Resources in Workday's service list | Hire inside the same HCM record | Not public at operation level |

Greenhouse's Harvest documentation said that "The Harvest v1/v2 API is deprecated and will be removed on August 31, 2026," pointing integrators to Harvest v3; an integration built against v1 or v2 should be treated as retired.

<!-- source-gap: wf-ats-greenhouse-v2-removal | status | whether Greenhouse removed Harvest v1/v2 on August 31, 2026 | closes with: a Greenhouse changelog or doc page after the date confirming removal | checked: 2026-11-09 -->

The pattern across vendors is consistent: a person (candidate) is separate from each attempt (application or opportunity), demographic self-identification is a separate object with separate permissions, and the hire is an explicit event that requires the offer and its approvals to be complete. The core model inherits all three.

## Requisitions, Postings and Applications

**Requisition.** A request to hire, with its approvals: the job, the position it fills (under position management, [Positions and Org Structures](/books/workforce/hris-record-of-truth#positions-and-org-structures)), the department, location, pay range, target start date, number of openings and the hiring team. A requisition is the budget decision; it exists before the posting and outlives it, and its approval history is what a finance team audits.

**Posting.** The public or internal advertisement, with the text, the locations it targets, the pay range where a state requires one and the dates it was live. A posting is a document with versions: what it said on the day a candidate applied is what a pay transparency complaint or a discrimination charge will ask about, so edits create new versions rather than replacing the old.

**Candidate and application.** A candidate is a person; an application is that person's attempt at one job. Lever's model (a candidate with several opportunities) and Greenhouse's (an application as the bridge between a candidate and a job) agree on the split. The application carries its source (job board, referral, agency, sourced), its stage history with timestamps and actors, its screening answers, its interview scorecards and its disposition: hired, rejected with a reason, withdrawn or closed. The disposition reason matters more than any other field, because it is what the employer says when asked why a person wasn't hired.

**Who counts as an applicant.** For federal contractors, the "Internet Applicant" definition decided which online expressions of interest had to be tracked for adverse impact analysis. It lived in the Executive Order 11246 regulations, which Executive Order 14173 revoked on January 21, 2025 and which OFCCP rescinded in a final rule published August 21, 2026. Title VII, the ADA and the ADEA still apply to every employer of covered size, and the EEOC's recordkeeping rule still covers "application forms" and records on hiring (see [Candidate Data Retention](#candidate-data-retention)), so the ATS should keep a consistent definition of who applied for what, whatever the contractor rules now require.

## Offers and the Hand-Off to the HRIS

An offer is a versioned document with approvals: the job, start date, pay rate or salary, pay basis, FLSA status, bonus and equity terms, contingencies (a background check, a drug test, work authorization) and an expiry. Lever's offer statuses (`draft`, `approval-sent`, `approved`, `sent`, `sent-manually`, `opened`, `denied`, `signed`) are a reasonable state list for any implementation; the important edges are that an offer can't be sent before it is approved, and a signed offer can't change without a new version.

The hire is the hand-off. Greenhouse won't mark an application hired until "all approvals for the job and offer must have occurred"; Ashby, Greenhouse and Lever each emit a hire webhook; and the HRIS takes it from there as a hire event ([Joiner, Mover and Leaver Events](/books/workforce/hris-record-of-truth#joiner-mover-and-leaver-events)). What crosses is the person, the job, the start date and the pay from the accepted offer, mapped to the HRIS's job codes and the payroll's earning codes. What should not cross automatically is the candidate's demographic self-identification (which belongs in the HR system's own EEO record under its own access rules, if it is kept at all) and the background check report (which stays in the check's own record).

Two edge cases need explicit handling. A rescinded offer after a hire event has already reached payroll and identity is a rescind, not a termination (the HRIS chapter covers why). And a conditional offer, which fair chance laws require before any conviction history inquiry, means the background check runs after the offer and can end it, so the offer, the check and the adverse action process are one workflow (the next chapter covers the sequence).

## EEO Self-Identification

Employers ask applicants and employees to self-identify race, ethnicity and sex for EEO reporting and adverse impact analysis, and historically federal contractors also invited applicants to self-identify as protected veterans and individuals with disabilities. Three rules govern the data no matter which reports are filed:

- **Voluntary.** Self-identification is invited, never required, and "decline to answer" is a valid answer.
- **Separate from decisions.** The answers are stored apart from the application and hidden from recruiters and interviewers. Greenhouse keeps EEOC data and demographic answers as their own objects; Lever exposes EEO responses through a separate endpoint and their PII through another.
- **Kept like other personnel records.** The EEOC's recordkeeping rule and state rules apply to them as to any applicant record.

What changed in 2025 and 2026, as of November 2026:

| Requirement | Status | Source |
| --- | --- | --- |
| **EEO-1 Component 1** (private employers with 100 or more employees, federal contractors with 50 or more meeting criteria) | The EEOC's page says "The 2024 EEO-1 Component 1 Data Collection is CLOSED" and posts no 2025 collection. A proposed rule, "Removal of Reporting Requirements" (91 FR 46332, July 23, 2026), would rescind EEO-1 through EEO-6 and the related recordkeeping in 29 CFR part 1602; comments closed August 24, 2026, and no final rule appears in the Federal Register | EEOC; FR 2026-14937 |
| **Executive Order 11246 affirmative action** (race and sex for contractors) | Revoked by EO 14173 on January 21, 2025; OFCCP's implementing regulations rescinded by a final rule published August 21, 2026 | OFCCP; FR 2026-17114 |
| **Section 503 disability self-identification** | OFCCP's final rule of August 21, 2026 (91 FR 54482) revised the Section 503 regulations; OFCCP says "the self-identification form is discontinued, effective September 21, 2026" | OFCCP; FR 2026-17115 |
| **VEVRAA protected veteran self-identification** | VEVRAA's regulations were revised by a final rule effective September 21, 2026 (91 FR 54234) to remove EO 11246 references; whether the invitation to self-identify changed is not stated in the summary | OFCCP; FR 2026-17116 |

<!-- source-gap: wf-ats-vevraa-selfid | missing | whether the 2026 VEVRAA final rule kept the invitation to self-identify as a protected veteran | closes with: the regulatory text of 41 CFR 60-300.42 after September 21, 2026 | checked: 2026-11-09 -->

The Pay Transparency chapter covers EEO-1 as a report. For the ATS, the consequence is design, not deletion: collection is configurable by employer, jurisdiction and form version with effective dates, because which questions are asked, of whom, changed three times in two years and may change again when the EEO-1 rule is finalized. Lever's own note that disability information is "only allowed for US contractors" is the kind of rule that now needs a date on it.

## AI in Hiring

Software that screens resumes, ranks candidates, scores video interviews or recommends who advances is regulated in three ways: anti-discrimination law applies to its outcomes as to any selection procedure, a few jurisdictions require audits or notices before it is used, and state privacy and AI laws add disclosure and appeal rights. As of November 2026:

| Jurisdiction | Law | What it requires | Status |
| --- | --- | --- | --- |
| **Federal** | Title VII, the ADA, the ADEA; the Uniform Guidelines (29 CFR 1607) | Outcomes of any selection procedure, automated or not, are tested for adverse impact; the four-fifths rule is the agencies' rule of thumb | In force |
| **New York City** | Local Law 144 of 2021 | An automated employment decision tool may be used only if it has "been subject to a bias audit within one year of the use of the tool," a summary of the results is public, and notice is given "10 business days prior to use" | Enforced by DCWP since July 5, 2023 |
| **California** | Civil Rights Council regulations on automated-decision systems | Use of an automated-decision system can violate anti-discrimination law; employment records, including automated-decision data, kept at least four years; ADS assessments that elicit disability information can be an unlawful medical inquiry | Effective October 1, 2025 |
| **Colorado** | SB 26-189, "Automated Decision-Making Technology" | Repeals and reenacts the 2024 AI act (SB 24-205) as an ADMT law for consequential decisions including employment: notice at the point of interaction, a plain-language description of the tool's role within 30 days after an adverse outcome, rights to request and correct data and to "meaningful human review and reconsideration," and records kept at least 3 years; developer documentation from January 1, 2027; attorney general rules due by January 1, 2027 | Signed May 14, 2026 (Session Law Chapter 131) |
| **Illinois** | HB 3773 (Public Act 103-0804), amending the Human Rights Act | Bars using AI that has the effect of discriminating, and requires notice to employees of AI use in employment decisions | Effective January 1, 2026; implementing rules not final |

<!-- source-gap: wf-ats-illinois-hb3773 | secondary | Illinois HB 3773 effective January 1, 2026, its notice duty, and the status of IDHR's implementing rules | closes with: the Public Act text on ilga.gov and an IDHR rulemaking page | checked: 2026-11-09 -->

### Worked Numbers: An Impact Ratio

The numbers are invented. A resume-screening tool reviews 400 applications for one job family in a quarter: 200 from men and 200 from women, by self-identification. It advances 80 men and 56 women to a recruiter screen.

| Group | Applicants | Advanced | Selection rate | Ratio to highest rate |
| --- | --- | --- | --- | --- |
| Men | 200 | 80 | 40.0% | 1.00 |
| Women | 200 | 56 | 28.0% | 0.70 |

Under the Uniform Guidelines, a selection rate "less than four-fifths (4/5) (or eighty percent) of the rate for the group with the highest rate" is generally regarded as evidence of adverse impact, and 0.70 is below 0.80. The guidelines add that differences "may not constitute adverse impact where the differences are based on small numbers and are not statistically significant," so a real analysis also tests significance. A New York City bias audit computes the same kind of ratio by sex, race and ethnicity and their intersections, which means the ATS must be able to join the tool's outcomes to self-identification for the auditor, under access controls, for every use in the year.

<!-- source-gap: wf-ats-ll144-ratio | missing | the DCWP rule definitions of selection rate, scoring rate and impact ratio for Local Law 144 bias audits (6 RCNY 5-300) | closes with: the adopted rule text from the City Record or rules.cityofnewyork.us | checked: 2026-11-09 -->

What an ATS needs to support these laws is narrow and concrete: an inventory of every automated tool in the hiring flow with its vendor, version and the stage it acts on; the date of each tool's latest bias audit and the published summary; the notice given to each candidate, with its date and channel; the tool's input and output per application, retained as long as the strictest applicable rule requires; a way to route a candidate to human review or an alternative process on request; and the self-identification join for auditors. The tables below carry exactly that.

## Candidate Data Retention

Candidate data has two kinds of clock: how long the law requires it be kept, and how long privacy law allows it be kept without a reason.

| Rule | What it covers | How long |
| --- | --- | --- |
| **29 CFR 1602.14** (Title VII, ADA, GINA) | "application forms," records on hiring, promotion and other personnel actions | "one year from the date of the making of the record or the personnel action involved, whichever occurs later," and until final disposition of any charge |
| **29 CFR 1627.3** (ADEA) | Job applications and resumes, test papers, job advertisements | "1 year from the date of the personnel action" |
| **California** (Civil Rights Council regulations) | Employment records including automated-decision data | At least four years |
| **Colorado SB 26-189** | Records of compliance with the ADMT law | At least 3 years |
| **CCPA and CPRA** | Personal information of California residents, which "includes California residents that are employees or job applicants" | Retained only as long as reasonably necessary; deletion on request subject to exceptions such as to "Comply with a legal obligation" |
| **GDPR** (EU and UK candidates) | All personal data of candidates | Limited to the purpose; Lever and SmartRecruiters expose consent and expiry for it |

The EEOC's proposed rescission would also remove the part 1602 recordkeeping rules; until a final rule says so, 1602.14 applies. Employee Records, Privacy & Retention covers the schedule as a system. For an ATS the practical rule is that every candidate, application and AI tool output gets a retention date computed from the strictest rule that applies to the jurisdiction and the employer, a hold stops the clock when a charge or suit is filed, and expiry means anonymization of the person while keeping the counts: Greenhouse's anonymize endpoint takes a list of fields, and Lever keeps "Non-personal metadata" on an anonymized record "for accurate reporting purposes," which is what an adverse impact analysis still needs a year later.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Candidates are `persons` before they are workers, so a hire reuses the person row and the HRIS creates the worker and employment; offers, postings and notices are `documents` with versions.

```sql
CREATE TABLE requisitions (                -- the approved decision to hire
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  position_id         UUID REFERENCES positions (id),      -- position management
  job_code            TEXT NOT NULL,
  org_unit_id         UUID REFERENCES org_units (id),
  work_location_id    UUID REFERENCES work_locations (id),
  openings            SMALLINT NOT NULL DEFAULT 1 CHECK (openings > 0),
  pay_range_id        UUID,                  -- pay_ranges, Pay Transparency
  target_start_on     DATE,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved',
                        'open', 'on_hold', 'filled', 'canceled')),
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ
);

CREATE TABLE candidates (                  -- a person in the ATS, before or without a hire
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  person_id           UUID NOT NULL REFERENCES persons (id),
  source              TEXT,                  -- 'job_board', 'referral', 'agency', 'sourced', ...
  consent_expires_on  DATE,                  -- GDPR consent, where it applies
  retention_until     DATE NOT NULL,         -- strictest applicable rule, recomputed on change
  anonymized_at       TIMESTAMPTZ,
  UNIQUE (company_id, person_id)
);

CREATE TABLE applications (                -- one candidate's attempt at one requisition
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  candidate_id        UUID NOT NULL REFERENCES candidates (id),
  requisition_id      UUID NOT NULL REFERENCES requisitions (id),
  job_posting_id      UUID,                  -- job_postings, the version applied to
  applied_at          TIMESTAMPTZ NOT NULL,
  applicant_jurisdiction_id UUID REFERENCES tax_jurisdictions (id),  -- for state and city rules
  stage               TEXT NOT NULL,
  disposition         TEXT CHECK (disposition IN ('hired', 'rejected', 'withdrawn', 'closed')),
  disposition_reason  TEXT,                  -- required when rejected
  disposed_by         TEXT,
  disposed_at         TIMESTAMPTZ,
  CHECK ((disposition = 'rejected') <= (disposition_reason IS NOT NULL))
);

CREATE TABLE application_stage_events (    -- every move, with who and when
  application_id      UUID NOT NULL REFERENCES applications (id),
  seq                 INT NOT NULL,
  from_stage          TEXT,
  to_stage            TEXT NOT NULL,
  actor               TEXT NOT NULL,         -- a user, or a hiring tool (hiring_tool_audits)
  hiring_tool_id      UUID,
  occurred_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (application_id, seq)
);

CREATE TABLE offers (                      -- versioned; a signed offer never changes
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  version             SMALLINT NOT NULL,
  start_on            DATE NOT NULL,
  job_code            TEXT NOT NULL,
  flsa_status         TEXT NOT NULL CHECK (flsa_status IN ('exempt', 'nonexempt')),
  pay_basis           TEXT NOT NULL CHECK (pay_basis IN ('hourly', 'salary', 'piece',
                        'commission')),
  rate                NUMERIC(14, 4) NOT NULL,
  rate_unit           TEXT NOT NULL CHECK (rate_unit IN ('hour', 'year', 'period')),
  contingencies       TEXT[] NOT NULL DEFAULT '{}',   -- 'background_check', 'drug_test', ...
  conditional         BOOLEAN NOT NULL DEFAULT TRUE,  -- fair chance: checks run after this
  status              TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved',
                        'sent', 'accepted', 'declined', 'rescinded', 'expired')),
  document_id         UUID REFERENCES documents (id), -- the letter as sent and signed
  expires_at          TIMESTAMPTZ,
  accepted_at         TIMESTAMPTZ,
  hire_event_id       UUID REFERENCES worker_change_events (id),
  UNIQUE (application_id, version)
);

CREATE TABLE eeo_self_ids (                -- voluntary; never visible to decision makers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id           UUID NOT NULL REFERENCES persons (id),
  context             TEXT NOT NULL CHECK (context IN ('applicant', 'employee')),
  application_id      UUID REFERENCES applications (id),
  form_ref            TEXT NOT NULL,         -- which question set and version was shown
  race_ethnicity      TEXT,                  -- null when declined
  sex                 TEXT,
  veteran_status      TEXT,
  disability_status   TEXT,
  declined_all        BOOLEAN NOT NULL DEFAULT FALSE,
  collected_at        TIMESTAMPTZ NOT NULL,
  retention_until     DATE NOT NULL
);

CREATE TABLE hiring_tools (                -- every automated tool in the flow
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  vendor              TEXT NOT NULL,
  name                TEXT NOT NULL,
  version             TEXT NOT NULL,
  stage               TEXT NOT NULL,         -- 'resume_screen', 'assessment', 'interview', ...
  decision_role       TEXT NOT NULL CHECK (decision_role IN ('ranks', 'scores', 'recommends',
                        'decides')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE hiring_tool_audits (          -- bias audits, published summaries and notices
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  hiring_tool_id      UUID NOT NULL REFERENCES hiring_tools (id),
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- NYC, Colorado, ...
  kind                TEXT NOT NULL CHECK (kind IN ('bias_audit', 'impact_assessment',
                        'notice_published', 'summary_published')),
  auditor             TEXT,
  data_period         DATERANGE,             -- the outcomes the audit analyzed
  results             JSONB,                 -- selection rates and ratios by category
  completed_on        DATE NOT NULL,
  valid_until         DATE,                  -- NYC: one year
  document_id         UUID REFERENCES documents (id)
);

CREATE TABLE hiring_tool_outputs (         -- what the tool said about each application
  application_id      UUID NOT NULL REFERENCES applications (id),
  hiring_tool_id      UUID NOT NULL REFERENCES hiring_tools (id),
  output              JSONB NOT NULL,        -- score, rank, recommendation
  notice_given_at     TIMESTAMPTZ,           -- the candidate's notice, per jurisdiction
  human_review_requested_at TIMESTAMPTZ,
  produced_at         TIMESTAMPTZ NOT NULL,
  retention_until     DATE NOT NULL,
  PRIMARY KEY (application_id, hiring_tool_id, produced_at)
);
```

A tool's use is lawful in New York City on a date only if an audit is current; the check before a tool acts on an application in a covered jurisdiction is a query, not a reminder:

```sql
SELECT t.id
FROM hiring_tools t
WHERE t.id = $1
  AND t.valid_during @> CURRENT_DATE
  AND EXISTS (SELECT 1 FROM hiring_tool_audits a
              WHERE a.hiring_tool_id = t.id
                AND a.kind = 'bias_audit'
                AND a.jurisdiction_id = $2
                AND CURRENT_DATE <= a.valid_until);
```

Design notes:

- **The person is reused at hire.** `candidates.person_id` is the same `persons` row the HRIS uses, so identity is entered once, and a candidate who is a former employee is recognized as a rehire.
- **Self-identification has its own table and its own role.** No recruiter or interviewer role can read `eeo_self_ids`; reports and auditors read aggregates through a separate service ([Access](/docs/security/sensitive-data#access)).
- **Every stage move names its actor, including tools.** `application_stage_events.hiring_tool_id` is what lets an audit find every decision a tool touched.
- **Retention dates are computed and recomputed.** A rule change, a new jurisdiction or a legal hold recomputes `retention_until`; expiry anonymizes the person and keeps the counts ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).
- **The offer links to the hire.** `offers.hire_event_id` ties the accepted version to the HRIS `worker_change_events` row it produced, so pay at hire can always be traced to the letter.

## Auditing

An ATS is audited by EEOC charges, OFCCP compliance reviews under the remaining programs, New York City and Colorado enforcement, state civil rights agencies and privacy regulators. Keep:

- **Each requisition, posting version and application** with its stage history, disposition and reason, for at least the longest applicable retention period.
- **Self-identification separately,** with the form version shown and who has read the aggregates.
- **Every automated tool's inventory, audits, published summaries and notices,** and its output per application.
- **Offers as sent and signed,** with approvals and the hire event they produced.
- **Deletion and anonymization actions,** with the rule that allowed them and any hold that blocked them.

## What This Means for the System You Build

- **Separate the candidate from each application,** and reuse the person record at hire.
- **Version postings and offers,** and keep what the candidate saw on the day they saw it.
- **Require a disposition reason** for every rejection, from a controlled list.
- **Store self-identification apart and out of decision makers' reach,** with collection rules that are configurable and dated.
- **Inventory every automated hiring tool** and record its audits, notices and outputs per application.
- **Block a tool's use in a jurisdiction when its audit lapses.**
- **Compute retention per record from the strictest applicable rule,** and anonymize on expiry while keeping the counts.

## References

**Law and regulation**

- [29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14), application forms and personnel records kept one year from the record or action, and until final disposition of a charge
- [29 CFR 1627.3](https://www.law.cornell.edu/cfr/text/29/1627.3), ADEA records: applications, resumes, tests and job advertisements kept one year
- [29 CFR 1607.4](https://www.law.cornell.edu/cfr/text/29/1607.4), the four-fifths rule and the small numbers caveat
- [Colorado General Assembly: SB26-189, Automated Decision-Making Technology](https://leg.colorado.gov/bills/sb26-189), signed May 14, 2026, repealing and reenacting SB 24-205, notices, adverse outcome descriptions, human review and 3-year records
- [California Civil Code 1798.105](https://california.public.law/codes/civil_code_section_1798.105), CCPA deletion and the exception to comply with a legal obligation

**Agency guidance and forms**

- [EEOC: EEO data collections](https://www.eeoc.gov/data/eeo-data-collections), the closed 2024 EEO-1 collection, no 2025 collection posted, and filer thresholds
- [Federal Register: Removal of Reporting Requirements (2026-14937)](https://www.federalregister.gov/api/v1/documents/2026-14937.json), 91 FR 46332, the proposed rescission of EEO-1 to EEO-6 and part 1602 recordkeeping, comments to August 24, 2026
- [Federal Register: EEOC documents](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=equal-employment-opportunity-commission&order=newest&per_page=10), no final rule on the rescission as of November 9, 2026
- [OFCCP: Home](https://www.dol.gov/agencies/ofccp), EO 14173's revocation of EO 11246 and Section 503 and VEVRAA remaining in effect
- [OFCCP: Self-identification forms](https://www.dol.gov/agencies/ofccp/self-id-forms), the disability self-identification form discontinued effective September 21, 2026
- [Federal Register: OFCCP documents](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=federal-contract-compliance-programs-office&order=newest&per_page=10), the three final rules of August 21, 2026 (2026-17114, 2026-17115, 2026-17116)
- [Federal Register: Section 503 final rule (2026-17115)](https://www.federalregister.gov/api/v1/documents/2026-17115.json), 91 FR 54482, effective September 21, 2026
- [Federal Register: VEVRAA final rule (2026-17116)](https://www.federalregister.gov/api/v1/documents/2026-17116.json), 91 FR 54234, effective September 21, 2026
- [NYC DCWP: Automated employment decision tools](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page), the bias audit within one year, public results, 10-business-day notice and enforcement from July 5, 2023
- [California Civil Rights Department: Civil Rights Council secures approval for AI regulations](https://calcivilrights.ca.gov/2025/06/30/civil-rights-council-secures-approval-for-regulations-to-protect-against-employment-discrimination-related-to-artificial-intelligence/), effective October 1, 2025, four-year records and ADS medical inquiries
- [California Privacy Protection Agency: FAQ](https://cppa.ca.gov/faq.html), the CCPA's coverage of employees and job applicants

**Vendor documentation**

- [Ashby: Developer documentation](https://developers.ashbyhq.com/), candidates, applications, offers, openings and the candidateHire webhook
- [Greenhouse: Harvest API](https://docs.greenhouse.io/harvest.html), the v1/v2 deprecation and removal date, the hire endpoint's approval requirement and the anonymize endpoint
- [Greenhouse: Harvest v3](https://harvestdocs.greenhouse.io/), applications as the bridge between candidate and job, EEOC data and demographic answers
- [Greenhouse: Webhooks](https://docs.greenhouse.io/webhooks.html), hire_candidate on offer acceptance, offer events and candidate_anonymized
- [iCIMS: Developer community](https://developer-community.icims.com/), access by request
- [Lever: API documentation](https://hire.lever.co/developer/documentation), opportunities, EEO responses and PII, the disability collection note, candidateHired, offer statuses, posting salary ranges and anonymization
- [SmartRecruiters: Developer portal](https://developers.smartrecruiters.com/), consent requests, audit data retention, webhook activation and offer access
- [Workable: API documentation](https://workable.readme.io/), scopes, offers with user tokens and subscriptions
- [Workday: Public web services](https://community.workday.com/sites/default/files/file-hosting/productionapi/index.html), the Recruiting service in the v47.1 list
