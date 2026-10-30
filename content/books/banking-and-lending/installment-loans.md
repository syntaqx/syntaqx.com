+++
title = "Personal & Installment Loans"
description = "Unsecured personal and installment loans: amortization, origination fees and APR, prepayment, marketplace lenders, small-dollar and payday loans, state caps."
category = "Banking & Lending Industry"
order = 2434
part = "Lending Products"
tags = ["banking", "lending", "installment-loans", "amortization", "payday", "rate-caps"]
+++

An installment loan is the simplest credit product to describe and the one that teaches the most about lending systems. The borrower receives a sum, agrees to a rate and a term, and repays in equal payments that each cover the month's interest and retire some principal until the balance reaches zero. There's no revolving balance, no grace period and no credit limit to manage. What there is: a schedule that has to be computed exactly and disclosed before the borrower signs, fees that change the APR without changing the rate, payments that arrive early, late, partial or twice, and state laws that cap what the loan may cost and differ by amount, term and lender type. Unsecured personal loans at banks, credit unions and marketplace lenders sit at one end; payday and other small-dollar loans at the other; the same schedule engine serves both.

This chapter covers the unsecured personal loan and its disclosures, origination fees and the APR, amortization with a worked schedule, how interest accrues (precomputed, simple and daily simple), prepayment and the Rule of 78s, marketplace lenders, small-dollar and payday lending and the federal rule left standing, credit union payday alternatives, and state rate caps as data. Secured installment loans have their own chapters: [Auto Lending](/books/banking-and-lending/auto-lending) and [Mortgages & Home Equity](/books/banking-and-lending/mortgages). Point-of-sale installment plans are [Buy Now, Pay Later](/books/banking-and-lending/buy-now-pay-later). The economics behind the price are in [The Lending Business](/books/banking-and-lending/lending-business).

## How the Platforms Do It

As of October 2026, from lenders' published terms and filings:

| Lender | Model | Amounts and terms | APR and fees | Notes |
| --- | --- | --- | --- | --- |
| **Happen** (formerly LendingClub) | Bank lender, marketplace for loans it sells | $1,000 to $75,000; 24 to 84 months | 5.96% to 35.99% APR; origination fee 0% to 8% | Can pay a borrower's creditors directly for debt consolidation; terms as of July 6, 2026 |
| **Upstart** | Marketplace: loans made by bank and credit union partners | $1,000 to $75,000 (higher state minimums in Georgia, Hawaii and Massachusetts); 3 or 5 years | 6.3% to 35.99% APR on 5-year rates offered in June 2026; origination fee deducted from proceeds | No prepayment penalty; its 10-K describes personal loans from $200 for some products and terms from 3 months |
| **Enova** (NetCredit, CashNetUSA) | High-yield online lender, directly and through bank partners | Consumer installment terms of 3 to 60 months | 90% average annualized yield on consumer installment loans in 2025 | Didn't offer consumer loans in 13 states at the end of 2025 |
| **Federal credit unions (PAL I and PAL II)** | Payday alternative loans under NCUA rules | PAL I $200 to $1,000 over 1 to 6 months; PAL II up to $2,000 over 1 to 12 months | Up to 1,000 basis points above the NCUA Board's maximum rate; application fee up to $20 | No rollovers; at most three in six months and one at a time |

Three things stand out. **35.99% is a ceiling, not an accident:** two unrelated prime lenders top out at the same figure, just under the 36% that the Military Lending Act sets for covered borrowers and that California's cap for mid-sized loans starts from. **The fee is how pricing varies without the rate:** both prime lenders charge origination fees of up to about 8%, deducted from the proceeds, so the APR moves while the stated rate looks competitive. **The product is the same; the cost ranges by an order of magnitude:** a 36% loan and a 90% loan amortize with the same arithmetic, and the difference is who can borrow, from whom, and in which state.

## The Product and Its Disclosures

