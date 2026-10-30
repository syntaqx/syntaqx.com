+++
title = "Credit Losses & CECL"
description = "Reserving for loan losses: the CECL allowance under ASC 326, vintage and roll-rate models, charge-offs and recoveries in the ledger, and fair-value lenders."
category = "Banking & Lending Industry"
order = 2455
part = "Servicing and Collections"
tags = ["banking", "lending", "cecl", "allowance", "charge-off", "accounting", "fair-value"]
+++

A lender knows, the day it makes a loan, that some of its loans won't be repaid. Accounting makes it say how many, in money, and keep saying it every quarter. Under the current expected credit loss model (CECL) in ASC 326, a US lender carrying loans at amortized cost records an allowance for the losses it expects over each loan's whole life, starting when the loan is booked, and adjusts it every reporting period for what has happened and what it now forecasts. The provision that builds the allowance is often the largest expense a consumer lender reports, the allowance is what charge-offs are absorbed by, and the model that sizes it is examined by auditors and bank regulators alike. A few lenders sidestep it by measuring new loans at fair value, which moves expected losses into the price of the loan instead.

This chapter covers who reserves how, the allowance under ASC 326 and its effective dates, estimation methods and the agencies' view of them, forecasts and reversion, a worked vintage and roll-rate allowance, the day-one effect on a growing lender, charge-offs and recoveries as journal entries, modifications and the vintage disclosures, the capital transition, and fair value as the contrast. When a loan is charged off and how collections continues afterward are in [Collections & Recovery](/books/banking-and-lending/collections#charge-off-timing); the economics of losses in a loan's price are in [The Lending Business](/books/banking-and-lending/lending-business#credit-losses), which introduced the [amortized cost or fair value](/books/banking-and-lending/lending-business#amortized-cost-or-fair-value) choice this chapter works through. The playbook's general write-off accounting is [Write-Offs](/docs/payments/accounting#write-offs).

## How the Platforms Do It

As of October 2026, from filings and earnings releases:

| Lender | Measurement | What the public record says |
| --- | --- | --- |
| **Affirm** | Amortized cost with a CECL allowance | Provision for credit losses of $796.7 million in fiscal 2026, up 29% from $616.7 million; describes the provision as "the amount of expense required to maintain the allowance for credit losses" |
| **Happen** (formerly LendingClub) | CECL for loans originated before 2026; fair value for new held-for-investment loans from January 1, 2026 | Says fair value "more accurately reflects the in-period economic performance of the loans" |
| **Upstart** | Fair value | "We hold loans on our balance sheet at fair value and estimate fair value using a discounted cash flow methodology" |
| **Klarna** | Moving new US and German Fair Financing originations to fair value from the second half of 2026 | Shifts income "from interest over the loan's life to an upfront gain," nets provisions out of transaction costs, and lowers revenue by about 10 basis points of GMV with a similar cost reduction |
| **Banks and credit unions** | Amortized cost with a CECL allowance, by supervisory expectation and practice | The agencies' 2020 policy statement sets how examiners review the allowance, scaled to size and complexity |

The trend is the story. **CECL front-loads the cost of growth:** a lender that doubles originations books a year of lifetime provisions before it earns most of the interest, so its earnings look worse exactly when its business is growing. **Fair value trades that for volatility:** losses and prepayments sit inside a mark that moves with discount rates and assumptions, and the income is earlier. Happen and Klarna choosing fair value for new originations in the same year is a statement about which picture they want investors to see; the ledger has to support either, loan by loan.

## The Allowance Under ASC 326

The allowance for credit losses is a contra-asset that reduces loans from their amortized cost to the amount the lender expects to collect. The interagency policy statement on allowances (OCC, Federal Reserve, FDIC and NCUA, June 2020) summarizes what ASC 326 asks:

- **Lifetime, from day one.** Expected credit losses over the contractual term of the asset, adjusted for expected prepayments, recorded when the asset is originated or acquired.
- **Pools where risk is similar.** Assets with similar risk characteristics are "evaluated on a collective, or pool, basis"; loans that don't share them are evaluated individually.
- **History, current conditions and forecasts.** The estimate starts from historical loss information, adjusted for current conditions and for "reasonable and supportable forecasts," which "may extend over the entire contractual term"; beyond that period the estimate reverts to historical loss information, immediately or on a straight-line basis.
- **Recoveries count.** Expected recoveries of amounts previously written off, and expected to be written off, may be included, but not above the amounts written off.
- **Off-balance-sheet exposure.** Unfunded commitments carry an allowance (a liability) unless they are unconditionally cancellable by the issuer, which is why card lines the issuer can cancel at will carry none for their unused portion.
- **No prescribed method.** "FASB ASC Topic 326 does not require the use of a specific loss estimation method," and the agencies expect methods consistent with the institution's size and complexity; the Federal Reserve said in 2016 that "smaller and less complex institutions" wouldn't need complex modeling techniques.

**Effective dates.** SEC filers other than smaller reporting companies adopted CECL for fiscal years beginning after December 15, 2019; all other entities, including most community banks and credit unions, for fiscal years beginning after December 15, 2022. Before CECL, the incurred loss model reserved only for losses already probable. <!-- source-gap: asu-2016-13-text | secondary | ASU 2016-13 issuance date and the incurred-loss rationale from the standard itself | closes with: the FASB's ASU 2016-13 page or the codification text of ASC 326-20 opened | checked: 2026-10-29 -->

## Methods

The policy statement names the families an institution may use:

- **Loss-rate methods,** including **vintage analysis** (losses tracked by origination cohort and applied to each cohort's remaining balance by age) and the **weighted-average remaining maturity (WARM)** method (an average annual loss rate times the pool's remaining life), the simplest approach the agencies recognize for smaller institutions.
- **Probability of default and loss given default (PD/LGD),** where expected loss is the chance a loan defaults over its life times the share lost when it does, times the exposure.
- **Discounted cash flow (DCF),** projecting each pool's contractual cash flows adjusted for defaults, recoveries and prepayments, discounted at the effective interest rate, with the allowance the shortfall from amortized cost.

**Roll-rate models**, common in consumer and card portfolios, apply observed monthly transitions between delinquency buckets to project which balances reach charge-off. The policy statement I opened doesn't name them; in my reading they are a loss-rate variant built on the bucket transitions collections already measures, and they're strongest over the near term, which is why they're often paired with a vintage or historical loss rate for the rest of the life. <!-- source-gap: roll-rate-cecl | missing | roll-rate models named as an acceptable CECL method by a regulator or the FASB | closes with: an interagency FAQ, OCC or Fed document, or ASC 326 implementation guidance naming roll-rate | checked: 2026-10-29 -->

What every method shares is data the servicing system already has, if it kept it: balances by loan by month, delinquency by day, charge-offs and recoveries by loan with dates, and the origination attributes that define pools (product, vintage, risk grade, term, collateral). A lender that overwrote its delinquency status or kept balances only as current values can't build any of them.

## Forecasts and Reversion

The forecast is where judgment lives. A lender chooses a reasonable and supportable period it can defend and documents why, forecasts the variables its losses move with (unemployment, for most consumer credit), translates the forecast into adjusted loss rates or roll rates over that period, and reverts to historical rates afterward. Qualitative adjustments cover what the model can't see: a new product without history, a change in underwriting, a concentration, a natural disaster. Each choice is a documented assumption with an owner, reviewed by the credit committee and the auditors, and changed only with a record; Affirm's 10-K describes exactly that, an estimate built on historical experience "adjusted for current conditions," with judgments monitored "including review by our credit committee." Model governance in full is [Model Risk Management](/books/banking-and-lending/model-risk).

## Worked Numbers: A Vintage and Roll-Rate Allowance

My example, deliberately small. A pool of unsecured 36-month personal loans has an amortized cost of **$98.0 million** at September 30, 2026: $94.5 million current, $1.8 million 30 to 59 days past due, $1.0 million 60 to 89 and $0.7 million 90 to 119. The lender's method:

1. **Roll rates for the 12-month forecast period.** Historically 1.0% of current balances roll to 30 days each month, then 45% of those to 60, 70% of those to 90, and 85% of those to charge-off at 120 days. The unemployment forecast raises the first roll to **1.2%** for the next 12 months. Current balances run off 3% a month through payments; balances that don't roll forward cure.
2. **Historical vintage loss rates after the forecast period.** Balances still current at month 12 take each vintage's historical remaining-life loss rate from its loss curve: 1.0% for the 2024 vintage, 2.2% for 2025 and 3.5% for 2026, younger loans having more of their losses ahead.
3. **Recoveries** at 12% of gross charge-offs, from the lender's history.

| Component | Basis | Amount ($ thousands) |
| --- | --- | --- |
| Charge-offs in months 1 to 12 | Roll rates with the 1.2% forecast | 4,087 |
| Delinquent balances at month 12, rolled through | $792K × 26.8% + $368K × 59.5% + $267K × 85% | 658 |
| 2024 vintage still current at month 12 | $12,759K × 1.0% | 128 |
| 2025 vintage | $28,708K × 2.2% | 632 |
| 2026 vintage | $22,328K × 3.5% | 781 |
| **Gross expected losses** | | **6,285** |
| Expected recoveries | 12% | (754) |
| **Allowance** | **5.64% of amortized cost** | **5,531** |

- **The first months are already decided.** Month 1's charge-offs are 85% of today's 90-day bucket, $595 thousand; month 2's come from today's 60-day bucket; the roll rates mostly describe loans already late.
- **The forecast is worth $430 thousand.** Run with the historical 1.0% first roll, the same method gives $5,101 thousand (5.20%); the difference is the forecast's effect, disclosed and explained as such.
- **The quarter's provision is the true-up.** If the allowance was $5,200 thousand at June 30 and the quarter had $1,600 thousand of charge-offs and $180 thousand of recoveries, the provision is 5,531 − (5,200 − 1,600 + 180) = **$1,751 thousand**.
- **Rounding and simplifications are mine:** a real model segments by risk grade and term, lets delinquent balances pay down, and uses many more months of history, but the shape is this one.

## Day One and Growth

Because the allowance is lifetime from origination, every new loan adds its expected loss to the provision the day it books. In the example above, a new $10 million vintage with a 5% expected lifetime net loss adds **$500 thousand** of provision in its first month, before it has earned its first month's interest, about $110 thousand at a 13% rate. A lender growing originations reports provisions that run ahead of its charge-offs, and one shrinking reports the reverse; neither is a change in credit quality. That's why lenders' investor materials show losses by vintage alongside the provision, and why [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) stores the loss assumed at origination on each loan: the question "is this vintage performing as priced?" is answered by comparing that assumption with the vintage's realized curve.

## Charge-Offs and Recoveries in the Ledger

The allowance turns into four entries, each a balanced `journal_entries` row:

| Event | Debit | Credit |
| --- | --- | --- |
| Provision (day one and each true-up) | Provision for credit losses (expense) | Allowance for credit losses (contra-asset) |
| Charge-off | Allowance for credit losses | Loans receivable (the loan's principal) |
| Recovery after charge-off | Cash | Allowance for credit losses |
| Release (allowance above need) | Allowance for credit losses | Provision for credit losses |

- **A charge-off doesn't touch earnings** when it happens; the provision already did, when the loss was expected. That's the whole point of the allowance, and the reason a charge-off that the model didn't expect shows up as a larger true-up, not as a separate loss line.
- **The subledger moves with the GL.** The loan's account moves to `charged_off`, its principal bucket to zero against the charge-off entry, and the borrower still owes the full amount, which servicing and collections keep tracking off-books for recovery and for the bureau file ([Furnishing Credit Data](/books/banking-and-lending/credit-reporting#worked-numbers-the-date-of-first-delinquency)).
- **Recoveries are traceable to the loan.** A recovery credits the allowance, not income, and carries the account it came from, so recovery rates by vintage feed the next estimate.
- **Fees and accrued interest.** Interest that stops accruing on a nonaccrual loan, and interest and fees charged off with it, follow the lender's written accounting policy, which the system implements as data rather than code.

Bank regulatory reporting reads the same entries: charge-offs and recoveries by loan category on the call report's allowance schedule, which reconciles only if every entry carries the loan's category (Regulatory Reporting & Data covers the call report).

## Modifications and Vintage Disclosures

ASU 2022-02, issued March 31, 2022, eliminated the accounting guidance for troubled debt restructurings by creditors and replaced it with disclosures of modifications made to borrowers experiencing financial difficulty (principal forgiveness, a rate reduction, a significant payment delay, a term extension, or combinations), and required public business entities to disclose gross write-offs for the current period by year of origination. Both are queries against servicing data: every modification is a `payment_schedules` version with a reason and a hardship flag ([Hardship Programs](/books/banking-and-lending/collections#hardship-programs)), and every charge-off carries the loan's vintage. A lender that recorded modifications as edits, or charge-offs without vintages, can't produce either table.

## The Capital Transition

For banks, the allowance reduces regulatory capital, so adopting CECL was a capital event. The OCC, Federal Reserve and FDIC let banking organizations phase the day-one effect into regulatory capital over three years (84 FR 4222, February 14, 2019), and in 2020 let those adopting CECL that year delay the estimated effect for two years and then phase it in over three (85 FR 61577, September 30, 2020). Both transitions have run their course for the 2020 adopters; the lesson for the system is that the allowance is an input to capital, liquidity and stress testing as well as to earnings, and the same run must produce figures each consumer can reconcile to ([Bank Economics & Balance Sheet Risk](/books/banking-and-lending/bank-economics) covers capital ratios).

## Fair Value as the Contrast

A loan measured at fair value carries no allowance. Each period the lender estimates what the loan would sell for, usually by discounting its expected cash flows (net of expected defaults, recoveries and prepayments) at a market rate, and the change in that value runs through earnings. Upstart does this for its whole balance sheet; Happen does it for held-for-investment loans originated since January 1, 2026; Klarna is moving new Fair Financing loans to it. What changes in the system:

- **No day-one provision,** and origination fees and costs aren't deferred; the gain or loss at origination is the difference between the loan's fair value and what was funded.
- **A monthly mark per pool,** from the same inputs a CECL model uses (default curves, recoveries, prepayment speeds) plus a discount rate, with the mark posted as a fair value adjustment entry against the loans, not against an allowance.
- **Charge-offs still happen** but post against the loan's fair value, which already expected them; realized-versus-expected losses show up in the next mark.
- **Two regimes on one book.** Happen's legacy loans stay under CECL while new ones are at fair value, so `loans.measurement_basis` and its election date ([The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it)) decide, loan by loan, which entries a payment, a charge-off and a recovery produce.

My view: for a balance-sheet lender with stable growth and a bank's capital rules, CECL's allowance is the more legible picture; for a lender that sells most of what it makes and holds the rest briefly, fair value matches how the loans are actually valued. Either way the inputs are the same loan-level history, and building that history well is the part that can't be bought later.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `loans` (with `measurement_basis` and `vintage` from [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it)), `gl_accounts` for loans receivable, the allowance, provision expense and fair value adjustments, and `journal_entries` with `journal_lines`. Delinquency history comes from `delinquency_snapshots` in [Collections & Recovery](/books/banking-and-lending/collections#how-to-build-it). This chapter adds the pool definitions, the model runs and their results, the assumptions as approved, charge-offs, recoveries and fair value marks.

```sql
CREATE TABLE loss_pools (                    -- groups with similar risk characteristics, versioned
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id       UUID NOT NULL REFERENCES institutions (id),
  code                 TEXT NOT NULL,          -- e.g. 'PL-36-GRADE-B'
  version              INT NOT NULL,
  criteria             JSONB NOT NULL,         -- product, term, risk grade, collateral
  method               TEXT NOT NULL CHECK (method IN ('vintage', 'roll_rate', 'warm',
                         'pd_lgd', 'dcf', 'individual')),
  effective_from       DATE NOT NULL,
  UNIQUE (institution_id, code, version)
);

CREATE TABLE allowance_assumptions (         -- every judgment, approved and dated
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  pool_id              UUID NOT NULL REFERENCES loss_pools (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('roll_rates', 'loss_curve', 'forecast',
                         'forecast_period', 'reversion', 'recovery_rate', 'prepayment',
                         'qualitative')),
  value                JSONB NOT NULL,         -- the matrix, curve, scenario or adjustment
  rationale            TEXT NOT NULL,
  approved_by          TEXT NOT NULL,          -- the committee, by reference
  approved_at          TIMESTAMPTZ NOT NULL,
  superseded_by        UUID REFERENCES allowance_assumptions (id)
);

CREATE TABLE allowance_runs (                -- one estimate for a reporting date
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id       UUID NOT NULL REFERENCES institutions (id),
  as_of_date           DATE NOT NULL,
  purpose              TEXT NOT NULL CHECK (purpose IN ('reporting', 'scenario', 'backtest')),
  model_version        TEXT NOT NULL,
  inputs_ref           TEXT NOT NULL,          -- frozen snapshot of balances and delinquency
  status               TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'approved', 'posted')),
  journal_entry_id     UUID REFERENCES journal_entries (id),  -- the provision true-up, when posted
  UNIQUE (institution_id, as_of_date, purpose, model_version)
);

CREATE TABLE allowance_pool_results (
  run_id               UUID NOT NULL REFERENCES allowance_runs (id),
  pool_id              UUID NOT NULL REFERENCES loss_pools (id),
  vintage              DATE,                   -- null when the method isn't by vintage
  amortized_cost       BIGINT NOT NULL,
  forecast_period_loss BIGINT NOT NULL,
  reversion_loss       BIGINT NOT NULL,
  expected_recoveries  BIGINT NOT NULL,
  qualitative          BIGINT NOT NULL DEFAULT 0,
  allowance            BIGINT NOT NULL,
  assumption_ids       UUID[] NOT NULL,        -- exactly which assumptions it used
  PRIMARY KEY (run_id, pool_id, vintage)
);

CREATE TABLE charge_offs (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  reason               TEXT NOT NULL CHECK (reason IN ('days_past_due', 'bankruptcy', 'fraud',
                         'deceased', 'settlement', 'collateral_shortfall')),
  policy_ref           TEXT NOT NULL,          -- the rule that required it, e.g. 120 DPD closed-end
  principal            BIGINT NOT NULL,
  interest_and_fees    BIGINT NOT NULL DEFAULT 0,
  vintage              DATE NOT NULL,          -- for gross write-offs by origination year
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  charged_off_on       DATE NOT NULL
);

CREATE TABLE recoveries (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  charge_off_id        UUID NOT NULL REFERENCES charge_offs (id),
  source               TEXT NOT NULL CHECK (source IN ('borrower', 'agency', 'debt_sale',
                         'collateral_sale', 'insurance', 'bankruptcy_distribution')),
  gross_amount         BIGINT NOT NULL CHECK (gross_amount > 0),
  fee_amount           BIGINT NOT NULL DEFAULT 0,  -- agency contingency, booked as expense
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  received_on          DATE NOT NULL
);

CREATE TABLE fair_value_marks (              -- loans with measurement_basis = 'fair_value'
  pool_id              UUID NOT NULL REFERENCES loss_pools (id),
  as_of_date           DATE NOT NULL,
  principal            BIGINT NOT NULL,
  fair_value           BIGINT NOT NULL,
  discount_rate_bps    INT NOT NULL,
  assumption_ids       UUID[] NOT NULL,
  change_in_period     BIGINT NOT NULL,
  journal_entry_id     UUID REFERENCES journal_entries (id),
  PRIMARY KEY (pool_id, as_of_date)
);
```

How it runs:

1. **Freeze the inputs.** A run snapshots balances, delinquency and loan attributes as of the reporting date into `inputs_ref`, so the estimate can be reproduced after the ledger moves on ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
2. **Assumptions are rows, not constants.** The run cites exactly which approved assumptions it used, and a changed forecast is a new row with its approval, so the difference between two quarters can be attributed to data or to judgment.
3. **Posting is one entry.** An approved run posts the true-up (required allowance less the GL allowance after the period's charge-offs and recoveries) as a single provision entry, by pool and loan category, so the GL allowance always equals the latest posted run.
4. **Charge-offs are driven by policy.** A nightly job charges off every loan the policy requires (days past due by product, bankruptcy notice age, fraud discovery age), writes `charge_offs` with the rule, posts the entry and moves the account's status in the same transaction.
5. **Backtests are runs too.** A `backtest` run applies last year's assumptions to last year's inputs and compares with realized losses, which is the evidence model validation and auditors ask for.

## Auditing

The allowance is audited every year and examined at every bank exam, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every run** with its frozen inputs, model version, pools, assumptions and results, and who reviewed and approved it.
- **Every assumption** with its rationale, approver, date and what it replaced.
- **The provision entry per run,** reconciling the allowance roll-forward: beginning balance, provision, charge-offs, recoveries, ending balance.
- **Every charge-off** with the policy rule that required it, its date, vintage and entry.
- **Every recovery** traced to its charge-off and source, gross and net of fees.
- **Backtests** against realized losses.
- **For fair value pools,** every mark with its inputs and the entry it posted, and each loan's measurement basis with its election date.

## What This Means for the System You Build

- **Keep loan-level history from the first day:** monthly balances, daily delinquency, every charge-off and recovery with dates and vintages. No method works without it.
- **Define pools as versioned criteria** and record which pool each loan fell in for each run.
- **Store assumptions as approved, dated rows** and have every run cite the ones it used.
- **Freeze inputs per run** so an estimate can be reproduced and backtested.
- **Post the provision as one true-up entry** so the GL allowance always equals the posted run.
- **Charge off on policy automatically,** with the rule recorded, and keep collecting off-books.
- **Book recoveries against the allowance,** traced to the loan and its charge-off.
- **Carry the measurement basis on the loan** and support CECL and fair value on one ledger.

## References

**Regulators and guidance**

- [Federal Register: Interagency Policy Statement on Allowances for Credit Losses (June 1, 2020)](https://www.federalregister.gov/documents/full_text/html/2020/06/01/2020-10291.html), no prescribed method, the named methods, pooling, forecasts and reversion, recoveries, off-balance-sheet exposures, scaling and effective dates
- [Federal Reserve: SR 16-12, Interagency Guidance on the New Accounting Standard on Financial Instruments, Credit Losses](https://www.federalreserve.gov/supervisionreg/srletters/sr1612.htm), smaller institutions and complex modeling
- [Federal Reserve: SR 19-8, Frequently Asked Questions on the New Accounting Standard on Financial Instruments, Credit Losses](https://www.federalreserve.gov/supervisionreg/srletters/sr1908.htm), the interagency CECL FAQs and the deferred effective date
- [OCC: Bulletin 2019-17, Frequently Asked Questions on the New Accounting Standard on Financial Instruments, Credit Losses](https://occ.gov/news-issuances/bulletins/2019/bulletin-2019-17.html), WARM, scalability and the collateral-dependent expedient
- [Federal Register: Uniform Retail Credit Classification and Account Management Policy (June 12, 2000)](https://www.federalregister.gov/documents/full_text/html/2000/06/12/00-14704.html), charge-off timing by product and event
- [Federal Register: Regulatory capital rule, implementation and transition of CECL, 84 FR 4222](https://www.federalregister.gov/api/v1/documents/2018-28281.json), the three-year phase-in of the day-one effect
- [Federal Register: Regulatory capital rule, revised transition of CECL, 85 FR 61577](https://www.federalregister.gov/api/v1/documents/2020-19782.json), the two-year delay and three-year phase-in for 2020 adopters

**Accounting standards**

- [Deloitte DART: FASB issues ASU 2022-02 (Heads Up, 2022)](https://dart.deloitte.com/USDART/home/publications/deloitte/heads-up/2022/fasb-issues-asc-326-update), elimination of TDR accounting, modification disclosures and gross write-offs by year of origination

**Filings and releases**

- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), the provision for credit losses, its definition and the allowance estimate's basis
- [Happen (formerly LendingClub): Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1409970/000140997026000018/lc-20251231.htm), the fair value option for held-for-investment loans from January 1, 2026 and the reason given
- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), loans held at fair value by discounted cash flow
- [Klarna Group: Second quarter 2026 results](https://s205.q4cdn.com/644747736/files/doc_earnings/2026/q2/earnings-result/Q2-26-Klarna-Group-plc-Press-Release.pdf), the move of new US and German Fair Financing originations to fair value and its effect on revenue and costs
