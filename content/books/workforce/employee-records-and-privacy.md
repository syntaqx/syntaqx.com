+++
title = "Employee Records, Privacy & Retention"
nav_title = "Records & Privacy"
description = "Personnel file access laws, retention schedules by record, medical record separation, employee data under the CCPA, SSN truncation and legal holds."
category = "Workforce Industry"
order = 2641
part = "Hiring and HR Records"
tags = ["hr-records", "privacy", "data-retention", "ccpa", "personnel-files", "compliance"]
+++

An employer keeps more about its people than about almost anyone else: identity numbers, home addresses, bank accounts, pay and its history, tax elections, immigration documents, background reports, medical certifications, performance reviews, discipline, and, increasingly, logs of how they work. Most of it the law requires the employer to keep for a stated time, some of it the law requires the employer to keep apart, some of it employees have a right to see, and, in California, all of it employees have a right to ask about, correct and sometimes delete. The retention periods differ by record (two years for a time card, three for a payroll record, four for employment tax records, six for benefit plan records, the later of two dates for an I-9), and the clocks start at different events (the record's creation, the last entry, the filing of the fourth-quarter return, the termination).

This chapter is the schedule and the machinery: the laws that give employees access to their files, the retention schedule by record type with worked dates, the separation of medical and genetic information, employee data under the CCPA and CPRA, SSN handling on statements and W-2s, data subject requests from employees, and legal holds. The playbook's [Data Retention](/docs/building-blocks/data-retention) covers retention engineering in general; workplace monitoring data is in Workplace & Collaboration's [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy).

## How the Platforms Do It

What HR and recruiting vendors expose for retention and erasure, as of November 2026:

| Vendor | What it publishes |
| --- | --- |
| **Greenhouse** | An anonymize endpoint that takes a list of fields ("full_name, current_company, current_title, tags, phone_numbers, emails..."), requires an On-Behalf-Of header "for auditing purposes," and fires a `candidate_anonymized` webhook |
| **Lever** | Anonymized records on which "Non-personal metadata may remain for accurate reporting purposes," and a consent expiry when GDPR is enabled |
| **SmartRecruiters** | Consent request endpoints tied to its GDPR tools, and audit data "retained at least 26 months" |
| **BambooHR** | Permissioned webhooks "limited by the permissions of the user who created them," so an integration sees only what its creator could |

The common design is anonymization rather than deletion: the person's identifying fields are removed and the record's facts (a stage, a date, a disposition, a count) stay, so reports and audits still add up. Employee records need the same pattern with one difference: most of an employee's records are under a legal retention period, so the question is usually not whether to delete but when.

## Personnel File Access

Several states give employees, and often former employees, the right to see their personnel files. As of November 2026:

| State | Law | Who and how often | Deadline | Other rules |
| --- | --- | --- | --- | --- |
| **California** | Labor Code 1198.5 | Current and former employees or their representatives, on written request; one request a year from a former employee | 30 calendar days, extendable by written agreement to no more than 35 | Keep personnel records at least three years after termination; $750 penalty; excludes records of a possible criminal investigation, letters of reference and certain exam materials |
| **Massachusetts** | G.L. c. 149, s. 52C | Employees; no more than two reviews per calendar year (a review prompted by negative information doesn't count) | 5 business days to review or receive a copy | Notify the employee within 10 days of adding information that could negatively affect them; employers with 20 or more employees keep the complete record until "a date three years after the termination of employment" |
| **Minnesota** | Minn. Stat. 181.961 | Employees once every six months; former employees "once each year after separation" while the record is kept | 7 working days, or 14 if the record is outside Minnesota | Copies free on written request after review |
| **Oregon** | ORS 652.750 | Employees | 45 days to inspect and receive a certified copy | Keep a terminated employee's personnel records at least 60 days; time and pay records as the FLSA requires |
| **Washington** | RCW 49.12.250 | Employees, by petition once a year | | The employer removes irrelevant or erroneous information or the employee files a rebuttal; a former employee may submit a rebuttal for up to two years |

For a system, a request is a case with a received date, a computed due date from the state of employment, a scope (personnel records, payroll records, both), a verification step (California allows identity verification and redaction of nonsupervisory employees' names), the package delivered and the delivery date. What a "personnel file" is matters: the law reaches records about the person's performance, discipline, pay and qualifications wherever they live, so the package is assembled from the HRIS, the performance system and the document store, not from one folder.

## Retention Schedules by Record

The federal floor, with the event each clock starts from:

| Record | Rule | Keep for | From |
| --- | --- | --- | --- |
| **Payroll records** (name, address, pay, hours, deductions) | 29 CFR 516.5 (FLSA) | "at least 3 years" | The last date of entry |
| **Certificates, agreements, plans, notices** (collective bargaining agreements, individual contracts) | 29 CFR 516.5 | At least 3 years | The last effective date |
| **Time cards, wage rate tables, records of additions and deductions** | 29 CFR 516.6 | "at least 2 years" | The last entry or last effective date |
| **Employment tax records** (W-4s, wages, tips, deposits, returns) | IRS | "at least four years after filing the 4th quarter for the year" | The fourth-quarter return; six years for qualified sick and family leave and certain employee retention credit records |
| **Form I-9** | M-274 | The later of "three years after the date of hire" and "one year after the date employment ends" | Hire and termination |
| **Applications, hiring, promotion, termination and pay records** | 29 CFR 1602.14 (Title VII, ADA, GINA) | "one year from the date of the making of the record or the personnel action involved, whichever occurs later"; one year from an involuntary termination | The record or action; held until final disposition of any charge |
| **ADEA payroll records** (name, address, date of birth, occupation, pay) | 29 CFR 1627.3 | 3 years | |
| **ADEA personnel records** (applications, promotions, discharges, tests, job ads) | 29 CFR 1627.3 | "1 year from the date of the personnel action" | The action |
| **Benefit plans and seniority systems** | 29 CFR 1627.3 | While in effect and at least 1 year after | Termination of the plan |
| **ERISA reports and supporting records** | 29 USC 1027 | "not less than six years after the filing date of the documents" | The filing |
| **FMLA records** | 29 CFR 825.500 | "for no less than three years" | |
| **OSHA 300 Log, annual summary, 301 forms** | 29 CFR 1904.33 | "five (5) years following the end of the calendar year that these records cover" | Year end |

States add their own: California's personnel records three years after termination and job title and wage rate history for employment plus three years ([Salary Range Posting Laws](/books/workforce/pay-transparency-and-equity#salary-range-posting-laws)), California's four years for employment records including automated-decision data ([Candidate Data Retention](/books/workforce/recruiting-and-hiring#candidate-data-retention)), Massachusetts' three years after termination, and many more. The EEOC's July 2026 proposal would remove part 1602's recordkeeping and preservation rules along with the EEO-1; until a final rule takes effect, 1602.14 applies.

<!-- source-gap: wf-rec-state-retention | missing | a primary-source table of state payroll and personnel record retention periods beyond California, Massachusetts and Oregon | closes with: each state labor agency's recordkeeping rule | checked: 2026-11-10 -->

### Worked Numbers: One Employee's Purge Dates

The facts are invented. An employee of a California employer is hired on Monday, March 1, 2021 and discharged on Friday, August 14, 2026. Their last pay statement is dated August 14, 2026, and the employer files its fourth-quarter 2026 Form 941 on February 1, 2027. The earliest date each record may be destroyed, absent a hold (my arithmetic):

| Record | Rule | Keep until |
| --- | --- | --- |
| Time cards for the last workweek | 2 years from last entry | Aug 14, 2028 |
| Termination and personnel action records (federal) | 1 year from the action | Aug 14, 2027 |
| ADEA payroll records | 3 years | Aug 14, 2029 |
| FLSA payroll records | 3 years from last entry | Aug 14, 2029 |
| California personnel records | 3 years after termination | Aug 14, 2029 |
| Form I-9 | max(Mar 1, 2024; Aug 14, 2027) | Aug 14, 2027 |
| 2026 employment tax records (W-4, wages, deposits) | 4 years after the Q4 return is filed | Feb 1, 2031 |
| Job title and wage rate history | Employment plus 3 years | Aug 14, 2029 |
| ERISA plan records the employee appears in | 6 years after the plan's filing | Depends on the plan's Form 5500 date, not the employee |

The record with the longest clock wins for anything that serves several purposes: a pay statement is a payroll record (3 years), an employment tax record (4 years after the fourth-quarter return) and possibly a California record, so it is kept until February 1, 2031. That is why retention is assigned per record type with every rule that applies, and the effective date is the maximum, not the first rule anyone thought of. Records that span years (a W-4 that governed withholding from 2021 to 2026) are kept for the latest year they supported.

## Medical and Genetic Information

Three federal rules require medical information to be kept apart from the personnel file:

- **ADA.** Information from post-offer medical examinations must be "collected and maintained on separate forms and in separate medical files" and treated as a confidential medical record, with narrow exceptions: supervisors may learn of work restrictions and accommodations, first aid and safety staff of conditions that may need emergency treatment, and government officials investigating compliance get relevant information (29 CFR 1630.14). Examinations of current employees must be "job-related and consistent with business necessity."
- **GINA.** Genetic information (including family medical history) is kept "on forms and in medical files" separate from personnel files and may share a file with ADA medical information; disclosure is allowed only to the employee on written request, to researchers under 45 CFR part 46, under a court order (with notice to the employee), to investigators, to support FMLA or state leave certification, and to public health agencies in narrow cases (29 CFR 1635.9).
- **FMLA.** Certifications, recertifications and medical histories are kept "as confidential medical records in separate files/records from the usual personnel files," with the ADA's and GINA's rules where they apply (29 CFR 825.500).

HIPAA mostly isn't the rule here: its definition of protected health information excludes health information "In employment records held by a covered entity in its role as employer" (45 CFR 160.103). The employer's own group health plan is a covered entity with its own HIPAA obligations, which is why plan data (claims, enrollment details the plan holds) stays with the plan and its administrators, and HR sees only what plan administration needs ([HIPAA](/docs/compliance/hipaa)).

In a system, "separate files" means separate storage with separate access: a medical record store (accommodation requests, leave certifications, drug test results, post-offer exam results, genetic information if any) whose readers are a short list of roles, whose contents never appear in the general employee profile, and whose access is logged ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)). A supervisor sees the accommodation ("may not lift more than 20 pounds"), not the diagnosis.

## Employee Data Under the CCPA

The CCPA covers California residents, and that "includes California residents that are employees or job applicants"; the exemptions for "employment-related personal information" expired on December 31, 2022. A business is covered if it meets any of three tests: gross annual revenue of "$26.625 million or more" (effective January 1, 2025), buying, selling or sharing the personal information of 100,000 or more California residents or households, or deriving 50% or more of revenue from selling or sharing personal information. Employees and applicants have the same rights as other consumers to know, delete and correct, and the same clocks: confirm receipt "within 10 business days," respond within 45 calendar days, extendable by another 45 with notice.

Deletion has exceptions that cover most HR data. A business need not delete information it needs to "Comply with a legal obligation" (Civil Code 1798.105(d)(8)), which is every record on the schedule above until its date passes. So an employee's deletion request typically produces: deletion of what no rule requires (old optional profile fields, a photo, marketing preferences, expired candidate data), a statement of what is retained and why, and a retention date after which the rest goes. Payroll providers and HR vendors handle the request as service providers: when the business directs, they delete or let the business delete, and pass the instruction on to their own service providers (1798.105(c)(3)).

The playbook's [CCPA and CPRA](/docs/compliance/gdpr#ccpa-and-cpra) covers the general rights; the HR-specific work is scope. An employee's personal information is in the HRIS, payroll, benefits, time, the ATS from before they were hired, background check records, collaboration and monitoring tools, and email. A request that only searches the HRIS is incomplete.

## SSNs on Statements, W-2s and Screens

The core model keeps the SSN as a vaulted token with its last four digits (`persons.tin_token`, `tin_last4`), and four rules decide where the digits may appear:

- **Pay statements.** In California, "only the last four digits" of the SSN, or an employee identification number other than the SSN, may appear on the itemized wage statement (Labor Code 226(a), as the Labor Commissioner describes it). Many employers use an employee number everywhere for the same reason.
- **Furnished W-2s.** An employer may truncate the employee's SSN on the copies it furnishes, replacing the first five digits with Xs or asterisks (XXX-XX-1234), for statements furnished after December 31, 2020; truncation is "permissive and not mandatory," and the full number is still required on Copy A filed with SSA and on anything filed with the IRS (26 CFR 301.6109-4). The employer can't truncate its own EIN.
- **Mail and screens.** California bars publicly displaying an SSN, printing it on cards needed to access services, requiring its transmission over an unsecured connection, requiring it to sign in without another authenticator, and printing it on mailed materials unless law requires it there (Civil Code 1798.85).
- **Logs and exports.** No full SSN in logs, error messages, analytics or support tools; detokenization only in the services that file with agencies ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).

## Data Subject Requests From Employees

An employee request, whether under the CCPA, the GDPR for EU workers, or a state personnel file law, runs the same pipeline with different clocks:

1. **Intake and verification.** Identify the requester against the HR record; a former employee's portal access may be gone, so verification uses other data.
2. **Classify.** Access, correction, deletion, or personnel file inspection, and which laws apply by residence and work location; one request can be several.
3. **Find.** Search every system that holds the person's data, by person id, worker ids, email addresses and names, including the ATS and monitoring tools.
4. **Apply the schedule.** For deletion, separate what a retention rule or a hold requires from what can go, and record the rule for each retained category ([Erasure vs Append-Only Records](/docs/building-blocks/data-retention#erasure-vs-append-only-records)).
5. **Respond.** Deliver the package or the result, with a statement of what was retained and until when.
6. **Execute and confirm.** Delete or anonymize in each system and its service providers, and log completion.

The audit trail itself holds personal data (before and after values on every change), and the playbook covers how to keep it intact while honoring erasure ([Privacy Erasure and the Audit Store](/docs/building-blocks/audit-trails#privacy-erasure-and-the-audit-store)).

## Legal Holds

A hold stops the clock. Federal rules build it in: when a charge is filed or suit brought under Title VII, the ADA or GINA, the employer must keep all relevant personnel records "until final disposition" (29 CFR 1602.14), and an ADEA enforcement action holds related records until it is resolved (29 CFR 1627.3). Litigation, government investigations and audits impose holds too. In a system, a hold is a record with a scope (people, record types, date ranges, custodians), a reason and a release; every purge job checks it before deleting anything, and a deletion request against held data gets a response that says so.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `documents.retention_until` already exists; this chapter adds the schedule that computes it, holds that suspend it, and the request cases.

```sql
CREATE TABLE retention_schedules (         -- each rule that applies to a record type
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  record_type         TEXT NOT NULL,         -- 'i9', 'payroll_record', 'time_card', 'w4',
                                             -- 'personnel_action', 'medical', 'osha_300', ...
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- null for federal
  rule_ref            TEXT NOT NULL,         -- '29 CFR 516.5', 'Cal. Lab. Code 1198.5', ...
  clock_starts        TEXT NOT NULL CHECK (clock_starts IN ('created', 'last_entry',
                        'last_effective', 'personnel_action', 'termination', 'hire',
                        'q4_return_filed', 'plan_filing', 'calendar_year_end')),
  keep_interval       INTERVAL NOT NULL,
  combine             TEXT NOT NULL DEFAULT 'max' CHECK (combine IN ('max')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE legal_holds (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  reason              TEXT NOT NULL CHECK (reason IN ('eeoc_charge', 'litigation',
                        'investigation', 'audit', 'other')),
  matter_ref          TEXT NOT NULL,
  scope               JSONB NOT NULL,        -- person ids, record types, date ranges, systems
  placed_by           TEXT NOT NULL,
  placed_at           TIMESTAMPTZ NOT NULL,
  released_at         TIMESTAMPTZ
);

CREATE TABLE document_holds (              -- which documents a hold covers
  legal_hold_id       UUID NOT NULL REFERENCES legal_holds (id),
  document_id         UUID NOT NULL REFERENCES documents (id),
  PRIMARY KEY (legal_hold_id, document_id)
);

ALTER TABLE documents
  ADD COLUMN record_type    TEXT,            -- joins retention_schedules
  ADD COLUMN storage_class  TEXT NOT NULL DEFAULT 'personnel' CHECK (storage_class IN
                              ('personnel', 'medical', 'i9', 'payroll', 'background', 'eeo')),
  ADD COLUMN retention_basis JSONB,          -- each rule's date, so the max can be explained
  ADD COLUMN purged_at      TIMESTAMPTZ;

CREATE TABLE personnel_file_requests (     -- state access rights
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  requester_kind      TEXT NOT NULL CHECK (requester_kind IN ('employee', 'former_employee',
                        'representative')),
  scope               TEXT[] NOT NULL,       -- 'personnel', 'payroll', 'training', ...
  received_on         DATE NOT NULL,
  due_on              DATE NOT NULL,         -- 30 (CA), 5 business days (MA), 7 working days (MN)
  extended_to         DATE,                  -- by written agreement where allowed
  verified_at         TIMESTAMPTZ,
  delivered_on        DATE,
  package_document_id UUID REFERENCES documents (id),
  rebuttal_document_id UUID REFERENCES documents (id),
  rule_ref            TEXT NOT NULL
);

CREATE TABLE data_subject_requests (       -- CCPA, GDPR and similar, for employees and applicants
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  person_id           UUID REFERENCES persons (id),   -- null until matched
  regime              TEXT NOT NULL CHECK (regime IN ('ccpa', 'gdpr', 'uk_gdpr', 'other')),
  kinds               TEXT[] NOT NULL,       -- 'know', 'delete', 'correct', 'portability', ...
  received_at         TIMESTAMPTZ NOT NULL,
  acknowledge_by      DATE NOT NULL,         -- CCPA: 10 business days
  respond_by          DATE NOT NULL,         -- CCPA: 45 calendar days
  extended_to         DATE,                  -- CCPA: up to 45 more, with notice
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified',
                        'failed')),
  systems_searched    TEXT[] NOT NULL DEFAULT '{}',
  retained            JSONB NOT NULL DEFAULT '[]',   -- category, rule, retain until
  status              TEXT NOT NULL CHECK (status IN ('open', 'responded', 'executed',
                        'denied', 'closed')),
  responded_at        TIMESTAMPTZ
);
```

The purge job selects only documents past every rule and outside every hold:

```sql
SELECT d.id
FROM documents d
WHERE d.purged_at IS NULL
  AND d.retention_until < CURRENT_DATE
  AND NOT EXISTS (SELECT 1 FROM document_holds dh
                  JOIN legal_holds h ON h.id = dh.legal_hold_id
                  WHERE dh.document_id = d.id AND h.released_at IS NULL);
```

Design notes:

- **Retention is the maximum of every applicable rule.** `documents.retention_basis` stores each rule's computed date, and `retention_until` is their maximum, recomputed when a termination, a filing date or a rule changes ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).
- **Storage class is access control.** Medical, I-9, background and EEO documents each have their own class, readable only by their roles, and never surface in the general profile.
- **Holds are checked by every purge,** and a hold placed after a purge job is scheduled still wins because the job re-checks at execution.
- **Requests are cases with computed clocks.** Each regime's acknowledgment and response dates are computed from receipt and stored with the rule, like any other deadline ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Purging is logged.** `purged_at` and an `audit_events` row record what was destroyed under which rule; the log of destruction is itself a record an auditor asks for.

## Auditing

Records programs are reviewed by DOL, the IRS, ICE, the EEOC, state agencies, plaintiffs' counsel and privacy regulators. Keep:

- **The retention schedule as data,** versioned, with the rule behind each entry.
- **Each document's computed retention basis** and the purge log.
- **Legal holds** with scope, placement and release, and the documents they covered.
- **Personnel file requests and data subject requests** with receipt, verification, deadlines, what was delivered or deleted, and what was retained under which rule.
- **Access logs for medical, I-9, background and EEO records.**

## What This Means for the System You Build

- **Assign every record a type and compute retention as the maximum of every rule that applies,** with the clock each rule starts from.
- **Recompute retention on termination, filing and rule changes,** and never purge while employment or a hold continues.
- **Keep medical, genetic, I-9, background and EEO records in separate stores** with separate roles and logged access.
- **Treat employees and applicants as CCPA consumers,** with 10-business-day acknowledgments and 45-day responses, and retain what the law requires under the legal obligation exception.
- **Search every system for a request,** including the ATS, monitoring tools and service providers.
- **Show only the last four SSN digits on statements,** truncate on furnished W-2s where chosen, and keep full numbers in the vault.
- **Run personnel file requests as cases** with state-specific deadlines, scopes and delivery records.

## References

**Law and regulation**

- [29 CFR 516.5](https://www.law.cornell.edu/cfr/text/29/516.5), payroll records, agreements and sales records kept at least 3 years
- [29 CFR 516.6](https://www.law.cornell.edu/cfr/text/29/516.6), time cards, wage rate tables and wage adjustment records kept at least 2 years
- [29 CFR 1602.14](https://www.law.cornell.edu/cfr/text/29/1602.14), personnel records one year from the record or action, terminations, and preservation until final disposition of a charge
- [29 CFR 1627.3](https://www.law.cornell.edu/cfr/text/29/1627.3), ADEA payroll records 3 years, personnel records 1 year, benefit plans and enforcement holds
- [29 USC 1027](https://www.law.cornell.edu/uscode/text/29/1027), ERISA records kept not less than six years after filing
- [29 CFR 825.500](https://www.law.cornell.edu/cfr/text/29/825.500), FMLA records three years and medical records in separate files
- [29 CFR 1904.33](https://www.law.cornell.edu/cfr/text/29/1904.33), OSHA injury and illness records five years after the year they cover
- [29 CFR 1630.14](https://www.law.cornell.edu/cfr/text/29/1630.14), ADA medical examinations, separate confidential medical files and their exceptions
- [29 CFR 1635.9](https://www.law.cornell.edu/cfr/text/29/1635.9), GINA confidentiality and the permitted disclosures
- [45 CFR 160.103](https://www.law.cornell.edu/cfr/text/45/160.103), protected health information excludes employment records held by a covered entity as employer
- [26 CFR 301.6109-4](https://www.law.cornell.edu/cfr/text/26/301.6109-4), truncated taxpayer identification numbers on furnished statements after December 31, 2020
- [California Labor Code 1198.5](https://california.public.law/codes/ca_lab_code_section_1198.5), personnel file inspection and copies within 30 days, former employees, three-year retention and the $750 penalty
- [California Civil Code 1798.105](https://california.public.law/codes/civil_code_section_1798.105), deletion exceptions including a legal obligation, and service provider duties
- [California Civil Code 1798.85](https://california.public.law/codes/civil_code_section_1798.85), limits on displaying, printing, transmitting and mailing SSNs
- [Massachusetts General Laws c. 149, s. 52C](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section52C), personnel record review within 5 business days, negative information notices and retention
- [Minnesota Statutes 181.961](https://www.revisor.mn.gov/statutes/cite/181.961), personnel record review for employees and former employees
- [Oregon Revised Statutes 652.750](https://oregon.public.law/statutes/ors_652.750), inspection and certified copies within 45 days and 60-day retention after termination
- [RCW 49.12.250](https://app.leg.wa.gov/rcw/default.aspx?cite=49.12.250), annual personnel file review and rebuttals in Washington

**Agency guidance and forms**

- [IRS: Employment tax recordkeeping](https://www.irs.gov/businesses/small-businesses-self-employed/employment-tax-recordkeeping), four years after filing the fourth-quarter return and the records to keep
- [USCIS: M-274, Retaining Form I-9](https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/100-retaining-form-i-9), the I-9 retention rule
- [California Labor Commissioner: Paydays, pay periods, and the final payment of wages](https://www.dir.ca.gov/dlse/faq_paydays.htm), the last four SSN digits on itemized wage statements
- [California Privacy Protection Agency: FAQ](https://cppa.ca.gov/faq.html), employees and applicants as consumers, the expired employment exemption, the revenue threshold and response deadlines
- [Federal Register: Removal of Reporting Requirements (2026-14937)](https://www.federalregister.gov/api/v1/documents/2026-14937.json), the proposed removal of part 1602 recordkeeping

**Vendor documentation**

- [BambooHR: Webhooks](https://documentation.bamboohr.com/docs/webhooks), permissioned webhooks limited to the creator's permissions
- [Greenhouse: Harvest API](https://docs.greenhouse.io/harvest.html), the anonymize endpoint and its On-Behalf-Of header
- [Greenhouse: Webhooks](https://docs.greenhouse.io/webhooks.html), candidate_anonymized
- [Lever: API documentation](https://hire.lever.co/developer/documentation), anonymized records and GDPR consent expiry
- [SmartRecruiters: Developer portal](https://developers.smartrecruiters.com/), consent requests and audit data retention
