+++
title = "Small Business Lending"
description = "Term loans, lines, SBA 7(a) and 504, equipment finance, invoice financing, MCAs versus loans, revenue-based financing, guarantees and UCC filings."
category = "Banking & Lending Industry"
order = 2439
part = "Business Lending"
tags = ["banking", "lending", "small-business", "sba", "merchant-cash-advance", "ucc"]
+++

A small business borrows for the same reasons a household does (to buy something now and pay for it later, or to survive a gap between paying out and getting paid), but almost none of the consumer rules apply. There is no Truth in Lending box, no state small-loan cap written for it in most states, no ability-to-repay rule. What there is instead: a credit decision on a company whose finances are often its owner's, a personal guarantee that puts the owner's house back in the deal, a public filing that tells every other lender which assets are already pledged, a federal guarantee program with a rulebook of its own, and a family of products that say they aren't loans at all. A merchant cash advance buys a business's future sales at a discount; whether it really is a purchase or a loan in disguise decides which laws apply, and courts and attorneys general have spent a decade answering that one contract at a time.

This chapter covers the products (term loans and lines, SBA 7(a) and 504, equipment finance, invoice factoring and financing, merchant cash advances, revenue-based financing), the line between a purchase and a loan, personal guarantees, UCC filings, and how a lending system records them. Financing offered inside a payments platform and repaid from payouts is [Embedded Lending](/books/banking-and-lending/embedded-lending), which also covers the state commercial financing disclosure laws; large and complex business credit (covenants, borrowing bases, syndications) is [Commercial Lending](/books/banking-and-lending/commercial-lending). Small business lending data collection under section 1071 is covered in [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending).

## How the Platforms Do It

As of October 2026, from lenders' published terms, filings and the SBA's program pages:

| Lender or program | Product | Who funds it | Repayment | A figure that shows the model |
| --- | --- | --- | --- | --- |
| **Banks and credit unions under SBA 7(a)** | Term loans and lines up to $5 million with a federal guarantee | The lender, with SBA guaranteeing 50% to 90% depending on the program | Monthly principal and interest; variable rates capped at a spread over the base rate | Holders of 20% or more of the business generally must guarantee the loan |
| **SBA 504 through Certified Development Companies** | Long-term fixed-asset financing (real estate, long-lived equipment) | A bank's first-lien loan, a CDC loan funded by an SBA-guaranteed debenture, and the borrower's equity | 10-, 20- or 25-year terms, the CDC portion at a rate pegged above 10-year Treasuries | Costs about 3% of the debt, which may be financed with the loan |
| **Enova** (OnDeck, Headway Capital) | High-yield small business installment loans and lines | Debt facilities, securitizations and bank partner programs | Fixed installments | Average annualized yields of 48% on small business installment loans and 49% on lines in 2025 |
| **Square Loans** (Block) | Business loans by invitation, $100 to $500,000 | Issued by Square Financial Services, a Utah industrial bank; a majority sold to institutional investors through forward flow | A percentage of daily card sales, with a minimum payment | Sized under 20% of a seller's expected annual Square volume, repaid in about ten months on average, more than $32.8 billion of principal since May 2014 |
| **Lighter Capital** | Revenue-based financing for software and tech companies | Its own funds | A fixed percentage of monthly revenue (or a fixed payment) until a capped multiple is repaid | A 1.2 cap on $500,000 means $600,000 repaid, over 1 to 5 years |
| **Clearco** | Funding for inventory, supplier invoices and purchase orders | Its own funds | Over terms of up to 12 months | Up to $10 million; requires over $100,000 of monthly revenue for six months |

Three things stand out. **The guarantee program is the bank product:** a bank's small business loan is often an SBA loan, and the SBA's rules (who must guarantee, what collateral, which rate, which fee) are a second credit policy layered on the bank's. **Repayment from sales is now ordinary:** Square sizes loans to card volume and collects from it, Lighter collects a share of revenue, and the merchant cash advance industry built itself on the same mechanism. **Funding shapes the product as much as risk does:** Square sells most of its loans to investors and Enova lends through bank partners, so the product terms have to suit whoever buys or holds the loan. [Funding the Book](/books/banking-and-lending/funding-the-book) covers forward flow.

Where businesses apply is moving. The Federal Reserve's 2025 Small Business Credit Survey (fielded September to November 2025) found that 60% of employer firms applied for financing in the prior 12 months; large banks were the most common place to apply, and the share applying to online lenders rose from 17% in 2020 to 29% in 2025. Small banks had the highest full-approval rate, 57%.

## Term Loans and Lines

The two shapes underneath every other product:

- **A term loan** advances a sum once and amortizes it on a schedule, monthly for bank and SBA loans, daily or weekly for many online lenders. It finances something with a life: an acquisition, a build-out, a vehicle, a refinancing. The schedule, accrual and payment allocation are the installment machinery from [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-interest-accrues), usually on a variable rate (an index plus a margin) rather than a fixed one.
- **A line of credit** sets a limit the business draws on and repays, revolving. It finances working capital: inventory before a season, payroll before receivables come in. Two designs are common. A bank line is one revolving balance with interest on what's drawn, renewed annually after a review. Many online lines treat each draw as its own small installment loan: Stripe Capital's line approves "each draw as a separate loan" and reevaluates the limit after 90 days. The second design is simpler to price and service, and it means a "line" in the ledger is a limit on one account and a series of loan accounts underneath it.

