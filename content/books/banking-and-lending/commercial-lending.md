+++
title = "Commercial Lending"
description = "C&I and commercial real estate loans: spreading, covenants and their monitoring, borrowing bases, participations and syndication, risk ratings and loan review."
category = "Banking & Lending Industry"
order = 2441
part = "Business Lending"
tags = ["banking", "lending", "commercial-lending", "cre", "covenants", "syndication"]
+++

Commercial lending is the largest part of a bank's loan book and the place where a loan stops being a product and becomes a relationship. A consumer loan is decided by a model in seconds and serviced by a schedule; a commercial loan is negotiated, documented in a long credit agreement, monitored every month or quarter against promises the borrower made (covenants), secured by collateral whose value moves, sometimes shared with other banks, and rated by the bank's own credit officers on a scale examiners will test. US commercial banks held about $3.0 trillion of commercial and industrial loans and $3.2 trillion of commercial real estate loans in October 2026, together more than two-fifths of all bank loans. The engineering is less about throughput and more about memory: what the borrower promised, what it reported, what the bank checked, what it waived, and who else owns a piece.

This chapter covers commercial and industrial (C&I) and commercial real estate (CRE) lending, underwriting from spread financial statements, covenants and how they're monitored, borrowing bases and asset-based lending, participations, syndication and the legal lending limit, risk ratings and credit review, and the commercial loan origination systems built around all of it. Smaller, more standardized business credit is [Small Business Lending](/books/banking-and-lending/small-business-lending); how the allowance for these loans is set is Credit Losses & CECL.

## How the Platforms Do It

Commercial lending runs on a loan origination and credit administration system sitting beside the core, which books and services the loan. As of October 2026, from vendors' filings and product pages:

| Vendor | System | What it covers | A figure or detail that shows the model |
| --- | --- | --- | --- |
| **nCino** | Commercial, small business, consumer and mortgage origination on one platform | Automated spreading of financial statements across entities, covenant notifications that also serve as the compliance record, a document repository with an audit trail | Over 2,700 customers, about 1,500 of them depository institutions; $594.8 million of fiscal 2026 revenue; built on Salesforce and AWS; moved from seat-based to pricing tied to the assets of the lines of business it supports |
| **Moody's** (Lending Suite) | Commercial origination and credit analysis | Automated spreading, scoring and decisioning, AI-drafted credit memos, origination connected to monitoring | Generative-AI credit memo drafting from borrower, deal and Moody's data, reviewed by the analyst |
| **Abrigo** (Sageworks) | Commercial lending, credit analysis and loan administration | Spreading, global cash flow and ratio analysis, tickler and covenant tracking with compliance reports for management and examiners, exception tracking | Ticklers advanced and cleared automatically as documents arrive through a client portal |

Three things stand out. **Spreading is the shared core:** every vendor leads with turning a borrower's financial statements and tax returns into a standard set of figures, because every ratio, covenant test and risk rating after that reads from the spread. **Covenant tracking is a compliance record, not a reminder:** nCino and Abrigo both describe covenant monitoring as evidence for auditors and examiners, which is the right frame. **The LOS is not the system of record for money:** origination and credit administration live in one system, balances and payments in the core or a commercial servicing platform, and the two have to agree on the facility, its tranches and its collateral every day ([Core Banking Systems](/books/banking-and-lending/core-banking-systems) covers the surrounding systems).

## C&I and Commercial Real Estate

Two families, distinguished by what repays the loan:

- **Commercial and industrial (C&I)** loans are repaid by the business's operations: a revolving line for working capital, a term loan for equipment or an acquisition, a letter of credit standing behind an obligation. Collateral is the business's assets (receivables, inventory, equipment) or nothing at all for a strong borrower. The Federal Reserve's H.8 release put C&I loans at all commercial banks at $2,992.6 billion, seasonally adjusted, for the week ending October 14, 2026.
- **Commercial real estate (CRE)** loans are secured by real property. In **owner-occupied** CRE the business occupies the building and its operations repay the loan, so it underwrites like C&I with a mortgage. In **income-producing** (non-owner-occupied) CRE the property's rents repay it: an office building, a multifamily complex, a warehouse leased to tenants. **Construction and land development** loans fund a project before it produces anything, repaid by its sale or by permanent financing. H.8 put CRE loans at $3,158.2 billion: $457.9 billion construction and land development, $644.9 billion multifamily and $1,931.4 billion nonfarm nonresidential.

