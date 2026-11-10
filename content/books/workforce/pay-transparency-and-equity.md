+++
title = "Pay Transparency, Pay Equity & EEO-1"
nav_title = "Pay Transparency"
description = "Salary range posting laws as a rules table, salary history bans, state pay data reports, EEO-1's proposed rescission, the EU Directive and pay equity."
category = "Workforce Industry"
order = 2639
part = "Hiring and HR Records"
tags = ["pay-transparency", "pay-equity", "eeo-1", "compliance", "eu", "compensation"]
+++

Pay used to be private until the offer. A growing list of states and cities now require an employer to publish the pay range for a job in the posting, to give it to applicants and employees who ask, to stop asking candidates what they earned before, and, for larger employers, to report pay by sex, race and job category to the state every year. The EU's Pay Transparency Directive goes further: a range before the interview, a right for every worker to learn the average pay of colleagues doing the same work by sex, a published gender pay gap, and a joint assessment with worker representatives when a gap of 5% or more can't be explained. Federally, the direction is the opposite: the EEO-1 report that collected the same kind of data for decades is the subject of a proposed rescission.

For software, every one of these laws is a rule keyed by where the job is, where the applicant is, how many employees the employer has and in which state, and the date. A posting for a remote job advertised nationwide can be subject to a dozen laws at once. The same job architecture that answers "what range goes in this posting" answers "what are the comparison groups for a pay equity analysis" and "which job category does this person go in on a pay data report," which is why the chapter treats them together. Job codes and positions come from [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth#positions-and-org-structures); postings and offers from [Recruiting, ATS & AI in Hiring](/books/workforce/recruiting-and-hiring#requisitions-postings-and-applications).

## How the Platforms Do It

What pay equity and compensation vendors publish, and what ATS and HRIS vendors expose for pay ranges, as of November 2026:

| Vendor | Category | What it publishes |
| --- | --- | --- |
| **Lever** | ATS | Postings carry a `salaryRange` with `min`, `max`, `currency` and `interval` |
| **Pave** | Compensation platform | "Pave connects to HRIS, ATS, and equity systems to create a unified, real-time data foundation for compensation decisions" |
| **Payscale** | Compensation data and software | "Analyze pay equity with auditable methodology" |
| **Syndio** | Pay equity software | "the pay equity leader trusted by 350+ global enterprises," with "EU Pay Transparency Directive readiness built in: continuous pay gap reporting across jurisdictions" |

<!-- source-gap: wf-pay-vendors | missing | public product documentation for Trusaic, Carta Total Compensation, Mercer and HCM suites' pay transparency features | closes with: public product or help pages describing range management and pay gap reporting | checked: 2026-11-09 -->

The industry's split is between systems that hold the ranges (compensation planning and the job architecture in the HRIS), systems that publish them (the ATS and job boards), and systems that analyze outcomes (pay equity tools that read the HRIS's job, pay and demographic data). The data model below follows the same split.

## Salary Range Posting Laws

The rules as of November 2026. Rows marked *secondary* rest on Brightmine's chart (published April 29, 2026) because the primary source couldn't be opened; the rest cite the statute or the agency.

