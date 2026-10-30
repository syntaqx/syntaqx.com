+++
title = "Deposit Accounts & Truth in Savings"
nav_title = "Deposit Accounts"
description = "Checking, savings, money market and CDs: Reg DD disclosures and advertising, Reg D after 2020, Reg Q's repeal, early withdrawal penalties and ownership types."
category = "Banking & Lending Industry"
order = 2413
part = "Deposits"
tags = ["banking", "deposits", "truth-in-savings", "regulation-dd", "regulation-d", "certificates-of-deposit"]
+++

A deposit account is a contract and a liability. The customer lends the bank money on terms the bank wrote; the bank owes it back on demand, after notice, or at maturity, with whatever interest the terms promise. Every other chapter in this part works on that contract: [Deposit Insurance](/books/banking-and-lending/deposit-insurance) decides how much of it the government stands behind, [Funds Availability](/books/banking-and-lending/funds-availability) decides when a deposit becomes spendable, and [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees) decides what happens when the customer spends more than is there. This chapter is about the contract itself: the four product shapes every bank and credit union sells, the federal rules that define them, what has to be disclosed before and after the account opens, and the ownership types that decide who the account belongs to.

Three regulations do most of the work, and they come from different eras. **Regulation D** (12 CFR 204) defines the account types, originally to set reserve requirements. **Regulation DD** (12 CFR 1030), which implements the Truth in Savings Act, governs what a bank tells a consumer about interest, fees and terms. **Regulation Q**, which once banned interest on business checking, is gone. Credit unions follow the same Truth in Savings rules through the NCUA's own Part 707, and call their accounts shares and their interest dividends.

## How the Platforms Do It

Time deposits show how much room the rules leave. Regulation D sets only a floor on early withdrawal penalties and Regulation DD only requires that the penalty be disclosed, so each institution writes its own schedule. Public terms, as of October 2026:

| Institution | Early withdrawal penalty | Grace period at maturity | Interest | Other |
| --- | --- | --- | --- | --- |
| **Ally Bank** | 30 days' interest under 3 months; 60 days for 3 to 24 months; 90 for 25 to 36; 120 for 37 to 48; 150 for 49 months or longer. Taken from accrued interest first, then principal | 10 days from maturity | Compounded daily | No partial early withdrawals. An 11-month No Penalty CD allows full withdrawal "after the first 6 days following funding" |
| **American Express** | 90 days' interest under 12 months; 270 days for 12 to under 48; 365 for 48 to under 60; 540 for 60 months or more. Any excess over interest earned comes out of principal | 10 calendar days, only on automatic renewal | Compounded daily, posted monthly | Paying interest out instead of leaving it lowers the APY earned |
| **Capital One 360** | 3 months' interest for terms of 12 months or less; 6 months' interest for longer terms | 10 days | Accrued daily, compounded and credited monthly | No minimum deposit; renews to the same term at the rate on the maturity date |
| **Navy Federal Credit Union** | The lesser of 90 days' dividends (terms of 1 year or less), 180 days (over 1 year) or 365 days (5 years or more), or all dividends earned since issuance or renewal | Not stated on the FAQ | Dividends compounded and credited monthly | A withdrawal that drops the certificate below its minimum closes it, with the penalty on all principal |