A personal loan is **closed-end credit**: a fixed amount, usually a fixed rate and a fixed number of equal monthly payments, fully amortizing, with no collateral. Lenders market them for debt consolidation, home improvement and large purchases; for consolidation, a lender may pay the borrower's other creditors directly (Happen offers this), which turns one disbursement into several and makes the disbursement itself a record to keep.

Regulation Z requires closed-end disclosures before consummation (12 CFR 1026.18), and the "federal box" a borrower sees comes straight from the schedule engine:

- **Amount financed** and its itemization: what the borrower actually gets the use of, after prepaid finance charges.
- **Finance charge:** the dollar cost of the credit, including interest and fees that are part of the cost of credit. Points, loan fees, finder's fees and credit report fees are finance charges, as are credit insurance premiums written in connection with the loan (1026.4(b)).
- **Annual percentage rate:** the finance charge as a yearly rate on the amount financed, computed by the actuarial method in Appendix J (APR, Finance Charges & Rate Caps covers the math and its tolerances).
- **Payment schedule** and **total of payments.**
- **Prepayment:** whether a penalty applies and whether the borrower is entitled to a rebate of any finance charge.
- **Late payment** charges and any **security interest.**

The order of operations matters: the disclosures are computed from the same inputs the note uses, by the same code, so that the disclosed payment and the first billed payment can't differ by a cent.

## Origination Fees and the APR

An origination fee is a percentage of the loan, charged at funding and usually deducted from the proceeds. Because it's a finance charge paid at the start, it reduces the amount financed without reducing the principal the borrower repays, and so it raises the APR above the interest rate:

- **Upstart's published example:** a $10,000 loan over 60 months with an 8.15% origination fee ($815) and a 19.08% interest rate has an APR of 23.37%; the borrower receives $9,185 and makes 60 payments of $261.
- **Happen's published example:** $15,262 over 36 months at 13.99% interest with a 6% fee ($916) has an APR of 18.40%; the borrower receives $14,346 and pays $522 a month.

A borrower who wants $14,346 in hand borrows $15,262. The loan is sized up so the fee comes out of it, interest accrues on the full $15,262, and the APR measures the cost against the $14,346. For the system, the fee is part of the schedule's inputs (it changes the amount financed, the APR and any rate cap test that includes fees), and under amortized cost accounting it's deferred and recognized over the loan's life rather than booked at funding ([Amortized Cost or Fair Value](/books/banking-and-lending/lending-business#amortized-cost-or-fair-value)).

## Worked Numbers: An Amortization Schedule

Happen's example, built as a schedule: $15,262 principal, 13.99% annual rate, 36 monthly payments, interest computed monthly at 13.99% / 12 = 1.16583% on the outstanding balance.

**The payment.** For principal *P*, monthly rate *r* and *n* payments, the level payment is *P × r / (1 − (1 + r)^−n)*. Here that's $521.5449, rounded to **$521.54**, with the last payment adjusted for the accumulated rounding.

| Payment | Payment amount | Interest | Principal | Balance after |
| --- | --- | --- | --- | --- |
| 1 | $521.54 | $177.93 | $343.61 | $14,918.39 |
| 2 | $521.54 | $173.92 | $347.62 | $14,570.77 |
| 3 | $521.54 | $169.87 | $351.67 | $14,219.10 |
| 12 | $521.54 | $131.20 | $390.34 | $10,863.72 |
| 24 | $521.54 | $72.95 | $448.59 | $5,809.08 |
| 35 | $521.54 | $11.95 | $509.59 | $515.70 |
| 36 | $521.71 | $6.01 | $515.70 | $0.00 |

