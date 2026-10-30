+++
title = "Credit Data & Scores"
description = "Credit bureaus and specialty agencies, FCRA permissible purpose, tri-merge, FICO and VantageScore, the FHFA score change, and cash-flow and alternative data."
category = "Banking & Lending Industry"
order = 2443
part = "Origination and Underwriting"
tags = ["banking", "lending", "credit-reports", "credit-scores", "fcra", "cash-flow-data"]
+++

US consumer credit runs on a shared memory. Lenders report every month how each borrower is paying, three nationwide credit bureaus assemble those reports into a file per person, score developers turn a file into a number, and every other lender reads that number before it lends. A lender has never met most of its applicants; the bureau file is the evidence it decides on, and the Fair Credit Reporting Act decides when the lender may look, what it must tell the applicant afterwards, and what happens when the file is wrong. Around that core sits a second market that has grown fast since 2019: specialty agencies for small-dollar loans, utilities and telecom, and consumer-permissioned bank data read as cash flow, each also a consumer report when it's used to decide.

This chapter covers the bureaus and what a file holds, specialty agencies, permissible purpose and prescreening, hard and soft inquiries, single-bureau pulls and the mortgage tri-merge, FICO and VantageScore, the FHFA's credit score change and where it stands, people with no score, and cash-flow and alternative data. How a lender reports to the bureaus is Furnishing Credit Data; what the lender does with the score is [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines); what it must disclose after a decline is [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action). Tenant screening reports, which are consumer reports too, are Property Tech's [FCRA: The Screening Report Is a Consumer Report](/books/property-tech/applications-and-screening#fcra-the-screening-report-is-a-consumer-report).

## How the Platforms Do It

As of October 2026, from the agencies' and vendors' public pages:

| Provider | What it is | What a lender gets | FCRA position |
| --- | --- | --- | --- |
| **Equifax, Experian, TransUnion** | The three nationwide consumer reporting agencies | Credit files of tradelines, inquiries, public records and collections; scores; attributes; prescreened lists | Consumer reporting agencies; the CFPB names them as the nationwide companies |
| **FICO** | Score developer | Classic FICO versions sold through the bureaus (mortgage uses FICO 2, 4 and 5); FICO 10T with trended data | Its scores are computed on bureau data |
| **VantageScore** | Score developer | VantageScore 4.0, range 300 to 850, with trended data; claims to score 33 million more people than conventional models | Same |
| **Plaid Check** | Plaid's consumer reporting subsidiary for bank data | Consumer Report from up to 24 months of permissioned bank data, income insights, and LendScore (1 to 99) with "the top five reasons the score is not higher, for use in adverse action notices" | Describes itself as a consumer reporting agency |
| **Experian Cashflow Score** | Score on permissioned bank transactions | A 300 to 850 score predicting 60 days past due in 12 months, alone or beside a traditional score | Sold by a nationwide agency |
| **Nova Credit** | Cash-flow and cross-border credit data | Cash Atlas: over 1,000 attributes and a cash-flow score, with adverse action codes on the attributes | "Operates globally as a consumer reporting agency under the Fair Credit Reporting Act" in the US |
| **NCTUE** | Telecom and utility payment exchange | Payment history on telecom, pay TV and utility accounts, for members | A not-for-profit consumer reporting agency whose data Equifax manages |
| **TransUnion FactorTrust** | Alternative data on short-term and small-dollar loans | Loan performance and scores for underbanked consumers | Part of a nationwide agency since its 2017 acquisition |

Three patterns stand out. **Anyone who assembles data on consumers for lenders to decide with is a consumer reporting agency,** whatever the data: Plaid Check, Nova Credit and NCTUE all say so, which brings permissible purpose, accuracy duties, disputes and adverse action disclosures with them. **Scores are products of score developers sold through bureaus,** and lenders pick a model and version per product, which is why "the credit score" is never one number. **Reason codes are part of the product:** every score in the table returns its key factors or reasons, because a lender can't send an adverse action notice without them.

## The Bureaus and What a File Holds

The CFPB's study of the system put each nationwide agency at more than 200 million files and more than 1.3 billion active tradelines, updated by more than 1.3 billion records a month from about 10,000 furnishers, with the ten largest furnishing about 57% of tradelines and bank cards about 40% of them. A file holds:

- **Identifying information:** names, addresses, SSN, date of birth, employers as reported. There's no single unique key; the agency matches each furnished record to a file, and mismatches are the root of many disputes ([Record Linkage](/docs/architecture/record-linkage)).
- **Tradelines:** one per account a furnisher reports, with the creditor, account type, open date, credit limit or original amount, balance, scheduled payment, payment status by month (current, 30, 60, 90 and more days late), and closure reason (paid, charged off, repossessed). Furnishers send them monthly in the Metro 2 format (Furnishing Credit Data covers the format).
- **Inquiries:** who pulled the file and when.
- **Collections and public records** that the agency's policies still carry.

Trended data is the history behind the balances: not just "owes $4,000 on a $10,000 limit" but the last 24 months of balances and payments, which separates someone who pays in full each month from someone who carries the same balance. FICO 10T and VantageScore 4.0 both use it; the classic models mostly don't.

**Specialty agencies.** The CFPB's list of consumer reporting companies groups dozens of agencies by what they hold: supplementary credit (Innovis), low-income and subprime lending (DataX, FactorTrust), utilities (NCTUE), check and bank screening (Certegy among them), tenant screening, employment. A subprime lender may pull a specialty file instead of, or beside, a nationwide one. Deposit-account screening at account opening is KYC & Account Opening.

## Permissible Purpose

A consumer reporting agency may furnish a report only for a purpose the FCRA allows, and a user must certify its purpose to the agency before it gets any report (15 U.S.C. 1681b(f)). For lending, the purposes that matter are:

- **A credit transaction involving the consumer:** a user that "intends to use the information in connection with a credit transaction involving the consumer," including extending credit and reviewing or collecting an account (1681b(a)(3)(A)). An application is the ordinary case.
- **The consumer's written instructions** (1681b(a)(2)): the basis many prequalification flows use, with the consent captured and stored.
- **Account review:** a legitimate business need to review an account to see whether the consumer still meets its terms (1681b(a)(3)(F)), which covers periodic soft reviews of existing borrowers for line management.
- **Prescreening:** a transaction the consumer didn't initiate, allowed only if it's a **firm offer of credit**, the consumer hasn't opted out, and the list carries only name, address, a non-unique identifier and information that doesn't reveal the consumer's relationship with any particular creditor (1681b(c)). An opt-out made through the agencies' notification system lasts five years from five business days after the request; one made with a signed form lasts until revoked (1681b(e)). Reg B requires keeping each prescreened solicitation's text and selection criteria for 25 months (1002.12(b)(7)).

Permissible purpose is a property of each pull, not of the lender. My rule: no code path calls a bureau without a stored purpose, the application or account it's for, and, for written-instruction pulls, the consent record it rests on. Pulling a co-applicant's report needs that person's own basis; the primary applicant's consent doesn't cover them.

**Hard and soft inquiries.** A hard inquiry is one a consumer initiated to apply for credit, visible to other lenders and counted in scores; a soft inquiry (prequalification on written instructions, account review, prescreening, the consumer's own check) isn't counted. The distinction is the agencies' and score developers' convention, not a statutory one, and the lender chooses it when it orders the report. Rate shopping is protected by deduplication windows: FICO's newer versions treat mortgage, auto and student loan inquiries within 45 days as one (older versions 14 days) and ignore those under 30 days old, while VantageScore counts inquiries within 14 days as one across more credit types. A product that pulls hard for a prequalification costs its applicants points and generates complaints.

## Single Bureau, Tri-Merge and the Representative Score

Consumer lenders mostly pull one bureau per application, chosen by product, region, price or a waterfall when the first has no file (a "no-hit"). Mortgages are different: the GSEs require a **tri-merge** report, a combined report from all three nationwide agencies with a score from each, merged by a credit reporting vendor.

From three scores per borrower, Fannie Mae's rule is: "When three credit scores are obtained, choose the middle score"; when two, "choose the lower score"; for several borrowers, "select the lowest applicable score from the group as the representative credit score for the loan." For certain manually underwritten loans, the average of the borrowers' median scores is used to test the minimum score instead.

**Worked numbers (mine).** Two borrowers on one mortgage, classic FICO from each bureau:

| Borrower | Experian | Equifax | TransUnion | Representative |
| --- | --- | --- | --- | --- |
| A | 742 | 728 | 735 | 735 (middle) |
| B | 681 | 702 | 694 | 694 (middle) |
| **Loan** | | | | **694** (lowest of the two) |

The loan prices on 694, even though borrower A's file is much stronger, and the average median score (714.5) matters only where a manual-underwriting minimum applies. If the vendor returns no score from one bureau for borrower B, the representative is the lower of the remaining two. The engine needs all six scores stored, the rule version that picked the representative, and the bureau each came from, because the adverse action notice must name every agency whose report contributed.

## FICO and VantageScore

Both score a bureau file (FICO gives 300 to 850 for its base scores and 250 to 900 for industry-specific versions; VantageScore 4.0 runs 300 to 850). What a lender chooses when it chooses a score:

- **Model and version.** FICO 8 and 9, the mortgage "classic" versions (FICO 2 on Experian, FICO 4 on TransUnion, FICO 5 on Equifax), FICO 10 and 10T, VantageScore 3.0 and 4.0. Versions differ in what they read (trended data in FICO 10T and VantageScore 4.0, not in the classic versions) and in which files they can score, and each bureau's file differs, so a borrower's score differs by version and by bureau.
- **Industry versions** (auto and bankcard scores) tuned on those products' outcomes.
- **The score's reason codes**, up to four key factors (five where inquiries are one), which the FCRA requires a lender to pass on in an adverse action notice that relies on the score.

Changing score versions is a credit policy change, not a vendor setting. Cutoffs, pricing grids and partner criteria are written against a specific model; a new version shifts the distribution, so every cutoff must be remapped and the change validated before it goes live (Model Risk Management covers validation).

## The FHFA Score Change

For decades every GSE mortgage needed classic FICO from all three bureaus. The FHFA validated FICO 10T and VantageScore 4.0 in October 2022, then delayed implementation in January 2025, and as of October 2026 the sequence is:

| Date | Step |
| --- | --- |
| July 8, 2025 | Interim policy: lenders may deliver VantageScore 4.0 or classic FICO, still on tri-merge reports |
| April 22, 2026 | VantageScore 4.0 in limited rollout; FICO 10T added to the Selling Guides with timing to be announced |
| September 9, 2026 | VantageScore 4.0 available to all approved lenders without prior approval |
| September 30, 2026 | Upfront fees aligned between classic FICO and VantageScore 4.0 |

As of October 2026, FHFA's page says "FICO 10T is not currently eligible for delivery," no retirement date is set for classic FICO, tri-merge is still required (bi-merge, two reports, was validated but not implemented), and the lender chooses one model per loan for all its borrowers. VantageScore's own page says FHFA "required" VantageScore 4.0; FHFA's page says lenders may choose it, and I follow FHFA.

For the system: the score model is a per-loan attribute chosen at pull time and carried to delivery, the pricing engine needs grids for each model, and the investor rules (which models each investor accepts, from which date) are versioned reference data. A lender that sells to several investors may still need classic FICO for some and VantageScore 4.0 for others on the same day.

## No File, Thin File, No Score

Some people have no bureau file ("credit invisible"); others have a file too thin or too stale to score. The CFPB's June 2025 technical correction cut its 2015 estimate of credit invisibles roughly in half, after a data change revealed records the earlier method missed, with an almost matching increase in the count of unscored records. The practical point holds either way: some applicants come back "no hit" or "no score," and the engine needs a path for them, a different bureau, a specialty agency, a cash-flow report, or a manual review, rather than an automatic decline. VantageScore says version 4.0 drops the requirements for recent activity and a file older than six months, which is how it claims to score more people. Credit Builders & Secured Products covers products designed to create a file.

If the engine declines for lack of a score, the notice must say so specifically ("no credit file" or "limited credit experience" are among Reg B's sample reasons), and the FCRA's risk-based pricing rules have a notice for the case where no score is available ([What the FCRA Adds](/books/banking-and-lending/adverse-action#what-the-fcra-adds)).

## Cash-Flow and Alternative Data

**Cash-flow underwriting** reads a borrower's bank account transactions (income deposits, rent, recurring bills, overdrafts and NSF fees, balances over time) instead of, or beside, the bureau file. The public evidence that it works comes mostly from FinRegLab:

- **The 2019 study.** With six nonbank lenders (Accion, Brigit, Kabbage, LendUp, Oportun, Petal), an independent analysis by Charles River Associates found the cash-flow data "predictive of credit risk and loan performance," with results "robust across both consumer and small business populations," including people with no or low traditional scores, and that it "frequently improved the sorting of risk among borrowers posing similar credit risks."
- **The 2025 study** ("Advancing the Credit Ecosystem"), on accounts opened in 2018 and 2019 with one nationwide bureau's data and one aggregator's, found the model combining bureau and cash-flow data "most predictive overall and across all subgroups," with the highest approval rates at most risk thresholds; a machine-learning model on bureau data alone generally came second.
- **Small business.** FinRegLab's 2025 and 2026 reports extend the work to financially constrained businesses, where processing and bank data are already the norm (Embedded Lending covers processor-data offers).

How the data reaches the lender, as of October 2026:

- **Through a consumer reporting agency.** Plaid Check, Nova Credit and Experian sell permissioned bank-data reports, attributes and scores as consumer reports, with reason codes. The consumer connects their accounts and authorizes the report; the lender orders it under a permissible purpose; the agency handles disputes. FICO and Plaid announced a cash-flow UltraFICO in November 2025 to be distributed through Plaid Check (reported in trade press; FICO's own page says only that it "is coming").
- **Directly from an aggregator** to a lender that analyzes the data itself. The lender then holds raw transactions and computes its own attributes, which makes the lender's model, not an agency, the source of every reason it gives.
- **Under the open banking rule.** Section 1033 would give consumers a right to share their data with a lender through the bank's interface; its status as of October 2026 is Open Banking in the US's subject.

What to get right with bank data: **consent is per account and per purpose, and it ends** (the consumer can disconnect), so a report is a dated snapshot and a later refresh needs a basis. **Transaction categorization is the model's first layer,** and a miscategorized payroll deposit or rent payment is an inaccuracy the consumer can dispute. **Income from bank data is evidence for ability to repay,** and the GSE validation programs accept it with at least 12 months of history ([Documents and Verification Services](/books/banking-and-lending/loan-origination#documents-and-verification-services)).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `parties` and `party_identities` (the identifiers a bureau matches on), `applications` and `application_parties` from [Loan Origination](/books/banking-and-lending/loan-origination#how-to-build-it), and `credit_decisions`, whose `inputs_ref` freezes everything the decision read. This chapter adds the pulls, the scores, the bank-data reports and the prescreen campaigns. Property Tech's `screening_reports` is the same record as `credit_report_pulls` for a landlord.

```sql
CREATE TABLE credit_report_pulls (           -- one request to one agency for one person
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  application_id      UUID REFERENCES applications (id),
  account_id          UUID REFERENCES accounts (id),        -- account review
  agency              TEXT NOT NULL,          -- 'equifax', 'experian', 'transunion', 'plaid_check', ...
  reseller            TEXT,                   -- the merge vendor, for a tri-merge
  product             TEXT NOT NULL,          -- 'full_file', 'tri_merge', 'cash_flow_report', ...
  inquiry_type        TEXT NOT NULL CHECK (inquiry_type IN ('hard', 'soft')),
  permissible_purpose TEXT NOT NULL CHECK (permissible_purpose IN ('credit_application',
                        'written_instructions', 'account_review', 'collection', 'prescreen')),
  consent_disclosure_id UUID REFERENCES disclosures (id),     -- required for written_instructions
  result              TEXT NOT NULL CHECK (result IN ('hit', 'no_hit', 'frozen', 'error')),
  report_ref          TEXT,                   -- the report as received, encrypted, never edited
  pulled_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_on          DATE,                   -- the investor's or policy's age limit
  CHECK (application_id IS NOT NULL OR account_id IS NOT NULL OR permissible_purpose = 'prescreen'),
  CHECK (permissible_purpose <> 'written_instructions' OR consent_disclosure_id IS NOT NULL)
);

CREATE TABLE credit_scores (                 -- every score returned, kept even when unused
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pull_id             UUID NOT NULL REFERENCES credit_report_pulls (id),
  model               TEXT NOT NULL,          -- 'fico_classic_5', 'fico_10t', 'vantagescore_4', 'lendscore'
  score               SMALLINT,               -- NULL when the model couldn't score the file
  range_low           SMALLINT NOT NULL,
  range_high          SMALLINT NOT NULL,
  key_factors         TEXT[] NOT NULL DEFAULT '{}',  -- the developer's codes, in order
  inquiries_factor    BOOLEAN NOT NULL DEFAULT false, -- disclosed beyond the four-factor limit
  score_date          DATE NOT NULL,
  provider            TEXT NOT NULL           -- who created the score, as the FCRA disclosure names it
);

CREATE TABLE representative_scores (         -- which score decided, and by which rule
  credit_decision_id  UUID NOT NULL REFERENCES credit_decisions (id),
  party_id            UUID REFERENCES parties (id),          -- NULL for the loan-level score
  score_id            UUID REFERENCES credit_scores (id),
  value               SMALLINT,
  rule_ref            TEXT NOT NULL,          -- 'gse_middle_of_three_lowest_borrower_v2026', ...
  PRIMARY KEY (credit_decision_id, party_id)
);

CREATE TABLE bank_data_connections (         -- consumer-permissioned accounts, with their lifespan
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  provider            TEXT NOT NULL,          -- the agency or aggregator
  institution_name    TEXT NOT NULL,
  account_mask        TEXT NOT NULL,
  consent_disclosure_id UUID NOT NULL REFERENCES disclosures (id),
  purpose             TEXT NOT NULL,          -- 'underwriting', 'verification', 'servicing'
  connected_at        TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ
);

CREATE TABLE prescreen_campaigns (           -- firm offers: Reg B keeps text and criteria 25 months
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  product_id          UUID NOT NULL REFERENCES products (id),
  agency              TEXT NOT NULL,
  selection_criteria_ref TEXT NOT NULL,       -- the criteria sent to the agency, frozen
  offer_text_ref      TEXT NOT NULL,          -- the solicitation as mailed or shown
  firm_offer_terms    JSONB NOT NULL,         -- what the lender must honor if the criteria still hold
  list_received_at    TIMESTAMPTZ NOT NULL,
  offers_sent_at      TIMESTAMPTZ,
  retain_until        DATE NOT NULL           -- 25 months after the offer, longer on legal hold
);
```

Every bureau call goes through one client that refuses to send a request without a `permissible_purpose`, and the check constraints make a written-instructions pull without its consent unrepresentable ([Licensed Data](/docs/architecture/record-linkage#licensed-data)). Reports are stored as received, encrypted and access-logged, because they hold SSNs and full credit histories ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); the decision engine reads parsed attributes, and `credit_decisions.inputs_ref` freezes the attributes and score IDs it used. `credit_scores` keeps every score returned, including the ones the representative-score rule discarded, because the adverse action notice and the mortgage score disclosure may need them. `bank_data_connections.revoked_at` stops refreshes and is checked before any servicing use; a revoked connection's past reports stay as evidence for the decisions they informed. Prescreened applicants who respond are matched back to their campaign so the firm offer is honored on its terms, unless the lender's stated post-screening criteria aren't met.

## Auditing

Credit data is the most sensitive data a lender holds, and the FCRA and Reg B both govern its records ([Audit Trails](/docs/architecture/audit-trails)). Make sure the record shows:

- **Every pull,** with the person, agency, product, inquiry type, permissible purpose, the application or account it served, and the consent where the purpose needed one.
- **Every report as received** and who opened it, when.
- **Every score returned,** with model, version, range, date, provider and key factors, and which rule chose the representative score.
- **Every bank-data connection,** its consent, purpose and revocation.
- **Every prescreen campaign's** criteria and solicitation text, kept for 25 months after the offer.
- **The model each loan's score came from,** carried to investor delivery.
- **Pulls without an application or account** (other than prescreens): there should be none, and a query proving it.

## What This Means for the System You Build

- **Put permissible purpose on every pull** and refuse calls without one; store the consent for written-instruction pulls.
- **Choose hard or soft deliberately** per flow, and never pull hard for a prequalification.
- **Store every score from every bureau,** with model, version and key factors, and record the rule that picked the representative score.
- **Treat a score version change as a credit policy change:** remap cutoffs and grids, validate, then switch.
- **Make the score model a per-loan attribute** and investor acceptance a versioned rule, as the FHFA change plays out.
- **Give no-hit and no-score applicants a path** other than an automatic decline.
- **Treat cash-flow data as a consumer report** when an agency provides it, with consent that expires and refreshes that need a basis.
- **Keep reports encrypted and access-logged,** and keep prescreen criteria and text for 25 months.

## References

**Law and regulation**

- [Cornell LII: 15 U.S.C. § 1681b, permissible purposes of consumer reports](https://www.law.cornell.edu/uscode/text/15/1681b), credit transactions, written instructions, account review, prescreened firm offers, the limits on prescreened list contents, opt-out durations and user certification
- [Cornell LII: 15 U.S.C. § 1681g, disclosures to consumers](https://www.law.cornell.edu/uscode/text/15/1681g), the four key factors and the inquiries exception
- [CFPB: Regulation B § 1002.12, record retention](https://www.consumerfinance.gov/rules-policy/regulations/1002/12/), prescreened solicitation text and criteria kept 25 months

**Regulators and agencies**

- [CFPB: List of consumer reporting companies](https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/), the nationwide agencies and the specialty categories, current as of January 2025
- [CFPB: Key dimensions and processes in the U.S. credit reporting system (December 2012)](https://files.consumerfinance.gov/f/201212_cfpb_credit-reporting-white-paper.pdf), files, tradelines, monthly updates, furnisher counts and concentration
- [CFPB: Technical correction and update to the CFPB's credit invisibles estimate (June 23, 2025)](https://www.consumerfinance.gov/data-research/research-reports/technical-correction-and-update-to-the-cfpbs-credit-invisibles-estimate/), the estimate roughly cut in half and the matching rise in unscored records
- [FHFA: Credit scores](https://www.fhfa.gov/policy/credit-scores), the validation, delay, interim policy and 2026 steps, FICO 10T not yet eligible for delivery, tri-merge unchanged and one model per loan
- [Fannie Mae Selling Guide B3-5.1-02: Determining the credit score for a mortgage loan](https://selling-guide.fanniemae.com/sel/b3-5.1-02/determining-credit-score-mortgage-loan), middle of three, lower of two, lowest borrower, and the average median score for manual underwriting

**Research**

- [FinRegLab: The use of cash-flow data in underwriting credit](https://finreglab.org/research/credit-scoring/the-use-of-cash-flow-data-in-underwriting-credit/), the 2019 study's participants and design
- [Charles River Associates: Use of cash flow data in automated credit underwriting (July 25, 2019)](https://www.crai.com/insights-events/publications/use-cash-flow-data-automated-credit-underwriting/), the predictiveness findings quoted
- [FinRegLab: Advancing the credit ecosystem, machine learning and cash flow data in consumer underwriting (2025)](https://finreglab.org/research/advancing-the-credit-ecosystem-machine-learning-cash-flow-data-in-consumer-underwriting/), combined bureau and cash-flow models most predictive across subgroups
- [FinRegLab: Research](https://finreglab.org/research/), the 2025 and 2026 small business cash-flow reports

**Vendor documentation**

- [myFICO: FICO Score versions](https://www.myfico.com/credit-education/credit-scores/fico-score-versions), mortgage versions by bureau, FICO 10T's trended data and score ranges
- [myFICO: Rate shopping](https://myfico.com/credit-education/blog/rate-shop), the 45-day and 14-day deduplication windows and the 30-day buffer
- [VantageScore: The complete guide to your VantageScore](https://www.vantagescore.com/the-complete-guide-to-your-vantagescore/), range, the 14-day inquiry window and trended utilization
- [VantageScore: VantageScore 4.0 allowed on all Fannie Mae and Freddie Mac mortgages (July 8, 2025)](https://vantagescore.com/resources/knowledge-center/press_releases/vantagescore-4-0-allowed-for-use-on-all-fannie-mae-and-freddie-mac-mortgages-effective-immediately), the 33 million claim and the dropped activity and file-age requirements
- [VantageScore: Mortgage](https://vantagescore.com/what-we-do/mortgage), the claim that FHFA "required" VantageScore 4.0
- [Plaid: Plaid Check for underwriting](https://plaid.com/check/underwriting/), Plaid Check as a consumer reporting agency
- [Plaid: Plaid Check documentation](https://plaid.com/docs/check/), Consumer Report, 24 months of data, income insights and LendScore's five reasons for adverse action
- [Experian: Cashflow Score](https://www.experian.com/business/products/cashflow-score), the bank-data score, its range and what it predicts
- [Nova Credit](https://www.novacredit.com/), Nova Credit as a consumer reporting agency and lenders sending adverse action notices
- [Nova Credit: Cash Atlas](https://www.novacredit.com/cash-atlas), attributes, the cash-flow score and adverse action codes
- [NCTUE: Consumers](https://www.nctue.com/consumers), a not-for-profit consumer reporting agency with data managed by Equifax
- [TransUnion: Acquisition of FactorTrust (November 14, 2017)](https://newsroom.transunion.com/transunion-expands-credit-access-to-more-americans--with-acquisition-of-factortrust/), alternative data on short-term and small-dollar loans

**In practice**

- [Open Banking Expo: FICO teams up with Plaid to launch next-generation cash flow score (November 21, 2025)](https://www.openbankingexpo.com/news/fico-teams-up-with-plaid-to-launch-next-generation-cash-flow-score/), the UltraFICO cash-flow score distributed through Plaid Check
