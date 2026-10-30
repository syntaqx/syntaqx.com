+++
title = "Exams, Ratings & Call Reports"
nav_title = "Exams & Call Reports"
description = "How banks are supervised: exam cycles, CAMELS and its 2026 proposal, MRAs, consent orders, supervisory confidentiality, call reports, public data and CRA."
category = "Banking & Lending Industry"
order = 2406
part = "The Business"
tags = ["banking", "supervision", "camels", "call-reports", "enforcement", "cra"]
+++

A bank is examined on a schedule, rated on a scale it can't publish, told in writing what to fix and by when, and, if it doesn't, placed under an order that is public. Between examinations it files a quarterly call report whose numbers become everyone's data: the FDIC's Quarterly Banking Profile, the peer reports examiners compare it against, and the public datasets analysts, fintechs and journalists use to judge it. Supervision is continuous at the largest banks and periodic at the smallest, but its artifacts are the same everywhere: the examination, the rating, the finding, the action and the report.

For an engineer, supervision is a set of record-keeping and reporting obligations with deadlines. Examiners ask for data the systems must produce, findings become remediation projects with dates, an order's articles become requirements that change how products are built, and the call report is a regulatory GL extract due 30 days after quarter end with no extensions. This chapter covers the cycle, the ratings and the 2026 proposal to change them, findings and enforcement, the confidentiality rules, call reports and the public data built on them, and the Community Reinvestment Act. Who examines which charter is in [Charters & Regulators](/books/banking-and-lending/charters-and-regulators#who-examines-whom).

## How the Platforms Do It

The regulators publish most of what a builder needs, free. As of October 2026:

| Source | What's in it | Keyed by | Access |
| --- | --- | --- | --- |
| FFIEC Central Data Repository | Call reports for every bank, the Uniform Bank Performance Report (UBPR), bulk data and taxonomies | RSSD ID, FDIC certificate | Public web, bulk files, web services |
| FDIC BankFind Suite API | Institutions, branches, history, financials, summary of deposits, failures, demographics | FDIC certificate | Public JSON API; no key required |
| FDIC Quarterly Banking Profile | Industry and community bank aggregates each quarter | Industry and peer groups | Public PDF and data |
| Federal Reserve FR Y-9C | Consolidated holding company financials for holding companies of $3 billion or more | RSSD ID | Public |
| NCUA call report data | Quarterly credit union financials | NCUA charter number | Public |
| OCC and FDIC enforcement releases | Orders, agreements, terminations, monthly | Institution name and charter | Public search and monthly releases |
| CRA performance evaluations | Public section of each evaluation and the rating | Institution | Public |

