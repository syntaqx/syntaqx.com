+++
title = "Controls, Audits & SOC 1"
nav_title = "Controls & SOC 1"
description = "What a payroll SOC 1 covers, user entity controls, internal controls over payroll, and what DOL, IRS and state UI auditors ask for, with the records each needs."
category = "Workforce Industry"
order = 2660
part = "Running the Platform"
tags = ["payroll", "soc-1", "internal-controls", "audits", "dol", "recordkeeping"]
+++

Payroll is audited from more directions than almost any other business process, and each auditor asks a different question of the same records. The employer's financial statement auditor asks whether payroll expense and payroll liabilities are fairly stated, and because a payroll provider computed them, it relies on the provider's SOC 1 report. The Department of Labor's Wage and Hour Division asks whether workers were paid the minimum wage and overtime they were owed. The IRS asks whether the wages on the 941s match the W-2s and the books, and whether every worker paid as a contractor really was one. The state unemployment agency asks whether every wage it should have taxed was reported. A workers' compensation carrier asks how much payroll fell in each class code. A payroll platform is built to answer all of them from one set of rows, and to show that the controls around those rows worked.

This chapter covers what a payroll SOC 1 examination is for and what it covers, complementary user entity controls and subservice organizations, internal controls over payroll on the employer's side, the DOL Wage and Hour investigation, the IRS employment tax examination, state UI tax audits, and the records each asks for, with the retention clocks worked. The SOC 2 counterpart for security is in the playbook's [SOC 2](/docs/compliance/soc-2); the fraud the controls are meant to stop is Payroll Fraud & Security, the next chapter; how long each HR record is kept is in [Employee Records, Privacy & Retention](/books/workforce/employee-records-and-privacy#retention-schedules-by-record).

## How the Platforms Do It

Who examines payroll, what each is testing, and what they ask for, as of November 2026:

| Examiner | What they test | What they ask for |
| --- | --- | --- |
| **Financial statement auditors, through a SOC 1** | Controls at the provider "likely to be relevant to user entities' internal control over financial reporting"; Paycom says its "SOC 1 examination is conducted every six months by an independent international auditing firm" and that it publishes "SOC 1 reports semiannually and SOC 2 and SOC 3 reports annually" | The provider's SOC 1 report; at the employer, evidence of the user entity controls the report assumes |
| **DOL Wage and Hour Division** | Minimum wage, overtime, recordkeeping and child labor under the FLSA; investigations are "Many ... initiated by complaints," and WHD "targets low-wage industries" | "Examination of payroll and time records," interviews with employees in private, and back wage computations |
| **IRS employment tax examiners** | That wages, withholding and deposits agree across 941s, W-2s and the books; worker classification; information returns | A "written request for the specific documents we want to see"; the examiner's workpapers include a payroll reconciliation, 1099 filing checks and a records checklist |
| **State UI tax auditors** | That every covered wage was reported and taxed, and workers were correctly classified | Washington lists "Payroll, accounting and employee time records," "State and federal tax records, including IRS Form 1099s," and "Bank records, financial statements, check registers, general ledgers, and invoices," usually "3 years' worth" |
| **Workers' compensation premium auditors** | Payroll by classification as the premium's exposure base | Payroll records by class code ([Premium Audit](/books/insurance/rating-workers-comp#premium-audit) covers the insurance side) |

Three patterns. **Everyone starts from the payroll register.** Every examiner's first request is wages by worker by period, and every one of them reconciles it to something else (the books, the 941s, the state wage reports, the policy's class codes). A platform that can produce the register for any employer, period and jurisdiction in minutes, and show it ties, makes every audit shorter. **The provider's controls are the employer's evidence.** The employer outsourced the calculation, so its auditor tests the provider's controls through the SOC 1 and tests only the employer's own side directly. **Classification runs through all of them.** The IRS, the DOL and the state each test whether contractors were employees ([Worker Classification](/books/workforce/worker-classification) covers the tests), and each needs the same evidence: the contract, the payments, and how the work was controlled.

## What a Payroll SOC 1 Covers

The AICPA describes SOC 1 as "an examination of controls at a service organization" relevant to "user entities' internal control over financial reporting," and says SOC 1 reports are "specifically intended to meet the needs of entities that use service organizations" and "the CPAs that audit the user entities' financial statements (user auditors)." A payroll provider is the textbook service organization: it computes an expense line and several liabilities on every client's balance sheet, holds the cash to pay them, and files the returns that support them. The client's auditor can't re-perform the provider's calculation, so it reads the provider's report on its controls.

As with SOC 2, a Type 1 report describes the controls and opines on their design at a point in time, and a Type 2 adds the auditor's tests of whether they operated effectively over a period ([Type 1 and Type 2](/docs/compliance/soc-2#type-1-and-type-2)). For a user auditor, only the Type 2 is evidence that the controls worked during the client's fiscal year, which is why providers report on rolling periods (Paycom's semiannual cadence) and issue bridge letters to cover the gap to a client's year end.
<!-- source-gap: wf-soc1-definitions | missing | SOC 1 Type 1 versus Type 2, the AT-C 320 standard, complementary user entity controls, subservice organizations and the carve-out and inclusive methods as the AICPA defines them | closes with: the AICPA SOC 1 guide or AT-C 320 text, or PCAOB AS 2601 | checked: 2026-11-10 -->

The control objectives in a payroll SOC 1 follow the life of a pay run in [The Workforce Business](/books/workforce/workforce-business#the-life-of-a-pay-run). The ones a reader should expect, and what tests each:

| Control objective | What the controls do | What the auditor tests |
| --- | --- | --- |
| **Client setup** | New clients and their tax registrations, rates and bank accounts are set up as authorized | A sample of new clients against signed agreements and agency notices |
| **Input** | Pay data (hours, rates, deductions) is accepted only from authorized client users and processed completely | Access to submit and approve; batch totals and run approvals |
| **Calculation** | Gross-to-net computes per the rules in force, and tax rule updates are applied accurately and on time | Recalculation of sampled statements; tax table updates against agency publications |
| **Tax deposits and filings** | Liabilities are deposited and returns filed accurately and by the due date | Sampled deposits against due dates and EFTPS confirmations; returns against registers |
| **Client funds** | Funds collected are held, invested per policy, and reconciled to obligations | Daily reconciliations of funds held to obligations ([Reconciling Funds Held to Obligations](/books/workforce/client-funds-and-impounds#reconciling-funds-held-to-obligations)) |
| **Money movement** | Debits and credits are transmitted accurately, once, and returns are handled | File totals to approved runs; return handling |
| **Change management** | Changes to the payroll application and tax rules are authorized, tested and approved before production | Sampled releases with tests and approvals ([Payroll Platform Architecture](/books/workforce/payroll-architecture#how-to-build-it)) |
| **Logical access** | Access to production and client data is restricted, reviewed and removed on termination | Access lists, periodic reviews, leaver removals |
| **Operations** | Jobs run on schedule, failures are detected and resolved | Scheduler monitoring and incident tickets |

The report's system description and control objectives are the provider's own wording, so the same objective reads differently across providers; the user auditor maps them to its risks. A platform that keeps evidence as data (every approval with its actor and time, every release with its test run, every reconciliation with its result) produces the auditor's sample in a query instead of a scramble ([Engineering Is the Evidence](/docs/compliance/soc-2#engineering-is-the-evidence)).

## Complementary User Entity Controls

A provider's controls only work if the client does its part, and the SOC 1 says so in a list of complementary user entity controls (CUECs): the controls the provider assumes the client operates. In payroll, they are the employer's half of internal control:

- **Approving each payroll register** before the deadline, by someone who didn't enter the changes.
- **Reviewing changes** the client made in the period (new hires, rate changes, bank account changes, terminations) against authorization.
- **Restricting and reviewing access** to the provider's system: who can add employees, change bank accounts, approve runs, and removing leavers.
- **Reconciling** the payroll journal to the general ledger and bank account each period.
- **Verifying tax deposits.** The IRS tells employers who outsource to "register on the EFTPS system to get their own PIN and use this PIN to periodically verify payments," because "The employer is ultimately responsible for the deposit and payment of federal tax liabilities" ([The Employer's Own EFTPS](/books/workforce/who-runs-payroll#the-employer-s-own-eftps)).
- **Notifying the provider** of agency notices, rate changes and new registrations.

A client auditor tests these directly at the employer. If the client doesn't operate them, the provider's report doesn't cover the risk; a provider whose clients routinely skip register approval has controls that look fine and outcomes that don't. My rule for a platform: build the CUECs into the product as defaults with evidence (a required approver distinct from the preparer, a periodic access review prompt with an attestation, a change report on every run), so the client operates them by using the product, and the evidence exists when the auditor asks.

**Subservice organizations** are the provider's own vendors whose controls matter to the same objectives: the bank that originates the ACH files, a trust bank holding client funds, a tax engine vendor, a filing service, the cloud host. A SOC 1 either includes their controls in scope or carves them out and lists the controls the provider expects of them (complementary subservice organization controls); either way, the provider monitors them, usually by reading their own SOC reports each year. In the core model that's a list of vendors with their report periods and the provider's review, which is what the `cuec_mappings` table below holds alongside the client-side controls.

## Internal Controls Over Payroll

On the employer's side, internal control over payroll is a short list of controls that stop most errors and most fraud:

- **Segregation of duties.** The person who adds an employee isn't the person who approves the payroll, and neither is the person who changes a bank account. A small business with one payroll admin compensates with owner review of every register.
- **Approvals with evidence.** Every run approved by a named person, at a time, on the register they saw; the core model's `pay_runs.approved_by` and `pay_run_events` hold it.
- **Change logs.** Every change to rates, elections, bank accounts and deductions in `audit_events`, with actor and reason, and a per-run report of what changed since the last run.
- **Variance review.** A register compared to the previous period and the trailing average, by total and by worker, with thresholds that force a look.
- **Reconciliations.** Payroll to the general ledger, funds debited to the bank statement, liabilities to deposits, 941s to W-2s each year ([Reconciling W-2s to the 941s](/books/workforce/year-end-and-w2s#reconciling-w-2s-to-the-941s)).
- **Master file reviews.** Periodically, every active worker confirmed by a manager, which is the control that finds ghost employees (Payroll Fraud & Security).

### Worked Numbers: A Variance Review

Invented: the employer from [The Life of a Pay Run](/books/workforce/workforce-business#the-life-of-a-pay-run) pays $160,000.00 gross every two weeks to 40 employees. The variance rule flags a run whose gross is more than 5% from the trailing six-run average, and any worker whose gross is more than 25% above their own trailing average or who is paid for the first time to a bank account changed in the last 30 days.

| Check | This run | Trailing average | Variance | Flag |
| --- | --- | --- | --- | --- |
| Run gross | $171,200.00 | $160,000.00 | +7.0% | Yes |
| Worker A gross (overtime) | $6,100.00 | $4,000.00 | +52.5% | Yes |
| Worker B gross (bonus) | $9,100.00 | $4,000.00 | +127.5% | Yes |
| Worker C (new bank account 6 days ago) | $4,000.00 | $4,000.00 | 0% | Yes |

The reviewer explains each flag before approval: Worker A's overtime matches approved timesheets ([Edits, Approvals and Locks](/books/workforce/time-and-attendance#edits-approvals-and-locks)), Worker B's bonus matches a signed bonus letter, and Worker C's account change is confirmed with the worker by phone at the number on file. The run's $11,200.00 increase is A's $2,100.00 plus B's $5,100.00 plus $4,000.00 for a new hire, and every dollar is explained. A rule that flags everything is ignored; the thresholds belong to the employer and should be tuned until most flags are real questions.

## DOL Wage and Hour Investigations

The DOL's Fact Sheet #44 describes an FLSA investigation. "Many are initiated by complaints," though WHD "does not typically disclose the reason for an investigation," and it "targets low-wage industries, for example, because of high rates of violations." The investigator presents credentials and then conducts an "Examination of records to determine which laws or exemptions apply," an "Examination of payroll and time records," and "Interviews with certain employees in private," followed by a closing conference. Where violations are found, "the investigator will request payment of back wages and may ask the employer to compute the amounts due." Complaints are confidential, and workers who complain "cannot be discriminated against or discharged on account of such activity."

The records are the ones 29 CFR 516 requires, and the retention clocks are two: "Each employer shall preserve for at least 3 years" payroll records "From the last date of entry," and supplementary basic records, including "all basic time and earning cards or sheets on which are entered the daily starting and stopping time," for "at least 2 years" ([The Record: 29 CFR 516](/books/workforce/time-and-attendance#the-record-29-cfr-516)).

What makes a WHD investigation fast or slow is the platform's ability to answer, per worker per workweek: hours worked from raw punches and their edits, the regular rate with every payment included, overtime paid against overtime owed, and the exemption applied with its basis. The back wage computation an investigator asks the employer to make is the platform's [regular rate calculation](/books/workforce/overtime-and-the-regular-rate) rerun over two or three years with the corrected inputs, which the replayable engine in [Payroll Platform Architecture](/books/workforce/payroll-architecture#the-pay-run-engine) is built to do.

## IRS Employment Tax Examinations

An IRS audit starts by mail: "Should your account be selected for audit, we will notify you by mail," and "The IRS will provide you with a written request for the specific documents we want to see." Returns are selected for employment tax examination by a dedicated workload function (Employment Tax Workload Selection and Delivery, which will "manage the selection, classification, and delivery of returns"), and the examiner's workpapers show what gets tested: lead sheets for "Payroll Reconciliation & Evaluation," "1099 Filing Requirement Checks" and a "Records Check List," W-2s reconciled to payroll, and whether a "worker reclassification issue" exists (IRM 4.23.4).

The employer's records are those Pub 15 lists, kept "for at least 4 years" and "available for IRS review": the EIN; amounts and dates of wage payments; tips; the fair market value of in-kind wages; each employee's name, address, SSN and occupation; dates of employment; Forms W-4; deposit dates and amounts; copies of returns filed; and fringe benefit and expense reimbursement records. The reconciliations an examiner performs are the ones the platform should already run: wages per the ledger to wages per the 941s to wages per the W-2s, the difference explained line by line (fringe benefits, Section 125, deferrals, timing of the last payroll of the year); deposits to liabilities per Schedule B; and 1099-NEC payees against the people who look like employees.

## State UI Tax Audits

States audit employers' unemployment tax reporting as part of their federal performance measures: the DOL's Tax Performance System gathers measures "electronically reported by each state to the US Department of Labor," including an effective audit measure built from "the percent of employers audited" and "the percent of total wages audited." Washington's Employment Security Department puts it plainly: "The U.S. Department of Labor and state laws and rules require us to audit employers every year." Some audits are random ("Randomly selecting employers by computer (about 10% of all audits)"), and "Being selected for an audit does not mean you violated any laws or rules." The records requested are payroll, accounting and time records, state and federal tax records including 1099s, and bank records, financial statements, check registers, general ledgers and invoices; "We usually request 3 years' worth of records," and "If an auditor finds issues with your business practices, we may expand the audit."
<!-- source-gap: wf-ui-audit-rate | missing | the federal performance target for the share of contributory employers states audit each year | closes with: the DOL ET Handbook 407 or the UI core measures page | checked: 2026-11-10 -->

The finding in a UI audit is usually one of two: wages paid but not reported (a payment treated as nontaxable that the state taxes, or a worker in the wrong state), or workers paid as contractors whom the state's test makes employees. The second is why the ledger and the 1099s are on the list: the auditor reads the general ledger for payments to people and checks each against the wage reports. The platform's answer is the same register as for the IRS, cut by state and quarter, tied to the filed wage reports ([`filings`](/books/workforce/workforce-business#the-core-data-model) with their lines as filed).

A workers' compensation premium audit is the insurance side of the same records: the carrier's auditor reads payroll by employee and class code to set the final premium ([Premium Audit](/books/insurance/rating-workers-comp#premium-audit)). Payroll that carries a class code per job assignment or time entry makes that audit a report.

## Records and Retention, Worked

One invented statement, paid on Friday, November 20, 2026 for the period November 1 to 14, with its time records and the fourth-quarter 941 that reports it (due February 1, 2027):

| Record | Rule | Keep at least until |
| --- | --- | --- |
| The pay statement and register (FLSA payroll record) | 3 years from the last date of entry (29 CFR 516.5) | November 20, 2029 |
| Time cards with daily start and stop times | 2 years (29 CFR 516.6) | November 14, 2028 for the last entry in the period |
| Employment tax records for the statement and the 941 | At least 4 years (Pub 15) | February 2031, counting from the 941's due date, by my reading |
| What a state UI auditor typically requests | 3 years of records (Washington) | Covered by the longer federal clocks |

The longest clock wins for a record that serves several, and a platform computes `retention_until` per document from every rule that applies rather than one policy for "payroll" ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)). A legal hold or an open audit suspends the purge for anything it touches ([Legal Holds](/books/workforce/employee-records-and-privacy#legal-holds)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `audit_events` and `pay_runs` exist. This chapter adds control tests, user access reviews, audit requests from any examiner, and the map of user entity and subservice controls.

```sql
-- Each execution of a control, with its evidence; the auditor's sample is a query over this.
CREATE TABLE control_tests (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  control_key         TEXT NOT NULL,         -- 'register_approval', 'funds_reconciliation',
                                             -- 'tax_table_update', 'release_approval', ...
  scope               TEXT NOT NULL CHECK (scope IN ('provider', 'client')),
  company_id          UUID REFERENCES companies (id),   -- for client-side controls
  subject_table       TEXT,                  -- 'pay_runs', 'rule_versions', 'funds_reconciliations'
  subject_id          UUID,
  performed_by        TEXT NOT NULL,
  performed_at        TIMESTAMPTZ NOT NULL,
  result              TEXT NOT NULL CHECK (result IN ('passed', 'exception', 'not_performed')),
  evidence_ref        TEXT,                  -- the register, report or ticket as it was
  exception_note      TEXT,
  resolved_at         TIMESTAMPTZ
);

-- Periodic review of who can do what in a company's payroll, with the decision per user.
CREATE TABLE user_access_reviews (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  period              DATERANGE NOT NULL,
  reviewer            TEXT NOT NULL,
  started_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  entries             JSONB NOT NULL,        -- [{user, roles, can_change_bank, can_approve,
                                             --   decision: keep|reduce|remove, reason}]
  third_party_admins  JSONB NOT NULL DEFAULT '[]',   -- integrations and assisted connections
  status              TEXT NOT NULL CHECK (status IN ('open', 'completed', 'overdue'))
);

-- A request from any examiner, with what was asked and what was produced.
CREATE TABLE audit_requests (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  examiner            TEXT NOT NULL CHECK (examiner IN ('dol_whd', 'irs', 'state_ui',
                        'state_revenue', 'workers_comp_carrier', 'financial_auditor',
                        'plan_auditor', 'other')),
  notice_id           UUID REFERENCES notices (id),   -- the letter that opened it
  case_ref            TEXT,
  period_examined     DATERANGE NOT NULL,
  requested           JSONB NOT NULL,        -- the document list as asked
  produced            JSONB NOT NULL DEFAULT '[]',   -- [{item, document_id, produced_at}]
  respond_by          DATE,
  legal_hold_id       UUID REFERENCES legal_holds (id),
  outcome             TEXT CHECK (outcome IN ('no_change', 'assessment', 'back_wages',
                        'refund', 'closed_other')),
  amount              BIGINT,                -- assessed, back wages or refunded, cents
  status              TEXT NOT NULL CHECK (status IN ('open', 'producing', 'under_review',
                        'closed'))
);

-- The controls the provider's report assumes of clients and subservice organizations.
CREATE TABLE cuec_mappings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  report_period       DATERANGE NOT NULL,    -- the SOC 1 period it belongs to
  kind                TEXT NOT NULL CHECK (kind IN ('user_entity', 'subservice')),
  control_objective   TEXT NOT NULL,         -- the report's objective it supports
  control_text        TEXT NOT NULL,         -- as worded in the report
  subservice_org      TEXT,                  -- the bank, engine or host, for 'subservice'
  product_feature     TEXT,                  -- where the platform helps the client do it
  evidence_control_key TEXT,                 -- control_tests.control_key that evidences it
  last_reviewed_at    TIMESTAMPTZ            -- for subservice: the vendor report read
);

-- Client-side register approvals not performed by someone other than the preparer last quarter.
SELECT r.employer_id, r.id AS pay_run_id, r.approved_by, e.actor AS last_editor
FROM pay_runs r
JOIN LATERAL (
  SELECT actor FROM pay_run_events
  WHERE pay_run_id = r.id AND to_status = 'calculated'
  ORDER BY seq DESC LIMIT 1
) e ON TRUE
WHERE r.check_date >= date_trunc('quarter', CURRENT_DATE) - INTERVAL '3 months'
  AND r.check_date <  date_trunc('quarter', CURRENT_DATE)
  AND r.approved_by = e.actor;
```

Design notes:

- **Controls as rows, not screenshots.** Every approval, reconciliation and release that is a control writes a `control_tests` row pointing at its subject, so a sample of 25 approvals across the period is a query and the evidence is the stored register, not a recreated one.
- **CUECs map to features.** `cuec_mappings.product_feature` and `evidence_control_key` turn the report's list into product work: each user entity control is either something the product makes the client do and records, or a gap the provider tells clients about.
- **Third-party access is in the review.** Integrations and assisted connections with admin rights ([Automated and Assisted Connections](/books/workforce/unified-hr-apis#automated-and-assisted-connections)) appear in `user_access_reviews` alongside people.
- **An audit opens a hold.** `audit_requests.legal_hold_id` suspends retention purges for the examined period until the case closes.

## Auditing

This chapter is about auditing, so the list is short: keep the control evidence for at least as long as the longest retention period of the records it controlled, keep every audit request with what was produced and when, and keep the SOC 1 reports and bridge letters issued to each client with the periods they covered. The audit trail's own integrity (append-only, tamper-evident, access logged) is what makes the rest credible ([Auditing the Audit Trail](/docs/building-blocks/audit-trails#auditing-the-audit-trail)).

## What This Means for the System You Build

- **Produce the register for any employer, period and jurisdiction in minutes,** and show it ties to the books, the returns and the wage reports.
- **Record every control execution as data** with its evidence, so a SOC 1 sample is a query.
- **Build the user entity controls into the product:** preparer and approver separated, change reports per run, access review prompts, EFTPS verification nudges.
- **Track subservice organizations** with the reports read each year.
- **Keep time records and payroll records on their own clocks,** 2 and 3 years for the FLSA, at least 4 for employment tax, and the longest clock for a record that serves several.
- **Treat an examiner's letter as a case** with a document list, a deadline, a hold and an outcome.
- **Keep class codes and state on every wage dollar,** so UI and premium audits are reports.

## References

**Law and regulation**

- [29 CFR 516.5](https://www.law.cornell.edu/cfr/text/29/516.5), payroll records preserved for at least 3 years from the last date of entry
- [29 CFR 516.6](https://www.law.cornell.edu/cfr/text/29/516.6), supplementary basic records, including time cards, preserved for at least 2 years

**Agency guidance and forms**

- [DOL WHD: Fact Sheet #44, Visits to Employers](https://www.dol.gov/agencies/whd/fact-sheets/44-flsa-visits-to-employers), how investigations start, what they examine, back wages and confidentiality
- [IRS: IRS audits](https://www.irs.gov/businesses/small-businesses-self-employed/irs-audits), notification by mail and written document requests
- [IRS: IRM 4.23.1, Employment Tax Objectives, Organization, and IRM 4.23](https://www.irs.gov/irm/part4/irm_04-023-001), the employment tax examination program and workload selection
- [IRS: IRM 4.23.4, Employment Tax General Procedures and Workpapers](https://www.irs.gov/irm/part4/irm_04-023-004), the payroll reconciliation, 1099 filing checks and records checklist lead sheets, and worker reclassification
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), records to keep for at least 4 years
- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's responsibility and EFTPS verification
- [DOL ETA: Tax Performance System](https://oui.doleta.gov/unemploy/tps.asp), state-reported tax measures, including the percent of employers and wages audited
- [Washington ESD: Employer audits](https://esd.wa.gov/employer-taxes/audits), the annual audit requirement, random selection, records requested and the three-year look-back

**Standards and specifications**

- [AICPA & CIMA: SOC 1](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-1), SOC 1 as an examination of controls at a service organization for user entities and their auditors

**Filings**

- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), semiannual SOC 1 examinations and annual SOC 2 and SOC 3 reports