- **Each row:** interest = previous balance × 1.16583%, rounded to the cent; principal = payment − interest; new balance = previous balance − principal.
- **Totals:** $18,775.61 paid, of which **$3,513.61 is interest**. The finance charge adds the $916 fee: **$4,429.61**.
- **The APR:** the monthly rate that makes the 36 payments' present value equal the $14,346 amount financed is 1.53354%, times 12 = **18.40%**, matching the published APR.
- **Front-loading:** the first year's payments carry $1,860.20 of interest and leave $10,863.72 of principal, so after a third of the term the borrower has repaid less than 29% of the loan. That's the arithmetic of amortization, not a fee, and it's why early payoff saves less than borrowers expect.
- **The last payment absorbs rounding:** $521.71 instead of $521.54. The schedule engine decides once where rounding lands (the final payment is the convention) and the disclosure shows it.

The engine computing this must round each period's interest to the cent with a stated rule ([Rounding](/docs/payments/money#rounding)), store the schedule as rows, not recompute it on read, and regenerate it explicitly (with a new version) when terms change, as in a modification or a payment deferral.

## How Interest Accrues

The schedule above assumes every payment arrives on its due date. Real payments don't, and the loan's accrual method decides what that costs:

- **Precomputed (add-on) interest.** The total interest is computed at origination and added to the balance; the borrower owes the total of payments, and on early payoff is owed a rebate of unearned interest. The rebate method matters: the **Rule of 78s** front-loads earned interest more than the actuarial method does, so the rebate is smaller. Federal law requires a refund of unearned interest on prepayment of any consumer credit transaction (no refund is required under $1), and for precomputed transactions with a term over **61 months** consummated after September 30, 1993, the refund must be at least as favorable to the consumer as the actuarial method (15 U.S.C. 1615).
- **Simple interest on a monthly schedule.** Interest accrues on the outstanding principal each period at the monthly rate, as in the schedule above. A payment applies to that period's interest first, then principal.
- **Daily simple interest.** Interest accrues every day on the outstanding principal at the annual rate divided by 365, and each payment covers the interest accrued since the last payment, then principal. Paying early saves interest; paying late costs it. On the schedule above, after the first payment the balance is $14,918.39, which accrues **$5.72 a day** at 13.99% / 365. A second payment ten days late carries about $57 more interest, so $57 less of it reduces principal, and the final payment grows to make up the difference. The note says which method applies, and [Loan Servicing](/books/banking-and-lending/loan-servicing#payment-application) covers the payment application engine.

The method is a property of the loan, fixed by the note, and it decides whether the ledger is driven by the schedule (scheduled interest) or by the calendar (daily accrual through `interest_accruals`).

## Prepayment

Most unsecured personal loans can be prepaid without penalty: Upstart's page says there is no prepayment penalty, and California bars prepayment penalties on consumer loans made under its Financing Law other than those secured by real property. What prepayment changes:

- **A full payoff** needs a quote good through a date: principal plus interest accrued to that date (daily simple interest) or the total of payments less the rebate (precomputed). A payoff quote is a computed record with an expiry, not a balance read.
- **A partial prepayment** either shortens the term (same payment, fewer of them) or lowers the payment (re-amortize over the remaining term). The note or the lender's policy decides, and the borrower should be told which; my default is to shorten the term unless the borrower asks to re-amortize, because it saves the most interest and leaves the disclosed payment unchanged.
- **An overpayment that isn't a prepayment:** paying next month's installment early. Under daily simple interest it reduces principal now and the next due date may or may not advance ("paid ahead"). The policy must say which, and the servicing chapter's allocation rules apply.
- **The origination fee isn't refunded** on prepayment unless the contract or state law says so; under amortized cost accounting the unamortized fee is recognized at payoff.

## Marketplace Lenders

The personal loan market's modern shape came from marketplace lenders that matched borrowers with investors, many of which now hold bank charters or originate through partner banks. The public filings show the range:

- **Happen** originated $9.6 billion in 2025, selling $7.1 billion through its marketplace and keeping $2.5 billion as held-for-investment loans funded by deposits; it describes its revenue as origination fees plus net interest income on retained loans and its Structured Program securities.
- **Upstart** decides and prices loans that its more than 100 bank and credit union partners make, inside the partners' hard credit criteria; 64% of 2025 originations went to institutional investors, 26% to lending partners and 10% to its balance sheet, and 91% of its loans were fully automated.

For the system, a marketplace loan has three relationships at once: the originating lender whose name is on the note and disclosures, the owner (which can change when the loan is sold), and the servicer. Each is an attribute of the loan with history, and the borrower's disclosures, statements and payment instructions don't change when ownership does. Funding the Book covers the sale and allocation.

## Small-Dollar and Payday Loans

A **payday loan** is a short-term, single-payment loan, typically due on the borrower's next payday and repaid by a postdated check or an authorization to debit the borrower's bank account. Its successors are high-cost installment loans and lines of credit that spread repayment over months. The federal rule that covers them is narrower than its name:

- **The CFPB's Payday, Vehicle Title and Certain High-Cost Installment Loans rule (12 CFR part 1041)** originally required ability-to-repay underwriting for short-term and longer-term balloon loans. Those underwriting provisions were rescinded in 2020 (the part was last amended October 20, 2020), leaving the **payment provisions**.
- **The payment provisions** stop a lender from attempting to withdraw payment from a consumer's account after two consecutive attempts have failed for insufficient funds, unless the consumer gives a new, specific authorization or asks for a single immediate payment (1041.8), and require notices before the first withdrawal attempt and after the two failures. A return for another reason (a wrong account number, say) doesn't count as a failure. After the Supreme Court upheld the CFPB's funding in *CFSA v. CFPB* (judgment entered June 17, 2024), the stayed compliance date ran out and the payment provisions took effect on **March 30, 2025**. <!-- source-gap: payday-payment-provisions-status | status | whether the payment provisions of 12 CFR 1041 have been further delayed, amended or proposed for rescission since March 30, 2025 | closes with: a CFPB or Federal Register notice, or a court order, after March 2025 | checked: 2026-10-29 --> I found no later delay or rescission as of October 2026.
- **The Military Lending Act** caps the military annual percentage rate at **36%** for covered borrowers, and the MAPR counts credit insurance, debt cancellation fees, ancillary product fees, finance charges and application and participation fees even where Regulation Z doesn't (32 CFR 232.4). A small-dollar lender's eligibility check needs a covered-borrower lookup before it prices.

The payment provisions are a counter with legal semantics: per consumer, per account, failed attempts by reason, reset only by a new authorization recorded with its specific dates, amounts and channel. They sit on top of the ACH rules for returns ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)) and the Nacha authorization a debit already needs.