Three things stand out. **The penalty is a product decision, not a rule:** for the same 12-month CD the schedules above range from 60 days' interest to 270. **The cap on the penalty is the difference that matters to a customer.** Navy Federal's "lesser of" wording means a member can lose interest but never principal (beyond the Regulation D minimum), while Ally and American Express say plainly that the penalty can reach principal; [the worked example](#worked-numbers-an-early-withdrawal) shows how far apart that leaves two depositors. **Ten days is the market's grace period,** which is what the Regulation DD maturity notice timing assumes ([Maturity Notices](#maturity-and-renewal)).

## The Four Shapes

Regulation D sorts every deposit into three legal kinds, and the market sells four products on them.

| Product | Regulation D kind | What defines it | What a bank still chooses |
| --- | --- | --- | --- |
| **Checking** (demand deposit, NOW account) | Transaction account | Payable on demand, or the bank hasn't reserved the right to require 7 days' notice; pays third parties by check, debit card, ACH or wire | Fees, minimums, overdraft service, whether it pays interest (a NOW account does) |
| **Savings** | Savings deposit | The bank may reserve the right to require 7 days' written notice of a withdrawal; no maturity | Rate tiers, any transfer limit, whether it has a debit card |
| **Money market deposit account (MMDA)** | Savings deposit | A savings deposit that historically allowed a few checks or debits a month | Minimum balances for its tiered rates, check writing |
| **Certificate of deposit (CD, share certificate)** | Time deposit | A maturity of at least 7 days; withdrawals within 6 days of deposit cost at least 7 days' simple interest | Term, rate, penalty schedule above, renewal policy, whether partial withdrawals are allowed |

A money market deposit account is not a money market fund: the first is a deposit, insured like any other; the second is a security, which deposit insurance doesn't cover. The words differ by one and the products differ completely, which is why sweep products that move cash between the two have their own disclosure problems, the subject of Sweeps, Reciprocal Deposits & Yield.

### Regulation D After 2020

Until April 2020 the line between savings and checking was a number: six "convenient" transfers or withdrawals a month from a savings deposit, after which the account was supposed to be closed or converted. The limit existed because transaction accounts carried reserve requirements and savings deposits didn't. Once the Federal Reserve had cut every reserve requirement ratio to zero in the spring of 2020, the distinction stopped mattering for reserves, and on April 24, 2020 the Board deleted the six-transfer limit from the definition of a savings deposit by interim final rule. The definition now permits transfers and withdrawals "regardless of the number".

What the rule did was permit, not require. The release lets institutions "suspend enforcement" of the limit; nothing makes them stop, so a bank may still cap savings withdrawals by contract, disclosed as a transaction limitation under Regulation DD. Two consequences for a system:

- **The limit is product configuration now.** It belongs in the product definition as a per-product rule (count, period, fee or conversion), never hard-coded as a federal constant, because it no longer is one.
- **The kind still matters elsewhere.** Other rules borrow Regulation D's categories: Regulation CC's funds availability schedule applies to "a deposit ... that is a transaction account" and not to savings or time deposits ([Funds Availability](/books/banking-and-lending/funds-availability#what-the-schedule-covers)). The product's Regulation D kind stays a required attribute even though no reserve depends on it.

### Interest on Business Checking

Regulation Q prohibited member banks from paying interest on demand deposits for decades, and the industry built workarounds: overnight sweeps of business balances into repurchase agreements or money funds, and earnings credits that offset service fees instead of paying interest. Section 627 of the Dodd-Frank Act repealed the statutory basis, and the Board repealed Regulation Q effective July 21, 2011. Banks may now pay interest on business checking, and the workarounds survive anyway: account analysis with an earnings credit is still how many operating accounts are priced (Treasury Management covers it), so a business deposit product needs room for both an interest rate and an earnings credit rate.

## Truth in Savings

Regulation DD covers a "deposit account at a depository institution that is held by or offered to a consumer", and a consumer is a natural person holding the account "primarily for personal, family, or household purposes". A business account isn't covered. The regulation has four moving parts: account disclosures, change notices and maturity notices, periodic statements, and advertising.

### Account Disclosures

Before an account is opened or a service is provided, whichever comes first, the bank gives the consumer written disclosures of everything that applies:

- **Rate information:** the annual percentage yield and the interest rate, using those terms; for a fixed rate, how long it lasts; for a variable rate, that it may change, how it's determined, how often it may change and any limit.
- **Compounding and crediting frequency,** and if interest is forfeited by closing before it's credited, a statement saying so.
- **Balance information:** minimums to open, to avoid a fee and to earn the APY, the balance computation method, and when interest begins to accrue on noncash deposits.
- **Fees:** every fee that may be imposed and the conditions for it.
- **Transaction limitations** on number or amount of deposits or withdrawals, which is where a contractual six-transfer limit has to appear.
- **For time accounts:** the maturity date, the early withdrawal penalty (that one applies, how it's calculated and when it's assessed), the effect of withdrawing interest before maturity, and the renewal policy, including whether there's a grace period and how long.
- **Bonuses:** amount or type, when it's paid, and the balance and time requirements. A bonus is anything worth more than $10 in a year given for opening, keeping or growing an account.

Timing depends on the channel. In a branch, the disclosures come before opening. When the consumer isn't present, paper disclosures may follow by mail no later than 10 business days after opening, but an account opened online gets them electronically before it's opened. They're also due on request.

The interest math the disclosures describe is constrained too. Interest has to be paid on the full principal for each day, by the daily balance method or the average daily balance method, and the regulation prohibits the methods that would pay on less: ending balance, lowest balance in the period, investable balance. A core sold globally may offer a minimum daily balance basis; for a US consumer product it isn't an option. Interest, APY & Statements works the day-count and APY formulas through.

### Change in Terms

A change that may lower the APY or otherwise hurt the consumer needs written notice at least 30 calendar days before it takes effect, stating the effective date. Three exceptions: rate changes on a variable-rate account (the disclosure already said the rate floats), changes to check printing fees, and any term of a time account with a maturity of one month or less. A change that benefits the consumer needs no advance notice. The versioning that makes this enforceable, so an old customer stays on old terms until the notice period runs, is the subject of Products & Product Configuration.

### Maturity and Renewal

Time accounts get their own notice clock, set by whether they renew:

| Time account | What the bank sends | When |
| --- | --- | --- |
| Auto-renewing, maturity over 1 year | Full account disclosures for the new term, plus the old maturity date; if the new rate isn't set yet, when it will be and a phone number to call | At least 30 calendar days before maturity, or at least 20 calendar days before the grace period ends if the grace period is at least 5 days |
| Auto-renewing, over 1 month and up to 1 year | The same, or a shorter notice: the maturity date, the new maturity date, the new rate and APY (or when they'll be known), and any term that differs | Same timing |
| Auto-renewing, 1 month or less | Nothing required | |
| Not renewing, maturity over 1 year | The maturity date and whether interest is paid after it | At least 10 calendar days before maturity |

The 20-days-before-grace-end option is why ten-day grace periods are common: with a ten-day grace, a notice sent ten days before maturity satisfies the rule.

### Periodic Statements

Regulation DD doesn't require a statement, but if the bank sends one it must show the **annual percentage yield earned** for the period, the dollar amount of interest earned, the fees debited during the period itemized by type and amount, and the number of days in the period or its start and end dates. Accounts with overdraft or returned-item fees add the year-to-date totals in [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#disclosure-and-the-balance-shown). The statement is a report the core generates from accruals and fee assessments, which makes it a test of whether those records are complete.

### Advertising

Advertising rules apply to anyone who advertises a bank's account, including a fintech marketing a partner bank's product and a deposit broker:

- **Not misleading,** and not inconsistent with the deposit contract.
- **"Free" or "no cost"** only if no maintenance or activity fee can apply. Interest can never be called "profit".
- **Rates are APYs.** An ad that states a rate of return uses "annual percentage yield" (APY once the full term has appeared); the interest rate may appear next to it, never more prominently.
- **An APY triggers more:** whether the rate is variable, how long it's offered or the date it was accurate, the minimum balance to earn it (per tier), a minimum opening deposit if higher, that fees could reduce earnings, and for a time account its term and the early withdrawal penalty.
- **A bonus triggers** the APY, the time requirement, the minimum balance, and when the bonus is paid.
- Broadcast, outdoor and telephone-response ads may drop several of those items; signs inside a branch are exempt if a stated rate is an APY and the sign tells consumers to ask an employee about fees and terms.

For a product team the useful reading is that the marketing site is a regulated surface. A rate tile on a landing page is an advertisement, and its "as of" date and footnotes come from the same product version the account disclosures do, never from copy someone typed.

### Records and Enforcement

Evidence of compliance is kept at least two years after the disclosure was required or the action taken; the enforcing agency can require longer. Regulation DD itself provides only administrative enforcement, by the agencies section 270 of the Act lists, so the exposure a system manages is examination findings: a disclosure that can't be produced is a finding even if it was sent.

## Who Owns the Account

The account's title decides who can withdraw, who inherits, and how much is insured. Each has a different set of parties:

| Ownership type | Parties on the account | What it means |
| --- | --- | --- |
| **Individual** | One owner, optionally authorized signers | Signers can transact; they don't own the money |
| **Joint** | Two or more owners | Usually with right of survivorship; each owner can withdraw on the same basis, which deposit insurance requires for joint coverage |
| **Payable on death (POD, "in trust for")** | Owner plus named beneficiaries | An informal revocable trust: beneficiaries own nothing until the owner dies, and must be named in the account records |
| **Trust** | Trustee as signer, the trust as owner, beneficiaries in the trust document | Formal revocable or irrevocable trusts; the bank holds the trust's details or a certification of them |
| **Custodial (UTMA/UGMA)** | Custodian, minor as owner | The custodian acts; the money belongs to the minor |
| **Estate** | Executor or administrator | Opened after a death to collect and pay out |
| **Retirement (IRA)** | Owner, custodian (often the bank), beneficiaries | Tax reporting and distribution rules on top of the deposit |
| **Business** | The entity, its signers, its beneficial owners | Opened with the KYB in [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#kyb-business-accounts); sole proprietorships are the owner's own accounts for insurance |
| **Fiduciary, custodial pooled (FBO)** | An agent or custodian for many owners | Pass-through insurance only if the records support it ([Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)) |

The core data model stores this as two things: an `ownership_category` on the account, which is the insurance category, and the parties with their roles in `account_parties`. They must agree, and [Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-ownership-categories) explains why the category has to come from the parties and the title, not from a dropdown.

## Fintech Accounts Are Bank Accounts

A checking account in a fintech app is a deposit at the fintech's partner bank, often pooled in an FBO account with a per-customer subledger. The bank is the depository institution, so Regulation DD's disclosures and the change-in-terms clock are the bank's obligations, delivered through the program's screens. Two places this goes wrong: the program changes a fee in its app before the bank has sent the 30-day notice, and the program advertises an APY on a page the bank never reviewed. The fix is the same as for a bank's own marketing: the program's disclosures and ad copy are rendered from the bank-approved product version, and a terms change is a product version with an effective date that the program can't override. [Banking as a Service](/books/banking-and-lending/banking-as-a-service) has the division of obligations between bank and program.

## Worked Numbers: An Early Withdrawal

A depositor opens a 12-month CD for $10,000 at a 4.00% interest rate and closes it after 75 days. For simplicity, interest here is simple daily interest on a 365-day year (each schedule above compounds, which changes the cents, not the conclusion):

- One day's interest: $10,000 × 4.00% ÷ 365 = **$1.0959**.
- Interest earned in 75 days: 75 × $1.0959 = **$82.19**.

| Schedule | Penalty rule for a 12-month term | Penalty | Depositor gets back |
| --- | --- | --- | --- |
| Ally | 60 days' interest | 60 × $1.0959 = $65.75 | $10,016.44 |
| Navy Federal | Lesser of 90 days' dividends ($98.63) and dividends since issuance ($82.19) | $82.19 | $10,000.00 |
| Capital One 360 | 3 months' interest: $10,000 × 4.00% ÷ 4 | $100.00 | $9,982.19 if the $17.81 excess comes from principal; the product page doesn't say |
| American Express | 270 days' interest | 270 × $1.0959 = $295.89 | $9,786.30, with $213.70 from principal |

The Regulation D floor sits under all of them: had the withdrawal come within six days of opening, the penalty could be no less than seven days' simple interest ($7.67). Each schedule is legal because each is disclosed. What a system has to get right is which balance the penalty applies to (the amount withdrawn, not the account), which rate (Ally uses the rate in effect on the day of the request for its Raise Your Rate CD), whether the penalty stops at accrued interest or reaches principal, and that the computation is reproducible from the product version the customer opened under, years later.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model), using its table names. A deposit product is a row in `products`, versioned; an account points at the version it was opened under; terms changes are new versions with an effective date. The deposit-specific attributes, and the time deposit's own terms, are:

```sql
-- Deposit attributes on a product version. Values are product decisions;
-- the CHECKs encode the rules that aren't.
ALTER TABLE products
  ADD COLUMN reg_d_kind          TEXT CHECK (reg_d_kind IN ('transaction', 'savings', 'time')),
  ADD COLUMN consumer_purpose    BOOLEAN NOT NULL DEFAULT TRUE,     -- Reg DD applies
  ADD COLUMN balance_method      TEXT CHECK (balance_method IN ('daily', 'average_daily')),
  ADD COLUMN withdrawal_limit    JSONB,      -- e.g. {"count": 6, "per": "statement_cycle", "excess": "fee"}; null = none
  ADD COLUMN interest_bearing    BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN earnings_credit     BOOLEAN NOT NULL DEFAULT FALSE;    -- business analysis accounts

CREATE TABLE time_deposit_terms (            -- one per time-deposit product version
  product_id          UUID PRIMARY KEY REFERENCES products (id),
  term_days           INTEGER NOT NULL CHECK (term_days >= 7),          -- Reg D minimum maturity
  renews              BOOLEAN NOT NULL,
  grace_period_days   INTEGER NOT NULL DEFAULT 0,
  partial_withdrawals BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_days        INTEGER NOT NULL CHECK (penalty_days >= 7),        -- days of interest on the amount withdrawn
  penalty_cap         TEXT NOT NULL CHECK (penalty_cap IN ('none', 'interest_earned')),
  penalty_rate_basis  TEXT NOT NULL CHECK (penalty_rate_basis IN ('rate_at_open', 'rate_at_request'))
);

CREATE TABLE time_deposits (                 -- the instance: one per CD account and term
  account_id          UUID NOT NULL REFERENCES accounts (id),
  term_number         INTEGER NOT NULL,                                  -- 1, then each renewal
  product_id          UUID NOT NULL REFERENCES products (id),            -- version for this term
  opened_on           DATE NOT NULL,
  matures_on          DATE NOT NULL,
  rate_bps            INTEGER NOT NULL,
  maturity_notice_id  UUID REFERENCES disclosures (id),
  PRIMARY KEY (account_id, term_number)
);
```

Each renewal is a new `time_deposits` row on the product version in force at maturity, and the maturity notice is a `disclosures` row whose send date a job checks against the clock in [Maturity and Renewal](#maturity-and-renewal). An early withdrawal posts the penalty as a `fee_assessments` row (kind `early_withdrawal_penalty`) with a journal entry that debits accrued interest payable first and the deposit liability for any excess, so the cap is visible in the ledger, not just in the arithmetic. Product attributes and the account's version are both effective-dated, the pattern in [Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions); the money in them is integer minor units ([Money](/docs/payments/money)).

The ownership type maps to `accounts.ownership_category` and to `account_parties` roles (`owner`, `joint_owner`, `authorized_signer`, `beneficiary`, `custodian`, `beneficial_owner`), with a stated `share` where the records give one. Validation runs at opening and on every party change: a joint account has at least two owners with the same withdrawal rights, a POD account has named beneficiaries, a custodial account has exactly one minor owner and one custodian.

## Auditing

Truth in Savings evidence is about proving what a consumer was told and when. Keep, for at least the two years the regulation requires and in practice the life of the account:

- **Every disclosure delivered,** as a `disclosures` row with the document version, the channel, the time and, for electronic delivery, the E-SIGN consent it relied on ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).
- **The product version each account was opened under and every version it moved to,** with the change notice and its send date, so "was this fee change noticed 30 days ahead" is a query.
- **Maturity notices** with their computed due date and actual send date for each term.
- **Advertisements:** the published copy and the product version it was generated from, by date, because an ad's APY has to have been true on the day it ran.
- **Penalty and bonus computations** with their inputs, recorded as the decision they were ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## What This Means for the System You Build

- **Regulation D kind, ownership category and Reg DD coverage are attributes of the product and account,** set at definition time and used by disclosures, reporting and insurance; none of them is free text.
- **Transfer limits and penalties are configuration,** with the federal floors (7-day maturity, 7 days' penalty within 6 days) enforced as constraints.
- **Disclosures, statements and ads render from one versioned product definition,** so the marketing page, the opening disclosure and the statement can't disagree.
- **Terms changes are versions with effective dates and notice jobs,** never edits to a live product.
- **A fintech's screens carry the bank's obligations;** the bank-approved version is the only source the program can render.

## References

**Law and regulation**

- [12 CFR 204.2: Regulation D definitions](https://www.law.cornell.edu/cfr/text/12/204.2), demand, savings, time and transaction accounts, the 7-day maturity and the 7-day early withdrawal penalty, transfers "regardless of the number"
- [12 CFR 1030.1](https://www.law.cornell.edu/cfr/text/12/1030.1) and [12 CFR 1030.2](https://www.law.cornell.edu/cfr/text/12/1030.2), Regulation DD's coverage, credit unions excluded, and the definitions of account, consumer, time account and bonus
- [12 CFR 1030.4: Account disclosures](https://www.law.cornell.edu/cfr/text/12/1030.4), contents and timing, including the 10-business-day mailing rule
- [12 CFR 1030.5: Subsequent disclosures](https://www.law.cornell.edu/cfr/text/12/1030.5), the 30-day change notice and its exceptions, and the maturity notice clocks
- [12 CFR 1030.6: Periodic statement disclosures](https://www.law.cornell.edu/cfr/text/12/1030.6), APY earned, interest earned, fees and the statement period
- [CFPB: Regulation DD 1030.7, Payment of interest](https://www.consumerfinance.gov/rules-policy/regulations/1030/7/), daily and average daily balance methods and the prohibited methods
- [12 CFR 1030.8: Advertising](https://www.law.cornell.edu/cfr/text/12/1030.8), misleading ads, "free", APY triggers, bonuses and media exemptions
- [12 CFR 1030.9: Enforcement and record retention](https://www.law.cornell.edu/cfr/text/12/1030.9), administrative enforcement and two years of records
- [12 CFR 707.1: NCUA Truth in Savings](https://www.law.cornell.edu/cfr/text/12/707.1), the credit union counterpart and its coverage
- [12 CFR 229.2: Regulation CC definitions](https://www.law.cornell.edu/cfr/text/12/229.2), "account" as a transaction account, excluding savings and time deposits

**Regulators and guidance**

- [Federal Reserve: Interim final rule amending Regulation D (April 24, 2020)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20200424a.htm), deleting the six-transfer limit after reserve requirements went to zero
- [Federal Reserve: Repeal of Regulation Q (July 14, 2011)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20110714a.htm), interest on demand deposits permitted from July 21, 2011 under Dodd-Frank section 627
- [FDIC: Understanding Deposit Insurance](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance), money market deposit accounts covered, mutual funds and other securities not

**Vendor documentation**

- [Ally Bank: High Yield CD](https://www.ally.com/bank/high-yield-cd/), penalty schedule by term, 10-day grace period, daily compounding, Raise Your Rate and No Penalty CDs
- [American Express: CD account](https://www.americanexpress.com/en-us/banking/online-savings/cd/), penalty schedule, deduction from principal, 10-calendar-day grace period, compounding and posting
- [Capital One: 360 CDs](https://www.capitalone.com/bank/cds/online-cds/), 3 and 6 months' interest penalties, grace period, monthly crediting and renewal
- [Navy Federal Credit Union: Savings FAQs](https://www.navyfederal.org/checking-savings/savings/faqs.html), certificate penalties as the lesser of days' dividends or dividends earned, and the Regulation D 7-day penalty

**In practice**

- [Wikipedia: Sweep account](https://en.wikipedia.org/wiki/Sweep_account), sweeps of business balances as a response to the ban on interest on business checking (secondary)