| Jurisdiction | Law | Employers covered | In the posting | Other duties | In force |
| --- | --- | --- | --- | --- | --- |
| **California** | Labor Code 432.3 | 15 or more employees for postings; all employers for requests | "the pay scale for a position," defined as "a good faith estimate of the salary or hourly wage range that the employer reasonably expects to pay"; third-party posters must include it | Pay scale to an applicant "upon reasonable request" and to an employee for their own position; job title and wage rate history kept for employment plus three years; penalties of $100 to $10,000 per violation, none for a first posting violation if every open posting is updated | Yes; text updated January 1, 2026 |
| **Colorado** | Equal Pay for Equal Work Act, part 2 | Employers with employees in Colorado (*secondary*: at least one) | Compensation "in all job postings and notices, both internal and public," with benefits and how to apply | Disclose who was selected for a role; disclose career progressions where they exist | Yes; complaints tracked since January 1, 2021 |
| **Connecticut** | Gen. Stat. 31-40z | No size threshold in the section | No posting rule in the version through January 1, 2025 (*secondary*: a posting rule from October 1, 2026) | Range to an applicant on request or at the offer, and to an employee at hire, at a change of position or on first request | Yes |
| **District of Columbia** | D.C. Code 32-1453.01 (D.C. Law 25-138) | No size threshold in the section | "the minimum and maximum projected salary or hourly pay in all job listings and position descriptions advertised" | Disclose healthcare benefits "before the first interview" | Yes |
| **Maryland** | Labor and Employment 3-304.2 | No size threshold in the section | "the wage range and a general description of benefits" in "each public or internal posting" | Without a posting, before compensation is discussed | Yes |
| **Massachusetts** | G.L. c. 149, s. 105F (Chapter 141 of the Acts of 2024) | 25 or more employees in the commonwealth | "the pay range for a particular and specific employment position" | Range to an employee offered a promotion or transfer, and on request to an employee or applicant; a 2-business-day cure in the first two years | One year after the act's effective date (approved July 31, 2024) |
| **Minnesota** | Minn. Stat. 181.173 | 30 or more employees at sites in Minnesota | "the starting salary range" and "a general description of all of the benefits and other compensation" | | Yes |
| **New Jersey** | P.L.2024, c.91 | 10 or more employees over 20 calendar weeks | "the hourly wage or salary, or a range," and "a general description of benefits and other compensation programs" | Reasonable efforts to announce promotion opportunities | From the first day of the seventh month after enactment (approved November 18, 2024): June 1, 2025 by my count |
| **New York State** | Labor Law 194-b | Four or more employees | Pay ranges for "designated job opportunities, promotions, and transfers," as a minimum and maximum annual salary or hourly rate, with job descriptions | | Yes |
| **Nevada** | NRS 613.133 | No size threshold in the section | No posting rule | The range "To an applicant for employment who has completed an interview" | Yes (2021) |
| **Vermont** | 21 V.S.A. 495p | Five or more employees | "the compensation or range of compensation for the job opening," including positions current employees can move into | | July 1, 2025 |
| **Washington** | RCW 49.58.110 | 15 or more employees | "The wage scale or salary range" and "a general description of all of the benefits and other compensation" | Range on request for an internal transfer or promotion; no penalty if a posting is corrected "within five business days" of written notice, for postings from July 27, 2025 through July 27, 2027 | January 1, 2023; amended 2025 |
| **Delaware** | *secondary* | More than 25 employees | Range and benefits | | September 26, 2027 |
| **Hawaii** | HRS 378-2.4, *secondary* | 50 or more employees | Hourly rate or salary range; internal promotions excluded | | Yes |
| **Illinois** | 820 ILCS 112/10, *secondary* | 15 or more employees | Pay scale and benefits | Notify current employees of promotion opportunities | Yes |
| **Maine** | *secondary* | 10 or more employees | Range | | Yes |
| **Rhode Island** | *secondary* | All employers | No posting rule | Range on request | Yes |
| **Virginia** | *secondary* | All employers | Range | | Yes |
| **New York City** | *secondary* | Four or more employees | Range in any ad for a job, promotion or transfer | | Yes |

<!-- source-gap: wf-pay-primaries | secondary | Delaware, Hawaii, Illinois, Maine, Rhode Island, Virginia and New York City pay transparency rules, Connecticut's 2026 posting amendment, Massachusetts' effective date, and effective dates for California's 432.3 posting rule, Minnesota and New York State | closes with: each statute or agency page (ilga.gov, capitol.hawaii.gov, mass.gov and nyc.gov were blocked or missing) | checked: 2026-11-09 -->

Cities add their own (Brightmine lists Jersey City at five or more employees, Cleveland at 15 or more and Columbus from January 1, 2027, among others), and the chart counts 27 jurisdictions in all.

Colorado publishes enforcement numbers, which show what the rules look like in practice. As of its table updated November 3, 2026: 3,104 pay transparency complaints since January 1, 2021, 647 voluntary compliance letters, a 78.92% cure rate, and 24 citations, 10 of them with fines totaling $841,500 ($482,450 after settlement and waiver). Most complaints end with a corrected posting, which is why California, Washington and Massachusetts build in cure windows: the operational requirement is to be able to find and fix every live posting fast.

### Worked Numbers: One Remote Posting