**Credit union payday alternatives.** Federal credit unions may make **PAL I** loans of $200 to $1,000 over 1 to 6 months to members of at least one month, and **PAL II** loans of up to $2,000 over 1 to 12 months with no membership wait, at up to 1,000 basis points above the NCUA Board's maximum rate, with an application fee of at most $20. Both must fully amortize, can't be rolled over, and are limited to three in any rolling six months and one at a time; PAL II bars overdraft and NSF fees on the borrower's account in connection with the loan; combined PAL balances are capped at 20% of the credit union's net worth (12 CFR 701.21(c)(7)(iii) and (iv)). It's the clearest example of a small-dollar product whose limits are all checks the system makes at origination.

## State Rate Caps as Data

Every state sets its own limits on consumer loans, usually by lender license type, loan amount and term, and often with separate rules for fees. California's Fair Access to Credit Act (AB 539, operative January 1, 2020) is a good example of how specific they get: for loans of at least $2,500 and under $10,000 made under the California Financing Law, the rate may not exceed **36% a year plus the Federal Funds Rate**, administrative fees count toward the cap for loans of $5,000 or more (with up to $75 allowed on top between $2,500 and $5,000), the term may not be shorter than 12 months, the lender must report payment performance to at least one nationwide credit bureau, and it must offer (but can't require) a free credit education program before disbursing. The cap is computed against a published index, so it moves with the Federal Reserve's H.15 release.