Both are business-purpose credit, which takes them outside Regulation Z's disclosure rules but not outside the Equal Credit Opportunity Act. Regulation B applies to business credit with lighter notice rules: for a business with gross revenues of $1 million or less, the creditor may tell the applicant of the action orally or in writing and disclose the right to a statement of reasons at application, and the reasons are due on request made within 60 days; above $1 million, notice is due "within a reasonable time," with reasons on written request within 60 days. How decisions and reasons are built is [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action).

## SBA 7(a) and 504

The SBA doesn't usually lend. It guarantees part of a loan a bank or other lender makes, and in exchange the lender follows the SBA's Standard Operating Procedure 50 10 for eligibility, underwriting, collateral, fees and servicing. SOP 50 10 8 took effect June 1, 2025; version 8.1, with technical policy updates, took effect October 1, 2026 for both 7(a) and 504. A loan is underwritten to the SOP version in force when it's approved, so the version is a field on the loan, not a constant in the code.

The 7(a) family, as the SBA lists it in October 2026:

| Program | Maximum | SBA guarantee | Collateral | Maturity notes |
| --- | --- | --- | --- | --- |
| Standard 7(a) | $350,001 to $5 million | 75% | Considered fully secured under SOP 50 10 criteria | SBA turnaround of 5 to 10 business days |
| 7(a) Small | $350,000 | 85% up to $150,000, 75% above | None required up to $50,000; above that the lender's policy, but a loan can't be declined solely for inadequate collateral | Term loans only |
| SBA Express | $500,000 | 50% | As 7(a) Small | Revolving lines up to 10 years; the lender makes the credit decision |
| Export Express | $500,000 | 90% up to $350,000, 75% above | As SBA Express | Revolving lines up to 7 years |
| Export Working Capital | $5 million | 90% | Export inventory and foreign receivables generally adequate | Revolving lines of 36 months or less; no SBA maximum rate |
| International Trade | $5 million | 90% | | |
| MARC (Manufacturers' Access to Revolving Credit) | $5 million | 85% up to $150,000, 75% above | At a minimum a lien on all business assets, except vehicles and trading assets | Revolving loans up to 20 years (10 revolving, 10 term) |
| Working Capital Pilot | $5 million | 85% up to $150,000, 75% above | | Up to 60 months |

Four rules from the regulation shape the loan record:

- **Personal guarantees.** "Holders of at least a 20 percent ownership interest generally must guarantee the loan," and the SBA or the lender may require other guarantees regardless of ownership (13 CFR 120.160(a)). The ownership table at approval decides who signs.
- **Rate caps.** A variable rate floats on the prime rate or the SBA's Optional Peg Rate, changes no more often than monthly, and may carry a spread of at most 6.5 points for loans of $50,000 or less, 6.0 points above $50,000 to $250,000, 4.5 points above $250,000 to $350,000, and 3.0 points above $350,000; balloon payments aren't allowed (13 CFR 120.214).
- **Insurance.** Hazard insurance is required on collateral for 7(a) loans over $500,000 and 504 projects over $500,000 (13 CFR 120.160(c)).
- **Fees.** The SBA publishes the upfront guarantee fee and the lender's annual service fee each fiscal year in an Information Notice; the lender may pass the upfront fee to the borrower but not the annual fee. Fee tables are effective-dated reference data, keyed by fiscal year and loan size.

**504** finances fixed assets: buildings, land, and machinery with a useful life of at least ten years, but not working capital, inventory or speculative real estate. A project has three pieces: a bank's loan in first position, a Certified Development Company's loan in second position (funded by an SBA-guaranteed debenture), and the borrower's contribution. The borrower puts in at least 10%, 15% if the business has operated two years or less or the project is a limited or single-purpose building, and 20% if both (13 CFR 120.910). The bank's loan must be at least as large as the 504 loan, and at least 50% of project cost in the new-business and special-purpose cases (13 CFR 120.920). The 504 loan goes up to $5.5 million in the body of the SBA's page (its summary says $5 million), on 10-, 20- or 25-year terms.

### Worked numbers: two SBA loans

A $1,000,000 standard 7(a) loan carries a 75% guarantee: $750,000 guaranteed, $250,000 at the lender's risk. Its variable rate may be at most prime plus 3.0 points. If the borrower is a company owned 60% by one founder, 25% by a second and 15% by a third, the first two must guarantee under the 20% rule; the third may be asked to, but the rule doesn't require it. A $150,000 7(a) Small loan is 85% guaranteed ($127,500), may carry up to 6.0 points over the base rate, and needs no collateral beyond the lender's policy above $50,000.

A $2,000,000 504 project for an established business buying a general-purpose building could be $1,000,000 from the bank (half the project, in first position), $800,000 from the CDC (second position) and $200,000 from the borrower (10%). The same building bought by a company in its second year needs 15% down ($300,000) and a bank loan of at least $1,000,000, which leaves at most $700,000 for the CDC. The arithmetic is the regulation's; the split a given CDC and bank agree is theirs.

When an SBA loan defaults, the lender liquidates collateral and asks the SBA to purchase the guaranteed portion. The guaranteed and unguaranteed portions are one loan to the borrower and two exposures to the lender, so the loan record carries both.

## Equipment Finance

Equipment is the largest secured small business category outside real estate. The Equipment Leasing and Finance Association's 2026 market sizing study estimates that the equipment finance industry reached $1.51 trillion in 2025, financing about 55.2% of the $2.7 trillion invested in equipment and software; leases were 23% of acquisitions, secured loans 13%, unsecured loans 8% and lines of credit 14%. Banks, manufacturers' captive finance companies and independent lessors all compete for it.

Two legal questions decide how an equipment deal is booked:

- **Is it a lease or a loan?** A transaction in the form of a lease is a security interest (a disguised secured sale) if the lessee can't terminate it and the term covers the equipment's remaining economic life, or the lessee must renew or buy, or the lessee may renew or buy for nominal consideration (UCC 1-203(b)). Consideration is nominal if it's less than the lessee's reasonably predictable cost of performing if the option isn't exercised; a fair-market-value purchase option isn't nominal (1-203(d)). A **$1 buyout lease** is a loan in lease clothing; a **fair-market-value lease** is a true lease, where the lessor owns the equipment and carries the residual. The classification sets the accounting, the tax treatment and what the lessor files.
- **Who's first?** A lender financing the purchase of the equipment itself has a **purchase-money security interest**, which beats an earlier blanket lien on the business's assets if it's perfected when the debtor takes possession or within 20 days after (UCC 9-324(a)). That 20-day window is a deadline the funding workflow has to meet: file the financing statement before or right after delivery, not at month end.

An **equipment finance agreement (EFA)** is a loan by another name: the borrower owns the equipment from day one and grants a security interest, with fixed payments over the equipment's useful life. Its schedule is the installment engine; what's specific is the equipment record (serial number, make, model, location) and the residual or buyout terms where it's a lease. Consumer leases under Regulation M are in [Auto Lending](/books/banking-and-lending/auto-lending#leases); a business lease isn't covered by Regulation M.

## Invoice Factoring and Financing

A business that sells on 30- or 60-day terms has cash tied up in receivables. Two products turn them into cash:

- **Invoice financing (accounts receivable lending)** is a loan secured by receivables: the lender advances a percentage of eligible invoices and the business collects from its customers and repays. At scale it's asset-based lending under a borrowing base, covered in [Commercial Lending](/books/banking-and-lending/commercial-lending#borrowing-bases-and-asset-based-lending); the OCC describes common advance rates of 70% to 85% of eligible receivables.
- **Factoring** is a sale: the factor buys invoices at a discount, advances most of the face value upfront, holds back a reserve, and pays the reserve less its fee when the customer pays. **Recourse** factoring lets the factor sell an unpaid invoice back to the business; **non-recourse** factoring puts the customer's credit risk on the factor (but not, usually, disputes over the goods). **Notification** factoring tells the customer to pay the factor; non-notification lets the business keep collecting.

Factoring sits inside Article 9 even though it's a sale: Article 9 covers "a sale of accounts, chattel paper, payment intangibles, or promissory notes" (UCC 9-109(a)(3)), so a factor files a financing statement just as a lender does. Once the customer (the **account debtor**) is notified of the assignment, it can no longer discharge the invoice by paying the business (9-406(a)), and a contract term forbidding assignment of the receivable is generally ineffective (9-406(d)). That gives notification factoring its strength and its operational burden: every invoice's account debtor, notice date and payee instructions are records, and a payment that lands at the business after notice is money the factor must recover from it.

The state commercial financing disclosure laws reach factoring too: California's covers factoring transactions, New York's has a section for them, and Utah's covers accounts receivable purchase transactions ([Embedded Lending](/books/banking-and-lending/embedded-lending#state-commercial-financing-disclosure-laws)).

## Merchant Cash Advances

A **merchant cash advance (MCA)** is a purchase of a business's future receivables: the provider pays a **purchase price** now for a larger **purchased amount** of the business's future sales, collected as a **specified percentage** of those sales until the purchased amount is delivered. Its price is a **factor rate** (1.35 means $1.35 delivered for every $1 advanced), not an interest rate, and it has no term, because the time to deliver depends on how much the business sells. Stripe's description of the advances YouLend provides on its platform is the industry's own definition: "a merchant cash advance is YouLend's purchase of your business's future receivables. It isn't a loan or a credit transaction," with payments that "vary with your payment processing volume."

Whether that's true for a given contract is the question that matters, because a loan is subject to usury law, licensing and lending regulation, and a true sale mostly isn't. New York courts decide whether an MCA is a disguised loan with a three-factor test from the Appellate Division, Second Department (*LG Funding, LLC v. United Senior Properties of Olathe, LLC*, 181 A.D.3d 664 (2020); *Principis Capital, LLC v. I Do, Inc.*, 201 A.D.3d 752 (2022)): whether the contract has a **reconciliation provision** that adjusts payments to actual receipts, whether it has an **indefinite term**, and whether the provider has **recourse should the merchant declare bankruptcy**. A February 2026 trial court decision states it in those words and applies it clause by clause, finding an indefinite term and no recourse in bankruptcy and then turning to whether the reconciliation provision was real (*Samson MCA LLC v. Elephant Construction Solutions LLC*, 2026 NY Slip Op 50377(U), Sup. Ct. Erie County). I haven't read the two appellate decisions themselves, only the later decisions that quote them. In practice:

- **Reconciliation that works.** A true MCA collects a percentage of what the business actually sells. Many MCAs instead debit a fixed daily amount, an estimate of the percentage, and promise to "reconcile" on request. If reconciliation is hard to get or never granted, the fixed debit is a payment schedule.
- **No term.** A purchased amount delivered over however long the sales take is a sale; a contract that must be paid within a fixed period, or that defaults when sales slow, is a loan.
- **Risk of non-payment on the provider.** If the business fails and the provider has no claim beyond the receivables that never arose, the provider bought a risk. A personal guarantee of the business's performance (not delivering fraud-free receivables, but paying) moves the risk back.

The enforcement record shows what the factors look like when they fail. The New York Attorney General's January 2025 settlement with Yellowstone Capital and affiliates entered a $1.065 billion judgment, with about $534.6 million of debts owed by more than 18,000 businesses cancelled, $16.1 million paid upfront and a permanent industry ban for the companies and officers; the office alleged that the contracts called themselves purchases of future revenue while collecting fixed daily payments over 60 to 90 days, made reconciliation so hard to get that businesses rarely qualified, and produced effective annual rates of up to 820%. The FTC's 2021 order against Yellowstone required $9.8 million, over allegations that it kept withdrawing after advances were repaid and misstated funding amounts and guarantee terms, and its case against RCG Advances (Richmond Capital) ended in industry bans for its operators, including one in October 2023 over the misuse of confessions of judgment.

**Confessions of judgment** were the collection tool: a signed admission that lets the provider enter a judgment without a lawsuit. New York amended CPLR 3218 effective August 30, 2019 so a confession may be filed only in the county where the defendant lived when it signed or lives when the judgment is entered, which in practice ended their use against out-of-state businesses; Virginia's and Texas's sales-based financing laws make them unenforceable outright.

### Worked numbers: what a factor rate costs

A business takes a $50,000 advance at a 1.35 factor: the purchased amount is $67,500, collected at 12% of daily card receipts. The cost of the money depends entirely on how fast the business sells:

| Daily receipts | Daily remittance | Days to deliver $67,500 | Estimated APR |
| --- | --- | --- | --- |
| $2,500 | $300 | 225 | 102.4% |
| $1,750 (sales down 30%) | $210 | 322 | 71.8% |

The APR is the rate that discounts the stream of remittances to the $50,000 advanced, on a 365-day year; the figures are my arithmetic, illustrative, with sales every day. Two things the table shows. A factor rate is not a price until it has a timeline, which is why New York and California require an estimated APR on these products and most other states don't. And when sales fall, a true MCA's cost falls with them: the business remits less each day and the provider waits. A contract that instead debits $300 a day regardless is a loan whose cost rises when the business struggles, which is the arrangement the Yellowstone allegations describe.

For the system, an MCA is a different object from a loan on the same withholding machinery: no interest accrual, no schedule, a purchased amount that falls as remittances arrive, and a reconciliation right that is a workflow with its own clock, not a support ticket. [Embedded Lending](/books/banking-and-lending/embedded-lending#loans-and-advances-on-one-engine) shows how one engine serves both.

## Revenue-Based Financing

Revenue-based financing (RBF) is the MCA's cousin for companies with recurring revenue: the provider advances a sum and collects a fixed percentage of monthly revenue until a capped total is repaid. Lighter Capital describes its cap as a multiple of the amount (a 1.2 cap on $500,000 means $600,000 repaid) over 1 to 5 years, with a fixed-payment alternative, and requires at least $15,000 of monthly recurring revenue. The legal question is the MCA's: an RBF contract with a maximum term or a minimum payment looks more like a loan, one that truly floats with revenue looks more like a purchase. Louisiana's 2025 disclosure law names the product directly ("revenue-based financing") and says its charges "are not interest."

For the system, RBF is monthly rather than daily: the provider needs the business's revenue each month (from a connected accounting system, bank data or a payment processor), computes the remittance, and debits it. Revenue that arrives late or is restated is the operational hazard; the remittance calculation has to be a stored record with its input figures, so a disputed month can be recomputed against the same data.

## Personal Guarantees and Who Else Is Liable

A small business's credit is usually its owner's credit. Lenders take **personal guarantees** from owners: unlimited (the whole debt), limited (a cap or a percentage), or, in MCA and some factoring contracts, a **validity** or performance guarantee that the business won't divert receivables or misrepresent them, without guaranteeing payment.

The rules on who can be made to sign come from three places:

- **The program.** SBA's 20% ownership rule; Square requires a personal guarantee on loans over $250,000; Stripe Capital's UK, French and German financing requires one from directors who are beneficial owners.
- **Regulation B.** A creditor may require guarantees from a business's partners, directors or officers, based on their relationship to the business and not on a prohibited basis ("may not require guarantees only for women-owned or minority-owned businesses"), and may not automatically require the spouses of married officers to sign; it may require an additional party only when the guarantor's own finances don't support the credit (12 CFR 1002.7(d) and its commentary).
- **The structure of the business.** A sole proprietorship has no separate liability, so the owner is the borrower; a general partnership's partners are liable as partners; an LLC's or corporation's owners are liable only by guarantee.

Each guarantee is a contract with its own terms, signer, cap and release conditions, and it outlives changes in ownership unless released. A guarantor is an `account_parties` row with role `guarantor`, and the terms of the guarantee are a record beside it.

## UCC Filings

A lender perfects a security interest in a business's personal property (equipment, inventory, receivables, deposit accounts in some cases, or everything: a **blanket lien**) by filing a **UCC-1 financing statement**. The filing is public notice, and the first to file generally has priority, so a lender searches before it lends and files when it funds. The rules a filing system has to encode:

- **Where.** A registered organization (a corporation or LLC) is located in its state of organization, and an individual at their principal residence (UCC 9-307), so the filing goes to the secretary of state of the state where the LLC was formed, not where it operates.
- **How long.** A financing statement is effective for five years from filing (9-515(a)), then lapses and the security interest becomes unperfected unless continued; a continuation may be filed only within the six months before the five years end (9-515(d)). Missing the window can't be fixed by filing late: a new filing gets a new, later priority date.
- **When to terminate.** For business collateral, when nothing is owed and there's no commitment to lend, the secured party must file or send a termination statement within 20 days of an authenticated demand from the debtor (9-513(c)). Stripe tells borrowers to ask for termination after payoff, and notes that the secured party of record may be a filing agent (Wolters Kluwer, for Stripe Capital) rather than the lender's name.
- **Purchase money.** The 20-day window for a purchase-money interest in equipment (9-324(a)) is a deadline computed from the delivery date.

Filings also tell a story a lender reads: a business with three MCA providers' UCC-1s filed in the last six months is **stacking**, taking advances on top of advances, and a new provider is fourth in line on the same receivables. Search results are an underwriting input, kept with the decision ([Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores) covers the bureau side; business credit exchanges such as the Small Business Financial Exchange, which Stripe Capital reads from and reports to, are the trade-data side).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A small business term loan or line is an `accounts` row with `account_kind` of `loan` or `line` and a `loans` row, owned by a business `parties` row, with guarantors in `account_parties` (role `guarantor`) and its liens in `collateral`. [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) added pricing, and [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) added disbursements, payoff quotes and rate cap rules, all of which apply unchanged. This chapter adds a fourth account kind for purchases of receivables, and the records for guarantees, filings, SBA guarantees, equipment structures and factored invoices.

```sql
-- An MCA or a factoring facility is a purchase, not a loan: same account table, its own kind
ALTER TABLE accounts DROP CONSTRAINT accounts_account_kind_check,
  ADD CONSTRAINT accounts_account_kind_check
    CHECK (account_kind IN ('deposit', 'loan', 'line', 'purchase'));

-- Adds 'mca_reconciliation', keeping the core kinds and Sanctions Screening's.
ALTER TABLE cases DROP CONSTRAINT cases_kind_check,
  ADD CONSTRAINT cases_kind_check CHECK (kind IN ('reg_e_error', 'reg_cc_claim',
    'billing_error', 'fraud_claim', 'credit_report_dispute', 'legal_process', 'complaint',
    'aml_investigation', 'hardship', 'sanctions_review',
    'mca_reconciliation'));

CREATE TABLE receivable_purchases (          -- MCA and RBF terms; one per purchase account
  account_id          UUID PRIMARY KEY REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('merchant_cash_advance', 'revenue_based')),
  purchase_price      BIGINT NOT NULL CHECK (purchase_price > 0),   -- paid to the business
  purchased_amount    BIGINT NOT NULL,       -- receivables to be delivered
  specified_pct_bps   INT NOT NULL,          -- share of sales or revenue remitted
  revenue_basis       TEXT NOT NULL CHECK (revenue_basis IN ('card_receipts', 'all_receipts',
                        'monthly_revenue')),
  remittance_method   TEXT NOT NULL CHECK (remittance_method IN ('split_at_processor',
                        'ach_estimated', 'ach_actual')),
  estimated_remittance BIGINT,              -- for 'ach_estimated': the fixed debit, reconcilable
  reconciliation_right BOOLEAN NOT NULL,
  reconciliation_days SMALLINT,              -- contractual turnaround for a request
  has_fixed_term      BOOLEAN NOT NULL DEFAULT false,  -- true is a recharacterization flag
  bankruptcy_recourse BOOLEAN NOT NULL DEFAULT false,  -- so is this
  guarantee_scope     TEXT NOT NULL CHECK (guarantee_scope IN ('none', 'validity', 'payment')),
  CHECK (purchased_amount > purchase_price)
);

CREATE TABLE reconciliation_requests (       -- a right with a clock, not a support ticket
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES receivable_purchases (account_id),
  case_id             UUID NOT NULL REFERENCES cases (id),   -- the clock lives on the case
  period              DATERANGE NOT NULL,
  actual_receipts     BIGINT NOT NULL,       -- from the statements the business supplied
  evidence_ref        TEXT NOT NULL,
  remitted            BIGINT NOT NULL,       -- what was debited in the period
  owed                BIGINT NOT NULL,       -- specified_pct of actual_receipts
  adjustment          BIGINT NOT NULL,       -- refunded or credited when remitted > owed
  new_estimated_remittance BIGINT,
  decided_at          TIMESTAMPTZ
);

CREATE TABLE guarantees (                    -- the terms behind an account_parties 'guarantor' row
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  scope               TEXT NOT NULL CHECK (scope IN ('unlimited', 'limited_amount',
                        'limited_pct', 'validity')),
  limit_amount        BIGINT,
  limit_pct_bps       INT,
  ownership_pct_at_signing NUMERIC(7, 4),   -- why this person was asked (SBA's 20% rule)
  required_by         TEXT NOT NULL,         -- 'sba_120_160', 'program_policy', 'credit_decision'
  document_ref        TEXT NOT NULL,
  signed_at           TIMESTAMPTZ NOT NULL,
  released_at         TIMESTAMPTZ,
  release_reason      TEXT
);

CREATE TABLE ucc_filings (                   -- every filing and amendment, as filed
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  debtor_party_id     UUID NOT NULL REFERENCES parties (id),
  debtor_name_filed   TEXT NOT NULL,         -- exactly as on the public organic record
  filing_office       TEXT NOT NULL,         -- e.g. 'DE-SOS': the state of organization
  file_number         TEXT,                  -- assigned by the office
  kind                TEXT NOT NULL CHECK (kind IN ('initial', 'amendment', 'continuation',
                        'assignment', 'termination')),
  amends_id           UUID REFERENCES ucc_filings (id),
  collateral_text     TEXT NOT NULL,         -- 'all assets', or the specific description
  secured_party_of_record TEXT NOT NULL,     -- the lender, a funder, or its filing agent
  filed_at            TIMESTAMPTZ,
  lapses_on           DATE,                  -- initial: filed_at + 5 years
  continuation_opens_on DATE,                -- lapses_on - 6 months
  status              TEXT NOT NULL CHECK (status IN ('requested', 'filed', 'rejected',
                        'lapsed', 'terminated'))
);

ALTER TABLE collateral
  ADD COLUMN ucc_filing_id UUID REFERENCES ucc_filings (id),
  ADD COLUMN purchase_money BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN pmsi_perfect_by DATE;           -- debtor's possession date + 20 days (UCC 9-324(a))

CREATE TABLE sba_guarantees (                -- the federal guarantee on a 7(a) loan or a 504 piece
  account_id          UUID PRIMARY KEY REFERENCES loans (account_id),
  program             TEXT NOT NULL CHECK (program IN ('7a_standard', '7a_small', 'express',
                        'export_express', 'export_working_capital', 'international_trade',
                        'working_capital_pilot', 'caplines', '504_cdc', '504_third_party')),
  sba_loan_number     TEXT NOT NULL UNIQUE,
  sop_version         TEXT NOT NULL,         -- '50 10 8.1': the rulebook it was approved under
  guarantee_pct_bps   INT,                   -- null for the 504 third-party loan
  guaranteed_amount   BIGINT,
  base_rate           TEXT CHECK (base_rate IN ('prime', 'optional_peg', 'fixed')),
  max_spread_bps      INT,                   -- from 13 CFR 120.214 by loan size
  upfront_fee         BIGINT,
  upfront_fee_paid_by TEXT CHECK (upfront_fee_paid_by IN ('lender', 'borrower')),
  annual_fee_bps      INT,                   -- the lender's; never billed to the borrower
  fee_notice_ref      TEXT,                  -- the fiscal year's Information Notice
  project_ref         UUID,                  -- groups a 504 project's two loans
  approved_at         TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('approved', 'disbursed', 'purchase_requested',
                        'purchased', 'paid_off', 'cancelled'))
);

CREATE TABLE equipment_finance_terms (       -- the structure, and how the law classified it
  account_id          UUID PRIMARY KEY REFERENCES accounts (id),
  structure           TEXT NOT NULL CHECK (structure IN ('efa', 'dollar_buyout_lease',
                        'fmv_lease', 'fixed_purchase_option_lease')),
  purchase_option     BIGINT,                -- null for fair market value
  remaining_economic_life_months SMALLINT,
  lessee_may_terminate BOOLEAN NOT NULL,
  classification      TEXT NOT NULL CHECK (classification IN ('security_interest', 'true_lease')),
  classification_basis TEXT NOT NULL,        -- which UCC 1-203(b) test decided it
  residual_value      BIGINT                 -- the lessor's risk under a true lease
);

CREATE TABLE factored_invoices (             -- each receivable bought or lent against
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- the facility
  account_debtor      TEXT NOT NULL,         -- the business's customer
  invoice_number      TEXT NOT NULL,
  face_amount         BIGINT NOT NULL,
  invoice_date        DATE NOT NULL,
  due_date            DATE NOT NULL,
  advance_rate_bps    INT NOT NULL,
  advanced            BIGINT NOT NULL,
  reserve             BIGINT NOT NULL,
  fee                 BIGINT NOT NULL DEFAULT 0,
  recourse            BOOLEAN NOT NULL,
  notice_sent_at      TIMESTAMPTZ,           -- after this, only payment to the factor discharges
  status              TEXT NOT NULL CHECK (status IN ('purchased', 'collected', 'short_paid',
                        'disputed', 'recoursed', 'written_off')),
  UNIQUE (account_id, account_debtor, invoice_number)
);
```

Design notes:

- **Purchase is an account kind, not a loan with a flag.** An MCA has no rate, no schedule and no accrual, so it gets no `loans` row; its balance is the purchased amount less remittances, and each remittance is a `transactions` row with its journal entry rather than a `loan_payments` row (which points at `loans`). Keeping it in `accounts` means one query still answers "everything this business owes or has sold us," which is what an underwriter checking for stacking needs. The recharacterization factors (`has_fixed_term`, `bankruptcy_recourse`, `guarantee_scope`, reconciliation) are columns because legal review reads them for every product version, and a product that sets the wrong ones is a loan to every regulator that looks.
- **Reconciliation is a case.** A request opens a `cases` row with a deadline from the contract; the outcome is a computed adjustment from stored receipts. The Yellowstone allegations are a description of what happens when this is a mailbox.
- **Filings carry their own clock.** `lapses_on` and `continuation_opens_on` are computed at filing and drive a job that continues every filing still securing a balance or a commitment, and terminates every one that isn't, within 20 days of a demand ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). The debtor name is stored as filed, because a filing that doesn't give the debtor's name correctly is seriously misleading unless a search under the correct name in the office's standard search logic would still find it (UCC 9-506).
- **The SBA's rulebook is versioned data.** The SOP version, spread cap and fee notice are stored per loan so a 2026 loan is serviced under the rules it was approved under, and the guaranteed amount is a separate exposure for the lender's reporting and for the purchase request after default.
- **Guarantees are contracts.** The `account_parties` role says who is liable; `guarantees` says for how much and why they were asked, which answers both the SBA reviewer ("did every 20% owner sign?") and the fair lending reviewer ("were spouses asked only when the file showed a reason?").

## Auditing

Small business files are reviewed by the lender's credit review, the SBA (for guaranteed loans), state regulators and, for MCAs, plaintiffs' lawyers. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **The ownership table at approval** and every guarantee taken, with the rule that required it and its signature.
- **Every UCC filing and search:** what was found before funding, what was filed, the office, the debtor name, continuations and terminations with their dates.
- **For SBA loans,** the SOP version, the guarantee percentage, the rate against the cap in force, the fees and who paid them.
- **For equipment,** the structure and the classification test that decided it, with the inputs.
- **For MCAs and RBF,** every remittance with the receipts it was computed from, every reconciliation request with its dates and outcome, and the product version's recharacterization terms.
- **For factoring,** each invoice, its notice to the account debtor, and where every collection landed.

## What This Means for the System You Build

- **Treat a purchase of receivables as its own account kind,** with no interest and no schedule, on the same ledger as loans.
- **Make reconciliation a real workflow** with a deadline and a computed adjustment from stored receipts; a fixed debit that never reconciles is a loan.
- **Store every guarantee as a contract** beside the guarantor's role, with why it was required.
- **Run UCC filings on a calendar:** lapse dates, the six-month continuation window, 20-day purchase-money and termination deadlines.
- **Version the SBA's rules per loan** (SOP version, rate cap, fees) and track the guaranteed and unguaranteed portions as separate exposures.
- **Classify every equipment deal** as a lease or a security interest by the UCC test, and keep the inputs.
- **Read the lien record before lending,** because stacked advances on the same receivables are the clearest public sign of a business in trouble.

## References

**Law and regulation**

- [Cornell LII: 13 CFR 120.160, loan conditions](https://www.law.cornell.edu/cfr/text/13/120.160), guarantees by holders of at least 20% and hazard insurance on 7(a) loans and 504 projects over $500,000
- [Cornell LII: 13 CFR 120.214, conditions for variable interest rates](https://www.law.cornell.edu/cfr/text/13/120.214), prime or the Optional Peg Rate as base, monthly changes, maximum spreads of 6.5, 6.0, 4.5 and 3.0 points by loan size, and no balloon payments
- [Cornell LII: 13 CFR 120.910, borrower contribution to a 504 project](https://www.law.cornell.edu/cfr/text/13/120.910), 10%, 15% for a new business or limited or single-purpose property, and 20% for both
- [Cornell LII: 13 CFR 120.920, required participation by the third party lender](https://www.law.cornell.edu/cfr/text/13/120.920), third-party loans at least equal to the 504 loan, at least 50% of project cost in the two special cases, and the 504 loan's usual second lien
- [Cornell LII: UCC 1-203, lease distinguished from security interest](https://www.law.cornell.edu/ucc/1/1-203), the tests in (b) and nominal consideration in (d)
- [Cornell LII: UCC 9-109, scope](https://www.law.cornell.edu/ucc/9/9-109), security interests by contract and sales of accounts, chattel paper, payment intangibles and promissory notes
- [Cornell LII: UCC 9-307, location of debtor](https://www.law.cornell.edu/ucc/9/9-307), registered organizations in their state of organization and individuals at their principal residence
- [Cornell LII: UCC 9-324, priority of purchase-money security interests](https://www.law.cornell.edu/ucc/9/9-324), priority for a purchase-money interest in non-inventory goods perfected within 20 days of possession
- [Cornell LII: UCC 9-406, discharge of account debtor](https://www.law.cornell.edu/ucc/9/9-406), payment only to the assignee after notice and anti-assignment terms made ineffective
- [Cornell LII: UCC 9-506, effect of errors or omissions](https://www.law.cornell.edu/ucc/9/9-506), a debtor name that fails 9-503(a) is seriously misleading unless the standard search logic would find it
- [Cornell LII: UCC 9-513, termination statement](https://www.law.cornell.edu/ucc/9/9-513), the 20-day duty after an authenticated demand when nothing is owed or committed
- [Cornell LII: UCC 9-515, duration and effectiveness of financing statement](https://www.law.cornell.edu/ucc/9/9-515), five years, lapse and the six-month continuation window
- [CFPB: Regulation B § 1002.7, rules concerning extensions of credit](https://www.consumerfinance.gov/rules-policy/regulations/1002/7/), spouse and additional-party signatures, and the commentary on business guarantees and officers' spouses
- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), the 30-day notice and the business credit rules above and below $1 million of revenue
- [New York Senate: S6395 of 2019](https://www.nysenate.gov/legislation/bills/2019/S6395), the CPLR 3218 amendment on where a confession of judgment may be filed, signed and effective August 30, 2019

**Regulators and programs**

- [SBA: Types of 7(a) loans](https://www.sba.gov/partners/lenders/7a-loan-program/types-7a-loans), maximums, guarantees, collateral and maturities by program, SOP 50 10 8 and 8.1 effective dates, and the annual fee notices
- [SBA: 7(a) loans](https://www.sba.gov/funding-programs/loans/7a-loans), the $5 million maximum, uses and eligibility
- [SBA: 504 loans](https://www.sba.gov/funding-programs/loans/504-loans), eligible uses, maximum amount, terms, the rate peg and costs of about 3%
- [SBA: SOP 50 10, lender and development company loan programs](https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs), versions 8 (June 1, 2025) and 8.1 with technical updates (October 1, 2026)
- [Federal Reserve Banks: 2025 Small Business Credit Survey, report on employer firms](https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms), the share applying, where they applied, the rise of online lenders and small banks' full-approval rate
- [OCC: Comptroller's Handbook, Asset-Based Lending](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/asset-based-lending/pub-ch-asset-based-lending.pdf), common advance rates on eligible receivables

**Enforcement and litigation**

- [New York Official Reports: *Samson MCA LLC v. Elephant Construction Solutions LLC*, 2026 NY Slip Op 50377(U) (Sup. Ct. Erie County, February 23, 2026)](https://www.nycourts.gov/reporter/3dseries/2026/2026_50377.htm), the three-factor test (reconciliation, indefinite term, recourse in bankruptcy) quoted from *Principis Capital v. I Do*, 201 A.D.3d 752, and *LG Funding v. United Senior Properties of Olathe*, 181 A.D.3d 664, and applied clause by clause
- [New York Attorney General: $1 billion settlement with Yellowstone Capital (January 22, 2025)](https://ag.ny.gov/press-release/2025/attorney-general-james-announces-1-billion-settlement-predatory-lender), the judgment, debts cancelled, the upfront payment, the alleged fixed daily debits and failed reconciliation, rates up to 820%, and the industry ban
- [FTC: Yellowstone Capital to pay $9.8 million (April 2021)](https://www.ftc.gov/news-events/news/press-releases/2021/04/cash-advance-firm-pay-98m-settle-ftc-complaint-it-overcharged-small-businesses), the allegations of withdrawals after payoff and misstated terms
- [FTC: Permanent ban against a merchant cash advance owner (October 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/10/ftc-case-leads-permanent-ban-against-merchant-cash-advance-owner-deceiving-small-businesses-seizing), the RCG Advances case and confessions of judgment
- [Lathrop GPM: MCA agreements in bankruptcy, sales or loans?](https://www.lathropgpm.com/insights/mca-agreements-in-bankruptcy-will-courts-treat-them-as-sales-or-loans/), a practitioner summary of the three-factor test (secondary)

**Filings**

- [Block: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), Square Loans sized under 20% of expected annual GPV, repaid in about ten months, mostly funded by institutional investors through forward flow, and more than $32.8 billion of principal since May 2014
- [Enova International: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529864/000119312526060461/enva-20251231.htm), small business installment and line yields and bank partner programs

**In practice**

- [Square: Square Loans FAQs](https://squareup.com/help/us/en/article/6531-square-loans-faqs), Square Financial Services as issuer, $100 to $500,000, offers by invitation, repayment from card sales and personal guarantees above $250,000
- [Stripe: How Stripe Capital works](https://docs.stripe.com/capital), the MCA as "a purchase of your business's future receivables," lines with each draw a separate loan, UCC-1 filings and their termination, Wolters Kluwer as filing representative, the Small Business Financial Exchange, and personal guarantees outside the US
- [Lighter Capital: Revenue-based financing](https://www.lightercapital.com/revenue-based-financing), the percentage of monthly revenue, the repayment cap, terms and the minimum recurring revenue
- [Clearco](https://clear.co/), inventory and invoice funding for consumer brands, terms up to 12 months, amounts and the revenue requirement
- [Louisiana Legislature: Résumé digest of Act 198 (HB 470) of 2025](https://legis.la.gov/Legis/ViewDocument.aspx?d=1430174), the revenue-based financing definition, charges that are not interest, written disclosures at or before consummation, effective August 1, 2025
- [Material Handling 24/7: ELFA Industry Horizon Report (October 27, 2026)](https://www.materialhandling247.com/article/industry_horizon_report_shows_equipment_finance_industry_expanded_to_1.5_trillion), the 2025 equipment finance market size, the share financed and the mix of leases, loans and lines
