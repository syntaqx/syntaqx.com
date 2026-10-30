+++
title = "The Banking & Lending Business"
description = "How banks, credit unions, fintechs and lenders work: the parties, how the money is made, the life of a deposit and a loan, and the core data model."
category = "Banking & Lending Industry"
order = 2401
part = "The Business"
tags = ["banking", "lending", "business-models", "data-model", "deposits", "loans"]
+++

Banking is two promises and a balance sheet. A depositor hands over money and is promised it back on demand, with interest, up to a limit the government insures. A borrower is handed money and promises it back on a schedule, with interest, under rules that say what the lender had to disclose, how it decided, and what it may do when payments stop. The institution in the middle earns the difference between what it pays for deposits and what it earns on loans, plus fees, plus interchange on the cards it issues, and it carries the risk that borrowers don't pay, that rates move against it, or that depositors all ask at once. A community bank, a credit union, a neobank on a sponsor bank, a mortgage lender that sells every loan it makes and a corporate card company that underwrites on a startup's cash balance are all doing some part of that, and each is regulated for the part it does.

The software is hard because the same dollar is recorded in several places that must agree to the cent. A deposit at a fintech exists in the fintech's ledger, the middleware's subledger, the sponsor bank's core, the bank's general ledger, the card processor's authorization balance and, if the bank fails, in the FDIC's insurance determination. A loan exists in the origination system that decided it, the servicing system that bills it, the bureaus it is reported to, the investor who bought it and the accounting that reserves for its losses. This chapter is the map the rest of the volume uses: how to read it, the parties, how the money is made, the life of a deposit and the life of a loan, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/banking-and-lending/glossary).

## How to Read This Volume

The volume follows money from the institution that holds it to the platform that runs it, in thirteen parts plus a reference:

- **The Business.** This chapter; [The Banking Landscape](/books/banking-and-lending/banking-landscape) (banks by size, credit unions, the core and digital banking vendors, BaaS, neobanks, nonbank lenders and who bought whom); Bank Economics & Balance Sheet Risk (net interest income and margin, deposit betas, fee lines, the efficiency ratio, interest rate risk, liquidity and capital); Charters & Regulators (national, state, credit union, industrial loan company and trust charters, and who examines whom); Starting a Bank (the de novo path, the FDIC's statutory factors, the OCC's standard conditions, and buying a bank instead); Exams, Ratings & Call Reports (CAMELS and its 2026 proposal, MRAs and consent orders, call reports and public data, CRA); and When Banks Fail (SVB, Signature and First Republic, resolution and the least-cost test, and the receivership weekend in systems).
- **The Core.** Core Banking Systems (what a core does, general ledger versus subledgers, hosted, in-house and cloud-native cores, and the systems around them); Posting, Holds & Balances (memo and hard posting, ledger, available and collected balances, posting order, end-of-day batch and real-time cores); Interest, APY & Statements (day counts, balance methods, accrual, the Reg DD formulas, statements and tax forms); Products & Product Configuration (the product factory, tiers and promotions, versioning and change-in-terms notices); and Core Modernization & Conversions (why cores are hard to replace, TSB, progressive and big-bang migration, conversion weekends).
- **Deposits.** Deposit Accounts & Truth in Savings (checking, savings, money market and CDs, Reg DD, Reg D after 2020, ownership types); Deposit Insurance (ownership categories, the trust rule, pass-through coverage and its records); Funds Availability (the Reg CC schedule and its 2025 amounts, exception holds and notices); Overdraft, NSF & Fees (opt-in, posting order, the 2024 rule and its nullification, fee-free models); Errors & Disputes on Deposit Accounts (Reg E error resolution as a workflow engine); Dormancy, Escheat & Closing Accounts (state dormancy, due diligence, priority rules, closures and deceased accounts); and Levies, Garnishments & Legal Process (levies, garnishments, protected federal benefits, subpoenas and freezes).
- **Financial Crime.** KYC & Account Opening (CIP, CDD and beneficial ownership, identity verification, synthetic identity, KYB); BSA/AML Programs (the pillars, monitoring, SARs and CTRs, 314(a) and (b), enforcement); Sanctions Screening (OFAC lists, the 50% rule, matching and tuning, blocking and reporting); and Account Takeover & Scams (takeover, P2P scams under Reg E, elder exploitation, the UK contrast).
- **Fintech and BaaS.** Neobanks & Consumer Fintech (the US neobanks, the UK banks, revenue models from filings, the Durbin line); Banking as a Service (sponsor bank, middleware and program manager roles, who owns which obligation, moving banks); Program Ledgers & the Synapse Lesson (FBO accounts, per-owner subledgers, daily reconciliation, the collapse as a post-mortem); Sponsor Bank Oversight (third-party guidance, consent orders and terminations, exits to charters); Earned Wage Access (employer-integrated and direct-to-consumer, fees and tips, the CFPB arc and state laws); Credit Builders & Secured Products (secured cards, credit builder loans, rent and bill reporting); Open Banking in the US (aggregators, FDX, tokenized account numbers, consent, the 1033 rule and its status); and Open Banking in the UK & EU (PSD2 account information, the UK standard, PSD3, PSR and FIDA).
- **Lending Products.** [The Lending Business](/books/banking-and-lending/lending-business) (yield, cost of funds, losses and opex, balance sheet versus gain on sale versus servicing); [Credit Cards as Credit](/books/banking-and-lending/credit-cards) (revolving balances, grace periods, interest methods, minimum payments, the CARD Act, late fees); [Personal & Installment Loans](/books/banking-and-lending/installment-loans) (amortization, origination fees, marketplace lenders, small-dollar loans and state caps); [Auto Lending](/books/banking-and-lending/auto-lending) (direct and indirect, dealer participation, captives, leases, GAP, repossession); Mortgages & Home Equity (the market, loan types, rate locks, HELOCs, ATR/QM, channels); Student Loans (federal and private, the servicing system, repayment plans, refinancing, discharge); and Buy Now, Pay Later (pay-in-4 and monthly installments, merchant-funded economics, the CFPB's rule and withdrawal, state and UK law).
- **Business Lending.** Small Business Lending (term loans and lines, SBA 7(a) and 504, equipment and invoice finance, MCA versus loan, guarantees and UCC filings); Embedded Lending (offers from processing data, withholding from payouts, partner banks, state commercial financing disclosure laws); and Commercial Lending (C&I and CRE, covenants, borrowing bases, participations and syndication, loan review).
- **Origination and Underwriting.** Loan Origination (the application, POS and LOS, MISMO data, conditions and verifications); Credit Data & Scores (the bureaus, permissible purpose, tri-merge, FICO and VantageScore, cash-flow data); Underwriting & Decision Engines (rules plus models, DTI and ATR/QM, counteroffers, partner criteria, champion-challenger); Adverse Action & Explaining Decisions (ECOA and FCRA notices, reason codes, reasons from models); Fair Lending, HMDA & 1071 (disparate treatment and impact, the LAR, the 1071 rule, testing); Model Risk Management (SR 11-7, validation, drift, vendor models, ML and LLMs in credit); APR, Finance Charges & Rate Caps (Appendix J, usury, rate exportation, valid-when-made, true lender, MLA and SCRA); TRID & Mortgage Disclosures (Loan Estimate and Closing Disclosure clocks, tolerances, re-disclosure); and Closing, eNotes & MERS (signing and RON, SMART Docs, eVaults, MERS, the post-closing file).
- **Servicing and Collections.** Loan Servicing (boarding, the loan ledger, daily simple interest, payment application, payoffs, transfers); Mortgage Servicing, Escrow & Loss Mitigation (escrow analysis, Reg X clocks, loss mitigation, foreclosure timelines, MSRs); Furnishing Credit Data (Metro 2, monthly furnishing, disputes through e-OSCAR, accuracy duties); Collections & Recovery (delinquency buckets, FDCPA and Reg F, hardship programs, stays, charge-off, debt sale, recoveries); and Credit Losses & CECL (the allowance, vintage and roll-rate models, charge-offs in the ledger, fair-value lenders as the contrast).
- **Funding and Licensing.** Funding the Book (balance sheet, warehouse lines, forward flow, ABS, allocation at origination, investor reporting); The Secondary Mortgage Market (Fannie Mae, Freddie Mac, Ginnie Mae, UMBS, g-fees, pooling and servicing advances); and Lender Licensing & Bank Partnerships (NMLS and state licenses, bank partnership versus charter, true lender exposure).
- **Business Banking.** Business Accounts & Startup Banking (program managers over sponsor banks, KYB, sub-accounts, permissions, "not a bank" disclosures); Sweeps, Reciprocal Deposits & Yield (the $250,000 limit, reciprocal networks, money market fund sweeps, T-bill treasury products, SVB as the reason); and Treasury Management (positive pay, lockbox, ZBA, account analysis and ECR, cash positioning, bank connectivity).
- **Spend Management.** The Spend Management Business (the players, commercial interchange, rewards, subscriptions and float); Corporate Cards & Underwriting (cash and revenue based limits, daily versus monthly pay, receivable ownership, commercial card types); Virtual Cards & Spend Controls (controls as product, cards per employee or vendor); Receipts, Expense Policy & Audit (capture and matching, policy engines, the IRS receipt rules, expense fraud); Reimbursements, Mileage & Per Diem (accountable plans, effective-dated IRS rates); AP, Bill Pay & Procurement (invoice capture, approvals, matching, vendor onboarding, POs and intake); Business Travel & Duty of Care (booking with policy, TMCs, supplier revenue, duty of care); and Accounting Sync & the Close (GL coding, dimensions, ERP sync, accruals, month-end).
- **Running the Platform.** Banking Architecture (ledger design for accounts and loans, event-sourced cores, cutoffs and calendars, multi-program tenancy, a reference build); Digital & Mobile Banking (the platforms, enrollment, authentication, alerts, bill pay, Zelle, accessibility); Regulatory Reporting & Data (call reports, HMDA and 1071 submission, CTR and SAR e-filing, lineage); Security, Resilience & Incident Notice (GLBA Safeguards, the 36-hour notification rule, NYDFS Part 500, DORA, vendor concentration); AI in Banking & Lending (underwriting, fraud, servicing and collections agents, explainability and fair lending limits); and Banking & Lending Metrics (definitions for deposits, margin, credit, fraud, servicing and spend).
- **Reference.** A [Glossary](/books/banking-and-lending/glossary) of every term the volume defines, grouped by part.

The volume covers what banking and lending add. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/payments/money), [Payment States & Ledgers](/docs/payments/payment-states), [Idempotency](/docs/payments/idempotency), [Accounting](/docs/payments/accounting), [Temporal Data](/docs/database/temporal-data), [Rules as Data](/docs/architecture/rules-as-data), [Events & Async Messaging](/docs/architecture/events), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Replacing Systems](/docs/architecture/replacing-systems) and [Audit Trails](/docs/architecture/audit-trails). Other volumes own topics this one leans on. [Payments](/books/payments/card-payments) owns the rails and the cards: ACH and Reg E for ACH ([Consumer Law: Regulation E](/books/payments/ach#consumer-law-regulation-e)), checks and remote deposit ([When the Money Is Available](/books/payments/checks#when-the-money-is-available)), card issuing and BIN sponsorship ([Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny)), authorization, spend controls and cardholder disputes ([Issuer Processing](/books/payments/issuer-processing)), a provider's own bank accounts and FBO basics ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)), and money transmission ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider)). [Commerce](/books/commerce/taking-payment#bnpl-at-checkout) owns BNPL at checkout and dealer F&I ([F&I: Financing, Leases and Add-Ons](/books/commerce/automotive-retail#f-i-financing-leases-and-add-ons)); [Property Tech](/books/property-tech/applications-and-screening) owns tenant screening and [rent reporting](/books/property-tech/resident-financial-products#rent-reporting); and [Field Operations](/books/field-operations/door-to-door-sales) owns financing sold at the door. This volume owns the account and the loan behind each of them: what the institution holds, owes, lends, discloses, reports and is examined on.

The volume is US-centric, with the UK and EU where their rules bind or teach. No single company is the model: the vocabulary and tables are the industry's, benchmarked across banks, credit unions, core vendors (Fiserv, FIS, Jack Henry, Temenos, Thought Machine, Mambu, 10x and others), sponsor banks and middleware, neobanks, lenders and spend platforms, and a company's own product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Banks** | Chartered, FDIC-insured depository institutions, from money-center banks to community banks; 4,238 insured institutions at June 30, 2026, 3,818 of them community banks | A ledger that is right every night, deposits they can lend against, losses they can reserve for, and records that survive an exam |
| **Credit unions** | Member-owned cooperatives chartered by NCUA or a state and insured by the NCUSIF; 4,214 federally insured at June 30, 2026, with 146.1 million members | The same as a bank, with members instead of customers and a field of membership that limits who may join |
| **Sponsor banks** | Banks, usually under $10 billion in assets, that hold the accounts and issue the cards and loans of fintech programs | Every program's customers identified, monitored and reconciled to the bank's core, because the bank's charter carries the obligations |
| **Program managers and fintechs** | Companies that design, market and service a banking or lending product on a sponsor bank's charter: neobanks, business banking apps, spend platforms, embedded lenders | A product they control, launched in months, with the bank's compliance requirements built in rather than bolted on |
| **Middleware (BaaS platforms)** | Software between programs and banks that provides accounts, cards, payments and a subledger as an API | Clean records of whose money is where, reconciled daily to each bank |
| **Cores and processors** | Vendors that run the system of record for accounts and loans (Fiserv, FIS, Jack Henry, Temenos and newer cloud cores), plus card, payment and digital banking processors | Postings and files in their formats, on their schedules |
| **Lenders** | Banks lending from their balance sheet and nonbanks lending under state licenses or through bank partners: mortgage companies, auto finance companies, personal and small business lenders, BNPL providers | Applications decided consistently, disclosed correctly, funded on time and serviced to the rules |
| **Servicers and collectors** | Companies that bill and collect loans, sometimes for loans they don't own, and agencies that collect after delinquency or charge-off | A loan ledger that allocates every payment the same way every time, and a record of every contact |
| **Credit bureaus and data providers** | Experian, Equifax and TransUnion, the score developers (FICO, VantageScore), consumer reporting agencies for deposit accounts, and data aggregators | Accurate furnished data, permissible purpose on every pull, and disputes answered on time |
| **Investors and funders** | Depositors, warehouse lenders, forward-flow buyers, securitization investors, Fannie Mae, Freddie Mac and Ginnie Mae | Loans that meet the criteria they bought, and reporting they can reconcile |
| **Regulators** | The OCC, the Federal Reserve, the FDIC, NCUA, the CFPB, FinCEN, OFAC, state banking and lending regulators, and attorneys general | Disclosures given, decisions explainable, money where the records say it is, crime reported, and every record on request |

Three splits shape the data model. **Institution versus program.** The bank or credit union holds the deposit and owns the loan on its books; a program is a fintech's product running on that institution's charter, and the same customer may see only the fintech's brand. Every account belongs to exactly one institution and at most one program, and the institution's obligations (CIP, BSA, Reg E, deposit insurance records) follow the account wherever the program puts its logo. **Party versus account.** A person or business is a party; an account is a contract with the institution; the join between them carries the role (owner, joint owner, authorized signer, beneficiary, guarantor, co-borrower), and the role decides insurance coverage, who may move money, and who is liable. **Deposit versus loan versus line.** A deposit is money the institution owes the customer; a loan is money the customer owes on a schedule; a line is a limit the customer can draw and repay (a credit card, a HELOC, a business line). All three are accounts with balances and statements, and the direction of the debt flips how every posting, disclosure and regulation reads.

## How the Money Works

An institution earns money five ways, and most chapters in this volume regulate one of them. The figures below are from filings and agency data as of October 2026; the worked examples are illustrations, labeled as mine.

### The spread

Net interest income is interest earned on loans and securities less interest paid on deposits and borrowings; net interest margin (NIM) is that amount over average earning assets. For all FDIC-insured institutions the second-quarter 2026 NIM was 3.32%, and 3.81% for community banks, on $26.5 trillion of assets and $20.7 trillion of deposits. Credit unions report the same idea against average assets rather than earning assets, so NCUA's figures don't compare directly ([Bank Economics & Balance Sheet Risk](/books/banking-and-lending/bank-economics#net-interest-margin) covers the ratios).

A worked example of my own: a bank funds $1 billion of loans yielding 7.00% with $1 billion of deposits costing 2.00%. It earns $70 million of interest, pays $20 million, and keeps $50 million of net interest income before credit losses, salaries, technology and taxes. When the Federal Reserve cuts rates, loan yields and deposit costs both fall, but not at the same speed; how much of a rate change a bank passes to depositors is its deposit beta, and the spread lives or dies on it.

The data model consequence: interest is earned and owed daily, accrued in the ledger before it is paid, and computed to more decimal places than any customer ever sees. Reg DD lets an institution carry the daily rate and daily interest to five or more decimal places, while the APY earned on a statement uses the two-decimal amount actually paid, so accruals and postings are separate records.

### Fees

Service charges, overdraft and NSF fees, wire and ATM fees, account analysis fees on business accounts, late fees and origination fees on loans. Fees are where much consumer law lands: Reg DD's statement totals for overdraft and returned-item fees, Reg E's opt-in for ATM and one-time debit overdrafts, the CARD Act's limits on card fees, state caps on loan fees. Every fee is a row with the schedule version that produced it (Overdraft, NSF & Fees and Products & Product Configuration cover the rules and the factory).

### Interchange

When a customer pays with a debit or credit card the institution issued, the merchant's side pays the issuer interchange. Regulation II caps debit interchange for issuers with $10 billion or more in assets (with affiliates) at 21 cents plus 0.05% of the transaction, plus a fraud-prevention adjustment of up to 1 cent. On a $50 debit purchase a covered issuer may receive at most 21 + 2.5 + 1 = 24.5 cents; an exempt issuer's interchange is set by the networks. The Federal Reserve's data for 2024 put the average at $0.23 per covered transaction against $0.51 per exempt one.

That gap is a business model. Chime's 10-K says a substantial majority of its revenue comes from interchange; debit interchange alone was 49% of its $2,186.8 million of 2025 revenue, earned on cards issued by The Bancorp Bank and Stride Bank, both under the $10 billion line. The cap itself is moving: on October 26, 2026 the Eighth Circuit affirmed the vacatur of Regulation II's 21-cent standard in *Corner Post v. Board of Governors* and remanded to the Federal Reserve, a decision that takes effect only when the mandate issues, so as of October 2026 the cap still applies (Neobanks & Consumer Fintech tracks the litigation; [The Economics](/books/payments/card-issuing#the-economics) covers how a card program shares interchange).

### Gain on sale

A lender that sells the loans it makes earns the difference between the price an investor pays and the loan's cost to originate, and books it when the loan is sold rather than over its life. UWM originated $163.4 billion of mortgages in 2025 at a total gain margin of 116 basis points. Affirm's fiscal 2026 revenue of $4,261.1 million included $596.6 million of gain on sales of loans beside $2,047.5 million of interest income on the loans it kept, $1,149.9 million of merchant network revenue and $294.0 million of card network revenue: a BNPL lender is mostly a consumer lender, and how much it sells is a funding decision (Funding the Book covers forward flow and securitization).

### Servicing

Whoever services a loan earns a fee for billing, collecting and reporting it, often as a share of the outstanding balance, and the right to that fee on a mortgage is an asset (a mortgage servicing right) that can be bought and sold. UWM reported $724.7 million of loan servicing income in 2025 on a portfolio of $240.8 billion of unpaid principal at year-end. Servicing is why the owner of a loan, the servicer and the institution that originated it are three separate columns on the loan record.

### Credit losses

The cost that defines lending. Under CECL a lender reserves for the losses it expects over a loan's life when it books the loan, then charges off what isn't collected and records recoveries. Affirm's fiscal 2026 provision for credit losses was $796.7 million, about 39% of its interest income (my arithmetic). Some lenders measure new loans at fair value instead, which moves losses into the loan's price (Credit Losses & CECL covers both).

### One rule for all of them

Most of the law in this volume regulates one of these lines: what rate was disclosed and how interest was computed, which fees were charged and whether the customer agreed, how interchange is shared, what was sold to whom, how a payment was applied, when a loss was recognized. My rule: every amount the institution earns or pays is a journal entry, and every customer-visible event is a transaction pointing at its journal entry, so the statement, the GL, the call report and the regulator's sample all read from the same rows. A balance computed any other way can't be reconciled, corrected, or defended.

## The Life of a Deposit

**Opening.** A person applies for a checking account in a bank's app or a fintech's. The application captures the CIP fields (name, date of birth, address, identification number), the system verifies them and screens the person against sanctions lists, a consumer reporting agency for deposit accounts may be checked, and the account is opened under a product version with its disclosures delivered and recorded: the Truth in Savings account disclosure, the Reg E disclosure, the funds availability policy, the privacy notice and, if the customer opts in, the overdraft notice (KYC & Account Opening and Deposit Accounts & Truth in Savings cover each). The account is titled in an ownership category, which decides how the FDIC insures it: $250,000 per depositor, per insured bank, per ownership category.

**Funding.** The customer's employer sends payroll by ACH. The core receives the file, posts a credit, and, for an electronic payment, must make the funds available by the business day after the banking day it received them. A mobile check deposit goes through remote deposit capture, and Reg CC requires the first $275 of a day's ordinary check deposits to be available the next business day, with the rest on a schedule the bank may extend with an exception hold and a notice ([When the Money Is Available](/books/payments/checks#when-the-money-is-available) covers the check side; Funds Availability covers the account).

**Spending.** The customer taps a debit card. The issuer processor asks for an authorization, the core or the program's ledger checks the available balance, and an approval places a hold that reduces available balance without touching the ledger balance; the card network's clearing record later posts the debit and releases the hold. Bill payments, P2P sends and ACH debits post the same way, each a transaction with its own journal entry (Posting, Holds & Balances covers the three balances).

**Earning.** Each night the core accrues interest on the day's balance, and on the crediting date it posts the interest to the account. A worked example of my own: $10,000 kept for a year at a 4.00% rate compounded daily earns $408.08, so the account's APY is 100 × (408.08 / 10,000) = 4.08% under Reg DD's formula for a 365-day term, and the statement's APY earned is computed from the interest actually paid (Interest, APY & Statements covers the formulas).

**Going wrong.** The customer disputes a debit they didn't make. Reg E starts a clock: the error must be investigated and resolved within its deadlines, provisional credit given when the investigation runs long, the result reported, and the customer's liability capped by when they told the bank (Errors & Disputes on Deposit Accounts). A creditor's garnishment order arrives, and before freezing anything the bank must protect the federal benefits (Social Security, VA and similar) directly deposited in the two months before its review (Levies, Garnishments & Legal Process). The account goes quiet for years, and the bank must try to reach the owner before reporting the balance to the state as unclaimed property (Dormancy, Escheat & Closing Accounts).

**Statements and closing.** Every period produces a statement with the transactions, fees, overdraft and returned-item totals, interest and APY earned; each year the bank reports interest on a 1099-INT. The account closes at a zero balance, and the records stay for the retention periods each rule sets.

Across the life, one deposit is a contract (the account and its product version), a set of people (the account parties), a stream of transactions, a set of holds and a balance that must agree with the bank's general ledger every night. When a fintech program sits in between, it agrees with two ledgers, the program's and the bank's, and the FDIC's pass-through rules decide whether the customer is insured at all ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance); Program Ledgers & the Synapse Lesson covers what happens when they don't agree). In the Synapse collapse, the CFPB's complaint charged the middleware with "failing to maintain adequate records of the location of consumers' funds."

## The Life of a Loan

**Application.** A borrower applies for a $20,000 personal loan. The application records who applied, for what, and when it became complete, because the clocks in ECOA, TILA and the mortgage rules start there (Loan Origination). The lender pulls a credit report under a permissible purpose, verifies identity and income, and runs its decision engine: policy rules first (minimum score, maximum debt-to-income, state eligibility, the bank partner's criteria), then a model that scores and prices (Credit Data & Scores, Underwriting & Decision Engines).

**Decision.** The lender approves, counteroffers or declines. Reg B requires notice of the action within 30 days after a completed application; a decline or a counteroffer the applicant doesn't accept is adverse action and needs a notice with the principal reasons, and a decision that used a credit report adds the FCRA disclosures and, where required, the score (Adverse Action & Explaining Decisions). The decision record keeps every input, the model version, the policy version, the outcome and the reasons, because a fair lending exam samples them years later (Fair Lending, HMDA & 1071; Model Risk Management).

**Disclosure and closing.** The approved borrower sees the TILA disclosure (the APR, finance charge, amount financed, total of payments and payment schedule) before becoming obligated, signs electronically, and the loan is funded to their deposit account (APR, Finance Charges & Rate Caps; for mortgages, TRID & Mortgage Disclosures and Closing, eNotes & MERS). If a bank partner originated the loan, the program sends the loan to the bank, the bank funds it, and the program or an investor may buy it days later (Lender Licensing & Bank Partnerships).

**Repayment.** The loan boards to servicing with a schedule. A worked example of my own: $20,000 over 36 months at 12% a year (1% a month) amortizes to a payment of $664.29. The first payment is $200.00 of interest and $464.29 of principal; over the life the borrower pays about $3,914 of interest. Each payment is received, then allocated by the loan's rules (fees, interest, principal, in an order the contract and the law set), and the allocation is stored, not recomputed (Loan Servicing).

**Delinquency and loss.** A missed payment ages the loan through delinquency buckets; the servicer contacts the borrower within Reg F's limits, offers a hardship plan, and reports the status to the bureaus each month in Metro 2 (Collections & Recovery, Furnishing Credit Data). A loan that won't be collected is charged off on the schedule supervisory policy sets, the allowance absorbs it, and any later recovery is booked as one (Credit Losses & CECL). A paid-off loan closes with a payoff, a lien release where there was collateral, and a final report to the bureaus.

**Funding behind it.** Throughout, someone owns the loan: the bank's balance sheet, a warehouse line, a forward-flow buyer, a securitization trust, or, for most US mortgages, a pool guaranteed by Fannie Mae, Freddie Mac or Ginnie Mae. Ownership can change while the borrower's servicer stays the same, and the servicer must report to each owner on its terms (Funding the Book, The Secondary Mortgage Market).

A credit card or a HELOC is a line rather than a loan: the account has a limit, draws and payments post as transactions, interest accrues on a balance computed by the method the agreement discloses, and a statement each cycle sets the minimum payment ([Credit Cards as Credit](/books/banking-and-lending/credit-cards)). The data model treats it as an account with `account_kind = 'line'`, with or without a `loans` row for its terms.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a core's customer information file, a BaaS platform's customer and a lender's borrower are all parties; a core's DDA, a middleware wallet and a servicing system's loan are all accounts; a core's GL posting, a cloud core's posting instruction and a program's ledger transaction are all journal entries. The volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **institution** | `institutions` | A bank or credit union: charter type, primary regulator, FDIC certificate or NCUA charter number, RSSD ID |
| **program** | `programs` | A fintech's product on an institution's charter: the program manager, the bank, the product scope |
| **party** | `parties` | A person or a business |
| **party identity** | `party_identities` | A verified identifier (SSN, EIN, passport, phone, email) with the verification method and KYC result |
| **product** | `products` | A versioned deposit, loan or line product definition: rates, fees, limits, terms, disclosures |
| **account** | `accounts` | One deposit, loan or line account, under one product version, at one institution, in at most one program |
| **account party** | `account_parties` | A party's role on an account: owner, joint owner, authorized signer, beneficiary, guarantor, co-borrower |
| **GL account** | `gl_accounts` | The institution's chart of accounts |
| **journal entry and line** | `journal_entries`, `journal_lines` | Double entry for every money movement, balanced to zero |
| **transaction** | `transactions` | The customer-visible activity row, linked to its journal entry |
| **hold** | `holds` | An amount set aside from available balance, with a reason and an expiry |
| **balance snapshot** | `balance_snapshots` | End-of-day ledger, available and collected balances per account |
| **interest accrual** | `interest_accruals` | Interest earned or owed for a day, before it is posted |
| **fee assessment** | `fee_assessments` | A fee charged, waived or refunded, with the schedule that produced it |
| **statement** | `statements` | A periodic statement as issued |
| **disclosure** | `disclosures` | What was shown or sent, which version, when, and how |
| **application** | `applications` | An application for a deposit account or credit |
| **credit decision** | `credit_decisions` | A decision's inputs, model and policy versions, outcome and reasons |
| **loan** | `loans` | The terms of a loan or line account: principal, rate, term, amortization method |
| **payment schedule and installment** | `payment_schedules`, `schedule_installments` | The schedule a loan is billed on, and each amount due |
| **loan payment and allocation** | `loan_payments`, `payment_allocations` | A payment received, and how it was applied |
| **collateral** | `collateral` | What secures a loan: a vehicle, a property, a deposit, a lien on business assets |
| **case** | `cases` | A dispute, error claim, fraud claim, legal process, complaint or investigation, with its clock and outcome |

Seven splits matter in every chapter:

- **Institution versus program.** The institution is regulated and holds the books; the program is a product on top. A program's customer is still the institution's customer for CIP, BSA, Reg E and insurance purposes, which is why `accounts.institution_id` is never null and `program_id` is optional.
- **Party versus account versus role.** One person can own a checking account, be an authorized signer on her company's account and guarantee its loan. Roles live on `account_parties`, never on the party, and a business's owners and controllers are parties linked to it, not fields on it.
- **Product versus product version versus account.** A product changes; an account opened under version 3 keeps version 3's terms until the institution sends a change-in-terms notice and moves it. Every account points at the exact version it is on.
- **Transaction versus journal entry.** A transaction is what the customer sees ("Payroll, $2,400"); its journal entry is the double-entry truth (debit the settlement GL, credit the customer's deposit liability). A reversal is a new transaction and a new entry, never an edit.
- **Ledger balance versus available balance versus collected balance.** Ledger is posted transactions; available is ledger minus holds plus any funds the institution makes available early; collected is what has actually cleared. They are computed from transactions and holds, and snapshotted at end of day because statements, interest and overdraft decisions read a specific day's value.
- **Accrued versus posted interest.** Interest accrues daily to more precision than money has and posts on a schedule in minor units; the difference is a rounding the institution must handle the same way every time.
- **Owed versus paid versus applied.** A schedule says what is due; a payment says what arrived; an allocation says what it paid off. A loan's balance is the sum of its allocations, not a column someone updated.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)); columns each chapter owns are added there:

```sql
CREATE TABLE institutions (                -- a bank or credit union
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('bank', 'savings_institution',
                        'credit_union', 'industrial_bank', 'trust_bank')),
  charter_type        TEXT NOT NULL CHECK (charter_type IN ('national', 'state_member',
                        'state_nonmember', 'federal_savings', 'state_savings',
                        'federal_credit_union', 'state_credit_union', 'industrial_loan',
                        'national_trust', 'state_trust')),
  primary_regulator   TEXT NOT NULL CHECK (primary_regulator IN ('occ', 'frb', 'fdic',
                        'ncua', 'state')),
  charter_state       CHAR(2),               -- null for a federal charter
  fdic_cert           INT UNIQUE,            -- null for a credit union or uninsured trust bank
  ncua_charter        INT UNIQUE,            -- null for a bank
  rssd_id             INT UNIQUE,            -- the Federal Reserve's identifier
  routing_numbers     TEXT[] NOT NULL DEFAULT '{}',  -- ABA routing numbers it owns
  insured             BOOLEAN NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('active', 'merged', 'failed', 'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE programs (                    -- a fintech's product on an institution's charter
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_manager     TEXT NOT NULL,         -- the brand the customer sees
  middleware          TEXT,                  -- the BaaS platform in between, if any
  name                TEXT NOT NULL,
  product_scope       TEXT[] NOT NULL,       -- e.g. {'deposit', 'debit_card', 'credit_line'}
  agreement_ref       TEXT NOT NULL,         -- the program agreement, as a document
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'live', 'restricted',
                        'winding_down', 'exited')),
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (institution_id, name)
);

CREATE TABLE parties (                     -- a person or a business
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('person', 'business')),
  legal_name          TEXT NOT NULL,
  date_of_birth       DATE,                  -- persons only
  formation_date      DATE,                  -- businesses only
  entity_type         TEXT,                  -- 'llc', 'corporation', 'sole_prop', ...
  status              TEXT NOT NULL CHECK (status IN ('prospect', 'active', 'restricted',
                        'deceased', 'dissolved', 'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind = 'person' OR date_of_birth IS NULL)
);

CREATE TABLE party_identities (            -- verified identifiers and KYC results
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('ssn', 'itin', 'ein', 'passport',
                        'drivers_license', 'phone', 'email', 'address')),
  value_token         TEXT NOT NULL,         -- vaulted; the playbook's sensitive-data rules
  value_last4         TEXT,
  method              TEXT NOT NULL,         -- 'documentary', 'non_documentary', 'ecbsv', ...
  vendor_ref          TEXT,                  -- the verification vendor's result ID
  result              TEXT NOT NULL CHECK (result IN ('verified', 'failed', 'review',
                        'expired')),
  verified_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (party_id, kind, value_token)
);

CREATE TABLE products (                    -- versioned product definitions
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),  -- null: the institution's own product
  code                TEXT NOT NULL,         -- stable across versions, e.g. 'CHK-BASIC'
  version             INT NOT NULL CHECK (version > 0),
  account_kind        TEXT NOT NULL CHECK (account_kind IN ('deposit', 'loan', 'line')),
  category            TEXT NOT NULL,         -- 'checking', 'savings', 'cd', 'personal_loan', ...
  currency            CHAR(3) NOT NULL,
  terms               JSONB NOT NULL,        -- rates, tiers, fees, limits, day count
  valid_during        TSTZRANGE NOT NULL,    -- when new accounts may open on this version
  UNIQUE (institution_id, code, version)
);

CREATE TABLE accounts (                    -- one deposit, loan or line account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),
  product_id          UUID NOT NULL REFERENCES products (id),  -- the exact version
  account_kind        TEXT NOT NULL CHECK (account_kind IN ('deposit', 'loan', 'line')),
  number_token        TEXT NOT NULL,         -- vaulted account number
  number_last4        TEXT NOT NULL,
  ownership_category  TEXT CHECK (ownership_category IN ('single', 'joint', 'retirement',
                        'trust', 'employee_benefit', 'business', 'government')),
  custodial           BOOLEAN NOT NULL DEFAULT FALSE,  -- titled for others: pass-through
  currency            CHAR(3) NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'dormant',
                        'restricted', 'frozen', 'charged_off', 'closed')),
  opened_at           TIMESTAMPTZ,
  closed_at           TIMESTAMPTZ,
  UNIQUE (institution_id, number_token),
  CHECK (account_kind = 'deposit' OR ownership_category IS NULL)
);

CREATE TABLE account_parties (             -- who is on the account, and as what
  account_id          UUID NOT NULL REFERENCES accounts (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  role                TEXT NOT NULL CHECK (role IN ('owner', 'joint_owner',
                        'authorized_signer', 'beneficiary', 'guarantor', 'co_borrower',
                        'beneficial_owner', 'custodian')),
  share               NUMERIC(7, 4),         -- a beneficiary's or co-owner's interest, if stated
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, party_id, role, valid_during)
);

CREATE TABLE gl_accounts (                 -- the institution's chart of accounts
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  number              TEXT NOT NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity',
                        'income', 'expense')),
  normal_side         TEXT NOT NULL CHECK (normal_side IN ('debit', 'credit')),
  report_line         TEXT,                  -- the call report line it rolls up to
  UNIQUE (institution_id, number)
);

CREATE TABLE journal_entries (             -- one balanced money movement
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  kind                TEXT NOT NULL,         -- 'ach_credit', 'card_settlement', 'interest_post', ...
  effective_date      DATE NOT NULL,         -- the business date it counts for
  posted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reverses_id         UUID REFERENCES journal_entries (id),
  source_ref          TEXT,                  -- the file, message or request that caused it
  idempotency_key     TEXT NOT NULL,
  UNIQUE (institution_id, idempotency_key)
);

CREATE TABLE journal_lines (               -- debits and credits; each entry sums to zero
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  gl_account_id       UUID NOT NULL REFERENCES gl_accounts (id),
  account_id          UUID REFERENCES accounts (id),  -- the subledger: null for pure GL lines
  amount              BIGINT NOT NULL CHECK (amount <> 0),  -- debit positive, credit negative
  currency            CHAR(3) NOT NULL
);

CREATE TABLE transactions (                -- what the customer sees
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  kind                TEXT NOT NULL,         -- 'ach_credit', 'card_purchase', 'fee', 'interest', ...
  direction           TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  description         TEXT NOT NULL,         -- as shown on the statement
  counterparty        JSONB,                 -- merchant, originator or payee, as received
  rail                TEXT,                  -- 'ach', 'card', 'wire', 'rtp', 'fednow', 'check', 'book'
  rail_ref            TEXT,                  -- trace number, network reference, IMAD
  effective_date      DATE NOT NULL,
  posted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reverses_id         UUID REFERENCES transactions (id)
);

CREATE TABLE holds (                       -- reduces available balance, not ledger balance
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  reason              TEXT NOT NULL CHECK (reason IN ('card_authorization', 'deposit_availability',
                        'legal_process', 'fraud', 'collateral', 'manual')),
  source_ref          TEXT,                  -- the authorization, deposit or case
  placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ,           -- null: until released
  released_at         TIMESTAMPTZ,
  release_reason      TEXT CHECK (release_reason IN ('settled', 'expired', 'reversed',
                        'released'))
);

CREATE TABLE balance_snapshots (           -- end of day, per account
  account_id          UUID NOT NULL REFERENCES accounts (id),
  business_date       DATE NOT NULL,
  ledger_balance      BIGINT NOT NULL,
  available_balance   BIGINT NOT NULL,
  collected_balance   BIGINT NOT NULL,
  PRIMARY KEY (account_id, business_date)
);

CREATE TABLE interest_accruals (           -- a day's interest, before it posts
  account_id          UUID NOT NULL REFERENCES accounts (id),
  business_date       DATE NOT NULL,
  balance_basis       BIGINT NOT NULL,       -- the balance the rate applied to
  annual_rate         NUMERIC(9, 6) NOT NULL,  -- 0.040000 for 4%
  day_count           TEXT NOT NULL,         -- 'actual_365', 'actual_360', ...
  amount              NUMERIC(20, 6) NOT NULL,  -- minor units, unrounded
  posted_in_id        UUID REFERENCES journal_entries (id),  -- set when credited or billed
  PRIMARY KEY (account_id, business_date)
);

CREATE TABLE fee_assessments (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL,         -- 'overdraft', 'nsf', 'wire', 'late', 'origination', ...
  amount              BIGINT NOT NULL CHECK (amount > 0),
  schedule_ref        TEXT NOT NULL,         -- the product version's fee rule
  trigger_ref         TEXT,                  -- the transaction or event that triggered it
  status              TEXT NOT NULL CHECK (status IN ('assessed', 'waived', 'refunded')),
  transaction_id      UUID REFERENCES transactions (id),
  assessed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE statements (                  -- as issued, never regenerated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  period              DATERANGE NOT NULL,
  opening_balance     BIGINT NOT NULL,
  closing_balance     BIGINT NOT NULL,
  totals              JSONB NOT NULL,        -- interest, APY earned, fees by type, period and YTD
  document_ref        TEXT NOT NULL,         -- object storage key of the rendered statement
  delivered_via       TEXT NOT NULL CHECK (delivered_via IN ('electronic', 'mail')),
  issued_at           TIMESTAMPTZ NOT NULL,
  UNIQUE (account_id, period)
);

CREATE TABLE disclosures (                 -- what was shown or sent, version, when, how
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL,         -- 'truth_in_savings', 'reg_e', 'overdraft_opt_in',
                                             -- 'funds_availability', 'tila', 'adverse_action', ...
  template_version    TEXT NOT NULL,
  party_id            UUID NOT NULL REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  application_id      UUID,                  -- applications, below
  channel             TEXT NOT NULL CHECK (channel IN ('screen', 'email', 'mail', 'in_person',
                        'sms')),
  esign_consent_ref   TEXT,                  -- the E-SIGN consent it relied on, if electronic
  document_ref        TEXT NOT NULL,         -- the rendered document, as delivered
  delivered_at        TIMESTAMPTZ NOT NULL,
  acknowledged_at     TIMESTAMPTZ
);

CREATE TABLE applications (                -- for a deposit account or credit
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),
  product_id          UUID NOT NULL REFERENCES products (id),
  kind                TEXT NOT NULL CHECK (kind IN ('deposit', 'credit')),
  channel             TEXT NOT NULL,         -- 'online', 'branch', 'broker', 'dealer', 'partner'
  requested_amount    BIGINT,
  received_at         TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,           -- when it became a completed application
  status              TEXT NOT NULL CHECK (status IN ('started', 'submitted', 'complete',
                        'decided', 'withdrawn', 'incomplete_closed')),
  account_id          UUID REFERENCES accounts (id)  -- the account it opened, if any
);

CREATE TABLE credit_decisions (            -- inputs, versions, outcome, reasons
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id      UUID REFERENCES applications (id),
  account_id          UUID REFERENCES accounts (id),  -- a line increase or review
  kind                TEXT NOT NULL CHECK (kind IN ('origination', 'counteroffer',
                        'line_change', 'review')),
  policy_version      TEXT NOT NULL,
  model_version       TEXT,
  inputs_ref          TEXT NOT NULL,         -- the frozen input snapshot: reports, attributes
  outcome             TEXT NOT NULL CHECK (outcome IN ('approved', 'counteroffered',
                        'declined', 'referred')),
  terms               JSONB,                 -- amount, rate, term offered
  reasons             TEXT[] NOT NULL DEFAULT '{}',  -- principal reasons, in order
  decided_by          TEXT NOT NULL,         -- 'system' or the underwriter
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (application_id IS NOT NULL OR account_id IS NOT NULL)
);

CREATE TABLE loans (                       -- terms extending a loan or line account
  account_id          UUID PRIMARY KEY REFERENCES accounts (id),
  principal           BIGINT NOT NULL CHECK (principal > 0),  -- original amount or limit
  annual_rate         NUMERIC(9, 6) NOT NULL,
  rate_type           TEXT NOT NULL CHECK (rate_type IN ('fixed', 'variable')),
  index_ref           TEXT,                  -- 'prime', 'sofr_30d_avg' for variable rates
  margin              NUMERIC(9, 6),
  apr                 NUMERIC(9, 6),         -- as disclosed
  term_months         INT,                   -- null for an open-ended line
  amortization        TEXT NOT NULL CHECK (amortization IN ('level_payment',
                        'daily_simple_interest', 'interest_only', 'revolving',
                        'fixed_fee', 'percent_of_sales')),
  owner               TEXT NOT NULL,         -- 'institution', an investor or trust ID
  servicer            TEXT NOT NULL,
  originated_at       DATE NOT NULL,
  maturity_date       DATE
);

CREATE TABLE payment_schedules (           -- a version of what the borrower owes when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  version             INT NOT NULL,          -- a new version on modification or re-amortization
  reason              TEXT NOT NULL,         -- 'origination', 'modification', 'deferral', ...
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (account_id, version)
);

CREATE TABLE schedule_installments (
  payment_schedule_id UUID NOT NULL REFERENCES payment_schedules (id),
  sequence            INT NOT NULL,
  due_date            DATE NOT NULL,
  principal_due       BIGINT NOT NULL,
  interest_due        BIGINT NOT NULL,
  fees_due            BIGINT NOT NULL DEFAULT 0,
  escrow_due          BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (payment_schedule_id, sequence)
);

CREATE TABLE loan_payments (               -- money received against a loan
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  method              TEXT NOT NULL,         -- 'autopay_ach', 'card', 'check', 'payout_withholding'
  received_at         TIMESTAMPTZ NOT NULL,
  effective_date      DATE NOT NULL,         -- the date interest stops on it
  transaction_id      UUID NOT NULL REFERENCES transactions (id),
  status              TEXT NOT NULL CHECK (status IN ('received', 'applied', 'returned',
                        'reversed'))
);

CREATE TABLE payment_allocations (         -- how each payment was applied, stored not recomputed
  loan_payment_id     UUID NOT NULL REFERENCES loan_payments (id),
  bucket              TEXT NOT NULL CHECK (bucket IN ('fees', 'interest', 'principal',
                        'escrow', 'unapplied')),
  amount              BIGINT NOT NULL,
  installment_ref     INT,                   -- the installment it satisfied, if any
  rule_ref            TEXT NOT NULL,         -- the allocation rule version
  PRIMARY KEY (loan_payment_id, bucket, installment_ref)
);

CREATE TABLE collateral (                  -- what secures a loan
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  kind                TEXT NOT NULL CHECK (kind IN ('real_property', 'vehicle', 'deposit',
                        'securities', 'equipment', 'receivables', 'blanket_lien')),
  description         TEXT NOT NULL,
  identifier          TEXT,                  -- VIN, parcel number, account ID
  value               BIGINT,
  valued_at           DATE,
  lien_ref            TEXT,                  -- title, recorded mortgage or UCC-1 filing number
  lien_position       SMALLINT,
  released_at         TIMESTAMPTZ
);

CREATE TABLE cases (                       -- disputes, claims, legal process, complaints
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('reg_e_error', 'reg_cc_claim',
                        'billing_error', 'fraud_claim', 'credit_report_dispute', 'legal_process',
                        'complaint', 'aml_investigation', 'hardship')),
  party_id            UUID REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  opened_at           TIMESTAMPTZ NOT NULL,  -- when notice was received: the clock starts here
  rule_ref            TEXT NOT NULL,         -- the rule whose deadlines apply
  due_at              TIMESTAMPTZ,           -- the next deadline, computed and stored
  status              TEXT NOT NULL CHECK (status IN ('open', 'pending_customer',
                        'resolved', 'closed')),
  outcome             TEXT,
  closed_at           TIMESTAMPTZ
);
```

Design notes:

- **The institution is on every row that matters.** Accounts, products, applications, GL accounts and journal entries carry `institution_id`, because one platform often serves several banks (a core vendor, a BaaS platform, a program that moved banks) and a bank's records must be producible alone. That is the volume's tenancy: [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies) with the institution above the program.
- **Balances are computed, then snapshotted.** Ledger balance is the sum of an account's journal lines; available balance subtracts open holds; both are derived. `balance_snapshots` freezes each business date's values because statements, interest, Reg CC and overdraft decisions are judged against a specific day, and a later correction must not silently rewrite it.
- **Business date is not wall-clock time.** `effective_date` and `business_date` are the institution's processing calendar: a deposit after the cutoff on Friday counts on Monday's business date. Holidays, cutoffs and the difference between a calendar day and a business day are data (Banking Architecture covers the calendar).
- **Precision lives in accruals; money lives in entries.** `interest_accruals.amount` carries six decimal places of a minor unit; posting rounds once into a journal entry, per the rule the product version names, as Reg DD's rounding conventions require.
- **Allocations are facts.** A loan's principal balance is the sum of principal allocations, and `payment_allocations` stores how each payment was applied under the rule in force that day. Recomputing allocations after an allocation rule changes rewrites history the borrower and the bureaus already saw.
- **A disclosure is a record, not a template.** `disclosures` stores the rendered document as delivered, the template version and the channel, with the E-SIGN consent it relied on ([Electronic Signatures](/docs/compliance/electronic-signatures)). Proving what the customer saw is the most common demand an examiner makes.
- **Cases carry their clock.** Reg E, Reg CC, Reg Z billing errors, FCRA disputes and legal process each start a deadline at notice. `cases.opened_at` is when notice arrived, and `due_at` is computed from the rule and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Reuse the Payments model at the edges.** The Payments volume's `bank_accounts` are a provider's own accounts at banks; an FBO account is a `bank_accounts` row to the provider and a custodial `accounts` row to the bank. A Payments `card_accounts` row points at the `accounts` row that carries its balance, and `cards`, `card_programs`, `spend_control_rules` and `cardholder_disputes` stay where [Card Issuing](/books/payments/card-issuing#how-to-build-it) and [Issuer Processing](/books/payments/issuer-processing#how-to-build-it) define them. The provider's `ledger_entries` and the institution's `journal_lines` are two sets of books for the same money, and [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation) is how they are matched.
- **Emit life-cycle events.** `account.opened`, `transaction.posted`, `hold.placed`, `hold.released`, `statement.issued`, `application.completed`, `credit_decision.made`, `loan.boarded`, `loan_payment.applied` and `case.opened` are what notifications, monitoring, reporting and the bureaus subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine. The chapters and the tables each one extends are below; each chapter's How to Build It names the tables it adds:

| Chapter | Extends |
| --- | --- |
| [The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it) | `institutions`; adds `institution_events`, `technology_providers`, `institution_providers` |
| Bank Economics & Balance Sheet Risk | `gl_accounts`, `balance_snapshots`, `interest_accruals` |
| Charters & Regulators | `institutions` |
| Starting a Bank | `institutions`, `programs` |
| Exams, Ratings & Call Reports | `institutions`, `gl_accounts` |
| When Banks Fail | `institutions`, `accounts`, `account_parties` |
| Core Banking Systems | `gl_accounts`, `journal_entries`, `journal_lines`, `accounts` |
| Posting, Holds & Balances | `transactions`, `holds`, `balance_snapshots`, `journal_entries` |
| Interest, APY & Statements | `interest_accruals`, `statements`, `products` |
| Products & Product Configuration | `products`, `accounts`, `disclosures` |
| Core Modernization & Conversions | `accounts`, `journal_lines`, `balance_snapshots` |
| Deposit Accounts & Truth in Savings | `products`, `accounts`, `disclosures` |
| Deposit Insurance | `accounts`, `account_parties`, `programs` |
| Funds Availability | `holds`, `transactions`, `disclosures` |
| Overdraft, NSF & Fees | `fee_assessments`, `transactions`, `holds`, `disclosures` |
| Errors & Disputes on Deposit Accounts | `cases`, `transactions`, `journal_entries` |
| Dormancy, Escheat & Closing Accounts | `accounts`, `transactions`, `disclosures` |
| Levies, Garnishments & Legal Process | `cases`, `holds`, `accounts` |
| KYC & Account Opening | `parties`, `party_identities`, `applications` |
| BSA/AML Programs | `transactions`, `cases`, `parties` |
| Sanctions Screening | `parties`, `party_identities`, `transactions` |
| Account Takeover & Scams | `cases`, `transactions`, `party_identities` |
| Neobanks & Consumer Fintech | `programs`, `accounts` |
| Banking as a Service | `programs`, `institutions`, `accounts` |
| Program Ledgers & the Synapse Lesson | `programs`, `accounts`, `journal_lines`, `balance_snapshots` |
| Sponsor Bank Oversight | `programs`, `cases` |
| Earned Wage Access | `products`, `accounts`, `fee_assessments` |
| Credit Builders & Secured Products | `loans`, `accounts`, `collateral` |
| Open Banking in the US | `parties`, `accounts`, `disclosures` |
| Open Banking in the UK & EU | `parties`, `accounts`, `disclosures` |
| [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) | `loans`; adds `pricing_grids`, `pricing_grid_cells`, `loan_pricing`, `loan_economics_monthly` |
| [Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-to-build-it) | `accounts`, `loans`, `interest_accruals`, `fee_assessments`, `statements`; adds `credit_lines`, `balance_segments`, `billing_cycles`, `segment_daily_balances`, `rate_changes`, `credit_limit_changes` |
| [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) | `loans`, `payment_schedules`, `schedule_installments`; adds `loan_disbursements`, `payoff_quotes`, `rate_cap_rules`, `rate_cap_evaluations`, `payment_transfer_attempts` |
| [Auto Lending](/books/banking-and-lending/auto-lending#how-to-build-it) | `loans`, `collateral`; adds `dealers`, `dealer_agreements`, `indirect_contracts`, `contract_products`, `product_refunds`, `leases`, `lien_records`, `repossessions` |
| Mortgages & Home Equity | `loans`, `collateral`, `applications` |
| Student Loans | `loans`, `payment_schedules` |
| Buy Now, Pay Later | `loans`, `payment_schedules`, `disclosures` |
| Small Business Lending | `loans`, `collateral`, `account_parties` |
| Embedded Lending | `loans`, `loan_payments`, `programs` |
| Commercial Lending | `loans`, `collateral`, `account_parties` |
| Loan Origination | `applications`, `parties`, `disclosures` |
| Credit Data & Scores | `applications`, `credit_decisions`, `party_identities` |
| Underwriting & Decision Engines | `credit_decisions`, `applications` |
| Adverse Action & Explaining Decisions | `credit_decisions`, `disclosures` |
| Fair Lending, HMDA & 1071 | `applications`, `credit_decisions` |
| Model Risk Management | `credit_decisions` |
| APR, Finance Charges & Rate Caps | `loans`, `products`, `disclosures` |
| TRID & Mortgage Disclosures | `applications`, `disclosures` |
| Closing, eNotes & MERS | `loans`, `collateral`, `disclosures` |
| Loan Servicing | `loans`, `loan_payments`, `payment_allocations`, `payment_schedules` |
| Mortgage Servicing, Escrow & Loss Mitigation | `loans`, `schedule_installments`, `cases` |
| Furnishing Credit Data | `accounts`, `loans`, `cases` |
| Collections & Recovery | `loans`, `schedule_installments`, `cases` |
| Credit Losses & CECL | `loans`, `gl_accounts`, `journal_entries` |
| Funding the Book | `loans`, `programs`, `journal_entries` |
| The Secondary Mortgage Market | `loans`, `collateral` |
| Lender Licensing & Bank Partnerships | `institutions`, `programs`, `products` |
| Business Accounts & Startup Banking | `parties`, `account_parties`, `accounts` |
| Sweeps, Reciprocal Deposits & Yield | `accounts`, `balance_snapshots`, `institutions` |
| Treasury Management | `accounts`, `transactions`, `fee_assessments` |
| The Spend Management Business | `programs`, `accounts`, `fee_assessments` |
| Corporate Cards & Underwriting | `accounts`, `credit_decisions`, `collateral`, Payments' `card_accounts` |
| Virtual Cards & Spend Controls | Payments' `cards` and `spend_control_rules` |
| Receipts, Expense Policy & Audit | `transactions` |
| Reimbursements, Mileage & Per Diem | `transactions`, `parties` |
| AP, Bill Pay & Procurement | `parties`, `transactions` |
| Business Travel & Duty of Care | `transactions` |
| Accounting Sync & the Close | `gl_accounts`, `transactions` |
| Banking Architecture | every table, the playbook's `outbox_events` |
| Digital & Mobile Banking | `parties`, `accounts`, `disclosures` |
| Regulatory Reporting & Data | `gl_accounts`, `applications`, `cases` |
| Security, Resilience & Incident Notice | `institutions`, `programs` |
| AI in Banking & Lending | `credit_decisions`, `cases` |
| Banking & Lending Metrics | `balance_snapshots`, `loans`, `schedule_installments` |

Three decisions keep the map one model rather than several:

- **One account table for every direction of debt.** A checking account, a personal loan, a credit card and a HELOC are all `accounts` rows; `loans` extends the ones with lending terms. Splitting deposits and loans into separate systems is the history core modernization is still undoing, and one table lets a customer's whole relationship, a secured card's deposit and its line, or a sweep and its source account be one query.
- **One case table for every clock.** Reg E errors, credit report disputes, levies, complaints and AML investigations differ in their rules, not their shape: a notice, a deadline, work, an outcome. Each chapter adds its own detail table keyed by `cases.id` rather than a parallel queue.
- **One disclosure table for every notice.** Account disclosures, change-in-terms notices, adverse action notices, TILA and TRID forms and privacy notices are all `disclosures` rows, so "show me everything this customer was told" is one query.

## Auditing

The records in this chapter are the ones examiners, auditors, the FDIC, investors and courts ask about later:

- **Whose money is where.** Every account with its institution, program, ownership category, custodial flag and parties over time, so an insurance determination or a program exit can be run from the records alone.
- **Every money movement, balanced.** Every journal entry with lines that sum to zero, its business date, its source and its reversal, and every transaction pointing at one; the GL must tie to the sum of account subledgers every day ([Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger)).
- **What the customer was told.** Every disclosure as delivered, with its version, channel and consent, and every statement as issued.
- **How every decision was made.** Every credit decision with its frozen inputs, policy and model versions, outcome and reasons, and every fee with the schedule that produced it.
- **Every clock and how it ended.** Every case with when notice arrived, the deadline the rule set, the actions taken and the outcome.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Put the institution on every account, product and entry,** and treat a program as a product on the institution's charter, never as the holder of the account.
- **Model parties, accounts and roles separately,** with roles effective-dated on the join, because insurance, authority and liability all follow the role.
- **Pin every account to a product version** and move it only with a recorded change-in-terms notice.
- **Make every money movement a balanced journal entry** and every customer-visible row a transaction that points at one; reverse, never edit.
- **Compute ledger, available and collected balances** from entries and holds, and snapshot them per business date.
- **Accrue interest daily at full precision** and round once when it posts.
- **Store payment allocations** as they were made, under the rule in force that day.
- **Record every disclosure as delivered** and every decision with its inputs and versions.
- **Start every regulatory clock at notice** and store its deadline.
- **Reuse the Payments model** for the provider's bank accounts, cards and card disputes instead of rebuilding it.

## References

**Law and regulation**

- [12 CFR 1030, Appendix A (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/a/), the APY formula, its worked examples, and carrying daily rates and interest to five or more decimal places
- [12 CFR 229.10 (Regulation CC)](https://www.law.cornell.edu/cfr/text/12/229.10), next-day availability for electronic payments and the first $275 of other check deposits
- [12 CFR 235.3 (Regulation II)](https://www.law.cornell.edu/cfr/text/12/235.3), the 21-cent plus 0.05% debit interchange standard
- [12 CFR 235.4 (Regulation II)](https://www.law.cornell.edu/cfr/text/12/235.4), the fraud-prevention adjustment of up to 1 cent
- [12 CFR 235.5 (Regulation II)](https://www.law.cornell.edu/cfr/text/12/235.5), the exemption for issuers under $10 billion in assets with affiliates
- [31 CFR 1020.220](https://www.law.cornell.edu/cfr/text/31/1020.220), the minimum identifying information a bank obtains before opening an account
- [31 CFR 212.3](https://www.law.cornell.edu/cfr/text/31/212.3), the two-month lookback and protected amount for federal benefits on garnishment
- [12 CFR 1002.9 (Regulation B)](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), notice of action within 30 days after a completed application

**Regulators and data**

- [FDIC: Quarterly Banking Profile, second quarter 2026](https://www.fdic.gov/news/speeches/2026/fdic-quarterly-banking-profile-second-quarter-2026), insured institutions, community banks, net interest margins
- [FDIC: Quarterly Banking Profile, second quarter 2026 (full report)](https://www.fdic.gov/quarterly-banking-profile/quarterly-banking-profile-second-quarter-2026.pdf), industry assets and deposits
- [NCUA: Quarterly Credit Union Data Summary, 2026 Q2](https://www.ncua.gov/files/publications/analysis/quarterly-data-summary-2026-Q2.pdf), federally insured credit unions and members
- [FDIC: Understanding Deposit Insurance](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance), $250,000 per depositor, per ownership category, per bank, and the categories
- [Federal Reserve: Average Debit Card Interchange Fee by Payment Card Network](https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm), 2024 averages for covered and exempt transactions
- [CFPB: Synapse Financial Technologies, Inc. enforcement action](https://www.consumerfinance.gov/enforcement/actions/synapse-financial-technologies-inc/), the records-of-funds allegation and the stipulated judgment

**Filings**

- [Chime Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1795586/000179558626000013/chym-20251231.htm), revenue, debit interchange share and partner banks
- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), revenue by line and the provision for credit losses
- [UWM Holdings: Fourth quarter and full year 2025 results](https://investors.uwm.com/news/financial-news/news-details/2026/UWM-Holdings-Corporation-Announces-Fourth-Quarter--Full-Year-2025-Results/default.aspx), originations, gain margin, servicing income and MSR unpaid principal

**Courts**

- [Consumer Finance Monitor: Eighth Circuit invalidates the Federal Reserve's 21-cent debit interchange cap (October 28, 2026)](https://www.consumerfinancemonitor.com/2026/10/28/eighth-circuit-invalidates-federal-reserves-21-cent-debit-card-interchange-fee-cap-holding-that-the-durbin-amendment-requires-a-transaction-specific-cost-analysis/), the October 26, 2026 affirmance in Corner Post, the remand and the mandate