Banks lending across state lines export their home state's rate, a state can opt out of that for state-chartered banks' loans made in it (Colorado and Oregon have), and a nonbank using a bank partner can face a "true lender" challenge; APR, Finance Charges & Rate Caps covers all three, and Lender Licensing & Bank Partnerships covers the licenses. For the system, the consequence is that a loan's maximum price is a function of jurisdiction, lender of record, amount, term and date, evaluated at offer time from versioned rules:

- **Store each cap as a rule with its source:** jurisdiction, license type or lender type, amount band, term limits, the formula (a fixed rate, an index plus a margin, or a tiered schedule), which fees count, and effective dates.
- **Evaluate the cap on the borrower's jurisdiction and the lender of record,** not the platform's location.
- **Check the computed APR or MAPR against every applicable cap** before showing an offer, and record which rule bound it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Treat "not offered here" as a rule too:** Enova's 13 states without consumer loans are the clearest public example that some caps close a market rather than reprice it.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). An installment loan is an `accounts` row with `account_kind = 'loan'` (its `institution_id` is the lender of record), a `loans` row (principal, rate, term, `amortization` of `level_payment` or `daily_simple_interest`, owner and servicer), a versioned `payment_schedules` with its `schedule_installments`, `loan_payments` with their `payment_allocations`, and `fee_assessments` for the origination fee. [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) added `loan_pricing`. This chapter adds precomputed loans and the prepayment policy, disbursements, payoff quotes, the rate cap rules and the payment attempt limits.

```sql
ALTER TABLE loans
  ADD COLUMN precomputed BOOLEAN NOT NULL DEFAULT false,    -- add-on interest, rebated on payoff
  ADD COLUMN rebate_method TEXT CHECK (rebate_method IN ('actuarial', 'rule_of_78s')),  -- precomputed only
  ADD COLUMN prepayment_policy TEXT NOT NULL DEFAULT 'shorten_term'
    CHECK (prepayment_policy IN ('shorten_term', 'reamortize', 'borrower_choice'));

ALTER TABLE loans ADD CONSTRAINT rule_of_78s_term
  CHECK (rebate_method IS DISTINCT FROM 'rule_of_78s' OR term_months <= 61);  -- 15 U.S.C. 1615

CREATE TABLE loan_disbursements (            -- where the proceeds went
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  kind               TEXT NOT NULL CHECK (kind IN ('to_borrower', 'to_creditor', 'fee_withheld', 'refinance_payoff')),
  amount             BIGINT NOT NULL CHECK (amount > 0),
  payee_name         TEXT,                    -- the creditor paid directly in a consolidation
  payee_account_ref  TEXT,                    -- tokenized
  journal_entry_id   UUID NOT NULL REFERENCES journal_entries (id),
  disbursed_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE payoff_quotes (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  good_through       DATE NOT NULL,
  principal          BIGINT NOT NULL,
  accrued_interest   BIGINT NOT NULL,
  unearned_rebate    BIGINT NOT NULL DEFAULT 0,   -- precomputed loans
  fees_due           BIGINT NOT NULL DEFAULT 0,
  per_diem           BIGINT NOT NULL,             -- interest per day after good_through, minor units
  total              BIGINT NOT NULL,
  requested_by       TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_cap_rules (                -- versioned law, one row per rule
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction       TEXT NOT NULL,              -- state, or 'US' for federal rules like the MLA
  applies_to         TEXT NOT NULL,              -- license type, lender type or borrower status ('mla_covered')
  product_scope      TEXT NOT NULL,              -- e.g. 'consumer_installment'
  amount_min         BIGINT,
  amount_max         BIGINT,                     -- exclusive
  term_min_months    SMALLINT,
  formula            TEXT NOT NULL CHECK (formula IN ('fixed', 'index_plus', 'tiered', 'not_permitted')),
  cap_bps            INT,                        -- fixed, or the margin over the index
  index_name         TEXT,                       -- 'fed_funds_h15', ...
  measure            TEXT NOT NULL CHECK (measure IN ('simple_rate', 'apr', 'mapr')),
  fees_included      TEXT[],                     -- which charges count toward the cap
  fee_allowance      BIGINT,                     -- a flat amount allowed on top, where the rule has one
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  source_citation    TEXT NOT NULL               -- statute or regulation, by section
);

CREATE TABLE rate_cap_evaluations (          -- every offer checked, and the rule that bound it
  credit_decision_id UUID NOT NULL REFERENCES credit_decisions (id),
  rule_id            UUID NOT NULL REFERENCES rate_cap_rules (id),
  computed_bps       INT NOT NULL,
  limit_bps          INT,                        -- NULL when the rule is 'not_permitted'
  passed             BOOLEAN NOT NULL,
  evaluated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (credit_decision_id, rule_id)
);

CREATE TABLE payment_transfer_attempts (     -- 12 CFR 1041.8 for covered loans; useful for all
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  ach_entry_id       UUID REFERENCES ach_entries (id),          -- from the Payments volume
  authorization_id   UUID NOT NULL REFERENCES ach_authorizations (id),
  amount             BIGINT NOT NULL,
  attempted_at       TIMESTAMPTZ NOT NULL,
  outcome            TEXT CHECK (outcome IN ('settled', 'failed_nsf', 'failed_other')),
  consecutive_nsf    SMALLINT NOT NULL DEFAULT 0,  -- after this attempt
  notice_disclosure_id UUID REFERENCES disclosures (id)
);
```

