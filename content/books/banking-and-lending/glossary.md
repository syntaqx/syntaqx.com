+++
title = "Banking & Lending Glossary"
nav_title = "Glossary"
description = "Every banking and lending term by part: the business, the core, deposits, financial crime, fintech, lending, underwriting, servicing, funding and spend."
category = "Banking & Lending Industry"
order = 2499
part = "Reference"
tags = ["banking", "lending", "glossary", "reference"]
+++

Banking borrows its words from accounting, law and a century of bank operations, and the same word shifts with context: a hold is a card authorization on one screen and a garnishment freeze on another, a balance is ledger, available or collected depending on who asks, a program is a fintech's product to a sponsor bank and a card network's portfolio to an issuer, and "margin" means one thing in a bank's NIM and another in a credit union's report to NCUA. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. Terms the [Payments](/books/payments/glossary) glossary already defines keep its definition. The volume's own names for the core records (institution, program, party, party identity, product, account, account party, GL account, journal entry, transaction, hold, balance snapshot, interest accrual, fee assessment, statement, disclosure, application, credit decision, loan, payment schedule, loan payment, payment allocation, collateral, case) are the ones in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model).

## The Business

- **Account:** one deposit, loan or line contract with one institution, under one product version and in at most one program ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Account party:** a party's role on an account (owner, joint owner, authorized signer, beneficiary, guarantor, co-borrower), effective-dated, deciding insurance, authority and liability ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Available balance:** ledger balance less open holds, plus any funds the institution makes available early; what the customer can spend now ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Balance snapshot:** an account's ledger, available and collected balances frozen for one business date, which statements, interest and overdraft decisions read ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Case:** a dispute, error claim, fraud claim, legal process, complaint or investigation, with the time notice arrived, the rule's deadline and the outcome ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Collected balance:** the part of an account's balance that has actually cleared ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Community bank:** the FDIC's category for smaller, relationship-focused banks; 3,818 of 4,238 insured institutions at June 30, 2026 ([The Banking Landscape](/books/banking-and-lending/banking-landscape#banks-by-size)).
- **Credit decision:** the record of an approval, counteroffer or decline with its frozen inputs, policy and model versions, outcome and principal reasons ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Credit union:** a member-owned cooperative depository chartered by NCUA or a state and insured by the NCUSIF; 4,214 federally insured at June 30, 2026 ([The Banking Landscape](/books/banking-and-lending/banking-landscape#credit-unions)).
- **Deposit beta:** the share of a change in the policy rate that a bank passes on to its depositors' rates ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-spread)).
- **Disclosure:** a record of what was shown or sent to a customer: the template version, the rendered document, the channel, the time and the E-SIGN consent relied on ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Exempt issuer:** a debit card issuer with less than $10 billion in assets with its affiliates, outside Regulation II's interchange cap ([The Banking & Lending Business](/books/banking-and-lending/banking-business#interchange)).
- **FDIC certificate number:** the FDIC's identifier for an insured institution, the key to its public data ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)).
- **Field of membership:** the definition of who may join a credit union, checked as an account opening rule ([The Banking Landscape](/books/banking-and-lending/banking-landscape#credit-unions)).
- **Gain on sale:** the difference between what an investor pays for a loan and its cost to originate, booked when the loan is sold ([The Banking & Lending Business](/books/banking-and-lending/banking-business#gain-on-sale)).
- **GL account:** an account in the institution's chart of accounts, with its type, normal side and call report line ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Hold (deposit account):** an amount set aside from an account's available balance without changing its ledger balance, for a card authorization, deposit availability, legal process, fraud or collateral, with an expiry ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).
- **Independent mortgage company:** a nonbank mortgage lender; 63.1% of home-purchase loans in 2023 HMDA data ([The Banking Landscape](/books/banking-and-lending/banking-landscape#nonbank-lenders)).
- **Institution:** a bank or credit union, with its charter type, primary regulator, FDIC certificate or NCUA charter number and RSSD ID ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Institution event:** a dated merger, acquisition, failure, charter conversion, name change or core conversion, with the routing numbers it moved and its source ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)).
- **Interchange:** the fee the acquirer pays the issuer on every card transaction, set by the networks' tables ([The Banking & Lending Business](/books/banking-and-lending/banking-business#interchange)).
- **Interest accrual:** a day's interest on an account, computed at full precision before it posts as a journal entry ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Journal entry:** one balanced money movement in the institution's books, with lines that sum to zero, a business date, a source and an idempotency key ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Ledger balance:** the sum of an account's posted transactions ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Line:** an account with a limit the customer can draw and repay, such as a credit card, a HELOC or a business line of credit ([The Banking & Lending Business](/books/banking-and-lending/banking-business#who-s-who)).
- **Loan:** the lending terms that extend a loan or line account: principal, rate, term, amortization method, owner and servicer ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Middleware (BaaS platform):** software between fintech programs and banks that provides accounts, cards, payments and a subledger as an API ([The Banking & Lending Business](/books/banking-and-lending/banking-business#who-s-who)).
- **Mortgage servicing right (MSR):** the right to service a mortgage and collect its servicing fee, an asset that can be bought and sold ([The Banking & Lending Business](/books/banking-and-lending/banking-business#servicing)).
- **Neobank:** a consumer fintech offering bank accounts in its own brand, either as a program manager on sponsor banks or with its own charter ([The Banking Landscape](/books/banking-and-lending/banking-landscape#neobanks)).
- **Net interest income:** interest earned on loans and securities less interest paid on deposits and borrowings ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-spread)).
- **Net interest margin (NIM):** net interest income over average earning assets; 3.32% for FDIC-insured institutions in the second quarter of 2026 ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-spread)).
- **Ownership category:** the FDIC's classification of how a deposit is held (single, joint, retirement, trust, employee benefit, business, government), each insured separately ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).
- **Party:** a person or business, independent of any account ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Party identity:** a verified identifier for a party, with the method, the vendor's result and when it was verified ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Product version:** one immutable set of a product's rates, fees, limits and terms; an account stays on its version until moved with notice ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Program:** a fintech's product on an institution's charter, with its program manager, any middleware and its product scope ([The Banking & Lending Business](/books/banking-and-lending/banking-business#who-s-who)).
- **Program manager (banking program):** the company that designs, markets and services a deposit, card or lending product on a sponsor bank's charter ([The Banking & Lending Business](/books/banking-and-lending/banking-business#who-s-who)).
- **Regulation II:** the Federal Reserve's rule capping debit interchange for issuers of $10 billion or more at 21 cents plus 0.05% plus a fraud-prevention adjustment of up to 1 cent; its 21-cent standard was held invalid by the Eighth Circuit on October 26, 2026, pending the mandate ([The Banking & Lending Business](/books/banking-and-lending/banking-business#interchange)).
- **RSSD ID:** the Federal Reserve's identifier for a financial institution, used across its releases and structure data ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)).
- **Servicer:** the company that bills, collects and reports a loan, which may not own it ([The Banking & Lending Business](/books/banking-and-lending/banking-business#servicing)).
- **Sponsor bank (deposits and lending):** a bank that holds the accounts and issues the cards and loans of a fintech program, and carries the program's regulatory obligations ([The Banking Landscape](/books/banking-and-lending/banking-landscape#sponsor-banks-and-baas)).
- **Technology provider:** a core, digital banking, origination, card processing or BaaS vendor, recorded with which institutions run it and when ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)).
- **Transaction:** the customer-visible activity row on an account, linked to the journal entry that is its double-entry truth ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).

## The Core

- **APY earned:** the yield an account actually earned over a statement period, from the interest paid and the average daily balance, shown on the periodic statement ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#apy-earned-the-statement-formula)).
- **Average daily balance method:** interest computed by applying a periodic rate to the average of the period's daily balances; with the daily balance method, one of the two Regulation DD allows ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#balance-methods)).
- **Bank Service Company Act:** the statute making services a bank buys by contract, such as a hosted core, examinable as if the bank performed them itself (12 USC 1867) ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#hosted-in-house-and-cloud-native)).
- **Batch core:** a core that memo posts during the day and hard posts, accrues and rolls the business date in a nightly batch ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#batch-cores-and-real-time-cores)).
- **Block (deposit account):** a reduction of available balance that lasts until someone releases it, as for legal process or fraud, as opposed to a hold that expires ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#holds-and-blocks)).
- **Booking date, value date:** when an entry posts to the books, and the date it counts from for interest, fees and availability; a backdated correction has a past value date and today's booking date ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#effective-dates-and-backdating)).
- **Change in terms:** a change to a disclosed account term; adverse changes to consumer deposit terms need 30 days' notice (Reg DD) and significant changes to open-end credit 45 (Reg Z) ([Products & Product Configuration](/books/banking-and-lending/product-configuration#changing-terms-on-existing-accounts)).
- **Coexistence:** running two cores at once during a progressive migration, with each account's system of record held as data and every integration routing by it ([Core Modernization & Conversions](/books/banking-and-lending/core-modernization#coexistence-and-the-system-of-record)).
- **Compounding:** interest earning interest, at crediting or daily on accrued interest; the disclosed APY must reflect the frequency the account uses ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#compounding)).
- **Conversion (core):** moving an institution's accounts, history and obligations in flight from one core to another, usually over a weekend after rehearsals ([Core Modernization & Conversions](/books/banking-and-lending/core-modernization#conversion-weekends)).
- **Core banking system:** the system of record for an institution's accounts, postings and general ledger, usually a vendor's product hosted by the vendor ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-the-platforms-do-it)).
- **Crediting (interest):** moving accrued interest into the account's balance, where it becomes spendable and, for tax, paid; rounding happens here, once ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#accrual-is-daily)).
- **Day count convention:** the rule that turns an annual rate into a daily one: Actual/365, Actual/360, 30/360 or Actual/Actual ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#day-count-conventions)).
- **End of day (EOD):** the ordered sequence that closes a business date: hard posting, item fees, accrual, date-driven events, snapshots, GL proofs, files out and the date roll ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date)).
- **Float:** deposited items credited to the ledger but not yet collected from the paying bank; ledger balance minus float is the collected balance ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#three-balances)).
- **GL mapping:** the configuration that says which general ledger accounts each kind of activity on each product version debits and credits ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers)).
- **Grandfathering:** leaving existing accounts on an older product version when the product changes ([Products & Product Configuration](/books/banking-and-lending/product-configuration#grandfathering)).
- **Hard posting:** recording a transaction in the ledger with its journal entry, final except by reversal ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#memo-posting-and-hard-posting)).
- **Memo posting:** recording an item that changes available balance before it reaches the ledger, such as a card authorization or a deposit under review ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#memo-posting-and-hard-posting)).
- **Posting order:** the order a core posts a day's items in, which decides how many overdraw an account near zero; high-to-low ordering was the subject of the overdraft litigation ([Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#posting-order)).
- **Product factory:** the part of a core that defines products: rates, tiers, fees, limits, maturity, dormancy and GL mapping ([Products & Product Configuration](/books/banking-and-lending/product-configuration#the-product-factory)).
- **Progressive migration:** replacing a core in slices (by product, by component, or greenfield beside it) rather than in one big-bang conversion ([Core Modernization & Conversions](/books/banking-and-lending/core-modernization#big-bang-or-progressive)).
- **Real-time core:** a core that hard posts each transaction as it happens, keeping end of day for accrual, fees and statements ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#batch-cores-and-real-time-cores)).
- **Subledger proof:** the daily check that the sum of account balances on a product equals its GL control line ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it)).
- **Subledger:** per-account detail beneath the general ledger, which must sum to the GL's balances every day ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).
- **Tiering method A, B:** Regulation DD's two tiered-rate shapes: the whole balance earns its tier's rate (A), or each slice earns its own tier's rate (B) ([Interest, APY & Statements](/books/banking-and-lending/interest-and-statements#balance-methods)).

## Deposits

- **APSN (authorize positive, settle negative):** charging an overdraft fee when a card purchase approved against a positive available balance settles against a negative one ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#which-balance-decides)).
- **APY (annual percentage yield):** the yearly yield on a deposit including compounding, computed by Regulation DD's formula from interest over principal and days in the term ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).
- **Banking day, business day:** the part of a business day a bank office is open for substantially all its business, when a deposit is received; and any weekday that isn't a federal holiday, which availability deadlines count ([Funds Availability](/books/banking-and-lending/funds-availability#what-the-schedule-covers)).
- **Certificate of deposit (CD, share certificate):** a time deposit with a maturity of at least seven days, a disclosed early withdrawal penalty and a renewal policy ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#the-four-shapes)).
- **Deposit insurance:** FDIC coverage of $250,000 per depositor, per insured bank, per ownership category ([Deposit Insurance](/books/banking-and-lending/deposit-insurance)).
- **Early withdrawal penalty:** what a time deposit charges for withdrawing before maturity, usually days of interest on the amount withdrawn; at least seven days' simple interest within six days of deposit ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#worked-numbers-an-early-withdrawal)).
- **Exception hold:** holding a deposit beyond Regulation CC's schedule under one of six exceptions (new account, large deposit, redeposit, repeated overdrafts, reasonable cause, emergency), with a notice ([Funds Availability](/books/banking-and-lending/funds-availability#exception-holds)).
- **Grace period (time deposit):** the days after a CD matures and renews during which the depositor can withdraw or change terms without penalty, commonly ten ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#maturity-and-renewal)).
- **Money market deposit account (MMDA):** a savings deposit with tiered rates and limited check writing; a deposit, unlike a money market fund ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#the-four-shapes)).
- **NSF (nonsufficient funds) fee, returned item fee:** a fee for refusing to pay a check or ACH debit and returning it, dropped by many large banks since 2022 ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#how-the-platforms-do-it)).
- **Overdraft (discretionary):** a bank paying an item the balance doesn't cover, at its discretion, for a per-item fee that isn't a finance charge unless agreed in writing ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#the-product-lines)).
- **Overdraft opt-in:** the consumer's affirmative consent, after the Model Form A-9 notice, without which no fee may be charged for an ATM or one-time debit card overdraft ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#the-opt-in)).
- **Ownership category:** the legal capacity an account is held in (single, joint, retirement, trust, employee benefit, business, government), each insured separately ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-ownership-categories)).
- **Part 370:** the FDIC rule requiring banks with 2 million or more deposit accounts to compute every account's insured amount within 24 hours of failure ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#how-a-bank-computes-insured-amounts)).
- **Pass-through insurance:** FDIC coverage that reaches each owner of a pooled custodial account, if the records allow it ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#pass-through-coverage)).
- **POD (payable on death) account:** an informal revocable trust account whose named beneficiaries take the balance at the owner's death, insured in the trust category ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-2024-trust-rule)).
- **Reasonable period:** the extension Regulation CC presumes reasonable when an exception applies, up to one business day for on-us checks and five for other checks ([Funds Availability](/books/banking-and-lending/funds-availability#exception-holds)).
- **Regulation CC:** US funds availability and check collection rules ([Funds Availability](/books/banking-and-lending/funds-availability)).
- **Regulation D:** the Federal Reserve rule defining transaction accounts, savings deposits and time deposits, without the six-transfer limit since April 2020 ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#regulation-d-after-2020)).
- **Regulation DD (Truth in Savings):** the consumer deposit disclosure rule: account disclosures, change and maturity notices, statements and advertising; Part 707 for credit unions ([Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#truth-in-savings)).
- **Re-presentment:** a payee presenting a returned check or ACH debit again, which can draw a fresh NSF fee unless the bank links it to the original ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#re-presentment)).
- **Trust rule (2024):** the FDIC formula insuring trust accounts at $250,000 per eligible beneficiary per owner, up to five ($1,250,000), from April 1, 2024; credit unions from December 1, 2026 ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-2024-trust-rule)).

## Financial Crime

- **CIP (Customer Identification Program):** the rule that a bank obtain at least a name, date of birth, address and identification number before opening an account, and verify them ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).

## Fintech and BaaS

- **FBO account (for-benefit-of):** a bank account in the provider's name holding money for its merchants ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).
- **Pass-through insurance:** FDIC coverage that reaches each owner of a pooled custodial account, if the records allow it ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).

## Lending Products

- **Amortization (level payment):** repaying a loan in equal periodic payments whose interest share falls and principal share rises over the term ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-loan)).
- **Amortized cost:** measuring a loan at its principal adjusted for deferred fees and costs, with a CECL allowance for expected losses booked at origination ([The Lending Business](/books/banking-and-lending/lending-business#amortized-cost-or-fair-value)).
- **Average daily balance:** the sum of a card balance at the end of each day in the cycle divided by the days in the cycle, to which the daily periodic rate applies ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#interest-calculation-methods)).
- **Balance segment:** a part of a card balance with its own rate and rules: purchases, cash advances, balance transfers, promotional, deferred interest, penalty ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#balance-segments-and-aprs)).
- **Buy rate (indirect auto):** the risk-based rate at which a lender will buy a dealer's retail installment contract; not the Payments volume's partner buy rate ([Auto Lending](/books/banking-and-lending/auto-lending#direct-and-indirect-lending)).
- **Captive finance company:** a manufacturer's own lender, which carries the parent's subsidized rates, leases and dealer floorplan ([Auto Lending](/books/banking-and-lending/auto-lending#captive-finance)).
- **Charge card:** a card whose balance is due in full each cycle, so it carries no revolving balance or interest ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-the-platforms-do-it)).
- **Cost of funds:** what the money a lender lends costs it: deposit rates for a bank, facility and securitization spreads for a nonbank ([The Lending Business](/books/banking-and-lending/lending-business#cost-of-funds)).
- **Daily simple interest:** interest accrued each day on the outstanding principal, so early payments save interest and late ones cost it ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-interest-accrues)).
- **Dealer reserve (participation):** the lender's payment to a dealer for a contract, usually a share of the interest from marking the contract rate above the buy rate ([Auto Lending](/books/banking-and-lending/auto-lending#dealer-markup-and-participation)).
- **Deferred interest:** a promotion under which interest accrues but is waived if the balance is paid in full by the end of the period, and charged if not; not a grace period ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#balance-segments-and-aprs)).
- **Double-cycle billing:** charging interest on the previous cycle's balance after a grace period is lost; barred by Regulation Z ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#grace-periods)).
- **Fair value (loans):** measuring a loan each period at what it would sell for, with expected losses in the price and changes in earnings ([The Lending Business](/books/banking-and-lending/lending-business#amortized-cost-or-fair-value)).
- **GAP (guaranteed asset protection):** insurance or a debt cancellation waiver that covers what's owed beyond a totaled or stolen vehicle's value, refundable when it stops providing a benefit ([Auto Lending](/books/banking-and-lending/auto-lending#gap-and-add-on-products)).
- **Grace period:** the time after a card statement during which new purchases accrue no interest if the statement balance is paid in full ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#grace-periods)).
- **Holder Rule:** the FTC rule requiring consumer credit contracts from a sale to carry a notice that any holder takes them subject to the buyer's claims against the seller ([Auto Lending](/books/banking-and-lending/auto-lending#direct-and-indirect-lending)).
- **Indirect lending:** lending through a dealer, which submits the application, writes the contract as original creditor and assigns it to the lender ([Auto Lending](/books/banking-and-lending/auto-lending#direct-and-indirect-lending)).
- **Minimum payment warning:** the card statement box showing how long and how much it takes to repay paying only the minimum, and the 36-month alternative ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#minimum-payments)).
- **Money factor:** a lessor's rent charge per dollar of capitalized cost plus residual, per month; a lease rate that may not be called an APR ([Auto Lending](/books/banking-and-lending/auto-lending#leases)).
- **Origination fee:** a fee charged at funding, usually deducted from the proceeds, which is a finance charge and raises the APR above the interest rate ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#origination-fees-and-the-apr)).
- **Payday alternative loan (PAL):** a federal credit union's small-dollar loan under NCUA rules: PAL I up to $1,000 over 6 months, PAL II up to $2,000 over 12 ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#small-dollar-and-payday-loans)).
- **Penalty APR:** a higher rate a card issuer may apply to an existing balance only after a payment is more than 60 days late, reversed after six on-time payments ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#the-card-act-rules)).
- **Residual value:** a leased vehicle's estimated value at the end of the term, which the lessor carries the risk of under a closed-end lease ([Auto Lending](/books/banking-and-lending/auto-lending#leases)).
- **Retail installment contract (RIC):** a credit sale contract a dealer writes with the buyer as original creditor and then assigns to a lender ([Auto Lending](/books/banking-and-lending/auto-lending#direct-and-indirect-lending)).
- **Rule of 78s:** a rebate method that front-loads earned interest on a precomputed loan; barred for consumer terms over 61 months ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-interest-accrues)).
- **Subvention:** a manufacturer's payment to its captive to offer below-market loan rates or lease terms ([Auto Lending](/books/banking-and-lending/auto-lending#captive-finance)).
- **Vintage:** the month or quarter a loan was originated, the cohort its losses are read by ([The Lending Business](/books/banking-and-lending/lending-business#credit-losses)).
- **Yield (loan):** what a loan portfolio earns as a rate on its average balance, interest plus fees that are part of the cost of credit ([The Lending Business](/books/banking-and-lending/lending-business#yield)).

## Business Lending

- **Merchant cash advance (MCA):** a purchase of a business's future receivables, repaid as a share of its sales, which the provider treats as not a loan ([The Banking Landscape](/books/banking-and-lending/banking-landscape#sponsor-banks-and-baas)).

## Origination and Underwriting

- **Adverse action:** a decline, or a counteroffer the applicant doesn't accept, which requires a notice with the principal reasons ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-loan)).

## Servicing and Collections

- **Charge-off:** removing a loan the lender doesn't expect to collect from its books against the allowance, with any later collections booked as recoveries ([The Banking & Lending Business](/books/banking-and-lending/banking-business#credit-losses)).
- **Payment allocation:** how one loan payment was applied to fees, interest, principal and escrow under the rule in force that day, stored rather than recomputed ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-loan)).

## Funding and Licensing

- **Forward flow:** an agreement under which an investor buys a lender's loans as they are made, on agreed criteria ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-loan)).

## Business Banking

- **Not-a-bank disclosure:** a program manager's statement that it is a technology company, not an insured bank, naming the partner banks that provide the accounts ([The Banking Landscape](/books/banking-and-lending/banking-landscape#sponsor-banks-and-baas)).

## Spend Management

- **Spend management platform:** software that bundles corporate cards, spend controls, expense and bill pay, often with business accounts, on partner banks' charters ([The Banking Landscape](/books/banking-and-lending/banking-landscape#who-owns-whom-recent-moves)).

## Running the Platform

- **Business date:** the institution's processing date a posting counts for, which differs from the calendar date after a cutoff or on a holiday ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).

## References

**Reference**

- [FDIC: Quarterly Banking Profile, second quarter 2026](https://www.fdic.gov/news/speeches/2026/fdic-quarterly-banking-profile-second-quarter-2026), community banks and the industry net interest margin
- [NCUA: Quarterly Credit Union Data Summary, 2026 Q2](https://www.ncua.gov/files/publications/analysis/quarterly-data-summary-2026-Q2.pdf), federally insured credit unions
- [FDIC: Understanding Deposit Insurance](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance), the standard insurance amount and ownership categories
- [12 CFR 235 (Regulation II)](https://www.law.cornell.edu/cfr/text/12/235.3), the debit interchange standard
- [31 CFR 1020.220](https://www.law.cornell.edu/cfr/text/31/1020.220), the CIP minimum information
- [Stripe: How Stripe Capital works](https://docs.stripe.com/capital), a merchant cash advance as a purchase of future receivables, not a loan
