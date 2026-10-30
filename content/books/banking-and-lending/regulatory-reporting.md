+++
title = "Regulatory Reporting & Data"
description = "Call reports, NCUA 5300, HMDA and 1071 filing, CTR and SAR e-filing, edits as tests, data lineage and reconciling every filed number to the GL."
category = "Banking & Lending Industry"
order = 2472
part = "Running the Platform"
tags = ["banking", "regulatory-reporting", "call-report", "hmda", "bsa", "data-lineage"]
+++

A bank tells its regulators about itself constantly. Every quarter it files a call report of several thousand data items; every year its mortgage lending goes to the CFPB as a loan/application register, and from 2028 its small business lending will too; every cash transaction over $10,000 is a currency transaction report within 15 days, and every suspicious one a SAR within 30. A holding company files its own consolidated reports; a credit union files NCUA's; a lender licensed in forty states files state call reports through NMLS. Each filing has its own form, definitions, platform, deadline and edit checks, and each is a public or supervisory statement the institution's officers sign. The numbers in them are read by examiners, by the public through the FFIEC's data, and by researchers building the industry statistics this volume quotes.

The engineering problem is that none of those forms is the general ledger. A call report needs loans by collateral and purpose, deposits by insured status, past dues by bucket and securities by maturity, much of which the GL never held; a HMDA register needs fields that live in the loan file under different definitions; a CTR needs the day's cash aggregated by person across accounts and branches. So every filed number is a derivation from operational records, and the question an examiner, an auditor or the institution's own CFO asks is the same: where did this number come from, and does it agree with the books?

