+++
title = "Core Banking Systems"
description = "What a core does, the general ledger against its subledgers, the core vendors, hosted, in-house and cloud-native cores, and the systems around them."
category = "Banking & Lending Industry"
order = 2408
part = "The Core"
tags = ["banking", "core-banking", "ledger", "vendors", "architecture"]
+++

A bank's **core** is the system of record for its accounts. It knows which deposit and loan accounts exist, who owns them, what product terms govern them, and what their balances were at the close of every business day since they opened. It posts every debit and credit, accrues interest every night, assesses fees, ages loans into delinquency, produces statements and tax forms, and hands the general ledger the summary entries that become the bank's financial statements. Everything a customer touches (the mobile app, a branch teller screen, a debit card swipe, an ACH file, a wire) eventually asks the core one of two questions, "can this happen?" or "record that this happened", and the answer is binding.

Most US banks don't write their core. They rent it, from a small set of vendors whose products date in some cases to the mainframe era, and they build or buy everything else around it. That arrangement shapes the whole industry: what a bank can launch is often what its core can be configured to do, the core contract is one of the longest and least reversible decisions the bank makes, and the core vendor is examined by the bank's regulators as if it were part of the bank. This chapter is what a core does and how the market for cores works. [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances), [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements) and [Products & Product Configuration](/books/banking-and-lending/product-configuration) go inside the three jobs that define it, and [Core Modernization & Conversions](/books/banking-and-lending/core-modernization) covers replacing one.

## What a Core Does

Strip the vendor names away and every core does the same jobs, whether it runs on a mainframe in a service bureau or as containers on a public cloud.

