+++
title = "Bank Economics & Balance Sheet Risk"
nav_title = "Bank Economics"
description = "How a bank earns and what can sink it: net interest margin, deposit betas, fee lines, the efficiency ratio, interest rate risk, liquidity and capital."
category = "Banking & Lending Industry"
order = 2403
part = "The Business"
tags = ["banking", "net-interest-margin", "deposit-beta", "interest-rate-risk", "liquidity", "capital"]
+++

A bank is a balance sheet with a business attached. It borrows from depositors, mostly short and mostly on demand, and lends or invests for longer at higher rates; the difference is net interest income, and for most banks it is most of revenue. Fees ride on top: service charges, card income, treasury management, wealth. Expenses (people, branches, technology, the FDIC's assessment) come off, and credit losses come off again. What's left must cover the cost of the capital that absorbs everything that goes wrong.

Every product decision an engineer at a bank, a core vendor or a sponsor bank sees traces back to these lines. A deposit product's rate is a margin decision, its fee schedule is a fee-line decision, the core that runs it is an efficiency-ratio decision, and how fast its balances can leave is a liquidity decision that killed three large banks in 2023 ([When Banks Fail](/books/banking-and-lending/bank-failures)). This chapter reads the income statement the way the filings and the FDIC's Quarterly Banking Profile (QBP) present it, then the three balance sheet risks behind it: interest rate risk, liquidity and capital. The parties and the money model are in [The Banking & Lending Business](/books/banking-and-lending/banking-business#how-the-money-works); the market itself is in [The Banking Landscape](/books/banking-and-lending/banking-landscape).

## How the Platforms Do It

As of October 2026, from the most recent public reports:

| Reporter | Scale | Net interest margin | Deposit pricing disclosure | Efficiency | What it teaches |
| --- | --- | --- | --- | --- | --- |
| All FDIC-insured institutions (QBP, Q2 2026) | 4,238 institutions, $26.5T assets | 3.32% | Domestic deposits up $142.7B; estimated uninsured deposits up $317.4B | Not stated as a ratio in the summary | The industry baseline; trading drove the quarter's noninterest income |
| Community banks (QBP, Q2 2026) | 3,818 banks, 90% of institutions | 3.81% | Funding cost 1.85% of earning assets | Not stated | Yield 5.66% minus funding 1.85% is the margin |
| JPMorgan Chase (4Q25 release) | Money-center | Not in the release | Average deposits up 6% year over year | Not in the release | Reports NII "excluding Markets" ($23.9B of $25.1B) so trading carry doesn't hide the deposit and loan business |
| Regions Financial (4Q25 release) | $129.9B average deposits | 3.70% in 4Q25; 3.61% for 2025 | Interest-bearing deposit cost 1.85% | 56.8% (4Q25), 56.9% (2025) | Hedging and deposit pricing offset falling floating-rate yields |
| Valley National (Q2 2025 call) | Regional | Fifth straight quarter of improvement | "Cumulative total deposit beta ... 51%" in the cutting cycle | Not discussed | How a bank states its beta |
| Federally insured credit unions (NCUA, Q2 2026) | 4,214 credit unions, 146.1M members | 3.49% of average assets (a different denominator) | Share certificates and money market growth | Not stated | Same economics, measured differently |

The rule the table teaches: never compare margins without checking the denominator and the scope. A money-center bank's NII includes a trading book, a credit union's "net interest margin" is over average assets rather than earning assets, and a regional's reported NIM is on a fully taxable-equivalent (FTE) basis that grosses up tax-exempt income.

## The Income Statement

The QBP and every bank's earnings release follow the same order, and so does the call report it comes from ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#call-reports)):

1. **Interest income** on loans, securities, cash at the Federal Reserve and fed funds sold.
2. **Interest expense** on deposits, borrowings (Federal Home Loan Bank advances, repo, the discount window) and debt.
3. **Net interest income (NII)**, the difference.
4. **Provision for credit losses**, the expense that builds the allowance for expected losses ([Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl) covers the method).
5. **Noninterest income**: service charges on deposit accounts, card and ATM fees, interchange, treasury management, wealth and trust, mortgage banking, capital markets, gains on securities.
6. **Noninterest expense**: salaries, occupancy, equipment and software, outside services, marketing, FDIC assessments, operational losses.
7. **Pretax income**, taxes, **net income**.

For the second quarter of 2026 the FDIC reported net income of $90.1 billion for all insured institutions, up $9.7 billion (12.0%) from the first quarter, and a quarterly return on assets of 1.37%. Net operating revenue (NII plus noninterest income) was $293.5 billion; noninterest income rose $5.5 billion, mostly on trading revenue and fees, and NII rose $5.3 billion (2.8%). Noninterest expense was $164.3 billion, up $4.4 billion from the prior quarter and $15.0 billion (10.0%) from a year earlier. Community banks earned $8.7 billion, and their increase came from NII rather than fees.

The two ratios that summarize the statement are return on assets (net income over average assets) and return on equity. Investors read return on tangible common equity, which strips goodwill so an acquisitive bank and an organic one compare: Regions reported 18.25% for 2025.

## Net Interest Margin

Net interest margin is NII over average earning assets, annualized. The QBP decomposes it as the yield on earning assets minus the cost of funds, both over earning assets, which makes the community bank figure for the second quarter of 2026 a subtraction:

| Per $100 of average earning assets, annualized | Community banks, Q2 2026 |
| --- | --- |
| Interest earned | $5.66 |
| Interest paid on all funding | $1.85 |
| Net interest margin | $3.81 |

The industry's NIM was 3.32%, up one basis point from the first quarter because the yield on earning assets rose 2.3 basis points while the cost of funds rose 1.6. Community banks were higher at 3.81%, up 10 basis points in the quarter and 19 from a year earlier, as funding costs fell 21 basis points over the year while yields fell only 2. The gap between the two figures is mostly mix: large banks hold more securities, trading assets and cash, which earn less than loans, and more wholesale funding.

Three things move NIM, and the system that measures it has to separate them:

- **Rate:** what each asset earns and each liability costs, by product.
- **Volume:** how much of each there is.
- **Mix:** the share of earning assets in loans versus securities versus cash, and the share of funding that pays nothing (noninterest-bearing deposits) versus market rates.

Regions' fourth quarter of 2025 shows rate and hedging at work: its NIM rose 11 basis points to 3.70% even though the Federal Reserve cut rates in the quarter, because "deposit cost management and hedging benefits fully offset floating rate product resets," helped by lower cash balances (a mix effect). For the full year its NIM was 3.61%, against 3.54% in 2024.

Taxable-equivalent adjustment matters at the margin. Regions' fourth-quarter NII was $1,281 million as reported and $1,294 million FTE: the $13 million grosses up tax-exempt municipal income so its yield compares with taxable assets. A NIM computed in-house on the GL will differ from the reported one by exactly that adjustment.

## Deposit Betas

A deposit beta is the share of a change in the policy rate that a bank passes through to what it pays depositors:

```text
beta = change in deposit cost / change in policy rate, over the same window
```

Banks state it two ways, and the difference is the noninterest-bearing mix. An illustration, with a 100 basis point cut in the policy rate and a bank whose deposits are 70% interest-bearing:

| | Before | After | Change |
| --- | --- | --- | --- |
| Rate on interest-bearing deposits | 2.80% | 2.20% | 60 bp: interest-bearing beta 60% |
| Cost of total deposits (70% interest-bearing, 30% at zero) | 1.96% | 1.54% | 42 bp: total deposit beta 42% |

The same repricing is a 60% beta or a 42% beta depending on the denominator, which is why a bank's disclosure names it. Valley National's CFO, on its second-quarter 2025 call, gave the total version: "Our cumulative total deposit beta during the recent rate decrease cycle stands at 51%," with its average cost of deposits down 51 basis points year over year. Regions disclosed its interest-bearing deposit cost (1.85% in the fourth quarter of 2025) alongside average deposits of $129.9 billion, of which $39.5 billion was noninterest-bearing, about 30%; on those figures its total deposit cost was roughly 1.29%.

Betas aren't constants. They differ by product (money market and commercial deposits reprice fast, small consumer checking barely moves), by direction (banks raise rates slowly and cut them quickly when they can), by stage of the cycle (early moves pass through less than later ones), and by competition. A bank funded with high-beta deposits (brokered, commercial, online savings) earns less NIM when rates rise and recovers faster when they fall. Neobanks paying a headline savings rate are running a high-beta book on purpose.

The engineering consequence: beta is a measured fact per product per cycle, computed from what the bank actually paid, and an assumed parameter in every interest rate risk model. Keeping the two apart, and comparing them, is most of the work (see [How to Build It](#how-to-build-it)).

## Fee Lines

Noninterest income is the part of revenue that doesn't depend on the yield curve, which is why banks grow it and why regulators and plaintiffs watch it. Regions' fourth quarter of 2025 is a typical regional mix: $640 million of noninterest income against $1,294 million of FTE NII, so fees were a third of revenue. Within it, service charges on deposit accounts were $163 million (up from $155 million a year earlier, "due primarily to account openings and higher seasonal activity"), card and ATM fees $123 million and wealth management $143 million, and Regions reported annual records in both wealth management and treasury management income for 2025.

The lines an engineer meets:

- **Service charges on deposit accounts:** monthly maintenance, overdraft and NSF fees, wires, stop payments, account analysis fees for business accounts. Overdraft revenue is a policy and litigation subject of its own (Overdraft, NSF & Fees).
- **Card and interchange income:** debit interchange is capped for issuers with $10 billion or more in assets under Regulation II, which is why the $10 billion line shapes neobank and sponsor bank economics (the Payments volume's [Card Issuing](/books/payments/card-issuing#the-economics) has the split). JPMorgan reported lower card income in the fourth quarter of 2025 on lower net interchange and higher costs of originating new accounts, a reminder that rewards come out of interchange.
- **Treasury management:** fees for payments, liquidity and information services to businesses, often paid in balances rather than cash through account analysis ([Treasury Management](/books/banking-and-lending/treasury-management)).
- **Wealth, trust and custody:** asset-based fees.
- **Mortgage banking:** gain on sale and servicing fees, with mortgage servicing rights marked to market; Regions' mortgage income fell 16% in the fourth quarter "driven primarily by mortgage servicing rights valuation and net hedge performance."
- **Payments revenue** at the largest banks: JPMorgan's Payments revenue was $5.1 billion in the fourth quarter of 2025.

## The Efficiency Ratio

The efficiency ratio is noninterest expense over revenue (NII, usually FTE, plus noninterest income). Lower is better: it's the cents of cost per dollar of revenue.

| Regions, 4Q25 ($ millions) | |
| --- | --- |
| Noninterest expense | 1,098 |
| NII, taxable-equivalent | 1,294 |
| Noninterest income | 640 |
| Efficiency ratio: 1,098 / (1,294 + 640) | 56.8% |

That matches the reported 56.8%. Regions' full-year ratio improved from 59.5% in 2024 to 56.9% in 2025. Banks also report an "adjusted" ratio that removes items management calls nonrecurring (57.5% for the same quarter); the reconciliation is in the filing, and a metric built in-house should state which version it is.

Technology is inside the numerator. Regions' equipment and software expense, its FDIC assessments and its outside services are separate lines, and the FDIC's QBP notes that "all other" noninterest expense, the category that includes data processing, consulting and advisory fees, led the industry's quarterly increase in the second quarter of 2026. A core contract, a digital banking platform priced per registered user and a BaaS program's compliance staff all land here, which is why vendor pricing conversations at a bank are efficiency ratio conversations (Core Banking Systems covers the vendors and how they price).

## Interest Rate Risk and ALM

Asset-liability management (ALM) is the discipline of measuring and steering how the balance sheet responds to rates. Two views, and a bank needs both:

- **Earnings at risk (NII sensitivity):** how next year's NII changes if rates move, given what reprices when. A bank whose assets reprice faster than its deposits is asset-sensitive and gains when rates rise.
- **Economic value of equity (EVE):** the present value of assets minus liabilities under each rate path, which captures long-dated fixed-rate assets whose NII looks fine today and whose market value has fallen.

A one-year repricing gap is the simplest NII model:

| Reprices within 12 months | Amount |
| --- | --- |
| Assets: floating-rate loans, cash, short securities | $400M |
| Liabilities: money market, savings at an assumed full pass-through, short CDs, borrowings | $550M |
| Gap | -$150M |
| NII change for a +100 bp parallel shift, held for a year | about -$1.5M |

Every word in that table is an assumption: which deposits "reprice" (savings accounts have no maturity and a beta well under 100%), how fast mortgages prepay, whether rates move in parallel. Real ALM systems run thousands of instruments through rate scenarios with behavioral assumptions for prepayments, deposit betas and deposit decay (how long a non-maturity deposit stays), and those assumptions are models subject to validation (Model Risk Management).

EVE is where securities portfolios bite. A bond's price falls by roughly its duration times the rate change: a $100 million portfolio with a duration of 6 loses about $12 million of value if rates rise 2 percentage points. Accounting decides where that loss shows. Securities classified as available for sale are carried at fair value with unrealized losses in accumulated other comprehensive income (AOCI); held-to-maturity securities are carried at amortized cost and the loss appears only in the footnotes. For all insured institutions at June 30, 2026, unrealized losses on securities totaled $326.7 billion, 5.5% of amortized cost: $109.8 billion on AFS securities (2.9% of cost) and $216.9 billion on HTM securities (10.5% of cost). Regions' regulatory CET1 ratio leaves AOCI out, which is why it also reports a non-GAAP version with it in: 10.8% as calculated for regulation and 9.6% including AOCI.

Silicon Valley Bank is the case the regulators now teach. The Federal Reserve's review found that SVB "had breached its long-term IRR limits on and off since 2017 because of the structural mismatch between long-duration securities and short-duration deposits," that in April 2022 it "made counterintuitive modeling assumptions about the duration of deposits to address the limit breach rather than managing the actual risk," and that it "removed interest rate hedges that would have protected against rising interest rates." Its March 8, 2023 restructuring sold $21 billion of AFS securities at a $1.8 billion after-tax loss, and the run began the next day. The lesson for a system: the deposit duration assumption is the most consequential number in the model, it must be versioned with who changed it and why, and a limit breach that is cured by changing an assumption should be visible as exactly that.

Hedges are the other lever: interest rate swaps that convert fixed-rate assets to floating or the reverse. Regions credited "hedging benefits" for holding its margin as floating-rate loans repriced down.

## Liquidity

Liquidity risk is the risk that depositors and creditors want cash faster than the bank can produce it without ruinous losses. A bank holds a buffer (cash at the Federal Reserve, Treasuries it can sell or pledge), has secured borrowing capacity (Federal Home Loan Bank advances, the discount window, repo), and runs a contingency funding plan for when both are tested.

The largest banks are subject to the liquidity coverage ratio: high-quality liquid assets over total net cash outflows must be "equal to or greater than 1.0," calculated each business day, or monthly on the last business day for Category IV firms (12 CFR 249.10). The ratio's outflow assumptions treat uninsured and operational deposits as runnier than insured retail deposits, which is the regulatory version of a point every bank's own stress test makes: who your depositors are matters more than how much they hold.

What 2023 showed is speed. SVB lost over $40 billion of deposits on March 9 and expected over $100 billion more on March 10, "roughly 85 percent of the bank's deposit base"; by comparison the Fed cites about $10 billion over 8 days at Wachovia and $19 billion over 16 days at Washington Mutual in 2008. SVB "did not test its capacity to borrow at the discount window in 2022 and did not have appropriate collateral and operational arrangements in place." Uninsured deposit concentration is the metric to watch, and it is rising again: in the second quarter of 2026 estimated uninsured domestic deposits rose $317.4 billion (3.8%) and accounted for all of the industry's deposit growth.

The systems that matter for liquidity are mundane: an intraday view of the Federal Reserve account and payment outflows, collateral already pledged and tested at the discount window and FHLB, a daily report of large and concentrated depositors, and deposit flows by segment fast enough to see a run in hours rather than at the end of the day.

## Capital in Brief

Capital is the equity that absorbs losses before depositors and the FDIC do. The prompt corrective action thresholds (12 CFR 6.4 for national banks, with equivalent rules at the other agencies) are the numbers every bank manages to:

| Category | Total risk-based | Tier 1 risk-based | CET1 | Leverage |
| --- | --- | --- | --- | --- |
| Well capitalized | 10.0% | 8.0% | 6.5% | 5.0% |
| Adequately capitalized | 8.0% | 6.0% | 4.5% | 4.0% |
| Undercapitalized | below 8.0% | below 6.0% | below 4.5% | below 4.0% |
| Significantly undercapitalized | below 6.0% | below 4.0% | below 3.0% | below 3.0% |
| Critically undercapitalized | tangible equity at or below 2.0% of total assets | | | |

A bank under a written agreement, order or capital directive requiring a specific level isn't well capitalized even if its ratios are. Falling categories triggers mandatory restrictions, and a critically undercapitalized bank must generally be closed within 90 days ([When Banks Fail](/books/banking-and-lending/bank-failures#how-the-fdic-resolves-a-bank)).

Small banks can skip risk-weighting through the community bank leverage ratio: a bank under $10 billion with off-balance-sheet exposures of 25% or less of assets and trading assets and liabilities of 5% or less, and a leverage ratio greater than 8%, is treated as meeting the risk-based requirements and as well capitalized (12 CFR 3.12, as amended on April 29, 2026; it was 9% before). A bank that slips below the criteria gets a grace period of four quarters, but none if its leverage ratio is 7% or less.

For the industry at June 30, 2026 the tier 1 risk-based ratio was 13.75% and the leverage ratio 8.98%, both down 17 basis points in the quarter as assets grew faster than capital. De novo banks are held higher: a tier 1 leverage ratio of at least 8% for their first three years ([Starting a Bank](/books/banking-and-lending/starting-a-bank#capital-liquidity-and-the-three-year-plan)).

## Credit Unions Read Differently

Credit unions run the same model (shares and deposits in, loans out) as cooperatives without shareholders, and NCUA reports it on a different basis. For the year to date through the second quarter of 2026, federally insured credit unions earned $86.1 billion of net interest income, which NCUA calls "net interest margin" and states as 3.49% of average assets, not earning assets; return on average assets was 0.91% (median 0.71%), and the net worth ratio 11.42%. Shares and deposits were $2.13 trillion, with share certificates and money market accounts growing fastest. A dashboard that puts credit unions next to banks has to restate one or the other, and say which.

## How to Build It

These are deltas against the volume's core data model (`gl_accounts`, `balance_snapshots`, `interest_accruals`, `journal_lines`; see [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)). The principle: reported ratios are computed from the GL and the subledger, never typed in; ALM inputs are snapshots of positions plus versioned assumptions; and every reported number can be traced to the run that produced it.

The GL needs to know what each account is for in the margin math:

```sql
ALTER TABLE gl_accounts
  ADD COLUMN margin_role TEXT CHECK (margin_role IN (
    'earning_asset', 'nonearning_asset', 'interest_bearing_liability',
    'noninterest_bearing_liability', 'equity', 'interest_income', 'interest_expense',
    'noninterest_income', 'noninterest_expense', 'provision', 'tax')),
  ADD COLUMN tax_exempt BOOLEAN NOT NULL DEFAULT FALSE;  -- for the FTE gross-up

CREATE TABLE policy_rates (                -- the index a beta is measured against
  index_code      TEXT NOT NULL,             -- 'fed_funds_upper', 'sofr', 'prime'
  effective_date  DATE NOT NULL,
  rate            NUMERIC(9, 6) NOT NULL,    -- 0.043300 for 4.33%
  source_url      TEXT NOT NULL,
  PRIMARY KEY (index_code, effective_date)
);

CREATE TABLE alm_positions (               -- one row per instrument per as-of date
  as_of_date        DATE NOT NULL,
  institution_id    UUID NOT NULL REFERENCES institutions (id),
  position_ref      TEXT NOT NULL,           -- account id, security CUSIP, swap trade id
  account_id        UUID REFERENCES accounts (id),
  gl_account_id     UUID NOT NULL REFERENCES gl_accounts (id),
  balance           BIGINT NOT NULL,         -- minor units; book value
  fair_value        BIGINT,                  -- securities and swaps
  rate              NUMERIC(9, 6) NOT NULL,
  rate_type         TEXT NOT NULL CHECK (rate_type IN ('fixed', 'floating', 'administered')),
  index_code        TEXT,                    -- floating: the index it resets on
  spread            NUMERIC(9, 6),
  next_reprice_date DATE,                    -- null: administered rate, set by the bank
  maturity_date     DATE,                    -- null: non-maturity deposit
  accounting_class  TEXT CHECK (accounting_class IN ('afs', 'htm', 'trading', 'loan',
                      'deposit', 'borrowing', 'derivative')),
  PRIMARY KEY (as_of_date, institution_id, position_ref)
);

CREATE TABLE alm_assumption_sets (         -- versioned; a model under validation
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id  UUID NOT NULL REFERENCES institutions (id),
  version         INT NOT NULL,
  assumptions     JSONB NOT NULL,            -- betas, decay curves, prepayment speeds by segment
  rationale       TEXT NOT NULL,
  approved_by     TEXT NOT NULL,             -- the ALCO approval, as a reference
  approved_at     TIMESTAMPTZ NOT NULL,
  supersedes_id   UUID REFERENCES alm_assumption_sets (id),
  UNIQUE (institution_id, version)
);

CREATE TABLE alm_runs (                    -- one scenario run, reproducible
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id    UUID NOT NULL REFERENCES institutions (id),
  as_of_date        DATE NOT NULL,
  assumption_set_id UUID NOT NULL REFERENCES alm_assumption_sets (id),
  scenario          TEXT NOT NULL,           -- 'base', 'up_100', 'up_200', 'down_100', 'steepener'
  engine_version    TEXT NOT NULL,
  nii_12m           BIGINT NOT NULL,         -- projected NII, next 12 months
  eve               BIGINT NOT NULL,         -- economic value of equity
  limit_breaches    JSONB NOT NULL DEFAULT '[]',
  run_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, as_of_date, assumption_set_id, scenario)
);
```

Realized deposit cost by product comes from what was actually accrued, which is what makes a measured beta comparable to the assumed one:

```sql
-- Annualized cost of a product's deposits for a month: accrued interest over average balance.
SELECT p.code,
       date_trunc('month', ia.business_date) AS month,
       SUM(ia.amount) / NULLIF(AVG(bs.ledger_balance), 0)
         * 365.0 / COUNT(DISTINCT ia.business_date) AS annualized_cost
FROM interest_accruals ia
JOIN balance_snapshots bs ON bs.account_id = ia.account_id
                         AND bs.business_date = ia.business_date
JOIN accounts a ON a.id = ia.account_id
JOIN products p ON p.id = a.product_id
WHERE a.account_kind = 'deposit'
GROUP BY p.code, date_trunc('month', ia.business_date);
```

The realized beta for a window is the change in that cost over the change in `policy_rates` for the same dates; store it per product and cycle beside the assumption it replaces. Design notes:

- **NIM from the books, FTE as an explicit step.** Average earning assets come from daily balances of `earning_asset` GL accounts, interest from the income accounts, and the FTE adjustment from `tax_exempt` income at the statutory rate, stored as its own line so the reported and GL figures reconcile ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)).
- **Positions are snapshots, not live reads.** ALM runs on a frozen `as_of_date`; rerunning last quarter's scenario must produce last quarter's answer, which is why positions are copied rather than joined to live accounts ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Administered rates are a type, not a missing value.** A savings rate the bank sets has no index and no reset date; modeling it as `floating` with a guessed index is how an assumption hides inside data.
- **Uninsured concentration is a daily query.** Per-depositor balances by ownership category against the insurance limit (Deposit Insurance owns the computation), summed by segment and top depositors, with the day-over-day change, is the early warning the 2023 failures lacked.

## Auditing

ALM and margin reporting go to the board's asset-liability committee, the examiners' Sensitivity to Market Risk and Liquidity ratings ([Exams, Ratings & Call Reports](/books/banking-and-lending/exams-and-supervision#camels)), the auditors and, through the call report and 10-K, the public. What to keep:

- **Every assumption set with its approval and rationale,** and which runs used it, so "why did EVE improve" can be answered with "the deposit decay assumption changed on this date, approved by this committee" ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Limit breaches and their resolution,** including breaches resolved by changing an assumption rather than the balance sheet.
- **Measured against assumed betas and decay,** per cycle, as model back-testing evidence.
- **The reconciliation from GL to reported ratios,** NIM, efficiency and capital, with each adjustment named.
- **Liquidity test evidence:** discount window and FHLB test draws, collateral pledged, contingency funding plan exercises.

## What This Means for the System You Build

- **Every product is a margin decision.** A deposit product's rate, fees and expected beta and a loan product's yield and loss rate belong in the product definition and flow to ALM, not in a pricing spreadsheet.
- **Compute ratios from the ledger.** NIM, efficiency and fee mix are queries over GL accounts tagged with their role; a hand-maintained KPI table drifts from the call report within a quarter.
- **Treat behavioral assumptions as models.** Betas, deposit decay and prepayment speeds are versioned, approved, back-tested against what actually happened and visible when they change.
- **Watch who holds the deposits.** Uninsured balances, concentration in a few depositors or one industry, and intraday outflows are the liquidity signals, and they must be visible within the day.
- **Know the capital line you're on.** The bank's category, any order that sets a higher requirement and, for a de novo, the 8% leverage floor decide what growth is allowed; a product launch that grows the balance sheet consumes capital.

## References

**Law and regulation**

- [12 CFR 6.4: Capital measures and capital category definitions](https://www.law.cornell.edu/cfr/text/12/6.4), the prompt corrective action thresholds and the CBLR treatment
- [12 CFR 3.12: Community bank leverage ratio framework](https://www.law.cornell.edu/cfr/text/12/3.12), the 8% requirement after the April 29, 2026 amendment (91 FR 22988), eligibility and the grace period
- [12 CFR 249.10: Liquidity coverage ratio](https://www.law.cornell.edu/cfr/text/12/249.10), the 1.0 minimum and daily or monthly calculation
- [FDIC: Resolutions Handbook](https://www.fdic.gov/bank-failures/resolutions-handbook.pdf), closure generally within 90 days of becoming critically undercapitalized

**Regulators and guidance**

- [FDIC: Quarterly Banking Profile, Second Quarter 2026](https://www.fdic.gov/quarterly-banking-profile), net income, ROA, NIM and its decomposition, community bank yields and funding costs, unrealized losses, deposits, capital ratios
- [NCUA: Quarterly Credit Union Data Summary, 2026 Q2](https://www.ncua.gov/files/publications/analysis/quarterly-data-summary-2026-Q2.pdf), credit union counts, net interest income as a share of average assets, ROA and net worth
- [Federal Reserve: Review of the Federal Reserve's Supervision and Regulation of Silicon Valley Bank (April 28, 2023)](https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf), the IRR limit breaches, deposit duration assumptions, removed hedges, the March 2023 outflows and discount window readiness

**Filings**

- [JPMorgan Chase: 4Q25 earnings release narrative](https://www.sec.gov/Archives/edgar/data/19617/000162828026001902/a4q25erfexhibit991narrative.htm), NII and NII excluding Markets, deposit growth, card income and Payments revenue
- [Regions Financial: 4Q25 earnings release](https://s202.q4cdn.com/476346942/files/doc_financials/2025/q4/4Q25-Earnings-Press-Release_For-Website.pdf), NIM, FTE adjustment, deposit costs and mix, fee lines, efficiency ratio, CET1 with and without AOCI

**In practice**

- [Valley National Bancorp Q2 2025 earnings call transcript (The Motley Fool)](https://www.fool.com/earnings/call-transcripts/2025/07/24/valley-vly-q2-2025-earnings-call-transcript), the 51% cumulative total deposit beta and the 51 basis point decline in deposit costs
