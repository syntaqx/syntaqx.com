+++
title = "Credit Builders & Secured Products"
nav_title = "Credit Builders"
description = "Secured cards, credit builder loans, share-secured loans and rent and bill reporting: how each works, what it costs, and how it reaches the credit bureaus."
category = "Banking & Lending Industry"
order = 2429
part = "Fintech and BaaS"
tags = ["banking", "fintech", "credit-builder", "secured-cards", "credit-reporting", "fcra"]
+++

A credit score needs a credit file, and a credit file needs credit. Credit builder products break that loop by making credit that is nearly riskless to the lender, so it can be offered to people the lender would otherwise decline, and then reporting it to the bureaus every month so the file fills in. The CFPB's research on credit builder loans counted **26 million** credit-invisible adults in the US and **19 million** more whose files were too thin or stale to score. Every product in this chapter answers the same question differently: what secures the credit (a deposit, the loan's own proceeds, nothing at all), what the customer pays for it, and what exactly gets reported.

Four shapes recur. A **secured card** is a revolving line backed by a deposit the customer pledges. A **credit builder loan** is an installment loan whose proceeds stay locked in a deposit account until the loan is repaid, so the customer pays first and receives the money last. A **share-secured loan** is the credit union version, a loan against savings the member already has. **Rent and bill reporting** adds payments that aren't credit (rent, utilities, phone, streaming) to a file without any loan at all. The first three are credit under Regulation Z with ordinary disclosures and an APR; the last is data furnishing. All four make the furnishing pipeline the product: the customer isn't buying a loan, they're buying the tradeline.