The interagency real estate lending guidelines set **supervisory loan-to-value limits** that a bank's own limits should not exceed: 65% for raw land, 75% for land development, 80% for commercial, multifamily and other nonresidential construction, and 85% for improved commercial property. Loans above the limits are allowed when other credit factors support them, but must be identified and reported to the board at least quarterly, and in aggregate shouldn't exceed 100% of total capital, with the commercial, agricultural and multifamily portion within 30%.

**Concentration** is the CRE risk regulators watch most. The 2006 interagency guidance, as the OCC's CRE booklet describes it, names two criteria that, when approached or exceeded, may prompt more supervisory analysis: construction, land development and other land loans at 100% or more of total capital; or non-owner-occupied CRE at 300% or more of total capital with the CRE portfolio up 50% or more over the prior 36 months. More generally, the OCC defines a concentration of credit as obligations above 25% of tier 1 capital plus the allowance for credit losses; its revised Concentrations of Credit booklet (OCC Bulletin 2026-49, September 30, 2026) kept that definition. A bank's system has to compute these ratios from loan-level data, by its call report categories, every quarter, which is why each loan carries its regulatory category as data rather than leaving it to a report query.

## Underwriting From the Spread

A commercial credit decision starts with **spreading**: entering the borrower's (and often each guarantor's) balance sheet, income statement and tax returns into a standard template, period by period, so they can be compared across years and across borrowers. From the spread come the ratios:

- **Debt service coverage ratio (DSCR):** for income-producing CRE, net operating income divided by annual debt service. The OCC's booklet notes the right minimum depends on the amortization period and the volatility of the cash flow: lower for long net leases to strong tenants, higher for hotels or owner-occupants with uneven earnings.
- **Debt yield:** NOI divided by the loan amount, a leverage measure independent of interest rate, amortization and capitalization rate.
- **Loan to value (LTV) and loan to cost (LTC),** for real estate and construction.
- **Global cash flow:** the borrower's and guarantors' combined cash flow against all their debt, for closely held businesses where the owner's other entities and personal obligations draw on the same money.
- **Fixed charge coverage ratio (FCCR):** cash flow over fixed charges (debt service, leases, some capital spending), the usual covenant in asset-based lending.

The definitions are the hard part. The OCC's CRE booklet makes the point directly: when loan documents carry debt service coverage covenants, "the definitions of income and expenses should be clearly defined," and the coverage calculated for covenant compliance may differ from the DSCR used for underwriting and risk rating. A spread is the bank's normalized view; a covenant test is the credit agreement's definition applied to the borrower's reported numbers. They are two calculations from the same statements, and the system has to keep both.

## Covenants

A **covenant** is a promise in the credit agreement that holds for the life of the loan, tested on a schedule. The OCC's ABL booklet describes their purpose: they set standards for performance, serve as early indicators of trouble, and provide "default triggers that force restructuring or other remedial actions." Three kinds:

- **Financial covenants:** a ratio or amount tested each period. For income-producing CRE the OCC lists debt yield, DSCR, LTV, LTC and borrower or guarantor minimum net worth or liquidity as the most common; asset-based loans typically carry a minimum FCCR and limits on capital expenditures.
- **Reporting covenants:** deliver annual audited statements within so many days of year end, quarterly statements, tax returns, rent rolls, borrowing base certificates, compliance certificates.
- **Negative and affirmative covenants:** don't take on more debt, don't sell assets, don't pay dividends above a limit; maintain insurance, pay taxes, keep the collateral.

Two design features change how covenants are monitored. A **springing covenant** is tested only when a condition is met, for example cash dominion that applies only when excess availability falls below a threshold; the OCC notes these favor the borrower and can weaken the controls that are an ABL credit's strength. A **cure** right lets the borrower fix a breach (an equity contribution, a paydown) within a period before it becomes a default. And **waivers** are a record: the OCC's booklet says the decision to waive "should be documented and well supported," and that regularly waiving covenants "may impair the lender's ability to enforce the covenants in the future." A covenant waived four quarters running is, in practice, no longer a covenant.