What is not public: examination reports, CAMELS ratings and supervisory findings, which are confidential supervisory information ([Confidential Supervisory Information](#confidential-supervisory-information)). The gap between what the public can compute and what examiners concluded is where the surprises in [When Banks Fail](/books/banking-and-lending/bank-failures) came from.

## The Exam Cycle

The Federal Deposit Insurance Act requires a full-scope, on-site examination of every insured institution "not less than once during each 12-month period" (12 USC 1820(d)). Smaller, healthy banks qualify for 18 months. Section 903 of the 21st Century ROAD to Housing Act (Pub. L. 119-101), signed July 11, 2026, raised the asset threshold for the 18-month cycle from $3 billion, where the 2018 EGRRCPA had set it, to $6 billion. The agencies' interim final rule, effective September 14, 2026, sets the conditions: the bank must be well capitalized, rated composite 1 or 2 and Management 1 or 2 at its last examination, not subject to a formal enforcement proceeding or order, and not have changed control in the prior 12 months. The agencies estimated about 188 more banks became eligible, about 4,016 in all.

Federal and state examiners can alternate cycles for state banks. Larger banks are supervised continuously by teams that run targeted reviews through the year: the Federal Reserve organizes its supervision by size, with the largest firms in its LISCC portfolio, other banks of $100 billion or more in the Large and Foreign Banking Organization portfolio, $10 billion to $100 billion in the Regional Banking Organization portfolio and smaller banks in the Community Banking Organization portfolio.

What an examination asks of the systems: a request letter weeks ahead listing reports, policies and data (loan trial balances, deposit listings, GL detail, exception reports, complaint logs, vendor lists, BSA alerts and SARs, IT and security evidence), then onsite or remote review, then an exit meeting and a report of examination. A bank that can produce those extracts from its systems on request, at a stated as-of date, has an easier exam than one that assembles them by hand.

## CAMELS

Bank examiners rate safety and soundness under the Uniform Financial Institutions Rating System, revised in 1996 to add the sixth component; the Federal Reserve's letter implementing the 1996 version made it effective January 1, 1997. Six components, each rated 1 (best) to 5:

| Component | What examiners assess (1996 text) |
| --- | --- |
| **C**apital adequacy | Whether the bank maintains "capital commensurate with the nature and extent of risks" |
| **A**sset quality | The "quantity of existing and potential credit risk" in loans and investments |
| **M**anagement | The ability of the board and management "to identify, measure, monitor, and control the risks" |
| **E**arnings | The "quantity and trend of earnings" and their sustainability |
| **L**iquidity | The "current level and prospective sources of liquidity compared to funding needs" |
| **S**ensitivity to market risk | Exposure to changes in interest rates, foreign exchange, commodity and equity prices |

The composite rating runs from 1, "sound in every respect," through 2, "fundamentally sound," and 3, "some degree of supervisory concern in one or more of the component areas," to 4, which "generally exhibit unsafe and unsound practices or conditions," and 5, "extremely unsafe and unsound practices or conditions." Banks rated 4 or 5 make up the FDIC's Problem Bank List: 47 banks at June 30, 2026, 1.1% of banks, in what the FDIC calls the normal range of 1 to 2% outside crises. A composite of 3 or worse brings restrictions on transactions, higher deposit or share insurance assessments and possible enforcement, and a Management rating of 1 or 2 is now a condition of the 18-month cycle.

Ratings track the risks the earlier chapters measure. SVB's Sensitivity to Market Risk rating was "Satisfactory-2" despite years of breached internal interest rate risk limits, and the Federal Reserve's supervisors planned to cut it to 3 in the 2022 examination; the bank failed before the downgrade was finalized ([Bank Economics](/books/banking-and-lending/bank-economics#interest-rate-risk-and-alm)). Credit unions are rated under CAMELS by NCUA, and the largest holding companies under the Federal Reserve's separate LFI rating system, revised by a final rule of November 17, 2025, effective January 16, 2026, that redefined "well managed" around resilience under stress.

### The 2026 Proposal

On May 19, 2026 the FFIEC agencies published the first major rewrite of UFIRS since 1996 (91 FR 29128), with comments due August 17, 2026. It keeps six components and the 1 to 5 scale and changes what drives them:

- **Material financial risk first.** Ratings would "emphasize factors that materially affect an institution's financial condition and risk profile," with less weight on policy, procedure and documentation concerns.
- **A narrower Management component.** It would drop management depth and succession, responsiveness to auditors and supervisors and willingness to serve community needs, and rate Management 3 or worse generally "only when risk management practices result in material financial risk." The composite would lose the "special consideration" Management now gets.
- **No reputation risk.** The proposal would "remove all references to reputation risk," after the OCC and FDIC's April 2026 final rule barring its supervisory use, and NCUA's June 2026 counterpart.
- **Specialty ratings count only through financial impact.** Consumer compliance, BSA/AML, IT and trust findings would affect CAMELS only to the extent they create material financial risk.
- **Sensitivity looks at earnings, too:** recent and expected net interest income and exposure to rate volatility.
- **Composite 4 needs deterioration,** not weaknesses alone.

NCUA said the revised system would apply to all federally insured credit unions. Comptroller Jonathan Gould supported the proposal but said it doesn't go far enough on Management, which he wants to "serve as a standalone assessment rather than a secondary reflection of other components." As of October 2026 no agency had adopted a final version.

## Findings: MRAs and Violations

An examination ends in findings, and how they're labeled decides how much they cost. Matters requiring attention (MRAs) are written supervisory findings that management must remediate by a date; matters requiring immediate attention (MRIAs) are the more urgent tier; and violations of law are cited separately. Below them are written advisories and verbal observations, which the Federal Reserve's SVB review found were all supervisors had issued for SVB's interest rate risk weaknesses in the 2020, 2021 and 2022 examinations before an MRA in November 2022.

The OCC and FDIC narrowed both terms by a final rule of September 1, 2026, effective November 2, 2026 (91 FR 56004; the Federal Reserve did not join). An "unsafe or unsound practice" is now one contrary to generally accepted standards of prudent operation that, if continued, is likely to materially harm the institution's financial condition or present a material risk of loss to the Deposit Insurance Fund, or has already materially harmed it; financial condition means capital, asset quality, earnings, liquidity and sensitivity to market risk. Examiners may issue MRAs only for such practices "under current or reasonably foreseeable conditions," or for substantive violations of law (a pattern or systemic violation, more than minimal harm, more than minimal restitution, or insider misconduct), and may direct remediation of other violations without an MRA.

Every finding is a project: an owner, a root cause, a remediation plan, evidence it was done and validation, often by internal audit, before the examiner closes it. SVB had 31 open supervisory findings when it failed, about triple its peers' count. A findings tracker that records only open and closed is the wrong tool; the examiner will ask for the plan, the milestones missed and the evidence.

## Enforcement

When findings aren't fixed, or a problem is serious enough, the agency escalates.

- **Informal actions:** board resolutions and memoranda of understanding (MOUs), not public. SVB's MOU took more than seven months to draft, and the bank failed before it was delivered.
- **Formal actions:** written or formal agreements, consent orders and cease-and-desist orders, civil money penalties, removal and prohibition orders against individuals, and, for the worst cases, termination of deposit insurance.

The statute behind formal actions is 12 USC 1818. An agency can order an institution to cease and desist from an unsafe or unsound practice or a violation of law, rule, written condition or written agreement and to take affirmative corrective action; most such orders are consent orders the bank agrees to rather than litigates. Civil money penalties have three statutory tiers before inflation adjustment: up to $5,000 a day for violations, up to $25,000 a day for reckless or patterned conduct, and up to $1,000,000 a day for knowing conduct, for an institution the lesser of $1,000,000 or 1% of total assets. The agencies must publish final orders and enforceable written agreements, and any modification or termination of them, unless publication would seriously threaten safety and soundness.

Publication makes enforcement data. The OCC publishes its actions monthly (for example its October 2026 release on October 22) with a searchable database; the FDIC publishes a monthly list (a typical one: "four prohibition orders, three orders terminating deposit insurance, two consent orders, one order to pay civil money penalty (CMP), and one order terminating consent order"). Sponsor bank orders since 2023 have made this the most-read regulatory data in fintech, because an order's articles often require the bank to inventory its fintech partners, approve new ones and products in advance and look back years at customer files (Payments' [Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny) has the orders; [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight) covers the bank's side).

An order ends by termination, which the agency publishes too. Until then, every article with a deadline is a requirement with an owner, and the board reports progress on a schedule the order sets.

## Confidential Supervisory Information

Examination reports, ratings and findings are confidential supervisory information (CSI), and they belong to the agency, not the bank. The OCC's rule says "All non-public OCC information remains the property of the OCC" and recipients may not disclose it without prior written permission (12 CFR 4.36); the FDIC's says "all copies of such records shall remain the property of the Corporation" and permits certain disclosures (to the bank's directors, officers and agents, other agencies, the parent holding company) at its discretion (12 CFR 309.6); the Federal Reserve's says CSI "remains the property of the Board" and may not be disclosed "without the prior written permission of the General Counsel" (12 CFR 261.20).

Two consequences for builders:

- **A bank can't simply forward its exam findings to a fintech partner or vendor.** It can share the work the findings require, and may need the agency's permission to share the findings themselves, which is why sponsor bank remediation requests to program managers often arrive without the underlying report.
- **CSI needs its own access control.** Exam reports, ratings and findings live in a restricted store with access logging, not in a general ticket system or a shared drive ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## Call Reports

Every insured bank files a Consolidated Report of Condition and Income (the call report) each quarter, as of March 31, June 30, September 30 and December 31. Which form:

| Form | Who files |
| --- | --- |
| FFIEC 031 | Banks with any foreign office, banks with $100 billion or more in total consolidated assets, and advanced approaches institutions |
| FFIEC 041 | Banks with domestic offices only and less than $100 billion in assets |
| FFIEC 051 | Banks with domestic offices only and less than $5 billion in assets, other than advanced approaches, Category III and certain large or highly complex institutions |

The report is due "no more than 30 calendar days after the report date" (the March 31 report by April 30), 35 days for a bank with more than one foreign office, and "No extensions of time for submitting reports are granted." Holding companies of $3 billion or more file the Federal Reserve's FR Y-9C; credit unions file NCUA's call report through its CUOnline system by April 30, July 30, October 30 and January 30.

A call report is a regulatory view of the GL: a balance sheet (Schedule RC), an income statement (Schedule RI) and dozens of supporting schedules on loans by type, past dues, deposits by type and insured status, securities, capital and off-balance-sheet items, many requiring data the GL doesn't hold (loan purpose, collateral, maturity buckets, insured versus uninsured deposits). That is why the core model's `gl_accounts` carries a `report_line` ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)), and why [Regulatory Reporting & Data](/books/banking-and-lending/regulatory-reporting) covers the full lineage problem. Its numbers are public within weeks, and every number in the QBP and in [Bank Economics](/books/banking-and-lending/bank-economics) is built from them.

## Reading the Public Data

The FFIEC's Central Data Repository publishes each bank's call reports, its UBPR (ratios against a peer group, the same report examiners start from), bulk data and taxonomies. The FDIC's BankFind Suite API serves institution, branch, history, financial, summary of deposits and failure data as JSON without registration; for example, a count of active national banks:

```text
GET https://api.fdic.gov/banks/institutions?filters=ACTIVE:1 AND BKCLASS:N&fields=NAME&limit=1
-> meta.total: 660   (dataset of October 23, 2026)
```

Uses a builder actually has:

- **Partner diligence.** A fintech choosing a sponsor bank, or a bank choosing a correspondent, reads its capital ratios, growth, deposit mix, uninsured share and enforcement history before it signs.
- **Monitoring.** A program can watch its bank's quarterly capital, liquidity and asset growth, and the enforcement releases, for the early signs of an order or a failure.
- **Market sizing and benchmarking** across peers by size, charter and region.
- **Identity.** Mergers, failures and charter changes come with the FDIC certificate and RSSD ID, which is how routing and institution data stay current ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)).

## CRA

The Community Reinvestment Act requires each agency to assess every insured bank's record of meeting the credit needs of its entire community, including low- and moderate-income neighborhoods, and to take it into account on applications for a deposit facility (charters, deposit insurance, branches, mergers and acquisitions); an unsatisfactory record blocks a holding company's election to be a financial holding company (12 USC 2903). Ratings have four levels: Outstanding, Satisfactory, Needs to Improve and Substantial Noncompliance, and each written evaluation has a public section and a confidential one (12 USC 2906).

The rule that implements it has been in limbo since 2023. As of October 2026:

- **The 2023 rule** (89 FR 6574, February 1, 2024) was preliminarily enjoined on March 29, 2024 in Texas Bankers Association v. OCC (No. 2:24-cv-00025-Z, N.D. Tex.); the Fifth Circuit dismissed the agencies' appeal on July 9, 2026.
- **The rescission proposal** of July 18, 2025 (90 FR 34086) would have restored the regulations in effect before the 2023 rule.
- **A new proposal instead.** On August 12, 2026 the OCC and FDIC said they "have decided not to finalize the rescission proposal but to issue this new proposal instead" (91 FR 52114), with comments due October 13, 2026. The Federal Reserve did not join; its next steps on the rescission proposal "rest exclusively with its Governors."
- **In force meanwhile:** the legacy regulations. For 2026 a small bank is one under $1.649 billion in assets and an intermediate small bank one from $412 million to under $1.649 billion.

The systems side of CRA is data: loans geocoded to census tracts with income levels, deposits and branches by assessment area, community development activity with documentation, and the public file. HMDA and small business data feed it ([Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending)).

## How to Build It

These are deltas against the core model's `institutions` and `gl_accounts` ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)). Supervision produces three kinds of records: confidential ones the bank holds under the agency's rules (examinations, ratings, findings), public ones that can be ingested (orders, call reports), and the bank's own filings:

```sql
CREATE TABLE examinations (                -- CSI: restricted store, access logged
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  agency           TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('full_scope', 'targeted', 'continuous',
                     'it', 'bsa', 'consumer_compliance', 'cra', 'trust', 'preopening')),
  as_of_date       DATE NOT NULL,
  started_on       DATE NOT NULL,
  report_received  DATE,
  ratings          JSONB,                    -- composite and components; CSI
  report_uri       TEXT                      -- encrypted, agency-owned document
);

CREATE TABLE supervisory_findings (        -- MRAs, MRIAs, violations, order articles
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  examination_id   UUID REFERENCES examinations (id),
  enforcement_action_id UUID,                -- set for an order article; enforcement_actions below
  kind             TEXT NOT NULL CHECK (kind IN ('mra', 'mria', 'violation',
                     'order_article', 'internal_audit', 'self_identified')),
  title            TEXT NOT NULL,
  owner            TEXT NOT NULL,
  due_on           DATE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('open', 'remediation_complete',
                     'validated', 'closed_by_agency', 'past_due')),
  program_id       UUID REFERENCES programs (id),  -- when a fintech program is in scope
  closed_on        DATE
);

CREATE TABLE finding_milestones (          -- the plan the examiner will ask for
  finding_id       UUID NOT NULL REFERENCES supervisory_findings (id),
  seq              INT NOT NULL,
  description      TEXT NOT NULL,
  due_on           DATE NOT NULL,
  completed_on     DATE,
  evidence_ref     TEXT,
  PRIMARY KEY (finding_id, seq)
);

CREATE TABLE enforcement_actions (         -- public: ingested from agency releases
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  agency           TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('formal_agreement', 'consent_order',
                     'cease_and_desist', 'civil_money_penalty', 'prohibition',
                     'termination', 'other')),
  docket           TEXT,
  effective_on     DATE NOT NULL,
  terminates_id    UUID REFERENCES enforcement_actions (id),  -- a termination points at its order
  source_url       TEXT NOT NULL
);

CREATE TABLE regulatory_filings (          -- call reports, Y-9C, NCUA call report
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  form             TEXT NOT NULL,            -- 'FFIEC 041', 'FR Y-9C', 'NCUA call report'
  report_date      DATE NOT NULL,            -- the quarter end
  due_on           DATE NOT NULL,            -- report_date + 30 (or 35) days
  submitted_at     TIMESTAMPTZ,
  amends_id        UUID REFERENCES regulatory_filings (id),
  gl_snapshot_ref  TEXT NOT NULL,            -- the frozen GL and subledger extract it came from
  content_hash     TEXT,
  UNIQUE (institution_id, form, report_date, amends_id)
);
```

Design notes:

- **Findings are not tickets.** They have milestones, evidence and validation; a past-due milestone is reported to the board. Keep them outside the general issue tracker because of CSI, and give programs a filtered view of the work assigned to them, not the finding text.
- **A filing is reproducible.** Each `regulatory_filings` row points at the frozen extract it was built from; an amendment is a new row that `amends_id` the original, never an overwrite ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Ingest the public side.** Enforcement releases and call report data for your own bank, its peers and any partner bank are scheduled jobs keyed by FDIC certificate or RSSD ID, so a new order against a partner raises an alert the morning it's published.
- **Exam requests are reports.** The standard request list (trial balances, deposit listings, exception reports, complaint logs, vendor inventories) should be runnable as-of any date from the warehouse, not built during the exam ([Producing Records](/docs/architecture/audit-trails#producing-records)).

## Auditing

- **CSI access:** who opened each examination report, rating and finding, when, and whether disclosure outside the bank had the agency's permission.
- **Each finding's full history:** the original text, the plan, every milestone change with the reason, the evidence and who validated it.
- **Each order article's status,** with the board reports that covered it, through termination.
- **Each filing's lineage:** the extract, the mapping version from GL accounts to report lines, the reviewer and sign-off, and every amendment with its reason.

## What This Means for the System You Build

- **Assume an examiner will ask for it as of a date.** Loan and deposit listings, exceptions, complaints and vendor inventories must be producible for any past date from the systems, not reconstructed.
- **Run findings and order articles as tracked work with evidence,** with past-due items visible to management and, for a sponsor bank, scoped to the programs they touch.
- **Treat CSI as a data class.** Restricted storage, access logs and a rule that it leaves the bank only with permission.
- **Make the call report a pipeline, not a project.** GL accounts mapped to report lines, subledger attributes (insured status, loan purpose, collateral) captured at origination, and a frozen extract per quarter.
- **Watch your partners' public data.** Capital, growth and enforcement releases for every bank a program depends on are free and early warnings.

## References

**Law and regulation**

- [12 USC 1818: Termination of status as insured depository institution](https://www.law.cornell.edu/uscode/text/12/1818), cease-and-desist orders, civil money penalty tiers and the publication requirement
- [12 USC 1820: Administration of Corporation](https://www.law.cornell.edu/uscode/text/12/1820), the 12-month examination requirement and 18-month eligibility
- [12 USC 2903: Financial institutions; evaluation](https://www.law.cornell.edu/uscode/text/12/2903), CRA assessments, applications and the financial holding company election
- [12 USC 2906: Written evaluations](https://www.law.cornell.edu/uscode/text/12/2906), the four CRA ratings and the public and confidential sections
- [12 CFR 4.36: Disclosure of non-public OCC information](https://www.law.cornell.edu/cfr/text/12/4.36), OCC CSI is the OCC's property and needs prior written permission to disclose
- [12 CFR 309.6: Disclosure of exempt records](https://www.law.cornell.edu/cfr/text/12/309.6), FDIC records and discretionary permitted disclosures
- [12 CFR 261.20: Confidential supervisory information made available to supervised financial institutions](https://www.law.cornell.edu/cfr/text/12/261.20), the Federal Reserve's rule
- [Expanded Examination Cycle for Certain Small Insured Depository Institutions, interim final rule (91 FR 58009, September 14, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-09-14/html/2026-18766.htm), the $6 billion threshold under Pub. L. 119-101, the conditions and eligibility estimates
- [Unsafe or Unsound Practices; Matters Requiring Attention, final rule (91 FR 56004, September 1, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-09-01/html/2026-17823.htm), the definitions, the MRA standard and the November 2, 2026 effective date
- [FFIEC: Uniform Financial Institutions Rating System, proposed revisions (91 FR 29128, May 19, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-05-19/html/2026-09944.htm), the proposed changes to components, Management, reputation risk and the composite
- [OCC and FDIC: Prohibition on the Use of Reputation Risk by Regulators (April 10, 2026)](https://www.federalregister.gov/documents/2026/04/10/2026-06947/prohibition-on-the-use-of-reputation-risk-by-regulators), the final rule
- [Federal Reserve: Revisions to the Large Financial Institution Rating System (90 FR 51329, November 17, 2025)](https://www.federalregister.gov/api/v1/documents/2025-19945.json), the revised LFI framework effective January 16, 2026
- [Community Reinvestment Act, OCC and FDIC proposal (91 FR 52114, August 12, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-08-12/html/2026-16454.htm), the decision not to finalize rescission, the litigation history, and the Federal Reserve's separate position
- [Community Reinvestment Act Regulations, rescission proposal (90 FR 34086, July 18, 2025)](https://www.federalregister.gov/documents/2025/07/18/2025-13559/community-reinvestment-act-regulations), the proposal to restore the prior rules

**Regulators and guidance**

- [Federal Reserve: SR 96-38, Uniform Financial Institutions Rating System](https://www.federalreserve.gov/boarddocs/srletters/1996/sr9638.htm), the 1996 component and composite definitions, effective January 1, 1997
- [Federal Reserve: Review of the Federal Reserve's Supervision and Regulation of Silicon Valley Bank (April 28, 2023)](https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf), supervision portfolios, the IRR rating, advisories before MRAs, the MOU and 31 open findings
- [FDIC: Quarterly Banking Profile, Second Quarter 2026](https://www.fdic.gov/quarterly-banking-profile), the Problem Bank List count and its definition
- [FFIEC 031 and 041 Call Report General Instructions](https://fdic.gov/media/177616), which form each bank files and the 30- and 35-day deadlines
- [FDIC: Call Reports](https://www.fdic.gov/resources/bankers/call-reports), current forms and instructions
- [FFIEC: Central Data Repository Public Data Distribution](https://cdr.ffiec.gov/public/), call reports, UBPR, bulk data and web services
- [FDIC: BankFind Suite API](https://api.fdic.gov/banks/docs), public institution, financial, history and failure datasets
- [Federal Reserve: FR Y-9C](https://www.federalreserve.gov/apps/reportingforms/Report/Index/FR_Y-9C), consolidated holding company reports for $3 billion and above
- [NCUA: CUOnline](https://ncua.gov/regulation-supervision/regulatory-reporting/cuonline), credit union call report cycle and due dates
- [OCC: Enforcement Actions Search](https://apps.occ.gov/EASearch), the public database of OCC actions
- [OCC: Enforcement actions for October 2026 (NR 2026-93, October 22, 2026)](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-93.html), a monthly release
- [FDIC: Monthly enforcement actions release (April 28, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23032.html), an example of the FDIC's monthly list

**In practice**

- [Morgan Lewis: Banking agencies propose major changes to how financial institutions are rated (July 2, 2026)](https://www.morganlewis.com/pubs/2026/07/banking-agencies-propose-major-changes-to-how-financial-institutions-are-rated), consequences of ratings of 3 or worse and the Comptroller's view on Management