This chapter covers each shape, the CFPB's evidence on whether they work, the rules that apply (Regulation Z's fee cap and offset ban, FCRA furnishing, credit repair law), worked numbers, and the data model. Unsecured cards are [Credit Cards as Credit](/books/banking-and-lending/credit-cards); the monthly Metro 2 file, disputes and accuracy duties are Furnishing Credit Data; rent reporting from the landlord's side is Property Tech's [Rent Reporting](/books/property-tech/resident-financial-products#rent-reporting).

## How the Platforms Do It

As of October 2026, from the products' own pages:

| Product | Shape | What secures it | Cost | Reporting and graduation |
| --- | --- | --- | --- | --- |
| **Capital One Platinum Secured** | Secured card | Refundable deposit of $49, $99 or $200 for a $200 line, payable within 35 days; more deposit raises the line by up to $1,000 | $0 annual fee; 29.24% variable APR | Reports to three bureaus; considered for an unsecured upgrade "in as little as 6 months"; deposit returned on upgrade, or on closing with the balance paid |
| **Discover it Secured** | Secured card | Deposit from $49 for a $200 minimum line | No annual fee | Reports to three bureaus; can earn the deposit back after a record of on-time payments |
| **Chime Card** (formerly Credit Builder), on The Bancorp Bank or Stride Bank | Secured card with a dynamic limit | Money the customer moves into a Secured Deposit Account sets the spending limit; requires a Chime Checking account | No annual fee, no interest, no credit check | Reports to three bureaus; "Utilization is not reported" |
| **Self Credit Builder Account**, on Lead Bank, Sunrise Banks or First Century Bank | Credit builder loan | The loan proceeds, held in a certificate of deposit until paid off | Example: $35 a month for 24 months, 14.70% rate, 15.97% APR, $9 admin fee | Reports to three bureaus after the first payment; the CD is released at the end, less interest and fees |
| **Kikoff** | Store-only revolving line | Nothing: the line can only be used in Kikoff's own store | $5, $20 or $35 a month for lines of $750, $2,500 or $3,500 | Reports to three bureaus; no interest or credit check; the monthly fee isn't returned |
| **Credit unions** (share-secured loans) | Installment loan against savings | The member's share account, held until the loan is paid | The credit union's loan rate | Positioned for establishing credit; dividends keep accruing on the pledged shares |
| **Experian Boost** | Bill reporting | No credit involved | Free | Adds phone, utility, cable and internet, streaming, some rent and insurance payments to the Experian file only; computed on FICO Score 8 |

Three things stand out. **The secured card's deposit is the underwriting.** Capital One's $49 deposit for a $200 line shows the deposit doesn't have to equal the limit; the issuer decides how much of the line is unsecured, which is a credit decision with an applicant behind it. Chime's design removes that decision entirely: the limit is whatever the customer has moved in, so there is no unsecured exposure and no credit check. **Graduation is the exit.** A secured card is meant to become an unsecured one, and the upgrade review is a recurring account-level decision with a deposit refund attached. **Reporting choices differ deliberately.** Chime doesn't report utilization, so moving money in and spending it doesn't look like a maxed-out card; Experian Boost touches one bureau and one scoring model; Self reports an installment tradeline. What each product sends is a design decision the customer can't see and the score depends on.

## Secured Cards

A secured card is ordinary open-end credit with a pledge. The customer deposits funds, the issuer takes a security interest in them, and the card has a line. Everything in [Credit Cards as Credit](/books/banking-and-lending/credit-cards) applies: the CARD Act's rules, periodic statements, minimum payments, interest if the balance revolves. Two Regulation Z rules shape the secured part.

**The offset ban.** A card issuer "may not take any action, either before or after termination of credit card privileges, to offset" a cardholder's card debt against funds the cardholder has on deposit with it (12 CFR 1026.12(d)(1)). Two exceptions make secured cards possible: a **consensual security interest** in the deposit, and a **periodic deduction plan** the cardholder authorizes in writing (1026.12(d)(2) and (3)). So the record has to say which of the two lets the issuer touch the deposit: a signed security agreement over a specific account, or an autopay authorization. A secured card program that sweeps a customer's ordinary checking account to pay the card without either is doing what the rule forbids.

**The first-year fee cap.** Fees the consumer is required to pay in the first year may not exceed 25% of the credit limit at opening, excluding late, over-limit and returned-payment fees (1026.52(a)). The commentary is specific about deposits: "A security deposit that is charged to a credit card account is a fee" for this purpose, while funds pledged at opening that don't come from the account aren't, even if they exceed 25% of the limit (comment 52(a)(2)-5). That is the pattern the rule was written against: fees and deposits billed onto a small line until little of it is left to use.

**The deposit is a deposit.** The pledged funds sit in a deposit account at the bank, insured under the depositor's ownership category like any other ([Deposit Insurance](/books/banking-and-lending/deposit-insurance#the-ownership-categories)), and earn whatever the account terms say. On the core it is a deposit account with a hold or block for the pledge ([Holds and Blocks](/books/banking-and-lending/posting-holds-and-balances#holds-and-blocks)); the card is a separate line account; and the collateral record links them.

**Graduation.** Issuers review secured accounts for an upgrade on a schedule (Capital One says as early as six months). An upgrade is a credit decision on an existing account: a new limit, an unsecured line, and the deposit returned as a credit to the customer's account or a check. A review that leaves the account as it was changes nothing; a reduced limit or a closure is adverse action on an existing account, with its notice ([Credit Limits](/books/banking-and-lending/credit-cards#credit-limits); [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action#when-a-notice-is-owed)).

## Credit Builder Loans

A credit builder loan inverts the usual order. The lender books an installment loan, but instead of disbursing the proceeds it deposits them in a CD or savings account in the borrower's name and holds them as collateral. The borrower makes monthly payments; each is reported to the bureaus; at the end the loan is paid off and the deposit is released, so the borrower gets back roughly what they paid in, minus interest and fees. The lender's risk is close to zero, because the collateral is the principal.

Self's published example: $35 a month for 24 months at a 14.70% interest rate and a $9 nonrefundable admin fee, for a **15.97% APR**, returning **$724** at the end after **$116** of interest. Self describes itself as not the lender; the loans are made by its partner banks, which is the same program structure as any fintech on a sponsor bank ([Banking as a Service](/books/banking-and-lending/banking-as-a-service#the-roles)). A fintech credit builder loan therefore has two accounts at the bank (the loan and the locked CD), one program, and a disclosure set that is a standard closed-end TILA box ([The Product and Its Disclosures](/books/banking-and-lending/installment-loans#the-product-and-its-disclosures)).

**What the evidence says.** The CFPB's July 2020 study, run with a Midwestern credit union, offered a $600, 12-month credit builder loan (about $54 a month) to 1,531 members:

- **Take-up:** 30% in the group offered the loan against 12% in the comparison group.
- **Starting point:** 82% already had a score, averaging 560; 70% had existing loans; 62% earned under $30,000.
- **Who benefited:** members with no existing debt were at least 24% more likely to have a score afterward, and their scores rose by about 8.9 points; members who already had debt saw scores fall by about 3.1 points.
- **Late payments:** 39% of borrowers paid the credit builder loan late at least once.

The lesson for a builder is that the product amplifies whatever payment behavior the customer brings. For someone with no file, any on-time tradeline helps. For someone already stretched, another monthly obligation adds a chance to report a late payment, and a late payment hurts more than an on-time one helps. Autopay from the customer's account, reminders before the due date, and a grace window before a payment is reported late are product decisions that move the outcome.

**Share-secured loans** are the same idea without the lockbox step: a credit union lends against shares the member already has, holds the pledged amount until the loan is paid, and keeps paying dividends on it.

## Rent and Bill Reporting

Rent, utility, phone and subscription payments aren't credit, so they don't reach a bureau unless someone furnishes them. Two routes exist:

- **Furnished by a landlord, property manager or a reporting vendor** on the landlord's behalf: the Property Tech volume covers the choices (positive-only or full-file, opt-in or opt-out, who pays and who furnishes) and California's statute in [Rent Reporting](/books/property-tech/resident-financial-products#rent-reporting).
- **Consumer-permissioned**: the consumer connects a bank account and the bureau or a vendor reads the payments from the transactions. Experian Boost is the clearest example. It adds qualifying payments to the Experian file alone, its results are computed on FICO Score 8, and lenders using another bureau or another score may see no change. The data path is open banking ([Open Banking in the US](/books/banking-and-lending/open-banking)), and the consumer can remove the data.

Either way the reporter is a furnisher under the FCRA, with duties not to report what it knows is inaccurate, to correct and update, to note disputes and investigate them, and to report the date of first delinquency for accounts in collection (15 U.S.C. 1681s-2), which the Property Tech chapter quotes and Furnishing Credit Data covers in depth.

**Credit repair law sits next to all of this.** The Credit Repair Organizations Act forbids charging "any money" before a service to improve a consumer's credit is fully performed, with exclusions for depository institutions and creditors (15 U.S.C. 1679b). A bank's secured card or credit builder loan is credit from the creditor itself; a monthly fee from a nonbank for "building credit" that isn't attached to a credit product is closer to the statute's text, which is why the Property Tech chapter flags it and why the billing timing of any fee-only credit-building service is a question for counsel, configured per product rather than fixed.

## Worked Numbers

**A credit builder loan's cost.** Self's example, checked: 24 payments of $35 total **$840**. The CD holds **$724**, the principal, and the difference, **$116**, is interest at 14.70% (a $724 loan at 1.225% a month for 24 months amortizes to $35.00). The $9 admin fee is a prepaid finance charge, so the amount financed is $715, and $35 a month on $715 over 24 months is the **15.97% APR**. The customer's all-in cost to build a 24-month installment tradeline is $125, less any interest the CD earns, and they get $724 back at the end. The APR is high for a loan with no risk; the product is priced as a service.

**A secured card's fee cap.** A secured card with a $200 line can charge at most $50 in required fees in the first year (25% of $200), not counting late, over-limit or returned-payment fees. A $49 deposit paid from the customer's own funds isn't a fee and doesn't count. If the issuer instead billed a $200 deposit onto the card itself, the deposit would be a $200 fee and the account would exceed the cap on day one.

**A dynamic-limit card's utilization.** A customer moves $300 into the secured account and spends $280 on the card. On a fixed-limit card that is 93% utilization, which most scoring models read as stress; a program that reports the deposit as the limit and the balance as owed shows exactly that, every month. Chime's choice not to report utilization is a design answer to this arithmetic. Which fields a product sends, and their values, is product configuration with a version, decided before the first file goes out.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). A secured card is a line account with a `loans` row (`amortization = 'revolving'`) and a [`credit_lines`](/books/banking-and-lending/credit-cards#how-to-build-it) row, mapped one to one to the Payments volume's `card_accounts`; the pledged funds are a separate deposit `accounts` row; and a `collateral` row with `kind = 'deposit'` and `identifier` set to that account's ID links the two. A credit builder loan is a loan account with `amortization = 'level_payment'`, its locked CD a deposit account, and the same `collateral` link. The pledge on the deposit is a `holds` row with `reason = 'collateral'` and no expiry.

```sql
CREATE TABLE secured_credit_terms (          -- how the deposit and the credit relate
  account_id            UUID PRIMARY KEY REFERENCES loans (account_id),  -- the line or loan
  collateral_id         UUID NOT NULL REFERENCES collateral (id),        -- kind = 'deposit'
  shape                 TEXT NOT NULL CHECK (shape IN ('secured_card', 'dynamic_limit_card',
                          'credit_builder_loan', 'share_secured_loan')),
  limit_rule            TEXT NOT NULL CHECK (limit_rule IN ('fixed', 'equal_to_deposit',
                          'deposit_plus_unsecured', 'not_applicable')),
  unsecured_portion     BIGINT NOT NULL DEFAULT 0,  -- the part of the line the deposit doesn't cover
  offset_basis          TEXT NOT NULL CHECK (offset_basis IN ('security_interest',
                          'written_autopay')),      -- 1026.12(d)(2) or (d)(3)
  security_agreement_id UUID REFERENCES disclosures (id),  -- the signed pledge, as delivered
  deposit_charged_to_account BOOLEAN NOT NULL DEFAULT false,  -- true makes it a 1026.52(a) fee
  graduation_review_months SMALLINT,          -- null: the product never graduates
  reporting_profile     JSONB NOT NULL,       -- bureaus, account type, which limit and balance fields
  CHECK (offset_basis <> 'security_interest' OR security_agreement_id IS NOT NULL)
);

CREATE TABLE graduation_reviews (            -- a secured line considered for unsecured credit
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES secured_credit_terms (account_id),
  reviewed_at           TIMESTAMPTZ NOT NULL,
  credit_decision_id    UUID NOT NULL REFERENCES credit_decisions (id),  -- kind = 'review'
  outcome               TEXT NOT NULL CHECK (outcome IN ('no_change', 'graduated',
                          'limit_increased', 'limit_decreased', 'closed')),
  new_limit             BIGINT,
  deposit_release_id    UUID,                 -- collateral_releases, below, when graduated
  notice_id             UUID REFERENCES disclosures (id)  -- required for a decrease or closure
);

CREATE TABLE collateral_releases (           -- returning the deposit
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  collateral_id         UUID NOT NULL REFERENCES collateral (id),
  reason                TEXT NOT NULL CHECK (reason IN ('paid_in_full', 'graduated', 'closed',
                          'applied_to_balance')),  -- applied: the deposit paid off a charged-off balance
  amount_released       BIGINT NOT NULL CHECK (amount_released >= 0),
  amount_applied        BIGINT NOT NULL DEFAULT 0,   -- used against the debt under the pledge
  hold_id               UUID NOT NULL REFERENCES holds (id),  -- the collateral hold it ends
  transaction_id        UUID REFERENCES transactions (id),    -- the credit to the customer
  released_at           TIMESTAMPTZ NOT NULL
);
```

The constraints carry the two Regulation Z rules: no `security_interest` basis without a signed agreement on file, and a deposit charged to the account flagged so the fee-cap check counts it. The first-year cap itself is a product rule evaluated at opening and on every fee ([Fee Schedules](/books/banking-and-lending/product-configuration#fee-schedules)), summing `fee_assessments` for the account's first year against 25% of the opening limit. A dynamic-limit card recomputes its available credit from the deposit balance on every move into or out of the secured account, and the card authorization reads it like any other available balance ([Issuer Processing](/books/payments/issuer-processing#the-checks-in-order)). A credit builder loan's release at payoff is one journal entry: release the hold, close the CD into the customer's account, and record any interest the CD earned; an early closure applies the CD to the loan balance first, recorded as `amount_applied`.

`reporting_profile` is versioned with the product and is the input to the monthly furnishing file that [Furnishing Credit Data](/books/banking-and-lending/credit-reporting#how-to-build-it) defines: which bureaus, which account type (revolving or installment), whether the reported limit is the line, the deposit or omitted, and when a payment counts as late for reporting. A change to it is a product version change with a date, because every tradeline the bureaus hold was produced under one profile or another.

## Auditing

These products are examined as credit (Regulation Z, UDAP, fair lending) and as furnishing (FCRA accuracy and disputes), and they draw complaints when a deposit isn't returned. Keep:

- **The pledge:** the security agreement or autopay authorization, as signed, and which one the issuer relied on for each use of the deposit.
- **First-year fees** against the 25% cap, with the opening limit and whether any deposit was charged to the account.
- **Every graduation review,** with its decision record and any notice.
- **Every release of collateral,** amount, timing and destination, matched to the account's closure or graduation; an unreturned deposit is the common complaint.
- **The reporting profile in force** for each month furnished, so a disputed tradeline can be explained field by field ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Consent records** for consumer-permissioned bill reporting, including removal.

## What This Means for the System You Build

- **Two accounts and a link:** the credit account, the deposit that secures it, and a collateral row and hold between them.
- **The basis for touching the deposit is recorded,** a security interest or a written autopay plan, never inferred.
- **The fee cap counts what it should,** including a deposit charged to the account.
- **Graduation is a scheduled credit decision** with a deposit release attached.
- **What gets reported is product configuration,** versioned, because the tradeline is the product.
- **Release is a ledger event,** the hold ended and the money moved, on the day the loan closes.

## References

**Law and regulation**

- [12 CFR 1026.12: Special credit card provisions](https://www.law.cornell.edu/cfr/text/12/1026.12), the offset ban and its exceptions for consensual security interests and written periodic deductions
- [12 CFR 1026.52: Limitations on fees](https://www.law.cornell.edu/cfr/text/12/1026.52), the first-year 25% cap and its exclusions
- [CFPB: Official interpretation of 1026.52](https://www.consumerfinance.gov/rules-policy/regulations/1026/interp-52/), comment 52(a)(2)-5 on security deposits charged to the account
- [15 U.S.C. 1681s-2: Responsibilities of furnishers](https://www.law.cornell.edu/uscode/text/15/1681s-2), accuracy, correction, disputes and the date of first delinquency
- [15 U.S.C. 1679b: Prohibited practices (Credit Repair Organizations Act)](https://www.law.cornell.edu/uscode/text/15/1679b), the advance-fee prohibition

**Regulators and research**

- [CFPB: Targeting credit builder loans (July 2020)](https://www.consumerfinance.gov/data-research/research-reports/targeting-credit-builder-loans/), the study design, take-up, baseline, score effects by existing debt, late payments, and the credit-invisible and unscorable counts
- [CFPB: Targeting credit builder loans, report (PDF)](https://files.consumerfinance.gov/f/documents/cfpb_targeting-credit-builder-loans_report_2020-07.pdf), the $600, 12-month loan and the full findings
- [CDIA: Metro 2 information](https://www.cdiaonline.org/resources/furnishers-of-data-overview/metro2-information/), Metro 2 as the industry furnishing format

**Vendor documentation**

- [Capital One: Platinum Secured](https://www.capitalone.com/credit-cards/platinum-secured/), deposits, line, APR, upgrade timing, deposit return and bureau reporting
- [Discover: Discover it Secured](https://www.discover.com/credit-cards/secured/), deposit, minimum line, annual fee and earning the deposit back
- [Chime: Credit Builder (Chime Card)](https://www.chime.com/credit-builder/), the Secured Deposit Account, no fees or interest, issuing banks, reporting and utilization
- [Self: Credit builder loan](https://www.self.inc/credit-builder-loan), the CD-secured loan, partner banks and reporting
- [Self: What is a credit builder loan](https://www.self.inc/blog/what-is-a-credit-builder-loan), the $35, 24-month example with its rate, APR, fee, interest and release amount
- [Kikoff](https://kikoff.com/), the store-only line, its tiers and fees, and bureau reporting
- [Experian: Experian Boost](https://www.experian.com/consumer-products/score-boost.html), the payment types added, Experian-only effect and FICO Score 8
- [Service Credit Union: Share secured loans](https://servicecu.org/borrow/share-secured-loans/), the pledged savings, dividends and credit-building purpose
