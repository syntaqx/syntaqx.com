+++
title = "Loan Origination"
description = "The loan application end to end: what counts as an application, POS and LOS, MISMO data, the pipeline, conditions, documents and verification services."
category = "Banking & Lending Industry"
order = 2442
part = "Origination and Underwriting"
tags = ["banking", "lending", "origination", "los", "mismo", "verification"]
+++

Origination is everything between a borrower's first click and a funded loan: taking the application, collecting and verifying what the borrower said, pulling credit, deciding, disclosing, closing and handing the loan to servicing. For a $2,000 personal loan it can happen in under a minute with no human involved; for a mortgage it takes weeks, passes through a loan officer, a processor, an underwriter and a closer, and produces a file of several hundred pages that an investor will buy only if every condition on it is cleared. The software is a workflow engine with a regulated clock: the moment a request becomes an *application*, and the moment that application becomes *complete*, start deadlines in three different regulations, and the record of what the borrower said, what was verified and when is what an examiner and an investor will both ask for.

This chapter covers what counts as an application under Regulation B, TILA's mortgage rules and HMDA; the point-of-sale and loan origination systems and the vendors that sell them; MISMO and the mortgage application data standard; the pipeline and its stages; conditions; documents and the verification services that replaced most of them; and incomplete applications. Pulling and reading credit is [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores); the decision itself is [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines); the notices that follow a decline are [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action). The mortgage disclosure clocks are TRID & Mortgage Disclosures, and signing and the eNote are Closing, eNotes & MERS. Identity verification at application is [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#verifying-identity-in-software).

## How the Platforms Do It

As of October 2026, from vendor pages, filings and the agencies' guides:

| Platform | What it is | Lines of business | Notes |
| --- | --- | --- | --- |
| **ICE Encompass** | Mortgage LOS | Mortgage | Calls itself "the industry's system of record"; point of sale (Consumer Connect, TPO Connect for brokers), pricing engine, eClose, investor delivery and MERS registration in one suite; APIs through Encompass Developer Connect |
| **nCino** | Bank operating platform built on the Salesforce Platform | Commercial, small business, consumer, mortgage (SimpleNexus), deposit account opening | Revenue of $594.8 million for the fiscal year ended January 31, 2026; moved from per-seat to asset-based pricing; an integration gateway to cores |
| **Blend** | Point of sale and origination | Mortgage, home equity, vehicle, cards, personal loans, deposit accounts, closing | Priced per completed transaction (a funded loan, an opened account), not per application; processed "nearly $1.3 trillion in loan applications" in 2025 |
| **MeridianLink** | Consumer and mortgage LOS for banks and credit unions | Consumer loans, mortgage, deposit opening, decisioning (DecisionLender) | Taken private by Centerbridge Partners, closing October 24, 2025, at $20.00 a share |
| **Fannie Mae Desktop Underwriter (DU)** | The GSE's automated underwriting system, called from the LOS | Conventional mortgage | Returns Approve/Eligible, Approve/Ineligible, Refer with Caution or Out of Scope, with findings the lender must clear; optional validation of income, employment and assets |
| **Freddie Mac Loan Product Advisor (LPA)** | Freddie Mac's automated underwriting system | Conventional mortgage | Returns Accept or Caution with feedback on DTI, LTV and reserves; asset and income modeler (AIM) automates verification |

Three patterns stand out. **The LOS is a system of record for the file, not the loan:** once the loan funds, it boards to a servicing system and the LOS keeps the origination history. **Point of sale and LOS are different products that often come from different vendors:** the borrower-facing application (Blend, Encompass's Consumer Connect, a lender's own app) feeds a back-office LOS through an API, and the seam between them is where application data gets re-keyed or lost. **Pricing models differ and shape the build-versus-buy decision:** per transaction, per asset under management, per seat; a lender with a high application-to-close ratio pays very differently under each.

## What Counts as an Application

Three regulations each define an application, and they don't agree. The system has to know which moment each one cares about, because they start different clocks.