The example is invented. An employer with 400 employees (60 in California, 30 in Colorado, 40 in Washington, 20 in Massachusetts and the rest in Texas) posts a fully remote software engineer role on its careers site and on job boards, open to applicants anywhere in the United States. My reading of the table (each agency's guidance on remote postings decides the close cases):

| Law | Applies? | Why |
| --- | --- | --- |
| California | Yes | 15 or more employees, and the job could be filled in California |
| Colorado | Yes | Employees in Colorado and a posting open to Colorado |
| Washington | Yes | 15 or more employees and a posting a Washington resident can fill |
| Massachusetts | No | 20 employees in the commonwealth, under the 25 threshold |
| Minnesota | No | No employees in Minnesota, under the 30 at Minnesota sites threshold |
| New York State | Possibly | Coverage turns on whether the role could be performed in New York, which the employer must decide from the agency's guidance |
| Texas | No | No posting law |

The posting needs a good-faith range (California's and Washington's definitions), a general description of benefits (Washington, Colorado) and how to apply (Colorado). One range that satisfies the strictest set is the usual answer; the alternative, location-specific ranges, needs one posting per location or a range table in the posting. The decision depends on headcount by state on the posting date, so the engine reads `work_locations` and employee counts as of that date and re-evaluates postings when a threshold is crossed.

## Salary History Bans

A salary history ban stops the employer from asking what a candidate earned before, and usually from relying on it if volunteered. Among the primary sources above: California's employer "cannot, orally or in writing, personally or through an agent, seek salary history information"; Colorado's law prohibits "asking about an applicant's pay history"; Maryland's employer may not "seek the wage history for an applicant"; Nevada's may not "Seek the wage or salary history of an applicant"; and Connecticut bans asking about "a prospective employee's wage and salary history." The EU Directive does the same: "An employer shall not ask applicants about their pay history" (Art. 5(2)).

For an ATS the ban is a property of the application form and the recruiter's tools: no pay history question in the form for covered applicants, a "desired pay" question instead where allowed, and no field in the candidate record that a recruiter can fill with a previous salary. [Recruiting, ATS & AI in Hiring](/books/workforce/recruiting-and-hiring)'s `applications.applicant_jurisdiction_id` is what selects the form.

## Pay Data Reporting

Two states require annual pay data from larger employers, and both are built on federal EEO categories.

**California.** Under Government Code 12999, "private employers of 100 or more payroll employees and private client employers of 100 or more labor contractor employees" file pay data reports with the Civil Rights Department "on or before the second Wednesday of May of each year"; reports for reporting year 2025 were due May 13, 2026. Each establishment reports employee counts by "race/ethnicity, sex, job category, pay band, exemption status, and employment type," payroll employees and labor contractor employees go in separate reports ("Do not combine"), and employees "physically located in California... including by working remotely" are included. Failure to file can lead to a court order, costs and penalties.

**Massachusetts.** Employers with "not less than 100 employees in the commonwealth" that are subject to federal EEO reports file a copy of them with the state "Annually, not later than February 1" (G.L. c. 149, s. 105E): the EEO-1 every year, and the EEO-3 and EEO-5 or EEO-4 in alternate years. Because the obligation is defined by the federal reports, a final EEOC rescission would change what Massachusetts receives, and the engine should key the Massachusetts filing to the federal form's status by year rather than assume it.

<!-- source-gap: wf-pay-illinois-eprc | missing | Illinois Equal Pay Registration Certificate requirements, thresholds and filing cycle | closes with: the Illinois Department of Labor EPRC page | checked: 2026-11-09 -->

The pay band is the technical core of California's report: each employee is counted in a band by pay, within a job category, which means the report is computed from what was paid, not from rates in the HRIS: the core model's `accumulators` by worker and year, joined to the job category from the job catalog and to the employee's self-identification.

## EEO-1 Component 1

The EEO-1 requires "all private sector employers with 100 or more employees, and federal contractors with 50 or more employees meeting certain criteria, to submit workforce demographic data" by job category, sex and race or ethnicity. As of November 2026:

- **The last collection.** "The 2024 EEO-1 Component 1 Data Collection is CLOSED," and the EEOC says updates on a 2025 collection "will be posted to this page as they become available."
- **The proposal.** "Removal of Reporting Requirements" (91 FR 46332, published July 23, 2026) would rescind the EEO-1 through EEO-6 reports and the related recordkeeping and record preservation requirements in 29 CFR part 1602, which the EEOC calls "inconsistent with equal employment opportunity law and potentially unconstitutional." Comments closed August 24, 2026, after a public hearing noticed July 30.
- **The status.** No final rule appears in the Federal Register's EEOC listing as of November 9, 2026, and the proposal itself says the Commission will include other part 1602 revisions in "the final rule issued at the conclusion of this rulemaking." The reporting requirement remains in the regulations until a final rule removes it.

<!-- source-gap: wf-pay-eeo1-final | status | whether the EEOC finalizes the rescission of EEO-1 reporting and part 1602 recordkeeping | closes with: a final rule in the Federal Register or a 2025 collection notice on eeoc.gov | checked: 2026-11-09 -->

A system should keep the EEO-1's data model even if the federal report goes: California's and Massachusetts' reports use its job categories and demographic categories, pay equity analyses use the same groupings, and an employer's own records of the snapshot it filed for 2024 stay within their retention period. What changes is that the federal filing becomes a `filings` row the calendar stops generating once the rule's effective date passes.

## The EU Pay Transparency Directive

Directive (EU) 2023/970 binds employers through national law, and Member States had to "bring into force the laws, regulations and administrative provisions necessary to comply with this Directive by 7 June 2026" (Art. 34). Its employer duties:

| Article | Duty |
| --- | --- |
| **5(1)** | Applicants receive "the initial pay or its range, based on objective, gender-neutral criteria," for example "in a published job vacancy notice, prior to the job interview or otherwise" |
| **5(2)** | No questions about pay history |
| **6** | Make available the criteria for pay, pay levels and pay progression (Member States "may exempt employers with fewer than 50 workers" from the progression part) |
| **7** | Workers may request "their individual pay level and the average pay levels, broken down by sex," for workers doing the same work or work of equal value; employers tell workers of the right "on an annual basis" and answer "in any event within two months"; contract terms that bar disclosing pay are prohibited |
| **9** | Gender pay gap reports: employers with 250 or more workers "by 7 June 2027 and every year thereafter"; 150 to 249 "by 7 June 2027 and every three years thereafter"; 100 to 149 "by 7 June 2031 and every three years thereafter" |
| **10** | A joint pay assessment with workers' representatives when the report shows a gap of at least 5% in a category of workers that the employer hasn't justified by objective, gender-neutral criteria and hasn't remedied within six months |

"Pay level" means "gross annual pay and the corresponding gross hourly pay" (Art. 3(1)(b)), so the system needs both, from actual pay, by worker.

Transposition is uneven. The EUR-Lex national transposition page (updated weekly, with Member States solely responsible for its content) lists notified measures from 17 Member States (Austria, Belgium, Bulgaria, Czechia, Estonia, Finland, Greece, Italy, Latvia, Lithuania, Malta, Poland, Romania, Slovakia, Slovenia, Spain and Sweden) and none from ten (Croatia, Cyprus, Denmark, France, Germany, Hungary, Ireland, Luxembourg, the Netherlands and Portugal), as of November 2026. A notification shows that a state sent a measure, not that it transposed the whole directive.

<!-- source-gap: wf-pay-eu-status | secondary | which Member States have fully transposed Directive 2023/970 and the European Commission's position on delays | closes with: the Commission's transposition scoreboard or infringement notices | checked: 2026-11-09 -->

## Pay Equity Analysis as a System

A pay equity analysis asks whether people doing comparable work are paid differently by sex or race once legitimate factors are accounted for. It has three layers, and each is a data problem before it is a statistics problem:

1. **Comparison groups.** Who is doing "the same work or work of equal value." This is the job architecture: job family, level and code, sometimes location. Bad job codes produce meaningless groups, which is why the analysis depends on the HRIS more than on the model.
2. **Pay.** Base pay as a rate, and total pay as paid (bonuses, commissions, overtime, allowances), annualized and in hourly terms. The EU's "pay level" is gross annual and gross hourly pay; California's pay band uses box 5 wages. Both come from statement lines.
3. **Explanatory factors.** Tenure, time in level, performance rating, location, and the like, each effective-dated, so the analysis can be reproduced as of its snapshot date.

The unadjusted gap in a group is simple arithmetic; the adjusted gap comes from a regression of pay on the factors plus a sex or race indicator, and the coefficient on the indicator is the gap the factors don't explain. Vendors (Syndio's "continuous pay gap reporting," Payscale's "auditable methodology") sell the adjusted analysis, the remediation budget and the audit trail around it.

### Worked Numbers: The 5% Trigger

The numbers are invented. A Member State employer with 300 workers reports by category of workers doing work of equal value. One category has 12 women with an average gross hourly pay of €31.20 and 15 men averaging €33.40.

| Category | Women | Avg hourly (women) | Men | Avg hourly (men) | Gap |
| --- | --- | --- | --- | --- | --- |
| Engineering, level 3 | 12 | €31.20 | 15 | €33.40 | (33.40 - 31.20) / 33.40 = 6.59% |
| Engineering, level 4 | 6 | €40.10 | 9 | €41.00 | (41.00 - 40.10) / 41.00 = 2.20% |

My arithmetic, measuring the gap against men's average. Level 3's 6.59% is at least 5%; unless the employer justifies it by objective, gender-neutral criteria (time in level, say, if the women were promoted more recently) or closes it within six months, Article 10 requires a joint pay assessment with workers' representatives. Level 4's gap is under the trigger. Closing level 3's gap by raising each woman's rate by €2.20 an hour for a full-time year of about 1,720 hours (an assumption) costs 12 x €2.20 x 1,720 = €45,408 before employer social contributions: the number a remediation budget has to produce, and the reason the analysis runs before the report is due, not after.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Ranges belong to jobs and locations, postings to requisitions, reports to `filings`, and analyses are snapshots with their inputs.

```sql
CREATE TABLE pay_ranges (                  -- the range for a job, by geography, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  job_code            TEXT NOT NULL,
  geo_zone            TEXT NOT NULL DEFAULT 'national',   -- a location tier or 'national'
  rate_unit           TEXT NOT NULL CHECK (rate_unit IN ('hour', 'year')),
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  min_amount          BIGINT NOT NULL,       -- minor units
  max_amount          BIGINT NOT NULL,
  basis               TEXT NOT NULL,         -- how the good faith estimate was set
  valid_during        DATERANGE NOT NULL,
  CHECK (max_amount >= min_amount),
  EXCLUDE USING GIST (company_id WITH =, job_code WITH =, geo_zone WITH =, valid_during WITH &&)
);

ALTER TABLE requisitions ADD FOREIGN KEY (pay_range_id) REFERENCES pay_ranges (id);

CREATE TABLE pay_transparency_rules (      -- the rules table above, as data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  min_employees       INT NOT NULL,
  headcount_scope     TEXT NOT NULL CHECK (headcount_scope IN ('anywhere', 'in_jurisdiction')),
  requires_range      BOOLEAN NOT NULL,
  requires_benefits   BOOLEAN NOT NULL,
  covers_internal     BOOLEAN NOT NULL,      -- promotions and transfers
  on_request_only     BOOLEAN NOT NULL,
  history_ban         BOOLEAN NOT NULL,
  cure_days           SMALLINT,              -- business days to correct after notice
  source_ref          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE job_postings (                -- every version of every posting, as published
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  requisition_id      UUID NOT NULL REFERENCES requisitions (id),
  version             SMALLINT NOT NULL,
  channel             TEXT NOT NULL CHECK (channel IN ('careers_site', 'job_board', 'internal',
                        'agency', 'social')),
  remote_scope        TEXT NOT NULL CHECK (remote_scope IN ('onsite', 'hybrid', 'remote_state',
                        'remote_us', 'remote_global')),
  target_jurisdiction_ids UUID[] NOT NULL,   -- where the job could be performed
  pay_range_id        UUID REFERENCES pay_ranges (id),
  displayed_range     JSONB,                 -- exactly what the posting showed
  benefits_text       TEXT,
  applicable_rule_ids UUID[] NOT NULL,       -- pay_transparency_rules evaluated at publish
  published_during    TSTZRANGE NOT NULL,
  document_id         UUID REFERENCES documents (id),
  UNIQUE (requisition_id, channel, version)
);

CREATE TABLE pay_data_reports (            -- California, Massachusetts and federal reports
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  filing_id           UUID REFERENCES filings (id),
  report_type         TEXT NOT NULL CHECK (report_type IN ('ca_payroll', 'ca_labor_contractor',
                        'ma_eeo_copy', 'eeo1', 'eu_gender_pay_gap', 'other')),
  reporting_year      SMALLINT NOT NULL,
  snapshot_period     DATERANGE NOT NULL,    -- the pay period or window the counts come from
  establishment_ref   TEXT,
  cells               JSONB NOT NULL,        -- job category x demographic x pay band counts
  source_query_ref    TEXT NOT NULL,         -- the query and data version that produced it
  due_on              DATE NOT NULL,
  rule_ref            TEXT NOT NULL
);

CREATE TABLE pay_equity_analyses (         -- a reproducible snapshot and its findings
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  as_of               DATE NOT NULL,
  scope               TEXT NOT NULL,         -- employers, countries, populations included
  grouping_rule       TEXT NOT NULL,         -- job family and level, location, ...
  pay_measure         TEXT NOT NULL CHECK (pay_measure IN ('base_rate', 'total_cash',
                        'eu_pay_level', 'w2_box5')),
  factors             TEXT[] NOT NULL,
  results             JSONB NOT NULL,        -- per group: counts, means, gaps, model output
  flagged_groups      JSONB NOT NULL DEFAULT '[]',   -- e.g. gap of 5% or more, unexplained
  remediation_budget  BIGINT,
  privileged          BOOLEAN NOT NULL DEFAULT FALSE,   -- run at counsel's direction
  input_snapshot_ref  TEXT NOT NULL          -- the frozen data it read
);
```

Which rules apply to a posting is a query on the posting's target jurisdictions and the employer's headcount there on the publish date:

```sql
SELECT r.*
FROM pay_transparency_rules r
WHERE r.jurisdiction_id = ANY ($1::UUID[])          -- the posting's target jurisdictions
  AND r.valid_during @> $2::DATE                    -- publish date
  AND r.min_employees <= CASE r.headcount_scope
        WHEN 'anywhere' THEN $3                     -- total employees
        ELSE (SELECT count(*) FROM job_assignments ja
              JOIN work_locations wl ON wl.id = ja.work_location_id
              WHERE r.jurisdiction_id = ANY (wl.jurisdiction_ids)
                AND ja.is_primary AND ja.valid_during @> $2::DATE)
      END;
```

Design notes:

- **The range is a record with a basis.** "Good faith estimate" is a standard of conduct, so `pay_ranges.basis` says how the range was set (the band, the budget, market data) and the posting stores the exact range it displayed.
- **Every live posting is findable.** `published_during` and `applicable_rule_ids` let an employer list every posting live in Washington last month and fix them inside a five-business-day cure window.
- **Reports come from pay, not rates.** `pay_data_reports.cells` is computed from statement lines and frozen with `source_query_ref`, so a filed report can be reproduced.
- **Analyses are snapshots.** `pay_equity_analyses.input_snapshot_ref` points at frozen inputs, so a remediation decision can be defended later against the data it was made on ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Demographics stay protected.** The analysis reads `eeo_self_ids` through an aggregation service with its own access controls; no compensation manager reads an individual's self-identification.

## Auditing

Pay transparency is enforced by complaint, and pay data by filing. Keep:

- **Every posting version** with its displayed range, channel, target jurisdictions, applicable rules and live dates.
- **Range changes** with their effective dates and basis.
- **Responses to range requests** from applicants and employees, with dates.
- **Each pay data report** as filed, the query and data version behind it, and the acknowledgment.
- **Pay equity analyses** with their snapshots, methods, findings and the remediation decisions, under privilege where counsel directed them.
- **California's job title and wage rate history** for each employee for employment plus three years.

## What This Means for the System You Build

- **Encode pay transparency laws as dated rules** keyed by jurisdiction and headcount scope, and evaluate them per posting at publish time.
- **Store the exact range each posting displayed,** and be able to list and fix every live posting in a jurisdiction within a cure window.
- **Remove pay history questions** from forms for covered applicants, by the applicant's jurisdiction.
- **Compute pay data reports from paid statement lines,** joined to the job catalog and self-identification, and freeze what was filed.
- **Keep EEO categories in the job catalog** whatever happens to the federal EEO-1, because state reports and analyses use them.
- **Produce EU pay levels as gross annual and gross hourly pay by worker,** and flag categories with gaps of 5% or more ahead of the report.
- **Run pay equity analyses as reproducible snapshots** with their inputs, factors and remediation.

## References

**Law and regulation**

- [California Labor Code 432.3](https://california.public.law/codes/labor_code_section_432.3), the salary history ban, pay scale on request and in postings, the good faith estimate, records for employment plus three years and penalties
- [California Government Code 12999 (Civil Rights Department: Pay data reporting)](https://calcivilrights.ca.gov/paydatareporting/), filers, the May 13, 2026 deadline for reporting year 2025 and the statutory basis
- [D.C. Code 32-1453.01](https://code.dccouncil.gov/us/dc/council/code/sections/32-1453.01), salary or hourly range in listings and healthcare benefits before the first interview
- [Maryland Labor and Employment 3-304.2](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gle&section=3-304.2&enactments=false), wage range and benefits in postings and the wage history ban
- [Massachusetts: Chapter 141 of the Acts of 2024](https://malegislature.gov/Laws/SessionLaws/Acts/2024/Chapter141), sections 105E (data reports by February 1) and 105F (pay ranges, 25 employees, promotions, requests, the cure period and its effective date)
- [Minnesota Statutes 181.173](https://www.revisor.mn.gov/statutes/cite/181.173), the starting salary range and benefits for employers with 30 or more employees in Minnesota
- [Nevada Revised Statutes 613.133](https://www.leg.state.nv.us/NRS/NRS-613.html), the range after an interview and the salary history ban
- [New Jersey P.L.2024, c.91](https://pub.njleg.gov/bills/2024/PL24/91_.HTM), the posting rule for employers with 10 or more employees, promotion announcements and the effective date formula
- [Vermont 21 V.S.A. 495p](https://legislature.vermont.gov/statutes/section/21/005/00495p), compensation in postings for employers with five or more employees, effective July 1, 2025
- [RCW 49.58.110](https://app.leg.wa.gov/rcw/default.aspx?cite=49.58.110), Washington's posting rule for 15 or more employees, internal transfers and the 2025 cure provision
- [Connecticut General Statutes, chapter 557 (31-40z)](https://www.cga.ct.gov/current/pub/chap_557.htm), wage ranges on request and at hire, and the salary history ban
- [Directive (EU) 2023/970](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023L0970), articles 3, 5, 6, 7, 9, 10, 34 and 35

**Agency guidance and forms**

- [California Labor Commissioner: Equal Pay Act FAQ](https://www.dir.ca.gov/dlse/california_equal_pay_act.htm), the 15-employee posting rule, requests by applicants and employees, the good faith estimate, the salary history ban and records
- [California Civil Rights Department: Pay data reporting FAQ](https://calcivilrights.ca.gov/paydatareporting/faqs/), the second Wednesday of May, separate labor contractor reports, establishment counts and remote workers
- [Colorado CDLE: Equal Pay for Equal Work Act](https://cdle.colorado.gov/dlss/labor-laws-by-topic/equal-pay-for-equal-work-act), posting and selection disclosures, the pay history ban and enforcement data updated November 3, 2026
- [New York State DOL: Pay transparency](https://dol.ny.gov/pay-transparency), employers with four or more employees and ranges for jobs, promotions and transfers
- [EEOC: EEO data collections](https://www.eeoc.gov/data/eeo-data-collections), EEO-1 filers and the closed 2024 collection
- [Federal Register: Removal of Reporting Requirements (2026-14937)](https://www.federalregister.gov/api/v1/documents/2026-14937.json), 91 FR 46332, the proposed rescission of EEO-1 to EEO-6 and part 1602 recordkeeping
- [Federal Register: EEOC documents](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=equal-employment-opportunity-commission&order=newest&per_page=10), the July 30, 2026 hearing notice and no final rule as of November 9, 2026
- [EUR-Lex: National transposition measures for Directive 2023/970](https://eur-lex.europa.eu/legal-content/EN/NIM/?uri=CELEX:32023L0970), notified measures by Member State

**Vendor documentation**

- [Lever: API documentation](https://hire.lever.co/developer/documentation), the posting salaryRange object
- [Pave](https://www.pave.com/), compensation data connected to HRIS, ATS and equity systems
- [Payscale](https://www.payscale.com/), pay equity analysis with auditable methodology
- [Syndio](https://synd.io/), pay equity software and EU directive pay gap reporting

**In practice**

- [Brightmine: U.S. pay transparency laws by state and locality](https://www.brightmine.com/us/resources/charts/u-s-pay-transparency-laws-by-state-and-locality/), the secondary rows, local laws and the count of 27 jurisdictions