The schedule is generated once at origination by the same function that produces the disclosure, stored as `schedule_installments`, and replaced only by a new `payment_schedules` version with a reason (modification, deferral, re-amortization after a partial prepayment). For `daily_simple_interest` loans, a nightly job posts `interest_accruals` from the principal balance and the product version's day count, and each payment's allocation reads the accrued interest as of its effective date, so a backdated payment correctly reverses and reposts the days after it ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)). The disbursement rows must sum to the principal, with the withheld fee as its own row, so the amount financed on the disclosure is a query, not a separate number. Before any debit on a covered loan, the collection job reads the latest `consecutive_nsf`; at two, it stops and requires a new authorization. `rate_cap_rules` is reference data with its citation on every row; `rate_cap_evaluations` records every rule checked for every offer, including the ones that passed, because the examiner's question is "show me that you checked."

## Auditing

Installment loans are examined file by file, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **The disclosure as delivered,** its version, its delivery and the inputs behind each figure, reproducible from the schedule.
- **The schedule's versions,** each with its reason and the event that triggered it.
- **Where the proceeds went,** per disbursement, summing to the principal.
- **Every payment's effective date, allocation and the accrued interest it paid,** with any backdating and its reason.
- **Every payoff quote** with its good-through date and per diem.
- **The cap evaluation for every offer:** each rule checked, its version and citation, the computed rate and the result.
- **For covered small-dollar loans,** every withdrawal attempt, its outcome, the consecutive failure count, notices sent, and any new authorization.
- **The lender of record, owner and servicer over time,** for marketplace and partner-bank loans.

## What This Means for the System You Build

- **Compute the disclosure and the note from one function,** so the APR, payment and total of payments can't disagree.
- **Store the schedule as rows and version it;** never recompute history on read.
- **Treat the origination fee as an input to the schedule and the caps,** not a side charge.
- **Make the accrual method a property of the loan,** and drive daily simple interest from the calendar with backdating that reverses and reposts.
- **Quote payoffs as records with expiry,** and decide the partial-prepayment policy before launch.
- **Keep rate caps as versioned rules with citations,** evaluated on the borrower's jurisdiction and the lender of record, with every check recorded.
- **Count failed withdrawal attempts per account** and stop at two for covered loans until a new authorization is on file.
- **Track lender of record, owner and servicer separately,** each with history.