| Job | What it means | Where this volume covers it |
| --- | --- | --- |
| **Customer information file (CIF)** | Parties, their identifiers, addresses and relationships, and which accounts each is attached to and in what role | The Banking & Lending Business; KYC & Account Opening |
| **Product definitions** | The rules an account inherits: rate, balance method, fees, limits, maturity, dormancy, GL mapping | [Products & Product Configuration](/books/banking-and-lending/product-configuration) |
| **Account servicing** | Opening, maintenance, status changes (dormant, frozen, charged off, closed), stop payments, standing orders | Dormancy, Escheat & Closing Accounts |
| **Posting** | Applying debits and credits in a defined order, computing ledger, available and collected balances, holds | [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances) |
| **Interest and fees** | Daily accrual, periodic crediting or billing, fee assessment, waivers | [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements) |
| **Loan servicing** | Schedules, payment application, delinquency, payoff | Loan Servicing |
| **End of day** | Closing the business day: final posting, accrual, aging, snapshots, GL summaries, files out | [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date) |
| **Statements and notices** | Periodic statements, maturity and change-in-terms notices, tax forms | [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements) |
| **GL interface** | Summarizing account activity into journal entries for the general ledger | [The General Ledger and Its Subledgers](#the-general-ledger-and-its-subledgers) below |
| **Integration** | Real-time APIs and batch files for every channel and rail | [The Systems Around the Core](#the-systems-around-the-core) below |

What a core usually does *not* do is just as important for an engineer joining a bank. Online and mobile banking, loan origination, card authorization, fraud scoring, BSA/AML monitoring and the data warehouse are typically separate systems from separate vendors, each integrated to the core. A bank's "core conversion" changes the system of record underneath all of them, which is why it's a multi-year project ([Why Cores Are Hard to Replace](/books/banking-and-lending/core-modernization#why-cores-are-hard-to-replace)).

## The General Ledger and Its Subledgers

A bank keeps two kinds of books, and confusing them is the first mistake software people make when they arrive.

The **general ledger (GL)** is the bank's own books: a chart of accounts (cash and due from banks, securities, loans by type, the allowance for credit losses, deposits by type, interest income and expense by product, fee income, salaries). It produces the balance sheet, the income statement and, after mapping, the call report. It doesn't know that a particular customer exists. A bank with two million checking accounts has one GL line, or a handful, for "noninterest-bearing demand deposits".

The **account subledgers** are where the customers live: one record per account, every transaction against it, its balances, its accrued interest. The deposit system and the loan system (often separate products in older cores) are each a subledger. The rule that binds them is simple and unforgiving: **the sum of the subledger equals the GL control account**, every day. The sum of every checking account's ledger balance equals the GL's demand deposit lines; the sum of accrued-but-unpaid interest across savings accounts equals the GL's accrued interest payable for savings.

The core produces the GL entries itself, by mapping each transaction type on each product to a debit account and a credit account and summarizing. Mambu's public documentation shows the shape most cores share: each product links to GL accounts with a cash or accrual methodology, interest accruals post daily or monthly as an aggregated amount "per loan/deposit product and per branch", and a per-account breakdown in the GL is an option only for loans. Each product's accounting rules map its financial resources (the deposit liability, interest expense, fee income) to GL codes.

Three consequences follow for anyone building on or beside a core:

- **The GL is a summary, so the subledger is the evidence.** An examiner or auditor who asks why demand deposits moved $4 million on a Tuesday is answered from the account-level transactions behind the GL entry. Keep the link from each summary entry to the activity it summarizes ([Summary Journals or Detail](/docs/payments/accounting#summary-journals-or-detail)).
- **The mapping is configuration with financial consequences.** A new fee type mapped to the wrong income line misstates the income statement; a new product mapped to the wrong deposit line misstates the call report. Changes to GL mappings go through the same approval as a journal entry.
- **Reconciling subledger to GL is a daily control,** not a month-end task. A difference means a transaction posted to an account without its GL entry, or the reverse, and the longer it ages the harder it is to find.

The double-entry rules themselves (balanced entries, append-only rows, corrections as reversals) are in [Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger). Where this volume's model and the Payments volume's meet: this book's `gl_accounts`, `journal_entries` and `journal_lines` are the bank's books, while the Payments volume's `ledger_accounts`, `ledger_transactions` and `ledger_entries` are a payment provider's ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts)). A provider's FBO account is one `accounts` row in its sponsor bank's core and one `bank_accounts` row, with a `cash` ledger account, on the provider's side; the provider's daily cash reconciliation is a match between those two systems.

## How the Platforms Do It

As of October 2026, the US core market is a few incumbents with large installed bases, the same incumbents' newer platforms, and a set of cloud-native vendors whose public customers are mostly outside the US or are new digital banks.

| Vendor | Cores named publicly | Delivery | What the public record shows |
| --- | --- | --- | --- |
| **Fiserv** | DNA, Finxact, Premier, CoreAdvance, Portico (credit unions), Signature | "Primarily as an outsourced service", also client-installed or hosted by third parties | DNA, Finxact and Signature are sold globally; Finxact also powers the ledger in Fiserv's embedded finance offering (FY2025 10-K) |
| **FIS** | Not named in the FY2025 10-K | Hosted and licensed | Banking Solutions revenue of $7,285 million in 2025 against $6,892 million in 2024; the filing describes a "next-generation core banking platform" and continuing "core modernization efforts" |
| **Jack Henry** | SilverLake (520 banks), CIF 20/20 (260 banks), Core Director (170+ banks), Symitar (about 715 credit unions) | On-premise or Jack Henry's private cloud; a separate public-cloud-native Jack Henry Platform | About 1,670 bank and credit union core clients; names FIS, Fiserv, Corelation and Finastra as core competitors (FY2025 10-K) |
| **Temenos** | Temenos Core | SaaS on Azure and AWS | Claims to have been first to put core banking in the cloud, in 2011, and to support banks in 150+ countries |
| **Thought Machine** | Vault Core | Multi-cloud | One ledger for every product, with products written as "programmable smart contracts"; JPMorgan Chase's consumer bank is migrating to it |
| **10x Banking** | 10x platform | SaaS, cloud-native | Customers named include Chase UK, Westpac, The Co-operative Bank and WestBrom; claims 100M+ accounts and 10,000+ transactions per second |
| **Mambu** | Mambu | SaaS | Public developer documentation for products, holds, accrual and end-of-day jobs; "65+ countries" |
| **Apache Fineract** | Fineract | Open source, self-hosted | Separate read, write and batch instance modes, with close-of-business jobs on batch instances |

<!-- source-gap: fis-finastra-core-names | missing | FIS and Finastra core product names and client counts | closes with: an FIS or Finastra filing, product page or annual report naming the cores and their counts | checked: 2026-10-29 -->
The FIS and Finastra rows are thinner than the others because neither vendor's product pages could be opened for this chapter and FIS's 10-K doesn't name its cores; treat those rows as incomplete rather than as a statement that the vendors lack the products.

A few patterns run through the table.

- **Bank cores are sized by bank.** Jack Henry's filing segments its three bank cores by institution size: CIF 20/20 from de novo to about $6 billion in assets, Core Director up to about $2 billion, SilverLake for commercially focused banks of $1 billion and up. A bank that outgrows its core converts, usually within the same vendor first.
- **Credit unions run their own cores.** Symitar and Fiserv's Portico are credit union products because credit unions have members, shares and share drafts where banks have customers, deposits and checks, and their regulator (NCUA) and call report differ.
- **The incumbents are building beside themselves.** Jack Henry describes its Platform as "a single public cloud-native, API-first platform" it is "developing into a fully functional modern alternative for existing core functions". Its public status page, as of October 2026, has its real-time Jack Henry Ledger in closed beta with one bank holding company, a 16-component Deposit Servicing bundle in closed beta, SilverLake running inside the Platform in a closed beta with two banks since July 2026, and wires live on the Platform for 21 Symitar credit unions. Fiserv's Finxact, acquired as a cloud-native core, now sits alongside DNA and Premier. These are the vendors' answers to the cloud-native entrants: replace the core a component at a time rather than all at once ([Big Bang or Progressive](/books/banking-and-lending/core-modernization#big-bang-or-progressive)).
- **Marketing claims are not specifications.** "Zero scheduled downtime" (Thought Machine), "no batch processing" (10x) and throughput figures are vendor claims, not audited numbers. What an engineer can rely on is the documented behavior: how holds expire, when accruals book, what the end-of-day job does. Mambu and Fineract are cited heavily in this part because their documentation is public; most incumbent cores document their behavior only to customers.

## Hosted, In-House and Cloud-Native

Where the core runs, and who runs it, is a separate choice from which core it is.

| Model | Who operates | Typical buyer | What the bank owns |
| --- | --- | --- | --- |
| **Outsourced (service bureau)** | Vendor runs the core in its data centers for many banks | Community banks and credit unions; Fiserv says its account processing is "primarily" sold this way | Configuration, operations staff, the contract and vendor oversight |
| **In-house licensed** | Bank runs licensed software on its own hardware or its own cloud account | Larger banks, banks with strong IT | Infrastructure, upgrades, batch operations, disaster recovery |
| **Vendor private cloud** | Vendor hosts a single-tenant or managed instance | Banks moving off in-house without changing cores (Jack Henry offers both on-premise and private cloud) | Less infrastructure; the same core |
| **SaaS / cloud-native** | Vendor runs a multi-tenant service on public cloud | Digital banks, new product lines, greenfield banks inside incumbents | Product configuration and integration; the vendor owns upgrades |
| **Self-built** | Bank writes its own | A few of the largest banks and some fintechs with charters | Everything |

Outsourcing the core doesn't outsource accountability. Under the Bank Service Company Act, services a bank gets "by contract or otherwise" are subject to examination by the bank's regulator "to the same extent as if such services were being performed by the depository institution itself on its own premises", and the bank must notify its regulator of the service relationship within thirty days of signing (12 USC 1867(c)). The large core processors are examined directly by the federal banking agencies as technology service providers for that reason. A bank service provider must also notify its bank customers "as soon as possible" when a computer-security incident has disrupted or degraded, or is reasonably likely to disrupt or degrade, covered services for four or more hours (12 CFR 53.4 in the OCC's version of the rule); the bank's own notice to its regulator is in Security, Resilience & Incident Notice.

The contract is where most of the bank's leverage lives, and the FDIC has said publicly that it is often weak. FIL-19-2019 reported examiners finding technology service provider contracts that didn't require a business continuity plan, set recovery standards or define remedies, didn't detail the provider's incident notification duties, and noted that "long-term contracts and contracts that automatically renew may be at higher risk for coverage gaps." The vendor-management side is in [Outsourcing Risk](/books/banking-and-lending/core-modernization#outsourcing-risk).

## Batch Cores and Real-Time Cores

The deepest architectural difference between cores is when a transaction becomes final on the account.

A **batch core** keeps two views of an account during the day. Items arriving through the day are **memo posted**: they adjust the available balance so channels and card authorizations see them, but the ledger doesn't change until the nightly batch **hard posts** everything in a defined order, accrues interest, assesses fees and rolls the business date. Jack Henry's developer documentation for remote deposit describes exactly this split: memo posting "relies on a posting file" to hard post the final amounts later, and the core "may have limitations that dictate which options are available for real-time posting."

A **real-time core** posts each transaction to the ledger as it happens. End of day still exists, because interest accrues per day and statements close per cycle, but it no longer stops the books: Mambu's documentation says plainly that "there is no downtime while these scheduled tasks execute", and the cloud-native vendors make the absence of a batch window their headline.

Real-time rails pushed the difference from a technical detail to a product limit. FedNow went live on July 20, 2023 running "24x7x365", and an instant payment received at 2 a.m. on a Sunday has to be credited and spendable then. A batch core can memo post it immediately and hard post it in the next batch, which works as long as every channel reads the memo balance; what it can't do easily is change its posting order, rate or fee logic mid-day, because those decisions are made in the batch. [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances) has the mechanics.

## The Systems Around the Core

A bank's architecture diagram is the core in the middle with a ring of systems integrated to it, each from a specialist vendor:

- **Digital banking.** Q2 reports 457 installed digital banking customers with about 27.3 million registered users and says its platform integrates "without requiring customers to replace their existing core banking systems"; Alkami reports 301 financial institutions on its platform and "more than 300 real-time integrations to back office systems", including cores (both FY2025 10-Ks). Both sell to banks and credit unions running every major core, so their integration layer is a product in itself. Digital & Mobile Banking covers the channel.
- **Origination and account opening.** nCino, built on Salesforce, reports about 1,500 depository institution customers for loan origination, onboarding and deposit account opening, and connects to cores through its Integration Gateway; Alkami bought MANTL, an account opening product, in March 2025. The origination system decides; the core books the account. Loan Origination covers the handoff.
- **Payments hubs and rails.** ACH, wires, real-time payments and check image exchange often run through a payments hub that validates, screens and routes, then posts to the core. The rails themselves are the Payments volume's: [ACH](/books/payments/ach), [checks](/books/payments/checks), and the issuer side of [card processing](/books/payments/issuer-processing).
- **Card processing.** Debit card authorizations are decided by a card processor that reads the core's available balance (or a shadow of it) and posts holds back ([The Ledger for an Issuer](/books/payments/issuer-processing#the-ledger-for-an-issuer)).
- **Data.** Cores are poor analytical databases; banks extract to a warehouse nightly, and newer vendor offerings stream changes out (Jack Henry's Data Hub delivers to BigQuery, Azure or AWS). Regulatory reporting, CECL and fraud models run off that copy.
- **Risk and compliance.** BSA/AML transaction monitoring, sanctions screening and fraud scoring read transactions from the core or the hub and write back holds, blocks and case flags (BSA/AML Programs, Sanctions Screening).

Q2 also sells Helix, a "cloud-native core processing and BaaS platform", and Fiserv's Finxact powers embedded-finance ledgers, which is the line where a core vendor and a banking-as-a-service platform become the same thing (Banking as a Service).

Every one of those integrations is a contract, a data feed and a failure mode. When the core is unavailable, each surrounding system needs a defined behavior: digital banking shows the last memo balance with a timestamp, the card processor stands in against a shadow balance and a limit, the payments hub queues. Designing those degraded modes is part of building on a core, not an afterthought.

## How to Build It

The tables below extend the core data model named in The Banking & Lending Business: `institutions`, `products`, `accounts`, `gl_accounts`, `journal_entries` and `journal_lines`, `transactions` and `balance_snapshots`. Amounts are integer minor units ([Integer Minor Units](/docs/payments/money#integer-minor-units)). This chapter adds the GL mapping that turns account activity into journal entries, the daily subledger-to-GL proof, and a record of which system of record holds each account, which matters the moment a bank runs two cores ([Coexistence](/books/banking-and-lending/core-modernization#coexistence-and-the-system-of-record)).

```sql
-- How each transaction type on each product version posts to the GL.
CREATE TABLE gl_mappings (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id     UUID NOT NULL REFERENCES institutions (id),
  product_id         UUID NOT NULL REFERENCES products (id),
  transaction_type   TEXT NOT NULL,            -- 'deposit', 'withdrawal', 'interest_accrual', 'interest_credit', 'fee:monthly_service', ...
  debit_gl_account_id  UUID NOT NULL REFERENCES gl_accounts (id),
  credit_gl_account_id UUID NOT NULL REFERENCES gl_accounts (id),
  effective_during   DATERANGE NOT NULL,        -- a mapping change is a new row, never an edit
  approved_by        UUID NOT NULL,
  EXCLUDE USING gist (product_id WITH =, transaction_type WITH =, effective_during WITH &&)
);

-- The summary journal the core hands the GL each business day, per mapping and branch.
ALTER TABLE journal_entries
  ADD COLUMN business_date DATE NOT NULL,
  ADD COLUMN source        TEXT NOT NULL CHECK (source IN ('subledger_summary', 'manual', 'accrual', 'conversion')),
  ADD COLUMN branch_id     UUID;

-- Which account transactions a summary line covers, so the GL can be walked back to accounts.
CREATE TABLE journal_line_sources (
  journal_line_id UUID NOT NULL REFERENCES journal_lines (id),
  transaction_id  UUID NOT NULL REFERENCES transactions (id),
  PRIMARY KEY (journal_line_id, transaction_id)
);

-- The daily proof: subledger total against the GL control account.
CREATE TABLE subledger_proofs (
  business_date     DATE NOT NULL,
  gl_account_id     UUID NOT NULL REFERENCES gl_accounts (id),
  subledger         TEXT NOT NULL,             -- 'deposits:ledger_balance', 'deposits:accrued_interest', 'loans:principal', ...
  subledger_total   BIGINT NOT NULL,
  gl_balance        BIGINT NOT NULL,
  difference        BIGINT GENERATED ALWAYS AS (subledger_total - gl_balance) STORED,
  explained_by      TEXT,                      -- required when difference <> 0
  PRIMARY KEY (business_date, gl_account_id, subledger)
);

-- Which core holds each account, for banks running more than one.
ALTER TABLE accounts
  ADD COLUMN system_of_record TEXT NOT NULL DEFAULT 'primary_core',
  ADD COLUMN core_account_ref TEXT;            -- the account's number or key in that system
```

The proof for one day and one GL line, which the end-of-day job stores and the close reviews:

```sql
SELECT g.id AS gl_account_id,
       SUM(b.ledger_balance)                           AS subledger_total,
       (SELECT SUM(jl.amount) FROM journal_lines jl
          JOIN journal_entries je ON je.id = jl.journal_entry_id
         WHERE jl.gl_account_id = g.id AND je.business_date <= :day) AS gl_balance
FROM balance_snapshots b
JOIN accounts a  ON a.id = b.account_id
JOIN gl_mappings m ON m.product_id = a.product_id
                  AND m.transaction_type = 'deposit'
                  AND :day <@ m.effective_during
JOIN gl_accounts g ON g.id = m.credit_gl_account_id   -- the deposit liability line
WHERE b.business_date = :day
GROUP BY g.id;
```

How it runs:

1. **Every posted transaction resolves a mapping** for its product and type on its effective date, or it doesn't post. An unmapped transaction type is a configuration error caught at posting, not at month end.
2. **End of day summarizes by mapping and branch** into one journal entry per business date, with `journal_line_sources` linking every line to the account activity it covers.
3. **The proof runs after the summary posts.** A nonzero difference opens a break with an owner, the same way a cash break does in [Breaks](/books/payments/ledger-and-reconciliation#breaks).
4. **Manual GL entries never touch a control account** that a subledger proves against. A correction to customer balances is a transaction on the account, which flows to the GL through the mapping.

## Auditing

The core is the bank's book of original entry, so its records are what examiners, external auditors and, if the bank fails, the FDIC as receiver read first. The general design is in [Audit Trails](/docs/architecture/audit-trails); for a core, the record must show:

- **Every GL mapping in force on any past date,** who approved it and when it changed, so a past journal entry can be explained by the rule that produced it.
- **The daily subledger proofs and their explanations,** retained, so the state of the books on any past business date is shown as it was.
- **The link from every summary journal line to its account transactions,** so an auditor's sample of a GL movement walks back to accounts in minutes.
- **Configuration changes as events,** with old and new values: products, fees, rates, GL mappings, posting rules ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Vendor notifications and incidents,** including the Bank Service Company Act notice to the regulator and every service-provider incident notice received, with times.

## What This Means for the System You Build

- **Treat the core as the system of record and everything else as a reader or a requester.** A channel that keeps its own balance is a cache with an expiry, never a second truth.
- **Model the GL and the subledger as separate books with a daily proof between them,** and GL mappings as effective-dated, approved configuration.
- **Know whether your core is batch or real-time,** and which balance each channel reads during the day; design every integration's behavior for when the core is in batch or down.
- **Keep the vendor's documented behavior, not its marketing, as your spec,** and test it: hold expiry, accrual timing, end-of-day order.
- **Record which system holds each account** from day one; the day a second core arrives (an acquisition, a new product on a cloud core, a conversion), the routing already exists.
- **Read the contract as a technical document.** Recovery standards, incident notice, data return and exit terms are architecture.

## References

**Law and regulation**

- [12 USC 1867: Regulation and examination of bank service companies](https://www.law.cornell.edu/uscode/text/12/1867), services by contract examined as if performed by the bank, and notice to the regulator within thirty days
- [12 CFR 53.4: Bank service provider notification](https://www.law.cornell.edu/cfr/text/12/53.4), notice to bank customers as soon as possible for incidents disrupting covered services for four or more hours

**Regulators and guidance**

- [FDIC FIL-19-2019: Technology Service Provider Contracts](https://www.fdic.gov/news/financial-institution-letters/2019/fil19019.html), contracts lacking continuity and incident terms, and gaps in long-term and auto-renewing contracts
- [Federal Reserve: FedNow Service launch (July 20, 2023)](https://www.federalreserve.gov/newsevents/pressreleases/other20230720a.htm), live date, 35 early adopters and 24x7x365 operation

**Filings**

- [Jack Henry & Associates: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/779152/000077915225000055/jkhy-20250630.htm), SilverLake, CIF 20/20, Core Director and Symitar client counts and size ranges, delivery options, Jack Henry Platform, named competitors
- [Fiserv: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/798354/000079835426000009/fi-20251231.htm), account processing platforms, outsourced and installed delivery, Finxact in embedded finance
- [FIS: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1136893/000113689326000013/fis-20251231.htm), Banking Solutions revenue and core modernization language
- [Q2 Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1410384/000141038426000006/qtwo-20251231.htm), installed digital banking customers, registered users, core integration and Helix
- [Alkami Technology: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529274/000152927426000009/alk-20251231.htm), digital banking clients, MANTL acquisition, back-office integrations
- [nCino: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1902733/000190273326000022/ncno-20260131.htm), depository customers, Salesforce dependency, Integration Gateway

**Vendor documentation**

- [Jack Henry: State of Jack Henry Platform](https://knowledge.banno.com/platform/state-of-the-platform/), Ledger, Deposit Servicing, SilverLake and Symitar in the Platform, Wires and Data Hub status as of October 2026
- [Jack Henry: Remote deposit posting options](https://api.payments.jackhenry.com/docs/smart-alerts/APIReference/Posting/), memo posting with a posting file against real-time hard posting
- [Mambu: Cash vs accruals accounting](https://docs.mambu.com/docs/cash-vs-accruals-accounting/), accrual booking per product and branch, per-account breakdown for loans only
- [Mambu: Deposit products configuration](https://docs.mambu.com/docs/deposit-products-configuration/), accounting rules mapping products to GL codes
- [Mambu: End of day processing and cron jobs](https://docs.mambu.com/docs/automatic-end-of-day-actions/), the ordered daily jobs and no downtime while they run
- [Apache Fineract: Platform documentation](https://fineract.apache.org/docs/current/), read, write and batch instance modes and close-of-business jobs
- [Temenos: Core banking](https://www.temenos.com/products/core-banking/), SaaS delivery, the 2011 cloud claim and 150+ countries
- [Thought Machine: Vault Core](https://www.thoughtmachine.net/vault-core), single ledger, smart-contract products and multi-cloud deployment
- [10x Banking](https://www.10xbanking.com/), named clients and platform claims
- [Mambu](https://mambu.com/), composable SaaS core in 65+ countries