### Worked numbers: a DSCR covenant

An $8,000,000 loan on an office building at 6.50%, amortizing over 25 years with monthly payments, has a payment of $54,016.57 and annual debt service of $648,198.87. The credit agreement requires a DSCR of at least 1.25x, tested annually on trailing NOI as the agreement defines it.

| Year | NOI (agreement definition) | DSCR | Result |
| --- | --- | --- | --- |
| At closing | $1,000,000 | 1.54x | Pass; debt yield 12.5% |
| Year 2 (a tenant leaves) | $850,000 | 1.31x | Pass, with less cushion |
| Breach threshold | $810,248.59 | 1.25x | Below this NOI, the covenant fails |

The figures are my arithmetic on illustrative terms. The system's job is not the division; it's knowing which NOI (the agreement's definition, with its adjustments for management fees and reserves, not the bank's underwriting NOI), which period, which statements it came from, and what happened when it failed: a waiver with its approver and reason, an amendment, a cure, or a downgrade.

## Borrowing Bases and Asset-Based Lending

An **asset-based loan (ABL)** is a revolving line whose availability is set each period by the collateral rather than by a fixed limit: the **borrowing base**, the sum of eligible receivables and inventory times their advance rates, less reserves. The OCC's ABL booklet describes the conventions:

- **Eligible receivables.** An account is normally ineligible when it's past due by three times its terms (90 days on 30-day terms, 21 on 7-day terms). **Cross-aging** makes all of a customer's receivables ineligible when any (or some percentage) of them are. The booklet lists other receivables commonly designated ineligible: those over concentration limits, affiliate and re-aged receivables, government receivables (assignment needs its own perfection), foreign receivables, contra accounts (a customer that also sells to the borrower can set off what it's owed), receivables owed by insolvent customers, and unbilled receivables.
- **Advance rates.** Common advance rates on eligible receivables run from 70% to 85%, and some banks advance up to 90% on business-to-business receivables. Inventory gets less: typically up to 65% of book value or 80% of net orderly liquidation value (NOLV), with work in process often excluded.
- **Dilution.** Credits that reduce receivables (returns, allowances, disputes, bad debts) are usually expected to be 5% or less; a rise is an early warning.
- **Reporting and control.** Borrowing base certificates come weekly or monthly, field exams test them against invoices and agings, and cash dominion through a lockbox sweeps collections to pay down the line.

### Worked numbers: a borrowing base

A distributor has a $10,000,000 ABL revolver: 85% against eligible receivables, 80% of NOLV on eligible inventory with a $2,000,000 inventory sublimit, a $150,000 rent reserve for a leased warehouse, and a springing FCCR covenant and cash dominion if excess availability falls below 10% of the commitment ($1,000,000). This month's certificate:

| Line | Amount |
| --- | --- |
| Gross receivables | $10,000,000 |
| Less: over 90 days past invoice | ($800,000) |
| Less: cross-aged | ($200,000) |
| Less: foreign | ($300,000) |
| Less: contra | ($100,000) |
| Less: concentration over the single-customer cap | ($400,000) |
| **Eligible receivables** | **$8,200,000** |
| Receivables availability at 85% | $6,970,000 |
| Eligible finished goods, $4,000,000 at a 70% NOLV, times 80% | $2,240,000, capped at the $2,000,000 sublimit |
| Less: rent reserve | ($150,000) |
| **Borrowing base** | **$8,820,000** |
| Revolver outstanding plus letters of credit | $8,000,000 |
| **Excess availability** | **$820,000** (8.2% of the commitment) |

The terms are illustrative. Excess availability below $1,000,000 springs the FCCR test and cash dominion: from the next business day, collections go to the bank's lockbox and pay down the revolver, and the borrower's FCCR is tested for the period. The certificate is the borrower's representation; the field exam is the bank's verification; the system keeps both and the variance between them, because a borrower who overstates eligible receivables by 10% is borrowing against collateral that doesn't exist. Dealer floorplan lending is the same idea against vehicles on a lot, repaid as each one sells ([Auto Lending](/books/banking-and-lending/auto-lending#captive-finance)).

## Participations, Syndication and the Lending Limit

A national bank's loans to one borrower may not exceed 15% of its unimpaired capital and surplus, plus another 10% for loans fully secured by readily marketable collateral (12 U.S.C. 84). A bank with $400 million of capital and surplus can lend one borrower $60 million unsecured, or up to $100 million if $40 million of it is fully secured by marketable securities. A borrower that needs more, or a bank that wants less of one name, shares the loan:

- **A participation** is a sale of an interest in a loan the lead bank made and keeps. The borrower deals only with the lead; participants buy undivided shares and rely on the lead to service, collect and pass through their share. For small banks, the OCC notes, participations can diversify risk, meet community credit needs and keep within the legal lending limit. Its loan purchase guidance (OCC Bulletin 2020-81) expects a participant to do its own underwriting and due diligence independent of the seller's, to get the borrower's financial information through the seller, and to have written terms for transfer, servicing, events of default, collections and recourse.
- **A syndication** puts several lenders directly in the credit agreement. An **administrative agent** (usually the arranging bank) runs the loan: it receives the borrower's payments and distributes each lender's share, calculates interest and fees, sends notices, tracks commitments by lender, and processes **assignments** when a lender sells its position. Each lender is a lender of record to the borrower for its share.

The largest syndicated credits are reviewed jointly by the Federal Reserve, FDIC and OCC under the **Shared National Credit (SNC)** program, which covers commitments of $100 million or more shared by multiple regulated institutions. The 2025 review (released January 12, 2026) covered $6.9 trillion of commitments to 6,857 borrowers; 8.6% of commitments were non-pass (down from 9.1%), US banks held 45% of commitments but 22% of non-pass loans, nearly half of all commitments were leveraged, and leveraged loans were 81% of non-pass. On December 5, 2025, the OCC and FDIC rescinded the 2013 interagency leveraged lending guidance and its 2014 FAQs, calling them "overly restrictive" and directing banks to general principles of prudent credit risk management; their release didn't say whether the Federal Reserve would follow.

For the system, a shared loan has one borrower obligation and several owners. The lead's or agent's books carry the whole facility and each lender's share; every payment splits into distributions by share; every amendment, waiver and consent needs the agreement's required vote (all lenders, a majority, or the affected lender) recorded with the votes. A participation sold is also an accounting question: whether the lead derecognizes the sold share depends on the participation qualifying for sale accounting, which is a field on the participation, set by policy, not a default.

## Risk Ratings and Credit Review

Every commercial loan carries a **risk rating**, the bank's grade of its credit risk, reviewed at least annually and whenever something changes. Banks grade with their own scales, usually several "pass" grades above the regulatory ones, but examiners use the common regulatory definitions for the problem grades, from the OCC's Rating Credit Risk booklet:

- **Special mention:** "potential weaknesses that deserve management's close attention"; not adversely classified.
- **Substandard:** "inadequately protected by the current sound worth and paying capacity of the obligor or of the collateral pledged," with "a well-defined weakness, or weaknesses, that jeopardize the liquidation of the debt."
- **Doubtful:** all the weaknesses of substandard, with collection or liquidation in full "highly questionable and improbable"; nonaccrual is required.
- **Loss:** "considered uncollectible and of such little value that their continuance as bankable assets is not warranted."

Substandard, doubtful and loss are **classified** assets. Separately, the call report's general rule puts a loan on **nonaccrual** when it's maintained on a cash basis because of the borrower's deterioration, when full payment isn't expected, or when principal or interest has been in default for 90 days or more unless the loan is well secured and in the process of collection. Risk rating and accrual status are two fields, set by two rules, and a loan can be substandard and still accruing.

**Credit risk review** (often called loan review) is the independent check on the ratings. The 2020 interagency guidance on credit risk review systems (OCC Bulletin 2020-50, May 8, 2020, from the OCC, Federal Reserve, FDIC and NCUA) describes "a system of independent, ongoing credit review" and replaced the loan review attachment to the 2006 allowance policy statement. In June 2026 the OCC folded its loan portfolio guidance into a new "Lending and Loan Portfolio Risk Management" booklet (OCC Bulletin 2026-29), rescinding the old "Loan Portfolio Management" booklet; the new booklet points examiners to the Rating Credit Risk booklet and Bulletin 2020-50 for ratings and review, and says examiners test review's reliability by comparing their own transaction testing with its findings. A rating that examiners downgrade and the bank's reviewers didn't is a finding about the review function, not just the loan.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). Each loan or line under a commercial credit is an `accounts` row with a `loans` row (variable rates through `index_ref` and `margin`), owned by a business `parties` row, with guarantors in `account_parties` and their terms in `guarantees`, collateral in `collateral` with its `ucc_filings`, from [Small Business Lending](/books/banking-and-lending/small-business-lending#how-to-build-it). Pricing is [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it)'s `loan_pricing`. This chapter adds the facility above the accounts, the lenders who share it, spreads, covenants and their tests, borrowing base certificates, risk ratings and reviews, and the lending limit check.

```sql
CREATE TABLE credit_facilities (             -- the credit agreement: one or more accounts under it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),   -- the lead or agent's books
  borrower_party_id   UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('bilateral', 'participated', 'syndicated')),
  regulatory_category TEXT NOT NULL,         -- 'ci', 'cre_owner_occupied', 'cre_nonowner',
                                             -- 'construction_land', 'multifamily', ...: the call report line
  total_commitment    BIGINT NOT NULL,
  agreement_ref       TEXT NOT NULL,         -- the credit agreement and its amendments, as documents
  agent               TEXT,                  -- the administrative agent, if syndicated
  closed_on           DATE NOT NULL,
  matures_on          DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('active', 'in_default', 'workout',
                        'paid_off', 'charged_off'))
);

CREATE TABLE facility_tranches (             -- revolver, term loan A, LC sublimit: each an account
  facility_id         UUID NOT NULL REFERENCES credit_facilities (id),
  account_id          UUID NOT NULL UNIQUE REFERENCES accounts (id),
  tranche             TEXT NOT NULL,         -- 'revolver', 'term_a', 'lc_sublimit', ...
  commitment          BIGINT NOT NULL,
  borrowing_base_governed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (facility_id, tranche)
);

CREATE TABLE facility_lenders (              -- who owns which share, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES credit_facilities (id),
  lender              TEXT NOT NULL,         -- an institution, by RSSD ID, or a fund
  institution_id      UUID REFERENCES institutions (id),
  role                TEXT NOT NULL CHECK (role IN ('lead', 'agent', 'syndicate_lender',
                        'participant')),
  share_pct           NUMERIC(9, 6) NOT NULL,   -- of each tranche, unless overridden in terms
  commitment          BIGINT NOT NULL,
  acquired_by         TEXT NOT NULL CHECK (acquired_by IN ('origination', 'assignment',
                        'participation_purchase')),
  sale_accounting     BOOLEAN,               -- participations sold: derecognized by the lead?
  agreement_ref       TEXT,                  -- participation or assignment agreement
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE lender_distributions (          -- every borrower payment, split by share
  loan_payment_id     UUID NOT NULL REFERENCES loan_payments (id),
  facility_lender_id  UUID NOT NULL REFERENCES facility_lenders (id),
  principal           BIGINT NOT NULL DEFAULT 0,
  interest            BIGINT NOT NULL DEFAULT 0,
  fees                BIGINT NOT NULL DEFAULT 0,
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  PRIMARY KEY (loan_payment_id, facility_lender_id)
);

CREATE TABLE financial_spreads (             -- the bank's normalized view of a party's statements
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),   -- borrower or guarantor
  period              DATERANGE NOT NULL,
  statement_kind      TEXT NOT NULL CHECK (statement_kind IN ('audited', 'reviewed', 'compiled',
                        'company_prepared', 'tax_return', 'rent_roll', 'personal_financial')),
  source_document_ref TEXT NOT NULL,
  template_version    TEXT NOT NULL,         -- the chart of spread lines
  lines               JSONB NOT NULL,        -- spread line code to amount, minor units
  extraction          TEXT NOT NULL CHECK (extraction IN ('manual', 'automated', 'automated_reviewed')),
  spread_by           TEXT NOT NULL,
  spread_at           TIMESTAMPTZ NOT NULL,
  supersedes_id       UUID REFERENCES financial_spreads (id),  -- a restatement is a new spread
  UNIQUE (party_id, period, statement_kind, spread_at)
);

CREATE TABLE covenants (                     -- each promise, versioned with the agreement
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES credit_facilities (id),
  kind                TEXT NOT NULL CHECK (kind IN ('financial', 'reporting', 'negative',
                        'affirmative')),
  metric              TEXT,                  -- 'dscr', 'fccr', 'debt_yield', 'ltv', 'min_liquidity', ...
  definition_ref      TEXT,                  -- the agreement's section defining it
  operator            TEXT CHECK (operator IN ('>=', '<=', 'delivered_by')),
  threshold           NUMERIC(20, 6),
  test_frequency      TEXT NOT NULL CHECK (test_frequency IN ('monthly', 'quarterly',
                        'annual', 'on_event')),
  springing_condition TEXT,                  -- e.g. 'excess_availability < 1000000'
  cure_days           SMALLINT,
  valid_during        TSTZRANGE NOT NULL     -- an amendment ends one row and starts another
);

CREATE TABLE covenant_tests (                -- every test, including the ones that passed
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  covenant_id         UUID NOT NULL REFERENCES covenants (id),
  test_period         DATERANGE NOT NULL,
  due_at              TIMESTAMPTZ NOT NULL,  -- when the compliance certificate is due
  received_at         TIMESTAMPTZ,
  spread_id           UUID REFERENCES financial_spreads (id),
  computed_value      NUMERIC(20, 6),
  inputs              JSONB,                 -- the figures as the agreement defines them
  result              TEXT CHECK (result IN ('pass', 'breach', 'not_tested', 'not_sprung')),
  resolution          TEXT CHECK (resolution IN ('waived', 'amended', 'cured', 'default_declared')),
  resolution_ref      TEXT,                  -- the waiver or amendment, with approver and reason
  resolved_by         TEXT,
  UNIQUE (covenant_id, test_period)
);

CREATE TABLE borrowing_base_certificates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES credit_facilities (id),
  as_of               DATE NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('borrower_certified', 'field_exam')),
  gross_receivables   BIGINT NOT NULL,
  ineligibles         JSONB NOT NULL,        -- by reason: past due, cross-aged, foreign, contra, ...
  eligible_receivables BIGINT NOT NULL,
  receivables_rate_bps INT NOT NULL,
  eligible_inventory  BIGINT NOT NULL DEFAULT 0,
  inventory_basis     TEXT CHECK (inventory_basis IN ('cost', 'nolv')),
  inventory_rate_bps  INT,
  inventory_sublimit  BIGINT,
  reserves            JSONB NOT NULL DEFAULT '{}',
  borrowing_base      BIGINT NOT NULL,
  outstanding         BIGINT NOT NULL,       -- loans plus letters of credit, from the core that day
  excess_availability BIGINT NOT NULL,
  dilution_rate_bps   INT,
  submitted_at        TIMESTAMPTZ NOT NULL,
  verified_against_id UUID REFERENCES borrowing_base_certificates (id),  -- the certificate a field exam tested
  UNIQUE (facility_id, as_of, source)
);

CREATE TABLE risk_ratings (                  -- every rating ever assigned, with why
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID REFERENCES credit_facilities (id),
  account_id          UUID REFERENCES accounts (id),
  grade               TEXT NOT NULL,         -- the bank's scale, e.g. '1' to '10'
  regulatory_class    TEXT NOT NULL CHECK (regulatory_class IN ('pass', 'special_mention',
                        'substandard', 'doubtful', 'loss')),
  scale_version       TEXT NOT NULL,
  pd_bps              INT,                   -- where the bank uses dual risk ratings
  lgd_bps             INT,
  rated_by            TEXT NOT NULL,         -- officer, credit, or 'credit_risk_review', 'examiner'
  reason              TEXT NOT NULL,
  effective_at        TIMESTAMPTZ NOT NULL,
  CHECK (facility_id IS NOT NULL OR account_id IS NOT NULL)
);

ALTER TABLE loans
  ADD COLUMN accrual_status TEXT NOT NULL DEFAULT 'accrual'
    CHECK (accrual_status IN ('accrual', 'nonaccrual')),
  ADD COLUMN accrual_status_reason TEXT,     -- 'cash_basis', 'full_payment_not_expected', '90_days'
  ADD COLUMN accrual_status_since DATE;

CREATE TABLE credit_reviews (                -- independent credit risk review findings
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES credit_facilities (id),
  review_scope_ref    TEXT NOT NULL,         -- the review engagement it was part of
  reviewer            TEXT NOT NULL,
  rating_agreed       BOOLEAN NOT NULL,
  recommended_rating_id UUID REFERENCES risk_ratings (id),
  findings            JSONB NOT NULL,        -- documentation, covenant, collateral exceptions
  management_response TEXT,
  reviewed_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE lending_limit_checks (          -- every new exposure, aggregated to the borrower
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  borrower_party_id   UUID NOT NULL REFERENCES parties (id),
  combined_party_ids  UUID[] NOT NULL,       -- related borrowers aggregated under the rules
  capital_basis       BIGINT NOT NULL,       -- capital and surplus as of the last call report
  unsecured_limit     BIGINT NOT NULL,       -- 15%
  secured_addition    BIGINT NOT NULL,       -- 10%, readily marketable collateral
  exposure_before     BIGINT NOT NULL,
  exposure_after      BIGINT NOT NULL,
  within_limit        BOOLEAN NOT NULL,
  credit_decision_id  UUID REFERENCES credit_decisions (id),
  checked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **The facility sits above the accounts.** A credit agreement has a revolver, a term loan and a letter of credit sublimit, each with its own balance, rate and schedule in the core; `credit_facilities` holds what they share (the agreement, the covenants, the borrowing base, the lenders, the rating). My rule is that the facility is the top object: a model with the account on top can't answer "what does this borrower owe us across everything" without a join someone has to remember.
- **Shares are effective-dated, payments split by share.** `facility_lenders` has a validity period because assignments move shares mid-life; `lender_distributions` records how each payment was divided under the shares in force that day, the same "allocations are facts" rule the core model applies to borrower payments.
- **The spread and the covenant test are different calculations.** `financial_spreads` is the bank's normalized view; `covenant_tests.inputs` holds the figures as the credit agreement defines them, with the spread they came from. A restated statement creates a new spread that supersedes the old one, and a test already decided keeps the spread it used ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Tests are scheduled, not remembered.** `covenant_tests` rows are generated ahead from each covenant's frequency with their `due_at`, so a missing compliance certificate is a row with no `received_at` past its due date, not an absence nobody notices ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Springing covenants get a row each period with `not_sprung` or a real result.
- **Certificates and field exams are paired.** Both are `borrowing_base_certificates` rows; the field exam points at the certificate it tested, and the variance between them is a monitored metric.
- **Ratings are history.** Every rating, by whom and why, is a row; the current rating is the latest effective one. Examiners and credit review compare their ratings against the bank's at a date, which needs the history, not a column.
- **The lending limit is checked at decision time** against aggregated exposure across related borrowers and recorded, because the question after the fact is "what did you know when you approved it."

## Auditing

Commercial loans are reviewed one file at a time by credit review, internal audit, examiners, participants and, in a dispute, the borrower's counsel. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **The credit agreement and every amendment,** with the covenants in force for each period.
- **Every spread** with its source documents, who spread it and whether it was restated.
- **Every covenant test,** passed or failed, with the inputs as the agreement defines them, and every waiver, amendment or cure with its approver and reason.
- **Every borrowing base certificate and field exam,** the ineligibles by reason, and the availability and springing triggers they produced.
- **Every risk rating change** and every credit review finding, with management's response.
- **Who owned what share of the facility when,** every distribution by lender, and every vote on an amendment.
- **The lending limit and concentration position** at each approval, from loan-level data by call report category.

## What This Means for the System You Build

- **Put a facility above the accounts** and hang covenants, borrowing bases, lenders and ratings on it.
- **Keep the spread and the covenant definition separate,** and store the inputs of every test.
- **Generate covenant tests ahead with due dates,** record passes as well as breaches, and make every waiver a documented decision.
- **Compute the borrowing base from certificate data** with ineligibles by reason, and pair each field exam with the certificate it tested.
- **Effective-date lender shares** and split every payment by the shares in force that day.
- **Keep risk rating and accrual status as separate, historied fields** set by their own rules.
- **Check the legal lending limit and concentration** from loan-level data at the moment of approval, and keep the check.

## References

**Law and regulation**

- [Cornell LII: 12 U.S.C. 84, lending limits](https://www.law.cornell.edu/uscode/text/12/84), 15% of unimpaired capital and surplus to one borrower, plus 10% fully secured by readily marketable collateral

**Regulators and guidance**

- [OCC: Comptroller's Handbook, Commercial Real Estate Lending (March 2022)](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf), supervisory loan-to-value limits and the exception baskets, the 2006 CRE concentration criteria, common financial covenants for income-producing CRE, covenant definitions of income and expenses, DSCR and debt yield
- [OCC: Comptroller's Handbook, Asset-Based Lending](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/asset-based-lending/pub-ch-asset-based-lending.pdf), ineligibility at three times terms, cross-aging, the receivables commonly designated ineligible, dilution of 5% or less, receivable and inventory advance rates, borrowing base certificates, covenants as default triggers, springing covenants, cash dominion and documented waivers
- [OCC: Comptroller's Handbook, Lending and Loan Portfolio Risk Management (June 2026)](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/lending-loan-portfolio-risk-management/pub-ch-lending-loan-portfolio.pdf), participations and the legal lending limit, the excerpts from OCC Bulletin 2020-81 on loan purchases, credit risk-rating systems, independent credit risk review, and the call report nonaccrual rule
- [OCC: Bulletin 2026-29, Lending and Loan Portfolio Risk Management booklet and rescissions (June 25, 2026)](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-29.html), the new booklet and the rescinded Loan Portfolio Management booklet
- [OCC: Comptroller's Handbook, Rating Credit Risk](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/rating-credit-risk/pub-ch-rating-credit-risk.pdf), the regulatory definitions of special mention, substandard, doubtful and loss, and classified assets
- [OCC: Bulletin 2026-49, Concentrations of Credit booklet and rescissions (September 30, 2026)](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-49.html), the unchanged definition of a concentration as more than 25% of tier 1 capital plus the allowance
- [OCC: Bulletin 2020-50, Interagency Guidance on Credit Risk Review Systems (May 8, 2020)](https://www.occ.gov/news-issuances/bulletins/2020/bulletin-2020-50.html), the four agencies, independent ongoing credit review, and the rescinded 2006 loan review attachment
- [OCC: News Release 2025-119, OCC and FDIC rescind leveraged lending guidance (December 5, 2025)](https://occ.gov/news-issuances/news-releases/2025/nr-ia-2025-119.html), the 2013 guidance and 2014 FAQs withdrawn, and the stated reasons
- [FDIC: Agencies issue 2025 Shared National Credit Program report (January 12, 2026)](https://www.fdic.gov/news/press-releases/2026/agencies-issue-2025-shared-national-credit-program-report), the $100 million threshold, $6.9 trillion of commitments, 6,857 borrowers, the 8.6% non-pass share, US banks' share, and leveraged loans
- [Federal Reserve: Shared National Credit program](https://www.federalreserve.gov/supervisionreg/snc.htm), the three agencies and the review schedule
- [Federal Reserve: H.8, Assets and Liabilities of Commercial Banks in the United States (October 23, 2026)](https://www.federalreserve.gov/releases/h8/current/default.htm), seasonally adjusted C&I, CRE and total loans for the week ending October 14, 2026

**Filings**

- [nCino: Annual report on Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1902733/000190273326000022/ncno-20260131.htm), revenue of $594.8 million, over 2,700 customers and about 1,500 depositories, the Salesforce and AWS dependence, commercial and small business origination, and the move from seat-based pricing

**Vendor documentation**

- [nCino: Commercial lending](https://www.ncino.com/solutions/commercial-lending), automated spreading, covenant notifications as a record of compliance, and the document repository
- [Moody's: Lending Suite loan origination](https://www.moodys.com/web/en/us/solutions/lending/loan-origination.html), automated spreading, scoring and decisioning, and AI-drafted credit memos
- [Abrigo: Loan administration software](https://www.abrigo.com/software/lending-and-credit-risk/sageworks-credit-risk-software/loan-administration/), tickler and covenant tracking, exception tracking, the client portal and compliance reports for management and examiners
