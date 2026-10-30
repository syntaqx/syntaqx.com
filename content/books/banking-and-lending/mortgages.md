+++
title = "Mortgages & Home Equity"
description = "US mortgages: conventional, FHA, VA and jumbo loans, rate locks, HELOCs and home equity loans, ATR and QM, and the retail, broker and correspondent channels."
category = "Banking & Lending Industry"
order = 2436
part = "Lending Products"
tags = ["banking", "lending", "mortgages", "heloc", "qualified-mortgage", "rate-locks"]
+++

A mortgage is the largest loan most households will ever take and the most heavily engineered product in consumer lending. Americans owed $13.117 trillion on mortgages at the end of June 2026, and lenders wrote $505 billion of new ones in that quarter alone. Behind each loan is a chain that no other consumer product has: a borrower who applies through a lender's app, a broker or a bank branch; a rate locked weeks before closing and hedged in the bond market while the file is underwritten; a property appraised, titled and insured; a loan built to a government agency's or an investor's rules so it can be sold or pooled within weeks of closing; and a servicer who collects for thirty years, often a different company from the one that made the loan. Home equity lending sits on the same collateral with a second lien and a revolving line, and inherits most of the same law.

This chapter covers the product side: the market and its lenders, the loan programs (conventional and conforming, FHA, VA, jumbo and non-QM) and their mortgage insurance, a worked loan, rate locks and the pipeline risk they create, HELOCs and home equity loans, ability-to-repay and qualified mortgage basics, and the three origination channels. Four later chapters own what happens around it, and this one names them rather than repeating them: [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures) (the Loan Estimate and Closing Disclosure clocks and tolerances), [Closing, eNotes & MERS](/books/banking-and-lending/closing-and-enotes) (signing, eNotes and lien registration), [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing) (escrow, Regulation X and foreclosure), and [The Secondary Mortgage Market](/books/banking-and-lending/secondary-mortgage-market) (Fannie Mae, Freddie Mac, Ginnie Mae, pooling and servicing rights). The amortization arithmetic is in [Personal & Installment Loans](/books/banking-and-lending/installment-loans#worked-numbers-an-amortization-schedule).

## How the Platforms Do It

As of October 2026, from the lenders' latest filings and releases:

| Lender | Model | Scale | Notes |
| --- | --- | --- | --- |
| **Rocket Companies** | Retail (direct to consumer), broker (Rocket Pro) and correspondent, plus servicing | $49.1 billion of closed originations in the second quarter of 2026; $2.0 trillion of servicing UPB across 9.1 million loans | Gain-on-sale margin 4.13% direct to consumer, 0.69% broker, 0.19% correspondent; says it became the largest US home equity lender, with more than $24 billion of home equity extended since mid-2022 |
| **UWM** | Wholesale only: originates exclusively through mortgage brokers | $163.4 billion of 2025 originations ($93.2 billion purchase, $70.3 billion refinance) | 116 bps gain margin in 2025; $240.8 billion of servicing UPB at a 5.65% weighted average rate |
| **PennyMac Financial** | Correspondent aggregation plus consumer direct and broker direct lending; large servicer | $145.5 billion of 2025 production | $733.6 billion of servicing UPB at year-end 2025; it buys correspondent loans first, and its affiliated REIT bought 17% of conventional conforming and all non-agency correspondent volume in the fourth quarter of 2025 |
| **Figure Technology** | Loan origination system plus a loan marketplace (Figure Connect) for HELOCs and other consumer loans, in its own and partners' brands | $225.6 million of net revenue in the second quarter of 2026 | Revenue split between ecosystem and technology fees ($72.9 million), origination fees and gain on sale; agreed to acquire Kiavi |
| **Upstart** | HELOCs through its lending marketplace | HELOCs of $26,000 to $250,000 at APRs up to 18.0%, 10- or 15-year terms | Services its other loans in-house but not HELOCs; licensed to originate HELOCs state by state |

Three things stand out. **The channel is the business model:** Rocket's three margins are three different businesses under one name, and UWM's whole company is one of them. **Servicing is as big as origination:** the two largest originators each service hundreds of billions to trillions of dollars of loans, and the servicing right is a traded asset (Rocket sold $53 billion of servicing UPB in the second quarter of 2026 while keeping the subservicing). **Home equity is where the new technology is:** a first-lien mortgage runs on agency rules and decades-old systems, while HELOC lenders compete on speed with automated valuations and marketplaces that sell the loan as it's made.

## The Market

The Federal Reserve Bank of New York's household debt report for the second quarter of 2026 put mortgage balances at $13.117 trillion, down $74 billion in the quarter, and HELOC balances at $459 billion, up $13 billion. Mortgages are 70% of household debt ($13.117 trillion of $18.771 trillion). The annualized flow of mortgage balances into serious delinquency (90 days or more) was 1.52%, up from 1.29% a year earlier: low against other consumer credit, which is the effect of collateral and of the underwriting rules below.

Independent mortgage companies, not banks, make most US mortgages: [Nonbank Lenders](/books/banking-and-lending/banking-landscape#nonbank-lenders) gives their HMDA shares. A nonbank originator can do this because it doesn't need deposits to hold the loan: it funds on a warehouse line, sells the loan to Fannie Mae or Freddie Mac (or pools it into a Ginnie Mae security) within weeks, and keeps or sells the servicing. [Funding the Book](/books/banking-and-lending/funding-the-book) covers warehouse lines, and [The Secondary Mortgage Market](/books/banking-and-lending/secondary-mortgage-market) covers the agencies.

## Loan Programs

A mortgage's program decides its underwriting rules, its insurance, who will buy it and therefore its price. The system records the program on the loan from the first rate quote, because changing program mid-file changes nearly everything downstream.

**Conventional and conforming.** A conventional loan isn't insured or guaranteed by a federal agency. A conforming loan is a conventional loan that meets Fannie Mae's or Freddie Mac's rules, including the conforming loan limit, which FHFA sets each year under HERA from the change in its house price index. For 2026 the baseline limit for a one-unit property is **$832,750**, up $26,250 (3.26%) from 2025; in high-cost areas the limit is 115% of the local median home value, capped at **$1,249,125** (150% of the baseline); Alaska, Hawaii, Guam and the US Virgin Islands have a baseline of $1,249,125 and a ceiling of $1,873,675. The limit is reference data by county and year, evaluated on the property's location at the date the loan is delivered.

**Private mortgage insurance.** A conventional loan with less than 20% down usually carries private mortgage insurance, and the Homeowners Protection Act sets when it ends for a borrower's principal residence. The borrower may ask to cancel it on the date the principal balance is first scheduled, on the initial amortization schedule, to reach **80%** of the property's original value (if the borrower has a good payment history, is current, and the holder's value and lien conditions are met); it terminates automatically when the balance is first scheduled to reach **78%** if the borrower is current; and it can't be required past the midpoint of the amortization period. Original value is the lesser of the sales price and the appraised value at closing (12 U.S.C. 4901 and 4902). Both dates are computed from the schedule at origination, not from the actual balance, so they're stored, not derived later.

**FHA.** The Federal Housing Administration insures loans that private lenders make, with a minimum cash investment of **3.5%** of the appraised value and a maximum loan amount of the lesser of 115% of the area median price and 150% of the conforming limit, with a floor of 65% of it (12 U.S.C. 1709(b)). FHA charges an upfront mortgage insurance premium of **1.75%** of the base loan amount on all forward mortgages, usually financed into the loan, and an annual premium paid monthly. Since March 20, 2023, for terms over 15 years and base loan amounts up to the threshold, the annual premium is **50 bps** for 11 years at 90% LTV or below, 50 bps for the life of the loan above 90% and up to 95%, and **55 bps for the life of the loan above 95%**; larger loans pay 70 bps and up (Mortgagee Letter 2023-05). An FHA loan with the minimum down payment pays the annual premium until it's paid off or refinanced, which is why many FHA borrowers later refinance into conventional loans.

**VA.** The Department of Veterans Affairs guarantees loans to eligible veterans and service members. A borrower with full entitlement has no VA loan limit (the lender still underwrites the loan, and the maximum is the lower of the appraised value and the price); with remaining entitlement the guaranty is a quarter of the county's limit less entitlement already used, because lenders generally want the guaranty, a down payment or both to cover 25% of the loan. VA charges a funding fee instead of mortgage insurance: on a purchase, **2.15%** on first use with under 5% down, 1.5% with 5% or more, 1.25% with 10% or more, and 3.3% on later use with under 5% down; 0.5% on an interest rate reduction refinance. Veterans receiving compensation for a service-connected disability, eligible surviving spouses receiving Dependency and Indemnity Compensation and Purple Heart recipients on active duty are exempt. The exemption is a fact about the borrower that has to be verified and stored with its evidence, because it changes the amount financed.

**Jumbo and non-QM.** A loan above the conforming limit is a jumbo loan: no agency will buy it, so the lender keeps it on its balance sheet or sells it to private investors, and prices and underwrites it to their rules. Non-QM loans (bank statement loans for the self-employed, investor loans qualified on the property's rent, interest-only loans) fall outside the qualified mortgage definition below; the lender carries the ability-to-repay risk itself and sells to private securitizations or holds.

## Worked Numbers: A Conventional Loan

A $400,000 home bought with 10% down: a **$360,000** conventional loan, 30 years fixed at 6.50%, monthly rate 0.541667%.

- **Principal and interest:** $360,000 × 0.00541667 / (1 − 1.00541667^−360) = **$2,275.44** a month. The first payment carries $1,950.00 of interest and $325.44 of principal; after a year the balance is $355,976.26. Over 30 years the borrower pays about $459,000 of interest on $360,000 borrowed.
- **The mortgage insurance dates:** original value is $400,000, so 80% is $320,000 and 78% is $312,000. On the initial schedule the balance first falls to or below $320,000 at payment 95 ($319,708.38), when the borrower may request cancellation, and to or below $312,000 at payment 109 ($311,822.89), when insurance terminates automatically if the borrower is current. The midpoint backstop is payment 180. A borrower who prepays reaches 80% sooner and can ask earlier against the actual balance; the automatic date stays tied to the original schedule.
- **Debt-to-income:** with $500 of property tax and $150 of insurance a month (escrowed, so part of the payment; [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing#escrow) covers the escrow account), housing costs $2,925.44 before mortgage insurance. A borrower with $12,000 of gross monthly income and $800 of other debt payments has a total DTI of ($2,925.44 + $800) / $12,000 = **31.0%**. The rule requires the lender to consider DTI or residual income, not to stay under a federal number (below), and the program or investor sets the limit.
- **The FHA alternative:** the same home with 3.5% down is a $386,000 base loan; the 1.75% upfront premium ($6,755) is financed, so the note is $392,755 and principal and interest is $2,482.48. Because LTV is above 95%, the 55 bps annual premium lasts the life of the loan, about $177 a month in the first year on the base amount. The borrower brings $26,000 less to closing and pays about $384 a month more, before the conventional loan's private mortgage insurance, which this comparison would also need.

The system computes every one of these figures from one schedule function at the time of the quote, the disclosure and the note, and stores the results: the cancellation and termination dates, the DTI with its inputs and the premium schedule are all things a borrower, an investor or an examiner asks about years later.

## Rate Locks

A borrower who applies in March may close in May, and the rate offered in March won't be there in May unless the lender locks it. A **rate lock** commits the lender to a rate and price (points or credits) for a period, as long as the loan closes within it and the application doesn't change; the CFPB describes locks as typically 30, 45 or 60 days and sometimes longer, with extensions that "may be expensive." A locked rate still moves if the loan amount, credit score, verified income, down payment or appraisal changes, and the Loan Estimate shows whether the rate is locked and until when (the redisclosure rules when it locks are in [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures)).

For the lender, every open lock is a promise to lend at a fixed rate into a market that keeps moving. Rocket's 10-K describes its interest rate lock commitments (IRLCs) as derivatives, measured against current prices for similar mortgage-backed securities and "subject to the estimated loan financing probability, or pull-through factor (which is both significant and highly subjective)." That sentence is the whole problem:

- **Pull-through:** not every lock closes. Rates fall and borrowers relock elsewhere, appraisals come in low, buyers walk away. The pipeline's interest rate exposure is the locks weighted by the probability each one funds, and that probability is a model the lender fits on its own history by loan purpose, channel, days in the lock and how far the market has moved.
- **Hedging:** the lender offsets the weighted exposure by selling mortgage-backed securities forward (or committing loans to an investor), so a rise in rates that cuts the value of its locks raises the value of its short. The hedge ratio changes daily as locks are added, extended, closed and dropped.
- **Investor commitments:** a loan can be committed to an investor on a best-efforts basis (delivered only if it closes) or on a mandatory basis (delivered or paid for with a pair-off fee), which moves the fallout risk between the lender and the investor.

For the system, a lock is a record with a life: locked, extended, relocked, renegotiated after a change of circumstance, expired, cancelled or closed, each event priced and dated. The secondary marketing desk reads the open locks every morning, so the lock record has to be authoritative and current, not a field on the application that someone edits.

## Home Equity: HELOCs and Home Equity Loans

A homeowner with equity can borrow against it without refinancing the first mortgage, either as a closed-end **home equity loan** (a lump sum repaid on a fixed schedule, usually a second lien) or as a **home equity line of credit**, an open-end line with a **draw period** (often ten years) in which the borrower borrows and repays as needed, often paying only interest, followed by a **repayment period** in which no new draws are allowed and the balance amortizes.

Regulation Z treats the HELOC as open-end credit with its own rules (12 CFR 1026.40):

- **Disclosures at application:** the creditor gives the HELOC disclosures and the CFPB's brochure when it provides the application. They describe the draw and repayment periods, how the minimum payment is set and whether a balloon can result, a minimum payment example on a $10,000 balance, the fees, and, for a variable rate, the index, the margin, the caps and a 15-year historical example.
- **The index must be outside the creditor's control** and publicly available, so a HELOC can't float on the lender's own prime rate or cost of funds.
- **Termination is limited:** the creditor may terminate and accelerate only for fraud or material misrepresentation, failure to meet the repayment terms, or action or inaction that adversely affects the security.
- **Freezes and reductions are allowed for specified reasons,** including a significant decline in the property's value or a material change in the borrower's financial circumstances, and the line has to be reviewed for reinstatement while the reason lasts. A model that freezes lines when automated valuations drop is a credit decision with notices, not a batch job.
- **Terms can't change after opening** except as the agreement and the regulation allow.

**The right of rescission** applies to a HELOC, a home equity loan and a refinance with a new lender secured by the borrower's principal dwelling, but not to the loan that buys or builds it (12 CFR 1026.23 for closed-end credit; for a HELOC, 1026.15 gives the same right when the plan opens, when the limit increases and when a security interest is added, but not for each draw within the limit). Each owner whose interest is subject to the lien may cancel until midnight of the third business day after the latest of consummation, delivery of the rescission notice and delivery of the material disclosures; if the notice or disclosures were never delivered, the right lasts up to three years. The lender may not disburse (except into escrow) until the period ends, a borrower may waive only for a bona fide personal financial emergency in a signed, dated statement with no printed forms, and on rescission the lien is void and the lender has 20 calendar days to return what the borrower paid. For the system, rescission is a gate on funding with a computed expiry from three timestamps, and a missing notice turns a three-day clock into a three-year exposure.

**Worked numbers: the end of the draw period.** A $100,000 HELOC fully drawn, at an index of 7.00% plus a 1.00% margin, costs **$666.67** a month interest-only during the draw period. When the draw period ends and the $100,000 amortizes over a 20-year repayment period at the same 8.00%, the payment becomes **$836.44**, 25% more with no change in rate. The disclosure's payment example exists to show this, and the servicing system must send the borrower notice before it happens and recompute the payment on the date the draw period ends.

The same `credit_lines` record that carries a card's revolving terms carries a HELOC's, with a draw period end, a repayment term and the collateral behind it; [Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-to-build-it) defines it, and How to Build It below adds the home equity columns.

## Ability to Repay and Qualified Mortgages

A creditor must make a reasonable, good-faith determination before or at consummation that the borrower can repay a closed-end mortgage on a dwelling (12 CFR 1026.43; HELOCs, timeshares, reverse mortgages and some others are outside it). The determination must consider eight factors: current or reasonably expected income or assets other than the dwelling; employment status, if the lender relies on employment income; the monthly payment on the loan; the payment on any simultaneous loan; mortgage-related obligations (taxes, insurance, association dues); current debts, alimony and child support; the debt-to-income ratio or residual income; and credit history. Each factor is verified with third-party records, and each verification is a document the file must keep.

A **qualified mortgage** is presumed to comply. The General QM definition (1026.43(e)(2)) requires:

- **Regular, substantially equal payments** that don't increase principal, defer it, or end in a balloon; and a **term of 30 years or less.**
- **Points and fees within limits:** for 2026, 3% of the loan amount for loans of $137,958 or more; $4,139 for loans from $82,775 up to $137,958; 5% from $27,592 up to $82,775; $1,380 from $17,245 up to $27,592; and 8% below $17,245. The dollar amounts are adjusted every January 1 (90 FR 57890, December 15, 2025).
- **A price limit:** the APR may not exceed the average prime offer rate (APOR) for a comparable transaction, as of the date the rate is set, by **2.25 percentage points** or more for a first-lien loan of $137,958 or more in 2026; 3.5 points from $82,775 up to $137,958; and 6.5 points below $82,775 (and for manufactured home loans below $137,958). Subordinate liens get 3.5 points at $82,775 or more and 6.5 points below.
- **Consideration and verification** of income, assets, debts and DTI or residual income. The 2021 amendments replaced the old 43% DTI cap with the price test.

**The presumption depends on price.** A QM that isn't higher-priced gets a safe harbor; a higher-priced QM (APR 1.5 points or more above APOR for a first lien, 3.5 for a subordinate lien) gets a rebuttable presumption. A **seasoned QM** becomes a safe harbor after 36 months of payments with no more than two delinquencies of 30 days or more and none of 60 days or more, if it's a first-lien, fixed-rate, fully amortizing loan held in portfolio during the period. A prepayment penalty is allowed only on a QM whose APR can't increase and that isn't higher-priced, only for three years, at most 2% of the prepaid balance in the first two years and 1% in the third, and only if the lender also offered a loan without one (1026.43(g)).

**Worked example: the price test.** Suppose the APOR for a 30-year fixed loan on the rate-set date is 6.00%. A $360,000 first-lien loan with an APR of 7.40% is 1.40 points over: not higher-priced, a safe harbor QM if it meets the rest. At 7.60% it's 1.60 points over: still a QM, but higher-priced, so the presumption is rebuttable, and as a higher-priced mortgage loan under 12 CFR 1026.35 it needs an escrow account for taxes and insurance that the borrower can't ask to cancel for at least five years. At 8.30% it's 2.30 points over and fails the General QM price limit for a loan of this size, so it can only be made as a non-QM loan with the ability-to-repay risk on the lender. The APOR is published weekly, so the test needs the APOR table version and the rate-set date stored with the result.

The math behind the APR is in [APR, Finance Charges & Rate Caps](/books/banking-and-lending/apr-and-rate-caps), and the underwriting engine that produces DTI and residual income is in [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines).

## Origination Channels: Retail, Broker, Correspondent

Mortgages reach borrowers three ways, and the same lender often runs all three:

- **Retail.** The lender's own loan officers or app take the application, the lender underwrites and closes in its own name and funds from its warehouse line. It owns the customer and pays for the marketing: Rocket's direct-to-consumer margin of 4.13% is what that costs and earns.
- **Broker (wholesale).** An independent mortgage broker takes the application and shops it to wholesale lenders; the lender underwrites, closes in its name and funds, and pays the broker or the borrower pays the broker. UWM originates only this way, and Rocket's broker channel earned 0.69%.
- **Correspondent.** A smaller lender (a community bank, a credit union, a small mortgage company) originates and funds the loan in its own name, then sells it to a larger correspondent lender who aggregates loans and delivers them to the agencies. A *delegated* correspondent underwrites to the buyer's guidelines itself; a *non-delegated* one sends the file to the buyer to underwrite before closing. Rocket's correspondent margin was 0.19%, and PennyMac acquires correspondent loans and passes agreed shares to its affiliated REIT.

The channel changes who the regulations call the creditor and the loan originator, and loan originator compensation is regulated tightly (12 CFR 1026.36):

- **No compensation based on a term of the loan** (rate, APR, product, prepayment penalty) or a proxy for one. Pay may vary with volume, a fixed amount per loan, hourly pay or loan performance.
- **No dual compensation:** if the borrower pays the broker directly, no one else, including the lender, may also pay the broker for that loan.
- **No steering** to a loan that pays the originator more unless it's in the borrower's interest; presenting, for each loan type, the lowest-rate option, the lowest-rate option without risky features and the option with the lowest points and fees is a safe harbor.
- **Licensing and identification:** originators must be licensed or registered under the SAFE Act where required, and the organization's and the individual's NMLS IDs must appear on the application, the Loan Estimate and Closing Disclosure, the note and the security instrument. [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing) covers the licenses.

For the system, the channel, the broker or correspondent, the individual originator, their NMLS IDs and the compensation plan in force are attributes of the loan from the application on, and the compensation calculation reads only fields the rule allows.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A mortgage or home equity loan is an `accounts` row (`account_kind = 'loan'`) with a `loans` row (`amortization = 'level_payment'`), `collateral` for the property (`kind = 'real_property'`, the recorded mortgage as `lien_ref` and the lien position), an `applications` row and its `credit_decisions`; the schedule, disbursement and payoff tables are from [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it), and pricing is [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it)'s `loan_pricing`. A HELOC is an `accounts` row with `account_kind = 'line'` and a `credit_lines` row from [Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-to-build-it). This chapter adds the program terms, valuations, rate locks, the ATR and QM determination, mortgage insurance, home equity line terms, rescission and originator assignments. Disclosure timing records belong to [TRID & Mortgage Disclosures](/books/banking-and-lending/mortgage-disclosures), and escrow to [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing).

```sql
CREATE TABLE mortgage_terms (                -- the program a mortgage or home equity loan is built to
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  program              TEXT NOT NULL CHECK (program IN ('conventional', 'fha', 'va', 'usda',
                         'jumbo', 'non_qm', 'home_equity')),
  conforming           BOOLEAN NOT NULL,        -- within the county's FHFA limit for the delivery year
  conforming_limit     BIGINT,                  -- the limit it was tested against, minor units
  purpose              TEXT NOT NULL CHECK (purpose IN ('purchase', 'rate_term_refinance',
                         'cash_out_refinance', 'home_equity', 'construction')),
  occupancy            TEXT NOT NULL CHECK (occupancy IN ('primary', 'second_home', 'investment')),
  lien_position        SMALLINT NOT NULL CHECK (lien_position IN (1, 2)),
  channel              TEXT NOT NULL CHECK (channel IN ('retail', 'broker', 'correspondent')),
  ltv_bps              INT NOT NULL,
  cltv_bps             INT NOT NULL,            -- with every lien on the property
  dti_bps              INT,
  intended_investor    TEXT CHECK (intended_investor IN ('fannie_mae', 'freddie_mac', 'ginnie_mae',
                         'portfolio', 'private')),
  va_funding_fee_exempt_ref TEXT               -- the evidence behind an exemption, if any
);

CREATE TABLE property_valuations (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  collateral_id        UUID NOT NULL REFERENCES collateral (id),
  method               TEXT NOT NULL CHECK (method IN ('appraisal', 'desktop_appraisal', 'hybrid',
                         'avm', 'waiver')),
  value                BIGINT,                  -- NULL for a waiver
  effective_date       DATE NOT NULL,
  provider             TEXT NOT NULL,           -- appraiser or AMC, AVM vendor, or the agency's waiver offer
  model_version        TEXT,                    -- AVMs only
  document_ref         TEXT,
  used_for             TEXT NOT NULL CHECK (used_for IN ('origination', 'line_review',
                         'pmi_cancellation', 'loss_mitigation'))
);

CREATE TABLE rate_locks (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id       UUID NOT NULL REFERENCES applications (id),
  product_id           UUID NOT NULL REFERENCES products (id),
  pricing_grid_id      UUID REFERENCES pricing_grids (id),
  rate                 NUMERIC(9, 6) NOT NULL,
  price_bps            INT NOT NULL,            -- points paid (positive) or lender credit (negative)
  lock_days            SMALLINT NOT NULL,
  locked_at            TIMESTAMPTZ NOT NULL,
  expires_on           DATE NOT NULL,           -- current expiry, history in rate_lock_events
  investor_commitment  TEXT CHECK (investor_commitment IN ('best_efforts', 'mandatory', 'none')),
  status               TEXT NOT NULL CHECK (status IN ('locked', 'expired', 'cancelled',
                         'closed', 'withdrawn'))
);

CREATE TABLE rate_lock_events (              -- every change to a lock, priced and dated
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  rate_lock_id         UUID NOT NULL REFERENCES rate_locks (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('lock', 'extend', 'relock', 'float_down',
                         'changed_circumstance', 'expire', 'cancel', 'close')),
  rate                 NUMERIC(9, 6) NOT NULL,
  price_bps            INT NOT NULL,
  fee_bps              INT NOT NULL DEFAULT 0,  -- an extension or relock charge
  expires_on           DATE NOT NULL,
  reason               TEXT,
  occurred_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE atr_qm_determinations (         -- the ability-to-repay record, one per decision
  credit_decision_id   UUID PRIMARY KEY REFERENCES credit_decisions (id),
  verified_factors     JSONB NOT NULL,          -- each 1026.43(c)(2) factor: value, source document, verifier
  dti_bps              INT,
  residual_income      BIGINT,
  apr_bps              INT NOT NULL,
  apor_bps             INT NOT NULL,
  apor_table_date      DATE NOT NULL,           -- the weekly APOR table used
  rate_set_date        DATE NOT NULL,
  points_and_fees      BIGINT NOT NULL,
  points_and_fees_limit BIGINT NOT NULL,        -- from the year's adjusted thresholds
  threshold_version    TEXT NOT NULL,           -- e.g. '2026', citing 90 FR 57890
  qm_category          TEXT NOT NULL CHECK (qm_category IN ('general', 'small_creditor',
                         'agency_program', 'seasoned', 'non_qm', 'exempt')),
  presumption          TEXT NOT NULL CHECK (presumption IN ('safe_harbor', 'rebuttable', 'none')),
  higher_priced        BOOLEAN NOT NULL,
  determined_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mortgage_insurance (
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('borrower_paid_pmi', 'lender_paid_pmi',
                         'fha_mip', 'va_guaranty', 'usda_guarantee')),
  provider             TEXT NOT NULL,           -- the MI company, FHA, VA or USDA
  certificate_ref      TEXT NOT NULL,
  upfront_amount       BIGINT NOT NULL DEFAULT 0,  -- FHA UFMIP or VA funding fee
  annual_bps           INT,
  original_value       BIGINT,                  -- lesser of price and appraised value (12 U.S.C. 4901)
  cancellation_date    DATE,                    -- 80% on the initial schedule, borrower may request
  termination_date     DATE,                    -- 78% on the initial schedule, automatic if current
  final_termination_date DATE,                  -- midpoint of the amortization period
  ends_on              DATE,                    -- premium end for FHA (11 years or loan term)
  cancelled_at         TIMESTAMPTZ,
  cancel_reason        TEXT CHECK (cancel_reason IN ('borrower_request', 'automatic', 'final',
                         'paid_off', 'refinanced'))
);

ALTER TABLE credit_lines                     -- home equity lines on the credit card chapter's table
  ADD COLUMN draw_period_ends_on DATE,
  ADD COLUMN repayment_term_months SMALLINT,
  ADD COLUMN collateral_id UUID REFERENCES collateral (id),
  ADD COLUMN index_name TEXT,                   -- must be public and outside the creditor's control
  ADD COLUMN margin_bps INT,
  ADD COLUMN lifetime_cap_bps INT;

ALTER TABLE credit_limit_changes DROP CONSTRAINT credit_limit_changes_reason_check;
ALTER TABLE credit_limit_changes ADD CONSTRAINT credit_limit_changes_reason_check
  CHECK (reason IN ('origination', 'consumer_request', 'proactive', 'risk_decrease',
    'delinquency', 'restore', 'property_value_decline', 'financial_circumstances'));

CREATE TABLE rescission_periods (            -- 1026.15 and 1026.23, one per rescindable transaction
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  consummated_at       TIMESTAMPTZ NOT NULL,
  notice_delivered_at  TIMESTAMPTZ,            -- the latest, if delivered more than once
  material_disclosures_at TIMESTAMPTZ,
  expires_at           TIMESTAMPTZ,            -- midnight of the third business day after the latest of the three
  extended_until       DATE,                   -- up to three years when notice or disclosures are missing
  waiver_ref           TEXT,                   -- the borrowers' handwritten emergency statement
  rescinded_at         TIMESTAMPTZ,
  refund_due_by        DATE,                   -- 20 calendar days after a rescission notice
  funds_released_at    TIMESTAMPTZ
);

CREATE TABLE originator_assignments (        -- who originated it, under which plan
  application_id       UUID NOT NULL REFERENCES applications (id),
  role                 TEXT NOT NULL CHECK (role IN ('loan_officer', 'broker', 'correspondent')),
  party_id             UUID NOT NULL REFERENCES parties (id),
  organization_nmls_id TEXT NOT NULL,
  individual_nmls_id   TEXT,
  compensation_plan_ref TEXT NOT NULL,          -- the plan version; inputs may not include loan terms
  paid_by              TEXT NOT NULL CHECK (paid_by IN ('creditor', 'consumer')),
  PRIMARY KEY (application_id, role, party_id)
);
```

A rate lock is the authoritative source for the rate and price at closing: the closing workflow reads `rate_locks` and its latest event, never a copy on the application, and the pipeline report weights open locks by a pull-through model whose version is stored with each daily run. `atr_qm_determinations` freezes the APOR table date and the threshold year with the result, so a test run in December and a loan closed in January can be told apart, and the `verified_factors` document references are what an investor's due diligence or a borrower's ATR defense will ask for ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)). The HOPA dates in `mortgage_insurance` are computed once from the origination schedule, never from the current balance, and a nightly job terminates coverage on `termination_date` for current loans. Funding of a rescindable loan is blocked until `rescission_periods.expires_at` has passed in the institution's business calendar ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). A HELOC freeze writes a `credit_limit_changes` row with its reason, its valuation and its notice, and a scheduled job reviews every frozen line for reinstatement. `originator_assignments.paid_by` enforces the dual compensation ban: a consumer-paid row and a creditor-paid row for the same broker on the same application is a constraint violation, not a report.

## Auditing

Mortgage files are examined by regulators, re-underwritten by investors and litigated by borrowers, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **The program and its limits:** the conforming limit, FHA limit or VA entitlement tested, for which county and year.
- **Every valuation,** with its method, provider, model version and what it was used for.
- **Every rate lock event,** with its rate, price, fees and dates, and the pull-through model version behind each day's hedge.
- **The ATR determination:** each factor's value and source document, the DTI or residual income, the APR, the APOR table and rate-set date, points and fees, and the QM category and presumption that followed.
- **Mortgage insurance:** the original value, the computed cancellation, termination and midpoint dates, and when and why coverage ended.
- **For home equity:** the HELOC disclosures at application, every freeze or reduction with its reason, valuation and notice, and every rescission period with its three timestamps and any waiver.
- **The originator:** the channel, the broker or correspondent, the individual, their NMLS IDs on each required document, and the compensation plan and its inputs.

## What This Means for the System You Build

- **Record the program from the first quote,** with the limit it was tested against, because a program change changes insurance, investors and price.
- **Compute insurance dates and payments once from the origination schedule** and store them, as the Homeowners Protection Act requires.
- **Treat a rate lock as an authoritative record with events,** feed the hedge from it daily, and store the pull-through model version.
- **Model HELOCs as lines with a draw period end,** recompute the payment when it ends, and handle freezes as credit decisions with notices.
- **Gate funding on the rescission period,** computed from consummation, notice and disclosures in business days.
- **Freeze the ATR and QM inputs with the result:** factor evidence, APOR table date, rate-set date and the year's thresholds.
- **Keep the channel, originator, NMLS IDs and compensation plan on the loan,** and calculate pay only from inputs the rule allows.

## References

**Law and regulation**

- [Cornell LII: 12 CFR 1026.43, minimum standards for transactions secured by a dwelling](https://www.law.cornell.edu/cfr/text/12/1026.43), the General QM product features, 30-year term, points and fees tiers, APR over APOR price thresholds, seasoned QM and prepayment penalty limits
- [CFPB: Regulation Z § 1026.43](https://www.consumerfinance.gov/rules-policy/regulations/1026/43/), the higher-priced covered transaction thresholds, the eight ATR factors and the 2021 removal of the 43% DTI limit
- [Federal Register: Truth in Lending (Regulation Z) annual threshold adjustments, 90 FR 57890 (December 15, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-12-15/html/2025-22773.htm), the 2026 QM points and fees and price threshold dollar amounts, effective January 1, 2026
- [CFPB: Regulation Z § 1026.40, home equity plans](https://www.consumerfinance.gov/rules-policy/regulations/1026/40/), disclosures at application, the $10,000 payment and 15-year historical examples, the index outside the creditor's control, and limits on termination, freezes and term changes
- [CFPB: Regulation Z § 1026.23, right of rescission](https://www.consumerfinance.gov/rules-policy/regulations/1026/23/), covered and exempt transactions, the three business day period, the three-year extension, delay of disbursement, emergency waivers and the 20-day refund
- [CFPB: Regulation Z § 1026.15, right of rescission for open-end credit](https://www.consumerfinance.gov/rules-policy/regulations/1026/15/), when the right arises on a home equity plan, the three business day period and the exemptions
- [CFPB: Regulation Z § 1026.35, requirements for higher-priced mortgage loans](https://www.consumerfinance.gov/rules-policy/regulations/1026/35/), the higher-priced thresholds and the escrow account's five-year minimum before cancellation
- [Cornell LII: 12 CFR 1026.36, prohibited acts or practices in connection with credit secured by a dwelling](https://www.law.cornell.edu/cfr/text/12/1026.36), loan originator compensation, dual compensation, the anti-steering safe harbor, qualification and NMLS IDs on documents
- [Cornell LII: 12 U.S.C. 4901, definitions (Homeowners Protection Act)](https://www.law.cornell.edu/uscode/text/12/4901), the 80% cancellation date, 78% termination date and original value
- [Cornell LII: 12 U.S.C. 4902, termination of private mortgage insurance](https://www.law.cornell.edu/uscode/text/12/4902), borrower-requested cancellation, automatic termination and final termination at the midpoint
- [Cornell LII: 12 U.S.C. 1709, insurance of mortgages](https://www.law.cornell.edu/uscode/text/12/1709), the FHA 3.5% minimum cash investment and the maximum loan amount formula

**Regulators and agencies**

- [FHFA: Conforming loan limit values for 2026 (November 25, 2025)](https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026), the $832,750 baseline, the $1,249,125 ceiling, the HERA method and the high-cost area formula
- [HUD: Mortgagee Letter 2023-05, annual mortgage insurance premium](https://archives.hud.gov/news/2024/2023-05hsgml.pdf), the 175 bps upfront premium and the annual premium table by LTV, base loan amount and duration, effective March 20, 2023
- [VA: Funding fee and closing costs](https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/), the funding fee table and exemptions
- [VA: Home loan limits](https://www.va.gov/housing-assistance/home-loans/loan-limits/), no limit with full entitlement and the remaining entitlement calculation
- [CFPB: What's a lock-in or a rate lock?](https://www.consumerfinance.gov/ask-cfpb/whats-a-lock-in-or-a-rate-lock-en-143/), typical lock periods, extensions and what can still change a locked rate
- [Federal Reserve Bank of New York: Household debt and credit, Q2 2026 (August 11, 2026)](https://www.newyorkfed.org/newsevents/news/research/2026/20260811), mortgage and HELOC balances, mortgage originations and the flow into serious delinquency

**Filings**

- [Rocket Companies: Second quarter 2026 results (Form 8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/0001805284/000180528426000082/rkt-063020268xkex991earnin.htm), lock and closed volume and gain-on-sale margin by channel, servicing UPB and loan count, MSR sales and home equity volume
- [Rocket Companies: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1805284/000162828026013283/rkt-20251231.htm), interest rate lock commitments as derivatives and the pull-through factor
- [UWM Holdings: Fourth quarter and full year 2025 results](https://investors.uwm.com/news/financial-news/news-details/2026/UWM-Holdings-Corporation-Announces-Fourth-Quarter--Full-Year-2025-Results/default.aspx), originations by purpose, gain margin, servicing UPB and the wholesale-only model
- [PennyMac Financial Services: Fourth quarter and full year 2025 results](https://pfsi.pennymac.com/news-events/press-releases/news-details/2026/PennyMac-Financial-Services-Inc--Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx), 2025 production, servicing UPB, the consumer direct and broker direct channels, and correspondent loans acquired by PennyMac first with its REIT's share
- [Figure Technology Solutions: Quarterly report on Form 10-Q for June 30, 2026](https://www.sec.gov/Archives/edgar/data/0002064124/000162828026057061/figr-20260630.htm), the origination system and Figure Connect marketplace, its own and partner-branded channels, the Kiavi acquisition and revenue lines
- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), HELOC amounts, maximum APR and terms, state licensing and HELOC servicing
