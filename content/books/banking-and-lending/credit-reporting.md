+++
title = "Furnishing Credit Data"
description = "Reporting loans to the bureaus: furnisher duties, the Metro 2 file, the date of first delinquency, disputes through e-OSCAR, medical debt and BNPL status."
category = "Banking & Lending Industry"
order = 2453
part = "Servicing and Collections"
tags = ["banking", "lending", "credit-reporting", "fcra", "metro-2", "disputes", "furnishing"]
+++

Every month most lenders send the nationwide credit bureaus a file describing every account they hold: the balance, the payment status, how late it is, when it first went delinquent, whether it was charged off. Nothing in federal law requires a lender to report. Once it does, the Fair Credit Reporting Act makes it a furnisher, with duties to report accurately, correct what it learns is wrong, mark what is disputed, investigate disputes on a clock and report the date the delinquency began so the item ages off on time. The file is a few hundred bytes per account; its consequences are every later credit decision about that borrower, and furnishing errors are among the oldest findings in CFPB supervision.

This chapter covers the bureaus and the dispute network, the furnisher's legal duties, the Metro 2 format and what it carries, the monthly file as a pipeline, the date of first delinquency and the seven-year clock with worked dates, disputes through e-OSCAR and directly, what examiners find, and the status of medical debt and BNPL reporting as of October 2026. Using bureau data to decide credit (permissible purpose, scores, tri-merge) is [Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores); the products whose whole point is to report (secured cards, credit builder loans, rent reporting) are [Credit Builders & Secured Products](/books/banking-and-lending/credit-builders), and rent reporting as a landlord's product is in [Property Tech](/books/property-tech/resident-financial-products#rent-reporting).

## How the Platforms Do It

As of October 2026, from the CFPB's description of the system, the bureaus' and industry bodies' pages, and lenders' filings:

| Party | Role | What the public record says |
| --- | --- | --- |
| **Equifax, Experian, TransUnion** | Nationwide consumer reporting agencies | About 10,000 furnishers report on over 1.3 billion accounts each month, most in Metro 2 (CFPB, 2012) |
| **Innovis** | A fourth bureau | Co-owner of e-OSCAR with the three nationwide bureaus |
| **CDIA** | Industry association | Maintains Metro 2 and its Credit Reporting Resource Guide, available only to furnishers, processors, vendors and bureaus |
| **e-OSCAR** | The dispute network | A "web-based, Metro2 compliant, automated system" for dispute processing, built by Equifax, Experian, Innovis and TransUnion; 16,000 furnishers connected in 2011 |
| **Upstart** | Lender, own servicing platform | Its platform "manages all communication with borrowers, credit reporting agencies, and when necessary, collections agencies" |
| **Affirm** | BNPL and installment lender | Reports all its payment plans to Experian from April 1, 2025, and all pay-over-time loans, including Pay in 4, to TransUnion for loans from May 1, 2025 (as reported by PYMNTS) |

The structure is the point. **One format, three or four recipients.** A furnisher builds one Metro 2 file and sends it to each bureau it reports to; each bureau matches the records to its own files, so an identity error in the file becomes a mixed file at one bureau and not another. **Disputes come back through a shared network.** A consumer disputes with any bureau; the bureau forwards it to the furnisher through e-OSCAR; the furnisher's answer updates every bureau's copy. **Reporting is optional but not partial.** A lender may choose not to report, or report to one bureau, but what it reports must be complete and accurate for every account it includes.

## The Furnisher's Duties

The FCRA's furnisher section, 15 U.S.C. 1681s-2, and Regulation V (12 CFR 1022.40 to 1022.43) set the duties:

- **Don't report what you know is wrong.** A furnisher may not report information it knows or has reasonable cause to believe is inaccurate, and must stop reporting information a consumer shows is inaccurate (1681s-2(a)(1)).
- **Correct and update.** A furnisher that regularly reports and learns that what it reported is incomplete or inaccurate must promptly correct it with each bureau (1681s-2(a)(2)).
- **Mark disputes.** Information the consumer disputes with the furnisher may not be reported without notice that it is disputed (1681s-2(a)(3)).
- **Report the date of delinquency.** When an account is placed for collection or charged off, the furnisher reports, within 90 days, the month and year of the commencement of the delinquency that immediately preceded that action (1681s-2(a)(5)), the date the seven-year clock runs from.
- **Tell the consumer about negative information.** A financial institution that reports negative information gives the consumer written notice before, or within 30 days after, the first negative report (1681s-2(a)(7)).
- **Investigate disputes.** Disputes forwarded by a bureau must be investigated, the information the bureau sent reviewed, and the result reported back before the bureau's deadline (1681s-2(b)); disputes sent directly to the furnisher have their own procedure (1681s-2(a)(8), 1022.43).
- **Written accuracy and integrity policies.** A furnisher must establish and implement reasonable written policies and procedures on the accuracy and integrity of what it reports, appropriate to its size and the nature of its business, consider the guidelines in Appendix E to Regulation V, and review them periodically (1022.42).

## Metro 2

Metro 2 is the CDIA's format for consumer tradeline reporting, introduced in 1997 to replace the original Metro. The field-level specification is licensed to furnishers and vendors, but the CFPB's 2012 white paper describes its structure publicly:

- **A header record** identifying the furnisher, and **a trailer record** with the totals of all base and supplementary segments in the file.
- **A base segment** per account: the primary borrower's identification (name, generation code, address, phone, SSN, date of birth) and the account (account type such as revolving, installment or mortgage, credit limit, highest credit or original amount, terms and payment frequency, account status, the stage of delinquency, the **date of first delinquency**, the date closed and how it closed), plus **up to 24 months of payment history**.
- **Supplementary segments** when relevant: associated consumers (co-borrowers, authorized users, guarantors, with their relationship to the account), the original creditor's name (which follows a debt to a collector), accounts sold to or purchased from another company, the Fannie Mae or Freddie Mac loan number, specialized payment information (deferred or balloon payments), new account numbers, and employment.
- **Account status** carries the account's current or final disposition: current, 30-59 through 180 or more days past due, or closed with a zero balance, by voluntary surrender, repossession, charge-off or foreclosure.

What a bureau builds from those records, and what a lender reads back, is in [The Bureaus and What a File Holds](/books/banking-and-lending/credit-data-and-scores#the-bureaus-and-what-a-file-holds). Two things Metro 2 does not do, per the same paper: it carries no interest rate, and it holds no history beyond what the base segment's 24 months encode, so each month's file restates the account rather than appending to it. The specific status, compliance condition and special comment codes are in the licensed guide, and a furnishing system implements them from it. <!-- source-gap: metro2-field-codes | missing | Metro 2 field-level codes (account status, payment rating, compliance condition, special comment, consumer information indicator) | closes with: a public CDIA or CFPB document listing the codes | checked: 2026-10-29 -->

## The Monthly File

Furnishing is a monthly batch: snapshot every reportable account as of a cutoff, map it to Metro 2, send it, and process what comes back. The steps and where they go wrong:

1. **Snapshot.** Take each account's state as of the reporting date from the ledger (balance, amount past due, days past due computed from the oldest unpaid installment, status), not from a status field someone edits. The snapshot is stored, because the file you sent is evidence later.
2. **Apply the profile and the suppressions.** The product's reporting profile decides which bureaus and how the account is described ([Credit Builders & Secured Products](/books/banking-and-lending/credit-builders#how-to-build-it) defines it); suppressions decide what not to say this month (a Regulation X notice of error's 60-day freeze, a deceased borrower, a state rule, a dispute that requires a compliance flag rather than silence).
3. **Map and validate.** Build header, base and supplementary segments, compute the trailer's totals, and validate against the format's edits before sending; a bureau rejects records or whole files that fail its checks.
4. **Send and reconcile.** Each bureau acknowledges, rejects or warns; rejects are worked and resent, and the run reconciles accounts expected, accounts sent and accounts accepted per bureau.
5. **Report the life events.** Charge-off, repossession, foreclosure, bankruptcy, settlement, sale to another company and payoff each change the status and its codes, and the first negative report triggers the 1681s-2(a)(7) notice.

The CFPB's description adds a practical floor: bureaus generally require a prospective furnisher to report a minimum of 100 to 200 active accounts a month and may require test files before a bureau accepts production data. A lender launching on a servicing platform inherits the platform's Metro 2 mapping, and owns its accuracy anyway.

## Worked Numbers: The Date of First Delinquency

The seven-year limit on reporting collection and charged-off accounts runs from "the expiration of the 180-day period beginning on the date of the commencement of the delinquency" (15 U.S.C. 1681c(a)(4), (c)(1)). My example, with dates:

| Event | Date |
| --- | --- |
| Payment due and missed; never brought current | March 1, 2026 |
| Reported 30, 60, 90, 120 days past due on successive monthly files | April through July 2026 |
| Charged off (120 days past due on a closed-end loan) | July 2026 |
| Date of first delinquency reported (month and year) | March 2026 |
| 180 days after the commencement of the delinquency | August 28, 2026 |
| Item must stop appearing on consumer reports | August 2033 |

- **The date doesn't move.** Selling the account to a debt buyer, placing it with an agency, a partial payment or a later re-default don't reset it; the buyer reports the original date, which is why the base segment carries it and the sold-to segment links the two tradelines.
- **A cure does reset it.** If the borrower had brought the account fully current in May and then missed again in September, the delinquency that preceded the charge-off would commence in September.
- **The common error is the wrong event.** The CFPB found an auto furnisher reporting "the date of repossession of the collateral vehicle, rather than the date of first delinquency," which keeps a negative item on file longer than the law allows.

Bankruptcies stay ten years (1681c(a)(1)), and the limits don't apply to reports for credit or life insurance of $150,000 or more or for jobs paying $75,000 or more a year (1681c(b)).

## Disputes

A consumer can dispute a tradeline with a bureau (an indirect dispute) or with the furnisher (a direct dispute), and each starts a clock:

- **Through a bureau.** The bureau has 30 days to complete a reasonable reinvestigation, free, extendable by up to 15 days if the consumer sends relevant information during the 30; it must notify the furnisher within five business days of receiving the dispute; and it deletes information that can't be verified (15 U.S.C. 1681i). The notice to the furnisher travels through e-OSCAR as an **Automated Consumer Dispute Verification (ACDV)**, carrying one or two of 29 dispute reason codes and up to 255 characters of the consumer's text. The furnisher answers with one of four responses: verify as reported, modify, delete, or delete due to fraud. In a 120-day period in 2012, the CDIA reported 22% of responses verified, 61% modified, 13% deleted and 0.5% deleted for fraud; bureaus deleted or modified 4% because the furnisher didn't answer in time.
- **Directly to the furnisher.** A consumer may dispute in writing at the address the furnisher specified, an address on the consumer report, or failing those any business address (1022.43(c)); the furnisher completes its investigation within the same period a bureau would have (1022.43(e)(3)), and if it finds the dispute frivolous or irrelevant, it tells the consumer within five business days of deciding that, with the reasons (1022.43(f)).
- **Mortgage servicers have a third channel.** A Regulation X notice of error about a payment bars adverse reporting about that payment for 60 days ([Errors and Information Requests](/books/banking-and-lending/mortgage-servicing#errors-and-information-requests)).

The weakness the CFPB's 2012 paper named, and its supervision kept finding, is that an ACDV is a code and a sentence: the bureaus "generally do not pass these documents along to furnishers." My rule: treat every ACDV as a request to re-examine the account from the ledger, not to compare the disputed field with the last file, and record the evidence looked at; "verified" is a finding about the account, not about the file.

## What Examiners Find

The CFPB's 2019 special edition of Supervisory Highlights on consumer reporting is a checklist of what furnishing systems get wrong: written policies too general to follow, across mortgage, auto, collection and deposit furnishers; coding errors that produced thousands of inaccurate derogatory statuses, with no root-cause analysis of disputes; direct-dispute addresses not disclosed clearly; accounts not updated after a bankruptcy discharge or a payoff; the repossession date reported as the date of first delinquency; dispute deadlines missed because of a backlog; and disputes from credit repair organizations discarded as frivolous without the required notices. Each is a design requirement in reverse: statuses computed from the ledger, life events that update the tradeline in the same transaction, a disputes queue measured against its clock, and dispute outcomes analyzed for the code path that caused them.

## Medical Debt

The CFPB finalized a rule on January 14, 2025 (90 FR 3276) to remove the Regulation V exception that let creditors use medical debt information and to bar bureaus from furnishing it to creditors. On July 11, 2025 the U.S. District Court for the Eastern District of Texas vacated it in *Cornerstone Credit Union League v. CFPB*, No. 4:25-cv-00016, on the joint request of the CFPB and the industry plaintiffs, holding that the FCRA expressly allows creditors to obtain and use properly coded medical debt information; the case is listed as resolved. What remains is the bureaus' voluntary policy, in place since 2022 and 2023: paid medical collections removed, unpaid ones not reported for a year, and medical collections with an initial balance under $500 not reported, which the CDIA said removed roughly 70% of medical collection tradelines. Many states have their own bans, and the court's opinion said state bans on reporting coded medical debt would be preempted by the FCRA, which is contested ground. As of October 2026 I found no replacement federal rule. <!-- source-gap: medical-debt-federal-2026 | status | no federal medical debt reporting rule after the 2025 vacatur | closes with: a CFPB statement or rulemaking notice in 2026 on medical debt reporting | checked: 2026-10-29 --> The practice side, with the state laws, is in Health Tech's [Medical Debt and Credit Reporting](/books/health-tech/patient-financial-experience#medical-debt-and-credit-reporting). For a lender, the consequence is narrow: a medical account placed for collection should carry its medical coding, and a furnisher of medical accounts needs the borrower's state and a dated rule set before reporting.

## BNPL Reporting

BNPL loans were invisible to bureaus for years, then reported unevenly. Equifax set up the first formal process, with pay-in-4 reporting from February 28, 2022, and said BNPL tradelines would be "suppressed from the calculation of existing models such as FICO and VantageScore." Affirm began reporting all payment plans to Experian in April 2025 and all pay-over-time loans to TransUnion from May 2025, where, as reported, consumers can see the data but lenders can't and traditional scores don't use it. FICO announced BNPL-inclusive versions of FICO Score 10 and 10 T on June 23, 2025, to be offered alongside existing versions. Whether those scores were in production use by lenders as of October 2026 I could not confirm from a primary source. <!-- source-gap: fico-bnpl-scores-2026 | status | FICO Score 10 BNPL availability and lender adoption | closes with: a FICO announcement or filing stating general availability | checked: 2026-10-29 --> For a BNPL furnisher the design questions are which account type a pay-in-4 plan reports as, whether each plan is its own tradeline (most are), and how a refund that cancels a plan updates it; the credit product and its law are in [Buy Now, Pay Later](/books/banking-and-lending/buy-now-pay-later), and the UK's separate account type for regulated BNPL is in [The UK: Deferred Payment Credit](/books/banking-and-lending/buy-now-pay-later#the-uk-deferred-payment-credit).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). Furnishing reads `accounts`, `loans`, `account_parties`, `schedule_installments` and `payment_allocations`, and disputes are `cases` of kind `'credit_report_dispute'` with deadlines in `case_deadlines` ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it)). The `reporting_profile` on `secured_credit_terms` from [Credit Builders & Secured Products](/books/banking-and-lending/credit-builders#how-to-build-it) generalizes to every reportable product; this chapter puts it on the product version and adds the runs, the snapshots, suppressions and dispute detail.

```sql
CREATE TABLE reporting_profiles (            -- versioned with the product
  product_id           UUID NOT NULL REFERENCES products (id),
  bureaus              TEXT[] NOT NULL,        -- {'equifax','experian','transunion','innovis'}
  account_type         TEXT NOT NULL,          -- the Metro 2 account type, from the licensed guide
  reported_limit       TEXT NOT NULL CHECK (reported_limit IN ('credit_limit', 'original_amount',
                         'deposit', 'none')),
  late_threshold_days  SMALLINT NOT NULL DEFAULT 30,
  first_reported_month DATE,                   -- when reporting started for this product
  profile              JSONB NOT NULL,          -- remaining mapping rules
  PRIMARY KEY (product_id)
);

CREATE TABLE furnishing_runs (               -- one file to one bureau for one month
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id       UUID NOT NULL REFERENCES institutions (id),
  bureau               TEXT NOT NULL,
  as_of_date           DATE NOT NULL,
  file_ref             TEXT NOT NULL,          -- object storage key of the file as sent
  accounts_expected    INT NOT NULL,
  accounts_sent        INT NOT NULL,
  accounts_accepted    INT,
  trailer_totals       JSONB NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('built', 'sent', 'acknowledged',
                         'partially_rejected', 'rejected', 'reconciled')),
  sent_at              TIMESTAMPTZ,
  UNIQUE (institution_id, bureau, as_of_date)
);

CREATE TABLE tradeline_snapshots (           -- what was said about one account, per run
  run_id               UUID NOT NULL REFERENCES furnishing_runs (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  account_status       TEXT NOT NULL,          -- the code sent
  current_balance      BIGINT NOT NULL,
  amount_past_due      BIGINT NOT NULL,
  days_past_due        INT NOT NULL,           -- computed from the oldest unpaid installment
  first_delinquency_on DATE,                   -- month and year reported; null if never delinquent
  payment_history      TEXT NOT NULL,          -- the 24-month profile as sent
  compliance_condition TEXT,                   -- dispute, closed at consumer's request, ...
  special_comment      TEXT,
  consumer_indicator   TEXT,                   -- bankruptcy and similar
  suppressed_fields    TEXT[] NOT NULL DEFAULT '{}',
  bureau_result        TEXT CHECK (bureau_result IN ('accepted', 'rejected', 'warning')),
  PRIMARY KEY (run_id, account_id)
);

CREATE TABLE furnishing_suppressions (       -- what must not be said, and until when
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  reason               TEXT NOT NULL CHECK (reason IN ('reg_x_error_60_days', 'deceased',
                         'state_rule', 'identity_theft', 'legal_hold', 'servicing_transfer')),
  scope                TEXT NOT NULL CHECK (scope IN ('adverse_status', 'whole_tradeline')),
  case_id              UUID REFERENCES cases (id),
  rule_ref             TEXT NOT NULL,
  valid_during         TSTZRANGE NOT NULL
);

CREATE TABLE credit_report_disputes (        -- detail for cases of kind 'credit_report_dispute'
  case_id              UUID PRIMARY KEY REFERENCES cases (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  channel              TEXT NOT NULL CHECK (channel IN ('acdv', 'direct')),
  bureau               TEXT,                   -- for an ACDV
  acdv_ref             TEXT,
  dispute_codes        TEXT[] NOT NULL DEFAULT '{}',   -- one or two of the reason codes
  consumer_text        TEXT,
  documents_ref        TEXT[],                 -- what the consumer sent, for a direct dispute
  evidence_reviewed    JSONB,                  -- ledger records, documents, calls examined
  response             TEXT CHECK (response IN ('verified', 'modified', 'deleted',
                         'deleted_fraud', 'frivolous')),
  corrected_fields     JSONB,
  frivolous_notice_id  UUID REFERENCES disclosures (id),
  root_cause           TEXT,                   -- when modified or deleted: the code path that erred
  responded_at         TIMESTAMPTZ
);
```

How it runs:

1. **The snapshot is the source of the file.** A run computes every reportable account's figures from the ledger as of `as_of_date`, writes `tradeline_snapshots`, and only then renders Metro 2; the file is a projection of the rows, and the rows are what an examiner or a court sees.
2. **Suppressions are read, not remembered.** A Regulation X notice of error, a death notice or a state rule writes a `furnishing_suppressions` row with its period; the run reads open rows and records which fields it withheld.
3. **Disputes get two deadlines.** An ACDV's response is due before the bureau's 30-day reinvestigation ends, so the deadline is the bureau's receipt date plus the period less a safety margin, stored in `case_deadlines`; a direct dispute's deadline and its five-business-day frivolous notice are computed the same way.
4. **Corrections go out immediately and next month.** A modified or deleted response updates the bureaus through e-OSCAR's response at once, and the next monthly file must agree with it, or the error returns; my rule is that every response writes the corrected value into the ledger or the profile it came from.
5. **Root causes are reported.** Disputes resulting in modification or deletion are grouped by `root_cause` every month, and a code path with a cluster is fixed before the next run ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) for who decided what).

## Auditing

Furnishing is examined against the written policies 1022.42 requires, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every file as sent,** per bureau and month, with expected, sent and accepted counts and the rejects worked.
- **Every account's snapshot per run,** with the ledger state it was computed from.
- **The date of first delinquency** for every charged-off or collection account, with the installment it came from.
- **Every suppression,** with its reason, rule and period, and the fields withheld.
- **Every dispute,** its channel, codes, evidence reviewed, response, corrections, deadline and when it was met.
- **The first negative information notice** to each consumer.
- **The policies and procedures,** their review dates and the dispute root-cause analysis behind each change.

## What This Means for the System You Build

- **Compute tradelines from the ledger** as of the reporting date and store the snapshot before rendering the file.
- **Version the reporting profile with the product,** and treat a change as a dated product change.
- **Derive the date of first delinquency** from the oldest unpaid installment that preceded the charge-off or placement, and never reset it on sale or placement.
- **Keep suppressions as dated records** the run reads, including Regulation X's 60-day freeze.
- **Treat every dispute as a re-examination of the account,** with deadlines inside the bureau's clock and the evidence recorded.
- **Feed corrections back to their source,** so next month's file doesn't repeat the error.
- **Analyze disputes for root causes** and fix the code path, not just the tradeline.
- **Keep medical and BNPL rules as dated configuration,** because their status is still moving.

## References

**Law and regulation**

- [Cornell LII: 15 U.S.C. 1681s-2, responsibilities of furnishers](https://www.law.cornell.edu/uscode/text/15/1681s-2), accuracy, correction, disputed notices, the date of delinquency within 90 days, negative information notices, direct disputes and duties after a bureau's notice
- [Cornell LII: 15 U.S.C. 1681i, procedure in case of disputed accuracy](https://www.law.cornell.edu/uscode/text/15/1681i), the 30-day reinvestigation, the 15-day extension, five business days to notify the furnisher and deletion of unverifiable information
- [Cornell LII: 15 U.S.C. 1681c, requirements relating to information contained in consumer reports](https://www.law.cornell.edu/uscode/text/15/1681c), the seven-year limit, the 180-day start, ten years for bankruptcies and the exceptions
- [Cornell LII: 12 CFR 1022.42, reasonable policies and procedures concerning the accuracy and integrity of furnished information](https://www.law.cornell.edu/cfr/text/12/1022.42), written policies, Appendix E and periodic review
- [Cornell LII: 12 CFR 1022.43, direct disputes](https://www.law.cornell.edu/cfr/text/12/1022.43), addresses, the investigation period and frivolous notices within five business days
- [Federal Register: Prohibition on Creditors and Consumer Reporting Agencies Concerning Medical Information (Regulation V), 90 FR 3276](https://www.federalregister.gov/api/v1/documents/2024-30824.json), the January 2025 medical debt rule

**Regulators and research**

- [CFPB: Key Dimensions and Processes in the U.S. Credit Reporting System (December 2012)](https://files.consumerfinance.gov/f/201212_cfpb_credit-reporting-white-paper.pdf), furnisher and tradeline counts, the Metro 2 structure and base segment, e-OSCAR, ACDVs, dispute codes and response shares
- [Federal Register: Supervisory Highlights, Consumer Reporting Special Edition, Issue 20 (December 11, 2019)](https://www.federalregister.gov/documents/full_text/html/2019/12/11/2019-26669.html), furnisher findings on policies, coding, disputes and the date of first delinquency
- [CFPB archive: Medical debt anything already paid or under $500 should no longer be on your credit report](https://www.consumerfinance.gov/archive/blog/medical-debt-anything-already-paid-or-under-500-should-no-longer-be-on-your-credit-report/), the bureaus' 2023 changes
- [CFPB archive: CFPB finalizes rule to remove medical bills from credit reports](https://www.consumerfinance.gov/archive/newsroom/cfpb-finalizes-rule-to-remove-medical-bills-from-credit-reports/), the rule and the vacatur note

**Courts**

- [NCLC: Cornerstone Credit Union League et al. v. CFPB](https://www.nclc.org/resources/cornerstone-credit-union-league-et-al-v-cfpb-et-al/), the case number, the joint vacatur request, the July 11, 2025 vacatur and resolved status
- [Consumer Finance Monitor: Federal judge vacates CFPB medical debt rule (July 15, 2025)](https://www.consumerfinancemonitor.com/2025/07/15/federal-judge-vacates-cfpb-medical-debt-rule/), the court's reasoning on coded medical debt information
- [Brownstein: Federal court vacates CFPB's medical debt rule, finds FCRA preempts state laws](https://www.bhfs.com/insight/federal-court-vacates-cfpbs-medical-debt-rule-finds-fcra-preempts-state-laws/), the preemption statement

**Industry**

- [CDIA: Metro 2 information](https://www.cdiaonline.org/resources/furnishers-of-data-overview/metro2-information/), Metro 2 as the standard and access to the Credit Reporting Resource Guide
- [CDIA: Nationwide credit reporting agencies complete medical debt changes (April 11, 2023)](https://www.cdiaonline.org/?p=26961), paid collections, the one-year wait, the $500 threshold and the 70% figure
- [e-OSCAR](https://www.e-oscar.org/), the dispute system and its owners
- [Equifax: Buy now pay later credit reporting (May 9, 2022)](https://www.equifax.com/newsroom/all-news/-/story/-buy-now-pay-later-credit-reporting/), the first BNPL process and suppression from existing scores

**In practice**

- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), the servicing platform's communication with bureaus
- [PYMNTS: Affirm to report all pay-over-time loans to TransUnion](https://www.pymnts.com/bnpl/2025/affirm-report-all-pay-over-time-loans-transunion/), Experian reporting from April 2025 and TransUnion from May 2025
- [PYMNTS: FICO to launch credit scores that incorporate BNPL data](https://www.pymnts.com/buy-now-pay-later/2025/fico-launch-credit-scores-that-incorporate-bnpl-data/), the June 23, 2025 announcement
