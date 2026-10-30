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

- **Core banking system:** the system of record for an institution's accounts, postings and general ledger, usually a vendor's product hosted by the vendor ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-the-platforms-do-it)).
- **Subledger:** per-account detail beneath the general ledger, which must sum to the GL's balances every day ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-core-data-model)).

## Deposits

- **APY (annual percentage yield):** the yearly yield on a deposit including compounding, computed by Regulation DD's formula from interest over principal and days in the term ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).
- **Deposit insurance:** FDIC coverage of $250,000 per depositor, per insured bank, per ownership category ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).
- **Regulation CC:** US funds availability and check collection rules ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).

## Financial Crime

- **CIP (Customer Identification Program):** the rule that a bank obtain at least a name, date of birth, address and identification number before opening an account, and verify them ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-deposit)).

## Fintech and BaaS

- **FBO account (for-benefit-of):** a bank account in the provider's name holding money for its merchants ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).
- **Pass-through insurance:** FDIC coverage that reaches each owner of a pooled custodial account, if the records allow it ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).

## Lending Products

- **Amortization (level payment):** repaying a loan in equal periodic payments whose interest share falls and principal share rises over the term ([The Banking & Lending Business](/books/banking-and-lending/banking-business#the-life-of-a-loan)).

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
