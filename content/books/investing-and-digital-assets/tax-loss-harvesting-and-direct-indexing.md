+++
title = "Tax-Loss Harvesting & Direct Indexing"
nav_title = "Tax-Loss Harvesting"
description = "Harvesting logic, wash sales across accounts and spouses, substitute securities, direct indexing and tracking error, lot selection, and the limits of tax alpha."
category = "Investing & Digital Assets Industry"
order = 2532
part = "Wealth and Advice"
tags = ["investing", "tax-loss-harvesting", "direct-indexing", "wash-sales", "tracking-error", "taxes"]
+++

Tax-loss harvesting sells an investment that has fallen below its cost, books the loss for the tax return, and buys something similar enough to keep the portfolio's exposure but different enough that the loss survives the wash sale rule. Done every day across every lot in every taxable account, it is the most marketed feature in automated wealth management. Direct indexing takes the idea further: instead of one index fund, the account owns the index's stocks directly, hundreds of positions each with its own lots, so a down day for some stocks is a harvest even when the index is up.

Both are deferral engines with a compliance problem attached. The loss lowers this year's tax and lowers the replacement's basis by the same amount, so the tax comes back when the replacement is sold, unless it never is. The wash sale rule reaches across every account the customer and their spouse own, including IRAs, where a replacement purchase destroys the loss permanently, and the broker's 1099-B sees almost none of that. And the marketing figure, "tax alpha," is a hypothetical performance number under the adviser marketing rule.