- **Regulation B (ECOA).** An application is "an oral or written request for an extension of credit" made under the creditor's procedures, and a **completed application** is one for which the creditor has received all the information it normally uses to decide (12 CFR 1002.2(f)). Reg B's 30-day notice clock runs from the completed application. Whether an inquiry or prequalification becomes an application "depends on how the creditor responds": quoting general terms isn't one, but evaluating the consumer's information and declining is, and then the adverse action rules apply (comment 2(f)-3).
- **TILA's mortgage rules (TRID).** For most closed-end mortgages, an application is the submission of **six pieces of information**: name, income, Social Security number to obtain a credit report, property address, an estimate of the property's value and the loan amount sought (12 CFR 1026.2(a)(3)(ii)). The sixth item received starts the Loan Estimate clock (TRID & Mortgage Disclosures covers the deadlines). A lender can't hold off by asking for a seventh item first.
- **Regulation C (HMDA).** An application is "an oral or written request for a covered loan" under the institution's procedures; prequalification requests aren't reported, but a program that meets the definition of preapproval is, whatever it's called (12 CFR 1003.2(b) and comments 2(b)-2 and -3). Fair Lending, HMDA & 1071 covers the LAR.

So one mortgage file carries at least three timestamps: when the sixth TRID item arrived, when Reg B's application became complete, and whether HMDA counts it at all. A consumer loan has the first and second collapse into one, often within the same second. My rule: store each regulatory moment as its own column, set by the event that triggered it, and never infer one from another after the fact.

**Prequalification and preapproval.** A prequalification estimates what a borrower might get, usually on a soft credit inquiry, and promises nothing; a preapproval is a full credit review with a written commitment subject to limited conditions (a property, an appraisal). The names are marketing; the regulatory treatment follows what the lender actually did. A prequalification flow that declines a consumer after evaluating their data has, under Reg B, taken an application and owes a notice.

## Point of Sale and the LOS

The **point of sale (POS)** is the borrower's side: the application form, document upload, consent capture, status tracking and, increasingly, the connections that pull data instead of asking for it (payroll, bank accounts, tax transcripts). The **loan origination system (LOS)** is the lender's side: the file, the workflow, the tasks for each role, the calls to credit bureaus, automated underwriting, pricing, appraisal management, disclosures and document generation, and the handoff to closing and servicing.

For consumer lending the two often merge into one product, with the decision engine in the middle. For mortgages they stay separate because the LOS is where the regulated work happens: loan officers (whose licensing is Lender Licensing & Bank Partnerships), processors and underwriters all work inside it, and investors certify their delivery from it.

The parties the system must model at application:

- **Applicants:** a primary applicant and any co-applicants or co-borrowers, each with their own identity, income, debts, consent and credit pull. A joint application is several people, not one record with two names.
- **Guarantors and non-borrowing parties:** a guarantor signs but doesn't own; a non-borrowing spouse on a mortgage may have to sign the security instrument under state law.
- **Third parties:** a broker or dealer who took the application, a correspondent who will close in its own name, a loan officer who is paid on the loan. Reg B's notice rules and the Commerce volume's dealer records both depend on knowing which party took the application ([Auto Lending](/books/banking-and-lending/auto-lending#direct-and-indirect-lending) covers the indirect channel).

## The Pipeline

A mortgage moves through a sequence of stages that every LOS names slightly differently; a consumer loan runs the same sequence in milliseconds with most stages automated:

1. **Lead and prequalification.** Contact details, a soft pull, an estimate. No application yet, unless the lender declines on the consumer's data.
2. **Application.** The borrower submits; TRID's sixth item or Reg B's request arrives. Disclosures that are due at application go out (for a mortgage, the Loan Estimate within its deadline).
3. **Processing.** Order the credit report, verifications, appraisal, title and flood certification; collect documents; run automated underwriting for a first look.
4. **Underwriting.** An underwriter (or the decision engine) reviews the file, the AUS findings and the documents, and issues a decision: approved with conditions, suspended for missing information, referred, or declined ([Underwriting & Decision Engines](/books/banking-and-lending/decision-engines)).
5. **Conditional approval to clear to close.** The borrower and processor satisfy each condition; the underwriter signs each one off. When the last is cleared, the file is clear to close.
6. **Closing and funding.** The Closing Disclosure, the signing, the note and security instrument, the wire (Closing, eNotes & MERS).
7. **Post-closing and delivery.** The file is audited, trailing documents (recorded mortgage, final title policy) are collected, and the loan is delivered to the investor or kept, then boarded to servicing ([Loan Servicing](/books/banking-and-lending/loan-servicing), The Secondary Mortgage Market).

The pipeline is also a business report: pull-through (the share of applications that close), cycle time per stage, and fallout by reason. Those are derived from stage transitions, which is why the transitions must be events with timestamps and actors, not a status column that gets overwritten.

## MISMO, the URLA and Mortgage Data

The mortgage industry has a shared data standard, which consumer lending doesn't. **MISMO** (the Mortgage Industry Standards Maintenance Organization, with more than 350 members) publishes a Reference Model, a logical data model of the whole mortgage life (version 3.6, with XML through 3.6.3 and YAML for 3.5 for APIs), plus the SMART Doc standard for eNotes, eVault and remote online notarization standards, and certification programs.

The **Uniform Residential Loan Application (URLA)**, Fannie Mae Form 1003 and Freddie Mac Form 65, is the application itself. The redesigned URLA "became mandatory for all new loans to the GSEs on March 1, 2021," and its data travels as the **Uniform Loan Application Dataset (ULAD)**, a MISMO v3.4 dataset that retired the fixed-format DU 3.2 file the industry used for decades. An LOS that submits to DU or LPA sends the application as MISMO XML, and the AUS returns findings keyed to it.

For the system this means:

- **Store the application as submitted, versioned.** Every AUS run is against a specific version of the application data; when income or a debt changes, the file is resubmitted and a new version exists. Fannie Mae requires that if loan or borrower information changes so that it no longer matches the last DU submission, the lender update and resubmit, and that the final submission match the closed loan.
- **Map the internal model to MISMO at the edge,** not the other way round. MISMO is an exchange format with thousands of elements; the LOS's own model should hold what the lender uses and translate on export.
- **Consumer and small business lending have no equivalent standard.** Each vendor's API is its own schema, which is one reason consumer LOS migrations are hard ([Replacing Systems](/docs/architecture/replacing-systems)).

## Conditions

An approval in mortgage lending is almost never unconditional. The underwriter or the AUS issues **conditions**, each a specific thing that must be true or provided before the next milestone: a more recent pay stub, an explanation of a large deposit, a payoff letter for a debt being paid at closing, a signed gift letter, a satisfactory appraisal. DU's findings list verification messages and approval conditions the lender must satisfy, and DU's Approve/Eligible means the loan is eligible for sale "if all approval conditions have been met."

Conditions are usually grouped by when they must be cleared: before approval, before documents are drawn, before closing, before funding, and after closing (trailing documents). A condition has an owner (borrower, processor, underwriter, title, appraiser), a status (open, received, cleared, waived) and a sign-off by someone with authority to clear it. Waiving one is a credit decision and needs the same authority as making the loan.

Documents expire. Fannie Mae requires that credit documents (credit reports, income and asset documentation) be "no more than four months old on the note date," and a file that slips past that has to be refreshed, which can reopen conditions already cleared. The system should compute each document's expiry from the rule and the expected closing date and warn before the date, not after.

## Documents and Verification Services

The traditional file is paper or PDF: pay stubs, W-2s, tax returns, bank statements, a written verification of employment from the employer. Each document is uploaded, classified, read and checked against what the borrower stated ([File Uploads](/docs/architecture/file-uploads#checking-what-arrived)). Most of that has moved to data services that return verified facts from the source:

| Verification | Sources | What it returns |
| --- | --- | --- |
| **Employment and income (VOE, VOI)** | Equifax's The Work Number (employer-contributed payroll records: "over 5 million employers," more than 863 million employee records); payroll-connected services such as Argyle, Pinwheel and Truv, where the borrower logs in to their payroll provider | Employer, dates, pay rate, year-to-date and historical pay; The Work Number is "FCRA protected" and requires a permissible purpose |
| **Tax transcripts** | IRS Income Verification Express Service (IVES) through an authorized participant, on the borrower's signed Form 4506-C | Tax return information from the IRS, used to confirm self-employment and reported income |
| **Assets (VOA)** | Bank-data reports from aggregators acting as consumer reporting agencies (Plaid's Home Lending Report from Plaid Check is one) | Balances and transaction history for the accounts the borrower connects |
| **Identity** | Identity verification and fraud vendors | Name, date of birth, SSN and address match, document and device checks ([KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#verifying-identity-in-software)) |

Verification changes the investor's risk, not only the lender's workload. Fannie Mae's **DU validation service** is optional: for conventional loans, DU validates income (base, bonus, overtime, commission, self-employment and others), employment and assets from approved vendors' reports. Validated components "may be eligible for representation and warranty enforcement relief," meaning Fannie Mae won't later force the lender to buy the loan back over that component. Validating income or employment from an asset report needs at least 12 months of data, the lender needs the borrower's authorization, and each result is validated, not validated or unable to be validated. Freddie Mac's AIM does the same inside LPA. Several payroll and bank-data vendors advertise approval for both.

What the system has to keep for each verification: the provider, the product, the borrower's authorization and the permissible purpose it relied on, the date, the raw response, what it validated, and which conditions it cleared. A verification bought from a consumer reporting agency is a consumer report: if it contributes to a decline, the adverse action notice must name that agency ([What the FCRA Adds](/books/banking-and-lending/adverse-action#what-the-fcra-adds)). Property Tech's [Income and Identity Verification](/books/property-tech/applications-and-screening#income-and-identity-verification) is the same problem at a landlord.

## Incomplete Applications

An application that stalls is still on Reg B's clock. Within 30 days after receiving an application that is incomplete, the creditor must either decide it (approve or take adverse action) or send a **notice of incompleteness**, in writing, that says what information is needed, gives a reasonable time to provide it, and says the application won't be considered further otherwise (12 CFR 1002.9(c)). If the applicant doesn't respond in time, the creditor has no further obligation; if they do, the creditor decides and notifies under the normal rules. A creditor may deny for incompleteness only if the missing information is actually needed; if it has enough to decide, incompleteness can't be the reason.

This is the most common origination bug I'd look for in a new system: applications abandoned at the document stage that sit in a "pending documents" status forever, with no notice ever sent. The fix is a scheduled job that finds every application past day N without a decision or an incompleteness notice, and either sends one or escalates ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Worked Numbers: One File's Clocks

An illustration of my own. A borrower starts a mortgage application on Monday, March 2. They enter their name and income that day, add the property address, estimated value and loan amount on Wednesday, March 4, and authorize a credit pull with their SSN on Thursday, March 5.

- **TRID application:** March 5, when the sixth item arrived. The Loan Estimate is due within three business days of that date, and no fee other than a credit report fee may be collected before the borrower receives it and indicates intent to proceed.
- **Reg B application:** also no later than March 5 (a request under the lender's procedures). The file isn't complete: the lender's policy needs two years of W-2s and two months of bank statements.
- **Reg B's 30-day clock for an incomplete application:** the lender must decide or send a notice of incompleteness by **April 4**, 30 days after March 5.
- **The borrower uploads the last document on March 20.** The application is complete; the lender now has 30 days, to **April 19**, to notify of action taken.
- **Closing is scheduled for May 15.** Fannie Mae's four-month rule means the March 5 credit report and the March bank statements are still good on the note date; a closing pushed past early July would need fresh ones.

One file, four dates computed from three rules, each stored with the rule version that produced it.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `applications` (for credit, with `received_at`, `completed_at` and a status), `parties`, `party_identities`, `disclosures`, and `credit_decisions`, which the next three chapters extend. This chapter adds the people on an application, the application data as versions, conditions, documents and verifications, and the stage history. Property Tech models the same thing for a lease application; its `application_members` maps to `application_parties` and its `verifications` to `verifications` here.

```sql
ALTER TABLE applications
  ADD COLUMN purpose            TEXT,          -- 'purchase', 'refinance', 'debt_consolidation', ...
  ADD COLUMN stage              TEXT NOT NULL DEFAULT 'application'
    CHECK (stage IN ('prequalification', 'application', 'processing', 'underwriting',
      'conditional_approval', 'clear_to_close', 'closing', 'funded', 'post_closing',
      'withdrawn', 'declined', 'incomplete_closed')),
  ADD COLUMN taken_by_party_id  UUID REFERENCES parties (id),  -- broker, dealer or correspondent
  ADD COLUMN loan_officer_ref   TEXT,          -- NMLS ID where licensed
  ADD COLUMN trid_application_at TIMESTAMPTZ,  -- the sixth item: Loan Estimate clock
  ADD COLUMN hmda_reportable    BOOLEAN,       -- decided by the Reg C definition, not the label
  ADD COLUMN incompleteness_notice_due DATE,   -- computed: received + 30 days, until complete
  ADD COLUMN decision_notice_due DATE;         -- computed: completed + 30 days

CREATE TABLE application_parties (           -- each person or business on the application
  application_id      UUID NOT NULL REFERENCES applications (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  role                TEXT NOT NULL CHECK (role IN ('primary', 'co_applicant', 'guarantor',
                        'non_borrowing_titleholder')),
  consent_disclosure_id UUID REFERENCES disclosures (id),  -- credit pull and E-SIGN consent
  stated_income_monthly BIGINT,               -- as stated; verified values live in verifications
  PRIMARY KEY (application_id, party_id)
);

CREATE TABLE application_data_versions (     -- the application as submitted and resubmitted
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  version             INT NOT NULL,
  format              TEXT NOT NULL,          -- 'internal_v4', 'mismo_3.4_ulad', ...
  payload_ref         TEXT NOT NULL,          -- the frozen document, never edited
  reason              TEXT NOT NULL,          -- 'initial', 'income_changed', 'pre_closing_resubmit'
  created_by          TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, version)
);

CREATE TABLE application_stage_events (      -- append-only: pipeline reports are derived from it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  from_stage          TEXT,
  to_stage            TEXT NOT NULL,
  actor               TEXT NOT NULL,          -- user, 'system', or the integration
  reason              TEXT,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_documents (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  party_id            UUID REFERENCES parties (id),
  kind                TEXT NOT NULL,          -- 'pay_stub', 'w2', 'bank_statement', 'gift_letter', ...
  file_ref            TEXT NOT NULL,          -- object storage key, checksummed
  document_date       DATE,                   -- the date on the document: drives expiry
  expires_on          DATE,                   -- computed from the investor's age rule
  received_at         TIMESTAMPTZ NOT NULL,
  superseded_by       UUID REFERENCES application_documents (id)
);

CREATE TABLE verifications (                 -- facts confirmed from a source
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('employment', 'income', 'assets', 'tax_transcript',
                        'identity', 'residence', 'collateral')),
  provider            TEXT NOT NULL,          -- 'the_work_number', 'irs_ives', 'plaid_check', 'manual', ...
  is_consumer_report  BOOLEAN NOT NULL,       -- names the CRA on any adverse action notice
  authorization_ref   TEXT NOT NULL,          -- the borrower's consent or signed 4506-C
  response_ref        TEXT NOT NULL,          -- raw response, frozen
  verified_value      JSONB,                  -- e.g. {"monthly_income": 712500, "employer": "..."}
  agency_validation   TEXT CHECK (agency_validation IN ('validated', 'not_validated',
                        'unable_to_validate')),   -- DU or LPA result, where used
  as_of               DATE NOT NULL,
  expires_on          DATE,
  obtained_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_conditions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID NOT NULL REFERENCES applications (id),
  credit_decision_id  UUID REFERENCES credit_decisions (id),  -- the approval that imposed it
  source              TEXT NOT NULL,          -- 'underwriter', 'du_findings', 'lpa_feedback', 'investor'
  description         TEXT NOT NULL,
  due_before          TEXT NOT NULL CHECK (due_before IN ('approval', 'docs', 'closing',
                        'funding', 'post_closing')),
  owner_role          TEXT NOT NULL,          -- 'borrower', 'processor', 'title', 'appraiser'
  status              TEXT NOT NULL CHECK (status IN ('open', 'received', 'cleared', 'waived')),
  satisfied_by_document_id UUID REFERENCES application_documents (id),
  satisfied_by_verification_id UUID REFERENCES verifications (id),
  cleared_by          TEXT,                   -- someone with authority to clear or waive
  cleared_at          TIMESTAMPTZ,
  CHECK (status NOT IN ('cleared', 'waived') OR cleared_by IS NOT NULL)
);
```

The regulatory dates are computed when their triggering event lands and stored, not derived at read time: `trid_application_at` by the event that delivered the sixth item, `completed_at` by the underwriting policy's definition of complete for that product, and the two notice due dates from them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). A nightly job reads every open application whose `incompleteness_notice_due` or `decision_notice_due` is near and either sends the notice or pages a human. Every AUS or decision engine run points at the `application_data_versions` row it read, so a decision can be replayed against exactly what it saw ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)). `verifications` stores the source's answer separately from what the borrower stated in `application_parties`, so a mismatch is a query. Conditions are cleared by pointing at evidence, and the check constraint makes an unsigned clearance impossible. Emit `application.stage_changed`, `application.completed` and `condition.cleared` through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); the borrower's status page, the pipeline report and the closing scheduler all subscribe.

## Auditing

Origination files are examined by regulators for fair lending and disclosure timing and by investors for eligibility, and both read the same record ([Audit Trails](/docs/architecture/audit-trails)). Make sure it shows:

- **Each regulatory moment:** when the request arrived, when TRID's sixth item arrived, when the application became complete, and the rule that defined each.
- **The application data as each decision saw it,** version by version, with the reason for each resubmission.
- **Every stage transition,** with actor and time, so cycle times and any stalled file are visible.
- **Every document and verification,** with its date, source, authorization and expiry, and whether it was a consumer report.
- **Every condition,** who imposed it, what cleared it, who signed it off, and any waiver with the waiver's authority.
- **Every notice owed and sent,** incompleteness and decision, against its due date.
- **Who took the application:** the loan officer, broker, dealer or correspondent, for licensing and for Reg B's third-party notice rules.
- **Retention:** Reg B requires the application, the information used to evaluate it and the notices to be kept for 25 months after notice (12 months for most business credit), longer when an investigation or lawsuit is pending; investors and state law usually require longer ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## What This Means for the System You Build

- **Model "application" as several regulatory moments,** each stored with the rule that set it; Reg B, TRID and HMDA disagree on purpose.
- **Treat a prequalification that declines as an application;** design the flow so that either it never evaluates and declines, or it sends the notice.
- **Version the application data and pin every decision to a version,** and resubmit when anything material changes.
- **Make the pipeline an event stream,** and derive status, cycle times and pull-through from it.
- **Make conditions first-class records** with owners, due-before milestones, evidence and a signed clearance.
- **Compute document expiry from the investor's rule** and the expected closing date, and warn before it lapses.
- **Store verified facts apart from stated ones,** with the source, authorization and whether it was a consumer report.
- **Run a job that finds every application nearing day 30** without a decision or incompleteness notice.

## References

**Law and regulation**

- [CFPB: Regulation B § 1002.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/), application and completed application, comment 2(f)-3 on inquiries and prequalification becoming applications, and adverse action
- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), the 30-day notice after a completed application, notices of incompleteness, and when incompleteness may be the reason
- [CFPB: Regulation B § 1002.12, record retention](https://www.consumerfinance.gov/rules-policy/regulations/1002/12/), 25 months for consumer credit, 12 months for business credit, and extension during investigations
- [Cornell LII: 12 CFR 1026.2, definitions (Regulation Z)](https://www.law.cornell.edu/cfr/text/12/1026.2), the six items that make a TRID application
- [CFPB: Regulation Z § 1026.19, certain mortgage and variable-rate transactions](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/), the Loan Estimate's three-business-day deadline and the limit on fees before it
- [CFPB: Regulation C § 1003.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1003/2/), application for HMDA, prequalification not reported, and preapproval programs by substance

**Agency guides**

- [Fannie Mae Selling Guide B3-2-01: General information on DU](https://selling-guide.fanniemae.com/sel/b3-2-01/general-information-du), the four recommendations, the lender's duties, and resubmission when data changes
- [Fannie Mae Selling Guide B3-2-05: Approve/Eligible recommendations](https://selling-guide.fanniemae.com/sel/b3-2-05/approveeligible-recommendations), eligibility for sale if all approval conditions are met
- [Fannie Mae Selling Guide B3-2-02: DU validation service](https://selling-guide.fanniemae.com/sel/b3-2-02/du-validation-service), validated income, employment and assets, representation and warranty relief, the 12-month data minimum and the three results
- [Fannie Mae Selling Guide B1-1-03: Allowable age of credit documents](https://selling-guide.fanniemae.com/sel/b1-1-03/allowable-age-credit-documents-and-federal-income-tax-returns), no more than four months old on the note date
- [Freddie Mac: Loan Product Advisor](https://sf.freddiemac.com/tools-learning/loan-advisor/our-solutions/loan-product-advisor), Accept and Caution feedback and AIM's automated income, asset and employment verification
- [Freddie Mac: Uniform Loan Application Dataset](https://sf.freddiemac.com/tools-learning/uniform-mortgage-data-program/ulad), the redesigned URLA mandatory on March 1, 2021, Form 65 and MISMO v3.4
- [IRS: Income Verification Express Service](https://www.irs.gov/individuals/international-taxpayers/income-verification-express-service), Form 4506-C and authorized IVES participants

**Standards**

- [MISMO](https://www.mismo.org/), membership, the Reference Model versions and formats, SMART Doc and eMortgage standards
- [ICE Mortgage Technology Developer Connect: Moving to the new URLA](https://developer.icemortgagetechnology.com/developer-connect/docs/moving-to-the-new-urla), ULAD as the MISMO v3.4 dataset retiring the DU 3.2 file, and the March 1, 2021 mandatory date

**Filings**

- [nCino: Annual report on Form 10-K for the fiscal year ended January 31, 2026](https://www.sec.gov/Archives/edgar/data/1902733/000190273326000022/ncno-20260131.htm), lines of business, the Salesforce Platform, revenue and asset-based pricing
- [Blend Labs: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1855747/000185574726000016/blnd-20251231.htm), products, per-transaction pricing and application volume
- [MeridianLink: Centerbridge transaction close press release (October 24, 2025)](https://s202.q4cdn.com/757858845/files/doc_news/2025/Oct/24/FINAL-MLNK-Transaction-Close-Press-Release-10222025.pdf), the completed acquisition at $20.00 a share

**Vendor documentation**

- [ICE: Encompass](https://mortgagetech.ice.com/products/encompass), the suite and its "system of record" positioning
- [MeridianLink](https://www.meridianlink.com/), consumer, mortgage, deposit opening and DecisionLender products
- [Equifax: The Work Number](https://theworknumber.com/), employer contributors, record counts and FCRA permissible purpose
- [Argyle](https://argyle.com/), payroll-connected income and employment verification
- [Pinwheel](https://www.pinwheelapi.com/), payroll-connected income and employment verification
- [Truv](https://www.truv.com/), income, employment and asset verification with DU and LPA
- [Plaid: Plaid Check documentation](https://plaid.com/docs/check/), the Home Lending Report as an FCRA asset verification report approved for DU and LPA
