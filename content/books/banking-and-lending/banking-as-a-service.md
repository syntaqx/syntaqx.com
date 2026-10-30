+++
title = "Banking as a Service"
description = "Sponsor bank, middleware and program manager roles, who owns each obligation, bank-direct models, contracts, reserves and credit enhancement, and moving banks."
category = "Banking & Lending Industry"
order = 2425
part = "Fintech and BaaS"
tags = ["banking", "baas", "sponsor-banks", "program-managers", "middleware", "fintech"]
+++

Banking as a service is a bank renting out its charter one program at a time. The bank holds the deposits, issues the cards, originates the loans and answers to its examiners for all of it; a fintech designs, sells and services the product under its own brand; and, in one version of the arrangement, a middleware company sits between them with the API, the ledger and the operations. The agencies' own definition is structural: arrangements in which banks use third parties "to deliver deposit products and services (such as checking and savings accounts) to end users", which "are sometimes referred to as 'banking-as-a-service' or 'embedded finance' depending on the structure and parties involved."

Every obligation in this volume still belongs to the bank, and most of the work is done by someone else. That gap is what the contracts, the reserves, the compliance task matrix and the reconciliation are for, and what the 2023 to 2026 consent orders were about. This chapter covers the roles and the three shapes the market has settled into, who owns which obligation, the contracts and the money between the parties, reserves and credit enhancement, and how a program moves from one bank to another. The card side (BIN sponsorship, network registration, issuer processing) is in [Card Issuing](/books/payments/card-issuing#bin-sponsorship); the subledger and its daily reconciliation are in [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers); the bank's supervision of all of it is in [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight).

## The Roles

| Party | What it does | What it can't hand off |
| --- | --- | --- |
| **Sponsor bank** | Holds the accounts and the money, issues cards as BIN sponsor, originates loans, files SARs, reports to its regulators | The legal obligations of the account: CIP, BSA/AML, OFAC, Reg E, Reg DD, Reg CC, deposit insurance records, safety and soundness |
| **Program manager** | Designs the product, acquires and serves customers, runs onboarding, support, disputes and often compliance operations under the bank's procedures | Its own conduct: the CFPB treats it as a covered person, and state law may license it |
| **Middleware (BaaS platform)** | Sells programs one API for accounts, cards, payments and ledger across one or more banks; may run KYC orchestration, monitoring and reconciliation | The accuracy of the records it keeps, which the bank and the CFPB rely on |
| **Processors and vendors** | Issuer processing, card production, KYC and fraud vendors, the bank's core | Their own service levels, under contracts the bank needs to reach |

The CFPB's complaint against Synapse describes the middleware role in plain terms: its technology "acted as a bridge between the FinTech Platforms that interfaced with consumers and the traditional banks that held consumers' money, issued debit cards, and processed ACH and wire transfers", and it "was responsible for tracking the location of individual End User funds" across them. The complaint calls the platforms and the bank covered persons and Synapse a service provider; all three had obligations, and only the bank had a charter.

## How the Platforms Do It

What banks and middleware document publicly, as of October 2026:

| Platform | Model | What it documents |
| --- | --- | --- |
| **Column N.A.** | Bank-direct: a national bank selling its own API | Says it "built our core, ledger, and tech stack from scratch" and offers "freedom from vendors and middleware"; book transfers with holds that can be re-authorized and cleared at a different amount, held funds in a separate holding balance |
| **Coastal Community Bank (CCBX)** | Sponsor bank with programs through partners and middleware | 28 partners at year-end 2025; $2.56 billion of BaaS deposits, 61.7% of the bank's total; $1.81 billion of CCBX loans, 48.1% of its loans; partners' policies, scorecards and models submitted for review |
| **Synctera** | Middleware over sponsor banks | One FBO per program on the bank's core, a settlement account, a reserve with a $25,000 initial requirement, an operating account, adjustment accounts; daily account and transaction files from the bank |
| **Unit** | Middleware over sponsor banks | Applications become customers, customers have accounts, accounts have append-only transactions; deposit accounts, wallet (FBO) accounts that "aren't bank accounts", and credit accounts; hard and soft limits |
| **Synapse** (failed 2024) | Middleware holding the ledger for many programs across several banks | Bankruptcy filed April 22, 2024; case dismissed November 2025 ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#synapse-a-post-mortem)) |

Three things stand out. **A sponsor bank's balance sheet can be its programs:** at Coastal, partners brought most of the deposits and nearly half the loans, so a program's departure is a liquidity event for the bank, and its 10-K says a termination "could materially reduce our deposits, assets and income." **The middleware's ledger and the bank's core are two different things:** Unit's wallet accounts carry routing and account numbers and "aren't bank accounts", and Synctera's sponsor bank "sees one account balance for all of the accounts within the program", which is the arrangement that failed at Synapse. **Bank-direct is the answer the market reached for afterwards:** a bank that runs its own ledger and API removes the layer whose records the bank couldn't see.

## Three Shapes

The arrangements differ in where the ledger of record for each customer lives:

1. **Program manager on a sponsor bank, individual accounts.** Each customer has a deposit account on the bank's core with its own number; the program keeps a mirror for its app. The bank's core is the ledger of record. Chime's structure, with two banks holding the accounts and issuing the cards, is this shape from the program's side ([Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks#program-manager-or-charter)).
2. **Middleware with an omnibus account.** The bank holds one FBO account per program (or per middleware) and the middleware's subledger holds each customer's balance, sometimes with virtual account numbers that route into the pool. The middleware's ledger is the only per-customer record, and pass-through insurance depends on it ([Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage)). This is the Synapse shape.
3. **Bank-direct.** The bank exposes its own core through an API, and programs integrate with the bank, not a middle layer. Column is the clearest example; the bank keeps each customer's record because it is the core.

Shape 2 isn't forbidden and still serves well-run programs, but it puts a non-bank between the bank and its own deposit obligations, and the July 2024 joint statement named exactly that risk: a "lack of sufficient access by a bank to the deposit and transaction system of record" can "impair the bank's ability to determine its deposit obligations." The FDIC's custodial accounts proposal would make a bank whose records are kept by a third party ensure "direct, continuous, and unrestricted access" to them, including through that party's bankruptcy ([What the Custodial Proposal Would Require](/books/banking-and-lending/program-ledgers#what-the-custodial-proposal-would-require)).

## Who Owns Which Obligation

The bank owns every obligation; the question is who performs it, how the bank knows it was done, and what the record shows. The Sutton Bank order of February 2024 made the bank inventory, for each program, which party performed which part of AML compliance (CIP, monitoring, independent testing, suspicious activity reporting) ([Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny)). The matrix most programs end up with:

| Obligation | Accountable | Usually performed by | Evidence the bank keeps |
| --- | --- | --- | --- |
| **CIP and KYC** (31 CFR 1020.220) | Bank | Program or middleware, under the bank's CIP procedures | Each customer's collected fields, vendor results, discrepancy resolution |
| **CDD and beneficial ownership** | Bank | Program for business accounts | Certifications, verification, risk ratings |
| **OFAC screening** | Bank | Program or middleware, against lists the bank approves | Screening results and dispositions |
| **Transaction monitoring** | Bank | Program, middleware or bank; often two layers | Alerts, dispositions, referrals with timestamps |
| **SAR decisions and filing** | Bank (only the bank files) | Bank, on the program's referrals | SAR decisions, kept confidential from the program's customer-facing systems |
| **Reg E error resolution** | Bank, and the program as covered person | Program | Each claim against its clock ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes)) |
| **Disclosures and statements** (Reg DD, Reg E, privacy) | Bank | Program renders and delivers the bank's approved versions | Every disclosure as delivered ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#fintech-accounts-are-bank-accounts)) |
| **Marketing and deposit insurance statements** (12 CFR 328) | Bank | Program, with bank approval | Each published version and its approval |
| **Complaints** | Bank | Program, reported to the bank | Every complaint, category, response and time to close |
| **Ledger and reconciliation** | Bank | Bank core (shapes 1 and 3) or middleware (shape 2) | Daily per-owner balances reconciled to the bank's account ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers)) |
| **Fraud and credit losses** | Bank, by law | Program, by contract | Reserves, indemnities and the losses charged against them |

The design consequence is that the matrix is data, not a PDF attached to the program agreement: each obligation has a performer, a control, evidence produced on a schedule, and a test the bank runs ([How to Build It](#how-to-build-it)). Where the bank has no contract with a party that performs a significant role (a program's KYC vendor contracted through middleware, for example), the joint statement expects the bank to assess whether the risk can be mitigated at all.

## Contracts

Three agreements carry the arrangement:

- **The program agreement** between the bank and the program manager (or the middleware): approved products and customer segments, the compliance task matrix, the bank's approval rights over changes, marketing review, reporting, reserves and indemnities, revenue sharing, audit and data access, termination rights and what happens to the customers on exit. In the issuing context it's the same contract [The Parties and the Stack](/books/payments/card-issuing#the-parties-and-the-stack) describes.
- **The middleware agreement,** if there is one, between the bank and the platform and between the platform and each program; the bank needs the right to reach the program's records and the platform's ledger directly, and to step in.
- **The customer agreement,** which for a deposit account is the bank's deposit agreement, presented by the program. Until the summer of 2023, Synapse "provided the consumer with a deposit account agreement on behalf of Evolve", which is what made Evolve's customers Evolve's.

The clauses that decide what happens in a crisis are the ones about exit. The July 2024 joint statement suggests contracts that "address the transfer of the relevant accounts, data, or activities to another entity in the event of the third party's bankruptcy, business failure, business interruption, or failure to perform as expected." My rule for any program agreement: the bank can obtain, on one day's notice and without the other party's cooperation, a file of every customer, every account and every balance, in a format its own core can load.

## How the Money Flows

On the bank's core, a program is a handful of accounts. Synctera's published structure is typical: an FBO account that holds the aggregate of the program's customer funds, a settlement account through which card, ACH and wire activity enters and leaves, a reserve account, an operating account for the program's own money and its revenue, and adjustment accounts for fraud, P&L and interest. Settlement and the FBO move once a day by the reconciliation in [Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation); the program's own money never sits in the FBO ([Treasury & Bank Operations](/books/payments/treasury#the-accounts-you-run) is the same discipline from a payment provider's side).

What the bank earns, and pays:

- **Program fees,** monthly minimums and per-account fees charged to the program.
- **A share of interchange,** with the rest remitted to the program; Synctera's guide has the bank send interchange to the platform and receive its revenue share back, and Chime's partner banks remit interchange less costs and fixed fees ([Interchange](/books/banking-and-lending/neobanks#interchange)).
- **Low-cost deposits,** the reason many community banks sponsor at all; the program may negotiate a share of the spread, and a bank that sweeps program deposits off its balance sheet (Coastal moved $843.6 million of CCBX deposits off balance sheet at year-end 2025) is managing insurance, liquidity and capital, not only earnings.
- **Loan yield** on the share of program loans it keeps, net of what it pays partners.

## Reserves and Credit Enhancement

The bank's losses on a program are the program's losses by contract. Three instruments carry them:

- **Reserve accounts.** Cash the program posts at the bank against fraud, negative balances and operational losses, with a required level the bank sets and the program replenishes. Synctera's model starts at $25,000; Chime's 10-K says Stride requires "a minimum of $5 million in such reserve account as cash collateral"; Coastal's CCBX cash reserve accounts totaled $72.2 million at year-end 2025.
- **Credit enhancement.** For lending programs, the partner indemnifies or reimburses the bank's credit and fraud losses. Coastal reports that "98.8% of our CCBX loans are covered by a credit enhancement", recorded as an asset of $177.7 million at year-end 2025; it booked a $190.0 million provision on CCBX loans in 2025 and settled $217.1 million of credit losses with partners, and kept the losses itself on "approximately 5% of a $321.3 million CCBX loan portfolio."
- **Indemnities and guarantees,** usually from the program's parent, for anything the reserve doesn't cover.

Each is only as good as the counterparty. Coastal's 10-K is direct about it: if a partner "is unable to fulfill their contracted obligation then the Bank would be exposed" to the losses, and on a partner's default the bank "could declare the agreement in default, take over servicing and cease paying the partner." The engineering consequence is that the bank needs the program's loans and accounts in a form it can service itself, which is the same requirement as exit.

A worked example of my own: a program originates $100 million of credit card balances at its sponsor bank under a full credit enhancement. Over a year the bank charges off $9 million, records a $9 million receivable from the partner, and nets it against the partner's reserve and its share of interest. If the partner's reserve holds $3 million and its revenue share for the year is $4 million, the bank is still owed $2 million, and that $2 million is the bank's credit exposure to the partner, not to the cardholders. A bank that tracks losses only at the cardholder level never sees that number.

## Moving Between Sponsor Banks

Programs move: to diversify, after a bank's consent order restricts growth, when a bank exits the business, or to a charter of their own. Dave is mid-move as of October 2026: onboarding at Coastal Community Bank began in the second quarter of 2025, all new members were opening there by the fourth quarter, and Dave expects existing members' transition to be "substantially finalized by the end of 2026", while its Evolve agreement renews annually. Mercury, granted preliminary conditional approval for a national bank on April 24, 2026, still runs on Choice Financial Group, Column and, for cards, Patriot Bank.

A move is a conversion across institutions ([Core Modernization & Conversions](/books/banking-and-lending/core-modernization#conversion-weekends) covers the discipline), with four things that make it harder than a core change:

- **Account and routing numbers change.** A routing number belongs to an institution, so every customer's account number changes, and every payroll direct deposit, biller and linked app points at the old one. The old bank must keep receiving and forwarding, or returning, for months; programs typically run both banks in parallel and move customers in cohorts.
- **Cards are reissued.** The BIN belongs to the sponsor ([BINs and account ranges](/books/payments/card-issuing#bin-sponsorship)), so a new bank means new card numbers, new wallet tokens, and every saved card at every merchant updated or broken.
- **The customer's contract changes.** The deposit agreement is the bank's, so moving is a new account under a new agreement, with new disclosures and, for consumer accounts, notice; the new bank applies its own CIP program and decides under its own procedures whether existing verification records satisfy it.
- **Two ledgers must agree twice.** Balances leave one bank and arrive at another by transfer, and in between the program's ledger is the only place that knows which customer moved how much. Deposit insurance applies at each bank separately, so a customer whose balance sits at both during the move is two depositors' worth of records.

My default plan: new customers at the new bank first, then cohorts of existing customers with a fixed cutover date each, direct deposit switching offered in-app, old account numbers forwarding until volume on them falls to an agreed level, and the old bank's per-owner file and the new bank's reconciled every day of the overlap.

## How to Build It

These are deltas against `programs`, `institutions` and `accounts` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). `programs.program_manager` and `programs.middleware` name the brand and the platform; the arrangement needs every party, the obligation matrix as data, the reserves, and the record of a move:

```sql
CREATE TABLE program_participants (        -- every company with a role in a program
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  company             TEXT NOT NULL,
  role                TEXT NOT NULL CHECK (role IN ('sponsor_bank', 'program_manager', 'middleware',
                        'issuer_processor', 'kyc_vendor', 'monitoring_vendor', 'card_production',
                        'servicer', 'collections')),
  contracted_with_bank BOOLEAN NOT NULL,     -- false: reached only through another party
  contract_ref        TEXT,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE program_obligations (         -- the compliance task matrix, as data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  obligation          TEXT NOT NULL CHECK (obligation IN ('cip', 'cdd', 'ofac_screening',
                        'transaction_monitoring', 'sar_decision', 'reg_e_errors', 'disclosures',
                        'statements', 'marketing_review', 'complaints', 'ledger_of_record',
                        'reconciliation', 'fraud_losses', 'credit_losses')),
  performed_by        UUID NOT NULL REFERENCES program_participants (id),
  procedure_ref       TEXT NOT NULL,         -- the bank's procedure the performer follows, by version
  evidence            TEXT NOT NULL,         -- what is produced: 'daily_file', 'monthly_report', 'case_records'
  evidence_frequency  TEXT NOT NULL CHECK (evidence_frequency IN ('daily', 'weekly', 'monthly',
                        'quarterly', 'per_event')),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING gist (program_id WITH =, obligation WITH =, valid_during WITH &&)
);

CREATE TABLE program_reserves (            -- what the program must hold at the bank, and where
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  kind                TEXT NOT NULL CHECK (kind IN ('fraud_reserve', 'credit_enhancement',
                        'cash_collateral', 'settlement_prefund')),
  account_id          UUID REFERENCES accounts (id),  -- the reserve account on the bank's core
  required_amount     BIGINT,                -- fixed requirement, minor units
  required_rule       JSONB,                 -- or a formula: percent of balances, of loans, of losses
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE program_migrations (          -- a program moving banks, or to its own charter
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  from_program_id     UUID NOT NULL REFERENCES programs (id),
  to_program_id       UUID NOT NULL REFERENCES programs (id),  -- the same product at the new institution
  conversion_id       UUID REFERENCES conversions (id),        -- the receiving side's conversion record
  kind                TEXT NOT NULL CHECK (kind IN ('sponsor_change', 'own_charter', 'bank_exit')),
  new_customers_from  DATE,                  -- when onboarding switched
  status              TEXT NOT NULL CHECK (status IN ('planned', 'parallel', 'migrating', 'complete')),
  CHECK (from_program_id <> to_program_id)
);

CREATE TABLE account_migrations (          -- one customer account moving
  program_migration_id UUID NOT NULL REFERENCES program_migrations (id),
  from_account_id     UUID NOT NULL REFERENCES accounts (id),
  to_account_id       UUID REFERENCES accounts (id),
  cohort              INT NOT NULL,
  notice_disclosure_id UUID REFERENCES disclosures (id),  -- the notice and the new agreement
  balance_moved       BIGINT,
  card_reissued_at    TIMESTAMPTZ,
  direct_deposit_switched_at TIMESTAMPTZ,
  old_number_closed_at TIMESTAMPTZ,          -- forwarding ends
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'notified', 'moved', 'closed_old', 'failed')),
  PRIMARY KEY (program_migration_id, from_account_id)
);
```

The reserve test the bank runs each business day reads the reserve account's snapshot against each requirement:

```sql
SELECT r.program_id, r.kind, r.required_amount, b.ledger_balance,
       r.required_amount - b.ledger_balance AS shortfall
FROM program_reserves r
JOIN balance_snapshots b ON b.account_id = r.account_id AND b.business_date = :day
WHERE r.valid_during @> CAST(:day AS DATE)
  AND r.required_amount IS NOT NULL
  AND b.ledger_balance < r.required_amount;
```

Design notes:

- **A move is two programs.** The program at the new bank is a new `programs` row with its own institution, agreement and products, because the old program's records must stay producible on their own for the old bank's examiners; `program_migrations` links them.
- **Account migrations reuse the conversion tables.** The receiving bank's `conversions`, `conversion_crosswalk` and `conversion_controls` from [Core Modernization & Conversions](/books/banking-and-lending/core-modernization#how-to-build-it) carry the old-to-new account mapping and control totals; `account_migrations` adds what is specific to a sponsor change: notice, card reissue, direct deposit switching and the end of forwarding.
- **Obligations point at procedures by version.** When the bank changes its CIP procedure, every program's `cip` obligation points at the new version from a date, and the evidence before that date is judged against the old one ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Tenancy is institution, then program.** A middleware or a bank-direct platform serves many banks or programs, and each bank's records must be producible alone ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).

## Auditing

- **The obligation matrix over time,** with who performed each obligation on any date and the procedure version they followed.
- **Every participant and contract,** including the parties the bank reaches only through another party.
- **Reserve levels against requirements** every business day, with every shortfall and when it was cured.
- **Credit enhancement settlements:** each loss charged to the partner, the reserve or revenue it was netted against, and the residual exposure.
- **Each migration:** cohorts, notices, balances moved per account, and the reconciliation of both banks through the overlap.

## What This Means for the System You Build

- **Pick the shape deliberately:** if the bank's core is not the per-customer ledger of record, the subledger must be reconciled to it daily and reachable by the bank without you.
- **Keep the compliance task matrix as data,** with performers, procedures, evidence and tests.
- **Put the exit in the contract and in the code:** a full customer, account and balance file the bank can load, on a day's notice.
- **Track reserves and credit enhancement as accounts and receivables,** and measure the bank's exposure to the partner, not only to the customers.
- **Plan migrations as conversions across institutions,** with new numbers, new cards, new agreements and two reconciliations.
- **Expect your bank to examine you:** everything in this chapter is what its examiners will ask it for.

## References

**Regulators and guidance**

- [Federal Reserve, FDIC and OCC: Joint statement on banks' arrangements with third parties to deliver bank deposit products and services (July 25, 2024)](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20240725c1.pdf), the BaaS definition, lack of access to records, fragmented operations and contract provisions for transfer on a third party's failure
- [Federal Register: Recordkeeping for Custodial Accounts (FDIC proposed rule, October 2, 2024)](https://www.federalregister.gov/documents/full_text/html/2024/10/02/2024-22565.html), direct, continuous and unrestricted access to third-party records

**Courts**

- [CFPB v. Synapse Financial Technologies, complaint (Bankr. C.D. Cal., Adv. No. 1:25-ap-01052-MB, August 21, 2025)](https://files.consumerfinance.gov/f/documents/cfpb_synapse-financial-technologies_complaint_2025-08.pdf), the bridge role, covered persons and service provider, tracking end-user funds, and the Evolve deposit agreement

**Filings**

- [Coastal Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1437958/000143795826000013/ck1437958-20251231.htm), CCBX partners, BaaS deposits and loans, credit enhancement, reserves, off-balance-sheet deposits, partner default and termination risk
- [Chime Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1795586/000179558626000013/chym-20251231.htm), the $5 million cash collateral reserve and interchange remitted less costs and fixed fees
- [Dave: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1841408/000119312526085370/dave-20251231.htm), the move from Evolve to Coastal Community Bank and its timeline

**Vendor documentation**

- [Column](https://column.com/), its own core, ledger and tech stack and the no-middleware model
- [Column: Book transfers and holds](https://docs.column.com/guides/book-transfers-and-holds), two-part held transfers and the holding balance
- [Synctera: Funds flow](https://docs.synctera.com/docs/funds-flow), the FBO, settlement, reserve, operating and adjustment accounts on the bank's core
- [Synctera: Reconciliation for banks](https://docs.synctera.com/docs/reconciliation-banks), the daily files, the interchange flow and the revenue share
- [Unit: Accounts overview](https://unit.co/docs/api/accounts/overview/), deposit, wallet (FBO) and credit accounts, append-only balances and hard and soft limits
- [Mercury: Pricing](https://mercury.com/pricing), Choice Financial Group and Column N.A. as its banks

**Charter decisions**

- [OCC: Corporate Decision #1372, Mercury Bank, N.A. (April 24, 2026)](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1372.pdf), preliminary conditional approval and the FDIC and Federal Reserve applications still pending

**In practice**

- [Payments Dive: Mercury nabs conditional OCC charter (April 29, 2026)](https://www.paymentsdive.com/news/mercury-fintech-nabs-conditional-occ-charter/818722/), Patriot Bank as its card issuer