This chapter covers the filing calendar across regimes, the call report and its edits, NCUA's call report, HMDA and Section 1071 submission, CTR and SAR e-filing, lineage from a filed number to its rows, reconciling regulatory figures to the GL, and the public data that comes back out. The rules for each filing's content are owned elsewhere: [Call Reports](/books/banking-and-lending/exams-and-supervision#call-reports) for which form a bank files, [HMDA: Who Reports and What](/books/banking-and-lending/fair-lending#hmda-who-reports-and-what) and [Section 1071](/books/banking-and-lending/fair-lending#section-1071) for the lending data, [Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports) and [Currency Transaction Reports and Structuring](/books/banking-and-lending/bsa-aml#currency-transaction-reports-and-structuring) for BSA reports. The general engineering is the playbook's [Data Pipelines](/docs/architecture/data-pipelines) and [Data Governance](/docs/data/data-governance). The chapter extends `gl_accounts`, `applications` and `cases`, and adds `report_obligations`, `report_line_definitions`, `report_line_values`, `report_adjustments`, `report_edit_results` and `filing_submissions`.

## The Filing Calendar

The regimes a US bank, credit union or lender files under, as of October 2026:

| Report | Who files | Due | Channel | Content owner |
| --- | --- | --- | --- | --- |
| **Call report** (FFIEC 031, 041, 051) | Every insured bank and savings association | 30 calendar days after each quarter end; 35 for a bank with more than one foreign office; "no other extensions" | The FFIEC Central Data Repository (CDR), directly or through a software vendor; paper "is not an acceptable method" | [Call Reports](/books/banking-and-lending/exams-and-supervision#call-reports) |
| **NCUA call report** (5300) and Profile | Federally insured credit unions | April 30, July 30, October 30 and January 30, by 11:59:59 p.m. Eastern | CUOnline, with NCUA Connect for multifactor sign-in | [Credit Unions Read Differently](/books/banking-and-lending/bank-economics#credit-unions-read-differently) |
| **FR Y-9C** | Bank, savings and loan, and intermediate holding companies of $3 billion or more | Quarterly, as of quarter end | The Federal Reserve's reporting system | [Holding Companies](/books/banking-and-lending/charters-and-regulators#holding-companies) |
| **HMDA LAR** | Mortgage lenders meeting the coverage tests | March 1 for the prior year; quarterly within 60 days for 60,000 or more loans and applications | The HMDA Platform, as a pipe-delimited file | [HMDA: Who Reports and What](/books/banking-and-lending/fair-lending#hmda-who-reports-and-what) |
| **Small business lending (1071)** | Lenders with at least 1,000 covered originations in each of the two prior years, from 2028 | June 1 following the calendar year, first for 2028 data | The CFPB's platform, in the format its Filing Instructions Guide sets | [Section 1071](/books/banking-and-lending/fair-lending#section-1071) |
| **Currency transaction report** | Banks and other covered institutions | 15 days after the transaction | BSA E-Filing, discrete or batch XML | [Currency Transaction Reports and Structuring](/books/banking-and-lending/bsa-aml#currency-transaction-reports-and-structuring) |
| **Suspicious activity report** | Banks and other covered institutions | 30 calendar days after initial detection, up to 60 if no suspect is identified | BSA E-Filing | [Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports) |
| **State reports** | Licensed nonbank lenders, servicers and money transmitters | By the state's schedule | NMLS and state systems | [Holding a License](/books/banking-and-lending/lender-licensing#holding-a-license) |

Three things in the calendar shape the system:

- **Fixed deadlines, no extensions.** The call report instructions say it plainly, and HMDA and BSA deadlines are in regulation. A pipeline that runs for two weeks after quarter end leaves two weeks for review, edits and sign-off; one that runs for four leaves none. Every filing is an obligation row with its due date computed when the period closes ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Different clocks for different reports.** The call report is a quarter-end snapshot; HMDA is an annual register of events by action date, recorded within 30 days after each quarter; CTRs and SARs are per-event, on rolling clocks from the transaction or the determination. One reporting module serves all three only if it treats "period," "event" and "determination" as different kinds of trigger.
- **Each regime has its own platform and identity.** The CDR uses the bank's RSSD ID and FDIC certificate, HMDA the legal entity identifier, BSA E-Filing the filer's registration and the 14-digit BSA ID it returns per report, NCUA the charter number. The institution row carries all of them ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)).

## The Call Report as a Derivation

The call report is a regulatory view of the GL ([Call Reports](/books/banking-and-lending/exams-and-supervision#call-reports) has the forms and schedules). Building one is a pipeline with four kinds of input:

| Input | Examples | Where it comes from |
| --- | --- | --- |
| **GL roll-ups** | Total deposits, interest income, noninterest expense | `gl_accounts.report_line` summed from the closed GL |
| **Subledger attributes** | Loans by collateral and purpose, deposits by insured status, past dues by bucket, time deposits by maturity | Account, loan and collateral rows as of quarter end |
| **Calculations** | Risk-weighted assets, averages, regulatory capital | Rules over the first two, versioned by instruction revision |
| **Manual entries** | Items no system holds, management judgments | A person, with a reason and an approver (`report_adjustments`) |

Rules that make it defensible:

- **Every line has a definition.** Each schedule line gets a row stating how it is derived: which GL report lines roll up into it, or which query over which tables as of which date, under which instruction revision. When the FFIEC changes an instruction, the line's definition gets a new version ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Quarter end is frozen first.** The pipeline reads a snapshot of the closed GL and the subledgers as of the report date, the `gl_snapshot_ref` on `regulatory_filings` ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#how-to-build-it)); late entries go to the next period or into an amendment, not into a silently rerun report.
- **Edits are tests.** The FFIEC publishes "validity edits and quality edits" in advance of each quarter end, and a report must pass them or carry "explanations for any quality edits that are not passed." Validity edits are hard failures (a total that doesn't foot, a negative where none is allowed); quality edits flag unusual relationships that may be right. Run them as part of the pipeline days before the deadline, store each result, and write each explanation once with the evidence ([Quality: Tests and Contracts](/docs/data/data-governance#quality-tests-and-contracts)).
- **Manual entries are the risk.** A top-side adjustment typed into the filing software is the number nobody can trace a year later. Each one is a row with its amount, line, reason, preparer and approver, applied by the pipeline, never typed into the output.
- **Amendments are new filings.** A restated call report is a new submission that `amends_id` the original, with the corrected lines and the reason, and the original stays as filed.

**Credit unions** file the 5300 through CUOnline on the same quarter-end logic, with NCUA's own definitions (shares instead of deposits, members instead of customers, ratios to average assets), and the same pipeline shape serves both if the line definitions are per form ([Credit Unions Read Differently](/books/banking-and-lending/bank-economics#credit-unions-read-differently)).

## HMDA and 1071 Submission

The content of a HMDA row and the coverage tests are [HMDA: Who Reports and What](/books/banking-and-lending/fair-lending#hmda-who-reports-and-what); this is the filing side. The 2026 Filing Instructions Guide describes "a pipe (also referred to as vertical bar) delimited text file" submitted through "a web interface referred to as the HMDA Platform," with the institution identified by its 20-character LEI. The platform runs four kinds of edit, and they map to the pipeline's tests:

| Edit type | What it checks (FIG) | Can the filer proceed? | In the pipeline |
| --- | --- | --- | --- |
| **Syntactical** | Whether the register "is in the correct format" | No; correct and resubmit | Schema checks on the file before upload |
| **Validity** | Whether each field holds "valid values" | No; correct and resubmit | Field rules on each `hmda_lar_records` row, run as rows are recorded |
| **Quality** | Whether fields "conform to expected values" | Yes, after confirming accuracy or correcting | Row-level checks with a confirmation workflow |
| **Macro quality** | The register "as a whole" (shares and counts) | Yes, after confirming or correcting | Portfolio checks run monthly, not only in February |

The design rules from [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending#how-to-build-it) carry through: the register is derived by a versioned mapping from the loan file, recorded within 30 days after each quarter, and edited continuously. Two submission specifics:

- **The file is the record.** Store the exact file uploaded, its hash, each submission attempt and the platform's edit report, and sign-off by the officer who certified it. A resubmission after an exam finding is a new submission with its reason.
- **The count is reconciled before upload.** Originations, denials, withdrawals and purchases on the register are tied to the LOS's own counts for the year by action taken; a gap is either an exclusion with a reason (a business-purpose loan not covered, a preapproval) or a missing row.

**Section 1071** data for 2028 is due by June 1, 2029, "in the format prescribed by the Bureau" with a Filing Instructions Guide containing the technical instructions (12 CFR 1002.109). As of October 2026 the CFPB's page lists a 2025 guide, written for the 2023 rule, and no guide for the revised rule's data points yet; a lender building now should build the record from [Section 1071](/books/banking-and-lending/fair-lending#section-1071) and treat the file format as a mapping to write when the guide is published.

<!-- source-gap: 1071-fig-revised-rule | status | Filing Instructions Guide and platform for the May 2026 revised 1071 rule | closes with: a CFPB FIG for small business lending data under the revised rule | checked: 2026-10-30 -->

## CTR and SAR E-Filing

FinCEN takes its reports "only electronically" through the BSA E-Filing System, either as discrete forms keyed online or as batch XML files from the institution's systems. The content rules are [BSA/AML Programs](/books/banking-and-lending/bsa-aml#how-to-build-it); the filing mechanics are a systems problem of their own:

- **Batch files have limits.** FinCEN's CTR XML user guide caps a batch file at 60 MB, "approx. 5,000 FinCEN CTRs total," and "strongly encourages" filers to test their files for schema compliance first. A bank with more CTRs in a day splits the batch, and the split is deterministic so a resend produces the same files.
- **Acknowledgments carry the identity.** The acknowledgment file returns, for each report, "a BSA Identifier and any corresponding acknowledgement errors"; the BSA ID is a 14-digit number, and an amendment or correction cites the prior report's BSA ID. The filing record isn't complete until its BSA ID is stored (`ctr_filings.bsa_id`, `bsa_restricted.sar_filings.bsa_id`).
- **Errors come back after the deadline clock started.** An acknowledgment with errors means the report must be corrected and refiled, and the original due date still applies; the queue for rejected reports is watched daily.
- **SAR filing data stays restricted.** The batch files, acknowledgments and error reports for SARs are SAR information and live in the restricted store, not a shared filing folder ([Confidentiality](/books/banking-and-lending/bsa-aml#confidentiality)).
- **The October 2025 FAQs changed workload, not deadlines.** The joint FAQs say a transaction "at or near the $10,000 CTR threshold is not information sufficient to require the filing of a SAR" on its own, that no separate post-SAR review is required, and that there is no requirement "to document its decision not to file a SAR"; they "do not alter existing BSA legal or regulatory requirements." CTRs remain due for cash "totaling more than $10,000 during any one business day."

## Lineage: From a Filed Number to Its Rows

Lineage is the record of how a number was produced: which source rows, which transformations, which definition version, which manual adjustments. The Basel Committee's principles for risk data aggregation (BCBS 239, January 2013) are the standard the largest banks are held to: data "aggregated on a largely automated basis so as to minimise the probability of errors," complete across "business line, legal entity, asset type, industry, region," and reports "reconciled and validated." Global systemically important banks were to meet them by January 2016. The ECB's 2024 guide on risk data aggregation asks supervised banks for "complete and up-to-date data lineages on data attribute level (starting from data capture and including extraction, transformation and loading)." A US community bank isn't held to either by name, but every examiner asks the question they answer.

What lineage looks like in a build:

- **Line, definition, run, rows.** Each `report_line_values` row names the line definition version that produced it, the pipeline run, and a reference to the extract of source rows it summed, so the number can be reproduced and its contributors listed ([Catalogs and Lineage](/docs/data/data-governance#catalogs-and-lineage)).
- **Transformations are code.** The derivations are SQL or models in version control, reviewed and tested like application code, never formulas in a spreadsheet that lives on someone's laptop ([Transformations Are Code](/docs/architecture/data-pipelines#transformations-are-code)).
- **Replayable from the snapshot.** Rerunning a filed quarter against its frozen snapshot with the definitions in force then reproduces the filed numbers exactly; a difference is a bug or an undocumented manual change ([Pipelines Must Be Replayable](/docs/architecture/data-pipelines#pipelines-must-be-replayable)).
- **One definition shared.** The loans past due 90 days in the call report, in the CECL model, in the board's credit report and in [Banking & Lending Metrics](/books/banking-and-lending/banking-metrics) are the same query, or the differences between them are written down. Three teams computing delinquency three ways is how a bank ends up explaining to its examiner why its board saw a different number than its call report.

## Reconciling Regulatory to the GL

The call report's balance sheet and income statement must equal the GL at quarter end, and every schedule that breaks a GL total into pieces must sum back to it. That's the check most often skipped and most often found in an exam:

| Reconciliation | Check | When it breaks |
| --- | --- | --- |
| **Balance sheet to GL** | Each RC line = the sum of GL accounts mapped to it, at the snapshot | A new GL account with no `report_line`, or mapped to two lines |
| **Detail schedules to totals** | Loans by type (RC-C) sum to total loans; deposits by type (RC-E) to total deposits | A subledger attribute missing or miscoded on some accounts |
| **Subledger to GL** | The quarter-end `subledger_proofs` all at zero or explained | A break left open at quarter end |
| **Past dues to servicing** | Past-due and nonaccrual amounts (RC-N) to the servicing system's aging as of the date | Different day counts for "past due" between systems |
| **Insured deposits** | Estimated insured and uninsured amounts to the insurance computation | Ownership categories missing, as at failed banks ([How a Bank Computes Insured Amounts](/books/banking-and-lending/deposit-insurance#how-a-bank-computes-insured-amounts)) |
| **HMDA to the LOS** | Register counts by action taken to the LOS pipeline's final actions | Rows never recorded, or excluded without reason |
| **CTRs to cash** | CTR filings to the day's aggregated cash above the threshold, by person | A branch or ATM channel missing from aggregation |

A worked example of my own. At June 30, 2026 a bank's GL shows $1,204,350,000 of loans held for investment. Its loan subledger, summed by call report category, gives $1,203,980,000: the GL is $370,000 higher. The difference resolves to two items: $250,000 of accrued interest that a conversion mapped to a loan GL account instead of interest receivable (a GL mapping error, corrected by a reclassification entry and a `gl_mappings` change), and $120,000 of charge-offs the servicing system recorded on June 30 whose GL entry carried a July 1 business date (a cutoff error, corrected by booking the entry into June before the quarter's GL closes). After both, the schedule total equals the RC line, and each fix is a row someone can read next quarter.

## Public Data Comes Back Out

What a bank files becomes public data others build on. The CDR's public site serves each institution's call reports, the Uniform Bank Performance Report (ratios against a peer group), bulk downloads and taxonomies; the FDIC's BankFind API serves institutions, locations, history, financials, summary of deposits and failures as JSON or CSV without a key ([Reading the Public Data](/books/banking-and-lending/exams-and-supervision#reading-the-public-data) shows a query). HMDA data is published by the agencies each year, and 1071 data will be. Two consequences for the filer:

- **Your filing is your counterparties' diligence.** A fintech choosing a sponsor bank, a depositor watching uninsured exposure and an analyst benchmarking efficiency all read the same call report, so an amended filing is visible.
- **The public figures are a check on yours.** The UBPR's ratios computed from your call report should match the ones your own metrics produce; a difference is a definition mismatch worth finding before an examiner does.

## How to Build It

The volume already has the filing records: `regulatory_filings` for call reports and holding company reports ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#how-to-build-it)), `hmda_lar_records` and `sblar_records` ([Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending#how-to-build-it)), `ctr_filings` and `bsa_restricted.sar_filings` ([BSA/AML Programs](/books/banking-and-lending/bsa-aml#how-to-build-it)), and `gl_accounts.report_line` with `subledger_proofs` ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it)). This chapter adds the inventory of obligations, the line definitions and values that make lineage possible, manual adjustments, edit results and one submission record for every regime:

```sql
CREATE TABLE report_obligations (          -- every report the institution owes, as data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  regime              TEXT NOT NULL CHECK (regime IN ('call_report', 'ncua_5300', 'fr_y9c',
                        'hmda', 'sblar', 'ctr', 'sar', 'state')),
  form                TEXT NOT NULL,         -- 'FFIEC 041', 'NCUA 5300', 'HMDA LAR 2026', ...
  trigger             TEXT NOT NULL CHECK (trigger IN ('period', 'event', 'determination')),
  frequency           TEXT,                  -- 'quarterly', 'annual'; null for event-driven
  due_rule            TEXT NOT NULL,         -- '30 calendar days after report date', ...
  channel             TEXT NOT NULL,         -- 'ffiec_cdr', 'cuonline', 'hmda_platform', 'bsa_efiling'
  filer_identifier    TEXT NOT NULL,         -- RSSD ID, LEI, BSA filer ID or charter number
  owner               TEXT NOT NULL,         -- the accountable team
  signer_role         TEXT,                  -- who certifies or attests
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE report_line_definitions (     -- how each line is derived, by instruction revision
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  form                TEXT NOT NULL,
  schedule            TEXT NOT NULL,         -- 'RC', 'RC-C', 'RC-N', 'RI'
  line_code           TEXT NOT NULL,         -- the line's item code on the form
  description         TEXT NOT NULL,
  derivation          TEXT NOT NULL CHECK (derivation IN ('gl_rollup', 'query', 'calculation',
                        'manual')),
  derivation_ref      TEXT NOT NULL,         -- the report_line values, or the query in version control
  instruction_rev     TEXT NOT NULL,         -- the instructions edition it implements
  version             INT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  UNIQUE (form, line_code, version)
);

CREATE TABLE report_line_values (          -- each filed number, with where it came from
  filing_id           UUID NOT NULL REFERENCES regulatory_filings (id),
  line_definition_id  UUID NOT NULL REFERENCES report_line_definitions (id),
  value               NUMERIC NOT NULL,      -- thousands of dollars or a count, as the form says
  computed_value      NUMERIC NOT NULL,      -- before adjustments
  pipeline_run_ref    TEXT NOT NULL,         -- the run, its code version and its snapshot
  source_extract_ref  TEXT,                  -- the contributing rows, for the walk back
  PRIMARY KEY (filing_id, line_definition_id)
);

CREATE TABLE report_adjustments (          -- every manual change to a computed line
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_id           UUID NOT NULL REFERENCES regulatory_filings (id),
  line_definition_id  UUID NOT NULL REFERENCES report_line_definitions (id),
  amount              NUMERIC NOT NULL,      -- signed, in the form's unit
  reason              TEXT NOT NULL,
  evidence_ref        TEXT NOT NULL,
  prepared_by         TEXT NOT NULL,
  approved_by         TEXT NOT NULL,
  CHECK (prepared_by <> approved_by)
);

CREATE TABLE filing_submissions (          -- every upload or batch, any regime
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  obligation_id       UUID NOT NULL REFERENCES report_obligations (id),
  period              DATERANGE,             -- the quarter or year; null for an event batch
  regulatory_filing_id UUID REFERENCES regulatory_filings (id),  -- call report or Y-9C
  file_ref            TEXT NOT NULL,         -- the exact bytes uploaded
  content_hash        TEXT NOT NULL,
  record_count        INT NOT NULL,
  submitted_at        TIMESTAMPTZ NOT NULL,
  submitted_by        TEXT NOT NULL,
  amends_id           UUID REFERENCES filing_submissions (id),
  amend_reason        TEXT,
  ack_ref             TEXT,                  -- the platform's receipt or acknowledgment file
  status              TEXT NOT NULL CHECK (status IN ('submitted', 'accepted', 'accepted_with_errors',
                        'rejected', 'superseded')),
  certified_by        TEXT,                  -- the officer's sign-off, where the form requires one
  CHECK (amends_id IS NULL OR amend_reason IS NOT NULL)
);

CREATE TABLE report_edit_results (         -- each edit the pipeline or the platform ran
  submission_id       UUID REFERENCES filing_submissions (id),
  filing_id           UUID REFERENCES regulatory_filings (id),
  edit_code           TEXT NOT NULL,         -- the published edit's identifier
  edit_type           TEXT NOT NULL CHECK (edit_type IN ('syntactical', 'validity', 'quality',
                        'macro_quality')),
  source              TEXT NOT NULL CHECK (source IN ('pipeline', 'platform')),
  passed              BOOLEAN NOT NULL,
  record_ref          TEXT,                  -- the row or line that failed
  explanation         TEXT,                  -- required to file with a failed quality edit
  explained_by        TEXT,
  run_at              TIMESTAMPTZ NOT NULL,
  CHECK (submission_id IS NOT NULL OR filing_id IS NOT NULL)
);
```

The balance sheet tie-out: every GL report line against the filed line, at the snapshot:

```sql
SELECT d.line_code,
       v.value                                             AS filed_thousands,
       ROUND(SUM(s.balance) / 100000.0)                    AS gl_thousands,  -- minor units to $000
       v.value - ROUND(SUM(s.balance) / 100000.0)          AS difference
FROM report_line_values v
JOIN report_line_definitions d ON d.id = v.line_definition_id AND d.derivation = 'gl_rollup'
JOIN gl_accounts g ON g.report_line = d.line_code AND g.institution_id = :institution_id
JOIN gl_snapshot_balances s ON s.gl_account_id = g.id AND s.snapshot_ref = :snapshot_ref
WHERE v.filing_id = :filing_id
GROUP BY d.line_code, v.value
HAVING v.value <> ROUND(SUM(s.balance) / 100000.0);       -- empty result: the tie-out holds
```

(`gl_snapshot_balances` is the frozen quarter-end extract behind `regulatory_filings.gl_snapshot_ref`; a warehouse table, not a new operational one.)

Design notes:

- **Obligations drive the calendar.** A daily job reads `report_obligations`, opens each period's filing when the period closes with its due date stored, and alerts the owner at set intervals before it; event-driven obligations (CTR, SAR) take their due dates from their own rows.
- **The pipeline never edits a filed value.** Corrections are a new `regulatory_filings` row and a new submission that amends the old one, with the reason.
- **Edits run twice.** The pipeline runs the published edits before submission, and the platform's results are stored beside them; a platform edit the pipeline didn't catch is a test to add.
- **Restricted regimes stay restricted.** SAR submissions and their acknowledgments are recorded in the BSA restricted schema; the shared `filing_submissions` table holds only regimes anyone in reporting may see.
- **Emit events:** `report_period.closed`, `filing.ready_for_review`, `filing.submitted`, `filing.acknowledged`, `filing.amended`, `edit.failed`.

## Auditing

- **Every filing as filed.** The exact file, its hash, who submitted and certified it, the acknowledgment, and every amendment with its reason.
- **Every number's derivation.** For each filed line, the definition version, the pipeline run, the snapshot and the contributing rows, reproducible on demand.
- **Every manual change.** Each adjustment with its preparer, approver, reason and evidence; no manual number without a row.
- **Every edit and its answer.** Each validity, quality and macro edit result, and each explanation filed with a failed quality edit.
- **The reconciliations.** Each quarter's tie-outs (balance sheet to GL, schedules to totals, HMDA to LOS, CTRs to cash) with their differences and how they were resolved.
- **On time, every time.** Each obligation's due date beside its submission time, which is the first thing an examiner checks.

## What This Means for the System You Build

- **Keep an inventory of every report owed** as data, with its trigger, due rule, channel, filer identifier and owner.
- **Derive every filed number** from frozen snapshots by versioned definitions in code, never by hand in the filing software.
- **Run the published edits as tests** days before the deadline, and store every result and explanation.
- **Record manual adjustments as rows** with a preparer and a different approver.
- **Tie every regulatory total to the GL** and every detail schedule to its total, each quarter, with differences resolved and written down.
- **Store every submission's exact bytes and acknowledgment,** and amend by new submission, never by overwrite.
- **Share definitions** between the call report, the CECL model, the board's reports and the metrics, or document the differences.
- **Keep SAR filing data in the restricted store,** including batch files and acknowledgments.

## References

**Law and regulation**

- [12 CFR 304.3](https://www.law.cornell.edu/cfr/text/12/304.3), every insured depository institution files the Consolidated Reports of Condition and Income
- [12 CFR 1003.5 (Regulation C)](https://www.law.cornell.edu/cfr/text/12/1003.5), the March 1 annual and 60-day quarterly HMDA submissions and the LEI
- [12 CFR 1003.2 (Regulation C)](https://www.law.cornell.edu/cfr/text/12/1003.2), the 25 closed-end and 200 open-end coverage thresholds
- [12 CFR 1002.109 (Regulation B)](https://www.law.cornell.edu/cfr/text/12/1002.109), small business lending data due by June 1 in the Bureau's prescribed format with a Filing Instructions Guide
- [Federal Register: Small Business Lending Under the Equal Credit Opportunity Act (Regulation B), May 1, 2026](https://www.federalregister.gov/api/v1/documents/2026-08494.json), 91 FR 23530, effective June 30, 2026, compliance January 1, 2028
- [31 CFR 1020.320](https://www.law.cornell.edu/cfr/text/31/1020.320), SAR thresholds, the 30-day and 60-day deadlines and five-year retention
- [31 CFR 1010.306](https://www.law.cornell.edu/cfr/text/31/1010.306), CTRs due within 15 days

**Regulators and guidance**

- [FFIEC 031 and 041 General Instructions (September 2026)](https://www.fdic.gov/bank-financial-reports/ffiec-031-and-041-general-instructions-september-2026.pdf), which form each bank files, submission through the CDR, validity and quality edits and the due dates
- [NCUA: CUOnline](https://ncua.gov/regulation-supervision/regulatory-reporting/cuonline), the 5300 and Profile filing system, NCUA Connect and the quarterly due dates
- [Federal Reserve: FR Y-9C](https://www.federalreserve.gov/apps/reportingforms/Report/Index/FR_Y-9C), holding companies of $3 billion or more, quarterly
- [FFIEC: HMDA Filing Instructions Guide for 2026](https://ffiec.cfpb.gov/documentation/fig/2026/overview), the pipe-delimited file, the HMDA Platform, the LEI and the four edit types
- [CFPB: Small business lending filing instructions guide](https://www.consumerfinance.gov/data-research/small-business-lending/filing-instructions-guide/), the guides published so far
- [FinCEN: Filing information](https://www.fincen.gov/resources/filing-information), electronic filing only through BSA E-Filing
- [FinCEN: CTR XML user guide](https://bsaefiling.fincen.gov/docs/XMLUserGuide_FinCENCTR.pdf), batch size, schema testing, acknowledgments and the BSA ID
- [FinCEN and the banking agencies: SAR FAQs (October 2025)](https://www.fincen.gov/system/files/2025-10/SAR-FAQs-October-2025.pdf), near-threshold transactions, post-SAR reviews, no documentation of no-file decisions, the CTR threshold
- [Basel Committee: Principles for effective risk data aggregation and risk reporting (BCBS 239)](https://www.bis.org/publ/bcbs239.htm), the January 2013 principles
- [BCBS 239 (full text)](https://www.bis.org/publications/201301-guidelines-principles-effective-risk-data-aggregation-and-risk-reporting.pdf), automated aggregation, completeness, reconciled reports and the 2016 deadline
- [ECB: Guide on effective risk data aggregation and risk reporting (May 2024)](https://www.bankingsupervision.europa.eu/ecb/pub/pdf/ssm.supervisory_guides240503_riskreporting.en.pdf), data lineage at attribute level

**Data**

- [FFIEC Central Data Repository: public data](https://cdr.ffiec.gov/public/), call reports, the UBPR, bulk data and taxonomies
- [FDIC: BankFind Suite API](https://api.fdic.gov/banks/docs), public institution, financial and failure data without a key