## References

**Law and regulation**

- [CFPB: Regulation Z § 1026.18, content of disclosures](https://www.consumerfinance.gov/rules-policy/regulations/1026/18/), amount financed and itemization, finance charge, APR, payment schedule, total of payments, prepayment, late payment and security interest
- [CFPB: Regulation Z § 1026.4, finance charge](https://www.consumerfinance.gov/rules-policy/regulations/1026/4/), the finance charge as the cost of credit, including points, loan fees, finder's fees, credit report fees and credit insurance premiums
- [Cornell LII: 15 U.S.C. § 1615, prohibition on use of "Rule of 78s"](https://www.law.cornell.edu/uscode/text/15/1615), refunds of unearned interest on prepayment, no refund under $1, and the actuarial floor for precomputed transactions over 61 months consummated after September 30, 1993
- [CFPB: 12 CFR part 1041, payday, vehicle title, and certain high-cost installment loans](https://www.consumerfinance.gov/rules-policy/regulations/1041/), the covered loan types, the removed underwriting subpart and the October 20, 2020 amendment
- [CFPB: 12 CFR § 1041.8, prohibited payment transfer attempts](https://www.consumerfinance.gov/rules-policy/regulations/1041/8/), the stop after two consecutive failed transfers, new authorizations, single immediate payments, and failures for reasons other than insufficient funds
- [Cornell LII: 32 CFR 232.4, Military Lending Act terms of credit](https://www.law.cornell.edu/cfr/text/32/232.4), the 36% MAPR and the charges it includes
- [Cornell LII: 12 CFR 701.21, loans to members and lines of credit to members](https://www.law.cornell.edu/cfr/text/12/701.21), PAL I and PAL II amounts, maturities, the rate allowance, the $20 fee limit, loan count limits, no rollovers and the 20% of net worth cap
- [California DFPI: New requirements for licensees making consumer loans of $2,500 to $10,000](https://dfpi.ca.gov/regulated-industries/important-notices/new-requirements-for-licensees-making-consumer-loans-of-2500-to-10000-california-financing-law/), AB 539's 36% plus Federal Funds Rate cap, fee treatment, the 12-month minimum term, the prepayment penalty ban, credit reporting and credit education, operative January 1, 2020
- [CRS Legal Sidebar LSB11433: state opt-outs from DIDMCA section 521 (May 22, 2026)](https://www.everycrsreport.com/files/2026-05-22_LSB11433_01c9274923b644f900a11cc38dacf4ba656333e5.html), Colorado's and Oregon's opt-outs

**Litigation and status**

- [Consumer Finance Monitor: CFPB announces March 30, 2025 compliance date for payday lending rule (June 17, 2024)](https://www.consumerfinancemonitor.com/2024/06/17/cfpb-announces-march-30-2025-compliance-date-for-payday-lending-rule/), the stay of 286 days after the appeal's resolution, the June 17, 2024 judgment in CFSA v. CFPB, and the payment provisions as the remaining parts of the rule

**Filings**

- [Happen (formerly LendingClub): Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1409970/000140997026000018/lc-20251231.htm), 2025 originations split between marketplace and held for investment, and revenue from origination fees and net interest income
- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), lending partners, the funding split, automation and personal loan terms
- [Enova International: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529864/000119312526060461/enva-20251231.htm), the consumer installment yield and the 13 states without consumer loans

**In practice**

- [Happen: Personal loans](https://www.happen.com/personal-loan?b=lc), APR and fee ranges, amounts and terms, the representative example and direct payment to creditors, as of July 6, 2026
- [Upstart: Personal loans](https://www.upstart.com/personal-loans), APR range, amounts and state minimums, terms, the representative example, the fee deducted from proceeds and no prepayment penalty