This chapter covers the mechanics as of November 2026: how the platforms harvest, the harvest decision, wash sale avoidance across accounts (worked through with the tax value at stated rates), substitute securities, direct indexing and tracking error (with the intuition worked), lot selection, and the limits of tax alpha. The wash sale rule itself, its basis adjustment and what the broker must report are in [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#wash-sales); the model portfolios being harvested are in [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors#model-portfolios).

## How the Platforms Do It

Published methodologies and terms, as of November 2026:

| Platform | What it harvests | Wash sale protection | What it says about results |
| --- | --- | --- | --- |
| **Betterment** | ETF lots in managed taxable portfolios; a primary, secondary and tertiary ticker per asset class (developed markets: VEA, SCHF, IEFA); harvests when "the benefit, net of cost, exceeds a certain threshold," with cost including trading, execution and the higher cost of owning the replacement | Tertiary tickers keep IRA deposits from washing taxable losses; coordination with a spouse's Betterment account on request; "Parallel Position Management" holds alternates instead of switching back after 30 days | "69% of TLH customers in 2022–2023 saw potential savings exceeding their fees" (company estimate) |
| **Wealthfront** | "Every ETF tax lot in each eligible account every day"; sells a lot below basis and buys the same dollar amount of a "similar but not substantially identical" ETF (US stocks: VTI and ITOT) when the expected benefit outweighs trading and opportunity costs | Holds the alternate "for a minimum of 30 days"; monitors linked spousal accounts and IRAs on request; outside accounts are the client's responsibility | "the median ratio of tax benefit to fee is 4.2x"; an average harvesting yield of 4.00% for risk score 8 accounts across 2012 to 2025 vintages (company figures) |
| **Wealthfront** (direct indexing) | S&P 500 Direct at 0.09% a year, Nasdaq-100 at 0.12%, $5,000 minimum (as of September 10, 2026) | | |
| **Frec** | 26 indices, fees from 0.09% (S&P 500, $5,000 minimum) to 0.35%, minimums $5,000 to $50,000 (Russell 1000 at 0.22% and $20,000) | | A simulated long-only Russell 1000 after-tax excess return of 1.34% over 2005 to 2025 (hypothetical, company figure) |

Three things stand out. **Every platform harvests by a cost-benefit test, not a fixed loss threshold,** and none publishes the threshold, so two engines facing the same loss can decide differently. **Wash sale protection is the hard part and is bounded by what the platform can see:** both Betterment and Wealthfront protect accounts at their own firm, spouses only when linked, and tell clients that outside holdings are their problem. **The results quoted are the firms' own estimates,** mostly simulations, which is what the marketing rule calls hypothetical performance ([The Marketing Rule](/books/investing-and-digital-assets/advice-and-conduct#the-marketing-rule)).

## The Harvest Decision

A harvest is two trades: sell a lot at a loss, buy a replacement with the proceeds. Whether to do it today is an expected-value question with four terms:

- **The tax benefit:** the loss times the rate it will offset, which depends on what else the customer realized this year. Losses offset gains of the same term first, then the other term, then up to $3,000 of ordinary income ($1,500 married filing separately), with the rest carried forward, per Betterment's methodology page.
- **The trading cost:** spreads on both trades (Wealthfront estimates from bid-ask spreads), and any difference in expense ratio while holding the replacement.
- **The opportunity cost:** harvesting now uses up the lot; if the price falls further next week, waiting would have harvested more. Wealthfront names this term explicitly.
- **The deferral cost:** the replacement's basis is lower by the loss, so the gain is taxed later, possibly at a different rate.

A practical engine computes a per-lot score each day and harvests lots whose net benefit clears a threshold expressed in dollars and as a share of the lot. Lots are evaluated, not positions: a position bought in twelve recurring purchases has twelve lots, some at a loss when the position as a whole is up, and selling only the loss lots (specific identification) is how a harvest happens in a rising market ([Lot Relief Methods](/books/investing-and-digital-assets/cost-basis-and-tax-lots#lot-relief-methods)).

## Wash Sales Across Accounts

The wash sale rule disallows a loss if the taxpayer acquires substantially identical securities within 30 days before or after the sale (26 USC 1091, worked in [Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#wash-sales)), and the IRS extends it to purchases by a spouse and to purchases in the taxpayer's IRA or Roth IRA, where the loss is disallowed and the basis is not added to the IRA shares. Betterment's methodology puts the consequence plainly: if the repurchase is in an IRA or 401(k), "the loss is permanently disallowed." The broker reports only same-account, same-CUSIP wash sales on the 1099-B ([What the broker reports, and what it doesn't](/books/investing-and-digital-assets/cost-basis-and-tax-lots#what-the-broker-reports-and-what-it-doesn-t)), so a harvesting engine that relied on the 1099-B logic would produce losses the customer can't use.

The engine's wash sale scope is therefore the customer's household as the firm can see it:

| Account or purchase | Washes the taxable loss? | Effect | What the engine does |
| --- | --- | --- | --- |
| The same taxable account | Yes | Loss disallowed, added to the replacement's basis | Never buys back the sold ticker within 30 days; uses the alternate |
| Another taxable account of the same customer | Yes | Same | Includes it in the window check |
| The customer's IRA or Roth IRA | Yes | Loss permanently disallowed, no basis added | Routes IRA purchases of the class to a ticker not sold at a loss in the window (Betterment's tertiary) |
| A spouse's account | Yes (spouse purchases count) | Same as the customer's own | Includes linked spouses; warns when unlinked |
| Dividend reinvestment, recurring buy, a fee-funding sale's reverse | Yes, purchases are purchases | Partial wash by share count | Scans 30 days both ways, including scheduled purchases |
| An outside account at another firm | Yes | Same | Can't see it; discloses that |

**Worked numbers: a harvest that avoids a wash sale across accounts, with its tax value.** My illustration, with stated rates. A customer and spouse file jointly. The customer's taxable account holds a total US stock market ETF ("fund A"): one lot of 200 shares bought on February 2, 2026 at $300.00, $60,000.00. The customer's IRA buys the same fund every month on the 15th by a recurring plan, and the spouse's taxable account at the same firm holds a different fund. On Monday, November 2, 2026 fund A trades at $270.00.

1. **The candidate:** sell 200 shares at $270.00 = $54,000.00 proceeds, a **$6,000.00 short-term loss** (held under a year).
2. **The window:** October 3 to December 2, 2026 (30 days before and after the sale). The IRA bought fund A on October 15 and is scheduled to buy it again on November 15. The October 15 purchase is inside the window: before the sale it would wash the loss to the extent of the shares bought, permanently, because it's an IRA. Suppose that purchase was 10 shares. Then 10 of the 200 shares' loss, $300.00, is permanently disallowed, and the engine either accepts that or waits.
3. **Avoiding it from here on:** a better engine would have redirected the IRA's recurring purchase to a different ticker for the asset class as soon as the taxable lot went into a loss position, so the October 15 purchase never happened in fund A. Assume it did that: the IRA's purchases of the class went to "fund C," which tracks a different index. The window is then clean on the IRA side.
4. **The replacement:** buy $54,000.00 of "fund B," a total market ETF tracking a different index, in the taxable account. Hold it at least until December 3, 2026 before buying fund A back in any household account, or never switch back.
5. **The spouse:** the engine checks the spouse's linked account for fund A purchases in the window. None.

The tax value at stated rates: the customer has realized $4,000.00 of short-term gains this year and is in the 35% federal bracket (no state tax, no net investment income tax, for simplicity).

| Use of the $6,000 loss | Amount | Rate | Tax saved in 2026 |
| --- | ---: | ---: | ---: |
| Offsets short-term gains | $4,000.00 | 35% | $1,400.00 |
| Offsets ordinary income (up to $3,000) | $2,000.00 | 35% | $700.00 |
| **Total** | **$6,000.00** | | **$2,100.00** |

That is not $2,100 of profit. Fund B's basis is $54,000.00, $6,000.00 less than fund A's was, so when fund B is eventually sold, its gain is $6,000.00 larger. If it's held over a year and sold at the 15% long-term rate, the tax that comes back is $900.00. The harvest's value is the **$1,200.00 rate difference** (35% now versus 15% later) plus the time value of the $2,100 deferred, less trading costs. If fund B is held until death and its basis steps up, or donated to charity, the $900 never comes back. If the customer had instead been in a year with no gains and a 12% bracket, and expected to sell later at 15%, the same harvest would be worth roughly nothing. The engine can't know most of those facts; the plan is a forecast, and the brochure should say so.

## Substitute Securities

"Substantially identical" isn't defined by statute for funds, and the cost basis chapter treats funds tracking the same index as a case-by-case question. Platforms answer it the same way: the replacement tracks **a different index** for the same asset class, highly correlated but not the same basket. Wealthfront publishes its pairs and their correlations, from 85% (TIPS) to above 99%; Betterment gives each asset class a primary, secondary and tertiary ticker. My rules for the substitute table:

- **Different index, different issuer where possible.** Two share classes of the same fund, or two funds from the same sponsor tracking the same index, are the risky pairs.
- **Correlation and tracking measured, not assumed,** and reviewed when a fund changes its index.
- **A third ticker per class** for purchases in tax-advantaged accounts while a taxable loss is in its window, which is how Betterment keeps IRA deposits from washing taxable losses.
- **Switchback is optional.** Betterment holds alternates indefinitely when that's better after tax (Parallel Position Management); Wealthfront holds the alternate at least 30 days. Switching back realizes the alternate's gain if it has risen, so the decision is another harvest-style calculation.

A substitute table is advice: it needs an owner, a review date and a record of when each pair was in force, because a 2026 harvest is judged by the 2026 table.

## Direct Indexing

Direct indexing buys the index's constituents in the account instead of a fund that holds them. A $100,000 S&P 500 account holds 500 stocks (or a sampled few hundred), fractional where needed, each with its own lots. Three things follow:

- **Many more harvests.** Dispersion means some stocks are down even when the index is up; each is a candidate. The harvest yield is highest in the first years, when every lot's basis is near the market.
- **Wash sales on stocks, not funds.** A harvested stock can't be repurchased for 30 days, so the account goes without it and redistributes its weight, or holds a correlated stock in its place. A stock bought in another account of the household, or in an ETF that holds it (generally not substantially identical, a judgment the firm makes), is checked the same way.
- **Customization.** Exclusions (a client's employer stock, a sector), tilts and gifts of appreciated lots are possible with stocks and not with a fund.

**Tracking error** is the cost: the account no longer is the index. Tracking error is the standard deviation of the difference between the account's return and the index's. The intuition, in my own illustration: if the account's holdings differ from the index by small active weights on stocks whose idiosyncratic (non-market) moves are independent, the tracking error is about the square root of the sum of each active weight squared times that stock's idiosyncratic volatility squared.

**Worked numbers: tracking error intuition.** Ten stocks harvested and held out for 31 days, each 0.5% of the index, each with 25% annual idiosyncratic volatility, their weight spread over the rest of the index:

- Each excluded stock contributes 0.5% × 25% = 0.125% of tracking error on its own.
- Ten independent ones combine as √10 × 0.125% = **0.40%** a year.
- In a $100,000 account, a one-standard-deviation year differs from the index by about $400, in either direction.

Compare one concentrated exclusion: a client excludes their employer, a 2% weight with 30% idiosyncratic volatility, for good. That alone is 2% × 30% = **0.60%** a year, more than the ten harvests together, and it lasts. The lessons for the engine: many small deviations diversify; one large one doesn't. A direct indexing optimizer sets a tracking error budget, models each candidate trade's contribution with a risk model, and declines harvests (or picks substitute stocks with high correlation to the excluded one) that would push the account over it. The risk model and budget are parameters to record, and the client sees the realized tracking error in performance reporting against the index ([Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting#benchmarks)).

Platforms price direct indexing at 0.09% (Wealthfront's and Frec's S&P 500) to 0.35% (Frec's narrowest indices), above an S&P 500 ETF's expense ratio, so the harvest has to pay for the difference.

## Lot Selection

Every sale in a taxable managed account chooses lots, and harvesting changes which choice is right:

- **For harvests:** the lots with the largest loss per share, short-term first if the customer has short-term gains to offset (Betterment sells losses first and short-term gains last).
- **For rebalances and withdrawals:** the highest-basis lots, to realize the least gain, with long-term preferred over short-term when both have gains. A tax-minimizing method is a standing election per account ([Lot Relief Methods](/books/investing-and-digital-assets/cost-basis-and-tax-lots#lot-relief-methods)).
- **For fees:** a fee-funding sale is a sale like any other; picking a loss lot for it can wash against a recent purchase, so the engine runs the same window check.
- **Gifts and donations:** the lowest-basis, longest-held lots go to charity, which removes the deferred gain entirely.

The selection must be made, and recorded, at the time of the sale; standing elections live in [`lot_relief_elections`](/books/investing-and-digital-assets/cost-basis-and-tax-lots#how-to-build-it), and each harvest's sale names its lots.

## Tax Alpha and Its Limits

"Tax alpha" is the after-tax return a harvesting program adds, and four facts limit it:

- **It's deferral, mostly.** Each harvested dollar of loss is a dollar of future gain, recaptured at sale unless the lot is donated or steps up at death. The benefit is the rate difference and the time value, as the worked numbers show. Betterment's page states its own version: a dollar of deferred tax is worth $1.63 at 5% growth over ten years.
- **It decays.** After a few years of harvesting in a rising market, most lots sit at gains, and the account locks in: there's little left to harvest, and selling anything realizes gains. Direct indexing accounts that started with cash decay fastest because they harvested most at the start.
- **It depends on the customer.** Gains elsewhere to offset, the bracket now and later, state tax, and whether the customer ever sells all change the answer; a customer in a low bracket may get nothing, and a customer whose spouse or outside accounts buy the same funds may lose losses to wash sales the platform can't see.
- **It's often hypothetical.** A backtested after-tax excess return, like Frec's simulated 1.34%, is hypothetical performance under Rule 206(4)-1(d)(6): an adviser may use it only with policies making it relevant to the audience, with its criteria, assumptions, risks and limitations explained. A figure computed from actual client accounts, like Wealthfront's median benefit-to-fee ratio, is the firm's own performance claim and needs substantiation on demand.

My rule: show each client their own realized harvested losses and the estimated tax value at the rates they gave, labeled as an estimate, next to the fee they paid, and never a model's number as if it were theirs.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `tax_lots`, `lot_closings` and `orders`, with [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots)' `wash_sale_adjustments` and `lot_relief_elections`, and [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors)' `model_allocations` and `rebalance_runs`. This chapter adds the household the wash sale window spans, harvest runs and candidates, the substitute table, and direct index targets.

```sql
CREATE TABLE tax_households (                -- whose purchases can wash whose losses
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  primary_party_id    UUID NOT NULL REFERENCES parties (id),
  spouse_party_id     UUID REFERENCES parties (id),  -- linked only with consent
  filing_status       TEXT,                    -- as the customer gave it: 'mfj', 'mfs', 'single', ...
  marginal_rate_bps   INT,                     -- customer-provided, for estimates only
  state               TEXT,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE household_accounts (            -- every account in the window check
  tax_household_id    UUID NOT NULL REFERENCES tax_households (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  tax_treatment       TEXT NOT NULL CHECK (tax_treatment IN ('taxable', 'ira', 'roth_ira',
                        'employer_plan', 'hsa')),
  PRIMARY KEY (tax_household_id, account_id)
);

CREATE TABLE substitute_securities (         -- the pairs and triples, as in force
  asset_class         TEXT NOT NULL,
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  rank                SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 3),  -- primary, secondary, tertiary
  tracks_index        TEXT NOT NULL,
  correlation_to_primary NUMERIC(5, 4),
  reviewed_by         TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (asset_class, instrument_id, valid_during)
);

CREATE TABLE harvest_runs (                  -- one day's evaluation of one account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  tax_household_id    UUID NOT NULL REFERENCES tax_households (id),
  prices_as_of        TIMESTAMPTZ NOT NULL,
  threshold_policy    TEXT NOT NULL,           -- the cost-benefit policy version
  status              TEXT NOT NULL CHECK (status IN ('evaluated', 'harvested', 'none',
                        'blocked')),
  rebalance_run_id    UUID REFERENCES rebalance_runs (id),  -- when combined with a rebalance
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE harvest_candidates (            -- each lot considered, and why it was or wasn't sold
  harvest_run_id      UUID NOT NULL REFERENCES harvest_runs (id),
  tax_lot_id          UUID NOT NULL REFERENCES tax_lots (id),
  unrealized_loss     BIGINT NOT NULL,         -- minor units, negative
  term                TEXT NOT NULL CHECK (term IN ('short', 'long')),
  est_tax_benefit     BIGINT NOT NULL,
  est_trading_cost    BIGINT NOT NULL,
  window_conflicts    JSONB NOT NULL DEFAULT '[]',  -- household purchases within 30 days, either side
  decision            TEXT NOT NULL CHECK (decision IN ('harvest', 'below_threshold',
                        'wash_conflict', 'tracking_budget', 'restricted')),
  replacement_instrument_id UUID REFERENCES instruments (id),
  sell_order_id       UUID REFERENCES orders (id),
  buy_order_id        UUID REFERENCES orders (id),
  PRIMARY KEY (harvest_run_id, tax_lot_id)
);

CREATE TABLE purchase_blocks (               -- tickers no household account may buy until a date
  tax_household_id    UUID NOT NULL REFERENCES tax_households (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  source_closing_id   UUID NOT NULL REFERENCES lot_closings (id),  -- the harvested loss
  blocked_through     DATE NOT NULL,           -- sale date + 30 days
  PRIMARY KEY (tax_household_id, instrument_id, source_closing_id)
);

CREATE TABLE index_targets (                 -- direct indexing: the index weights the account tracks
  account_id          UUID NOT NULL REFERENCES accounts (id),
  index_code          TEXT NOT NULL,           -- 'sp500', 'nasdaq100', ...
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  index_weight_bps    NUMERIC(10, 4) NOT NULL,
  target_weight_bps   NUMERIC(10, 4) NOT NULL, -- after exclusions, blocks and tilts
  reason              TEXT,                    -- 'excluded_by_client', 'wash_block', 'tilt', ...
  tracking_budget_bps INT NOT NULL,            -- the ex-ante limit the optimizer honors
  as_of               DATE NOT NULL,
  PRIMARY KEY (account_id, instrument_id, as_of)
);
```

How it runs:

1. **Daily, after prices,** evaluate every loss lot in each taxable managed account; for each, compute benefit and cost and list household purchases (made and scheduled) within 30 days either side.
2. **Harvest** lots that clear the policy and have no wash conflict: sell with specific identification of the lot, buy the next-ranked substitute, write a `purchase_blocks` row through the sale date plus 30 days.
3. **Every order in the household checks `purchase_blocks`** first: recurring plans, dividend reinvestment, rebalances and IRA contributions route to the next substitute while a block is open.
4. **For direct indexing,** recompute `index_targets` with the blocked stocks at zero and their weight redistributed, run the optimizer under the tracking budget, and record declined harvests as `tracking_budget`.
5. **Report** realized harvested losses per account and the estimate of their value at the customer's stated rates, labeled as an estimate.

Design notes:

- **The block lives on the household, not the account,** because the rule does; a spouse joins only with consent, and the system says when one isn't linked.
- **Scheduled purchases count.** A recurring buy next week is a purchase within the window; the check reads plans as well as fills.
- **Declined candidates are kept with their reason,** so the firm can show why it didn't harvest a loss a client asks about.
- **Estimates stay out of the books.** Tax benefit estimates are advice and marketing inputs; the 1099-B comes only from `lot_closings` and the broker's reporting rules.

## Auditing

Harvesting is examined as advice (did it do what the brochure says), as marketing (are the claims substantiated) and as tax reporting (are the forms right). Keep:

- **Every harvest run and candidate** with the decision, the window conflicts and the policy version.
- **Every purchase block** and every order rerouted by one.
- **The substitute table by date,** with correlations and who approved each pair.
- **Direct indexing targets, exclusions and tracking budgets** by date, and realized tracking error.
- **The calculation behind every tax alpha claim** in advertising, actual or hypothetical, with its assumptions.

## What This Means for the System You Build

- **Harvest lots, not positions,** by a recorded cost-benefit policy.
- **Check wash sales across the household,** including IRAs, linked spouses and scheduled purchases, not just the 1099-B's same-account rule.
- **Keep a third ticker for tax-advantaged purchases** while a taxable loss is in its window.
- **Version the substitute table** and choose pairs that track different indexes.
- **Give direct indexing a tracking error budget** and record harvests it declines.
- **Value a harvest as deferral,** with the rate difference and the customer's own facts, and label every estimate.
- **Treat tax alpha in marketing as hypothetical performance** unless it comes from actual accounts with its calculation kept.

## References

**Law and regulation**

- [17 CFR 275.206(4)-1: Investment adviser marketing](https://www.law.cornell.edu/cfr/text/17/275.206(4)-1), hypothetical performance conditions in (d)(6) and the substantiation requirement in (a)(2)

**Vendor documentation**

- [Betterment: Tax-loss harvesting methodology (updated August 4, 2026)](https://www.betterment.com/resources/tax-loss-harvesting-methodology), primary, secondary and tertiary tickers, the cost-benefit threshold, IRA and spouse wash sales, Parallel Position Management, the $3,000 ordinary income offset, the 69% estimate and the $1.63 deferral figure
- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), harvesting prioritized ahead of rebalancing
- [Wealthfront: Tax-loss harvesting white paper (April 27, 2026)](https://research.wealthfront.com/whitepapers/tax-loss-harvesting/), daily lot evaluation, trading and opportunity costs, the 30-day hold, spousal and IRA monitoring, pairs and correlations, the 4.2x median and the 4.00% average harvesting yield
- [Wealthfront: Direct indexing](https://www.wealthfront.com/direct-indexing), S&P 500 Direct at 0.09%, Nasdaq-100 at 0.12% and the $5,000 minimum as of September 10, 2026
- [Frec: Pricing](https://frec.com/pricing), 26 indices with fees and minimums
- [Frec: Direct indexing](https://frec.com/), the simulated 1.34% after-tax excess return and its period
